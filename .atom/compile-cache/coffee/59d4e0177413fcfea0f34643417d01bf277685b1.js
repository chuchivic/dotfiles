(function() {
  var GitCherryPick, repo;

  repo = require('../fixtures').repo;

  GitCherryPick = require('../../lib/models/git-cherry-pick');

  describe("GitCherryPick", function() {
    it("gets heads from the repo's references", function() {
      spyOn(repo, 'getReferences').andCallThrough();
      GitCherryPick(repo);
      return expect(repo.getReferences).toHaveBeenCalled();
    });
    return it("calls replace on each head with to remove 'refs/heads/'", function() {
      var head;
      head = repo.getReferences().heads[0];
      GitCherryPick(repo);
      return expect(head.replace).toHaveBeenCalledWith('refs/heads/', '');
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWNoZXJyeS1waWNrLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtDQUFSOztFQUVoQixRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0lBQ3hCLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBO01BQzFDLEtBQUEsQ0FBTSxJQUFOLEVBQVksZUFBWixDQUE0QixDQUFDLGNBQTdCLENBQUE7TUFDQSxhQUFBLENBQWMsSUFBZDthQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsYUFBWixDQUEwQixDQUFDLGdCQUEzQixDQUFBO0lBSDBDLENBQTVDO1dBS0EsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUE7QUFDNUQsVUFBQTtNQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsYUFBTCxDQUFBLENBQW9CLENBQUMsS0FBTSxDQUFBLENBQUE7TUFDbEMsYUFBQSxDQUFjLElBQWQ7YUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxvQkFBckIsQ0FBMEMsYUFBMUMsRUFBeUQsRUFBekQ7SUFINEQsQ0FBOUQ7RUFOd0IsQ0FBMUI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0Q2hlcnJ5UGljayA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWNoZXJyeS1waWNrJ1xuXG5kZXNjcmliZSBcIkdpdENoZXJyeVBpY2tcIiwgLT5cbiAgaXQgXCJnZXRzIGhlYWRzIGZyb20gdGhlIHJlcG8ncyByZWZlcmVuY2VzXCIsIC0+XG4gICAgc3B5T24ocmVwbywgJ2dldFJlZmVyZW5jZXMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgR2l0Q2hlcnJ5UGljayByZXBvXG4gICAgZXhwZWN0KHJlcG8uZ2V0UmVmZXJlbmNlcykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgaXQgXCJjYWxscyByZXBsYWNlIG9uIGVhY2ggaGVhZCB3aXRoIHRvIHJlbW92ZSAncmVmcy9oZWFkcy8nXCIsIC0+XG4gICAgaGVhZCA9IHJlcG8uZ2V0UmVmZXJlbmNlcygpLmhlYWRzWzBdXG4gICAgR2l0Q2hlcnJ5UGljayByZXBvXG4gICAgZXhwZWN0KGhlYWQucmVwbGFjZSkudG9IYXZlQmVlbkNhbGxlZFdpdGggJ3JlZnMvaGVhZHMvJywgJydcbiJdfQ==
