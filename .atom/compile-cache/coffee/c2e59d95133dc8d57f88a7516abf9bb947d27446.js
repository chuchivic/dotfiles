(function() {
  var Find, MotionWithInput, Point, Range, Till, ViewModel, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  MotionWithInput = require('./general-motions').MotionWithInput;

  ViewModel = require('../view-models/view-model').ViewModel;

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  Find = (function(superClass) {
    extend(Find, superClass);

    Find.prototype.operatesInclusively = true;

    function Find(editor, vimState, opts) {
      var orig;
      this.editor = editor;
      this.vimState = vimState;
      if (opts == null) {
        opts = {};
      }
      Find.__super__.constructor.call(this, this.editor, this.vimState);
      this.offset = 0;
      if (!opts.repeated) {
        this.viewModel = new ViewModel(this, {
          "class": 'find',
          singleChar: true,
          hidden: true
        });
        this.backwards = false;
        this.repeated = false;
        this.vimState.globalVimState.currentFind = this;
      } else {
        this.repeated = true;
        orig = this.vimState.globalVimState.currentFind;
        this.backwards = orig.backwards;
        this.complete = orig.complete;
        this.input = orig.input;
        if (opts.reverse) {
          this.reverse();
        }
      }
    }

    Find.prototype.match = function(cursor, count) {
      var currentPosition, i, index, j, k, line, ref1, ref2;
      currentPosition = cursor.getBufferPosition();
      line = this.editor.lineTextForBufferRow(currentPosition.row);
      if (this.backwards) {
        index = currentPosition.column;
        for (i = j = 0, ref1 = count - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
          if (index <= 0) {
            return;
          }
          index = line.lastIndexOf(this.input.characters, index - 1 - (this.offset * this.repeated));
        }
        if (index >= 0) {
          return new Point(currentPosition.row, index + this.offset);
        }
      } else {
        index = currentPosition.column;
        for (i = k = 0, ref2 = count - 1; 0 <= ref2 ? k <= ref2 : k >= ref2; i = 0 <= ref2 ? ++k : --k) {
          index = line.indexOf(this.input.characters, index + 1 + (this.offset * this.repeated));
          if (index < 0) {
            return;
          }
        }
        if (index >= 0) {
          return new Point(currentPosition.row, index - this.offset);
        }
      }
    };

    Find.prototype.reverse = function() {
      this.backwards = !this.backwards;
      return this;
    };

    Find.prototype.moveCursor = function(cursor, count) {
      var match;
      if (count == null) {
        count = 1;
      }
      if ((match = this.match(cursor, count)) != null) {
        return cursor.setBufferPosition(match);
      }
    };

    return Find;

  })(MotionWithInput);

  Till = (function(superClass) {
    extend(Till, superClass);

    function Till(editor, vimState, opts) {
      this.editor = editor;
      this.vimState = vimState;
      if (opts == null) {
        opts = {};
      }
      Till.__super__.constructor.call(this, this.editor, this.vimState, opts);
      this.offset = 1;
    }

    Till.prototype.match = function() {
      var retval;
      this.selectAtLeastOne = false;
      retval = Till.__super__.match.apply(this, arguments);
      if ((retval != null) && !this.backwards) {
        this.selectAtLeastOne = true;
      }
      return retval;
    };

    Till.prototype.moveSelectionInclusively = function(selection, count, options) {
      Till.__super__.moveSelectionInclusively.apply(this, arguments);
      if (selection.isEmpty() && this.selectAtLeastOne) {
        return selection.modifySelection(function() {
          return selection.cursor.moveRight();
        });
      }
    };

    return Till;

  })(Find);

  module.exports = {
    Find: Find,
    Till: Till
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvZmluZC1tb3Rpb24uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5REFBQTtJQUFBOzs7RUFBQyxrQkFBbUIsT0FBQSxDQUFRLG1CQUFSOztFQUNuQixZQUFhLE9BQUEsQ0FBUSwyQkFBUjs7RUFDZCxNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBRUY7OzttQkFDSixtQkFBQSxHQUFxQjs7SUFFUixjQUFDLE1BQUQsRUFBVSxRQUFWLEVBQXFCLElBQXJCO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFdBQUQ7O1FBQVcsT0FBSzs7TUFDckMsc0NBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxJQUFDLENBQUEsUUFBaEI7TUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BRVYsSUFBRyxDQUFJLElBQUksQ0FBQyxRQUFaO1FBQ0UsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQjtVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sTUFBUDtVQUFlLFVBQUEsRUFBWSxJQUEzQjtVQUFpQyxNQUFBLEVBQVEsSUFBekM7U0FBaEI7UUFDakIsSUFBQyxDQUFBLFNBQUQsR0FBYTtRQUNiLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFDWixJQUFDLENBQUEsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUF6QixHQUF1QyxLQUp6QztPQUFBLE1BQUE7UUFPRSxJQUFDLENBQUEsUUFBRCxHQUFZO1FBRVosSUFBQSxHQUFPLElBQUMsQ0FBQSxRQUFRLENBQUMsY0FBYyxDQUFDO1FBQ2hDLElBQUMsQ0FBQSxTQUFELEdBQWEsSUFBSSxDQUFDO1FBQ2xCLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxDQUFDO1FBQ2pCLElB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dGVudCI6WyJ7TW90aW9uV2l0aElucHV0fSA9IHJlcXVpcmUgJy4vZ2VuZXJhbC1tb3Rpb25zJ1xue1ZpZXdNb2RlbH0gPSByZXF1aXJlICcuLi92aWV3LW1vZGVscy92aWV3LW1vZGVsJ1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5jbGFzcyBGaW5kIGV4dGVuZHMgTW90aW9uV2l0aElucHV0XG4gIG9wZXJhdGVzSW5jbHVzaXZlbHk6IHRydWVcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSwgb3B0cz17fSkgLT5cbiAgICBzdXBlcihAZWRpdG9yLCBAdmltU3RhdGUpXG4gICAgQG9mZnNldCA9IDBcblxuICAgIGlmIG5vdCBvcHRzLnJlcGVhdGVkXG4gICAgICBAdmlld01vZGVsID0gbmV3IFZpZXdNb2RlbCh0aGlzLCBjbGFzczogJ2ZpbmQnLCBzaW5nbGVDaGFyOiB0cnVlLCBoaWRkZW46IHRydWUpXG4gICAgICBAYmFja3dhcmRzID0gZmFsc2VcbiAgICAgIEByZXBlYXRlZCA9IGZhbHNlXG4gICAgICBAdmltU3RhdGUuZ2xvYmFsVmltU3RhdGUuY3VycmVudEZpbmQgPSB0aGlzXG5cbiAgICBlbHNlXG4gICAgICBAcmVwZWF0ZWQgPSB0cnVlXG5cbiAgICAgIG9yaWcgPSBAdmltU3RhdGUuZ2xvYmFsVmltU3RhdGUuY3VycmVudEZpbmRcbiAgICAgIEBiYWNrd2FyZHMgPSBvcmlnLmJhY2t3YXJkc1xuICAgICAgQGNvbXBsZXRlID0gb3JpZy5jb21wbGV0ZVxuICAgICAgQGlucHV0ID0gb3JpZy5pbnB1dFxuXG4gICAgICBAcmV2ZXJzZSgpIGlmIG9wdHMucmV2ZXJzZVxuXG4gIG1hdGNoOiAoY3Vyc29yLCBjb3VudCkgLT5cbiAgICBjdXJyZW50UG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnJlbnRQb3NpdGlvbi5yb3cpXG4gICAgaWYgQGJhY2t3YXJkc1xuICAgICAgaW5kZXggPSBjdXJyZW50UG9zaXRpb24uY29sdW1uXG4gICAgICBmb3IgaSBpbiBbMC4uY291bnQtMV1cbiAgICAgICAgcmV0dXJuIGlmIGluZGV4IDw9IDAgIyB3ZSBjYW4ndCBtb3ZlIGJhY2t3YXJkcyBhbnkgZnVydGhlciwgcXVpY2sgcmV0dXJuXG4gICAgICAgIGluZGV4ID0gbGluZS5sYXN0SW5kZXhPZihAaW5wdXQuY2hhcmFjdGVycywgaW5kZXgtMS0oQG9mZnNldCpAcmVwZWF0ZWQpKVxuICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICBuZXcgUG9pbnQoY3VycmVudFBvc2l0aW9uLnJvdywgaW5kZXggKyBAb2Zmc2V0KVxuICAgIGVsc2VcbiAgICAgIGluZGV4ID0gY3VycmVudFBvc2l0aW9uLmNvbHVtblxuICAgICAgZm9yIGkgaW4gWzAuLmNvdW50LTFdXG4gICAgICAgIGluZGV4ID0gbGluZS5pbmRleE9mKEBpbnB1dC5jaGFyYWN0ZXJzLCBpbmRleCsxKyhAb2Zmc2V0KkByZXBlYXRlZCkpXG4gICAgICAgIHJldHVybiBpZiBpbmRleCA8IDAgIyBubyBtYXRjaCBmb3VuZFxuICAgICAgaWYgaW5kZXggPj0gMFxuICAgICAgICBuZXcgUG9pbnQoY3VycmVudFBvc2l0aW9uLnJvdywgaW5kZXggLSBAb2Zmc2V0KVxuXG4gIHJldmVyc2U6IC0+XG4gICAgQGJhY2t3YXJkcyA9IG5vdCBAYmFja3dhcmRzXG4gICAgdGhpc1xuXG4gIG1vdmVDdXJzb3I6IChjdXJzb3IsIGNvdW50PTEpIC0+XG4gICAgaWYgKG1hdGNoID0gQG1hdGNoKGN1cnNvciwgY291bnQpKT9cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihtYXRjaClcblxuY2xhc3MgVGlsbCBleHRlbmRzIEZpbmRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAdmltU3RhdGUsIG9wdHM9e30pIC0+XG4gICAgc3VwZXIoQGVkaXRvciwgQHZpbVN0YXRlLCBvcHRzKVxuICAgIEBvZmZzZXQgPSAxXG5cbiAgbWF0Y2g6IC0+XG4gICAgQHNlbGVjdEF0TGVhc3RPbmUgPSBmYWxzZVxuICAgIHJldHZhbCA9IHN1cGVyXG4gICAgaWYgcmV0dmFsPyBhbmQgbm90IEBiYWNrd2FyZHNcbiAgICAgIEBzZWxlY3RBdExlYXN0T25lID0gdHJ1ZVxuICAgIHJldHZhbFxuXG4gIG1vdmVTZWxlY3Rpb25JbmNsdXNpdmVseTogKHNlbGVjdGlvbiwgY291bnQsIG9wdGlvbnMpIC0+XG4gICAgc3VwZXJcbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpIGFuZCBAc2VsZWN0QXRMZWFzdE9uZVxuICAgICAgc2VsZWN0aW9uLm1vZGlmeVNlbGVjdGlvbiAtPlxuICAgICAgICBzZWxlY3Rpb24uY3Vyc29yLm1vdmVSaWdodCgpXG5cbm1vZHVsZS5leHBvcnRzID0ge0ZpbmQsIFRpbGx9XG4iXX0=
