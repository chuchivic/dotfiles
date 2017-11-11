(function() {
  var Operator, Put, _, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Operator = require('./general-operators').Operator;

  settings = require('../settings');

  module.exports = Put = (function(superClass) {
    extend(Put, superClass);

    Put.prototype.register = null;

    function Put(editor, vimState, arg) {
      this.editor = editor;
      this.vimState = vimState;
      this.location = (arg != null ? arg : {}).location;
      if (this.location == null) {
        this.location = 'after';
      }
      this.complete = true;
      this.register = settings.defaultRegister();
    }

    Put.prototype.execute = function(count) {
      var originalPosition, ref, selection, text, textToInsert, type;
      if (count == null) {
        count = 1;
      }
      ref = this.vimState.getRegister(this.register) || {}, text = ref.text, type = ref.type;
      if (!text) {
        return;
      }
      textToInsert = _.times(count, function() {
        return text;
      }).join('');
      selection = this.editor.getSelectedBufferRange();
      if (selection.isEmpty()) {
        if (type === 'linewise') {
          textToInsert = textToInsert.replace(/\n$/, '');
          if (this.location === 'after' && this.onLastRow()) {
            textToInsert = "\n" + textToInsert;
          } else {
            textToInsert = textToInsert + "\n";
          }
        }
        if (this.location === 'after') {
          if (type === 'linewise') {
            if (this.onLastRow()) {
              this.editor.moveToEndOfLine();
              originalPosition = this.editor.getCursorScreenPosition();
              originalPosition.row += 1;
            } else {
              this.editor.moveDown();
            }
          } else {
            if (!this.onLastColumn()) {
              this.editor.moveRight();
            }
          }
        }
        if (type === 'linewise' && (originalPosition == null)) {
          this.editor.moveToBeginningOfLine();
          originalPosition = this.editor.getCursorScreenPosition();
        }
      }
      this.editor.insertText(textToInsert);
      if (originalPosition != null) {
        this.editor.setCursorScreenPosition(originalPosition);
        this.editor.moveToFirstCharacterOfLine();
      }
      if (type !== 'linewise') {
        this.editor.moveLeft();
      }
      return this.vimState.activateNormalMode();
    };

    Put.prototype.onLastRow = function() {
      var column, ref, row;
      ref = this.editor.getCursorBufferPosition(), row = ref.row, column = ref.column;
      return row === this.editor.getBuffer().getLastRow();
    };

    Put.prototype.onLastColumn = function() {
      return this.editor.getLastCursor().isAtEndOfLine();
    };

    return Put;

  })(Operator);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9wdXQtb3BlcmF0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwQkFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILFdBQVksT0FBQSxDQUFRLHFCQUFSOztFQUNiLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUlNOzs7a0JBQ0osUUFBQSxHQUFVOztJQUVHLGFBQUMsTUFBRCxFQUFVLFFBQVYsRUFBcUIsR0FBckI7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxXQUFEO01BQVksSUFBQyxDQUFBLDBCQUFGLE1BQVksSUFBVjs7UUFDbEMsSUFBQyxDQUFBLFdBQVk7O01BQ2IsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksUUFBUSxDQUFDLGVBQVQsQ0FBQTtJQUhEOztrQkFVYixPQUFBLEdBQVMsU0FBQyxLQUFEO0FBQ1AsVUFBQTs7UUFEUSxRQUFNOztNQUNkLE1BQWUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFWLENBQXNCLElBQUMsQ0FBQSxRQUF2QixDQUFBLElBQW9DLEVBQW5ELEVBQUMsZUFBRCxFQUFPO01BQ1AsSUFBQSxDQUFjLElBQWQ7QUFBQSxlQUFBOztNQUVBLFlBQUEsR0FBZSxDQUFDLENBQUMsS0FBRixDQUFRLEtBQVIsRUFBZSxTQUFBO2VBQUc7TUFBSCxDQUFmLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsRUFBN0I7TUFFZixTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxzQkFBUixDQUFBO01BQ1osSUFBRyxTQUFTLENBQUMsT0FBVixDQUFBLENBQUg7UUFFRSxJQUFHLElBQUEsS0FBUSxVQUFYO1VBQ0UsWUFBQSxHQUFlLFlBQVksQ0FBQyxPQUFiLENBQXFCLEtBQXJCLEVBQTRCLEVBQTVCO1VBQ2YsSUFBRyxJQUFDLENBQUEsUUFBRCxLQUFhLE9BQWIsSUFBeUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUE1QjtZQUNFLFlBQUEsR0FBZSxJQUFBLEdBQUssYUFEdEI7V0FBQSxNQUFBO1lBR0UsWUFBQSxHQUFrQixZQUFELEdBQWMsS0FIakM7V0FGRjs7UUFPQSxJQUFHLElBQUMsQ0FBQSxRQUFELEtBQWEsT0FBaEI7VUFDRSxJQUFHLElBQUEsS0FBUSxVQUFYO1lBQ0UsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUg7Y0FDRSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBQTtjQUVBLGdCQUFBLEdBQW1CLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQTtjQUNuQixnQkFBZ0IsQ0FBQyxHQUFqQixJQUF3QixFQUoxQjthQUFBLE1BQUE7Y0FNRSxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQSxFQU5GO2FBREY7V0FBQSxNQUFBO1lBU0UsSUFBQSxDQUFPLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBUDtjQUNFLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLEVBREY7YUFURjtXQURGOztRQWFBLElBQUcsSUFBQSxLQUFRLFVBQVIsSUFBMkIsMEJBQTlCO1VBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUFBO1VBQ0EsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLEVBRnJCO1NBdEJGOztNQTBCQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsWUFBbkI7TUFFQSxJQUFHLHdCQUFIO1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFnQyxnQkFBaEM7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQUEsRUFGRjs7TUFJQSxJQUFHLElBQUEsS0FBVSxVQUFiO1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUEsRUFERjs7YUFFQSxJQUFDLENBQUEsUUFBUSxDQUFDLGtCQUFWLENBQUE7SUF6Q087O2tCQThDVCxTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxNQUFnQixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUEsQ0FBaEIsRUFBQyxhQUFELEVBQU07YUFDTixHQUFBLEtBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUEsQ0FBbUIsQ0FBQyxVQUFwQixDQUFBO0lBRkU7O2tCQUlYLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxhQUF4QixDQUFBO0lBRFk7Ozs7S0EvREU7QUFSbEIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue09wZXJhdG9yfSA9IHJlcXVpcmUgJy4vZ2VuZXJhbC1vcGVyYXRvcnMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4jXG4jIEl0IHBhc3RlcyBldmVyeXRoaW5nIGNvbnRhaW5lZCB3aXRoaW4gdGhlIHNwZWNpZmVkIHJlZ2lzdGVyXG4jXG5jbGFzcyBQdXQgZXh0ZW5kcyBPcGVyYXRvclxuICByZWdpc3RlcjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlLCB7QGxvY2F0aW9ufT17fSkgLT5cbiAgICBAbG9jYXRpb24gPz0gJ2FmdGVyJ1xuICAgIEBjb21wbGV0ZSA9IHRydWVcbiAgICBAcmVnaXN0ZXIgPSBzZXR0aW5ncy5kZWZhdWx0UmVnaXN0ZXIoKVxuXG4gICMgUHVibGljOiBQYXN0ZXMgdGhlIHRleHQgaW4gdGhlIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgY291bnQgLSBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGV4ZWN1dGUuXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGV4ZWN1dGU6IChjb3VudD0xKSAtPlxuICAgIHt0ZXh0LCB0eXBlfSA9IEB2aW1TdGF0ZS5nZXRSZWdpc3RlcihAcmVnaXN0ZXIpIG9yIHt9XG4gICAgcmV0dXJuIHVubGVzcyB0ZXh0XG5cbiAgICB0ZXh0VG9JbnNlcnQgPSBfLnRpbWVzKGNvdW50LCAtPiB0ZXh0KS5qb2luKCcnKVxuXG4gICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKClcbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAjIENsZWFuIHVwIHNvbWUgY29ybmVyIGNhc2VzIG9uIHRoZSBsYXN0IGxpbmUgb2YgdGhlIGZpbGVcbiAgICAgIGlmIHR5cGUgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICB0ZXh0VG9JbnNlcnQgPSB0ZXh0VG9JbnNlcnQucmVwbGFjZSgvXFxuJC8sICcnKVxuICAgICAgICBpZiBAbG9jYXRpb24gaXMgJ2FmdGVyJyBhbmQgQG9uTGFzdFJvdygpXG4gICAgICAgICAgdGV4dFRvSW5zZXJ0ID0gXCJcXG4je3RleHRUb0luc2VydH1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGV4dFRvSW5zZXJ0ID0gXCIje3RleHRUb0luc2VydH1cXG5cIlxuXG4gICAgICBpZiBAbG9jYXRpb24gaXMgJ2FmdGVyJ1xuICAgICAgICBpZiB0eXBlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgICBpZiBAb25MYXN0Um93KClcbiAgICAgICAgICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcblxuICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbi5yb3cgKz0gMVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBlZGl0b3IubW92ZURvd24oKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdW5sZXNzIEBvbkxhc3RDb2x1bW4oKVxuICAgICAgICAgICAgQGVkaXRvci5tb3ZlUmlnaHQoKVxuXG4gICAgICBpZiB0eXBlIGlzICdsaW5ld2lzZScgYW5kIG5vdCBvcmlnaW5hbFBvc2l0aW9uP1xuICAgICAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKClcblxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0VG9JbnNlcnQpXG5cbiAgICBpZiBvcmlnaW5hbFBvc2l0aW9uP1xuICAgICAgQGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbihvcmlnaW5hbFBvc2l0aW9uKVxuICAgICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbiAgICBpZiB0eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgQGVkaXRvci5tb3ZlTGVmdCgpXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlTm9ybWFsTW9kZSgpXG5cbiAgIyBQcml2YXRlOiBIZWxwZXIgdG8gZGV0ZXJtaW5lIGlmIHRoZSBlZGl0b3IgaXMgY3VycmVudGx5IG9uIHRoZSBsYXN0IHJvdy5cbiAgI1xuICAjIFJldHVybnMgdHJ1ZSBvbiB0aGUgbGFzdCByb3cgYW5kIGZhbHNlIG90aGVyd2lzZS5cbiAgb25MYXN0Um93OiAtPlxuICAgIHtyb3csIGNvbHVtbn0gPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICByb3cgaXMgQGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMYXN0Um93KClcblxuICBvbkxhc3RDb2x1bW46IC0+XG4gICAgQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuaXNBdEVuZE9mTGluZSgpXG4iXX0=
