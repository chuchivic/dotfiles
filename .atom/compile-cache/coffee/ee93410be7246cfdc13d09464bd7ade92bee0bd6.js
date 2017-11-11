(function() {
  var $$, GitShow, RemoteListView, SelectListView, TagView, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  git = require('../git');

  GitShow = require('../models/git-show');

  notifier = require('../notifier');

  RemoteListView = require('../views/remote-list-view');

  module.exports = TagView = (function(superClass) {
    extend(TagView, superClass);

    function TagView() {
      return TagView.__super__.constructor.apply(this, arguments);
    }

    TagView.prototype.initialize = function(repo, tag1) {
      this.repo = repo;
      this.tag = tag1;
      TagView.__super__.initialize.apply(this, arguments);
      this.show();
      return this.parseData();
    };

    TagView.prototype.parseData = function() {
      var items;
      items = [];
      items.push({
        tag: this.tag,
        cmd: 'Show',
        description: 'git show'
      });
      items.push({
        tag: this.tag,
        cmd: 'Push',
        description: 'git push [remote]'
      });
      items.push({
        tag: this.tag,
        cmd: 'Checkout',
        description: 'git checkout'
      });
      items.push({
        tag: this.tag,
        cmd: 'Verify',
        description: 'git tag --verify'
      });
      items.push({
        tag: this.tag,
        cmd: 'Delete',
        description: 'git tag --delete'
      });
      this.setItems(items);
      return this.focusFilterEditor();
    };

    TagView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    TagView.prototype.cancelled = function() {
      return this.hide();
    };

    TagView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    TagView.prototype.viewForItem = function(arg) {
      var cmd, description, tag;
      tag = arg.tag, cmd = arg.cmd, description = arg.description;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'text-highlight'
            }, cmd);
            return _this.div({
              "class": 'text-warning'
            }, description + " " + tag);
          };
        })(this));
      });
    };

    TagView.prototype.getFilterKey = function() {
      return 'cmd';
    };

    TagView.prototype.confirmed = function(arg) {
      var args, cmd, tag;
      tag = arg.tag, cmd = arg.cmd;
      this.cancel();
      switch (cmd) {
        case 'Show':
          GitShow(this.repo, tag);
          break;
        case 'Push':
          git.cmd(['remote'], {
            cwd: this.repo.getWorkingDirectory()
          }).then((function(_this) {
            return function(data) {
              return new RemoteListView(_this.repo, data, {
                mode: 'push',
                tag: _this.tag
              });
            };
          })(this));
          break;
        case 'Checkout':
          args = ['checkout', tag];
          break;
        case 'Verify':
          args = ['tag', '--verify', tag];
          break;
        case 'Delete':
          args = ['tag', '--delete', tag];
      }
      if (args != null) {
        return git.cmd(args, {
          cwd: this.repo.getWorkingDirectory()
        }).then(function(data) {
          return notifier.addSuccess(data);
        })["catch"](function(msg) {
          return notifier.addWarning(msg);
        });
      }
    };

    return TagView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3RhZy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0VBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUVMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixPQUFBLEdBQVUsT0FBQSxDQUFRLG9CQUFSOztFQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztzQkFDSixVQUFBLEdBQVksU0FBQyxJQUFELEVBQVEsSUFBUjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLE1BQUQ7TUFDbEIseUNBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBSFU7O3NCQUtaLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLEtBQUEsR0FBUTtNQUNSLEtBQUssQ0FBQyxJQUFOLENBQVc7UUFBQyxHQUFBLEVBQUssSUFBQyxDQUFBLEdBQVA7UUFBWSxHQUFBLEVBQUssTUFBakI7UUFBeUIsV0FBQSxFQUFhLFVBQXRDO09BQVg7TUFDQSxLQUFLLENBQUMsSUFBTixDQUFXO1FBQUMsR0FBQSxFQUFLLElBQUMsQ0FBQSxHQUFQO1FBQVksR0FBQSxFQUFLLE1BQWpCO1FBQXlCLFdBQUEsRUFBYSxtQkFBdEM7T0FBWDtNQUNBLEtBQUssQ0FBQyxJQUFOLENBQVc7UUFBQyxHQUFBLEVBQUssSUFBQyxDQUFBLEdBQVA7UUFBWSxHQUFBLEVBQUssVUFBakI7UUFBNkIsV0FBQSxFQUFhLGNBQTFDO09BQVg7TUFDQSxLQUFLLENBQUMsSUFBTixD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QUFwQjtRQUFULENBRlAsRUFERjs7SUFmUzs7OztLQWxDUztBQVJ0QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbkdpdFNob3cgPSByZXF1aXJlICcuLi9tb2RlbHMvZ2l0LXNob3cnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuUmVtb3RlTGlzdFZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9yZW1vdGUtbGlzdC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBUYWdWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBAdGFnKSAtPlxuICAgIHN1cGVyXG4gICAgQHNob3coKVxuICAgIEBwYXJzZURhdGEoKVxuXG4gIHBhcnNlRGF0YTogLT5cbiAgICBpdGVtcyA9IFtdXG4gICAgaXRlbXMucHVzaCB7dGFnOiBAdGFnLCBjbWQ6ICdTaG93JywgZGVzY3JpcHRpb246ICdnaXQgc2hvdyd9XG4gICAgaXRlbXMucHVzaCB7dGFnOiBAdGFnLCBjbWQ6ICdQdXNoJywgZGVzY3JpcHRpb246ICdnaXQgcHVzaCBbcmVtb3RlXSd9XG4gICAgaXRlbXMucHVzaCB7dGFnOiBAdGFnLCBjbWQ6ICdDaGVja291dCcsIGRlc2NyaXB0aW9uOiAnZ2l0IGNoZWNrb3V0J31cbiAgICBpdGVtcy5wdXNoIHt0YWc6IEB0YWcsIGNtZDogJ1ZlcmlmeScsIGRlc2NyaXB0aW9uOiAnZ2l0IHRhZyAtLXZlcmlmeSd9XG4gICAgaXRlbXMucHVzaCB7dGFnOiBAdGFnLCBjbWQ6ICdEZWxldGUnLCBkZXNjcmlwdGlvbjogJ2dpdCB0YWcgLS1kZWxldGUnfVxuXG4gICAgQHNldEl0ZW1zIGl0ZW1zXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+IEBoaWRlKClcblxuICBoaWRlOiAtPiBAcGFuZWw/LmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe3RhZywgY21kLCBkZXNjcmlwdGlvbn0pIC0+XG4gICAgJCQgLT5cbiAgICAgIEBsaSA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAndGV4dC1oaWdobGlnaHQnLCBjbWRcbiAgICAgICAgQGRpdiBjbGFzczogJ3RleHQtd2FybmluZycsIFwiI3tkZXNjcmlwdGlvbn0gI3t0YWd9XCJcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICdjbWQnXG5cbiAgY29uZmlybWVkOiAoe3RhZywgY21kfSkgLT5cbiAgICBAY2FuY2VsKClcbiAgICBzd2l0Y2ggY21kXG4gICAgICB3aGVuICdTaG93J1xuICAgICAgICBHaXRTaG93KEByZXBvLCB0YWcpXG4gICAgICB3aGVuICdQdXNoJ1xuICAgICAgICBnaXQuY21kKFsncmVtb3RlJ10sIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgICAudGhlbiAoZGF0YSkgPT4gbmV3IFJlbW90ZUxpc3RWaWV3KEByZXBvLCBkYXRhLCBtb2RlOiAncHVzaCcsIHRhZzogQHRhZylcbiAgICAgIHdoZW4gJ0NoZWNrb3V0J1xuICAgICAgICBhcmdzID0gWydjaGVja291dCcsIHRhZ11cbiAgICAgIHdoZW4gJ1ZlcmlmeSdcbiAgICAgICAgYXJncyA9IFsndGFnJywgJy0tdmVyaWZ5JywgdGFnXVxuICAgICAgd2hlbiAnRGVsZXRlJ1xuICAgICAgICBhcmdzID0gWyd0YWcnLCAnLS1kZWxldGUnLCB0YWddXG5cbiAgICBpZiBhcmdzP1xuICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgIC50aGVuIChkYXRhKSAtPiBub3RpZmllci5hZGRTdWNjZXNzIGRhdGFcbiAgICAgIC5jYXRjaCAobXNnKSAtPiBub3RpZmllci5hZGRXYXJuaW5nIG1zZ1xuIl19
