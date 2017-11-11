Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _kernelManager = require("./kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var SignalListView = (function () {
  function SignalListView() {
    var _this = this;

    _classCallCheck(this, SignalListView);

    this.basicCommands = [{ name: "Interrupt", value: "interrupt-kernel" }, { name: "Restart", value: "restart-kernel" }, { name: "Shut Down", value: "shutdown-kernel" }];

    this.wsKernelCommands = [{ name: "Rename session for", value: "rename-kernel" }, { name: "Disconnect from", value: "disconnect-kernel" }];

    this.switchCommands = [{ name: "Switch to", value: "switch-kernel" }];
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
    key: "_mapCommands",
    value: function _mapCommands(commands, kernelSpec) {
      return commands.map(function (command) {
        return {
          name: command.name + " " + kernelSpec.display_name + " kernel",
          command: command.value,
          payload: command.value === "switch-kernel" ? kernelSpec : null
        };
      });
    }
  }, {
    key: "toggle",
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (this.panel != null) {
        this.cancel();
      }

      var grammar = _store2["default"].grammar;
      var kernel = _store2["default"].kernel;
      var listItems = [];
      if (!kernel) return;

      if (kernel instanceof _wsKernel2["default"]) {
        listItems = this._mapCommands(_lodash2["default"].union(this.basicCommands, this.wsKernelCommands), kernel.kernelSpec);
      } else {
        var otherKernels = _kernelManager2["default"].getAllKernelSpecsForGrammar(grammar, function (kernelSpecs) {
          return _lodash2["default"].without(kernelSpecs, kernel.kernelSpec);
        });

        if (otherKernels) {
          listItems = _lodash2["default"].union(this._mapCommands(this.basicCommands, kernel.kernelSpec), _lodash2["default"].flatMap(otherKernels, function (otherKernel) {
            return _this2._mapCommands(_this2.switchCommands, otherKernel);
          }));
        } else {
          listItems = this._mapCommands(this.basicCommands, kernel.kernelSpec);
        }
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zaWduYWwtbGlzdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3NCQUMvQixRQUFROzs7O3dCQUVELGFBQWE7Ozs7NkJBQ1Isa0JBQWtCOzs7O3FCQUN4QixTQUFTOztxQkFDWCxTQUFTOzs7O0lBT04sY0FBYztBQVN0QixXQVRRLGNBQWMsR0FTbkI7OzswQkFUSyxjQUFjOztBQVUvQixRQUFJLENBQUMsYUFBYSxHQUFHLENBQ25CLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsRUFDaEQsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxFQUM1QyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFLENBQ2hELENBQUM7O0FBRUYsUUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQ3RCLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsRUFDdEQsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLENBQ3hELENBQUM7O0FBRUYsUUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUN0RSxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixRQUFJLENBQUMsY0FBYyxHQUFHLGdDQUFtQjtBQUN2QyxvQkFBYyxFQUFFLENBQUMsYUFBYSxDQUFDO0FBQy9CLFdBQUssRUFBRSxFQUFFO0FBQ1Qsc0JBQWdCLEVBQUUsMEJBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxJQUFJO09BQUE7QUFDbkMsb0JBQWMsRUFBRSx3QkFBQSxJQUFJLEVBQUk7QUFDdEIs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RSxVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDN0I7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3RDOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ2pDLFlBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxZQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO09BQ3RDO0tBQ0Y7OztTQTVHa0IsY0FBYzs7O3FCQUFkLGNBQWMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3NpZ25hbC1saXN0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSBcImF0b20tc2VsZWN0LWxpc3RcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IFdTS2VybmVsIGZyb20gXCIuL3dzLWtlcm5lbFwiO1xuaW1wb3J0IGtlcm5lbE1hbmFnZXIgZnJvbSBcIi4va2VybmVsLW1hbmFnZXJcIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgc3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxuZXhwb3J0IHR5cGUgS2VybmVsQ29tbWFuZCA9IHtcbiAgY29tbWFuZDogc3RyaW5nLFxuICBwYXlsb2FkOiA/S2VybmVsc3BlY1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2lnbmFsTGlzdFZpZXcge1xuICBiYXNpY0NvbW1hbmRzOiBBcnJheTxPYmplY3Q+O1xuICBvbkNvbmZpcm1lZDogPyhjb21tYW5kOiBLZXJuZWxDb21tYW5kKSA9PiB2b2lkO1xuICBwYW5lbDogP2F0b20kUGFuZWw7XG4gIHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDogP0hUTUxFbGVtZW50O1xuICBzZWxlY3RMaXN0VmlldzogU2VsZWN0TGlzdFZpZXc7XG4gIHN3aXRjaENvbW1hbmRzOiBBcnJheTxPYmplY3Q+O1xuICB3c0tlcm5lbENvbW1hbmRzOiBBcnJheTxPYmplY3Q+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYmFzaWNDb21tYW5kcyA9IFtcbiAgICAgIHsgbmFtZTogXCJJbnRlcnJ1cHRcIiwgdmFsdWU6IFwiaW50ZXJydXB0LWtlcm5lbFwiIH0sXG4gICAgICB7IG5hbWU6IFwiUmVzdGFydFwiLCB2YWx1ZTogXCJyZXN0YXJ0LWtlcm5lbFwiIH0sXG4gICAgICB7IG5hbWU6IFwiU2h1dCBEb3duXCIsIHZhbHVlOiBcInNodXRkb3duLWtlcm5lbFwiIH1cbiAgICBdO1xuXG4gICAgdGhpcy53c0tlcm5lbENvbW1hbmRzID0gW1xuICAgICAgeyBuYW1lOiBcIlJlbmFtZSBzZXNzaW9uIGZvclwiLCB2YWx1ZTogXCJyZW5hbWUta2VybmVsXCIgfSxcbiAgICAgIHsgbmFtZTogXCJEaXNjb25uZWN0IGZyb21cIiwgdmFsdWU6IFwiZGlzY29ubmVjdC1rZXJuZWxcIiB9XG4gICAgXTtcblxuICAgIHRoaXMuc3dpdGNoQ29tbWFuZHMgPSBbeyBuYW1lOiBcIlN3aXRjaCB0b1wiLCB2YWx1ZTogXCJzd2l0Y2gta2VybmVsXCIgfV07XG4gICAgdGhpcy5vbkNvbmZpcm1lZCA9IG51bGw7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBpdGVtID0+IGl0ZW0ubmFtZSxcbiAgICAgIGVsZW1lbnRGb3JJdGVtOiBpdGVtID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0ubmFtZTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9LFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogaXRlbSA9PiB7XG4gICAgICAgIGxvZyhcIlNlbGVjdGVkIGNvbW1hbmQ6XCIsIGl0ZW0pO1xuICAgICAgICBpZiAodGhpcy5vbkNvbmZpcm1lZCkgdGhpcy5vbkNvbmZpcm1lZChpdGVtKTtcbiAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgIH0sXG4gICAgICBkaWRDYW5jZWxTZWxlY3Rpb246ICgpID0+IHRoaXMuY2FuY2VsKCksXG4gICAgICBlbXB0eU1lc3NhZ2U6IFwiTm8gcnVubmluZyBrZXJuZWxzIGZvciB0aGlzIGZpbGUgdHlwZS5cIlxuICAgIH0pO1xuICB9XG5cbiAgX21hcENvbW1hbmRzKGNvbW1hbmRzOiBBcnJheTxPYmplY3Q+LCBrZXJuZWxTcGVjOiBLZXJuZWxzcGVjKSB7XG4gICAgcmV0dXJuIGNvbW1hbmRzLm1hcChjb21tYW5kID0+ICh7XG4gICAgICBuYW1lOiBgJHtjb21tYW5kLm5hbWV9ICR7a2VybmVsU3BlYy5kaXNwbGF5X25hbWV9IGtlcm5lbGAsXG4gICAgICBjb21tYW5kOiBjb21tYW5kLnZhbHVlLFxuICAgICAgcGF5bG9hZDogY29tbWFuZC52YWx1ZSA9PT0gXCJzd2l0Y2gta2VybmVsXCIgPyBrZXJuZWxTcGVjIDogbnVsbFxuICAgIH0pKTtcbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH1cblxuICAgIGNvbnN0IGdyYW1tYXIgPSBzdG9yZS5ncmFtbWFyO1xuICAgIGNvbnN0IGtlcm5lbCA9IHN0b3JlLmtlcm5lbDtcbiAgICBsZXQgbGlzdEl0ZW1zID0gW107XG4gICAgaWYgKCFrZXJuZWwpIHJldHVybjtcblxuICAgIGlmIChrZXJuZWwgaW5zdGFuY2VvZiBXU0tlcm5lbCkge1xuICAgICAgbGlzdEl0ZW1zID0gdGhpcy5fbWFwQ29tbWFuZHMoXG4gICAgICAgIF8udW5pb24odGhpcy5iYXNpY0NvbW1hbmRzLCB0aGlzLndzS2VybmVsQ29tbWFuZHMpLFxuICAgICAgICBrZXJuZWwua2VybmVsU3BlY1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgb3RoZXJLZXJuZWxzID0ga2VybmVsTWFuYWdlci5nZXRBbGxLZXJuZWxTcGVjc0ZvckdyYW1tYXIoXG4gICAgICAgIGdyYW1tYXIsXG4gICAgICAgIGtlcm5lbFNwZWNzID0+IF8ud2l0aG91dChrZXJuZWxTcGVjcywga2VybmVsLmtlcm5lbFNwZWMpXG4gICAgICApO1xuXG4gICAgICBpZiAob3RoZXJLZXJuZWxzKSB7XG4gICAgICAgIGxpc3RJdGVtcyA9IF8udW5pb24oXG4gICAgICAgICAgdGhpcy5fbWFwQ29tbWFuZHModGhpcy5iYXNpY0NvbW1hbmRzLCBrZXJuZWwua2VybmVsU3BlYyksXG4gICAgICAgICAgXy5mbGF0TWFwKG90aGVyS2VybmVscywgb3RoZXJLZXJuZWwgPT5cbiAgICAgICAgICAgIHRoaXMuX21hcENvbW1hbmRzKHRoaXMuc3dpdGNoQ29tbWFuZHMsIG90aGVyS2VybmVsKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpc3RJdGVtcyA9IHRoaXMuX21hcENvbW1hbmRzKHRoaXMuYmFzaWNDb21tYW5kcywga2VybmVsLmtlcm5lbFNwZWMpO1xuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCB0aGlzLnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7IGl0ZW1zOiBsaXN0SXRlbXMgfSk7XG4gICAgdGhpcy5hdHRhY2goKTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKHRoaXMucGFuZWwgPT0gbnVsbClcbiAgICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcy5zZWxlY3RMaXN0VmlldyB9KTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKCk7XG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5yZXNldCgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdExpc3RWaWV3LmRlc3Ryb3koKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpO1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuIl19