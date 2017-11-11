(function() {
  var CP, _, atomConfig, findFileRecursive, fs, getArguments, getMathJaxPath, handleError, handleMath, handleResponse, handleSuccess, path, removeReferences, renderPandoc, setPandocOptions;

  _ = require('underscore-plus');

  CP = require('child_process');

  fs = null;

  path = null;

  atomConfig = function() {
    return atom.config.get('markdown-preview-plus');
  };


  /**
   * Sets local mathjaxPath if available
   */

  getMathJaxPath = (function() {
    var cached;
    cached = null;
    return function() {
      var e;
      if (cached != null) {
        return cached;
      }
      try {
        return cached = require.resolve('MathJax');
      } catch (error1) {
        e = error1;
        return '';
      }
    };
  })();

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

  setPandocOptions = function(filePath, renderMath) {
    var args, bibFile, cslFile, mathjaxPath, opts;
    args = {
      from: atomConfig().pandocMarkdownFlavor,
      to: 'html'
    };
    opts = {
      maxBuffer: 2e308
    };
    if (path == null) {
      path = require('path');
    }
    if (filePath != null) {
      opts.cwd = path.dirname(filePath);
    }
    mathjaxPath = getMathJaxPath();
    args.mathjax = renderMath ? mathjaxPath : void 0;
    args.filter = atomConfig().pandocFilters;
    if (atomConfig().pandocBibliography) {
      args.filter.push('pandoc-citeproc');
      bibFile = findFileRecursive(filePath, atomConfig().pandocBIBFile);
      if (!bibFile) {
        bibFile = atomConfig().pandocBIBFileFallback;
      }
      args.bibliography = bibFile ? bibFile : void 0;
      cslFile = findFileRecursive(filePath, atomConfig().pandocCSLFile);
      if (!cslFile) {
        cslFile = atomConfig().pandocCSLFileFallback;
      }
      args.csl = cslFile ? cslFile : void 0;
    }
    return {
      args: args,
      opts: opts
    };
  };


  /**
   * Handle error response from Pandoc
   * @param {error} Returned error
   * @param {string} Returned HTML
   * @return {array} with Arguments for callbackFunction (error set to null)
   */

  handleError = function(error, html, renderMath) {
    var message;
    message = _.uniq(error.split('\n')).join('<br>');
    html = "<h1>Pandoc Error:</h1><pre>" + error + "</pre><hr>" + html;
    return handleSuccess(html, renderMath);
  };


  /**
   * Adjusts all math environments in HTML
   * @param {string} HTML to be adjusted
   * @return {string} HTML with adjusted math environments
   */

  handleMath = function(html) {
    var doc;
    doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('.math').forEach(function(elem) {
      var math, mode;
      math = elem.innerText;
      mode = math.indexOf('\\[') > -1 ? '; mode=display' : '';
      math = math.replace(/\\[[()\]]/g, '');
      return elem.outerHTML = '<span class="math">' + ("<script type='math/tex" + mode + "'>" + math + "</script>") + '</span>';
    });
    return doc.innerHTML;
  };

  removeReferences = function(html) {
    var doc;
    doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('.references').forEach(function(elem) {
      return elem.remove();
    });
    return doc.innerHTML;
  };


  /**
   * Handle successful response from Pandoc
   * @param {string} Returned HTML
   * @return {array} with Arguments for callbackFunction (error set to null)
   */

  handleSuccess = function(html, renderMath) {
    if (renderMath) {
      html = handleMath(html);
    }
    if (atomConfig().pandocRemoveReferences) {
      html = removeReferences(html);
    }
    return [null, html];
  };


  /**
   * Handle response from Pandoc
   * @param {Object} error if thrown
   * @param {string} Returned HTML
   */

  handleResponse = function(error, html, renderMath) {
    if (error) {
      return handleError(error, html, renderMath);
    } else {
      return handleSuccess(html, renderMath);
    }
  };


  /**
   * Renders markdown with pandoc
   * @param {string} document in markdown
   * @param {boolean} whether to render the math with mathjax
   * @param {function} callbackFunction
   */

  renderPandoc = function(text, filePath, renderMath, cb) {
    var args, cp, opts, ref;
    ref = setPandocOptions(filePath, renderMath), args = ref.args, opts = ref.opts;
    cp = CP.execFile(atomConfig().pandocPath, getArguments(args), opts, function(error, stdout, stderr) {
      var cbargs;
      if (error) {
        atom.notifications.addError(error.toString(), {
          stack: error.stack,
          dismissable: true
        });
      }
      cbargs = handleResponse(stderr != null ? stderr : '', stdout != null ? stdout : '', renderMath);
      return cb.apply(null, cbargs);
    });
    cp.stdin.write(text);
    return cp.stdin.end();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9wYW5kb2MtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixFQUFBLEdBQUssT0FBQSxDQUFRLGVBQVI7O0VBQ0wsRUFBQSxHQUFLOztFQUNMLElBQUEsR0FBTzs7RUFFUCxVQUFBLEdBQWEsU0FBQTtXQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEI7RUFBSDs7O0FBRWI7Ozs7RUFHQSxjQUFBLEdBQW9CLENBQUEsU0FBQTtBQUNsQixRQUFBO0lBQUEsTUFBQSxHQUFTO1dBQ1QsU0FBQTtBQUNFLFVBQUE7TUFBQSxJQUFpQixjQUFqQjtBQUFBLGVBQU8sT0FBUDs7QUFDQTtBQUNFLGVBQU8sTUFBQSxHQUFTLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQWhCLEVBRGxCO09BQUEsY0FBQTtRQUVNO0FBQ0osZUFBTyxHQUhUOztJQUZGO0VBRmtCLENBQUEsQ0FBSCxDQUFBOztFQVNqQixpQkFBQSxHQUFvQixTQUFDLFFBQUQsRUFBVyxRQUFYO0FBQ2xCLFFBQUE7O01BQUEsS0FBTSxPQUFBLENBQVEsSUFBUjs7O01BQ04sT0FBUSxPQUFBLENBQVEsTUFBUjs7SUFDUixPQUFBLEdBQVUsSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CLEtBQXBCLEVBQTJCLFFBQTNCO0lBQ1YsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLE9BQWQsQ0FBSDthQUNFLFFBREY7S0FBQSxNQUFBO01BR0UsT0FBQSxHQUFVLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixJQUFuQjtNQUNWLElBQUcsT0FBQSxLQUFhLFFBQWIsSUFBMEIsQ0FBSSxDQUFDLENBQUMsUUFBRixDQUFXLElBQUks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SixDQUFXLENBQVgsRUFBYyxDQUFkLENBQUEsS0FBc0IsR0FBekI7ZUFBa0MsT0FBbEM7T0FBQSxNQUFBO2VBQWlELElBQWpEOztJQUZGLENBREs7V0FJUCxDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxDQUFDLENBQUMsT0FBakI7RUFkYTs7RUFnQmYsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFlBQUEsRUFBYyxZQUFkO0lBQ0EsV0FBQSxFQUNFO01BQUEsaUJBQUEsRUFBbUIsaUJBQW5CO01BQ0EsZ0JBQUEsRUFBa0IsZ0JBRGxCO01BRUEsWUFBQSxFQUFjLFlBRmQ7S0FGRjs7QUF4SkYiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuQ1AgPSByZXF1aXJlICdjaGlsZF9wcm9jZXNzJ1xuZnMgPSBudWxsXG5wYXRoID0gbnVsbFxuXG5hdG9tQ29uZmlnID0gLT4gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKVxuXG4jIyMqXG4gKiBTZXRzIGxvY2FsIG1hdGhqYXhQYXRoIGlmIGF2YWlsYWJsZVxuICMjI1xuZ2V0TWF0aEpheFBhdGggPSBkbyAtPlxuICBjYWNoZWQgPSBudWxsXG4gIC0+XG4gICAgcmV0dXJuIGNhY2hlZCBpZiBjYWNoZWQ/XG4gICAgdHJ5XG4gICAgICByZXR1cm4gY2FjaGVkID0gcmVxdWlyZS5yZXNvbHZlICdNYXRoSmF4J1xuICAgIGNhdGNoIGVcbiAgICAgIHJldHVybiAnJ1xuXG5maW5kRmlsZVJlY3Vyc2l2ZSA9IChmaWxlUGF0aCwgZmlsZU5hbWUpIC0+XG4gIGZzID89IHJlcXVpcmUgJ2ZzJ1xuICBwYXRoID89IHJlcXVpcmUgJ3BhdGgnXG4gIGJpYkZpbGUgPSBwYXRoLmpvaW4gZmlsZVBhdGgsICcuLi8nLCBmaWxlTmFtZVxuICBpZiBmcy5leGlzdHNTeW5jIGJpYkZpbGVcbiAgICBiaWJGaWxlXG4gIGVsc2VcbiAgICBuZXdQYXRoID0gcGF0aC5qb2luIGJpYkZpbGUsICcuLidcbiAgICBpZiBuZXdQYXRoIGlzbnQgZmlsZVBhdGggYW5kIG5vdCBfLmNvbnRhaW5zKGF0b20ucHJvamVjdC5nZXRQYXRocygpLCBuZXdQYXRoKVxuICAgICAgZmluZEZpbGVSZWN1cnNpdmUgbmV3UGF0aCwgZmlsZU5hbWVcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4jIyMqXG4gKiBTZXRzIGxvY2FsIHZhcmlhYmxlcyBuZWVkZWQgZm9yIGV2ZXJ5dGhpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIHRvIG1hcmtkb3duIGZpbGVcbiAqXG4gIyMjXG5zZXRQYW5kb2NPcHRpb25zID0gKGZpbGVQYXRoLCByZW5kZXJNYXRoKSAtPlxuICBhcmdzID1cbiAgICBmcm9tOiBhdG9tQ29uZmlnKCkucGFuZG9jTWFya2Rvd25GbGF2b3JcbiAgICB0bzogJ2h0bWwnXG4gIG9wdHMgPSBtYXhCdWZmZXI6IEluZmluaXR5ICMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tLWNvbW11bml0eS9tYXJrZG93bi1wcmV2aWV3LXBsdXMvaXNzdWVzLzMxNlxuICBwYXRoID89IHJlcXVpcmUgJ3BhdGgnXG4gIG9wdHMuY3dkID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKSBpZiBmaWxlUGF0aD9cbiAgbWF0aGpheFBhdGggPSBnZXRNYXRoSmF4UGF0aCgpXG4gIGFyZ3MubWF0aGpheCA9IGlmIHJlbmRlck1hdGggdGhlbiBtYXRoamF4UGF0aCBlbHNlIHVuZGVmaW5lZFxuICBhcmdzLmZpbHRlciA9IGF0b21Db25maWcoKS5wYW5kb2NGaWx0ZXJzXG4gIGlmIGF0b21Db25maWcoKS5wYW5kb2NCaWJsaW9ncmFwaHlcbiAgICBhcmdzLmZpbHRlci5wdXNoICdwYW5kb2MtY2l0ZXByb2MnXG4gICAgYmliRmlsZSA9IGZpbmRGaWxlUmVjdXJzaXZlIGZpbGVQYXRoLCBhdG9tQ29uZmlnKCkucGFuZG9jQklCRmlsZVxuICAgIGJpYkZpbGUgPSBhdG9tQ29uZmlnKCkucGFuZG9jQklCRmlsZUZhbGxiYWNrIHVubGVzcyBiaWJGaWxlXG4gICAgYXJncy5iaWJsaW9ncmFwaHkgPSBpZiBiaWJGaWxlIHRoZW4gYmliRmlsZSBlbHNlIHVuZGVmaW5lZFxuICAgIGNzbEZpbGUgPSBmaW5kRmlsZVJlY3Vyc2l2ZSBmaWxlUGF0aCwgYXRvbUNvbmZpZygpLnBhbmRvY0NTTEZpbGVcbiAgICBjc2xGaWxlID0gYXRvbUNvbmZpZygpLnBhbmRvY0NTTEZpbGVGYWxsYmFjayB1bmxlc3MgY3NsRmlsZVxuICAgIGFyZ3MuY3NsID0gaWYgY3NsRmlsZSB0aGVuIGNzbEZpbGUgZWxzZSB1bmRlZmluZWRcbiAge2FyZ3MsIG9wdHN9XG5cbiMjIypcbiAqIEhhbmRsZSBlcnJvciByZXNwb25zZSBmcm9tIFBhbmRvY1xuICogQHBhcmFtIHtlcnJvcn0gUmV0dXJuZWQgZXJyb3JcbiAqIEBwYXJhbSB7c3RyaW5nfSBSZXR1cm5lZCBIVE1MXG4gKiBAcmV0dXJuIHthcnJheX0gd2l0aCBBcmd1bWVudHMgZm9yIGNhbGxiYWNrRnVuY3Rpb24gKGVycm9yIHNldCB0byBudWxsKVxuICMjI1xuaGFuZGxlRXJyb3IgPSAoZXJyb3IsIGh0bWwsIHJlbmRlck1hdGgpIC0+XG4gIG1lc3NhZ2UgPVxuICAgIF8udW5pcSBlcnJvci5zcGxpdCAnXFxuJ1xuICAgIC5qb2luKCc8YnI+JylcbiAgaHRtbCA9IFwiPGgxPlBhbmRvYyBFcnJvcjo8L2gxPjxwcmU+I3tlcnJvcn08L3ByZT48aHI+I3todG1sfVwiXG4gIGhhbmRsZVN1Y2Nlc3MgaHRtbCwgcmVuZGVyTWF0aFxuXG4jIyMqXG4gKiBBZGp1c3RzIGFsbCBtYXRoIGVudmlyb25tZW50cyBpbiBIVE1MXG4gKiBAcGFyYW0ge3N0cmluZ30gSFRNTCB0byBiZSBhZGp1c3RlZFxuICogQHJldHVybiB7c3RyaW5nfSBIVE1MIHdpdGggYWRqdXN0ZWQgbWF0aCBlbnZpcm9ubWVudHNcbiAjIyNcbmhhbmRsZU1hdGggPSAoaHRtbCkgLT5cbiAgZG9jID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgZG9jLmlubmVySFRNTCA9IGh0bWxcbiAgZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJy5tYXRoJykuZm9yRWFjaCAoZWxlbSkgLT5cbiAgICBtYXRoID0gZWxlbS5pbm5lclRleHRcbiAgICAjIFNldCBtb2RlIGlmIGl0IGlzIGJsb2NrIG1hdGhcbiAgICBtb2RlID0gaWYgbWF0aC5pbmRleE9mKCdcXFxcWycpID4gLTEgIHRoZW4gJzsgbW9kZT1kaXNwbGF5JyBlbHNlICcnXG5cbiAgICAjIFJlbW92ZSBzb3Vycm91bmRpbmcgXFxbIFxcXSBhbmQgXFwoIFxcKVxuICAgIG1hdGggPSBtYXRoLnJlcGxhY2UoL1xcXFxbWygpXFxdXS9nLCAnJylcbiAgICBlbGVtLm91dGVySFRNTCA9XG4gICAgICAnPHNwYW4gY2xhc3M9XCJtYXRoXCI+JyArXG4gICAgICBcIjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgje21vZGV9Jz4je21hdGh9PC9zY3JpcHQ+XCIgK1xuICAgICAgJzwvc3Bhbj4nXG5cbiAgZG9jLmlubmVySFRNTFxuXG5yZW1vdmVSZWZlcmVuY2VzID0gKGh0bWwpIC0+XG4gIGRvYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGRvYy5pbm5lckhUTUwgPSBodG1sXG4gIGRvYy5xdWVyeVNlbGVjdG9yQWxsKCcucmVmZXJlbmNlcycpLmZvckVhY2ggKGVsZW0pIC0+XG4gICAgZWxlbS5yZW1vdmUoKVxuICBkb2MuaW5uZXJIVE1MXG5cbiMjIypcbiAqIEhhbmRsZSBzdWNjZXNzZnVsIHJlc3BvbnNlIGZyb20gUGFuZG9jXG4gKiBAcGFyYW0ge3N0cmluZ30gUmV0dXJuZWQgSFRNTFxuICogQHJldHVybiB7YXJyYXl9IHdpdGggQXJndW1lbnRzIGZvciBjYWxsYmFja0Z1bmN0aW9uIChlcnJvciBzZXQgdG8gbnVsbClcbiAjIyNcbmhhbmRsZVN1Y2Nlc3MgPSAoaHRtbCwgcmVuZGVyTWF0aCkgLT5cbiAgaHRtbCA9IGhhbmRsZU1hdGggaHRtbCBpZiByZW5kZXJNYXRoXG4gIGh0bWwgPSByZW1vdmVSZWZlcmVuY2VzIGh0bWwgaWYgYXRvbUNvbmZpZygpLnBhbmRvY1JlbW92ZVJlZmVyZW5jZXNcbiAgW251bGwsIGh0bWxdXG5cbiMjIypcbiAqIEhhbmRsZSByZXNwb25zZSBmcm9tIFBhbmRvY1xuICogQHBhcmFtIHtPYmplY3R9IGVycm9yIGlmIHRocm93blxuICogQHBhcmFtIHtzdHJpbmd9IFJldHVybmVkIEhUTUxcbiAjIyNcbmhhbmRsZVJlc3BvbnNlID0gKGVycm9yLCBodG1sLCByZW5kZXJNYXRoKSAtPlxuICBpZiBlcnJvciB0aGVuIGhhbmRsZUVycm9yIGVycm9yLCBodG1sLCByZW5kZXJNYXRoIGVsc2UgaGFuZGxlU3VjY2VzcyBodG1sLCByZW5kZXJNYXRoXG5cbiMjIypcbiAqIFJlbmRlcnMgbWFya2Rvd24gd2l0aCBwYW5kb2NcbiAqIEBwYXJhbSB7c3RyaW5nfSBkb2N1bWVudCBpbiBtYXJrZG93blxuICogQHBhcmFtIHtib29sZWFufSB3aGV0aGVyIHRvIHJlbmRlciB0aGUgbWF0aCB3aXRoIG1hdGhqYXhcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrRnVuY3Rpb25cbiAjIyNcbnJlbmRlclBhbmRvYyA9ICh0ZXh0LCBmaWxlUGF0aCwgcmVuZGVyTWF0aCwgY2IpIC0+XG4gIHthcmdzLCBvcHRzfSA9IHNldFBhbmRvY09wdGlvbnMgZmlsZVBhdGgsIHJlbmRlck1hdGhcbiAgY3AgPSBDUC5leGVjRmlsZSBhdG9tQ29uZmlnKCkucGFuZG9jUGF0aCwgZ2V0QXJndW1lbnRzKGFyZ3MpLCBvcHRzLCAoZXJyb3IsIHN0ZG91dCwgc3RkZXJyKSAtPlxuICAgIGlmIChlcnJvcilcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBlcnJvci50b1N0cmluZygpLFxuICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2tcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICBjYmFyZ3MgPSBoYW5kbGVSZXNwb25zZSAoc3RkZXJyID8gJycpLCAoc3Rkb3V0ID8gJycpLCByZW5kZXJNYXRoXG4gICAgY2IgY2JhcmdzLi4uXG4gIGNwLnN0ZGluLndyaXRlKHRleHQpXG4gIGNwLnN0ZGluLmVuZCgpXG5cbmdldEFyZ3VtZW50cyA9IChhcmdzKSAtPlxuICBhcmdzID0gXy5yZWR1Y2UgYXJncyxcbiAgICAocmVzLCB2YWwsIGtleSkgLT5cbiAgICAgIHVubGVzcyBfLmlzRW1wdHkgdmFsXG4gICAgICAgIHZhbCA9IF8uZmxhdHRlbihbdmFsXSlcbiAgICAgICAgXy5mb3JFYWNoIHZhbCwgKHYpIC0+XG4gICAgICAgICAgcmVzLnB1c2ggXCItLSN7a2V5fT0je3Z9XCIgdW5sZXNzIF8uaXNFbXB0eSB2XG4gICAgICByZXR1cm4gcmVzXG4gICAgLCBbXVxuICBhcmdzID0gXy51bmlvbiBhcmdzLCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NBcmd1bWVudHMnKVxuICBhcmdzID0gXy5tYXAgYXJncyxcbiAgICAodmFsKSAtPlxuICAgICAgdmFsID0gdmFsLnJlcGxhY2UoL14oLS1bXFx3XFwtXSspXFxzKC4rKSQvaSwgXCIkMT0kMlwiKVxuICAgICAgaWYgdmFsLnN1YnN0cigwLCAxKSBpc250ICctJyB0aGVuIHVuZGVmaW5lZCBlbHNlIHZhbFxuICBfLnJlamVjdCBhcmdzLCBfLmlzRW1wdHlcblxubW9kdWxlLmV4cG9ydHMgPVxuICByZW5kZXJQYW5kb2M6IHJlbmRlclBhbmRvYyxcbiAgX190ZXN0aW5nX186XG4gICAgZmluZEZpbGVSZWN1cnNpdmU6IGZpbmRGaWxlUmVjdXJzaXZlXG4gICAgc2V0UGFuZG9jT3B0aW9uczogc2V0UGFuZG9jT3B0aW9uc1xuICAgIGdldEFyZ3VtZW50czogZ2V0QXJndW1lbnRzXG4iXX0=
