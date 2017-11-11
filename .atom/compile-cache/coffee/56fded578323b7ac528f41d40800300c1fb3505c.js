(function() {
  var $, CSON, _, attachMathJax, checkMacros, configureMathJax, createMacrosTemplate, fs, getUserMacrosPath, loadMacrosFile, loadUserMacros, namePattern, path, valueMatchesPattern;

  $ = require('atom-space-pen-views').$;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYXRoamF4LWhlbHBlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0E7QUFBQSxNQUFBOztFQUFDLElBQVMsT0FBQSxDQUFRLHNCQUFSOztFQUNWLElBQUEsR0FBVSxPQUFBLENBQVEsTUFBUjs7RUFDVixJQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0VBQ1YsRUFBQSxHQUFVLE9BQUEsQ0FBUSxTQUFSOztFQUNWLENBQUEsR0FBVSxPQUFBLENBQVEsaUJBQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FPRTtJQUFBLFdBQUEsRUFBYSxTQUFDLFFBQUQ7QUFDWCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxhQUFELENBQUE7TUFDVCxJQUFHLGdCQUFIO1FBQWtCLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxTQUFBO2lCQUFHLFFBQUEsQ0FBQTtRQUFILENBQWhDLEVBQWxCOztJQUZXLENBQWI7SUFRQSxhQUFBLEVBQWUsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFBO2FBQUcsYUFBQSxDQUFBO0lBQUgsQ0FBUCxDQVJmO0lBYUEsWUFBQSxFQUFjLFNBQUE7TUFFWixDQUFBLENBQUUsMkJBQUYsQ0FBOEIsQ0FBQyxNQUEvQixDQUFBO01BQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7YUFHakIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFBO2VBQUcsYUFBQSxDQUFBO01BQUgsQ0FBUDtJQU5MLENBYmQ7SUE0QkEsYUFBQSxFQUFlLFNBQUMsV0FBRDtNQUNiLElBQUcsa0RBQUg7UUFDSyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxTQUFELEVBQVksT0FBTyxDQUFDLEdBQXBCLEVBQXlCLFdBQXpCLENBQWxCLEVBREw7T0FB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InNvdXJjZXNDb250ZW50IjpbIiNcbiMgbWF0aGpheC1oZWxwZXJcbiNcbiMgVGhpcyBtb2R1bGUgd2lsbCBoYW5kbGUgbG9hZGluZyB0aGUgTWF0aEpheCBlbnZpcm9ubWVudCBhbmQgcHJvdmlkZSBhIHdyYXBwZXJcbiMgZm9yIGNhbGxzIHRvIE1hdGhKYXggdG8gcHJvY2VzcyBMYVRlWCBlcXVhdGlvbnMuXG4jXG5cbnskfSAgICAgPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggICAgPSByZXF1aXJlICdwYXRoJ1xuQ1NPTiAgICA9IHJlcXVpcmUgJ3NlYXNvbidcbmZzICAgICAgPSByZXF1aXJlICdmcy1wbHVzJ1xuXyAgICAgICA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjXG4gICMgTG9hZCBNYXRoSmF4IGVudmlyb25tZW50XG4gICNcbiAgIyBAcGFyYW0gbGlzdGVuZXIgT3B0aW9uYWwgbWV0aG9kIHRvIGNhbGwgd2hlbiB0aGUgTWF0aEpheCBzY3JpcHQgd2FzIGJlZW5cbiAgIyAgIGxvYWRlZCB0byB0aGUgd2luZG93LiBUaGUgbWV0aG9kIGlzIHBhc3NlZCBubyBhcmd1bWVudHMuXG4gICNcbiAgbG9hZE1hdGhKYXg6IChsaXN0ZW5lcikgLT5cbiAgICBzY3JpcHQgPSBAYXR0YWNoTWF0aEpheCgpXG4gICAgaWYgbGlzdGVuZXI/IHRoZW4gc2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIgXCJsb2FkXCIsIC0+IGxpc3RlbmVyKClcbiAgICByZXR1cm5cblxuICAjXG4gICMgQXR0YWNoIG1haW4gTWF0aEpheCBzY3JpcHQgdG8gdGhlIGRvY3VtZW50XG4gICNcbiAgYXR0YWNoTWF0aEpheDogXy5vbmNlIC0+IGF0dGFjaE1hdGhKYXgoKVxuXG4gICNcbiAgIyBSZW1vdmUgTWF0aEpheCBmcm9tIHRoZSBkb2N1bWVudCBhbmQgcmVzZXQgYXR0YWNoIG1ldGhvZFxuICAjXG4gIHJlc2V0TWF0aEpheDogLT5cbiAgICAjIERldGFjaCBNYXRoSmF4IGZyb20gdGhlIGRvY3VtZW50XG4gICAgJCgnc2NyaXB0W3NyYyo9XCJNYXRoSmF4LmpzXCJdJykucmVtb3ZlKClcbiAgICB3aW5kb3cuTWF0aEpheCA9IHVuZGVmaW5lZFxuXG4gICAgIyBSZXNldCBhdHRhY2ggZm9yIGFueSBzdWJzZXF1ZW50IGNhbGxzXG4gICAgQGF0dGFjaE1hdGhKYXggPSBfLm9uY2UgLT4gYXR0YWNoTWF0aEpheCgpXG5cbiAgI1xuICAjIFByb2Nlc3MgRE9NIGVsZW1lbnRzIGZvciBMYVRlWCBlcXVhdGlvbnMgd2l0aCBNYXRoSmF4XG4gICNcbiAgIyBAcGFyYW0gZG9tRWxlbWVudHMgQW4gYXJyYXkgb2YgRE9NIGVsZW1lbnRzIHRvIGJlIHByb2Nlc3NlZCBieSBNYXRoSmF4LiBTZWVcbiAgIyAgIFtlbGVtZW50XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvZWxlbWVudCkgZm9yXG4gICMgICBkZXRhaWxzIG9uIERPTSBlbGVtZW50cy5cbiAgI1xuICBtYXRoUHJvY2Vzc29yOiAoZG9tRWxlbWVudHMpIC0+XG4gICAgaWYgTWF0aEpheD9cbiAgICB0aGVuIE1hdGhKYXguSHViLlF1ZXVlIFtcIlR5cGVzZXRcIiwgTWF0aEpheC5IdWIsIGRvbUVsZW1lbnRzXVxuICAgIGVsc2UgQGxvYWRNYXRoSmF4IC0+IE1hdGhKYXguSHViLlF1ZXVlIFtcIlR5cGVzZXRcIiwgTWF0aEpheC5IdWIsIGRvbUVsZW1lbnRzXVxuICAgIHJldHVyblxuXG4gICNcbiAgIyBQcm9jZXNzIG1hdGhzIGluIEhUTUwgZnJhZ21lbnQgd2l0aCBNYXRoSmF4XG4gICNcbiAgIyBAcGFyYW0gaHRtbCBBIEhUTUwgZnJhZ21lbnQgc3RyaW5nXG4gICMgQHBhcmFtIGNhbGxiYWNrIEEgY2FsbGJhY2sgbWV0aG9kIHRoYXQgYWNjZXB0cyBhIHNpbmdsZSBwYXJhbWV0ZXIsIGEgSFRNTFxuICAjICAgZnJhZ21lbnQgc3RyaW5nIHRoYXQgaXMgdGhlIHJlc3VsdCBvZiBodG1sIHByb2Nlc3NlZCBieSBNYXRoSmF4XG4gICNcbiAgcHJvY2Vzc0hUTUxTdHJpbmc6IChodG1sLCBjYWxsYmFjaykgLT5cbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGh0bWxcblxuICAgIGNvbXBpbGVQcm9jZXNzZWRIVE1MU3RyaW5nID0gLT5cbiAgICAgIHN2Z0dseXBocyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdNYXRoSmF4X1NWR19IaWRkZW4nKT8ucGFyZW50Tm9kZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIGVsZW1lbnQuaW5zZXJ0QmVmb3JlKHN2Z0dseXBocywgZWxlbWVudC5maXJzdENoaWxkKSBpZiBzdmdHbHlwaHM/XG4gICAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUxcblxuICAgIHF1ZXVlUHJvY2Vzc0hUTUxTdHJpbmcgPSAtPlxuICAgICAgTWF0aEpheC5IdWIuUXVldWUoXG4gICAgICAgIFtcInNldFJlbmRlcmVyXCIsIE1hdGhKYXguSHViLCBcIlNWR1wiXSxcbiAgICAgICAgW1wiVHlwZXNldFwiLCBNYXRoSmF4Lkh1YiwgZWxlbWVudF0sXG4gICAgICAgIFtcInNldFJlbmRlcmVyXCIsIE1hdGhKYXguSHViLCBcIkhUTUwtQ1NTXCJdLFxuICAgICAgICBbIC0+IGNhbGxiYWNrIGNvbXBpbGVQcm9jZXNzZWRIVE1MU3RyaW5nKCldXG4gICAgICApXG5cbiAgICBpZiBNYXRoSmF4P1xuICAgIHRoZW4gcXVldWVQcm9jZXNzSFRNTFN0cmluZygpXG4gICAgZWxzZSBAbG9hZE1hdGhKYXggcXVldWVQcm9jZXNzSFRNTFN0cmluZ1xuXG4gICAgcmV0dXJuXG5cbiNcbiMgRGVmaW5lIHNvbWUgZnVuY3Rpb25zIHRvIGhlbHAgZ2V0IGEgaG9sZCBvZiB0aGUgdXNlcidzIExhdGV4XG4jIE1hY3Jvcy5cbiNcbm5hbWVQYXR0ZXJuID0gLy8vICAgICAgICAgICAgICMgVGhlIG5hbWUgb2YgYSBtYWNybyBjYW4gYmUgZWl0aGVyXG4gICAgICAgICAgICAgIF5bXmEtekEtWlxcZFxcc10kICMgYSBzaW5nbGUgbm9uLWFscGhhbnVtZXJpYyBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICMgb3JcbiAgICAgICAgICAgICAgXlthLXpBLVpdKiQgICAgICMgYW55IG51bWJlciBvZiBsb3dlciBhbmQgdXBwZXIgY2FzZVxuICAgICAgICAgICAgICAvLy8gICAgICAgICAgICAgIyBsZXR0ZXJzLCBidXQgbm8gbnVtZXJhbHMuXG5cbmdldFVzZXJNYWNyb3NQYXRoID0gLT5cbiAgdXNlck1hY3Jvc1BhdGggPSAgQ1NPTi5yZXNvbHZlKHBhdGguam9pbihhdG9tLmdldENvbmZpZ0RpclBhdGgoKSwgJ21hcmtkb3duLXByZXZpZXctcGx1cycpKVxuICB1c2VyTWFjcm9zUGF0aCA/IHBhdGguam9pbihhdG9tLmdldENvbmZpZ0RpclBhdGgoKSwgJ21hcmtkb3duLXByZXZpZXctcGx1cy5jc29uJylcblxubG9hZE1hY3Jvc0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIHJldHVybiB7fSB1bmxlc3MgQ1NPTi5pc09iamVjdFBhdGgoZmlsZVBhdGgpXG4gIENTT04ucmVhZEZpbGVTeW5jIGZpbGVQYXRoLCAoZXJyb3IsIG9iamVjdD17fSkgLT5cbiAgICBpZiBlcnJvcj9cbiAgICAgIGNvbnNvbGUud2FybiBcIkVycm9yIHJlYWRpbmcgTGF0ZXggTWFjcm9zIGZpbGUgJyN7ZmlsZVBhdGh9JzogI3tlcnJvci5zdGFjayA/IGVycm9yfVwiXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnM/LmFkZEVycm9yKFwiRmFpbGVkIHRvIGxvYWQgTGF0ZXggTWFjcm9zIGZyb20gJyN7ZmlsZVBhdGh9J1wiLCB7ZGV0YWlsOiBlcnJvci5tZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgb2JqZWN0XG5cbmxvYWRVc2VyTWFjcm9zID0gLT5cbiAgdXNlck1hY3Jvc1BhdGggPSBnZXRVc2VyTWFjcm9zUGF0aCgpXG4gIGlmIGZzLmlzRmlsZVN5bmModXNlck1hY3Jvc1BhdGgpXG4gICAgcmVzdWx0ID0gbG9hZE1hY3Jvc0ZpbGUodXNlck1hY3Jvc1BhdGgpXG4gIGVsc2VcbiAgICBjb25zb2xlLmxvZyBcIkNyZWF0aW5nIG1hcmtkb3duLXByZXZpZXctcGx1cy5jc29uLCB0aGlzIGlzIGEgb25lLXRpbWUgb3BlcmF0aW9uLlwiXG4gICAgY3JlYXRlTWFjcm9zVGVtcGxhdGUodXNlck1hY3Jvc1BhdGgpXG4gICAgcmVzdWx0ID0gbG9hZE1hY3Jvc0ZpbGUodXNlck1hY3Jvc1BhdGgpXG5cbmNyZWF0ZU1hY3Jvc1RlbXBsYXRlID0gKGZpbGVQYXRoKSAtPlxuICB0ZW1wbGF0ZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uL2Fzc2V0cy9tYWNyb3MtdGVtcGxhdGUuY3NvblwiKVxuICB0ZW1wbGF0ZUZpbGUgPSBmcy5yZWFkRmlsZVN5bmMgdGVtcGxhdGVQYXRoLCAndXRmOCdcbiAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgdGVtcGxhdGVGaWxlXG5cbmNoZWNrTWFjcm9zID0gKG1hY3Jvc09iamVjdCkgLT5cbiAgZm9yIG5hbWUsIHZhbHVlIG9mIG1hY3Jvc09iamVjdFxuICAgIHVubGVzcyBuYW1lLm1hdGNoKG5hbWVQYXR0ZXJuKSBhbmQgdmFsdWVNYXRjaGVzUGF0dGVybih2YWx1ZSlcbiAgICAgIGRlbGV0ZSBtYWNyb3NPYmplY3RbbmFtZV1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucz8uYWRkRXJyb3IoXCJGYWlsZWQgdG8gbG9hZCBMYVRlWCBtYWNybyBuYW1lZCAnI3tuYW1lfScuIFBsZWFzZSBzZWUgdGhlIFtMYVRlWCBndWlkZV0oaHR0cHM6Ly9naXRodWIuY29tL0dhbGFkaXJpdGgvbWFya2Rvd24tcHJldmlldy1wbHVzL2Jsb2IvbWFzdGVyL0xBVEVYLm1kI21hY3JvLW5hbWVzKVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICBtYWNyb3NPYmplY3RcblxudmFsdWVNYXRjaGVzUGF0dGVybiA9ICh2YWx1ZSkgLT5cbiAgIyBEaWZmZXJlbnQgY2hlY2sgYmFzZWQgb24gd2hldGhlciB2YWx1ZSBpcyBzdHJpbmcgb3IgYXJyYXlcbiAgc3dpdGNoXG4gICAgIyBJZiBpdCBpcyBhbiBhcnJheSB0aGVuIGl0IHNob3VsZCBiZSBbc3RyaW5nLCBpbnRlZ2VyXVxuICAgIHdoZW4gT2JqZWN0Ojp0b1N0cmluZy5jYWxsKHZhbHVlKSBpcyAnW29iamVjdCBBcnJheV0nXG4gICAgICBtYWNyb0RlZmluaXRpb24gPSB2YWx1ZVswXVxuICAgICAgbnVtYmVyT2ZBcmdzID0gdmFsdWVbMV1cbiAgICAgIGlmIHR5cGVvZiBudW1iZXJPZkFyZ3MgIGlzICdudW1iZXInXG4gICAgICAgIG51bWJlck9mQXJncyAlIDEgaXMgMCBhbmQgdHlwZW9mIG1hY3JvRGVmaW5pdGlvbiBpcyAnc3RyaW5nJ1xuICAgICAgZWxzZVxuICAgICAgICBmYWxzZVxuICAgICMgSWYgaXQgaXMganVzdCBhIHN0cmluZyB0aGVuIHRoYXQncyBPSywgYW55IHN0cmluZyBpcyBhY2NlcHRhYmxlXG4gICAgd2hlbiB0eXBlb2YgdmFsdWUgaXMgJ3N0cmluZydcbiAgICAgIHRydWVcbiAgICBlbHNlIGZhbHNlXG5cbiMgQ29uZmlndXJlIE1hdGhKYXggZW52aXJvbm1lbnQuIFNpbWlsYXIgdG8gdGhlIFRlWC1BTVNfSFRNTCBjb25maWd1cmF0aW9uIHdpdGhcbiMgYSBmZXcgdW5uZWNlc3NhcnkgZmVhdHVyZXMgc3RyaXBwZWQgYXdheVxuI1xuY29uZmlndXJlTWF0aEpheCA9IC0+XG4gIHVzZXJNYWNyb3MgPSBsb2FkVXNlck1hY3JvcygpXG4gIGlmIHVzZXJNYWNyb3NcbiAgICB1c2VyTWFjcm9zID0gY2hlY2tNYWNyb3ModXNlck1hY3JvcylcbiAgZWxzZVxuICAgIHVzZXJNYWNyb3MgPSB7fVxuXG4gICNOb3cgQ29uZmlndXJlIE1hdGhKYXhcbiAgTWF0aEpheC5IdWIuQ29uZmlnXG4gICAgamF4OiBbXG4gICAgICBcImlucHV0L1RlWFwiLFxuICAgICAgXCJvdXRwdXQvSFRNTC1DU1NcIlxuICAgIF1cbiAgICBleHRlbnNpb25zOiBbXVxuICAgIFRlWDpcbiAgICAgIGV4dGVuc2lvbnM6IFtcbiAgICAgICAgXCJBTVNtYXRoLmpzXCIsXG4gICAgICAgIFwiQU1Tc3ltYm9scy5qc1wiLFxuICAgICAgICBcIm5vRXJyb3JzLmpzXCIsXG4gICAgICAgIFwibm9VbmRlZmluZWQuanNcIlxuICAgICAgXVxuICAgICAgTWFjcm9zOiB1c2VyTWFjcm9zXG4gICAgXCJIVE1MLUNTU1wiOlxuICAgICAgYXZhaWxhYmxlRm9udHM6IFtdXG4gICAgICB3ZWJGb250OiBcIlRlWFwiXG4gICAgbWVzc2FnZVN0eWxlOiBcIm5vbmVcIlxuICAgIHNob3dNYXRoTWVudTogZmFsc2VcbiAgICBza2lwU3RhcnR1cFR5cGVzZXQ6IHRydWVcbiAgTWF0aEpheC5IdWIuQ29uZmlndXJlZCgpXG5cbiAgIyBOb3RpZnkgdXNlciBNYXRoSmF4IGhhcyBsb2FkZWRcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJMb2FkZWQgbWF0aHMgcmVuZGVyaW5nIGVuZ2luZSBNYXRoSmF4XCIgaWYgYXRvbS5pbkRldk1vZGUoKVxuXG4gIHJldHVyblxuXG4jXG4jIEF0dGFjaCBtYWluIE1hdGhKYXggc2NyaXB0IHRvIHRoZSBkb2N1bWVudFxuI1xuYXR0YWNoTWF0aEpheCA9IC0+XG4gICMgTm90aWZ5IHVzZXIgTWF0aEpheCBpcyBsb2FkaW5nXG4gIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiTG9hZGluZyBtYXRocyByZW5kZXJpbmcgZW5naW5lIE1hdGhKYXhcIiBpZiBhdG9tLmluRGV2TW9kZSgpXG5cbiAgIyBBdHRhY2ggTWF0aEpheCBzY3JpcHRcbiAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpXG4gIHNjcmlwdC5zcmMgID0gXCIje3JlcXVpcmUucmVzb2x2ZSgnTWF0aEpheCcpfT9kZWxheVN0YXJ0dXBVbnRpbD1jb25maWd1cmVkXCJcbiAgc2NyaXB0LnR5cGUgPSBcInRleHQvamF2YXNjcmlwdFwiXG4gIHNjcmlwdC5hZGRFdmVudExpc3RlbmVyIFwibG9hZFwiLCAtPiBjb25maWd1cmVNYXRoSmF4KClcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKHNjcmlwdClcblxuICByZXR1cm4gc2NyaXB0XG4iXX0=
