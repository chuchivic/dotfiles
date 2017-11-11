(function() {
  var GitDiff, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitDiff = require('../git-diff');

  module.exports = function() {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        var file;
        if (path === repo.getWorkingDirectory()) {
          file = path;
        } else {
          file = repo.relativize(path);
        }
        if (file === '') {
          file = void 0;
        }
        return GitDiff(repo, {
          file: file
        });
      });
    } else {
      return notifier.addInfo("No file selected to diff");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLEdBQUEsR0FBTSxPQUFBLENBQVEsV0FBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO0FBQ2YsUUFBQTtJQUFBLElBQUcsSUFBQSxtREFBaUMsQ0FBRSxxQkFBdEM7YUFDRSxHQUFHLENBQUMsY0FBSixDQUFtQixJQUFuQixDQUF3QixDQUFDLElBQXpCLENBQThCLFNBQUMsSUFBRDtBQUM1QixZQUFBO1FBQUEsSUFBRyxJQUFBLEtBQVEsSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBWDtVQUNFLElBQUEsR0FBTyxLQURUO1NBQUEsTUFBQTtVQUdFLElBQUEsR0FBTyxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFoQixFQUhUOztRQUlBLElBQW9CLElBQUEsS0FBUSxFQUE1QjtVQUFBLElBQUEsR0FBTyxPQUFQOztlQUNBLE9BQUEsQ0FBUSxJQUFSLEVBQWM7VUFBQyxNQUFBLElBQUQ7U0FBZDtNQU40QixDQUE5QixFQURGO0tBQUEsTUFBQTthQVNFLFFBQVEsQ0FBQyxPQUFULENBQWlCLDBCQUFqQixFQVRGOztFQURlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcbkdpdERpZmYgPSByZXF1aXJlICcuLi9naXQtZGlmZidcblxubW9kdWxlLmV4cG9ydHMgPSAtPlxuICBpZiBwYXRoID0gY29udGV4dFBhY2thZ2VGaW5kZXIuZ2V0KCk/LnNlbGVjdGVkUGF0aFxuICAgIGdpdC5nZXRSZXBvRm9yUGF0aChwYXRoKS50aGVuIChyZXBvKSAtPlxuICAgICAgaWYgcGF0aCBpcyByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICAgICAgICBmaWxlID0gcGF0aFxuICAgICAgZWxzZVxuICAgICAgICBmaWxlID0gcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gICAgICBmaWxlID0gdW5kZWZpbmVkIGlmIGZpbGUgaXMgJydcbiAgICAgIEdpdERpZmYgcmVwbywge2ZpbGV9XG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBkaWZmXCJcbiJdfQ==
