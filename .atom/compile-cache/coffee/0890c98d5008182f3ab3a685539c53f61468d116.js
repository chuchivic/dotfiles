(function() {
  var GitDiff, GitDiffAll, RevisionView, currentPane, diffPane, fs, git, openPromise, pathToRepoFile, ref, repo, textEditor,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs-plus');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor;

  git = require('../../lib/git');

  GitDiff = require('../../lib/models/git-diff');

  GitDiffAll = require('../../lib/models/git-diff-all');

  RevisionView = require('../../lib/views/git-revision-view');

  currentPane = {
    splitRight: function() {}
  };

  diffPane = {
    splitRight: function() {
      return void 0;
    },
    getActiveEditor: function() {
      return textEditor;
    }
  };

  openPromise = {
    done: function(cb) {
      return cb(textEditor);
    }
  };

  describe("GitDiff", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
      return waitsForPromise(function() {
        return GitDiff(repo, {
          file: pathToRepoFile
        });
      });
    });
    return describe("when git-plus.diffs.includeStagedDiff config is true", function() {
      return it("calls git.cmd and specifies 'HEAD'", function() {
        return expect(indexOf.call(git.cmd.mostRecentCall.args[0], 'HEAD') >= 0).toBe(true);
      });
    });
  });

  describe("GitDiff when git-plus.diffs.wordDiff config is true", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.wordDiff', true);
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
      return waitsForPromise(function() {
        return GitDiff(repo, {
          file: pathToRepoFile
        });
      });
    });
    return it("calls git.cmd and uses '--word-diff' flag", function() {
      return expect(indexOf.call(git.cmd.mostRecentCall.args[0], '--word-diff') >= 0).toBe(true);
    });
  });

  describe("GitDiff when a file is not specified", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(git, 'cmd').andReturn(Promise.resolve('diffs'));
      return waitsForPromise(function() {
        return GitDiff(repo);
      });
    });
    return it("checks for the current open file", function() {
      return expect(atom.workspace.getActiveTextEditor).toHaveBeenCalled();
    });
  });

  describe("when the useSplitDiff config is set to true", function() {
    it("calls RevisionView.showRevision", function() {
      atom.config.set('git-plus.experimental.useSplitDiff', true);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(RevisionView, 'showRevision');
      GitDiff(repo, {
        file: pathToRepoFile
      });
      waitsFor(function() {
        return RevisionView.showRevision.callCount > 0;
      });
      return runs(function() {
        expect(atom.workspace.open).toHaveBeenCalled();
        return expect(RevisionView.showRevision).toHaveBeenCalledWith(repo, textEditor, repo.branch);
      });
    });
    describe("when no current repository file is open", function() {
      return it("notifies user that the split-diff feature won't work unless invoked on a repository file", function() {
        atom.config.set('git-plus.experimental.useSplitDiff', true);
        spyOn(atom.workspace, 'open');
        spyOn(RevisionView, 'showRevision');
        GitDiff(repo);
        expect(atom.workspace.open).not.toHaveBeenCalled();
        return expect(RevisionView.showRevision).not.toHaveBeenCalled();
      });
    });
    return describe("when file option is '.'", function() {
      return it("does not try to use split-dif", function() {
        atom.config.set('git-plus.experimental.useSplitDiff', true);
        spyOn(atom.workspace, 'open');
        spyOn(RevisionView, 'showRevision');
        GitDiff(repo, {
          file: '.'
        });
        expect(atom.workspace.open).not.toHaveBeenCalled();
        return expect(RevisionView.showRevision).not.toHaveBeenCalled();
      });
    });
  });

  describe("GitDiffAll", function() {
    beforeEach(function() {
      atom.config.set('git-plus.diffs.includeStagedDiff', true);
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(textEditor));
      spyOn(fs, 'writeFile').andCallFake(function() {
        return fs.writeFile.mostRecentCall.args[3]();
      });
      spyOn(git, 'cmd').andCallFake(function() {
        var args;
        args = git.cmd.mostRecentCall.args[0];
        if (args[2] === '--stat') {
          return Promise.resolve('diff stats\n');
        } else {
          return Promise.resolve('diffs');
        }
      });
      return waitsForPromise(function() {
        return GitDiffAll(repo);
      });
    });
    return it("includes the diff stats in the diffs window", function() {
      return expect(fs.writeFile.mostRecentCall.args[1].includes('diff stats')).toBe(true);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWRpZmYtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFIQUFBO0lBQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLE1BQXFDLE9BQUEsQ0FBUSxhQUFSLENBQXJDLEVBQUMsZUFBRCxFQUFPLG1DQUFQLEVBQXVCOztFQUN2QixHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUjs7RUFDVixVQUFBLEdBQWEsT0FBQSxDQUFRLCtCQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsbUNBQVI7O0VBRWYsV0FBQSxHQUNFO0lBQUEsVUFBQSxFQUFZLFNBQUEsR0FBQSxDQUFaOzs7RUFDRixRQUFBLEdBQ0U7SUFBQSxVQUFBLEVBQVksU0FBQTthQUFHO0lBQUgsQ0FBWjtJQUNBLGVBQUEsRUFBaUIsU0FBQTthQUFHO0lBQUgsQ0FEakI7OztFQUVGLFdBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxTQUFDLEVBQUQ7YUFBUSxFQUFBLENBQUcsVUFBSDtJQUFSLENBQU47OztFQUVGLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7SUFDbEIsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCLEVBQW9ELElBQXBEO01BQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLHFCQUF0QixDQUE0QyxDQUFDLFNBQTdDLENBQXVELFVBQXZEO01BQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLE1BQXRCLENBQTZCLENBQUMsU0FBOUIsQ0FBd0MsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsVUFBaEIsQ0FBeEM7TUFDQSxLQUFBLENBQU0sR0FBTixFQUFX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aUJBR0UsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsT0FBaEIsRUFIRjs7TUFGNEIsQ0FBOUI7YUFNQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxVQUFBLENBQVcsSUFBWDtNQURjLENBQWhCO0lBWFMsQ0FBWDtXQWNBLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBO2FBQ2hELE1BQUEsQ0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBcEMsQ0FBNkMsWUFBN0MsQ0FBUCxDQUFpRSxDQUFDLElBQWxFLENBQXVFLElBQXZFO0lBRGdELENBQWxEO0VBZnFCLENBQXZCO0FBaEdBIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xue3JlcG8sIHBhdGhUb1JlcG9GaWxlLCB0ZXh0RWRpdG9yfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdERpZmYgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1kaWZmJ1xuR2l0RGlmZkFsbCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRpZmYtYWxsJ1xuUmV2aXNpb25WaWV3ID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL2dpdC1yZXZpc2lvbi12aWV3J1xuXG5jdXJyZW50UGFuZSA9XG4gIHNwbGl0UmlnaHQ6IC0+XG5kaWZmUGFuZSA9XG4gIHNwbGl0UmlnaHQ6IC0+IHVuZGVmaW5lZFxuICBnZXRBY3RpdmVFZGl0b3I6IC0+IHRleHRFZGl0b3Jcbm9wZW5Qcm9taXNlID1cbiAgZG9uZTogKGNiKSAtPiBjYiB0ZXh0RWRpdG9yXG5cbmRlc2NyaWJlIFwiR2l0RGlmZlwiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZicsIHRydWVcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdGV4dEVkaXRvclxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoJ2RpZmZzJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIEdpdERpZmYgcmVwbywgZmlsZTogcGF0aFRvUmVwb0ZpbGVcblxuICBkZXNjcmliZSBcIndoZW4gZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYgY29uZmlnIGlzIHRydWVcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgYW5kIHNwZWNpZmllcyAnSEVBRCdcIiwgLT5cbiAgICAgIGV4cGVjdCgnSEVBRCcgaW4gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdKS50b0JlIHRydWVcblxuZGVzY3JpYmUgXCJHaXREaWZmIHdoZW4gZ2l0LXBsdXMuZGlmZnMud29yZERpZmYgY29uZmlnIGlzIHRydWVcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGF0b20uY29uZmlnLnNldCAnZ2l0LXBsdXMuZGlmZnMud29yZERpZmYnLCB0cnVlXG4gICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZicsIHRydWVcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdGV4dEVkaXRvclxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoJ2RpZmZzJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIEdpdERpZmYgcmVwbywgZmlsZTogcGF0aFRvUmVwb0ZpbGVcblxuICBpdCBcImNhbGxzIGdpdC5jbWQgYW5kIHVzZXMgJy0td29yZC1kaWZmJyBmbGFnXCIsIC0+XG4gICAgZXhwZWN0KCctLXdvcmQtZGlmZicgaW4gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdKS50b0JlIHRydWVcblxuZGVzY3JpYmUgXCJHaXREaWZmIHdoZW4gYSBmaWxlIGlzIG5vdCBzcGVjaWZpZWRcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGF0b20uY29uZmlnLnNldCAnZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYnLCB0cnVlXG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdnZXRBY3RpdmVUZXh0RWRpdG9yJykuYW5kUmV0dXJuIHRleHRFZGl0b3JcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRleHRFZGl0b3JcbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCdkaWZmcycpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBHaXREaWZmIHJlcG9cblxuICBpdCBcImNoZWNrcyBmb3IgdGhlIGN1cnJlbnQgb3BlbiBmaWxlXCIsIC0+XG4gICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG5kZXNjcmliZSBcIndoZW4gdGhlIHVzZVNwbGl0RGlmZiBjb25maWcgaXMgc2V0IHRvIHRydWVcIiwgLT5cbiAgaXQgXCJjYWxscyBSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uXCIsIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwudXNlU3BsaXREaWZmJywgdHJ1ZSlcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHRleHRFZGl0b3JcbiAgICBzcHlPbihSZXZpc2lvblZpZXcsICdzaG93UmV2aXNpb24nKVxuICAgIEdpdERpZmYocmVwbywgZmlsZTogcGF0aFRvUmVwb0ZpbGUpXG4gICAgd2FpdHNGb3IgLT4gUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbi5jYWxsQ291bnQgPiAwXG4gICAgcnVucyAtPlxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KFJldmlzaW9uVmlldy5zaG93UmV2aXNpb24pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIHRleHRFZGl0b3IsIHJlcG8uYnJhbmNoXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIG5vIGN1cnJlbnQgcmVwb3NpdG9yeSBmaWxlIGlzIG9wZW5cIiwgLT5cbiAgICBpdCBcIm5vdGlmaWVzIHVzZXIgdGhhdCB0aGUgc3BsaXQtZGlmZiBmZWF0dXJlIHdvbid0IHdvcmsgdW5sZXNzIGludm9rZWQgb24gYSByZXBvc2l0b3J5IGZpbGVcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLnVzZVNwbGl0RGlmZicsIHRydWUpXG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ29wZW4nKVxuICAgICAgc3B5T24oUmV2aXNpb25WaWV3LCAnc2hvd1JldmlzaW9uJylcbiAgICAgIEdpdERpZmYocmVwbylcbiAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QoUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBmaWxlIG9wdGlvbiBpcyAnLidcIiwgLT5cbiAgICBpdCBcImRvZXMgbm90IHRyeSB0byB1c2Ugc3BsaXQtZGlmXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbC51c2VTcGxpdERpZmYnLCB0cnVlKVxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJylcbiAgICAgIHNweU9uKFJldmlzaW9uVmlldywgJ3Nob3dSZXZpc2lvbicpXG4gICAgICBHaXREaWZmKHJlcG8sIGZpbGU6ICcuJylcbiAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QoUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbikubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4jIGRlc2NyaWJlIFwid2hlbiBnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUgY29uZmlnIGlzIHRydWVcIiwgLT5cbiMgICBiZWZvcmVFYWNoIC0+XG4jICAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScsIHRydWVcbiMgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlUGFuZScpLmFuZFJldHVybiBjdXJyZW50UGFuZVxuIyAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJykuYW5kUmV0dXJuIHRleHRFZGl0b3JcbiMgICAgIHNweU9uKGN1cnJlbnRQYW5lLCAnc3BsaXRSaWdodCcpLmFuZFJldHVybiBjdXJyZW50UGFuZVxuIyAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4jICAgICAgIEdpdERpZmYgcmVwbywgZmlsZTogJy4nXG4jXG4jICAgZGVzY3JpYmUgXCJ3aGVuIGdpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lIGNvbmZpZyBpcyBub3Qgc2V0XCIsIC0+XG4jICAgICBpdCBcImRlZmF1bHRzIHRvIHNwbGl0UmlnaHRcIiwgLT5cbiMgICAgICAgZXhwZWN0KGN1cnJlbnRQYW5lLnNwbGl0UmlnaHQpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuIyAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSkudG9IYXZlQmVlbkNhbGxlZCgpXG5cbmRlc2NyaWJlIFwiR2l0RGlmZkFsbFwiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZicsIHRydWVcbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUgdGV4dEVkaXRvclxuICAgIHNweU9uKGZzLCAnd3JpdGVGaWxlJykuYW5kQ2FsbEZha2UgLT4gZnMud3JpdGVGaWxlLm1vc3RSZWNlbnRDYWxsLmFyZ3NbM10oKVxuICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICBhcmdzID0gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgICBpZiBhcmdzWzJdIGlzICctLXN0YXQnXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSAnZGlmZiBzdGF0c1xcbidcbiAgICAgIGVsc2VcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlICdkaWZmcydcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIEdpdERpZmZBbGwgcmVwb1xuXG4gIGl0IFwiaW5jbHVkZXMgdGhlIGRpZmYgc3RhdHMgaW4gdGhlIGRpZmZzIHdpbmRvd1wiLCAtPlxuICAgIGV4cGVjdChmcy53cml0ZUZpbGUubW9zdFJlY2VudENhbGwuYXJnc1sxXS5pbmNsdWRlcyAnZGlmZiBzdGF0cycpLnRvQmUgdHJ1ZVxuIl19
