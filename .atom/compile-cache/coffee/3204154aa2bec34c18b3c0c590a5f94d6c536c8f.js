(function() {
  var $$, ListView, SelectListView, git, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function() {
      ListView.__super__.initialize.apply(this, arguments);
      this.currentPane = atom.workspace.getActivePane();
      return this.result = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.resolve = resolve;
          _this.reject = reject;
          return _this.setup();
        };
      })(this));
    };

    ListView.prototype.getFilterKey = function() {
      return 'path';
    };

    ListView.prototype.setup = function() {
      this.setItems(atom.project.getPaths().map(function(p) {
        return {
          path: p,
          relativized: p.substring(p.lastIndexOf('/') + 1)
        };
      }));
      return this.show();
    };

    ListView.prototype.show = function() {
      this.filterEditorView.getModel().placeholderText = 'Initialize new repo where?';
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.focusFilterEditor();
      return this.storeFocusedElement();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.viewForItem = function(arg) {
      var path, relativized;
      path = arg.path, relativized = arg.relativized;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'text-highlight'
            }, relativized);
            return _this.div({
              "class": 'text-info'
            }, path);
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(arg) {
      var path;
      path = arg.path;
      this.resolve(path);
      return this.cancel();
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3Byb2plY3RzLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNDQUFBO0lBQUE7OztFQUFBLE1BQXVCLE9BQUEsQ0FBUSxzQkFBUixDQUF2QixFQUFDLFdBQUQsRUFBSzs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDUTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQTtNQUNWLDBDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO2FBQ2YsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7VUFDcEIsS0FBQyxDQUFBLE9BQUQsR0FBVztVQUNYLEtBQUMsQ0FBQSxNQUFELEdBQVU7aUJBQ1YsS0FBQyxDQUFBLEtBQUQsQ0FBQTtRQUhvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQUhKOzt1QkFRWixZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7O3VCQUVkLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF1QixDQUFDLEdBQXhCLENBQTRCLFNBQUMsQ0FBRDtBQUNwQyxlQUFPO1VBQ0wsSUFBQSxFQUFNLENBREQ7VUFFTCxXQUFBLEVBQWEsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxDQUFDLENBQUMsV0FBRixDQUFjLEdBQWQsQ0FBQSxHQUFtQixDQUEvQixDQUZSOztNQUQ2QixDQUE1QixDQUFWO2FBS0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQU5LOzt1QkFRUCxJQUFBLEdBQU0sU0FBQTtNQUNKLElBQUMsQ0FBQSxnQkFBZ0IsQ0FBQyxRQUFsQixDQUFBLENBQTRCLENBQUMsZUFBN0IsR0FBK0M7O1FBQy9DLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUxJOzt1QkFPTixJQUFBLEdBQU0sU0FBQTtBQUFHLFVBQUE7K0NBQU0sQ0FBRSxPQUFSLENBQUE7SUFBSDs7dUJBRU4sU0FBQSxHQUFXLFNBQUE7YUFDVCxJQUFDLENBQUEsSUFBRCxDQUFBO0lBRFM7O3VCQUdYLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsaUJBQU07YUFDbkIsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDRixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDthQUFMLEVBQThCLFdBQTlCO21CQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7YUFBTCxFQUF5QixJQUF6QjtVQUZFO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFKO01BREMsQ0FBSDtJQURXOzt1QkFNYixTQUFBLEdBQVcsU0FBQyxHQUFEO0FBQ1QsVUFBQTtNQURXLE9BQUQ7TUFDVixJQUFDLENBQUEsT0FBRCxDQUFTLElBQVQ7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRlM7Ozs7S0FyQ1U7QUFKekIiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgc3VwZXJcbiAgICAgIEBjdXJyZW50UGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgQHJlc3VsdCA9IG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICAgIEByZXNvbHZlID0gcmVzb2x2ZVxuICAgICAgICBAcmVqZWN0ID0gcmVqZWN0XG4gICAgICAgIEBzZXR1cCgpXG5cbiAgICBnZXRGaWx0ZXJLZXk6IC0+ICdwYXRoJ1xuXG4gICAgc2V0dXA6IC0+XG4gICAgICBAc2V0SXRlbXMgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubWFwIChwKSAtPlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHBhdGg6IHBcbiAgICAgICAgICByZWxhdGl2aXplZDogcC5zdWJzdHJpbmcocC5sYXN0SW5kZXhPZignLycpKzEpXG4gICAgICAgIH1cbiAgICAgIEBzaG93KClcblxuICAgIHNob3c6IC0+XG4gICAgICBAZmlsdGVyRWRpdG9yVmlldy5nZXRNb2RlbCgpLnBsYWNlaG9sZGVyVGV4dCA9ICdJbml0aWFsaXplIG5ldyByZXBvIHdoZXJlPydcbiAgICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgICBAcGFuZWwuc2hvdygpXG4gICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuICAgICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gICAgaGlkZTogLT4gQHBhbmVsPy5kZXN0cm95KClcblxuICAgIGNhbmNlbGxlZDogLT5cbiAgICAgIEBoaWRlKClcblxuICAgIHZpZXdGb3JJdGVtOiAoe3BhdGgsIHJlbGF0aXZpemVkfSkgLT5cbiAgICAgICQkIC0+XG4gICAgICAgIEBsaSA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICd0ZXh0LWhpZ2hsaWdodCcsIHJlbGF0aXZpemVkXG4gICAgICAgICAgQGRpdiBjbGFzczogJ3RleHQtaW5mbycsIHBhdGhcblxuICAgIGNvbmZpcm1lZDogKHtwYXRofSkgLT5cbiAgICAgIEByZXNvbHZlIHBhdGhcbiAgICAgIEBjYW5jZWwoKVxuIl19
