(function() {
  var GitCheckoutNewBranch, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitCheckoutNewBranch = require('../../lib/models/git-checkout-new-branch');

  describe("GitCheckoutNewBranch", function() {
    var inputView;
    inputView = null;
    beforeEach(function() {
      spyOn(atom.workspace, 'addModalPanel').andCallThrough();
      spyOn(git, 'cmd').andReturn(Promise.resolve('new branch created'));
      return inputView = GitCheckoutNewBranch(repo);
    });
    it("displays a text input", function() {
      return expect(atom.workspace.addModalPanel).toHaveBeenCalled();
    });
    describe("when the input has no text and it is submitted", function() {
      return it("does nothing", function() {
        inputView.branchEditor.setText('');
        inputView.createBranch();
        return expect(git.cmd).not.toHaveBeenCalled();
      });
    });
    return describe("when the input has text and it is submitted", function() {
      return it("runs 'checkout -b' with the submitted name", function() {
        var branchName;
        branchName = 'neat/-branch';
        inputView.branchEditor.setText(branchName);
        inputView.createBranch();
        return expect(git.cmd).toHaveBeenCalledWith(['checkout', '-b', branchName], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWNoZWNrb3V0LW5ldy1icmFuY2gtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTCxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULG9CQUFBLEdBQXVCLE9BQUEsQ0FBUSwwQ0FBUjs7RUFFdkIsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUE7QUFDL0IsUUFBQTtJQUFBLFNBQUEsR0FBWTtJQUVaLFVBQUEsQ0FBVyxTQUFBO01BQ1QsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLGVBQXRCLENBQXNDLENBQUMsY0FBdkMsQ0FBQTtNQUNBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLG9CQUFoQixDQUE1QjthQUNBLFNBQUEsR0FBWSxvQkFBQSxDQUFxQixJQUFyQjtJQUhILENBQVg7SUFLQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTthQUMxQixNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUF0QixDQUFvQyxDQUFDLGdCQUFyQyxDQUFBO0lBRDBCLENBQTVCO0lBR0EsUUFBQSxDQUFTLGdEQUFULEVBQTJELFNBQUE7YUFDekQsRUFBQSxDQUFHLGNBQUgsRUFBbUIsU0FBQTtRQUNqQixTQUFTLENBQUMsWUFBWSxDQUFDLE9BQXZCLENBQStCLEVBQS9CO1FBQ0EsU0FBUyxDQUFDLFlBQVYsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsR0FBRyxDQUFDLGdCQUFwQixDQUFBO01BSGlCLENBQW5CO0lBRHlELENBQTNEO1dBTUEsUUFBQSxDQUFTLDZDQUFULEVBQXdELFNBQUE7YUFDdEQsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUE7QUFDL0MsWUFBQTtRQUFBLFVBQUEsR0FBYTtRQUNiLFNBQVMsQ0FBQyxZQUFZLENBQUMsT0FBdkIsQ0FBK0IsVUFBL0I7UUFDQSxTQUFTLENBQUMsWUFBVixDQUFBO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixVQUFuQixDQUFyQyxFQUFxRTtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1NBQXJFO01BSitDLENBQWpEO0lBRHNELENBQXhEO0VBakIrQixDQUFqQztBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSgnLi4vLi4vbGliL2dpdCcpXG57cmVwb30gPSByZXF1aXJlKCcuLi9maXh0dXJlcycpXG5HaXRDaGVja291dE5ld0JyYW5jaCA9IHJlcXVpcmUoJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWNoZWNrb3V0LW5ldy1icmFuY2gnKVxuXG5kZXNjcmliZSBcIkdpdENoZWNrb3V0TmV3QnJhbmNoXCIsIC0+XG4gIGlucHV0VmlldyA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdhZGRNb2RhbFBhbmVsJykuYW5kQ2FsbFRocm91Z2goKVxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybihQcm9taXNlLnJlc29sdmUoJ25ldyBicmFuY2ggY3JlYXRlZCcpKVxuICAgIGlucHV0VmlldyA9IEdpdENoZWNrb3V0TmV3QnJhbmNoKHJlcG8pXG5cbiAgaXQgXCJkaXNwbGF5cyBhIHRleHQgaW5wdXRcIiwgLT5cbiAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbnB1dCBoYXMgbm8gdGV4dCBhbmQgaXQgaXMgc3VibWl0dGVkXCIsIC0+XG4gICAgaXQgXCJkb2VzIG5vdGhpbmdcIiwgLT5cbiAgICAgIGlucHV0Vmlldy5icmFuY2hFZGl0b3Iuc2V0VGV4dCAnJ1xuICAgICAgaW5wdXRWaWV3LmNyZWF0ZUJyYW5jaCgpXG4gICAgICBleHBlY3QoZ2l0LmNtZCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGUgaW5wdXQgaGFzIHRleHQgYW5kIGl0IGlzIHN1Ym1pdHRlZFwiLCAtPlxuICAgIGl0IFwicnVucyAnY2hlY2tvdXQgLWInIHdpdGggdGhlIHN1Ym1pdHRlZCBuYW1lXCIsIC0+XG4gICAgICBicmFuY2hOYW1lID0gJ25lYXQvLWJyYW5jaCdcbiAgICAgIGlucHV0Vmlldy5icmFuY2hFZGl0b3Iuc2V0VGV4dCBicmFuY2hOYW1lXG4gICAgICBpbnB1dFZpZXcuY3JlYXRlQnJhbmNoKClcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2NoZWNrb3V0JywgJy1iJywgYnJhbmNoTmFtZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiJdfQ==
