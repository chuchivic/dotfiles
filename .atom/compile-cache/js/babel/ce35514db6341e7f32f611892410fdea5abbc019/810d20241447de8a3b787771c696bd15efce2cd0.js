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

var _componentsInspector = require("./../components/inspector");

var _componentsInspector2 = _interopRequireDefault(_componentsInspector);

var InspectorPane = (function () {
  function InspectorPane(store) {
    _classCallCheck(this, InspectorPane);

    this.element = document.createElement("div");
    this.disposer = new _atom.CompositeDisposable();

    this.getTitle = function () {
      return "Hydrogen Inspector";
    };

    this.getURI = function () {
      return _utils.INSPECTOR_URI;
    };

    this.getDefaultLocation = function () {
      return "bottom";
    };

    this.getAllowedLocations = function () {
      return ["bottom", "left", "right"];
    };

    this.element.classList.add("hydrogen", "inspector");

    (0, _utils.reactFactory)(_react2["default"].createElement(_componentsInspector2["default"], { store: store }), this.element, null, this.disposer);
  }

  _createClass(InspectorPane, [{
    key: "destroy",
    value: function destroy() {
      this.disposer.dispose();
      this.element.remove();
    }
  }]);

  return InspectorPane;
})();

exports["default"] = InspectorPane;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wYW5lcy9pbnNwZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFb0MsTUFBTTs7cUJBRXhCLE9BQU87Ozs7cUJBRW1CLFlBQVk7O21DQUVsQywyQkFBMkI7Ozs7SUFFNUIsYUFBYTtBQUlyQixXQUpRLGFBQWEsQ0FJcEIsS0FBWSxFQUFFOzBCQUpQLGFBQWE7O1NBQ2hDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztTQUN2QyxRQUFRLEdBQUcsK0JBQXlCOztTQWFwQyxRQUFRLEdBQUc7YUFBTSxvQkFBb0I7S0FBQTs7U0FFckMsTUFBTSxHQUFHOztLQUFtQjs7U0FFNUIsa0JBQWtCLEdBQUc7YUFBTSxRQUFRO0tBQUE7O1NBRW5DLG1CQUFtQixHQUFHO2FBQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQztLQUFBOztBQWhCckQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQzs7QUFFcEQsNkJBQ0UscUVBQVcsS0FBSyxFQUFFLEtBQUssQUFBQyxHQUFHLEVBQzNCLElBQUksQ0FBQyxPQUFPLEVBQ1osSUFBSSxFQUNKLElBQUksQ0FBQyxRQUFRLENBQ2QsQ0FBQztHQUNIOztlQWJrQixhQUFhOztXQXVCekIsbUJBQUc7QUFDUixVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdkI7OztTQTFCa0IsYUFBYTs7O3FCQUFiLGFBQWEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3BhbmVzL2luc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IHJlYWN0RmFjdG9yeSwgSU5TUEVDVE9SX1VSSSB9IGZyb20gXCIuLy4uL3V0aWxzXCI7XG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IEluc3BlY3RvciBmcm9tIFwiLi8uLi9jb21wb25lbnRzL2luc3BlY3RvclwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnNwZWN0b3JQYW5lIHtcbiAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGRpc3Bvc2VyID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogc3RvcmUpIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImh5ZHJvZ2VuXCIsIFwiaW5zcGVjdG9yXCIpO1xuXG4gICAgcmVhY3RGYWN0b3J5KFxuICAgICAgPEluc3BlY3RvciBzdG9yZT17c3RvcmV9IC8+LFxuICAgICAgdGhpcy5lbGVtZW50LFxuICAgICAgbnVsbCxcbiAgICAgIHRoaXMuZGlzcG9zZXJcbiAgICApO1xuICB9XG5cbiAgZ2V0VGl0bGUgPSAoKSA9PiBcIkh5ZHJvZ2VuIEluc3BlY3RvclwiO1xuXG4gIGdldFVSSSA9ICgpID0+IElOU1BFQ1RPUl9VUkk7XG5cbiAgZ2V0RGVmYXVsdExvY2F0aW9uID0gKCkgPT4gXCJib3R0b21cIjtcblxuICBnZXRBbGxvd2VkTG9jYXRpb25zID0gKCkgPT4gW1wiYm90dG9tXCIsIFwibGVmdFwiLCBcInJpZ2h0XCJdO1xuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kaXNwb3Nlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICB9XG59XG4iXX0=