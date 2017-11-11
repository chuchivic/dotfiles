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
      view = OutputViewManager.getView();
      startMessage = notifier.addInfo("Pulling...", {
        dismissable: true
      });
      args = ['pull'].concat(extraArgs).concat(upstream).filter(emptyOrUndefined);
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        view.showContent(data);
        return startMessage.dismiss();
      })["catch"](function(error) {
        view.showContent(error);
        return startMessage.dismiss();
      });
    } else {
      return notifier.addInfo('The current branch is not tracking from upstream');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9fcHVsbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixnQkFBQSxHQUFtQixTQUFDLEtBQUQ7V0FBVyxLQUFBLEtBQVcsRUFBWCxJQUFrQixLQUFBLEtBQVc7RUFBeEM7O0VBRW5CLFdBQUEsR0FBYyxTQUFDLElBQUQ7QUFDWixRQUFBO0lBQUEsVUFBQSxpREFBcUMsQ0FBRSxTQUExQixDQUFvQyxlQUFlLENBQUMsTUFBcEQsQ0FBMkQsQ0FBQyxLQUE1RCxDQUFrRSxHQUFsRTtJQUNiLElBQWUsQ0FBSSxVQUFuQjtBQUFBLGFBQU8sS0FBUDs7SUFDQSxNQUFBLEdBQVMsVUFBVyxDQUFBLENBQUE7SUFDcEIsTUFBQSxHQUFTLFVBQVUsQ0FBQyxLQUFYLENBQWlCLENBQWpCLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsR0FBekI7V0FDVCxDQUFDLE1BQUQsRUFBUyxNQUFUO0VBTFk7O0VBT2QsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsMkJBQUQsTUFBWTtJQUNsQyxJQUFHLFFBQUEsR0FBVyxXQUFBLENBQVksSUFBWixDQUFkOztRQUNFLFlBQWE7O01BQ2IsSUFBQSxHQUFPLGlCQUFpQixDQUFDLE9BQWxCLENBQUE7TUFDUCxZQUFBLEdBQWUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsWUFBakIsRUFBK0I7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUEvQjtNQUNmLElBQUEsR0FBTyxDQUFDLE1BQUQsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBQyxNQUEzQixDQUFrQyxRQUFsQyxDQUEyQyxDQUFDLE1BQTVDLENBQW1ELGdCQUFuRDthQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBZCxFQUErQztRQUFDLEtBQUEsRUFBTyxJQUFSO09BQS9DLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO1FBQ0osSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakI7ZUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO01BRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO1FBQ0wsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakI7ZUFDQSxZQUFZLENBQUMsT0FBYixDQUFBO01BRkssQ0FKUCxFQUxGO0tBQUEsTUFBQTthQWFFLFFBQVEsQ0FBQyxPQUFULENBQWlCLGtEQUFqQixFQWJGOztFQURlO0FBYmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblxuZW1wdHlPclVuZGVmaW5lZCA9ICh0aGluZykgLT4gdGhpbmcgaXNudCAnJyBhbmQgdGhpbmcgaXNudCB1bmRlZmluZWRcblxuZ2V0VXBzdHJlYW0gPSAocmVwbykgLT5cbiAgYnJhbmNoSW5mbyA9IHJlcG8uZ2V0VXBzdHJlYW1CcmFuY2goKT8uc3Vic3RyaW5nKCdyZWZzL3JlbW90ZXMvJy5sZW5ndGgpLnNwbGl0KCcvJylcbiAgcmV0dXJuIG51bGwgaWYgbm90IGJyYW5jaEluZm9cbiAgcmVtb3RlID0gYnJhbmNoSW5mb1swXVxuICBicmFuY2ggPSBicmFuY2hJbmZvLnNsaWNlKDEpLmpvaW4oJy8nKVxuICBbcmVtb3RlLCBicmFuY2hdXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtleHRyYUFyZ3N9PXt9KSAtPlxuICBpZiB1cHN0cmVhbSA9IGdldFVwc3RyZWFtKHJlcG8pXG4gICAgZXh0cmFBcmdzID89IFtdXG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKVxuICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdWxsaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgYXJncyA9IFsncHVsbCddLmNvbmNhdChleHRyYUFyZ3MpLmNvbmNhdCh1cHN0cmVhbSkuZmlsdGVyKGVtcHR5T3JVbmRlZmluZWQpXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgdmlldy5zaG93Q29udGVudChkYXRhKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICB2aWV3LnNob3dDb250ZW50KGVycm9yKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICBlbHNlXG4gICAgbm90aWZpZXIuYWRkSW5mbyAnVGhlIGN1cnJlbnQgYnJhbmNoIGlzIG5vdCB0cmFja2luZyBmcm9tIHVwc3RyZWFtJ1xuIl19
