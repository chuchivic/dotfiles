(function() {
  var GitDiff, git;

  git = require('../git');

  GitDiff = require('./git-diff');

  module.exports = function(repo) {
    var args;
    args = ['diff', '--no-color', '--stat'];
    if (atom.config.get('git-plus.diffs.includeStagedDiff')) {
      args.push('HEAD');
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return GitDiff(repo, {
        diffStat: data,
        file: '.'
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi1hbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVMsWUFBVCxFQUF1QixRQUF2QjtJQUNQLElBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBcEI7TUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsRUFBQTs7V0FDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFBVSxPQUFBLENBQVEsSUFBUixFQUFjO1FBQUEsUUFBQSxFQUFVLElBQVY7UUFBZ0IsSUFBQSxFQUFNLEdBQXRCO09BQWQ7SUFBVixDQUROO0VBSGU7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5HaXREaWZmID0gcmVxdWlyZSAnLi9naXQtZGlmZidcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgYXJncyA9IFsnZGlmZicsICctLW5vLWNvbG9yJywgJy0tc3RhdCddXG4gIGFyZ3MucHVzaCAnSEVBRCcgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZidcbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT4gR2l0RGlmZihyZXBvLCBkaWZmU3RhdDogZGF0YSwgZmlsZTogJy4nKVxuIl19
