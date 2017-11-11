(function() {
  var $, $$, SelectListMultipleView, SelectStageHunks, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$;

  git = require('../git');

  notifier = require('../notifier');

  SelectListMultipleView = require('./select-list-multiple-view');

  module.exports = SelectStageHunks = (function(superClass) {
    extend(SelectStageHunks, superClass);

    function SelectStageHunks() {
      return SelectStageHunks.__super__.constructor.apply(this, arguments);
    }

    SelectStageHunks.prototype.initialize = function(repo, data) {
      this.repo = repo;
      SelectStageHunks.__super__.initialize.apply(this, arguments);
      this.patch_header = data[0];
      if (data.length === 2) {
        return this.completed(this._generateObjects(data.slice(1)));
      }
      this.show();
      this.setItems(this._generateObjects(data.slice(1)));
      return this.focusFilterEditor();
    };

    SelectStageHunks.prototype.getFilterKey = function() {
      return 'pos';
    };

    SelectStageHunks.prototype.addButtons = function() {
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
                "class": 'btn btn-success inline-block-tight btn-stage-button'
              }, 'Stage');
            });
          };
        })(this));
      });
      viewButton.appendTo(this);
      return this.on('click', 'button', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if ($(target).hasClass('btn-stage-button')) {
            _this.complete();
          }
          if ($(target).hasClass('btn-cancel-button')) {
            return _this.cancel();
          }
        };
      })(this));
    };

    SelectStageHunks.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    SelectStageHunks.prototype.cancelled = function() {
      return this.hide();
    };

    SelectStageHunks.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    SelectStageHunks.prototype.viewForItem = function(item, matchedStr) {
      var viewItem;
      return viewItem = $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'inline-block highlight'
            }, function() {
              if (matchedStr != null) {
                return _this.raw(matchedStr);
              } else {
                return _this.span(item.pos);
              }
            });
            return _this.div({
              "class": 'text-warning gp-item-diff',
              style: 'white-space: pre-wrap; font-family: monospace'
            }, item.diff);
          };
        })(this));
      });
    };

    SelectStageHunks.prototype.completed = function(items) {
      var patchPath, patch_full;
      this.cancel();
      if (items.length < 1) {
        return;
      }
      patch_full = this.patch_header;
      items.forEach(function(item) {
        return patch_full += (item != null ? item.patch : void 0);
      });
      patchPath = this.repo.getWorkingDirectory() + '/GITPLUS_PATCH';
      return fs.writeFile(patchPath, patch_full, {
        flag: 'w+'
      }, (function(_this) {
        return function(err) {
          if (!err) {
            return git.cmd(['apply', '--cached', '--', patchPath], {
              cwd: _this.repo.getWorkingDirectory()
            }).then(function(data) {
              data = (data != null) && data !== '' ? data : 'Hunk has been staged!';
              notifier.addSuccess(data);
              try {
                return fs.unlink(patchPath);
              } catch (error) {}
            });
          } else {
            return notifier.addError(err);
          }
        };
      })(this));
    };

    SelectStageHunks.prototype._generateObjects = function(data) {
      var hunk, hunkSplit, i, len, results;
      results = [];
      for (i = 0, len = data.length; i < len; i++) {
        hunk = data[i];
        if (!(hunk !== '')) {
          continue;
        }
        hunkSplit = hunk.match(/(@@[ \-\+\,0-9]*@@.*)\n([\s\S]*)/);
        results.push({
          pos: hunkSplit[1],
          diff: hunkSplit[2],
          patch: hunk
        });
      }
      return results;
    };

    return SelectStageHunks;

  })(SelectListMultipleView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3NlbGVjdC1zdGFnZS1odW5rcy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUVBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLE1BQVUsT0FBQSxDQUFRLHNCQUFSLENBQVYsRUFBQyxTQUFELEVBQUk7O0VBRUosR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxzQkFBQSxHQUF5QixPQUFBLENBQVEsNkJBQVI7O0VBRXpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7K0JBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLElBQVI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUNYLGtEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFLLENBQUEsQ0FBQTtNQUNyQixJQUFrRCxJQUFJLENBQUMsTUFBTCxLQUFlLENBQWpFO0FBQUEsZUFBTyxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixJQUFLLFNBQXZCLENBQVgsRUFBUDs7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsSUFBSyxTQUF2QixDQUFWO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFOVTs7K0JBUVosWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOzsrQkFFZCxVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7TUFBQSxVQUFBLEdBQWEsRUFBQSxDQUFHLFNBQUE7ZUFDZCxJQUFDLENBQUEsR0FBRCxDQUFLO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO1NBQUwsRUFBdUIsQ0FBQSxTQUFB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QUF3QixVQUF4QixFQUFvQztRQUFBLElBQUEsRUFBTSxJQUFOO09BQXBDLEVBQWdELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO1VBQzlDLElBQUEsQ0FBTyxHQUFQO21CQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxPQUFELEVBQVUsVUFBVixFQUFzQixJQUF0QixFQUE0QixTQUE1QixDQUFSLEVBQWdEO2NBQUEsR0FBQSxFQUFLLEtBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO2FBQWhELENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2NBQ0osSUFBQSxHQUFVLGNBQUEsSUFBVSxJQUFBLEtBQVUsRUFBdkIsR0FBK0IsSUFBL0IsR0FBeUM7Y0FDaEQsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsSUFBcEI7QUFDQTt1QkFBSSxFQUFFLENBQUMsTUFBSCxDQUFVLFNBQVYsRUFBSjtlQUFBO1lBSEksQ0FETixFQURGO1dBQUEsTUFBQTttQkFPRSxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQixFQVBGOztRQUQ4QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQ7SUFUUzs7K0JBbUJYLGdCQUFBLEdBQWtCLFNBQUMsSUFBRDtBQUNoQixVQUFBO0FBQUE7V0FBQSxzQ0FBQTs7Y0FBc0IsSUFBQSxLQUFVOzs7UUFDOUIsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsa0NBQVg7cUJBQ1o7VUFDRSxHQUFBLEVBQUssU0FBVSxDQUFBLENBQUEsQ0FEakI7VUFFRSxJQUFBLEVBQU0sU0FBVSxDQUFBLENBQUEsQ0FGbEI7VUFHRSxLQUFBLEVBQU8sSUFIVDs7QUFGRjs7SUFEZ0I7Ozs7S0EzRFc7QUFSL0IiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG57JCwgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5TZWxlY3RMaXN0TXVsdGlwbGVWaWV3ID0gcmVxdWlyZSAnLi9zZWxlY3QtbGlzdC1tdWx0aXBsZS12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWxlY3RTdGFnZUh1bmtzIGV4dGVuZHMgU2VsZWN0TGlzdE11bHRpcGxlVmlld1xuICBpbml0aWFsaXplOiAoQHJlcG8sIGRhdGEpIC0+XG4gICAgc3VwZXJcbiAgICBAcGF0Y2hfaGVhZGVyID0gZGF0YVswXVxuICAgIHJldHVybiBAY29tcGxldGVkIEBfZ2VuZXJhdGVPYmplY3RzKGRhdGFbMS4uXSkgaWYgZGF0YS5sZW5ndGggaXMgMlxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgQF9nZW5lcmF0ZU9iamVjdHMoZGF0YVsxLi5dKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAncG9zJ1xuXG4gIGFkZEJ1dHRvbnM6IC0+XG4gICAgdmlld0J1dHRvbiA9ICQkIC0+XG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1sZWZ0JywgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1lcnJvciBpbmxpbmUtYmxvY2stdGlnaHQgYnRuLWNhbmNlbC1idXR0b24nLCAnQ2FuY2VsJ1xuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXN1Y2Nlc3MgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1zdGFnZS1idXR0b24nLCAnU3RhZ2UnXG4gICAgdmlld0J1dHRvbi5hcHBlbmRUbyh0aGlzKVxuXG4gICAgQG9uICdjbGljaycsICdidXR0b24nLCAoe3RhcmdldH0pID0+XG4gICAgICBAY29tcGxldGUoKSBpZiAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bi1zdGFnZS1idXR0b24nKVxuICAgICAgQGNhbmNlbCgpIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLWNhbmNlbC1idXR0b24nKVxuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06IChpdGVtLCBtYXRjaGVkU3RyKSAtPlxuICAgIHZpZXdJdGVtID0gJCQgLT5cbiAgICAgIEBsaSA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnaW5saW5lLWJsb2NrIGhpZ2hsaWdodCcsID0+XG4gICAgICAgICAgaWYgbWF0Y2hlZFN0cj8gdGhlbiBAcmF3KG1hdGNoZWRTdHIpIGVsc2UgQHNwYW4gaXRlbS5wb3NcbiAgICAgICAgQGRpdiBjbGFzczogJ3RleHQtd2FybmluZyBncC1pdGVtLWRpZmYnLCBzdHlsZTogJ3doaXRlLXNwYWNlOiBwcmUtd3JhcDsgZm9udC1mYW1pbHk6IG1vbm9zcGFjZScsIGl0ZW0uZGlmZlxuXG4gIGNvbXBsZXRlZDogKGl0ZW1zKSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIHJldHVybiBpZiBpdGVtcy5sZW5ndGggPCAxXG5cbiAgICBwYXRjaF9mdWxsID0gQHBhdGNoX2hlYWRlclxuICAgIGl0ZW1zLmZvckVhY2ggKGl0ZW0pIC0+XG4gICAgICBwYXRjaF9mdWxsICs9IChpdGVtPy5wYXRjaClcblxuICAgIHBhdGNoUGF0aCA9IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSArICcvR0lUUExVU19QQVRDSCdcbiAgICBmcy53cml0ZUZpbGUgcGF0Y2hQYXRoLCBwYXRjaF9mdWxsLCBmbGFnOiAndysnLCAoZXJyKSA9PlxuICAgICAgdW5sZXNzIGVyclxuICAgICAgICBnaXQuY21kKFsnYXBwbHknLCAnLS1jYWNoZWQnLCAnLS0nLCBwYXRjaFBhdGhdLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgLnRoZW4gKGRhdGEpID0+XG4gICAgICAgICAgZGF0YSA9IGlmIGRhdGE/IGFuZCBkYXRhIGlzbnQgJycgdGhlbiBkYXRhIGVsc2UgJ0h1bmsgaGFzIGJlZW4gc3RhZ2VkISdcbiAgICAgICAgICBub3RpZmllci5hZGRTdWNjZXNzKGRhdGEpXG4gICAgICAgICAgdHJ5IGZzLnVubGluayBwYXRjaFBhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgZXJyXG5cbiAgX2dlbmVyYXRlT2JqZWN0czogKGRhdGEpIC0+XG4gICAgZm9yIGh1bmsgaW4gZGF0YSB3aGVuIGh1bmsgaXNudCAnJ1xuICAgICAgaHVua1NwbGl0ID0gaHVuay5tYXRjaCAvKEBAWyBcXC1cXCtcXCwwLTldKkBALiopXFxuKFtcXHNcXFNdKikvXG4gICAgICB7XG4gICAgICAgIHBvczogaHVua1NwbGl0WzFdXG4gICAgICAgIGRpZmY6IGh1bmtTcGxpdFsyXVxuICAgICAgICBwYXRjaDogaHVua1xuICAgICAgfVxuIl19
