(function() {
  var EditLine, LineMeta, MAX_SKIP_EMPTY_LINE_ALLOWED, config;

  config = require("../config");

  LineMeta = require("../helpers/line-meta");

  MAX_SKIP_EMPTY_LINE_ALLOWED = 5;

  module.exports = EditLine = (function() {
    function EditLine(action) {
      this.action = action;
      this.editor = atom.workspace.getActiveTextEditor();
    }

    EditLine.prototype.trigger = function(e) {
      var fn;
      fn = this.action.replace(/-[a-z]/ig, function(s) {
        return s[1].toUpperCase();
      });
      return this.editor.transact((function(_this) {
        return function() {
          return _this.editor.getSelections().forEach(function(selection) {
            return _this[fn](e, selection);
          });
        };
      })(this));
    };

    EditLine.prototype.insertNewLine = function(e, selection) {
      var cursor, line, lineMeta;
      if (this._isRangeSelection(selection)) {
        return e.abortKeyBinding();
      }
      cursor = selection.getHeadBufferPosition();
      line = this.editor.lineTextForBufferRow(cursor.row);
      if (cursor.column < line.length && !config.get("inlineNewLineContinuation")) {
        return e.abortKeyBinding();
      }
      lineMeta = new LineMeta(line);
      if (lineMeta.isContinuous()) {
        if (lineMeta.isEmptyBody()) {
          return this._insertNewlineWithoutContinuation(cursor);
        } else {
          return this._insertNewlineWithContinuation(lineMeta.nextLine);
        }
      } else {
        return e.abortKeyBinding();
      }
    };

    EditLine.prototype._insertNewlineWithContinuation = function(nextLine) {
      return this.editor.insertText("\n" + nextLine);
    };

    EditLine.prototype._insertNewlineWithoutContinuation = function(cursor) {
      var currentIndentation, emptyLineSkipped, i, indentation, line, nextLine, ref, row;
      nextLine = "\n";
      currentIndentation = this.editor.indentationForBufferRow(cursor.row);
      if (currentIndentation > 0 && cursor.row > 1) {
        emptyLineSkipped = 0;
        for (row = i = ref = cursor.row - 1; ref <= 0 ? i <= 0 : i >= 0; row = ref <= 0 ? ++i : --i) {
          line = this.editor.lineTextForBufferRow(row);
          if (line.trim() === "") {
            if (emptyLineSkipped > MAX_SKIP_EMPTY_LINE_ALLOWED) {
              break;
            }
            emptyLineSkipped += 1;
          } else {
            indentation = this.editor.indentationForBufferRow(row);
            if (indentation >= currentIndentation) {
              continue;
            }
            if (indentation === currentIndentation - 1 && LineMeta.isList(line)) {
              nextLine = new LineMeta(line).nextLine;
            }
            break;
          }
        }
      }
      this.editor.selectToBeginningOfLine();
      return this.editor.insertText(nextLine);
    };

    EditLine.prototype.indentListLine = function(e, selection) {
      var cursor, line;
      if (this._isRangeSelection(selection)) {
        return e.abortKeyBinding();
      }
      cursor = selection.getHeadBufferPosition();
      line = this.editor.lineTextForBufferRow(cursor.row);
      if (LineMeta.isList(line)) {
        return selection.indentSelectedRows();
      } else if (this._isAtLineBeginning(line, cursor.column)) {
        return selection.indent();
      } else {
        return e.abortKeyBinding();
      }
    };

    EditLine.prototype._isAtLineBeginning = function(line, col) {
      return col === 0 || line.substring(0, col).trim() === "";
    };

    EditLine.prototype._isRangeSelection = function(selection) {
      var head, tail;
      head = selection.getHeadBufferPosition();
      tail = selection.getTailBufferPosition();
      return head.row !== tail.row || head.column !== tail.column;
    };

    return EditLine;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9lZGl0LWxpbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxzQkFBUjs7RUFFWCwyQkFBQSxHQUE4Qjs7RUFFOUIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUVTLGtCQUFDLE1BQUQ7TUFDWCxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7SUFGQzs7dUJBSWIsT0FBQSxHQUFTLFNBQUMsQ0FBRDtBQUNQLFVBQUE7TUFBQSxFQUFBLEdBQUssSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQWdCLFVBQWhCLEVBQTRCLFNBQUMsQ0FBRDtlQUFPLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFMLENBQUE7TUFBUCxDQUE1QjthQUVMLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ2YsS0FBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxTQUFDLFNBQUQ7bUJBQzlCLEtBQUUsQ0FBQSxFQUFBLENBQUYsQ0FBTSxDQUFOLEVBQVMsU0FBVDtVQUQ4QixDQUFoQztRQURlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtJQUhPOzt1QkFPVCxhQUFBLEdBQWUsU0FBQyxDQUFELEVBQUksU0FBSjtBQUNiLFVBQUE7TUFBQSxJQUE4QixJQUFDLENBQUEsaUJBQUQsQ0FBbUIsU0FBbkIsQ0FBOUI7QUFBQSxlQUFPLENBQUMsQ0FBQyxlQUFGLENBQUEsRUFBUDs7TUFFQSxNQUFBLEdB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U0FBTCxDQUFlLENBQWYsRUFBa0IsR0FBbEIsQ0FBc0IsQ0FBQyxJQUF2QixDQUFBLENBQUEsS0FBaUM7SUFEM0I7O3VCQUdwQixpQkFBQSxHQUFtQixTQUFDLFNBQUQ7QUFDakIsVUFBQTtNQUFBLElBQUEsR0FBTyxTQUFTLENBQUMscUJBQVYsQ0FBQTtNQUNQLElBQUEsR0FBTyxTQUFTLENBQUMscUJBQVYsQ0FBQTthQUVQLElBQUksQ0FBQyxHQUFMLEtBQVksSUFBSSxDQUFDLEdBQWpCLElBQXdCLElBQUksQ0FBQyxNQUFMLEtBQWUsSUFBSSxDQUFDO0lBSjNCOzs7OztBQWxGckIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbkxpbmVNZXRhID0gcmVxdWlyZSBcIi4uL2hlbHBlcnMvbGluZS1tZXRhXCJcblxuTUFYX1NLSVBfRU1QVFlfTElORV9BTExPV0VEID0gNVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBFZGl0TGluZVxuICAjIGFjdGlvbjogaW5zZXJ0LW5ldy1saW5lLCBpbmRlbnQtbGlzdC1saW5lXG4gIGNvbnN0cnVjdG9yOiAoYWN0aW9uKSAtPlxuICAgIEBhY3Rpb24gPSBhY3Rpb25cbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgdHJpZ2dlcjogKGUpIC0+XG4gICAgZm4gPSBAYWN0aW9uLnJlcGxhY2UgLy1bYS16XS9pZywgKHMpIC0+IHNbMV0udG9VcHBlckNhc2UoKVxuXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBAW2ZuXShlLCBzZWxlY3Rpb24pXG5cbiAgaW5zZXJ0TmV3TGluZTogKGUsIHNlbGVjdGlvbikgLT5cbiAgICByZXR1cm4gZS5hYm9ydEtleUJpbmRpbmcoKSBpZiBAX2lzUmFuZ2VTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgY3Vyc29yID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcblxuICAgICMgd2hlbiBjdXJzb3IgaXMgYXQgbWlkZGxlIG9mIGxpbmUsIGRvIGEgbm9ybWFsIGluc2VydCBsaW5lXG4gICAgIyB1bmxlc3MgaW5saW5lIGNvbnRpbnVhdGlvbiBpcyBlbmFibGVkXG4gICAgaWYgY3Vyc29yLmNvbHVtbiA8IGxpbmUubGVuZ3RoICYmICFjb25maWcuZ2V0KFwiaW5saW5lTmV3TGluZUNvbnRpbnVhdGlvblwiKVxuICAgICAgcmV0dXJuIGUuYWJvcnRLZXlCaW5kaW5nKClcblxuICAgIGxpbmVNZXRhID0gbmV3IExpbmVNZXRhKGxpbmUpXG4gICAgaWYgbGluZU1ldGEuaXNDb250aW51b3VzKClcbiAgICAgIGlmIGxpbmVNZXRhLmlzRW1wdHlCb2R5KClcbiAgICAgICAgQF9pbnNlcnROZXdsaW5lV2l0aG91dENvbnRpbnVhdGlvbihjdXJzb3IpXG4gICAgICBlbHNlXG4gICAgICAgIEBfaW5zZXJ0TmV3bGluZVdpdGhDb250aW51YXRpb24obGluZU1ldGEubmV4dExpbmUpXG4gICAgZWxzZVxuICAgICAgZS5hYm9ydEtleUJpbmRpbmcoKVxuXG4gIF9pbnNlcnROZXdsaW5lV2l0aENvbnRpbnVhdGlvbjogKG5leHRMaW5lKSAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcbiN7bmV4dExpbmV9XCIpXG5cbiAgX2luc2VydE5ld2xpbmVXaXRob3V0Q29udGludWF0aW9uOiAoY3Vyc29yKSAtPlxuICAgIG5leHRMaW5lID0gXCJcXG5cIlxuICAgIGN1cnJlbnRJbmRlbnRhdGlvbiA9IEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcblxuICAgICMgaWYgaXQgaXMgYW4gaW5kZW50ZWQgZW1wdHkgbGlzdCwgd2Ugd2lsbCBnbyB1cCBsaW5lcyBhbmQgdHJ5IHRvIGZpbmRcbiAgICAjIGl0cyBwYXJlbnQncyBsaXN0IHByZWZpeCBhbmQgdXNlIHRoYXQgaWYgcG9zc2libGVcbiAgICBpZiBjdXJyZW50SW5kZW50YXRpb24gPiAwICYmIGN1cnNvci5yb3cgPiAxXG4gICAgICBlbXB0eUxpbmVTa2lwcGVkID0gMFxuXG4gICAgICBmb3Igcm93IGluIFsoY3Vyc29yLnJvdyAtIDEpLi4wXVxuICAgICAgICBsaW5lID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpXG5cbiAgICAgICAgaWYgbGluZS50cmltKCkgPT0gXCJcIiAjIHNraXAgZW1wdHkgbGluZXMgaW4gY2FzZSBvZiBsaXN0IHBhcmFncmFwaHNcbiAgICAgICAgICBicmVhayBpZiBlbXB0eUxpbmVTa2lwcGVkID4gTUFYX1NLSVBfRU1QVFlfTElORV9BTExPV0VEXG4gICAgICAgICAgZW1wdHlMaW5lU2tpcHBlZCArPSAxXG4gICAgICAgIGVsc2UgIyBmaW5kIHBhcmVudCB3aXRoIGluZGVudGF0aW9uID0gY3VycmVudCBpbmRlbnRhdGlvbiAtIDFcbiAgICAgICAgICBpbmRlbnRhdGlvbiA9IEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KVxuICAgICAgICAgIGNvbnRpbnVlIGlmIGluZGVudGF0aW9uID49IGN1cnJlbnRJbmRlbnRhdGlvblxuICAgICAgICAgIG5leHRMaW5lID0gbmV3IExpbmVNZXRhKGxpbmUpLm5leHRMaW5lIGlmIGluZGVudGF0aW9uID09IGN1cnJlbnRJbmRlbnRhdGlvbiAtIDEgJiYgTGluZU1ldGEuaXNMaXN0KGxpbmUpXG4gICAgICAgICAgYnJlYWtcblxuICAgIEBlZGl0b3Iuc2VsZWN0VG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChuZXh0TGluZSlcblxuICBpbmRlbnRMaXN0TGluZTogKGUsIHNlbGVjdGlvbikgLT5cbiAgICByZXR1cm4gZS5hYm9ydEtleUJpbmRpbmcoKSBpZiBAX2lzUmFuZ2VTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgY3Vyc29yID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcblxuICAgIGlmIExpbmVNZXRhLmlzTGlzdChsaW5lKVxuICAgICAgc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG4gICAgZWxzZSBpZiBAX2lzQXRMaW5lQmVnaW5uaW5nKGxpbmUsIGN1cnNvci5jb2x1bW4pICMgaW5kZW50IG9uIHN0YXJ0IG9mIGxpbmVcbiAgICAgIHNlbGVjdGlvbi5pbmRlbnQoKVxuICAgIGVsc2VcbiAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKClcblxuICBfaXNBdExpbmVCZWdpbm5pbmc6IChsaW5lLCBjb2wpIC0+XG4gICAgY29sID09IDAgfHwgbGluZS5zdWJzdHJpbmcoMCwgY29sKS50cmltKCkgPT0gXCJcIlxuXG4gIF9pc1JhbmdlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGhlYWQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0YWlsID0gc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBoZWFkLnJvdyAhPSB0YWlsLnJvdyB8fCBoZWFkLmNvbHVtbiAhPSB0YWlsLmNvbHVtblxuIl19
