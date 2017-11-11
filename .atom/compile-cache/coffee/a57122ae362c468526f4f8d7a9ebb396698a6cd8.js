(function() {
  var OperatorWithInput, Range, Replace, ViewModel, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  OperatorWithInput = require('./general-operators').OperatorWithInput;

  ViewModel = require('../view-models/view-model').ViewModel;

  Range = require('atom').Range;

  module.exports = Replace = (function(superClass) {
    extend(Replace, superClass);

    function Replace(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      Replace.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new ViewModel(this, {
        "class": 'replace',
        hidden: true,
        singleChar: true,
        defaultText: '\n'
      });
    }

    Replace.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.input.characters === "") {
        if (this.vimState.mode === "visual") {
          this.vimState.resetVisualMode();
        } else {
          this.vimState.activateNormalMode();
        }
        return;
      }
      this.editor.transact((function(_this) {
        return function() {
          var currentRowLength, cursor, i, j, len, len1, point, pos, ref, ref1, results, selection;
          if (_this.motion != null) {
            if (_.contains(_this.motion.select(), true)) {
              _this.editor.replaceSelectedText(null, function(text) {
                return text.replace(/./g, _this.input.characters);
              });
              ref = _this.editor.getSelections();
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                selection = ref[i];
                point = selection.getBufferRange().start;
                results.push(selection.setBufferRange(Range.fromPointWithDelta(point, 0, 0)));
              }
              return results;
            }
          } else {
            ref1 = _this.editor.getCursors();
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              cursor = ref1[j];
              pos = cursor.getBufferPosition();
              currentRowLength = _this.editor.lineTextForBufferRow(pos.row).length;
              if (!(currentRowLength - pos.column >= count)) {
                continue;
              }
              _.times(count, function() {
                point = cursor.getBufferPosition();
                _this.editor.setTextInBufferRange(Range.fromPointWithDelta(point, 0, 1), _this.input.characters);
                return cursor.moveRight();
              });
              cursor.setBufferPosition(pos);
            }
            if (_this.input.characters === "\n") {
              _.times(count, function() {
                return _this.editor.moveDown();
              });
              return _this.editor.moveToFirstCharacterOfLine();
            }
          }
        };
      })(this));
      return this.vimState.activateNormalMode();
    };

    return Replace;

  })(OperatorWithInput);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9yZXBsYWNlLW9wZXJhdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0NBQUE7SUFBQTs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxvQkFBcUIsT0FBQSxDQUFRLHFCQUFSOztFQUNyQixZQUFhLE9BQUEsQ0FBUSwyQkFBUjs7RUFDYixRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNTLGlCQUFDLE1BQUQsRUFBVSxRQUFWO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsV0FBRDtNQUNyQix5Q0FBTSxJQUFDLENBQUEsTUFBUCxFQUFlLElBQUMsQ0FBQSxRQUFoQjtNQUNBLElBQUMsQ0FBQSxTQUFELEdBQWlCLElBQUEsU0FBQSxDQUFVLElBQVYsRUFBZ0I7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7UUFBa0IsTUFBQSxFQUFRLElBQTFCO1FBQWdDLFVBQUEsRUFBWSxJQUE1QztRQUFrRCxXQUFBLEVBQWEsSUFBL0Q7T0FBaEI7SUFGTjs7c0JBSWIsT0FBQSxHQUFTLFNBQUMsS0FBRDs7UUFBQyxRQUFNOztNQUNkLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLEtBQXFCLEVBQXhCO1FBR0UsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsS0FBa0IsUUFBckI7VUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLGVBQVYsQ0FBQSxFQURGO1NBQUEsTUFBQTtVQUdFLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBQSxFQUhGOztBQUtBLGVBUkY7O01BVUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUNmLGNBQUE7VUFBQSxJQUFHLG9CQUFIO1lBQ0UsSUFBRyxDQUFDLENBQUMsUUFBRixDQUFXLEtBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBLENBQVgsRUFBNkIsSUFBN0IsQ0FBSDtjQUNFLEtBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsQ0FBNEIsSUFBNUIsRUFBa0MsU0FBQyxJQUFEO3VCQUNoQyxJQUFJLENBQUMsT0FBTCxDQUFhLElBQWIsRUFBbUIsS0FBQyxDQUFBLEtBQUssQ0FBQyxVQUExQjtjQURnQyxDQUFsQztBQUVBO0FBQUE7bUJBQUEscUNBQUE7O2dCQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsY0FBVixDQUFBLENBQTBCLENBQUM7NkJBQ25DLFNBQVMsQ0FBQyxjQUFWLENBQXlCLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFuQyxDQUF6QjtBQUZGOzZCQUhGO2FBREY7V0FBQSxNQUFBO0FBUUU7QUFBQSxpQkFBQSx3Q0FBQTs7Y0FDRSxHQUFBLEdBQU0sTUFBTSxDQUFDLGlCQUFQLENBQUE7Y0FDTixnQkFBQSxHQUFtQixLQUFDLENBQUEsTUFBTSxDQUFDLG9CQUFSLENBQTZCLEdBQUcsQ0FBQyxHQUFqQyxDQUFxQyxDQUFDO2NBQ3pELElBQUEsQ0FBQSxDQUFnQixnQkFBQSxHQUFtQixHQUFHLENBQUMsTUFBdkIsSUFBaUMsS0FBakQsQ0FBQTtBQUFBLHlCQUFBOztjQUVBLENBQUMsQ0FBQyxLQUFGLENBQVEsS0FBUixFQUFlLFNBQUE7Z0JBQ2IsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO2dCQUNSLEtBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsS0FBSyxDQUFDLGtCQUFOLENBQXlCLEtBQXpCLEVBQWdDLENBQWhDLEVBQW1DLENBQW5DLENBQTdCLEVBQW9FLEtBQUMsQ0FBQSxLQUFLLENBQUMsVUFBM0U7dUJBQ0EsTUFBTSxDQUFDLFNBQVAsQ0FBQTtjQUhhLENBQWY7Y0FJQSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsR0FBekI7QUFURjtZQWFBLElBQUcsS0FBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLEtBQXFCLElBQXhCO2NBQ0UsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFSLEVBQWUsU0FBQTt1QkFDYixLQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBQTtjQURhLENBQWY7cUJBRUEsS0FBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFBLEVBSEY7YUFyQkY7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO2FBMkJBLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBQTtJQXRDTzs7OztLQUxXO0FBTnRCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntPcGVyYXRvcldpdGhJbnB1dH0gPSByZXF1aXJlICcuL2dlbmVyYWwtb3BlcmF0b3JzJ1xue1ZpZXdNb2RlbH0gPSByZXF1aXJlICcuLi92aWV3LW1vZGVscy92aWV3LW1vZGVsJ1xue1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBPcGVyYXRvcldpdGhJbnB1dFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSkgLT5cbiAgICBzdXBlcihAZWRpdG9yLCBAdmltU3RhdGUpXG4gICAgQHZpZXdNb2RlbCA9IG5ldyBWaWV3TW9kZWwodGhpcywgY2xhc3M6ICdyZXBsYWNlJywgaGlkZGVuOiB0cnVlLCBzaW5nbGVDaGFyOiB0cnVlLCBkZWZhdWx0VGV4dDogJ1xcbicpXG5cbiAgZXhlY3V0ZTogKGNvdW50PTEpIC0+XG4gICAgaWYgQGlucHV0LmNoYXJhY3RlcnMgaXMgXCJcIlxuICAgICAgIyByZXBsYWNlIGNhbmNlbGVkXG5cbiAgICAgIGlmIEB2aW1TdGF0ZS5tb2RlIGlzIFwidmlzdWFsXCJcbiAgICAgICAgQHZpbVN0YXRlLnJlc2V0VmlzdWFsTW9kZSgpXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZU5vcm1hbE1vZGUoKVxuXG4gICAgICByZXR1cm5cblxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGlmIEBtb3Rpb24/XG4gICAgICAgIGlmIF8uY29udGFpbnMoQG1vdGlvbi5zZWxlY3QoKSwgdHJ1ZSlcbiAgICAgICAgICBAZWRpdG9yLnJlcGxhY2VTZWxlY3RlZFRleHQgbnVsbCwgKHRleHQpID0+XG4gICAgICAgICAgICB0ZXh0LnJlcGxhY2UoLy4vZywgQGlucHV0LmNoYXJhY3RlcnMpXG4gICAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgICAgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgICAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgMCkpXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgICAgICBwb3MgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgIGN1cnJlbnRSb3dMZW5ndGggPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvcy5yb3cpLmxlbmd0aFxuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBjdXJyZW50Um93TGVuZ3RoIC0gcG9zLmNvbHVtbiA+PSBjb3VudFxuXG4gICAgICAgICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgICAgICAgIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAxKSwgQGlucHV0LmNoYXJhY3RlcnMpXG4gICAgICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICAgICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zKVxuXG4gICAgICAgICMgU3BlY2lhbCBjYXNlOiB3aGVuIHJlcGxhY2VkIHdpdGggYSBuZXdsaW5lIG1vdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZVxuICAgICAgICAjIG5leHQgcm93LlxuICAgICAgICBpZiBAaW5wdXQuY2hhcmFjdGVycyBpcyBcIlxcblwiXG4gICAgICAgICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgICAgICAgIEBlZGl0b3IubW92ZURvd24oKVxuICAgICAgICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlTm9ybWFsTW9kZSgpXG4iXX0=
