(function() {
  var _, atomConfig, cheerio, config, currentText, findFileRecursive, fs, getArguments, getMathJaxPath, handleError, handleMath, handleResponse, handleSuccess, path, pdc, removeReferences, renderPandoc, setPandocOptions;

  pdc = require('pdc');

  _ = require('underscore-plus');

  cheerio = null;

  fs = null;

  path = null;

  currentText = null;

  atomConfig = null;

  config = {};


  /**
   * Sets local mathjaxPath if available
   */

  getMathJaxPath = function() {
    var e;
    try {
      return config.mathjax = require.resolve('MathJax');
    } catch (error1) {
      e = error1;
      return config.mathjax = '';
    }
  };

  findFileRecursive = function(filePath, fileName) {
    var bibFile, newPath;
    if (fs == null) {
      fs = require('fs');
    }
    if (path == null) {
      path = require('path');
    }
    bibFile = path.join(filePath, '../', fileName);
    if (fs.existsSync(bibFile)) {
      return bibFile;
    } else {
      newPath = path.join(bibFile, '..');
      if (newPath !== filePath && !_.contains(atom.project.getPaths(), newPath)) {
        return findFileRecursive(newPath, fileName);
      } else {
        return false;
      }
    }
  };


  /**
   * Sets local variables needed for everything
   * @param {string} path to markdown file
   *
   */

  setPandocOptions = function(filePath) {
    var bibFile, cslFile;
    atomConfig = atom.config.get('markdown-preview-plus');
    pdc.path = atomConfig.pandocPath;
    config.flavor = atomConfig.pandocMarkdownFlavor;
    config.args = {};
    config.opts = {};
    if (path == null) {
      path = require('path');
    }
    if (filePath != null) {
      config.opts.cwd = path.dirname(filePath);
    }
    if (config.mathjax == null) {
      getMathJaxPath();
    }
    config.args.mathjax = config.renderMath ? config.mathjax : void 0;
    if (atomConfig.pandocBibliography) {
      config.args.filter = ['pandoc-citeproc'];
      bibFile = findFileRecursive(filePath, atomConfig.pandocBIBFile);
      if (!bibFile) {
        bibFile = atomConfig.pandocBIBFileFallback;
      }
      config.args.bibliography = bibFile ? bibFile : void 0;
      cslFile = findFileRecursive(filePath, atomConfig.pandocCSLFile);
      if (!cslFile) {
        cslFile = atomConfig.pandocCSLFileFallback;
      }
      config.args.csl = cslFile ? cslFile : void 0;
    }
    return config;
  };


  /**
   * Handle error response from pdc
   * @param {error} Returned error
   * @param {string} Returned HTML
   * @return {array} with Arguments for callbackFunction (error set to null)
   */

  handleError = function(error, html) {
    var isOnlyMissingReferences, message, referenceSearch;
    referenceSearch = /pandoc-citeproc: reference ([\S]+) not found(<br>)?/ig;
    message = _.uniq(error.message.split('\n')).join('<br>');
    html = "<h1>Pandoc Error:</h1><p><b>" + message + "</b></p><hr>";
    isOnlyMissingReferences = message.replace(referenceSearch, '').length === 0;
    if (isOnlyMissingReferences) {
      message.match(referenceSearch).forEach(function(match) {
        var r;
        match = match.replace(referenceSearch, '$1');
        r = new RegExp("@" + match, 'gi');
        return currentText = currentText.replace(r, "&#64;" + match);
      });
      currentText = html + currentText;
      pdc(currentText, config.flavor, 'html', getArguments(config.args), config.opts, handleResponse);
    }
    return [null, html];
  };


  /**
   * Adjusts all math environments in HTML
   * @param {string} HTML to be adjusted
   * @return {string} HTML with adjusted math environments
   */

  handleMath = function(html) {
    var o;
    if (cheerio == null) {
      cheerio = require('cheerio');
    }
    o = cheerio.load("<div>" + html + "</div>");
    o('.math').each(function(i, elem) {
      var math, mode, newContent;
      math = cheerio(this).text();
      mode = math.indexOf('\\[') > -1 ? '; mode=display' : '';
      math = math.replace(/\\[[()\]]/g, '');
      newContent = '<span class="math">' + ("<script type='math/tex" + mode + "'>" + math + "</script>") + '</span>';
      return cheerio(this).replaceWith(newContent);
    });
    return o('div').html();
  };

  removeReferences = function(html) {
    var o;
    if (cheerio == null) {
      cheerio = require('cheerio');
    }
    o = cheerio.load("<div>" + html + "</div>");
    o('.references').each(function(i, elem) {
      return cheerio(this).remove();
    });
    return o('div').html();
  };


  /**
   * Handle successful response from pdc
   * @param {string} Returned HTML
   * @return {array} with Arguments for callbackFunction (error set to null)
   */

  handleSuccess = function(html) {
    if (config.renderMath) {
      html = handleMath(html);
    }
    if (atomConfig.pandocRemoveReferences) {
      html = removeReferences(html);
    }
    return [null, html];
  };


  /**
   * Handle response from pdc
   * @param {Object} error if thrown
   * @param {string} Returned HTML
   */

  handleResponse = function(error, html) {
    var array;
    array = error != null ? handleError(error, html) : handleSuccess(html);
    return config.callback.apply(config.callback, array);
  };


  /**
   * Renders markdown with pandoc
   * @param {string} document in markdown
   * @param {boolean} whether to render the math with mathjax
   * @param {function} callbackFunction
   */

  renderPandoc = function(text, filePath, renderMath, cb) {
    currentText = text;
    config.renderMath = renderMath;
    config.callback = cb;
    setPandocOptions(filePath);
    return pdc(text, config.flavor, 'html', getArguments(config.args), config.opts, handleResponse);
  };

  getArguments = function(args) {
    args = _.reduce(args, function(res, val, key) {
      if (!_.isEmpty(val)) {
        val = _.flatten([val]);
        _.forEach(val, function(v) {
          if (!_.isEmpty(v)) {
            return res.push("--" + key + "=" + v);
          }
        });
      }
      return res;
    }, []);
    args = _.union(args, atom.config.get('markdown-preview-plus.pandocArguments'));
    args = _.map(args, function(val) {
      val = val.replace(/^(--[\w\-]+)\s(.+)$/i, "$1=$2");
      if (val.substr(0, 1) !== '-') {
        return void 0;
      } else {
        return val;
      }
    });
    return _.reject(args, _.isEmpty);
  };

  module.exports = {
    renderPandoc: renderPandoc,
    __testing__: {
      findFileRecursive: findFileRecursive,
      setPandocOptions: setPandocOptions,
      getArguments: getArguments
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9wYW5kb2MtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osT0FBQSxHQUFVOztFQUNWLEVBQUEsR0FBSzs7RUFDTCxJQUFBLEdBQU87O0VBR1AsV0FBQSxHQUFjOztFQUVkLFVBQUEsR0FBYTs7RUFFYixNQUFBLEdBQVM7OztBQUVUOzs7O0VBR0EsY0FBQSxHQUFpQixTQUFBO0FBQ2YsUUFBQTtBQUFBO2FBQ0UsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBaEIsRUFEbkI7S0FBQSxjQUFBO01BRU07YUFDSixNQUFNLENBQUMsT0FBUCxHQUFpQixHQUhuQjs7RUFEZTs7RUFNakIsaUJBQUEsR0FBb0IsU0FBQyxRQUFELEVBQVcsUUFBWDtBQUNsQixRQUFBOztNQUFBLEtBQU0sT0FBQSxDQUFRLElBQVI7OztNQUNOLE9BQVEsT0FBQSxDQUFRLE1BQVI7O0lBQ1IsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFvQixLQUFwQixFQUEyQixRQUEzQjtJQUNWLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFkLENBQUg7YUFDRSxRQURGO0tBQUEsTUFBQTtNQUdFLE9BQUEsR0FBVSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsSUFBbkI7TUFDVixJQUFHLE9BQUEsS0FBYSxRQUFiLElBQTBCLENBQUksQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUFYLEVBQW9DLE9BQXBDLENBQWpDO2VBQ0UsaUJBQUEsQ0FBa0IsT0FBbEIsRUFBMkIsUUFBM0IsRUFERjtPQUFBLE1BQUE7ZUFHRSxNQUhGO09BSkY7O0VBSmtCOzs7QUFhcEI7Ozs7OztFQUtBLGdCQUFBLEdBQW1CLFNBQUMsUUFBRDtBQUNqQixRQUFBO0lBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEI7SUFDYixHQUFHLENBQUMsSUFBSixHQUFXLFVBQVUsQ0FBQztJQUN0QixNQUFNLENBQUMsTUFBUCxHQUFnQixVQUFVLENBQUM7SUFDM0IsTUFBTSxDQUFDLElBQVAsR0FBYztJQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7O01BQ2QsT0FBUSxPQUFBLENBQVEsTUFBUjs7SUFDUixJQUE0QyxnQkFBNUM7TUFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQVosR0FBa0IsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLEVBQWxCOztJQUNBLElBQXdCLHNCQUF4QjtNQUFBLGNBQUEsQ0FBQSxFQUFBOztJQUNBLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBWixHQUF5QixNQUFNLENBQUMsVUFBVixHQUEwQixNQUFNLENBQUMsT0FBakMsR0FBOEM7SUFDcEUsSUFBRyxVQUFVLENBQUMsa0JBQWQ7TUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQVosR0FBcUIsQ0FBQyxpQkFBRDtNQUNyQixPQUFBLEdBQVUsaUJBQUEsQ0FBa0IsUUFBbEIsRUFBNEIsVUFBVSxDQUFDLGFBQXZDO01BQ1YsSUFBQSxDQUFrRCxPQUFsRDtRQUFBLE9BQUEsR0FBVSxVQUFVLENBQUMsc0JBQXJCOztNQUNBLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWixHQUE4QixPQUFILEdBQWdCLE9BQWhCLEdBQTZCO01BQ3hELE9BQUEsR0FBVSxpQkFBQSxDQUFrQixRQUFsQixFQUE0QixVQUFVLENBQUMsYUFBdkM7TUFDVixJQUFBLENBQWtELE9BQWxEO1FBQUEsT0FBQSxHQUFVLFVBQVUsQ0FBQyxzQkFBckI7O01BQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFaLEdBQXFCLE9BQUgsR0FBZ0IsT0FBaEIsR0FBNkIsT0FQakQ7O1dBUUE7RUFsQmlCOzs7QUFvQm5COzs7Ozs7O0VBTUEsV0FBQSxHQUFjLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFDWixRQUFBO0lBQUEsZUFBQSxHQUFrQjtJQUNsQixPQUFBLEdBQ0UsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQWQsQ0FBb0IsSUFBcEIsQ0FBUCxDQUNBLENBQUMsSUFERCxDQUNNLE1BRE47SUFFRixJQUFBLEdBQU8sOEJBQUEsR0FBK0IsT0FBL0IsR0FBdUM7SUFDOUMsdUJBQUEsR0FDRSxPQUFPLENBQUMsT0FBUixDQUFnQixlQUFoQixFQUFpQyxFQUFqQyxDQUNBLENBQUMsTUFERCxLQUNXO0lBQ2IsSUFBRyx1QkFBSDtNQUNFLE9BQU8sQ0FBQyxLQUFSLENBQWMsZUFBZCxDQUNBLENBQUMsT0FERCxDQUNTLFNBQUMsS0FBRDtBQUNQLFlBQUE7UUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxlQUFkLEVBQStCLElBQS9CO1FBQ1IsQ0FBQSxHQUFRLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBSSxLQUFYLEVBQW9CLElBQXBCO2VBQ1IsV0FBQSxHQUFjLFdBQVcsQ0FBQyxPQUFaLENBQW9CLENBQXBCLEVBQXVCLE9BQUEsR0FBUSxLQUEvQjtNQUhQLENBRFQ7TUFLQSxXQUFBLEdBQWMsSUFBQSxHQUFPO01BQ3JCLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLE1BQU0sQ0FBQyxNQUF4QixFQUFnQyxNQUFoQyxFQUF3QyxZQUFBLENBQWEsTUFBTSxDQUFDLElBQXBCLENBQXhDLEVBQW1FLE1BQU0sQ0FBQyxJQUExRSxFQUFnRixjQUFoRixFQVBGOztXQVFBLENBQUMsSUFBRCxFQUFPLElBQVA7RUFqQlk7OztBQW1CZDs7Ozs7O0VBS0EsVUFBQSxHQUFhLFNBQUMsSUFBRDtBQUNYLFFBQUE7O01BQUEsVUFBVyxPQUFBLENBQVEsU0FBUjs7SUFDWCxDQUFBLEdBQUksT0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFBLEdBQVEsSUFBUixHQUFhLFFBQTFCO0lBQ0osQ0FBQSxDQUFFLE9BQUYsQ0FBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQyxDQUFELEVBQUksSUFBSjtBQUNkLFVBQUE7TUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLElBQVIsQ0FBYSxDQUFDLElBQWQsQ0FBQTtNQUVQLElBQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsQ0FBQSxHQUFzQixDQUFDLENBQTFCLEdBQWtDLGdCQUFsQyxHQUF3RDtNQUcvRCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxZQUFiLEVBQTJCLEVBQTNCO01BQ1AsVUFBQSxHQUNFLHFCQUFBLEdBQ0EsQ0FBQSx3QkFBQSxHQUF5QixJQUF6QixHQUE4QixJQUE5QixHQUFrQyxJQUFsQyxHQUF1QyxXQUF2QyxDQURBLEdBRUE7YUFFRixPQUFBLENBQVEsSUFBUixDQUFhLENBQUMsV0FBZCxDQUEwQixVQUExQjtJQVpjLENBQWhCO1dBY0EsQ0FBQSxDQUFFLEtBQUYsQ0FBUSxDQUFDLElBQVQsQ0FBQTtFQWpCVzs7RUFtQmIsZ0JBQUEsR0FBbUIsU0FBQyxJQUFEO0FBQ2pCLFFBQUE7O01BQUEsVUFBVyxPQUFBLENBQVEsU0FBUjs7SUFDWCxDQUFBLEdBQUksT0FBTyxDQUFDLElBQVIsQ0FBYSxPQUFBLEdBQVEsSUFBUixHQUFhLFFBQTFCO0lBQ0osQ0FBQSxDQUFFLGFBQUYsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixTQUFDLENBQUQsRUFBSSxJQUFKO2FBQ3BCLE9BQUEsQ0FBUSxJQUFSLENBQWEsQ0FBQyxNQUFkLENBQUE7SUFEb0IsQ0FBdEI7V0FFQSxDQUFBLENBQUUsS0FBRixDQUFRLENBQUMsSUFBVCxDQUFBO0VBTGlCOzs7QUFPbkI7Ozs7OztFQUtBLGFBQUEsR0FBZ0IsU0FBQyxJQUFEO0lBQ2QsSUFBMEIsTUFBTSxDQUFDLFVBQWpDO01BQUEsSUFBQSxHQUFPLFVBQUEsQ0FBVyxJQUFYLEVBQVA7O0lBQ0EsSUFBZ0MsVUFBVSxDQUFDLHNCQUEzQztNQUFBLElBQUEsR0FBTyxnQkFBQSxDQUFpQixJQUFqQixFQUFQOztXQUNBLENBQUMsSUFBRCxFQUFPLElBQVA7RUFIYzs7O0FBS2hCOzs7Ozs7RUFLQSxjQUFBLEdBQWlCLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFDZixRQUFBO0lBQUEsS0FBQSxHQUFXLGFBQUgsR0FBZSxXQUFBLENBQVksS0FBWixFQUFtQixJQUFuQixDQUFmLEdBQTRDLGFBQUEsQ0FBYyxJQUFkO1dBQ3BELE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBaEIsQ0FBc0IsTUFBTSxDQUFDLFFBQTdCLEVBQXVDLEtBQXZDO0VBRmU7OztBQUlqQjs7Ozs7OztFQU1BLFlBQUEsR0FBZSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLFVBQWpCLEVBQTZCLEVBQTdCO0lBQ2IsV0FBQSxHQUFjO0lBQ2QsTUFBTSxDQUFDLFVBQVAsR0FBb0I7SUFDcEIsTUFBTSxDQUFDLFFBQVAsR0FBa0I7SUFDbEIsZ0JBQUEsQ0FBaUIsUUFBakI7V0FDQSxHQUFBLENBQUksSUFBSixFQUFVLE1BQU0sQ0FBQyxNQUFqQixFQUF5QixNQUF6QixFQUFpQyxZQUFBLENBQWEsTUFBTSxDQUFDLElBQXBCLENBQWpDLEVBQTRELE1BQU0sQ0FBQyxJQUFuRSxFQUF5RSxjQUF6RTtFQUxhOztFQU9mLFlBQUEsR0FBZSxTQUFDLElBQUQ7SUFDYixJQUFBLEdBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQ0wsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVg7TUFDRSxJQUFBLENBQU8sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxHQUFWLENBQVA7UUFDRSxHQUFBLEdBQU0sQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFDLEdBQUQsQ0FBVjtRQUNOLENBQUMsQ0FBQyxPQUFGLENBQVUsR0FBVixFQUFlLFNBQUMsQ0FBRDtVQUNiLElBQUEsQ0FBZ0MsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFWLENBQWhDO21CQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsSUFBQSxHQUFLLEdBQUwsR0FBUyxHQUFULEdBQVksQ0FBckIsRUFBQTs7UUFEYSxDQUFmLEVBRkY7O0FBSUEsYUFBTztJQUxULENBREssRUFPSCxFQVBHO0lBUVAsSUFBQSxHQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBUixFQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1Q0FBaEIsQ0FBZDtJQUNQLElBQUEsR0FBTyxDQUFDLENBQUMsR0FBRixDQUFNLElBQU4sRUFDTCxTQUFDLEdBQUQ7TUFDRSxHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxzQkFBWixFQUFvQyxPQUFwQztNQUNOLElBQUcsR0FBRyxDQUFDLE1BQUosQ0FBVyxDQUFYLEVBQWMsQ0FBZCxDQUFBLEtBQXNCLEdBQXpCO2VBQWtDLE9BQWxDO09BQUEsTUFBQTtlQUFpRCxJQUFqRDs7SUFGRixDQURLO1dBSVAsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQWUsQ0FBQyxDQUFDLE9BQWpCO0VBZGE7O0VBZ0JmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxZQUFBLEVBQWMsWUFBZDtJQUNBLFdBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQW1CLGlCQUFuQjtNQUNBLGdCQUFBLEVBQWtCLGdCQURsQjtNQUVBLFlBQUEsRUFBYyxZQUZkO0tBRkY7O0FBcktGIiwic291cmNlc0NvbnRlbnQiOlsicGRjID0gcmVxdWlyZSAncGRjJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbmNoZWVyaW8gPSBudWxsXG5mcyA9IG51bGxcbnBhdGggPSBudWxsXG5cbiMgQ3VycmVudCBtYXJrZG93biB0ZXh0XG5jdXJyZW50VGV4dCA9IG51bGxcblxuYXRvbUNvbmZpZyA9IG51bGxcblxuY29uZmlnID0ge31cblxuIyMjKlxuICogU2V0cyBsb2NhbCBtYXRoamF4UGF0aCBpZiBhdmFpbGFibGVcbiAjIyNcbmdldE1hdGhKYXhQYXRoID0gLT5cbiAgdHJ5XG4gICAgY29uZmlnLm1hdGhqYXggPSByZXF1aXJlLnJlc29sdmUgJ01hdGhKYXgnXG4gIGNhdGNoIGVcbiAgICBjb25maWcubWF0aGpheCA9ICcnXG5cbmZpbmRGaWxlUmVjdXJzaXZlID0gKGZpbGVQYXRoLCBmaWxlTmFtZSkgLT5cbiAgZnMgPz0gcmVxdWlyZSAnZnMnXG4gIHBhdGggPz0gcmVxdWlyZSAncGF0aCdcbiAgYmliRmlsZSA9IHBhdGguam9pbiBmaWxlUGF0aCwgJy4uLycsIGZpbGVOYW1lXG4gIGlmIGZzLmV4aXN0c1N5bmMgYmliRmlsZVxuICAgIGJpYkZpbGVcbiAgZWxzZVxuICAgIG5ld1BhdGggPSBwYXRoLmpvaW4gYmliRmlsZSwgJy4uJ1xuICAgIGlmIG5ld1BhdGggaXNudCBmaWxlUGF0aCBhbmQgbm90IF8uY29udGFpbnMoYXRvbS5wcm9qZWN0LmdldFBhdGhzKCksIG5ld1BhdGgpXG4gICAgICBmaW5kRmlsZVJlY3Vyc2l2ZSBuZXdQYXRoLCBmaWxlTmFtZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiMjIypcbiAqIFNldHMgbG9jYWwgdmFyaWFibGVzIG5lZWRlZCBmb3IgZXZlcnl0aGluZ1xuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggdG8gbWFya2Rvd24gZmlsZVxuICpcbiAjIyNcbnNldFBhbmRvY09wdGlvbnMgPSAoZmlsZVBhdGgpIC0+XG4gIGF0b21Db25maWcgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cycpXG4gIHBkYy5wYXRoID0gYXRvbUNvbmZpZy5wYW5kb2NQYXRoXG4gIGNvbmZpZy5mbGF2b3IgPSBhdG9tQ29uZmlnLnBhbmRvY01hcmtkb3duRmxhdm9yXG4gIGNvbmZpZy5hcmdzID0ge31cbiAgY29uZmlnLm9wdHMgPSB7fVxuICBwYXRoID89IHJlcXVpcmUgJ3BhdGgnXG4gIGNvbmZpZy5vcHRzLmN3ZCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCkgaWYgZmlsZVBhdGg/XG4gIGdldE1hdGhKYXhQYXRoKCkgdW5sZXNzIGNvbmZpZy5tYXRoamF4P1xuICBjb25maWcuYXJncy5tYXRoamF4ID0gaWYgY29uZmlnLnJlbmRlck1hdGggdGhlbiBjb25maWcubWF0aGpheCBlbHNlIHVuZGVmaW5lZFxuICBpZiBhdG9tQ29uZmlnLnBhbmRvY0JpYmxpb2dyYXBoeVxuICAgIGNvbmZpZy5hcmdzLmZpbHRlciA9IFsncGFuZG9jLWNpdGVwcm9jJ11cbiAgICBiaWJGaWxlID0gZmluZEZpbGVSZWN1cnNpdmUgZmlsZVBhdGgsIGF0b21Db25maWcucGFuZG9jQklCRmlsZVxuICAgIGJpYkZpbGUgPSBhdG9tQ29uZmlnLnBhbmRvY0JJQkZpbGVGYWxsYmFjayB1bmxlc3MgYmliRmlsZVxuICAgIGNvbmZpZy5hcmdzLmJpYmxpb2dyYXBoeSA9IGlmIGJpYkZpbGUgdGhlbiBiaWJGaWxlIGVsc2UgdW5kZWZpbmVkXG4gICAgY3NsRmlsZSA9IGZpbmRGaWxlUmVjdXJzaXZlIGZpbGVQYXRoLCBhdG9tQ29uZmlnLnBhbmRvY0NTTEZpbGVcbiAgICBjc2xGaWxlID0gYXRvbUNvbmZpZy5wYW5kb2NDU0xGaWxlRmFsbGJhY2sgdW5sZXNzIGNzbEZpbGVcbiAgICBjb25maWcuYXJncy5jc2wgPSBpZiBjc2xGaWxlIHRoZW4gY3NsRmlsZSBlbHNlIHVuZGVmaW5lZFxuICBjb25maWdcblxuIyMjKlxuICogSGFuZGxlIGVycm9yIHJlc3BvbnNlIGZyb20gcGRjXG4gKiBAcGFyYW0ge2Vycm9yfSBSZXR1cm5lZCBlcnJvclxuICogQHBhcmFtIHtzdHJpbmd9IFJldHVybmVkIEhUTUxcbiAqIEByZXR1cm4ge2FycmF5fSB3aXRoIEFyZ3VtZW50cyBmb3IgY2FsbGJhY2tGdW5jdGlvbiAoZXJyb3Igc2V0IHRvIG51bGwpXG4gIyMjXG5oYW5kbGVFcnJvciA9IChlcnJvciwgaHRtbCkgLT5cbiAgcmVmZXJlbmNlU2VhcmNoID0gL3BhbmRvYy1jaXRlcHJvYzogcmVmZXJlbmNlIChbXFxTXSspIG5vdCBmb3VuZCg8YnI+KT8vaWdcbiAgbWVzc2FnZSA9XG4gICAgXy51bmlxIGVycm9yLm1lc3NhZ2Uuc3BsaXQgJ1xcbidcbiAgICAuam9pbignPGJyPicpXG4gIGh0bWwgPSBcIjxoMT5QYW5kb2MgRXJyb3I6PC9oMT48cD48Yj4je21lc3NhZ2V9PC9iPjwvcD48aHI+XCJcbiAgaXNPbmx5TWlzc2luZ1JlZmVyZW5jZXMgPVxuICAgIG1lc3NhZ2UucmVwbGFjZSByZWZlcmVuY2VTZWFyY2gsICcnXG4gICAgLmxlbmd0aCBpcyAwXG4gIGlmIGlzT25seU1pc3NpbmdSZWZlcmVuY2VzXG4gICAgbWVzc2FnZS5tYXRjaCByZWZlcmVuY2VTZWFyY2hcbiAgICAuZm9yRWFjaCAobWF0Y2gpIC0+XG4gICAgICBtYXRjaCA9IG1hdGNoLnJlcGxhY2UgcmVmZXJlbmNlU2VhcmNoLCAnJDEnXG4gICAgICByID0gbmV3IFJlZ0V4cCBcIkAje21hdGNofVwiLCAnZ2knXG4gICAgICBjdXJyZW50VGV4dCA9IGN1cnJlbnRUZXh0LnJlcGxhY2UociwgXCImIzY0OyN7bWF0Y2h9XCIpXG4gICAgY3VycmVudFRleHQgPSBodG1sICsgY3VycmVudFRleHRcbiAgICBwZGMgY3VycmVudFRleHQsIGNvbmZpZy5mbGF2b3IsICdodG1sJywgZ2V0QXJndW1lbnRzKGNvbmZpZy5hcmdzKSwgY29uZmlnLm9wdHMsIGhhbmRsZVJlc3BvbnNlXG4gIFtudWxsLCBodG1sXVxuXG4jIyMqXG4gKiBBZGp1c3RzIGFsbCBtYXRoIGVudmlyb25tZW50cyBpbiBIVE1MXG4gKiBAcGFyYW0ge3N0cmluZ30gSFRNTCB0byBiZSBhZGp1c3RlZFxuICogQHJldHVybiB7c3RyaW5nfSBIVE1MIHdpdGggYWRqdXN0ZWQgbWF0aCBlbnZpcm9ubWVudHNcbiAjIyNcbmhhbmRsZU1hdGggPSAoaHRtbCkgLT5cbiAgY2hlZXJpbyA/PSByZXF1aXJlICdjaGVlcmlvJ1xuICBvID0gY2hlZXJpby5sb2FkKFwiPGRpdj4je2h0bWx9PC9kaXY+XCIpXG4gIG8oJy5tYXRoJykuZWFjaCAoaSwgZWxlbSkgLT5cbiAgICBtYXRoID0gY2hlZXJpbyh0aGlzKS50ZXh0KClcbiAgICAjIFNldCBtb2RlIGlmIGl0IGlzIGJsb2NrIG1hdGhcbiAgICBtb2RlID0gaWYgbWF0aC5pbmRleE9mKCdcXFxcWycpID4gLTEgIHRoZW4gJzsgbW9kZT1kaXNwbGF5JyBlbHNlICcnXG5cbiAgICAjIFJlbW92ZSBzb3Vycm91bmRpbmcgXFxbIFxcXSBhbmQgXFwoIFxcKVxuICAgIG1hdGggPSBtYXRoLnJlcGxhY2UoL1xcXFxbWygpXFxdXS9nLCAnJylcbiAgICBuZXdDb250ZW50ID1cbiAgICAgICc8c3BhbiBjbGFzcz1cIm1hdGhcIj4nICtcbiAgICAgIFwiPHNjcmlwdCB0eXBlPSdtYXRoL3RleCN7bW9kZX0nPiN7bWF0aH08L3NjcmlwdD5cIiArXG4gICAgICAnPC9zcGFuPidcblxuICAgIGNoZWVyaW8odGhpcykucmVwbGFjZVdpdGggbmV3Q29udGVudFxuXG4gIG8oJ2RpdicpLmh0bWwoKVxuXG5yZW1vdmVSZWZlcmVuY2VzID0gKGh0bWwpIC0+XG4gIGNoZWVyaW8gPz0gcmVxdWlyZSAnY2hlZXJpbydcbiAgbyA9IGNoZWVyaW8ubG9hZChcIjxkaXY+I3todG1sfTwvZGl2PlwiKVxuICBvKCcucmVmZXJlbmNlcycpLmVhY2ggKGksIGVsZW0pIC0+XG4gICAgY2hlZXJpbyh0aGlzKS5yZW1vdmUoKVxuICBvKCdkaXYnKS5odG1sKClcblxuIyMjKlxuICogSGFuZGxlIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgZnJvbSBwZGNcbiAqIEBwYXJhbSB7c3RyaW5nfSBSZXR1cm5lZCBIVE1MXG4gKiBAcmV0dXJuIHthcnJheX0gd2l0aCBBcmd1bWVudHMgZm9yIGNhbGxiYWNrRnVuY3Rpb24gKGVycm9yIHNldCB0byBudWxsKVxuICMjI1xuaGFuZGxlU3VjY2VzcyA9IChodG1sKSAtPlxuICBodG1sID0gaGFuZGxlTWF0aCBodG1sIGlmIGNvbmZpZy5yZW5kZXJNYXRoXG4gIGh0bWwgPSByZW1vdmVSZWZlcmVuY2VzIGh0bWwgaWYgYXRvbUNvbmZpZy5wYW5kb2NSZW1vdmVSZWZlcmVuY2VzXG4gIFtudWxsLCBodG1sXVxuXG4jIyMqXG4gKiBIYW5kbGUgcmVzcG9uc2UgZnJvbSBwZGNcbiAqIEBwYXJhbSB7T2JqZWN0fSBlcnJvciBpZiB0aHJvd25cbiAqIEBwYXJhbSB7c3RyaW5nfSBSZXR1cm5lZCBIVE1MXG4gIyMjXG5oYW5kbGVSZXNwb25zZSA9IChlcnJvciwgaHRtbCkgLT5cbiAgYXJyYXkgPSBpZiBlcnJvcj8gdGhlbiBoYW5kbGVFcnJvciBlcnJvciwgaHRtbCBlbHNlIGhhbmRsZVN1Y2Nlc3MgaHRtbFxuICBjb25maWcuY2FsbGJhY2suYXBwbHkgY29uZmlnLmNhbGxiYWNrLCBhcnJheVxuXG4jIyMqXG4gKiBSZW5kZXJzIG1hcmtkb3duIHdpdGggcGFuZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gZG9jdW1lbnQgaW4gbWFya2Rvd25cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gd2hldGhlciB0byByZW5kZXIgdGhlIG1hdGggd2l0aCBtYXRoamF4XG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja0Z1bmN0aW9uXG4gIyMjXG5yZW5kZXJQYW5kb2MgPSAodGV4dCwgZmlsZVBhdGgsIHJlbmRlck1hdGgsIGNiKSAtPlxuICBjdXJyZW50VGV4dCA9IHRleHRcbiAgY29uZmlnLnJlbmRlck1hdGggPSByZW5kZXJNYXRoXG4gIGNvbmZpZy5jYWxsYmFjayA9IGNiXG4gIHNldFBhbmRvY09wdGlvbnMgZmlsZVBhdGhcbiAgcGRjIHRleHQsIGNvbmZpZy5mbGF2b3IsICdodG1sJywgZ2V0QXJndW1lbnRzKGNvbmZpZy5hcmdzKSwgY29uZmlnLm9wdHMsIGhhbmRsZVJlc3BvbnNlXG5cbmdldEFyZ3VtZW50cyA9IChhcmdzKSAtPlxuICBhcmdzID0gXy5yZWR1Y2UgYXJncyxcbiAgICAocmVzLCB2YWwsIGtleSkgLT5cbiAgICAgIHVubGVzcyBfLmlzRW1wdHkgdmFsXG4gICAgICAgIHZhbCA9IF8uZmxhdHRlbihbdmFsXSlcbiAgICAgICAgXy5mb3JFYWNoIHZhbCwgKHYpIC0+XG4gICAgICAgICAgcmVzLnB1c2ggXCItLSN7a2V5fT0je3Z9XCIgdW5sZXNzIF8uaXNFbXB0eSB2XG4gICAgICByZXR1cm4gcmVzXG4gICAgLCBbXVxuICBhcmdzID0gXy51bmlvbiBhcmdzLCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NBcmd1bWVudHMnKVxuICBhcmdzID0gXy5tYXAgYXJncyxcbiAgICAodmFsKSAtPlxuICAgICAgdmFsID0gdmFsLnJlcGxhY2UoL14oLS1bXFx3XFwtXSspXFxzKC4rKSQvaSwgXCIkMT0kMlwiKVxuICAgICAgaWYgdmFsLnN1YnN0cigwLCAxKSBpc250ICctJyB0aGVuIHVuZGVmaW5lZCBlbHNlIHZhbFxuICBfLnJlamVjdCBhcmdzLCBfLmlzRW1wdHlcblxubW9kdWxlLmV4cG9ydHMgPVxuICByZW5kZXJQYW5kb2M6IHJlbmRlclBhbmRvYyxcbiAgX190ZXN0aW5nX186XG4gICAgZmluZEZpbGVSZWN1cnNpdmU6IGZpbmRGaWxlUmVjdXJzaXZlXG4gICAgc2V0UGFuZG9jT3B0aW9uczogc2V0UGFuZG9jT3B0aW9uc1xuICAgIGdldEFyZ3VtZW50czogZ2V0QXJndW1lbnRzXG4iXX0=
