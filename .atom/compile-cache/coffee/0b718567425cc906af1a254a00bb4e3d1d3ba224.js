(function() {
  var $, CompositeDisposable, InputView, TextEditorView, View, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  git = require('../git');

  notifier = require('../notifier');

  InputView = (function(superClass) {
    extend(InputView, superClass);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div({
        "class": 'git-branch'
      }, (function(_this) {
        return function() {
          return _this.subview('branchEditor', new TextEditorView({
            mini: true,
            placeholderText: 'New branch name'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo1) {
      this.repo = repo1;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      this.panel = atom.workspace.addModalPanel({
        item: this
      });
      this.panel.show();
      this.branchEditor.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(event) {
            return _this.destroy();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:confirm': (function(_this) {
          return function(event) {
            return _this.createBranch();
          };
        })(this)
      }));
    };

    InputView.prototype.destroy = function() {
      this.panel.destroy();
      this.disposables.dispose();
      return this.currentPane.activate();
    };

    InputView.prototype.createBranch = function() {
      var name;
      this.destroy();
      name = this.branchEditor.getModel().getText();
      if (name.length > 0) {
        return git.cmd(['checkout', '-b', name], {
          cwd: this.repo.getWorkingDirectory()
        }).then((function(_this) {
          return function(message) {
            notifier.addSuccess(message);
            return git.refresh(_this.repo);
          };
        })(this))["catch"]((function(_this) {
          return function(err) {
            return notifier.addError(err);
          };
        })(this));
      }
    };

    return InputView;

  })(View);

  module.exports = function(repo) {
    return new InputView(repo);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY2hlY2tvdXQtbmV3LWJyYW5jaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJFQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLG1DQUFKLEVBQW9COztFQUVwQixHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVMOzs7Ozs7O0lBQ0osU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDtPQUFMLEVBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDeEIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxjQUFULEVBQTZCLElBQUEsY0FBQSxDQUFlO1lBQUEsSUFBQSxFQUFNLElBQU47WUFBWSxlQUFBLEVBQWlCLGlCQUE3QjtXQUFmLENBQTdCO1FBRHdCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtJQURROzt3QkFJVixVQUFBLEdBQVksU0FBQyxLQUFEO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtNQUNmLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1FBQUEsSUFBQSxFQUFNLElBQU47T0FBN0I7TUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUVBLElBQUMsQ0FBQSxZQUFZLENBQUMsS0FBZCxDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0M7UUFBQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxLQUFEO21CQUFXLEtBQUMsQ0FBQSxPQUFELENBQUE7VUFBWDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtPQUF0QyxDQUFqQjthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0Isa0JBQWxCLEVBQXNDO1FBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7bUJBQVcsS0FBQyxDQUFBLFlBQUQsQ0FBQTtVQUFYO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtPQUF0QyxDQUFqQjtJQVJVOzt3QkFVWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBQTtJQUhPOzt3QkFLVCxZQUFBLEdBQWMsU0FBQTtBQUNaLFVBQUE7TUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBO01BQ0EsSUFBQSxHQUFPLElBQUMsQ0FBQSxZQUFZLENBQUMsUUFBZCxDQUFBLENBQXdCLENBQUMsT0FBekIsQ0FBQTtNQUNQLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjtlQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixJQUFuQixDQUFSLEVBQWtDO1VBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO1NBQWxDLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxPQUFEO1lBQ0osUUFBUSxDQUFDLFVBQVQsQ0FBb0IsT0FBcEI7bUJBQ0EsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtVQUZJO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBSUEsRUFBQyxLQUFELEVBSkEsQ0FJTyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEdBQUQ7bUJBQ0wsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEI7VUFESztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FKUCxFQURGOztJQUhZOzs7O0tBcEJROztFQStCeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFEO1dBQWMsSUFBQSxTQUFBLENBQVUsSUFBVjtFQUFkO0FBckNqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVGV4dEVkaXRvclZpZXcsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5cbmNsYXNzIElucHV0VmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2dpdC1icmFuY2gnLCA9PlxuICAgICAgQHN1YnZpZXcgJ2JyYW5jaEVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6ICdOZXcgYnJhbmNoIG5hbWUnKVxuXG4gIGluaXRpYWxpemU6IChAcmVwbykgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG5cbiAgICBAYnJhbmNoRWRpdG9yLmZvY3VzKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y2FuY2VsJzogKGV2ZW50KSA9PiBAZGVzdHJveSgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNvbmZpcm0nOiAoZXZlbnQpID0+IEBjcmVhdGVCcmFuY2goKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAY3VycmVudFBhbmUuYWN0aXZhdGUoKVxuXG4gIGNyZWF0ZUJyYW5jaDogLT5cbiAgICBAZGVzdHJveSgpXG4gICAgbmFtZSA9IEBicmFuY2hFZGl0b3IuZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICBpZiBuYW1lLmxlbmd0aCA+IDBcbiAgICAgIGdpdC5jbWQoWydjaGVja291dCcsICctYicsIG5hbWVdLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChtZXNzYWdlKSA9PlxuICAgICAgICBub3RpZmllci5hZGRTdWNjZXNzIG1lc3NhZ2VcbiAgICAgICAgZ2l0LnJlZnJlc2ggQHJlcG9cbiAgICAgIC5jYXRjaCAoZXJyKSA9PlxuICAgICAgICBub3RpZmllci5hZGRFcnJvciBlcnJcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT4gbmV3IElucHV0VmlldyhyZXBvKVxuIl19
