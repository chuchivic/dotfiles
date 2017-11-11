(function() {
  var StyleLine, config, utils;

  config = require("../config");

  utils = require("../utils");

  module.exports = StyleLine = (function() {
    function StyleLine(style) {
      var base, base1, base2, base3, base4, base5;
      this.style = config.get("lineStyles." + style);
      if ((base = this.style).before == null) {
        base.before = "";
      }
      if ((base1 = this.style).after == null) {
        base1.after = "";
      }
      if ((base2 = this.style).regexMatchBefore == null) {
        base2.regexMatchBefore = this.style.regexBefore || this.style.before;
      }
      if ((base3 = this.style).regexMatchAfter == null) {
        base3.regexMatchAfter = this.style.regexAfter || this.style.after;
      }
      if (this.style.before) {
        if ((base4 = this.style).regexBefore == null) {
          base4.regexBefore = this.style.before[0] + "+\\s";
        }
      }
      if (this.style.after) {
        if ((base5 = this.style).regexAfter == null) {
          base5.regexAfter = "\\s" + this.style.after[this.style.after.length - 1] + "*";
        }
      }
    }

    StyleLine.prototype.trigger = function(e) {
      this.editor = atom.workspace.getActiveTextEditor();
      return this.editor.transact((function(_this) {
        return function() {
          return _this.editor.getSelections().forEach(function(selection) {
            var data, i, j, k, len, line, range, ref, ref1, ref2, results, row, rows;
            range = selection.getBufferRange();
            rows = selection.getBufferRowRange();
            ref2 = (function() {
              results = [];
              for (var k = ref = rows[0], ref1 = rows[1]; ref <= ref1 ? k <= ref1 : k >= ref1; ref <= ref1 ? k++ : k--){ results.push(k); }
              return results;
            }).apply(this);
            for (i = j = 0, len = ref2.length; j < len; i = ++j) {
              row = ref2[i];
              data = {
                i: i + 1,
                ul: config.get("templateVariables.ulBullet" + (_this.editor.indentationForBufferRow(row))) || config.get("templateVariables.ulBullet")
              };
              selection.cursor.setBufferPosition([row, 0]);
              selection.selectToEndOfLine();
              if (line = selection.getText()) {
                _this.toggleStyle(selection, line, data);
              } else {
                _this.insertEmptyStyle(selection, data);
              }
            }
            if (rows[0] !== rows[1]) {
              return selection.setBufferRange(range);
            }
          });
        };
      })(this));
    };

    StyleLine.prototype.toggleStyle = function(selection, line, data) {
      var text;
      if (this.isStyleOn(line)) {
        text = this.removeStyle(line);
      } else {
        text = this.addStyle(line, data);
      }
      return selection.insertText(text);
    };

    StyleLine.prototype.insertEmptyStyle = function(selection, data) {
      var position;
      selection.insertText(utils.template(this.style.before, data));
      position = selection.cursor.getBufferPosition();
      selection.insertText(utils.template(this.style.after, data));
      return selection.cursor.setBufferPosition(position);
    };

    StyleLine.prototype.isStyleOn = function(text) {
      return RegExp("^(\\s*)" + this.style.regexMatchBefore + "(.*?)" + this.style.regexMatchAfter + "(\\s*)$", "i").test(text);
    };

    StyleLine.prototype.addStyle = function(text, data) {
      var after, before, match;
      before = utils.template(this.style.before, data);
      after = utils.template(this.style.after, data);
      match = this.getStylePattern().exec(text);
      if (match) {
        return "" + match[1] + before + match[2] + after + match[3];
      } else {
        return "" + before + after;
      }
    };

    StyleLine.prototype.removeStyle = function(text) {
      var matches;
      matches = this.getStylePattern().exec(text);
      return matches.slice(1).join("");
    };

    StyleLine.prototype.getStylePattern = function() {
      var after, before;
      before = this.style.regexBefore || utils.escapeRegExp(this.style.before);
      after = this.style.regexAfter || utils.escapeRegExp(this.style.after);
      return RegExp("^(\\s*)(?:" + before + ")?(.*?)(?:" + after + ")?(\\s*)$", "i");
    };

    return StyleLine;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9zdHlsZS1saW5lLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFFUixNQUFNLENBQUMsT0FBUCxHQUNNO0lBVVMsbUJBQUMsS0FBRDtBQUNYLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLE1BQU0sQ0FBQyxHQUFQLENBQVcsYUFBQSxHQUFjLEtBQXpCOztZQUVILENBQUMsU0FBVTs7O2FBQ1gsQ0FBQyxRQUFTOzs7YUFFVixDQUFDLG1CQUFvQixJQUFDLENBQUEsS0FBSyxDQUFDLFdBQVAsSUFBc0IsSUFBQyxDQUFBLEtBQUssQ0FBQzs7O2FBQ2xELENBQUMsa0JBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxJQUFxQixJQUFDLENBQUEsS0FBSyxDQUFDOztNQUV0RCxJQUFtRCxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTFEOztlQUFNLENBQUMsY0FBa0IsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFmLEdBQWtCO1NBQTFDOztNQUNBLElBQXVFLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBOUU7O2VBQU0sQ0FBQyxhQUFjLEtBQUEsR0FBTSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQU0sQ0FBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFiLEdBQXNCLENBQXRCLENBQW5CLEdBQTRDO1NBQWpFOztJQVZXOzt3QkFZYixPQUFBLEdBQVMsU0FBQyxDQUFEO01BQ1AsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7YUFDVixJQUFDLENBQUEsTUFBTSxDQUFDLFFBQVIs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Q0FBQyxJQUFuQixDQUF3QixJQUF4QjtNQUNSLElBQUcsS0FBSDtlQUNFLEVBQUEsR0FBRyxLQUFNLENBQUEsQ0FBQSxDQUFULEdBQWMsTUFBZCxHQUF1QixLQUFNLENBQUEsQ0FBQSxDQUE3QixHQUFrQyxLQUFsQyxHQUEwQyxLQUFNLENBQUEsQ0FBQSxFQURsRDtPQUFBLE1BQUE7ZUFHRSxFQUFBLEdBQUcsTUFBSCxHQUFZLE1BSGQ7O0lBTFE7O3dCQVVWLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO01BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUF4QjtBQUNWLGFBQU8sT0FBUSxTQUFJLENBQUMsSUFBYixDQUFrQixFQUFsQjtJQUZJOzt3QkFJYixlQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsV0FBUCxJQUFzQixLQUFLLENBQUMsWUFBTixDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQTFCO01BQy9CLEtBQUEsR0FBUSxJQUFDLENBQUEsS0FBSyxDQUFDLFVBQVAsSUFBcUIsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUExQjthQUU3QixNQUFBLENBQUEsWUFBQSxHQUFnQixNQUFoQixHQUF1QixZQUF2QixHQUFxQyxLQUFyQyxHQUEyQyxXQUEzQyxFQUF3RCxHQUF4RDtJQUplOzs7OztBQXJGbkIiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbnV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3R5bGVMaW5lXG4gICMgQHN0eWxlIGNvbmZpZyBjb3VsZCBjb250YWluczpcbiAgI1xuICAjIC0gYmVmb3JlIChyZXF1aXJlZClcbiAgIyAtIGFmdGVyIChyZXF1aXJlZClcbiAgIyAtIHJlZ2V4QmVmb3JlIChvcHRpb25hbCkgb3ZlcndyaXRlcyBiZWZvcmUgd2hlbiB0byBtYXRjaC9yZXBsYWNlIHN0cmluZ1xuICAjIC0gcmVnZXhBZnRlciAob3B0aW9uYWwpIG92ZXJ3cml0ZXMgYWZ0ZXIgd2hlbiB0byBtYXRjaC9yZXBsYWNlIHN0cmluZ1xuICAjIC0gcmVnZXhNYXRjaEJlZm9yZSAob3B0aW9uYWwpIHRvIGRldGVjdCBhIHN0cmluZyBtYXRjaCB0aGUgc3R5bGUgcGF0dGVyblxuICAjIC0gcmVnZXhNYXRjaEFmdGVyIChvcHRpb25hbCkgdG8gZGV0ZWN0IGEgc3RyaW5nIG1hdGNoIHRoZSBzdHlsZSBwYXR0ZXJuXG4gICNcbiAgY29uc3RydWN0b3I6IChzdHlsZSkgLT5cbiAgICBAc3R5bGUgPSBjb25maWcuZ2V0KFwibGluZVN0eWxlcy4je3N0eWxlfVwiKVxuICAgICMgbWFrZSBzdXJlIGJlZm9yZS9hZnRlciBleGlzdFxuICAgIEBzdHlsZS5iZWZvcmUgPz0gXCJcIlxuICAgIEBzdHlsZS5hZnRlciA/PSBcIlwiXG4gICAgIyB1c2UgcmVnZXhCZWZvcmUsIHJlZ2V4QWZ0ZXIgaWYgbm90IHNwZWNpZmllZFxuICAgIEBzdHlsZS5yZWdleE1hdGNoQmVmb3JlID89IEBzdHlsZS5yZWdleEJlZm9yZSB8fCBAc3R5bGUuYmVmb3JlXG4gICAgQHN0eWxlLnJlZ2V4TWF0Y2hBZnRlciA/PSBAc3R5bGUucmVnZXhBZnRlciB8fCBAc3R5bGUuYWZ0ZXJcbiAgICAjIHNldCByZWdleEJlZm9yZSBmb3IgaGVhZGluZ3MgdGhhdCBvbmx5IG5lZWQgdG8gY2hlY2sgdGhlIDFzdCBjaGFyXG4gICAgQHN0eWxlLnJlZ2V4QmVmb3JlID89IFwiI3tAc3R5bGUuYmVmb3JlWzBdfStcXFxcc1wiIGlmIEBzdHlsZS5iZWZvcmVcbiAgICBAc3R5bGUucmVnZXhBZnRlciA/PSBcIlxcXFxzI3tAc3R5bGUuYWZ0ZXJbQHN0eWxlLmFmdGVyLmxlbmd0aCAtIDFdfSpcIiBpZiBAc3R5bGUuYWZ0ZXJcblxuICB0cmlnZ2VyOiAoZSkgLT5cbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZm9yRWFjaCAoc2VsZWN0aW9uKSA9PlxuICAgICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICMgd2hlbiBzZWxlY3Rpb24gY29udGFpbnMgbXVsdGlwbGUgcm93cywgYXBwbHkgc3R5bGUgdG8gZWFjaCByb3dcbiAgICAgICAgcm93cyA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSb3dSYW5nZSgpXG4gICAgICAgICMgcm93c1swXSA9IHN0YXJ0IG9mIGJ1ZmZlciByb3dzLCByb3dzWzFdID0gZW5kIG9mIGJ1ZmZlciByb3dzXG4gICAgICAgIGZvciByb3csIGkgaW4gKFtyb3dzWzBdLi5yb3dzWzFdXSlcbiAgICAgICAgICBkYXRhID1cbiAgICAgICAgICAgIGk6IGkgKyAxLFxuICAgICAgICAgICAgdWw6IGNvbmZpZy5nZXQoXCJ0ZW1wbGF0ZVZhcmlhYmxlcy51bEJ1bGxldCN7QGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpfVwiKSB8fCBjb25maWcuZ2V0KFwidGVtcGxhdGVWYXJpYWJsZXMudWxCdWxsZXRcIilcblxuICAgICAgICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gICAgICAgICAgc2VsZWN0aW9uLnNlbGVjdFRvRW5kT2ZMaW5lKClcblxuICAgICAgICAgIGlmIGxpbmUgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgICAgICBAdG9nZ2xlU3R5bGUoc2VsZWN0aW9uLCBsaW5lLCBkYXRhKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBpbnNlcnRFbXB0eVN0eWxlKHNlbGVjdGlvbiwgZGF0YSlcbiAgICAgICAgIyBzZWxlY3QgdGhlIHdob2xlIHJhbmdlLCBpZiBzZWxlY3Rpb24gY29udGFpbnMgbXVsdGlwbGUgcm93c1xuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UpIGlmIHJvd3NbMF0gIT0gcm93c1sxXVxuXG4gIHRvZ2dsZVN0eWxlOiAoc2VsZWN0aW9uLCBsaW5lLCBkYXRhKSAtPlxuICAgIGlmIEBpc1N0eWxlT24obGluZSlcbiAgICAgIHRleHQgPSBAcmVtb3ZlU3R5bGUobGluZSlcbiAgICBlbHNlXG4gICAgICB0ZXh0ID0gQGFkZFN0eWxlKGxpbmUsIGRhdGEpXG5cbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuXG4gIGluc2VydEVtcHR5U3R5bGU6IChzZWxlY3Rpb24sIGRhdGEpIC0+XG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodXRpbHMudGVtcGxhdGUoQHN0eWxlLmJlZm9yZSwgZGF0YSkpXG4gICAgcG9zaXRpb24gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh1dGlscy50ZW1wbGF0ZShAc3R5bGUuYWZ0ZXIsIGRhdGEpKVxuICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zaXRpb24pXG5cbiAgIyB1c2UgcmVnZXhNYXRjaEJlZm9yZS9yZWdleE1hdGNoQWZ0ZXIgdG8gbWF0Y2ggdGhlIHN0cmluZ1xuICBpc1N0eWxlT246ICh0ZXh0KSAtPlxuICAgIC8vLyBeKFxccyopICAgICAgICAgICAgICAgICAgICMgc3RhcnQgd2l0aCBhbnkgc3BhY2VzXG4gICAgI3tAc3R5bGUucmVnZXhNYXRjaEJlZm9yZX0gICAjIHN0eWxlIHN0YXJ0XG4gICAgICAoLio/KSAgICAgICAgICAgICAgICAgICAgICAjIGFueSB0ZXh0XG4gICAgI3tAc3R5bGUucmVnZXhNYXRjaEFmdGVyfSAgICAjIHN0eWxlIGVuZFxuICAgIChcXHMqKSQgLy8vaS50ZXN0KHRleHQpXG5cbiAgYWRkU3R5bGU6ICh0ZXh0LCBkYXRhKSAtPlxuICAgIGJlZm9yZSA9IHV0aWxzLnRlbXBsYXRlKEBzdHlsZS5iZWZvcmUsIGRhdGEpXG4gICAgYWZ0ZXIgPSB1dGlscy50ZW1wbGF0ZShAc3R5bGUuYWZ0ZXIsIGRhdGEpXG5cbiAgICBtYXRjaCA9IEBnZXRTdHlsZVBhdHRlcm4oKS5leGVjKHRleHQpXG4gICAgaWYgbWF0Y2hcbiAgICAgIFwiI3ttYXRjaFsxXX0je2JlZm9yZX0je21hdGNoWzJdfSN7YWZ0ZXJ9I3ttYXRjaFszXX1cIlxuICAgIGVsc2VcbiAgICAgIFwiI3tiZWZvcmV9I3thZnRlcn1cIlxuXG4gIHJlbW92ZVN0eWxlOiAodGV4dCkgLT5cbiAgICBtYXRjaGVzID0gQGdldFN0eWxlUGF0dGVybigpLmV4ZWModGV4dClcbiAgICByZXR1cm4gbWF0Y2hlc1sxLi5dLmpvaW4oXCJcIilcblxuICBnZXRTdHlsZVBhdHRlcm46IC0+XG4gICAgYmVmb3JlID0gQHN0eWxlLnJlZ2V4QmVmb3JlIHx8IHV0aWxzLmVzY2FwZVJlZ0V4cChAc3R5bGUuYmVmb3JlKVxuICAgIGFmdGVyID0gQHN0eWxlLnJlZ2V4QWZ0ZXIgfHwgdXRpbHMuZXNjYXBlUmVnRXhwKEBzdHlsZS5hZnRlcilcblxuICAgIC8vLyBeKFxccyopICg/OiN7YmVmb3JlfSk/ICguKj8pICg/OiN7YWZ0ZXJ9KT8gKFxccyopJCAvLy9pXG4iXX0=
