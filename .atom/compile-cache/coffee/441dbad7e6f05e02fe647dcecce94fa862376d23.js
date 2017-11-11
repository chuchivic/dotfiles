(function() {
  var $, $$, SelectListMultipleView, SelectListView, View, fuzzyFilter, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fuzzyFilter = require('fuzzaldrin').filter;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, View = ref.View, SelectListView = ref.SelectListView;

  module.exports = SelectListMultipleView = (function(superClass) {
    extend(SelectListMultipleView, superClass);

    function SelectListMultipleView() {
      return SelectListMultipleView.__super__.constructor.apply(this, arguments);
    }

    SelectListMultipleView.prototype.initialize = function() {
      SelectListMultipleView.__super__.initialize.apply(this, arguments);
      this.selectedItems = [];
      this.list.addClass('mark-active');
      this.on('mousedown', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if (target === _this.list[0] || $(target).hasClass('btn')) {
            return false;
          }
        };
      })(this));
      this.on('keypress', (function(_this) {
        return function(arg) {
          var ctrlKey, keyCode, shiftKey;
          keyCode = arg.keyCode, ctrlKey = arg.ctrlKey, shiftKey = arg.shiftKey;
          if (keyCode === 13 && (ctrlKey || shiftKey)) {
            return _this.complete();
          }
        };
      })(this));
      return this.addButtons();
    };

    SelectListMultipleView.prototype.addButtons = function() {
      var viewButton;
      viewButton = $$(function() {
        return this.div({
          "class": 'buttons'
        }, (function(_this) {
          return function() {
            _this.span({
              "class": 'pull-left'
            }, function() {
              return _this.button({
                "class": 'btn btn-error inline-block-tight btn-cancel-button'
              }, 'Cancel');
            });
            return _this.span({
              "class": 'pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-success inline-block-tight btn-complete-button'
              }, 'Confirm');
            });
          };
        })(this));
      });
      viewButton.appendTo(this);
      return this.on('click', 'button', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if ($(target).hasClass('btn-complete-button')) {
            _this.complete();
          }
          if ($(target).hasClass('btn-cancel-button')) {
            return _this.cancel();
          }
        };
      })(this));
    };

    SelectListMultipleView.prototype.confirmSelection = function() {
      var item, viewItem;
      item = this.getSelectedItem();
      viewItem = this.getSelectedItemView();
      if (viewItem != null) {
        return this.confirmed(item, viewItem);
      } else {
        return this.cancel();
      }
    };

    SelectListMultipleView.prototype.confirmed = function(item, viewItem) {
      if (indexOf.call(this.selectedItems, item) >= 0) {
        this.selectedItems = this.selectedItems.filter(function(i) {
          return i !== item;
        });
        return viewItem.removeClass('active');
      } else {
        this.selectedItems.push(item);
        return viewItem.addClass('active');
      }
    };

    SelectListMultipleView.prototype.complete = function() {
      if (this.selectedItems.length > 0) {
        return this.completed(this.selectedItems);
      } else {
        return this.cancel();
      }
    };

    SelectListMultipleView.prototype.populateList = function() {
      var filterQuery, filteredItems, i, item, itemView, j, options, ref1, ref2, ref3;
      if (this.items == null) {
        return;
      }
      filterQuery = this.getFilterQuery();
      if (filterQuery.length) {
        options = {
          key: this.getFilterKey()
        };
        filteredItems = fuzzyFilter(this.items, filterQuery, options);
      } else {
        filteredItems = this.items;
      }
      this.list.empty();
      if (filteredItems.length) {
        this.setError(null);
        for (i = j = 0, ref1 = Math.min(filteredItems.length, this.maxItems); 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
          item = (ref2 = filteredItems[i].original) != null ? ref2 : filteredItems[i];
          itemView = $(this.viewForItem(item, (ref3 = filteredItems[i].string) != null ? ref3 : null));
          itemView.data('select-list-item', item);
          if (indexOf.call(this.selectedItems, item) >= 0) {
            itemView.addClass('active');
          }
          this.list.append(itemView);
        }
        return this.selectItemView(this.list.find('li:first'));
      } else {
        return this.setError(this.getEmptyMessage(this.items.length, filteredItems.length));
      }
    };

    SelectListMultipleView.prototype.viewForItem = function(item, matchedStr) {
      throw new Error("Subclass must implement a viewForItem(item) method");
    };

    SelectListMultipleView.prototype.completed = function(items) {
      throw new Error("Subclass must implement a completed(items) method");
    };

    return SelectListMultipleView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3NlbGVjdC1saXN0LW11bHRpcGxlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxRUFBQTtJQUFBOzs7O0VBQUEsV0FBQSxHQUFjLE9BQUEsQ0FBUSxZQUFSLENBQXFCLENBQUM7O0VBQ3BDLE1BQWdDLE9BQUEsQ0FBUSxzQkFBUixDQUFoQyxFQUFDLFNBQUQsRUFBSSxXQUFKLEVBQVEsZUFBUixFQUFjOztFQWlDZCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3FDQUlKLFVBQUEsR0FBWSxTQUFBO01BQ1Ysd0RBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCO01BQ2pCLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFlLGFBQWY7TUFFQSxJQUFDLENBQUEsRUFBRCxDQUFJLFdBQUosRUFBaUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFDZixjQUFBO1VBRGlCLFNBQUQ7VUFDaEIsSUFBUyxNQUFBLEtBQVUsS0FBQyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQWhCLElBQXNCLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLEtBQW5CLENBQS9CO21CQUFBLE1BQUE7O1FBRGU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWpCO01BRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxVQUFKLEVBQWdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQWtDLGNBQUE7VUFBaEMsdUJBQVMsdUJBQVM7VUFBYyxJQUFlLE9BQUEsS0FBVyxFQUFYLElBQWtCLENBQUMsT0FBQSxJQUFXLFFBQVosQ0FBakM7bUJBQUEsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFBOztRQUFsQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7YUFDQSxJ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RUFBb0IsV0FBcEIsRUFBaUMsT0FBakMsRUFIbEI7T0FBQSxNQUFBO1FBS0UsYUFBQSxHQUFnQixJQUFDLENBQUEsTUFMbkI7O01BT0EsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQUE7TUFDQSxJQUFHLGFBQWEsQ0FBQyxNQUFqQjtRQUNFLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBVjtBQUNBLGFBQVMsMkhBQVQ7VUFDRSxJQUFBLHVEQUFtQyxhQUFjLENBQUEsQ0FBQTtVQUNqRCxRQUFBLEdBQVcsQ0FBQSxDQUFFLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBYixvREFBNkMsSUFBN0MsQ0FBRjtVQUNYLFFBQVEsQ0FBQyxJQUFULENBQWMsa0JBQWQsRUFBa0MsSUFBbEM7VUFDQSxJQUE4QixhQUFRLElBQUMsQ0FBQSxhQUFULEVBQUEsSUFBQSxNQUE5QjtZQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLFFBQWxCLEVBQUE7O1VBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLENBQWEsUUFBYjtBQUxGO2VBT0EsSUFBQyxDQUFBLGNBQUQsQ0FBZ0IsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsVUFBWCxDQUFoQixFQVRGO09BQUEsTUFBQTtlQVdFLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUF4QixFQUFnQyxhQUFhLENBQUMsTUFBOUMsQ0FBVixFQVhGOztJQVpZOztxQ0FvQ2QsV0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLFVBQVA7QUFDWCxZQUFVLElBQUEsS0FBQSxDQUFNLG9EQUFOO0lBREM7O3FDQVdiLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxZQUFVLElBQUEsS0FBQSxDQUFNLG1EQUFOO0lBREQ7Ozs7S0EzSHdCO0FBbkNyQyIsInNvdXJjZXNDb250ZW50IjpbImZ1enp5RmlsdGVyID0gcmVxdWlyZSgnZnV6emFsZHJpbicpLmZpbHRlclxueyQsICQkLCBWaWV3LCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuIyBQdWJsaWM6IFByb3ZpZGVzIGEgdmlldyB0aGF0IHJlbmRlcnMgYSBsaXN0IG9mIGl0ZW1zIHdpdGggYW4gZWRpdG9yIHRoYXRcbiMgZmlsdGVycyB0aGUgaXRlbXMuIEVuYWJsZXMgeW91IHRvIHNlbGVjdCBtdWx0aXBsZSBpdGVtcyBhdCBvbmNlLlxuI1xuIyBTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IHRoZSBmb2xsb3dpbmcgbWV0aG9kczpcbiNcbiMgKiB7Ojp2aWV3Rm9ySXRlbX1cbiMgKiB7Ojpjb21wbGV0ZWR9XG4jXG4jIFN1YmNsYXNzZXMgc2hvdWxkIGltcGxlbWVudCB0aGUgZm9sbG93aW5nIG1ldGhvZHM6XG4jXG4jICogezo6YWRkQnV0dG9uc31cbiNcbiMgIyMgUmVxdWlyaW5nIGluIHBhY2thZ2VzXG4jXG4jIGBgYGNvZmZlZVxuIyB7U2VsZWN0TGlzdE11bHRpcGxlVmlld30gPSByZXF1aXJlICdhdG9tJ1xuI1xuIyBjbGFzcyBNeVNlbGVjdExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdE11bHRpcGxlVmlld1xuIyAgIGluaXRpYWxpemU6IC0+XG4jICAgICBzdXBlclxuIyAgICAgQGFkZENsYXNzKCdvdmVybGF5IGZyb20tdG9wJylcbiMgICAgIEBzZXRJdGVtcyhbJ0hlbGxvJywgJ1dvcmxkJ10pXG4jICAgICBhdG9tLndvcmtzcGFjZVZpZXcuYXBwZW5kKHRoaXMpXG4jICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuI1xuIyAgIHZpZXdGb3JJdGVtOiAoaXRlbSkgLT5cbiMgICAgIFwiPGxpPiN7aXRlbX08L2xpPlwiXG4jXG4jICAgY29tcGxldGVkOiAoaXRlbXMpIC0+XG4jICAgICBjb25zb2xlLmxvZyhcIiN7aXRlbXN9IHdlcmUgc2VsZWN0ZWRcIilcbiMgYGBgXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWxlY3RMaXN0TXVsdGlwbGVWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcblxuICAjIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMgYnV0IGBzdXBlcmAgc2hvdWxkIGFsd2F5c1xuICAjIGJlIGNhbGxlZC5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBzZWxlY3RlZEl0ZW1zID0gW11cbiAgICBAbGlzdC5hZGRDbGFzcygnbWFyay1hY3RpdmUnKVxuXG4gICAgQG9uICdtb3VzZWRvd24nLCAoe3RhcmdldH0pID0+XG4gICAgICBmYWxzZSBpZiB0YXJnZXQgaXMgQGxpc3RbMF0gb3IgJCh0YXJnZXQpLmhhc0NsYXNzKCdidG4nKVxuICAgIEBvbiAna2V5cHJlc3MnLCAoe2tleUNvZGUsIGN0cmxLZXksIHNoaWZ0S2V5fSkgPT4gQGNvbXBsZXRlKCkgaWYga2V5Q29kZSBpcyAxMyBhbmQgKGN0cmxLZXkgb3Igc2hpZnRLZXkpXG4gICAgQGFkZEJ1dHRvbnMoKVxuXG4gICMgUHVibGljOiBGdW5jdGlvbiB0byBhZGQgYnV0dG9ucyB0byB0aGUgU2VsZWN0TGlzdE11bHRpcGxlVmlldy5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHN1YmNsYXNzZXMuXG4gICNcbiAgIyAjIyMgSW1wb3J0YW50XG4gICMgVGhlcmUgbXVzdCBhbHdheXMgYmUgYSBidXR0b24gdG8gY2FsbCB0aGUgZnVuY3Rpb24gYEBjb21wbGV0ZSgpYCB0b1xuICAjIGNvbmZpcm0gdGhlIHNlbGVjdGlvbnMhXG4gICNcbiAgIyAjIyMjIEV4YW1wbGUgKERlZmF1bHQpXG4gICMgYGBgY29mZmVlXG4gICMgYWRkQnV0dG9uczogLT5cbiAgIyAgIHZpZXdCdXR0b24gPSAkJCAtPlxuICAjICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICMgICAgICAgQHNwYW4gY2xhc3M6ICdwdWxsLWxlZnQnLCA9PlxuICAjICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tZXJyb3IgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1jYW5jZWwtYnV0dG9uJywgJ0NhbmNlbCdcbiAgIyAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAjICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tc3VjY2VzcyBpbmxpbmUtYmxvY2stdGlnaHQgYnRuLWNvbXBsZXRlLWJ1dHRvbicsICdDb25maXJtJ1xuICAjICAgdmlld0J1dHRvbi5hcHBlbmRUbyh0aGlzKVxuICAjXG4gICMgICBAb24gJ2NsaWNrJywgJ2J1dHRvbicsICh7dGFyZ2V0fSkgPT5cbiAgIyAgICAgQGNvbXBsZXRlKCkgaWYgJCh0YXJnZXQpLmhhc0NsYXNzKCdidG4tY29tcGxldGUtYnV0dG9uJylcbiAgIyAgICAgQGNhbmNlbCgpIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLWNhbmNlbC1idXR0b24nKVxuICAjIGBgYFxuICBhZGRCdXR0b25zOiAtPlxuICAgIHZpZXdCdXR0b24gPSAkJCAtPlxuICAgICAgQGRpdiBjbGFzczogJ2J1dHRvbnMnLCA9PlxuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtbGVmdCcsID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tZXJyb3IgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1jYW5jZWwtYnV0dG9uJywgJ0NhbmNlbCdcbiAgICAgICAgQHNwYW4gY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1zdWNjZXNzIGlubGluZS1ibG9jay10aWdodCBidG4tY29tcGxldGUtYnV0dG9uJywgJ0NvbmZpcm0nXG4gICAgdmlld0J1dHRvbi5hcHBlbmRUbyh0aGlzKVxuXG4gICAgQG9uICdjbGljaycsICdidXR0b24nLCAoe3RhcmdldH0pID0+XG4gICAgICBAY29tcGxldGUoKSBpZiAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bi1jb21wbGV0ZS1idXR0b24nKVxuICAgICAgQGNhbmNlbCgpIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLWNhbmNlbC1idXR0b24nKVxuXG4gIGNvbmZpcm1TZWxlY3Rpb246IC0+XG4gICAgaXRlbSA9IEBnZXRTZWxlY3RlZEl0ZW0oKVxuICAgIHZpZXdJdGVtID0gQGdldFNlbGVjdGVkSXRlbVZpZXcoKVxuICAgIGlmIHZpZXdJdGVtP1xuICAgICAgQGNvbmZpcm1lZChpdGVtLCB2aWV3SXRlbSlcbiAgICBlbHNlXG4gICAgICBAY2FuY2VsKClcblxuICBjb25maXJtZWQ6IChpdGVtLCB2aWV3SXRlbSkgLT5cbiAgICBpZiBpdGVtIGluIEBzZWxlY3RlZEl0ZW1zXG4gICAgICBAc2VsZWN0ZWRJdGVtcyA9IEBzZWxlY3RlZEl0ZW1zLmZpbHRlciAoaSkgLT4gaSBpc250IGl0ZW1cbiAgICAgIHZpZXdJdGVtLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgIGVsc2VcbiAgICAgIEBzZWxlY3RlZEl0ZW1zLnB1c2ggaXRlbVxuICAgICAgdmlld0l0ZW0uYWRkQ2xhc3MoJ2FjdGl2ZScpXG5cbiAgY29tcGxldGU6IC0+XG4gICAgaWYgQHNlbGVjdGVkSXRlbXMubGVuZ3RoID4gMFxuICAgICAgQGNvbXBsZXRlZChAc2VsZWN0ZWRJdGVtcylcbiAgICBlbHNlXG4gICAgICBAY2FuY2VsKClcblxuICAjIFB1YmxpYzogUG9wdWxhdGUgdGhlIGxpc3QgdmlldyB3aXRoIHRoZSBtb2RlbCBpdGVtcyBwcmV2aW91c2x5IHNldCBieVxuICAjICAgICAgICAgY2FsbGluZyB7OjpzZXRJdGVtc30uXG4gICNcbiAgIyBTdWJjbGFzc2VzIG1heSBvdmVycmlkZSB0aGlzIG1ldGhvZCBidXQgc2hvdWxkIGFsd2F5cyBjYWxsIGBzdXBlcmAuXG4gIHBvcHVsYXRlTGlzdDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpdGVtcz9cblxuICAgIGZpbHRlclF1ZXJ5ID0gQGdldEZpbHRlclF1ZXJ5KClcbiAgICBpZiBmaWx0ZXJRdWVyeS5sZW5ndGhcbiAgICAgIG9wdGlvbnMgPVxuICAgICAgICBrZXk6IEBnZXRGaWx0ZXJLZXkoKVxuICAgICAgZmlsdGVyZWRJdGVtcyA9IGZ1enp5RmlsdGVyKEBpdGVtcywgZmlsdGVyUXVlcnksIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgZmlsdGVyZWRJdGVtcyA9IEBpdGVtc1xuXG4gICAgQGxpc3QuZW1wdHkoKVxuICAgIGlmIGZpbHRlcmVkSXRlbXMubGVuZ3RoXG4gICAgICBAc2V0RXJyb3IobnVsbClcbiAgICAgIGZvciBpIGluIFswLi4uTWF0aC5taW4oZmlsdGVyZWRJdGVtcy5sZW5ndGgsIEBtYXhJdGVtcyldXG4gICAgICAgIGl0ZW0gPSBmaWx0ZXJlZEl0ZW1zW2ldLm9yaWdpbmFsID8gZmlsdGVyZWRJdGVtc1tpXVxuICAgICAgICBpdGVtVmlldyA9ICQoQHZpZXdGb3JJdGVtKGl0ZW0sIGZpbHRlcmVkSXRlbXNbaV0uc3RyaW5nID8gbnVsbCkpXG4gICAgICAgIGl0ZW1WaWV3LmRhdGEoJ3NlbGVjdC1saXN0LWl0ZW0nLCBpdGVtKVxuICAgICAgICBpdGVtVmlldy5hZGRDbGFzcyAnYWN0aXZlJyBpZiBpdGVtIGluIEBzZWxlY3RlZEl0ZW1zXG4gICAgICAgIEBsaXN0LmFwcGVuZChpdGVtVmlldylcblxuICAgICAgQHNlbGVjdEl0ZW1WaWV3KEBsaXN0LmZpbmQoJ2xpOmZpcnN0JykpXG4gICAgZWxzZVxuICAgICAgQHNldEVycm9yKEBnZXRFbXB0eU1lc3NhZ2UoQGl0ZW1zLmxlbmd0aCwgZmlsdGVyZWRJdGVtcy5sZW5ndGgpKVxuXG4gICMgUHVibGljOiBDcmVhdGUgYSB2aWV3IGZvciB0aGUgZ2l2ZW4gbW9kZWwgaXRlbS5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG11c3QgYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLlxuICAjXG4gICMgVGhpcyBpcyBjYWxsZWQgd2hlbiB0aGUgaXRlbSBpcyBhYm91dCB0byBhcHBlbmRlZCB0byB0aGUgbGlzdCB2aWV3LlxuICAjXG4gICMgaXRlbSAgICAgICAgICAtIFRoZSBtb2RlbCBpdGVtIGJlaW5nIHJlbmRlcmVkLiBUaGlzIHdpbGwgYWx3YXlzIGJlIG9uZSBvZlxuICAjICAgICAgICAgICAgICAgICB0aGUgaXRlbXMgcHJldmlvdXNseSBwYXNzZWQgdG8gezo6c2V0SXRlbXN9LlxuICAjIG1hdGNoZWRTdHIgLSBUaGUgZnV6enkgaGlnaGxpZ2h0ZWQgc3RyaW5nLlxuICAjXG4gICMgUmV0dXJucyBhIFN0cmluZyBvZiBIVE1MLCBET00gZWxlbWVudCwgalF1ZXJ5IG9iamVjdCwgb3IgVmlldy5cbiAgdmlld0Zvckl0ZW06IChpdGVtLCBtYXRjaGVkU3RyKSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihcIlN1YmNsYXNzIG11c3QgaW1wbGVtZW50IGEgdmlld0Zvckl0ZW0oaXRlbSkgbWV0aG9kXCIpXG5cbiAgIyBQdWJsaWM6IENhbGxiYWNrIGZ1bmN0aW9uIGZvciB3aGVuIHRoZSBjb21wbGV0ZSBidXR0b24gaXMgcHJlc3NlZC5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG11c3QgYmUgb3ZlcnJpZGRlbiBieSBzdWJjbGFzc2VzLlxuICAjXG4gICMgaXRlbXMgLSBBbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHNlbGVjdGVkIGl0ZW1zLiBUaGlzIHdpbGwgYWx3YXlzIGJlIG9uZVxuICAjICAgICAgICAgb2YgdGhlIGl0ZW1zIHByZXZpb3VzbHkgcGFzc2VkIHRvIHs6OnNldEl0ZW1zfS5cbiAgI1xuICAjIFJldHVybnMgYSBET00gZWxlbWVudCwgalF1ZXJ5IG9iamVjdCwgb3Ige1ZpZXd9LlxuICBjb21wbGV0ZWQ6IChpdGVtcykgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdWJjbGFzcyBtdXN0IGltcGxlbWVudCBhIGNvbXBsZXRlZChpdGVtcykgbWV0aG9kXCIpXG4iXX0=
