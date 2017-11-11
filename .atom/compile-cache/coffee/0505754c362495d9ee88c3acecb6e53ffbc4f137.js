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
      selection.cursor.setBufferPosition([row, 0]);
      selection.selectToEndOfLine();
      return selection.insertText(line);
    };

    EditLine.prototype._isAtLineBeginning = function(line, col) {
      return col === 0 || line.substring(0, col).trim() === "";
    };

    return EditLine;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9lZGl0LWxpbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUVSLFFBQUEsR0FBVyxPQUFBLENBQVEsc0JBQVI7O0VBRVgsMkJBQUEsR0FBOEI7O0VBRTlCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFFUyxrQkFBQyxNQUFEO01BQ1gsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO0lBRkM7O3VCQUliLE9BQUEsR0FBUyxTQUFDLENBQUQ7QUFDUCxVQUFBO01BQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFnQixVQUFoQixFQUE0QixTQUFDLENBQUQ7ZUFBTyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBTCxDQUFBO01BQVAsQ0FBNUI7YUFFTCxJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIsQ0FBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNmLEtBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixDQUFBLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsU0FBQyxTQUFEO21CQUM5QixLQUFFLENBQUEsRUFBQSxDQUFGLENBQU0sQ0FBTixFQUFTLFNBQVQ7VUFEOEIsQ0FBaEM7UUFEZTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakI7SUFITzs7dUJBT1QsYUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFJLFNBQUo7QUFDYixVQUFBO01BQUEsSUFBOEIsSUFBQyxDQUFBLGlCQUFELENBQW1CLFNBQW5CLENBQTlCO0FBQUEsZUFBTyxDQUFDLENB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S0FBaUM7SUFEM0I7Ozs7O0FBdkp0QiIsInNvdXJjZXNDb250ZW50IjpbImNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWdcIlxudXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxuXG5MaW5lTWV0YSA9IHJlcXVpcmUgXCIuLi9oZWxwZXJzL2xpbmUtbWV0YVwiXG5cbk1BWF9TS0lQX0VNUFRZX0xJTkVfQUxMT1dFRCA9IDVcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRWRpdExpbmVcbiAgIyBhY3Rpb246IGluc2VydC1uZXctbGluZSwgaW5kZW50LWxpc3QtbGluZVxuICBjb25zdHJ1Y3RvcjogKGFjdGlvbikgLT5cbiAgICBAYWN0aW9uID0gYWN0aW9uXG4gICAgQGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gIHRyaWdnZXI6IChlKSAtPlxuICAgIGZuID0gQGFjdGlvbi5yZXBsYWNlIC8tW2Etel0vaWcsIChzKSAtPiBzWzFdLnRvVXBwZXJDYXNlKClcblxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLmZvckVhY2ggKHNlbGVjdGlvbikgPT5cbiAgICAgICAgQFtmbl0oZSwgc2VsZWN0aW9uKVxuXG4gIGluc2VydE5ld0xpbmU6IChlLCBzZWxlY3Rpb24pIC0+XG4gICAgcmV0dXJuIGUuYWJvcnRLZXlCaW5kaW5nKCkgaWYgQF9pc1JhbmdlU2VsZWN0aW9uKHNlbGVjdGlvbilcblxuICAgIGN1cnNvciA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvci5yb3cpXG5cbiAgICBsaW5lTWV0YSA9IG5ldyBMaW5lTWV0YShsaW5lKVxuICAgIGlmIGxpbmVNZXRhLmlzQ29udGludW91cygpXG4gICAgICAjIHdoZW4gY3Vyc29yIGlzIGF0IG1pZGRsZSBvZiBsaW5lLCBkbyBhIG5vcm1hbCBpbnNlcnQgbGluZVxuICAgICAgIyB1bmxlc3MgaW5saW5lIGNvbnRpbnVhdGlvbiBpcyBlbmFibGVkXG4gICAgICBpZiBjdXJzb3IuY29sdW1uIDwgbGluZS5sZW5ndGggJiYgIWNvbmZpZy5nZXQoXCJpbmxpbmVOZXdMaW5lQ29udGludWF0aW9uXCIpXG4gICAgICAgIHJldHVybiBlLmFib3J0S2V5QmluZGluZygpXG5cbiAgICAgIGlmIGxpbmVNZXRhLmlzRW1wdHlCb2R5KClcbiAgICAgICAgQF9pbnNlcnROZXdsaW5lV2l0aG91dENvbnRpbnVhdGlvbihjdXJzb3IpXG4gICAgICBlbHNlXG4gICAgICAgIEBfaW5zZXJ0TmV3bGluZVdpdGhDb250aW51YXRpb24obGluZU1ldGEpXG4gICAgICByZXR1cm5cblxuICAgIGlmIEBfaXNUYWJsZVJvdyhjdXJzb3IsIGxpbmUpXG4gICAgICByb3cgPSB1dGlscy5wYXJzZVRhYmxlUm93KGxpbmUpXG4gICAgICBjb2x1bW5XaWR0aHMgPSByb3cuY29sdW1uV2lkdGhzLnJlZHVjZSgoc3VtLCBpKSAtPiBzdW0gKyBpKVxuICAgICAgaWYgY29sdW1uV2lkdGhzID09IDBcbiAgICAgICAgQF9pbnNlcnROZXdsaW5lV2l0aG91dFRhYmxlQ29sdW1ucygpXG4gICAgICBlbHNlXG4gICAgICAgIEBfaW5zZXJ0TmV3bGluZVdpdGhUYWJsZUNvbHVtbnMocm93KVxuICAgICAgcmV0dXJuXG5cbiAgICByZXR1cm4gZS5hYm9ydEtleUJpbmRpbmcoKVxuXG4gIF9pbnNlcnROZXdsaW5lV2l0aENvbnRpbnVhdGlvbjogKGxpbmVNZXRhKSAtPlxuICAgIG5leHRMaW5lID0gbGluZU1ldGEubmV4dExpbmVcbiAgICAjIGRvbid0IGNvbnRpbnVlIG51bWJlcnMgaW4gT0xcbiAgICBpZiBsaW5lTWV0YS5pc0xpc3QoXCJvbFwiKSAmJiAhY29uZmlnLmdldChcIm9yZGVyZWROZXdMaW5lTnVtYmVyQ29udGludWF0aW9uXCIpXG4gICAgICBuZXh0TGluZSA9IGxpbmVNZXRhLmxpbmVIZWFkKGxpbmVNZXRhLmRlZmF1bHRIZWFkKVxuXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KFwiXFxuI3tuZXh0TGluZX1cIilcblxuICBfaW5zZXJ0TmV3bGluZVdpdGhvdXRDb250aW51YXRpb246IChjdXJzb3IpIC0+XG4gICAgY3VycmVudEluZGVudGF0aW9uID0gQGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhjdXJzb3Iucm93KVxuXG4gICAgbmV4dExpbmUgPSBcIlxcblwiXG4gICAgIyBpZiB0aGlzIGlzIGFuIGxpc3Qgd2l0aG91dCBpbmRlbnRhdGlvbiwgb3IgYXQgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXG4gICAgaWYgY3VycmVudEluZGVudGF0aW9uIDwgMSB8fCBjdXJzb3Iucm93IDwgMVxuICAgICAgQGVkaXRvci5zZWxlY3RUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgICBAZWRpdG9yLmluc2VydFRleHQobmV4dExpbmUpXG4gICAgICByZXR1cm5cblxuICAgIGVtcHR5TGluZVNraXBwZWQgPSAwXG4gICAgIyBpZiB0aGlzIGlzIGFuIGluZGVudGVkIGVtcHR5IGxpc3QsIHdlIHdpbGwgZ28gdXAgbGluZXMgYW5kIHRyeSB0byBmaW5kXG4gICAgIyBpdHMgcGFyZW50J3MgbGlzdCBwcmVmaXggYW5kIHVzZSB0aGF0IGlmIHBvc3NpYmxlXG4gICAgZm9yIHJvdyBpbiBbKGN1cnNvci5yb3cgLSAxKS4uMF1cbiAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcblxuICAgICAgaWYgbGluZS50cmltKCkgPT0gXCJcIiAjIHNraXAgZW1wdHkgbGluZXMgaW4gY2FzZSBvZiBsaXN0IHBhcmFncmFwaHNcbiAgICAgICAgYnJlYWsgaWYgZW1wdHlMaW5lU2tpcHBlZCA+IE1BWF9TS0lQX0VNUFRZX0xJTkVfQUxMT1dFRFxuICAgICAgICBlbXB0eUxpbmVTa2lwcGVkICs9IDFcbiAgICAgIGVsc2UgIyBmaW5kIHBhcmVudCB3aXRoIGluZGVudGF0aW9uID0gY3VycmVudCBpbmRlbnRhdGlvbiAtIDFcbiAgICAgICAgaW5kZW50YXRpb24gPSBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdylcbiAgICAgICAgY29udGludWUgaWYgaW5kZW50YXRpb24gPj0gY3VycmVudEluZGVudGF0aW9uXG4gICAgICAgIG5leHRMaW5lID0gbmV3IExpbmVNZXRhKGxpbmUpLm5leHRMaW5lIGlmIGluZGVudGF0aW9uID09IGN1cnJlbnRJbmRlbnRhdGlvbiAtIDEgJiYgTGluZU1ldGEuaXNMaXN0KGxpbmUpXG4gICAgICAgIGJyZWFrXG5cbiAgICBAZWRpdG9yLnNlbGVjdFRvQmVnaW5uaW5nT2ZMaW5lKClcbiAgICBAZWRpdG9yLmluc2VydFRleHQobmV4dExpbmUpXG5cbiAgX2lzVGFibGVSb3c6IChjdXJzb3IsIGxpbmUpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmICFjb25maWcuZ2V0KFwidGFibGVOZXdMaW5lQ29udGludWF0aW9uXCIpXG4gICAgIyBmaXJzdCByb3cgb3Igbm90IGEgcm93XG4gICAgcmV0dXJuIGZhbHNlIGlmIGN1cnNvci5yb3cgPCAxIHx8ICF1dGlscy5pc1RhYmxlUm93KGxpbmUpXG4gICAgIyBjYXNlIDAsIGF0IHRhYmxlIHNlcGFyYXRvciwgY29udGludWUgdGFibGUgcm93XG4gICAgcmV0dXJuIHRydWUgaWYgdXRpbHMuaXNUYWJsZVNlcGFyYXRvcihsaW5lKVxuICAgICMgY2FzZSAxLCBhdCB0YWJsZSByb3csIHByZXZpb3VzIGxpbmUgaXMgYSByb3csIGNvbnRpbnVlIHJvd1xuICAgIHJldHVybiB0cnVlIGlmIHV0aWxzLmlzVGFibGVSb3coQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhjdXJzb3Iucm93LTEpKVxuICAgICMgZWxzZSwgYXQgdGFibGUgaGVhZCwgcHJldmlvdXMgbGluZSBpcyBub3QgYSByb3csIGRvIG5vdCBjb250aW51ZSByb3dcbiAgICByZXR1cm4gZmFsc2VcblxuICBfaW5zZXJ0TmV3bGluZVdpdGhvdXRUYWJsZUNvbHVtbnM6IC0+XG4gICAgQGVkaXRvci5zZWxlY3RMaW5lc0NvbnRhaW5pbmdDdXJzb3JzKClcbiAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG5cIilcblxuICBfaW5zZXJ0TmV3bGluZVdpdGhUYWJsZUNvbHVtbnM6IChyb3cpIC0+XG4gICAgb3B0aW9ucyA9XG4gICAgICBudW1PZkNvbHVtbnM6IE1hdGgubWF4KDEsIHJvdy5jb2x1bW5zLmxlbmd0aClcbiAgICAgIGV4dHJhUGlwZXM6IHJvdy5leHRyYVBpcGVzXG4gICAgICBjb2x1bW5XaWR0aDogMVxuICAgICAgY29sdW1uV2lkdGhzOiBbXVxuICAgICAgYWxpZ25tZW50OiBjb25maWcuZ2V0KFwidGFibGVBbGlnbm1lbnRcIilcbiAgICAgIGFsaWdubWVudHM6IFtdXG5cbiAgICBuZXdMaW5lID0gdXRpbHMuY3JlYXRlVGFibGVSb3coW10sIG9wdGlvbnMpXG4gICAgQGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dChcIlxcbiN7bmV3TGluZX1cIilcbiAgICBAZWRpdG9yLm1vdmVUb0JlZ2lubmluZ09mTGluZSgpXG4gICAgQGVkaXRvci5tb3ZlVG9OZXh0V29yZEJvdW5kYXJ5KCkgaWYgb3B0aW9ucy5leHRyYVBpcGVzXG5cbiAgaW5kZW50TGlzdExpbmU6IChlLCBzZWxlY3Rpb24pIC0+XG4gICAgcmV0dXJuIGUuYWJvcnRLZXlCaW5kaW5nKCkgaWYgQF9pc1JhbmdlU2VsZWN0aW9uKHNlbGVjdGlvbilcblxuICAgIGN1cnNvciA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGN1cnNvci5yb3cpXG4gICAgbGluZU1ldGEgPSBuZXcgTGluZU1ldGEobGluZSlcblxuICAgIGlmIGxpbmVNZXRhLmlzTGlzdChcIm9sXCIpXG4gICAgICBsaW5lID0gXCIje0BlZGl0b3IuZ2V0VGFiVGV4dCgpfSN7bGluZU1ldGEubGluZUhlYWQobGluZU1ldGEuZGVmYXVsdEhlYWQpfSN7bGluZU1ldGEuYm9keX1cIlxuICAgICAgQF9yZXBsYWNlTGluZShzZWxlY3Rpb24sIGN1cnNvci5yb3csIGxpbmUpXG5cbiAgICBlbHNlIGlmIGxpbmVNZXRhLmlzTGlzdChcInVsXCIpXG4gICAgICBidWxsZXQgPSBjb25maWcuZ2V0KFwidGVtcGxhdGVWYXJpYWJsZXMudWxCdWxsZXQje0BlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coY3Vyc29yLnJvdykrMX1cIilcbiAgICAgIGJ1bGxldCA9IGJ1bGxldCB8fCBjb25maWcuZ2V0KFwidGVtcGxhdGVWYXJpYWJsZXMudWxCdWxsZXRcIikgfHwgbGluZU1ldGEuZGVmYXVsdEhlYWRcblxuICAgICAgbGluZSA9IFwiI3tAZWRpdG9yLmdldFRhYlRleHQoKX0je2xpbmVNZXRhLmxpbmVIZWFkKGJ1bGxldCl9I3tsaW5lTWV0YS5ib2R5fVwiXG4gICAgICBAX3JlcGxhY2VMaW5lKHNlbGVjdGlvbiwgY3Vyc29yLnJvdywgbGluZSlcblxuICAgIGVsc2UgaWYgQF9pc0F0TGluZUJlZ2lubmluZyhsaW5lLCBjdXJzb3IuY29sdW1uKSAjIGluZGVudCBvbiBzdGFydCBvZiBsaW5lXG4gICAgICBzZWxlY3Rpb24uaW5kZW50KClcbiAgICBlbHNlXG4gICAgICBlLmFib3J0S2V5QmluZGluZygpXG5cbiAgX2lzUmFuZ2VTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaGVhZCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHRhaWwgPSBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGhlYWQucm93ICE9IHRhaWwucm93IHx8IGhlYWQuY29sdW1uICE9IHRhaWwuY29sdW1uXG5cbiAgX3JlcGxhY2VMaW5lOiAoc2VsZWN0aW9uLCByb3csIGxpbmUpIC0+XG4gICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgICBzZWxlY3Rpb24uc2VsZWN0VG9FbmRPZkxpbmUoKVxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGxpbmUpXG5cbiAgX2lzQXRMaW5lQmVnaW5uaW5nOiAobGluZSwgY29sKSAtPlxuICAgIGNvbCA9PSAwIHx8IGxpbmUuc3Vic3RyaW5nKDAsIGNvbCkudHJpbSgpID09IFwiXCJcbiJdfQ==
