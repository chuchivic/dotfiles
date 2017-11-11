(function() {
  var RemoteListView, git;

  git = require('../git');

  RemoteListView = require('../views/remote-list-view');

  module.exports = function(repo, arg) {
    var setUpstream;
    setUpstream = (arg != null ? arg : {}).setUpstream;
    return git.cmd(['remote'], {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      var mode;
      mode = setUpstream ? 'push -u' : 'push';
      return new RemoteListView(repo, data, {
        mode: mode
      });
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtcHVzaC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixjQUFBLEdBQWlCLE9BQUEsQ0FBUSwyQkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUDtBQUNmLFFBQUE7SUFEdUIsNkJBQUQsTUFBYztXQUNwQyxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsUUFBRCxDQUFSLEVBQW9CO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBcEIsQ0FBb0QsQ0FBQyxJQUFyRCxDQUEwRCxTQUFDLElBQUQ7QUFDeEQsVUFBQTtNQUFBLElBQUEsR0FBVSxXQUFILEdBQW9CLFNBQXBCLEdBQW1DO2FBQ3RDLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsSUFBckIsRUFBMkI7UUFBQyxNQUFBLElBQUQ7T0FBM0I7SUFGb0QsQ0FBMUQ7RUFEZTtBQUhqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcblJlbW90ZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvcmVtb3RlLWxpc3QtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge3NldFVwc3RyZWFtfT17fSkgLT5cbiAgZ2l0LmNtZChbJ3JlbW90ZSddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKS50aGVuIChkYXRhKSAtPlxuICAgIG1vZGUgPSBpZiBzZXRVcHN0cmVhbSB0aGVuICdwdXNoIC11JyBlbHNlICdwdXNoJ1xuICAgIG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCBkYXRhLCB7bW9kZX0pXG4iXX0=
