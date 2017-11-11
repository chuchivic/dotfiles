(function() {
  var BufferedProcess, Directory, Os, RepoListView, _prettify, _prettifyDiff, _prettifyUntracked, getRepoForCurrentFile, git, gitUntrackedFiles, notifier, ref;

  Os = require('os');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Directory = ref.Directory;

  RepoListView = require('./views/repo-list-view');

  notifier = require('./notifier');

  gitUntrackedFiles = function(repo, dataUnstaged) {
    var args;
    if (dataUnstaged == null) {
      dataUnstaged = [];
    }
    args = ['ls-files', '-o', '--exclude-standard'];
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return dataUnstaged.concat(_prettifyUntracked(data));
    });
  };

  _prettify = function(data, arg) {
    var i, mode, staged;
    staged = (arg != null ? arg : {}).staged;
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
          staged: staged,
          path: data[i + 1]
        });
      }
      return results;
    })();
  };

  _prettifyUntracked = function(data) {
    if (data === '') {
      return [];
    }
    data = data.split(/\n/).filter(function(d) {
      return d !== '';
    });
    return data.map(function(file) {
      return {
        mode: '?',
        path: file
      };
    });
  };

  _prettifyDiff = function(data) {
    var line, ref1;
    data = data.split(/^@@(?=[ \-\+\,0-9]*@@)/gm);
    [].splice.apply(data, [1, data.length - 1 + 1].concat(ref1 = (function() {
      var j, len, ref2, results;
      ref2 = data.slice(1);
      results = [];
      for (j = 0, len = ref2.length; j < len; j++) {
        line = ref2[j];
        results.push('@@' + line);
      }
      return results;
    })())), ref1;
    return data;
  };

  getRepoForCurrentFile = function() {
    return new Promise(function(resolve, reject) {
      var directory, path, project, ref1;
      project = atom.project;
      path = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0;
      directory = project.getDirectories().filter(function(d) {
        return d.contains(path);
      })[0];
      if (directory != null) {
        return project.repositoryForDirectory(directory).then(function(repo) {
          var submodule;
          submodule = repo.repo.submoduleForPath(path);
          if (submodule != null) {
            return resolve(submodule);
          } else {
            return resolve(repo);
          }
        })["catch"](function(e) {
          return reject(e);
        });
      } else {
        return reject("no current file");
      }
    });
  };

  module.exports = git = {
    cmd: function(args, options, arg) {
      var color;
      if (options == null) {
        options = {
          env: process.env
        };
      }
      color = (arg != null ? arg : {}).color;
      return new Promise(function(resolve, reject) {
        var output, process, ref1;
        output = '';
        if (color) {
          args = ['-c', 'color.ui=always'].concat(args);
        }
        process = new BufferedProcess({
          command: (ref1 = atom.config.get('git-plus.general.gitPath')) != null ? ref1 : 'git',
          args: args,
          options: options,
          stdout: function(data) {
            return output += data.toString();
          },
          stderr: function(data) {
            return output += data.toString();
          },
          exit: function(code) {
            if (code === 0) {
              return resolve(output);
            } else {
              return reject(output);
            }
          }
        });
        return process.onWillThrowError(function(errorObject) {
          notifier.addError('Git Plus is unable to locate the git command. Please ensure process.env.PATH can access git.');
          return reject("Couldn't find git");
        });
      });
    },
    getConfig: function(repo, setting) {
      return repo.getConfigValue(setting, repo.getWorkingDirectory());
    },
    reset: function(repo) {
      return git.cmd(['reset', 'HEAD'], {
        cwd: repo.getWorkingDirectory()
      }).then(function() {
        return notifier.addSuccess('All changes unstaged');
      });
    },
    status: function(repo) {
      return git.cmd(['status', '--porcelain', '-z'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        if (data.length > 2) {
          return data.split('\0').slice(0, -1);
        } else {
          return [];
        }
      });
    },
    refresh: function(repo) {
      if (repo) {
        if (typeof repo.refreshStatus === "function") {
          repo.refreshStatus();
        }
        return typeof repo.refreshIndex === "function" ? repo.refreshIndex() : void 0;
      } else {
        return atom.project.getRepositories().forEach(function(repo) {
          if (repo != null) {
            return repo.refreshStatus();
          }
        });
      }
    },
    relativize: function(path) {
      var ref1, ref2, ref3, ref4;
      return (ref1 = (ref2 = (ref3 = git.getSubmodule(path)) != null ? ref3.relativize(path) : void 0) != null ? ref2 : (ref4 = atom.project.getRepositories()[0]) != null ? ref4.relativize(path) : void 0) != null ? ref1 : path;
    },
    diff: function(repo, path) {
      return git.cmd(['diff', '-p', '-U1', path], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return _prettifyDiff(data);
      });
    },
    stagedFiles: function(repo) {
      var args;
      args = ['diff-index', '--cached', 'HEAD', '--name-status', '-z'];
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return _prettify(data, {
          staged: true
        });
      })["catch"](function(error) {
        if (error.includes("ambiguous argument 'HEAD'")) {
          return Promise.resolve([1]);
        } else {
          notifier.addError(error);
          return Promise.resolve([]);
        }
      });
    },
    unstagedFiles: function(repo, arg) {
      var args, showUntracked;
      showUntracked = (arg != null ? arg : {}).showUntracked;
      args = ['diff-files', '--name-status', '-z'];
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        if (showUntracked) {
          return gitUntrackedFiles(repo, _prettify(data, {
            staged: false
          }));
        } else {
          return _prettify(data, {
            staged: false
          });
        }
      });
    },
    add: function(repo, arg) {
      var args, file, ref1, update;
      ref1 = arg != null ? arg : {}, file = ref1.file, update = ref1.update;
      args = ['add'];
      if (update) {
        args.push('--update');
      } else {
        args.push('--all');
      }
      args.push(file ? file : '.');
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(output) {
        if (output !== false) {
          return notifier.addSuccess("Added " + (file != null ? file : 'all files'));
        }
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    },
    getAllRepos: function() {
      var project;
      project = atom.project;
      return Promise.all(project.getDirectories().map(project.repositoryForDirectory.bind(project)));
    },
    getRepo: function() {
      return new Promise(function(resolve, reject) {
        return getRepoForCurrentFile().then(function(repo) {
          return resolve(repo);
        })["catch"](function(e) {
          var repos;
          repos = atom.project.getRepositories().filter(function(r) {
            return r != null;
          });
          if (repos.length === 0) {
            return reject("No repos found");
          } else if (repos.length > 1) {
            return resolve(new RepoListView(repos).result);
          } else {
            return resolve(repos[0]);
          }
        });
      });
    },
    getRepoForPath: function(path) {
      if (path == null) {
        return Promise.reject("No file to find repository for");
      } else {
        return new Promise(function(resolve, reject) {
          var repoPromises;
          repoPromises = atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project));
          return Promise.all(repoPromises).then(function(repos) {
            return repos.forEach(function(repo) {
              var directory, submodule;
              directory = new Directory(repo.getWorkingDirectory());
              if ((repo != null) && directory.contains(path) || directory.getPath() === path) {
                submodule = repo != null ? repo.repo.submoduleForPath(path) : void 0;
                if (submodule != null) {
                  return resolve(submodule);
                } else {
                  return resolve(repo);
                }
              }
            });
          });
        });
      }
    },
    getSubmodule: function(path) {
      var ref1, ref2, ref3;
      if (path == null) {
        path = (ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0;
      }
      return (ref2 = atom.project.getRepositories().filter(function(r) {
        var ref3;
        return r != null ? (ref3 = r.repo) != null ? ref3.submoduleForPath(path) : void 0 : void 0;
      })[0]) != null ? (ref3 = ref2.repo) != null ? ref3.submoduleForPath(path) : void 0 : void 0;
    },
    dir: function(andSubmodules) {
      if (andSubmodules == null) {
        andSubmodules = true;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var submodule;
          if (andSubmodules && (submodule = git.getSubmodule())) {
            return resolve(submodule.getWorkingDirectory());
          } else {
            return git.getRepo().then(function(repo) {
              return resolve(repo.getWorkingDirectory());
            });
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2dpdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLHFDQUFELEVBQWtCOztFQUVsQixZQUFBLEdBQWUsT0FBQSxDQUFRLHdCQUFSOztFQUNmLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxpQkFBQSxHQUFvQixTQUFDLElBQUQsRUFBTyxZQUFQO0FBQ2xCLFFBQUE7O01BRHlCLGVBQWE7O0lBQ3RDLElBQUEsR0FBTyxDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLG9CQUFuQjtXQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDthQUNKLFlBQVksQ0FBQyxNQUFiLENBQW9CLGtCQUFBLENBQW1CLElBQW5CLENBQXBCO0lBREksQ0FETjtFQUZrQjs7RUFNcEIsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDVixRQUFBO0lBRGtCLHdCQUFELE1BQVM7SUFDMUIsSUFBYSxJQUFBLEtBQVEsRUFBckI7QUFBQSxhQUFPLEdBQVA7O0lBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFpQjs7O0FBQ25CO1dBQUEsaURBQUE7O3FCQUNIO1VBQUMsTUFBQSxJQUFEO1VBQU8sUUFBQSxNQUFQO1VBQWUsSUFBQSxFQUFNLElBQUssQ0FBQSxDQUFBLEdBQUUsQ0FBRixDQUExQjs7QUFERzs7O0VBSEs7O0VBTVosa0JBQUEsR0FBcUIsU0FBQyxJQUFEO0lBQ25CLElBQWEsSUFBQSxLQUFRLEVBQXJCO0FB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QSxJQUFBLENBQVI7SUFERCxDQWpITDs7QUEzQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJPcyA9IHJlcXVpcmUgJ29zJ1xue0J1ZmZlcmVkUHJvY2VzcywgRGlyZWN0b3J5fSA9IHJlcXVpcmUgJ2F0b20nXG5cblJlcG9MaXN0VmlldyA9IHJlcXVpcmUgJy4vdmlld3MvcmVwby1saXN0LXZpZXcnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4vbm90aWZpZXInXG5cbmdpdFVudHJhY2tlZEZpbGVzID0gKHJlcG8sIGRhdGFVbnN0YWdlZD1bXSkgLT5cbiAgYXJncyA9IFsnbHMtZmlsZXMnLCAnLW8nLCAnLS1leGNsdWRlLXN0YW5kYXJkJ11cbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT5cbiAgICBkYXRhVW5zdGFnZWQuY29uY2F0KF9wcmV0dGlmeVVudHJhY2tlZChkYXRhKSlcblxuX3ByZXR0aWZ5ID0gKGRhdGEsIHtzdGFnZWR9PXt9KSAtPlxuICByZXR1cm4gW10gaWYgZGF0YSBpcyAnJ1xuICBkYXRhID0gZGF0YS5zcGxpdCgvXFwwLylbLi4uLTFdXG4gIFtdID0gZm9yIG1vZGUsIGkgaW4gZGF0YSBieSAyXG4gICAge21vZGUsIHN0YWdlZCwgcGF0aDogZGF0YVtpKzFdfVxuXG5fcHJldHRpZnlVbnRyYWNrZWQgPSAoZGF0YSkgLT5cbiAgcmV0dXJuIFtdIGlmIGRhdGEgaXMgJydcbiAgZGF0YSA9IGRhdGEuc3BsaXQoL1xcbi8pLmZpbHRlciAoZCkgLT4gZCBpc250ICcnXG4gIGRhdGEubWFwIChmaWxlKSAtPiB7bW9kZTogJz8nLCBwYXRoOiBmaWxlfVxuXG5fcHJldHRpZnlEaWZmID0gKGRhdGEpIC0+XG4gIGRhdGEgPSBkYXRhLnNwbGl0KC9eQEAoPz1bIFxcLVxcK1xcLDAtOV0qQEApL2dtKVxuICBkYXRhWzEuLmRhdGEubGVuZ3RoXSA9ICgnQEAnICsgbGluZSBmb3IgbGluZSBpbiBkYXRhWzEuLl0pXG4gIGRhdGFcblxuZ2V0UmVwb0ZvckN1cnJlbnRGaWxlID0gLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBwcm9qZWN0ID0gYXRvbS5wcm9qZWN0XG4gICAgcGF0aCA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKT8uZ2V0UGF0aCgpXG4gICAgZGlyZWN0b3J5ID0gcHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcigoZCkgLT4gZC5jb250YWlucyhwYXRoKSlbMF1cbiAgICBpZiBkaXJlY3Rvcnk/XG4gICAgICBwcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkoZGlyZWN0b3J5KS50aGVuIChyZXBvKSAtPlxuICAgICAgICBzdWJtb2R1bGUgPSByZXBvLnJlcG8uc3VibW9kdWxlRm9yUGF0aChwYXRoKVxuICAgICAgICBpZiBzdWJtb2R1bGU/IHRoZW4gcmVzb2x2ZShzdWJtb2R1bGUpIGVsc2UgcmVzb2x2ZShyZXBvKVxuICAgICAgLmNhdGNoIChlKSAtPlxuICAgICAgICByZWplY3QoZSlcbiAgICBlbHNlXG4gICAgICByZWplY3QgXCJubyBjdXJyZW50IGZpbGVcIlxuXG5tb2R1bGUuZXhwb3J0cyA9IGdpdCA9XG4gIGNtZDogKGFyZ3MsIG9wdGlvbnM9eyBlbnY6IHByb2Nlc3MuZW52fSwge2NvbG9yfT17fSkgLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgb3V0cHV0ID0gJydcbiAgICAgIGFyZ3MgPSBbJy1jJywgJ2NvbG9yLnVpPWFsd2F5cyddLmNvbmNhdChhcmdzKSBpZiBjb2xvclxuICAgICAgcHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3NcbiAgICAgICAgY29tbWFuZDogYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5nZW5lcmFsLmdpdFBhdGgnKSA/ICdnaXQnXG4gICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICBzdGRvdXQ6IChkYXRhKSAtPiBvdXRwdXQgKz0gZGF0YS50b1N0cmluZygpXG4gICAgICAgIHN0ZGVycjogKGRhdGEpIC0+XG4gICAgICAgICAgb3V0cHV0ICs9IGRhdGEudG9TdHJpbmcoKVxuICAgICAgICBleGl0OiAoY29kZSkgLT5cbiAgICAgICAgICBpZiBjb2RlIGlzIDBcbiAgICAgICAgICAgIHJlc29sdmUgb3V0cHV0XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVqZWN0IG91dHB1dFxuICAgICAgcHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yIChlcnJvck9iamVjdCkgLT5cbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgJ0dpdCBQbHVzIGlzIHVuYWJsZSB0byBsb2NhdGUgdGhlIGdpdCBjb21tYW5kLiBQbGVhc2UgZW5zdXJlIHByb2Nlc3MuZW52LlBBVEggY2FuIGFjY2VzcyBnaXQuJ1xuICAgICAgICByZWplY3QgXCJDb3VsZG4ndCBmaW5kIGdpdFwiXG5cbiAgZ2V0Q29uZmlnOiAocmVwbywgc2V0dGluZykgLT4gcmVwby5nZXRDb25maWdWYWx1ZSBzZXR0aW5nLCByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG4gIHJlc2V0OiAocmVwbykgLT5cbiAgICBnaXQuY21kKFsncmVzZXQnLCAnSEVBRCddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKS50aGVuICgpIC0+IG5vdGlmaWVyLmFkZFN1Y2Nlc3MgJ0FsbCBjaGFuZ2VzIHVuc3RhZ2VkJ1xuXG4gIHN0YXR1czogKHJlcG8pIC0+XG4gICAgZ2l0LmNtZChbJ3N0YXR1cycsICctLXBvcmNlbGFpbicsICcteiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPiBpZiBkYXRhLmxlbmd0aCA+IDIgdGhlbiBkYXRhLnNwbGl0KCdcXDAnKVsuLi4tMV0gZWxzZSBbXVxuXG4gIHJlZnJlc2g6IChyZXBvKSAtPlxuICAgIGlmIHJlcG9cbiAgICAgIHJlcG8ucmVmcmVzaFN0YXR1cz8oKVxuICAgICAgcmVwby5yZWZyZXNoSW5kZXg/KClcbiAgICBlbHNlXG4gICAgICBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKCkuZm9yRWFjaCAocmVwbykgLT4gcmVwby5yZWZyZXNoU3RhdHVzKCkgaWYgcmVwbz9cblxuICByZWxhdGl2aXplOiAocGF0aCkgLT5cbiAgICBnaXQuZ2V0U3VibW9kdWxlKHBhdGgpPy5yZWxhdGl2aXplKHBhdGgpID8gYXRvbS5wcm9qZWN0LmdldFJlcG9zaXRvcmllcygpWzBdPy5yZWxhdGl2aXplKHBhdGgpID8gcGF0aFxuXG4gIGRpZmY6IChyZXBvLCBwYXRoKSAtPlxuICAgIGdpdC5jbWQoWydkaWZmJywgJy1wJywgJy1VMScsIHBhdGhdLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPiBfcHJldHRpZnlEaWZmKGRhdGEpXG5cbiAgc3RhZ2VkRmlsZXM6IChyZXBvKSAtPlxuICAgIGFyZ3MgPSBbJ2RpZmYtaW5kZXgnLCAnLS1jYWNoZWQnLCAnSEVBRCcsICctLW5hbWUtc3RhdHVzJywgJy16J11cbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBfcHJldHRpZnkgZGF0YSwgc3RhZ2VkOiB0cnVlXG4gICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgIGlmIGVycm9yLmluY2x1ZGVzIFwiYW1iaWd1b3VzIGFyZ3VtZW50ICdIRUFEJ1wiXG4gICAgICAgIFByb21pc2UucmVzb2x2ZSBbMV1cbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgZXJyb3JcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlIFtdXG5cbiAgdW5zdGFnZWRGaWxlczogKHJlcG8sIHtzaG93VW50cmFja2VkfT17fSkgLT5cbiAgICBhcmdzID0gWydkaWZmLWZpbGVzJywgJy0tbmFtZS1zdGF0dXMnLCAnLXonXVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIHNob3dVbnRyYWNrZWRcbiAgICAgICAgZ2l0VW50cmFja2VkRmlsZXMocmVwbywgX3ByZXR0aWZ5KGRhdGEsIHN0YWdlZDogZmFsc2UpKVxuICAgICAgZWxzZVxuICAgICAgICBfcHJldHRpZnkoZGF0YSwgc3RhZ2VkOiBmYWxzZSlcblxuICBhZGQ6IChyZXBvLCB7ZmlsZSwgdXBkYXRlfT17fSkgLT5cbiAgICBhcmdzID0gWydhZGQnXVxuICAgIGlmIHVwZGF0ZSB0aGVuIGFyZ3MucHVzaCAnLS11cGRhdGUnIGVsc2UgYXJncy5wdXNoICctLWFsbCdcbiAgICBhcmdzLnB1c2goaWYgZmlsZSB0aGVuIGZpbGUgZWxzZSAnLicpXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChvdXRwdXQpIC0+XG4gICAgICBpZiBvdXRwdXQgaXNudCBmYWxzZVxuICAgICAgICBub3RpZmllci5hZGRTdWNjZXNzIFwiQWRkZWQgI3tmaWxlID8gJ2FsbCBmaWxlcyd9XCJcbiAgICAuY2F0Y2ggKG1zZykgLT4gbm90aWZpZXIuYWRkRXJyb3IgbXNnXG5cbiAgZ2V0QWxsUmVwb3M6IC0+XG4gICAge3Byb2plY3R9ID0gYXRvbVxuICAgIFByb21pc2UuYWxsKHByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuICAgICAgLm1hcChwcm9qZWN0LnJlcG9zaXRvcnlGb3JEaXJlY3RvcnkuYmluZChwcm9qZWN0KSkpXG5cbiAgZ2V0UmVwbzogLT5cbiAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZ2V0UmVwb0ZvckN1cnJlbnRGaWxlKCkudGhlbiAocmVwbykgLT4gcmVzb2x2ZShyZXBvKVxuICAgICAgLmNhdGNoIChlKSAtPlxuICAgICAgICByZXBvcyA9IGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIgKHIpIC0+IHI/XG4gICAgICAgIGlmIHJlcG9zLmxlbmd0aCBpcyAwXG4gICAgICAgICAgcmVqZWN0KFwiTm8gcmVwb3MgZm91bmRcIilcbiAgICAgICAgZWxzZSBpZiByZXBvcy5sZW5ndGggPiAxXG4gICAgICAgICAgcmVzb2x2ZShuZXcgUmVwb0xpc3RWaWV3KHJlcG9zKS5yZXN1bHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXNvbHZlKHJlcG9zWzBdKVxuXG4gIGdldFJlcG9Gb3JQYXRoOiAocGF0aCkgLT5cbiAgICBpZiBub3QgcGF0aD9cbiAgICAgIFByb21pc2UucmVqZWN0IFwiTm8gZmlsZSB0byBmaW5kIHJlcG9zaXRvcnkgZm9yXCJcbiAgICBlbHNlXG4gICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgICByZXBvUHJvbWlzZXMgPVxuICAgICAgICAgIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpXG4gICAgICAgICAgLm1hcChhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeS5iaW5kKGF0b20ucHJvamVjdCkpXG5cbiAgICAgICAgUHJvbWlzZS5hbGwocmVwb1Byb21pc2VzKS50aGVuIChyZXBvcykgLT5cbiAgICAgICAgICByZXBvcy5mb3JFYWNoIChyZXBvKSAtPlxuICAgICAgICAgICAgZGlyZWN0b3J5ID0gbmV3IERpcmVjdG9yeShyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgICAgIGlmIHJlcG8/IGFuZCBkaXJlY3RvcnkuY29udGFpbnMocGF0aCkgb3IgZGlyZWN0b3J5LmdldFBhdGgoKSBpcyBwYXRoXG4gICAgICAgICAgICAgIHN1Ym1vZHVsZSA9IHJlcG8/LnJlcG8uc3VibW9kdWxlRm9yUGF0aChwYXRoKVxuICAgICAgICAgICAgICBpZiBzdWJtb2R1bGU/IHRoZW4gcmVzb2x2ZShzdWJtb2R1bGUpIGVsc2UgcmVzb2x2ZShyZXBvKVxuXG4gIGdldFN1Ym1vZHVsZTogKHBhdGgpIC0+XG4gICAgcGF0aCA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKVxuICAgIGF0b20ucHJvamVjdC5nZXRSZXBvc2l0b3JpZXMoKS5maWx0ZXIoKHIpIC0+XG4gICAgICByPy5yZXBvPy5zdWJtb2R1bGVGb3JQYXRoIHBhdGhcbiAgICApWzBdPy5yZXBvPy5zdWJtb2R1bGVGb3JQYXRoIHBhdGhcblxuICBkaXI6IChhbmRTdWJtb2R1bGVzPXRydWUpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIGlmIGFuZFN1Ym1vZHVsZXMgYW5kIHN1Ym1vZHVsZSA9IGdpdC5nZXRTdWJtb2R1bGUoKVxuICAgICAgICByZXNvbHZlKHN1Ym1vZHVsZS5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICBlbHNlXG4gICAgICAgIGdpdC5nZXRSZXBvKCkudGhlbiAocmVwbykgLT4gcmVzb2x2ZShyZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiJdfQ==
