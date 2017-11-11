(function() {
  var AllWhitespace, CurrentSelection, Motion, MotionError, MotionWithInput, MoveDown, MoveLeft, MoveRight, MoveToAbsoluteLine, MoveToBeginningOfLine, MoveToBottomOfScreen, MoveToEndOfWholeWord, MoveToEndOfWord, MoveToFirstCharacterOfLine, MoveToFirstCharacterOfLineAndDown, MoveToFirstCharacterOfLineDown, MoveToFirstCharacterOfLineUp, MoveToLastCharacterOfLine, MoveToLastNonblankCharacterOfLineAndDown, MoveToLine, MoveToMiddleOfScreen, MoveToNextParagraph, MoveToNextSentence, MoveToNextWholeWord, MoveToNextWord, MoveToPreviousParagraph, MoveToPreviousSentence, MoveToPreviousWholeWord, MoveToPreviousWord, MoveToRelativeLine, MoveToScreenLine, MoveToStartOfFile, MoveToTopOfScreen, MoveUp, Point, Range, ScrollFullDownKeepCursor, ScrollFullUpKeepCursor, ScrollHalfDownKeepCursor, ScrollHalfUpKeepCursor, ScrollKeepingCursor, WholeWordOrEmptyLineRegex, WholeWordRegex, _, ref, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  settings = require('../settings');

  WholeWordRegex = /\S+/;

  WholeWordOrEmptyLineRegex = /^\s*$|\S+/;

  AllWhitespace = /^\s$/;

  MotionError = (function() {
    function MotionError(message) {
      this.message = message;
      this.name = 'Motion Error';
    }

    return MotionError;

  })();

  Motion = (function() {
    Motion.prototype.operatesInclusively = false;

    Motion.prototype.operatesLinewise = false;

    function Motion(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
    }

    Motion.prototype.select = function(count, options) {
      var selection, value;
      value = (function() {
        var i, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          selection = ref1[i];
          if (this.isLinewise()) {
            this.moveSelectionLinewise(selection, count, options);
          } else if (this.vimState.mode === 'visual') {
            this.moveSelectionVisual(selection, count, options);
          } else if (this.operatesInclusively) {
            this.moveSelectionInclusively(selection, count, options);
          } else {
            this.moveSelection(selection, count, options);
          }
          results.push(!selection.isEmpty());
        }
        return results;
      }).call(this);
      this.editor.mergeCursors();
      this.editor.mergeIntersectingSelections();
      return value;
    };

    Motion.prototype.execute = function(count) {
      var cursor, i, len, ref1;
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        cursor = ref1[i];
        this.moveCursor(cursor, count);
      }
      return this.editor.mergeCursors();
    };

    Motion.prototype.moveSelectionLinewise = function(selection, count, options) {
      return selection.modifySelection((function(_this) {
        return function() {
          var isEmpty, isReversed, newEndRow, newStartRow, oldEndRow, oldStartRow, ref1, ref2, wasEmpty, wasReversed;
          ref1 = selection.getBufferRowRange(), oldStartRow = ref1[0], oldEndRow = ref1[1];
          wasEmpty = selection.isEmpty();
          wasReversed = selection.isReversed();
          if (!(wasEmpty || wasReversed)) {
            selection.cursor.moveLeft();
          }
          _this.moveCursor(selection.cursor, count, options);
          isEmpty = selection.isEmpty();
          isReversed = selection.isReversed();
          if (!(isEmpty || isReversed)) {
            selection.cursor.moveRight();
          }
          ref2 = selection.getBufferRowRange(), newStartRow = ref2[0], newEndRow = ref2[1];
          if (isReversed && !wasReversed) {
            newEndRow = Math.max(newEndRow, oldStartRow);
          }
          if (wasReversed && !isReversed) {
            newStartRow = Math.min(newStartRow, oldEndRow);
          }
          return selection.setBufferRange([[newStartRow, 0], [newEndRow + 1, 0]], {
            autoscroll: false
          });
        };
      })(this));
    };

    Motion.prototype.moveSelectionInclusively = function(selection, count, options) {
      if (!selection.isEmpty()) {
        return this.moveSelectionVisual(selection, count, options);
      }
      return selection.modifySelection((function(_this) {
        return function() {
          var end, ref1, start;
          _this.moveCursor(selection.cursor, count, options);
          if (selection.isEmpty()) {
            return;
          }
          if (selection.isReversed()) {
            ref1 = selection.getBufferRange(), start = ref1.start, end = ref1.end;
            return selection.setBufferRange([start, [end.row, end.column + 1]]);
          } else {
            return selection.cursor.moveRight();
          }
        };
      })(this));
    };

    Motion.prototype.moveSelectionVisual = function(selection, count, options) {
      return selection.modifySelection((function(_this) {
        return function() {
          var isEmpty, isReversed, newEnd, newStart, oldEnd, oldStart, range, ref1, ref2, ref3, wasEmpty, wasReversed;
          range = selection.getBufferRange();
          ref1 = [range.start, range.end], oldStart = ref1[0], oldEnd = ref1[1];
          wasEmpty = selection.isEmpty();
          wasReversed = selection.isReversed();
          if (!(wasEmpty || wasReversed)) {
            selection.cursor.moveLeft();
          }
          _this.moveCursor(selection.cursor, count, options);
          isEmpty = selection.isEmpty();
          isReversed = selection.isReversed();
          if (!(isEmpty || isReversed)) {
            selection.cursor.moveRight();
          }
          range = selection.getBufferRange();
          ref2 = [range.start, range.end], newStart = ref2[0], newEnd = ref2[1];
          if ((isReversed || isEmpty) && !(wasReversed || wasEmpty)) {
            selection.setBufferRange([newStart, [newEnd.row, oldStart.column + 1]]);
          }
          if (wasReversed && !wasEmpty && !isReversed) {
            selection.setBufferRange([[oldEnd.row, oldEnd.column - 1], newEnd]);
          }
          range = selection.getBufferRange();
          ref3 = [range.start, range.end], newStart = ref3[0], newEnd = ref3[1];
          if (selection.isReversed() && newStart.row === newEnd.row && newStart.column + 1 === newEnd.column) {
            return selection.setBufferRange(range, {
              reversed: false
            });
          }
        };
      })(this));
    };

    Motion.prototype.moveSelection = function(selection, count, options) {
      return selection.modifySelection((function(_this) {
        return function() {
          return _this.moveCursor(selection.cursor, count, options);
        };
      })(this));
    };

    Motion.prototype.isComplete = function() {
      return true;
    };

    Motion.prototype.isRecordable = function() {
      return false;
    };

    Motion.prototype.isLinewise = function() {
      var ref1, ref2;
      if (((ref1 = this.vimState) != null ? ref1.mode : void 0) === 'visual') {
        return ((ref2 = this.vimState) != null ? ref2.submode : void 0) === 'linewise';
      } else {
        return this.operatesLinewise;
      }
    };

    return Motion;

  })();

  CurrentSelection = (function(superClass) {
    extend(CurrentSelection, superClass);

    function CurrentSelection(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      CurrentSelection.__super__.constructor.call(this, this.editor, this.vimState);
      this.lastSelectionRange = this.editor.getSelectedBufferRange();
      this.wasLinewise = this.isLinewise();
    }

    CurrentSelection.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return true;
      });
    };

    CurrentSelection.prototype.select = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.vimState.mode !== 'visual') {
        if (this.wasLinewise) {
          this.selectLines();
        } else {
          this.selectCharacters();
        }
      }
      return _.times(count, function() {
        return true;
      });
    };

    CurrentSelection.prototype.selectLines = function() {
      var cursor, i, lastSelectionExtent, len, ref1, selection;
      lastSelectionExtent = this.lastSelectionRange.getExtent();
      ref1 = this.editor.getSelections();
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        cursor = selection.cursor.getBufferPosition();
        selection.setBufferRange([[cursor.row, 0], [cursor.row + lastSelectionExtent.row, 0]]);
      }
    };

    CurrentSelection.prototype.selectCharacters = function() {
      var i, lastSelectionExtent, len, newEnd, ref1, selection, start;
      lastSelectionExtent = this.lastSelectionRange.getExtent();
      ref1 = this.editor.getSelections();
      for (i = 0, len = ref1.length; i < len; i++) {
        selection = ref1[i];
        start = selection.getBufferRange().start;
        newEnd = start.traverse(lastSelectionExtent);
        selection.setBufferRange([start, newEnd]);
      }
    };

    return CurrentSelection;

  })(Motion);

  MotionWithInput = (function(superClass) {
    extend(MotionWithInput, superClass);

    function MotionWithInput(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      MotionWithInput.__super__.constructor.call(this, this.editor, this.vimState);
      this.complete = false;
    }

    MotionWithInput.prototype.isComplete = function() {
      return this.complete;
    };

    MotionWithInput.prototype.canComposeWith = function(operation) {
      return operation.characters != null;
    };

    MotionWithInput.prototype.compose = function(input) {
      if (!input.characters) {
        throw new MotionError('Must compose with an Input');
      }
      this.input = input;
      return this.complete = true;
    };

    return MotionWithInput;

  })(Motion);

  MoveLeft = (function(superClass) {
    extend(MoveLeft, superClass);

    function MoveLeft() {
      return MoveLeft.__super__.constructor.apply(this, arguments);
    }

    MoveLeft.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        if (!cursor.isAtBeginningOfLine() || settings.wrapLeftRightMotion()) {
          return cursor.moveLeft();
        }
      });
    };

    return MoveLeft;

  })(Motion);

  MoveRight = (function(superClass) {
    extend(MoveRight, superClass);

    function MoveRight() {
      return MoveRight.__super__.constructor.apply(this, arguments);
    }

    MoveRight.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var wrapToNextLine;
          wrapToNextLine = settings.wrapLeftRightMotion();
          if (_this.vimState.mode === 'operator-pending' && !cursor.isAtEndOfLine()) {
            wrapToNextLine = false;
          }
          if (!cursor.isAtEndOfLine()) {
            cursor.moveRight();
          }
          if (wrapToNextLine && cursor.isAtEndOfLine()) {
            return cursor.moveRight();
          }
        };
      })(this));
    };

    return MoveRight;

  })(Motion);

  MoveUp = (function(superClass) {
    extend(MoveUp, superClass);

    function MoveUp() {
      return MoveUp.__super__.constructor.apply(this, arguments);
    }

    MoveUp.prototype.operatesLinewise = true;

    MoveUp.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        if (cursor.getScreenRow() !== 0) {
          return cursor.moveUp();
        }
      });
    };

    return MoveUp;

  })(Motion);

  MoveDown = (function(superClass) {
    extend(MoveDown, superClass);

    function MoveDown() {
      return MoveDown.__super__.constructor.apply(this, arguments);
    }

    MoveDown.prototype.operatesLinewise = true;

    MoveDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          if (cursor.getScreenRow() !== _this.editor.getLastScreenRow()) {
            return cursor.moveDown();
          }
        };
      })(this));
    };

    return MoveDown;

  })(Motion);

  MoveToPreviousWord = (function(superClass) {
    extend(MoveToPreviousWord, superClass);

    function MoveToPreviousWord() {
      return MoveToPreviousWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWord.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfWord();
      });
    };

    return MoveToPreviousWord;

  })(Motion);

  MoveToPreviousWholeWord = (function(superClass) {
    extend(MoveToPreviousWholeWord, superClass);

    function MoveToPreviousWholeWord() {
      return MoveToPreviousWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousWholeWord.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var results;
          cursor.moveToBeginningOfWord();
          results = [];
          while (!_this.isWholeWord(cursor) && !_this.isBeginningOfFile(cursor)) {
            results.push(cursor.moveToBeginningOfWord());
          }
          return results;
        };
      })(this));
    };

    MoveToPreviousWholeWord.prototype.isWholeWord = function(cursor) {
      var char;
      char = cursor.getCurrentWordPrefix().slice(-1);
      return AllWhitespace.test(char);
    };

    MoveToPreviousWholeWord.prototype.isBeginningOfFile = function(cursor) {
      var cur;
      cur = cursor.getBufferPosition();
      return !cur.row && !cur.column;
    };

    return MoveToPreviousWholeWord;

  })(Motion);

  MoveToNextWord = (function(superClass) {
    extend(MoveToNextWord, superClass);

    function MoveToNextWord() {
      return MoveToNextWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWord.prototype.wordRegex = null;

    MoveToNextWord.prototype.moveCursor = function(cursor, count, options) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var current, next;
          current = cursor.getBufferPosition();
          next = (options != null ? options.excludeWhitespace : void 0) ? cursor.getEndOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          }) : cursor.getBeginningOfNextWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          if (_this.isEndOfFile(cursor)) {
            return;
          }
          if (cursor.isAtEndOfLine()) {
            cursor.moveDown();
            cursor.moveToBeginningOfLine();
            return cursor.skipLeadingWhitespace();
          } else if (current.row === next.row && current.column === next.column) {
            return cursor.moveToEndOfWord();
          } else {
            return cursor.setBufferPosition(next);
          }
        };
      })(this));
    };

    MoveToNextWord.prototype.isEndOfFile = function(cursor) {
      var cur, eof;
      cur = cursor.getBufferPosition();
      eof = this.editor.getEofBufferPosition();
      return cur.row === eof.row && cur.column === eof.column;
    };

    return MoveToNextWord;

  })(Motion);

  MoveToNextWholeWord = (function(superClass) {
    extend(MoveToNextWholeWord, superClass);

    function MoveToNextWholeWord() {
      return MoveToNextWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToNextWholeWord.prototype.wordRegex = WholeWordOrEmptyLineRegex;

    return MoveToNextWholeWord;

  })(MoveToNextWord);

  MoveToEndOfWord = (function(superClass) {
    extend(MoveToEndOfWord, superClass);

    function MoveToEndOfWord() {
      return MoveToEndOfWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWord.prototype.operatesInclusively = true;

    MoveToEndOfWord.prototype.wordRegex = null;

    MoveToEndOfWord.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, (function(_this) {
        return function() {
          var current, next;
          current = cursor.getBufferPosition();
          next = cursor.getEndOfCurrentWordBufferPosition({
            wordRegex: _this.wordRegex
          });
          if (next.column > 0) {
            next.column--;
          }
          if (next.isEqual(current)) {
            cursor.moveRight();
            if (cursor.isAtEndOfLine()) {
              cursor.moveDown();
              cursor.moveToBeginningOfLine();
            }
            next = cursor.getEndOfCurrentWordBufferPosition({
              wordRegex: _this.wordRegex
            });
            if (next.column > 0) {
              next.column--;
            }
          }
          return cursor.setBufferPosition(next);
        };
      })(this));
    };

    return MoveToEndOfWord;

  })(Motion);

  MoveToEndOfWholeWord = (function(superClass) {
    extend(MoveToEndOfWholeWord, superClass);

    function MoveToEndOfWholeWord() {
      return MoveToEndOfWholeWord.__super__.constructor.apply(this, arguments);
    }

    MoveToEndOfWholeWord.prototype.wordRegex = WholeWordRegex;

    return MoveToEndOfWholeWord;

  })(MoveToEndOfWord);

  MoveToNextSentence = (function(superClass) {
    extend(MoveToNextSentence, superClass);

    function MoveToNextSentence() {
      return MoveToNextSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToNextSentence.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        var eof, scanRange, start;
        start = cursor.getBufferPosition().translate(new Point(0, 1));
        eof = cursor.editor.getBuffer().getEndPosition();
        scanRange = [start, eof];
        return cursor.editor.scanInBufferRange(/(^$)|(([\.!?] )|^[A-Za-z0-9])/, scanRange, function(arg) {
          var adjustment, matchText, range, stop;
          matchText = arg.matchText, range = arg.range, stop = arg.stop;
          adjustment = new Point(0, 0);
          if (matchText.match(/[\.!?]/)) {
            adjustment = new Point(0, 2);
          }
          cursor.setBufferPosition(range.start.translate(adjustment));
          return stop();
        });
      });
    };

    return MoveToNextSentence;

  })(Motion);

  MoveToPreviousSentence = (function(superClass) {
    extend(MoveToPreviousSentence, superClass);

    function MoveToPreviousSentence() {
      return MoveToPreviousSentence.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousSentence.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        var bof, end, scanRange;
        end = cursor.getBufferPosition().translate(new Point(0, -1));
        bof = cursor.editor.getBuffer().getFirstPosition();
        scanRange = [bof, end];
        return cursor.editor.backwardsScanInBufferRange(/(^$)|(([\.!?] )|^[A-Za-z0-9])/, scanRange, function(arg) {
          var adjustment, matchText, range, stop;
          matchText = arg.matchText, range = arg.range, stop = arg.stop;
          adjustment = new Point(0, 0);
          if (matchText.match(/[\.!?]/)) {
            adjustment = new Point(0, 2);
          }
          cursor.setBufferPosition(range.start.translate(adjustment));
          return stop();
        });
      });
    };

    return MoveToPreviousSentence;

  })(Motion);

  MoveToNextParagraph = (function(superClass) {
    extend(MoveToNextParagraph, superClass);

    function MoveToNextParagraph() {
      return MoveToNextParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToNextParagraph.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfNextParagraph();
      });
    };

    return MoveToNextParagraph;

  })(Motion);

  MoveToPreviousParagraph = (function(superClass) {
    extend(MoveToPreviousParagraph, superClass);

    function MoveToPreviousParagraph() {
      return MoveToPreviousParagraph.__super__.constructor.apply(this, arguments);
    }

    MoveToPreviousParagraph.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfPreviousParagraph();
      });
    };

    return MoveToPreviousParagraph;

  })(Motion);

  MoveToLine = (function(superClass) {
    extend(MoveToLine, superClass);

    function MoveToLine() {
      return MoveToLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLine.prototype.operatesLinewise = true;

    MoveToLine.prototype.getDestinationRow = function(count) {
      if (count != null) {
        return count - 1;
      } else {
        return this.editor.getLineCount() - 1;
      }
    };

    return MoveToLine;

  })(Motion);

  MoveToAbsoluteLine = (function(superClass) {
    extend(MoveToAbsoluteLine, superClass);

    function MoveToAbsoluteLine() {
      return MoveToAbsoluteLine.__super__.constructor.apply(this, arguments);
    }

    MoveToAbsoluteLine.prototype.moveCursor = function(cursor, count) {
      cursor.setBufferPosition([this.getDestinationRow(count), 2e308]);
      cursor.moveToFirstCharacterOfLine();
      if (cursor.getBufferColumn() === 0) {
        return cursor.moveToEndOfLine();
      }
    };

    return MoveToAbsoluteLine;

  })(MoveToLine);

  MoveToRelativeLine = (function(superClass) {
    extend(MoveToRelativeLine, superClass);

    function MoveToRelativeLine() {
      return MoveToRelativeLine.__super__.constructor.apply(this, arguments);
    }

    MoveToRelativeLine.prototype.moveCursor = function(cursor, count) {
      var column, ref1, row;
      if (count == null) {
        count = 1;
      }
      ref1 = cursor.getBufferPosition(), row = ref1.row, column = ref1.column;
      return cursor.setBufferPosition([row + (count - 1), 0]);
    };

    return MoveToRelativeLine;

  })(MoveToLine);

  MoveToScreenLine = (function(superClass) {
    extend(MoveToScreenLine, superClass);

    function MoveToScreenLine(editorElement, vimState, scrolloff) {
      this.editorElement = editorElement;
      this.vimState = vimState;
      this.scrolloff = scrolloff;
      this.scrolloff = 2;
      MoveToScreenLine.__super__.constructor.call(this, this.editorElement.getModel(), this.vimState);
    }

    MoveToScreenLine.prototype.moveCursor = function(cursor, count) {
      var column, ref1, row;
      if (count == null) {
        count = 1;
      }
      ref1 = cursor.getBufferPosition(), row = ref1.row, column = ref1.column;
      return cursor.setScreenPosition([this.getDestinationRow(count), 0]);
    };

    return MoveToScreenLine;

  })(MoveToLine);

  MoveToBeginningOfLine = (function(superClass) {
    extend(MoveToBeginningOfLine, superClass);

    function MoveToBeginningOfLine() {
      return MoveToBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToBeginningOfLine.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        return cursor.moveToBeginningOfLine();
      });
    };

    return MoveToBeginningOfLine;

  })(Motion);

  MoveToFirstCharacterOfLine = (function(superClass) {
    extend(MoveToFirstCharacterOfLine, superClass);

    function MoveToFirstCharacterOfLine() {
      return MoveToFirstCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLine.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        cursor.moveToBeginningOfLine();
        return cursor.moveToFirstCharacterOfLine();
      });
    };

    return MoveToFirstCharacterOfLine;

  })(Motion);

  MoveToFirstCharacterOfLineAndDown = (function(superClass) {
    extend(MoveToFirstCharacterOfLineAndDown, superClass);

    function MoveToFirstCharacterOfLineAndDown() {
      return MoveToFirstCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineAndDown.prototype.operatesLinewise = true;

    MoveToFirstCharacterOfLineAndDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count - 1, function() {
        return cursor.moveDown();
      });
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLineAndDown;

  })(Motion);

  MoveToLastCharacterOfLine = (function(superClass) {
    extend(MoveToLastCharacterOfLine, superClass);

    function MoveToLastCharacterOfLine() {
      return MoveToLastCharacterOfLine.__super__.constructor.apply(this, arguments);
    }

    MoveToLastCharacterOfLine.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      return _.times(count, function() {
        cursor.moveToEndOfLine();
        return cursor.goalColumn = 2e308;
      });
    };

    return MoveToLastCharacterOfLine;

  })(Motion);

  MoveToLastNonblankCharacterOfLineAndDown = (function(superClass) {
    extend(MoveToLastNonblankCharacterOfLineAndDown, superClass);

    function MoveToLastNonblankCharacterOfLineAndDown() {
      return MoveToLastNonblankCharacterOfLineAndDown.__super__.constructor.apply(this, arguments);
    }

    MoveToLastNonblankCharacterOfLineAndDown.prototype.operatesInclusively = true;

    MoveToLastNonblankCharacterOfLineAndDown.prototype.skipTrailingWhitespace = function(cursor) {
      var position, scanRange, startOfTrailingWhitespace;
      position = cursor.getBufferPosition();
      scanRange = cursor.getCurrentLineBufferRange();
      startOfTrailingWhitespace = [scanRange.end.row, scanRange.end.column - 1];
      this.editor.scanInBufferRange(/[ \t]+$/, scanRange, function(arg) {
        var range;
        range = arg.range;
        startOfTrailingWhitespace = range.start;
        return startOfTrailingWhitespace.column -= 1;
      });
      return cursor.setBufferPosition(startOfTrailingWhitespace);
    };

    MoveToLastNonblankCharacterOfLineAndDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count - 1, function() {
        return cursor.moveDown();
      });
      return this.skipTrailingWhitespace(cursor);
    };

    return MoveToLastNonblankCharacterOfLineAndDown;

  })(Motion);

  MoveToFirstCharacterOfLineUp = (function(superClass) {
    extend(MoveToFirstCharacterOfLineUp, superClass);

    function MoveToFirstCharacterOfLineUp() {
      return MoveToFirstCharacterOfLineUp.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineUp.prototype.operatesLinewise = true;

    MoveToFirstCharacterOfLineUp.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count, function() {
        return cursor.moveUp();
      });
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLineUp;

  })(Motion);

  MoveToFirstCharacterOfLineDown = (function(superClass) {
    extend(MoveToFirstCharacterOfLineDown, superClass);

    function MoveToFirstCharacterOfLineDown() {
      return MoveToFirstCharacterOfLineDown.__super__.constructor.apply(this, arguments);
    }

    MoveToFirstCharacterOfLineDown.prototype.operatesLinewise = true;

    MoveToFirstCharacterOfLineDown.prototype.moveCursor = function(cursor, count) {
      if (count == null) {
        count = 1;
      }
      _.times(count, function() {
        return cursor.moveDown();
      });
      cursor.moveToBeginningOfLine();
      return cursor.moveToFirstCharacterOfLine();
    };

    return MoveToFirstCharacterOfLineDown;

  })(Motion);

  MoveToStartOfFile = (function(superClass) {
    extend(MoveToStartOfFile, superClass);

    function MoveToStartOfFile() {
      return MoveToStartOfFile.__super__.constructor.apply(this, arguments);
    }

    MoveToStartOfFile.prototype.moveCursor = function(cursor, count) {
      var column, ref1, row;
      if (count == null) {
        count = 1;
      }
      ref1 = this.editor.getCursorBufferPosition(), row = ref1.row, column = ref1.column;
      cursor.setBufferPosition([this.getDestinationRow(count), 0]);
      if (!this.isLinewise()) {
        return cursor.moveToFirstCharacterOfLine();
      }
    };

    return MoveToStartOfFile;

  })(MoveToLine);

  MoveToTopOfScreen = (function(superClass) {
    extend(MoveToTopOfScreen, superClass);

    function MoveToTopOfScreen() {
      return MoveToTopOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToTopOfScreen.prototype.getDestinationRow = function(count) {
      var firstScreenRow, offset;
      if (count == null) {
        count = 0;
      }
      firstScreenRow = this.editorElement.getFirstVisibleScreenRow();
      if (firstScreenRow > 0) {
        offset = Math.max(count - 1, this.scrolloff);
      } else {
        offset = count > 0 ? count - 1 : count;
      }
      return firstScreenRow + offset;
    };

    return MoveToTopOfScreen;

  })(MoveToScreenLine);

  MoveToBottomOfScreen = (function(superClass) {
    extend(MoveToBottomOfScreen, superClass);

    function MoveToBottomOfScreen() {
      return MoveToBottomOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToBottomOfScreen.prototype.getDestinationRow = function(count) {
      var lastRow, lastScreenRow, offset;
      if (count == null) {
        count = 0;
      }
      lastScreenRow = this.editorElement.getLastVisibleScreenRow();
      lastRow = this.editor.getBuffer().getLastRow();
      if (lastScreenRow !== lastRow) {
        offset = Math.max(count - 1, this.scrolloff);
      } else {
        offset = count > 0 ? count - 1 : count;
      }
      return lastScreenRow - offset;
    };

    return MoveToBottomOfScreen;

  })(MoveToScreenLine);

  MoveToMiddleOfScreen = (function(superClass) {
    extend(MoveToMiddleOfScreen, superClass);

    function MoveToMiddleOfScreen() {
      return MoveToMiddleOfScreen.__super__.constructor.apply(this, arguments);
    }

    MoveToMiddleOfScreen.prototype.getDestinationRow = function() {
      var firstScreenRow, height, lastScreenRow;
      firstScreenRow = this.editorElement.getFirstVisibleScreenRow();
      lastScreenRow = this.editorElement.getLastVisibleScreenRow();
      height = lastScreenRow - firstScreenRow;
      return Math.floor(firstScreenRow + (height / 2));
    };

    return MoveToMiddleOfScreen;

  })(MoveToScreenLine);

  ScrollKeepingCursor = (function(superClass) {
    extend(ScrollKeepingCursor, superClass);

    ScrollKeepingCursor.prototype.operatesLinewise = true;

    ScrollKeepingCursor.prototype.cursorRow = null;

    function ScrollKeepingCursor(editorElement, vimState) {
      this.editorElement = editorElement;
      this.vimState = vimState;
      ScrollKeepingCursor.__super__.constructor.call(this, this.editorElement.getModel(), this.vimState);
    }

    ScrollKeepingCursor.prototype.select = function(count, options) {
      var newTopRow, scrollTop;
      if (this.editor.setFirstVisibleScreenRow != null) {
        newTopRow = this.getNewFirstVisibleScreenRow(count);
        ScrollKeepingCursor.__super__.select.call(this, count, options);
        return this.editor.setFirstVisibleScreenRow(newTopRow);
      } else {
        scrollTop = this.getNewScrollTop(count);
        ScrollKeepingCursor.__super__.select.call(this, count, options);
        return this.editorElement.setScrollTop(scrollTop);
      }
    };

    ScrollKeepingCursor.prototype.execute = function(count) {
      var newTopRow, scrollTop;
      if (this.editor.setFirstVisibleScreenRow != null) {
        newTopRow = this.getNewFirstVisibleScreenRow(count);
        ScrollKeepingCursor.__super__.execute.call(this, count);
        return this.editor.setFirstVisibleScreenRow(newTopRow);
      } else {
        scrollTop = this.getNewScrollTop(count);
        ScrollKeepingCursor.__super__.execute.call(this, count);
        return this.editorElement.setScrollTop(scrollTop);
      }
    };

    ScrollKeepingCursor.prototype.moveCursor = function(cursor) {
      return cursor.setScreenPosition(Point(this.cursorRow, 0), {
        autoscroll: false
      });
    };

    ScrollKeepingCursor.prototype.getNewScrollTop = function(count) {
      var currentCursorRow, currentScrollTop, lineHeight, ref1, rowsPerPage, scrollRows;
      if (count == null) {
        count = 1;
      }
      currentScrollTop = (ref1 = this.editorElement.component.presenter.pendingScrollTop) != null ? ref1 : this.editorElement.getScrollTop();
      currentCursorRow = this.editor.getCursorScreenPosition().row;
      rowsPerPage = this.editor.getRowsPerPage();
      lineHeight = this.editor.getLineHeightInPixels();
      scrollRows = Math.floor(this.pageScrollFraction * rowsPerPage * count);
      this.cursorRow = currentCursorRow + scrollRows;
      return currentScrollTop + scrollRows * lineHeight;
    };

    ScrollKeepingCursor.prototype.getNewFirstVisibleScreenRow = function(count) {
      var currentCursorRow, currentTopRow, rowsPerPage, scrollRows;
      if (count == null) {
        count = 1;
      }
      currentTopRow = this.editor.getFirstVisibleScreenRow();
      currentCursorRow = this.editor.getCursorScreenPosition().row;
      rowsPerPage = this.editor.getRowsPerPage();
      scrollRows = Math.ceil(this.pageScrollFraction * rowsPerPage * count);
      this.cursorRow = currentCursorRow + scrollRows;
      return currentTopRow + scrollRows;
    };

    return ScrollKeepingCursor;

  })(Motion);

  ScrollHalfUpKeepCursor = (function(superClass) {
    extend(ScrollHalfUpKeepCursor, superClass);

    function ScrollHalfUpKeepCursor() {
      return ScrollHalfUpKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfUpKeepCursor.prototype.pageScrollFraction = -1 / 2;

    return ScrollHalfUpKeepCursor;

  })(ScrollKeepingCursor);

  ScrollFullUpKeepCursor = (function(superClass) {
    extend(ScrollFullUpKeepCursor, superClass);

    function ScrollFullUpKeepCursor() {
      return ScrollFullUpKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollFullUpKeepCursor.prototype.pageScrollFraction = -1;

    return ScrollFullUpKeepCursor;

  })(ScrollKeepingCursor);

  ScrollHalfDownKeepCursor = (function(superClass) {
    extend(ScrollHalfDownKeepCursor, superClass);

    function ScrollHalfDownKeepCursor() {
      return ScrollHalfDownKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollHalfDownKeepCursor.prototype.pageScrollFraction = 1 / 2;

    return ScrollHalfDownKeepCursor;

  })(ScrollKeepingCursor);

  ScrollFullDownKeepCursor = (function(superClass) {
    extend(ScrollFullDownKeepCursor, superClass);

    function ScrollFullDownKeepCursor() {
      return ScrollFullDownKeepCursor.__super__.constructor.apply(this, arguments);
    }

    ScrollFullDownKeepCursor.prototype.pageScrollFraction = 1;

    return ScrollFullDownKeepCursor;

  })(ScrollKeepingCursor);

  module.exports = {
    Motion: Motion,
    MotionWithInput: MotionWithInput,
    CurrentSelection: CurrentSelection,
    MoveLeft: MoveLeft,
    MoveRight: MoveRight,
    MoveUp: MoveUp,
    MoveDown: MoveDown,
    MoveToPreviousWord: MoveToPreviousWord,
    MoveToPreviousWholeWord: MoveToPreviousWholeWord,
    MoveToNextWord: MoveToNextWord,
    MoveToNextWholeWord: MoveToNextWholeWord,
    MoveToEndOfWord: MoveToEndOfWord,
    MoveToNextSentence: MoveToNextSentence,
    MoveToPreviousSentence: MoveToPreviousSentence,
    MoveToNextParagraph: MoveToNextParagraph,
    MoveToPreviousParagraph: MoveToPreviousParagraph,
    MoveToAbsoluteLine: MoveToAbsoluteLine,
    MoveToRelativeLine: MoveToRelativeLine,
    MoveToBeginningOfLine: MoveToBeginningOfLine,
    MoveToFirstCharacterOfLineUp: MoveToFirstCharacterOfLineUp,
    MoveToFirstCharacterOfLineDown: MoveToFirstCharacterOfLineDown,
    MoveToFirstCharacterOfLine: MoveToFirstCharacterOfLine,
    MoveToFirstCharacterOfLineAndDown: MoveToFirstCharacterOfLineAndDown,
    MoveToLastCharacterOfLine: MoveToLastCharacterOfLine,
    MoveToLastNonblankCharacterOfLineAndDown: MoveToLastNonblankCharacterOfLineAndDown,
    MoveToStartOfFile: MoveToStartOfFile,
    MoveToTopOfScreen: MoveToTopOfScreen,
    MoveToBottomOfScreen: MoveToBottomOfScreen,
    MoveToMiddleOfScreen: MoveToMiddleOfScreen,
    MoveToEndOfWholeWord: MoveToEndOfWholeWord,
    MotionError: MotionError,
    ScrollHalfUpKeepCursor: ScrollHalfUpKeepCursor,
    ScrollFullUpKeepCursor: ScrollFullUpKeepCursor,
    ScrollHalfDownKeepCursor: ScrollHalfDownKeepCursor,
    ScrollFullDownKeepCursor: ScrollFullDownKeepCursor
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvZ2VuZXJhbC1tb3Rpb25zLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbzNCQUFBO0lBQUE7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxjQUFBLEdBQWlCOztFQUNqQix5QkFBQSxHQUE0Qjs7RUFDNUIsYUFBQSxHQUFnQjs7RUFFVjtJQUNTLHFCQUFDLE9BQUQ7TUFBQyxJQUFDLENBQUEsVUFBRDtNQUNaLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFERzs7Ozs7O0VBR1Q7cUJBQ0osbUJBQUEsR0FBcUI7O3FCQUNyQixnQkFBQSxHQUFrQjs7SUFFTCxnQkFBQyxNQUFELEVBQVUsUUFBVjtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFdBQUQ7SUFBVjs7cUJBRWIsTUFBQSxHQUFRLFNBQUMsS0FBRCxFQUFRLE9BQVI7QUFDTixVQUFBO01BQUEsS0FBQTs7QUFBUTtBQUFBO2FBQUEsc0NBQUE7O1VBQ04sSUFBRyxJQUFDLENBQUEsVUFBRCxDQUFBLENBQUg7WUFDRSxJQUFDLENBQUEscUJBQUQsQ0FBdUIsU0FBdkIsRUFBa0MsS0FBbEMsRUFBeUMsT0FBekMsRUFERjtXQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsS0FBa0IsUUFBckI7WUFDSCxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsU0FBckIsRUFBZ0MsS0FBaEMsRUFBdUMsT0FBdkMsRUFERztXQUFBLE1BRUEsSUFBRyxJQUFDLENBQUEsbUJBQUo7WUFDSCxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsU0FBMUIsRUFBcUMsS0FBckMs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QUxlO0lBS2EsbUNBQUEsaUNBTGI7SUFLZ0QsMkJBQUEseUJBTGhEO0lBTWYsMENBQUEsd0NBTmU7SUFNMkIsbUJBQUEsaUJBTjNCO0lBT2YsbUJBQUEsaUJBUGU7SUFPSSxzQkFBQSxvQkFQSjtJQU8wQixzQkFBQSxvQkFQMUI7SUFPZ0Qsc0JBQUEsb0JBUGhEO0lBT3NFLGFBQUEsV0FQdEU7SUFRZix3QkFBQSxzQkFSZTtJQVFTLHdCQUFBLHNCQVJUO0lBU2YsMEJBQUEsd0JBVGU7SUFTVywwQkFBQSx3QkFUWDs7QUFuZ0JqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXG5XaG9sZVdvcmRSZWdleCA9IC9cXFMrL1xuV2hvbGVXb3JkT3JFbXB0eUxpbmVSZWdleCA9IC9eXFxzKiR8XFxTKy9cbkFsbFdoaXRlc3BhY2UgPSAvXlxccyQvXG5cbmNsYXNzIE1vdGlvbkVycm9yXG4gIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UpIC0+XG4gICAgQG5hbWUgPSAnTW90aW9uIEVycm9yJ1xuXG5jbGFzcyBNb3Rpb25cbiAgb3BlcmF0ZXNJbmNsdXNpdmVseTogZmFsc2VcbiAgb3BlcmF0ZXNMaW5ld2lzZTogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSkgLT5cblxuICBzZWxlY3Q6IChjb3VudCwgb3B0aW9ucykgLT5cbiAgICB2YWx1ZSA9IGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGlmIEBpc0xpbmV3aXNlKClcbiAgICAgICAgQG1vdmVTZWxlY3Rpb25MaW5ld2lzZShzZWxlY3Rpb24sIGNvdW50LCBvcHRpb25zKVxuICAgICAgZWxzZSBpZiBAdmltU3RhdGUubW9kZSBpcyAndmlzdWFsJ1xuICAgICAgICBAbW92ZVNlbGVjdGlvblZpc3VhbChzZWxlY3Rpb24sIGNvdW50LCBvcHRpb25zKVxuICAgICAgZWxzZSBpZiBAb3BlcmF0ZXNJbmNsdXNpdmVseVxuICAgICAgICBAbW92ZVNlbGVjdGlvbkluY2x1c2l2ZWx5KHNlbGVjdGlvbiwgY291bnQsIG9wdGlvbnMpXG4gICAgICBlbHNlXG4gICAgICAgIEBtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbiwgY291bnQsIG9wdGlvbnMpXG4gICAgICBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4gICAgQGVkaXRvci5tZXJnZUN1cnNvcnMoKVxuICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICB2YWx1ZVxuXG4gIGV4ZWN1dGU6IChjb3VudCkgLT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBAbW92ZUN1cnNvcihjdXJzb3IsIGNvdW50KVxuICAgIEBlZGl0b3IubWVyZ2VDdXJzb3JzKClcblxuICBtb3ZlU2VsZWN0aW9uTGluZXdpc2U6IChzZWxlY3Rpb24sIGNvdW50LCBvcHRpb25zKSAtPlxuICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT5cbiAgICAgIFtvbGRTdGFydFJvdywgb2xkRW5kUm93XSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG5cbiAgICAgIHdhc0VtcHR5ID0gc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgd2FzUmV2ZXJzZWQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICB1bmxlc3Mgd2FzRW1wdHkgb3Igd2FzUmV2ZXJzZWRcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG5cbiAgICAgIEBtb3ZlQ3Vyc29yKHNlbGVjdGlvbi5jdXJzb3IsIGNvdW50LCBvcHRpb25zKVxuXG4gICAgICBpc0VtcHR5ID0gc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgaXNSZXZlcnNlZCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIHVubGVzcyBpc0VtcHR5IG9yIGlzUmV2ZXJzZWRcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlUmlnaHQoKVxuXG4gICAgICBbbmV3U3RhcnRSb3csIG5ld0VuZFJvd10gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuXG4gICAgICBpZiBpc1JldmVyc2VkIGFuZCBub3Qgd2FzUmV2ZXJzZWRcbiAgICAgICAgbmV3RW5kUm93ID0gTWF0aC5tYXgobmV3RW5kUm93LCBvbGRTdGFydFJvdylcbiAgICAgIGlmIHdhc1JldmVyc2VkIGFuZCBub3QgaXNSZXZlcnNlZFxuICAgICAgICBuZXdTdGFydFJvdyA9IE1hdGgubWluKG5ld1N0YXJ0Um93LCBvbGRFbmRSb3cpXG5cbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShbW25ld1N0YXJ0Um93LCAwXSwgW25ld0VuZFJvdyArIDEsIDBdXSwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgbW92ZVNlbGVjdGlvbkluY2x1c2l2ZWx5OiAoc2VsZWN0aW9uLCBjb3VudCwgb3B0aW9ucykgLT5cbiAgICByZXR1cm4gQG1vdmVTZWxlY3Rpb25WaXN1YWwoc2VsZWN0aW9uLCBjb3VudCwgb3B0aW9ucykgdW5sZXNzIHNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT5cbiAgICAgIEBtb3ZlQ3Vyc29yKHNlbGVjdGlvbi5jdXJzb3IsIGNvdW50LCBvcHRpb25zKVxuICAgICAgcmV0dXJuIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcblxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICAjIGZvciBiYWNrd2FyZCBtb3Rpb24sIGFkZCB0aGUgb3JpZ2luYWwgc3RhcnRpbmcgY2hhcmFjdGVyIG9mIHRoZSBtb3Rpb25cbiAgICAgICAge3N0YXJ0LCBlbmR9ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgW2VuZC5yb3csIGVuZC5jb2x1bW4gKyAxXV0pXG4gICAgICBlbHNlXG4gICAgICAgICMgZm9yIGZvcndhcmQgbW90aW9uLCBhZGQgdGhlIGVuZGluZyBjaGFyYWN0ZXIgb2YgdGhlIG1vdGlvblxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVSaWdodCgpXG5cbiAgbW92ZVNlbGVjdGlvblZpc3VhbDogKHNlbGVjdGlvbiwgY291bnQsIG9wdGlvbnMpIC0+XG4gICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbiA9PlxuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgW29sZFN0YXJ0LCBvbGRFbmRdID0gW3JhbmdlLnN0YXJ0LCByYW5nZS5lbmRdXG5cbiAgICAgICMgaW4gdmlzdWFsIG1vZGUsIGF0b20gY3Vyc29yIGlzIGFmdGVyIHRoZSBsYXN0IHNlbGVjdGVkIGNoYXJhY3RlcixcbiAgICAgICMgc28gaGVyZSBwdXQgY3Vyc29yIGluIHRoZSBleHBlY3RlZCBwbGFjZSBmb3IgdGhlIGZvbGxvd2luZyBtb3Rpb25cbiAgICAgIHdhc0VtcHR5ID0gc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgd2FzUmV2ZXJzZWQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICB1bmxlc3Mgd2FzRW1wdHkgb3Igd2FzUmV2ZXJzZWRcbiAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG5cbiAgICAgIEBtb3ZlQ3Vyc29yKHNlbGVjdGlvbi5jdXJzb3IsIGNvdW50LCBvcHRpb25zKVxuXG4gICAgICAjIHB1dCBjdXJzb3IgYmFjayBhZnRlciB0aGUgbGFzdCBjaGFyYWN0ZXIgc28gaXQgaXMgYWxzbyBzZWxlY3RlZFxuICAgICAgaXNFbXB0eSA9IHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGlzUmV2ZXJzZWQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICB1bmxlc3MgaXNFbXB0eSBvciBpc1JldmVyc2VkXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZVJpZ2h0KClcblxuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgW25ld1N0YXJ0LCBuZXdFbmRdID0gW3JhbmdlLnN0YXJ0LCByYW5nZS5lbmRdXG5cbiAgICAgICMgaWYgd2UgcmV2ZXJzZWQgb3IgZW1wdGllZCBhIG5vcm1hbCBzZWxlY3Rpb25cbiAgICAgICMgd2UgbmVlZCB0byBzZWxlY3QgYWdhaW4gdGhlIGxhc3QgY2hhcmFjdGVyIGRlc2VsZWN0ZWQgYWJvdmUgdGhlIG1vdGlvblxuICAgICAgaWYgKGlzUmV2ZXJzZWQgb3IgaXNFbXB0eSkgYW5kIG5vdCAod2FzUmV2ZXJzZWQgb3Igd2FzRW1wdHkpXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShbbmV3U3RhcnQsIFtuZXdFbmQucm93LCBvbGRTdGFydC5jb2x1bW4gKyAxXV0pXG5cbiAgICAgICMgaWYgd2UgcmUtcmV2ZXJzZWQgYSByZXZlcnNlZCBub24tZW1wdHkgc2VsZWN0aW9uLFxuICAgICAgIyB3ZSBuZWVkIHRvIGtlZXAgdGhlIGxhc3QgY2hhcmFjdGVyIG9mIHRoZSBvbGQgc2VsZWN0aW9uIHNlbGVjdGVkXG4gICAgICBpZiB3YXNSZXZlcnNlZCBhbmQgbm90IHdhc0VtcHR5IGFuZCBub3QgaXNSZXZlcnNlZFxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UoW1tvbGRFbmQucm93LCBvbGRFbmQuY29sdW1uIC0gMV0sIG5ld0VuZF0pXG5cbiAgICAgICMga2VlcCBhIHNpbmdsZS1jaGFyYWN0ZXIgc2VsZWN0aW9uIG5vbi1yZXZlcnNlZFxuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgW25ld1N0YXJ0LCBuZXdFbmRdID0gW3JhbmdlLnN0YXJ0LCByYW5nZS5lbmRdXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpIGFuZCBuZXdTdGFydC5yb3cgaXMgbmV3RW5kLnJvdyBhbmQgbmV3U3RhcnQuY29sdW1uICsgMSBpcyBuZXdFbmQuY29sdW1uXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSwgcmV2ZXJzZWQ6IGZhbHNlKVxuXG4gIG1vdmVTZWxlY3Rpb246IChzZWxlY3Rpb24sIGNvdW50LCBvcHRpb25zKSAtPlxuICAgIHNlbGVjdGlvbi5tb2RpZnlTZWxlY3Rpb24gPT4gQG1vdmVDdXJzb3Ioc2VsZWN0aW9uLmN1cnNvciwgY291bnQsIG9wdGlvbnMpXG5cbiAgaXNDb21wbGV0ZTogLT4gdHJ1ZVxuXG4gIGlzUmVjb3JkYWJsZTogLT4gZmFsc2VcblxuICBpc0xpbmV3aXNlOiAtPlxuICAgIGlmIEB2aW1TdGF0ZT8ubW9kZSBpcyAndmlzdWFsJ1xuICAgICAgQHZpbVN0YXRlPy5zdWJtb2RlIGlzICdsaW5ld2lzZSdcbiAgICBlbHNlXG4gICAgICBAb3BlcmF0ZXNMaW5ld2lzZVxuXG5jbGFzcyBDdXJyZW50U2VsZWN0aW9uIGV4dGVuZHMgTW90aW9uXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIHN1cGVyKEBlZGl0b3IsIEB2aW1TdGF0ZSlcbiAgICBAbGFzdFNlbGVjdGlvblJhbmdlID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKClcbiAgICBAd2FzTGluZXdpc2UgPSBAaXNMaW5ld2lzZSgpXG5cbiAgZXhlY3V0ZTogKGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyhjb3VudCwgLT4gdHJ1ZSlcblxuICBzZWxlY3Q6IChjb3VudD0xKSAtPlxuICAgICMgaW4gdmlzdWFsIG1vZGUsIHRoZSBjdXJyZW50IHNlbGVjdGlvbnMgYXJlIGFscmVhZHkgdGhlcmVcbiAgICAjIGlmIHdlJ3JlIG5vdCBpbiB2aXN1YWwgbW9kZSwgd2UgYXJlIHJlcGVhdGluZyBzb21lIG9wZXJhdGlvbiBhbmQgbmVlZCB0byByZS1kbyB0aGUgc2VsZWN0aW9uc1xuICAgIHVubGVzcyBAdmltU3RhdGUubW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQHdhc0xpbmV3aXNlXG4gICAgICAgIEBzZWxlY3RMaW5lcygpXG4gICAgICBlbHNlXG4gICAgICAgIEBzZWxlY3RDaGFyYWN0ZXJzKClcblxuICAgIF8udGltZXMoY291bnQsIC0+IHRydWUpXG5cbiAgc2VsZWN0TGluZXM6IC0+XG4gICAgbGFzdFNlbGVjdGlvbkV4dGVudCA9IEBsYXN0U2VsZWN0aW9uUmFuZ2UuZ2V0RXh0ZW50KClcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBjdXJzb3IgPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZSBbW2N1cnNvci5yb3csIDBdLCBbY3Vyc29yLnJvdyArIGxhc3RTZWxlY3Rpb25FeHRlbnQucm93LCAwXV1cbiAgICByZXR1cm5cblxuICBzZWxlY3RDaGFyYWN0ZXJzOiAtPlxuICAgIGxhc3RTZWxlY3Rpb25FeHRlbnQgPSBAbGFzdFNlbGVjdGlvblJhbmdlLmdldEV4dGVudCgpXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAge3N0YXJ0fSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBuZXdFbmQgPSBzdGFydC50cmF2ZXJzZShsYXN0U2VsZWN0aW9uRXh0ZW50KVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFtzdGFydCwgbmV3RW5kXSlcbiAgICByZXR1cm5cblxuIyBQdWJsaWM6IEdlbmVyaWMgY2xhc3MgZm9yIG1vdGlvbnMgdGhhdCByZXF1aXJlIGV4dHJhIGlucHV0XG5jbGFzcyBNb3Rpb25XaXRoSW5wdXQgZXh0ZW5kcyBNb3Rpb25cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAdmltU3RhdGUpIC0+XG4gICAgc3VwZXIoQGVkaXRvciwgQHZpbVN0YXRlKVxuICAgIEBjb21wbGV0ZSA9IGZhbHNlXG5cbiAgaXNDb21wbGV0ZTogLT4gQGNvbXBsZXRlXG5cbiAgY2FuQ29tcG9zZVdpdGg6IChvcGVyYXRpb24pIC0+IHJldHVybiBvcGVyYXRpb24uY2hhcmFjdGVycz9cblxuICBjb21wb3NlOiAoaW5wdXQpIC0+XG4gICAgaWYgbm90IGlucHV0LmNoYXJhY3RlcnNcbiAgICAgIHRocm93IG5ldyBNb3Rpb25FcnJvcignTXVzdCBjb21wb3NlIHdpdGggYW4gSW5wdXQnKVxuICAgIEBpbnB1dCA9IGlucHV0XG4gICAgQGNvbXBsZXRlID0gdHJ1ZVxuXG5jbGFzcyBNb3ZlTGVmdCBleHRlbmRzIE1vdGlvblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIF8udGltZXMgY291bnQsIC0+XG4gICAgICBjdXJzb3IubW92ZUxlZnQoKSBpZiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBzZXR0aW5ncy53cmFwTGVmdFJpZ2h0TW90aW9uKClcblxuY2xhc3MgTW92ZVJpZ2h0IGV4dGVuZHMgTW90aW9uXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgIHdyYXBUb05leHRMaW5lID0gc2V0dGluZ3Mud3JhcExlZnRSaWdodE1vdGlvbigpXG5cbiAgICAgICMgd2hlbiB0aGUgbW90aW9uIGlzIGNvbWJpbmVkIHdpdGggYW4gb3BlcmF0b3IsIHdlIHdpbGwgb25seSB3cmFwIHRvIHRoZSBuZXh0IGxpbmVcbiAgICAgICMgaWYgd2UgYXJlIGFscmVhZHkgYXQgdGhlIGVuZCBvZiB0aGUgbGluZSAoYWZ0ZXIgdGhlIGxhc3QgY2hhcmFjdGVyKVxuICAgICAgd3JhcFRvTmV4dExpbmUgPSBmYWxzZSBpZiBAdmltU3RhdGUubW9kZSBpcyAnb3BlcmF0b3ItcGVuZGluZycgYW5kIG5vdCBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG5cbiAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKSB1bmxlc3MgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgY3Vyc29yLm1vdmVSaWdodCgpIGlmIHdyYXBUb05leHRMaW5lIGFuZCBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG5cbmNsYXNzIE1vdmVVcCBleHRlbmRzIE1vdGlvblxuICBvcGVyYXRlc0xpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LCAtPlxuICAgICAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyAwXG4gICAgICAgIGN1cnNvci5tb3ZlVXAoKVxuXG5jbGFzcyBNb3ZlRG93biBleHRlbmRzIE1vdGlvblxuICBvcGVyYXRlc0xpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LCA9PlxuICAgICAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyBAZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKVxuICAgICAgICBjdXJzb3IubW92ZURvd24oKVxuXG5jbGFzcyBNb3ZlVG9QcmV2aW91c1dvcmQgZXh0ZW5kcyBNb3Rpb25cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LCAtPlxuICAgICAgY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mV29yZCgpXG5cbmNsYXNzIE1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkIGV4dGVuZHMgTW90aW9uXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgIGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZldvcmQoKVxuICAgICAgd2hpbGUgbm90IEBpc1dob2xlV29yZChjdXJzb3IpIGFuZCBub3QgQGlzQmVnaW5uaW5nT2ZGaWxlKGN1cnNvcilcbiAgICAgICAgY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mV29yZCgpXG5cbiAgaXNXaG9sZVdvcmQ6IChjdXJzb3IpIC0+XG4gICAgY2hhciA9IGN1cnNvci5nZXRDdXJyZW50V29yZFByZWZpeCgpLnNsaWNlKC0xKVxuICAgIEFsbFdoaXRlc3BhY2UudGVzdChjaGFyKVxuXG4gIGlzQmVnaW5uaW5nT2ZGaWxlOiAoY3Vyc29yKSAtPlxuICAgIGN1ciA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbm90IGN1ci5yb3cgYW5kIG5vdCBjdXIuY29sdW1uXG5cbmNsYXNzIE1vdmVUb05leHRXb3JkIGV4dGVuZHMgTW90aW9uXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEsIG9wdGlvbnMpIC0+XG4gICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgIGN1cnJlbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBuZXh0ID0gaWYgb3B0aW9ucz8uZXhjbHVkZVdoaXRlc3BhY2VcbiAgICAgICAgY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih3b3JkUmVnZXg6IEB3b3JkUmVnZXgpXG4gICAgICBlbHNlXG4gICAgICAgIGN1cnNvci5nZXRCZWdpbm5pbmdPZk5leHRXb3JkQnVmZmVyUG9zaXRpb24od29yZFJlZ2V4OiBAd29yZFJlZ2V4KVxuXG4gICAgICByZXR1cm4gaWYgQGlzRW5kT2ZGaWxlKGN1cnNvcilcblxuICAgICAgaWYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgICAgICBjdXJzb3IubW92ZURvd24oKVxuICAgICAgICBjdXJzb3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgICAgY3Vyc29yLnNraXBMZWFkaW5nV2hpdGVzcGFjZSgpXG4gICAgICBlbHNlIGlmIGN1cnJlbnQucm93IGlzIG5leHQucm93IGFuZCBjdXJyZW50LmNvbHVtbiBpcyBuZXh0LmNvbHVtblxuICAgICAgICBjdXJzb3IubW92ZVRvRW5kT2ZXb3JkKClcbiAgICAgIGVsc2VcbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5leHQpXG5cbiAgaXNFbmRPZkZpbGU6IChjdXJzb3IpIC0+XG4gICAgY3VyID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBlb2YgPSBAZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgICBjdXIucm93IGlzIGVvZi5yb3cgYW5kIGN1ci5jb2x1bW4gaXMgZW9mLmNvbHVtblxuXG5jbGFzcyBNb3ZlVG9OZXh0V2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvTmV4dFdvcmRcbiAgd29yZFJlZ2V4OiBXaG9sZVdvcmRPckVtcHR5TGluZVJlZ2V4XG5cbmNsYXNzIE1vdmVUb0VuZE9mV29yZCBleHRlbmRzIE1vdGlvblxuICBvcGVyYXRlc0luY2x1c2l2ZWx5OiB0cnVlXG4gIHdvcmRSZWdleDogbnVsbFxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgIGN1cnJlbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBuZXh0ID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih3b3JkUmVnZXg6IEB3b3JkUmVnZXgpXG4gICAgICBuZXh0LmNvbHVtbi0tIGlmIG5leHQuY29sdW1uID4gMFxuXG4gICAgICBpZiBuZXh0LmlzRXF1YWwoY3VycmVudClcbiAgICAgICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgICAgIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgICAgICBjdXJzb3IubW92ZURvd24oKVxuICAgICAgICAgIGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuXG4gICAgICAgIG5leHQgPSBjdXJzb3IuZ2V0RW5kT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHdvcmRSZWdleDogQHdvcmRSZWdleClcbiAgICAgICAgbmV4dC5jb2x1bW4tLSBpZiBuZXh0LmNvbHVtbiA+IDBcblxuICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG5leHQpXG5cbmNsYXNzIE1vdmVUb0VuZE9mV2hvbGVXb3JkIGV4dGVuZHMgTW92ZVRvRW5kT2ZXb3JkXG4gIHdvcmRSZWdleDogV2hvbGVXb3JkUmVnZXhcblxuY2xhc3MgTW92ZVRvTmV4dFNlbnRlbmNlIGV4dGVuZHMgTW90aW9uXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyBjb3VudCwgLT5cbiAgICAgIHN0YXJ0ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkudHJhbnNsYXRlIG5ldyBQb2ludCgwLCAxKVxuICAgICAgZW9mID0gY3Vyc29yLmVkaXRvci5nZXRCdWZmZXIoKS5nZXRFbmRQb3NpdGlvbigpXG4gICAgICBzY2FuUmFuZ2UgPSBbc3RhcnQsIGVvZl1cblxuICAgICAgY3Vyc29yLmVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvKF4kKXwoKFtcXC4hP10gKXxeW0EtWmEtejAtOV0pLywgc2NhblJhbmdlLCAoe21hdGNoVGV4dCwgcmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBhZGp1c3RtZW50ID0gbmV3IFBvaW50KDAsIDApXG4gICAgICAgIGlmIG1hdGNoVGV4dC5tYXRjaCAvW1xcLiE/XS9cbiAgICAgICAgICBhZGp1c3RtZW50ID0gbmV3IFBvaW50KDAsIDIpXG5cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uIHJhbmdlLnN0YXJ0LnRyYW5zbGF0ZShhZGp1c3RtZW50KVxuICAgICAgICBzdG9wKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSBleHRlbmRzIE1vdGlvblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIF8udGltZXMgY291bnQsIC0+XG4gICAgICBlbmQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUgbmV3IFBvaW50KDAsIC0xKVxuICAgICAgYm9mID0gY3Vyc29yLmVkaXRvci5nZXRCdWZmZXIoKS5nZXRGaXJzdFBvc2l0aW9uKClcbiAgICAgIHNjYW5SYW5nZSA9IFtib2YsIGVuZF1cblxuICAgICAgY3Vyc29yLmVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSAvKF4kKXwoKFtcXC4hP10gKXxeW0EtWmEtejAtOV0pLywgc2NhblJhbmdlLCAoe21hdGNoVGV4dCwgcmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgICBhZGp1c3RtZW50ID0gbmV3IFBvaW50KDAsIDApXG4gICAgICAgIGlmIG1hdGNoVGV4dC5tYXRjaCAvW1xcLiE/XS9cbiAgICAgICAgICBhZGp1c3RtZW50ID0gbmV3IFBvaW50KDAsIDIpXG5cbiAgICAgICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uIHJhbmdlLnN0YXJ0LnRyYW5zbGF0ZShhZGp1c3RtZW50KVxuICAgICAgICBzdG9wKClcblxuY2xhc3MgTW92ZVRvTmV4dFBhcmFncmFwaCBleHRlbmRzIE1vdGlvblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIF8udGltZXMgY291bnQsIC0+XG4gICAgICBjdXJzb3IubW92ZVRvQmVnaW5uaW5nT2ZOZXh0UGFyYWdyYXBoKClcblxuY2xhc3MgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGggZXh0ZW5kcyBNb3Rpb25cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LCAtPlxuICAgICAgY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mUHJldmlvdXNQYXJhZ3JhcGgoKVxuXG5jbGFzcyBNb3ZlVG9MaW5lIGV4dGVuZHMgTW90aW9uXG4gIG9wZXJhdGVzTGluZXdpc2U6IHRydWVcblxuICBnZXREZXN0aW5hdGlvblJvdzogKGNvdW50KSAtPlxuICAgIGlmIGNvdW50PyB0aGVuIGNvdW50IC0gMSBlbHNlIChAZWRpdG9yLmdldExpbmVDb3VudCgpIC0gMSlcblxuY2xhc3MgTW92ZVRvQWJzb2x1dGVMaW5lIGV4dGVuZHMgTW92ZVRvTGluZVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudCkgLT5cbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW0BnZXREZXN0aW5hdGlvblJvdyhjb3VudCksIEluZmluaXR5XSlcbiAgICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuICAgIGN1cnNvci5tb3ZlVG9FbmRPZkxpbmUoKSBpZiBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKCkgaXMgMFxuXG5jbGFzcyBNb3ZlVG9SZWxhdGl2ZUxpbmUgZXh0ZW5kcyBNb3ZlVG9MaW5lXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAge3JvdywgY29sdW1ufSA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3cgKyAoY291bnQgLSAxKSwgMF0pXG5cbmNsYXNzIE1vdmVUb1NjcmVlbkxpbmUgZXh0ZW5kcyBNb3ZlVG9MaW5lXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvckVsZW1lbnQsIEB2aW1TdGF0ZSwgQHNjcm9sbG9mZikgLT5cbiAgICBAc2Nyb2xsb2ZmID0gMiAjIGF0b20gZGVmYXVsdFxuICAgIHN1cGVyKEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCksIEB2aW1TdGF0ZSlcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIHtyb3csIGNvbHVtbn0gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihbQGdldERlc3RpbmF0aW9uUm93KGNvdW50KSwgMF0pXG5cbmNsYXNzIE1vdmVUb0JlZ2lubmluZ09mTGluZSBleHRlbmRzIE1vdGlvblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIF8udGltZXMgY291bnQsIC0+XG4gICAgICBjdXJzb3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBNb3Rpb25cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LCAtPlxuICAgICAgY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5jbGFzcyBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24gZXh0ZW5kcyBNb3Rpb25cbiAgb3BlcmF0ZXNMaW5ld2lzZTogdHJ1ZVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyBjb3VudC0xLCAtPlxuICAgICAgY3Vyc29yLm1vdmVEb3duKClcbiAgICBjdXJzb3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5jbGFzcyBNb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lIGV4dGVuZHMgTW90aW9uXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgXy50aW1lcyBjb3VudCwgLT5cbiAgICAgIGN1cnNvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBJbmZpbml0eVxuXG5jbGFzcyBNb3ZlVG9MYXN0Tm9uYmxhbmtDaGFyYWN0ZXJPZkxpbmVBbmREb3duIGV4dGVuZHMgTW90aW9uXG4gIG9wZXJhdGVzSW5jbHVzaXZlbHk6IHRydWVcblxuICAjIG1vdmVzIGN1cnNvciB0byB0aGUgbGFzdCBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgb24gdGhlIGxpbmVcbiAgIyBzaW1pbGFyIHRvIHNraXBMZWFkaW5nV2hpdGVzcGFjZSgpIGluIGF0b20ncyBjdXJzb3IuY29mZmVlXG4gIHNraXBUcmFpbGluZ1doaXRlc3BhY2U6IChjdXJzb3IpIC0+XG4gICAgcG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHNjYW5SYW5nZSA9IGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKClcbiAgICBzdGFydE9mVHJhaWxpbmdXaGl0ZXNwYWNlID0gW3NjYW5SYW5nZS5lbmQucm93LCBzY2FuUmFuZ2UuZW5kLmNvbHVtbiAtIDFdXG4gICAgQGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvWyBcXHRdKyQvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgICAgc3RhcnRPZlRyYWlsaW5nV2hpdGVzcGFjZSA9IHJhbmdlLnN0YXJ0XG4gICAgICBzdGFydE9mVHJhaWxpbmdXaGl0ZXNwYWNlLmNvbHVtbiAtPSAxXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHN0YXJ0T2ZUcmFpbGluZ1doaXRlc3BhY2UpXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LTEsIC0+XG4gICAgICBjdXJzb3IubW92ZURvd24oKVxuICAgIEBza2lwVHJhaWxpbmdXaGl0ZXNwYWNlKGN1cnNvcilcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcCBleHRlbmRzIE1vdGlvblxuICBvcGVyYXRlc0xpbmV3aXNlOiB0cnVlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBfLnRpbWVzIGNvdW50LCAtPlxuICAgICAgY3Vyc29yLm1vdmVVcCgpXG4gICAgY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuY2xhc3MgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duIGV4dGVuZHMgTW90aW9uXG4gIG9wZXJhdGVzTGluZXdpc2U6IHRydWVcblxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIF8udGltZXMgY291bnQsIC0+XG4gICAgICBjdXJzb3IubW92ZURvd24oKVxuICAgIGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIGN1cnNvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbmNsYXNzIE1vdmVUb1N0YXJ0T2ZGaWxlIGV4dGVuZHMgTW92ZVRvTGluZVxuICBtb3ZlQ3Vyc29yOiAoY3Vyc29yLCBjb3VudD0xKSAtPlxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW0BnZXREZXN0aW5hdGlvblJvdyhjb3VudCksIDBdKVxuICAgIHVubGVzcyBAaXNMaW5ld2lzZSgpXG4gICAgICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5jbGFzcyBNb3ZlVG9Ub3BPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1NjcmVlbkxpbmVcbiAgZ2V0RGVzdGluYXRpb25Sb3c6IChjb3VudD0wKSAtPlxuICAgIGZpcnN0U2NyZWVuUm93ID0gQGVkaXRvckVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBpZiBmaXJzdFNjcmVlblJvdyA+IDBcbiAgICAgIG9mZnNldCA9IE1hdGgubWF4KGNvdW50IC0gMSwgQHNjcm9sbG9mZilcbiAgICBlbHNlXG4gICAgICBvZmZzZXQgPSBpZiBjb3VudCA+IDAgdGhlbiBjb3VudCAtIDEgZWxzZSBjb3VudFxuICAgIGZpcnN0U2NyZWVuUm93ICsgb2Zmc2V0XG5cbmNsYXNzIE1vdmVUb0JvdHRvbU9mU2NyZWVuIGV4dGVuZHMgTW92ZVRvU2NyZWVuTGluZVxuICBnZXREZXN0aW5hdGlvblJvdzogKGNvdW50PTApIC0+XG4gICAgbGFzdFNjcmVlblJvdyA9IEBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBsYXN0Um93ID0gQGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMYXN0Um93KClcbiAgICBpZiBsYXN0U2NyZWVuUm93IGlzbnQgbGFzdFJvd1xuICAgICAgb2Zmc2V0ID0gTWF0aC5tYXgoY291bnQgLSAxLCBAc2Nyb2xsb2ZmKVxuICAgIGVsc2VcbiAgICAgIG9mZnNldCA9IGlmIGNvdW50ID4gMCB0aGVuIGNvdW50IC0gMSBlbHNlIGNvdW50XG4gICAgbGFzdFNjcmVlblJvdyAtIG9mZnNldFxuXG5jbGFzcyBNb3ZlVG9NaWRkbGVPZlNjcmVlbiBleHRlbmRzIE1vdmVUb1NjcmVlbkxpbmVcbiAgZ2V0RGVzdGluYXRpb25Sb3c6IC0+XG4gICAgZmlyc3RTY3JlZW5Sb3cgPSBAZWRpdG9yRWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGxhc3RTY3JlZW5Sb3cgPSBAZWRpdG9yRWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgaGVpZ2h0ID0gbGFzdFNjcmVlblJvdyAtIGZpcnN0U2NyZWVuUm93XG4gICAgTWF0aC5mbG9vcihmaXJzdFNjcmVlblJvdyArIChoZWlnaHQgLyAyKSlcblxuY2xhc3MgU2Nyb2xsS2VlcGluZ0N1cnNvciBleHRlbmRzIE1vdGlvblxuICBvcGVyYXRlc0xpbmV3aXNlOiB0cnVlXG4gIGN1cnNvclJvdzogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvckVsZW1lbnQsIEB2aW1TdGF0ZSkgLT5cbiAgICBzdXBlcihAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLCBAdmltU3RhdGUpXG5cbiAgc2VsZWN0OiAoY291bnQsIG9wdGlvbnMpIC0+XG4gICAgIyBUT0RPOiByZW1vdmUgdGhpcyBjb25kaXRpb25hbCBvbmNlIGFmdGVyIEF0b20gdjEuMS4wIGlzIHJlbGVhc2VkLlxuICAgIGlmIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93P1xuICAgICAgbmV3VG9wUm93ID0gQGdldE5ld0ZpcnN0VmlzaWJsZVNjcmVlblJvdyhjb3VudClcbiAgICAgIHN1cGVyKGNvdW50LCBvcHRpb25zKVxuICAgICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cobmV3VG9wUm93KVxuICAgIGVsc2VcbiAgICAgIHNjcm9sbFRvcCA9IEBnZXROZXdTY3JvbGxUb3AoY291bnQpXG4gICAgICBzdXBlcihjb3VudCwgb3B0aW9ucylcbiAgICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChzY3JvbGxUb3ApXG5cbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgICMgVE9ETzogcmVtb3ZlIHRoaXMgY29uZGl0aW9uYWwgb25jZSBhZnRlciBBdG9tIHYxLjEuMCBpcyByZWxlYXNlZC5cbiAgICBpZiBAZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlblJvdz9cbiAgICAgIG5ld1RvcFJvdyA9IEBnZXROZXdGaXJzdFZpc2libGVTY3JlZW5Sb3coY291bnQpXG4gICAgICBzdXBlcihjb3VudClcbiAgICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG5ld1RvcFJvdylcbiAgICBlbHNlXG4gICAgICBzY3JvbGxUb3AgPSBAZ2V0TmV3U2Nyb2xsVG9wKGNvdW50KVxuICAgICAgc3VwZXIoY291bnQpXG4gICAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IpIC0+XG4gICAgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKFBvaW50KEBjdXJzb3JSb3csIDApLCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAjIFRPRE86IHJlbW92ZSB0aGlzIG1ldGhvZCBvbmNlIGFmdGVyIEF0b20gdjEuMS4wIGlzIHJlbGVhc2VkLlxuICBnZXROZXdTY3JvbGxUb3A6IChjb3VudD0xKSAtPlxuICAgIGN1cnJlbnRTY3JvbGxUb3AgPSBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLnBlbmRpbmdTY3JvbGxUb3AgPyBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuICAgIGN1cnJlbnRDdXJzb3JSb3cgPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgcm93c1BlclBhZ2UgPSBAZWRpdG9yLmdldFJvd3NQZXJQYWdlKClcbiAgICBsaW5lSGVpZ2h0ID0gQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKVxuICAgIHNjcm9sbFJvd3MgPSBNYXRoLmZsb29yKEBwYWdlU2Nyb2xsRnJhY3Rpb24gKiByb3dzUGVyUGFnZSAqIGNvdW50KVxuICAgIEBjdXJzb3JSb3cgPSBjdXJyZW50Q3Vyc29yUm93ICsgc2Nyb2xsUm93c1xuICAgIGN1cnJlbnRTY3JvbGxUb3AgKyBzY3JvbGxSb3dzICogbGluZUhlaWdodFxuXG4gIGdldE5ld0ZpcnN0VmlzaWJsZVNjcmVlblJvdzogKGNvdW50PTEpIC0+XG4gICAgY3VycmVudFRvcFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBjdXJyZW50Q3Vyc29yUm93ID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpLnJvd1xuICAgIHJvd3NQZXJQYWdlID0gQGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpXG4gICAgc2Nyb2xsUm93cyA9IE1hdGguY2VpbChAcGFnZVNjcm9sbEZyYWN0aW9uICogcm93c1BlclBhZ2UgKiBjb3VudClcbiAgICBAY3Vyc29yUm93ID0gY3VycmVudEN1cnNvclJvdyArIHNjcm9sbFJvd3NcbiAgICBjdXJyZW50VG9wUm93ICsgc2Nyb2xsUm93c1xuXG5jbGFzcyBTY3JvbGxIYWxmVXBLZWVwQ3Vyc29yIGV4dGVuZHMgU2Nyb2xsS2VlcGluZ0N1cnNvclxuICBwYWdlU2Nyb2xsRnJhY3Rpb246IC0xIC8gMlxuXG5jbGFzcyBTY3JvbGxGdWxsVXBLZWVwQ3Vyc29yIGV4dGVuZHMgU2Nyb2xsS2VlcGluZ0N1cnNvclxuICBwYWdlU2Nyb2xsRnJhY3Rpb246IC0xXG5cbmNsYXNzIFNjcm9sbEhhbGZEb3duS2VlcEN1cnNvciBleHRlbmRzIFNjcm9sbEtlZXBpbmdDdXJzb3JcbiAgcGFnZVNjcm9sbEZyYWN0aW9uOiAxIC8gMlxuXG5jbGFzcyBTY3JvbGxGdWxsRG93bktlZXBDdXJzb3IgZXh0ZW5kcyBTY3JvbGxLZWVwaW5nQ3Vyc29yXG4gIHBhZ2VTY3JvbGxGcmFjdGlvbjogMVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTW90aW9uLCBNb3Rpb25XaXRoSW5wdXQsIEN1cnJlbnRTZWxlY3Rpb24sIE1vdmVMZWZ0LCBNb3ZlUmlnaHQsIE1vdmVVcCwgTW92ZURvd24sXG4gIE1vdmVUb1ByZXZpb3VzV29yZCwgTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQsIE1vdmVUb05leHRXb3JkLCBNb3ZlVG9OZXh0V2hvbGVXb3JkLFxuICBNb3ZlVG9FbmRPZldvcmQsIE1vdmVUb05leHRTZW50ZW5jZSwgTW92ZVRvUHJldmlvdXNTZW50ZW5jZSwgTW92ZVRvTmV4dFBhcmFncmFwaCwgTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGgsIE1vdmVUb0Fic29sdXRlTGluZSwgTW92ZVRvUmVsYXRpdmVMaW5lLCBNb3ZlVG9CZWdpbm5pbmdPZkxpbmUsXG4gIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lVXAsIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93bixcbiAgTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUsIE1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lQW5kRG93biwgTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZSxcbiAgTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93biwgTW92ZVRvU3RhcnRPZkZpbGUsXG4gIE1vdmVUb1RvcE9mU2NyZWVuLCBNb3ZlVG9Cb3R0b21PZlNjcmVlbiwgTW92ZVRvTWlkZGxlT2ZTY3JlZW4sIE1vdmVUb0VuZE9mV2hvbGVXb3JkLCBNb3Rpb25FcnJvcixcbiAgU2Nyb2xsSGFsZlVwS2VlcEN1cnNvciwgU2Nyb2xsRnVsbFVwS2VlcEN1cnNvcixcbiAgU2Nyb2xsSGFsZkRvd25LZWVwQ3Vyc29yLCBTY3JvbGxGdWxsRG93bktlZXBDdXJzb3Jcbn1cbiJdfQ==
