(function() {
  var SelectStageHunkFiles, SelectStageHunks, fs, git, pathToRepoFile, ref, repo;

  fs = require('fs-plus');

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  SelectStageHunkFiles = require('../../lib/views/select-stage-hunk-file-view');

  SelectStageHunks = require('../../lib/views/select-stage-hunks-view');

  describe("SelectStageHunkFiles", function() {
    return it("gets the diff of the selected file", function() {
      var fileItem, view;
      spyOn(git, 'diff').andReturn(Promise.resolve(''));
      fileItem = {
        path: pathToRepoFile
      };
      view = new SelectStageHunkFiles(repo, [fileItem]);
      view.confirmSelection();
      return expect(git.diff).toHaveBeenCalledWith(repo, pathToRepoFile);
    });
  });

  describe("SelectStageHunks", function() {
    return it("stages the selected hunk", function() {
      var hunk, patch_path, view;
      spyOn(git, 'cmd').andReturn(Promise.resolve(''));
      spyOn(fs, 'unlink');
      spyOn(fs, 'writeFile').andCallFake(function() {
        return fs.writeFile.mostRecentCall.args[3]();
      });
      hunk = {
        match: function() {
          return [1, 'this is a diff', 'hunk'];
        }
      };
      view = new SelectStageHunks(repo, ["patch_path hunk1", hunk]);
      patch_path = repo.getWorkingDirectory() + '/GITPLUS_PATCH';
      view.confirmSelection();
      view.find('.btn-stage-button').click();
      return expect(git.cmd).toHaveBeenCalledWith(['apply', '--cached', '--', patch_path], {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9zZWxlY3Qtc3RhZ2UtaHVuay1maWxlcy12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE1BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUNQLG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSw2Q0FBUjs7RUFDdkIsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHlDQUFSOztFQUVuQixRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtXQUMvQixFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQTtBQUN2QyxVQUFBO01BQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxNQUFYLENBQWtCLENBQUMsU0FBbkIsQ0FBNkIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBN0I7TUFDQSxRQUFBLEdBQ0U7UUFBQSxJQUFBLEVBQU0sY0FBTjs7TUFDRixJQUFBLEdBQVcsSUFBQSxvQkFBQSxDQUFxQixJQUFyQixFQUEyQixDQUFDLFFBQUQsQ0FBM0I7TUFDWCxJQUFJLENBQUMsZ0JBQUwsQ0FBQTthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsSUFBWCxDQUFnQixDQUFDLG9CQUFqQixDQUFzQyxJQUF0QyxFQUE0QyxjQUE1QztJQU51QyxDQUF6QztFQUQrQixDQUFqQzs7RUFTQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtXQUMzQixFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQTtBQUM3QixVQUFBO01BQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBNUI7TUFDQSxLQUFBLENBQU0sRUFBTixFQUFVLFFBQVY7TUFDQSxLQUFBLENBQU0sRUFBTixFQUFVLFdBQVYsQ0FBc0IsQ0FBQyxXQUF2QixDQUFtQyxTQUFBO2VBQ2pDLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQWpDLENBQUE7TUFEaUMsQ0FBbkM7TUFFQSxJQUFBLEdBQ0U7UUFBQSxLQUFBLEVBQU8sU0FBQTtpQkFBRyxDQUFDLENBQUQsRUFBSSxnQkFBSixFQUFzQixNQUF0QjtRQUFILENBQVA7O01BQ0YsSUFBQSxHQUFXLElBQUEsZ0JBQUEsQ0FBaUIsSUFBakIsRUFBdUIsQ0FBQyxrQkFBRCxFQUFxQixJQUFyQixDQUF2QjtNQUNYLFVBQUEsR0FBYSxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFBLEdBQTZCO01BQzFDLElBQUksQ0FBQyxnQkFBTCxDQUFBO01BQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxtQkFBVixDQUE4QixDQUFDLEtBQS9CLENBQUE7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxVQUFWLEVBQXNCLElBQXRCLEVBQTRCLFVBQTVCLENBQXJDLEVBQThFO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBOUU7SUFYNkIsQ0FBL0I7RUFEMkIsQ0FBN0I7QUFmQSIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwbywgcGF0aFRvUmVwb0ZpbGV9ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5TZWxlY3RTdGFnZUh1bmtGaWxlcyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9zZWxlY3Qtc3RhZ2UtaHVuay1maWxlLXZpZXcnXG5TZWxlY3RTdGFnZUh1bmtzID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL3NlbGVjdC1zdGFnZS1odW5rcy12aWV3J1xuXG5kZXNjcmliZSBcIlNlbGVjdFN0YWdlSHVua0ZpbGVzXCIsIC0+XG4gIGl0IFwiZ2V0cyB0aGUgZGlmZiBvZiB0aGUgc2VsZWN0ZWQgZmlsZVwiLCAtPlxuICAgIHNweU9uKGdpdCwgJ2RpZmYnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICcnXG4gICAgZmlsZUl0ZW0gPVxuICAgICAgcGF0aDogcGF0aFRvUmVwb0ZpbGVcbiAgICB2aWV3ID0gbmV3IFNlbGVjdFN0YWdlSHVua0ZpbGVzKHJlcG8sIFtmaWxlSXRlbV0pXG4gICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICBleHBlY3QoZ2l0LmRpZmYpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIHBhdGhUb1JlcG9GaWxlXG5cbmRlc2NyaWJlIFwiU2VsZWN0U3RhZ2VIdW5rc1wiLCAtPlxuICBpdCBcInN0YWdlcyB0aGUgc2VsZWN0ZWQgaHVua1wiLCAtPlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJydcbiAgICBzcHlPbihmcywgJ3VubGluaycpXG4gICAgc3B5T24oZnMsICd3cml0ZUZpbGUnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgZnMud3JpdGVGaWxlLm1vc3RSZWNlbnRDYWxsLmFyZ3NbM10oKVxuICAgIGh1bmsgPVxuICAgICAgbWF0Y2g6IC0+IFsxLCAndGhpcyBpcyBhIGRpZmYnLCAnaHVuayddXG4gICAgdmlldyA9IG5ldyBTZWxlY3RTdGFnZUh1bmtzKHJlcG8sIFtcInBhdGNoX3BhdGggaHVuazFcIiwgaHVua10pXG4gICAgcGF0Y2hfcGF0aCA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpICsgJy9HSVRQTFVTX1BBVENIJ1xuICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgdmlldy5maW5kKCcuYnRuLXN0YWdlLWJ1dHRvbicpLmNsaWNrKClcbiAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydhcHBseScsICctLWNhY2hlZCcsICctLScsIHBhdGNoX3BhdGhdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4iXX0=
