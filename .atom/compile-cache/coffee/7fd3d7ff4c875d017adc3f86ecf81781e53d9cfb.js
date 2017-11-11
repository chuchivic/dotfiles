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
      atom.workspace.getActivePane()["split" + splitDirection]();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSOztFQUNOLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFDWCxZQUFBLEdBQWUsT0FBQSxDQUFRLDRCQUFSOztFQUVmLGFBQUEsR0FBZ0I7O0VBRWhCLFdBQUEsR0FBYyxJQUFJOztFQUVsQixRQUFBLEdBQVcsU0FBQyxRQUFEO0FBQ1QsUUFBQTtJQUFBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixDQUFIO01BQ0UsY0FBQSxHQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCO01BQ2pCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUFBLENBQStCLENBQUEsT0FBQSxHQUFRLGNBQVIsQ0FBL0IsQ0FBQSxFQUZGOztXQUdBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixRQUFwQjtFQUpTOztFQU1YLFFBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxRQUFQO1dBQ0wsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjtNQUNWLG9CQUFHLElBQUksQ0FBRSxnQkFBTixLQUFnQixDQUFuQjtlQUNFLE1BQUEsQ0FBTyxhQUFQLEVBREY7T0FBQSxNQUFBO2VBR0UsRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFiLEVBQXVCLElBQXZCLEVBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0IsRUFBeUMsU0FBQyxHQUFEO1VBQ3ZDLElBQUcsR0FBSDttQkFBWSxNQUFBLENBQU8sR0FBUCxFQUFaO1dBQUEsTUFBQTttQkFBNEIsT0FBQSxDQUFRLElBQVIsRUFBNUI7O1FBRHVDLENBQXpDLEVBSEY7O0lBRFUsQ0FBUjtFQURLOztFQVFYLFNBQUEsR0FBWSxTQUFDLElBQUQsRUFBTyxVQUFQO1dBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBQWdDO01BQzlCLEtBQUEsRUFBTyxNQUR1QjtNQUU5QixZQUFBLEVBQWMsS0FGZ0I7TUFHOUIsWUFBQSxFQUFjLElBSGdCO01BSTlCLGNBQUEsRUFBZ0IsS0FKYztLQUFoQyxDQUtFLENBQUMsSUFMSCxDQUtRLFNBQUMsTUFBRDthQUFZLFlBQVksQ0FBQyxZQUFiLENBQTBCLElBQTFCLEVBQWdDLE1BQWhDLEVBQXdDLElBQUksQ0FBQyxNQUE3QztJQUFaLENBTFI7RUFEVTs7RUFRWixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxHQUFQO0FBQ2YsUUFBQTt3QkFEc0IsTUFBaUIsSUFBaEIseUJBQVU7O01BQ2pDLE9BQVEsSUFBSSxDQUFDLFVBQUwsNkRBQW9ELENBQUUsT0FBdEMsQ0FBQSxVQUFoQjs7SUFDUixJQUFHLElBQUEsSUFBUyxJQUFBLEtBQVUsR0FBbkIsSUFBMkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQixDQUE5QjthQUNFLFNBQUEsQ0FBVSxJQUFWLEVBQWdCLElBQWhCLEVBREY7S0FBQSxNQUFBO01BR0UsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFWLEVBQTBCLG9CQUExQjtNQUNmLElBQUcsQ0FBSSxJQUFQO0FBQ0UsZUFBTyxRQUFRLENBQUMsUUFBVCxDQUFrQixrQ0FBbEIsRUFEVDs7TUFFQSxJQUFBLEdBQU8sQ0FBQyxNQUFELEVBQVMsZUFBVDtNQUNQLElBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQ0FBaEIsQ0FBcEI7UUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsRUFBQTs7TUFDQSxJQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQTNCO1FBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxhQUFWLEVBQUE7O01BQ0EsSUFBQSxDQUFzQixRQUF0QjtRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQUFBOzthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7T0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtlQUFVLFFBQUEsQ0FBUyxvQkFBQyxXQUFXLEVBQVosQ0FBQSxHQUFrQixJQUEzQixFQUFpQyxZQUFqQztNQUFWLENBRE4sQ0FFQSxDQUFDLElBRkQsQ0FFTSxTQUFBO2VBQUcsUUFBQSxDQUFTLFlBQVQ7TUFBSCxDQUZOLENBR0EsQ0FBQyxJQUhELENBR00sU0FBQyxVQUFEO2VBQ0osV0FBVyxDQUFDLEdBQVosQ0FBZ0IsVUFBVSxDQUFDLFlBQVgsQ0FBd0IsU0FBQTtpQkFBRyxFQUFFLENBQUMsTUFBSCxDQUFVLFlBQVY7UUFBSCxDQUF4QixDQUFoQjtNQURJLENBSE4sQ0FLQSxFQUFDLEtBQUQsRUFMQSxDQUtPLFNBQUMsR0FBRDtRQUNMLElBQUcsR0FBQSxLQUFPLGFBQVY7aUJBQ0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsR0FBakIsRUFERjtTQUFBLE1BQUE7aUJBR0UsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsR0FBbEIsRUFIRjs7TUFESyxDQUxQLEVBVkY7O0VBRmU7QUFuQ2pCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbk9zID0gcmVxdWlyZSAnb3MnXG5QYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcblJldmlzaW9uVmlldyA9IHJlcXVpcmUgJy4uL3ZpZXdzL2dpdC1yZXZpc2lvbi12aWV3J1xuXG5ub3RoaW5nVG9TaG93ID0gJ05vdGhpbmcgdG8gc2hvdy4nXG5cbmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuc2hvd0ZpbGUgPSAoZmlsZVBhdGgpIC0+XG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5vcGVuSW5QYW5lJylcbiAgICBzcGxpdERpcmVjdGlvbiA9IGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5zcGxpdFBhbmUnKVxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVtcInNwbGl0I3tzcGxpdERpcmVjdGlvbn1cIl0oKVxuICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuXG5wcmVwRmlsZSA9ICh0ZXh0LCBmaWxlUGF0aCkgLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICBpZiB0ZXh0Py5sZW5ndGggaXMgMFxuICAgICAgcmVqZWN0IG5vdGhpbmdUb1Nob3dcbiAgICBlbHNlXG4gICAgICBmcy53cml0ZUZpbGUgZmlsZVBhdGgsIHRleHQsIGZsYWc6ICd3KycsIChlcnIpIC0+XG4gICAgICAgIGlmIGVyciB0aGVuIHJlamVjdCBlcnIgZWxzZSByZXNvbHZlIHRydWVcblxuc3BsaXREaWZmID0gKHJlcG8sIHBhdGhUb0ZpbGUpIC0+XG4gIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aFRvRmlsZSwge1xuICAgIHNwbGl0OiAnbGVmdCcsXG4gICAgYWN0aXZhdGVQYW5lOiBmYWxzZSxcbiAgICBhY3RpdmF0ZUl0ZW06IHRydWUsXG4gICAgc2VhcmNoQWxsUGFuZXM6IGZhbHNlXG4gIH0pLnRoZW4gKGVkaXRvcikgLT4gUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbihyZXBvLCBlZGl0b3IsIHJlcG8uYnJhbmNoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7ZGlmZlN0YXQsIGZpbGV9PXt9KSAtPlxuICBmaWxlID89IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgaWYgZmlsZSBhbmQgZmlsZSBpc250ICcuJyBhbmQgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwudXNlU3BsaXREaWZmJylcbiAgICBzcGxpdERpZmYocmVwbywgZmlsZSlcbiAgZWxzZVxuICAgIGRpZmZGaWxlUGF0aCA9IFBhdGguam9pbihyZXBvLmdldFBhdGgoKSwgXCJhdG9tX2dpdF9wbHVzLmRpZmZcIilcbiAgICBpZiBub3QgZmlsZVxuICAgICAgcmV0dXJuIG5vdGlmaWVyLmFkZEVycm9yIFwiTm8gb3BlbiBmaWxlLiBTZWxlY3QgJ0RpZmYgQWxsJy5cIlxuICAgIGFyZ3MgPSBbJ2RpZmYnLCAnLS1jb2xvcj1uZXZlciddXG4gICAgYXJncy5wdXNoICdIRUFEJyBpZiBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLmRpZmZzLmluY2x1ZGVTdGFnZWREaWZmJ1xuICAgIGFyZ3MucHVzaCAnLS13b3JkLWRpZmYnIGlmIGF0b20uY29uZmlnLmdldCAnZ2l0LXBsdXMuZGlmZnMud29yZERpZmYnXG4gICAgYXJncy5wdXNoIGZpbGUgdW5sZXNzIGRpZmZTdGF0XG4gICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPiBwcmVwRmlsZSgoZGlmZlN0YXQgPyAnJykgKyBkYXRhLCBkaWZmRmlsZVBhdGgpXG4gICAgLnRoZW4gLT4gc2hvd0ZpbGUgZGlmZkZpbGVQYXRoXG4gICAgLnRoZW4gKHRleHRFZGl0b3IpIC0+XG4gICAgICBkaXNwb3NhYmxlcy5hZGQgdGV4dEVkaXRvci5vbkRpZERlc3Ryb3kgLT4gZnMudW5saW5rIGRpZmZGaWxlUGF0aFxuICAgIC5jYXRjaCAoZXJyKSAtPlxuICAgICAgaWYgZXJyIGlzIG5vdGhpbmdUb1Nob3dcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyBlcnJcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkRXJyb3IgZXJyXG4iXX0=
