(function() {
  var ProjectsListView, git, init, notifier;

  git = require('../git');

  ProjectsListView = require('../views/projects-list-view');

  notifier = require('../notifier');

  init = function(path) {
    return git.cmd(['init'], {
      cwd: path
    }).then(function(data) {
      notifier.addSuccess(data);
      return atom.project.setPaths(atom.project.getPaths());
    });
  };

  module.exports = function() {
    var currentFile, ref;
    currentFile = (ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0;
    if (!currentFile && atom.project.getPaths().length > 1) {
      return new ProjectsListView().result.then(function(path) {
        return init(path);
      });
    } else {
      return init(atom.project.getPaths()[0]);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtaW5pdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixnQkFBQSxHQUFtQixPQUFBLENBQVEsNkJBQVI7O0VBQ25CLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxJQUFBLEdBQU8sU0FBQyxJQUFEO1dBQ0wsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLE1BQUQsQ0FBUixFQUFrQjtNQUFBLEdBQUEsRUFBSyxJQUFMO0tBQWxCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO01BQ0osUUFBUSxDQUFDLFVBQVQsQ0FBb0IsSUFBcEI7YUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBc0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBdEI7SUFGSSxDQUROO0VBREs7O0VBTVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxXQUFBLDZEQUFrRCxDQUFFLE9BQXRDLENBQUE7SUFDZCxJQUFHLENBQUksV0FBSixJQUFvQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF1QixDQUFDLE1BQXhCLEdBQWlDLENBQXhEO2FBQ00sSUFBQSxnQkFBQSxDQUFBLENBQWtCLENBQUMsTUFBTSxDQUFDLElBQTFCLENBQStCLFNBQUMsSUFBRDtlQUFVLElBQUEsQ0FBSyxJQUFMO01BQVYsQ0FBL0IsRUFETjtLQUFBLE1BQUE7YUFHRSxJQUFBLENBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFiLENBQUEsQ0FBd0IsQ0FBQSxDQUFBLENBQTdCLEVBSEY7O0VBRmU7QUFWakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5Qcm9qZWN0c0xpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcHJvamVjdHMtbGlzdC12aWV3J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblxuaW5pdCA9IChwYXRoKSAtPlxuICBnaXQuY21kKFsnaW5pdCddLCBjd2Q6IHBhdGgpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgZGF0YVxuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhhdG9tLnByb2plY3QuZ2V0UGF0aHMoKSlcblxubW9kdWxlLmV4cG9ydHMgPSAtPlxuICBjdXJyZW50RmlsZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpXG4gIGlmIG5vdCBjdXJyZW50RmlsZSBhbmQgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID4gMVxuICAgIG5ldyBQcm9qZWN0c0xpc3RWaWV3KCkucmVzdWx0LnRoZW4gKHBhdGgpIC0+IGluaXQocGF0aClcbiAgZWxzZVxuICAgIGluaXQoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0pXG4iXX0=
