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
      atom.workspace.getActivePane()["split" + splitDirection]();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2RpZmYtYnJhbmNoLWZpbGVzLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzS0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0osc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDakIsT0FBQSxHQUFVLE9BQUEsQ0FBUSxvQkFBUjs7RUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsWUFBQSxHQUFlLE9BQUEsQ0FBUSxxQkFBUjs7RUFFZixXQUFBLEdBQWMsSUFBSTs7RUFFbEIsUUFBQSxHQUFXLFNBQUMsUUFBRDtBQUNULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBSDtNQUNFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQjtNQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUErQixDQUFBLE9BQUEsR0FBUSxjQUFSLENBQS9CLENBQUEsRUFGRjs7V0FHQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7RUFKUzs7RUFNWCxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sUUFBUDtXQUNMLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7TUFDVixvQkFBRyxJQUFJLENBQUUsZ0JBQU4sS0FBZ0IsQ0FBbkI7ZUFDRSxNQUFBLENBQU8sYUFBUCxFQURGO09BQUEsTUFBQTtlQUdFLEVBQUUsQ0FBQyxTQUFILENBQWEsUUFBYixFQUF1QixJQUF2QixFQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCLEVBQXlDLFNBQUMsR0FBRDtVQUN2QyxJQUFHLEdBQUg7bUJBQVksTUFBQSxDQUFPLEdBQVAsRUFBWjtXQUFBLE1BQUE7bUJBQTRCLE9BQUEsQ0FBUSxJQUFSLEVBQTVCOztRQUR1QyxDQUF6QyxFQUhGOztJQURVLENBQVI7RUFESzs7RUFRWCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3NDQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxJQUFSLEVBQWUsVUFBZixFQUE0QixnQkFBNUI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLGFBQUQ7TUFDekIseURBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsSUFBWixDQUFWO01BQ0EsSUFBRyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsS0FBaUIsQ0FBcEI7UUFDRSxRQUFRLENBQUMsT0FBVCxDQUFpQixjQUFBLEdBQWUsSUFBQyxDQUFBLFVBQWhCLEdBQTJCLHNCQUE1QztBQUNBLGVBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUZUOztNQUdBLElBQXdELGdCQUF4RDtRQUFBLElBQUMsQ0FBQSxTQUFELENBQVc7VUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxVQUFOLENBQWlCLGdCQUFqQixDQUFOO1NBQVgsRUFBQTs7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFSVTs7c0NBVVosU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFVBQUE7TUFBQSxpQkFBQSxHQUFvQixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBYyxZQUFkLEVBQTRCLEVBQTVCO01BQ3BCLFVBQUEsR0FBYSxpQkFBaUIsQ0FBQyxLQUFsQixDQUF3QixJQUF4QjtBQUNiO1dBQUEsNENBQUE7O1lBQTRCLDBCQUEwQixDQUFDLElBQTNCLENBQWdDLElBQWhDO1VBQzFCLElBQUcsSUFBQSxLQUFRLEVBQVg7WUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVywwQkFBWDt5QkFDUDtjQUFDLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxDQUFaO2NBQWdCLElBQUEsRUFBTSxJQUFLLENBQUEsQ0FBQSxDQUEzQjtlQUZGO1dBQUEsTUFBQTtpQ0FBQTs7O0FBREY7O0lBSFM7O3NDQVFYLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsaUJBQU07TUFDakIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFWLEVBQXVDLElBQXZDO01BQ1gsT0FBQSxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQixFQUNSO1FBQUEsS0FBQSxFQUFPLE1BQVA7UUFDQSxZQUFBLEVBQWMsS0FEZDtRQUVBLFlBQUEsRUFBYyxJQUZkO1FBR0EsY0FBQSxFQUFnQixLQUhoQjtPQURRO2FBS1YsT0FBTyxDQUFDLElBQVIsQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtpQkFDWCxZQUFZLENBQUMsWUFBYixDQUEwQixLQUFDLENBQUEsSUFBM0IsRUFBaUMsTUFBakMsRUFBeUMsS0FBQyxDQUFBLFVBQTFDO1FBRFc7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWI7SUFSUzs7OztLQW5CeUI7QUEzQnRDIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuU3RhdHVzTGlzdFZpZXcgPSByZXF1aXJlICcuL3N0YXR1cy1saXN0LXZpZXcnXG5HaXREaWZmID0gcmVxdWlyZSAnLi4vbW9kZWxzL2dpdC1kaWZmJ1xuUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5SZXZpc2lvblZpZXcgPSByZXF1aXJlICcuL2dpdC1yZXZpc2lvbi12aWV3J1xuXG5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcblxucHJlcEZpbGUgPSAodGV4dCwgZmlsZVBhdGgpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgaWYgdGV4dD8ubGVuZ3RoIGlzIDBcbiAgICAgIHJlamVjdCBub3RoaW5nVG9TaG93XG4gICAgZWxzZVxuICAgICAgZnMud3JpdGVGaWxlIGZpbGVQYXRoLCB0ZXh0LCBmbGFnOiAndysnLCAoZXJyKSAtPlxuICAgICAgICBpZiBlcnIgdGhlbiByZWplY3QgZXJyIGVsc2UgcmVzb2x2ZSB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIERpZmZCcmFuY2hGaWxlc0xpc3RWaWV3IGV4dGVuZHMgU3RhdHVzTGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwgQGJyYW5jaE5hbWUsIHNlbGVjdGVkRmlsZVBhdGgpIC0+XG4gICAgc3VwZXJcbiAgICBAc2V0SXRlbXMgQHBhcnNlRGF0YSBAZGF0YVxuICAgIGlmIEBpdGVtcy5sZW5ndGggaXMgMFxuICAgICAgbm90aWZpZXIuYWRkSW5mbyhcIlRoZSBicmFuY2ggJyN7QGJyYW5jaE5hbWV9JyBoYXMgbm8gZGlmZmVyZW5jZXNcIilcbiAgICAgIHJldHVybiBAY2FuY2VsKClcbiAgICBAY29uZmlybWVkKHBhdGg6IEByZXBvLnJlbGF0aXZpemUoc2VsZWN0ZWRGaWxlUGF0aCkpIGlmIHNlbGVjdGVkRmlsZVBhdGhcbiAgICBAc2hvdygpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBwYXJzZURhdGE6IChmaWxlcykgLT5cbiAgICB0cmltX2ZpbGVzX3N0cmluZyA9IEBkYXRhLnJlcGxhY2UgL15cXG4rfFxcbiskL2csIFwiXCJcbiAgICBmaWxlc19saXN0ID0gdHJpbV9maWxlc19zdHJpbmcuc3BsaXQoXCJcXG5cIilcbiAgICBmb3IgbGluZSBpbiBmaWxlc19saXN0IHdoZW4gL14oWyBNQURSQ1U/IV17MX0pXFxzKyguKikvLnRlc3QgbGluZVxuICAgICAgaWYgbGluZSAhPSBcIlwiXG4gICAgICAgIGxpbmUgPSBsaW5lLm1hdGNoIC9eKFsgTUFEUkNVPyFdezF9KVxccysoLiopL1xuICAgICAgICB7dHlwZTogbGluZVsxXSwgcGF0aDogbGluZVsyXX1cblxuICBjb25maXJtZWQ6ICh7dHlwZSwgcGF0aH0pIC0+XG4gICAgQGNhbmNlbCgpXG4gICAgZnVsbFBhdGggPSBQYXRoLmpvaW4oQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCBwYXRoKVxuICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuIGZ1bGxQYXRoLFxuICAgICAgc3BsaXQ6IFwibGVmdFwiXG4gICAgICBhY3RpdmF0ZVBhbmU6IGZhbHNlXG4gICAgICBhY3RpdmF0ZUl0ZW06IHRydWVcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiBmYWxzZVxuICAgIHByb21pc2UudGhlbiAoZWRpdG9yKSA9PlxuICAgICAgUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbihAcmVwbywgZWRpdG9yLCBAYnJhbmNoTmFtZSlcbiJdfQ==
