Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _utils = require("./../utils");

var _componentsKernelMonitor = require("./../components/kernel-monitor");

var _componentsKernelMonitor2 = _interopRequireDefault(_componentsKernelMonitor);

var KernelMonitorPane = (function () {
  function KernelMonitorPane(store) {
    _classCallCheck(this, KernelMonitorPane);

    this.element = document.createElement("div");
    this.disposer = new _atom.CompositeDisposable();

    this.getTitle = function () {
      return "Hydrogen Kernel Monitor";
    };

    this.getURI = function () {
      return _utils.KERNEL_MONITOR_URI;
    };

    this.getDefaultLocation = function () {
      return "bottom";
    };

    this.getAllowedLocations = function () {
      return ["bottom", "left", "right"];
    };

    this.element.classList.add("hydrogen");

    (0, _utils.reactFactory)(_react2["default"].createElement(_componentsKernelMonitor2["default"], { store: store }), this.element, null, this.disposer);
  }

  _createClass(KernelMonitorPane, [{
    key: "destroy",
    value: function destroy() {
      this.disposer.dispose();
      this.element.remove();
    }
  }]);

  return KernelMonitorPane;
})();

exports["default"] = KernelMonitorPane;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wYW5lcy9rZXJuZWwtbW9uaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVvQyxNQUFNOztxQkFFeEIsT0FBTzs7OztxQkFFd0IsWUFBWTs7dUNBRW5DLGdDQUFnQzs7OztJQUVyQyxpQkFBaUI7QUFJekIsV0FKUSxpQkFBaUIsQ0FJeEIsS0FBWSxFQUFFOzBCQUpQLGlCQUFpQjs7U0FDcEMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3ZDLFFBQVEsR0FBRywrQkFBeUI7O1NBYXBDLFFBQVEsR0FBRzthQUFNLHlCQUF5QjtLQUFBOztTQUUxQyxNQUFNLEdBQUc7O0tBQXdCOztTQUVqQyxrQkFBa0IsR0FBRzthQUFNLFFBQVE7S0FBQTs7U0FFbkMsbUJBQW1CLEdBQUc7YUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO0tBQUE7O0FBaEJyRCxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXZDLDZCQUNFLHlFQUFlLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRyxFQUMvQixJQUFJLENBQUMsT0FBTyxFQUNaLElBQUksRUFDSixJQUFJLENBQUMsUUFBUSxDQUNkLENBQUM7R0FDSDs7ZUFia0IsaUJBQWlCOztXQXVCN0IsbUJBQUc7QUFDUixVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdkI7OztTQTFCa0IsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvcGFuZXMva2VybmVsLW1vbml0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSBcImF0b21cIjtcblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyByZWFjdEZhY3RvcnksIEtFUk5FTF9NT05JVE9SX1VSSSB9IGZyb20gXCIuLy4uL3V0aWxzXCI7XG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IEtlcm5lbE1vbml0b3IgZnJvbSBcIi4vLi4vY29tcG9uZW50cy9rZXJuZWwtbW9uaXRvclwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXJuZWxNb25pdG9yUGFuZSB7XG4gIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBkaXNwb3NlciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgY29uc3RydWN0b3Ioc3RvcmU6IHN0b3JlKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoeWRyb2dlblwiKTtcblxuICAgIHJlYWN0RmFjdG9yeShcbiAgICAgIDxLZXJuZWxNb25pdG9yIHN0b3JlPXtzdG9yZX0gLz4sXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBudWxsLFxuICAgICAgdGhpcy5kaXNwb3NlclxuICAgICk7XG4gIH1cblxuICBnZXRUaXRsZSA9ICgpID0+IFwiSHlkcm9nZW4gS2VybmVsIE1vbml0b3JcIjtcblxuICBnZXRVUkkgPSAoKSA9PiBLRVJORUxfTU9OSVRPUl9VUkk7XG5cbiAgZ2V0RGVmYXVsdExvY2F0aW9uID0gKCkgPT4gXCJib3R0b21cIjtcblxuICBnZXRBbGxvd2VkTG9jYXRpb25zID0gKCkgPT4gW1wiYm90dG9tXCIsIFwibGVmdFwiLCBcInJpZ2h0XCJdO1xuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kaXNwb3Nlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICB9XG59XG4iXX0=