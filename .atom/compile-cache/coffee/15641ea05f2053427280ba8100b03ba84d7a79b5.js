(function() {
  var RemoveListView, git, gitRemove, notifier, prettify;

  git = require('../git');

  notifier = require('../notifier');

  RemoveListView = require('../views/remove-list-view');

  gitRemove = function(repo, arg) {
    var currentFile, cwd, ref, showSelector;
    showSelector = (arg != null ? arg : {}).showSelector;
    cwd = repo.getWorkingDirectory();
    currentFile = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
    if ((currentFile != null) && !showSelector) {
      if (repo.isPathModified(currentFile) === false || window.confirm('Are you sure?')) {
        atom.workspace.getActivePaneItem().destroy();
        return git.cmd(['rm', '-f', '--ignore-unmatch', currentFile], {
          cwd: cwd
        }).then(function(data) {
          return notifier.addSuccess("Removed " + (prettify(data)));
        });
      }
    } else {
      return git.cmd(['rm', '-r', '-n', '--ignore-unmatch', '-f', '*'], {
        cwd: cwd
      }).then(function(data) {
        return new RemoveListView(repo, prettify(data));
      });
    }
  };

  prettify = function(data) {
    var file, i, j, len, results;
    data = data.match(/rm ('.*')/g);
    if (data) {
      results = [];
      for (i = j = 0, len = data.length; j < len; i = ++j) {
        file = data[i];
        results.push(data[i] = file.match(/rm '(.*)'/)[1]);
      }
      return results;
    } else {
      return data;
    }
  };

  module.exports = gitRemove;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcmVtb3ZlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDVixRQUFBO0lBRGtCLDhCQUFELE1BQWU7SUFDaEMsR0FBQSxHQUFNLElBQUksQ0FBQyxtQkFBTCxDQUFBO0lBQ04sV0FBQSxHQUFjLElBQUksQ0FBQyxVQUFMLDJEQUFvRCxDQUFFLE9BQXRDLENBQUEsVUFBaEI7SUFDZCxJQUFHLHFCQUFBLElBQWlCLENBQUksWUFBeEI7TUFDRSxJQUFHLElBQUksQ0FBQyxjQUFMLENBQW9CLFdBQXBCLENBQUEsS0FBb0MsS0FBcEMsSUFBNkMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxlQUFmLENBQWhEO1FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBZixDQUFBLENBQWtDLENBQUMsT0FBbkMsQ0FBQTtlQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLGtCQUFiLEVBQWlDLFdBQWpDLENBQVIsRUFBdUQ7VUFBQyxLQUFBLEdBQUQ7U0FBdkQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7aUJBQVUsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsVUFBQSxHQUFVLENBQUMsUUFBQSxDQUFTLElBQVQsQ0FBRCxDQUE5QjtRQUFWLENBRE4sRUFGRjtPQURGO0tBQUEsTUFBQTthQU1FLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsRUFBbUIsa0JBQW5CLEVBQXVDLElBQXZDLEVBQTZDLEdBQTdDLENBQVIsRUFBMkQ7UUFBQyxLQUFBLEdBQUQ7T0FBM0QsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7ZUFBYyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLFFBQUEsQ0FBUyxJQUFULENBQXJCO01BQWQsQ0FETixFQU5GOztFQUhVOztFQVlaLFFBQUEsR0FBVyxTQUFDLElBQUQ7QUFDVCxRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsWUFBWDtJQUNQLElBQUcsSUFBSDtBQUNFO1dBQUEsOENBQUE7O3FCQUNFLElBQUssQ0FBQSxDQUFBLENBQUwsR0FBVSxJQUFJLENBQUMsS0FBTCxDQUFXLFdBQVgsQ0FBd0IsQ0FBQSxDQUFBO0FBRHBDO3FCQURGO0tBQUEsTUFBQTthQUlFLEtBSkY7O0VBRlM7O0VBUVgsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF4QmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblJlbW92ZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcmVtb3ZlLWxpc3QtdmlldydcblxuZ2l0UmVtb3ZlID0gKHJlcG8sIHtzaG93U2VsZWN0b3J9PXt9KSAtPlxuICBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuICBjdXJyZW50RmlsZSA9IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgaWYgY3VycmVudEZpbGU/IGFuZCBub3Qgc2hvd1NlbGVjdG9yXG4gICAgaWYgcmVwby5pc1BhdGhNb2RpZmllZChjdXJyZW50RmlsZSkgaXMgZmFsc2Ugb3Igd2luZG93LmNvbmZpcm0oJ0FyZSB5b3Ugc3VyZT8nKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKS5kZXN0cm95KClcbiAgICAgIGdpdC5jbWQoWydybScsICctZicsICctLWlnbm9yZS11bm1hdGNoJywgY3VycmVudEZpbGVdLCB7Y3dkfSlcbiAgICAgIC50aGVuIChkYXRhKSAtPiBub3RpZmllci5hZGRTdWNjZXNzKFwiUmVtb3ZlZCAje3ByZXR0aWZ5IGRhdGF9XCIpXG4gIGVsc2VcbiAgICBnaXQuY21kKFsncm0nLCAnLXInLCAnLW4nLCAnLS1pZ25vcmUtdW5tYXRjaCcsICctZicsICcqJ10sIHtjd2R9KVxuICAgIC50aGVuIChkYXRhKSAtPiBuZXcgUmVtb3ZlTGlzdFZpZXcocmVwbywgcHJldHRpZnkoZGF0YSkpXG5cbnByZXR0aWZ5ID0gKGRhdGEpIC0+XG4gIGRhdGEgPSBkYXRhLm1hdGNoKC9ybSAoJy4qJykvZylcbiAgaWYgZGF0YVxuICAgIGZvciBmaWxlLCBpIGluIGRhdGFcbiAgICAgIGRhdGFbaV0gPSBmaWxlLm1hdGNoKC9ybSAnKC4qKScvKVsxXVxuICBlbHNlXG4gICAgZGF0YVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdpdFJlbW92ZVxuIl19
