(function() {
  var SelectStageFiles, git;

  git = require('../git');

  SelectStageFiles = require('../views/select-stage-files-view');

  module.exports = function(repo) {
    return git.unstagedFiles(repo, {
      showUntracked: true
    }).then(function(data) {
      return new SelectStageFiles(repo, data);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3RhZ2UtZmlsZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLGtDQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsYUFBSixDQUFrQixJQUFsQixFQUF3QjtNQUFBLGFBQUEsRUFBZSxJQUFmO0tBQXhCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2FBQWMsSUFBQSxnQkFBQSxDQUFpQixJQUFqQixFQUF1QixJQUF2QjtJQUFkLENBRE47RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblNlbGVjdFN0YWdlRmlsZXMgPSByZXF1aXJlICcuLi92aWV3cy9zZWxlY3Qtc3RhZ2UtZmlsZXMtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgZ2l0LnVuc3RhZ2VkRmlsZXMocmVwbywgc2hvd1VudHJhY2tlZDogdHJ1ZSlcbiAgLnRoZW4gKGRhdGEpIC0+IG5ldyBTZWxlY3RTdGFnZUZpbGVzKHJlcG8sIGRhdGEpXG4iXX0=
