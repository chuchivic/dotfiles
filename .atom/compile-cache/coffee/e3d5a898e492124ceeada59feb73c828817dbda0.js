(function() {
  var Change, Delete, Insert, InsertAboveWithNewline, InsertAfter, InsertAfterEndOfLine, InsertAtBeginningOfLine, InsertBelowWithNewline, Motions, Operator, ReplaceMode, _, ref, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Motions = require('../motions/index');

  ref = require('./general-operators'), Operator = ref.Operator, Delete = ref.Delete;

  _ = require('underscore-plus');

  settings = require('../settings');

  Insert = (function(superClass) {
    extend(Insert, superClass);

    function Insert() {
      return Insert.__super__.constructor.apply(this, arguments);
    }

    Insert.prototype.standalone = true;

    Insert.prototype.isComplete = function() {
      return this.standalone || Insert.__super__.isComplete.apply(this, arguments);
    };

    Insert.prototype.confirmChanges = function(changes) {
      if (changes.length > 0) {
        return this.typedText = changes[0].newText;
      } else {
        return this.typedText = "";
      }
    };

    Insert.prototype.execute = function() {
      var cursor, i, len, ref1;
      if (this.typingCompleted) {
        if (!((this.typedText != null) && this.typedText.length > 0)) {
          return;
        }
        this.editor.insertText(this.typedText, {
          normalizeLineEndings: true,
          autoIndent: true
        });
        ref1 = this.editor.getCursors();
        for (i = 0, len = ref1.length; i < len; i++) {
          cursor = ref1[i];
          if (!cursor.isAtBeginningOfLine()) {
            cursor.moveLeft();
          }
        }
      } else {
        this.vimState.activateInsertMode();
        this.typingCompleted = true;
      }
    };

    Insert.prototype.inputOperator = function() {
      return true;
    };

    return Insert;

  })(Operator);

  ReplaceMode = (function(superClass) {
    extend(ReplaceMode, superClass);

    function ReplaceMode() {
      return ReplaceMode.__super__.constructor.apply(this, arguments);
    }

    ReplaceMode.prototype.execute = function() {
      if (this.typingCompleted) {
        if (!((this.typedText != null) && this.typedText.length > 0)) {
          return;
        }
        return this.editor.transact((function(_this) {
          return function() {
            var count, cursor, i, j, len, len1, ref1, ref2, results, selection, toDelete;
            _this.editor.insertText(_this.typedText, {
              normalizeLineEndings: true
            });
            toDelete = _this.typedText.length - _this.countChars('\n', _this.typedText);
            ref1 = _this.editor.getSelections();
            for (i = 0, len = ref1.length; i < len; i++) {
              selection = ref1[i];
              count = toDelete;
              while (count-- && !selection.cursor.isAtEndOfLine()) {
                selection["delete"]();
              }
            }
            ref2 = _this.editor.getCursors();
            results = [];
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              cursor = ref2[j];
              if (!cursor.isAtBeginningOfLine()) {
                results.push(cursor.moveLeft());
              } else {
                results.push(void 0);
              }
            }
            return results;
          };
        })(this));
      } else {
        this.vimState.activateReplaceMode();
        return this.typingCompleted = true;
      }
    };

    ReplaceMode.prototype.countChars = function(char, string) {
      return string.split(char).length - 1;
    };

    return ReplaceMode;

  })(Insert);

  InsertAfter = (function(superClass) {
    extend(InsertAfter, superClass);

    function InsertAfter() {
      return InsertAfter.__super__.constructor.apply(this, arguments);
    }

    InsertAfter.prototype.execute = function() {
      if (!this.editor.getLastCursor().isAtEndOfLine()) {
        this.editor.moveRight();
      }
      return InsertAfter.__super__.execute.apply(this, arguments);
    };

    return InsertAfter;

  })(Insert);

  InsertAfterEndOfLine = (function(superClass) {
    extend(InsertAfterEndOfLine, superClass);

    function InsertAfterEndOfLine() {
      return InsertAfterEndOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAfterEndOfLine.prototype.execute = function() {
      this.editor.moveToEndOfLine();
      return InsertAfterEndOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAfterEndOfLine;

  })(Insert);

  InsertAtBeginningOfLine = (function(superClass) {
    extend(InsertAtBeginningOfLine, superClass);

    function InsertAtBeginningOfLine() {
      return InsertAtBeginningOfLine.__super__.constructor.apply(this, arguments);
    }

    InsertAtBeginningOfLine.prototype.execute = function() {
      this.editor.moveToBeginningOfLine();
      this.editor.moveToFirstCharacterOfLine();
      return InsertAtBeginningOfLine.__super__.execute.apply(this, arguments);
    };

    return InsertAtBeginningOfLine;

  })(Insert);

  InsertAboveWithNewline = (function(superClass) {
    extend(InsertAboveWithNewline, superClass);

    function InsertAboveWithNewline() {
      return InsertAboveWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertAboveWithNewline.prototype.execute = function() {
      if (!this.typingCompleted) {
        this.vimState.setInsertionCheckpoint();
      }
      this.editor.insertNewlineAbove();
      this.editor.getLastCursor().skipLeadingWhitespace();
      if (this.typingCompleted) {
        this.typedText = this.typedText.trimLeft();
        return InsertAboveWithNewline.__super__.execute.apply(this, arguments);
      }
      this.vimState.activateInsertMode();
      return this.typingCompleted = true;
    };

    return InsertAboveWithNewline;

  })(Insert);

  InsertBelowWithNewline = (function(superClass) {
    extend(InsertBelowWithNewline, superClass);

    function InsertBelowWithNewline() {
      return InsertBelowWithNewline.__super__.constructor.apply(this, arguments);
    }

    InsertBelowWithNewline.prototype.execute = function() {
      if (!this.typingCompleted) {
        this.vimState.setInsertionCheckpoint();
      }
      this.editor.insertNewlineBelow();
      this.editor.getLastCursor().skipLeadingWhitespace();
      if (this.typingCompleted) {
        this.typedText = this.typedText.trimLeft();
        return InsertBelowWithNewline.__super__.execute.apply(this, arguments);
      }
      this.vimState.activateInsertMode();
      return this.typingCompleted = true;
    };

    return InsertBelowWithNewline;

  })(Insert);

  Change = (function(superClass) {
    extend(Change, superClass);

    Change.prototype.standalone = false;

    Change.prototype.register = null;

    function Change(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.register = settings.defaultRegister();
    }

    Change.prototype.execute = function(count) {
      var base, i, j, len, len1, ref1, ref2, selection;
      if (_.contains(this.motion.select(count, {
        excludeWhitespace: true
      }), true)) {
        if (!this.typingCompleted) {
          this.vimState.setInsertionCheckpoint();
        }
        this.setTextRegister(this.register, this.editor.getSelectedText());
        if ((typeof (base = this.motion).isLinewise === "function" ? base.isLinewise() : void 0) && !this.typingCompleted) {
          ref1 = this.editor.getSelections();
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            if (selection.getBufferRange().end.row === 0) {
              selection.deleteSelectedText();
            } else {
              selection.insertText("\n", {
                autoIndent: true
              });
            }
            selection.cursor.moveLeft();
          }
        } else {
          ref2 = this.editor.getSelections();
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            selection = ref2[j];
            selection.deleteSelectedText();
          }
        }
        if (this.typingCompleted) {
          return Change.__super__.execute.apply(this, arguments);
        }
        this.vimState.activateInsertMode();
        return this.typingCompleted = true;
      } else {
        return this.vimState.activateNormalMode();
      }
    };

    return Change;

  })(Insert);

  module.exports = {
    Insert: Insert,
    InsertAfter: InsertAfter,
    InsertAfterEndOfLine: InsertAfterEndOfLine,
    InsertAtBeginningOfLine: InsertAtBeginningOfLine,
    InsertAboveWithNewline: InsertAboveWithNewline,
    InsertBelowWithNewline: InsertBelowWithNewline,
    ReplaceMode: ReplaceMode,
    Change: Change
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL29wZXJhdG9ycy9pbnB1dC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9MQUFBO0lBQUE7OztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsa0JBQVI7O0VBQ1YsTUFBcUIsT0FBQSxDQUFRLHFCQUFSLENBQXJCLEVBQUMsdUJBQUQsRUFBVzs7RUFDWCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFNTDs7Ozs7OztxQkFDSixVQUFBLEdBQVk7O3FCQUVaLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZSx3Q0FBQSxTQUFBO0lBQWxCOztxQkFFWixjQUFBLEdBQWdCLFNBQUMsT0FBRDtNQUNkLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEI7ZUFDRSxJQUFDLENBQUEsU0FBRCxHQUFhLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUQxQjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBSGY7O0lBRGM7O3FCQU1oQixPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxlQUFKO1FBQ0UsSUFBQSxDQUFBLENBQWMsd0JBQUEsSUFBZ0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLEdBQW9CLENBQWxELENBQUE7QUFBQSxpQkFBQTs7UUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsSUFBQyxDQUFBLFNBQXBCLEVBQStCO1VBQUEsb0JBQUEsRUFBc0IsSUFBdEI7VUFBNEIsVUFBQSxFQUFZLElBQXhDO1NBQS9CO0FBQ0E7QUFBQSxhQUFBLHNDQUFBOztVQUNFLElBQUEsQ0FBeUIsTUFBTSxDQUFDLG1CQUFQLENBQUEsQ0FBekI7WUFBQSxNQUFNLENB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QUFSLENBQUEsQ0FBNUI7UUFDQSxpRUFBVSxDQUFDLHNCQUFSLElBQTBCLENBQUksSUFBQyxDQUFBLGVBQWxDO0FBQ0U7QUFBQSxlQUFBLHNDQUFBOztZQUNFLElBQUcsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEwQixDQUFDLEdBQUcsQ0FBQyxHQUEvQixLQUFzQyxDQUF6QztjQUNFLFNBQVMsQ0FBQyxrQkFBVixDQUFBLEVBREY7YUFBQSxNQUFBO2NBR0UsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsSUFBckIsRUFBMkI7Z0JBQUEsVUFBQSxFQUFZLElBQVo7ZUFBM0IsRUFIRjs7WUFJQSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQWpCLENBQUE7QUFMRixXQURGO1NBQUEsTUFBQTtBQVFFO0FBQUEsZUFBQSx3Q0FBQTs7WUFDRSxTQUFTLENBQUMsa0JBQVYsQ0FBQTtBQURGLFdBUkY7O1FBV0EsSUFBZ0IsSUFBQyxDQUFBLGVBQWpCO0FBQUEsaUJBQU8scUNBQUEsU0FBQSxFQUFQOztRQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBQTtlQUNBLElBQUMsQ0FBQSxlQUFELEdBQW1CLEtBcEJyQjtPQUFBLE1BQUE7ZUFzQkUsSUFBQyxDQUFBLFFBQVEsQ0FBQyxrQkFBVixDQUFBLEVBdEJGOztJQURPOzs7O0tBWlU7O0VBc0NyQixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLFFBQUEsTUFEZTtJQUVmLGFBQUEsV0FGZTtJQUdmLHNCQUFBLG9CQUhlO0lBSWYseUJBQUEsdUJBSmU7SUFLZix3QkFBQSxzQkFMZTtJQU1mLHdCQUFBLHNCQU5lO0lBT2YsYUFBQSxXQVBlO0lBUWYsUUFBQSxNQVJlOztBQTVJakIiLCJzb3VyY2VzQ29udGVudCI6WyJNb3Rpb25zID0gcmVxdWlyZSAnLi4vbW90aW9ucy9pbmRleCdcbntPcGVyYXRvciwgRGVsZXRlfSA9IHJlcXVpcmUgJy4vZ2VuZXJhbC1vcGVyYXRvcnMnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcblxuIyBUaGUgb3BlcmF0aW9uIGZvciB0ZXh0IGVudGVyZWQgaW4gaW5wdXQgbW9kZS4gQnJvYWRseSBzcGVha2luZywgaW5wdXRcbiMgb3BlcmF0b3JzIG1hbmFnZSBhbiB1bmRvIHRyYW5zYWN0aW9uIGFuZCBzZXQgYSBAdHlwaW5nQ29tcGxldGVkIHZhcmlhYmxlIHdoZW5cbiMgaXQncyBkb25lLiBXaGVuIHRoZSBpbnB1dCBvcGVyYXRpb24gaXMgY29tcGxldGVkLCB0aGUgdHlwaW5nQ29tcGxldGVkIHZhcmlhYmxlXG4jIHRlbGxzIHRoZSBvcGVyYXRpb24gdG8gcmVwZWF0IGl0c2VsZiBpbnN0ZWFkIG9mIGVudGVyIGluc2VydCBtb2RlLlxuY2xhc3MgSW5zZXJ0IGV4dGVuZHMgT3BlcmF0b3JcbiAgc3RhbmRhbG9uZTogdHJ1ZVxuXG4gIGlzQ29tcGxldGU6IC0+IEBzdGFuZGFsb25lIG9yIHN1cGVyXG5cbiAgY29uZmlybUNoYW5nZXM6IChjaGFuZ2VzKSAtPlxuICAgIGlmIGNoYW5nZXMubGVuZ3RoID4gMFxuICAgICAgQHR5cGVkVGV4dCA9IGNoYW5nZXNbMF0ubmV3VGV4dFxuICAgIGVsc2VcbiAgICAgIEB0eXBlZFRleHQgPSBcIlwiXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBpZiBAdHlwaW5nQ29tcGxldGVkXG4gICAgICByZXR1cm4gdW5sZXNzIEB0eXBlZFRleHQ/IGFuZCBAdHlwZWRUZXh0Lmxlbmd0aCA+IDBcbiAgICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChAdHlwZWRUZXh0LCBub3JtYWxpemVMaW5lRW5kaW5nczogdHJ1ZSwgYXV0b0luZGVudDogdHJ1ZSlcbiAgICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgICAgY3Vyc29yLm1vdmVMZWZ0KCkgdW5sZXNzIGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICBlbHNlXG4gICAgICBAdmltU3RhdGUuYWN0aXZhdGVJbnNlcnRNb2RlKClcbiAgICAgIEB0eXBpbmdDb21wbGV0ZWQgPSB0cnVlXG4gICAgcmV0dXJuXG5cbiAgaW5wdXRPcGVyYXRvcjogLT4gdHJ1ZVxuXG5jbGFzcyBSZXBsYWNlTW9kZSBleHRlbmRzIEluc2VydFxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgaWYgQHR5cGluZ0NvbXBsZXRlZFxuICAgICAgcmV0dXJuIHVubGVzcyBAdHlwZWRUZXh0PyBhbmQgQHR5cGVkVGV4dC5sZW5ndGggPiAwXG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChAdHlwZWRUZXh0LCBub3JtYWxpemVMaW5lRW5kaW5nczogdHJ1ZSlcbiAgICAgICAgdG9EZWxldGUgPSBAdHlwZWRUZXh0Lmxlbmd0aCAtIEBjb3VudENoYXJzKCdcXG4nLCBAdHlwZWRUZXh0KVxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgY291bnQgPSB0b0RlbGV0ZVxuICAgICAgICAgIHNlbGVjdGlvbi5kZWxldGUoKSB3aGlsZSBjb3VudC0tIGFuZCBub3Qgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICAgIGN1cnNvci5tb3ZlTGVmdCgpIHVubGVzcyBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgZWxzZVxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlUmVwbGFjZU1vZGUoKVxuICAgICAgQHR5cGluZ0NvbXBsZXRlZCA9IHRydWVcblxuICBjb3VudENoYXJzOiAoY2hhciwgc3RyaW5nKSAtPlxuICAgIHN0cmluZy5zcGxpdChjaGFyKS5sZW5ndGggLSAxXG5cbmNsYXNzIEluc2VydEFmdGVyIGV4dGVuZHMgSW5zZXJ0XG4gIGV4ZWN1dGU6IC0+XG4gICAgQGVkaXRvci5tb3ZlUmlnaHQoKSB1bmxlc3MgQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuaXNBdEVuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUgZXh0ZW5kcyBJbnNlcnRcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUgZXh0ZW5kcyBJbnNlcnRcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgQGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG4gICAgc3VwZXJcblxuY2xhc3MgSW5zZXJ0QWJvdmVXaXRoTmV3bGluZSBleHRlbmRzIEluc2VydFxuICBleGVjdXRlOiAtPlxuICAgIEB2aW1TdGF0ZS5zZXRJbnNlcnRpb25DaGVja3BvaW50KCkgdW5sZXNzIEB0eXBpbmdDb21wbGV0ZWRcbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVBYm92ZSgpXG4gICAgQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc2tpcExlYWRpbmdXaGl0ZXNwYWNlKClcblxuICAgIGlmIEB0eXBpbmdDb21wbGV0ZWRcbiAgICAgICMgV2UnbGwgaGF2ZSBjYXB0dXJlZCB0aGUgaW5zZXJ0ZWQgbmV3bGluZSwgYnV0IHdlIHdhbnQgdG8gZG8gdGhhdFxuICAgICAgIyBvdmVyIGFnYWluIGJ5IGhhbmQsIG9yIGRpZmZlcmluZyBpbmRlbnRhdGlvbnMgd2lsbCBiZSB3cm9uZy5cbiAgICAgIEB0eXBlZFRleHQgPSBAdHlwZWRUZXh0LnRyaW1MZWZ0KClcbiAgICAgIHJldHVybiBzdXBlclxuXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlSW5zZXJ0TW9kZSgpXG4gICAgQHR5cGluZ0NvbXBsZXRlZCA9IHRydWVcblxuY2xhc3MgSW5zZXJ0QmVsb3dXaXRoTmV3bGluZSBleHRlbmRzIEluc2VydFxuICBleGVjdXRlOiAtPlxuICAgIEB2aW1TdGF0ZS5zZXRJbnNlcnRpb25DaGVja3BvaW50KCkgdW5sZXNzIEB0eXBpbmdDb21wbGV0ZWRcbiAgICBAZWRpdG9yLmluc2VydE5ld2xpbmVCZWxvdygpXG4gICAgQGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc2tpcExlYWRpbmdXaGl0ZXNwYWNlKClcblxuICAgIGlmIEB0eXBpbmdDb21wbGV0ZWRcbiAgICAgICMgV2UnbGwgaGF2ZSBjYXB0dXJlZCB0aGUgaW5zZXJ0ZWQgbmV3bGluZSwgYnV0IHdlIHdhbnQgdG8gZG8gdGhhdFxuICAgICAgIyBvdmVyIGFnYWluIGJ5IGhhbmQsIG9yIGRpZmZlcmluZyBpbmRlbnRhdGlvbnMgd2lsbCBiZSB3cm9uZy5cbiAgICAgIEB0eXBlZFRleHQgPSBAdHlwZWRUZXh0LnRyaW1MZWZ0KClcbiAgICAgIHJldHVybiBzdXBlclxuXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlSW5zZXJ0TW9kZSgpXG4gICAgQHR5cGluZ0NvbXBsZXRlZCA9IHRydWVcblxuI1xuIyBEZWxldGUgdGhlIGZvbGxvd2luZyBtb3Rpb24gYW5kIGVudGVyIGluc2VydCBtb2RlIHRvIHJlcGxhY2UgaXQuXG4jXG5jbGFzcyBDaGFuZ2UgZXh0ZW5kcyBJbnNlcnRcbiAgc3RhbmRhbG9uZTogZmFsc2VcbiAgcmVnaXN0ZXI6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSkgLT5cbiAgICBAcmVnaXN0ZXIgPSBzZXR0aW5ncy5kZWZhdWx0UmVnaXN0ZXIoKVxuXG4gICMgUHVibGljOiBDaGFuZ2VzIHRoZSB0ZXh0IHNlbGVjdGVkIGJ5IHRoZSBnaXZlbiBtb3Rpb24uXG4gICNcbiAgIyBjb3VudCAtIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gZXhlY3V0ZS5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgIGlmIF8uY29udGFpbnMoQG1vdGlvbi5zZWxlY3QoY291bnQsIGV4Y2x1ZGVXaGl0ZXNwYWNlOiB0cnVlKSwgdHJ1ZSlcbiAgICAgICMgSWYgd2UndmUgdHlwZWQsIHdlJ3JlIGJlaW5nIHJlcGVhdGVkLiBJZiB3ZSdyZSBiZWluZyByZXBlYXRlZCxcbiAgICAgICMgdW5kbyB0cmFuc2FjdGlvbnMgYXJlIGFscmVhZHkgaGFuZGxlZC5cbiAgICAgIEB2aW1TdGF0ZS5zZXRJbnNlcnRpb25DaGVja3BvaW50KCkgdW5sZXNzIEB0eXBpbmdDb21wbGV0ZWRcblxuICAgICAgQHNldFRleHRSZWdpc3RlcihAcmVnaXN0ZXIsIEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpXG4gICAgICBpZiBAbW90aW9uLmlzTGluZXdpc2U/KCkgYW5kIG5vdCBAdHlwaW5nQ29tcGxldGVkXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBpZiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmQucm93IGlzIDBcbiAgICAgICAgICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KFwiXFxuXCIsIGF1dG9JbmRlbnQ6IHRydWUpXG4gICAgICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBlbHNlXG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcblxuICAgICAgcmV0dXJuIHN1cGVyIGlmIEB0eXBpbmdDb21wbGV0ZWRcblxuICAgICAgQHZpbVN0YXRlLmFjdGl2YXRlSW5zZXJ0TW9kZSgpXG4gICAgICBAdHlwaW5nQ29tcGxldGVkID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEB2aW1TdGF0ZS5hY3RpdmF0ZU5vcm1hbE1vZGUoKVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBJbnNlcnQsXG4gIEluc2VydEFmdGVyLFxuICBJbnNlcnRBZnRlckVuZE9mTGluZSxcbiAgSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUsXG4gIEluc2VydEFib3ZlV2l0aE5ld2xpbmUsXG4gIEluc2VydEJlbG93V2l0aE5ld2xpbmUsXG4gIFJlcGxhY2VNb2RlLFxuICBDaGFuZ2Vcbn1cbiJdfQ==
