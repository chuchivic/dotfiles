Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require("mobx");

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _watch = require("./watch");

var _watch2 = _interopRequireDefault(_watch);

var WatchesStore = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(WatchesStore, [{
    key: "watches",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return [];
    },
    enumerable: true
  }], null, _instanceInitializers);

  function WatchesStore(kernel) {
    _classCallCheck(this, WatchesStore);

    _defineDecoratedPropertyDescriptor(this, "watches", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "createWatch", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "addWatch", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "addWatchFromEditor", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "removeWatch", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "run", _instanceInitializers);

    this.kernel = kernel;

    this.kernel.addWatchCallback(this.run);
    this.addWatch();
  }

  _createDecoratedClass(WatchesStore, [{
    key: "createWatch",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this = this;

      return function () {
        var lastWatch = _this.watches[_this.watches.length - 1];
        if (!lastWatch || lastWatch.getCode().replace(/\s/g, "") !== "") {
          var watch = new _watch2["default"](_this.kernel);
          _this.watches.push(watch);
          return watch;
        }
        return lastWatch;
      };
    },
    enumerable: true
  }, {
    key: "addWatch",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        _this2.createWatch().focus();
      };
    },
    enumerable: true
  }, {
    key: "addWatchFromEditor",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function (editor) {
        if (!editor) return;
        var watchText = editor.getSelectedText();
        if (!watchText) {
          _this3.addWatch();
        } else {
          var watch = _this3.createWatch();
          watch.setCode(watchText);
          watch.run();
        }
      };
    },
    enumerable: true
  }, {
    key: "removeWatch",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this4 = this;

      return function () {
        var watches = _this4.watches.map(function (v, k) {
          return {
            name: v.getCode(),
            value: k
          };
        }).filter(function (obj) {
          return obj.value !== 0 || obj.name !== "";
        });

        var watchesPicker = new _atomSelectList2["default"]({
          items: watches,
          elementForItem: function elementForItem(watch) {
            var element = document.createElement("li");
            element.textContent = watch.name || "<empty>";
            return element;
          },
          didConfirmSelection: function didConfirmSelection(watch) {
            _this4.watches.splice(watch.value, 1);
            modalPanel.destroy();
            watchesPicker.destroy();
            if (_this4.watches.length === 0) _this4.addWatch();else if (previouslyFocusedElement) previouslyFocusedElement.focus();
          },
          filterKeyForItem: function filterKeyForItem(watch) {
            return watch.name;
          },
          didCancelSelection: function didCancelSelection() {
            modalPanel.destroy();
            if (previouslyFocusedElement) previouslyFocusedElement.focus();
            watchesPicker.destroy();
          },
          emptyMessage: "There are no watches to remove!"
        });
        var previouslyFocusedElement = document.activeElement;
        var modalPanel = atom.workspace.addModalPanel({
          item: watchesPicker
        });
        watchesPicker.focus();
      };
    },
    enumerable: true
  }, {
    key: "run",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this5 = this;

      return function () {
        _this5.watches.forEach(function (watch) {
          return watch.run();
        });
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  return WatchesStore;
})();

exports["default"] = WatchesStore;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS93YXRjaGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFFbUMsTUFBTTs7OEJBQ2Qsa0JBQWtCOzs7O3FCQUV0QixTQUFTOzs7O0lBS1gsWUFBWTs7Ozt3QkFBWixZQUFZOzs7O2FBRVUsRUFBRTs7Ozs7QUFFaEMsV0FKUSxZQUFZLENBSW5CLE1BQWMsRUFBRTswQkFKVCxZQUFZOzs7Ozs7Ozs7Ozs7OztBQUs3QixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFckIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkMsUUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQ2pCOzt3QkFUa0IsWUFBWTs7Ozs7O2FBWWpCLFlBQU07QUFDbEIsWUFBTSxTQUFTLEdBQUcsTUFBSyxPQUFPLENBQUMsTUFBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hELFlBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO0FBQy9ELGNBQU0sS0FBSyxHQUFHLHVCQUFlLE1BQUssTUFBTSxDQUFDLENBQUM7QUFDMUMsZ0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QixpQkFBTyxLQUFLLENBQUM7U0FDZDtBQUNELGVBQU8sU0FBUyxDQUFDO09BQ2xCOzs7Ozs7Ozs7YUFHVSxZQUFNO0FBQ2YsZUFBSyxXQUFXLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUM1Qjs7Ozs7Ozs7O2FBR29CLFVBQUMsTUFBTSxFQUFzQjtBQUNoRCxZQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDcEIsWUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQzNDLFlBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxpQkFBSyxRQUFRLEVBQUUsQ0FBQztTQUNqQixNQUFNO0FBQ0wsY0FBTSxLQUFLLEdBQUcsT0FBSyxXQUFXLEVBQUUsQ0FBQztBQUNqQyxlQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pCLGVBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNiO09BQ0Y7Ozs7Ozs7OzthQUdhLFlBQU07QUFDbEIsWUFBTSxPQUFPLEdBQUcsT0FBSyxPQUFPLENBQ3pCLEdBQUcsQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO2lCQUFNO0FBQ2QsZ0JBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ2pCLGlCQUFLLEVBQUUsQ0FBQztXQUNUO1NBQUMsQ0FBQyxDQUNGLE1BQU0sQ0FBQyxVQUFBLEdBQUc7aUJBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFO1NBQUEsQ0FBQyxDQUFDOztBQUVyRCxZQUFNLGFBQWEsR0FBRyxnQ0FBbUI7QUFDdkMsZUFBSyxFQUFFLE9BQU87QUFDZCx3QkFBYyxFQUFFLHdCQUFBLEtBQUssRUFBSTtBQUN2QixnQkFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxtQkFBTyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQztBQUM5QyxtQkFBTyxPQUFPLENBQUM7V0FDaEI7QUFDRCw2QkFBbUIsRUFBRSw2QkFBQSxLQUFLLEVBQUk7QUFDNUIsbUJBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLHNCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckIseUJBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN4QixnQkFBSSxPQUFLLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLE9BQUssUUFBUSxFQUFFLENBQUMsS0FDMUMsSUFBSSx3QkFBd0IsRUFBRSx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztXQUNyRTtBQUNELDBCQUFnQixFQUFFLDBCQUFBLEtBQUs7bUJBQUksS0FBSyxDQUFDLElBQUk7V0FBQTtBQUNyQyw0QkFBa0IsRUFBRSw4QkFBTTtBQUN4QixzQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGdCQUFJLHdCQUF3QixFQUFFLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQy9ELHlCQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7V0FDekI7QUFDRCxzQkFBWSxFQUFFLGlDQUFpQztTQUNoRCxDQUFDLENBQUM7QUFDSCxZQUFNLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDeEQsWUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDOUMsY0FBSSxFQUFFLGFBQWE7U0FDcEIsQ0FBQyxDQUFDO0FBQ0gscUJBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUN2Qjs7Ozs7Ozs7O2FBR0ssWUFBTTtBQUNWLGVBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUs7aUJBQUksS0FBSyxDQUFDLEdBQUcsRUFBRTtTQUFBLENBQUMsQ0FBQztPQUM1Qzs7Ozs7U0FqRmtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS93YXRjaGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgYWN0aW9uLCBvYnNlcnZhYmxlIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCBTZWxlY3RMaXN0VmlldyBmcm9tIFwiYXRvbS1zZWxlY3QtbGlzdFwiO1xuXG5pbXBvcnQgV2F0Y2hTdG9yZSBmcm9tIFwiLi93YXRjaFwiO1xuXG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4vLi4va2VybmVsXCI7XG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuL2luZGV4XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoZXNTdG9yZSB7XG4gIGtlcm5lbDogS2VybmVsO1xuICBAb2JzZXJ2YWJsZSB3YXRjaGVzOiBBcnJheTxXYXRjaFN0b3JlPiA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKGtlcm5lbDogS2VybmVsKSB7XG4gICAgdGhpcy5rZXJuZWwgPSBrZXJuZWw7XG5cbiAgICB0aGlzLmtlcm5lbC5hZGRXYXRjaENhbGxiYWNrKHRoaXMucnVuKTtcbiAgICB0aGlzLmFkZFdhdGNoKCk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGNyZWF0ZVdhdGNoID0gKCkgPT4ge1xuICAgIGNvbnN0IGxhc3RXYXRjaCA9IHRoaXMud2F0Y2hlc1t0aGlzLndhdGNoZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKCFsYXN0V2F0Y2ggfHwgbGFzdFdhdGNoLmdldENvZGUoKS5yZXBsYWNlKC9cXHMvZywgXCJcIikgIT09IFwiXCIpIHtcbiAgICAgIGNvbnN0IHdhdGNoID0gbmV3IFdhdGNoU3RvcmUodGhpcy5rZXJuZWwpO1xuICAgICAgdGhpcy53YXRjaGVzLnB1c2god2F0Y2gpO1xuICAgICAgcmV0dXJuIHdhdGNoO1xuICAgIH1cbiAgICByZXR1cm4gbGFzdFdhdGNoO1xuICB9O1xuXG4gIEBhY3Rpb25cbiAgYWRkV2F0Y2ggPSAoKSA9PiB7XG4gICAgdGhpcy5jcmVhdGVXYXRjaCgpLmZvY3VzKCk7XG4gIH07XG5cbiAgQGFjdGlvblxuICBhZGRXYXRjaEZyb21FZGl0b3IgPSAoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpID0+IHtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIGNvbnN0IHdhdGNoVGV4dCA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKTtcbiAgICBpZiAoIXdhdGNoVGV4dCkge1xuICAgICAgdGhpcy5hZGRXYXRjaCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB3YXRjaCA9IHRoaXMuY3JlYXRlV2F0Y2goKTtcbiAgICAgIHdhdGNoLnNldENvZGUod2F0Y2hUZXh0KTtcbiAgICAgIHdhdGNoLnJ1bigpO1xuICAgIH1cbiAgfTtcblxuICBAYWN0aW9uXG4gIHJlbW92ZVdhdGNoID0gKCkgPT4ge1xuICAgIGNvbnN0IHdhdGNoZXMgPSB0aGlzLndhdGNoZXNcbiAgICAgIC5tYXAoKHYsIGspID0+ICh7XG4gICAgICAgIG5hbWU6IHYuZ2V0Q29kZSgpLFxuICAgICAgICB2YWx1ZToga1xuICAgICAgfSkpXG4gICAgICAuZmlsdGVyKG9iaiA9PiBvYmoudmFsdWUgIT09IDAgfHwgb2JqLm5hbWUgIT09IFwiXCIpO1xuXG4gICAgY29uc3Qgd2F0Y2hlc1BpY2tlciA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtczogd2F0Y2hlcyxcbiAgICAgIGVsZW1lbnRGb3JJdGVtOiB3YXRjaCA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSB3YXRjaC5uYW1lIHx8IFwiPGVtcHR5PlwiO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiB3YXRjaCA9PiB7XG4gICAgICAgIHRoaXMud2F0Y2hlcy5zcGxpY2Uod2F0Y2gudmFsdWUsIDEpO1xuICAgICAgICBtb2RhbFBhbmVsLmRlc3Ryb3koKTtcbiAgICAgICAgd2F0Y2hlc1BpY2tlci5kZXN0cm95KCk7XG4gICAgICAgIGlmICh0aGlzLndhdGNoZXMubGVuZ3RoID09PSAwKSB0aGlzLmFkZFdhdGNoKCk7XG4gICAgICAgIGVsc2UgaWYgKHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkgcHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gICAgICB9LFxuICAgICAgZmlsdGVyS2V5Rm9ySXRlbTogd2F0Y2ggPT4gd2F0Y2gubmFtZSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xuICAgICAgICBtb2RhbFBhbmVsLmRlc3Ryb3koKTtcbiAgICAgICAgaWYgKHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkgcHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIHdhdGNoZXNQaWNrZXIuZGVzdHJveSgpO1xuICAgICAgfSxcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJUaGVyZSBhcmUgbm8gd2F0Y2hlcyB0byByZW1vdmUhXCJcbiAgICB9KTtcbiAgICBjb25zdCBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGNvbnN0IG1vZGFsUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtcbiAgICAgIGl0ZW06IHdhdGNoZXNQaWNrZXJcbiAgICB9KTtcbiAgICB3YXRjaGVzUGlja2VyLmZvY3VzKCk7XG4gIH07XG5cbiAgQGFjdGlvblxuICBydW4gPSAoKSA9PiB7XG4gICAgdGhpcy53YXRjaGVzLmZvckVhY2god2F0Y2ggPT4gd2F0Y2gucnVuKCkpO1xuICB9O1xufVxuIl19