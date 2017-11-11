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

var _mobxReact = require("mobx-react");

var _mobx = require("mobx");

var _nteractDisplayAreaLibDisplay = require("@nteract/display-area/lib/display");

var _nteractDisplayAreaLibDisplay2 = _interopRequireDefault(_nteractDisplayAreaLibDisplay);

var _transforms = require("./transforms");

var _status = require("./status");

var _status2 = _interopRequireDefault(_status);

var ResultViewComponent = (function (_React$Component) {
  var _instanceInitializers = {};

  _inherits(ResultViewComponent, _React$Component);

  function ResultViewComponent() {
    var _this = this;

    _classCallCheck(this, _ResultViewComponent);

    _get(Object.getPrototypeOf(_ResultViewComponent.prototype), "constructor", this).apply(this, arguments);

    this.containerTooltip = new _atom.CompositeDisposable();
    this.buttonTooltip = new _atom.CompositeDisposable();
    this.closeTooltip = new _atom.CompositeDisposable();
    this.expanded = (0, _mobx.observable)(false);

    this.getAllText = function () {
      if (!_this.el) return "";
      return _this.el.innerText ? _this.el.innerText.trim() : "";
    };

    this.handleClick = function (event) {
      if (event.ctrlKey || event.metaKey) {
        _this.openInEditor();
      } else {
        _this.copyToClipboard();
      }
    };

    this.copyToClipboard = function () {
      atom.clipboard.write(_this.getAllText());
      atom.notifications.addSuccess("Copied to clipboard");
    };

    this.openInEditor = function () {
      atom.workspace.open().then(function (editor) {
        return editor.insertText(_this.getAllText());
      });
    };

    this.addCopyTooltip = function (element, comp) {
      if (!element || !comp.disposables || comp.disposables.size > 0) return;
      comp.add(atom.tooltips.add(element, {
        title: "Click to copy,\n          " + (process.platform === "darwin" ? "Cmd" : "Ctrl") + "+Click to open in editor"
      }));
    };

    this.addCloseButtonTooltip = function (element, comp) {
      if (!element || !comp.disposables || comp.disposables.size > 0) return;
      comp.add(atom.tooltips.add(element, {
        title: _this.props.store.executionCount ? "Close (Out[" + _this.props.store.executionCount + "])" : "Close result"
      }));
    };

    this.addCopyButtonTooltip = function (element) {
      _this.addCopyTooltip(element, _this.buttonTooltip);
    };

    this.onWheel = function (element) {
      return function (event) {
        var clientHeight = element.clientHeight;
        var scrollHeight = element.scrollHeight;
        var scrollTop = element.scrollTop;
        var atTop = scrollTop !== 0 && event.deltaY < 0;
        var atBottom = scrollTop !== scrollHeight - clientHeight && event.deltaY > 0;

        if (clientHeight < scrollHeight && (atTop || atBottom)) {
          event.stopPropagation();
        }
      };
    };

    _defineDecoratedPropertyDescriptor(this, "toggleExpand", _instanceInitializers);
  }

  _createDecoratedClass(ResultViewComponent, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props$store = this.props.store;
      var outputs = _props$store.outputs;
      var status = _props$store.status;
      var isPlain = _props$store.isPlain;
      var position = _props$store.position;

      var inlineStyle = {
        marginLeft: position.lineLength + position.charWidth + "px",
        marginTop: "-" + position.lineHeight + "px"
      };

      if (outputs.length === 0 || this.props.showResult === false) {
        var _kernel = this.props.kernel;
        return _react2["default"].createElement(_status2["default"], {
          status: _kernel && _kernel.executionState !== "busy" && status === "running" ? "error" : status,
          style: inlineStyle
        });
      }

      return _react2["default"].createElement(
        "div",
        {
          className: isPlain ? "inline-container" : "multiline-container",
          onClick: isPlain ? this.handleClick : false,
          style: isPlain ? inlineStyle : { maxWidth: position.editorWidth + "px", margin: "0px" }
        },
        _react2["default"].createElement(_nteractDisplayAreaLibDisplay2["default"], {
          ref: function (ref) {
            if (!ref || !ref.el) return;
            _this2.el = ref.el;

            isPlain ? _this2.addCopyTooltip(ref.el, _this2.containerTooltip) : _this2.containerTooltip.dispose();

            // React's event handler doesn't properly handle event.stopPropagation() for
            // events outside the React context. Using proxy.el saves us a extra div.
            // We only need this in the text editor, therefore we check showStatus.
            if (!_this2.expanded.get() && !isPlain && ref.el) {
              ref.el.addEventListener("wheel", _this2.onWheel(ref.el), {
                passive: true
              });
            }
          },
          outputs: (0, _mobx.toJS)(outputs),
          displayOrder: _transforms.displayOrder,
          transforms: _transforms.transforms,
          theme: "light",
          models: {},
          expanded: this.expanded.get()
        }),
        isPlain ? null : _react2["default"].createElement(
          "div",
          { className: "toolbar" },
          _react2["default"].createElement("div", {
            className: "icon icon-x",
            onClick: this.props.destroy,
            ref: function (ref) {
              return _this2.addCloseButtonTooltip(ref, _this2.closeTooltip);
            }
          }),
          _react2["default"].createElement("div", { style: { flex: 1, minHeight: "0.25em" } }),
          this.getAllText().length > 0 ? _react2["default"].createElement("div", {
            className: "icon icon-clippy",
            onClick: this.handleClick,
            ref: this.addCopyButtonTooltip
          }) : null,
          this.el && this.el.scrollHeight > _nteractDisplayAreaLibDisplay.DEFAULT_SCROLL_HEIGHT ? _react2["default"].createElement("div", {
            className: "icon icon-" + (this.expanded.get() ? "fold" : "unfold"),
            onClick: this.toggleExpand
          }) : null
        )
      );
    }
  }, {
    key: "scrollToBottom",
    value: function scrollToBottom() {
      if (!this.el || this.expanded === true || this.props.store.isPlain === true || atom.config.get("Hydrogen.autoScroll") === false) return;
      var scrollHeight = this.el.scrollHeight;
      var height = this.el.clientHeight;
      var maxScrollTop = scrollHeight - height;
      this.el.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.scrollToBottom();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.containerTooltip.dispose();
      this.buttonTooltip.dispose();
      this.closeTooltip.dispose();
    }
  }, {
    key: "toggleExpand",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.expanded.set(!_this3.expanded.get());
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  var _ResultViewComponent = ResultViewComponent;
  ResultViewComponent = (0, _mobxReact.observer)(ResultViewComponent) || ResultViewComponent;
  return ResultViewComponent;
})(_react2["default"].Component);

exports["default"] = ResultViewComponent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3Jlc3VsdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3FCQUN4QixPQUFPOzs7O3lCQUNBLFlBQVk7O29CQUNJLE1BQU07OzRDQUd4QyxtQ0FBbUM7Ozs7MEJBQ0QsY0FBYzs7c0JBQ3BDLFVBQVU7Ozs7SUFjdkIsbUJBQW1COzs7WUFBbkIsbUJBQW1COztXQUFuQixtQkFBbUI7Ozs7Ozs7U0FFdkIsZ0JBQWdCLEdBQUcsK0JBQXlCO1NBQzVDLGFBQWEsR0FBRywrQkFBeUI7U0FDekMsWUFBWSxHQUFHLCtCQUF5QjtTQUN4QyxRQUFRLEdBQThCLHNCQUFXLEtBQUssQ0FBQzs7U0FFdkQsVUFBVSxHQUFHLFlBQU07QUFDakIsVUFBSSxDQUFDLE1BQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQ3hCLGFBQU8sTUFBSyxFQUFFLENBQUMsU0FBUyxHQUFHLE1BQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7S0FDMUQ7O1NBRUQsV0FBVyxHQUFHLFVBQUMsS0FBSyxFQUFpQjtBQUNuQyxVQUFJLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRTtBQUNsQyxjQUFLLFlBQVksRUFBRSxDQUFDO09BQ3JCLE1BQU07QUFDTCxjQUFLLGVBQWUsRUFBRSxDQUFDO09BQ3hCO0tBQ0Y7O1NBRUQsZUFBZSxHQUFHLFlBQU07QUFDdEIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBSyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDdEQ7O1NBRUQsWUFBWSxHQUFHLFlBQU07QUFDbkIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJ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MUMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUM7QUFDcEMsVUFBTSxZQUFZLEdBQUcsWUFBWSxHQUFHLE1BQU0sQ0FBQztBQUMzQyxVQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsR0FBRyxZQUFZLEdBQUcsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUM7S0FDekQ7OztXQUVpQiw4QkFBRztBQUNuQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7OztXQUVnQiw2QkFBRztBQUNsQixVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7OztXQUVtQixnQ0FBRztBQUNyQixVQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7Ozs7O2FBdkhjLFlBQU07QUFDbkIsZUFBSyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztPQUN6Qzs7Ozs7NkJBN0VHLG1CQUFtQjtBQUFuQixxQkFBbUIsNEJBQW5CLG1CQUFtQixLQUFuQixtQkFBbUI7U0FBbkIsbUJBQW1CO0dBQVMsbUJBQU0sU0FBUzs7cUJBcU1sQyxtQkFBbUIiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvcmVzdWx0LXZpZXcvcmVzdWx0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSBcImF0b21cIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSBcIm1vYngtcmVhY3RcIjtcbmltcG9ydCB7IGFjdGlvbiwgb2JzZXJ2YWJsZSwgdG9KUyB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgRGlzcGxheSwge1xuICBERUZBVUxUX1NDUk9MTF9IRUlHSFRcbn0gZnJvbSBcIkBudGVyYWN0L2Rpc3BsYXktYXJlYS9saWIvZGlzcGxheVwiO1xuaW1wb3J0IHsgdHJhbnNmb3JtcywgZGlzcGxheU9yZGVyIH0gZnJvbSBcIi4vdHJhbnNmb3Jtc1wiO1xuaW1wb3J0IFN0YXR1cyBmcm9tIFwiLi9zdGF0dXNcIjtcblxuaW1wb3J0IHR5cGUgeyBJT2JzZXJ2YWJsZVZhbHVlIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB0eXBlIE91dHB1dFN0b3JlIGZyb20gXCIuLy4uLy4uL3N0b3JlL291dHB1dFwiO1xuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLy4uLy4uL2tlcm5lbFwiO1xuXG50eXBlIFByb3BzID0ge1xuICBzdG9yZTogT3V0cHV0U3RvcmUsXG4gIGtlcm5lbDogP0tlcm5lbCxcbiAgZGVzdHJveTogRnVuY3Rpb24sXG4gIHNob3dSZXN1bHQ6IGJvb2xlYW5cbn07XG5cbkBvYnNlcnZlclxuY2xhc3MgUmVzdWx0Vmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcz4ge1xuICBlbDogP0hUTUxFbGVtZW50O1xuICBjb250YWluZXJUb29sdGlwID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgYnV0dG9uVG9vbHRpcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIGNsb3NlVG9vbHRpcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIGV4cGFuZGVkOiBJT2JzZXJ2YWJsZVZhbHVlPGJvb2xlYW4+ID0gb2JzZXJ2YWJsZShmYWxzZSk7XG5cbiAgZ2V0QWxsVGV4dCA9ICgpID0+IHtcbiAgICBpZiAoIXRoaXMuZWwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiB0aGlzLmVsLmlubmVyVGV4dCA/IHRoaXMuZWwuaW5uZXJUZXh0LnRyaW0oKSA6IFwiXCI7XG4gIH07XG5cbiAgaGFuZGxlQ2xpY2sgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KSB7XG4gICAgICB0aGlzLm9wZW5JbkVkaXRvcigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvcHlUb0NsaXBib2FyZCgpO1xuICAgIH1cbiAgfTtcblxuICBjb3B5VG9DbGlwYm9hcmQgPSAoKSA9PiB7XG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGhpcy5nZXRBbGxUZXh0KCkpO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiQ29waWVkIHRvIGNsaXBib2FyZFwiKTtcbiAgfTtcblxuICBvcGVuSW5FZGl0b3IgPSAoKSA9PiB7XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpLnRoZW4oZWRpdG9yID0+IGVkaXRvci5pbnNlcnRUZXh0KHRoaXMuZ2V0QWxsVGV4dCgpKSk7XG4gIH07XG5cbiAgYWRkQ29weVRvb2x0aXAgPSAoZWxlbWVudDogP0hUTUxFbGVtZW50LCBjb21wOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGUpID0+IHtcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWNvbXAuZGlzcG9zYWJsZXMgfHwgY29tcC5kaXNwb3NhYmxlcy5zaXplID4gMCkgcmV0dXJuO1xuICAgIGNvbXAuYWRkKFxuICAgICAgYXRvbS50b29sdGlwcy5hZGQoZWxlbWVudCwge1xuICAgICAgICB0aXRsZTogYENsaWNrIHRvIGNvcHksXG4gICAgICAgICAgJHtwcm9jZXNzLnBsYXRmb3JtID09PSBcImRhcndpblwiXG4gICAgICAgICAgICA/IFwiQ21kXCJcbiAgICAgICAgICAgIDogXCJDdHJsXCJ9K0NsaWNrIHRvIG9wZW4gaW4gZWRpdG9yYFxuICAgICAgfSlcbiAgICApO1xuICB9O1xuXG4gIGFkZENsb3NlQnV0dG9uVG9vbHRpcCA9IChcbiAgICBlbGVtZW50OiA/SFRNTEVsZW1lbnQsXG4gICAgY29tcDogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlXG4gICkgPT4ge1xuICAgIGlmICghZWxlbWVudCB8fCAhY29tcC5kaXNwb3NhYmxlcyB8fCBjb21wLmRpc3Bvc2FibGVzLnNpemUgPiAwKSByZXR1cm47XG4gICAgY29tcC5hZGQoXG4gICAgICBhdG9tLnRvb2x0aXBzLmFkZChlbGVtZW50LCB7XG4gICAgICAgIHRpdGxlOiB0aGlzLnByb3BzLnN0b3JlLmV4ZWN1dGlvbkNvdW50XG4gICAgICAgICAgPyBgQ2xvc2UgKE91dFske3RoaXMucHJvcHMuc3RvcmUuZXhlY3V0aW9uQ291bnR9XSlgXG4gICAgICAgICAgOiBcIkNsb3NlIHJlc3VsdFwiXG4gICAgICB9KVxuICAgICk7XG4gIH07XG5cbiAgYWRkQ29weUJ1dHRvblRvb2x0aXAgPSAoZWxlbWVudDogP0hUTUxFbGVtZW50KSA9PiB7XG4gICAgdGhpcy5hZGRDb3B5VG9vbHRpcChlbGVtZW50LCB0aGlzLmJ1dHRvblRvb2x0aXApO1xuICB9O1xuXG4gIG9uV2hlZWwgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICByZXR1cm4gKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBjbGllbnRIZWlnaHQgPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIGNvbnN0IHNjcm9sbEhlaWdodCA9IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gZWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICBjb25zdCBhdFRvcCA9IHNjcm9sbFRvcCAhPT0gMCAmJiBldmVudC5kZWx0YVkgPCAwO1xuICAgICAgY29uc3QgYXRCb3R0b20gPVxuICAgICAgICBzY3JvbGxUb3AgIT09IHNjcm9sbEhlaWdodCAtIGNsaWVudEhlaWdodCAmJiBldmVudC5kZWx0YVkgPiAwO1xuXG4gICAgICBpZiAoY2xpZW50SGVpZ2h0IDwgc2Nyb2xsSGVpZ2h0ICYmIChhdFRvcCB8fCBhdEJvdHRvbSkpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBAYWN0aW9uXG4gIHRvZ2dsZUV4cGFuZCA9ICgpID0+IHtcbiAgICB0aGlzLmV4cGFuZGVkLnNldCghdGhpcy5leHBhbmRlZC5nZXQoKSk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgb3V0cHV0cywgc3RhdHVzLCBpc1BsYWluLCBwb3NpdGlvbiB9ID0gdGhpcy5wcm9wcy5zdG9yZTtcblxuICAgIGNvbnN0IGlubGluZVN0eWxlID0ge1xuICAgICAgbWFyZ2luTGVmdDogYCR7cG9zaXRpb24ubGluZUxlbmd0aCArIHBvc2l0aW9uLmNoYXJXaWR0aH1weGAsXG4gICAgICBtYXJnaW5Ub3A6IGAtJHtwb3NpdGlvbi5saW5lSGVpZ2h0fXB4YFxuICAgIH07XG5cbiAgICBpZiAob3V0cHV0cy5sZW5ndGggPT09IDAgfHwgdGhpcy5wcm9wcy5zaG93UmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgY29uc3Qga2VybmVsID0gdGhpcy5wcm9wcy5rZXJuZWw7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8U3RhdHVzXG4gICAgICAgICAgc3RhdHVzPXtcbiAgICAgICAgICAgIGtlcm5lbCAmJiBrZXJuZWwuZXhlY3V0aW9uU3RhdGUgIT09IFwiYnVzeVwiICYmIHN0YXR1cyA9PT0gXCJydW5uaW5nXCJcbiAgICAgICAgICAgICAgPyBcImVycm9yXCJcbiAgICAgICAgICAgICAgOiBzdGF0dXNcbiAgICAgICAgICB9XG4gICAgICAgICAgc3R5bGU9e2lubGluZVN0eWxlfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2lzUGxhaW4gPyBcImlubGluZS1jb250YWluZXJcIiA6IFwibXVsdGlsaW5lLWNvbnRhaW5lclwifVxuICAgICAgICBvbkNsaWNrPXtpc1BsYWluID8gdGhpcy5oYW5kbGVDbGljayA6IGZhbHNlfVxuICAgICAgICBzdHlsZT17XG4gICAgICAgICAgaXNQbGFpblxuICAgICAgICAgICAgPyBpbmxpbmVTdHlsZVxuICAgICAgICAgICAgOiB7IG1heFdpZHRoOiBgJHtwb3NpdGlvbi5lZGl0b3JXaWR0aH1weGAsIG1hcmdpbjogXCIwcHhcIiB9XG4gICAgICAgIH1cbiAgICAgID5cbiAgICAgICAgPERpc3BsYXlcbiAgICAgICAgICByZWY9e3JlZiA9PiB7XG4gICAgICAgICAgICBpZiAoIXJlZiB8fCAhcmVmLmVsKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmVsID0gcmVmLmVsO1xuXG4gICAgICAgICAgICBpc1BsYWluXG4gICAgICAgICAgICAgID8gdGhpcy5hZGRDb3B5VG9vbHRpcChyZWYuZWwsIHRoaXMuY29udGFpbmVyVG9vbHRpcClcbiAgICAgICAgICAgICAgOiB0aGlzLmNvbnRhaW5lclRvb2x0aXAuZGlzcG9zZSgpO1xuXG4gICAgICAgICAgICAvLyBSZWFjdCdzIGV2ZW50IGhhbmRsZXIgZG9lc24ndCBwcm9wZXJseSBoYW5kbGUgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkgZm9yXG4gICAgICAgICAgICAvLyBldmVudHMgb3V0c2lkZSB0aGUgUmVhY3QgY29udGV4dC4gVXNpbmcgcHJveHkuZWwgc2F2ZXMgdXMgYSBleHRyYSBkaXYuXG4gICAgICAgICAgICAvLyBXZSBvbmx5IG5lZWQgdGhpcyBpbiB0aGUgdGV4dCBlZGl0b3IsIHRoZXJlZm9yZSB3ZSBjaGVjayBzaG93U3RhdHVzLlxuICAgICAgICAgICAgaWYgKCF0aGlzLmV4cGFuZGVkLmdldCgpICYmICFpc1BsYWluICYmIHJlZi5lbCkge1xuICAgICAgICAgICAgICByZWYuZWwuYWRkRXZlbnRMaXN0ZW5lcihcIndoZWVsXCIsIHRoaXMub25XaGVlbChyZWYuZWwpLCB7XG4gICAgICAgICAgICAgICAgcGFzc2l2ZTogdHJ1ZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICAgIG91dHB1dHM9e3RvSlMob3V0cHV0cyl9XG4gICAgICAgICAgZGlzcGxheU9yZGVyPXtkaXNwbGF5T3JkZXJ9XG4gICAgICAgICAgdHJhbnNmb3Jtcz17dHJhbnNmb3Jtc31cbiAgICAgICAgICB0aGVtZT1cImxpZ2h0XCJcbiAgICAgICAgICBtb2RlbHM9e3t9fVxuICAgICAgICAgIGV4cGFuZGVkPXt0aGlzLmV4cGFuZGVkLmdldCgpfVxuICAgICAgICAvPlxuICAgICAgICB7aXNQbGFpbiA/IG51bGwgOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0b29sYmFyXCI+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImljb24gaWNvbi14XCJcbiAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5kZXN0cm95fVxuICAgICAgICAgICAgICByZWY9e3JlZiA9PiB0aGlzLmFkZENsb3NlQnV0dG9uVG9vbHRpcChyZWYsIHRoaXMuY2xvc2VUb29sdGlwKX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleDogMSwgbWluSGVpZ2h0OiBcIjAuMjVlbVwiIH19IC8+XG5cbiAgICAgICAgICAgIHt0aGlzLmdldEFsbFRleHQoKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWNsaXBweVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVDbGlja31cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuYWRkQ29weUJ1dHRvblRvb2x0aXB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAge3RoaXMuZWwgJiYgdGhpcy5lbC5zY3JvbGxIZWlnaHQgPiBERUZBVUxUX1NDUk9MTF9IRUlHSFQgPyAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BpY29uIGljb24tJHt0aGlzLmV4cGFuZGVkLmdldCgpXG4gICAgICAgICAgICAgICAgICA/IFwiZm9sZFwiXG4gICAgICAgICAgICAgICAgICA6IFwidW5mb2xkXCJ9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnRvZ2dsZUV4cGFuZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHNjcm9sbFRvQm90dG9tKCkge1xuICAgIGlmIChcbiAgICAgICF0aGlzLmVsIHx8XG4gICAgICB0aGlzLmV4cGFuZGVkID09PSB0cnVlIHx8XG4gICAgICB0aGlzLnByb3BzLnN0b3JlLmlzUGxhaW4gPT09IHRydWUgfHxcbiAgICAgIGF0b20uY29uZmlnLmdldChgSHlkcm9nZW4uYXV0b1Njcm9sbGApID09PSBmYWxzZVxuICAgIClcbiAgICAgIHJldHVybjtcbiAgICBjb25zdCBzY3JvbGxIZWlnaHQgPSB0aGlzLmVsLnNjcm9sbEhlaWdodDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmVsLmNsaWVudEhlaWdodDtcbiAgICBjb25zdCBtYXhTY3JvbGxUb3AgPSBzY3JvbGxIZWlnaHQgLSBoZWlnaHQ7XG4gICAgdGhpcy5lbC5zY3JvbGxUb3AgPSBtYXhTY3JvbGxUb3AgPiAwID8gbWF4U2Nyb2xsVG9wIDogMDtcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLmNvbnRhaW5lclRvb2x0aXAuZGlzcG9zZSgpO1xuICAgIHRoaXMuYnV0dG9uVG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgdGhpcy5jbG9zZVRvb2x0aXAuZGlzcG9zZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJlc3VsdFZpZXdDb21wb25lbnQ7XG4iXX0=