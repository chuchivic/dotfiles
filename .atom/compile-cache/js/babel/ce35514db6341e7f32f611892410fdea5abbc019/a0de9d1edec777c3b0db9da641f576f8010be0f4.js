Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _atom = require("atom");

var _mobx = require("mobx");

var _utils = require("./../utils");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require("./../config");

var _config2 = _interopRequireDefault(_config);

var _markers = require("./markers");

var _markers2 = _interopRequireDefault(_markers);

var _kernelManager = require("./../kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _kernel = require("./../kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var Store = (function () {
  var _instanceInitializers = {};

  function Store() {
    _classCallCheck(this, Store);

    this.subscriptions = new _atom.CompositeDisposable();
    this.markers = new _markers2["default"]();
    this.runningKernels = (0, _mobx.observable)([]);

    _defineDecoratedPropertyDescriptor(this, "kernelMapping", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "startingKernels", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "editor", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "grammar", _instanceInitializers);
  }

  _createDecoratedClass(Store, [{
    key: "startKernel",
    decorators: [_mobx.action],
    value: function startKernel(kernelDisplayName) {
      this.startingKernels.set(kernelDisplayName, true);
    }
  }, {
    key: "newKernel",
    decorators: [_mobx.action],
    value: function newKernel(kernel, filePath, editor, grammar) {
      if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
        var old = this.kernelMapping.get(filePath);
        var newMap = old && old instanceof _kernel2["default"] === false ? old : {};
        newMap[grammar.name] = kernel;
        this.kernelMapping.set(filePath, newMap);
      } else {
        this.kernelMapping.set(filePath, kernel);
      }
      var index = this.runningKernels.findIndex(function (k) {
        return k === kernel;
      });
      if (index === -1) {
        this.runningKernels.push(kernel);
      }
      // delete startingKernel since store.kernel now in place to prevent duplicate kernel
      this.startingKernels["delete"](kernel.kernelSpec.display_name);
    }
  }, {
    key: "deleteKernel",
    decorators: [_mobx.action],
    value: function deleteKernel(kernel) {
      var _this = this;

      this._iterateOverKernels(kernel, function (_, file) {
        _this.kernelMapping["delete"](file);
      }, function (map, _, grammar) {
        map[grammar] = null;
        delete map[grammar];
      });

      this.runningKernels.remove(kernel);
    }
  }, {
    key: "_iterateOverKernels",
    value: function _iterateOverKernels(kernel, func) {
      var func2 = arguments.length <= 2 || arguments[2] === undefined ? func : arguments[2];
      return (function () {
        this.kernelMapping.forEach(function (kernelOrObj, file) {
          if (kernelOrObj === kernel) {
            func(kernel, file);
          }

          if (kernelOrObj instanceof _kernel2["default"] === false) {
            _lodash2["default"].forEach(kernelOrObj, function (k, grammar) {
              if (k === kernel) {
                func2(kernelOrObj, file, grammar);
              }
            });
          }
        });
      }).apply(this, arguments);
    }
  }, {
    key: "getFilesForKernel",
    value: function getFilesForKernel(kernel) {
      var files = [];
      this._iterateOverKernels(kernel, function (_, file) {
        return files.push(file);
      });
      return files;
    }
  }, {
    key: "dispose",
    decorators: [_mobx.action],
    value: function dispose() {
      this.subscriptions.dispose();
      this.markers.clear();
      this.runningKernels.forEach(function (kernel) {
        return kernel.destroy();
      });
      this.runningKernels.clear();
      this.kernelMapping.clear();
    }
  }, {
    key: "updateEditor",
    decorators: [_mobx.action],
    value: function updateEditor(editor) {
      this.editor = editor;
      this.setGrammar(editor);
    }
  }, {
    key: "setGrammar",
    decorators: [_mobx.action],
    value: function setGrammar(editor) {
      if (!editor) {
        this.grammar = null;
        return;
      }

      var grammar = editor.getGrammar();

      if ((0, _utils.isMultilanguageGrammar)(grammar)) {
        var embeddedScope = (0, _utils.getEmbeddedScope)(editor, editor.getCursorBufferPosition());

        if (embeddedScope) {
          var scope = embeddedScope.replace(".embedded", "");
          grammar = atom.grammars.grammarForScopeName(scope);
        }
      }

      this.grammar = grammar;
    }
  }, {
    key: "kernelMapping",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return new Map();
    },
    enumerable: true
  }, {
    key: "startingKernels",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return new Map();
    },
    enumerable: true
  }, {
    key: "editor",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return atom.workspace.getActiveTextEditor();
    },
    enumerable: true
  }, {
    key: "grammar",
    decorators: [_mobx.observable],
    initializer: null,
    enumerable: true
  }, {
    key: "kernel",
    decorators: [_mobx.computed],
    get: function get() {
      if (!this.filePath) return null;
      var kernel = this.kernelMapping.get(this.filePath);
      if (!kernel || kernel instanceof _kernel2["default"]) return kernel;
      if (this.grammar) return kernel[this.grammar.name];
    }
  }, {
    key: "filePath",
    decorators: [_mobx.computed],
    get: function get() {
      return this.editor ? this.editor.getPath() : null;
    }
  }], null, _instanceInitializers);

  return Store;
})();

var store = new Store();
exports["default"] = store;

// For debugging
window.hydrogen_store = store;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O29CQUNHLE1BQU07O3FCQUNNLFlBQVk7O3NCQUN2RCxRQUFROzs7O3NCQUVILGFBQWE7Ozs7dUJBQ1IsV0FBVzs7Ozs2QkFDVCxxQkFBcUI7Ozs7c0JBQzVCLGFBQWE7Ozs7SUFJMUIsS0FBSzs7O1dBQUwsS0FBSzswQkFBTCxLQUFLOztTQUNULGFBQWEsR0FBRywrQkFBeUI7U0FDekMsT0FBTyxHQUFHLDBCQUFpQjtTQUMzQixjQUFjLEdBQTZCLHNCQUFXLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7d0JBSHJELEtBQUs7OztXQXVCRSxxQkFBQyxpQkFBeUIsRUFBRTtBQUNyQyxVQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuRDs7OztXQUdRLG1CQUNQLE1BQWMsRUFDZCxRQUFnQixFQUNoQixNQUF1QixFQUN2QixPQUFxQixFQUNyQjtBQUNBLFVBQUksbUNBQXVCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLFlBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLFlBQU0sTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLCtCQUFrQixLQUFLLEtBQUssR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2pFLGNBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDO0FBQzlCLFlBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztPQUMxQyxNQUFNO0FBQ0wsWUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQzFDO0FB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TUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQ2pDLENBQUM7O0FBRUYsWUFBSSxhQUFhLEVBQUU7QUFDakIsY0FBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDckQsaUJBQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3BEO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7S0FDeEI7Ozs7O2FBN0gwQyxJQUFJLEdBQUcsRUFBRTs7Ozs7OzthQUNBLElBQUksR0FBRyxFQUFFOzs7Ozs7O2FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUU7Ozs7Ozs7Ozs7O1NBSS9DLGVBQVk7QUFDcEIsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDaEMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JELFVBQUksQ0FBQyxNQUFNLElBQUksTUFBTSwrQkFBa0IsRUFBRSxPQUFPLE1BQU0sQ0FBQztBQUN2RCxVQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwRDs7OztTQUdXLGVBQVk7QUFDdEIsYUFBTyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0tBQ25EOzs7U0FwQkcsS0FBSzs7O0FBb0lYLElBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7cUJBQ1gsS0FBSzs7O0FBR3BCLE1BQU0sQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xuaW1wb3J0IHsgb2JzZXJ2YWJsZSwgY29tcHV0ZWQsIGFjdGlvbiB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgeyBpc011bHRpbGFuZ3VhZ2VHcmFtbWFyLCBnZXRFbWJlZGRlZFNjb3BlIH0gZnJvbSBcIi4vLi4vdXRpbHNcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi8uLi9jb25maWdcIjtcbmltcG9ydCBNYXJrZXJTdG9yZSBmcm9tIFwiLi9tYXJrZXJzXCI7XG5pbXBvcnQga2VybmVsTWFuYWdlciBmcm9tIFwiLi8uLi9rZXJuZWwtbWFuYWdlclwiO1xuaW1wb3J0IEtlcm5lbCBmcm9tIFwiLi8uLi9rZXJuZWxcIjtcblxuaW1wb3J0IHR5cGUgeyBJT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSBcIm1vYnhcIjtcblxuY2xhc3MgU3RvcmUge1xuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgbWFya2VycyA9IG5ldyBNYXJrZXJTdG9yZSgpO1xuICBydW5uaW5nS2VybmVsczogSU9ic2VydmFibGVBcnJheTxLZXJuZWw+ID0gb2JzZXJ2YWJsZShbXSk7XG4gIEBvYnNlcnZhYmxlIGtlcm5lbE1hcHBpbmc6IEtlcm5lbE1hcHBpbmcgPSBuZXcgTWFwKCk7XG4gIEBvYnNlcnZhYmxlIHN0YXJ0aW5nS2VybmVsczogTWFwPHN0cmluZywgYm9vbGVhbj4gPSBuZXcgTWFwKCk7XG4gIEBvYnNlcnZhYmxlIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgQG9ic2VydmFibGUgZ3JhbW1hcjogP2F0b20kR3JhbW1hcjtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IGtlcm5lbCgpOiA/S2VybmVsIHtcbiAgICBpZiAoIXRoaXMuZmlsZVBhdGgpIHJldHVybiBudWxsO1xuICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMua2VybmVsTWFwcGluZy5nZXQodGhpcy5maWxlUGF0aCk7XG4gICAgaWYgKCFrZXJuZWwgfHwga2VybmVsIGluc3RhbmNlb2YgS2VybmVsKSByZXR1cm4ga2VybmVsO1xuICAgIGlmICh0aGlzLmdyYW1tYXIpIHJldHVybiBrZXJuZWxbdGhpcy5ncmFtbWFyLm5hbWVdO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBmaWxlUGF0aCgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IgPyB0aGlzLmVkaXRvci5nZXRQYXRoKCkgOiBudWxsO1xuICB9XG5cbiAgQGFjdGlvblxuICBzdGFydEtlcm5lbChrZXJuZWxEaXNwbGF5TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zdGFydGluZ0tlcm5lbHMuc2V0KGtlcm5lbERpc3BsYXlOYW1lLCB0cnVlKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgbmV3S2VybmVsKFxuICAgIGtlcm5lbDogS2VybmVsLFxuICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyXG4gICkge1xuICAgIGlmIChpc011bHRpbGFuZ3VhZ2VHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpKSB7XG4gICAgICBjb25zdCBvbGQgPSB0aGlzLmtlcm5lbE1hcHBpbmcuZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IG5ld01hcCA9IG9sZCAmJiBvbGQgaW5zdGFuY2VvZiBLZXJuZWwgPT09IGZhbHNlID8gb2xkIDoge307XG4gICAgICBuZXdNYXBbZ3JhbW1hci5uYW1lXSA9IGtlcm5lbDtcbiAgICAgIHRoaXMua2VybmVsTWFwcGluZy5zZXQoZmlsZVBhdGgsIG5ld01hcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMua2VybmVsTWFwcGluZy5zZXQoZmlsZVBhdGgsIGtlcm5lbCk7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5ydW5uaW5nS2VybmVscy5maW5kSW5kZXgoayA9PiBrID09PSBrZXJuZWwpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIHRoaXMucnVubmluZ0tlcm5lbHMucHVzaChrZXJuZWwpO1xuICAgIH1cbiAgICAvLyBkZWxldGUgc3RhcnRpbmdLZXJuZWwgc2luY2Ugc3RvcmUua2VybmVsIG5vdyBpbiBwbGFjZSB0byBwcmV2ZW50IGR1cGxpY2F0ZSBrZXJuZWxcbiAgICB0aGlzLnN0YXJ0aW5nS2VybmVscy5kZWxldGUoa2VybmVsLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgZGVsZXRlS2VybmVsKGtlcm5lbDogS2VybmVsKSB7XG4gICAgdGhpcy5faXRlcmF0ZU92ZXJLZXJuZWxzKFxuICAgICAga2VybmVsLFxuICAgICAgKF8sIGZpbGUpID0+IHtcbiAgICAgICAgdGhpcy5rZXJuZWxNYXBwaW5nLmRlbGV0ZShmaWxlKTtcbiAgICAgIH0sXG4gICAgICAobWFwLCBfLCBncmFtbWFyKSA9PiB7XG4gICAgICAgIG1hcFtncmFtbWFyXSA9IG51bGw7XG4gICAgICAgIGRlbGV0ZSBtYXBbZ3JhbW1hcl07XG4gICAgICB9XG4gICAgKTtcblxuICAgIHRoaXMucnVubmluZ0tlcm5lbHMucmVtb3ZlKGtlcm5lbCk7XG4gIH1cblxuICBfaXRlcmF0ZU92ZXJLZXJuZWxzKFxuICAgIGtlcm5lbDogS2VybmVsLFxuICAgIGZ1bmM6IChrZXJuZWw6IEtlcm5lbCB8IEtlcm5lbE9iaiwgZmlsZTogc3RyaW5nKSA9PiBtaXhlZCxcbiAgICBmdW5jMjogKG9iajogS2VybmVsT2JqLCBmaWxlOiBzdHJpbmcsIGdyYW1tYXI6IHN0cmluZykgPT4gbWl4ZWQgPSBmdW5jXG4gICkge1xuICAgIHRoaXMua2VybmVsTWFwcGluZy5mb3JFYWNoKChrZXJuZWxPck9iaiwgZmlsZSkgPT4ge1xuICAgICAgaWYgKGtlcm5lbE9yT2JqID09PSBrZXJuZWwpIHtcbiAgICAgICAgZnVuYyhrZXJuZWwsIGZpbGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoa2VybmVsT3JPYmogaW5zdGFuY2VvZiBLZXJuZWwgPT09IGZhbHNlKSB7XG4gICAgICAgIF8uZm9yRWFjaChrZXJuZWxPck9iaiwgKGssIGdyYW1tYXIpID0+IHtcbiAgICAgICAgICBpZiAoayA9PT0ga2VybmVsKSB7XG4gICAgICAgICAgICBmdW5jMihrZXJuZWxPck9iaiwgZmlsZSwgZ3JhbW1hcik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEZpbGVzRm9yS2VybmVsKGtlcm5lbDogS2VybmVsKSB7XG4gICAgY29uc3QgZmlsZXMgPSBbXTtcbiAgICB0aGlzLl9pdGVyYXRlT3Zlcktlcm5lbHMoa2VybmVsLCAoXywgZmlsZSkgPT4gZmlsZXMucHVzaChmaWxlKSk7XG4gICAgcmV0dXJuIGZpbGVzO1xuICB9XG5cbiAgQGFjdGlvblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5tYXJrZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5ydW5uaW5nS2VybmVscy5mb3JFYWNoKGtlcm5lbCA9PiBrZXJuZWwuZGVzdHJveSgpKTtcbiAgICB0aGlzLnJ1bm5pbmdLZXJuZWxzLmNsZWFyKCk7XG4gICAgdGhpcy5rZXJuZWxNYXBwaW5nLmNsZWFyKCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHVwZGF0ZUVkaXRvcihlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLnNldEdyYW1tYXIoZWRpdG9yKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0R3JhbW1hcihlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IpIHtcbiAgICBpZiAoIWVkaXRvcikge1xuICAgICAgdGhpcy5ncmFtbWFyID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG5cbiAgICBpZiAoaXNNdWx0aWxhbmd1YWdlR3JhbW1hcihncmFtbWFyKSkge1xuICAgICAgY29uc3QgZW1iZWRkZWRTY29wZSA9IGdldEVtYmVkZGVkU2NvcGUoXG4gICAgICAgIGVkaXRvcixcbiAgICAgICAgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICk7XG5cbiAgICAgIGlmIChlbWJlZGRlZFNjb3BlKSB7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gZW1iZWRkZWRTY29wZS5yZXBsYWNlKFwiLmVtYmVkZGVkXCIsIFwiXCIpO1xuICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdyYW1tYXIgPSBncmFtbWFyO1xuICB9XG59XG5cbmNvbnN0IHN0b3JlID0gbmV3IFN0b3JlKCk7XG5leHBvcnQgZGVmYXVsdCBzdG9yZTtcblxuLy8gRm9yIGRlYnVnZ2luZ1xud2luZG93Lmh5ZHJvZ2VuX3N0b3JlID0gc3RvcmU7XG4iXX0=