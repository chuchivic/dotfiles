(function() {
  var $$, ListView, OutputViewManager, SelectListView, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data;
      ListView.__super__.initialize.apply(this, arguments);
      this.show();
      return this.parseData();
    };

    ListView.prototype.parseData = function() {
      var branches, i, item, items, len;
      items = this.data.split("\n");
      branches = [];
      for (i = 0, len = items.length; i < len; i++) {
        item = items[i];
        item = item.replace(/\s/g, '');
        if (item !== '') {
          branches.push({
            name: item
          });
        }
      }
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
                return _this.span('Current');
              }
            });
          };
        })(this));
      });
    };

    ListView.prototype.confirmed = function(arg) {
      var name;
      name = arg.name;
      this.rebase(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.rebase = function(branch) {
      return git.cmd(['rebase', branch], {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(msg) {
          OutputViewManager.getView().showContent(msg);
          atom.workspace.getTextEditors().forEach(function(editor) {
            return fs.exists(editor.getPath(), function(exist) {
              if (!exist) {
                return editor.destroy();
              }
            });
          });
          return git.refresh(_this.repo);
        };
      })(this))["catch"]((function(_this) {
        return function(msg) {
          notifier.addError(msg);
          return git.refresh(_this.repo);
        };
      })(this));
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlYmFzZS1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1RUFBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUNROzs7Ozs7O3VCQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxJQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUNsQiwwQ0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIVTs7dUJBS1osU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVo7TUFDUixRQUFBLEdBQVc7QUFDWCxXQUFBLHVDQUFBOztRQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7UUFDUCxJQUFPLElBQUEsS0FBUSxFQUFmO1VBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYztZQUFDLElBQUEsRUFBTSxJQUFQO1dBQWQsRUFERjs7QUFGRjtNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUlM7O3VCQVVYLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7dUJBRWQsSUFBQSxHQUFNLFNBQUE7O1FBQ0osSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUhJOzt1QkFLTixTQUFBLEdBQVcsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUE7SUFBSDs7dUJBRVgsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOytDQUFNLENBQUUsT0FBUixDQUFBO0lBREk7O3VCQUdOLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsT0FBRDtNQUNaLE9BQUEsR0FBVTtNQUNWLElBQUcsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSDtRQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVg7UUFDUCxPQUFBLEdBQVUsS0FGWjs7YUFHQSxFQUFBLENBQUcsU0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUksSUFBSixFQUFVLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1IsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDthQUFMLEVBQTBCLFNBQUE7Y0FDeEIsSUFBb0IsT0FBcEI7dUJBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBQUE7O1lBRHdCLENBQTFCO1VBRFE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7TUFEQyxDQUFIO0lBTFc7O3VCQVViLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQXNCLENBQUEsQ0FBQSxDQUE5QjthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGUzs7dUJBSVgsTUFBQSxHQUFRLFNBQUMsTUFBRDthQUNOLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELEVBQVcsTUFBWCxDQUFSLEVBQTRCO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQTVCLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7VUFDSixpQkFBaUIsQ0FBQyxPQUFsQixDQUFBLENBQTJCLENBQUMsV0FBNUIsQ0FBd0MsR0FBeEM7VUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBQSxDQUErQixDQUFDLE9BQWhDLENBQXdDLFNBQUMsTUFBRDttQkFDdEMsRUFBRSxDQUFDLE1BQUgsQ0FBVSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVYsRUFBNEIsU0FBQyxLQUFEO2NBQVcsSUFBb0IsQ0FBSSxLQUF4Qjt1QkFBQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBQUE7O1lBQVgsQ0FBNUI7VUFEc0MsQ0FBeEM7aUJBRUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtRQUpJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBTUEsRUFBQyxLQUFELEVBTkEsQ0FNTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtVQUNMLFFBQVEsQ0FBQyxRQUFULENBQWtCLEdBQWxCO2lCQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7UUFGSztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOUDtJQURNOzs7O0tBMUNhO0FBUHpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xueyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICAgIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEpIC0+XG4gICAgICBzdXBlclxuICAgICAgQHNob3coKVxuICAgICAgQHBhcnNlRGF0YSgpXG5cbiAgICBwYXJzZURhdGE6IC0+XG4gICAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpXG4gICAgICBicmFuY2hlcyA9IFtdXG4gICAgICBmb3IgaXRlbSBpbiBpdGVtc1xuICAgICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgICAgIHVubGVzcyBpdGVtIGlzICcnXG4gICAgICAgICAgYnJhbmNoZXMucHVzaCB7bmFtZTogaXRlbX1cbiAgICAgIEBzZXRJdGVtcyBicmFuY2hlc1xuICAgICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICAgIGdldEZpbHRlcktleTogLT4gJ25hbWUnXG5cbiAgICBzaG93OiAtPlxuICAgICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICAgIEBwYW5lbC5zaG93KClcbiAgICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICAgIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gICAgaGlkZTogLT5cbiAgICAgIEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgICB2aWV3Rm9ySXRlbTogKHtuYW1lfSkgLT5cbiAgICAgIGN1cnJlbnQgPSBmYWxzZVxuICAgICAgaWYgbmFtZS5zdGFydHNXaXRoIFwiKlwiXG4gICAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDEpXG4gICAgICAgIGN1cnJlbnQgPSB0cnVlXG4gICAgICAkJCAtPlxuICAgICAgICBAbGkgbmFtZSwgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgICAgICBAc3BhbignQ3VycmVudCcpIGlmIGN1cnJlbnRcblxuICAgIGNvbmZpcm1lZDogKHtuYW1lfSkgLT5cbiAgICAgIEByZWJhc2UgbmFtZS5tYXRjaCgvXFwqPyguKikvKVsxXVxuICAgICAgQGNhbmNlbCgpXG5cbiAgICByZWJhc2U6IChicmFuY2gpIC0+XG4gICAgICBnaXQuY21kKFsncmViYXNlJywgYnJhbmNoXSwgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAudGhlbiAobXNnKSA9PlxuICAgICAgICBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KCkuc2hvd0NvbnRlbnQobXNnKVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZvckVhY2ggKGVkaXRvcikgLT5cbiAgICAgICAgICBmcy5leGlzdHMgZWRpdG9yLmdldFBhdGgoKSwgKGV4aXN0KSAtPiBlZGl0b3IuZGVzdHJveSgpIGlmIG5vdCBleGlzdFxuICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgICAgLmNhdGNoIChtc2cpID0+XG4gICAgICAgIG5vdGlmaWVyLmFkZEVycm9yIG1zZ1xuICAgICAgICBnaXQucmVmcmVzaCBAcmVwb1xuIl19
