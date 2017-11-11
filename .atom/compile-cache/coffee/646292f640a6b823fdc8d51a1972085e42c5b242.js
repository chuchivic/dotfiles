(function() {
  var SelectStageHunkFile, git, gitStageHunk;

  git = require('../git');

  SelectStageHunkFile = require('../views/select-stage-hunk-file-view');

  gitStageHunk = function(repo) {
    return git.unstagedFiles(repo).then(function(data) {
      return new SelectStageHunkFile(repo, data);
    });
  };

  module.exports = gitStageHunk;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtc3RhZ2UtaHVuay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixtQkFBQSxHQUFzQixPQUFBLENBQVEsc0NBQVI7O0VBRXRCLFlBQUEsR0FBZSxTQUFDLElBQUQ7V0FDYixHQUFHLENBQUMsYUFBSixDQUFrQixJQUFsQixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDthQUFjLElBQUEsbUJBQUEsQ0FBb0IsSUFBcEIsRUFBMEIsSUFBMUI7SUFBZCxDQUROO0VBRGE7O0VBSWYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFQakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5TZWxlY3RTdGFnZUh1bmtGaWxlID0gcmVxdWlyZSAnLi4vdmlld3Mvc2VsZWN0LXN0YWdlLWh1bmstZmlsZS12aWV3J1xuXG5naXRTdGFnZUh1bmsgPSAocmVwbykgLT5cbiAgZ2l0LnVuc3RhZ2VkRmlsZXMocmVwbylcbiAgLnRoZW4gKGRhdGEpIC0+IG5ldyBTZWxlY3RTdGFnZUh1bmtGaWxlKHJlcG8sIGRhdGEpXG5cbm1vZHVsZS5leHBvcnRzID0gZ2l0U3RhZ2VIdW5rXG4iXX0=
