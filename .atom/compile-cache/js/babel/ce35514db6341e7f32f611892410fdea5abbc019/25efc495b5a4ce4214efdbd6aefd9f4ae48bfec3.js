Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _kernel = require("./kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _inputView = require("./input-view");

var _inputView2 = _interopRequireDefault(_inputView);

var _utils = require("./utils");

var WSKernel = (function (_Kernel) {
  _inherits(WSKernel, _Kernel);

  function WSKernel(kernelSpec, grammar, session) {
    var _this = this;

    _classCallCheck(this, WSKernel);

    _get(Object.getPrototypeOf(WSKernel.prototype), "constructor", this).call(this, kernelSpec, grammar);
    this.session = session;

    this.session.statusChanged.connect(function () {
      return _this.setExecutionState(_this.session.status);
    });
    this.setExecutionState(this.session.status); // Set initial status correctly
  }

  _createClass(WSKernel, [{
    key: "interrupt",
    value: function interrupt() {
      return this.session.kernel.interrupt();
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      return this.session.kernel.shutdown();
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      var _this2 = this;

      var future = this.session.kernel.restart();
      future.then(function () {
        if (onRestarted) onRestarted(_this2.session.kernel);
      });
    }
  }, {
    key: "_execute",
    value: function _execute(code, callWatches, onResults) {
      var _this3 = this;

      var future = this.session.kernel.requestExecute({ code: code });

      future.onIOPub = function (message) {
        if (callWatches && message.header.msg_type === "status" && message.content.execution_state === "idle") {
          _this3._callWatchCallbacks();
        }

        if (onResults) {
          (0, _utils.log)("WSKernel: _execute:", message);
          var result = _this3._parseIOMessage(message);
          if (result) onResults(result);
        }
      };

      future.onReply = function (message) {
        var result = {
          data: message.content.status,
          stream: "status"
        };
        if (onResults) onResults(result);
      };

      future.onStdin = function (message) {
        if (message.header.msg_type !== "input_request") {
          return;
        }

        var prompt = message.content.prompt;

        var inputView = new _inputView2["default"]({ prompt: prompt }, function (input) {
          return _this3.session.kernel.sendInputReply({ value: input });
        });

        inputView.attach();
      };
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      this._execute(code, true, onResults);
    }
  }, {
    key: "executeWatch",
    value: function executeWatch(code, onResults) {
      this._execute(code, false, onResults);
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      this.session.kernel.requestComplete({
        code: code,
        cursor_pos: code.length
      }).then(function (message) {
        return onResults(message.content);
      });
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      this.session.kernel.requestInspect({
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      }).then(function (message) {
        return onResults({
          data: message.content.data,
          found: message.content.found
        });
      });
    }
  }, {
    key: "promptRename",
    value: function promptRename() {
      var _this4 = this;

      var view = new _inputView2["default"]({
        prompt: "Name your current session",
        defaultText: this.session.path,
        allowCancel: true
      }, function (input) {
        return _this4.session.rename(input);
      });

      view.attach();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("WSKernel: destroying jupyter-js-services Session");
      this.session.dispose();
      _get(Object.getPrototypeOf(WSKernel.prototype), "destroy", this).call(this);
    }
  }]);

  return WSKernel;
})(_kernel2["default"]);

exports["default"] = WSKernel;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRW1CLFVBQVU7Ozs7eUJBQ1AsY0FBYzs7OztxQkFDaEIsU0FBUzs7SUFJUixRQUFRO1lBQVIsUUFBUTs7QUFHaEIsV0FIUSxRQUFRLENBR2YsVUFBc0IsRUFBRSxPQUFxQixFQUFFLE9BQWdCLEVBQUU7OzswQkFIMUQsUUFBUTs7QUFJekIsK0JBSmlCLFFBQVEsNkNBSW5CLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFDM0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQzthQUNqQyxNQUFLLGlCQUFpQixDQUFDLE1BQUssT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUFBLENBQzVDLENBQUM7QUFDRixRQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM3Qzs7ZUFYa0IsUUFBUTs7V0FhbEIscUJBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3hDOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7OztXQUVNLGlCQUFDLFdBQXNCLEVBQUU7OztBQUM5QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QyxZQUFNLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDaEIsWUFBSSxXQUFXLEVBQUUsV0FBVyxDQUFDLE9BQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ25ELENBQUMsQ0FBQztLQUNKOzs7V0FFTyxrQkFBQyxJQUFZLEVBQUUsV0FB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Q0UsY0FBTSxFQUFFLDJCQUEyQjtBQUNuQyxtQkFBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtBQUM5QixtQkFBVyxFQUFFLElBQUk7T0FDbEIsRUFDRCxVQUFDLEtBQUs7ZUFBYSxPQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO09BQUEsQ0FDOUMsQ0FBQzs7QUFFRixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRU0sbUJBQUc7QUFDUixzQkFBSSxrREFBa0QsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsaUNBdEhpQixRQUFRLHlDQXNIVDtLQUNqQjs7O1NBdkhrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvd3Mta2VybmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IEtlcm5lbCBmcm9tIFwiLi9rZXJuZWxcIjtcbmltcG9ydCBJbnB1dFZpZXcgZnJvbSBcIi4vaW5wdXQtdmlld1wiO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgeyBTZXNzaW9uIH0gZnJvbSBcIi4vanVweXRlci1qcy1zZXJ2aWNlcy1zaGltXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdTS2VybmVsIGV4dGVuZHMgS2VybmVsIHtcbiAgc2Vzc2lvbjogU2Vzc2lvbjtcblxuICBjb25zdHJ1Y3RvcihrZXJuZWxTcGVjOiBLZXJuZWxzcGVjLCBncmFtbWFyOiBhdG9tJEdyYW1tYXIsIHNlc3Npb246IFNlc3Npb24pIHtcbiAgICBzdXBlcihrZXJuZWxTcGVjLCBncmFtbWFyKTtcbiAgICB0aGlzLnNlc3Npb24gPSBzZXNzaW9uO1xuXG4gICAgdGhpcy5zZXNzaW9uLnN0YXR1c0NoYW5nZWQuY29ubmVjdCgoKSA9PlxuICAgICAgdGhpcy5zZXRFeGVjdXRpb25TdGF0ZSh0aGlzLnNlc3Npb24uc3RhdHVzKVxuICAgICk7XG4gICAgdGhpcy5zZXRFeGVjdXRpb25TdGF0ZSh0aGlzLnNlc3Npb24uc3RhdHVzKTsgLy8gU2V0IGluaXRpYWwgc3RhdHVzIGNvcnJlY3RseVxuICB9XG5cbiAgaW50ZXJydXB0KCkge1xuICAgIHJldHVybiB0aGlzLnNlc3Npb24ua2VybmVsLmludGVycnVwdCgpO1xuICB9XG5cbiAgc2h1dGRvd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbi5rZXJuZWwuc2h1dGRvd24oKTtcbiAgfVxuXG4gIHJlc3RhcnQob25SZXN0YXJ0ZWQ6ID9GdW5jdGlvbikge1xuICAgIGNvbnN0IGZ1dHVyZSA9IHRoaXMuc2Vzc2lvbi5rZXJuZWwucmVzdGFydCgpO1xuICAgIGZ1dHVyZS50aGVuKCgpID0+IHtcbiAgICAgIGlmIChvblJlc3RhcnRlZCkgb25SZXN0YXJ0ZWQodGhpcy5zZXNzaW9uLmtlcm5lbCk7XG4gICAgfSk7XG4gIH1cblxuICBfZXhlY3V0ZShjb2RlOiBzdHJpbmcsIGNhbGxXYXRjaGVzOiBib29sZWFuLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgY29uc3QgZnV0dXJlID0gdGhpcy5zZXNzaW9uLmtlcm5lbC5yZXF1ZXN0RXhlY3V0ZSh7IGNvZGUgfSk7XG5cbiAgICBmdXR1cmUub25JT1B1YiA9IChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGNhbGxXYXRjaGVzICYmXG4gICAgICAgIG1lc3NhZ2UuaGVhZGVyLm1zZ190eXBlID09PSBcInN0YXR1c1wiICYmXG4gICAgICAgIG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fc3RhdGUgPT09IFwiaWRsZVwiXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fY2FsbFdhdGNoQ2FsbGJhY2tzKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChvblJlc3VsdHMpIHtcbiAgICAgICAgbG9nKFwiV1NLZXJuZWw6IF9leGVjdXRlOlwiLCBtZXNzYWdlKTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fcGFyc2VJT01lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgIGlmIChyZXN1bHQpIG9uUmVzdWx0cyhyZXN1bHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdXR1cmUub25SZXBseSA9IChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIGRhdGE6IG1lc3NhZ2UuY29udGVudC5zdGF0dXMsXG4gICAgICAgIHN0cmVhbTogXCJzdGF0dXNcIlxuICAgICAgfTtcbiAgICAgIGlmIChvblJlc3VsdHMpIG9uUmVzdWx0cyhyZXN1bHQpO1xuICAgIH07XG5cbiAgICBmdXR1cmUub25TdGRpbiA9IChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG4gICAgICBpZiAobWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgIT09IFwiaW5wdXRfcmVxdWVzdFwiKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgeyBwcm9tcHQgfSA9IG1lc3NhZ2UuY29udGVudDtcblxuICAgICAgY29uc3QgaW5wdXRWaWV3ID0gbmV3IElucHV0Vmlldyh7IHByb21wdCB9LCAoaW5wdXQ6IHN0cmluZykgPT5cbiAgICAgICAgdGhpcy5zZXNzaW9uLmtlcm5lbC5zZW5kSW5wdXRSZXBseSh7IHZhbHVlOiBpbnB1dCB9KVxuICAgICAgKTtcblxuICAgICAgaW5wdXRWaWV3LmF0dGFjaCgpO1xuICAgIH07XG4gIH1cblxuICBleGVjdXRlKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRoaXMuX2V4ZWN1dGUoY29kZSwgdHJ1ZSwgb25SZXN1bHRzKTtcbiAgfVxuXG4gIGV4ZWN1dGVXYXRjaChjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICB0aGlzLl9leGVjdXRlKGNvZGUsIGZhbHNlLCBvblJlc3VsdHMpO1xuICB9XG5cbiAgY29tcGxldGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5zZXNzaW9uLmtlcm5lbFxuICAgICAgLnJlcXVlc3RDb21wbGV0ZSh7XG4gICAgICAgIGNvZGUsXG4gICAgICAgIGN1cnNvcl9wb3M6IGNvZGUubGVuZ3RoXG4gICAgICB9KVxuICAgICAgLnRoZW4oKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IG9uUmVzdWx0cyhtZXNzYWdlLmNvbnRlbnQpKTtcbiAgfVxuXG4gIGluc3BlY3QoY29kZTogc3RyaW5nLCBjdXJzb3JQb3M6IG51bWJlciwgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRoaXMuc2Vzc2lvbi5rZXJuZWxcbiAgICAgIC5yZXF1ZXN0SW5zcGVjdCh7XG4gICAgICAgIGNvZGUsXG4gICAgICAgIGN1cnNvcl9wb3M6IGN1cnNvclBvcyxcbiAgICAgICAgZGV0YWlsX2xldmVsOiAwXG4gICAgICB9KVxuICAgICAgLnRoZW4oKG1lc3NhZ2U6IE1lc3NhZ2UpID0+XG4gICAgICAgIG9uUmVzdWx0cyh7XG4gICAgICAgICAgZGF0YTogbWVzc2FnZS5jb250ZW50LmRhdGEsXG4gICAgICAgICAgZm91bmQ6IG1lc3NhZ2UuY29udGVudC5mb3VuZFxuICAgICAgICB9KVxuICAgICAgKTtcbiAgfVxuXG4gIHByb21wdFJlbmFtZSgpIHtcbiAgICBjb25zdCB2aWV3ID0gbmV3IElucHV0VmlldyhcbiAgICAgIHtcbiAgICAgICAgcHJvbXB0OiBcIk5hbWUgeW91ciBjdXJyZW50IHNlc3Npb25cIixcbiAgICAgICAgZGVmYXVsdFRleHQ6IHRoaXMuc2Vzc2lvbi5wYXRoLFxuICAgICAgICBhbGxvd0NhbmNlbDogdHJ1ZVxuICAgICAgfSxcbiAgICAgIChpbnB1dDogc3RyaW5nKSA9PiB0aGlzLnNlc3Npb24ucmVuYW1lKGlucHV0KVxuICAgICk7XG5cbiAgICB2aWV3LmF0dGFjaCgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJXU0tlcm5lbDogZGVzdHJveWluZyBqdXB5dGVyLWpzLXNlcnZpY2VzIFNlc3Npb25cIik7XG4gICAgdGhpcy5zZXNzaW9uLmRpc3Bvc2UoKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==