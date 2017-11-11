(function() {
  var MergeListView, git;

  git = require('../git');

  MergeListView = require('../views/merge-list-view');

  module.exports = function(repo, arg) {
    var args, extraArgs, noFastForward, ref, remote;
    ref = arg != null ? arg : {}, remote = ref.remote, noFastForward = ref.noFastForward;
    extraArgs = noFastForward ? ['--no-ff'] : [];
    args = ['branch', '--no-color'];
    if (remote) {
      args.push('-r');
    }
    return git.cmd(args, {
      cwd: repo.getWorkingDirectory()
    }).then(function(data) {
      return new MergeListView(repo, data, extraArgs);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtbWVyZ2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sYUFBQSxHQUFnQixPQUFBLENBQVEsMEJBQVI7O0VBRWhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO3dCQURzQixNQUF3QixJQUF2QixxQkFBUTtJQUMvQixTQUFBLEdBQWUsYUFBSCxHQUFzQixDQUFDLFNBQUQsQ0FBdEIsR0FBdUM7SUFDbkQsSUFBQSxHQUFPLENBQUMsUUFBRCxFQUFXLFlBQVg7SUFDUCxJQUFrQixNQUFsQjtNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVixFQUFBOztXQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO01BQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7S0FBZCxDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDthQUFjLElBQUEsYUFBQSxDQUFjLElBQWQsRUFBb0IsSUFBcEIsRUFBMEIsU0FBMUI7SUFBZCxDQUROO0VBSmU7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5NZXJnZUxpc3RWaWV3ID0gcmVxdWlyZSAnLi4vdmlld3MvbWVyZ2UtbGlzdC12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9IChyZXBvLCB7cmVtb3RlLCBub0Zhc3RGb3J3YXJkfT17fSkgLT5cbiAgZXh0cmFBcmdzID0gaWYgbm9GYXN0Rm9yd2FyZCB0aGVuIFsnLS1uby1mZiddIGVsc2UgW11cbiAgYXJncyA9IFsnYnJhbmNoJywgJy0tbm8tY29sb3InXVxuICBhcmdzLnB1c2ggJy1yJyBpZiByZW1vdGVcbiAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAudGhlbiAoZGF0YSkgLT4gbmV3IE1lcmdlTGlzdFZpZXcocmVwbywgZGF0YSwgZXh0cmFBcmdzKVxuIl19
