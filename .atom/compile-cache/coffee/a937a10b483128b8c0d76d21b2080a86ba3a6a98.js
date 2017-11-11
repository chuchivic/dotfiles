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
      this.selectedItems.push('foobar');
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
                "class": 'btn btn-success inline-block-tight btn-apply-button'
              }, 'Apply');
            });
          };
        })(this));
      });
      viewButton.appendTo(this);
      return this.on('click', 'button', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if ($(target).hasClass('btn-apply-button')) {
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
      var classString;
      classString = item.staged ? 'active' : '';
      return $$(function() {
        return this.li({
          "class": classString
        }, (function(_this) {
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

    SelectStageFilesView.prototype.confirmed = function(item, viewItem) {
      item.staged = !item.staged;
      return viewItem.toggleClass('active');
    };

    SelectStageFilesView.prototype.completed = function(_) {
      var stage, stagePromise, unstage, unstagePromise;
      stage = this.items.filter(function(item) {
        return item.staged;
      }).map(function(arg) {
        var path;
        path = arg.path;
        return path;
      });
      unstage = this.items.filter(function(item) {
        return !item.staged;
      }).map(function(arg) {
        var path;
        path = arg.path;
        return path;
      });
      stagePromise = stage.length > 0 ? git.cmd(['add', '-f'].concat(stage), {
        cwd: this.repo.getWorkingDirectory()
      }) : void 0;
      unstagePromise = unstage.length > 0 ? git.cmd(['reset', 'HEAD', '--'].concat(unstage), {
        cwd: this.repo.getWorkingDirectory()
      }) : void 0;
      Promise.all([stagePromise, unstagePromise]).then(function(data) {
        return notifier.addSuccess('Index updated successfully');
      })["catch"](notifier.addError);
      return this.cancel();
    };

    return SelectStageFilesView;

  })(SelectListMultipleView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3NlbGVjdC1zdGFnZS1maWxlcy12aWV3LWJldGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1RUFBQTtJQUFBOzs7RUFBQSxNQUFVLE9BQUEsQ0FBUSxzQkFBUixDQUFWLEVBQUMsU0FBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDZCQUFSOztFQUV6QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O21DQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFDWCxzREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQW9CLFFBQXBCO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBTFU7O21DQU9aLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7bUNBRWQsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsVUFBQSxHQUFhLEVBQUEsQ0FBRyxTQUFBO2VBQ2QsSUFBQyxDQUFBLEdBQUQsQ0FBSztVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7U0FBTCxFQUFtQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ2pDLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtxQkFDSCxLQUFDLENBQUEsTUFBRCxDQUFRO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0RBQVA7ZUFBUixFQUFxRSxRQUFyRTtZQURHLENBQUw7bUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO3FCQUNI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QTBCLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsSUFBUixDQUFhLENBQUMsTUFBZCxDQUFxQixLQUFyQixDQUFSLEVBQXFDO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQXJDLENBQTFCLEdBQUE7TUFDZixjQUFBLEdBQW9CLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCLEdBQTJCLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixJQUFsQixDQUF1QixDQUFDLE1BQXhCLENBQStCLE9BQS9CLENBQVIsRUFBaUQ7UUFBQSxHQUFBLEVBQUssSUFBQyxDQUFBLElBQUksQ0FBQyxtQkFBTixDQUFBLENBQUw7T0FBakQsQ0FBM0IsR0FBQTtNQUNqQixPQUFPLENBQUMsR0FBUixDQUFZLENBQUMsWUFBRCxFQUFlLGNBQWYsQ0FBWixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtlQUFVLFFBQVEsQ0FBQyxVQUFULENBQW9CLDRCQUFwQjtNQUFWLENBRE4sQ0FFQSxFQUFDLEtBQUQsRUFGQSxDQUVPLFFBQVEsQ0FBQyxRQUZoQjthQUdBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFSUzs7OztLQTVDc0I7QUFQbkMiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCwgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5TZWxlY3RMaXN0TXVsdGlwbGVWaWV3ID0gcmVxdWlyZSAnLi9zZWxlY3QtbGlzdC1tdWx0aXBsZS12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTZWxlY3RTdGFnZUZpbGVzVmlldyBleHRlbmRzIFNlbGVjdExpc3RNdWx0aXBsZVZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBpdGVtcykgLT5cbiAgICBzdXBlclxuICAgIEBzZWxlY3RlZEl0ZW1zLnB1c2ggJ2Zvb2JhcicgIyBoYWNrIHRvIG92ZXJyaWRlIHN1cGVyIGNsYXNzIGJlaGF2aW9yIHNvIDo6Y29tcGxldGVkIHdpbGwgYmUgY2FsbGVkXG4gICAgQHNob3coKVxuICAgIEBzZXRJdGVtcyBpdGVtc1xuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAncGF0aCdcblxuICBhZGRCdXR0b25zOiAtPlxuICAgIHZpZXdCdXR0b24gPSAkJCAtPlxuICAgICAgQGRpdiBjbGFzczogJ3NlbGVjdC1saXN0LWJ1dHRvbnMnLCA9PlxuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tZXJyb3IgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1jYW5jZWwtYnV0dG9uJywgJ0NhbmNlbCdcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXN1Y2Nlc3MgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1hcHBseS1idXR0b24nLCAnQXBwbHknXG4gICAgdmlld0J1dHRvbi5hcHBlbmRUbyh0aGlzKVxuXG4gICAgQG9uICdjbGljaycsICdidXR0b24nLCAoe3RhcmdldH0pID0+XG4gICAgICBAY29tcGxldGUoKSBpZiAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bi1hcHBseS1idXR0b24nKVxuICAgICAgQGNhbmNlbCgpIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLWNhbmNlbC1idXR0b24nKVxuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06IChpdGVtLCBtYXRjaGVkU3RyKSAtPlxuICAgIGNsYXNzU3RyaW5nID0gaWYgaXRlbS5zdGFnZWQgdGhlbiAnYWN0aXZlJyBlbHNlICcnXG4gICAgJCQgLT5cbiAgICAgIEBsaSBjbGFzczogY2xhc3NTdHJpbmcsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2lubGluZS1ibG9jayBoaWdobGlnaHQnLCBpdGVtLm1vZGVcbiAgICAgICAgaWYgbWF0Y2hlZFN0cj8gdGhlbiBAcmF3KG1hdGNoZWRTdHIpIGVsc2UgQHNwYW4gaXRlbS5wYXRoXG5cbiAgY29uZmlybWVkOiAoaXRlbSwgdmlld0l0ZW0pIC0+XG4gICAgaXRlbS5zdGFnZWQgPSBub3QgaXRlbS5zdGFnZWRcbiAgICB2aWV3SXRlbS50b2dnbGVDbGFzcygnYWN0aXZlJylcblxuICBjb21wbGV0ZWQ6IChfKSAtPlxuICAgIHN0YWdlID0gQGl0ZW1zLmZpbHRlcigoaXRlbSkgLT4gaXRlbS5zdGFnZWQpLm1hcCAoe3BhdGh9KSAtPiBwYXRoXG4gICAgdW5zdGFnZSA9IEBpdGVtcy5maWx0ZXIoKGl0ZW0pIC0+IG5vdCBpdGVtLnN0YWdlZCkubWFwICh7cGF0aH0pIC0+IHBhdGhcbiAgICBzdGFnZVByb21pc2UgPSBpZiBzdGFnZS5sZW5ndGggPiAwICB0aGVuIGdpdC5jbWQoWydhZGQnLCAnLWYnXS5jb25jYXQoc3RhZ2UpLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICB1bnN0YWdlUHJvbWlzZSA9IGlmIHVuc3RhZ2UubGVuZ3RoID4gMCB0aGVuIGdpdC5jbWQoWydyZXNldCcsICdIRUFEJywgJy0tJ10uY29uY2F0KHVuc3RhZ2UpLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICBQcm9taXNlLmFsbChbc3RhZ2VQcm9taXNlLCB1bnN0YWdlUHJvbWlzZV0pXG4gICAgLnRoZW4gKGRhdGEpIC0+IG5vdGlmaWVyLmFkZFN1Y2Nlc3MgJ0luZGV4IHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5J1xuICAgIC5jYXRjaCBub3RpZmllci5hZGRFcnJvclxuICAgIEBjYW5jZWwoKVxuIl19
