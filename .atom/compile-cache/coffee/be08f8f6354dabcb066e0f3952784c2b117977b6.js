(function() {
  var GitCommitAmend, Path, commitFilePath, commitPane, currentPane, fs, git, pathToRepoFile, ref, repo, textEditor;

  Path = require('path');

  fs = require('fs-plus');

  git = require('../../lib/git');

  GitCommitAmend = require('../../lib/models/git-commit-amend');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor, commitPane = ref.commitPane, currentPane = ref.currentPane;

  commitFilePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');

  describe("GitCommitAmend", function() {
    beforeEach(function() {
      spyOn(atom.workspace, 'getActivePane').andReturn(currentPane);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(atom.workspace, 'getPanes').andReturn([currentPane, commitPane]);
      spyOn(atom.workspace, 'paneForURI').andReturn(commitPane);
      spyOn(git, 'refresh');
      spyOn(commitPane, 'destroy').andCallThrough();
      spyOn(currentPane, 'activate');
      spyOn(fs, 'unlink');
      spyOn(fs, 'readFileSync').andReturn('');
      spyOn(git, 'stagedFiles').andCallFake(function() {
        var args;
        args = git.stagedFiles.mostRecentCall.args;
        if (args[0].getWorkingDirectory() === repo.getWorkingDirectory()) {
          return Promise.resolve([pathToRepoFile]);
        }
      });
      return spyOn(git, 'cmd').andCallFake(function() {
        var args;
        args = git.cmd.mostRecentCall.args[0];
        switch (args[0]) {
          case 'whatchanged':
            return Promise.resolve('last commit');
          case 'status':
            return Promise.resolve('current status');
          default:
            return Promise.resolve('');
        }
      });
    });
    it("gets the previous commit message and changed files", function() {
      var expectedGitArgs;
      expectedGitArgs = ['whatchanged', '-1', '--name-status', '--format=%B'];
      GitCommitAmend(repo);
      return expect(git.cmd).toHaveBeenCalledWith(expectedGitArgs, {
        cwd: repo.getWorkingDirectory()
      });
    });
    it("writes to the new commit file", function() {
      spyOn(fs, 'writeFileSync');
      GitCommitAmend(repo);
      waitsFor(function() {
        return fs.writeFileSync.callCount > 0;
      });
      return runs(function() {
        var actualPath;
        actualPath = fs.writeFileSync.mostRecentCall.args[0];
        return expect(actualPath).toEqual(commitFilePath);
      });
    });
    xit("shows the file", function() {
      GitCommitAmend(repo);
      waitsFor(function() {
        return atom.workspace.open.callCount > 0;
      });
      return runs(function() {
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
    });
    xit("calls git.cmd with ['commit'...] on textEditor save", function() {
      GitCommitAmend(repo);
      textEditor.save();
      return expect(git.cmd).toHaveBeenCalledWith(['commit', '--amend', '--cleanup=strip', "--file=" + commitFilePath], {
        cwd: repo.getWorkingDirectory()
      });
    });
    xit("closes the commit pane when commit is successful", function() {
      GitCommitAmend(repo);
      textEditor.save();
      waitsFor(function() {
        return commitPane.destroy.callCount > 0;
      });
      return runs(function() {
        return expect(commitPane.destroy).toHaveBeenCalled();
      });
    });
    return xit("cancels the commit on textEditor destroy", function() {
      GitCommitAmend(repo);
      textEditor.destroy();
      expect(currentPane.activate).toHaveBeenCalled();
      return expect(fs.unlink).toHaveBeenCalledWith(commitFilePath);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWNvbW1pdC1hbWVuZC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sY0FBQSxHQUFpQixPQUFBLENBQVEsbUNBQVI7O0VBQ2pCLE1BTUksT0FBQSxDQUFRLGFBQVIsQ0FOSixFQUNFLGVBREYsRUFFRSxtQ0FGRixFQUdFLDJCQUhGLEVBSUUsMkJBSkYsRUFLRTs7RUFHRixjQUFBLEdBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLGdCQUExQjs7RUFFakIsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7SUFDekIsVUFBQSxDQUFXLFNBQUE7TUFDVCxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsZUFBdEIsQ0FBc0MsQ0FBQyxTQUF2QyxDQUFpRCxXQUFqRDtNQUNBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QixDQUE2QixDQUFDLFNBQTlCLENBQXdDLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQWhCLENBQXhDO01BQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLFVBQXRCLENBQWlDLENBQUMsU0FBbEMsQ0FBNEMsQ0FBQyxXQUFELEVBQWMsVUFBZCxDQUE1QztNQUNBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixZQUF0QixDQUFtQyxDQUFDLFNBQXBDLENBQThDLFVBQTlDO01BQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxTQUFYO01BRUEsS0FBQSxDQUFNLFVBQU4sRUFBa0IsU0FBbEIsQ0FB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LGtEQUFKLEVBQXdELFNBQUE7TUFDdEQsY0FBQSxDQUFlLElBQWY7TUFDQSxVQUFVLENBQUMsSUFBWCxDQUFBO01BQ0EsUUFBQSxDQUFTLFNBQUE7ZUFBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQW5CLEdBQStCO01BQWxDLENBQVQ7YUFDQSxJQUFBLENBQUssU0FBQTtlQUFHLE1BQUEsQ0FBTyxVQUFVLENBQUMsT0FBbEIsQ0FBMEIsQ0FBQyxnQkFBM0IsQ0FBQTtNQUFILENBQUw7SUFKc0QsQ0FBeEQ7V0FNQSxHQUFBLENBQUksMENBQUosRUFBZ0QsU0FBQTtNQUM5QyxjQUFBLENBQWUsSUFBZjtNQUNBLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFDQSxNQUFBLENBQU8sV0FBVyxDQUFDLFFBQW5CLENBQTRCLENBQUMsZ0JBQTdCLENBQUE7YUFDQSxNQUFBLENBQU8sRUFBRSxDQUFDLE1BQVYsQ0FBaUIsQ0FBQyxvQkFBbEIsQ0FBdUMsY0FBdkM7SUFKOEMsQ0FBaEQ7RUF6RHlCLENBQTNCO0FBZkEiLCJzb3VyY2VzQ29udGVudCI6WyJQYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdENvbW1pdEFtZW5kID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtY29tbWl0LWFtZW5kJ1xue1xuICByZXBvLFxuICBwYXRoVG9SZXBvRmlsZSxcbiAgdGV4dEVkaXRvcixcbiAgY29tbWl0UGFuZSxcbiAgY3VycmVudFBhbmVcbn0gPSByZXF1aXJlICcuLi9maXh0dXJlcydcblxuY29tbWl0RmlsZVBhdGggPSBQYXRoLmpvaW4ocmVwby5nZXRQYXRoKCksICdDT01NSVRfRURJVE1TRycpXG5cbmRlc2NyaWJlIFwiR2l0Q29tbWl0QW1lbmRcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlUGFuZScpLmFuZFJldHVybiBjdXJyZW50UGFuZVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdGV4dEVkaXRvclxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0UGFuZXMnKS5hbmRSZXR1cm4gW2N1cnJlbnRQYW5lLCBjb21taXRQYW5lXVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAncGFuZUZvclVSSScpLmFuZFJldHVybiBjb21taXRQYW5lXG4gICAgc3B5T24oZ2l0LCAncmVmcmVzaCcpXG5cbiAgICBzcHlPbihjb21taXRQYW5lLCAnZGVzdHJveScpLmFuZENhbGxUaHJvdWdoKClcbiAgICBzcHlPbihjdXJyZW50UGFuZSwgJ2FjdGl2YXRlJylcblxuICAgIHNweU9uKGZzLCAndW5saW5rJylcbiAgICBzcHlPbihmcywgJ3JlYWRGaWxlU3luYycpLmFuZFJldHVybiAnJ1xuICAgIHNweU9uKGdpdCwgJ3N0YWdlZEZpbGVzJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgIGFyZ3MgPSBnaXQuc3RhZ2VkRmlsZXMubW9zdFJlY2VudENhbGwuYXJnc1xuICAgICAgaWYgYXJnc1swXS5nZXRXb3JraW5nRGlyZWN0b3J5KCkgaXMgcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlIFtwYXRoVG9SZXBvRmlsZV1cblxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICBhcmdzID0gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgICBzd2l0Y2ggYXJnc1swXVxuICAgICAgICB3aGVuICd3aGF0Y2hhbmdlZCcgdGhlbiBQcm9taXNlLnJlc29sdmUgJ2xhc3QgY29tbWl0J1xuICAgICAgICB3aGVuICdzdGF0dXMnIHRoZW4gUHJvbWlzZS5yZXNvbHZlICdjdXJyZW50IHN0YXR1cydcbiAgICAgICAgZWxzZSBQcm9taXNlLnJlc29sdmUgJydcblxuICBpdCBcImdldHMgdGhlIHByZXZpb3VzIGNvbW1pdCBtZXNzYWdlIGFuZCBjaGFuZ2VkIGZpbGVzXCIsIC0+XG4gICAgZXhwZWN0ZWRHaXRBcmdzID0gWyd3aGF0Y2hhbmdlZCcsICctMScsICctLW5hbWUtc3RhdHVzJywgJy0tZm9ybWF0PSVCJ11cbiAgICBHaXRDb21taXRBbWVuZCByZXBvXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIGV4cGVjdGVkR2l0QXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIGl0IFwid3JpdGVzIHRvIHRoZSBuZXcgY29tbWl0IGZpbGVcIiwgLT5cbiAgICBzcHlPbihmcywgJ3dyaXRlRmlsZVN5bmMnKVxuICAgIEdpdENvbW1pdEFtZW5kIHJlcG9cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgZnMud3JpdGVGaWxlU3luYy5jYWxsQ291bnQgPiAwXG4gICAgcnVucyAtPlxuICAgICAgYWN0dWFsUGF0aCA9IGZzLndyaXRlRmlsZVN5bmMubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgZXhwZWN0KGFjdHVhbFBhdGgpLnRvRXF1YWwgY29tbWl0RmlsZVBhdGhcblxuICB4aXQgXCJzaG93cyB0aGUgZmlsZVwiLCAtPlxuICAgIEdpdENvbW1pdEFtZW5kIHJlcG9cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbi5jYWxsQ291bnQgPiAwXG4gICAgcnVucyAtPlxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIHhpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2NvbW1pdCcuLi5dIG9uIHRleHRFZGl0b3Igc2F2ZVwiLCAtPlxuICAgIEdpdENvbW1pdEFtZW5kIHJlcG9cbiAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2NvbW1pdCcsICctLWFtZW5kJywgJy0tY2xlYW51cD1zdHJpcCcsIFwiLS1maWxlPSN7Y29tbWl0RmlsZVBhdGh9XCJdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgeGl0IFwiY2xvc2VzIHRoZSBjb21taXQgcGFuZSB3aGVuIGNvbW1pdCBpcyBzdWNjZXNzZnVsXCIsIC0+XG4gICAgR2l0Q29tbWl0QW1lbmQgcmVwb1xuICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4gICAgd2FpdHNGb3IgLT4gY29tbWl0UGFuZS5kZXN0cm95LmNhbGxDb3VudCA+IDBcbiAgICBydW5zIC0+IGV4cGVjdChjb21taXRQYW5lLmRlc3Ryb3kpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIHhpdCBcImNhbmNlbHMgdGhlIGNvbW1pdCBvbiB0ZXh0RWRpdG9yIGRlc3Ryb3lcIiwgLT5cbiAgICBHaXRDb21taXRBbWVuZCByZXBvXG4gICAgdGV4dEVkaXRvci5kZXN0cm95KClcbiAgICBleHBlY3QoY3VycmVudFBhbmUuYWN0aXZhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIGV4cGVjdChmcy51bmxpbmspLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIGNvbW1pdEZpbGVQYXRoXG4iXX0=
