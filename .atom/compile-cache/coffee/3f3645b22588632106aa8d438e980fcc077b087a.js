(function() {
  var SelectUnstageFiles, git;

  git = require('../git');

  SelectUnstageFiles = require('../views/select-unstage-files-view');

  module.exports = function(repo) {
    return git.stagedFiles(repo).then(function(data) {
      return new SelectUnstageFiles(repo, data);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtdW5zdGFnZS1maWxlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixrQkFBQSxHQUFxQixPQUFBLENBQVEsb0NBQVI7O0VBRXJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtXQUNmLEdBQUcsQ0FBQyxXQUFKLENBQWdCLElBQWhCLENBQXFCLENBQUMsSUFBdEIsQ0FBMkIsU0FBQyxJQUFEO2FBQWMsSUFBQSxrQkFBQSxDQUFtQixJQUFuQixFQUF5QixJQUF6QjtJQUFkLENBQTNCO0VBRGU7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5TZWxlY3RVbnN0YWdlRmlsZXMgPSByZXF1aXJlICcuLi92aWV3cy9zZWxlY3QtdW5zdGFnZS1maWxlcy12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBnaXQuc3RhZ2VkRmlsZXMocmVwbykudGhlbiAoZGF0YSkgLT4gbmV3IFNlbGVjdFVuc3RhZ2VGaWxlcyhyZXBvLCBkYXRhKVxuIl19
