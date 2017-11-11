(function() {
  var BranchListView, Path, fs, git, nothingToShow, notifier, prepFile, showFile;

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  BranchListView = require('../views/branch-list-view');

  nothingToShow = 'Nothing to show.';

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

  module.exports = function(repo) {
    var disposable;
    disposable = null;
    return git.cmd(['branch', '--no-color'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new BranchListView(data, function(arg) {
        var args, branchName, name;
        name = arg.name;
        branchName = name;
        args = ['diff', '--stat', repo.branch, name];
        return git.cmd(args, {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          var diffFilePath, diffStat;
          diffStat = data;
          diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
          args = ['diff', '--color=never', repo.branch, name];
          if (atom.config.get('git-plus.diffs.wordDiff')) {
            args.push('--word-diff');
          }
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          }).then(function(data) {
            return prepFile((diffStat != null ? diffStat : '') + data, diffFilePath);
          }).then(function() {
            return showFile(diffFilePath);
          }).then(function(textEditor) {
            return disposable = textEditor.onDidDestroy(function() {
              fs.unlink(diffFilePath);
              return disposable != null ? disposable.dispose() : void 0;
            });
          })["catch"]((function(_this) {
            return function(err) {
              if (err === nothingToShow) {
                return notifier.addInfo(err);
              } else {
                return notifier.addError(err);
              }
            };
          })(this));
        });
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi1icmFuY2hlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsYUFBQSxHQUFnQjs7RUFFaEIsUUFBQSxHQUFXLFNBQUMsUUFBRDtBQUNULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBSDtNQUNFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQjtNQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLFNBQWYsQ0FBQSxDQUEwQixDQUFDLGFBQTNCLENBQUEsQ0FBMkMsQ0FBQSxPQUFBLEdBQVEsY0FBUixDQUEzQyxDQUFBLEVBRkY7O1dBR0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCO0VBSlM7O0VBTVgsUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLFFBQVA7V0FDTCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO01BQ1Ysb0JBQUcsSUFBSSxDQUFFLGdCQUFOLEtBQWdCLENBQW5CO2VBQ0UsTUFBQSxDQUFPLGFBQVAsRUFERjtPQUFBLE1BQUE7ZUFHRSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3QixFQUF5QyxTQUFDLEdBQUQ7VUFDdkMsSUFBRyxHQUFIO21CQUFZLE1BQUEsQ0FBTyxHQUFQLEVBQVo7V0FBQSxNQUFBO21CQUE0QixPQUFBLENBQVEsSUFBUixFQUE1Qjs7UUFEdUMsQ0FBekMsRUFIRjs7SUFEVSxDQUFSO0VBREs7O0VBUVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFEO0FBQ2YsUUFBQTtJQUFBLFVBQUEsR0FBYTtXQUNiLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELEVBQVcsWUFBWCxDQUFSLEVBQWtDO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBbEMsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFBYyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLFNBQUMsR0FBRDtBQUN2QyxZQUFBO1FBRHlDLE9BQUQ7UUFDeEMsVUFBQSxHQUFhO1FBQ2IsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsSUFBSSxDQUFDLE1BQXhCLEVBQWdDLElBQWhDO2VBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO0FBQ0osY0FBQTtVQUFBLFFBQUEsR0FBVztVQUNYLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixvQkFBMUI7VUFDZixJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVMsZUFBVCxFQUEwQixJQUFJLENBQUMsTUFBL0IsRUFBdUMsSUFBdkM7VUFDUCxJQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQTNCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxhQUFWLEVBQUE7O2lCQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDttQkFBVSxRQUFBLENBQVMsb0JBQUMsV0FBVyxFQUFaLENBQUEsR0FBa0IsSUFBM0IsRUFBaUMsWUFBakM7VUFBVixDQUROLENBRUEsQ0FBQyxJQUZELENBRU0sU0FBQTttQkFBRyxRQUFBLENBQVMsWUFBVDtVQUFILENBRk4sQ0FHQSxDQUFDLElBSEQsQ0FHTSxTQUFDLFVBQUQ7bUJBQ0osVUFBQSxHQUFhLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFNBQUE7Y0FDbkMsRUFBRSxDQUFDLE1BQUgsQ0FBVSxZQUFWOzBDQUNBLFVBQVUsQ0FBRSxPQUFaLENBQUE7WUFGbUMsQ0FBeEI7VUFEVCxDQUhOLENBT0EsRUFBQyxLQUFELEVBUEEsQ0FPTyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLEdBQUQ7Y0FDTCxJQUFHLEdBQUEsS0FBTyxhQUFWO3VCQUNFLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCLEVBREY7ZUFBQSxNQUFBO3VCQUdFLFFBQVEsQ0FBQyxRQUFULENBQWtCLEdBQWxCLEVBSEY7O1lBREs7VUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUFA7UUFMSSxDQUROO01BSHVDLENBQXJCO0lBQWQsQ0FETjtFQUZlO0FBdEJqQiIsInNvdXJjZXNDb250ZW50IjpbIlBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvYnJhbmNoLWxpc3Qtdmlldydcblxubm90aGluZ1RvU2hvdyA9ICdOb3RoaW5nIHRvIHNob3cuJ1xuXG5zaG93RmlsZSA9IChmaWxlUGF0aCkgLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgIHNwbGl0RGlyZWN0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLnNwbGl0UGFuZScpXG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZSgpW1wic3BsaXQje3NwbGl0RGlyZWN0aW9ufVwiXSgpXG4gIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG5cbnByZXBGaWxlID0gKHRleHQsIGZpbGVQYXRoKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGlmIHRleHQ/Lmxlbmd0aCBpcyAwXG4gICAgICByZWplY3Qgbm90aGluZ1RvU2hvd1xuICAgIGVsc2VcbiAgICAgIGZzLndyaXRlRmlsZSBmaWxlUGF0aCwgdGV4dCwgZmxhZzogJ3crJywgKGVycikgLT5cbiAgICAgICAgaWYgZXJyIHRoZW4gcmVqZWN0IGVyciBlbHNlIHJlc29sdmUgdHJ1ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBkaXNwb3NhYmxlID0gbnVsbFxuICBnaXQuY21kKFsnYnJhbmNoJywgJy0tbm8tY29sb3InXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgLnRoZW4gKGRhdGEpIC0+IG5ldyBCcmFuY2hMaXN0VmlldyBkYXRhLCAoe25hbWV9KSAtPlxuICAgIGJyYW5jaE5hbWUgPSBuYW1lXG4gICAgYXJncyA9IFsnZGlmZicsICctLXN0YXQnLCByZXBvLmJyYW5jaCwgbmFtZV1cbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBkaWZmU3RhdCA9IGRhdGFcbiAgICAgIGRpZmZGaWxlUGF0aCA9IFBhdGguam9pbihyZXBvLmdldFBhdGgoKSwgXCJhdG9tX2dpdF9wbHVzLmRpZmZcIilcbiAgICAgIGFyZ3MgPSBbJ2RpZmYnLCAnLS1jb2xvcj1uZXZlcicsIHJlcG8uYnJhbmNoLCBuYW1lXVxuICAgICAgYXJncy5wdXNoICctLXdvcmQtZGlmZicgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy53b3JkRGlmZidcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSAtPiBwcmVwRmlsZSgoZGlmZlN0YXQgPyAnJykgKyBkYXRhLCBkaWZmRmlsZVBhdGgpXG4gICAgICAudGhlbiAtPiBzaG93RmlsZSBkaWZmRmlsZVBhdGhcbiAgICAgIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgICAgICBkaXNwb3NhYmxlID0gdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT5cbiAgICAgICAgICBmcy51bmxpbmsgZGlmZkZpbGVQYXRoXG4gICAgICAgICAgZGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgICAuY2F0Y2ggKGVycikgPT5cbiAgICAgICAgaWYgZXJyIGlzIG5vdGhpbmdUb1Nob3dcbiAgICAgICAgICBub3RpZmllci5hZGRJbmZvIGVyclxuICAgICAgICBlbHNlXG4gICAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgZXJyXG4iXX0=
