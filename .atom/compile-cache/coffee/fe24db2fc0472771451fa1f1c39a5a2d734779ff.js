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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi1icmFuY2hlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsYUFBQSxHQUFnQjs7RUFFaEIsUUFBQSxHQUFXLFNBQUMsUUFBRDtBQUNULFFBQUE7SUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBSDtNQUNFLGNBQUEsR0FBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQjtNQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUErQixDQUFBLE9BQUEsR0FBUSxjQUFSLENBQS9CLENBQUEsRUFGRjs7V0FHQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7RUFKUzs7RUFNWCxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sUUFBUDtXQUNMLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7TUFDVixvQkFBRyxJQUFJLENBQUUsZ0JBQU4sS0FBZ0IsQ0FBbkI7ZUFDRSxNQUFBLENBQU8sYUFBUCxFQURGO09BQUEsTUFBQTtlQUdFLEVBQUUsQ0FBQyxTQUFILENBQWEsUUFBYixFQUF1QixJQUF2QixFQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCLEVBQXlDLFNBQUMsR0FBRDtVQUN2QyxJQUFHLEdBQUg7bUJBQVksTUFBQSxDQUFPLEdBQVAsRUFBWjtXQUFBLE1BQUE7bUJBQTRCLE9BQUEsQ0FBUSxJQUFSLEVBQTVCOztRQUR1QyxDQUF6QyxFQUhGOztJQURVLENBQVI7RUFESzs7RUFRWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsVUFBQSxHQUFhO1dBQ2IsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsRUFBVyxZQUFYLENBQVIsRUFBa0M7TUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtLQUFsQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDthQUFjLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsU0FBQyxHQUFEO0FBQ3ZDLFlBQUE7UUFEeUMsT0FBRDtRQUN4QyxVQUFBLEdBQWE7UUFDYixJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixJQUFJLENBQUMsTUFBeEIsRUFBZ0MsSUFBaEM7ZUFDUCxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7QUFDSixjQUFBO1VBQUEsUUFBQSxHQUFXO1VBQ1gsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLG9CQUExQjtVQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsRUFBUyxlQUFULEVBQTBCLElBQUksQ0FBQyxNQUEvQixFQUF1QyxJQUF2QztVQUNQLElBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBM0I7WUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBQTs7aUJBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7WUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtXQUFkLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO21CQUFVLFFBQUEsQ0FBUyxvQkFBQyxXQUFXLEVBQVosQ0FBQSxHQUFrQixJQUEzQixFQUFpQyxZQUFqQztVQUFWLENBRE4sQ0FFQSxDQUFDLElBRkQsQ0FFTSxTQUFBO21CQUFHLFFBQUEsQ0FBUyxZQUFUO1VBQUgsQ0FGTixDQUdBLENBQUMsSUFIRCxDQUdNLFNBQUMsVUFBRDttQkFDSixVQUFBLEdBQWEsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtjQUNuQyxFQUFFLENBQUMsTUFBSCxDQUFVLFlBQVY7MENBQ0EsVUFBVSxDQUFFLE9BQVosQ0FBQTtZQUZtQyxDQUF4QjtVQURULENBSE4sQ0FPQSxFQUFDLEtBQUQsRUFQQSxDQU9PLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRDtjQUNMLElBQUcsR0FBQSxLQUFPLGFBQVY7dUJBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsRUFERjtlQUFBLE1BQUE7dUJBR0UsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEIsRUFIRjs7WUFESztVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FQUDtRQUxJLENBRE47TUFIdUMsQ0FBckI7SUFBZCxDQUROO0VBRmU7QUF0QmpCIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9icmFuY2gtbGlzdC12aWV3J1xuXG5ub3RoaW5nVG9TaG93ID0gJ05vdGhpbmcgdG8gc2hvdy4nXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcblxucHJlcEZpbGUgPSAodGV4dCwgZmlsZVBhdGgpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgaWYgdGV4dD8ubGVuZ3RoIGlzIDBcbiAgICAgIHJlamVjdCBub3RoaW5nVG9TaG93XG4gICAgZWxzZVxuICAgICAgZnMud3JpdGVGaWxlIGZpbGVQYXRoLCB0ZXh0LCBmbGFnOiAndysnLCAoZXJyKSAtPlxuICAgICAgICBpZiBlcnIgdGhlbiByZWplY3QgZXJyIGVsc2UgcmVzb2x2ZSB0cnVlXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGRpc3Bvc2FibGUgPSBudWxsXG4gIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvciddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT4gbmV3IEJyYW5jaExpc3RWaWV3IGRhdGEsICh7bmFtZX0pIC0+XG4gICAgYnJhbmNoTmFtZSA9IG5hbWVcbiAgICBhcmdzID0gWydkaWZmJywgJy0tc3RhdCcsIHJlcG8uYnJhbmNoLCBuYW1lXVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGRpZmZTdGF0ID0gZGF0YVxuICAgICAgZGlmZkZpbGVQYXRoID0gUGF0aC5qb2luKHJlcG8uZ2V0UGF0aCgpLCBcImF0b21fZ2l0X3BsdXMuZGlmZlwiKVxuICAgICAgYXJncyA9IFsnZGlmZicsICctLWNvbG9yPW5ldmVyJywgcmVwby5icmFuY2gsIG5hbWVdXG4gICAgICBhcmdzLnB1c2ggJy0td29yZC1kaWZmJyBpZiBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLmRpZmZzLndvcmREaWZmJ1xuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKGRhdGEpIC0+IHByZXBGaWxlKChkaWZmU3RhdCA/ICcnKSArIGRhdGEsIGRpZmZGaWxlUGF0aClcbiAgICAgIC50aGVuIC0+IHNob3dGaWxlIGRpZmZGaWxlUGF0aFxuICAgICAgLnRoZW4gKHRleHRFZGl0b3IpIC0+XG4gICAgICAgIGRpc3Bvc2FibGUgPSB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAtPlxuICAgICAgICAgIGZzLnVubGluayBkaWZmRmlsZVBhdGhcbiAgICAgICAgICBkaXNwb3NhYmxlPy5kaXNwb3NlKClcbiAgICAgIC5jYXRjaCAoZXJyKSA9PlxuICAgICAgICBpZiBlcnIgaXMgbm90aGluZ1RvU2hvd1xuICAgICAgICAgIG5vdGlmaWVyLmFkZEluZm8gZXJyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBub3RpZmllci5hZGRFcnJvciBlcnJcbiJdfQ==
