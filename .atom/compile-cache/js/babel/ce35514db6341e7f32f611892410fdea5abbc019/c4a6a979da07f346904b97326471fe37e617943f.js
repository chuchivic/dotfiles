Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _utils = require("./utils");

function getName(kernel) {
  var prefix = kernel instanceof _wsKernel2["default"] ? kernel.gatewayName + ": " : "";
  return prefix + kernel.displayName + " - " + _store2["default"].getFilesForKernel(kernel).map(_tildify2["default"]).join(", ");
}

var ExistingKernelPicker = (function () {
  function ExistingKernelPicker() {
    var _this = this;

    _classCallCheck(this, ExistingKernelPicker);

    this.selectListView = new _atomSelectList2["default"]({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: function filterKeyForItem(kernel) {
        return getName(kernel);
      },
      elementForItem: function elementForItem(kernel) {
        var element = document.createElement("li");
        element.textContent = getName(kernel);
        return element;
      },
      didConfirmSelection: function didConfirmSelection(kernel) {
        var filePath = _store2["default"].filePath;
        var editor = _store2["default"].editor;
        var grammar = _store2["default"].grammar;

        if (!filePath || !editor || !grammar) return _this.cancel();
        _store2["default"].newKernel(kernel, filePath, editor, grammar);
        _this.cancel();
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      },
      emptyMessage: "No running kernels for this language."
    });
  }

  _createClass(ExistingKernelPicker, [{
    key: "destroy",
    value: function destroy() {
      this.cancel();
      return this.selectListView.destroy();
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this.panel != null) {
        this.panel.destroy();
      }
      this.panel = null;
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      if (this.panel == null) this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      this.selectListView.focus();
      this.selectListView.reset();
    }
  }, {
    key: "toggle",
    value: _asyncToGenerator(function* () {
      if (this.panel != null) {
        this.cancel();
      } else if (_store2["default"].filePath && _store2["default"].grammar) {
        yield this.selectListView.update({
          items: _store2["default"].runningKernels.filter(function (kernel) {
            return (0, _utils.kernelSpecProvidesGrammar)(kernel.kernelSpec, _store2["default"].grammar);
          })
        });
        _store2["default"].markers.clear();
        this.attach();
      }
    })
  }]);

  return ExistingKernelPicker;
})();

exports["default"] = ExistingKernelPicker;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9leGlzdGluZy1rZXJuZWwtcGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3FCQUMzQixTQUFTOzs7O3NCQUNiLFFBQVE7Ozs7dUJBQ0YsU0FBUzs7Ozt3QkFFUixhQUFhOzs7O3FCQUNRLFNBQVM7O0FBSW5ELFNBQVMsT0FBTyxDQUFDLE1BQWMsRUFBRTtBQUMvQixNQUFNLE1BQU0sR0FBRyxNQUFNLGlDQUFvQixHQUFNLE1BQU0sQ0FBQyxXQUFXLFVBQU8sRUFBRSxDQUFDO0FBQzNFLFNBQ0UsTUFBTSxHQUNOLE1BQU0sQ0FBQyxXQUFXLEdBQ2xCLEtBQUssR0FDTCxtQkFDRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FDekIsR0FBRyxzQkFBUyxDQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDYjtDQUNIOztJQUVvQixvQkFBb0I7QUFLNUIsV0FMUSxvQkFBb0IsR0FLekI7OzswQkFMSyxvQkFBb0I7O0FBTXJDLFFBQUksQ0FBQyxjQUFjLEdBQUcsZ0NBQW1CO0FBQ3ZDLG9CQUFjLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDL0IsV0FBSyxFQUFFLEVBQUU7QUFDVCxzQkFBZ0IsRUFBRSwwQkFBQSxNQUFNO2VBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztPQUFBO0FBQzNDLG9CQUFjLEVBQUUsd0JBQUEsTUFBTSxFQUFJO0FBQ3hCLFlBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsZUFBTyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsZUFBTyxPQUFPLENBQUM7T0FDaEI7QUFDRCx5QkFBbUIsRUFBRSw2QkFBQSxNQUFNLEVBQUk7WUFDckIsUUFBUSxzQkFBUixRQUFRO1lBQUUsTUFBTSxzQkFBTixNQUFNO1lBQUUsT0FBTyxzQkFBUCxPQUFPOztBQUNqQyxZQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sTUFBSyxNQUFNLEVBQUUsQ0FBQztBQUMzRCwyQkFBTSxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkQsY0FBSyxNQUFNLEVBQUUsQ0FBQztPQUNmO0FBQ0Qsd0JBQWtCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0FBQ3ZDLGtCQUFZLEVBQUUsdUNBQXVDO0tBQ3RELENBQUMsQ0FBQztHQUNKOztlQXhCa0Isb0JBQW9COztXQTBCaEMsbUJBQUc7QUFDUixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDZCxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEM7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3RCO0FBQ0QsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsVUFBSSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7QUFDakMsWUFBSSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RDLFlBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUM7T0FDdEM7S0FDRjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztBQUN2RCxVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQzNFLFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDNUIsVUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUM3Qjs7OzZCQUVXLGFBQUc7QUFDYixVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNmLE1BQU0sSUFBSSxtQkFBTSxRQUFRLElBQUksbUJBQU0sT0FBTyxFQUFFO0FBQzFDLGNBQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7QUFDL0IsZUFBSyxFQUFFLG1CQUFNLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxNQUFNO21CQUN2QyxzQ0FBMEIsTUFBTSxDQUFDLFVBQVUsRUFBRSxtQkFBTSxPQUFPLENBQUM7V0FBQSxDQUM1RDtTQUNGLENBQUMsQ0FBQztBQUNILDJCQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QixZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZjtLQUNGOzs7U0E5RGtCLG9CQUFvQjs7O3FCQUFwQixvQkFBb0IiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2V4aXN0aW5nLWtlcm5lbC1waWNrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSBcImF0b20tc2VsZWN0LWxpc3RcIjtcbmltcG9ydCBzdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHRpbGRpZnkgZnJvbSBcInRpbGRpZnlcIjtcblxuaW1wb3J0IFdTS2VybmVsIGZyb20gXCIuL3dzLWtlcm5lbFwiO1xuaW1wb3J0IHsga2VybmVsU3BlY1Byb3ZpZGVzR3JhbW1hciB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB0eXBlIEtlcm5lbCBmcm9tIFwiLi9rZXJuZWxcIjtcblxuZnVuY3Rpb24gZ2V0TmFtZShrZXJuZWw6IEtlcm5lbCkge1xuICBjb25zdCBwcmVmaXggPSBrZXJuZWwgaW5zdGFuY2VvZiBXU0tlcm5lbCA/IGAke2tlcm5lbC5nYXRld2F5TmFtZX06IGAgOiBcIlwiO1xuICByZXR1cm4gKFxuICAgIHByZWZpeCArXG4gICAga2VybmVsLmRpc3BsYXlOYW1lICtcbiAgICBcIiAtIFwiICtcbiAgICBzdG9yZVxuICAgICAgLmdldEZpbGVzRm9yS2VybmVsKGtlcm5lbClcbiAgICAgIC5tYXAodGlsZGlmeSlcbiAgICAgIC5qb2luKFwiLCBcIilcbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhpc3RpbmdLZXJuZWxQaWNrZXIge1xuICBrZXJuZWxTcGVjczogQXJyYXk8S2VybmVsc3BlYz47XG4gIHNlbGVjdExpc3RWaWV3OiBTZWxlY3RMaXN0VmlldztcbiAgcGFuZWw6ID9hdG9tJFBhbmVsO1xuICBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBrZXJuZWwgPT4gZ2V0TmFtZShrZXJuZWwpLFxuICAgICAgZWxlbWVudEZvckl0ZW06IGtlcm5lbCA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBnZXROYW1lKGtlcm5lbCk7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfSxcbiAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IGtlcm5lbCA9PiB7XG4gICAgICAgIGNvbnN0IHsgZmlsZVBhdGgsIGVkaXRvciwgZ3JhbW1hciB9ID0gc3RvcmU7XG4gICAgICAgIGlmICghZmlsZVBhdGggfHwgIWVkaXRvciB8fCAhZ3JhbW1hcikgcmV0dXJuIHRoaXMuY2FuY2VsKCk7XG4gICAgICAgIHN0b3JlLm5ld0tlcm5lbChrZXJuZWwsIGZpbGVQYXRoLCBlZGl0b3IsIGdyYW1tYXIpO1xuICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBydW5uaW5nIGtlcm5lbHMgZm9yIHRoaXMgbGFuZ3VhZ2UuXCJcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0Vmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIGlmICh0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkge1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGlmICh0aGlzLnBhbmVsID09IG51bGwpXG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMuc2VsZWN0TGlzdFZpZXcgfSk7XG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5mb2N1cygpO1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcucmVzZXQoKTtcbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH0gZWxzZSBpZiAoc3RvcmUuZmlsZVBhdGggJiYgc3RvcmUuZ3JhbW1hcikge1xuICAgICAgYXdhaXQgdGhpcy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe1xuICAgICAgICBpdGVtczogc3RvcmUucnVubmluZ0tlcm5lbHMuZmlsdGVyKGtlcm5lbCA9PlxuICAgICAgICAgIGtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIoa2VybmVsLmtlcm5lbFNwZWMsIHN0b3JlLmdyYW1tYXIpXG4gICAgICAgIClcbiAgICAgIH0pO1xuICAgICAgc3RvcmUubWFya2Vycy5jbGVhcigpO1xuICAgICAgdGhpcy5hdHRhY2goKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==