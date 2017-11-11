(function() {
  var CompositeDisposable, Disposable, GlobalVimState, StatusBarManager, VimState, ref, settings;

  ref = require('event-kit'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  StatusBarManager = require('./status-bar-manager');

  GlobalVimState = require('./global-vim-state');

  VimState = require('./vim-state');

  settings = require('./settings');

  module.exports = {
    config: settings.config,
    activate: function(state) {
      this.disposables = new CompositeDisposable;
      this.globalVimState = new GlobalVimState;
      this.statusBarManager = new StatusBarManager;
      this.vimStates = new Set;
      this.vimStatesByEditor = new WeakMap;
      this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var vimState;
          if (editor.isMini() || _this.getEditorState(editor)) {
            return;
          }
          vimState = new VimState(atom.views.getView(editor), _this.statusBarManager, _this.globalVimState);
          _this.vimStates.add(vimState);
          _this.vimStatesByEditor.set(editor, vimState);
          return vimState.onDidDestroy(function() {
            return _this.vimStates["delete"](vimState);
          });
        };
      })(this)));
      this.disposables.add(atom.workspace.onDidChangeActivePaneItem(this.updateToPaneItem.bind(this)));
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.vimStates.forEach(function(vimState) {
            return vimState.destroy();
          });
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    getGlobalState: function() {
      return this.globalVimState;
    },
    getEditorState: function(editor) {
      return this.vimStatesByEditor.get(editor);
    },
    consumeStatusBar: function(statusBar) {
      this.statusBarManager.initialize(statusBar);
      this.statusBarManager.attach();
      return this.disposables.add(new Disposable((function(_this) {
        return function() {
          return _this.statusBarManager.detach();
        };
      })(this)));
    },
    updateToPaneItem: function(item) {
      var vimState;
      if (item != null) {
        vimState = this.getEditorState(item);
      }
      if (vimState != null) {
        return vimState.updateStatusBar();
      } else {
        return this.statusBarManager.hide();
      }
    },
    provideVimMode: function() {
      return {
        getGlobalState: this.getGlobalState.bind(this),
        getEditorState: this.getEditorState.bind(this)
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpbS1tb2RlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLFdBQVIsQ0FBcEMsRUFBQywyQkFBRCxFQUFhOztFQUNiLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxzQkFBUjs7RUFDbkIsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVI7O0VBQ2pCLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBRVgsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxRQUFRLENBQUMsTUFBakI7SUFFQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUk7TUFDdEIsSUFBQyxDQUFBLGdCQUFELEdBQW9CLElBQUk7TUFFeEIsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJO01BQ2pCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFJO01BRXpCLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO0FBQ2pELGNBQUE7VUFBQSxJQUFVLE1BQU0sQ0FBQyxNQUFQLENBQUEsQ0FBQSxJQUFtQixLQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixDQUE3QjtBQUFBLG1CQUFBOztVQUVBLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FDYixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkIsQ0FEYSxFQUViLEtBQUMsQ0FBQSxnQkFGWSxFQUdiLEtBQUMsQ0FBQSxjQUhZO1VBTWYsS0FBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsUUFBZjtVQUNBLEtBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxHQUFuQixDQUF1QixNQUF2QixFQUErQixRQUEvQjtpQkFDQSxRQUFRLENBQUMsWUFBVCxDQUFzQixTQUFBO21CQUFHLEtBQUMsQ0FBQSxTQUFTLEVBQUMsTUFBRCxFQUFWLENBQWtCLFFBQWxCO1VBQUgsQ0FBdEI7UUFYaUQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWpCO01BYUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQWYsQ0FBeUMsSUFBQyxDQUFBLGdCQUFnQixDQUFDLElBQWxCLENBQXVCLElBQXZCLENBQXpDLENBQWpCO2FBRUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQXFCLElBQUEsVUFBQSxDQUFXLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDOUIsS0FBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLFNBQUMsUUFBRDttQkFBYyxRQUFRLENBQUMsT0FBVCxDQUFBO1VBQWQsQ0FBbkI7UUFEOEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVgsQ0FBckI7SUF2QlEsQ0FGVjtJQTRCQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRFUsQ0E1Qlo7SUErQkEsY0FBQSxFQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBO0lBRGEsQ0EvQmhCO0lBa0NBLGNBQUEsRUFBZ0IsU0FBQyxNQUFEO2FBQ2QsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLE1BQXZCO0lBRGMsQ0FsQ2hCO0lBcUNBLGdCQUFBLEVBQWtCLFNBQUMsU0FBRDtNQUNoQixJQUFDLENBQUEsZ0JBQWdCLENBQUMsVUFBbEIsQ0FBNkIsU0FBN0I7TUFDQSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsTUFBbEIsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFxQixJQUFBLFVBQUEsQ0FBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQzlCLEtBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxNQUFsQixDQUFBO1FBRDhCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLENBQXJCO0lBSGdCLENBckNsQjtJQTJDQSxnQkFBQSxFQUFrQixTQUFDLElBQUQ7QUFDaEIsVUFBQTtNQUFBLElBQW9DLFlBQXBDO1FBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQWhCLEVBQVg7O01BQ0EsSUFBRyxnQkFBSDtlQUNFLFFBQVEsQ0FBQyxlQUFULENBQUEsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsZ0JBQWdCLENBQUMsSUFBbEIsQ0FBQSxFQUhGOztJQUZnQixDQTNDbEI7SUFrREEsY0FBQSxFQUFnQixTQUFBO2FBQ2Q7UUFBQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBaEI7UUFDQSxjQUFBLEVBQWdCLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FEaEI7O0lBRGMsQ0FsRGhCOztBQVBGIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnZXZlbnQta2l0J1xuU3RhdHVzQmFyTWFuYWdlciA9IHJlcXVpcmUgJy4vc3RhdHVzLWJhci1tYW5hZ2VyJ1xuR2xvYmFsVmltU3RhdGUgPSByZXF1aXJlICcuL2dsb2JhbC12aW0tc3RhdGUnXG5WaW1TdGF0ZSA9IHJlcXVpcmUgJy4vdmltLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzogc2V0dGluZ3MuY29uZmlnXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBnbG9iYWxWaW1TdGF0ZSA9IG5ldyBHbG9iYWxWaW1TdGF0ZVxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyID0gbmV3IFN0YXR1c0Jhck1hbmFnZXJcblxuICAgIEB2aW1TdGF0ZXMgPSBuZXcgU2V0XG4gICAgQHZpbVN0YXRlc0J5RWRpdG9yID0gbmV3IFdlYWtNYXBcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICByZXR1cm4gaWYgZWRpdG9yLmlzTWluaSgpIG9yIEBnZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG5cbiAgICAgIHZpbVN0YXRlID0gbmV3IFZpbVN0YXRlKFxuICAgICAgICBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKSxcbiAgICAgICAgQHN0YXR1c0Jhck1hbmFnZXIsXG4gICAgICAgIEBnbG9iYWxWaW1TdGF0ZVxuICAgICAgKVxuXG4gICAgICBAdmltU3RhdGVzLmFkZCh2aW1TdGF0ZSlcbiAgICAgIEB2aW1TdGF0ZXNCeUVkaXRvci5zZXQoZWRpdG9yLCB2aW1TdGF0ZSlcbiAgICAgIHZpbVN0YXRlLm9uRGlkRGVzdHJveSA9PiBAdmltU3RhdGVzLmRlbGV0ZSh2aW1TdGF0ZSlcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSBAdXBkYXRlVG9QYW5lSXRlbS5iaW5kKHRoaXMpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIG5ldyBEaXNwb3NhYmxlID0+XG4gICAgICBAdmltU3RhdGVzLmZvckVhY2ggKHZpbVN0YXRlKSAtPiB2aW1TdGF0ZS5kZXN0cm95KClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBnZXRHbG9iYWxTdGF0ZTogLT5cbiAgICBAZ2xvYmFsVmltU3RhdGVcblxuICBnZXRFZGl0b3JTdGF0ZTogKGVkaXRvcikgLT5cbiAgICBAdmltU3RhdGVzQnlFZGl0b3IuZ2V0KGVkaXRvcilcblxuICBjb25zdW1lU3RhdHVzQmFyOiAoc3RhdHVzQmFyKSAtPlxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyLmluaXRpYWxpemUoc3RhdHVzQmFyKVxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyLmF0dGFjaCgpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgQHN0YXR1c0Jhck1hbmFnZXIuZGV0YWNoKClcblxuICB1cGRhdGVUb1BhbmVJdGVtOiAoaXRlbSkgLT5cbiAgICB2aW1TdGF0ZSA9IEBnZXRFZGl0b3JTdGF0ZShpdGVtKSBpZiBpdGVtP1xuICAgIGlmIHZpbVN0YXRlP1xuICAgICAgdmltU3RhdGUudXBkYXRlU3RhdHVzQmFyKClcbiAgICBlbHNlXG4gICAgICBAc3RhdHVzQmFyTWFuYWdlci5oaWRlKClcblxuICBwcm92aWRlVmltTW9kZTogLT5cbiAgICBnZXRHbG9iYWxTdGF0ZTogQGdldEdsb2JhbFN0YXRlLmJpbmQodGhpcylcbiAgICBnZXRFZGl0b3JTdGF0ZTogQGdldEVkaXRvclN0YXRlLmJpbmQodGhpcylcbiJdfQ==
