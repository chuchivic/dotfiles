(function() {
  var CompositeDisposable, Disposable, Ex, ExMode, ExState, GlobalExState, ref;

  GlobalExState = require('./global-ex-state');

  ExState = require('./ex-state');

  Ex = require('./ex');

  ref = require('event-kit'), Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  module.exports = ExMode = {
    activate: function(state) {
      this.globalExState = new GlobalExState;
      this.disposables = new CompositeDisposable;
      this.exStates = new WeakMap;
      return this.disposables.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var element, exState;
          if (editor.mini) {
            return;
          }
          element = atom.views.getView(editor);
          if (!_this.exStates.get(editor)) {
            exState = new ExState(element, _this.globalExState);
            _this.exStates.set(editor, exState);
            return _this.disposables.add(new Disposable(function() {
              return exState.destroy();
            }));
          }
        };
      })(this)));
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    provideEx: function() {
      return {
        registerCommand: Ex.registerCommand.bind(Ex),
        registerAlias: Ex.registerAlias.bind(Ex)
      };
    },
    consumeVim: function(vim) {
      this.vim = vim;
      return this.globalExState.setVim(vim);
    },
    consumeVimModePlus: function(vim) {
      return this.consumeVim(vim);
    },
    config: {
      splitbelow: {
        title: 'Split below',
        description: 'when splitting, split from below',
        type: 'boolean',
        "default": 'false'
      },
      splitright: {
        title: 'Split right',
        description: 'when splitting, split from right',
        type: 'boolean',
        "default": 'false'
      },
      gdefault: {
        title: 'Gdefault',
        description: 'When on, the ":substitute" flag \'g\' is default on',
        type: 'boolean',
        "default": 'false'
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZXgtbW9kZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSOztFQUNoQixPQUFBLEdBQVUsT0FBQSxDQUFRLFlBQVI7O0VBQ1YsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSOztFQUNMLE1BQW9DLE9BQUEsQ0FBUSxXQUFSLENBQXBDLEVBQUMsMkJBQUQsRUFBYTs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUFpQixNQUFBLEdBQ2Y7SUFBQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJO2FBRWhCLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFmLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO0FBQ2pELGNBQUE7VUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFqQjtBQUFBLG1CQUFBOztVQUVBLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsTUFBbkI7VUFFVixJQUFHLENBQUksS0FBQyxDQUFBLFFBQVEsQ0FBQyxHQUFWLENBQWMsTUFBZCxDQUFQO1lBQ0UsT0FBQSxHQUFjLElBQUEsT0FBQSxDQUNaLE9BRFksRUFFWixLQUFDLENBQUEsYUFGVztZQUtkLEtBQUMsQ0FBQSxRQUFRLENBQUMsR0FBVixDQUFjLE1BQWQsRUFBc0IsT0FBdEI7bUJBRUEsS0FBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQXFCLElBQUEsVUFBQSxDQUFXLFNBQUE7cUJBQzlCLE9BQU8sQ0FBQyxPQUFSLENBQUE7WUFEOEIsQ0FBWCxDQUFyQixFQVJGOztRQUxpRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBakI7SUFMUSxDQUFWO0lBcUJBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUE7SUFEVSxDQXJCWjtJQXdCQSxTQUFBLEVBQVcsU0FBQTthQUNUO1FBQUEsZUFBQSxFQUFpQixFQUFFLENBQUMsZUFBZSxDQUFDLElBQW5CLENBQXdCLEVBQXhCLENBQWpCO1FBQ0EsYUFBQSxFQUFlLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBakIsQ0FBc0IsRUFBdEIsQ0FEZjs7SUFEUyxDQXhCWDtJQTRCQSxVQUFBLEVBQVksU0FBQyxHQUFEO01BQ1YsSUFBQyxDQUFBLEdBQUQsR0FBTzthQUNQLElBQUMsQ0FBQSxhQUFhLENBQUMsTUFBZixDQUFzQixHQUF0QjtJQUZVLENBNUJaO0lBZ0NBLGtCQUFBLEVBQW9CLFNBQUMsR0FBRDthQUNsQixJQUFJLENBQUMsVUFBTCxDQUFnQixHQUFoQjtJQURrQixDQWhDcEI7SUFtQ0EsTUFBQSxFQUNFO01BQUEsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxXQUFBLEVBQWEsa0NBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtPQURGO01BS0EsVUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGFBQVA7UUFDQSxXQUFBLEVBQWEsa0NBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtPQU5GO01BVUEsUUFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLFVBQVA7UUFDQSxXQUFBLEVBQWEscURBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FIVDtPQVhGO0tBcENGOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsiR2xvYmFsRXhTdGF0ZSA9IHJlcXVpcmUgJy4vZ2xvYmFsLWV4LXN0YXRlJ1xuRXhTdGF0ZSA9IHJlcXVpcmUgJy4vZXgtc3RhdGUnXG5FeCA9IHJlcXVpcmUgJy4vZXgnXG57RGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5cbm1vZHVsZS5leHBvcnRzID0gRXhNb2RlID1cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZ2xvYmFsRXhTdGF0ZSA9IG5ldyBHbG9iYWxFeFN0YXRlXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZXhTdGF0ZXMgPSBuZXcgV2Vha01hcFxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIHJldHVybiBpZiBlZGl0b3IubWluaVxuXG4gICAgICBlbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgICAgaWYgbm90IEBleFN0YXRlcy5nZXQoZWRpdG9yKVxuICAgICAgICBleFN0YXRlID0gbmV3IEV4U3RhdGUoXG4gICAgICAgICAgZWxlbWVudCxcbiAgICAgICAgICBAZ2xvYmFsRXhTdGF0ZVxuICAgICAgICApXG5cbiAgICAgICAgQGV4U3RhdGVzLnNldChlZGl0b3IsIGV4U3RhdGUpXG5cbiAgICAgICAgQGRpc3Bvc2FibGVzLmFkZCBuZXcgRGlzcG9zYWJsZSA9PlxuICAgICAgICAgIGV4U3RhdGUuZGVzdHJveSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgcHJvdmlkZUV4OiAtPlxuICAgIHJlZ2lzdGVyQ29tbWFuZDogRXgucmVnaXN0ZXJDb21tYW5kLmJpbmQoRXgpXG4gICAgcmVnaXN0ZXJBbGlhczogRXgucmVnaXN0ZXJBbGlhcy5iaW5kKEV4KVxuXG4gIGNvbnN1bWVWaW06ICh2aW0pIC0+XG4gICAgQHZpbSA9IHZpbVxuICAgIEBnbG9iYWxFeFN0YXRlLnNldFZpbSh2aW0pXG5cbiAgY29uc3VtZVZpbU1vZGVQbHVzOiAodmltKSAtPlxuICAgIHRoaXMuY29uc3VtZVZpbSh2aW0pXG5cbiAgY29uZmlnOlxuICAgIHNwbGl0YmVsb3c6XG4gICAgICB0aXRsZTogJ1NwbGl0IGJlbG93J1xuICAgICAgZGVzY3JpcHRpb246ICd3aGVuIHNwbGl0dGluZywgc3BsaXQgZnJvbSBiZWxvdydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogJ2ZhbHNlJ1xuICAgIHNwbGl0cmlnaHQ6XG4gICAgICB0aXRsZTogJ1NwbGl0IHJpZ2h0J1xuICAgICAgZGVzY3JpcHRpb246ICd3aGVuIHNwbGl0dGluZywgc3BsaXQgZnJvbSByaWdodCdcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogJ2ZhbHNlJ1xuICAgIGdkZWZhdWx0OlxuICAgICAgdGl0bGU6ICdHZGVmYXVsdCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hlbiBvbiwgdGhlIFwiOnN1YnN0aXR1dGVcIiBmbGFnIFxcJ2dcXCcgaXMgZGVmYXVsdCBvbidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogJ2ZhbHNlJ1xuIl19
