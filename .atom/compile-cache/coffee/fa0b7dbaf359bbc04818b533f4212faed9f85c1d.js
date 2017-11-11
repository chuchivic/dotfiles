(function() {
  var OutputViewManager, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = function(repo, arg) {
    var args, cwd, message;
    message = (arg != null ? arg : {}).message;
    cwd = repo.getWorkingDirectory();
    args = ['stash', 'save'];
    if (message) {
      args.push(message);
    }
    return git.cmd(args, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3Rhc2gtc2F2ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1Qix5QkFBRCxNQUFVO0lBQ2hDLEdBQUEsR0FBTSxJQUFJLENBQUMsbUJBQUwsQ0FBQTtJQUNOLElBQUEsR0FBTyxDQUFDLE9BQUQsRUFBVSxNQUFWO0lBQ1AsSUFBc0IsT0FBdEI7TUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBQTs7V0FDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFDLEtBQUEsR0FBRDtLQUFkLEVBQXFCO01BQUEsS0FBQSxFQUFPLElBQVA7S0FBckIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLEdBQUQ7TUFDSixJQUF1RCxHQUFBLEtBQVMsRUFBaEU7ZUFBQSxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBLENBQTBCLENBQUMsVUFBM0IsQ0FBc0MsR0FBdEMsQ0FBMEMsQ0FBQyxNQUEzQyxDQUFBLEVBQUE7O0lBREksQ0FETixDQUdBLEVBQUMsS0FBRCxFQUhBLENBR08sU0FBQyxHQUFEO2FBQ0wsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakI7SUFESyxDQUhQO0VBSmU7QUFKakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7bWVzc2FnZX09e30pIC0+XG4gIGN3ZCA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gIGFyZ3MgPSBbJ3N0YXNoJywgJ3NhdmUnXVxuICBhcmdzLnB1c2gobWVzc2FnZSkgaWYgbWVzc2FnZVxuICBnaXQuY21kKGFyZ3MsIHtjd2R9LCBjb2xvcjogdHJ1ZSlcbiAgLnRoZW4gKG1zZykgLT5cbiAgICBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKS5zZXRDb250ZW50KG1zZykuZmluaXNoKCkgaWYgbXNnIGlzbnQgJydcbiAgLmNhdGNoIChtc2cpIC0+XG4gICAgbm90aWZpZXIuYWRkSW5mbyBtc2dcbiJdfQ==
