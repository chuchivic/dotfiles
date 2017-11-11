Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _watch = require("./watch");

var _watch2 = _interopRequireDefault(_watch);

var _utils = require("../../utils");

var Watches = (0, _mobxReact.observer)(function (_ref) {
  var kernel = _ref.store.kernel;

  if (!kernel) {
    atom.workspace.hide(_utils.WATCHES_URI);
    return null;
  }
  return _react2["default"].createElement(
    "div",
    { className: "sidebar watch-sidebar" },
    kernel.watchesStore.watches.map(function (watch) {
      return _react2["default"].createElement(_watch2["default"], { key: watch.editor.id, store: watch });
    }),
    _react2["default"].createElement(
      "div",
      { className: "btn-group" },
      _react2["default"].createElement(
        "button",
        {
          className: "btn btn-primary icon icon-plus",
          onClick: kernel.watchesStore.addWatch
        },
        "Add watch"
      ),
      _react2["default"].createElement(
        "button",
        {
          className: "btn btn-error icon icon-trashcan",
          onClick: kernel.watchesStore.removeWatch
        },
        "Remove watch"
      )
    )
  );
});

exports["default"] = Watches;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3dhdGNoLXNpZGViYXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVvQyxNQUFNOztxQkFDeEIsT0FBTzs7Ozt5QkFDQSxZQUFZOztxQkFFbkIsU0FBUzs7OztxQkFDQyxhQUFhOztBQUt6QyxJQUFNLE9BQU8sR0FBRyx5QkFBUyxVQUFDLElBQXFCLEVBQXVCO01BQWpDLE1BQU0sR0FBakIsSUFBcUIsQ0FBbkIsS0FBSyxDQUFJLE1BQU07O0FBQ3pDLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxRQUFJLENBQUMsU0FBUyxDQUFDLElBQUksb0JBQWEsQ0FBQztBQUNqQyxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FDRTs7TUFBSyxTQUFTLEVBQUMsdUJBQXVCO0lBQ25DLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7YUFDcEMsdURBQU8sR0FBRyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxBQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssQUFBQyxHQUFHO0tBQzlDLENBQUM7SUFDRjs7UUFBSyxTQUFTLEVBQUMsV0FBVztNQUN4Qjs7O0FBQ0UsbUJBQVMsRUFBQyxnQ0FBZ0M7QUFDMUMsaUJBQU8sRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQUFBQzs7O09BRy9CO01BQ1Q7OztBQUNFLG1CQUFTLEVBQUMsa0NBQWtDO0FBQzVDLGlCQUFPLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLEFBQUM7OztPQUdsQztLQUNMO0dBQ0YsQ0FDTjtDQUNILENBQUMsQ0FBQzs7cUJBRVksT0FBTyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvY29tcG9uZW50cy93YXRjaC1zaWRlYmFyL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5cbmltcG9ydCBXYXRjaCBmcm9tIFwiLi93YXRjaFwiO1xuaW1wb3J0IHsgV0FUQ0hFU19VUkkgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLy4uLy4uL2tlcm5lbFwiO1xuaW1wb3J0IHR5cGVvZiBzdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcblxuY29uc3QgV2F0Y2hlcyA9IG9ic2VydmVyKCh7IHN0b3JlOiB7IGtlcm5lbCB9IH06IHsgc3RvcmU6IHN0b3JlIH0pID0+IHtcbiAgaWYgKCFrZXJuZWwpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5oaWRlKFdBVENIRVNfVVJJKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwic2lkZWJhciB3YXRjaC1zaWRlYmFyXCI+XG4gICAgICB7a2VybmVsLndhdGNoZXNTdG9yZS53YXRjaGVzLm1hcCh3YXRjaCA9PiAoXG4gICAgICAgIDxXYXRjaCBrZXk9e3dhdGNoLmVkaXRvci5pZH0gc3RvcmU9e3dhdGNofSAvPlxuICAgICAgKSl9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5IGljb24gaWNvbi1wbHVzXCJcbiAgICAgICAgICBvbkNsaWNrPXtrZXJuZWwud2F0Y2hlc1N0b3JlLmFkZFdhdGNofVxuICAgICAgICA+XG4gICAgICAgICAgQWRkIHdhdGNoXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1lcnJvciBpY29uIGljb24tdHJhc2hjYW5cIlxuICAgICAgICAgIG9uQ2xpY2s9e2tlcm5lbC53YXRjaGVzU3RvcmUucmVtb3ZlV2F0Y2h9XG4gICAgICAgID5cbiAgICAgICAgICBSZW1vdmUgd2F0Y2hcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBXYXRjaGVzO1xuIl19