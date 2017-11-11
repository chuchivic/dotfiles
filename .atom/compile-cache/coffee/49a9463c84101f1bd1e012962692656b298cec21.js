(function() {
  var $, CSON, _, attachMathJax, checkMacros, cheerio, configureMathJax, createMacrosTemplate, fs, getUserMacrosPath, loadMacrosFile, loadUserMacros, namePattern, path, valueMatchesPattern;

  $ = require('atom-space-pen-views').$;

  cheerio = require('cheerio');

  path = require('path');

  CSON = require('season');

  fs = require('fs-plus');

  _ = require('underscore-plus');

  module.exports = {
    loadMathJax: function(listener) {
      var script;
      script = this.attachMathJax();
      if (listener != null) {
        script.addEventListener("load", function() {
          return listener();
        });
      }
    },
    attachMathJax: _.once(function() {
      return attachMathJax();
    }),
    resetMathJax: function() {
      $('script[src*="MathJax.js"]').remove();
      window.MathJax = void 0;
      return this.attachMathJax = _.once(function() {
        return attachMathJax();
      });
    },
    mathProcessor: function(domElements) {
      if (typeof MathJax !== "undefined" && MathJax !== null) {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, domElements]);
      } else {
        this.loadMathJax(function() {
          return MathJax.Hub.Queue(["Typeset", MathJax.Hub, domElements]);
        });
      }
    },
    processHTMLString: function(html, callback) {
      var compileProcessedHTMLString, element, queueProcessHTMLString;
      element = document.createElement('div');
      element.innerHTML = html;
      compileProcessedHTMLString = function() {
        var ref, svgGlyphs;
        svgGlyphs = (ref = document.getElementById('MathJax_SVG_Hidden')) != null ? ref.parentNode.cloneNode(true) : void 0;
        if (svgGlyphs != null) {
          element.insertBefore(svgGlyphs, element.firstChild);
        }
        return element.innerHTML;
      };
      queueProcessHTMLString = function() {
        return MathJax.Hub.Queue(["setRenderer", MathJax.Hub, "SVG"], ["Typeset", MathJax.Hub, element], ["setRenderer", MathJax.Hub, "HTML-CSS"], [
          function() {
            return callback(compileProcessedHTMLString());
          }
        ]);
      };
      if (typeof MathJax !== "undefined" && MathJax !== null) {
        queueProcessHTMLString();
      } else {
        this.loadMathJax(queueProcessHTMLString);
      }
    }
  };

  namePattern = /^[^a-zA-Z\d\s]$|^[a-zA-Z]*$/;

  getUserMacrosPath = function() {
    var userMacrosPath;
    userMacrosPath = CSON.resolve(path.join(atom.getConfigDirPath(), 'markdown-preview-plus'));
    return userMacrosPath != null ? userMacrosPath : path.join(atom.getConfigDirPath(), 'markdown-preview-plus.cson');
  };

  loadMacrosFile = function(filePath) {
    if (!CSON.isObjectPath(filePath)) {
      return {};
    }
    return CSON.readFileSync(filePath, function(error, object) {
      var ref, ref1;
      if (object == null) {
        object = {};
      }
      if (error != null) {
        console.warn("Error reading Latex Macros file '" + filePath + "': " + ((ref = error.stack) != null ? ref : error));
        if ((ref1 = atom.notifications) != null) {
          ref1.addError("Failed to load Latex Macros from '" + filePath + "'", {
            detail: error.message,
            dismissable: true
          });
        }
      }
      return object;
    });
  };

  loadUserMacros = function() {
    var result, userMacrosPath;
    userMacrosPath = getUserMacrosPath();
    if (fs.isFileSync(userMacrosPath)) {
      return result = loadMacrosFile(userMacrosPath);
    } else {
      console.log("Creating markdown-preview-plus.cson, this is a one-time operation.");
      createMacrosTemplate(userMacrosPath);
      return result = loadMacrosFile(userMacrosPath);
    }
  };

  createMacrosTemplate = function(filePath) {
    var templateFile, templatePath;
    templatePath = path.join(__dirname, "../assets/macros-template.cson");
    templateFile = fs.readFileSync(templatePath, 'utf8');
    return fs.writeFileSync(filePath, templateFile);
  };

  checkMacros = function(macrosObject) {
    var name, ref, value;
    for (name in macrosObject) {
      value = macrosObject[name];
      if (!(name.match(namePattern) && valueMatchesPattern(value))) {
        delete macrosObject[name];
        if ((ref = atom.notifications) != null) {
          ref.addError("Failed to load LaTeX macro named '" + name + "'. Please see the [LaTeX guide](https://github.com/Galadirith/markdown-preview-plus/blob/master/LATEX.md#macro-names)", {
            dismissable: true
          });
        }
      }
    }
    return macrosObject;
  };

  valueMatchesPattern = function(value) {
    var macroDefinition, numberOfArgs;
    switch (false) {
      case Object.prototype.toString.call(value) !== '[object Array]':
        macroDefinition = value[0];
        numberOfArgs = value[1];
        if (typeof numberOfArgs === 'number') {
          return numberOfArgs % 1 === 0 && typeof macroDefinition === 'string';
        } else {
          return false;
        }
        break;
      case typeof value !== 'string':
        return true;
      default:
        return false;
    }
  };

  configureMathJax = function() {
    var userMacros;
    userMacros = loadUserMacros();
    if (userMacros) {
      userMacros = checkMacros(userMacros);
    } else {
      userMacros = {};
    }
    MathJax.Hub.Config({
      jax: ["input/TeX", "output/HTML-CSS"],
      extensions: [],
      TeX: {
        extensions: ["AMSmath.js", "AMSsymbols.js", "noErrors.js", "noUndefined.js"],
        Macros: userMacros
      },
      "HTML-CSS": {
        availableFonts: [],
        webFont: "TeX"
      },
      messageStyle: "none",
      showMathMenu: false,
      skipStartupTypeset: true
    });
    MathJax.Hub.Configured();
    if (atom.inDevMode()) {
      atom.notifications.addSuccess("Loaded maths rendering engine MathJax");
    }
  };

  attachMathJax = function() {
    var script;
    if (atom.inDevMode()) {
      atom.notifications.addInfo("Loading maths rendering engine MathJax");
    }
    script = document.createElement("script");
    script.src = (require.resolve('MathJax')) + "?delayStartupUntil=configured";
    script.type = "text/javascript";
    script.addEventListener("load", function() {
      return configureMathJax();
    });
    document.getElementsByTagName("head")[0].appendChild(script);
    return script;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYXRoamF4LWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0E7QUFBQSxNQUFBOztFQUFDLElBQVMsT0FBQSxDQUFRLHNCQUFSOztFQUNWLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixJQUFBLEdBQVUsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztFQUNWLEVBQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixDQUFBLEdBQVUsT0FBQSxDQUFRLGlCQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBT0U7SUFBQSxXQUFBLEVBQWEsU0FBQyxRQUFEO0FBQ1gsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsYUFBRCxDQUFBO01BQ1QsSUFBRyxnQkFBSDtRQUFrQixNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MsU0FBQTtpQkFBRyxRQUFBLENBQUE7UUFBSCxDQUFoQyxFQUFsQjs7SUFGVyxDQUFiO0lBUUEsYUFBQSxFQUFlLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBQTthQUFHLGFBQUEsQ0FBQTtJQUFILENBQVAsQ0FSZjtJQWFBLFlBQUEsRUFBYyxTQUFBO01BRVosQ0FBQSxDQUFFLDJCQUFGLENBQThCLENBQUMsTUFBL0IsQ0FBQTtNQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO2FBR2pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBQTtlQUFHLGFBQUEsQ0FBQTtNQUFILENBQVA7SUFOTCxDQWJkO0lBNEJBLGFBQUEsRUFBZSxTQUFDLFdBQUQ7TUFDYixJQUFHLGtEQUFIO1FBQ0ssT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFaLENBQWtCLENBQUMsU0FBRCxFQUFZLE9BQU8sQ0FBQyxHQUFwQixFQUF5QixXQUF6QixDQUFsQixFQURMO09BQUEsTUFBQTtRQUVLLElBQUMsQ0FBQSxXQUFELENBQWEsU0FBQTtpQkFBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxTQUFELEVBQVksT0FBTyxDQUFDLEdBQXBCLEVBQXlCLFdBQXpCLENBQWxCO1FBQUgsQ0FBYixFQUZMOztJQURhLENBNUJmO0lBeUNBLGlCQUFBLEVBQW1CLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDakIsVUFBQTtNQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNWLE9BQU8sQ0FBQyxTQUFSLEdBQW9CO01BRXBCLDBCQUFBLEdBQTZCLFNBQUE7QUFDM0IsWUFBQTtRQUFBLFNBQUEsc0VBQXlELENBQUUsVUFBVSxDQUFDLFNBQTFELENBQW9FLElBQXBFO1FBQ1osSUFBdUQsaUJBQXZEO1VBQUEsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsU0FBckIsRUFBZ0MsT0FBTyxDQUFDLFVBQXhDLEVBQUE7O0FBQ0EsZUFBTyxPQUFPLENBQUM7TUFIWTtNQUs3QixzQkFBQSxHQUF5QixTQUFBO2VBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUNFLENBQUMsYUFBRCxFQUFnQixPQUFPLENBQUMsR0FBeEIsRUFBNkIsS0FBN0IsQ0FERixFQUVFLENBQUMsU0FBRCxFQUFZLE9BQU8sQ0FBQyxHQUFwQixFQUF5QixPQUF6QixDQUZGLEVBR0UsQ0FBQyxhQUFELEVBQWdCLE9BQU8sQ0FBQyxHQUF4QixFQUE2QixVQUE3QixDQUhGLEVBSUU7VUFBRSxTQUFBO21CQUFHLFFBQUEsQ0FBUywwQkFBQSxDQUFBLENBQVQ7VUFBSCxDQUFGO1NBSkY7TUFEdUI7TUFRekIsSUFBRyxrREFBSDtRQUNLLHNCQUFBLENBQUEsRUFETDtPQUFBLE1BQUE7UUFFSyxJQUFDLENBQUEsV0FBRCxDQUFhLHNCQUFiLEVBRkw7O0lBakJpQixDQXpDbkI7OztFQW9FRixXQUFBLEdBQWM7O0VBTWQsaUJBQUEsR0FBb0IsU0FBQTtBQUNsQixRQUFBO0lBQUEsY0FBQSxHQUFrQixJQUFJLENBQUMsT0FBTCxDQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFtQyx1QkFBbkMsQ0FBYjtvQ0FDbEIsaUJBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFtQyw0QkFBbkM7RUFGQzs7RUFJcEIsY0FBQSxHQUFpQixTQUFDLFFBQUQ7SUFDZixJQUFBLENBQWlCLElBQUksQ0FBQyxZQUFMLENBQWtCLFFBQWxCLENBQWpCO0FBQUEsYUFBTyxHQUFQOztXQUNBLElBQUksQ0FBQyxZQUFMLENBQWtCLFFBQWxCLEVBQTRCLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFDMUIsVUFBQTs7UUFEa0MsU0FBTzs7TUFDekMsSUFBRyxhQUFIO1FBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxtQ0FBQSxHQUFvQyxRQUFwQyxHQUE2QyxLQUE3QyxHQUFpRCxxQ0FBZSxLQUFmLENBQTlEOztjQUNrQixDQUFFLFFBQXBCLENBQTZCLG9DQUFBLEdBQXFDLFFBQXJDLEdBQThDLEdBQTNFLEVBQStFO1lBQUMsTUFBQSxFQUFRLEtBQUssQ0FBQyxPQUFmO1lBQXdCLFdBQUEsRUFBYSxJQUFyQztXQUEvRTtTQUZGOzthQUdBO0lBSjBCLENBQTVCO0VBRmU7O0VBUWpCLGNBQUEsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxjQUFBLEdBQWlCLGlCQUFBLENBQUE7SUFDakIsSUFBRyxFQUFFLENBQUMsVUFBSCxDQUFjLGNBQWQsQ0FBSDthQUNFLE1BQUEsR0FBUyxjQUFBLENBQWUsY0FBZixFQURYO0tBQUEsTUFBQTtNQUdFLE9BQU8sQ0FBQyxHQUFSLENBQVksb0VBQVo7TUFDQSxvQkFBQSxDQUFxQixjQUFyQjthQUNBLE1BQUEsR0FBUyxjQUFBLENBQWUsY0FBZixFQUxYOztFQUZlOztFQVNqQixvQkFBQSxHQUF1QixTQUFDLFFBQUQ7QUFDckIsUUFBQTtJQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsZ0NBQXJCO0lBQ2YsWUFBQSxHQUFlLEVBQUUsQ0FBQyxZQUFILENBQWdCLFlBQWhCLEVBQThCLE1BQTlCO1dBQ2YsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsUUFBakIsRUFBMkIsWUFBM0I7RUFIcUI7O0VBS3ZCLFdBQUEsR0FBYyxTQUFDLFlBQUQ7QUFDWixRQUFBO0FBQUEsU0FBQSxvQkFBQTs7TUFDRSxJQUFBLENBQUEsQ0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLFdBQVgsQ0FBQSxJQUE0QixtQkFBQSxDQUFvQixLQUFwQixDQUFuQyxDQUFBO1FBQ0UsT0FBTyxZQUFhLENBQUEsSUFBQTs7YUFDRixDQUFFLFFBQXBCLENBQTZCLG9DQUFBLEdBQXFDLElBQXJDLEdBQTBDLHVIQUF2RSxFQUErTDtZQUFDLFdBQUEsRUFBYSxJQUFkO1dBQS9MO1NBRkY7O0FBREY7V0FJQTtFQUxZOztFQU9kLG1CQUFBLEdBQXNCLFNBQUMsS0FBRDtBQUVwQixRQUFBO0FBQUEsWUFBQSxLQUFBO0FBQUEsV0FFTyxNQUFNLENBQUEsU0FBRSxDQUFBLFFBQVEsQ0FBQyxJQUFqQixDQUFzQixLQUF0QixDQUFBLEtBQWdDLGdCQUZ2QztRQUdJLGVBQUEsR0FBa0IsS0FBTSxDQUFBLENBQUE7UUFDeEIsWUFBQSxHQUFlLEtBQU0sQ0FBQSxDQUFBO1FBQ3JCLElBQUcsT0FBTyxZQUFQLEtBQXdCLFFBQTNCO2lCQUNFLFlBQUEsR0FBZSxDQUFmLEtBQW9CLENBQXBCLElBQTBCLE9BQU8sZUFBUCxLQUEwQixTQUR0RDtTQUFBLE1BQUE7aUJBR0UsTUFIRjs7QUFIRztBQUZQLFdBVU8sT0FBTyxLQUFQLEtBQWdCLFFBVnZCO2VBV0k7QUFYSjtlQVlPO0FBWlA7RUFGb0I7O0VBbUJ0QixnQkFBQSxHQUFtQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxVQUFBLEdBQWEsY0FBQSxDQUFBO0lBQ2IsSUFBRyxVQUFIO01BQ0UsVUFBQSxHQUFhLFdBQUEsQ0FBWSxVQUFaLEVBRGY7S0FBQSxNQUFBO01BR0UsVUFBQSxHQUFhLEdBSGY7O0lBTUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFaLENBQ0U7TUFBQSxHQUFBLEVBQUssQ0FDSCxXQURHLEVBRUgsaUJBRkcsQ0FBTDtNQUlBLFVBQUEsRUFBWSxFQUpaO01BS0EsR0FBQSxFQUNFO1FBQUEsVUFBQSxFQUFZLENBQ1YsWUFEVSxFQUVWLGVBRlUsRUFHVixhQUhVLEVBSVYsZ0JBSlUsQ0FBWjtRQU1BLE1BQUEsRUFBUSxVQU5SO09BTkY7TUFhQSxVQUFBLEVBQ0U7UUFBQSxjQUFBLEVBQWdCLEVBQWhCO1FBQ0EsT0FBQSxFQUFTLEtBRFQ7T0FkRjtNQWdCQSxZQUFBLEVBQWMsTUFoQmQ7TUFpQkEsWUFBQSxFQUFjLEtBakJkO01Ba0JBLGtCQUFBLEVBQW9CLElBbEJwQjtLQURGO0lBb0JBLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBWixDQUFBO0lBR0EsSUFBeUUsSUFBSSxDQUFDLFNBQUwsQ0FBQSxDQUF6RTtNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsdUNBQTlCLEVBQUE7O0VBL0JpQjs7RUFzQ25CLGFBQUEsR0FBZ0IsU0FBQTtBQUVkLFFBQUE7SUFBQSxJQUF1RSxJQUFJLENBQUMsU0FBTCxDQUFBLENBQXZFO01BQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQix3Q0FBM0IsRUFBQTs7SUFHQSxNQUFBLEdBQWMsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7SUFDZCxNQUFNLENBQUMsR0FBUCxHQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQWhCLENBQUQsQ0FBQSxHQUE0QjtJQUM1QyxNQUFNLENBQUMsSUFBUCxHQUFjO0lBQ2QsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFNBQUE7YUFBRyxnQkFBQSxDQUFBO0lBQUgsQ0FBaEM7SUFDQSxRQUFRLENBQUMsb0JBQVQsQ0FBOEIsTUFBOUIsQ0FBc0MsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUF6QyxDQUFxRCxNQUFyRDtBQUVBLFdBQU87RUFYTztBQWxMaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjXG4jIG1hdGhqYXgtaGVscGVyXG4jXG4jIFRoaXMgbW9kdWxlIHdpbGwgaGFuZGxlIGxvYWRpbmcgdGhlIE1hdGhKYXggZW52aXJvbm1lbnQgYW5kIHByb3ZpZGUgYSB3cmFwcGVyXG4jIGZvciBjYWxscyB0byBNYXRoSmF4IHRvIHByb2Nlc3MgTGFUZVggZXF1YXRpb25zLlxuI1xuXG57JH0gICAgID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5jaGVlcmlvID0gcmVxdWlyZSAnY2hlZXJpbydcbnBhdGggICAgPSByZXF1aXJlICdwYXRoJ1xuQ1NPTiAgICA9IHJlcXVpcmUgJ3NlYXNvbidcbmZzICAgICAgPSByZXF1aXJlICdmcy1wbHVzJ1xuXyAgICAgICA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjXG4gICMgTG9hZCBNYXRoSmF4IGVudmlyb25tZW50XG4gICNcbiAgIyBAcGFyYW0gbGlzdGVuZXIgT3B0aW9uYWwgbWV0aG9kIHRvIGNhbGwgd2hlbiB0aGUgTWF0aEpheCBzY3JpcHQgd2FzIGJlZW5cbiAgIyAgIGxvYWRlZCB0byB0aGUgd2luZG93LiBUaGUgbWV0aG9kIGlzIHBhc3NlZCBubyBhcmd1bWVudHMuXG4gICNcbiAgbG9hZE1hdGhKYXg6IChsaXN0ZW5lcikgLT5cbiAgICBzY3JpcHQgPSBAYXR0YWNoTWF0aEpheCgpXG4gICAgaWYgbGlzdGVuZXI/IHRoZW4gc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIgXCJsb2FkXCIsIC0+IGxpc3RlbmVyKClcbiAgICByZXR1cm5cblxuICAjXG4gICMgQXR0YWNoIG1haW4gTWF0aEpheCBzY3JpcHQgdG8gdGhlIGRvY3VtZW50XG4gICNcbiAgYXR0YWNoTWF0aEpheDogXy5vbmNlIC0+IGF0dGFjaE1hdGhKYXgoKVxuXG4gICNcbiAgIyBSZW1vdmUgTWF0aEpheCBmcm9tIHRoZSBkb2N1bWVudCBhbmQgcmVzZXQgYXR0YWNoIG1ldGhvZFxuICAjXG4gIHJlc2V0TWF0aEpheDogLT5cbiAgICAjIERldGFjaCBNYXRoSmF4IGZyb20gdGhlIGRvY3VtZW50XG4gICAgJCgnc2NyaXB0W3NyYyo9XCJNYXRoSmF4LmpzXCJdJykucmVtb3ZlKClcbiAgICB3aW5kb3cuTWF0aEpheCA9IHVuZGVmaW5lZFxuXG4gICAgIyBSZXNldCBhdHRhY2ggZm9yIGFueSBzdWJzZXF1ZW50IGNhbGxzXG4gICAgQGF0dGFjaE1hdGhKYXggPSBfLm9uY2UgLT4gYXR0YWNoTWF0aEpheCgpXG5cbiAgI1xuICAjIFByb2Nlc3MgRE9NIGVsZW1lbnRzIGZvciBMYVRlWCBlcXVhdGlvbnMgd2l0aCBNYXRoSmF4XG4gICNcbiAgIyBAcGFyYW0gZG9tRWxlbWVudHMgQW4gYXJyYXkgb2YgRE9NIGVsZW1lbnRzIHRvIGJlIHByb2Nlc3NlZCBieSBNYXRoSmF4LiBTZWVcbiAgIyAgIFtlbGVtZW50XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvZWxlbWVudCkgZm9yXG4gICMgICBkZXRhaWxzIG9uIERPTSBlbGVtZW50cy5cbiAgI1xuICBtYXRoUHJvY2Vzc29yOiAoZG9tRWxlbWVudHMpIC0+XG4gICAgaWYgTWF0aEpheD9cbiAgICB0aGVuIE1hdGhKYXguSHViLlF1ZXVlIFtcIlR5cGVzZXRcIiwgTWF0aEpheC5IdWIsIGRvbUVsZW1lbnRzXVxuICAgIGVsc2UgQGxvYWRNYXRoSmF4IC0+IE1hdGhKYXguSHViLlF1ZXVlIFtcIlR5cGVzZXRcIiwgTWF0aEpheC5IdWIsIGRvbUVsZW1lbnRzXVxuICAgIHJldHVyblxuXG4gICNcbiAgIyBQcm9jZXNzIG1hdGhzIGluIEhUTUwgZnJhZ21lbnQgd2l0aCBNYXRoSmF4XG4gICNcbiAgIyBAcGFyYW0gaHRtbCBBIEhUTUwgZnJhZ21lbnQgc3RyaW5nXG4gICMgQHBhcmFtIGNhbGxiYWNrIEEgY2FsbGJhY2sgbWV0aG9kIHRoYXQgYWNjZXB0cyBhIHNpbmdsZSBwYXJhbWV0ZXIsIGEgSFRNTFxuICAjICAgZnJhZ21lbnQgc3RyaW5nIHRoYXQgaXMgdGhlIHJlc3VsdCBvZiBodG1sIHByb2Nlc3NlZCBieSBNYXRoSmF4XG4gICNcbiAgcHJvY2Vzc0hUTUxTdHJpbmc6IChodG1sLCBjYWxsYmFjaykgLT5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWxcblxuICAgIGNvbXBpbGVQcm9jZXNzZWRIVE1MU3RyaW5nID0gLT5cbiAgICAgIHN2Z0dseXBocyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdNYXRoSmF4X1NWR19IaWRkZW4nKT8ucGFyZW50Tm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHN2Z0dseXBocywgZWxlbWVudC5maXJzdENoaWxkKSBpZiBzdmdHbHlwaHM/XG4gICAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUxcblxuICAgIHF1ZXVlUHJvY2Vzc0hUTUxTdHJpbmcgPSAtPlxuICAgICAgTWF0aEpheC5IdWIuUXVldWUoXG4gICAgICAgIFtcInNldFJlbmRlcmVyXCIsIE1hdGhKYXguSHViLCBcIlNWR1wiXSxcbiAgICAgICAgW1wiVHlwZXNldFwiLCBNYXRoSmF4Lkh1YiwgZWxlbWVudF0sXG4gICAgICAgIFtcInNldFJlbmRlcmVyXCIsIE1hdGhKYXguSHViLCBcIkhUTUwtQ1NTXCJdLFxuICAgICAgICBbIC0+IGNhbGxiYWNrIGNvbXBpbGVQcm9jZXNzZWRIVE1MU3RyaW5nKCldXG4gICAgICApXG5cbiAgICBpZiBNYXRoSmF4P1xuICAgIHRoZW4gcXVldWVQcm9jZXNzSFRNTFN0cmluZygpXG4gICAgZWxzZSBAbG9hZE1hdGhKYXggcXVldWVQcm9jZXNzSFRNTFN0cmluZ1xuXG4gICAgcmV0dXJuXG5cbiNcbiMgRGVmaW5lIHNvbWUgZnVuY3Rpb25zIHRvIGhlbHAgZ2V0IGEgaG9sZCBvZiB0aGUgdXNlcidzIExhdGV4XG4jIE1hY3Jvcy5cbiNcbm5hbWVQYXR0ZXJuID0gLy8vICAgICAgICAgICAgICMgVGhlIG5hbWUgb2YgYSBtYWNybyBjYW4gYmUgZWl0aGVyXG4gICAgICAgICAgICAgIF5bXmEtekEtWlxcZFxcc10kICMgYSBzaW5nbGUgbm9uLWFscGhhbnVtZXJpYyBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICMgb3JcbiAgICAgICAgICAgICAgXlthLXpBLVpdKiQgICAgICMgYW55IG51bWJlciBvZiBsb3dlciBhbmQgdXBwZXIgY2FzZVxuICAgICAgICAgICAgICAvLy8gICAgICAgICAgICAgIyBsZXR0ZXJzLCBidXQgbm8gbnVtZXJhbHMuXG5cbmdldFVzZXJNYWNyb3NQYXRoID0gLT5cbiAgdXNlck1hY3Jvc1BhdGggPSAgQ1NPTi5yZXNvbHZlKHBhdGguam9pbihhdG9tLmdldENvbmZpZ0RpclBhdGgoKSwgJ21hcmtkb3duLXByZXZpZXctcGx1cycpKVxuICB1c2VyTWFjcm9zUGF0aCA/IHBhdGguam9pbihhdG9tLmdldENvbmZpZ0RpclBhdGgoKSwgJ21hcmtkb3duLXByZXZpZXctcGx1cy5jc29uJylcblxubG9hZE1hY3Jvc0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIHJldHVybiB7fSB1bmxlc3MgQ1NPTi5pc09iamVjdFBhdGgoZmlsZVBhdGgpXG4gIENTT04ucmVhZEZpbGVTeW5jIGZpbGVQYXRoLCAoZXJyb3IsIG9iamVjdD17fSkgLT5cbiAgICBpZiBlcnJvcj9cbiAgICAgIGNvbnNvbGUud2FybiBcIkVycm9yIHJlYWRpbmcgTGF0ZXggTWFjcm9zIGZpbGUgJyN7ZmlsZVBhdGh9JzogI3tlcnJvci5zdGFjayA/IGVycm9yfVwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnM/LmFkZEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgTGF0ZXggTWFjcm9zIGZyb20gJyN7ZmlsZVBhdGh9J1wiLCB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgb2JqZWN0XG5cbmxvYWRVc2VyTWFjcm9zID0gLT5cbiAgdXNlck1hY3Jvc1BhdGggPSBnZXRVc2VyTWFjcm9zUGF0aCgpXG4gIGlmIGZzLmlzRmlsZVN5bmModXNlck1hY3Jvc1BhdGgpXG4gICAgcmVzdWx0ID0gbG9hZE1hY3Jvc0ZpbGUodXNlck1hY3Jvc1BhdGgpXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyBcIkNyZWF0aW5nIG1hcmtkb3duLXByZXZpZXctcGx1cy5jc29uLCB0aGlzIGlzIGEgb25lLXRpbWUgb3BlcmF0aW9uLlwiXG4gICAgY3JlYXRlTWFjcm9zVGVtcGxhdGUodXNlck1hY3Jvc1BhdGgpXG4gICAgcmVzdWx0ID0gbG9hZE1hY3Jvc0ZpbGUodXNlck1hY3Jvc1BhdGgpXG5cbmNyZWF0ZU1hY3Jvc1RlbXBsYXRlID0gKGZpbGVQYXRoKSAtPlxuICB0ZW1wbGF0ZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uL2Fzc2V0cy9tYWNyb3MtdGVtcGxhdGUuY3NvblwiKVxuICB0ZW1wbGF0ZUZpbGUgPSBmcy5yZWFkRmlsZVN5bmMgdGVtcGxhdGVQYXRoLCAndXRmOCdcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgdGVtcGxhdGVGaWxlXG5cbmNoZWNrTWFjcm9zID0gKG1hY3Jvc09iamVjdCkgLT5cbiAgZm9yIG5hbWUsIHZhbHVlIG9mIG1hY3Jvc09iamVjdFxuICAgIHVubGVzcyBuYW1lLm1hdGNoKG5hbWVQYXR0ZXJuKSBhbmQgdmFsdWVNYXRjaGVzUGF0dGVybih2YWx1ZSlcbiAgICAgIGRlbGV0ZSBtYWNyb3NPYmplY3RbbmFtZV1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBMYVRlWCBtYWNybyBuYW1lZCAnI3tuYW1lfScuIFBsZWFzZSBzZWUgdGhlIFtMYVRlWCBndWlkZV0oaHR0cHM6Ly9naXRodWIuY29tL0dhbGFkaXJpdGgvbWFya2Rvd24tcHJldmlldy1wbHVzL2Jsb2IvbWFzdGVyL0xBVEVYLm1kI21hY3JvLW5hbWVzKVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICBtYWNyb3NPYmplY3RcblxudmFsdWVNYXRjaGVzUGF0dGVybiA9ICh2YWx1ZSkgLT5cbiAgIyBEaWZmZXJlbnQgY2hlY2sgYmFzZWQgb24gd2hldGhlciB2YWx1ZSBpcyBzdHJpbmcgb3IgYXJyYXlcbiAgc3dpdGNoXG4gICAgIyBJZiBpdCBpcyBhbiBhcnJheSB0aGVuIGl0IHNob3VsZCBiZSBbc3RyaW5nLCBpbnRlZ2VyXVxuICAgIHdoZW4gT2JqZWN0Ojp0b1N0cmluZy5jYWxsKHZhbHVlKSBpcyAnW29iamVjdCBBcnJheV0nXG4gICAgICBtYWNyb0RlZmluaXRpb24gPSB2YWx1ZVswXVxuICAgICAgbnVtYmVyT2ZBcmdzID0gdmFsdWVbMV1cbiAgICAgIGlmIHR5cGVvZiBudW1iZXJPZkFyZ3MgIGlzICdudW1iZXInXG4gICAgICAgIG51bWJlck9mQXJncyAlIDEgaXMgMCBhbmQgdHlwZW9mIG1hY3JvRGVmaW5pdGlvbiBpcyAnc3RyaW5nJ1xuICAgICAgZWxzZVxuICAgICAgICBmYWxzZVxuICAgICMgSWYgaXQgaXMganVzdCBhIHN0cmluZyB0aGVuIHRoYXQncyBPSywgYW55IHN0cmluZyBpcyBhY2NlcHRhYmxlXG4gICAgd2hlbiB0eXBlb2YgdmFsdWUgaXMgJ3N0cmluZydcbiAgICAgIHRydWVcbiAgICBlbHNlIGZhbHNlXG5cbiMgQ29uZmlndXJlIE1hdGhKYXggZW52aXJvbm1lbnQuIFNpbWlsYXIgdG8gdGhlIFRlWC1BTVNfSFRNTCBjb25maWd1cmF0aW9uIHdpdGhcbiMgYSBmZXcgdW5uZWNlc3NhcnkgZmVhdHVyZXMgc3RyaXBwZWQgYXdheVxuI1xuY29uZmlndXJlTWF0aEpheCA9IC0+XG4gIHVzZXJNYWNyb3MgPSBsb2FkVXNlck1hY3JvcygpXG4gIGlmIHVzZXJNYWNyb3NcbiAgICB1c2VyTWFjcm9zID0gY2hlY2tNYWNyb3ModXNlck1hY3JvcylcbiAgZWxzZVxuICAgIHVzZXJNYWNyb3MgPSB7fVxuXG4gICNOb3cgQ29uZmlndXJlIE1hdGhKYXhcbiAgTWF0aEpheC5IdWIuQ29uZmlnXG4gICAgamF4OiBbXG4gICAgICBcImlucHV0L1RlWFwiLFxuICAgICAgXCJvdXRwdXQvSFRNTC1DU1NcIlxuICAgIF1cbiAgICBleHRlbnNpb25zOiBbXVxuICAgIFRlWDpcbiAgICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgICAgXCJBTVNtYXRoLmpzXCIsXG4gICAgICAgIFwiQU1Tc3ltYm9scy5qc1wiLFxuICAgICAgICBcIm5vRXJyb3JzLmpzXCIsXG4gICAgICAgIFwibm9VbmRlZmluZWQuanNcIlxuICAgICAgXVxuICAgICAgTWFjcm9zOiB1c2VyTWFjcm9zXG4gICAgXCJIVE1MLUNTU1wiOlxuICAgICAgYXZhaWxhYmxlRm9udHM6IFtdXG4gICAgICB3ZWJGb250OiBcIlRlWFwiXG4gICAgbWVzc2FnZVN0eWxlOiBcIm5vbmVcIlxuICAgIHNob3dNYXRoTWVudTogZmFsc2VcbiAgICBza2lwU3RhcnR1cFR5cGVzZXQ6IHRydWVcbiAgTWF0aEpheC5IdWIuQ29uZmlndXJlZCgpXG5cbiAgIyBOb3RpZnkgdXNlciBNYXRoSmF4IGhhcyBsb2FkZWRcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJMb2FkZWQgbWF0aHMgcmVuZGVyaW5nIGVuZ2luZSBNYXRoSmF4XCIgaWYgYXRvbS5pbkRldk1vZGUoKVxuXG4gIHJldHVyblxuXG4jXG4jIEF0dGFjaCBtYWluIE1hdGhKYXggc2NyaXB0IHRvIHRoZSBkb2N1bWVudFxuI1xuYXR0YWNoTWF0aEpheCA9IC0+XG4gICMgTm90aWZ5IHVzZXIgTWF0aEpheCBpcyBsb2FkaW5nXG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiTG9hZGluZyBtYXRocyByZW5kZXJpbmcgZW5naW5lIE1hdGhKYXhcIiBpZiBhdG9tLmluRGV2TW9kZSgpXG5cbiAgIyBBdHRhY2ggTWF0aEpheCBzY3JpcHRcbiAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpXG4gIHNjcmlwdC5zcmMgID0gXCIje3JlcXVpcmUucmVzb2x2ZSgnTWF0aEpheCcpfT9kZWxheVN0YXJ0dXBVbnRpbD1jb25maWd1cmVkXCJcbiAgc2NyaXB0LnR5cGUgPSBcInRleHQvamF2YXNjcmlwdFwiXG4gIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyIFwibG9hZFwiLCAtPiBjb25maWd1cmVNYXRoSmF4KClcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKHNjcmlwdClcblxuICByZXR1cm4gc2NyaXB0XG4iXX0=
