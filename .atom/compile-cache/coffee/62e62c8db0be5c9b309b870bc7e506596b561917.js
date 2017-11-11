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
            return OutputViewManager.create().setContent(msg).finish();
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
            return OutputViewManager.create().setContent(msg).finish();
          });
        } else {
          return notifier.addInfo('Nothing to show.');
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL21vZGVscy9naXQtZGlmZnRvb2wuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSx3QkFBUjs7RUFDcEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsSUFBRCxFQUFPLEdBQVA7QUFDZixRQUFBO0lBRHVCLHNCQUFELE1BQU87O01BQzdCLE9BQVEsSUFBSSxDQUFDLFVBQUwsMkRBQW9ELENBQUUsT0FBdEMsQ0FBQSxVQUFoQjs7SUFDUixRQUFBLEdBQVcsRUFBRSxDQUFDLGVBQUgsQ0FBbUIsSUFBbkI7SUFFWCxJQUFHLENBQUksSUFBUDtBQUNFLGFBQU8sUUFBUSxDQUFDLE9BQVQsQ0FBaUIsa0NBQWpCLEVBRFQ7O0lBS0EsSUFBQSxDQUFPLENBQUEsSUFBQSxHQUFPLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZCxFQUFvQixXQUFwQixDQUFQLENBQVA7YUFDRSxRQUFRLENBQUMsT0FBVCxDQUFpQix1Q0FBakIsRUFERjtLQUFBLE1BQUE7YUFHRSxHQUFHLENBQUMsR0FBSixDQUFRLENBQUMsWUFBRCxFQUFlLE1BQWYsRUFBdUIsSUFBdkIsQ0FBUixFQUFzQztRQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO09BQXRDLENBQ0EsQ0FBQyxJQURELENBQ00sU0FBQyxJQUFEO0FBQ0osWUFBQTtRQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7UUFDWixpQkFBQSxHQUFvQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0NBQWhCO1FBRXBCLElBQUcsUUFBSDtVQUNFLElBQUEsR0FBTyxDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLGFBQW5CO1VBQ1AsSUFBb0IsaUJBQXBCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQUE7O1VBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO1VBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUSxJQUFSLEVBQWM7WUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtXQUFkLENBQ0EsRUFBQyxLQUFELEVBREEsQ0FDTyxTQUFDLEdBQUQ7bUJBQVMsaUJBQWlCLENBQUMsTUFBbEIsQ0FBQSxDQUEwQixDQUFDLFVBQTNCLENBQXNDLEdBQXRDLENBQTBDLENBQUMsTUFBM0MsQ0FBQTtVQUFULENBRFA7QUFFQSxpQkFORjs7UUFRQSxtQkFBQSxHQUFzQixTQUFTLENBQUMsR0FBVixDQUFjLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFDbEMsY0FBQTtVQUFBLElBQUcsQ0FBQSxHQUFJLENBQUosS0FBUyxDQUFaO1lBQ0UsTUFBQSxHQUFTLENBQUksU0FBUyxDQUFDLElBQVYsQ0FBZSxTQUFVLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBYixDQUFtQixHQUFuQixDQUF3QixDQUFBLENBQUEsQ0FBdkM7WUFDYixJQUFBLEdBQU8sU0FBVSxDQUFBLENBQUEsR0FBRSxDQUFGO1lBQ2pCLElBQVEsSUFBQSxLQUFRLElBQVIsSUFBaUIsQ0FBQyxDQUFDLE1BQUQsSUFBVyxpQkFBWixDQUF6QjtxQkFBQSxLQUFBO2FBSEY7V0FBQSxNQUFBO21CQUtFLE9BTEY7O1FBRGtDLENBQWQ7UUFRdEIsSUFBRzs7cUJBQUg7VUFDRSxJQUFBLEdBQU8sQ0FBQyxVQUFELEVBQWEsYUFBYjtVQUNQLElBQW9CLGlCQUFwQjtZQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBVixFQUFBOztVQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtpQkFDQSxHQUFHLENBQUMsR0FBSixDQUFRLElBQVIsRUFBYztZQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsbUJBQUwsQ0FBQSxDQUFMO1dBQWQsQ0FDQSxFQUFDLEtBQUQsRUFEQSxDQUNPLFNBQUMsR0FBRDttQkFBUyxpQkFBaUIsQ0FBQyxNQUFsQixDQUFBLENBQTBCLENBQUMsVUFBM0IsQ0FBc0MsR0FBdEMsQ0FBMEMsQ0FBQyxNQUEzQyxDQUFBO1VBQVQsQ0FEUCxFQUpGO1NBQUEsTUFBQTtpQkFPRSxRQUFRLENBQUMsT0FBVCxDQUFpQixrQkFBakIsRUFQRjs7TUFwQkksQ0FETixFQUhGOztFQVRlO0FBTGpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xubm90aWZpZXIgPSByZXF1aXJlICcuLi9ub3RpZmllcidcbk91dHB1dFZpZXdNYW5hZ2VyID0gcmVxdWlyZSAnLi4vb3V0cHV0LXZpZXctbWFuYWdlcidcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbywge2ZpbGV9PXt9KSAtPlxuICBmaWxlID89IHJlcG8ucmVsYXRpdml6ZShhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk/LmdldFBhdGgoKSlcbiAgaXNGb2xkZXIgPSBmcy5pc0RpcmVjdG9yeVN5bmMgZmlsZVxuXG4gIGlmIG5vdCBmaWxlXG4gICAgcmV0dXJuIG5vdGlmaWVyLmFkZEluZm8gXCJObyBvcGVuIGZpbGUuIFNlbGVjdCAnRGlmZiBBbGwnLlwiXG5cbiAgIyBXZSBwYXJzZSB0aGUgb3V0cHV0IG9mIGdpdCBkaWZmLWluZGV4IHRvIGhhbmRsZSB0aGUgY2FzZSBvZiBhIHN0YWdlZCBmaWxlXG4gICMgd2hlbiBnaXQtcGx1cy5kaWZmcy5pbmNsdWRlU3RhZ2VkRGlmZiBpcyBzZXQgdG8gZmFsc2UuXG4gIHVubGVzcyB0b29sID0gZ2l0LmdldENvbmZpZyhyZXBvLCAnZGlmZi50b29sJylcbiAgICBub3RpZmllci5hZGRJbmZvIFwiWW91IGRvbid0IGhhdmUgYSBkaWZmdG9vbCBjb25maWd1cmVkLlwiXG4gIGVsc2VcbiAgICBnaXQuY21kKFsnZGlmZi1pbmRleCcsICdIRUFEJywgJy16J10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+XG4gICAgICBkaWZmSW5kZXggPSBkYXRhLnNwbGl0KCdcXDAnKVxuICAgICAgaW5jbHVkZVN0YWdlZERpZmYgPSBhdG9tLmNvbmZpZy5nZXQgJ2dpdC1wbHVzLmRpZmZzLmluY2x1ZGVTdGFnZWREaWZmJ1xuXG4gICAgICBpZiBpc0ZvbGRlclxuICAgICAgICBhcmdzID0gWydkaWZmdG9vbCcsICctZCcsICctLW5vLXByb21wdCddXG4gICAgICAgIGFyZ3MucHVzaCAnSEVBRCcgaWYgaW5jbHVkZVN0YWdlZERpZmZcbiAgICAgICAgYXJncy5wdXNoIGZpbGVcbiAgICAgICAgZ2l0LmNtZChhcmdzLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgICAgICAuY2F0Y2ggKG1zZykgLT4gT3V0cHV0Vmlld01hbmFnZXIuY3JlYXRlKCkuc2V0Q29udGVudChtc2cpLmZpbmlzaCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBkaWZmc0ZvckN1cnJlbnRGaWxlID0gZGlmZkluZGV4Lm1hcCAobGluZSwgaSkgLT5cbiAgICAgICAgaWYgaSAlIDIgaXMgMFxuICAgICAgICAgIHN0YWdlZCA9IG5vdCAvXjB7NDB9JC8udGVzdChkaWZmSW5kZXhbaV0uc3BsaXQoJyAnKVszXSk7XG4gICAgICAgICAgcGF0aCA9IGRpZmZJbmRleFtpKzFdXG4gICAgICAgICAgdHJ1ZSBpZiBwYXRoIGlzIGZpbGUgYW5kICghc3RhZ2VkIG9yIGluY2x1ZGVTdGFnZWREaWZmKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdW5kZWZpbmVkXG5cbiAgICAgIGlmIGRpZmZzRm9yQ3VycmVudEZpbGUuZmlsdGVyKChkaWZmKSAtPiBkaWZmPylbMF0/XG4gICAgICAgIGFyZ3MgPSBbJ2RpZmZ0b29sJywgJy0tbm8tcHJvbXB0J11cbiAgICAgICAgYXJncy5wdXNoICdIRUFEJyBpZiBpbmNsdWRlU3RhZ2VkRGlmZlxuICAgICAgICBhcmdzLnB1c2ggZmlsZVxuICAgICAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgICAgIC5jYXRjaCAobXNnKSAtPiBPdXRwdXRWaWV3TWFuYWdlci5jcmVhdGUoKS5zZXRDb250ZW50KG1zZykuZmluaXNoKClcbiAgICAgIGVsc2VcbiAgICAgICAgbm90aWZpZXIuYWRkSW5mbyAnTm90aGluZyB0byBzaG93LidcbiJdfQ==
