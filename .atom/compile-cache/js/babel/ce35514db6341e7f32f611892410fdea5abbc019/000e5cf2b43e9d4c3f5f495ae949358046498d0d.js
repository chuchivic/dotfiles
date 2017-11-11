Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _nteractTransforms = require("@nteract/transforms");

var _utils = require("./../utils");

var displayOrder = ["text/html", "text/markdown", "text/plain"];

function hide() {
  atom.workspace.hide(_utils.INSPECTOR_URI);
  return null;
}

var Inspector = (0, _mobxReact.observer)(function (_ref) {
  var kernel = _ref.store.kernel;

  if (!kernel) return hide();

  var bundle = kernel.inspector.bundle;
  var mimetype = (0, _nteractTransforms.richestMimetype)(bundle, displayOrder, _nteractTransforms.transforms);

  if (!mimetype) return hide();
  // $FlowFixMe React element `Transform`. Expected React component instead of Transform
  var Transform = _nteractTransforms.transforms[mimetype];
  return _react2["default"].createElement(
    "div",
    {
      style: {
        fontSize: atom.config.get("Hydrogen.outputAreaFontSize") || "inherit"
      }
    },
    _react2["default"].createElement(Transform, { data: bundle[mimetype] })
  );
});

exports["default"] = Inspector;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL2luc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRWtCLE9BQU87Ozs7eUJBQ0EsWUFBWTs7aUNBQ08scUJBQXFCOztxQkFFbkMsWUFBWTs7QUFFMUMsSUFBTSxZQUFZLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQU1sRSxTQUFTLElBQUksR0FBRztBQUNkLE1BQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQkFBZSxDQUFDO0FBQ25DLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsSUFBTSxTQUFTLEdBQUcseUJBQVMsVUFBQyxJQUFxQixFQUFZO01BQXRCLE1BQU0sR0FBakIsSUFBcUIsQ0FBbkIsS0FBSyxDQUFJLE1BQU07O0FBQzNDLE1BQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFM0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDdkMsTUFBTSxRQUFRLEdBQUcsd0NBQWdCLE1BQU0sRUFBRSxZQUFZLGdDQUFhLENBQUM7O0FBRW5FLE1BQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFN0IsTUFBTSxTQUFTLEdBQUcsOEJBQVcsUUFBUSxDQUFDLENBQUM7QUFDdkMsU0FDRTs7O0FBQ0UsV0FBSyxFQUFFO0FBQ0wsZ0JBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsK0JBQStCLElBQUksU0FBUztPQUN0RSxBQUFDOztJQUVGLGlDQUFDLFNBQVMsSUFBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxBQUFDLEdBQUc7R0FDakMsQ0FDTjtDQUNILENBQUMsQ0FBQzs7cUJBRVksU0FBUyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvY29tcG9uZW50cy9pbnNwZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5pbXBvcnQgeyByaWNoZXN0TWltZXR5cGUsIHRyYW5zZm9ybXMgfSBmcm9tIFwiQG50ZXJhY3QvdHJhbnNmb3Jtc1wiO1xuXG5pbXBvcnQgeyBJTlNQRUNUT1JfVVJJIH0gZnJvbSBcIi4vLi4vdXRpbHNcIjtcblxuY29uc3QgZGlzcGxheU9yZGVyID0gW1widGV4dC9odG1sXCIsIFwidGV4dC9tYXJrZG93blwiLCBcInRleHQvcGxhaW5cIl07XG5cbmltcG9ydCB0eXBlIEtlcm5lbCBmcm9tIFwiLi8uLi9rZXJuZWxcIjtcblxudHlwZSBQcm9wcyA9IHsgc3RvcmU6IHsga2VybmVsOiA/S2VybmVsIH0gfTtcblxuZnVuY3Rpb24gaGlkZSgpIHtcbiAgYXRvbS53b3Jrc3BhY2UuaGlkZShJTlNQRUNUT1JfVVJJKTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmNvbnN0IEluc3BlY3RvciA9IG9ic2VydmVyKCh7IHN0b3JlOiB7IGtlcm5lbCB9IH06IFByb3BzKSA9PiB7XG4gIGlmICgha2VybmVsKSByZXR1cm4gaGlkZSgpO1xuXG4gIGNvbnN0IGJ1bmRsZSA9IGtlcm5lbC5pbnNwZWN0b3IuYnVuZGxlO1xuICBjb25zdCBtaW1ldHlwZSA9IHJpY2hlc3RNaW1ldHlwZShidW5kbGUsIGRpc3BsYXlPcmRlciwgdHJhbnNmb3Jtcyk7XG5cbiAgaWYgKCFtaW1ldHlwZSkgcmV0dXJuIGhpZGUoKTtcbiAgLy8gJEZsb3dGaXhNZSBSZWFjdCBlbGVtZW50IGBUcmFuc2Zvcm1gLiBFeHBlY3RlZCBSZWFjdCBjb21wb25lbnQgaW5zdGVhZCBvZiBUcmFuc2Zvcm1cbiAgY29uc3QgVHJhbnNmb3JtID0gdHJhbnNmb3Jtc1ttaW1ldHlwZV07XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgc3R5bGU9e3tcbiAgICAgICAgZm9udFNpemU6IGF0b20uY29uZmlnLmdldChgSHlkcm9nZW4ub3V0cHV0QXJlYUZvbnRTaXplYCkgfHwgXCJpbmhlcml0XCJcbiAgICAgIH19XG4gICAgPlxuICAgICAgPFRyYW5zZm9ybSBkYXRhPXtidW5kbGVbbWltZXR5cGVdfSAvPlxuICAgIDwvZGl2PlxuICApO1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEluc3BlY3RvcjtcbiJdfQ==