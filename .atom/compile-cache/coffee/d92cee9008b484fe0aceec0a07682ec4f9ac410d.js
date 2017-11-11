(function() {
  var GitCommit, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitCommit = require('../git-commit');

  module.exports = function() {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        var file;
        file = repo.relativize(path);
        if (file === '') {
          file = void 0;
        }
        return git.add(repo, {
          file: file
        }).then(function() {
          return GitCommit(repo);
        });
      })["catch"](function(error) {
        console.log(error);
        return notifier.addError('There was an error executing Add + Commit');
      });
    } else {
      return notifier.addInfo("No file selected to add and commit");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1hZGQtYW5kLWNvbW1pdC1jb250ZXh0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDhCQUFSOztFQUN2QixHQUFBLEdBQU0sT0FBQSxDQUFRLFdBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxTQUFBLEdBQVksT0FBQSxDQUFRLGVBQVI7O0VBRVosTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQTtBQUNmLFFBQUE7SUFBQSxJQUFHLElBQUEsbURBQWlDLENBQUUscUJBQXRDO2FBQ0UsR0FBRyxDQUFDLGNBQUosQ0FBbUIsSUFBbkIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7QUFDSixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCO1FBQ1AsSUFBb0IsSUFBQSxLQUFRLEVBQTVCO1VBQUEsSUFBQSxHQUFPLE9BQVA7O2VBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7VUFBQyxNQUFBLElBQUQ7U0FBZCxDQUFxQixDQUFDLElBQXRCLENBQTJCLFNBQUE7aUJBQUcsU0FBQSxDQUFVLElBQVY7UUFBSCxDQUEzQjtNQUhJLENBRE4sQ0FLQSxFQUFDLEtBQUQsRUFMQSxDQUtPLFNBQUMsS0FBRDtRQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtlQUNBLFFBQVEsQ0FBQyxRQUFULENBQWtCLDJDQUFsQjtNQUZLLENBTFAsRUFERjtLQUFBLE1BQUE7YUFVRSxRQUFRLENBQUMsT0FBVCxDQUFpQixvQ0FBakIsRUFWRjs7RUFEZTtBQUxqQiIsInNvdXJjZXNDb250ZW50IjpbImNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vY29udGV4dC1wYWNrYWdlLWZpbmRlcidcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbm90aWZpZXInXG5HaXRDb21taXQgPSByZXF1aXJlICcuLi9naXQtY29tbWl0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZ2l0LmdldFJlcG9Gb3JQYXRoKHBhdGgpXG4gICAgLnRoZW4gKHJlcG8pIC0+XG4gICAgICBmaWxlID0gcmVwby5yZWxhdGl2aXplKHBhdGgpXG4gICAgICBmaWxlID0gdW5kZWZpbmVkIGlmIGZpbGUgaXMgJydcbiAgICAgIGdpdC5hZGQocmVwbywge2ZpbGV9KS50aGVuIC0+IEdpdENvbW1pdChyZXBvKVxuICAgIC5jYXRjaCAoZXJyb3IpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgICAgbm90aWZpZXIuYWRkRXJyb3IgJ1RoZXJlIHdhcyBhbiBlcnJvciBleGVjdXRpbmcgQWRkICsgQ29tbWl0J1xuICBlbHNlXG4gICAgbm90aWZpZXIuYWRkSW5mbyBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gYWRkIGFuZCBjb21taXRcIlxuIl19
