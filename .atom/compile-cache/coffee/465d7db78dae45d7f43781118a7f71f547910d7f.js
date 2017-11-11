(function() {
  var StatusListView, git;

  git = require('../git');

  StatusListView = require('../views/status-list-view');

  module.exports = function(repo) {
    return git.status(repo).then(function(data) {
      return new StatusListView(repo, data);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3RhdHVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGNBQUEsR0FBaUIsT0FBQSxDQUFRLDJCQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7V0FDZixHQUFHLENBQUMsTUFBSixDQUFXLElBQVgsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixTQUFDLElBQUQ7YUFBYyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLElBQXJCO0lBQWQsQ0FBdEI7RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblN0YXR1c0xpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3Mvc3RhdHVzLWxpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgZ2l0LnN0YXR1cyhyZXBvKS50aGVuIChkYXRhKSAtPiBuZXcgU3RhdHVzTGlzdFZpZXcocmVwbywgZGF0YSlcbiJdfQ==
