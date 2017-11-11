(function() {
  var DiffBranchFilesView, RevisionView, pathToRepoFile, ref, repo;

  RevisionView = require('../../lib/views/git-revision-view');

  DiffBranchFilesView = require('../../lib/views/diff-branch-files-view');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  describe("DiffBranchFilesView", function() {
    var textEditor;
    textEditor = null;
    beforeEach(function() {
      spyOn(RevisionView, 'showRevision');
      return spyOn(atom.workspace, 'open').andCallFake(function() {
        textEditor = {
          getPath: function() {
            return atom.workspace.open.mostRecentCall.args[0];
          }
        };
        return Promise.resolve(textEditor);
      });
    });
    describe("when selectedFilePath is not provided", function() {
      var branchView;
      branchView = new DiffBranchFilesView(repo, "M\tfile.txt\nD\tanother.txt", 'branchName');
      it("displays a list of diff branch files", function() {
        return expect(branchView.items.length).toBe(2);
      });
      return it("calls RevisionView.showRevision", function() {
        waitsForPromise(function() {
          return branchView.confirmSelection();
        });
        return runs(function() {
          return expect(RevisionView.showRevision).toHaveBeenCalledWith(repo, textEditor, 'branchName');
        });
      });
    });
    return describe("when a selectedFilePath is provided", function() {
      return it("does not show the view and automatically calls RevisionView.showRevision", function() {
        var branchView;
        branchView = new DiffBranchFilesView(repo, "M\tfile.txt\nD\tanother.txt", 'branchName', pathToRepoFile);
        expect(branchView.isVisible()).toBe(false);
        waitsFor(function() {
          return RevisionView.showRevision.callCount > 0;
        });
        return runs(function() {
          expect(RevisionView.showRevision.mostRecentCall.args[0]).toBe(repo);
          expect(RevisionView.showRevision.mostRecentCall.args[1].getPath()).toBe(pathToRepoFile);
          return expect(RevisionView.showRevision.mostRecentCall.args[2]).toBe('branchName');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9kaWZmLWJyYW5jaC1maWxlcy12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLG1DQUFSOztFQUNmLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSx3Q0FBUjs7RUFDdEIsTUFBeUIsT0FBQSxDQUFRLGFBQVIsQ0FBekIsRUFBQyxlQUFELEVBQU87O0VBRVAsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7QUFDOUIsUUFBQTtJQUFBLFVBQUEsR0FBYTtJQUViLFVBQUEsQ0FBVyxTQUFBO01BQ1QsS0FBQSxDQUFNLFlBQU4sRUFBb0IsY0FBcEI7YUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsTUFBdEIsQ0FBNkIsQ0FBQyxXQUE5QixDQUEwQyxTQUFBO1FBQ3hDLFVBQUEsR0FBYTtVQUFBLE9BQUEsRUFBUyxTQUFBO21CQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQTtVQUEzQyxDQUFUOztlQUNiLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFVBQWhCO01BRndDLENBQTFDO0lBRlMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBO0FBQ2hELFVBQUE7TUFBQSxVQUFBLEdBQWlCLElBQUEsbUJBQUEsQ0FBb0IsSUFBcEIsRUFBMEIsNkJBQTFCLEVBQXlELFlBQXpEO01BRWpCLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBO2VBQ3pDLE1BQUEsQ0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQXhCLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsQ0FBckM7TUFEeUMsQ0FBM0M7YUFHQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQTtRQUNwQyxlQUFBLENBQWdCLFNBQUE7aUJBQUcsVUFBVSxDQUFDLGdCQUFYLENBQUE7UUFBSCxDQUFoQjtlQUNBLElBQUEsQ0FBSyxTQUFBO2lCQUNILE1BQUEsQ0FBTyxZQUFZLENBQUMsWUFBcEIsQ0FBaUMsQ0FBQyxvQkFBbEMsQ0FBdUQsSUFBdkQsRUFBNkQsVUFBN0QsRUFBeUUsWUFBekU7UUFERyxDQUFMO01BRm9DLENBQXRDO0lBTmdELENBQWxEO1dBV0EsUUFBQSxDQUFTLHFDQUFULEVBQWdELFNBQUE7YUFDOUMsRUFBQSxDQUFHLDBFQUFILEVBQStFLFNBQUE7QUFDN0UsWUFBQTtRQUFBLFVBQUEsR0FBaUIsSUFBQSxtQkFBQSxDQUFvQixJQUFwQixFQUEwQiw2QkFBMUIsRUFBeUQsWUFBekQsRUFBdUUsY0FBdkU7UUFDakIsTUFBQSxDQUFPLFVBQVUsQ0FBQyxTQUFYLENBQUEsQ0FBUCxDQUE4QixDQUFDLElBQS9CLENBQW9DLEtBQXBDO1FBQ0EsUUFBQSxDQUFTLFNBQUE7aUJBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxTQUExQixHQUFzQztRQUF6QyxDQUFUO2VBQ0EsSUFBQSxDQUFLLFNBQUE7VUFDSCxNQUFBLENBQU8sWUFBWSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBckQsQ0FBd0QsQ0FBQyxJQUF6RCxDQUE4RCxJQUE5RDtVQUNBLE1BQUEsQ0FBTyxZQUFZLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakQsQ0FBQSxDQUFQLENBQWtFLENBQUMsSUFBbkUsQ0FBd0UsY0FBeEU7aUJBQ0EsTUFBQSxDQUFPLFlBQVksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQXJELENBQXdELENBQUMsSUFBekQsQ0FBOEQsWUFBOUQ7UUFIRyxDQUFMO01BSjZFLENBQS9FO0lBRDhDLENBQWhEO0VBcEI4QixDQUFoQztBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiUmV2aXNpb25WaWV3ID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL2dpdC1yZXZpc2lvbi12aWV3J1xuRGlmZkJyYW5jaEZpbGVzVmlldyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9kaWZmLWJyYW5jaC1maWxlcy12aWV3J1xue3JlcG8sIHBhdGhUb1JlcG9GaWxlfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuXG5kZXNjcmliZSBcIkRpZmZCcmFuY2hGaWxlc1ZpZXdcIiwgLT5cbiAgdGV4dEVkaXRvciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgc3B5T24oUmV2aXNpb25WaWV3LCAnc2hvd1JldmlzaW9uJylcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgdGV4dEVkaXRvciA9IGdldFBhdGg6IC0+IGF0b20ud29ya3NwYWNlLm9wZW4ubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgUHJvbWlzZS5yZXNvbHZlKHRleHRFZGl0b3IpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHNlbGVjdGVkRmlsZVBhdGggaXMgbm90IHByb3ZpZGVkXCIsIC0+XG4gICAgYnJhbmNoVmlldyA9IG5ldyBEaWZmQnJhbmNoRmlsZXNWaWV3KHJlcG8sIFwiTVxcdGZpbGUudHh0XFxuRFxcdGFub3RoZXIudHh0XCIsICdicmFuY2hOYW1lJylcblxuICAgIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIGRpZmYgYnJhbmNoIGZpbGVzXCIsIC0+XG4gICAgICBleHBlY3QoYnJhbmNoVmlldy5pdGVtcy5sZW5ndGgpLnRvQmUgMlxuXG4gICAgaXQgXCJjYWxscyBSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYnJhbmNoVmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KFJldmlzaW9uVmlldy5zaG93UmV2aXNpb24pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIHRleHRFZGl0b3IsICdicmFuY2hOYW1lJ1xuXG4gIGRlc2NyaWJlIFwid2hlbiBhIHNlbGVjdGVkRmlsZVBhdGggaXMgcHJvdmlkZWRcIiwgLT5cbiAgICBpdCBcImRvZXMgbm90IHNob3cgdGhlIHZpZXcgYW5kIGF1dG9tYXRpY2FsbHkgY2FsbHMgUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvblwiLCAtPlxuICAgICAgYnJhbmNoVmlldyA9IG5ldyBEaWZmQnJhbmNoRmlsZXNWaWV3KHJlcG8sIFwiTVxcdGZpbGUudHh0XFxuRFxcdGFub3RoZXIudHh0XCIsICdicmFuY2hOYW1lJywgcGF0aFRvUmVwb0ZpbGUpXG4gICAgICBleHBlY3QoYnJhbmNoVmlldy5pc1Zpc2libGUoKSkudG9CZSBmYWxzZVxuICAgICAgd2FpdHNGb3IgLT4gUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbi5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF0pLnRvQmUocmVwbylcbiAgICAgICAgZXhwZWN0KFJldmlzaW9uVmlldy5zaG93UmV2aXNpb24ubW9zdFJlY2VudENhbGwuYXJnc1sxXS5nZXRQYXRoKCkpLnRvQmUocGF0aFRvUmVwb0ZpbGUpXG4gICAgICAgIGV4cGVjdChSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMl0pLnRvQmUoJ2JyYW5jaE5hbWUnKVxuIl19
