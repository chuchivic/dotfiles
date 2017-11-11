"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");

var _require = require("atom");

var Point = _require.Point;
var Range = _require.Range;

var Base = require("./base");

var Motion = (function (_Base) {
  _inherits(Motion, _Base);

  function Motion() {
    _classCallCheck(this, Motion);

    _get(Object.getPrototypeOf(Motion.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.wise = "characterwise";
    this.jump = false;
    this.verticalMotion = false;
    this.moveSucceeded = null;
    this.moveSuccessOnLinewise = false;
    this.selectSucceeded = false;
  }

  _createClass(Motion, [{
    key: "isLinewise",
    value: function isLinewise() {
      return this.wise === "linewise";
    }
  }, {
    key: "isBlockwise",
    value: function isBlockwise() {
      return this.wise === "blockwise";
    }
  }, {
    key: "forceWise",
    value: function forceWise(wise) {
      if (wise === "characterwise") {
        this.inclusive = this.wise === "linewise" ? false : !this.inclusive;
      }
      this.wise = wise;
    }
  }, {
    key: "resetState",
    value: function resetState() {
      this.selectSucceeded = false;
    }
  }, {
    key: "setBufferPositionSafely",
    value: function setBufferPositionSafely(cursor, point) {
      if (point) cursor.setBufferPosition(point);
    }
  }, {
    key: "setScreenPositionSafely",
    value: function setScreenPositionSafely(cursor, point) {
      if (point) cursor.setScreenPosition(point);
    }
  }, {
    key: "moveWithSaveJump",
    value: function moveWithSaveJump(cursor) {
      var originalPosition = this.jump && cursor.isLastCursor() ? cursor.getBufferPosition() : undefined;

      this.moveCursor(cursor);

      if (originalPosition && !cursor.getBufferPosition().isEqual(originalPosition)) {
        this.vimState.mark.set("`", originalPosition);
        this.vimState.mark.set("'", originalPosition);
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      if (this.operator) {
        this.select();
      } else {
        for (var cursor of this.editor.getCursors()) {
          this.moveWithSaveJump(cursor);
        }
      }
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
    }

    // NOTE: selection is already "normalized" before this function is called.
  }, {
    key: "select",
    value: function select() {
      var _this = this;

      // need to care was visual for `.` repeated.
      var isOrWasVisual = this.operator["instanceof"]("SelectBase") || this.is("CurrentSelection");

      var _loop = function (selection) {
        selection.modifySelection(function () {
          return _this.moveWithSaveJump(selection.cursor);
        });

        var selectSucceeded = _this.moveSucceeded != null ? _this.moveSucceeded : !selection.isEmpty() || _this.isLinewise() && _this.moveSuccessOnLinewise;
        if (!_this.selectSucceeded) _this.selectSucceeded = selectSucceeded;

        if (isOrWasVisual || selectSucceeded && (_this.inclusive || _this.isLinewise())) {
          var $selection = _this.swrap(selection);
          $selection.saveProperties(true); // save property of "already-normalized-selection"
          $selection.applyWise(_this.wise);
        }
      };

      for (var selection of this.editor.getSelections()) {
        _loop(selection);
      }

      if (this.wise === "blockwise") {
        this.vimState.getLastBlockwiseSelection().autoscroll();
      }
    }
  }, {
    key: "setCursorBufferRow",
    value: function setCursorBufferRow(cursor, row, options) {
      if (this.verticalMotion && !this.getConfig("stayOnVerticalMotion")) {
        cursor.setBufferPosition(this.getFirstCharacterPositionForBufferRow(row), options);
      } else {
        this.utils.setBufferRow(cursor, row, options);
      }
    }

    // [NOTE]
    // Since this function checks cursor position change, a cursor position MUST be
    // updated IN callback(=fn)
    // Updating point only in callback is wrong-use of this funciton,
    // since it stops immediately because of not cursor position change.
  }, {
    key: "moveCursorCountTimes",
    value: function moveCursorCountTimes(cursor, fn) {
      var oldPosition = cursor.getBufferPosition();
      this.countTimes(this.getCount(), function (state) {
        fn(state);
        var newPosition = cursor.getBufferPosition();
        if (newPosition.isEqual(oldPosition)) state.stop();
        oldPosition = newPosition;
      });
    }
  }, {
    key: "isCaseSensitive",
    value: function isCaseSensitive(term) {
      return this.getConfig("useSmartcaseFor" + this.caseSensitivityKind) ? term.search(/[A-Z]/) !== -1 : !this.getConfig("ignoreCaseFor" + this.caseSensitivityKind);
    }
  }], [{
    key: "operationKind",
    value: "motion",
    enumerable: true
  }]);

  return Motion;
})(Base);

Motion.register(false);

// Used as operator's target in visual-mode.

var CurrentSelection = (function (_Motion) {
  _inherits(CurrentSelection, _Motion);

  function CurrentSelection() {
    _classCallCheck(this, CurrentSelection);

    _get(Object.getPrototypeOf(CurrentSelection.prototype), "constructor", this).apply(this, arguments);

    this.selectionExtent = null;
    this.blockwiseSelectionExtent = null;
    this.inclusive = true;
    this.pointInfoByCursor = new Map();
  }

  _createClass(CurrentSelection, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      if (this.mode === "visual") {
        this.selectionExtent = this.isBlockwise() ? this.swrap(cursor.selection).getBlockwiseSelectionExtent() : this.editor.getSelectedBufferRange().getExtent();
      } else {
        // `.` repeat case
        cursor.setBufferPosition(cursor.getBufferPosition().translate(this.selectionExtent));
      }
    }
  }, {
    key: "select",
    value: function select() {
      var _this2 = this;

      if (this.mode === "visual") {
        _get(Object.getPrototypeOf(CurrentSelection.prototype), "select", this).call(this);
      } else {
        for (var cursor of this.editor.getCursors()) {
          var pointInfo = this.pointInfoByCursor.get(cursor);
          if (pointInfo) {
            var _cursorPosition = pointInfo.cursorPosition;
            var startOfSelection = pointInfo.startOfSelection;

            if (_cursorPosition.isEqual(cursor.getBufferPosition())) {
              cursor.setBufferPosition(startOfSelection);
            }
          }
        }
        _get(Object.getPrototypeOf(CurrentSelection.prototype), "select", this).call(this);
      }

      // * Purpose of pointInfoByCursor? see #235 for detail.
      // When stayOnTransformString is enabled, cursor pos is not set on start of
      // of selected range.
      // But I want following behavior, so need to preserve position info.
      //  1. `vj>.` -> indent same two rows regardless of current cursor's row.
      //  2. `vj>j.` -> indent two rows from cursor's row.

      var _loop2 = function (cursor) {
        var startOfSelection = cursor.selection.getBufferRange().start;
        _this2.onDidFinishOperation(function () {
          cursorPosition = cursor.getBufferPosition();
          _this2.pointInfoByCursor.set(cursor, { startOfSelection: startOfSelection, cursorPosition: cursorPosition });
        });
      };

      for (var cursor of this.editor.getCursors()) {
        _loop2(cursor);
      }
    }
  }]);

  return CurrentSelection;
})(Motion);

CurrentSelection.register(false);

var MoveLeft = (function (_Motion2) {
  _inherits(MoveLeft, _Motion2);

  function MoveLeft() {
    _classCallCheck(this, MoveLeft);

    _get(Object.getPrototypeOf(MoveLeft.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveLeft, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this3 = this;

      var allowWrap = this.getConfig("wrapLeftRightMotion");
      this.moveCursorCountTimes(cursor, function () {
        return _this3.utils.moveCursorLeft(cursor, { allowWrap: allowWrap });
      });
    }
  }]);

  return MoveLeft;
})(Motion);

MoveLeft.register();

var MoveRight = (function (_Motion3) {
  _inherits(MoveRight, _Motion3);

  function MoveRight() {
    _classCallCheck(this, MoveRight);

    _get(Object.getPrototypeOf(MoveRight.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveRight, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this4 = this;

      var allowWrap = this.getConfig("wrapLeftRightMotion");

      this.moveCursorCountTimes(cursor, function () {
        _this4.editor.unfoldBufferRow(cursor.getBufferRow());

        // - When `wrapLeftRightMotion` enabled and executed as pure-motion in `normal-mode`,
        //   we need to move **again** to wrap to next-line if it rached to EOL.
        // - Expression `!this.operator` means normal-mode motion.
        // - Expression `this.mode === "normal"` is not appropreate since it matches `x` operator's target case.
        var needMoveAgain = allowWrap && !_this4.operator && !cursor.isAtEndOfLine();

        _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });

        if (needMoveAgain && cursor.isAtEndOfLine()) {
          _this4.utils.moveCursorRight(cursor, { allowWrap: allowWrap });
        }
      });
    }
  }]);

  return MoveRight;
})(Motion);

MoveRight.register();

var MoveRightBufferColumn = (function (_Motion4) {
  _inherits(MoveRightBufferColumn, _Motion4);

  function MoveRightBufferColumn() {
    _classCallCheck(this, MoveRightBufferColumn);

    _get(Object.getPrototypeOf(MoveRightBufferColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveRightBufferColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, cursor.getBufferColumn() + this.getCount());
    }
  }]);

  return MoveRightBufferColumn;
})(Motion);

MoveRightBufferColumn.register(false);

var MoveUp = (function (_Motion5) {
  _inherits(MoveUp, _Motion5);

  function MoveUp() {
    _classCallCheck(this, MoveUp);

    _get(Object.getPrototypeOf(MoveUp.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.wrap = false;
  }

  _createClass(MoveUp, [{
    key: "getBufferRow",
    value: function getBufferRow(row) {
      var min = 0;
      row = this.wrap && row === min ? this.getVimLastBufferRow() : this.utils.limitNumber(row - 1, { min: min });
      return this.getFoldStartRowForRow(row);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this5 = this;

      this.moveCursorCountTimes(cursor, function () {
        return _this5.utils.setBufferRow(cursor, _this5.getBufferRow(cursor.getBufferRow()));
      });
    }
  }]);

  return MoveUp;
})(Motion);

MoveUp.register();

var MoveUpWrap = (function (_MoveUp) {
  _inherits(MoveUpWrap, _MoveUp);

  function MoveUpWrap() {
    _classCallCheck(this, MoveUpWrap);

    _get(Object.getPrototypeOf(MoveUpWrap.prototype), "constructor", this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveUpWrap;
})(MoveUp);

MoveUpWrap.register();

var MoveDown = (function (_MoveUp2) {
  _inherits(MoveDown, _MoveUp2);

  function MoveDown() {
    _classCallCheck(this, MoveDown);

    _get(Object.getPrototypeOf(MoveDown.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.wrap = false;
  }

  _createClass(MoveDown, [{
    key: "getBufferRow",
    value: function getBufferRow(row) {
      if (this.editor.isFoldedAtBufferRow(row)) {
        row = this.utils.getLargestFoldRangeContainsBufferRow(this.editor, row).end.row;
      }
      var max = this.getVimLastBufferRow();
      return this.wrap && row >= max ? 0 : this.utils.limitNumber(row + 1, { max: max });
    }
  }]);

  return MoveDown;
})(MoveUp);

MoveDown.register();

var MoveDownWrap = (function (_MoveDown) {
  _inherits(MoveDownWrap, _MoveDown);

  function MoveDownWrap() {
    _classCallCheck(this, MoveDownWrap);

    _get(Object.getPrototypeOf(MoveDownWrap.prototype), "constructor", this).apply(this, arguments);

    this.wrap = true;
  }

  return MoveDownWrap;
})(MoveDown);

MoveDownWrap.register();

var MoveUpScreen = (function (_Motion6) {
  _inherits(MoveUpScreen, _Motion6);

  function MoveUpScreen() {
    _classCallCheck(this, MoveUpScreen);

    _get(Object.getPrototypeOf(MoveUpScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.direction = "up";
  }

  _createClass(MoveUpScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this6 = this;

      this.moveCursorCountTimes(cursor, function () {
        return _this6.utils.moveCursorUpScreen(cursor);
      });
    }
  }]);

  return MoveUpScreen;
})(Motion);

MoveUpScreen.register();

var MoveDownScreen = (function (_MoveUpScreen) {
  _inherits(MoveDownScreen, _MoveUpScreen);

  function MoveDownScreen() {
    _classCallCheck(this, MoveDownScreen);

    _get(Object.getPrototypeOf(MoveDownScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.direction = "down";
  }

  _createClass(MoveDownScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this7 = this;

      this.moveCursorCountTimes(cursor, function () {
        return _this7.utils.moveCursorDownScreen(cursor);
      });
    }
  }]);

  return MoveDownScreen;
})(MoveUpScreen);

MoveDownScreen.register();

// Move down/up to Edge
// -------------------------
// See t9md/atom-vim-mode-plus#236
// At least v1.7.0. bufferPosition and screenPosition cannot convert accurately
// when row is folded.

var MoveUpToEdge = (function (_Motion7) {
  _inherits(MoveUpToEdge, _Motion7);

  function MoveUpToEdge() {
    _classCallCheck(this, MoveUpToEdge);

    _get(Object.getPrototypeOf(MoveUpToEdge.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.direction = "up";
  }

  _createClass(MoveUpToEdge, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this8 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this8.setScreenPositionSafely(cursor, _this8.getPoint(cursor.getScreenPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var column = fromPoint.column;

      for (var row of this.getScanRows(fromPoint)) {
        var point = new Point(row, column);
        if (this.isEdge(point)) return point;
      }
    }
  }, {
    key: "getScanRows",
    value: function getScanRows(_ref) {
      var row = _ref.row;

      return this.direction === "up" ? this.utils.getList(this.utils.getValidVimScreenRow(this.editor, row - 1), 0, true) : this.utils.getList(this.utils.getValidVimScreenRow(this.editor, row + 1), this.getVimLastScreenRow(), true);
    }
  }, {
    key: "isEdge",
    value: function isEdge(point) {
      if (this.isStoppablePoint(point)) {
        // If one of above/below point was not stoppable, it's Edge!
        var above = point.translate([-1, 0]);
        var below = point.translate([+1, 0]);
        return !this.isStoppablePoint(above) || !this.isStoppablePoint(below);
      } else {
        return false;
      }
    }
  }, {
    key: "isStoppablePoint",
    value: function isStoppablePoint(point) {
      if (this.isNonWhiteSpacePoint(point) || this.isFirstRowOrLastRowAndStoppable(point)) {
        return true;
      } else {
        var leftPoint = point.translate([0, -1]);
        var rightPoint = point.translate([0, +1]);
        return this.isNonWhiteSpacePoint(leftPoint) && this.isNonWhiteSpacePoint(rightPoint);
      }
    }
  }, {
    key: "isNonWhiteSpacePoint",
    value: function isNonWhiteSpacePoint(point) {
      var char = this.utils.getTextInScreenRange(this.editor, Range.fromPointWithDelta(point, 0, 1));
      return char != null && /\S/.test(char);
    }
  }, {
    key: "isFirstRowOrLastRowAndStoppable",
    value: function isFirstRowOrLastRowAndStoppable(point) {
      // In normal-mode we adjust cursor by moving-left if cursor at EOL of non-blank row.
      // So explicitly guard to not answer it stoppable.
      if (this.isMode("normal") && this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point)) {
        return false;
      } else {
        return point.isEqual(this.editor.clipScreenPosition(point)) && (point.row === 0 || point.row === this.getVimLastScreenRow());
      }
    }
  }]);

  return MoveUpToEdge;
})(Motion);

MoveUpToEdge.register();

var MoveDownToEdge = (function (_MoveUpToEdge) {
  _inherits(MoveDownToEdge, _MoveUpToEdge);

  function MoveDownToEdge() {
    _classCallCheck(this, MoveDownToEdge);

    _get(Object.getPrototypeOf(MoveDownToEdge.prototype), "constructor", this).apply(this, arguments);

    this.direction = "down";
  }

  return MoveDownToEdge;
})(MoveUpToEdge);

MoveDownToEdge.register();

// word
// -------------------------

var MoveToNextWord = (function (_Motion8) {
  _inherits(MoveToNextWord, _Motion8);

  function MoveToNextWord() {
    _classCallCheck(this, MoveToNextWord);

    _get(Object.getPrototypeOf(MoveToNextWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
  }

  _createClass(MoveToNextWord, [{
    key: "getPoint",
    value: function getPoint(regex, from) {
      var wordRange = undefined;
      var found = false;

      this.scanForward(regex, { from: from }, function (_ref2) {
        var range = _ref2.range;
        var matchText = _ref2.matchText;
        var stop = _ref2.stop;

        wordRange = range;
        // Ignore 'empty line' matches between '\r' and '\n'
        if (matchText === "" && range.start.column !== 0) return;
        if (range.start.isGreaterThan(from)) {
          found = true;
          stop();
        }
      });

      if (found) {
        var point = wordRange.start;
        return this.utils.pointIsAtEndOfLineAtNonEmptyRow(this.editor, point) && !point.isEqual(this.getVimEofBufferPosition()) ? point.traverse([1, 0]) : point;
      } else {
        return wordRange ? wordRange.end : from;
      }
    }

    // Special case: "cw" and "cW" are treated like "ce" and "cE" if the cursor is
    // on a non-blank.  This is because "cw" is interpreted as change-word, and a
    // word does not include the following white space.  {Vi: "cw" when on a blank
    // followed by other blanks changes only the first blank; this is probably a
    // bug, because "dw" deletes all the blanks}
    //
    // Another special case: When using the "w" motion in combination with an
    // operator and the last word moved over is at the end of a line, the end of
    // that word becomes the end of the operated text, not the first word in the
    // next line.
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this9 = this;

      var cursorPosition = cursor.getBufferPosition();
      if (this.utils.pointIsAtVimEndOfFile(this.editor, cursorPosition)) return;

      var wasOnWhiteSpace = this.utils.pointIsOnWhiteSpace(this.editor, cursorPosition);
      var isAsTargetExceptSelectInVisualMode = this.isAsTargetExceptSelectInVisualMode();

      this.moveCursorCountTimes(cursor, function (_ref3) {
        var isFinal = _ref3.isFinal;

        var cursorPosition = cursor.getBufferPosition();
        if (_this9.utils.isEmptyRow(_this9.editor, cursorPosition.row) && isAsTargetExceptSelectInVisualMode) {
          cursor.setBufferPosition(cursorPosition.traverse([1, 0]));
        } else {
          var regex = _this9.wordRegex || cursor.wordRegExp();
          var point = _this9.getPoint(regex, cursorPosition);
          if (isFinal && isAsTargetExceptSelectInVisualMode) {
            if (_this9.operator.is("Change") && !wasOnWhiteSpace) {
              point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: _this9.wordRegex });
            } else {
              point = Point.min(point, _this9.utils.getEndOfLineForBufferRow(_this9.editor, cursorPosition.row));
            }
          }
          cursor.setBufferPosition(point);
        }
      });
    }
  }]);

  return MoveToNextWord;
})(Motion);

MoveToNextWord.register();

// b

var MoveToPreviousWord = (function (_Motion9) {
  _inherits(MoveToPreviousWord, _Motion9);

  function MoveToPreviousWord() {
    _classCallCheck(this, MoveToPreviousWord);

    _get(Object.getPrototypeOf(MoveToPreviousWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
  }

  _createClass(MoveToPreviousWord, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this10 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBeginningOfCurrentWordBufferPosition({ wordRegex: _this10.wordRegex });
        cursor.setBufferPosition(point);
      });
    }
  }]);

  return MoveToPreviousWord;
})(Motion);

MoveToPreviousWord.register();

var MoveToEndOfWord = (function (_Motion10) {
  _inherits(MoveToEndOfWord, _Motion10);

  function MoveToEndOfWord() {
    _classCallCheck(this, MoveToEndOfWord);

    _get(Object.getPrototypeOf(MoveToEndOfWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = null;
    this.inclusive = true;
  }

  _createClass(MoveToEndOfWord, [{
    key: "moveToNextEndOfWord",
    value: function moveToNextEndOfWord(cursor) {
      this.utils.moveCursorToNextNonWhitespace(cursor);
      var point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.wordRegex }).translate([0, -1]);
      cursor.setBufferPosition(Point.min(point, this.getVimEofBufferPosition()));
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this11 = this;

      this.moveCursorCountTimes(cursor, function () {
        var originalPoint = cursor.getBufferPosition();
        _this11.moveToNextEndOfWord(cursor);
        if (originalPoint.isEqual(cursor.getBufferPosition())) {
          // Retry from right column if cursor was already on EndOfWord
          cursor.moveRight();
          _this11.moveToNextEndOfWord(cursor);
        }
      });
    }
  }]);

  return MoveToEndOfWord;
})(Motion);

MoveToEndOfWord.register();

// [TODO: Improve, accuracy]

var MoveToPreviousEndOfWord = (function (_MoveToPreviousWord) {
  _inherits(MoveToPreviousEndOfWord, _MoveToPreviousWord);

  function MoveToPreviousEndOfWord() {
    _classCallCheck(this, MoveToPreviousEndOfWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWord.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
  }

  _createClass(MoveToPreviousEndOfWord, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var wordRange = cursor.getCurrentWordBufferRange();
      var cursorPosition = cursor.getBufferPosition();

      // if we're in the middle of a word then we need to move to its start
      var times = this.getCount();
      if (cursorPosition.isGreaterThan(wordRange.start) && cursorPosition.isLessThan(wordRange.end)) {
        times += 1;
      }

      for (var i in this.utils.getList(1, times)) {
        var point = cursor.getBeginningOfCurrentWordBufferPosition({ wordRegex: this.wordRegex });
        cursor.setBufferPosition(point);
      }

      this.moveToNextEndOfWord(cursor);
      if (cursor.getBufferPosition().isGreaterThanOrEqual(cursorPosition)) {
        cursor.setBufferPosition([0, 0]);
      }
    }
  }, {
    key: "moveToNextEndOfWord",
    value: function moveToNextEndOfWord(cursor) {
      var point = cursor.getEndOfCurrentWordBufferPosition({ wordRegex: this.wordRegex }).translate([0, -1]);
      cursor.setBufferPosition(Point.min(point, this.getVimEofBufferPosition()));
    }
  }]);

  return MoveToPreviousEndOfWord;
})(MoveToPreviousWord);

MoveToPreviousEndOfWord.register();

// Whole word
// -------------------------

var MoveToNextWholeWord = (function (_MoveToNextWord) {
  _inherits(MoveToNextWholeWord, _MoveToNextWord);

  function MoveToNextWholeWord() {
    _classCallCheck(this, MoveToNextWholeWord);

    _get(Object.getPrototypeOf(MoveToNextWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  return MoveToNextWholeWord;
})(MoveToNextWord);

MoveToNextWholeWord.register();

var MoveToPreviousWholeWord = (function (_MoveToPreviousWord2) {
  _inherits(MoveToPreviousWholeWord, _MoveToPreviousWord2);

  function MoveToPreviousWholeWord() {
    _classCallCheck(this, MoveToPreviousWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /^$|\S+/g;
  }

  return MoveToPreviousWholeWord;
})(MoveToPreviousWord);

MoveToPreviousWholeWord.register();

var MoveToEndOfWholeWord = (function (_MoveToEndOfWord) {
  _inherits(MoveToEndOfWholeWord, _MoveToEndOfWord);

  function MoveToEndOfWholeWord() {
    _classCallCheck(this, MoveToEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToEndOfWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  return MoveToEndOfWholeWord;
})(MoveToEndOfWord);

MoveToEndOfWholeWord.register();

// [TODO: Improve, accuracy]

var MoveToPreviousEndOfWholeWord = (function (_MoveToPreviousEndOfWord) {
  _inherits(MoveToPreviousEndOfWholeWord, _MoveToPreviousEndOfWord);

  function MoveToPreviousEndOfWholeWord() {
    _classCallCheck(this, MoveToPreviousEndOfWholeWord);

    _get(Object.getPrototypeOf(MoveToPreviousEndOfWholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  return MoveToPreviousEndOfWholeWord;
})(MoveToPreviousEndOfWord);

MoveToPreviousEndOfWholeWord.register();

// Alphanumeric word [Experimental]
// -------------------------

var MoveToNextAlphanumericWord = (function (_MoveToNextWord2) {
  _inherits(MoveToNextAlphanumericWord, _MoveToNextWord2);

  function MoveToNextAlphanumericWord() {
    _classCallCheck(this, MoveToNextAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToNextAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/g;
  }

  return MoveToNextAlphanumericWord;
})(MoveToNextWord);

MoveToNextAlphanumericWord.register();

var MoveToPreviousAlphanumericWord = (function (_MoveToPreviousWord3) {
  _inherits(MoveToPreviousAlphanumericWord, _MoveToPreviousWord3);

  function MoveToPreviousAlphanumericWord() {
    _classCallCheck(this, MoveToPreviousAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToPreviousAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  return MoveToPreviousAlphanumericWord;
})(MoveToPreviousWord);

MoveToPreviousAlphanumericWord.register();

var MoveToEndOfAlphanumericWord = (function (_MoveToEndOfWord2) {
  _inherits(MoveToEndOfAlphanumericWord, _MoveToEndOfWord2);

  function MoveToEndOfAlphanumericWord() {
    _classCallCheck(this, MoveToEndOfAlphanumericWord);

    _get(Object.getPrototypeOf(MoveToEndOfAlphanumericWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\w+/;
  }

  return MoveToEndOfAlphanumericWord;
})(MoveToEndOfWord);

MoveToEndOfAlphanumericWord.register();

// Alphanumeric word [Experimental]
// -------------------------

var MoveToNextSmartWord = (function (_MoveToNextWord3) {
  _inherits(MoveToNextSmartWord, _MoveToNextWord3);

  function MoveToNextSmartWord() {
    _classCallCheck(this, MoveToNextSmartWord);

    _get(Object.getPrototypeOf(MoveToNextSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/g;
  }

  return MoveToNextSmartWord;
})(MoveToNextWord);

MoveToNextSmartWord.register();

var MoveToPreviousSmartWord = (function (_MoveToPreviousWord4) {
  _inherits(MoveToPreviousSmartWord, _MoveToPreviousWord4);

  function MoveToPreviousSmartWord() {
    _classCallCheck(this, MoveToPreviousSmartWord);

    _get(Object.getPrototypeOf(MoveToPreviousSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  return MoveToPreviousSmartWord;
})(MoveToPreviousWord);

MoveToPreviousSmartWord.register();

var MoveToEndOfSmartWord = (function (_MoveToEndOfWord3) {
  _inherits(MoveToEndOfSmartWord, _MoveToEndOfWord3);

  function MoveToEndOfSmartWord() {
    _classCallCheck(this, MoveToEndOfSmartWord);

    _get(Object.getPrototypeOf(MoveToEndOfSmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  return MoveToEndOfSmartWord;
})(MoveToEndOfWord);

MoveToEndOfSmartWord.register();

// Subword
// -------------------------

var MoveToNextSubword = (function (_MoveToNextWord4) {
  _inherits(MoveToNextSubword, _MoveToNextWord4);

  function MoveToNextSubword() {
    _classCallCheck(this, MoveToNextSubword);

    _get(Object.getPrototypeOf(MoveToNextSubword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToNextSubword, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      _get(Object.getPrototypeOf(MoveToNextSubword.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToNextSubword;
})(MoveToNextWord);

MoveToNextSubword.register();

var MoveToPreviousSubword = (function (_MoveToPreviousWord5) {
  _inherits(MoveToPreviousSubword, _MoveToPreviousWord5);

  function MoveToPreviousSubword() {
    _classCallCheck(this, MoveToPreviousSubword);

    _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToPreviousSubword, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      _get(Object.getPrototypeOf(MoveToPreviousSubword.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToPreviousSubword;
})(MoveToPreviousWord);

MoveToPreviousSubword.register();

var MoveToEndOfSubword = (function (_MoveToEndOfWord4) {
  _inherits(MoveToEndOfSubword, _MoveToEndOfWord4);

  function MoveToEndOfSubword() {
    _classCallCheck(this, MoveToEndOfSubword);

    _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToEndOfSubword, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.wordRegex = cursor.subwordRegExp();
      _get(Object.getPrototypeOf(MoveToEndOfSubword.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToEndOfSubword;
})(MoveToEndOfWord);

MoveToEndOfSubword.register();

// Sentence
// -------------------------
// Sentence is defined as below
//  - end with ['.', '!', '?']
//  - optionally followed by [')', ']', '"', "'"]
//  - followed by ['$', ' ', '\t']
//  - paragraph boundary is also sentence boundary
//  - section boundary is also sentence boundary(ignore)

var MoveToNextSentence = (function (_Motion11) {
  _inherits(MoveToNextSentence, _Motion11);

  function MoveToNextSentence() {
    _classCallCheck(this, MoveToNextSentence);

    _get(Object.getPrototypeOf(MoveToNextSentence.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.sentenceRegex = new RegExp("(?:[\\.!\\?][\\)\\]\"']*\\s+)|(\\n|\\r\\n)", "g");
    this.direction = "next";
  }

  _createClass(MoveToNextSentence, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this12 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this12.setBufferPositionSafely(cursor, _this12.getPoint(cursor.getBufferPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      return this.direction === "next" ? this.getNextStartOfSentence(fromPoint) : this.getPreviousStartOfSentence(fromPoint);
    }
  }, {
    key: "isBlankRow",
    value: function isBlankRow(row) {
      return this.editor.isBufferRowBlank(row);
    }
  }, {
    key: "getNextStartOfSentence",
    value: function getNextStartOfSentence(from) {
      var _this13 = this;

      var foundPoint = undefined;
      this.scanForward(this.sentenceRegex, { from: from }, function (_ref4) {
        var range = _ref4.range;
        var matchText = _ref4.matchText;
        var match = _ref4.match;
        var stop = _ref4.stop;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (_this13.skipBlankRow && _this13.isBlankRow(endRow)) return;
          if (_this13.isBlankRow(startRow) !== _this13.isBlankRow(endRow)) {
            foundPoint = _this13.getFirstCharacterPositionForBufferRow(endRow);
          }
        } else {
          foundPoint = range.end;
        }
        if (foundPoint) stop();
      });
      return foundPoint || this.getVimEofBufferPosition();
    }
  }, {
    key: "getPreviousStartOfSentence",
    value: function getPreviousStartOfSentence(from) {
      var _this14 = this;

      var foundPoint = undefined;
      this.scanBackward(this.sentenceRegex, { from: from }, function (_ref5) {
        var range = _ref5.range;
        var matchText = _ref5.matchText;
        var match = _ref5.match;
        var stop = _ref5.stop;

        if (match[1] != null) {
          var startRow = range.start.row;
          var endRow = range.end.row;

          if (!_this14.isBlankRow(endRow) && _this14.isBlankRow(startRow)) {
            var point = _this14.getFirstCharacterPositionForBufferRow(endRow);
            if (point.isLessThan(from)) {
              foundPoint = point;
            } else {
              if (_this14.skipBlankRow) return;
              foundPoint = _this14.getFirstCharacterPositionForBufferRow(startRow);
            }
          }
        } else {
          if (range.end.isLessThan(from)) foundPoint = range.end;
        }
        if (foundPoint) stop();
      });
      return foundPoint || [0, 0];
    }
  }]);

  return MoveToNextSentence;
})(Motion);

MoveToNextSentence.register();

var MoveToPreviousSentence = (function (_MoveToNextSentence) {
  _inherits(MoveToPreviousSentence, _MoveToNextSentence);

  function MoveToPreviousSentence() {
    _classCallCheck(this, MoveToPreviousSentence);

    _get(Object.getPrototypeOf(MoveToPreviousSentence.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  return MoveToPreviousSentence;
})(MoveToNextSentence);

MoveToPreviousSentence.register();

var MoveToNextSentenceSkipBlankRow = (function (_MoveToNextSentence2) {
  _inherits(MoveToNextSentenceSkipBlankRow, _MoveToNextSentence2);

  function MoveToNextSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToNextSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToNextSentenceSkipBlankRow.prototype), "constructor", this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToNextSentenceSkipBlankRow;
})(MoveToNextSentence);

MoveToNextSentenceSkipBlankRow.register();

var MoveToPreviousSentenceSkipBlankRow = (function (_MoveToPreviousSentence) {
  _inherits(MoveToPreviousSentenceSkipBlankRow, _MoveToPreviousSentence);

  function MoveToPreviousSentenceSkipBlankRow() {
    _classCallCheck(this, MoveToPreviousSentenceSkipBlankRow);

    _get(Object.getPrototypeOf(MoveToPreviousSentenceSkipBlankRow.prototype), "constructor", this).apply(this, arguments);

    this.skipBlankRow = true;
  }

  return MoveToPreviousSentenceSkipBlankRow;
})(MoveToPreviousSentence);

MoveToPreviousSentenceSkipBlankRow.register();

// Paragraph
// -------------------------

var MoveToNextParagraph = (function (_Motion12) {
  _inherits(MoveToNextParagraph, _Motion12);

  function MoveToNextParagraph() {
    _classCallCheck(this, MoveToNextParagraph);

    _get(Object.getPrototypeOf(MoveToNextParagraph.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.direction = "next";
  }

  _createClass(MoveToNextParagraph, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this15 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this15.setBufferPositionSafely(cursor, _this15.getPoint(cursor.getBufferPosition()));
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var startRow = fromPoint.row;
      var wasBlankRow = this.editor.isBufferRowBlank(startRow);
      for (var row of this.utils.getBufferRows(this.editor, { startRow: startRow, direction: this.direction })) {
        var isBlankRow = this.editor.isBufferRowBlank(row);
        if (!wasBlankRow && isBlankRow) {
          return new Point(row, 0);
        }
        wasBlankRow = isBlankRow;
      }

      // fallback
      return this.direction === "previous" ? new Point(0, 0) : this.getVimEofBufferPosition();
    }
  }]);

  return MoveToNextParagraph;
})(Motion);

MoveToNextParagraph.register();

var MoveToPreviousParagraph = (function (_MoveToNextParagraph) {
  _inherits(MoveToPreviousParagraph, _MoveToNextParagraph);

  function MoveToPreviousParagraph() {
    _classCallCheck(this, MoveToPreviousParagraph);

    _get(Object.getPrototypeOf(MoveToPreviousParagraph.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  return MoveToPreviousParagraph;
})(MoveToNextParagraph);

MoveToPreviousParagraph.register();

// -------------------------
// keymap: 0

var MoveToBeginningOfLine = (function (_Motion13) {
  _inherits(MoveToBeginningOfLine, _Motion13);

  function MoveToBeginningOfLine() {
    _classCallCheck(this, MoveToBeginningOfLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToBeginningOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, 0);
    }
  }]);

  return MoveToBeginningOfLine;
})(Motion);

MoveToBeginningOfLine.register();

var MoveToColumn = (function (_Motion14) {
  _inherits(MoveToColumn, _Motion14);

  function MoveToColumn() {
    _classCallCheck(this, MoveToColumn);

    _get(Object.getPrototypeOf(MoveToColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.utils.setBufferColumn(cursor, this.getCount(-1));
    }
  }]);

  return MoveToColumn;
})(Motion);

MoveToColumn.register();

var MoveToLastCharacterOfLine = (function (_Motion15) {
  _inherits(MoveToLastCharacterOfLine, _Motion15);

  function MoveToLastCharacterOfLine() {
    _classCallCheck(this, MoveToLastCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToLastCharacterOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var row = this.getValidVimBufferRow(cursor.getBufferRow() + this.getCount(-1));
      cursor.setBufferPosition([row, Infinity]);
      cursor.goalColumn = Infinity;
    }
  }]);

  return MoveToLastCharacterOfLine;
})(Motion);

MoveToLastCharacterOfLine.register();

var MoveToLastNonblankCharacterOfLineAndDown = (function (_Motion16) {
  _inherits(MoveToLastNonblankCharacterOfLineAndDown, _Motion16);

  function MoveToLastNonblankCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToLastNonblankCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToLastNonblankCharacterOfLineAndDown.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
  }

  _createClass(MoveToLastNonblankCharacterOfLineAndDown, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      cursor.setBufferPosition(this.getPoint(cursor.getBufferPosition()));
    }
  }, {
    key: "getPoint",
    value: function getPoint(_ref6) {
      var row = _ref6.row;

      row = this.utils.limitNumber(row + this.getCount(-1), { max: this.getVimLastBufferRow() });
      var range = this.utils.findRangeInBufferRow(this.editor, /\S|^/, row, { direction: "backward" });
      return range ? range.start : new Point(row, 0);
    }
  }]);

  return MoveToLastNonblankCharacterOfLineAndDown;
})(Motion);

MoveToLastNonblankCharacterOfLineAndDown.register();

// MoveToFirstCharacterOfLine faimily
// ------------------------------------
// ^

var MoveToFirstCharacterOfLine = (function (_Motion17) {
  _inherits(MoveToFirstCharacterOfLine, _Motion17);

  function MoveToFirstCharacterOfLine() {
    _classCallCheck(this, MoveToFirstCharacterOfLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.getFirstCharacterPositionForBufferRow(cursor.getBufferRow());
      this.setBufferPositionSafely(cursor, point);
    }
  }]);

  return MoveToFirstCharacterOfLine;
})(Motion);

MoveToFirstCharacterOfLine.register();

var MoveToFirstCharacterOfLineUp = (function (_MoveToFirstCharacterOfLine) {
  _inherits(MoveToFirstCharacterOfLineUp, _MoveToFirstCharacterOfLine);

  function MoveToFirstCharacterOfLineUp() {
    _classCallCheck(this, MoveToFirstCharacterOfLineUp);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(MoveToFirstCharacterOfLineUp, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this16 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this16.getValidVimBufferRow(cursor.getBufferRow() - 1);
        cursor.setBufferPosition([row, 0]);
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineUp.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineUp;
})(MoveToFirstCharacterOfLine);

MoveToFirstCharacterOfLineUp.register();

var MoveToFirstCharacterOfLineDown = (function (_MoveToFirstCharacterOfLine2) {
  _inherits(MoveToFirstCharacterOfLineDown, _MoveToFirstCharacterOfLine2);

  function MoveToFirstCharacterOfLineDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(MoveToFirstCharacterOfLineDown, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this17 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this17.getVimLastBufferRow()) {
          cursor.setBufferPosition(point.translate([+1, 0]));
        }
      });
      _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineDown.prototype), "moveCursor", this).call(this, cursor);
    }
  }]);

  return MoveToFirstCharacterOfLineDown;
})(MoveToFirstCharacterOfLine);

MoveToFirstCharacterOfLineDown.register();

var MoveToFirstCharacterOfLineAndDown = (function (_MoveToFirstCharacterOfLineDown) {
  _inherits(MoveToFirstCharacterOfLineAndDown, _MoveToFirstCharacterOfLineDown);

  function MoveToFirstCharacterOfLineAndDown() {
    _classCallCheck(this, MoveToFirstCharacterOfLineAndDown);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToFirstCharacterOfLineAndDown, [{
    key: "getCount",
    value: function getCount() {
      return _get(Object.getPrototypeOf(MoveToFirstCharacterOfLineAndDown.prototype), "getCount", this).call(this, -1);
    }
  }]);

  return MoveToFirstCharacterOfLineAndDown;
})(MoveToFirstCharacterOfLineDown);

MoveToFirstCharacterOfLineAndDown.register();

var MoveToScreenColumn = (function (_Motion18) {
  _inherits(MoveToScreenColumn, _Motion18);

  function MoveToScreenColumn() {
    _classCallCheck(this, MoveToScreenColumn);

    _get(Object.getPrototypeOf(MoveToScreenColumn.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToScreenColumn, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var allowOffScreenPosition = this.getConfig("allowMoveToOffScreenColumnOnScreenLineMotion");
      var point = this.utils.getScreenPositionForScreenRow(this.editor, cursor.getScreenRow(), this.which, {
        allowOffScreenPosition: allowOffScreenPosition
      });
      this.setScreenPositionSafely(cursor, point);
    }
  }]);

  return MoveToScreenColumn;
})(Motion);

MoveToScreenColumn.register(false);

// keymap: g 0

var MoveToBeginningOfScreenLine = (function (_MoveToScreenColumn) {
  _inherits(MoveToBeginningOfScreenLine, _MoveToScreenColumn);

  function MoveToBeginningOfScreenLine() {
    _classCallCheck(this, MoveToBeginningOfScreenLine);

    _get(Object.getPrototypeOf(MoveToBeginningOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "beginning";
  }

  return MoveToBeginningOfScreenLine;
})(MoveToScreenColumn);

MoveToBeginningOfScreenLine.register();

// g ^: `move-to-first-character-of-screen-line`

var MoveToFirstCharacterOfScreenLine = (function (_MoveToScreenColumn2) {
  _inherits(MoveToFirstCharacterOfScreenLine, _MoveToScreenColumn2);

  function MoveToFirstCharacterOfScreenLine() {
    _classCallCheck(this, MoveToFirstCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToFirstCharacterOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "first-character";
  }

  return MoveToFirstCharacterOfScreenLine;
})(MoveToScreenColumn);

MoveToFirstCharacterOfScreenLine.register();

// keymap: g $

var MoveToLastCharacterOfScreenLine = (function (_MoveToScreenColumn3) {
  _inherits(MoveToLastCharacterOfScreenLine, _MoveToScreenColumn3);

  function MoveToLastCharacterOfScreenLine() {
    _classCallCheck(this, MoveToLastCharacterOfScreenLine);

    _get(Object.getPrototypeOf(MoveToLastCharacterOfScreenLine.prototype), "constructor", this).apply(this, arguments);

    this.which = "last-character";
  }

  return MoveToLastCharacterOfScreenLine;
})(MoveToScreenColumn);

MoveToLastCharacterOfScreenLine.register();

// keymap: g g

var MoveToFirstLine = (function (_Motion19) {
  _inherits(MoveToFirstLine, _Motion19);

  function MoveToFirstLine() {
    _classCallCheck(this, MoveToFirstLine);

    _get(Object.getPrototypeOf(MoveToFirstLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.verticalMotion = true;
    this.moveSuccessOnLinewise = true;
  }

  _createClass(MoveToFirstLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.setCursorBufferRow(cursor, this.getValidVimBufferRow(this.getRow()));
      cursor.autoscroll({ center: true });
    }
  }, {
    key: "getRow",
    value: function getRow() {
      return this.getCount(-1);
    }
  }]);

  return MoveToFirstLine;
})(Motion);

MoveToFirstLine.register();

// keymap: G

var MoveToLastLine = (function (_MoveToFirstLine) {
  _inherits(MoveToLastLine, _MoveToFirstLine);

  function MoveToLastLine() {
    _classCallCheck(this, MoveToLastLine);

    _get(Object.getPrototypeOf(MoveToLastLine.prototype), "constructor", this).apply(this, arguments);

    this.defaultCount = Infinity;
  }

  return MoveToLastLine;
})(MoveToFirstLine);

MoveToLastLine.register();

// keymap: N% e.g. 10%

var MoveToLineByPercent = (function (_MoveToFirstLine2) {
  _inherits(MoveToLineByPercent, _MoveToFirstLine2);

  function MoveToLineByPercent() {
    _classCallCheck(this, MoveToLineByPercent);

    _get(Object.getPrototypeOf(MoveToLineByPercent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToLineByPercent, [{
    key: "getRow",
    value: function getRow() {
      var percent = this.utils.limitNumber(this.getCount(), { max: 100 });
      return Math.floor((this.editor.getLineCount() - 1) * (percent / 100));
    }
  }]);

  return MoveToLineByPercent;
})(MoveToFirstLine);

MoveToLineByPercent.register();

var MoveToRelativeLine = (function (_Motion20) {
  _inherits(MoveToRelativeLine, _Motion20);

  function MoveToRelativeLine() {
    _classCallCheck(this, MoveToRelativeLine);

    _get(Object.getPrototypeOf(MoveToRelativeLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.moveSuccessOnLinewise = true;
  }

  _createClass(MoveToRelativeLine, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var row = undefined;
      var count = this.getCount();
      if (count < 0) {
        // Support negative count
        // Negative count can be passed like `operationStack.run("MoveToRelativeLine", {count: -5})`.
        // Currently used in vim-mode-plus-ex-mode pkg.
        count += 1;
        row = this.getFoldStartRowForRow(cursor.getBufferRow());
        while (count++ < 0) row = this.getFoldStartRowForRow(row - 1);
      } else {
        count -= 1;
        row = this.getFoldEndRowForRow(cursor.getBufferRow());
        while (count-- > 0) row = this.getFoldEndRowForRow(row + 1);
      }
      this.utils.setBufferRow(cursor, row);
    }
  }]);

  return MoveToRelativeLine;
})(Motion);

MoveToRelativeLine.register(false);

var MoveToRelativeLineMinimumTwo = (function (_MoveToRelativeLine) {
  _inherits(MoveToRelativeLineMinimumTwo, _MoveToRelativeLine);

  function MoveToRelativeLineMinimumTwo() {
    _classCallCheck(this, MoveToRelativeLineMinimumTwo);

    _get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToRelativeLineMinimumTwo, [{
    key: "getCount",
    value: function getCount() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.utils.limitNumber(_get(Object.getPrototypeOf(MoveToRelativeLineMinimumTwo.prototype), "getCount", this).apply(this, args), { min: 2 });
    }
  }]);

  return MoveToRelativeLineMinimumTwo;
})(MoveToRelativeLine);

MoveToRelativeLineMinimumTwo.register(false);

// Position cursor without scrolling., H, M, L
// -------------------------
// keymap: H

var MoveToTopOfScreen = (function (_Motion21) {
  _inherits(MoveToTopOfScreen, _Motion21);

  function MoveToTopOfScreen() {
    _classCallCheck(this, MoveToTopOfScreen);

    _get(Object.getPrototypeOf(MoveToTopOfScreen.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.jump = true;
    this.scrolloff = 2;
    this.defaultCount = 0;
    this.verticalMotion = true;
  }

  _createClass(MoveToTopOfScreen, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var bufferRow = this.editor.bufferRowForScreenRow(this.getScreenRow());
      this.setCursorBufferRow(cursor, bufferRow);
    }
  }, {
    key: "getScrolloff",
    value: function getScrolloff() {
      return this.isAsTargetExceptSelectInVisualMode() ? 0 : this.scrolloff;
    }
  }, {
    key: "getScreenRow",
    value: function getScreenRow() {
      var firstRow = this.editor.getFirstVisibleScreenRow();
      var offset = this.getScrolloff();
      if (firstRow === 0) {
        offset = 0;
      }
      offset = this.utils.limitNumber(this.getCount(-1), { min: offset });
      return firstRow + offset;
    }
  }]);

  return MoveToTopOfScreen;
})(Motion);

MoveToTopOfScreen.register();

// keymap: M

var MoveToMiddleOfScreen = (function (_MoveToTopOfScreen) {
  _inherits(MoveToMiddleOfScreen, _MoveToTopOfScreen);

  function MoveToMiddleOfScreen() {
    _classCallCheck(this, MoveToMiddleOfScreen);

    _get(Object.getPrototypeOf(MoveToMiddleOfScreen.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToMiddleOfScreen, [{
    key: "getScreenRow",
    value: function getScreenRow() {
      var startRow = this.editor.getFirstVisibleScreenRow();
      var endRow = this.utils.limitNumber(this.editor.getLastVisibleScreenRow(), { max: this.getVimLastScreenRow() });
      return startRow + Math.floor((endRow - startRow) / 2);
    }
  }]);

  return MoveToMiddleOfScreen;
})(MoveToTopOfScreen);

MoveToMiddleOfScreen.register();

// keymap: L

var MoveToBottomOfScreen = (function (_MoveToTopOfScreen2) {
  _inherits(MoveToBottomOfScreen, _MoveToTopOfScreen2);

  function MoveToBottomOfScreen() {
    _classCallCheck(this, MoveToBottomOfScreen);

    _get(Object.getPrototypeOf(MoveToBottomOfScreen.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToBottomOfScreen, [{
    key: "getScreenRow",
    value: function getScreenRow() {
      var vimLastScreenRow = this.getVimLastScreenRow();
      var row = this.utils.limitNumber(this.editor.getLastVisibleScreenRow(), { max: vimLastScreenRow });
      var offset = this.getScrolloff() + 1;
      if (row === vimLastScreenRow) {
        offset = 0;
      }
      offset = this.utils.limitNumber(this.getCount(-1), { min: offset });
      return row - offset;
    }
  }]);

  return MoveToBottomOfScreen;
})(MoveToTopOfScreen);

MoveToBottomOfScreen.register();

// Scrolling
// Half: ctrl-d, ctrl-u
// Full: ctrl-f, ctrl-b
// -------------------------
// [FIXME] count behave differently from original Vim.

var Scroll = (function (_Motion22) {
  _inherits(Scroll, _Motion22);

  function Scroll() {
    _classCallCheck(this, Scroll);

    _get(Object.getPrototypeOf(Scroll.prototype), "constructor", this).apply(this, arguments);

    this.verticalMotion = true;
  }

  _createClass(Scroll, [{
    key: "isSmoothScrollEnabled",
    value: function isSmoothScrollEnabled() {
      return Math.abs(this.amountOfPage) === 1 ? this.getConfig("smoothScrollOnFullScrollMotion") : this.getConfig("smoothScrollOnHalfScrollMotion");
    }
  }, {
    key: "getSmoothScrollDuation",
    value: function getSmoothScrollDuation() {
      return Math.abs(this.amountOfPage) === 1 ? this.getConfig("smoothScrollOnFullScrollMotionDuration") : this.getConfig("smoothScrollOnHalfScrollMotionDuration");
    }
  }, {
    key: "getPixelRectTopForSceenRow",
    value: function getPixelRectTopForSceenRow(row) {
      var point = new Point(row, 0);
      return this.editor.element.pixelRectForScreenRange(new Range(point, point)).top;
    }
  }, {
    key: "smoothScroll",
    value: function smoothScroll(fromRow, toRow, done) {
      var _this18 = this;

      var topPixelFrom = { top: this.getPixelRectTopForSceenRow(fromRow) };
      var topPixelTo = { top: this.getPixelRectTopForSceenRow(toRow) };
      // [NOTE]
      // intentionally use `element.component.setScrollTop` instead of `element.setScrollTop`.
      // SInce element.setScrollTop will throw exception when element.component no longer exists.
      var step = function step(newTop) {
        if (_this18.editor.element.component) {
          _this18.editor.element.component.setScrollTop(newTop);
          _this18.editor.element.component.updateSync();
        }
      };

      var duration = this.getSmoothScrollDuation();
      this.vimState.requestScrollAnimation(topPixelFrom, topPixelTo, { duration: duration, step: step, done: done });
    }
  }, {
    key: "getAmountOfRows",
    value: function getAmountOfRows() {
      return Math.ceil(this.amountOfPage * this.editor.getRowsPerPage() * this.getCount());
    }
  }, {
    key: "getBufferRow",
    value: function getBufferRow(cursor) {
      var screenRow = this.utils.getValidVimScreenRow(this.editor, cursor.getScreenRow() + this.getAmountOfRows());
      return this.editor.bufferRowForScreenRow(screenRow);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this19 = this;

      var bufferRow = this.getBufferRow(cursor);
      this.setCursorBufferRow(cursor, this.getBufferRow(cursor), { autoscroll: false });

      if (cursor.isLastCursor()) {
        (function () {
          if (_this19.isSmoothScrollEnabled()) _this19.vimState.finishScrollAnimation();

          var firstVisibileScreenRow = _this19.editor.getFirstVisibleScreenRow();
          var newFirstVisibileBufferRow = _this19.editor.bufferRowForScreenRow(firstVisibileScreenRow + _this19.getAmountOfRows());
          var newFirstVisibileScreenRow = _this19.editor.screenRowForBufferRow(newFirstVisibileBufferRow);
          var done = function done() {
            _this19.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            // [FIXME] sometimes, scrollTop is not updated, calling this fix.
            // Investigate and find better approach then remove this workaround.
            if (_this19.editor.element.component) _this19.editor.element.component.updateSync();
          };

          if (_this19.isSmoothScrollEnabled()) _this19.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, done);else done();
        })();
      }
    }
  }]);

  return Scroll;
})(Motion);

Scroll.register(false);

// keymap: ctrl-f

var ScrollFullScreenDown = (function (_Scroll) {
  _inherits(ScrollFullScreenDown, _Scroll);

  function ScrollFullScreenDown() {
    _classCallCheck(this, ScrollFullScreenDown);

    _get(Object.getPrototypeOf(ScrollFullScreenDown.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = +1;
  }

  return ScrollFullScreenDown;
})(Scroll);

ScrollFullScreenDown.register();

// keymap: ctrl-b

var ScrollFullScreenUp = (function (_Scroll2) {
  _inherits(ScrollFullScreenUp, _Scroll2);

  function ScrollFullScreenUp() {
    _classCallCheck(this, ScrollFullScreenUp);

    _get(Object.getPrototypeOf(ScrollFullScreenUp.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = -1;
  }

  return ScrollFullScreenUp;
})(Scroll);

ScrollFullScreenUp.register();

// keymap: ctrl-d

var ScrollHalfScreenDown = (function (_Scroll3) {
  _inherits(ScrollHalfScreenDown, _Scroll3);

  function ScrollHalfScreenDown() {
    _classCallCheck(this, ScrollHalfScreenDown);

    _get(Object.getPrototypeOf(ScrollHalfScreenDown.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = +1 / 2;
  }

  return ScrollHalfScreenDown;
})(Scroll);

ScrollHalfScreenDown.register();

// keymap: ctrl-u

var ScrollHalfScreenUp = (function (_Scroll4) {
  _inherits(ScrollHalfScreenUp, _Scroll4);

  function ScrollHalfScreenUp() {
    _classCallCheck(this, ScrollHalfScreenUp);

    _get(Object.getPrototypeOf(ScrollHalfScreenUp.prototype), "constructor", this).apply(this, arguments);

    this.amountOfPage = -1 / 2;
  }

  return ScrollHalfScreenUp;
})(Scroll);

ScrollHalfScreenUp.register();

// Find
// -------------------------
// keymap: f

var Find = (function (_Motion23) {
  _inherits(Find, _Motion23);

  function Find() {
    _classCallCheck(this, Find);

    _get(Object.getPrototypeOf(Find.prototype), "constructor", this).apply(this, arguments);

    this.backwards = false;
    this.inclusive = true;
    this.offset = 0;
    this.requireInput = true;
    this.caseSensitivityKind = "Find";
  }

  _createClass(Find, [{
    key: "restoreEditorState",
    value: function restoreEditorState() {
      if (this._restoreEditorState) this._restoreEditorState();
      this._restoreEditorState = null;
    }
  }, {
    key: "cancelOperation",
    value: function cancelOperation() {
      this.restoreEditorState();
      _get(Object.getPrototypeOf(Find.prototype), "cancelOperation", this).call(this);
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this20 = this;

      if (this.getConfig("reuseFindForRepeatFind")) this.repeatIfNecessary();
      if (!this.isComplete()) {
        var charsMax = this.getConfig("findCharsMax");
        var optionsBase = { purpose: "find", charsMax: charsMax };

        if (charsMax === 1) {
          this.focusInput(optionsBase);
        } else {
          this._restoreEditorState = this.utils.saveEditorState(this.editor);
          var options = {
            autoConfirmTimeout: this.getConfig("findConfirmByTimeout"),
            onConfirm: function onConfirm(input) {
              _this20.input = input;
              if (input) _this20.processOperation();else _this20.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this20.preConfirmedChars = preConfirmedChars;
              _this20.highlightTextInCursorRows(_this20.preConfirmedChars, "pre-confirm", _this20.isBackwards());
            },
            onCancel: function onCancel() {
              _this20.vimState.highlightFind.clearMarkers();
              _this20.cancelOperation();
            },
            commands: {
              "vim-mode-plus:find-next-pre-confirmed": function vimModePlusFindNextPreConfirmed() {
                return _this20.findPreConfirmed(+1);
              },
              "vim-mode-plus:find-previous-pre-confirmed": function vimModePlusFindPreviousPreConfirmed() {
                return _this20.findPreConfirmed(-1);
              }
            }
          };
          this.focusInput(Object.assign(options, optionsBase));
        }
      }
      return _get(Object.getPrototypeOf(Find.prototype), "initialize", this).call(this);
    }
  }, {
    key: "findPreConfirmed",
    value: function findPreConfirmed(delta) {
      if (this.preConfirmedChars && this.getConfig("highlightFindChar")) {
        var index = this.highlightTextInCursorRows(this.preConfirmedChars, "pre-confirm", this.isBackwards(), this.getCount(-1) + delta, true);
        this.count = index + 1;
      }
    }
  }, {
    key: "repeatIfNecessary",
    value: function repeatIfNecessary() {
      var findCommandNames = ["Find", "FindBackwards", "Till", "TillBackwards"];
      var currentFind = this.globalState.get("currentFind");
      if (currentFind && findCommandNames.includes(this.vimState.operationStack.getLastCommandName())) {
        this.input = currentFind.input;
        this.repeated = true;
      }
    }
  }, {
    key: "isBackwards",
    value: function isBackwards() {
      return this.backwards;
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this21 = this;

      _get(Object.getPrototypeOf(Find.prototype), "execute", this).call(this);
      var decorationType = "post-confirm";
      if (this.operator && !this.operator["instanceof"]("SelectBase")) {
        decorationType += " long";
      }

      // HACK: When repeated by ",", this.backwards is temporary inverted and
      // restored after execution finished.
      // But final highlightTextInCursorRows is executed in async(=after operation finished).
      // Thus we need to preserve before restored `backwards` value and pass it.
      var backwards = this.isBackwards();
      this.editor.component.getNextUpdatePromise().then(function () {
        _this21.highlightTextInCursorRows(_this21.input, decorationType, backwards);
      });
    }
  }, {
    key: "getPoint",
    value: function getPoint(fromPoint) {
      var scanRange = this.editor.bufferRangeForBufferRow(fromPoint.row);
      var points = [];
      var regex = this.getRegex(this.input);
      var indexWantAccess = this.getCount(-1);

      var translation = new Point(0, this.isBackwards() ? this.offset : -this.offset);
      if (this.repeated) {
        fromPoint = fromPoint.translate(translation.negate());
      }

      if (this.isBackwards()) {
        if (this.getConfig("findAcrossLines")) scanRange.start = Point.ZERO;

        this.editor.backwardsScanInBufferRange(regex, scanRange, function (_ref7) {
          var range = _ref7.range;
          var stop = _ref7.stop;

          if (range.start.isLessThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              stop();
            }
          }
        });
      } else {
        if (this.getConfig("findAcrossLines")) scanRange.end = this.editor.getEofBufferPosition();
        this.editor.scanInBufferRange(regex, scanRange, function (_ref8) {
          var range = _ref8.range;
          var stop = _ref8.stop;

          if (range.start.isGreaterThan(fromPoint)) {
            points.push(range.start);
            if (points.length > indexWantAccess) {
              stop();
            }
          }
        });
      }

      var point = points[indexWantAccess];
      if (point) return point.translate(translation);
    }

    // FIXME: bad naming, this function must return index
  }, {
    key: "highlightTextInCursorRows",
    value: function highlightTextInCursorRows(text, decorationType, backwards) {
      var index = arguments.length <= 3 || arguments[3] === undefined ? this.getCount(-1) : arguments[3];
      var adjustIndex = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

      if (!this.getConfig("highlightFindChar")) return;

      return this.vimState.highlightFind.highlightCursorRows(this.getRegex(text), decorationType, backwards, this.offset, index, adjustIndex);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.getPoint(cursor.getBufferPosition());
      if (point) cursor.setBufferPosition(point);else this.restoreEditorState();

      if (!this.repeated) this.globalState.set("currentFind", this);
    }
  }, {
    key: "getRegex",
    value: function getRegex(term) {
      var modifiers = this.isCaseSensitive(term) ? "g" : "gi";
      return new RegExp(_.escapeRegExp(term), modifiers);
    }
  }]);

  return Find;
})(Motion);

Find.register();

// keymap: F

var FindBackwards = (function (_Find) {
  _inherits(FindBackwards, _Find);

  function FindBackwards() {
    _classCallCheck(this, FindBackwards);

    _get(Object.getPrototypeOf(FindBackwards.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  return FindBackwards;
})(Find);

FindBackwards.register();

// keymap: t

var Till = (function (_Find2) {
  _inherits(Till, _Find2);

  function Till() {
    _classCallCheck(this, Till);

    _get(Object.getPrototypeOf(Till.prototype), "constructor", this).apply(this, arguments);

    this.offset = 1;
  }

  _createClass(Till, [{
    key: "getPoint",
    value: function getPoint() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var point = _get(Object.getPrototypeOf(Till.prototype), "getPoint", this).apply(this, args);
      this.moveSucceeded = point != null;
      return point;
    }
  }]);

  return Till;
})(Find);

Till.register();

// keymap: T

var TillBackwards = (function (_Till) {
  _inherits(TillBackwards, _Till);

  function TillBackwards() {
    _classCallCheck(this, TillBackwards);

    _get(Object.getPrototypeOf(TillBackwards.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = false;
    this.backwards = true;
  }

  return TillBackwards;
})(Till);

TillBackwards.register();

// Mark
// -------------------------
// keymap: `

var MoveToMark = (function (_Motion24) {
  _inherits(MoveToMark, _Motion24);

  function MoveToMark() {
    _classCallCheck(this, MoveToMark);

    _get(Object.getPrototypeOf(MoveToMark.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.requireInput = true;
    this.input = null;
  }

  _createClass(MoveToMark, [{
    key: "initialize",
    value: function initialize() {
      if (!this.isComplete()) this.readChar();
      return _get(Object.getPrototypeOf(MoveToMark.prototype), "initialize", this).call(this);
    }
  }, {
    key: "getPoint",
    value: function getPoint() {
      return this.vimState.mark.get(this.input);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var point = this.getPoint();
      if (point) {
        cursor.setBufferPosition(point);
        cursor.autoscroll({ center: true });
      }
    }
  }]);

  return MoveToMark;
})(Motion);

MoveToMark.register();

// keymap: '

var MoveToMarkLine = (function (_MoveToMark) {
  _inherits(MoveToMarkLine, _MoveToMark);

  function MoveToMarkLine() {
    _classCallCheck(this, MoveToMarkLine);

    _get(Object.getPrototypeOf(MoveToMarkLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(MoveToMarkLine, [{
    key: "getPoint",
    value: function getPoint() {
      var point = _get(Object.getPrototypeOf(MoveToMarkLine.prototype), "getPoint", this).call(this);
      if (point) {
        return this.getFirstCharacterPositionForBufferRow(point.row);
      }
    }
  }]);

  return MoveToMarkLine;
})(MoveToMark);

MoveToMarkLine.register();

// Fold
// -------------------------

var MoveToPreviousFoldStart = (function (_Motion25) {
  _inherits(MoveToPreviousFoldStart, _Motion25);

  function MoveToPreviousFoldStart() {
    _classCallCheck(this, MoveToPreviousFoldStart);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.wise = "characterwise";
    this.which = "start";
    this.direction = "prev";
  }

  _createClass(MoveToPreviousFoldStart, [{
    key: "execute",
    value: function execute() {
      this.rows = this.getFoldRows(this.which);
      if (this.direction === "prev") this.rows.reverse();

      _get(Object.getPrototypeOf(MoveToPreviousFoldStart.prototype), "execute", this).call(this);
    }
  }, {
    key: "getFoldRows",
    value: function getFoldRows(which) {
      var index = which === "start" ? 0 : 1;
      var rows = this.utils.getCodeFoldRowRanges(this.editor).map(function (rowRange) {
        return rowRange[index];
      });
      return _.sortBy(_.uniq(rows), function (row) {
        return row;
      });
    }
  }, {
    key: "getScanRows",
    value: function getScanRows(cursor) {
      var cursorRow = cursor.getBufferRow();
      var isVald = this.direction === "prev" ? function (row) {
        return row < cursorRow;
      } : function (row) {
        return row > cursorRow;
      };
      return this.rows.filter(isVald);
    }
  }, {
    key: "detectRow",
    value: function detectRow(cursor) {
      return this.getScanRows(cursor)[0];
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this22 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this22.detectRow(cursor);
        if (row != null) _this22.utils.moveCursorToFirstCharacterAtRow(cursor, row);
      });
    }
  }]);

  return MoveToPreviousFoldStart;
})(Motion);

MoveToPreviousFoldStart.register();

var MoveToNextFoldStart = (function (_MoveToPreviousFoldStart) {
  _inherits(MoveToNextFoldStart, _MoveToPreviousFoldStart);

  function MoveToNextFoldStart() {
    _classCallCheck(this, MoveToNextFoldStart);

    _get(Object.getPrototypeOf(MoveToNextFoldStart.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldStart;
})(MoveToPreviousFoldStart);

MoveToNextFoldStart.register();

var MoveToPreviousFoldStartWithSameIndent = (function (_MoveToPreviousFoldStart2) {
  _inherits(MoveToPreviousFoldStartWithSameIndent, _MoveToPreviousFoldStart2);

  function MoveToPreviousFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToPreviousFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToPreviousFoldStartWithSameIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(MoveToPreviousFoldStartWithSameIndent, [{
    key: "detectRow",
    value: function detectRow(cursor) {
      var _this23 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this23.editor.indentationForBufferRow(row) === baseIndentLevel;
      });
    }
  }]);

  return MoveToPreviousFoldStartWithSameIndent;
})(MoveToPreviousFoldStart);

MoveToPreviousFoldStartWithSameIndent.register();

var MoveToNextFoldStartWithSameIndent = (function (_MoveToPreviousFoldStartWithSameIndent) {
  _inherits(MoveToNextFoldStartWithSameIndent, _MoveToPreviousFoldStartWithSameIndent);

  function MoveToNextFoldStartWithSameIndent() {
    _classCallCheck(this, MoveToNextFoldStartWithSameIndent);

    _get(Object.getPrototypeOf(MoveToNextFoldStartWithSameIndent.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldStartWithSameIndent;
})(MoveToPreviousFoldStartWithSameIndent);

MoveToNextFoldStartWithSameIndent.register();

var MoveToPreviousFoldEnd = (function (_MoveToPreviousFoldStart3) {
  _inherits(MoveToPreviousFoldEnd, _MoveToPreviousFoldStart3);

  function MoveToPreviousFoldEnd() {
    _classCallCheck(this, MoveToPreviousFoldEnd);

    _get(Object.getPrototypeOf(MoveToPreviousFoldEnd.prototype), "constructor", this).apply(this, arguments);

    this.which = "end";
  }

  return MoveToPreviousFoldEnd;
})(MoveToPreviousFoldStart);

MoveToPreviousFoldEnd.register();

var MoveToNextFoldEnd = (function (_MoveToPreviousFoldEnd) {
  _inherits(MoveToNextFoldEnd, _MoveToPreviousFoldEnd);

  function MoveToNextFoldEnd() {
    _classCallCheck(this, MoveToNextFoldEnd);

    _get(Object.getPrototypeOf(MoveToNextFoldEnd.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFoldEnd;
})(MoveToPreviousFoldEnd);

MoveToNextFoldEnd.register();

// -------------------------

var MoveToPreviousFunction = (function (_MoveToPreviousFoldStart4) {
  _inherits(MoveToPreviousFunction, _MoveToPreviousFoldStart4);

  function MoveToPreviousFunction() {
    _classCallCheck(this, MoveToPreviousFunction);

    _get(Object.getPrototypeOf(MoveToPreviousFunction.prototype), "constructor", this).apply(this, arguments);

    this.direction = "prev";
  }

  _createClass(MoveToPreviousFunction, [{
    key: "detectRow",
    value: function detectRow(cursor) {
      var _this24 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this24.utils.isIncludeFunctionScopeForRow(_this24.editor, row);
      });
    }
  }]);

  return MoveToPreviousFunction;
})(MoveToPreviousFoldStart);

MoveToPreviousFunction.register();

var MoveToNextFunction = (function (_MoveToPreviousFunction) {
  _inherits(MoveToNextFunction, _MoveToPreviousFunction);

  function MoveToNextFunction() {
    _classCallCheck(this, MoveToNextFunction);

    _get(Object.getPrototypeOf(MoveToNextFunction.prototype), "constructor", this).apply(this, arguments);

    this.direction = "next";
  }

  return MoveToNextFunction;
})(MoveToPreviousFunction);

MoveToNextFunction.register();

// Scope based
// -------------------------

var MoveToPositionByScope = (function (_Motion26) {
  _inherits(MoveToPositionByScope, _Motion26);

  function MoveToPositionByScope() {
    _classCallCheck(this, MoveToPositionByScope);

    _get(Object.getPrototypeOf(MoveToPositionByScope.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = ".";
  }

  _createClass(MoveToPositionByScope, [{
    key: "getPoint",
    value: function getPoint(fromPoint) {
      return this.utils.detectScopeStartPositionForScope(this.editor, fromPoint, this.direction, this.scope);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this25 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this25.setBufferPositionSafely(cursor, _this25.getPoint(cursor.getBufferPosition()));
      });
    }
  }]);

  return MoveToPositionByScope;
})(Motion);

MoveToPositionByScope.register(false);

var MoveToPreviousString = (function (_MoveToPositionByScope) {
  _inherits(MoveToPreviousString, _MoveToPositionByScope);

  function MoveToPreviousString() {
    _classCallCheck(this, MoveToPreviousString);

    _get(Object.getPrototypeOf(MoveToPreviousString.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = "string.begin";
  }

  return MoveToPreviousString;
})(MoveToPositionByScope);

MoveToPreviousString.register();

var MoveToNextString = (function (_MoveToPreviousString) {
  _inherits(MoveToNextString, _MoveToPreviousString);

  function MoveToNextString() {
    _classCallCheck(this, MoveToNextString);

    _get(Object.getPrototypeOf(MoveToNextString.prototype), "constructor", this).apply(this, arguments);

    this.direction = "forward";
  }

  return MoveToNextString;
})(MoveToPreviousString);

MoveToNextString.register();

var MoveToPreviousNumber = (function (_MoveToPositionByScope2) {
  _inherits(MoveToPreviousNumber, _MoveToPositionByScope2);

  function MoveToPreviousNumber() {
    _classCallCheck(this, MoveToPreviousNumber);

    _get(Object.getPrototypeOf(MoveToPreviousNumber.prototype), "constructor", this).apply(this, arguments);

    this.direction = "backward";
    this.scope = "constant.numeric";
  }

  return MoveToPreviousNumber;
})(MoveToPositionByScope);

MoveToPreviousNumber.register();

var MoveToNextNumber = (function (_MoveToPreviousNumber) {
  _inherits(MoveToNextNumber, _MoveToPreviousNumber);

  function MoveToNextNumber() {
    _classCallCheck(this, MoveToNextNumber);

    _get(Object.getPrototypeOf(MoveToNextNumber.prototype), "constructor", this).apply(this, arguments);

    this.direction = "forward";
  }

  return MoveToNextNumber;
})(MoveToPreviousNumber);

MoveToNextNumber.register();

var MoveToNextOccurrence = (function (_Motion27) {
  _inherits(MoveToNextOccurrence, _Motion27);

  function MoveToNextOccurrence() {
    _classCallCheck(this, MoveToNextOccurrence);

    _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.jump = true;
    this.direction = "next";
  }

  _createClass(MoveToNextOccurrence, [{
    key: "execute",
    value: function execute() {
      this.ranges = this.utils.sortRanges(this.occurrenceManager.getMarkers().map(function (marker) {
        return marker.getBufferRange();
      }));
      _get(Object.getPrototypeOf(MoveToNextOccurrence.prototype), "execute", this).call(this);
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var range = this.ranges[this.utils.getIndex(this.getIndex(cursor.getBufferPosition()), this.ranges)];
      var point = range.start;
      cursor.setBufferPosition(point, { autoscroll: false });

      if (cursor.isLastCursor()) {
        this.editor.unfoldBufferRow(point.row);
        this.utils.smartScrollToBufferPosition(this.editor, point);
      }

      if (this.getConfig("flashOnMoveToOccurrence")) {
        this.vimState.flash(range, { type: "search" });
      }
    }
  }, {
    key: "getIndex",
    value: function getIndex(fromPoint) {
      var index = this.ranges.findIndex(function (range) {
        return range.start.isGreaterThan(fromPoint);
      });
      return (index >= 0 ? index : 0) + this.getCount(-1);
    }
  }], [{
    key: "commandScope",

    // Ensure this command is available when only has-occurrence
    value: "atom-text-editor.vim-mode-plus.has-occurrence",
    enumerable: true
  }]);

  return MoveToNextOccurrence;
})(Motion);

MoveToNextOccurrence.register();

var MoveToPreviousOccurrence = (function (_MoveToNextOccurrence) {
  _inherits(MoveToPreviousOccurrence, _MoveToNextOccurrence);

  function MoveToPreviousOccurrence() {
    _classCallCheck(this, MoveToPreviousOccurrence);

    _get(Object.getPrototypeOf(MoveToPreviousOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.direction = "previous";
  }

  _createClass(MoveToPreviousOccurrence, [{
    key: "getIndex",
    value: function getIndex(fromPoint) {
      var ranges = this.ranges.slice().reverse();
      var range = ranges.find(function (range) {
        return range.end.isLessThan(fromPoint);
      });
      var index = range ? this.ranges.indexOf(range) : this.ranges.length - 1;
      return index - this.getCount(-1);
    }
  }]);

  return MoveToPreviousOccurrence;
})(MoveToNextOccurrence);

MoveToPreviousOccurrence.register();

// -------------------------
// keymap: %

var MoveToPair = (function (_Motion28) {
  _inherits(MoveToPair, _Motion28);

  function MoveToPair() {
    _classCallCheck(this, MoveToPair);

    _get(Object.getPrototypeOf(MoveToPair.prototype), "constructor", this).apply(this, arguments);

    this.inclusive = true;
    this.jump = true;
    this.member = ["Parenthesis", "CurlyBracket", "SquareBracket"];
  }

  _createClass(MoveToPair, [{
    key: "moveCursor",
    value: function moveCursor(cursor) {
      this.setBufferPositionSafely(cursor, this.getPoint(cursor));
    }
  }, {
    key: "getPointForTag",
    value: function getPointForTag(point) {
      var pairInfo = this.getInstance("ATag").getPairInfo(point);
      if (!pairInfo) return;

      var openRange = pairInfo.openRange;
      var closeRange = pairInfo.closeRange;

      openRange = openRange.translate([0, +1], [0, -1]);
      closeRange = closeRange.translate([0, +1], [0, -1]);
      if (openRange.containsPoint(point) && !point.isEqual(openRange.end)) {
        return closeRange.start;
      }
      if (closeRange.containsPoint(point) && !point.isEqual(closeRange.end)) {
        return openRange.start;
      }
    }
  }, {
    key: "getPoint",
    value: function getPoint(cursor) {
      var cursorPosition = cursor.getBufferPosition();
      var cursorRow = cursorPosition.row;
      var point = this.getPointForTag(cursorPosition);
      if (point) return point;

      // AAnyPairAllowForwarding return forwarding range or enclosing range.
      var range = this.getInstance("AAnyPairAllowForwarding", { member: this.member }).getRange(cursor.selection);
      if (!range) return;

      var start = range.start;
      var end = range.end;

      if (start.row === cursorRow && start.isGreaterThanOrEqual(cursorPosition)) {
        // Forwarding range found
        return end.translate([0, -1]);
      } else if (end.row === cursorPosition.row) {
        // Enclosing range was returned
        // We move to start( open-pair ) only when close-pair was at same row as cursor-row.
        return start;
      }
    }
  }]);

  return MoveToPair;
})(Motion);

MoveToPair.register();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7QUFFWCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTs7ZUFDYixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUEvQixLQUFLLFlBQUwsS0FBSztJQUFFLEtBQUssWUFBTCxLQUFLOztBQUVuQixJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7O0lBRXhCLE1BQU07WUFBTixNQUFNOztXQUFOLE1BQU07MEJBQU4sTUFBTTs7K0JBQU4sTUFBTTs7U0FFVixTQUFTLEdBQUcsS0FBSztTQUNqQixJQUFJLEdBQUcsZUFBZTtTQUN0QixJQUFJLEdBQUcsS0FBSztTQUNaLGNBQWMsR0FBRyxLQUFLO1NBQ3RCLGFBQWEsR0FBRyxJQUFJO1NBQ3BCLHFCQUFxQixHQUFHLEtBQUs7U0FDN0IsZUFBZSxHQUFHLEtBQUs7OztlQVJuQixNQUFNOztXQVVBLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxVQUFJLElBQUksS0FBSyxlQUFlLEVBQUU7QUFDNUIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBO09BQ3BFO0FBQ0QsVUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7S0FDakI7OztXQUVTLHNCQUFHO0FBQ1gsVUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUE7S0FDN0I7OztXQUVzQixpQ0FBQyxNQUFNLEVBQUUsS0FBSyxF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QUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLEVBQUU7O0FBRXpFLGVBQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDOUIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEtBQUssY0FBYyxDQUFDLEdBQUcsRUFBRTs7O0FBR3pDLGVBQU8sS0FBSyxDQUFBO09BQ2I7S0FDRjs7O1NBM0NHLFVBQVU7R0FBUyxNQUFNOztBQTZDL0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcbmNvbnN0IHtQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZShcImF0b21cIilcblxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgTW90aW9uIGV4dGVuZHMgQmFzZSB7XG4gIHN0YXRpYyBvcGVyYXRpb25LaW5kID0gXCJtb3Rpb25cIlxuICBpbmNsdXNpdmUgPSBmYWxzZVxuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAganVtcCA9IGZhbHNlXG4gIHZlcnRpY2FsTW90aW9uID0gZmFsc2VcbiAgbW92ZVN1Y2NlZWRlZCA9IG51bGxcbiAgbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlID0gZmFsc2VcbiAgc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcblxuICBpc0xpbmV3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwibGluZXdpc2VcIlxuICB9XG5cbiAgaXNCbG9ja3dpc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIlxuICB9XG5cbiAgZm9yY2VXaXNlKHdpc2UpIHtcbiAgICBpZiAod2lzZSA9PT0gXCJjaGFyYWN0ZXJ3aXNlXCIpIHtcbiAgICAgIHRoaXMuaW5jbHVzaXZlID0gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCIgPyBmYWxzZSA6ICF0aGlzLmluY2x1c2l2ZVxuICAgIH1cbiAgICB0aGlzLndpc2UgPSB3aXNlXG4gIH1cblxuICByZXNldFN0YXRlKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIHNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpIHtcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIHNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpIHtcbiAgICBpZiAocG9pbnQpIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb2ludClcbiAgfVxuXG4gIG1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKSB7XG4gICAgY29uc3Qgb3JpZ2luYWxQb3NpdGlvbiA9IHRoaXMuanVtcCAmJiBjdXJzb3IuaXNMYXN0Q3Vyc29yKCkgPyBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSA6IHVuZGVmaW5lZFxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yKGN1cnNvcilcblxuICAgIGlmIChvcmlnaW5hbFBvc2l0aW9uICYmICFjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0VxdWFsKG9yaWdpbmFsUG9zaXRpb24pKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLm1hcmsuc2V0KFwiYFwiLCBvcmlnaW5hbFBvc2l0aW9uKVxuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcIidcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICB9XG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIGlmICh0aGlzLm9wZXJhdG9yKSB7XG4gICAgICB0aGlzLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICB0aGlzLm1vdmVXaXRoU2F2ZUp1bXAoY3Vyc29yKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVkaXRvci5tZXJnZUN1cnNvcnMoKVxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gIH1cblxuICAvLyBOT1RFOiBzZWxlY3Rpb24gaXMgYWxyZWFkeSBcIm5vcm1hbGl6ZWRcIiBiZWZvcmUgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gIHNlbGVjdCgpIHtcbiAgICAvLyBuZWVkIHRvIGNhcmUgd2FzIHZpc3VhbCBmb3IgYC5gIHJlcGVhdGVkLlxuICAgIGNvbnN0IGlzT3JXYXNWaXN1YWwgPSB0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpIHx8IHRoaXMuaXMoXCJDdXJyZW50U2VsZWN0aW9uXCIpXG5cbiAgICBmb3IgKGNvbnN0IHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24oKCkgPT4gdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKHNlbGVjdGlvbi5jdXJzb3IpKVxuXG4gICAgICBjb25zdCBzZWxlY3RTdWNjZWVkZWQgPVxuICAgICAgICB0aGlzLm1vdmVTdWNjZWVkZWQgIT0gbnVsbFxuICAgICAgICAgID8gdGhpcy5tb3ZlU3VjY2VlZGVkXG4gICAgICAgICAgOiAhc2VsZWN0aW9uLmlzRW1wdHkoKSB8fCAodGhpcy5pc0xpbmV3aXNlKCkgJiYgdGhpcy5tb3ZlU3VjY2Vzc09uTGluZXdpc2UpXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0U3VjY2VlZGVkKSB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IHNlbGVjdFN1Y2NlZWRlZFxuXG4gICAgICBpZiAoaXNPcldhc1Zpc3VhbCB8fCAoc2VsZWN0U3VjY2VlZGVkICYmICh0aGlzLmluY2x1c2l2ZSB8fCB0aGlzLmlzTGluZXdpc2UoKSkpKSB7XG4gICAgICAgIGNvbnN0ICRzZWxlY3Rpb24gPSB0aGlzLnN3cmFwKHNlbGVjdGlvbilcbiAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcyh0cnVlKSAvLyBzYXZlIHByb3BlcnR5IG9mIFwiYWxyZWFkeS1ub3JtYWxpemVkLXNlbGVjdGlvblwiXG4gICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKHRoaXMud2lzZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnZpbVN0YXRlLmdldExhc3RCbG9ja3dpc2VTZWxlY3Rpb24oKS5hdXRvc2Nyb2xsKClcbiAgICB9XG4gIH1cblxuICBzZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy52ZXJ0aWNhbE1vdGlvbiAmJiAhdGhpcy5nZXRDb25maWcoXCJzdGF5T25WZXJ0aWNhbE1vdGlvblwiKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhyb3cpLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdywgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICAvLyBbTk9URV1cbiAgLy8gU2luY2UgdGhpcyBmdW5jdGlvbiBjaGVja3MgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZSwgYSBjdXJzb3IgcG9zaXRpb24gTVVTVCBiZVxuICAvLyB1cGRhdGVkIElOIGNhbGxiYWNrKD1mbilcbiAgLy8gVXBkYXRpbmcgcG9pbnQgb25seSBpbiBjYWxsYmFjayBpcyB3cm9uZy11c2Ugb2YgdGhpcyBmdW5jaXRvbixcbiAgLy8gc2luY2UgaXQgc3RvcHMgaW1tZWRpYXRlbHkgYmVjYXVzZSBvZiBub3QgY3Vyc29yIHBvc2l0aW9uIGNoYW5nZS5cbiAgbW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCBmbikge1xuICAgIGxldCBvbGRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGhpcy5jb3VudFRpbWVzKHRoaXMuZ2V0Q291bnQoKSwgc3RhdGUgPT4ge1xuICAgICAgZm4oc3RhdGUpXG4gICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiAobmV3UG9zaXRpb24uaXNFcXVhbChvbGRQb3NpdGlvbikpIHN0YXRlLnN0b3AoKVxuICAgICAgb2xkUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuICAgIH0pXG4gIH1cblxuICBpc0Nhc2VTZW5zaXRpdmUodGVybSkge1xuICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhgdXNlU21hcnRjYXNlRm9yJHt0aGlzLmNhc2VTZW5zaXRpdml0eUtpbmR9YClcbiAgICAgID8gdGVybS5zZWFyY2goL1tBLVpdLykgIT09IC0xXG4gICAgICA6ICF0aGlzLmdldENvbmZpZyhgaWdub3JlQ2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gIH1cbn1cbk1vdGlvbi5yZWdpc3RlcihmYWxzZSlcblxuLy8gVXNlZCBhcyBvcGVyYXRvcidzIHRhcmdldCBpbiB2aXN1YWwtbW9kZS5cbmNsYXNzIEN1cnJlbnRTZWxlY3Rpb24gZXh0ZW5kcyBNb3Rpb24ge1xuICBzZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCA9IG51bGxcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBwb2ludEluZm9CeUN1cnNvciA9IG5ldyBNYXAoKVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgdGhpcy5zZWxlY3Rpb25FeHRlbnQgPSB0aGlzLmlzQmxvY2t3aXNlKClcbiAgICAgICAgPyB0aGlzLnN3cmFwKGN1cnNvci5zZWxlY3Rpb24pLmdldEJsb2Nrd2lzZVNlbGVjdGlvbkV4dGVudCgpXG4gICAgICAgIDogdGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpLmdldEV4dGVudCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGAuYCByZXBlYXQgY2FzZVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLnRyYW5zbGF0ZSh0aGlzLnNlbGVjdGlvbkV4dGVudCkpXG4gICAgfVxuICB9XG5cbiAgc2VsZWN0KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgY3Vyc29yIG9mIHRoaXMuZWRpdG9yLmdldEN1cnNvcnMoKSkge1xuICAgICAgICBjb25zdCBwb2ludEluZm8gPSB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLmdldChjdXJzb3IpXG4gICAgICAgIGlmIChwb2ludEluZm8pIHtcbiAgICAgICAgICBjb25zdCB7Y3Vyc29yUG9zaXRpb24sIHN0YXJ0T2ZTZWxlY3Rpb259ID0gcG9pbnRJbmZvXG4gICAgICAgICAgaWYgKGN1cnNvclBvc2l0aW9uLmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKSB7XG4gICAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oc3RhcnRPZlNlbGVjdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN1cGVyLnNlbGVjdCgpXG4gICAgfVxuXG4gICAgLy8gKiBQdXJwb3NlIG9mIHBvaW50SW5mb0J5Q3Vyc29yPyBzZWUgIzIzNSBmb3IgZGV0YWlsLlxuICAgIC8vIFdoZW4gc3RheU9uVHJhbnNmb3JtU3RyaW5nIGlzIGVuYWJsZWQsIGN1cnNvciBwb3MgaXMgbm90IHNldCBvbiBzdGFydCBvZlxuICAgIC8vIG9mIHNlbGVjdGVkIHJhbmdlLlxuICAgIC8vIEJ1dCBJIHdhbnQgZm9sbG93aW5nIGJlaGF2aW9yLCBzbyBuZWVkIHRvIHByZXNlcnZlIHBvc2l0aW9uIGluZm8uXG4gICAgLy8gIDEuIGB2aj4uYCAtPiBpbmRlbnQgc2FtZSB0d28gcm93cyByZWdhcmRsZXNzIG9mIGN1cnJlbnQgY3Vyc29yJ3Mgcm93LlxuICAgIC8vICAyLiBgdmo+ai5gIC0+IGluZGVudCB0d28gcm93cyBmcm9tIGN1cnNvcidzIHJvdy5cbiAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgIGNvbnN0IHN0YXJ0T2ZTZWxlY3Rpb24gPSBjdXJzb3Iuc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICAgIHRoaXMucG9pbnRJbmZvQnlDdXJzb3Iuc2V0KGN1cnNvciwge3N0YXJ0T2ZTZWxlY3Rpb24sIGN1cnNvclBvc2l0aW9ufSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5DdXJyZW50U2VsZWN0aW9uLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5nZXRDb25maWcoXCJ3cmFwTGVmdFJpZ2h0TW90aW9uXCIpXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvckxlZnQoY3Vyc29yLCB7YWxsb3dXcmFwfSkpXG4gIH1cbn1cbk1vdmVMZWZ0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBhbGxvd1dyYXAgPSB0aGlzLmdldENvbmZpZyhcIndyYXBMZWZ0UmlnaHRNb3Rpb25cIilcblxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuXG4gICAgICAvLyAtIFdoZW4gYHdyYXBMZWZ0UmlnaHRNb3Rpb25gIGVuYWJsZWQgYW5kIGV4ZWN1dGVkIGFzIHB1cmUtbW90aW9uIGluIGBub3JtYWwtbW9kZWAsXG4gICAgICAvLyAgIHdlIG5lZWQgdG8gbW92ZSAqKmFnYWluKiogdG8gd3JhcCB0byBuZXh0LWxpbmUgaWYgaXQgcmFjaGVkIHRvIEVPTC5cbiAgICAgIC8vIC0gRXhwcmVzc2lvbiBgIXRoaXMub3BlcmF0b3JgIG1lYW5zIG5vcm1hbC1tb2RlIG1vdGlvbi5cbiAgICAgIC8vIC0gRXhwcmVzc2lvbiBgdGhpcy5tb2RlID09PSBcIm5vcm1hbFwiYCBpcyBub3QgYXBwcm9wcmVhdGUgc2luY2UgaXQgbWF0Y2hlcyBgeGAgb3BlcmF0b3IncyB0YXJnZXQgY2FzZS5cbiAgICAgIGNvbnN0IG5lZWRNb3ZlQWdhaW4gPSBhbGxvd1dyYXAgJiYgIXRoaXMub3BlcmF0b3IgJiYgIWN1cnNvci5pc0F0RW5kT2ZMaW5lKClcblxuICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcblxuICAgICAgaWYgKG5lZWRNb3ZlQWdhaW4gJiYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IsIHthbGxvd1dyYXB9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVSaWdodEJ1ZmZlckNvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgKyB0aGlzLmdldENvdW50KCkpXG4gIH1cbn1cbk1vdmVSaWdodEJ1ZmZlckNvbHVtbi5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZVVwIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB3cmFwID0gZmFsc2VcblxuICBnZXRCdWZmZXJSb3cocm93KSB7XG4gICAgY29uc3QgbWluID0gMFxuICAgIHJvdyA9IHRoaXMud3JhcCAmJiByb3cgPT09IG1pbiA/IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpIDogdGhpcy51dGlscy5saW1pdE51bWJlcihyb3cgLSAxLCB7bWlufSlcbiAgICByZXR1cm4gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93KVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCB0aGlzLmdldEJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpKSlcbiAgfVxufVxuTW92ZVVwLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVVwV3JhcCBleHRlbmRzIE1vdmVVcCB7XG4gIHdyYXAgPSB0cnVlXG59XG5Nb3ZlVXBXcmFwLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZURvd24gZXh0ZW5kcyBNb3ZlVXAge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHdyYXAgPSBmYWxzZVxuXG4gIGdldEJ1ZmZlclJvdyhyb3cpIHtcbiAgICBpZiAodGhpcy5lZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpKSB7XG4gICAgICByb3cgPSB0aGlzLnV0aWxzLmdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyh0aGlzLmVkaXRvciwgcm93KS5lbmQucm93XG4gICAgfVxuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpXG4gICAgcmV0dXJuIHRoaXMud3JhcCAmJiByb3cgPj0gbWF4ID8gMCA6IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93ICsgMSwge21heH0pXG4gIH1cbn1cbk1vdmVEb3duLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZURvd25XcmFwIGV4dGVuZHMgTW92ZURvd24ge1xuICB3cmFwID0gdHJ1ZVxufVxuTW92ZURvd25XcmFwLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVVwU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBkaXJlY3Rpb24gPSBcInVwXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4gdGhpcy51dGlscy5tb3ZlQ3Vyc29yVXBTY3JlZW4oY3Vyc29yKSlcbiAgfVxufVxuTW92ZVVwU2NyZWVuLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZURvd25TY3JlZW4gZXh0ZW5kcyBNb3ZlVXBTY3JlZW4ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvckRvd25TY3JlZW4oY3Vyc29yKSlcbiAgfVxufVxuTW92ZURvd25TY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlIGRvd24vdXAgdG8gRWRnZVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2VlIHQ5bWQvYXRvbS12aW0tbW9kZS1wbHVzIzIzNlxuLy8gQXQgbGVhc3QgdjEuNy4wLiBidWZmZXJQb3NpdGlvbiBhbmQgc2NyZWVuUG9zaXRpb24gY2Fubm90IGNvbnZlcnQgYWNjdXJhdGVseVxuLy8gd2hlbiByb3cgaXMgZm9sZGVkLlxuY2xhc3MgTW92ZVVwVG9FZGdlIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBkaXJlY3Rpb24gPSBcInVwXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTY3JlZW5Qb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCB7Y29sdW1ufSA9IGZyb21Qb2ludFxuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMuZ2V0U2NhblJvd3MoZnJvbVBvaW50KSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pXG4gICAgICBpZiAodGhpcy5pc0VkZ2UocG9pbnQpKSByZXR1cm4gcG9pbnRcbiAgICB9XG4gIH1cblxuICBnZXRTY2FuUm93cyh7cm93fSkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJ1cFwiXG4gICAgICA/IHRoaXMudXRpbHMuZ2V0TGlzdCh0aGlzLnV0aWxzLmdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cgLSAxKSwgMCwgdHJ1ZSlcbiAgICAgIDogdGhpcy51dGlscy5nZXRMaXN0KHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIHJvdyArIDEpLCB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKSwgdHJ1ZSlcbiAgfVxuXG4gIGlzRWRnZShwb2ludCkge1xuICAgIGlmICh0aGlzLmlzU3RvcHBhYmxlUG9pbnQocG9pbnQpKSB7XG4gICAgICAvLyBJZiBvbmUgb2YgYWJvdmUvYmVsb3cgcG9pbnQgd2FzIG5vdCBzdG9wcGFibGUsIGl0J3MgRWRnZSFcbiAgICAgIGNvbnN0IGFib3ZlID0gcG9pbnQudHJhbnNsYXRlKFstMSwgMF0pXG4gICAgICBjb25zdCBiZWxvdyA9IHBvaW50LnRyYW5zbGF0ZShbKzEsIDBdKVxuICAgICAgcmV0dXJuICF0aGlzLmlzU3RvcHBhYmxlUG9pbnQoYWJvdmUpIHx8ICF0aGlzLmlzU3RvcHBhYmxlUG9pbnQoYmVsb3cpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGlzU3RvcHBhYmxlUG9pbnQocG9pbnQpIHtcbiAgICBpZiAodGhpcy5pc05vbldoaXRlU3BhY2VQb2ludChwb2ludCkgfHwgdGhpcy5pc0ZpcnN0Um93T3JMYXN0Um93QW5kU3RvcHBhYmxlKHBvaW50KSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGVmdFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgICBjb25zdCByaWdodFBvaW50ID0gcG9pbnQudHJhbnNsYXRlKFswLCArMV0pXG4gICAgICByZXR1cm4gdGhpcy5pc05vbldoaXRlU3BhY2VQb2ludChsZWZ0UG9pbnQpICYmIHRoaXMuaXNOb25XaGl0ZVNwYWNlUG9pbnQocmlnaHRQb2ludClcbiAgICB9XG4gIH1cblxuICBpc05vbldoaXRlU3BhY2VQb2ludChwb2ludCkge1xuICAgIGNvbnN0IGNoYXIgPSB0aGlzLnV0aWxzLmdldFRleHRJblNjcmVlblJhbmdlKHRoaXMuZWRpdG9yLCBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpKVxuICAgIHJldHVybiBjaGFyICE9IG51bGwgJiYgL1xcUy8udGVzdChjaGFyKVxuICB9XG5cbiAgaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludCkge1xuICAgIC8vIEluIG5vcm1hbC1tb2RlIHdlIGFkanVzdCBjdXJzb3IgYnkgbW92aW5nLWxlZnQgaWYgY3Vyc29yIGF0IEVPTCBvZiBub24tYmxhbmsgcm93LlxuICAgIC8vIFNvIGV4cGxpY2l0bHkgZ3VhcmQgdG8gbm90IGFuc3dlciBpdCBzdG9wcGFibGUuXG4gICAgaWYgKHRoaXMuaXNNb2RlKFwibm9ybWFsXCIpICYmIHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyh0aGlzLmVkaXRvciwgcG9pbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgcG9pbnQuaXNFcXVhbCh0aGlzLmVkaXRvci5jbGlwU2NyZWVuUG9zaXRpb24ocG9pbnQpKSAmJlxuICAgICAgICAocG9pbnQucm93ID09PSAwIHx8IHBvaW50LnJvdyA9PT0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCkpXG4gICAgICApXG4gICAgfVxuICB9XG59XG5Nb3ZlVXBUb0VkZ2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlRG93blRvRWRnZSBleHRlbmRzIE1vdmVVcFRvRWRnZSB7XG4gIGRpcmVjdGlvbiA9IFwiZG93blwiXG59XG5Nb3ZlRG93blRvRWRnZS5yZWdpc3RlcigpXG5cbi8vIHdvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuXG4gIGdldFBvaW50KHJlZ2V4LCBmcm9tKSB7XG4gICAgbGV0IHdvcmRSYW5nZVxuICAgIGxldCBmb3VuZCA9IGZhbHNlXG5cbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHJlZ2V4LCB7ZnJvbX0sICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pID0+IHtcbiAgICAgIHdvcmRSYW5nZSA9IHJhbmdlXG4gICAgICAvLyBJZ25vcmUgJ2VtcHR5IGxpbmUnIG1hdGNoZXMgYmV0d2VlbiAnXFxyJyBhbmQgJ1xcbidcbiAgICAgIGlmIChtYXRjaFRleHQgPT09IFwiXCIgJiYgcmFuZ2Uuc3RhcnQuY29sdW1uICE9PSAwKSByZXR1cm5cbiAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pKSB7XG4gICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICBzdG9wKClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICBjb25zdCBwb2ludCA9IHdvcmRSYW5nZS5zdGFydFxuICAgICAgcmV0dXJuIHRoaXMudXRpbHMucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyh0aGlzLmVkaXRvciwgcG9pbnQpICYmXG4gICAgICAgICFwb2ludC5pc0VxdWFsKHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSlcbiAgICAgICAgPyBwb2ludC50cmF2ZXJzZShbMSwgMF0pXG4gICAgICAgIDogcG9pbnRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHdvcmRSYW5nZSA/IHdvcmRSYW5nZS5lbmQgOiBmcm9tXG4gICAgfVxuICB9XG5cbiAgLy8gU3BlY2lhbCBjYXNlOiBcImN3XCIgYW5kIFwiY1dcIiBhcmUgdHJlYXRlZCBsaWtlIFwiY2VcIiBhbmQgXCJjRVwiIGlmIHRoZSBjdXJzb3IgaXNcbiAgLy8gb24gYSBub24tYmxhbmsuICBUaGlzIGlzIGJlY2F1c2UgXCJjd1wiIGlzIGludGVycHJldGVkIGFzIGNoYW5nZS13b3JkLCBhbmQgYVxuICAvLyB3b3JkIGRvZXMgbm90IGluY2x1ZGUgdGhlIGZvbGxvd2luZyB3aGl0ZSBzcGFjZS4gIHtWaTogXCJjd1wiIHdoZW4gb24gYSBibGFua1xuICAvLyBmb2xsb3dlZCBieSBvdGhlciBibGFua3MgY2hhbmdlcyBvbmx5IHRoZSBmaXJzdCBibGFuazsgdGhpcyBpcyBwcm9iYWJseSBhXG4gIC8vIGJ1ZywgYmVjYXVzZSBcImR3XCIgZGVsZXRlcyBhbGwgdGhlIGJsYW5rc31cbiAgLy9cbiAgLy8gQW5vdGhlciBzcGVjaWFsIGNhc2U6IFdoZW4gdXNpbmcgdGhlIFwid1wiIG1vdGlvbiBpbiBjb21iaW5hdGlvbiB3aXRoIGFuXG4gIC8vIG9wZXJhdG9yIGFuZCB0aGUgbGFzdCB3b3JkIG1vdmVkIG92ZXIgaXMgYXQgdGhlIGVuZCBvZiBhIGxpbmUsIHRoZSBlbmQgb2ZcbiAgLy8gdGhhdCB3b3JkIGJlY29tZXMgdGhlIGVuZCBvZiB0aGUgb3BlcmF0ZWQgdGV4dCwgbm90IHRoZSBmaXJzdCB3b3JkIGluIHRoZVxuICAvLyBuZXh0IGxpbmUuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGlmICh0aGlzLnV0aWxzLnBvaW50SXNBdFZpbUVuZE9mRmlsZSh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24pKSByZXR1cm5cblxuICAgIGNvbnN0IHdhc09uV2hpdGVTcGFjZSA9IHRoaXMudXRpbHMucG9pbnRJc09uV2hpdGVTcGFjZSh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24pXG4gICAgY29uc3QgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSA9IHRoaXMuaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSgpXG5cbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKHtpc0ZpbmFsfSkgPT4ge1xuICAgICAgY29uc3QgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHRoaXMudXRpbHMuaXNFbXB0eVJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSAmJiBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbi50cmF2ZXJzZShbMSwgMF0pKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVnZXggPSB0aGlzLndvcmRSZWdleCB8fCBjdXJzb3Iud29yZFJlZ0V4cCgpXG4gICAgICAgIGxldCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQocmVnZXgsIGN1cnNvclBvc2l0aW9uKVxuICAgICAgICBpZiAoaXNGaW5hbCAmJiBpc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKSB7XG4gICAgICAgICAgaWYgKHRoaXMub3BlcmF0b3IuaXMoXCJDaGFuZ2VcIikgJiYgIXdhc09uV2hpdGVTcGFjZSkge1xuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIHRoaXMudXRpbHMuZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbi5yb3cpKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuTW92ZVRvTmV4dFdvcmQucmVnaXN0ZXIoKVxuXG4vLyBiXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3b3JkUmVnZXggPSBudWxsXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9KVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c1dvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldvcmQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3b3JkUmVnZXggPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UoY3Vyc29yKVxuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihQb2ludC5taW4ocG9pbnQsIHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRoaXMubW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgICBpZiAob3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAvLyBSZXRyeSBmcm9tIHJpZ2h0IGNvbHVtbiBpZiBjdXJzb3Igd2FzIGFscmVhZHkgb24gRW5kT2ZXb3JkXG4gICAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgICAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb0VuZE9mV29yZC5yZWdpc3RlcigpXG5cbi8vIFtUT0RPOiBJbXByb3ZlLCBhY2N1cmFjeV1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgd29yZFJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIC8vIGlmIHdlJ3JlIGluIHRoZSBtaWRkbGUgb2YgYSB3b3JkIHRoZW4gd2UgbmVlZCB0byBtb3ZlIHRvIGl0cyBzdGFydFxuICAgIGxldCB0aW1lcyA9IHRoaXMuZ2V0Q291bnQoKVxuICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKHdvcmRSYW5nZS5zdGFydCkgJiYgY3Vyc29yUG9zaXRpb24uaXNMZXNzVGhhbih3b3JkUmFuZ2UuZW5kKSkge1xuICAgICAgdGltZXMgKz0gMVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgaSBpbiB0aGlzLnV0aWxzLmdldExpc3QoMSwgdGltZXMpKSB7XG4gICAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRCZWdpbm5pbmdPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIH1cblxuICAgIHRoaXMubW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpXG4gICAgaWYgKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpLmlzR3JlYXRlclRoYW5PckVxdWFsKGN1cnNvclBvc2l0aW9uKSkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcbiAgICB9XG4gIH1cblxuICBtb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcikge1xuICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihQb2ludC5taW4ocG9pbnQsIHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkLnJlZ2lzdGVyKClcblxuLy8gV2hvbGUgd29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFdob2xlV29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuTW92ZVRvTmV4dFdob2xlV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL14kfFxcUysvZ1xufVxuTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXFMrL1xufVxuTW92ZVRvRW5kT2ZXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG4vLyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNFbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbk1vdmVUb1ByZXZpb3VzRW5kT2ZXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG4vLyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dEFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL2dcbn1cbk1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5Nb3ZlVG9QcmV2aW91c0FscGhhbnVtZXJpY1dvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9cbn1cbk1vdmVUb0VuZE9mQWxwaGFudW1lcmljV29yZC5yZWdpc3RlcigpXG5cbi8vIEFscGhhbnVtZXJpYyB3b3JkIFtFeHBlcmltZW50YWxdXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0U21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9nXG59XG5Nb3ZlVG9OZXh0U21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1dvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cbk1vdmVUb1ByZXZpb3VzU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZTbWFydFdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cbk1vdmVUb0VuZE9mU21hcnRXb3JkLnJlZ2lzdGVyKClcblxuLy8gU3Vid29yZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFN1YndvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb05leHRTdWJ3b3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNTdWJ3b3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLndvcmRSZWdleCA9IGN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRW5kT2ZTdWJ3b3JkLnJlZ2lzdGVyKClcblxuLy8gU2VudGVuY2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlbnRlbmNlIGlzIGRlZmluZWQgYXMgYmVsb3dcbi8vICAtIGVuZCB3aXRoIFsnLicsICchJywgJz8nXVxuLy8gIC0gb3B0aW9uYWxseSBmb2xsb3dlZCBieSBbJyknLCAnXScsICdcIicsIFwiJ1wiXVxuLy8gIC0gZm9sbG93ZWQgYnkgWyckJywgJyAnLCAnXFx0J11cbi8vICAtIHBhcmFncmFwaCBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5XG4vLyAgLSBzZWN0aW9uIGJvdW5kYXJ5IGlzIGFsc28gc2VudGVuY2UgYm91bmRhcnkoaWdub3JlKVxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgc2VudGVuY2VSZWdleCA9IG5ldyBSZWdFeHAoYCg/OltcXFxcLiFcXFxcP11bXFxcXClcXFxcXVwiJ10qXFxcXHMrKXwoXFxcXG58XFxcXHJcXFxcbilgLCBcImdcIilcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJuZXh0XCJcbiAgICAgID8gdGhpcy5nZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcbiAgICAgIDogdGhpcy5nZXRQcmV2aW91c1N0YXJ0T2ZTZW50ZW5jZShmcm9tUG9pbnQpXG4gIH1cblxuICBpc0JsYW5rUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgfVxuXG4gIGdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbSkge1xuICAgIGxldCBmb3VuZFBvaW50XG4gICAgdGhpcy5zY2FuRm9yd2FyZCh0aGlzLnNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBtYXRjaCwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddXG4gICAgICAgIGlmICh0aGlzLnNraXBCbGFua1JvdyAmJiB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpICE9PSB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkge1xuICAgICAgICAgIGZvdW5kUG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgICBpZiAoZm91bmRQb2ludCkgc3RvcCgpXG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQb2ludCB8fCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGZyb20pIHtcbiAgICBsZXQgZm91bmRQb2ludFxuICAgIHRoaXMuc2NhbkJhY2t3YXJkKHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIG1hdGNoLCBzdG9wfSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd11cbiAgICAgICAgaWYgKCF0aGlzLmlzQmxhbmtSb3coZW5kUm93KSAmJiB0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpKSB7XG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICAgIGlmIChwb2ludC5pc0xlc3NUaGFuKGZyb20pKSB7XG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gcG9pbnRcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2tpcEJsYW5rUm93KSByZXR1cm5cbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSkpIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZFBvaW50KSBzdG9wKClcbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFBvaW50IHx8IFswLCAwXVxuICB9XG59XG5Nb3ZlVG9OZXh0U2VudGVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5Nb3ZlVG9QcmV2aW91c1NlbnRlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5Nb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93LnJlZ2lzdGVyKClcblxuLy8gUGFyYWdyYXBoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gZnJvbVBvaW50LnJvd1xuICAgIGxldCB3YXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsoc3RhcnRSb3cpXG4gICAgZm9yIChjb25zdCByb3cgb2YgdGhpcy51dGlscy5nZXRCdWZmZXJSb3dzKHRoaXMuZWRpdG9yLCB7c3RhcnRSb3csIGRpcmVjdGlvbjogdGhpcy5kaXJlY3Rpb259KSkge1xuICAgICAgY29uc3QgaXNCbGFua1JvdyA9IHRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgaWYgKCF3YXNCbGFua1JvdyAmJiBpc0JsYW5rUm93KSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQocm93LCAwKVxuICAgICAgfVxuICAgICAgd2FzQmxhbmtSb3cgPSBpc0JsYW5rUm93XG4gICAgfVxuXG4gICAgLy8gZmFsbGJhY2tcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IFwicHJldmlvdXNcIiA/IG5ldyBQb2ludCgwLCAwKSA6IHRoaXMuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oKVxuICB9XG59XG5Nb3ZlVG9OZXh0UGFyYWdyYXBoLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5Nb3ZlVG9QcmV2aW91c1BhcmFncmFwaC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIDApXG4gIH1cbn1cbk1vdmVUb0JlZ2lubmluZ09mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0NvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy51dGlscy5zZXRCdWZmZXJDb2x1bW4oY3Vyc29yLCB0aGlzLmdldENvdW50KC0xKSlcbiAgfVxufVxuTW92ZVRvQ29sdW1uLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBnZXRQb2ludCh7cm93fSkge1xuICAgIHJvdyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93ICsgdGhpcy5nZXRDb3VudCgtMSksIHttYXg6IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpfSlcbiAgICBjb25zdCByYW5nZSA9IHRoaXMudXRpbHMuZmluZFJhbmdlSW5CdWZmZXJSb3codGhpcy5lZGl0b3IsIC9cXFN8Xi8sIHJvdywge2RpcmVjdGlvbjogXCJiYWNrd2FyZFwifSlcbiAgICByZXR1cm4gcmFuZ2UgPyByYW5nZS5zdGFydCA6IG5ldyBQb2ludChyb3csIDApXG4gIH1cbn1cbk1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkgLSAxKVxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZURvd24gZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHBvaW50LnJvdyA8IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5tb3ZlQ3Vyc29yKGN1cnNvcilcbiAgfVxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIHtcbiAgZ2V0Q291bnQoKSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9TY3JlZW5Db2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93T2ZmU2NyZWVuUG9zaXRpb24gPSB0aGlzLmdldENvbmZpZyhcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uXCIpXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnV0aWxzLmdldFNjcmVlblBvc2l0aW9uRm9yU2NyZWVuUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0U2NyZWVuUm93KCksIHRoaXMud2hpY2gsIHtcbiAgICAgIGFsbG93T2ZmU2NyZWVuUG9zaXRpb24sXG4gICAgfSlcbiAgICB0aGlzLnNldFNjcmVlblBvc2l0aW9uU2FmZWx5KGN1cnNvciwgcG9pbnQpXG4gIH1cbn1cbk1vdmVUb1NjcmVlbkNvbHVtbi5yZWdpc3RlcihmYWxzZSlcblxuLy8ga2V5bWFwOiBnIDBcbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJiZWdpbm5pbmdcIlxufVxuTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lLnJlZ2lzdGVyKClcblxuLy8gZyBeOiBgbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2Ytc2NyZWVuLWxpbmVgXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJmaXJzdC1jaGFyYWN0ZXJcIlxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGcgJFxuY2xhc3MgTW92ZVRvTGFzdENoYXJhY3Rlck9mU2NyZWVuTGluZSBleHRlbmRzIE1vdmVUb1NjcmVlbkNvbHVtbiB7XG4gIHdoaWNoID0gXCJsYXN0LWNoYXJhY3RlclwiXG59XG5Nb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyh0aGlzLmdldFJvdygpKSlcbiAgICBjdXJzb3IuYXV0b3Njcm9sbCh7Y2VudGVyOiB0cnVlfSlcbiAgfVxuXG4gIGdldFJvdygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvRmlyc3RMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBHXG5jbGFzcyBNb3ZlVG9MYXN0TGluZSBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGRlZmF1bHRDb3VudCA9IEluZmluaXR5XG59XG5Nb3ZlVG9MYXN0TGluZS5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogTiUgZS5nLiAxMCVcbmNsYXNzIE1vdmVUb0xpbmVCeVBlcmNlbnQgZXh0ZW5kcyBNb3ZlVG9GaXJzdExpbmUge1xuICBnZXRSb3coKSB7XG4gICAgY29uc3QgcGVyY2VudCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgpLCB7bWF4OiAxMDB9KVxuICAgIHJldHVybiBNYXRoLmZsb29yKCh0aGlzLmVkaXRvci5nZXRMaW5lQ291bnQoKSAtIDEpICogKHBlcmNlbnQgLyAxMDApKVxuICB9XG59XG5Nb3ZlVG9MaW5lQnlQZXJjZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUmVsYXRpdmVMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBtb3ZlU3VjY2Vzc09uTGluZXdpc2UgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBsZXQgcm93XG4gICAgbGV0IGNvdW50ID0gdGhpcy5nZXRDb3VudCgpXG4gICAgaWYgKGNvdW50IDwgMCkge1xuICAgICAgLy8gU3VwcG9ydCBuZWdhdGl2ZSBjb3VudFxuICAgICAgLy8gTmVnYXRpdmUgY291bnQgY2FuIGJlIHBhc3NlZCBsaWtlIGBvcGVyYXRpb25TdGFjay5ydW4oXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIiwge2NvdW50OiAtNX0pYC5cbiAgICAgIC8vIEN1cnJlbnRseSB1c2VkIGluIHZpbS1tb2RlLXBsdXMtZXgtbW9kZSBwa2cuXG4gICAgICBjb3VudCArPSAxXG4gICAgICByb3cgPSB0aGlzLmdldEZvbGRTdGFydFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQrKyA8IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdyAtIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50IC09IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgICB3aGlsZSAoY291bnQtLSA+IDApIHJvdyA9IHRoaXMuZ2V0Rm9sZEVuZFJvd0ZvclJvdyhyb3cgKyAxKVxuICAgIH1cbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlclJvdyhjdXJzb3IsIHJvdylcbiAgfVxufVxuTW92ZVRvUmVsYXRpdmVMaW5lLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvIGV4dGVuZHMgTW92ZVRvUmVsYXRpdmVMaW5lIHtcbiAgZ2V0Q291bnQoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHN1cGVyLmdldENvdW50KC4uLmFyZ3MpLCB7bWluOiAyfSlcbiAgfVxufVxuTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bVR3by5yZWdpc3RlcihmYWxzZSlcblxuLy8gUG9zaXRpb24gY3Vyc29yIHdpdGhvdXQgc2Nyb2xsaW5nLiwgSCwgTSwgTFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiBIXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgc2Nyb2xsb2ZmID0gMlxuICBkZWZhdWx0Q291bnQgPSAwXG4gIHZlcnRpY2FsTW90aW9uID0gdHJ1ZVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHRoaXMuZ2V0U2NyZWVuUm93KCkpXG4gICAgdGhpcy5zZXRDdXJzb3JCdWZmZXJSb3coY3Vyc29yLCBidWZmZXJSb3cpXG4gIH1cblxuICBnZXRTY3JvbGxvZmYoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSgpID8gMCA6IHRoaXMuc2Nyb2xsb2ZmXG4gIH1cblxuICBnZXRTY3JlZW5Sb3coKSB7XG4gICAgY29uc3QgZmlyc3RSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldFNjcm9sbG9mZigpXG4gICAgaWYgKGZpcnN0Um93ID09PSAwKSB7XG4gICAgICBvZmZzZXQgPSAwXG4gICAgfVxuICAgIG9mZnNldCA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5nZXRDb3VudCgtMSksIHttaW46IG9mZnNldH0pXG4gICAgcmV0dXJuIGZpcnN0Um93ICsgb2Zmc2V0XG4gIH1cbn1cbk1vdmVUb1RvcE9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBNXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuIHtcbiAgZ2V0U2NyZWVuUm93KCkge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBjb25zdCBlbmRSb3cgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpfSlcbiAgICByZXR1cm4gc3RhcnRSb3cgKyBNYXRoLmZsb29yKChlbmRSb3cgLSBzdGFydFJvdykgLyAyKVxuICB9XG59XG5Nb3ZlVG9NaWRkbGVPZlNjcmVlbi5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogTFxuY2xhc3MgTW92ZVRvQm90dG9tT2ZTY3JlZW4gZXh0ZW5kcyBNb3ZlVG9Ub3BPZlNjcmVlbiB7XG4gIGdldFNjcmVlblJvdygpIHtcbiAgICBjb25zdCB2aW1MYXN0U2NyZWVuUm93ID0gdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KClcbiAgICBjb25zdCByb3cgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCksIHttYXg6IHZpbUxhc3RTY3JlZW5Sb3d9KVxuICAgIGxldCBvZmZzZXQgPSB0aGlzLmdldFNjcm9sbG9mZigpICsgMVxuICAgIGlmIChyb3cgPT09IHZpbUxhc3RTY3JlZW5Sb3cpIHtcbiAgICAgIG9mZnNldCA9IDBcbiAgICB9XG4gICAgb2Zmc2V0ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KC0xKSwge21pbjogb2Zmc2V0fSlcbiAgICByZXR1cm4gcm93IC0gb2Zmc2V0XG4gIH1cbn1cbk1vdmVUb0JvdHRvbU9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8gU2Nyb2xsaW5nXG4vLyBIYWxmOiBjdHJsLWQsIGN0cmwtdVxuLy8gRnVsbDogY3RybC1mLCBjdHJsLWJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtGSVhNRV0gY291bnQgYmVoYXZlIGRpZmZlcmVudGx5IGZyb20gb3JpZ2luYWwgVmltLlxuY2xhc3MgU2Nyb2xsIGV4dGVuZHMgTW90aW9uIHtcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgaXNTbW9vdGhTY3JvbGxFbmFibGVkKCkge1xuICAgIHJldHVybiBNYXRoLmFicyh0aGlzLmFtb3VudE9mUGFnZSkgPT09IDFcbiAgICAgID8gdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkZ1bGxTY3JvbGxNb3Rpb25cIilcbiAgICAgIDogdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25cIilcbiAgfVxuXG4gIGdldFNtb290aFNjcm9sbER1YXRpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHRoaXMuYW1vdW50T2ZQYWdlKSA9PT0gMVxuICAgICAgPyB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvbkR1cmF0aW9uXCIpXG4gICAgICA6IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25IYWxmU2Nyb2xsTW90aW9uRHVyYXRpb25cIilcbiAgfVxuXG4gIGdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHJvdykge1xuICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHJvdywgMClcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuZWxlbWVudC5waXhlbFJlY3RGb3JTY3JlZW5SYW5nZShuZXcgUmFuZ2UocG9pbnQsIHBvaW50KSkudG9wXG4gIH1cblxuICBzbW9vdGhTY3JvbGwoZnJvbVJvdywgdG9Sb3csIGRvbmUpIHtcbiAgICBjb25zdCB0b3BQaXhlbEZyb20gPSB7dG9wOiB0aGlzLmdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KGZyb21Sb3cpfVxuICAgIGNvbnN0IHRvcFBpeGVsVG8gPSB7dG9wOiB0aGlzLmdldFBpeGVsUmVjdFRvcEZvclNjZWVuUm93KHRvUm93KX1cbiAgICAvLyBbTk9URV1cbiAgICAvLyBpbnRlbnRpb25hbGx5IHVzZSBgZWxlbWVudC5jb21wb25lbnQuc2V0U2Nyb2xsVG9wYCBpbnN0ZWFkIG9mIGBlbGVtZW50LnNldFNjcm9sbFRvcGAuXG4gICAgLy8gU0luY2UgZWxlbWVudC5zZXRTY3JvbGxUb3Agd2lsbCB0aHJvdyBleGNlcHRpb24gd2hlbiBlbGVtZW50LmNvbXBvbmVudCBubyBsb25nZXIgZXhpc3RzLlxuICAgIGNvbnN0IHN0ZXAgPSBuZXdUb3AgPT4ge1xuICAgICAgaWYgKHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnNldFNjcm9sbFRvcChuZXdUb3ApXG4gICAgICAgIHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGR1cmF0aW9uID0gdGhpcy5nZXRTbW9vdGhTY3JvbGxEdWF0aW9uKClcbiAgICB0aGlzLnZpbVN0YXRlLnJlcXVlc3RTY3JvbGxBbmltYXRpb24odG9wUGl4ZWxGcm9tLCB0b3BQaXhlbFRvLCB7ZHVyYXRpb24sIHN0ZXAsIGRvbmV9KVxuICB9XG5cbiAgZ2V0QW1vdW50T2ZSb3dzKCkge1xuICAgIHJldHVybiBNYXRoLmNlaWwodGhpcy5hbW91bnRPZlBhZ2UgKiB0aGlzLmVkaXRvci5nZXRSb3dzUGVyUGFnZSgpICogdGhpcy5nZXRDb3VudCgpKVxuICB9XG5cbiAgZ2V0QnVmZmVyUm93KGN1cnNvcikge1xuICAgIGNvbnN0IHNjcmVlblJvdyA9IHRoaXMudXRpbHMuZ2V0VmFsaWRWaW1TY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSArIHRoaXMuZ2V0QW1vdW50T2ZSb3dzKCkpXG4gICAgcmV0dXJuIHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzY3JlZW5Sb3cpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGJ1ZmZlclJvdyA9IHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvcilcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIHRoaXMuZ2V0QnVmZmVyUm93KGN1cnNvciksIHthdXRvc2Nyb2xsOiBmYWxzZX0pXG5cbiAgICBpZiAoY3Vyc29yLmlzTGFzdEN1cnNvcigpKSB7XG4gICAgICBpZiAodGhpcy5pc1Ntb290aFNjcm9sbEVuYWJsZWQoKSkgdGhpcy52aW1TdGF0ZS5maW5pc2hTY3JvbGxBbmltYXRpb24oKVxuXG4gICAgICBjb25zdCBmaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gdGhpcy5lZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGNvbnN0IG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cgPSB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coXG4gICAgICAgIGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgKyB0aGlzLmdldEFtb3VudE9mUm93cygpXG4gICAgICApXG4gICAgICBjb25zdCBuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93ID0gdGhpcy5lZGl0b3Iuc2NyZWVuUm93Rm9yQnVmZmVyUm93KG5ld0ZpcnN0VmlzaWJpbGVCdWZmZXJSb3cpXG4gICAgICBjb25zdCBkb25lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdylcbiAgICAgICAgLy8gW0ZJWE1FXSBzb21ldGltZXMsIHNjcm9sbFRvcCBpcyBub3QgdXBkYXRlZCwgY2FsbGluZyB0aGlzIGZpeC5cbiAgICAgICAgLy8gSW52ZXN0aWdhdGUgYW5kIGZpbmQgYmV0dGVyIGFwcHJvYWNoIHRoZW4gcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZC5cbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50KSB0aGlzLmVkaXRvci5lbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuaXNTbW9vdGhTY3JvbGxFbmFibGVkKCkpIHRoaXMuc21vb3RoU2Nyb2xsKGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3csIGRvbmUpXG4gICAgICBlbHNlIGRvbmUoKVxuICAgIH1cbiAgfVxufVxuU2Nyb2xsLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGN0cmwtZlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlbkRvd24gZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSArMVxufVxuU2Nyb2xsRnVsbFNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtYlxuY2xhc3MgU2Nyb2xsRnVsbFNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTFcbn1cblNjcm9sbEZ1bGxTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogY3RybC1kXG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9ICsxIC8gMlxufVxuU2Nyb2xsSGFsZlNjcmVlbkRvd24ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IGN0cmwtdVxuY2xhc3MgU2Nyb2xsSGFsZlNjcmVlblVwIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gLTEgLyAyXG59XG5TY3JvbGxIYWxmU2NyZWVuVXAucmVnaXN0ZXIoKVxuXG4vLyBGaW5kXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IGZcbmNsYXNzIEZpbmQgZXh0ZW5kcyBNb3Rpb24ge1xuICBiYWNrd2FyZHMgPSBmYWxzZVxuICBpbmNsdXNpdmUgPSB0cnVlXG4gIG9mZnNldCA9IDBcbiAgcmVxdWlyZUlucHV0ID0gdHJ1ZVxuICBjYXNlU2Vuc2l0aXZpdHlLaW5kID0gXCJGaW5kXCJcblxuICByZXN0b3JlRWRpdG9yU3RhdGUoKSB7XG4gICAgaWYgKHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSkgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKClcbiAgICB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUgPSBudWxsXG4gIH1cblxuICBjYW5jZWxPcGVyYXRpb24oKSB7XG4gICAgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHN1cGVyLmNhbmNlbE9wZXJhdGlvbigpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLmdldENvbmZpZyhcInJldXNlRmluZEZvclJlcGVhdEZpbmRcIikpIHRoaXMucmVwZWF0SWZOZWNlc3NhcnkoKVxuICAgIGlmICghdGhpcy5pc0NvbXBsZXRlKCkpIHtcbiAgICAgIGNvbnN0IGNoYXJzTWF4ID0gdGhpcy5nZXRDb25maWcoXCJmaW5kQ2hhcnNNYXhcIilcbiAgICAgIGNvbnN0IG9wdGlvbnNCYXNlID0ge3B1cnBvc2U6IFwiZmluZFwiLCBjaGFyc01heH1cblxuICAgICAgaWYgKGNoYXJzTWF4ID09PSAxKSB7XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChvcHRpb25zQmFzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IHRoaXMudXRpbHMuc2F2ZUVkaXRvclN0YXRlKHRoaXMuZWRpdG9yKVxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIGF1dG9Db25maXJtVGltZW91dDogdGhpcy5nZXRDb25maWcoXCJmaW5kQ29uZmlybUJ5VGltZW91dFwiKSxcbiAgICAgICAgICBvbkNvbmZpcm06IGlucHV0ID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dFxuICAgICAgICAgICAgaWYgKGlucHV0KSB0aGlzLnByb2Nlc3NPcGVyYXRpb24oKVxuICAgICAgICAgICAgZWxzZSB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbkNoYW5nZTogcHJlQ29uZmlybWVkQ2hhcnMgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyA9IHByZUNvbmZpcm1lZENoYXJzXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5wcmVDb25maXJtZWRDaGFycywgXCJwcmUtY29uZmlybVwiLCB0aGlzLmlzQmFja3dhcmRzKCkpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbkNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy52aW1TdGF0ZS5oaWdobGlnaHRGaW5kLmNsZWFyTWFya2VycygpXG4gICAgICAgICAgICB0aGlzLmNhbmNlbE9wZXJhdGlvbigpXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb21tYW5kczoge1xuICAgICAgICAgICAgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCI6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgrMSksXG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1wcmV2aW91cy1wcmUtY29uZmlybWVkXCI6ICgpID0+IHRoaXMuZmluZFByZUNvbmZpcm1lZCgtMSksXG4gICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZvY3VzSW5wdXQoT2JqZWN0LmFzc2lnbihvcHRpb25zLCBvcHRpb25zQmFzZSkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIGZpbmRQcmVDb25maXJtZWQoZGVsdGEpIHtcbiAgICBpZiAodGhpcy5wcmVDb25maXJtZWRDaGFycyAmJiB0aGlzLmdldENvbmZpZyhcImhpZ2hsaWdodEZpbmRDaGFyXCIpKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyhcbiAgICAgICAgdGhpcy5wcmVDb25maXJtZWRDaGFycyxcbiAgICAgICAgXCJwcmUtY29uZmlybVwiLFxuICAgICAgICB0aGlzLmlzQmFja3dhcmRzKCksXG4gICAgICAgIHRoaXMuZ2V0Q291bnQoLTEpICsgZGVsdGEsXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICAgIHRoaXMuY291bnQgPSBpbmRleCArIDFcbiAgICB9XG4gIH1cblxuICByZXBlYXRJZk5lY2Vzc2FyeSgpIHtcbiAgICBjb25zdCBmaW5kQ29tbWFuZE5hbWVzID0gW1wiRmluZFwiLCBcIkZpbmRCYWNrd2FyZHNcIiwgXCJUaWxsXCIsIFwiVGlsbEJhY2t3YXJkc1wiXVxuICAgIGNvbnN0IGN1cnJlbnRGaW5kID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJjdXJyZW50RmluZFwiKVxuICAgIGlmIChjdXJyZW50RmluZCAmJiBmaW5kQ29tbWFuZE5hbWVzLmluY2x1ZGVzKHRoaXMudmltU3RhdGUub3BlcmF0aW9uU3RhY2suZ2V0TGFzdENvbW1hbmROYW1lKCkpKSB7XG4gICAgICB0aGlzLmlucHV0ID0gY3VycmVudEZpbmQuaW5wdXRcbiAgICAgIHRoaXMucmVwZWF0ZWQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgaXNCYWNrd2FyZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFja3dhcmRzXG4gIH1cblxuICBleGVjdXRlKCkge1xuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICAgIGxldCBkZWNvcmF0aW9uVHlwZSA9IFwicG9zdC1jb25maXJtXCJcbiAgICBpZiAodGhpcy5vcGVyYXRvciAmJiAhdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSkge1xuICAgICAgZGVjb3JhdGlvblR5cGUgKz0gXCIgbG9uZ1wiXG4gICAgfVxuXG4gICAgLy8gSEFDSzogV2hlbiByZXBlYXRlZCBieSBcIixcIiwgdGhpcy5iYWNrd2FyZHMgaXMgdGVtcG9yYXJ5IGludmVydGVkIGFuZFxuICAgIC8vIHJlc3RvcmVkIGFmdGVyIGV4ZWN1dGlvbiBmaW5pc2hlZC5cbiAgICAvLyBCdXQgZmluYWwgaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyBpcyBleGVjdXRlZCBpbiBhc3luYyg9YWZ0ZXIgb3BlcmF0aW9uIGZpbmlzaGVkKS5cbiAgICAvLyBUaHVzIHdlIG5lZWQgdG8gcHJlc2VydmUgYmVmb3JlIHJlc3RvcmVkIGBiYWNrd2FyZHNgIHZhbHVlIGFuZCBwYXNzIGl0LlxuICAgIGNvbnN0IGJhY2t3YXJkcyA9IHRoaXMuaXNCYWNrd2FyZHMoKVxuICAgIHRoaXMuZWRpdG9yLmNvbXBvbmVudC5nZXROZXh0VXBkYXRlUHJvbWlzZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRoaXMuaW5wdXQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGZyb21Qb2ludC5yb3cpXG4gICAgY29uc3QgcG9pbnRzID0gW11cbiAgICBjb25zdCByZWdleCA9IHRoaXMuZ2V0UmVnZXgodGhpcy5pbnB1dClcbiAgICBjb25zdCBpbmRleFdhbnRBY2Nlc3MgPSB0aGlzLmdldENvdW50KC0xKVxuXG4gICAgY29uc3QgdHJhbnNsYXRpb24gPSBuZXcgUG9pbnQoMCwgdGhpcy5pc0JhY2t3YXJkcygpID8gdGhpcy5vZmZzZXQgOiAtdGhpcy5vZmZzZXQpXG4gICAgaWYgKHRoaXMucmVwZWF0ZWQpIHtcbiAgICAgIGZyb21Qb2ludCA9IGZyb21Qb2ludC50cmFuc2xhdGUodHJhbnNsYXRpb24ubmVnYXRlKCkpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNCYWNrd2FyZHMoKSkge1xuICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmluZEFjcm9zc0xpbmVzXCIpKSBzY2FuUmFuZ2Uuc3RhcnQgPSBQb2ludC5aRVJPXG5cbiAgICAgIHRoaXMuZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykge1xuICAgICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5lbmQgPSB0aGlzLmVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4gICAgICB0aGlzLmVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShyZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBzdG9wfSkgPT4ge1xuICAgICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2gocmFuZ2Uuc3RhcnQpXG4gICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPiBpbmRleFdhbnRBY2Nlc3MpIHtcbiAgICAgICAgICAgIHN0b3AoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBwb2ludCA9IHBvaW50c1tpbmRleFdhbnRBY2Nlc3NdXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnQudHJhbnNsYXRlKHRyYW5zbGF0aW9uKVxuICB9XG5cbiAgLy8gRklYTUU6IGJhZCBuYW1pbmcsIHRoaXMgZnVuY3Rpb24gbXVzdCByZXR1cm4gaW5kZXhcbiAgaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0ZXh0LCBkZWNvcmF0aW9uVHlwZSwgYmFja3dhcmRzLCBpbmRleCA9IHRoaXMuZ2V0Q291bnQoLTEpLCBhZGp1c3RJbmRleCA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmdldENvbmZpZyhcImhpZ2hsaWdodEZpbmRDaGFyXCIpKSByZXR1cm5cblxuICAgIHJldHVybiB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuaGlnaGxpZ2h0Q3Vyc29yUm93cyhcbiAgICAgIHRoaXMuZ2V0UmVnZXgodGV4dCksXG4gICAgICBkZWNvcmF0aW9uVHlwZSxcbiAgICAgIGJhY2t3YXJkcyxcbiAgICAgIHRoaXMub2Zmc2V0LFxuICAgICAgaW5kZXgsXG4gICAgICBhZGp1c3RJbmRleFxuICAgIClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChwb2ludCkgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgIGVsc2UgdGhpcy5yZXN0b3JlRWRpdG9yU3RhdGUoKVxuXG4gICAgaWYgKCF0aGlzLnJlcGVhdGVkKSB0aGlzLmdsb2JhbFN0YXRlLnNldChcImN1cnJlbnRGaW5kXCIsIHRoaXMpXG4gIH1cblxuICBnZXRSZWdleCh0ZXJtKSB7XG4gICAgY29uc3QgbW9kaWZpZXJzID0gdGhpcy5pc0Nhc2VTZW5zaXRpdmUodGVybSkgPyBcImdcIiA6IFwiZ2lcIlxuICAgIHJldHVybiBuZXcgUmVnRXhwKF8uZXNjYXBlUmVnRXhwKHRlcm0pLCBtb2RpZmllcnMpXG4gIH1cbn1cbkZpbmQucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IEZcbmNsYXNzIEZpbmRCYWNrd2FyZHMgZXh0ZW5kcyBGaW5kIHtcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuRmluZEJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogdFxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmQge1xuICBvZmZzZXQgPSAxXG4gIGdldFBvaW50KC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwb2ludCA9IHN1cGVyLmdldFBvaW50KC4uLmFyZ3MpXG4gICAgdGhpcy5tb3ZlU3VjY2VlZGVkID0gcG9pbnQgIT0gbnVsbFxuICAgIHJldHVybiBwb2ludFxuICB9XG59XG5UaWxsLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBUXG5jbGFzcyBUaWxsQmFja3dhcmRzIGV4dGVuZHMgVGlsbCB7XG4gIGluY2x1c2l2ZSA9IGZhbHNlXG4gIGJhY2t3YXJkcyA9IHRydWVcbn1cblRpbGxCYWNrd2FyZHMucmVnaXN0ZXIoKVxuXG4vLyBNYXJrXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IGBcbmNsYXNzIE1vdmVUb01hcmsgZXh0ZW5kcyBNb3Rpb24ge1xuICBqdW1wID0gdHJ1ZVxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGlucHV0ID0gbnVsbFxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKCF0aGlzLmlzQ29tcGxldGUoKSkgdGhpcy5yZWFkQ2hhcigpXG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZ2V0UG9pbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUubWFyay5nZXQodGhpcy5pbnB1dClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KClcbiAgICBpZiAocG9pbnQpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICAgIGN1cnNvci5hdXRvc2Nyb2xsKHtjZW50ZXI6IHRydWV9KVxuICAgIH1cbiAgfVxufVxuTW92ZVRvTWFyay5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogJ1xuY2xhc3MgTW92ZVRvTWFya0xpbmUgZXh0ZW5kcyBNb3ZlVG9NYXJrIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFBvaW50KCkge1xuICAgIGNvbnN0IHBvaW50ID0gc3VwZXIuZ2V0UG9pbnQoKVxuICAgIGlmIChwb2ludCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgfVxuICB9XG59XG5Nb3ZlVG9NYXJrTGluZS5yZWdpc3RlcigpXG5cbi8vIEZvbGRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIHdoaWNoID0gXCJzdGFydFwiXG4gIGRpcmVjdGlvbiA9IFwicHJldlwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnJvd3MgPSB0aGlzLmdldEZvbGRSb3dzKHRoaXMud2hpY2gpXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZcIikgdGhpcy5yb3dzLnJldmVyc2UoKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cblxuICBnZXRGb2xkUm93cyh3aGljaCkge1xuICAgIGNvbnN0IGluZGV4ID0gd2hpY2ggPT09IFwic3RhcnRcIiA/IDAgOiAxXG4gICAgY29uc3Qgcm93cyA9IHRoaXMudXRpbHMuZ2V0Q29kZUZvbGRSb3dSYW5nZXModGhpcy5lZGl0b3IpLm1hcChyb3dSYW5nZSA9PiByb3dSYW5nZVtpbmRleF0pXG4gICAgcmV0dXJuIF8uc29ydEJ5KF8udW5pcShyb3dzKSwgcm93ID0+IHJvdylcbiAgfVxuXG4gIGdldFNjYW5Sb3dzKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGNvbnN0IGlzVmFsZCA9IHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZcIiA/IHJvdyA9PiByb3cgPCBjdXJzb3JSb3cgOiByb3cgPT4gcm93ID4gY3Vyc29yUm93XG4gICAgcmV0dXJuIHRoaXMucm93cy5maWx0ZXIoaXNWYWxkKVxuICB9XG5cbiAgZGV0ZWN0Um93KGN1cnNvcikge1xuICAgIHJldHVybiB0aGlzLmdldFNjYW5Sb3dzKGN1cnNvcilbMF1cbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZGV0ZWN0Um93KGN1cnNvcilcbiAgICAgIGlmIChyb3cgIT0gbnVsbCkgdGhpcy51dGlscy5tb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93KGN1cnNvciwgcm93KVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgY29uc3QgYmFzZUluZGVudExldmVsID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKVxuICAgIHJldHVybiB0aGlzLmdldFNjYW5Sb3dzKGN1cnNvcikuZmluZChyb3cgPT4gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSA9PT0gYmFzZUluZGVudExldmVsKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRTdGFydFdpdGhTYW1lSW5kZW50IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnRXaXRoU2FtZUluZGVudCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIHdoaWNoID0gXCJlbmRcIlxufVxuTW92ZVRvUHJldmlvdXNGb2xkRW5kLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dEZvbGRFbmQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRFbmQge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZvbGRFbmQucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkaXJlY3Rpb24gPSBcInByZXZcIlxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3codGhpcy5lZGl0b3IsIHJvdykpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0RnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0Z1bmN0aW9uIHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGdW5jdGlvbi5yZWdpc3RlcigpXG5cbi8vIFNjb3BlIGJhc2VkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUgZXh0ZW5kcyBNb3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcIi5cIlxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlKHRoaXMuZWRpdG9yLCBmcm9tUG9pbnQsIHRoaXMuZGlyZWN0aW9uLCB0aGlzLnNjb3BlKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb1Bvc2l0aW9uQnlTY29wZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcInN0cmluZy5iZWdpblwiXG59XG5Nb3ZlVG9QcmV2aW91c1N0cmluZy5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRTdHJpbmcgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c1N0cmluZyB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5Nb3ZlVG9OZXh0U3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNOdW1iZXIgZXh0ZW5kcyBNb3ZlVG9Qb3NpdGlvbkJ5U2NvcGUge1xuICBkaXJlY3Rpb24gPSBcImJhY2t3YXJkXCJcbiAgc2NvcGUgPSBcImNvbnN0YW50Lm51bWVyaWNcIlxufVxuTW92ZVRvUHJldmlvdXNOdW1iZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0TnVtYmVyIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNOdW1iZXIge1xuICBkaXJlY3Rpb24gPSBcImZvcndhcmRcIlxufVxuTW92ZVRvTmV4dE51bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRPY2N1cnJlbmNlIGV4dGVuZHMgTW90aW9uIHtcbiAgLy8gRW5zdXJlIHRoaXMgY29tbWFuZCBpcyBhdmFpbGFibGUgd2hlbiBvbmx5IGhhcy1vY2N1cnJlbmNlXG4gIHN0YXRpYyBjb21tYW5kU2NvcGUgPSBcImF0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5oYXMtb2NjdXJyZW5jZVwiXG4gIGp1bXAgPSB0cnVlXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnJhbmdlcyA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyh0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKS5tYXAobWFya2VyID0+IG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLnJhbmdlc1t0aGlzLnV0aWxzLmdldEluZGV4KHRoaXMuZ2V0SW5kZXgoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpLCB0aGlzLnJhbmdlcyldXG4gICAgY29uc3QgcG9pbnQgPSByYW5nZS5zdGFydFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludCwge2F1dG9zY3JvbGw6IGZhbHNlfSlcblxuICAgIGlmIChjdXJzb3IuaXNMYXN0Q3Vyc29yKCkpIHtcbiAgICAgIHRoaXMuZWRpdG9yLnVuZm9sZEJ1ZmZlclJvdyhwb2ludC5yb3cpXG4gICAgICB0aGlzLnV0aWxzLnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgcG9pbnQpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk1vdmVUb09jY3VycmVuY2VcIikpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2UsIHt0eXBlOiBcInNlYXJjaFwifSlcbiAgICB9XG4gIH1cblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMucmFuZ2VzLmZpbmRJbmRleChyYW5nZSA9PiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpXG4gICAgcmV0dXJuIChpbmRleCA+PSAwID8gaW5kZXggOiAwKSArIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cbk1vdmVUb05leHRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dE9jY3VycmVuY2Uge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcblxuICBnZXRJbmRleChmcm9tUG9pbnQpIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLnJhbmdlcy5zbGljZSgpLnJldmVyc2UoKVxuICAgIGNvbnN0IHJhbmdlID0gcmFuZ2VzLmZpbmQocmFuZ2UgPT4gcmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbVBvaW50KSlcbiAgICBjb25zdCBpbmRleCA9IHJhbmdlID8gdGhpcy5yYW5nZXMuaW5kZXhPZihyYW5nZSkgOiB0aGlzLnJhbmdlcy5sZW5ndGggLSAxXG4gICAgcmV0dXJuIGluZGV4IC0gdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAlXG5jbGFzcyBNb3ZlVG9QYWlyIGV4dGVuZHMgTW90aW9uIHtcbiAgaW5jbHVzaXZlID0gdHJ1ZVxuICBqdW1wID0gdHJ1ZVxuICBtZW1iZXIgPSBbXCJQYXJlbnRoZXNpc1wiLCBcIkN1cmx5QnJhY2tldFwiLCBcIlNxdWFyZUJyYWNrZXRcIl1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMuc2V0QnVmZmVyUG9zaXRpb25TYWZlbHkoY3Vyc29yLCB0aGlzLmdldFBvaW50KGN1cnNvcikpXG4gIH1cblxuICBnZXRQb2ludEZvclRhZyhwb2ludCkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRJbnN0YW5jZShcIkFUYWdcIikuZ2V0UGFpckluZm8ocG9pbnQpXG4gICAgaWYgKCFwYWlySW5mbykgcmV0dXJuXG5cbiAgICBsZXQge29wZW5SYW5nZSwgY2xvc2VSYW5nZX0gPSBwYWlySW5mb1xuICAgIG9wZW5SYW5nZSA9IG9wZW5SYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBjbG9zZVJhbmdlID0gY2xvc2VSYW5nZS50cmFuc2xhdGUoWzAsICsxXSwgWzAsIC0xXSlcbiAgICBpZiAob3BlblJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKG9wZW5SYW5nZS5lbmQpKSB7XG4gICAgICByZXR1cm4gY2xvc2VSYW5nZS5zdGFydFxuICAgIH1cbiAgICBpZiAoY2xvc2VSYW5nZS5jb250YWluc1BvaW50KHBvaW50KSAmJiAhcG9pbnQuaXNFcXVhbChjbG9zZVJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBvcGVuUmFuZ2Uuc3RhcnRcbiAgICB9XG4gIH1cblxuICBnZXRQb2ludChjdXJzb3IpIHtcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yUG9zaXRpb24ucm93XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50Rm9yVGFnKGN1cnNvclBvc2l0aW9uKVxuICAgIGlmIChwb2ludCkgcmV0dXJuIHBvaW50XG5cbiAgICAvLyBBQW55UGFpckFsbG93Rm9yd2FyZGluZyByZXR1cm4gZm9yd2FyZGluZyByYW5nZSBvciBlbmNsb3NpbmcgcmFuZ2UuXG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldEluc3RhbmNlKFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIiwge21lbWJlcjogdGhpcy5tZW1iZXJ9KS5nZXRSYW5nZShjdXJzb3Iuc2VsZWN0aW9uKVxuICAgIGlmICghcmFuZ2UpIHJldHVyblxuXG4gICAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgICBpZiAoc3RhcnQucm93ID09PSBjdXJzb3JSb3cgJiYgc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3Vyc29yUG9zaXRpb24pKSB7XG4gICAgICAvLyBGb3J3YXJkaW5nIHJhbmdlIGZvdW5kXG4gICAgICByZXR1cm4gZW5kLnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgIH0gZWxzZSBpZiAoZW5kLnJvdyA9PT0gY3Vyc29yUG9zaXRpb24ucm93KSB7XG4gICAgICAvLyBFbmNsb3NpbmcgcmFuZ2Ugd2FzIHJldHVybmVkXG4gICAgICAvLyBXZSBtb3ZlIHRvIHN0YXJ0KCBvcGVuLXBhaXIgKSBvbmx5IHdoZW4gY2xvc2UtcGFpciB3YXMgYXQgc2FtZSByb3cgYXMgY3Vyc29yLXJvdy5cbiAgICAgIHJldHVybiBzdGFydFxuICAgIH1cbiAgfVxufVxuTW92ZVRvUGFpci5yZWdpc3RlcigpXG4iXX0=