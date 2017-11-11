(function() {
  var $, CompositeDisposable, GitStashSave, InputView, TextEditorView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('atom-space-pen-views'), $ = ref.$, TextEditorView = ref.TextEditorView, View = ref.View;

  GitStashSave = require('../models/git-stash-save');

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
            placeholderText: 'Stash message'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function(repo) {
      var currentPane, disposables, panel;
      disposables = new CompositeDisposable;
      currentPane = atom.workspace.getActivePane();
      panel = atom.workspace.addModalPanel({
        item: this
      });
      panel.show();
      this.commandEditor.focus();
      disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function(e) {
            if (panel != null) {
              panel.destroy();
            }
            currentPane.activate();
            return disposables.dispose();
          };
        })(this)
      }));
      return disposables.add(atom.commands.add('atom-text-editor', 'core:confirm', (function(_this) {
        return function(e) {
          disposables.dispose();
          if (panel != null) {
            panel.destroy();
          }
          GitStashSave(repo, {
            message: _this.commandEditor.getText()
          });
          return currentPane.activate();
        };
      })(this)));
    };

    return InputView;

  })(View);

  module.exports = InputView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3N0YXNoLW1lc3NhZ2Utdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBFQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLG1DQUFKLEVBQW9COztFQUVwQixZQUFBLEdBQWUsT0FBQSxDQUFRLDBCQUFSOztFQUVUOzs7Ozs7O0lBQ0osU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0gsS0FBQyxDQUFBLE9BQUQsQ0FBUyxlQUFULEVBQThCLElBQUEsY0FBQSxDQUFlO1lBQUEsSUFBQSxFQUFNLElBQU47WUFBWSxlQUFBLEVBQWlCLGVBQTdCO1dBQWYsQ0FBOUI7UUFERztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTDtJQURROzt3QkFJVixVQUFBLEdBQVksU0FBQyxJQUFEO0FBQ1YsVUFBQTtNQUFBLFdBQUEsR0FBYyxJQUFJO01BQ2xCLFdBQUEsR0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtNQUNkLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7UUFBQSxJQUFBLEVBQU0sSUFBTjtPQUE3QjtNQUNSLEtBQUssQ0FBQyxJQUFOLENBQUE7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLEtBQWYsQ0FBQTtNQUVBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0M7UUFBQSxhQUFBLEVBQWUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxDQUFEOztjQUNuRSxLQUFLLENBQUUsT0FBUCxDQUFBOztZQUNBLFdBQVcsQ0FBQyxRQUFaLENBQUE7bUJBQ0EsV0FBVyxDQUFDLE9BQVosQ0FBQTtVQUhtRTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZjtPQUF0QyxDQUFoQjthQUtBLFdBQVcsQ0FBQyxHQUFaLENBQWdCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFBc0MsY0FBdEMsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7VUFDcEUsV0FBVyxDQUFDLE9BQVosQ0FBQTs7WUFDQSxLQUFLLENBQUUsT0FBUCxDQUFBOztVQUNBLFlBQUEsQ0FBYSxJQUFiLEVBQW1CO1lBQUEsT0FBQSxFQUFTLEtBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBLENBQVQ7V0FBbkI7aUJBQ0EsV0FBVyxDQUFDLFFBQVosQ0FBQTtRQUpvRTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEQsQ0FBaEI7SUFaVTs7OztLQUxVOztFQXVCeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE1QmpCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuR2l0U3Rhc2hTYXZlID0gcmVxdWlyZSAnLi4vbW9kZWxzL2dpdC1zdGFzaC1zYXZlJ1xuXG5jbGFzcyBJbnB1dFZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgPT5cbiAgICAgIEBzdWJ2aWV3ICdjb21tYW5kRWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogJ1N0YXNoIG1lc3NhZ2UnKVxuXG4gIGluaXRpYWxpemU6IChyZXBvKSAtPlxuICAgIGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIHBhbmVsLnNob3coKVxuICAgIEBjb21tYW5kRWRpdG9yLmZvY3VzKClcblxuICAgIGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNhbmNlbCc6IChlKSA9PlxuICAgICAgcGFuZWw/LmRlc3Ryb3koKVxuICAgICAgY3VycmVudFBhbmUuYWN0aXZhdGUoKVxuICAgICAgZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgICBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20tdGV4dC1lZGl0b3InLCAnY29yZTpjb25maXJtJywgKGUpID0+XG4gICAgICBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICAgIHBhbmVsPy5kZXN0cm95KClcbiAgICAgIEdpdFN0YXNoU2F2ZShyZXBvLCBtZXNzYWdlOiBAY29tbWFuZEVkaXRvci5nZXRUZXh0KCkpXG4gICAgICBjdXJyZW50UGFuZS5hY3RpdmF0ZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gSW5wdXRWaWV3XG4iXX0=
