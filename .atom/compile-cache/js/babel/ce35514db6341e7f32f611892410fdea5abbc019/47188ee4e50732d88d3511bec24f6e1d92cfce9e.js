Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atom = require("atom");

var InputView = (function () {
  function InputView(_ref, onConfirmed) {
    var _this = this;

    var prompt = _ref.prompt;
    var defaultText = _ref.defaultText;
    var allowCancel = _ref.allowCancel;

    _classCallCheck(this, InputView);

    this.onConfirmed = onConfirmed;

    this.element = document.createElement("div");
    this.element.classList.add("hydrogen", "input-view");
    var label = document.createElement("div");
    label.classList.add("label", "icon", "icon-arrow-right");
    label.textContent = prompt || "Kernel requires input";

    this.miniEditor = new _atom.TextEditor({ mini: true });
    if (defaultText) this.miniEditor.setText(defaultText);

    this.element.appendChild(label);
    this.element.appendChild(this.miniEditor.element);

    if (allowCancel) {
      atom.commands.add(this.element, {
        "core:confirm": function coreConfirm() {
          return _this.confirm();
        },
        "core:cancel": function coreCancel() {
          return _this.close();
        }
      });
      this.miniEditor.element.addEventListener("blur", function () {
        if (document.hasFocus()) _this.close();
      });
    } else {
      atom.commands.add(this.element, {
        "core:confirm": function coreConfirm() {
          return _this.confirm();
        }
      });
    }
  }

  _createClass(InputView, [{
    key: "confirm",
    value: function confirm() {
      var text = this.miniEditor.getText();
      if (this.onConfirmed) this.onConfirmed(text);
      this.close();
    }
  }, {
    key: "close",
    value: function close() {
      if (this.panel) this.panel.destroy();
      this.panel = null;
      this.element.remove();
      if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();
    }
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      this.panel = atom.workspace.addModalPanel({ item: this.element });
      this.miniEditor.element.focus();
      this.miniEditor.scrollToCursorPosition();
    }
  }]);

  return InputView;
})();

exports["default"] = InputView;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9pbnB1dC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUUyQixNQUFNOztJQUtaLFNBQVM7QUFNakIsV0FOUSxTQUFTLENBTWhCLElBQTBDLEVBQUUsV0FBZSxFQUFFOzs7UUFBM0QsTUFBTSxHQUFSLElBQTBDLENBQXhDLE1BQU07UUFBRSxXQUFXLEdBQXJCLElBQTBDLENBQWhDLFdBQVc7UUFBRSxXQUFXLEdBQWxDLElBQTBDLENBQW5CLFdBQVc7OzBCQU4zQixTQUFTOztBQU8xQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDckQsUUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM1QyxTQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDekQsU0FBSyxDQUFDLFdBQVcsR0FBRyxNQUFNLElBQUksdUJBQXVCLENBQUM7O0FBRXRELFFBQUksQ0FBQyxVQUFVLEdBQUcscUJBQWUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNqRCxRQUFJLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxXQUFXLEVBQUU7QUFDZixVQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQzlCLHNCQUFjLEVBQUU7aUJBQU0sTUFBSyxPQUFPLEVBQUU7U0FBQTtBQUNwQyxxQkFBYSxFQUFFO2lCQUFNLE1BQUssS0FBSyxFQUFFO1NBQUE7T0FDbEMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDckQsWUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBSyxLQUFLLEVBQUUsQ0FBQztPQUN2QyxDQUFDLENBQUM7S0FDSixNQUFNO0FBQ0wsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUM5QixzQkFBYyxFQUFFO2lCQUFNLE1BQUssT0FBTyxFQUFFO1NBQUE7T0FDckMsQ0FBQyxDQUFDO0tBQ0o7R0FDRjs7ZUFsQ2tCLFNBQVM7O1dBb0NyQixtQkFBRztBQUNSLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsVUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVJLGlCQUFHO0FBQ04sVUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QixVQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDMUU7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDdkQsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNsRSxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQyxVQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FDMUM7OztTQXREa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2lucHV0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBUZXh0RWRpdG9yIH0gZnJvbSBcImF0b21cIjtcblxudHlwZSBvcHRzID0geyBwcm9tcHQ6IHN0cmluZywgZGVmYXVsdFRleHQ/OiBzdHJpbmcsIGFsbG93Q2FuY2VsPzogYm9vbGVhbiB9O1xudHlwZSBjYiA9IChzOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0VmlldyB7XG4gIG9uQ29uZmlybWVkOiBjYjtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIG1pbmlFZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgcGFuZWw6ID9hdG9tJFBhbmVsO1xuICBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcbiAgY29uc3RydWN0b3IoeyBwcm9tcHQsIGRlZmF1bHRUZXh0LCBhbGxvd0NhbmNlbCB9OiBvcHRzLCBvbkNvbmZpcm1lZDogY2IpIHtcbiAgICB0aGlzLm9uQ29uZmlybWVkID0gb25Db25maXJtZWQ7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaHlkcm9nZW5cIiwgXCJpbnB1dC12aWV3XCIpO1xuICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKFwibGFiZWxcIiwgXCJpY29uXCIsIFwiaWNvbi1hcnJvdy1yaWdodFwiKTtcbiAgICBsYWJlbC50ZXh0Q29udGVudCA9IHByb21wdCB8fCBcIktlcm5lbCByZXF1aXJlcyBpbnB1dFwiO1xuXG4gICAgdGhpcy5taW5pRWRpdG9yID0gbmV3IFRleHRFZGl0b3IoeyBtaW5pOiB0cnVlIH0pO1xuICAgIGlmIChkZWZhdWx0VGV4dCkgdGhpcy5taW5pRWRpdG9yLnNldFRleHQoZGVmYXVsdFRleHQpO1xuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5taW5pRWRpdG9yLmVsZW1lbnQpO1xuXG4gICAgaWYgKGFsbG93Q2FuY2VsKSB7XG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgXCJjb3JlOmNvbmZpcm1cIjogKCkgPT4gdGhpcy5jb25maXJtKCksXG4gICAgICAgIFwiY29yZTpjYW5jZWxcIjogKCkgPT4gdGhpcy5jbG9zZSgpXG4gICAgICB9KTtcbiAgICAgIHRoaXMubWluaUVkaXRvci5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsICgpID0+IHtcbiAgICAgICAgaWYgKGRvY3VtZW50Lmhhc0ZvY3VzKCkpIHRoaXMuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0aGlzLmVsZW1lbnQsIHtcbiAgICAgICAgXCJjb3JlOmNvbmZpcm1cIjogKCkgPT4gdGhpcy5jb25maXJtKClcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpcm0oKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMubWluaUVkaXRvci5nZXRUZXh0KCk7XG4gICAgaWYgKHRoaXMub25Db25maXJtZWQpIHRoaXMub25Db25maXJtZWQodGV4dCk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgICBpZiAodGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQpIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcy5lbGVtZW50IH0pO1xuICAgIHRoaXMubWluaUVkaXRvci5lbGVtZW50LmZvY3VzKCk7XG4gICAgdGhpcy5taW5pRWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKTtcbiAgfVxufVxuIl19