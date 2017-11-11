(function() {
  var FRONT_MATTER_REGEX, FrontMatter, yaml;

  yaml = require("js-yaml");

  FRONT_MATTER_REGEX = /^(?:---\s*$)?([^:]+:[\s\S]*?)^---\s*$/m;

  module.exports = FrontMatter = (function() {
    function FrontMatter(editor, options) {
      if (options == null) {
        options = {};
      }
      this.editor = editor;
      this.options = options;
      this.content = {};
      this.leadingFence = true;
      this.isEmpty = true;
      this.parseError = null;
      this._findFrontMatter((function(_this) {
        return function(match) {
          var error;
          try {
            _this.content = yaml.safeLoad(match.match[1].trim()) || {};
            _this.leadingFence = match.matchText.startsWith("---");
            return _this.isEmpty = false;
          } catch (error1) {
            error = error1;
            _this.parseError = error;
            _this.content = {};
            if (options["silent"] !== true) {
              return atom.confirm({
                message: "[Markdown Writer] Error!",
                detailedMessage: "Invalid Front Matter:\n" + error.message,
                buttons: ['OK']
              });
            }
          }
        };
      })(this));
    }

    FrontMatter.prototype._findFrontMatter = function(onMatch) {
      return this.editor.buffer.scan(FRONT_MATTER_REGEX, onMatch);
    };

    FrontMatter.prototype.normalizeField = function(field) {
      if (Object.prototype.toString.call(this.content[field]) === "[object Array]") {
        return this.content[field];
      } else if (typeof this.content[field] === "string") {
        return this.content[field] = [this.content[field]];
      } else {
        return this.content[field] = [];
      }
    };

    FrontMatter.prototype.has = function(field) {
      return field && (this.content[field] != null);
    };

    FrontMatter.prototype.get = function(field) {
      return this.content[field];
    };

    FrontMatter.prototype.getArray = function(field) {
      this.normalizeField(field);
      return this.content[field];
    };

    FrontMatter.prototype.set = function(field, content) {
      return this.content[field] = content;
    };

    FrontMatter.prototype.setIfExists = function(field, content) {
      if (this.has(field)) {
        return this.content[field] = content;
      }
    };

    FrontMatter.prototype.getContent = function() {
      return JSON.parse(JSON.stringify(this.content));
    };

    FrontMatter.prototype.getContentText = function() {
      var text;
      text = yaml.safeDump(this.content);
      if (this.leadingFence) {
        return ["---", text + "---", ""].join("\n");
      } else {
        return [text + "---", ""].join("\n");
      }
    };

    FrontMatter.prototype.save = function() {
      return this._findFrontMatter((function(_this) {
        return function(match) {
          return match.replace(_this.getContentText());
        };
      })(this));
    };

    return FrontMatter;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9oZWxwZXJzL2Zyb250LW1hdHRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7RUFFUCxrQkFBQSxHQUFxQjs7RUFTckIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUdTLHFCQUFDLE1BQUQsRUFBUyxPQUFUOztRQUFTLFVBQVU7O01BQzlCLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsT0FBRCxHQUFXO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFDWCxJQUFDLENBQUEsVUFBRCxHQUFjO01BR2QsSUFBQyxDQUFBLGdCQUFELENBQWtCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxLQUFEO0FBQ2hCLGNBQUE7QUFBQTtZQUNFLEtBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWYsQ0FBQSxDQUFkLENBQUEsSUFBd0M7WUFDbkQsS0FBQyxDQUFBLFlBQUQsR0FBZ0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFoQixDQUEyQixLQUEzQjttQkFDaEIsS0FBQyxDQUFBLE9BQUQsR0FBVyxNQUhiO1dBQUEsY0FBQTtZQUlNO1lBQ0osS0FBQyxDQUFBLFVBQUQsR0FBYztZQUNkLEtBQUMsQ0FBQSxPQUFELEdBQVc7WUFDWCxJQUFPLE9BQVEsQ0FBQSxRQUFBLENBQVIsS0FBcUIsSUFBNUI7cUJBQ0UsSUFBSSxDQUFDLE9BQUwsQ0FDRTtnQkFBQSxPQUFBLEVBQVMsMEJBQVQ7Z0JBQ0EsZUFBQSxFQUFpQix5QkFBQSxHQUEwQixLQUFLLENBQUMsT0FEakQ7Z0JBRUEsT0FBQSxFQUFTLENBQUMsSUFBRCxDQUZUO2VBREYsRUFERjthQVBGOztRQURnQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEI7SUFUVzs7MEJBdUJiLGdCQUFBLEdBQWtCLFNBQUMsT0FBRDthQUNoQixJQUFDLENBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLGtCQUFwQixFQUF3QyxPQUF4QztJQURnQjs7MEJBSWxCLGNBQUEsR0FBZ0IsU0FBQyxLQUFEO01BQ2QsSUFBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUExQixDQUErQixJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUEsQ0FBeEMsQ0FBQSxLQUFtRCxnQkFBdEQ7ZUFDRSxJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUEsRUFEWDtPQUFBLE1BRUssSUFBRyxPQUFPLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFoQixLQUEwQixRQUE3QjtlQUNILElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFULEdBQWtCLENBQUMsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBLENBQVYsRUFEZjtPQUFBLE1BQUE7ZUFHSCxJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUEsQ0FBVCxHQUFrQixHQUhmOztJQUhTOzswQkFRaEIsR0FBQSxHQUFLLFNBQUMsS0FBRDthQUFXLEtBQUEsSUFBUztJQUFwQjs7MEJBRUwsR0FBQSxHQUFLLFNBQUMsS0FBRDthQUFXLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQTtJQUFwQjs7MEJBRUwsUUFBQSxHQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxjQUFELENBQWdCLEtBQWhCO2FBQ0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxLQUFBO0lBRkQ7OzBCQUlWLEdBQUEsR0FBSyxTQUFDLEtBQUQsRUFBUSxPQUFSO2FBQW9CLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFULEdBQWtCO0lBQXRDOzswQkFFTCxXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsT0FBUjtNQUNYLElBQTZCLElBQUMsQ0FBQSxHQUFELENBQUssS0FBTCxDQUE3QjtlQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsS0FBQSxDQUFULEdBQWtCLFFBQWxCOztJQURXOzswQkFHYixVQUFBLEdBQVksU0FBQTthQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsT0FBaEIsQ0FBWDtJQUFIOzswQkFFWixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBQyxDQUFBLE9BQWY7TUFDUCxJQUFHLElBQUMsQ0FBQSxZQUFKO2VBQ0UsQ0FBQyxLQUFELEVBQVcsSUFBRCxHQUFNLEtBQWhCLEVBQXNCLEVBQXRCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsSUFBL0IsRUFERjtPQUFBLE1BQUE7ZUFHRSxDQUFJLElBQUQsR0FBTSxLQUFULEVBQWUsRUFBZixDQUFrQixDQUFDLElBQW5CLENBQXdCLElBQXhCLEVBSEY7O0lBRmM7OzBCQU9oQixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtpQkFBVyxLQUFLLENBQUMsT0FBTixDQUFjLEtBQUMsQ0FBQSxjQUFELENBQUEsQ0FBZDtRQUFYO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQjtJQURJOzs7OztBQXhFUiIsInNvdXJjZXNDb250ZW50IjpbInlhbWwgPSByZXF1aXJlIFwianMteWFtbFwiXG5cbkZST05UX01BVFRFUl9SRUdFWCA9IC8vL1xuICBeKD86LS0tXFxzKiQpPyAgIyBtYXRjaCBvcGVuIC0tLSAoaWYgYW55KVxuICAoXG4gICAgW146XSs6ICAgICAgIyBtYXRjaCBhdCBsZWFzdCAxIG9wZW4ga2V5XG4gICAgW1xcc1xcU10qPyAgICAjIG1hdGNoIHRoZSByZXN0XG4gIClcbiAgXi0tLVxccyokICAgICAgICMgbWF0Y2ggZW5kaW5nIC0tLVxuICAvLy9tXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZyb250TWF0dGVyXG4gICMgb3B0aW9uczpcbiAgIyAgIHNpbGllbnQgPSB0cnVlL2ZhbHNlXG4gIGNvbnN0cnVjdG9yOiAoZWRpdG9yLCBvcHRpb25zID0ge30pIC0+XG4gICAgQGVkaXRvciA9IGVkaXRvclxuICAgIEBvcHRpb25zID0gb3B0aW9uc1xuICAgIEBjb250ZW50ID0ge31cbiAgICBAbGVhZGluZ0ZlbmNlID0gdHJ1ZVxuICAgIEBpc0VtcHR5ID0gdHJ1ZVxuICAgIEBwYXJzZUVycm9yID0gbnVsbFxuXG4gICAgIyBmaW5kIGFuZCBwYXJzZSBmcm9udCBtYXR0ZXJcbiAgICBAX2ZpbmRGcm9udE1hdHRlciAobWF0Y2gpID0+XG4gICAgICB0cnlcbiAgICAgICAgQGNvbnRlbnQgPSB5YW1sLnNhZmVMb2FkKG1hdGNoLm1hdGNoWzFdLnRyaW0oKSkgfHwge31cbiAgICAgICAgQGxlYWRpbmdGZW5jZSA9IG1hdGNoLm1hdGNoVGV4dC5zdGFydHNXaXRoKFwiLS0tXCIpXG4gICAgICAgIEBpc0VtcHR5ID0gZmFsc2VcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIEBwYXJzZUVycm9yID0gZXJyb3JcbiAgICAgICAgQGNvbnRlbnQgPSB7fVxuICAgICAgICB1bmxlc3Mgb3B0aW9uc1tcInNpbGVudFwiXSA9PSB0cnVlXG4gICAgICAgICAgYXRvbS5jb25maXJtXG4gICAgICAgICAgICBtZXNzYWdlOiBcIltNYXJrZG93biBXcml0ZXJdIEVycm9yIVwiXG4gICAgICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IFwiSW52YWxpZCBGcm9udCBNYXR0ZXI6XFxuI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgICBidXR0b25zOiBbJ09LJ11cblxuICBfZmluZEZyb250TWF0dGVyOiAob25NYXRjaCkgLT5cbiAgICBAZWRpdG9yLmJ1ZmZlci5zY2FuKEZST05UX01BVFRFUl9SRUdFWCwgb25NYXRjaClcblxuICAjIG5vcm1hbGl6ZSB0aGUgZmllbGQgdG8gYW4gYXJyYXlcbiAgbm9ybWFsaXplRmllbGQ6IChmaWVsZCkgLT5cbiAgICBpZiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoQGNvbnRlbnRbZmllbGRdKSA9PSBcIltvYmplY3QgQXJyYXldXCJcbiAgICAgIEBjb250ZW50W2ZpZWxkXVxuICAgIGVsc2UgaWYgdHlwZW9mIEBjb250ZW50W2ZpZWxkXSA9PSBcInN0cmluZ1wiXG4gICAgICBAY29udGVudFtmaWVsZF0gPSBbQGNvbnRlbnRbZmllbGRdXVxuICAgIGVsc2VcbiAgICAgIEBjb250ZW50W2ZpZWxkXSA9IFtdXG5cbiAgaGFzOiAoZmllbGQpIC0+IGZpZWxkICYmIEBjb250ZW50W2ZpZWxkXT9cblxuICBnZXQ6IChmaWVsZCkgLT4gQGNvbnRlbnRbZmllbGRdXG5cbiAgZ2V0QXJyYXk6IChmaWVsZCkgLT5cbiAgICBAbm9ybWFsaXplRmllbGQoZmllbGQpXG4gICAgQGNvbnRlbnRbZmllbGRdXG5cbiAgc2V0OiAoZmllbGQsIGNvbnRlbnQpIC0+IEBjb250ZW50W2ZpZWxkXSA9IGNvbnRlbnRcblxuICBzZXRJZkV4aXN0czogKGZpZWxkLCBjb250ZW50KSAtPlxuICAgIEBjb250ZW50W2ZpZWxkXSA9IGNvbnRlbnQgaWYgQGhhcyhmaWVsZClcblxuICBnZXRDb250ZW50OiAtPiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KEBjb250ZW50KSlcblxuICBnZXRDb250ZW50VGV4dDogLT5cbiAgICB0ZXh0ID0geWFtbC5zYWZlRHVtcChAY29udGVudClcbiAgICBpZiBAbGVhZGluZ0ZlbmNlXG4gICAgICBbXCItLS1cIiwgXCIje3RleHR9LS0tXCIsIFwiXCJdLmpvaW4oXCJcXG5cIilcbiAgICBlbHNlXG4gICAgICBbXCIje3RleHR9LS0tXCIsIFwiXCJdLmpvaW4oXCJcXG5cIilcblxuICBzYXZlOiAtPlxuICAgIEBfZmluZEZyb250TWF0dGVyIChtYXRjaCkgPT4gbWF0Y2gucmVwbGFjZShAZ2V0Q29udGVudFRleHQoKSlcbiJdfQ==
