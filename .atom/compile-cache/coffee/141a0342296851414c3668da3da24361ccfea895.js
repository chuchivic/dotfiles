(function() {
  var CherryPickSelectBranch, git, gitCherryPick;

  git = require('../git');

  CherryPickSelectBranch = require('../views/cherry-pick-select-branch-view');

  gitCherryPick = function(repo) {
    var currentHead, head, heads, i, j, len;
    heads = repo.getReferences().heads;
    currentHead = repo.getShortHead();
    for (i = j = 0, len = heads.length; j < len; i = ++j) {
      head = heads[i];
      heads[i] = head.replace('refs/heads/', '');
    }
    heads = heads.filter(function(head) {
      return head !== currentHead;
    });
    return new CherryPickSelectBranch(repo, heads, currentHead);
  };

  module.exports = gitCherryPick;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY2hlcnJ5LXBpY2suY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sc0JBQUEsR0FBeUIsT0FBQSxDQUFRLHlDQUFSOztFQUV6QixhQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNkLFFBQUE7SUFBQSxLQUFBLEdBQVEsSUFBSSxDQUFDLGFBQUwsQ0FBQSxDQUFvQixDQUFDO0lBQzdCLFdBQUEsR0FBYyxJQUFJLENBQUMsWUFBTCxDQUFBO0FBRWQsU0FBQSwrQ0FBQTs7TUFDRSxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsSUFBSSxDQUFDLE9BQUwsQ0FBYSxhQUFiLEVBQTRCLEVBQTVCO0FBRGI7SUFHQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxTQUFDLElBQUQ7YUFBVSxJQUFBLEtBQVU7SUFBcEIsQ0FBYjtXQUNKLElBQUEsc0JBQUEsQ0FBdUIsSUFBdkIsRUFBNkIsS0FBN0IsRUFBb0MsV0FBcEM7RUFSVTs7RUFVaEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFiakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5DaGVycnlQaWNrU2VsZWN0QnJhbmNoID0gcmVxdWlyZSAnLi4vdmlld3MvY2hlcnJ5LXBpY2stc2VsZWN0LWJyYW5jaC12aWV3J1xuXG5naXRDaGVycnlQaWNrID0gKHJlcG8pIC0+XG4gIGhlYWRzID0gcmVwby5nZXRSZWZlcmVuY2VzKCkuaGVhZHNcbiAgY3VycmVudEhlYWQgPSByZXBvLmdldFNob3J0SGVhZCgpXG5cbiAgZm9yIGhlYWQsIGkgaW4gaGVhZHNcbiAgICBoZWFkc1tpXSA9IGhlYWQucmVwbGFjZSgncmVmcy9oZWFkcy8nLCAnJylcblxuICBoZWFkcyA9IGhlYWRzLmZpbHRlciAoaGVhZCkgLT4gaGVhZCBpc250IGN1cnJlbnRIZWFkXG4gIG5ldyBDaGVycnlQaWNrU2VsZWN0QnJhbmNoKHJlcG8sIGhlYWRzLCBjdXJyZW50SGVhZClcblxubW9kdWxlLmV4cG9ydHMgPSBnaXRDaGVycnlQaWNrXG4iXX0=
