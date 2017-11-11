(function() {
  var TagListView, git;

  git = require('../git');

  TagListView = require('../views/tag-list-view');

  module.exports = function(repo) {
    return git.cmd(['tag', '-ln'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new TagListView(repo, data);
    })["catch"](function() {
      return new TagListView(repo);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtdGFncy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixXQUFBLEdBQWMsT0FBQSxDQUFRLHdCQUFSOztFQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtXQUNmLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUFSLEVBQXdCO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBeEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFBYyxJQUFBLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLElBQWxCO0lBQWQsQ0FETixDQUVBLEVBQUMsS0FBRCxFQUZBLENBRU8sU0FBQTthQUFPLElBQUEsV0FBQSxDQUFZLElBQVo7SUFBUCxDQUZQO0VBRGU7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5UYWdMaXN0VmlldyA9IHJlcXVpcmUgJy4uL3ZpZXdzL3RhZy1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGdpdC5jbWQoWyd0YWcnLCAnLWxuJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gIC50aGVuIChkYXRhKSAtPiBuZXcgVGFnTGlzdFZpZXcocmVwbywgZGF0YSlcbiAgLmNhdGNoIC0+IG5ldyBUYWdMaXN0VmlldyhyZXBvKVxuIl19
