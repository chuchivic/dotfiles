(function() {
  var $$, ListView, OutputViewManager, RemoteBranchListView, SelectListView, _pull, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  _pull = require('../models/_pull');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  RemoteBranchListView = require('./remote-branch-list-view');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data1, arg1) {
      var ref1;
      this.repo = repo;
      this.data = data1;
      ref1 = arg1 != null ? arg1 : {}, this.mode = ref1.mode, this.tag = ref1.tag, this.extraArgs = ref1.extraArgs;
      ListView.__super__.initialize.apply(this, arguments);
      if (this.tag == null) {
        this.tag = '';
      }
      if (this.extraArgs == null) {
        this.extraArgs = [];
      }
      this.show();
      this.parseData();
      return this.result = new Promise((function(_this) {
        return function(resolve1, reject1) {
          _this.resolve = resolve1;
          _this.reject = reject1;
        };
      })(this));
    };

    ListView.prototype.parseData = function() {
      var items, remotes;
      items = this.data.split("\n");
      remotes = items.filter(function(item) {
        return item !== '';
      }).map(function(item) {
        return {
          name: item
        };
      });
      if (remotes.length === 1) {
        return this.confirmed(remotes[0]);
      } else {
        this.setItems(remotes);
        return this.focusFilterEditor();
      }
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg1) {
      var name;
      name = arg1.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.pull = function(remoteName) {
      if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
        return git.cmd(['branch', '--no-color', '-r'], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(data) {
            return new Promise(function(resolve, reject) {
              return new RemoteBranchListView(data, remoteName, function(arg1) {
                var args, branchName, name, startMessage, view;
                name = arg1.name;
                branchName = name.substring(name.indexOf('/') + 1);
                view = OutputViewManager.create();
                startMessage = notifier.addInfo("Pulling...", {
                  dismissable: true
                });
                args = ['pull'].concat(_this.extraArgs, remoteName, branchName).filter(function(arg) {
                  return arg !== '';
                });
                return git.cmd(args, {
                  cwd: _this.repo.getWorkingDirectory()
                }, {
                  color: true
                }).then(function(data) {
                  resolve(branchName);
                  view.setContent(data).finish();
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  reject();
                  view.setContent(error).finish();
                  return startMessage.dismiss();
                });
              });
            });
          };
        })(this));
      } else {
        return _pull(this.repo, {
          extraArgs: this.extraArgs
        });
      }
    };

    ListView.prototype.confirmed = function(arg1) {
      var name, pullBeforePush;
      name = arg1.name;
      if (this.mode === 'pull') {
        this.pull(name);
      } else if (this.mode === 'fetch-prune') {
        this.mode = 'fetch';
        this.execute(name, '--prune');
      } else if (this.mode === 'push') {
        pullBeforePush = atom.config.get('git-plus.remoteInteractions.pullBeforePush');
        if (pullBeforePush && atom.config.get('git-plus.remoteInteractions.pullRebase')) {
          this.extraArgs = '--rebase';
        }
        if (pullBeforePush) {
          this.pull(name).then((function(_this) {
            return function(branch) {
              return _this.execute(name, null, branch);
            };
          })(this));
        } else {
          this.execute(name);
        }
      } else if (this.mode === 'push -u') {
        this.pushAndSetUpstream(name);
      } else {
        this.execute(name);
      }
      return this.cancel();
    };

    ListView.prototype.execute = function(remote, extraArgs, branch) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      if (extraArgs == null) {
        extraArgs = '';
      }
      if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
        if (branch != null) {
          view = OutputViewManager.create();
          args = [this.mode];
          if (extraArgs.length > 0) {
            args.push(extraArgs);
          }
          args = args.concat([remote, branch]);
          message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
          startMessage = notifier.addInfo(message, {
            dismissable: true
          });
          return git.cmd(args, {
            cwd: this.repo.getWorkingDirectory()
          }, {
            color: true
          }).then((function(_this) {
            return function(data) {
              if (data !== '') {
                view.setContent(data).finish();
              }
              startMessage.dismiss();
              return git.refresh(_this.repo);
            };
          })(this))["catch"]((function(_this) {
            return function(data) {
              if (data !== '') {
                view.setContent(data).finish();
              }
              return startMessage.dismiss();
            };
          })(this));
        } else {
          return git.cmd(['branch', '--no-color', '-r'], {
            cwd: this.repo.getWorkingDirectory()
          }).then((function(_this) {
            return function(data) {
              return new RemoteBranchListView(data, remote, function(arg1) {
                var branchName, name;
                name = arg1.name;
                branchName = name.substring(name.indexOf('/') + 1);
                view = OutputViewManager.create();
                startMessage = notifier.addInfo("Pushing...", {
                  dismissable: true
                });
                args = ['push'].concat(extraArgs, remote, branchName).filter(function(arg) {
                  return arg !== '';
                });
                return git.cmd(args, {
                  cwd: _this.repo.getWorkingDirectory()
                }, {
                  color: true
                }).then(function(data) {
                  view.setContent(data).finish();
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  view.setContent(error).finish();
                  return startMessage.dismiss();
                });
              });
            };
          })(this));
        }
      } else {
        view = OutputViewManager.create();
        args = [this.mode];
        if (extraArgs.length > 0) {
          args.push(extraArgs);
        }
        args = args.concat([remote, this.tag]).filter(function(arg) {
          return arg !== '';
        });
        message = (this.mode[0].toUpperCase() + this.mode.substring(1)) + "ing...";
        startMessage = notifier.addInfo(message, {
          dismissable: true
        });
        return git.cmd(args, {
          cwd: this.repo.getWorkingDirectory()
        }, {
          color: true
        }).then((function(_this) {
          return function(data) {
            if (data !== '') {
              view.setContent(data).finish();
            }
            startMessage.dismiss();
            return git.refresh(_this.repo);
          };
        })(this))["catch"]((function(_this) {
          return function(data) {
            if (data !== '') {
              view.setContent(data).finish();
            }
            return startMessage.dismiss();
          };
        })(this));
      }
    };

    ListView.prototype.pushAndSetUpstream = function(remote) {
      var args, message, startMessage, view;
      if (remote == null) {
        remote = '';
      }
      view = OutputViewManager.create();
      args = ['push', '-u', remote, 'HEAD'].filter(function(arg) {
        return arg !== '';
      });
      message = "Pushing...";
      startMessage = notifier.addInfo(message, {
        dismissable: true
      });
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then(function(data) {
        if (data !== '') {
          view.setContent(data).finish();
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.setContent(data).finish();
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnR0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBRUwsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLEtBQUEsR0FBUSxPQUFBLENBQVEsaUJBQVI7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDJCQUFSOztFQUV2QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3VCQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSLEVBQWUsSUFBZjtBQUNWLFVBQUE7TUFEVyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEOzRCQUFPLE9BQTBCLElBQXpCLElBQUMsQ0FBQSxZQUFBLE1BQU0sSUFBQyxDQUFBLFdBQUEsS0FBSyxJQUFDLENBQUEsaUJBQUE7TUFDeEMsMENBQUEsU0FBQTs7UUFDQSxJQUFDLENBQUEsTUFBTzs7O1FBQ1IsSUFBQyxDQUFBLFlBQWE7O01BQ2QsSUFBQyxDQUFBLElBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFELEVBQVcsT0FBWDtVQUFDLEtBQUMsQ0FBQSxVQUFEO1VBQVUsS0FBQyxDQUFBLFNBQUQ7UUFBWDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQU5KOzt1QkFRWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxLQUFB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QUFPLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxNQUFmLEVBQXVCLE1BQXZCLENBQThCLENBQUMsTUFBL0IsQ0FBc0MsU0FBQyxHQUFEO2VBQVMsR0FBQSxLQUFTO01BQWxCLENBQXRDO01BQ1AsT0FBQSxHQUFVO01BQ1YsWUFBQSxHQUFlLFFBQVEsQ0FBQyxPQUFULENBQWlCLE9BQWpCLEVBQTBCO1FBQUEsV0FBQSxFQUFhLElBQWI7T0FBMUI7YUFDZixHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUFkLEVBQWdEO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBaEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7UUFDSixJQUFHLElBQUEsS0FBVSxFQUFiO1VBQ0UsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsQ0FBQyxNQUF0QixDQUFBLEVBREY7O2VBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUhJLENBRE4sQ0FLQSxFQUFDLEtBQUQsRUFMQSxDQUtPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ0wsSUFBRyxJQUFBLEtBQVUsRUFBYjtZQUNFLElBQUksQ0FBQyxVQUFMLENBQWdCLElBQWhCLENBQXFCLENBQUMsTUFBdEIsQ0FBQSxFQURGOztpQkFFQSxZQUFZLENBQUMsT0FBYixDQUFBO1FBSEs7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFA7SUFMa0I7Ozs7S0FsSUM7QUFUdkIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5fcHVsbCA9IHJlcXVpcmUgJy4uL21vZGVscy9fcHVsbCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5SZW1vdGVCcmFuY2hMaXN0VmlldyA9IHJlcXVpcmUgJy4vcmVtb3RlLWJyYW5jaC1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAZGF0YSwge0Btb2RlLCBAdGFnLCBAZXh0cmFBcmdzfT17fSkgLT5cbiAgICBzdXBlclxuICAgIEB0YWcgPz0gJydcbiAgICBAZXh0cmFBcmdzID89IFtdXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuICAgIEByZXN1bHQgPSBuZXcgUHJvbWlzZSAoQHJlc29sdmUsIEByZWplY3QpID0+XG5cbiAgcGFyc2VEYXRhOiAtPlxuICAgIGl0ZW1zID0gQGRhdGEuc3BsaXQoXCJcXG5cIilcbiAgICByZW1vdGVzID0gaXRlbXMuZmlsdGVyKChpdGVtKSAtPiBpdGVtIGlzbnQgJycpLm1hcCAoaXRlbSkgLT4geyBuYW1lOiBpdGVtIH1cbiAgICBpZiByZW1vdGVzLmxlbmd0aCBpcyAxXG4gICAgICBAY29uZmlybWVkIHJlbW90ZXNbMF1cbiAgICBlbHNlXG4gICAgICBAc2V0SXRlbXMgcmVtb3Rlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgJCQgLT5cbiAgICAgIEBsaSBuYW1lXG5cbiAgcHVsbDogKHJlbW90ZU5hbWUpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJylcbiAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvcicsICctciddLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICAgIG5ldyBSZW1vdGVCcmFuY2hMaXN0VmlldyBkYXRhLCByZW1vdGVOYW1lLCAoe25hbWV9KSA9PlxuICAgICAgICAgICAgYnJhbmNoTmFtZSA9IG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLycpICsgMSlcbiAgICAgICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgICAgICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBcIlB1bGxpbmcuLi5cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIGFyZ3MgPSBbJ3B1bGwnXS5jb25jYXQoQGV4dHJhQXJncywgcmVtb3RlTmFtZSwgYnJhbmNoTmFtZSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgICAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICAgICAgICByZXNvbHZlIGJyYW5jaE5hbWVcbiAgICAgICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgICAgICAgIC5jYXRjaCAoZXJyb3IpID0+XG4gICAgICAgICAgICAgIHJlamVjdCgpXG4gICAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChlcnJvcikuZmluaXNoKClcbiAgICAgICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIGVsc2VcbiAgICAgIF9wdWxsIEByZXBvLCBleHRyYUFyZ3M6IEBleHRyYUFyZ3NcblxuICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgaWYgQG1vZGUgaXMgJ3B1bGwnXG4gICAgICBAcHVsbCBuYW1lXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAnZmV0Y2gtcHJ1bmUnXG4gICAgICBAbW9kZSA9ICdmZXRjaCdcbiAgICAgIEBleGVjdXRlIG5hbWUsICctLXBydW5lJ1xuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3B1c2gnXG4gICAgICBwdWxsQmVmb3JlUHVzaCA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxCZWZvcmVQdXNoJylcbiAgICAgIEBleHRyYUFyZ3MgPSAnLS1yZWJhc2UnIGlmIHB1bGxCZWZvcmVQdXNoIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wdWxsUmViYXNlJylcbiAgICAgIGlmIHB1bGxCZWZvcmVQdXNoXG4gICAgICAgIEBwdWxsKG5hbWUpLnRoZW4gKGJyYW5jaCkgPT4gQGV4ZWN1dGUgbmFtZSwgbnVsbCwgYnJhbmNoXG4gICAgICBlbHNlXG4gICAgICAgIEBleGVjdXRlIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdwdXNoIC11J1xuICAgICAgQHB1c2hBbmRTZXRVcHN0cmVhbSBuYW1lXG4gICAgZWxzZVxuICAgICAgQGV4ZWN1dGUgbmFtZVxuICAgIEBjYW5jZWwoKVxuXG4gIGV4ZWN1dGU6IChyZW1vdGU9JycsIGV4dHJhQXJncz0nJywgYnJhbmNoKSAtPlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnByb21wdEZvckJyYW5jaCcpXG4gICAgICBpZiBicmFuY2g/XG4gICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKVxuICAgICAgICBhcmdzID0gW0Btb2RlXVxuICAgICAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgICAgIGFyZ3MucHVzaCBleHRyYUFyZ3NcbiAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtyZW1vdGUsIGJyYW5jaF0pXG4gICAgICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgICB2aWV3LnNldENvbnRlbnQoZGF0YSkuZmluaXNoKClcbiAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICBlbHNlXG4gICAgICAgIGdpdC5jbWQoWydicmFuY2gnLCAnLS1uby1jb2xvcicsICctciddLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgbmV3IFJlbW90ZUJyYW5jaExpc3RWaWV3IGRhdGEsIHJlbW90ZSwgKHtuYW1lfSkgPT5cbiAgICAgICAgICAgIGJyYW5jaE5hbWUgPSBuYW1lLnN1YnN0cmluZyhuYW1lLmluZGV4T2YoJy8nKSArIDEpXG4gICAgICAgICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICAgICAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdXNoaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBhcmdzID0gWydwdXNoJ10uY29uY2F0KGV4dHJhQXJncywgcmVtb3RlLCBicmFuY2hOYW1lKS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAgICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAgICAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgICAgICAgICB2aWV3LnNldENvbnRlbnQoZXJyb3IpLmZpbmlzaCgpXG4gICAgICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICBlbHNlXG4gICAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKClcbiAgICAgIGFyZ3MgPSBbQG1vZGVdXG4gICAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgICBhcmdzLnB1c2ggZXh0cmFBcmdzXG4gICAgICBhcmdzID0gYXJncy5jb25jYXQoW3JlbW90ZSwgQHRhZ10pLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcblxuICBwdXNoQW5kU2V0VXBzdHJlYW06IChyZW1vdGU9JycpIC0+XG4gICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmNyZWF0ZSgpXG4gICAgYXJncyA9IFsncHVzaCcsICctdScsIHJlbW90ZSwgJ0hFQUQnXS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgbWVzc2FnZSA9IFwiUHVzaGluZy4uLlwiXG4gICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zZXRDb250ZW50KGRhdGEpLmZpbmlzaCgpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgLmNhdGNoIChkYXRhKSA9PlxuICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgIHZpZXcuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuIl19
