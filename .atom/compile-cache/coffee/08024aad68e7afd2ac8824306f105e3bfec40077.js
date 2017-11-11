(function() {
  var BranchListView, RemoteBranchListView, isValidBranch,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BranchListView = require('./branch-list-view');

  isValidBranch = function(item, remote) {
    return item.startsWith(remote + '/') && !item.includes('/HEAD');
  };

  module.exports = RemoteBranchListView = (function(superClass) {
    extend(RemoteBranchListView, superClass);

    function RemoteBranchListView() {
      return RemoteBranchListView.__super__.constructor.apply(this, arguments);
    }

    RemoteBranchListView.prototype.initialize = function(data, remote1, onConfirm) {
      this.remote = remote1;
      return RemoteBranchListView.__super__.initialize.call(this, data, onConfirm);
    };

    RemoteBranchListView.prototype.parseData = function() {
      var branches, items;
      items = this.data.split("\n").map(function(item) {
        return item.replace(/\s/g, '');
      });
      branches = items.filter((function(_this) {
        return function(item) {
          return isValidBranch(item, _this.remote);
        };
      })(this)).map(function(item) {
        return {
          name: item
        };
      });
      if (branches.length === 1) {
        this.confirmed(branches[0]);
      } else {
        this.setItems(branches);
      }
      return this.focusFilterEditor();
    };

    return RemoteBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlbW90ZS1icmFuY2gtbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbURBQUE7SUFBQTs7O0VBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVI7O0VBRWpCLGFBQUEsR0FBZ0IsU0FBQyxJQUFELEVBQU8sTUFBUDtXQUNkLElBQUksQ0FBQyxVQUFMLENBQWdCLE1BQUEsR0FBUyxHQUF6QixDQUFBLElBQWtDLENBQUksSUFBSSxDQUFDLFFBQUwsQ0FBYyxPQUFkO0VBRHhCOztFQUdoQixNQUFNLENBQUMsT0FBUCxHQUNROzs7Ozs7O21DQUNKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLFNBQWhCO01BQU8sSUFBQyxDQUFBLFNBQUQ7YUFDakIscURBQU0sSUFBTixFQUFZLFNBQVo7SUFEVTs7bUNBR1osU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFZLElBQVosQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixTQUFDLElBQUQ7ZUFBVSxJQUFJLENBQUMsT0FBTCxDQUFhLEtBQWIsRUFBb0IsRUFBcEI7TUFBVixDQUF0QjtNQUNSLFFBQUEsR0FBVyxLQUFLLENBQUMsTUFBTixDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUFVLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLEtBQUMsQ0FBQSxNQUFyQjtRQUFWO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiLENBQW9ELENBQUMsR0FBckQsQ0FBeUQsU0FBQyxJQUFEO2VBQVU7VUFBQyxJQUFBLEVBQU0sSUFBUDs7TUFBVixDQUF6RDtNQUNYLElBQUcsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBdEI7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLFFBQVMsQ0FBQSxDQUFBLENBQXBCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBSEY7O2FBSUEsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFQUzs7OztLQUpzQjtBQU5yQyIsInNvdXJjZXNDb250ZW50IjpbIkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi9icmFuY2gtbGlzdC12aWV3J1xuXG5pc1ZhbGlkQnJhbmNoID0gKGl0ZW0sIHJlbW90ZSkgLT5cbiAgaXRlbS5zdGFydHNXaXRoKHJlbW90ZSArICcvJykgYW5kIG5vdCBpdGVtLmluY2x1ZGVzKCcvSEVBRCcpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xhc3MgUmVtb3RlQnJhbmNoTGlzdFZpZXcgZXh0ZW5kcyBCcmFuY2hMaXN0Vmlld1xuICAgIGluaXRpYWxpemU6IChkYXRhLCBAcmVtb3RlLCBvbkNvbmZpcm0pIC0+XG4gICAgICBzdXBlcihkYXRhLCBvbkNvbmZpcm0pXG5cbiAgICBwYXJzZURhdGE6IC0+XG4gICAgICBpdGVtcyA9IEBkYXRhLnNwbGl0KFwiXFxuXCIpLm1hcCAoaXRlbSkgLT4gaXRlbS5yZXBsYWNlKC9cXHMvZywgJycpXG4gICAgICBicmFuY2hlcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gaXNWYWxpZEJyYW5jaChpdGVtLCBAcmVtb3RlKSkubWFwIChpdGVtKSAtPiB7bmFtZTogaXRlbX1cbiAgICAgIGlmIGJyYW5jaGVzLmxlbmd0aCBpcyAxXG4gICAgICAgIEBjb25maXJtZWQgYnJhbmNoZXNbMF1cbiAgICAgIGVsc2VcbiAgICAgICAgQHNldEl0ZW1zIGJyYW5jaGVzXG4gICAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuIl19
