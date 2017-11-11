(function() {
  var $, $$, SelectListMultipleView, SelectStageFilesView, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$;

  git = require('../git');

  notifier = require('../notifier');

  SelectListMultipleView = require('./select-list-multiple-view');

  module.exports = SelectStageFilesView = (function(superClass) {
    extend(SelectStageFilesView, superClass);

    function SelectStageFilesView() {
      return SelectStageFilesView.__super__.constructor.apply(this, arguments);
    }

    SelectStageFilesView.prototype.initialize = function(repo, items) {
      this.repo = repo;
      SelectStageFilesView.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(items);
      return this.focusFilterEditor();
    };

    SelectStageFilesView.prototype.getFilterKey = function() {
      return 'path';
    };

    SelectStageFilesView.prototype.addButtons = function() {
      var viewButton;
      viewButton = $$(function() {
        return this.div({
          "class": 'select-list-buttons'
        }, (function(_this) {
          return function() {
            _this.div(function() {
              return _this.button({
                "class": 'btn btn-error inline-block-tight btn-cancel-button'
              }, 'Cancel');
            });
            return _this.div(function() {
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

    SelectStageFilesView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    SelectStageFilesView.prototype.cancelled = function() {
      return this.hide();
    };

    SelectStageFilesView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    SelectStageFilesView.prototype.viewForItem = function(item, matchedStr) {
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'pull-right'
            }, function() {
              return _this.span({
                "class": 'inline-block highlight'
              }, item.mode);
            });
            if (matchedStr != null) {
              return _this.raw(matchedStr);
            } else {
              return _this.span(item.path);
            }
          };
        })(this));
      });
    };

    SelectStageFilesView.prototype.completed = function(items) {
      var files, item;
      files = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          results.push(item.path);
        }
        return results;
      })();
      this.cancel();
      return git.cmd(['add', '-f'].concat(files), {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(data) {
        if (data === '') {
          return notifier.addSuccess('File(s) staged successfully');
        } else {
          return notifier.addSuccess(data);
        }
      });
    };

    return SelectStageFilesView;

  })(SelectListMultipleView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3NlbGVjdC1zdGFnZS1maWxlcy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUVBQUE7SUFBQTs7O0VBQUEsTUFBVSxPQUFBLENBQVEsc0JBQVIsQ0FBVixFQUFDLFNBQUQsRUFBSTs7RUFFSixHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw2QkFBUjs7RUFFekIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OzttQ0FFSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsS0FBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQ1gsc0RBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVY7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUpVOzttQ0FNWixZQUFBLEdBQWMsU0FBQTthQUFHO0lBQUg7O21DQUVkLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLFVBQUEsR0FBYSxFQUFBLENBQUcsU0FBQTtlQUNkLElBQUMsQ0FBQSxHQUFELENBQUs7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO1NBQUwsRUFBbUMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUNqQyxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7cUJBQ0gsS0FBQyxDQUFBLE1BQUQsQ0FBUTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG9EQUFQO2VBQVIsRUFBcUUsUUFBckU7WUFERyxDQUFMO21CQUVBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtxQkFDSCxLQUFDLENBQUEsTUFBRCxDQUFRO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scURBQVA7ZUFBUixFQUFzRSxPQUF0RTtZQURHLENBQUw7VUFIaUM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5DO01BRGMsQ0FBSDtNQU1iLFVBQVUsQ0FBQyxRQUFYLENBQW9CLElBQXBCO2FBRUEsSUFBQyxDQUFBLEVBQUQsQ0FBSSxPQUFKLEVBQWEsUUFBYixFQUF1QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtBQUNyQixjQUFBO1VBRHVCLFNBQUQ7VUFDdEIsSUFBZSxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsUUFBVixDQUFtQixrQkFBbkIsQ0FBZjtZQUFBLEtBQUMsQ0FBQSxRQUFELENBQUEsRUFBQTs7VUFDQSxJQUFhLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLG1CQUFuQixDQUFiO21CQUFBLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBQTs7UUFGcUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCO0lBVFU7O21DQWFaLElBQUEsR0FBTSxTQUFBOztRQUNKLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO2FBQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7SUFISTs7bUNBS04sU0FBQSxHQUFXLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBRCxDQUFBO0lBQUg7O21DQUVYLElBQUEsR0FBTSxTQUFBO0FBQUcsVUFBQTsrQ0FBTSxDQUFFLE9BQVIsQ0FBQTtJQUFIOzttQ0FFTixXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sVUFBUDthQUNYLEVBQUEsQ0FBRyxTQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ0YsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDthQUFMLEVBQTBCLFNBQUE7cUJBQ3hCLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx3QkFBUDtlQUFOLEVBQXVDLElBQUksQ0FBQyxJQUE1QztZQUR3QixDQUExQjtZQUVBLElBQUcsa0JBQUg7cUJBQW9CLEtBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQUFwQjthQUFBLE1BQUE7cUJBQTBDLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLElBQVgsRUFBMUM7O1VBSEU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUo7TUFEQyxDQUFIO0lBRFc7O21DQU9iLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDVCxVQUFBO01BQUEsS0FBQTs7QUFBUzthQUFBLHVDQUFBOzt1QkFBQSxJQUFJLENBQUM7QUFBTDs7O01BQ1QsSUFBQyxDQUFBLE1BQUQsQ0FBQTthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFhLENBQUMsTUFBZCxDQUFxQixLQUFyQixDQUFSLEVBQXFDO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQXJDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO1FBQ0osSUFBRyxJQUFBLEtBQVEsRUFBWDtpQkFDRSxRQUFRLENBQUMsVUFBVCxDQUFvQiw2QkFBcEIsRUFERjtTQUFBLE1BQUE7aUJBR0UsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsSUFBcEIsRUFIRjs7TUFESSxDQUROO0lBSFM7Ozs7S0F2Q3NCO0FBUG5DIiwic291cmNlc0NvbnRlbnQiOlsieyQsICQkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuU2VsZWN0TGlzdE11bHRpcGxlVmlldyA9IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QtbXVsdGlwbGUtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VsZWN0U3RhZ2VGaWxlc1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0TXVsdGlwbGVWaWV3XG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBpdGVtcykgLT5cbiAgICBzdXBlclxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgaXRlbXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGdldEZpbHRlcktleTogLT4gJ3BhdGgnXG5cbiAgYWRkQnV0dG9uczogLT5cbiAgICB2aWV3QnV0dG9uID0gJCQgLT5cbiAgICAgIEBkaXYgY2xhc3M6ICdzZWxlY3QtbGlzdC1idXR0b25zJywgPT5cbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLWVycm9yIGlubGluZS1ibG9jay10aWdodCBidG4tY2FuY2VsLWJ1dHRvbicsICdDYW5jZWwnXG4gICAgICAgIEBkaXYgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1zdWNjZXNzIGlubGluZS1ibG9jay10aWdodCBidG4tc3RhZ2UtYnV0dG9uJywgJ1N0YWdlJ1xuICAgIHZpZXdCdXR0b24uYXBwZW5kVG8odGhpcylcblxuICAgIEBvbiAnY2xpY2snLCAnYnV0dG9uJywgKHt0YXJnZXR9KSA9PlxuICAgICAgQGNvbXBsZXRlKCkgaWYgJCh0YXJnZXQpLmhhc0NsYXNzKCdidG4tc3RhZ2UtYnV0dG9uJylcbiAgICAgIEBjYW5jZWwoKSBpZiAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bi1jYW5jZWwtYnV0dG9uJylcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICBoaWRlOiAtPiBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoaXRlbSwgbWF0Y2hlZFN0cikgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2lubGluZS1ibG9jayBoaWdobGlnaHQnLCBpdGVtLm1vZGVcbiAgICAgICAgaWYgbWF0Y2hlZFN0cj8gdGhlbiBAcmF3KG1hdGNoZWRTdHIpIGVsc2UgQHNwYW4gaXRlbS5wYXRoXG5cbiAgY29tcGxldGVkOiAoaXRlbXMpIC0+XG4gICAgZmlsZXMgPSAoaXRlbS5wYXRoIGZvciBpdGVtIGluIGl0ZW1zKVxuICAgIEBjYW5jZWwoKVxuICAgIGdpdC5jbWQoWydhZGQnLCAnLWYnXS5jb25jYXQoZmlsZXMpLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEgaXMgJydcbiAgICAgICAgbm90aWZpZXIuYWRkU3VjY2VzcyAnRmlsZShzKSBzdGFnZWQgc3VjY2Vzc2Z1bGx5J1xuICAgICAgZWxzZVxuICAgICAgICBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiJdfQ==
