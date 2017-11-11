Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

exports.reduceOutputs = reduceOutputs;
exports.isSingeLine = isSingeLine;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require("mobx");

var _nteractTransforms = require("@nteract/transforms");

var _escapeCarriage = require("escape-carriage");

var _componentsResultViewTransforms = require("./../components/result-view/transforms");

var outputTypes = ["execute_result", "display_data", "stream", "error"];

/**
 * https://github.com/nteract/hydrogen/issues/466#issuecomment-274822937
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Array<Object>} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Array<Object>} updated-outputs - Outputs + Output
 */

function reduceOutputs(outputs, output) {
  var last = outputs.length - 1;
  if (outputs.length > 0 && output.output_type === "stream" && outputs[last].output_type === "stream") {
    var appendText = function appendText(previous, next) {
      previous.text = (0, _escapeCarriage.escapeCarriageReturnSafe)(previous.text + next.text);
    };

    if (outputs[last].name === output.name) {
      appendText(outputs[last], output);
      return outputs;
    }

    if (outputs.length > 1 && outputs[last - 1].name === output.name) {
      appendText(outputs[last - 1], output);
      return outputs;
    }
  }
  outputs.push(output);
  return outputs;
}

function isSingeLine(text, availableSpace) {
  // If it turns out escapeCarriageReturn is a bottleneck, we should remove it.
  return (text.indexOf("\n") === -1 || text.indexOf("\n") === text.length - 1) && availableSpace > (0, _escapeCarriage.escapeCarriageReturn)(text).length;
}

var OutputStore = (function () {
  var _instanceInitializers = {};

  function OutputStore() {
    _classCallCheck(this, OutputStore);

    this.outputs = (0, _mobx.observable)([]);

    _defineDecoratedPropertyDescriptor(this, "status", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "executionCount", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "index", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "position", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setIndex", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "incrementIndex", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "decrementIndex", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "clear", _instanceInitializers);
  }

  _createDecoratedClass(OutputStore, [{
    key: "appendOutput",
    decorators: [_mobx.action],
    value: function appendOutput(message) {
      if (message.stream === "execution_count") {
        this.executionCount = message.data;
      } else if (message.stream === "status") {
        this.status = message.data;
      } else if (outputTypes.indexOf(message.output_type) > -1) {
        reduceOutputs(this.outputs, message);
        this.setIndex(this.outputs.length - 1);
      }
    }
  }, {
    key: "updatePosition",
    decorators: [_mobx.action],
    value: function updatePosition(position) {
      Object.assign(this.position, position);
    }
  }, {
    key: "status",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return "running";
    },
    enumerable: true
  }, {
    key: "executionCount",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return null;
    },
    enumerable: true
  }, {
    key: "index",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return -1;
    },
    enumerable: true
  }, {
    key: "position",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return {
        lineHeight: 0,
        lineLength: 0,
        editorWidth: 0,
        charWidth: 0
      };
    },
    enumerable: true
  }, {
    key: "isPlain",
    decorators: [_mobx.computed],
    get: function get() {
      if (this.outputs.length !== 1) return false;

      var availableSpace = Math.floor((this.position.editorWidth - this.position.lineLength) / this.position.charWidth);
      if (availableSpace <= 0) return false;

      var output = this.outputs[0];
      switch (output.output_type) {
        case "execute_result":
        case "display_data":
          {
            var bundle = output.data;
            var mimetype = (0, _nteractTransforms.richestMimetype)(bundle, _componentsResultViewTransforms.displayOrder, _componentsResultViewTransforms.transforms);
            return mimetype === "text/plain" ? isSingeLine(bundle[mimetype], availableSpace) : false;
          }
        case "stream":
          {
            return isSingeLine(output.text, availableSpace);
          }
        default:
          {
            return false;
          }
      }
    }
  }, {
    key: "setIndex",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this = this;

      return function (index) {
        if (index < 0) {
          _this.index = 0;
        } else if (index < _this.outputs.length) {
          _this.index = index;
        } else {
          _this.index = _this.outputs.length - 1;
        }
      };
    },
    enumerable: true
  }, {
    key: "incrementIndex",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        _this2.index = _this2.index < _this2.outputs.length - 1 ? _this2.index + 1 : _this2.outputs.length - 1;
      };
    },
    enumerable: true
  }, {
    key: "decrementIndex",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.index = _this3.index > 0 ? _this3.index - 1 : 0;
      };
    },
    enumerable: true
  }, {
    key: "clear",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this4 = this;

      return function () {
        _this4.outputs.clear();
        _this4.index = -1;
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  return OutputStore;
})();

exports["default"] = OutputStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9vdXRwdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztvQkFFNkMsTUFBTTs7aUNBQ25CLHFCQUFxQjs7OEJBSTlDLGlCQUFpQjs7OENBS2pCLHdDQUF3Qzs7QUFJL0MsSUFBTSxXQUFXLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FBWW5FLFNBQVMsYUFBYSxDQUMzQixPQUFpQyxFQUNqQyxNQUFjLEVBQ1k7QUFDMUIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEMsTUFDRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFDbEIsTUFBTSxDQUFDLFdBQVcsS0FBSyxRQUFRLElBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssUUFBUSxFQUN0QztRQUNTLFVBQVUsR0FBbkIsU0FBUyxVQUFVLENBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQUU7QUFDbEQsY0FBUSxDQUFDLElBQUksR0FBRyw4Q0FBeUIsUUFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDckU7O0FBRUQsUUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDdEMsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEMsYUFBTyxPQUFPLENBQUM7S0FDaEI7O0FBRUQsUUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2hFLGdCQUFVLENBQUMsT0FBTyxDQUFDLElBQUks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QUEsQUFDRDtBQUFTO0FBQ1AsbUJBQU8sS0FBSyxDQUFDO1dBQ2Q7QUFBQSxPQUNGO0tBQ0Y7Ozs7Ozs7YUF3QlUsVUFBQyxLQUFLLEVBQWE7QUFDNUIsWUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ2IsZ0JBQUssS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNoQixNQUFNLElBQUksS0FBSyxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUN0QyxnQkFBSyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ3BCLE1BQU07QUFDTCxnQkFBSyxLQUFLLEdBQUcsTUFBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztTQUN0QztPQUNGOzs7Ozs7Ozs7YUFHZ0IsWUFBTTtBQUNyQixlQUFLLEtBQUssR0FDUixPQUFLLEtBQUssR0FBRyxPQUFLLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUNoQyxPQUFLLEtBQUssR0FBRyxDQUFDLEdBQ2QsT0FBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztPQUMvQjs7Ozs7Ozs7O2FBR2dCLFlBQU07QUFDckIsZUFBSyxLQUFLLEdBQUcsT0FBSyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE9BQUssS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDbEQ7Ozs7Ozs7OzthQUdPLFlBQU07QUFDWixlQUFLLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNyQixlQUFLLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNqQjs7Ozs7U0EzRmtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9vdXRwdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBhY3Rpb24sIGNvbXB1dGVkLCBvYnNlcnZhYmxlIH0gZnJvbSBcIm1vYnhcIjtcbmltcG9ydCB7IHJpY2hlc3RNaW1ldHlwZSB9IGZyb20gXCJAbnRlcmFjdC90cmFuc2Zvcm1zXCI7XG5pbXBvcnQge1xuICBlc2NhcGVDYXJyaWFnZVJldHVybixcbiAgZXNjYXBlQ2FycmlhZ2VSZXR1cm5TYWZlXG59IGZyb20gXCJlc2NhcGUtY2FycmlhZ2VcIjtcblxuaW1wb3J0IHtcbiAgdHJhbnNmb3JtcyxcbiAgZGlzcGxheU9yZGVyXG59IGZyb20gXCIuLy4uL2NvbXBvbmVudHMvcmVzdWx0LXZpZXcvdHJhbnNmb3Jtc1wiO1xuXG5pbXBvcnQgdHlwZSB7IElPYnNlcnZhYmxlQXJyYXkgfSBmcm9tIFwibW9ieFwiO1xuXG5jb25zdCBvdXRwdXRUeXBlcyA9IFtcImV4ZWN1dGVfcmVzdWx0XCIsIFwiZGlzcGxheV9kYXRhXCIsIFwic3RyZWFtXCIsIFwiZXJyb3JcIl07XG5cbi8qKlxuICogaHR0cHM6Ly9naXRodWIuY29tL250ZXJhY3QvaHlkcm9nZW4vaXNzdWVzLzQ2NiNpc3N1ZWNvbW1lbnQtMjc0ODIyOTM3XG4gKiBBbiBvdXRwdXQgY2FuIGJlIGEgc3RyZWFtIG9mIGRhdGEgdGhhdCBkb2VzIG5vdCBhcnJpdmUgYXQgYSBzaW5nbGUgdGltZS4gVGhpc1xuICogZnVuY3Rpb24gaGFuZGxlcyB0aGUgZGlmZmVyZW50IHR5cGVzIG9mIG91dHB1dHMgYW5kIGFjY3VtdWxhdGVzIHRoZSBkYXRhXG4gKiBpbnRvIGEgcmVkdWNlZCBvdXRwdXQuXG4gKlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBvdXRwdXRzIC0gS2VybmVsIG91dHB1dCBtZXNzYWdlc1xuICogQHBhcmFtIHtPYmplY3R9IG91dHB1dCAtIE91dHB1dHRlZCB0byBiZSByZWR1Y2VkIGludG8gbGlzdCBvZiBvdXRwdXRzXG4gKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+fSB1cGRhdGVkLW91dHB1dHMgLSBPdXRwdXRzICsgT3V0cHV0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWR1Y2VPdXRwdXRzKFxuICBvdXRwdXRzOiBJT2JzZXJ2YWJsZUFycmF5PE9iamVjdD4sXG4gIG91dHB1dDogT2JqZWN0XG4pOiBJT2JzZXJ2YWJsZUFycmF5PE9iamVjdD4ge1xuICBjb25zdCBsYXN0ID0gb3V0cHV0cy5sZW5ndGggLSAxO1xuICBpZiAoXG4gICAgb3V0cHV0cy5sZW5ndGggPiAwICYmXG4gICAgb3V0cHV0Lm91dHB1dF90eXBlID09PSBcInN0cmVhbVwiICYmXG4gICAgb3V0cHV0c1tsYXN0XS5vdXRwdXRfdHlwZSA9PT0gXCJzdHJlYW1cIlxuICApIHtcbiAgICBmdW5jdGlvbiBhcHBlbmRUZXh0KHByZXZpb3VzOiBPYmplY3QsIG5leHQ6IE9iamVjdCkge1xuICAgICAgcHJldmlvdXMudGV4dCA9IGVzY2FwZUNhcnJpYWdlUmV0dXJuU2FmZShwcmV2aW91cy50ZXh0ICsgbmV4dC50ZXh0KTtcbiAgICB9XG5cbiAgICBpZiAob3V0cHV0c1tsYXN0XS5uYW1lID09PSBvdXRwdXQubmFtZSkge1xuICAgICAgYXBwZW5kVGV4dChvdXRwdXRzW2xhc3RdLCBvdXRwdXQpO1xuICAgICAgcmV0dXJuIG91dHB1dHM7XG4gICAgfVxuXG4gICAgaWYgKG91dHB1dHMubGVuZ3RoID4gMSAmJiBvdXRwdXRzW2xhc3QgLSAxXS5uYW1lID09PSBvdXRwdXQubmFtZSkge1xuICAgICAgYXBwZW5kVGV4dChvdXRwdXRzW2xhc3QgLSAxXSwgb3V0cHV0KTtcbiAgICAgIHJldHVybiBvdXRwdXRzO1xuICAgIH1cbiAgfVxuICBvdXRwdXRzLnB1c2gob3V0cHV0KTtcbiAgcmV0dXJuIG91dHB1dHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1NpbmdlTGluZSh0ZXh0OiBzdHJpbmcsIGF2YWlsYWJsZVNwYWNlOiBudW1iZXIpIHtcbiAgLy8gSWYgaXQgdHVybnMgb3V0IGVzY2FwZUNhcnJpYWdlUmV0dXJuIGlzIGEgYm90dGxlbmVjaywgd2Ugc2hvdWxkIHJlbW92ZSBpdC5cbiAgcmV0dXJuIChcbiAgICAodGV4dC5pbmRleE9mKFwiXFxuXCIpID09PSAtMSB8fCB0ZXh0LmluZGV4T2YoXCJcXG5cIikgPT09IHRleHQubGVuZ3RoIC0gMSkgJiZcbiAgICBhdmFpbGFibGVTcGFjZSA+IGVzY2FwZUNhcnJpYWdlUmV0dXJuKHRleHQpLmxlbmd0aFxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPdXRwdXRTdG9yZSB7XG4gIG91dHB1dHM6IElPYnNlcnZhYmxlQXJyYXk8T2JqZWN0PiA9IG9ic2VydmFibGUoW10pO1xuICBAb2JzZXJ2YWJsZSBzdGF0dXM6IHN0cmluZyA9IFwicnVubmluZ1wiO1xuICBAb2JzZXJ2YWJsZSBleGVjdXRpb25Db3VudDogP251bWJlciA9IG51bGw7XG4gIEBvYnNlcnZhYmxlIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgQG9ic2VydmFibGVcbiAgcG9zaXRpb24gPSB7XG4gICAgbGluZUhlaWdodDogMCxcbiAgICBsaW5lTGVuZ3RoOiAwLFxuICAgIGVkaXRvcldpZHRoOiAwLFxuICAgIGNoYXJXaWR0aDogMFxuICB9O1xuXG4gIEBjb21wdXRlZFxuICBnZXQgaXNQbGFpbigpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5vdXRwdXRzLmxlbmd0aCAhPT0gMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgYXZhaWxhYmxlU3BhY2UgPSBNYXRoLmZsb29yKFxuICAgICAgKHRoaXMucG9zaXRpb24uZWRpdG9yV2lkdGggLSB0aGlzLnBvc2l0aW9uLmxpbmVMZW5ndGgpIC9cbiAgICAgICAgdGhpcy5wb3NpdGlvbi5jaGFyV2lkdGhcbiAgICApO1xuICAgIGlmIChhdmFpbGFibGVTcGFjZSA8PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBvdXRwdXQgPSB0aGlzLm91dHB1dHNbMF07XG4gICAgc3dpdGNoIChvdXRwdXQub3V0cHV0X3R5cGUpIHtcbiAgICAgIGNhc2UgXCJleGVjdXRlX3Jlc3VsdFwiOlxuICAgICAgY2FzZSBcImRpc3BsYXlfZGF0YVwiOiB7XG4gICAgICAgIGNvbnN0IGJ1bmRsZSA9IG91dHB1dC5kYXRhO1xuICAgICAgICBjb25zdCBtaW1ldHlwZSA9IHJpY2hlc3RNaW1ldHlwZShidW5kbGUsIGRpc3BsYXlPcmRlciwgdHJhbnNmb3Jtcyk7XG4gICAgICAgIHJldHVybiBtaW1ldHlwZSA9PT0gXCJ0ZXh0L3BsYWluXCJcbiAgICAgICAgICA/IGlzU2luZ2VMaW5lKGJ1bmRsZVttaW1ldHlwZV0sIGF2YWlsYWJsZVNwYWNlKVxuICAgICAgICAgIDogZmFsc2U7XG4gICAgICB9XG4gICAgICBjYXNlIFwic3RyZWFtXCI6IHtcbiAgICAgICAgcmV0dXJuIGlzU2luZ2VMaW5lKG91dHB1dC50ZXh0LCBhdmFpbGFibGVTcGFjZSk7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIGFwcGVuZE91dHB1dChtZXNzYWdlOiBPYmplY3QpIHtcbiAgICBpZiAobWVzc2FnZS5zdHJlYW0gPT09IFwiZXhlY3V0aW9uX2NvdW50XCIpIHtcbiAgICAgIHRoaXMuZXhlY3V0aW9uQ291bnQgPSBtZXNzYWdlLmRhdGE7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlLnN0cmVhbSA9PT0gXCJzdGF0dXNcIikge1xuICAgICAgdGhpcy5zdGF0dXMgPSBtZXNzYWdlLmRhdGE7XG4gICAgfSBlbHNlIGlmIChvdXRwdXRUeXBlcy5pbmRleE9mKG1lc3NhZ2Uub3V0cHV0X3R5cGUpID4gLTEpIHtcbiAgICAgIHJlZHVjZU91dHB1dHModGhpcy5vdXRwdXRzLCBtZXNzYWdlKTtcbiAgICAgIHRoaXMuc2V0SW5kZXgodGhpcy5vdXRwdXRzLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgfVxuXG4gIEBhY3Rpb25cbiAgdXBkYXRlUG9zaXRpb24ocG9zaXRpb246IHtcbiAgICBsaW5lSGVpZ2h0PzogbnVtYmVyLFxuICAgIGxpbmVMZW5ndGg/OiBudW1iZXIsXG4gICAgZWRpdG9yV2lkdGg/OiBudW1iZXJcbiAgfSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5wb3NpdGlvbiwgcG9zaXRpb24pO1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRJbmRleCA9IChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgfSBlbHNlIGlmIChpbmRleCA8IHRoaXMub3V0cHV0cy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbmRleCA9IHRoaXMub3V0cHV0cy5sZW5ndGggLSAxO1xuICAgIH1cbiAgfTtcblxuICBAYWN0aW9uXG4gIGluY3JlbWVudEluZGV4ID0gKCkgPT4ge1xuICAgIHRoaXMuaW5kZXggPVxuICAgICAgdGhpcy5pbmRleCA8IHRoaXMub3V0cHV0cy5sZW5ndGggLSAxXG4gICAgICAgID8gdGhpcy5pbmRleCArIDFcbiAgICAgICAgOiB0aGlzLm91dHB1dHMubGVuZ3RoIC0gMTtcbiAgfTtcblxuICBAYWN0aW9uXG4gIGRlY3JlbWVudEluZGV4ID0gKCkgPT4ge1xuICAgIHRoaXMuaW5kZXggPSB0aGlzLmluZGV4ID4gMCA/IHRoaXMuaW5kZXggLSAxIDogMDtcbiAgfTtcblxuICBAYWN0aW9uXG4gIGNsZWFyID0gKCkgPT4ge1xuICAgIHRoaXMub3V0cHV0cy5jbGVhcigpO1xuICAgIHRoaXMuaW5kZXggPSAtMTtcbiAgfTtcbn1cbiJdfQ==