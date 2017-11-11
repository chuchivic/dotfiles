(function() {
  var $$, BufferedProcess, SelectListView, SelectStageHunkFile, SelectStageHunks, git, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  SelectStageHunks = require('./select-stage-hunks-view');

  git = require('../git');

  module.exports = SelectStageHunkFile = (function(superClass) {
    extend(SelectStageHunkFile, superClass);

    function SelectStageHunkFile() {
      return SelectStageHunkFile.__super__.constructor.apply(this, arguments);
    }

    SelectStageHunkFile.prototype.initialize = function(repo, items) {
      this.repo = repo;
      SelectStageHunkFile.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(items);
      return this.focusFilterEditor();
    };

    SelectStageHunkFile.prototype.getFilterKey = function() {
      return 'path';
    };

    SelectStageHunkFile.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    SelectStageHunkFile.prototype.cancelled = function() {
      return this.hide();
    };

    SelectStageHunkFile.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    SelectStageHunkFile.prototype.viewForItem = function(item) {
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
            return _this.span({
              "class": 'text-warning'
            }, item.path);
          };
        })(this));
      });
    };

    SelectStageHunkFile.prototype.confirmed = function(arg) {
      var path;
      path = arg.path;
      this.cancel();
      return git.diff(this.repo, path).then((function(_this) {
        return function(data) {
          return new SelectStageHunks(_this.repo, data);
        };
      })(this));
    };

    return SelectStageHunkFile;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3NlbGVjdC1zdGFnZS1odW5rLWZpbGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9GQUFBO0lBQUE7OztFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNMLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSwyQkFBUjs7RUFDbkIsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7a0NBRUosVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVI7TUFBQyxJQUFDLENBQUEsT0FBRDtNQUNYLHFEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFKVTs7a0NBTVosWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOztrQ0FFZCxJQUFBLEdBQU0sU0FBQTs7UUFDSixJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO0lBSEk7O2tDQUtOLFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUFIOztrQ0FFWCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7K0NBQU0sQ0FBRSxPQUFSLENBQUE7SUFESTs7a0NBR04sV0FBQSxHQUFhLFNBQUMsSUFBRDthQUNYLEVBQUEsQ0FBRyxTQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ0YsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDthQUFMLEVBQTBCLFNBQUE7cUJBQ3hCLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx3QkFBUDtlQUFOLEVBQXVDLElBQUksQ0FBQyxJQUE1QztZQUR3QixDQUExQjttQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxjQUFQO2FBQU4sRUFBNkIsSUFBSSxDQUFDLElBQWxDO1VBSEU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUo7TUFEQyxDQUFIO0lBRFc7O2tDQU9iLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQUMsQ0FBQSxNQUFELENBQUE7YUFDQSxHQUFHLENBQUMsSUFBSixDQUFTLElBQUMsQ0FBQSxJQUFWLEVBQWdCLElBQWhCLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7aUJBQWMsSUFBQSxnQkFBQSxDQUFpQixLQUFDLENBQUEsSUFBbEIsRUFBd0IsSUFBeEI7UUFBZDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETjtJQUZTOzs7O0tBM0JxQjtBQU5sQyIsInNvdXJjZXNDb250ZW50IjpbIntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbnskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5TZWxlY3RTdGFnZUh1bmtzID0gcmVxdWlyZSAnLi9zZWxlY3Qtc3RhZ2UtaHVua3MtdmlldydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VsZWN0U3RhZ2VIdW5rRmlsZSBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBpdGVtcykgLT5cbiAgICBzdXBlclxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgaXRlbXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGdldEZpbHRlcktleTogLT4gJ3BhdGgnXG5cbiAgc2hvdzogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoaXRlbSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAc3BhbiBjbGFzczogJ2lubGluZS1ibG9jayBoaWdobGlnaHQnLCBpdGVtLm1vZGVcbiAgICAgICAgQHNwYW4gY2xhc3M6ICd0ZXh0LXdhcm5pbmcnLCBpdGVtLnBhdGhcblxuICBjb25maXJtZWQ6ICh7cGF0aH0pIC0+XG4gICAgQGNhbmNlbCgpXG4gICAgZ2l0LmRpZmYoQHJlcG8sIHBhdGgpXG4gICAgLnRoZW4gKGRhdGEpID0+IG5ldyBTZWxlY3RTdGFnZUh1bmtzKEByZXBvLCBkYXRhKVxuIl19
