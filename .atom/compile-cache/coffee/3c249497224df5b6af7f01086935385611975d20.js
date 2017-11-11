(function() {
  var $$, ListView, OutputViewManager, SelectListView, fs, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  OutputViewManager = require('../output-view-manager');

  notifier = require('../notifier');

  module.exports = ListView = (function(superClass) {
    extend(ListView, superClass);

    function ListView() {
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function(repo, data1, args) {
      this.repo = repo;
      this.data = data1;
      this.args = args != null ? args : [];
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
      this.merge(name.match(/\*?(.*)/)[1]);
      return this.cancel();
    };

    ListView.prototype.merge = function(branch) {
      var mergeArg;
      mergeArg = ['merge'].concat(this.args).concat([branch]);
      return git.cmd(mergeArg, {
        cwd: this.repo.getWorkingDirectory()
      }, {
        color: true
      }).then((function(_this) {
        return function(data) {
          OutputViewManager.create().setContent(data).finish();
          atom.workspace.getTextEditors().forEach(function(editor) {
            return fs.exists(editor.getPath(), function(exist) {
              if (!exist) {
                return editor.destroy();
              }
            });
          });
          return git.refresh(_this.repo);
        };
      })(this))["catch"](function(msg) {
        return notifier.addError(msg);
      });
    };

    return ListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL21lcmdlLWxpc3Qtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHVFQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVYLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7dUJBQ0osVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFRLEtBQVIsRUFBZSxJQUFmO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsT0FBRDtNQUFPLElBQUMsQ0FBQSxzQkFBRCxPQUFNO01BQy9CLDBDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtJQUhVOzt1QkFLWixTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7TUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWjtNQUNSLFFBQUEsR0FBVztBQUNYLFdBQUEsdUNBQUE7O1FBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQjtRQUNQLElBQU8sSUFBQSxLQUFRLEVBQWY7VUFDRSxRQUFRLENBQUMsSUFBVCxDQUFjO1lBQUMsSUFBQSxFQUFNLElBQVA7V0FBZCxFQURGOztBQUZGO01BSUEsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFSUzs7dUJBVVgsWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOzt1QkFFZCxJQUFBLEdBQU0sU0FBQTs7UUFDSixJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO0lBSEk7O3VCQUtOLFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUFIOzt1QkFFWCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7K0NBQU0sQ0FBRSxPQUFSLENBQUE7SUFESTs7dUJBR04sV0FBQSxHQUFhLFNBQUMsR0FBRDtBQUNYLFVBQUE7TUFEYSxPQUFEO01BQ1osT0FBQSxHQUFVO01BQ1YsSUFBRyxJQUFJLENBQUMsVUFBTCxDQUFnQixHQUFoQixDQUFIO1FBQ0UsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBWDtRQUNQLE9BQUEsR0FBVSxLQUZaOzthQUdBLEVBQUEsQ0FBRyxTQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSSxJQUFKLEVBQVUsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDUixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2FBQUwsRUFBMEIsU0FBQTtjQUN4QixJQUFvQixPQUFwQjt1QkFBQSxLQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFBQTs7WUFEd0IsQ0FBMUI7VUFEUTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtNQURDLENBQUg7SUFMVzs7dUJBVWIsU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFVBQUE7TUFEVyxPQUFEO01BQ1YsSUFBQyxDQUFBLEtBQUQsQ0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsQ0FBc0IsQ0FBQSxDQUFBLENBQTdCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZTOzt1QkFJWCxLQUFBLEdBQU8sU0FBQyxNQUFEO0FBQ0wsVUFBQTtNQUFBLFFBQUEsR0FBVyxDQUFDLE9BQUQsQ0FBUyxDQUFDLE1BQVYsQ0FBaUIsSUFBQyxDQUFBLElBQWxCLENBQXVCLENBQUMsTUFBeEIsQ0FBK0IsQ0FBQyxNQUFELENBQS9CO2FBQ1gsR0FBRyxDQUFDLEdBQUosQ0FBUSxRQUFSLEVBQWtCO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQWxCLEVBQW9EO1FBQUMsS0FBQSxFQUFPLElBQVI7T0FBcEQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNKLGlCQUFpQixDQUFDLE1BQWxCLENBQUEsQ0FBMEIsQ0FBQyxVQUEzQixDQUFzQyxJQUF0QyxDQUEyQyxDQUFDLE1BQTVDLENBQUE7VUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBQSxDQUErQixDQUFDLE9BQWhDLENBQXdDLFNBQUMsTUFBRDttQkFDdEMsRUFBRSxDQUFDLE1BQUgsQ0FBVSxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVYsRUFBNEIsU0FBQyxLQUFEO2NBQVcsSUFBb0IsQ0FBSSxLQUF4Qjt1QkFBQSxNQUFNLENBQUMsT0FBUCxDQUFBLEVBQUE7O1lBQVgsQ0FBNUI7VUFEc0MsQ0FBeEM7aUJBRUEsR0FBRyxDQUFDLE9BQUosQ0FBWSxLQUFDLENBQUEsSUFBYjtRQUpJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBTUEsRUFBQyxLQUFELEVBTkEsQ0FNTyxTQUFDLEdBQUQ7ZUFDTCxRQUFRLENBQUMsUUFBVCxDQUFrQixHQUFsQjtNQURLLENBTlA7SUFGSzs7OztLQTFDYztBQVB2QiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMaXN0VmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGEsIEBhcmdzPVtdKSAtPlxuICAgIHN1cGVyXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuXG4gIHBhcnNlRGF0YTogLT5cbiAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpXG4gICAgYnJhbmNoZXMgPSBbXVxuICAgIGZvciBpdGVtIGluIGl0ZW1zXG4gICAgICBpdGVtID0gaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgICB1bmxlc3MgaXRlbSBpcyAnJ1xuICAgICAgICBicmFuY2hlcy5wdXNoIHtuYW1lOiBpdGVtfVxuICAgIEBzZXRJdGVtcyBicmFuY2hlc1xuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnbmFtZSdcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICBoaWRlOiAtPlxuICAgIEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZX0pIC0+XG4gICAgY3VycmVudCA9IGZhbHNlXG4gICAgaWYgbmFtZS5zdGFydHNXaXRoIFwiKlwiXG4gICAgICBuYW1lID0gbmFtZS5zbGljZSgxKVxuICAgICAgY3VycmVudCA9IHRydWVcbiAgICAkJCAtPlxuICAgICAgQGxpIG5hbWUsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAc3BhbignQ3VycmVudCcpIGlmIGN1cnJlbnRcblxuICBjb25maXJtZWQ6ICh7bmFtZX0pIC0+XG4gICAgQG1lcmdlIG5hbWUubWF0Y2goL1xcKj8oLiopLylbMV1cbiAgICBAY2FuY2VsKClcblxuICBtZXJnZTogKGJyYW5jaCkgLT5cbiAgICBtZXJnZUFyZyA9IFsnbWVyZ2UnXS5jb25jYXQoQGFyZ3MpLmNvbmNhdCBbYnJhbmNoXVxuICAgIGdpdC5jbWQobWVyZ2VBcmcsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9KVxuICAgIC50aGVuIChkYXRhKSA9PlxuICAgICAgT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKCkuc2V0Q29udGVudChkYXRhKS5maW5pc2goKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoIChlZGl0b3IpIC0+XG4gICAgICAgIGZzLmV4aXN0cyBlZGl0b3IuZ2V0UGF0aCgpLCAoZXhpc3QpIC0+IGVkaXRvci5kZXN0cm95KCkgaWYgbm90IGV4aXN0XG4gICAgICBnaXQucmVmcmVzaCBAcmVwb1xuICAgIC5jYXRjaCAobXNnKSAtPlxuICAgICAgbm90aWZpZXIuYWRkRXJyb3IgbXNnXG4iXX0=
