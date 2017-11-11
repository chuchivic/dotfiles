Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var Status = (0, _mobxReact.observer)(function (_ref) {
  var status = _ref.status;
  var style = _ref.style;

  switch (status) {
    case "running":
      return _react2["default"].createElement(
        "div",
        { className: "inline-container spinner", style: style },
        _react2["default"].createElement("div", { className: "rect1" }),
        _react2["default"].createElement("div", { className: "rect2" }),
        _react2["default"].createElement("div", { className: "rect3" }),
        _react2["default"].createElement("div", { className: "rect4" }),
        _react2["default"].createElement("div", { className: "rect5" })
      );
    case "ok":
      return _react2["default"].createElement("div", { className: "inline-container icon icon-check", style: style });
    case "empty":
      return _react2["default"].createElement("div", { className: "inline-container icon icon-zap", style: style });
    default:
      return _react2["default"].createElement("div", { className: "inline-container icon icon-x", style: style });
  }
});

exports["default"] = Status;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3N0YXR1cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRWtCLE9BQU87Ozs7eUJBQ0EsWUFBWTs7QUFJckMsSUFBTSxNQUFNLEdBQUcseUJBQVMsVUFBQyxJQUFpQixFQUFZO01BQTNCLE1BQU0sR0FBUixJQUFpQixDQUFmLE1BQU07TUFBRSxLQUFLLEdBQWYsSUFBaUIsQ0FBUCxLQUFLOztBQUN0QyxVQUFRLE1BQU07QUFDWixTQUFLLFNBQVM7QUFDWixhQUNFOztVQUFLLFNBQVMsRUFBQywwQkFBMEIsRUFBQyxLQUFLLEVBQUUsS0FBSyxBQUFDO1FBQ3JELDBDQUFLLFNBQVMsRUFBQyxPQUFPLEdBQUc7UUFDekIsMENBQUssU0FBUyxFQUFDLE9BQU8sR0FBRztRQUN6QiwwQ0FBSyxTQUFTLEVBQUMsT0FBTyxHQUFHO1FBQ3pCLDBDQUFLLFNBQVMsRUFBQyxPQUFPLEdBQUc7UUFDekIsMENBQUssU0FBUyxFQUFDLE9BQU8sR0FBRztPQUNyQixDQUNOO0FBQUEsQUFDSixTQUFLLElBQUk7QUFDUCxhQUFPLDBDQUFLLFNBQVMsRUFBQyxrQ0FBa0MsRUFBQyxLQUFLLEVBQUUsS0FBSyxBQUFDLEdBQUcsQ0FBQztBQUFBLEFBQzVFLFNBQUssT0FBTztBQUNWLGFBQU8sMENBQUssU0FBUyxFQUFDLGdDQUFnQyxFQUFDLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRyxDQUFDO0FBQUEsQUFDMUU7QUFDRSxhQUFPLDBDQUFLLFNBQVMsRUFBQyw4QkFBOEIsRUFBQyxLQUFLLEVBQUUsS0FBSyxBQUFDLEdBQUcsQ0FBQztBQUFBLEdBQ3pFO0NBQ0YsQ0FBQyxDQUFDOztxQkFFWSxNQUFNIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3N0YXR1cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcblxudHlwZSBQcm9wcyA9IHsgc3RhdHVzOiBzdHJpbmcsIHN0eWxlOiBPYmplY3QgfTtcblxuY29uc3QgU3RhdHVzID0gb2JzZXJ2ZXIoKHsgc3RhdHVzLCBzdHlsZSB9OiBQcm9wcykgPT4ge1xuICBzd2l0Y2ggKHN0YXR1cykge1xuICAgIGNhc2UgXCJydW5uaW5nXCI6XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1jb250YWluZXIgc3Bpbm5lclwiIHN0eWxlPXtzdHlsZX0+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWN0MVwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWN0MlwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWN0M1wiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWN0NFwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWN0NVwiIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKTtcbiAgICBjYXNlIFwib2tcIjpcbiAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1jb250YWluZXIgaWNvbiBpY29uLWNoZWNrXCIgc3R5bGU9e3N0eWxlfSAvPjtcbiAgICBjYXNlIFwiZW1wdHlcIjpcbiAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1jb250YWluZXIgaWNvbiBpY29uLXphcFwiIHN0eWxlPXtzdHlsZX0gLz47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1jb250YWluZXIgaWNvbiBpY29uLXhcIiBzdHlsZT17c3R5bGV9IC8+O1xuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3RhdHVzO1xuIl19