(function() {
  var BranchListView, DiffBranchFilesView, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  BranchListView = require('../views/branch-list-view');

  DiffBranchFilesView = require('../views/diff-branch-files-view');

  module.exports = function(repo, filePath) {
    return git.cmd(['branch', '--no-color'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(branches) {
      return new BranchListView(branches, function(arg) {
        var args, branchName, name;
        name = arg.name;
        branchName = name;
        args = ['diff', '--name-status', repo.branch, branchName];
        return git.cmd(args, {
          cwd: repo.getWorkingDirectory()
        }).then(function(diffData) {
          return new DiffBranchFilesView(repo, diffData, branchName, filePath);
        })["catch"](notifier.addError);
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi1icmFuY2gtZmlsZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDJCQUFSOztFQUNqQixtQkFBQSxHQUFzQixPQUFBLENBQVEsaUNBQVI7O0VBRXRCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLFFBQVA7V0FDZixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLFlBQVgsQ0FBUixFQUFrQztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWxDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxRQUFEO2FBQ0EsSUFBQSxjQUFBLENBQWUsUUFBZixFQUF5QixTQUFDLEdBQUQ7QUFDM0IsWUFBQTtRQUQ2QixPQUFEO1FBQzVCLFVBQUEsR0FBYTtRQUNiLElBQUEsR0FBTyxDQUFDLE1BQUQsRUFBUyxlQUFULEVBQTBCLElBQUksQ0FBQyxNQUEvQixFQUF1QyxVQUF2QztlQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsUUFBRDtpQkFDQSxJQUFBLG1CQUFBLENBQW9CLElBQXBCLEVBQTBCLFFBQTFCLEVBQW9DLFVBQXBDLEVBQWdELFFBQWhEO1FBREEsQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sUUFBUSxDQUFDLFFBSGhCO01BSDJCLENBQXpCO0lBREEsQ0FETjtFQURlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvYnJhbmNoLWxpc3QtdmlldydcbkRpZmZCcmFuY2hGaWxlc1ZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9kaWZmLWJyYW5jaC1maWxlcy12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCBmaWxlUGF0aCkgLT5cbiAgZ2l0LmNtZChbJ2JyYW5jaCcsICctLW5vLWNvbG9yJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChicmFuY2hlcykgLT5cbiAgICBuZXcgQnJhbmNoTGlzdFZpZXcgYnJhbmNoZXMsICh7bmFtZX0pIC0+XG4gICAgICBicmFuY2hOYW1lID0gbmFtZVxuICAgICAgYXJncyA9IFsnZGlmZicsICctLW5hbWUtc3RhdHVzJywgcmVwby5icmFuY2gsIGJyYW5jaE5hbWVdXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGlmZkRhdGEpIC0+XG4gICAgICAgIG5ldyBEaWZmQnJhbmNoRmlsZXNWaWV3KHJlcG8sIGRpZmZEYXRhLCBicmFuY2hOYW1lLCBmaWxlUGF0aClcbiAgICAgIC5jYXRjaCBub3RpZmllci5hZGRFcnJvclxuIl19
