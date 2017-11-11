'use babel';

var fs = require('fs-plus');
var git = require('../git');
var notifier = require('../notifier');
var BranchListView = require('../views/branch-list-view');

module.exports = function (repo) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? { remote: false } : arguments[1];

  var args = options.remote ? ['branch', '-r', '--no-color'] : ['branch', '--no-color'];
  return git.cmd(args, { cwd: repo.getWorkingDirectory() }).then(function (data) {
    return new BranchListView(data, function (_ref) {
      var name = _ref.name;

      var args = options.remote ? ['checkout', name, '--track'] : ['checkout', name];
      git.cmd(args, { cwd: repo.getWorkingDirectory() }).then(function (message) {
        notifier.addSuccess(message);
        atom.workspace.getTextEditors().forEach(function (editor) {
          try {
            var path = editor.getPath();
            console.log('Git-plus: editor.getPath() returned \'' + path + '\'');
            if (path && path.toString) {
              fs.exists(path.toString(), function (exists) {
                if (!exists) editor.destroy();
              });
            }
          } catch (error) {
            notifier.addWarning("There was an error closing windows for non-existing files after the checkout. Please check the dev console.");
            console.info("Git-plus: please take a screenshot of what has been printed in the console and add it to the issue on github at https://github.com/akonwi/git-plus/issues/139", error);
          }
        });
        git.refresh(repo);
      })['catch'](notifier.addError);
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LWNoZWNrb3V0LWJyYW5jaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7O0FBRVgsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQzdCLElBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM3QixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkMsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUE7O0FBRTNELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBQyxJQUFJLEVBQThCO01BQTVCLE9BQU8seURBQUMsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFDOztBQUM3QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUN2RixTQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFDLENBQUMsQ0FDdEQsSUFBSSxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ1osV0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBQyxJQUFNLEVBQUs7VUFBVixJQUFJLEdBQUwsSUFBTSxDQUFMLElBQUk7O0FBQ3BDLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ2hGLFNBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFDLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ2YsZ0JBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDNUIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEQsY0FBSTtBQUNGLGdCQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDN0IsbUJBQU8sQ0FBQyxHQUFHLDRDQUF5QyxJQUFJLFFBQUksQ0FBQTtBQUM1RCxnQkFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUN6QixnQkFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBQSxNQUFNLEVBQUk7QUFBQyxvQkFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUE7ZUFBQyxDQUFDLENBQUE7YUFDdEU7V0FDRixDQUNELE9BQU8sS0FBSyxFQUFFO0FBQ1osb0JBQVEsQ0FBQyxVQUFVLENBQUMsNkdBQTZHLENBQUMsQ0FBQTtBQUNsSSxtQkFBTyxDQUFDLElBQUksQ0FBQywrSkFBK0osRUFBRSxLQUFLLENBQUMsQ0FBQTtXQUNyTDtTQUNGLENBQUMsQ0FBQTtBQUNGLFdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDbEIsQ0FBQyxTQUNJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzFCLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtY2hlY2tvdXQtYnJhbmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcy1wbHVzJylcbmNvbnN0IGdpdCA9IHJlcXVpcmUoJy4uL2dpdCcpXG5jb25zdCBub3RpZmllciA9IHJlcXVpcmUoJy4uL25vdGlmaWVyJylcbmNvbnN0IEJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSgnLi4vdmlld3MvYnJhbmNoLWxpc3QtdmlldycpXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIG9wdGlvbnM9e3JlbW90ZTogZmFsc2V9KSA9PiB7XG4gIGNvbnN0IGFyZ3MgPSBvcHRpb25zLnJlbW90ZSA/IFsnYnJhbmNoJywgJy1yJywgJy0tbm8tY29sb3InXSA6IFsnYnJhbmNoJywgJy0tbm8tY29sb3InXVxuICByZXR1cm4gZ2l0LmNtZChhcmdzLCB7Y3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKX0pXG4gIC50aGVuKGRhdGEgPT4ge1xuICAgIHJldHVybiBuZXcgQnJhbmNoTGlzdFZpZXcoZGF0YSwgKHtuYW1lfSkgPT4ge1xuICAgICAgY29uc3QgYXJncyA9IG9wdGlvbnMucmVtb3RlID8gWydjaGVja291dCcsIG5hbWUsICctLXRyYWNrJ10gOiBbJ2NoZWNrb3V0JywgbmFtZV1cbiAgICAgIGdpdC5jbWQoYXJncywge2N3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCl9KVxuICAgICAgLnRoZW4obWVzc2FnZSA9PiB7XG4gICAgICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MobWVzc2FnZSlcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoKGVkaXRvciA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgR2l0LXBsdXM6IGVkaXRvci5nZXRQYXRoKCkgcmV0dXJuZWQgJyR7cGF0aH0nYClcbiAgICAgICAgICAgIGlmIChwYXRoICYmIHBhdGgudG9TdHJpbmcpIHtcbiAgICAgICAgICAgICAgZnMuZXhpc3RzKHBhdGgudG9TdHJpbmcoKSwgZXhpc3RzID0+IHtpZiAoIWV4aXN0cykgZWRpdG9yLmRlc3Ryb3koKX0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbm90aWZpZXIuYWRkV2FybmluZyhcIlRoZXJlIHdhcyBhbiBlcnJvciBjbG9zaW5nIHdpbmRvd3MgZm9yIG5vbi1leGlzdGluZyBmaWxlcyBhZnRlciB0aGUgY2hlY2tvdXQuIFBsZWFzZSBjaGVjayB0aGUgZGV2IGNvbnNvbGUuXCIpXG4gICAgICAgICAgICBjb25zb2xlLmluZm8oXCJHaXQtcGx1czogcGxlYXNlIHRha2UgYSBzY3JlZW5zaG90IG9mIHdoYXQgaGFzIGJlZW4gcHJpbnRlZCBpbiB0aGUgY29uc29sZSBhbmQgYWRkIGl0IHRvIHRoZSBpc3N1ZSBvbiBnaXRodWIgYXQgaHR0cHM6Ly9naXRodWIuY29tL2Frb253aS9naXQtcGx1cy9pc3N1ZXMvMTM5XCIsIGVycm9yKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgZ2l0LnJlZnJlc2gocmVwbylcbiAgICAgIH0pXG4gICAgICAuY2F0Y2gobm90aWZpZXIuYWRkRXJyb3IpXG4gICAgfSlcbiAgfSlcbn1cbiJdfQ==