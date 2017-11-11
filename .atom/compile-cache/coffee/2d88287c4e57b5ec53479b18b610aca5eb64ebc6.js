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
          OutputViewManager.create().setContent(msg).finish();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlYmFzZS1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1RUFBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHdCQUFSOztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUNROzs7Ozs7O3VCQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxJQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUNsQiwwQ0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIVTs7dUJBS1osU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVo7TUFDUixRQUFBLEdBQVc7QUFDWCxXQUFBLHVDQUFBOztRQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7UUFDUCxJQUFPLElBQUEsS0FBUSxFQUFmO1VBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYztZQUFDLElBQUEsRUFBTSxJQUFQO1dBQWQsRUFERjs7QUFGRjtNQUlBLElBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUlM7O3VCQVVYLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7dUJBRWQsSUFBQSxHQUFNLFNBQUE7O1FBQ0osSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUhJOzt1QkFLTixTQUFBLEdBQVcsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUE7SUFBSDs7dUJBRVgsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOytDQUFNLENBQUUsT0FBUixDQUFBO0lBREk7O3VCQUdOLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsT0FBRDtNQUNaLE9BQUEsR0FBVTtNQUNWLElBQUcsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBSDtRQUNFLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVg7UUFDUCxPQUFBLEdBQVUsS0FGWjs7YUFHQSxFQUFBLENBQUcsU0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUksSUFBSixFQUFVLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1IsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sWUFBUDthQUFMLEVBQTBCLFNBQUE7Y0FDeEIsSUFBb0IsT0FBcEI7dUJBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxTQUFOLEVBQUE7O1lBRHdCLENBQTFCO1VBRFE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7TUFEQyxDQUFIO0lBTFc7O3VCQVViLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsT0FBRDtNQUNWLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQXNCLENBQUEsQ0FBQSxDQUE5QjthQUNBLElBQUMsQ0FBQSxNQUFELENBQUE7SUFGUzs7dUJBSVgsTUFBQSxHQUFRLFNBQUMsTUFBRDthQUNOLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELEVBQVcsTUFBWCxDQUFSLEVBQTRCO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQTVCLENBQ0EsQ0FBQyxJQURELENBQ00sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7VUFDSixpQkFBaUIsQ0FBQyxNQUFsQixDQUFBLENBQTBCLENBQUMsVUFBM0IsQ0FBc0MsR0FBdEMsQ0FBMEMsQ0FBQyxNQUEzQyxDQUFBO1VBQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQUEsQ0FBK0IsQ0FBQyxPQUFoQyxDQUF3QyxTQUFDLE1BQUQ7bUJBQ3RDLEVBQUUsQ0FBQyxNQUFILENBQVUsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFWLEVBQTRCLFNBQUMsS0FBRDtjQUFXLElBQW9CLENBQUksS0FBeEI7dUJBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxFQUFBOztZQUFYLENBQTVCO1VBRHNDLENBQXhDO2lCQUVBLEdBQUcsQ0FBQyxPQUFKLENBQVksS0FBQyxDQUFBLElBQWI7UUFKSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQU1BLEVBQUMsS0FBRCxFQU5BLENBTU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7VUFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtpQkFDQSxHQUFHLENBQUMsT0FBSixDQUFZLEtBQUMsQ0FBQSxJQUFiO1FBRks7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTlA7SUFETTs7OztLQTFDYTtBQVB6QiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuT3V0cHV0Vmlld01hbmFnZXIgPSByZXF1aXJlICcuLi9vdXRwdXQtdmlldy1tYW5hZ2VyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNsYXNzIExpc3RWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgICBpbml0aWFsaXplOiAoQHJlcG8sIEBkYXRhKSAtPlxuICAgICAgc3VwZXJcbiAgICAgIEBzaG93KClcbiAgICAgIEBwYXJzZURhdGEoKVxuXG4gICAgcGFyc2VEYXRhOiAtPlxuICAgICAgaXRlbXMgPSBAZGF0YS5zcGxpdChcIlxcblwiKVxuICAgICAgYnJhbmNoZXMgPSBbXVxuICAgICAgZm9yIGl0ZW0gaW4gaXRlbXNcbiAgICAgICAgaXRlbSA9IGl0ZW0ucmVwbGFjZSgvXFxzL2csICcnKVxuICAgICAgICB1bmxlc3MgaXRlbSBpcyAnJ1xuICAgICAgICAgIGJyYW5jaGVzLnB1c2gge25hbWU6IGl0ZW19XG4gICAgICBAc2V0SXRlbXMgYnJhbmNoZXNcbiAgICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgICBnZXRGaWx0ZXJLZXk6IC0+ICduYW1lJ1xuXG4gICAgc2hvdzogLT5cbiAgICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgICBAcGFuZWwuc2hvdygpXG4gICAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICAgIGhpZGU6IC0+XG4gICAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gICAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgICBjdXJyZW50ID0gZmFsc2VcbiAgICAgIGlmIG5hbWUuc3RhcnRzV2l0aCBcIipcIlxuICAgICAgICBuYW1lID0gbmFtZS5zbGljZSgxKVxuICAgICAgICBjdXJyZW50ID0gdHJ1ZVxuICAgICAgJCQgLT5cbiAgICAgICAgQGxpIG5hbWUsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgICAgQHNwYW4oJ0N1cnJlbnQnKSBpZiBjdXJyZW50XG5cbiAgICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgICBAcmViYXNlIG5hbWUubWF0Y2goL1xcKj8oLiopLylbMV1cbiAgICAgIEBjYW5jZWwoKVxuXG4gICAgcmViYXNlOiAoYnJhbmNoKSAtPlxuICAgICAgZ2l0LmNtZChbJ3JlYmFzZScsIGJyYW5jaF0sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgLnRoZW4gKG1zZykgPT5cbiAgICAgICAgT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKCkuc2V0Q29udGVudChtc2cpLmZpbmlzaCgpXG4gICAgICAgIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCkuZm9yRWFjaCAoZWRpdG9yKSAtPlxuICAgICAgICAgIGZzLmV4aXN0cyBlZGl0b3IuZ2V0UGF0aCgpLCAoZXhpc3QpIC0+IGVkaXRvci5kZXN0cm95KCkgaWYgbm90IGV4aXN0XG4gICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4gICAgICAuY2F0Y2ggKG1zZykgPT5cbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgbXNnXG4gICAgICAgIGdpdC5yZWZyZXNoIEByZXBvXG4iXX0=
