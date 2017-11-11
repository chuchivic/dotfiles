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
      if (!options.onCancel) options.onCancel = function () {
        return _this3.cancelOperation();
      };
      if (!options.onChange) options.onChange = function (input) {
        return _this3.vimState.hover.set(input);
      };

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

    // Wrapper for this.utils == start
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
    value: function getWordBufferRangeAndKindAtBufferPosition() {
      var _utils;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_utils = this.utils).getWordBufferRangeAndKindAtBufferPosition.apply(_utils, [this.editor].concat(args));
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
      var _utils2;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_utils2 = this.utils).scanEditorInDirection.apply(_utils2, [this.editor, "forward"].concat(args));
    }
  }, {
    key: "scanBackward",
    value: function scanBackward() {
      var _utils3;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_utils3 = this.utils).scanEditorInDirection.apply(_utils3, [this.editor, "backward"].concat(args));
    }
  }, {
    key: "getFoldStartRowForRow",
    value: function getFoldStartRowForRow() {
      var _utils4;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (_utils4 = this.utils).getFoldStartRowForRow.apply(_utils4, [this.editor].concat(args));
    }
  }, {
    key: "getFoldEndRowForRow",
    value: function getFoldEndRowForRow() {
      var _utils5;

      for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return (_utils5 = this.utils).getFoldEndRowForRow.apply(_utils5, [this.editor].concat(args));
    }
  }, {
    key: "getBufferRows",
    value: function getBufferRows() {
      var _utils6;

      for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return (_utils6 = this.utils).getBufferRows.apply(_utils6, [this.editor].concat(args));
    }

    // Wrapper for this.utils == end

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
    key: "getCursorBufferPositionsOrdered",
    value: function getCursorBufferPositionsOrdered() {
      return this.utils.sortPoints(this.getCursorBufferPositions());
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
          commandTable[klass.name] = klass.command ? { file: klass.file, commandName: klass.getCommandName(), commandScope: klass.commandScope } : { file: klass.file };
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
    key: "registerCommand",
    value: function registerCommand() {
      var _this6 = this;

      return this.registerCommandFromSpec(this.name, {
        commandScope: this.commandScope,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL2Jhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7QUFFWCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7O0FBRXRDLElBQUksSUFBSSxZQUFBO0lBQUUsSUFBSSxZQUFBO0lBQUUsVUFBVSxZQUFBO0lBQUUscUJBQXFCLFlBQUE7SUFBRSxNQUFNLFlBQUEsQ0FBQTtBQUN6RCxJQUFNLGNBQWMsR0FBRyxFQUFFLENBQUE7O0FBRXpCLFNBQVMsS0FBSyxHQUFHO0FBQ2YsU0FBTyxNQUFNLEtBQUssTUFBTSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUN2RDs7QUFFRCxJQUFJLGdCQUFnQixZQUFBLENBQUE7QUFDcEIsU0FBUyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUU7Ozs7O0FBS3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBQ2xDLGtCQUFnQixHQUFHLFFBQVEsQ0FBQTtBQUMzQixTQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDakIsa0JBQWdCLEdBQUcsU0FBUyxDQUFBO0NBQzdCOztJQUVLLElBQUk7ZUFBSixJQUFJOztTQWlCQSxlQUFHO0FBQ1QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1dBbEJxQixJQUFJOzs7O1dBQ0gsZUFBZTs7OztXQUNoQixrQkFBa0I7Ozs7V0FDakIsSUFBSTs7OztXQUNILElBQUk7Ozs7OztBQWdCakIsV0FyQlAsSUFBSSxDQXFCSSxRQUFRLEVBQUU7MEJBckJsQixJQUFJOztTQU9SLGFBQWEsR0FBRyxLQUFLO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLFVBQVUsR0FBRyxLQUFLO1NBQ2xCLFFBQVEsR0FBRyxLQUFLO1NBQ2hCLE1BQU0sR0FBRyxJQUFJO1NBQ2IsUUFBUSxHQUFHLElBQUk7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S0FDRjs7O1NBbllHLElBQUk7OztBQWliVixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztBQUVwQixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9iYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBzZXR0aW5ncyA9IHJlcXVpcmUoXCIuL3NldHRpbmdzXCIpXG5cbmxldCBDU09OLCBwYXRoLCBzZWxlY3RMaXN0LCBPcGVyYXRpb25BYm9ydGVkRXJyb3IsIF9fcGx1c1xuY29uc3QgQ0xBU1NfUkVHSVNUUlkgPSB7fVxuXG5mdW5jdGlvbiBfcGx1cygpIHtcbiAgcmV0dXJuIF9fcGx1cyB8fCAoX19wbHVzID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKSlcbn1cblxubGV0IFZNUF9MT0FESU5HX0ZJTEVcbmZ1bmN0aW9uIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVuYW1lKSB7XG4gIC8vIENhbGwgdG8gbG9hZFZtcE9wZXJhdGlvbkZpbGUgY2FuIGJlIG5lc3RlZC5cbiAgLy8gMS4gcmVxdWlyZShcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiKVxuICAvLyAyLiBpbiBvcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmNvZmZlZSBjYWxsIEJhc2UuZ2V0Q2xhc3MoXCJPcGVyYXRvclwiKSBjYXVzZSBvcGVyYXRvci5jb2ZmZWUgcmVxdWlyZWQuXG4gIC8vIFNvIHdlIGhhdmUgdG8gc2F2ZSBvcmlnaW5hbCBWTVBfTE9BRElOR19GSUxFIGFuZCByZXN0b3JlIGl0IGFmdGVyIHJlcXVpcmUgZmluaXNoZWQuXG4gIGNvbnN0IHByZXNlcnZlZCA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgVk1QX0xPQURJTkdfRklMRSA9IGZpbGVuYW1lXG4gIHJlcXVpcmUoZmlsZW5hbWUpXG4gIFZNUF9MT0FESU5HX0ZJTEUgPSBwcmVzZXJ2ZWRcbn1cblxuY2xhc3MgQmFzZSB7XG4gIHN0YXRpYyBjb21tYW5kVGFibGUgPSBudWxsXG4gIHN0YXRpYyBjb21tYW5kUHJlZml4ID0gXCJ2aW0tbW9kZS1wbHVzXCJcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gbnVsbFxuICBzdGF0aWMgZ2V0RWRpdG9yU3RhdGUgPSBudWxsIC8vIHNldCB0aHJvdWdoIGluaXQoKVxuXG4gIHJlcXVpcmVUYXJnZXQgPSBmYWxzZVxuICByZXF1aXJlSW5wdXQgPSBmYWxzZVxuICByZWNvcmRhYmxlID0gZmFsc2VcbiAgcmVwZWF0ZWQgPSBmYWxzZVxuICB0YXJnZXQgPSBudWxsXG4gIG9wZXJhdG9yID0gbnVsbFxuICBjb3VudCA9IG51bGxcbiAgZGVmYXVsdENvdW50ID0gMVxuICBpbnB1dCA9IG51bGxcblxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2aW1TdGF0ZSkge1xuICAgIHRoaXMudmltU3RhdGUgPSB2aW1TdGF0ZVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHt9XG5cbiAgLy8gQ2FsbGVkIGJvdGggb24gY2FuY2VsIGFuZCBzdWNjZXNzXG4gIHJlc2V0U3RhdGUoKSB7fVxuXG4gIC8vIE9wZXJhdGlvbiBwcm9jZXNzb3IgZXhlY3V0ZSBvbmx5IHdoZW4gaXNDb21wbGV0ZSgpIHJldHVybiB0cnVlLlxuICAvLyBJZiBmYWxzZSwgb3BlcmF0aW9uIHByb2Nlc3NvciBwb3N0cG9uZSBpdHMgZXhlY3V0aW9uLlxuICBpc0NvbXBsZXRlKCkge1xuICAgIGlmICh0aGlzLnJlcXVpcmVJbnB1dCAmJiB0aGlzLmlucHV0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAodGhpcy5yZXF1aXJlVGFyZ2V0KSB7XG4gICAgICAvLyBXaGVuIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIGluIEJhc2U6OmNvbnN0cnVjdG9yXG4gICAgICAvLyB0YWdlcnQgaXMgc3RpbGwgc3RyaW5nIGxpa2UgYE1vdmVUb1JpZ2h0YCwgaW4gdGhpcyBjYXNlIGlzQ29tcGxldGVcbiAgICAgIC8vIGlzIG5vdCBhdmFpbGFibGUuXG4gICAgICByZXR1cm4gISF0aGlzLnRhcmdldCAmJiB0aGlzLnRhcmdldC5pc0NvbXBsZXRlKClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWUgLy8gU2V0IGluIG9wZXJhdG9yJ3MgdGFyZ2V0KCBNb3Rpb24gb3IgVGV4dE9iamVjdCApXG4gICAgfVxuICB9XG5cbiAgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0SW5WaXN1YWxNb2RlXCIpXG4gIH1cblxuICBhYm9ydCgpIHtcbiAgICBpZiAoIU9wZXJhdGlvbkFib3J0ZWRFcnJvcikgT3BlcmF0aW9uQWJvcnRlZEVycm9yID0gcmVxdWlyZShcIi4vZXJyb3JzXCIpXG4gICAgdGhyb3cgbmV3IE9wZXJhdGlvbkFib3J0ZWRFcnJvcihcImFib3J0ZWRcIilcbiAgfVxuXG4gIGdldENvdW50KG9mZnNldCA9IDApIHtcbiAgICBpZiAodGhpcy5jb3VudCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNvdW50ID0gdGhpcy52aW1TdGF0ZS5oYXNDb3VudCgpID8gdGhpcy52aW1TdGF0ZS5nZXRDb3VudCgpIDogdGhpcy5kZWZhdWx0Q291bnRcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY291bnQgKyBvZmZzZXRcbiAgfVxuXG4gIHJlc2V0Q291bnQoKSB7XG4gICAgdGhpcy5jb3VudCA9IG51bGxcbiAgfVxuXG4gIGNvdW50VGltZXMobGFzdCwgZm4pIHtcbiAgICBpZiAobGFzdCA8IDEpIHJldHVyblxuXG4gICAgbGV0IHN0b3BwZWQgPSBmYWxzZVxuICAgIGNvbnN0IHN0b3AgPSAoKSA9PiAoc3RvcHBlZCA9IHRydWUpXG4gICAgZm9yIChsZXQgY291bnQgPSAxOyBjb3VudCA8PSBsYXN0OyBjb3VudCsrKSB7XG4gICAgICBmbih7Y291bnQsIGlzRmluYWw6IGNvdW50ID09PSBsYXN0LCBzdG9wfSlcbiAgICAgIGlmIChzdG9wcGVkKSBicmVha1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlTW9kZShtb2RlLCBzdWJtb2RlKSB7XG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKG1vZGUsIHN1Ym1vZGUpKVxuICB9XG5cbiAgYWN0aXZhdGVNb2RlSWZOZWNlc3NhcnkobW9kZSwgc3VibW9kZSkge1xuICAgIGlmICghdGhpcy52aW1TdGF0ZS5pc01vZGUobW9kZSwgc3VibW9kZSkpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKG1vZGUsIHN1Ym1vZGUpXG4gICAgfVxuICB9XG5cbiAgZ2V0SW5zdGFuY2UobmFtZSwgcHJvcGVydGllcykge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldEluc3RhbmNlKHRoaXMudmltU3RhdGUsIG5hbWUsIHByb3BlcnRpZXMpXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5jYW5jZWwodGhpcylcbiAgfVxuXG4gIHByb2Nlc3NPcGVyYXRpb24oKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5wcm9jZXNzKClcbiAgfVxuXG4gIGZvY3VzU2VsZWN0TGlzdChvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm9uRGlkQ2FuY2VsU2VsZWN0TGlzdCgoKSA9PiB0aGlzLmNhbmNlbE9wZXJhdGlvbigpKVxuICAgIGlmICghc2VsZWN0TGlzdCkge1xuICAgICAgc2VsZWN0TGlzdCA9IG5ldyAocmVxdWlyZShcIi4vc2VsZWN0LWxpc3RcIikpKClcbiAgICB9XG4gICAgc2VsZWN0TGlzdC5zaG93KHRoaXMudmltU3RhdGUsIG9wdGlvbnMpXG4gIH1cblxuICBmb2N1c0lucHV0KG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghb3B0aW9ucy5vbkNvbmZpcm0pIHtcbiAgICAgIG9wdGlvbnMub25Db25maXJtID0gaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFvcHRpb25zLm9uQ2FuY2VsKSBvcHRpb25zLm9uQ2FuY2VsID0gKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKVxuICAgIGlmICghb3B0aW9ucy5vbkNoYW5nZSkgb3B0aW9ucy5vbkNoYW5nZSA9IGlucHV0ID0+IHRoaXMudmltU3RhdGUuaG92ZXIuc2V0KGlucHV0KVxuXG4gICAgdGhpcy52aW1TdGF0ZS5mb2N1c0lucHV0KG9wdGlvbnMpXG4gIH1cblxuICByZWFkQ2hhcigpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnJlYWRDaGFyKHtcbiAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXRcbiAgICAgICAgdGhpcy5wcm9jZXNzT3BlcmF0aW9uKClcbiAgICAgIH0sXG4gICAgICBvbkNhbmNlbDogKCkgPT4gdGhpcy5jYW5jZWxPcGVyYXRpb24oKSxcbiAgICB9KVxuICB9XG5cbiAgLy8gV3JhcHBlciBmb3IgdGhpcy51dGlscyA9PSBzdGFydFxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RCdWZmZXJSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdEJ1ZmZlclJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZpbUxhc3RTY3JlZW5Sb3coKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0VmltTGFzdFNjcmVlblJvdyh0aGlzLmVkaXRvcilcbiAgfVxuXG4gIGdldFZhbGlkVmltQnVmZmVyUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCByb3cpXG4gIH1cblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIC4uLmFyZ3MpXG4gIH1cblxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgfVxuXG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHRoaXMuZWRpdG9yLCByb3dSYW5nZSlcbiAgfVxuXG4gIHNjYW5Gb3J3YXJkKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24odGhpcy5lZGl0b3IsIFwiZm9yd2FyZFwiLCAuLi5hcmdzKVxuICB9XG5cbiAgc2NhbkJhY2t3YXJkKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zY2FuRWRpdG9ySW5EaXJlY3Rpb24odGhpcy5lZGl0b3IsIFwiYmFja3dhcmRcIiwgLi4uYXJncylcbiAgfVxuXG4gIGdldEZvbGRTdGFydFJvd0ZvclJvdyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHRoaXMuZWRpdG9yLCAuLi5hcmdzKVxuICB9XG5cbiAgZ2V0Rm9sZEVuZFJvd0ZvclJvdyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyh0aGlzLmVkaXRvciwgLi4uYXJncylcbiAgfVxuXG4gIGdldEJ1ZmZlclJvd3MoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmdldEJ1ZmZlclJvd3ModGhpcy5lZGl0b3IsIC4uLmFyZ3MpXG4gIH1cbiAgLy8gV3JhcHBlciBmb3IgdGhpcy51dGlscyA9PSBlbmRcblxuICBpbnN0YW5jZW9mKGtsYXNzTmFtZSkge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpcyhrbGFzc05hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RvciA9PT0gQmFzZS5nZXRDbGFzcyhrbGFzc05hbWUpXG4gIH1cblxuICBpc09wZXJhdG9yKCkge1xuICAgIC8vIERvbid0IHVzZSBgaW5zdGFuY2VvZmAgdG8gcG9zdHBvbmUgcmVxdWlyZSBmb3IgZmFzdGVyIGFjdGl2YXRpb24uXG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3Iub3BlcmF0aW9uS2luZCA9PT0gXCJvcGVyYXRvclwiXG4gIH1cblxuICBpc01vdGlvbigpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwibW90aW9uXCJcbiAgfVxuXG4gIGlzVGV4dE9iamVjdCgpIHtcbiAgICAvLyBEb24ndCB1c2UgYGluc3RhbmNlb2ZgIHRvIHBvc3Rwb25lIHJlcXVpcmUgZm9yIGZhc3RlciBhY3RpdmF0aW9uLlxuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm9wZXJhdGlvbktpbmQgPT09IFwidGV4dC1vYmplY3RcIlxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIlxuICAgICAgPyB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICAgIDogdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFwidmlzdWFsXCJcbiAgICAgID8gdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpLm1hcChzZWxlY3Rpb24gPT4gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pKVxuICAgICAgOiB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuICB9XG5cbiAgZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zT3JkZXJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5zb3J0UG9pbnRzKHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkpXG4gIH1cblxuICBnZXRCdWZmZXJQb3NpdGlvbkZvckN1cnNvcihjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBcInZpc3VhbFwiID8gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihjdXJzb3Iuc2VsZWN0aW9uKSA6IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIH1cblxuICBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKFwiaGVhZFwiLCB7ZnJvbTogW1wicHJvcGVydHlcIiwgXCJzZWxlY3Rpb25cIl19KVxuICB9XG5cbiAgZ2V0VHlwZU9wZXJhdGlvblR5cGVDaGFyKCkge1xuICAgIGNvbnN0IHtvcGVyYXRpb25LaW5kfSA9IHRoaXMuY29uc3RydWN0b3JcbiAgICBpZiAob3BlcmF0aW9uS2luZCA9PT0gXCJvcGVyYXRvclwiKSByZXR1cm4gXCJPXCJcbiAgICBlbHNlIGlmIChvcGVyYXRpb25LaW5kID09PSBcInRleHQtb2JqZWN0XCIpIHJldHVybiBcIlRcIlxuICAgIGVsc2UgaWYgKG9wZXJhdGlvbktpbmQgPT09IFwibW90aW9uXCIpIHJldHVybiBcIk1cIlxuICAgIGVsc2UgaWYgKG9wZXJhdGlvbktpbmQgPT09IFwibWlzYy1jb21tYW5kXCIpIHJldHVybiBcIlhcIlxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgYmFzZSA9IGAke3RoaXMubmFtZX08JHt0aGlzLmdldFR5cGVPcGVyYXRpb25UeXBlQ2hhcigpfT5gXG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0ID8gYCR7YmFzZX17dGFyZ2V0ID0gJHt0aGlzLnRhcmdldC50b1N0cmluZygpfX1gIDogYmFzZVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICB9XG5cbiAgZ2V0Q29tbWFuZE5hbWVXaXRob3V0UHJlZml4KCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lV2l0aG91dFByZWZpeCgpXG4gIH1cblxuICBzdGF0aWMgd3JpdGVDb21tYW5kVGFibGVPbkRpc2soKSB7XG4gICAgY29uc3QgY29tbWFuZFRhYmxlID0gdGhpcy5nZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKClcbiAgICBjb25zdCBfID0gX3BsdXMoKVxuICAgIGlmIChfLmlzRXF1YWwodGhpcy5jb21tYW5kVGFibGUsIGNvbW1hbmRUYWJsZSkpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiTm8gY2hhbmdlcyBpbiBjb21tYW5kVGFibGVcIiwge2Rpc21pc3NhYmxlOiB0cnVlfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghQ1NPTikgQ1NPTiA9IHJlcXVpcmUoXCJzZWFzb25cIilcbiAgICBpZiAoIXBhdGgpIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG4gICAgbGV0IGxvYWRhYmxlQ1NPTlRleHQgPSBcIiMgVGhpcyBmaWxlIGlzIGF1dG8gZ2VuZXJhdGVkIGJ5IGB2aW0tbW9kZS1wbHVzOndyaXRlLWNvbW1hbmQtdGFibGUtb24tZGlza2AgY29tbWFuZC5cXG5cIlxuICAgIGxvYWRhYmxlQ1NPTlRleHQgKz0gXCIjIERPTlQgZWRpdCBtYW51YWxseS5cXG5cIlxuICAgIGxvYWRhYmxlQ1NPTlRleHQgKz0gXCJtb2R1bGUuZXhwb3J0cyA9XFxuXCJcbiAgICBsb2FkYWJsZUNTT05UZXh0ICs9IENTT04uc3RyaW5naWZ5KGNvbW1hbmRUYWJsZSkgKyBcIlxcblwiXG5cbiAgICBjb25zdCBjb21tYW5kVGFibGVQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCJjb21tYW5kLXRhYmxlLmNvZmZlZVwiKVxuICAgIGNvbnN0IG9wZW5PcHRpb24gPSB7YWN0aXZhdGVQYW5lOiBmYWxzZSwgYWN0aXZhdGVJdGVtOiBmYWxzZX1cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGNvbW1hbmRUYWJsZVBhdGgsIG9wZW5PcHRpb24pLnRoZW4oZWRpdG9yID0+IHtcbiAgICAgIGVkaXRvci5zZXRUZXh0KGxvYWRhYmxlQ1NPTlRleHQpXG4gICAgICBlZGl0b3Iuc2F2ZSgpXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIlVwZGF0ZWQgY29tbWFuZFRhYmxlXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgfSlcbiAgfVxuXG4gIHN0YXRpYyBnZW5lcmF0ZUNvbW1hbmRUYWJsZUJ5RWFnZXJMb2FkKCkge1xuICAgIC8vIE5PVEU6IGNoYW5naW5nIG9yZGVyIGFmZmVjdHMgb3V0cHV0IG9mIGxpYi9jb21tYW5kLXRhYmxlLmNvZmZlZVxuICAgIGNvbnN0IGZpbGVzVG9Mb2FkID0gW1xuICAgICAgXCIuL29wZXJhdG9yXCIsXG4gICAgICBcIi4vb3BlcmF0b3ItaW5zZXJ0XCIsXG4gICAgICBcIi4vb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZ1wiLFxuICAgICAgXCIuL21vdGlvblwiLFxuICAgICAgXCIuL21vdGlvbi1zZWFyY2hcIixcbiAgICAgIFwiLi90ZXh0LW9iamVjdFwiLFxuICAgICAgXCIuL21pc2MtY29tbWFuZFwiLFxuICAgIF1cbiAgICBmaWxlc1RvTG9hZC5mb3JFYWNoKGxvYWRWbXBPcGVyYXRpb25GaWxlKVxuICAgIGNvbnN0IF8gPSBfcGx1cygpXG4gICAgY29uc3Qga2xhc3Nlc0dyb3VwZWRCeUZpbGUgPSBfLmdyb3VwQnkoXy52YWx1ZXMoQ0xBU1NfUkVHSVNUUlkpLCBrbGFzcyA9PiBrbGFzcy5maWxlKVxuXG4gICAgY29uc3QgY29tbWFuZFRhYmxlID0ge31cbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXNUb0xvYWQpIHtcbiAgICAgIGZvciAoY29uc3Qga2xhc3Mgb2Yga2xhc3Nlc0dyb3VwZWRCeUZpbGVbZmlsZV0pIHtcbiAgICAgICAgY29tbWFuZFRhYmxlW2tsYXNzLm5hbWVdID0ga2xhc3MuY29tbWFuZFxuICAgICAgICAgID8ge2ZpbGU6IGtsYXNzLmZpbGUsIGNvbW1hbmROYW1lOiBrbGFzcy5nZXRDb21tYW5kTmFtZSgpLCBjb21tYW5kU2NvcGU6IGtsYXNzLmNvbW1hbmRTY29wZX1cbiAgICAgICAgICA6IHtmaWxlOiBrbGFzcy5maWxlfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tbWFuZFRhYmxlXG4gIH1cblxuICBzdGF0aWMgaW5pdChnZXRFZGl0b3JTdGF0ZSkge1xuICAgIHRoaXMuZ2V0RWRpdG9yU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZVxuXG4gICAgdGhpcy5jb21tYW5kVGFibGUgPSByZXF1aXJlKFwiLi9jb21tYW5kLXRhYmxlXCIpXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IFtdXG4gICAgZm9yIChjb25zdCBuYW1lIGluIHRoaXMuY29tbWFuZFRhYmxlKSB7XG4gICAgICBjb25zdCBzcGVjID0gdGhpcy5jb21tYW5kVGFibGVbbmFtZV1cbiAgICAgIGlmIChzcGVjLmNvbW1hbmROYW1lKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbnMucHVzaCh0aGlzLnJlZ2lzdGVyQ29tbWFuZEZyb21TcGVjKG5hbWUsIHNwZWMpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uc1xuICB9XG5cbiAgc3RhdGljIHJlZ2lzdGVyKGNvbW1hbmQgPSB0cnVlKSB7XG4gICAgdGhpcy5jb21tYW5kID0gY29tbWFuZFxuICAgIHRoaXMuZmlsZSA9IFZNUF9MT0FESU5HX0ZJTEVcbiAgICBpZiAodGhpcy5uYW1lIGluIENMQVNTX1JFR0lTVFJZKSB7XG4gICAgICBjb25zb2xlLndhcm4oYER1cGxpY2F0ZSBjb25zdHJ1Y3RvciAke3RoaXMubmFtZX1gKVxuICAgIH1cbiAgICBDTEFTU19SRUdJU1RSWVt0aGlzLm5hbWVdID0gdGhpc1xuICB9XG5cbiAgc3RhdGljIGV4dGVuZCguLi5hcmdzKSB7XG4gICAgY29uc29sZS5lcnJvcihcImNhbGxpbmcgZGVwcmVjYXRlZCBCYXNlLmV4dGVuZCgpLCB1c2UgQmFzZS5yZWdpc3RlciBpbnN0ZWFkIVwiKVxuICAgIHRoaXMucmVnaXN0ZXIoLi4uYXJncylcbiAgfVxuXG4gIHN0YXRpYyBnZXRDbGFzcyhuYW1lKSB7XG4gICAgaWYgKG5hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHJldHVybiBDTEFTU19SRUdJU1RSWVtuYW1lXVxuXG4gICAgY29uc3QgZmlsZVRvTG9hZCA9IHRoaXMuY29tbWFuZFRhYmxlW25hbWVdLmZpbGVcbiAgICBpZiAoYXRvbS5pbkRldk1vZGUoKSAmJiBzZXR0aW5ncy5nZXQoXCJkZWJ1Z1wiKSkge1xuICAgICAgY29uc29sZS5sb2coYGxhenktcmVxdWlyZTogJHtmaWxlVG9Mb2FkfSBmb3IgJHtuYW1lfWApXG4gICAgfVxuICAgIGxvYWRWbXBPcGVyYXRpb25GaWxlKGZpbGVUb0xvYWQpXG4gICAgaWYgKG5hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHJldHVybiBDTEFTU19SRUdJU1RSWVtuYW1lXVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBjbGFzcyAnJHtuYW1lfScgbm90IGZvdW5kYClcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSh2aW1TdGF0ZSwga2xhc3MsIHByb3BlcnRpZXMpIHtcbiAgICBrbGFzcyA9IHR5cGVvZiBrbGFzcyA9PT0gXCJmdW5jdGlvblwiID8ga2xhc3MgOiBCYXNlLmdldENsYXNzKGtsYXNzKVxuICAgIGNvbnN0IG9iamVjdCA9IG5ldyBrbGFzcyh2aW1TdGF0ZSlcbiAgICBpZiAocHJvcGVydGllcykgT2JqZWN0LmFzc2lnbihvYmplY3QsIHByb3BlcnRpZXMpXG4gICAgb2JqZWN0LmluaXRpYWxpemUoKVxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIHN0YXRpYyBnZXRDbGFzc1JlZ2lzdHJ5KCkge1xuICAgIHJldHVybiBDTEFTU19SRUdJU1RSWVxuICB9XG5cbiAgc3RhdGljIGdldENvbW1hbmROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmNvbW1hbmRQcmVmaXggKyBcIjpcIiArIF9wbHVzKCkuZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyBnZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKSB7XG4gICAgcmV0dXJuIF9wbHVzKCkuZGFzaGVyaXplKHRoaXMubmFtZSlcbiAgfVxuXG4gIHN0YXRpYyByZWdpc3RlckNvbW1hbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVnaXN0ZXJDb21tYW5kRnJvbVNwZWModGhpcy5uYW1lLCB7XG4gICAgICBjb21tYW5kU2NvcGU6IHRoaXMuY29tbWFuZFNjb3BlLFxuICAgICAgY29tbWFuZE5hbWU6IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSxcbiAgICAgIGdldENsYXNzOiAoKSA9PiB0aGlzLFxuICAgIH0pXG4gIH1cblxuICBzdGF0aWMgcmVnaXN0ZXJDb21tYW5kRnJvbVNwZWMobmFtZSwgc3BlYykge1xuICAgIGxldCB7Y29tbWFuZFNjb3BlID0gXCJhdG9tLXRleHQtZWRpdG9yXCIsIGNvbW1hbmRQcmVmaXggPSBcInZpbS1tb2RlLXBsdXNcIiwgY29tbWFuZE5hbWUsIGdldENsYXNzfSA9IHNwZWNcbiAgICBpZiAoIWNvbW1hbmROYW1lKSBjb21tYW5kTmFtZSA9IGNvbW1hbmRQcmVmaXggKyBcIjpcIiArIF9wbHVzKCkuZGFzaGVyaXplKG5hbWUpXG4gICAgaWYgKCFnZXRDbGFzcykgZ2V0Q2xhc3MgPSBuYW1lID0+IHRoaXMuZ2V0Q2xhc3MobmFtZSlcblxuICAgIGNvbnN0IGdldEVkaXRvclN0YXRlID0gdGhpcy5nZXRFZGl0b3JTdGF0ZVxuICAgIHJldHVybiBhdG9tLmNvbW1hbmRzLmFkZChjb21tYW5kU2NvcGUsIGNvbW1hbmROYW1lLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgY29uc3QgdmltU3RhdGUgPSBnZXRFZGl0b3JTdGF0ZSh0aGlzLmdldE1vZGVsKCkpIHx8IGdldEVkaXRvclN0YXRlKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICAgIGlmICh2aW1TdGF0ZSkgdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKGdldENsYXNzKG5hbWUpKSAvLyB2aW1TdGF0ZSBwb3NzaWJseSBiZSB1bmRlZmluZWQgU2VlICM4NVxuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB9KVxuICB9XG5cbiAgc3RhdGljIGdldEtpbmRGb3JDb21tYW5kTmFtZShjb21tYW5kKSB7XG4gICAgY29uc3QgY29tbWFuZFdpdGhvdXRQcmVmaXggPSBjb21tYW5kLnJlcGxhY2UoL152aW0tbW9kZS1wbHVzOi8sIFwiXCIpXG4gICAgY29uc3Qge2NhcGl0YWxpemUsIGNhbWVsaXplfSA9IF9wbHVzKClcbiAgICBjb25zdCBjb21tYW5kQ2xhc3NOYW1lID0gY2FwaXRhbGl6ZShjYW1lbGl6ZShjb21tYW5kV2l0aG91dFByZWZpeCkpXG4gICAgaWYgKGNvbW1hbmRDbGFzc05hbWUgaW4gQ0xBU1NfUkVHSVNUUlkpIHtcbiAgICAgIHJldHVybiBDTEFTU19SRUdJU1RSWVtjb21tYW5kQ2xhc3NOYW1lXS5vcGVyYXRpb25LaW5kXG4gICAgfVxuICB9XG5cbiAgLy8gUHJveHkgcHJvcHBlcnRpZXMgYW5kIG1ldGhvZHNcbiAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZ2V0IG1vZGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN1Ym1vZGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN1Ym1vZGUgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0IHN3cmFwKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5zd3JhcCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgdXRpbHMoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnV0aWxzIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBlZGl0b3IoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVkaXRvciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZWRpdG9yRWxlbWVudCgpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZWRpdG9yRWxlbWVudCB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgZ2xvYmFsU3RhdGUoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdsb2JhbFN0YXRlIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBtdXRhdGlvbk1hbmFnZXIoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm11dGF0aW9uTWFuYWdlciB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXQgb2NjdXJyZW5jZU1hbmFnZXIoKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGdldCBwZXJzaXN0ZW50U2VsZWN0aW9uKCkgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uIH0gLy8gcHJldHRpZXItaWdub3JlXG5cbiAgb25EaWRDaGFuZ2VTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENoYW5nZVNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDYW5jZWxTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENhbmNlbFNlYXJjaCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZENvbW1hbmRTZWFyY2goLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRTZXRUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbkRpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkU2V0VGFyZ2V0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZFNldFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5vbldpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0V2lsbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIGVtaXREaWRTZWxlY3RUYXJnZXQoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5lbWl0RGlkU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBlbWl0RGlkRmFpbFNlbGVjdFRhcmdldCguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXREaWRGYWlsU2VsZWN0VGFyZ2V0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdFdpbGxGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmVtaXRXaWxsRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRGaW5pc2hNdXRhdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRmluaXNoTXV0YXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUuZW1pdERpZEZpbmlzaE11dGF0aW9uKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uRGlkRmluaXNoT3BlcmF0aW9uKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRSZXNldE9wZXJhdGlvblN0YWNrKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbEFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uV2lsbEFjdGl2YXRlTW9kZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBvbkRpZEFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkQWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIHByZWVtcHRXaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5wcmVlbXB0V2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIG9uV2lsbERlYWN0aXZhdGVNb2RlKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25XaWxsRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWREZWFjdGl2YXRlTW9kZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLm9uRGlkRGVhY3RpdmF0ZU1vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgb25EaWRDYW5jZWxTZWxlY3RMaXN0KC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMudmltU3RhdGUub25EaWRDYW5jZWxTZWxlY3RMaXN0KC4uLmFyZ3MpIH0gLy8gcHJldHRpZXItaWdub3JlXG4gIHN1YnNjcmliZSguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLnN1YnNjcmliZSguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBpc01vZGUoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5pc01vZGUoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucyguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbiguLi5hcmdzKSB7IHJldHVybiB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbiAgYWRkVG9DbGFzc0xpc3QoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5hZGRUb0NsYXNzTGlzdCguLi5hcmdzKSB9IC8vIHByZXR0aWVyLWlnbm9yZVxuICBnZXRDb25maWcoLi4uYXJncykgeyByZXR1cm4gdGhpcy52aW1TdGF0ZS5nZXRDb25maWcoLi4uYXJncykgfSAvLyBwcmV0dGllci1pZ25vcmVcbn1cbkJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuIl19