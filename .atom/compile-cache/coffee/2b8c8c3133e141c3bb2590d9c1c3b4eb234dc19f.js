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
                "class": 'btn btn-success inline-block-tight btn-unstage-button'
              }, 'Unstage');
            });
          };
        })(this));
      });
      viewButton.appendTo(this);
      return this.on('click', 'button', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if ($(target).hasClass('btn-unstage-button')) {
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
      return git.cmd(['reset', 'HEAD', '--'].concat(files), {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(msg) {
        return notifier.addSuccess(msg);
      })["catch"](function(msg) {
        return notifier.addError(msg);
      });
    };

    return SelectStageFilesView;

  })(SelectListMultipleView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3NlbGVjdC11bnN0YWdlLWZpbGVzLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1RUFBQTtJQUFBOzs7RUFBQSxNQUFVLE9BQUEsQ0FBUSxzQkFBUixDQUFWLEVBQUMsU0FBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsc0JBQUEsR0FBeUIsT0FBQSxDQUFRLDZCQUFSOztFQUV6QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O21DQUVKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFDWCxzREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBSlU7O21DQU1aLFlBQUEsR0FBYyxTQUFBO2FBQ1o7SUFEWTs7bUNBR2QsVUFBQSxHQUFZLFNBQUE7QUFDVixVQUFBO01BQUEsVUFBQSxHQUFhLEVBQUEsQ0FBRyxTQUFBO2VBQ2QsSUFBQyxDQUFBLEdBQUQsQ0FBSztVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8scUJBQVA7U0FBTCxFQUFtQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ2pDLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtxQkFDSCxLQUFDLENBQUEsTUFBRCxDQUFRO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0RBQVA7ZUFBUixFQUFxRSxRQUFyRTtZQURHLENBQUw7bUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBO3FCQUNILEtBQUMsQ0FBQSxNQUFELENBQVE7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1REFBUDtlQUFSLEVBQXdFLFNBQXhFO1lBREcsQ0FBTDtVQUhpQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkM7TUFEYyxDQUFIO01BTWIsVUFBVSxDQUFDLFFBQVgsQ0FBb0IsSUFBcEI7YUFFQSxJQUFDLENBQUEsRUFBRCxDQUFJLE9BQUosRUFBYSxRQUFiLEVBQXVCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ3JCLGNBQUE7VUFEdUIsU0FBRDtVQUN0QixJQUFlLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxRQUFWLENBQW1CLG9CQUFuQixDQUFmO1lBQUEsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFBOztVQUNBLElBQWEsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFFBQVYsQ0FBbUIsbUJBQW5CLENBQWI7bUJBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBQSxFQUFBOztRQUZxQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkI7SUFUVTs7bUNBYVosSUFBQSxHQUFNLFNBQUE7O1FBQ0osSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFFQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUpJOzttQ0FNTixTQUFBLEdBQVcsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUE7SUFBSDs7bUNBRVgsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOytDQUFNLENBQUUsT0FBUixDQUFBO0lBREk7O21DQUdOLFdBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxVQUFQO2FBQ1gsRUFBQSxDQUFHLFNBQUE7ZUFDRCxJQUFDLENBQUEsRUFBRCxDQUFJLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDRixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2FBQUwsRUFBMEIsU0FBQTtxQkFDeEIsS0FBQyxDQUFBLElBQUQsQ0FBTTtnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdCQUFQO2VBQU4sRUFBdUMsSUFBSSxDQUFDLElBQTVDO1lBRHdCLENBQTFCO1lBRUEsSUFBRyxrQkFBSDtxQkFBb0IsS0FBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBQXBCO2FBQUEsTUFBQTtxQkFBMEMsS0FBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsSUFBWCxFQUExQzs7VUFIRTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBSjtNQURDLENBQUg7SUFEVzs7bUNBT2IsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUNULFVBQUE7TUFBQSxLQUFBOztBQUFTO2FBQUEsdUNBQUE7O3VCQUFBLElBQUksQ0FBQztBQUFMOzs7TUFDVCxJQUFDLENBQUEsTUFBRCxDQUFBO2FBRUEsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLElBQWxCLENBQXVCLENBQUMsTUFBeEIsQ0FBK0IsS0FBL0IsQ0FBUixFQUErQztRQUFBLEdBQUEsRUFBSyxJQUFDLENBQUEsSUFBSSxDQUFDLG1CQUFOLENBQUEsQ0FBTDtPQUEvQyxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsR0FBRDtlQUFTLFFBQVEsQ0FBQyxVQUFULENBQW9CLEdBQXBCO01BQVQsQ0FETixDQUVBLEVBQUMsS0FBRCxFQUZBLENBRU8sU0FBQyxHQUFEO2VBQVMsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEI7TUFBVCxDQUZQO0lBSlM7Ozs7S0ExQ3NCO0FBUG5DIiwic291cmNlc0NvbnRlbnQiOlsieyQsICQkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuU2VsZWN0TGlzdE11bHRpcGxlVmlldyA9IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QtbXVsdGlwbGUtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VsZWN0U3RhZ2VGaWxlc1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0TXVsdGlwbGVWaWV3XG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBpdGVtcykgLT5cbiAgICBzdXBlclxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgaXRlbXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGdldEZpbHRlcktleTogLT5cbiAgICAncGF0aCdcblxuICBhZGRCdXR0b25zOiAtPlxuICAgIHZpZXdCdXR0b24gPSAkJCAtPlxuICAgICAgQGRpdiBjbGFzczogJ3NlbGVjdC1saXN0LWJ1dHRvbnMnLCA9PlxuICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tZXJyb3IgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1jYW5jZWwtYnV0dG9uJywgJ0NhbmNlbCdcbiAgICAgICAgQGRpdiA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXN1Y2Nlc3MgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi11bnN0YWdlLWJ1dHRvbicsICdVbnN0YWdlJ1xuICAgIHZpZXdCdXR0b24uYXBwZW5kVG8odGhpcylcblxuICAgIEBvbiAnY2xpY2snLCAnYnV0dG9uJywgKHt0YXJnZXR9KSA9PlxuICAgICAgQGNvbXBsZXRlKCkgaWYgJCh0YXJnZXQpLmhhc0NsYXNzKCdidG4tdW5zdGFnZS1idXR0b24nKVxuICAgICAgQGNhbmNlbCgpIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLWNhbmNlbC1idXR0b24nKVxuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoaXRlbSwgbWF0Y2hlZFN0cikgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2lubGluZS1ibG9jayBoaWdobGlnaHQnLCBpdGVtLm1vZGVcbiAgICAgICAgaWYgbWF0Y2hlZFN0cj8gdGhlbiBAcmF3KG1hdGNoZWRTdHIpIGVsc2UgQHNwYW4gaXRlbS5wYXRoXG5cbiAgY29tcGxldGVkOiAoaXRlbXMpIC0+XG4gICAgZmlsZXMgPSAoaXRlbS5wYXRoIGZvciBpdGVtIGluIGl0ZW1zKVxuICAgIEBjYW5jZWwoKVxuXG4gICAgZ2l0LmNtZChbJ3Jlc2V0JywgJ0hFQUQnLCAnLS0nXS5jb25jYXQoZmlsZXMpLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAobXNnKSAtPiBub3RpZmllci5hZGRTdWNjZXNzIG1zZ1xuICAgIC5jYXRjaCAobXNnKSAtPiBub3RpZmllci5hZGRFcnJvciBtc2dcbiJdfQ==
