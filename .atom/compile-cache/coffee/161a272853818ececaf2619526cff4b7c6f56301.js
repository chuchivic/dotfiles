(function() {
  var GitFetchAll, git, repo;

  git = require('../../lib/git');

  GitFetchAll = require('../../lib/models/git-fetch-all');

  repo = require('../fixtures').repo;

  describe("GitFetchAll", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve());
    });
    it("runs `git fetch --all` for each repo passed to it", function() {
      var repo2, repos;
      repo2 = Object.create(repo);
      repo2.getWorkingDirectory = function() {
        return 'repo2';
      };
      repos = [repo, repo2];
      GitFetchAll(repos);
      return repos.forEach(function(r) {
        return expect(git.cmd).toHaveBeenCalledWith(['fetch', '--all'], {
          cwd: r.getWorkingDirectory()
        });
      });
    });
    return it('shows a notification if the configuration to show notifications is true', function() {
      var addSuccess;
      spyOn(atom.config, 'get').andReturn(true);
      addSuccess = spyOn(atom.notifications, 'addSuccess');
      return GitFetchAll([repo])[0].then(function() {
        return expect(addSuccess).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWZldGNoLWFsbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0NBQVI7O0VBQ2IsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFFVCxRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO0lBQ3RCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUE1QjtJQURTLENBQVg7SUFHQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQTtBQUN0RCxVQUFBO01BQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZDtNQUNSLEtBQUssQ0FBQyxtQkFBTixHQUE0QixTQUFBO2VBQUc7TUFBSDtNQUM1QixLQUFBLEdBQVEsQ0FBQyxJQUFELEVBQU8sS0FBUDtNQUNSLFdBQUEsQ0FBWSxLQUFaO2FBQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLENBQUQ7ZUFDWixNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxPQUFWLENBQXJDLEVBQXlEO1VBQUEsR0FBQSxFQUFLLENBQUMsQ0FBQyxtQkFBRixDQUFBLENBQUw7U0FBekQ7TUFEWSxDQUFkO0lBTHNELENBQXhEO1dBUUEsRUFBQSxDQUFHLHlFQUFILEVBQThFLFNBQUE7QUFDNUUsVUFBQTtNQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsTUFBWCxFQUFtQixLQUFuQixDQUF5QixDQUFDLFNBQTFCLENBQW9DLElBQXBDO01BQ0EsVUFBQSxHQUFhLEtBQUEsQ0FBTSxJQUFJLENBQUMsYUFBWCxFQUEwQixZQUExQjthQUNiLFdBQUEsQ0FBWSxDQUFDLElBQUQsQ0FBWixDQUFvQixDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXZCLENBQTRCLFNBQUE7ZUFDMUIsTUFBQSxDQUFPLFVBQVAsQ0FBa0IsQ0FBQyxnQkFBbkIsQ0FBQTtNQUQwQixDQUE1QjtJQUg0RSxDQUE5RTtFQVpzQixDQUF4QjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdEZldGNoQWxsID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtZmV0Y2gtYWxsJ1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5cbmRlc2NyaWJlIFwiR2l0RmV0Y2hBbGxcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXG4gIGl0IFwicnVucyBgZ2l0IGZldGNoIC0tYWxsYCBmb3IgZWFjaCByZXBvIHBhc3NlZCB0byBpdFwiLCAtPlxuICAgIHJlcG8yID0gT2JqZWN0LmNyZWF0ZShyZXBvKVxuICAgIHJlcG8yLmdldFdvcmtpbmdEaXJlY3RvcnkgPSAtPiAncmVwbzInXG4gICAgcmVwb3MgPSBbcmVwbywgcmVwbzJdXG4gICAgR2l0RmV0Y2hBbGwocmVwb3MpXG4gICAgcmVwb3MuZm9yRWFjaCAocikgLT5cbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2ZldGNoJywgJy0tYWxsJ10sIGN3ZDogci5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBpdCAnc2hvd3MgYSBub3RpZmljYXRpb24gaWYgdGhlIGNvbmZpZ3VyYXRpb24gdG8gc2hvdyBub3RpZmljYXRpb25zIGlzIHRydWUnLCAtPlxuICAgIHNweU9uKGF0b20uY29uZmlnLCAnZ2V0JykuYW5kUmV0dXJuIHRydWVcbiAgICBhZGRTdWNjZXNzID0gc3B5T24oYXRvbS5ub3RpZmljYXRpb25zLCAnYWRkU3VjY2VzcycpXG4gICAgR2l0RmV0Y2hBbGwoW3JlcG9dKVswXS50aGVuIC0+XG4gICAgICBleHBlY3QoYWRkU3VjY2VzcykudG9IYXZlQmVlbkNhbGxlZCgpXG4iXX0=
