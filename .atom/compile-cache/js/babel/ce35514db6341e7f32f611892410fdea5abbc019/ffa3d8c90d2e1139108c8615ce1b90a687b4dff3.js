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

var _componentsWatchSidebar = require("./../components/watch-sidebar");

var _componentsWatchSidebar2 = _interopRequireDefault(_componentsWatchSidebar);

var WatchesPane = (function () {
  function WatchesPane(store) {
    _classCallCheck(this, WatchesPane);

    this.element = document.createElement("div");
    this.disposer = new _atom.CompositeDisposable();

    this.getTitle = function () {
      return "Hydrogen Watch";
    };

    this.getURI = function () {
      return _utils.WATCHES_URI;
    };

    this.getDefaultLocation = function () {
      return "right";
    };

    this.getAllowedLocations = function () {
      return ["left", "right"];
    };

    this.element.classList.add("hydrogen");

    (0, _utils.reactFactory)(_react2["default"].createElement(_componentsWatchSidebar2["default"], { store: store }), this.element, null, this.disposer);
  }

  _createClass(WatchesPane, [{
    key: "destroy",
    value: function destroy() {
      this.disposer.dispose();
      this.element.remove();
    }
  }]);

  return WatchesPane;
})();

exports["default"] = WatchesPane;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wYW5lcy93YXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3FCQUV4QixPQUFPOzs7O3FCQUVpQixZQUFZOztzQ0FFbEMsK0JBQStCOzs7O0lBRTlCLFdBQVc7QUFJbkIsV0FKUSxXQUFXLENBSWxCLEtBQVksRUFBRTswQkFKUCxXQUFXOztTQUM5QixPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7U0FDdkMsUUFBUSxHQUFHLCtCQUF5Qjs7U0FRcEMsUUFBUSxHQUFHO2FBQU0sZ0JBQWdCO0tBQUE7O1NBRWpDLE1BQU0sR0FBRzs7S0FBaUI7O1NBRTFCLGtCQUFrQixHQUFHO2FBQU0sT0FBTztLQUFBOztTQUVsQyxtQkFBbUIsR0FBRzthQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztLQUFBOztBQVgzQyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXZDLDZCQUFhLHdFQUFTLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM1RTs7ZUFSa0IsV0FBVzs7V0FrQnZCLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3ZCOzs7U0FyQmtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wYW5lcy93YXRjaGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgcmVhY3RGYWN0b3J5LCBXQVRDSEVTX1VSSSB9IGZyb20gXCIuLy4uL3V0aWxzXCI7XG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IFdhdGNoZXMgZnJvbSBcIi4vLi4vY29tcG9uZW50cy93YXRjaC1zaWRlYmFyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoZXNQYW5lIHtcbiAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGRpc3Bvc2VyID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogc3RvcmUpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImh5ZHJvZ2VuXCIpO1xuXG4gICAgcmVhY3RGYWN0b3J5KDxXYXRjaGVzIHN0b3JlPXtzdG9yZX0gLz4sIHRoaXMuZWxlbWVudCwgbnVsbCwgdGhpcy5kaXNwb3Nlcik7XG4gIH1cblxuICBnZXRUaXRsZSA9ICgpID0+IFwiSHlkcm9nZW4gV2F0Y2hcIjtcblxuICBnZXRVUkkgPSAoKSA9PiBXQVRDSEVTX1VSSTtcblxuICBnZXREZWZhdWx0TG9jYXRpb24gPSAoKSA9PiBcInJpZ2h0XCI7XG5cbiAgZ2V0QWxsb3dlZExvY2F0aW9ucyA9ICgpID0+IFtcImxlZnRcIiwgXCJyaWdodFwiXTtcblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZGlzcG9zZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgfVxufVxuIl19