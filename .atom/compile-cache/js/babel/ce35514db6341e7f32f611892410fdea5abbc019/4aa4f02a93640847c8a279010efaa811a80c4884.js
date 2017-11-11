"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("atom");

var BufferedProcess = _require.BufferedProcess;
var Range = _require.Range;

var Base = require("./base");
var Operator = Base.getClass("Operator");

// TransformString
// ================================

var TransformString = (function (_Operator) {
  _inherits(TransformString, _Operator);

  function TransformString() {
    _classCallCheck(this, TransformString);

    _get(Object.getPrototypeOf(TransformString.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = "stayOnTransformString";
    this.autoIndent = false;
    this.autoIndentNewline = false;
    this.autoIndentAfterInsertText = false;
  }

  _createClass(TransformString, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var text = this.getNewText(selection.getText(), selection);
      if (text) {
        var startRowIndentLevel = undefined;
        if (this.autoIndentAfterInsertText) {
          var startRow = selection.getBufferRange().start.row;
          startRowIndentLevel = this.editor.indentationForBufferRow(startRow);
        }
        var range = selection.insertText(text, { autoIndent: this.autoIndent, autoIndentNewline: this.autoIndentNewline });

        if (this.autoIndentAfterInsertText) {
          // Currently used by SplitArguments and Surround( linewise target only )
          if (this.target.isLinewise()) {
            range = range.translate([0, 0], [-1, 0]);
          }
          this.editor.setIndentationForBufferRow(range.start.row, startRowIndentLevel);
          this.editor.setIndentationForBufferRow(range.end.row, startRowIndentLevel);
          // Adjust inner range, end.row is already( if needed ) translated so no need to re-translate.
          this.utils.adjustIndentWithKeepingLayout(this.editor, range.translate([1, 0], [0, 0]));
        }
      }
    }
  }], [{
    key: "registerToSelectList",
    value: function registerToSelectList() {
      this.stringTransformers.push(this);
    }
  }, {
    key: "stringTransformers",
    value: [],
    enumerable: true
  }]);

  return TransformString;
})(Operator);

TransformString.register(false);

var ToggleCase = (function (_TransformString) {
  _inherits(ToggleCase, _TransformString);

  function ToggleCase() {
    _classCallCheck(this, ToggleCase);

    _get(Object.getPrototypeOf(ToggleCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ToggleCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.replace(/./g, this.utils.toggleCaseForCharacter);
    }
  }], [{
    key: "displayName",
    value: "Toggle ~",
    enumerable: true
  }]);

  return ToggleCase;
})(TransformString);

ToggleCase.register();

var ToggleCaseAndMoveRight = (function (_ToggleCase) {
  _inherits(ToggleCaseAndMoveRight, _ToggleCase);

  function ToggleCaseAndMoveRight() {
    _classCallCheck(this, ToggleCaseAndMoveRight);

    _get(Object.getPrototypeOf(ToggleCaseAndMoveRight.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.restorePositions = false;
    this.target = "MoveRight";
  }

  return ToggleCaseAndMoveRight;
})(ToggleCase);

ToggleCaseAndMoveRight.register();

var UpperCase = (function (_TransformString2) {
  _inherits(UpperCase, _TransformString2);

  function UpperCase() {
    _classCallCheck(this, UpperCase);

    _get(Object.getPrototypeOf(UpperCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UpperCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.toUpperCase();
    }
  }], [{
    key: "displayName",
    value: "Upper",
    enumerable: true
  }]);

  return UpperCase;
})(TransformString);

UpperCase.register();

var LowerCase = (function (_TransformString3) {
  _inherits(LowerCase, _TransformString3);

  function LowerCase() {
    _classCallCheck(this, LowerCase);

    _get(Object.getPrototypeOf(LowerCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(LowerCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.toLowerCase();
    }
  }], [{
    key: "displayName",
    value: "Lower",
    enumerable: true
  }]);

  return LowerCase;
})(TransformString);

LowerCase.register();

// Replace
// -------------------------

var Replace = (function (_TransformString4) {
  _inherits(Replace, _TransformString4);

  function Replace() {
    _classCallCheck(this, Replace);

    _get(Object.getPrototypeOf(Replace.prototype), "constructor", this).apply(this, arguments);

    this.flashCheckpoint = "did-select-occurrence";
    this.input = null;
    this.requireInput = true;
    this.autoIndentNewline = true;
    this.supportEarlySelect = true;
  }

  _createClass(Replace, [{
    key: "initialize",
    value: function initialize() {
      var _this = this;

      this.onDidSelectTarget(function () {
        return _this.focusInput({ hideCursor: true });
      });
      return _get(Object.getPrototypeOf(Replace.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      if (this.target.is("MoveRightBufferColumn") && text.length !== this.getCount()) {
        return;
      }

      var input = this.input || "\n";
      if (input === "\n") {
        this.restorePositions = false;
      }
      return text.replace(/./g, input);
    }
  }]);

  return Replace;
})(TransformString);

Replace.register();

var ReplaceCharacter = (function (_Replace) {
  _inherits(ReplaceCharacter, _Replace);

  function ReplaceCharacter() {
    _classCallCheck(this, ReplaceCharacter);

    _get(Object.getPrototypeOf(ReplaceCharacter.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRightBufferColumn";
  }

  return ReplaceCharacter;
})(Replace);

ReplaceCharacter.register();

// -------------------------
// DUP meaning with SplitString need consolidate.

var SplitByCharacter = (function (_TransformString5) {
  _inherits(SplitByCharacter, _TransformString5);

  function SplitByCharacter() {
    _classCallCheck(this, SplitByCharacter);

    _get(Object.getPrototypeOf(SplitByCharacter.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SplitByCharacter, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.split("").join(" ");
    }
  }]);

  return SplitByCharacter;
})(TransformString);

SplitByCharacter.register();

var CamelCase = (function (_TransformString6) {
  _inherits(CamelCase, _TransformString6);

  function CamelCase() {
    _classCallCheck(this, CamelCase);

    _get(Object.getPrototypeOf(CamelCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CamelCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.camelize(text);
    }
  }], [{
    key: "displayName",
    value: "Camelize",
    enumerable: true
  }]);

  return CamelCase;
})(TransformString);

CamelCase.register();

var SnakeCase = (function (_TransformString7) {
  _inherits(SnakeCase, _TransformString7);

  function SnakeCase() {
    _classCallCheck(this, SnakeCase);

    _get(Object.getPrototypeOf(SnakeCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SnakeCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.underscore(text);
    }
  }], [{
    key: "displayName",
    value: "Underscore _",
    enumerable: true
  }]);

  return SnakeCase;
})(TransformString);

SnakeCase.register();

var PascalCase = (function (_TransformString8) {
  _inherits(PascalCase, _TransformString8);

  function PascalCase() {
    _classCallCheck(this, PascalCase);

    _get(Object.getPrototypeOf(PascalCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PascalCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.capitalize(_.camelize(text));
    }
  }], [{
    key: "displayName",
    value: "Pascalize",
    enumerable: true
  }]);

  return PascalCase;
})(TransformString);

PascalCase.register();

var DashCase = (function (_TransformString9) {
  _inherits(DashCase, _TransformString9);

  function DashCase() {
    _classCallCheck(this, DashCase);

    _get(Object.getPrototypeOf(DashCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DashCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.dasherize(text);
    }
  }], [{
    key: "displayName",
    value: "Dasherize -",
    enumerable: true
  }]);

  return DashCase;
})(TransformString);

DashCase.register();

var TitleCase = (function (_TransformString10) {
  _inherits(TitleCase, _TransformString10);

  function TitleCase() {
    _classCallCheck(this, TitleCase);

    _get(Object.getPrototypeOf(TitleCase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TitleCase, [{
    key: "getNewText",
    value: function getNewText(text) {
      return _.humanizeEventName(_.dasherize(text));
    }
  }], [{
    key: "displayName",
    value: "Titlize",
    enumerable: true
  }]);

  return TitleCase;
})(TransformString);

TitleCase.register();

var EncodeUriComponent = (function (_TransformString11) {
  _inherits(EncodeUriComponent, _TransformString11);

  function EncodeUriComponent() {
    _classCallCheck(this, EncodeUriComponent);

    _get(Object.getPrototypeOf(EncodeUriComponent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(EncodeUriComponent, [{
    key: "getNewText",
    value: function getNewText(text) {
      return encodeURIComponent(text);
    }
  }], [{
    key: "displayName",
    value: "Encode URI Component %",
    enumerable: true
  }]);

  return EncodeUriComponent;
})(TransformString);

EncodeUriComponent.register();

var DecodeUriComponent = (function (_TransformString12) {
  _inherits(DecodeUriComponent, _TransformString12);

  function DecodeUriComponent() {
    _classCallCheck(this, DecodeUriComponent);

    _get(Object.getPrototypeOf(DecodeUriComponent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DecodeUriComponent, [{
    key: "getNewText",
    value: function getNewText(text) {
      return decodeURIComponent(text);
    }
  }], [{
    key: "displayName",
    value: "Decode URI Component %%",
    enumerable: true
  }]);

  return DecodeUriComponent;
})(TransformString);

DecodeUriComponent.register();

var TrimString = (function (_TransformString13) {
  _inherits(TrimString, _TransformString13);

  function TrimString() {
    _classCallCheck(this, TrimString);

    _get(Object.getPrototypeOf(TrimString.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TrimString, [{
    key: "getNewText",
    value: function getNewText(text) {
      return text.trim();
    }
  }], [{
    key: "displayName",
    value: "Trim string",
    enumerable: true
  }]);

  return TrimString;
})(TransformString);

TrimString.register();

var CompactSpaces = (function (_TransformString14) {
  _inherits(CompactSpaces, _TransformString14);

  function CompactSpaces() {
    _classCallCheck(this, CompactSpaces);

    _get(Object.getPrototypeOf(CompactSpaces.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CompactSpaces, [{
    key: "getNewText",
    value: function getNewText(text) {
      if (text.match(/^[ ]+$/)) {
        return " ";
      } else {
        // Don't compact for leading and trailing white spaces.
        var regex = /^(\s*)(.*?)(\s*)$/gm;
        return text.replace(regex, function (m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(" ") + trailing;
        });
      }
    }
  }], [{
    key: "displayName",
    value: "Compact space",
    enumerable: true
  }]);

  return CompactSpaces;
})(TransformString);

CompactSpaces.register();

var AlignOccurrence = (function (_TransformString15) {
  _inherits(AlignOccurrence, _TransformString15);

  function AlignOccurrence() {
    _classCallCheck(this, AlignOccurrence);

    _get(Object.getPrototypeOf(AlignOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
    this.which = "auto";
  }

  _createClass(AlignOccurrence, [{
    key: "getSelectionTaker",
    value: function getSelectionTaker() {
      var selectionsByRow = _.groupBy(this.editor.getSelectionsOrderedByBufferPosition(), function (selection) {
        return selection.getBufferRange().start.row;
      });

      return function () {
        var rows = Object.keys(selectionsByRow);
        var selections = rows.map(function (row) {
          return selectionsByRow[row].shift();
        }).filter(function (s) {
          return s;
        });
        return selections;
      };
    }
  }, {
    key: "getWichToAlignForText",
    value: function getWichToAlignForText(text) {
      if (this.which !== "auto") return this.which;

      if (/^\s*=\s*$/.test(text)) {
        // Asignment
        return "start";
      } else if (/^\s*,\s*$/.test(text)) {
        // Arguments
        return "end";
      } else if (/\W$/.test(text)) {
        // ends with non-word-char
        return "end";
      } else {
        return "start";
      }
    }
  }, {
    key: "calculatePadding",
    value: function calculatePadding() {
      var _this2 = this;

      var totalAmountOfPaddingByRow = {};
      var columnForSelection = function columnForSelection(selection) {
        var which = _this2.getWichToAlignForText(selection.getText());
        var point = selection.getBufferRange()[which];
        return point.column + (totalAmountOfPaddingByRow[point.row] || 0);
      };

      var takeSelections = this.getSelectionTaker();
      while (true) {
        var selections = takeSelections();
        if (!selections.length) return;
        var maxColumn = selections.map(columnForSelection).reduce(function (max, cur) {
          return cur > max ? cur : max;
        });
        for (var selection of selections) {
          var row = selection.getBufferRange().start.row;
          var amountOfPadding = maxColumn - columnForSelection(selection);
          totalAmountOfPaddingByRow[row] = (totalAmountOfPaddingByRow[row] || 0) + amountOfPadding;
          this.amountOfPaddingBySelection.set(selection, amountOfPadding);
        }
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this3 = this;

      this.amountOfPaddingBySelection = new Map();
      this.onDidSelectTarget(function () {
        _this3.calculatePadding();
      });
      _get(Object.getPrototypeOf(AlignOccurrence.prototype), "execute", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text, selection) {
      var padding = " ".repeat(this.amountOfPaddingBySelection.get(selection));
      var which = this.getWichToAlignForText(selection.getText());
      return which === "start" ? padding + text : text + padding;
    }
  }]);

  return AlignOccurrence;
})(TransformString);

AlignOccurrence.register();

var AlignStartOfOccurrence = (function (_AlignOccurrence) {
  _inherits(AlignStartOfOccurrence, _AlignOccurrence);

  function AlignStartOfOccurrence() {
    _classCallCheck(this, AlignStartOfOccurrence);

    _get(Object.getPrototypeOf(AlignStartOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.which = "start";
  }

  return AlignStartOfOccurrence;
})(AlignOccurrence);

AlignStartOfOccurrence.register();

var AlignEndOfOccurrence = (function (_AlignOccurrence2) {
  _inherits(AlignEndOfOccurrence, _AlignOccurrence2);

  function AlignEndOfOccurrence() {
    _classCallCheck(this, AlignEndOfOccurrence);

    _get(Object.getPrototypeOf(AlignEndOfOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
  }

  return AlignEndOfOccurrence;
})(AlignOccurrence);

AlignEndOfOccurrence.register();

var RemoveLeadingWhiteSpaces = (function (_TransformString16) {
  _inherits(RemoveLeadingWhiteSpaces, _TransformString16);

  function RemoveLeadingWhiteSpaces() {
    _classCallCheck(this, RemoveLeadingWhiteSpaces);

    _get(Object.getPrototypeOf(RemoveLeadingWhiteSpaces.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(RemoveLeadingWhiteSpaces, [{
    key: "getNewText",
    value: function getNewText(text, selection) {
      var trimLeft = function trimLeft(text) {
        return text.trimLeft();
      };
      return splitTextByNewLine(text).map(trimLeft).join("\n") + "\n";
    }
  }]);

  return RemoveLeadingWhiteSpaces;
})(TransformString);

RemoveLeadingWhiteSpaces.register();

var ConvertToSoftTab = (function (_TransformString17) {
  _inherits(ConvertToSoftTab, _TransformString17);

  function ConvertToSoftTab() {
    _classCallCheck(this, ConvertToSoftTab);

    _get(Object.getPrototypeOf(ConvertToSoftTab.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(ConvertToSoftTab, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this4 = this;

      return this.scanForward(/\t/g, { scanRange: selection.getBufferRange() }, function (_ref) {
        var range = _ref.range;
        var replace = _ref.replace;

        // Replace \t to spaces which length is vary depending on tabStop and tabLenght
        // So we directly consult it's screen representing length.
        var length = _this4.editor.screenRangeForBufferRange(range).getExtent().column;
        return replace(" ".repeat(length));
      });
    }
  }], [{
    key: "displayName",
    value: "Soft Tab",
    enumerable: true
  }]);

  return ConvertToSoftTab;
})(TransformString);

ConvertToSoftTab.register();

var ConvertToHardTab = (function (_TransformString18) {
  _inherits(ConvertToHardTab, _TransformString18);

  function ConvertToHardTab() {
    _classCallCheck(this, ConvertToHardTab);

    _get(Object.getPrototypeOf(ConvertToHardTab.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ConvertToHardTab, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this5 = this;

      var tabLength = this.editor.getTabLength();
      this.scanForward(/[ \t]+/g, { scanRange: selection.getBufferRange() }, function (_ref2) {
        var range = _ref2.range;
        var replace = _ref2.replace;

        var _editor$screenRangeForBufferRange = _this5.editor.screenRangeForBufferRange(range);

        var start = _editor$screenRangeForBufferRange.start;
        var end = _editor$screenRangeForBufferRange.end;

        var startColumn = start.column;
        var endColumn = end.column;

        // We can't naively replace spaces to tab, we have to consider valid tabStop column
        // If nextTabStop column exceeds replacable range, we pad with spaces.
        var newText = "";
        while (true) {
          var remainder = startColumn % tabLength;
          var nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
          if (nextTabStop > endColumn) {
            newText += " ".repeat(endColumn - startColumn);
          } else {
            newText += "\t";
          }
          startColumn = nextTabStop;
          if (startColumn >= endColumn) {
            break;
          }
        }

        replace(newText);
      });
    }
  }], [{
    key: "displayName",
    value: "Hard Tab",
    enumerable: true
  }]);

  return ConvertToHardTab;
})(TransformString);

ConvertToHardTab.register();

// -------------------------

var TransformStringByExternalCommand = (function (_TransformString19) {
  _inherits(TransformStringByExternalCommand, _TransformString19);

  function TransformStringByExternalCommand() {
    _classCallCheck(this, TransformStringByExternalCommand);

    _get(Object.getPrototypeOf(TransformStringByExternalCommand.prototype), "constructor", this).apply(this, arguments);

    this.autoIndent = true;
    this.command = "";
    this.args = [];
    this.stdoutBySelection = null;
  }

  _createClass(TransformStringByExternalCommand, [{
    key: "execute",
    value: function execute() {
      var _this6 = this;

      this.normalizeSelectionsIfNecessary();
      if (this.selectTarget()) {
        return new Promise(function (resolve) {
          return _this6.collect(resolve);
        }).then(function () {
          for (var selection of _this6.editor.getSelections()) {
            var text = _this6.getNewText(selection.getText(), selection);
            selection.insertText(text, { autoIndent: _this6.autoIndent });
          }
          _this6.restoreCursorPositionsIfNecessary();
          _this6.activateMode("normal");
        });
      }
    }
  }, {
    key: "collect",
    value: function collect(resolve) {
      var _this7 = this;

      this.stdoutBySelection = new Map();
      var processFinished = 0,
          processRunning = 0;

      var _loop = function (selection) {
        var _ref3 = _this7.getCommand(selection) || {};

        var command = _ref3.command;
        var args = _ref3.args;

        if (command == null || args == null) return {
            v: undefined
          };

        processRunning++;
        _this7.runExternalCommand({
          command: command,
          args: args,
          stdin: _this7.getStdin(selection),
          stdout: function stdout(output) {
            return _this7.stdoutBySelection.set(selection, output);
          },
          exit: function exit(code) {
            processFinished++;
            if (processRunning === processFinished) resolve();
          }
        });
      };

      for (var selection of this.editor.getSelections()) {
        var _ret = _loop(selection);

        if (typeof _ret === "object") return _ret.v;
      }
    }
  }, {
    key: "runExternalCommand",
    value: function runExternalCommand(options) {
      var _this8 = this;

      var stdin = options.stdin;

      delete options.stdin;
      var bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError(function (_ref4) {
        var error = _ref4.error;
        var handle = _ref4.handle;

        // Suppress command not found error intentionally.
        if (error.code === "ENOENT" && error.syscall.indexOf("spawn") === 0) {
          console.log(_this8.getCommandName() + ": Failed to spawn command " + error.path + ".");
          handle();
        }
        _this8.cancelOperation();
      });

      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        bufferedProcess.process.stdin.end();
      }
    }
  }, {
    key: "getNewText",
    value: function getNewText(text, selection) {
      return this.getStdout(selection) || text;
    }

    // For easily extend by vmp plugin.
  }, {
    key: "getCommand",
    value: function getCommand(selection) {
      return { command: this.command, args: this.args };
    }
  }, {
    key: "getStdin",
    value: function getStdin(selection) {
      return selection.getText();
    }
  }, {
    key: "getStdout",
    value: function getStdout(selection) {
      return this.stdoutBySelection.get(selection);
    }
  }]);

  return TransformStringByExternalCommand;
})(TransformString);

TransformStringByExternalCommand.register(false);

// -------------------------

var TransformStringBySelectList = (function (_TransformString20) {
  _inherits(TransformStringBySelectList, _TransformString20);

  function TransformStringBySelectList() {
    _classCallCheck(this, TransformStringBySelectList);

    _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
  }

  _createClass(TransformStringBySelectList, [{
    key: "getItems",
    value: function getItems() {
      return this.constructor.getSelectListItems();
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this9 = this;

      this.vimState.onDidConfirmSelectList(function (item) {
        var transformer = item.klass;
        if (transformer.prototype.target) {
          _this9.target = transformer.prototype.target;
        }
        _this9.vimState.reset();
        if (_this9.target) {
          _this9.vimState.operationStack.run(transformer, { target: _this9.target });
        } else {
          _this9.vimState.operationStack.run(transformer);
        }
      });

      this.focusSelectList({ items: this.getItems() });

      return _get(Object.getPrototypeOf(TransformStringBySelectList.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      // NEVER be executed since operationStack is replaced with selected transformer
      throw new Error(this.name + " should not be executed");
    }
  }], [{
    key: "getSelectListItems",
    value: function getSelectListItems() {
      if (!this.selectListItems) {
        this.selectListItems = this.stringTransformers.map(function (klass) {
          return {
            klass: klass,
            displayName: klass.hasOwnProperty("displayName") ? klass.displayName : _.humanizeEventName(_.dasherize(klass.name))
          };
        });
      }
      return this.selectListItems;
    }
  }, {
    key: "electListItems",
    value: null,
    enumerable: true
  }]);

  return TransformStringBySelectList;
})(TransformString);

TransformStringBySelectList.register();

var TransformWordBySelectList = (function (_TransformStringBySelectList) {
  _inherits(TransformWordBySelectList, _TransformStringBySelectList);

  function TransformWordBySelectList() {
    _classCallCheck(this, TransformWordBySelectList);

    _get(Object.getPrototypeOf(TransformWordBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerWord";
  }

  return TransformWordBySelectList;
})(TransformStringBySelectList);

TransformWordBySelectList.register();

var TransformSmartWordBySelectList = (function (_TransformStringBySelectList2) {
  _inherits(TransformSmartWordBySelectList, _TransformStringBySelectList2);

  function TransformSmartWordBySelectList() {
    _classCallCheck(this, TransformSmartWordBySelectList);

    _get(Object.getPrototypeOf(TransformSmartWordBySelectList.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerSmartWord";
  }

  return TransformSmartWordBySelectList;
})(TransformStringBySelectList);

TransformSmartWordBySelectList.register();

// -------------------------

var ReplaceWithRegister = (function (_TransformString21) {
  _inherits(ReplaceWithRegister, _TransformString21);

  function ReplaceWithRegister() {
    _classCallCheck(this, ReplaceWithRegister);

    _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), "constructor", this).apply(this, arguments);

    this.flashType = "operator-long";
  }

  _createClass(ReplaceWithRegister, [{
    key: "initialize",
    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      return _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      _get(Object.getPrototypeOf(ReplaceWithRegister.prototype), "execute", this).call(this);

      for (var selection of this.editor.getSelections()) {
        var range = this.mutationManager.getMutatedBufferRangeForSelection(selection);
        this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, range);
      }
    }
  }, {
    key: "getNewText",
    value: function getNewText(text, selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      return value ? value.text : "";
    }
  }]);

  return ReplaceWithRegister;
})(TransformString);

ReplaceWithRegister.register();

// Save text to register before replace

var SwapWithRegister = (function (_TransformString22) {
  _inherits(SwapWithRegister, _TransformString22);

  function SwapWithRegister() {
    _classCallCheck(this, SwapWithRegister);

    _get(Object.getPrototypeOf(SwapWithRegister.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SwapWithRegister, [{
    key: "getNewText",
    value: function getNewText(text, selection) {
      var newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    }
  }]);

  return SwapWithRegister;
})(TransformString);

SwapWithRegister.register();

// Indent < TransformString
// -------------------------

var Indent = (function (_TransformString23) {
  _inherits(Indent, _TransformString23);

  function Indent() {
    _classCallCheck(this, Indent);

    _get(Object.getPrototypeOf(Indent.prototype), "constructor", this).apply(this, arguments);

    this.stayByMarker = true;
    this.setToFirstCharacterOnLinewise = true;
    this.wise = "linewise";
  }

  _createClass(Indent, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this10 = this;

      // Need count times indentation in visual-mode and its repeat(`.`).
      if (this.target.is("CurrentSelection")) {
        (function () {
          var oldText = undefined;
          // limit to 100 to avoid freezing by accidental big number.
          var count = _this10.utils.limitNumber(_this10.getCount(), { max: 100 });
          _this10.countTimes(count, function (_ref5) {
            var stop = _ref5.stop;

            oldText = selection.getText();
            _this10.indent(selection);
            if (selection.getText() === oldText) stop();
          });
        })();
      } else {
        this.indent(selection);
      }
    }
  }, {
    key: "indent",
    value: function indent(selection) {
      selection.indentSelectedRows();
    }
  }]);

  return Indent;
})(TransformString);

Indent.register();

var Outdent = (function (_Indent) {
  _inherits(Outdent, _Indent);

  function Outdent() {
    _classCallCheck(this, Outdent);

    _get(Object.getPrototypeOf(Outdent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Outdent, [{
    key: "indent",
    value: function indent(selection) {
      selection.outdentSelectedRows();
    }
  }]);

  return Outdent;
})(Indent);

Outdent.register();

var AutoIndent = (function (_Indent2) {
  _inherits(AutoIndent, _Indent2);

  function AutoIndent() {
    _classCallCheck(this, AutoIndent);

    _get(Object.getPrototypeOf(AutoIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(AutoIndent, [{
    key: "indent",
    value: function indent(selection) {
      selection.autoIndentSelectedRows();
    }
  }]);

  return AutoIndent;
})(Indent);

AutoIndent.register();

var ToggleLineComments = (function (_TransformString24) {
  _inherits(ToggleLineComments, _TransformString24);

  function ToggleLineComments() {
    _classCallCheck(this, ToggleLineComments);

    _get(Object.getPrototypeOf(ToggleLineComments.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.stayByMarker = true;
    this.wise = "linewise";
  }

  _createClass(ToggleLineComments, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      selection.toggleLineComments();
    }
  }]);

  return ToggleLineComments;
})(TransformString);

ToggleLineComments.register();

var Reflow = (function (_TransformString25) {
  _inherits(Reflow, _TransformString25);

  function Reflow() {
    _classCallCheck(this, Reflow);

    _get(Object.getPrototypeOf(Reflow.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Reflow, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      atom.commands.dispatch(this.editorElement, "autoflow:reflow-selection");
    }
  }]);

  return Reflow;
})(TransformString);

Reflow.register();

var ReflowWithStay = (function (_Reflow) {
  _inherits(ReflowWithStay, _Reflow);

  function ReflowWithStay() {
    _classCallCheck(this, ReflowWithStay);

    _get(Object.getPrototypeOf(ReflowWithStay.prototype), "constructor", this).apply(this, arguments);

    this.stayAtSamePosition = true;
  }

  return ReflowWithStay;
})(Reflow);

ReflowWithStay.register();

// Surround < TransformString
// -------------------------

var SurroundBase = (function (_TransformString26) {
  _inherits(SurroundBase, _TransformString26);

  function SurroundBase() {
    _classCallCheck(this, SurroundBase);

    _get(Object.getPrototypeOf(SurroundBase.prototype), "constructor", this).apply(this, arguments);

    this.pairs = [["(", ")"], ["{", "}"], ["[", "]"], ["<", ">"]];
    this.pairsByAlias = {
      b: ["(", ")"],
      B: ["{", "}"],
      r: ["[", "]"],
      a: ["<", ">"]
    };
    this.pairCharsAllowForwarding = "[](){}";
    this.input = null;
    this.requireInput = true;
    this.supportEarlySelect = true;
  }

  _createClass(SurroundBase, [{
    key: "focusInputForSurroundChar",
    // Experimental

    value: function focusInputForSurroundChar() {
      this.focusInput({ hideCursor: true });
    }
  }, {
    key: "focusInputForTargetPairChar",
    value: function focusInputForTargetPairChar() {
      var _this11 = this;

      this.focusInput({ onConfirm: function onConfirm(char) {
          return _this11.onConfirmTargetPairChar(char);
        } });
    }
  }, {
    key: "getPair",
    value: function getPair(char) {
      var pair = undefined;
      return char in this.pairsByAlias ? this.pairsByAlias[char] : [].concat(_toConsumableArray(this.pairs), [[char, char]]).find(function (pair) {
        return pair.includes(char);
      });
    }
  }, {
    key: "surround",
    value: function surround(text, char) {
      var _ref6 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref6$keepLayout = _ref6.keepLayout;
      var keepLayout = _ref6$keepLayout === undefined ? false : _ref6$keepLayout;

      var _getPair = this.getPair(char);

      var _getPair2 = _slicedToArray(_getPair, 2);

      var open = _getPair2[0];
      var close = _getPair2[1];

      if (!keepLayout && text.endsWith("\n")) {
        this.autoIndentAfterInsertText = true;
        open += "\n";
        close += "\n";
      }

      if (this.getConfig("charactersToAddSpaceOnSurround").includes(char) && this.utils.isSingleLineText(text)) {
        text = " " + text + " ";
      }

      return open + text + close;
    }
  }, {
    key: "deleteSurround",
    value: function deleteSurround(text) {
      // Assume surrounding char is one-char length.
      var open = text[0];
      var close = text[text.length - 1];
      var innerText = text.slice(1, text.length - 1);
      return this.utils.isSingleLineText(text) && open !== close ? innerText.trim() : innerText;
    }
  }, {
    key: "onConfirmTargetPairChar",
    value: function onConfirmTargetPairChar(char) {
      this.setTarget(this.getInstance("APair", { pair: this.getPair(char) }));
    }
  }]);

  return SurroundBase;
})(TransformString);

SurroundBase.register(false);

var Surround = (function (_SurroundBase) {
  _inherits(Surround, _SurroundBase);

  function Surround() {
    _classCallCheck(this, Surround);

    _get(Object.getPrototypeOf(Surround.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Surround, [{
    key: "initialize",
    value: function initialize() {
      var _this12 = this;

      this.onDidSelectTarget(function () {
        return _this12.focusInputForSurroundChar();
      });
      return _get(Object.getPrototypeOf(Surround.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      return this.surround(text, this.input);
    }
  }]);

  return Surround;
})(SurroundBase);

Surround.register();

var SurroundWord = (function (_Surround) {
  _inherits(SurroundWord, _Surround);

  function SurroundWord() {
    _classCallCheck(this, SurroundWord);

    _get(Object.getPrototypeOf(SurroundWord.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerWord";
  }

  return SurroundWord;
})(Surround);

SurroundWord.register();

var SurroundSmartWord = (function (_Surround2) {
  _inherits(SurroundSmartWord, _Surround2);

  function SurroundSmartWord() {
    _classCallCheck(this, SurroundSmartWord);

    _get(Object.getPrototypeOf(SurroundSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerSmartWord";
  }

  return SurroundSmartWord;
})(Surround);

SurroundSmartWord.register();

var MapSurround = (function (_Surround3) {
  _inherits(MapSurround, _Surround3);

  function MapSurround() {
    _classCallCheck(this, MapSurround);

    _get(Object.getPrototypeOf(MapSurround.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
    this.patternForOccurrence = /\w+/g;
  }

  return MapSurround;
})(Surround);

MapSurround.register();

// Delete Surround
// -------------------------

var DeleteSurround = (function (_SurroundBase2) {
  _inherits(DeleteSurround, _SurroundBase2);

  function DeleteSurround() {
    _classCallCheck(this, DeleteSurround);

    _get(Object.getPrototypeOf(DeleteSurround.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(DeleteSurround, [{
    key: "initialize",
    value: function initialize() {
      if (!this.target) {
        this.focusInputForTargetPairChar();
      }
      return _get(Object.getPrototypeOf(DeleteSurround.prototype), "initialize", this).call(this);
    }
  }, {
    key: "onConfirmTargetPairChar",
    value: function onConfirmTargetPairChar(char) {
      _get(Object.getPrototypeOf(DeleteSurround.prototype), "onConfirmTargetPairChar", this).call(this, char);
      this.input = char;
      this.processOperation();
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      return this.deleteSurround(text);
    }
  }]);

  return DeleteSurround;
})(SurroundBase);

DeleteSurround.register();

var DeleteSurroundAnyPair = (function (_DeleteSurround) {
  _inherits(DeleteSurroundAnyPair, _DeleteSurround);

  function DeleteSurroundAnyPair() {
    _classCallCheck(this, DeleteSurroundAnyPair);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPair";
    this.requireInput = false;
  }

  return DeleteSurroundAnyPair;
})(DeleteSurround);

DeleteSurroundAnyPair.register();

var DeleteSurroundAnyPairAllowForwarding = (function (_DeleteSurroundAnyPair) {
  _inherits(DeleteSurroundAnyPairAllowForwarding, _DeleteSurroundAnyPair);

  function DeleteSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, DeleteSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(DeleteSurroundAnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPairAllowForwarding";
  }

  return DeleteSurroundAnyPairAllowForwarding;
})(DeleteSurroundAnyPair);

DeleteSurroundAnyPairAllowForwarding.register();

// Change Surround
// -------------------------

var ChangeSurround = (function (_SurroundBase3) {
  _inherits(ChangeSurround, _SurroundBase3);

  function ChangeSurround() {
    _classCallCheck(this, ChangeSurround);

    _get(Object.getPrototypeOf(ChangeSurround.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ChangeSurround, [{
    key: "showDeleteCharOnHover",
    value: function showDeleteCharOnHover() {
      var hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      var char = this.editor.getSelectedText()[0];
      this.vimState.hover.set(char, hoverPoint);
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this13 = this;

      if (this.target) {
        this.onDidFailSelectTarget(function () {
          return _this13.abort();
        });
      } else {
        this.onDidFailSelectTarget(function () {
          return _this13.cancelOperation();
        });
        this.focusInputForTargetPairChar();
      }

      this.onDidSelectTarget(function () {
        _this13.showDeleteCharOnHover();
        _this13.focusInputForSurroundChar();
      });
      return _get(Object.getPrototypeOf(ChangeSurround.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      var innerText = this.deleteSurround(text);
      return this.surround(innerText, this.input, { keepLayout: true });
    }
  }]);

  return ChangeSurround;
})(SurroundBase);

ChangeSurround.register();

var ChangeSurroundAnyPair = (function (_ChangeSurround) {
  _inherits(ChangeSurroundAnyPair, _ChangeSurround);

  function ChangeSurroundAnyPair() {
    _classCallCheck(this, ChangeSurroundAnyPair);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPair";
  }

  return ChangeSurroundAnyPair;
})(ChangeSurround);

ChangeSurroundAnyPair.register();

var ChangeSurroundAnyPairAllowForwarding = (function (_ChangeSurroundAnyPair) {
  _inherits(ChangeSurroundAnyPairAllowForwarding, _ChangeSurroundAnyPair);

  function ChangeSurroundAnyPairAllowForwarding() {
    _classCallCheck(this, ChangeSurroundAnyPairAllowForwarding);

    _get(Object.getPrototypeOf(ChangeSurroundAnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.target = "AAnyPairAllowForwarding";
  }

  return ChangeSurroundAnyPairAllowForwarding;
})(ChangeSurroundAnyPair);

ChangeSurroundAnyPairAllowForwarding.register();

// -------------------------
// FIXME
// Currently native editor.joinLines() is better for cursor position setting
// So I use native methods for a meanwhile.

var Join = (function (_TransformString27) {
  _inherits(Join, _TransformString27);

  function Join() {
    _classCallCheck(this, Join);

    _get(Object.getPrototypeOf(Join.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToRelativeLine";
    this.flashTarget = false;
    this.restorePositions = false;
  }

  _createClass(Join, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var range = selection.getBufferRange();

      // When cursor is at last BUFFER row, it select last-buffer-row, then
      // joinning result in "clear last-buffer-row text".
      // I believe this is BUG of upstream atom-core. guard this situation here
      if (!range.isSingleLine() || range.end.row !== this.editor.getLastBufferRow()) {
        if (this.utils.isLinewiseRange(range)) {
          selection.setBufferRange(range.translate([0, 0], [-1, Infinity]));
        }
        selection.joinLines();
      }
      var point = selection.getBufferRange().end.translate([0, -1]);
      return selection.cursor.setBufferPosition(point);
    }
  }]);

  return Join;
})(TransformString);

Join.register();

var JoinBase = (function (_TransformString28) {
  _inherits(JoinBase, _TransformString28);

  function JoinBase() {
    _classCallCheck(this, JoinBase);

    _get(Object.getPrototypeOf(JoinBase.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.trim = false;
    this.target = "MoveToRelativeLineMinimumTwo";
  }

  _createClass(JoinBase, [{
    key: "initialize",
    value: function initialize() {
      if (this.requireInput) {
        this.focusInput({ charsMax: 10 });
      }
      return _get(Object.getPrototypeOf(JoinBase.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      var regex = this.trim ? /\r?\n[ \t]*/g : /\r?\n/g;
      return text.trimRight().replace(regex, this.input) + "\n";
    }
  }]);

  return JoinBase;
})(TransformString);

JoinBase.register(false);

var JoinWithKeepingSpace = (function (_JoinBase) {
  _inherits(JoinWithKeepingSpace, _JoinBase);

  function JoinWithKeepingSpace() {
    _classCallCheck(this, JoinWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinWithKeepingSpace.prototype), "constructor", this).apply(this, arguments);

    this.input = "";
  }

  return JoinWithKeepingSpace;
})(JoinBase);

JoinWithKeepingSpace.register();

var JoinByInput = (function (_JoinBase2) {
  _inherits(JoinByInput, _JoinBase2);

  function JoinByInput() {
    _classCallCheck(this, JoinByInput);

    _get(Object.getPrototypeOf(JoinByInput.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
    this.trim = true;
  }

  return JoinByInput;
})(JoinBase);

JoinByInput.register();

var JoinByInputWithKeepingSpace = (function (_JoinByInput) {
  _inherits(JoinByInputWithKeepingSpace, _JoinByInput);

  function JoinByInputWithKeepingSpace() {
    _classCallCheck(this, JoinByInputWithKeepingSpace);

    _get(Object.getPrototypeOf(JoinByInputWithKeepingSpace.prototype), "constructor", this).apply(this, arguments);

    this.trim = false;
  }

  return JoinByInputWithKeepingSpace;
})(JoinByInput);

JoinByInputWithKeepingSpace.register();

// -------------------------
// String suffix in name is to avoid confusion with 'split' window.

var SplitString = (function (_TransformString29) {
  _inherits(SplitString, _TransformString29);

  function SplitString() {
    _classCallCheck(this, SplitString);

    _get(Object.getPrototypeOf(SplitString.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
    this.input = null;
    this.target = "MoveToRelativeLine";
    this.keepSplitter = false;
  }

  _createClass(SplitString, [{
    key: "initialize",
    value: function initialize() {
      var _this14 = this;

      this.onDidSetTarget(function () {
        _this14.focusInput({ charsMax: 10 });
      });
      return _get(Object.getPrototypeOf(SplitString.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getNewText",
    value: function getNewText(text) {
      var regex = new RegExp(_.escapeRegExp(this.input || "\\n"), "g");
      var lineSeparator = (this.keepSplitter ? this.input : "") + "\n";
      return text.replace(regex, lineSeparator);
    }
  }]);

  return SplitString;
})(TransformString);

SplitString.register();

var SplitStringWithKeepingSplitter = (function (_SplitString) {
  _inherits(SplitStringWithKeepingSplitter, _SplitString);

  function SplitStringWithKeepingSplitter() {
    _classCallCheck(this, SplitStringWithKeepingSplitter);

    _get(Object.getPrototypeOf(SplitStringWithKeepingSplitter.prototype), "constructor", this).apply(this, arguments);

    this.keepSplitter = true;
  }

  return SplitStringWithKeepingSplitter;
})(SplitString);

SplitStringWithKeepingSplitter.register();

var SplitArguments = (function (_TransformString30) {
  _inherits(SplitArguments, _TransformString30);

  function SplitArguments() {
    _classCallCheck(this, SplitArguments);

    _get(Object.getPrototypeOf(SplitArguments.prototype), "constructor", this).apply(this, arguments);

    this.keepSeparator = true;
    this.autoIndentAfterInsertText = true;
  }

  _createClass(SplitArguments, [{
    key: "getNewText",
    value: function getNewText(text) {
      var allTokens = this.utils.splitArguments(text.trim());
      var newText = "";
      while (allTokens.length) {
        var _allTokens$shift = allTokens.shift();

        var _text = _allTokens$shift.text;
        var type = _allTokens$shift.type;

        newText += type === "separator" ? (this.keepSeparator ? _text.trim() : "") + "\n" : _text;
      }
      return "\n" + newText + "\n";
    }
  }]);

  return SplitArguments;
})(TransformString);

SplitArguments.register();

var SplitArgumentsWithRemoveSeparator = (function (_SplitArguments) {
  _inherits(SplitArgumentsWithRemoveSeparator, _SplitArguments);

  function SplitArgumentsWithRemoveSeparator() {
    _classCallCheck(this, SplitArgumentsWithRemoveSeparator);

    _get(Object.getPrototypeOf(SplitArgumentsWithRemoveSeparator.prototype), "constructor", this).apply(this, arguments);

    this.keepSeparator = false;
  }

  return SplitArgumentsWithRemoveSeparator;
})(SplitArguments);

SplitArgumentsWithRemoveSeparator.register();

var SplitArgumentsOfInnerAnyPair = (function (_SplitArguments2) {
  _inherits(SplitArgumentsOfInnerAnyPair, _SplitArguments2);

  function SplitArgumentsOfInnerAnyPair() {
    _classCallCheck(this, SplitArgumentsOfInnerAnyPair);

    _get(Object.getPrototypeOf(SplitArgumentsOfInnerAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return SplitArgumentsOfInnerAnyPair;
})(SplitArguments);

SplitArgumentsOfInnerAnyPair.register();

var ChangeOrder = (function (_TransformString31) {
  _inherits(ChangeOrder, _TransformString31);

  function ChangeOrder() {
    _classCallCheck(this, ChangeOrder);

    _get(Object.getPrototypeOf(ChangeOrder.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ChangeOrder, [{
    key: "getNewText",
    value: function getNewText(text) {
      var _this15 = this;

      return this.target.isLinewise() ? this.getNewList(this.utils.splitTextByNewLine(text)).join("\n") + "\n" : this.sortArgumentsInTextBy(text, function (args) {
        return _this15.getNewList(args);
      });
    }
  }, {
    key: "sortArgumentsInTextBy",
    value: function sortArgumentsInTextBy(text, fn) {
      var start = text.search(/\S/);
      var end = text.search(/\s*$/);
      var leadingSpaces = start !== -1 ? text.slice(0, start) : "";
      var trailingSpaces = end !== -1 ? text.slice(end) : "";
      var allTokens = this.utils.splitArguments(text.slice(start, end));
      var args = allTokens.filter(function (token) {
        return token.type === "argument";
      }).map(function (token) {
        return token.text;
      });
      var newArgs = fn(args);

      var newText = "";
      while (allTokens.length) {
        var token = allTokens.shift();
        // token.type is "separator" or "argument"
        newText += token.type === "separator" ? token.text : newArgs.shift();
      }
      return leadingSpaces + newText + trailingSpaces;
    }
  }]);

  return ChangeOrder;
})(TransformString);

ChangeOrder.register(false);

var Reverse = (function (_ChangeOrder) {
  _inherits(Reverse, _ChangeOrder);

  function Reverse() {
    _classCallCheck(this, Reverse);

    _get(Object.getPrototypeOf(Reverse.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Reverse, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return rows.reverse();
    }
  }]);

  return Reverse;
})(ChangeOrder);

Reverse.register();

var ReverseInnerAnyPair = (function (_Reverse) {
  _inherits(ReverseInnerAnyPair, _Reverse);

  function ReverseInnerAnyPair() {
    _classCallCheck(this, ReverseInnerAnyPair);

    _get(Object.getPrototypeOf(ReverseInnerAnyPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return ReverseInnerAnyPair;
})(Reverse);

ReverseInnerAnyPair.register();

var Rotate = (function (_ChangeOrder2) {
  _inherits(Rotate, _ChangeOrder2);

  function Rotate() {
    _classCallCheck(this, Rotate);

    _get(Object.getPrototypeOf(Rotate.prototype), "constructor", this).apply(this, arguments);

    this.backwards = false;
  }

  _createClass(Rotate, [{
    key: "getNewList",
    value: function getNewList(rows) {
      if (this.backwards) rows.push(rows.shift());else rows.unshift(rows.pop());
      return rows;
    }
  }]);

  return Rotate;
})(ChangeOrder);

Rotate.register();

var RotateBackwards = (function (_ChangeOrder3) {
  _inherits(RotateBackwards, _ChangeOrder3);

  function RotateBackwards() {
    _classCallCheck(this, RotateBackwards);

    _get(Object.getPrototypeOf(RotateBackwards.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return RotateBackwards;
})(ChangeOrder);

RotateBackwards.register();

var RotateArgumentsOfInnerPair = (function (_Rotate) {
  _inherits(RotateArgumentsOfInnerPair, _Rotate);

  function RotateArgumentsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsOfInnerPair.prototype), "constructor", this).apply(this, arguments);

    this.target = "InnerAnyPair";
  }

  return RotateArgumentsOfInnerPair;
})(Rotate);

RotateArgumentsOfInnerPair.register();

var RotateArgumentsBackwardsOfInnerPair = (function (_RotateArgumentsOfInnerPair) {
  _inherits(RotateArgumentsBackwardsOfInnerPair, _RotateArgumentsOfInnerPair);

  function RotateArgumentsBackwardsOfInnerPair() {
    _classCallCheck(this, RotateArgumentsBackwardsOfInnerPair);

    _get(Object.getPrototypeOf(RotateArgumentsBackwardsOfInnerPair.prototype), "constructor", this).apply(this, arguments);

    this.backwards = true;
  }

  return RotateArgumentsBackwardsOfInnerPair;
})(RotateArgumentsOfInnerPair);

RotateArgumentsBackwardsOfInnerPair.register();

var Sort = (function (_ChangeOrder4) {
  _inherits(Sort, _ChangeOrder4);

  function Sort() {
    _classCallCheck(this, Sort);

    _get(Object.getPrototypeOf(Sort.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Sort, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return rows.sort();
    }
  }]);

  return Sort;
})(ChangeOrder);

Sort.register();

var SortCaseInsensitively = (function (_ChangeOrder5) {
  _inherits(SortCaseInsensitively, _ChangeOrder5);

  function SortCaseInsensitively() {
    _classCallCheck(this, SortCaseInsensitively);

    _get(Object.getPrototypeOf(SortCaseInsensitively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SortCaseInsensitively, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return rows.sort(function (rowA, rowB) {
        return rowA.localeCompare(rowB, { sensitivity: "base" });
      });
    }
  }]);

  return SortCaseInsensitively;
})(ChangeOrder);

SortCaseInsensitively.register();

var SortByNumber = (function (_ChangeOrder6) {
  _inherits(SortByNumber, _ChangeOrder6);

  function SortByNumber() {
    _classCallCheck(this, SortByNumber);

    _get(Object.getPrototypeOf(SortByNumber.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(SortByNumber, [{
    key: "getNewList",
    value: function getNewList(rows) {
      return _.sortBy(rows, function (row) {
        return Number.parseInt(row) || Infinity;
      });
    }
  }]);

  return SortByNumber;
})(ChangeOrder);

SortByNumber.register();

var NumberingLines = (function (_TransformString32) {
  _inherits(NumberingLines, _TransformString32);

  function NumberingLines() {
    _classCallCheck(this, NumberingLines);

    _get(Object.getPrototypeOf(NumberingLines.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(NumberingLines, [{
    key: "getNewText",
    value: function getNewText(text) {
      var _this16 = this;

      var rows = this.utils.splitTextByNewLine(text);
      var lastRowWidth = String(rows.length).length;

      var newRows = rows.map(function (rowText, i) {
        i++; // fix 0 start index to 1 start.
        var amountOfPadding = _this16.utils.limitNumber(lastRowWidth - String(i).length, { min: 0 });
        return " ".repeat(amountOfPadding) + i + ": " + rowText;
      });
      return newRows.join("\n") + "\n";
    }
  }]);

  return NumberingLines;
})(TransformString);

NumberingLines.register();

// prettier-ignore
var classesToRegisterToSelectList = [ToggleCase, UpperCase, LowerCase, Replace, SplitByCharacter, CamelCase, SnakeCase, PascalCase, DashCase, TitleCase, EncodeUriComponent, DecodeUriComponent, TrimString, CompactSpaces, RemoveLeadingWhiteSpaces, AlignOccurrence, AlignStartOfOccurrence, AlignEndOfOccurrence, ConvertToSoftTab, ConvertToHardTab, JoinWithKeepingSpace, JoinByInput, JoinByInputWithKeepingSpace, SplitString, SplitStringWithKeepingSplitter, SplitArguments, SplitArgumentsWithRemoveSeparator, SplitArgumentsOfInnerAnyPair, Reverse, Rotate, RotateBackwards, Sort, SortCaseInsensitively, SortByNumber, NumberingLines];
for (var klass of classesToRegisterToSelectList) {
  klass.registerToSelectList();
}
// e.g. command: 'sort'
// e.g args: ['-rn']
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNILE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXpDLGVBQWUsWUFBZixlQUFlO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRTdCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBOzs7OztJQUlwQyxlQUFlO1lBQWYsZUFBZTs7V0FBZixlQUFlOzBCQUFmLGVBQWU7OytCQUFmLGVBQWU7O1NBRW5CLFdBQVcsR0FBRyxJQUFJO1NBQ2xCLGNBQWMsR0FBRyx1QkFBdUI7U0FDeEMsVUFBVSxHQUFHLEtBQUs7U0FDbEIsaUJBQWlCLEdBQUcsS0FBSztTQUN6Qix5QkFBeUIsR0FBRyxLQUFLOzs7ZUFON0IsZUFBZTs7V0FZSix5QkFBQyxTQUFTLEVBQUU7QUFDekIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDNUQsVUFBSSxJQUFJLEVBQUU7QUFDUixZQUFJLG1CQUFtQixZQUFBLENBQUE7QUFDdkIsWUFBSSxJQUFJLENBQUMseUJBQXlCLEVBQUU7QUFDbEMsY0FBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUE7QUFDckQsNkJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUNwRTtBQUNELFlBQUksS0FBSyxHQUFHLFNBQVMs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aG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9vcGVyYXRvci10cmFuc2Zvcm0tc3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3Qge0J1ZmZlcmVkUHJvY2VzcywgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcbmNvbnN0IE9wZXJhdG9yID0gQmFzZS5nZXRDbGFzcyhcIk9wZXJhdG9yXCIpXG5cbi8vIFRyYW5zZm9ybVN0cmluZ1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZyBleHRlbmRzIE9wZXJhdG9yIHtcbiAgc3RhdGljIHN0cmluZ1RyYW5zZm9ybWVycyA9IFtdXG4gIHRyYWNrQ2hhbmdlID0gdHJ1ZVxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uVHJhbnNmb3JtU3RyaW5nXCJcbiAgYXV0b0luZGVudCA9IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lID0gZmFsc2VcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IGZhbHNlXG5cbiAgc3RhdGljIHJlZ2lzdGVyVG9TZWxlY3RMaXN0KCkge1xuICAgIHRoaXMuc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy5nZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICBpZiAodGV4dCkge1xuICAgICAgbGV0IHN0YXJ0Um93SW5kZW50TGV2ZWxcbiAgICAgIGlmICh0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRSb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KVxuICAgICAgfVxuICAgICAgbGV0IHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudCwgYXV0b0luZGVudE5ld2xpbmU6IHRoaXMuYXV0b0luZGVudE5ld2xpbmV9KVxuXG4gICAgICBpZiAodGhpcy5hdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0KSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGJ5IFNwbGl0QXJndW1lbnRzIGFuZCBTdXJyb3VuZCggbGluZXdpc2UgdGFyZ2V0IG9ubHkgKVxuICAgICAgICBpZiAodGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpKSB7XG4gICAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2UuZW5kLnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgLy8gQWRqdXN0IGlubmVyIHJhbmdlLCBlbmQucm93IGlzIGFscmVhZHkoIGlmIG5lZWRlZCApIHRyYW5zbGF0ZWQgc28gbm8gbmVlZCB0byByZS10cmFuc2xhdGUuXG4gICAgICAgIHRoaXMudXRpbHMuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQodGhpcy5lZGl0b3IsIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFswLCAwXSkpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5UcmFuc2Zvcm1TdHJpbmcucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlRvZ2dsZSB+XCJcblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKC8uL2csIHRoaXMudXRpbHMudG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcbiAgfVxufVxuVG9nZ2xlQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZUNhc2VBbmRNb3ZlUmlnaHQgZXh0ZW5kcyBUb2dnbGVDYXNlIHtcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgdGFyZ2V0ID0gXCJNb3ZlUmlnaHRcIlxufVxuVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVXBwZXJcIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LnRvVXBwZXJDYXNlKClcbiAgfVxufVxuVXBwZXJDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTG93ZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJMb3dlclwiXG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQudG9Mb3dlckNhc2UoKVxuICB9XG59XG5Mb3dlckNhc2UucmVnaXN0ZXIoKVxuXG4vLyBSZXBsYWNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZmxhc2hDaGVja3BvaW50ID0gXCJkaWQtc2VsZWN0LW9jY3VycmVuY2VcIlxuICBpbnB1dCA9IG51bGxcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBhdXRvSW5kZW50TmV3bGluZSA9IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0ID0gdHJ1ZVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB0aGlzLmZvY3VzSW5wdXQoe2hpZGVDdXJzb3I6IHRydWV9KSlcbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBpZiAodGhpcy50YXJnZXQuaXMoXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIikgJiYgdGV4dC5sZW5ndGggIT09IHRoaXMuZ2V0Q291bnQoKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLmlucHV0IHx8IFwiXFxuXCJcbiAgICBpZiAoaW5wdXQgPT09IFwiXFxuXCIpIHtcbiAgICAgIHRoaXMucmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoLy4vZywgaW5wdXQpXG4gIH1cbn1cblJlcGxhY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZXBsYWNlQ2hhcmFjdGVyIGV4dGVuZHMgUmVwbGFjZSB7XG4gIHRhcmdldCA9IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCJcbn1cblJlcGxhY2VDaGFyYWN0ZXIucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEVVAgbWVhbmluZyB3aXRoIFNwbGl0U3RyaW5nIG5lZWQgY29uc29saWRhdGUuXG5jbGFzcyBTcGxpdEJ5Q2hhcmFjdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQuc3BsaXQoXCJcIikuam9pbihcIiBcIilcbiAgfVxufVxuU3BsaXRCeUNoYXJhY3Rlci5yZWdpc3RlcigpXG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiQ2FtZWxpemVcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gXy5jYW1lbGl6ZSh0ZXh0KVxuICB9XG59XG5DYW1lbENhc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBTbmFrZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIlVuZGVyc2NvcmUgX1wiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBfLnVuZGVyc2NvcmUodGV4dClcbiAgfVxufVxuU25ha2VDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiUGFzY2FsaXplXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKHRleHQpKVxuICB9XG59XG5QYXNjYWxDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgRGFzaENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkRhc2hlcml6ZSAtXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uZGFzaGVyaXplKHRleHQpXG4gIH1cbn1cbkRhc2hDYXNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJUaXRsaXplXCJcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUodGV4dCkpXG4gIH1cbn1cblRpdGxlQ2FzZS5yZWdpc3RlcigpXG5cbmNsYXNzIEVuY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiRW5jb2RlIFVSSSBDb21wb25lbnQgJVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuRW5jb2RlVXJpQ29tcG9uZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RhdGljIGRpc3BsYXlOYW1lID0gXCJEZWNvZGUgVVJJIENvbXBvbmVudCAlJVwiXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dClcbiAgfVxufVxuRGVjb2RlVXJpQ29tcG9uZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgVHJpbVN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiVHJpbSBzdHJpbmdcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC50cmltKClcbiAgfVxufVxuVHJpbVN0cmluZy5yZWdpc3RlcigpXG5cbmNsYXNzIENvbXBhY3RTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkNvbXBhY3Qgc3BhY2VcIlxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICBpZiAodGV4dC5tYXRjaCgvXlsgXSskLykpIHtcbiAgICAgIHJldHVybiBcIiBcIlxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICBjb25zdCByZWdleCA9IC9eKFxccyopKC4qPykoXFxzKikkL2dtXG4gICAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCAobSwgbGVhZGluZywgbWlkZGxlLCB0cmFpbGluZykgPT4ge1xuICAgICAgICByZXR1cm4gbGVhZGluZyArIG1pZGRsZS5zcGxpdCgvWyBcXHRdKy8pLmpvaW4oXCIgXCIpICsgdHJhaWxpbmdcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5Db21wYWN0U3BhY2VzLnJlZ2lzdGVyKClcblxuY2xhc3MgQWxpZ25PY2N1cnJlbmNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbiAgd2hpY2ggPSBcImF1dG9cIlxuXG4gIGdldFNlbGVjdGlvblRha2VyKCkge1xuICAgIGNvbnN0IHNlbGVjdGlvbnNCeVJvdyA9IF8uZ3JvdXBCeShcbiAgICAgIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpLFxuICAgICAgc2VsZWN0aW9uID0+IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgIClcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjb25zdCByb3dzID0gT2JqZWN0LmtleXMoc2VsZWN0aW9uc0J5Um93KVxuICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHJvd3MubWFwKHJvdyA9PiBzZWxlY3Rpb25zQnlSb3dbcm93XS5zaGlmdCgpKS5maWx0ZXIocyA9PiBzKVxuICAgICAgcmV0dXJuIHNlbGVjdGlvbnNcbiAgICB9XG4gIH1cblxuICBnZXRXaWNoVG9BbGlnbkZvclRleHQodGV4dCkge1xuICAgIGlmICh0aGlzLndoaWNoICE9PSBcImF1dG9cIikgcmV0dXJuIHRoaXMud2hpY2hcblxuICAgIGlmICgvXlxccyo9XFxzKiQvLnRlc3QodGV4dCkpIHtcbiAgICAgIC8vIEFzaWdubWVudFxuICAgICAgcmV0dXJuIFwic3RhcnRcIlxuICAgIH0gZWxzZSBpZiAoL15cXHMqLFxccyokLy50ZXN0KHRleHQpKSB7XG4gICAgICAvLyBBcmd1bWVudHNcbiAgICAgIHJldHVybiBcImVuZFwiXG4gICAgfSBlbHNlIGlmICgvXFxXJC8udGVzdCh0ZXh0KSkge1xuICAgICAgLy8gZW5kcyB3aXRoIG5vbi13b3JkLWNoYXJcbiAgICAgIHJldHVybiBcImVuZFwiXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcInN0YXJ0XCJcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQYWRkaW5nKCkge1xuICAgIGNvbnN0IHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3cgPSB7fVxuICAgIGNvbnN0IGNvbHVtbkZvclNlbGVjdGlvbiA9IHNlbGVjdGlvbiA9PiB7XG4gICAgICBjb25zdCB3aGljaCA9IHRoaXMuZ2V0V2ljaFRvQWxpZ25Gb3JUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCkpXG4gICAgICBjb25zdCBwb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpW3doaWNoXVxuICAgICAgcmV0dXJuIHBvaW50LmNvbHVtbiArICh0b3RhbEFtb3VudE9mUGFkZGluZ0J5Um93W3BvaW50LnJvd10gfHwgMClcbiAgICB9XG5cbiAgICBjb25zdCB0YWtlU2VsZWN0aW9ucyA9IHRoaXMuZ2V0U2VsZWN0aW9uVGFrZXIoKVxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBjb25zdCBzZWxlY3Rpb25zID0gdGFrZVNlbGVjdGlvbnMoKVxuICAgICAgaWYgKCFzZWxlY3Rpb25zLmxlbmd0aCkgcmV0dXJuXG4gICAgICBjb25zdCBtYXhDb2x1bW4gPSBzZWxlY3Rpb25zLm1hcChjb2x1bW5Gb3JTZWxlY3Rpb24pLnJlZHVjZSgobWF4LCBjdXIpID0+IChjdXIgPiBtYXggPyBjdXIgOiBtYXgpKVxuICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2Ygc2VsZWN0aW9ucykge1xuICAgICAgICBjb25zdCByb3cgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydC5yb3dcbiAgICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gbWF4Q29sdW1uIC0gY29sdW1uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgdG90YWxBbW91bnRPZlBhZGRpbmdCeVJvd1tyb3ddID0gKHRvdGFsQW1vdW50T2ZQYWRkaW5nQnlSb3dbcm93XSB8fCAwKSArIGFtb3VudE9mUGFkZGluZ1xuICAgICAgICB0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIGFtb3VudE9mUGFkZGluZylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuYW1vdW50T2ZQYWRkaW5nQnlTZWxlY3Rpb24gPSBuZXcgTWFwKClcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlUGFkZGluZygpXG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcGFkZGluZyA9IFwiIFwiLnJlcGVhdCh0aGlzLmFtb3VudE9mUGFkZGluZ0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pKVxuICAgIGNvbnN0IHdoaWNoID0gdGhpcy5nZXRXaWNoVG9BbGlnbkZvclRleHQoc2VsZWN0aW9uLmdldFRleHQoKSlcbiAgICByZXR1cm4gd2hpY2ggPT09IFwic3RhcnRcIiA/IHBhZGRpbmcgKyB0ZXh0IDogdGV4dCArIHBhZGRpbmdcbiAgfVxufVxuQWxpZ25PY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgQWxpZ25TdGFydE9mT2NjdXJyZW5jZSBleHRlbmRzIEFsaWduT2NjdXJyZW5jZSB7XG4gIHdoaWNoID0gXCJzdGFydFwiXG59XG5BbGlnblN0YXJ0T2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgQWxpZ25FbmRPZk9jY3VycmVuY2UgZXh0ZW5kcyBBbGlnbk9jY3VycmVuY2Uge1xuICB3aGljaCA9IFwiZW5kXCJcbn1cbkFsaWduRW5kT2ZPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBnZXROZXdUZXh0KHRleHQsIHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHRyaW1MZWZ0ID0gdGV4dCA9PiB0ZXh0LnRyaW1MZWZ0KClcbiAgICByZXR1cm4gKFxuICAgICAgc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpXG4gICAgICAgIC5tYXAodHJpbUxlZnQpXG4gICAgICAgIC5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICAgIClcbiAgfVxufVxuUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29udmVydFRvU29mdFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHN0YXRpYyBkaXNwbGF5TmFtZSA9IFwiU29mdCBUYWJcIlxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnNjYW5Gb3J3YXJkKC9cXHQvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT4ge1xuICAgICAgLy8gUmVwbGFjZSBcXHQgdG8gc3BhY2VzIHdoaWNoIGxlbmd0aCBpcyB2YXJ5IGRlcGVuZGluZyBvbiB0YWJTdG9wIGFuZCB0YWJMZW5naHRcbiAgICAgIC8vIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpLmdldEV4dGVudCgpLmNvbHVtblxuICAgICAgcmV0dXJuIHJlcGxhY2UoXCIgXCIucmVwZWF0KGxlbmd0aCkpXG4gICAgfSlcbiAgfVxufVxuQ29udmVydFRvU29mdFRhYi5yZWdpc3RlcigpXG5cbmNsYXNzIENvbnZlcnRUb0hhcmRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSBcIkhhcmQgVGFiXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgdGFiTGVuZ3RoID0gdGhpcy5lZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+IHtcbiAgICAgIGNvbnN0IHtzdGFydCwgZW5kfSA9IHRoaXMuZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBsZXQgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGNvbnN0IGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgLy8gV2UgY2FuJ3QgbmFpdmVseSByZXBsYWNlIHNwYWNlcyB0byB0YWIsIHdlIGhhdmUgdG8gY29uc2lkZXIgdmFsaWQgdGFiU3RvcCBjb2x1bW5cbiAgICAgIC8vIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIGxldCBuZXdUZXh0ID0gXCJcIlxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSB0YWJMZW5ndGhcbiAgICAgICAgY29uc3QgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChyZW1haW5kZXIgPT09IDAgPyB0YWJMZW5ndGggOiByZW1haW5kZXIpXG4gICAgICAgIGlmIChuZXh0VGFiU3RvcCA+IGVuZENvbHVtbikge1xuICAgICAgICAgIG5ld1RleHQgKz0gXCIgXCIucmVwZWF0KGVuZENvbHVtbiAtIHN0YXJ0Q29sdW1uKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICB9XG4gICAgICAgIHN0YXJ0Q29sdW1uID0gbmV4dFRhYlN0b3BcbiAgICAgICAgaWYgKHN0YXJ0Q29sdW1uID49IGVuZENvbHVtbikge1xuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuICAgIH0pXG4gIH1cbn1cbkNvbnZlcnRUb0hhcmRUYWIucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeUV4dGVybmFsQ29tbWFuZCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGF1dG9JbmRlbnQgPSB0cnVlXG4gIGNvbW1hbmQgPSBcIlwiIC8vIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3MgPSBbXSAvLyBlLmcgYXJnczogWyctcm4nXVxuICBzdGRvdXRCeVNlbGVjdGlvbiA9IG51bGxcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMubm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICBpZiAodGhpcy5zZWxlY3RUYXJnZXQoKSkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5jb2xsZWN0KHJlc29sdmUpKS50aGVuKCgpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge2F1dG9JbmRlbnQ6IHRoaXMuYXV0b0luZGVudH0pXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjb2xsZWN0KHJlc29sdmUpIHtcbiAgICB0aGlzLnN0ZG91dEJ5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgbGV0IHByb2Nlc3NGaW5pc2hlZCA9IDAsXG4gICAgICBwcm9jZXNzUnVubmluZyA9IDBcbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGNvbnN0IHtjb21tYW5kLCBhcmdzfSA9IHRoaXMuZ2V0Q29tbWFuZChzZWxlY3Rpb24pIHx8IHt9XG4gICAgICBpZiAoY29tbWFuZCA9PSBudWxsIHx8IGFyZ3MgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgIHByb2Nlc3NSdW5uaW5nKytcbiAgICAgIHRoaXMucnVuRXh0ZXJuYWxDb21tYW5kKHtcbiAgICAgICAgY29tbWFuZDogY29tbWFuZCxcbiAgICAgICAgYXJnczogYXJncyxcbiAgICAgICAgc3RkaW46IHRoaXMuZ2V0U3RkaW4oc2VsZWN0aW9uKSxcbiAgICAgICAgc3Rkb3V0OiBvdXRwdXQgPT4gdGhpcy5zdGRvdXRCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBvdXRwdXQpLFxuICAgICAgICBleGl0OiBjb2RlID0+IHtcbiAgICAgICAgICBwcm9jZXNzRmluaXNoZWQrK1xuICAgICAgICAgIGlmIChwcm9jZXNzUnVubmluZyA9PT0gcHJvY2Vzc0ZpbmlzaGVkKSByZXNvbHZlKClcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7c3RkaW59ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgY29uc3QgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yKCh7ZXJyb3IsIGhhbmRsZX0pID0+IHtcbiAgICAgIC8vIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiAoZXJyb3IuY29kZSA9PT0gXCJFTk9FTlRcIiAmJiBlcnJvci5zeXNjYWxsLmluZGV4T2YoXCJzcGF3blwiKSA9PT0gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhgJHt0aGlzLmdldENvbW1hbmROYW1lKCl9OiBGYWlsZWQgdG8gc3Bhd24gY29tbWFuZCAke2Vycm9yLnBhdGh9LmApXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICB9XG4gICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgfSlcblxuICAgIGlmIChzdGRpbikge1xuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUoc3RkaW4pXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuICAgIH1cbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3Rkb3V0KHNlbGVjdGlvbikgfHwgdGV4dFxuICB9XG5cbiAgLy8gRm9yIGVhc2lseSBleHRlbmQgYnkgdm1wIHBsdWdpbi5cbiAgZ2V0Q29tbWFuZChzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4ge2NvbW1hbmQ6IHRoaXMuY29tbWFuZCwgYXJnczogdGhpcy5hcmdzfVxuICB9XG4gIGdldFN0ZGluKHNlbGVjdGlvbikge1xuICAgIHJldHVybiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIH1cbiAgZ2V0U3Rkb3V0KHNlbGVjdGlvbikge1xuICAgIHJldHVybiB0aGlzLnN0ZG91dEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gIH1cbn1cblRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBzdGF0aWMgZWxlY3RMaXN0SXRlbXMgPSBudWxsXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcblxuICBzdGF0aWMgZ2V0U2VsZWN0TGlzdEl0ZW1zKCkge1xuICAgIGlmICghdGhpcy5zZWxlY3RMaXN0SXRlbXMpIHtcbiAgICAgIHRoaXMuc2VsZWN0TGlzdEl0ZW1zID0gdGhpcy5zdHJpbmdUcmFuc2Zvcm1lcnMubWFwKGtsYXNzID0+ICh7XG4gICAgICAgIGtsYXNzOiBrbGFzcyxcbiAgICAgICAgZGlzcGxheU5hbWU6IGtsYXNzLmhhc093blByb3BlcnR5KFwiZGlzcGxheU5hbWVcIilcbiAgICAgICAgICA/IGtsYXNzLmRpc3BsYXlOYW1lXG4gICAgICAgICAgOiBfLmh1bWFuaXplRXZlbnROYW1lKF8uZGFzaGVyaXplKGtsYXNzLm5hbWUpKSxcbiAgICAgIH0pKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0SXRlbXNcbiAgfVxuXG4gIGdldEl0ZW1zKCkge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLmdldFNlbGVjdExpc3RJdGVtcygpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudmltU3RhdGUub25EaWRDb25maXJtU2VsZWN0TGlzdChpdGVtID0+IHtcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gaXRlbS5rbGFzc1xuICAgICAgaWYgKHRyYW5zZm9ybWVyLnByb3RvdHlwZS50YXJnZXQpIHtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0cmFuc2Zvcm1lci5wcm90b3R5cGUudGFyZ2V0XG4gICAgICB9XG4gICAgICB0aGlzLnZpbVN0YXRlLnJlc2V0KClcbiAgICAgIGlmICh0aGlzLnRhcmdldCkge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bih0cmFuc2Zvcm1lciwge3RhcmdldDogdGhpcy50YXJnZXR9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZm9jdXNTZWxlY3RMaXN0KHtpdGVtczogdGhpcy5nZXRJdGVtcygpfSlcblxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgLy8gTkVWRVIgYmUgZXhlY3V0ZWQgc2luY2Ugb3BlcmF0aW9uU3RhY2sgaXMgcmVwbGFjZWQgd2l0aCBzZWxlY3RlZCB0cmFuc2Zvcm1lclxuICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLm5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRgKVxuICB9XG59XG5UcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QucmVnaXN0ZXIoKVxuXG5jbGFzcyBUcmFuc2Zvcm1Xb3JkQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IHtcbiAgdGFyZ2V0ID0gXCJJbm5lcldvcmRcIlxufVxuVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdC5yZWdpc3RlcigpXG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCB7XG4gIHRhcmdldCA9IFwiSW5uZXJTbWFydFdvcmRcIlxufVxuVHJhbnNmb3JtU21hcnRXb3JkQnlTZWxlY3RMaXN0LnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZVdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVHlwZSA9IFwib3BlcmF0b3ItbG9uZ1wiXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnNlcXVlbnRpYWxQYXN0ZSA9IHRoaXMudmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgcmFuZ2UpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgcmV0dXJuIHZhbHVlID8gdmFsdWUudGV4dCA6IFwiXCJcbiAgfVxufVxuUmVwbGFjZVdpdGhSZWdpc3Rlci5yZWdpc3RlcigpXG5cbi8vIFNhdmUgdGV4dCB0byByZWdpc3RlciBiZWZvcmUgcmVwbGFjZVxuY2xhc3MgU3dhcFdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGdldE5ld1RleHQodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgbmV3VGV4dCA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3Rlcih0ZXh0LCBzZWxlY3Rpb24pXG4gICAgcmV0dXJuIG5ld1RleHRcbiAgfVxufVxuU3dhcFdpdGhSZWdpc3Rlci5yZWdpc3RlcigpXG5cbi8vIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZSA9IHRydWVcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICAvLyBOZWVkIGNvdW50IHRpbWVzIGluZGVudGF0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCBpdHMgcmVwZWF0KGAuYCkuXG4gICAgaWYgKHRoaXMudGFyZ2V0LmlzKFwiQ3VycmVudFNlbGVjdGlvblwiKSkge1xuICAgICAgbGV0IG9sZFRleHRcbiAgICAgIC8vIGxpbWl0IHRvIDEwMCB0byBhdm9pZCBmcmVlemluZyBieSBhY2NpZGVudGFsIGJpZyBudW1iZXIuXG4gICAgICBjb25zdCBjb3VudCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KVxuICAgICAgdGhpcy5jb3VudFRpbWVzKGNvdW50LCAoe3N0b3B9KSA9PiB7XG4gICAgICAgIG9sZFRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgIHRoaXMuaW5kZW50KHNlbGVjdGlvbilcbiAgICAgICAgaWYgKHNlbGVjdGlvbi5nZXRUZXh0KCkgPT09IG9sZFRleHQpIHN0b3AoKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbmRlbnQoc2VsZWN0aW9uKVxuICAgIH1cbiAgfVxuXG4gIGluZGVudChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgT3V0ZGVudCBleHRlbmRzIEluZGVudCB7XG4gIGluZGVudChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG4gIH1cbn1cbk91dGRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBBdXRvSW5kZW50IGV4dGVuZHMgSW5kZW50IHtcbiAgaW5kZW50KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKClcbiAgfVxufVxuQXV0b0luZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIFRvZ2dsZUxpbmVDb21tZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgc3RheUJ5TWFya2VyID0gdHJ1ZVxuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi50b2dnbGVMaW5lQ29tbWVudHMoKVxuICB9XG59XG5Ub2dnbGVMaW5lQ29tbWVudHMucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZWZsb3cgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0aGlzLmVkaXRvckVsZW1lbnQsIFwiYXV0b2Zsb3c6cmVmbG93LXNlbGVjdGlvblwiKVxuICB9XG59XG5SZWZsb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZWZsb3dXaXRoU3RheSBleHRlbmRzIFJlZmxvdyB7XG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbn1cblJlZmxvd1dpdGhTdGF5LnJlZ2lzdGVyKClcblxuLy8gU3Vycm91bmQgPCBUcmFuc2Zvcm1TdHJpbmdcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHBhaXJzID0gW1tcIihcIiwgXCIpXCJdLCBbXCJ7XCIsIFwifVwiXSwgW1wiW1wiLCBcIl1cIl0sIFtcIjxcIiwgXCI+XCJdXVxuICBwYWlyc0J5QWxpYXMgPSB7XG4gICAgYjogW1wiKFwiLCBcIilcIl0sXG4gICAgQjogW1wie1wiLCBcIn1cIl0sXG4gICAgcjogW1wiW1wiLCBcIl1cIl0sXG4gICAgYTogW1wiPFwiLCBcIj5cIl0sXG4gIH1cblxuICBwYWlyQ2hhcnNBbGxvd0ZvcndhcmRpbmcgPSBcIltdKCl7fVwiXG4gIGlucHV0ID0gbnVsbFxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdCA9IHRydWUgLy8gRXhwZXJpbWVudGFsXG5cbiAgZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhcigpIHtcbiAgICB0aGlzLmZvY3VzSW5wdXQoe2hpZGVDdXJzb3I6IHRydWV9KVxuICB9XG5cbiAgZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyKCkge1xuICAgIHRoaXMuZm9jdXNJbnB1dCh7b25Db25maXJtOiBjaGFyID0+IHRoaXMub25Db25maXJtVGFyZ2V0UGFpckNoYXIoY2hhcil9KVxuICB9XG5cbiAgZ2V0UGFpcihjaGFyKSB7XG4gICAgbGV0IHBhaXJcbiAgICByZXR1cm4gY2hhciBpbiB0aGlzLnBhaXJzQnlBbGlhc1xuICAgICAgPyB0aGlzLnBhaXJzQnlBbGlhc1tjaGFyXVxuICAgICAgOiBbLi4udGhpcy5wYWlycywgW2NoYXIsIGNoYXJdXS5maW5kKHBhaXIgPT4gcGFpci5pbmNsdWRlcyhjaGFyKSlcbiAgfVxuXG4gIHN1cnJvdW5kKHRleHQsIGNoYXIsIHtrZWVwTGF5b3V0ID0gZmFsc2V9ID0ge30pIHtcbiAgICBsZXQgW29wZW4sIGNsb3NlXSA9IHRoaXMuZ2V0UGFpcihjaGFyKVxuICAgIGlmICgha2VlcExheW91dCAmJiB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0aGlzLmF1dG9JbmRlbnRBZnRlckluc2VydFRleHQgPSB0cnVlXG4gICAgICBvcGVuICs9IFwiXFxuXCJcbiAgICAgIGNsb3NlICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmRcIikuaW5jbHVkZXMoY2hhcikgJiYgdGhpcy51dGlscy5pc1NpbmdsZUxpbmVUZXh0KHRleHQpKSB7XG4gICAgICB0ZXh0ID0gXCIgXCIgKyB0ZXh0ICsgXCIgXCJcbiAgICB9XG5cbiAgICByZXR1cm4gb3BlbiArIHRleHQgKyBjbG9zZVxuICB9XG5cbiAgZGVsZXRlU3Vycm91bmQodGV4dCkge1xuICAgIC8vIEFzc3VtZSBzdXJyb3VuZGluZyBjaGFyIGlzIG9uZS1jaGFyIGxlbmd0aC5cbiAgICBjb25zdCBvcGVuID0gdGV4dFswXVxuICAgIGNvbnN0IGNsb3NlID0gdGV4dFt0ZXh0Lmxlbmd0aCAtIDFdXG4gICAgY29uc3QgaW5uZXJUZXh0ID0gdGV4dC5zbGljZSgxLCB0ZXh0Lmxlbmd0aCAtIDEpXG4gICAgcmV0dXJuIHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSAmJiBvcGVuICE9PSBjbG9zZSA/IGlubmVyVGV4dC50cmltKCkgOiBpbm5lclRleHRcbiAgfVxuXG4gIG9uQ29uZmlybVRhcmdldFBhaXJDaGFyKGNoYXIpIHtcbiAgICB0aGlzLnNldFRhcmdldCh0aGlzLmdldEluc3RhbmNlKFwiQVBhaXJcIiwge3BhaXI6IHRoaXMuZ2V0UGFpcihjaGFyKX0pKVxuICB9XG59XG5TdXJyb3VuZEJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlIHtcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHRoaXMuZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhcigpKVxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIHJldHVybiB0aGlzLnN1cnJvdW5kKHRleHQsIHRoaXMuaW5wdXQpXG4gIH1cbn1cblN1cnJvdW5kLnJlZ2lzdGVyKClcblxuY2xhc3MgU3Vycm91bmRXb3JkIGV4dGVuZHMgU3Vycm91bmQge1xuICB0YXJnZXQgPSBcIklubmVyV29yZFwiXG59XG5TdXJyb3VuZFdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBTdXJyb3VuZFNtYXJ0V29yZCBleHRlbmRzIFN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJJbm5lclNtYXJ0V29yZFwiXG59XG5TdXJyb3VuZFNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1hcFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmQge1xuICBvY2N1cnJlbmNlID0gdHJ1ZVxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IC9cXHcrL2dcbn1cbk1hcFN1cnJvdW5kLnJlZ2lzdGVyKClcblxuLy8gRGVsZXRlIFN1cnJvdW5kXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBEZWxldGVTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZSB7XG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCF0aGlzLnRhcmdldCkge1xuICAgICAgdGhpcy5mb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXIoKVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcihjaGFyKSB7XG4gICAgc3VwZXIub25Db25maXJtVGFyZ2V0UGFpckNoYXIoY2hhcilcbiAgICB0aGlzLmlucHV0ID0gY2hhclxuICAgIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gIH1cblxuICBnZXROZXdUZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KVxuICB9XG59XG5EZWxldGVTdXJyb3VuZC5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIERlbGV0ZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpclwiXG4gIHJlcXVpcmVJbnB1dCA9IGZhbHNlXG59XG5EZWxldGVTdXJyb3VuZEFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXIge1xuICB0YXJnZXQgPSBcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCJcbn1cbkRlbGV0ZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZy5yZWdpc3RlcigpXG5cbi8vIENoYW5nZSBTdXJyb3VuZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2Uge1xuICBzaG93RGVsZXRlQ2hhck9uSG92ZXIoKSB7XG4gICAgY29uc3QgaG92ZXJQb2ludCA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldEluaXRpYWxQb2ludEZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgY29uc3QgY2hhciA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdXG4gICAgdGhpcy52aW1TdGF0ZS5ob3Zlci5zZXQoY2hhciwgaG92ZXJQb2ludClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMudGFyZ2V0KSB7XG4gICAgICB0aGlzLm9uRGlkRmFpbFNlbGVjdFRhcmdldCgoKSA9PiB0aGlzLmFib3J0KCkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25EaWRGYWlsU2VsZWN0VGFyZ2V0KCgpID0+IHRoaXMuY2FuY2VsT3BlcmF0aW9uKCkpXG4gICAgICB0aGlzLmZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpXG4gICAgfVxuXG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICB0aGlzLnNob3dEZWxldGVDaGFyT25Ib3ZlcigpXG4gICAgICB0aGlzLmZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXIoKVxuICAgIH0pXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgaW5uZXJUZXh0ID0gdGhpcy5kZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIHJldHVybiB0aGlzLnN1cnJvdW5kKGlubmVyVGV4dCwgdGhpcy5pbnB1dCwge2tlZXBMYXlvdXQ6IHRydWV9KVxuICB9XG59XG5DaGFuZ2VTdXJyb3VuZC5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIENoYW5nZVN1cnJvdW5kIHtcbiAgdGFyZ2V0ID0gXCJBQW55UGFpclwiXG59XG5DaGFuZ2VTdXJyb3VuZEFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIge1xuICB0YXJnZXQgPSBcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCJcbn1cbkNoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZy5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZJWE1FXG4vLyBDdXJyZW50bHkgbmF0aXZlIGVkaXRvci5qb2luTGluZXMoKSBpcyBiZXR0ZXIgZm9yIGN1cnNvciBwb3NpdGlvbiBzZXR0aW5nXG4vLyBTbyBJIHVzZSBuYXRpdmUgbWV0aG9kcyBmb3IgYSBtZWFud2hpbGUuXG5jbGFzcyBKb2luIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgICAvLyBXaGVuIGN1cnNvciBpcyBhdCBsYXN0IEJVRkZFUiByb3csIGl0IHNlbGVjdCBsYXN0LWJ1ZmZlci1yb3csIHRoZW5cbiAgICAvLyBqb2lubmluZyByZXN1bHQgaW4gXCJjbGVhciBsYXN0LWJ1ZmZlci1yb3cgdGV4dFwiLlxuICAgIC8vIEkgYmVsaWV2ZSB0aGlzIGlzIEJVRyBvZiB1cHN0cmVhbSBhdG9tLWNvcmUuIGd1YXJkIHRoaXMgc2l0dWF0aW9uIGhlcmVcbiAgICBpZiAoIXJhbmdlLmlzU2luZ2xlTGluZSgpIHx8IHJhbmdlLmVuZC5yb3cgIT09IHRoaXMuZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSkge1xuICAgICAgaWYgKHRoaXMudXRpbHMuaXNMaW5ld2lzZVJhbmdlKHJhbmdlKSkge1xuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgWy0xLCBJbmZpbml0eV0pKVxuICAgICAgfVxuICAgICAgc2VsZWN0aW9uLmpvaW5MaW5lcygpXG4gICAgfVxuICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIHJldHVybiBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICB9XG59XG5Kb2luLnJlZ2lzdGVyKClcblxuY2xhc3MgSm9pbkJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRyaW0gPSBmYWxzZVxuICB0YXJnZXQgPSBcIk1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud29cIlxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMucmVxdWlyZUlucHV0KSB7XG4gICAgICB0aGlzLmZvY3VzSW5wdXQoe2NoYXJzTWF4OiAxMH0pXG4gICAgfVxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy50cmltID8gL1xccj9cXG5bIFxcdF0qL2cgOiAvXFxyP1xcbi9nXG4gICAgcmV0dXJuIHRleHQudHJpbVJpZ2h0KCkucmVwbGFjZShyZWdleCwgdGhpcy5pbnB1dCkgKyBcIlxcblwiXG4gIH1cbn1cbkpvaW5CYXNlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBKb2luV2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CYXNlIHtcbiAgaW5wdXQgPSBcIlwiXG59XG5Kb2luV2l0aEtlZXBpbmdTcGFjZS5yZWdpc3RlcigpXG5cbmNsYXNzIEpvaW5CeUlucHV0IGV4dGVuZHMgSm9pbkJhc2Uge1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIHRyaW0gPSB0cnVlXG59XG5Kb2luQnlJbnB1dC5yZWdpc3RlcigpXG5cbmNsYXNzIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CeUlucHV0IHtcbiAgdHJpbSA9IGZhbHNlXG59XG5Kb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHJpbmcgc3VmZml4IGluIG5hbWUgaXMgdG8gYXZvaWQgY29uZnVzaW9uIHdpdGggJ3NwbGl0JyB3aW5kb3cuXG5jbGFzcyBTcGxpdFN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZyB7XG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAga2VlcFNwbGl0dGVyID0gZmFsc2VcblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMub25EaWRTZXRUYXJnZXQoKCkgPT4ge1xuICAgICAgdGhpcy5mb2N1c0lucHV0KHtjaGFyc01heDogMTB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRoaXMuaW5wdXQgfHwgXCJcXFxcblwiKSwgXCJnXCIpXG4gICAgY29uc3QgbGluZVNlcGFyYXRvciA9ICh0aGlzLmtlZXBTcGxpdHRlciA/IHRoaXMuaW5wdXQgOiBcIlwiKSArIFwiXFxuXCJcbiAgICByZXR1cm4gdGV4dC5yZXBsYWNlKHJlZ2V4LCBsaW5lU2VwYXJhdG9yKVxuICB9XG59XG5TcGxpdFN0cmluZy5yZWdpc3RlcigpXG5cbmNsYXNzIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlciBleHRlbmRzIFNwbGl0U3RyaW5nIHtcbiAga2VlcFNwbGl0dGVyID0gdHJ1ZVxufVxuU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyLnJlZ2lzdGVyKClcblxuY2xhc3MgU3BsaXRBcmd1bWVudHMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmcge1xuICBrZWVwU2VwYXJhdG9yID0gdHJ1ZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0ID0gdHJ1ZVxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dC50cmltKCkpXG4gICAgbGV0IG5ld1RleHQgPSBcIlwiXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHt0ZXh0LCB0eXBlfSA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBuZXdUZXh0ICs9IHR5cGUgPT09IFwic2VwYXJhdG9yXCIgPyAodGhpcy5rZWVwU2VwYXJhdG9yID8gdGV4dC50cmltKCkgOiBcIlwiKSArIFwiXFxuXCIgOiB0ZXh0XG4gICAgfVxuICAgIHJldHVybiBgXFxuJHtuZXdUZXh0fVxcbmBcbiAgfVxufVxuU3BsaXRBcmd1bWVudHMucmVnaXN0ZXIoKVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3IgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50cyB7XG4gIGtlZXBTZXBhcmF0b3IgPSBmYWxzZVxufVxuU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yLnJlZ2lzdGVyKClcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpciBleHRlbmRzIFNwbGl0QXJndW1lbnRzIHtcbiAgdGFyZ2V0ID0gXCJJbm5lckFueVBhaXJcIlxufVxuU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIENoYW5nZU9yZGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgZ2V0TmV3VGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgPyB0aGlzLmdldE5ld0xpc3QodGhpcy51dGlscy5zcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgICA6IHRoaXMuc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGFyZ3MgPT4gdGhpcy5nZXROZXdMaXN0KGFyZ3MpKVxuICB9XG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIGZuKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgICBjb25zdCBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICAgIGNvbnN0IGxlYWRpbmdTcGFjZXMgPSBzdGFydCAhPT0gLTEgPyB0ZXh0LnNsaWNlKDAsIHN0YXJ0KSA6IFwiXCJcbiAgICBjb25zdCB0cmFpbGluZ1NwYWNlcyA9IGVuZCAhPT0gLTEgPyB0ZXh0LnNsaWNlKGVuZCkgOiBcIlwiXG4gICAgY29uc3QgYWxsVG9rZW5zID0gdGhpcy51dGlscy5zcGxpdEFyZ3VtZW50cyh0ZXh0LnNsaWNlKHN0YXJ0LCBlbmQpKVxuICAgIGNvbnN0IGFyZ3MgPSBhbGxUb2tlbnMuZmlsdGVyKHRva2VuID0+IHRva2VuLnR5cGUgPT09IFwiYXJndW1lbnRcIikubWFwKHRva2VuID0+IHRva2VuLnRleHQpXG4gICAgY29uc3QgbmV3QXJncyA9IGZuKGFyZ3MpXG5cbiAgICBsZXQgbmV3VGV4dCA9IFwiXCJcbiAgICB3aGlsZSAoYWxsVG9rZW5zLmxlbmd0aCkge1xuICAgICAgY29uc3QgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgLy8gdG9rZW4udHlwZSBpcyBcInNlcGFyYXRvclwiIG9yIFwiYXJndW1lbnRcIlxuICAgICAgbmV3VGV4dCArPSB0b2tlbi50eXBlID09PSBcInNlcGFyYXRvclwiID8gdG9rZW4udGV4dCA6IG5ld0FyZ3Muc2hpZnQoKVxuICAgIH1cbiAgICByZXR1cm4gbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuICB9XG59XG5DaGFuZ2VPcmRlci5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgUmV2ZXJzZSBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgZ2V0TmV3TGlzdChyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3MucmV2ZXJzZSgpXG4gIH1cbn1cblJldmVyc2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZXZlcnNlSW5uZXJBbnlQYWlyIGV4dGVuZHMgUmV2ZXJzZSB7XG4gIHRhcmdldCA9IFwiSW5uZXJBbnlQYWlyXCJcbn1cblJldmVyc2VJbm5lckFueVBhaXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIGlmICh0aGlzLmJhY2t3YXJkcykgcm93cy5wdXNoKHJvd3Muc2hpZnQoKSlcbiAgICBlbHNlIHJvd3MudW5zaGlmdChyb3dzLnBvcCgpKVxuICAgIHJldHVybiByb3dzXG4gIH1cbn1cblJvdGF0ZS5yZWdpc3RlcigpXG5cbmNsYXNzIFJvdGF0ZUJhY2t3YXJkcyBleHRlbmRzIENoYW5nZU9yZGVyIHtcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuUm90YXRlQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuY2xhc3MgUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIgZXh0ZW5kcyBSb3RhdGUge1xuICB0YXJnZXQgPSBcIklubmVyQW55UGFpclwiXG59XG5Sb3RhdGVBcmd1bWVudHNPZklubmVyUGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c0JhY2t3YXJkc09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIge1xuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5Sb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpci5yZWdpc3RlcigpXG5cbmNsYXNzIFNvcnQgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiByb3dzLnNvcnQoKVxuICB9XG59XG5Tb3J0LnJlZ2lzdGVyKClcblxuY2xhc3MgU29ydENhc2VJbnNlbnNpdGl2ZWx5IGV4dGVuZHMgQ2hhbmdlT3JkZXIge1xuICBnZXROZXdMaXN0KHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5zb3J0KChyb3dBLCByb3dCKSA9PiByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwge3NlbnNpdGl2aXR5OiBcImJhc2VcIn0pKVxuICB9XG59XG5Tb3J0Q2FzZUluc2Vuc2l0aXZlbHkucmVnaXN0ZXIoKVxuXG5jbGFzcyBTb3J0QnlOdW1iZXIgZXh0ZW5kcyBDaGFuZ2VPcmRlciB7XG4gIGdldE5ld0xpc3Qocm93cykge1xuICAgIHJldHVybiBfLnNvcnRCeShyb3dzLCByb3cgPT4gTnVtYmVyLnBhcnNlSW50KHJvdykgfHwgSW5maW5pdHkpXG4gIH1cbn1cblNvcnRCeU51bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE51bWJlcmluZ0xpbmVzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldE5ld1RleHQodGV4dCkge1xuICAgIGNvbnN0IHJvd3MgPSB0aGlzLnV0aWxzLnNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KVxuICAgIGNvbnN0IGxhc3RSb3dXaWR0aCA9IFN0cmluZyhyb3dzLmxlbmd0aCkubGVuZ3RoXG5cbiAgICBjb25zdCBuZXdSb3dzID0gcm93cy5tYXAoKHJvd1RleHQsIGkpID0+IHtcbiAgICAgIGkrKyAvLyBmaXggMCBzdGFydCBpbmRleCB0byAxIHN0YXJ0LlxuICAgICAgY29uc3QgYW1vdW50T2ZQYWRkaW5nID0gdGhpcy51dGlscy5saW1pdE51bWJlcihsYXN0Um93V2lkdGggLSBTdHJpbmcoaSkubGVuZ3RoLCB7bWluOiAwfSlcbiAgICAgIHJldHVybiBcIiBcIi5yZXBlYXQoYW1vdW50T2ZQYWRkaW5nKSArIGkgKyBcIjogXCIgKyByb3dUZXh0XG4gICAgfSlcbiAgICByZXR1cm4gbmV3Um93cy5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICB9XG59XG5OdW1iZXJpbmdMaW5lcy5yZWdpc3RlcigpXG5cbi8vIHByZXR0aWVyLWlnbm9yZVxuY29uc3QgY2xhc3Nlc1RvUmVnaXN0ZXJUb1NlbGVjdExpc3QgPSBbXG4gIFRvZ2dsZUNhc2UsIFVwcGVyQ2FzZSwgTG93ZXJDYXNlLFxuICBSZXBsYWNlLCBTcGxpdEJ5Q2hhcmFjdGVyLFxuICBDYW1lbENhc2UsIFNuYWtlQ2FzZSwgUGFzY2FsQ2FzZSwgRGFzaENhc2UsIFRpdGxlQ2FzZSxcbiAgRW5jb2RlVXJpQ29tcG9uZW50LCBEZWNvZGVVcmlDb21wb25lbnQsXG4gIFRyaW1TdHJpbmcsIENvbXBhY3RTcGFjZXMsIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyxcbiAgQWxpZ25PY2N1cnJlbmNlLCBBbGlnblN0YXJ0T2ZPY2N1cnJlbmNlLCBBbGlnbkVuZE9mT2NjdXJyZW5jZSxcbiAgQ29udmVydFRvU29mdFRhYiwgQ29udmVydFRvSGFyZFRhYixcbiAgSm9pbldpdGhLZWVwaW5nU3BhY2UsIEpvaW5CeUlucHV0LCBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UsXG4gIFNwbGl0U3RyaW5nLCBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIsXG4gIFNwbGl0QXJndW1lbnRzLCBTcGxpdEFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3IsIFNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIsXG4gIFJldmVyc2UsIFJvdGF0ZSwgUm90YXRlQmFja3dhcmRzLCBTb3J0LCBTb3J0Q2FzZUluc2Vuc2l0aXZlbHksIFNvcnRCeU51bWJlcixcbiAgTnVtYmVyaW5nTGluZXMsXG5dXG5mb3IgKGNvbnN0IGtsYXNzIG9mIGNsYXNzZXNUb1JlZ2lzdGVyVG9TZWxlY3RMaXN0KSB7XG4gIGtsYXNzLnJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbn1cbiJdfQ==