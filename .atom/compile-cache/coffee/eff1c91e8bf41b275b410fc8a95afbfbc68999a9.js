(function() {
  var GitCheckoutFile, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitCheckoutFile = require('../git-checkout-file');

  module.exports = function() {
    var path, ref;
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        return atom.confirm({
          message: "Are you sure you want to reset " + (repo.relativize(path)) + " to HEAD",
          buttons: {
            Yes: function() {
              return GitCheckoutFile(repo, {
                file: repo.relativize(path)
              });
            },
            No: function() {}
          }
        });
      });
    } else {
      return notifier.addInfo("No file selected to checkout");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1jaGVja291dC1maWxlLWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLEdBQUEsR0FBTSxPQUFBLENBQVEsV0FBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUNYLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUVsQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO0FBQ2YsUUFBQTtJQUFBLElBQUcsSUFBQSxtREFBaUMsQ0FBRSxxQkFBdEM7YUFDRSxHQUFHLENBQUMsY0FBSixDQUFtQixJQUFuQixDQUF3QixDQUFDLElBQXpCLENBQThCLFNBQUMsSUFBRDtlQUM1QixJQUFJLENBQUMsT0FBTCxDQUNFO1VBQUEsT0FBQSxFQUFTLGlDQUFBLEdBQWlDLENBQUMsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBRCxDQUFqQyxHQUF3RCxVQUFqRTtVQUNBLE9BQUEsRUFDRTtZQUFBLEdBQUEsRUFBSyxTQUFBO3FCQUFHLGVBQUEsQ0FBZ0IsSUFBaEIsRUFBc0I7Z0JBQUEsSUFBQSxFQUFNLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQU47ZUFBdEI7WUFBSCxDQUFMO1lBQ0EsRUFBQSxFQUFLLFNBQUEsR0FBQSxDQURMO1dBRkY7U0FERjtNQUQ0QixDQUE5QixFQURGO0tBQUEsTUFBQTthQVFFLFFBQVEsQ0FBQyxPQUFULENBQWlCLDhCQUFqQixFQVJGOztFQURlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcbkdpdENoZWNrb3V0RmlsZSA9IHJlcXVpcmUgJy4uL2dpdC1jaGVja291dC1maWxlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IC0+XG4gIGlmIHBhdGggPSBjb250ZXh0UGFja2FnZUZpbmRlci5nZXQoKT8uc2VsZWN0ZWRQYXRoXG4gICAgZ2l0LmdldFJlcG9Gb3JQYXRoKHBhdGgpLnRoZW4gKHJlcG8pIC0+XG4gICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgbWVzc2FnZTogXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQgI3tyZXBvLnJlbGF0aXZpemUocGF0aCl9IHRvIEhFQURcIlxuICAgICAgICBidXR0b25zOlxuICAgICAgICAgIFllczogLT4gR2l0Q2hlY2tvdXRGaWxlIHJlcG8sIGZpbGU6IHJlcG8ucmVsYXRpdml6ZShwYXRoKVxuICAgICAgICAgIE5vOiAgLT5cbiAgZWxzZVxuICAgIG5vdGlmaWVyLmFkZEluZm8gXCJObyBmaWxlIHNlbGVjdGVkIHRvIGNoZWNrb3V0XCJcbiJdfQ==
