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
        return OutputViewManager.getView().showContent(msg);
      }
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3Rhc2gtc2F2ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTtJQUR1Qix5QkFBRCxNQUFVO0lBQ2hDLEdBQUEsR0FBTSxJQUFJLENBQUMsbUJBQUwsQ0FBQTtJQUNOLElBQUEsR0FBTyxDQUFDLE9BQUQsRUFBVSxNQUFWO0lBQ1AsSUFBc0IsT0FBdEI7TUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBQTs7V0FDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFDLEtBQUEsR0FBRDtLQUFkLEVBQXFCO01BQUEsS0FBQSxFQUFPLElBQVA7S0FBckIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLEdBQUQ7TUFDSixJQUFnRCxHQUFBLEtBQVMsRUFBekQ7ZUFBQSxpQkFBaUIsQ0FBQyxPQUFsQixDQUFBLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsR0FBeEMsRUFBQTs7SUFESSxDQUROLENBR0EsRUFBQyxLQUFELEVBSEEsQ0FHTyxTQUFDLEdBQUQ7YUFDTCxRQUFRLENBQUMsT0FBVCxDQUFpQixHQUFqQjtJQURLLENBSFA7RUFKZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHttZXNzYWdlfT17fSkgLT5cbiAgY3dkID0gcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgYXJncyA9IFsnc3Rhc2gnLCAnc2F2ZSddXG4gIGFyZ3MucHVzaChtZXNzYWdlKSBpZiBtZXNzYWdlXG4gIGdpdC5jbWQoYXJncywge2N3ZH0sIGNvbG9yOiB0cnVlKVxuICAudGhlbiAobXNnKSAtPlxuICAgIE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKS5zaG93Q29udGVudChtc2cpIGlmIG1zZyBpc250ICcnXG4gIC5jYXRjaCAobXNnKSAtPlxuICAgIG5vdGlmaWVyLmFkZEluZm8gbXNnXG4iXX0=
