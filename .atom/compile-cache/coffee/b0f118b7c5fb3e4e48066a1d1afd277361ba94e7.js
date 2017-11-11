(function() {
  var GitDiffBranches, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitDiffBranches = require('../git-diff-branches');

  module.exports = function() {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        return GitDiffBranches(repo);
      });
    } else {
      return notifier.addInfo("No repository found");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWJyYW5jaGVzLWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLEdBQUEsR0FBTSxPQUFBLENBQVEsV0FBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUNYLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO0FBQ2YsUUFBQTtJQUFBLElBQUcsSUFBQSxtREFBaUMsQ0FBRSxxQkFBdEM7YUFDRSxHQUFHLENBQUMsY0FBSixDQUFtQixJQUFuQixDQUF3QixDQUFDLElBQXpCLENBQThCLFNBQUMsSUFBRDtlQUFVLGVBQUEsQ0FBZ0IsSUFBaEI7TUFBVixDQUE5QixFQURGO0tBQUEsTUFBQTthQUdFLFFBQVEsQ0FBQyxPQUFULENBQWlCLHFCQUFqQixFQUhGOztFQURlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcbkdpdERpZmZCcmFuY2hlcyA9IHJlcXVpcmUgJy4uL2dpdC1kaWZmLWJyYW5jaGVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZ2l0LmdldFJlcG9Gb3JQYXRoKHBhdGgpLnRoZW4gKHJlcG8pIC0+IEdpdERpZmZCcmFuY2hlcyhyZXBvKVxuICBlbHNlXG4gICAgbm90aWZpZXIuYWRkSW5mbyBcIk5vIHJlcG9zaXRvcnkgZm91bmRcIlxuIl19
