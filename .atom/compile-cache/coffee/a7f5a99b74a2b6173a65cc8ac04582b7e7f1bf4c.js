(function() {
  var CompositeDisposable, DiffView, Directory, File, FooterView, LoadingView, SplitDiff, SyncScroll, configSchema, path, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory, File = ref.File;

  DiffView = require('./diff-view');

  LoadingView = require('./ui/loading-view');

  FooterView = require('./ui/footer-view');

  SyncScroll = require('./sync-scroll');

  configSchema = require('./config-schema');

  path = require('path');

  module.exports = SplitDiff = {
    diffView: null,
    config: configSchema,
    subscriptions: null,
    editorSubscriptions: null,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    hasGitRepo: false,
    process: null,
    activate: function(state) {
      window.splitDiffResolves = [];
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace, .tree-view .selected, .tab.texteditor', {
        'split-diff:enable': (function(_this) {
          return function(e) {
            _this.diffPanes(e);
            return e.stopPropagation();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.nextDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.prevDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:copy-to-right': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToRight();
            }
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToLeft();
            }
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:ignore-whitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this),
        'split-diff:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.disable();
      return this.subscriptions.dispose();
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable();
      } else {
        return this.diffPanes();
      }
    },
    disable: function() {
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffView != null) {
        if (this.wasEditor1Created) {
          this.diffView.cleanUpEditor(1);
        }
        if (this.wasEditor2Created) {
          this.diffView.cleanUpEditor(2);
        }
        this.diffView.destroy();
        this.diffView = null;
      }
      if (this.footerView != null) {
        this.footerView.destroy();
        this.footerView = null;
      }
      if (this.loadingView != null) {
        this.loadingView.destroy();
        this.loadingView = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      this.wasEditor1Created = false;
      this.wasEditor2Created = false;
      this.hasGitRepo = false;
      if (this._getConfig('hideTreeView')) {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:show');
      }
    },
    toggleIgnoreWhitespace: function() {
      var isWhitespaceIgnored, ref1;
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      this._setConfig('ignoreWhitespace', !isWhitespaceIgnored);
      return (ref1 = this.footerView) != null ? ref1.setIgnoreWhitespace(!isWhitespaceIgnored) : void 0;
    },
    nextDiff: function() {
      var ref1, selectedIndex;
      if (this.diffView != null) {
        selectedIndex = this.diffView.nextDiff();
        return (ref1 = this.footerView) != null ? ref1.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    prevDiff: function() {
      var ref1, selectedIndex;
      if (this.diffView != null) {
        selectedIndex = this.diffView.prevDiff();
        return (ref1 = this.footerView) != null ? ref1.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    copyToRight: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToRight();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    copyToLeft: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToLeft();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    diffPanes: function(event) {
      var editorsPromise, filePath;
      this.disable();
      this.editorSubscriptions = new CompositeDisposable();
      if (event != null ? event.currentTarget.classList.contains('tab') : void 0) {
        filePath = event.currentTarget.path;
        editorsPromise = this._getEditorsForDiffWithActive(filePath);
      } else if ((event != null ? event.currentTarget.classList.contains('list-item') : void 0) && (event != null ? event.currentTarget.classList.contains('file') : void 0)) {
        filePath = event.currentTarget.getPath();
        editorsPromise = this._getEditorsForDiffWithActive(filePath);
      } else {
        editorsPromise = this._getEditorsForQuickDiff();
      }
      return editorsPromise.then((function(editors) {
        if (editors === null) {
          return;
        }
        this._setupVisibleEditors(editors.editor1, editors.editor2);
        this.diffView = new DiffView(editors);
        this.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)));
        this.editorSubscriptions.add(atom.config.onDidChange('split-diff', (function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            return _this.diffView.handleCursorChange(event.cursor, event.oldBufferPosition, event.newBufferPosition);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidChangeCursorPosition((function(_this) {
          return function(event) {
            return _this.diffView.handleCursorChange(event.cursor, event.oldBufferPosition, event.newBufferPosition);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidAddCursor((function(_this) {
          return function(cursor) {
            return _this.diffView.handleCursorChange(cursor, -1, cursor.getBufferPosition());
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidAddCursor((function(_this) {
          return function(cursor) {
            return _this.diffView.handleCursorChange(cursor, -1, cursor.getBufferPosition());
          };
        })(this)));
        if (this.footerView == null) {
          this.footerView = new FooterView(this._getConfig('ignoreWhitespace'));
          this.footerView.createPanel();
        }
        this.footerView.show();
        if (!this.hasGitRepo) {
          this.updateDiff(editors);
        }
        this.editorSubscriptions.add(atom.menu.add([
          {
            'label': 'Packages',
            'submenu': [
              {
                'label': 'Split Diff',
                'submenu': [
                  {
                    'label': 'Ignore Whitespace',
                    'command': 'split-diff:ignore-whitespace'
                  }, {
                    'label': 'Move to Next Diff',
                    'command': 'split-diff:next-diff'
                  }, {
                    'label': 'Move to Previous Diff',
                    'command': 'split-diff:prev-diff'
                  }, {
                    'label': 'Copy to Right',
                    'command': 'split-diff:copy-to-right'
                  }, {
                    'label': 'Copy to Left',
                    'command': 'split-diff:copy-to-left'
                  }
                ]
              }
            ]
          }
        ]));
        return this.editorSubscriptions.add(atom.contextMenu.add({
          'atom-text-editor': [
            {
              'label': 'Split Diff',
              'submenu': [
                {
                  'label': 'Ignore Whitespace',
                  'command': 'split-diff:ignore-whitespace'
                }, {
                  'label': 'Move to Next Diff',
                  'command': 'split-diff:next-diff'
                }, {
                  'label': 'Move to Previous Diff',
                  'command': 'split-diff:prev-diff'
                }, {
                  'label': 'Copy to Right',
                  'command': 'split-diff:copy-to-right'
                }, {
                  'label': 'Copy to Left',
                  'command': 'split-diff:copy-to-left'
                }
              ]
            }
          ]
        }));
      }).bind(this));
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, editorPaths, exit, isWhitespaceIgnored, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this._getConfig('hideTreeView') && document.querySelector('.tree-view')) {
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'tree-view:toggle');
      }
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, isWhitespaceIgnored];
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          var computedDiff, ref1;
          theOutput = output;
          computedDiff = JSON.parse(output);
          _this.process.kill();
          _this.process = null;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          return _this._resumeUpdateDiff(editors, computedDiff);
        };
      })(this);
      stderr = (function(_this) {
        return function(err) {
          return theOutput = err;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          var ref1;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          if (code !== 0) {
            console.log('BufferedNodeProcess code was ' + code);
            return console.log(theOutput);
          }
        };
      })(this);
      return this.process = new BufferedNodeProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    },
    _resumeUpdateDiff: function(editors, computedDiff) {
      var leftHighlightType, ref1, ref2, rightHighlightType, scrollSyncType;
      if (this.diffView == null) {
        return;
      }
      this.diffView.clearDiff();
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      leftHighlightType = 'added';
      rightHighlightType = 'removed';
      if (this._getConfig('leftEditorColor') === 'red') {
        leftHighlightType = 'removed';
      }
      if (this._getConfig('rightEditorColor') === 'green') {
        rightHighlightType = 'added';
      }
      this.diffView.displayDiff(computedDiff, leftHighlightType, rightHighlightType, this._getConfig('diffWords'), this._getConfig('ignoreWhitespace'));
      while ((ref1 = window.splitDiffResolves) != null ? ref1.length : void 0) {
        window.splitDiffResolves.pop()(this.diffView.getMarkerLayers());
      }
      if ((ref2 = this.footerView) != null) {
        ref2.setNumDifferences(this.diffView.getNumDifferences());
      }
      scrollSyncType = this._getConfig('scrollSyncType');
      if (scrollSyncType === 'Vertical + Horizontal') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, true);
        return this.syncScroll.syncPositions();
      } else if (scrollSyncType === 'Vertical') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, false);
        return this.syncScroll.syncPositions();
      }
    },
    _getEditorsForQuickDiff: function() {
      var activeItem, editor1, editor2, j, len, p, panes, rightPaneIndex;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (j = 0, len = panes.length; j < len; j++) {
        p = panes[j];
        activeItem = p.getActiveItem();
        if (atom.workspace.isTextEditor(activeItem)) {
          if (editor1 === null) {
            editor1 = activeItem;
          } else if (editor2 === null) {
            editor2 = activeItem;
            break;
          }
        }
      }
      if (editor1 === null) {
        editor1 = atom.workspace.buildTextEditor();
        this.wasEditor1Created = true;
        panes[0].addItem(editor1);
        panes[0].activateItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor();
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        if (panes[rightPaneIndex]) {
          panes[rightPaneIndex].addItem(editor2);
          panes[rightPaneIndex].activateItem(editor2);
        } else {
          atom.workspace.paneForItem(editor1).splitRight({
            items: [editor2]
          });
        }
      }
      return Promise.resolve({
        editor1: editor1,
        editor2: editor2
      });
    },
    _getEditorsForDiffWithActive: function(filePath) {
      var activeEditor, editor1, editor2Promise, noActiveEditorMsg, panes, rightPane, rightPaneIndex;
      activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor != null) {
        editor1 = activeEditor;
        this.wasEditor2Created = true;
        panes = atom.workspace.getPanes();
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        rightPane = panes[rightPaneIndex] || atom.workspace.paneForItem(editor1).splitRight();
        if (editor1.getPath() === filePath) {
          filePath = null;
        }
        editor2Promise = atom.workspace.openURIInPane(filePath, rightPane);
        return editor2Promise.then(function(editor2) {
          return {
            editor1: editor1,
            editor2: editor2
          };
        });
      } else {
        noActiveEditorMsg = 'No active file found! (Try focusing a text editor)';
        atom.notifications.addWarning('Split Diff', {
          detail: noActiveEditorMsg,
          dismissable: false,
          icon: 'diff'
        });
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    },
    _setupVisibleEditors: function(editor1, editor2) {
      var BufferExtender, buffer1LineEnding, buffer2LineEnding, lineEndingMsg, shouldNotify, softWrapMsg;
      BufferExtender = require('./buffer-extender');
      buffer1LineEnding = (new BufferExtender(editor1.getBuffer())).getLineEnding();
      if (this.wasEditor2Created) {
        atom.views.getView(editor1).focus();
        if (buffer1LineEnding === '\n' || buffer1LineEnding === '\r\n') {
          this.editorSubscriptions.add(editor2.onWillInsertText(function() {
            return editor2.getBuffer().setPreferredLineEnding(buffer1LineEnding);
          }));
        }
      }
      this._setupGitRepo(editor1, editor2);
      editor1.unfoldAll();
      editor2.unfoldAll();
      shouldNotify = !this._getConfig('muteNotifications');
      softWrapMsg = 'Warning: Soft wrap enabled! (Line diffs may not align)';
      if (editor1.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      } else if (editor2.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
      buffer2LineEnding = (new BufferExtender(editor2.getBuffer())).getLineEnding();
      if (buffer2LineEnding !== '' && (buffer1LineEnding !== buffer2LineEnding) && editor1.getLineCount() !== 1 && editor2.getLineCount() !== 1 && shouldNotify) {
        lineEndingMsg = 'Warning: Line endings differ!';
        return atom.notifications.addWarning('Split Diff', {
          detail: lineEndingMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, j, len, projectRepo, ref1, relativeEditor1Path, results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        ref1 = atom.project.getDirectories();
        results = [];
        for (i = j = 0, len = ref1.length; j < len; i = ++j) {
          directory = ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if ((projectRepo != null) && (projectRepo.repo != null)) {
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.repo.getHeadBlob(relativeEditor1Path);
              if (gitHeadText != null) {
                editor2.selectAll();
                editor2.insertText(gitHeadText);
                this.hasGitRepo = true;
                break;
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    },
    _createTempFiles: function(editors) {
      var editor1Path, editor1TempFile, editor2Path, editor2TempFile, editorPaths, tempFolderPath;
      editor1Path = '';
      editor2Path = '';
      tempFolderPath = atom.getConfigDirPath() + '/split-diff';
      editor1Path = tempFolderPath + '/split-diff 1';
      editor1TempFile = new File(editor1Path);
      editor1TempFile.writeSync(editors.editor1.getText());
      editor2Path = tempFolderPath + '/split-diff 2';
      editor2TempFile = new File(editor2Path);
      editor2TempFile.writeSync(editors.editor2.getText());
      editorPaths = {
        editor1Path: editor1Path,
        editor2Path: editor2Path
      };
      return editorPaths;
    },
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    },
    getMarkerLayers: function() {
      return new Promise(function(resolve, reject) {
        return window.splitDiffResolves.push(resolve);
      });
    },
    provideSplitDiff: function() {
      return {
        getMarkerLayers: this.getMarkerLayers
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvc3BsaXQtZGlmZi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMsNkNBQUQsRUFBc0IseUJBQXRCLEVBQWlDOztFQUNqQyxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVI7O0VBQ1gsV0FBQSxHQUFjLE9BQUEsQ0FBUSxtQkFBUjs7RUFDZCxVQUFBLEdBQWEsT0FBQSxDQUFRLGtCQUFSOztFQUNiLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQ2Y7SUFBQSxRQUFBLEVBQVUsSUFBVjtJQUNBLE1BQUEsRUFBUSxZQURSO0lBRUEsYUFBQSxFQUFlLElBRmY7SUFHQSxtQkFBQSxFQUFxQixJQUhyQjtJQUlBLFNBQUEsRUFBVyxLQUpYO0lBS0EsaUJBQUEsRUFBbUIsS0FMbkI7SUFNQSxpQkFBQSxFQUFtQixLQU5uQjtJQU9BLFVBQUEsRUFBWSxLQVBaO0lBUUEsT0FBQSxFQUFTLElBUlQ7SUFVQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsTUFBTSxDQUFDLGlCQUFQLEdBQTJCO01BRTNCLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsbUJBQUEsQ0FBQTthQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLHVEQUFsQixFQUNqQjtRQUFBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDtZQUNuQixLQUFDLENBQUEs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LFNBQWhCLENBQTBCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBaEIsQ0FBQSxDQUExQjtNQUVBLFdBQUEsR0FDRTtRQUFBLFdBQUEsRUFBYSxXQUFiO1FBQ0EsV0FBQSxFQUFhLFdBRGI7O0FBR0YsYUFBTztJQWpCUyxDQXpZbEI7SUE2WkEsVUFBQSxFQUFZLFNBQUMsTUFBRDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUI7SUFEVSxDQTdaWjtJQWdhQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUIsRUFBd0MsS0FBeEM7SUFEVSxDQWhhWjtJQXFhQSxlQUFBLEVBQWlCLFNBQUE7YUFDWCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO2VBQ1YsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQXpCLENBQThCLE9BQTlCO01BRFUsQ0FBUjtJQURXLENBcmFqQjtJQXlhQSxnQkFBQSxFQUFrQixTQUFBO2FBQ2hCO1FBQUEsZUFBQSxFQUFpQixJQUFDLENBQUEsZUFBbEI7O0lBRGdCLENBemFsQjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXJlY3RvcnksIEZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbkRpZmZWaWV3ID0gcmVxdWlyZSAnLi9kaWZmLXZpZXcnXG5Mb2FkaW5nVmlldyA9IHJlcXVpcmUgJy4vdWkvbG9hZGluZy12aWV3J1xuRm9vdGVyVmlldyA9IHJlcXVpcmUgJy4vdWkvZm9vdGVyLXZpZXcnXG5TeW5jU2Nyb2xsID0gcmVxdWlyZSAnLi9zeW5jLXNjcm9sbCdcbmNvbmZpZ1NjaGVtYSA9IHJlcXVpcmUgJy4vY29uZmlnLXNjaGVtYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwbGl0RGlmZiA9XG4gIGRpZmZWaWV3OiBudWxsXG4gIGNvbmZpZzogY29uZmlnU2NoZW1hXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgZWRpdG9yU3Vic2NyaXB0aW9uczogbnVsbFxuICBpc0VuYWJsZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjFDcmVhdGVkOiBmYWxzZVxuICB3YXNFZGl0b3IyQ3JlYXRlZDogZmFsc2VcbiAgaGFzR2l0UmVwbzogZmFsc2VcbiAgcHJvY2VzczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzID0gW11cblxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UsIC50cmVlLXZpZXcgLnNlbGVjdGVkLCAudGFiLnRleHRlZGl0b3InLFxuICAgICAgJ3NwbGl0LWRpZmY6ZW5hYmxlJzogKGUpID0+XG4gICAgICAgIEBkaWZmUGFuZXMoZSlcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgJ3NwbGl0LWRpZmY6bmV4dC1kaWZmJzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBuZXh0RGlmZigpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAZGlmZlBhbmVzKClcbiAgICAgICdzcGxpdC1kaWZmOnByZXYtZGlmZic6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAcHJldkRpZmYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRpZmZQYW5lcygpXG4gICAgICAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0JzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBjb3B5VG9SaWdodCgpXG4gICAgICAnc3BsaXQtZGlmZjpjb3B5LXRvLWxlZnQnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQGNvcHlUb0xlZnQoKVxuICAgICAgJ3NwbGl0LWRpZmY6ZGlzYWJsZSc6ID0+IEBkaXNhYmxlKClcbiAgICAgICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJzogPT4gQHRvZ2dsZUlnbm9yZVdoaXRlc3BhY2UoKVxuICAgICAgJ3NwbGl0LWRpZmY6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzYWJsZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGVcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBzcGxpdCBkaWZmXG4gIHRvZ2dsZTogKCkgLT5cbiAgICBpZiBAaXNFbmFibGVkXG4gICAgICBAZGlzYWJsZSgpXG4gICAgZWxzZVxuICAgICAgQGRpZmZQYW5lcygpXG5cbiAgIyBjYWxsZWQgYnkgXCJEaXNhYmxlXCIgY29tbWFuZFxuICAjIHJlbW92ZXMgZGlmZiBhbmQgc3luYyBzY3JvbGwsIGRpc3Bvc2VzIG9mIHN1YnNjcmlwdGlvbnNcbiAgZGlzYWJsZTogKCkgLT5cbiAgICBAaXNFbmFibGVkID0gZmFsc2VcblxuICAgICMgcmVtb3ZlIGxpc3RlbmVyc1xuICAgIGlmIEBlZGl0b3JTdWJzY3JpcHRpb25zP1xuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG51bGxcblxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIGlmIEB3YXNFZGl0b3IxQ3JlYXRlZFxuICAgICAgICBAZGlmZlZpZXcuY2xlYW5VcEVkaXRvcigxKVxuICAgICAgaWYgQHdhc0VkaXRvcjJDcmVhdGVkXG4gICAgICAgIEBkaWZmVmlldy5jbGVhblVwRWRpdG9yKDIpXG4gICAgICBAZGlmZlZpZXcuZGVzdHJveSgpXG4gICAgICBAZGlmZlZpZXcgPSBudWxsXG5cbiAgICAjIHJlbW92ZSB2aWV3c1xuICAgIGlmIEBmb290ZXJWaWV3P1xuICAgICAgQGZvb3RlclZpZXcuZGVzdHJveSgpXG4gICAgICBAZm9vdGVyVmlldyA9IG51bGxcbiAgICBpZiBAbG9hZGluZ1ZpZXc/XG4gICAgICBAbG9hZGluZ1ZpZXcuZGVzdHJveSgpXG4gICAgICBAbG9hZGluZ1ZpZXcgPSBudWxsXG5cbiAgICBpZiBAc3luY1Njcm9sbD9cbiAgICAgIEBzeW5jU2Nyb2xsLmRpc3Bvc2UoKVxuICAgICAgQHN5bmNTY3JvbGwgPSBudWxsXG5cbiAgICAjIHJlc2V0IGFsbCB2YXJpYWJsZXNcbiAgICBAd2FzRWRpdG9yMUNyZWF0ZWQgPSBmYWxzZVxuICAgIEB3YXNFZGl0b3IyQ3JlYXRlZCA9IGZhbHNlXG4gICAgQGhhc0dpdFJlcG8gPSBmYWxzZVxuXG4gICAgIyBhdXRvIGhpZGUgdHJlZSB2aWV3IHdoaWxlIGRpZmZpbmcgIzgyXG4gICAgaWYgQF9nZXRDb25maWcoJ2hpZGVUcmVlVmlldycpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICd0cmVlLXZpZXc6c2hvdycpXG5cbiAgIyBjYWxsZWQgYnkgXCJ0b2dnbGUgaWdub3JlIHdoaXRlc3BhY2VcIiBjb21tYW5kXG4gICMgdG9nZ2xlcyBpZ25vcmluZyB3aGl0ZXNwYWNlIGFuZCByZWZyZXNoZXMgdGhlIGRpZmZcbiAgdG9nZ2xlSWdub3JlV2hpdGVzcGFjZTogLT5cbiAgICBpc1doaXRlc3BhY2VJZ25vcmVkID0gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuICAgIEBfc2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJywgIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG4gICAgQGZvb3RlclZpZXc/LnNldElnbm9yZVdoaXRlc3BhY2UoIWlzV2hpdGVzcGFjZUlnbm9yZWQpXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIG5leHQgZGlmZlwiIGNvbW1hbmRcbiAgbmV4dERpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IEBkaWZmVmlldy5uZXh0RGlmZigpXG4gICAgICBAZm9vdGVyVmlldz8uc2hvd1NlbGVjdGlvbkNvdW50KCBzZWxlY3RlZEluZGV4ICsgMSApXG5cbiAgIyBjYWxsZWQgYnkgXCJNb3ZlIHRvIHByZXZpb3VzIGRpZmZcIiBjb21tYW5kXG4gIHByZXZEaWZmOiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIHNlbGVjdGVkSW5kZXggPSBAZGlmZlZpZXcucHJldkRpZmYoKVxuICAgICAgQGZvb3RlclZpZXc/LnNob3dTZWxlY3Rpb25Db3VudCggc2VsZWN0ZWRJbmRleCArIDEgKVxuXG4gICMgY2FsbGVkIGJ5IFwiQ29weSB0byByaWdodFwiIGNvbW1hbmRcbiAgY29weVRvUmlnaHQ6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgQGRpZmZWaWV3LmNvcHlUb1JpZ2h0KClcbiAgICAgIEBmb290ZXJWaWV3Py5oaWRlU2VsZWN0aW9uQ291bnQoKVxuXG4gICMgY2FsbGVkIGJ5IFwiQ29weSB0byBsZWZ0XCIgY29tbWFuZFxuICBjb3B5VG9MZWZ0OiAtPlxuICAgIGlmIEBkaWZmVmlldz9cbiAgICAgIEBkaWZmVmlldy5jb3B5VG9MZWZ0KClcbiAgICAgIEBmb290ZXJWaWV3Py5oaWRlU2VsZWN0aW9uQ291bnQoKVxuXG4gICMgY2FsbGVkIGJ5IHRoZSBjb21tYW5kcyBlbmFibGUvdG9nZ2xlIHRvIGRvIGluaXRpYWwgZGlmZlxuICAjIHNldHMgdXAgc3Vic2NyaXB0aW9ucyBmb3IgYXV0byBkaWZmIGFuZCBkaXNhYmxpbmcgd2hlbiBhIHBhbmUgaXMgZGVzdHJveWVkXG4gICMgZXZlbnQgaXMgYW4gb3B0aW9uYWwgYXJndW1lbnQgb2YgYSBmaWxlIHBhdGggdG8gZGlmZiB3aXRoIGN1cnJlbnRcbiAgZGlmZlBhbmVzOiAoZXZlbnQpIC0+XG4gICAgIyBpbiBjYXNlIGVuYWJsZSB3YXMgY2FsbGVkIGFnYWluXG4gICAgQGRpc2FibGUoKVxuXG4gICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBpZiBldmVudD8uY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ3RhYicpXG4gICAgICBmaWxlUGF0aCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQucGF0aFxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZShmaWxlUGF0aClcbiAgICBlbHNlIGlmIGV2ZW50Py5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnbGlzdC1pdGVtJykgJiYgZXZlbnQ/LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdmaWxlJylcbiAgICAgIGZpbGVQYXRoID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRQYXRoKClcbiAgICAgIGVkaXRvcnNQcm9taXNlID0gQF9nZXRFZGl0b3JzRm9yRGlmZldpdGhBY3RpdmUoZmlsZVBhdGgpXG4gICAgZWxzZVxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JRdWlja0RpZmYoKVxuXG4gICAgZWRpdG9yc1Byb21pc2UudGhlbiAoKGVkaXRvcnMpIC0+XG4gICAgICBpZiBlZGl0b3JzID09IG51bGxcbiAgICAgICAgcmV0dXJuXG4gICAgICBAX3NldHVwVmlzaWJsZUVkaXRvcnMoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIpXG4gICAgICBAZGlmZlZpZXcgPSBuZXcgRGlmZlZpZXcoZWRpdG9ycylcblxuICAgICAgIyBhZGQgbGlzdGVuZXJzXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAZGlzYWJsZSgpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ3NwbGl0LWRpZmYnLCAoKSA9PlxuICAgICAgICBAdXBkYXRlRGlmZihlZGl0b3JzKVxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgQGRpZmZWaWV3LmhhbmRsZUN1cnNvckNoYW5nZShldmVudC5jdXJzb3IsIGV2ZW50Lm9sZEJ1ZmZlclBvc2l0aW9uLCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiAoZXZlbnQpID0+XG4gICAgICAgIEBkaWZmVmlldy5oYW5kbGVDdXJzb3JDaGFuZ2UoZXZlbnQuY3Vyc29yLCBldmVudC5vbGRCdWZmZXJQb3NpdGlvbiwgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkQWRkQ3Vyc29yIChjdXJzb3IpID0+XG4gICAgICAgIEBkaWZmVmlldy5oYW5kbGVDdXJzb3JDaGFuZ2UoY3Vyc29yLCAtMSwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IyLm9uRGlkQWRkQ3Vyc29yIChjdXJzb3IpID0+XG4gICAgICAgIEBkaWZmVmlldy5oYW5kbGVDdXJzb3JDaGFuZ2UoY3Vyc29yLCAtMSwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbiAgICAgICMgYWRkIHRoZSBib3R0b20gVUkgcGFuZWxcbiAgICAgIGlmICFAZm9vdGVyVmlldz9cbiAgICAgICAgQGZvb3RlclZpZXcgPSBuZXcgRm9vdGVyVmlldyhAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpKVxuICAgICAgICBAZm9vdGVyVmlldy5jcmVhdGVQYW5lbCgpXG4gICAgICBAZm9vdGVyVmlldy5zaG93KClcblxuICAgICAgIyB1cGRhdGUgZGlmZiBpZiB0aGVyZSBpcyBubyBnaXQgcmVwbyAobm8gb25jaGFuZ2UgZmlyZWQpXG4gICAgICBpZiAhQGhhc0dpdFJlcG9cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcblxuICAgICAgIyBhZGQgYXBwbGljYXRpb24gbWVudSBpdGVtc1xuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20ubWVudS5hZGQgW1xuICAgICAgICB7XG4gICAgICAgICAgJ2xhYmVsJzogJ1BhY2thZ2VzJ1xuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgJ2xhYmVsJzogJ1NwbGl0IERpZmYnXG4gICAgICAgICAgICAnc3VibWVudSc6IFtcbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gTmV4dCBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBQcmV2aW91cyBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpwcmV2LWRpZmYnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gTGVmdCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0J31cbiAgICAgICAgICAgIF1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbnRleHRNZW51LmFkZCB7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW3tcbiAgICAgICAgICAnbGFiZWwnOiAnU3BsaXQgRGlmZicsXG4gICAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdJZ25vcmUgV2hpdGVzcGFjZScsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gTmV4dCBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIFJpZ2h0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0J31cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gTGVmdCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0J31cbiAgICAgICAgICBdXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgICApLmJpbmQodGhpcykgIyBtYWtlIHN1cmUgdGhlIHNjb3BlIGlzIGNvcnJlY3RcblxuICAjIGNhbGxlZCBieSBib3RoIGRpZmZQYW5lcyBhbmQgdGhlIGVkaXRvciBzdWJzY3JpcHRpb24gdG8gdXBkYXRlIHRoZSBkaWZmXG4gIHVwZGF0ZURpZmY6IChlZGl0b3JzKSAtPlxuICAgIEBpc0VuYWJsZWQgPSB0cnVlXG5cbiAgICAjIGF1dG8gaGlkZSB0cmVlIHZpZXcgd2hpbGUgZGlmZmluZyAjODJcbiAgICBpZiBAX2dldENvbmZpZygnaGlkZVRyZWVWaWV3JykgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRyZWUtdmlldycpXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICd0cmVlLXZpZXc6dG9nZ2xlJylcblxuICAgICMgaWYgdGhlcmUgaXMgYSBkaWZmIGJlaW5nIGNvbXB1dGVkIGluIHRoZSBiYWNrZ3JvdW5kLCBjYW5jZWwgaXRcbiAgICBpZiBAcHJvY2Vzcz9cbiAgICAgIEBwcm9jZXNzLmtpbGwoKVxuICAgICAgQHByb2Nlc3MgPSBudWxsXG5cbiAgICBpc1doaXRlc3BhY2VJZ25vcmVkID0gQF9nZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnKVxuICAgIGVkaXRvclBhdGhzID0gQF9jcmVhdGVUZW1wRmlsZXMoZWRpdG9ycylcblxuICAgICMgY3JlYXRlIHRoZSBsb2FkaW5nIHZpZXcgaWYgaXQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICBpZiAhQGxvYWRpbmdWaWV3P1xuICAgICAgQGxvYWRpbmdWaWV3ID0gbmV3IExvYWRpbmdWaWV3KClcbiAgICAgIEBsb2FkaW5nVmlldy5jcmVhdGVNb2RhbCgpXG4gICAgQGxvYWRpbmdWaWV3LnNob3coKVxuXG4gICAgIyAtLS0ga2ljayBvZmYgYmFja2dyb3VuZCBwcm9jZXNzIHRvIGNvbXB1dGUgZGlmZiAtLS1cbiAgICB7QnVmZmVyZWROb2RlUHJvY2Vzc30gPSByZXF1aXJlICdhdG9tJ1xuICAgIGNvbW1hbmQgPSBwYXRoLnJlc29sdmUgX19kaXJuYW1lLCBcIi4vY29tcHV0ZS1kaWZmLmpzXCJcbiAgICBhcmdzID0gW2VkaXRvclBhdGhzLmVkaXRvcjFQYXRoLCBlZGl0b3JQYXRocy5lZGl0b3IyUGF0aCwgaXNXaGl0ZXNwYWNlSWdub3JlZF1cbiAgICB0aGVPdXRwdXQgPSAnJ1xuICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICB0aGVPdXRwdXQgPSBvdXRwdXRcbiAgICAgIGNvbXB1dGVkRGlmZiA9IEpTT04ucGFyc2Uob3V0cHV0KVxuICAgICAgQHByb2Nlc3Mua2lsbCgpXG4gICAgICBAcHJvY2VzcyA9IG51bGxcbiAgICAgIEBsb2FkaW5nVmlldz8uaGlkZSgpXG4gICAgICBAX3Jlc3VtZVVwZGF0ZURpZmYoZWRpdG9ycywgY29tcHV0ZWREaWZmKVxuICAgIHN0ZGVyciA9IChlcnIpID0+XG4gICAgICB0aGVPdXRwdXQgPSBlcnJcbiAgICBleGl0ID0gKGNvZGUpID0+XG4gICAgICBAbG9hZGluZ1ZpZXc/LmhpZGUoKVxuXG4gICAgICBpZiBjb2RlICE9IDBcbiAgICAgICAgY29uc29sZS5sb2coJ0J1ZmZlcmVkTm9kZVByb2Nlc3MgY29kZSB3YXMgJyArIGNvZGUpXG4gICAgICAgIGNvbnNvbGUubG9nKHRoZU91dHB1dClcbiAgICBAcHJvY2VzcyA9IG5ldyBCdWZmZXJlZE5vZGVQcm9jZXNzKHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIHN0ZGVyciwgZXhpdH0pXG4gICAgIyAtLS0ga2ljayBvZmYgYmFja2dyb3VuZCBwcm9jZXNzIHRvIGNvbXB1dGUgZGlmZiAtLS1cblxuICAjIHJlc3VtZXMgYWZ0ZXIgdGhlIGNvbXB1dGUgZGlmZiBwcm9jZXNzIHJldHVybnNcbiAgX3Jlc3VtZVVwZGF0ZURpZmY6IChlZGl0b3JzLCBjb21wdXRlZERpZmYpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZGlmZlZpZXc/XG5cbiAgICBAZGlmZlZpZXcuY2xlYXJEaWZmKClcbiAgICBpZiBAc3luY1Njcm9sbD9cbiAgICAgIEBzeW5jU2Nyb2xsLmRpc3Bvc2UoKVxuICAgICAgQHN5bmNTY3JvbGwgPSBudWxsXG5cbiAgICBsZWZ0SGlnaGxpZ2h0VHlwZSA9ICdhZGRlZCdcbiAgICByaWdodEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCdcbiAgICBpZiBAX2dldENvbmZpZygnbGVmdEVkaXRvckNvbG9yJykgPT0gJ3JlZCdcbiAgICAgIGxlZnRIaWdobGlnaHRUeXBlID0gJ3JlbW92ZWQnXG4gICAgaWYgQF9nZXRDb25maWcoJ3JpZ2h0RWRpdG9yQ29sb3InKSA9PSAnZ3JlZW4nXG4gICAgICByaWdodEhpZ2hsaWdodFR5cGUgPSAnYWRkZWQnXG4gICAgQGRpZmZWaWV3LmRpc3BsYXlEaWZmKGNvbXB1dGVkRGlmZiwgbGVmdEhpZ2hsaWdodFR5cGUsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgQF9nZXRDb25maWcoJ2RpZmZXb3JkcycpLCBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpKVxuXG4gICAgd2hpbGUgd2luZG93LnNwbGl0RGlmZlJlc29sdmVzPy5sZW5ndGhcbiAgICAgIHdpbmRvdy5zcGxpdERpZmZSZXNvbHZlcy5wb3AoKShAZGlmZlZpZXcuZ2V0TWFya2VyTGF5ZXJzKCkpXG5cbiAgICBAZm9vdGVyVmlldz8uc2V0TnVtRGlmZmVyZW5jZXMoQGRpZmZWaWV3LmdldE51bURpZmZlcmVuY2VzKCkpXG5cbiAgICBzY3JvbGxTeW5jVHlwZSA9IEBfZ2V0Q29uZmlnKCdzY3JvbGxTeW5jVHlwZScpXG4gICAgaWYgc2Nyb2xsU3luY1R5cGUgPT0gJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICAgIEBzeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIsIHRydWUpXG4gICAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcbiAgICBlbHNlIGlmIHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCdcbiAgICAgIEBzeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIsIGZhbHNlKVxuICAgICAgQHN5bmNTY3JvbGwuc3luY1Bvc2l0aW9ucygpXG5cbiAgIyBHZXRzIHRoZSBmaXJzdCB0d28gdmlzaWJsZSBlZGl0b3JzIGZvdW5kIG9yIGNyZWF0ZXMgdGhlbSBhcyBuZWVkZWQuXG4gICMgUmV0dXJucyBhIFByb21pc2Ugd2hpY2ggeWllbGRzIGEgdmFsdWUgb2Yge2VkaXRvcjE6IFRleHRFZGl0b3IsIGVkaXRvcjI6IFRleHRFZGl0b3J9XG4gIF9nZXRFZGl0b3JzRm9yUXVpY2tEaWZmOiAoKSAtPlxuICAgIGVkaXRvcjEgPSBudWxsXG4gICAgZWRpdG9yMiA9IG51bGxcblxuICAgICMgdHJ5IHRvIGZpbmQgdGhlIGZpcnN0IHR3byBlZGl0b3JzXG4gICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG4gICAgZm9yIHAgaW4gcGFuZXNcbiAgICAgIGFjdGl2ZUl0ZW0gPSBwLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGFjdGl2ZUl0ZW0pXG4gICAgICAgIGlmIGVkaXRvcjEgPT0gbnVsbFxuICAgICAgICAgIGVkaXRvcjEgPSBhY3RpdmVJdGVtXG4gICAgICAgIGVsc2UgaWYgZWRpdG9yMiA9PSBudWxsXG4gICAgICAgICAgZWRpdG9yMiA9IGFjdGl2ZUl0ZW1cbiAgICAgICAgICBicmVha1xuXG4gICAgIyBhdXRvIG9wZW4gZWRpdG9yIHBhbmVzIHNvIHdlIGhhdmUgdHdvIHRvIGRpZmYgd2l0aFxuICAgIGlmIGVkaXRvcjEgPT0gbnVsbFxuICAgICAgZWRpdG9yMSA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcigpXG4gICAgICBAd2FzRWRpdG9yMUNyZWF0ZWQgPSB0cnVlXG4gICAgICAjIGFkZCBmaXJzdCBlZGl0b3IgdG8gdGhlIGZpcnN0IHBhbmVcbiAgICAgIHBhbmVzWzBdLmFkZEl0ZW0oZWRpdG9yMSlcbiAgICAgIHBhbmVzWzBdLmFjdGl2YXRlSXRlbShlZGl0b3IxKVxuICAgIGlmIGVkaXRvcjIgPT0gbnVsbFxuICAgICAgZWRpdG9yMiA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcigpXG4gICAgICBAd2FzRWRpdG9yMkNyZWF0ZWQgPSB0cnVlXG4gICAgICBlZGl0b3IyLnNldEdyYW1tYXIoZWRpdG9yMS5nZXRHcmFtbWFyKCkpXG4gICAgICByaWdodFBhbmVJbmRleCA9IHBhbmVzLmluZGV4T2YoYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkpICsgMVxuICAgICAgaWYgcGFuZXNbcmlnaHRQYW5lSW5kZXhdXG4gICAgICAgICMgYWRkIHNlY29uZCBlZGl0b3IgdG8gZXhpc3RpbmcgcGFuZSB0byB0aGUgcmlnaHQgb2YgZmlyc3QgZWRpdG9yXG4gICAgICAgIHBhbmVzW3JpZ2h0UGFuZUluZGV4XS5hZGRJdGVtKGVkaXRvcjIpXG4gICAgICAgIHBhbmVzW3JpZ2h0UGFuZUluZGV4XS5hY3RpdmF0ZUl0ZW0oZWRpdG9yMilcbiAgICAgIGVsc2VcbiAgICAgICAgIyBubyBleGlzdGluZyBwYW5lIHNvIHNwbGl0IHJpZ2h0XG4gICAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpLnNwbGl0UmlnaHQoe2l0ZW1zOiBbZWRpdG9yMl19KVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7ZWRpdG9yMTogZWRpdG9yMSwgZWRpdG9yMjogZWRpdG9yMn0pXG5cbiAgIyBHZXRzIHRoZSBhY3RpdmUgZWRpdG9yIGFuZCBvcGVucyB0aGUgc3BlY2lmaWVkIGZpbGUgdG8gdGhlIHJpZ2h0IG9mIGl0XG4gICMgUmV0dXJucyBhIFByb21pc2Ugd2hpY2ggeWllbGRzIGEgdmFsdWUgb2Yge2VkaXRvcjE6IFRleHRFZGl0b3IsIGVkaXRvcjI6IFRleHRFZGl0b3J9XG4gIF9nZXRFZGl0b3JzRm9yRGlmZldpdGhBY3RpdmU6IChmaWxlUGF0aCkgLT5cbiAgICBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBhY3RpdmVFZGl0b3I/XG4gICAgICBlZGl0b3IxID0gYWN0aXZlRWRpdG9yXG4gICAgICBAd2FzRWRpdG9yMkNyZWF0ZWQgPSB0cnVlXG4gICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcbiAgICAgICMgZ2V0IGluZGV4IG9mIHBhbmUgZm9sbG93aW5nIGFjdGl2ZSBlZGl0b3IgcGFuZVxuICAgICAgcmlnaHRQYW5lSW5kZXggPSBwYW5lcy5pbmRleE9mKGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpKSArIDFcbiAgICAgICMgcGFuZSBpcyBjcmVhdGVkIGlmIHRoZXJlIGlzIG5vdCBvbmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBhY3RpdmUgZWRpdG9yXG4gICAgICByaWdodFBhbmUgPSBwYW5lc1tyaWdodFBhbmVJbmRleF0gfHwgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkuc3BsaXRSaWdodCgpXG4gICAgICBpZiBlZGl0b3IxLmdldFBhdGgoKSA9PSBmaWxlUGF0aFxuICAgICAgICAjIGlmIGRpZmZpbmcgd2l0aCBpdHNlbGYsIHNldCBmaWxlUGF0aCB0byBudWxsIHNvIGFuIGVtcHR5IGVkaXRvciBpc1xuICAgICAgICAjIG9wZW5lZCwgd2hpY2ggd2lsbCBjYXVzZSBhIGdpdCBkaWZmXG4gICAgICAgIGZpbGVQYXRoID0gbnVsbFxuICAgICAgZWRpdG9yMlByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKGZpbGVQYXRoLCByaWdodFBhbmUpXG5cbiAgICAgIHJldHVybiBlZGl0b3IyUHJvbWlzZS50aGVuIChlZGl0b3IyKSAtPlxuICAgICAgICByZXR1cm4ge2VkaXRvcjE6IGVkaXRvcjEsIGVkaXRvcjI6IGVkaXRvcjJ9XG4gICAgZWxzZVxuICAgICAgbm9BY3RpdmVFZGl0b3JNc2cgPSAnTm8gYWN0aXZlIGZpbGUgZm91bmQhIChUcnkgZm9jdXNpbmcgYSB0ZXh0IGVkaXRvciknXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IG5vQWN0aXZlRWRpdG9yTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgX3NldHVwVmlzaWJsZUVkaXRvcnM6IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIEJ1ZmZlckV4dGVuZGVyID0gcmVxdWlyZSAnLi9idWZmZXItZXh0ZW5kZXInXG4gICAgYnVmZmVyMUxpbmVFbmRpbmcgPSAobmV3IEJ1ZmZlckV4dGVuZGVyKGVkaXRvcjEuZ2V0QnVmZmVyKCkpKS5nZXRMaW5lRW5kaW5nKClcblxuICAgIGlmIEB3YXNFZGl0b3IyQ3JlYXRlZFxuICAgICAgIyB3YW50IHRvIHNjcm9sbCBhIG5ld2x5IGNyZWF0ZWQgZWRpdG9yIHRvIHRoZSBmaXJzdCBlZGl0b3IncyBwb3NpdGlvblxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcjEpLmZvY3VzKClcbiAgICAgICMgc2V0IHRoZSBwcmVmZXJyZWQgbGluZSBlbmRpbmcgYmVmb3JlIGluc2VydGluZyB0ZXh0ICMzOVxuICAgICAgaWYgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcbicgfHwgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcclxcbidcbiAgICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcjIub25XaWxsSW5zZXJ0VGV4dCAoKSAtPlxuICAgICAgICAgIGVkaXRvcjIuZ2V0QnVmZmVyKCkuc2V0UHJlZmVycmVkTGluZUVuZGluZyhidWZmZXIxTGluZUVuZGluZylcblxuICAgIEBfc2V0dXBHaXRSZXBvKGVkaXRvcjEsIGVkaXRvcjIpXG5cbiAgICAjIHVuZm9sZCBhbGwgbGluZXMgc28gZGlmZnMgcHJvcGVybHkgYWxpZ25cbiAgICBlZGl0b3IxLnVuZm9sZEFsbCgpXG4gICAgZWRpdG9yMi51bmZvbGRBbGwoKVxuXG4gICAgc2hvdWxkTm90aWZ5ID0gIUBfZ2V0Q29uZmlnKCdtdXRlTm90aWZpY2F0aW9ucycpXG4gICAgc29mdFdyYXBNc2cgPSAnV2FybmluZzogU29mdCB3cmFwIGVuYWJsZWQhIChMaW5lIGRpZmZzIG1heSBub3QgYWxpZ24pJ1xuICAgIGlmIGVkaXRvcjEuaXNTb2Z0V3JhcHBlZCgpICYmIHNob3VsZE5vdGlmeVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBzb2Z0V3JhcE1zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuICAgIGVsc2UgaWYgZWRpdG9yMi5pc1NvZnRXcmFwcGVkKCkgJiYgc2hvdWxkTm90aWZ5XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHNvZnRXcmFwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgICBidWZmZXIyTGluZUVuZGluZyA9IChuZXcgQnVmZmVyRXh0ZW5kZXIoZWRpdG9yMi5nZXRCdWZmZXIoKSkpLmdldExpbmVFbmRpbmcoKVxuICAgIGlmIGJ1ZmZlcjJMaW5lRW5kaW5nICE9ICcnICYmIChidWZmZXIxTGluZUVuZGluZyAhPSBidWZmZXIyTGluZUVuZGluZykgJiYgZWRpdG9yMS5nZXRMaW5lQ291bnQoKSAhPSAxICYmIGVkaXRvcjIuZ2V0TGluZUNvdW50KCkgIT0gMSAmJiBzaG91bGROb3RpZnlcbiAgICAgICMgcG9wIHdhcm5pbmcgaWYgdGhlIGxpbmUgZW5kaW5ncyBkaWZmZXIgYW5kIHdlIGhhdmVuJ3QgZG9uZSBhbnl0aGluZyBhYm91dCBpdFxuICAgICAgbGluZUVuZGluZ01zZyA9ICdXYXJuaW5nOiBMaW5lIGVuZGluZ3MgZGlmZmVyISdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogbGluZUVuZGluZ01zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuXG4gIF9zZXR1cEdpdFJlcG86IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gZWRpdG9yMS5nZXRQYXRoKClcbiAgICAjIG9ubHkgc2hvdyBnaXQgY2hhbmdlcyBpZiB0aGUgcmlnaHQgZWRpdG9yIGlzIGVtcHR5XG4gICAgaWYgZWRpdG9yMVBhdGg/ICYmIChlZGl0b3IyLmdldExpbmVDb3VudCgpID09IDEgJiYgZWRpdG9yMi5saW5lVGV4dEZvckJ1ZmZlclJvdygwKSA9PSAnJylcbiAgICAgIGZvciBkaXJlY3RvcnksIGkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgaWYgZWRpdG9yMVBhdGggaXMgZGlyZWN0b3J5LmdldFBhdGgoKSBvciBkaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yMVBhdGgpXG4gICAgICAgICAgcHJvamVjdFJlcG8gPSBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICAgICAgICBpZiBwcm9qZWN0UmVwbz8gJiYgcHJvamVjdFJlcG8ucmVwbz9cbiAgICAgICAgICAgIHJlbGF0aXZlRWRpdG9yMVBhdGggPSBwcm9qZWN0UmVwby5yZWxhdGl2aXplKGVkaXRvcjFQYXRoKVxuICAgICAgICAgICAgZ2l0SGVhZFRleHQgPSBwcm9qZWN0UmVwby5yZXBvLmdldEhlYWRCbG9iKHJlbGF0aXZlRWRpdG9yMVBhdGgpXG4gICAgICAgICAgICBpZiBnaXRIZWFkVGV4dD9cbiAgICAgICAgICAgICAgZWRpdG9yMi5zZWxlY3RBbGwoKVxuICAgICAgICAgICAgICBlZGl0b3IyLmluc2VydFRleHQoZ2l0SGVhZFRleHQpXG4gICAgICAgICAgICAgIEBoYXNHaXRSZXBvID0gdHJ1ZVxuICAgICAgICAgICAgICBicmVha1xuXG4gICMgY3JlYXRlcyB0ZW1wIGZpbGVzIHNvIHRoZSBjb21wdXRlIGRpZmYgcHJvY2VzcyBjYW4gZ2V0IHRoZSB0ZXh0IGVhc2lseVxuICBfY3JlYXRlVGVtcEZpbGVzOiAoZWRpdG9ycykgLT5cbiAgICBlZGl0b3IxUGF0aCA9ICcnXG4gICAgZWRpdG9yMlBhdGggPSAnJ1xuICAgIHRlbXBGb2xkZXJQYXRoID0gYXRvbS5nZXRDb25maWdEaXJQYXRoKCkgKyAnL3NwbGl0LWRpZmYnXG5cbiAgICBlZGl0b3IxUGF0aCA9IHRlbXBGb2xkZXJQYXRoICsgJy9zcGxpdC1kaWZmIDEnXG4gICAgZWRpdG9yMVRlbXBGaWxlID0gbmV3IEZpbGUoZWRpdG9yMVBhdGgpXG4gICAgZWRpdG9yMVRlbXBGaWxlLndyaXRlU3luYyhlZGl0b3JzLmVkaXRvcjEuZ2V0VGV4dCgpKVxuXG4gICAgZWRpdG9yMlBhdGggPSB0ZW1wRm9sZGVyUGF0aCArICcvc3BsaXQtZGlmZiAyJ1xuICAgIGVkaXRvcjJUZW1wRmlsZSA9IG5ldyBGaWxlKGVkaXRvcjJQYXRoKVxuICAgIGVkaXRvcjJUZW1wRmlsZS53cml0ZVN5bmMoZWRpdG9ycy5lZGl0b3IyLmdldFRleHQoKSlcblxuICAgIGVkaXRvclBhdGhzID1cbiAgICAgIGVkaXRvcjFQYXRoOiBlZGl0b3IxUGF0aFxuICAgICAgZWRpdG9yMlBhdGg6IGVkaXRvcjJQYXRoXG5cbiAgICByZXR1cm4gZWRpdG9yUGF0aHNcblxuXG4gIF9nZXRDb25maWc6IChjb25maWcpIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwic3BsaXQtZGlmZi4je2NvbmZpZ31cIilcblxuICBfc2V0Q29uZmlnOiAoY29uZmlnLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJzcGxpdC1kaWZmLiN7Y29uZmlnfVwiLCB2YWx1ZSlcblxuXG4gICMgLS0tIFNFUlZJQ0UgQVBJIC0tLVxuICBnZXRNYXJrZXJMYXllcnM6ICgpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIHdpbmRvdy5zcGxpdERpZmZSZXNvbHZlcy5wdXNoKHJlc29sdmUpXG5cbiAgcHJvdmlkZVNwbGl0RGlmZjogLT5cbiAgICBnZXRNYXJrZXJMYXllcnM6IEBnZXRNYXJrZXJMYXllcnNcbiJdfQ==
