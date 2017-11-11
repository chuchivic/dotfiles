(function() {
  var GitCheckoutFile, file, git, notifier, repo;

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  GitCheckoutFile = require('../../lib/models/git-checkout-file');

  repo = require('../fixtures').repo;

  file = 'path/to/file';

  describe("GitCheckoutFile", function() {
    it("calls git.cmd with ['checkout', '--', filepath]", function() {
      spyOn(git, 'cmd').andReturn(Promise.resolve());
      GitCheckoutFile(repo, {
        file: file
      });
      return expect(git.cmd).toHaveBeenCalledWith(['checkout', '--', file], {
        cwd: repo.getWorkingDirectory()
      });
    });
    return it("notifies the user when it fails", function() {
      var err;
      err = "error message";
      spyOn(git, 'cmd').andReturn(Promise.reject(err));
      spyOn(notifier, 'addError');
      waitsForPromise(function() {
        return GitCheckoutFile(repo, {
          file: file
        });
      });
      return runs(function() {
        return expect(notifier.addError).toHaveBeenCalledWith(err);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWNoZWNrb3V0LWZpbGUtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSOztFQUNYLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9DQUFSOztFQUNqQixPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUVULElBQUEsR0FBTzs7RUFFUCxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtJQUMxQixFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTtNQUNwRCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFBLENBQTVCO01BQ0EsZUFBQSxDQUFnQixJQUFoQixFQUFzQjtRQUFDLE1BQUEsSUFBRDtPQUF0QjthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsVUFBRCxFQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBckMsRUFBK0Q7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUEvRDtJQUhvRCxDQUF0RDtXQUtBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBO0FBQ3BDLFVBQUE7TUFBQSxHQUFBLEdBQU07TUFDTixLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsTUFBUixDQUFlLEdBQWYsQ0FBNUI7TUFDQSxLQUFBLENBQU0sUUFBTixFQUFnQixVQUFoQjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLGVBQUEsQ0FBZ0IsSUFBaEIsRUFBc0I7VUFBQyxNQUFBLElBQUQ7U0FBdEI7TUFBSCxDQUFoQjthQUNBLElBQUEsQ0FBSyxTQUFBO2VBQUcsTUFBQSxDQUFPLFFBQVEsQ0FBQyxRQUFoQixDQUF5QixDQUFDLG9CQUExQixDQUErQyxHQUEvQztNQUFILENBQUw7SUFMb0MsQ0FBdEM7RUFOMEIsQ0FBNUI7QUFQQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL2xpYi9ub3RpZmllcidcbkdpdENoZWNrb3V0RmlsZSA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWZpbGUnXG57cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcblxuZmlsZSA9ICdwYXRoL3RvL2ZpbGUnXG5cbmRlc2NyaWJlIFwiR2l0Q2hlY2tvdXRGaWxlXCIsIC0+XG4gIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnY2hlY2tvdXQnLCAnLS0nLCBmaWxlcGF0aF1cIiwgLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICBHaXRDaGVja291dEZpbGUocmVwbywge2ZpbGV9KVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2NoZWNrb3V0JywgJy0tJywgZmlsZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIHdoZW4gaXQgZmFpbHNcIiwgLT5cbiAgICBlcnIgPSBcImVycm9yIG1lc3NhZ2VcIlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlamVjdChlcnIpXG4gICAgc3B5T24obm90aWZpZXIsICdhZGRFcnJvcicpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENoZWNrb3V0RmlsZShyZXBvLCB7ZmlsZX0pXG4gICAgcnVucyAtPiBleHBlY3Qobm90aWZpZXIuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIGVyclxuIl19
