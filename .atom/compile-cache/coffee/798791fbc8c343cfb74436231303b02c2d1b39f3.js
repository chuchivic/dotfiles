(function() {
  var Decrease, Increase, Operator, Range, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Operator = require('./general-operators').Operator;

  Range = require('atom').Range;

  settings = require('../settings');

  Increase = (function(superClass) {
    extend(Increase, superClass);

    Increase.prototype.step = 1;

    function Increase() {
      Increase.__super__.constructor.apply(this, arguments);
      this.complete = true;
      this.numberRegex = new RegExp(settings.numberRegex());
    }

    Increase.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var cursor, i, increased, len, ref;
          increased = false;
          ref = _this.editor.getCursors();
          for (i = 0, len = ref.length; i < len; i++) {
            cursor = ref[i];
            if (_this.increaseNumber(count, cursor)) {
              increased = true;
            }
          }
          if (!increased) {
            return atom.beep();
          }
        };
      })(this));
    };

    Increase.prototype.increaseNumber = function(count, cursor) {
      var cursorPosition, newValue, numEnd, numStart, number, range;
      cursorPosition = cursor.getBufferPosition();
      numEnd = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.numberRegex,
        allowNext: false
      });
      if (numEnd.column === cursorPosition.column) {
        numEnd = cursor.getEndOfCurrentWordBufferPosition({
          wordRegex: this.numberRegex,
          allowNext: true
        });
        if (numEnd.row !== cursorPosition.row) {
          return;
        }
        if (numEnd.column === cursorPosition.column) {
          return;
        }
      }
      cursor.setBufferPosition(numEnd);
      numStart = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.numberRegex,
        allowPrevious: false
      });
      range = new Range(numStart, numEnd);
      number = parseInt(this.editor.getTextInBufferRange(range), 10);
      if (isNaN(number)) {
        cursor.setBufferPosition(cursorPosition);
        return;
      }
      number += this.step * count;
      newValue = String(number);
      this.editor.setTextInBufferRange(range, newValue, {
        normalizeLineEndings: false
      });
      cursor.setBufferPosition({
        row: numStart.row,
        column: numStart.column - 1 + newValue.length
      });
      return true;
    };

    return Increase;

  })(Operator);

  Decrease = (function(superClass) {
    extend(Decrease, superClass);

    function Decrease() {
      return Decrease.__super__.constructor.apply(this, arguments);
    }

    Decrease.prototype.step = -1;

    return Decrease;

  })(Increase);

  module.exports = {
    Increase: Increase,
    Decrease: Decrease
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbmNyZWFzZS1vcGVyYXRvcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2Q0FBQTtJQUFBOzs7RUFBQyxXQUFZLE9BQUEsQ0FBUSxxQkFBUjs7RUFDWixRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFLTDs7O3VCQUNKLElBQUEsR0FBTTs7SUFFTyxrQkFBQTtNQUNYLDJDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZO01BQ1osSUFBQyxDQUFBLFdBQUQsR0FBbUIsSUFBQSxNQUFBLENBQU8sUUFBUSxDQUFDLFdBQVQsQ0FBQSxDQUFQO0lBSFI7O3VCQUtiLE9BQUEsR0FBUyxTQUFDLEtBQUQ7O1FBQUMsUUFBTTs7YUFDZCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBQ2YsY0FBQTtVQUFBLFNBQUEsR0FBWTtBQUNaO0FBQUEsZUFBQSxxQ0FBQTs7WUFDRSxJQUFHLEtBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCLEVBQXVCLE1BQXZCLENBQUg7Y0FBdUMsU0FBQSxHQUFZLEtBQW5EOztBQURGO1VBRUEsSUFBQSxDQUFtQixTQUFuQjttQkFBQSxJQUFJLENBQUMsSUFBTCxDQUFBLEVBQUE7O1FBSmU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO0lBRE87O3VCQU9ULGNBQUEsR0FBZ0IsU0FBQyxLQUFELEVBQVEsTUFBUjtBQUVkLFVBQUE7TUFBQSxjQUFBLEdBQWlCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO01BQ2pCLE1BQUEsR0FBUyxNQUFNLENBQUMsaUNBQVAsQ0FBeUM7UUFBQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFdBQVo7UUFBeUIsU0FBQSxFQUFXLEtBQXBDO09BQXpDO01BRVQsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixjQUFjLENBQUMsTUFBbkM7UUFFRSxNQUFBLEdBQVMsTUFBTSxDQUFDLGlDQUFQLENBQXlDO1VBQUEsU0FBQSxFQUFXLElBQUMsQ0FBQSxXQUFaO1VBQXlCLFNBQUEsRUFBVyxJQUFwQztTQUF6QztRQUNULElBQVUsTUFBTSxDQUFDLEdBQVAsS0FBZ0IsY0FBYyxDQUFDLEdBQXpDO0FBQUEsaUJBQUE7O1FBQ0EsSUFBVSxNQUFNLENBQUMsTUFBUCxLQUFpQixjQUFjLENBQUMsTUFBMUM7QUFBQSxpQkFBQTtTQUpGOztNQU1BLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixNQUF6QjtNQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMsdUNBQVAsQ0FBK0M7UUFBQSxTQUFBLEVBQVcsSUFBQyxDQUFBLFdBQVo7UUFBeUIsYUFBQSxFQUFlLEtBQXhDO09BQS9DO01BRVgsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsTUFBaEI7TUFHWixNQUFBLEdBQVMsUUFBQSxDQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsS0FBN0IsQ0FBVCxFQUE4QyxFQUE5QztNQUNULElBQUcsS0FBQSxDQUFNLE1BQU4sQ0FBSDtRQUNFLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixjQUF6QjtBQUNBLGVBRkY7O01BSUEsTUFBQSxJQUFVLElBQUMsQ0FBQSxJQUFELEdBQU07TUFHaEIsUUFBQSxHQUFXLE1BQUEsQ0FBTyxNQUFQO01BQ1gsSUFBQyxDQUFBLE1BQU0sQ0FBQyxvQkFBUixDQUE2QixLQUE3QixFQUFvQyxRQUFwQyxFQUE4QztRQUFBLG9CQUFBLEVBQXNCLEtBQXRCO09BQTlDO01BRUEsTUFBTSxDQUFDLGlCQUFQLENBQXlCO1FBQUEsR0FBQSxFQUFLLFFBQVEsQ0FBQyxHQUFkO1FBQW1CLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBVCxHQUFnQixDQUFoQixHQUFrQixRQUFRLENBQUMsTUFBdEQ7T0FBekI7QUFDQSxhQUFPO0lBN0JPOzs7O0tBZks7O0VBOENqQjs7Ozs7Ozt1QkFDSixJQUFBLEdBQU0sQ0FBQzs7OztLQURjOztFQUd2QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLFVBQUEsUUFBRDtJQUFXLFVBQUEsUUFBWDs7QUF4RGpCIiwic291cmNlc0NvbnRlbnQiOlsie09wZXJhdG9yfSA9IHJlcXVpcmUgJy4vZ2VuZXJhbC1vcGVyYXRvcnMnXG57UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vc2V0dGluZ3MnXG5cbiNcbiMgSXQgaW5jcmVhc2VzIG9yIGRlY3JlYXNlcyB0aGUgbmV4dCBudW1iZXIgb24gdGhlIGxpbmVcbiNcbmNsYXNzIEluY3JlYXNlIGV4dGVuZHMgT3BlcmF0b3JcbiAgc3RlcDogMVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGNvbXBsZXRlID0gdHJ1ZVxuICAgIEBudW1iZXJSZWdleCA9IG5ldyBSZWdFeHAoc2V0dGluZ3MubnVtYmVyUmVnZXgoKSlcblxuICBleGVjdXRlOiAoY291bnQ9MSkgLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBpbmNyZWFzZWQgPSBmYWxzZVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBpZiBAaW5jcmVhc2VOdW1iZXIoY291bnQsIGN1cnNvcikgdGhlbiBpbmNyZWFzZWQgPSB0cnVlXG4gICAgICBhdG9tLmJlZXAoKSB1bmxlc3MgaW5jcmVhc2VkXG5cbiAgaW5jcmVhc2VOdW1iZXI6IChjb3VudCwgY3Vyc29yKSAtPlxuICAgICMgZmluZCBwb3NpdGlvbiBvZiBjdXJyZW50IG51bWJlciwgYWRhcHRlZCBmcm9tIGZyb20gU2VhcmNoQ3VycmVudFdvcmRcbiAgICBjdXJzb3JQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgbnVtRW5kID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih3b3JkUmVnZXg6IEBudW1iZXJSZWdleCwgYWxsb3dOZXh0OiBmYWxzZSlcblxuICAgIGlmIG51bUVuZC5jb2x1bW4gaXMgY3Vyc29yUG9zaXRpb24uY29sdW1uXG4gICAgICAjIGVpdGhlciB3ZSBkb24ndCBoYXZlIGEgY3VycmVudCBudW1iZXIsIG9yIGl0IGVuZHMgb24gY3Vyc29yLCBpLmUuIHByZWNlZGVzIGl0LCBzbyBsb29rIGZvciB0aGUgbmV4dCBvbmVcbiAgICAgIG51bUVuZCA9IGN1cnNvci5nZXRFbmRPZkN1cnJlbnRXb3JkQnVmZmVyUG9zaXRpb24od29yZFJlZ2V4OiBAbnVtYmVyUmVnZXgsIGFsbG93TmV4dDogdHJ1ZSlcbiAgICAgIHJldHVybiBpZiBudW1FbmQucm93IGlzbnQgY3Vyc29yUG9zaXRpb24ucm93ICMgZG9uJ3QgbG9vayBiZXlvbmQgdGhlIGN1cnJlbnQgbGluZVxuICAgICAgcmV0dXJuIGlmIG51bUVuZC5jb2x1bW4gaXMgY3Vyc29yUG9zaXRpb24uY29sdW1uICMgbm8gbnVtYmVyIGFmdGVyIGN1cnNvclxuXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uIG51bUVuZFxuICAgIG51bVN0YXJ0ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih3b3JkUmVnZXg6IEBudW1iZXJSZWdleCwgYWxsb3dQcmV2aW91czogZmFsc2UpXG5cbiAgICByYW5nZSA9IG5ldyBSYW5nZShudW1TdGFydCwgbnVtRW5kKVxuXG4gICAgIyBwYXJzZSBudW1iZXIsIGluY3JlYXNlL2RlY3JlYXNlXG4gICAgbnVtYmVyID0gcGFyc2VJbnQoQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSksIDEwKVxuICAgIGlmIGlzTmFOKG51bWJlcilcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihjdXJzb3JQb3NpdGlvbilcbiAgICAgIHJldHVyblxuXG4gICAgbnVtYmVyICs9IEBzdGVwKmNvdW50XG5cbiAgICAjIHJlcGxhY2UgY3VycmVudCBudW1iZXIgd2l0aCBuZXdcbiAgICBuZXdWYWx1ZSA9IFN0cmluZyhudW1iZXIpXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgbmV3VmFsdWUsIG5vcm1hbGl6ZUxpbmVFbmRpbmdzOiBmYWxzZSlcblxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihyb3c6IG51bVN0YXJ0LnJvdywgY29sdW1uOiBudW1TdGFydC5jb2x1bW4tMStuZXdWYWx1ZS5sZW5ndGgpXG4gICAgcmV0dXJuIHRydWVcblxuY2xhc3MgRGVjcmVhc2UgZXh0ZW5kcyBJbmNyZWFzZVxuICBzdGVwOiAtMVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtJbmNyZWFzZSwgRGVjcmVhc2V9XG4iXX0=
