(function() {
  var BranchListView, GitDiffBranches, branches, git, quibble, repo;

  quibble = require('quibble');

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitDiffBranches = require('../../lib/models/git-diff-branches');

  BranchListView = require('../../lib/views/branch-list-view');

  repo.branch = 'master';

  branches = 'foobar';

  describe("GitDiffBranches", function() {
    beforeEach(function() {
      spyOn(git, 'cmd').andReturn(Promise.resolve(branches));
      return spyOn(atom.workspace, 'open');
    });
    it("gets the branches", function() {
      GitDiffBranches(repo);
      return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color'], {
        cwd: repo.getWorkingDirectory()
      });
    });
    return it("creates a BranchListView with a callback to do the diffing when a branch is selected", function() {
      var view;
      view = null;
      waitsForPromise(function() {
        return GitDiffBranches(repo).then(function(v) {
          return view = v;
        });
      });
      return runs(function() {
        expect(view instanceof BranchListView).toBe(true);
        view.confirmSelection();
        waitsFor(function() {
          return atom.workspace.open.callCount > 0;
        });
        return runs(function() {
          expect(git.cmd).toHaveBeenCalledWith(['diff', '--stat', repo.branch, 'foobar'], {
            cwd: repo.getWorkingDirectory()
          });
          return expect(atom.workspace.open).toHaveBeenCalledWith(repo.getPath() + '/atom_git_plus.diff');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoZXMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVCxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxvQ0FBUjs7RUFDbEIsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVI7O0VBRWpCLElBQUksQ0FBQyxNQUFMLEdBQWM7O0VBQ2QsUUFBQSxHQUFXOztFQUVYLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO0lBQzFCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBNUI7YUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsTUFBdEI7SUFGUyxDQUFYO0lBSUEsRUFBQSxDQUFHLG1CQUFILEVBQXdCLFNBQUE7TUFDdEIsZUFBQSxDQUFnQixJQUFoQjthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsUUFBRCxFQUFXLFlBQVgsQ0FBckMsRUFBK0Q7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUEvRDtJQUZzQixDQUF4QjtXQUlBLEVBQUEsQ0FBRyxzRkFBSCxFQUEyRixTQUFBO0FBQ3pGLFVBQUE7TUFBQSxJQUFBLEdBQU87TUFDUCxlQUFBLENBQWdCLFNBQUE7ZUFBRyxlQUFBLENBQWdCLElBQWhCLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxDQUFEO2lCQUFPLElBQUEsR0FBTztRQUFkLENBQTNCO01BQUgsQ0FBaEI7YUFDQSxJQUFBLENBQUssU0FBQTtRQUNILE1BQUEsQ0FBTyxJQUFBLFlBQWdCLGNBQXZCLENBQXNDLENBQUMsSUFBdkMsQ0FBNEMsSUFBNUM7UUFDQSxJQUFJLENBQUMsZ0JBQUwsQ0FBQTtRQUNBLFFBQUEsQ0FBUyxTQUFBO2lCQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQXBCLEdBQWdDO1FBQW5DLENBQVQ7ZUFDQSxJQUFBLENBQUssU0FBQTtVQUNILE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsSUFBSSxDQUFDLE1BQXhCLEVBQWdDLFFBQWhDLENBQXJDLEVBQWdGO1lBQUMsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQU47V0FBaEY7aUJBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQyxvQkFBNUIsQ0FBaUQsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFBLEdBQWlCLHFCQUFsRTtRQUZHLENBQUw7TUFKRyxDQUFMO0lBSHlGLENBQTNGO0VBVDBCLENBQTVCO0FBVEEiLCJzb3VyY2VzQ29udGVudCI6WyJxdWliYmxlID0gcmVxdWlyZSAncXVpYmJsZSdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdERpZmZCcmFuY2hlcyA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoZXMnXG5CcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9icmFuY2gtbGlzdC12aWV3J1xuXG5yZXBvLmJyYW5jaCA9ICdtYXN0ZXInXG5icmFuY2hlcyA9ICdmb29iYXInXG5cbmRlc2NyaWJlIFwiR2l0RGlmZkJyYW5jaGVzXCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGJyYW5jaGVzKVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG5cbiAgaXQgXCJnZXRzIHRoZSBicmFuY2hlc1wiLCAtPlxuICAgIEdpdERpZmZCcmFuY2hlcyhyZXBvKVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2JyYW5jaCcsICctLW5vLWNvbG9yJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBpdCBcImNyZWF0ZXMgYSBCcmFuY2hMaXN0VmlldyB3aXRoIGEgY2FsbGJhY2sgdG8gZG8gdGhlIGRpZmZpbmcgd2hlbiBhIGJyYW5jaCBpcyBzZWxlY3RlZFwiLCAtPlxuICAgIHZpZXcgPSBudWxsXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdERpZmZCcmFuY2hlcyhyZXBvKS50aGVuICh2KSAtPiB2aWV3ID0gdlxuICAgIHJ1bnMgLT5cbiAgICAgIGV4cGVjdCh2aWV3IGluc3RhbmNlb2YgQnJhbmNoTGlzdFZpZXcpLnRvQmUgdHJ1ZVxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgIHdhaXRzRm9yIC0+IGF0b20ud29ya3NwYWNlLm9wZW4uY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydkaWZmJywgJy0tc3RhdCcsIHJlcG8uYnJhbmNoLCAnZm9vYmFyJ10sIHtjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpfVxuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2Uub3BlbikudG9IYXZlQmVlbkNhbGxlZFdpdGgocmVwby5nZXRQYXRoKCkgKyAnL2F0b21fZ2l0X3BsdXMuZGlmZicpXG4iXX0=
