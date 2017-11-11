(function() {
  var AdjustIndentation, Autoindent, Indent, Operator, Outdent, _,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  Operator = require('./general-operators').Operator;

  AdjustIndentation = (function(superClass) {
    extend(AdjustIndentation, superClass);

    function AdjustIndentation() {
      return AdjustIndentation.__super__.constructor.apply(this, arguments);
    }

    AdjustIndentation.prototype.execute = function(count) {
      var i, len, mode, originalRanges, range;
      mode = this.vimState.mode;
      this.motion.select(count);
      originalRanges = this.editor.getSelectedBufferRanges();
      if (mode === 'visual') {
        this.editor.transact((function(_this) {
          return function() {
            return _.times(count != null ? count : 1, function() {
              return _this.indent();
            });
          };
        })(this));
      } else {
        this.indent();
      }
      this.editor.clearSelections();
      this.editor.getLastCursor().setBufferPosition([originalRanges.shift().start.row, 0]);
      for (i = 0, len = originalRanges.length; i < len; i++) {
        range = originalRanges[i];
        this.editor.addCursorAtBufferPosition([range.start.row, 0]);
      }
      this.editor.moveToFirstCharacterOfLine();
      return this.vimState.activateNormalMode();
    };

    return AdjustIndentation;

  })(Operator);

  Indent = (function(superClass) {
    extend(Indent, superClass);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.prototype.indent = function() {
      return this.editor.indentSelectedRows();
    };

    return Indent;

  })(AdjustIndentation);

  Outdent = (function(superClass) {
    extend(Outdent, superClass);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.prototype.indent = function() {
      return this.editor.outdentSelectedRows();
    };

    return Outdent;

  })(AdjustIndentation);

  Autoindent = (function(superClass) {
    extend(Autoindent, superClass);

    function Autoindent() {
      return Autoindent.__super__.constructor.apply(this, arguments);
    }

    Autoindent.prototype.indent = function() {
      return this.editor.autoIndentSelectedRows();
    };

    return Autoindent;

  })(AdjustIndentation);

  module.exports = {
    Indent: Indent,
    Outdent: Outdent,
    Autoindent: Autoindent
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbmRlbnQtb3BlcmF0b3JzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMkRBQUE7SUFBQTs7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSCxXQUFZLE9BQUEsQ0FBUSxxQkFBUjs7RUFFUDs7Ozs7OztnQ0FDSixPQUFBLEdBQVMsU0FBQyxLQUFEO0FBQ1AsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDO01BQ2pCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEtBQWY7TUFDQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBQTtNQUVqQixJQUFHLElBQUEsS0FBUSxRQUFYO1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQWlCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ2YsQ0FBQyxDQUFDLEtBQUYsaUJBQVEsUUFBUSxDQUFoQixFQUFtQixTQUFBO3FCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7WUFBSCxDQUFuQjtVQURlO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQixFQURGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFKRjs7TUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBQTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsaUJBQXhCLENBQTBDLENBQUMsY0FBYyxDQUFDLEtBQWYsQ0FBQSxDQUFzQixDQUFDLEtBQUssQ0FBQyxHQUE5QixFQUFtQyxDQUFuQyxDQUExQztBQUNBLFdBQUEsZ0RBQUE7O1FBQ0UsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixFQUFrQixDQUFsQixDQUFsQztBQURGO01BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBVixDQUFBO0lBaEJPOzs7O0tBRHFCOztFQW1CMUI7Ozs7Ozs7cUJBQ0osTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUE7SUFETTs7OztLQURXOztFQUlmOzs7Ozs7O3NCQUNKLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixDQUFBO0lBRE07Ozs7S0FEWTs7RUFJaEI7Ozs7Ozs7eUJBQ0osTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsTUFBTSxDQUFDLHNCQUFSLENBQUE7SUFETTs7OztLQURlOztFQUl6QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLFFBQUEsTUFBRDtJQUFTLFNBQUEsT0FBVDtJQUFrQixZQUFBLFVBQWxCOztBQWxDakIiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue09wZXJhdG9yfSA9IHJlcXVpcmUgJy4vZ2VuZXJhbC1vcGVyYXRvcnMnXG5cbmNsYXNzIEFkanVzdEluZGVudGF0aW9uIGV4dGVuZHMgT3BlcmF0b3JcbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgIG1vZGUgPSBAdmltU3RhdGUubW9kZVxuICAgIEBtb3Rpb24uc2VsZWN0KGNvdW50KVxuICAgIG9yaWdpbmFsUmFuZ2VzID0gQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG5cbiAgICBpZiBtb2RlIGlzICd2aXN1YWwnXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIF8udGltZXMoY291bnQgPyAxLCA9PiBAaW5kZW50KCkpXG4gICAgZWxzZVxuICAgICAgQGluZGVudCgpXG5cbiAgICBAZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc2V0QnVmZmVyUG9zaXRpb24oW29yaWdpbmFsUmFuZ2VzLnNoaWZ0KCkuc3RhcnQucm93LCAwXSlcbiAgICBmb3IgcmFuZ2UgaW4gb3JpZ2luYWxSYW5nZXNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihbcmFuZ2Uuc3RhcnQucm93LCAwXSlcbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcbiAgICBAdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuY2xhc3MgSW5kZW50IGV4dGVuZHMgQWRqdXN0SW5kZW50YXRpb25cbiAgaW5kZW50OiAtPlxuICAgIEBlZGl0b3IuaW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgT3V0ZGVudCBleHRlbmRzIEFkanVzdEluZGVudGF0aW9uXG4gIGluZGVudDogLT5cbiAgICBAZWRpdG9yLm91dGRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBBdXRvaW5kZW50IGV4dGVuZHMgQWRqdXN0SW5kZW50YXRpb25cbiAgaW5kZW50OiAtPlxuICAgIEBlZGl0b3IuYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG5cbm1vZHVsZS5leHBvcnRzID0ge0luZGVudCwgT3V0ZGVudCwgQXV0b2luZGVudH1cbiJdfQ==
