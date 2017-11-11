(function() {
  var BranchListView, GitDiffBranchFiles, git, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitDiffBranchFiles = require('../../lib/models/git-diff-branch-files');

  BranchListView = require('../../lib/views/branch-list-view');

  repo.branch = 'branch';

  describe("GitDiffBranchFiles", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve('foobar'));
    });
    it("gets the branches", function() {
      GitDiffBranchFiles(repo);
      return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color'], {
        cwd: repo.getWorkingDirectory()
      });
    });
    return it("creates a BranchListView", function() {
      var view;
      view = null;
      waitsForPromise(function() {
        return GitDiffBranchFiles(repo).then(function(v) {
          return view = v;
        });
      });
      return runs(function() {
        expect(view instanceof BranchListView).toBe(true);
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 1;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['diff', '--name-status', repo.branch, 'foobar'], {
            cwd: repo.getWorkingDirectory()
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoLWZpbGVzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixrQkFBQSxHQUFxQixPQUFBLENBQVEsd0NBQVI7O0VBQ3JCLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtDQUFSOztFQUVqQixJQUFJLENBQUMsTUFBTCxHQUFjOztFQUVkLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO0lBQzdCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBNUI7SUFEUyxDQUFYO0lBR0EsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUE7TUFDdEIsa0JBQUEsQ0FBbUIsSUFBbkI7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsRUFBVyxZQUFYLENBQXJDLEVBQStEO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBL0Q7SUFGc0IsQ0FBeEI7V0FJQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQTtBQUM3QixVQUFBO01BQUEsSUFBQSxHQUFPO01BQ1AsZUFBQSxDQUFnQixTQUFBO2VBQUcsa0JBQUEsQ0FBbUIsSUFBbkIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixTQUFDLENBQUQ7aUJBQU8sSUFBQSxHQUFPO1FBQWQsQ0FBOUI7TUFBSCxDQUFoQjthQUNBLElBQUEsQ0FBSyxTQUFBO1FBQ0gsTUFBQSxDQUFPLElBQUEsWUFBZ0IsY0FBdkIsQ0FBc0MsQ0FBQyxJQUF2QyxDQUE0QyxJQUE1QztRQUNBLElBQUksQ0FBQyxnQkFBTCxDQUFBO1FBQ0EsUUFBQSxDQUFTLFNBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CO1FBQXZCLENBQVQ7ZUFDQSxJQUFBLENBQUssU0FBQTtpQkFDSCxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxlQUFULEVBQTBCLElBQUksQ0FBQyxNQUEvQixFQUF1QyxRQUF2QyxDQUFyQyxFQUF1RjtZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1dBQXZGO1FBREcsQ0FBTDtNQUpHLENBQUw7SUFINkIsQ0FBL0I7RUFSNkIsQ0FBL0I7QUFQQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdERpZmZCcmFuY2hGaWxlcyA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoLWZpbGVzJ1xuQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvYnJhbmNoLWxpc3QtdmlldydcblxucmVwby5icmFuY2ggPSAnYnJhbmNoJ1xuXG5kZXNjcmliZSBcIkdpdERpZmZCcmFuY2hGaWxlc1wiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnZm9vYmFyJ1xuXG4gIGl0IFwiZ2V0cyB0aGUgYnJhbmNoZXNcIiwgLT5cbiAgICBHaXREaWZmQnJhbmNoRmlsZXMocmVwbylcbiAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydicmFuY2gnLCAnLS1uby1jb2xvciddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgaXQgXCJjcmVhdGVzIGEgQnJhbmNoTGlzdFZpZXdcIiwgLT5cbiAgICB2aWV3ID0gbnVsbFxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXREaWZmQnJhbmNoRmlsZXMocmVwbykudGhlbiAodikgLT4gdmlldyA9IHZcbiAgICBydW5zIC0+XG4gICAgICBleHBlY3QodmlldyBpbnN0YW5jZW9mIEJyYW5jaExpc3RWaWV3KS50b0JlIHRydWVcbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDFcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZGlmZicsICctLW5hbWUtc3RhdHVzJywgcmVwby5icmFuY2gsICdmb29iYXInXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuIl19
