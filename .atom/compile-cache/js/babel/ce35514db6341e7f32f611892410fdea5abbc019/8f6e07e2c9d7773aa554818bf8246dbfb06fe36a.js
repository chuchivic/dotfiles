Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _atom = require("atom");

var _mobx = require("mobx");

var _output = require("./output");

var _output2 = _interopRequireDefault(_output);

var _utils = require("./../utils");

var WatchStore = (function () {
  var _instanceInitializers = {};

  function WatchStore(kernel) {
    var _this = this;

    _classCallCheck(this, WatchStore);

    this.outputStore = new _output2["default"]();

    _defineDecoratedPropertyDescriptor(this, "run", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setCode", _instanceInitializers);

    this.getCode = function () {
      return _this.editor.getText();
    };

    this.focus = function () {
      _this.editor.element.focus();
    };

    this.kernel = kernel;
    this.editor = new _atom.TextEditor({
      softWrapped: true,
      grammar: this.kernel.grammar,
      lineNumberGutterVisible: false
    });
    this.editor.moveToTop();
    this.editor.element.classList.add("watch-input");
  }

  _createDecoratedClass(WatchStore, [{
    key: "run",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        var code = _this2.getCode();
        (0, _utils.log)("watchview running:", code);
        if (code && code.length > 0) {
          _this2.kernel.executeWatch(code, function (result) {
            _this2.outputStore.appendOutput(result);
          });
        }
      };
    },
    enumerable: true
  }, {
    key: "setCode",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function (code) {
        _this3.editor.setText(code);
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  return WatchStore;
})();

exports["default"] = WatchStore;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS93YXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBRTJCLE1BQU07O29CQUNWLE1BQU07O3NCQUVMLFVBQVU7Ozs7cUJBQ2QsWUFBWTs7SUFJWCxVQUFVOzs7QUFLbEIsV0FMUSxVQUFVLENBS2pCLE1BQWMsRUFBRTs7OzBCQUxULFVBQVU7O1NBRzdCLFdBQVcsR0FBRyx5QkFBaUI7Ozs7OztTQTZCL0IsT0FBTyxHQUFHLFlBQU07QUFDZCxhQUFPLE1BQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOztTQUVELEtBQUssR0FBRyxZQUFNO0FBQ1osWUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzdCOztBQWhDQyxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxHQUFHLHFCQUFlO0FBQzNCLGlCQUFXLEVBQUUsSUFBSTtBQUNqQixhQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPO0FBQzVCLDZCQUF1QixFQUFFLEtBQUs7S0FDL0IsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ2xEOzt3QkFka0IsVUFBVTs7Ozs7O2FBaUJ2QixZQUFNO0FBQ1YsWUFBTSxJQUFJLEdBQUcsT0FBSyxPQUFPLEVBQUUsQ0FBQztBQUM1Qix3QkFBSSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoQyxZQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUMzQixpQkFBSyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFBLE1BQU0sRUFBSTtBQUN2QyxtQkFBSyxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ3ZDLENBQUMsQ0FBQztTQUNKO09BQ0Y7Ozs7Ozs7OzthQUdTLFVBQUMsSUFBSSxFQUFhO0FBQzFCLGVBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUMzQjs7Ozs7U0E5QmtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS93YXRjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IFRleHRFZGl0b3IgfSBmcm9tIFwiYXRvbVwiO1xuaW1wb3J0IHsgYWN0aW9uIH0gZnJvbSBcIm1vYnhcIjtcblxuaW1wb3J0IE91dHB1dFN0b3JlIGZyb20gXCIuL291dHB1dFwiO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSBcIi4vLi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLy4uL2tlcm5lbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXRjaFN0b3JlIHtcbiAga2VybmVsOiBLZXJuZWw7XG4gIGVkaXRvcjogVGV4dEVkaXRvcjtcbiAgb3V0cHV0U3RvcmUgPSBuZXcgT3V0cHV0U3RvcmUoKTtcblxuICBjb25zdHJ1Y3RvcihrZXJuZWw6IEtlcm5lbCkge1xuICAgIHRoaXMua2VybmVsID0ga2VybmVsO1xuICAgIHRoaXMuZWRpdG9yID0gbmV3IFRleHRFZGl0b3Ioe1xuICAgICAgc29mdFdyYXBwZWQ6IHRydWUsXG4gICAgICBncmFtbWFyOiB0aGlzLmtlcm5lbC5ncmFtbWFyLFxuICAgICAgbGluZU51bWJlckd1dHRlclZpc2libGU6IGZhbHNlXG4gICAgfSk7XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvVG9wKCk7XG4gICAgdGhpcy5lZGl0b3IuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2F0Y2gtaW5wdXRcIik7XG4gIH1cblxuICBAYWN0aW9uXG4gIHJ1biA9ICgpID0+IHtcbiAgICBjb25zdCBjb2RlID0gdGhpcy5nZXRDb2RlKCk7XG4gICAgbG9nKFwid2F0Y2h2aWV3IHJ1bm5pbmc6XCIsIGNvZGUpO1xuICAgIGlmIChjb2RlICYmIGNvZGUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5rZXJuZWwuZXhlY3V0ZVdhdGNoKGNvZGUsIHJlc3VsdCA9PiB7XG4gICAgICAgIHRoaXMub3V0cHV0U3RvcmUuYXBwZW5kT3V0cHV0KHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgQGFjdGlvblxuICBzZXRDb2RlID0gKGNvZGU6IHN0cmluZykgPT4ge1xuICAgIHRoaXMuZWRpdG9yLnNldFRleHQoY29kZSk7XG4gIH07XG5cbiAgZ2V0Q29kZSA9ICgpID0+IHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0VGV4dCgpO1xuICB9O1xuXG4gIGZvY3VzID0gKCkgPT4ge1xuICAgIHRoaXMuZWRpdG9yLmVsZW1lbnQuZm9jdXMoKTtcbiAgfTtcbn1cbiJdfQ==