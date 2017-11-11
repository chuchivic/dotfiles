Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _kernelspecs = require("kernelspecs");

var kernelspecs = _interopRequireWildcard(_kernelspecs);

var _spawnteract = require("spawnteract");

// $FlowFixMe

var _electron = require("electron");

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _utils = require("./utils");

var ks = kernelspecs;

exports.ks = ks;

var KernelManager = (function () {
  function KernelManager() {
    _classCallCheck(this, KernelManager);

    this.kernelSpecs = null;
  }

  _createClass(KernelManager, [{
    key: "startKernelFor",
    value: function startKernelFor(grammar, editor, filePath, onStarted) {
      var _this = this;

      this.getKernelSpecForGrammar(grammar).then(function (kernelSpec) {
        if (!kernelSpec) {
          var message = "No kernel for grammar `" + grammar.name + "` found";
          var description = "Check that the language for this file is set in Atom and that you have a Jupyter kernel installed for it.";
          atom.notifications.addError(message, { description: description });
          return;
        }

        _this.startKernel(kernelSpec, grammar, editor, filePath, onStarted);
      });
    }
  }, {
    key: "startKernel",
    value: function startKernel(kernelSpec, grammar, editor, filePath, onStarted) {
      var displayName = kernelSpec.display_name;

      // if kernel startup already in progress don't start additional kernel
      if (_store2["default"].startingKernels.get(displayName)) return;

      _store2["default"].startKernel(displayName);

      var currentPath = (0, _utils.getEditorDirectory)(editor);
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
        _store2["default"].newKernel(kernel, filePath, editor, grammar);
        if (onStarted) onStarted(kernel);
      });
    }
  }, {
    key: "update",
    value: _asyncToGenerator(function* () {
      var kernelSpecs = yield ks.findAll();
      this.kernelSpecs = _lodash2["default"].map(kernelSpecs, "spec");
      return this.kernelSpecs;
    })
  }, {
    key: "getAllKernelSpecs",
    value: _asyncToGenerator(function* (grammar) {
      if (this.kernelSpecs) return this.kernelSpecs;
      return this.updateKernelSpecs(grammar);
    })
  }, {
    key: "getAllKernelSpecsForGrammar",
    value: _asyncToGenerator(function* (grammar) {
      if (!grammar) return [];

      var kernelSpecs = yield this.getAllKernelSpecs(grammar);
      return kernelSpecs.filter(function (spec) {
        return (0, _utils.kernelSpecProvidesGrammar)(spec, grammar);
      });
    })
  }, {
    key: "getKernelSpecForGrammar",
    value: _asyncToGenerator(function* (grammar) {
      var _this2 = this;

      var kernelSpecs = yield this.getAllKernelSpecsForGrammar(grammar);
      if (kernelSpecs.length <= 1) {
        return kernelSpecs[0];
      }

      if (this.kernelPicker) {
        this.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        this.kernelPicker = new _kernelPicker2["default"](kernelSpecs);
      }

      return new Promise(function (resolve) {
        if (!_this2.kernelPicker) return resolve(null);
        _this2.kernelPicker.onConfirmed = function (kernelSpec) {
          return resolve(kernelSpec);
        };
        _this2.kernelPicker.toggle();
      });
    })
  }, {
    key: "updateKernelSpecs",
    value: _asyncToGenerator(function* (grammar) {
      var kernelSpecs = yield this.update();

      if (kernelSpecs.length === 0) {
        var message = "No Kernels Installed";
        var pythonDescription = grammar && /python/g.test(grammar.scopeName) ? "\n\nTo detect your current Python install you will need to run:<pre>python -m pip install ipykernel\npython -m ipykernel install --user</pre>" : "";
        var options = {
          description: "No kernels are installed on your system so you will not be able to execute code in any language." + pythonDescription,
          dismissable: true,
          buttons: [{
            text: "Install Instructions",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://nteract.gitbooks.io/hydrogen/docs/Installation.html");
            }
          }, {
            text: "Popular Kernels",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://nteract.io/kernels");
            }
          }, {
            text: "All Kernels",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://github.com/jupyter/jupyter/wiki/Jupyter-kernels");
            }
          }]
        };
        atom.notifications.addError(message, options);
      } else {
        var message = "Hydrogen Kernels updated:";
        var options = {
          detail: _lodash2["default"].map(kernelSpecs, "display_name").join("\n")
        };
        atom.notifications.addInfo(message, options);
      }
      return kernelSpecs;
    })
  }]);

  return KernelManager;
})();

exports.KernelManager = KernelManager;
exports["default"] = new KernelManager();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFYyxRQUFROzs7OzJCQUNPLGFBQWE7O0lBQTlCLFdBQVc7OzJCQUNJLGFBQWE7Ozs7d0JBRWxCLFVBQVU7O3lCQUVWLGNBQWM7Ozs7NEJBRVgsaUJBQWlCOzs7O3FCQUN4QixTQUFTOzs7O3FCQUN3QyxTQUFTOztBQUlyRSxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUM7Ozs7SUFFakIsYUFBYTtXQUFiLGFBQWE7MEJBQWIsYUFBYTs7U0FDeEIsV0FBVyxHQUF1QixJQUFJOzs7ZUFEM0IsYUFBYTs7V0FJVix3QkFDWixPQUFxQixFQUNyQixNQUF1QixFQUN2QixRQUFnQixFQUNoQixTQUFzQyxFQUN0Qzs7O0FBQ0EsVUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUN2RCxZQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsY0FBTSxPQUFPLCtCQUE4QixPQUFPLENBQUMsSUFBSSxZQUFVLENBQUM7QUFDbEUsY0FBTSxXQUFXLEdBQ2YsMkdBQTJHLENBQUM7QUFDOUcsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxFQUFYLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDdEQsaUJBQU87U0FDUjs7QUFFRCxjQUFLLFdBQVcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDcEUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUNULFVBQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLE1BQXVCLEVBQ3ZCLFFBQWdCLEVBQ2hCLFNBQXVDLEVBQ3ZDO0FBQ0EsVUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQzs7O0FBRzVDLFVB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QUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ3RELENBQUM7QUFDRixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDOUM7QUFDRCxhQUFPLFdBQVcsQ0FBQztLQUNwQjs7O1NBOUlVLGFBQWE7Ozs7cUJBaUpYLElBQUksYUFBYSxFQUFFIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIGtlcm5lbHNwZWNzIGZyb20gXCJrZXJuZWxzcGVjc1wiO1xuaW1wb3J0IHsgbGF1bmNoU3BlYyB9IGZyb20gXCJzcGF3bnRlcmFjdFwiO1xuLy8gJEZsb3dGaXhNZVxuaW1wb3J0IHsgc2hlbGwgfSBmcm9tIFwiZWxlY3Ryb25cIjtcblxuaW1wb3J0IFpNUUtlcm5lbCBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5cbmltcG9ydCBLZXJuZWxQaWNrZXIgZnJvbSBcIi4va2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgeyBnZXRFZGl0b3JEaXJlY3RvcnksIGtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIsIGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB0eXBlIHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL3ptcS1rZXJuZWxcIjtcblxuZXhwb3J0IGNvbnN0IGtzID0ga2VybmVsc3BlY3M7XG5cbmV4cG9ydCBjbGFzcyBLZXJuZWxNYW5hZ2VyIHtcbiAga2VybmVsU3BlY3M6ID9BcnJheTxLZXJuZWxzcGVjPiA9IG51bGw7XG4gIGtlcm5lbFBpY2tlcjogP0tlcm5lbFBpY2tlcjtcblxuICBzdGFydEtlcm5lbEZvcihcbiAgICBncmFtbWFyOiBhdG9tJEdyYW1tYXIsXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgZmlsZVBhdGg6IHN0cmluZyxcbiAgICBvblN0YXJ0ZWQ6IChrZXJuZWw6IFpNUUtlcm5lbCkgPT4gdm9pZFxuICApIHtcbiAgICB0aGlzLmdldEtlcm5lbFNwZWNGb3JHcmFtbWFyKGdyYW1tYXIpLnRoZW4oa2VybmVsU3BlYyA9PiB7XG4gICAgICBpZiAoIWtlcm5lbFNwZWMpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBObyBrZXJuZWwgZm9yIGdyYW1tYXIgXFxgJHtncmFtbWFyLm5hbWV9XFxgIGZvdW5kYDtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPVxuICAgICAgICAgIFwiQ2hlY2sgdGhhdCB0aGUgbGFuZ3VhZ2UgZm9yIHRoaXMgZmlsZSBpcyBzZXQgaW4gQXRvbSBhbmQgdGhhdCB5b3UgaGF2ZSBhIEp1cHl0ZXIga2VybmVsIGluc3RhbGxlZCBmb3IgaXQuXCI7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCB7IGRlc2NyaXB0aW9uIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhcnRLZXJuZWwoa2VybmVsU3BlYywgZ3JhbW1hciwgZWRpdG9yLCBmaWxlUGF0aCwgb25TdGFydGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0S2VybmVsKFxuICAgIGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyLFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgb25TdGFydGVkOiA/KGtlcm5lbDogWk1RS2VybmVsKSA9PiB2b2lkXG4gICkge1xuICAgIGNvbnN0IGRpc3BsYXlOYW1lID0ga2VybmVsU3BlYy5kaXNwbGF5X25hbWU7XG5cbiAgICAvLyBpZiBrZXJuZWwgc3RhcnR1cCBhbHJlYWR5IGluIHByb2dyZXNzIGRvbid0IHN0YXJ0IGFkZGl0aW9uYWwga2VybmVsXG4gICAgaWYgKHN0b3JlLnN0YXJ0aW5nS2VybmVscy5nZXQoZGlzcGxheU5hbWUpKSByZXR1cm47XG5cbiAgICBzdG9yZS5zdGFydEtlcm5lbChkaXNwbGF5TmFtZSk7XG5cbiAgICBsZXQgY3VycmVudFBhdGggPSBnZXRFZGl0b3JEaXJlY3RvcnkoZWRpdG9yKTtcbiAgICBsZXQgcHJvamVjdFBhdGg7XG5cbiAgICBsb2coXCJLZXJuZWxNYW5hZ2VyOiBzdGFydEtlcm5lbDpcIiwgZGlzcGxheU5hbWUpO1xuXG4gICAgc3dpdGNoIChhdG9tLmNvbmZpZy5nZXQoXCJIeWRyb2dlbi5zdGFydERpclwiKSkge1xuICAgICAgY2FzZSBcImZpcnN0UHJvamVjdERpclwiOlxuICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJwcm9qZWN0RGlyT2ZGaWxlXCI6XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGN1cnJlbnRQYXRoKVswXTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY29uc3Qga2VybmVsU3RhcnREaXIgPSBwcm9qZWN0UGF0aCAhPSBudWxsID8gcHJvamVjdFBhdGggOiBjdXJyZW50UGF0aDtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY3dkOiBrZXJuZWxTdGFydERpcixcbiAgICAgIHN0ZGlvOiBbXCJpZ25vcmVcIiwgXCJwaXBlXCIsIFwicGlwZVwiXVxuICAgIH07XG5cbiAgICBjb25zdCBrZXJuZWwgPSBuZXcgWk1RS2VybmVsKGtlcm5lbFNwZWMsIGdyYW1tYXIsIG9wdGlvbnMsICgpID0+IHtcbiAgICAgIHN0b3JlLm5ld0tlcm5lbChrZXJuZWwsIGZpbGVQYXRoLCBlZGl0b3IsIGdyYW1tYXIpO1xuICAgICAgaWYgKG9uU3RhcnRlZCkgb25TdGFydGVkKGtlcm5lbCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB1cGRhdGUoKSB7XG4gICAgY29uc3Qga2VybmVsU3BlY3MgPSBhd2FpdCBrcy5maW5kQWxsKCk7XG4gICAgdGhpcy5rZXJuZWxTcGVjcyA9IF8ubWFwKGtlcm5lbFNwZWNzLCBcInNwZWNcIik7XG4gICAgcmV0dXJuIHRoaXMua2VybmVsU3BlY3M7XG4gIH1cblxuICBhc3luYyBnZXRBbGxLZXJuZWxTcGVjcyhncmFtbWFyOiA/YXRvbSRHcmFtbWFyKSB7XG4gICAgaWYgKHRoaXMua2VybmVsU3BlY3MpIHJldHVybiB0aGlzLmtlcm5lbFNwZWNzO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZUtlcm5lbFNwZWNzKGdyYW1tYXIpO1xuICB9XG5cbiAgYXN5bmMgZ2V0QWxsS2VybmVsU3BlY3NGb3JHcmFtbWFyKGdyYW1tYXI6ID9hdG9tJEdyYW1tYXIpIHtcbiAgICBpZiAoIWdyYW1tYXIpIHJldHVybiBbXTtcblxuICAgIGNvbnN0IGtlcm5lbFNwZWNzID0gYXdhaXQgdGhpcy5nZXRBbGxLZXJuZWxTcGVjcyhncmFtbWFyKTtcbiAgICByZXR1cm4ga2VybmVsU3BlY3MuZmlsdGVyKHNwZWMgPT4ga2VybmVsU3BlY1Byb3ZpZGVzR3JhbW1hcihzcGVjLCBncmFtbWFyKSk7XG4gIH1cblxuICBhc3luYyBnZXRLZXJuZWxTcGVjRm9yR3JhbW1hcihncmFtbWFyOiBhdG9tJEdyYW1tYXIpIHtcbiAgICBjb25zdCBrZXJuZWxTcGVjcyA9IGF3YWl0IHRoaXMuZ2V0QWxsS2VybmVsU3BlY3NGb3JHcmFtbWFyKGdyYW1tYXIpO1xuICAgIGlmIChrZXJuZWxTcGVjcy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIGtlcm5lbFNwZWNzWzBdO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmtlcm5lbFBpY2tlcikge1xuICAgICAgdGhpcy5rZXJuZWxQaWNrZXIua2VybmVsU3BlY3MgPSBrZXJuZWxTcGVjcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXJuZWxQaWNrZXIgPSBuZXcgS2VybmVsUGlja2VyKGtlcm5lbFNwZWNzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoIXRoaXMua2VybmVsUGlja2VyKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgIHRoaXMua2VybmVsUGlja2VyLm9uQ29uZmlybWVkID0ga2VybmVsU3BlYyA9PiByZXNvbHZlKGtlcm5lbFNwZWMpO1xuICAgICAgdGhpcy5rZXJuZWxQaWNrZXIudG9nZ2xlKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVLZXJuZWxTcGVjcyhncmFtbWFyOiA/YXRvbSRHcmFtbWFyKSB7XG4gICAgY29uc3Qga2VybmVsU3BlY3MgPSBhd2FpdCB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgaWYgKGtlcm5lbFNwZWNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IFwiTm8gS2VybmVscyBJbnN0YWxsZWRcIjtcbiAgICAgIGNvbnN0IHB5dGhvbkRlc2NyaXB0aW9uID1cbiAgICAgICAgZ3JhbW1hciAmJiAvcHl0aG9uL2cudGVzdChncmFtbWFyLnNjb3BlTmFtZSlcbiAgICAgICAgICA/IFwiXFxuXFxuVG8gZGV0ZWN0IHlvdXIgY3VycmVudCBQeXRob24gaW5zdGFsbCB5b3Ugd2lsbCBuZWVkIHRvIHJ1bjo8cHJlPnB5dGhvbiAtbSBwaXAgaW5zdGFsbCBpcHlrZXJuZWxcXG5weXRob24gLW0gaXB5a2VybmVsIGluc3RhbGwgLS11c2VyPC9wcmU+XCJcbiAgICAgICAgICA6IFwiXCI7XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBkZXNjcmlwdGlvbjogYE5vIGtlcm5lbHMgYXJlIGluc3RhbGxlZCBvbiB5b3VyIHN5c3RlbSBzbyB5b3Ugd2lsbCBub3QgYmUgYWJsZSB0byBleGVjdXRlIGNvZGUgaW4gYW55IGxhbmd1YWdlLiR7cHl0aG9uRGVzY3JpcHRpb259YCxcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkluc3RhbGwgSW5zdHJ1Y3Rpb25zXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PlxuICAgICAgICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoXG4gICAgICAgICAgICAgICAgXCJodHRwczovL250ZXJhY3QuZ2l0Ym9va3MuaW8vaHlkcm9nZW4vZG9jcy9JbnN0YWxsYXRpb24uaHRtbFwiXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6IFwiUG9wdWxhciBLZXJuZWxzXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBzaGVsbC5vcGVuRXh0ZXJuYWwoXCJodHRwczovL250ZXJhY3QuaW8va2VybmVsc1wiKVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJBbGwgS2VybmVsc1wiLFxuICAgICAgICAgICAgb25EaWRDbGljazogKCkgPT5cbiAgICAgICAgICAgICAgc2hlbGwub3BlbkV4dGVybmFsKFxuICAgICAgICAgICAgICAgIFwiaHR0cHM6Ly9naXRodWIuY29tL2p1cHl0ZXIvanVweXRlci93aWtpL0p1cHl0ZXIta2VybmVsc1wiXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBcIkh5ZHJvZ2VuIEtlcm5lbHMgdXBkYXRlZDpcIjtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGRldGFpbDogXy5tYXAoa2VybmVsU3BlY3MsIFwiZGlzcGxheV9uYW1lXCIpLmpvaW4oXCJcXG5cIilcbiAgICAgIH07XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGtlcm5lbFNwZWNzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBLZXJuZWxNYW5hZ2VyKCk7XG4iXX0=