(function() {
  var OutputViewManager, emptyOrUndefined, getUpstream, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  emptyOrUndefined = function(thing) {
    return thing !== '' && thing !== void 0;
  };

  getUpstream = function(repo) {
    var branch, branchInfo, ref, remote;
    branchInfo = (ref = repo.getUpstreamBranch()) != null ? ref.substring('refs/remotes/'.length).split('/') : void 0;
    if (!branchInfo) {
      return null;
    }
    remote = branchInfo[0];
    branch = branchInfo.slice(1).join('/');
    return [remote, branch];
  };

  module.exports = function(repo, arg) {
    var args, extraArgs, startMessage, upstream, view;
    extraArgs = (arg != null ? arg : {}).extraArgs;
    if (upstream = getUpstream(repo)) {
      if (extraArgs == null) {
        extraArgs = [];
      }
      view = OutputViewManager.create();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(extraArgs).concat(upstream).filter(emptyOrUndefined);
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        view.setContent(data).finish();
        return startMessage.dismiss();
      })["catch"](function(error) {
        view.setContent(error).finish();
        return startMessage.dismiss();
      });
    } else {
      return notifier.addInfo('The current branch is not tracking from upstream');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9fcHVsbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixnQkFBQSxHQUFtQixTQUFDLEtBQUQ7V0FBVyxLQUFBLEtBQVcsRUFBWCxJQUFrQixLQUFBLEtBQVc7RUFBeEM7O0VBRW5CLFdBQUEsR0FBYyxTQUFDLElBQUQ7QUFDWixRQUFBO0lBQUEsVUFBQSxpREFBcUMsQ0FBRSxTQUExQixDQUFvQyxlQUFlLENBQUMsTUFBcEQsQ0FBMkQsQ0FBQyxLQUE1RCxDQUFrRSxHQUFsRTtJQUNiLElBQWUsQ0FBSSxVQUFuQjtBQUFBLGFBQU8sS0FBUDs7SUFDQSxNQUFBLEdBQVMsVUFBVyxDQUFBLENBQUE7SUFDcEIsTUFBQSxHQUFTLFVBQVUsQ0FBQyxLQUFYLENBQWlCLENBQWpCLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsR0FBekI7V0FDVCxDQUFDLE1BQUQsRUFBUyxNQUFUO0VBTFk7O0VBT2QsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsMkJBQUQsTUFBWTtJQUNsQyxJQUFHLFFBQUEsR0FBVyxXQUFBLENBQVksSUFBWixDQUFkOztRQUNFLFlBQWE7O01BQ2IsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE1BQWxCLENBQUE7TUFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUEvQjtNQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxRQUFsQyxDQUEyQyxDQUFDLE1BQTVDLENBQW1ELGdCQUFuRDthQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBZCxFQUErQztRQUFDLEtBQUEsRUFBTyxJQUFSO09BQS9DLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO1FBQ0osSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBO2VBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFNBQUMsS0FBRDtRQUNMLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQXNCLENBQUMsTUFBdkIsQ0FBQTtlQUNBLFlBQVksQ0FBQyxPQUFiLENBQUE7TUFGSyxDQUpQLEVBTEY7S0FBQSxNQUFBO2FBYUUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsa0RBQWpCLEVBYkY7O0VBRGU7QUFiakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5lbXB0eU9yVW5kZWZpbmVkID0gKHRoaW5nKSAtPiB0aGluZyBpc250ICcnIGFuZCB0aGluZyBpc250IHVuZGVmaW5lZFxuXG5nZXRVcHN0cmVhbSA9IChyZXBvKSAtPlxuICBicmFuY2hJbmZvID0gcmVwby5nZXRVcHN0cmVhbUJyYW5jaCgpPy5zdWJzdHJpbmcoJ3JlZnMvcmVtb3Rlcy8nLmxlbmd0aCkuc3BsaXQoJy8nKVxuICByZXR1cm4gbnVsbCBpZiBub3QgYnJhbmNoSW5mb1xuICByZW1vdGUgPSBicmFuY2hJbmZvWzBdXG4gIGJyYW5jaCA9IGJyYW5jaEluZm8uc2xpY2UoMSkuam9pbignLycpXG4gIFtyZW1vdGUsIGJyYW5jaF1cblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge2V4dHJhQXJnc309e30pIC0+XG4gIGlmIHVwc3RyZWFtID0gZ2V0VXBzdHJlYW0ocmVwbylcbiAgICBleHRyYUFyZ3MgPz0gW11cbiAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICBzdGFydE1lc3NhZ2UgPSBub3RpZmllci5hZGRJbmZvIFwiUHVsbGluZy4uLlwiLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGFyZ3MgPSBbJ3B1bGwnXS5jb25jYXQoZXh0cmFBcmdzKS5jb25jYXQodXBzdHJlYW0pLmZpbHRlcihlbXB0eU9yVW5kZWZpbmVkKVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvICdUaGUgY3VycmVudCBicmFuY2ggaXMgbm90IHRyYWNraW5nIGZyb20gdXBzdHJlYW0nXG4iXX0=
