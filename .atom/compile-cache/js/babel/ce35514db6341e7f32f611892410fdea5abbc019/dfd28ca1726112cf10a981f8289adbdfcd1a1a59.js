Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _resultViewHistory = require("./../result-view/history");

var _resultViewHistory2 = _interopRequireDefault(_resultViewHistory);

var Watch = (function (_React$Component) {
  _inherits(Watch, _React$Component);

  function Watch() {
    _classCallCheck(this, Watch);

    _get(Object.getPrototypeOf(Watch.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Watch, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (!this.container) return;
      this.container.insertBefore(this.props.store.editor.element, this.container.firstChild);
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      return _react2["default"].createElement(
        "div",
        {
          className: "hydrogen watch-view",
          ref: function (c) {
            _this.container = c;
          }
        },
        _react2["default"].createElement(_resultViewHistory2["default"], { store: this.props.store.outputStore })
      );
    }
  }]);

  return Watch;
})(_react2["default"].Component);

exports["default"] = Watch;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3dhdGNoLXNpZGViYXIvd2F0Y2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7aUNBRUwsMEJBQTBCOzs7O0lBR3pCLEtBQUs7WUFBTCxLQUFLOztXQUFMLEtBQUs7MEJBQUwsS0FBSzs7K0JBQUwsS0FBSzs7O2VBQUwsS0FBSzs7V0FHUCw2QkFBRztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPO0FBQzVCLFVBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FDMUIsQ0FBQztLQUNIOzs7V0FFSyxrQkFBRzs7O0FBQ1AsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBQyxxQkFBcUI7QUFDL0IsYUFBRyxFQUFFLFVBQUEsQ0FBQyxFQUFJO0FBQ1Isa0JBQUssU0FBUyxHQUFHLENBQUMsQ0FBQztXQUNwQixBQUFDOztRQUVGLG1FQUFTLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEFBQUMsR0FBRztPQUM1QyxDQUNOO0tBQ0g7OztTQXRCa0IsS0FBSztHQUFTLG1CQUFNLFNBQVM7O3FCQUE3QixLQUFLIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3dhdGNoLXNpZGViYXIvd2F0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBIaXN0b3J5IGZyb20gXCIuLy4uL3Jlc3VsdC12aWV3L2hpc3RvcnlcIjtcbmltcG9ydCB0eXBlIFdhdGNoU3RvcmUgZnJvbSBcIi4vLi4vLi4vc3RvcmUvd2F0Y2hcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F0Y2ggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8eyBzdG9yZTogV2F0Y2hTdG9yZSB9PiB7XG4gIGNvbnRhaW5lcjogP0hUTUxFbGVtZW50O1xuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGlmICghdGhpcy5jb250YWluZXIpIHJldHVybjtcbiAgICB0aGlzLmNvbnRhaW5lci5pbnNlcnRCZWZvcmUoXG4gICAgICB0aGlzLnByb3BzLnN0b3JlLmVkaXRvci5lbGVtZW50LFxuICAgICAgdGhpcy5jb250YWluZXIuZmlyc3RDaGlsZFxuICAgICk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiaHlkcm9nZW4gd2F0Y2gtdmlld1wiXG4gICAgICAgIHJlZj17YyA9PiB7XG4gICAgICAgICAgdGhpcy5jb250YWluZXIgPSBjO1xuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8SGlzdG9yeSBzdG9yZT17dGhpcy5wcm9wcy5zdG9yZS5vdXRwdXRTdG9yZX0gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==