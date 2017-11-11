Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _jmp = require("jmp");

var _uuidV4 = require("uuid/v4");

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _spawnteract = require("spawnteract");

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _kernel = require("./kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _inputView = require("./input-view");

var _inputView2 = _interopRequireDefault(_inputView);

var _utils = require("./utils");

var ZMQKernel = (function (_Kernel) {
  _inherits(ZMQKernel, _Kernel);

  function ZMQKernel(kernelSpec, grammar, options, onStarted) {
    var _this = this;

    _classCallCheck(this, ZMQKernel);

    _get(Object.getPrototypeOf(ZMQKernel.prototype), "constructor", this).call(this, kernelSpec, grammar);
    this.executionCallbacks = {};
    this.options = options || {};

    (0, _spawnteract.launchSpec)(kernelSpec, options).then(function (_ref) {
      var config = _ref.config;
      var connectionFile = _ref.connectionFile;
      var spawn = _ref.spawn;

      _this.connection = config;
      _this.connectionFile = connectionFile;
      _this.kernelProcess = spawn;

      _this.monitorNotifications(spawn);

      _this.connect(function () {
        _this._executeStartupCode();

        if (onStarted) onStarted(_this);
      });
    });
  }

  _createClass(ZMQKernel, [{
    key: "connect",
    value: function connect(done) {
      var scheme = this.connection.signature_scheme.slice("hmac-".length);
      var key = this.connection.key;

      this.shellSocket = new _jmp.Socket("dealer", scheme, key);
      this.controlSocket = new _jmp.Socket("dealer", scheme, key);
      this.stdinSocket = new _jmp.Socket("dealer", scheme, key);
      this.ioSocket = new _jmp.Socket("sub", scheme, key);

      var id = (0, _uuidV42["default"])();
      this.shellSocket.identity = "dealer" + id;
      this.controlSocket.identity = "control" + id;
      this.stdinSocket.identity = "dealer" + id;
      this.ioSocket.identity = "sub" + id;

      var address = this.connection.transport + "://" + this.connection.ip + ":";
      this.shellSocket.connect(address + this.connection.shell_port);
      this.controlSocket.connect(address + this.connection.control_port);
      this.ioSocket.connect(address + this.connection.iopub_port);
      this.ioSocket.subscribe("");
      this.stdinSocket.connect(address + this.connection.stdin_port);

      this.shellSocket.on("message", this.onShellMessage.bind(this));
      this.ioSocket.on("message", this.onIOMessage.bind(this));
      this.stdinSocket.on("message", this.onStdinMessage.bind(this));

      this.monitor(done);
    }
  }, {
    key: "monitorNotifications",
    value: function monitorNotifications(childProcess) {
      var _this2 = this;

      childProcess.stdout.on("data", function (data) {
        data = data.toString();

        if (atom.config.get("Hydrogen.kernelNotifications")) {
          atom.notifications.addInfo(_this2.kernelSpec.display_name, {
            description: data,
            dismissable: true
          });
        } else {
          (0, _utils.log)("ZMQKernel: stdout:", data);
        }
      });

      childProcess.stderr.on("data", function (data) {
        atom.notifications.addError(_this2.kernelSpec.display_name, {
          description: data.toString(),
          dismissable: true
        });
      });
    }
  }, {
    key: "monitor",
    value: function monitor(done) {
      var _this3 = this;

      try {
        (function () {
          var socketNames = ["shellSocket", "controlSocket", "ioSocket"];

          var waitGroup = socketNames.length;

          var onConnect = function onConnect(_ref2) {
            var socketName = _ref2.socketName;
            var socket = _ref2.socket;

            (0, _utils.log)("ZMQKernel: " + socketName + " connected");
            socket.unmonitor();

            waitGroup--;
            if (waitGroup === 0) {
              (0, _utils.log)("ZMQKernel: all main sockets connected");
              _this3.setExecutionState("idle");
              if (done) done();
            }
          };

          var monitor = function monitor(socketName, socket) {
            (0, _utils.log)("ZMQKernel: monitor " + socketName);
            socket.on("connect", onConnect.bind(_this3, { socketName: socketName, socket: socket }));
            socket.monitor();
          };

          monitor("shellSocket", _this3.shellSocket);
          monitor("controlSocket", _this3.controlSocket);
          monitor("ioSocket", _this3.ioSocket);
        })();
      } catch (err) {
        console.error("ZMQKernel:", err);
      }
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      if (process.platform === "win32") {
        atom.notifications.addWarning("Cannot interrupt this kernel", {
          detail: "Kernel interruption is currently not supported in Windows."
        });
      } else {
        (0, _utils.log)("ZMQKernel: sending SIGINT");
        this.kernelProcess.kill("SIGINT");
      }
    }
  }, {
    key: "_kill",
    value: function _kill() {
      (0, _utils.log)("ZMQKernel: sending SIGKILL");
      this.kernelProcess.kill("SIGKILL");
    }
  }, {
    key: "_executeStartupCode",
    value: function _executeStartupCode() {
      var displayName = this.kernelSpec.display_name;
      var startupCode = _config2["default"].getJson("startupCode")[displayName];
      if (startupCode) {
        (0, _utils.log)("KernelManager: Executing startup code:", startupCode);
        startupCode = startupCode + " \n";
        this.execute(startupCode);
      }
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      var restart = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var requestId = "shutdown_" + (0, _uuidV42["default"])();
      var message = this._createMessage("shutdown_request", requestId);

      message.content = { restart: restart };

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      var _this4 = this;

      if (this.executionState === "restarting") {
        return;
      }
      this.setExecutionState("restarting");
      this.shutdown(true);
      this._kill();

      var _launchSpecFromConnectionInfo = (0, _spawnteract.launchSpecFromConnectionInfo)(this.kernelSpec, this.connection, this.connectionFile, this.options);

      var spawn = _launchSpecFromConnectionInfo.spawn;

      this.kernelProcess = spawn;
      this.monitor(function () {
        if (onRestarted) onRestarted(_this4);
      });
    }

    // onResults is a callback that may be called multiple times
    // as results come in from the kernel
  }, {
    key: "_execute",
    value: function _execute(code, requestId, onResults) {
      var message = this._createMessage("execute_request", requestId);

      message.content = {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: true
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      (0, _utils.log)("Kernel.execute:", code);

      var requestId = "execute_" + (0, _uuidV42["default"])();
      this._execute(code, requestId, onResults);
    }
  }, {
    key: "executeWatch",
    value: function executeWatch(code, onResults) {
      (0, _utils.log)("Kernel.executeWatch:", code);

      var requestId = "watch_" + (0, _uuidV42["default"])();
      this._execute(code, requestId, onResults);
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      (0, _utils.log)("Kernel.complete:", code);

      var requestId = "complete_" + (0, _uuidV42["default"])();

      var message = this._createMessage("complete_request", requestId);

      message.content = {
        code: code,
        text: code,
        line: code,
        cursor_pos: code.length
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      (0, _utils.log)("Kernel.inspect:", code, cursorPos);

      var requestId = "inspect_" + (0, _uuidV42["default"])();

      var message = this._createMessage("inspect_request", requestId);

      message.content = {
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "inputReply",
    value: function inputReply(input) {
      var requestId = "input_reply_" + (0, _uuidV42["default"])();

      var message = this._createMessage("input_reply", requestId);

      message.content = { value: input };

      this.stdinSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "onShellMessage",
    value: function onShellMessage(message) {
      (0, _utils.log)("shell message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (!callback) {
        return;
      }

      var status = message.content.status;

      if (status === "error") {
        callback({
          data: "error",
          stream: "status"
        });
      } else if (status === "ok") {
        var msg_type = message.header.msg_type;

        if (msg_type === "execution_reply") {
          callback({
            data: "ok",
            stream: "status"
          });
        } else if (msg_type === "complete_reply") {
          callback(message.content);
        } else if (msg_type === "inspect_reply") {
          callback({
            data: message.content.data,
            found: message.content.found
          });
        } else {
          callback({
            data: "ok",
            stream: "status"
          });
        }
      }
    }
  }, {
    key: "onStdinMessage",
    value: function onStdinMessage(message) {
      var _this5 = this;

      (0, _utils.log)("stdin message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_type = message.header.msg_type;

      if (msg_type === "input_request") {
        var _prompt = message.content.prompt;

        var inputView = new _inputView2["default"]({ prompt: _prompt }, function (input) {
          return _this5.inputReply(input);
        });

        inputView.attach();
      }
    }
  }, {
    key: "onIOMessage",
    value: function onIOMessage(message) {
      (0, _utils.log)("IO message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_type = message.header.msg_type;

      if (msg_type === "status") {
        var _status = message.content.execution_state;
        this.setExecutionState(_status);

        var _msg_id = message.parent_header ? message.parent_header.msg_id : null;
        if (_msg_id && _status === "idle" && _msg_id.startsWith("execute")) {
          this._callWatchCallbacks();
        }
        return;
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (!callback) {
        return;
      }

      var result = this._parseIOMessage(message);

      if (result) {
        callback(result);
      }
    }
  }, {
    key: "_isValidMessage",
    value: function _isValidMessage(message) {
      if (!message) {
        (0, _utils.log)("Invalid message: null");
        return false;
      }

      if (!message.content) {
        (0, _utils.log)("Invalid message: Missing content");
        return false;
      }

      if (message.content.execution_state === "starting") {
        // Kernels send a starting status message with an empty parent_header
        (0, _utils.log)("Dropped starting status IO message");
        return false;
      }

      if (!message.parent_header) {
        (0, _utils.log)("Invalid message: Missing parent_header");
        return false;
      }

      if (!message.parent_header.msg_id) {
        (0, _utils.log)("Invalid message: Missing parent_header.msg_id");
        return false;
      }

      if (!message.parent_header.msg_type) {
        (0, _utils.log)("Invalid message: Missing parent_header.msg_type");
        return false;
      }

      if (!message.header) {
        (0, _utils.log)("Invalid message: Missing header");
        return false;
      }

      if (!message.header.msg_id) {
        (0, _utils.log)("Invalid message: Missing header.msg_id");
        return false;
      }

      if (!message.header.msg_type) {
        (0, _utils.log)("Invalid message: Missing header.msg_type");
        return false;
      }

      return true;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("ZMQKernel: destroy:", this);

      this.shutdown();

      this._kill();
      _fs2["default"].unlinkSync(this.connectionFile);

      this.shellSocket.close();
      this.controlSocket.close();
      this.ioSocket.close();
      this.stdinSocket.close();

      _get(Object.getPrototypeOf(ZMQKernel.prototype), "destroy", this).call(this);
    }
  }, {
    key: "_getUsername",
    value: function _getUsername() {
      return process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
    }
  }, {
    key: "_createMessage",
    value: function _createMessage(msgType) {
      var msgId = arguments.length <= 1 || arguments[1] === undefined ? (0, _uuidV42["default"])() : arguments[1];

      var message = {
        header: {
          username: this._getUsername(),
          session: "00000000-0000-0000-0000-000000000000",
          msg_type: msgType,
          msg_id: msgId,
          date: new Date(),
          version: "5.0"
        },
        metadata: {},
        parent_header: {},
        content: {}
      };

      return message;
    }
  }]);

  return ZMQKernel;
})(_kernel2["default"]);

exports["default"] = ZMQKernel;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi96bXEta2VybmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7bUJBQ2EsS0FBSzs7c0JBQ3RCLFNBQVM7Ozs7MkJBQ2lDLGFBQWE7O3NCQUVuRCxVQUFVOzs7O3NCQUNWLFVBQVU7Ozs7eUJBQ1AsY0FBYzs7OztxQkFDaEIsU0FBUzs7SUFlUixTQUFTO1lBQVQsU0FBUzs7QUFZakIsV0FaUSxTQUFTLENBYTFCLFVBQXNCLEVBQ3RCLE9BQXFCLEVBQ3JCLE9BQWUsRUFDZixTQUFvQixFQUNwQjs7OzBCQWpCaUIsU0FBUzs7QUFrQjFCLCtCQWxCaUIsU0FBUyw2Q0FrQnBCLFVBQVUsRUFBRSxPQUFPLEVBQUU7U0FqQjdCLGtCQUFrQixHQUFXLEVBQUU7QUFrQjdCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQzs7QUFFN0IsaUNBQ0UsVUFBVSxFQUNWLE9BQU8sQ0FDUixDQUFDLElBQUksQ0FBQyxVQUFDLElBQWlDLEVBQUs7VUFBcEMsTUFBTSxHQUFSLElBQWlDLENBQS9CLE1BQU07VUFBRSxjQUFjLEdBQXhCLElBQWlDLENBQXZCLGNBQWM7VUFBRSxLQUFLLEdBQS9CLElBQWlDLENBQVAsS0FBSzs7QUFDckMsWUFBSyxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQ3pCLFlBQUssY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUNyQyxZQUFLLGFBQWEsR0FBRyxLQUFLLENBQUM7O0FBRTNCLFlBQUssb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWpDLFlBQUssT0FBTyxDQUFDLFlBQU07QUFDakIsY0FBSyxtQkFBbUIsRUFBRSxDQUFDOztBQUUzQixZQUFJLFNBQVMsRUFBRSxTQUFTLE9BQU0sQ0FBQztPQUNoQyxDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7R0FDSjs7ZUFyQ2tCLFNBQVM7O1dBdUNyQixpQkFB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VUFBTSxPQUFPLEdBQUc7QUFDZCxjQUFNLEVBQUU7QUFDTixrQkFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDN0IsaUJBQU8sRUFBRSxzQ0FBc0M7QUFDL0Msa0JBQVEsRUFBRSxPQUFPO0FBQ2pCLGdCQUFNLEVBQUUsS0FBSztBQUNiLGNBQUksRUFBRSxJQUFJLElBQUksRUFBRTtBQUNoQixpQkFBTyxFQUFFLEtBQUs7U0FDZjtBQUNELGdCQUFRLEVBQUUsRUFBRTtBQUNaLHFCQUFhLEVBQUUsRUFBRTtBQUNqQixlQUFPLEVBQUUsRUFBRTtPQUNaLENBQUM7O0FBRUYsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQXBja0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3ptcS1rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBNZXNzYWdlLCBTb2NrZXQgfSBmcm9tIFwiam1wXCI7XG5pbXBvcnQgdjQgZnJvbSBcInV1aWQvdjRcIjtcbmltcG9ydCB7IGxhdW5jaFNwZWMsIGxhdW5jaFNwZWNGcm9tQ29ubmVjdGlvbkluZm8gfSBmcm9tIFwic3Bhd250ZXJhY3RcIjtcblxuaW1wb3J0IENvbmZpZyBmcm9tIFwiLi9jb25maWdcIjtcbmltcG9ydCBLZXJuZWwgZnJvbSBcIi4va2VybmVsXCI7XG5pbXBvcnQgSW5wdXRWaWV3IGZyb20gXCIuL2lucHV0LXZpZXdcIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCB0eXBlIENvbm5lY3Rpb24gPSB7XG4gIGNvbnRyb2xfcG9ydDogbnVtYmVyLFxuICBoYl9wb3J0OiBudW1iZXIsXG4gIGlvcHViX3BvcnQ6IG51bWJlcixcbiAgaXA6IHN0cmluZyxcbiAga2V5OiBzdHJpbmcsXG4gIHNoZWxsX3BvcnQ6IG51bWJlcixcbiAgc2lnbmF0dXJlX3NjaGVtZTogc3RyaW5nLFxuICBzdGRpbl9wb3J0OiBudW1iZXIsXG4gIHRyYW5zcG9ydDogc3RyaW5nLFxuICB2ZXJzaW9uOiBudW1iZXJcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFpNUUtlcm5lbCBleHRlbmRzIEtlcm5lbCB7XG4gIGV4ZWN1dGlvbkNhbGxiYWNrczogT2JqZWN0ID0ge307XG4gIGNvbm5lY3Rpb246IENvbm5lY3Rpb247XG4gIGNvbm5lY3Rpb25GaWxlOiBzdHJpbmc7XG4gIGtlcm5lbFByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBvcHRpb25zOiBPYmplY3Q7XG5cbiAgc2hlbGxTb2NrZXQ6IFNvY2tldDtcbiAgY29udHJvbFNvY2tldDogU29ja2V0O1xuICBzdGRpblNvY2tldDogU29ja2V0O1xuICBpb1NvY2tldDogU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyLFxuICAgIG9wdGlvbnM6IE9iamVjdCxcbiAgICBvblN0YXJ0ZWQ6ID9GdW5jdGlvblxuICApIHtcbiAgICBzdXBlcihrZXJuZWxTcGVjLCBncmFtbWFyKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgbGF1bmNoU3BlYyhcbiAgICAgIGtlcm5lbFNwZWMsXG4gICAgICBvcHRpb25zXG4gICAgKS50aGVuKCh7IGNvbmZpZywgY29ubmVjdGlvbkZpbGUsIHNwYXduIH0pID0+IHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbmZpZztcbiAgICAgIHRoaXMuY29ubmVjdGlvbkZpbGUgPSBjb25uZWN0aW9uRmlsZTtcbiAgICAgIHRoaXMua2VybmVsUHJvY2VzcyA9IHNwYXduO1xuXG4gICAgICB0aGlzLm1vbml0b3JOb3RpZmljYXRpb25zKHNwYXduKTtcblxuICAgICAgdGhpcy5jb25uZWN0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fZXhlY3V0ZVN0YXJ0dXBDb2RlKCk7XG5cbiAgICAgICAgaWYgKG9uU3RhcnRlZCkgb25TdGFydGVkKHRoaXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KGRvbmU6ID9GdW5jdGlvbikge1xuICAgIGNvbnN0IHNjaGVtZSA9IHRoaXMuY29ubmVjdGlvbi5zaWduYXR1cmVfc2NoZW1lLnNsaWNlKFwiaG1hYy1cIi5sZW5ndGgpO1xuICAgIGNvbnN0IHsga2V5IH0gPSB0aGlzLmNvbm5lY3Rpb247XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0ID0gbmV3IFNvY2tldChcImRlYWxlclwiLCBzY2hlbWUsIGtleSk7XG4gICAgdGhpcy5jb250cm9sU29ja2V0ID0gbmV3IFNvY2tldChcImRlYWxlclwiLCBzY2hlbWUsIGtleSk7XG4gICAgdGhpcy5zdGRpblNvY2tldCA9IG5ldyBTb2NrZXQoXCJkZWFsZXJcIiwgc2NoZW1lLCBrZXkpO1xuICAgIHRoaXMuaW9Tb2NrZXQgPSBuZXcgU29ja2V0KFwic3ViXCIsIHNjaGVtZSwga2V5KTtcblxuICAgIGNvbnN0IGlkID0gdjQoKTtcbiAgICB0aGlzLnNoZWxsU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmNvbnRyb2xTb2NrZXQuaWRlbnRpdHkgPSBgY29udHJvbCR7aWR9YDtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmlvU29ja2V0LmlkZW50aXR5ID0gYHN1YiR7aWR9YDtcblxuICAgIGNvbnN0IGFkZHJlc3MgPSBgJHt0aGlzLmNvbm5lY3Rpb24udHJhbnNwb3J0fTovLyR7dGhpcy5jb25uZWN0aW9uLmlwfTpgO1xuICAgIHRoaXMuc2hlbGxTb2NrZXQuY29ubmVjdChhZGRyZXNzICsgdGhpcy5jb25uZWN0aW9uLnNoZWxsX3BvcnQpO1xuICAgIHRoaXMuY29udHJvbFNvY2tldC5jb25uZWN0KGFkZHJlc3MgKyB0aGlzLmNvbm5lY3Rpb24uY29udHJvbF9wb3J0KTtcbiAgICB0aGlzLmlvU29ja2V0LmNvbm5lY3QoYWRkcmVzcyArIHRoaXMuY29ubmVjdGlvbi5pb3B1Yl9wb3J0KTtcbiAgICB0aGlzLmlvU29ja2V0LnN1YnNjcmliZShcIlwiKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmNvbm5lY3QoYWRkcmVzcyArIHRoaXMuY29ubmVjdGlvbi5zdGRpbl9wb3J0KTtcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQub24oXCJtZXNzYWdlXCIsIHRoaXMub25TaGVsbE1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5pb1NvY2tldC5vbihcIm1lc3NhZ2VcIiwgdGhpcy5vbklPTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0Lm9uKFwibWVzc2FnZVwiLCB0aGlzLm9uU3RkaW5NZXNzYWdlLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5tb25pdG9yKGRvbmUpO1xuICB9XG5cbiAgbW9uaXRvck5vdGlmaWNhdGlvbnMoY2hpbGRQcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIGNoaWxkUHJvY2Vzcy5zdGRvdXQub24oXCJkYXRhXCIsIChkYXRhOiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoXCJIeWRyb2dlbi5rZXJuZWxOb3RpZmljYXRpb25zXCIpKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKHRoaXMua2VybmVsU3BlYy5kaXNwbGF5X25hbWUsIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGF0YSxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZyhcIlpNUUtlcm5lbDogc3Rkb3V0OlwiLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhOiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih0aGlzLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLnRvU3RyaW5nKCksXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIG1vbml0b3IoZG9uZTogP0Z1bmN0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBzb2NrZXROYW1lcyA9IFtcInNoZWxsU29ja2V0XCIsIFwiY29udHJvbFNvY2tldFwiLCBcImlvU29ja2V0XCJdO1xuXG4gICAgICBsZXQgd2FpdEdyb3VwID0gc29ja2V0TmFtZXMubGVuZ3RoO1xuXG4gICAgICBjb25zdCBvbkNvbm5lY3QgPSAoeyBzb2NrZXROYW1lLCBzb2NrZXQgfSkgPT4ge1xuICAgICAgICBsb2coXCJaTVFLZXJuZWw6IFwiICsgc29ja2V0TmFtZSArIFwiIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgc29ja2V0LnVubW9uaXRvcigpO1xuXG4gICAgICAgIHdhaXRHcm91cC0tO1xuICAgICAgICBpZiAod2FpdEdyb3VwID09PSAwKSB7XG4gICAgICAgICAgbG9nKFwiWk1RS2VybmVsOiBhbGwgbWFpbiBzb2NrZXRzIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKFwiaWRsZVwiKTtcbiAgICAgICAgICBpZiAoZG9uZSkgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBtb25pdG9yID0gKHNvY2tldE5hbWUsIHNvY2tldCkgPT4ge1xuICAgICAgICBsb2coXCJaTVFLZXJuZWw6IG1vbml0b3IgXCIgKyBzb2NrZXROYW1lKTtcbiAgICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCBvbkNvbm5lY3QuYmluZCh0aGlzLCB7IHNvY2tldE5hbWUsIHNvY2tldCB9KSk7XG4gICAgICAgIHNvY2tldC5tb25pdG9yKCk7XG4gICAgICB9O1xuXG4gICAgICBtb25pdG9yKFwic2hlbGxTb2NrZXRcIiwgdGhpcy5zaGVsbFNvY2tldCk7XG4gICAgICBtb25pdG9yKFwiY29udHJvbFNvY2tldFwiLCB0aGlzLmNvbnRyb2xTb2NrZXQpO1xuICAgICAgbW9uaXRvcihcImlvU29ja2V0XCIsIHRoaXMuaW9Tb2NrZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihcIlpNUUtlcm5lbDpcIiwgZXJyKTtcbiAgICB9XG4gIH1cblxuICBpbnRlcnJ1cHQoKSB7XG4gICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJDYW5ub3QgaW50ZXJydXB0IHRoaXMga2VybmVsXCIsIHtcbiAgICAgICAgZGV0YWlsOiBcIktlcm5lbCBpbnRlcnJ1cHRpb24gaXMgY3VycmVudGx5IG5vdCBzdXBwb3J0ZWQgaW4gV2luZG93cy5cIlxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZyhcIlpNUUtlcm5lbDogc2VuZGluZyBTSUdJTlRcIik7XG4gICAgICB0aGlzLmtlcm5lbFByb2Nlc3Mua2lsbChcIlNJR0lOVFwiKTtcbiAgICB9XG4gIH1cblxuICBfa2lsbCgpIHtcbiAgICBsb2coXCJaTVFLZXJuZWw6IHNlbmRpbmcgU0lHS0lMTFwiKTtcbiAgICB0aGlzLmtlcm5lbFByb2Nlc3Mua2lsbChcIlNJR0tJTExcIik7XG4gIH1cblxuICBfZXhlY3V0ZVN0YXJ0dXBDb2RlKCkge1xuICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gdGhpcy5rZXJuZWxTcGVjLmRpc3BsYXlfbmFtZTtcbiAgICBsZXQgc3RhcnR1cENvZGUgPSBDb25maWcuZ2V0SnNvbihcInN0YXJ0dXBDb2RlXCIpW2Rpc3BsYXlOYW1lXTtcbiAgICBpZiAoc3RhcnR1cENvZGUpIHtcbiAgICAgIGxvZyhcIktlcm5lbE1hbmFnZXI6IEV4ZWN1dGluZyBzdGFydHVwIGNvZGU6XCIsIHN0YXJ0dXBDb2RlKTtcbiAgICAgIHN0YXJ0dXBDb2RlID0gYCR7c3RhcnR1cENvZGV9IFxcbmA7XG4gICAgICB0aGlzLmV4ZWN1dGUoc3RhcnR1cENvZGUpO1xuICAgIH1cbiAgfVxuXG4gIHNodXRkb3duKHJlc3RhcnQ6ID9ib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgc2h1dGRvd25fJHt2NCgpfWA7XG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2UoXCJzaHV0ZG93bl9yZXF1ZXN0XCIsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7IHJlc3RhcnQgfTtcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICByZXN0YXJ0KG9uUmVzdGFydGVkOiA/RnVuY3Rpb24pIHtcbiAgICBpZiAodGhpcy5leGVjdXRpb25TdGF0ZSA9PT0gXCJyZXN0YXJ0aW5nXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRFeGVjdXRpb25TdGF0ZShcInJlc3RhcnRpbmdcIik7XG4gICAgdGhpcy5zaHV0ZG93bih0cnVlKTtcbiAgICB0aGlzLl9raWxsKCk7XG4gICAgY29uc3QgeyBzcGF3biB9ID0gbGF1bmNoU3BlY0Zyb21Db25uZWN0aW9uSW5mbyhcbiAgICAgIHRoaXMua2VybmVsU3BlYyxcbiAgICAgIHRoaXMuY29ubmVjdGlvbixcbiAgICAgIHRoaXMuY29ubmVjdGlvbkZpbGUsXG4gICAgICB0aGlzLm9wdGlvbnNcbiAgICApO1xuICAgIHRoaXMua2VybmVsUHJvY2VzcyA9IHNwYXduO1xuICAgIHRoaXMubW9uaXRvcigoKSA9PiB7XG4gICAgICBpZiAob25SZXN0YXJ0ZWQpIG9uUmVzdGFydGVkKHRoaXMpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gb25SZXN1bHRzIGlzIGEgY2FsbGJhY2sgdGhhdCBtYXkgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzXG4gIC8vIGFzIHJlc3VsdHMgY29tZSBpbiBmcm9tIHRoZSBrZXJuZWxcbiAgX2V4ZWN1dGUoY29kZTogc3RyaW5nLCByZXF1ZXN0SWQ6IHN0cmluZywgb25SZXN1bHRzOiA/RnVuY3Rpb24pIHtcbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShcImV4ZWN1dGVfcmVxdWVzdFwiLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0ge1xuICAgICAgY29kZSxcbiAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICBzdG9yZV9oaXN0b3J5OiB0cnVlLFxuICAgICAgdXNlcl9leHByZXNzaW9uczoge30sXG4gICAgICBhbGxvd19zdGRpbjogdHJ1ZVxuICAgIH07XG5cbiAgICB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1tyZXF1ZXN0SWRdID0gb25SZXN1bHRzO1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldC5zZW5kKG5ldyBNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGV4ZWN1dGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6ID9GdW5jdGlvbikge1xuICAgIGxvZyhcIktlcm5lbC5leGVjdXRlOlwiLCBjb2RlKTtcblxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBleGVjdXRlXyR7djQoKX1gO1xuICAgIHRoaXMuX2V4ZWN1dGUoY29kZSwgcmVxdWVzdElkLCBvblJlc3VsdHMpO1xuICB9XG5cbiAgZXhlY3V0ZVdhdGNoKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIGxvZyhcIktlcm5lbC5leGVjdXRlV2F0Y2g6XCIsIGNvZGUpO1xuXG4gICAgY29uc3QgcmVxdWVzdElkID0gYHdhdGNoXyR7djQoKX1gO1xuICAgIHRoaXMuX2V4ZWN1dGUoY29kZSwgcmVxdWVzdElkLCBvblJlc3VsdHMpO1xuICB9XG5cbiAgY29tcGxldGUoY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgbG9nKFwiS2VybmVsLmNvbXBsZXRlOlwiLCBjb2RlKTtcblxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBjb21wbGV0ZV8ke3Y0KCl9YDtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKFwiY29tcGxldGVfcmVxdWVzdFwiLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0ge1xuICAgICAgY29kZSxcbiAgICAgIHRleHQ6IGNvZGUsXG4gICAgICBsaW5lOiBjb2RlLFxuICAgICAgY3Vyc29yX3BvczogY29kZS5sZW5ndGhcbiAgICB9O1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3NbcmVxdWVzdElkXSA9IG9uUmVzdWx0cztcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICBpbnNwZWN0KGNvZGU6IHN0cmluZywgY3Vyc29yUG9zOiBudW1iZXIsIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICBsb2coXCJLZXJuZWwuaW5zcGVjdDpcIiwgY29kZSwgY3Vyc29yUG9zKTtcblxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBpbnNwZWN0XyR7djQoKX1gO1xuXG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZU1lc3NhZ2UoXCJpbnNwZWN0X3JlcXVlc3RcIiwgcmVxdWVzdElkKTtcblxuICAgIG1lc3NhZ2UuY29udGVudCA9IHtcbiAgICAgIGNvZGUsXG4gICAgICBjdXJzb3JfcG9zOiBjdXJzb3JQb3MsXG4gICAgICBkZXRhaWxfbGV2ZWw6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3NbcmVxdWVzdElkXSA9IG9uUmVzdWx0cztcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICBpbnB1dFJlcGx5KGlucHV0OiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgaW5wdXRfcmVwbHlfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShcImlucHV0X3JlcGx5XCIsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7IHZhbHVlOiBpbnB1dCB9O1xuXG4gICAgdGhpcy5zdGRpblNvY2tldC5zZW5kKG5ldyBNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIG9uU2hlbGxNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBsb2coXCJzaGVsbCBtZXNzYWdlOlwiLCBtZXNzYWdlKTtcblxuICAgIGlmICghdGhpcy5faXNWYWxpZE1lc3NhZ2UobWVzc2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1zZ19pZCB9ID0gbWVzc2FnZS5wYXJlbnRfaGVhZGVyO1xuICAgIGxldCBjYWxsYmFjaztcbiAgICBpZiAobXNnX2lkKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2tzW21zZ19pZF07XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgc3RhdHVzIH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgaWYgKHN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XG4gICAgICBjYWxsYmFjayh7XG4gICAgICAgIGRhdGE6IFwiZXJyb3JcIixcbiAgICAgICAgc3RyZWFtOiBcInN0YXR1c1wiXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gXCJva1wiKSB7XG4gICAgICBjb25zdCB7IG1zZ190eXBlIH0gPSBtZXNzYWdlLmhlYWRlcjtcblxuICAgICAgaWYgKG1zZ190eXBlID09PSBcImV4ZWN1dGlvbl9yZXBseVwiKSB7XG4gICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICBkYXRhOiBcIm9rXCIsXG4gICAgICAgICAgc3RyZWFtOiBcInN0YXR1c1wiXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChtc2dfdHlwZSA9PT0gXCJjb21wbGV0ZV9yZXBseVwiKSB7XG4gICAgICAgIGNhbGxiYWNrKG1lc3NhZ2UuY29udGVudCk7XG4gICAgICB9IGVsc2UgaWYgKG1zZ190eXBlID09PSBcImluc3BlY3RfcmVwbHlcIikge1xuICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgZGF0YTogbWVzc2FnZS5jb250ZW50LmRhdGEsXG4gICAgICAgICAgZm91bmQ6IG1lc3NhZ2UuY29udGVudC5mb3VuZFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgICBkYXRhOiBcIm9rXCIsXG4gICAgICAgICAgc3RyZWFtOiBcInN0YXR1c1wiXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uU3RkaW5NZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBsb2coXCJzdGRpbiBtZXNzYWdlOlwiLCBtZXNzYWdlKTtcblxuICAgIGlmICghdGhpcy5faXNWYWxpZE1lc3NhZ2UobWVzc2FnZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1zZ190eXBlIH0gPSBtZXNzYWdlLmhlYWRlcjtcblxuICAgIGlmIChtc2dfdHlwZSA9PT0gXCJpbnB1dF9yZXF1ZXN0XCIpIHtcbiAgICAgIGNvbnN0IHsgcHJvbXB0IH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG5cbiAgICAgIGNvbnN0IGlucHV0VmlldyA9IG5ldyBJbnB1dFZpZXcoeyBwcm9tcHQgfSwgKGlucHV0OiBzdHJpbmcpID0+XG4gICAgICAgIHRoaXMuaW5wdXRSZXBseShpbnB1dClcbiAgICAgICk7XG5cbiAgICAgIGlucHV0Vmlldy5hdHRhY2goKTtcbiAgICB9XG4gIH1cblxuICBvbklPTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgbG9nKFwiSU8gbWVzc2FnZTpcIiwgbWVzc2FnZSk7XG5cbiAgICBpZiAoIXRoaXMuX2lzVmFsaWRNZXNzYWdlKG1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBtc2dfdHlwZSB9ID0gbWVzc2FnZS5oZWFkZXI7XG5cbiAgICBpZiAobXNnX3R5cGUgPT09IFwic3RhdHVzXCIpIHtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fc3RhdGU7XG4gICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKHN0YXR1cyk7XG5cbiAgICAgIGNvbnN0IG1zZ19pZCA9IG1lc3NhZ2UucGFyZW50X2hlYWRlclxuICAgICAgICA/IG1lc3NhZ2UucGFyZW50X2hlYWRlci5tc2dfaWRcbiAgICAgICAgOiBudWxsO1xuICAgICAgaWYgKG1zZ19pZCAmJiBzdGF0dXMgPT09IFwiaWRsZVwiICYmIG1zZ19pZC5zdGFydHNXaXRoKFwiZXhlY3V0ZVwiKSkge1xuICAgICAgICB0aGlzLl9jYWxsV2F0Y2hDYWxsYmFja3MoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7IG1zZ19pZCB9ID0gbWVzc2FnZS5wYXJlbnRfaGVhZGVyO1xuICAgIGxldCBjYWxsYmFjaztcbiAgICBpZiAobXNnX2lkKSB7XG4gICAgICBjYWxsYmFjayA9IHRoaXMuZXhlY3V0aW9uQ2FsbGJhY2tzW21zZ19pZF07XG4gICAgfVxuXG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX3BhcnNlSU9NZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY2FsbGJhY2socmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICBfaXNWYWxpZE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBudWxsXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5jb250ZW50KSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgY29udGVudFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZS5jb250ZW50LmV4ZWN1dGlvbl9zdGF0ZSA9PT0gXCJzdGFydGluZ1wiKSB7XG4gICAgICAvLyBLZXJuZWxzIHNlbmQgYSBzdGFydGluZyBzdGF0dXMgbWVzc2FnZSB3aXRoIGFuIGVtcHR5IHBhcmVudF9oZWFkZXJcbiAgICAgIGxvZyhcIkRyb3BwZWQgc3RhcnRpbmcgc3RhdHVzIElPIG1lc3NhZ2VcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLnBhcmVudF9oZWFkZXIpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBwYXJlbnRfaGVhZGVyXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5wYXJlbnRfaGVhZGVyLm1zZ19pZCkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXIubXNnX2lkXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5wYXJlbnRfaGVhZGVyLm1zZ190eXBlKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgcGFyZW50X2hlYWRlci5tc2dfdHlwZVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5oZWFkZXIubXNnX2lkKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyLm1zZ19pZFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyLm1zZ190eXBlKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgaGVhZGVyLm1zZ190eXBlXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJaTVFLZXJuZWw6IGRlc3Ryb3k6XCIsIHRoaXMpO1xuXG4gICAgdGhpcy5zaHV0ZG93bigpO1xuXG4gICAgdGhpcy5fa2lsbCgpO1xuICAgIGZzLnVubGlua1N5bmModGhpcy5jb25uZWN0aW9uRmlsZSk7XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0LmNsb3NlKCk7XG4gICAgdGhpcy5jb250cm9sU29ja2V0LmNsb3NlKCk7XG4gICAgdGhpcy5pb1NvY2tldC5jbG9zZSgpO1xuICAgIHRoaXMuc3RkaW5Tb2NrZXQuY2xvc2UoKTtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIF9nZXRVc2VybmFtZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcHJvY2Vzcy5lbnYuTE9HTkFNRSB8fFxuICAgICAgcHJvY2Vzcy5lbnYuVVNFUiB8fFxuICAgICAgcHJvY2Vzcy5lbnYuTE5BTUUgfHxcbiAgICAgIHByb2Nlc3MuZW52LlVTRVJOQU1FXG4gICAgKTtcbiAgfVxuXG4gIF9jcmVhdGVNZXNzYWdlKG1zZ1R5cGU6IHN0cmluZywgbXNnSWQ6IHN0cmluZyA9IHY0KCkpIHtcbiAgICBjb25zdCBtZXNzYWdlID0ge1xuICAgICAgaGVhZGVyOiB7XG4gICAgICAgIHVzZXJuYW1lOiB0aGlzLl9nZXRVc2VybmFtZSgpLFxuICAgICAgICBzZXNzaW9uOiBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiLFxuICAgICAgICBtc2dfdHlwZTogbXNnVHlwZSxcbiAgICAgICAgbXNnX2lkOiBtc2dJZCxcbiAgICAgICAgZGF0ZTogbmV3IERhdGUoKSxcbiAgICAgICAgdmVyc2lvbjogXCI1LjBcIlxuICAgICAgfSxcbiAgICAgIG1ldGFkYXRhOiB7fSxcbiAgICAgIHBhcmVudF9oZWFkZXI6IHt9LFxuICAgICAgY29udGVudDoge31cbiAgICB9O1xuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbn1cbiJdfQ==