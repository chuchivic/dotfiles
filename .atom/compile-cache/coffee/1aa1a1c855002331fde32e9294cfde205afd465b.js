(function() {
  var SearchViewModel, ViewModel,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ViewModel = require('./view-model').ViewModel;

  module.exports = SearchViewModel = (function(superClass) {
    extend(SearchViewModel, superClass);

    function SearchViewModel(searchMotion) {
      this.searchMotion = searchMotion;
      this.confirm = bind(this.confirm, this);
      this.decreaseHistorySearch = bind(this.decreaseHistorySearch, this);
      this.increaseHistorySearch = bind(this.increaseHistorySearch, this);
      SearchViewModel.__super__.constructor.call(this, this.searchMotion, {
        "class": 'search'
      });
      this.historyIndex = -1;
      atom.commands.add(this.view.editorElement, 'core:move-up', this.increaseHistorySearch);
      atom.commands.add(this.view.editorElement, 'core:move-down', this.decreaseHistorySearch);
    }

    SearchViewModel.prototype.restoreHistory = function(index) {
      return this.view.editorElement.getModel().setText(this.history(index));
    };

    SearchViewModel.prototype.history = function(index) {
      return this.vimState.getSearchHistoryItem(index);
    };

    SearchViewModel.prototype.increaseHistorySearch = function() {
      if (this.history(this.historyIndex + 1) != null) {
        this.historyIndex += 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    SearchViewModel.prototype.decreaseHistorySearch = function() {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1;
        return this.view.editorElement.getModel().setText('');
      } else {
        this.historyIndex -= 1;
        return this.restoreHistory(this.historyIndex);
      }
    };

    SearchViewModel.prototype.confirm = function(view) {
      var lastSearch, repeatChar;
      repeatChar = this.searchMotion.initiallyReversed ? '?' : '/';
      if (this.view.value === '' || this.view.value === repeatChar) {
        lastSearch = this.history(0);
        if (lastSearch != null) {
          this.view.value = lastSearch;
        } else {
          this.view.value = '';
          atom.beep();
        }
      }
      SearchViewModel.__super__.confirm.call(this, view);
      return this.vimState.pushSearchHistory(this.view.value);
    };

    SearchViewModel.prototype.update = function(reverse) {
      if (reverse) {
        this.view.classList.add('reverse-search-input');
        return this.view.classList.remove('search-input');
      } else {
        this.view.classList.add('search-input');
        return this.view.classList.remove('reverse-search-input');
      }
    };

    return SearchViewModel;

  })(ViewModel);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpZXctbW9kZWxzL3NlYXJjaC12aWV3LW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEJBQUE7SUFBQTs7OztFQUFDLFlBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWQsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ1MseUJBQUMsWUFBRDtNQUFDLElBQUMsQ0FBQSxlQUFEOzs7O01BQ1osaURBQU0sSUFBQyxDQUFBLFlBQVAsRUFBcUI7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7T0FBckI7TUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixDQUFDO01BRWpCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsSUFBSSxDQUFDLGFBQXhCLEVBQXVDLGNBQXZDLEVBQXVELElBQUMsQ0FBQSxxQkFBeEQ7TUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUF4QixFQUF1QyxnQkFBdkMsRUFBeUQsSUFBQyxDQUFBLHFCQUExRDtJQUxXOzs4QkFPYixjQUFBLEdBQWdCLFNBQUMsS0FBRDthQUNkLElBQUMsQ0FBQSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQXBCLENBQUEsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxJQUFDLENBQUEsT0FBRCxDQUFTLEtBQVQsQ0FBdkM7SUFEYzs7OEJBR2hCLE9BQUEsR0FBUyxTQUFDLEtBQUQ7YUFDUCxJQUFDLENBQUEsUUFBUSxDQUFDLG9CQUFWLENBQStCLEtBQS9CO0lBRE87OzhCQUdULHFCQUFBLEdBQXVCLFNBQUE7TUFDckIsSUFBRywyQ0FBSDtRQUNFLElBQUMsQ0FBQSxZQUFELElBQWlCO2VBQ2pCLElBQUMsQ0FBQSxjQUFELENBQWdCLElBQUMsQ0FBQSxZQUFqQixFQUZGOztJQURxQjs7OEJBS3ZCLHFCQUFBLEdBQXVCLFNBQUE7TUFDckIsSUFBRyxJQUFDLENBQUEsWUFBRCxJQUFpQixDQUFwQjtRQUVFLElBQUMsQ0FBQSxZQUFELEdBQWdCLENBQUM7ZUFDakIsSUFBQyxDQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBcEIsQ0FBQSxDQUE4QixDQUFDLE9BQS9CLENBQXVDLEVBQXZDLEVBSEY7T0FBQSxNQUFBO1FBS0UsSUFBQyxDQUFBLFlBQUQsSUFBaUI7ZUFDakIsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLFlBQWpCLEVBTkY7O0lBRHFCOzs4QkFTdkIsT0FBQSxHQUFTLFNBQUMsSUFBRDtBQUNQLFVBQUE7TUFBQSxVQUFBLEdBQWdCLElBQUMsQ0FBQSxZQUFZLENBQUMsaUJBQWpCLEdBQXdDLEdBQXhDLEdBQWlEO01BQzlELElBQUcsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEtBQWUsRUFBZixJQUFxQixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sS0FBZSxVQUF2QztRQUNFLFVBQUEsR0FBYSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQVQ7UUFDYixJQUFHLGtCQUFIO1VBQ0UsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWMsV0FEaEI7U0FBQSxNQUFBO1VBR0UsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLEdBQWM7VUFDZCxJQUFJLENBQUMsSUFBTCxDQUFBLEVBSkY7U0FGRjs7TUFPQSw2Q0FBTSxJQUFOO2FBQ0EsSUFBQyxDQUFBLFFBQVEsQ0FBQyxpQkFBVixDQUE0QixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQWxDO0lBVk87OzhCQVlULE1BQUEsR0FBUSxTQUFDLE9BQUQ7TUFDTixJQUFHLE9BQUg7UUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFoQixDQUFvQixzQkFBcEI7ZUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFoQixDQUF1QixjQUF2QixFQUZGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLGNBQXBCO2VBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBaEIsQ0FBdUIsc0JBQXZCLEVBTEY7O0lBRE07Ozs7S0F4Q29CO0FBSDlCIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXdNb2RlbH0gPSByZXF1aXJlICcuL3ZpZXctbW9kZWwnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaFZpZXdNb2RlbCBleHRlbmRzIFZpZXdNb2RlbFxuICBjb25zdHJ1Y3RvcjogKEBzZWFyY2hNb3Rpb24pIC0+XG4gICAgc3VwZXIoQHNlYXJjaE1vdGlvbiwgY2xhc3M6ICdzZWFyY2gnKVxuICAgIEBoaXN0b3J5SW5kZXggPSAtMVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoQHZpZXcuZWRpdG9yRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcsIEBpbmNyZWFzZUhpc3RvcnlTZWFyY2gpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoQHZpZXcuZWRpdG9yRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJywgQGRlY3JlYXNlSGlzdG9yeVNlYXJjaClcblxuICByZXN0b3JlSGlzdG9yeTogKGluZGV4KSAtPlxuICAgIEB2aWV3LmVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRUZXh0KEBoaXN0b3J5KGluZGV4KSlcblxuICBoaXN0b3J5OiAoaW5kZXgpIC0+XG4gICAgQHZpbVN0YXRlLmdldFNlYXJjaEhpc3RvcnlJdGVtKGluZGV4KVxuXG4gIGluY3JlYXNlSGlzdG9yeVNlYXJjaDogPT5cbiAgICBpZiBAaGlzdG9yeShAaGlzdG9yeUluZGV4ICsgMSk/XG4gICAgICBAaGlzdG9yeUluZGV4ICs9IDFcbiAgICAgIEByZXN0b3JlSGlzdG9yeShAaGlzdG9yeUluZGV4KVxuXG4gIGRlY3JlYXNlSGlzdG9yeVNlYXJjaDogPT5cbiAgICBpZiBAaGlzdG9yeUluZGV4IDw9IDBcbiAgICAgICMgZ2V0IHVzIGJhY2sgdG8gYSBjbGVhbiBzbGF0ZVxuICAgICAgQGhpc3RvcnlJbmRleCA9IC0xXG4gICAgICBAdmlldy5lZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuc2V0VGV4dCgnJylcbiAgICBlbHNlXG4gICAgICBAaGlzdG9yeUluZGV4IC09IDFcbiAgICAgIEByZXN0b3JlSGlzdG9yeShAaGlzdG9yeUluZGV4KVxuXG4gIGNvbmZpcm06ICh2aWV3KSA9PlxuICAgIHJlcGVhdENoYXIgPSBpZiBAc2VhcmNoTW90aW9uLmluaXRpYWxseVJldmVyc2VkIHRoZW4gJz8nIGVsc2UgJy8nXG4gICAgaWYgQHZpZXcudmFsdWUgaXMgJycgb3IgQHZpZXcudmFsdWUgaXMgcmVwZWF0Q2hhclxuICAgICAgbGFzdFNlYXJjaCA9IEBoaXN0b3J5KDApXG4gICAgICBpZiBsYXN0U2VhcmNoP1xuICAgICAgICBAdmlldy52YWx1ZSA9IGxhc3RTZWFyY2hcbiAgICAgIGVsc2VcbiAgICAgICAgQHZpZXcudmFsdWUgPSAnJ1xuICAgICAgICBhdG9tLmJlZXAoKVxuICAgIHN1cGVyKHZpZXcpXG4gICAgQHZpbVN0YXRlLnB1c2hTZWFyY2hIaXN0b3J5KEB2aWV3LnZhbHVlKVxuXG4gIHVwZGF0ZTogKHJldmVyc2UpIC0+XG4gICAgaWYgcmV2ZXJzZVxuICAgICAgQHZpZXcuY2xhc3NMaXN0LmFkZCgncmV2ZXJzZS1zZWFyY2gtaW5wdXQnKVxuICAgICAgQHZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnc2VhcmNoLWlucHV0JylcbiAgICBlbHNlXG4gICAgICBAdmlldy5jbGFzc0xpc3QuYWRkKCdzZWFyY2gtaW5wdXQnKVxuICAgICAgQHZpZXcuY2xhc3NMaXN0LnJlbW92ZSgncmV2ZXJzZS1zZWFyY2gtaW5wdXQnKVxuIl19
