Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobx = require("mobx");

var _mobxReact = require("mobx-react");

var _anser = require("anser");

var _anser2 = _interopRequireDefault(_anser);

var _resultViewHistory = require("./result-view/history");

var _resultViewHistory2 = _interopRequireDefault(_resultViewHistory);

var _resultViewList = require("./result-view/list");

var _resultViewList2 = _interopRequireDefault(_resultViewList);

var _utils = require("./../utils");

var EmptyMessage = function EmptyMessage() {
  return _react2["default"].createElement(
    "ul",
    { className: "background-message centered" },
    _react2["default"].createElement(
      "li",
      null,
      "No output to display"
    )
  );
};

var OutputArea = (function (_React$Component) {
  var _instanceInitializers = {};

  _inherits(OutputArea, _React$Component);

  function OutputArea() {
    var _this = this;

    _classCallCheck(this, _OutputArea);

    _get(Object.getPrototypeOf(_OutputArea.prototype), "constructor", this).apply(this, arguments);

    this.showHistory = (0, _mobx.observable)(true);

    _defineDecoratedPropertyDescriptor(this, "setHistory", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setScrollList", _instanceInitializers);

    this.handleClick = function () {
      var kernel = _this.props.store.kernel;
      if (!kernel || !kernel.outputStore) return;
      var output = kernel.outputStore.outputs[kernel.outputStore.index];
      // check for a text property and fall back to data["text/plain"]
      var textOrBundle = output.text || output.data["text/plain"];
      if (textOrBundle) {
        atom.clipboard.write(_anser2["default"].ansiToText(textOrBundle));
        atom.notifications.addSuccess("Copied to clipboard");
      } else {
        atom.notifications.addWarning("Nothing to copy");
      }
    };
  }

  _createDecoratedClass(OutputArea, [{
    key: "render",
    value: function render() {
      var kernel = this.props.store.kernel;

      if (!kernel) {
        if (atom.config.get("Hydrogen.outputAreaDock")) {
          return _react2["default"].createElement(EmptyMessage, null);
        } else {
          atom.workspace.hide(_utils.OUTPUT_AREA_URI);
          return null;
        }
      }
      return _react2["default"].createElement(
        "div",
        { className: "sidebar output-area" },
        kernel.outputStore.outputs.length > 0 ? _react2["default"].createElement(
          "div",
          { className: "block" },
          _react2["default"].createElement(
            "div",
            { className: "btn-group" },
            _react2["default"].createElement("button", {
              className: "btn icon icon-clock" + (this.showHistory.get() ? " selected" : ""),
              onClick: this.setHistory
            }),
            _react2["default"].createElement("button", {
              className: "btn icon icon-three-bars" + (!this.showHistory.get() ? " selected" : ""),
              onClick: this.setScrollList
            })
          ),
          _react2["default"].createElement(
            "div",
            { style: { float: "right" } },
            this.showHistory.get() ? _react2["default"].createElement(
              "button",
              {
                className: "btn icon icon-clippy",
                onClick: this.handleClick
              },
              "Copy"
            ) : null,
            _react2["default"].createElement(
              "button",
              {
                className: "btn icon icon-trashcan",
                onClick: kernel.outputStore.clear
              },
              "Clear"
            )
          )
        ) : _react2["default"].createElement(EmptyMessage, null),
        this.showHistory.get() ? _react2["default"].createElement(_resultViewHistory2["default"], { store: kernel.outputStore }) : _react2["default"].createElement(_resultViewList2["default"], { outputs: kernel.outputStore.outputs })
      );
    }
  }, {
    key: "setHistory",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        _this2.showHistory.set(true);
      };
    },
    enumerable: true
  }, {
    key: "setScrollList",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.showHistory.set(false);
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  var _OutputArea = OutputArea;
  OutputArea = (0, _mobxReact.observer)(OutputArea) || OutputArea;
  return OutputArea;
})(_react2["default"].Component);

exports["default"] = OutputArea;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL291dHB1dC1hcmVhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3FCQUN4QixPQUFPOzs7O29CQUNVLE1BQU07O3lCQUNoQixZQUFZOztxQkFDbkIsT0FBTzs7OztpQ0FFTCx1QkFBdUI7Ozs7OEJBQ3BCLG9CQUFvQjs7OztxQkFDWCxZQUFZOztBQUs1QyxJQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksR0FBUztBQUN6QixTQUNFOztNQUFJLFNBQVMsRUFBQyw2QkFBNkI7SUFDekM7Ozs7S0FBNkI7R0FDMUIsQ0FDTDtDQUNILENBQUM7O0lBR0ksVUFBVTs7O1lBQVYsVUFBVTs7V0FBVixVQUFVOzs7Ozs7O1NBQ2QsV0FBVyxHQUE4QixzQkFBVyxJQUFJLENBQUM7Ozs7OztTQVd6RCxXQUFXLEdBQUcsWUFBTTtBQUNsQixVQUFNLE1BQU0sR0FBRyxNQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU87QUFDM0MsVUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFcEUsVUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlELFVBQUksWUFBWSxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG1CQUFNLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBQ3JELFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7T0FDdEQsTUFBTTtBQUNMLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7T0FDbEQ7S0FDRjs7O3dCQXhCRyxVQUFVOztXQTBCUixrQkFBRztBQUNQLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFdkMsVUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFlBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsRUFBRTtBQUM5QyxpQkFBTyxpQ0FBQyxZQUFZLE9BQUcsQ0FBQztTQUN6QixNQUFNO0FBQ0wsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFpQixDQUFDO0FBQ3JDLGlCQUFPLElBQUksQ0FBQztTQUNiO09BQ0Y7QUFDRCxhQUNFOztVQUFLLFNBQVMsRUFBQyxxQkFBcUI7UUFDakMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsR0FDcEM7O1lBQUssU0FBUyxFQUFDLE9BQU87VUFDcEI7O2NBQUssU0FBUyxFQUFDLFdBQVc7WUFDeEI7QUFDRSx1QkFBUywyQkFBd0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FDbkQsV0FBVyxHQUNYLEVBQUUsQ0FBQSxBQUFHO0FBQ1QscUJBQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDO2NBQ3pCO1lBQ0Y7QUFDRSx1QkFBUyxnQ0FBNkIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUN6RCxXQUFXLEdBQ1gsRUFBRSxDQUFBLEFBQUc7QUFDVCxxQkFBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEFBQUM7Y0FDNUI7V0FDRTtVQUNOOztjQUFLLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQUFBQztZQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUNyQjs7O0FBQ0UseUJBQVMsRUFBQyxzQkFBc0I7QUFDaEMsdUJBQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxBQUFDOzs7YUFHbkIsR0FDUCxJQUFJO1lBQ1I7OztBQUNFLHlCQUFTLEVBQUMsd0JBQXdCO0FBQ2xDLHVCQUFPLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEFBQUM7OzthQUczQjtXQUNMO1NBQ0YsR0FFTixpQ0FBQyxZQUFZLE9BQUcsQUFDakI7UUFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUNyQixtRUFBUyxLQUFLLEVBQUUsTUFBTSxDQUFDLFdBQVcsQUFBQyxHQUFHLEdBRXRDLGdFQUFZLE9BQU8sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQUFBQyxHQUFHLEFBQ3BEO09BQ0csQ0FDTjtLQUNIOzs7Ozs7O2FBL0VZLFlBQU07QUFDakIsZUFBSyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzVCOzs7Ozs7Ozs7YUFHZSxZQUFNO0FBQ3BCLGVBQUssV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUM3Qjs7Ozs7b0JBVkcsVUFBVTtBQUFWLFlBQVUsNEJBQVYsVUFBVSxLQUFWLFVBQVU7U0FBVixVQUFVO0dBQVMsbUJBQU0sU0FBUzs7cUJBcUZ6QixVQUFVIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL291dHB1dC1hcmVhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBhY3Rpb24sIG9ic2VydmFibGUgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IEFuc2VyIGZyb20gXCJhbnNlclwiO1xuXG5pbXBvcnQgSGlzdG9yeSBmcm9tIFwiLi9yZXN1bHQtdmlldy9oaXN0b3J5XCI7XG5pbXBvcnQgU2Nyb2xsTGlzdCBmcm9tIFwiLi9yZXN1bHQtdmlldy9saXN0XCI7XG5pbXBvcnQgeyBPVVRQVVRfQVJFQV9VUkkgfSBmcm9tIFwiLi8uLi91dGlsc1wiO1xuXG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuLi9zdG9yZVwiO1xuaW1wb3J0IHR5cGUgeyBJT2JzZXJ2YWJsZVZhbHVlIH0gZnJvbSBcIm1vYnhcIjtcblxuY29uc3QgRW1wdHlNZXNzYWdlID0gKCkgPT4ge1xuICByZXR1cm4gKFxuICAgIDx1bCBjbGFzc05hbWU9XCJiYWNrZ3JvdW5kLW1lc3NhZ2UgY2VudGVyZWRcIj5cbiAgICAgIDxsaT5ObyBvdXRwdXQgdG8gZGlzcGxheTwvbGk+XG4gICAgPC91bD5cbiAgKTtcbn07XG5cbkBvYnNlcnZlclxuY2xhc3MgT3V0cHV0QXJlYSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7IHN0b3JlOiBzdG9yZSB9PiB7XG4gIHNob3dIaXN0b3J5OiBJT2JzZXJ2YWJsZVZhbHVlPGJvb2xlYW4+ID0gb2JzZXJ2YWJsZSh0cnVlKTtcbiAgQGFjdGlvblxuICBzZXRIaXN0b3J5ID0gKCkgPT4ge1xuICAgIHRoaXMuc2hvd0hpc3Rvcnkuc2V0KHRydWUpO1xuICB9O1xuXG4gIEBhY3Rpb25cbiAgc2V0U2Nyb2xsTGlzdCA9ICgpID0+IHtcbiAgICB0aGlzLnNob3dIaXN0b3J5LnNldChmYWxzZSk7XG4gIH07XG5cbiAgaGFuZGxlQ2xpY2sgPSAoKSA9PiB7XG4gICAgY29uc3Qga2VybmVsID0gdGhpcy5wcm9wcy5zdG9yZS5rZXJuZWw7XG4gICAgaWYgKCFrZXJuZWwgfHwgIWtlcm5lbC5vdXRwdXRTdG9yZSkgcmV0dXJuO1xuICAgIGNvbnN0IG91dHB1dCA9IGtlcm5lbC5vdXRwdXRTdG9yZS5vdXRwdXRzW2tlcm5lbC5vdXRwdXRTdG9yZS5pbmRleF07XG4gICAgLy8gY2hlY2sgZm9yIGEgdGV4dCBwcm9wZXJ0eSBhbmQgZmFsbCBiYWNrIHRvIGRhdGFbXCJ0ZXh0L3BsYWluXCJdXG4gICAgY29uc3QgdGV4dE9yQnVuZGxlID0gb3V0cHV0LnRleHQgfHwgb3V0cHV0LmRhdGFbXCJ0ZXh0L3BsYWluXCJdO1xuICAgIGlmICh0ZXh0T3JCdW5kbGUpIHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKEFuc2VyLmFuc2lUb1RleHQodGV4dE9yQnVuZGxlKSk7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIkNvcGllZCB0byBjbGlwYm9hcmRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiTm90aGluZyB0byBjb3B5XCIpO1xuICAgIH1cbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qga2VybmVsID0gdGhpcy5wcm9wcy5zdG9yZS5rZXJuZWw7XG5cbiAgICBpZiAoIWtlcm5lbCkge1xuICAgICAgaWYgKGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLm91dHB1dEFyZWFEb2NrXCIpKSB7XG4gICAgICAgIHJldHVybiA8RW1wdHlNZXNzYWdlIC8+O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuaGlkZShPVVRQVVRfQVJFQV9VUkkpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2lkZWJhciBvdXRwdXQtYXJlYVwiPlxuICAgICAgICB7a2VybmVsLm91dHB1dFN0b3JlLm91dHB1dHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYnRuIGljb24gaWNvbi1jbG9jayR7dGhpcy5zaG93SGlzdG9yeS5nZXQoKVxuICAgICAgICAgICAgICAgICAgPyBcIiBzZWxlY3RlZFwiXG4gICAgICAgICAgICAgICAgICA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnNldEhpc3Rvcnl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BidG4gaWNvbiBpY29uLXRocmVlLWJhcnMkeyF0aGlzLnNob3dIaXN0b3J5LmdldCgpXG4gICAgICAgICAgICAgICAgICA/IFwiIHNlbGVjdGVkXCJcbiAgICAgICAgICAgICAgICAgIDogXCJcIn1gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc2V0U2Nyb2xsTGlzdH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmbG9hdDogXCJyaWdodFwiIH19PlxuICAgICAgICAgICAgICB7dGhpcy5zaG93SGlzdG9yeS5nZXQoKSA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLWNsaXBweVwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENvcHlcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXRyYXNoY2FuXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtrZXJuZWwub3V0cHV0U3RvcmUuY2xlYXJ9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBDbGVhclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxFbXB0eU1lc3NhZ2UgLz5cbiAgICAgICAgKX1cbiAgICAgICAge3RoaXMuc2hvd0hpc3RvcnkuZ2V0KCkgPyAoXG4gICAgICAgICAgPEhpc3Rvcnkgc3RvcmU9e2tlcm5lbC5vdXRwdXRTdG9yZX0gLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8U2Nyb2xsTGlzdCBvdXRwdXRzPXtrZXJuZWwub3V0cHV0U3RvcmUub3V0cHV0c30gLz5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT3V0cHV0QXJlYTtcbiJdfQ==