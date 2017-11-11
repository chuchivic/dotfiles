Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.toggleInspector = toggleInspector;

var _utils = require("./utils");

var _codeManager = require("./code-manager");

function toggleInspector(store) {
  var editor = store.editor;
  var kernel = store.kernel;

  if (!editor || !kernel) {
    atom.notifications.addInfo("No kernel running!");
    return;
  }

  var _getCodeToInspect = (0, _codeManager.getCodeToInspect)(editor);

  var _getCodeToInspect2 = _slicedToArray(_getCodeToInspect, 2);

  var code = _getCodeToInspect2[0];
  var cursorPos = _getCodeToInspect2[1];

  if (!code || cursorPos === 0) {
    atom.notifications.addInfo("No code to introspect!");
    return;
  }

  kernel.inspect(code, cursorPos, function (result) {
    (0, _utils.log)("Inspector: Result:", result);

    if (!result.found) {
      atom.workspace.hide(_utils.INSPECTOR_URI);
      atom.notifications.addInfo("No introspection available!");
      return;
    }

    kernel.setInspectorResult(result.data, editor);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztxQkFFaUQsU0FBUzs7MkJBQ3pCLGdCQUFnQjs7QUFJMUMsU0FBUyxlQUFlLENBQUMsS0FBWSxFQUFFO01BQ3BDLE1BQU0sR0FBYSxLQUFLLENBQXhCLE1BQU07TUFBRSxNQUFNLEdBQUssS0FBSyxDQUFoQixNQUFNOztBQUN0QixNQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3RCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDakQsV0FBTztHQUNSOzswQkFFeUIsbUNBQWlCLE1BQU0sQ0FBQzs7OztNQUEzQyxJQUFJO01BQUUsU0FBUzs7QUFDdEIsTUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUFFO0FBQzVCLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDckQsV0FBTztHQUNSOztBQUVELFFBQU0sQ0FBQyxPQUFPLENBQ1osSUFBSSxFQUNKLFNBQVMsRUFDVCxVQUFDLE1BQU0sRUFBdUM7QUFDNUMsb0JBQUksb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxDLFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO0FBQ2pCLFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQkFBZSxDQUFDO0FBQ25DLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDMUQsYUFBTztLQUNSOztBQUVELFVBQU0sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQ2hELENBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IGxvZywgcmVhY3RGYWN0b3J5LCBJTlNQRUNUT1JfVVJJIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCB7IGdldENvZGVUb0luc3BlY3QgfSBmcm9tIFwiLi9jb2RlLW1hbmFnZXJcIjtcblxuaW1wb3J0IHR5cGVvZiBzdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlSW5zcGVjdG9yKHN0b3JlOiBzdG9yZSkge1xuICBjb25zdCB7IGVkaXRvciwga2VybmVsIH0gPSBzdG9yZTtcbiAgaWYgKCFlZGl0b3IgfHwgIWtlcm5lbCkge1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiTm8ga2VybmVsIHJ1bm5pbmchXCIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IFtjb2RlLCBjdXJzb3JQb3NdID0gZ2V0Q29kZVRvSW5zcGVjdChlZGl0b3IpO1xuICBpZiAoIWNvZGUgfHwgY3Vyc29yUG9zID09PSAwKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjb2RlIHRvIGludHJvc3BlY3QhXCIpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGtlcm5lbC5pbnNwZWN0KFxuICAgIGNvZGUsXG4gICAgY3Vyc29yUG9zLFxuICAgIChyZXN1bHQ6IHsgZGF0YTogT2JqZWN0LCBmb3VuZDogQm9vbGVhbiB9KSA9PiB7XG4gICAgICBsb2coXCJJbnNwZWN0b3I6IFJlc3VsdDpcIiwgcmVzdWx0KTtcblxuICAgICAgaWYgKCFyZXN1bHQuZm91bmQpIHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuaGlkZShJTlNQRUNUT1JfVVJJKTtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBpbnRyb3NwZWN0aW9uIGF2YWlsYWJsZSFcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAga2VybmVsLnNldEluc3BlY3RvclJlc3VsdChyZXN1bHQuZGF0YSwgZWRpdG9yKTtcbiAgICB9XG4gICk7XG59XG4iXX0=