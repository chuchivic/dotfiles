"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

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
    key: "canWrapToNextLine",
    value: function canWrapToNextLine(cursor) {
      if (this.isAsTargetExceptSelectInVisualMode() && !cursor.isAtEndOfLine()) {
        return false;
      } else {
        return this.getConfig("wrapLeftRightMotion");
      }
    }
  }, {
    key: "moveCursor",
    value: function moveCursor(cursor) {
      var _this4 = this;

      this.moveCursorCountTimes(cursor, function () {
        var cursorPosition = cursor.getBufferPosition();
        _this4.editor.unfoldBufferRow(cursorPosition.row);
        var allowWrap = _this4.canWrapToNextLine(cursor);
        _this4.utils.moveCursorRight(cursor);
        if (cursor.isAtEndOfLine() && allowWrap && !_this4.utils.pointIsAtVimEndOfFile(_this4.editor, cursorPosition)) {
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
      if (this.direction === "next") {
        return this.getNextStartOfSentence(fromPoint);
      } else if (this.direction === "previous") {
        return this.getPreviousStartOfSentence(fromPoint);
      }
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
          var _Array$from = Array.from([range.start.row, range.end.row]);

          var _Array$from2 = _slicedToArray(_Array$from, 2);

          var startRow = _Array$from2[0];
          var endRow = _Array$from2[1];

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
        var match = _ref5.match;
        var stop = _ref5.stop;
        var matchText = _ref5.matchText;

        if (match[1] != null) {
          var _Array$from3 = Array.from([range.start.row, range.end.row]);

          var _Array$from32 = _slicedToArray(_Array$from3, 2);

          var startRow = _Array$from32[0];
          var endRow = _Array$from32[1];

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
      var wasAtNonBlankRow = !this.editor.isBufferRowBlank(startRow);
      for (var row of this.utils.getBufferRows(this.editor, { startRow: startRow, direction: this.direction })) {
        if (this.editor.isBufferRowBlank(row)) {
          if (wasAtNonBlankRow) return new Point(row, 0);
        } else {
          wasAtNonBlankRow = true;
        }
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
      var row = this.utils.getValidVimBufferRow(this.editor, cursor.getBufferRow() + this.getCount(-1));
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
      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row > 0) {
          cursor.setBufferPosition(point.translate([-1, 0]));
        }
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
      var _this16 = this;

      this.moveCursorCountTimes(cursor, function () {
        var point = cursor.getBufferPosition();
        if (point.row < _this16.getVimLastBufferRow()) {
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

// keymap: g g

var MoveToFirstLine = (function (_Motion18) {
  _inherits(MoveToFirstLine, _Motion18);

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
      this.setCursorBufferRow(cursor, this.utils.getValidVimBufferRow(this.editor, this.getRow()));
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

var MoveToScreenColumn = (function (_Motion19) {
  _inherits(MoveToScreenColumn, _Motion19);

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
      var _this17 = this;

      var topPixelFrom = { top: this.getPixelRectTopForSceenRow(fromRow) };
      var topPixelTo = { top: this.getPixelRectTopForSceenRow(toRow) };
      // [NOTE]
      // intentionally use `element.component.setScrollTop` instead of `element.setScrollTop`.
      // SInce element.setScrollTop will throw exception when element.component no longer exists.
      var step = function step(newTop) {
        if (_this17.editor.element.component) {
          _this17.editor.element.component.setScrollTop(newTop);
          _this17.editor.element.component.updateSync();
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
      var _this18 = this;

      var bufferRow = this.getBufferRow(cursor);
      this.setCursorBufferRow(cursor, this.getBufferRow(cursor), { autoscroll: false });

      if (cursor.isLastCursor()) {
        (function () {
          if (_this18.isSmoothScrollEnabled()) _this18.vimState.finishScrollAnimation();

          var firstVisibileScreenRow = _this18.editor.getFirstVisibleScreenRow();
          var newFirstVisibileBufferRow = _this18.editor.bufferRowForScreenRow(firstVisibileScreenRow + _this18.getAmountOfRows());
          var newFirstVisibileScreenRow = _this18.editor.screenRowForBufferRow(newFirstVisibileBufferRow);
          var done = function done() {
            _this18.editor.setFirstVisibleScreenRow(newFirstVisibileScreenRow);
            // [FIXME] sometimes, scrollTop is not updated, calling this fix.
            // Investigate and find better approach then remove this workaround.
            if (_this18.editor.element.component) _this18.editor.element.component.updateSync();
          };

          if (_this18.isSmoothScrollEnabled()) _this18.smoothScroll(firstVisibileScreenRow, newFirstVisibileScreenRow, done);else done();
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
      var _this19 = this;

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
              _this19.input = input;
              if (input) _this19.processOperation();else _this19.cancelOperation();
            },
            onChange: function onChange(preConfirmedChars) {
              _this19.preConfirmedChars = preConfirmedChars;
              _this19.highlightTextInCursorRows(_this19.preConfirmedChars, "pre-confirm", _this19.isBackwards());
            },
            onCancel: function onCancel() {
              _this19.vimState.highlightFind.clearMarkers();
              _this19.cancelOperation();
            },
            commands: {
              "vim-mode-plus:find-next-pre-confirmed": function vimModePlusFindNextPreConfirmed() {
                return _this19.findPreConfirmed(+1);
              },
              "vim-mode-plus:find-previous-pre-confirmed": function vimModePlusFindPreviousPreConfirmed() {
                return _this19.findPreConfirmed(-1);
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
      var _this20 = this;

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
        _this20.highlightTextInCursorRows(_this20.input, decorationType, backwards);
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
      var _this21 = this;

      this.moveCursorCountTimes(cursor, function () {
        var row = _this21.detectRow(cursor);
        if (row != null) _this21.utils.moveCursorToFirstCharacterAtRow(cursor, row);
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
      var _this22 = this;

      var baseIndentLevel = this.editor.indentationForBufferRow(cursor.getBufferRow());
      return this.getScanRows(cursor).find(function (row) {
        return _this22.editor.indentationForBufferRow(row) === baseIndentLevel;
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
      var _this23 = this;

      return this.getScanRows(cursor).find(function (row) {
        return _this23.utils.isIncludeFunctionScopeForRow(_this23.editor, row);
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
      var _this24 = this;

      this.moveCursorCountTimes(cursor, function () {
        _this24.setBufferPositionSafely(cursor, _this24.getPoint(cursor.getBufferPosition()));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL21vdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7Ozs7Ozs7OztBQUVYLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQS9CLEtBQUssWUFBTCxLQUFLO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBRW5CLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7SUFFeEIsTUFBTTtZQUFOLE1BQU07O1dBQU4sTUFBTTswQkFBTixNQUFNOzsrQkFBTixNQUFNOztTQUVWLFNBQVMsR0FBRyxLQUFLO1NBQ2pCLElBQUksR0FBRyxlQUFlO1NBQ3RCLElBQUksR0FBRyxLQUFLO1NBQ1osY0FBYyxHQUFHLEtBQUs7U0FDdEIsYUFBYSxHQUFHLElBQUk7U0FDcEIscUJBQXFCLEdBQUcsS0FBSztTQUM3QixlQUFlLEdBQUcsS0FBSzs7O2VBUm5CLE1BQU07O1dBVUEsc0JBQUc7QUFDWCxhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxDQUFBO0tBQ2hDOzs7V0FFVSx1QkFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUE7S0FDakM7OztXQUVRLG1CQUFDLElBQUksRUFBRTtBQUNkLFVBQUksSUFBSSxLQUFLLGVBQWUsRUFBRTtBQUM1QixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssVUFBVSxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUE7T0FDcEU7QUFDRCxVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtLQUNqQjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQTtLQUM3Qjs7O1dBRXNCLGlDQUFDLE1BQU0sRUFBRSxLQUFL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LENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUNqRCxVQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFBO0FBQ3BDLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDakQsVUFBSSxLQUFLLEVBQUUsT0FBTyxLQUFLLENBQUE7OztBQUd2QixVQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLHlCQUF5QixFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDM0csVUFBSSxDQUFDLEtBQUssRUFBRSxPQUFNOztVQUVYLEtBQUssR0FBUyxLQUFLLENBQW5CLEtBQUs7VUFBRSxHQUFHLEdBQUksS0FBSyxDQUFaLEdBQUc7O0FBQ2pCLFVBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxTQUFTLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxFQUFFOztBQUV6RSxlQUFPLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQzlCLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLGNBQWMsQ0FBQyxHQUFHLEVBQUU7OztBQUd6QyxlQUFPLEtBQUssQ0FBQTtPQUNiO0tBQ0Y7OztTQTNDRyxVQUFVO0dBQVMsTUFBTTs7QUE2Qy9CLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi9tb3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwidW5kZXJzY29yZS1wbHVzXCIpXG5jb25zdCB7UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoXCJhdG9tXCIpXG5cbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5cbmNsYXNzIE1vdGlvbiBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwibW90aW9uXCJcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgd2lzZSA9IFwiY2hhcmFjdGVyd2lzZVwiXG4gIGp1bXAgPSBmYWxzZVxuICB2ZXJ0aWNhbE1vdGlvbiA9IGZhbHNlXG4gIG1vdmVTdWNjZWVkZWQgPSBudWxsXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG5cbiAgaXNMaW5ld2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCJcbiAgfVxuXG4gIGlzQmxvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCJcbiAgfVxuXG4gIGZvcmNlV2lzZSh3aXNlKSB7XG4gICAgaWYgKHdpc2UgPT09IFwiY2hhcmFjdGVyd2lzZVwiKSB7XG4gICAgICB0aGlzLmluY2x1c2l2ZSA9IHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiID8gZmFsc2UgOiAhdGhpcy5pbmNsdXNpdmVcbiAgICB9XG4gICAgdGhpcy53aXNlID0gd2lzZVxuICB9XG5cbiAgcmVzZXRTdGF0ZSgpIHtcbiAgICB0aGlzLnNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG4gIH1cblxuICBzZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KSB7XG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gIH1cblxuICBzZXRTY3JlZW5Qb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KSB7XG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0U2NyZWVuUG9zaXRpb24ocG9pbnQpXG4gIH1cblxuICBtb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcikge1xuICAgIGNvbnN0IG9yaWdpbmFsUG9zaXRpb24gPSB0aGlzLmp1bXAgJiYgY3Vyc29yLmlzTGFzdEN1cnNvcigpID8gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkgOiB1bmRlZmluZWRcblxuICAgIHRoaXMubW92ZUN1cnNvcihjdXJzb3IpXG5cbiAgICBpZiAob3JpZ2luYWxQb3NpdGlvbiAmJiAhY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkuaXNFcXVhbChvcmlnaW5hbFBvc2l0aW9uKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5tYXJrLnNldChcImBcIiwgb3JpZ2luYWxQb3NpdGlvbilcbiAgICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCInXCIsIG9yaWdpbmFsUG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICBpZiAodGhpcy5vcGVyYXRvcikge1xuICAgICAgdGhpcy5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgdGhpcy5tb3ZlV2l0aFNhdmVKdW1wKGN1cnNvcilcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5lZGl0b3IubWVyZ2VDdXJzb3JzKClcbiAgICB0aGlzLmVkaXRvci5tZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMoKVxuICB9XG5cbiAgLy8gTk9URTogc2VsZWN0aW9uIGlzIGFscmVhZHkgXCJub3JtYWxpemVkXCIgYmVmb3JlIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICBzZWxlY3QoKSB7XG4gICAgLy8gbmVlZCB0byBjYXJlIHdhcyB2aXN1YWwgZm9yIGAuYCByZXBlYXRlZC5cbiAgICBjb25zdCBpc09yV2FzVmlzdWFsID0gdGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSB8fCB0aGlzLmlzKFwiQ3VycmVudFNlbGVjdGlvblwiKVxuXG4gICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2YgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpKSB7XG4gICAgICBzZWxlY3Rpb24ubW9kaWZ5U2VsZWN0aW9uKCgpID0+IHRoaXMubW92ZVdpdGhTYXZlSnVtcChzZWxlY3Rpb24uY3Vyc29yKSlcblxuICAgICAgY29uc3Qgc2VsZWN0U3VjY2VlZGVkID1cbiAgICAgICAgdGhpcy5tb3ZlU3VjY2VlZGVkICE9IG51bGxcbiAgICAgICAgICA/IHRoaXMubW92ZVN1Y2NlZWRlZFxuICAgICAgICAgIDogIXNlbGVjdGlvbi5pc0VtcHR5KCkgfHwgKHRoaXMuaXNMaW5ld2lzZSgpICYmIHRoaXMubW92ZVN1Y2Nlc3NPbkxpbmV3aXNlKVxuICAgICAgaWYgKCF0aGlzLnNlbGVjdFN1Y2NlZWRlZCkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSBzZWxlY3RTdWNjZWVkZWRcblxuICAgICAgaWYgKGlzT3JXYXNWaXN1YWwgfHwgKHNlbGVjdFN1Y2NlZWRlZCAmJiAodGhpcy5pbmNsdXNpdmUgfHwgdGhpcy5pc0xpbmV3aXNlKCkpKSkge1xuICAgICAgICBjb25zdCAkc2VsZWN0aW9uID0gdGhpcy5zd3JhcChzZWxlY3Rpb24pXG4gICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXModHJ1ZSkgLy8gc2F2ZSBwcm9wZXJ0eSBvZiBcImFscmVhZHktbm9ybWFsaXplZC1zZWxlY3Rpb25cIlxuICAgICAgICAkc2VsZWN0aW9uLmFwcGx5V2lzZSh0aGlzLndpc2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgdGhpcy52aW1TdGF0ZS5nZXRMYXN0QmxvY2t3aXNlU2VsZWN0aW9uKCkuYXV0b3Njcm9sbCgpXG4gICAgfVxuICB9XG5cbiAgc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgcm93LCBvcHRpb25zKSB7XG4gICAgaWYgKHRoaXMudmVydGljYWxNb3Rpb24gJiYgIXRoaXMuZ2V0Q29uZmlnKFwic3RheU9uVmVydGljYWxNb3Rpb25cIikpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbih0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cocm93KSwgb3B0aW9ucylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51dGlscy5zZXRCdWZmZXJSb3coY3Vyc29yLCByb3csIG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgLy8gW05PVEVdXG4gIC8vIFNpbmNlIHRoaXMgZnVuY3Rpb24gY2hlY2tzIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UsIGEgY3Vyc29yIHBvc2l0aW9uIE1VU1QgYmVcbiAgLy8gdXBkYXRlZCBJTiBjYWxsYmFjayg9Zm4pXG4gIC8vIFVwZGF0aW5nIHBvaW50IG9ubHkgaW4gY2FsbGJhY2sgaXMgd3JvbmctdXNlIG9mIHRoaXMgZnVuY2l0b24sXG4gIC8vIHNpbmNlIGl0IHN0b3BzIGltbWVkaWF0ZWx5IGJlY2F1c2Ugb2Ygbm90IGN1cnNvciBwb3NpdGlvbiBjaGFuZ2UuXG4gIG1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgZm4pIHtcbiAgICBsZXQgb2xkUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHRoaXMuY291bnRUaW1lcyh0aGlzLmdldENvdW50KCksIHN0YXRlID0+IHtcbiAgICAgIGZuKHN0YXRlKVxuICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKG5ld1Bvc2l0aW9uLmlzRXF1YWwob2xkUG9zaXRpb24pKSBzdGF0ZS5zdG9wKClcbiAgICAgIG9sZFBvc2l0aW9uID0gbmV3UG9zaXRpb25cbiAgICB9KVxuICB9XG5cbiAgaXNDYXNlU2Vuc2l0aXZlKHRlcm0pIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDb25maWcoYHVzZVNtYXJ0Y2FzZUZvciR7dGhpcy5jYXNlU2Vuc2l0aXZpdHlLaW5kfWApXG4gICAgICA/IHRlcm0uc2VhcmNoKC9bQS1aXS8pICE9PSAtMVxuICAgICAgOiAhdGhpcy5nZXRDb25maWcoYGlnbm9yZUNhc2VGb3Ike3RoaXMuY2FzZVNlbnNpdGl2aXR5S2luZH1gKVxuICB9XG59XG5Nb3Rpb24ucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIFVzZWQgYXMgb3BlcmF0b3IncyB0YXJnZXQgaW4gdmlzdWFsLW1vZGUuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uIHtcbiAgc2VsZWN0aW9uRXh0ZW50ID0gbnVsbFxuICBibG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQgPSBudWxsXG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgcG9pbnRJbmZvQnlDdXJzb3IgPSBuZXcgTWFwKClcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uRXh0ZW50ID0gdGhpcy5pc0Jsb2Nrd2lzZSgpXG4gICAgICAgID8gdGhpcy5zd3JhcChjdXJzb3Iuc2VsZWN0aW9uKS5nZXRCbG9ja3dpc2VTZWxlY3Rpb25FeHRlbnQoKVxuICAgICAgICA6IHRoaXMuZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKS5nZXRFeHRlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgLmAgcmVwZWF0IGNhc2VcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUodGhpcy5zZWxlY3Rpb25FeHRlbnQpKVxuICAgIH1cbiAgfVxuXG4gIHNlbGVjdCgpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGN1cnNvciBvZiB0aGlzLmVkaXRvci5nZXRDdXJzb3JzKCkpIHtcbiAgICAgICAgY29uc3QgcG9pbnRJbmZvID0gdGhpcy5wb2ludEluZm9CeUN1cnNvci5nZXQoY3Vyc29yKVxuICAgICAgICBpZiAocG9pbnRJbmZvKSB7XG4gICAgICAgICAgY29uc3Qge2N1cnNvclBvc2l0aW9uLCBzdGFydE9mU2VsZWN0aW9ufSA9IHBvaW50SW5mb1xuICAgICAgICAgIGlmIChjdXJzb3JQb3NpdGlvbi5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSkge1xuICAgICAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZTZWxlY3Rpb24pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdXBlci5zZWxlY3QoKVxuICAgIH1cblxuICAgIC8vICogUHVycG9zZSBvZiBwb2ludEluZm9CeUN1cnNvcj8gc2VlICMyMzUgZm9yIGRldGFpbC5cbiAgICAvLyBXaGVuIHN0YXlPblRyYW5zZm9ybVN0cmluZyBpcyBlbmFibGVkLCBjdXJzb3IgcG9zIGlzIG5vdCBzZXQgb24gc3RhcnQgb2ZcbiAgICAvLyBvZiBzZWxlY3RlZCByYW5nZS5cbiAgICAvLyBCdXQgSSB3YW50IGZvbGxvd2luZyBiZWhhdmlvciwgc28gbmVlZCB0byBwcmVzZXJ2ZSBwb3NpdGlvbiBpbmZvLlxuICAgIC8vICAxLiBgdmo+LmAgLT4gaW5kZW50IHNhbWUgdHdvIHJvd3MgcmVnYXJkbGVzcyBvZiBjdXJyZW50IGN1cnNvcidzIHJvdy5cbiAgICAvLyAgMi4gYHZqPmouYCAtPiBpbmRlbnQgdHdvIHJvd3MgZnJvbSBjdXJzb3IncyByb3cuXG4gICAgZm9yIChjb25zdCBjdXJzb3Igb2YgdGhpcy5lZGl0b3IuZ2V0Q3Vyc29ycygpKSB7XG4gICAgICBjb25zdCBzdGFydE9mU2VsZWN0aW9uID0gY3Vyc29yLnNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICB0aGlzLm9uRGlkRmluaXNoT3BlcmF0aW9uKCgpID0+IHtcbiAgICAgICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICB0aGlzLnBvaW50SW5mb0J5Q3Vyc29yLnNldChjdXJzb3IsIHtzdGFydE9mU2VsZWN0aW9uLCBjdXJzb3JQb3NpdGlvbn0pXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuQ3VycmVudFNlbGVjdGlvbi5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgTW92ZUxlZnQgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGFsbG93V3JhcCA9IHRoaXMuZ2V0Q29uZmlnKFwid3JhcExlZnRSaWdodE1vdGlvblwiKVxuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JMZWZ0KGN1cnNvciwge2FsbG93V3JhcH0pKVxuICB9XG59XG5Nb3ZlTGVmdC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVSaWdodCBleHRlbmRzIE1vdGlvbiB7XG4gIGNhbldyYXBUb05leHRMaW5lKGN1cnNvcikge1xuICAgIGlmICh0aGlzLmlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGUoKSAmJiAhY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldENvbmZpZyhcIndyYXBMZWZ0UmlnaHRNb3Rpb25cIilcbiAgICB9XG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB0aGlzLmVkaXRvci51bmZvbGRCdWZmZXJSb3coY3Vyc29yUG9zaXRpb24ucm93KVxuICAgICAgY29uc3QgYWxsb3dXcmFwID0gdGhpcy5jYW5XcmFwVG9OZXh0TGluZShjdXJzb3IpXG4gICAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JSaWdodChjdXJzb3IpXG4gICAgICBpZiAoY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSAmJiBhbGxvd1dyYXAgJiYgIXRoaXMudXRpbHMucG9pbnRJc0F0VmltRW5kT2ZGaWxlKHRoaXMuZWRpdG9yLCBjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlQ3Vyc29yUmlnaHQoY3Vyc29yLCB7YWxsb3dXcmFwfSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5Nb3ZlUmlnaHQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlUmlnaHRCdWZmZXJDb2x1bW4gZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpICsgdGhpcy5nZXRDb3VudCgpKVxuICB9XG59XG5Nb3ZlUmlnaHRCdWZmZXJDb2x1bW4ucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1vdmVVcCBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgd3JhcCA9IGZhbHNlXG5cbiAgZ2V0QnVmZmVyUm93KHJvdykge1xuICAgIGNvbnN0IG1pbiA9IDBcbiAgICByb3cgPSB0aGlzLndyYXAgJiYgcm93ID09PSBtaW4gPyB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKSA6IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93IC0gMSwge21pbn0pXG4gICAgcmV0dXJuIHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KHJvdylcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRCdWZmZXJSb3coY3Vyc29yLmdldEJ1ZmZlclJvdygpKSkpXG4gIH1cbn1cbk1vdmVVcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFdyYXAgZXh0ZW5kcyBNb3ZlVXAge1xuICB3cmFwID0gdHJ1ZVxufVxuTW92ZVVwV3JhcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duIGV4dGVuZHMgTW92ZVVwIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICB3cmFwID0gZmFsc2VcblxuICBnZXRCdWZmZXJSb3cocm93KSB7XG4gICAgaWYgKHRoaXMuZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KSkge1xuICAgICAgcm93ID0gdGhpcy51dGlscy5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdykuZW5kLnJvd1xuICAgIH1cbiAgICBjb25zdCBtYXggPSB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKVxuICAgIHJldHVybiB0aGlzLndyYXAgJiYgcm93ID49IG1heCA/IDAgOiB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHJvdyArIDEsIHttYXh9KVxuICB9XG59XG5Nb3ZlRG93bi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duV3JhcCBleHRlbmRzIE1vdmVEb3duIHtcbiAgd3JhcCA9IHRydWVcbn1cbk1vdmVEb3duV3JhcC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVVcFNjcmVlbiBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHRoaXMudXRpbHMubW92ZUN1cnNvclVwU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cbk1vdmVVcFNjcmVlbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVEb3duU2NyZWVuIGV4dGVuZHMgTW92ZVVwU2NyZWVuIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBkaXJlY3Rpb24gPSBcImRvd25cIlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB0aGlzLnV0aWxzLm1vdmVDdXJzb3JEb3duU2NyZWVuKGN1cnNvcikpXG4gIH1cbn1cbk1vdmVEb3duU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8gTW92ZSBkb3duL3VwIHRvIEVkZ2Vcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlZSB0OW1kL2F0b20tdmltLW1vZGUtcGx1cyMyMzZcbi8vIEF0IGxlYXN0IHYxLjcuMC4gYnVmZmVyUG9zaXRpb24gYW5kIHNjcmVlblBvc2l0aW9uIGNhbm5vdCBjb252ZXJ0IGFjY3VyYXRlbHlcbi8vIHdoZW4gcm93IGlzIGZvbGRlZC5cbmNsYXNzIE1vdmVVcFRvRWRnZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJ1cFwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIHRoaXMuc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCB0aGlzLmdldFBvaW50KGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpKSlcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qge2NvbHVtbn0gPSBmcm9tUG9pbnRcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiB0aGlzLmdldFNjYW5Sb3dzKGZyb21Qb2ludCkpIHtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgaWYgKHRoaXMuaXNFZGdlKHBvaW50KSkgcmV0dXJuIHBvaW50XG4gICAgfVxuICB9XG5cbiAgZ2V0U2NhblJvd3Moe3Jvd30pIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09IFwidXBcIlxuICAgICAgPyB0aGlzLnV0aWxzLmdldExpc3QodGhpcy51dGlscy5nZXRWYWxpZFZpbVNjcmVlblJvdyh0aGlzLmVkaXRvciwgcm93IC0gMSksIDAsIHRydWUpXG4gICAgICA6IHRoaXMudXRpbHMuZ2V0TGlzdCh0aGlzLnV0aWxzLmdldFZhbGlkVmltU2NyZWVuUm93KHRoaXMuZWRpdG9yLCByb3cgKyAxKSwgdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCksIHRydWUpXG4gIH1cblxuICBpc0VkZ2UocG9pbnQpIHtcbiAgICBpZiAodGhpcy5pc1N0b3BwYWJsZVBvaW50KHBvaW50KSkge1xuICAgICAgLy8gSWYgb25lIG9mIGFib3ZlL2JlbG93IHBvaW50IHdhcyBub3Qgc3RvcHBhYmxlLCBpdCdzIEVkZ2UhXG4gICAgICBjb25zdCBhYm92ZSA9IHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKVxuICAgICAgY29uc3QgYmVsb3cgPSBwb2ludC50cmFuc2xhdGUoWysxLCAwXSlcbiAgICAgIHJldHVybiAhdGhpcy5pc1N0b3BwYWJsZVBvaW50KGFib3ZlKSB8fCAhdGhpcy5pc1N0b3BwYWJsZVBvaW50KGJlbG93KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBpc1N0b3BwYWJsZVBvaW50KHBvaW50KSB7XG4gICAgaWYgKHRoaXMuaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpIHx8IHRoaXMuaXNGaXJzdFJvd09yTGFzdFJvd0FuZFN0b3BwYWJsZShwb2ludCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxlZnRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuICAgICAgY29uc3QgcmlnaHRQb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgcmV0dXJuIHRoaXMuaXNOb25XaGl0ZVNwYWNlUG9pbnQobGVmdFBvaW50KSAmJiB0aGlzLmlzTm9uV2hpdGVTcGFjZVBvaW50KHJpZ2h0UG9pbnQpXG4gICAgfVxuICB9XG5cbiAgaXNOb25XaGl0ZVNwYWNlUG9pbnQocG9pbnQpIHtcbiAgICBjb25zdCBjaGFyID0gdGhpcy51dGlscy5nZXRUZXh0SW5TY3JlZW5SYW5nZSh0aGlzLmVkaXRvciwgUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSlcbiAgICByZXR1cm4gY2hhciAhPSBudWxsICYmIC9cXFMvLnRlc3QoY2hhcilcbiAgfVxuXG4gIGlzRmlyc3RSb3dPckxhc3RSb3dBbmRTdG9wcGFibGUocG9pbnQpIHtcbiAgICAvLyBJbiBub3JtYWwtbW9kZSB3ZSBhZGp1c3QgY3Vyc29yIGJ5IG1vdmluZy1sZWZ0IGlmIGN1cnNvciBhdCBFT0wgb2Ygbm9uLWJsYW5rIHJvdy5cbiAgICAvLyBTbyBleHBsaWNpdGx5IGd1YXJkIHRvIG5vdCBhbnN3ZXIgaXQgc3RvcHBhYmxlLlxuICAgIGlmICh0aGlzLmlzTW9kZShcIm5vcm1hbFwiKSAmJiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHBvaW50LmlzRXF1YWwodGhpcy5lZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKHBvaW50KSkgJiZcbiAgICAgICAgKHBvaW50LnJvdyA9PT0gMCB8fCBwb2ludC5yb3cgPT09IHRoaXMuZ2V0VmltTGFzdFNjcmVlblJvdygpKVxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuTW92ZVVwVG9FZGdlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZURvd25Ub0VkZ2UgZXh0ZW5kcyBNb3ZlVXBUb0VkZ2Uge1xuICBkaXJlY3Rpb24gPSBcImRvd25cIlxufVxuTW92ZURvd25Ub0VkZ2UucmVnaXN0ZXIoKVxuXG4vLyB3b3JkXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0V29yZCBleHRlbmRzIE1vdGlvbiB7XG4gIHdvcmRSZWdleCA9IG51bGxcblxuICBnZXRQb2ludChyZWdleCwgZnJvbSkge1xuICAgIGxldCB3b3JkUmFuZ2VcbiAgICBsZXQgZm91bmQgPSBmYWxzZVxuXG4gICAgdGhpcy5zY2FuRm9yd2FyZChyZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSA9PiB7XG4gICAgICB3b3JkUmFuZ2UgPSByYW5nZVxuICAgICAgLy8gSWdub3JlICdlbXB0eSBsaW5lJyBtYXRjaGVzIGJldHdlZW4gJ1xccicgYW5kICdcXG4nXG4gICAgICBpZiAobWF0Y2hUZXh0ID09PSBcIlwiICYmIHJhbmdlLnN0YXJ0LmNvbHVtbiAhPT0gMCkgcmV0dXJuXG4gICAgICBpZiAocmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tKSkge1xuICAgICAgICBmb3VuZCA9IHRydWVcbiAgICAgICAgc3RvcCgpXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgY29uc3QgcG9pbnQgPSB3b3JkUmFuZ2Uuc3RhcnRcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3codGhpcy5lZGl0b3IsIHBvaW50KSAmJlxuICAgICAgICAhcG9pbnQuaXNFcXVhbCh0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICAgID8gcG9pbnQudHJhdmVyc2UoWzEsIDBdKVxuICAgICAgICA6IHBvaW50XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB3b3JkUmFuZ2UgPyB3b3JkUmFuZ2UuZW5kIDogZnJvbVxuICAgIH1cbiAgfVxuXG4gIC8vIFNwZWNpYWwgY2FzZTogXCJjd1wiIGFuZCBcImNXXCIgYXJlIHRyZWF0ZWQgbGlrZSBcImNlXCIgYW5kIFwiY0VcIiBpZiB0aGUgY3Vyc29yIGlzXG4gIC8vIG9uIGEgbm9uLWJsYW5rLiAgVGhpcyBpcyBiZWNhdXNlIFwiY3dcIiBpcyBpbnRlcnByZXRlZCBhcyBjaGFuZ2Utd29yZCwgYW5kIGFcbiAgLy8gd29yZCBkb2VzIG5vdCBpbmNsdWRlIHRoZSBmb2xsb3dpbmcgd2hpdGUgc3BhY2UuICB7Vmk6IFwiY3dcIiB3aGVuIG9uIGEgYmxhbmtcbiAgLy8gZm9sbG93ZWQgYnkgb3RoZXIgYmxhbmtzIGNoYW5nZXMgb25seSB0aGUgZmlyc3QgYmxhbms7IHRoaXMgaXMgcHJvYmFibHkgYVxuICAvLyBidWcsIGJlY2F1c2UgXCJkd1wiIGRlbGV0ZXMgYWxsIHRoZSBibGFua3N9XG4gIC8vXG4gIC8vIEFub3RoZXIgc3BlY2lhbCBjYXNlOiBXaGVuIHVzaW5nIHRoZSBcIndcIiBtb3Rpb24gaW4gY29tYmluYXRpb24gd2l0aCBhblxuICAvLyBvcGVyYXRvciBhbmQgdGhlIGxhc3Qgd29yZCBtb3ZlZCBvdmVyIGlzIGF0IHRoZSBlbmQgb2YgYSBsaW5lLCB0aGUgZW5kIG9mXG4gIC8vIHRoYXQgd29yZCBiZWNvbWVzIHRoZSBlbmQgb2YgdGhlIG9wZXJhdGVkIHRleHQsIG5vdCB0aGUgZmlyc3Qgd29yZCBpbiB0aGVcbiAgLy8gbmV4dCBsaW5lLlxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiAodGhpcy51dGlscy5wb2ludElzQXRWaW1FbmRPZkZpbGUodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uKSkgcmV0dXJuXG5cbiAgICBjb25zdCB3YXNPbldoaXRlU3BhY2UgPSB0aGlzLnV0aWxzLnBvaW50SXNPbldoaXRlU3BhY2UodGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uKVxuICAgIGNvbnN0IGlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGUgPSB0aGlzLmlzQXNUYXJnZXRFeGNlcHRTZWxlY3RJblZpc3VhbE1vZGUoKVxuXG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICh7aXNGaW5hbH0pID0+IHtcbiAgICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmICh0aGlzLnV0aWxzLmlzRW1wdHlSb3codGhpcy5lZGl0b3IsIGN1cnNvclBvc2l0aW9uLnJvdykgJiYgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSkge1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24udHJhdmVyc2UoWzEsIDBdKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy53b3JkUmVnZXggfHwgY3Vyc29yLndvcmRSZWdFeHAoKVxuICAgICAgICBsZXQgcG9pbnQgPSB0aGlzLmdldFBvaW50KHJlZ2V4LCBjdXJzb3JQb3NpdGlvbilcbiAgICAgICAgaWYgKGlzRmluYWwgJiYgaXNBc1RhcmdldEV4Y2VwdFNlbGVjdEluVmlzdWFsTW9kZSkge1xuICAgICAgICAgIGlmICh0aGlzLm9wZXJhdG9yLmlzKFwiQ2hhbmdlXCIpICYmICF3YXNPbldoaXRlU3BhY2UpIHtcbiAgICAgICAgICAgIHBvaW50ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCB0aGlzLnV0aWxzLmdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgY3Vyc29yUG9zaXRpb24ucm93KSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbk1vdmVUb05leHRXb3JkLnJlZ2lzdGVyKClcblxuLy8gYlxuY2xhc3MgTW92ZVRvUHJldmlvdXNXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih7d29yZFJlZ2V4OiB0aGlzLndvcmRSZWdleH0pXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXb3JkIGV4dGVuZHMgTW90aW9uIHtcbiAgd29yZFJlZ2V4ID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlKGN1cnNvcilcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oUG9pbnQubWluKHBvaW50LCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgICAgaWYgKG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpIHtcbiAgICAgICAgLy8gUmV0cnkgZnJvbSByaWdodCBjb2x1bW4gaWYgY3Vyc29yIHdhcyBhbHJlYWR5IG9uIEVuZE9mV29yZFxuICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgdGhpcy5tb3ZlVG9OZXh0RW5kT2ZXb3JkKGN1cnNvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5Nb3ZlVG9FbmRPZldvcmQucmVnaXN0ZXIoKVxuXG4vLyBbVE9ETzogSW1wcm92ZSwgYWNjdXJhY3ldXG5jbGFzcyBNb3ZlVG9QcmV2aW91c0VuZE9mV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIGluY2x1c2l2ZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGNvbnN0IHdvcmRSYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKClcbiAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAvLyBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgd29yZCB0aGVuIHdlIG5lZWQgdG8gbW92ZSB0byBpdHMgc3RhcnRcbiAgICBsZXQgdGltZXMgPSB0aGlzLmdldENvdW50KClcbiAgICBpZiAoY3Vyc29yUG9zaXRpb24uaXNHcmVhdGVyVGhhbih3b3JkUmFuZ2Uuc3RhcnQpICYmIGN1cnNvclBvc2l0aW9uLmlzTGVzc1RoYW4od29yZFJhbmdlLmVuZCkpIHtcbiAgICAgIHRpbWVzICs9IDFcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGkgaW4gdGhpcy51dGlscy5nZXRMaXN0KDEsIHRpbWVzKSkge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHt3b3JkUmVnZXg6IHRoaXMud29yZFJlZ2V4fSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludClcbiAgICB9XG5cbiAgICB0aGlzLm1vdmVUb05leHRFbmRPZldvcmQoY3Vyc29yKVxuICAgIGlmIChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgfVxuICB9XG5cbiAgbW92ZVRvTmV4dEVuZE9mV29yZChjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24oe3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KS50cmFuc2xhdGUoWzAsIC0xXSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oUG9pbnQubWluKHBvaW50LCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKCkpKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c0VuZE9mV29yZC5yZWdpc3RlcigpXG5cbi8vIFdob2xlIHdvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9OZXh0V29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cbk1vdmVUb05leHRXaG9sZVdvcmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9eJHxcXFMrL2dcbn1cbk1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZXaG9sZVdvcmQgZXh0ZW5kcyBNb3ZlVG9FbmRPZldvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbk1vdmVUb0VuZE9mV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuLy8gW1RPRE86IEltcHJvdmUsIGFjY3VyYWN5XVxuY2xhc3MgTW92ZVRvUHJldmlvdXNFbmRPZldob2xlV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcUysvXG59XG5Nb3ZlVG9QcmV2aW91c0VuZE9mV2hvbGVXb3JkLnJlZ2lzdGVyKClcblxuLy8gQWxwaGFudW1lcmljIHdvcmQgW0V4cGVyaW1lbnRhbF1cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICB3b3JkUmVnZXggPSAvXFx3Ky9nXG59XG5Nb3ZlVG9OZXh0QWxwaGFudW1lcmljV29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzQWxwaGFudW1lcmljV29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIHdvcmRSZWdleCA9IC9cXHcrL1xufVxuTW92ZVRvUHJldmlvdXNBbHBoYW51bWVyaWNXb3JkLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRW5kT2ZBbHBoYW51bWVyaWNXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1xcdysvXG59XG5Nb3ZlVG9FbmRPZkFscGhhbnVtZXJpY1dvcmQucmVnaXN0ZXIoKVxuXG4vLyBBbHBoYW51bWVyaWMgd29yZCBbRXhwZXJpbWVudGFsXVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvTmV4dFNtYXJ0V29yZCBleHRlbmRzIE1vdmVUb05leHRXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvZ1xufVxuTW92ZVRvTmV4dFNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvUHJldmlvdXNXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5Nb3ZlVG9QcmV2aW91c1NtYXJ0V29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0VuZE9mU21hcnRXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkIHtcbiAgd29yZFJlZ2V4ID0gL1tcXHctXSsvXG59XG5Nb3ZlVG9FbmRPZlNtYXJ0V29yZC5yZWdpc3RlcigpXG5cbi8vIFN1YndvcmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb05leHRTdWJ3b3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmQge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMud29yZFJlZ2V4ID0gY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5Nb3ZlVG9OZXh0U3Vid29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzU3Vid29yZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzV29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzU3Vid29yZC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0VuZE9mU3Vid29yZCBleHRlbmRzIE1vdmVUb0VuZE9mV29yZCB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBjdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0VuZE9mU3Vid29yZC5yZWdpc3RlcigpXG5cbi8vIFNlbnRlbmNlXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTZW50ZW5jZSBpcyBkZWZpbmVkIGFzIGJlbG93XG4vLyAgLSBlbmQgd2l0aCBbJy4nLCAnIScsICc/J11cbi8vICAtIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgWycpJywgJ10nLCAnXCInLCBcIidcIl1cbi8vICAtIGZvbGxvd2VkIGJ5IFsnJCcsICcgJywgJ1xcdCddXG4vLyAgLSBwYXJhZ3JhcGggYm91bmRhcnkgaXMgYWxzbyBzZW50ZW5jZSBib3VuZGFyeVxuLy8gIC0gc2VjdGlvbiBib3VuZGFyeSBpcyBhbHNvIHNlbnRlbmNlIGJvdW5kYXJ5KGlnbm9yZSlcbmNsYXNzIE1vdmVUb05leHRTZW50ZW5jZSBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHNlbnRlbmNlUmVnZXggPSBuZXcgUmVnRXhwKGAoPzpbXFxcXC4hXFxcXD9dW1xcXFwpXFxcXF1cIiddKlxcXFxzKyl8KFxcXFxufFxcXFxyXFxcXG4pYCwgXCJnXCIpXG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpKVxuICAgIH0pXG4gIH1cblxuICBnZXRQb2ludChmcm9tUG9pbnQpIHtcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IFwibmV4dFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXROZXh0U3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcInByZXZpb3VzXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGZyb21Qb2ludClcbiAgICB9XG4gIH1cblxuICBpc0JsYW5rUm93KHJvdykge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgfVxuXG4gIGdldE5leHRTdGFydE9mU2VudGVuY2UoZnJvbSkge1xuICAgIGxldCBmb3VuZFBvaW50XG4gICAgdGhpcy5zY2FuRm9yd2FyZCh0aGlzLnNlbnRlbmNlUmVnZXgsIHtmcm9tfSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBtYXRjaCwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChtYXRjaFsxXSAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IFtzdGFydFJvdywgZW5kUm93XSA9IEFycmF5LmZyb20oW3JhbmdlLnN0YXJ0LnJvdywgcmFuZ2UuZW5kLnJvd10pXG4gICAgICAgIGlmICh0aGlzLnNraXBCbGFua1JvdyAmJiB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkgcmV0dXJuXG4gICAgICAgIGlmICh0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpICE9PSB0aGlzLmlzQmxhbmtSb3coZW5kUm93KSkge1xuICAgICAgICAgIGZvdW5kUG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3VuZFBvaW50ID0gcmFuZ2UuZW5kXG4gICAgICB9XG4gICAgICBpZiAoZm91bmRQb2ludCkgc3RvcCgpXG4gICAgfSlcbiAgICByZXR1cm4gZm91bmRQb2ludCB8fCB0aGlzLmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgfVxuXG4gIGdldFByZXZpb3VzU3RhcnRPZlNlbnRlbmNlKGZyb20pIHtcbiAgICBsZXQgZm91bmRQb2ludFxuICAgIHRoaXMuc2NhbkJhY2t3YXJkKHRoaXMuc2VudGVuY2VSZWdleCwge2Zyb219LCAoe3JhbmdlLCBtYXRjaCwgc3RvcCwgbWF0Y2hUZXh0fSkgPT4ge1xuICAgICAgaWYgKG1hdGNoWzFdICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gQXJyYXkuZnJvbShbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XSlcbiAgICAgICAgaWYgKCF0aGlzLmlzQmxhbmtSb3coZW5kUm93KSAmJiB0aGlzLmlzQmxhbmtSb3coc3RhcnRSb3cpKSB7XG4gICAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgICAgIGlmIChwb2ludC5pc0xlc3NUaGFuKGZyb20pKSB7XG4gICAgICAgICAgICBmb3VuZFBvaW50ID0gcG9pbnRcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2tpcEJsYW5rUm93KSByZXR1cm5cbiAgICAgICAgICAgIGZvdW5kUG9pbnQgPSB0aGlzLmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmFuZ2UuZW5kLmlzTGVzc1RoYW4oZnJvbSkpIGZvdW5kUG9pbnQgPSByYW5nZS5lbmRcbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZFBvaW50KSBzdG9wKClcbiAgICB9KVxuICAgIHJldHVybiBmb3VuZFBvaW50IHx8IFswLCAwXVxuICB9XG59XG5Nb3ZlVG9OZXh0U2VudGVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1NlbnRlbmNlIGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgZGlyZWN0aW9uID0gXCJwcmV2aW91c1wiXG59XG5Nb3ZlVG9QcmV2aW91c1NlbnRlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93IGV4dGVuZHMgTW92ZVRvTmV4dFNlbnRlbmNlIHtcbiAgc2tpcEJsYW5rUm93ID0gdHJ1ZVxufVxuTW92ZVRvTmV4dFNlbnRlbmNlU2tpcEJsYW5rUm93LnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZVNraXBCbGFua1JvdyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU2VudGVuY2Uge1xuICBza2lwQmxhbmtSb3cgPSB0cnVlXG59XG5Nb3ZlVG9QcmV2aW91c1NlbnRlbmNlU2tpcEJsYW5rUm93LnJlZ2lzdGVyKClcblxuLy8gUGFyYWdyYXBoXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBNb3ZlVG9OZXh0UGFyYWdyYXBoIGV4dGVuZHMgTW90aW9uIHtcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gICAgfSlcbiAgfVxuXG4gIGdldFBvaW50KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHN0YXJ0Um93ID0gZnJvbVBvaW50LnJvd1xuICAgIGxldCB3YXNBdE5vbkJsYW5rUm93ID0gIXRoaXMuZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsoc3RhcnRSb3cpXG4gICAgZm9yIChsZXQgcm93IG9mIHRoaXMudXRpbHMuZ2V0QnVmZmVyUm93cyh0aGlzLmVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9ufSkpIHtcbiAgICAgIGlmICh0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykpIHtcbiAgICAgICAgaWYgKHdhc0F0Tm9uQmxhbmtSb3cpIHJldHVybiBuZXcgUG9pbnQocm93LCAwKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FzQXROb25CbGFua1JvdyA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmYWxsYmFja1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gXCJwcmV2aW91c1wiID8gbmV3IFBvaW50KDAsIDApIDogdGhpcy5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbigpXG4gIH1cbn1cbk1vdmVUb05leHRQYXJhZ3JhcGgucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1BhcmFncmFwaCBleHRlbmRzIE1vdmVUb05leHRQYXJhZ3JhcGgge1xuICBkaXJlY3Rpb24gPSBcInByZXZpb3VzXCJcbn1cbk1vdmVUb1ByZXZpb3VzUGFyYWdyYXBoLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8ga2V5bWFwOiAwXG5jbGFzcyBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyQ29sdW1uKGN1cnNvciwgMClcbiAgfVxufVxuTW92ZVRvQmVnaW5uaW5nT2ZMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvQ29sdW1uIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLnV0aWxzLnNldEJ1ZmZlckNvbHVtbihjdXJzb3IsIHRoaXMuZ2V0Q291bnQoLTEpKVxuICB9XG59XG5Nb3ZlVG9Db2x1bW4ucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByb3cgPSB0aGlzLnV0aWxzLmdldFZhbGlkVmltQnVmZmVyUm93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkgKyB0aGlzLmdldENvdW50KC0xKSlcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgSW5maW5pdHldKVxuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gSW5maW5pdHlcbiAgfVxufVxuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24odGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gIH1cblxuICBnZXRQb2ludCh7cm93fSkge1xuICAgIHJvdyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIocm93ICsgdGhpcy5nZXRDb3VudCgtMSksIHttYXg6IHRoaXMuZ2V0VmltTGFzdEJ1ZmZlclJvdygpfSlcbiAgICBjb25zdCByYW5nZSA9IHRoaXMudXRpbHMuZmluZFJhbmdlSW5CdWZmZXJSb3codGhpcy5lZGl0b3IsIC9cXFN8Xi8sIHJvdywge2RpcmVjdGlvbjogXCJiYWNrd2FyZFwifSlcbiAgICByZXR1cm4gcmFuZ2UgPyByYW5nZS5zdGFydCA6IG5ldyBQb2ludChyb3csIDApXG4gIH1cbn1cbk1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24ucmVnaXN0ZXIoKVxuXG4vLyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSBmYWltaWx5XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIF5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uIHtcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHBvaW50KVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAgZXh0ZW5kcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3QgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgKHBvaW50LnJvdyA+IDApIHtcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHN1cGVyLm1vdmVDdXJzb3IoY3Vyc29yKVxuICB9XG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5tb3ZlQ3Vyc29yQ291bnRUaW1lcyhjdXJzb3IsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIChwb2ludC5yb3cgPCB0aGlzLmdldFZpbUxhc3RCdWZmZXJSb3coKSkge1xuICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuICAgICAgfVxuICAgIH0pXG4gICAgc3VwZXIubW92ZUN1cnNvcihjdXJzb3IpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93bi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biBleHRlbmRzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93biB7XG4gIGdldENvdW50KCkge1xuICAgIHJldHVybiBzdXBlci5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBnIGdcbmNsYXNzIE1vdmVUb0ZpcnN0TGluZSBleHRlbmRzIE1vdGlvbiB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAganVtcCA9IHRydWVcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy51dGlscy5nZXRWYWxpZFZpbUJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgdGhpcy5nZXRSb3coKSkpXG4gICAgY3Vyc29yLmF1dG9zY3JvbGwoe2NlbnRlcjogdHJ1ZX0pXG4gIH1cblxuICBnZXRSb3coKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q291bnQoLTEpXG4gIH1cbn1cbk1vdmVUb0ZpcnN0TGluZS5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1NjcmVlbkNvbHVtbiBleHRlbmRzIE1vdGlvbiB7XG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbiA9IHRoaXMuZ2V0Q29uZmlnKFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb25cIilcbiAgICBjb25zdCBwb2ludCA9IHRoaXMudXRpbHMuZ2V0U2NyZWVuUG9zaXRpb25Gb3JTY3JlZW5Sb3codGhpcy5lZGl0b3IsIGN1cnNvci5nZXRTY3JlZW5Sb3coKSwgdGhpcy53aGljaCwge1xuICAgICAgYWxsb3dPZmZTY3JlZW5Qb3NpdGlvbixcbiAgICB9KVxuICAgIHRoaXMuc2V0U2NyZWVuUG9zaXRpb25TYWZlbHkoY3Vyc29yLCBwb2ludClcbiAgfVxufVxuTW92ZVRvU2NyZWVuQ29sdW1uLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBrZXltYXA6IGcgMFxuY2xhc3MgTW92ZVRvQmVnaW5uaW5nT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImJlZ2lubmluZ1wiXG59XG5Nb3ZlVG9CZWdpbm5pbmdPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBnIF46IGBtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1zY3JlZW4tbGluZWBcbmNsYXNzIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImZpcnN0LWNoYXJhY3RlclwiXG59XG5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mU2NyZWVuTGluZS5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogZyAkXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZTY3JlZW5MaW5lIGV4dGVuZHMgTW92ZVRvU2NyZWVuQ29sdW1uIHtcbiAgd2hpY2ggPSBcImxhc3QtY2hhcmFjdGVyXCJcbn1cbk1vdmVUb0xhc3RDaGFyYWN0ZXJPZlNjcmVlbkxpbmUucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IEdcbmNsYXNzIE1vdmVUb0xhc3RMaW5lIGV4dGVuZHMgTW92ZVRvRmlyc3RMaW5lIHtcbiAgZGVmYXVsdENvdW50ID0gSW5maW5pdHlcbn1cbk1vdmVUb0xhc3RMaW5lLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBOJSBlLmcuIDEwJVxuY2xhc3MgTW92ZVRvTGluZUJ5UGVyY2VudCBleHRlbmRzIE1vdmVUb0ZpcnN0TGluZSB7XG4gIGdldFJvdygpIHtcbiAgICBjb25zdCBwZXJjZW50ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KCksIHttYXg6IDEwMH0pXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKHRoaXMuZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMSkgKiAocGVyY2VudCAvIDEwMCkpXG4gIH1cbn1cbk1vdmVUb0xpbmVCeVBlcmNlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmUgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIG1vdmVTdWNjZXNzT25MaW5ld2lzZSA9IHRydWVcblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIGxldCByb3dcbiAgICBsZXQgY291bnQgPSB0aGlzLmdldENvdW50KClcbiAgICBpZiAoY291bnQgPCAwKSB7XG4gICAgICAvLyBTdXBwb3J0IG5lZ2F0aXZlIGNvdW50XG4gICAgICAvLyBOZWdhdGl2ZSBjb3VudCBjYW4gYmUgcGFzc2VkIGxpa2UgYG9wZXJhdGlvblN0YWNrLnJ1bihcIk1vdmVUb1JlbGF0aXZlTGluZVwiLCB7Y291bnQ6IC01fSlgLlxuICAgICAgLy8gQ3VycmVudGx5IHVzZWQgaW4gdmltLW1vZGUtcGx1cy1leC1tb2RlIHBrZy5cbiAgICAgIGNvdW50ICs9IDFcbiAgICAgIHJvdyA9IHRoaXMuZ2V0Rm9sZFN0YXJ0Um93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIHdoaWxlIChjb3VudCsrIDwgMCkgcm93ID0gdGhpcy5nZXRGb2xkU3RhcnRSb3dGb3JSb3cocm93IC0gMSlcbiAgICB9IGVsc2Uge1xuICAgICAgY291bnQgLT0gMVxuICAgICAgcm93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KGN1cnNvci5nZXRCdWZmZXJSb3coKSlcbiAgICAgIHdoaWxlIChjb3VudC0tID4gMCkgcm93ID0gdGhpcy5nZXRGb2xkRW5kUm93Rm9yUm93KHJvdyArIDEpXG4gICAgfVxuICAgIHRoaXMudXRpbHMuc2V0QnVmZmVyUm93KGN1cnNvciwgcm93KVxuICB9XG59XG5Nb3ZlVG9SZWxhdGl2ZUxpbmUucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIE1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1Ud28gZXh0ZW5kcyBNb3ZlVG9SZWxhdGl2ZUxpbmUge1xuICBnZXRDb3VudCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubGltaXROdW1iZXIoc3VwZXIuZ2V0Q291bnQoLi4uYXJncyksIHttaW46IDJ9KVxuICB9XG59XG5Nb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtVHdvLnJlZ2lzdGVyKGZhbHNlKVxuXG4vLyBQb3NpdGlvbiBjdXJzb3Igd2l0aG91dCBzY3JvbGxpbmcuLCBILCBNLCBMXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6IEhcbmNsYXNzIE1vdmVUb1RvcE9mU2NyZWVuIGV4dGVuZHMgTW90aW9uIHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBqdW1wID0gdHJ1ZVxuICBzY3JvbGxvZmYgPSAyXG4gIGRlZmF1bHRDb3VudCA9IDBcbiAgdmVydGljYWxNb3Rpb24gPSB0cnVlXG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBidWZmZXJSb3cgPSB0aGlzLmVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3codGhpcy5nZXRTY3JlZW5Sb3coKSlcbiAgICB0aGlzLnNldEN1cnNvckJ1ZmZlclJvdyhjdXJzb3IsIGJ1ZmZlclJvdylcbiAgfVxuXG4gIGdldFNjcm9sbG9mZigpIHtcbiAgICByZXR1cm4gdGhpcy5pc0FzVGFyZ2V0RXhjZXB0U2VsZWN0SW5WaXN1YWxNb2RlKCkgPyAwIDogdGhpcy5zY3JvbGxvZmZcbiAgfVxuXG4gIGdldFNjcmVlblJvdygpIHtcbiAgICBjb25zdCBmaXJzdFJvdyA9IHRoaXMuZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0U2Nyb2xsb2ZmKClcbiAgICBpZiAoZmlyc3RSb3cgPT09IDApIHtcbiAgICAgIG9mZnNldCA9IDBcbiAgICB9XG4gICAgb2Zmc2V0ID0gdGhpcy51dGlscy5saW1pdE51bWJlcih0aGlzLmdldENvdW50KC0xKSwge21pbjogb2Zmc2V0fSlcbiAgICByZXR1cm4gZmlyc3RSb3cgKyBvZmZzZXRcbiAgfVxufVxuTW92ZVRvVG9wT2ZTY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IE1cbmNsYXNzIE1vdmVUb01pZGRsZU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvVG9wT2ZTY3JlZW4ge1xuICBnZXRTY3JlZW5Sb3coKSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGNvbnN0IGVuZFJvdyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwge21heDogdGhpcy5nZXRWaW1MYXN0U2NyZWVuUm93KCl9KVxuICAgIHJldHVybiBzdGFydFJvdyArIE1hdGguZmxvb3IoKGVuZFJvdyAtIHN0YXJ0Um93KSAvIDIpXG4gIH1cbn1cbk1vdmVUb01pZGRsZU9mU2NyZWVuLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBMXG5jbGFzcyBNb3ZlVG9Cb3R0b21PZlNjcmVlbiBleHRlbmRzIE1vdmVUb1RvcE9mU2NyZWVuIHtcbiAgZ2V0U2NyZWVuUm93KCkge1xuICAgIGNvbnN0IHZpbUxhc3RTY3JlZW5Sb3cgPSB0aGlzLmdldFZpbUxhc3RTY3JlZW5Sb3coKVxuICAgIGNvbnN0IHJvdyA9IHRoaXMudXRpbHMubGltaXROdW1iZXIodGhpcy5lZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSwge21heDogdmltTGFzdFNjcmVlblJvd30pXG4gICAgbGV0IG9mZnNldCA9IHRoaXMuZ2V0U2Nyb2xsb2ZmKCkgKyAxXG4gICAgaWYgKHJvdyA9PT0gdmltTGFzdFNjcmVlblJvdykge1xuICAgICAgb2Zmc2V0ID0gMFxuICAgIH1cbiAgICBvZmZzZXQgPSB0aGlzLnV0aWxzLmxpbWl0TnVtYmVyKHRoaXMuZ2V0Q291bnQoLTEpLCB7bWluOiBvZmZzZXR9KVxuICAgIHJldHVybiByb3cgLSBvZmZzZXRcbiAgfVxufVxuTW92ZVRvQm90dG9tT2ZTY3JlZW4ucmVnaXN0ZXIoKVxuXG4vLyBTY3JvbGxpbmdcbi8vIEhhbGY6IGN0cmwtZCwgY3RybC11XG4vLyBGdWxsOiBjdHJsLWYsIGN0cmwtYlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW0ZJWE1FXSBjb3VudCBiZWhhdmUgZGlmZmVyZW50bHkgZnJvbSBvcmlnaW5hbCBWaW0uXG5jbGFzcyBTY3JvbGwgZXh0ZW5kcyBNb3Rpb24ge1xuICB2ZXJ0aWNhbE1vdGlvbiA9IHRydWVcblxuICBpc1Ntb290aFNjcm9sbEVuYWJsZWQoKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHRoaXMuYW1vdW50T2ZQYWdlKSA9PT0gMVxuICAgICAgPyB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uRnVsbFNjcm9sbE1vdGlvblwiKVxuICAgICAgOiB0aGlzLmdldENvbmZpZyhcInNtb290aFNjcm9sbE9uSGFsZlNjcm9sbE1vdGlvblwiKVxuICB9XG5cbiAgZ2V0U21vb3RoU2Nyb2xsRHVhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5hYnModGhpcy5hbW91bnRPZlBhZ2UpID09PSAxXG4gICAgICA/IHRoaXMuZ2V0Q29uZmlnKFwic21vb3RoU2Nyb2xsT25GdWxsU2Nyb2xsTW90aW9uRHVyYXRpb25cIilcbiAgICAgIDogdGhpcy5nZXRDb25maWcoXCJzbW9vdGhTY3JvbGxPbkhhbGZTY3JvbGxNb3Rpb25EdXJhdGlvblwiKVxuICB9XG5cbiAgZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3cocm93KSB7XG4gICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocm93LCAwKVxuICAgIHJldHVybiB0aGlzLmVkaXRvci5lbGVtZW50LnBpeGVsUmVjdEZvclNjcmVlblJhbmdlKG5ldyBSYW5nZShwb2ludCwgcG9pbnQpKS50b3BcbiAgfVxuXG4gIHNtb290aFNjcm9sbChmcm9tUm93LCB0b1JvdywgZG9uZSkge1xuICAgIGNvbnN0IHRvcFBpeGVsRnJvbSA9IHt0b3A6IHRoaXMuZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3coZnJvbVJvdyl9XG4gICAgY29uc3QgdG9wUGl4ZWxUbyA9IHt0b3A6IHRoaXMuZ2V0UGl4ZWxSZWN0VG9wRm9yU2NlZW5Sb3codG9Sb3cpfVxuICAgIC8vIFtOT1RFXVxuICAgIC8vIGludGVudGlvbmFsbHkgdXNlIGBlbGVtZW50LmNvbXBvbmVudC5zZXRTY3JvbGxUb3BgIGluc3RlYWQgb2YgYGVsZW1lbnQuc2V0U2Nyb2xsVG9wYC5cbiAgICAvLyBTSW5jZSBlbGVtZW50LnNldFNjcm9sbFRvcCB3aWxsIHRocm93IGV4Y2VwdGlvbiB3aGVuIGVsZW1lbnQuY29tcG9uZW50IG5vIGxvbmdlciBleGlzdHMuXG4gICAgY29uc3Qgc3RlcCA9IG5ld1RvcCA9PiB7XG4gICAgICBpZiAodGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQuc2V0U2Nyb2xsVG9wKG5ld1RvcClcbiAgICAgICAgdGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQudXBkYXRlU3luYygpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLmdldFNtb290aFNjcm9sbER1YXRpb24oKVxuICAgIHRoaXMudmltU3RhdGUucmVxdWVzdFNjcm9sbEFuaW1hdGlvbih0b3BQaXhlbEZyb20sIHRvcFBpeGVsVG8sIHtkdXJhdGlvbiwgc3RlcCwgZG9uZX0pXG4gIH1cblxuICBnZXRBbW91bnRPZlJvd3MoKSB7XG4gICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmFtb3VudE9mUGFnZSAqIHRoaXMuZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgKiB0aGlzLmdldENvdW50KCkpXG4gIH1cblxuICBnZXRCdWZmZXJSb3coY3Vyc29yKSB7XG4gICAgY29uc3Qgc2NyZWVuUm93ID0gdGhpcy51dGlscy5nZXRWYWxpZFZpbVNjcmVlblJvdyh0aGlzLmVkaXRvciwgY3Vyc29yLmdldFNjcmVlblJvdygpICsgdGhpcy5nZXRBbW91bnRPZlJvd3MoKSlcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHNjcmVlblJvdylcbiAgfVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgY29uc3QgYnVmZmVyUm93ID0gdGhpcy5nZXRCdWZmZXJSb3coY3Vyc29yKVxuICAgIHRoaXMuc2V0Q3Vyc29yQnVmZmVyUm93KGN1cnNvciwgdGhpcy5nZXRCdWZmZXJSb3coY3Vyc29yKSwge2F1dG9zY3JvbGw6IGZhbHNlfSlcblxuICAgIGlmIChjdXJzb3IuaXNMYXN0Q3Vyc29yKCkpIHtcbiAgICAgIGlmICh0aGlzLmlzU21vb3RoU2Nyb2xsRW5hYmxlZCgpKSB0aGlzLnZpbVN0YXRlLmZpbmlzaFNjcm9sbEFuaW1hdGlvbigpXG5cbiAgICAgIGNvbnN0IGZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgPSB0aGlzLmVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICAgY29uc3QgbmV3Rmlyc3RWaXNpYmlsZUJ1ZmZlclJvdyA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhcbiAgICAgICAgZmlyc3RWaXNpYmlsZVNjcmVlblJvdyArIHRoaXMuZ2V0QW1vdW50T2ZSb3dzKClcbiAgICAgIClcbiAgICAgIGNvbnN0IG5ld0ZpcnN0VmlzaWJpbGVTY3JlZW5Sb3cgPSB0aGlzLmVkaXRvci5zY3JlZW5Sb3dGb3JCdWZmZXJSb3cobmV3Rmlyc3RWaXNpYmlsZUJ1ZmZlclJvdylcbiAgICAgIGNvbnN0IGRvbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdyhuZXdGaXJzdFZpc2liaWxlU2NyZWVuUm93KVxuICAgICAgICAvLyBbRklYTUVdIHNvbWV0aW1lcywgc2Nyb2xsVG9wIGlzIG5vdCB1cGRhdGVkLCBjYWxsaW5nIHRoaXMgZml4LlxuICAgICAgICAvLyBJbnZlc3RpZ2F0ZSBhbmQgZmluZCBiZXR0ZXIgYXBwcm9hY2ggdGhlbiByZW1vdmUgdGhpcyB3b3JrYXJvdW5kLlxuICAgICAgICBpZiAodGhpcy5lZGl0b3IuZWxlbWVudC5jb21wb25lbnQpIHRoaXMuZWRpdG9yLmVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1Ntb290aFNjcm9sbEVuYWJsZWQoKSkgdGhpcy5zbW9vdGhTY3JvbGwoZmlyc3RWaXNpYmlsZVNjcmVlblJvdywgbmV3Rmlyc3RWaXNpYmlsZVNjcmVlblJvdywgZG9uZSlcbiAgICAgIGVsc2UgZG9uZSgpXG4gICAgfVxuICB9XG59XG5TY3JvbGwucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIGtleW1hcDogY3RybC1mXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuRG93biBleHRlbmRzIFNjcm9sbCB7XG4gIGFtb3VudE9mUGFnZSA9ICsxXG59XG5TY3JvbGxGdWxsU2NyZWVuRG93bi5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogY3RybC1iXG5jbGFzcyBTY3JvbGxGdWxsU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSAtMVxufVxuU2Nyb2xsRnVsbFNjcmVlblVwLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiBjdHJsLWRcbmNsYXNzIFNjcm9sbEhhbGZTY3JlZW5Eb3duIGV4dGVuZHMgU2Nyb2xsIHtcbiAgYW1vdW50T2ZQYWdlID0gKzEgLyAyXG59XG5TY3JvbGxIYWxmU2NyZWVuRG93bi5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogY3RybC11XG5jbGFzcyBTY3JvbGxIYWxmU2NyZWVuVXAgZXh0ZW5kcyBTY3JvbGwge1xuICBhbW91bnRPZlBhZ2UgPSAtMSAvIDJcbn1cblNjcm9sbEhhbGZTY3JlZW5VcC5yZWdpc3RlcigpXG5cbi8vIEZpbmRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogZlxuY2xhc3MgRmluZCBleHRlbmRzIE1vdGlvbiB7XG4gIGJhY2t3YXJkcyA9IGZhbHNlXG4gIGluY2x1c2l2ZSA9IHRydWVcbiAgb2Zmc2V0ID0gMFxuICByZXF1aXJlSW5wdXQgPSB0cnVlXG4gIGNhc2VTZW5zaXRpdml0eUtpbmQgPSBcIkZpbmRcIlxuXG4gIHJlc3RvcmVFZGl0b3JTdGF0ZSgpIHtcbiAgICBpZiAodGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlKSB0aGlzLl9yZXN0b3JlRWRpdG9yU3RhdGUoKVxuICAgIHRoaXMuX3Jlc3RvcmVFZGl0b3JTdGF0ZSA9IG51bGxcbiAgfVxuXG4gIGNhbmNlbE9wZXJhdGlvbigpIHtcbiAgICB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG4gICAgc3VwZXIuY2FuY2VsT3BlcmF0aW9uKClcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMuZ2V0Q29uZmlnKFwicmV1c2VGaW5kRm9yUmVwZWF0RmluZFwiKSkgdGhpcy5yZXBlYXRJZk5lY2Vzc2FyeSgpXG4gICAgaWYgKCF0aGlzLmlzQ29tcGxldGUoKSkge1xuICAgICAgY29uc3QgY2hhcnNNYXggPSB0aGlzLmdldENvbmZpZyhcImZpbmRDaGFyc01heFwiKVxuICAgICAgY29uc3Qgb3B0aW9uc0Jhc2UgPSB7cHVycG9zZTogXCJmaW5kXCIsIGNoYXJzTWF4fVxuXG4gICAgICBpZiAoY2hhcnNNYXggPT09IDEpIHtcbiAgICAgICAgdGhpcy5mb2N1c0lucHV0KG9wdGlvbnNCYXNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVzdG9yZUVkaXRvclN0YXRlID0gdGhpcy51dGlscy5zYXZlRWRpdG9yU3RhdGUodGhpcy5lZGl0b3IpXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgYXV0b0NvbmZpcm1UaW1lb3V0OiB0aGlzLmdldENvbmZpZyhcImZpbmRDb25maXJtQnlUaW1lb3V0XCIpLFxuICAgICAgICAgIG9uQ29uZmlybTogaW5wdXQgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dCA9IGlucHV0XG4gICAgICAgICAgICBpZiAoaW5wdXQpIHRoaXMucHJvY2Vzc09wZXJhdGlvbigpXG4gICAgICAgICAgICBlbHNlIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2hhbmdlOiBwcmVDb25maXJtZWRDaGFycyA9PiB7XG4gICAgICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzID0gcHJlQ29uZmlybWVkQ2hhcnNcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0VGV4dEluQ3Vyc29yUm93cyh0aGlzLnByZUNvbmZpcm1lZENoYXJzLCBcInByZS1jb25maXJtXCIsIHRoaXMuaXNCYWNrd2FyZHMoKSlcbiAgICAgICAgICB9LFxuICAgICAgICAgIG9uQ2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpbVN0YXRlLmhpZ2hsaWdodEZpbmQuY2xlYXJNYXJrZXJzKClcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvbW1hbmRzOiB7XG4gICAgICAgICAgICBcInZpbS1tb2RlLXBsdXM6ZmluZC1uZXh0LXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKCsxKSxcbiAgICAgICAgICAgIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIjogKCkgPT4gdGhpcy5maW5kUHJlQ29uZmlybWVkKC0xKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9jdXNJbnB1dChPYmplY3QuYXNzaWduKG9wdGlvbnMsIG9wdGlvbnNCYXNlKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZmluZFByZUNvbmZpcm1lZChkZWx0YSkge1xuICAgIGlmICh0aGlzLnByZUNvbmZpcm1lZENoYXJzICYmIHRoaXMuZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIikpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5oaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKFxuICAgICAgICB0aGlzLnByZUNvbmZpcm1lZENoYXJzLFxuICAgICAgICBcInByZS1jb25maXJtXCIsXG4gICAgICAgIHRoaXMuaXNCYWNrd2FyZHMoKSxcbiAgICAgICAgdGhpcy5nZXRDb3VudCgtMSkgKyBkZWx0YSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgICAgdGhpcy5jb3VudCA9IGluZGV4ICsgMVxuICAgIH1cbiAgfVxuXG4gIHJlcGVhdElmTmVjZXNzYXJ5KCkge1xuICAgIGNvbnN0IGZpbmRDb21tYW5kTmFtZXMgPSBbXCJGaW5kXCIsIFwiRmluZEJhY2t3YXJkc1wiLCBcIlRpbGxcIiwgXCJUaWxsQmFja3dhcmRzXCJdXG4gICAgY29uc3QgY3VycmVudEZpbmQgPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImN1cnJlbnRGaW5kXCIpXG4gICAgaWYgKGN1cnJlbnRGaW5kICYmIGZpbmRDb21tYW5kTmFtZXMuaW5jbHVkZXModGhpcy52aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5nZXRMYXN0Q29tbWFuZE5hbWUoKSkpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSBjdXJyZW50RmluZC5pbnB1dFxuICAgICAgdGhpcy5yZXBlYXRlZCA9IHRydWVcbiAgICB9XG4gIH1cblxuICBpc0JhY2t3YXJkcygpIHtcbiAgICByZXR1cm4gdGhpcy5iYWNrd2FyZHNcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gICAgbGV0IGRlY29yYXRpb25UeXBlID0gXCJwb3N0LWNvbmZpcm1cIlxuICAgIGlmICh0aGlzLm9wZXJhdG9yICYmICF0aGlzLm9wZXJhdG9yLmluc3RhbmNlb2YoXCJTZWxlY3RCYXNlXCIpKSB7XG4gICAgICBkZWNvcmF0aW9uVHlwZSArPSBcIiBsb25nXCJcbiAgICB9XG5cbiAgICAvLyBIQUNLOiBXaGVuIHJlcGVhdGVkIGJ5IFwiLFwiLCB0aGlzLmJhY2t3YXJkcyBpcyB0ZW1wb3JhcnkgaW52ZXJ0ZWQgYW5kXG4gICAgLy8gcmVzdG9yZWQgYWZ0ZXIgZXhlY3V0aW9uIGZpbmlzaGVkLlxuICAgIC8vIEJ1dCBmaW5hbCBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzIGlzIGV4ZWN1dGVkIGluIGFzeW5jKD1hZnRlciBvcGVyYXRpb24gZmluaXNoZWQpLlxuICAgIC8vIFRodXMgd2UgbmVlZCB0byBwcmVzZXJ2ZSBiZWZvcmUgcmVzdG9yZWQgYGJhY2t3YXJkc2AgdmFsdWUgYW5kIHBhc3MgaXQuXG4gICAgY29uc3QgYmFja3dhcmRzID0gdGhpcy5pc0JhY2t3YXJkcygpXG4gICAgdGhpcy5lZGl0b3IuY29tcG9uZW50LmdldE5leHRVcGRhdGVQcm9taXNlKCkudGhlbigoKSA9PiB7XG4gICAgICB0aGlzLmhpZ2hsaWdodFRleHRJbkN1cnNvclJvd3ModGhpcy5pbnB1dCwgZGVjb3JhdGlvblR5cGUsIGJhY2t3YXJkcylcbiAgICB9KVxuICB9XG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgY29uc3Qgc2NhblJhbmdlID0gdGhpcy5lZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3coZnJvbVBvaW50LnJvdylcbiAgICBjb25zdCBwb2ludHMgPSBbXVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nZXRSZWdleCh0aGlzLmlucHV0KVxuICAgIGNvbnN0IGluZGV4V2FudEFjY2VzcyA9IHRoaXMuZ2V0Q291bnQoLTEpXG5cbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG5ldyBQb2ludCgwLCB0aGlzLmlzQmFja3dhcmRzKCkgPyB0aGlzLm9mZnNldCA6IC10aGlzLm9mZnNldClcbiAgICBpZiAodGhpcy5yZXBlYXRlZCkge1xuICAgICAgZnJvbVBvaW50ID0gZnJvbVBvaW50LnRyYW5zbGF0ZSh0cmFuc2xhdGlvbi5uZWdhdGUoKSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc0JhY2t3YXJkcygpKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmaW5kQWNyb3NzTGluZXNcIikpIHNjYW5SYW5nZS5zdGFydCA9IFBvaW50LlpFUk9cblxuICAgICAgdGhpcy5lZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICAgIHBvaW50cy5wdXNoKHJhbmdlLnN0YXJ0KVxuICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID4gaW5kZXhXYW50QWNjZXNzKSB7XG4gICAgICAgICAgICBzdG9wKClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmdldENvbmZpZyhcImZpbmRBY3Jvc3NMaW5lc1wiKSkgc2NhblJhbmdlLmVuZCA9IHRoaXMuZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHRoaXMuZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICAgIGlmIChyYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgICBwb2ludHMucHVzaChyYW5nZS5zdGFydClcbiAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA+IGluZGV4V2FudEFjY2Vzcykge1xuICAgICAgICAgICAgc3RvcCgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IHBvaW50ID0gcG9pbnRzW2luZGV4V2FudEFjY2Vzc11cbiAgICBpZiAocG9pbnQpIHJldHVybiBwb2ludC50cmFuc2xhdGUodHJhbnNsYXRpb24pXG4gIH1cblxuICAvLyBGSVhNRTogYmFkIG5hbWluZywgdGhpcyBmdW5jdGlvbiBtdXN0IHJldHVybiBpbmRleFxuICBoaWdobGlnaHRUZXh0SW5DdXJzb3JSb3dzKHRleHQsIGRlY29yYXRpb25UeXBlLCBiYWNrd2FyZHMsIGluZGV4ID0gdGhpcy5nZXRDb3VudCgtMSksIGFkanVzdEluZGV4ID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMuZ2V0Q29uZmlnKFwiaGlnaGxpZ2h0RmluZENoYXJcIikpIHJldHVyblxuXG4gICAgcmV0dXJuIHRoaXMudmltU3RhdGUuaGlnaGxpZ2h0RmluZC5oaWdobGlnaHRDdXJzb3JSb3dzKFxuICAgICAgdGhpcy5nZXRSZWdleCh0ZXh0KSxcbiAgICAgIGRlY29yYXRpb25UeXBlLFxuICAgICAgYmFja3dhcmRzLFxuICAgICAgdGhpcy5vZmZzZXQsXG4gICAgICBpbmRleCxcbiAgICAgIGFkanVzdEluZGV4XG4gICAgKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgaWYgKHBvaW50KSBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgZWxzZSB0aGlzLnJlc3RvcmVFZGl0b3JTdGF0ZSgpXG5cbiAgICBpZiAoIXRoaXMucmVwZWF0ZWQpIHRoaXMuZ2xvYmFsU3RhdGUuc2V0KFwiY3VycmVudEZpbmRcIiwgdGhpcylcbiAgfVxuXG4gIGdldFJlZ2V4KHRlcm0pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSB0aGlzLmlzQ2FzZVNlbnNpdGl2ZSh0ZXJtKSA/IFwiZ1wiIDogXCJnaVwiXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZGlmaWVycylcbiAgfVxufVxuRmluZC5yZWdpc3RlcigpXG5cbi8vIGtleW1hcDogRlxuY2xhc3MgRmluZEJhY2t3YXJkcyBleHRlbmRzIEZpbmQge1xuICBpbmNsdXNpdmUgPSBmYWxzZVxuICBiYWNrd2FyZHMgPSB0cnVlXG59XG5GaW5kQmFja3dhcmRzLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiB0XG5jbGFzcyBUaWxsIGV4dGVuZHMgRmluZCB7XG4gIG9mZnNldCA9IDFcbiAgZ2V0UG9pbnQoLi4uYXJncykge1xuICAgIGNvbnN0IHBvaW50ID0gc3VwZXIuZ2V0UG9pbnQoLi4uYXJncylcbiAgICB0aGlzLm1vdmVTdWNjZWVkZWQgPSBwb2ludCAhPSBudWxsXG4gICAgcmV0dXJuIHBvaW50XG4gIH1cbn1cblRpbGwucmVnaXN0ZXIoKVxuXG4vLyBrZXltYXA6IFRcbmNsYXNzIFRpbGxCYWNrd2FyZHMgZXh0ZW5kcyBUaWxsIHtcbiAgaW5jbHVzaXZlID0gZmFsc2VcbiAgYmFja3dhcmRzID0gdHJ1ZVxufVxuVGlsbEJhY2t3YXJkcy5yZWdpc3RlcigpXG5cbi8vIE1hcmtcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIGtleW1hcDogYFxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbiB7XG4gIGp1bXAgPSB0cnVlXG4gIHJlcXVpcmVJbnB1dCA9IHRydWVcbiAgaW5wdXQgPSBudWxsXG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAoIXRoaXMuaXNDb21wbGV0ZSgpKSB0aGlzLnJlYWRDaGFyKClcbiAgICByZXR1cm4gc3VwZXIuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBnZXRQb2ludCgpIHtcbiAgICByZXR1cm4gdGhpcy52aW1TdGF0ZS5tYXJrLmdldCh0aGlzLmlucHV0KVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoKVxuICAgIGlmIChwb2ludCkge1xuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuICAgICAgY3Vyc29yLmF1dG9zY3JvbGwoe2NlbnRlcjogdHJ1ZX0pXG4gICAgfVxuICB9XG59XG5Nb3ZlVG9NYXJrLnJlZ2lzdGVyKClcblxuLy8ga2V5bWFwOiAnXG5jbGFzcyBNb3ZlVG9NYXJrTGluZSBleHRlbmRzIE1vdmVUb01hcmsge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgZ2V0UG9pbnQoKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzdXBlci5nZXRQb2ludCgpXG4gICAgaWYgKHBvaW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICB9XG4gIH1cbn1cbk1vdmVUb01hcmtMaW5lLnJlZ2lzdGVyKClcblxuLy8gRm9sZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQgZXh0ZW5kcyBNb3Rpb24ge1xuICB3aXNlID0gXCJjaGFyYWN0ZXJ3aXNlXCJcbiAgd2hpY2ggPSBcInN0YXJ0XCJcbiAgZGlyZWN0aW9uID0gXCJwcmV2XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucm93cyA9IHRoaXMuZ2V0Rm9sZFJvd3ModGhpcy53aGljaClcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IFwicHJldlwiKSB0aGlzLnJvd3MucmV2ZXJzZSgpXG5cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIGdldEZvbGRSb3dzKHdoaWNoKSB7XG4gICAgY29uc3QgaW5kZXggPSB3aGljaCA9PT0gXCJzdGFydFwiID8gMCA6IDFcbiAgICBjb25zdCByb3dzID0gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJvd1Jhbmdlcyh0aGlzLmVkaXRvcikubWFwKHJvd1JhbmdlID0+IHJvd1JhbmdlW2luZGV4XSlcbiAgICByZXR1cm4gXy5zb3J0QnkoXy51bmlxKHJvd3MpLCByb3cgPT4gcm93KVxuICB9XG5cbiAgZ2V0U2NhblJvd3MoY3Vyc29yKSB7XG4gICAgY29uc3QgY3Vyc29yUm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgY29uc3QgaXNWYWxkID0gdGhpcy5kaXJlY3Rpb24gPT09IFwicHJldlwiID8gcm93ID0+IHJvdyA8IGN1cnNvclJvdyA6IHJvdyA9PiByb3cgPiBjdXJzb3JSb3dcbiAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihpc1ZhbGQpXG4gIH1cblxuICBkZXRlY3RSb3coY3Vyc29yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKVswXVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICB0aGlzLm1vdmVDdXJzb3JDb3VudFRpbWVzKGN1cnNvciwgKCkgPT4ge1xuICAgICAgY29uc3Qgcm93ID0gdGhpcy5kZXRlY3RSb3coY3Vyc29yKVxuICAgICAgaWYgKHJvdyAhPSBudWxsKSB0aGlzLnV0aWxzLm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3coY3Vyc29yLCByb3cpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0IGV4dGVuZHMgTW92ZVRvUHJldmlvdXNGb2xkU3RhcnQge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZvbGRTdGFydC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICBjb25zdCBiYXNlSW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NhblJvd3MoY3Vyc29yKS5maW5kKHJvdyA9PiB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpID09PSBiYXNlSW5kZW50TGV2ZWwpXG4gIH1cbn1cbk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZFN0YXJ0V2l0aFNhbWVJbmRlbnQgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydFdpdGhTYW1lSW5kZW50IHtcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcbn1cbk1vdmVUb05leHRGb2xkU3RhcnRXaXRoU2FtZUluZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0IHtcbiAgd2hpY2ggPSBcImVuZFwiXG59XG5Nb3ZlVG9QcmV2aW91c0ZvbGRFbmQucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9OZXh0Rm9sZEVuZCBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRm9sZEVuZCB7XG4gIGRpcmVjdGlvbiA9IFwibmV4dFwiXG59XG5Nb3ZlVG9OZXh0Rm9sZEVuZC5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24gZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c0ZvbGRTdGFydCB7XG4gIGRpcmVjdGlvbiA9IFwicHJldlwiXG4gIGRldGVjdFJvdyhjdXJzb3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTY2FuUm93cyhjdXJzb3IpLmZpbmQocm93ID0+IHRoaXMudXRpbHMuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyh0aGlzLmVkaXRvciwgcm93KSlcbiAgfVxufVxuTW92ZVRvUHJldmlvdXNGdW5jdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHRGdW5jdGlvbiBleHRlbmRzIE1vdmVUb1ByZXZpb3VzRnVuY3Rpb24ge1xuICBkaXJlY3Rpb24gPSBcIm5leHRcIlxufVxuTW92ZVRvTmV4dEZ1bmN0aW9uLnJlZ2lzdGVyKClcblxuLy8gU2NvcGUgYmFzZWRcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSBleHRlbmRzIE1vdGlvbiB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwiLlwiXG5cbiAgZ2V0UG9pbnQoZnJvbVBvaW50KSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUodGhpcy5lZGl0b3IsIGZyb21Qb2ludCwgdGhpcy5kaXJlY3Rpb24sIHRoaXMuc2NvcGUpXG4gIH1cblxuICBtb3ZlQ3Vyc29yKGN1cnNvcikge1xuICAgIHRoaXMubW92ZUN1cnNvckNvdW50VGltZXMoY3Vyc29yLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldEJ1ZmZlclBvc2l0aW9uU2FmZWx5KGN1cnNvciwgdGhpcy5nZXRQb2ludChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkpXG4gICAgfSlcbiAgfVxufVxuTW92ZVRvUG9zaXRpb25CeVNjb3BlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1N0cmluZyBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwic3RyaW5nLmJlZ2luXCJcbn1cbk1vdmVUb1ByZXZpb3VzU3RyaW5nLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dFN0cmluZyBleHRlbmRzIE1vdmVUb1ByZXZpb3VzU3RyaW5nIHtcbiAgZGlyZWN0aW9uID0gXCJmb3J3YXJkXCJcbn1cbk1vdmVUb05leHRTdHJpbmcucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c051bWJlciBleHRlbmRzIE1vdmVUb1Bvc2l0aW9uQnlTY29wZSB7XG4gIGRpcmVjdGlvbiA9IFwiYmFja3dhcmRcIlxuICBzY29wZSA9IFwiY29uc3RhbnQubnVtZXJpY1wiXG59XG5Nb3ZlVG9QcmV2aW91c051bWJlci5yZWdpc3RlcigpXG5cbmNsYXNzIE1vdmVUb05leHROdW1iZXIgZXh0ZW5kcyBNb3ZlVG9QcmV2aW91c051bWJlciB7XG4gIGRpcmVjdGlvbiA9IFwiZm9yd2FyZFwiXG59XG5Nb3ZlVG9OZXh0TnVtYmVyLnJlZ2lzdGVyKClcblxuY2xhc3MgTW92ZVRvTmV4dE9jY3VycmVuY2UgZXh0ZW5kcyBNb3Rpb24ge1xuICAvLyBFbnN1cmUgdGhpcyBjb21tYW5kIGlzIGF2YWlsYWJsZSB3aGVuIG9ubHkgaGFzLW9jY3VycmVuY2VcbiAgc3RhdGljIGNvbW1hbmRTY29wZSA9IFwiYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmhhcy1vY2N1cnJlbmNlXCJcbiAganVtcCA9IHRydWVcbiAgZGlyZWN0aW9uID0gXCJuZXh0XCJcblxuICBleGVjdXRlKCkge1xuICAgIHRoaXMucmFuZ2VzID0gdGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpLm1hcChtYXJrZXIgPT4gbWFya2VyLmdldEJ1ZmZlclJhbmdlKCkpKVxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuICB9XG5cbiAgbW92ZUN1cnNvcihjdXJzb3IpIHtcbiAgICBjb25zdCByYW5nZSA9IHRoaXMucmFuZ2VzW3RoaXMudXRpbHMuZ2V0SW5kZXgodGhpcy5nZXRJbmRleChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSksIHRoaXMucmFuZ2VzKV1cbiAgICBjb25zdCBwb2ludCA9IHJhbmdlLnN0YXJ0XG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7YXV0b3Njcm9sbDogZmFsc2V9KVxuXG4gICAgaWYgKGN1cnNvci5pc0xhc3RDdXJzb3IoKSkge1xuICAgICAgdGhpcy5lZGl0b3IudW5mb2xkQnVmZmVyUm93KHBvaW50LnJvdylcbiAgICAgIHRoaXMudXRpbHMuc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCBwb2ludClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uTW92ZVRvT2NjdXJyZW5jZVwiKSkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZSwge3R5cGU6IFwic2VhcmNoXCJ9KVxuICAgIH1cbiAgfVxuXG4gIGdldEluZGV4KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5yYW5nZXMuZmluZEluZGV4KHJhbmdlID0+IHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KSlcbiAgICByZXR1cm4gKGluZGV4ID49IDAgPyBpbmRleCA6IDApICsgdGhpcy5nZXRDb3VudCgtMSlcbiAgfVxufVxuTW92ZVRvTmV4dE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c09jY3VycmVuY2UgZXh0ZW5kcyBNb3ZlVG9OZXh0T2NjdXJyZW5jZSB7XG4gIGRpcmVjdGlvbiA9IFwicHJldmlvdXNcIlxuXG4gIGdldEluZGV4KGZyb21Qb2ludCkge1xuICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMucmFuZ2VzLnNsaWNlKCkucmV2ZXJzZSgpXG4gICAgY29uc3QgcmFuZ2UgPSByYW5nZXMuZmluZChyYW5nZSA9PiByYW5nZS5lbmQuaXNMZXNzVGhhbihmcm9tUG9pbnQpKVxuICAgIGNvbnN0IGluZGV4ID0gcmFuZ2UgPyB0aGlzLnJhbmdlcy5pbmRleE9mKHJhbmdlKSA6IHRoaXMucmFuZ2VzLmxlbmd0aCAtIDFcbiAgICByZXR1cm4gaW5kZXggLSB0aGlzLmdldENvdW50KC0xKVxuICB9XG59XG5Nb3ZlVG9QcmV2aW91c09jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBrZXltYXA6ICVcbmNsYXNzIE1vdmVUb1BhaXIgZXh0ZW5kcyBNb3Rpb24ge1xuICBpbmNsdXNpdmUgPSB0cnVlXG4gIGp1bXAgPSB0cnVlXG4gIG1lbWJlciA9IFtcIlBhcmVudGhlc2lzXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiXVxuXG4gIG1vdmVDdXJzb3IoY3Vyc29yKSB7XG4gICAgdGhpcy5zZXRCdWZmZXJQb3NpdGlvblNhZmVseShjdXJzb3IsIHRoaXMuZ2V0UG9pbnQoY3Vyc29yKSlcbiAgfVxuXG4gIGdldFBvaW50Rm9yVGFnKHBvaW50KSB7XG4gICAgY29uc3QgcGFpckluZm8gPSB0aGlzLmdldEluc3RhbmNlKFwiQVRhZ1wiKS5nZXRQYWlySW5mbyhwb2ludClcbiAgICBpZiAoIXBhaXJJbmZvKSByZXR1cm5cblxuICAgIGxldCB7b3BlblJhbmdlLCBjbG9zZVJhbmdlfSA9IHBhaXJJbmZvXG4gICAgb3BlblJhbmdlID0gb3BlblJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGNsb3NlUmFuZ2UgPSBjbG9zZVJhbmdlLnRyYW5zbGF0ZShbMCwgKzFdLCBbMCwgLTFdKVxuICAgIGlmIChvcGVuUmFuZ2UuY29udGFpbnNQb2ludChwb2ludCkgJiYgIXBvaW50LmlzRXF1YWwob3BlblJhbmdlLmVuZCkpIHtcbiAgICAgIHJldHVybiBjbG9zZVJhbmdlLnN0YXJ0XG4gICAgfVxuICAgIGlmIChjbG9zZVJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpICYmICFwb2ludC5pc0VxdWFsKGNsb3NlUmFuZ2UuZW5kKSkge1xuICAgICAgcmV0dXJuIG9wZW5SYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuXG4gIGdldFBvaW50KGN1cnNvcikge1xuICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBjb25zdCBjdXJzb3JSb3cgPSBjdXJzb3JQb3NpdGlvbi5yb3dcbiAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnRGb3JUYWcoY3Vyc29yUG9zaXRpb24pXG4gICAgaWYgKHBvaW50KSByZXR1cm4gcG9pbnRcblxuICAgIC8vIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIHJldHVybiBmb3J3YXJkaW5nIHJhbmdlIG9yIGVuY2xvc2luZyByYW5nZS5cbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2UoXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiLCB7bWVtYmVyOiB0aGlzLm1lbWJlcn0pLmdldFJhbmdlKGN1cnNvci5zZWxlY3Rpb24pXG4gICAgaWYgKCFyYW5nZSkgcmV0dXJuXG5cbiAgICBjb25zdCB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgIGlmIChzdGFydC5yb3cgPT09IGN1cnNvclJvdyAmJiBzdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChjdXJzb3JQb3NpdGlvbikpIHtcbiAgICAgIC8vIEZvcndhcmRpbmcgcmFuZ2UgZm91bmRcbiAgICAgIHJldHVybiBlbmQudHJhbnNsYXRlKFswLCAtMV0pXG4gICAgfSBlbHNlIGlmIChlbmQucm93ID09PSBjdXJzb3JQb3NpdGlvbi5yb3cpIHtcbiAgICAgIC8vIEVuY2xvc2luZyByYW5nZSB3YXMgcmV0dXJuZWRcbiAgICAgIC8vIFdlIG1vdmUgdG8gc3RhcnQoIG9wZW4tcGFpciApIG9ubHkgd2hlbiBjbG9zZS1wYWlyIHdhcyBhdCBzYW1lIHJvdyBhcyBjdXJzb3Itcm93LlxuICAgICAgcmV0dXJuIHN0YXJ0XG4gICAgfVxuICB9XG59XG5Nb3ZlVG9QYWlyLnJlZ2lzdGVyKClcbiJdfQ==