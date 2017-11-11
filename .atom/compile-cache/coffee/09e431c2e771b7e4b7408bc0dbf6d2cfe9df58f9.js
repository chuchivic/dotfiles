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
        return OutputViewManager.getView().showContent(msg);
      }
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3Rhc2gtcG9wLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxpQkFBQSxHQUFvQixPQUFBLENBQVEsd0JBQVI7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLG1CQUFMLENBQUE7V0FDTixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBUixFQUEwQjtNQUFDLEtBQUEsR0FBRDtLQUExQixFQUFpQztNQUFBLEtBQUEsRUFBTyxJQUFQO0tBQWpDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxHQUFEO01BQ0osSUFBZ0QsR0FBQSxLQUFTLEVBQXpEO2VBQUEsaUJBQWlCLENBQUMsT0FBbEIsQ0FBQSxDQUEyQixDQUFDLFdBQTVCLENBQXdDLEdBQXhDLEVBQUE7O0lBREksQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sU0FBQyxHQUFEO2FBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakI7SUFESyxDQUhQO0VBRmU7QUFKakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBnaXQuY21kKFsnc3Rhc2gnLCAncG9wJ10sIHtjd2R9LCBjb2xvcjogdHJ1ZSlcbiAgLnRoZW4gKG1zZykgLT5cbiAgICBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KCkuc2hvd0NvbnRlbnQobXNnKSBpZiBtc2cgaXNudCAnJ1xuICAuY2F0Y2ggKG1zZykgLT5cbiAgICBub3RpZmllci5hZGRJbmZvIG1zZ1xuIl19
