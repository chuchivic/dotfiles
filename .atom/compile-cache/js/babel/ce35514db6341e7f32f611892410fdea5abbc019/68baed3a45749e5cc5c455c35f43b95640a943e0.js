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

  _createClass(Base, [{
    key: "initialize",
    value: function initialize() {}

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
    key: "getValidVimBufferRow",
    value: function getValidVimBufferRow(row) {
      return this.utils.getValidVimBufferRow(this.editor, row);
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
      var _this5 = this;

      return this.mode === "visual" ? this.editor.getSelections().map(function (selection) {
        return _this5.getCursorPositionForSelection(selection);
      }) : this.editor.getCursorBufferPositions();
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
    value: function getInstance(vimState, klass, properties) {
      klass = typeof klass === "function" ? klass : Base.getClass(klass);
      var object = new klass(vimState);
      if (properties) Object.assign(object, properties);
      object.initialize();
      return object;
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
      var _this6 = this;

      return this.registerCommandFromSpec(this.name, {
        commandScope: this.getCommandScope(),
        commandName: this.getCommandName(),
        getClass: function getClass() {
          return _this6;
        }
      });
    }
  }, {
    key: "registerCommandFromSpec",
    value: function registerCommandFromSpec(name, spec) {
      var _this7 = this;

      var _spec$commandScope = spec.commandScope;
      var commandScope = _spec$commandScope === undefined ? "atom-text-editor" : _spec$commandScope;
      var _spec$commandPrefix = spec.commandPrefix;
      var commandPrefix = _spec$commandPrefix === undefined ? "vim-mode-plus" : _spec$commandPrefix;
      var commandName = spec.commandName;
      var getClass = spec.getClass;

      if (!commandName) commandName = commandPrefix + ":" + _plus().dasherize(name);
      if (!getClass) getClass = function (name) {
        return _this7.getClass(name);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRDLElBQUksSUFBSSxZQUFBO0lBQUUsSUFBSSxZQUFBO0lBQUUsVUFBVSxZQUFBO0lBQUUscUJBQXFCLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUN6RCxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQWlCQSxlQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1dBbEJxQixJQUFJOzs7O1dBQ0gsZUFBZTs7OztXQUNoQixrQkFBa0I7Ozs7V0FDakIsSUFBSTs7OztXQUNILElBQUk7Ozs7OztBQWdCakIsV0FyQlAsSUFBSSxDQXFCSSxRQUFRLEVBQUU7MEJBckJsQixJQUFJOztTQU9SLGFBQWEsR0FBRyxLQUFLO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLE1BQU0sR0FBRyxJQUFJO1NBQ2IsUUFBUSxHQUFHLElBQUk7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QUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHNldHRpbmdzID0gcmVxdWlyZShcIi4vc2V0dGluZ3NcIilcblxubGV0IENTT04sIHBhdGgsIHNlbGVjdExpc3QsIE9wZXJhdGlvbkFib3J0ZWRFcnJvciwgX19wbHVzXG5jb25zdCBDTEFTU19SRUdJU1RSWSA9IHt9XG5cbmZ1bmN0aW9uIF9wbHVzKCkge1xuICByZXR1cm4gX19wbHVzIHx8IChfX3BsdXMgPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpKVxufVxuXG5sZXQgVk1QX0xPQURJTkdfRklMRVxuZnVuY3Rpb24gbG9hZFZtcE9wZXJhdGlvbkZpbGUoZmlsZW5hbWUpIHtcbiAgLy8gQ2FsbCB0byBsb2FkVm1wT3BlcmF0aW9uRmlsZSBjYW4gYmUgbmVzdGVkLlxuICAvLyAxLiByZXF1aXJlKFwiLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nXCIpXG4gIC8vIDIuIGluIG9wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuY29mZmVlIGNhbGwgQmFzZS5nZXRDbGFzcyhcIk9wZXJhdG9yXCIpIGNhdXNlIG9wZXJhdG9yLmNvZmZlZSByZXF1aXJlZC5cbiAgLy8gU28gd2UgaGF2ZSB0byBzYXZlIG9yaWdpbmFsIFZNUF9MT0FESU5HX0ZJTEUgYW5kIHJlc3RvcmUgaXQgYWZ0ZXIgcmVxdWlyZSBmaW5pc2hlZC5cbiAgY29uc3QgcHJlc2VydmVkID0gVk1QX0xPQURJTkdfRklMRVxuICBWTVBfTE9BRElOR19GSUxFID0gZmlsZW5hbWVcbiAgcmVxdWlyZShmaWxlbmFtZSlcbiAgVk1QX0xPQURJTkdfRklMRSA9IHByZXNlcnZlZFxufVxuXG5jbGFzcyBCYXNlIHtcbiAgc3RhdGljIGNvbW1hbmRUYWJsZSA9IG51bGxcbiAgc3RhdGljIGNvbW1hbmRQcmVmaXggPSBcInZpbS1tb2RlLXBsdXNcIlxuICBzdGF0aWMgY29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yXCJcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBudWxsXG4gIHN0YXRpYyBnZXRFZGl0b3JTdGF0ZSA9IG51bGwgLy8gc2V0IHRocm91Z2ggaW5pdCgpXG5cbiAgcmVxdWlyZVRhcmdldCA9IGZhbHNlXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG4gIHJlY29yZGFibGUgPSBmYWxzZVxuICByZXBlYXRlZCA9IGZhbHNlXG4gIHRhcmdldCA9IG51bGxcbiAgb3BlcmF0b3IgPSBudWxsXG4gIGNvdW50ID0gbnVsbFxuICBkZWZhdWx0Q291bnQgPSAxXG4gIGlucHV0ID0gbnVsbFxuXG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWVcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHZpbVN0YXRlKSB7XG4gICAgdGhpcy52aW1TdGF0ZSA9IHZpbVN0YXRlXG4gIH1cblxuICBpbml0aWFsaXplKCkge31cblxuICAvLyBDYWxsZWQgYm90aCBvbiBjYW5jZWwgYW5kIHN1Y2Nlc3NcbiAgcmVzZXRTdGF0ZSgpIHt9XG5cbiAgLy8gT3BlcmF0aW9uIHByb2Nlc3NvciBleGVjdXRlIG9ubHkgd2hlbiBpc0NvbXBsZXRlKCkgcmV0dXJuIHRydWUuXG4gIC8vIElmIGZhbHNlLCBvcGVyYXRpb24gcHJvY2Vzc29yIHBvc3Rwb25lIGl0cyBleGVjdXRpb24uXG4gIGlzQ29tcGxldGUoKSB7XG4gICAgaWYgKHRoaXMucmVxdWlyZUlucHV0ICYmIHRoaXMuaW5wdXQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIGlmICh0aGlzLnJlcXVpcmVUYXJnZXQpIHtcbiAgICAgIC8vIFdoZW4gdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgaW4gQmFzZTo6Y29uc3RydWN0b3JcbiAgICAgIC8vIHRhZ2VydCBpcyBzdGlsbCBzdHJpbmcgbGlrZSBgTW92ZVRvUmlnaHRgLCBpbiB0aGlzIGNhc2UgaXNDb21wbGV0ZVxuICAgICAgLy8gaXMgbm90IGF2YWlsYWJsZS5cbiAgICAgIHJldHVybiAhIXRoaXMudGFyZ2V0ICYmIHRoaXMudGFyZ2V0LmlzQ29tcGxldGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHJ1ZSAvLyBTZXQgaW4gb3BlcmF0b3IncyB0YXJnZXQoIE1vdGlvbiBvciBUZXh0T2JqZWN0IClcbiAgICB9XG4gIH1cblxuICBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RJblZpc3VhbE1vZGVcIilcbiAgfVxuXG4gIGFib3J0KCkge1xuICAgIGlmICghT3BlcmF0aW9uQWJvcnRlZEVycm9yKSBPcGVyYXRpb25BYm9ydGVkRXJyb3IgPSByZXF1aXJlKFwiLi9lcnJvcnNcIilcbiAgICB0aHJvdyBuZXcgT3BlcmF0aW9uQWJvcnRlZEVycm9yKFwiYWJvcnRlZFwiKVxuICB9XG5cbiAgZ2V0Q291bnQob2Zmc2V0ID0gMCkge1xuICAgIGlmICh0aGlzLmNvdW50ID09IG51bGwpIHtcbiAgICAgIHRoaXMuY291bnQgPSB0aGlzLnZpbVN0YXRlLmhhc0NvdW50KCkgPyB0aGlzLnZpbVN0YXRlLmdldENvdW50KCkgOiB0aGlzLmRlZmF1bHRDb3VudFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb3VudCArIG9mZnNldFxuICB9XG5cbiAgcmVzZXRDb3VudCgpIHtcbiAgICB0aGlzLmNvdW50ID0gbnVsbFxuICB9XG5cbiAgY291bnRUaW1lcyhsYXN0LCBmbikge1xuICAgIGlmIChsYXN0IDwgMSkgcmV0dXJuXG5cbiAgICBsZXQgc3RvcHBlZCA9IGZhbHNlXG4gICAgY29uc3Qgc3RvcCA9ICgpID0+IChzdG9wcGVkID0gdHJ1ZSlcbiAgICBmb3IgKGxldCBjb3VudCA9IDE7IGNvdW50IDw9IGxhc3Q7IGNvdW50KyspIHtcbiAgICAgIGZuKHtjb3VudCwgaXNGaW5hbDogY291bnQgPT09IGxhc3QsIHN0b3B9KVxuICAgICAgaWYgKHN0b3BwZWQpIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpIHtcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMudmltU3RhdGUuYWN0aXZhdGUobW9kZSwgc3VibW9kZSkpXG4gIH1cblxuICBhY3RpdmF0ZU1vZGVJZk5lY2Vzc2FyeShtb2RlLCBzdWJtb2RlKSB7XG4gICAgaWYgKCF0aGlzLnZpbVN0YXRlLmlzTW9kZShtb2RlLCBzdWJtb2RlKSkge1xuICAgICAgdGhpcy5hY3RpdmF0ZU1vZGUobW9kZSwgc3VibW9kZSlcbiAgICB9XG4gIH1cblxuICBnZXRJbnN0YW5jZShuYW1lLCBwcm9wZXJ0aWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0SW5zdGFuY2UodGhpcy52aW1TdGF0ZSwgbmFtZSwgcHJvcGVydGllcylcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmNhbmNlbCh0aGlzKVxuICB9XG5cbiAgcHJvY2Vzc09wZXJhdGlvbigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnByb2Nlc3MoKVxuICB9XG5cbiAgZm9jdXNTZWxlY3RMaXN0KG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMub25EaWRDYW5jZWxTZWxlY3RMaXN0KCgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCkpXG4gICAgaWYgKCFzZWxlY3RMaXN0KSB7XG4gICAgICBzZWxlY3RMaXN0ID0gbmV3IChyZXF1aXJlKFwiLi9zZWxlY3QtbGlzdFwiKSkoKVxuICAgIH1cbiAgICBzZWxlY3RMaXN0LnNob3codGhpcy52aW1TdGF0ZSwgb3B0aW9ucylcbiAgfVxuXG4gIGZvY3VzSW5wdXQob3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFvcHRpb25zLm9uQ29uZmlybSkge1xuICAgICAgb3B0aW9ucy5vbkNvbmZpcm0gPSBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW9wdGlvbnMub25DYW5jZWwpIHtcbiAgICAgIG9wdGlvbnMub25DYW5jZWwgPSAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfVxuICAgIGlmICghb3B0aW9ucy5vbkNoYW5nZSkge1xuICAgICAgb3B0aW9ucy5vbkNoYW5nZSA9IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuICAgIH1cbiAgICB0aGlzLnZpbVN0YXRlLmZvY3VzSW5wdXQob3B0aW9ucylcbiAgfVxuXG4gIHJlYWRDaGFyKCkge1xuICAgIHRoaXMudmltU3RhdGUucmVhZENoYXIoe1xuICAgICAgb25Db25maXJtOiBpbnB1dCA9PiB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgfSxcbiAgICAgIG9uQ2FuY2VsOiAoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpLFxuICAgIH0pXG4gIH1cblxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZhbGlkVmltQnVmZmVyUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gIH1cblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBwb2ludCwgb3B0aW9ucylcbiAgfVxuXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KVxuICB9XG5cbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UodGhpcy5lZGl0b3IsIHJvd1JhbmdlKVxuICB9XG5cbiAgc2NhbkZvcndhcmQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbih0aGlzLmVkaXRvciwgXCJmb3J3YXJkXCIsIC4uLmFyZ3MpXG4gIH1cblxuICBzY2FuQmFja3dhcmQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLnNjYW5FZGl0b3JJbkRpcmVjdGlvbih0aGlzLmVkaXRvciwgXCJiYWNrd2FyZFwiLCAuLi5hcmdzKVxuICB9XG5cbiAgZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkU3RhcnRSb3dGb3JSb3codGhpcy5lZGl0b3IsIC4uLmFyZ3MpXG4gIH1cblxuICBnZXRGb2xkRW5kUm93Rm9yUm93KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRGb2xkRW5kUm93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKVxuICB9XG5cbiAgaW5zdGFuY2VvZihrbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuICB9XG5cbiAgaXMoa2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IgPT09IEJhc2UuZ2V0Q2xhc3Moa2xhc3NOYW1lKVxuICB9XG5cbiAgaXNPcGVyYXRvcigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwib3BlcmF0b3JcIlxuICB9XG5cbiAgaXNNb3Rpb24oKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcIm1vdGlvblwiXG4gIH1cblxuICBpc1RleHRPYmplY3QoKSB7XG4gICAgLy8gRG9uJ3QgdXNlIGBpbnN0YW5jZW9mYCB0byBwb3N0cG9uZSByZXF1aXJlIGZvciBmYXN0ZXIgYWN0aXZhdGlvbi5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5vcGVyYXRpb25LaW5kID09PSBcInRleHQtb2JqZWN0XCJcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCJcbiAgICAgID8gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICA6IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBcInZpc3VhbFwiXG4gICAgICA/IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoc2VsZWN0aW9uID0+IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSlcbiAgICAgIDogdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcbiAgfVxuXG4gIGdldEJ1ZmZlclBvc2l0aW9uRm9yQ3Vyc29yKGN1cnNvcikge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgPyB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKGN1cnNvci5zZWxlY3Rpb24pIDogY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoXCJoZWFkXCIsIHtmcm9tOiBbXCJwcm9wZXJ0eVwiLCBcInNlbGVjdGlvblwiXX0pXG4gIH1cblxuICBnZXRUeXBlT3BlcmF0aW9uVHlwZUNoYXIoKSB7XG4gICAgY29uc3Qge29wZXJhdGlvbktpbmR9ID0gdGhpcy5jb25zdHJ1Y3RvclxuICAgIGlmIChvcGVyYXRpb25LaW5kID09PSBcIm9wZXJhdG9yXCIpIHJldHVybiBcIk9cIlxuICAgIGVsc2UgaWYgKG9wZXJhdGlvbktpbmQgPT09IFwidGV4dC1vYmplY3RcIikgcmV0dXJuIFwiVFwiXG4gICAgZWxzZSBpZiAob3BlcmF0aW9uS2luZCA9PT0gXCJtb3Rpb25cIikgcmV0dXJuIFwiTVwiXG4gICAgZWxzZSBpZiAob3BlcmF0aW9uS2luZCA9PT0gXCJtaXNjLWNvbW1hbmRcIikgcmV0dXJuIFwiWFwiXG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCBiYXNlID0gYCR7dGhpcy5uYW1lfTwke3RoaXMuZ2V0VHlwZU9wZXJhdGlvblR5cGVDaGFyKCl9PmBcbiAgICByZXR1cm4gdGhpcy50YXJnZXQgPyBgJHtiYXNlfXt0YXJnZXQgPSAke3RoaXMudGFyZ2V0LnRvU3RyaW5nKCl9fWAgOiBiYXNlXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gIH1cblxuICBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KClcbiAgfVxuXG4gIHN0YXRpYyB3cml0ZUNvbW1hbmRUYWJsZU9uRGlzaygpIHtcbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSB0aGlzLmdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKVxuICAgIGNvbnN0IF8gPSBfcGx1cygpXG4gICAgaWYgKF8uaXNFcXVhbCh0aGlzLmNvbW1hbmRUYWJsZSwgY29tbWFuZFRhYmxlKSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBjaGFuZ2VzIGluIGNvbW1hbmRUYWJsZVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFDU09OKSBDU09OID0gcmVxdWlyZShcInNlYXNvblwiKVxuICAgIGlmICghcGF0aCkgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5cbiAgICBsZXQgbG9hZGFibGVDU09OVGV4dCA9IFwiIyBUaGlzIGZpbGUgaXMgYXV0byBnZW5lcmF0ZWQgYnkgYHZpbS1tb2RlLXBsdXM6d3JpdGUtY29tbWFuZC10YWJsZS1vbi1kaXNrYCBjb21tYW5kLlxcblwiXG4gICAgbG9hZGFibGVDU09OVGV4dCArPSBcIiMgRE9OVCBlZGl0IG1hbnVhbGx5LlxcblwiXG4gICAgbG9hZGFibGVDU09OVGV4dCArPSBcIm1vZHVsZS5leHBvcnRzID1cXG5cIlxuICAgIGxvYWRhYmxlQ1NPTlRleHQgKz0gQ1NPTi5zdHJpbmdpZnkoY29tbWFuZFRhYmxlKSArIFwiXFxuXCJcblxuICAgIGNvbnN0IGNvbW1hbmRUYWJsZVBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCBcImNvbW1hbmQtdGFibGUuY29mZmVlXCIpXG4gICAgY29uc3Qgb3Blbk9wdGlvbiA9IHthY3RpdmF0ZVBhbmU6IGZhbHNlLCBhY3RpdmF0ZUl0ZW06IGZhbHNlfVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oY29tbWFuZFRhYmxlUGF0aCwgb3Blbk9wdGlvbikudGhlbihlZGl0b3IgPT4ge1xuICAgICAgZWRpdG9yLnNldFRleHQobG9hZGFibGVDU09OVGV4dClcbiAgICAgIGVkaXRvci5zYXZlKClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiVXBkYXRlZCBjb21tYW5kVGFibGVcIiwge2Rpc21pc3NhYmxlOiB0cnVlfSlcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ29tbWFuZFRhYmxlQnlFYWdlckxvYWQoKSB7XG4gICAgLy8gTk9URTogY2hhbmdpbmcgb3JkZXIgYWZmZWN0cyBvdXRwdXQgb2YgbGliL2NvbW1hbmQtdGFibGUuY29mZmVlXG4gICAgY29uc3QgZmlsZXNUb0xvYWQgPSBbXG4gICAgICBcIi4vb3BlcmF0b3JcIixcbiAgICAgIFwiLi9vcGVyYXRvci1pbnNlcnRcIixcbiAgICAgIFwiLi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nXCIsXG4gICAgICBcIi4vbW90aW9uXCIsXG4gICAgICBcIi4vbW90aW9uLXNlYXJjaFwiLFxuICAgICAgXCIuL3RleHQtb2JqZWN0XCIsXG4gICAgICBcIi4vbWlzYy1jb21tYW5kXCIsXG4gICAgXVxuICAgIGZpbGVzVG9Mb2FkLmZvckVhY2gobG9hZFZtcE9wZXJhdGlvbkZpbGUpXG4gICAgY29uc3QgXyA9IF9wbHVzKClcbiAgICBjb25zdCBrbGFzc2VzR3JvdXBlZEJ5RmlsZSA9IF8uZ3JvdXBCeShfLnZhbHVlcyhDTEFTU19SRUdJU1RSWSksIGtsYXNzID0+IGtsYXNzLmZpbGUpXG5cbiAgICBjb25zdCBjb21tYW5kVGFibGUgPSB7fVxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlc1RvTG9hZCkge1xuICAgICAgZm9yIChjb25zdCBrbGFzcyBvZiBrbGFzc2VzR3JvdXBlZEJ5RmlsZVtmaWxlXSkge1xuICAgICAgICBjb21tYW5kVGFibGVba2xhc3MubmFtZV0gPSBrbGFzcy5pc0NvbW1hbmQoKVxuICAgICAgICAgID8ge2ZpbGU6IGtsYXNzLmZpbGUsIGNvbW1hbmROYW1lOiBrbGFzcy5nZXRDb21tYW5kTmFtZSgpLCBjb21tYW5kU2NvcGU6IGtsYXNzLmdldENvbW1hbmRTY29wZSgpfVxuICAgICAgICAgIDoge2ZpbGU6IGtsYXNzLmZpbGV9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21tYW5kVGFibGVcbiAgfVxuXG4gIHN0YXRpYyBpbml0KGdldEVkaXRvclN0YXRlKSB7XG4gICAgdGhpcy5nZXRFZGl0b3JTdGF0ZSA9IGdldEVkaXRvclN0YXRlXG5cbiAgICB0aGlzLmNvbW1hbmRUYWJsZSA9IHJlcXVpcmUoXCIuL2NvbW1hbmQtdGFibGVcIilcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gW11cbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5jb21tYW5kVGFibGUpIHtcbiAgICAgIGNvbnN0IHNwZWMgPSB0aGlzLmNvbW1hbmRUYWJsZVtuYW1lXVxuICAgICAgaWYgKHNwZWMuY29tbWFuZE5hbWUpIHtcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5wdXNoKHRoaXMucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgc3BlYykpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXIoY29tbWFuZCA9IHRydWUpIHtcbiAgICB0aGlzLmNvbW1hbmQgPSBjb21tYW5kXG4gICAgdGhpcy5maWxlID0gVk1QX0xPQURJTkdfRklMRVxuICAgIGlmICh0aGlzLm5hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHtcbiAgICAgIGNvbnNvbGUud2FybihgRHVwbGljYXRlIGNvbnN0cnVjdG9yICR7dGhpcy5uYW1lfWApXG4gICAgfVxuICAgIENMQVNTX1JFR0lTVFJZW3RoaXMubmFtZV0gPSB0aGlzXG4gIH1cblxuICBzdGF0aWMgZXh0ZW5kKC4uLmFyZ3MpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiY2FsbGluZyBkZXByZWNhdGVkIEJhc2UuZXh0ZW5kKCksIHVzZSBCYXNlLnJlZ2lzdGVyIGluc3RlYWQhXCIpXG4gICAgdGhpcy5yZWdpc3RlciguLi5hcmdzKVxuICB9XG5cbiAgc3RhdGljIGdldENsYXNzKG5hbWUpIHtcbiAgICBpZiAobmFtZSBpbiBDTEFTU19SRUdJU1RSWSkgcmV0dXJuIENMQVNTX1JFR0lTVFJZW25hbWVdXG5cbiAgICBjb25zdCBmaWxlVG9Mb2FkID0gdGhpcy5jb21tYW5kVGFibGVbbmFtZV0uZmlsZVxuICAgIGlmIChhdG9tLmluRGV2TW9kZSgpICYmIHNldHRpbmdzLmdldChcImRlYnVnXCIpKSB7XG4gICAgICBjb25zb2xlLmxvZyhgbGF6eS1yZXF1aXJlOiAke2ZpbGVUb0xvYWR9IGZvciAke25hbWV9YClcbiAgICB9XG4gICAgbG9hZFZtcE9wZXJhdGlvbkZpbGUoZmlsZVRvTG9hZClcbiAgICBpZiAobmFtZSBpbiBDTEFTU19SRUdJU1RSWSkgcmV0dXJuIENMQVNTX1JFR0lTVFJZW25hbWVdXG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNsYXNzICcke25hbWV9JyBub3QgZm91bmRgKVxuICB9XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKHZpbVN0YXRlLCBrbGFzcywgcHJvcGVydGllcykge1xuICAgIGtsYXNzID0gdHlwZW9mIGtsYXNzID09PSBcImZ1bmN0aW9uXCIgPyBrbGFzcyA6IEJhc2UuZ2V0Q2xhc3Moa2xhc3MpXG4gICAgY29uc3Qgb2JqZWN0ID0gbmV3IGtsYXNzKHZpbVN0YXRlKVxuICAgIGlmIChwcm9wZXJ0aWVzKSBPYmplY3QuYXNzaWduKG9iamVjdCwgcHJvcGVydGllcylcbiAgICBvYmplY3QuaW5pdGlhbGl6ZSgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgc3RhdGljIGdldENsYXNzUmVnaXN0cnkoKSB7XG4gICAgcmV0dXJuIENMQVNTX1JFR0lTVFJZXG4gIH1cblxuICBzdGF0aWMgaXNDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb21tYW5kUHJlZml4ICsgXCI6XCIgKyBfcGx1cygpLmRhc2hlcml6ZSh0aGlzLm5hbWUpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiBfcGx1cygpLmRhc2hlcml6ZSh0aGlzLm5hbWUpXG4gIH1cblxuICBzdGF0aWMgZ2V0Q29tbWFuZFNjb3BlKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRTY29wZVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWdpc3RlckNvbW1hbmRGcm9tU3BlYyh0aGlzLm5hbWUsIHtcbiAgICAgIGNvbW1hbmRTY29wZTogdGhpcy5nZXRDb21tYW5kU2NvcGUoKSxcbiAgICAgIGNvbW1hbmROYW1lOiB0aGlzLmdldENvbW1hbmROYW1lKCksXG4gICAgICBnZXRDbGFzczogKCkgPT4gdGhpcyxcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpIHtcbiAgICBsZXQge2NvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiLCBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCIsIGNvbW1hbmROYW1lLCBnZXRDbGFzc30gPSBzcGVjXG4gICAgaWYgKCFjb21tYW5kTmFtZSkgY29tbWFuZE5hbWUgPSBjb21tYW5kUHJlZml4ICsgXCI6XCIgKyBfcGx1cygpLmRhc2hlcml6ZShuYW1lKVxuICAgIGlmICghZ2V0Q2xhc3MpIGdldENsYXNzID0gbmFtZSA9PiB0aGlzLmdldENsYXNzKG5hbWUpXG5cbiAgICBjb25zdCBnZXRFZGl0b3JTdGF0ZSA9IHRoaXMuZ2V0RWRpdG9yU3RhdGVcbiAgICByZXR1cm4gYXRvbS5jb21tYW5kcy5hZGQoY29tbWFuZFNjb3BlLCBjb21tYW5kTmFtZSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGNvbnN0IHZpbVN0YXRlID0gZ2V0RWRpdG9yU3RhdGUodGhpcy5nZXRNb2RlbCgpKSB8fCBnZXRFZGl0b3JTdGF0ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgICBpZiAodmltU3RhdGUpIHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bihnZXRDbGFzcyhuYW1lKSkgLy8gdmltU3RhdGUgcG9zc2libHkgYmUgdW5kZWZpbmVkIFNlZSAjODVcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRLaW5kRm9yQ29tbWFuZE5hbWUoY29tbWFuZCkge1xuICAgIGNvbnN0IGNvbW1hbmRXaXRob3V0UHJlZml4ID0gY29tbWFuZC5yZXBsYWNlKC9edmltLW1vZGUtcGx1czovLCBcIlwiKVxuICAgIGNvbnN0IHtjYXBpdGFsaXplLCBjYW1lbGl6ZX0gPSBfcGx1cygpXG4gICAgY29uc3QgY29tbWFuZENsYXNzTmFtZSA9IGNhcGl0YWxpemUoY2FtZWxpemUoY29tbWFuZFdpdGhvdXRQcmVmaXgpKVxuICAgIGlmIChjb21tYW5kQ2xhc3NOYW1lIGluIENMQVNTX1JFR0lTVFJZKSB7XG4gICAgICByZXR1cm4gQ0xBU1NfUkVHSVNUUllbY29tbWFuZENsYXNzTmFtZV0ub3BlcmF0aW9uS2luZFxuICAgIH1cbiAgfVxuXG4gIC8vIFByb3h5IHByb3BwZXJ0aWVzIGFuZCBtZXRob2RzXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGdldCBtb2RlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzdWJtb2RlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJtb2RlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBzd3JhcCgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuc3dyYXAgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHV0aWxzKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS51dGlscyB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lZGl0b3IgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGVkaXRvckVsZW1lbnQoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVkaXRvckVsZW1lbnQgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IGdsb2JhbFN0YXRlKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nbG9iYWxTdGF0ZSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgbXV0YXRpb25NYW5hZ2VyKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5tdXRhdGlvbk1hbmFnZXIgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IG9jY3VycmVuY2VNYW5hZ2VyKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgcGVyc2lzdGVudFNlbGVjdGlvbigpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbiB9IC8vIHByZXR0aWVyLWlnbm9yZVxuXG4gIG9uRGlkQ2hhbmdlU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDb21tYW5kU2VhcmNoKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRTZXRUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZhaWxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEZpbmlzaE9wZXJhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjayguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxBY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxBY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRBY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZEFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBwcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUucHJlZW1wdFdpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxEZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkQ2FuY2VsU2VsZWN0TGlzdCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBzdWJzY3JpYmUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zdWJzY3JpYmUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgaXNNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuaXNNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25zKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGFkZFRvQ2xhc3NMaXN0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuYWRkVG9DbGFzc0xpc3QoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0Q29uZmlnKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZ2V0Q29uZmlnKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG59XG5CYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcbiJdfQ==