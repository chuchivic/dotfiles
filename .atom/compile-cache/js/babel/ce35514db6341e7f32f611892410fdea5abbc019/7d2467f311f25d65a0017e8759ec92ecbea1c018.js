Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobx = require("mobx");

var _mobxReact = require("mobx-react");

var _nteractDisplayArea = require("@nteract/display-area");

var _nteractTransforms = require("@nteract/transforms");

var _reactRangeslider = require("react-rangeslider");

var _reactRangeslider2 = _interopRequireDefault(_reactRangeslider);

var _transforms = require("./transforms");

var counterStyle = {
  position: "absolute",
  pointerEvents: "none",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)"
};

var History = (0, _mobxReact.observer)(function (_ref) {
  var store = _ref.store;
  return (function () {
    var output = store.outputs[store.index];
    return output ? _react2["default"].createElement(
      "div",
      { className: "history" },
      _react2["default"].createElement(
        "div",
        { className: "slider" },
        _react2["default"].createElement("div", {
          className: "btn btn-xs icon icon-chevron-left",
          style: { position: "absolute", left: "0px" },
          onClick: store.decrementIndex
        }),
        _react2["default"].createElement(_reactRangeslider2["default"], {
          min: 0,
          max: store.outputs.length - 1,
          value: store.index,
          onChange: store.setIndex,
          tooltip: false
        }),
        _react2["default"].createElement(
          "div",
          { style: counterStyle },
          store.index + 1,
          "/",
          store.outputs.length
        ),
        _react2["default"].createElement("div", {
          className: "btn btn-xs icon icon-chevron-right",
          style: { position: "absolute", right: "0px" },
          onClick: store.incrementIndex
        })
      ),
      _react2["default"].createElement(
        "div",
        {
          className: "multiline-container native-key-bindings",
          tabIndex: "-1",
          style: {
            fontSize: atom.config.get("Hydrogen.outputAreaFontSize") || "inherit"
          }
        },
        _react2["default"].createElement(_nteractDisplayArea.Output, {
          output: (0, _mobx.toJS)(output),
          displayOrder: _transforms.displayOrder,
          transforms: _transforms.transforms,
          theme: "light",
          models: {},
          expanded: true
        })
      )
    ) : null;
  })();
});

exports["default"] = History;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L2hpc3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3FCQUVrQixPQUFPOzs7O29CQUNKLE1BQU07O3lCQUNGLFlBQVk7O2tDQUNkLHVCQUF1Qjs7aUNBQ2QscUJBQXFCOztnQ0FDbEMsbUJBQW1COzs7OzBCQUVHLGNBQWM7O0FBSXZELElBQU0sWUFBWSxHQUFHO0FBQ25CLFVBQVEsRUFBRSxVQUFVO0FBQ3BCLGVBQWEsRUFBRSxNQUFNO0FBQ3JCLE1BQUksRUFBRSxLQUFLO0FBQ1gsS0FBRyxFQUFFLEtBQUs7QUFDVixXQUFTLEVBQUUsdUJBQXVCO0NBQ25DLENBQUM7O0FBRUYsSUFBTSxPQUFPLEdBQUcseUJBQVMsVUFBQyxJQUFTO01BQVAsS0FBSyxHQUFQLElBQVMsQ0FBUCxLQUFLO3NCQUErQjtBQUM5RCxRQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMxQyxXQUFPLE1BQU0sR0FDWDs7UUFBSyxTQUFTLEVBQUMsU0FBUztNQUN0Qjs7VUFBSyxTQUFTLEVBQUMsUUFBUTtRQUNyQjtBQUNFLG1CQUFTLEVBQUMsbUNBQW1DO0FBQzdDLGVBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxBQUFDO0FBQzdDLGlCQUFPLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztVQUM5QjtRQUNGO0FBQ0UsYUFBRyxFQUFFLENBQUMsQUFBQztBQUNQLGFBQUcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUM7QUFDOUIsZUFBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEFBQUM7QUFDbkIsa0JBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxBQUFDO0FBQ3pCLGlCQUFPLEVBQUUsS0FBSyxBQUFDO1VBQ2Y7UUFDRjs7WUFBSyxLQUFLLEVBQUUsWUFBWSxBQUFDO1VBQ3RCLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQzs7VUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU07U0FDbkM7UUFDTjtBQUNFLG1CQUFTLEVBQUMsb0NBQW9DO0FBQzlDLGVBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxBQUFDO0FBQzlDLGlCQUFPLEVBQUUsS0FBSyxDQUFDLGNBQWMsQUFBQztVQUM5QjtPQUNFO01BQ047OztBQUNFLG1CQUFTLEVBQUMseUNBQXlDO0FBQ25ELGtCQUFRLEVBQUMsSUFBSTtBQUNiLGVBQUssRUFBRTtBQUNMLG9CQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLCtCQUErQixJQUFJLFNBQVM7V0FDdEUsQUFBQzs7UUFFRjtBQUNFLGdCQUFNLEVBQUUsZ0JBQUssTUFBTSxDQUFDLEFBQUM7QUFDckIsc0JBQVksMEJBQWU7QUFDM0Isb0JBQVUsd0JBQWE7QUFDdkIsZUFBSyxFQUFDLE9BQU87QUFDYixnQkFBTSxFQUFFLEVBQUUsQUFBQztBQUNYLGtCQUFRLE1BQUE7VUFDUjtPQUNFO0tBQ0YsR0FDSixJQUFJLENBQUM7R0FDVjtDQUFBLENBQUMsQ0FBQzs7cUJBRVksT0FBTyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvY29tcG9uZW50cy9yZXN1bHQtdmlldy9oaXN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdG9KUyB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5pbXBvcnQgeyBPdXRwdXQgfSBmcm9tIFwiQG50ZXJhY3QvZGlzcGxheS1hcmVhXCI7XG5pbXBvcnQgeyByaWNoZXN0TWltZXR5cGUgfSBmcm9tIFwiQG50ZXJhY3QvdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IFNsaWRlciBmcm9tIFwicmVhY3QtcmFuZ2VzbGlkZXJcIjtcblxuaW1wb3J0IHsgdHJhbnNmb3JtcywgZGlzcGxheU9yZGVyIH0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuXG5pbXBvcnQgdHlwZSBPdXRwdXRTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmUvb3V0cHV0XCI7XG5cbmNvbnN0IGNvdW50ZXJTdHlsZSA9IHtcbiAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgcG9pbnRlckV2ZW50czogXCJub25lXCIsXG4gIGxlZnQ6IFwiNTAlXCIsXG4gIHRvcDogXCI1MCVcIixcbiAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZSgtNTAlLCAtNTAlKVwiXG59O1xuXG5jb25zdCBIaXN0b3J5ID0gb2JzZXJ2ZXIoKHsgc3RvcmUgfTogeyBzdG9yZTogT3V0cHV0U3RvcmUgfSkgPT4ge1xuICBjb25zdCBvdXRwdXQgPSBzdG9yZS5vdXRwdXRzW3N0b3JlLmluZGV4XTtcbiAgcmV0dXJuIG91dHB1dCA/IChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImhpc3RvcnlcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2xpZGVyXCI+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXhzIGljb24gaWNvbi1jaGV2cm9uLWxlZnRcIlxuICAgICAgICAgIHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsIGxlZnQ6IFwiMHB4XCIgfX1cbiAgICAgICAgICBvbkNsaWNrPXtzdG9yZS5kZWNyZW1lbnRJbmRleH1cbiAgICAgICAgLz5cbiAgICAgICAgPFNsaWRlclxuICAgICAgICAgIG1pbj17MH1cbiAgICAgICAgICBtYXg9e3N0b3JlLm91dHB1dHMubGVuZ3RoIC0gMX1cbiAgICAgICAgICB2YWx1ZT17c3RvcmUuaW5kZXh9XG4gICAgICAgICAgb25DaGFuZ2U9e3N0b3JlLnNldEluZGV4fVxuICAgICAgICAgIHRvb2x0aXA9e2ZhbHNlfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IHN0eWxlPXtjb3VudGVyU3R5bGV9PlxuICAgICAgICAgIHtzdG9yZS5pbmRleCArIDF9L3tzdG9yZS5vdXRwdXRzLmxlbmd0aH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXhzIGljb24gaWNvbi1jaGV2cm9uLXJpZ2h0XCJcbiAgICAgICAgICBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCByaWdodDogXCIwcHhcIiB9fVxuICAgICAgICAgIG9uQ2xpY2s9e3N0b3JlLmluY3JlbWVudEluZGV4fVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cIm11bHRpbGluZS1jb250YWluZXIgbmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgIHRhYkluZGV4PVwiLTFcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGZvbnRTaXplOiBhdG9tLmNvbmZpZy5nZXQoYEh5ZHJvZ2VuLm91dHB1dEFyZWFGb250U2l6ZWApIHx8IFwiaW5oZXJpdFwiXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxPdXRwdXRcbiAgICAgICAgICBvdXRwdXQ9e3RvSlMob3V0cHV0KX1cbiAgICAgICAgICBkaXNwbGF5T3JkZXI9e2Rpc3BsYXlPcmRlcn1cbiAgICAgICAgICB0cmFuc2Zvcm1zPXt0cmFuc2Zvcm1zfVxuICAgICAgICAgIHRoZW1lPVwibGlnaHRcIlxuICAgICAgICAgIG1vZGVscz17e319XG4gICAgICAgICAgZXhwYW5kZWRcbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApIDogbnVsbDtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5O1xuIl19