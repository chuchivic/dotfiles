(function() {
  var CherryPickSelectBranch, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  CherryPickSelectBranch = require('../../lib/views/cherry-pick-select-branch-view');

  describe("CherryPickSelectBranch view", function() {
    beforeEach(function() {
      return this.view = new CherryPickSelectBranch(repo, ['head1', 'head2'], 'currentHead');
    });
    it("displays a list of branches", function() {
      return expect(this.view.items.length).toBe(2);
    });
    return it("calls git.cmd to get commits between currentHead and selected head", function() {
      var expectedArgs;
      spyOn(git, 'cmd').andReturn(Promise.resolve('heads'));
      this.view.confirmSelection();
      expectedArgs = ['log', '--cherry-pick', '-z', '--format=%H%n%an%n%ar%n%s', "currentHead...head1"];
      return expect(git.cmd).toHaveBeenCalledWith(expectedArgs, {
        cwd: repo.getWorkingDirectory()
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9jaGVycnktcGljay1zZWxlY3QtYnJhbmNoLXZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTCxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxnREFBUjs7RUFFekIsUUFBQSxDQUFTLDZCQUFULEVBQXdDLFNBQUE7SUFDdEMsVUFBQSxDQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsc0JBQUEsQ0FBdUIsSUFBdkIsRUFBNkIsQ0FBQyxPQUFELEVBQVUsT0FBVixDQUE3QixFQUFpRCxhQUFqRDtJQURILENBQVg7SUFHQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTthQUNoQyxNQUFBLENBQU8sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQztJQURnQyxDQUFsQztXQUdBLEVBQUEsQ0FBRyxvRUFBSCxFQUF5RSxTQUFBO0FBQ3ZFLFVBQUE7TUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixPQUFoQixDQUE1QjtNQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsZ0JBQU4sQ0FBQTtNQUNBLFlBQUEsR0FBZSxDQUNiLEtBRGEsRUFFYixlQUZhLEVBR2IsSUFIYSxFQUliLDJCQUphLEVBS2IscUJBTGE7YUFPZixNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxZQUFyQyxFQUFtRDtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQW5EO0lBVnVFLENBQXpFO0VBUHNDLENBQXhDO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5DaGVycnlQaWNrU2VsZWN0QnJhbmNoID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL2NoZXJyeS1waWNrLXNlbGVjdC1icmFuY2gtdmlldydcblxuZGVzY3JpYmUgXCJDaGVycnlQaWNrU2VsZWN0QnJhbmNoIHZpZXdcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIEB2aWV3ID0gbmV3IENoZXJyeVBpY2tTZWxlY3RCcmFuY2gocmVwbywgWydoZWFkMScsICdoZWFkMiddLCAnY3VycmVudEhlYWQnKVxuXG4gIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIGJyYW5jaGVzXCIsIC0+XG4gICAgZXhwZWN0KEB2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG5cbiAgaXQgXCJjYWxscyBnaXQuY21kIHRvIGdldCBjb21taXRzIGJldHdlZW4gY3VycmVudEhlYWQgYW5kIHNlbGVjdGVkIGhlYWRcIiwgLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdoZWFkcydcbiAgICBAdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICBleHBlY3RlZEFyZ3MgPSBbXG4gICAgICAnbG9nJ1xuICAgICAgJy0tY2hlcnJ5LXBpY2snXG4gICAgICAnLXonXG4gICAgICAnLS1mb3JtYXQ9JUglbiVhbiVuJWFyJW4lcydcbiAgICAgIFwiY3VycmVudEhlYWQuLi5oZWFkMVwiXG4gICAgXVxuICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBleHBlY3RlZEFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiJdfQ==
