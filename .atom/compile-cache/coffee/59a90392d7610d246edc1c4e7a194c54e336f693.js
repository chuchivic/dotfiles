(function() {
  var GitPush, contextPackageFinder, git, notifier;

  contextPackageFinder = require('../../context-package-finder');

  git = require('../../git');

  notifier = require('../../notifier');

  GitPush = require('../git-push');

  module.exports = function(options) {
    var path, ref;
    if (options == null) {
      options = {};
    }
    if (path = (ref = contextPackageFinder.get()) != null ? ref.selectedPath : void 0) {
      return git.getRepoForPath(path).then(function(repo) {
        return GitPush(repo, options);
      });
    } else {
      return notifier.addInfo("No repository found");
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9jb250ZXh0L2dpdC1wdXNoLWNvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxvQkFBQSxHQUF1QixPQUFBLENBQVEsOEJBQVI7O0VBQ3ZCLEdBQUEsR0FBTSxPQUFBLENBQVEsV0FBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGdCQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsYUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE9BQUQ7QUFDZixRQUFBOztNQURnQixVQUFROztJQUN4QixJQUFHLElBQUEsbURBQWlDLENBQUUscUJBQXRDO2FBQ0UsR0FBRyxDQUFDLGNBQUosQ0FBbUIsSUFBbkIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixTQUFDLElBQUQ7ZUFBVSxPQUFBLENBQVEsSUFBUixFQUFjLE9BQWQ7TUFBVixDQUE5QixFQURGO0tBQUEsTUFBQTthQUdFLFFBQVEsQ0FBQyxPQUFULENBQWlCLHFCQUFqQixFQUhGOztFQURlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiY29udGV4dFBhY2thZ2VGaW5kZXIgPSByZXF1aXJlICcuLi8uLi9jb250ZXh0LXBhY2thZ2UtZmluZGVyJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi8uLi9ub3RpZmllcidcbkdpdFB1c2ggPSByZXF1aXJlICcuLi9naXQtcHVzaCdcblxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucz17fSktPlxuICBpZiBwYXRoID0gY29udGV4dFBhY2thZ2VGaW5kZXIuZ2V0KCk/LnNlbGVjdGVkUGF0aFxuICAgIGdpdC5nZXRSZXBvRm9yUGF0aChwYXRoKS50aGVuIChyZXBvKSAtPiBHaXRQdXNoKHJlcG8sIG9wdGlvbnMpXG4gIGVsc2VcbiAgICBub3RpZmllci5hZGRJbmZvIFwiTm8gcmVwb3NpdG9yeSBmb3VuZFwiXG4iXX0=
