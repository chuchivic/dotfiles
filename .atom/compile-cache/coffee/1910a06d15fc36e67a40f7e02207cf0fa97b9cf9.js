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

    ListView.prototype.initialize = function(repos) {
      this.repos = repos;
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
      return 'name';
    };

    ListView.prototype.setup = function() {
      this.repos = this.repos.map(function(r) {
        var path;
        path = r.getWorkingDirectory();
        return {
          name: path.substring(path.lastIndexOf('/') + 1),
          repo: r
        };
      });
      this.setItems(this.repos);
      return this.show();
    };

    ListView.prototype.show = function() {
      this.filterEditorView.getModel().placeholderText = 'Which repo?';
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
      var name;
      name = arg.name;
      return $$(function() {
        return this.li(name);
      });
    };

    ListView.prototype.confirmed = function(arg) {
      var repo;
      repo = arg.repo;
      this.resolve(repo);
      return this.cancel();
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlcG8tbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0NBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNROzs7Ozs7O3VCQUNKLFVBQUEsR0FBWSxTQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsUUFBRDtNQUNYLDBDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBO2FBQ2YsSUFBQyxDQUFBLE1BQUQsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7VUFDcEIsS0FBQyxDQUFBLE9BQUQsR0FBVztVQUNYLEtBQUMsQ0FBQSxNQUFELEdBQVU7aUJBQ1YsS0FBQyxDQUFBLEtBQUQsQ0FBQTtRQUhvQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUjtJQUhKOzt1QkFRWixZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7O3VCQUVkLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxTQUFDLENBQUQ7QUFDbEIsWUFBQTtRQUFBLElBQUEsR0FBTyxDQUFDLENBQUMsbUJBQUYsQ0FBQTtBQUNQLGVBQU87VUFDTCxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFJLENBQUMsV0FBTCxDQUFpQixHQUFqQixDQUFBLEdBQXNCLENBQXJDLENBREQ7VUFFTCxJQUFBLEVBQU0sQ0FGRDs7TUFGVyxDQUFYO01BTVQsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsS0FBWDthQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFSSzs7dUJBVVAsSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsZ0JBQWdCLENBQUMsUUFBbEIsQ0FBQSxDQUE0QixDQUFDLGVBQTdCLEdBQStDOztRQUMvQyxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFMSTs7dUJBT04sSUFBQSxHQUFNLFNBQUE7QUFBRyxVQUFBOytDQUFNLENBQUUsT0FBUixDQUFBO0lBQUg7O3VCQUVOLFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUFIOzt1QkFFWCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLE9BQUQ7YUFDWixFQUFBLENBQUcsU0FBQTtlQUFHLElBQUMsQ0FBQSxFQUFELENBQUksSUFBSjtNQUFILENBQUg7SUFEVzs7dUJBR2IsU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFVBQUE7TUFEVyxPQUFEO01BQ1YsSUFBQyxDQUFBLE9BQUQsQ0FBUyxJQUFUO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZTOzs7O0tBbkNVO0FBSnpCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjbGFzcyBMaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gICAgaW5pdGlhbGl6ZTogKEByZXBvcykgLT5cbiAgICAgIHN1cGVyXG4gICAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgIEByZXN1bHQgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgICBAcmVzb2x2ZSA9IHJlc29sdmVcbiAgICAgICAgQHJlamVjdCA9IHJlamVjdFxuICAgICAgICBAc2V0dXAoKVxuXG4gICAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICAgIHNldHVwOiAtPlxuICAgICAgQHJlcG9zID0gQHJlcG9zLm1hcCAocikgLT5cbiAgICAgICAgcGF0aCA9IHIuZ2V0V29ya2luZ0RpcmVjdG9yeSgpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogcGF0aC5zdWJzdHJpbmcocGF0aC5sYXN0SW5kZXhPZignLycpKzEpXG4gICAgICAgICAgcmVwbzogclxuICAgICAgICB9XG4gICAgICBAc2V0SXRlbXMgQHJlcG9zXG4gICAgICBAc2hvdygpXG5cbiAgICBzaG93OiAtPlxuICAgICAgQGZpbHRlckVkaXRvclZpZXcuZ2V0TW9kZWwoKS5wbGFjZWhvbGRlclRleHQgPSAnV2hpY2ggcmVwbz8nXG4gICAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgICAgQHBhbmVsLnNob3coKVxuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcbiAgICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICAgIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICAgIHZpZXdGb3JJdGVtOiAoe25hbWV9KSAtPlxuICAgICAgJCQgLT4gQGxpKG5hbWUpXG5cbiAgICBjb25maXJtZWQ6ICh7cmVwb30pIC0+XG4gICAgICBAcmVzb2x2ZSByZXBvXG4gICAgICBAY2FuY2VsKClcbiJdfQ==
