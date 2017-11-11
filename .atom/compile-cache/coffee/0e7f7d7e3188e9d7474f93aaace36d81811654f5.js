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
                view = OutputViewManager.getView();
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
                  view.showContent(data);
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  reject();
                  view.showContent(error);
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
          view = OutputViewManager.getView();
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
                view.showContent(data);
              }
              startMessage.dismiss();
              return git.refresh(_this.repo);
            };
          })(this))["catch"]((function(_this) {
            return function(data) {
              if (data !== '') {
                view.showContent(data);
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
                view = OutputViewManager.getView();
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
                  view.showContent(data);
                  startMessage.dismiss();
                  return git.refresh(_this.repo);
                })["catch"](function(error) {
                  view.showContent(error);
                  return startMessage.dismiss();
                });
              });
            };
          })(this));
        }
      } else {
        view = OutputViewManager.getView();
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
              view.showContent(data);
            }
            startMessage.dismiss();
            return git.refresh(_this.repo);
          };
        })(this))["catch"]((function(_this) {
          return function(data) {
            if (data !== '') {
              view.showContent(data);
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
      view = OutputViewManager.getView();
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
          view.showContent(data);
        }
        return startMessage.dismiss();
      })["catch"]((function(_this) {
        return function(data) {
          if (data !== '') {
            view.showContent(data);
          }
          return startMessage.dismiss();
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnR0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBRUwsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLEtBQUEsR0FBUSxPQUFBLENBQVEsaUJBQVI7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLDJCQUFSOztFQUV2QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3VCQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSLEVBQWUsSUFBZjtBQUNWLFVBQUE7TUFEVyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxPQUFEOzRCQUFPLE9BQTBCLElBQXpCLElBQUMsQ0FBQSxZQUFBLE1BQU0sSUFBQyxDQUFBLFdBQUEsS0FBSyxJQUFDLENBQUEsaUJBQUE7TUFDeEMsMENBQUEsU0FBQTs7UUFDQSxJQUFDLENBQUEsTUFBTzs7O1FBQ1IsSUFBQyxDQUFBLFlBQWE7O01BQ2QsSUFBQyxDQUFBLElBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFjLElBQUEsT0FBQSxDQUFRLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxRQUFELEVBQVcsT0FBWDtVQUFDLEtBQUMsQ0FBQSxVQUFEO1VBQVUsS0FBQyxDQUFBLFNBQUQ7UUFBWDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQU5KOzt1QkFRWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxLQUFB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QUEsRUFBYSxJQUFiO09BQTFCO2FBQ2YsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBZCxFQUFnRDtRQUFDLEtBQUEsRUFBTyxJQUFSO09BQWhELENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO1FBQ0osSUFBRyxJQUFBLEtBQVUsRUFBYjtVQUNFLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLEVBREY7O2VBRUEsWUFBWSxDQUFDLE9BQWIsQ0FBQTtNQUhJLENBRE4sQ0FLQSxFQUFDLEtBQUQsRUFMQSxDQUtPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ0wsSUFBRyxJQUFBLEtBQVUsRUFBYjtZQUNFLElBQUksQ0FBQyxXQUFMLENBQWlCLElBQWpCLEVBREY7O2lCQUVBLFlBQVksQ0FBQyxPQUFiLENBQUE7UUFISztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FMUDtJQUxrQjs7OztLQWxJQztBQVR2QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbl9wdWxsID0gcmVxdWlyZSAnLi4vbW9kZWxzL19wdWxsJ1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcblJlbW90ZUJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9yZW1vdGUtYnJhbmNoLWxpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAoQHJlcG8sIEBkYXRhLCB7QG1vZGUsIEB0YWcsIEBleHRyYUFyZ3N9PXt9KSAtPlxuICAgIHN1cGVyXG4gICAgQHRhZyA/PSAnJ1xuICAgIEBleHRyYUFyZ3MgPz0gW11cbiAgICBAc2hvdygpXG4gICAgQHBhcnNlRGF0YSgpXG4gICAgQHJlc3VsdCA9IG5ldyBQcm9taXNlIChAcmVzb2x2ZSwgQHJlamVjdCkgPT5cblxuICBwYXJzZURhdGE6IC0+XG4gICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKVxuICAgIHJlbW90ZXMgPSBpdGVtcy5maWx0ZXIoKGl0ZW0pIC0+IGl0ZW0gaXNudCAnJykubWFwIChpdGVtKSAtPiB7IG5hbWU6IGl0ZW0gfVxuICAgIGlmIHJlbW90ZXMubGVuZ3RoIGlzIDFcbiAgICAgIEBjb25maXJtZWQgcmVtb3Rlc1swXVxuICAgIGVsc2VcbiAgICAgIEBzZXRJdGVtcyByZW1vdGVzXG4gICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGdldEZpbHRlcktleTogLT4gJ25hbWUnXG5cbiAgc2hvdzogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgaGlkZTogLT4gQHBhbmVsPy5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKHtuYW1lfSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpIG5hbWVcblxuICBwdWxsOiAocmVtb3RlTmFtZSkgLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wcm9tcHRGb3JCcmFuY2gnKVxuICAgICAgZ2l0LmNtZChbJ2JyYW5jaCcsICctLW5vLWNvbG9yJywgJy1yJ10sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgICAgbmV3IFJlbW90ZUJyYW5jaExpc3RWaWV3IGRhdGEsIHJlbW90ZU5hbWUsICh7bmFtZX0pID0+XG4gICAgICAgICAgICBicmFuY2hOYW1lID0gbmFtZS5zdWJzdHJpbmcobmFtZS5pbmRleE9mKCcvJykgKyAxKVxuICAgICAgICAgICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKVxuICAgICAgICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBcIlB1bGxpbmcuLi5cIiwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIGFyZ3MgPSBbJ3B1bGwnXS5jb25jYXQoQGV4dHJhQXJncywgcmVtb3RlTmFtZSwgYnJhbmNoTmFtZSkuZmlsdGVyKChhcmcpIC0+IGFyZyBpc250ICcnKVxuICAgICAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSwge2NvbG9yOiB0cnVlfSlcbiAgICAgICAgICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgICAgICAgICByZXNvbHZlIGJyYW5jaE5hbWVcbiAgICAgICAgICAgICAgdmlldy5zaG93Q29udGVudChkYXRhKVxuICAgICAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAgICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAgICAgICAuY2F0Y2ggKGVycm9yKSA9PlxuICAgICAgICAgICAgICByZWplY3QoKVxuICAgICAgICAgICAgICB2aWV3LnNob3dDb250ZW50KGVycm9yKVxuICAgICAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgZWxzZVxuICAgICAgX3B1bGwgQHJlcG8sIGV4dHJhQXJnczogQGV4dHJhQXJnc1xuXG4gIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICBpZiBAbW9kZSBpcyAncHVsbCdcbiAgICAgIEBwdWxsIG5hbWVcbiAgICBlbHNlIGlmIEBtb2RlIGlzICdmZXRjaC1wcnVuZSdcbiAgICAgIEBtb2RlID0gJ2ZldGNoJ1xuICAgICAgQGV4ZWN1dGUgbmFtZSwgJy0tcHJ1bmUnXG4gICAgZWxzZSBpZiBAbW9kZSBpcyAncHVzaCdcbiAgICAgIHB1bGxCZWZvcmVQdXNoID0gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHVsbEJlZm9yZVB1c2gnKVxuICAgICAgQGV4dHJhQXJncyA9ICctLXJlYmFzZScgaWYgcHVsbEJlZm9yZVB1c2ggYW5kIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxSZWJhc2UnKVxuICAgICAgaWYgcHVsbEJlZm9yZVB1c2hcbiAgICAgICAgQHB1bGwobmFtZSkudGhlbiAoYnJhbmNoKSA9PiBAZXhlY3V0ZSBuYW1lLCBudWxsLCBicmFuY2hcbiAgICAgIGVsc2VcbiAgICAgICAgQGV4ZWN1dGUgbmFtZVxuICAgIGVsc2UgaWYgQG1vZGUgaXMgJ3B1c2ggLXUnXG4gICAgICBAcHVzaEFuZFNldFVwc3RyZWFtIG5hbWVcbiAgICBlbHNlXG4gICAgICBAZXhlY3V0ZSBuYW1lXG4gICAgQGNhbmNlbCgpXG5cbiAgZXhlY3V0ZTogKHJlbW90ZT0nJywgZXh0cmFBcmdzPScnLCBicmFuY2gpIC0+XG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJylcbiAgICAgIGlmIGJyYW5jaD9cbiAgICAgICAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKVxuICAgICAgICBhcmdzID0gW0Btb2RlXVxuICAgICAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgICAgIGFyZ3MucHVzaCBleHRyYUFyZ3NcbiAgICAgICAgYXJncyA9IGFyZ3MuY29uY2F0KFtyZW1vdGUsIGJyYW5jaF0pXG4gICAgICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICAgICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgICAgLmNhdGNoIChkYXRhKSA9PlxuICAgICAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICAgICAgdmlldy5zaG93Q29udGVudChkYXRhKVxuICAgICAgICAgIHN0YXJ0TWVzc2FnZS5kaXNtaXNzKClcbiAgICAgIGVsc2VcbiAgICAgICAgZ2l0LmNtZChbJ2JyYW5jaCcsICctLW5vLWNvbG9yJywgJy1yJ10sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgICBuZXcgUmVtb3RlQnJhbmNoTGlzdFZpZXcgZGF0YSwgcmVtb3RlLCAoe25hbWV9KSA9PlxuICAgICAgICAgICAgYnJhbmNoTmFtZSA9IG5hbWUuc3Vic3RyaW5nKG5hbWUuaW5kZXhPZignLycpICsgMSlcbiAgICAgICAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KClcbiAgICAgICAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gXCJQdXNoaW5nLi4uXCIsIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICBhcmdzID0gWydwdXNoJ10uY29uY2F0KGV4dHJhQXJncywgcmVtb3RlLCBicmFuY2hOYW1lKS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgICAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgICAgICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgICAgICAgLmNhdGNoIChlcnJvcikgPT5cbiAgICAgICAgICAgICAgdmlldy5zaG93Q29udGVudChlcnJvcilcbiAgICAgICAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIGVsc2VcbiAgICAgIHZpZXcgPSBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KClcbiAgICAgIGFyZ3MgPSBbQG1vZGVdXG4gICAgICBpZiBleHRyYUFyZ3MubGVuZ3RoID4gMFxuICAgICAgICBhcmdzLnB1c2ggZXh0cmFBcmdzXG4gICAgICBhcmdzID0gYXJncy5jb25jYXQoW3JlbW90ZSwgQHRhZ10pLmZpbHRlcigoYXJnKSAtPiBhcmcgaXNudCAnJylcbiAgICAgIG1lc3NhZ2UgPSBcIiN7QG1vZGVbMF0udG9VcHBlckNhc2UoKStAbW9kZS5zdWJzdHJpbmcoMSl9aW5nLi4uXCJcbiAgICAgIHN0YXJ0TWVzc2FnZSA9IG5vdGlmaWVyLmFkZEluZm8gbWVzc2FnZSwgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgICAudGhlbiAoZGF0YSkgPT5cbiAgICAgICAgaWYgZGF0YSBpc250ICcnXG4gICAgICAgICAgdmlldy5zaG93Q29udGVudChkYXRhKVxuICAgICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4gICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAuY2F0Y2ggKGRhdGEpID0+XG4gICAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICAgIHZpZXcuc2hvd0NvbnRlbnQoZGF0YSlcbiAgICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuXG4gIHB1c2hBbmRTZXRVcHN0cmVhbTogKHJlbW90ZT0nJykgLT5cbiAgICB2aWV3ID0gT3V0cHV0Vmlld01hbmFnZXIuZ2V0VmlldygpXG4gICAgYXJncyA9IFsncHVzaCcsICctdScsIHJlbW90ZSwgJ0hFQUQnXS5maWx0ZXIoKGFyZykgLT4gYXJnIGlzbnQgJycpXG4gICAgbWVzc2FnZSA9IFwiUHVzaGluZy4uLlwiXG4gICAgc3RhcnRNZXNzYWdlID0gbm90aWZpZXIuYWRkSW5mbyBtZXNzYWdlLCBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIGdpdC5jbWQoYXJncywgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX0pXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhIGlzbnQgJydcbiAgICAgICAgdmlldy5zaG93Q29udGVudChkYXRhKVxuICAgICAgc3RhcnRNZXNzYWdlLmRpc21pc3MoKVxuICAgIC5jYXRjaCAoZGF0YSkgPT5cbiAgICAgIGlmIGRhdGEgaXNudCAnJ1xuICAgICAgICB2aWV3LnNob3dDb250ZW50KGRhdGEpXG4gICAgICBzdGFydE1lc3NhZ2UuZGlzbWlzcygpXG4iXX0=
