(function() {
  var AutoComplete, Ex, ExViewModel, Input, ViewModel, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('./view-model'), ViewModel = ref.ViewModel, Input = ref.Input;

  AutoComplete = require('./autocomplete');

  Ex = require('./ex');

  module.exports = ExViewModel = (function(superClass) {
    extend(ExViewModel, superClass);

    function ExViewModel(exCommand, withSelection) {
      this.exCommand = exCommand;
      this.confirm = bind(this.confirm, this);
      this.decreaseHistoryEx = bind(this.decreaseHistoryEx, this);
      this.increaseHistoryEx = bind(this.increaseHistoryEx, this);
      this.tabAutocomplete = bind(this.tabAutocomplete, this);
      ExViewModel.__super__.constructor.call(this, this.exCommand, {
        "class": 'command'
      });
      this.historyIndex = -1;
      if (withSelection) {
        this.view.editorElement.getModel().setText("'<,'>");
      }
      this.view.editorElement.addEventListener('keydown', this.tabAutocomplete);
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistoryEx);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistoryEx);
      this.autoComplete = new AutoComplete(Ex.getCommands());
    }

    ExViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index).value);
    };

    ExViewModel.prototype.history = function(index) {
      return this.exState.getExHistoryItem(index);
    };

    ExViewModel.prototype.tabAutocomplete = function(event) {
      var completed;
      if (event.keyCode === 9) {
        event.stopPropagation();
        event.preventDefault();
        completed = this.autoComplete.getAutocomplete(this.view.editorElement.getModel().getText());
        if (completed) {
          this.view.editorElement.getModel().setText(completed);
        }
        return false;
      } else {
        return this.autoComplete.resetCompletion();
      }
    };

    ExViewModel.prototype.increaseHistoryEx = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.decreaseHistoryEx = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    ExViewModel.prototype.confirm = function(view) {
      this.value = this.view.value;
      this.exState.pushExHistory(this);
      return ExViewModel.__super__.confirm.call(this, view);
    };

    return ExViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZXgtdmlldy1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9EQUFBO0lBQUE7Ozs7RUFBQSxNQUFxQixPQUFBLENBQVEsY0FBUixDQUFyQixFQUFDLHlCQUFELEVBQVk7O0VBQ1osWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZixFQUFBLEdBQUssT0FBQSxDQUFRLE1BQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ1MscUJBQUMsU0FBRCxFQUFhLGFBQWI7TUFBQyxJQUFDLENBQUEsWUFBRDs7Ozs7TUFDWiw2Q0FBTSxJQUFDLENBQUEsU0FBUCxFQUFrQjtRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDtPQUFsQjtNQUNBLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUM7TUFFakIsSUFBRyxhQUFIO1FBQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBcEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDLE9BQXZDLEVBREY7O01BR0EsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQXBCLENBQXFDLFNBQXJDLEVBQWdELElBQUMsQ0FBQSxlQUFqRDtNQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQXhCLEVBQXVDLGNBQXZDLEVBQXVELElBQUMsQ0FBQSxpQkFBeEQ7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUF4QixFQUF1QyxnQkFBdkMsRUFBeUQsSUFBQyxDQUFBLGlCQUExRDtNQUVBLElBQUMsQ0FBQSxZQUFELEdBQW9CLElBQUEsWUFBQSxDQUFhLEVBQUUsQ0FBQyxXQUFILENBQUEsQ0FBYjtJQVhUOzswQkFhYixjQUFBLEdBQWdCLFNBQUMsS0FBRDthQUNkLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQsQ0FBZSxDQUFDLEtBQXZEO0lBRGM7OzBCQUdoQixPQUFBLEdBQVMsU0FBQyxLQUFEO2FBQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixLQUExQjtJQURPOzswQkFHVCxlQUFBLEdBQWlCLFNBQUMsS0FBRDtBQUNmLFVBQUE7TUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFOLEtBQWlCLENBQXBCO1FBQ0UsS0FBSyxDQUFDLGVBQU4sQ0FBQTtRQUNBLEtBQUssQ0FBQyxjQUFOLENBQUE7UUFFQSxTQUFBLEdBQVksSUFBQyxDQUFBLFlBQVksQ0FBQyxlQUFkLENBQThCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIsQ0FBQyxPQUEvQixDQUFBLENBQTlCO1FBQ1osSUFBRyxTQUFIO1VBQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBcEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDLFNBQXZDLEVBREY7O0FBR0EsZUFBTyxNQVJUO09BQUEsTUFBQTtlQVVFLElBQUMsQ0FBQSxZQUFZLENBQUMsZUFBZCxDQUFBLEVBVkY7O0lBRGU7OzBCQWFqQixpQkFBQSxHQUFtQixTQUFBO01BQ2pCLElBQUcsMkNBQUg7UUFDRSxJQUFDLENBQUEsWUFBRCxJQUFpQjtlQUNqQixJQUFDLENBQUEsY0FBRCxDQUFnQixJQUFDLENBQUEsWUFBakIsRUFGRjs7SUFEaUI7OzBCQUtuQixpQkFBQSxHQUFtQixTQUFBO01BQ2pCLElBQUcsSUFBQyxDQUFBLFlBQUQsSUFBaUIsQ0FBcEI7UUFFRSxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFDO2VBQ2pCLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxFQUF2QyxFQUhGO09BQUEsTUFBQTtRQUtFLElBQUMsQ0FBQSxZQUFELElBQWlCO2VBQ2pCLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxZQUFqQixFQU5GOztJQURpQjs7MEJBU25CLE9BQUEsR0FBUyxTQUFDLElBQUQ7TUFDUCxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7TUFDZixJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBdUIsSUFBdkI7YUFDQSx5Q0FBTSxJQUFOO0lBSE87Ozs7S0EvQ2U7QUFMMUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld01vZGVsLCBJbnB1dH0gPSByZXF1aXJlICcuL3ZpZXctbW9kZWwnXG5BdXRvQ29tcGxldGUgPSByZXF1aXJlICcuL2F1dG9jb21wbGV0ZSdcbkV4ID0gcmVxdWlyZSAnLi9leCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRXhWaWV3TW9kZWwgZXh0ZW5kcyBWaWV3TW9kZWxcbiAgY29uc3RydWN0b3I6IChAZXhDb21tYW5kLCB3aXRoU2VsZWN0aW9uKSAtPlxuICAgIHN1cGVyKEBleENvbW1hbmQsIGNsYXNzOiAnY29tbWFuZCcpXG4gICAgQGhpc3RvcnlJbmRleCA9IC0xXG5cbiAgICBpZiB3aXRoU2VsZWN0aW9uXG4gICAgICBAdmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0VGV4dChcIic8LCc+XCIpXG5cbiAgICBAdmlldy5lZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBAdGFiQXV0b2NvbXBsZXRlKVxuICAgIGF0b20uY29tbWFuZHMuYWRkKEB2aWV3LmVkaXRvckVsZW1lbnQsICdjb3JlOm1vdmUtdXAnLCBAaW5jcmVhc2VIaXN0b3J5RXgpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoQHZpZXcuZWRpdG9yRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJywgQGRlY3JlYXNlSGlzdG9yeUV4KVxuXG4gICAgQGF1dG9Db21wbGV0ZSA9IG5ldyBBdXRvQ29tcGxldGUoRXguZ2V0Q29tbWFuZHMoKSlcblxuICByZXN0b3JlSGlzdG9yeTogKGluZGV4KSAtPlxuICAgIEB2aWV3LmVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRUZXh0KEBoaXN0b3J5KGluZGV4KS52YWx1ZSlcblxuICBoaXN0b3J5OiAoaW5kZXgpIC0+XG4gICAgQGV4U3RhdGUuZ2V0RXhIaXN0b3J5SXRlbShpbmRleClcblxuICB0YWJBdXRvY29tcGxldGU6IChldmVudCkgPT5cbiAgICBpZiBldmVudC5rZXlDb2RlID09IDlcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGNvbXBsZXRlZCA9IEBhdXRvQ29tcGxldGUuZ2V0QXV0b2NvbXBsZXRlKEB2aWV3LmVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRUZXh0KCkpXG4gICAgICBpZiBjb21wbGV0ZWRcbiAgICAgICAgQHZpZXcuZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLnNldFRleHQoY29tcGxldGVkKVxuXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICBlbHNlXG4gICAgICBAYXV0b0NvbXBsZXRlLnJlc2V0Q29tcGxldGlvbigpXG5cbiAgaW5jcmVhc2VIaXN0b3J5RXg6ID0+XG4gICAgaWYgQGhpc3RvcnkoQGhpc3RvcnlJbmRleCArIDEpP1xuICAgICAgQGhpc3RvcnlJbmRleCArPSAxXG4gICAgICBAcmVzdG9yZUhpc3RvcnkoQGhpc3RvcnlJbmRleClcblxuICBkZWNyZWFzZUhpc3RvcnlFeDogPT5cbiAgICBpZiBAaGlzdG9yeUluZGV4IDw9IDBcbiAgICAgICMgZ2V0IHVzIGJhY2sgdG8gYSBjbGVhbiBzbGF0ZVxuICAgICAgQGhpc3RvcnlJbmRleCA9IC0xXG4gICAgICBAdmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0VGV4dCgnJylcbiAgICBlbHNlXG4gICAgICBAaGlzdG9yeUluZGV4IC09IDFcbiAgICAgIEByZXN0b3JlSGlzdG9yeShAaGlzdG9yeUluZGV4KVxuXG4gIGNvbmZpcm06ICh2aWV3KSA9PlxuICAgIEB2YWx1ZSA9IEB2aWV3LnZhbHVlXG4gICAgQGV4U3RhdGUucHVzaEV4SGlzdG9yeShAKVxuICAgIHN1cGVyKHZpZXcpXG4iXX0=
