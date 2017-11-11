(function() {
  var GitRepository, Path, commentChar, commitFilePath, file, fs, git, notifier, os, quibble, repo, workingDirectory;

  os = require('os');

  Path = require('path');

  quibble = require('quibble');

  fs = require('fs-plus');

  GitRepository = require('atom').GitRepository;

  git = require('../../lib/git');

  notifier = require('../../lib/notifier');

  commentChar = '%';

  workingDirectory = Path.join(os.homedir(), 'fixture-repo');

  commitFilePath = Path.join(workingDirectory, '/.git/COMMIT_EDITMSG');

  file = Path.join(workingDirectory, 'fake.file');

  repo = null;

  describe("GitCommit", function() {
    var GitCommit, GitPush;
    GitPush = quibble('../../lib/models/git-push', jasmine.createSpy('GitPush'));
    GitCommit = require('../../lib/models/git-commit');
    beforeEach(function() {
      fs.writeFileSync(file, 'foobar');
      waitsForPromise(function() {
        return git.cmd(['init'], {
          cwd: workingDirectory
        });
      });
      waitsForPromise(function() {
        return git.cmd(['config', 'user.useconfigonly', 'false'], {
          cwd: workingDirectory
        });
      });
      waitsForPromise(function() {
        return git.cmd(['config', 'core.commentchar', commentChar], {
          cwd: workingDirectory
        });
      });
      waitsForPromise(function() {
        return git.cmd(['add', file], {
          cwd: workingDirectory
        });
      });
      waitsForPromise(function() {
        return git.cmd(['commit', '--allow-empty', '--allow-empty-message', '-m', ''], {
          cwd: workingDirectory
        });
      });
      waitsForPromise(function() {
        return git.cmd(['tag', '-a', '-m', '', 'ROOT'], {
          cwd: workingDirectory
        });
      });
      return runs(function() {
        return repo = GitRepository.open(workingDirectory);
      });
    });
    afterEach(function() {
      fs.removeSync(workingDirectory);
      return repo.destroy();
    });
    describe("a regular commit", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      it("uses the commentchar from git configs", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return expect(editor.getText().trim()[0]).toBe(commentChar);
      });
      it("gets staged files", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return expect(editor.getText()).toContain('modified:   fake.file');
      });
      it("makes a commit when the commit file is saved and closes the textEditor", function() {
        var editor, log;
        spyOn(notifier, 'addSuccess');
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        spyOn(editor, 'destroy').andCallThrough();
        editor.setText('this is a commit');
        editor.save();
        log = null;
        waitsFor(function() {
          return editor.destroy.callCount > 0;
        });
        waitsForPromise(function() {
          return log = git.cmd(['whatchanged', '-1'], {
            cwd: workingDirectory
          });
        });
        return runs(function() {
          expect(notifier.addSuccess).toHaveBeenCalled();
          return log.then(function(l) {
            return expect(l).toContain('this is a commit');
          });
        });
      });
      return it("cancels the commit on textEditor destroy", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return editor.destroy();
      });
    });
    describe("when commit.template config is set", function() {
      it("pre-populates the commit with the template message", function() {
        var templateFile;
        templateFile = Path.join(os.tmpdir(), 'commit-template');
        fs.writeFileSync(templateFile, 'foobar');
        waitsForPromise(function() {
          return git.cmd(['config', 'commit.template', templateFile], {
            cwd: workingDirectory
          });
        });
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        waitsForPromise(function() {
          return GitCommit(repo);
        });
        return runs(function() {
          var editor;
          editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
          expect(editor.getText().startsWith('foobar')).toBe(true);
          git.cmd(['config', '--unset', 'commit.template'], {
            cwd: workingDirectory
          });
          return fs.removeSync(templateFile);
        });
      });
      return describe("when the template file can't be found", function() {
        return it("notifies user", function() {
          var templateFile;
          spyOn(notifier, 'addError');
          templateFile = Path.join(os.tmpdir(), 'commit-template');
          waitsForPromise(function() {
            return git.cmd(['config', 'commit.template', templateFile], {
              cwd: workingDirectory
            });
          });
          fs.writeFileSync(file, Math.random());
          waitsForPromise(function() {
            return git.cmd(['add', file], {
              cwd: workingDirectory
            });
          });
          waitsForPromise(function() {
            return GitCommit(repo)["catch"](function() {
              return Promise.resolve();
            });
          });
          return runs(function() {
            return expect(notifier.addError).toHaveBeenCalledWith("Your configured commit template file can't be found.");
          });
        });
      });
    });
    describe("when 'stageChanges' option is true", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        return waitsForPromise(function() {
          return GitCommit(repo, {
            stageChanges: true
          });
        });
      });
      return it("stages modified and tracked files", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return expect(editor.getText()).toContain('modified:   fake.file');
      });
    });
    describe("a failing commit", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("notifies of error and closes commit pane", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        spyOn(editor, 'destroy').andCallThrough();
        spyOn(notifier, 'addError');
        spyOn(git, 'cmd').andReturn(Promise.reject());
        editor.save();
        waitsFor(function() {
          return notifier.addError.callCount > 0;
        });
        return runs(function() {
          expect(notifier.addError).toHaveBeenCalled();
          return expect(editor.destroy).toHaveBeenCalled();
        });
      });
    });
    describe("when the verbose commit setting is true", function() {
      beforeEach(function() {
        atom.config.set("git-plus.commits.verboseCommits", true);
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("puts the diff in the commit file", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        return waitsForPromise(function() {
          return git.cmd(['diff', '--color=never', '--staged'], {
            cwd: workingDirectory
          }).then(function(diff) {
            return expect(editor.getText()).toContain(diff);
          });
        });
      });
    });
    describe("when the `git-plus.general.openInPane` setting is true", function() {
      beforeEach(function() {
        atom.config.set('git-plus.general.openInPane', true);
        atom.config.set('git-plus.general.splitPane', 'Right');
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo);
        });
      });
      return it("closes the created pane on finish", function() {
        var pane;
        pane = atom.workspace.paneForURI(commitFilePath);
        spyOn(pane, 'destroy').andCallThrough();
        pane.itemForURI(commitFilePath).save();
        waitsFor(function() {
          return pane.destroy.callCount > 0;
        });
        return runs(function() {
          return expect(pane.destroy).toHaveBeenCalled();
        });
      });
    });
    return describe("when 'andPush' option is true", function() {
      beforeEach(function() {
        fs.writeFileSync(file, Math.random());
        waitsForPromise(function() {
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        return waitsForPromise(function() {
          return GitCommit(repo, {
            andPush: true
          });
        });
      });
      return it("tries to push after a successful commit", function() {
        var editor;
        editor = atom.workspace.paneForURI(commitFilePath).itemForURI(commitFilePath);
        spyOn(editor, 'destroy').andCallThrough();
        editor.setText('blah blah');
        editor.save();
        waitsFor(function() {
          return editor.destroy.callCount > 0;
        });
        return runs(function() {
          return expect(GitPush).toHaveBeenCalledWith(repo);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWNvbW1pdC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7O0VBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNKLGdCQUFpQixPQUFBLENBQVEsTUFBUjs7RUFDbEIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsb0JBQVI7O0VBRVgsV0FBQSxHQUFjOztFQUNkLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFWLEVBQXdCLGNBQXhCOztFQUNuQixjQUFBLEdBQWlCLElBQUksQ0FBQyxJQUFMLENBQVUsZ0JBQVYsRUFBNEIsc0JBQTVCOztFQUNqQixJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxnQkFBVixFQUE0QixXQUE1Qjs7RUFDUCxJQUFBLEdBQU87O0VBRVAsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsT0FBQSxHQUFVLE9BQUEsQ0FBUSwyQkFBUixFQUFxQyxPQUFPLENBQUMsU0FBUixDQUFrQixTQUFsQixDQUFyQztJQUNWLFNBQUEsR0FBWSxPQUFBLENBQVEsNkJBQVI7SUFDWixVQUFBLENBQVcsU0FBQTtNQUNULEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLFFBQXZCO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLE1BQUQsQ0FBUixFQUFrQjtVQUFBLEdBQUEsRUFBSyxnQkFBTDtTQUFsQjtNQUFILENBQWhCO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsRUFBVyxvQkFBWCxFQUFpQyxPQUFqQyxDQUFSLEVBQW1EO1VBQUEsR0FBQSxFQUFLLGdCQUFMO1NBQW5EO01BQUgsQ0FBaEI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLGtCQUFYLEVBQStCLFdBQS9CLENBQVIsRUFBcUQ7VUFBQSxHQUFBLEVBQUssZ0JBQUw7U0FBckQ7TUFBSCxDQUFoQjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFSLEVBQXVCO1VBQUEsR0FBQSxFQUFLLGdCQUFMO1NBQXZCO01BQUgsQ0FBaEI7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxFQUFXLGVBQVgsRUFBNEIsdUJBQTVCLEVBQXFELElBQXJELEVBQTJELEVBQTNELENBQVIsRUFBd0U7VUFBQSxHQUFBLEVBQUssZ0JBQUw7U0FBeEU7TUFBSCxDQUFoQjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLElBQWQsRUFBb0IsRUFBcEIsRUFBd0IsTUFBeEIsQ0FBUixFQUF5QztVQUFBLEdBQUEsRUFBSyxnQkFBTDtTQUF6QztNQUFILENBQWhCO2FBQ0EsSUFBQSxDQUFLLFNBQUE7ZUFBRyxJQUFBLEdBQU8sYUFBYSxDQUFDLElBQWQsQ0FBbUIsZ0JBQW5CO01BQVYsQ0FBTDtJQVJTLENBQVg7SUFVQSxTQUFBLENBQVUsU0FBQTtNQUNSLEVBQUUsQ0FBQyxVQUFILENBQWMsZ0JBQWQ7YUFDQSxJQUFJLENBQUMsT0FBTCxDQUFBO0lBRlEsQ0FBVjtJQUlBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO01BQzNCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBakIsRUFBdUIsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUF2QjtRQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsS0FBRCxFQUFRLElBQVIsQ0FBUixFQUF1QjtZQUFBLEdBQUEsRUFBSyxnQkFBTDtXQUF2QjtRQUFILENBQWhCO2VBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLFNBQUEsQ0FBVSxJQUFWO1FBQUgsQ0FBaEI7TUFIUyxDQUFYO01BS0EsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUE7QUFDMUMsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsY0FBMUIsQ0FBeUMsQ0FBQyxVQUExQyxDQUFxRCxjQUFyRDtlQUNULE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsSUFBakIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBL0IsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxXQUF4QztNQUYwQyxDQUE1QztNQUlBLEVBQUEsQ0FBRyxtQkFBSCxFQUF3QixTQUFBO0FBQ3RCLFlBQUE7UUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLGNBQTFCLENBQXlDLENBQUMsVUFBMUMsQ0FBcUQsY0FBckQ7ZUFDVCxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsU0FBekIsQ0FBbUMsdUJBQW5DO01BRnNCLENBQXhCO01BSUEsRUFBQSxDQUFHLHdFQUFILEVBQTZFLFNBQUE7QUFDM0UsWUFBQTtRQUFBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLFlBQWhCO1FBQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUEwQixjQUExQixDQUF5QyxDQUFDLFVBQTFDLENBQXFELGNBQXJEO1FBQ1QsS0FBQSxDQUFNLE1BQU4sRUFBYyxTQUFkLENBQXdCLENBQUMsY0FBekIsQ0FBQTtRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsa0JBQWY7UUFDQSxNQUFNLENBQUMsSUFBUCxDQUFBO1FBQ0EsR0FBQSxHQUFNO1FBQ04sUUFBQSxDQUFTLFNBQUE7aUJBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFmLEdBQTJCO1FBQTlCLENBQVQ7UUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsR0FBQSxHQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxhQUFELEVBQWdCLElBQWhCLENBQVIsRUFBK0I7WUFBQSxHQUFBLEVBQUssZ0JBQUw7V0FBL0I7UUFBVCxDQUFoQjtlQUNBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsTUFBQSxDQUFPLFFBQVEsQ0FBQyxVQUFoQixDQUEyQixDQUFDLGdCQUE1QixDQUFBO2lCQUNBLEdBQUcsQ0FBQyxJQUFKLENBQVMsU0FBQyxDQUFEO21CQUFPLE1BQUEsQ0FBTyxDQUFQLENBQVMsQ0FBQyxTQUFWLENBQW9CLGtCQUFwQjtVQUFQLENBQVQ7UUFGRyxDQUFMO01BVDJFLENBQTdFO2FBYUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7QUFDN0MsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsY0FBMUIsQ0FBeUMsQ0FBQyxVQUExQyxDQUFxRCxjQUFyRDtlQUNULE1BQU0sQ0FBQyxPQUFQLENBQUE7TUFGNkMsQ0FBL0M7SUEzQjJCLENBQTdCO0lBK0JBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBO01BQzdDLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxTQUFBO0FBQ3ZELFlBQUE7UUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFFLENBQUMsTUFBSCxDQUFBLENBQVYsRUFBdUIsaUJBQXZCO1FBQ2YsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsWUFBakIsRUFBK0IsUUFBL0I7UUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsRUFBVyxpQkFBWCxFQUE4QixZQUE5QixDQUFSLEVBQXFEO1lBQUEsR0FBQSxFQUFLLGdCQUFMO1dBQXJEO1FBQUgsQ0FBaEI7UUFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixJQUFJLENBQUMsTUFBTCxDQUFBLENBQXZCO1FBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFSLEVBQXVCO1lBQUEsR0FBQSxFQUFLLGdCQUFMO1dBQXZCO1FBQUgsQ0FBaEI7UUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsU0FBQSxDQUFVLElBQVY7UUFBSCxDQUFoQjtlQUNBLElBQUEsQ0FBSyxTQUFBO0FBQ0gsY0FBQTtVQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsY0FBMUIsQ0FBeUMsQ0FBQyxVQUExQyxDQUFxRCxjQUFyRDtVQUNULE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQWdCLENBQUMsVUFBakIsQ0FBNEIsUUFBNUIsQ0FBUCxDQUE2QyxDQUFDLElBQTlDLENBQW1ELElBQW5EO1VBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLGlCQUF0QixDQUFSLEVBQWtEO1lBQUEsR0FBQSxFQUFLLGdCQUFMO1dBQWxEO2lCQUNBLEVBQUUsQ0FBQyxVQUFILENBQWMsWUFBZDtRQUpHLENBQUw7TUFQdUQsQ0FBekQ7YUFhQSxRQUFBLENBQVMsdUNBQVQsRUFBa0QsU0FBQTtlQUNoRCxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO0FBQ2xCLGNBQUE7VUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixVQUFoQjtVQUNBLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUUsQ0FBQyxNQUFILENBQUEsQ0FBVixFQUF1QixpQkFBdkI7VUFDZixlQUFBLENBQWdCLFNBQUE7bUJBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsRUFBVyxpQkFBWCxFQUE4QixZQUE5QixDQUFSLEVBQXFEO2NBQUEsR0FBQSxFQUFLLGdCQUFMO2FBQXJEO1VBQUgsQ0FBaEI7VUFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixJQUFJLENBQUMsTUFBTCxDQUFBLENBQXZCO1VBQ0EsZUFBQSxDQUFnQixTQUFBO21CQUFHLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFSLEVBQXVCO2NBQUEsR0FBQSxFQUFLLGdCQUFMO2FBQXZCO1VBQUgsQ0FBaEI7VUFDQSxlQUFBLENBQWdCLFNBQUE7bUJBQUcsU0FBQSxDQUFVLElBQVYsQ0FBZSxFQUFDLEtBQUQsRUFBZixDQUFzQixTQUFBO3FCQUFHLE9BQU8sQ0FBQyxPQUFSLENBQUE7WUFBSCxDQUF0QjtVQUFILENBQWhCO2lCQUNBLElBQUEsQ0FBSyxTQUFBO21CQUNILE1BQUEsQ0FBTyxRQUFRLENBQUMsUUFBaEIsQ0FBeUIsQ0FBQyxvQkFBMUIsQ0FBK0Msc0RBQS9DO1VBREcsQ0FBTDtRQVBrQixDQUFwQjtNQURnRCxDQUFsRDtJQWQ2QyxDQUEvQztJQXlCQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQTtNQUM3QyxVQUFBLENBQVcsU0FBQTtRQUNULEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBdkI7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsU0FBQSxDQUFVLElBQVYsRUFBZ0I7WUFBQSxZQUFBLEVBQWMsSUFBZDtXQUFoQjtRQUFILENBQWhCO01BRlMsQ0FBWDthQUlBLEVBQUEsQ0FBRyxtQ0FBSCxFQUF3QyxTQUFBO0FBQ3RDLFlBQUE7UUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQTBCLGNBQTFCLENBQXlDLENBQUMsVUFBMUMsQ0FBcUQsY0FBckQ7ZUFDVCxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsU0FBekIsQ0FBbUMsdUJBQW5DO01BRnNDLENBQXhDO0lBTDZDLENBQS9DO0lBU0EsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7UUFDVCxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFqQixFQUF1QixJQUFJLENBQUMsTUFBTCxDQUFBLENBQXZCO1FBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFSLEVBQXVCO1lBQUEsR0FBQSxFQUFLLGdCQUFMO1dBQXZCO1FBQUgsQ0FBaEI7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsU0FBQSxDQUFVLElBQVY7UUFBSCxDQUFoQjtNQUhTLENBQVg7YUFLQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQTtBQUM3QyxZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBZixDQUEwQixjQUExQixDQUF5QyxDQUFDLFVBQTFDLENBQXFELGNBQXJEO1FBQ1QsS0FBQSxDQUFNLE1BQU4sRUFBYyxTQUFkLENBQXdCLENBQUMsY0FBekIsQ0FBQTtRQUNBLEtBQUEsQ0FBTSxRQUFOLEVBQWdCLFVBQWhCO1FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE1BQVIsQ0FBQSxDQUE1QjtRQUNBLE1BQU0sQ0FBQyxJQUFQLENBQUE7UUFDQSxRQUFBLENBQVMsU0FBQTtpQkFBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQWxCLEdBQThCO1FBQWpDLENBQVQ7ZUFDQSxJQUFBLENBQUssU0FBQTtVQUNILE1BQUEsQ0FBTyxRQUFRLENBQUMsUUFBaEIsQ0FBeUIsQ0FBQyxnQkFBMUIsQ0FBQTtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQWQsQ0FBc0IsQ0FBQyxnQkFBdkIsQ0FBQTtRQUZHLENBQUw7TUFQNkMsQ0FBL0M7SUFOMkIsQ0FBN0I7SUFpQkEsUUFBQSxDQUFTLHlDQUFULEVBQW9ELFNBQUE7TUFDbEQsVUFBQSxDQUFXLFNBQUE7UUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLEVBQW1ELElBQW5EO1FBQ0EsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBakIsRUFBdUIsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUF2QjtRQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsS0FBRCxFQUFRLElBQVIsQ0FBUixFQUF1QjtZQUFBLEdBQUEsRUFBSyxnQkFBTDtXQUF2QjtRQUFILENBQWhCO2VBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLFNBQUEsQ0FBVSxJQUFWO1FBQUgsQ0FBaEI7TUFKUyxDQUFYO2FBTUEsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7QUFDckMsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsY0FBMUIsQ0FBeUMsQ0FBQyxVQUExQyxDQUFxRCxjQUFyRDtlQUNULGVBQUEsQ0FBZ0IsU0FBQTtpQkFDZCxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsTUFBRCxFQUFTLGVBQVQsRUFBMEIsVUFBMUIsQ0FBUixFQUErQztZQUFBLEdBQUEsRUFBSyxnQkFBTDtXQUEvQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDttQkFDSixNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsU0FBekIsQ0FBbUMsSUFBbkM7VUFESSxDQUROO1FBRGMsQ0FBaEI7TUFGcUMsQ0FBdkM7SUFQa0QsQ0FBcEQ7SUFjQSxRQUFBLENBQVMsd0RBQVQsRUFBbUUsU0FBQTtNQUNqRSxVQUFBLENBQVcsU0FBQTtRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsSUFBL0M7UUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLE9BQTlDO1FBQ0EsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBakIsRUFBdUIsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUF2QjtRQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsS0FBRCxFQUFRLElBQVIsQ0FBUixFQUF1QjtZQUFBLEdBQUEsRUFBSyxnQkFBTDtXQUF2QjtRQUFILENBQWhCO2VBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLFNBQUEsQ0FBVSxJQUFWO1FBQUgsQ0FBaEI7TUFMUyxDQUFYO2FBT0EsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUE7QUFDdEMsWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsY0FBMUI7UUFDUCxLQUFBLENBQU0sSUFBTixFQUFZLFNBQVosQ0FBc0IsQ0FBQyxjQUF2QixDQUFBO1FBQ0EsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsY0FBaEIsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFBO1FBQ0EsUUFBQSxDQUFTLFNBQUE7aUJBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFiLEdBQXlCO1FBQTVCLENBQVQ7ZUFDQSxJQUFBLENBQUssU0FBQTtpQkFBRyxNQUFBLENBQU8sSUFBSSxDQUFDLE9BQVosQ0FBb0IsQ0FBQyxnQkFBckIsQ0FBQTtRQUFILENBQUw7TUFMc0MsQ0FBeEM7SUFSaUUsQ0FBbkU7V0FlQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQTtNQUN4QyxVQUFBLENBQVcsU0FBQTtRQUNULEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQWpCLEVBQXVCLElBQUksQ0FBQyxNQUFMLENBQUEsQ0FBdkI7UUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLEtBQUQsRUFBUSxJQUFSLENBQVIsRUFBdUI7WUFBQSxHQUFBLEVBQUssZ0JBQUw7V0FBdkI7UUFBSCxDQUFoQjtlQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxTQUFBLENBQVUsSUFBVixFQUFnQjtZQUFBLE9BQUEsRUFBUyxJQUFUO1dBQWhCO1FBQUgsQ0FBaEI7TUFIUyxDQUFYO2FBS0EsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7QUFDNUMsWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBMEIsY0FBMUIsQ0FBeUMsQ0FBQyxVQUExQyxDQUFxRCxjQUFyRDtRQUNULEtBQUEsQ0FBTSxNQUFOLEVBQWMsU0FBZCxDQUF3QixDQUFDLGNBQXpCLENBQUE7UUFDQSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQWY7UUFDQSxNQUFNLENBQUMsSUFBUCxDQUFBO1FBQ0EsUUFBQSxDQUFTLFNBQUE7aUJBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFmLEdBQTJCO1FBQTlCLENBQVQ7ZUFDQSxJQUFBLENBQUssU0FBQTtpQkFBRyxNQUFBLENBQU8sT0FBUCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLElBQXJDO1FBQUgsQ0FBTDtNQU40QyxDQUE5QztJQU53QyxDQUExQztFQWhJb0IsQ0FBdEI7QUFkQSIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5QYXRoID0gcmVxdWlyZSAncGF0aCdcbnF1aWJibGUgPSByZXF1aXJlICdxdWliYmxlJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xue0dpdFJlcG9zaXRvcnl9ID0gcmVxdWlyZSAnYXRvbSdcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uLy4uL2xpYi9ub3RpZmllcidcblxuY29tbWVudENoYXIgPSAnJSdcbndvcmtpbmdEaXJlY3RvcnkgPSBQYXRoLmpvaW4ob3MuaG9tZWRpcigpLCAnZml4dHVyZS1yZXBvJylcbmNvbW1pdEZpbGVQYXRoID0gUGF0aC5qb2luKHdvcmtpbmdEaXJlY3RvcnksICcvLmdpdC9DT01NSVRfRURJVE1TRycpXG5maWxlID0gUGF0aC5qb2luKHdvcmtpbmdEaXJlY3RvcnksICdmYWtlLmZpbGUnKVxucmVwbyA9IG51bGxcblxuZGVzY3JpYmUgXCJHaXRDb21taXRcIiwgLT5cbiAgR2l0UHVzaCA9IHF1aWJibGUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LXB1c2gnLCBqYXNtaW5lLmNyZWF0ZVNweSgnR2l0UHVzaCcpXG4gIEdpdENvbW1pdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWNvbW1pdCdcbiAgYmVmb3JlRWFjaCAtPlxuICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgJ2Zvb2JhcidcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2luaXQnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnY29uZmlnJywgJ3VzZXIudXNlY29uZmlnb25seScsICdmYWxzZSddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydjb25maWcnLCAnY29yZS5jb21tZW50Y2hhcicsIGNvbW1lbnRDaGFyXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2NvbW1pdCcsICctLWFsbG93LWVtcHR5JywgJy0tYWxsb3ctZW1wdHktbWVzc2FnZScsICctbScsICcnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsndGFnJywgJy1hJywgJy1tJywgJycsICdST09UJ10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICBydW5zIC0+IHJlcG8gPSBHaXRSZXBvc2l0b3J5Lm9wZW4od29ya2luZ0RpcmVjdG9yeSlcblxuICBhZnRlckVhY2ggLT5cbiAgICBmcy5yZW1vdmVTeW5jIHdvcmtpbmdEaXJlY3RvcnlcbiAgICByZXBvLmRlc3Ryb3koKVxuXG4gIGRlc2NyaWJlIFwiYSByZWd1bGFyIGNvbW1pdFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgTWF0aC5yYW5kb20oKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCBmaWxlXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENvbW1pdChyZXBvKVxuXG4gICAgaXQgXCJ1c2VzIHRoZSBjb21tZW50Y2hhciBmcm9tIGdpdCBjb25maWdzXCIsIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpWzBdKS50b0JlIGNvbW1lbnRDaGFyXG5cbiAgICBpdCBcImdldHMgc3RhZ2VkIGZpbGVzXCIsIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQ29udGFpbiAnbW9kaWZpZWQ6ICAgZmFrZS5maWxlJ1xuXG4gICAgaXQgXCJtYWtlcyBhIGNvbW1pdCB3aGVuIHRoZSBjb21taXQgZmlsZSBpcyBzYXZlZCBhbmQgY2xvc2VzIHRoZSB0ZXh0RWRpdG9yXCIsIC0+XG4gICAgICBzcHlPbihub3RpZmllciwgJ2FkZFN1Y2Nlc3MnKVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIHNweU9uKGVkaXRvciwgJ2Rlc3Ryb3knKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBlZGl0b3Iuc2V0VGV4dCAndGhpcyBpcyBhIGNvbW1pdCdcbiAgICAgIGVkaXRvci5zYXZlKClcbiAgICAgIGxvZyA9IG51bGxcbiAgICAgIHdhaXRzRm9yIC0+IGVkaXRvci5kZXN0cm95LmNhbGxDb3VudCA+IDBcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBsb2cgPSBnaXQuY21kKFsnd2hhdGNoYW5nZWQnLCAnLTEnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkU3VjY2VzcykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGxvZy50aGVuIChsKSAtPiBleHBlY3QobCkudG9Db250YWluICd0aGlzIGlzIGEgY29tbWl0J1xuXG4gICAgaXQgXCJjYW5jZWxzIHRoZSBjb21taXQgb24gdGV4dEVkaXRvciBkZXN0cm95XCIsIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKVxuICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBjb21taXQudGVtcGxhdGUgY29uZmlnIGlzIHNldFwiLCAtPlxuICAgIGl0IFwicHJlLXBvcHVsYXRlcyB0aGUgY29tbWl0IHdpdGggdGhlIHRlbXBsYXRlIG1lc3NhZ2VcIiwgLT5cbiAgICAgIHRlbXBsYXRlRmlsZSA9IFBhdGguam9pbihvcy50bXBkaXIoKSwgJ2NvbW1pdC10ZW1wbGF0ZScpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jIHRlbXBsYXRlRmlsZSwgJ2Zvb2JhcidcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnY29uZmlnJywgJ2NvbW1pdC50ZW1wbGF0ZScsIHRlbXBsYXRlRmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgTWF0aC5yYW5kb20oKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCBmaWxlXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IEdpdENvbW1pdChyZXBvKVxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKGNvbW1pdEZpbGVQYXRoKS5pdGVtRm9yVVJJKGNvbW1pdEZpbGVQYXRoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKS5zdGFydHNXaXRoKCdmb29iYXInKSkudG9CZSB0cnVlXG4gICAgICAgIGdpdC5jbWQoWydjb25maWcnLCAnLS11bnNldCcsICdjb21taXQudGVtcGxhdGUnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgICBmcy5yZW1vdmVTeW5jKHRlbXBsYXRlRmlsZSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgdGVtcGxhdGUgZmlsZSBjYW4ndCBiZSBmb3VuZFwiLCAtPlxuICAgICAgaXQgXCJub3RpZmllcyB1c2VyXCIsIC0+XG4gICAgICAgIHNweU9uKG5vdGlmaWVyLCAnYWRkRXJyb3InKVxuICAgICAgICB0ZW1wbGF0ZUZpbGUgPSBQYXRoLmpvaW4ob3MudG1wZGlyKCksICdjb21taXQtdGVtcGxhdGUnKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2NvbmZpZycsICdjb21taXQudGVtcGxhdGUnLCB0ZW1wbGF0ZUZpbGVdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMgZmlsZSwgTWF0aC5yYW5kb20oKVxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2FkZCcsIGZpbGVdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbykuY2F0Y2ggLT4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChub3RpZmllci5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZFdpdGggXCJZb3VyIGNvbmZpZ3VyZWQgY29tbWl0IHRlbXBsYXRlIGZpbGUgY2FuJ3QgYmUgZm91bmQuXCJcblxuICBkZXNjcmliZSBcIndoZW4gJ3N0YWdlQ2hhbmdlcycgb3B0aW9uIGlzIHRydWVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsIE1hdGgucmFuZG9tKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbywgc3RhZ2VDaGFuZ2VzOiB0cnVlKVxuXG4gICAgaXQgXCJzdGFnZXMgbW9kaWZpZWQgYW5kIHRyYWNrZWQgZmlsZXNcIiwgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoY29tbWl0RmlsZVBhdGgpLml0ZW1Gb3JVUkkoY29tbWl0RmlsZVBhdGgpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9Db250YWluICdtb2RpZmllZDogICBmYWtlLmZpbGUnXG5cbiAgZGVzY3JpYmUgXCJhIGZhaWxpbmcgY29tbWl0XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCBNYXRoLnJhbmRvbSgpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2FkZCcsIGZpbGVdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0Q29tbWl0KHJlcG8pXG5cbiAgICBpdCBcIm5vdGlmaWVzIG9mIGVycm9yIGFuZCBjbG9zZXMgY29tbWl0IHBhbmVcIiwgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoY29tbWl0RmlsZVBhdGgpLml0ZW1Gb3JVUkkoY29tbWl0RmlsZVBhdGgpXG4gICAgICBzcHlPbihlZGl0b3IsICdkZXN0cm95JykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24obm90aWZpZXIsICdhZGRFcnJvcicpXG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZWplY3QoKVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgd2FpdHNGb3IgLT4gbm90aWZpZXIuYWRkRXJyb3IuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3Qobm90aWZpZXIuYWRkRXJyb3IpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmRlc3Ryb3kpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGUgdmVyYm9zZSBjb21taXQgc2V0dGluZyBpcyB0cnVlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0IFwiZ2l0LXBsdXMuY29tbWl0cy52ZXJib3NlQ29tbWl0c1wiLCB0cnVlXG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsIE1hdGgucmFuZG9tKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRDb21taXQocmVwbylcblxuICAgIGl0IFwicHV0cyB0aGUgZGlmZiBpbiB0aGUgY29tbWl0IGZpbGVcIiwgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoY29tbWl0RmlsZVBhdGgpLml0ZW1Gb3JVUkkoY29tbWl0RmlsZVBhdGgpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgZ2l0LmNtZChbJ2RpZmYnLCAnLS1jb2xvcj1uZXZlcicsICctLXN0YWdlZCddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICAgIC50aGVuIChkaWZmKSAtPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0NvbnRhaW4gZGlmZlxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGUgYGdpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZWAgc2V0dGluZyBpcyB0cnVlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdnaXQtcGx1cy5nZW5lcmFsLm9wZW5JblBhbmUnLCB0cnVlXG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJywgJ1JpZ2h0J1xuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCBNYXRoLnJhbmRvbSgpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2FkZCcsIGZpbGVdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0Q29tbWl0KHJlcG8pXG5cbiAgICBpdCBcImNsb3NlcyB0aGUgY3JlYXRlZCBwYW5lIG9uIGZpbmlzaFwiLCAtPlxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoY29tbWl0RmlsZVBhdGgpXG4gICAgICBzcHlPbihwYW5lLCAnZGVzdHJveScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHBhbmUuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aCkuc2F2ZSgpXG4gICAgICB3YWl0c0ZvciAtPiBwYW5lLmRlc3Ryb3kuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPiBleHBlY3QocGFuZS5kZXN0cm95KS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIndoZW4gJ2FuZFB1c2gnIG9wdGlvbiBpcyB0cnVlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCBNYXRoLnJhbmRvbSgpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2FkZCcsIGZpbGVdLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0Q29tbWl0KHJlcG8sIGFuZFB1c2g6IHRydWUpXG5cbiAgICBpdCBcInRyaWVzIHRvIHB1c2ggYWZ0ZXIgYSBzdWNjZXNzZnVsIGNvbW1pdFwiLCAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShjb21taXRGaWxlUGF0aCkuaXRlbUZvclVSSShjb21taXRGaWxlUGF0aClcbiAgICAgIHNweU9uKGVkaXRvciwgJ2Rlc3Ryb3knKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICBlZGl0b3Iuc2V0VGV4dCAnYmxhaCBibGFoJ1xuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgd2FpdHNGb3IgLT4gZWRpdG9yLmRlc3Ryb3kuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPiBleHBlY3QoR2l0UHVzaCkudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwb1xuIl19
