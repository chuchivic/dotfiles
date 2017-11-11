(function() {
  var GitDiffTool, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitDiffTool = require('../git-difftool');

  module.exports = function() {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        return GitDiffTool(repo, {
          file: repo.relativize(path)
        });
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmdG9vbC1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDhCQUFSOztFQUN2QixHQUFBLEdBQU0sT0FBQSxDQUFRLFdBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSOztFQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7QUFDZixRQUFBO0lBQUEsSUFBRyxJQUFBLG1EQUFpQyxDQUFFLHFCQUF0QzthQUNFLEdBQUcsQ0FBQyxjQUFKLENBQW1CLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsU0FBQyxJQUFEO2VBQzVCLFdBQUEsQ0FBWSxJQUFaLEVBQWtCO1VBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQU47U0FBbEI7TUFENEIsQ0FBOUIsRUFERjtLQUFBLE1BQUE7YUFJRSxRQUFRLENBQUMsT0FBVCxDQUFpQiwwQkFBakIsRUFKRjs7RUFEZTtBQUxqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5HaXREaWZmVG9vbCA9IHJlcXVpcmUgJy4uL2dpdC1kaWZmdG9vbCdcblxubW9kdWxlLmV4cG9ydHMgPSAtPlxuICBpZiBwYXRoID0gY29udGV4dFBhY2thZ2VGaW5kZXIuZ2V0KCk/LnNlbGVjdGVkUGF0aFxuICAgIGdpdC5nZXRSZXBvRm9yUGF0aChwYXRoKS50aGVuIChyZXBvKSAtPlxuICAgICAgR2l0RGlmZlRvb2wgcmVwbywgZmlsZTogcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBkaWZmXCJcbiJdfQ==
