Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _kernelManager = require("./kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var basicCommands = [{ name: "Interrupt", value: "interrupt-kernel" }, { name: "Restart", value: "restart-kernel" }, { name: "Shut Down", value: "shutdown-kernel" }];

var wsKernelCommands = [{ name: "Rename session for", value: "rename-kernel" }, { name: "Disconnect from", value: "disconnect-kernel" }];

var SignalListView = (function () {
  function SignalListView() {
    var _this = this;

    _classCallCheck(this, SignalListView);

    this.onConfirmed = null;
    this.selectListView = new _atomSelectList2["default"]({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.name;
      },
      elementForItem: function elementForItem(item) {
        var element = document.createElement("li");
        element.textContent = item.name;
        return element;
      },
      didConfirmSelection: function didConfirmSelection(item) {
        (0, _utils.log)("Selected command:", item);
        if (_this.onConfirmed) _this.onConfirmed(item);
        _this.cancel();
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      },
      emptyMessage: "No running kernels for this file type."
    });
  }

  _createClass(SignalListView, [{
    key: "toggle",
    value: _asyncToGenerator(function* () {
      if (this.panel != null) {
        this.cancel();
      }

      var kernel = _store2["default"].kernel;
      if (!kernel) return;
      var commands = kernel instanceof _wsKernel2["default"] ? [].concat(basicCommands, wsKernelCommands) : basicCommands;

      var listItems = commands.map(function (command) {
        return {
          name: command.name + " " + kernel.kernelSpec.display_name + " kernel",
          command: command.value
        };
      });

      yield this.selectListView.update({ items: listItems });
      this.attach();
    })
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      if (this.panel == null) this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      this.selectListView.focus();
      this.selectListView.reset();
    }
  }, {
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
  }]);

  return SignalListView;
})();

exports["default"] = SignalListView;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zaWduYWwtbGlzdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3dCQUV4QixhQUFhOzs7OzZCQUNSLGtCQUFrQjs7OztxQkFDeEIsU0FBUzs7cUJBQ1gsU0FBUzs7OztBQUUzQixJQUFNLGFBQWEsR0FBRyxDQUNwQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLEVBQ2hELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsRUFDNUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxDQUNoRCxDQUFDOztBQUVGLElBQU0sZ0JBQWdCLEdBQUcsQ0FDdkIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsQ0FDeEQsQ0FBQzs7SUFFbUIsY0FBYztBQU10QixXQU5RLGNBQWMsR0FNbkI7OzswQkFOSyxjQUFjOztBQU8vQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsY0FBYyxHQUFHLGdDQUFtQjtBQUN2QyxvQkFBYyxFQUFFLENBQUMsYUFBYSxDQUFDO0FBQy9CLFdBQUssRUFBRSxFQUFFO0FBQ1Qsc0JBQWdCLEVBQUUsMEJBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxJQUFJO09BQUE7QUFDbkMsb0JBQWMsRUFBRSx3QkFBQSxJQUFJLEVBQUk7QUFDdEIsWUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxlQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDaEMsZUFBTyxPQUFPLENBQUM7T0FDaEI7QUFDRCx5QkFBbUIsRUFBRSw2QkFBQSxJQUFJLEVBQUk7QUFDM0Isd0JBQUksbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsWUFBSSxNQUFLLFdBQVcsRUFBRSxNQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxjQUFLLE1BQU0sRUFBRSxDQUFDO09BQ2Y7QUFDRCx3QkFBa0IsRUFBRTtlQUFNLE1BQUssTUFBTSxFQUFFO09BQUE7QUFDdkMsa0JBQVksRUFBRSx3Q0FBd0M7S0FDdkQsQ0FBQyxDQUFDO0dBQ0o7O2VBekJrQixjQUFjOzs2QkEyQnJCLGFBQUc7QUFDYixVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNmOztBQUVELFVBQU0sTUFBTSxHQUFHLG1CQUFNLE1BQU0sQ0FBQztBQUM1QixVQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDcEIsVUFBTSxRQUFRLEdBQ1osTUFBTSxpQ0FBb0IsYUFDbEIsYUFBYSxFQUFLLGdCQUFnQixJQUN0QyxhQUFhLENBQUM7O0FBRXBCLFVBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO2VBQUs7QUFDekMsY0FBSSxFQUFLLE9BQU8sQ0FBQyxJQUFJLFNBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLFlBQVM7QUFDaEUsaUJBQU8sRUFBRSxPQUFPLENBQUMsS0FBSztTQUN2QjtPQUFDLENBQUMsQ0FBQzs7QUFFSixZQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDdkQsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDdkQsVUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUMzRSxVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDN0I7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3RDOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ2pDLFlBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxZQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO09BQ3RDO0tBQ0Y7OztTQXRFa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3NpZ25hbC1saXN0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSBcImF0b20tc2VsZWN0LWxpc3RcIjtcblxuaW1wb3J0IFdTS2VybmVsIGZyb20gXCIuL3dzLWtlcm5lbFwiO1xuaW1wb3J0IGtlcm5lbE1hbmFnZXIgZnJvbSBcIi4va2VybmVsLW1hbmFnZXJcIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgc3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxuY29uc3QgYmFzaWNDb21tYW5kcyA9IFtcbiAgeyBuYW1lOiBcIkludGVycnVwdFwiLCB2YWx1ZTogXCJpbnRlcnJ1cHQta2VybmVsXCIgfSxcbiAgeyBuYW1lOiBcIlJlc3RhcnRcIiwgdmFsdWU6IFwicmVzdGFydC1rZXJuZWxcIiB9LFxuICB7IG5hbWU6IFwiU2h1dCBEb3duXCIsIHZhbHVlOiBcInNodXRkb3duLWtlcm5lbFwiIH1cbl07XG5cbmNvbnN0IHdzS2VybmVsQ29tbWFuZHMgPSBbXG4gIHsgbmFtZTogXCJSZW5hbWUgc2Vzc2lvbiBmb3JcIiwgdmFsdWU6IFwicmVuYW1lLWtlcm5lbFwiIH0sXG4gIHsgbmFtZTogXCJEaXNjb25uZWN0IGZyb21cIiwgdmFsdWU6IFwiZGlzY29ubmVjdC1rZXJuZWxcIiB9XG5dO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaWduYWxMaXN0VmlldyB7XG4gIG9uQ29uZmlybWVkOiA/KGNvbW1hbmQ6IHsgY29tbWFuZDogc3RyaW5nIH0pID0+IHZvaWQ7XG4gIHBhbmVsOiA/YXRvbSRQYW5lbDtcbiAgcHJldmlvdXNseUZvY3VzZWRFbGVtZW50OiA/SFRNTEVsZW1lbnQ7XG4gIHNlbGVjdExpc3RWaWV3OiBTZWxlY3RMaXN0VmlldztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm9uQ29uZmlybWVkID0gbnVsbDtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3ID0gbmV3IFNlbGVjdExpc3RWaWV3KHtcbiAgICAgIGl0ZW1zQ2xhc3NMaXN0OiBbXCJtYXJrLWFjdGl2ZVwiXSxcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIGZpbHRlcktleUZvckl0ZW06IGl0ZW0gPT4gaXRlbS5uYW1lLFxuICAgICAgZWxlbWVudEZvckl0ZW06IGl0ZW0gPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiBpdGVtID0+IHtcbiAgICAgICAgbG9nKFwiU2VsZWN0ZWQgY29tbWFuZDpcIiwgaXRlbSk7XG4gICAgICAgIGlmICh0aGlzLm9uQ29uZmlybWVkKSB0aGlzLm9uQ29uZmlybWVkKGl0ZW0pO1xuICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBydW5uaW5nIGtlcm5lbHMgZm9yIHRoaXMgZmlsZSB0eXBlLlwiXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICB9XG5cbiAgICBjb25zdCBrZXJuZWwgPSBzdG9yZS5rZXJuZWw7XG4gICAgaWYgKCFrZXJuZWwpIHJldHVybjtcbiAgICBjb25zdCBjb21tYW5kcyA9XG4gICAgICBrZXJuZWwgaW5zdGFuY2VvZiBXU0tlcm5lbFxuICAgICAgICA/IFsuLi5iYXNpY0NvbW1hbmRzLCAuLi53c0tlcm5lbENvbW1hbmRzXVxuICAgICAgICA6IGJhc2ljQ29tbWFuZHM7XG5cbiAgICBjb25zdCBsaXN0SXRlbXMgPSBjb21tYW5kcy5tYXAoY29tbWFuZCA9PiAoe1xuICAgICAgbmFtZTogYCR7Y29tbWFuZC5uYW1lfSAke2tlcm5lbC5rZXJuZWxTcGVjLmRpc3BsYXlfbmFtZX0ga2VybmVsYCxcbiAgICAgIGNvbW1hbmQ6IGNvbW1hbmQudmFsdWVcbiAgICB9KSk7XG5cbiAgICBhd2FpdCB0aGlzLnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7IGl0ZW1zOiBsaXN0SXRlbXMgfSk7XG4gICAgdGhpcy5hdHRhY2goKTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKHRoaXMucGFuZWwgPT0gbnVsbClcbiAgICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcy5zZWxlY3RMaXN0VmlldyB9KTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKCk7XG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5yZXNldCgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdExpc3RWaWV3LmRlc3Ryb3koKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpO1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19