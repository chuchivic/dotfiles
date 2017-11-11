(function() {
  var GitDiffBranchFiles, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitDiffBranchFiles = require('../git-diff-branch-files');

  module.exports = function() {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        return GitDiffBranchFiles(repo, path);
      });
    } else {
      return notifier.addInfo("No repository found");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWJyYW5jaC1maWxlcy1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDhCQUFSOztFQUN2QixHQUFBLEdBQU0sT0FBQSxDQUFRLFdBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxrQkFBQSxHQUFxQixPQUFBLENBQVEsMEJBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QzthQUNFLEdBQUcsQ0FBQyxjQUFKLENBQW1CLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsU0FBQyxJQUFEO2VBQzVCLGtCQUFBLENBQW1CLElBQW5CLEVBQXlCLElBQXpCO01BRDRCLENBQTlCLEVBREY7S0FBQSxNQUFBO2FBSUUsUUFBUSxDQUFDLE9BQVQsQ0FBaUIscUJBQWpCLEVBSkY7O0VBRGU7QUFMakIiLCJzb3VyY2VzQ29udGVudCI6WyJjb250ZXh0UGFja2FnZUZpbmRlciA9IHJlcXVpcmUgJy4uLy4uL2NvbnRleHQtcGFja2FnZS1maW5kZXInXG5naXQgPSByZXF1aXJlICcuLi8uLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL25vdGlmaWVyJ1xuR2l0RGlmZkJyYW5jaEZpbGVzID0gcmVxdWlyZSAnLi4vZ2l0LWRpZmYtYnJhbmNoLWZpbGVzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZ2l0LmdldFJlcG9Gb3JQYXRoKHBhdGgpLnRoZW4gKHJlcG8pIC0+XG4gICAgICBHaXREaWZmQnJhbmNoRmlsZXMocmVwbywgcGF0aClcbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJObyByZXBvc2l0b3J5IGZvdW5kXCJcbiJdfQ==
