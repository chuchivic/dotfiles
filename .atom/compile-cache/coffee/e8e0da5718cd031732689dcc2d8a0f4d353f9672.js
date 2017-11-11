(function() {
  var ExNormalModeInputElement, Input, ViewModel;

  ExNormalModeInputElement = require('./ex-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      ref = this.command, this.editor = ref.editor, this.exState = ref.exState;
      this.view = new ExNormalModeInputElement().initialize(this, opts);
      this.editor.normalModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
      this.done = false;
    }

    ViewModel.prototype.confirm = function(view) {
      this.exState.pushOperations(new Input(this.view.value));
      return this.done = true;
    };

    ViewModel.prototype.cancel = function(view) {
      if (!this.done) {
        this.exState.pushOperations(new Input(''));
        return this.done = true;
      }
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvdmlldy1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLHdCQUFBLEdBQTJCLE9BQUEsQ0FBUSxnQ0FBUjs7RUFFckI7SUFDUyxtQkFBQyxPQUFELEVBQVcsSUFBWDtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsVUFBRDs7UUFBVSxPQUFLOztNQUMzQixNQUFzQixJQUFDLENBQUEsT0FBdkIsRUFBQyxJQUFDLENBQUEsYUFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGNBQUE7TUFFWCxJQUFDLENBQUEsSUFBRCxHQUFZLElBQUEsd0JBQUEsQ0FBQSxDQUEwQixDQUFDLFVBQTNCLENBQXNDLElBQXRDLEVBQXlDLElBQXpDO01BQ1osSUFBQyxDQUFBLE1BQU0sQ0FBQyxtQkFBUixHQUE4QixJQUFDLENBQUE7TUFDL0IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxrQkFBVCxDQUE0QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7TUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBTkc7O3dCQVFiLE9BQUEsR0FBUyxTQUFDLElBQUQ7TUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBNEIsSUFBQSxLQUFBLENBQU0sSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFaLENBQTVCO2FBQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQUZEOzt3QkFJVCxNQUFBLEdBQVEsU0FBQyxJQUFEO01BQ04sSUFBQSxDQUFPLElBQUMsQ0FBQSxJQUFSO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQTRCLElBQUEsS0FBQSxDQUFNLEVBQU4sQ0FBNUI7ZUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRLEtBRlY7O0lBRE07Ozs7OztFQUtKO0lBQ1MsZUFBQyxVQUFEO01BQUMsSUFBQyxDQUFBLGFBQUQ7SUFBRDs7Ozs7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixXQUFBLFNBRGU7SUFDSixPQUFBLEtBREk7O0FBdkJqQiIsInNvdXJjZXNDb250ZW50IjpbIkV4Tm9ybWFsTW9kZUlucHV0RWxlbWVudCA9IHJlcXVpcmUgJy4vZXgtbm9ybWFsLW1vZGUtaW5wdXQtZWxlbWVudCdcblxuY2xhc3MgVmlld01vZGVsXG4gIGNvbnN0cnVjdG9yOiAoQGNvbW1hbmQsIG9wdHM9e30pIC0+XG4gICAge0BlZGl0b3IsIEBleFN0YXRlfSA9IEBjb21tYW5kXG5cbiAgICBAdmlldyA9IG5ldyBFeE5vcm1hbE1vZGVJbnB1dEVsZW1lbnQoKS5pbml0aWFsaXplKEAsIG9wdHMpXG4gICAgQGVkaXRvci5ub3JtYWxNb2RlSW5wdXRWaWV3ID0gQHZpZXdcbiAgICBAZXhTdGF0ZS5vbkRpZEZhaWxUb0V4ZWN1dGUgPT4gQHZpZXcucmVtb3ZlKClcbiAgICBAZG9uZSA9IGZhbHNlXG5cbiAgY29uZmlybTogKHZpZXcpIC0+XG4gICAgQGV4U3RhdGUucHVzaE9wZXJhdGlvbnMobmV3IElucHV0KEB2aWV3LnZhbHVlKSlcbiAgICBAZG9uZSA9IHRydWVcblxuICBjYW5jZWw6ICh2aWV3KSAtPlxuICAgIHVubGVzcyBAZG9uZVxuICAgICAgQGV4U3RhdGUucHVzaE9wZXJhdGlvbnMobmV3IElucHV0KCcnKSlcbiAgICAgIEBkb25lID0gdHJ1ZVxuXG5jbGFzcyBJbnB1dFxuICBjb25zdHJ1Y3RvcjogKEBjaGFyYWN0ZXJzKSAtPlxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVmlld01vZGVsLCBJbnB1dFxufVxuIl19
