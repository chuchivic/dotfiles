Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _atom = require("atom");

var _mobx = require("mobx");

var _utils = require("./../utils");

var _config = require("./../config");

var _config2 = _interopRequireDefault(_config);

var _markers = require("./markers");

var _markers2 = _interopRequireDefault(_markers);

var _kernelManager = require("./../kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var Store = (function () {
  var _instanceInitializers = {};

  function Store() {
    _classCallCheck(this, Store);

    this.subscriptions = new _atom.CompositeDisposable();
    this.markers = new _markers2["default"]();

    _defineDecoratedPropertyDescriptor(this, "startingKernels", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "runningKernels", _instanceInitializers);

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
    value: function newKernel(kernel) {
      var mappedLanguage = _config2["default"].getJson("languageMappings")[kernel.language] || kernel.language;
      this.runningKernels.set(mappedLanguage, kernel);
      // delete startingKernel since store.kernel now in place to prevent duplicate kernel
      this.startingKernels["delete"](kernel.kernelSpec.display_name);
    }
  }, {
    key: "deleteKernel",
    decorators: [_mobx.action],
    value: function deleteKernel(kernel) {
      for (var _ref3 of this.runningKernels.entries()) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var language = _ref2[0];
        var runningKernel = _ref2[1];

        if (kernel === runningKernel) {
          this.runningKernels["delete"](language);
        }
      }
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
      this.runningKernels = new Map();
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
    key: "startingKernels",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return new Map();
    },
    enumerable: true
  }, {
    key: "runningKernels",
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
      for (var kernel of this.runningKernels.values()) {
        var kernelSpec = kernel.kernelSpec;
        if (_kernelManager2["default"].kernelSpecProvidesGrammar(kernelSpec, this.grammar)) {
          return kernel;
        }
      }
      return null;
    }
  }], null, _instanceInitializers);

  return Store;
})();

var store = new Store();
exports["default"] = store;

// For debugging
window.hydrogen_store = store;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFb0MsTUFBTTs7b0JBQ0csTUFBTTs7cUJBQ00sWUFBWTs7c0JBRWxELGFBQWE7Ozs7dUJBQ1IsV0FBVzs7Ozs2QkFDVCxxQkFBcUI7Ozs7SUFHekMsS0FBSzs7O1dBQUwsS0FBSzswQkFBTCxLQUFLOztTQUNULGFBQWEsR0FBRywrQkFBeUI7U0FDekMsT0FBTyxHQUFHLDBCQUFpQjs7Ozs7Ozs7Ozs7d0JBRnZCLEtBQUs7OztXQW9CRSxxQkFBQyxpQkFBeUIsRUFBRTtBQUNyQyxVQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuRDs7OztXQUdRLG1CQUFDLE1BQWMsRUFBRTtBQUN4QixVQUFNLGNBQWMsR0FDbEIsb0JBQU8sT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDekUsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUVoRCxVQUFJLENBQUMsZUFBZSxVQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM3RDs7OztXQUdXLHNCQUFDLE1BQWMsRUFBRTtBQUMzQix3QkFBc0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsRUFBRTs7O1lBQTNELFFBQVE7WUFBRSxhQUFhOztBQUMvQixZQUFJLE1BQU0sS0FBSyxhQUFhLEVBQUU7QUFDNUIsY0FBSSxDQUFDLGNBQWMsVUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3RDO09BQ0Y7S0FDRjs7OztXQUdNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3JCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtlQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7T0FBQSxDQUFDLENBQUM7QUFDeEQsVUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0tBQ2pDOzs7O1dBR1csc0JBQUMsTUFBd0IsRUFBRTtBQUNyQyxVQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixVQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3pCOzs7O1dBR1Msb0JBQUMsTUFBd0IsRUFBRTtBQUNuQyxVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsZUFBTztPQUNSOztBQUVELFVBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7QUFFbEMsVUFBSSxtQ0FBdUIsT0FBTyxDQUFDLEVBQUU7QUFDbkMsWUFBTSxhQUFhLEdBQUcsNkJBQ3BCLE1BQU0sRUFDTixNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FDakMsQ0FBQzs7QUFFRixZQUFJLGFBQWEsRUFBRTtBQUNqQixjQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyRCxpQkFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEQ7T0FDRjs7QUFFRCxVQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztLQUN4Qjs7Ozs7YUEzRW1ELElBQUksR0FBRyxFQUFFOzs7Ozs7O2FBQ1gsSUFBSSxHQUFHLEVBQUU7Ozs7Ozs7YUFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRTs7Ozs7Ozs7Ozs7U0FJL0MsZUFBWTtBQUNwQixXQUFLLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDL0MsWUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztBQUNyQyxZQUFJLDJCQUFjLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDckUsaUJBQU8sTUFBTSxDQUFDO1NBQ2Y7T0FDRjtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQWpCRyxLQUFLOzs7QUFpRlgsSUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztxQkFDWCxLQUFLOzs7QUFHcEIsTUFBTSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3N0b3JlL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5pbXBvcnQgeyBvYnNlcnZhYmxlLCBjb21wdXRlZCwgYWN0aW9uIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB7IGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIsIGdldEVtYmVkZGVkU2NvcGUgfSBmcm9tIFwiLi8uLi91dGlsc1wiO1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuLy4uL2NvbmZpZ1wiO1xuaW1wb3J0IE1hcmtlclN0b3JlIGZyb20gXCIuL21hcmtlcnNcIjtcbmltcG9ydCBrZXJuZWxNYW5hZ2VyIGZyb20gXCIuLy4uL2tlcm5lbC1tYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4vLi4va2VybmVsXCI7XG5cbmNsYXNzIFN0b3JlIHtcbiAgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIG1hcmtlcnMgPSBuZXcgTWFya2VyU3RvcmUoKTtcbiAgQG9ic2VydmFibGUgc3RhcnRpbmdLZXJuZWxzOiBNYXA8c3RyaW5nLCBib29sZWFuPiA9IG5ldyBNYXAoKTtcbiAgQG9ic2VydmFibGUgcnVubmluZ0tlcm5lbHM6IE1hcDxzdHJpbmcsIEtlcm5lbD4gPSBuZXcgTWFwKCk7XG4gIEBvYnNlcnZhYmxlIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgQG9ic2VydmFibGUgZ3JhbW1hcjogP2F0b20kR3JhbW1hcjtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IGtlcm5lbCgpOiA/S2VybmVsIHtcbiAgICBmb3IgKGxldCBrZXJuZWwgb2YgdGhpcy5ydW5uaW5nS2VybmVscy52YWx1ZXMoKSkge1xuICAgICAgY29uc3Qga2VybmVsU3BlYyA9IGtlcm5lbC5rZXJuZWxTcGVjO1xuICAgICAgaWYgKGtlcm5lbE1hbmFnZXIua2VybmVsU3BlY1Byb3ZpZGVzR3JhbW1hcihrZXJuZWxTcGVjLCB0aGlzLmdyYW1tYXIpKSB7XG4gICAgICAgIHJldHVybiBrZXJuZWw7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgQGFjdGlvblxuICBzdGFydEtlcm5lbChrZXJuZWxEaXNwbGF5TmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zdGFydGluZ0tlcm5lbHMuc2V0KGtlcm5lbERpc3BsYXlOYW1lLCB0cnVlKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgbmV3S2VybmVsKGtlcm5lbDogS2VybmVsKSB7XG4gICAgY29uc3QgbWFwcGVkTGFuZ3VhZ2UgPVxuICAgICAgQ29uZmlnLmdldEpzb24oXCJsYW5ndWFnZU1hcHBpbmdzXCIpW2tlcm5lbC5sYW5ndWFnZV0gfHwga2VybmVsLmxhbmd1YWdlO1xuICAgIHRoaXMucnVubmluZ0tlcm5lbHMuc2V0KG1hcHBlZExhbmd1YWdlLCBrZXJuZWwpO1xuICAgIC8vIGRlbGV0ZSBzdGFydGluZ0tlcm5lbCBzaW5jZSBzdG9yZS5rZXJuZWwgbm93IGluIHBsYWNlIHRvIHByZXZlbnQgZHVwbGljYXRlIGtlcm5lbFxuICAgIHRoaXMuc3RhcnRpbmdLZXJuZWxzLmRlbGV0ZShrZXJuZWwua2VybmVsU3BlYy5kaXNwbGF5X25hbWUpO1xuICB9XG5cbiAgQGFjdGlvblxuICBkZWxldGVLZXJuZWwoa2VybmVsOiBLZXJuZWwpIHtcbiAgICBmb3IgKGxldCBbbGFuZ3VhZ2UsIHJ1bm5pbmdLZXJuZWxdIG9mIHRoaXMucnVubmluZ0tlcm5lbHMuZW50cmllcygpKSB7XG4gICAgICBpZiAoa2VybmVsID09PSBydW5uaW5nS2VybmVsKSB7XG4gICAgICAgIHRoaXMucnVubmluZ0tlcm5lbHMuZGVsZXRlKGxhbmd1YWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLm1hcmtlcnMuY2xlYXIoKTtcbiAgICB0aGlzLnJ1bm5pbmdLZXJuZWxzLmZvckVhY2goa2VybmVsID0+IGtlcm5lbC5kZXN0cm95KCkpO1xuICAgIHRoaXMucnVubmluZ0tlcm5lbHMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHVwZGF0ZUVkaXRvcihlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLnNldEdyYW1tYXIoZWRpdG9yKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2V0R3JhbW1hcihlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IpIHtcbiAgICBpZiAoIWVkaXRvcikge1xuICAgICAgdGhpcy5ncmFtbWFyID0gbnVsbDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgZ3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG5cbiAgICBpZiAoaXNNdWx0aWxhbmd1YWdlR3JhbW1hcihncmFtbWFyKSkge1xuICAgICAgY29uc3QgZW1iZWRkZWRTY29wZSA9IGdldEVtYmVkZGVkU2NvcGUoXG4gICAgICAgIGVkaXRvcixcbiAgICAgICAgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICk7XG5cbiAgICAgIGlmIChlbWJlZGRlZFNjb3BlKSB7XG4gICAgICAgIGNvbnN0IHNjb3BlID0gZW1iZWRkZWRTY29wZS5yZXBsYWNlKFwiLmVtYmVkZGVkXCIsIFwiXCIpO1xuICAgICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdyYW1tYXIgPSBncmFtbWFyO1xuICB9XG59XG5cbmNvbnN0IHN0b3JlID0gbmV3IFN0b3JlKCk7XG5leHBvcnQgZGVmYXVsdCBzdG9yZTtcblxuLy8gRm9yIGRlYnVnZ2luZ1xud2luZG93Lmh5ZHJvZ2VuX3N0b3JlID0gc3RvcmU7XG4iXX0=