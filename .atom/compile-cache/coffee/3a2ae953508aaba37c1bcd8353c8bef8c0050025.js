(function() {
  var GitStatus, git, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitStatus = require('../../lib/models/git-status');

  describe("GitStatus", function() {
    beforeEach(function() {
      return spyOn(git, 'status').andReturn(Promise.resolve('foobar'));
    });
    it("calls git.status", function() {
      GitStatus(repo);
      return expect(git.status).toHaveBeenCalledWith(repo);
    });
    return it("creates a new StatusListView", function() {
      return GitStatus(repo).then(function(view) {
        return expect(view).toBeDefined();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXN0YXR1cy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sU0FBQSxHQUFZLE9BQUEsQ0FBUSw2QkFBUjs7RUFFWixRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO0lBQ3BCLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxRQUFYLENBQW9CLENBQUMsU0FBckIsQ0FBK0IsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBL0I7SUFEUyxDQUFYO0lBR0EsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7TUFDckIsU0FBQSxDQUFVLElBQVY7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLE1BQVgsQ0FBa0IsQ0FBQyxvQkFBbkIsQ0FBd0MsSUFBeEM7SUFGcUIsQ0FBdkI7V0FJQSxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQTthQUNqQyxTQUFBLENBQVUsSUFBVixDQUFlLENBQUMsSUFBaEIsQ0FBcUIsU0FBQyxJQUFEO2VBQ25CLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxXQUFiLENBQUE7TUFEbUIsQ0FBckI7SUFEaUMsQ0FBbkM7RUFSb0IsQ0FBdEI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdFN0YXR1cyA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXN0YXR1cydcblxuZGVzY3JpYmUgXCJHaXRTdGF0dXNcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNweU9uKGdpdCwgJ3N0YXR1cycpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgJ2Zvb2JhcidcblxuICBpdCBcImNhbGxzIGdpdC5zdGF0dXNcIiwgLT5cbiAgICBHaXRTdGF0dXMocmVwbylcbiAgICBleHBlY3QoZ2l0LnN0YXR1cykudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwb1xuXG4gIGl0IFwiY3JlYXRlcyBhIG5ldyBTdGF0dXNMaXN0Vmlld1wiLCAtPlxuICAgIEdpdFN0YXR1cyhyZXBvKS50aGVuICh2aWV3KSAtPlxuICAgICAgZXhwZWN0KHZpZXcpLnRvQmVEZWZpbmVkKClcbiJdfQ==
