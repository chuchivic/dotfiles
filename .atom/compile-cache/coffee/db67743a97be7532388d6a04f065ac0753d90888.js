(function() {
  var CompositeDisposable, Os, Path, RevisionView, disposables, fs, git, nothingToShow, notifier, prepFile, showFile, splitDiff;

  CompositeDisposable = require('atom').CompositeDisposable;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  git = require('../git');

  notifier = require('../notifier');

  RevisionView = require('../views/git-revision-view');

  nothingToShow = 'Nothing to show.';

  disposables = new CompositeDisposable;

  showFile = function(filePath) {
    var splitDirection;
    if (atom.config.get('git-plus.general.openInPane')) {
      splitDirection = atom.config.get('git-plus.general.splitPane');
      atom.workspace.getCenter().getActivePane()["split" + splitDirection]();
    }
    return atom.workspace.open(filePath);
  };

  prepFile = function(text, filePath) {
    return new Promise(function(resolve, reject) {
      if ((text != null ? text.length : void 0) === 0) {
        return reject(nothingToShow);
      } else {
        return fs.writeFile(filePath, text, {
          flag: 'w+'
        }, function(err) {
          if (err) {
            return reject(err);
          } else {
            return resolve(true);
          }
        });
      }
    });
  };

  splitDiff = function(repo, pathToFile) {
    return atom.workspace.open(pathToFile, {
      split: 'left',
      activatePane: false,
      activateItem: true,
      searchAllPanes: false
    }).then(function(editor) {
      return RevisionView.showRevision(repo, editor, repo.branch);
    });
  };

  module.exports = function(repo, arg) {
    var args, diffFilePath, diffStat, file, ref, ref1;
    ref = arg != null ? arg : {}, diffStat = ref.diffStat, file = ref.file;
    if (file == null) {
      file = repo.relativize((ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0);
    }
    if (file && file !== '.' && atom.config.get('git-plus.experimental.useSplitDiff')) {
      return splitDiff(repo, file);
    } else {
      diffFilePath = Path.join(repo.getPath(), "atom_git_plus.diff");
      if (!file) {
        return notifier.addError("No open file. Select 'Diff All'.");
      }
      args = ['diff', '--color=never'];
      if (atom.config.get('git-plus.diffs.includeStagedDiff')) {
        args.push('HEAD');
      }
      if (atom.config.get('git-plus.diffs.wordDiff')) {
        args.push('--word-diff');
      }
      if (!diffStat) {
        args.push(file);
      }
      return git.cmd(args, {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return prepFile((diffStat != null ? diffStat : '') + data, diffFilePath);
      }).then(function() {
        return showFile(diffFilePath);
      }).then(function(textEditor) {
        return disposables.add(textEditor.onDidDestroy(function() {
          return fs.unlink(diffFilePath);
        }));
      })["catch"](function(err) {
        if (err === nothingToShow) {
          return notifier.addInfo(err);
        } else {
          return notifier.addError(err);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLDRCQUFSOztFQUVmLGFBQUEsR0FBZ0I7O0VBRWhCLFdBQUEsR0FBYyxJQUFJOztFQUVsQixRQUFBLEdBQVcsU0FBQyxRQUFEO0FBQ1QsUUFBQTtJQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUFIO01BQ0UsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCO01BQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBZixDQUFBLENBQTBCLENBQUMsYUFBM0IsQ0FBQSxDQUEyQyxDQUFBLE9BQUEsR0FBUSxjQUFSLENBQTNDLENBQUEsRUFGRjs7V0FHQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7RUFKUzs7RUFNWCxRQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sUUFBUDtXQUNMLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRCxFQUFVLE1BQVY7TUFDVixvQkFBRyxJQUFJLENBQUUsZ0JBQU4sS0FBZ0IsQ0FBbkI7ZUFDRSxNQUFBLENBQU8sYUFBUCxFQURGO09BQUEsTUFBQTtlQUdFLEVBQUUsQ0FBQyxTQUFILENBQWEsUUFBYixFQUF1QixJQUF2QixFQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCLEVBQXlDLFNBQUMsR0FBRDtVQUN2QyxJQUFHLEdBQUg7bUJBQVksTUFBQSxDQUFPLEdBQVAsRUFBWjtXQUFBLE1BQUE7bUJBQTRCLE9BQUEsQ0FBUSxJQUFSLEVBQTVCOztRQUR1QyxDQUF6QyxFQUhGOztJQURVLENBQVI7RUFESzs7RUFRWCxTQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sVUFBUDtXQUNWLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixVQUFwQixFQUFnQztNQUM5QixLQUFBLEVBQU8sTUFEdUI7TUFFOUIsWUFBQSxFQUFjLEtBRmdCO01BRzlCLFlBQUEsRUFBYyxJQUhnQjtNQUk5QixjQUFBLEVBQWdCLEtBSmM7S0FBaEMsQ0FLRSxDQUFDLElBTEgsQ0FLUSxTQUFDLE1BQUQ7YUFBWSxZQUFZLENBQUMsWUFBYixDQUEwQixJQUExQixFQUFnQyxNQUFoQyxFQUF3QyxJQUFJLENBQUMsTUFBN0M7SUFBWixDQUxSO0VBRFU7O0VBUVosTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7d0JBRHNCLE1BQWlCLElBQWhCLHlCQUFVOztNQUNqQyxPQUFRLElBQUksQ0FBQyxVQUFMLDZEQUFvRCxDQUFFLE9BQXRDLENBQUEsVUFBaEI7O0lBQ1IsSUFBRyxJQUFBLElBQVMsSUFBQSxLQUFVLEdBQW5CLElBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQ0FBaEIsQ0FBOUI7YUFDRSxTQUFBLENBQVUsSUFBVixFQUFnQixJQUFoQixFQURGO0tBQUEsTUFBQTtNQUdFLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxPQUFMLENBQUEsQ0FBVixFQUEwQixvQkFBMUI7TUFDZixJQUFHLENBQUksSUFBUDtBQUNFLGVBQU8sUUFBUSxDQUFDLFFBQVQsQ0FBa0Isa0NBQWxCLEVBRFQ7O01BRUEsSUFBQSxHQUFPLENBQUMsTUFBRCxFQUFTLGVBQVQ7TUFDUCxJQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCLENBQXBCO1FBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQUE7O01BQ0EsSUFBMkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUEzQjtRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixFQUFBOztNQUNBLElBQUEsQ0FBc0IsUUFBdEI7UUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBQTs7YUFDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7ZUFBVSxRQUFBLENBQVMsb0JBQUMsV0FBVyxFQUFaLENBQUEsR0FBa0IsSUFBM0IsRUFBaUMsWUFBakM7TUFBVixDQUROLENBRUEsQ0FBQyxJQUZELENBRU0sU0FBQTtlQUFHLFFBQUEsQ0FBUyxZQUFUO01BQUgsQ0FGTixDQUdBLENBQUMsSUFIRCxDQUdNLFNBQUMsVUFBRDtlQUNKLFdBQVcsQ0FBQyxHQUFaLENBQWdCLFVBQVUsQ0FBQyxZQUFYLENBQXdCLFNBQUE7aUJBQUcsRUFBRSxDQUFDLE1BQUgsQ0FBVSxZQUFWO1FBQUgsQ0FBeEIsQ0FBaEI7TUFESSxDQUhOLENBS0EsRUFBQyxLQUFELEVBTEEsQ0FLTyxTQUFDLEdBQUQ7UUFDTCxJQUFHLEdBQUEsS0FBTyxhQUFWO2lCQUNFLFFBQVEsQ0FBQyxPQUFULENBQWlCLEdBQWpCLEVBREY7U0FBQSxNQUFBO2lCQUdFLFFBQVEsQ0FBQyxRQUFULENBQWtCLEdBQWxCLEVBSEY7O01BREssQ0FMUCxFQVZGOztFQUZlO0FBbkNqQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5PcyA9IHJlcXVpcmUgJ29zJ1xuUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5SZXZpc2lvblZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9naXQtcmV2aXNpb24tdmlldydcblxubm90aGluZ1RvU2hvdyA9ICdOb3RoaW5nIHRvIHNob3cuJ1xuXG5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbnNob3dGaWxlID0gKGZpbGVQYXRoKSAtPlxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwub3BlbkluUGFuZScpXG4gICAgc3BsaXREaXJlY3Rpb24gPSBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLmdlbmVyYWwuc3BsaXRQYW5lJylcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRBY3RpdmVQYW5lKClbXCJzcGxpdCN7c3BsaXREaXJlY3Rpb259XCJdKClcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcblxucHJlcEZpbGUgPSAodGV4dCwgZmlsZVBhdGgpIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgaWYgdGV4dD8ubGVuZ3RoIGlzIDBcbiAgICAgIHJlamVjdCBub3RoaW5nVG9TaG93XG4gICAgZWxzZVxuICAgICAgZnMud3JpdGVGaWxlIGZpbGVQYXRoLCB0ZXh0LCBmbGFnOiAndysnLCAoZXJyKSAtPlxuICAgICAgICBpZiBlcnIgdGhlbiByZWplY3QgZXJyIGVsc2UgcmVzb2x2ZSB0cnVlXG5cbnNwbGl0RGlmZiA9IChyZXBvLCBwYXRoVG9GaWxlKSAtPlxuICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhUb0ZpbGUsIHtcbiAgICBzcGxpdDogJ2xlZnQnLFxuICAgIGFjdGl2YXRlUGFuZTogZmFsc2UsXG4gICAgYWN0aXZhdGVJdGVtOiB0cnVlLFxuICAgIHNlYXJjaEFsbFBhbmVzOiBmYWxzZVxuICB9KS50aGVuIChlZGl0b3IpIC0+IFJldmlzaW9uVmlldy5zaG93UmV2aXNpb24ocmVwbywgZWRpdG9yLCByZXBvLmJyYW5jaClcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge2RpZmZTdGF0LCBmaWxlfT17fSkgLT5cbiAgZmlsZSA/PSByZXBvLnJlbGF0aXZpemUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKCkpXG4gIGlmIGZpbGUgYW5kIGZpbGUgaXNudCAnLicgYW5kIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLnVzZVNwbGl0RGlmZicpXG4gICAgc3BsaXREaWZmKHJlcG8sIGZpbGUpXG4gIGVsc2VcbiAgICBkaWZmRmlsZVBhdGggPSBQYXRoLmpvaW4ocmVwby5nZXRQYXRoKCksIFwiYXRvbV9naXRfcGx1cy5kaWZmXCIpXG4gICAgaWYgbm90IGZpbGVcbiAgICAgIHJldHVybiBub3RpZmllci5hZGRFcnJvciBcIk5vIG9wZW4gZmlsZS4gU2VsZWN0ICdEaWZmIEFsbCcuXCJcbiAgICBhcmdzID0gWydkaWZmJywgJy0tY29sb3I9bmV2ZXInXVxuICAgIGFyZ3MucHVzaCAnSEVBRCcgaWYgYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZidcbiAgICBhcmdzLnB1c2ggJy0td29yZC1kaWZmJyBpZiBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLmRpZmZzLndvcmREaWZmJ1xuICAgIGFyZ3MucHVzaCBmaWxlIHVubGVzcyBkaWZmU3RhdFxuICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT4gcHJlcEZpbGUoKGRpZmZTdGF0ID8gJycpICsgZGF0YSwgZGlmZkZpbGVQYXRoKVxuICAgIC50aGVuIC0+IHNob3dGaWxlIGRpZmZGaWxlUGF0aFxuICAgIC50aGVuICh0ZXh0RWRpdG9yKSAtPlxuICAgICAgZGlzcG9zYWJsZXMuYWRkIHRleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGZzLnVubGluayBkaWZmRmlsZVBhdGhcbiAgICAuY2F0Y2ggKGVycikgLT5cbiAgICAgIGlmIGVyciBpcyBub3RoaW5nVG9TaG93XG4gICAgICAgIG5vdGlmaWVyLmFkZEluZm8gZXJyXG4gICAgICBlbHNlXG4gICAgICAgIG5vdGlmaWVyLmFkZEVycm9yIGVyclxuIl19
