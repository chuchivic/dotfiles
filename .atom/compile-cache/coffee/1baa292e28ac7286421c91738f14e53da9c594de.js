(function() {
  var MotionWithInput, MoveToFirstCharacterOfLine, MoveToMark, Point, Range, ViewModel, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('./general-motions'), MotionWithInput = ref.MotionWithInput, MoveToFirstCharacterOfLine = ref.MoveToFirstCharacterOfLine;

  ViewModel = require('../view-models/view-model').ViewModel;

  ref1 = require('atom'), Point = ref1.Point, Range = ref1.Range;

  module.exports = MoveToMark = (function(superClass) {
    extend(MoveToMark, superClass);

    function MoveToMark(editor, vimState, linewise) {
      this.editor = editor;
      this.vimState = vimState;
      this.linewise = linewise != null ? linewise : true;
      MoveToMark.__super__.constructor.call(this, this.editor, this.vimState);
      this.operatesLinewise = this.linewise;
      this.viewModel = new ViewModel(this, {
        "class": 'move-to-mark',
        singleChar: true,
        hidden: true
      });
    }

    MoveToMark.prototype.isLinewise = function() {
      return this.linewise;
    };

    MoveToMark.prototype.moveCursor = function(cursor, count) {
      var markPosition;
      if (count == null) {
        count = 1;
      }
      markPosition = this.vimState.getMark(this.input.characters);
      if (this.input.characters === '`') {
        if (markPosition == null) {
          markPosition = [0, 0];
        }
        this.vimState.setMark('`', cursor.getBufferPosition());
      }
      if (markPosition != null) {
        cursor.setBufferPosition(markPosition);
      }
      if (this.linewise) {
        return cursor.moveToFirstCharacterOfLine();
      }
    };

    return MoveToMark;

  })(MotionWithInput);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvbW92ZS10by1tYXJrLW1vdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJGQUFBO0lBQUE7OztFQUFBLE1BQWdELE9BQUEsQ0FBUSxtQkFBUixDQUFoRCxFQUFDLHFDQUFELEVBQWtCOztFQUNqQixZQUFhLE9BQUEsQ0FBUSwyQkFBUjs7RUFDZCxPQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGtCQUFELEVBQVE7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ1Msb0JBQUMsTUFBRCxFQUFVLFFBQVYsRUFBcUIsUUFBckI7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxXQUFEO01BQVcsSUFBQyxDQUFBLDhCQUFELFdBQVU7TUFDMUMsNENBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxJQUFDLENBQUEsUUFBaEI7TUFDQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBQyxDQUFBO01BQ3JCLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUFVLElBQVYsRUFBZ0I7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQVA7UUFBdUIsVUFBQSxFQUFZLElBQW5DO1FBQXlDLE1BQUEsRUFBUSxJQUFqRDtPQUFoQjtJQUhOOzt5QkFLYixVQUFBLEdBQVksU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKOzt5QkFFWixVQUFBLEdBQVksU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNWLFVBQUE7O1FBRG1CLFFBQU07O01BQ3pCLFlBQUEsR0FBZSxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQVYsQ0FBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUF6QjtNQUVmLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLEtBQXFCLEdBQXhCOztVQUNFLGVBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUo7O1FBQ2hCLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixHQUFsQixFQUF1QixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUF2QixFQUZGOztNQUlBLElBQTBDLG9CQUExQztRQUFBLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixZQUF6QixFQUFBOztNQUNBLElBQUcsSUFBQyxDQUFBLFFBQUo7ZUFDRSxNQUFNLENBQUMsMEJBQVAsQ0FBQSxFQURGOztJQVJVOzs7O0tBUlc7QUFMekIiLCJzb3VyY2VzQ29udGVudCI6WyJ7TW90aW9uV2l0aElucHV0LCBNb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZX0gPSByZXF1aXJlICcuL2dlbmVyYWwtbW90aW9ucydcbntWaWV3TW9kZWx9ID0gcmVxdWlyZSAnLi4vdmlldy1tb2RlbHMvdmlldy1tb2RlbCdcbntQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTW92ZVRvTWFyayBleHRlbmRzIE1vdGlvbldpdGhJbnB1dFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSwgQGxpbmV3aXNlPXRydWUpIC0+XG4gICAgc3VwZXIoQGVkaXRvciwgQHZpbVN0YXRlKVxuICAgIEBvcGVyYXRlc0xpbmV3aXNlID0gQGxpbmV3aXNlXG4gICAgQHZpZXdNb2RlbCA9IG5ldyBWaWV3TW9kZWwodGhpcywgY2xhc3M6ICdtb3ZlLXRvLW1hcmsnLCBzaW5nbGVDaGFyOiB0cnVlLCBoaWRkZW46IHRydWUpXG5cbiAgaXNMaW5ld2lzZTogLT4gQGxpbmV3aXNlXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICBtYXJrUG9zaXRpb24gPSBAdmltU3RhdGUuZ2V0TWFyayhAaW5wdXQuY2hhcmFjdGVycylcblxuICAgIGlmIEBpbnB1dC5jaGFyYWN0ZXJzIGlzICdgJyAjIGRvdWJsZSAnYCcgcHJlc3NlZFxuICAgICAgbWFya1Bvc2l0aW9uID89IFswLCAwXSAjIGlmIG1hcmtQb3NpdGlvbiBub3Qgc2V0LCBnbyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXG4gICAgICBAdmltU3RhdGUuc2V0TWFyaygnYCcsIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKG1hcmtQb3NpdGlvbikgaWYgbWFya1Bvc2l0aW9uP1xuICAgIGlmIEBsaW5ld2lzZVxuICAgICAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiJdfQ==
