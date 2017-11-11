(function() {
  var CompositeDisposable, Path, cleanup, cleanupUnstagedText, commit, destroyCommitEditor, diffFiles, disposables, fs, getGitStatus, getStagedFiles, git, notifier, parse, prepFile, prettifyFileStatuses, prettifyStagedFiles, prettyifyPreviousFile, showFile,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Path = require('path');

  CompositeDisposable = require('atom').CompositeDisposable;

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  disposables = new CompositeDisposable;

  prettifyStagedFiles = function(data) {
    var i, mode;
    if (data === '') {
      return [];
    }
    data = data.split(/\0/).slice(0, -1);
    return (function() {
      var j, len, results;
      results = [];
      for (i = j = 0, len = data.length; j < len; i = j += 2) {
        mode = data[i];
        results.push({
          mode: mode,
          path: data[i + 1]
        });
      }
      return results;
    })();
  };

  prettyifyPreviousFile = function(data) {
    return {
      mode: data[0],
      path: data.substring(1).trim()
    };
  };

  prettifyFileStatuses = function(files) {
    return files.map(function(arg) {
      var mode, path;
      mode = arg.mode, path = arg.path;
      switch (mode) {
        case 'M':
          return "modified:   " + path;
        case 'A':
          return "new file:   " + path;
        case 'D':
          return "deleted:   " + path;
        case 'R':
          return "renamed:   " + path;
      }
    });
  };

  getStagedFiles = function(repo) {
    return git.stagedFiles(repo).then(function(files) {
      var args;
      if (files.length >= 1) {
        args = ['diff-index', '--no-color', '--cached', 'HEAD', '--name-status', '-z'];
        return git.cmd(args, {
          cwd: repo.getWorkingDirectory()
        }).then(function(data) {
          return prettifyStagedFiles(data);
        });
      } else {
        return Promise.resolve([]);
      }
    });
  };

  getGitStatus = function(repo) {
    return git.cmd(['-c', 'color.ui=false', 'status'], {
      cwd: repo.getWorkingDirectory()
    });
  };

  diffFiles = function(previousFiles, currentFiles) {
    var currentPaths;
    previousFiles = previousFiles.map(function(p) {
      return prettyifyPreviousFile(p);
    });
    currentPaths = currentFiles.map(function(arg) {
      var path;
      path = arg.path;
      return path;
    });
    return previousFiles.filter(function(p) {
      var ref;
      return (ref = p.path, indexOf.call(currentPaths, ref) >= 0) === false;
    });
  };

  parse = function(prevCommit) {
    var indexOfStatus, lines, message, prevChangedFiles, prevMessage, statusRegex;
    lines = prevCommit.split(/\n/).filter(function(line) {
      return line !== '/n';
    });
    statusRegex = /(([ MADRCU?!])\s(.*))/;
    indexOfStatus = lines.findIndex(function(line) {
      return statusRegex.test(line);
    });
    prevMessage = lines.splice(0, indexOfStatus - 1);
    prevMessage.reverse();
    if (prevMessage[0] === '') {
      prevMessage.shift();
    }
    prevMessage.reverse();
    prevChangedFiles = lines.filter(function(line) {
      return line !== '';
    });
    message = prevMessage.join('\n');
    return {
      message: message,
      prevChangedFiles: prevChangedFiles
    };
  };

  cleanupUnstagedText = function(status) {
    var text, unstagedFiles;
    unstagedFiles = status.indexOf("Changes not staged for commit:");
    if (unstagedFiles >= 0) {
      text = status.substring(unstagedFiles);
      return status = (status.substring(0, unstagedFiles - 1)) + "\n" + (text.replace(/\s*\(.*\)\n/g, ""));
    } else {
      return status;
    }
  };

  prepFile = function(arg) {
    var commentChar, currentChanges, filePath, message, nothingToCommit, prevChangedFiles, replacementText, status, textToReplace;
    commentChar = arg.commentChar, message = arg.message, prevChangedFiles = arg.prevChangedFiles, status = arg.status, filePath = arg.filePath;
    status = cleanupUnstagedText(status);
    status = status.replace(/\s*\(.*\)\n/g, "\n").replace(/\n/g, "\n" + commentChar + " ");
    if (prevChangedFiles.length > 0) {
      nothingToCommit = "nothing to commit, working directory clean";
      currentChanges = "committed:\n" + commentChar;
      textToReplace = null;
      if (status.indexOf(nothingToCommit) > -1) {
        textToReplace = nothingToCommit;
      } else if (status.indexOf(currentChanges) > -1) {
        textToReplace = currentChanges;
      }
      replacementText = "committed:\n" + (prevChangedFiles.map(function(f) {
        return commentChar + "   " + f;
      }).join("\n"));
      status = status.replace(textToReplace, replacementText);
    }
    return fs.writeFileSync(filePath, message + "\n" + commentChar + " Please enter the commit message for your changes. Lines starting\n" + commentChar + " with '" + commentChar + "' will be ignored, and an empty message aborts the commit.\n" + commentChar + "\n" + commentChar + " " + status);
  };

  showFile = function(filePath) {
    var commitEditor, ref, splitDirection;
    commitEditor = (ref = atom.workspace.paneForURI(filePath)) != null ? ref.itemForURI(filePath) : void 0;
    if (!commitEditor) {
      if (atom.config.get('git-plus.general.openInPane')) {
        splitDirection = atom.config.get('git-plus.general.splitPane');
        atom.workspace.getActivePane()["split" + splitDirection]();
      }
      return atom.workspace.open(filePath);
    } else {
      if (atom.config.get('git-plus.general.openInPane')) {
        atom.workspace.paneForURI(filePath).activate();
      } else {
        atom.workspace.paneForURI(filePath).activateItemForURI(filePath);
      }
      return Promise.resolve(commitEditor);
    }
  };

  destroyCommitEditor = function(filePath) {
    var ref, ref1;
    if (atom.config.get('git-plus.general.openInPane')) {
      return (ref = atom.workspace.paneForURI(filePath)) != null ? ref.destroy() : void 0;
    } else {
      return (ref1 = atom.workspace.paneForURI(filePath).itemForURI(filePath)) != null ? ref1.destroy() : void 0;
    }
  };

  commit = function(directory, filePath) {
    var args;
    args = ['commit', '--amend', '--cleanup=strip', "--file=" + filePath];
    return git.cmd(args, {
      cwd: directory
    }).then(function(data) {
      notifier.addSuccess(data);
      destroyCommitEditor(filePath);
      return git.refresh();
    })["catch"](function(data) {
      notifier.addError(data);
      return destroyCommitEditor(filePath);
    });
  };

  cleanup = function(currentPane, filePath) {
    if (currentPane.isAlive()) {
      currentPane.activate();
    }
    return disposables.dispose();
  };

  module.exports = function(repo) {
    var commentChar, currentPane, cwd, filePath, ref;
    currentPane = atom.workspace.getActivePane();
    filePath = Path.join(repo.getPath(), 'COMMIT_EDITMSG');
    cwd = repo.getWorkingDirectory();
    commentChar = (ref = git.getConfig(repo, 'core.commentchar')) != null ? ref : '#';
    return git.cmd(['whatchanged', '-1', '--name-status', '--format=%B'], {
      cwd: cwd
    }).then(function(amend) {
      return parse(amend);
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getStagedFiles(repo).then(function(files) {
        prevChangedFiles = prettifyFileStatuses(diffFiles(prevChangedFiles, files));
        return {
          message: message,
          prevChangedFiles: prevChangedFiles
        };
      });
    }).then(function(arg) {
      var message, prevChangedFiles;
      message = arg.message, prevChangedFiles = arg.prevChangedFiles;
      return getGitStatus(repo).then(function(status) {
        return prepFile({
          commentChar: commentChar,
          message: message,
          prevChangedFiles: prevChangedFiles,
          status: status,
          filePath: filePath
        });
      }).then(function() {
        return showFile(filePath);
      });
    }).then(function(textEditor) {
      disposables.add(textEditor.onDidSave(function() {
        return commit(repo.getWorkingDirectory(), filePath);
      }));
      return disposables.add(textEditor.onDidDestroy(function() {
        return cleanup(currentPane, filePath);
      }));
    })["catch"](function(msg) {
      return notifier.addInfo(msg);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY29tbWl0LWFtZW5kLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMFBBQUE7SUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ04sc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxXQUFBLEdBQWMsSUFBSTs7RUFFbEIsbUJBQUEsR0FBc0IsU0FBQyxJQUFEO0FBQ3BCLFFBQUE7SUFBQSxJQUFhLElBQUEsS0FBUSxFQUFyQjtBQUFBLGFBQU8sR0FBUDs7SUFDQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLENBQWlCOzs7QUFDbkI7V0FBQSxpREFBQTs7cUJBQ0g7VUFBQyxNQUFBLElBQUQ7VUFBTyxJQUFBLEVBQU0sSUFBSyxDQUFBLENBQUEsR0FBRSxDQUFGLENBQWxCOztBQURHOzs7RUFIZTs7RUFNdEIscUJBQUEsR0FBd0IsU0FBQyxJQUFEO1dBQ3RCO01BQUEsSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLENBQVg7TUFDQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLENBQWlCLENBQUMsSUFBbEIsQ0FBQSxDQUROOztFQURzQjs7RUFJeEIsb0JBQUEsR0FBdUIsU0FBQyxLQUFEO1dBQ3JCLEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxHQUFEO0FBQ1IsVUFBQTtNQURVLGlCQUFNO0FBQ2hCLGNBQU8sSUFBUDtBQUFBLGFBQ08sR0FEUDtpQkFFSSxjQUFBLEdBQWU7QUFGbkIsYUFHTyxHQUhQO2lCQUlJLGNBQUEsR0FBZTtBQUpuQixhQUtPLEdBTFA7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QUEsQ0FBZSxJQUFmLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxLQUFEO1FBQ0osZ0JBQUEsR0FBbUIsb0JBQUEsQ0FBcUIsU0FBQSxDQUFVLGdCQUFWLEVBQTRCLEtBQTVCLENBQXJCO2VBQ25CO1VBQUMsU0FBQSxPQUFEO1VBQVUsa0JBQUEsZ0JBQVY7O01BRkksQ0FETjtJQURJLENBRk4sQ0FPQSxDQUFDLElBUEQsQ0FPTSxTQUFDLEdBQUQ7QUFDSixVQUFBO01BRE0sdUJBQVM7YUFDZixZQUFBLENBQWEsSUFBYixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsTUFBRDtlQUFZLFFBQUEsQ0FBUztVQUFDLGFBQUEsV0FBRDtVQUFjLFNBQUEsT0FBZDtVQUF1QixrQkFBQSxnQkFBdkI7VUFBeUMsUUFBQSxNQUF6QztVQUFpRCxVQUFBLFFBQWpEO1NBQVQ7TUFBWixDQUROLENBRUEsQ0FBQyxJQUZELENBRU0sU0FBQTtlQUFHLFFBQUEsQ0FBUyxRQUFUO01BQUgsQ0FGTjtJQURJLENBUE4sQ0FXQSxDQUFDLElBWEQsQ0FXTSxTQUFDLFVBQUQ7TUFDSixXQUFXLENBQUMsR0FBWixDQUFnQixVQUFVLENBQUMsU0FBWCxDQUFxQixTQUFBO2VBQUcsTUFBQSxDQUFPLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVAsRUFBbUMsUUFBbkM7TUFBSCxDQUFyQixDQUFoQjthQUNBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFNBQUE7ZUFBRyxPQUFBLENBQVEsV0FBUixFQUFxQixRQUFyQjtNQUFILENBQXhCLENBQWhCO0lBRkksQ0FYTixDQWNBLEVBQUMsS0FBRCxFQWRBLENBY08sU0FBQyxHQUFEO2FBQVMsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakI7SUFBVCxDQWRQO0VBTGU7QUEvSGpCIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG5wcmV0dGlmeVN0YWdlZEZpbGVzID0gKGRhdGEpIC0+XG4gIHJldHVybiBbXSBpZiBkYXRhIGlzICcnXG4gIGRhdGEgPSBkYXRhLnNwbGl0KC9cXDAvKVsuLi4tMV1cbiAgW10gPSBmb3IgbW9kZSwgaSBpbiBkYXRhIGJ5IDJcbiAgICB7bW9kZSwgcGF0aDogZGF0YVtpKzFdIH1cblxucHJldHR5aWZ5UHJldmlvdXNGaWxlID0gKGRhdGEpIC0+XG4gIG1vZGU6IGRhdGFbMF1cbiAgcGF0aDogZGF0YS5zdWJzdHJpbmcoMSkudHJpbSgpXG5cbnByZXR0aWZ5RmlsZVN0YXR1c2VzID0gKGZpbGVzKSAtPlxuICBmaWxlcy5tYXAgKHttb2RlLCBwYXRofSkgLT5cbiAgICBzd2l0Y2ggbW9kZVxuICAgICAgd2hlbiAnTSdcbiAgICAgICAgXCJtb2RpZmllZDogICAje3BhdGh9XCJcbiAgICAgIHdoZW4gJ0EnXG4gICAgICAgIFwibmV3IGZpbGU6ICAgI3twYXRofVwiXG4gICAgICB3aGVuICdEJ1xuICAgICAgICBcImRlbGV0ZWQ6ICAgI3twYXRofVwiXG4gICAgICB3aGVuICdSJ1xuICAgICAgICBcInJlbmFtZWQ6ICAgI3twYXRofVwiXG5cbmdldFN0YWdlZEZpbGVzID0gKHJlcG8pIC0+XG4gIGdpdC5zdGFnZWRGaWxlcyhyZXBvKS50aGVuIChmaWxlcykgLT5cbiAgICBpZiBmaWxlcy5sZW5ndGggPj0gMVxuICAgICAgYXJncyA9IFsnZGlmZi1pbmRleCcsICctLW5vLWNvbG9yJywgJy0tY2FjaGVkJywgJ0hFQUQnLCAnLS1uYW1lLXN0YXR1cycsICcteiddXG4gICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAoZGF0YSkgLT4gcHJldHRpZnlTdGFnZWRGaWxlcyBkYXRhXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZXNvbHZlIFtdXG5cbmdldEdpdFN0YXR1cyA9IChyZXBvKSAtPlxuICBnaXQuY21kIFsnLWMnLCAnY29sb3IudWk9ZmFsc2UnLCAnc3RhdHVzJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuZGlmZkZpbGVzID0gKHByZXZpb3VzRmlsZXMsIGN1cnJlbnRGaWxlcykgLT5cbiAgcHJldmlvdXNGaWxlcyA9IHByZXZpb3VzRmlsZXMubWFwIChwKSAtPiBwcmV0dHlpZnlQcmV2aW91c0ZpbGUgcFxuICBjdXJyZW50UGF0aHMgPSBjdXJyZW50RmlsZXMubWFwICh7cGF0aH0pIC0+IHBhdGhcbiAgcHJldmlvdXNGaWxlcy5maWx0ZXIgKHApIC0+IHAucGF0aCBpbiBjdXJyZW50UGF0aHMgaXMgZmFsc2VcblxucGFyc2UgPSAocHJldkNvbW1pdCkgLT5cbiAgbGluZXMgPSBwcmV2Q29tbWl0LnNwbGl0KC9cXG4vKS5maWx0ZXIgKGxpbmUpIC0+IGxpbmUgaXNudCAnL24nXG4gIHN0YXR1c1JlZ2V4ID0gLygoWyBNQURSQ1U/IV0pXFxzKC4qKSkvXG4gIGluZGV4T2ZTdGF0dXMgPSBsaW5lcy5maW5kSW5kZXggKGxpbmUpIC0+IHN0YXR1c1JlZ2V4LnRlc3QgbGluZVxuXG4gIHByZXZNZXNzYWdlID0gbGluZXMuc3BsaWNlIDAsIGluZGV4T2ZTdGF0dXMgLSAxXG4gIHByZXZNZXNzYWdlLnJldmVyc2UoKVxuICBwcmV2TWVzc2FnZS5zaGlmdCgpIGlmIHByZXZNZXNzYWdlWzBdIGlzICcnXG4gIHByZXZNZXNzYWdlLnJldmVyc2UoKVxuICBwcmV2Q2hhbmdlZEZpbGVzID0gbGluZXMuZmlsdGVyIChsaW5lKSAtPiBsaW5lIGlzbnQgJydcbiAgbWVzc2FnZSA9IHByZXZNZXNzYWdlLmpvaW4oJ1xcbicpXG4gIHttZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzfVxuXG5jbGVhbnVwVW5zdGFnZWRUZXh0ID0gKHN0YXR1cykgLT5cbiAgdW5zdGFnZWRGaWxlcyA9IHN0YXR1cy5pbmRleE9mIFwiQ2hhbmdlcyBub3Qgc3RhZ2VkIGZvciBjb21taXQ6XCJcbiAgaWYgdW5zdGFnZWRGaWxlcyA+PSAwXG4gICAgdGV4dCA9IHN0YXR1cy5zdWJzdHJpbmcgdW5zdGFnZWRGaWxlc1xuICAgIHN0YXR1cyA9IFwiI3tzdGF0dXMuc3Vic3RyaW5nKDAsIHVuc3RhZ2VkRmlsZXMgLSAxKX1cXG4je3RleHQucmVwbGFjZSAvXFxzKlxcKC4qXFwpXFxuL2csIFwiXCJ9XCJcbiAgZWxzZVxuICAgIHN0YXR1c1xuXG5wcmVwRmlsZSA9ICh7Y29tbWVudENoYXIsIG1lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXMsIHN0YXR1cywgZmlsZVBhdGh9KSAtPlxuICAgIHN0YXR1cyA9IGNsZWFudXBVbnN0YWdlZFRleHQgc3RhdHVzXG4gICAgc3RhdHVzID0gc3RhdHVzLnJlcGxhY2UoL1xccypcXCguKlxcKVxcbi9nLCBcIlxcblwiKS5yZXBsYWNlKC9cXG4vZywgXCJcXG4je2NvbW1lbnRDaGFyfSBcIilcbiAgICBpZiBwcmV2Q2hhbmdlZEZpbGVzLmxlbmd0aCA+IDBcbiAgICAgIG5vdGhpbmdUb0NvbW1pdCA9IFwibm90aGluZyB0byBjb21taXQsIHdvcmtpbmcgZGlyZWN0b3J5IGNsZWFuXCJcbiAgICAgIGN1cnJlbnRDaGFuZ2VzID0gXCJjb21taXR0ZWQ6XFxuI3tjb21tZW50Q2hhcn1cIlxuICAgICAgdGV4dFRvUmVwbGFjZSA9IG51bGxcbiAgICAgIGlmIHN0YXR1cy5pbmRleE9mKG5vdGhpbmdUb0NvbW1pdCkgPiAtMVxuICAgICAgICB0ZXh0VG9SZXBsYWNlID0gbm90aGluZ1RvQ29tbWl0XG4gICAgICBlbHNlIGlmIHN0YXR1cy5pbmRleE9mKGN1cnJlbnRDaGFuZ2VzKSA+IC0xXG4gICAgICAgIHRleHRUb1JlcGxhY2UgPSBjdXJyZW50Q2hhbmdlc1xuICAgICAgcmVwbGFjZW1lbnRUZXh0ID1cbiAgICAgICAgXCJcIlwiY29tbWl0dGVkOlxuICAgICAgICAje1xuICAgICAgICAgIHByZXZDaGFuZ2VkRmlsZXMubWFwKChmKSAtPiBcIiN7Y29tbWVudENoYXJ9ICAgI3tmfVwiKS5qb2luKFwiXFxuXCIpXG4gICAgICAgIH1cIlwiXCJcbiAgICAgIHN0YXR1cyA9IHN0YXR1cy5yZXBsYWNlIHRleHRUb1JlcGxhY2UsIHJlcGxhY2VtZW50VGV4dFxuICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZVBhdGgsXG4gICAgICBcIlwiXCIje21lc3NhZ2V9XG4gICAgICAje2NvbW1lbnRDaGFyfSBQbGVhc2UgZW50ZXIgdGhlIGNvbW1pdCBtZXNzYWdlIGZvciB5b3VyIGNoYW5nZXMuIExpbmVzIHN0YXJ0aW5nXG4gICAgICAje2NvbW1lbnRDaGFyfSB3aXRoICcje2NvbW1lbnRDaGFyfScgd2lsbCBiZSBpZ25vcmVkLCBhbmQgYW4gZW1wdHkgbWVzc2FnZSBhYm9ydHMgdGhlIGNvbW1pdC5cbiAgICAgICN7Y29tbWVudENoYXJ9XG4gICAgICAje2NvbW1lbnRDaGFyfSAje3N0YXR1c31cIlwiXCJcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGNvbW1pdEVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpPy5pdGVtRm9yVVJJKGZpbGVQYXRoKVxuICBpZiBub3QgY29tbWl0RWRpdG9yXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVtcInNwbGl0I3tzcGxpdERpcmVjdGlvbn1cIl0oKVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGhcbiAgZWxzZVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpLmFjdGl2YXRlKClcbiAgICBlbHNlXG4gICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGZpbGVQYXRoKS5hY3RpdmF0ZUl0ZW1Gb3JVUkkoZmlsZVBhdGgpXG4gICAgUHJvbWlzZS5yZXNvbHZlKGNvbW1pdEVkaXRvcilcblxuZGVzdHJveUNvbW1pdEVkaXRvciA9IChmaWxlUGF0aCkgLT5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnKVxuICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpPy5kZXN0cm95KClcbiAgZWxzZVxuICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoZmlsZVBhdGgpLml0ZW1Gb3JVUkkoZmlsZVBhdGgpPy5kZXN0cm95KClcblxuY29tbWl0ID0gKGRpcmVjdG9yeSwgZmlsZVBhdGgpIC0+XG4gIGFyZ3MgPSBbJ2NvbW1pdCcsICctLWFtZW5kJywgJy0tY2xlYW51cD1zdHJpcCcsIFwiLS1maWxlPSN7ZmlsZVBhdGh9XCJdXG4gIGdpdC5jbWQoYXJncywgY3dkOiBkaXJlY3RvcnkpXG4gIC50aGVuIChkYXRhKSAtPlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MgZGF0YVxuICAgIGRlc3Ryb3lDb21taXRFZGl0b3IoZmlsZVBhdGgpXG4gICAgZ2l0LnJlZnJlc2goKVxuICAuY2F0Y2ggKGRhdGEpIC0+XG4gICAgbm90aWZpZXIuYWRkRXJyb3IgZGF0YVxuICAgIGRlc3Ryb3lDb21taXRFZGl0b3IoZmlsZVBhdGgpXG5cbmNsZWFudXAgPSAoY3VycmVudFBhbmUsIGZpbGVQYXRoKSAtPlxuICBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpIGlmIGN1cnJlbnRQYW5lLmlzQWxpdmUoKVxuICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgZmlsZVBhdGggPSBQYXRoLmpvaW4ocmVwby5nZXRQYXRoKCksICdDT01NSVRfRURJVE1TRycpXG4gIGN3ZCA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gIGNvbW1lbnRDaGFyID0gZ2l0LmdldENvbmZpZyhyZXBvLCAnY29yZS5jb21tZW50Y2hhcicpID8gJyMnXG4gIGdpdC5jbWQoWyd3aGF0Y2hhbmdlZCcsICctMScsICctLW5hbWUtc3RhdHVzJywgJy0tZm9ybWF0PSVCJ10sIHtjd2R9KVxuICAudGhlbiAoYW1lbmQpIC0+IHBhcnNlIGFtZW5kXG4gIC50aGVuICh7bWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlc30pIC0+XG4gICAgZ2V0U3RhZ2VkRmlsZXMocmVwbylcbiAgICAudGhlbiAoZmlsZXMpIC0+XG4gICAgICBwcmV2Q2hhbmdlZEZpbGVzID0gcHJldHRpZnlGaWxlU3RhdHVzZXMoZGlmZkZpbGVzIHByZXZDaGFuZ2VkRmlsZXMsIGZpbGVzKVxuICAgICAge21lc3NhZ2UsIHByZXZDaGFuZ2VkRmlsZXN9XG4gIC50aGVuICh7bWVzc2FnZSwgcHJldkNoYW5nZWRGaWxlc30pIC0+XG4gICAgZ2V0R2l0U3RhdHVzKHJlcG8pXG4gICAgLnRoZW4gKHN0YXR1cykgLT4gcHJlcEZpbGUge2NvbW1lbnRDaGFyLCBtZXNzYWdlLCBwcmV2Q2hhbmdlZEZpbGVzLCBzdGF0dXMsIGZpbGVQYXRofVxuICAgIC50aGVuIC0+IHNob3dGaWxlIGZpbGVQYXRoXG4gIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkU2F2ZSAtPiBjb21taXQocmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIGZpbGVQYXRoKVxuICAgIGRpc3Bvc2FibGVzLmFkZCB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSAtPiBjbGVhbnVwIGN1cnJlbnRQYW5lLCBmaWxlUGF0aFxuICAuY2F0Y2ggKG1zZykgLT4gbm90aWZpZXIuYWRkSW5mbyBtc2dcbiJdfQ==
