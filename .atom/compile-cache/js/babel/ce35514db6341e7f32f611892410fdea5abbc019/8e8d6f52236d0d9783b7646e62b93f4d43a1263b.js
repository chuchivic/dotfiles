Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _child_process = require("child_process");

var _spawnteract = require("spawnteract");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _utils = require("./utils");

var KernelManager = (function () {
  function KernelManager() {
    _classCallCheck(this, KernelManager);

    this._kernelSpecs = this.getKernelSpecsFromSettings();
  }

  _createClass(KernelManager, [{
    key: "startKernelFor",
    value: function startKernelFor(grammar, editor, onStarted) {
      var _this = this;

      this.getKernelSpecForGrammar(grammar, function (kernelSpec) {
        if (!kernelSpec) {
          var message = "No kernel for grammar `" + grammar.name + "` found";
          var description = "Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it.";
          atom.notifications.addError(message, { description: description });
          return;
        }

        _this.startKernel(kernelSpec, grammar, onStarted);
      });
    }
  }, {
    key: "startKernel",
    value: function startKernel(kernelSpec, grammar, onStarted) {
      var displayName = kernelSpec.display_name;

      // if kernel startup already in progress don't start additional kernel
      if (_store2["default"].startingKernels.get(displayName)) return;

      _store2["default"].startKernel(displayName);

      var currentPath = (0, _utils.getEditorDirectory)(_store2["default"].editor);
      var projectPath = undefined;

      (0, _utils.log)("KernelManager: startKernel:", displayName);

      switch (atom.config.get("Hydrogen.startDir")) {
        case "firstProjectDir":
          projectPath = atom.project.getPaths()[0];
          break;
        case "projectDirOfFile":
          projectPath = atom.project.relativizePath(currentPath)[0];
          break;
      }

      var kernelStartDir = projectPath != null ? projectPath : currentPath;
      var options = {
        cwd: kernelStartDir,
        stdio: ["ignore", "pipe", "pipe"]
      };

      var kernel = new _zmqKernel2["default"](kernelSpec, grammar, options, function () {
        _store2["default"].newKernel(kernel);
        if (onStarted) onStarted(kernel);
      });
    }
  }, {
    key: "getAllKernelSpecs",
    value: function getAllKernelSpecs(callback) {
      var _this2 = this;

      if (_lodash2["default"].isEmpty(this._kernelSpecs)) {
        return this.updateKernelSpecs(function () {
          return callback(_lodash2["default"].map(_this2._kernelSpecs, "spec"));
        });
      }
      return callback(_lodash2["default"].map(this._kernelSpecs, "spec"));
    }
  }, {
    key: "getAllKernelSpecsForGrammar",
    value: function getAllKernelSpecsForGrammar(grammar, callback) {
      var _this3 = this;

      if (grammar) {
        return this.getAllKernelSpecs(function (kernelSpecs) {
          var specs = kernelSpecs.filter(function (spec) {
            return _this3.kernelSpecProvidesGrammar(spec, grammar);
          });

          return callback(specs);
        });
      }
      return callback([]);
    }
  }, {
    key: "getKernelSpecForGrammar",
    value: function getKernelSpecForGrammar(grammar, callback) {
      var _this4 = this;

      this.getAllKernelSpecsForGrammar(grammar, function (kernelSpecs) {
        if (kernelSpecs.length <= 1) {
          callback(kernelSpecs[0]);
          return;
        }

        if (_this4.kernelPicker) {
          _this4.kernelPicker.kernelSpecs = kernelSpecs;
        } else {
          _this4.kernelPicker = new _kernelPicker2["default"](kernelSpecs);
        }

        _this4.kernelPicker.onConfirmed = function (kernelSpec) {
          return callback(kernelSpec);
        };
        _this4.kernelPicker.toggle();
      });
    }
  }, {
    key: "kernelSpecProvidesLanguage",
    value: function kernelSpecProvidesLanguage(kernelSpec, grammarLanguage) {
      return kernelSpec.language.toLowerCase() === grammarLanguage.toLowerCase();
    }
  }, {
    key: "kernelSpecProvidesGrammar",
    value: function kernelSpecProvidesGrammar(kernelSpec, grammar) {
      if (!grammar || !grammar.name || !kernelSpec || !kernelSpec.language) {
        return false;
      }
      var grammarLanguage = grammar.name.toLowerCase();
      var kernelLanguage = kernelSpec.language.toLowerCase();
      if (kernelLanguage === grammarLanguage) {
        return true;
      }

      var mappedLanguage = _config2["default"].getJson("languageMappings")[kernelLanguage];
      if (!mappedLanguage) {
        return false;
      }

      return mappedLanguage.toLowerCase() === grammarLanguage;
    }
  }, {
    key: "getKernelSpecsFromSettings",
    value: function getKernelSpecsFromSettings() {
      var settings = _config2["default"].getJson("kernelspec");

      if (!settings.kernelspecs) {
        return {};
      }

      // remove invalid entries
      return _lodash2["default"].pickBy(settings.kernelspecs, function (_ref) {
        var spec = _ref.spec;
        return spec && spec.language && spec.display_name && spec.argv;
      });
    }
  }, {
    key: "mergeKernelSpecs",
    value: function mergeKernelSpecs(kernelSpecs) {
      _lodash2["default"].assign(this._kernelSpecs, kernelSpecs);
    }
  }, {
    key: "updateKernelSpecs",
    value: function updateKernelSpecs(callback) {
      var _this5 = this;

      this._kernelSpecs = this.getKernelSpecsFromSettings();
      this.getKernelSpecsFromJupyter(function (err, kernelSpecsFromJupyter) {
        if (!err) {
          _this5.mergeKernelSpecs(kernelSpecsFromJupyter);
        }

        if (_lodash2["default"].isEmpty(_this5._kernelSpecs)) {
          var message = "No kernel specs found";
          var options = {
            description: "Use kernelSpec option in Hydrogen or update IPython/Jupyter to a version that supports: `jupyter kernelspec list --json` or `ipython kernelspec list --json`",
            dismissable: true
          };
          atom.notifications.addError(message, options);
        } else {
          err = null;
          var message = "Hydrogen Kernels updated:";
          var options = {
            detail: _lodash2["default"].map(_this5._kernelSpecs, "spec.display_name").join("\n")
          };
          atom.notifications.addInfo(message, options);
        }

        if (callback) callback(err, _this5._kernelSpecs);
      });
    }
  }, {
    key: "getKernelSpecsFromJupyter",
    value: function getKernelSpecsFromJupyter(callback) {
      var _this6 = this;

      var jupyter = "jupyter kernelspec list --json --log-level=CRITICAL";
      var ipython = "ipython kernelspec list --json --log-level=CRITICAL";

      return this.getKernelSpecsFrom(jupyter, function (jupyterError, kernelSpecs) {
        if (!jupyterError) {
          return callback(jupyterError, kernelSpecs);
        }

        return _this6.getKernelSpecsFrom(ipython, function (ipythonError, specs) {
          if (!ipythonError) {
            return callback(ipythonError, specs);
          }
          return callback(jupyterError, specs);
        });
      });
    }
  }, {
    key: "getKernelSpecsFrom",
    value: function getKernelSpecsFrom(command, callback) {
      var options = { killSignal: "SIGINT" };
      var kernelSpecs = undefined;
      return (0, _child_process.exec)(command, options, function (err, stdout) {
        if (!err) {
          try {
            kernelSpecs = JSON.parse(stdout.toString()).kernelspecs;
          } catch (error) {
            err = error;
            (0, _utils.log)("Could not parse kernelspecs:", err);
          }
        }

        return callback(err, kernelSpecs);
      });
    }
  }]);

  return KernelManager;
})();

exports["default"] = new KernelManager();
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3NCQUVjLFFBQVE7Ozs7NkJBQ0QsZUFBZTs7MkJBQ1QsYUFBYTs7a0JBQ3pCLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztzQkFFSixVQUFVOzs7O3lCQUNQLGNBQWM7Ozs7NEJBRVgsaUJBQWlCOzs7O3FCQUN4QixTQUFTOzs7O3FCQUNhLFNBQVM7O0lBSTNDLGFBQWE7QUFHTixXQUhQLGFBQWEsR0FHSDswQkFIVixhQUFhOztBQUlmLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7R0FDdkQ7O2VBTEcsYUFBYTs7V0FPSCx3QkFDWixPQUFxQixFQUNyQixNQUF1QixFQUN2QixTQUFzQyxFQUN0Qzs7O0FBQ0EsVUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxVQUFBLFVBQVUsRUFBSTtBQUNsRCxZQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsY0FBTSxPQUFPLCtCQUE4QixPQUFPLENBQUMsSUFBSSxZQUFVLENBQUM7QUFDbEUsY0FBTSxXQUFXLEdBQ2YsMkdBQTJHLENBQUM7QUFDOUcsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFYLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDdEQsaUJBQU87U0FDUjs7QUFFRCxjQUFLLFdBQVcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO09BQ2xELENBQUMsQ0FBQztLQUNKOzs7V0FFVSxxQkFDVCxVQUFzQixFQUN0QixPQUFxQixFQUNyQixTQUF1QyxFQUN2QztBQUNBLFVBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7OztBQUc1QyxVQUFJLG1CQUFNLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsT0FBTzs7QUFFbkQseUJBQU0sV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUvQixVQUFJLFdBQVcsR0FBRywrQkFBbUIsbUJBQU0sTUFBTSxDQUFDLENBQUM7QUFDbkQsVUFBSSxXQUFXLFlBQUEsQ0FBQzs7QUFFaEIsc0JBQUksNkJBQTZCLEVBQUUsV0FBVyxDQUFDLENBQUM7O0FBRWhELGNBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7QUFDMUMsYUFBSyxpQkFBaUI7QUFDcEIscUJBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGdCQUFNO0FBQUEsQUFDUixhQUFLLGtCQUFrQjtBQUNyQixxQkFBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFELGdCQUFNO0FBQUEsT0FDVDs7QUFFRCxVQUFNLGNBQWMsR0FBRyxXQUFXLElBQUksSUFBSSxHQUFHLFdBQVcsR0FBRyxXQUFXLENBQUM7QUFDdkUsVUFBTSxPQUFPLEdBQUc7QUFDZCxXQUFHLEVBQUUsY0FBYztBQUNuQixhQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztPQUNsQyxDQUFDOztBQUVGLFVBQU0sTUFBTSxHQUFHLDJCQUFjLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQU07QUFDL0QsMkJBQU0sU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLFlBQUksU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNsQyxDQUFDLENBQUM7S0FDSjs7O1dBRWdCLDJCQUFDLFFBQWtCLEVBQUU7OztBQUNwQyxVQUFJLG9CQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7QUFDaEMsZUFBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7aUJBQzVCLFFBQVEsQ0FBQyxvQkFBRSxHQUFHLENBQUMsT0FBSyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FBQSxDQUMzQyxDQUFDO09BQ0g7QUFDRCxhQUFPLFFBQVEsQ0FBQyxvQkFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFMEIscUNBQUMsT0FBc0IsRUFBRSxRQUFrQixFQUFFOzs7QUFDdEUsVUFBSSxPQUFPLEVBQUU7QUFDWCxlQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUMzQyxjQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTttQkFDbkMsT0FBSyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO1dBQUEsQ0FDOUMsQ0FBQzs7QUFFRixpQkFBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDeEIsQ0FBQyxDQUFDO09BQ0o7QUFDRCxhQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNyQjs7O1dBRXNCLGlDQUFDLE9BQXFCLEVBQUUsUUFBa0IsRUFBRTs7O0FBQ2pFLFVBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsVUFBQSxXQUFXLEVBQUk7QUFDdkQsWUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtBQUMzQixrQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLGlCQUFPO1NBQ1I7O0FBRUQsWUFBSSxPQUFLLFlBQVksRUFBRTtBQUNyQixpQkFBSyxZQUFZLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztTQUM3QyxNQUFNO0FBQ0wsaUJBQUssWUFBWSxHQUFHLDhCQUFpQixXQUFXLENBQUMsQ0FBQztTQUNuRDs7QUFFRCxlQUFLLFlBQVksQ0FBQyxXQUFXLEdBQUcsVUFBQSxVQUFVO2lCQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUM7U0FBQSxDQUFDO0FBQ25FLGVBQUssWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQzVCLENBQUMsQ0FBQztLQUNKOzs7V0FFeUIsb0NBQUMsVUFBc0IsRUFBRSxlQUF1QixFQUFFO0FBQzFFLGFBQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsS0FBSyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDNUU7OztXQUV3QixtQ0FBQyxVQUFzQixFQUFFLE9BQXNCLEVBQUU7QUFDeEUsVUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFO0FBQ3BFLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxVQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25ELFVBQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDekQsVUFBSSxjQUFjLEtBQUssZUFBZSxFQUFFO0FBQ3RDLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxjQUFjLEdBQUcsb0JBQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDMUUsVUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixlQUFPLEtBQUssQ0FBQztPQUNkOztBQUVELGFBQU8sY0FBYyxDQUFDLFdBQVcsRUFBRSxLQUFLLGVBQWUsQ0FBQztLQUN6RDs7O1dBRXlCLHNDQUFHO0FBQzNCLFVBQU0sUUFBUSxHQUFHLG9CQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFOUMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUU7QUFDekIsZUFBTyxFQUFFLENBQUM7T0FDWDs7O0FBR0QsYUFBTyxvQkFBRSxNQUFNLENBQ2IsUUFBUSxDQUFDLFdBQVcsRUFDcEIsVUFBQyxJQUFRO1lBQU4sSUFBSSxHQUFOLElBQVEsQ0FBTixJQUFJO2VBQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsSUFBSTtPQUFBLENBQ3RFLENBQUM7S0FDSDs7O1dBRWUsMEJBQUMsV0FBdUIsRUFBRTtBQUN4QywwQkFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztLQUMxQzs7O1dBRWdCLDJCQUFDLFFBQW1CLEVBQUU7OztBQUNyQyxVQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0FBQ3RELFVBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFDLEdBQUcsRUFBRSxzQkFBc0IsRUFBSztBQUM5RCxZQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsaUJBQUssZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUMvQzs7QUFFRCxZQUFJLG9CQUFFLE9BQU8sQ0FBQyxPQUFLLFlBQVksQ0FBQyxFQUFFO0FBQ2hDLGNBQU0sT0FBTyxHQUFHLHVCQUF1QixDQUFDO0FBQ3hDLGNBQU0sT0FBTyxHQUFHO0FBQ2QsdUJBQVcsRUFDVCw4SkFBOEo7QUFDaEssdUJBQVcsRUFBRSxJQUFJO1dBQ2xCLENBQUM7QUFDRixjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDL0MsTUFBTTtBQUNMLGFBQUcsR0FBRyxJQUFJLENBQUM7QUFDWCxjQUFNLE9BQU8sR0FBRywyQkFBMkIsQ0FBQztBQUM1QyxjQUFNLE9BQU8sR0FBRztBQUNkLGtCQUFNLEVBQUUsb0JBQUUsR0FBRyxDQUFDLE9BQUssWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztXQUNqRSxDQUFDO0FBQ0YsY0FBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQzlDOztBQUVELFlBQUksUUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBSyxZQUFZLENBQUMsQ0FBQztPQUNoRCxDQUFDLENBQUM7S0FDSjs7O1dBRXdCLG1DQUFDLFFBQWtCLEVBQUU7OztBQUM1QyxVQUFNLE9BQU8sR0FBRyxxREFBcUQsQ0FBQztBQUN0RSxVQUFNLE9BQU8sR0FBRyxxREFBcUQsQ0FBQzs7QUFFdEUsYUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFVBQUMsWUFBWSxFQUFFLFdBQVcsRUFBSztBQUNyRSxZQUFJLENBQUMsWUFBWSxFQUFFO0FBQ2pCLGlCQUFPLFFBQVEsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDNUM7O0FBRUQsZUFBTyxPQUFLLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxVQUFDLFlBQVksRUFBRSxLQUFLLEVBQUs7QUFDL0QsY0FBSSxDQUFDLFlBQVksRUFBRTtBQUNqQixtQkFBTyxRQUFRLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1dBQ3RDO0FBQ0QsaUJBQU8sUUFBUSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUN0QyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1dBRWlCLDRCQUFDLE9BQWUsRUFBRSxRQUFrQixFQUFFO0FBQ3RELFVBQU0sT0FBTyxHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxDQUFDO0FBQ3pDLFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsYUFBTyx5QkFBSyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBSztBQUM3QyxZQUFJLENBQUMsR0FBRyxFQUFFO0FBQ1IsY0FBSTtBQUNGLHVCQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUM7V0FDekQsQ0FBQyxPQUFPLEtBQUssRUFBRTtBQUNkLGVBQUcsR0FBRyxLQUFLLENBQUM7QUFDWiw0QkFBSSw4QkFBOEIsRUFBRSxHQUFHLENBQUMsQ0FBQztXQUMxQztTQUNGOztBQUVELGVBQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztPQUNuQyxDQUFDLENBQUM7S0FDSjs7O1NBNU1HLGFBQWE7OztxQkErTUosSUFBSSxhQUFhLEVBQUUiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2tlcm5lbC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgeyBsYXVuY2hTcGVjIH0gZnJvbSBcInNwYXdudGVyYWN0XCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IFpNUUtlcm5lbCBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5cbmltcG9ydCBLZXJuZWxQaWNrZXIgZnJvbSBcIi4va2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBnZXRFZGl0b3JEaXJlY3RvcnksIGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB0eXBlIHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL3ptcS1rZXJuZWxcIjtcblxuY2xhc3MgS2VybmVsTWFuYWdlciB7XG4gIF9rZXJuZWxTcGVjczogP09iamVjdDtcbiAga2VybmVsUGlja2VyOiA/S2VybmVsUGlja2VyO1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9rZXJuZWxTcGVjcyA9IHRoaXMuZ2V0S2VybmVsU3BlY3NGcm9tU2V0dGluZ3MoKTtcbiAgfVxuXG4gIHN0YXJ0S2VybmVsRm9yKFxuICAgIGdyYW1tYXI6IGF0b20kR3JhbW1hcixcbiAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICBvblN0YXJ0ZWQ6IChrZXJuZWw6IFpNUUtlcm5lbCkgPT4gdm9pZFxuICApIHtcbiAgICB0aGlzLmdldEtlcm5lbFNwZWNGb3JHcmFtbWFyKGdyYW1tYXIsIGtlcm5lbFNwZWMgPT4ge1xuICAgICAgaWYgKCFrZXJuZWxTcGVjKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm8ga2VybmVsIGZvciBncmFtbWFyIFxcYCR7Z3JhbW1hci5uYW1lfVxcYCBmb3VuZGA7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID1cbiAgICAgICAgICBcIkNoZWNrIHRoYXQgdGhlIGxhbmd1YWdlIGZvciB0aGlzIGZpbGUgaXMgc2V0IGluIEF0b20gYW5kIHRoYXQgeW91IGhhdmUgYSBKdXB5dGVyIGtlcm5lbCBpbnN0YWxsZWQgZm9yIGl0LlwiO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgeyBkZXNjcmlwdGlvbiB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXJ0S2VybmVsKGtlcm5lbFNwZWMsIGdyYW1tYXIsIG9uU3RhcnRlZCk7XG4gICAgfSk7XG4gIH1cblxuICBzdGFydEtlcm5lbChcbiAgICBrZXJuZWxTcGVjOiBLZXJuZWxzcGVjLFxuICAgIGdyYW1tYXI6IGF0b20kR3JhbW1hcixcbiAgICBvblN0YXJ0ZWQ6ID8oa2VybmVsOiBaTVFLZXJuZWwpID0+IHZvaWRcbiAgKSB7XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBrZXJuZWxTcGVjLmRpc3BsYXlfbmFtZTtcblxuICAgIC8vIGlmIGtlcm5lbCBzdGFydHVwIGFscmVhZHkgaW4gcHJvZ3Jlc3MgZG9uJ3Qgc3RhcnQgYWRkaXRpb25hbCBrZXJuZWxcbiAgICBpZiAoc3RvcmUuc3RhcnRpbmdLZXJuZWxzLmdldChkaXNwbGF5TmFtZSkpIHJldHVybjtcblxuICAgIHN0b3JlLnN0YXJ0S2VybmVsKGRpc3BsYXlOYW1lKTtcblxuICAgIGxldCBjdXJyZW50UGF0aCA9IGdldEVkaXRvckRpcmVjdG9yeShzdG9yZS5lZGl0b3IpO1xuICAgIGxldCBwcm9qZWN0UGF0aDtcblxuICAgIGxvZyhcIktlcm5lbE1hbmFnZXI6IHN0YXJ0S2VybmVsOlwiLCBkaXNwbGF5TmFtZSk7XG5cbiAgICBzd2l0Y2ggKGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLnN0YXJ0RGlyXCIpKSB7XG4gICAgICBjYXNlIFwiZmlyc3RQcm9qZWN0RGlyXCI6XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInByb2plY3REaXJPZkZpbGVcIjpcbiAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoY3VycmVudFBhdGgpWzBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBrZXJuZWxTdGFydERpciA9IHByb2plY3RQYXRoICE9IG51bGwgPyBwcm9qZWN0UGF0aCA6IGN1cnJlbnRQYXRoO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IGtlcm5lbFN0YXJ0RGlyLFxuICAgICAgc3RkaW86IFtcImlnbm9yZVwiLCBcInBpcGVcIiwgXCJwaXBlXCJdXG4gICAgfTtcblxuICAgIGNvbnN0IGtlcm5lbCA9IG5ldyBaTVFLZXJuZWwoa2VybmVsU3BlYywgZ3JhbW1hciwgb3B0aW9ucywgKCkgPT4ge1xuICAgICAgc3RvcmUubmV3S2VybmVsKGtlcm5lbCk7XG4gICAgICBpZiAob25TdGFydGVkKSBvblN0YXJ0ZWQoa2VybmVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEFsbEtlcm5lbFNwZWNzKGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIGlmIChfLmlzRW1wdHkodGhpcy5fa2VybmVsU3BlY3MpKSB7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVLZXJuZWxTcGVjcygoKSA9PlxuICAgICAgICBjYWxsYmFjayhfLm1hcCh0aGlzLl9rZXJuZWxTcGVjcywgXCJzcGVjXCIpKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGxiYWNrKF8ubWFwKHRoaXMuX2tlcm5lbFNwZWNzLCBcInNwZWNcIikpO1xuICB9XG5cbiAgZ2V0QWxsS2VybmVsU3BlY3NGb3JHcmFtbWFyKGdyYW1tYXI6ID9hdG9tJEdyYW1tYXIsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIGlmIChncmFtbWFyKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRBbGxLZXJuZWxTcGVjcyhrZXJuZWxTcGVjcyA9PiB7XG4gICAgICAgIGNvbnN0IHNwZWNzID0ga2VybmVsU3BlY3MuZmlsdGVyKHNwZWMgPT5cbiAgICAgICAgICB0aGlzLmtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIoc3BlYywgZ3JhbW1hcilcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gY2FsbGJhY2soc3BlY3MpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBjYWxsYmFjayhbXSk7XG4gIH1cblxuICBnZXRLZXJuZWxTcGVjRm9yR3JhbW1hcihncmFtbWFyOiBhdG9tJEdyYW1tYXIsIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIHRoaXMuZ2V0QWxsS2VybmVsU3BlY3NGb3JHcmFtbWFyKGdyYW1tYXIsIGtlcm5lbFNwZWNzID0+IHtcbiAgICAgIGlmIChrZXJuZWxTcGVjcy5sZW5ndGggPD0gMSkge1xuICAgICAgICBjYWxsYmFjayhrZXJuZWxTcGVjc1swXSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMua2VybmVsUGlja2VyKSB7XG4gICAgICAgIHRoaXMua2VybmVsUGlja2VyLmtlcm5lbFNwZWNzID0ga2VybmVsU3BlY3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmtlcm5lbFBpY2tlciA9IG5ldyBLZXJuZWxQaWNrZXIoa2VybmVsU3BlY3MpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci5vbkNvbmZpcm1lZCA9IGtlcm5lbFNwZWMgPT4gY2FsbGJhY2soa2VybmVsU3BlYyk7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci50b2dnbGUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGtlcm5lbFNwZWNQcm92aWRlc0xhbmd1YWdlKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsIGdyYW1tYXJMYW5ndWFnZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGtlcm5lbFNwZWMubGFuZ3VhZ2UudG9Mb3dlckNhc2UoKSA9PT0gZ3JhbW1hckxhbmd1YWdlLnRvTG93ZXJDYXNlKCk7XG4gIH1cblxuICBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsIGdyYW1tYXI6ID9hdG9tJEdyYW1tYXIpIHtcbiAgICBpZiAoIWdyYW1tYXIgfHwgIWdyYW1tYXIubmFtZSB8fCAha2VybmVsU3BlYyB8fCAha2VybmVsU3BlYy5sYW5ndWFnZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBncmFtbWFyTGFuZ3VhZ2UgPSBncmFtbWFyLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICBjb25zdCBrZXJuZWxMYW5ndWFnZSA9IGtlcm5lbFNwZWMubGFuZ3VhZ2UudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoa2VybmVsTGFuZ3VhZ2UgPT09IGdyYW1tYXJMYW5ndWFnZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgbWFwcGVkTGFuZ3VhZ2UgPSBDb25maWcuZ2V0SnNvbihcImxhbmd1YWdlTWFwcGluZ3NcIilba2VybmVsTGFuZ3VhZ2VdO1xuICAgIGlmICghbWFwcGVkTGFuZ3VhZ2UpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwcGVkTGFuZ3VhZ2UudG9Mb3dlckNhc2UoKSA9PT0gZ3JhbW1hckxhbmd1YWdlO1xuICB9XG5cbiAgZ2V0S2VybmVsU3BlY3NGcm9tU2V0dGluZ3MoKSB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBDb25maWcuZ2V0SnNvbihcImtlcm5lbHNwZWNcIik7XG5cbiAgICBpZiAoIXNldHRpbmdzLmtlcm5lbHNwZWNzKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGludmFsaWQgZW50cmllc1xuICAgIHJldHVybiBfLnBpY2tCeShcbiAgICAgIHNldHRpbmdzLmtlcm5lbHNwZWNzLFxuICAgICAgKHsgc3BlYyB9KSA9PiBzcGVjICYmIHNwZWMubGFuZ3VhZ2UgJiYgc3BlYy5kaXNwbGF5X25hbWUgJiYgc3BlYy5hcmd2XG4gICAgKTtcbiAgfVxuXG4gIG1lcmdlS2VybmVsU3BlY3Moa2VybmVsU3BlY3M6IEtlcm5lbHNwZWMpIHtcbiAgICBfLmFzc2lnbih0aGlzLl9rZXJuZWxTcGVjcywga2VybmVsU3BlY3MpO1xuICB9XG5cbiAgdXBkYXRlS2VybmVsU3BlY3MoY2FsbGJhY2s6ID9GdW5jdGlvbikge1xuICAgIHRoaXMuX2tlcm5lbFNwZWNzID0gdGhpcy5nZXRLZXJuZWxTcGVjc0Zyb21TZXR0aW5ncygpO1xuICAgIHRoaXMuZ2V0S2VybmVsU3BlY3NGcm9tSnVweXRlcigoZXJyLCBrZXJuZWxTcGVjc0Zyb21KdXB5dGVyKSA9PiB7XG4gICAgICBpZiAoIWVycikge1xuICAgICAgICB0aGlzLm1lcmdlS2VybmVsU3BlY3Moa2VybmVsU3BlY3NGcm9tSnVweXRlcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChfLmlzRW1wdHkodGhpcy5fa2VybmVsU3BlY3MpKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBcIk5vIGtlcm5lbCBzcGVjcyBmb3VuZFwiO1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgXCJVc2Uga2VybmVsU3BlYyBvcHRpb24gaW4gSHlkcm9nZW4gb3IgdXBkYXRlIElQeXRob24vSnVweXRlciB0byBhIHZlcnNpb24gdGhhdCBzdXBwb3J0czogYGp1cHl0ZXIga2VybmVsc3BlYyBsaXN0IC0tanNvbmAgb3IgYGlweXRob24ga2VybmVsc3BlYyBsaXN0IC0tanNvbmBcIixcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnIgPSBudWxsO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gXCJIeWRyb2dlbiBLZXJuZWxzIHVwZGF0ZWQ6XCI7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgZGV0YWlsOiBfLm1hcCh0aGlzLl9rZXJuZWxTcGVjcywgXCJzcGVjLmRpc3BsYXlfbmFtZVwiKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIH07XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGVyciwgdGhpcy5fa2VybmVsU3BlY3MpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0S2VybmVsU3BlY3NGcm9tSnVweXRlcihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBjb25zdCBqdXB5dGVyID0gXCJqdXB5dGVyIGtlcm5lbHNwZWMgbGlzdCAtLWpzb24gLS1sb2ctbGV2ZWw9Q1JJVElDQUxcIjtcbiAgICBjb25zdCBpcHl0aG9uID0gXCJpcHl0aG9uIGtlcm5lbHNwZWMgbGlzdCAtLWpzb24gLS1sb2ctbGV2ZWw9Q1JJVElDQUxcIjtcblxuICAgIHJldHVybiB0aGlzLmdldEtlcm5lbFNwZWNzRnJvbShqdXB5dGVyLCAoanVweXRlckVycm9yLCBrZXJuZWxTcGVjcykgPT4ge1xuICAgICAgaWYgKCFqdXB5dGVyRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGp1cHl0ZXJFcnJvciwga2VybmVsU3BlY3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRLZXJuZWxTcGVjc0Zyb20oaXB5dGhvbiwgKGlweXRob25FcnJvciwgc3BlY3MpID0+IHtcbiAgICAgICAgaWYgKCFpcHl0aG9uRXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soaXB5dGhvbkVycm9yLCBzcGVjcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGp1cHl0ZXJFcnJvciwgc3BlY3MpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRLZXJuZWxTcGVjc0Zyb20oY29tbWFuZDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICBjb25zdCBvcHRpb25zID0geyBraWxsU2lnbmFsOiBcIlNJR0lOVFwiIH07XG4gICAgbGV0IGtlcm5lbFNwZWNzO1xuICAgIHJldHVybiBleGVjKGNvbW1hbmQsIG9wdGlvbnMsIChlcnIsIHN0ZG91dCkgPT4ge1xuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBrZXJuZWxTcGVjcyA9IEpTT04ucGFyc2Uoc3Rkb3V0LnRvU3RyaW5nKCkpLmtlcm5lbHNwZWNzO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGVyciA9IGVycm9yO1xuICAgICAgICAgIGxvZyhcIkNvdWxkIG5vdCBwYXJzZSBrZXJuZWxzcGVjczpcIiwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FsbGJhY2soZXJyLCBrZXJuZWxTcGVjcyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEtlcm5lbE1hbmFnZXIoKTtcbiJdfQ==