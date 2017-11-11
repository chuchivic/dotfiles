(function() {
  var git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  module.exports = function(repo) {
    return git.cmd(['checkout', '-f'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      notifier.addSuccess("File changes checked out successfully!");
      return git.refresh(repo);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY2hlY2tvdXQtYWxsLWZpbGVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsVUFBRCxFQUFhLElBQWIsQ0FBUixFQUE0QjtNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQTVCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO01BQ0osUUFBUSxDQUFDLFVBQVQsQ0FBb0Isd0NBQXBCO2FBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFaO0lBRkksQ0FETjtFQURlO0FBSGpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgZ2l0LmNtZChbJ2NoZWNrb3V0JywgJy1mJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgXCJGaWxlIGNoYW5nZXMgY2hlY2tlZCBvdXQgc3VjY2Vzc2Z1bGx5IVwiXG4gICAgZ2l0LnJlZnJlc2ggcmVwb1xuIl19
