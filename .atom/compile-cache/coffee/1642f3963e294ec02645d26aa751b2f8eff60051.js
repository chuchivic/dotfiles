(function() {
  var $, BufferedProcess, CompositeDisposable, SplitDiff, SyncScroll, _, disposables, fs, git, notifier, path, ref, showRevision, splitDiff, updateNewTextEditor;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  git = require('../git');

  notifier = require('../notifier');

  ref = require("atom"), CompositeDisposable = ref.CompositeDisposable, BufferedProcess = ref.BufferedProcess;

  $ = require("atom-space-pen-views").$;

  disposables = new CompositeDisposable;

  SplitDiff = null;

  SyncScroll = null;

  splitDiff = function(editor, newTextEditor) {
    var editors, syncScroll;
    editors = {
      editor1: newTextEditor,
      editor2: editor
    };
    SplitDiff._setConfig('diffWords', true);
    SplitDiff._setConfig('ignoreWhitespace', true);
    SplitDiff._setConfig('syncHorizontalScroll', true);
    SplitDiff.diffPanes();
    SplitDiff.updateDiff(editors);
    syncScroll = new SyncScroll(editors.editor1, editors.editor2, true);
    return syncScroll.syncPositions();
  };

  updateNewTextEditor = function(newTextEditor, editor, gitRevision, fileContents) {
    return _.delay(function() {
      var lineEnding, ref1;
      lineEnding = ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0) || "\n";
      fileContents = fileContents.replace(/(\r\n|\n)/g, lineEnding);
      newTextEditor.buffer.setPreferredLineEnding(lineEnding);
      newTextEditor.setText(fileContents);
      newTextEditor.buffer.cachedDiskContents = fileContents;
      return splitDiff(editor, newTextEditor);
    }, 300);
  };

  showRevision = function(repo, filePath, editor, gitRevision, fileContents, options) {
    var outputFilePath, ref1, tempContent;
    if (options == null) {
      options = {};
    }
    gitRevision = path.basename(gitRevision);
    outputFilePath = (repo.getPath()) + "/{" + gitRevision + "} " + (path.basename(filePath));
    if (options.diff) {
      outputFilePath += ".diff";
    }
    tempContent = "Loading..." + ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0);
    return fs.writeFile(outputFilePath, tempContent, (function(_this) {
      return function(error) {
        if (!error) {
          return atom.workspace.open(filePath, {
            split: "left"
          }).then(function(editor) {
            return atom.workspace.open(outputFilePath, {
              split: "right"
            }).then(function(newTextEditor) {
              updateNewTextEditor(newTextEditor, editor, gitRevision, fileContents);
              try {
                return disposables.add(newTextEditor.onDidDestroy(function() {
                  return fs.unlink(outputFilePath);
                }));
              } catch (error1) {
                error = error1;
                return atom.notifications.addError("Could not remove file " + outputFilePath);
              }
            });
          });
        }
      };
    })(this));
  };

  module.exports = {
    showRevision: function(repo, editor, gitRevision) {
      var args, error, fileName, filePath, options;
      if (!SplitDiff) {
        try {
          SplitDiff = require(atom.packages.resolvePackagePath('split-diff'));
          SyncScroll = require(atom.packages.resolvePackagePath('split-diff') + '/lib/sync-scroll');
          atom.themes.requireStylesheet(atom.packages.resolvePackagePath('split-diff') + '/styles/split-diff');
        } catch (error1) {
          error = error1;
          return notifier.addInfo("Could not load 'split-diff' package to open diff view. Please install it `apm install split-diff`.");
        }
      }
      options = {
        diff: false
      };
      SplitDiff.disable(false);
      filePath = editor.getPath();
      fileName = path.basename(filePath);
      args = ["show", gitRevision + ":./" + fileName];
      return git.cmd(args, {
        cwd: path.dirname(filePath)
      }).then(function(data) {
        return showRevision(repo, filePath, editor, gitRevision, data, options);
      })["catch"](function(code) {
        return atom.notifications.addError("Git Plus: Could not retrieve revision for " + fileName + " (" + code + ")");
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2dpdC1yZXZpc2lvbi12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBRVgsTUFBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDckIsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBRU4sV0FBQSxHQUFjLElBQUk7O0VBQ2xCLFNBQUEsR0FBWTs7RUFDWixVQUFBLEdBQWE7O0VBRWIsU0FBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLGFBQVQ7QUFDVixRQUFBO0lBQUEsT0FBQSxHQUNFO01BQUEsT0FBQSxFQUFTLGFBQVQ7TUFDQSxPQUFBLEVBQVMsTUFEVDs7SUFFRixTQUFTLENBQUMsVUFBVixDQUFxQixXQUFyQixFQUFrQyxJQUFsQztJQUNBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLGtCQUFyQixFQUF5QyxJQUF6QztJQUNBLFNBQVMsQ0FBQyxVQUFWLENBQXFCLHNCQUFyQixFQUE2QyxJQUE3QztJQUNBLFNBQVMsQ0FBQyxTQUFWLENBQUE7SUFDQSxTQUFTLENBQUMsVUFBVixDQUFxQixPQUFyQjtJQUNBLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsT0FBTyxDQUFDLE9BQW5CLEVBQTRCLE9BQU8sQ0FBQyxPQUFwQyxFQUE2QyxJQUE3QztXQUNqQixVQUFVLENBQUMsYUFBWCxDQUFBO0VBVlU7O0VBWVosbUJBQUEsR0FBc0IsU0FBQyxhQUFELEVBQWdCLE1BQWhCLEVBQXdC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TUFFVixTQUFTLENBQUMsT0FBVixDQUFrQixLQUFsQjtNQUVBLFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBO01BQ1gsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsUUFBZDtNQUVYLElBQUEsR0FBTyxDQUFDLE1BQUQsRUFBWSxXQUFELEdBQWEsS0FBYixHQUFrQixRQUE3QjthQUNQLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBUixFQUFjO1FBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFMO09BQWQsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7ZUFDSixZQUFBLENBQWEsSUFBYixFQUFtQixRQUFuQixFQUE2QixNQUE3QixFQUFxQyxXQUFyQyxFQUFrRCxJQUFsRCxFQUF3RCxPQUF4RDtNQURJLENBRE4sQ0FHQSxFQUFDLEtBQUQsRUFIQSxDQUdPLFNBQUMsSUFBRDtlQUNMLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsNENBQUEsR0FBNkMsUUFBN0MsR0FBc0QsSUFBdEQsR0FBMEQsSUFBMUQsR0FBK0QsR0FBM0Y7TUFESyxDQUhQO0lBakJZLENBQWQ7O0FBdkRGIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcbmdpdCA9IHJlcXVpcmUgJy4uL2dpdCdcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5cbntDb21wb3NpdGVEaXNwb3NhYmxlLCBCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSBcImF0b21cIlxueyR9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcblxuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuU3BsaXREaWZmID0gbnVsbFxuU3luY1Njcm9sbCA9IG51bGxcblxuc3BsaXREaWZmID0gKGVkaXRvciwgbmV3VGV4dEVkaXRvcikgLT5cbiAgZWRpdG9ycyA9XG4gICAgZWRpdG9yMTogbmV3VGV4dEVkaXRvciAgICAjIHRoZSBvbGRlciByZXZpc2lvblxuICAgIGVkaXRvcjI6IGVkaXRvciAgICAgICAgICAgIyBjdXJyZW50IHJldlxuICBTcGxpdERpZmYuX3NldENvbmZpZyAnZGlmZldvcmRzJywgdHJ1ZVxuICBTcGxpdERpZmYuX3NldENvbmZpZyAnaWdub3JlV2hpdGVzcGFjZScsIHRydWVcbiAgU3BsaXREaWZmLl9zZXRDb25maWcgJ3N5bmNIb3Jpem9udGFsU2Nyb2xsJywgdHJ1ZVxuICBTcGxpdERpZmYuZGlmZlBhbmVzKClcbiAgU3BsaXREaWZmLnVwZGF0ZURpZmYoZWRpdG9ycylcbiAgc3luY1Njcm9sbCA9IG5ldyBTeW5jU2Nyb2xsKGVkaXRvcnMuZWRpdG9yMSwgZWRpdG9ycy5lZGl0b3IyLCB0cnVlKVxuICBzeW5jU2Nyb2xsLnN5bmNQb3NpdGlvbnMoKVxuXG51cGRhdGVOZXdUZXh0RWRpdG9yID0gKG5ld1RleHRFZGl0b3IsIGVkaXRvciwgZ2l0UmV2aXNpb24sIGZpbGVDb250ZW50cykgLT5cbiAgXy5kZWxheSAtPlxuICAgIGxpbmVFbmRpbmcgPSBlZGl0b3IuYnVmZmVyPy5saW5lRW5kaW5nRm9yUm93KDApIHx8IFwiXFxuXCJcbiAgICBmaWxlQ29udGVudHMgPSBmaWxlQ29udGVudHMucmVwbGFjZSgvKFxcclxcbnxcXG4pL2csIGxpbmVFbmRpbmcpXG4gICAgbmV3VGV4dEVkaXRvci5idWZmZXIuc2V0UHJlZmVycmVkTGluZUVuZGluZyhsaW5lRW5kaW5nKVxuICAgIG5ld1RleHRFZGl0b3Iuc2V0VGV4dChmaWxlQ29udGVudHMpXG4gICAgbmV3VGV4dEVkaXRvci5idWZmZXIuY2FjaGVkRGlza0NvbnRlbnRzID0gZmlsZUNvbnRlbnRzXG4gICAgc3BsaXREaWZmKGVkaXRvciwgbmV3VGV4dEVkaXRvcilcbiAgLCAzMDBcblxuc2hvd1JldmlzaW9uID0gKHJlcG8sIGZpbGVQYXRoLCBlZGl0b3IsIGdpdFJldmlzaW9uLCBmaWxlQ29udGVudHMsIG9wdGlvbnM9e30pIC0+XG4gIGdpdFJldmlzaW9uID0gcGF0aC5iYXNlbmFtZShnaXRSZXZpc2lvbilcbiAgb3V0cHV0RmlsZVBhdGggPSBcIiN7cmVwby5nZXRQYXRoKCl9L3sje2dpdFJldmlzaW9ufX0gI3twYXRoLmJhc2VuYW1lKGZpbGVQYXRoKX1cIlxuICBvdXRwdXRGaWxlUGF0aCArPSBcIi5kaWZmXCIgaWYgb3B0aW9ucy5kaWZmXG4gIHRlbXBDb250ZW50ID0gXCJMb2FkaW5nLi4uXCIgKyBlZGl0b3IuYnVmZmVyPy5saW5lRW5kaW5nRm9yUm93KDApXG4gIGZzLndyaXRlRmlsZSBvdXRwdXRGaWxlUGF0aCwgdGVtcENvbnRlbnQsIChlcnJvcikgPT5cbiAgICBpZiBub3QgZXJyb3JcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGgsXG4gICAgICAgIHNwbGl0OiBcImxlZnRcIlxuICAgICAgLnRoZW4gKGVkaXRvcikgPT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBvdXRwdXRGaWxlUGF0aCxcbiAgICAgICAgICBzcGxpdDogXCJyaWdodFwiXG4gICAgICAgIC50aGVuIChuZXdUZXh0RWRpdG9yKSA9PlxuICAgICAgICAgIHVwZGF0ZU5ld1RleHRFZGl0b3IobmV3VGV4dEVkaXRvciwgZWRpdG9yLCBnaXRSZXZpc2lvbiwgZmlsZUNvbnRlbnRzKVxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgZGlzcG9zYWJsZXMuYWRkIG5ld1RleHRFZGl0b3Iub25EaWREZXN0cm95IC0+IGZzLnVubGluayBvdXRwdXRGaWxlUGF0aFxuICAgICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiQ291bGQgbm90IHJlbW92ZSBmaWxlICN7b3V0cHV0RmlsZVBhdGh9XCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzaG93UmV2aXNpb246IChyZXBvLCBlZGl0b3IsIGdpdFJldmlzaW9uKSAtPlxuICAgIGlmIG5vdCBTcGxpdERpZmZcbiAgICAgIHRyeVxuICAgICAgICBTcGxpdERpZmYgPSByZXF1aXJlIGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKCdzcGxpdC1kaWZmJylcbiAgICAgICAgU3luY1Njcm9sbCA9IHJlcXVpcmUgYXRvbS5wYWNrYWdlcy5yZXNvbHZlUGFja2FnZVBhdGgoJ3NwbGl0LWRpZmYnKSArICcvbGliL3N5bmMtc2Nyb2xsJ1xuICAgICAgICBhdG9tLnRoZW1lcy5yZXF1aXJlU3R5bGVzaGVldChhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aCgnc3BsaXQtZGlmZicpICsgJy9zdHlsZXMvc3BsaXQtZGlmZicpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm4gbm90aWZpZXIuYWRkSW5mbyhcIkNvdWxkIG5vdCBsb2FkICdzcGxpdC1kaWZmJyBwYWNrYWdlIHRvIG9wZW4gZGlmZiB2aWV3LiBQbGVhc2UgaW5zdGFsbCBpdCBgYXBtIGluc3RhbGwgc3BsaXQtZGlmZmAuXCIpXG5cbiAgICBvcHRpb25zID0ge2RpZmY6IGZhbHNlfVxuXG4gICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG5cbiAgICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICBmaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpXG5cbiAgICBhcmdzID0gW1wic2hvd1wiLCBcIiN7Z2l0UmV2aXNpb259Oi4vI3tmaWxlTmFtZX1cIl1cbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogcGF0aC5kaXJuYW1lKGZpbGVQYXRoKSlcbiAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgIHNob3dSZXZpc2lvbihyZXBvLCBmaWxlUGF0aCwgZWRpdG9yLCBnaXRSZXZpc2lvbiwgZGF0YSwgb3B0aW9ucylcbiAgICAuY2F0Y2ggKGNvZGUpIC0+XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJHaXQgUGx1czogQ291bGQgbm90IHJldHJpZXZlIHJldmlzaW9uIGZvciAje2ZpbGVOYW1lfSAoI3tjb2RlfSlcIilcbiJdfQ==
