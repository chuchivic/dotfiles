(function() {
  var $, $$, CommandsKeystrokeHumanizer, GitInit, GitPaletteView, GitPlusCommands, SelectListView, _, fuzzyFilter, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, SelectListView = ref.SelectListView;

  GitPlusCommands = require('../git-plus-commands');

  GitInit = require('../models/git-init');

  fuzzyFilter = require('fuzzaldrin').filter;

  CommandsKeystrokeHumanizer = require('../command-keystroke-humanizer')();

  module.exports = GitPaletteView = (function(superClass) {
    extend(GitPaletteView, superClass);

    function GitPaletteView() {
      return GitPaletteView.__super__.constructor.apply(this, arguments);
    }

    GitPaletteView.prototype.initialize = function() {
      GitPaletteView.__super__.initialize.apply(this, arguments);
      this.addClass('git-palette');
      return this.toggle();
    };

    GitPaletteView.prototype.getFilterKey = function() {
      return 'description';
    };

    GitPaletteView.prototype.cancelled = function() {
      return this.hide();
    };

    GitPaletteView.prototype.toggle = function() {
      var ref1;
      if ((ref1 = this.panel) != null ? ref1.isVisible() : void 0) {
        return this.cancel();
      } else {
        return this.show();
      }
    };

    GitPaletteView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.storeFocusedElement();
      if (this.previouslyFocusedElement[0] && this.previouslyFocusedElement[0] !== document.body) {
        this.commandElement = this.previouslyFocusedElement;
      } else {
        this.commandElement = atom.views.getView(atom.workspace);
      }
      this.keyBindings = atom.keymaps.findKeyBindings({
        target: this.commandElement[0]
      });
      return GitPlusCommands().then((function(_this) {
        return function(commands) {
          var keystrokes;
          keystrokes = CommandsKeystrokeHumanizer.get(commands);
          commands = commands.map(function(c) {
            return {
              name: c[0],
              description: c[1],
              func: c[2],
              keystroke: keystrokes[c[0]]
            };
          });
          commands = _.sortBy(commands, 'description');
          _this.setItems(commands);
          _this.panel.show();
          return _this.focusFilterEditor();
        };
      })(this))["catch"]((function(_this) {
        return function(err) {
          var commands;
          (commands = []).push({
            name: 'git-plus:init',
            description: 'Init',
            func: function() {
              return GitInit();
            }
          });
          _this.setItems(commands);
          _this.panel.show();
          return _this.focusFilterEditor();
        };
      })(this));
    };

    GitPaletteView.prototype.populateList = function() {
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
          this.list.append(itemView);
        }
        return this.selectItemView(this.list.find('li:first'));
      } else {
        return this.setError(this.getEmptyMessage(this.items.length, filteredItems.length));
      }
    };

    GitPaletteView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    GitPaletteView.prototype.viewForItem = function(arg, matchedStr) {
      var description, keystroke, name;
      name = arg.name, description = arg.description, keystroke = arg.keystroke;
      return $$(function() {
        return this.li({
          "class": 'command',
          'data-command-name': name
        }, (function(_this) {
          return function() {
            if (matchedStr != null) {
              return _this.raw(matchedStr);
            } else {
              _this.span(description);
              if (keystroke != null) {
                return _this.div({
                  "class": 'pull-right'
                }, function() {
                  return _this.kbd({
                    "class": 'key-binding'
                  }, keystroke);
                });
              }
            }
          };
        })(this));
      });
    };

    GitPaletteView.prototype.confirmed = function(arg) {
      var func;
      func = arg.func;
      this.cancel();
      return func();
    };

    return GitPaletteView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2dpdC1wYWxldHRlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnSEFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTBCLE9BQUEsQ0FBUSxzQkFBUixDQUExQixFQUFDLFNBQUQsRUFBSSxXQUFKLEVBQVE7O0VBQ1IsZUFBQSxHQUFrQixPQUFBLENBQVEsc0JBQVI7O0VBQ2xCLE9BQUEsR0FBVSxPQUFBLENBQVEsb0JBQVI7O0VBQ1YsV0FBQSxHQUFjLE9BQUEsQ0FBUSxZQUFSLENBQXFCLENBQUM7O0VBQ3BDLDBCQUFBLEdBQTZCLE9BQUEsQ0FBUSxnQ0FBUixDQUFBLENBQUE7O0VBQzdCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7NkJBRUosVUFBQSxHQUFZLFNBQUE7TUFDVixnREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxhQUFWO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUhVOzs2QkFLWixZQUFBLEdBQWMsU0FBQTthQUNaO0lBRFk7OzZCQUdkLFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUFIOzs2QkFFWCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxzQ0FBUyxDQUFFLFNBQVIsQ0FBQSxVQUFIO2VBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFIRjs7SUFETTs7NkJBTVIsSUFBQSxHQUFNLFNBQUE7O1FBQ0osSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BRVYsSUFBQyxDQUFBLG1CQUFELENBQUE7TUFF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dGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xueyQsICQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbkdpdFBsdXNDb21tYW5kcyA9IHJlcXVpcmUgJy4uL2dpdC1wbHVzLWNvbW1hbmRzJ1xuR2l0SW5pdCA9IHJlcXVpcmUgJy4uL21vZGVscy9naXQtaW5pdCdcbmZ1enp5RmlsdGVyID0gcmVxdWlyZSgnZnV6emFsZHJpbicpLmZpbHRlclxuQ29tbWFuZHNLZXlzdHJva2VIdW1hbml6ZXIgPSByZXF1aXJlKCcuLi9jb21tYW5kLWtleXN0cm9rZS1odW1hbml6ZXInKSgpXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXRQYWxldHRlVmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcygnZ2l0LXBhbGV0dGUnKVxuICAgIEB0b2dnbGUoKVxuXG4gIGdldEZpbHRlcktleTogLT5cbiAgICAnZGVzY3JpcHRpb24nXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIEBwYW5lbD8uaXNWaXNpYmxlKClcbiAgICAgIEBjYW5jZWwoKVxuICAgIGVsc2VcbiAgICAgIEBzaG93KClcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgICBpZiBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50WzBdIGFuZCBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50WzBdIGlzbnQgZG9jdW1lbnQuYm9keVxuICAgICAgQGNvbW1hbmRFbGVtZW50ID0gQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudFxuICAgIGVsc2VcbiAgICAgIEBjb21tYW5kRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBAa2V5QmluZGluZ3MgPSBhdG9tLmtleW1hcHMuZmluZEtleUJpbmRpbmdzKHRhcmdldDogQGNvbW1hbmRFbGVtZW50WzBdKVxuXG4gICAgR2l0UGx1c0NvbW1hbmRzKClcbiAgICAgIC50aGVuIChjb21tYW5kcykgPT5cbiAgICAgICAga2V5c3Ryb2tlcyA9IENvbW1hbmRzS2V5c3Ryb2tlSHVtYW5pemVyLmdldChjb21tYW5kcylcbiAgICAgICAgY29tbWFuZHMgPSBjb21tYW5kcy5tYXAgKGMpIC0+IHsgbmFtZTogY1swXSwgZGVzY3JpcHRpb246IGNbMV0sIGZ1bmM6IGNbMl0sIGtleXN0cm9rZToga2V5c3Ryb2tlc1tjWzBdXSB9XG4gICAgICAgIGNvbW1hbmRzID0gXy5zb3J0QnkoY29tbWFuZHMsICdkZXNjcmlwdGlvbicpXG4gICAgICAgIEBzZXRJdGVtcyhjb21tYW5kcylcbiAgICAgICAgQHBhbmVsLnNob3coKVxuICAgICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuICAgICAgLmNhdGNoIChlcnIpID0+XG4gICAgICAgIChjb21tYW5kcyA9IFtdKS5wdXNoIHsgbmFtZTogJ2dpdC1wbHVzOmluaXQnLCBkZXNjcmlwdGlvbjogJ0luaXQnLCBmdW5jOiAtPiBHaXRJbml0KCkgfVxuICAgICAgICBAc2V0SXRlbXMoY29tbWFuZHMpXG4gICAgICAgIEBwYW5lbC5zaG93KClcbiAgICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBwb3B1bGF0ZUxpc3Q6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAaXRlbXM/XG5cbiAgICBmaWx0ZXJRdWVyeSA9IEBnZXRGaWx0ZXJRdWVyeSgpXG4gICAgaWYgZmlsdGVyUXVlcnkubGVuZ3RoXG4gICAgICBvcHRpb25zID1cbiAgICAgICAga2V5OiBAZ2V0RmlsdGVyS2V5KClcbiAgICAgIGZpbHRlcmVkSXRlbXMgPSBmdXp6eUZpbHRlcihAaXRlbXMsIGZpbHRlclF1ZXJ5LCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIGZpbHRlcmVkSXRlbXMgPSBAaXRlbXNcblxuICAgIEBsaXN0LmVtcHR5KClcbiAgICBpZiBmaWx0ZXJlZEl0ZW1zLmxlbmd0aFxuICAgICAgQHNldEVycm9yKG51bGwpXG4gICAgICBmb3IgaSBpbiBbMC4uLk1hdGgubWluKGZpbHRlcmVkSXRlbXMubGVuZ3RoLCBAbWF4SXRlbXMpXVxuICAgICAgICBpdGVtID0gZmlsdGVyZWRJdGVtc1tpXS5vcmlnaW5hbCA/IGZpbHRlcmVkSXRlbXNbaV1cbiAgICAgICAgaXRlbVZpZXcgPSAkKEB2aWV3Rm9ySXRlbShpdGVtLCBmaWx0ZXJlZEl0ZW1zW2ldLnN0cmluZyA/IG51bGwpKVxuICAgICAgICBpdGVtVmlldy5kYXRhKCdzZWxlY3QtbGlzdC1pdGVtJywgaXRlbSlcbiAgICAgICAgQGxpc3QuYXBwZW5kKGl0ZW1WaWV3KVxuXG4gICAgICBAc2VsZWN0SXRlbVZpZXcoQGxpc3QuZmluZCgnbGk6Zmlyc3QnKSlcbiAgICBlbHNlXG4gICAgICBAc2V0RXJyb3IoQGdldEVtcHR5TWVzc2FnZShAaXRlbXMubGVuZ3RoLCBmaWx0ZXJlZEl0ZW1zLmxlbmd0aCkpXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe25hbWUsIGRlc2NyaXB0aW9uLCBrZXlzdHJva2V9LCBtYXRjaGVkU3RyKSAtPlxuICAgICQkIC0+XG4gICAgICBAbGkgY2xhc3M6ICdjb21tYW5kJywgJ2RhdGEtY29tbWFuZC1uYW1lJzogbmFtZSwgPT5cbiAgICAgICAgaWYgbWF0Y2hlZFN0cj8gdGhlbiBAcmF3KG1hdGNoZWRTdHIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAc3BhbiBkZXNjcmlwdGlvblxuICAgICAgICAgIGlmIGtleXN0cm9rZT9cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICAgICAgQGtiZCBjbGFzczogJ2tleS1iaW5kaW5nJywga2V5c3Ryb2tlXG5cbiAgY29uZmlybWVkOiAoe2Z1bmN9KSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIGZ1bmMoKVxuIl19
