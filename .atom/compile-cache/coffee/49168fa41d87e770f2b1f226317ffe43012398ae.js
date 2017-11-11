(function() {
  var TagView, cwd, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  TagView = require('../../lib/views/tag-view');

  cwd = repo.getWorkingDirectory();

  describe("TagView", function() {
    beforeEach(function() {
      this.tag = 'tag1';
      return this.view = new TagView(repo, this.tag);
    });
    it("displays 5 commands for the tag", function() {
      return expect(this.view.items.length).toBe(5);
    });
    it("gets the remotes to push to when the push command is selected", function() {
      spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('remotes');
      });
      this.view.confirmed(this.view.items[1]);
      return expect(git.cmd).toHaveBeenCalledWith(['remote'], {
        cwd: cwd
      });
    });
    it("calls git.cmd with 'checkout' to checkout the tag when checkout is selected", function() {
      spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('success');
      });
      this.view.confirmed(this.view.items[2]);
      return expect(git.cmd).toHaveBeenCalledWith(['checkout', this.tag], {
        cwd: cwd
      });
    });
    it("calls git.cmd with 'verify' when verify is selected", function() {
      spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('success');
      });
      this.view.confirmed(this.view.items[3]);
      return expect(git.cmd).toHaveBeenCalledWith(['tag', '--verify', this.tag], {
        cwd: cwd
      });
    });
    return it("calls git.cmd with 'delete' when delete is selected", function() {
      spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('success');
      });
      this.view.confirmed(this.view.items[4]);
      return expect(git.cmd).toHaveBeenCalledWith(['tag', '--delete', this.tag], {
        cwd: cwd
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy90YWctdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNMLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSwwQkFBUjs7RUFFVixHQUFBLEdBQU0sSUFBSSxDQUFDLG1CQUFMLENBQUE7O0VBRU4sUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtJQUNsQixVQUFBLENBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxHQUFELEdBQU87YUFDUCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsT0FBQSxDQUFRLElBQVIsRUFBYyxJQUFDLENBQUEsR0FBZjtJQUZILENBQVg7SUFJQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQTthQUNwQyxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQztJQURvQyxDQUF0QztJQUdBLEVBQUEsQ0FBRywrREFBSCxFQUFvRSxTQUFBO01BQ2xFLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUE7ZUFBRyxPQUFPLENBQUMsT0FBUixDQUFnQixTQUFoQjtNQUFILENBQTlCO01BQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFOLENBQWdCLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBNUI7YUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsQ0FBckMsRUFBaUQ7UUFBQyxLQUFBLEdBQUQ7T0FBakQ7SUFIa0UsQ0FBcEU7SUFLQSxFQUFBLENBQUcsNkVBQUgsRUFBa0YsU0FBQTtNQUNoRixLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBO2VBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBaEI7TUFBSCxDQUE5QjtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQTVCO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxVQUFELEVBQWEsSUFBQyxDQUFBLEdBQWQsQ0FBckMsRUFBeUQ7UUFBQyxLQUFBLEdBQUQ7T0FBekQ7SUFIZ0YsQ0FBbEY7SUFLQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtNQUN4RCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBO2VBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBaEI7TUFBSCxDQUE5QjtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQTVCO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixJQUFDLENBQUEsR0FBckIsQ0FBckMsRUFBZ0U7UUFBQyxLQUFBLEdBQUQ7T0FBaEU7SUFId0QsQ0FBMUQ7V0FLQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtNQUN4RCxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBO2VBQUcsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsU0FBaEI7TUFBSCxDQUE5QjtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBTixDQUFnQixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQTVCO2FBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixJQUFDLENBQUEsR0FBckIsQ0FBckMsRUFBZ0U7UUFBQyxLQUFBLEdBQUQ7T0FBaEU7SUFId0QsQ0FBMUQ7RUF2QmtCLENBQXBCO0FBTkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5UYWdWaWV3ID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL3RhZy12aWV3J1xuXG5jd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG5kZXNjcmliZSBcIlRhZ1ZpZXdcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEB0YWcgPSAndGFnMSdcbiAgICBAdmlldyA9IG5ldyBUYWdWaWV3KHJlcG8sIEB0YWcpXG5cbiAgaXQgXCJkaXNwbGF5cyA1IGNvbW1hbmRzIGZvciB0aGUgdGFnXCIsIC0+XG4gICAgZXhwZWN0KEB2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSA1XG5cbiAgaXQgXCJnZXRzIHRoZSByZW1vdGVzIHRvIHB1c2ggdG8gd2hlbiB0aGUgcHVzaCBjb21tYW5kIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlICdyZW1vdGVzJ1xuICAgIEB2aWV3LmNvbmZpcm1lZChAdmlldy5pdGVtc1sxXSlcbiAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydyZW1vdGUnXSwge2N3ZH1cblxuICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnY2hlY2tvdXQnIHRvIGNoZWNrb3V0IHRoZSB0YWcgd2hlbiBjaGVja291dCBpcyBzZWxlY3RlZFwiLCAtPlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+IFByb21pc2UucmVzb2x2ZSAnc3VjY2VzcydcbiAgICBAdmlldy5jb25maXJtZWQoQHZpZXcuaXRlbXNbMl0pXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnY2hlY2tvdXQnLCBAdGFnXSwge2N3ZH1cblxuICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAndmVyaWZ5JyB3aGVuIHZlcmlmeSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+IFByb21pc2UucmVzb2x2ZSAnc3VjY2VzcydcbiAgICBAdmlldy5jb25maXJtZWQoQHZpZXcuaXRlbXNbM10pXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsndGFnJywgJy0tdmVyaWZ5JywgQHRhZ10sIHtjd2R9XG5cbiAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ2RlbGV0ZScgd2hlbiBkZWxldGUgaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgJ3N1Y2Nlc3MnXG4gICAgQHZpZXcuY29uZmlybWVkKEB2aWV3Lml0ZW1zWzRdKVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3RhZycsICctLWRlbGV0ZScsIEB0YWddLCB7Y3dkfVxuIl19
