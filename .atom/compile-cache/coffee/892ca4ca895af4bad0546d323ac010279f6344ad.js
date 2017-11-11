(function() {
  var GitAddContext, GitUnstageFileContext, contextPackageFinder, git, notifier, quibble, repo, selectedFilePath;

  quibble = require('quibble');

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  contextPackageFinder = require('../../lib/context-package-finder');

  GitAddContext = require('../../lib/models/context/git-add-context');

  GitUnstageFileContext = require('../../lib/models/context/git-unstage-file-context');

  repo = require('../fixtures').repo;

  selectedFilePath = 'selected/path';

  describe("Context-menu commands", function() {
    beforeEach(function() {
      return spyOn(git, 'getRepoForPath').andReturn(Promise.resolve(repo));
    });
    describe("GitAddContext", function() {
      describe("when an object in the tree is selected", function() {
        return it("calls git::add", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(git, 'add');
          waitsForPromise(function() {
            return GitAddContext();
          });
          return runs(function() {
            return expect(git.add).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitAddContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add");
        });
      });
    });
    describe("GitAddAndCommitContext", function() {
      var GitAddAndCommitContext, GitCommit;
      GitAddAndCommitContext = null;
      GitCommit = null;
      beforeEach(function() {
        GitCommit = quibble('../../lib/models/git-commit', jasmine.createSpy('GitCommit'));
        return GitAddAndCommitContext = require('../../lib/models/context/git-add-and-commit-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls git::add and GitCommit", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(git, 'add').andReturn(Promise.resolve());
          waitsForPromise(function() {
            return GitAddAndCommitContext();
          });
          return runs(function() {
            expect(git.add).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
            return expect(GitCommit).toHaveBeenCalledWith(repo);
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitAddAndCommitContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to add and commit");
        });
      });
    });
    describe("GitDiffContext", function() {
      var GitDiff, GitDiffContext;
      GitDiff = null;
      GitDiffContext = null;
      beforeEach(function() {
        GitDiff = quibble('../../lib/models/git-diff', jasmine.createSpy('GitDiff'));
        return GitDiffContext = require('../../lib/models/context/git-diff-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitDiff", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitDiffContext();
          });
          return runs(function() {
            return expect(GitDiff).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitDiffContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
        });
      });
    });
    describe("GitDifftoolContext", function() {
      var GitDiffTool, GitDifftoolContext;
      GitDiffTool = null;
      GitDifftoolContext = null;
      beforeEach(function() {
        GitDiffTool = quibble('../../lib/models/git-difftool', jasmine.createSpy('GitDiffTool'));
        return GitDifftoolContext = require('../../lib/models/context/git-difftool-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitDiffTool", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitDifftoolContext();
          });
          return runs(function() {
            return expect(GitDiffTool).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitDifftoolContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to diff");
        });
      });
    });
    describe("GitCheckoutFileContext", function() {
      var GitCheckoutFile, GitCheckoutFileContext;
      GitCheckoutFile = null;
      GitCheckoutFileContext = null;
      beforeEach(function() {
        GitCheckoutFile = quibble('../../lib/models/git-checkout-file', jasmine.createSpy('GitCheckoutFile'));
        return GitCheckoutFileContext = require('../../lib/models/context/git-checkout-file-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls CheckoutFile", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(atom, 'confirm').andCallFake(function() {
            return atom.confirm.mostRecentCall.args[0].buttons.Yes();
          });
          waitsForPromise(function() {
            return GitCheckoutFileContext();
          });
          return runs(function() {
            return expect(GitCheckoutFile).toHaveBeenCalledWith(repo, {
              file: selectedFilePath
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitCheckoutFileContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to checkout");
        });
      });
    });
    describe("GitUnstageFileContext", function() {
      describe("when an object in the tree is selected", function() {
        return it("calls git::cmd to unstage files", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          spyOn(git, 'cmd').andReturn(Promise.resolve());
          waitsForPromise(function() {
            return GitUnstageFileContext();
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD', '--', selectedFilePath], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitUnstageFileContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No file selected to unstage");
        });
      });
    });
    describe("GitPullContext", function() {
      var GitPull, GitPullContext, ref;
      ref = [], GitPull = ref[0], GitPullContext = ref[1];
      beforeEach(function() {
        GitPull = quibble('../../lib/models/git-pull', jasmine.createSpy('GitPull'));
        return GitPullContext = require('../../lib/models/context/git-pull-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitPull with the options received", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitPullContext();
          });
          return runs(function() {
            return expect(GitPull).toHaveBeenCalledWith(repo);
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitPullContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No repository found");
        });
      });
    });
    describe("GitPushContext", function() {
      var GitPush, GitPushContext, ref;
      ref = [], GitPush = ref[0], GitPushContext = ref[1];
      beforeEach(function() {
        GitPush = quibble('../../lib/models/git-push', jasmine.createSpy('GitPush'));
        return GitPushContext = require('../../lib/models/context/git-push-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitPush with the options received", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitPushContext({
              setUpstream: true
            });
          });
          return runs(function() {
            return expect(GitPush).toHaveBeenCalledWith(repo, {
              setUpstream: true
            });
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitPushContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No repository found");
        });
      });
    });
    describe("GitDiffBranchesContext", function() {
      var GitDiffBranches, GitDiffBranchesContext, ref;
      ref = [], GitDiffBranches = ref[0], GitDiffBranchesContext = ref[1];
      beforeEach(function() {
        GitDiffBranches = quibble('../../lib/models/git-diff-branches', jasmine.createSpy('GitDiffBranches'));
        return GitDiffBranchesContext = require('../../lib/models/context/git-diff-branches-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitDiffBranches", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitDiffBranchesContext();
          });
          return runs(function() {
            return expect(GitDiffBranches).toHaveBeenCalledWith(repo);
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitDiffBranchesContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No repository found");
        });
      });
    });
    return describe("GitDiffBranchFilesContext", function() {
      var GitDiffBranchFiles, GitDiffBranchFilesContext, ref;
      ref = [], GitDiffBranchFiles = ref[0], GitDiffBranchFilesContext = ref[1];
      beforeEach(function() {
        GitDiffBranchFiles = quibble('../../lib/models/git-diff-branch-files', jasmine.createSpy('GitDiffBranchFiles'));
        return GitDiffBranchFilesContext = require('../../lib/models/context/git-diff-branch-files-context');
      });
      describe("when an object in the tree is selected", function() {
        return it("calls GitDiffBranchFiles", function() {
          spyOn(contextPackageFinder, 'get').andReturn({
            selectedPath: selectedFilePath
          });
          waitsForPromise(function() {
            return GitDiffBranchFilesContext();
          });
          return runs(function() {
            return expect(GitDiffBranchFiles).toHaveBeenCalledWith(repo, selectedFilePath);
          });
        });
      });
      return describe("when an object is not selected", function() {
        return it("notifies the user of the issue", function() {
          spyOn(notifier, 'addInfo');
          GitDiffBranchFilesContext();
          return expect(notifier.addInfo).toHaveBeenCalledWith("No repository found");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWNvbnRleHQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUjs7RUFDWCxvQkFBQSxHQUF1QixPQUFBLENBQVEsa0NBQVI7O0VBQ3ZCLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDBDQUFSOztFQUNoQixxQkFBQSxHQUF3QixPQUFBLENBQVEsbURBQVI7O0VBRXZCLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsZ0JBQUEsR0FBbUI7O0VBRW5CLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO0lBQ2hDLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxnQkFBWCxDQUE0QixDQUFDLFNBQTdCLENBQXVDLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQXZDO0lBRFMsQ0FBWDtJQUdBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7TUFDeEIsUUFBQSxDQUFTLHdDQUFULEVBQW1ELFNBQUE7ZUFDakQsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUE7VUFDbkIsS0FBQSxDQUFNLG9CQUFOLEVBQTRCLEtBQTVCLENBQWtDLENBQUMsU0FBbkMsQ0FBNkM7WUFBQyxZQUFBLEVBQWMsZ0JBQWY7V0FBN0M7VUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVg7VUFDQSxlQUFBLENBQWdCLFNBQUE7bUJBQUcsYUFBQSxDQUFBO1VBQUgsQ0FBaEI7aUJBQ0EsSUFBQSxDQUFLLFNBQUE7bUJBQUcsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsSUFBckMsRUFB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QUFnQixTQUFoQjtVQUNBLHlCQUFBLENBQUE7aUJBQ0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxPQUFoQixDQUF3QixDQUFDLG9CQUF6QixDQUE4QyxxQkFBOUM7UUFIbUMsQ0FBckM7TUFEeUMsQ0FBM0M7SUFib0MsQ0FBdEM7RUE3S2dDLENBQWxDO0FBVkEiLCJzb3VyY2VzQ29udGVudCI6WyJxdWliYmxlID0gcmVxdWlyZSAncXVpYmJsZSdcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL2xpYi9ub3RpZmllcidcbmNvbnRleHRQYWNrYWdlRmluZGVyID0gcmVxdWlyZSAnLi4vLi4vbGliL2NvbnRleHQtcGFja2FnZS1maW5kZXInXG5HaXRBZGRDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1hZGQtY29udGV4dCdcbkdpdFVuc3RhZ2VGaWxlQ29udGV4dCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvY29udGV4dC9naXQtdW5zdGFnZS1maWxlLWNvbnRleHQnXG5cbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuc2VsZWN0ZWRGaWxlUGF0aCA9ICdzZWxlY3RlZC9wYXRoJ1xuXG5kZXNjcmliZSBcIkNvbnRleHQtbWVudSBjb21tYW5kc1wiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgc3B5T24oZ2l0LCAnZ2V0UmVwb0ZvclBhdGgnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcG8pXG5cbiAgZGVzY3JpYmUgXCJHaXRBZGRDb250ZXh0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQ6OmFkZFwiLCAtPlxuICAgICAgICBzcHlPbihjb250ZXh0UGFja2FnZUZpbmRlciwgJ2dldCcpLmFuZFJldHVybiB7c2VsZWN0ZWRQYXRoOiBzZWxlY3RlZEZpbGVQYXRofVxuICAgICAgICBzcHlPbihnaXQsICdhZGQnKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0QWRkQ29udGV4dCgpXG4gICAgICAgIHJ1bnMgLT4gZXhwZWN0KGdpdC5hZGQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIGZpbGU6IHNlbGVjdGVkRmlsZVBhdGhcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXRBZGRDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBhZGRcIlxuXG4gIGRlc2NyaWJlIFwiR2l0QWRkQW5kQ29tbWl0Q29udGV4dFwiLCAtPlxuICAgIEdpdEFkZEFuZENvbW1pdENvbnRleHQgPSBudWxsXG4gICAgR2l0Q29tbWl0ID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgR2l0Q29tbWl0ID0gcXVpYmJsZSAnLi4vLi4vbGliL21vZGVscy9naXQtY29tbWl0JywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdENvbW1pdCcpXG4gICAgICBHaXRBZGRBbmRDb21taXRDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1hZGQtYW5kLWNvbW1pdC1jb250ZXh0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQ6OmFkZCBhbmQgR2l0Q29tbWl0XCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHNweU9uKGdpdCwgJ2FkZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0QWRkQW5kQ29tbWl0Q29udGV4dCgpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmFkZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogc2VsZWN0ZWRGaWxlUGF0aFxuICAgICAgICAgIGV4cGVjdChHaXRDb21taXQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG9cblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXRBZGRBbmRDb21taXRDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBhZGQgYW5kIGNvbW1pdFwiXG5cbiAgZGVzY3JpYmUgXCJHaXREaWZmQ29udGV4dFwiLCAtPlxuICAgIEdpdERpZmYgPSBudWxsXG4gICAgR2l0RGlmZkNvbnRleHQgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBHaXREaWZmID0gcXVpYmJsZSAnLi4vLi4vbGliL21vZGVscy9naXQtZGlmZicsIGphc21pbmUuY3JlYXRlU3B5KCdHaXREaWZmJylcbiAgICAgIEdpdERpZmZDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWNvbnRleHQnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGluIHRoZSB0cmVlIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIEdpdERpZmZcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdERpZmZDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoR2l0RGlmZikudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgZmlsZTogc2VsZWN0ZWRGaWxlUGF0aFxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpcyBub3Qgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgb2YgdGhlIGlzc3VlXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkSW5mbycpXG4gICAgICAgIEdpdERpZmZDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gZmlsZSBzZWxlY3RlZCB0byBkaWZmXCJcblxuICBkZXNjcmliZSBcIkdpdERpZmZ0b29sQ29udGV4dFwiLCAtPlxuICAgIEdpdERpZmZUb29sID0gbnVsbFxuICAgIEdpdERpZmZ0b29sQ29udGV4dCA9IG51bGxcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEdpdERpZmZUb29sID0gcXVpYmJsZSAnLi4vLi4vbGliL21vZGVscy9naXQtZGlmZnRvb2wnLCBqYXNtaW5lLmNyZWF0ZVNweSgnR2l0RGlmZlRvb2wnKVxuICAgICAgR2l0RGlmZnRvb2xDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmdG9vbC1jb250ZXh0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBHaXREaWZmVG9vbFwiLCAtPlxuICAgICAgICBzcHlPbihjb250ZXh0UGFja2FnZUZpbmRlciwgJ2dldCcpLmFuZFJldHVybiB7c2VsZWN0ZWRQYXRoOiBzZWxlY3RlZEZpbGVQYXRofVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0RGlmZnRvb2xDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoR2l0RGlmZlRvb2wpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIGZpbGU6IHNlbGVjdGVkRmlsZVBhdGhcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXREaWZmdG9vbENvbnRleHQoKVxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJObyBmaWxlIHNlbGVjdGVkIHRvIGRpZmZcIlxuXG4gIGRlc2NyaWJlIFwiR2l0Q2hlY2tvdXRGaWxlQ29udGV4dFwiLCAtPlxuICAgIEdpdENoZWNrb3V0RmlsZSA9IG51bGxcbiAgICBHaXRDaGVja291dEZpbGVDb250ZXh0ID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgR2l0Q2hlY2tvdXRGaWxlID0gcXVpYmJsZSAnLi4vLi4vbGliL21vZGVscy9naXQtY2hlY2tvdXQtZmlsZScsIGphc21pbmUuY3JlYXRlU3B5KCdHaXRDaGVja291dEZpbGUnKVxuICAgICAgR2l0Q2hlY2tvdXRGaWxlQ29udGV4dCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvY29udGV4dC9naXQtY2hlY2tvdXQtZmlsZS1jb250ZXh0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBDaGVja291dEZpbGVcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgc3B5T24oYXRvbSwgJ2NvbmZpcm0nKS5hbmRDYWxsRmFrZSAtPiBhdG9tLmNvbmZpcm0ubW9zdFJlY2VudENhbGwuYXJnc1swXS5idXR0b25zLlllcygpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDaGVja291dEZpbGVDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoR2l0Q2hlY2tvdXRGaWxlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvLCBmaWxlOiBzZWxlY3RlZEZpbGVQYXRoXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGlzIG5vdCBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJub3RpZmllcyB0aGUgdXNlciBvZiB0aGUgaXNzdWVcIiwgLT5cbiAgICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgICAgR2l0Q2hlY2tvdXRGaWxlQ29udGV4dCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIGZpbGUgc2VsZWN0ZWQgdG8gY2hlY2tvdXRcIlxuXG4gIGRlc2NyaWJlIFwiR2l0VW5zdGFnZUZpbGVDb250ZXh0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQ6OmNtZCB0byB1bnN0YWdlIGZpbGVzXCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0VW5zdGFnZUZpbGVDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydyZXNldCcsICdIRUFEJywgJy0tJywgc2VsZWN0ZWRGaWxlUGF0aF0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXRVbnN0YWdlRmlsZUNvbnRleHQoKVxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkSW5mbykudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJObyBmaWxlIHNlbGVjdGVkIHRvIHVuc3RhZ2VcIlxuXG4gIGRlc2NyaWJlIFwiR2l0UHVsbENvbnRleHRcIiwgLT5cbiAgICBbR2l0UHVsbCwgR2l0UHVsbENvbnRleHRdID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEdpdFB1bGwgPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1wdWxsJywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdFB1bGwnKVxuICAgICAgR2l0UHVsbENvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LXB1bGwtY29udGV4dCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaW4gdGhlIHRyZWUgaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgR2l0UHVsbCB3aXRoIHRoZSBvcHRpb25zIHJlY2VpdmVkXCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRQdWxsQ29udGV4dCgpXG4gICAgICAgIHJ1bnMgLT4gZXhwZWN0KEdpdFB1bGwpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG9cblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXRQdWxsQ29udGV4dCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIHJlcG9zaXRvcnkgZm91bmRcIlxuXG4gIGRlc2NyaWJlIFwiR2l0UHVzaENvbnRleHRcIiwgLT5cbiAgICBbR2l0UHVzaCwgR2l0UHVzaENvbnRleHRdID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEdpdFB1c2ggPSBxdWliYmxlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1wdXNoJywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdFB1c2gnKVxuICAgICAgR2l0UHVzaENvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LXB1c2gtY29udGV4dCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaW4gdGhlIHRyZWUgaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgR2l0UHVzaCB3aXRoIHRoZSBvcHRpb25zIHJlY2VpdmVkXCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRQdXNoQ29udGV4dChzZXRVcHN0cmVhbTogdHJ1ZSlcbiAgICAgICAgcnVucyAtPiBleHBlY3QoR2l0UHVzaCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgc2V0VXBzdHJlYW06IHRydWVcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXRQdXNoQ29udGV4dCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIHJlcG9zaXRvcnkgZm91bmRcIlxuXG4gIGRlc2NyaWJlIFwiR2l0RGlmZkJyYW5jaGVzQ29udGV4dFwiLCAtPlxuICAgIFtHaXREaWZmQnJhbmNoZXMsIEdpdERpZmZCcmFuY2hlc0NvbnRleHRdID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEdpdERpZmZCcmFuY2hlcyA9IHF1aWJibGUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoZXMnLCBqYXNtaW5lLmNyZWF0ZVNweSgnR2l0RGlmZkJyYW5jaGVzJylcbiAgICAgIEdpdERpZmZCcmFuY2hlc0NvbnRleHQgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2NvbnRleHQvZ2l0LWRpZmYtYnJhbmNoZXMtY29udGV4dCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaW4gdGhlIHRyZWUgaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgR2l0RGlmZkJyYW5jaGVzXCIsIC0+XG4gICAgICAgIHNweU9uKGNvbnRleHRQYWNrYWdlRmluZGVyLCAnZ2V0JykuYW5kUmV0dXJuIHtzZWxlY3RlZFBhdGg6IHNlbGVjdGVkRmlsZVBhdGh9XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXREaWZmQnJhbmNoZXNDb250ZXh0KClcbiAgICAgICAgcnVucyAtPiBleHBlY3QoR2l0RGlmZkJyYW5jaGVzKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCByZXBvXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYW4gb2JqZWN0IGlzIG5vdCBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJub3RpZmllcyB0aGUgdXNlciBvZiB0aGUgaXNzdWVcIiwgLT5cbiAgICAgICAgc3B5T24obm90aWZpZXIsICdhZGRJbmZvJylcbiAgICAgICAgR2l0RGlmZkJyYW5jaGVzQ29udGV4dCgpXG4gICAgICAgIGV4cGVjdChub3RpZmllci5hZGRJbmZvKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBcIk5vIHJlcG9zaXRvcnkgZm91bmRcIlxuXG4gIGRlc2NyaWJlIFwiR2l0RGlmZkJyYW5jaEZpbGVzQ29udGV4dFwiLCAtPlxuICAgIFtHaXREaWZmQnJhbmNoRmlsZXMsIEdpdERpZmZCcmFuY2hGaWxlc0NvbnRleHRdID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIEdpdERpZmZCcmFuY2hGaWxlcyA9IHF1aWJibGUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoLWZpbGVzJywgamFzbWluZS5jcmVhdGVTcHkoJ0dpdERpZmZCcmFuY2hGaWxlcycpXG4gICAgICBHaXREaWZmQnJhbmNoRmlsZXNDb250ZXh0ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9jb250ZXh0L2dpdC1kaWZmLWJyYW5jaC1maWxlcy1jb250ZXh0J1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIG9iamVjdCBpbiB0aGUgdHJlZSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBHaXREaWZmQnJhbmNoRmlsZXNcIiwgLT5cbiAgICAgICAgc3B5T24oY29udGV4dFBhY2thZ2VGaW5kZXIsICdnZXQnKS5hbmRSZXR1cm4ge3NlbGVjdGVkUGF0aDogc2VsZWN0ZWRGaWxlUGF0aH1cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdERpZmZCcmFuY2hGaWxlc0NvbnRleHQoKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChHaXREaWZmQnJhbmNoRmlsZXMpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIHNlbGVjdGVkRmlsZVBhdGhcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhbiBvYmplY3QgaXMgbm90IHNlbGVjdGVkXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIHRoZSB1c2VyIG9mIHRoZSBpc3N1ZVwiLCAtPlxuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEluZm8nKVxuICAgICAgICBHaXREaWZmQnJhbmNoRmlsZXNDb250ZXh0KClcbiAgICAgICAgZXhwZWN0KG5vdGlmaWVyLmFkZEluZm8pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFwiTm8gcmVwb3NpdG9yeSBmb3VuZFwiXG4iXX0=
