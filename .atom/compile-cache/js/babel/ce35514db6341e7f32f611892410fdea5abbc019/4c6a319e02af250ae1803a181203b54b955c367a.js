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
      _get(Object.getPrototypeOf(Mark.prototype), "initialize", this).call(this);
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
      for (var point of this.getCursorBufferPositions()) {
        this.editor.foldBufferRow(point.row);
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
      for (var point of this.getCursorBufferPositions()) {
        this.editor.unfoldBufferRow(point.row);
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
      for (var point of this.getCursorBufferPositions()) {
        this.editor.toggleFoldAtBufferRow(point.row);
      }
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
      _get(Object.getPrototypeOf(InsertRegister.prototype), "initialize", this).call(this);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7ZUFFSyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLFlBQUwsS0FBSzs7QUFDWixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7O2VBQVgsV0FBVzs7V0FDUSxjQUFjOzs7O1NBRGpDLFdBQVc7R0FBUyxJQUFJOztBQUc5QixXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBOztJQUVyQixJQUFJO1lBQUosSUFBSTs7V0FBSixJQUFJOzBCQUFKLElBQUk7OytCQUFKLElBQUk7O1NBQ1IsWUFBWSxHQUFHLElBQUk7OztlQURmLElBQUk7O1dBRUUsc0JBQUc7QUFDWCxVQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDZixpQ0FKRSxJQUFJLDRDQUlZO0tBQ25COzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO0FBQ3pFLFVBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDNUI7OztTQVZHLElBQUk7R0FBUyxXQUFXOztBQVk5QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRVQsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBQ2QsbUJBQUc7QUFDUixVQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFN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QixDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUV0QixPQUFPO1lBQVAsT0FBTzs7V0FBUCxPQUFPOzBCQUFQLE9BQU87OytCQUFQLE9BQU87O1NBQ1gsWUFBWSxHQUFHLENBQUM7OztlQURaLE9BQU87O1dBR0osbUJBQUc7QUFDUixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDN0IsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBOztBQUVwRCxVQUFJLEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFBLEtBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0tBQzdCOzs7U0FURyxPQUFPO0dBQVMsV0FBVzs7QUFXakMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFBOztJQUVaLFdBQVc7WUFBWCxXQUFXOztXQUFYLFdBQVc7MEJBQVgsV0FBVzs7K0JBQVgsV0FBVzs7O2VBQVgsV0FBVzs7V0FDUixtQkFBRztBQUNSLFVBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO0tBQy9EOzs7U0FIRyxXQUFXO0dBQVMsV0FBVzs7QUFLckMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21pc2MtY29tbWFuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5jb25zdCBCYXNlID0gcmVxdWlyZShcIi4vYmFzZVwiKVxuXG5jbGFzcyBNaXNjQ29tbWFuZCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwibWlzYy1jb21tYW5kXCJcbn1cbk1pc2NDb21tYW5kLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNYXJrIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWFkQ2hhcigpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQodGhpcy5pbnB1dCwgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB0aGlzLmFjdGl2YXRlTW9kZShcIm5vcm1hbFwiKVxuICB9XG59XG5NYXJrLnJlZ2lzdGVyKClcblxuY2xhc3MgUmV2ZXJzZVNlbGVjdGlvbnMgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5zd3JhcC5zZXRSZXZlcnNlZFN0YXRlKHRoaXMuZWRpdG9yLCAhdGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKSlcbiAgICBpZiAodGhpcy5pc01vZGUoXCJ2aXN1YWxcIiwgXCJibG9ja3dpc2VcIikpIHtcbiAgICAgIHRoaXMuZ2V0TGFzdEJsb2Nrd2lzZVNlbGVjdGlvbigpLmF1dG9zY3JvbGwoKVxuICAgIH1cbiAgfVxufVxuUmV2ZXJzZVNlbGVjdGlvbnMucmVnaXN0ZXIoKVxuXG5jbGFzcyBCbG9ja3dpc2VPdGhlckVuZCBleHRlbmRzIFJldmVyc2VTZWxlY3Rpb25zIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgYmxvY2t3aXNlU2VsZWN0aW9uLnJldmVyc2UoKVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuQmxvY2t3aXNlT3RoZXJFbmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBVbmRvIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBzZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSkge1xuICAgIGNvbnN0IGxhc3RDdXJzb3IgPSB0aGlzLmVkaXRvci5nZXRMYXN0Q3Vyc29yKCkgLy8gVGhpcyBpcyByZXN0b3JlZCBjdXJzb3JcblxuICAgIGNvbnN0IGNoYW5nZWRSYW5nZSA9XG4gICAgICBzdHJhdGVneSA9PT0gXCJzbWFydFwiXG4gICAgICAgID8gdGhpcy51dGlscy5maW5kUmFuZ2VDb250YWluc1BvaW50KG5ld1JhbmdlcywgbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgICA6IHRoaXMudXRpbHMuc29ydFJhbmdlcyhuZXdSYW5nZXMuY29uY2F0KG9sZFJhbmdlcykpWzBdXG5cbiAgICBpZiAoY2hhbmdlZFJhbmdlKSB7XG4gICAgICBpZiAodGhpcy51dGlscy5pc0xpbmV3aXNlUmFuZ2UoY2hhbmdlZFJhbmdlKSkgdGhpcy51dGlscy5zZXRCdWZmZXJSb3cobGFzdEN1cnNvciwgY2hhbmdlZFJhbmdlLnN0YXJ0LnJvdylcbiAgICAgIGVsc2UgbGFzdEN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjaGFuZ2VkUmFuZ2Uuc3RhcnQpXG4gICAgfVxuICB9XG5cbiAgbXV0YXRlV2l0aFRyYWNrQ2hhbmdlcygpIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIGNvbnN0IG9sZFJhbmdlcyA9IFtdXG5cbiAgICAvLyBDb2xsZWN0IGNoYW5nZWQgcmFuZ2Ugd2hpbGUgbXV0YXRpbmcgdGV4dC1zdGF0ZSBieSBmbiBjYWxsYmFjay5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRDaGFuZ2UoKHtuZXdSYW5nZSwgb2xkUmFuZ2V9KSA9PiB7XG4gICAgICBpZiAobmV3UmFuZ2UuaXNFbXB0eSgpKSB7XG4gICAgICAgIG9sZFJhbmdlcy5wdXNoKG9sZFJhbmdlKSAvLyBSZW1vdmUgb25seVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3UmFuZ2VzLnB1c2gobmV3UmFuZ2UpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMubXV0YXRlKClcbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgIHJldHVybiB7bmV3UmFuZ2VzLCBvbGRSYW5nZXN9XG4gIH1cblxuICBmbGFzaENoYW5nZXMoe25ld1Jhbmdlcywgb2xkUmFuZ2VzfSkge1xuICAgIGNvbnN0IGlzTXVsdGlwbGVTaW5nbGVMaW5lUmFuZ2VzID0gcmFuZ2VzID0+IHJhbmdlcy5sZW5ndGggPiAxICYmIHJhbmdlcy5ldmVyeSh0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVJhbmdlKVxuXG4gICAgaWYgKG5ld1Jhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAodGhpcy5pc011bHRpcGxlQW5kQWxsUmFuZ2VIYXZlU2FtZUNvbHVtbkFuZENvbnNlY3V0aXZlUm93cyhuZXdSYW5nZXMpKSByZXR1cm5cblxuICAgICAgbmV3UmFuZ2VzID0gbmV3UmFuZ2VzLm1hcChyYW5nZSA9PiB0aGlzLnV0aWxzLmh1bWFuaXplQnVmZmVyUmFuZ2UodGhpcy5lZGl0b3IsIHJhbmdlKSlcbiAgICAgIG5ld1JhbmdlcyA9IHRoaXMuZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShuZXdSYW5nZXMpXG5cbiAgICAgIGNvbnN0IHR5cGUgPSBpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhuZXdSYW5nZXMpID8gXCJ1bmRvLXJlZG8tbXVsdGlwbGUtY2hhbmdlc1wiIDogXCJ1bmRvLXJlZG9cIlxuICAgICAgdGhpcy5mbGFzaChuZXdSYW5nZXMsIHt0eXBlfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZUFuZEFsbFJhbmdlSGF2ZVNhbWVDb2x1bW5BbmRDb25zZWN1dGl2ZVJvd3Mob2xkUmFuZ2VzKSkgcmV0dXJuXG5cbiAgICAgIGlmIChpc011bHRpcGxlU2luZ2xlTGluZVJhbmdlcyhvbGRSYW5nZXMpKSB7XG4gICAgICAgIG9sZFJhbmdlcyA9IHRoaXMuZmlsdGVyTm9uTGVhZGluZ1doaXRlU3BhY2VSYW5nZShvbGRSYW5nZXMpXG4gICAgICAgIHRoaXMuZmxhc2gob2xkUmFuZ2VzLCB7dHlwZTogXCJ1bmRvLXJlZG8tbXVsdGlwbGUtZGVsZXRlXCJ9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbHRlck5vbkxlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UocmFuZ2VzKSB7XG4gICAgcmV0dXJuIHJhbmdlcy5maWx0ZXIocmFuZ2UgPT4gIXRoaXMudXRpbHMuaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKHRoaXMuZWRpdG9yLCByYW5nZSkpXG4gIH1cblxuICAvLyBbVE9ET10gSW1wcm92ZSBmdXJ0aGVyIGJ5IGNoZWNraW5nIG9sZFRleHQsIG5ld1RleHQ/XG4gIC8vIFtQdXJwb3NlIG9mIHRoaXMgZnVuY3Rpb25dXG4gIC8vIFN1cHByZXNzIGZsYXNoIHdoZW4gdW5kby9yZWRvaW5nIHRvZ2dsZS1jb21tZW50IHdoaWxlIGZsYXNoaW5nIHVuZG8vcmVkbyBvZiBvY2N1cnJlbmNlIG9wZXJhdGlvbi5cbiAgLy8gVGhpcyBodXJpc3RpYyBhcHByb2FjaCBuZXZlciBiZSBwZXJmZWN0LlxuICAvLyBVbHRpbWF0ZWx5IGNhbm5ub3QgZGlzdGluZ3Vpc2ggb2NjdXJyZW5jZSBvcGVyYXRpb24uXG4gIGlzTXVsdGlwbGVBbmRBbGxSYW5nZUhhdmVTYW1lQ29sdW1uQW5kQ29uc2VjdXRpdmVSb3dzKHJhbmdlcykge1xuICAgIGlmIChyYW5nZXMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHtzdGFydDoge2NvbHVtbjogc3RhcnRDb2x1bW59LCBlbmQ6IHtjb2x1bW46IGVuZENvbHVtbn19ID0gcmFuZ2VzWzBdXG4gICAgbGV0IHByZXZpb3VzUm93XG5cbiAgICBmb3IgKGNvbnN0IHJhbmdlIG9mIHJhbmdlcykge1xuICAgICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICAgIGlmIChzdGFydC5jb2x1bW4gIT09IHN0YXJ0Q29sdW1uIHx8IGVuZC5jb2x1bW4gIT09IGVuZENvbHVtbikgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAocHJldmlvdXNSb3cgIT0gbnVsbCAmJiBwcmV2aW91c1JvdyArIDEgIT09IHN0YXJ0LnJvdykgcmV0dXJuIGZhbHNlXG4gICAgICBwcmV2aW91c1JvdyA9IHN0YXJ0LnJvd1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZmxhc2gocmFuZ2VzLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMudGltZW91dCA9PSBudWxsKSBvcHRpb25zLnRpbWVvdXQgPSA1MDBcbiAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCBvcHRpb25zKSlcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3Qge25ld1Jhbmdlcywgb2xkUmFuZ2VzfSA9IHRoaXMubXV0YXRlV2l0aFRyYWNrQ2hhbmdlcygpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5jbGVhcigpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwic2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkb1wiKSkge1xuICAgICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmdldENvbmZpZyhcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG9TdHJhdGVneVwiKVxuICAgICAgdGhpcy5zZXRDdXJzb3JQb3NpdGlvbih7bmV3UmFuZ2VzLCBvbGRSYW5nZXMsIHN0cmF0ZWd5fSlcbiAgICAgIHRoaXMudmltU3RhdGUuY2xlYXJTZWxlY3Rpb25zKClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uVW5kb1JlZG9cIikpIHRoaXMuZmxhc2hDaGFuZ2VzKHtuZXdSYW5nZXMsIG9sZFJhbmdlc30pXG4gICAgdGhpcy5hY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcbiAgfVxuXG4gIG11dGF0ZSgpIHtcbiAgICB0aGlzLmVkaXRvci51bmRvKClcbiAgfVxufVxuVW5kby5yZWdpc3RlcigpXG5cbmNsYXNzIFJlZG8gZXh0ZW5kcyBVbmRvIHtcbiAgbXV0YXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnJlZG8oKVxuICB9XG59XG5SZWRvLnJlZ2lzdGVyKClcblxuLy8gemNcbmNsYXNzIEZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5Gb2xkQ3VycmVudFJvdy5yZWdpc3RlcigpXG5cbi8vIHpvXG5jbGFzcyBVbmZvbGRDdXJyZW50Um93IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgdGhpcy5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKSkge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICB9XG4gIH1cbn1cblVuZm9sZEN1cnJlbnRSb3cucmVnaXN0ZXIoKVxuXG4vLyB6YVxuY2xhc3MgVG9nZ2xlRm9sZCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnRvZ2dsZUZvbGRBdEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVGb2xkLnJlZ2lzdGVyKClcblxuLy8gQmFzZSBvZiB6Qywgek8sIHpBXG5jbGFzcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZWFjaEZvbGRTdGFydFJvdyhmbikge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpLnJldmVyc2UoKSkge1xuICAgICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIGlmICghdGhpcy5lZGl0b3IuaXNGb2xkYWJsZUF0QnVmZmVyUm93KHJvdykpIGNvbnRpbnVlXG5cbiAgICAgIGNvbnN0IGZvbGRTdGFydFJvd3MgPSB0aGlzLnV0aWxzXG4gICAgICAgIC5nZXRGb2xkUm93UmFuZ2VzQ29udGFpbmVkQnlGb2xkU3RhcnRzQXRSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICAgICAgLm1hcChyb3dSYW5nZSA9PiByb3dSYW5nZVswXSlcbiAgICAgIGZvciAoY29uc3Qgcm93IG9mIGZvbGRTdGFydFJvd3MucmV2ZXJzZSgpKSB7XG4gICAgICAgIGZuKHJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb2xkUmVjdXJzaXZlbHkoKSB7XG4gICAgdGhpcy5lYWNoRm9sZFN0YXJ0Um93KHJvdyA9PiB7XG4gICAgICBpZiAoIXRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgfSlcbiAgfVxuXG4gIHVuZm9sZFJlY3Vyc2l2ZWx5KCkge1xuICAgIHRoaXMuZWFjaEZvbGRTdGFydFJvdyhyb3cgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHJvdylcbiAgICB9KVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZS5yZWdpc3RlcihmYWxzZSlcblxuLy8gekNcbmNsYXNzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHkgZXh0ZW5kcyBGb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5QmFzZSB7XG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5mb2xkUmVjdXJzaXZlbHkoKVxuICB9XG59XG5Gb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gek9cbmNsYXNzIFVuZm9sZEN1cnJlbnRSb3dSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnVuZm9sZFJlY3Vyc2l2ZWx5KClcbiAgfVxufVxuVW5mb2xkQ3VycmVudFJvd1JlY3Vyc2l2ZWx5LnJlZ2lzdGVyKClcblxuLy8gekFcbmNsYXNzIFRvZ2dsZUZvbGRSZWN1cnNpdmVseSBleHRlbmRzIEZvbGRDdXJyZW50Um93UmVjdXJzaXZlbHlCYXNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7cm93fSA9IHRoaXMuZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24odGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGlmICh0aGlzLmVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvdykpIHtcbiAgICAgIHRoaXMudW5mb2xkUmVjdXJzaXZlbHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvbGRSZWN1cnNpdmVseSgpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVGb2xkUmVjdXJzaXZlbHkucmVnaXN0ZXIoKVxuXG4vLyB6UlxuY2xhc3MgVW5mb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG4gIH1cbn1cblVuZm9sZEFsbC5yZWdpc3RlcigpXG5cbi8vIHpNXG5jbGFzcyBGb2xkQWxsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHthbGxGb2xkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCFhbGxGb2xkKSByZXR1cm5cblxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmIChpbmRlbnQgPD0gdGhpcy5nZXRDb25maWcoXCJtYXhGb2xkYWJsZUluZGVudExldmVsXCIpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmZvbGRCdWZmZXJSb3dSYW5nZShzdGFydFJvdywgZW5kUm93KVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKHtjZW50ZXI6IHRydWV9KVxuICB9XG59XG5Gb2xkQWxsLnJlZ2lzdGVyKClcblxuLy8genJcbmNsYXNzIFVuZm9sZE5leHRJbmRlbnRMZXZlbCBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB7Zm9sZGVkfSA9IHRoaXMudXRpbHMuZ2V0Rm9sZEluZm9CeUtpbmQodGhpcy5lZGl0b3IpXG4gICAgaWYgKCFmb2xkZWQpIHJldHVyblxuICAgIGNvbnN0IHttaW5JbmRlbnQsIHJvd1Jhbmdlc1dpdGhJbmRlbnR9ID0gZm9sZGVkXG4gICAgY29uc3QgY291bnQgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoKSAtIDEsIHttaW46IDB9KVxuICAgIGNvbnN0IHRhcmdldEluZGVudHMgPSB0aGlzLnV0aWxzLmdldExpc3QobWluSW5kZW50LCBtaW5JbmRlbnQgKyBjb3VudClcbiAgICBmb3IgKGNvbnN0IHtpbmRlbnQsIHN0YXJ0Um93fSBvZiByb3dSYW5nZXNXaXRoSW5kZW50KSB7XG4gICAgICBpZiAodGFyZ2V0SW5kZW50cy5pbmNsdWRlcyhpbmRlbnQpKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhzdGFydFJvdylcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblVuZm9sZE5leHRJbmRlbnRMZXZlbC5yZWdpc3RlcigpXG5cbi8vIHptXG5jbGFzcyBGb2xkTmV4dEluZGVudExldmVsIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHt1bmZvbGRlZCwgYWxsRm9sZH0gPSB0aGlzLnV0aWxzLmdldEZvbGRJbmZvQnlLaW5kKHRoaXMuZWRpdG9yKVxuICAgIGlmICghdW5mb2xkZWQpIHJldHVyblxuICAgIC8vIEZJWE1FOiBXaHkgSSBuZWVkIHVuZm9sZEFsbCgpPyBXaHkgY2FuJ3QgSSBqdXN0IGZvbGQgbm9uLWZvbGRlZC1mb2xkIG9ubHk/XG4gICAgLy8gVW5sZXNzIHVuZm9sZEFsbCgpIGhlcmUsIEBlZGl0b3IudW5mb2xkQWxsKCkgZGVsZXRlIGZvbGRNYXJrZXIgYnV0IGZhaWxcbiAgICAvLyB0byByZW5kZXIgdW5mb2xkZWQgcm93cyBjb3JyZWN0bHkuXG4gICAgLy8gSSBiZWxpZXZlIHRoaXMgaXMgYnVnIG9mIHRleHQtYnVmZmVyJ3MgbWFya2VyTGF5ZXIgd2hpY2ggYXNzdW1lIGZvbGRzIGFyZVxuICAgIC8vIGNyZWF0ZWQgKippbi1vcmRlcioqIGZyb20gdG9wLXJvdyB0byBib3R0b20tcm93LlxuICAgIHRoaXMuZWRpdG9yLnVuZm9sZEFsbCgpXG5cbiAgICBjb25zdCBtYXhGb2xkYWJsZSA9IHRoaXMuZ2V0Q29uZmlnKFwibWF4Rm9sZGFibGVJbmRlbnRMZXZlbFwiKVxuICAgIGxldCBmcm9tTGV2ZWwgPSBNYXRoLm1pbih1bmZvbGRlZC5tYXhJbmRlbnQsIG1heEZvbGRhYmxlKVxuICAgIGNvbnN0IGNvdW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCkgLSAxLCB7bWluOiAwfSlcbiAgICBmcm9tTGV2ZWwgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKGZyb21MZXZlbCAtIGNvdW50LCB7bWluOiAwfSlcbiAgICBjb25zdCB0YXJnZXRJbmRlbnRzID0gdGhpcy51dGlscy5nZXRMaXN0KGZyb21MZXZlbCwgbWF4Rm9sZGFibGUpXG4gICAgZm9yIChjb25zdCB7aW5kZW50LCBzdGFydFJvdywgZW5kUm93fSBvZiBhbGxGb2xkLnJvd1Jhbmdlc1dpdGhJbmRlbnQpIHtcbiAgICAgIGlmICh0YXJnZXRJbmRlbnRzLmluY2x1ZGVzKGluZGVudCkpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZm9sZEJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5Gb2xkTmV4dEluZGVudExldmVsLnJlZ2lzdGVyKClcblxuY2xhc3MgUmVwbGFjZU1vZGVCYWNrc3BhY2UgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZS5yZXBsYWNlXCJcblxuICBleGVjdXRlKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgLy8gY2hhciBtaWdodCBiZSBlbXB0eS5cbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmdldFJlcGxhY2VkQ2hhckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBpZiAoY2hhciAhPSBudWxsKSB7XG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcbiAgICAgICAgaWYgKCFzZWxlY3Rpb24uaW5zZXJ0VGV4dChjaGFyKS5pc0VtcHR5KCkpIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuUmVwbGFjZU1vZGVCYWNrc3BhY2UucmVnaXN0ZXIoKVxuXG4vLyBjdHJsLWUgc2Nyb2xsIGxpbmVzIGRvd253YXJkc1xuY2xhc3MgU2Nyb2xsRG93biBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjb3VudCA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGNvbnN0IG9sZEZpcnN0Um93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICB0aGlzLmVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgKyBjb3VudClcbiAgICBjb25zdCBuZXdGaXJzdFJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBjb25zdCBvZmZzZXQgPSAyXG4gICAgY29uc3Qge3JvdywgY29sdW1ufSA9IHRoaXMuZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiAocm93IDwgbmV3Rmlyc3RSb3cgKyBvZmZzZXQpIHtcbiAgICAgIGNvbnN0IG5ld1BvaW50ID0gW3JvdyArIGNvdW50LCBjb2x1bW5dXG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG4gIH1cbn1cblNjcm9sbERvd24ucmVnaXN0ZXIoKVxuXG4vLyBjdHJsLXkgc2Nyb2xsIGxpbmVzIHVwd2FyZHNcbmNsYXNzIFNjcm9sbFVwIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgY29uc3Qgb2xkRmlyc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIHRoaXMuZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhvbGRGaXJzdFJvdyAtIGNvdW50KVxuICAgIGNvbnN0IG5ld0xhc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBjb25zdCBvZmZzZXQgPSAyXG4gICAgY29uc3Qge3JvdywgY29sdW1ufSA9IHRoaXMuZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcbiAgICBpZiAocm93ID49IG5ld0xhc3RSb3cgLSBvZmZzZXQpIHtcbiAgICAgIGNvbnN0IG5ld1BvaW50ID0gW3JvdyAtIGNvdW50LCBjb2x1bW5dXG4gICAgICB0aGlzLmVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihuZXdQb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcbiAgICB9XG4gIH1cbn1cblNjcm9sbFVwLnJlZ2lzdGVyKClcblxuLy8gQWRqdXN0IHNjcm9sbFRvcCB0byBjaGFuZ2Ugd2hlcmUgY3Vyb3MgaXMgc2hvd24gaW4gdmlld3BvcnQuXG4vLyArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbi8vIHwgd2hlcmUgIHwgbW92ZSB0byAxc3QgY2hhciB8IG5vIG1vdmUgfFxuLy8gKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4vLyB8IHRvcCAgICB8IGB6IGVudGVyYCAgICAgICAgfCBgeiB0YCAgIHxcbi8vIHwgbWlkZGxlIHwgYHogLmAgICAgICAgICAgICB8IGB6IHpgICAgfFxuLy8gfCBib3R0b20gfCBgeiAtYCAgICAgICAgICAgIHwgYHogYmAgICB8XG4vLyArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIE1pc2NDb21tYW5kIHtcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSBmYWxzZVxuICB3aGVyZSA9IG51bGxcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AodGhpcy5nZXRTY3JvbGxUb3AoKSlcbiAgICBpZiAodGhpcy5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkgdGhpcy5lZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICB9XG5cbiAgZ2V0U2Nyb2xsVG9wKCkge1xuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIGNvbnN0IHt0b3B9ID0gdGhpcy5lZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcbiAgICBzd2l0Y2ggKHRoaXMud2hlcmUpIHtcbiAgICAgIGNhc2UgXCJ0b3BcIjpcbiAgICAgICAgdGhpcy5yZWNvbW1lbmRUb0VuYWJsZVNjcm9sbFBhc3RFbmRJZk5lY2Vzc2FyeSgpXG4gICAgICAgIHJldHVybiB0b3AgLSB0aGlzLmdldE9mZlNldFBpeGVsSGVpZ2h0KClcbiAgICAgIGNhc2UgXCJtaWRkbGVcIjpcbiAgICAgICAgcmV0dXJuIHRvcCAtIHRoaXMuZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAvIDJcbiAgICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgICAgcmV0dXJuIHRvcCAtICh0aGlzLmVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSB0aGlzLmdldE9mZlNldFBpeGVsSGVpZ2h0KDEpKVxuICAgIH1cbiAgfVxuXG4gIGdldE9mZlNldFBpeGVsSGVpZ2h0KGxpbmVEZWx0YSA9IDApIHtcbiAgICBjb25zdCBzY3JvbGxvZmYgPSAyIC8vIGF0b20gZGVmYXVsdC4gQmV0dGVyIHRvIHVzZSBlZGl0b3IuZ2V0VmVydGljYWxTY3JvbGxNYXJnaW4oKT9cbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoc2Nyb2xsb2ZmICsgbGluZURlbHRhKVxuICB9XG5cbiAgcmVjb21tZW5kVG9FbmFibGVTY3JvbGxQYXN0RW5kSWZOZWNlc3NhcnkoKSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkgPT09IHRoaXMuZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKSAmJiAhdGhpcy5lZGl0b3IuZ2V0U2Nyb2xsUGFzdEVuZCgpKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gW1xuICAgICAgICBcInZpbS1tb2RlLXBsdXNcIixcbiAgICAgICAgXCItIEZvciBgeiB0YCBhbmQgYHogZW50ZXJgIHdvcmtzIHByb3Blcmx5IGluIGV2ZXJ5IHNpdHVhdGlvbiwgYGVkaXRvci5zY3JvbGxQYXN0RW5kYCBzZXR0aW5nIG5lZWQgdG8gYmUgYHRydWVgLlwiLFxuICAgICAgICAnLSBZb3UgY2FuIGVuYWJsZSBpdCBmcm9tIGBcIlNldHRpbmdzXCIgPiBcIkVkaXRvclwiID4gXCJTY3JvbGwgUGFzdCBFbmRcImAuJyxcbiAgICAgICAgXCItIE9yICoqZG8geW91IGFsbG93IHZtcCBlbmFibGUgaXQgZm9yIHlvdSBub3c/KipcIixcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgICBjb25zdCBub3RpZmljYXRpb24gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLCB7XG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJObyB0aGFua3MuXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiBub3RpZmljYXRpb24uZGlzbWlzcygpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogXCJPSy4gRW5hYmxlIGl0IG5vdyEhXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChgZWRpdG9yLnNjcm9sbFBhc3RFbmRgLCB0cnVlKVxuICAgICAgICAgICAgICBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsQ3Vyc29yLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyB0b3A6IHogZW50ZXJcbmNsYXNzIFNjcm9sbEN1cnNvclRvVG9wIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgd2hlcmUgPSBcInRvcFwiXG4gIG1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lID0gdHJ1ZVxufVxuU2Nyb2xsQ3Vyc29yVG9Ub3AucmVnaXN0ZXIoKVxuXG4vLyB0b3A6IHp0XG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcExlYXZlIGV4dGVuZHMgU2Nyb2xsQ3Vyc29yIHtcbiAgd2hlcmUgPSBcInRvcFwiXG59XG5TY3JvbGxDdXJzb3JUb1RvcExlYXZlLnJlZ2lzdGVyKClcblxuLy8gbWlkZGxlOiB6LlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9NaWRkbGUgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICB3aGVyZSA9IFwibWlkZGxlXCJcbiAgbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgPSB0cnVlXG59XG5TY3JvbGxDdXJzb3JUb01pZGRsZS5yZWdpc3RlcigpXG5cbi8vIG1pZGRsZTogenpcbmNsYXNzIFNjcm9sbEN1cnNvclRvTWlkZGxlTGVhdmUgZXh0ZW5kcyBTY3JvbGxDdXJzb3Ige1xuICB3aGVyZSA9IFwibWlkZGxlXCJcbn1cblNjcm9sbEN1cnNvclRvTWlkZGxlTGVhdmUucmVnaXN0ZXIoKVxuXG4vLyBib3R0b206IHotXG5jbGFzcyBTY3JvbGxDdXJzb3JUb0JvdHRvbSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIHdoZXJlID0gXCJib3R0b21cIlxuICBtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSA9IHRydWVcbn1cblNjcm9sbEN1cnNvclRvQm90dG9tLnJlZ2lzdGVyKClcblxuLy8gYm90dG9tOiB6YlxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZSBleHRlbmRzIFNjcm9sbEN1cnNvciB7XG4gIHdoZXJlID0gXCJib3R0b21cIlxufVxuU2Nyb2xsQ3Vyc29yVG9Cb3R0b21MZWF2ZS5yZWdpc3RlcigpXG5cbi8vIEhvcml6b250YWwgU2Nyb2xsIHdpdGhvdXQgY2hhbmdpbmcgY3Vyc29yIHBvc2l0aW9uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB6c1xuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9MZWZ0IGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICB3aGljaCA9IFwibGVmdFwiXG4gIGV4ZWN1dGUoKSB7XG4gICAgY29uc3QgdHJhbnNsYXRpb24gPSB0aGlzLndoaWNoID09PSBcImxlZnRcIiA/IFswLCAwXSA6IFswLCAxXVxuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKS50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gICAgY29uc3QgcGl4ZWwgPSB0aGlzLmVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKVxuICAgIGlmICh0aGlzLndoaWNoID09PSBcImxlZnRcIikge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQocGl4ZWwubGVmdClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KHBpeGVsLmxlZnQpXG4gICAgICB0aGlzLmVkaXRvci5jb21wb25lbnQudXBkYXRlU3luYygpIC8vIEZJWE1FOiBUaGlzIGlzIG5lY2Vzc2FyeSBtYXliZSBiZWNhdXNlIG9mIGJ1ZyBvZiBhdG9tLWNvcmUuXG4gICAgfVxuICB9XG59XG5TY3JvbGxDdXJzb3JUb0xlZnQucmVnaXN0ZXIoKVxuXG4vLyB6ZVxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9SaWdodCBleHRlbmRzIFNjcm9sbEN1cnNvclRvTGVmdCB7XG4gIHdoaWNoID0gXCJyaWdodFwiXG59XG5TY3JvbGxDdXJzb3JUb1JpZ2h0LnJlZ2lzdGVyKClcblxuLy8gaW5zZXJ0LW1vZGUgc3BlY2lmaWMgY29tbWFuZHNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluc2VydE1vZGUgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7fVxuSW5zZXJ0TW9kZS5jb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZVwiXG5cbmNsYXNzIEFjdGl2YXRlTm9ybWFsTW9kZU9uY2UgZXh0ZW5kcyBJbnNlcnRNb2RlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCBjdXJzb3JzVG9Nb3ZlUmlnaHQgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkuZmlsdGVyKGN1cnNvciA9PiAhY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSlcbiAgICB0aGlzLnZpbVN0YXRlLmFjdGl2YXRlKFwibm9ybWFsXCIpXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgY3Vyc29yc1RvTW92ZVJpZ2h0KSB7XG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgfVxuXG4gICAgbGV0IGRpc3Bvc2FibGUgPSBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IHRoaXMuZ2V0Q29tbWFuZE5hbWUoKSkgcmV0dXJuXG5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICBkaXNwb3NhYmxlID0gbnVsbFxuICAgICAgdGhpcy52aW1TdGF0ZS5hY3RpdmF0ZShcImluc2VydFwiKVxuICAgIH0pXG4gIH1cbn1cbkFjdGl2YXRlTm9ybWFsTW9kZU9uY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBJbnNlcnRSZWdpc3RlciBleHRlbmRzIEluc2VydE1vZGUge1xuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5yZWFkQ2hhcigpXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMuZWRpdG9yLnRyYW5zYWN0KCgpID0+IHtcbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KHRoaXMuaW5wdXQsIHNlbGVjdGlvbilcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5JbnNlcnRSZWdpc3Rlci5yZWdpc3RlcigpXG5cbmNsYXNzIEluc2VydExhc3RJbnNlcnRlZCBleHRlbmRzIEluc2VydE1vZGUge1xuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IHRleHQgPSB0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoXCIuXCIpXG4gICAgdGhpcy5lZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KVxuICB9XG59XG5JbnNlcnRMYXN0SW5zZXJ0ZWQucmVnaXN0ZXIoKVxuXG5jbGFzcyBDb3B5RnJvbUxpbmVBYm92ZSBleHRlbmRzIEluc2VydE1vZGUge1xuICByb3dEZWx0YSA9IC0xXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IFt0aGlzLnJvd0RlbHRhLCAwXVxuICAgIHRoaXMuZWRpdG9yLnRyYW5zYWN0KCgpID0+IHtcbiAgICAgIGZvciAobGV0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICAgICAgICBpZiAocG9pbnQucm93IDwgMCkgY29udGludWVcblxuICAgICAgICBjb25zdCByYW5nZSA9IFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMSlcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBpZiAodGV4dCkgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dClcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5Db3B5RnJvbUxpbmVBYm92ZS5yZWdpc3RlcigpXG5cbmNsYXNzIENvcHlGcm9tTGluZUJlbG93IGV4dGVuZHMgQ29weUZyb21MaW5lQWJvdmUge1xuICByb3dEZWx0YSA9ICsxXG59XG5Db3B5RnJvbUxpbmVCZWxvdy5yZWdpc3RlcigpXG5cbmNsYXNzIE5leHRUYWIgZXh0ZW5kcyBNaXNjQ29tbWFuZCB7XG4gIGRlZmF1bHRDb3VudCA9IDBcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMuZWRpdG9yKVxuXG4gICAgaWYgKGNvdW50KSBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXgoY291bnQgLSAxKVxuICAgIGVsc2UgcGFuZS5hY3RpdmF0ZU5leHRJdGVtKClcbiAgfVxufVxuTmV4dFRhYi5yZWdpc3RlcigpXG5cbmNsYXNzIFByZXZpb3VzVGFiIGV4dGVuZHMgTWlzY0NvbW1hbmQge1xuICBleGVjdXRlKCkge1xuICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKHRoaXMuZWRpdG9yKS5hY3RpdmF0ZVByZXZpb3VzSXRlbSgpXG4gIH1cbn1cblByZXZpb3VzVGFiLnJlZ2lzdGVyKClcbiJdfQ==