Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _mobx = require("mobx");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _utils = require("./../utils");

var _kernel = require("../kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var displayOrder = ["text/html", "text/markdown", "text/plain"];

var Monitor = (0, _mobxReact.observer)(function (_ref) {
  var kernel = _ref.kernel;
  var files = _ref.files;

  var destroy = function destroy() {
    kernel.shutdown();
    kernel.destroy();
  };

  return _react2["default"].createElement(
    "div",
    { style: { padding: "5px 10px", display: "flex" } },
    _react2["default"].createElement(
      "div",
      { style: { flex: 1, whiteSpace: "nowrap" } },
      kernel.displayName
    ),
    _react2["default"].createElement(
      "div",
      {
        style: {
          padding: "0 10px",
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }
      },
      files
    ),
    _react2["default"].createElement("div", { className: "icon icon-trashcan", onClick: destroy })
  );
});

var MonitorSection = (0, _mobxReact.observer)(function (_ref2) {
  var store = _ref2.store;
  var kernels = _ref2.kernels;
  var group = _ref2.group;
  return _react2["default"].createElement(
    "div",
    null,
    _react2["default"].createElement(
      "header",
      null,
      group
    ),
    kernels.map(function (kernel) {
      var files = store.getFilesForKernel(kernel).map(_tildify2["default"]).join(", ");
      return _react2["default"].createElement(Monitor, {
        kernel: kernel,
        files: files,
        key: kernel.displayName + files
      });
    })
  );
});

var KernelMonitor = (0, _mobxReact.observer)(function (_ref3) {
  var store = _ref3.store;
  return (function () {
    if (store.runningKernels.length === 0) {
      return _react2["default"].createElement(
        "ul",
        { className: "background-message centered" },
        _react2["default"].createElement(
          "li",
          null,
          "No running kernels"
        )
      );
    }
    var grouped = _lodash2["default"].groupBy(store.runningKernels, function (kernel) {
      return kernel.gatewayName || "Local";
    });
    return _react2["default"].createElement(
      "div",
      { className: "kernel-monitor" },
      _lodash2["default"].map(grouped, function (kernels, group) {
        return _react2["default"].createElement(MonitorSection, {
          store: store,
          kernels: kernels,
          group: group,
          key: group
        });
      })
    );
  })();
});

exports["default"] = KernelMonitor;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL2tlcm5lbC1tb25pdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztxQkFFa0IsT0FBTzs7Ozt5QkFDQSxZQUFZOztvQkFDVixNQUFNOztzQkFDbkIsUUFBUTs7Ozt1QkFDRixTQUFTOzs7O3FCQUVNLFlBQVk7O3NCQUs1QixXQUFXOzs7O0FBSDlCLElBQU0sWUFBWSxHQUFHLENBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFNbEUsSUFBTSxPQUFPLEdBQUcseUJBQVMsVUFBQyxJQUFpQixFQUFtQjtNQUFsQyxNQUFNLEdBQVIsSUFBaUIsQ0FBZixNQUFNO01BQUUsS0FBSyxHQUFmLElBQWlCLENBQVAsS0FBSzs7QUFDdkMsTUFBTSxPQUFPLEdBQUcsU0FBVixPQUFPLEdBQVM7QUFDcEIsVUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2xCLFVBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNsQixDQUFDOztBQUVGLFNBQ0U7O01BQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEFBQUM7SUFDbkQ7O1FBQUssS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEFBQUM7TUFBRSxNQUFNLENBQUMsV0FBVztLQUFPO0lBQ3pFOzs7QUFDRSxhQUFLLEVBQUU7QUFDTCxpQkFBTyxFQUFFLFFBQVE7QUFDakIsc0JBQVksRUFBRSxVQUFVO0FBQ3hCLGtCQUFRLEVBQUUsUUFBUTtBQUNsQixvQkFBVSxFQUFFLFFBQVE7U0FDckIsQUFBQzs7TUFFRCxLQUFLO0tBQ0Y7SUFDTiwwQ0FBSyxTQUFTLEVBQUMsb0JBQW9CLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHO0dBQ3BELENBQ047Q0FDSCxDQUFDLENBQUM7O0FBR0gsSUFBTSxjQUFjLEdBQUcseUJBQVMsVUFBQyxLQUF5QjtNQUF2QixLQUFLLEdBQVAsS0FBeUIsQ0FBdkIsS0FBSztNQUFFLE9BQU8sR0FBaEIsS0FBeUIsQ0FBaEIsT0FBTztNQUFFLEtBQUssR0FBdkIsS0FBeUIsQ0FBUCxLQUFLO1NBQ3REOzs7SUFDRTs7O01BQVMsS0FBSztLQUFVO0lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDckIsVUFBTSxLQUFLLEdBQUcsS0FBSyxDQUNoQixpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FDekIsR0FBRyxzQkFBUyxDQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkLGFBQ0UsaUNBQUMsT0FBTztBQUNOLGNBQU0sRUFBRSxNQUFNLEFBQUM7QUFDZixhQUFLLEVBQUUsS0FBSyxBQUFDO0FBQ2IsV0FBRyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxBQUFDO1FBQ2hDLENBQ0Y7S0FDSCxDQUFDO0dBQ0U7Q0FDUCxDQUFDLENBQUM7O0FBRUgsSUFBTSxhQUFhLEdBQUcseUJBQVMsVUFBQyxLQUFTO01BQVAsS0FBSyxHQUFQLEtBQVMsQ0FBUCxLQUFLO3NCQUF5QjtBQUM5RCxRQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNyQyxhQUNFOztVQUFJLFNBQVMsRUFBQyw2QkFBNkI7UUFDekM7Ozs7U0FBMkI7T0FDeEIsQ0FDTDtLQUNIO0FBQ0QsUUFBTSxPQUFPLEdBQUcsb0JBQUUsT0FBTyxDQUN2QixLQUFLLENBQUMsY0FBYyxFQUNwQixVQUFBLE1BQU07YUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLE9BQU87S0FBQSxDQUN4QyxDQUFDO0FBQ0YsV0FDRTs7UUFBSyxTQUFTLEVBQUMsZ0JBQWdCO01BQzVCLG9CQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxPQUFPLEVBQUUsS0FBSztlQUM3QixpQ0FBQyxjQUFjO0FBQ2IsZUFBSyxFQUFFLEtBQUssQUFBQztBQUNiLGlCQUFPLEVBQUUsT0FBTyxBQUFDO0FBQ2pCLGVBQUssRUFBRSxLQUFLLEFBQUM7QUFDYixhQUFHLEVBQUUsS0FBSyxBQUFDO1VBQ1g7T0FDSCxDQUFDO0tBQ0UsQ0FDTjtHQUNIO0NBQUEsQ0FBQyxDQUFDOztxQkFFWSxhQUFhIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL2tlcm5lbC1tb25pdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IHsgb2JzZXJ2YWJsZSB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgdGlsZGlmeSBmcm9tIFwidGlsZGlmeVwiO1xuXG5pbXBvcnQgeyBLRVJORUxfTU9OSVRPUl9VUkkgfSBmcm9tIFwiLi8uLi91dGlsc1wiO1xuXG5jb25zdCBkaXNwbGF5T3JkZXIgPSBbXCJ0ZXh0L2h0bWxcIiwgXCJ0ZXh0L21hcmtkb3duXCIsIFwidGV4dC9wbGFpblwiXTtcblxuaW1wb3J0IHR5cGVvZiBzdG9yZSBmcm9tIFwiLi4vc3RvcmVcIjtcbmltcG9ydCBLZXJuZWwgZnJvbSBcIi4uL2tlcm5lbFwiO1xuXG50eXBlIE1vbml0b3JQcm9wcyA9IHsga2VybmVsOiBLZXJuZWwsIGZpbGVzOiBzdHJpbmcgfTtcbmNvbnN0IE1vbml0b3IgPSBvYnNlcnZlcigoeyBrZXJuZWwsIGZpbGVzIH06IE1vbml0b3JQcm9wcykgPT4ge1xuICBjb25zdCBkZXN0cm95ID0gKCkgPT4ge1xuICAgIGtlcm5lbC5zaHV0ZG93bigpO1xuICAgIGtlcm5lbC5kZXN0cm95KCk7XG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6IFwiNXB4IDEwcHhcIiwgZGlzcGxheTogXCJmbGV4XCIgfX0+XG4gICAgICA8ZGl2IHN0eWxlPXt7IGZsZXg6IDEsIHdoaXRlU3BhY2U6IFwibm93cmFwXCIgfX0+e2tlcm5lbC5kaXNwbGF5TmFtZX08L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBwYWRkaW5nOiBcIjAgMTBweFwiLFxuICAgICAgICAgIHRleHRPdmVyZmxvdzogXCJlbGxpcHNpc1wiLFxuICAgICAgICAgIG92ZXJmbG93OiBcImhpZGRlblwiLFxuICAgICAgICAgIHdoaXRlU3BhY2U6IFwibm93cmFwXCJcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2ZpbGVzfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImljb24gaWNvbi10cmFzaGNhblwiIG9uQ2xpY2s9e2Rlc3Ryb3l9IC8+XG4gICAgPC9kaXY+XG4gICk7XG59KTtcblxudHlwZSBQcm9wcyA9IHsgc3RvcmU6IHN0b3JlLCBrZXJuZWxzOiBBcnJheTxLZXJuZWw+LCBncm91cDogc3RyaW5nIH07XG5jb25zdCBNb25pdG9yU2VjdGlvbiA9IG9ic2VydmVyKCh7IHN0b3JlLCBrZXJuZWxzLCBncm91cCB9OiBQcm9wcykgPT4gKFxuICA8ZGl2PlxuICAgIDxoZWFkZXI+e2dyb3VwfTwvaGVhZGVyPlxuICAgIHtrZXJuZWxzLm1hcChrZXJuZWwgPT4ge1xuICAgICAgY29uc3QgZmlsZXMgPSBzdG9yZVxuICAgICAgICAuZ2V0RmlsZXNGb3JLZXJuZWwoa2VybmVsKVxuICAgICAgICAubWFwKHRpbGRpZnkpXG4gICAgICAgIC5qb2luKFwiLCBcIik7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8TW9uaXRvclxuICAgICAgICAgIGtlcm5lbD17a2VybmVsfVxuICAgICAgICAgIGZpbGVzPXtmaWxlc31cbiAgICAgICAgICBrZXk9e2tlcm5lbC5kaXNwbGF5TmFtZSArIGZpbGVzfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9KX1cbiAgPC9kaXY+XG4pKTtcblxuY29uc3QgS2VybmVsTW9uaXRvciA9IG9ic2VydmVyKCh7IHN0b3JlIH06IHsgc3RvcmU6IHN0b3JlIH0pID0+IHtcbiAgaWYgKHN0b3JlLnJ1bm5pbmdLZXJuZWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwiYmFja2dyb3VuZC1tZXNzYWdlIGNlbnRlcmVkXCI+XG4gICAgICAgIDxsaT5ObyBydW5uaW5nIGtlcm5lbHM8L2xpPlxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG4gIGNvbnN0IGdyb3VwZWQgPSBfLmdyb3VwQnkoXG4gICAgc3RvcmUucnVubmluZ0tlcm5lbHMsXG4gICAga2VybmVsID0+IGtlcm5lbC5nYXRld2F5TmFtZSB8fCBcIkxvY2FsXCJcbiAgKTtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImtlcm5lbC1tb25pdG9yXCI+XG4gICAgICB7Xy5tYXAoZ3JvdXBlZCwgKGtlcm5lbHMsIGdyb3VwKSA9PiAoXG4gICAgICAgIDxNb25pdG9yU2VjdGlvblxuICAgICAgICAgIHN0b3JlPXtzdG9yZX1cbiAgICAgICAgICBrZXJuZWxzPXtrZXJuZWxzfVxuICAgICAgICAgIGdyb3VwPXtncm91cH1cbiAgICAgICAgICBrZXk9e2dyb3VwfVxuICAgICAgICAvPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gICk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgS2VybmVsTW9uaXRvcjtcbiJdfQ==