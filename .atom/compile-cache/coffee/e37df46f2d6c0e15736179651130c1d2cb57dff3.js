(function() {
  var GitStageHunk, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitStageHunk = require('../../lib/models/git-stage-hunk');

  describe("GitStageHunk", function() {
    it("calls git.unstagedFiles to get files to stage", function() {
      spyOn(git, 'unstagedFiles').andReturn(Promise.resolve('unstagedFile.txt'));
      GitStageHunk(repo);
      return expect(git.unstagedFiles).toHaveBeenCalled();
    });
    return it("opens the view for selecting files to choose from", function() {
      spyOn(git, 'unstagedFiles').andReturn(Promise.resolve('unstagedFile.txt'));
      return GitStageHunk(repo).then(function(view) {
        return expect(view).toBeDefined();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXN0YWdlLWh1bmstc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTCxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULFlBQUEsR0FBZSxPQUFBLENBQVEsaUNBQVI7O0VBRWYsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtJQUN2QixFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtNQUNsRCxLQUFBLENBQU0sR0FBTixFQUFXLGVBQVgsQ0FBMkIsQ0FBQyxTQUE1QixDQUFzQyxPQUFPLENBQUMsT0FBUixDQUFnQixrQkFBaEIsQ0FBdEM7TUFDQSxZQUFBLENBQWEsSUFBYjthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsYUFBWCxDQUF5QixDQUFDLGdCQUExQixDQUFBO0lBSGtELENBQXBEO1dBS0EsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUE7TUFDdEQsS0FBQSxDQUFNLEdBQU4sRUFBVyxlQUFYLENBQTJCLENBQUMsU0FBNUIsQ0FBc0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0Isa0JBQWhCLENBQXRDO2FBQ0EsWUFBQSxDQUFhLElBQWIsQ0FBa0IsQ0FBQyxJQUFuQixDQUF3QixTQUFDLElBQUQ7ZUFDdEIsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLFdBQWIsQ0FBQTtNQURzQixDQUF4QjtJQUZzRCxDQUF4RDtFQU51QixDQUF6QjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0U3RhZ2VIdW5rID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc3RhZ2UtaHVuaydcblxuZGVzY3JpYmUgXCJHaXRTdGFnZUh1bmtcIiwgLT5cbiAgaXQgXCJjYWxscyBnaXQudW5zdGFnZWRGaWxlcyB0byBnZXQgZmlsZXMgdG8gc3RhZ2VcIiwgLT5cbiAgICBzcHlPbihnaXQsICd1bnN0YWdlZEZpbGVzJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAndW5zdGFnZWRGaWxlLnR4dCdcbiAgICBHaXRTdGFnZUh1bmsgcmVwb1xuICAgIGV4cGVjdChnaXQudW5zdGFnZWRGaWxlcykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgaXQgXCJvcGVucyB0aGUgdmlldyBmb3Igc2VsZWN0aW5nIGZpbGVzIHRvIGNob29zZSBmcm9tXCIsIC0+XG4gICAgc3B5T24oZ2l0LCAndW5zdGFnZWRGaWxlcycpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ3Vuc3RhZ2VkRmlsZS50eHQnXG4gICAgR2l0U3RhZ2VIdW5rKHJlcG8pLnRoZW4gKHZpZXcpIC0+XG4gICAgICBleHBlY3QodmlldykudG9CZURlZmluZWQoKVxuIl19
