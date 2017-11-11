(function() {
  var git;

  git = require('../git');

  module.exports = function(repos) {
    return repos.map(function(repo) {
      var cwd;
      cwd = repo.getWorkingDirectory();
      return git.cmd(['fetch', '--all'], {
        cwd: cwd
      }).then(function(message) {
        var options, repoName;
        if (atom.config.get('git-plus.experimental.autoFetchNotify')) {
          repoName = cwd.split('/').pop();
          options = {
            icon: 'repo-pull',
            detail: "In " + repoName + " repo:",
            description: message.replace(/(Fetch)ing/g, '$1ed')
          };
          return atom.notifications.addSuccess('Git-Plus', options);
        }
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZmV0Y2gtYWxsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsS0FBRDtXQUNmLEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxJQUFEO0FBQ1IsVUFBQTtNQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsbUJBQUwsQ0FBQTthQUNOLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxPQUFELEVBQVMsT0FBVCxDQUFSLEVBQTJCO1FBQUMsS0FBQSxHQUFEO09BQTNCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxPQUFEO0FBQ0osWUFBQTtRQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixDQUFIO1VBQ0UsUUFBQSxHQUFXLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixDQUFjLENBQUMsR0FBZixDQUFBO1VBQ1gsT0FBQSxHQUNFO1lBQUEsSUFBQSxFQUFNLFdBQU47WUFDQSxNQUFBLEVBQVEsS0FBQSxHQUFNLFFBQU4sR0FBZSxRQUR2QjtZQUVBLFdBQUEsRUFBYSxPQUFPLENBQUMsT0FBUixDQUFnQixhQUFoQixFQUErQixNQUEvQixDQUZiOztpQkFHRixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLFVBQTlCLEVBQTBDLE9BQTFDLEVBTkY7O01BREksQ0FETjtJQUZRLENBQVY7RUFEZTtBQUZqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwb3MpIC0+XG4gIHJlcG9zLm1hcCAocmVwbykgLT5cbiAgICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICAgIGdpdC5jbWQoWydmZXRjaCcsJy0tYWxsJ10sIHtjd2R9KVxuICAgIC50aGVuIChtZXNzYWdlKSAtPlxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwuYXV0b0ZldGNoTm90aWZ5JylcbiAgICAgICAgcmVwb05hbWUgPSBjd2Quc3BsaXQoJy8nKS5wb3AoKVxuICAgICAgICBvcHRpb25zID1cbiAgICAgICAgICBpY29uOiAncmVwby1wdWxsJ1xuICAgICAgICAgIGRldGFpbDogXCJJbiAje3JlcG9OYW1lfSByZXBvOlwiXG4gICAgICAgICAgZGVzY3JpcHRpb246IG1lc3NhZ2UucmVwbGFjZSgvKEZldGNoKWluZy9nLCAnJDFlZCcpXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKCdHaXQtUGx1cycsIG9wdGlvbnMpXG4iXX0=
