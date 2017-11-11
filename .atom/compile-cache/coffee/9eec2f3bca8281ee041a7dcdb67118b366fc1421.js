(function() {
  var copyCharacterFromAbove, copyCharacterFromBelow;

  copyCharacterFromAbove = function(editor, vimState) {
    return editor.transact(function() {
      var column, cursor, i, len, range, ref, ref1, results, row;
      ref = editor.getCursors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        cursor = ref[i];
        ref1 = cursor.getScreenPosition(), row = ref1.row, column = ref1.column;
        if (row === 0) {
          continue;
        }
        range = [[row - 1, column], [row - 1, column + 1]];
        results.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))));
      }
      return results;
    });
  };

  copyCharacterFromBelow = function(editor, vimState) {
    return editor.transact(function() {
      var column, cursor, i, len, range, ref, ref1, results, row;
      ref = editor.getCursors();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        cursor = ref[i];
        ref1 = cursor.getScreenPosition(), row = ref1.row, column = ref1.column;
        range = [[row + 1, column], [row + 1, column + 1]];
        results.push(cursor.selection.insertText(editor.getTextInBufferRange(editor.bufferRangeForScreenRange(range))));
      }
      return results;
    });
  };

  module.exports = {
    copyCharacterFromAbove: copyCharacterFromAbove,
    copyCharacterFromBelow: copyCharacterFromBelow
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL2luc2VydC1tb2RlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsc0JBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsUUFBVDtXQUN2QixNQUFNLENBQUMsUUFBUCxDQUFnQixTQUFBO0FBQ2QsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7UUFDRSxPQUFnQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFoQixFQUFDLGNBQUQsRUFBTTtRQUNOLElBQVksR0FBQSxLQUFPLENBQW5CO0FBQUEsbUJBQUE7O1FBQ0EsS0FBQSxHQUFRLENBQUMsQ0FBQyxHQUFBLEdBQUksQ0FBTCxFQUFRLE1BQVIsQ0FBRCxFQUFrQixDQUFDLEdBQUEsR0FBSSxDQUFMLEVBQVEsTUFBQSxHQUFPLENBQWYsQ0FBbEI7cUJBQ1IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFqQixDQUE0QixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsTUFBTSxDQUFDLHlCQUFQLENBQWlDLEtBQWpDLENBQTVCLENBQTVCO0FBSkY7O0lBRGMsQ0FBaEI7RUFEdUI7O0VBUXpCLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLFFBQVQ7V0FDdkIsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsU0FBQTtBQUNkLFVBQUE7QUFBQTtBQUFBO1dBQUEscUNBQUE7O1FBQ0UsT0FBZ0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBaEIsRUFBQyxjQUFELEVBQU07UUFDTixLQUFBLEdBQVEsQ0FBQyxDQUFDLEdBQUEsR0FBSSxDQUFMLEVBQVEsTUFBUixDQUFELEVBQWtCLENBQUMsR0FBQSxHQUFJLENBQUwsRUFBUSxNQUFBLEdBQU8sQ0FBZixDQUFsQjtxQkFDUixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQWpCLENBQTRCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixNQUFNLENBQUMseUJBQVAsQ0FBaUMsS0FBakMsQ0FBNUIsQ0FBNUI7QUFIRjs7SUFEYyxDQUFoQjtFQUR1Qjs7RUFPekIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZix3QkFBQSxzQkFEZTtJQUVmLHdCQUFBLHNCQUZlOztBQWZqQiIsInNvdXJjZXNDb250ZW50IjpbImNvcHlDaGFyYWN0ZXJGcm9tQWJvdmUgPSAoZWRpdG9yLCB2aW1TdGF0ZSkgLT5cbiAgZWRpdG9yLnRyYW5zYWN0IC0+XG4gICAgZm9yIGN1cnNvciBpbiBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICB7cm93LCBjb2x1bW59ID0gY3Vyc29yLmdldFNjcmVlblBvc2l0aW9uKClcbiAgICAgIGNvbnRpbnVlIGlmIHJvdyBpcyAwXG4gICAgICByYW5nZSA9IFtbcm93LTEsIGNvbHVtbl0sIFtyb3ctMSwgY29sdW1uKzFdXVxuICAgICAgY3Vyc29yLnNlbGVjdGlvbi5pbnNlcnRUZXh0KGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShyYW5nZSkpKVxuXG5jb3B5Q2hhcmFjdGVyRnJvbUJlbG93ID0gKGVkaXRvciwgdmltU3RhdGUpIC0+XG4gIGVkaXRvci50cmFuc2FjdCAtPlxuICAgIGZvciBjdXJzb3IgaW4gZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAge3JvdywgY29sdW1ufSA9IGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpXG4gICAgICByYW5nZSA9IFtbcm93KzEsIGNvbHVtbl0sIFtyb3crMSwgY29sdW1uKzFdXVxuICAgICAgY3Vyc29yLnNlbGVjdGlvbi5pbnNlcnRUZXh0KGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShyYW5nZSkpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29weUNoYXJhY3RlckZyb21BYm92ZSxcbiAgY29weUNoYXJhY3RlckZyb21CZWxvd1xufVxuIl19
