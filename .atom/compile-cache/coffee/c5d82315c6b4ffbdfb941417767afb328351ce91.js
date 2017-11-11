(function() {
  var CompositeDisposable, GitTimeMachine, GitTimeMachineView;

  GitTimeMachineView = require('./git-time-machine-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = GitTimeMachine = {
    gitTimeMachineView: null,
    timelinePanel: null,
    subscriptions: null,
    activate: function(state) {
      this.gitTimeMachineView = new GitTimeMachineView(state.gitTimeMachineViewState);
      this.timelinePanel = atom.workspace.addBottomPanel({
        item: this.gitTimeMachineView.getElement(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'git-time-machine:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          return _this._onDidChangeActivePaneItem();
        };
      })(this));
    },
    deactivate: function() {
      this.timelinePanel.destroy();
      this.subscriptions.dispose();
      return this.gitTimeMachineView.destroy();
    },
    serialize: function() {
      return {
        gitTimeMachineViewState: this.gitTimeMachineView.serialize()
      };
    },
    toggle: function() {
      if (this.timelinePanel.isVisible()) {
        this.gitTimeMachineView.hide();
        return this.timelinePanel.hide();
      } else {
        this.timelinePanel.show();
        this.gitTimeMachineView.show();
        return this.gitTimeMachineView.setEditor(atom.workspace.getActiveTextEditor());
      }
    },
    _onDidChangeActivePaneItem: function(editor) {
      editor = atom.workspace.getActiveTextEditor();
      if (this.timelinePanel.isVisible()) {
        this.gitTimeMachineView.setEditor(editor);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9saWIvZ2l0LXRpbWUtbWFjaGluZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSx5QkFBUjs7RUFDcEIsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUFpQixjQUFBLEdBQ2Y7SUFBQSxrQkFBQSxFQUFvQixJQUFwQjtJQUNBLGFBQUEsRUFBZSxJQURmO0lBRUEsYUFBQSxFQUFlLElBRmY7SUFJQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLGtCQUFELEdBQTBCLElBQUEsa0JBQUEsQ0FBbUIsS0FBSyxDQUFDLHVCQUF6QjtNQUMxQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7UUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLGtCQUFrQixDQUFDLFVBQXBCLENBQUEsQ0FBTjtRQUF3QyxPQUFBLEVBQVMsS0FBakQ7T0FBOUI7TUFHakIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUdyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLHlCQUFBLEVBQTJCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQjtPQUFwQyxDQUFuQjthQUNBLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQWYsQ0FBeUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQVksS0FBQyxDQUFBLDBCQUFELENBQUE7UUFBWjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7SUFUUSxDQUpWO0lBZ0JBLFVBQUEsRUFBWSxTQUFBO01BQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTthQUNBLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxPQUFwQixDQUFBO0lBSFUsQ0FoQlo7SUFzQkEsU0FBQSxFQUFXLFNBQUE7YUFDVDtRQUFBLHVCQUFBLEVBQXlCLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxTQUFwQixDQUFBLENBQXpCOztJQURTLENBdEJYO0lBMEJBLE1BQUEsRUFBUSxTQUFBO01BRU4sSUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLENBQUE7ZUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBQSxFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBO1FBQ0EsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLENBQUE7ZUFDQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsU0FBcEIsQ0FBOEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQTlCLEVBTkY7O0lBRk0sQ0ExQlI7SUFxQ0EsMEJBQUEsRUFBNEIsU0FBQyxNQUFEO01BQzFCLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFDVCxJQUFHLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsa0JBQWtCLENBQUMsU0FBcEIsQ0FBOEIsTUFBOUIsRUFERjs7SUFGMEIsQ0FyQzVCOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsiR2l0VGltZU1hY2hpbmVWaWV3ID0gcmVxdWlyZSAnLi9naXQtdGltZS1tYWNoaW5lLXZpZXcnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdpdFRpbWVNYWNoaW5lID1cbiAgZ2l0VGltZU1hY2hpbmVWaWV3OiBudWxsXG4gIHRpbWVsaW5lUGFuZWw6IG51bGxcbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGdpdFRpbWVNYWNoaW5lVmlldyA9IG5ldyBHaXRUaW1lTWFjaGluZVZpZXcgc3RhdGUuZ2l0VGltZU1hY2hpbmVWaWV3U3RhdGVcbiAgICBAdGltZWxpbmVQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IEBnaXRUaW1lTWFjaGluZVZpZXcuZ2V0RWxlbWVudCgpLCB2aXNpYmxlOiBmYWxzZSlcblxuICAgICMgRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICAjIFJlZ2lzdGVyIGNvbW1hbmQgdGhhdCB0b2dnbGVzIHRoaXMgdmlld1xuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnZ2l0LXRpbWUtbWFjaGluZTp0b2dnbGUnOiA9PiBAdG9nZ2xlKClcbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtIChlZGl0b3IpID0+IEBfb25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSgpXG5cblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEB0aW1lbGluZVBhbmVsLmRlc3Ryb3koKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBnaXRUaW1lTWFjaGluZVZpZXcuZGVzdHJveSgpXG5cblxuICBzZXJpYWxpemU6IC0+XG4gICAgZ2l0VGltZU1hY2hpbmVWaWV3U3RhdGU6IEBnaXRUaW1lTWFjaGluZVZpZXcuc2VyaWFsaXplKClcblxuXG4gIHRvZ2dsZTogLT5cbiAgICAjIGNvbnNvbGUubG9nICdHaXRUaW1lTWFjaGluZSB3YXMgb3BlbmVkISdcbiAgICBpZiBAdGltZWxpbmVQYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGdpdFRpbWVNYWNoaW5lVmlldy5oaWRlKClcbiAgICAgIEB0aW1lbGluZVBhbmVsLmhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEB0aW1lbGluZVBhbmVsLnNob3coKVxuICAgICAgQGdpdFRpbWVNYWNoaW5lVmlldy5zaG93KClcbiAgICAgIEBnaXRUaW1lTWFjaGluZVZpZXcuc2V0RWRpdG9yIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG5cbiAgX29uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW06IChlZGl0b3IpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgQHRpbWVsaW5lUGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBnaXRUaW1lTWFjaGluZVZpZXcuc2V0RWRpdG9yKGVkaXRvcilcbiAgICByZXR1cm5cbiJdfQ==
