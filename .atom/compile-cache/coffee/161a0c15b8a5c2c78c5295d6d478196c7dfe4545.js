(function() {
  var $$, GitDiff, Path, SelectListView, StatusListView, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  fs = require('fs-plus');

  Path = require('path');

  git = require('../git');

  GitDiff = require('../models/git-diff');

  notifier = require('../notifier');

  module.exports = StatusListView = (function(superClass) {
    extend(StatusListView, superClass);

    function StatusListView() {
      return StatusListView.__super__.constructor.apply(this, arguments);
    }

    StatusListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data;
      StatusListView.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(this.parseData(this.data));
      return this.focusFilterEditor();
    };

    StatusListView.prototype.parseData = function(files) {
      var i, len, line, results;
      results = [];
      for (i = 0, len = files.length; i < len; i++) {
        line = files[i];
        if (!(/^([ MADRCU?!]{2})\s{1}(.*)/.test(line))) {
          continue;
        }
        line = line.match(/^([ MADRCU?!]{2})\s{1}(.*)/);
        results.push({
          type: line[1],
          path: line[2]
        });
      }
      return results;
    };

    StatusListView.prototype.getFilterKey = function() {
      return 'path';
    };

    StatusListView.prototype.getEmptyMessage = function() {
      return "Nothing to commit, working directory clean.";
    };

    StatusListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    StatusListView.prototype.cancelled = function() {
      return this.hide();
    };

    StatusListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    StatusListView.prototype.viewForItem = function(arg) {
      var getIcon, path, type;
      type = arg.type, path = arg.path;
      getIcon = function(s) {
        if (s[0] === 'A') {
          return 'status-added icon icon-diff-added';
        }
        if (s[0] === 'D') {
          return 'status-removed icon icon-diff-removed';
        }
        if (s[0] === 'R') {
          return 'status-renamed icon icon-diff-renamed';
        }
        if (s[0] === 'M' || s[1] === 'M') {
          return 'status-modified icon icon-diff-modified';
        }
        return '';
      };
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'pull-right highlight',
              style: 'white-space: pre-wrap; font-family: monospace'
            }, type);
            _this.span({
              "class": getIcon(type)
            });
            return _this.span(path);
          };
        })(this));
      });
    };

    StatusListView.prototype.confirmed = function(arg) {
      var fullPath, openFile, path, type;
      type = arg.type, path = arg.path;
      this.cancel();
      if (type === '??') {
        return git.add(this.repo, {
          file: path
        });
      } else {
        openFile = confirm("Open " + path + "?");
        fullPath = Path.join(this.repo.getWorkingDirectory(), path);
        return fs.stat(fullPath, (function(_this) {
          return function(err, stat) {
            var isDirectory;
            if (err) {
              return notifier.addError(err.message);
            } else {
              isDirectory = stat != null ? stat.isDirectory() : void 0;
              if (openFile) {
                if (isDirectory) {
                  return atom.open({
                    pathsToOpen: fullPath,
                    newWindow: true
                  });
                } else {
                  return atom.workspace.open(fullPath);
                }
              } else {
                return GitDiff(_this.repo, {
                  file: path
                });
              }
            }
          };
        })(this));
      }
    };

    return StatusListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3N0YXR1cy1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sT0FBQSxHQUFVLE9BQUEsQ0FBUSxvQkFBUjs7RUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs2QkFDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsSUFBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE9BQUQ7TUFDbEIsZ0RBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLElBQVosQ0FBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBSlU7OzZCQU1aLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxVQUFBO0FBQUE7V0FBQSx1Q0FBQTs7Y0FBdUIsNEJBQTRCLENBQUMsSUFBN0IsQ0FBa0MsSUFBbEM7OztRQUNyQixJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyw0QkFBWDtxQkFDUDtVQUFDLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxDQUFaO1VBQWdCLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxDQUEzQjs7QUFGRjs7SUFEUzs7NkJBS1gsWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOzs2QkFFZCxlQUFBLEdBQWlCLFNB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Ozs7S0ExQ2dCO0FBUjdCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblBhdGggPSByZXF1aXJlICdwYXRoJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuR2l0RGlmZiA9IHJlcXVpcmUgJy4uL21vZGVscy9naXQtZGlmZidcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFN0YXR1c0xpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSkgLT5cbiAgICBzdXBlclxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgQHBhcnNlRGF0YSBAZGF0YVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgcGFyc2VEYXRhOiAoZmlsZXMpIC0+XG4gICAgZm9yIGxpbmUgaW4gZmlsZXMgd2hlbiAvXihbIE1BRFJDVT8hXXsyfSlcXHN7MX0oLiopLy50ZXN0IGxpbmVcbiAgICAgIGxpbmUgPSBsaW5lLm1hdGNoIC9eKFsgTUFEUkNVPyFdezJ9KVxcc3sxfSguKikvXG4gICAgICB7dHlwZTogbGluZVsxXSwgcGF0aDogbGluZVsyXX1cblxuICBnZXRGaWx0ZXJLZXk6IC0+ICdwYXRoJ1xuXG4gIGdldEVtcHR5TWVzc2FnZTogLT4gXCJOb3RoaW5nIHRvIGNvbW1pdCwgd29ya2luZyBkaXJlY3RvcnkgY2xlYW4uXCJcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICBoaWRlOiAtPiBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe3R5cGUsIHBhdGh9KSAtPlxuICAgIGdldEljb24gPSAocykgLT5cbiAgICAgIHJldHVybiAnc3RhdHVzLWFkZGVkIGljb24gaWNvbi1kaWZmLWFkZGVkJyBpZiBzWzBdIGlzICdBJ1xuICAgICAgcmV0dXJuICdzdGF0dXMtcmVtb3ZlZCBpY29uIGljb24tZGlmZi1yZW1vdmVkJyBpZiBzWzBdIGlzICdEJ1xuICAgICAgcmV0dXJuICdzdGF0dXMtcmVuYW1lZCBpY29uIGljb24tZGlmZi1yZW5hbWVkJyBpZiBzWzBdIGlzICdSJ1xuICAgICAgcmV0dXJuICdzdGF0dXMtbW9kaWZpZWQgaWNvbiBpY29uLWRpZmYtbW9kaWZpZWQnIGlmIHNbMF0gaXMgJ00nIG9yIHNbMV0gaXMgJ00nXG4gICAgICByZXR1cm4gJydcblxuICAgICQkIC0+XG4gICAgICBAbGkgPT5cbiAgICAgICAgQGRpdlxuICAgICAgICAgIGNsYXNzOiAncHVsbC1yaWdodCBoaWdobGlnaHQnXG4gICAgICAgICAgc3R5bGU6ICd3aGl0ZS1zcGFjZTogcHJlLXdyYXA7IGZvbnQtZmFtaWx5OiBtb25vc3BhY2UnXG4gICAgICAgICAgdHlwZVxuICAgICAgICBAc3BhbiBjbGFzczogZ2V0SWNvbih0eXBlKVxuICAgICAgICBAc3BhbiBwYXRoXG5cbiAgY29uZmlybWVkOiAoe3R5cGUsIHBhdGh9KSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIGlmIHR5cGUgaXMgJz8/J1xuICAgICAgZ2l0LmFkZCBAcmVwbywgZmlsZTogcGF0aFxuICAgIGVsc2VcbiAgICAgIG9wZW5GaWxlID0gY29uZmlybShcIk9wZW4gI3twYXRofT9cIilcbiAgICAgIGZ1bGxQYXRoID0gUGF0aC5qb2luKEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgcGF0aClcblxuICAgICAgZnMuc3RhdCBmdWxsUGF0aCwgKGVyciwgc3RhdCkgPT5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IoZXJyLm1lc3NhZ2UpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpc0RpcmVjdG9yeSA9IHN0YXQ/LmlzRGlyZWN0b3J5KClcbiAgICAgICAgICBpZiBvcGVuRmlsZVxuICAgICAgICAgICAgaWYgaXNEaXJlY3RvcnlcbiAgICAgICAgICAgICAgYXRvbS5vcGVuKHBhdGhzVG9PcGVuOiBmdWxsUGF0aCwgbmV3V2luZG93OiB0cnVlKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZ1bGxQYXRoKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEdpdERpZmYoQHJlcG8sIGZpbGU6IHBhdGgpXG4iXX0=
