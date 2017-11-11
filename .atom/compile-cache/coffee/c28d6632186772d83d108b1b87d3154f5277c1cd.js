(function() {
  var RemoteListView, git, pull;

  git = require('../git');

  pull = require('./_pull');

  RemoteListView = require('../views/remote-list-view');

  module.exports = function(repo) {
    var extraArgs;
    extraArgs = atom.config.get('git-plus.remoteInteractions.pullRebase') ? ['--rebase'] : [];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcHVsbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0VBQ1AsY0FBQSxHQUFpQixPQUFBLENBQVEsMkJBQVI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRDtBQUNmLFFBQUE7SUFBQSxTQUFBLEdBQWUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUFILEdBQWtFLENBQUMsVUFBRCxDQUFsRSxHQUFvRjtJQUNoRyxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2Q0FBaEIsQ0FBSDthQUNFLEdBQUcsQ0FBQyxHQUFKLENBQVEsQ0FBQyxRQUFELENBQVIsRUFBb0I7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUFwQixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtlQUNKLElBQUksY0FBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkI7VUFBQSxJQUFBLEVBQU0sTUFBTjtVQUFjLFNBQUEsRUFBVyxTQUF6QjtTQUEzQixDQUE4RCxDQUFDO01BRC9ELENBRE4sRUFERjtLQUFBLE1BQUE7YUFLRSxJQUFBLENBQUssSUFBTCxFQUFXO1FBQUMsV0FBQSxTQUFEO09BQVgsRUFMRjs7RUFGZTtBQUpqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbnB1bGwgPSByZXF1aXJlICcuL19wdWxsJ1xuUmVtb3RlTGlzdFZpZXcgPSByZXF1aXJlICcuLi92aWV3cy9yZW1vdGUtbGlzdC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvKSAtPlxuICBleHRyYUFyZ3MgPSBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wdWxsUmViYXNlJykgdGhlbiBbJy0tcmViYXNlJ10gZWxzZSBbXVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2dpdC1wbHVzLnJlbW90ZUludGVyYWN0aW9ucy5wcm9tcHRGb3JCcmFuY2gnKVxuICAgIGdpdC5jbWQoWydyZW1vdGUnXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCBkYXRhLCBtb2RlOiAncHVsbCcsIGV4dHJhQXJnczogZXh0cmFBcmdzKS5yZXN1bHRcbiAgZWxzZVxuICAgIHB1bGwgcmVwbywge2V4dHJhQXJnc31cbiJdfQ==
