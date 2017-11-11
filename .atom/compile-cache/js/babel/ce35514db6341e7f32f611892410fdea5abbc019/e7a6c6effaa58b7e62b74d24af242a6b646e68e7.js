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

  function WSKernel(gatewayName, kernelSpec, grammar, session) {
    var _this = this;

    _classCallCheck(this, WSKernel);

    _get(Object.getPrototypeOf(WSKernel.prototype), "constructor", this).call(this, kernelSpec, grammar);
    this.session = session;
    this.gatewayName = gatewayName;

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
        return _this4.session.setPath(input);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRW1CLFVBQVU7Ozs7eUJBQ1AsY0FBYzs7OztxQkFDaEIsU0FBUzs7SUFJUixRQUFRO1lBQVIsUUFBUTs7QUFJaEIsV0FKUSxRQUFRLENBS3pCLFdBQW1CLEVBQ25CLFVBQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLE9BQWdCLEVBQ2hCOzs7MEJBVGlCLFFBQVE7O0FBVXpCLCtCQVZpQixRQUFRLDZDQVVuQixVQUFVLEVBQUUsT0FBTyxFQUFFO0FBQzNCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDOztBQUUvQixRQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7YUFDakMsTUFBSyxpQkFBaUIsQ0FBQyxNQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUM7S0FBQSxDQUM1QyxDQUFDO0FBQ0YsUUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDN0M7O2VBbEJrQixRQUFROztXQW9CbEIscUJBQUc7QUFDVixhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3hDOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7OztXQUVNLGlCQUFDLFdBQXNCLEVBQUU7OztBQUM5QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM3QyxZQUFNLENBQUMsSUFBSSxDQUFDLFlBQU07QUFDaEIsWUFBSSxXQUFXLEVBQUUsV0FBVyxDQUFDLE9BQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ25ELENBQUMsQ0FBQztLQUNKOzs7V0FFTyxrQkFBQyxJQUFZLEVBQUUsV0FBb0IsRUFBRSxTQUFtQixFQUFFOzs7QUFDaEUsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxDQUFDLENBQUM7O0FBRTVELFlBQU0sQ0FBQyxPQUFPLEdBQUcsVUFBQyxPQUFPLEVBQWM7QUFDckMsWUFDRSxXQUFXLElBQ1gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxJQUNwQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsS0FBSyxNQUFNLEVBQzFDO0FBQ0EsaUJBQUssbUJBQW1CLEVBQUUsQ0FBQztTQUM1Qjs7QUFFRCxZQUFJLFNBQVMsRUFBRTtBQUNiLDBCQUFJLHFCQUFxQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDLGNBQU0sTUFBTSxHQUFHLE9BQUssZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdDLGNBQUksTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQjtPQUNGLENBQUM7O0FBRUYsWUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFDLE9BQU8sRUFBYztBQUNyQyxZQUFNLE1BQU0sR0FBRztBQUNiLGNBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU07QUFDNUIsZ0JBQU0sRUFBRSxRQUFRO1NBQ2pCLENBQUM7QUFDRixZQUFJLFNBQVMsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDbEMsQ0FBQzs7QUFFRixZQUFNLENBQUMsT0FBTyxHQUFHLFVBQUMsT0FBTyxFQUFjO0FBQ3JDLFlBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssZUFBZSxFQUFFO0FBQy9DLGlCQUFPO1NBQ1I7O1lBRU8sTUFBTSxHQUFLLE9BQU8sQ0FBQyxPQUFPLENBQTFCLE1BQU07O0FBRWQsWUFBTSxTQUFTLEdBQUcsMkJBQWMsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLEVBQUUsVUFBQyxLQUFLO2lCQUNoRCxPQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDO1NBQUEsQ0FDckQsQ0FBQzs7QUFFRixpQkFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO09BQ3BCLENBQUM7S0FDSDs7O1dBRU0saUJBQUMsSUFBWSxFQUFFLFNBQW1CLEVBQUU7QUFDekMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3RDOzs7V0FFVyxzQkFBQyxJQUFZLEVBQUUsU0FBbUIsRUFBRTtBQUM5QyxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDdkM7OztXQUVPLGtCQUFDLElBQVksRUFBRSxTQUFtQixFQUFFO0FBQzFDLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUNoQixlQUFlLENBQUM7QUFDZixZQUFJLEVBQUosSUFBSTtBQUNKLGtCQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU07T0FDeEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFDLE9BQU87ZUFBYyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQztLQUMzRDs7O1dBRU0saUJBQUMsSUFBWSxFQUFFLFNBQWlCLEVBQUUsU0FBbUIsRUFBRTtBQUM1RCxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FDaEIsY0FBYyxDQUFDO0FBQ2QsWUFBSSxFQUFKLElBQUk7QUFDSixrQkFBVSxFQUFFLFNBQVM7QUFDckIsb0JBQVksRUFBRSxDQUFDO09BQ2hCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBQyxPQUFPO2VBQ1osU0FBUyxDQUFDO0FBQ1IsY0FBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSTtBQUMxQixlQUFLLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLO1NBQzdCLENBQUM7T0FBQSxDQUNILENBQUM7S0FDTDs7O1dBRVcsd0JBQUc7OztBQUNiLFVBQU0sSUFBSSxHQUFHLDJCQUNYO0FBQ0UsY0FBTSxFQUFFLDJCQUEyQjtBQUNuQyxtQkFBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSTtBQUM5QixtQkFBVyxFQUFFLElBQUk7T0FDbEIsRUFDRCxVQUFDLEtBQUs7ZUFBYSxPQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO09BQUEsQ0FDL0MsQ0FBQzs7QUFFRixVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRU0sbUJBQUc7QUFDUixzQkFBSSxrREFBa0QsQ0FBQyxDQUFDO0FBQ3hELFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkIsaUNBN0hpQixRQUFRLHlDQTZIVDtLQUNqQjs7O1NBOUhrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvd3Mta2VybmVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IEtlcm5lbCBmcm9tIFwiLi9rZXJuZWxcIjtcbmltcG9ydCBJbnB1dFZpZXcgZnJvbSBcIi4vaW5wdXQtdmlld1wiO1xuaW1wb3J0IHsgbG9nIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgeyBTZXNzaW9uIH0gZnJvbSBcIkBqdXB5dGVybGFiL3NlcnZpY2VzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdTS2VybmVsIGV4dGVuZHMgS2VybmVsIHtcbiAgc2Vzc2lvbjogU2Vzc2lvbjtcbiAgZ2F0ZXdheU5hbWU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBnYXRld2F5TmFtZTogc3RyaW5nLFxuICAgIGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyLFxuICAgIHNlc3Npb246IFNlc3Npb25cbiAgKSB7XG4gICAgc3VwZXIoa2VybmVsU3BlYywgZ3JhbW1hcik7XG4gICAgdGhpcy5zZXNzaW9uID0gc2Vzc2lvbjtcbiAgICB0aGlzLmdhdGV3YXlOYW1lID0gZ2F0ZXdheU5hbWU7XG5cbiAgICB0aGlzLnNlc3Npb24uc3RhdHVzQ2hhbmdlZC5jb25uZWN0KCgpID0+XG4gICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKHRoaXMuc2Vzc2lvbi5zdGF0dXMpXG4gICAgKTtcbiAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKHRoaXMuc2Vzc2lvbi5zdGF0dXMpOyAvLyBTZXQgaW5pdGlhbCBzdGF0dXMgY29ycmVjdGx5XG4gIH1cblxuICBpbnRlcnJ1cHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbi5rZXJuZWwuaW50ZXJydXB0KCk7XG4gIH1cblxuICBzaHV0ZG93bigpIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uLmtlcm5lbC5zaHV0ZG93bigpO1xuICB9XG5cbiAgcmVzdGFydChvblJlc3RhcnRlZDogP0Z1bmN0aW9uKSB7XG4gICAgY29uc3QgZnV0dXJlID0gdGhpcy5zZXNzaW9uLmtlcm5lbC5yZXN0YXJ0KCk7XG4gICAgZnV0dXJlLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKG9uUmVzdGFydGVkKSBvblJlc3RhcnRlZCh0aGlzLnNlc3Npb24ua2VybmVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9leGVjdXRlKGNvZGU6IHN0cmluZywgY2FsbFdhdGNoZXM6IGJvb2xlYW4sIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICBjb25zdCBmdXR1cmUgPSB0aGlzLnNlc3Npb24ua2VybmVsLnJlcXVlc3RFeGVjdXRlKHsgY29kZSB9KTtcblxuICAgIGZ1dHVyZS5vbklPUHViID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgY2FsbFdhdGNoZXMgJiZcbiAgICAgICAgbWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgPT09IFwic3RhdHVzXCIgJiZcbiAgICAgICAgbWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9zdGF0ZSA9PT0gXCJpZGxlXCJcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9jYWxsV2F0Y2hDYWxsYmFja3MoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9uUmVzdWx0cykge1xuICAgICAgICBsb2coXCJXU0tlcm5lbDogX2V4ZWN1dGU6XCIsIG1lc3NhZ2UpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9wYXJzZUlPTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgaWYgKHJlc3VsdCkgb25SZXN1bHRzKHJlc3VsdCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1dHVyZS5vblJlcGx5ID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgZGF0YTogbWVzc2FnZS5jb250ZW50LnN0YXR1cyxcbiAgICAgICAgc3RyZWFtOiBcInN0YXR1c1wiXG4gICAgICB9O1xuICAgICAgaWYgKG9uUmVzdWx0cykgb25SZXN1bHRzKHJlc3VsdCk7XG4gICAgfTtcblxuICAgIGZ1dHVyZS5vblN0ZGluID0gKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcbiAgICAgIGlmIChtZXNzYWdlLmhlYWRlci5tc2dfdHlwZSAhPT0gXCJpbnB1dF9yZXF1ZXN0XCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IHByb21wdCB9ID0gbWVzc2FnZS5jb250ZW50O1xuXG4gICAgICBjb25zdCBpbnB1dFZpZXcgPSBuZXcgSW5wdXRWaWV3KHsgcHJvbXB0IH0sIChpbnB1dDogc3RyaW5nKSA9PlxuICAgICAgICB0aGlzLnNlc3Npb24ua2VybmVsLnNlbmRJbnB1dFJlcGx5KHsgdmFsdWU6IGlucHV0IH0pXG4gICAgICApO1xuXG4gICAgICBpbnB1dFZpZXcuYXR0YWNoKCk7XG4gICAgfTtcbiAgfVxuXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5fZXhlY3V0ZShjb2RlLCB0cnVlLCBvblJlc3VsdHMpO1xuICB9XG5cbiAgZXhlY3V0ZVdhdGNoKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRoaXMuX2V4ZWN1dGUoY29kZSwgZmFsc2UsIG9uUmVzdWx0cyk7XG4gIH1cblxuICBjb21wbGV0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICB0aGlzLnNlc3Npb24ua2VybmVsXG4gICAgICAucmVxdWVzdENvbXBsZXRlKHtcbiAgICAgICAgY29kZSxcbiAgICAgICAgY3Vyc29yX3BvczogY29kZS5sZW5ndGhcbiAgICAgIH0pXG4gICAgICAudGhlbigobWVzc2FnZTogTWVzc2FnZSkgPT4gb25SZXN1bHRzKG1lc3NhZ2UuY29udGVudCkpO1xuICB9XG5cbiAgaW5zcGVjdChjb2RlOiBzdHJpbmcsIGN1cnNvclBvczogbnVtYmVyLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5zZXNzaW9uLmtlcm5lbFxuICAgICAgLnJlcXVlc3RJbnNwZWN0KHtcbiAgICAgICAgY29kZSxcbiAgICAgICAgY3Vyc29yX3BvczogY3Vyc29yUG9zLFxuICAgICAgICBkZXRhaWxfbGV2ZWw6IDBcbiAgICAgIH0pXG4gICAgICAudGhlbigobWVzc2FnZTogTWVzc2FnZSkgPT5cbiAgICAgICAgb25SZXN1bHRzKHtcbiAgICAgICAgICBkYXRhOiBtZXNzYWdlLmNvbnRlbnQuZGF0YSxcbiAgICAgICAgICBmb3VuZDogbWVzc2FnZS5jb250ZW50LmZvdW5kXG4gICAgICAgIH0pXG4gICAgICApO1xuICB9XG5cbiAgcHJvbXB0UmVuYW1lKCkge1xuICAgIGNvbnN0IHZpZXcgPSBuZXcgSW5wdXRWaWV3KFxuICAgICAge1xuICAgICAgICBwcm9tcHQ6IFwiTmFtZSB5b3VyIGN1cnJlbnQgc2Vzc2lvblwiLFxuICAgICAgICBkZWZhdWx0VGV4dDogdGhpcy5zZXNzaW9uLnBhdGgsXG4gICAgICAgIGFsbG93Q2FuY2VsOiB0cnVlXG4gICAgICB9LFxuICAgICAgKGlucHV0OiBzdHJpbmcpID0+IHRoaXMuc2Vzc2lvbi5zZXRQYXRoKGlucHV0KVxuICAgICk7XG5cbiAgICB2aWV3LmF0dGFjaCgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJXU0tlcm5lbDogZGVzdHJveWluZyBqdXB5dGVyLWpzLXNlcnZpY2VzIFNlc3Npb25cIik7XG4gICAgdGhpcy5zZXNzaW9uLmRpc3Bvc2UoKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==