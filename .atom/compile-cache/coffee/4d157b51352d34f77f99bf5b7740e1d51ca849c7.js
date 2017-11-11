(function() {
  var StyleText, config, scopeSelectors, utils;

  config = require("../config");

  utils = require("../utils");

  scopeSelectors = {
    code: ".raw",
    bold: ".bold",
    italic: ".italic",
    strikethrough: ".strike"
  };

  module.exports = StyleText = (function() {
    function StyleText(style) {
      var base, base1;
      this.styleName = style;
      this.style = config.get("textStyles." + style);
      if ((base = this.style).before == null) {
        base.before = "";
      }
      if ((base1 = this.style).after == null) {
        base1.after = "";
      }
    }

    StyleText.prototype.trigger = function(e) {
      this.editor = atom.workspace.getActiveTextEditor();
      return this.editor.transact((function(_this) {
        return function() {
          return _this.editor.getSelections().forEach(function(selection) {
            var retainSelection, text;
            retainSelection = !selection.isEmpty();
            _this.normalizeSelection(selection);
            if (text = selection.getText()) {
              return _this.toggleStyle(selection, text, {
                select: retainSelection
              });
            } else {
              return _this.insertEmptyStyle(selection);
            }
          });
        };
      })(this));
    };

    StyleText.prototype.normalizeSelection = function(selection) {
      var range, scopeSelector;
      scopeSelector = scopeSelectors[this.styleName];
      if (!scopeSelector) {
        return;
      }
      range = utils.getTextBufferRange(this.editor, scopeSelector, selection);
      return selection.setBufferRange(range);
    };

    StyleText.prototype.toggleStyle = function(selection, text, opts) {
      if (this.isStyleOn(text)) {
        text = this.removeStyle(text);
      } else {
        text = this.addStyle(text);
      }
      return selection.insertText(text, opts);
    };

    StyleText.prototype.insertEmptyStyle = function(selection) {
      var position;
      selection.insertText(this.style.before);
      position = selection.cursor.getBufferPosition();
      selection.insertText(this.style.after);
      return selection.cursor.setBufferPosition(position);
    };

    StyleText.prototype.isStyleOn = function(text) {
      if (text) {
        return this.getStylePattern().test(text);
      }
    };

    StyleText.prototype.addStyle = function(text) {
      return "" + this.style.before + text + this.style.after;
    };

    StyleText.prototype.removeStyle = function(text) {
      var matches;
      while (matches = this.getStylePattern().exec(text)) {
        text = matches.slice(1).join("");
      }
      return text;
    };

    StyleText.prototype.getStylePattern = function() {
      var after, before;
      before = this.style.regexBefore || utils.escapeRegExp(this.style.before);
      after = this.style.regexAfter || utils.escapeRegExp(this.style.after);
      return RegExp("^([\\s\\S]*?)" + before + "([\\s\\S]*?)" + after + "([\\s\\S]*?)$", "gm");
    };

    return StyleText;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9zdHlsZS10ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFHUixjQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQU0sTUFBTjtJQUNBLElBQUEsRUFBTSxPQUROO0lBRUEsTUFBQSxFQUFRLFNBRlI7SUFHQSxhQUFBLEVBQWUsU0FIZjs7O0VBS0YsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQVFTLG1CQUFDLEtBQUQ7QUFDWCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtNQUNiLElBQUMsQ0FBQSxLQUFELEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxhQUFBLEdBQWMsS0FBekI7O1lBRUgsQ0FBQyxTQUFVOzs7YUFDWCxDQUFDLFFBQVM7O0lBTEw7O3dCQU9iLE9BQUEsR0FBUyxTQUFDLENBQUQ7TUFDUCxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTthQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ2YsS0FBQyxDQUFBLE1BQU0sQ0FBQyxhQUFSLENBQUEsQ0FBdUIsQ0FBQyxPQUF4QixDQUFnQyxTQUFDLFNBQUQ7QUFDOUIsZ0JBQUE7WUFBQSxlQUFBLEdBQWtCLENBQUMsU0FBUyxDQUFDLE9BQVYsQ0FBQTtZQUNuQixLQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBcEI7WUFFQSxJQUFHLElBQUEsR0FBTyxTQUFTLENBQUMsT0FBVixDQUFBLENBQVY7cUJBQ0UsS0FBQyxDQUFBLFdBQUQsQ0FBYSxTQUFiLEVBQXdCLElBQXhCLEVBQThCO2dCQUFBLE1BQUEsRUFBUSxlQUFSO2VBQTlCLEVBREY7YUFBQSxNQUFBO3FCQUdFLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixTQUFsQixFQUhGOztVQUo4QixDQUFoQztRQURlO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtJQUZPOzt3QkFhVCxrQkFBQSxHQUFvQixTQUFDLFNBQUQ7QUFDbEIsVUFBQTtNQUFBLGFBQUEsR0FBZ0IsY0FBZSxDQUFBLElBQUMsQ0FBQSxTQUFEO01BQy9CLElBQUEsQ0FBYyxhQUFkO0FBQUEsZUFBQTs7TUFFQSxLQUFBLEdBQVEsS0FBSyxDQUFDLGtCQUFOLENBQXlCLElBQUMsQ0FBQSxNQUExQixFQUFrQyxhQUFsQyxFQUFpRCxTQUFqRDthQUNSLFNBQVMsQ0FBQyxjQUFWLENBQXlCLEtBQXpCO0lBTGtCOzt3QkFPcEIsV0FBQSxHQUFhLFNBQUMsU0FBRCxFQUFZLElBQVosRUFBa0IsSUFBbEI7TUFDWCxJQUFHLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxDQUFIO1FBQ0UsSUFBQSxHQUFPLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixFQURUO09BQUEsTUFBQTtRQUdFLElBQUEsR0FBTyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQVYsRUFIVDs7YUFLQSxTQUFTLENBQUMsVUFBVixDQUFxQixJQUFyQixFQUEyQixJQUEzQjtJQU5XOzt3QkFRYixnQkFBQSxHQUFrQixTQUFDLFNBQUQ7QUFDaEIsVUFBQTtNQUFBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBNUI7TUFDQSxRQUFBLEdBQVcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxpQkFBakIsQ0FBQTtNQUNYLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBNUI7YUFDQSxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFqQixDQUFtQyxRQUFuQztJQUpnQjs7d0JBTWxCLFNBQUEsR0FBVyxTQUFDLElBQUQ7TUFDVCxJQUFpQyxJQUFqQztlQUFBLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixFQUFBOztJQURTOzt3QkFHWCxRQUFBLEdBQVUsU0FBQyxJQUFEO2FBQ1IsRUFBQSxHQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBVixHQUFtQixJQUFuQixHQUEwQixJQUFDLENBQUEsS0FBSyxDQUFDO0lBRHpCOzt3QkFHVixXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1gsVUFBQTtBQUFBLGFBQU0sT0FBQSxHQUFVLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixJQUF4QixDQUFoQjtRQUNFLElBQUEsR0FBTyxPQUFRLFNBQUksQ0FBQyxJQUFiLENBQWtCLEVBQWxCO01BRFQ7QUFFQSxhQUFPO0lBSEk7O3dCQUtiLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQyxXQUFQLElBQXNCLEtBQUssQ0FBQyxZQUFOLENBQW1CLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBMUI7TUFDL0IsS0FBQSxHQUFRLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxJQUFxQixLQUFLLENBQUMsWUFBTixDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLEtBQTFCO2FBRTdCLE1BQUEsQ0FBQSxlQUFBLEdBRUUsTUFGRixHQUVTLGNBRlQsR0FFcUIsS0FGckIsR0FFMkIsZUFGM0IsRUFJRyxJQUpIO0lBSmU7Ozs7O0FBdkVuQiIsInNvdXJjZXNDb250ZW50IjpbImNvbmZpZyA9IHJlcXVpcmUgXCIuLi9jb25maWdcIlxudXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxuXG4jIE1hcCBtYXJrZG93bi13cml0ZXIgdGV4dCBzdHlsZSBrZXlzIHRvIG9mZmljaWFsIGdmbSBzdHlsZSBzY29wZSBzZWxlY3RvcnNcbnNjb3BlU2VsZWN0b3JzID1cbiAgY29kZTogXCIucmF3XCJcbiAgYm9sZDogXCIuYm9sZFwiXG4gIGl0YWxpYzogXCIuaXRhbGljXCJcbiAgc3RyaWtldGhyb3VnaDogXCIuc3RyaWtlXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3R5bGVUZXh0XG4gICMgQHN0eWxlIGNvbmZpZyBjb3VsZCBjb250YWluczpcbiAgI1xuICAjIC0gYmVmb3JlIChyZXF1aXJlZClcbiAgIyAtIGFmdGVyIChyZXF1aXJlZClcbiAgIyAtIHJlZ2V4QmVmb3JlIChvcHRpb25hbCkgb3ZlcndyaXRlcyBiZWZvcmUgd2hlbiB0byBtYXRjaC9yZXBsYWNlIHN0cmluZ1xuICAjIC0gcmVnZXhBZnRlciAob3B0aW9uYWwpIG92ZXJ3cml0ZXMgYWZ0ZXIgd2hlbiB0byBtYXRjaC9yZXBsYWNlIHN0cmluZ1xuICAjXG4gIGNvbnN0cnVjdG9yOiAoc3R5bGUpIC0+XG4gICAgQHN0eWxlTmFtZSA9IHN0eWxlXG4gICAgQHN0eWxlID0gY29uZmlnLmdldChcInRleHRTdHlsZXMuI3tzdHlsZX1cIilcbiAgICAjIG1ha2Ugc3VyZSBiZWZvcmUvYWZ0ZXIgZXhpc3RcbiAgICBAc3R5bGUuYmVmb3JlID89IFwiXCJcbiAgICBAc3R5bGUuYWZ0ZXIgPz0gXCJcIlxuXG4gIHRyaWdnZXI6IChlKSAtPlxuICAgIEBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5mb3JFYWNoIChzZWxlY3Rpb24pID0+XG4gICAgICAgIHJldGFpblNlbGVjdGlvbiA9ICFzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAgIEBub3JtYWxpemVTZWxlY3Rpb24oc2VsZWN0aW9uKVxuXG4gICAgICAgIGlmIHRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgICAgQHRvZ2dsZVN0eWxlKHNlbGVjdGlvbiwgdGV4dCwgc2VsZWN0OiByZXRhaW5TZWxlY3Rpb24pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW5zZXJ0RW1wdHlTdHlsZShzZWxlY3Rpb24pXG5cbiAgIyB0cnkgdG8gYWN0IHNtYXJ0IHRvIGNvcnJlY3QgdGhlIHNlbGVjdGlvbiBpZiBuZWVkZWRcbiAgbm9ybWFsaXplU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHNjb3BlU2VsZWN0b3IgPSBzY29wZVNlbGVjdG9yc1tAc3R5bGVOYW1lXVxuICAgIHJldHVybiB1bmxlc3Mgc2NvcGVTZWxlY3RvclxuXG4gICAgcmFuZ2UgPSB1dGlscy5nZXRUZXh0QnVmZmVyUmFuZ2UoQGVkaXRvciwgc2NvcGVTZWxlY3Rvciwgc2VsZWN0aW9uKVxuICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSlcblxuICB0b2dnbGVTdHlsZTogKHNlbGVjdGlvbiwgdGV4dCwgb3B0cykgLT5cbiAgICBpZiBAaXNTdHlsZU9uKHRleHQpXG4gICAgICB0ZXh0ID0gQHJlbW92ZVN0eWxlKHRleHQpXG4gICAgZWxzZVxuICAgICAgdGV4dCA9IEBhZGRTdHlsZSh0ZXh0KVxuXG4gICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgb3B0cylcblxuICBpbnNlcnRFbXB0eVN0eWxlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KEBzdHlsZS5iZWZvcmUpXG4gICAgcG9zaXRpb24gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dChAc3R5bGUuYWZ0ZXIpXG4gICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb3NpdGlvbilcblxuICBpc1N0eWxlT246ICh0ZXh0KSAtPlxuICAgIEBnZXRTdHlsZVBhdHRlcm4oKS50ZXN0KHRleHQpIGlmIHRleHRcblxuICBhZGRTdHlsZTogKHRleHQpIC0+XG4gICAgXCIje0BzdHlsZS5iZWZvcmV9I3t0ZXh0fSN7QHN0eWxlLmFmdGVyfVwiXG5cbiAgcmVtb3ZlU3R5bGU6ICh0ZXh0KSAtPlxuICAgIHdoaWxlIG1hdGNoZXMgPSBAZ2V0U3R5bGVQYXR0ZXJuKCkuZXhlYyh0ZXh0KVxuICAgICAgdGV4dCA9IG1hdGNoZXNbMS4uXS5qb2luKFwiXCIpXG4gICAgcmV0dXJuIHRleHRcblxuICBnZXRTdHlsZVBhdHRlcm46IC0+XG4gICAgYmVmb3JlID0gQHN0eWxlLnJlZ2V4QmVmb3JlIHx8IHV0aWxzLmVzY2FwZVJlZ0V4cChAc3R5bGUuYmVmb3JlKVxuICAgIGFmdGVyID0gQHN0eWxlLnJlZ2V4QWZ0ZXIgfHwgdXRpbHMuZXNjYXBlUmVnRXhwKEBzdHlsZS5hZnRlcilcblxuICAgIC8vL1xuICAgIF4oW1xcc1xcU10qPykgICAgICAgICAgICAgICAgICAgICMgcmFuZG9tIHRleHQgYXQgaGVhZFxuICAgICN7YmVmb3JlfShbXFxzXFxTXSo/KSN7YWZ0ZXJ9ICAgICMgdGhlIHN0eWxlIHBhdHRlcm4gYXBwZWFyIG9uY2VcbiAgICAoW1xcc1xcU10qPykkICAgICAgICAgICAgICAgICAgICAjIHJhbmRvbSB0ZXh0IGF0IGVuZFxuICAgIC8vL2dtXG4iXX0=
