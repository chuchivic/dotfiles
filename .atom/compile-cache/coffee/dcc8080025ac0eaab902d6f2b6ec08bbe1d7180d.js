(function() {
  var $, CompositeDisposable, InputView, OutputViewManager, TextEditorView, View, git, notifier, ref, runCommand,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  runCommand = function(repo, args) {
    var promise, view;
    view = OutputViewManager.getView();
    promise = git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }, {
      color: true
    });
    promise.then(function(data) {
      var msg;
      msg = "git " + (args.join(' ')) + " was successful";
      notifier.addSuccess(msg);
      if ((data != null ? data.length : void 0) > 0) {
        view.showContent(data);
      } else {
        view.reset();
      }
      return git.refresh(repo);
    })["catch"]((function(_this) {
      return function(msg) {
        if ((msg != null ? msg.length : void 0) > 0) {
          view.showContent(msg);
        } else {
          view.reset();
        }
        return git.refresh(repo);
      };
    })(this));
    return promise;
  };

  InputView = (function(superClass) {
    extend(InputView, superClass);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div((function(_this) {
        return function() {
          return _this.subview('commandEditor', new TextEditorView({
            mini: true,
            placeholderText: 'Git command and arguments'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo1) {
      this.repo = repo1;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.commandEditor.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(e) {
            var ref1;
            if ((ref1 = _this.panel) != null) {
              ref1.destroy();
            }
            _this.currentPane.activate();
            return _this.disposables.dispose();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function(e) {
          var ref1;
          _this.disposables.dispose();
          if ((ref1 = _this.panel) != null) {
            ref1.destroy();
          }
          return runCommand(_this.repo, _this.commandEditor.getText().split(' ')).then(function() {
            _this.currentPane.activate();
            return git.refresh(_this.repo);
          });
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = function(repo, args) {
    if (args == null) {
      args = [];
    }
    if (args.length > 0) {
      return runCommand(repo, args.split(' '));
    } else {
      return new InputView(repo);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcnVuLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEdBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFELEVBQUksbUNBQUosRUFBb0I7O0VBRXBCLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sSUFBUDtBQUNYLFFBQUE7SUFBQSxJQUFBLEdBQU8saUJBQWlCLENBQUMsT0FBbEIsQ0FBQTtJQUNQLE9BQUEsR0FBVSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztNQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO0tBQWQsRUFBK0M7TUFBQyxLQUFBLEVBQU8sSUFBUjtLQUEvQztJQUNWLE9BQU8sQ0FBQyxJQUFSLENBQWEsU0FBQyxJQUFEO0FBQ1gsVUFBQTtNQUFBLEdBQUEsR0FBTSxNQUFBLEdBQU0sQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBRCxDQUFOLEdBQXNCO01BQzVCLFFBQVEsQ0FBQyxVQUFULENBQW9CLEdBQXBCO01BQ0Esb0JBQUcsSUFBSSxDQUFFLGdCQUFOLEdBQWUsQ0FBbEI7UUFDRSxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixFQURGO09BQUEsTUFBQTtRQUdFLElBQUksQ0FBQyxLQUFMLENBQUEsRUFIRjs7YUFJQSxHQUFHLENBQUMsT0FBSixDQUFZLElBQVo7SUFQVyxDQUFiLENBUUEsRUFBQyxLQUFELEVBUkEsQ0FRTyxDQUFBLFNBQUEsS0FBQTthQUFBLFNBQUMsR0FBRDtRQUNMLG1CQUFHLEdBQUcsQ0FBRSxnQkFBTCxHQUFjLENBQWpCO1VBQ0UsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsR0FBakIsRUFERjtTQUFBLE1BQUE7VUFHRSxJQUFJLENBQUMsS0FBTCxDQUFBLEVBSEY7O2VBSUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFaO01BTEs7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBUlA7QUFjQSxXQUFPO0VBakJJOztFQW1CUDs7Ozs7OztJQUNKLFNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNILEtBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUE4QixJQUFBLGNBQUEsQ0FBZTtZQUFBLElBQUEsRUFBTSxJQUFOO1lBQVksZUFBQSxFQUFpQiwyQkFBN0I7V0FBZixDQUE5QjtRQURHO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMO0lBRFE7O3dCQUlWLFVBQUEsR0FBWSxTQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUNYLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSTtNQUNuQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBOztRQUNmLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUE7TUFFQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQztRQUFBLGFBQUEsRUFBZSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7QUFDcEUsZ0JBQUE7O2tCQUFNLENBQUUsT0FBUixDQUFBOztZQUNBLEtBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFBO21CQUNBLEtBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO1VBSG9FO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFmO09BQXRDLENBQWpCO2FBS0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0MsY0FBdEMsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7QUFDckUsY0FBQTtVQUFBLEtBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBOztnQkFDTSxDQUFFLE9BQVIsQ0FBQTs7aUJBQ0EsVUFBQSxDQUFXLEtBQUMsQ0FBQSxJQUFaLEVBQWtCLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQXdCLENBQUMsS0FBekIsQ0FBK0IsR0FBL0IsQ0FBbEIsQ0FBc0QsQ0FBQyxJQUF2RCxDQUE0RCxTQUFBO1lBQzFELEtBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFBO21CQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7VUFGMEQsQ0FBNUQ7UUFIcUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQWpCO0lBWlU7Ozs7S0FMVTs7RUF3QnhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVA7O01BQU8sT0FBSzs7SUFDM0IsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLENBQWpCO2FBQ0UsVUFBQSxDQUFXLElBQVgsRUFBaUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQWpCLEVBREY7S0FBQSxNQUFBO2FBR00sSUFBQSxTQUFBLENBQVUsSUFBVixFQUhOOztFQURlO0FBbERqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVGV4dEVkaXRvclZpZXcsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbnJ1bkNvbW1hbmQgPSAocmVwbywgYXJncykgLT5cbiAgdmlldyA9IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKVxuICBwcm9taXNlID0gZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICBwcm9taXNlLnRoZW4gKGRhdGEpIC0+XG4gICAgbXNnID0gXCJnaXQgI3thcmdzLmpvaW4oJyAnKX0gd2FzIHN1Y2Nlc3NmdWxcIlxuICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MobXNnKVxuICAgIGlmIGRhdGE/Lmxlbmd0aCA+IDBcbiAgICAgIHZpZXcuc2hvd0NvbnRlbnQgZGF0YVxuICAgIGVsc2VcbiAgICAgIHZpZXcucmVzZXQoKVxuICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgLmNhdGNoIChtc2cpID0+XG4gICAgaWYgbXNnPy5sZW5ndGggPiAwXG4gICAgICB2aWV3LnNob3dDb250ZW50IG1zZ1xuICAgIGVsc2VcbiAgICAgIHZpZXcucmVzZXQoKVxuICAgIGdpdC5yZWZyZXNoIHJlcG9cbiAgcmV0dXJuIHByb21pc2VcblxuY2xhc3MgSW5wdXRWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2ID0+XG4gICAgICBAc3VidmlldyAnY29tbWFuZEVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICdHaXQgY29tbWFuZCBhbmQgYXJndW1lbnRzJylcblxuICBpbml0aWFsaXplOiAoQHJlcG8pIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAY29tbWFuZEVkaXRvci5mb2N1cygpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y2FuY2VsJzogKGUpID0+XG4gICAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgICAgQGN1cnJlbnRQYW5lLmFjdGl2YXRlKClcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnY29yZTpjb25maXJtJywgKGUpID0+XG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgICAgcnVuQ29tbWFuZChAcmVwbywgQGNvbW1hbmRFZGl0b3IuZ2V0VGV4dCgpLnNwbGl0KCcgJykpLnRoZW4gPT5cbiAgICAgICAgQGN1cnJlbnRQYW5lLmFjdGl2YXRlKClcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywgYXJncz1bXSkgLT5cbiAgaWYgYXJncy5sZW5ndGggPiAwXG4gICAgcnVuQ29tbWFuZCByZXBvLCBhcmdzLnNwbGl0KCcgJylcbiAgZWxzZVxuICAgIG5ldyBJbnB1dFZpZXcocmVwbylcbiJdfQ==
