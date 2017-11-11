"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;

var Base = require("./base");

var MiscCommand = (function (_Base) {
  _inherits(MiscCommand, _Base);

  function MiscCommand() {
    _classCallCheck(this, MiscCommand);

    _get(Object.getPrototypeOf(MiscCommand.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MiscCommand, null, [{
    key: "operationKind",
    value: "misc-command",
    enumerable: true
  }]);

  return MiscCommand;
})(Base);

MiscCommand.register(false);

var Mark = (function (_MiscCommand) {
  _inherits(Mark, _MiscCommand);

  function Mark() {
    _classCallCheck(this, Mark);

    _get(Object.getPrototypeOf(Mark.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
  }

  _createClass(Mark, [{
    key: "initialize",
    value: function initialize() {
      this.readChar();
      return _get(Object.getPrototypeOf(Mark.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      this.vimState.mark.set(this.input, this.editor.getCursorBufferPosition());
      this.activateMode("normal");
    }
  }]);

  return Mark;
})(MiscCommand);

Mark.register();

var ReverseSelections = (function (_MiscCommand2) {
  _inherits(ReverseSelections, _MiscCommand2);

  function ReverseSelections() {
    _classCallCheck(this, ReverseSelections);

    _get(Object.getPrototypeOf(ReverseSelections.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ReverseSelections, [{
    key: "execute",
    value: function execute() {
      this.swrap.setReversedState(this.editor, !this.editor.getLastSelection().isReversed());
      if (this.isMode("visual", "blockwise")) {
        this.getLastBlockwiseSelection().autoscroll();
      }
    }
  }]);

  return ReverseSelections;
})(MiscCommand);

ReverseSelections.register();

var BlockwiseOtherEnd = (function (_ReverseSelections) {
  _inherits(BlockwiseOtherEnd, _ReverseSelections);

  function BlockwiseOtherEnd() {
    _classCallCheck(this, BlockwiseOtherEnd);

    _get(Object.getPrototypeOf(BlockwiseOtherEnd.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(BlockwiseOtherEnd, [{
    key: "execute",
    value: function execute() {
      for (var blockwiseSelection of this.getBlockwiseSelections()) {
        blockwiseSelection.reverse();
      }
      _get(Object.getPrototypeOf(BlockwiseOtherEnd.prototype), "execute", this).call(this);
    }
  }]);

  return BlockwiseOtherEnd;
})(ReverseSelections);

BlockwiseOtherEnd.register();

var Undo = (function (_MiscCommand3) {
  _inherits(Undo, _MiscCommand3);

  function Undo() {
    _classCallCheck(this, Undo);

    _get(Object.getPrototypeOf(Undo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Undo, [{
    key: "setCursorPosition",
    value: function setCursorPosition(_ref) {
      var newRanges = _ref.newRanges;
      var oldRanges = _ref.oldRanges;
      var strategy = _ref.strategy;

      var lastCursor = this.editor.getLastCursor(); // This is restored cursor

      var changedRange = strategy === "smart" ? this.utils.findRangeContainsPoint(newRanges, lastCursor.getBufferPosition()) : this.utils.sortRanges(newRanges.concat(oldRanges))[0];

      if (changedRange) {
        if (this.utils.isLinewiseRange(changedRange)) this.utils.setBufferRow(lastCursor, changedRange.start.row);else lastCursor.setBufferPosition(changedRange.start);
      }
    }
  }, {
    key: "mutateWithTrackChanges",
    value: function mutateWithTrackChanges() {
      var newRanges = [];
      var oldRanges = [];

      // Collect changed range while mutating text-state by fn callback.
      var disposable = this.editor.getBuffer().onDidChange(function (_ref2) {
        var newRange = _ref2.newRange;
        var oldRange = _ref2.oldRange;

        if (newRange.isEmpty()) {
          oldRanges.push(oldRange); // Remove only
        } else {
            newRanges.push(newRange);
          }
      });

      this.mutate();
      disposable.dispose();
      return { newRanges: newRanges, oldRanges: oldRanges };
    }
  }, {
    key: "flashChanges",
    value: function flashChanges(_ref3) {
      var _this = this;

      var newRanges = _ref3.newRanges;
      var oldRanges = _ref3.oldRanges;

      var isMultipleSingleLineRanges = function isMultipleSingleLineRanges(ranges) {
        return ranges.length > 1 && ranges.every(_this.utils.isSingleLineRange);
      };

      if (newRanges.length > 0) {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(newRanges)) return;

        newRanges = newRanges.map(function (range) {
          return _this.utils.humanizeBufferRange(_this.editor, range);
        });
        newRanges = this.filterNonLeadingWhiteSpaceRange(newRanges);

        var type = isMultipleSingleLineRanges(newRanges) ? "undo-redo-multiple-changes" : "undo-redo";
        this.flash(newRanges, { type: type });
      } else {
        if (this.isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(oldRanges)) return;

        if (isMultipleSingleLineRanges(oldRanges)) {
          oldRanges = this.filterNonLeadingWhiteSpaceRange(oldRanges);
          this.flash(oldRanges, { type: "undo-redo-multiple-delete" });
        }
      }
    }
  }, {
    key: "filterNonLeadingWhiteSpaceRange",
    value: function filterNonLeadingWhiteSpaceRange(ranges) {
      var _this2 = this;

      return ranges.filter(function (range) {
        return !_this2.utils.isLeadingWhiteSpaceRange(_this2.editor, range);
      });
    }

    // [TODO] Improve further by checking oldText, newText?
    // [Purpose of this function]
    // Suppress flash when undo/redoing toggle-comment while flashing undo/redo of occurrence operation.
    // This huristic approach never be perfect.
    // Ultimately cannnot distinguish occurrence operation.
  }, {
    key: "isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows",
    value: function isMultipleAndAllRangeHaveSameColumnAndConsecutiveRows(ranges) {
      if (ranges.length <= 1) {
        return false;
      }

      var _ranges$0 = ranges[0];
      var startColumn = _ranges$0.start.column;
      var endColumn = _ranges$0.end.column;

      var previousRow = undefined;

      for (var range of ranges) {
        var start = range.start;
        var end = range.end;

        if (start.column !== startColumn || end.column !== endColumn) return false;
        if (previousRow != null && previousRow + 1 !== start.row) return false;
        previousRow = start.row;
      }
      return true;
    }
  }, {
    key: "flash",
    value: function flash(ranges, options) {
      var _this3 = this;

      if (options.timeout == null) options.timeout = 500;
      this.onDidFinishOperation(function () {
        return _this3.vimState.flash(ranges, options);
      });
    }
  }, {
    key: "execute",
    value: function execute() {
      var _mutateWithTrackChanges = this.mutateWithTrackChanges();

      var newRanges = _mutateWithTrackChanges.newRanges;
      var oldRanges = _mutateWithTrackChanges.oldRanges;

      for (var selection of this.editor.getSelections()) {
        selection.clear();
      }

      if (this.getConfig("setCursorToStartOfChangeOnUndoRedo")) {
        var strategy = this.getConfig("setCursorToStartOfChangeOnUndoRedoStrategy");
        this.setCursorPosition({ newRanges: newRanges, oldRanges: oldRanges, strategy: strategy });
        this.vimState.clearSelections();
      }

      if (this.getConfig("flashOnUndoRedo")) this.flashChanges({ newRanges: newRanges, oldRanges: oldRanges });
      this.activateMode("normal");
    }
  }, {
    key: "mutate",
    value: function mutate() {
      this.editor.undo();
    }
  }]);

  return Undo;
})(MiscCommand);

Undo.register();

var Redo = (function (_Undo) {
  _inherits(Redo, _Undo);

  function Redo() {
    _classCallCheck(this, Redo);

    _get(Object.getPrototypeOf(Redo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Redo, [{
    key: "mutate",
    value: function mutate() {
      this.editor.redo();
    }
  }]);

  return Redo;
})(Undo);

Redo.register();

// zc

var FoldCurrentRow = (function (_MiscCommand4) {
  _inherits(FoldCurrentRow, _MiscCommand4);

  function FoldCurrentRow() {
    _classCallCheck(this, FoldCurrentRow);

    _get(Object.getPrototypeOf(FoldCurrentRow.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldCurrentRow, [{
    key: "execute",
    value: function execute() {
      for (var selection of this.editor.getSelections()) {
        this.editor.foldBufferRow(this.getCursorPositionForSelection(selection).row);
      }
    }
  }]);

  return FoldCurrentRow;
})(MiscCommand);

FoldCurrentRow.register();

// zo

var UnfoldCurrentRow = (function (_MiscCommand5) {
  _inherits(UnfoldCurrentRow, _MiscCommand5);

  function UnfoldCurrentRow() {
    _classCallCheck(this, UnfoldCurrentRow);

    _get(Object.getPrototypeOf(UnfoldCurrentRow.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldCurrentRow, [{
    key: "execute",
    value: function execute() {
      for (var selection of this.editor.getSelections()) {
        this.editor.unfoldBufferRow(this.getCursorPositionForSelection(selection).row);
      }
    }
  }]);

  return UnfoldCurrentRow;
})(MiscCommand);

UnfoldCurrentRow.register();

// za

var ToggleFold = (function (_MiscCommand6) {
  _inherits(ToggleFold, _MiscCommand6);

  function ToggleFold() {
    _classCallCheck(this, ToggleFold);

    _get(Object.getPrototypeOf(ToggleFold.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ToggleFold, [{
    key: "execute",
    value: function execute() {
      this.editor.toggleFoldAtBufferRow(this.editor.getCursorBufferPosition().row);
    }
  }]);

  return ToggleFold;
})(MiscCommand);

ToggleFold.register();

// Base of zC, zO, zA

var FoldCurrentRowRecursivelyBase = (function (_MiscCommand7) {
  _inherits(FoldCurrentRowRecursivelyBase, _MiscCommand7);

  function FoldCurrentRowRecursivelyBase() {
    _classCallCheck(this, FoldCurrentRowRecursivelyBase);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursivelyBase.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldCurrentRowRecursivelyBase, [{
    key: "eachFoldStartRow",
    value: function eachFoldStartRow(fn) {
      for (var selection of this.editor.getSelectionsOrderedByBufferPosition().reverse()) {
        var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

        var row = _getCursorPositionForSelection.row;

        if (!this.editor.isFoldableAtBufferRow(row)) continue;

        var foldStartRows = this.utils.getFoldRowRangesContainedByFoldStartsAtRow(this.editor, row).map(function (rowRange) {
          return rowRange[0];
        });
        for (var _row of foldStartRows.reverse()) {
          fn(_row);
        }
      }
    }
  }, {
    key: "foldRecursively",
    value: function foldRecursively() {
      var _this4 = this;

      this.eachFoldStartRow(function (row) {
        if (!_this4.editor.isFoldedAtBufferRow(row)) _this4.editor.foldBufferRow(row);
      });
    }
  }, {
    key: "unfoldRecursively",
    value: function unfoldRecursively() {
      var _this5 = this;

      this.eachFoldStartRow(function (row) {
        if (_this5.editor.isFoldedAtBufferRow(row)) _this5.editor.unfoldBufferRow(row);
      });
    }
  }]);

  return FoldCurrentRowRecursivelyBase;
})(MiscCommand);

FoldCurrentRowRecursivelyBase.register(false);

// zC

var FoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase) {
  _inherits(FoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase);

  function FoldCurrentRowRecursively() {
    _classCallCheck(this, FoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(FoldCurrentRowRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldCurrentRowRecursively, [{
    key: "execute",
    value: function execute() {
      this.foldRecursively();
    }
  }]);

  return FoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

FoldCurrentRowRecursively.register();

// zO

var UnfoldCurrentRowRecursively = (function (_FoldCurrentRowRecursivelyBase2) {
  _inherits(UnfoldCurrentRowRecursively, _FoldCurrentRowRecursivelyBase2);

  function UnfoldCurrentRowRecursively() {
    _classCallCheck(this, UnfoldCurrentRowRecursively);

    _get(Object.getPrototypeOf(UnfoldCurrentRowRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldCurrentRowRecursively, [{
    key: "execute",
    value: function execute() {
      this.unfoldRecursively();
    }
  }]);

  return UnfoldCurrentRowRecursively;
})(FoldCurrentRowRecursivelyBase);

UnfoldCurrentRowRecursively.register();

// zA

var ToggleFoldRecursively = (function (_FoldCurrentRowRecursivelyBase3) {
  _inherits(ToggleFoldRecursively, _FoldCurrentRowRecursivelyBase3);

  function ToggleFoldRecursively() {
    _classCallCheck(this, ToggleFoldRecursively);

    _get(Object.getPrototypeOf(ToggleFoldRecursively.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ToggleFoldRecursively, [{
    key: "execute",
    value: function execute() {
      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(this.editor.getLastSelection());

      var row = _getCursorPositionForSelection2.row;

      if (this.editor.isFoldedAtBufferRow(row)) {
        this.unfoldRecursively();
      } else {
        this.foldRecursively();
      }
    }
  }]);

  return ToggleFoldRecursively;
})(FoldCurrentRowRecursivelyBase);

ToggleFoldRecursively.register();

// zR

var UnfoldAll = (function (_MiscCommand8) {
  _inherits(UnfoldAll, _MiscCommand8);

  function UnfoldAll() {
    _classCallCheck(this, UnfoldAll);

    _get(Object.getPrototypeOf(UnfoldAll.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldAll, [{
    key: "execute",
    value: function execute() {
      this.editor.unfoldAll();
    }
  }]);

  return UnfoldAll;
})(MiscCommand);

UnfoldAll.register();

// zM

var FoldAll = (function (_MiscCommand9) {
  _inherits(FoldAll, _MiscCommand9);

  function FoldAll() {
    _classCallCheck(this, FoldAll);

    _get(Object.getPrototypeOf(FoldAll.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldAll, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind = this.utils.getFoldInfoByKind(this.editor);

      var allFold = _utils$getFoldInfoByKind.allFold;

      if (!allFold) return;

      this.editor.unfoldAll();
      for (var _ref42 of allFold.rowRangesWithIndent) {
        var indent = _ref42.indent;
        var startRow = _ref42.startRow;
        var endRow = _ref42.endRow;

        if (indent <= this.getConfig("maxFoldableIndentLevel")) {
          this.editor.foldBufferRowRange(startRow, endRow);
        }
      }
      this.editor.scrollToCursorPosition({ center: true });
    }
  }]);

  return FoldAll;
})(MiscCommand);

FoldAll.register();

// zr

var UnfoldNextIndentLevel = (function (_MiscCommand10) {
  _inherits(UnfoldNextIndentLevel, _MiscCommand10);

  function UnfoldNextIndentLevel() {
    _classCallCheck(this, UnfoldNextIndentLevel);

    _get(Object.getPrototypeOf(UnfoldNextIndentLevel.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(UnfoldNextIndentLevel, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind2 = this.utils.getFoldInfoByKind(this.editor);

      var folded = _utils$getFoldInfoByKind2.folded;

      if (!folded) return;
      var minIndent = folded.minIndent;
      var rowRangesWithIndent = folded.rowRangesWithIndent;

      var count = this.utils.limitNumber(this.getCount() - 1, { min: 0 });
      var targetIndents = this.utils.getList(minIndent, minIndent + count);
      for (var _ref52 of rowRangesWithIndent) {
        var indent = _ref52.indent;
        var startRow = _ref52.startRow;

        if (targetIndents.includes(indent)) {
          this.editor.unfoldBufferRow(startRow);
        }
      }
    }
  }]);

  return UnfoldNextIndentLevel;
})(MiscCommand);

UnfoldNextIndentLevel.register();

// zm

var FoldNextIndentLevel = (function (_MiscCommand11) {
  _inherits(FoldNextIndentLevel, _MiscCommand11);

  function FoldNextIndentLevel() {
    _classCallCheck(this, FoldNextIndentLevel);

    _get(Object.getPrototypeOf(FoldNextIndentLevel.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(FoldNextIndentLevel, [{
    key: "execute",
    value: function execute() {
      var _utils$getFoldInfoByKind3 = this.utils.getFoldInfoByKind(this.editor);

      var unfolded = _utils$getFoldInfoByKind3.unfolded;
      var allFold = _utils$getFoldInfoByKind3.allFold;

      if (!unfolded) return;
      // FIXME: Why I need unfoldAll()? Why can't I just fold non-folded-fold only?
      // Unless unfoldAll() here, @editor.unfoldAll() delete foldMarker but fail
      // to render unfolded rows correctly.
      // I believe this is bug of text-buffer's markerLayer which assume folds are
      // created **in-order** from top-row to bottom-row.
      this.editor.unfoldAll();

      var maxFoldable = this.getConfig("maxFoldableIndentLevel");
      var fromLevel = Math.min(unfolded.maxIndent, maxFoldable);
      var count = this.utils.limitNumber(this.getCount() - 1, { min: 0 });
      fromLevel = this.utils.limitNumber(fromLevel - count, { min: 0 });
      var targetIndents = this.utils.getList(fromLevel, maxFoldable);
      for (var _ref62 of allFold.rowRangesWithIndent) {
        var indent = _ref62.indent;
        var startRow = _ref62.startRow;
        var endRow = _ref62.endRow;

        if (targetIndents.includes(indent)) {
          this.editor.foldBufferRowRange(startRow, endRow);
        }
      }
    }
  }]);

  return FoldNextIndentLevel;
})(MiscCommand);

FoldNextIndentLevel.register();

var ReplaceModeBackspace = (function (_MiscCommand12) {
  _inherits(ReplaceModeBackspace, _MiscCommand12);

  function ReplaceModeBackspace() {
    _classCallCheck(this, ReplaceModeBackspace);

    _get(Object.getPrototypeOf(ReplaceModeBackspace.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ReplaceModeBackspace, [{
    key: "execute",
    value: function execute() {
      for (var selection of this.editor.getSelections()) {
        // char might be empty.
        var char = this.vimState.modeManager.getReplacedCharForSelection(selection);
        if (char != null) {
          selection.selectLeft();
          if (!selection.insertText(char).isEmpty()) selection.cursor.moveLeft();
        }
      }
    }
  }], [{
    key: "commandScope",
    value: "atom-text-editor.vim-mode-plus.insert-mode.replace",
    enumerable: true
  }]);

  return ReplaceModeBackspace;
})(MiscCommand);

ReplaceModeBackspace.register();

// ctrl-e scroll lines downwards

var ScrollDown = (function (_MiscCommand13) {
  _inherits(ScrollDown, _MiscCommand13);

  function ScrollDown() {
    _classCallCheck(this, ScrollDown);

    _get(Object.getPrototypeOf(ScrollDown.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollDown, [{
    key: "execute",
    value: function execute() {
      var count = this.getCount();
      var oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      var newFirstRow = this.editor.getFirstVisibleScreenRow();

      var offset = 2;

      var _editor$getCursorScreenPosition = this.editor.getCursorScreenPosition();

      var row = _editor$getCursorScreenPosition.row;
      var column = _editor$getCursorScreenPosition.column;

      if (row < newFirstRow + offset) {
        var newPoint = [row + count, column];
        this.editor.setCursorScreenPosition(newPoint, { autoscroll: false });
      }
    }
  }]);

  return ScrollDown;
})(MiscCommand);

ScrollDown.register();

// ctrl-y scroll lines upwards

var ScrollUp = (function (_MiscCommand14) {
  _inherits(ScrollUp, _MiscCommand14);

  function ScrollUp() {
    _classCallCheck(this, ScrollUp);

    _get(Object.getPrototypeOf(ScrollUp.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ScrollUp, [{
    key: "execute",
    value: function execute() {
      var count = this.getCount();
      var oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      var newLastRow = this.editor.getLastVisibleScreenRow();

      var offset = 2;

      var _editor$getCursorScreenPosition2 = this.editor.getCursorScreenPosition();

      var row = _editor$getCursorScreenPosition2.row;
      var column = _editor$getCursorScreenPosition2.column;

      if (row >= newLastRow - offset) {
        var newPoint = [row - count, column];
        this.editor.setCursorScreenPosition(newPoint, { autoscroll: false });
      }
    }
  }]);

  return ScrollUp;
})(MiscCommand);

ScrollUp.register();

// Adjust scrollTop to change where curos is shown in viewport.
// +--------+------------------+---------+
// | where  | move to 1st char | no move |
// +--------+------------------+---------+
// | top    | `z enter`        | `z t`   |
// | middle | `z .`            | `z z`   |
// | bottom | `z -`            | `z b`   |
// +--------+------------------+---------+

var ScrollCursor = (function (_MiscCommand15) {
  _inherits(ScrollCursor, _MiscCommand15);

  function ScrollCursor() {
    _classCallCheck(this, ScrollCursor);

    _get(Object.getPrototypeOf(ScrollCursor.prototype), "constructor", this).apply(this, arguments);

    this.moveToFirstCharacterOfLine = false;
    this.where = null;
  }

  _createClass(ScrollCursor, [{
    key: "execute",
    value: function execute() {
      this.editorElement.setScrollTop(this.getScrollTop());
      if (this.moveToFirstCharacterOfLine) this.editor.moveToFirstCharacterOfLine();
    }
  }, {
    key: "getScrollTop",
    value: function getScrollTop() {
      var screenPosition = this.editor.getCursorScreenPosition();

      var _editorElement$pixelPositionForScreenPosition = this.editorElement.pixelPositionForScreenPosition(screenPosition);

      var top = _editorElement$pixelPositionForScreenPosition.top;

      switch (this.where) {
        case "top":
          this.recommendToEnableScrollPastEndIfNecessary();
          return top - this.getOffSetPixelHeight();
        case "middle":
          return top - this.editorElement.getHeight() / 2;
        case "bottom":
          return top - (this.editorElement.getHeight() - this.getOffSetPixelHeight(1));
      }
    }
  }, {
    key: "getOffSetPixelHeight",
    value: function getOffSetPixelHeight() {
      var lineDelta = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

      var scrolloff = 2; // atom default. Better to use editor.getVerticalScrollMargin()?
      return this.editor.getLineHeightInPixels() * (scrolloff + lineDelta);
    }
  }, {
    key: "recommendToEnableScrollPastEndIfNecessary",
    value: function recommendToEnableScrollPastEndIfNecessary() {
      if (this.editor.getLastVisibleScreenRow() === this.editor.getLastScreenRow() && !this.editor.getScrollPastEnd()) {
        (function () {
          var message = ["vim-mode-plus", "- For `z t` and `z enter` works properly in every situation, `editor.scrollPastEnd` setting need to be `true`.", '- You can enable it from `"Settings" > "Editor" > "Scroll Past End"`.', "- Or **do you allow vmp enable it for you now?**"].join("\n");

          var notification = atom.notifications.addInfo(message, {
            dismissable: true,
            buttons: [{
              text: "No thanks.",
              onDidClick: function onDidClick() {
                return notification.dismiss();
              }
            }, {
              text: "OK. Enable it now!!",
              onDidClick: function onDidClick() {
                atom.config.set("editor.scrollPastEnd", true);
                notification.dismiss();
              }
            }]
          });
        })();
      }
    }
  }]);

  return ScrollCursor;
})(MiscCommand);

ScrollCursor.register(false);

// top: z enter

var ScrollCursorToTop = (function (_ScrollCursor) {
  _inherits(ScrollCursorToTop, _ScrollCursor);

  function ScrollCursorToTop() {
    _classCallCheck(this, ScrollCursorToTop);

    _get(Object.getPrototypeOf(ScrollCursorToTop.prototype), "constructor", this).apply(this, arguments);

    this.where = "top";
    this.moveToFirstCharacterOfLine = true;
  }

  return ScrollCursorToTop;
})(ScrollCursor);

ScrollCursorToTop.register();

// top: zt

var ScrollCursorToTopLeave = (function (_ScrollCursor2) {
  _inherits(ScrollCursorToTopLeave, _ScrollCursor2);

  function ScrollCursorToTopLeave() {
    _classCallCheck(this, ScrollCursorToTopLeave);

    _get(Object.getPrototypeOf(ScrollCursorToTopLeave.prototype), "constructor", this).apply(this, arguments);

    this.where = "top";
  }

  return ScrollCursorToTopLeave;
})(ScrollCursor);

ScrollCursorToTopLeave.register();

// middle: z.

var ScrollCursorToMiddle = (function (_ScrollCursor3) {
  _inherits(ScrollCursorToMiddle, _ScrollCursor3);

  function ScrollCursorToMiddle() {
    _classCallCheck(this, ScrollCursorToMiddle);

    _get(Object.getPrototypeOf(ScrollCursorToMiddle.prototype), "constructor", this).apply(this, arguments);

    this.where = "middle";
    this.moveToFirstCharacterOfLine = true;
  }

  return ScrollCursorToMiddle;
})(ScrollCursor);

ScrollCursorToMiddle.register();

// middle: zz

var ScrollCursorToMiddleLeave = (function (_ScrollCursor4) {
  _inherits(ScrollCursorToMiddleLeave, _ScrollCursor4);

  function ScrollCursorToMiddleLeave() {
    _classCallCheck(this, ScrollCursorToMiddleLeave);

    _get(Object.getPrototypeOf(ScrollCursorToMiddleLeave.prototype), "constructor", this).apply(this, arguments);

    this.where = "middle";
  }

  return ScrollCursorToMiddleLeave;
})(ScrollCursor);

ScrollCursorToMiddleLeave.register();

// bottom: z-

var ScrollCursorToBottom = (function (_ScrollCursor5) {
  _inherits(ScrollCursorToBottom, _ScrollCursor5);

  function ScrollCursorToBottom() {
    _classCallCheck(this, ScrollCursorToBottom);

    _get(Object.getPrototypeOf(ScrollCursorToBottom.prototype), "constructor", this).apply(this, arguments);

    this.where = "bottom";
    this.moveToFirstCharacterOfLine = true;
  }

  return ScrollCursorToBottom;
})(ScrollCursor);

ScrollCursorToBottom.register();

// bottom: zb

var ScrollCursorToBottomLeave = (function (_ScrollCursor6) {
  _inherits(ScrollCursorToBottomLeave, _ScrollCursor6);

  function ScrollCursorToBottomLeave() {
    _classCallCheck(this, ScrollCursorToBottomLeave);

    _get(Object.getPrototypeOf(ScrollCursorToBottomLeave.prototype), "constructor", this).apply(this, arguments);

    this.where = "bottom";
  }

  return ScrollCursorToBottomLeave;
})(ScrollCursor);

ScrollCursorToBottomLeave.register();

// Horizontal Scroll without changing cursor position
// -------------------------
// zs

var ScrollCursorToLeft = (function (_MiscCommand16) {
  _inherits(ScrollCursorToLeft, _MiscCommand16);

  function ScrollCursorToLeft() {
    _classCallCheck(this, ScrollCursorToLeft);

    _get(Object.getPrototypeOf(ScrollCursorToLeft.prototype), "constructor", this).apply(this, arguments);

    this.which = "left";
  }

  _createClass(ScrollCursorToLeft, [{
    key: "execute",
    value: function execute() {
      var translation = this.which === "left" ? [0, 0] : [0, 1];
      var screenPosition = this.editor.getCursorScreenPosition().translate(translation);
      var pixel = this.editorElement.pixelPositionForScreenPosition(screenPosition);
      if (this.which === "left") {
        this.editorElement.setScrollLeft(pixel.left);
      } else {
        this.editorElement.setScrollRight(pixel.left);
        this.editor.component.updateSync(); // FIXME: This is necessary maybe because of bug of atom-core.
      }
    }
  }]);

  return ScrollCursorToLeft;
})(MiscCommand);

ScrollCursorToLeft.register();

// ze

var ScrollCursorToRight = (function (_ScrollCursorToLeft) {
  _inherits(ScrollCursorToRight, _ScrollCursorToLeft);

  function ScrollCursorToRight() {
    _classCallCheck(this, ScrollCursorToRight);

    _get(Object.getPrototypeOf(ScrollCursorToRight.prototype), "constructor", this).apply(this, arguments);

    this.which = "right";
  }

  return ScrollCursorToRight;
})(ScrollCursorToLeft);

ScrollCursorToRight.register();

// insert-mode specific commands
// -------------------------

var InsertMode = (function (_MiscCommand17) {
  _inherits(InsertMode, _MiscCommand17);

  function InsertMode() {
    _classCallCheck(this, InsertMode);

    _get(Object.getPrototypeOf(InsertMode.prototype), "constructor", this).apply(this, arguments);
  }

  return InsertMode;
})(MiscCommand);

InsertMode.commandScope = "atom-text-editor.vim-mode-plus.insert-mode";

var ActivateNormalModeOnce = (function (_InsertMode) {
  _inherits(ActivateNormalModeOnce, _InsertMode);

  function ActivateNormalModeOnce() {
    _classCallCheck(this, ActivateNormalModeOnce);

    _get(Object.getPrototypeOf(ActivateNormalModeOnce.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(ActivateNormalModeOnce, [{
    key: "execute",
    value: function execute() {
      var _this6 = this;

      var cursorsToMoveRight = this.editor.getCursors().filter(function (cursor) {
        return !cursor.isAtBeginningOfLine();
      });
      this.vimState.activate("normal");
      for (var cursor of cursorsToMoveRight) {
        this.utils.moveCursorRight(cursor);
      }

      var disposable = atom.commands.onDidDispatch(function (event) {
        if (event.type === _this6.getCommandName()) return;

        disposable.dispose();
        disposable = null;
        _this6.vimState.activate("insert");
      });
    }
  }]);

  return ActivateNormalModeOnce;
})(InsertMode);

ActivateNormalModeOnce.register();

var InsertRegister = (function (_InsertMode2) {
  _inherits(InsertRegister, _InsertMode2);

  function InsertRegister() {
    _classCallCheck(this, InsertRegister);

    _get(Object.getPrototypeOf(InsertRegister.prototype), "constructor", this).apply(this, arguments);

    this.requireInput = true;
  }

  _createClass(InsertRegister, [{
    key: "initialize",
    value: function initialize() {
      this.readChar();
      return _get(Object.getPrototypeOf(InsertRegister.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this7 = this;

      this.editor.transact(function () {
        for (var selection of _this7.editor.getSelections()) {
          var text = _this7.vimState.register.getText(_this7.input, selection);
          selection.insertText(text);
        }
      });
    }
  }]);

  return InsertRegister;
})(InsertMode);

InsertRegister.register();

var InsertLastInserted = (function (_InsertMode3) {
  _inherits(InsertLastInserted, _InsertMode3);

  function InsertLastInserted() {
    _classCallCheck(this, InsertLastInserted);

    _get(Object.getPrototypeOf(InsertLastInserted.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(InsertLastInserted, [{
    key: "execute",
    value: function execute() {
      var text = this.vimState.register.getText(".");
      this.editor.insertText(text);
    }
  }]);

  return InsertLastInserted;
})(InsertMode);

InsertLastInserted.register();

var CopyFromLineAbove = (function (_InsertMode4) {
  _inherits(CopyFromLineAbove, _InsertMode4);

  function CopyFromLineAbove() {
    _classCallCheck(this, CopyFromLineAbove);

    _get(Object.getPrototypeOf(CopyFromLineAbove.prototype), "constructor", this).apply(this, arguments);

    this.rowDelta = -1;
  }

  _createClass(CopyFromLineAbove, [{
    key: "execute",
    value: function execute() {
      var _this8 = this;

      var translation = [this.rowDelta, 0];
      this.editor.transact(function () {
        for (var selection of _this8.editor.getSelections()) {
          var point = selection.cursor.getBufferPosition().translate(translation);
          if (point.row < 0) continue;

          var range = Range.fromPointWithDelta(point, 0, 1);
          var text = _this8.editor.getTextInBufferRange(range);
          if (text) selection.insertText(text);
        }
      });
    }
  }]);

  return CopyFromLineAbove;
})(InsertMode);

CopyFromLineAbove.register();

var CopyFromLineBelow = (function (_CopyFromLineAbove) {
  _inherits(CopyFromLineBelow, _CopyFromLineAbove);

  function CopyFromLineBelow() {
    _classCallCheck(this, CopyFromLineBelow);

    _get(Object.getPrototypeOf(CopyFromLineBelow.prototype), "constructor", this).apply(this, arguments);

    this.rowDelta = +1;
  }

  return CopyFromLineBelow;
})(CopyFromLineAbove);

CopyFromLineBelow.register();

var NextTab = (function (_MiscCommand18) {
  _inherits(NextTab, _MiscCommand18);

  function NextTab() {
    _classCallCheck(this, NextTab);

    _get(Object.getPrototypeOf(NextTab.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = 0;
  }

  _createClass(NextTab, [{
    key: "execute",
    value: function execute() {
      var count = this.getCount();
      var pane = atom.workspace.paneForItem(this.editor);

      if (count) pane.activateItemAtIndex(count - 1);else pane.activateNextItem();
    }
  }]);

  return NextTab;
})(MiscCommand);

NextTab.register();

var PreviousTab = (function (_MiscCommand19) {
  _inherits(PreviousTab, _MiscCommand19);

  function PreviousTab() {
    _classCallCheck(this, PreviousTab);

    _get(Object.getPrototypeOf(PreviousTab.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PreviousTab, [{
    key: "execute",
    value: function execute() {
      atom.workspace.paneForItem(this.editor).activatePreviousItem();
    }
  }]);

  return PreviousTab;
})(MiscCommand);

PreviousTab.register();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFSyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7QUFDWixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7O2VBQVgsV0FBVzs7V0FDUSxjQUFjOzs7O1NBRGpDLFdBQVc7R0FBUyxJQUFJOztBQUc5QixXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztJQUVyQixJQUFJO1lBQUosSUFBSTs7V0FBSixJQUFJOzBCQUFKLElBQUk7OytCQUFKLElBQUk7O1NBQ1IsWUFBWSxHQUFHLElBQUk7OztlQURmLElBQUk7O1dBRUUsc0JBQUc7QUFDWCxVQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDZix3Q0FKRSxJQUFJLDRDQUltQjtLQUMxQjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsQ0FBQTtBQUN6RSxVQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzVCOzs7U0FWRyxJQUFJO0dBQVMsV0FBVzs7QUFZOUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVULGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOzs7ZUFBakIsaUJBQWlCOztXQUNkLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFB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Qzs7O1NBRFQsaUJBQWlCO0dBQVMsaUJBQWlCOztBQUdqRCxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFdEIsT0FBTztZQUFQLE9BQU87O1dBQVAsT0FBTzswQkFBUCxPQUFPOzsrQkFBUCxPQUFPOztTQUNYLFlBQVksR0FBRyxDQUFDOzs7ZUFEWixPQUFPOztXQUdKLG1CQUFHO0FBQ1IsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0FBQzdCLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsVUFBSSxLQUFLLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQSxLQUN6QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBVEcsT0FBTztHQUFTLFdBQVc7O0FBV2pDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFWixXQUFXO1lBQVgsV0FBVzs7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OytCQUFYLFdBQVc7OztlQUFYLFdBQVc7O1dBQ1IsbUJBQUc7QUFDUixVQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtLQUMvRDs7O1NBSEcsV0FBVztHQUFTLFdBQVc7O0FBS3JDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9taXNjLWNvbW1hbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKFwiYXRvbVwiKVxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTWlzY0NvbW1hbmQgZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm1pc2MtY29tbWFuZFwiXG59XG5NaXNjQ29tbWFuZC5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTWFyayBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucmVhZENoYXIoKVxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldCh0aGlzLmlucHV0LCB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gIH1cbn1cbk1hcmsucmVnaXN0ZXIoKVxuXG5jbGFzcyBSZXZlcnNlU2VsZWN0aW9ucyBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnN3cmFwLnNldFJldmVyc2VkU3RhdGUodGhpcy5lZGl0b3IsICF0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNSZXZlcnNlZCgpKVxuICAgIGlmICh0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImJsb2Nrd2lzZVwiKSkge1xuICAgICAgdGhpcy5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG4gICAgfVxuICB9XG59XG5SZXZlcnNlU2VsZWN0aW9ucy5yZWdpc3RlcigpXG5cbmNsYXNzIEJsb2Nrd2lzZU90aGVyRW5kIGV4dGVuZHMgUmV2ZXJzZVNlbGVjdGlvbnMge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgYmxvY2t3aXNlU2VsZWN0aW9uIG9mIHRoaXMuZ2V0QmxvY2t3aXNlU2VsZWN0aW9ucygpKSB7XG4gICAgICBibG9ja3dpc2VTZWxlY3Rpb24ucmV2ZXJzZSgpXG4gICAgfVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG59XG5CbG9ja3dpc2VPdGhlckVuZC5yZWdpc3RlcigpXG5cbmNsYXNzIFVuZG8gZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHNldEN1cnNvclBvc2l0aW9uKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KSB7XG4gICAgY29uc3QgbGFzdEN1cnNvciA9IHRoaXMuZWRpdG9yLmdldExhc3RDdXJzb3IoKSAvLyBUaGlzIGlzIHJlc3RvcmVkIGN1cnNvclxuXG4gICAgY29uc3QgY2hhbmdlZFJhbmdlID1cbiAgICAgIHN0cmF0ZWd5ID09PSBcInNtYXJ0XCJcbiAgICAgICAgPyB0aGlzLnV0aWxzLmZpbmRSYW5nZUNvbnRhaW5zUG9pbnQobmV3UmFuZ2VzLCBsYXN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgIDogdGhpcy51dGlscy5zb3J0UmFuZ2VzKG5ld1Jhbmdlcy5jb25jYXQob2xkUmFuZ2VzKSlbMF1cblxuICAgIGlmIChjaGFuZ2VkUmFuZ2UpIHtcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzTGluZXdpc2VSYW5nZShjaGFuZ2VkUmFuZ2UpKSB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhsYXN0Q3Vyc29yLCBjaGFuZ2VkUmFuZ2Uuc3RhcnQucm93KVxuICAgICAgZWxzZSBsYXN0Q3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGNoYW5nZWRSYW5nZS5zdGFydClcbiAgICB9XG4gIH1cblxuICBtdXRhdGVXaXRoVHJhY2tDaGFuZ2VzKCkge1xuICAgIGNvbnN0IG5ld1JhbmdlcyA9IFtdXG4gICAgY29uc3Qgb2xkUmFuZ2VzID0gW11cblxuICAgIC8vIENvbGxlY3QgY2hhbmdlZCByYW5nZSB3aGlsZSBtdXRhdGluZyB0ZXh0LXN0YXRlIGJ5IGZuIGNhbGxiYWNrLlxuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSgoe25ld1JhbmdlLCBvbGRSYW5nZX0pID0+IHtcbiAgICAgIGlmIChuZXdSYW5nZS5pc0VtcHR5KCkpIHtcbiAgICAgICAgb2xkUmFuZ2VzLnB1c2gob2xkUmFuZ2UpIC8vIFJlbW92ZSBvbmx5XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdSYW5nZXMucHVzaChuZXdSYW5nZSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5tdXRhdGUoKVxuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgcmV0dXJuIHtuZXdSYW5nZXMsIG9sZFJhbmdlc31cbiAgfVxuXG4gIGZsYXNoQ2hhbmdlcyh7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9KSB7XG4gICAgY29uc3QgaXNNdWx0aXBsZVNpbmdsZUxpbmVSYW5nZXMgPSByYW5nZXMgPT4gcmFuZ2VzLmxlbmd0aCA+IDEgJiYgcmFuZ2VzLmV2ZXJ5KHRoaXMudXRpbHMuaXNTaW5nbGVMaW5lUmFuZ2UpXG5cbiAgICBpZiAobmV3UmFuZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKG5ld1JhbmdlcykpIHJldHVyblxuXG4gICAgICBuZXdSYW5nZXMgPSBuZXdSYW5nZXMubWFwKHJhbmdlID0+IHRoaXMudXRpbHMuaHVtYW5pemVCdWZmZXJSYW5nZSh0aGlzLmVkaXRvciwgcmFuZ2UpKVxuICAgICAgbmV3UmFuZ2VzID0gdGhpcy5maWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG5ld1JhbmdlcylcblxuICAgICAgY29uc3QgdHlwZSA9IGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKG5ld1JhbmdlcykgPyBcInVuZG8tcmVkby1tdWx0aXBsZS1jaGFuZ2VzXCIgOiBcInVuZG8tcmVkb1wiXG4gICAgICB0aGlzLmZsYXNoKG5ld1Jhbmdlcywge3R5cGV9KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5pc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhvbGRSYW5nZXMpKSByZXR1cm5cblxuICAgICAgaWYgKGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzKG9sZFJhbmdlcykpIHtcbiAgICAgICAgb2xkUmFuZ2VzID0gdGhpcy5maWx0ZXJOb25MZWFkaW5nV2hpdGVTcGFjZVJhbmdlKG9sZFJhbmdlcylcbiAgICAgICAgdGhpcy5mbGFzaChvbGRSYW5nZXMsIHt0eXBlOiBcInVuZG8tcmVkby1tdWx0aXBsZS1kZWxldGVcIn0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShyYW5nZXMpIHtcbiAgICByZXR1cm4gcmFuZ2VzLmZpbHRlcihyYW5nZSA9PiAhdGhpcy51dGlscy5pc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UodGhpcy5lZGl0b3IsIHJhbmdlKSlcbiAgfVxuXG4gIC8vIFtUT0RPXSBJbXByb3ZlIGZ1cnRoZXIgYnkgY2hlY2tpbmcgb2xkVGV4dCwgbmV3VGV4dD9cbiAgLy8gW1B1cnBvc2Ugb2YgdGhpcyBmdW5jdGlvbl1cbiAgLy8gU3VwcHJlc3MgZmxhc2ggd2hlbiB1bmRvL3JlZG9pbmcgdG9nZ2xlLWNvbW1lbnQgd2hpbGUgZmxhc2hpbmcgdW5kby9yZWRvIG9mIG9jY3VycmVuY2Ugb3BlcmF0aW9uLlxuICAvLyBUaGlzIGh1cmlzdGljIGFwcHJvYWNoIG5ldmVyIGJlIHBlcmZlY3QuXG4gIC8vIFVsdGltYXRlbHkgY2Fubm5vdCBkaXN0aW5ndWlzaCBvY2N1cnJlbmNlIG9wZXJhdGlvbi5cbiAgaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3MocmFuZ2VzKSB7XG4gICAgaWYgKHJhbmdlcy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qge3N0YXJ0OiB7Y29sdW1uOiBzdGFydENvbHVtbn0sIGVuZDoge2NvbHVtbjogZW5kQ29sdW1ufX0gPSByYW5nZXNbMF1cbiAgICBsZXQgcHJldmlvdXNSb3dcblxuICAgIGZvciAoY29uc3QgcmFuZ2Ugb2YgcmFuZ2VzKSB7XG4gICAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgICAgaWYgKHN0YXJ0LmNvbHVtbiAhPT0gc3RhcnRDb2x1bW4gfHwgZW5kLmNvbHVtbiAhPT0gZW5kQ29sdW1uKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChwcmV2aW91c1JvdyAhPSBudWxsICYmIHByZXZpb3VzUm93ICsgMSAhPT0gc3RhcnQucm93KSByZXR1cm4gZmFsc2VcbiAgICAgIHByZXZpb3VzUm93ID0gc3RhcnQucm93XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmbGFzaChyYW5nZXMsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy50aW1lb3V0ID09IG51bGwpIG9wdGlvbnMudGltZW91dCA9IDUwMFxuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4gdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIG9wdGlvbnMpKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9ID0gdGhpcy5tdXRhdGVXaXRoVHJhY2tDaGFuZ2VzKClcblxuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgc2VsZWN0aW9uLmNsZWFyKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvXCIpKSB7XG4gICAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuZ2V0Q29uZmlnKFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1N0cmF0ZWd5XCIpXG4gICAgICB0aGlzLnNldEN1cnNvclBvc2l0aW9uKHtuZXdSYW5nZXMsIG9sZFJhbmdlcywgc3RyYXRlZ3l9KVxuICAgICAgdGhpcy52aW1TdGF0ZS5jbGVhclNlbGVjdGlvbnMoKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZsYXNoT25VbmRvUmVkb1wiKSkgdGhpcy5mbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSlcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG5cbiAgbXV0YXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnVuZG8oKVxuICB9XG59XG5VbmRvLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVkbyBleHRlbmRzIFVuZG8ge1xuICBtdXRhdGUoKSB7XG4gICAgdGhpcy5lZGl0b3IucmVkbygpXG4gIH1cbn1cblJlZG8ucmVnaXN0ZXIoKVxuXG4vLyB6Y1xuY2xhc3MgRm9sZEN1cnJlbnRSb3cgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICB0aGlzLmVkaXRvci5mb2xkQnVmZmVyUm93KHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3cpXG4gICAgfVxuICB9XG59XG5Gb2xkQ3VycmVudFJvdy5yZWdpc3RlcigpXG5cbi8vIHpvXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3cpXG4gICAgfVxuICB9XG59XG5VbmZvbGRDdXJyZW50Um93LnJlZ2lzdGVyKClcblxuLy8gemFcbmNsYXNzIFRvZ2dsZUZvbGQgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5lZGl0b3IudG9nZ2xlRm9sZEF0QnVmZmVyUm93KHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93KVxuICB9XG59XG5Ub2dnbGVGb2xkLnJlZ2lzdGVyKClcblxuLy8gQmFzZSBvZiB6Qywgek8sIHpBXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZWFjaEZvbGRTdGFydFJvdyhmbikge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpLnJldmVyc2UoKSkge1xuICAgICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmICghdGhpcy5lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHJvdykpIGNvbnRpbnVlXG5cbiAgICAgIGNvbnN0IGZvbGRTdGFydFJvd3MgPSB0aGlzLnV0aWxzXG4gICAgICAgIC5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbmVkQnlGb2xkU3RhcnRzQXRSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICAgICAgLm1hcChyb3dSYW5nZSA9PiByb3dSYW5nZVswXSlcbiAgICAgIGZvciAoY29uc3Qgcm93IG9mIGZvbGRTdGFydFJvd3MucmV2ZXJzZSgpKSB7XG4gICAgICAgIGZuKHJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb2xkUmVjdXJzaXZlbHkoKSB7XG4gICAgdGhpcy5lYWNoRm9sZFN0YXJ0Um93KHJvdyA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxuXG4gIHVuZm9sZFJlY3Vyc2l2ZWx5KCkge1xuICAgIHRoaXMuZWFjaEZvbGRTdGFydFJvdyhyb3cgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHJvdylcbiAgICB9KVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gekNcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gek9cbmNsYXNzIFVuZm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnVuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgfVxufVxuVW5mb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gekFcbmNsYXNzIFRvZ2dsZUZvbGRSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHtcbiAgICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvbGRSZWN1cnNpdmVseSgpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVGb2xkUmVjdXJzaXZlbHkucmVnaXN0ZXIoKVxuXG4vLyB6UlxuY2xhc3MgVW5mb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG4gIH1cbn1cblVuZm9sZEFsbC5yZWdpc3RlcigpXG5cbi8vIHpNXG5jbGFzcyBGb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHthbGxGb2xkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCFhbGxGb2xkKSByZXR1cm5cblxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmIChpbmRlbnQgPD0gdGhpcy5nZXRDb25maWcoXCJtYXhGb2xkYWJsZUluZGVudExldmVsXCIpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICB9XG59XG5Gb2xkQWxsLnJlZ2lzdGVyKClcblxuLy8genJcbmNsYXNzIFVuZm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7Zm9sZGVkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCFmb2xkZWQpIHJldHVyblxuICAgIGNvbnN0IHttaW5JbmRlbnQsIHJvd1Jhbmdlc1dpdGhJbmRlbnR9ID0gZm9sZGVkXG4gICAgY29uc3QgY291bnQgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttaW46IDB9KVxuICAgIGNvbnN0IHRhcmdldEluZGVudHMgPSB0aGlzLnV0aWxzLmdldExpc3QobWluSW5kZW50LCBtaW5JbmRlbnQgKyBjb3VudClcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93fSBvZiByb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblVuZm9sZE5leHRJbmRlbnRMZXZlbC5yZWdpc3RlcigpXG5cbi8vIHptXG5jbGFzcyBGb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHt1bmZvbGRlZCwgYWxsRm9sZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghdW5mb2xkZWQpIHJldHVyblxuICAgIC8vIEZJWE1FOiBXaHkgSSBuZWVkIHVuZm9sZEFsbCgpPyBXaHkgY2FuJ3QgSSBqdXN0IGZvbGQgbm9uLWZvbGRlZC1mb2xkIG9ubHk/XG4gICAgLy8gVW5sZXNzIHVuZm9sZEFsbCgpIGhlcmUsIEBlZGl0b3IudW5mb2xkQWxsKCkgZGVsZXRlIGZvbGRNYXJrZXIgYnV0IGZhaWxcbiAgICAvLyB0byByZW5kZXIgdW5mb2xkZWQgcm93cyBjb3JyZWN0bHkuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgYnVnIG9mIHRleHQtYnVmZmVyJ3MgbWFya2VyTGF5ZXIgd2hpY2ggYXNzdW1lIGZvbGRzIGFyZVxuICAgIC8vIGNyZWF0ZWQgKippbi1vcmRlcioqIGZyb20gdG9wLXJvdyB0byBib3R0b20tcm93LlxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG5cbiAgICBjb25zdCBtYXhGb2xkYWJsZSA9IHRoaXMuZ2V0Q29uZmlnKFwibWF4Rm9sZGFibGVJbmRlbnRMZXZlbFwiKVxuICAgIGxldCBmcm9tTGV2ZWwgPSBNYXRoLm1pbih1bmZvbGRlZC5tYXhJbmRlbnQsIG1heEZvbGRhYmxlKVxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCkgLSAxLCB7bWluOiAwfSlcbiAgICBmcm9tTGV2ZWwgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKGZyb21MZXZlbCAtIGNvdW50LCB7bWluOiAwfSlcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KGZyb21MZXZlbCwgbWF4Rm9sZGFibGUpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmICh0YXJnZXRJbmRlbnRzLmluY2x1ZGVzKGluZGVudCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5Gb2xkTmV4dEluZGVudExldmVsLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVwbGFjZU1vZGVCYWNrc3BhY2UgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlXCJcblxuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgLy8gY2hhciBtaWdodCBiZSBlbXB0eS5cbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiAoY2hhciAhPSBudWxsKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgaWYgKCFzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KCkpIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuUmVwbGFjZU1vZGVCYWNrc3BhY2UucmVnaXN0ZXIoKVxuXG4vLyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgU2Nyb2xsRG93biBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IG9sZEZpcnN0Um93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICB0aGlzLmVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgKyBjb3VudClcbiAgICBjb25zdCBuZXdGaXJzdFJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBjb25zdCBvZmZzZXQgPSAyXG4gICAgY29uc3Qge3JvdywgY29sdW1ufSA9IHRoaXMuZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiAocm93IDwgbmV3Rmlyc3RSb3cgKyBvZmZzZXQpIHtcbiAgICAgIGNvbnN0IG5ld1BvaW50ID0gW3JvdyArIGNvdW50LCBjb2x1bW5dXG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG4gIH1cbn1cblNjcm9sbERvd24ucmVnaXN0ZXIoKVxuXG4vLyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIFNjcm9sbFVwIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgY29uc3Qgb2xkRmlyc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIHRoaXMuZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyAtIGNvdW50KVxuICAgIGNvbnN0IG5ld0xhc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBjb25zdCBvZmZzZXQgPSAyXG4gICAgY29uc3Qge3JvdywgY29sdW1ufSA9IHRoaXMuZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiAocm93ID49IG5ld0xhc3RSb3cgLSBvZmZzZXQpIHtcbiAgICAgIGNvbnN0IG5ld1BvaW50ID0gW3JvdyAtIGNvdW50LCBjb2x1bW5dXG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG4gIH1cbn1cblNjcm9sbFVwLnJlZ2lzdGVyKClcblxuLy8gQWRqdXN0IHNjcm9sbFRvcCB0byBjaGFuZ2Ugd2hlcmUgY3Vyb3MgaXMgc2hvd24gaW4gdmlld3BvcnQuXG4vLyArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbi8vIHwgd2hlcmUgIHwgbW92ZSB0byAxc3QgY2hhciB8IG5vIG1vdmUgfFxuLy8gKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4vLyB8IHRvcCAgICB8IGB6IGVudGVyYCAgICAgICAgfCBgeiB0YCAgIHxcbi8vIHwgbWlkZGxlIHwgYHogLmAgICAgICAgICAgICB8IGB6IHpgICAgfFxuLy8gfCBib3R0b20gfCBgeiAtYCAgICAgICAgICAgIHwgYHogYmAgICB8XG4vLyArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSBmYWxzZVxuICB3aGVyZSA9IG51bGxcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AodGhpcy5nZXRTY3JvbGxUb3AoKSlcbiAgICBpZiAodGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkgdGhpcy5lZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wKCkge1xuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGNvbnN0IHt0b3B9ID0gdGhpcy5lZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcbiAgICBzd2l0Y2ggKHRoaXMud2hlcmUpIHtcbiAgICAgIGNhc2UgXCJ0b3BcIjpcbiAgICAgICAgdGhpcy5yZWNvbW1lbmRUb0VuYWJsZVNjcm9sbFBhc3RFbmRJZk5lY2Vzc2FyeSgpXG4gICAgICAgIHJldHVybiB0b3AgLSB0aGlzLmdldE9mZlNldFBpeGVsSGVpZ2h0KClcbiAgICAgIGNhc2UgXCJtaWRkbGVcIjpcbiAgICAgICAgcmV0dXJuIHRvcCAtIHRoaXMuZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDJcbiAgICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgICAgcmV0dXJuIHRvcCAtICh0aGlzLmVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSB0aGlzLmdldE9mZlNldFBpeGVsSGVpZ2h0KDEpKVxuICAgIH1cbiAgfVxuXG4gIGdldE9mZlNldFBpeGVsSGVpZ2h0KGxpbmVEZWx0YSA9IDApIHtcbiAgICBjb25zdCBzY3JvbGxvZmYgPSAyIC8vIGF0b20gZGVmYXVsdC4gQmV0dGVyIHRvIHVzZSBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKT9cbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoc2Nyb2xsb2ZmICsgbGluZURlbHRhKVxuICB9XG5cbiAgcmVjb21tZW5kVG9FbmFibGVTY3JvbGxQYXN0RW5kSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgPT09IHRoaXMuZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKSAmJiAhdGhpcy5lZGl0b3IuZ2V0U2Nyb2xsUGFzdEVuZCgpKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gW1xuICAgICAgICBcInZpbS1tb2RlLXBsdXNcIixcbiAgICAgICAgXCItIEZvciBgeiB0YCBhbmQgYHogZW50ZXJgIHdvcmtzIHByb3Blcmx5IGluIGV2ZXJ5IHNpdHVhdGlvbiwgYGVkaXRvci5zY3JvbGxQYXN0RW5kYCBzZXR0aW5nIG5lZWQgdG8gYmUgYHRydWVgLlwiLFxuICAgICAgICAnLSBZb3UgY2FuIGVuYWJsZSBpdCBmcm9tIGBcIlNldHRpbmdzXCIgPiBcIkVkaXRvclwiID4gXCJTY3JvbGwgUGFzdCBFbmRcImAuJyxcbiAgICAgICAgXCItIE9yICoqZG8geW91IGFsbG93IHZtcCBlbmFibGUgaXQgZm9yIHlvdSBub3c/KipcIixcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgICBjb25zdCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLCB7XG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJObyB0aGFua3MuXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBub3RpZmljYXRpb24uZGlzbWlzcygpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJPSy4gRW5hYmxlIGl0IG5vdyEhXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChgZWRpdG9yLnNjcm9sbFBhc3RFbmRgLCB0cnVlKVxuICAgICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsQ3Vyc29yLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyB0b3A6IHogZW50ZXJcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgd2hlcmUgPSBcInRvcFwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuU2Nyb2xsQ3Vyc29yVG9Ub3AucmVnaXN0ZXIoKVxuXG4vLyB0b3A6IHp0XG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcExlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgd2hlcmUgPSBcInRvcFwiXG59XG5TY3JvbGxDdXJzb3JUb1RvcExlYXZlLnJlZ2lzdGVyKClcblxuLy8gbWlkZGxlOiB6LlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGUgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICB3aGVyZSA9IFwibWlkZGxlXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5TY3JvbGxDdXJzb3JUb01pZGRsZS5yZWdpc3RlcigpXG5cbi8vIG1pZGRsZTogenpcbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICB3aGVyZSA9IFwibWlkZGxlXCJcbn1cblNjcm9sbEN1cnNvclRvTWlkZGxlTGVhdmUucmVnaXN0ZXIoKVxuXG4vLyBib3R0b206IHotXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIHdoZXJlID0gXCJib3R0b21cIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cblNjcm9sbEN1cnNvclRvQm90dG9tLnJlZ2lzdGVyKClcblxuLy8gYm90dG9tOiB6YlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIHdoZXJlID0gXCJib3R0b21cIlxufVxuU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZS5yZWdpc3RlcigpXG5cbi8vIEhvcml6b250YWwgU2Nyb2xsIHdpdGhvdXQgY2hhbmdpbmcgY3Vyc29yIHBvc2l0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB6c1xuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9MZWZ0IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICB3aGljaCA9IFwibGVmdFwiXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgdHJhbnNsYXRpb24gPSB0aGlzLndoaWNoID09PSBcImxlZnRcIiA/IFswLCAwXSA6IFswLCAxXVxuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgY29uc3QgcGl4ZWwgPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKVxuICAgIGlmICh0aGlzLndoaWNoID09PSBcImxlZnRcIikge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQocGl4ZWwubGVmdClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KHBpeGVsLmxlZnQpXG4gICAgICB0aGlzLmVkaXRvci5jb21wb25lbnQudXBkYXRlU3luYygpIC8vIEZJWE1FOiBUaGlzIGlzIG5lY2Vzc2FyeSBtYXliZSBiZWNhdXNlIG9mIGJ1ZyBvZiBhdG9tLWNvcmUuXG4gICAgfVxuICB9XG59XG5TY3JvbGxDdXJzb3JUb0xlZnQucmVnaXN0ZXIoKVxuXG4vLyB6ZVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9SaWdodCBleHRlbmRzIFNjcm9sbEN1cnNvclRvTGVmdCB7XG4gIHdoaWNoID0gXCJyaWdodFwiXG59XG5TY3JvbGxDdXJzb3JUb1JpZ2h0LnJlZ2lzdGVyKClcblxuLy8gaW5zZXJ0LW1vZGUgc3BlY2lmaWMgY29tbWFuZHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydE1vZGUgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7fVxuSW5zZXJ0TW9kZS5jb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZVwiXG5cbmNsYXNzIEFjdGl2YXRlTm9ybWFsTW9kZU9uY2UgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkuZmlsdGVyKGN1cnNvciA9PiAhY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSlcbiAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKFwibm9ybWFsXCIpXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgY3Vyc29yc1RvTW92ZVJpZ2h0KSB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgfVxuXG4gICAgbGV0IGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSkgcmV0dXJuXG5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlID0gbnVsbFxuICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShcImluc2VydFwiKVxuICAgIH0pXG4gIH1cbn1cbkFjdGl2YXRlTm9ybWFsTW9kZU9uY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRSZWdpc3RlciBleHRlbmRzIEluc2VydE1vZGUge1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWFkQ2hhcigpXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCh0aGlzLmlucHV0LCBzZWxlY3Rpb24pXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuSW5zZXJ0UmVnaXN0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRMYXN0SW5zZXJ0ZWQgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB0ZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KFwiLlwiKVxuICAgIHRoaXMuZWRpdG9yLmluc2VydFRleHQodGV4dClcbiAgfVxufVxuSW5zZXJ0TGFzdEluc2VydGVkLnJlZ2lzdGVyKClcblxuY2xhc3MgQ29weUZyb21MaW5lQWJvdmUgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgcm93RGVsdGEgPSAtMVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgdHJhbnNsYXRpb24gPSBbdGhpcy5yb3dEZWx0YSwgMF1cbiAgICB0aGlzLmVkaXRvci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICBmb3IgKGxldCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbilcbiAgICAgICAgaWYgKHBvaW50LnJvdyA8IDApIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3QgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgaWYgKHRleHQpIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuQ29weUZyb21MaW5lQWJvdmUucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVCZWxvdyBleHRlbmRzIENvcHlGcm9tTGluZUFib3ZlIHtcbiAgcm93RGVsdGEgPSArMVxufVxuQ29weUZyb21MaW5lQmVsb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBOZXh0VGFiIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBkZWZhdWx0Q291bnQgPSAwXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcilcblxuICAgIGlmIChjb3VudCkgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KGNvdW50IC0gMSlcbiAgICBlbHNlIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG4gIH1cbn1cbk5leHRUYWIucmVnaXN0ZXIoKVxuXG5jbGFzcyBQcmV2aW91c1RhYiBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLmVkaXRvcikuYWN0aXZhdGVQcmV2aW91c0l0ZW0oKVxuICB9XG59XG5QcmV2aW91c1RhYi5yZWdpc3RlcigpXG4iXX0=