(function() {
  var git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  module.exports = function(repo, arg) {
    var file;
    file = arg.file;
    return git.cmd(['checkout', '--', file], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      notifier.addSuccess('File changes checked out successfully');
      return git.refresh(repo);
    })["catch"](function(error) {
      return notifier.addError(error);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY2hlY2tvdXQtZmlsZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsT0FBRDtXQUN0QixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBUixFQUFrQztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWxDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO01BQ0osUUFBUSxDQUFDLFVBQVQsQ0FBb0IsdUNBQXBCO2FBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFaO0lBRkksQ0FETixDQUlBLEVBQUMsS0FBRCxFQUpBLENBSU8sU0FBQyxLQUFEO2FBQ0wsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsS0FBbEI7SUFESyxDQUpQO0VBRGU7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZmlsZX0pIC0+XG4gIGdpdC5jbWQoWydjaGVja291dCcsICctLScsIGZpbGVdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBub3RpZmllci5hZGRTdWNjZXNzICdGaWxlIGNoYW5nZXMgY2hlY2tlZCBvdXQgc3VjY2Vzc2Z1bGx5J1xuICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgLmNhdGNoIChlcnJvcikgLT5cbiAgICBub3RpZmllci5hZGRFcnJvciBlcnJvclxuIl19
