(function() {
  var RemoteListView, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  module.exports = function(repo) {
    var extraArgs;
    extraArgs = atom.config.get('git-plus.remoteInteractions.pullRebase') ? ['--rebase'] : [];
    if (atom.config.get('git-plus.remoteInteractions.pullAutostash')) {
      extraArgs.push('--autostash');
    }
    if (atom.config.get('git-plus.remoteInteractions.promptForBranch')) {
      return git.cmd(['remote'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        return new RemoteListView(repo, data, {
          mode: 'pull',
          extraArgs: extraArgs
        }).result;
      });
    } else {
      return pull(repo, {
        extraArgs: extraArgs
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcHVsbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0VBQ1AsY0FBQSxHQUFpQixPQUFBLENBQVEsMkJBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxTQUFBLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUFILEdBQWtFLENBQUMsVUFBRCxDQUFsRSxHQUFvRjtJQUNoRyxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwyQ0FBaEIsQ0FBSDtNQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsYUFBZixFQURGOztJQUVBLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZDQUFoQixDQUFIO2FBQ0UsR0FBRyxDQUFDLEdBQUosQ0FBUSxDQUFDLFFBQUQsQ0FBUixFQUFvQjtRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXBCLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO2VBQ0osSUFBSSxjQUFBLENBQWUsSUFBZixFQUFxQixJQUFyQixFQUEyQjtVQUFBLElBQUEsRUFBTSxNQUFOO1VBQWMsU0FBQSxFQUFXLFNBQXpCO1NBQTNCLENBQThELENBQUM7TUFEL0QsQ0FETixFQURGO0tBQUEsTUFBQTthQUtFLElBQUEsQ0FBSyxJQUFMLEVBQVc7UUFBQyxXQUFBLFNBQUQ7T0FBWCxFQUxGOztFQUplO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xucHVsbCA9IHJlcXVpcmUgJy4vX3B1bGwnXG5SZW1vdGVMaXN0VmlldyA9IHJlcXVpcmUgJy4uL3ZpZXdzL3JlbW90ZS1saXN0LXZpZXcnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8pIC0+XG4gIGV4dHJhQXJncyA9IGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxSZWJhc2UnKSB0aGVuIFsnLS1yZWJhc2UnXSBlbHNlIFtdXG4gIGlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxBdXRvc3Rhc2gnKVxuICAgIGV4dHJhQXJncy5wdXNoICctLWF1dG9zdGFzaCdcbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJylcbiAgICBnaXQuY21kKFsncmVtb3RlJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgZGF0YSwgbW9kZTogJ3B1bGwnLCBleHRyYUFyZ3M6IGV4dHJhQXJncykucmVzdWx0XG4gIGVsc2VcbiAgICBwdWxsIHJlcG8sIHtleHRyYUFyZ3N9XG4iXX0=
