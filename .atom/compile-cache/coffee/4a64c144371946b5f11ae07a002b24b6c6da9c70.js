(function() {
  var $, BufferedProcess, CompositeDisposable, GitRevisionView, SplitDiff, _, fs, path, ref;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  ref = require("atom"), CompositeDisposable = ref.CompositeDisposable, BufferedProcess = ref.BufferedProcess;

  $ = require("atom-space-pen-views").$;

  SplitDiff = require('split-diff');

  module.exports = GitRevisionView = (function() {
    function GitRevisionView() {}

    GitRevisionView.FILE_PREFIX = "TimeMachine - ";


    /*
      This code and technique was originally from git-history package,
      see https://github.com/jakesankey/git-history/blob/master/lib/git-history-view.coffee
    
      Changes to permit click and drag in the time plot to travel in time:
      - don't write revision to disk for faster access and to give the user feedback when git'ing
        a rev to show is slow
      - reuse tabs more - don't open a new tab for every rev of the same file
    
      Changes to permit scrolling to same lines in view in the editor the history is for
    
      thank you, @jakesankey!
     */

    GitRevisionView.showRevision = function(editor, revHash, options) {
      var exit, file, fileContents, stdout;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        diff: false
      });
      SplitDiff.disable(false);
      file = editor.getPath();
      fileContents = "";
      stdout = (function(_this) {
        return function(output) {
          return fileContents += output;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this._showRevision(file, editor, revHash, fileContents, options);
          } else {
            return atom.notifications.addError("Could not retrieve revision for " + (path.basename(file)) + " (" + code + ")");
          }
        };
      })(this);
      return this._loadRevision(file, revHash, stdout, exit);
    };

    GitRevisionView._loadRevision = function(file, hash, stdout, exit) {
      var showArgs;
      showArgs = ["show", hash + ":./" + (path.basename(file))];
      return new BufferedProcess({
        command: "git",
        args: showArgs,
        options: {
          cwd: path.dirname(file)
        },
        stdout: stdout,
        exit: exit
      });
    };

    GitRevisionView._getInitialLineNumber = function(editor) {
      var editorEle, lineNumber;
      editorEle = atom.views.getView(editor);
      lineNumber = 0;
      if ((editor != null) && editor !== '') {
        lineNumber = editorEle.getLastVisibleScreenRow();
        return lineNumber - 5;
      }
    };

    GitRevisionView._showRevision = function(file, editor, revHash, fileContents, options) {
      var outputDir, outputFilePath, ref1, tempContent;
      if (options == null) {
        options = {};
      }
      outputDir = (atom.getConfigDirPath()) + "/git-time-machine";
      if (!fs.existsSync(outputDir)) {
        fs.mkdir(outputDir);
      }
      outputFilePath = outputDir + "/" + this.FILE_PREFIX + (path.basename(file));
      if (options.diff) {
        outputFilePath += ".diff";
      }
      tempContent = "Loading..." + ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0);
      return fs.writeFile(outputFilePath, tempContent, (function(_this) {
        return function(error) {
          var promise;
          if (!error) {
            promise = atom.workspace.open(file, {
              split: "left",
              activatePane: false,
              activateItem: true,
              searchAllPanes: false
            });
            return promise.then(function(editor) {
              promise = atom.workspace.open(outputFilePath, {
                split: "right",
                activatePane: false,
                activateItem: true,
                searchAllPanes: false
              });
              return promise.then(function(newTextEditor) {
                return _this._updateNewTextEditor(newTextEditor, editor, revHash, fileContents);
              });
            });
          }
        };
      })(this));
    };

    GitRevisionView._updateNewTextEditor = function(newTextEditor, editor, revHash, fileContents) {
      return _.delay((function(_this) {
        return function() {
          var lineEnding, ref1;
          lineEnding = ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0) || "\n";
          fileContents = fileContents.replace(/(\r\n|\n)/g, lineEnding);
          newTextEditor.buffer.setPreferredLineEnding(lineEnding);
          newTextEditor.setText(fileContents);
          newTextEditor.buffer.cachedDiskContents = fileContents;
          _this._splitDiff(editor, newTextEditor);
          _this._syncScroll(editor, newTextEditor);
          return _this._affixTabTitle(newTextEditor, revHash);
        };
      })(this), 300);
    };

    GitRevisionView._affixTabTitle = function(newTextEditor, revHash) {
      var $el, $tabTitle, titleText;
      $el = $(atom.views.getView(newTextEditor));
      $tabTitle = $el.parents('atom-pane').find('li.tab.active .title');
      titleText = $tabTitle.text();
      if (titleText.indexOf('@') >= 0) {
        titleText = titleText.replace(/\@.*/, "@" + revHash);
      } else {
        titleText += " @" + revHash;
      }
      return $tabTitle.text(titleText);
    };

    GitRevisionView._splitDiff = function(editor, newTextEditor) {
      var editors;
      editors = {
        editor1: newTextEditor,
        editor2: editor
      };
      if (!SplitDiff._getConfig('rightEditorColor')) {
        SplitDiff._setConfig('rightEditorColor', 'green');
      }
      if (!SplitDiff._getConfig('leftEditorColor')) {
        SplitDiff._setConfig('leftEditorColor', 'red');
      }
      if (!SplitDiff._getConfig('diffWords')) {
        SplitDiff._setConfig('diffWords', true);
      }
      if (!SplitDiff._getConfig('ignoreWhitespace')) {
        SplitDiff._setConfig('ignoreWhitespace', true);
      }
      if (!SplitDiff._getConfig('scrollSyncType')) {
        SplitDiff._setConfig('scrollSyncType', 'Vertical + Horizontal');
      }
      SplitDiff.editorSubscriptions = new CompositeDisposable();
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.diffPanes();
      return SplitDiff.updateDiff(editors);
    };

    GitRevisionView._syncScroll = function(editor, newTextEditor) {
      return _.delay((function(_this) {
        return function() {
          if (newTextEditor.isDestroyed()) {
            return;
          }
          return newTextEditor.scrollToBufferPosition({
            row: _this._getInitialLineNumber(editor),
            column: 0
          });
        };
      })(this), 50);
    };

    return GitRevisionView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9saWIvZ2l0LXJldmlzaW9uLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBeUMsT0FBQSxDQUFRLE1BQVIsQ0FBekMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFDckIsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBRU4sU0FBQSxHQUFZLE9BQUEsQ0FBUSxZQUFSOztFQUdaLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUVKLGVBQUMsQ0FBQSxXQUFELEdBQWU7OztBQUNmOzs7Ozs7Ozs7Ozs7OztJQWNBLGVBQUMsQ0FBQSxZQUFELEdBQWUsU0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixPQUFsQjtBQUNiLFVBQUE7O1FBRCtCLFVBQVE7O01BQ3ZDLE9BQUEsR0FBVSxDQUFDLENBQUMsUUFBRixDQUFXLE9BQVgsRUFDUjtRQUFBLElBQUEsRUFBTSxLQUFOO09BRFE7TUFHVixTQUFTLENBQUMsT0FBVixDQUFrQixLQUFsQjtNQUVBLElBQUEsR0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBO01BRVAsWUFBQSxHQUFlO01BQ2YsTUFBQSxHQUFTLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUNMLFlBQUEsSUFBZ0I7UUFEWDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7TUFFVCxJQUFBLEdBQU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLElBQUQ7VUFDTCxJQUFHLElBQUEsS0FBUSxDQUFYO21CQUNFLEtBQUMsQ0FBQSxhQUFELENBQWUsSUFBZixFQUFxQixNQUFyQixFQUE2QixPQUE3QixFQUFzQyxZQUF0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QWEsQ0FBQyxzQkFBZCxDQUFxQztZQUFDLEdBQUEsRUFBSyxLQUFDLENBQUEscUJBQUQsQ0FBdUIsTUFBdkIsQ0FBTjtZQUFzQyxNQUFBLEVBQVEsQ0FBOUM7V0FBckM7UUFGTTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUixFQUdFLEVBSEY7SUFIWTs7Ozs7QUFsS2hCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcydcblxue0NvbXBvc2l0ZURpc3Bvc2FibGUsIEJ1ZmZlcmVkUHJvY2Vzc30gPSByZXF1aXJlIFwiYXRvbVwiXG57JH0gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxuXG5TcGxpdERpZmYgPSByZXF1aXJlICdzcGxpdC1kaWZmJ1xuXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdpdFJldmlzaW9uVmlld1xuXG4gIEBGSUxFX1BSRUZJWCA9IFwiVGltZU1hY2hpbmUgLSBcIlxuICAjIyNcbiAgICBUaGlzIGNvZGUgYW5kIHRlY2huaXF1ZSB3YXMgb3JpZ2luYWxseSBmcm9tIGdpdC1oaXN0b3J5IHBhY2thZ2UsXG4gICAgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYWtlc2Fua2V5L2dpdC1oaXN0b3J5L2Jsb2IvbWFzdGVyL2xpYi9naXQtaGlzdG9yeS12aWV3LmNvZmZlZVxuXG4gICAgQ2hhbmdlcyB0byBwZXJtaXQgY2xpY2sgYW5kIGRyYWcgaW4gdGhlIHRpbWUgcGxvdCB0byB0cmF2ZWwgaW4gdGltZTpcbiAgICAtIGRvbid0IHdyaXRlIHJldmlzaW9uIHRvIGRpc2sgZm9yIGZhc3RlciBhY2Nlc3MgYW5kIHRvIGdpdmUgdGhlIHVzZXIgZmVlZGJhY2sgd2hlbiBnaXQnaW5nXG4gICAgICBhIHJldiB0byBzaG93IGlzIHNsb3dcbiAgICAtIHJldXNlIHRhYnMgbW9yZSAtIGRvbid0IG9wZW4gYSBuZXcgdGFiIGZvciBldmVyeSByZXYgb2YgdGhlIHNhbWUgZmlsZVxuXG4gICAgQ2hhbmdlcyB0byBwZXJtaXQgc2Nyb2xsaW5nIHRvIHNhbWUgbGluZXMgaW4gdmlldyBpbiB0aGUgZWRpdG9yIHRoZSBoaXN0b3J5IGlzIGZvclxuXG4gICAgdGhhbmsgeW91LCBAamFrZXNhbmtleSFcblxuICAjIyNcbiAgQHNob3dSZXZpc2lvbjogKGVkaXRvciwgcmV2SGFzaCwgb3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuICAgICAgZGlmZjogZmFsc2VcblxuICAgIFNwbGl0RGlmZi5kaXNhYmxlKGZhbHNlKVxuXG4gICAgZmlsZSA9IGVkaXRvci5nZXRQYXRoKClcblxuICAgIGZpbGVDb250ZW50cyA9IFwiXCJcbiAgICBzdGRvdXQgPSAob3V0cHV0KSA9PlxuICAgICAgICBmaWxlQ29udGVudHMgKz0gb3V0cHV0XG4gICAgZXhpdCA9IChjb2RlKSA9PlxuICAgICAgaWYgY29kZSBpcyAwXG4gICAgICAgIEBfc2hvd1JldmlzaW9uKGZpbGUsIGVkaXRvciwgcmV2SGFzaCwgZmlsZUNvbnRlbnRzLCBvcHRpb25zKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJDb3VsZCBub3QgcmV0cmlldmUgcmV2aXNpb24gZm9yICN7cGF0aC5iYXNlbmFtZShmaWxlKX0gKCN7Y29kZX0pXCJcblxuICAgIEBfbG9hZFJldmlzaW9uIGZpbGUsIHJldkhhc2gsIHN0ZG91dCwgZXhpdFxuXG5cbiAgQF9sb2FkUmV2aXNpb246IChmaWxlLCBoYXNoLCBzdGRvdXQsIGV4aXQpIC0+XG4gICAgc2hvd0FyZ3MgPSBbXG4gICAgICBcInNob3dcIixcbiAgICAgIFwiI3toYXNofTouLyN7cGF0aC5iYXNlbmFtZShmaWxlKX1cIlxuICAgIF1cbiAgICAjIGNvbnNvbGUubG9nIFwiY2FsbGluZyBnaXRcIlxuICAgIG5ldyBCdWZmZXJlZFByb2Nlc3Mge1xuICAgICAgY29tbWFuZDogXCJnaXRcIixcbiAgICAgIGFyZ3M6IHNob3dBcmdzLFxuICAgICAgb3B0aW9uczogeyBjd2Q6cGF0aC5kaXJuYW1lKGZpbGUpIH0sXG4gICAgICBzdGRvdXQsXG4gICAgICBleGl0XG4gICAgfVxuXG5cbiAgQF9nZXRJbml0aWFsTGluZU51bWJlcjogKGVkaXRvcikgLT5cbiAgICBlZGl0b3JFbGUgPSBhdG9tLnZpZXdzLmdldFZpZXcgZWRpdG9yXG4gICAgbGluZU51bWJlciA9IDBcbiAgICBpZiBlZGl0b3I/ICYmIGVkaXRvciAhPSAnJ1xuICAgICAgbGluZU51bWJlciA9IGVkaXRvckVsZS5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgICAjIGNvbnNvbGUubG9nIFwiX2dldEluaXRpYWxMaW5lTnVtYmVyXCIsIGxpbmVOdW1iZXJcblxuICAgICAgIyBUT0RPOiB3aHkgLTU/ICB0aGlzIGlzIHdoYXQgaXQgdG9vayB0byBhY3R1YWxseSBzeW5jIHRoZSBsYXN0IGxpbmUgbnVtYmVyXG4gICAgICAjICAgIGJldHdlZW4gdHdvIGVkaXRvcnNcbiAgICAgIHJldHVybiBsaW5lTnVtYmVyIC0gNVxuXG5cbiAgQF9zaG93UmV2aXNpb246IChmaWxlLCBlZGl0b3IsIHJldkhhc2gsIGZpbGVDb250ZW50cywgb3B0aW9ucz17fSkgLT5cbiAgICBvdXRwdXREaXIgPSBcIiN7YXRvbS5nZXRDb25maWdEaXJQYXRoKCl9L2dpdC10aW1lLW1hY2hpbmVcIlxuICAgIGZzLm1rZGlyIG91dHB1dERpciBpZiBub3QgZnMuZXhpc3RzU3luYyBvdXRwdXREaXJcbiAgICBvdXRwdXRGaWxlUGF0aCA9IFwiI3tvdXRwdXREaXJ9LyN7QEZJTEVfUFJFRklYfSN7cGF0aC5iYXNlbmFtZShmaWxlKX1cIlxuICAgIG91dHB1dEZpbGVQYXRoICs9IFwiLmRpZmZcIiBpZiBvcHRpb25zLmRpZmZcbiAgICB0ZW1wQ29udGVudCA9IFwiTG9hZGluZy4uLlwiICsgZWRpdG9yLmJ1ZmZlcj8ubGluZUVuZGluZ0ZvclJvdygwKVxuICAgIGZzLndyaXRlRmlsZSBvdXRwdXRGaWxlUGF0aCwgdGVtcENvbnRlbnQsIChlcnJvcikgPT5cbiAgICAgIGlmIG5vdCBlcnJvclxuICAgICAgICAjIGVkaXRvciAoY3VycmVudCByZXYpIG1heSBoYXZlIGJlZW4gZGVzdHJveWVkLCB3b3Jrc3BhY2Uub3BlbiB3aWxsIGZpbmQgb3JcbiAgICAgICAgIyByZW9wZW4gaXRcbiAgICAgICAgcHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZSxcbiAgICAgICAgICBzcGxpdDogXCJsZWZ0XCJcbiAgICAgICAgICBhY3RpdmF0ZVBhbmU6IGZhbHNlXG4gICAgICAgICAgYWN0aXZhdGVJdGVtOiB0cnVlXG4gICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IGZhbHNlXG4gICAgICAgIHByb21pc2UudGhlbiAoZWRpdG9yKSA9PlxuICAgICAgICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuIG91dHB1dEZpbGVQYXRoLFxuICAgICAgICAgICAgc3BsaXQ6IFwicmlnaHRcIlxuICAgICAgICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZVxuICAgICAgICAgICAgYWN0aXZhdGVJdGVtOiB0cnVlXG4gICAgICAgICAgICBzZWFyY2hBbGxQYW5lczogZmFsc2VcbiAgICAgICAgICBwcm9taXNlLnRoZW4gKG5ld1RleHRFZGl0b3IpID0+XG4gICAgICAgICAgICBAX3VwZGF0ZU5ld1RleHRFZGl0b3IobmV3VGV4dEVkaXRvciwgZWRpdG9yLCByZXZIYXNoLCBmaWxlQ29udGVudHMpXG5cblxuXG5cbiAgQF91cGRhdGVOZXdUZXh0RWRpdG9yOiAobmV3VGV4dEVkaXRvciwgZWRpdG9yLCByZXZIYXNoLCBmaWxlQ29udGVudHMpIC0+XG4gICAgIyBzbGlnaHQgZGVsYXkgc28gdGhlIHVzZXIgZ2V0cyBmZWVkYmFjayBvbiB0aGVpciBhY3Rpb25cbiAgICBfLmRlbGF5ID0+XG4gICAgICBsaW5lRW5kaW5nID0gZWRpdG9yLmJ1ZmZlcj8ubGluZUVuZGluZ0ZvclJvdygwKSB8fCBcIlxcblwiXG4gICAgICBmaWxlQ29udGVudHMgPSBmaWxlQ29udGVudHMucmVwbGFjZSgvKFxcclxcbnxcXG4pL2csIGxpbmVFbmRpbmcpXG4gICAgICBuZXdUZXh0RWRpdG9yLmJ1ZmZlci5zZXRQcmVmZXJyZWRMaW5lRW5kaW5nKGxpbmVFbmRpbmcpXG4gICAgICBuZXdUZXh0RWRpdG9yLnNldFRleHQoZmlsZUNvbnRlbnRzKVxuXG4gICAgICAjIEhBQ0sgQUxFUlQ6IHRoaXMgaXMgcHJvbmUgdG8gZXZlbnR1YWxseSBmYWlsLiBEb24ndCBzaG93IHVzZXIgY2hhbmdlXG4gICAgICAjICBcIndvdWxkIHlvdSBsaWtlIHRvIHNhdmVcIiBtZXNzYWdlIGJldHdlZW4gY2hhbmdlcyB0byByZXYgYmVpbmcgdmlld2VkXG4gICAgICBuZXdUZXh0RWRpdG9yLmJ1ZmZlci5jYWNoZWREaXNrQ29udGVudHMgPSBmaWxlQ29udGVudHNcblxuICAgICAgQF9zcGxpdERpZmYoZWRpdG9yLCBuZXdUZXh0RWRpdG9yKVxuICAgICAgQF9zeW5jU2Nyb2xsKGVkaXRvciwgbmV3VGV4dEVkaXRvcilcbiAgICAgIEBfYWZmaXhUYWJUaXRsZSBuZXdUZXh0RWRpdG9yLCByZXZIYXNoXG4gICAgLCAzMDBcblxuXG4gIEBfYWZmaXhUYWJUaXRsZTogKG5ld1RleHRFZGl0b3IsIHJldkhhc2gpIC0+XG4gICAgIyBzcGVha2luZyBvZiBoYWNrcyB0aGlzIGlzIGFsc28gaGFja2lzaCwgdGhlcmUgaGFzIHRvIGJlIGEgYmV0dGVyIHdheSB0byBjaGFuZ2UgdG9cbiAgICAjIHRhYiB0aXRsZSBhbmQgdW5saW5raW5nIGl0IGZyb20gdGhlIGZpbGUgbmFtZVxuICAgICRlbCA9ICQoYXRvbS52aWV3cy5nZXRWaWV3KG5ld1RleHRFZGl0b3IpKVxuICAgICR0YWJUaXRsZSA9ICRlbC5wYXJlbnRzKCdhdG9tLXBhbmUnKS5maW5kKCdsaS50YWIuYWN0aXZlIC50aXRsZScpXG4gICAgdGl0bGVUZXh0ID0gJHRhYlRpdGxlLnRleHQoKVxuICAgIGlmIHRpdGxlVGV4dC5pbmRleE9mKCdAJykgPj0gMFxuICAgICAgdGl0bGVUZXh0ID0gdGl0bGVUZXh0LnJlcGxhY2UoL1xcQC4qLywgXCJAI3tyZXZIYXNofVwiKVxuICAgIGVsc2VcbiAgICAgIHRpdGxlVGV4dCArPSBcIiBAI3tyZXZIYXNofVwiXG5cbiAgICAkdGFiVGl0bGUudGV4dCh0aXRsZVRleHQpXG5cblxuICBAX3NwbGl0RGlmZjogKGVkaXRvciwgbmV3VGV4dEVkaXRvcikgLT5cbiAgICBlZGl0b3JzID1cbiAgICAgIGVkaXRvcjE6IG5ld1RleHRFZGl0b3IgICAgIyB0aGUgb2xkZXIgcmV2aXNpb25cbiAgICAgIGVkaXRvcjI6IGVkaXRvciAgICAgICAgICAgIyBjdXJyZW50IHJldlxuXG4gICAgaWYgbm90IFNwbGl0RGlmZi5fZ2V0Q29uZmlnICdyaWdodEVkaXRvckNvbG9yJyB0aGVuIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdyaWdodEVkaXRvckNvbG9yJywgJ2dyZWVuJ1xuICAgIGlmIG5vdCBTcGxpdERpZmYuX2dldENvbmZpZyAnbGVmdEVkaXRvckNvbG9yJyB0aGVuIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdsZWZ0RWRpdG9yQ29sb3InLCAncmVkJ1xuICAgIGlmIG5vdCBTcGxpdERpZmYuX2dldENvbmZpZyAnZGlmZldvcmRzJyB0aGVuIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdkaWZmV29yZHMnLCB0cnVlXG4gICAgaWYgbm90IFNwbGl0RGlmZi5fZ2V0Q29uZmlnICdpZ25vcmVXaGl0ZXNwYWNlJyB0aGVuIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdpZ25vcmVXaGl0ZXNwYWNlJywgdHJ1ZVxuICAgIGlmIG5vdCBTcGxpdERpZmYuX2dldENvbmZpZyAnc2Nyb2xsU3luY1R5cGUnIHRoZW4gU3BsaXREaWZmLl9zZXRDb25maWcgJ3Njcm9sbFN5bmNUeXBlJywgJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICBcbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBTcGxpdERpZmYudXBkYXRlRGlmZihlZGl0b3JzKSBpZiBlZGl0b3JzP1xuICAgIFNwbGl0RGlmZi5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgIFNwbGl0RGlmZi51cGRhdGVEaWZmKGVkaXRvcnMpIGlmIGVkaXRvcnM/XG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIGVkaXRvcnMgPSBudWxsO1xuICAgICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMi5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIGVkaXRvcnMgPSBudWxsO1xuICAgICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG5cbiAgICBTcGxpdERpZmYuZGlmZlBhbmVzKClcbiAgICBTcGxpdERpZmYudXBkYXRlRGlmZiBlZGl0b3JzXG5cblxuICAjIHN5bmMgc2Nyb2xsIHRvIGVkaXRvciB0aGF0IHdlIGFyZSBzaG93IHJldmlzaW9uIGZvclxuICBAX3N5bmNTY3JvbGw6IChlZGl0b3IsIG5ld1RleHRFZGl0b3IpIC0+XG4gICAgIyB3aXRob3V0IHRoZSBkZWxheSwgdGhlIHNjcm9sbCBwb3NpdGlvbiB3aWxsIGZsdWN0dWF0ZSBzbGlnaHRseSBiZXdlZW5cbiAgICAjIGNhbGxzIHRvIGVkaXRvciBzZXRUZXh0XG4gICAgXy5kZWxheSA9PlxuICAgICAgcmV0dXJuIGlmIG5ld1RleHRFZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgICAgbmV3VGV4dEVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHtyb3c6IEBfZ2V0SW5pdGlhbExpbmVOdW1iZXIoZWRpdG9yKSwgY29sdW1uOiAwfSlcbiAgICAsIDUwXG4iXX0=
