(function() {
  var $$, CompositeDisposable, DiffBranchFilesListView, GitDiff, Path, RevisionView, SelectListView, StatusListView, disposables, fs, git, notifier, prepFile, ref, showFile,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  StatusListView = require('./status-list-view');

  GitDiff = require('../models/git-diff');

  Path = require('path');

  RevisionView = require('./git-revision-view');

  disposables = new CompositeDisposable;

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.general.openInPane')) {
      splitDirection = atom.config.get('git-plus.general.splitPane');
      atom.workspace.getCenter().getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  prepFile = function(text, filePath) {
    return new Promise(function(resolve, reject) {
      if ((text != null ? text.length : void 0) === 0) {
        return reject(nothingToShow);
      } else {
        return fs.writeFile(filePath, text, {
          flag: 'w+'
        }, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      }
    });
  };

  module.exports = DiffBranchFilesListView = (function(superClass) {
    extend(DiffBranchFilesListView, superClass);

    function DiffBranchFilesListView() {
      return DiffBranchFilesListView.__super__.constructor.apply(this, arguments);
    }

    DiffBranchFilesListView.prototype.initialize = function(repo, data, branchName, selectedFilePath) {
      this.repo = repo;
      this.data = data;
      this.branchName = branchName;
      DiffBranchFilesListView.__super__.initialize.apply(this, arguments);
      this.setItems(this.parseData(this.data));
      if (this.items.length === 0) {
        notifier.addInfo("The branch '" + this.branchName + "' has no differences");
        return this.cancel();
      }
      if (selectedFilePath) {
        this.confirmed({
          path: this.repo.relativize(selectedFilePath)
        });
      }
      this.show();
      return this.focusFilterEditor();
    };

    DiffBranchFilesListView.prototype.parseData = function(files) {
      var files_list, i, len, line, results, trim_files_string;
      trim_files_string = this.data.replace(/^\n+|\n+$/g, "");
      files_list = trim_files_string.split("\n");
      results = [];
      for (i = 0, len = files_list.length; i < len; i++) {
        line = files_list[i];
        if (/^([ MADRCU?!]{1})\s+(.*)/.test(line)) {
          if (line !== "") {
            line = line.match(/^([ MADRCU?!]{1})\s+(.*)/);
            results.push({
              type: line[1],
              path: line[2]
            });
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    DiffBranchFilesListView.prototype.confirmed = function(arg) {
      var fullPath, path, promise, type;
      type = arg.type, path = arg.path;
      this.cancel();
      fullPath = Path.join(this.repo.getWorkingDirectory(), path);
      promise = atom.workspace.open(fullPath, {
        split: "left",
        activatePane: false,
        activateItem: true,
        searchAllPanes: false
      });
      return promise.then((function(_this) {
        return function(editor) {
          return RevisionView.showRevision(_this.repo, editor, _this.branchName);
        };
      })(this));
    };

    return DiffBranchFilesListView;

  })(StatusListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2RpZmYtYnJhbmNoLWZpbGVzLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzS0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0osc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDakIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxvQkFBUjs7RUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsWUFBQSxHQUFlLE9BQUEsQ0FBUSxxQkFBUjs7RUFFZixXQUFBLEdBQWMsSUFBSTs7RUFFbEIsUUFBQSxHQUFXLFNBQUMsUUFBRDtBQUNULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBSDtNQUNFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQjtNQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBQSxDQUEwQixDQUFDLGFBQTNCLENBQUEsQ0FBMkMsQ0FBQSxPQUFBLEdBQVEsY0FBUixDQUEzQyxDQUFBLEVBRkY7O1dBR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCO0VBSlM7O0VBTVgsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLFFBQVA7V0FDTCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO01BQ1Ysb0JBQUcsSUFBSSxDQUFFLGdCQUFOLEtBQWdCLENBQW5CO2VBQ0UsTUFBQSxDQUFPLGFBQVAsRUFERjtPQUFBLE1BQUE7ZUFHRSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QixFQUF5QyxTQUFDLEdBQUQ7VUFDdkMsSUFBRyxHQUFIO21CQUFZLE1BQUEsQ0FBTyxHQUFQLEVBQVo7V0FBQSxNQUFBO21CQUE0QixPQUFBLENBQVEsSUFBUixFQUE1Qjs7UUFEdUMsQ0FBekMsRUFIRjs7SUFEVSxDQUFSO0VBREs7O0VBUVgsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztzQ0FDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsSUFBUixFQUFlLFVBQWYsRUFBNEIsZ0JBQTVCO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxhQUFEO01BQ3pCLHlEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLElBQVosQ0FBVjtNQUNBLElBQUcsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLEtBQWlCLENBQXBCO1FBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsY0FBQSxHQUFlLElBQUMsQ0FBQSxVQUFoQixHQUEyQixzQkFBNUM7QUFDQSxlQUFPLElBQUMsQ0FBQSxNQUFELENBQUEsRUFGVDs7TUFHQSxJQUF3RCxnQkFBeEQ7UUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXO1VBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxJQUFJLENBQUMsVUFBTixDQUFpQixnQkFBakIsQ0FBTjtTQUFYLEVBQUE7O01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUlU7O3NDQVVaLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxVQUFBO01BQUEsaUJBQUEsR0FBb0IsSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQWMsWUFBZCxFQUE0QixFQUE1QjtNQUNwQixVQUFBLEdBQWEsaUJBQWlCLENBQUMsS0FBbEIsQ0FBd0IsSUFBeEI7QUFDYjtXQUFBLDRDQUFBOztZQUE0QiwwQkFBMEIsQ0FBQyxJQUEzQixDQUFnQyxJQUFoQztVQUMxQixJQUFHLElBQUEsS0FBUSxFQUFYO1lBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsMEJBQVg7eUJBQ1A7Y0FBQyxJQUFBLEVBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWjtjQUFnQixJQUFBLEVBQU0sSUFBSyxDQUFBLENBQUEsQ0FBM0I7ZUFGRjtXQUFBLE1BQUE7aUNBQUE7OztBQURGOztJQUhTOztzQ0FRWCxTQUFBLEdBQVcsU0FBQyxHQUFEO0FBQ1QsVUFBQTtNQURXLGlCQUFNO01BQ2pCLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBVixFQUF1QyxJQUF2QztNQUNYLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEIsRUFDUjtRQUFBLEtBQUEsRUFBTyxNQUFQO1FBQ0EsWUFBQSxFQUFjLEtBRGQ7UUFFQSxZQUFBLEVBQWMsSUFGZDtRQUdBLGNBQUEsRUFBZ0IsS0FIaEI7T0FEUTthQUtWLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQ1gsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsS0FBQyxDQUFBLElBQTNCLEVBQWlDLE1BQWpDLEVBQXlDLEtBQUMsQ0FBQSxVQUExQztRQURXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiO0lBUlM7Ozs7S0FuQnlCO0FBM0J0QyIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblN0YXR1c0xpc3RWaWV3ID0gcmVxdWlyZSAnLi9zdGF0dXMtbGlzdC12aWV3J1xuR2l0RGlmZiA9IHJlcXVpcmUgJy4uL21vZGVscy9naXQtZGlmZidcblBhdGggPSByZXF1aXJlICdwYXRoJ1xuUmV2aXNpb25WaWV3ID0gcmVxdWlyZSAnLi9naXQtcmV2aXNpb24tdmlldydcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG5zaG93RmlsZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgIHNwbGl0RGlyZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLnNwbGl0UGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG5cbnByZXBGaWxlID0gKHRleHQsIGZpbGVQYXRoKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGlmIHRleHQ/Lmxlbmd0aCBpcyAwXG4gICAgICByZWplY3Qgbm90aGluZ1RvU2hvd1xuICAgIGVsc2VcbiAgICAgIGZzLndyaXRlRmlsZSBmaWxlUGF0aCwgdGV4dCwgZmxhZzogJ3crJywgKGVycikgLT5cbiAgICAgICAgaWYgZXJyIHRoZW4gcmVqZWN0IGVyciBlbHNlIHJlc29sdmUgdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBEaWZmQnJhbmNoRmlsZXNMaXN0VmlldyBleHRlbmRzIFN0YXR1c0xpc3RWaWV3XG4gIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIEBicmFuY2hOYW1lLCBzZWxlY3RlZEZpbGVQYXRoKSAtPlxuICAgIHN1cGVyXG4gICAgQHNldEl0ZW1zIEBwYXJzZURhdGEgQGRhdGFcbiAgICBpZiBAaXRlbXMubGVuZ3RoIGlzIDBcbiAgICAgIG5vdGlmaWVyLmFkZEluZm8oXCJUaGUgYnJhbmNoICcje0BicmFuY2hOYW1lfScgaGFzIG5vIGRpZmZlcmVuY2VzXCIpXG4gICAgICByZXR1cm4gQGNhbmNlbCgpXG4gICAgQGNvbmZpcm1lZChwYXRoOiBAcmVwby5yZWxhdGl2aXplKHNlbGVjdGVkRmlsZVBhdGgpKSBpZiBzZWxlY3RlZEZpbGVQYXRoXG4gICAgQHNob3coKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgcGFyc2VEYXRhOiAoZmlsZXMpIC0+XG4gICAgdHJpbV9maWxlc19zdHJpbmcgPSBAZGF0YS5yZXBsYWNlIC9eXFxuK3xcXG4rJC9nLCBcIlwiXG4gICAgZmlsZXNfbGlzdCA9IHRyaW1fZmlsZXNfc3RyaW5nLnNwbGl0KFwiXFxuXCIpXG4gICAgZm9yIGxpbmUgaW4gZmlsZXNfbGlzdCB3aGVuIC9eKFsgTUFEUkNVPyFdezF9KVxccysoLiopLy50ZXN0IGxpbmVcbiAgICAgIGlmIGxpbmUgIT0gXCJcIlxuICAgICAgICBsaW5lID0gbGluZS5tYXRjaCAvXihbIE1BRFJDVT8hXXsxfSlcXHMrKC4qKS9cbiAgICAgICAge3R5cGU6IGxpbmVbMV0sIHBhdGg6IGxpbmVbMl19XG5cbiAgY29uZmlybWVkOiAoe3R5cGUsIHBhdGh9KSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIGZ1bGxQYXRoID0gUGF0aC5qb2luKEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwgcGF0aClcbiAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbiBmdWxsUGF0aCxcbiAgICAgIHNwbGl0OiBcImxlZnRcIlxuICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZVxuICAgICAgYWN0aXZhdGVJdGVtOiB0cnVlXG4gICAgICBzZWFyY2hBbGxQYW5lczogZmFsc2VcbiAgICBwcm9taXNlLnRoZW4gKGVkaXRvcikgPT5cbiAgICAgIFJldmlzaW9uVmlldy5zaG93UmV2aXNpb24oQHJlcG8sIGVkaXRvciwgQGJyYW5jaE5hbWUpXG4iXX0=
