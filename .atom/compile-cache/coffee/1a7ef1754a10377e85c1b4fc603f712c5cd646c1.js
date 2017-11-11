(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo) {
    var cwd;
    cwd = repo.getWorkingDirectory();
    return git.cmd(['stash', 'pop'], {
      cwd: cwd
    }, {
      color: true
    }).then(function(msg) {
      if (msg !== '') {
        return OutputViewManager.create().setContent(msg).finish();
      }
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3Rhc2gtcG9wLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLG1CQUFMLENBQUE7V0FDTixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBUixFQUEwQjtNQUFDLEtBQUEsR0FBRDtLQUExQixFQUFpQztNQUFBLEtBQUEsRUFBTyxJQUFQO0tBQWpDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxHQUFEO01BQ0osSUFBdUQsR0FBQSxLQUFTLEVBQWhFO2VBQUEsaUJBQWlCLENBQUMsTUFBbEIsQ0FBQSxDQUEwQixDQUFDLFVBQTNCLENBQXNDLEdBQXRDLENBQTBDLENBQUMsTUFBM0MsQ0FBQSxFQUFBOztJQURJLENBRE4sQ0FHQSxFQUFDLEtBQUQsRUFIQSxDQUdPLFNBQUMsR0FBRDthQUNMLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCO0lBREssQ0FIUDtFQUZlO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgY3dkID0gcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgZ2l0LmNtZChbJ3N0YXNoJywgJ3BvcCddLCB7Y3dkfSwgY29sb3I6IHRydWUpXG4gIC50aGVuIChtc2cpIC0+XG4gICAgT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKCkuc2V0Q29udGVudChtc2cpLmZpbmlzaCgpIGlmIG1zZyBpc250ICcnXG4gIC5jYXRjaCAobXNnKSAtPlxuICAgIG5vdGlmaWVyLmFkZEluZm8gbXNnXG4iXX0=
