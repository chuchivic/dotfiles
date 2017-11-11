(function() {
  var GitStageFiles, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitStageFiles = require('../../lib/models/git-stage-files');

  describe("GitStageFiles", function() {
    return it("calls git.unstagedFiles to get files to stage", function() {
      spyOn(git, 'unstagedFiles').andReturn(Promise.resolve('unstagedFile.txt'));
      GitStageFiles(repo);
      return expect(git.unstagedFiles).toHaveBeenCalled();
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXN0YWdlLWZpbGVzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQ0FBUjs7RUFFaEIsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtXQUN4QixFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtNQUNsRCxLQUFBLENBQU0sR0FBTixFQUFXLGVBQVgsQ0FBMkIsQ0FBQyxTQUE1QixDQUFzQyxPQUFPLENBQUMsT0FBUixDQUFnQixrQkFBaEIsQ0FBdEM7TUFDQSxhQUFBLENBQWMsSUFBZDthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsYUFBWCxDQUF5QixDQUFDLGdCQUExQixDQUFBO0lBSGtELENBQXBEO0VBRHdCLENBQTFCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5HaXRTdGFnZUZpbGVzID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc3RhZ2UtZmlsZXMnXG5cbmRlc2NyaWJlIFwiR2l0U3RhZ2VGaWxlc1wiLCAtPlxuICBpdCBcImNhbGxzIGdpdC51bnN0YWdlZEZpbGVzIHRvIGdldCBmaWxlcyB0byBzdGFnZVwiLCAtPlxuICAgIHNweU9uKGdpdCwgJ3Vuc3RhZ2VkRmlsZXMnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICd1bnN0YWdlZEZpbGUudHh0J1xuICAgIEdpdFN0YWdlRmlsZXMgcmVwb1xuICAgIGV4cGVjdChnaXQudW5zdGFnZWRGaWxlcykudG9IYXZlQmVlbkNhbGxlZCgpXG4iXX0=
