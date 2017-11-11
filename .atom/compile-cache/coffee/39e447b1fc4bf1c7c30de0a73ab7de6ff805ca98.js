(function() {
  var getCommands, git;

  git = require('./git');

  getCommands = function() {
    var GitCheckoutAllFiles, GitCheckoutBranch, GitCheckoutFile, GitCheckoutNewBranch, GitCherryPick, GitCommit, GitCommitAmend, GitDeleteBranch, GitDiff, GitDiffAll, GitDiffBranchFiles, GitDiffBranches, GitDifftool, GitFetch, GitFetchAll, GitFetchPrune, GitInit, GitLog, GitMerge, GitOpenChangedFiles, GitPull, GitPush, GitRebase, GitRemove, GitRun, GitShow, GitStageFiles, GitStageFilesBeta, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStashSaveMessage, GitStatus, GitTags, GitUnstageFiles, commands;
    GitCheckoutNewBranch = require('./models/git-checkout-new-branch');
    GitCheckoutBranch = require('./models/git-checkout-branch');
    GitDeleteBranch = require('./models/git-delete-branch');
    GitCheckoutAllFiles = require('./models/git-checkout-all-files');
    GitCheckoutFile = require('./models/git-checkout-file');
    GitCherryPick = require('./models/git-cherry-pick');
    GitCommit = require('./models/git-commit');
    GitCommitAmend = require('./models/git-commit-amend');
    GitDiff = require('./models/git-diff');
    GitDiffBranches = require('./models/git-diff-branches');
    GitDiffBranchFiles = require('./models/git-diff-branch-files');
    GitDifftool = require('./models/git-difftool');
    GitDiffAll = require('./models/git-diff-all');
    GitFetch = require('./models/git-fetch');
    GitFetchAll = require('./models/git-fetch-all');
    GitFetchPrune = require('./models/git-fetch-prune');
    GitInit = require('./models/git-init');
    GitLog = require('./models/git-log');
    GitPull = require('./models/git-pull');
    GitPush = require('./models/git-push');
    GitRemove = require('./models/git-remove');
    GitShow = require('./models/git-show');
    GitStageFiles = require('./models/git-stage-files');
    GitStageFilesBeta = require('./models/git-stage-files-beta');
    GitStageHunk = require('./models/git-stage-hunk');
    GitStashApply = require('./models/git-stash-apply');
    GitStashDrop = require('./models/git-stash-drop');
    GitStashPop = require('./models/git-stash-pop');
    GitStashSave = require('./models/git-stash-save');
    GitStashSaveMessage = require('./models/git-stash-save-message');
    GitStatus = require('./models/git-status');
    GitTags = require('./models/git-tags');
    GitUnstageFiles = require('./models/git-unstage-files');
    GitRun = require('./models/git-run');
    GitMerge = require('./models/git-merge');
    GitRebase = require('./models/git-rebase');
    GitOpenChangedFiles = require('./models/git-open-changed-files');
    commands = [];
    git.getAllRepos().then(function(repos) {
      return commands.push([
        'git-plus:fetch-all', 'Fetch All', function() {
          return GitFetchAll(repos);
        }
      ]);
    });
    return git.getRepo().then(function(repo) {
      var currentFile, ref;
      currentFile = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
      git.refresh(repo);
      if (atom.config.get('git-plus.experimental.customCommands')) {
        commands = commands.concat(require('./service').getCustomCommands());
      }
      commands.push([
        'git-plus:add', 'Add', function() {
          return git.add(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:add-modified', 'Add Modified', function() {
          return git.add(repo, {
            update: true
          });
        }
      ]);
      commands.push([
        'git-plus:add-all', 'Add All', function() {
          return git.add(repo);
        }
      ]);
      commands.push([
        'git-plus:log', 'Log', function() {
          return GitLog(repo);
        }
      ]);
      commands.push([
        'git-plus:log-current-file', 'Log Current File', function() {
          return GitLog(repo, {
            onlyCurrentFile: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove-current-file', 'Remove Current File', function() {
          return GitRemove(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-all-files', 'Checkout All Files', function() {
          return GitCheckoutAllFiles(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-current-file', 'Checkout Current File', function() {
          return GitCheckoutFile(repo, {
            file: currentFile
          });
        }
      ]);
      commands.push([
        'git-plus:commit', 'Commit', function() {
          return GitCommit(repo);
        }
      ]);
      commands.push([
        'git-plus:commit-all', 'Commit All', function() {
          return GitCommit(repo, {
            stageChanges: true
          });
        }
      ]);
      commands.push([
        'git-plus:commit-amend', 'Commit Amend', function() {
          return GitCommitAmend(repo);
        }
      ]);
      commands.push([
        'git-plus:add-and-commit', 'Add And Commit', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-and-commit-and-push', 'Add And Commit And Push', function() {
          return git.add(repo, {
            file: currentFile
          }).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-and-commit', 'Add All And Commit', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo);
          });
        }
      ]);
      commands.push([
        'git-plus:add-all-commit-and-push', 'Add All, Commit And Push', function() {
          return git.add(repo).then(function() {
            return GitCommit(repo, {
              andPush: true
            });
          });
        }
      ]);
      commands.push([
        'git-plus:commit-all-and-push', 'Commit All And Push', function() {
          return GitCommit(repo, {
            stageChanges: true,
            andPush: true
          });
        }
      ]);
      commands.push([
        'git-plus:checkout', 'Checkout', function() {
          return GitCheckoutBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:checkout-remote', 'Checkout Remote', function() {
          return GitCheckoutBranch(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:new-branch', 'Checkout New Branch', function() {
          return GitCheckoutNewBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-local-branch', 'Delete Local Branch', function() {
          return GitDeleteBranch(repo);
        }
      ]);
      commands.push([
        'git-plus:delete-remote-branch', 'Delete Remote Branch', function() {
          return GitDeleteBranch(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:cherry-pick', 'Cherry-Pick', function() {
          return GitCherryPick(repo);
        }
      ]);
      commands.push([
        'git-plus:diff', 'Diff', function() {
          return GitDiff(repo, {
            file: currentFile
          });
        }
      ]);
      if (atom.config.get('git-plus.experimental.diffBranches')) {
        commands.push([
          'git-plus:diff-branches', 'Diff branches', function() {
            return GitDiffBranches(repo);
          }
        ]);
        commands.push([
          'git-plus:diff-branch-files', 'Diff branch files', function() {
            return GitDiffBranchFiles(repo);
          }
        ]);
      }
      commands.push([
        'git-plus:difftool', 'Difftool', function() {
          return GitDifftool(repo);
        }
      ]);
      commands.push([
        'git-plus:diff-all', 'Diff All', function() {
          return GitDiffAll(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch', 'Fetch', function() {
          return GitFetch(repo);
        }
      ]);
      commands.push([
        'git-plus:fetch-prune', 'Fetch Prune', function() {
          return GitFetchPrune(repo);
        }
      ]);
      commands.push([
        'git-plus:pull', 'Pull', function() {
          return GitPull(repo);
        }
      ]);
      commands.push([
        'git-plus:push', 'Push', function() {
          return GitPush(repo);
        }
      ]);
      commands.push([
        'git-plus:push-set-upstream', 'Push -u', function() {
          return GitPush(repo, {
            setUpstream: true
          });
        }
      ]);
      commands.push([
        'git-plus:remove', 'Remove', function() {
          return GitRemove(repo, {
            showSelector: true
          });
        }
      ]);
      commands.push([
        'git-plus:reset', 'Reset HEAD', function() {
          return git.reset(repo);
        }
      ]);
      commands.push([
        'git-plus:show', 'Show', function() {
          return GitShow(repo);
        }
      ]);
      if (atom.config.get('git-plus.experimental.stageFilesBeta')) {
        commands.push([
          'git-plus:stage-files', 'Stage Files', function() {
            return GitStageFilesBeta(repo);
          }
        ]);
      } else {
        commands.push([
          'git-plus:stage-files', 'Stage Files', function() {
            return GitStageFiles(repo);
          }
        ]);
        commands.push([
          'git-plus:unstage-files', 'Unstage Files', function() {
            return GitUnstageFiles(repo);
          }
        ]);
      }
      commands.push([
        'git-plus:stage-hunk', 'Stage Hunk', function() {
          return GitStageHunk(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save', 'Stash: Save Changes', function() {
          return GitStashSave(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-save-message', 'Stash: Save Changes With Message', function() {
          return GitStashSaveMessage(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-pop', 'Stash: Apply (Pop)', function() {
          return GitStashPop(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-apply', 'Stash: Apply (Keep)', function() {
          return GitStashApply(repo);
        }
      ]);
      commands.push([
        'git-plus:stash-delete', 'Stash: Delete (Drop)', function() {
          return GitStashDrop(repo);
        }
      ]);
      commands.push([
        'git-plus:status', 'Status', function() {
          return GitStatus(repo);
        }
      ]);
      commands.push([
        'git-plus:tags', 'Tags', function() {
          return GitTags(repo);
        }
      ]);
      commands.push([
        'git-plus:run', 'Run', function() {
          return new GitRun(repo);
        }
      ]);
      commands.push([
        'git-plus:merge', 'Merge', function() {
          return GitMerge(repo);
        }
      ]);
      commands.push([
        'git-plus:merge-remote', 'Merge Remote', function() {
          return GitMerge(repo, {
            remote: true
          });
        }
      ]);
      commands.push([
        'git-plus:merge-no-fast-forward', 'Merge without fast-forward', function() {
          return GitMerge(repo, {
            noFastForward: true
          });
        }
      ]);
      commands.push([
        'git-plus:rebase', 'Rebase', function() {
          return GitRebase(repo);
        }
      ]);
      commands.push([
        'git-plus:git-open-changed-files', 'Open Changed Files', function() {
          return GitOpenChangedFiles(repo);
        }
      ]);
      return commands;
    });
  };

  module.exports = getCommands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2dpdC1wbHVzLWNvbW1hbmRzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUVOLFdBQUEsR0FBYyxTQUFBO0FBQ1osUUFBQTtJQUFBLG9CQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQ0FBUjtJQUN6QixpQkFBQSxHQUF5QixPQUFBLENBQVEsOEJBQVI7SUFDekIsZUFBQSxHQUF5QixPQUFBLENBQVEsNEJBQVI7SUFDekIsbUJBQUEsR0FBeUIsT0FBQSxDQUFRLGlDQUFSO0lBQ3pCLGVBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSO0lBQ3pCLGFBQUEsR0FBeUIsT0FBQSxDQUFRLDBCQUFSO0lBQ3pCLFNBQUEsR0FBeUIsT0FBQSxDQUFRLHFCQUFSO0lBQ3pCLGNBQUEsR0FBeUIsT0FBQSxDQUFRLDJCQUFSO0lBQ3pCLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSO0lBQ3pCLGVBQUEsR0FBeUIsT0FBQSxDQUFRLDRCQUFSO0lBQ3pCLGtCQUFBLEdBQXlCLE9BQUEsQ0FBUSxnQ0FBUjtJQUN6QixXQUFBLEdBQXlCLE9BQUEsQ0FBUSx1QkFBUjtJQUN6QixVQUFBLEdBQXlCLE9BQUEsQ0FBUSx1QkFBUjtJQUN6QixRQUFBLEdBQXlCLE9BQUEsQ0FBUSxvQkFBUjtJQUN6QixXQUFBLEdBQXlCLE9BQUEsQ0FBUSx3QkFBUjtJQUN6QixhQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQkFBUjtJQUN6QixPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUjtJQUN6QixNQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQkFBUjtJQUN6QixPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUjtJQUN6QixPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUjtJQUN6QixTQUFBLEdBQXlCLE9B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QVUsSUFBVjtRQUFILENBQTlCO09BQWQ7TUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjO1FBQUMsZUFBRCxFQUFrQixNQUFsQixFQUEwQixTQUFBO2lCQUFHLE9BQUEsQ0FBUSxJQUFSO1FBQUgsQ0FBMUI7T0FBZDtNQUNBLFFBQVEsQ0FBQyxJQUFULENBQWM7UUFBQyxjQUFELEVBQWlCLEtBQWpCLEVBQXdCLFNBQUE7aUJBQU8sSUFBQSxNQUFBLENBQU8sSUFBUDtRQUFQLENBQXhCO09BQWQ7TUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjO1FBQUMsZ0JBQUQsRUFBbUIsT0FBbkIsRUFBNEIsU0FBQTtpQkFBRyxRQUFBLENBQVMsSUFBVDtRQUFILENBQTVCO09BQWQ7TUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjO1FBQUMsdUJBQUQsRUFBMEIsY0FBMUIsRUFBMEMsU0FBQTtpQkFBRyxRQUFBLENBQVMsSUFBVCxFQUFlO1lBQUEsTUFBQSxFQUFRLElBQVI7V0FBZjtRQUFILENBQTFDO09BQWQ7TUFDQSxRQUFRLENBQUMsSUFBVCxDQUFjO1FBQUMsZ0NBQUQsRUFBbUMsNEJBQW5DLEVBQWlFLFNBQUE7aUJBQUcsUUFBQSxDQUFTLElBQVQsRUFBZTtZQUFBLGFBQUEsRUFBZSxJQUFmO1dBQWY7UUFBSCxDQUFqRTtPQUFkO01BQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYztRQUFDLGlCQUFELEVBQW9CLFFBQXBCLEVBQThCLFNBQUE7aUJBQUcsU0FBQSxDQUFVLElBQVY7UUFBSCxDQUE5QjtPQUFkO01BQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYztRQUFDLGlDQUFELEVBQW9DLG9CQUFwQyxFQUEwRCxTQUFBO2lCQUFHLG1CQUFBLENBQW9CLElBQXBCO1FBQUgsQ0FBMUQ7T0FBZDtBQUVBLGFBQU87SUE3REgsQ0FEUjtFQTNDWTs7RUEyR2QsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3R2pCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi9naXQnXG5cbmdldENvbW1hbmRzID0gLT5cbiAgR2l0Q2hlY2tvdXROZXdCcmFuY2ggICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jaGVja291dC1uZXctYnJhbmNoJ1xuICBHaXRDaGVja291dEJyYW5jaCAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWJyYW5jaCdcbiAgR2l0RGVsZXRlQnJhbmNoICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kZWxldGUtYnJhbmNoJ1xuICBHaXRDaGVja291dEFsbEZpbGVzICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWFsbC1maWxlcydcbiAgR2l0Q2hlY2tvdXRGaWxlICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jaGVja291dC1maWxlJ1xuICBHaXRDaGVycnlQaWNrICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNoZXJyeS1waWNrJ1xuICBHaXRDb21taXQgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWNvbW1pdCdcbiAgR2l0Q29tbWl0QW1lbmQgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1jb21taXQtYW1lbmQnXG4gIEdpdERpZmYgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtZGlmZidcbiAgR2l0RGlmZkJyYW5jaGVzICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1kaWZmLWJyYW5jaGVzJ1xuICBHaXREaWZmQnJhbmNoRmlsZXMgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRpZmYtYnJhbmNoLWZpbGVzJ1xuICBHaXREaWZmdG9vbCAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRpZmZ0b29sJ1xuICBHaXREaWZmQWxsICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWRpZmYtYWxsJ1xuICBHaXRGZXRjaCAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWZldGNoJ1xuICBHaXRGZXRjaEFsbCAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWZldGNoLWFsbCdcbiAgR2l0RmV0Y2hQcnVuZSAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1mZXRjaC1wcnVuZSdcbiAgR2l0SW5pdCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1pbml0J1xuICBHaXRMb2cgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LWxvZydcbiAgR2l0UHVsbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1wdWxsJ1xuICBHaXRQdXNoICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXB1c2gnXG4gIEdpdFJlbW92ZSAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcmVtb3ZlJ1xuICBHaXRTaG93ICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXNob3cnXG4gIEdpdFN0YWdlRmlsZXMgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhZ2UtZmlsZXMnXG4gIEdpdFN0YWdlRmlsZXNCZXRhICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3RhZ2UtZmlsZXMtYmV0YSdcbiAgR2l0U3RhZ2VIdW5rICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1zdGFnZS1odW5rJ1xuICBHaXRTdGFzaEFwcGx5ICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLWFwcGx5J1xuICBHaXRTdGFzaERyb3AgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLWRyb3AnXG4gIEdpdFN0YXNoUG9wICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtcG9wJ1xuICBHaXRTdGFzaFNhdmUgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXNoLXNhdmUnXG4gIEdpdFN0YXNoU2F2ZU1lc3NhZ2UgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtc3Rhc2gtc2F2ZS1tZXNzYWdlJ1xuICBHaXRTdGF0dXMgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXN0YXR1cydcbiAgR2l0VGFncyAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC10YWdzJ1xuICBHaXRVbnN0YWdlRmlsZXMgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXVuc3RhZ2UtZmlsZXMnXG4gIEdpdFJ1biAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21vZGVscy9naXQtcnVuJ1xuICBHaXRNZXJnZSAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LW1lcmdlJ1xuICBHaXRSZWJhc2UgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXJlYmFzZSdcbiAgR2l0T3BlbkNoYW5nZWRGaWxlcyAgICA9IHJlcXVpcmUgJy4vbW9kZWxzL2dpdC1vcGVuLWNoYW5nZWQtZmlsZXMnXG5cbiAgY29tbWFuZHMgPSBbXVxuICBnaXQuZ2V0QWxsUmVwb3MoKS50aGVuIChyZXBvcykgLT5cbiAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZmV0Y2gtYWxsJywgJ0ZldGNoIEFsbCcsIC0+IEdpdEZldGNoQWxsKHJlcG9zKV1cblxuICBnaXQuZ2V0UmVwbygpXG4gICAgLnRoZW4gKHJlcG8pIC0+XG4gICAgICBjdXJyZW50RmlsZSA9IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLmN1c3RvbUNvbW1hbmRzJylcbiAgICAgICAgY29tbWFuZHMgPSBjb21tYW5kcy5jb25jYXQocmVxdWlyZSgnLi9zZXJ2aWNlJykuZ2V0Q3VzdG9tQ29tbWFuZHMoKSlcbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQnLCAnQWRkJywgLT4gZ2l0LmFkZChyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLW1vZGlmaWVkJywgJ0FkZCBNb2RpZmllZCcsIC0+IGdpdC5hZGQocmVwbywgdXBkYXRlOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYWxsJywgJ0FkZCBBbGwnLCAtPiBnaXQuYWRkKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmxvZycsICdMb2cnLCAtPiBHaXRMb2cocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6bG9nLWN1cnJlbnQtZmlsZScsICdMb2cgQ3VycmVudCBGaWxlJywgLT4gR2l0TG9nKHJlcG8sIG9ubHlDdXJyZW50RmlsZTogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cmVtb3ZlLWN1cnJlbnQtZmlsZScsICdSZW1vdmUgQ3VycmVudCBGaWxlJywgLT4gR2l0UmVtb3ZlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0LWFsbC1maWxlcycsICdDaGVja291dCBBbGwgRmlsZXMnLCAtPiBHaXRDaGVja291dEFsbEZpbGVzKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0LWN1cnJlbnQtZmlsZScsICdDaGVja291dCBDdXJyZW50IEZpbGUnLCAtPiBHaXRDaGVja291dEZpbGUocmVwbywgZmlsZTogY3VycmVudEZpbGUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNvbW1pdCcsICdDb21taXQnLCAtPiBHaXRDb21taXQocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6Y29tbWl0LWFsbCcsICdDb21taXQgQWxsJywgLT4gR2l0Q29tbWl0KHJlcG8sIHN0YWdlQ2hhbmdlczogdHJ1ZSldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6Y29tbWl0LWFtZW5kJywgJ0NvbW1pdCBBbWVuZCcsIC0+IEdpdENvbW1pdEFtZW5kKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0JywgJ0FkZCBBbmQgQ29tbWl0JywgLT4gZ2l0LmFkZChyZXBvLCBmaWxlOiBjdXJyZW50RmlsZSkudGhlbiAtPiBHaXRDb21taXQocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6YWRkLWFuZC1jb21taXQtYW5kLXB1c2gnLCAnQWRkIEFuZCBDb21taXQgQW5kIFB1c2gnLCAtPiBnaXQuYWRkKHJlcG8sIGZpbGU6IGN1cnJlbnRGaWxlKS50aGVuIC0+IEdpdENvbW1pdChyZXBvLCBhbmRQdXNoOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYWxsLWFuZC1jb21taXQnLCAnQWRkIEFsbCBBbmQgQ29tbWl0JywgLT4gZ2l0LmFkZChyZXBvKS50aGVuIC0+IEdpdENvbW1pdChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czphZGQtYWxsLWNvbW1pdC1hbmQtcHVzaCcsICdBZGQgQWxsLCBDb21taXQgQW5kIFB1c2gnLCAtPiBnaXQuYWRkKHJlcG8pLnRoZW4gLT4gR2l0Q29tbWl0KHJlcG8sIGFuZFB1c2g6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNvbW1pdC1hbGwtYW5kLXB1c2gnLCAnQ29tbWl0IEFsbCBBbmQgUHVzaCcsIC0+IEdpdENvbW1pdChyZXBvLCBzdGFnZUNoYW5nZXM6IHRydWUsIGFuZFB1c2g6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZWNrb3V0JywgJ0NoZWNrb3V0JywgLT4gR2l0Q2hlY2tvdXRCcmFuY2gocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6Y2hlY2tvdXQtcmVtb3RlJywgJ0NoZWNrb3V0IFJlbW90ZScsIC0+IEdpdENoZWNrb3V0QnJhbmNoKHJlcG8sIHtyZW1vdGU6IHRydWV9KV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpuZXctYnJhbmNoJywgJ0NoZWNrb3V0IE5ldyBCcmFuY2gnLCAtPiBHaXRDaGVja291dE5ld0JyYW5jaChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkZWxldGUtbG9jYWwtYnJhbmNoJywgJ0RlbGV0ZSBMb2NhbCBCcmFuY2gnLCAtPiBHaXREZWxldGVCcmFuY2gocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6ZGVsZXRlLXJlbW90ZS1icmFuY2gnLCAnRGVsZXRlIFJlbW90ZSBCcmFuY2gnLCAtPiBHaXREZWxldGVCcmFuY2gocmVwbywge3JlbW90ZTogdHJ1ZX0pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmNoZXJyeS1waWNrJywgJ0NoZXJyeS1QaWNrJywgLT4gR2l0Q2hlcnJ5UGljayhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkaWZmJywgJ0RpZmYnLCAtPiBHaXREaWZmKHJlcG8sIGZpbGU6IGN1cnJlbnRGaWxlKV1cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLmRpZmZCcmFuY2hlcycpXG4gICAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkaWZmLWJyYW5jaGVzJywgJ0RpZmYgYnJhbmNoZXMnLCAtPiBHaXREaWZmQnJhbmNoZXMocmVwbyldXG4gICAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkaWZmLWJyYW5jaC1maWxlcycsICdEaWZmIGJyYW5jaCBmaWxlcycsIC0+IEdpdERpZmZCcmFuY2hGaWxlcyhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpkaWZmdG9vbCcsICdEaWZmdG9vbCcsIC0+IEdpdERpZmZ0b29sKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmRpZmYtYWxsJywgJ0RpZmYgQWxsJywgLT4gR2l0RGlmZkFsbChyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpmZXRjaCcsICdGZXRjaCcsIC0+IEdpdEZldGNoKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOmZldGNoLXBydW5lJywgJ0ZldGNoIFBydW5lJywgLT4gR2l0RmV0Y2hQcnVuZShyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpwdWxsJywgJ1B1bGwnLCAtPiBHaXRQdWxsKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnB1c2gnLCAnUHVzaCcsIC0+IEdpdFB1c2gocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6cHVzaC1zZXQtdXBzdHJlYW0nLCAnUHVzaCAtdScsIC0+IEdpdFB1c2gocmVwbywgc2V0VXBzdHJlYW06IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnJlbW92ZScsICdSZW1vdmUnLCAtPiBHaXRSZW1vdmUocmVwbywgc2hvd1NlbGVjdG9yOiB0cnVlKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpyZXNldCcsICdSZXNldCBIRUFEJywgLT4gZ2l0LnJlc2V0KHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnNob3cnLCAnU2hvdycsIC0+IEdpdFNob3cocmVwbyldXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmV4cGVyaW1lbnRhbC5zdGFnZUZpbGVzQmV0YScpXG4gICAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFnZS1maWxlcycsICdTdGFnZSBGaWxlcycsIC0+IEdpdFN0YWdlRmlsZXNCZXRhKHJlcG8pXVxuICAgICAgZWxzZVxuICAgICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3RhZ2UtZmlsZXMnLCAnU3RhZ2UgRmlsZXMnLCAtPiBHaXRTdGFnZUZpbGVzKHJlcG8pXVxuICAgICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6dW5zdGFnZS1maWxlcycsICdVbnN0YWdlIEZpbGVzJywgLT4gR2l0VW5zdGFnZUZpbGVzKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YWdlLWh1bmsnLCAnU3RhZ2UgSHVuaycsIC0+IEdpdFN0YWdlSHVuayhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFzaC1zYXZlJywgJ1N0YXNoOiBTYXZlIENoYW5nZXMnLCAtPiBHaXRTdGFzaFNhdmUocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3Rhc2gtc2F2ZS1tZXNzYWdlJywgJ1N0YXNoOiBTYXZlIENoYW5nZXMgV2l0aCBNZXNzYWdlJywgLT4gR2l0U3Rhc2hTYXZlTWVzc2FnZShyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpzdGFzaC1wb3AnLCAnU3Rhc2g6IEFwcGx5IChQb3ApJywgLT4gR2l0U3Rhc2hQb3AocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3Rhc2gtYXBwbHknLCAnU3Rhc2g6IEFwcGx5IChLZWVwKScsIC0+IEdpdFN0YXNoQXBwbHkocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6c3Rhc2gtZGVsZXRlJywgJ1N0YXNoOiBEZWxldGUgKERyb3ApJywgLT4gR2l0U3Rhc2hEcm9wKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnN0YXR1cycsICdTdGF0dXMnLCAtPiBHaXRTdGF0dXMocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6dGFncycsICdUYWdzJywgLT4gR2l0VGFncyhyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czpydW4nLCAnUnVuJywgLT4gbmV3IEdpdFJ1bihyZXBvKV1cbiAgICAgIGNvbW1hbmRzLnB1c2ggWydnaXQtcGx1czptZXJnZScsICdNZXJnZScsIC0+IEdpdE1lcmdlKHJlcG8pXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOm1lcmdlLXJlbW90ZScsICdNZXJnZSBSZW1vdGUnLCAtPiBHaXRNZXJnZShyZXBvLCByZW1vdGU6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOm1lcmdlLW5vLWZhc3QtZm9yd2FyZCcsICdNZXJnZSB3aXRob3V0IGZhc3QtZm9yd2FyZCcsIC0+IEdpdE1lcmdlKHJlcG8sIG5vRmFzdEZvcndhcmQ6IHRydWUpXVxuICAgICAgY29tbWFuZHMucHVzaCBbJ2dpdC1wbHVzOnJlYmFzZScsICdSZWJhc2UnLCAtPiBHaXRSZWJhc2UocmVwbyldXG4gICAgICBjb21tYW5kcy5wdXNoIFsnZ2l0LXBsdXM6Z2l0LW9wZW4tY2hhbmdlZC1maWxlcycsICdPcGVuIENoYW5nZWQgRmlsZXMnLCAtPiBHaXRPcGVuQ2hhbmdlZEZpbGVzKHJlcG8pXVxuXG4gICAgICByZXR1cm4gY29tbWFuZHNcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRDb21tYW5kc1xuIl19
