(function() {
  var GitRun, git, pathToRepoFile, ref, repo;

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  git = require('../../lib/git');

  GitRun = require('../../lib/models/git-run');

  describe("GitRun", function() {
    describe("when called with just a repository", function() {
      return it("calls git.cmd with the arguments typed into the input with a config for colors to be enabled", function() {
        var editor, view;
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        view = GitRun(repo);
        editor = view.find('atom-text-editor')[0];
        view.commandEditor.setText('do some stuff');
        atom.commands.dispatch(editor, 'core:confirm');
        return expect(git.cmd).toHaveBeenCalledWith(['do', 'some', 'stuff'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
    });
    return describe("when called with a repository and a string with arguments", function() {
      it("calls git.cmd with the arguments passed", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitRun(repo, "status --list");
        return expect(git.cmd).toHaveBeenCalledWith(['status', '--list'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
      return it("returns a promise that resolves with the result from git CLI", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('a real git thing'));
        return GitRun(repo, "status --list").then(function(result) {
          return expect(result).toBe('a real git thing');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXJ1bi1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBeUIsT0FBQSxDQUFRLGFBQVIsQ0FBekIsRUFBQyxlQUFELEVBQU87O0VBQ1AsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE1BQUEsR0FBUyxPQUFBLENBQVEsMEJBQVI7O0VBRVQsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtJQUNqQixRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQTthQUM3QyxFQUFBLENBQUcsOEZBQUgsRUFBbUcsU0FBQTtBQUNqRyxZQUFBO1FBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7UUFDQSxJQUFBLEdBQU8sTUFBQSxDQUFPLElBQVA7UUFDUCxNQUFBLEdBQVMsSUFBSSxDQUFDLElBQUwsQ0FBVSxrQkFBVixDQUE4QixDQUFBLENBQUE7UUFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixlQUEzQjtRQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUErQixjQUEvQjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsSUFBRCxFQUFPLE1BQVAsRUFBZSxPQUFmLENBQXJDLEVBQThEO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBOUQsRUFBK0Y7VUFBQyxLQUFBLEVBQU8sSUFBUjtTQUEvRjtNQU5pRyxDQUFuRztJQUQ2QyxDQUEvQztXQVNBLFFBQUEsQ0FBUywyREFBVCxFQUFzRSxTQUFBO01BQ3BFLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO1FBQzVDLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO1FBQ0EsTUFBQSxDQUFPLElBQVAsRUFBYSxlQUFiO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxRQUFELEVBQVcsUUFBWCxDQUFyQyxFQUEyRDtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQTNELEVBQTRGO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBNUY7TUFINEMsQ0FBOUM7YUFLQSxFQUFBLENBQUcsOERBQUgsRUFBbUUsU0FBQTtRQUNqRSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixrQkFBaEIsQ0FBNUI7ZUFDQSxNQUFBLENBQU8sSUFBUCxFQUFhLGVBQWIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLE1BQUQ7aUJBQVksTUFBQSxDQUFPLE1BQVAsQ0FBYyxDQUFDLElBQWYsQ0FBb0Isa0JBQXBCO1FBQVosQ0FETjtNQUZpRSxDQUFuRTtJQU5vRSxDQUF0RTtFQVZpQixDQUFuQjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsie3JlcG8sIHBhdGhUb1JlcG9GaWxlfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdFJ1biA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXJ1bidcblxuZGVzY3JpYmUgXCJHaXRSdW5cIiwgLT5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNhbGxlZCB3aXRoIGp1c3QgYSByZXBvc2l0b3J5XCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggdGhlIGFyZ3VtZW50cyB0eXBlZCBpbnRvIHRoZSBpbnB1dCB3aXRoIGEgY29uZmlnIGZvciBjb2xvcnMgdG8gYmUgZW5hYmxlZFwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICB2aWV3ID0gR2l0UnVuKHJlcG8pXG4gICAgICBlZGl0b3IgPSB2aWV3LmZpbmQoJ2F0b20tdGV4dC1lZGl0b3InKVswXVxuICAgICAgdmlldy5jb21tYW5kRWRpdG9yLnNldFRleHQgJ2RvIHNvbWUgc3R1ZmYnXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvciwgJ2NvcmU6Y29uZmlybScpXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydkbycsICdzb21lJywgJ3N0dWZmJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX1cblxuICBkZXNjcmliZSBcIndoZW4gY2FsbGVkIHdpdGggYSByZXBvc2l0b3J5IGFuZCBhIHN0cmluZyB3aXRoIGFyZ3VtZW50c1wiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIHRoZSBhcmd1bWVudHMgcGFzc2VkXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIEdpdFJ1bihyZXBvLCBcInN0YXR1cyAtLWxpc3RcIilcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3N0YXR1cycsICctLWxpc3QnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfVxuXG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIHJlc3VsdCBmcm9tIGdpdCBDTElcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ2EgcmVhbCBnaXQgdGhpbmcnXG4gICAgICBHaXRSdW4ocmVwbywgXCJzdGF0dXMgLS1saXN0XCIpXG4gICAgICAudGhlbiAocmVzdWx0KSAtPiBleHBlY3QocmVzdWx0KS50b0JlICdhIHJlYWwgZ2l0IHRoaW5nJ1xuIl19
