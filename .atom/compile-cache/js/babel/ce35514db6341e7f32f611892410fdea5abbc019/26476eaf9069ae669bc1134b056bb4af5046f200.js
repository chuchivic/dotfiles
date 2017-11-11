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
      className: "native-key-bindings",
      tabIndex: "-1",
      style: {
        fontSize: atom.config.get("Hydrogen.outputAreaFontSize") || "inherit"
      }
    },
    _react2["default"].createElement(Transform, { data: bundle[mimetype] })
  );
});

exports["default"] = Inspector;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL2luc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7cUJBRWtCLE9BQU87Ozs7eUJBQ0EsWUFBWTs7aUNBQ08scUJBQXFCOztxQkFFbkMsWUFBWTs7QUFFMUMsSUFBTSxZQUFZLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDOztBQU1sRSxTQUFTLElBQUksR0FBRztBQUNkLE1BQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxzQkFBZSxDQUFDO0FBQ25DLFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsSUFBTSxTQUFTLEdBQUcseUJBQVMsVUFBQyxJQUFxQixFQUFZO01BQXRCLE1BQU0sR0FBakIsSUFBcUIsQ0FBbkIsS0FBSyxDQUFJLE1BQU07O0FBQzNDLE1BQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFM0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDdkMsTUFBTSxRQUFRLEdBQUcsd0NBQWdCLE1BQU0sRUFBRSxZQUFZLGdDQUFhLENBQUM7O0FBRW5FLE1BQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFN0IsTUFBTSxTQUFTLEdBQUcsOEJBQVcsUUFBUSxDQUFDLENBQUM7QUFDdkMsU0FDRTs7O0FBQ0UsZUFBUyxFQUFDLHFCQUFxQjtBQUMvQixjQUFRLEVBQUMsSUFBSTtBQUNiLFdBQUssRUFBRTtBQUNMLGdCQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLCtCQUErQixJQUFJLFNBQVM7T0FDdEUsQUFBQzs7SUFFRixpQ0FBQyxTQUFTLElBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQUFBQyxHQUFHO0dBQ2pDLENBQ047Q0FDSCxDQUFDLENBQUM7O3FCQUVZLFNBQVMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvaW5zcGVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IHsgcmljaGVzdE1pbWV0eXBlLCB0cmFuc2Zvcm1zIH0gZnJvbSBcIkBudGVyYWN0L3RyYW5zZm9ybXNcIjtcblxuaW1wb3J0IHsgSU5TUEVDVE9SX1VSSSB9IGZyb20gXCIuLy4uL3V0aWxzXCI7XG5cbmNvbnN0IGRpc3BsYXlPcmRlciA9IFtcInRleHQvaHRtbFwiLCBcInRleHQvbWFya2Rvd25cIiwgXCJ0ZXh0L3BsYWluXCJdO1xuXG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4vLi4va2VybmVsXCI7XG5cbnR5cGUgUHJvcHMgPSB7IHN0b3JlOiB7IGtlcm5lbDogP0tlcm5lbCB9IH07XG5cbmZ1bmN0aW9uIGhpZGUoKSB7XG4gIGF0b20ud29ya3NwYWNlLmhpZGUoSU5TUEVDVE9SX1VSSSk7XG4gIHJldHVybiBudWxsO1xufVxuXG5jb25zdCBJbnNwZWN0b3IgPSBvYnNlcnZlcigoeyBzdG9yZTogeyBrZXJuZWwgfSB9OiBQcm9wcykgPT4ge1xuICBpZiAoIWtlcm5lbCkgcmV0dXJuIGhpZGUoKTtcblxuICBjb25zdCBidW5kbGUgPSBrZXJuZWwuaW5zcGVjdG9yLmJ1bmRsZTtcbiAgY29uc3QgbWltZXR5cGUgPSByaWNoZXN0TWltZXR5cGUoYnVuZGxlLCBkaXNwbGF5T3JkZXIsIHRyYW5zZm9ybXMpO1xuXG4gIGlmICghbWltZXR5cGUpIHJldHVybiBoaWRlKCk7XG4gIC8vICRGbG93Rml4TWUgUmVhY3QgZWxlbWVudCBgVHJhbnNmb3JtYC4gRXhwZWN0ZWQgUmVhY3QgY29tcG9uZW50IGluc3RlYWQgb2YgVHJhbnNmb3JtXG4gIGNvbnN0IFRyYW5zZm9ybSA9IHRyYW5zZm9ybXNbbWltZXR5cGVdO1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cIm5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgdGFiSW5kZXg9XCItMVwiXG4gICAgICBzdHlsZT17e1xuICAgICAgICBmb250U2l6ZTogYXRvbS5jb25maWcuZ2V0KGBIeWRyb2dlbi5vdXRwdXRBcmVhRm9udFNpemVgKSB8fCBcImluaGVyaXRcIlxuICAgICAgfX1cbiAgICA+XG4gICAgICA8VHJhbnNmb3JtIGRhdGE9e2J1bmRsZVttaW1ldHlwZV19IC8+XG4gICAgPC9kaXY+XG4gICk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgSW5zcGVjdG9yO1xuIl19