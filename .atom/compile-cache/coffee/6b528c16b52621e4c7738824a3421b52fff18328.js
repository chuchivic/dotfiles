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
    describe("when 'pullRebase' is enabled", function() {
      return it('calls git.cmd with --rebase', function() {
        atom.config.set('git-plus.remoteInteractions.pullRebase', true);
        GitPull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'origin', 'foo'], options, {
          color: true
        });
      });
    });
    describe("when 'pullAutostash' is enabled", function() {
      return it('calls git.cmd with --autostash', function() {
        atom.config.set('git-plus.remoteInteractions.pullAutostash', true);
        GitPull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', '--autostash', 'origin', 'foo'], options, {
          color: true
        });
      });
    });
    describe("when 'pullRebase' and 'pullAutostash' are enabled", function() {
      return it('calls git.cmd with --rebase and --autostash', function() {
        atom.config.set('git-plus.remoteInteractions.pullRebase', true);
        atom.config.set('git-plus.remoteInteractions.pullAutostash', true);
        GitPull(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', '--autostash', 'origin', 'foo'], options, {
          color: true
        });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXB1bGwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSOztFQUNWLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUjs7RUFDVixLQUFBLEdBQVEsT0FBQSxDQUFRLHdCQUFSOztFQUVSLE9BQUEsR0FDRTtJQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMOzs7RUFFRixRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBO0lBQ25CLFVBQUEsQ0FBVyxTQUFBO2FBQUcsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsQ0FBNUI7SUFBSCxDQUFYO0lBRUEsUUFBQSxDQUFTLG9DQUFULEVBQStDLFNBQUE7YUFDN0MsRUFBQSxDQUFHLDBEQUFILEVBQStELFNBQUE7UUFDN0QsT0FBQSxDQUFRLElBQVI7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxRQUFULEVBQW1CLEtBQW5CLENBQXJDLEVBQWdFLE9BQWhFLEVBQXlFO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBekU7TUFGNkQsQ0FBL0Q7SUFENkMsQ0FBL0M7SUFLQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQTthQUM1QyxFQUFBLENBQUcsK0JBQUgsRUFBb0MsU0FBQTtRQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNkNBQWhCLEVBQStELElBQS9EO1FBQ0EsT0FBQSxDQUFR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QXJDLEVBQTZFLE9BQTdFLEVBQXNGO1VBQUMsS0FBQSxFQUFPLElBQVI7U0FBdEY7TUFId0MsQ0FBMUM7YUFLQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQTtlQUMzQyxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtVQUNwQixLQUFBLENBQU0sSUFBTixFQUFZLG1CQUFaLENBQWdDLENBQUMsU0FBakMsQ0FBMkMsTUFBM0M7VUFDQSxLQUFBLENBQU0sUUFBTixFQUFnQixTQUFoQjtVQUNBLEtBQUEsQ0FBTSxJQUFOO1VBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxHQUFHLENBQUMsZ0JBQXBCLENBQUE7aUJBQ0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxPQUFoQixDQUF3QixDQUFDLGdCQUF6QixDQUFBO1FBTG9CLENBQXRCO01BRDJDLENBQTdDO0lBZDRCLENBQTlCO0VBakNtQixDQUFyQjtBQVRBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vLi4vbGliL25vdGlmaWVyJ1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5HaXRQdWxsID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtcHVsbCdcbl9wdWxsID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9fcHVsbCdcblxub3B0aW9ucyA9XG4gIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuZGVzY3JpYmUgXCJHaXQgUHVsbFwiLCAtPlxuICBiZWZvcmVFYWNoIC0+IHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuXG4gIGRlc2NyaWJlIFwid2hlbiAncHJvbXB0Rm9yQnJhbmNoJyBpcyBkaXNhYmxlZFwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsncHVsbCddIGFuZCB0aGUgdXBzdHJlYW0gYnJhbmNoIHBhdGhcIiwgLT5cbiAgICAgIEdpdFB1bGwocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAnb3JpZ2luJywgJ2ZvbyddLCBvcHRpb25zLCB7Y29sb3I6IHRydWV9XG5cbiAgZGVzY3JpYmUgXCJ3aGVuICdwcm9tcHRGb3JCcmFuY2gnIGlzIGVuYWJsZWRcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3JlbW90ZSddXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wcm9tcHRGb3JCcmFuY2gnLCB0cnVlKVxuICAgICAgR2l0UHVsbChyZXBvKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncmVtb3RlJ10sIG9wdGlvbnNcblxuICBkZXNjcmliZSBcIndoZW4gJ3B1bGxSZWJhc2UnIGlzIGVuYWJsZWRcIiwgLT5cbiAgICBpdCAnY2FsbHMgZ2l0LmNtZCB3aXRoIC0tcmViYXNlJywgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxSZWJhc2UnLCB0cnVlKVxuICAgICAgR2l0UHVsbChyZXBvKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVsbCcsICctLXJlYmFzZScsICdvcmlnaW4nLCAnZm9vJ10sIG9wdGlvbnMsIHtjb2xvcjp0cnVlfVxuXG4gIGRlc2NyaWJlIFwid2hlbiAncHVsbEF1dG9zdGFzaCcgaXMgZW5hYmxlZFwiLCAtPlxuICAgIGl0ICdjYWxscyBnaXQuY21kIHdpdGggLS1hdXRvc3Rhc2gnLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHVsbEF1dG9zdGFzaCcsIHRydWUpXG4gICAgICBHaXRQdWxsKHJlcG8pXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJy0tYXV0b3N0YXNoJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywge2NvbG9yOnRydWV9XG5cbiAgZGVzY3JpYmUgXCJ3aGVuICdwdWxsUmViYXNlJyBhbmQgJ3B1bGxBdXRvc3Rhc2gnIGFyZSBlbmFibGVkXCIsIC0+XG4gICAgaXQgJ2NhbGxzIGdpdC5jbWQgd2l0aCAtLXJlYmFzZSBhbmQgLS1hdXRvc3Rhc2gnLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHVsbFJlYmFzZScsIHRydWUpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wdWxsQXV0b3N0YXNoJywgdHJ1ZSlcbiAgICAgIEdpdFB1bGwocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAnLS1yZWJhc2UnLCAnLS1hdXRvc3Rhc2gnLCAnb3JpZ2luJywgJ2ZvbyddLCBvcHRpb25zLCB7Y29sb3I6dHJ1ZX1cblxuICBkZXNjcmliZSBcIlRoZSBwdWxsIGZ1bmN0aW9uXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kXCIsIC0+XG4gICAgICBfcHVsbCByZXBvXG4gICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywge2NvbG9yOiB0cnVlfVxuXG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggZXh0cmEgYXJndW1lbnRzIGlmIHBhc3NlZFwiLCAtPlxuICAgICAgX3B1bGwgcmVwbywgZXh0cmFBcmdzOiBbJy0tcmViYXNlJ11cbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAnLS1yZWJhc2UnLCAnb3JpZ2luJywgJ2ZvbyddLCBvcHRpb25zLCB7Y29sb3I6IHRydWV9XG5cbiAgICBpdCBcInVuZGVyc3RhbmRzIGJyYW5jaCBuYW1lcyB3aXRoIGEgJy8nXCIsIC0+XG4gICAgICBzcHlPbihyZXBvLCAnZ2V0VXBzdHJlYW1CcmFuY2gnKS5hbmRSZXR1cm4gJ3JlZnMvcmVtb3Rlcy9vcmlnaW4vZm9vL2Nvb2wtZmVhdHVyZSdcbiAgICAgIF9wdWxsIHJlcG9cbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAnb3JpZ2luJywgJ2Zvby9jb29sLWZlYXR1cmUnXSwgb3B0aW9ucywge2NvbG9yOiB0cnVlfVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZXJlIGlzIG5vIHVwc3RyZWFtIGJyYW5jaFwiLCAtPlxuICAgICAgaXQgXCJzaG93cyBhIG1lc3NhZ2VcIiwgLT5cbiAgICAgICAgc3B5T24ocmVwbywgJ2dldFVwc3RyZWFtQnJhbmNoJykuYW5kUmV0dXJuIHVuZGVmaW5lZFxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBfcHVsbCByZXBvXG4gICAgICAgIGV4cGVjdChnaXQuY21kKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkKClcbiJdfQ==
