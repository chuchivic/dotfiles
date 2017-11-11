Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _atom = require("atom");

var _mobx = require("mobx");

var _lodash = require("lodash");

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _storeWatches = require("./store/watches");

var _storeWatches2 = _interopRequireDefault(_storeWatches);

var _storeOutput = require("./store/output");

var _storeOutput2 = _interopRequireDefault(_storeOutput);

var _pluginApiHydrogenKernel = require("./plugin-api/hydrogen-kernel");

var _pluginApiHydrogenKernel2 = _interopRequireDefault(_pluginApiHydrogenKernel);

var Kernel = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(Kernel, [{
    key: "executionState",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return "loading";
    },
    enumerable: true
  }, {
    key: "inspector",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return { bundle: {} };
    },
    enumerable: true
  }], null, _instanceInitializers);

  function Kernel(kernelSpec, grammar) {
    _classCallCheck(this, Kernel);

    _defineDecoratedPropertyDescriptor(this, "executionState", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "inspector", _instanceInitializers);

    this.outputStore = new _storeOutput2["default"]();
    this.watchCallbacks = [];
    this.emitter = new _atom.Emitter();
    this.pluginWrapper = null;

    this.kernelSpec = kernelSpec;
    this.grammar = grammar;

    this.language = kernelSpec.language.toLowerCase();
    this.displayName = kernelSpec.display_name;

    this.watchesStore = new _storeWatches2["default"](this);
  }

  _createDecoratedClass(Kernel, [{
    key: "setExecutionState",
    decorators: [_mobx.action],
    value: function setExecutionState(state) {
      this.executionState = state;
    }
  }, {
    key: "setInspectorResult",
    decorators: [_mobx.action],
    value: _asyncToGenerator(function* (bundle, editor) {
      if ((0, _lodash.isEqual)(this.inspector.bundle, bundle)) {
        yield atom.workspace.toggle(_utils.INSPECTOR_URI);
      } else if (bundle.size !== 0) {
        this.inspector.bundle = bundle;
        yield atom.workspace.open(_utils.INSPECTOR_URI, { searchAllPanes: true });
      }
      (0, _utils.focus)(editor);
    })
  }, {
    key: "getPluginWrapper",
    value: function getPluginWrapper() {
      if (!this.pluginWrapper) {
        this.pluginWrapper = new _pluginApiHydrogenKernel2["default"](this);
      }

      return this.pluginWrapper;
    }
  }, {
    key: "addWatchCallback",
    value: function addWatchCallback(watchCallback) {
      this.watchCallbacks.push(watchCallback);
    }
  }, {
    key: "_callWatchCallbacks",
    value: function _callWatchCallbacks() {
      this.watchCallbacks.forEach(function (watchCallback) {
        return watchCallback();
      });
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      throw new Error("Kernel: interrupt method not implemented");
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      throw new Error("Kernel: shutdown method not implemented");
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      throw new Error("Kernel: restart method not implemented");
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      throw new Error("Kernel: execute method not implemented");
    }
  }, {
    key: "executeWatch",
    value: function executeWatch(code, onResults) {
      throw new Error("Kernel: executeWatch method not implemented");
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      throw new Error("Kernel: complete method not implemented");
    }
  }, {
    key: "inspect",
    value: function inspect(code, curorPos, onResults) {
      throw new Error("Kernel: inspect method not implemented");
    }
  }, {
    key: "_parseIOMessage",
    value: function _parseIOMessage(message) {
      var result = this._parseExecuteInputIOMessage(message);

      if (!result) {
        result = (0, _utils.msgSpecToNotebookFormat)((0, _utils.msgSpecV4toV5)(message));
      }

      return result;
    }
  }, {
    key: "_parseExecuteInputIOMessage",
    value: function _parseExecuteInputIOMessage(message) {
      if (message.header.msg_type === "execute_input") {
        return {
          data: message.content.execution_count,
          stream: "execution_count"
        };
      }

      return null;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("Kernel: Destroying base kernel");
      _store2["default"].deleteKernel(this);
      if (this.pluginWrapper) {
        this.pluginWrapper.destroyed = true;
      }
      this.emitter.emit("did-destroy");
      this.emitter.dispose();
    }
  }], null, _instanceInitializers);

  return Kernel;
})();

exports["default"] = Kernel;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0JBRXdCLE1BQU07O29CQUNLLE1BQU07O3NCQUNqQixRQUFROztxQkFRekIsU0FBUzs7cUJBQ0UsU0FBUzs7Ozs0QkFFRixpQkFBaUI7Ozs7MkJBQ2xCLGdCQUFnQjs7Ozt1Q0FDYiw4QkFBOEI7Ozs7SUFFcEMsTUFBTTs7Ozt3QkFBTixNQUFNOzs7O2FBQ0ksU0FBUzs7Ozs7OzthQUNkLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTs7Ozs7QUFZM0IsV0FkUSxNQUFNLENBY2IsVUFBc0IsRUFBRSxPQUFxQixFQUFFOzBCQWR4QyxNQUFNOzs7Ozs7U0FHekIsV0FBVyxHQUFHLDhCQUFpQjtTQU8vQixjQUFjLEdBQW9CLEVBQUU7U0FDcEMsT0FBTyxHQUFHLG1CQUFhO1NBQ3ZCLGFBQWEsR0FBMEIsSUFBSTs7QUFHekMsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDN0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsRCxRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUM7O0FBRTNDLFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQWlCLElBQUksQ0FBQyxDQUFDO0dBQzVDOzt3QkF0QmtCLE1BQU07OztXQXlCUiwyQkFBQyxLQUFhLEVBQUU7QUFDL0IsVUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7S0FDN0I7Ozs7NkJBR3VCLFdBQUMsTUFBYyxFQUFFLE1BQXdCLEVBQUU7QUFDakUsVUFBSSxxQkFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtBQUMxQyxjQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxzQkFBZSxDQUFDO09BQzVDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUM1QixZQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDL0IsY0FBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQWdCLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7T0FDcEU7QUFDRCx3QkFBTSxNQUFNLENBQUMsQ0FBQztLQUNmOzs7V0FFZSw0QkFBRztBQUNqQixVQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN2QixZQUFJLENBQUMsYUFBYSxHQUFHLHlDQUFtQixJQUFJLENBQUMsQ0FBQztPQUMvQzs7QUFFRCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7S0FDM0I7OztXQUVlLDBCQUFDLGFBQXVCLEVBQUU7QUFDeEMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDekM7OztXQUVrQiwrQkFBRztBQUNwQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFBLGFBQWE7ZUFBSSxhQUFhLEVBQUU7T0FBQSxDQUFDLENBQUM7S0FDL0Q7OztXQUVRLHFCQUFHO0FBQ1YsWUFBTSxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFTyxvQkFBRztBQUNULFlBQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUM1RDs7O1dBRU0saUJBQUMsV0FBc0IsRUFBRTtBQUM5QixZQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7S0FDM0Q7OztXQUVNLGlCQUFDLElBQVksRUFBRSxTQUFtQixFQUFFO0FBQ3pDLFlBQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUMzRDs7O1dBRVcsc0JBQUMsSUFBWSxFQUFFLFNBQW1CLEVBQUU7QUFDOUMsWUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ2hFOzs7V0FFTyxrQkFBQyxJQUFZLEVBQUUsU0FBbUIsRUFBRTtBQUMxQyxZQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7S0FDNUQ7OztXQUVNLGlCQUFDLElBQVksRUFBRSxRQUFnQixFQUFFLFNBQW1CLEVBQUU7QUFDM0QsWUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQzNEOzs7V0FFYyx5QkFBQyxPQUFnQixFQUFFO0FBQ2hDLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFdkQsVUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLGNBQU0sR0FBRyxvQ0FBd0IsMEJBQWMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUMxRDs7QUFFRCxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7V0FFMEIscUNBQUMsT0FBZ0IsRUFBRTtBQUM1QyxVQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLGVBQWUsRUFBRTtBQUMvQyxlQUFPO0FBQ0wsY0FBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZTtBQUNyQyxnQkFBTSxFQUFFLGlCQUFpQjtTQUMxQixDQUFDO09BQ0g7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRU0sbUJBQUc7QUFDUixzQkFBSSxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3RDLHlCQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixVQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO09BQ3JDO0FBQ0QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7O1NBakhrQixNQUFNOzs7cUJBQU4sTUFBTSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIva2VybmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRW1pdHRlciB9IGZyb20gXCJhdG9tXCI7XG5pbXBvcnQgeyBvYnNlcnZhYmxlLCBhY3Rpb24gfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgaXNFcXVhbCB9IGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IHtcbiAgbG9nLFxuICBmb2N1cyxcbiAgbXNnU3BlY1RvTm90ZWJvb2tGb3JtYXQsXG4gIG1zZ1NwZWNWNHRvVjUsXG4gIElOU1BFQ1RPUl9VUklcbn0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCBzdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuXG5pbXBvcnQgV2F0Y2hlc1N0b3JlIGZyb20gXCIuL3N0b3JlL3dhdGNoZXNcIjtcbmltcG9ydCBPdXRwdXRTdG9yZSBmcm9tIFwiLi9zdG9yZS9vdXRwdXRcIjtcbmltcG9ydCBIeWRyb2dlbktlcm5lbCBmcm9tIFwiLi9wbHVnaW4tYXBpL2h5ZHJvZ2VuLWtlcm5lbFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXJuZWwge1xuICBAb2JzZXJ2YWJsZSBleGVjdXRpb25TdGF0ZSA9IFwibG9hZGluZ1wiO1xuICBAb2JzZXJ2YWJsZSBpbnNwZWN0b3IgPSB7IGJ1bmRsZToge30gfTtcbiAgb3V0cHV0U3RvcmUgPSBuZXcgT3V0cHV0U3RvcmUoKTtcblxuICBrZXJuZWxTcGVjOiBLZXJuZWxzcGVjO1xuICBncmFtbWFyOiBhdG9tJEdyYW1tYXI7XG4gIGxhbmd1YWdlOiBzdHJpbmc7XG4gIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG4gIHdhdGNoZXNTdG9yZTogV2F0Y2hlc1N0b3JlO1xuICB3YXRjaENhbGxiYWNrczogQXJyYXk8RnVuY3Rpb24+ID0gW107XG4gIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICBwbHVnaW5XcmFwcGVyOiBIeWRyb2dlbktlcm5lbCB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsIGdyYW1tYXI6IGF0b20kR3JhbW1hcikge1xuICAgIHRoaXMua2VybmVsU3BlYyA9IGtlcm5lbFNwZWM7XG4gICAgdGhpcy5ncmFtbWFyID0gZ3JhbW1hcjtcblxuICAgIHRoaXMubGFuZ3VhZ2UgPSBrZXJuZWxTcGVjLmxhbmd1YWdlLnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5kaXNwbGF5TmFtZSA9IGtlcm5lbFNwZWMuZGlzcGxheV9uYW1lO1xuXG4gICAgdGhpcy53YXRjaGVzU3RvcmUgPSBuZXcgV2F0Y2hlc1N0b3JlKHRoaXMpO1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRFeGVjdXRpb25TdGF0ZShzdGF0ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5leGVjdXRpb25TdGF0ZSA9IHN0YXRlO1xuICB9XG5cbiAgQGFjdGlvblxuICBhc3luYyBzZXRJbnNwZWN0b3JSZXN1bHQoYnVuZGxlOiBPYmplY3QsIGVkaXRvcjogP2F0b20kVGV4dEVkaXRvcikge1xuICAgIGlmIChpc0VxdWFsKHRoaXMuaW5zcGVjdG9yLmJ1bmRsZSwgYnVuZGxlKSkge1xuICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2UudG9nZ2xlKElOU1BFQ1RPUl9VUkkpO1xuICAgIH0gZWxzZSBpZiAoYnVuZGxlLnNpemUgIT09IDApIHtcbiAgICAgIHRoaXMuaW5zcGVjdG9yLmJ1bmRsZSA9IGJ1bmRsZTtcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oSU5TUEVDVE9SX1VSSSwgeyBzZWFyY2hBbGxQYW5lczogdHJ1ZSB9KTtcbiAgICB9XG4gICAgZm9jdXMoZWRpdG9yKTtcbiAgfVxuXG4gIGdldFBsdWdpbldyYXBwZXIoKSB7XG4gICAgaWYgKCF0aGlzLnBsdWdpbldyYXBwZXIpIHtcbiAgICAgIHRoaXMucGx1Z2luV3JhcHBlciA9IG5ldyBIeWRyb2dlbktlcm5lbCh0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wbHVnaW5XcmFwcGVyO1xuICB9XG5cbiAgYWRkV2F0Y2hDYWxsYmFjayh3YXRjaENhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIHRoaXMud2F0Y2hDYWxsYmFja3MucHVzaCh3YXRjaENhbGxiYWNrKTtcbiAgfVxuXG4gIF9jYWxsV2F0Y2hDYWxsYmFja3MoKSB7XG4gICAgdGhpcy53YXRjaENhbGxiYWNrcy5mb3JFYWNoKHdhdGNoQ2FsbGJhY2sgPT4gd2F0Y2hDYWxsYmFjaygpKTtcbiAgfVxuXG4gIGludGVycnVwdCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXJuZWw6IGludGVycnVwdCBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgc2h1dGRvd24oKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiS2VybmVsOiBzaHV0ZG93biBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgcmVzdGFydChvblJlc3RhcnRlZDogP0Z1bmN0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiS2VybmVsOiByZXN0YXJ0IG1ldGhvZCBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICBleGVjdXRlKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbDogZXhlY3V0ZSBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgZXhlY3V0ZVdhdGNoKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbDogZXhlY3V0ZVdhdGNoIG1ldGhvZCBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICBjb21wbGV0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJLZXJuZWw6IGNvbXBsZXRlIG1ldGhvZCBub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICBpbnNwZWN0KGNvZGU6IHN0cmluZywgY3Vyb3JQb3M6IG51bWJlciwgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIktlcm5lbDogaW5zcGVjdCBtZXRob2Qgbm90IGltcGxlbWVudGVkXCIpO1xuICB9XG5cbiAgX3BhcnNlSU9NZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5fcGFyc2VFeGVjdXRlSW5wdXRJT01lc3NhZ2UobWVzc2FnZSk7XG5cbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmVzdWx0ID0gbXNnU3BlY1RvTm90ZWJvb2tGb3JtYXQobXNnU3BlY1Y0dG9WNShtZXNzYWdlKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIF9wYXJzZUV4ZWN1dGVJbnB1dElPTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UuaGVhZGVyLm1zZ190eXBlID09PSBcImV4ZWN1dGVfaW5wdXRcIikge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogbWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9jb3VudCxcbiAgICAgICAgc3RyZWFtOiBcImV4ZWN1dGlvbl9jb3VudFwiXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJLZXJuZWw6IERlc3Ryb3lpbmcgYmFzZSBrZXJuZWxcIik7XG4gICAgc3RvcmUuZGVsZXRlS2VybmVsKHRoaXMpO1xuICAgIGlmICh0aGlzLnBsdWdpbldyYXBwZXIpIHtcbiAgICAgIHRoaXMucGx1Z2luV3JhcHBlci5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdChcImRpZC1kZXN0cm95XCIpO1xuICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==