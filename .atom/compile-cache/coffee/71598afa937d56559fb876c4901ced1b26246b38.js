(function() {
  var GitDiffTool, fs, git, pathToRepoFile, pathToSampleDir, ref, repo;

  fs = require('fs-plus');

  ref = require('../fixtures'), repo = ref.repo, pathToSampleDir = ref.pathToSampleDir, pathToRepoFile = ref.pathToRepoFile;

  git = require('../../lib/git');

  GitDiffTool = require('../../lib/models/git-difftool');

  describe("GitDiffTool", function() {
    describe("Using includeStagedDiff", function() {
      beforeEach(function() {
        atom.config.set('git-plus.diffs.includeStagedDiff', true);
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn('some-tool');
        return waitsForPromise(function() {
          return GitDiffTool(repo, {
            file: pathToRepoFile
          });
        });
      });
      return describe("when git-plus.diffs.includeStagedDiff config is true", function() {
        it("calls git.cmd with 'diff-index HEAD -z'", function() {
          return expect(git.cmd).toHaveBeenCalledWith(['diff-index', 'HEAD', '-z'], {
            cwd: repo.getWorkingDirectory()
          });
        });
        return it("calls `git.getConfig` to check if a a difftool is set", function() {
          return expect(git.getConfig).toHaveBeenCalledWith(repo, 'diff.tool');
        });
      });
    });
    return describe("Usage on dirs", function() {
      beforeEach(function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
        spyOn(git, 'getConfig').andReturn('some-tool');
        return waitsForPromise(function() {
          return GitDiffTool(repo, {
            file: pathToSampleDir
          });
        });
      });
      return describe("when file points to a directory", function() {
        it("calls git.cmd with 'difftool --no-prompt -d'", function() {
          return expect(git.cmd.calls[1].args).toEqual([
            ['difftool', '-d', '--no-prompt', pathToSampleDir], {
              cwd: repo.getWorkingDirectory()
            }
          ]);
        });
        return it("calls `git.getConfig` to check if a a difftool is set", function() {
          return expect(git.getConfig).toHaveBeenCalledWith(repo, 'diff.tool');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWRpZmZ0b29sLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBMEMsT0FBQSxDQUFRLGFBQVIsQ0FBMUMsRUFBQyxlQUFELEVBQU8scUNBQVAsRUFBd0I7O0VBQ3hCLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixXQUFBLEdBQWMsT0FBQSxDQUFRLCtCQUFSOztFQUVkLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7SUFDdEIsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUE7TUFDbEMsVUFBQSxDQUFXLFNBQUE7UUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCLEVBQW9ELElBQXBEO1FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsQ0FBNUI7UUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLFdBQVgsQ0FBdUIsQ0FBQyxTQUF4QixDQUFrQyxXQUFsQztlQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZCxXQUFBLENBQVksSUFBWixFQUFrQjtZQUFBLElBQUEsRUFBTSxjQUFOO1dBQWxCO1FBRGMsQ0FBaEI7TUFKUyxDQUFYO2FBT0EsUUFBQSxDQUFTLHNEQUFULEVBQWlFLFNBQUE7UUFDL0QsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7aUJBQzVDLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsWUFBRCxFQUFlLE1BQWYsRUFBdUIsSUFBdkIsQ0FBckMsRUFBbUU7WUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtXQUFuRTtRQUQ0QyxDQUE5QztlQUdBLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBO2lCQUMxRCxNQUFBLENBQU8sR0FBRyxDQUFDLFNBQVgsQ0FBcUIsQ0FBQyxvQkFBdEIsQ0FBMkMsSUFBM0MsRUFBaUQsV0FBakQ7UUFEMEQsQ0FBNUQ7TUFKK0QsQ0FBakU7SUFSa0MsQ0FBcEM7V0FlQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO01BQ3hCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsQ0FBNUI7UUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLFdBQVgsQ0FBdUIsQ0FBQyxTQUF4QixDQUFrQyxXQUFsQztlQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZCxXQUFBLENBQVksSUFBWixFQUFrQjtZQUFBLElBQUEsRUFBTSxlQUFOO1dBQWxCO1FBRGMsQ0FBaEI7TUFIUyxDQUFYO2FBTUEsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUE7UUFDMUMsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7aUJBQ2pELE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUF4QixDQUE2QixDQUFDLE9BQTlCLENBQXNDO1lBQUMsQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixhQUFuQixFQUFrQyxlQUFsQyxDQUFELEVBQXFEO2NBQUMsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQU47YUFBckQ7V0FBdEM7UUFEaUQsQ0FBbkQ7ZUFHQSxFQUFBLENBQUcsdURBQUgsRUFBNEQsU0FBQTtpQkFDMUQsTUFBQSxDQUFPLEdBQUcsQ0FBQyxTQUFYLENBQXFCLENBQUMsb0JBQXRCLENBQTJDLElBQTNDLEVBQWlELFdBQWpEO1FBRDBELENBQTVEO01BSjBDLENBQTVDO0lBUHdCLENBQTFCO0VBaEJzQixDQUF4QjtBQUxBIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xue3JlcG8sIHBhdGhUb1NhbXBsZURpciwgcGF0aFRvUmVwb0ZpbGV9ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5naXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xuR2l0RGlmZlRvb2wgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1kaWZmdG9vbCdcblxuZGVzY3JpYmUgXCJHaXREaWZmVG9vbFwiLCAtPlxuICBkZXNjcmliZSBcIlVzaW5nIGluY2x1ZGVTdGFnZWREaWZmXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZicsIHRydWVcbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoJ2RpZmZzJylcbiAgICAgIHNweU9uKGdpdCwgJ2dldENvbmZpZycpLmFuZFJldHVybiAnc29tZS10b29sJ1xuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIEdpdERpZmZUb29sIHJlcG8sIGZpbGU6IHBhdGhUb1JlcG9GaWxlXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYgY29uZmlnIGlzIHRydWVcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdkaWZmLWluZGV4IEhFQUQgLXonXCIsIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2RpZmYtaW5kZXgnLCAnSEVBRCcsICcteiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgICAgIGl0IFwiY2FsbHMgYGdpdC5nZXRDb25maWdgIHRvIGNoZWNrIGlmIGEgYSBkaWZmdG9vbCBpcyBzZXRcIiwgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5nZXRDb25maWcpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sICdkaWZmLnRvb2wnXG5cbiAgZGVzY3JpYmUgXCJVc2FnZSBvbiBkaXJzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSgnZGlmZnMnKVxuICAgICAgc3B5T24oZ2l0LCAnZ2V0Q29uZmlnJykuYW5kUmV0dXJuICdzb21lLXRvb2wnXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgR2l0RGlmZlRvb2wgcmVwbywgZmlsZTogcGF0aFRvU2FtcGxlRGlyXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZmlsZSBwb2ludHMgdG8gYSBkaXJlY3RvcnlcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdkaWZmdG9vbCAtLW5vLXByb21wdCAtZCdcIiwgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQuY2FsbHNbMV0uYXJncykudG9FcXVhbChbWydkaWZmdG9vbCcsICctZCcsICctLW5vLXByb21wdCcsIHBhdGhUb1NhbXBsZURpcl0sIHtjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpfV0pO1xuXG4gICAgICBpdCBcImNhbGxzIGBnaXQuZ2V0Q29uZmlnYCB0byBjaGVjayBpZiBhIGEgZGlmZnRvb2wgaXMgc2V0XCIsIC0+XG4gICAgICAgIGV4cGVjdChnaXQuZ2V0Q29uZmlnKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCAnZGlmZi50b29sJ1xuIl19
