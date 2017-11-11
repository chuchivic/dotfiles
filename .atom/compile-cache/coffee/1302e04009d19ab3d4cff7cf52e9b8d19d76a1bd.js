(function() {
  var SelectStageFiles, SelectUnStageFiles, git, pathToRepoFile, ref, repo;

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  SelectStageFiles = require('../../lib/views/select-stage-files-view');

  SelectUnStageFiles = require('../../lib/views/select-unstage-files-view');

  describe("SelectStageFiles", function() {
    return it("stages the selected files", function() {
      var fileItem, view;
      spyOn(git, 'cmd').andReturn(Promise.resolve(''));
      fileItem = {
        path: pathToRepoFile
      };
      view = new SelectStageFiles(repo, [fileItem]);
      view.confirmSelection();
      view.find('.btn-stage-button').click();
      return expect(git.cmd).toHaveBeenCalledWith(['add', '-f', pathToRepoFile], {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

  describe("SelectUnStageFiles", function() {
    return it("unstages the selected files", function() {
      var fileItem, view;
      spyOn(git, 'cmd').andReturn(Promise.resolve(''));
      fileItem = {
        path: pathToRepoFile
      };
      view = new SelectUnStageFiles(repo, [fileItem]);
      view.confirmSelection();
      view.find('.btn-unstage-button').click();
      return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD', '--', pathToRepoFile], {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9zZWxlY3Qtc3RhZ2UtZmlsZXMtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE1BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUNQLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSx5Q0FBUjs7RUFDbkIsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLDJDQUFSOztFQUVyQixRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtXQUMzQixFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQTtBQUM5QixVQUFBO01BQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBNUI7TUFDQSxRQUFBLEdBQ0U7UUFBQSxJQUFBLEVBQU0sY0FBTjs7TUFDRixJQUFBLEdBQVcsSUFBQSxnQkFBQSxDQUFpQixJQUFqQixFQUF1QixDQUFDLFFBQUQsQ0FBdkI7TUFDWCxJQUFJLENBQUMsZ0JBQUwsQ0FBQTtNQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsbUJBQVYsQ0FBOEIsQ0FBQyxLQUEvQixDQUFBO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLGNBQWQsQ0FBckMsRUFBb0U7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUFwRTtJQVA4QixDQUFoQztFQUQyQixDQUE3Qjs7RUFVQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtXQUM3QixFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTtBQUNoQyxVQUFBO01BQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBNUI7TUFDQSxRQUFBLEdBQ0U7UUFBQSxJQUFBLEVBQU0sY0FBTjs7TUFDRixJQUFBLEdBQVcsSUFBQSxrQkFBQSxDQUFtQixJQUFuQixFQUF5QixDQUFDLFFBQUQsQ0FBekI7TUFDWCxJQUFJLENBQUMsZ0JBQUwsQ0FBQTtNQUNBLElBQUksQ0FBQyxJQUFMLENBQVUscUJBQVYsQ0FBZ0MsQ0FBQyxLQUFqQyxDQUFBO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixJQUFsQixFQUF3QixjQUF4QixDQUFyQyxFQUE4RTtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQTlFO0lBUGdDLENBQWxDO0VBRDZCLENBQS9CO0FBZkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG8sIHBhdGhUb1JlcG9GaWxlfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuU2VsZWN0U3RhZ2VGaWxlcyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9zZWxlY3Qtc3RhZ2UtZmlsZXMtdmlldydcblNlbGVjdFVuU3RhZ2VGaWxlcyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9zZWxlY3QtdW5zdGFnZS1maWxlcy12aWV3J1xuXG5kZXNjcmliZSBcIlNlbGVjdFN0YWdlRmlsZXNcIiwgLT5cbiAgaXQgXCJzdGFnZXMgdGhlIHNlbGVjdGVkIGZpbGVzXCIsIC0+XG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnJ1xuICAgIGZpbGVJdGVtID1cbiAgICAgIHBhdGg6IHBhdGhUb1JlcG9GaWxlXG4gICAgdmlldyA9IG5ldyBTZWxlY3RTdGFnZUZpbGVzKHJlcG8sIFtmaWxlSXRlbV0pXG4gICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICB2aWV3LmZpbmQoJy5idG4tc3RhZ2UtYnV0dG9uJykuY2xpY2soKVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2FkZCcsICctZicsIHBhdGhUb1JlcG9GaWxlXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG5kZXNjcmliZSBcIlNlbGVjdFVuU3RhZ2VGaWxlc1wiLCAtPlxuICBpdCBcInVuc3RhZ2VzIHRoZSBzZWxlY3RlZCBmaWxlc1wiLCAtPlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJydcbiAgICBmaWxlSXRlbSA9XG4gICAgICBwYXRoOiBwYXRoVG9SZXBvRmlsZVxuICAgIHZpZXcgPSBuZXcgU2VsZWN0VW5TdGFnZUZpbGVzKHJlcG8sIFtmaWxlSXRlbV0pXG4gICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICB2aWV3LmZpbmQoJy5idG4tdW5zdGFnZS1idXR0b24nKS5jbGljaygpXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncmVzZXQnLCAnSEVBRCcsICctLScsIHBhdGhUb1JlcG9GaWxlXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuIl19
