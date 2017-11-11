(function() {
  var AutoComplete, Ex, fs, os, path;

  fs = require('fs');

  path = require('path');

  os = require('os');

  Ex = require('./ex');

  module.exports = AutoComplete = (function() {
    function AutoComplete(commands) {
      this.commands = commands;
      this.resetCompletion();
    }

    AutoComplete.prototype.resetCompletion = function() {
      this.autoCompleteIndex = 0;
      this.autoCompleteText = null;
      return this.completions = [];
    };

    AutoComplete.prototype.expandTilde = function(filePath) {
      if (filePath.charAt(0) === '~') {
        return os.homedir() + filePath.slice(1);
      } else {
        return filePath;
      }
    };

    AutoComplete.prototype.getAutocomplete = function(text) {
      var cmd, filePath, parts;
      if (!this.autoCompleteText) {
        this.autoCompleteText = text;
      }
      parts = this.autoCompleteText.split(' ');
      cmd = parts[0];
      if (parts.length > 1) {
        filePath = parts.slice(1).join(' ');
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getFilePathCompletion(cmd, filePath);
          };
        })(this));
      } else {
        return this.getCompletion((function(_this) {
          return function() {
            return _this.getCommandCompletion(cmd);
          };
        })(this));
      }
    };

    AutoComplete.prototype.filterByPrefix = function(commands, prefix) {
      return commands.sort().filter((function(_this) {
        return function(f) {
          return f.startsWith(prefix);
        };
      })(this));
    };

    AutoComplete.prototype.getCompletion = function(completeFunc) {
      var complete;
      if (this.completions.length === 0) {
        this.completions = completeFunc();
      }
      complete = '';
      if (this.completions.length) {
        complete = this.completions[this.autoCompleteIndex % this.completions.length];
        this.autoCompleteIndex++;
        if (complete.endsWith('/') && this.completions.length === 1) {
          this.resetCompletion();
        }
      }
      return complete;
    };

    AutoComplete.prototype.getCommandCompletion = function(command) {
      return this.filterByPrefix(this.commands, command);
    };

    AutoComplete.prototype.getFilePathCompletion = function(command, filePath) {
      var baseName, basePath, basePathStat, err, files;
      filePath = this.expandTilde(filePath);
      if (filePath.endsWith(path.sep)) {
        basePath = path.dirname(filePath + '.');
        baseName = '';
      } else {
        basePath = path.dirname(filePath);
        baseName = path.basename(filePath);
      }
      try {
        basePathStat = fs.statSync(basePath);
        if (basePathStat.isDirectory()) {
          files = fs.readdirSync(basePath);
          return this.filterByPrefix(files, baseName).map((function(_this) {
            return function(f) {
              filePath = path.join(basePath, f);
              if (fs.lstatSync(filePath).isDirectory()) {
                return command + ' ' + filePath + path.sep;
              } else {
                return command + ' ' + filePath;
              }
            };
          })(this));
        }
        return [];
      } catch (error) {
        err = error;
        return [];
      }
    };

    return AutoComplete;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvYXV0b2NvbXBsZXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQkFBQyxRQUFEO01BQ1gsSUFBQyxDQUFBLFFBQUQsR0FBWTtNQUNaLElBQUMsQ0FBQSxlQUFELENBQUE7SUFGVzs7MkJBSWIsZUFBQSxHQUFpQixTQUFBO01BQ2YsSUFBQyxDQUFBLGlCQUFELEdBQXFCO01BQ3JCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjthQUNwQixJQUFDLENBQUEsV0FBRCxHQUFlO0lBSEE7OzJCQUtqQixXQUFBLEdBQWEsU0FBQyxRQUFEO01BQ1gsSUFBRyxRQUFRLENBQUMsTUFBVCxDQUFnQixDQUFoQixDQUFBLEtBQXNCLEdBQXpCO0FBQ0UsZUFBTyxFQUFFLENBQUMsT0FBSCxDQUFBLENBQUEsR0FBZSxRQUFRLENBQUMsS0FBVCxDQUFlLENBQWYsRUFEeEI7T0FBQSxNQUFBO0FBR0UsZUFBTyxTQUhUOztJQURXOzsyQkFNYixlQUFBLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFVBQUE7TUFBQSxJQUFHLENBQUMsSUFBQyxDQUFBLGdCQUFMO1FBQ0UsSUFBQyxDQUFBLGdCQUFELEdBQW9CLEtBRHRCOztNQUdBLEtBQUEsR0FBUSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsS0FBbEIsQ0FBd0IsR0FBeEI7TUFDUixHQUFBLEdBQU0sS0FBTSxDQUFBLENBQUE7TUFFWixJQUFHLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBbEI7UUFDRSxRQUFBLEdB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OztZQUYwQztVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckMsRUFGVDs7QUFTQSxlQUFPLEdBWFQ7T0FBQSxhQUFBO1FBWU07QUFDSixlQUFPLEdBYlQ7O0lBVm1COzs7OztBQXhEekIiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5vcyA9IHJlcXVpcmUgJ29zJ1xuRXggPSByZXF1aXJlICcuL2V4J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBBdXRvQ29tcGxldGVcbiAgY29uc3RydWN0b3I6IChjb21tYW5kcykgLT5cbiAgICBAY29tbWFuZHMgPSBjb21tYW5kc1xuICAgIEByZXNldENvbXBsZXRpb24oKVxuXG4gIHJlc2V0Q29tcGxldGlvbjogKCkgLT5cbiAgICBAYXV0b0NvbXBsZXRlSW5kZXggPSAwXG4gICAgQGF1dG9Db21wbGV0ZVRleHQgPSBudWxsXG4gICAgQGNvbXBsZXRpb25zID0gW11cblxuICBleHBhbmRUaWxkZTogKGZpbGVQYXRoKSAtPlxuICAgIGlmIGZpbGVQYXRoLmNoYXJBdCgwKSA9PSAnfidcbiAgICAgIHJldHVybiBvcy5ob21lZGlyKCkgKyBmaWxlUGF0aC5zbGljZSgxKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBmaWxlUGF0aFxuXG4gIGdldEF1dG9jb21wbGV0ZTogKHRleHQpIC0+XG4gICAgaWYgIUBhdXRvQ29tcGxldGVUZXh0XG4gICAgICBAYXV0b0NvbXBsZXRlVGV4dCA9IHRleHRcblxuICAgIHBhcnRzID0gQGF1dG9Db21wbGV0ZVRleHQuc3BsaXQoJyAnKVxuICAgIGNtZCA9IHBhcnRzWzBdXG5cbiAgICBpZiBwYXJ0cy5sZW5ndGggPiAxXG4gICAgICBmaWxlUGF0aCA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJyAnKVxuICAgICAgcmV0dXJuIEBnZXRDb21wbGV0aW9uKCgpID0+IEBnZXRGaWxlUGF0aENvbXBsZXRpb24oY21kLCBmaWxlUGF0aCkpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIEBnZXRDb21wbGV0aW9uKCgpID0+IEBnZXRDb21tYW5kQ29tcGxldGlvbihjbWQpKVxuXG4gIGZpbHRlckJ5UHJlZml4OiAoY29tbWFuZHMsIHByZWZpeCkgLT5cbiAgICBjb21tYW5kcy5zb3J0KCkuZmlsdGVyKChmKSA9PiBmLnN0YXJ0c1dpdGgocHJlZml4KSlcblxuICBnZXRDb21wbGV0aW9uOiAoY29tcGxldGVGdW5jKSAtPlxuICAgIGlmIEBjb21wbGV0aW9ucy5sZW5ndGggPT0gMFxuICAgICAgQGNvbXBsZXRpb25zID0gY29tcGxldGVGdW5jKClcblxuICAgIGNvbXBsZXRlID0gJydcbiAgICBpZiBAY29tcGxldGlvbnMubGVuZ3RoXG4gICAgICBjb21wbGV0ZSA9IEBjb21wbGV0aW9uc1tAYXV0b0NvbXBsZXRlSW5kZXggJSBAY29tcGxldGlvbnMubGVuZ3RoXVxuICAgICAgQGF1dG9Db21wbGV0ZUluZGV4KytcblxuICAgICAgIyBPbmx5IG9uZSByZXN1bHQgc28gbGV0cyByZXR1cm4gdGhpcyBkaXJlY3RvcnlcbiAgICAgIGlmIGNvbXBsZXRlLmVuZHNXaXRoKCcvJykgJiYgQGNvbXBsZXRpb25zLmxlbmd0aCA9PSAxXG4gICAgICAgIEByZXNldENvbXBsZXRpb24oKVxuXG4gICAgcmV0dXJuIGNvbXBsZXRlXG5cbiAgZ2V0Q29tbWFuZENvbXBsZXRpb246IChjb21tYW5kKSAtPlxuICAgIHJldHVybiBAZmlsdGVyQnlQcmVmaXgoQGNvbW1hbmRzLCBjb21tYW5kKVxuXG4gIGdldEZpbGVQYXRoQ29tcGxldGlvbjogKGNvbW1hbmQsIGZpbGVQYXRoKSAtPlxuICAgICAgZmlsZVBhdGggPSBAZXhwYW5kVGlsZGUoZmlsZVBhdGgpXG5cbiAgICAgIGlmIGZpbGVQYXRoLmVuZHNXaXRoKHBhdGguc2VwKVxuICAgICAgICBiYXNlUGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCArICcuJylcbiAgICAgICAgYmFzZU5hbWUgPSAnJ1xuICAgICAgZWxzZVxuICAgICAgICBiYXNlUGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aClcbiAgICAgICAgYmFzZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKVxuXG4gICAgICB0cnlcbiAgICAgICAgYmFzZVBhdGhTdGF0ID0gZnMuc3RhdFN5bmMoYmFzZVBhdGgpXG4gICAgICAgIGlmIGJhc2VQYXRoU3RhdC5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhiYXNlUGF0aClcbiAgICAgICAgICByZXR1cm4gQGZpbHRlckJ5UHJlZml4KGZpbGVzLCBiYXNlTmFtZSkubWFwKChmKSA9PlxuICAgICAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4oYmFzZVBhdGgsIGYpXG4gICAgICAgICAgICBpZiBmcy5sc3RhdFN5bmMoZmlsZVBhdGgpLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbW1hbmQgKyAnICcgKyBmaWxlUGF0aCAgKyBwYXRoLnNlcFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gY29tbWFuZCArICcgJyArIGZpbGVQYXRoXG4gICAgICAgICAgKVxuICAgICAgICByZXR1cm4gW11cbiAgICAgIGNhdGNoIGVyclxuICAgICAgICByZXR1cm4gW11cbiJdfQ==
