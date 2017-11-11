(function() {
  var filesFromData, git;

  git = require('../git');

  filesFromData = function(statusData) {
    var files, i, len, line, lineMatch;
    files = [];
    for (i = 0, len = statusData.length; i < len; i++) {
      line = statusData[i];
      lineMatch = line.match(/^([ MARCU?!]{2})\s{1}(.*)/);
      if (lineMatch) {
        files.push(lineMatch[2]);
      }
    }
    return files;
  };

  module.exports = function(repo) {
    return git.status(repo).then(function(statusData) {
      var file, i, len, ref, results;
      ref = filesFromData(statusData);
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        results.push(atom.workspace.open(file));
      }
      return results;
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtb3Blbi1jaGFuZ2VkLWZpbGVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLGFBQUEsR0FBZ0IsU0FBQyxVQUFEO0FBQ2QsUUFBQTtJQUFBLEtBQUEsR0FBUTtBQUNSLFNBQUEsNENBQUE7O01BQ0UsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsMkJBQVg7TUFDWixJQUEyQixTQUEzQjtRQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBVSxDQUFBLENBQUEsQ0FBckIsRUFBQTs7QUFGRjtXQUdBO0VBTGM7O0VBT2hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtXQUNmLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBWCxDQUFnQixDQUFDLElBQWpCLENBQXNCLFNBQUMsVUFBRDtBQUNwQixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsSUFBcEI7QUFERjs7SUFEb0IsQ0FBdEI7RUFEZTtBQVRqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxuZmlsZXNGcm9tRGF0YSA9IChzdGF0dXNEYXRhKSAtPlxuICBmaWxlcyA9IFtdXG4gIGZvciBsaW5lIGluIHN0YXR1c0RhdGFcbiAgICBsaW5lTWF0Y2ggPSBsaW5lLm1hdGNoIC9eKFsgTUFSQ1U/IV17Mn0pXFxzezF9KC4qKS9cbiAgICBmaWxlcy5wdXNoIGxpbmVNYXRjaFsyXSBpZiBsaW5lTWF0Y2hcbiAgZmlsZXNcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YXR1cyhyZXBvKS50aGVuIChzdGF0dXNEYXRhKSAtPlxuICAgIGZvciBmaWxlIGluIGZpbGVzRnJvbURhdGEoc3RhdHVzRGF0YSlcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSlcbiJdfQ==
