(function() {
  var GitRepository, Os, Path, commitPane, currentPane, fs, git, mockRepoWithSubmodule, mockSubmodule, notifier, pathToRepoFile, pathToSubmoduleFile, ref, repo, textEditor;

  Path = require('path');

  Os = require('os');

  fs = require('fs-plus');

  GitRepository = require('atom').GitRepository;

  git = require('../lib/git');

  notifier = require('../lib/notifier');

  ref = require('./fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor, commitPane = ref.commitPane, currentPane = ref.currentPane;

  pathToSubmoduleFile = Path.join(Os.homedir(), "some/submodule/file");

  mockSubmodule = {
    getWorkingDirectory: function() {
      return Path.join(Os.homedir(), "some/submodule");
    },
    relativize: function(path) {
      if (path === pathToSubmoduleFile) {
        return "file";
      }
    }
  };

  mockRepoWithSubmodule = Object.create(repo);

  mockRepoWithSubmodule.repo = {
    submoduleForPath: function(path) {
      if (path === pathToSubmoduleFile) {
        return mockSubmodule;
      }
    }
  };

  describe("Git-Plus git module", function() {
    describe("git.getConfig", function() {
      describe("when a repo file path isn't specified", function() {
        return it("calls ::getConfigValue on the given instance of GitRepository", function() {
          spyOn(repo, 'getConfigValue').andReturn('value');
          expect(git.getConfig(repo, 'user.name')).toBe('value');
          return expect(repo.getConfigValue).toHaveBeenCalledWith('user.name', repo.getWorkingDirectory());
        });
      });
      return describe("when there is no value for a config key", function() {
        return it("returns null", function() {
          spyOn(repo, 'getConfigValue').andReturn(null);
          return expect(git.getConfig(repo, 'user.name')).toBe(null);
        });
      });
    });
    describe("git.getRepo", function() {
      return it("returns a promise resolving to repository", function() {
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return waitsForPromise(function() {
          return git.getRepo().then(function(actual) {
            return expect(actual.getWorkingDirectory()).toEqual(repo.getWorkingDirectory());
          });
        });
      });
    });
    describe("git.dir", function() {
      return it("returns a promise resolving to absolute path of repo", function() {
        spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
        spyOn(atom.project, 'getRepositories').andReturn([repo]);
        return git.dir().then(function(dir) {
          return expect(dir).toEqual(repo.getWorkingDirectory());
        });
      });
    });
    describe("git.getSubmodule", function() {
      it("returns undefined when there is no submodule", function() {
        return expect(git.getSubmodule(pathToRepoFile)).toBe(void 0);
      });
      return it("returns a submodule when given file is in a submodule of a project repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [mockRepoWithSubmodule];
        });
        return expect(git.getSubmodule(pathToSubmoduleFile).getWorkingDirectory()).toEqual(mockSubmodule.getWorkingDirectory());
      });
    });
    describe("git.relativize", function() {
      return it("returns relativized filepath for files in repo", function() {
        spyOn(atom.project, 'getRepositories').andCallFake(function() {
          return [repo, mockRepoWithSubmodule];
        });
        expect(git.relativize(pathToRepoFile)).toBe('directory/file');
        return expect(git.relativize(pathToSubmoduleFile)).toBe("file");
      });
    });
    describe("git.cmd", function() {
      it("returns a promise", function() {
        return waitsForPromise(function() {
          var promise;
          promise = git.cmd();
          expect(promise["catch"]).toBeDefined();
          expect(promise.then).toBeDefined();
          return promise["catch"](function(output) {
            return expect(output).toContain('usage');
          });
        });
      });
      it("returns a promise that is fulfilled with stdout on success", function() {
        return waitsForPromise(function() {
          return git.cmd(['--version']).then(function(output) {
            return expect(output).toContain('git version');
          });
        });
      });
      it("returns a promise that is rejected with stderr on failure", function() {
        return waitsForPromise(function() {
          return git.cmd(['help', '--bogus-option'])["catch"](function(output) {
            return expect(output).toContain('unknown option');
          });
        });
      });
      return it("returns a promise that is fulfilled with stderr on success", function() {
        var cloneDir, initDir;
        initDir = 'git-plus-test-dir' + Math.random();
        cloneDir = initDir + '-clone';
        return waitsForPromise(function() {
          return git.cmd(['init', initDir]).then(function() {
            return git.cmd(['clone', '--progress', initDir, cloneDir]);
          }).then(function(output) {
            fs.removeSync(initDir);
            fs.removeSync(cloneDir);
            return expect(output).toContain('Cloning');
          });
        });
      });
    });
    describe("git.add", function() {
      it("calls git.cmd with ['add', '--all', {fileName}]", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo, {
            file: pathToSubmoduleFile
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', pathToSubmoduleFile], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--all', '.'] when no file is specified", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--all', '.'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      it("calls git.cmd with ['add', '--update'...] when update option is true", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.add(repo, {
            update: true
          }).then(function(success) {
            return expect(git.cmd).toHaveBeenCalledWith(['add', '--update', '.'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
      return describe("when it fails", function() {
        return it("notifies of failure", function() {
          spyOn(git, 'cmd').andReturn(Promise.reject('git.add error'));
          spyOn(notifier, 'addError');
          return waitsForPromise(function() {
            return git.add(repo).then(function(result) {
              return fail("should have been rejected");
            })["catch"](function(error) {
              return expect(notifier.addError).toHaveBeenCalledWith('git.add error');
            });
          });
        });
      });
    });
    describe("git.reset", function() {
      return it("resets and unstages all files", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve(true);
        });
        return waitsForPromise(function() {
          return git.reset(repo).then(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['reset', 'HEAD'], {
              cwd: repo.getWorkingDirectory()
            });
          });
        });
      });
    });
    describe("getting staged/unstaged files", function() {
      var file, repository, workingDirectory;
      workingDirectory = Path.join(Os.homedir(), 'fixture-repo');
      file = Path.join(workingDirectory, 'fake.file');
      repository = null;
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
          return git.cmd(['add', file], {
            cwd: workingDirectory
          });
        });
        waitsForPromise(function() {
          return git.cmd(['commit', '--allow-empty', '--allow-empty-message', '-m', ''], {
            cwd: workingDirectory
          });
        });
        return runs(function() {
          return repository = GitRepository.open(workingDirectory);
        });
      });
      afterEach(function() {
        fs.removeSync(workingDirectory);
        return repository.destroy();
      });
      describe("git.stagedFiles", function() {
        it("returns an empty array when there are no staged files", function() {
          return git.stagedFiles(repository).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
        return it("returns a non-empty array when there are staged files", function() {
          fs.writeFileSync(file, 'some stuff');
          waitsForPromise(function() {
            return git.cmd(['add', 'fake.file'], {
              cwd: workingDirectory
            });
          });
          return waitsForPromise(function() {
            return git.stagedFiles(repository).then(function(files) {
              expect(files.length).toEqual(1);
              expect(files[0].mode).toEqual('M');
              expect(files[0].path).toEqual('fake.file');
              return expect(files[0].staged).toBe(true);
            });
          });
        });
      });
      describe("git.unstagedFiles", function() {
        it("returns an empty array when there are no unstaged files", function() {
          return git.unstagedFiles(repository).then(function(files) {
            return expect(files.length).toEqual(0);
          });
        });
        return it("returns a non-empty array when there are unstaged files", function() {
          fs.writeFileSync(file, 'some stuff');
          waitsForPromise(function() {
            return git.cmd(['reset'], {
              cwd: workingDirectory
            });
          });
          return waitsForPromise(function() {
            return git.unstagedFiles(repository).then(function(files) {
              expect(files.length).toEqual(1);
              expect(files[0].mode).toEqual('M');
              return expect(files[0].staged).toBe(false);
            });
          });
        });
      });
      return describe("git.unstagedFiles(showUntracked: true)", function() {
        return it("returns an array with size 1 when there is only an untracked file", function() {
          var newFile;
          newFile = Path.join(workingDirectory, 'another.file');
          fs.writeFileSync(newFile, 'this is untracked');
          return waitsForPromise(function() {
            return git.unstagedFiles(repository, {
              showUntracked: true
            }).then(function(files) {
              expect(files.length).toEqual(1);
              return expect(files[0].mode).toEqual('?');
            });
          });
        });
      });
    });
    describe("git.status", function() {
      return it("calls git.cmd with 'status' as the first argument", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          var args;
          args = git.cmd.mostRecentCall.args;
          if (args[0][0] === 'status') {
            return Promise.resolve(true);
          }
        });
        return git.status(repo).then(function() {
          return expect(true).toBeTruthy();
        });
      });
    });
    describe("git.refresh", function() {
      describe("when no arguments are passed", function() {
        return it("calls repo.refreshStatus for each repo in project", function() {
          spyOn(atom.project, 'getRepositories').andCallFake(function() {
            return [repo];
          });
          spyOn(repo, 'refreshStatus');
          git.refresh();
          return expect(repo.refreshStatus).toHaveBeenCalled();
        });
      });
      return describe("when a GitRepository object is passed", function() {
        return it("calls repo.refreshStatus for each repo in project", function() {
          spyOn(repo, 'refreshStatus');
          git.refresh(repo);
          return expect(repo.refreshStatus).toHaveBeenCalled();
        });
      });
    });
    return describe("git.diff", function() {
      return it("calls git.cmd with ['diff', '-p', '-U1'] and the file path", function() {
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve("string");
        });
        git.diff(repo, pathToRepoFile);
        return expect(git.cmd).toHaveBeenCalledWith(['diff', '-p', '-U1', pathToRepoFile], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9naXQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNKLGdCQUFpQixPQUFBLENBQVEsTUFBUjs7RUFDbEIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxZQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBQ1gsTUFNSSxPQUFBLENBQVEsWUFBUixDQU5KLEVBQ0UsZUFERixFQUVFLG1DQUZGLEVBR0UsMkJBSEYsRUFJRSwyQkFKRixFQUtFOztFQUVGLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFWLEVBQXdCLHFCQUF4Qjs7RUFFdEIsYUFBQSxHQUNFO0lBQUEsbUJBQUEsRUFBcUIsU0FBQTthQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE9BQUgsQ0FBQSxDQUFWLEVBQXdCLGdCQUF4QjtJQUFILENBQXJCO0lBQ0EsVUFBQSxFQUFZLFNBQUMsSUFBRDtNQUFVLElBQVUsSUFBQSxLQUFRLG1CQUFsQjtlQUFBLE9BQUE7O0lBQVYsQ0FEWjs7O0VBR0YscUJBQUEsR0FBd0IsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkOztFQUN4QixxQkFBcUIsQ0FBQyxJQUF0QixHQUE2QjtJQUMzQixnQkFBQSxFQUFrQixTQUFDLElBQUQ7TUFDaEIsSUFBaUIsSUFBQSxLQUFRLG1CQUF6QjtlQUFBLGNBQUE7O0lBRGdCLENBRFM7OztFQUs3QixRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtJQUM5QixRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO01BQ3hC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Iiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5PcyA9IHJlcXVpcmUgJ29zJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xue0dpdFJlcG9zaXRvcnl9ID0gcmVxdWlyZSAnYXRvbSdcbmdpdCA9IHJlcXVpcmUgJy4uL2xpYi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL2xpYi9ub3RpZmllcidcbntcbiAgcmVwbyxcbiAgcGF0aFRvUmVwb0ZpbGUsXG4gIHRleHRFZGl0b3IsXG4gIGNvbW1pdFBhbmUsXG4gIGN1cnJlbnRQYW5lXG59ID0gcmVxdWlyZSAnLi9maXh0dXJlcydcbnBhdGhUb1N1Ym1vZHVsZUZpbGUgPSBQYXRoLmpvaW4gT3MuaG9tZWRpcigpLCBcInNvbWUvc3VibW9kdWxlL2ZpbGVcIlxuXG5tb2NrU3VibW9kdWxlID1cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeTogLT4gUGF0aC5qb2luIE9zLmhvbWVkaXIoKSwgXCJzb21lL3N1Ym1vZHVsZVwiXG4gIHJlbGF0aXZpemU6IChwYXRoKSAtPiBcImZpbGVcIiBpZiBwYXRoIGlzIHBhdGhUb1N1Ym1vZHVsZUZpbGVcblxubW9ja1JlcG9XaXRoU3VibW9kdWxlID0gT2JqZWN0LmNyZWF0ZShyZXBvKVxubW9ja1JlcG9XaXRoU3VibW9kdWxlLnJlcG8gPSB7XG4gIHN1Ym1vZHVsZUZvclBhdGg6IChwYXRoKSAtPlxuICAgIG1vY2tTdWJtb2R1bGUgaWYgcGF0aCBpcyBwYXRoVG9TdWJtb2R1bGVGaWxlXG59XG5cbmRlc2NyaWJlIFwiR2l0LVBsdXMgZ2l0IG1vZHVsZVwiLCAtPlxuICBkZXNjcmliZSBcImdpdC5nZXRDb25maWdcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gYSByZXBvIGZpbGUgcGF0aCBpc24ndCBzcGVjaWZpZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgOjpnZXRDb25maWdWYWx1ZSBvbiB0aGUgZ2l2ZW4gaW5zdGFuY2Ugb2YgR2l0UmVwb3NpdG9yeVwiLCAtPlxuICAgICAgICBzcHlPbihyZXBvLCAnZ2V0Q29uZmlnVmFsdWUnKS5hbmRSZXR1cm4gJ3ZhbHVlJ1xuICAgICAgICBleHBlY3QoZ2l0LmdldENvbmZpZyhyZXBvLCAndXNlci5uYW1lJykpLnRvQmUgJ3ZhbHVlJ1xuICAgICAgICBleHBlY3QocmVwby5nZXRDb25maWdWYWx1ZSkudG9IYXZlQmVlbkNhbGxlZFdpdGggJ3VzZXIubmFtZScsIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlcmUgaXMgbm8gdmFsdWUgZm9yIGEgY29uZmlnIGtleVwiLCAtPlxuICAgICAgaXQgXCJyZXR1cm5zIG51bGxcIiwgLT5cbiAgICAgICAgc3B5T24ocmVwbywgJ2dldENvbmZpZ1ZhbHVlJykuYW5kUmV0dXJuIG51bGxcbiAgICAgICAgZXhwZWN0KGdpdC5nZXRDb25maWcocmVwbywgJ3VzZXIubmFtZScpKS50b0JlIG51bGxcblxuICBkZXNjcmliZSBcImdpdC5nZXRSZXBvXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gcmVwb3NpdG9yeVwiLCAtPlxuICAgICAgc3B5T24oYXRvbS5wcm9qZWN0LCAnZ2V0UmVwb3NpdG9yaWVzJykuYW5kUmV0dXJuIFtyZXBvXVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5nZXRSZXBvKCkudGhlbiAoYWN0dWFsKSAtPlxuICAgICAgICAgIGV4cGVjdChhY3R1YWwuZ2V0V29ya2luZ0RpcmVjdG9yeSgpKS50b0VxdWFsIHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJnaXQuZGlyXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYWJzb2x1dGUgcGF0aCBvZiByZXBvXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgICAgc3B5T24oYXRvbS5wcm9qZWN0LCAnZ2V0UmVwb3NpdG9yaWVzJykuYW5kUmV0dXJuIFtyZXBvXVxuICAgICAgZ2l0LmRpcigpLnRoZW4gKGRpcikgLT5cbiAgICAgICAgZXhwZWN0KGRpcikudG9FcXVhbCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIGRlc2NyaWJlIFwiZ2l0LmdldFN1Ym1vZHVsZVwiLCAtPlxuICAgIGl0IFwicmV0dXJucyB1bmRlZmluZWQgd2hlbiB0aGVyZSBpcyBubyBzdWJtb2R1bGVcIiwgLT5cbiAgICAgIGV4cGVjdChnaXQuZ2V0U3VibW9kdWxlKHBhdGhUb1JlcG9GaWxlKSkudG9CZSB1bmRlZmluZWRcblxuICAgIGl0IFwicmV0dXJucyBhIHN1Ym1vZHVsZSB3aGVuIGdpdmVuIGZpbGUgaXMgaW4gYSBzdWJtb2R1bGUgb2YgYSBwcm9qZWN0IHJlcG9cIiwgLT5cbiAgICAgIHNweU9uKGF0b20ucHJvamVjdCwgJ2dldFJlcG9zaXRvcmllcycpLmFuZENhbGxGYWtlIC0+IFttb2NrUmVwb1dpdGhTdWJtb2R1bGVdXG4gICAgICBleHBlY3QoZ2l0LmdldFN1Ym1vZHVsZShwYXRoVG9TdWJtb2R1bGVGaWxlKS5nZXRXb3JraW5nRGlyZWN0b3J5KCkpLnRvRXF1YWwgbW9ja1N1Ym1vZHVsZS5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBkZXNjcmliZSBcImdpdC5yZWxhdGl2aXplXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIHJlbGF0aXZpemVkIGZpbGVwYXRoIGZvciBmaWxlcyBpbiByZXBvXCIsIC0+XG4gICAgICBzcHlPbihhdG9tLnByb2plY3QsICdnZXRSZXBvc2l0b3JpZXMnKS5hbmRDYWxsRmFrZSAtPiBbcmVwbywgbW9ja1JlcG9XaXRoU3VibW9kdWxlXVxuICAgICAgZXhwZWN0KGdpdC5yZWxhdGl2aXplIHBhdGhUb1JlcG9GaWxlKS50b0JlICdkaXJlY3RvcnkvZmlsZSdcbiAgICAgIGV4cGVjdChnaXQucmVsYXRpdml6ZSBwYXRoVG9TdWJtb2R1bGVGaWxlKS50b0JlIFwiZmlsZVwiXG5cbiAgZGVzY3JpYmUgXCJnaXQuY21kXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgcHJvbWlzZVwiLCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByb21pc2UgPSBnaXQuY21kKClcbiAgICAgICAgZXhwZWN0KHByb21pc2UuY2F0Y2gpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgZXhwZWN0KHByb21pc2UudGhlbikudG9CZURlZmluZWQoKVxuICAgICAgICBwcm9taXNlLmNhdGNoIChvdXRwdXQpIC0+XG4gICAgICAgICAgZXhwZWN0KG91dHB1dCkudG9Db250YWluKCd1c2FnZScpXG5cbiAgICBpdCBcInJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggc3Rkb3V0IG9uIHN1Y2Nlc3NcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuY21kKFsnLS12ZXJzaW9uJ10pLnRoZW4gKG91dHB1dCkgLT5cbiAgICAgICAgICBleHBlY3Qob3V0cHV0KS50b0NvbnRhaW4oJ2dpdCB2ZXJzaW9uJylcblxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyByZWplY3RlZCB3aXRoIHN0ZGVyciBvbiBmYWlsdXJlXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgZ2l0LmNtZChbJ2hlbHAnLCAnLS1ib2d1cy1vcHRpb24nXSkuY2F0Y2ggKG91dHB1dCkgLT5cbiAgICAgICAgICBleHBlY3Qob3V0cHV0KS50b0NvbnRhaW4oJ3Vua25vd24gb3B0aW9uJylcblxuICAgIGl0IFwicmV0dXJucyBhIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2l0aCBzdGRlcnIgb24gc3VjY2Vzc1wiLCAtPlxuICAgICAgaW5pdERpciA9ICdnaXQtcGx1cy10ZXN0LWRpcicgKyBNYXRoLnJhbmRvbSgpXG4gICAgICBjbG9uZURpciA9IGluaXREaXIgKyAnLWNsb25lJ1xuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICMgVE9ETzogVXNlIHNvbWV0aGluZyB0aGF0IGRvZXNuJ3QgcmVxdWlyZSBwZXJtaXNzaW9ucyBhbmQgY2FuIHJ1biB3aXRoaW4gYXRvbVxuICAgICAgICBnaXQuY21kKFsnaW5pdCcsIGluaXREaXJdKS50aGVuICgpIC0+XG4gICAgICAgICAgZ2l0LmNtZChbJ2Nsb25lJywgJy0tcHJvZ3Jlc3MnLCBpbml0RGlyLCBjbG9uZURpcl0pXG4gICAgICAgIC50aGVuIChvdXRwdXQpIC0+XG4gICAgICAgICAgZnMucmVtb3ZlU3luYyhpbml0RGlyKVxuICAgICAgICAgIGZzLnJlbW92ZVN5bmMoY2xvbmVEaXIpXG4gICAgICAgICAgZXhwZWN0KG91dHB1dCkudG9Db250YWluKCdDbG9uaW5nJylcblxuICBkZXNjcmliZSBcImdpdC5hZGRcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2FkZCcsICctLWFsbCcsIHtmaWxlTmFtZX1dXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5hZGQocmVwbywgZmlsZTogcGF0aFRvU3VibW9kdWxlRmlsZSkudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydhZGQnLCAnLS1hbGwnLCBwYXRoVG9TdWJtb2R1bGVGaWxlXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcblxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnYWRkJywgJy0tYWxsJywgJy4nXSB3aGVuIG5vIGZpbGUgaXMgc3BlY2lmaWVkXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5hZGQocmVwbykudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydhZGQnLCAnLS1hbGwnLCAnLiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuXG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydhZGQnLCAnLS11cGRhdGUnLi4uXSB3aGVuIHVwZGF0ZSBvcHRpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBnaXQuYWRkKHJlcG8sIHVwZGF0ZTogdHJ1ZSkudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydhZGQnLCAnLS11cGRhdGUnLCAnLiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGZhaWxzXCIsIC0+XG4gICAgICBpdCBcIm5vdGlmaWVzIG9mIGZhaWx1cmVcIiwgLT5cbiAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVqZWN0ICdnaXQuYWRkIGVycm9yJ1xuICAgICAgICBzcHlPbihub3RpZmllciwgJ2FkZEVycm9yJylcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgZ2l0LmFkZChyZXBvKS50aGVuIChyZXN1bHQpIC0+XG4gICAgICAgICAgICBmYWlsIFwic2hvdWxkIGhhdmUgYmVlbiByZWplY3RlZFwiXG4gICAgICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgICAgIGV4cGVjdChub3RpZmllci5hZGRFcnJvcikudG9IYXZlQmVlbkNhbGxlZFdpdGggJ2dpdC5hZGQgZXJyb3InXG5cbiAgZGVzY3JpYmUgXCJnaXQucmVzZXRcIiwgLT5cbiAgICBpdCBcInJlc2V0cyBhbmQgdW5zdGFnZXMgYWxsIGZpbGVzXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPiBQcm9taXNlLnJlc29sdmUgdHJ1ZVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGdpdC5yZXNldChyZXBvKS50aGVuIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncmVzZXQnLCAnSEVBRCddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG5cbiAgZGVzY3JpYmUgXCJnZXR0aW5nIHN0YWdlZC91bnN0YWdlZCBmaWxlc1wiLCAtPlxuICAgIHdvcmtpbmdEaXJlY3RvcnkgPSBQYXRoLmpvaW4oT3MuaG9tZWRpcigpLCAnZml4dHVyZS1yZXBvJylcbiAgICBmaWxlID0gUGF0aC5qb2luKHdvcmtpbmdEaXJlY3RvcnksICdmYWtlLmZpbGUnKVxuICAgIHJlcG9zaXRvcnkgPSBudWxsXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGZpbGUsICdmb29iYXInXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gZ2l0LmNtZChbJ2luaXQnXSwgY3dkOiB3b3JraW5nRGlyZWN0b3J5KVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydjb25maWcnLCAndXNlci51c2Vjb25maWdvbmx5JywgJ2ZhbHNlJ10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnYWRkJywgZmlsZV0sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBnaXQuY21kKFsnY29tbWl0JywgJy0tYWxsb3ctZW1wdHknLCAnLS1hbGxvdy1lbXB0eS1tZXNzYWdlJywgJy1tJywgJyddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICBydW5zIC0+IHJlcG9zaXRvcnkgPSBHaXRSZXBvc2l0b3J5Lm9wZW4od29ya2luZ0RpcmVjdG9yeSlcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgZnMucmVtb3ZlU3luYyB3b3JraW5nRGlyZWN0b3J5XG4gICAgICByZXBvc2l0b3J5LmRlc3Ryb3koKVxuXG4gICAgZGVzY3JpYmUgXCJnaXQuc3RhZ2VkRmlsZXNcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBlbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBubyBzdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgICAgZ2l0LnN0YWdlZEZpbGVzKHJlcG9zaXRvcnkpXG4gICAgICAgIC50aGVuIChmaWxlcykgLT4gZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAwXG5cbiAgICAgIGl0IFwicmV0dXJucyBhIG5vbi1lbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBzdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCAnc29tZSBzdHVmZidcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydhZGQnLCAnZmFrZS5maWxlJ10sIGN3ZDogd29ya2luZ0RpcmVjdG9yeSlcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgZ2l0LnN0YWdlZEZpbGVzKHJlcG9zaXRvcnkpXG4gICAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnTSdcbiAgICAgICAgICAgIGV4cGVjdChmaWxlc1swXS5wYXRoKS50b0VxdWFsICdmYWtlLmZpbGUnXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0uc3RhZ2VkKS50b0JlIHRydWVcblxuICAgIGRlc2NyaWJlIFwiZ2l0LnVuc3RhZ2VkRmlsZXNcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBlbXB0eSBhcnJheSB3aGVuIHRoZXJlIGFyZSBubyB1bnN0YWdlZCBmaWxlc1wiLCAtPlxuICAgICAgICBnaXQudW5zdGFnZWRGaWxlcyhyZXBvc2l0b3J5KVxuICAgICAgICAudGhlbiAoZmlsZXMpIC0+IGV4cGVjdChmaWxlcy5sZW5ndGgpLnRvRXF1YWwgMFxuXG4gICAgICBpdCBcInJldHVybnMgYSBub24tZW1wdHkgYXJyYXkgd2hlbiB0aGVyZSBhcmUgdW5zdGFnZWQgZmlsZXNcIiwgLT5cbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlLCAnc29tZSBzdHVmZidcbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGdpdC5jbWQoWydyZXNldCddLCBjd2Q6IHdvcmtpbmdEaXJlY3RvcnkpXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGdpdC51bnN0YWdlZEZpbGVzKHJlcG9zaXRvcnkpXG4gICAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnTSdcbiAgICAgICAgICAgIGV4cGVjdChmaWxlc1swXS5zdGFnZWQpLnRvQmUgZmFsc2VcblxuICAgIGRlc2NyaWJlIFwiZ2l0LnVuc3RhZ2VkRmlsZXMoc2hvd1VudHJhY2tlZDogdHJ1ZSlcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBhcnJheSB3aXRoIHNpemUgMSB3aGVuIHRoZXJlIGlzIG9ubHkgYW4gdW50cmFja2VkIGZpbGVcIiwgLT5cbiAgICAgICAgbmV3RmlsZSA9IFBhdGguam9pbih3b3JraW5nRGlyZWN0b3J5LCAnYW5vdGhlci5maWxlJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBuZXdGaWxlLCAndGhpcyBpcyB1bnRyYWNrZWQnXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGdpdC51bnN0YWdlZEZpbGVzKHJlcG9zaXRvcnksIHNob3dVbnRyYWNrZWQ6IHRydWUpXG4gICAgICAgICAgLnRoZW4gKGZpbGVzKSAtPlxuICAgICAgICAgICAgZXhwZWN0KGZpbGVzLmxlbmd0aCkudG9FcXVhbCAxXG4gICAgICAgICAgICBleHBlY3QoZmlsZXNbMF0ubW9kZSkudG9FcXVhbCAnPydcblxuICBkZXNjcmliZSBcImdpdC5zdGF0dXNcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnc3RhdHVzJyBhcyB0aGUgZmlyc3QgYXJndW1lbnRcIiwgLT5cbiAgICAgIHNweU9uKGdpdCwgJ2NtZCcpLmFuZENhbGxGYWtlIC0+XG4gICAgICAgIGFyZ3MgPSBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NcbiAgICAgICAgaWYgYXJnc1swXVswXSBpcyAnc3RhdHVzJ1xuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSB0cnVlXG4gICAgICBnaXQuc3RhdHVzKHJlcG8pLnRoZW4gLT4gZXhwZWN0KHRydWUpLnRvQmVUcnV0aHkoKVxuXG4gIGRlc2NyaWJlIFwiZ2l0LnJlZnJlc2hcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgcmVwby5yZWZyZXNoU3RhdHVzIGZvciBlYWNoIHJlcG8gaW4gcHJvamVjdFwiLCAtPlxuICAgICAgICBzcHlPbihhdG9tLnByb2plY3QsICdnZXRSZXBvc2l0b3JpZXMnKS5hbmRDYWxsRmFrZSAtPiBbIHJlcG8gXVxuICAgICAgICBzcHlPbihyZXBvLCAncmVmcmVzaFN0YXR1cycpXG4gICAgICAgIGdpdC5yZWZyZXNoKClcbiAgICAgICAgZXhwZWN0KHJlcG8ucmVmcmVzaFN0YXR1cykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYSBHaXRSZXBvc2l0b3J5IG9iamVjdCBpcyBwYXNzZWRcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgcmVwby5yZWZyZXNoU3RhdHVzIGZvciBlYWNoIHJlcG8gaW4gcHJvamVjdFwiLCAtPlxuICAgICAgICBzcHlPbihyZXBvLCAncmVmcmVzaFN0YXR1cycpXG4gICAgICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgICAgICAgZXhwZWN0KHJlcG8ucmVmcmVzaFN0YXR1cykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJnaXQuZGlmZlwiLCAtPlxuICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoIFsnZGlmZicsICctcCcsICctVTEnXSBhbmQgdGhlIGZpbGUgcGF0aFwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlIFwic3RyaW5nXCJcbiAgICAgIGdpdC5kaWZmKHJlcG8sIHBhdGhUb1JlcG9GaWxlKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZGlmZicsICctcCcsICctVTEnLCBwYXRoVG9SZXBvRmlsZV0sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcbiJdfQ==
