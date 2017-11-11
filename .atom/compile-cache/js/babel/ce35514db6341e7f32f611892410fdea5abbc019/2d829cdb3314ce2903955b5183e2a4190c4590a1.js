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

      if (_store2["default"].runningKernels.size != 0) {
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
      "hydrogen:select-kernel": function hydrogenSelectKernel() {
        return _this.showKernelPicker();
      },
      "hydrogen:connect-to-remote-kernel": function hydrogenConnectToRemoteKernel() {
        return _this.showWSKernelPicker();
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
      }
    }));

    _store2["default"].subscriptions.add(
    // Destroy any Panes when the package is deactivated.
    new _atom.Disposable(function () {
      atom.workspace.getPaneItems().forEach(function (item) {
        if (item instanceof _panesInspector2["default"] || item instanceof _panesWatches2["default"] || item instanceof _panesOutputArea2["default"]) {
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

      if (command === "switch-kernel") {
        if (!payload) return;
        _store2["default"].markers.clear();
        if (kernel) kernel.destroy();
        _kernelManager2["default"].startKernel(payload, grammar);
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

    if (!_store2["default"].grammar) return;

    if (_store2["default"].kernel) {
      this._createResultBubble(editor, _store2["default"].kernel, code, row);
      return;
    }

    _kernelManager2["default"].startKernelFor(_store2["default"].grammar, editor, function (kernel) {
      _this3._createResultBubble(editor, kernel, code, row);
    });
  },

  _createResultBubble: function _createResultBubble(editor, kernel, code, row) {
    if (atom.workspace.getActivePaneItem() instanceof _panesWatches2["default"]) {
      kernel.watchesStore.run();
      return;
    }
    var globalOutputStore = atom.workspace.getPaneItems().find(function (item) {
      return item instanceof _panesOutputArea2["default"];
    }) ? kernel.outputStore : null;

    var _ref4 = new _componentsResultView2["default"](_store2["default"].markers, kernel, editor, row, !globalOutputStore);

    var outputStore = _ref4.outputStore;

    kernel.execute(code, _asyncToGenerator(function* (result) {
      outputStore.appendOutput(result);
      if (globalOutputStore) {
        globalOutputStore.appendOutput(result);

        if (_store2["default"].kernel !== kernel) return;

        var container = atom.workspace.paneContainerForURI(_utils.OUTPUT_AREA_URI);
        var pane = atom.workspace.paneForURI(_utils.OUTPUT_AREA_URI);
        if (container && container.isVisible && !container.isVisible() || pane && pane.itemForURI(_utils.OUTPUT_AREA_URI) !== pane.getActiveItem()) {
          yield atom.workspace.open(_utils.OUTPUT_AREA_URI, { searchAllPanes: true });
          (0, _utils.focus)(_store2["default"].editor);
        }
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

    if (!editor || !grammar) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All" is not supported for this file type!');
      return;
    }

    if (editor && kernel) {
      this._runAll(editor, kernel, breakpoints);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, function (kernel) {
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

  showKernelPicker: function showKernelPicker() {
    var _this7 = this;

    _kernelManager2["default"].getAllKernelSpecsForGrammar(_store2["default"].grammar, function (kernelSpecs) {
      if (_this7.kernelPicker) {
        _this7.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        _this7.kernelPicker = new _kernelPicker2["default"](kernelSpecs);

        _this7.kernelPicker.onConfirmed = function (kernelSpec) {
          return _this7.handleKernelCommand({
            command: "switch-kernel",
            payload: kernelSpec
          });
        };
      }

      _this7.kernelPicker.toggle();
    });
  },

  showWSKernelPicker: function showWSKernelPicker() {
    if (!this.wsKernelPicker) {
      this.wsKernelPicker = new _wsKernelPicker2["default"](function (kernel) {
        _store2["default"].markers.clear();

        if (kernel instanceof _zmqKernel2["default"]) kernel.destroy();

        _store2["default"].newKernel(kernel);
      });
    }

    this.wsKernelPicker.toggle(function (kernelSpec) {
      return _kernelManager2["default"].kernelSpecProvidesGrammar(kernelSpec, _store2["default"].grammar);
    });
  }
};

exports["default"] = Hydrogen;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFRTyxNQUFNOztzQkFFQyxRQUFROzs7O29CQUNFLE1BQU07O3FCQUNaLE9BQU87Ozs7NEJBRUEsaUJBQWlCOzs7OzhCQUNmLG9CQUFvQjs7Ozs4QkFDcEIsb0JBQW9COzs7OzJCQUNsQixnQkFBZ0I7O0lBQWpDLFdBQVc7O21DQUVELHdCQUF3Qjs7OztvQ0FDdkIsMEJBQTBCOzs7O21DQUMzQix5QkFBeUI7Ozs7OEJBRXJCLG1CQUFtQjs7Ozs0QkFDckIsaUJBQWlCOzs7OytCQUNsQixxQkFBcUI7Ozs7d0JBRVosWUFBWTs7cUJBRTFCLFNBQVM7Ozs7MkJBQ0gsZ0JBQWdCOzs7O3NCQUVyQixVQUFVOzs7OzZCQUNILGtCQUFrQjs7Ozt5QkFDdEIsY0FBYzs7Ozt3QkFDZixhQUFhOzs7O29DQUNELHlCQUF5Qjs7Ozt5Q0FDN0IsZ0NBQWdDOzs7O3FCQVl0RCxTQUFTOztBQUloQixJQUFNLFFBQVEsR0FBRztBQUNmLFFBQU0sRUFBRSxvQkFBTyxNQUFNOztBQUVyQixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQzs7QUFFN0IsUUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7QUFDdkMsdUJBQU0sYUFBYSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQ3JCLDJCQUEyQixFQUMzQixVQUFDLElBQXNCLEVBQUs7VUFBekIsUUFBUSxHQUFWLElBQXNCLENBQXBCLFFBQVE7VUFBRSxRQUFRLEdBQXBCLElBQXNCLENBQVYsUUFBUTs7QUFDbkIsVUFBSSwwQkFBMEIsRUFBRTtBQUM5QixrQ0FBMEIsR0FBRyxLQUFLLENBQUM7QUFDbkMsZUFBTztPQUNSOztBQUVELFVBQUksbUJBQU0sY0FBYyxDQUFDLElBQUksSUFBSSxDQUFDLEVB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QUFjLEVBQUU7QUFDeEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxnQ0FBbUIsVUFBQyxNQUFNLEVBQWE7QUFDM0QsMkJBQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUV0QixZQUFJLE1BQU0sa0NBQXFCLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVsRCwyQkFBTSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDekIsQ0FBQyxDQUFDO0tBQ0o7O0FBRUQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQyxVQUFVO2FBQ3BDLDJCQUFjLHlCQUF5QixDQUFDLFVBQVUsRUFBRSxtQkFBTSxPQUFPLENBQUM7S0FBQSxDQUNuRSxDQUFDO0dBQ0g7Q0FDRixDQUFDOztxQkFFYSxRQUFRIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHtcbiAgRW1pdHRlcixcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRGlzcG9zYWJsZSxcbiAgUG9pbnQsXG4gIFRleHRFZGl0b3Jcbn0gZnJvbSBcImF0b21cIjtcblxuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgYXV0b3J1biB9IGZyb20gXCJtb2J4XCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBLZXJuZWxQaWNrZXIgZnJvbSBcIi4va2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IFdTS2VybmVsUGlja2VyIGZyb20gXCIuL3dzLWtlcm5lbC1waWNrZXJcIjtcbmltcG9ydCBTaWduYWxMaXN0VmlldyBmcm9tIFwiLi9zaWduYWwtbGlzdC12aWV3XCI7XG5pbXBvcnQgKiBhcyBjb2RlTWFuYWdlciBmcm9tIFwiLi9jb2RlLW1hbmFnZXJcIjtcblxuaW1wb3J0IEluc3BlY3RvciBmcm9tIFwiLi9jb21wb25lbnRzL2luc3BlY3RvclwiO1xuaW1wb3J0IFJlc3VsdFZpZXcgZnJvbSBcIi4vY29tcG9uZW50cy9yZXN1bHQtdmlld1wiO1xuaW1wb3J0IFN0YXR1c0JhciBmcm9tIFwiLi9jb21wb25lbnRzL3N0YXR1cy1iYXJcIjtcblxuaW1wb3J0IEluc3BlY3RvclBhbmUgZnJvbSBcIi4vcGFuZXMvaW5zcGVjdG9yXCI7XG5pbXBvcnQgV2F0Y2hlc1BhbmUgZnJvbSBcIi4vcGFuZXMvd2F0Y2hlc1wiO1xuaW1wb3J0IE91dHB1dFBhbmUgZnJvbSBcIi4vcGFuZXMvb3V0cHV0LWFyZWFcIjtcblxuaW1wb3J0IHsgdG9nZ2xlSW5zcGVjdG9yIH0gZnJvbSBcIi4vY29tbWFuZHNcIjtcblxuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQgT3V0cHV0U3RvcmUgZnJvbSBcIi4vc3RvcmUvb3V0cHV0XCI7XG5cbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQga2VybmVsTWFuYWdlciBmcm9tIFwiLi9rZXJuZWwtbWFuYWdlclwiO1xuaW1wb3J0IFpNUUtlcm5lbCBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5pbXBvcnQgV1NLZXJuZWwgZnJvbSBcIi4vd3Mta2VybmVsXCI7XG5pbXBvcnQgQXV0b2NvbXBsZXRlUHJvdmlkZXIgZnJvbSBcIi4vYXV0b2NvbXBsZXRlLXByb3ZpZGVyXCI7XG5pbXBvcnQgSHlkcm9nZW5Qcm92aWRlciBmcm9tIFwiLi9wbHVnaW4tYXBpL2h5ZHJvZ2VuLXByb3ZpZGVyXCI7XG5pbXBvcnQge1xuICBsb2csXG4gIGZvY3VzLFxuICByZWFjdEZhY3RvcnksXG4gIGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIsXG4gIHJlbmRlckRldlRvb2xzLFxuICBJTlNQRUNUT1JfVVJJLFxuICBXQVRDSEVTX1VSSSxcbiAgT1VUUFVUX0FSRUFfVVJJLFxuICBob3RSZWxvYWRQYWNrYWdlLFxuICBvcGVuT3JTaG93RG9ja1xufSBmcm9tIFwiLi91dGlsc1wiO1xuXG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4va2VybmVsXCI7XG5cbmNvbnN0IEh5ZHJvZ2VuID0ge1xuICBjb25maWc6IENvbmZpZy5zY2hlbWEsXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgIGxldCBza2lwTGFuZ3VhZ2VNYXBwaW5nc0NoYW5nZSA9IGZhbHNlO1xuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoXG4gICAgICAgIFwiSHlkcm9nZW4ubGFuZ3VhZ2VNYXBwaW5nc1wiLFxuICAgICAgICAoeyBuZXdWYWx1ZSwgb2xkVmFsdWUgfSkgPT4ge1xuICAgICAgICAgIGlmIChza2lwTGFuZ3VhZ2VNYXBwaW5nc0NoYW5nZSkge1xuICAgICAgICAgICAgc2tpcExhbmd1YWdlTWFwcGluZ3NDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc3RvcmUucnVubmluZ0tlcm5lbHMuc2l6ZSAhPSAwKSB7XG4gICAgICAgICAgICBza2lwTGFuZ3VhZ2VNYXBwaW5nc0NoYW5nZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChcIkh5ZHJvZ2VuLmxhbmd1YWdlTWFwcGluZ3NcIiwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJIeWRyb2dlblwiLCB7XG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgIFwiYGxhbmd1YWdlTWFwcGluZ3NgIGNhbm5vdCBiZSB1cGRhdGVkIHdoaWxlIGtlcm5lbHMgYXJlIHJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAvLyBlbmFibGUvZGlzYWJsZSBtb2J4LXJlYWN0LWRldnRvb2xzIGxvZ2dpbmdcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFwiSHlkcm9nZW4uZGVidWdcIiwgKHsgbmV3VmFsdWUgfSkgPT5cbiAgICAgICAgcmVuZGVyRGV2VG9vbHMobmV3VmFsdWUpXG4gICAgICApXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pXCIsIHtcbiAgICAgICAgXCJoeWRyb2dlbjpydW5cIjogKCkgPT4gdGhpcy5ydW4oKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tYWxsXCI6ICgpID0+IHRoaXMucnVuQWxsKCksXG4gICAgICAgIFwiaHlkcm9nZW46cnVuLWFsbC1hYm92ZVwiOiAoKSA9PiB0aGlzLnJ1bkFsbEFib3ZlKCksXG4gICAgICAgIFwiaHlkcm9nZW46cnVuLWFuZC1tb3ZlLWRvd25cIjogKCkgPT4gdGhpcy5ydW4odHJ1ZSksXG4gICAgICAgIFwiaHlkcm9nZW46cnVuLWNlbGxcIjogKCkgPT4gdGhpcy5ydW5DZWxsKCksXG4gICAgICAgIFwiaHlkcm9nZW46cnVuLWNlbGwtYW5kLW1vdmUtZG93blwiOiAoKSA9PiB0aGlzLnJ1bkNlbGwodHJ1ZSksXG4gICAgICAgIFwiaHlkcm9nZW46dG9nZ2xlLXdhdGNoZXNcIjogKCkgPT4gYXRvbS53b3Jrc3BhY2UudG9nZ2xlKFdBVENIRVNfVVJJKSxcbiAgICAgICAgXCJoeWRyb2dlbjp0b2dnbGUtb3V0cHV0LWFyZWFcIjogKCkgPT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS50b2dnbGUoT1VUUFVUX0FSRUFfVVJJKSxcbiAgICAgICAgXCJoeWRyb2dlbjpzZWxlY3Qta2VybmVsXCI6ICgpID0+IHRoaXMuc2hvd0tlcm5lbFBpY2tlcigpLFxuICAgICAgICBcImh5ZHJvZ2VuOmNvbm5lY3QtdG8tcmVtb3RlLWtlcm5lbFwiOiAoKSA9PiB0aGlzLnNob3dXU0tlcm5lbFBpY2tlcigpLFxuICAgICAgICBcImh5ZHJvZ2VuOmFkZC13YXRjaFwiOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHN0b3JlLmtlcm5lbCkge1xuICAgICAgICAgICAgc3RvcmUua2VybmVsLndhdGNoZXNTdG9yZS5hZGRXYXRjaEZyb21FZGl0b3Ioc3RvcmUuZWRpdG9yKTtcbiAgICAgICAgICAgIG9wZW5PclNob3dEb2NrKFdBVENIRVNfVVJJKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaHlkcm9nZW46cmVtb3ZlLXdhdGNoXCI6ICgpID0+IHtcbiAgICAgICAgICBpZiAoc3RvcmUua2VybmVsKSB7XG4gICAgICAgICAgICBzdG9yZS5rZXJuZWwud2F0Y2hlc1N0b3JlLnJlbW92ZVdhdGNoKCk7XG4gICAgICAgICAgICBvcGVuT3JTaG93RG9jayhXQVRDSEVTX1VSSSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImh5ZHJvZ2VuOnVwZGF0ZS1rZXJuZWxzXCI6ICgpID0+IGtlcm5lbE1hbmFnZXIudXBkYXRlS2VybmVsU3BlY3MoKSxcbiAgICAgICAgXCJoeWRyb2dlbjp0b2dnbGUtaW5zcGVjdG9yXCI6ICgpID0+IHRvZ2dsZUluc3BlY3RvcihzdG9yZSksXG4gICAgICAgIFwiaHlkcm9nZW46aW50ZXJydXB0LWtlcm5lbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZCh7IGNvbW1hbmQ6IFwiaW50ZXJydXB0LWtlcm5lbFwiIH0pLFxuICAgICAgICBcImh5ZHJvZ2VuOnJlc3RhcnQta2VybmVsXCI6ICgpID0+XG4gICAgICAgICAgdGhpcy5oYW5kbGVLZXJuZWxDb21tYW5kKHsgY29tbWFuZDogXCJyZXN0YXJ0LWtlcm5lbFwiIH0pLFxuICAgICAgICBcImh5ZHJvZ2VuOnJlc3RhcnQta2VybmVsLWFuZC1yZS1ldmFsdWF0ZS1idWJibGVzXCI6ICgpID0+XG4gICAgICAgICAgdGhpcy5yZXN0YXJ0S2VybmVsQW5kUmVFdmFsdWF0ZUJ1YmJsZXMoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpzaHV0ZG93bi1rZXJuZWxcIjogKCkgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiBcInNodXRkb3duLWtlcm5lbFwiIH0pLFxuICAgICAgICBcImh5ZHJvZ2VuOnRvZ2dsZS1idWJibGVcIjogKCkgPT4gdGhpcy50b2dnbGVCdWJibGUoKVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgICAgXCJoeWRyb2dlbjpjbGVhci1yZXN1bHRzXCI6ICgpID0+IHN0b3JlLm1hcmtlcnMuY2xlYXIoKVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgICAgICBcImh5ZHJvZ2VuOmhvdC1yZWxvYWQtcGFja2FnZVwiOiAoKSA9PiBob3RSZWxvYWRQYWNrYWdlKClcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlVGV4dEVkaXRvcihlZGl0b3IgPT4ge1xuICAgICAgICBzdG9yZS51cGRhdGVFZGl0b3IoZWRpdG9yKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgICBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyKCgpID0+IHtcbiAgICAgICAgICAgIHN0b3JlLnNldEdyYW1tYXIoZWRpdG9yKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIGlmIChpc011bHRpbGFuZ3VhZ2VHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpKSB7XG4gICAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgICBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihcbiAgICAgICAgICAgICAgXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcmUuc2V0R3JhbW1hcihlZGl0b3IpO1xuICAgICAgICAgICAgICB9LCA3NSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvclN1YnNjcmlwdGlvbnMpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgdGhpcy5oeWRyb2dlblByb3ZpZGVyID0gbnVsbDtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKHVyaSA9PiB7XG4gICAgICAgIHN3aXRjaCAodXJpKSB7XG4gICAgICAgICAgY2FzZSBJTlNQRUNUT1JfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbnNwZWN0b3JQYW5lKHN0b3JlKTtcbiAgICAgICAgICBjYXNlIFdBVENIRVNfVVJJOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBXYXRjaGVzUGFuZShzdG9yZSk7XG4gICAgICAgICAgY2FzZSBPVVRQVVRfQVJFQV9VUkk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IE91dHB1dFBhbmUoc3RvcmUpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBzdG9yZS5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIC8vIERlc3Ryb3kgYW55IFBhbmVzIHdoZW4gdGhlIHBhY2thZ2UgaXMgZGVhY3RpdmF0ZWQuXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIEluc3BlY3RvclBhbmUgfHxcbiAgICAgICAgICAgIGl0ZW0gaW5zdGFuY2VvZiBXYXRjaGVzUGFuZSB8fFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmVcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGl0ZW0uZGVzdHJveSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICByZW5kZXJEZXZUb29scyhhdG9tLmNvbmZpZy5nZXQoXCJIeWRyb2dlbi5kZWJ1Z1wiKSA9PT0gdHJ1ZSk7XG5cbiAgICBhdXRvcnVuKCgpID0+IHtcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KFwiZGlkLWNoYW5nZS1rZXJuZWxcIiwgc3RvcmUua2VybmVsKTtcbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHN0b3JlLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlSHlkcm9nZW4oKSB7XG4gICAgaWYgKCF0aGlzLmh5ZHJvZ2VuUHJvdmlkZXIpIHtcbiAgICAgIHRoaXMuaHlkcm9nZW5Qcm92aWRlciA9IG5ldyBIeWRyb2dlblByb3ZpZGVyKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmh5ZHJvZ2VuUHJvdmlkZXI7XG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKSB7XG4gICAgY29uc3Qgc3RhdHVzQmFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc3RhdHVzQmFyRWxlbWVudC5jbGFzc05hbWUgPSBcImlubGluZS1ibG9ja1wiO1xuXG4gICAgc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtcbiAgICAgIGl0ZW06IHN0YXR1c0JhckVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogMTAwXG4gICAgfSk7XG5cbiAgICBjb25zdCBvbkNsaWNrID0gdGhpcy5zaG93S2VybmVsQ29tbWFuZHMuYmluZCh0aGlzKTtcblxuICAgIHJlYWN0RmFjdG9yeShcbiAgICAgIDxTdGF0dXNCYXIgc3RvcmU9e3N0b3JlfSBvbkNsaWNrPXtvbkNsaWNrfSAvPixcbiAgICAgIHN0YXR1c0JhckVsZW1lbnRcbiAgICApO1xuXG4gICAgLy8gV2Ugc2hvdWxkIHJldHVybiBhIGRpc3Bvc2FibGUgaGVyZSBidXQgQXRvbSBmYWlscyB3aGlsZSBjYWxsaW5nIC5kZXN0cm95KClcbiAgICAvLyByZXR1cm4gbmV3IERpc3Bvc2FibGUoc3RhdHVzQmFyVGlsZS5kZXN0cm95KTtcbiAgfSxcblxuICBwcm92aWRlKCkge1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoXCJIeWRyb2dlbi5hdXRvY29tcGxldGVcIikgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBBdXRvY29tcGxldGVQcm92aWRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICBzaG93S2VybmVsQ29tbWFuZHMoKSB7XG4gICAgaWYgKCF0aGlzLnNpZ25hbExpc3RWaWV3KSB7XG4gICAgICB0aGlzLnNpZ25hbExpc3RWaWV3ID0gbmV3IFNpZ25hbExpc3RWaWV3KCk7XG4gICAgICB0aGlzLnNpZ25hbExpc3RWaWV3Lm9uQ29uZmlybWVkID0gKGtlcm5lbENvbW1hbmQ6IHtcbiAgICAgICAgY29tbWFuZDogc3RyaW5nLFxuICAgICAgICBwYXlsb2FkOiA/S2VybmVsc3BlY1xuICAgICAgfSkgPT4gdGhpcy5oYW5kbGVLZXJuZWxDb21tYW5kKGtlcm5lbENvbW1hbmQpO1xuICAgIH1cbiAgICB0aGlzLnNpZ25hbExpc3RWaWV3LnRvZ2dsZSgpO1xuICB9LFxuXG4gIGhhbmRsZUtlcm5lbENvbW1hbmQoe1xuICAgIGNvbW1hbmQsXG4gICAgcGF5bG9hZFxuICB9OiB7XG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIHBheWxvYWQ6ID9LZXJuZWxzcGVjXG4gIH0pIHtcbiAgICBsb2coXCJoYW5kbGVLZXJuZWxDb21tYW5kOlwiLCBhcmd1bWVudHMpO1xuXG4gICAgY29uc3QgeyBrZXJuZWwsIGdyYW1tYXIgfSA9IHN0b3JlO1xuXG4gICAgaWYgKCFncmFtbWFyKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJVbmRlZmluZWQgZ3JhbW1hclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY29tbWFuZCA9PT0gXCJzd2l0Y2gta2VybmVsXCIpIHtcbiAgICAgIGlmICghcGF5bG9hZCkgcmV0dXJuO1xuICAgICAgc3RvcmUubWFya2Vycy5jbGVhcigpO1xuICAgICAgaWYgKGtlcm5lbCkga2VybmVsLmRlc3Ryb3koKTtcbiAgICAgIGtlcm5lbE1hbmFnZXIuc3RhcnRLZXJuZWwocGF5bG9hZCwgZ3JhbW1hcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFrZXJuZWwpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgTm8gcnVubmluZyBrZXJuZWwgZm9yIGdyYW1tYXIgXFxgJHtncmFtbWFyLm5hbWV9XFxgIGZvdW5kYDtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoY29tbWFuZCA9PT0gXCJpbnRlcnJ1cHQta2VybmVsXCIpIHtcbiAgICAgIGtlcm5lbC5pbnRlcnJ1cHQoKTtcbiAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwicmVzdGFydC1rZXJuZWxcIikge1xuICAgICAga2VybmVsLnJlc3RhcnQoKTtcbiAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwic2h1dGRvd24ta2VybmVsXCIpIHtcbiAgICAgIHN0b3JlLm1hcmtlcnMuY2xlYXIoKTtcbiAgICAgIC8vIE5vdGUgdGhhdCBkZXN0cm95IGFsb25lIGRvZXMgbm90IHNodXQgZG93biBhIFdTS2VybmVsXG4gICAgICBrZXJuZWwuc2h1dGRvd24oKTtcbiAgICAgIGtlcm5lbC5kZXN0cm95KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInJlbmFtZS1rZXJuZWxcIiAmJiBrZXJuZWwucHJvbXB0UmVuYW1lKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lIFdpbGwgb25seSBiZSBjYWxsZWQgaWYgcmVtb3RlIGtlcm5lbFxuICAgICAgaWYgKGtlcm5lbCBpbnN0YW5jZW9mIFdTS2VybmVsKSBrZXJuZWwucHJvbXB0UmVuYW1lKCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcImRpc2Nvbm5lY3Qta2VybmVsXCIpIHtcbiAgICAgIHN0b3JlLm1hcmtlcnMuY2xlYXIoKTtcbiAgICAgIGtlcm5lbC5kZXN0cm95KCk7XG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgY29kZTogc3RyaW5nLCByb3c6IG51bWJlcikge1xuICAgIGlmICghc3RvcmUuZ3JhbW1hcikgcmV0dXJuO1xuXG4gICAgaWYgKHN0b3JlLmtlcm5lbCkge1xuICAgICAgdGhpcy5fY3JlYXRlUmVzdWx0QnViYmxlKGVkaXRvciwgc3RvcmUua2VybmVsLCBjb2RlLCByb3cpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGtlcm5lbE1hbmFnZXIuc3RhcnRLZXJuZWxGb3Ioc3RvcmUuZ3JhbW1hciwgZWRpdG9yLCAoa2VybmVsOiBaTVFLZXJuZWwpID0+IHtcbiAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGtlcm5lbCwgY29kZSwgcm93KTtcbiAgICB9KTtcbiAgfSxcblxuICBfY3JlYXRlUmVzdWx0QnViYmxlKFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIGtlcm5lbDogS2VybmVsLFxuICAgIGNvZGU6IHN0cmluZyxcbiAgICByb3c6IG51bWJlclxuICApIHtcbiAgICBpZiAoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSBpbnN0YW5jZW9mIFdhdGNoZXNQYW5lKSB7XG4gICAgICBrZXJuZWwud2F0Y2hlc1N0b3JlLnJ1bigpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBnbG9iYWxPdXRwdXRTdG9yZSA9IGF0b20ud29ya3NwYWNlXG4gICAgICAuZ2V0UGFuZUl0ZW1zKClcbiAgICAgIC5maW5kKGl0ZW0gPT4gaXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmUpXG4gICAgICA/IGtlcm5lbC5vdXRwdXRTdG9yZVxuICAgICAgOiBudWxsO1xuXG4gICAgY29uc3QgeyBvdXRwdXRTdG9yZSB9ID0gbmV3IFJlc3VsdFZpZXcoXG4gICAgICBzdG9yZS5tYXJrZXJzLFxuICAgICAga2VybmVsLFxuICAgICAgZWRpdG9yLFxuICAgICAgcm93LFxuICAgICAgIWdsb2JhbE91dHB1dFN0b3JlXG4gICAgKTtcblxuICAgIGtlcm5lbC5leGVjdXRlKGNvZGUsIGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICBvdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQocmVzdWx0KTtcbiAgICAgIGlmIChnbG9iYWxPdXRwdXRTdG9yZSkge1xuICAgICAgICBnbG9iYWxPdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQocmVzdWx0KTtcblxuICAgICAgICBpZiAoc3RvcmUua2VybmVsICE9PSBrZXJuZWwpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9yVVJJKE9VVFBVVF9BUkVBX1VSSSk7XG4gICAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKE9VVFBVVF9BUkVBX1VSSSk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAoY29udGFpbmVyICYmIGNvbnRhaW5lci5pc1Zpc2libGUgJiYgIWNvbnRhaW5lci5pc1Zpc2libGUoKSkgfHxcbiAgICAgICAgICAocGFuZSAmJiBwYW5lLml0ZW1Gb3JVUkkoT1VUUFVUX0FSRUFfVVJJKSAhPT0gcGFuZS5nZXRBY3RpdmVJdGVtKCkpXG4gICAgICAgICkge1xuICAgICAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oT1VUUFVUX0FSRUFfVVJJLCB7IHNlYXJjaEFsbFBhbmVzOiB0cnVlIH0pO1xuICAgICAgICAgIGZvY3VzKHN0b3JlLmVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICByZXN0YXJ0S2VybmVsQW5kUmVFdmFsdWF0ZUJ1YmJsZXMoKSB7XG4gICAgY29uc3QgeyBlZGl0b3IsIGtlcm5lbCwgbWFya2VycyB9ID0gc3RvcmU7XG5cbiAgICBsZXQgYnJlYWtwb2ludHMgPSBbXTtcbiAgICBtYXJrZXJzLm1hcmtlcnMuZm9yRWFjaCgoYnViYmxlOiBSZXN1bHRWaWV3KSA9PiB7XG4gICAgICBicmVha3BvaW50cy5wdXNoKGJ1YmJsZS5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydCk7XG4gICAgfSk7XG4gICAgc3RvcmUubWFya2Vycy5jbGVhcigpO1xuXG4gICAgaWYgKCFlZGl0b3IgfHwgIWtlcm5lbCkge1xuICAgICAgdGhpcy5ydW5BbGwoYnJlYWtwb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXJuZWwucmVzdGFydCgoKSA9PiB0aGlzLnJ1bkFsbChicmVha3BvaW50cykpO1xuICAgIH1cbiAgfSxcblxuICB0b2dnbGVCdWJibGUoKSB7XG4gICAgY29uc3QgeyBlZGl0b3IsIGtlcm5lbCwgbWFya2VycyB9ID0gc3RvcmU7XG4gICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICBjb25zdCBbc3RhcnRSb3csIGVuZFJvd10gPSBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmdldEJ1ZmZlclJvd1JhbmdlKCk7XG5cbiAgICBmb3IgKGxldCByb3cgPSBzdGFydFJvdzsgcm93IDw9IGVuZFJvdzsgcm93KyspIHtcbiAgICAgIGNvbnN0IGRlc3Ryb3llZCA9IG1hcmtlcnMuY2xlYXJPblJvdyhyb3cpO1xuXG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBjb25zdCB7IG91dHB1dFN0b3JlIH0gPSBuZXcgUmVzdWx0VmlldyhcbiAgICAgICAgICBtYXJrZXJzLFxuICAgICAgICAgIGtlcm5lbCxcbiAgICAgICAgICBlZGl0b3IsXG4gICAgICAgICAgcm93LFxuICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgb3V0cHV0U3RvcmUuc3RhdHVzID0gXCJlbXB0eVwiO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBydW4obW92ZURvd246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGVkaXRvciA9IHN0b3JlLmVkaXRvcjtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIGNvbnN0IGNvZGVCbG9jayA9IGNvZGVNYW5hZ2VyLmZpbmRDb2RlQmxvY2soZWRpdG9yKTtcbiAgICBpZiAoIWNvZGVCbG9jaykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IFtjb2RlLCByb3ddID0gY29kZUJsb2NrO1xuICAgIGlmIChjb2RlKSB7XG4gICAgICBpZiAobW92ZURvd24gPT09IHRydWUpIHtcbiAgICAgICAgY29kZU1hbmFnZXIubW92ZURvd24oZWRpdG9yLCByb3cpO1xuICAgICAgfVxuICAgICAgdGhpcy5jcmVhdGVSZXN1bHRCdWJibGUoZWRpdG9yLCBjb2RlLCByb3cpO1xuICAgIH1cbiAgfSxcblxuICBydW5BbGwoYnJlYWtwb2ludHM6ID9BcnJheTxhdG9tJFBvaW50Pikge1xuICAgIGNvbnN0IHsgZWRpdG9yLCBrZXJuZWwsIGdyYW1tYXIgfSA9IHN0b3JlO1xuICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyKSByZXR1cm47XG4gICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZWRpdG9yLmdldEdyYW1tYXIoKSkpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgJ1wiUnVuIEFsbFwiIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHRoaXMgZmlsZSB0eXBlISdcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGVkaXRvciAmJiBrZXJuZWwpIHtcbiAgICAgIHRoaXMuX3J1bkFsbChlZGl0b3IsIGtlcm5lbCwgYnJlYWtwb2ludHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGtlcm5lbE1hbmFnZXIuc3RhcnRLZXJuZWxGb3IoZ3JhbW1hciwgZWRpdG9yLCAoa2VybmVsOiBaTVFLZXJuZWwpID0+IHtcbiAgICAgIHRoaXMuX3J1bkFsbChlZGl0b3IsIGtlcm5lbCwgYnJlYWtwb2ludHMpO1xuICAgIH0pO1xuICB9LFxuXG4gIF9ydW5BbGwoXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAga2VybmVsOiBLZXJuZWwsXG4gICAgYnJlYWtwb2ludHM/OiBBcnJheTxhdG9tJFBvaW50PlxuICApIHtcbiAgICBsZXQgY2VsbHMgPSBjb2RlTWFuYWdlci5nZXRDZWxscyhlZGl0b3IsIGJyZWFrcG9pbnRzKTtcbiAgICBfLmZvckVhY2goXG4gICAgICBjZWxscyxcbiAgICAgICh7IHN0YXJ0LCBlbmQgfTogeyBzdGFydDogYXRvbSRQb2ludCwgZW5kOiBhdG9tJFBvaW50IH0pID0+IHtcbiAgICAgICAgY29uc3QgY29kZSA9IGNvZGVNYW5hZ2VyLmdldFRleHRJblJhbmdlKGVkaXRvciwgc3RhcnQsIGVuZCk7XG4gICAgICAgIGNvbnN0IGVuZFJvdyA9IGNvZGVNYW5hZ2VyLmVzY2FwZUJsYW5rUm93cyhlZGl0b3IsIHN0YXJ0LnJvdywgZW5kLnJvdyk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVJlc3VsdEJ1YmJsZShlZGl0b3IsIGtlcm5lbCwgY29kZSwgZW5kUm93KTtcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIHJ1bkFsbEFib3ZlKCkge1xuICAgIGNvbnN0IGVkaXRvciA9IHN0b3JlLmVkaXRvcjsgLy8gdG8gbWFrZSBmbG93IGhhcHB5XG4gICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICBpZiAoaXNNdWx0aWxhbmd1YWdlR3JhbW1hcihlZGl0b3IuZ2V0R3JhbW1hcigpKSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAnXCJSdW4gQWxsIEFib3ZlXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgdGhpcyBmaWxlIHR5cGUhJ1xuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpO1xuICAgIGNvbnN0IHJvdyA9IGNvZGVNYW5hZ2VyLmVzY2FwZUJsYW5rUm93cyhlZGl0b3IsIDAsIGN1cnNvci5nZXRCdWZmZXJSb3coKSk7XG4gICAgY29uc3QgY29kZSA9IGNvZGVNYW5hZ2VyLmdldFJvd3MoZWRpdG9yLCAwLCByb3cpO1xuXG4gICAgaWYgKGNvZGUpIHtcbiAgICAgIHRoaXMuY3JlYXRlUmVzdWx0QnViYmxlKGVkaXRvciwgY29kZSwgcm93KTtcbiAgICB9XG4gIH0sXG5cbiAgcnVuQ2VsbChtb3ZlRG93bjogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgZWRpdG9yID0gc3RvcmUuZWRpdG9yO1xuICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgY29uc3QgeyBzdGFydCwgZW5kIH0gPSBjb2RlTWFuYWdlci5nZXRDdXJyZW50Q2VsbChlZGl0b3IpO1xuICAgIGNvbnN0IGNvZGUgPSBjb2RlTWFuYWdlci5nZXRUZXh0SW5SYW5nZShlZGl0b3IsIHN0YXJ0LCBlbmQpO1xuICAgIGNvbnN0IGVuZFJvdyA9IGNvZGVNYW5hZ2VyLmVzY2FwZUJsYW5rUm93cyhlZGl0b3IsIHN0YXJ0LnJvdywgZW5kLnJvdyk7XG5cbiAgICBpZiAoY29kZSkge1xuICAgICAgaWYgKG1vdmVEb3duID09PSB0cnVlKSB7XG4gICAgICAgIGNvZGVNYW5hZ2VyLm1vdmVEb3duKGVkaXRvciwgZW5kUm93KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JlYXRlUmVzdWx0QnViYmxlKGVkaXRvciwgY29kZSwgZW5kUm93KTtcbiAgICB9XG4gIH0sXG5cbiAgc2hvd0tlcm5lbFBpY2tlcigpIHtcbiAgICBrZXJuZWxNYW5hZ2VyLmdldEFsbEtlcm5lbFNwZWNzRm9yR3JhbW1hcihzdG9yZS5ncmFtbWFyLCBrZXJuZWxTcGVjcyA9PiB7XG4gICAgICBpZiAodGhpcy5rZXJuZWxQaWNrZXIpIHtcbiAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIua2VybmVsU3BlY3MgPSBrZXJuZWxTcGVjcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMua2VybmVsUGlja2VyID0gbmV3IEtlcm5lbFBpY2tlcihrZXJuZWxTcGVjcyk7XG5cbiAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIub25Db25maXJtZWQgPSAoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoe1xuICAgICAgICAgICAgY29tbWFuZDogXCJzd2l0Y2gta2VybmVsXCIsXG4gICAgICAgICAgICBwYXlsb2FkOiBrZXJuZWxTcGVjXG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMua2VybmVsUGlja2VyLnRvZ2dsZSgpO1xuICAgIH0pO1xuICB9LFxuXG4gIHNob3dXU0tlcm5lbFBpY2tlcigpIHtcbiAgICBpZiAoIXRoaXMud3NLZXJuZWxQaWNrZXIpIHtcbiAgICAgIHRoaXMud3NLZXJuZWxQaWNrZXIgPSBuZXcgV1NLZXJuZWxQaWNrZXIoKGtlcm5lbDogS2VybmVsKSA9PiB7XG4gICAgICAgIHN0b3JlLm1hcmtlcnMuY2xlYXIoKTtcblxuICAgICAgICBpZiAoa2VybmVsIGluc3RhbmNlb2YgWk1RS2VybmVsKSBrZXJuZWwuZGVzdHJveSgpO1xuXG4gICAgICAgIHN0b3JlLm5ld0tlcm5lbChrZXJuZWwpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy53c0tlcm5lbFBpY2tlci50b2dnbGUoKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMpID0+XG4gICAgICBrZXJuZWxNYW5hZ2VyLmtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIoa2VybmVsU3BlYywgc3RvcmUuZ3JhbW1hcilcbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBIeWRyb2dlbjtcbiJdfQ==