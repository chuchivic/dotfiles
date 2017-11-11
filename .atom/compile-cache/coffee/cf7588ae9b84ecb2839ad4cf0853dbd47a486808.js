(function() {
  var $$, BufferedProcess, CherryPickSelectBranch, CherryPickSelectCommits, SelectListView, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  notifier = require('../notifier');

  CherryPickSelectCommits = require('./cherry-pick-select-commits-view');

  module.exports = CherryPickSelectBranch = (function(superClass) {
    extend(CherryPickSelectBranch, superClass);

    function CherryPickSelectBranch() {
      return CherryPickSelectBranch.__super__.constructor.apply(this, arguments);
    }

    CherryPickSelectBranch.prototype.initialize = function(repo, items, currentHead) {
      this.repo = repo;
      this.currentHead = currentHead;
      CherryPickSelectBranch.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(items);
      return this.focusFilterEditor();
    };

    CherryPickSelectBranch.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    CherryPickSelectBranch.prototype.cancelled = function() {
      return this.hide();
    };

    CherryPickSelectBranch.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    CherryPickSelectBranch.prototype.viewForItem = function(item) {
      return $$(function() {
        return this.li(item);
      });
    };

    CherryPickSelectBranch.prototype.confirmed = function(item) {
      var args;
      this.cancel();
      args = ['log', '--cherry-pick', '-z', '--format=%H%n%an%n%ar%n%s', this.currentHead + "..." + item];
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(save) {
          if (save.length > 0) {
            return new CherryPickSelectCommits(_this.repo, save.split('\0').slice(0, -1));
          } else {
            return notifier.addInfo("No commits available to cherry-pick.");
          }
        };
      })(this));
    };

    return CherryPickSelectBranch;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2NoZXJyeS1waWNrLXNlbGVjdC1icmFuY2gtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHdHQUFBO0lBQUE7OztFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUVMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsdUJBQUEsR0FBMEIsT0FBQSxDQUFRLG1DQUFSOztFQUUxQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3FDQUVKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSLEVBQWUsV0FBZjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQWMsSUFBQyxDQUFBLGNBQUQ7TUFDekIsd0RBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVY7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUpVOztxQ0FNWixJQUFBLEdBQU0sU0FBQTs7UUFDSixJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTthQUVBLElBQUMsQ0FBQSxtQkFBRCxDQUFBO0lBSkk7O3FDQU1OLFNBQUEsR0FBVyxTQUFBO2FBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUFIOztxQ0FFWCxJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7K0NBQU0sQ0FBRSxPQUFSLENBQUE7SUFESTs7cUNBR04sV0FBQSxHQUFhLFNBQUMsSUFBRDthQUNYLEVBQUEsQ0FBRyxTQUFBO2VBQ0QsSUFBQyxDQUFBLEVBQUQsQ0FBSSxJQUFKO01BREMsQ0FBSDtJQURXOztxQ0FJYixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBQ1QsVUFBQTtNQUFBLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSxJQUFBLEdBQU8sQ0FDTCxLQURLLEVBRUwsZUFGSyxFQUdMLElBSEssRUFJTCwyQkFKSyxFQUtGLElBQUMsQ0FBQSxXQUFGLEdBQWMsS0FBZCxHQUFtQixJQUxoQjthQVFQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUMsQ0FBQSxJQUFJLENBQUMsbUJBQU4sQ0FBQSxDQUFMO09BQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUNKLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxDQUFqQjttQkFDTSxJQUFBLHVCQUFBLENBQXdCLEtBQUMsQ0FBQSxJQUF6QixFQUErQixJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBaUIsYUFBaEQsRUFETjtXQUFBLE1BQUE7bUJBR0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsc0NBQWpCLEVBSEY7O1FBREk7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE47SUFWUzs7OztLQXZCd0I7QUFSckMiLCJzb3VyY2VzQ29udGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG57JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuQ2hlcnJ5UGlja1NlbGVjdENvbW1pdHMgPSByZXF1aXJlICcuL2NoZXJyeS1waWNrLXNlbGVjdC1jb21taXRzLXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENoZXJyeVBpY2tTZWxlY3RCcmFuY2ggZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuXG4gIGluaXRpYWxpemU6IChAcmVwbywgaXRlbXMsIEBjdXJyZW50SGVhZCkgLT5cbiAgICBzdXBlclxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgaXRlbXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG5cbiAgY2FuY2VsbGVkOiAtPiBAaGlkZSgpXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoaXRlbSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpIGl0ZW1cblxuICBjb25maXJtZWQ6IChpdGVtKSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIGFyZ3MgPSBbXG4gICAgICAnbG9nJ1xuICAgICAgJy0tY2hlcnJ5LXBpY2snXG4gICAgICAnLXonXG4gICAgICAnLS1mb3JtYXQ9JUglbiVhbiVuJWFyJW4lcydcbiAgICAgIFwiI3tAY3VycmVudEhlYWR9Li4uI3tpdGVtfVwiXG4gICAgXVxuXG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoc2F2ZSkgPT5cbiAgICAgIGlmIHNhdmUubGVuZ3RoID4gMFxuICAgICAgICBuZXcgQ2hlcnJ5UGlja1NlbGVjdENvbW1pdHMoQHJlcG8sIHNhdmUuc3BsaXQoJ1xcMCcpWy4uLi0xXSlcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyBcIk5vIGNvbW1pdHMgYXZhaWxhYmxlIHRvIGNoZXJyeS1waWNrLlwiXG4iXX0=
