(function() {
  var LogListView, LogViewURI, git;

  git = require('../git');

  LogListView = require('../views/log-list-view');

  LogViewURI = 'atom://git-plus:log';

  module.exports = function(repo, arg) {
    var currentFile, onlyCurrentFile, ref;
    onlyCurrentFile = (arg != null ? arg : {}).onlyCurrentFile;
    atom.workspace.addOpener(function(uri) {
      if (uri === LogViewURI) {
        return new LogListView;
      }
    });
    currentFile = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
    return atom.workspace.open(LogViewURI).then(function(view) {
      if (onlyCurrentFile) {
        return view.currentFileLog(repo, currentFile);
      } else {
        return view.branchLog(repo);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtbG9nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFdBQUEsR0FBYyxPQUFBLENBQVEsd0JBQVI7O0VBQ2QsVUFBQSxHQUFhOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLGlDQUFELE1BQWtCO0lBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBZixDQUF5QixTQUFDLEdBQUQ7TUFDdkIsSUFBMEIsR0FBQSxLQUFPLFVBQWpDO0FBQUEsZUFBTyxJQUFJLFlBQVg7O0lBRHVCLENBQXpCO0lBR0EsV0FBQSxHQUFjLElBQUksQ0FBQyxVQUFMLDJEQUFvRCxDQUFFLE9BQXRDLENBQUEsVUFBaEI7V0FDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsVUFBcEIsQ0FBK0IsQ0FBQyxJQUFoQyxDQUFxQyxTQUFDLElBQUQ7TUFDbkMsSUFBRyxlQUFIO2VBQ0UsSUFBSSxDQUFDLGNBQUwsQ0FBb0IsSUFBcEIsRUFBMEIsV0FBMUIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFJLENBQUMsU0FBTCxDQUFlLElBQWYsRUFIRjs7SUFEbUMsQ0FBckM7RUFMZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbkxvZ0xpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvbG9nLWxpc3QtdmlldydcbkxvZ1ZpZXdVUkkgPSAnYXRvbTovL2dpdC1wbHVzOmxvZydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge29ubHlDdXJyZW50RmlsZX09e30pIC0+XG4gIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpKSAtPlxuICAgIHJldHVybiBuZXcgTG9nTGlzdFZpZXcgaWYgdXJpIGlzIExvZ1ZpZXdVUklcblxuICBjdXJyZW50RmlsZSA9IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihMb2dWaWV3VVJJKS50aGVuICh2aWV3KSAtPlxuICAgIGlmIG9ubHlDdXJyZW50RmlsZVxuICAgICAgdmlldy5jdXJyZW50RmlsZUxvZyhyZXBvLCBjdXJyZW50RmlsZSlcbiAgICBlbHNlXG4gICAgICB2aWV3LmJyYW5jaExvZyByZXBvXG4iXX0=
