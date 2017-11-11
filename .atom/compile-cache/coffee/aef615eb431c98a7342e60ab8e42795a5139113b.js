(function() {
  var $$, ListView, SelectListView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(data, onConfirm) {
      this.data = data;
      this.onConfirm = onConfirm;
      ListView.__super__.initialize.apply(this, arguments);
      this.addClass('git-branch');
      this.show();
      this.parseData();
      return this.currentPane = atom.workspace.getActivePane();
    };

    ListView.prototype.parseData = function() {
      var branches, items;
      items = this.data.split("\n");
      branches = [];
      items.forEach(function(item) {
        var name;
        item = item.replace(/\s/g, '');
        name = item.startsWith("*") ? item.slice(1) : item;
        if (item !== '') {
          return branches.push({
            name: name
          });
        }
      });
      this.setItems(branches);
      return this.focusFilterEditor();
    };

    ListView.prototype.getFilterKey = function() {
      return 'name';
    };

    ListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    ListView.prototype.cancelled = function() {
      return this.hide();
    };

    ListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    ListView.prototype.viewForItem = function(arg) {
      var current, name;
      name = arg.name;
      current = false;
      if (name.startsWith("*")) {
        name = name.slice(1);
        current = true;
      }
      return $$(function() {
        return this.li(name, (function(_this) {
          return function() {
            return _this.div({
              "class": 'pull-right'
            }, function() {
              if (current) {
                return _this.span('HEAD');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(item) {
      var ref1;
      this.onConfirm(item);
      this.cancel();
      if ((ref1 = this.currentPane) != null ? ref1.isAlive() : void 0) {
        return this.currentPane.activate();
      }
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2JyYW5jaC1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQ0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsU0FBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLFlBQUQ7TUFDbEIsMENBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsWUFBVjtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQTtJQUxMOzt1QkFPWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWjtNQUNSLFFBQUEsR0FBVztNQUNYLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQyxJQUFEO0FBQ1osWUFBQTtRQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7UUFDUCxJQUFBLEdBQVUsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSCxHQUE2QixJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FBN0IsR0FBZ0Q7UUFDdkQsSUFBNkIsSUFBQSxLQUFRLEVBQXJDO2lCQUFBLFFBQVEsQ0FBQyxJQUFULENBQWM7WUFBQyxNQUFBLElBQUQ7V0FBZCxFQUFBOztNQUhZLENBQWQ7TUFJQSxJQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVJTOzt1QkFVWCxZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7O3VCQUVkLElBQUEsR0FBTSxTQUFBOztRQUNKLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFISTs7dUJBS04sU0FBQSxHQUFXLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBQUg7O3VCQUVYLElBQUEsR0FBTSxTQUFBO0FBQUcsVUFBQTsrQ0FBTSxDQUFFLE9BQVIsQ0FBQTtJQUFIOzt1QkFFTixXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLE9BQUQ7TUFDWixPQUFBLEdBQVU7TUFDVixJQUFHLElBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCLENBQUg7UUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYO1FBQ1AsT0FBQSxHQUFVLEtBRlo7O2FBR0EsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJLElBQUosRUFBVSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNSLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7YUFBTCxFQUEwQixTQUFBO2NBQ3hCLElBQWlCLE9BQWpCO3VCQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sTUFBTixFQUFBOztZQUR3QixDQUExQjtVQURRO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFWO01BREMsQ0FBSDtJQUxXOzt1QkFVYixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBQ1QsVUFBQTtNQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWDtNQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSw0Q0FBdUMsQ0FBRSxPQUFkLENBQUEsVUFBM0I7ZUFBQSxJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBQSxFQUFBOztJQUhTOzs7O0tBdkNVO0FBSHZCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAoQGRhdGEsIEBvbkNvbmZpcm0pIC0+XG4gICAgc3VwZXJcbiAgICBAYWRkQ2xhc3MoJ2dpdC1icmFuY2gnKVxuICAgIEBzaG93KClcbiAgICBAcGFyc2VEYXRhKClcbiAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcblxuICBwYXJzZURhdGE6IC0+XG4gICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKVxuICAgIGJyYW5jaGVzID0gW11cbiAgICBpdGVtcy5mb3JFYWNoIChpdGVtKSAtPlxuICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXFxzL2csICcnKVxuICAgICAgbmFtZSA9IGlmIGl0ZW0uc3RhcnRzV2l0aChcIipcIikgdGhlbiBpdGVtLnNsaWNlKDEpIGVsc2UgaXRlbVxuICAgICAgYnJhbmNoZXMucHVzaCh7bmFtZX0pIHVubGVzcyBpdGVtIGlzICcnXG4gICAgQHNldEl0ZW1zIGJyYW5jaGVzXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgY3VycmVudCA9IGZhbHNlXG4gICAgaWYgbmFtZS5zdGFydHNXaXRoIFwiKlwiXG4gICAgICBuYW1lID0gbmFtZS5zbGljZSgxKVxuICAgICAgY3VycmVudCA9IHRydWVcbiAgICAkJCAtPlxuICAgICAgQGxpIG5hbWUsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAc3BhbignSEVBRCcpIGlmIGN1cnJlbnRcblxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIEBvbkNvbmZpcm0oaXRlbSlcbiAgICBAY2FuY2VsKClcbiAgICBAY3VycmVudFBhbmUuYWN0aXZhdGUoKSBpZiBAY3VycmVudFBhbmU/LmlzQWxpdmUoKVxuIl19
