(function() {
  var AllWhitespace, Paragraph, Range, SelectAParagraph, SelectAWholeWord, SelectAWord, SelectInsideBrackets, SelectInsideParagraph, SelectInsideQuotes, SelectInsideWholeWord, SelectInsideWord, TextObject, WholeWordRegex, mergeRanges,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  AllWhitespace = /^\s$/;

  WholeWordRegex = /\S+/;

  mergeRanges = require('./utils').mergeRanges;

  TextObject = (function() {
    function TextObject(editor, state) {
      this.editor = editor;
      this.state = state;
    }

    TextObject.prototype.isComplete = function() {
      return true;
    };

    TextObject.prototype.isRecordable = function() {
      return false;
    };

    TextObject.prototype.execute = function() {
      return this.select.apply(this, arguments);
    };

    return TextObject;

  })();

  SelectInsideWord = (function(superClass) {
    extend(SelectInsideWord, superClass);

    function SelectInsideWord() {
      return SelectInsideWord.__super__.constructor.apply(this, arguments);
    }

    SelectInsideWord.prototype.select = function() {
      var i, len, ref, selection;
      ref = this.editor.getSelections();
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
      }
      return [true];
    };

    return SelectInsideWord;

  })(TextObject);

  SelectInsideWholeWord = (function(superClass) {
    extend(SelectInsideWholeWord, superClass);

    function SelectInsideWholeWord() {
      return SelectInsideWholeWord.__super__.constructor.apply(this, arguments);
    }

    SelectInsideWholeWord.prototype.select = function() {
      var i, len, range, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        range = selection.cursor.getCurrentWordBufferRange({
          wordRegex: WholeWordRegex
        });
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        results.push(true);
      }
      return results;
    };

    return SelectInsideWholeWord;

  })(TextObject);

  SelectInsideQuotes = (function(superClass) {
    extend(SelectInsideQuotes, superClass);

    function SelectInsideQuotes(editor, char1, includeQuotes) {
      this.editor = editor;
      this.char = char1;
      this.includeQuotes = includeQuotes;
    }

    SelectInsideQuotes.prototype.findOpeningQuote = function(pos) {
      var line, start;
      start = pos.copy();
      pos = pos.copy();
      while (pos.row >= 0) {
        line = this.editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          if (line[pos.column] === this.char) {
            if (pos.column === 0 || line[pos.column - 1] !== '\\') {
              if (this.isStartQuote(pos)) {
                return pos;
              } else {
                return this.lookForwardOnLine(start);
              }
            }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
      return this.lookForwardOnLine(start);
    };

    SelectInsideQuotes.prototype.isStartQuote = function(end) {
      var line, numQuotes;
      line = this.editor.lineTextForBufferRow(end.row);
      numQuotes = line.substring(0, end.column + 1).replace("'" + this.char, '').split(this.char).length - 1;
      return numQuotes % 2;
    };

    SelectInsideQuotes.prototype.lookForwardOnLine = function(pos) {
      var index, line;
      line = this.editor.lineTextForBufferRow(pos.row);
      index = line.substring(pos.column).indexOf(this.char);
      if (index >= 0) {
        pos.column += index;
        return pos;
      }
      return null;
    };

    SelectInsideQuotes.prototype.findClosingQuote = function(start) {
      var end, endLine, escaping;
      end = start.copy();
      escaping = false;
      while (end.row < this.editor.getLineCount()) {
        endLine = this.editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          if (endLine[end.column] === '\\') {
            ++end.column;
          } else if (endLine[end.column] === this.char) {
            if (this.includeQuotes) {
              --start.column;
            }
            if (this.includeQuotes) {
              ++end.column;
            }
            return end;
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    SelectInsideQuotes.prototype.select = function() {
      var end, i, len, ref, results, selection, start;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        start = this.findOpeningQuote(selection.cursor.getBufferPosition());
        if (start != null) {
          ++start.column;
          end = this.findClosingQuote(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        results.push(!selection.isEmpty());
      }
      return results;
    };

    return SelectInsideQuotes;

  })(TextObject);

  SelectInsideBrackets = (function(superClass) {
    extend(SelectInsideBrackets, superClass);

    function SelectInsideBrackets(editor, beginChar, endChar, includeBrackets) {
      this.editor = editor;
      this.beginChar = beginChar;
      this.endChar = endChar;
      this.includeBrackets = includeBrackets;
    }

    SelectInsideBrackets.prototype.findOpeningBracket = function(pos) {
      var depth, line;
      pos = pos.copy();
      depth = 0;
      while (pos.row >= 0) {
        line = this.editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          switch (line[pos.column]) {
            case this.endChar:
              ++depth;
              break;
            case this.beginChar:
              if (--depth < 0) {
                return pos;
              }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
    };

    SelectInsideBrackets.prototype.findClosingBracket = function(start) {
      var depth, end, endLine;
      end = start.copy();
      depth = 0;
      while (end.row < this.editor.getLineCount()) {
        endLine = this.editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          switch (endLine[end.column]) {
            case this.beginChar:
              ++depth;
              break;
            case this.endChar:
              if (--depth < 0) {
                if (this.includeBrackets) {
                  --start.column;
                }
                if (this.includeBrackets) {
                  ++end.column;
                }
                return end;
              }
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    SelectInsideBrackets.prototype.select = function() {
      var end, i, len, ref, results, selection, start;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        start = this.findOpeningBracket(selection.cursor.getBufferPosition());
        if (start != null) {
          ++start.column;
          end = this.findClosingBracket(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        results.push(!selection.isEmpty());
      }
      return results;
    };

    return SelectInsideBrackets;

  })(TextObject);

  SelectAWord = (function(superClass) {
    extend(SelectAWord, superClass);

    function SelectAWord() {
      return SelectAWord.__super__.constructor.apply(this, arguments);
    }

    SelectAWord.prototype.select = function() {
      var char, endPoint, i, len, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
        while (true) {
          endPoint = selection.getBufferRange().end;
          char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) {
            break;
          }
          selection.selectRight();
        }
        results.push(true);
      }
      return results;
    };

    return SelectAWord;

  })(TextObject);

  SelectAWholeWord = (function(superClass) {
    extend(SelectAWholeWord, superClass);

    function SelectAWholeWord() {
      return SelectAWholeWord.__super__.constructor.apply(this, arguments);
    }

    SelectAWholeWord.prototype.select = function() {
      var char, endPoint, i, len, range, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        range = selection.cursor.getCurrentWordBufferRange({
          wordRegex: WholeWordRegex
        });
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        while (true) {
          endPoint = selection.getBufferRange().end;
          char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) {
            break;
          }
          selection.selectRight();
        }
        results.push(true);
      }
      return results;
    };

    return SelectAWholeWord;

  })(TextObject);

  Paragraph = (function(superClass) {
    extend(Paragraph, superClass);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.prototype.select = function() {
      var i, len, ref, results, selection;
      ref = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        results.push(this.selectParagraph(selection));
      }
      return results;
    };

    Paragraph.prototype.paragraphDelimitedRange = function(startPoint) {
      var inParagraph, lowerRow, upperRow;
      inParagraph = this.isParagraphLine(this.editor.lineTextForBufferRow(startPoint.row));
      upperRow = this.searchLines(startPoint.row, -1, inParagraph);
      lowerRow = this.searchLines(startPoint.row, this.editor.getLineCount(), inParagraph);
      return new Range([upperRow + 1, 0], [lowerRow, 0]);
    };

    Paragraph.prototype.searchLines = function(startRow, rowLimit, startedInParagraph) {
      var currentRow, i, line, ref, ref1;
      for (currentRow = i = ref = startRow, ref1 = rowLimit; ref <= ref1 ? i <= ref1 : i >= ref1; currentRow = ref <= ref1 ? ++i : --i) {
        line = this.editor.lineTextForBufferRow(currentRow);
        if (startedInParagraph !== this.isParagraphLine(line)) {
          return currentRow;
        }
      }
      return rowLimit;
    };

    Paragraph.prototype.isParagraphLine = function(line) {
      return /\S/.test(line);
    };

    return Paragraph;

  })(TextObject);

  SelectInsideParagraph = (function(superClass) {
    extend(SelectInsideParagraph, superClass);

    function SelectInsideParagraph() {
      return SelectInsideParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectInsideParagraph.prototype.selectParagraph = function(selection) {
      var newRange, oldRange, startPoint;
      oldRange = selection.getBufferRange();
      startPoint = selection.cursor.getBufferPosition();
      newRange = this.paragraphDelimitedRange(startPoint);
      selection.setBufferRange(mergeRanges(oldRange, newRange));
      return true;
    };

    return SelectInsideParagraph;

  })(Paragraph);

  SelectAParagraph = (function(superClass) {
    extend(SelectAParagraph, superClass);

    function SelectAParagraph() {
      return SelectAParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectAParagraph.prototype.selectParagraph = function(selection) {
      var newRange, nextRange, oldRange, startPoint;
      oldRange = selection.getBufferRange();
      startPoint = selection.cursor.getBufferPosition();
      newRange = this.paragraphDelimitedRange(startPoint);
      nextRange = this.paragraphDelimitedRange(newRange.end);
      selection.setBufferRange(mergeRanges(oldRange, [newRange.start, nextRange.end]));
      return true;
    };

    return SelectAParagraph;

  })(Paragraph);

  module.exports = {
    TextObject: TextObject,
    SelectInsideWord: SelectInsideWord,
    SelectInsideWholeWord: SelectInsideWholeWord,
    SelectInsideQuotes: SelectInsideQuotes,
    SelectInsideBrackets: SelectInsideBrackets,
    SelectAWord: SelectAWord,
    SelectAWholeWord: SelectAWholeWord,
    SelectInsideParagraph: SelectInsideParagraph,
    SelectAParagraph: SelectAParagraph
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3RleHQtb2JqZWN0cy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1PQUFBO0lBQUE7OztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBQ1YsYUFBQSxHQUFnQjs7RUFDaEIsY0FBQSxHQUFpQjs7RUFDaEIsY0FBZSxPQUFBLENBQVEsU0FBUjs7RUFFVjtJQUNTLG9CQUFDLE1BQUQsRUFBVSxLQUFWO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsUUFBRDtJQUFWOzt5QkFFYixVQUFBLEdBQVksU0FBQTthQUFHO0lBQUg7O3lCQUNaLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7eUJBRWQsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBYyxJQUFkLEVBQW9CLFNBQXBCO0lBQUg7Ozs7OztFQUVMOzs7Ozs7OytCQUNKLE1BQUEsR0FBUSxTQUFBO0FBQ04sVUFBQTtBQUFBO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtVQUNFLFNBQVMsQ0FBQyxXQUFWLENBQUEsRUFERjs7UUFFQSxTQUFTLENBQUMsY0FBVixDQUFBO0FBSEY7YUFJQSxDQUFDLElBQUQ7SUFMTTs7OztLQURxQjs7RUFRekI7Ozs7Ozs7b0NBQ0osTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztRQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsTUFBTSxDQUFDLHlCQUFqQixDQUEyQztVQUFDLFNBQUEsRUFBVyxjQUFaO1NBQTNDO1FBQ1IsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsV0FBQSxDQUFZLFNBQVMsQ0FBQyxjQUFWLENBQUEsQ0FBWixFQUF3QyxLQUF4QyxDQUF6QjtxQkFDQTtBQUhGOztJQURN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O01BQ2IsUUFBQSxHQUFXLElBQUMsQ0FBQSx1QkFBRCxDQUF5QixVQUF6QjtNQUNYLFNBQUEsR0FBWSxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsUUFBUSxDQUFDLEdBQWxDO01BQ1osU0FBUyxDQUFDLGNBQVYsQ0FBeUIsV0FBQSxDQUFZLFFBQVosRUFBc0IsQ0FBQyxRQUFRLENBQUMsS0FBVixFQUFpQixTQUFTLENBQUMsR0FBM0IsQ0FBdEIsQ0FBekI7YUFDQTtJQU5lOzs7O0tBRFk7O0VBUy9CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsWUFBQSxVQUFEO0lBQWEsa0JBQUEsZ0JBQWI7SUFBK0IsdUJBQUEscUJBQS9CO0lBQXNELG9CQUFBLGtCQUF0RDtJQUNmLHNCQUFBLG9CQURlO0lBQ08sYUFBQSxXQURQO0lBQ29CLGtCQUFBLGdCQURwQjtJQUNzQyx1QkFBQSxxQkFEdEM7SUFDNkQsa0JBQUEsZ0JBRDdEOztBQWpOakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbkFsbFdoaXRlc3BhY2UgPSAvXlxccyQvXG5XaG9sZVdvcmRSZWdleCA9IC9cXFMrL1xue21lcmdlUmFuZ2VzfSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmNsYXNzIFRleHRPYmplY3RcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAc3RhdGUpIC0+XG5cbiAgaXNDb21wbGV0ZTogLT4gdHJ1ZVxuICBpc1JlY29yZGFibGU6IC0+IGZhbHNlXG5cbiAgZXhlY3V0ZTogLT4gQHNlbGVjdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cbmNsYXNzIFNlbGVjdEluc2lkZVdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIHNlbGVjdDogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICBzZWxlY3Rpb24uZXhwYW5kT3ZlcldvcmQoKVxuICAgIFt0cnVlXVxuXG5jbGFzcyBTZWxlY3RJbnNpZGVXaG9sZVdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIHNlbGVjdDogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSh7d29yZFJlZ2V4OiBXaG9sZVdvcmRSZWdleH0pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UobWVyZ2VSYW5nZXMoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIHJhbmdlKSlcbiAgICAgIHRydWVcblxuIyBTZWxlY3RJbnNpZGVRdW90ZXMgYW5kIHRoZSBuZXh0IGNsYXNzIGRlZmluZWQgKFNlbGVjdEluc2lkZUJyYWNrZXRzKSBhcmVcbiMgYWxtb3N0LWJ1dC1ub3QtcXVpdGUtcmVwZWF0ZWQgY29kZS4gVGhleSBhcmUgZGlmZmVyZW50IGJlY2F1c2Ugb2YgdGhlIGRlcHRoXG4jIGNoZWNrcyBpbiB0aGUgYnJhY2tldCBtYXRjaGVyLlxuXG5jbGFzcyBTZWxlY3RJbnNpZGVRdW90ZXMgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQGNoYXIsIEBpbmNsdWRlUXVvdGVzKSAtPlxuXG4gIGZpbmRPcGVuaW5nUXVvdGU6IChwb3MpIC0+XG4gICAgc3RhcnQgPSBwb3MuY29weSgpXG4gICAgcG9zID0gcG9zLmNvcHkoKVxuICAgIHdoaWxlIHBvcy5yb3cgPj0gMFxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9zLnJvdylcbiAgICAgIHBvcy5jb2x1bW4gPSBsaW5lLmxlbmd0aCAtIDEgaWYgcG9zLmNvbHVtbiBpcyAtMVxuICAgICAgd2hpbGUgcG9zLmNvbHVtbiA+PSAwXG4gICAgICAgIGlmIGxpbmVbcG9zLmNvbHVtbl0gaXMgQGNoYXJcbiAgICAgICAgICBpZiBwb3MuY29sdW1uIGlzIDAgb3IgbGluZVtwb3MuY29sdW1uIC0gMV0gaXNudCAnXFxcXCdcbiAgICAgICAgICAgIGlmIEBpc1N0YXJ0UXVvdGUocG9zKVxuICAgICAgICAgICAgICByZXR1cm4gcG9zXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBAbG9va0ZvcndhcmRPbkxpbmUoc3RhcnQpXG4gICAgICAgIC0tIHBvcy5jb2x1bW5cbiAgICAgIHBvcy5jb2x1bW4gPSAtMVxuICAgICAgLS0gcG9zLnJvd1xuICAgIEBsb29rRm9yd2FyZE9uTGluZShzdGFydClcblxuICBpc1N0YXJ0UXVvdGU6IChlbmQpIC0+XG4gICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kLnJvdylcbiAgICBudW1RdW90ZXMgPSBsaW5lLnN1YnN0cmluZygwLCBlbmQuY29sdW1uICsgMSkucmVwbGFjZSggXCInI3tAY2hhcn1cIiwgJycpLnNwbGl0KEBjaGFyKS5sZW5ndGggLSAxXG4gICAgbnVtUXVvdGVzICUgMlxuXG4gIGxvb2tGb3J3YXJkT25MaW5lOiAocG9zKSAtPlxuICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvcy5yb3cpXG5cbiAgICBpbmRleCA9IGxpbmUuc3Vic3RyaW5nKHBvcy5jb2x1bW4pLmluZGV4T2YoQGNoYXIpXG4gICAgaWYgaW5kZXggPj0gMFxuICAgICAgcG9zLmNvbHVtbiArPSBpbmRleFxuICAgICAgcmV0dXJuIHBvc1xuICAgIG51bGxcblxuICBmaW5kQ2xvc2luZ1F1b3RlOiAoc3RhcnQpIC0+XG4gICAgZW5kID0gc3RhcnQuY29weSgpXG4gICAgZXNjYXBpbmcgPSBmYWxzZVxuXG4gICAgd2hpbGUgZW5kLnJvdyA8IEBlZGl0b3IuZ2V0TGluZUNvdW50KClcbiAgICAgIGVuZExpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGVuZC5yb3cpXG4gICAgICB3aGlsZSBlbmQuY29sdW1uIDwgZW5kTGluZS5sZW5ndGhcbiAgICAgICAgaWYgZW5kTGluZVtlbmQuY29sdW1uXSBpcyAnXFxcXCdcbiAgICAgICAgICArKyBlbmQuY29sdW1uXG4gICAgICAgIGVsc2UgaWYgZW5kTGluZVtlbmQuY29sdW1uXSBpcyBAY2hhclxuICAgICAgICAgIC0tIHN0YXJ0LmNvbHVtbiBpZiBAaW5jbHVkZVF1b3Rlc1xuICAgICAgICAgICsrIGVuZC5jb2x1bW4gaWYgQGluY2x1ZGVRdW90ZXNcbiAgICAgICAgICByZXR1cm4gZW5kXG4gICAgICAgICsrIGVuZC5jb2x1bW5cbiAgICAgIGVuZC5jb2x1bW4gPSAwXG4gICAgICArKyBlbmQucm93XG4gICAgcmV0dXJuXG5cbiAgc2VsZWN0OiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHN0YXJ0ID0gQGZpbmRPcGVuaW5nUXVvdGUoc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgaWYgc3RhcnQ/XG4gICAgICAgICsrIHN0YXJ0LmNvbHVtbiAjIHNraXAgdGhlIG9wZW5pbmcgcXVvdGVcbiAgICAgICAgZW5kID0gQGZpbmRDbG9zaW5nUXVvdGUoc3RhcnQpXG4gICAgICAgIGlmIGVuZD9cbiAgICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UobWVyZ2VSYW5nZXMoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIFtzdGFydCwgZW5kXSkpXG4gICAgICBub3Qgc2VsZWN0aW9uLmlzRW1wdHkoKVxuXG4jIFNlbGVjdEluc2lkZUJyYWNrZXRzIGFuZCB0aGUgcHJldmlvdXMgY2xhc3MgZGVmaW5lZCAoU2VsZWN0SW5zaWRlUXVvdGVzKSBhcmVcbiMgYWxtb3N0LWJ1dC1ub3QtcXVpdGUtcmVwZWF0ZWQgY29kZS4gVGhleSBhcmUgZGlmZmVyZW50IGJlY2F1c2Ugb2YgdGhlIGRlcHRoXG4jIGNoZWNrcyBpbiB0aGUgYnJhY2tldCBtYXRjaGVyLlxuXG5jbGFzcyBTZWxlY3RJbnNpZGVCcmFja2V0cyBleHRlbmRzIFRleHRPYmplY3RcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAYmVnaW5DaGFyLCBAZW5kQ2hhciwgQGluY2x1ZGVCcmFja2V0cykgLT5cblxuICBmaW5kT3BlbmluZ0JyYWNrZXQ6IChwb3MpIC0+XG4gICAgcG9zID0gcG9zLmNvcHkoKVxuICAgIGRlcHRoID0gMFxuICAgIHdoaWxlIHBvcy5yb3cgPj0gMFxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9zLnJvdylcbiAgICAgIHBvcy5jb2x1bW4gPSBsaW5lLmxlbmd0aCAtIDEgaWYgcG9zLmNvbHVtbiBpcyAtMVxuICAgICAgd2hpbGUgcG9zLmNvbHVtbiA+PSAwXG4gICAgICAgIHN3aXRjaCBsaW5lW3Bvcy5jb2x1bW5dXG4gICAgICAgICAgd2hlbiBAZW5kQ2hhciB0aGVuICsrIGRlcHRoXG4gICAgICAgICAgd2hlbiBAYmVnaW5DaGFyXG4gICAgICAgICAgICByZXR1cm4gcG9zIGlmIC0tIGRlcHRoIDwgMFxuICAgICAgICAtLSBwb3MuY29sdW1uXG4gICAgICBwb3MuY29sdW1uID0gLTFcbiAgICAgIC0tIHBvcy5yb3dcblxuICBmaW5kQ2xvc2luZ0JyYWNrZXQ6IChzdGFydCkgLT5cbiAgICBlbmQgPSBzdGFydC5jb3B5KClcbiAgICBkZXB0aCA9IDBcbiAgICB3aGlsZSBlbmQucm93IDwgQGVkaXRvci5nZXRMaW5lQ291bnQoKVxuICAgICAgZW5kTGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kLnJvdylcbiAgICAgIHdoaWxlIGVuZC5jb2x1bW4gPCBlbmRMaW5lLmxlbmd0aFxuICAgICAgICBzd2l0Y2ggZW5kTGluZVtlbmQuY29sdW1uXVxuICAgICAgICAgIHdoZW4gQGJlZ2luQ2hhciB0aGVuICsrIGRlcHRoXG4gICAgICAgICAgd2hlbiBAZW5kQ2hhclxuICAgICAgICAgICAgaWYgLS0gZGVwdGggPCAwXG4gICAgICAgICAgICAgIC0tIHN0YXJ0LmNvbHVtbiBpZiBAaW5jbHVkZUJyYWNrZXRzXG4gICAgICAgICAgICAgICsrIGVuZC5jb2x1bW4gaWYgQGluY2x1ZGVCcmFja2V0c1xuICAgICAgICAgICAgICByZXR1cm4gZW5kXG4gICAgICAgICsrIGVuZC5jb2x1bW5cbiAgICAgIGVuZC5jb2x1bW4gPSAwXG4gICAgICArKyBlbmQucm93XG4gICAgcmV0dXJuXG5cbiAgc2VsZWN0OiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHN0YXJ0ID0gQGZpbmRPcGVuaW5nQnJhY2tldChzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBpZiBzdGFydD9cbiAgICAgICAgKysgc3RhcnQuY29sdW1uICMgc2tpcCB0aGUgb3BlbmluZyBxdW90ZVxuICAgICAgICBlbmQgPSBAZmluZENsb3NpbmdCcmFja2V0KHN0YXJ0KVxuICAgICAgICBpZiBlbmQ/XG4gICAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKG1lcmdlUmFuZ2VzKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLCBbc3RhcnQsIGVuZF0pKVxuICAgICAgbm90IHNlbGVjdGlvbi5pc0VtcHR5KClcblxuY2xhc3MgU2VsZWN0QVdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIHNlbGVjdDogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICBzZWxlY3Rpb24uZXhwYW5kT3ZlcldvcmQoKVxuICAgICAgbG9vcFxuICAgICAgICBlbmRQb2ludCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgICAgICBjaGFyID0gQGVkaXRvci5nZXRUZXh0SW5SYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEoZW5kUG9pbnQsIDAsIDEpKVxuICAgICAgICBicmVhayB1bmxlc3MgQWxsV2hpdGVzcGFjZS50ZXN0KGNoYXIpXG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RSaWdodCgpXG4gICAgICB0cnVlXG5cbmNsYXNzIFNlbGVjdEFXaG9sZVdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIHNlbGVjdDogLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSh7d29yZFJlZ2V4OiBXaG9sZVdvcmRSZWdleH0pXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UobWVyZ2VSYW5nZXMoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCksIHJhbmdlKSlcbiAgICAgIGxvb3BcbiAgICAgICAgZW5kUG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICAgICAgY2hhciA9IEBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKGVuZFBvaW50LCAwLCAxKSlcbiAgICAgICAgYnJlYWsgdW5sZXNzIEFsbFdoaXRlc3BhY2UudGVzdChjaGFyKVxuICAgICAgICBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuICAgICAgdHJ1ZVxuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG5cbiAgc2VsZWN0OiAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIEBzZWxlY3RQYXJhZ3JhcGgoc2VsZWN0aW9uKVxuXG4gICMgUmV0dXJuIGEgcmFuZ2UgZGVsaW10ZWQgYnkgdGhlIHN0YXJ0IG9yIHRoZSBlbmQgb2YgYSBwYXJhZ3JhcGhcbiAgcGFyYWdyYXBoRGVsaW1pdGVkUmFuZ2U6IChzdGFydFBvaW50KSAtPlxuICAgIGluUGFyYWdyYXBoID0gQGlzUGFyYWdyYXBoTGluZShAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHN0YXJ0UG9pbnQucm93KSlcbiAgICB1cHBlclJvdyA9IEBzZWFyY2hMaW5lcyhzdGFydFBvaW50LnJvdywgLTEsIGluUGFyYWdyYXBoKVxuICAgIGxvd2VyUm93ID0gQHNlYXJjaExpbmVzKHN0YXJ0UG9pbnQucm93LCBAZWRpdG9yLmdldExpbmVDb3VudCgpLCBpblBhcmFncmFwaClcbiAgICBuZXcgUmFuZ2UoW3VwcGVyUm93ICsgMSwgMF0sIFtsb3dlclJvdywgMF0pXG5cbiAgc2VhcmNoTGluZXM6IChzdGFydFJvdywgcm93TGltaXQsIHN0YXJ0ZWRJblBhcmFncmFwaCkgLT5cbiAgICBmb3IgY3VycmVudFJvdyBpbiBbc3RhcnRSb3cuLnJvd0xpbWl0XVxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3VycmVudFJvdylcbiAgICAgIGlmIHN0YXJ0ZWRJblBhcmFncmFwaCBpc250IEBpc1BhcmFncmFwaExpbmUobGluZSlcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRSb3dcbiAgICByb3dMaW1pdFxuXG4gIGlzUGFyYWdyYXBoTGluZTogKGxpbmUpIC0+ICgvXFxTLy50ZXN0KGxpbmUpKVxuXG5jbGFzcyBTZWxlY3RJbnNpZGVQYXJhZ3JhcGggZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgc2VsZWN0UGFyYWdyYXBoOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBzdGFydFBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbmV3UmFuZ2UgPSBAcGFyYWdyYXBoRGVsaW1pdGVkUmFuZ2Uoc3RhcnRQb2ludClcbiAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UobWVyZ2VSYW5nZXMob2xkUmFuZ2UsIG5ld1JhbmdlKSlcbiAgICB0cnVlXG5cbmNsYXNzIFNlbGVjdEFQYXJhZ3JhcGggZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgc2VsZWN0UGFyYWdyYXBoOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBzdGFydFBvaW50ID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbmV3UmFuZ2UgPSBAcGFyYWdyYXBoRGVsaW1pdGVkUmFuZ2Uoc3RhcnRQb2ludClcbiAgICBuZXh0UmFuZ2UgPSBAcGFyYWdyYXBoRGVsaW1pdGVkUmFuZ2UobmV3UmFuZ2UuZW5kKVxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShtZXJnZVJhbmdlcyhvbGRSYW5nZSwgW25ld1JhbmdlLnN0YXJ0LCBuZXh0UmFuZ2UuZW5kXSkpXG4gICAgdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtUZXh0T2JqZWN0LCBTZWxlY3RJbnNpZGVXb3JkLCBTZWxlY3RJbnNpZGVXaG9sZVdvcmQsIFNlbGVjdEluc2lkZVF1b3RlcyxcbiAgU2VsZWN0SW5zaWRlQnJhY2tldHMsIFNlbGVjdEFXb3JkLCBTZWxlY3RBV2hvbGVXb3JkLCBTZWxlY3RJbnNpZGVQYXJhZ3JhcGgsIFNlbGVjdEFQYXJhZ3JhcGh9XG4iXX0=
