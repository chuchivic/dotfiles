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

var _mobxReact = require("mobx-react");

var _mobx = require("mobx");

var _nteractDisplayArea = require("@nteract/display-area");

var _transforms = require("./transforms");

var ScrollList = (function (_React$Component) {
  _inherits(ScrollList, _React$Component);

  function ScrollList() {
    _classCallCheck(this, _ScrollList);

    _get(Object.getPrototypeOf(_ScrollList.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollList, [{
    key: "scrollToBottom",
    value: function scrollToBottom() {
      if (!this.el) return;
      var scrollHeight = this.el.scrollHeight;
      var height = this.el.clientHeight;
      var maxScrollTop = scrollHeight - height;
      this.el.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.scrollToBottom();
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      if (this.props.outputs.length === 0) return null;
      return _react2["default"].createElement(
        "div",
        {
          className: "scroll-list multiline-container native-key-bindings",
          tabIndex: "-1",
          style: {
            fontSize: atom.config.get("Hydrogen.outputAreaFontSize") || "inherit"
          },
          ref: function (el) {
            _this.el = el;
          }
        },
        _react2["default"].createElement(_nteractDisplayArea.Display, {
          outputs: (0, _mobx.toJS)(this.props.outputs),
          displayOrder: _transforms.displayOrder,
          transforms: _transforms.transforms,
          theme: "light",
          models: {},
          expanded: true
        })
      );
    }
  }]);

  var _ScrollList = ScrollList;
  ScrollList = (0, _mobxReact.observer)(ScrollList) || ScrollList;
  return ScrollList;
})(_react2["default"].Component);

exports["default"] = ScrollList;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L2xpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7eUJBQ0EsWUFBWTs7b0JBQ2hCLE1BQU07O2tDQUNILHVCQUF1Qjs7MEJBQ04sY0FBYzs7SUFPakQsVUFBVTtZQUFWLFVBQVU7O1dBQVYsVUFBVTs7Ozs7O2VBQVYsVUFBVTs7V0FHQSwwQkFBRztBQUNmLFVBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU87QUFDckIsVUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7QUFDMUMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7QUFDcEMsVUFBTSxZQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUMzQyxVQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7S0FDekQ7OztXQUVpQiw4QkFBRztBQUNuQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7OztXQUVnQiw2QkFBRztBQUNsQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7OztXQUVLLGtCQUFHOzs7QUFDUCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDakQsYUFDRTs7O0FBQ0UsbUJBQVMsRUFBQyxxREFBcUQ7QUFDL0Qsa0JBQVEsRUFBQyxJQUFJO0FBQ2IsZUFBSyxFQUFFO0FBQ0wsb0JBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsK0JBQStCLElBQUksU0FBUztXQUN0RSxBQUFDO0FBQ0YsYUFBRyxFQUFFLFVBQUEsRUFBRSxFQUFJO0FBQ1Qsa0JBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQztXQUNkLEFBQUM7O1FBRUY7QUFDRSxpQkFBTyxFQUFFLGdCQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEFBQUM7QUFDbEMsc0JBQVksMEJBQWU7QUFDM0Isb0JBQVUsd0JBQWE7QUFDdkIsZUFBSyxFQUFDLE9BQU87QUFDYixnQkFBTSxFQUFFLEVBQUUsQUFBQztBQUNYLGtCQUFRLEVBQUUsSUFBSSxBQUFDO1VBQ2Y7T0FDRSxDQUNOO0tBQ0g7OztvQkExQ0csVUFBVTtBQUFWLFlBQVUsNEJBQVYsVUFBVSxLQUFWLFVBQVU7U0FBVixVQUFVO0dBQVMsbUJBQU0sU0FBUzs7cUJBNkN6QixVQUFVIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L2xpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5pbXBvcnQgeyB0b0pTIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB7IERpc3BsYXkgfSBmcm9tIFwiQG50ZXJhY3QvZGlzcGxheS1hcmVhXCI7XG5pbXBvcnQgeyB0cmFuc2Zvcm1zLCBkaXNwbGF5T3JkZXIgfSBmcm9tIFwiLi90cmFuc2Zvcm1zXCI7XG5cbmltcG9ydCB0eXBlIHsgSU9ic2VydmFibGVBcnJheSB9IGZyb20gXCJtb2J4XCI7XG5cbnR5cGUgUHJvcHMgPSB7IG91dHB1dHM6IElPYnNlcnZhYmxlQXJyYXk8T2JqZWN0PiB9O1xuXG5Ab2JzZXJ2ZXJcbmNsYXNzIFNjcm9sbExpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8UHJvcHM+IHtcbiAgZWw6ID9IVE1MRWxlbWVudDtcblxuICBzY3JvbGxUb0JvdHRvbSgpIHtcbiAgICBpZiAoIXRoaXMuZWwpIHJldHVybjtcbiAgICBjb25zdCBzY3JvbGxIZWlnaHQgPSB0aGlzLmVsLnNjcm9sbEhlaWdodDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmVsLmNsaWVudEhlaWdodDtcbiAgICBjb25zdCBtYXhTY3JvbGxUb3AgPSBzY3JvbGxIZWlnaHQgLSBoZWlnaHQ7XG4gICAgdGhpcy5lbC5zY3JvbGxUb3AgPSBtYXhTY3JvbGxUb3AgPiAwID8gbWF4U2Nyb2xsVG9wIDogMDtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMucHJvcHMub3V0cHV0cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInNjcm9sbC1saXN0IG11bHRpbGluZS1jb250YWluZXIgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiBhdG9tLmNvbmZpZy5nZXQoYEh5ZHJvZ2VuLm91dHB1dEFyZWFGb250U2l6ZWApIHx8IFwiaW5oZXJpdFwiXG4gICAgICAgIH19XG4gICAgICAgIHJlZj17ZWwgPT4ge1xuICAgICAgICAgIHRoaXMuZWwgPSBlbDtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPERpc3BsYXlcbiAgICAgICAgICBvdXRwdXRzPXt0b0pTKHRoaXMucHJvcHMub3V0cHV0cyl9XG4gICAgICAgICAgZGlzcGxheU9yZGVyPXtkaXNwbGF5T3JkZXJ9XG4gICAgICAgICAgdHJhbnNmb3Jtcz17dHJhbnNmb3Jtc31cbiAgICAgICAgICB0aGVtZT1cImxpZ2h0XCJcbiAgICAgICAgICBtb2RlbHM9e3t9fVxuICAgICAgICAgIGV4cGFuZGVkPXt0cnVlfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTY3JvbGxMaXN0O1xuIl19