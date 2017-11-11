(function() {
  var CherryPickSelectCommits, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  CherryPickSelectCommits = require('../../lib/views/cherry-pick-select-commits-view');

  describe("CherryPickSelectCommits view", function() {
    beforeEach(function() {
      return this.view = new CherryPickSelectCommits(repo, ['commit1', 'commit2']);
    });
    it("displays a list of commits", function() {
      return expect(this.view.items.length).toBe(2);
    });
    return it("calls git.cmd with 'cherry-pick' and the selected commits", function() {
      spyOn(git, 'cmd').andReturn(Promise.resolve('success'));
      this.view.confirmSelection();
      this.view.selectNextItemView();
      this.view.confirmSelection();
      this.view.find('.btn-pick-button').click();
      return expect(git.cmd).toHaveBeenCalledWith(['cherry-pick', 'commit1', 'commit2'], {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9jaGVycnktcGljay1zZWxlY3QtY29tbWl0LXZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTCxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULHVCQUFBLEdBQTBCLE9BQUEsQ0FBUSxpREFBUjs7RUFFMUIsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUE7SUFDdkMsVUFBQSxDQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsdUJBQUEsQ0FBd0IsSUFBeEIsRUFBOEIsQ0FBQyxTQUFELEVBQVksU0FBWixDQUE5QjtJQURILENBQVg7SUFHQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQTthQUMvQixNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQztJQUQrQixDQUFqQztXQUdBLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBO01BQzlELEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFNBQWhCLENBQTVCO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxrQkFBTixDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUFBO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsa0JBQVgsQ0FBOEIsQ0FBQyxLQUEvQixDQUFBO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxhQUFELEVBQWdCLFNBQWhCLEVBQTJCLFNBQTNCLENBQXJDLEVBQTRFO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBNUU7SUFOOEQsQ0FBaEU7RUFQdUMsQ0FBekM7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbkNoZXJyeVBpY2tTZWxlY3RDb21taXRzID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL2NoZXJyeS1waWNrLXNlbGVjdC1jb21taXRzLXZpZXcnXG5cbmRlc2NyaWJlIFwiQ2hlcnJ5UGlja1NlbGVjdENvbW1pdHMgdmlld1wiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgQHZpZXcgPSBuZXcgQ2hlcnJ5UGlja1NlbGVjdENvbW1pdHMocmVwbywgWydjb21taXQxJywgJ2NvbW1pdDInXSlcblxuICBpdCBcImRpc3BsYXlzIGEgbGlzdCBvZiBjb21taXRzXCIsIC0+XG4gICAgZXhwZWN0KEB2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG5cbiAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ2NoZXJyeS1waWNrJyBhbmQgdGhlIHNlbGVjdGVkIGNvbW1pdHNcIiwgLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdzdWNjZXNzJ1xuICAgIEB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgIEB2aWV3LnNlbGVjdE5leHRJdGVtVmlldygpXG4gICAgQHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgQHZpZXcuZmluZCgnLmJ0bi1waWNrLWJ1dHRvbicpLmNsaWNrKClcbiAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydjaGVycnktcGljaycsICdjb21taXQxJywgJ2NvbW1pdDInXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuIl19
