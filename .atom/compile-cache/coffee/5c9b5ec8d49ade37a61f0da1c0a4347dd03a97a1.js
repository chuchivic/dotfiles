(function() {
  var EditLine, LineMeta, MAX_SKIP_EMPTY_LINE_ALLOWED, config, utils;

  config = require("../config");

  utils = require("../utils");

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
      var columnWidths, cursor, line, lineMeta, row;
      if (this._isRangeSelection(selection)) {
        return e.abortKeyBinding();
      }
      cursor = selection.getHeadBufferPosition();
      line = this.editor.lineTextForBufferRow(cursor.row);
      lineMeta = new LineMeta(line);
      if (lineMeta.isContinuous()) {
        if (cursor.column < line.length && !config.get("inlineNewLineContinuation")) {
          return e.abortKeyBinding();
        }
        if (lineMeta.isEmptyBody()) {
          this._insertNewlineWithoutContinuation(cursor);
        } else {
          this._insertNewlineWithContinuation(lineMeta);
        }
        return;
      }
      if (this._isTableRow(cursor, line)) {
        row = utils.parseTableRow(line);
        columnWidths = row.columnWidths.reduce(function(sum, i) {
          return sum + i;
        });
        if (columnWidths === 0) {
          this._insertNewlineWithoutTableColumns();
        } else {
          this._insertNewlineWithTableColumns(row);
        }
        return;
      }
      return e.abortKeyBinding();
    };

    EditLine.prototype._insertNewlineWithContinuation = function(lineMeta) {
      var nextLine;
      nextLine = lineMeta.nextLine;
      if (lineMeta.isList("ol") && !config.get("orderedNewLineNumberContinuation")) {
        nextLine = lineMeta.lineHead(lineMeta.defaultHead);
      }
      return this.editor.insertText("\n" + nextLine);
    };

    EditLine.prototype._insertNewlineWithoutContinuation = function(cursor) {
      var currentIndentation, emptyLineSkipped, indentation, j, line, nextLine, ref, row;
      currentIndentation = this.editor.indentationForBufferRow(cursor.row);
      nextLine = "\n";
      if (currentIndentation < 1 || cursor.row < 1) {
        this.editor.selectToBeginningOfLine();
        this.editor.insertText(nextLine);
        return;
      }
      emptyLineSkipped = 0;
      for (row = j = ref = cursor.row - 1; ref <= 0 ? j <= 0 : j >= 0; row = ref <= 0 ? ++j : --j) {
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
      this.editor.selectToBeginningOfLine();
      return this.editor.insertText(nextLine);
    };

    EditLine.prototype._isTableRow = function(cursor, line) {
      if (!config.get("tableNewLineContinuation")) {
        return false;
      }
      if (cursor.row < 1 || !utils.isTableRow(line)) {
        return false;
      }
      if (utils.isTableSeparator(line)) {
        return true;
      }
      if (utils.isTableRow(this.editor.lineTextForBufferRow(cursor.row - 1))) {
        return true;
      }
      return false;
    };

    EditLine.prototype._insertNewlineWithoutTableColumns = function() {
      this.editor.selectLinesContainingCursors();
      return this.editor.insertText("\n");
    };

    EditLine.prototype._insertNewlineWithTableColumns = function(row) {
      var newLine, options;
      options = {
        numOfColumns: Math.max(1, row.columns.length),
        extraPipes: row.extraPipes,
        columnWidth: 1,
        columnWidths: [],
        alignment: config.get("tableAlignment"),
        alignments: []
      };
      newLine = utils.createTableRow([], options);
      this.editor.moveToEndOfLine();
      this.editor.insertText("\n" + newLine);
      this.editor.moveToBeginningOfLine();
      if (options.extraPipes) {
        return this.editor.moveToNextWordBoundary();
      }
    };

    EditLine.prototype.indentListLine = function(e, selection) {
      var bullet, cursor, line, lineMeta;
      if (this._isRangeSelection(selection)) {
        return e.abortKeyBinding();
      }
      cursor = selection.getHeadBufferPosition();
      line = this.editor.lineTextForBufferRow(cursor.row);
      lineMeta = new LineMeta(line);
      if (lineMeta.isList("ol")) {
        line = "" + (this.editor.getTabText()) + (lineMeta.lineHead(lineMeta.defaultHead)) + lineMeta.body;
        return this._replaceLine(selection, cursor.row, line);
      } else if (lineMeta.isList("ul")) {
        bullet = config.get("templateVariables.ulBullet" + (this.editor.indentationForBufferRow(cursor.row) + 1));
        bullet = bullet || config.get("templateVariables.ulBullet") || lineMeta.defaultHead;
        line = "" + (this.editor.getTabText()) + (lineMeta.lineHead(bullet)) + lineMeta.body;
        return this._replaceLine(selection, cursor.row, line);
      } else if (this._isAtLineBeginning(line, cursor.column)) {
        return selection.indent();
      } else {
        return e.abortKeyBinding();
      }
    };

    EditLine.prototype._isRangeSelection = function(selection) {
      var head, tail;
      head = selection.getHeadBufferPosition();
      tail = selection.getTailBufferPosition();
      return head.row !== tail.row || head.column !== tail.column;
    };

    EditLine.prototype._replaceLine = function(selection, row, line) {
      var range;
      range = selection.cursor.getCurrentLineBufferRange();
      selection.setBufferRange(range);
      return selection.insertText(line);
    };

    EditLine.prototype._isAtLineBeginning = function(line, col) {
      return col === 0 || line.substring(0, col).trim() === "";
    };

    return EditLine;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9lZGl0LWxpbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUVSLFFBQUEsR0FBVyxPQUFBLENBQVEsc0JBQVI7O0VBRVgsMkJBQUEsR0FBOEI7O0VBRTlCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFFUyxrQkFBQyxNQUFEO01BQ1gsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO0lBRkM7O3VCQUliLE9BQUEsR0FBUyxTQUFDLENBQUQ7QUFDUCxVQUFBO01BQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixVQUFoQixFQUE0QixTQUFDLENBQUQ7ZUFBTyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBTCxDQUFBO01BQVAsQ0FBNUI7YUFFTCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNmLEtBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsU0FBQyxTQUFEO21CQUM5QixLQUFFLENBQUEsRUFBQSxDQUFGLENBQU0sQ0FBTixFQUFTLFNBQVQ7VUFEOEIsQ0FBaEM7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFITzs7dUJBT1QsYUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFJLFNBQUo7QUFDYixVQUFBO01BQUEsSUFBOEIsSUFBQyxDQUFBLGlCQUFELENBQW1CLFNBQW5CLENBQTlCO0FBQUEsZUFBTyxDQUFDLENB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QUFpQztJQUQzQjs7Ozs7QUF2SnRCIiwic291cmNlc0NvbnRlbnQiOlsiY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG5cbkxpbmVNZXRhID0gcmVxdWlyZSBcIi4uL2hlbHBlcnMvbGluZS1tZXRhXCJcblxuTUFYX1NLSVBfRU1QVFlfTElORV9BTExPV0VEID0gNVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBFZGl0TGluZVxuICAjIGFjdGlvbjogaW5zZXJ0LW5ldy1saW5lLCBpbmRlbnQtbGlzdC1saW5lXG4gIGNvbnN0cnVjdG9yOiAoYWN0aW9uKSAtPlxuICAgIEBhY3Rpb24gPSBhY3Rpb25cbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgdHJpZ2dlcjogKGUpIC0+XG4gICAgZm4gPSBAYWN0aW9uLnJlcGxhY2UgLy1bYS16XS9pZywgKHMpIC0+IHNbMV0udG9VcHBlckNhc2UoKVxuXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBAW2ZuXShlLCBzZWxlY3Rpb24pXG5cbiAgaW5zZXJ0TmV3TGluZTogKGUsIHNlbGVjdGlvbikgLT5cbiAgICByZXR1cm4gZS5hYm9ydEtleUJpbmRpbmcoKSBpZiBAX2lzUmFuZ2VTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgY3Vyc29yID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcblxuICAgIGxpbmVNZXRhID0gbmV3IExpbmVNZXRhKGxpbmUpXG4gICAgaWYgbGluZU1ldGEuaXNDb250aW51b3VzKClcbiAgICAgICMgd2hlbiBjdXJzb3IgaXMgYXQgbWlkZGxlIG9mIGxpbmUsIGRvIGEgbm9ybWFsIGluc2VydCBsaW5lXG4gICAgICAjIHVubGVzcyBpbmxpbmUgY29udGludWF0aW9uIGlzIGVuYWJsZWRcbiAgICAgIGlmIGN1cnNvci5jb2x1bW4gPCBsaW5lLmxlbmd0aCAmJiAhY29uZmlnLmdldChcImlubGluZU5ld0xpbmVDb250aW51YXRpb25cIilcbiAgICAgICAgcmV0dXJuIGUuYWJvcnRLZXlCaW5kaW5nKClcblxuICAgICAgaWYgbGluZU1ldGEuaXNFbXB0eUJvZHkoKVxuICAgICAgICBAX2luc2VydE5ld2xpbmVXaXRob3V0Q29udGludWF0aW9uKGN1cnNvcilcbiAgICAgIGVsc2VcbiAgICAgICAgQF9pbnNlcnROZXdsaW5lV2l0aENvbnRpbnVhdGlvbihsaW5lTWV0YSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgQF9pc1RhYmxlUm93KGN1cnNvciwgbGluZSlcbiAgICAgIHJvdyA9IHV0aWxzLnBhcnNlVGFibGVSb3cobGluZSlcbiAgICAgIGNvbHVtbldpZHRocyA9IHJvdy5jb2x1bW5XaWR0aHMucmVkdWNlKChzdW0sIGkpIC0+IHN1bSArIGkpXG4gICAgICBpZiBjb2x1bW5XaWR0aHMgPT0gMFxuICAgICAgICBAX2luc2VydE5ld2xpbmVXaXRob3V0VGFibGVDb2x1bW5zKClcbiAgICAgIGVsc2VcbiAgICAgICAgQF9pbnNlcnROZXdsaW5lV2l0aFRhYmxlQ29sdW1ucyhyb3cpXG4gICAgICByZXR1cm5cblxuICAgIHJldHVybiBlLmFib3J0S2V5QmluZGluZygpXG5cbiAgX2luc2VydE5ld2xpbmVXaXRoQ29udGludWF0aW9uOiAobGluZU1ldGEpIC0+XG4gICAgbmV4dExpbmUgPSBsaW5lTWV0YS5uZXh0TGluZVxuICAgICMgZG9uJ3QgY29udGludWUgbnVtYmVycyBpbiBPTFxuICAgIGlmIGxpbmVNZXRhLmlzTGlzdChcIm9sXCIpICYmICFjb25maWcuZ2V0KFwib3JkZXJlZE5ld0xpbmVOdW1iZXJDb250aW51YXRpb25cIilcbiAgICAgIG5leHRMaW5lID0gbGluZU1ldGEubGluZUhlYWQobGluZU1ldGEuZGVmYXVsdEhlYWQpXG5cbiAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG4je25leHRMaW5lfVwiKVxuXG4gIF9pbnNlcnROZXdsaW5lV2l0aG91dENvbnRpbnVhdGlvbjogKGN1cnNvcikgLT5cbiAgICBjdXJyZW50SW5kZW50YXRpb24gPSBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGN1cnNvci5yb3cpXG5cbiAgICBuZXh0TGluZSA9IFwiXFxuXCJcbiAgICAjIGlmIHRoaXMgaXMgYW4gbGlzdCB3aXRob3V0IGluZGVudGF0aW9uLCBvciBhdCBiZWdpbm5pbmcgb2YgdGhlIGZpbGVcbiAgICBpZiBjdXJyZW50SW5kZW50YXRpb24gPCAxIHx8IGN1cnNvci5yb3cgPCAxXG4gICAgICBAZWRpdG9yLnNlbGVjdFRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChuZXh0TGluZSlcbiAgICAgIHJldHVyblxuXG4gICAgZW1wdHlMaW5lU2tpcHBlZCA9IDBcbiAgICAjIGlmIHRoaXMgaXMgYW4gaW5kZW50ZWQgZW1wdHkgbGlzdCwgd2Ugd2lsbCBnbyB1cCBsaW5lcyBhbmQgdHJ5IHRvIGZpbmRcbiAgICAjIGl0cyBwYXJlbnQncyBsaXN0IHByZWZpeCBhbmQgdXNlIHRoYXQgaWYgcG9zc2libGVcbiAgICBmb3Igcm93IGluIFsoY3Vyc29yLnJvdyAtIDEpLi4wXVxuICAgICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVxuXG4gICAgICBpZiBsaW5lLnRyaW0oKSA9PSBcIlwiICMgc2tpcCBlbXB0eSBsaW5lcyBpbiBjYXNlIG9mIGxpc3QgcGFyYWdyYXBoc1xuICAgICAgICBicmVhayBpZiBlbXB0eUxpbmVTa2lwcGVkID4gTUFYX1NLSVBfRU1QVFlfTElORV9BTExPV0VEXG4gICAgICAgIGVtcHR5TGluZVNraXBwZWQgKz0gMVxuICAgICAgZWxzZSAjIGZpbmQgcGFyZW50IHdpdGggaW5kZW50YXRpb24gPSBjdXJyZW50IGluZGVudGF0aW9uIC0gMVxuICAgICAgICBpbmRlbnRhdGlvbiA9IEBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KVxuICAgICAgICBjb250aW51ZSBpZiBpbmRlbnRhdGlvbiA+PSBjdXJyZW50SW5kZW50YXRpb25cbiAgICAgICAgbmV4dExpbmUgPSBuZXcgTGluZU1ldGEobGluZSkubmV4dExpbmUgaWYgaW5kZW50YXRpb24gPT0gY3VycmVudEluZGVudGF0aW9uIC0gMSAmJiBMaW5lTWV0YS5pc0xpc3QobGluZSlcbiAgICAgICAgYnJlYWtcblxuICAgIEBlZGl0b3Iuc2VsZWN0VG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChuZXh0TGluZSlcblxuICBfaXNUYWJsZVJvdzogKGN1cnNvciwgbGluZSkgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgIWNvbmZpZy5nZXQoXCJ0YWJsZU5ld0xpbmVDb250aW51YXRpb25cIilcbiAgICAjIGZpcnN0IHJvdyBvciBub3QgYSByb3dcbiAgICByZXR1cm4gZmFsc2UgaWYgY3Vyc29yLnJvdyA8IDEgfHwgIXV0aWxzLmlzVGFibGVSb3cobGluZSlcbiAgICAjIGNhc2UgMCwgYXQgdGFibGUgc2VwYXJhdG9yLCBjb250aW51ZSB0YWJsZSByb3dcbiAgICByZXR1cm4gdHJ1ZSBpZiB1dGlscy5pc1RhYmxlU2VwYXJhdG9yKGxpbmUpXG4gICAgIyBjYXNlIDEsIGF0IHRhYmxlIHJvdywgcHJldmlvdXMgbGluZSBpcyBhIHJvdywgY29udGludWUgcm93XG4gICAgcmV0dXJuIHRydWUgaWYgdXRpbHMuaXNUYWJsZVJvdyhAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvci5yb3ctMSkpXG4gICAgIyBlbHNlLCBhdCB0YWJsZSBoZWFkLCBwcmV2aW91cyBsaW5lIGlzIG5vdCBhIHJvdywgZG8gbm90IGNvbnRpbnVlIHJvd1xuICAgIHJldHVybiBmYWxzZVxuXG4gIF9pbnNlcnROZXdsaW5lV2l0aG91dFRhYmxlQ29sdW1uczogLT5cbiAgICBAZWRpdG9yLnNlbGVjdExpbmVzQ29udGFpbmluZ0N1cnNvcnMoKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcblwiKVxuXG4gIF9pbnNlcnROZXdsaW5lV2l0aFRhYmxlQ29sdW1uczogKHJvdykgLT5cbiAgICBvcHRpb25zID1cbiAgICAgIG51bU9mQ29sdW1uczogTWF0aC5tYXgoMSwgcm93LmNvbHVtbnMubGVuZ3RoKVxuICAgICAgZXh0cmFQaXBlczogcm93LmV4dHJhUGlwZXNcbiAgICAgIGNvbHVtbldpZHRoOiAxXG4gICAgICBjb2x1bW5XaWR0aHM6IFtdXG4gICAgICBhbGlnbm1lbnQ6IGNvbmZpZy5nZXQoXCJ0YWJsZUFsaWdubWVudFwiKVxuICAgICAgYWxpZ25tZW50czogW11cblxuICAgIG5ld0xpbmUgPSB1dGlscy5jcmVhdGVUYWJsZVJvdyhbXSwgb3B0aW9ucylcbiAgICBAZWRpdG9yLm1vdmVUb0VuZE9mTGluZSgpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KFwiXFxuI3tuZXdMaW5lfVwiKVxuICAgIEBlZGl0b3IubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAZWRpdG9yLm1vdmVUb05leHRXb3JkQm91bmRhcnkoKSBpZiBvcHRpb25zLmV4dHJhUGlwZXNcblxuICBpbmRlbnRMaXN0TGluZTogKGUsIHNlbGVjdGlvbikgLT5cbiAgICByZXR1cm4gZS5hYm9ydEtleUJpbmRpbmcoKSBpZiBAX2lzUmFuZ2VTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgY3Vyc29yID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgbGluZSA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coY3Vyc29yLnJvdylcbiAgICBsaW5lTWV0YSA9IG5ldyBMaW5lTWV0YShsaW5lKVxuXG4gICAgaWYgbGluZU1ldGEuaXNMaXN0KFwib2xcIilcbiAgICAgIGxpbmUgPSBcIiN7QGVkaXRvci5nZXRUYWJUZXh0KCl9I3tsaW5lTWV0YS5saW5lSGVhZChsaW5lTWV0YS5kZWZhdWx0SGVhZCl9I3tsaW5lTWV0YS5ib2R5fVwiXG4gICAgICBAX3JlcGxhY2VMaW5lKHNlbGVjdGlvbiwgY3Vyc29yLnJvdywgbGluZSlcblxuICAgIGVsc2UgaWYgbGluZU1ldGEuaXNMaXN0KFwidWxcIilcbiAgICAgIGJ1bGxldCA9IGNvbmZpZy5nZXQoXCJ0ZW1wbGF0ZVZhcmlhYmxlcy51bEJ1bGxldCN7QGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3Iucm93KSsxfVwiKVxuICAgICAgYnVsbGV0ID0gYnVsbGV0IHx8IGNvbmZpZy5nZXQoXCJ0ZW1wbGF0ZVZhcmlhYmxlcy51bEJ1bGxldFwiKSB8fCBsaW5lTWV0YS5kZWZhdWx0SGVhZFxuXG4gICAgICBsaW5lID0gXCIje0BlZGl0b3IuZ2V0VGFiVGV4dCgpfSN7bGluZU1ldGEubGluZUhlYWQoYnVsbGV0KX0je2xpbmVNZXRhLmJvZHl9XCJcbiAgICAgIEBfcmVwbGFjZUxpbmUoc2VsZWN0aW9uLCBjdXJzb3Iucm93LCBsaW5lKVxuXG4gICAgZWxzZSBpZiBAX2lzQXRMaW5lQmVnaW5uaW5nKGxpbmUsIGN1cnNvci5jb2x1bW4pICMgaW5kZW50IG9uIHN0YXJ0IG9mIGxpbmVcbiAgICAgIHNlbGVjdGlvbi5pbmRlbnQoKVxuICAgIGVsc2VcbiAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKClcblxuICBfaXNSYW5nZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBoZWFkID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaGVhZC5yb3cgIT0gdGFpbC5yb3cgfHwgaGVhZC5jb2x1bW4gIT0gdGFpbC5jb2x1bW5cblxuICBfcmVwbGFjZUxpbmU6IChzZWxlY3Rpb24sIHJvdywgbGluZSkgLT5cbiAgICByYW5nZSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpXG4gICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGxpbmUpXG5cbiAgX2lzQXRMaW5lQmVnaW5uaW5nOiAobGluZSwgY29sKSAtPlxuICAgIGNvbCA9PSAwIHx8IGxpbmUuc3Vic3RyaW5nKDAsIGNvbCkudHJpbSgpID09IFwiXCJcbiJdfQ==
