Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var StatusBar = (0, _mobxReact.observer)(function (_ref) {
  var kernel = _ref.store.kernel;
  var onClick = _ref.onClick;

  if (!kernel) return null;
  return _react2["default"].createElement(
    "a",
    { onClick: onClick },
    kernel.displayName,
    " | ",
    kernel.executionState
  );
});

exports["default"] = StatusBar;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3N0YXR1cy1iYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3FCQUVrQixPQUFPOzs7O3lCQUNBLFlBQVk7O0FBTXJDLElBQU0sU0FBUyxHQUFHLHlCQUFTLFVBQUMsSUFBOEIsRUFBWTtNQUEvQixNQUFNLEdBQWpCLElBQThCLENBQTVCLEtBQUssQ0FBSSxNQUFNO01BQUksT0FBTyxHQUE1QixJQUE4QixDQUFULE9BQU87O0FBQ3RELE1BQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDekIsU0FDRTs7TUFBRyxPQUFPLEVBQUUsT0FBTyxBQUFDO0lBQ2pCLE1BQU0sQ0FBQyxXQUFXOztJQUFLLE1BQU0sQ0FBQyxjQUFjO0dBQzNDLENBQ0o7Q0FDSCxDQUFDLENBQUM7O3FCQUVZLFNBQVMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvc3RhdHVzLWJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcblxuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLy4uL2tlcm5lbFwiO1xuXG50eXBlIFByb3BzID0geyBzdG9yZTogeyBrZXJuZWw6ID9LZXJuZWwgfSwgb25DbGljazogRnVuY3Rpb24gfTtcblxuY29uc3QgU3RhdHVzQmFyID0gb2JzZXJ2ZXIoKHsgc3RvcmU6IHsga2VybmVsIH0sIG9uQ2xpY2sgfTogUHJvcHMpID0+IHtcbiAgaWYgKCFrZXJuZWwpIHJldHVybiBudWxsO1xuICByZXR1cm4gKFxuICAgIDxhIG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAge2tlcm5lbC5kaXNwbGF5TmFtZX0gfCB7a2VybmVsLmV4ZWN1dGlvblN0YXRlfVxuICAgIDwvYT5cbiAgKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTdGF0dXNCYXI7XG4iXX0=