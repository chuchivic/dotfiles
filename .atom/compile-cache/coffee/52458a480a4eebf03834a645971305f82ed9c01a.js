(function() {
  var GitStashApply, GitStashDrop, GitStashPop, GitStashSave, colorOptions, git, options, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitStashApply = require('../../lib/models/git-stash-apply');

  GitStashSave = require('../../lib/models/git-stash-save');

  GitStashPop = require('../../lib/models/git-stash-pop');

  GitStashDrop = require('../../lib/models/git-stash-drop');

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  describe("Git Stash commands", function() {
    describe("Apply", function() {
      return it("calls git.cmd with 'stash' and 'apply'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashApply(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'apply'], options, colorOptions);
      });
    });
    describe("Save", function() {
      return it("calls git.cmd with 'stash' and 'save'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashSave(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'save'], options, colorOptions);
      });
    });
    describe("Save with message", function() {
      return it("calls git.cmd with 'stash', 'save', and provides message", function() {
        var message;
        message = 'foobar';
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashSave(repo, {
          message: message
        });
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'save', message], options, colorOptions);
      });
    });
    describe("Pop", function() {
      return it("calls git.cmd with 'stash' and 'pop'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashPop(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'pop'], options, colorOptions);
      });
    });
    return describe("Drop", function() {
      return it("calls git.cmd with 'stash' and 'drop'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(true));
        GitStashDrop(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['stash', 'drop'], options, colorOptions);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXN0YXNoLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQ0FBUjs7RUFDaEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQ0FBUjs7RUFDZixXQUFBLEdBQWMsT0FBQSxDQUFRLGdDQUFSOztFQUNkLFlBQUEsR0FBZSxPQUFBLENBQVEsaUNBQVI7O0VBRWYsT0FBQSxHQUNFO0lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7OztFQUNGLFlBQUEsR0FDRTtJQUFBLEtBQUEsRUFBTyxJQUFQOzs7RUFFRixRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtJQUM3QixRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO2FBQ2hCLEVBQUEsQ0FBRyx3Q0FBSCxFQUE2QyxTQUFBO1FBQzNDLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO1FBQ0EsYUFBQSxDQUFjLElBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxPQUFWLENBQXJDLEVBQXlELE9BQXpELEVBQWtFLFlBQWxFO01BSDJDLENBQTdDO0lBRGdCLENBQWxCO0lBTUEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsU0FBQTthQUNmLEVBQUEsQ0FBRyx1Q0FBSCxFQUE0QyxTQUFBO1FBQzFDLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQTVCO1FBQ0EsWUFBQSxDQUFhLElBQWI7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxNQUFWLENBQXJDLEVBQXdELE9BQXhELEVBQWlFLFlBQWpFO01BSDBDLENBQTVDO0lBRGUsQ0FBakI7SUFNQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTthQUM1QixFQUFBLENBQUcsMERBQUgsRUFBK0QsU0FBQTtBQUM3RCxZQUFBO1FBQUEsT0FBQSxHQUFVO1FBQ1YsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7UUFDQSxZQUFBLENBQWEsSUFBYixFQUFtQjtVQUFDLFNBQUEsT0FBRDtTQUFuQjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsT0FBbEIsQ0FBckMsRUFBaUUsT0FBakUsRUFBMEUsWUFBMUU7TUFKNkQsQ0FBL0Q7SUFENEIsQ0FBOUI7SUFPQSxRQUFBLENBQVMsS0FBVCxFQUFnQixTQUFBO2FBQ2QsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUE7UUFDekMsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7UUFDQSxXQUFBLENBQVksSUFBWjtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FBckMsRUFBdUQsT0FBdkQsRUFBZ0UsWUFBaEU7TUFIeUMsQ0FBM0M7SUFEYyxDQUFoQjtXQU1BLFFBQUEsQ0FBUyxNQUFULEVBQWlCLFNBQUE7YUFDZixFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQTtRQUMxQyxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixDQUE1QjtRQUNBLFlBQUEsQ0FBYSxJQUFiO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUFyQyxFQUF3RCxPQUF4RCxFQUFpRSxZQUFqRTtNQUgwQyxDQUE1QztJQURlLENBQWpCO0VBMUI2QixDQUEvQjtBQVpBIiwic291cmNlc0NvbnRlbnQiOlsie3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5naXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xuR2l0U3Rhc2hBcHBseSA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXN0YXNoLWFwcGx5J1xuR2l0U3Rhc2hTYXZlID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc3Rhc2gtc2F2ZSdcbkdpdFN0YXNoUG9wID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc3Rhc2gtcG9wJ1xuR2l0U3Rhc2hEcm9wID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc3Rhc2gtZHJvcCdcblxub3B0aW9ucyA9XG4gIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbmNvbG9yT3B0aW9ucyA9XG4gIGNvbG9yOiB0cnVlXG5cbmRlc2NyaWJlIFwiR2l0IFN0YXNoIGNvbW1hbmRzXCIsIC0+XG4gIGRlc2NyaWJlIFwiQXBwbHlcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnc3Rhc2gnIGFuZCAnYXBwbHknXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIEdpdFN0YXNoQXBwbHkocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3N0YXNoJywgJ2FwcGx5J10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwiU2F2ZVwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdzdGFzaCcgYW5kICdzYXZlJ1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBHaXRTdGFzaFNhdmUocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3N0YXNoJywgJ3NhdmUnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJTYXZlIHdpdGggbWVzc2FnZVwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdzdGFzaCcsICdzYXZlJywgYW5kIHByb3ZpZGVzIG1lc3NhZ2VcIiwgLT5cbiAgICAgIG1lc3NhZ2UgPSAnZm9vYmFyJ1xuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBHaXRTdGFzaFNhdmUocmVwbywge21lc3NhZ2V9KVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnc3Rhc2gnLCAnc2F2ZScsIG1lc3NhZ2VdLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcblxuICBkZXNjcmliZSBcIlBvcFwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICdzdGFzaCcgYW5kICdwb3AnXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIEdpdFN0YXNoUG9wKHJlcG8pXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydzdGFzaCcsICdwb3AnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJEcm9wXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ3N0YXNoJyBhbmQgJ2Ryb3AnXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIEdpdFN0YXNoRHJvcChyZXBvKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnc3Rhc2gnLCAnZHJvcCddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcbiJdfQ==
