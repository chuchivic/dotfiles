(function() {
  var GitTags, git, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitTags = require('../../lib/models/git-tags');

  describe("GitTags", function() {
    return it("calls git.cmd with 'tag' as an arg", function() {
      spyOn(git, 'cmd').andReturn(Promise.resolve('data'));
      GitTags(repo);
      return expect(git.cmd).toHaveBeenCalledWith(['tag', '-ln'], {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXRhZ3Mtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE9BQUEsR0FBVSxPQUFBLENBQVEsMkJBQVI7O0VBRVYsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtXQUNsQixFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQTtNQUN2QyxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixNQUFoQixDQUE1QjtNQUNBLE9BQUEsQ0FBUSxJQUFSO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUFyQyxFQUFxRDtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXJEO0lBSHVDLENBQXpDO0VBRGtCLENBQXBCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5HaXRUYWdzID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtdGFncydcblxuZGVzY3JpYmUgXCJHaXRUYWdzXCIsIC0+XG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICd0YWcnIGFzIGFuIGFyZ1wiLCAtPlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ2RhdGEnXG4gICAgR2l0VGFncyhyZXBvKVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3RhZycsICctbG4nXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuIl19
