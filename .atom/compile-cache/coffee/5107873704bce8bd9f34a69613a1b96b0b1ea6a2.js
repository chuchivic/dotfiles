(function() {
  var GitPull, _pull, git, notifier, options, repo;

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  repo = require('../fixtures').repo;

  GitPull = require('../../lib/models/git-pull');

  _pull = require('../../lib/models/_pull');

  options = {
    cwd: repo.getWorkingDirectory()
  };

  describe("Git Pull", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve(true));
    });
    describe("when 'promptForBranch' is disabled", function() {
      return it("calls git.cmd with ['pull'] and the upstream branch path", function() {
        GitPull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo'], options, {
          color: true
        });
      });
    });
    describe("when 'promptForBranch' is enabled", function() {
      return it("calls git.cmd with ['remote']", function() {
        atom.config.set('git-plus.remoteInteractions.promptForBranch', true);
        GitPull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['remote'], options);
      });
    });
    return describe("The pull function", function() {
      it("calls git.cmd", function() {
        _pull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo'], options, {
          color: true
        });
      });
      it("calls git.cmd with extra arguments if passed", function() {
        _pull(repo, {
          extraArgs: ['--rebase']
        });
        return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'origin', 'foo'], options, {
          color: true
        });
      });
      it("understands branch names with a '/'", function() {
        spyOn(repo, 'getUpstreamBranch').andReturn('refs/remotes/origin/foo/cool-feature');
        _pull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo/cool-feature'], options, {
          color: true
        });
      });
      return describe("when there is no upstream branch", function() {
        return it("shows a message", function() {
          spyOn(repo, 'getUpstreamBranch').andReturn(void 0);
          spyOn(notifier, 'addInfo');
          _pull(repo);
          expect(git.cmd).not.toHaveBeenCalled();
          return expect(notifier.addInfo).toHaveBeenCalled();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXB1bGwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSOztFQUNWLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUjs7RUFDVixLQUFBLEdBQVEsT0FBQSxDQUFRLHdCQUFSOztFQUVSLE9BQUEsR0FDRTtJQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMOzs7RUFFRixRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0lBQ25CLFVBQUEsQ0FBVyxTQUFBO2FBQUcsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7SUFBSCxDQUFYO0lBRUEsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUE7YUFDN0MsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUE7UUFDN0QsT0FBQSxDQUFRLElBQVI7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxRQUFULEVBQW1CLEtBQW5CLENBQXJDLEVBQWdFLE9BQWhFLEVBQXlFO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBekU7TUFGNkQsQ0FBL0Q7SUFENkMsQ0FBL0M7SUFLQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQTthQUM1QyxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQTtRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkNBQWhCLEVBQStELElBQS9EO1FBQ0EsT0FBQSxDQUFRLElBQVI7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsQ0FBckMsRUFBaUQsT0FBakQ7TUFIa0MsQ0FBcEM7SUFENEMsQ0FBOUM7V0FNQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtNQUM1QixFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO1FBQ2xCLEtBQUEsQ0FBTSxJQUFOO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixLQUFuQixDQUFyQyxFQUFnRSxPQUFoRSxFQUF5RTtVQUFDLEtBQUEsRUFBTyxJQUFSO1NBQXpFO01BRmtCLENBQXBCO01BSUEsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7UUFDakQsS0FBQSxDQUFNLElBQU4sRUFBWTtVQUFBLFNBQUEsRUFBVyxDQUFDLFVBQUQsQ0FBWDtTQUFaO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixRQUFyQixFQUErQixLQUEvQixDQUFyQyxFQUE0RSxPQUE1RSxFQUFxRjtVQUFDLEtBQUEsRUFBTyxJQUFSO1NBQXJGO01BRmlELENBQW5EO01BSUEsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUE7UUFDeEMsS0FBQSxDQUFNLElBQU4sRUFBWSxtQkFBWixDQUFnQyxDQUFDLFNBQWpDLENBQTJDLHNDQUEzQztRQUNBLEtBQUEsQ0FBTSxJQUFOO2VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixrQkFBbkIsQ0FBckMsRUFBNkUsT0FBN0UsRUFBc0Y7VUFBQyxLQUFBLEVBQU8sSUFBUjtTQUF0RjtNQUh3QyxDQUExQzthQUtBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBO2VBQzNDLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO1VBQ3BCLEtBQUEsQ0FBTSxJQUFOLEVBQVksbUJBQVosQ0FBZ0MsQ0FBQyxTQUFqQyxDQUEyQyxNQUEzQztVQUNBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLFNBQWhCO1VBQ0EsS0FBQSxDQUFNLElBQU47VUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLEdBQUcsQ0FBQyxnQkFBcEIsQ0FBQTtpQkFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLE9BQWhCLENBQXdCLENBQUMsZ0JBQXpCLENBQUE7UUFMb0IsQ0FBdEI7TUFEMkMsQ0FBN0M7SUFkNEIsQ0FBOUI7RUFkbUIsQ0FBckI7QUFUQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL2xpYi9ub3RpZmllcidcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0UHVsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXB1bGwnXG5fcHVsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvX3B1bGwnXG5cbm9wdGlvbnMgPVxuICBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbmRlc2NyaWJlIFwiR2l0IFB1bGxcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPiBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRydWVcblxuICBkZXNjcmliZSBcIndoZW4gJ3Byb21wdEZvckJyYW5jaCcgaXMgZGlzYWJsZWRcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3B1bGwnXSBhbmQgdGhlIHVwc3RyZWFtIGJyYW5jaCBwYXRoXCIsIC0+XG4gICAgICBHaXRQdWxsKHJlcG8pXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywge2NvbG9yOiB0cnVlfVxuXG4gIGRlc2NyaWJlIFwid2hlbiAncHJvbXB0Rm9yQnJhbmNoJyBpcyBlbmFibGVkXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydyZW1vdGUnXVwiLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJywgdHJ1ZSlcbiAgICAgIEdpdFB1bGwocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3JlbW90ZSddLCBvcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJUaGUgcHVsbCBmdW5jdGlvblwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZFwiLCAtPlxuICAgICAgX3B1bGwgcmVwb1xuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICdvcmlnaW4nLCAnZm9vJ10sIG9wdGlvbnMsIHtjb2xvcjogdHJ1ZX1cblxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIGV4dHJhIGFyZ3VtZW50cyBpZiBwYXNzZWRcIiwgLT5cbiAgICAgIF9wdWxsIHJlcG8sIGV4dHJhQXJnczogWyctLXJlYmFzZSddXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJy0tcmViYXNlJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywge2NvbG9yOiB0cnVlfVxuXG4gICAgaXQgXCJ1bmRlcnN0YW5kcyBicmFuY2ggbmFtZXMgd2l0aCBhICcvJ1wiLCAtPlxuICAgICAgc3B5T24ocmVwbywgJ2dldFVwc3RyZWFtQnJhbmNoJykuYW5kUmV0dXJuICdyZWZzL3JlbW90ZXMvb3JpZ2luL2Zvby9jb29sLWZlYXR1cmUnXG4gICAgICBfcHVsbCByZXBvXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJ29yaWdpbicsICdmb28vY29vbC1mZWF0dXJlJ10sIG9wdGlvbnMsIHtjb2xvcjogdHJ1ZX1cblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGVyZSBpcyBubyB1cHN0cmVhbSBicmFuY2hcIiwgLT5cbiAgICAgIGl0IFwic2hvd3MgYSBtZXNzYWdlXCIsIC0+XG4gICAgICAgIHNweU9uKHJlcG8sICdnZXRVcHN0cmVhbUJyYW5jaCcpLmFuZFJldHVybiB1bmRlZmluZWRcbiAgICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgICAgX3B1bGwgcmVwb1xuICAgICAgICBleHBlY3QoZ2l0LmNtZCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZCgpXG4iXX0=
