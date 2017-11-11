"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = require("./settings");

var CSON = undefined,
    path = undefined,
    selectList = undefined,
    OperationAbortedError = undefined,
    __plus = undefined;
var CLASS_REGISTRY = {};

function _plus() {
  return __plus || (__plus = require("underscore-plus"));
}

var VMP_LOADING_FILE = undefined;
function loadVmpOperationFile(filename) {
  // Call to loadVmpOperationFile can be nested.
  // 1. require("./operator-transform-string")
  // 2. in operator-transform-string.coffee call Base.getClass("Operator") cause operator.coffee required.
  // So we have to save original VMP_LOADING_FILE and restore it after require finished.
  var preserved = VMP_LOADING_FILE;
  VMP_LOADING_FILE = filename;
  require(filename);
  VMP_LOADING_FILE = preserved;
}

var Base = (function () {
  _createClass(Base, [{
    key: "name",
    get: function get() {
      return this.constructor.name;
    }
  }], [{
    key: "commandTable",
    value: null,
    enumerable: true
  }, {
    key: "commandPrefix",
    value: "vim-mode-plus",
    enumerable: true
  }, {
    key: "commandScope",
    value: "atom-text-editor",
    enumerable: true
  }, {
    key: "operationKind",
    value: null,
    enumerable: true
  }, {
    key: "getEditorState",
    value: null,
    // set through init()

    enumerable: true
  }]);

  function Base(vimState) {
    _classCallCheck(this, Base);

    this.requireTarget = false;
    this.requireInput = false;
    this.recordable = false;
    this.repeated = false;
    this.target = null;
    this.operator = null;
    this.count = null;
    this.defaultCount = 1;
    this.input = null;

    this.vimState = vimState;
  }

  // NOTE: initialize() must return `this`

  _createClass(Base, [{
    key: "initialize",
    value: function initialize() {
      return this;
    }

    // Called both on cancel and success
  }, {
    key: "resetState",
    value: function resetState() {}

    // Operation processor execute only when isComplete() return true.
    // If false, operation processor postpone its execution.
  }, {
    key: "isComplete",
    value: function isComplete() {
      if (this.requireInput && this.input == null) {
        return false;
      } else if (this.requireTarget) {
        // When this function is called in Base::constructor
        // tagert is still string like `MoveToRight`, in this case isComplete
        // is not available.
        return !!this.target && this.target.isComplete();
      } else {
        return true; // Set in operator's target( Motion or TextObject )
      }
    }
  }, {
    key: "isAsTargetExceptSelectInVisualMode",
    value: function isAsTargetExceptSelectInVisualMode() {
      return this.operator && !this.operator["instanceof"]("SelectInVisualMode");
    }
  }, {
    key: "abort",
    value: function abort() {
      if (!OperationAbortedError) OperationAbortedError = require("./errors");
      throw new OperationAbortedError("aborted");
    }
  }, {
    key: "getCount",
    value: function getCount() {
      var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      if (this.count == null) {
        this.count = this.vimState.hasCount() ? this.vimState.getCount() : this.defaultCount;
      }
      return this.count + offset;
    }
  }, {
    key: "resetCount",
    value: function resetCount() {
      this.count = null;
    }
  }, {
    key: "countTimes",
    value: function countTimes(last, fn) {
      if (last < 1) return;

      var stopped = false;
      var stop = function stop() {
        return stopped = true;
      };
      for (var count = 1; count <= last; count++) {
        fn({ count: count, isFinal: count === last, stop: stop });
        if (stopped) break;
      }
    }
  }, {
    key: "activateMode",
    value: function activateMode(mode, submode) {
      var _this = this;

      this.onDidFinishOperation(function () {
        return _this.vimState.activate(mode, submode);
      });
    }
  }, {
    key: "activateModeIfNecessary",
    value: function activateModeIfNecessary(mode, submode) {
      if (!this.vimState.isMode(mode, submode)) {
        this.activateMode(mode, submode);
      }
    }
  }, {
    key: "getInstance",
    value: function getInstance(name, properties) {
      return this.constructor.getInstance(this.vimState, name, properties);
    }
  }, {
    key: "cancelOperation",
    value: function cancelOperation() {
      this.vimState.operationStack.cancel(this);
    }
  }, {
    key: "processOperation",
    value: function processOperation() {
      this.vimState.operationStack.process();
    }
  }, {
    key: "focusSelectList",
    value: function focusSelectList() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.onDidCancelSelectList(function () {
        return _this2.cancelOperation();
      });
      if (!selectList) {
        selectList = new (require("./select-list"))();
      }
      selectList.show(this.vimState, options);
    }
  }, {
    key: "focusInput",
    value: function focusInput() {
      var _this3 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (!options.onConfirm) {
        options.onConfirm = function (input) {
          _this3.input = input;
          _this3.processOperation();
        };
      }
      if (!options.onCancel) {
        options.onCancel = function () {
          return _this3.cancelOperation();
        };
      }
      if (!options.onChange) {
        options.onChange = function (input) {
          return _this3.vimState.hover.set(input);
        };
      }
      this.vimState.focusInput(options);
    }
  }, {
    key: "readChar",
    value: function readChar() {
      var _this4 = this;

      this.vimState.readChar({
        onConfirm: function onConfirm(input) {
          _this4.input = input;
          _this4.processOperation();
        },
        onCancel: function onCancel() {
          return _this4.cancelOperation();
        }
      });
    }
  }, {
    key: "getVimEofBufferPosition",
    value: function getVimEofBufferPosition() {
      return this.utils.getVimEofBufferPosition(this.editor);
    }
  }, {
    key: "getVimLastBufferRow",
    value: function getVimLastBufferRow() {
      return this.utils.getVimLastBufferRow(this.editor);
    }
  }, {
    key: "getVimLastScreenRow",
    value: function getVimLastScreenRow() {
      return this.utils.getVimLastScreenRow(this.editor);
    }
  }, {
    key: "getWordBufferRangeAndKindAtBufferPosition",
    value: function getWordBufferRangeAndKindAtBufferPosition(point, options) {
      return this.utils.getWordBufferRangeAndKindAtBufferPosition(this.editor, point, options);
    }
  }, {
    key: "getFirstCharacterPositionForBufferRow",
    value: function getFirstCharacterPositionForBufferRow(row) {
      return this.utils.getFirstCharacterPositionForBufferRow(this.editor, row);
    }
  }, {
    key: "getBufferRangeForRowRange",
    value: function getBufferRangeForRowRange(rowRange) {
      return this.utils.getBufferRangeForRowRange(this.editor, rowRange);
    }
  }, {
    key: "scanForward",
    value: function scanForward() {
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).scanEditorInDirection.apply(_utils, [this.editor, "forward"].concat(args));
    }
  }, {
    key: "scanBackward",
    value: function scanBackward() {
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditorInDirection.apply(_utils2, [this.editor, "backward"].concat(args));
    }
  }, {
    key: "getFoldStartRowForRow",
    value: function getFoldStartRowForRow() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).getFoldStartRowForRow.apply(_utils3, [this.editor].concat(args));
    }
  }, {
    key: "getFoldEndRowForRow",
    value: function getFoldEndRowForRow() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).getFoldEndRowForRow.apply(_utils4, [this.editor].concat(args));
    }
  }, {
    key: "instanceof",
    value: function _instanceof(klassName) {
      return this instanceof Base.getClass(klassName);
    }
  }, {
    key: "is",
    value: function is(klassName) {
      return this.constructor === Base.getClass(klassName);
    }
  }, {
    key: "isOperator",
    value: function isOperator() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === "operator";
    }
  }, {
    key: "isMotion",
    value: function isMotion() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === "motion";
    }
  }, {
    key: "isTextObject",
    value: function isTextObject() {
      // Don't use `instanceof` to postpone require for faster activation.
      return this.constructor.operationKind === "text-object";
    }
  }, {
    key: "getCursorBufferPosition",
    value: function getCursorBufferPosition() {
      return this.mode === "visual" ? this.getCursorPositionForSelection(this.editor.getLastSelection()) : this.editor.getCursorBufferPosition();
    }
  }, {
    key: "getCursorBufferPositions",
    value: function getCursorBufferPositions() {
      return this.mode === "visual" ? this.editor.getSelections().map(this.getCursorPositionForSelection.bind(this)) : this.editor.getCursorBufferPositions();
    }
  }, {
    key: "getBufferPositionForCursor",
    value: function getBufferPositionForCursor(cursor) {
      return this.mode === "visual" ? this.getCursorPositionForSelection(cursor.selection) : cursor.getBufferPosition();
    }
  }, {
    key: "getCursorPositionForSelection",
    value: function getCursorPositionForSelection(selection) {
      return this.swrap(selection).getBufferPositionFor("head", { from: ["property", "selection"] });
    }
  }, {
    key: "getTypeOperationTypeChar",
    value: function getTypeOperationTypeChar() {
      var operationKind = this.constructor.operationKind;

      if (operationKind === "operator") return "O";else if (operationKind === "text-object") return "T";else if (operationKind === "motion") return "M";else if (operationKind === "misc-command") return "X";
    }
  }, {
    key: "toString",
    value: function toString() {
      var base = this.name + "<" + this.getTypeOperationTypeChar() + ">";
      return this.target ? base + "{target = " + this.target.toString() + "}" : base;
    }
  }, {
    key: "getCommandName",
    value: function getCommandName() {
      return this.constructor.getCommandName();
    }
  }, {
    key: "getCommandNameWithoutPrefix",
    value: function getCommandNameWithoutPrefix() {
      return this.constructor.getCommandNameWithoutPrefix();
    }
  }, {
    key: "onDidChangeSearch",
    // prettier-ignore

    value: function onDidChangeSearch() {
      var _vimState;

      return (_vimState = this.vimState).onDidChangeSearch.apply(_vimState, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidConfirmSearch",
    value: function onDidConfirmSearch() {
      var _vimState2;

      return (_vimState2 = this.vimState).onDidConfirmSearch.apply(_vimState2, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCancelSearch",
    value: function onDidCancelSearch() {
      var _vimState3;

      return (_vimState3 = this.vimState).onDidCancelSearch.apply(_vimState3, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCommandSearch",
    value: function onDidCommandSearch() {
      var _vimState4;

      return (_vimState4 = this.vimState).onDidCommandSearch.apply(_vimState4, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidSetTarget",
    value: function onDidSetTarget() {
      var _vimState5;

      return (_vimState5 = this.vimState).onDidSetTarget.apply(_vimState5, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidSetTarget",
    value: function emitDidSetTarget() {
      var _vimState6;

      return (_vimState6 = this.vimState).emitDidSetTarget.apply(_vimState6, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillSelectTarget",
    value: function onWillSelectTarget() {
      var _vimState7;

      return (_vimState7 = this.vimState).onWillSelectTarget.apply(_vimState7, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitWillSelectTarget",
    value: function emitWillSelectTarget() {
      var _vimState8;

      return (_vimState8 = this.vimState).emitWillSelectTarget.apply(_vimState8, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidSelectTarget",
    value: function onDidSelectTarget() {
      var _vimState9;

      return (_vimState9 = this.vimState).onDidSelectTarget.apply(_vimState9, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidSelectTarget",
    value: function emitDidSelectTarget() {
      var _vimState10;

      return (_vimState10 = this.vimState).emitDidSelectTarget.apply(_vimState10, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidFailSelectTarget",
    value: function onDidFailSelectTarget() {
      var _vimState11;

      return (_vimState11 = this.vimState).onDidFailSelectTarget.apply(_vimState11, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidFailSelectTarget",
    value: function emitDidFailSelectTarget() {
      var _vimState12;

      return (_vimState12 = this.vimState).emitDidFailSelectTarget.apply(_vimState12, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillFinishMutation",
    value: function onWillFinishMutation() {
      var _vimState13;

      return (_vimState13 = this.vimState).onWillFinishMutation.apply(_vimState13, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitWillFinishMutation",
    value: function emitWillFinishMutation() {
      var _vimState14;

      return (_vimState14 = this.vimState).emitWillFinishMutation.apply(_vimState14, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidFinishMutation",
    value: function onDidFinishMutation() {
      var _vimState15;

      return (_vimState15 = this.vimState).onDidFinishMutation.apply(_vimState15, arguments);
    }
    // prettier-ignore
  }, {
    key: "emitDidFinishMutation",
    value: function emitDidFinishMutation() {
      var _vimState16;

      return (_vimState16 = this.vimState).emitDidFinishMutation.apply(_vimState16, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidFinishOperation",
    value: function onDidFinishOperation() {
      var _vimState17;

      return (_vimState17 = this.vimState).onDidFinishOperation.apply(_vimState17, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidResetOperationStack",
    value: function onDidResetOperationStack() {
      var _vimState18;

      return (_vimState18 = this.vimState).onDidResetOperationStack.apply(_vimState18, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillActivateMode",
    value: function onWillActivateMode() {
      var _vimState19;

      return (_vimState19 = this.vimState).onWillActivateMode.apply(_vimState19, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidActivateMode",
    value: function onDidActivateMode() {
      var _vimState20;

      return (_vimState20 = this.vimState).onDidActivateMode.apply(_vimState20, arguments);
    }
    // prettier-ignore
  }, {
    key: "preemptWillDeactivateMode",
    value: function preemptWillDeactivateMode() {
      var _vimState21;

      return (_vimState21 = this.vimState).preemptWillDeactivateMode.apply(_vimState21, arguments);
    }
    // prettier-ignore
  }, {
    key: "onWillDeactivateMode",
    value: function onWillDeactivateMode() {
      var _vimState22;

      return (_vimState22 = this.vimState).onWillDeactivateMode.apply(_vimState22, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidDeactivateMode",
    value: function onDidDeactivateMode() {
      var _vimState23;

      return (_vimState23 = this.vimState).onDidDeactivateMode.apply(_vimState23, arguments);
    }
    // prettier-ignore
  }, {
    key: "onDidCancelSelectList",
    value: function onDidCancelSelectList() {
      var _vimState24;

      return (_vimState24 = this.vimState).onDidCancelSelectList.apply(_vimState24, arguments);
    }
    // prettier-ignore
  }, {
    key: "subscribe",
    value: function subscribe() {
      var _vimState25;

      return (_vimState25 = this.vimState).subscribe.apply(_vimState25, arguments);
    }
    // prettier-ignore
  }, {
    key: "isMode",
    value: function isMode() {
      var _vimState26;

      return (_vimState26 = this.vimState).isMode.apply(_vimState26, arguments);
    }
    // prettier-ignore
  }, {
    key: "getBlockwiseSelections",
    value: function getBlockwiseSelections() {
      var _vimState27;

      return (_vimState27 = this.vimState).getBlockwiseSelections.apply(_vimState27, arguments);
    }
    // prettier-ignore
  }, {
    key: "getLastBlockwiseSelection",
    value: function getLastBlockwiseSelection() {
      var _vimState28;

      return (_vimState28 = this.vimState).getLastBlockwiseSelection.apply(_vimState28, arguments);
    }
    // prettier-ignore
  }, {
    key: "addToClassList",
    value: function addToClassList() {
      var _vimState29;

      return (_vimState29 = this.vimState).addToClassList.apply(_vimState29, arguments);
    }
    // prettier-ignore
  }, {
    key: "getConfig",
    value: function getConfig() {
      var _vimState30;

      return (_vimState30 = this.vimState).getConfig.apply(_vimState30, arguments);
    }
    // prettier-ignore
  }, {
    key: "mode",

    // Proxy propperties and methods
    //===========================================================================
    get: function get() {
      return this.vimState.mode;
    }
    // prettier-ignore
  }, {
    key: "submode",
    get: function get() {
      return this.vimState.submode;
    }
    // prettier-ignore
  }, {
    key: "swrap",
    get: function get() {
      return this.vimState.swrap;
    }
    // prettier-ignore
  }, {
    key: "utils",
    get: function get() {
      return this.vimState.utils;
    }
    // prettier-ignore
  }, {
    key: "editor",
    get: function get() {
      return this.vimState.editor;
    }
    // prettier-ignore
  }, {
    key: "editorElement",
    get: function get() {
      return this.vimState.editorElement;
    }
    // prettier-ignore
  }, {
    key: "globalState",
    get: function get() {
      return this.vimState.globalState;
    }
    // prettier-ignore
  }, {
    key: "mutationManager",
    get: function get() {
      return this.vimState.mutationManager;
    }
    // prettier-ignore
  }, {
    key: "occurrenceManager",
    get: function get() {
      return this.vimState.occurrenceManager;
    }
    // prettier-ignore
  }, {
    key: "persistentSelection",
    get: function get() {
      return this.vimState.persistentSelection;
    }
  }], [{
    key: "writeCommandTableOnDisk",
    value: function writeCommandTableOnDisk() {
      var commandTable = this.generateCommandTableByEagerLoad();
      var _ = _plus();
      if (_.isEqual(this.commandTable, commandTable)) {
        atom.notifications.addInfo("No changes in commandTable", { dismissable: true });
        return;
      }

      if (!CSON) CSON = require("season");
      if (!path) path = require("path");

      var loadableCSONText = "# This file is auto generated by `vim-mode-plus:write-command-table-on-disk` command.\n";
      loadableCSONText += "# DONT edit manually.\n";
      loadableCSONText += "module.exports =\n";
      loadableCSONText += CSON.stringify(commandTable) + "\n";

      var commandTablePath = path.join(__dirname, "command-table.coffee");
      var openOption = { activatePane: false, activateItem: false };
      atom.workspace.open(commandTablePath, openOption).then(function (editor) {
        editor.setText(loadableCSONText);
        editor.save();
        atom.notifications.addInfo("Updated commandTable", { dismissable: true });
      });
    }
  }, {
    key: "generateCommandTableByEagerLoad",
    value: function generateCommandTableByEagerLoad() {
      // NOTE: changing order affects output of lib/command-table.coffee
      var filesToLoad = ["./operator", "./operator-insert", "./operator-transform-string", "./motion", "./motion-search", "./text-object", "./misc-command"];
      filesToLoad.forEach(loadVmpOperationFile);
      var _ = _plus();
      var klassesGroupedByFile = _.groupBy(_.values(CLASS_REGISTRY), function (klass) {
        return klass.file;
      });

      var commandTable = {};
      for (var file of filesToLoad) {
        for (var klass of klassesGroupedByFile[file]) {
          commandTable[klass.name] = klass.isCommand() ? { file: klass.file, commandName: klass.getCommandName(), commandScope: klass.getCommandScope() } : { file: klass.file };
        }
      }
      return commandTable;
    }
  }, {
    key: "init",
    value: function init(getEditorState) {
      this.getEditorState = getEditorState;

      this.commandTable = require("./command-table");
      var subscriptions = [];
      for (var _name in this.commandTable) {
        var spec = this.commandTable[_name];
        if (spec.commandName) {
          subscriptions.push(this.registerCommandFromSpec(_name, spec));
        }
      }
      return subscriptions;
    }
  }, {
    key: "register",
    value: function register() {
      var command = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      this.command = command;
      this.file = VMP_LOADING_FILE;
      if (this.name in CLASS_REGISTRY) {
        console.warn("Duplicate constructor " + this.name);
      }
      CLASS_REGISTRY[this.name] = this;
    }
  }, {
    key: "extend",
    value: function extend() {
      console.error("calling deprecated Base.extend(), use Base.register instead!");
      this.register.apply(this, arguments);
    }
  }, {
    key: "getClass",
    value: function getClass(name) {
      if (name in CLASS_REGISTRY) return CLASS_REGISTRY[name];

      var fileToLoad = this.commandTable[name].file;
      if (atom.inDevMode() && settings.get("debug")) {
        console.log("lazy-require: " + fileToLoad + " for " + name);
      }
      loadVmpOperationFile(fileToLoad);
      if (name in CLASS_REGISTRY) return CLASS_REGISTRY[name];

      throw new Error("class '" + name + "' not found");
    }
  }, {
    key: "getInstance",
    value: function getInstance(vimState, klassOrName, properties) {
      var klass = typeof klassOrName === "function" ? klassOrName : Base.getClass(klassOrName);
      var instance = new klass(vimState);
      if (properties) Object.assign(instance, properties);
      return instance.initialize(); // initialize must return instance.
    }
  }, {
    key: "getClassRegistry",
    value: function getClassRegistry() {
      return CLASS_REGISTRY;
    }
  }, {
    key: "isCommand",
    value: function isCommand() {
      return this.command;
    }
  }, {
    key: "getCommandName",
    value: function getCommandName() {
      return this.commandPrefix + ":" + _plus().dasherize(this.name);
    }
  }, {
    key: "getCommandNameWithoutPrefix",
    value: function getCommandNameWithoutPrefix() {
      return _plus().dasherize(this.name);
    }
  }, {
    key: "getCommandScope",
    value: function getCommandScope() {
      return this.commandScope;
    }
  }, {
    key: "registerCommand",
    value: function registerCommand() {
      var _this5 = this;

      return this.registerCommandFromSpec(this.name, {
        commandScope: this.getCommandScope(),
        commandName: this.getCommandName(),
        getClass: function getClass() {
          return _this5;
        }
      });
    }
  }, {
    key: "registerCommandFromSpec",
    value: function registerCommandFromSpec(name, spec) {
      var _this6 = this;

      var _spec$commandScope = spec.commandScope;
      var commandScope = _spec$commandScope === undefined ? "atom-text-editor" : _spec$commandScope;
      var _spec$commandPrefix = spec.commandPrefix;
      var commandPrefix = _spec$commandPrefix === undefined ? "vim-mode-plus" : _spec$commandPrefix;
      var commandName = spec.commandName;
      var getClass = spec.getClass;

      if (!commandName) commandName = commandPrefix + ":" + _plus().dasherize(name);
      if (!getClass) getClass = function (name) {
        return _this6.getClass(name);
      };

      var getEditorState = this.getEditorState;
      return atom.commands.add(commandScope, commandName, function (event) {
        var vimState = getEditorState(this.getModel()) || getEditorState(atom.workspace.getActiveTextEditor());
        if (vimState) vimState.operationStack.run(getClass(name)); // vimState possibly be undefined See #85
        event.stopPropagation();
      });
    }
  }, {
    key: "getKindForCommandName",
    value: function getKindForCommandName(command) {
      var commandWithoutPrefix = command.replace(/^vim-mode-plus:/, "");

      var _plus2 = _plus();

      var capitalize = _plus2.capitalize;
      var camelize = _plus2.camelize;

      var commandClassName = capitalize(camelize(commandWithoutPrefix));
      if (commandClassName in CLASS_REGISTRY) {
        return CLASS_REGISTRY[commandClassName].operationKind;
      }
    }
  }]);

  return Base;
})();

Base.register(false);

module.exports = Base;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRDLElBQUksSUFBSSxZQUFBO0lBQUUsSUFBSSxZQUFBO0lBQUUsVUFBVSxZQUFBO0lBQUUscUJBQXFCLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUN6RCxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQWlCQSxlQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1dBbEJxQixJQUFJOzs7O1dBQ0gsZUFBZTs7OztXQUNoQixrQkFBa0I7Ozs7V0FDakIsSUFBSTs7OztXQUNILElBQUk7Ozs7OztBQWdCakIsV0FyQlAsSUFBSSxDQXFCSSxRQUFRLEVBQUU7MEJBckJsQixJQUFJOztTQU9SLGFBQWEsR0FBRyxLQUFLO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLE1BQU0sR0FBRyxJQUFJO1NBQ2IsUUFBUSxHQUFHLElBQUk7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SyxRQUFRLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQTs7QUFFckQsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQTtBQUMxQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDbEUsWUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtBQUN4RyxZQUFJLFFBQVEsRUFBRSxRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUN6RCxhQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7T0FDeEIsQ0FBQyxDQUFBO0tBQ0g7OztXQUUyQiwrQkFBQyxPQUFPLEVBQUU7QUFDcEMsVUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFBOzttQkFDcEMsS0FBSyxFQUFFOztVQUEvQixVQUFVLFVBQVYsVUFBVTtVQUFFLFFBQVEsVUFBUixRQUFROztBQUMzQixVQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFBO0FBQ25FLFVBQUksZ0JBQWdCLElBQUksY0FBYyxFQUFFO0FBQ3RDLGVBQU8sY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsYUFBYSxDQUFBO09BQ3REO0tBQ0Y7OztTQWxZRyxJQUFJOzs7QUFnYlYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFcEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvYmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qgc2V0dGluZ3MgPSByZXF1aXJlKFwiLi9zZXR0aW5nc1wiKVxuXG5sZXQgQ1NPTiwgcGF0aCwgc2VsZWN0TGlzdCwgT3BlcmF0aW9uQWJvcnRlZEVycm9yLCBfX3BsdXNcbmNvbnN0IENMQVNTX1JFR0lTVFJZID0ge31cblxuZnVuY3Rpb24gX3BsdXMoKSB7XG4gIHJldHVybiBfX3BsdXMgfHwgKF9fcGx1cyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIikpXG59XG5cbmxldCBWTVBfTE9BRElOR19GSUxFXG5mdW5jdGlvbiBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlbmFtZSkge1xuICAvLyBDYWxsIHRvIGxvYWRWbXBPcGVyYXRpb25GaWxlIGNhbiBiZSBuZXN0ZWQuXG4gIC8vIDEuIHJlcXVpcmUoXCIuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmdcIilcbiAgLy8gMi4gaW4gb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUgY2FsbCBCYXNlLmdldENsYXNzKFwiT3BlcmF0b3JcIikgY2F1c2Ugb3BlcmF0b3IuY29mZmVlIHJlcXVpcmVkLlxuICAvLyBTbyB3ZSBoYXZlIHRvIHNhdmUgb3JpZ2luYWwgVk1QX0xPQURJTkdfRklMRSBhbmQgcmVzdG9yZSBpdCBhZnRlciByZXF1aXJlIGZpbmlzaGVkLlxuICBjb25zdCBwcmVzZXJ2ZWQgPSBWTVBfTE9BRElOR19GSUxFXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBmaWxlbmFtZVxuICByZXF1aXJlKGZpbGVuYW1lKVxuICBWTVBfTE9BRElOR19GSUxFID0gcHJlc2VydmVkXG59XG5cbmNsYXNzIEJhc2Uge1xuICBzdGF0aWMgY29tbWFuZFRhYmxlID0gbnVsbFxuICBzdGF0aWMgY29tbWFuZFByZWZpeCA9IFwidmltLW1vZGUtcGx1c1wiXG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3JcIlxuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IG51bGxcbiAgc3RhdGljIGdldEVkaXRvclN0YXRlID0gbnVsbCAvLyBzZXQgdGhyb3VnaCBpbml0KClcblxuICByZXF1aXJlVGFyZ2V0ID0gZmFsc2VcbiAgcmVxdWlyZUlucHV0ID0gZmFsc2VcbiAgcmVjb3JkYWJsZSA9IGZhbHNlXG4gIHJlcGVhdGVkID0gZmFsc2VcbiAgdGFyZ2V0ID0gbnVsbFxuICBvcGVyYXRvciA9IG51bGxcbiAgY291bnQgPSBudWxsXG4gIGRlZmF1bHRDb3VudCA9IDFcbiAgaW5wdXQgPSBudWxsXG5cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZVxuICB9XG5cbiAgY29uc3RydWN0b3IodmltU3RhdGUpIHtcbiAgICB0aGlzLnZpbVN0YXRlID0gdmltU3RhdGVcbiAgfVxuXG4gIC8vIE5PVEU6IGluaXRpYWxpemUoKSBtdXN0IHJldHVybiBgdGhpc2BcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gQ2FsbGVkIGJvdGggb24gY2FuY2VsIGFuZCBzdWNjZXNzXG4gIHJlc2V0U3RhdGUoKSB7fVxuXG4gIC8vIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAvLyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlKCkge1xuICAgIGlmICh0aGlzLnJlcXVpcmVJbnB1dCAmJiB0aGlzLmlucHV0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1aXJlVGFyZ2V0KSB7XG4gICAgICAvLyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAvLyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgIC8vIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICByZXR1cm4gISF0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc0NvbXBsZXRlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWUgLy8gU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gICAgfVxuICB9XG5cbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0SW5WaXN1YWxNb2RlXCIpXG4gIH1cblxuICBhYm9ydCgpIHtcbiAgICBpZiAoIU9wZXJhdGlvbkFib3J0ZWRFcnJvcikgT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gcmVxdWlyZShcIi4vZXJyb3JzXCIpXG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcihcImFib3J0ZWRcIilcbiAgfVxuXG4gIGdldENvdW50KG9mZnNldCA9IDApIHtcbiAgICBpZiAodGhpcy5jb3VudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNvdW50ID0gdGhpcy52aW1TdGF0ZS5oYXNDb3VudCgpID8gdGhpcy52aW1TdGF0ZS5nZXRDb3VudCgpIDogdGhpcy5kZWZhdWx0Q291bnRcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY291bnQgKyBvZmZzZXRcbiAgfVxuXG4gIHJlc2V0Q291bnQoKSB7XG4gICAgdGhpcy5jb3VudCA9IG51bGxcbiAgfVxuXG4gIGNvdW50VGltZXMobGFzdCwgZm4pIHtcbiAgICBpZiAobGFzdCA8IDEpIHJldHVyblxuXG4gICAgbGV0IHN0b3BwZWQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3AgPSAoKSA9PiAoc3RvcHBlZCA9IHRydWUpXG4gICAgZm9yIChsZXQgY291bnQgPSAxOyBjb3VudCA8PSBsYXN0OyBjb3VudCsrKSB7XG4gICAgICBmbih7Y291bnQsIGlzRmluYWw6IGNvdW50ID09PSBsYXN0LCBzdG9wfSlcbiAgICAgIGlmIChzdG9wcGVkKSBicmVha1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpKVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkobW9kZSwgc3VibW9kZSkge1xuICAgIGlmICghdGhpcy52aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdGFuY2UobmFtZSwgcHJvcGVydGllcykge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldEluc3RhbmNlKHRoaXMudmltU3RhdGUsIG5hbWUsIHByb3BlcnRpZXMpXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwodGhpcylcbiAgfVxuXG4gIHByb2Nlc3NPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcbiAgfVxuXG4gIGZvY3VzU2VsZWN0TGlzdChvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCgoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpKVxuICAgIGlmICghc2VsZWN0TGlzdCkge1xuICAgICAgc2VsZWN0TGlzdCA9IG5ldyAocmVxdWlyZShcIi4vc2VsZWN0LWxpc3RcIikpKClcbiAgICB9XG4gICAgc2VsZWN0TGlzdC5zaG93KHRoaXMudmltU3RhdGUsIG9wdGlvbnMpXG4gIH1cblxuICBmb2N1c0lucHV0KG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghb3B0aW9ucy5vbkNvbmZpcm0pIHtcbiAgICAgIG9wdGlvbnMub25Db25maXJtID0gaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLm9uQ2FuY2VsKSB7XG4gICAgICBvcHRpb25zLm9uQ2FuY2VsID0gKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMub25DaGFuZ2UpIHtcbiAgICAgIG9wdGlvbnMub25DaGFuZ2UgPSBpbnB1dCA9PiB0aGlzLnZpbVN0YXRlLmhvdmVyLnNldChpbnB1dClcbiAgICB9XG4gICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KG9wdGlvbnMpXG4gIH1cblxuICByZWFkQ2hhcigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnJlYWRDaGFyKHtcbiAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH0sXG4gICAgICBvbkNhbmNlbDogKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKSxcbiAgICB9KVxuICB9XG5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IpXG4gIH1cblxuICBnZXRWaW1MYXN0QnVmZmVyUm93KCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUxhc3RCdWZmZXJSb3codGhpcy5lZGl0b3IpXG4gIH1cblxuICBnZXRWaW1MYXN0U2NyZWVuUm93KCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFZpbUxhc3RTY3JlZW5Sb3codGhpcy5lZGl0b3IpXG4gIH1cblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcbiAgfVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KVxuICB9XG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UodGhpcy5lZGl0b3IsIHJvd1JhbmdlKVxuICB9XG5cbiAgc2NhbkZvcndhcmQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbih0aGlzLmVkaXRvciwgXCJmb3J3YXJkXCIsIC4uLmFyZ3MpXG4gIH1cblxuICBzY2FuQmFja3dhcmQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbih0aGlzLmVkaXRvciwgXCJiYWNrd2FyZFwiLCAuLi5hcmdzKVxuICB9XG5cbiAgZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkU3RhcnRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpXG4gIH1cblxuICBnZXRGb2xkRW5kUm93Rm9yUm93KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKVxuICB9XG5cbiAgaW5zdGFuY2VvZihrbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuICB9XG5cbiAgaXMoa2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IgPT09IEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuICB9XG5cbiAgaXNPcGVyYXRvcigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwib3BlcmF0b3JcIlxuICB9XG5cbiAgaXNNb3Rpb24oKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcIm1vdGlvblwiXG4gIH1cblxuICBpc1RleHRPYmplY3QoKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcInRleHQtb2JqZWN0XCJcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCJcbiAgICAgID8gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICA6IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBcInZpc3VhbFwiXG4gICAgICA/IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAodGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgICAgOiB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuICB9XG5cbiAgZ2V0QnVmZmVyUG9zaXRpb25Gb3JDdXJzb3IoY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiA/IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oY3Vyc29yLnNlbGVjdGlvbikgOiBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcihcImhlYWRcIiwge2Zyb206IFtcInByb3BlcnR5XCIsIFwic2VsZWN0aW9uXCJdfSlcbiAgfVxuXG4gIGdldFR5cGVPcGVyYXRpb25UeXBlQ2hhcigpIHtcbiAgICBjb25zdCB7b3BlcmF0aW9uS2luZH0gPSB0aGlzLmNvbnN0cnVjdG9yXG4gICAgaWYgKG9wZXJhdGlvbktpbmQgPT09IFwib3BlcmF0b3JcIikgcmV0dXJuIFwiT1wiXG4gICAgZWxzZSBpZiAob3BlcmF0aW9uS2luZCA9PT0gXCJ0ZXh0LW9iamVjdFwiKSByZXR1cm4gXCJUXCJcbiAgICBlbHNlIGlmIChvcGVyYXRpb25LaW5kID09PSBcIm1vdGlvblwiKSByZXR1cm4gXCJNXCJcbiAgICBlbHNlIGlmIChvcGVyYXRpb25LaW5kID09PSBcIm1pc2MtY29tbWFuZFwiKSByZXR1cm4gXCJYXCJcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIGNvbnN0IGJhc2UgPSBgJHt0aGlzLm5hbWV9PCR7dGhpcy5nZXRUeXBlT3BlcmF0aW9uVHlwZUNoYXIoKX0+YFxuICAgIHJldHVybiB0aGlzLnRhcmdldCA/IGAke2Jhc2V9e3RhcmdldCA9ICR7dGhpcy50YXJnZXQudG9TdHJpbmcoKX19YCA6IGJhc2VcbiAgfVxuXG4gIGdldENvbW1hbmROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lKClcbiAgfVxuXG4gIGdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICB9XG5cbiAgc3RhdGljIHdyaXRlQ29tbWFuZFRhYmxlT25EaXNrKCkge1xuICAgIGNvbnN0IGNvbW1hbmRUYWJsZSA9IHRoaXMuZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpXG4gICAgY29uc3QgXyA9IF9wbHVzKClcbiAgICBpZiAoXy5pc0VxdWFsKHRoaXMuY29tbWFuZFRhYmxlLCBjb21tYW5kVGFibGUpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNoYW5nZXMgaW4gY29tbWFuZFRhYmxlXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIUNTT04pIENTT04gPSByZXF1aXJlKFwic2Vhc29uXCIpXG4gICAgaWYgKCFwYXRoKSBwYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxuICAgIGxldCBsb2FkYWJsZUNTT05UZXh0ID0gXCIjIFRoaXMgZmlsZSBpcyBhdXRvIGdlbmVyYXRlZCBieSBgdmltLW1vZGUtcGx1czp3cml0ZS1jb21tYW5kLXRhYmxlLW9uLWRpc2tgIGNvbW1hbmQuXFxuXCJcbiAgICBsb2FkYWJsZUNTT05UZXh0ICs9IFwiIyBET05UIGVkaXQgbWFudWFsbHkuXFxuXCJcbiAgICBsb2FkYWJsZUNTT05UZXh0ICs9IFwibW9kdWxlLmV4cG9ydHMgPVxcblwiXG4gICAgbG9hZGFibGVDU09OVGV4dCArPSBDU09OLnN0cmluZ2lmeShjb21tYW5kVGFibGUpICsgXCJcXG5cIlxuXG4gICAgY29uc3QgY29tbWFuZFRhYmxlUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsIFwiY29tbWFuZC10YWJsZS5jb2ZmZWVcIilcbiAgICBjb25zdCBvcGVuT3B0aW9uID0ge2FjdGl2YXRlUGFuZTogZmFsc2UsIGFjdGl2YXRlSXRlbTogZmFsc2V9XG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbihjb21tYW5kVGFibGVQYXRoLCBvcGVuT3B0aW9uKS50aGVuKGVkaXRvciA9PiB7XG4gICAgICBlZGl0b3Iuc2V0VGV4dChsb2FkYWJsZUNTT05UZXh0KVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJVcGRhdGVkIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgZ2VuZXJhdGVDb21tYW5kVGFibGVCeUVhZ2VyTG9hZCgpIHtcbiAgICAvLyBOT1RFOiBjaGFuZ2luZyBvcmRlciBhZmZlY3RzIG91dHB1dCBvZiBsaWIvY29tbWFuZC10YWJsZS5jb2ZmZWVcbiAgICBjb25zdCBmaWxlc1RvTG9hZCA9IFtcbiAgICAgIFwiLi9vcGVyYXRvclwiLFxuICAgICAgXCIuL29wZXJhdG9yLWluc2VydFwiLFxuICAgICAgXCIuL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmdcIixcbiAgICAgIFwiLi9tb3Rpb25cIixcbiAgICAgIFwiLi9tb3Rpb24tc2VhcmNoXCIsXG4gICAgICBcIi4vdGV4dC1vYmplY3RcIixcbiAgICAgIFwiLi9taXNjLWNvbW1hbmRcIixcbiAgICBdXG4gICAgZmlsZXNUb0xvYWQuZm9yRWFjaChsb2FkVm1wT3BlcmF0aW9uRmlsZSlcbiAgICBjb25zdCBfID0gX3BsdXMoKVxuICAgIGNvbnN0IGtsYXNzZXNHcm91cGVkQnlGaWxlID0gXy5ncm91cEJ5KF8udmFsdWVzKENMQVNTX1JFR0lTVFJZKSwga2xhc3MgPT4ga2xhc3MuZmlsZSlcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZSA9IHt9XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzVG9Mb2FkKSB7XG4gICAgICBmb3IgKGNvbnN0IGtsYXNzIG9mIGtsYXNzZXNHcm91cGVkQnlGaWxlW2ZpbGVdKSB7XG4gICAgICAgIGNvbW1hbmRUYWJsZVtrbGFzcy5uYW1lXSA9IGtsYXNzLmlzQ29tbWFuZCgpXG4gICAgICAgICAgPyB7ZmlsZToga2xhc3MuZmlsZSwgY29tbWFuZE5hbWU6IGtsYXNzLmdldENvbW1hbmROYW1lKCksIGNvbW1hbmRTY29wZToga2xhc3MuZ2V0Q29tbWFuZFNjb3BlKCl9XG4gICAgICAgICAgOiB7ZmlsZToga2xhc3MuZmlsZX1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbW1hbmRUYWJsZVxuICB9XG5cbiAgc3RhdGljIGluaXQoZ2V0RWRpdG9yU3RhdGUpIHtcbiAgICB0aGlzLmdldEVkaXRvclN0YXRlID0gZ2V0RWRpdG9yU3RhdGVcblxuICAgIHRoaXMuY29tbWFuZFRhYmxlID0gcmVxdWlyZShcIi4vY29tbWFuZC10YWJsZVwiKVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBbXVxuICAgIGZvciAoY29uc3QgbmFtZSBpbiB0aGlzLmNvbW1hbmRUYWJsZSkge1xuICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuY29tbWFuZFRhYmxlW25hbWVdXG4gICAgICBpZiAoc3BlYy5jb21tYW5kTmFtZSkge1xuICAgICAgICBzdWJzY3JpcHRpb25zLnB1c2godGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyhuYW1lLCBzcGVjKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3Rlcihjb21tYW5kID0gdHJ1ZSkge1xuICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmRcbiAgICB0aGlzLmZpbGUgPSBWTVBfTE9BRElOR19GSUxFXG4gICAgaWYgKHRoaXMubmFtZSBpbiBDTEFTU19SRUdJU1RSWSkge1xuICAgICAgY29uc29sZS53YXJuKGBEdXBsaWNhdGUgY29uc3RydWN0b3IgJHt0aGlzLm5hbWV9YClcbiAgICB9XG4gICAgQ0xBU1NfUkVHSVNUUllbdGhpcy5uYW1lXSA9IHRoaXNcbiAgfVxuXG4gIHN0YXRpYyBleHRlbmQoLi4uYXJncykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJjYWxsaW5nIGRlcHJlY2F0ZWQgQmFzZS5leHRlbmQoKSwgdXNlIEJhc2UucmVnaXN0ZXIgaW5zdGVhZCFcIilcbiAgICB0aGlzLnJlZ2lzdGVyKC4uLmFyZ3MpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3MobmFtZSkge1xuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIGNvbnN0IGZpbGVUb0xvYWQgPSB0aGlzLmNvbW1hbmRUYWJsZVtuYW1lXS5maWxlXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgJiYgc2V0dGluZ3MuZ2V0KFwiZGVidWdcIikpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBsYXp5LXJlcXVpcmU6ICR7ZmlsZVRvTG9hZH0gZm9yICR7bmFtZX1gKVxuICAgIH1cbiAgICBsb2FkVm1wT3BlcmF0aW9uRmlsZShmaWxlVG9Mb2FkKVxuICAgIGlmIChuYW1lIGluIENMQVNTX1JFR0lTVFJZKSByZXR1cm4gQ0xBU1NfUkVHSVNUUllbbmFtZV1cblxuICAgIHRocm93IG5ldyBFcnJvcihgY2xhc3MgJyR7bmFtZX0nIG5vdCBmb3VuZGApXG4gIH1cblxuICBzdGF0aWMgZ2V0SW5zdGFuY2UodmltU3RhdGUsIGtsYXNzT3JOYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qga2xhc3MgPSB0eXBlb2Yga2xhc3NPck5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IGtsYXNzT3JOYW1lIDogQmFzZS5nZXRDbGFzcyhrbGFzc09yTmFtZSlcbiAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBrbGFzcyh2aW1TdGF0ZSlcbiAgICBpZiAocHJvcGVydGllcykgT2JqZWN0LmFzc2lnbihpbnN0YW5jZSwgcHJvcGVydGllcylcbiAgICByZXR1cm4gaW5zdGFuY2UuaW5pdGlhbGl6ZSgpIC8vIGluaXRpYWxpemUgbXVzdCByZXR1cm4gaW5zdGFuY2UuXG4gIH1cblxuICBzdGF0aWMgZ2V0Q2xhc3NSZWdpc3RyeSgpIHtcbiAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllcbiAgfVxuXG4gIHN0YXRpYyBpc0NvbW1hbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFxuICB9XG5cbiAgc3RhdGljIGdldENvbW1hbmROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRQcmVmaXggKyBcIjpcIiArIF9wbHVzKCkuZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIF9wbHVzKCkuZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kU2NvcGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tbWFuZFNjb3BlXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKHRoaXMubmFtZSwge1xuICAgICAgY29tbWFuZFNjb3BlOiB0aGlzLmdldENvbW1hbmRTY29wZSgpLFxuICAgICAgY29tbWFuZE5hbWU6IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSxcbiAgICAgIGdldENsYXNzOiAoKSA9PiB0aGlzLFxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgc3BlYykge1xuICAgIGxldCB7Y29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yXCIsIGNvbW1hbmRQcmVmaXggPSBcInZpbS1tb2RlLXBsdXNcIiwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBpZiAoIWNvbW1hbmROYW1lKSBjb21tYW5kTmFtZSA9IGNvbW1hbmRQcmVmaXggKyBcIjpcIiArIF9wbHVzKCkuZGFzaGVyaXplKG5hbWUpXG4gICAgaWYgKCFnZXRDbGFzcykgZ2V0Q2xhc3MgPSBuYW1lID0+IHRoaXMuZ2V0Q2xhc3MobmFtZSlcblxuICAgIGNvbnN0IGdldEVkaXRvclN0YXRlID0gdGhpcy5nZXRFZGl0b3JTdGF0ZVxuICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmFkZChjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY29uc3QgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZSh0aGlzLmdldE1vZGVsKCkpIHx8IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmICh2aW1TdGF0ZSkgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGdldENsYXNzKG5hbWUpKSAvLyB2aW1TdGF0ZSBwb3NzaWJseSBiZSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSB7XG4gICAgY29uc3QgY29tbWFuZFdpdGhvdXRQcmVmaXggPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sIFwiXCIpXG4gICAgY29uc3Qge2NhcGl0YWxpemUsIGNhbWVsaXplfSA9IF9wbHVzKClcbiAgICBjb25zdCBjb21tYW5kQ2xhc3NOYW1lID0gY2FwaXRhbGl6ZShjYW1lbGl6ZShjb21tYW5kV2l0aG91dFByZWZpeCkpXG4gICAgaWYgKGNvbW1hbmRDbGFzc05hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHtcbiAgICAgIHJldHVybiBDTEFTU19SRUdJU1RSWVtjb21tYW5kQ2xhc3NOYW1lXS5vcGVyYXRpb25LaW5kXG4gICAgfVxuICB9XG5cbiAgLy8gUHJveHkgcHJvcHBlcnRpZXMgYW5kIG1ldGhvZHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0IG1vZGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN1Ym1vZGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN1Ym1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN3cmFwKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zd3JhcCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgdXRpbHMoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnV0aWxzIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3IoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVkaXRvciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yRWxlbWVudCgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yRWxlbWVudCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZ2xvYmFsU3RhdGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdsb2JhbFN0YXRlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBtdXRhdGlvbk1hbmFnZXIoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm11dGF0aW9uTWFuYWdlciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgb2NjdXJyZW5jZU1hbmFnZXIoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBwZXJzaXN0ZW50U2VsZWN0aW9uKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uIH0gLy8gcHJldHRpZXItaWdub3JlXG5cbiAgb25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENoYW5nZVNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZXRUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbEFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbEFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWREZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDYW5jZWxTZWxlY3RMaXN0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWxlY3RMaXN0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIHN1YnNjcmliZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN1YnNjcmliZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBpc01vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5pc01vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgYWRkVG9DbGFzc0xpc3QoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5hZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRDb25maWcoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRDb25maWcoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbn1cbkJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19