(function() {
  var RebaseListView, git;

  git = require('../git');

  RebaseListView = require('../views/rebase-list-view');

  module.exports = function(repo) {
    return git.cmd(['branch', '--no-color'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new RebaseListView(repo, data);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcmViYXNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDJCQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLFlBQVgsQ0FBUixFQUFrQztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWxDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2FBQWMsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixJQUFyQjtJQUFkLENBRE47RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblJlYmFzZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcmViYXNlLWxpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgZ2l0LmNtZChbJ2JyYW5jaCcsICctLW5vLWNvbG9yJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPiBuZXcgUmViYXNlTGlzdFZpZXcocmVwbywgZGF0YSlcbiJdfQ==
