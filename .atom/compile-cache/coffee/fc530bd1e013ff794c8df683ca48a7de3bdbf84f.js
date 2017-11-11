(function() {
  var OutputViewManager, fs, git, notifier;

  git = require('../git');

  notifier = require('../notifier');

  OutputViewManager = require('../output-view-manager');

  fs = require('fs-plus');

  module.exports = function(repo, arg) {
    var file, isFolder, ref, tool;
    file = (arg != null ? arg : {}).file;
    if (file == null) {
      file = repo.relativize((ref = atom.workspace.getActiveTextEditor()) != null ? ref.getPath() : void 0);
    }
    isFolder = fs.isDirectorySync(file);
    if (!file) {
      return notifier.addInfo("No open file. Select 'Diff All'.");
    }
    if (!(tool = git.getConfig(repo, 'diff.tool'))) {
      return notifier.addInfo("You don't have a difftool configured.");
    } else {
      return git.cmd(['diff-index', 'HEAD', '-z'], {
        cwd: repo.getWorkingDirectory()
      }).then(function(data) {
        var args, diffIndex, diffsForCurrentFile, includeStagedDiff;
        diffIndex = data.split('\0');
        includeStagedDiff = atom.config.get('git-plus.diffs.includeStagedDiff');
        if (isFolder) {
          args = ['difftool', '-d', '--no-prompt'];
          if (includeStagedDiff) {
            args.push('HEAD');
          }
          args.push(file);
          git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          })["catch"](function(msg) {
            return OutputViewManager.getView().showContent(msg);
          });
          return;
        }
        diffsForCurrentFile = diffIndex.map(function(line, i) {
          var path, staged;
          if (i % 2 === 0) {
            staged = !/^0{40}$/.test(diffIndex[i].split(' ')[3]);
            path = diffIndex[i + 1];
            if (path === file && (!staged || includeStagedDiff)) {
              return true;
            }
          } else {
            return void 0;
          }
        });
        if (diffsForCurrentFile.filter(function(diff) {
          return diff != null;
        })[0] != null) {
          args = ['difftool', '--no-prompt'];
          if (includeStagedDiff) {
            args.push('HEAD');
          }
          args.push(file);
          return git.cmd(args, {
            cwd: repo.getWorkingDirectory()
          })["catch"](function(msg) {
            return OutputViewManager.getView().showContent(msg);
          });
        } else {
          return notifier.addInfo('Nothing to show.');
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZnRvb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLHNCQUFELE1BQU87O01BQzdCLE9BQVEsSUFBSSxDQUFDLFVBQUwsMkRBQW9ELENBQUUsT0FBdEMsQ0FBQSxVQUFoQjs7SUFDUixRQUFBLEdBQVcsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBbkI7SUFFWCxJQUFHLENBQUksSUFBUDtBQUNFLGFBQU8sUUFBUSxDQUFDLE9BQVQsQ0FBaUIsa0NBQWpCLEVBRFQ7O0lBS0EsSUFBQSxDQUFPLENBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZCxFQUFvQixXQUFwQixDQUFQLENBQVA7YUFDRSxRQUFRLENBQUMsT0FBVCxDQUFpQix1Q0FBakIsRUFERjtLQUFBLE1BQUE7YUFHRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsWUFBRCxFQUFlLE1BQWYsRUFBdUIsSUFBdkIsQ0FBUixFQUFzQztRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXRDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO0FBQ0osWUFBQTtRQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7UUFDWixpQkFBQSxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCO1FBRXBCLElBQUcsUUFBSDtVQUNFLElBQUEsR0FBTyxDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLGFBQW5CO1VBQ1AsSUFBb0IsaUJBQXBCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQUE7O1VBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO1VBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7WUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtXQUFkLENBQ0EsRUFBQyxLQUFELEVBREEsQ0FDTyxTQUFDLEdBQUQ7bUJBQVMsaUJBQWlCLENBQUMsT0FBbEIsQ0FBQSxDQUEyQixDQUFDLFdBQTVCLENBQXdDLEdBQXhDO1VBQVQsQ0FEUDtBQUVBLGlCQU5GOztRQVFBLG1CQUFBLEdBQXNCLFNBQVMsQ0FBQyxHQUFWLENBQWMsU0FBQyxJQUFELEVBQU8sQ0FBUDtBQUNsQyxjQUFBO1VBQUEsSUFBRyxDQUFBLEdBQUksQ0FBSixLQUFTLENBQVo7WUFDRSxNQUFBLEdBQVMsQ0FBSSxTQUFTLENBQUMsSUFBVixDQUFlLFNBQVUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFiLENBQW1CLEdBQW5CLENBQXdCLENBQUEsQ0FBQSxDQUF2QztZQUNiLElBQUEsR0FBTyxTQUFVLENBQUEsQ0FBQSxHQUFFLENBQUY7WUFDakIsSUFBUSxJQUFBLEtBQVEsSUFBUixJQUFpQixDQUFDLENBQUMsTUFBRCxJQUFXLGlCQUFaLENBQXpCO3FCQUFBLEtBQUE7YUFIRjtXQUFBLE1BQUE7bUJBS0UsT0FMRjs7UUFEa0MsQ0FBZDtRQVF0QixJQUFHOztxQkFBSDtVQUNFLElBQUEsR0FBTyxDQUFDLFVBQUQsRUFBYSxhQUFiO1VBQ1AsSUFBb0IsaUJBQXBCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQUE7O1VBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO2lCQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1lBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7V0FBZCxDQUNBLEVBQUMsS0FBRCxFQURBLENBQ08sU0FBQyxHQUFEO21CQUFTLGlCQUFpQixDQUFDLE9BQWxCLENBQUEsQ0FBMkIsQ0FBQyxXQUE1QixDQUF3QyxHQUF4QztVQUFULENBRFAsRUFKRjtTQUFBLE1BQUE7aUJBT0UsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsa0JBQWpCLEVBUEY7O01BcEJJLENBRE4sRUFIRjs7RUFUZTtBQUxqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5PdXRwdXRWaWV3TWFuYWdlciA9IHJlcXVpcmUgJy4uL291dHB1dC12aWV3LW1hbmFnZXInXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cbm1vZHVsZS5leHBvcnRzID0gKHJlcG8sIHtmaWxlfT17fSkgLT5cbiAgZmlsZSA/PSByZXBvLnJlbGF0aXZpemUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKCkpXG4gIGlzRm9sZGVyID0gZnMuaXNEaXJlY3RvcnlTeW5jIGZpbGVcblxuICBpZiBub3QgZmlsZVxuICAgIHJldHVybiBub3RpZmllci5hZGRJbmZvIFwiTm8gb3BlbiBmaWxlLiBTZWxlY3QgJ0RpZmYgQWxsJy5cIlxuXG4gICMgV2UgcGFyc2UgdGhlIG91dHB1dCBvZiBnaXQgZGlmZi1pbmRleCB0byBoYW5kbGUgdGhlIGNhc2Ugb2YgYSBzdGFnZWQgZmlsZVxuICAjIHdoZW4gZ2l0LXBsdXMuZGlmZnMuaW5jbHVkZVN0YWdlZERpZmYgaXMgc2V0IHRvIGZhbHNlLlxuICB1bmxlc3MgdG9vbCA9IGdpdC5nZXRDb25maWcocmVwbywgJ2RpZmYudG9vbCcpXG4gICAgbm90aWZpZXIuYWRkSW5mbyBcIllvdSBkb24ndCBoYXZlIGEgZGlmZnRvb2wgY29uZmlndXJlZC5cIlxuICBlbHNlXG4gICAgZ2l0LmNtZChbJ2RpZmYtaW5kZXgnLCAnSEVBRCcsICcteiddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSAtPlxuICAgICAgZGlmZkluZGV4ID0gZGF0YS5zcGxpdCgnXFwwJylcbiAgICAgIGluY2x1ZGVTdGFnZWREaWZmID0gYXRvbS5jb25maWcuZ2V0ICdnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZidcblxuICAgICAgaWYgaXNGb2xkZXJcbiAgICAgICAgYXJncyA9IFsnZGlmZnRvb2wnLCAnLWQnLCAnLS1uby1wcm9tcHQnXVxuICAgICAgICBhcmdzLnB1c2ggJ0hFQUQnIGlmIGluY2x1ZGVTdGFnZWREaWZmXG4gICAgICAgIGFyZ3MucHVzaCBmaWxlXG4gICAgICAgIGdpdC5jbWQoYXJncywgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAgICAgLmNhdGNoIChtc2cpIC0+IE91dHB1dFZpZXdNYW5hZ2VyLmdldFZpZXcoKS5zaG93Q29udGVudChtc2cpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBkaWZmc0ZvckN1cnJlbnRGaWxlID0gZGlmZkluZGV4Lm1hcCAobGluZSwgaSkgLT5cbiAgICAgICAgaWYgaSAlIDIgaXMgMFxuICAgICAgICAgIHN0YWdlZCA9IG5vdCAvXjB7NDB9JC8udGVzdChkaWZmSW5kZXhbaV0uc3BsaXQoJyAnKVszXSk7XG4gICAgICAgICAgcGF0aCA9IGRpZmZJbmRleFtpKzFdXG4gICAgICAgICAgdHJ1ZSBpZiBwYXRoIGlzIGZpbGUgYW5kICghc3RhZ2VkIG9yIGluY2x1ZGVTdGFnZWREaWZmKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdW5kZWZpbmVkXG5cbiAgICAgIGlmIGRpZmZzRm9yQ3VycmVudEZpbGUuZmlsdGVyKChkaWZmKSAtPiBkaWZmPylbMF0/XG4gICAgICAgIGFyZ3MgPSBbJ2RpZmZ0b29sJywgJy0tbm8tcHJvbXB0J11cbiAgICAgICAgYXJncy5wdXNoICdIRUFEJyBpZiBpbmNsdWRlU3RhZ2VkRGlmZlxuICAgICAgICBhcmdzLnB1c2ggZmlsZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAgIC5jYXRjaCAobXNnKSAtPiBPdXRwdXRWaWV3TWFuYWdlci5nZXRWaWV3KCkuc2hvd0NvbnRlbnQobXNnKVxuICAgICAgZWxzZVxuICAgICAgICBub3RpZmllci5hZGRJbmZvICdOb3RoaW5nIHRvIHNob3cuJ1xuIl19
