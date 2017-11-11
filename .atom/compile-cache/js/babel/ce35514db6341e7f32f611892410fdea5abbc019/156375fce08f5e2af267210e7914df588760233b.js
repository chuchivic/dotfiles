Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require("atom");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _mobx = require("mobx");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _wsKernelPicker = require("./ws-kernel-picker");

var _wsKernelPicker2 = _interopRequireDefault(_wsKernelPicker);

var _existingKernelPicker = require("./existing-kernel-picker");

var _existingKernelPicker2 = _interopRequireDefault(_existingKernelPicker);

var _signalListView = require("./signal-list-view");

var _signalListView2 = _interopRequireDefault(_signalListView);

var _codeManager = require("./code-manager");

var codeManager = _interopRequireWildcard(_codeManager);

var _componentsInspector = require("./components/inspector");

var _componentsInspector2 = _interopRequireDefault(_componentsInspector);

var _componentsResultView = require("./components/result-view");

var _componentsResultView2 = _interopRequireDefault(_componentsResultView);

var _componentsStatusBar = require("./components/status-bar");

var _componentsStatusBar2 = _interopRequireDefault(_componentsStatusBar);

var _panesInspector = require("./panes/inspector");

var _panesInspector2 = _interopRequireDefault(_panesInspector);

var _panesWatches = require("./panes/watches");

var _panesWatches2 = _interopRequireDefault(_panesWatches);

var _panesOutputArea = require("./panes/output-area");

var _panesOutputArea2 = _interopRequireDefault(_panesOutputArea);

var _panesKernelMonitor = require("./panes/kernel-monitor");

var _panesKernelMonitor2 = _interopRequireDefault(_panesKernelMonitor);

var _commands = require("./commands");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _storeOutput = require("./store/output");

var _storeOutput2 = _interopRequireDefault(_storeOutput);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _kernelManager = require("./kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _autocompleteProvider = require("./autocomplete-provider");

var _autocompleteProvider2 = _interopRequireDefault(_autocompleteProvider);

var _pluginApiHydrogenProvider = require("./plugin-api/hydrogen-provider");

var _pluginApiHydrogenProvider2 = _interopRequireDefault(_pluginApiHydrogenProvider);

var _utils = require("./utils");

var Hydrogen = {
  config: _config2["default"].schema,

  activate: function activate() {
    var _this = this;

    this.emitter = new _atom.Emitter();

    var skipLanguageMappingsChange = false;
    _store2["default"].subscriptions.add(atom.config.onDidChange("Hydrogen.languageMappings", function (_ref) {
      var newValue = _ref.newValue;
      var oldValue = _ref.oldValue;

      if (skipLanguageMappingsChange) {
        skipLanguageMappingsChange = false;
        return;
      }

      if (_store2["default"].runningKernels.length != 0) {
        skipLanguageMappingsChange = true;

        atom.config.set("Hydrogen.languageMappings", oldValue);

        atom.notifications.addError("Hydrogen", {
          description: "`languageMappings` cannot be updated while kernels are running",
          dismissable: false
        });
      }
    }));

    _store2["default"].subscriptions.add(
    // enable/disable mobx-react-devtools logging
    atom.config.onDidChange("Hydrogen.debug", function (_ref2) {
      var newValue = _ref2.newValue;
      return (0, _utils.renderDevTools)(newValue);
    }));

    _store2["default"].subscriptions.add(atom.commands.add("atom-text-editor:not([mini])", {
      "hydrogen:run": function hydrogenRun() {
        return _this.run();
      },
      "hydrogen:run-all": function hydrogenRunAll() {
        return _this.runAll();
      },
      "hydrogen:run-all-above": function hydrogenRunAllAbove() {
        return _this.runAllAbove();
      },
      "hydrogen:run-and-move-down": function hydrogenRunAndMoveDown() {
        return _this.run(true);
      },
      "hydrogen:run-cell": function hydrogenRunCell() {
        return _this.runCell();
      },
      "hydrogen:run-cell-and-move-down": function hydrogenRunCellAndMoveDown() {
        return _this.runCell(true);
      },
      "hydrogen:toggle-watches": function hydrogenToggleWatches() {
        return atom.workspace.toggle(_utils.WATCHES_URI);
      },
      "hydrogen:toggle-output-area": function hydrogenToggleOutputArea() {
        return atom.workspace.toggle(_utils.OUTPUT_AREA_URI);
      },
      "hydrogen:toggle-kernel-monitor": function hydrogenToggleKernelMonitor() {
        return atom.workspace.toggle(_utils.KERNEL_MONITOR_URI);
      },
      "hydrogen:start-local-kernel": function hydrogenStartLocalKernel() {
        return _this.startZMQKernel();
      },
      "hydrogen:connect-to-remote-kernel": function hydrogenConnectToRemoteKernel() {
        return _this.connectToWSKernel();
      },
      "hydrogen:connect-to-existing-kernel": function hydrogenConnectToExistingKernel() {
        return _this.connectToExistingKernel();
      },
      "hydrogen:add-watch": function hydrogenAddWatch() {
        if (_store2["default"].kernel) {
          _store2["default"].kernel.watchesStore.addWatchFromEditor(_store2["default"].editor);
          (0, _utils.openOrShowDock)(_utils.WATCHES_URI);
        }
      },
      "hydrogen:remove-watch": function hydrogenRemoveWatch() {
        if (_store2["default"].kernel) {
          _store2["default"].kernel.watchesStore.removeWatch();
          (0, _utils.openOrShowDock)(_utils.WATCHES_URI);
        }
      },
      "hydrogen:update-kernels": function hydrogenUpdateKernels() {
        return _kernelManager2["default"].updateKernelSpecs();
      },
      "hydrogen:toggle-inspector": function hydrogenToggleInspector() {
        return (0, _commands.toggleInspector)(_store2["default"]);
      },
      "hydrogen:interrupt-kernel": function hydrogenInterruptKernel() {
        return _this.handleKernelCommand({ command: "interrupt-kernel" });
      },
      "hydrogen:restart-kernel": function hydrogenRestartKernel() {
        return _this.handleKernelCommand({ command: "restart-kernel" });
      },
      "hydrogen:restart-kernel-and-re-evaluate-bubbles": function hydrogenRestartKernelAndReEvaluateBubbles() {
        return _this.restartKernelAndReEvaluateBubbles();
      },
      "hydrogen:shutdown-kernel": function hydrogenShutdownKernel() {
        return _this.handleKernelCommand({ command: "shutdown-kernel" });
      },
      "hydrogen:toggle-bubble": function hydrogenToggleBubble() {
        return _this.toggleBubble();
      }
    }));

    _store2["default"].subscriptions.add(atom.commands.add("atom-workspace", {
      "hydrogen:clear-results": function hydrogenClearResults() {
        return _store2["default"].markers.clear();
      }
    }));

    if (atom.inDevMode()) {
      _store2["default"].subscriptions.add(atom.commands.add("atom-workspace", {
        "hydrogen:hot-reload-package": function hydrogenHotReloadPackage() {
          return (0, _utils.hotReloadPackage)();
        }
      }));
    }

    _store2["default"].subscriptions.add(atom.workspace.observeActiveTextEditor(function (editor) {
      _store2["default"].updateEditor(editor);
    }));

    _store2["default"].subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      var editorSubscriptions = new _atom.CompositeDisposable();
      editorSubscriptions.add(editor.onDidChangeGrammar(function () {
        _store2["default"].setGrammar(editor);
      }));

      if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
        editorSubscriptions.add(editor.onDidChangeCursorPosition(_lodash2["default"].debounce(function () {
          _store2["default"].setGrammar(editor);
        }, 75)));
      }

      editorSubscriptions.add(editor.onDidDestroy(function () {
        editorSubscriptions.dispose();
      }));

      _store2["default"].subscriptions.add(editorSubscriptions);
    }));

    this.hydrogenProvider = null;

    _store2["default"].subscriptions.add(atom.workspace.addOpener(function (uri) {
      switch (uri) {
        case _utils.INSPECTOR_URI:
          return new _panesInspector2["default"](_store2["default"]);
        case _utils.WATCHES_URI:
          return new _panesWatches2["default"](_store2["default"]);
        case _utils.OUTPUT_AREA_URI:
          return new _panesOutputArea2["default"](_store2["default"]);
        case _utils.KERNEL_MONITOR_URI:
          return new _panesKernelMonitor2["default"](_store2["default"]);
      }
    }));

    _store2["default"].subscriptions.add(
    // Destroy any Panes when the package is deactivated.
    new _atom.Disposable(function () {
      atom.workspace.getPaneItems().forEach(function (item) {
        if (item instanceof _panesInspector2["default"] || item instanceof _panesWatches2["default"] || item instanceof _panesOutputArea2["default"] || item instanceof _panesKernelMonitor2["default"]) {
          item.destroy();
        }
      });
    }));

    (0, _utils.renderDevTools)(atom.config.get("Hydrogen.debug") === true);

    (0, _mobx.autorun)(function () {
      _this.emitter.emit("did-change-kernel", _store2["default"].kernel);
    });
  },

  deactivate: function deactivate() {
    _store2["default"].dispose();
  },

  provideHydrogen: function provideHydrogen() {
    if (!this.hydrogenProvider) {
      this.hydrogenProvider = new _pluginApiHydrogenProvider2["default"](this);
    }

    return this.hydrogenProvider;
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    var statusBarElement = document.createElement("div");
    statusBarElement.className = "inline-block";

    statusBar.addLeftTile({
      item: statusBarElement,
      priority: 100
    });

    var onClick = this.showKernelCommands.bind(this);

    (0, _utils.reactFactory)(_react2["default"].createElement(_componentsStatusBar2["default"], { store: _store2["default"], onClick: onClick }), statusBarElement);

    // We should return a disposable here but Atom fails while calling .destroy()
    // return new Disposable(statusBarTile.destroy);
  },

  provide: function provide() {
    if (atom.config.get("Hydrogen.autocomplete") === true) {
      return (0, _autocompleteProvider2["default"])();
    }
    return null;
  },

  showKernelCommands: function showKernelCommands() {
    var _this2 = this;

    if (!this.signalListView) {
      this.signalListView = new _signalListView2["default"]();
      this.signalListView.onConfirmed = function (kernelCommand) {
        return _this2.handleKernelCommand(kernelCommand);
      };
    }
    this.signalListView.toggle();
  },

  connectToExistingKernel: function connectToExistingKernel() {
    if (!this.existingKernelPicker) {
      this.existingKernelPicker = new _existingKernelPicker2["default"]();
    }
    this.existingKernelPicker.toggle();
  },

  handleKernelCommand: function handleKernelCommand(_ref3) {
    var command = _ref3.command;
    var payload = _ref3.payload;
    return (function () {
      (0, _utils.log)("handleKernelCommand:", arguments);

      var kernel = _store2["default"].kernel;
      var grammar = _store2["default"].grammar;

      if (!grammar) {
        atom.notifications.addError("Undefined grammar");
        return;
      }

      if (!kernel) {
        var message = "No running kernel for grammar `" + grammar.name + "` found";
        atom.notifications.addError(message);
        return;
      }

      if (command === "interrupt-kernel") {
        kernel.interrupt();
      } else if (command === "restart-kernel") {
        kernel.restart();
      } else if (command === "shutdown-kernel") {
        _store2["default"].markers.clear();
        // Note that destroy alone does not shut down a WSKernel
        kernel.shutdown();
        kernel.destroy();
      } else if (command === "rename-kernel" && kernel.promptRename) {
        // $FlowFixMe Will only be called if remote kernel
        if (kernel instanceof _wsKernel2["default"]) kernel.promptRename();
      } else if (command === "disconnect-kernel") {
        _store2["default"].markers.clear();
        kernel.destroy();
      }
    }).apply(this, arguments);
  },

  createResultBubble: function createResultBubble(editor, code, row) {
    var _this3 = this;

    var grammar = _store2["default"].grammar;
    var filePath = _store2["default"].filePath;
    var kernel = _store2["default"].kernel;

    if (!grammar || !filePath) return;

    if (kernel) {
      this._createResultBubble(editor, kernel, code, row);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (kernel) {
      _this3._createResultBubble(editor, kernel, code, row);
    });
  },

  _createResultBubble: function _createResultBubble(editor, kernel, code, row) {
    if (atom.workspace.getActivePaneItem() instanceof _panesWatches2["default"]) {
      kernel.watchesStore.run();
      return;
    }
    var globalOutputStore = atom.config.get("Hydrogen.outputAreaDefault") || atom.workspace.getPaneItems().find(function (item) {
      return item instanceof _panesOutputArea2["default"];
    }) ? kernel.outputStore : null;

    var _ref4 = new _componentsResultView2["default"](_store2["default"].markers, kernel, editor, row, !globalOutputStore);

    var outputStore = _ref4.outputStore;

    kernel.execute(code, _asyncToGenerator(function* (result) {
      outputStore.appendOutput(result);
      if (globalOutputStore) {
        globalOutputStore.appendOutput(result);
        (0, _utils.openOrShowDock)(_utils.OUTPUT_AREA_URI);
      }
    }));
  },

  restartKernelAndReEvaluateBubbles: function restartKernelAndReEvaluateBubbles() {
    var _this4 = this;

    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var markers = _store2["default"].markers;

    var breakpoints = [];
    markers.markers.forEach(function (bubble) {
      breakpoints.push(bubble.marker.getBufferRange().start);
    });
    _store2["default"].markers.clear();

    if (!editor || !kernel) {
      this.runAll(breakpoints);
    } else {
      kernel.restart(function () {
        return _this4.runAll(breakpoints);
      });
    }
  },

  toggleBubble: function toggleBubble() {
    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var markers = _store2["default"].markers;

    if (!editor) return;

    var _editor$getLastSelection$getBufferRowRange = editor.getLastSelection().getBufferRowRange();

    var _editor$getLastSelection$getBufferRowRange2 = _slicedToArray(_editor$getLastSelection$getBufferRowRange, 2);

    var startRow = _editor$getLastSelection$getBufferRowRange2[0];
    var endRow = _editor$getLastSelection$getBufferRowRange2[1];

    for (var row = startRow; row <= endRow; row++) {
      var destroyed = markers.clearOnRow(row);

      if (!destroyed) {
        var _ref5 = new _componentsResultView2["default"](markers, kernel, editor, row, true);

        var outputStore = _ref5.outputStore;

        outputStore.status = "empty";
      }
    }
  },

  run: function run() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var editor = _store2["default"].editor;
    if (!editor) return;
    var codeBlock = codeManager.findCodeBlock(editor);
    if (!codeBlock) {
      return;
    }

    var _codeBlock = _slicedToArray(codeBlock, 2);

    var code = _codeBlock[0];
    var row = _codeBlock[1];

    if (code) {
      if (moveDown === true) {
        codeManager.moveDown(editor, row);
      }
      this.createResultBubble(editor, code, row);
    }
  },

  runAll: function runAll(breakpoints) {
    var _this5 = this;

    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var grammar = _store2["default"].grammar;
    var filePath = _store2["default"].filePath;

    if (!editor || !grammar || !filePath) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All" is not supported for this file type!');
      return;
    }

    if (editor && kernel) {
      this._runAll(editor, kernel, breakpoints);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (kernel) {
      _this5._runAll(editor, kernel, breakpoints);
    });
  },

  _runAll: function _runAll(editor, kernel, breakpoints) {
    var _this6 = this,
        _arguments = arguments;

    var cells = codeManager.getCells(editor, breakpoints);
    _lodash2["default"].forEach(cells, function (_ref6) {
      var start = _ref6.start;
      var end = _ref6.end;
      return (function () {
        var code = codeManager.getTextInRange(editor, start, end);
        var endRow = codeManager.escapeBlankRows(editor, start.row, end.row);
        this._createResultBubble(editor, kernel, code, endRow);
      }).apply(_this6, _arguments);
    });
  },

  runAllAbove: function runAllAbove() {
    var editor = _store2["default"].editor; // to make flow happy
    if (!editor) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All Above" is not supported for this file type!');
      return;
    }

    var cursor = editor.getLastCursor();
    var row = codeManager.escapeBlankRows(editor, 0, cursor.getBufferRow());
    var code = codeManager.getRows(editor, 0, row);

    if (code) {
      this.createResultBubble(editor, code, row);
    }
  },

  runCell: function runCell() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var editor = _store2["default"].editor;
    if (!editor) return;

    var _codeManager$getCurrentCell = codeManager.getCurrentCell(editor);

    var start = _codeManager$getCurrentCell.start;
    var end = _codeManager$getCurrentCell.end;

    var code = codeManager.getTextInRange(editor, start, end);
    var endRow = codeManager.escapeBlankRows(editor, start.row, end.row);

    if (code) {
      if (moveDown === true) {
        codeManager.moveDown(editor, endRow);
      }
      this.createResultBubble(editor, code, endRow);
    }
  },

  startZMQKernel: function startZMQKernel() {
    var _this7 = this;

    _kernelManager2["default"].getAllKernelSpecsForGrammar(_store2["default"].grammar).then(function (kernelSpecs) {
      if (_this7.kernelPicker) {
        _this7.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        _this7.kernelPicker = new _kernelPicker2["default"](kernelSpecs);

        _this7.kernelPicker.onConfirmed = function (kernelSpec) {
          var editor = _store2["default"].editor;
          var grammar = _store2["default"].grammar;
          var filePath = _store2["default"].filePath;

          if (!editor || !grammar || !filePath) return;
          _store2["default"].markers.clear();

          _kernelManager2["default"].startKernel(kernelSpec, grammar, editor, filePath);
        };
      }

      _this7.kernelPicker.toggle();
    });
  },

  connectToWSKernel: function connectToWSKernel() {
    if (!this.wsKernelPicker) {
      this.wsKernelPicker = new _wsKernelPicker2["default"](function (kernel) {
        _store2["default"].markers.clear();
        var editor = _store2["default"].editor;
        var grammar = _store2["default"].grammar;
        var filePath = _store2["default"].filePath;

        if (!editor || !grammar || !filePath) return;

        if (kernel instanceof _zmqKernel2["default"]) kernel.destroy();

        _store2["default"].newKernel(kernel, filePath, editor, grammar);
      });
    }

    this.wsKernelPicker.toggle(function (kernelSpec) {
      return (0, _utils.kernelSpecProvidesGrammar)(kernelSpec, _store2["default"].grammar);
    });
  }
};

exports["default"] = Hydrogen;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFRTyxNQUFNOztzQkFFQyxRQUFROzs7O29CQUNFLE1BQU07O3FCQUNaLE9BQU87Ozs7NEJBRUEsaUJBQWlCOzs7OzhCQUNmLG9CQUFvQjs7OztvQ0FDZCwwQkFBMEI7Ozs7OEJBQ2hDLG9CQUFvQjs7OzsyQkFDbEIsZ0JBQWdCOztJQUFqQyxXQUFXOzttQ0FFRCx3QkFBd0I7Ozs7b0NBQ3ZCLDBCQUEwQjs7OzttQ0FDM0IseUJBQXlCOzs7OzhCQUVyQixtQkFBbUI7Ozs7NEJBQ3JCLGlCQUFpQjs7OzsrQkFDbEIscUJBQXFCOzs7O2tDQUNkLHdCQUF3Qjs7Ozt3QkFFdEIsWUFBWTs7cUJBRTFCLFNBQVM7Ozs7MkJBQ0gsZ0JBQWdCOzs7O3NCQUVyQixVQUFVOzs7OzZCQUNILGtCQUFrQjs7Ozt5QkFDdEIsY0FBYzs7Ozt3QkFDZixhQUFhOzs7O29DQUNELHlCQUF5Qjs7Ozt5Q0FDN0IsZ0NBQWdDOzs7O3FCQWF0RCxTQUFTOztBQUloQixJQUFNLFFBQVEsR0FBRztBQUNmLFFBQU0sRUFBRSxvQkFBTyxNQUFNOztBQUVyQixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0IsUUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7QUFDdkMsdUJBQU0sYUFBYSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQ3JCLDJCQUEyQixFQUMzQixVQUFDLElBQXNCLEVBQUs7VUFBekIsUUFBUSxHQUFWLElBQXNCLENBQXBCLFFBQVE7VUFBRSxRQUFRLEdBQXBCLElBQXNCLENBQVYsUUFBUTs7QUFDbkIsVUFBSSwwQkFBMEIsRUFBRTtBQUM5QixrQ0FBMEIsR0FBRyxLQUFLLENBQUM7QUFDbkMsZUFBTztPQUNSOztBQUVELFVBQUksbUJBQU0sY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7QUFDcEMsa0NBQTBCLEdBQUcsSUFBSSxDQUFDOztBQUVsQyxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFdkQsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO0FBQ3RDLHFCQUFXLEVBQ1QsZ0VBQWdFO0FBQ2xFLHFCQUFXLEVBQUUsS0FBSztTQUNuQixDQUFDLENBQUM7T0FDSjtLQUNGLENBQ0YsQ0FDRixDQUFDOztBQUVGLHVCQUFNLGFBQWEsQ0FBQyxHQUFHOztBQUVyQixRQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFDLEtBQVk7VUFBVixRQUFRLEdBQVYsS0FBWSxDQUFWLFFBQVE7YUFDbkQsMkJBQWUsUUFBUSxDQUFDO0tBQUEsQ0FDekIsQ0FDRixDQUFDOztBQUVGLHVCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFO0FBQ2hELG9CQUFjLEVBQUU7ZUFBTSxNQUFLLEdBQUcsRUFBRTtPQUFBO0FBQ2hDLHdCQUFrQixFQUFFO2VBQU0sTUFBSyxNQUFNLEVBQUU7T0FBQTtBQUN2Qyw4QkFBd0IsRUFBRTtlQUFNLE1BQUssV0FBVyxFQUFFO09BQUE7QUFDbEQsa0NBQTRCLEVBQUU7ZUFBTSxNQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7T0FBQTtBQUNsRCx5QkFBbUIsRUFBRTtlQUFNLE1BQUssT0FBTyxFQUFFO09BQUE7QUFDekMsdUNBQWlDLEVBQUU7ZUFBTSxNQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUM7T0FBQTtBQUMzRCwrQkFBeUIsRUFBRTtlQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxvQkFBYTtPQUFBO0FBQ25FLG1DQUE2QixFQUFFO2VBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSx3QkFBaUI7T0FBQTtBQUN4QyxzQ0FBZ0MsRUFBRTtlQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sMkJBQW9CO09BQUE7QUFDM0MsbUNBQTZCLEVBQUU7ZUFBTSxNQUFLLGNBQWMsRUFBRTtPQUFBO0FBQzFELHlDQUFtQyxFQUFFO2VBQU0sTUFBSyxpQkFBaUIsRUFBRTtPQUFBO0FBQ25FLDJDQUFxQyxFQUFFO2VBQ3JDLE1BQUssdUJBQXVCLEVBQUU7T0FBQTtBQUNoQywwQkFBb0IsRUFBRSw0QkFBTTtBQUMxQixZQUFJLG1CQUFNLE1BQU0sRUFBRTtBQUNoQiw2QkFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLG1CQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQzNELHdEQUEyQixDQUFDO1NBQzdCO09BQ0Y7QUFDRCw2QkFBdUIsRUFBRSwrQkFBTTtBQUM3QixZQUFJLG1CQUFNLE1BQU0sRUFBRTtBQUNoQiw2QkFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3hDLHdEQUEyQixDQUFDO1NBQzdCO09BQ0Y7QUFDRCwrQkFBeUIsRUFBRTtlQUFNLDJCQUFjLGlCQUFpQixFQUFFO09BQUE7QUFDbEUsaUNBQTJCLEVBQUU7ZUFBTSxrREFBc0I7T0FBQTtBQUN6RCxpQ0FBMkIsRUFBRTtlQUMzQixNQUFLLG1CQUFtQixDQUFDLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLENBQUM7T0FBQTtBQUMzRCwrQkFBeUIsRUFBRTtlQUN6QixNQUFLLG1CQUFtQixDQUFDLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUM7T0FBQTtBQUN6RCx1REFBaUQsRUFBRTtlQUNqRCxNQUFLLGlDQUFpQyxFQUFFO09BQUE7QUFDMUMsZ0NBQTBCLEVBQUU7ZUFDMUIsTUFBSyxtQkFBbUIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxDQUFDO09BQUE7QUFDMUQsOEJBQXdCLEVBQUU7ZUFBTSxNQUFLLFlBQVksRUFBRTtPQUFBO0tBQ3BELENBQUMsQ0FDSCxDQUFDOztBQUVGLHVCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLDhCQUF3QixFQUFFO2VBQU0sbUJBQU0sT0FBTyxDQUFDLEtBQUssRUFBRTtPQUFBO0tBQ3RELENBQUMsQ0FDSCxDQUFDOztBQUVGLFFBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3BCLHlCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLHFDQUE2QixFQUFFO2lCQUFNLDhCQUFrQjtTQUFBO09BQ3hELENBQUMsQ0FDSCxDQUFDO0tBQ0g7O0FBRUQsdUJBQU0sYUFBYSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUMvQyx5QkFBTSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDNUIsQ0FBQyxDQUNILENBQUM7O0FBRUYsdUJBQU0sYUFBYSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUMxQyxVQUFNLG1CQUFtQixHQUFHLCtCQUF5QixDQUFDO0FBQ3RELHlCQUFtQixDQUFDLEdBQUcsQ0FDckIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFlBQU07QUFDOUIsMkJBQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQzFCLENBQUMsQ0FDSCxDQUFDOztBQUVGLFVBQUksbUNBQXVCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLDJCQUFtQixDQUFDLEdBQUcsQ0FDckIsTUFBTSxDQUFDLHlCQUF5QixDQUM5QixvQkFBRSxRQUFRLENBQUMsWUFBTTtBQUNmLDZCQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMxQixFQUFFLEVBQUUsQ0FBQyxDQUNQLENBQ0YsQ0FBQztPQUNIOztBQUVELHlCQUFtQixDQUFDLEdBQUcsQ0FDckIsTUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQ3hCLDJCQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQy9CLENBQUMsQ0FDSCxDQUFDOztBQUVGLHlCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUM5QyxDQUFDLENBQ0gsQ0FBQzs7QUFFRixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDOztBQUU3Qix1QkFBTSxhQUFhLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUM5QixjQUFRLEdBQUc7QUFDVDtBQUNFLGlCQUFPLG1EQUF3QixDQUFDO0FBQUEsQUFDbEM7QUFDRSxpQkFBTyxpREFBc0IsQ0FBQztBQUFBLEFBQ2hDO0FBQ0UsaUJBQU8sb0RBQXFCLENBQUM7QUFBQSxBQUMvQjtBQUNFLGlCQUFPLHVEQUE0QixDQUFDO0FBQUEsT0FDdkM7S0FDRixDQUFDLENBQ0gsQ0FBQzs7QUFFRix1QkFBTSxhQUFhLENBQUMsR0FBRzs7QUFFckIseUJBQWUsWUFBTTtBQUNuQixVQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUM1QyxZQUNFLElBQUksdUNBQXlCLElBQzdCLElBQUkscUNBQXVCLElBQzNCLElBQUksd0NBQXNCLElBQzFCLElBQUksMkNBQTZCLEVBQ2pDO0FBQ0EsY0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ2hCO09BQ0YsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUNILENBQUM7O0FBRUYsK0JBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQzs7QUFFM0QsdUJBQVEsWUFBTTtBQUNaLFlBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxtQkFBTSxNQUFNLENBQUMsQ0FBQztLQUN0RCxDQUFDLENBQUM7R0FDSjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCx1QkFBTSxPQUFPLEVBQUUsQ0FBQztHQUNqQjs7QUFFRCxpQkFBZSxFQUFBLDJCQUFHO0FBQ2hCLFFBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7QUFDMUIsVUFBSSxDQUFDLGdCQUFnQixHQUFHLDJDQUFxQixJQUFJLENBQUMsQ0FBQztLQUNwRDs7QUFFRCxXQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztHQUM5Qjs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxTQUF5QixFQUFFO0FBQzFDLFFBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2RCxvQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDOztBQUU1QyxhQUFTLENBQUMsV0FBVyxDQUFDO0FBQ3BCLFVBQUksRUFBRSxnQkFBZ0I7QUFDdEIsY0FBUSxFQUFFLEdBQUc7S0FDZCxDQUFDLENBQUM7O0FBRUgsUUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbkQsNkJBQ0UscUVBQVcsS0FBSyxvQkFBUSxFQUFDLE9BQU8sRUFBRSxPQUFPLEFBQUMsR0FBRyxFQUM3QyxnQkFBZ0IsQ0FDakIsQ0FBQzs7OztHQUlIOztBQUVELFNBQU8sRUFBQSxtQkFBRztBQUNSLFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDckQsYUFBTyx3Q0FBc0IsQ0FBQztLQUMvQjtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsb0JBQWtCLEVBQUEsOEJBQUc7OztBQUNuQixRQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtBQUN4QixVQUFJLENBQUMsY0FBYyxHQUFHLGlDQUFvQixDQUFDO0FBQzNDLFVBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxHQUFHLFVBQUMsYUFBYTtlQUM5QyxPQUFLLG1CQUFtQixDQUFDLGFBQWEsQ0FBQztPQUFBLENBQUM7S0FDM0M7QUFDRCxRQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQzlCOztBQUVELHlCQUF1QixFQUFBLG1DQUFHO0FBQ3hCLFFBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7QUFDOUIsVUFBSSxDQUFDLG9CQUFvQixHQUFHLHVDQUEwQixDQUFDO0tBQ3hEO0FBQ0QsUUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQ3BDOztBQUVELHFCQUFtQixFQUFBLDZCQUFDLEtBTW5CO1FBTEMsT0FBTyxHQURXLEtBTW5CLENBTEMsT0FBTztRQUNQLE9BQU8sR0FGVyxLQU1uQixDQUpDLE9BQU87d0JBSU47QUFDRCxzQkFBSSxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQzs7VUFFL0IsTUFBTSxzQkFBTixNQUFNO1VBQUUsT0FBTyxzQkFBUCxPQUFPOztBQUV2QixVQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNqRCxlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFlBQU0sT0FBTyx1Q0FBc0MsT0FBTyxDQUFDLElBQUksWUFBVSxDQUFDO0FBQzFFLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JDLGVBQU87T0FDUjs7QUFFRCxVQUFJLE9BQU8sS0FBSyxrQkFBa0IsRUFBRTtBQUNsQyxjQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDcEIsTUFBTSxJQUFJLE9BQU8sS0FBSyxnQkFBZ0IsRUFBRTtBQUN2QyxjQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDbEIsTUFBTSxJQUFJLE9BQU8sS0FBSyxpQkFBaUIsRUFBRTtBQUN4QywyQkFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRXRCLGNBQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsQixjQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDbEIsTUFBTSxJQUFJLE9BQU8sS0FBSyxlQUFlLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRTs7QUFFN0QsWUFBSSxNQUFNLGlDQUFvQixFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztPQUN2RCxNQUFNLElBQUksT0FBTyxLQUFLLG1CQUFtQixFQUFFO0FBQzFDLDJCQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QixjQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDbEI7S0FDRjtHQUFBOztBQUVELG9CQUFrQixFQUFBLDRCQUFDLE1BQXVCLEVBQUUsSUFBWSxFQUFFLEdBQVcsRUFBRTs7O1FBQzdELE9BQU8sc0JBQVAsT0FBTztRQUFFLFFBQVEsc0JBQVIsUUFBUTtRQUFFLE1BQU0sc0JBQU4sTUFBTTs7QUFDakMsUUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPOztBQUVsQyxRQUFJLE1BQU0sRUFBRTtBQUNWLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwRCxhQUFPO0tBQ1I7O0FBRUQsK0JBQWMsY0FBYyxDQUMxQixPQUFPLEVBQ1AsTUFBTSxFQUNOLFFBQVEsRUFDUixVQUFDLE1BQU0sRUFBZ0I7QUFDckIsYUFBSyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztLQUNyRCxDQUNGLENBQUM7R0FDSDs7QUFFRCxxQkFBbUIsRUFBQSw2QkFDakIsTUFBdUIsRUFDdkIsTUFBYyxFQUNkLElBQVksRUFDWixHQUFXLEVBQ1g7QUFDQSxRQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUscUNBQXVCLEVBQUU7QUFDN0QsWUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixhQUFPO0tBQ1I7QUFDRCxRQUFNLGlCQUFpQixHQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxJQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7YUFBSSxJQUFJLHdDQUFzQjtLQUFBLENBQUMsR0FDbEUsTUFBTSxDQUFDLFdBQVcsR0FDbEIsSUFBSSxDQUFDOztnQkFFYSxzQ0FDdEIsbUJBQU0sT0FBTyxFQUNiLE1BQU0sRUFDTixNQUFNLEVBQ04sR0FBRyxFQUNILENBQUMsaUJBQWlCLENBQ25COztRQU5PLFdBQVcsU0FBWCxXQUFXOztBQVFuQixVQUFNLENBQUMsT0FBTyxDQUFDLElBQUksb0JBQUUsV0FBTSxNQUFNLEVBQUk7QUFDbkMsaUJBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBSSxpQkFBaUIsRUFBRTtBQUNyQix5QkFBaUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkMsMERBQStCLENBQUM7T0FDakM7S0FDRixFQUFDLENBQUM7R0FDSjs7QUFFRCxtQ0FBaUMsRUFBQSw2Q0FBRzs7O1FBQzFCLE1BQU0sc0JBQU4sTUFBTTtRQUFFLE1BQU0sc0JBQU4sTUFBTTtRQUFFLE9BQU8sc0JBQVAsT0FBTzs7QUFFL0IsUUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFdBQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxFQUFpQjtBQUM5QyxpQkFBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hELENBQUMsQ0FBQztBQUNILHVCQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUN0QixVQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQzFCLE1BQU07QUFDTCxZQUFNLENBQUMsT0FBTyxDQUFDO2VBQU0sT0FBSyxNQUFNLENBQUMsV0FBVyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hEO0dBQ0Y7O0FBRUQsY0FBWSxFQUFBLHdCQUFHO1FBQ0wsTUFBTSxzQkFBTixNQUFNO1FBQUUsTUFBTSxzQkFBTixNQUFNO1FBQUUsT0FBTyxzQkFBUCxPQUFPOztBQUMvQixRQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87O3FEQUNPLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLGlCQUFpQixFQUFFOzs7O1FBQWpFLFFBQVE7UUFBRSxNQUFNOztBQUV2QixTQUFLLElBQUksR0FBRyxHQUFHLFFBQVEsRUFBRSxHQUFHLElBQUksTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFO0FBQzdDLFVBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRTFDLFVBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ1Usc0NBQ3RCLE9BQU8sRUFDUCxNQUFNLEVBQ04sTUFBTSxFQUNOLEdBQUcsRUFDSCxJQUFJLENBQ0w7O1lBTk8sV0FBVyxTQUFYLFdBQVc7O0FBT25CLG1CQUFXLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztPQUM5QjtLQUNGO0dBQ0Y7O0FBRUQsS0FBRyxFQUFBLGVBQTRCO1FBQTNCLFFBQWlCLHlEQUFHLEtBQUs7O0FBQzNCLFFBQU0sTUFBTSxHQUFHLG1CQUFNLE1BQU0sQ0FBQztBQUM1QixRQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDcEIsUUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwRCxRQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2QsYUFBTztLQUNSOztvQ0FFbUIsU0FBUzs7UUFBdEIsSUFBSTtRQUFFLEdBQUc7O0FBQ2hCLFFBQUksSUFBSSxFQUFFO0FBQ1IsVUFBSSxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQ3JCLG1CQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztPQUNuQztBQUNELFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQzVDO0dBQ0Y7O0FBRUQsUUFBTSxFQUFBLGdCQUFDLFdBQStCLEVBQUU7OztRQUM5QixNQUFNLHNCQUFOLE1BQU07UUFBRSxNQUFNLHNCQUFOLE1BQU07UUFBRSxPQUFPLHNCQUFQLE9BQU87UUFBRSxRQUFRLHNCQUFSLFFBQVE7O0FBQ3pDLFFBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTztBQUM3QyxRQUFJLG1DQUF1QixNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRTtBQUMvQyxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsZ0RBQWdELENBQ2pELENBQUM7QUFDRixhQUFPO0tBQ1I7O0FBRUQsUUFBSSxNQUFNLElBQUksTUFBTSxFQUFFO0FBQ3BCLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztBQUMxQyxhQUFPO0tBQ1I7O0FBRUQsK0JBQWMsY0FBYyxDQUMxQixPQUFPLEVBQ1AsTUFBTSxFQUNOLFFBQVEsRUFDUixVQUFDLE1BQU0sRUFBZ0I7QUFDckIsYUFBSyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztLQUMzQyxDQUNGLENBQUM7R0FDSDs7QUFFRCxTQUFPLEVBQUEsaUJBQ0wsTUFBdUIsRUFDdkIsTUFBYyxFQUNkLFdBQStCLEVBQy9COzs7O0FBQ0EsUUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDdEQsd0JBQUUsT0FBTyxDQUNQLEtBQUssRUFDTCxVQUFDLEtBQWM7VUFBWixLQUFLLEdBQVAsS0FBYyxDQUFaLEtBQUs7VUFBRSxHQUFHLEdBQVosS0FBYyxDQUFMLEdBQUc7MEJBQStDO0FBQzFELFlBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUM1RCxZQUFNLE1BQU0sR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN2RSxZQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDeEQ7S0FBQSxDQUNGLENBQUM7R0FDSDs7QUFFRCxhQUFXLEVBQUEsdUJBQUc7QUFDWixRQUFNLE1BQU0sR0FBRyxtQkFBTSxNQUFNLENBQUM7QUFDNUIsUUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPO0FBQ3BCLFFBQUksbUNBQXVCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFO0FBQy9DLFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QixzREFBc0QsQ0FDdkQsQ0FBQztBQUNGLGFBQU87S0FDUjs7QUFFRCxRQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDdEMsUUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQzFFLFFBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFakQsUUFBSSxJQUFJLEVBQUU7QUFDUixVQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztLQUM1QztHQUNGOztBQUVELFNBQU8sRUFBQSxtQkFBNEI7UUFBM0IsUUFBaUIseURBQUcsS0FBSzs7QUFDL0IsUUFBTSxNQUFNLEdBQUcsbUJBQU0sTUFBTSxDQUFDO0FBQzVCLFFBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTzs7c0NBQ0csV0FBVyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7O1FBQWpELEtBQUssK0JBQUwsS0FBSztRQUFFLEdBQUcsK0JBQUgsR0FBRzs7QUFDbEIsUUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVELFFBQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV2RSxRQUFJLElBQUksRUFBRTtBQUNSLFVBQUksUUFBUSxLQUFLLElBQUksRUFBRTtBQUNyQixtQkFBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDdEM7QUFDRCxVQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUMvQztHQUNGOztBQUVELGdCQUFjLEVBQUEsMEJBQUc7OztBQUNmLCtCQUNHLDJCQUEyQixDQUFDLG1CQUFNLE9BQU8sQ0FBQyxDQUMxQyxJQUFJLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDbkIsVUFBSSxPQUFLLFlBQVksRUFBRTtBQUNyQixlQUFLLFlBQVksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO09BQzdDLE1BQU07QUFDTCxlQUFLLFlBQVksR0FBRyw4QkFBaUIsV0FBVyxDQUFDLENBQUM7O0FBRWxELGVBQUssWUFBWSxDQUFDLFdBQVcsR0FBRyxVQUFDLFVBQVUsRUFBaUI7Y0FDbEQsTUFBTSxzQkFBTixNQUFNO2NBQUUsT0FBTyxzQkFBUCxPQUFPO2NBQUUsUUFBUSxzQkFBUixRQUFROztBQUNqQyxjQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU87QUFDN0MsNkJBQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV0QixxQ0FBYyxXQUFXLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDbEUsQ0FBQztPQUNIOztBQUVELGFBQUssWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQzVCLENBQUMsQ0FBQztHQUNOOztBQUVELG1CQUFpQixFQUFBLDZCQUFHO0FBQ2xCLFFBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3hCLFVBQUksQ0FBQyxjQUFjLEdBQUcsZ0NBQW1CLFVBQUMsTUFBTSxFQUFhO0FBQzNELDJCQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNkLE1BQU0sc0JBQU4sTUFBTTtZQUFFLE9BQU8sc0JBQVAsT0FBTztZQUFFLFFBQVEsc0JBQVIsUUFBUTs7QUFDakMsWUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPOztBQUU3QyxZQUFJLE1BQU0sa0NBQXFCLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsRCwyQkFBTSxTQUFTLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDcEQsQ0FBQyxDQUFDO0tBQ0o7O0FBRUQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQyxVQUFVO2FBQ3BDLHNDQUEwQixVQUFVLEVBQUUsbUJBQU0sT0FBTyxDQUFDO0tBQUEsQ0FDckQsQ0FBQztHQUNIO0NBQ0YsQ0FBQzs7cUJBRWEsUUFBUSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7XG4gIEVtaXR0ZXIsXG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIERpc3Bvc2FibGUsXG4gIFBvaW50LFxuICBUZXh0RWRpdG9yXG59IGZyb20gXCJhdG9tXCI7XG5cbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGF1dG9ydW4gfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgS2VybmVsUGlja2VyIGZyb20gXCIuL2tlcm5lbC1waWNrZXJcIjtcbmltcG9ydCBXU0tlcm5lbFBpY2tlciBmcm9tIFwiLi93cy1rZXJuZWwtcGlja2VyXCI7XG5pbXBvcnQgRXhpc3RpbmdLZXJuZWxQaWNrZXIgZnJvbSBcIi4vZXhpc3Rpbmcta2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IFNpZ25hbExpc3RWaWV3IGZyb20gXCIuL3NpZ25hbC1saXN0LXZpZXdcIjtcbmltcG9ydCAqIGFzIGNvZGVNYW5hZ2VyIGZyb20gXCIuL2NvZGUtbWFuYWdlclwiO1xuXG5pbXBvcnQgSW5zcGVjdG9yIGZyb20gXCIuL2NvbXBvbmVudHMvaW5zcGVjdG9yXCI7XG5pbXBvcnQgUmVzdWx0VmlldyBmcm9tIFwiLi9jb21wb25lbnRzL3Jlc3VsdC12aWV3XCI7XG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gXCIuL2NvbXBvbmVudHMvc3RhdHVzLWJhclwiO1xuXG5pbXBvcnQgSW5zcGVjdG9yUGFuZSBmcm9tIFwiLi9wYW5lcy9pbnNwZWN0b3JcIjtcbmltcG9ydCBXYXRjaGVzUGFuZSBmcm9tIFwiLi9wYW5lcy93YXRjaGVzXCI7XG5pbXBvcnQgT3V0cHV0UGFuZSBmcm9tIFwiLi9wYW5lcy9vdXRwdXQtYXJlYVwiO1xuaW1wb3J0IEtlcm5lbE1vbml0b3JQYW5lIGZyb20gXCIuL3BhbmVzL2tlcm5lbC1tb25pdG9yXCI7XG5cbmltcG9ydCB7IHRvZ2dsZUluc3BlY3RvciB9IGZyb20gXCIuL2NvbW1hbmRzXCI7XG5cbmltcG9ydCBzdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IE91dHB1dFN0b3JlIGZyb20gXCIuL3N0b3JlL291dHB1dFwiO1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IGtlcm5lbE1hbmFnZXIgZnJvbSBcIi4va2VybmVsLW1hbmFnZXJcIjtcbmltcG9ydCBaTVFLZXJuZWwgZnJvbSBcIi4vem1xLWtlcm5lbFwiO1xuaW1wb3J0IFdTS2VybmVsIGZyb20gXCIuL3dzLWtlcm5lbFwiO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVByb3ZpZGVyIGZyb20gXCIuL2F1dG9jb21wbGV0ZS1wcm92aWRlclwiO1xuaW1wb3J0IEh5ZHJvZ2VuUHJvdmlkZXIgZnJvbSBcIi4vcGx1Z2luLWFwaS9oeWRyb2dlbi1wcm92aWRlclwiO1xuaW1wb3J0IHtcbiAgbG9nLFxuICByZWFjdEZhY3RvcnksXG4gIGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIsXG4gIHJlbmRlckRldlRvb2xzLFxuICBJTlNQRUNUT1JfVVJJLFxuICBXQVRDSEVTX1VSSSxcbiAgT1VUUFVUX0FSRUFfVVJJLFxuICBLRVJORUxfTU9OSVRPUl9VUkksXG4gIGhvdFJlbG9hZFBhY2thZ2UsXG4gIG9wZW5PclNob3dEb2NrLFxuICBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyXG59IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCB0eXBlIEtlcm5lbCBmcm9tIFwiLi9rZXJuZWxcIjtcblxuY29uc3QgSHlkcm9nZW4gPSB7XG4gIGNvbmZpZzogQ29uZmlnLnNjaGVtYSxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gICAgbGV0IHNraXBMYW5ndWFnZU1hcHBpbmdzQ2hhbmdlID0gZmFsc2U7XG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcbiAgICAgICAgXCJIeWRyb2dlbi5sYW5ndWFnZU1hcHBpbmdzXCIsXG4gICAgICAgICh7IG5ld1ZhbHVlLCBvbGRWYWx1ZSB9KSA9PiB7XG4gICAgICAgICAgaWYgKHNraXBMYW5ndWFnZU1hcHBpbmdzQ2hhbmdlKSB7XG4gICAgICAgICAgICBza2lwTGFuZ3VhZ2VNYXBwaW5nc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdG9yZS5ydW5uaW5nS2VybmVscy5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgc2tpcExhbmd1YWdlTWFwcGluZ3NDaGFuZ2UgPSB0cnVlO1xuXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoXCJIeWRyb2dlbi5sYW5ndWFnZU1hcHBpbmdzXCIsIG9sZFZhbHVlKTtcblxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiSHlkcm9nZW5cIiwge1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICBcImBsYW5ndWFnZU1hcHBpbmdzYCBjYW5ub3QgYmUgdXBkYXRlZCB3aGlsZSBrZXJuZWxzIGFyZSBydW5uaW5nXCIsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiBmYWxzZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgLy8gZW5hYmxlL2Rpc2FibGUgbW9ieC1yZWFjdC1kZXZ0b29scyBsb2dnaW5nXG4gICAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZShcIkh5ZHJvZ2VuLmRlYnVnXCIsICh7IG5ld1ZhbHVlIH0pID0+XG4gICAgICAgIHJlbmRlckRldlRvb2xzKG5ld1ZhbHVlKVxuICAgICAgKVxuICAgICk7XG5cbiAgICBzdG9yZS5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFwiYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKVwiLCB7XG4gICAgICAgIFwiaHlkcm9nZW46cnVuXCI6ICgpID0+IHRoaXMucnVuKCksXG4gICAgICAgIFwiaHlkcm9nZW46cnVuLWFsbFwiOiAoKSA9PiB0aGlzLnJ1bkFsbCgpLFxuICAgICAgICBcImh5ZHJvZ2VuOnJ1bi1hbGwtYWJvdmVcIjogKCkgPT4gdGhpcy5ydW5BbGxBYm92ZSgpLFxuICAgICAgICBcImh5ZHJvZ2VuOnJ1bi1hbmQtbW92ZS1kb3duXCI6ICgpID0+IHRoaXMucnVuKHRydWUpLFxuICAgICAgICBcImh5ZHJvZ2VuOnJ1bi1jZWxsXCI6ICgpID0+IHRoaXMucnVuQ2VsbCgpLFxuICAgICAgICBcImh5ZHJvZ2VuOnJ1bi1jZWxsLWFuZC1tb3ZlLWRvd25cIjogKCkgPT4gdGhpcy5ydW5DZWxsKHRydWUpLFxuICAgICAgICBcImh5ZHJvZ2VuOnRvZ2dsZS13YXRjaGVzXCI6ICgpID0+IGF0b20ud29ya3NwYWNlLnRvZ2dsZShXQVRDSEVTX1VSSSksXG4gICAgICAgIFwiaHlkcm9nZW46dG9nZ2xlLW91dHB1dC1hcmVhXCI6ICgpID0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UudG9nZ2xlKE9VVFBVVF9BUkVBX1VSSSksXG4gICAgICAgIFwiaHlkcm9nZW46dG9nZ2xlLWtlcm5lbC1tb25pdG9yXCI6ICgpID0+XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UudG9nZ2xlKEtFUk5FTF9NT05JVE9SX1VSSSksXG4gICAgICAgIFwiaHlkcm9nZW46c3RhcnQtbG9jYWwta2VybmVsXCI6ICgpID0+IHRoaXMuc3RhcnRaTVFLZXJuZWwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpjb25uZWN0LXRvLXJlbW90ZS1rZXJuZWxcIjogKCkgPT4gdGhpcy5jb25uZWN0VG9XU0tlcm5lbCgpLFxuICAgICAgICBcImh5ZHJvZ2VuOmNvbm5lY3QtdG8tZXhpc3Rpbmcta2VybmVsXCI6ICgpID0+XG4gICAgICAgICAgdGhpcy5jb25uZWN0VG9FeGlzdGluZ0tlcm5lbCgpLFxuICAgICAgICBcImh5ZHJvZ2VuOmFkZC13YXRjaFwiOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHN0b3JlLmtlcm5lbCkge1xuICAgICAgICAgICAgc3RvcmUua2VybmVsLndhdGNoZXNTdG9yZS5hZGRXYXRjaEZyb21FZGl0b3Ioc3RvcmUuZWRpdG9yKTtcbiAgICAgICAgICAgIG9wZW5PclNob3dEb2NrKFdBVENIRVNfVVJJKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaHlkcm9nZW46cmVtb3ZlLXdhdGNoXCI6ICgpID0+IHtcbiAgICAgICAgICBpZiAoc3RvcmUua2VybmVsKSB7XG4gICAgICAgICAgICBzdG9yZS5rZXJuZWwud2F0Y2hlc1N0b3JlLnJlbW92ZVdhdGNoKCk7XG4gICAgICAgICAgICBvcGVuT3JTaG93RG9jayhXQVRDSEVTX1VSSSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImh5ZHJvZ2VuOnVwZGF0ZS1rZXJuZWxzXCI6ICgpID0+IGtlcm5lbE1hbmFnZXIudXBkYXRlS2VybmVsU3BlY3MoKSxcbiAgICAgICAgXCJoeWRyb2dlbjp0b2dnbGUtaW5zcGVjdG9yXCI6ICgpID0+IHRvZ2dsZUluc3BlY3RvcihzdG9yZSksXG4gICAgICAgIFwiaHlkcm9nZW46aW50ZXJydXB0LWtlcm5lbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZCh7IGNvbW1hbmQ6IFwiaW50ZXJydXB0LWtlcm5lbFwiIH0pLFxuICAgICAgICBcImh5ZHJvZ2VuOnJlc3RhcnQta2VybmVsXCI6ICgpID0+XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXJuZWxDb21tYW5kKHsgY29tbWFuZDogXCJyZXN0YXJ0LWtlcm5lbFwiIH0pLFxuICAgICAgICBcImh5ZHJvZ2VuOnJlc3RhcnQta2VybmVsLWFuZC1yZS1ldmFsdWF0ZS1idWJibGVzXCI6ICgpID0+XG4gICAgICAgICAgdGhpcy5yZXN0YXJ0S2VybmVsQW5kUmVFdmFsdWF0ZUJ1YmJsZXMoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpzaHV0ZG93bi1rZXJuZWxcIjogKCkgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiBcInNodXRkb3duLWtlcm5lbFwiIH0pLFxuICAgICAgICBcImh5ZHJvZ2VuOnRvZ2dsZS1idWJibGVcIjogKCkgPT4gdGhpcy50b2dnbGVCdWJibGUoKVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgICAgXCJoeWRyb2dlbjpjbGVhci1yZXN1bHRzXCI6ICgpID0+IHN0b3JlLm1hcmtlcnMuY2xlYXIoKVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgICAgICBcImh5ZHJvZ2VuOmhvdC1yZWxvYWQtcGFja2FnZVwiOiAoKSA9PiBob3RSZWxvYWRQYWNrYWdlKClcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlVGV4dEVkaXRvcihlZGl0b3IgPT4ge1xuICAgICAgICBzdG9yZS51cGRhdGVFZGl0b3IoZWRpdG9yKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgICBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyKCgpID0+IHtcbiAgICAgICAgICAgIHN0b3JlLnNldEdyYW1tYXIoZWRpdG9yKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChpc011bHRpbGFuZ3VhZ2VHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpKSB7XG4gICAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgICBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihcbiAgICAgICAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcmUuc2V0R3JhbW1hcihlZGl0b3IpO1xuICAgICAgICAgICAgICB9LCA3NSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvclN1YnNjcmlwdGlvbnMpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgdGhpcy5oeWRyb2dlblByb3ZpZGVyID0gbnVsbDtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKHVyaSA9PiB7XG4gICAgICAgIHN3aXRjaCAodXJpKSB7XG4gICAgICAgICAgY2FzZSBJTlNQRUNUT1JfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnNwZWN0b3JQYW5lKHN0b3JlKTtcbiAgICAgICAgICBjYXNlIFdBVENIRVNfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBXYXRjaGVzUGFuZShzdG9yZSk7XG4gICAgICAgICAgY2FzZSBPVVRQVVRfQVJFQV9VUkk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE91dHB1dFBhbmUoc3RvcmUpO1xuICAgICAgICAgIGNhc2UgS0VSTkVMX01PTklUT1JfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBLZXJuZWxNb25pdG9yUGFuZShzdG9yZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgLy8gRGVzdHJveSBhbnkgUGFuZXMgd2hlbiB0aGUgcGFja2FnZSBpcyBkZWFjdGl2YXRlZC5cbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKCkuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpdGVtIGluc3RhbmNlb2YgSW5zcGVjdG9yUGFuZSB8fFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIFdhdGNoZXNQYW5lIHx8XG4gICAgICAgICAgICBpdGVtIGluc3RhbmNlb2YgT3V0cHV0UGFuZSB8fFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIEtlcm5lbE1vbml0b3JQYW5lXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBpdGVtLmRlc3Ryb3koKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgcmVuZGVyRGV2VG9vbHMoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4uZGVidWdcIikgPT09IHRydWUpO1xuXG4gICAgYXV0b3J1bigoKSA9PiB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdChcImRpZC1jaGFuZ2Uta2VybmVsXCIsIHN0b3JlLmtlcm5lbCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBzdG9yZS5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUh5ZHJvZ2VuKCkge1xuICAgIGlmICghdGhpcy5oeWRyb2dlblByb3ZpZGVyKSB7XG4gICAgICB0aGlzLmh5ZHJvZ2VuUHJvdmlkZXIgPSBuZXcgSHlkcm9nZW5Qcm92aWRlcih0aGlzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5oeWRyb2dlblByb3ZpZGVyO1xuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhdG9tJFN0YXR1c0Jhcikge1xuICAgIGNvbnN0IHN0YXR1c0JhckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHN0YXR1c0JhckVsZW1lbnQuY2xhc3NOYW1lID0gXCJpbmxpbmUtYmxvY2tcIjtcblxuICAgIHN0YXR1c0Jhci5hZGRMZWZ0VGlsZSh7XG4gICAgICBpdGVtOiBzdGF0dXNCYXJFbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IDEwMFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25DbGljayA9IHRoaXMuc2hvd0tlcm5lbENvbW1hbmRzLmJpbmQodGhpcyk7XG5cbiAgICByZWFjdEZhY3RvcnkoXG4gICAgICA8U3RhdHVzQmFyIHN0b3JlPXtzdG9yZX0gb25DbGljaz17b25DbGlja30gLz4sXG4gICAgICBzdGF0dXNCYXJFbGVtZW50XG4gICAgKTtcblxuICAgIC8vIFdlIHNob3VsZCByZXR1cm4gYSBkaXNwb3NhYmxlIGhlcmUgYnV0IEF0b20gZmFpbHMgd2hpbGUgY2FsbGluZyAuZGVzdHJveSgpXG4gICAgLy8gcmV0dXJuIG5ldyBEaXNwb3NhYmxlKHN0YXR1c0JhclRpbGUuZGVzdHJveSk7XG4gIH0sXG5cbiAgcHJvdmlkZSgpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4uYXV0b2NvbXBsZXRlXCIpID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gQXV0b2NvbXBsZXRlUHJvdmlkZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgc2hvd0tlcm5lbENvbW1hbmRzKCkge1xuICAgIGlmICghdGhpcy5zaWduYWxMaXN0Vmlldykge1xuICAgICAgdGhpcy5zaWduYWxMaXN0VmlldyA9IG5ldyBTaWduYWxMaXN0VmlldygpO1xuICAgICAgdGhpcy5zaWduYWxMaXN0Vmlldy5vbkNvbmZpcm1lZCA9IChrZXJuZWxDb21tYW5kOiB7IGNvbW1hbmQ6IHN0cmluZyB9KSA9PlxuICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoa2VybmVsQ29tbWFuZCk7XG4gICAgfVxuICAgIHRoaXMuc2lnbmFsTGlzdFZpZXcudG9nZ2xlKCk7XG4gIH0sXG5cbiAgY29ubmVjdFRvRXhpc3RpbmdLZXJuZWwoKSB7XG4gICAgaWYgKCF0aGlzLmV4aXN0aW5nS2VybmVsUGlja2VyKSB7XG4gICAgICB0aGlzLmV4aXN0aW5nS2VybmVsUGlja2VyID0gbmV3IEV4aXN0aW5nS2VybmVsUGlja2VyKCk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdLZXJuZWxQaWNrZXIudG9nZ2xlKCk7XG4gIH0sXG5cbiAgaGFuZGxlS2VybmVsQ29tbWFuZCh7XG4gICAgY29tbWFuZCxcbiAgICBwYXlsb2FkXG4gIH06IHtcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgcGF5bG9hZDogP0tlcm5lbHNwZWNcbiAgfSkge1xuICAgIGxvZyhcImhhbmRsZUtlcm5lbENvbW1hbmQ6XCIsIGFyZ3VtZW50cyk7XG5cbiAgICBjb25zdCB7IGtlcm5lbCwgZ3JhbW1hciB9ID0gc3RvcmU7XG5cbiAgICBpZiAoIWdyYW1tYXIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIlVuZGVmaW5lZCBncmFtbWFyXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICgha2VybmVsKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYE5vIHJ1bm5pbmcga2VybmVsIGZvciBncmFtbWFyIFxcYCR7Z3JhbW1hci5uYW1lfVxcYCBmb3VuZGA7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQgPT09IFwiaW50ZXJydXB0LWtlcm5lbFwiKSB7XG4gICAgICBrZXJuZWwuaW50ZXJydXB0KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInJlc3RhcnQta2VybmVsXCIpIHtcbiAgICAgIGtlcm5lbC5yZXN0YXJ0KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInNodXRkb3duLWtlcm5lbFwiKSB7XG4gICAgICBzdG9yZS5tYXJrZXJzLmNsZWFyKCk7XG4gICAgICAvLyBOb3RlIHRoYXQgZGVzdHJveSBhbG9uZSBkb2VzIG5vdCBzaHV0IGRvd24gYSBXU0tlcm5lbFxuICAgICAga2VybmVsLnNodXRkb3duKCk7XG4gICAgICBrZXJuZWwuZGVzdHJveSgpO1xuICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gXCJyZW5hbWUta2VybmVsXCIgJiYga2VybmVsLnByb21wdFJlbmFtZSkge1xuICAgICAgLy8gJEZsb3dGaXhNZSBXaWxsIG9ubHkgYmUgY2FsbGVkIGlmIHJlbW90ZSBrZXJuZWxcbiAgICAgIGlmIChrZXJuZWwgaW5zdGFuY2VvZiBXU0tlcm5lbCkga2VybmVsLnByb21wdFJlbmFtZSgpO1xuICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PT0gXCJkaXNjb25uZWN0LWtlcm5lbFwiKSB7XG4gICAgICBzdG9yZS5tYXJrZXJzLmNsZWFyKCk7XG4gICAgICBrZXJuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgfSxcblxuICBjcmVhdGVSZXN1bHRCdWJibGUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGNvZGU6IHN0cmluZywgcm93OiBudW1iZXIpIHtcbiAgICBjb25zdCB7IGdyYW1tYXIsIGZpbGVQYXRoLCBrZXJuZWwgfSA9IHN0b3JlO1xuICAgIGlmICghZ3JhbW1hciB8fCAhZmlsZVBhdGgpIHJldHVybjtcblxuICAgIGlmIChrZXJuZWwpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGtlcm5lbCwgY29kZSwgcm93KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBrZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsRm9yKFxuICAgICAgZ3JhbW1hcixcbiAgICAgIGVkaXRvcixcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgKGtlcm5lbDogWk1RS2VybmVsKSA9PiB7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGtlcm5lbCwgY29kZSwgcm93KTtcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIF9jcmVhdGVSZXN1bHRCdWJibGUoXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAga2VybmVsOiBLZXJuZWwsXG4gICAgY29kZTogc3RyaW5nLFxuICAgIHJvdzogbnVtYmVyXG4gICkge1xuICAgIGlmIChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpIGluc3RhbmNlb2YgV2F0Y2hlc1BhbmUpIHtcbiAgICAgIGtlcm5lbC53YXRjaGVzU3RvcmUucnVuKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGdsb2JhbE91dHB1dFN0b3JlID1cbiAgICAgIGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLm91dHB1dEFyZWFEZWZhdWx0XCIpIHx8XG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKS5maW5kKGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmUpXG4gICAgICAgID8ga2VybmVsLm91dHB1dFN0b3JlXG4gICAgICAgIDogbnVsbDtcblxuICAgIGNvbnN0IHsgb3V0cHV0U3RvcmUgfSA9IG5ldyBSZXN1bHRWaWV3KFxuICAgICAgc3RvcmUubWFya2VycyxcbiAgICAgIGtlcm5lbCxcbiAgICAgIGVkaXRvcixcbiAgICAgIHJvdyxcbiAgICAgICFnbG9iYWxPdXRwdXRTdG9yZVxuICAgICk7XG5cbiAgICBrZXJuZWwuZXhlY3V0ZShjb2RlLCBhc3luYyByZXN1bHQgPT4ge1xuICAgICAgb3V0cHV0U3RvcmUuYXBwZW5kT3V0cHV0KHJlc3VsdCk7XG4gICAgICBpZiAoZ2xvYmFsT3V0cHV0U3RvcmUpIHtcbiAgICAgICAgZ2xvYmFsT3V0cHV0U3RvcmUuYXBwZW5kT3V0cHV0KHJlc3VsdCk7XG4gICAgICAgIG9wZW5PclNob3dEb2NrKE9VVFBVVF9BUkVBX1VSSSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVzdGFydEtlcm5lbEFuZFJlRXZhbHVhdGVCdWJibGVzKCkge1xuICAgIGNvbnN0IHsgZWRpdG9yLCBrZXJuZWwsIG1hcmtlcnMgfSA9IHN0b3JlO1xuXG4gICAgbGV0IGJyZWFrcG9pbnRzID0gW107XG4gICAgbWFya2Vycy5tYXJrZXJzLmZvckVhY2goKGJ1YmJsZTogUmVzdWx0VmlldykgPT4ge1xuICAgICAgYnJlYWtwb2ludHMucHVzaChidWJibGUubWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQpO1xuICAgIH0pO1xuICAgIHN0b3JlLm1hcmtlcnMuY2xlYXIoKTtcblxuICAgIGlmICghZWRpdG9yIHx8ICFrZXJuZWwpIHtcbiAgICAgIHRoaXMucnVuQWxsKGJyZWFrcG9pbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAga2VybmVsLnJlc3RhcnQoKCkgPT4gdGhpcy5ydW5BbGwoYnJlYWtwb2ludHMpKTtcbiAgICB9XG4gIH0sXG5cbiAgdG9nZ2xlQnViYmxlKCkge1xuICAgIGNvbnN0IHsgZWRpdG9yLCBrZXJuZWwsIG1hcmtlcnMgfSA9IHN0b3JlO1xuICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5nZXRCdWZmZXJSb3dSYW5nZSgpO1xuXG4gICAgZm9yIChsZXQgcm93ID0gc3RhcnRSb3c7IHJvdyA8PSBlbmRSb3c7IHJvdysrKSB7XG4gICAgICBjb25zdCBkZXN0cm95ZWQgPSBtYXJrZXJzLmNsZWFyT25Sb3cocm93KTtcblxuICAgICAgaWYgKCFkZXN0cm95ZWQpIHtcbiAgICAgICAgY29uc3QgeyBvdXRwdXRTdG9yZSB9ID0gbmV3IFJlc3VsdFZpZXcoXG4gICAgICAgICAgbWFya2VycyxcbiAgICAgICAgICBrZXJuZWwsXG4gICAgICAgICAgZWRpdG9yLFxuICAgICAgICAgIHJvdyxcbiAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIG91dHB1dFN0b3JlLnN0YXR1cyA9IFwiZW1wdHlcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgcnVuKG1vdmVEb3duOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBzdG9yZS5lZGl0b3I7XG4gICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICBjb25zdCBjb2RlQmxvY2sgPSBjb2RlTWFuYWdlci5maW5kQ29kZUJsb2NrKGVkaXRvcik7XG4gICAgaWYgKCFjb2RlQmxvY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBbY29kZSwgcm93XSA9IGNvZGVCbG9jaztcbiAgICBpZiAoY29kZSkge1xuICAgICAgaWYgKG1vdmVEb3duID09PSB0cnVlKSB7XG4gICAgICAgIGNvZGVNYW5hZ2VyLm1vdmVEb3duKGVkaXRvciwgcm93KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JlYXRlUmVzdWx0QnViYmxlKGVkaXRvciwgY29kZSwgcm93KTtcbiAgICB9XG4gIH0sXG5cbiAgcnVuQWxsKGJyZWFrcG9pbnRzOiA/QXJyYXk8YXRvbSRQb2ludD4pIHtcbiAgICBjb25zdCB7IGVkaXRvciwga2VybmVsLCBncmFtbWFyLCBmaWxlUGF0aCB9ID0gc3RvcmU7XG4gICAgaWYgKCFlZGl0b3IgfHwgIWdyYW1tYXIgfHwgIWZpbGVQYXRoKSByZXR1cm47XG4gICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZWRpdG9yLmdldEdyYW1tYXIoKSkpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgJ1wiUnVuIEFsbFwiIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHRoaXMgZmlsZSB0eXBlISdcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGVkaXRvciAmJiBrZXJuZWwpIHtcbiAgICAgIHRoaXMuX3J1bkFsbChlZGl0b3IsIGtlcm5lbCwgYnJlYWtwb2ludHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGtlcm5lbE1hbmFnZXIuc3RhcnRLZXJuZWxGb3IoXG4gICAgICBncmFtbWFyLFxuICAgICAgZWRpdG9yLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICAoa2VybmVsOiBaTVFLZXJuZWwpID0+IHtcbiAgICAgICAgdGhpcy5fcnVuQWxsKGVkaXRvciwga2VybmVsLCBicmVha3BvaW50cyk7XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICBfcnVuQWxsKFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIGtlcm5lbDogS2VybmVsLFxuICAgIGJyZWFrcG9pbnRzPzogQXJyYXk8YXRvbSRQb2ludD5cbiAgKSB7XG4gICAgbGV0IGNlbGxzID0gY29kZU1hbmFnZXIuZ2V0Q2VsbHMoZWRpdG9yLCBicmVha3BvaW50cyk7XG4gICAgXy5mb3JFYWNoKFxuICAgICAgY2VsbHMsXG4gICAgICAoeyBzdGFydCwgZW5kIH06IHsgc3RhcnQ6IGF0b20kUG9pbnQsIGVuZDogYXRvbSRQb2ludCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSBjb2RlTWFuYWdlci5nZXRUZXh0SW5SYW5nZShlZGl0b3IsIHN0YXJ0LCBlbmQpO1xuICAgICAgICBjb25zdCBlbmRSb3cgPSBjb2RlTWFuYWdlci5lc2NhcGVCbGFua1Jvd3MoZWRpdG9yLCBzdGFydC5yb3csIGVuZC5yb3cpO1xuICAgICAgICB0aGlzLl9jcmVhdGVSZXN1bHRCdWJibGUoZWRpdG9yLCBrZXJuZWwsIGNvZGUsIGVuZFJvdyk7XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICBydW5BbGxBYm92ZSgpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBzdG9yZS5lZGl0b3I7IC8vIHRvIG1ha2UgZmxvdyBoYXBweVxuICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZWRpdG9yLmdldEdyYW1tYXIoKSkpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgJ1wiUnVuIEFsbCBBYm92ZVwiIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHRoaXMgZmlsZSB0eXBlISdcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKTtcbiAgICBjb25zdCByb3cgPSBjb2RlTWFuYWdlci5lc2NhcGVCbGFua1Jvd3MoZWRpdG9yLCAwLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpO1xuICAgIGNvbnN0IGNvZGUgPSBjb2RlTWFuYWdlci5nZXRSb3dzKGVkaXRvciwgMCwgcm93KTtcblxuICAgIGlmIChjb2RlKSB7XG4gICAgICB0aGlzLmNyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGNvZGUsIHJvdyk7XG4gICAgfVxuICB9LFxuXG4gIHJ1bkNlbGwobW92ZURvd246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGVkaXRvciA9IHN0b3JlLmVkaXRvcjtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gY29kZU1hbmFnZXIuZ2V0Q3VycmVudENlbGwoZWRpdG9yKTtcbiAgICBjb25zdCBjb2RlID0gY29kZU1hbmFnZXIuZ2V0VGV4dEluUmFuZ2UoZWRpdG9yLCBzdGFydCwgZW5kKTtcbiAgICBjb25zdCBlbmRSb3cgPSBjb2RlTWFuYWdlci5lc2NhcGVCbGFua1Jvd3MoZWRpdG9yLCBzdGFydC5yb3csIGVuZC5yb3cpO1xuXG4gICAgaWYgKGNvZGUpIHtcbiAgICAgIGlmIChtb3ZlRG93biA9PT0gdHJ1ZSkge1xuICAgICAgICBjb2RlTWFuYWdlci5tb3ZlRG93bihlZGl0b3IsIGVuZFJvdyk7XG4gICAgICB9XG4gICAgICB0aGlzLmNyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGNvZGUsIGVuZFJvdyk7XG4gICAgfVxuICB9LFxuXG4gIHN0YXJ0Wk1RS2VybmVsKCkge1xuICAgIGtlcm5lbE1hbmFnZXJcbiAgICAgIC5nZXRBbGxLZXJuZWxTcGVjc0ZvckdyYW1tYXIoc3RvcmUuZ3JhbW1hcilcbiAgICAgIC50aGVuKGtlcm5lbFNwZWNzID0+IHtcbiAgICAgICAgaWYgKHRoaXMua2VybmVsUGlja2VyKSB7XG4gICAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIua2VybmVsU3BlY3MgPSBrZXJuZWxTcGVjcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmtlcm5lbFBpY2tlciA9IG5ldyBLZXJuZWxQaWNrZXIoa2VybmVsU3BlY3MpO1xuXG4gICAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIub25Db25maXJtZWQgPSAoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBlZGl0b3IsIGdyYW1tYXIsIGZpbGVQYXRoIH0gPSBzdG9yZTtcbiAgICAgICAgICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyIHx8ICFmaWxlUGF0aCkgcmV0dXJuO1xuICAgICAgICAgICAgc3RvcmUubWFya2Vycy5jbGVhcigpO1xuXG4gICAgICAgICAgICBrZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsKGtlcm5lbFNwZWMsIGdyYW1tYXIsIGVkaXRvciwgZmlsZVBhdGgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmtlcm5lbFBpY2tlci50b2dnbGUoKTtcbiAgICAgIH0pO1xuICB9LFxuXG4gIGNvbm5lY3RUb1dTS2VybmVsKCkge1xuICAgIGlmICghdGhpcy53c0tlcm5lbFBpY2tlcikge1xuICAgICAgdGhpcy53c0tlcm5lbFBpY2tlciA9IG5ldyBXU0tlcm5lbFBpY2tlcigoa2VybmVsOiBLZXJuZWwpID0+IHtcbiAgICAgICAgc3RvcmUubWFya2Vycy5jbGVhcigpO1xuICAgICAgICBjb25zdCB7IGVkaXRvciwgZ3JhbW1hciwgZmlsZVBhdGggfSA9IHN0b3JlO1xuICAgICAgICBpZiAoIWVkaXRvciB8fCAhZ3JhbW1hciB8fCAhZmlsZVBhdGgpIHJldHVybjtcblxuICAgICAgICBpZiAoa2VybmVsIGluc3RhbmNlb2YgWk1RS2VybmVsKSBrZXJuZWwuZGVzdHJveSgpO1xuXG4gICAgICAgIHN0b3JlLm5ld0tlcm5lbChrZXJuZWwsIGZpbGVQYXRoLCBlZGl0b3IsIGdyYW1tYXIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy53c0tlcm5lbFBpY2tlci50b2dnbGUoKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMpID0+XG4gICAgICBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyKGtlcm5lbFNwZWMsIHN0b3JlLmdyYW1tYXIpXG4gICAgKTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgSHlkcm9nZW47XG4iXX0=