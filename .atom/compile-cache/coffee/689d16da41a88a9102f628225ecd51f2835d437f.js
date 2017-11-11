(function() {
  var Cursor, Delegator, DisplayBuffer, Editor, LanguageMode, Model, Point, Range, Selection, Serializable, TextMateScopeSelector, _, deprecate, path, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('underscore-plus');

  path = require('path');

  Serializable = require('serializable');

  Delegator = require('delegato');

  deprecate = require('grim').deprecate;

  Model = require('theorist').Model;

  ref = require('text-buffer'), Point = ref.Point, Range = ref.Range;

  LanguageMode = require('./language-mode');

  DisplayBuffer = require('./display-buffer');

  Cursor = require('./cursor');

  Selection = require('./selection');

  TextMateScopeSelector = require('first-mate').ScopeSelector;

  module.exports = Editor = (function(superClass) {
    extend(Editor, superClass);

    Serializable.includeInto(Editor);

    atom.deserializers.add(Editor);

    Delegator.includeInto(Editor);

    Editor.prototype.deserializing = false;

    Editor.prototype.callDisplayBufferCreatedHook = false;

    Editor.prototype.registerEditor = false;

    Editor.prototype.buffer = null;

    Editor.prototype.languageMode = null;

    Editor.prototype.cursors = null;

    Editor.prototype.selections = null;

    Editor.prototype.suppressSelectionMerging = false;

    Editor.delegatesMethods('suggestedIndentForBufferRow', 'autoIndentBufferRow', 'autoIndentBufferRows', 'autoDecreaseIndentForBufferRow', 'toggleLineCommentForBufferRow', 'toggleLineCommentsForBufferRows', {
      toProperty: 'languageMode'
    });

    Editor.delegatesProperties('$lineHeight', '$defaultCharWidth', '$height', '$width', '$scrollTop', '$scrollLeft', 'manageScrollPosition', {
      toProperty: 'displayBuffer'
    });

    function Editor(arg) {
      var buffer, initialColumn, initialLine, j, len, marker, ref1, ref2, ref3, ref4, ref5, registerEditor, softWrap, suppressCursorCreation, tabLength;
      this.softTabs = arg.softTabs, initialLine = arg.initialLine, initialColumn = arg.initialColumn, tabLength = arg.tabLength, softWrap = arg.softWrap, this.displayBuffer = arg.displayBuffer, buffer = arg.buffer, registerEditor = arg.registerEditor, suppressCursorCreation = arg.suppressCursorCreation;
      this.handleMarkerCreated = bind(this.handleMarkerCreated, this);
      Editor.__super__.constructor.apply(this, arguments);
      this.cursors = [];
      this.selections = [];
      if (this.displayBuffer == null) {
        this.displayBuffer = new DisplayBuffer({
          buffer: buffer,
          tabLength: tabLength,
          softWrap: softWrap
        });
      }
      this.buffer = this.displayBuffer.buffer;
      this.softTabs = (ref1 = (ref2 = (ref3 = this.buffer.usesSoftTabs()) != null ? ref3 : this.softTabs) != null ? ref2 : atom.config.get('editor.softTabs')) != null ? ref1 : true;
      ref4 = this.findMarkers(this.getSelectionMarkerAttributes());
      for (j = 0, len = ref4.length; j < len; j++) {
        marker = ref4[j];
        marker.setAttributes({
          preserveFolds: true
        });
        this.addSelection(marker);
      }
      this.subscribeToBuffer();
      this.subscribeToDisplayBuffer();
      if (this.getCursors().length === 0 && !suppressCursorCreation) {
        initialLine = Math.max(parseInt(initialLine) || 0, 0);
        initialColumn = Math.max(parseInt(initialColumn) || 0, 0);
        this.addCursorAtBufferPosition([initialLine, initialColumn]);
      }
      this.languageMode = new LanguageMode(this);
      this.subscribe(this.$scrollTop, (function(_this) {
        return function(scrollTop) {
          return _this.emit('scroll-top-changed', scrollTop);
        };
      })(this));
      this.subscribe(this.$scrollLeft, (function(_this) {
        return function(scrollLeft) {
          return _this.emit('scroll-left-changed', scrollLeft);
        };
      })(this));
      if (registerEditor) {
        if ((ref5 = atom.workspace) != null) {
          ref5.editorAdded(this);
        }
      }
    }

    Editor.prototype.serializeParams = function() {
      return {
        id: this.id,
        softTabs: this.softTabs,
        scrollTop: this.scrollTop,
        scrollLeft: this.scrollLeft,
        displayBuffer: this.displayBuffer.serialize()
      };
    };

    Editor.prototype.deserializeParams = function(params) {
      params.displayBuffer = DisplayBuffer.deserialize(params.displayBuffer);
      params.registerEditor = true;
      return params;
    };

    Editor.prototype.subscribeToBuffer = function() {
      this.buffer.retain();
      this.subscribe(this.buffer, "path-changed", (function(_this) {
        return function() {
          if (atom.project.getPath() == null) {
            atom.project.setPath(path.dirname(_this.getPath()));
          }
          _this.emit("title-changed");
          return _this.emit("path-changed");
        };
      })(this));
      this.subscribe(this.buffer, "contents-modified", (function(_this) {
        return function() {
          return _this.emit("contents-modified");
        };
      })(this));
      this.subscribe(this.buffer, "contents-conflicted", (function(_this) {
        return function() {
          return _this.emit("contents-conflicted");
        };
      })(this));
      this.subscribe(this.buffer, "modified-status-changed", (function(_this) {
        return function() {
          return _this.emit("modified-status-changed");
        };
      })(this));
      this.subscribe(this.buffer, "destroyed", (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
      return this.preserveCursorPositionOnBufferReload();
    };

    Editor.prototype.subscribeToDisplayBuffer = function() {
      this.subscribe(this.displayBuffer, 'marker-created', this.handleMarkerCreated);
      this.subscribe(this.displayBuffer, "changed", (function(_this) {
        return function(e) {
          return _this.emit('screen-lines-changed', e);
        };
      })(this));
      this.subscribe(this.displayBuffer, "markers-updated", (function(_this) {
        return function() {
          return _this.mergeIntersectingSelections();
        };
      })(this));
      this.subscribe(this.displayBuffer, 'grammar-changed', (function(_this) {
        return function() {
          return _this.handleGrammarChange();
        };
      })(this));
      return this.subscribe(this.displayBuffer, 'soft-wrap-changed', (function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return _this.emit.apply(_this, ['soft-wrap-changed'].concat(slice.call(args)));
        };
      })(this));
    };

    Editor.prototype.getViewClass = function() {
      if (atom.config.get('core.useReactEditor')) {
        return require('./react-editor-view');
      } else {
        return require('./editor-view');
      }
    };

    Editor.prototype.destroyed = function() {
      var j, len, ref1, selection;
      this.unsubscribe();
      ref1 = this.getSelections();
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        selection.destroy();
      }
      this.buffer.release();
      this.displayBuffer.destroy();
      return this.languageMode.destroy();
    };

    Editor.prototype.copy = function() {
      var displayBuffer, j, len, marker, newEditor, ref1, softTabs, tabLength;
      tabLength = this.getTabLength();
      displayBuffer = this.displayBuffer.copy();
      softTabs = this.getSoftTabs();
      newEditor = new Editor({
        buffer: this.buffer,
        displayBuffer: displayBuffer,
        tabLength: tabLength,
        softTabs: softTabs,
        suppressCursorCreation: true,
        registerEditor: true
      });
      ref1 = this.findMarkers({
        editorId: this.id
      });
      for (j = 0, len = ref1.length; j < len; j++) {
        marker = ref1[j];
        marker.copy({
          editorId: newEditor.id,
          preserveFolds: true
        });
      }
      return newEditor;
    };

    Editor.prototype.getTitle = function() {
      var sessionPath;
      if (sessionPath = this.getPath()) {
        return path.basename(sessionPath);
      } else {
        return 'untitled';
      }
    };

    Editor.prototype.getLongTitle = function() {
      var directory, fileName, sessionPath;
      if (sessionPath = this.getPath()) {
        fileName = path.basename(sessionPath);
        directory = path.basename(path.dirname(sessionPath));
        return fileName + " - " + directory;
      } else {
        return 'untitled';
      }
    };

    Editor.prototype.setVisible = function(visible) {
      return this.displayBuffer.setVisible(visible);
    };

    Editor.prototype.setEditorWidthInChars = function(editorWidthInChars) {
      return this.displayBuffer.setEditorWidthInChars(editorWidthInChars);
    };

    Editor.prototype.getSoftWrapColumn = function() {
      return this.displayBuffer.getSoftWrapColumn();
    };

    Editor.prototype.getSoftTabs = function() {
      return this.softTabs;
    };

    Editor.prototype.setSoftTabs = function(softTabs1) {
      this.softTabs = softTabs1;
      return this.softTabs;
    };

    Editor.prototype.toggleSoftTabs = function() {
      return this.setSoftTabs(!this.getSoftTabs());
    };

    Editor.prototype.getSoftWrap = function() {
      return this.displayBuffer.getSoftWrap();
    };

    Editor.prototype.setSoftWrap = function(softWrap) {
      return this.displayBuffer.setSoftWrap(softWrap);
    };

    Editor.prototype.toggleSoftWrap = function() {
      return this.setSoftWrap(!this.getSoftWrap());
    };

    Editor.prototype.getTabText = function() {
      return this.buildIndentString(1);
    };

    Editor.prototype.getTabLength = function() {
      return this.displayBuffer.getTabLength();
    };

    Editor.prototype.setTabLength = function(tabLength) {
      return this.displayBuffer.setTabLength(tabLength);
    };

    Editor.prototype.clipBufferPosition = function(bufferPosition) {
      return this.buffer.clipPosition(bufferPosition);
    };

    Editor.prototype.clipBufferRange = function(range) {
      return this.buffer.clipRange(range);
    };

    Editor.prototype.indentationForBufferRow = function(bufferRow) {
      return this.indentLevelForLine(this.lineForBufferRow(bufferRow));
    };

    Editor.prototype.setIndentationForBufferRow = function(bufferRow, newLevel, arg) {
      var endColumn, newIndentString, preserveLeadingWhitespace;
      preserveLeadingWhitespace = (arg != null ? arg : {}).preserveLeadingWhitespace;
      if (preserveLeadingWhitespace) {
        endColumn = 0;
      } else {
        endColumn = this.lineForBufferRow(bufferRow).match(/^\s*/)[0].length;
      }
      newIndentString = this.buildIndentString(newLevel);
      return this.buffer.setTextInRange([[bufferRow, 0], [bufferRow, endColumn]], newIndentString);
    };

    Editor.prototype.indentLevelForLine = function(line) {
      return this.displayBuffer.indentLevelForLine(line);
    };

    Editor.prototype.buildIndentString = function(number) {
      if (this.getSoftTabs()) {
        return _.multiplyString(" ", Math.floor(number * this.getTabLength()));
      } else {
        return _.multiplyString("\t", Math.floor(number));
      }
    };

    Editor.prototype.save = function() {
      return this.buffer.save();
    };

    Editor.prototype.saveAs = function(filePath) {
      return this.buffer.saveAs(filePath);
    };

    Editor.prototype.checkoutHead = function() {
      var filePath, ref1;
      if (filePath = this.getPath()) {
        return (ref1 = atom.project.getRepo()) != null ? ref1.checkoutHead(filePath) : void 0;
      }
    };

    Editor.prototype.copyPathToClipboard = function() {
      var filePath;
      if (filePath = this.getPath()) {
        return atom.clipboard.write(filePath);
      }
    };

    Editor.prototype.getPath = function() {
      return this.buffer.getPath();
    };

    Editor.prototype.getText = function() {
      return this.buffer.getText();
    };

    Editor.prototype.setText = function(text) {
      return this.buffer.setText(text);
    };

    Editor.prototype.getTextInRange = function(range) {
      return this.buffer.getTextInRange(range);
    };

    Editor.prototype.getLineCount = function() {
      return this.buffer.getLineCount();
    };

    Editor.prototype.getBuffer = function() {
      return this.buffer;
    };

    Editor.prototype.getUri = function() {
      return this.buffer.getUri();
    };

    Editor.prototype.isBufferRowBlank = function(bufferRow) {
      return this.buffer.isRowBlank(bufferRow);
    };

    Editor.prototype.isBufferRowCommented = function(bufferRow) {
      var match, scopes;
      if (match = this.lineForBufferRow(bufferRow).match(/\S/)) {
        scopes = this.tokenForBufferPosition([bufferRow, match.index]).scopes;
        return new TextMateScopeSelector('comment.*').matches(scopes);
      }
    };

    Editor.prototype.nextNonBlankBufferRow = function(bufferRow) {
      return this.buffer.nextNonBlankRow(bufferRow);
    };

    Editor.prototype.getEofBufferPosition = function() {
      return this.buffer.getEndPosition();
    };

    Editor.prototype.getLastBufferRow = function() {
      return this.buffer.getLastRow();
    };

    Editor.prototype.bufferRangeForBufferRow = function(row, arg) {
      var includeNewline;
      includeNewline = (arg != null ? arg : {}).includeNewline;
      return this.buffer.rangeForRow(row, includeNewline);
    };

    Editor.prototype.lineForBufferRow = function(row) {
      return this.buffer.lineForRow(row);
    };

    Editor.prototype.lineLengthForBufferRow = function(row) {
      return this.buffer.lineLengthForRow(row);
    };

    Editor.prototype.scan = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.buffer).scan.apply(ref1, args);
    };

    Editor.prototype.scanInBufferRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.buffer).scanInRange.apply(ref1, args);
    };

    Editor.prototype.backwardsScanInBufferRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.buffer).backwardsScanInRange.apply(ref1, args);
    };

    Editor.prototype.isModified = function() {
      return this.buffer.isModified();
    };

    Editor.prototype.shouldPromptToSave = function() {
      return this.isModified() && !this.buffer.hasMultipleEditors();
    };

    Editor.prototype.screenPositionForBufferPosition = function(bufferPosition, options) {
      return this.displayBuffer.screenPositionForBufferPosition(bufferPosition, options);
    };

    Editor.prototype.bufferPositionForScreenPosition = function(screenPosition, options) {
      return this.displayBuffer.bufferPositionForScreenPosition(screenPosition, options);
    };

    Editor.prototype.screenRangeForBufferRange = function(bufferRange) {
      return this.displayBuffer.screenRangeForBufferRange(bufferRange);
    };

    Editor.prototype.bufferRangeForScreenRange = function(screenRange) {
      return this.displayBuffer.bufferRangeForScreenRange(screenRange);
    };

    Editor.prototype.clipScreenPosition = function(screenPosition, options) {
      return this.displayBuffer.clipScreenPosition(screenPosition, options);
    };

    Editor.prototype.lineForScreenRow = function(row) {
      return this.displayBuffer.lineForRow(row);
    };

    Editor.prototype.linesForScreenRows = function(start, end) {
      return this.displayBuffer.linesForRows(start, end);
    };

    Editor.prototype.getScreenLineCount = function() {
      return this.displayBuffer.getLineCount();
    };

    Editor.prototype.getMaxScreenLineLength = function() {
      return this.displayBuffer.getMaxLineLength();
    };

    Editor.prototype.getLastScreenRow = function() {
      return this.displayBuffer.getLastRow();
    };

    Editor.prototype.bufferRowsForScreenRows = function(startRow, endRow) {
      return this.displayBuffer.bufferRowsForScreenRows(startRow, endRow);
    };

    Editor.prototype.bufferRowForScreenRow = function(row) {
      return this.displayBuffer.bufferRowForScreenRow(row);
    };

    Editor.prototype.scopesForBufferPosition = function(bufferPosition) {
      return this.displayBuffer.scopesForBufferPosition(bufferPosition);
    };

    Editor.prototype.bufferRangeForScopeAtCursor = function(selector) {
      return this.displayBuffer.bufferRangeForScopeAtPosition(selector, this.getCursorBufferPosition());
    };

    Editor.prototype.tokenForBufferPosition = function(bufferPosition) {
      return this.displayBuffer.tokenForBufferPosition(bufferPosition);
    };

    Editor.prototype.getCursorScopes = function() {
      return this.getCursor().getScopes();
    };

    Editor.prototype.logCursorScope = function() {
      return console.log(this.getCursorScopes());
    };

    Editor.prototype.insertText = function(text, options) {
      if (options == null) {
        options = {};
      }
      if (options.autoIndentNewline == null) {
        options.autoIndentNewline = this.shouldAutoIndent();
      }
      if (options.autoDecreaseIndent == null) {
        options.autoDecreaseIndent = this.shouldAutoIndent();
      }
      return this.mutateSelectedText(function(selection) {
        return selection.insertText(text, options);
      });
    };

    Editor.prototype.insertNewline = function() {
      return this.insertText('\n');
    };

    Editor.prototype.insertNewlineBelow = function() {
      return this.transact((function(_this) {
        return function() {
          _this.moveCursorToEndOfLine();
          return _this.insertNewline();
        };
      })(this));
    };

    Editor.prototype.insertNewlineAbove = function() {
      return this.transact((function(_this) {
        return function() {
          var bufferRow, indentLevel, onFirstLine;
          bufferRow = _this.getCursorBufferPosition().row;
          indentLevel = _this.indentationForBufferRow(bufferRow);
          onFirstLine = bufferRow === 0;
          _this.moveCursorToBeginningOfLine();
          _this.moveCursorLeft();
          _this.insertNewline();
          if (_this.shouldAutoIndent() && _this.indentationForBufferRow(bufferRow) < indentLevel) {
            _this.setIndentationForBufferRow(bufferRow, indentLevel);
          }
          if (onFirstLine) {
            _this.moveCursorUp();
            return _this.moveCursorToEndOfLine();
          }
        };
      })(this));
    };

    Editor.prototype.indent = function(options) {
      if (options == null) {
        options = {};
      }
      if (options.autoIndent == null) {
        options.autoIndent = this.shouldAutoIndent();
      }
      return this.mutateSelectedText(function(selection) {
        return selection.indent(options);
      });
    };

    Editor.prototype.backspace = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.backspace();
      });
    };

    Editor.prototype.backspaceToBeginningOfWord = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.backspaceToBeginningOfWord();
      });
    };

    Editor.prototype.backspaceToBeginningOfLine = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.backspaceToBeginningOfLine();
      });
    };

    Editor.prototype["delete"] = function() {
      return this.mutateSelectedText(function(selection) {
        return selection["delete"]();
      });
    };

    Editor.prototype.deleteToEndOfWord = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.deleteToEndOfWord();
      });
    };

    Editor.prototype.deleteLine = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.deleteLine();
      });
    };

    Editor.prototype.indentSelectedRows = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.indentSelectedRows();
      });
    };

    Editor.prototype.outdentSelectedRows = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.outdentSelectedRows();
      });
    };

    Editor.prototype.toggleLineCommentsInSelection = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.toggleLineComments();
      });
    };

    Editor.prototype.autoIndentSelectedRows = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.autoIndentSelectedRows();
      });
    };

    Editor.prototype.normalizeTabsInBufferRange = function(bufferRange) {
      if (!this.getSoftTabs()) {
        return;
      }
      return this.scanInBufferRange(/\t/g, bufferRange, (function(_this) {
        return function(arg) {
          var replace;
          replace = arg.replace;
          return replace(_this.getTabText());
        };
      })(this));
    };

    Editor.prototype.cutToEndOfLine = function() {
      var maintainClipboard;
      maintainClipboard = false;
      return this.mutateSelectedText(function(selection) {
        selection.cutToEndOfLine(maintainClipboard);
        return maintainClipboard = true;
      });
    };

    Editor.prototype.cutSelectedText = function() {
      var maintainClipboard;
      maintainClipboard = false;
      return this.mutateSelectedText(function(selection) {
        selection.cut(maintainClipboard);
        return maintainClipboard = true;
      });
    };

    Editor.prototype.copySelectedText = function() {
      var j, len, maintainClipboard, ref1, results, selection;
      maintainClipboard = false;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        selection.copy(maintainClipboard);
        results.push(maintainClipboard = true);
      }
      return results;
    };

    Editor.prototype.pasteText = function(options) {
      var containsNewlines, metadata, ref1, text;
      if (options == null) {
        options = {};
      }
      ref1 = atom.clipboard.readWithMetadata(), text = ref1.text, metadata = ref1.metadata;
      containsNewlines = text.indexOf('\n') !== -1;
      if (((metadata != null ? metadata.selections : void 0) != null) && metadata.selections.length === this.getSelections().length) {
        this.mutateSelectedText((function(_this) {
          return function(selection, index) {
            text = metadata.selections[index];
            return selection.insertText(text, options);
          };
        })(this));
        return;
      } else if (atom.config.get("editor.normalizeIndentOnPaste") && ((metadata != null ? metadata.indentBasis : void 0) != null)) {
        if (!this.getCursor().hasPrecedingCharactersOnLine() || containsNewlines) {
          if (options.indentBasis == null) {
            options.indentBasis = metadata.indentBasis;
          }
        }
      }
      return this.insertText(text, options);
    };

    Editor.prototype.undo = function() {
      this.getCursor().needsAutoscroll = true;
      return this.buffer.undo(this);
    };

    Editor.prototype.redo = function() {
      this.getCursor().needsAutoscroll = true;
      return this.buffer.redo(this);
    };

    Editor.prototype.foldCurrentRow = function() {
      var bufferRow;
      bufferRow = this.bufferPositionForScreenPosition(this.getCursorScreenPosition()).row;
      return this.foldBufferRow(bufferRow);
    };

    Editor.prototype.unfoldCurrentRow = function() {
      var bufferRow;
      bufferRow = this.bufferPositionForScreenPosition(this.getCursorScreenPosition()).row;
      return this.unfoldBufferRow(bufferRow);
    };

    Editor.prototype.foldSelectedLines = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.fold());
      }
      return results;
    };

    Editor.prototype.foldAll = function() {
      return this.languageMode.foldAll();
    };

    Editor.prototype.unfoldAll = function() {
      return this.languageMode.unfoldAll();
    };

    Editor.prototype.foldAllAtIndentLevel = function(level) {
      return this.languageMode.foldAllAtIndentLevel(level);
    };

    Editor.prototype.foldBufferRow = function(bufferRow) {
      return this.languageMode.foldBufferRow(bufferRow);
    };

    Editor.prototype.unfoldBufferRow = function(bufferRow) {
      return this.displayBuffer.unfoldBufferRow(bufferRow);
    };

    Editor.prototype.isFoldableAtBufferRow = function(bufferRow) {
      return this.languageMode.isFoldableAtBufferRow(bufferRow);
    };

    Editor.prototype.createFold = function(startRow, endRow) {
      return this.displayBuffer.createFold(startRow, endRow);
    };

    Editor.prototype.destroyFoldWithId = function(id) {
      return this.displayBuffer.destroyFoldWithId(id);
    };

    Editor.prototype.destroyFoldsIntersectingBufferRange = function(bufferRange) {
      var j, ref1, ref2, results, row;
      results = [];
      for (row = j = ref1 = bufferRange.start.row, ref2 = bufferRange.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; row = ref1 <= ref2 ? ++j : --j) {
        results.push(this.unfoldBufferRow(row));
      }
      return results;
    };

    Editor.prototype.toggleFoldAtBufferRow = function(bufferRow) {
      if (this.isFoldedAtBufferRow(bufferRow)) {
        return this.unfoldBufferRow(bufferRow);
      } else {
        return this.foldBufferRow(bufferRow);
      }
    };

    Editor.prototype.isFoldedAtCursorRow = function() {
      return this.isFoldedAtScreenRow(this.getCursorScreenRow());
    };

    Editor.prototype.isFoldedAtBufferRow = function(bufferRow) {
      return this.displayBuffer.isFoldedAtBufferRow(bufferRow);
    };

    Editor.prototype.isFoldedAtScreenRow = function(screenRow) {
      return this.displayBuffer.isFoldedAtScreenRow(screenRow);
    };

    Editor.prototype.largestFoldContainingBufferRow = function(bufferRow) {
      return this.displayBuffer.largestFoldContainingBufferRow(bufferRow);
    };

    Editor.prototype.largestFoldStartingAtScreenRow = function(screenRow) {
      return this.displayBuffer.largestFoldStartingAtScreenRow(screenRow);
    };

    Editor.prototype.outermostFoldsInBufferRowRange = function(startRow, endRow) {
      return this.displayBuffer.outermostFoldsInBufferRowRange(startRow, endRow);
    };

    Editor.prototype.moveLineUp = function() {
      var lastRow, selection;
      selection = this.getSelectedBufferRange();
      if (selection.start.row === 0) {
        return;
      }
      lastRow = this.buffer.getLastRow();
      if (selection.isEmpty() && selection.start.row === lastRow && this.buffer.getLastLine() === '') {
        return;
      }
      return this.transact((function(_this) {
        return function() {
          var bufferRange, endPosition, endRow, fold, foldedRow, foldedRows, insertDelta, insertPosition, j, k, l, len, len1, lines, precedingBufferRow, precedingScreenRow, ref1, ref2, results, row, rows, startRow;
          foldedRows = [];
          rows = (function() {
            results = [];
            for (var j = ref1 = selection.start.row, ref2 = selection.end.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
          if (selection.start.row !== selection.end.row && selection.end.column === 0) {
            if (!_this.isFoldedAtBufferRow(selection.end.row)) {
              rows.pop();
            }
          }
          precedingScreenRow = _this.screenPositionForBufferPosition([selection.start.row]).translate([-1]);
          precedingBufferRow = _this.bufferPositionForScreenPosition(precedingScreenRow).row;
          if (fold = _this.largestFoldContainingBufferRow(precedingBufferRow)) {
            insertDelta = fold.getBufferRange().getRowCount();
          } else {
            insertDelta = 1;
          }
          for (k = 0, len = rows.length; k < len; k++) {
            row = rows[k];
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(row)) {
              bufferRange = fold.getBufferRange();
              startRow = bufferRange.start.row;
              endRow = bufferRange.end.row;
              foldedRows.push(startRow - insertDelta);
            } else {
              startRow = row;
              endRow = row;
            }
            insertPosition = Point.fromObject([startRow - insertDelta]);
            endPosition = Point.min([endRow + 1], _this.buffer.getEndPosition());
            lines = _this.buffer.getTextInRange([[startRow], endPosition]);
            if (endPosition.row === lastRow && endPosition.column > 0 && !_this.buffer.lineEndingForRow(endPosition.row)) {
              lines = lines + "\n";
            }
            _this.buffer.deleteRows(startRow, endRow);
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(insertPosition.row)) {
              _this.unfoldBufferRow(insertPosition.row);
              foldedRows.push(insertPosition.row + endRow - startRow + fold.getBufferRange().getRowCount());
            }
            _this.buffer.insert(insertPosition, lines);
          }
          for (l = 0, len1 = foldedRows.length; l < len1; l++) {
            foldedRow = foldedRows[l];
            if ((0 <= foldedRow && foldedRow <= _this.getLastBufferRow())) {
              _this.foldBufferRow(foldedRow);
            }
          }
          return _this.setSelectedBufferRange(selection.translate([-insertDelta]), {
            preserveFolds: true,
            autoscroll: true
          });
        };
      })(this));
    };

    Editor.prototype.moveLineDown = function() {
      var lastRow, selection;
      selection = this.getSelectedBufferRange();
      lastRow = this.buffer.getLastRow();
      if (selection.end.row === lastRow) {
        return;
      }
      if (selection.end.row === lastRow - 1 && this.buffer.getLastLine() === '') {
        return;
      }
      return this.transact((function(_this) {
        return function() {
          var bufferRange, endPosition, endRow, fold, foldedRow, foldedRows, followingBufferRow, followingScreenRow, insertDelta, insertPosition, j, k, l, len, len1, lines, ref1, ref2, results, row, rows, startRow;
          foldedRows = [];
          rows = (function() {
            results = [];
            for (var j = ref1 = selection.end.row, ref2 = selection.start.row; ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results.push(j); }
            return results;
          }).apply(this);
          if (selection.start.row !== selection.end.row && selection.end.column === 0) {
            if (!_this.isFoldedAtBufferRow(selection.end.row)) {
              rows.shift();
            }
          }
          followingScreenRow = _this.screenPositionForBufferPosition([selection.end.row]).translate([1]);
          followingBufferRow = _this.bufferPositionForScreenPosition(followingScreenRow).row;
          if (fold = _this.largestFoldContainingBufferRow(followingBufferRow)) {
            insertDelta = fold.getBufferRange().getRowCount();
          } else {
            insertDelta = 1;
          }
          for (k = 0, len = rows.length; k < len; k++) {
            row = rows[k];
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(row)) {
              bufferRange = fold.getBufferRange();
              startRow = bufferRange.start.row;
              endRow = bufferRange.end.row;
              foldedRows.push(endRow + insertDelta);
            } else {
              startRow = row;
              endRow = row;
            }
            if (endRow + 1 === lastRow) {
              endPosition = [endRow, _this.buffer.lineLengthForRow(endRow)];
            } else {
              endPosition = [endRow + 1];
            }
            lines = _this.buffer.getTextInRange([[startRow], endPosition]);
            _this.buffer.deleteRows(startRow, endRow);
            insertPosition = Point.min([startRow + insertDelta], _this.buffer.getEndPosition());
            if (insertPosition.row === _this.buffer.getLastRow() && insertPosition.column > 0) {
              lines = "\n" + lines;
            }
            if (fold = _this.displayBuffer.largestFoldStartingAtBufferRow(insertPosition.row)) {
              _this.unfoldBufferRow(insertPosition.row);
              foldedRows.push(insertPosition.row + fold.getBufferRange().getRowCount());
            }
            _this.buffer.insert(insertPosition, lines);
          }
          for (l = 0, len1 = foldedRows.length; l < len1; l++) {
            foldedRow = foldedRows[l];
            if ((0 <= foldedRow && foldedRow <= _this.getLastBufferRow())) {
              _this.foldBufferRow(foldedRow);
            }
          }
          return _this.setSelectedBufferRange(selection.translate([insertDelta]), {
            preserveFolds: true,
            autoscroll: true
          });
        };
      })(this));
    };

    Editor.prototype.duplicateLines = function() {
      return this.transact((function(_this) {
        return function() {
          var delta, endRow, foldEndRow, foldStartRow, foldedRowRanges, j, len, rangeToDuplicate, ref1, ref2, results, selectedBufferRange, selection, start, startRow, textToDuplicate;
          ref1 = _this.getSelectionsOrderedByBufferPosition().reverse();
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            selection = ref1[j];
            selectedBufferRange = selection.getBufferRange();
            if (selection.isEmpty()) {
              start = selection.getScreenRange().start;
              selection.selectToScreenPosition([start.row + 1, 0]);
            }
            ref2 = selection.getBufferRowRange(), startRow = ref2[0], endRow = ref2[1];
            endRow++;
            foldedRowRanges = _this.outermostFoldsInBufferRowRange(startRow, endRow).map(function(fold) {
              return fold.getBufferRowRange();
            });
            rangeToDuplicate = [[startRow, 0], [endRow, 0]];
            textToDuplicate = _this.getTextInBufferRange(rangeToDuplicate);
            if (endRow > _this.getLastBufferRow()) {
              textToDuplicate = '\n' + textToDuplicate;
            }
            _this.buffer.insert([endRow, 0], textToDuplicate);
            delta = endRow - startRow;
            selection.setBufferRange(selectedBufferRange.translate([delta, 0]));
            results.push((function() {
              var k, len1, ref3, results1;
              results1 = [];
              for (k = 0, len1 = foldedRowRanges.length; k < len1; k++) {
                ref3 = foldedRowRanges[k], foldStartRow = ref3[0], foldEndRow = ref3[1];
                results1.push(this.createFold(foldStartRow + delta, foldEndRow + delta));
              }
              return results1;
            }).call(_this));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.duplicateLine = function() {
      deprecate("Use Editor::duplicateLines() instead");
      return this.duplicateLines();
    };

    Editor.prototype.mutateSelectedText = function(fn) {
      return this.transact((function(_this) {
        return function() {
          var index, j, len, ref1, results, selection;
          ref1 = _this.getSelections();
          results = [];
          for (index = j = 0, len = ref1.length; j < len; index = ++j) {
            selection = ref1[index];
            results.push(fn(selection, index));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.replaceSelectedText = function(options, fn) {
      var selectWordIfEmpty;
      if (options == null) {
        options = {};
      }
      selectWordIfEmpty = options.selectWordIfEmpty;
      return this.mutateSelectedText(function(selection) {
        var range, text;
        range = selection.getBufferRange();
        if (selectWordIfEmpty && selection.isEmpty()) {
          selection.selectWord();
        }
        text = selection.getText();
        selection.deleteSelectedText();
        selection.insertText(fn(text));
        return selection.setBufferRange(range);
      });
    };

    Editor.prototype.getMarker = function(id) {
      return this.displayBuffer.getMarker(id);
    };

    Editor.prototype.getMarkers = function() {
      return this.displayBuffer.getMarkers();
    };

    Editor.prototype.findMarkers = function(properties) {
      return this.displayBuffer.findMarkers(properties);
    };

    Editor.prototype.markScreenRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markScreenRange.apply(ref1, args);
    };

    Editor.prototype.markBufferRange = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markBufferRange.apply(ref1, args);
    };

    Editor.prototype.markScreenPosition = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markScreenPosition.apply(ref1, args);
    };

    Editor.prototype.markBufferPosition = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).markBufferPosition.apply(ref1, args);
    };

    Editor.prototype.destroyMarker = function() {
      var args, ref1;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref1 = this.displayBuffer).destroyMarker.apply(ref1, args);
    };

    Editor.prototype.getMarkerCount = function() {
      return this.buffer.getMarkerCount();
    };

    Editor.prototype.hasMultipleCursors = function() {
      return this.getCursors().length > 1;
    };

    Editor.prototype.getCursors = function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Array, this.cursors, function(){});
    };

    Editor.prototype.getCursor = function() {
      return _.last(this.cursors);
    };

    Editor.prototype.addCursorAtScreenPosition = function(screenPosition) {
      this.markScreenPosition(screenPosition, this.getSelectionMarkerAttributes());
      return this.getLastSelection().cursor;
    };

    Editor.prototype.addCursorAtBufferPosition = function(bufferPosition) {
      this.markBufferPosition(bufferPosition, this.getSelectionMarkerAttributes());
      return this.getLastSelection().cursor;
    };

    Editor.prototype.addCursor = function(marker) {
      var cursor;
      cursor = new Cursor({
        editor: this,
        marker: marker
      });
      this.cursors.push(cursor);
      this.emit('cursor-added', cursor);
      return cursor;
    };

    Editor.prototype.removeCursor = function(cursor) {
      return _.remove(this.cursors, cursor);
    };

    Editor.prototype.addSelection = function(marker, options) {
      var cursor, j, len, ref1, selection, selectionBufferRange;
      if (options == null) {
        options = {};
      }
      if (!marker.getAttributes().preserveFolds) {
        this.destroyFoldsIntersectingBufferRange(marker.getBufferRange());
      }
      cursor = this.addCursor(marker);
      selection = new Selection(_.extend({
        editor: this,
        marker: marker,
        cursor: cursor
      }, options));
      this.selections.push(selection);
      selectionBufferRange = selection.getBufferRange();
      this.mergeIntersectingSelections();
      if (selection.destroyed) {
        ref1 = this.getSelections();
        for (j = 0, len = ref1.length; j < len; j++) {
          selection = ref1[j];
          if (selection.intersectsBufferRange(selectionBufferRange)) {
            return selection;
          }
        }
      } else {
        this.emit('selection-added', selection);
        return selection;
      }
    };

    Editor.prototype.addSelectionForBufferRange = function(bufferRange, options) {
      if (options == null) {
        options = {};
      }
      this.markBufferRange(bufferRange, _.defaults(this.getSelectionMarkerAttributes(), options));
      return this.getLastSelection();
    };

    Editor.prototype.setSelectedBufferRange = function(bufferRange, options) {
      return this.setSelectedBufferRanges([bufferRange], options);
    };

    Editor.prototype.setSelectedScreenRange = function(screenRange, options) {
      return this.setSelectedBufferRange(this.bufferRangeForScreenRange(screenRange, options), options);
    };

    Editor.prototype.setSelectedBufferRanges = function(bufferRanges, options) {
      var j, len, ref1, selection, selections;
      if (options == null) {
        options = {};
      }
      if (!bufferRanges.length) {
        throw new Error("Passed an empty array to setSelectedBufferRanges");
      }
      selections = this.getSelections();
      ref1 = selections.slice(bufferRanges.length);
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        selection.destroy();
      }
      return this.mergeIntersectingSelections(options, (function(_this) {
        return function() {
          var bufferRange, i, k, len1, results;
          results = [];
          for (i = k = 0, len1 = bufferRanges.length; k < len1; i = ++k) {
            bufferRange = bufferRanges[i];
            bufferRange = Range.fromObject(bufferRange);
            if (selections[i]) {
              results.push(selections[i].setBufferRange(bufferRange, options));
            } else {
              results.push(_this.addSelectionForBufferRange(bufferRange, options));
            }
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.removeSelection = function(selection) {
      _.remove(this.selections, selection);
      return this.emit('selection-removed', selection);
    };

    Editor.prototype.clearSelections = function() {
      this.consolidateSelections();
      return this.getSelection().clear();
    };

    Editor.prototype.consolidateSelections = function() {
      var j, len, ref1, selection, selections;
      selections = this.getSelections();
      if (selections.length > 1) {
        ref1 = selections.slice(0, -1);
        for (j = 0, len = ref1.length; j < len; j++) {
          selection = ref1[j];
          selection.destroy();
        }
        return true;
      } else {
        return false;
      }
    };

    Editor.prototype.selectionScreenRangeChanged = function(selection) {
      return this.emit('selection-screen-range-changed', selection);
    };

    Editor.prototype.getSelections = function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(Array, this.selections, function(){});
    };

    Editor.prototype.getSelection = function(index) {
      if (index == null) {
        index = this.selections.length - 1;
      }
      return this.selections[index];
    };

    Editor.prototype.getLastSelection = function() {
      return _.last(this.selections);
    };

    Editor.prototype.getSelectionsOrderedByBufferPosition = function() {
      return this.getSelections().sort(function(a, b) {
        return a.compare(b);
      });
    };

    Editor.prototype.getLastSelectionInBuffer = function() {
      return _.last(this.getSelectionsOrderedByBufferPosition());
    };

    Editor.prototype.selectionIntersectsBufferRange = function(bufferRange) {
      return _.any(this.getSelections(), function(selection) {
        return selection.intersectsBufferRange(bufferRange);
      });
    };

    Editor.prototype.setCursorScreenPosition = function(position, options) {
      return this.moveCursors(function(cursor) {
        return cursor.setScreenPosition(position, options);
      });
    };

    Editor.prototype.getCursorScreenPosition = function() {
      return this.getCursor().getScreenPosition();
    };

    Editor.prototype.getCursorScreenRow = function() {
      return this.getCursor().getScreenRow();
    };

    Editor.prototype.setCursorBufferPosition = function(position, options) {
      return this.moveCursors(function(cursor) {
        return cursor.setBufferPosition(position, options);
      });
    };

    Editor.prototype.getCursorBufferPosition = function() {
      return this.getCursor().getBufferPosition();
    };

    Editor.prototype.getSelectedScreenRange = function() {
      return this.getLastSelection().getScreenRange();
    };

    Editor.prototype.getSelectedBufferRange = function() {
      return this.getLastSelection().getBufferRange();
    };

    Editor.prototype.getSelectedBufferRanges = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelectionsOrderedByBufferPosition();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.getBufferRange());
      }
      return results;
    };

    Editor.prototype.getSelectedScreenRanges = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelectionsOrderedByBufferPosition();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.getScreenRange());
      }
      return results;
    };

    Editor.prototype.getSelectedText = function() {
      return this.getLastSelection().getText();
    };

    Editor.prototype.getTextInBufferRange = function(range) {
      return this.buffer.getTextInRange(range);
    };

    Editor.prototype.setTextInBufferRange = function(range, text) {
      return this.getBuffer().setTextInRange(range, text);
    };

    Editor.prototype.getCurrentParagraphBufferRange = function() {
      return this.getCursor().getCurrentParagraphBufferRange();
    };

    Editor.prototype.getWordUnderCursor = function(options) {
      return this.getTextInBufferRange(this.getCursor().getCurrentWordBufferRange(options));
    };

    Editor.prototype.moveCursorUp = function(lineCount) {
      return this.moveCursors(function(cursor) {
        return cursor.moveUp(lineCount, {
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorDown = function(lineCount) {
      return this.moveCursors(function(cursor) {
        return cursor.moveDown(lineCount, {
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorLeft = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveLeft({
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorRight = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveRight({
          moveToEndOfSelection: true
        });
      });
    };

    Editor.prototype.moveCursorToTop = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToTop();
      });
    };

    Editor.prototype.moveCursorToBottom = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBottom();
      });
    };

    Editor.prototype.moveCursorToBeginningOfScreenLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfScreenLine();
      });
    };

    Editor.prototype.moveCursorToBeginningOfLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfLine();
      });
    };

    Editor.prototype.moveCursorToFirstCharacterOfLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToFirstCharacterOfLine();
      });
    };

    Editor.prototype.moveCursorToEndOfScreenLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToEndOfScreenLine();
      });
    };

    Editor.prototype.moveCursorToEndOfLine = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToEndOfLine();
      });
    };

    Editor.prototype.moveCursorToBeginningOfWord = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfWord();
      });
    };

    Editor.prototype.moveCursorToEndOfWord = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToEndOfWord();
      });
    };

    Editor.prototype.moveCursorToBeginningOfNextWord = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToBeginningOfNextWord();
      });
    };

    Editor.prototype.moveCursorToPreviousWordBoundary = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToPreviousWordBoundary();
      });
    };

    Editor.prototype.moveCursorToNextWordBoundary = function() {
      return this.moveCursors(function(cursor) {
        return cursor.moveToNextWordBoundary();
      });
    };

    Editor.prototype.scrollToCursorPosition = function() {
      return this.getCursor().autoscroll();
    };

    Editor.prototype.pageUp = function() {
      return this.setScrollTop(this.getScrollTop() - this.getHeight());
    };

    Editor.prototype.pageDown = function() {
      return this.setScrollTop(this.getScrollTop() + this.getHeight());
    };

    Editor.prototype.moveCursors = function(fn) {
      this.movingCursors = true;
      return this.batchUpdates((function(_this) {
        return function() {
          var cursor, j, len, ref1;
          ref1 = _this.getCursors();
          for (j = 0, len = ref1.length; j < len; j++) {
            cursor = ref1[j];
            fn(cursor);
          }
          _this.mergeCursors();
          _this.movingCursors = false;
          return _this.emit('cursors-moved');
        };
      })(this));
    };

    Editor.prototype.cursorMoved = function(event) {
      this.emit('cursor-moved', event);
      if (!this.movingCursors) {
        return this.emit('cursors-moved');
      }
    };

    Editor.prototype.selectToScreenPosition = function(position) {
      var lastSelection;
      lastSelection = this.getLastSelection();
      lastSelection.selectToScreenPosition(position);
      return this.mergeIntersectingSelections({
        reversed: lastSelection.isReversed()
      });
    };

    Editor.prototype.selectRight = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectRight();
        };
      })(this));
    };

    Editor.prototype.selectLeft = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectLeft();
        };
      })(this));
    };

    Editor.prototype.selectUp = function(rowCount) {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectUp(rowCount);
        };
      })(this));
    };

    Editor.prototype.selectDown = function(rowCount) {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectDown(rowCount);
        };
      })(this));
    };

    Editor.prototype.selectToTop = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToTop();
        };
      })(this));
    };

    Editor.prototype.selectAll = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectAll();
        };
      })(this));
    };

    Editor.prototype.selectToBottom = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToBottom();
        };
      })(this));
    };

    Editor.prototype.selectToBeginningOfLine = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToBeginningOfLine();
        };
      })(this));
    };

    Editor.prototype.selectToFirstCharacterOfLine = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToFirstCharacterOfLine();
        };
      })(this));
    };

    Editor.prototype.selectToEndOfLine = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToEndOfLine();
        };
      })(this));
    };

    Editor.prototype.selectToPreviousWordBoundary = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToPreviousWordBoundary();
        };
      })(this));
    };

    Editor.prototype.selectToNextWordBoundary = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToNextWordBoundary();
        };
      })(this));
    };

    Editor.prototype.selectLine = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectLine();
        };
      })(this));
    };

    Editor.prototype.addSelectionBelow = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.addSelectionBelow();
        };
      })(this));
    };

    Editor.prototype.addSelectionAbove = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.addSelectionAbove();
        };
      })(this));
    };

    Editor.prototype.splitSelectionsIntoLines = function() {
      var end, j, len, range, ref1, results, row, selection, start;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        range = selection.getBufferRange();
        if (range.isSingleLine()) {
          continue;
        }
        selection.destroy();
        start = range.start, end = range.end;
        this.addSelectionForBufferRange([start, [start.row, 2e308]]);
        row = start.row;
        while (++row < end.row) {
          this.addSelectionForBufferRange([[row, 0], [row, 2e308]]);
        }
        results.push(this.addSelectionForBufferRange([[end.row, 0], [end.row, end.column]]));
      }
      return results;
    };

    Editor.prototype.transpose = function() {
      return this.mutateSelectedText((function(_this) {
        return function(selection) {
          var text;
          if (selection.isEmpty()) {
            selection.selectRight();
            text = selection.getText();
            selection["delete"]();
            selection.cursor.moveLeft();
            return selection.insertText(text);
          } else {
            return selection.insertText(selection.getText().split('').reverse().join(''));
          }
        };
      })(this));
    };

    Editor.prototype.upperCase = function() {
      return this.replaceSelectedText({
        selectWordIfEmpty: true
      }, (function(_this) {
        return function(text) {
          return text.toUpperCase();
        };
      })(this));
    };

    Editor.prototype.lowerCase = function() {
      return this.replaceSelectedText({
        selectWordIfEmpty: true
      }, (function(_this) {
        return function(text) {
          return text.toLowerCase();
        };
      })(this));
    };

    Editor.prototype.joinLines = function() {
      return this.mutateSelectedText(function(selection) {
        return selection.joinLines();
      });
    };

    Editor.prototype.selectToBeginningOfWord = function() {
      return this.expandSelectionsBackward((function(_this) {
        return function(selection) {
          return selection.selectToBeginningOfWord();
        };
      })(this));
    };

    Editor.prototype.selectToEndOfWord = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToEndOfWord();
        };
      })(this));
    };

    Editor.prototype.selectToBeginningOfNextWord = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectToBeginningOfNextWord();
        };
      })(this));
    };

    Editor.prototype.selectWord = function() {
      return this.expandSelectionsForward((function(_this) {
        return function(selection) {
          return selection.selectWord();
        };
      })(this));
    };

    Editor.prototype.selectMarker = function(marker) {
      var range;
      if (marker.isValid()) {
        range = marker.getBufferRange();
        this.setSelectedBufferRange(range);
        return range;
      }
    };

    Editor.prototype.mergeCursors = function() {
      var cursor, j, len, position, positions, ref1, results;
      positions = [];
      ref1 = this.getCursors();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        cursor = ref1[j];
        position = cursor.getBufferPosition().toString();
        if (indexOf.call(positions, position) >= 0) {
          results.push(cursor.destroy());
        } else {
          results.push(positions.push(position));
        }
      }
      return results;
    };

    Editor.prototype.expandSelectionsForward = function(fn) {
      return this.mergeIntersectingSelections((function(_this) {
        return function() {
          var j, len, ref1, results, selection;
          ref1 = _this.getSelections();
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            selection = ref1[j];
            results.push(fn(selection));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.expandSelectionsBackward = function(fn) {
      return this.mergeIntersectingSelections({
        reversed: true
      }, (function(_this) {
        return function() {
          var j, len, ref1, results, selection;
          ref1 = _this.getSelections();
          results = [];
          for (j = 0, len = ref1.length; j < len; j++) {
            selection = ref1[j];
            results.push(fn(selection));
          }
          return results;
        };
      })(this));
    };

    Editor.prototype.finalizeSelections = function() {
      var j, len, ref1, results, selection;
      ref1 = this.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        results.push(selection.finalize());
      }
      return results;
    };

    Editor.prototype.mergeIntersectingSelections = function() {
      var args, fn, options, reducer, ref1, result;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (_.isFunction(_.last(args))) {
        fn = args.pop();
      }
      options = (ref1 = args.pop()) != null ? ref1 : {};
      if (this.suppressSelectionMerging) {
        return typeof fn === "function" ? fn() : void 0;
      }
      if (fn != null) {
        this.suppressSelectionMerging = true;
        result = fn();
        this.suppressSelectionMerging = false;
      }
      reducer = function(disjointSelections, selection) {
        var intersectingSelection;
        intersectingSelection = _.find(disjointSelections, function(s) {
          return s.intersectsWith(selection);
        });
        if (intersectingSelection != null) {
          intersectingSelection.merge(selection, options);
          return disjointSelections;
        } else {
          return disjointSelections.concat([selection]);
        }
      };
      return _.reduce(this.getSelections(), reducer, []);
    };

    Editor.prototype.preserveCursorPositionOnBufferReload = function() {
      var cursorPosition;
      cursorPosition = null;
      this.subscribe(this.buffer, "will-reload", (function(_this) {
        return function() {
          return cursorPosition = _this.getCursorBufferPosition();
        };
      })(this));
      return this.subscribe(this.buffer, "reloaded", (function(_this) {
        return function() {
          if (cursorPosition) {
            _this.setCursorBufferPosition(cursorPosition);
          }
          return cursorPosition = null;
        };
      })(this));
    };

    Editor.prototype.getGrammar = function() {
      return this.displayBuffer.getGrammar();
    };

    Editor.prototype.setGrammar = function(grammar) {
      return this.displayBuffer.setGrammar(grammar);
    };

    Editor.prototype.reloadGrammar = function() {
      return this.displayBuffer.reloadGrammar();
    };

    Editor.prototype.shouldAutoIndent = function() {
      return atom.config.get("editor.autoIndent");
    };

    Editor.prototype.transact = function(fn) {
      return this.batchUpdates((function(_this) {
        return function() {
          return _this.buffer.transact(fn);
        };
      })(this));
    };

    Editor.prototype.beginTransaction = function() {
      return this.buffer.beginTransaction();
    };

    Editor.prototype.commitTransaction = function() {
      return this.buffer.commitTransaction();
    };

    Editor.prototype.abortTransaction = function() {
      return this.buffer.abortTransaction();
    };

    Editor.prototype.batchUpdates = function(fn) {
      var result;
      this.emit('batched-updates-started');
      result = fn();
      this.emit('batched-updates-ended');
      return result;
    };

    Editor.prototype.inspect = function() {
      return "<Editor " + this.id + ">";
    };

    Editor.prototype.logScreenLines = function(start, end) {
      return this.displayBuffer.logLines(start, end);
    };

    Editor.prototype.handleGrammarChange = function() {
      this.unfoldAll();
      return this.emit('grammar-changed');
    };

    Editor.prototype.handleMarkerCreated = function(marker) {
      if (marker.matchesAttributes(this.getSelectionMarkerAttributes())) {
        return this.addSelection(marker);
      }
    };

    Editor.prototype.getSelectionMarkerAttributes = function() {
      return {
        type: 'selection',
        editorId: this.id,
        invalidate: 'never'
      };
    };

    Editor.prototype.getVerticalScrollMargin = function() {
      return this.displayBuffer.getVerticalScrollMargin();
    };

    Editor.prototype.setVerticalScrollMargin = function(verticalScrollMargin) {
      return this.displayBuffer.setVerticalScrollMargin(verticalScrollMargin);
    };

    Editor.prototype.getHorizontalScrollMargin = function() {
      return this.displayBuffer.getHorizontalScrollMargin();
    };

    Editor.prototype.setHorizontalScrollMargin = function(horizontalScrollMargin) {
      return this.displayBuffer.setHorizontalScrollMargin(horizontalScrollMargin);
    };

    Editor.prototype.getLineHeight = function() {
      return this.displayBuffer.getLineHeight();
    };

    Editor.prototype.setLineHeight = function(lineHeight) {
      return this.displayBuffer.setLineHeight(lineHeight);
    };

    Editor.prototype.getScopedCharWidth = function(scopeNames, char) {
      return this.displayBuffer.getScopedCharWidth(scopeNames, char);
    };

    Editor.prototype.setScopedCharWidth = function(scopeNames, char, width) {
      return this.displayBuffer.setScopedCharWidth(scopeNames, char, width);
    };

    Editor.prototype.getScopedCharWidths = function(scopeNames) {
      return this.displayBuffer.getScopedCharWidths(scopeNames);
    };

    Editor.prototype.clearScopedCharWidths = function() {
      return this.displayBuffer.clearScopedCharWidths();
    };

    Editor.prototype.getDefaultCharWidth = function() {
      return this.displayBuffer.getDefaultCharWidth();
    };

    Editor.prototype.setDefaultCharWidth = function(defaultCharWidth) {
      return this.displayBuffer.setDefaultCharWidth(defaultCharWidth);
    };

    Editor.prototype.setHeight = function(height) {
      return this.displayBuffer.setHeight(height);
    };

    Editor.prototype.getHeight = function() {
      return this.displayBuffer.getHeight();
    };

    Editor.prototype.setWidth = function(width) {
      return this.displayBuffer.setWidth(width);
    };

    Editor.prototype.getWidth = function() {
      return this.displayBuffer.getWidth();
    };

    Editor.prototype.getScrollTop = function() {
      return this.displayBuffer.getScrollTop();
    };

    Editor.prototype.setScrollTop = function(scrollTop) {
      return this.displayBuffer.setScrollTop(scrollTop);
    };

    Editor.prototype.getScrollBottom = function() {
      return this.displayBuffer.getScrollBottom();
    };

    Editor.prototype.setScrollBottom = function(scrollBottom) {
      return this.displayBuffer.setScrollBottom(scrollBottom);
    };

    Editor.prototype.getScrollLeft = function() {
      return this.displayBuffer.getScrollLeft();
    };

    Editor.prototype.setScrollLeft = function(scrollLeft) {
      return this.displayBuffer.setScrollLeft(scrollLeft);
    };

    Editor.prototype.getScrollRight = function() {
      return this.displayBuffer.getScrollRight();
    };

    Editor.prototype.setScrollRight = function(scrollRight) {
      return this.displayBuffer.setScrollRight(scrollRight);
    };

    Editor.prototype.getScrollHeight = function() {
      return this.displayBuffer.getScrollHeight();
    };

    Editor.prototype.getScrollWidth = function(scrollWidth) {
      return this.displayBuffer.getScrollWidth(scrollWidth);
    };

    Editor.prototype.getVisibleRowRange = function() {
      return this.displayBuffer.getVisibleRowRange();
    };

    Editor.prototype.intersectsVisibleRowRange = function(startRow, endRow) {
      return this.displayBuffer.intersectsVisibleRowRange(startRow, endRow);
    };

    Editor.prototype.selectionIntersectsVisibleRowRange = function(selection) {
      return this.displayBuffer.selectionIntersectsVisibleRowRange(selection);
    };

    Editor.prototype.pixelPositionForScreenPosition = function(screenPosition) {
      return this.displayBuffer.pixelPositionForScreenPosition(screenPosition);
    };

    Editor.prototype.pixelPositionForBufferPosition = function(bufferPosition) {
      return this.displayBuffer.pixelPositionForBufferPosition(bufferPosition);
    };

    Editor.prototype.screenPositionForPixelPosition = function(pixelPosition) {
      return this.displayBuffer.screenPositionForPixelPosition(pixelPosition);
    };

    Editor.prototype.pixelRectForScreenRange = function(screenRange) {
      return this.displayBuffer.pixelRectForScreenRange(screenRange);
    };

    Editor.prototype.scrollToScreenRange = function(screenRange) {
      return this.displayBuffer.scrollToScreenRange(screenRange);
    };

    Editor.prototype.scrollToScreenPosition = function(screenPosition) {
      return this.displayBuffer.scrollToScreenPosition(screenPosition);
    };

    Editor.prototype.scrollToBufferPosition = function(bufferPosition) {
      return this.displayBuffer.scrollToBufferPosition(bufferPosition);
    };

    Editor.prototype.joinLine = function() {
      deprecate("Use Editor::joinLines() instead");
      return this.joinLines();
    };

    return Editor;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWluaW1hcC9zcGVjL2ZpeHR1cmVzL2xhcmdlLWZpbGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvSkFBQTtJQUFBOzs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGNBQVI7O0VBQ2YsU0FBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSOztFQUNYLFlBQWEsT0FBQSxDQUFRLE1BQVI7O0VBQ2IsUUFBUyxPQUFBLENBQVEsVUFBUjs7RUFDVixNQUFpQixPQUFBLENBQVEsYUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUjs7RUFDaEIsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztFQUVULFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7RUFDWixxQkFBQSxHQUF3QixPQUFBLENBQVEsWUFBUixDQUFxQixDQUFDOztFQXlIOUMsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osWUFBWSxDQUFDLFdBQWIsQ0FBeUIsTUFBekI7O0lBQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixNQUF2Qjs7SUFDQSxTQUFTLENBQUMsV0FBVixDQUFzQixNQUF0Qjs7cUJBRUEsYUFBQSxHQUFlOztxQkFDZiw0QkFBQSxHQUE4Qjs7cUJBQzlCLGNBQUEsR0FBZ0I7O3FCQUNoQixNQUFBLEdBQVE7O3FCQUNSLFlBQUEsR0FBYzs7cUJBQ2QsT0FBQSxHQUFTOztxQkFDVCxVQUFBLEdBQVk7O3FCQUNaLHdCQUFBLEdBQTBCOztJQUUxQixNQUFDLENBQUEsZ0JBQUQsQ0FBa0IsNkJBQWxCLEVBQWlELHFCQUFq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bUMsV0FBbkM7SUFBakI7O3FCQUVyQixzQkFBQSxHQUF3QixTQUFDLGNBQUQ7YUFBb0IsSUFBQyxDQUFBLGFBQWEsQ0FBQyxzQkFBZixDQUFzQyxjQUF0QztJQUFwQjs7cUJBRXhCLHNCQUFBLEdBQXdCLFNBQUMsY0FBRDthQUFvQixJQUFDLENBQUEsYUFBYSxDQUFDLHNCQUFmLENBQXNDLGNBQXRDO0lBQXBCOztxQkFHeEIsUUFBQSxHQUFVLFNBQUE7TUFDUixTQUFBLENBQVUsaUNBQVY7YUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBO0lBRlE7Ozs7S0E3dERTO0FBdElyQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblNlcmlhbGl6YWJsZSA9IHJlcXVpcmUgJ3NlcmlhbGl6YWJsZSdcbkRlbGVnYXRvciA9IHJlcXVpcmUgJ2RlbGVnYXRvJ1xue2RlcHJlY2F0ZX0gPSByZXF1aXJlICdncmltJ1xue01vZGVsfSA9IHJlcXVpcmUgJ3RoZW9yaXN0J1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlICd0ZXh0LWJ1ZmZlcidcbkxhbmd1YWdlTW9kZSA9IHJlcXVpcmUgJy4vbGFuZ3VhZ2UtbW9kZSdcbkRpc3BsYXlCdWZmZXIgPSByZXF1aXJlICcuL2Rpc3BsYXktYnVmZmVyJ1xuQ3Vyc29yID0gcmVxdWlyZSAnLi9jdXJzb3InXG5cblNlbGVjdGlvbiA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uJ1xuVGV4dE1hdGVTY29wZVNlbGVjdG9yID0gcmVxdWlyZSgnZmlyc3QtbWF0ZScpLlNjb3BlU2VsZWN0b3JcblxuIyBQdWJsaWM6IFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhbGwgZXNzZW50aWFsIGVkaXRpbmcgc3RhdGUgZm9yIGEgc2luZ2xlXG4jIHtUZXh0QnVmZmVyfSwgaW5jbHVkaW5nIGN1cnNvciBhbmQgc2VsZWN0aW9uIHBvc2l0aW9ucywgZm9sZHMsIGFuZCBzb2Z0IHdyYXBzLlxuIyBJZiB5b3UncmUgbWFuaXB1bGF0aW5nIHRoZSBzdGF0ZSBvZiBhbiBlZGl0b3IsIHVzZSB0aGlzIGNsYXNzLiBJZiB5b3UncmVcbiMgaW50ZXJlc3RlZCBpbiB0aGUgdmlzdWFsIGFwcGVhcmFuY2Ugb2YgZWRpdG9ycywgdXNlIHtFZGl0b3JWaWV3fSBpbnN0ZWFkLlxuI1xuIyBBIHNpbmdsZSB7VGV4dEJ1ZmZlcn0gY2FuIGJlbG9uZyB0byBtdWx0aXBsZSBlZGl0b3JzLiBGb3IgZXhhbXBsZSwgaWYgdGhlXG4jIHNhbWUgZmlsZSBpcyBvcGVuIGluIHR3byBkaWZmZXJlbnQgcGFuZXMsIEF0b20gY3JlYXRlcyBhIHNlcGFyYXRlIGVkaXRvciBmb3JcbiMgZWFjaCBwYW5lLiBJZiB0aGUgYnVmZmVyIGlzIG1hbmlwdWxhdGVkIHRoZSBjaGFuZ2VzIGFyZSByZWZsZWN0ZWQgaW4gYm90aFxuIyBlZGl0b3JzLCBidXQgZWFjaCBtYWludGFpbnMgaXRzIG93biBjdXJzb3IgcG9zaXRpb24sIGZvbGRlZCBsaW5lcywgZXRjLlxuI1xuIyAjIyBBY2Nlc3NpbmcgRWRpdG9yIEluc3RhbmNlc1xuI1xuIyBUaGUgZWFzaWVzdCB3YXkgdG8gZ2V0IGhvbGQgb2YgYEVkaXRvcmAgb2JqZWN0cyBpcyBieSByZWdpc3RlcmluZyBhIGNhbGxiYWNrXG4jIHdpdGggYDo6ZWFjaEVkaXRvcmAgb24gdGhlIGBhdG9tLndvcmtzcGFjZWAgZ2xvYmFsLiBZb3VyIGNhbGxiYWNrIHdpbGwgdGhlblxuIyBiZSBjYWxsZWQgd2l0aCBhbGwgY3VycmVudCBlZGl0b3IgaW5zdGFuY2VzIGFuZCBhbHNvIHdoZW4gYW55IGVkaXRvciBpc1xuIyBjcmVhdGVkIGluIHRoZSBmdXR1cmUuXG4jXG4jIGBgYGNvZmZlZXNjcmlwdFxuIyAgIGF0b20ud29ya3NwYWNlLmVhY2hFZGl0b3IgKGVkaXRvcikgLT5cbiMgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdIZWxsbyBXb3JsZCcpXG4jIGBgYFxuI1xuIyAjIyBCdWZmZXIgdnMuIFNjcmVlbiBDb29yZGluYXRlc1xuI1xuIyBCZWNhdXNlIGVkaXRvcnMgc3VwcG9ydCBmb2xkcyBhbmQgc29mdC13cmFwcGluZywgdGhlIGxpbmVzIG9uIHNjcmVlbiBkb24ndFxuIyBhbHdheXMgbWF0Y2ggdGhlIGxpbmVzIGluIHRoZSBidWZmZXIuIEZvciBleGFtcGxlLCBhIGxvbmcgbGluZSB0aGF0IHNvZnQgd3JhcHNcbiMgdHdpY2UgcmVuZGVycyBhcyB0aHJlZSBsaW5lcyBvbiBzY3JlZW4sIGJ1dCBvbmx5IHJlcHJlc2VudHMgb25lIGxpbmUgaW4gdGhlXG4jIGJ1ZmZlci4gU2ltaWxhcmx5LCBpZiByb3dzIDUtMTAgYXJlIGZvbGRlZCwgdGhlbiByb3cgNiBvbiBzY3JlZW4gY29ycmVzcG9uZHNcbiMgdG8gcm93IDExIGluIHRoZSBidWZmZXIuXG4jXG4jIFlvdXIgY2hvaWNlIG9mIGNvb3JkaW5hdGVzIHN5c3RlbXMgd2lsbCBkZXBlbmQgb24gd2hhdCB5b3UncmUgdHJ5aW5nIHRvXG4jIGFjaGlldmUuIEZvciBleGFtcGxlLCBpZiB5b3UncmUgd3JpdGluZyBhIGNvbW1hbmQgdGhhdCBqdW1wcyB0aGUgY3Vyc29yIHVwIG9yXG4jIGRvd24gYnkgMTAgbGluZXMsIHlvdSdsbCB3YW50IHRvIHVzZSBzY3JlZW4gY29vcmRpbmF0ZXMgYmVjYXVzZSB0aGUgdXNlclxuIyBwcm9iYWJseSB3YW50cyB0byBza2lwIGxpbmVzICpvbiBzY3JlZW4qLiBIb3dldmVyLCBpZiB5b3UncmUgd3JpdGluZyBhIHBhY2thZ2VcbiMgdGhhdCBqdW1wcyBiZXR3ZWVuIG1ldGhvZCBkZWZpbml0aW9ucywgeW91J2xsIHdhbnQgdG8gd29yayBpbiBidWZmZXJcbiMgY29vcmRpbmF0ZXMuXG4jXG4jICoqV2hlbiBpbiBkb3VidCwganVzdCBkZWZhdWx0IHRvIGJ1ZmZlciBjb29yZGluYXRlcyoqLCB0aGVuIGV4cGVyaW1lbnQgd2l0aFxuIyBzb2Z0IHdyYXBzIGFuZCBmb2xkcyB0byBlbnN1cmUgeW91ciBjb2RlIGludGVyYWN0cyB3aXRoIHRoZW0gY29ycmVjdGx5LlxuI1xuIyAjIyBDb21tb24gVGFza3NcbiNcbiMgVGhpcyBpcyBhIHN1YnNldCBvZiBtZXRob2RzIG9uIHRoaXMgY2xhc3MuIFJlZmVyIHRvIHRoZSBjb21wbGV0ZSBzdW1tYXJ5IGZvclxuIyBpdHMgZnVsbCBjYXBhYmlsaXRpZXMuXG4jXG4jICMjIyBDdXJzb3JzXG4jIC0gezo6c2V0Q3Vyc29yQnVmZmVyUG9zaXRpb259XG4jIC0gezo6c2V0Q3Vyc29yU2NyZWVuUG9zaXRpb259XG4jIC0gezo6bW92ZUN1cnNvclVwfVxuIyAtIHs6Om1vdmVDdXJzb3JEb3dufVxuIyAtIHs6Om1vdmVDdXJzb3JMZWZ0fVxuIyAtIHs6Om1vdmVDdXJzb3JSaWdodH1cbiMgLSB7Ojptb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZldvcmR9XG4jIC0gezo6bW92ZUN1cnNvclRvRW5kT2ZXb3JkfVxuIyAtIHs6Om1vdmVDdXJzb3JUb1ByZXZpb3VzV29yZEJvdW5kYXJ5fVxuIyAtIHs6Om1vdmVDdXJzb3JUb05leHRXb3JkQm91bmRhcnl9XG4jIC0gezo6bW92ZUN1cnNvclRvQmVnaW5uaW5nT2ZOZXh0V29yZH1cbiMgLSB7Ojptb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZkxpbmV9XG4jIC0gezo6bW92ZUN1cnNvclRvRW5kT2ZMaW5lfVxuIyAtIHs6Om1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lfVxuIyAtIHs6Om1vdmVDdXJzb3JUb1RvcH1cbiMgLSB7Ojptb3ZlQ3Vyc29yVG9Cb3R0b219XG4jXG4jICMjIyBTZWxlY3Rpb25zXG4jIC0gezo6Z2V0U2VsZWN0ZWRCdWZmZXJSYW5nZX1cbiMgLSB7OjpnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlc31cbiMgLSB7OjpzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlfVxuIyAtIHs6OnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzfVxuIyAtIHs6OnNlbGVjdFVwfVxuIyAtIHs6OnNlbGVjdERvd259XG4jIC0gezo6c2VsZWN0TGVmdH1cbiMgLSB7OjpzZWxlY3RSaWdodH1cbiMgLSB7OjpzZWxlY3RUb0JlZ2lubmluZ09mV29yZH1cbiMgLSB7OjpzZWxlY3RUb0VuZE9mV29yZH1cbiMgLSB7OjpzZWxlY3RUb1ByZXZpb3VzV29yZEJvdW5kYXJ5fVxuIyAtIHs6OnNlbGVjdFRvTmV4dFdvcmRCb3VuZGFyeX1cbiMgLSB7OjpzZWxlY3RXb3JkfVxuIyAtIHs6OnNlbGVjdFRvQmVnaW5uaW5nT2ZMaW5lfVxuIyAtIHs6OnNlbGVjdFRvRW5kT2ZMaW5lfVxuIyAtIHs6OnNlbGVjdFRvRmlyc3RDaGFyYWN0ZXJPZkxpbmV9XG4jIC0gezo6c2VsZWN0VG9Ub3B9XG4jIC0gezo6c2VsZWN0VG9Cb3R0b219XG4jIC0gezo6c2VsZWN0QWxsfVxuIyAtIHs6OmFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlfVxuIyAtIHs6OmFkZFNlbGVjdGlvbkFib3ZlfVxuIyAtIHs6OmFkZFNlbGVjdGlvbkJlbG93fVxuIyAtIHs6OnNwbGl0U2VsZWN0aW9uc0ludG9MaW5lc31cbiNcbiMgIyMjIE1hbmlwdWxhdGluZyBUZXh0XG4jIC0gezo6Z2V0VGV4dH1cbiMgLSB7OjpnZXRTZWxlY3RlZFRleHR9XG4jIC0gezo6c2V0VGV4dH1cbiMgLSB7OjpzZXRUZXh0SW5CdWZmZXJSYW5nZX1cbiMgLSB7OjppbnNlcnRUZXh0fVxuIyAtIHs6Omluc2VydE5ld2xpbmV9XG4jIC0gezo6aW5zZXJ0TmV3bGluZUFib3ZlfVxuIyAtIHs6Omluc2VydE5ld2xpbmVCZWxvd31cbiMgLSB7OjpiYWNrc3BhY2V9XG4jIC0gezo6YmFja3NwYWNlVG9CZWdpbm5pbmdPZldvcmR9XG4jIC0gezo6YmFja3NwYWNlVG9CZWdpbm5pbmdPZkxpbmV9XG4jIC0gezo6ZGVsZXRlfVxuIyAtIHs6OmRlbGV0ZVRvRW5kT2ZXb3JkfVxuIyAtIHs6OmRlbGV0ZUxpbmV9XG4jIC0gezo6Y3V0U2VsZWN0ZWRUZXh0fVxuIyAtIHs6OmN1dFRvRW5kT2ZMaW5lfVxuIyAtIHs6OmNvcHlTZWxlY3RlZFRleHR9XG4jIC0gezo6cGFzdGVUZXh0fVxuI1xuIyAjIyMgVW5kbywgUmVkbywgYW5kIFRyYW5zYWN0aW9uc1xuIyAtIHs6OnVuZG99XG4jIC0gezo6cmVkb31cbiMgLSB7Ojp0cmFuc2FjdH1cbiMgLSB7OjphYm9ydFRyYW5zYWN0aW9ufVxuI1xuIyAjIyMgTWFya2Vyc1xuIyAtIHs6Om1hcmtCdWZmZXJSYW5nZX1cbiMgLSB7OjptYXJrU2NyZWVuUmFuZ2V9XG4jIC0gezo6Z2V0TWFya2VyfVxuIyAtIHs6OmZpbmRNYXJrZXJzfVxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRWRpdG9yIGV4dGVuZHMgTW9kZWxcbiAgU2VyaWFsaXphYmxlLmluY2x1ZGVJbnRvKHRoaXMpXG4gIGF0b20uZGVzZXJpYWxpemVycy5hZGQodGhpcylcbiAgRGVsZWdhdG9yLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgZGVzZXJpYWxpemluZzogZmFsc2VcbiAgY2FsbERpc3BsYXlCdWZmZXJDcmVhdGVkSG9vazogZmFsc2VcbiAgcmVnaXN0ZXJFZGl0b3I6IGZhbHNlXG4gIGJ1ZmZlcjogbnVsbFxuICBsYW5ndWFnZU1vZGU6IG51bGxcbiAgY3Vyc29yczogbnVsbFxuICBzZWxlY3Rpb25zOiBudWxsXG4gIHN1cHByZXNzU2VsZWN0aW9uTWVyZ2luZzogZmFsc2VcblxuICBAZGVsZWdhdGVzTWV0aG9kcyAnc3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93JywgJ2F1dG9JbmRlbnRCdWZmZXJSb3cnLCAnYXV0b0luZGVudEJ1ZmZlclJvd3MnLFxuICAgICdhdXRvRGVjcmVhc2VJbmRlbnRGb3JCdWZmZXJSb3cnLCAndG9nZ2xlTGluZUNvbW1lbnRGb3JCdWZmZXJSb3cnLCAndG9nZ2xlTGluZUNvbW1lbnRzRm9yQnVmZmVyUm93cycsXG4gICAgdG9Qcm9wZXJ0eTogJ2xhbmd1YWdlTW9kZSdcblxuICBAZGVsZWdhdGVzUHJvcGVydGllcyAnJGxpbmVIZWlnaHQnLCAnJGRlZmF1bHRDaGFyV2lkdGgnLCAnJGhlaWdodCcsICckd2lkdGgnLFxuICAgICckc2Nyb2xsVG9wJywgJyRzY3JvbGxMZWZ0JywgJ21hbmFnZVNjcm9sbFBvc2l0aW9uJywgdG9Qcm9wZXJ0eTogJ2Rpc3BsYXlCdWZmZXInXG5cbiAgY29uc3RydWN0b3I6ICh7QHNvZnRUYWJzLCBpbml0aWFsTGluZSwgaW5pdGlhbENvbHVtbiwgdGFiTGVuZ3RoLCBzb2Z0V3JhcCwgQGRpc3BsYXlCdWZmZXIsIGJ1ZmZlciwgcmVnaXN0ZXJFZGl0b3IsIHN1cHByZXNzQ3Vyc29yQ3JlYXRpb259KSAtPlxuICAgIHN1cGVyXG5cbiAgICBAY3Vyc29ycyA9IFtdXG4gICAgQHNlbGVjdGlvbnMgPSBbXVxuXG4gICAgQGRpc3BsYXlCdWZmZXIgPz0gbmV3IERpc3BsYXlCdWZmZXIoe2J1ZmZlciwgdGFiTGVuZ3RoLCBzb2Z0V3JhcH0pXG4gICAgQGJ1ZmZlciA9IEBkaXNwbGF5QnVmZmVyLmJ1ZmZlclxuICAgIEBzb2Z0VGFicyA9IEBidWZmZXIudXNlc1NvZnRUYWJzKCkgPyBAc29mdFRhYnMgPyBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycpID8gdHJ1ZVxuXG4gICAgZm9yIG1hcmtlciBpbiBAZmluZE1hcmtlcnMoQGdldFNlbGVjdGlvbk1hcmtlckF0dHJpYnV0ZXMoKSlcbiAgICAgIG1hcmtlci5zZXRBdHRyaWJ1dGVzKHByZXNlcnZlRm9sZHM6IHRydWUpXG4gICAgICBAYWRkU2VsZWN0aW9uKG1hcmtlcilcblxuICAgIEBzdWJzY3JpYmVUb0J1ZmZlcigpXG4gICAgQHN1YnNjcmliZVRvRGlzcGxheUJ1ZmZlcigpXG5cbiAgICBpZiBAZ2V0Q3Vyc29ycygpLmxlbmd0aCBpcyAwIGFuZCBub3Qgc3VwcHJlc3NDdXJzb3JDcmVhdGlvblxuICAgICAgaW5pdGlhbExpbmUgPSBNYXRoLm1heChwYXJzZUludChpbml0aWFsTGluZSkgb3IgMCwgMClcbiAgICAgIGluaXRpYWxDb2x1bW4gPSBNYXRoLm1heChwYXJzZUludChpbml0aWFsQ29sdW1uKSBvciAwLCAwKVxuICAgICAgQGFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24oW2luaXRpYWxMaW5lLCBpbml0aWFsQ29sdW1uXSlcblxuICAgIEBsYW5ndWFnZU1vZGUgPSBuZXcgTGFuZ3VhZ2VNb2RlKHRoaXMpXG5cbiAgICBAc3Vic2NyaWJlIEAkc2Nyb2xsVG9wLCAoc2Nyb2xsVG9wKSA9PiBAZW1pdCAnc2Nyb2xsLXRvcC1jaGFuZ2VkJywgc2Nyb2xsVG9wXG4gICAgQHN1YnNjcmliZSBAJHNjcm9sbExlZnQsIChzY3JvbGxMZWZ0KSA9PiBAZW1pdCAnc2Nyb2xsLWxlZnQtY2hhbmdlZCcsIHNjcm9sbExlZnRcblxuICAgIGF0b20ud29ya3NwYWNlPy5lZGl0b3JBZGRlZCh0aGlzKSBpZiByZWdpc3RlckVkaXRvclxuXG4gIHNlcmlhbGl6ZVBhcmFtczogLT5cbiAgICBpZDogQGlkXG4gICAgc29mdFRhYnM6IEBzb2Z0VGFic1xuICAgIHNjcm9sbFRvcDogQHNjcm9sbFRvcFxuICAgIHNjcm9sbExlZnQ6IEBzY3JvbGxMZWZ0XG4gICAgZGlzcGxheUJ1ZmZlcjogQGRpc3BsYXlCdWZmZXIuc2VyaWFsaXplKClcblxuICBkZXNlcmlhbGl6ZVBhcmFtczogKHBhcmFtcykgLT5cbiAgICBwYXJhbXMuZGlzcGxheUJ1ZmZlciA9IERpc3BsYXlCdWZmZXIuZGVzZXJpYWxpemUocGFyYW1zLmRpc3BsYXlCdWZmZXIpXG4gICAgcGFyYW1zLnJlZ2lzdGVyRWRpdG9yID0gdHJ1ZVxuICAgIHBhcmFtc1xuXG4gIHN1YnNjcmliZVRvQnVmZmVyOiAtPlxuICAgIEBidWZmZXIucmV0YWluKClcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwicGF0aC1jaGFuZ2VkXCIsID0+XG4gICAgICB1bmxlc3MgYXRvbS5wcm9qZWN0LmdldFBhdGgoKT9cbiAgICAgICAgYXRvbS5wcm9qZWN0LnNldFBhdGgocGF0aC5kaXJuYW1lKEBnZXRQYXRoKCkpKVxuICAgICAgQGVtaXQgXCJ0aXRsZS1jaGFuZ2VkXCJcbiAgICAgIEBlbWl0IFwicGF0aC1jaGFuZ2VkXCJcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwiY29udGVudHMtbW9kaWZpZWRcIiwgPT4gQGVtaXQgXCJjb250ZW50cy1tb2RpZmllZFwiXG4gICAgQHN1YnNjcmliZSBAYnVmZmVyLCBcImNvbnRlbnRzLWNvbmZsaWN0ZWRcIiwgPT4gQGVtaXQgXCJjb250ZW50cy1jb25mbGljdGVkXCJcbiAgICBAc3Vic2NyaWJlIEBidWZmZXIsIFwibW9kaWZpZWQtc3RhdHVzLWNoYW5nZWRcIiwgPT4gQGVtaXQgXCJtb2RpZmllZC1zdGF0dXMtY2hhbmdlZFwiXG4gICAgQHN1YnNjcmliZSBAYnVmZmVyLCBcImRlc3Ryb3llZFwiLCA9PiBAZGVzdHJveSgpXG4gICAgQHByZXNlcnZlQ3Vyc29yUG9zaXRpb25PbkJ1ZmZlclJlbG9hZCgpXG5cbiAgc3Vic2NyaWJlVG9EaXNwbGF5QnVmZmVyOiAtPlxuICAgIEBzdWJzY3JpYmUgQGRpc3BsYXlCdWZmZXIsICdtYXJrZXItY3JlYXRlZCcsIEBoYW5kbGVNYXJrZXJDcmVhdGVkXG4gICAgQHN1YnNjcmliZSBAZGlzcGxheUJ1ZmZlciwgXCJjaGFuZ2VkXCIsIChlKSA9PiBAZW1pdCAnc2NyZWVuLWxpbmVzLWNoYW5nZWQnLCBlXG4gICAgQHN1YnNjcmliZSBAZGlzcGxheUJ1ZmZlciwgXCJtYXJrZXJzLXVwZGF0ZWRcIiwgPT4gQG1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgQHN1YnNjcmliZSBAZGlzcGxheUJ1ZmZlciwgJ2dyYW1tYXItY2hhbmdlZCcsID0+IEBoYW5kbGVHcmFtbWFyQ2hhbmdlKClcbiAgICBAc3Vic2NyaWJlIEBkaXNwbGF5QnVmZmVyLCAnc29mdC13cmFwLWNoYW5nZWQnLCAoYXJncy4uLikgPT4gQGVtaXQgJ3NvZnQtd3JhcC1jaGFuZ2VkJywgYXJncy4uLlxuXG4gIGdldFZpZXdDbGFzczogLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUudXNlUmVhY3RFZGl0b3InKVxuICAgICAgcmVxdWlyZSAnLi9yZWFjdC1lZGl0b3ItdmlldydcbiAgICBlbHNlXG4gICAgICByZXF1aXJlICcuL2VkaXRvci12aWV3J1xuXG4gIGRlc3Ryb3llZDogLT5cbiAgICBAdW5zdWJzY3JpYmUoKVxuICAgIHNlbGVjdGlvbi5kZXN0cm95KCkgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgQGJ1ZmZlci5yZWxlYXNlKClcbiAgICBAZGlzcGxheUJ1ZmZlci5kZXN0cm95KClcbiAgICBAbGFuZ3VhZ2VNb2RlLmRlc3Ryb3koKVxuXG4gICMgQ3JlYXRlIGFuIHtFZGl0b3J9IHdpdGggaXRzIGluaXRpYWwgc3RhdGUgYmFzZWQgb24gdGhpcyBvYmplY3RcbiAgY29weTogLT5cbiAgICB0YWJMZW5ndGggPSBAZ2V0VGFiTGVuZ3RoKClcbiAgICBkaXNwbGF5QnVmZmVyID0gQGRpc3BsYXlCdWZmZXIuY29weSgpXG4gICAgc29mdFRhYnMgPSBAZ2V0U29mdFRhYnMoKVxuICAgIG5ld0VkaXRvciA9IG5ldyBFZGl0b3Ioe0BidWZmZXIsIGRpc3BsYXlCdWZmZXIsIHRhYkxlbmd0aCwgc29mdFRhYnMsIHN1cHByZXNzQ3Vyc29yQ3JlYXRpb246IHRydWUsIHJlZ2lzdGVyRWRpdG9yOiB0cnVlfSlcbiAgICBmb3IgbWFya2VyIGluIEBmaW5kTWFya2VycyhlZGl0b3JJZDogQGlkKVxuICAgICAgbWFya2VyLmNvcHkoZWRpdG9ySWQ6IG5ld0VkaXRvci5pZCwgcHJlc2VydmVGb2xkczogdHJ1ZSlcbiAgICBuZXdFZGl0b3JcblxuICAjIFB1YmxpYzogR2V0IHRoZSB0aXRsZSB0aGUgZWRpdG9yJ3MgdGl0bGUgZm9yIGRpc3BsYXkgaW4gb3RoZXIgcGFydHMgb2YgdGhlXG4gICMgVUkgc3VjaCBhcyB0aGUgdGFicy5cbiAgI1xuICAjIElmIHRoZSBlZGl0b3IncyBidWZmZXIgaXMgc2F2ZWQsIGl0cyB0aXRsZSBpcyB0aGUgZmlsZSBuYW1lLiBJZiBpdCBpc1xuICAjIHVuc2F2ZWQsIGl0cyB0aXRsZSBpcyBcInVudGl0bGVkXCIuXG4gICNcbiAgIyBSZXR1cm5zIGEge1N0cmluZ30uXG4gIGdldFRpdGxlOiAtPlxuICAgIGlmIHNlc3Npb25QYXRoID0gQGdldFBhdGgoKVxuICAgICAgcGF0aC5iYXNlbmFtZShzZXNzaW9uUGF0aClcbiAgICBlbHNlXG4gICAgICAndW50aXRsZWQnXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgZWRpdG9yJ3MgbG9uZyB0aXRsZSBmb3IgZGlzcGxheSBpbiBvdGhlciBwYXJ0cyBvZiB0aGUgVUlcbiAgIyBzdWNoIGFzIHRoZSB3aW5kb3cgdGl0bGUuXG4gICNcbiAgIyBJZiB0aGUgZWRpdG9yJ3MgYnVmZmVyIGlzIHNhdmVkLCBpdHMgbG9uZyB0aXRsZSBpcyBmb3JtYXR0ZWQgYXNcbiAgIyBcIjxmaWxlbmFtZT4gLSA8ZGlyZWN0b3J5PlwiLiBJZiBpdCBpcyB1bnNhdmVkLCBpdHMgdGl0bGUgaXMgXCJ1bnRpdGxlZFwiXG4gICNcbiAgIyBSZXR1cm5zIGEge1N0cmluZ30uXG4gIGdldExvbmdUaXRsZTogLT5cbiAgICBpZiBzZXNzaW9uUGF0aCA9IEBnZXRQYXRoKClcbiAgICAgIGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShzZXNzaW9uUGF0aClcbiAgICAgIGRpcmVjdG9yeSA9IHBhdGguYmFzZW5hbWUocGF0aC5kaXJuYW1lKHNlc3Npb25QYXRoKSlcbiAgICAgIFwiI3tmaWxlTmFtZX0gLSAje2RpcmVjdG9yeX1cIlxuICAgIGVsc2VcbiAgICAgICd1bnRpdGxlZCdcblxuICAjIENvbnRyb2xzIHZpc2libGl0eSBiYXNlZCBvbiB0aGUgZ2l2ZW4ge0Jvb2xlYW59LlxuICBzZXRWaXNpYmxlOiAodmlzaWJsZSkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0VmlzaWJsZSh2aXNpYmxlKVxuXG4gICMgU2V0IHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0aGF0IGNhbiBiZSBkaXNwbGF5ZWQgaG9yaXpvbnRhbGx5IGluIHRoZVxuICAjIGVkaXRvci5cbiAgI1xuICAjIGVkaXRvcldpZHRoSW5DaGFycyAtIEEge051bWJlcn0gcmVwcmVzZW50aW5nIHRoZSB3aWR0aCBvZiB0aGUge0VkaXRvclZpZXd9XG4gICMgaW4gY2hhcmFjdGVycy5cbiAgc2V0RWRpdG9yV2lkdGhJbkNoYXJzOiAoZWRpdG9yV2lkdGhJbkNoYXJzKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLnNldEVkaXRvcldpZHRoSW5DaGFycyhlZGl0b3JXaWR0aEluQ2hhcnMpXG5cbiAgIyBQdWJsaWM6IFNldHMgdGhlIGNvbHVtbiBhdCB3aGljaCBjb2x1bXNuIHdpbGwgc29mdCB3cmFwXG4gIGdldFNvZnRXcmFwQ29sdW1uOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTb2Z0V3JhcENvbHVtbigpXG5cbiAgIyBQdWJsaWM6IFJldHVybnMgYSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHNvZnRUYWJzIGFyZSBlbmFibGVkIGZvciB0aGlzXG4gICMgZWRpdG9yLlxuICBnZXRTb2Z0VGFiczogLT4gQHNvZnRUYWJzXG5cbiAgIyBQdWJsaWM6IEVuYWJsZSBvciBkaXNhYmxlIHNvZnQgdGFicyBmb3IgdGhpcyBlZGl0b3IuXG4gICNcbiAgIyBzb2Z0VGFicyAtIEEge0Jvb2xlYW59XG4gIHNldFNvZnRUYWJzOiAoQHNvZnRUYWJzKSAtPiBAc29mdFRhYnNcblxuICAjIFB1YmxpYzogVG9nZ2xlIHNvZnQgdGFicyBmb3IgdGhpcyBlZGl0b3JcbiAgdG9nZ2xlU29mdFRhYnM6IC0+IEBzZXRTb2Z0VGFicyhub3QgQGdldFNvZnRUYWJzKCkpXG5cbiAgIyBQdWJsaWM6IEdldCB3aGV0aGVyIHNvZnQgd3JhcCBpcyBlbmFibGVkIGZvciB0aGlzIGVkaXRvci5cbiAgZ2V0U29mdFdyYXA6IC0+IEBkaXNwbGF5QnVmZmVyLmdldFNvZnRXcmFwKClcblxuICAjIFB1YmxpYzogRW5hYmxlIG9yIGRpc2FibGUgc29mdCB3cmFwIGZvciB0aGlzIGVkaXRvci5cbiAgI1xuICAjIHNvZnRXcmFwIC0gQSB7Qm9vbGVhbn1cbiAgc2V0U29mdFdyYXA6IChzb2Z0V3JhcCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0U29mdFdyYXAoc29mdFdyYXApXG5cbiAgIyBQdWJsaWM6IFRvZ2dsZSBzb2Z0IHdyYXAgZm9yIHRoaXMgZWRpdG9yXG4gIHRvZ2dsZVNvZnRXcmFwOiAtPiBAc2V0U29mdFdyYXAobm90IEBnZXRTb2Z0V3JhcCgpKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHRleHQgcmVwcmVzZW50aW5nIGEgc2luZ2xlIGxldmVsIG9mIGluZGVudC5cbiAgI1xuICAjIElmIHNvZnQgdGFicyBhcmUgZW5hYmxlZCwgdGhlIHRleHQgaXMgY29tcG9zZWQgb2YgTiBzcGFjZXMsIHdoZXJlIE4gaXMgdGhlXG4gICMgdGFiIGxlbmd0aC4gT3RoZXJ3aXNlIHRoZSB0ZXh0IGlzIGEgdGFiIGNoYXJhY3RlciAoYFxcdGApLlxuICAjXG4gICMgUmV0dXJucyBhIHtTdHJpbmd9LlxuICBnZXRUYWJUZXh0OiAtPiBAYnVpbGRJbmRlbnRTdHJpbmcoMSlcblxuICAjIFB1YmxpYzogR2V0IHRoZSBvbi1zY3JlZW4gbGVuZ3RoIG9mIHRhYiBjaGFyYWN0ZXJzLlxuICAjXG4gICMgUmV0dXJucyBhIHtOdW1iZXJ9LlxuICBnZXRUYWJMZW5ndGg6IC0+IEBkaXNwbGF5QnVmZmVyLmdldFRhYkxlbmd0aCgpXG5cbiAgIyBQdWJsaWM6IFNldCB0aGUgb24tc2NyZWVuIGxlbmd0aCBvZiB0YWIgY2hhcmFjdGVycy5cbiAgc2V0VGFiTGVuZ3RoOiAodGFiTGVuZ3RoKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRUYWJMZW5ndGgodGFiTGVuZ3RoKVxuXG4gICMgUHVibGljOiBDbGlwIHRoZSBnaXZlbiB7UG9pbnR9IHRvIGEgdmFsaWQgcG9zaXRpb24gaW4gdGhlIGJ1ZmZlci5cbiAgI1xuICAjIElmIHRoZSBnaXZlbiB7UG9pbnR9IGRlc2NyaWJlcyBhIHBvc2l0aW9uIHRoYXQgaXMgYWN0dWFsbHkgcmVhY2hhYmxlIGJ5IHRoZVxuICAjIGN1cnNvciBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZW50cyBvZiB0aGUgYnVmZmVyLCBpdCBpcyByZXR1cm5lZFxuICAjIHVuY2hhbmdlZC4gSWYgdGhlIHtQb2ludH0gZG9lcyBub3QgZGVzY3JpYmUgYSB2YWxpZCBwb3NpdGlvbiwgdGhlIGNsb3Nlc3RcbiAgIyB2YWxpZCBwb3NpdGlvbiBpcyByZXR1cm5lZCBpbnN0ZWFkLlxuICAjXG4gICMgRm9yIGV4YW1wbGU6XG4gICMgICAqIGBbLTEsIC0xXWAgaXMgY29udmVydGVkIHRvIGBbMCwgMF1gLlxuICAjICAgKiBJZiB0aGUgbGluZSBhdCByb3cgMiBpcyAxMCBsb25nLCBgWzIsIEluZmluaXR5XWAgaXMgY29udmVydGVkIHRvXG4gICMgICAgIGBbMiwgMTBdYC5cbiAgI1xuICAjIGJ1ZmZlclBvc2l0aW9uIC0gVGhlIHtQb2ludH0gcmVwcmVzZW50aW5nIHRoZSBwb3NpdGlvbiB0byBjbGlwLlxuICAjXG4gICMgUmV0dXJucyBhIHtQb2ludH0uXG4gIGNsaXBCdWZmZXJQb3NpdGlvbjogKGJ1ZmZlclBvc2l0aW9uKSAtPiBAYnVmZmVyLmNsaXBQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICAjIFB1YmxpYzogQ2xpcCB0aGUgc3RhcnQgYW5kIGVuZCBvZiB0aGUgZ2l2ZW4gcmFuZ2UgdG8gdmFsaWQgcG9zaXRpb25zIGluIHRoZVxuICAjIGJ1ZmZlci4gU2VlIHs6OmNsaXBCdWZmZXJQb3NpdGlvbn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICNcbiAgIyByYW5nZSAtIFRoZSB7UmFuZ2V9IHRvIGNsaXAuXG4gICNcbiAgIyBSZXR1cm5zIGEge1JhbmdlfS5cbiAgY2xpcEJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+IEBidWZmZXIuY2xpcFJhbmdlKHJhbmdlKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIGluZGVudGF0aW9uIGxldmVsIG9mIHRoZSBnaXZlbiBhIGJ1ZmZlciByb3cuXG4gICNcbiAgIyBSZXR1cm5zIGhvdyBkZWVwbHkgdGhlIGdpdmVuIHJvdyBpcyBpbmRlbnRlZCBiYXNlZCBvbiB0aGUgc29mdCB0YWJzIGFuZFxuICAjIHRhYiBsZW5ndGggc2V0dGluZ3Mgb2YgdGhpcyBlZGl0b3IuIE5vdGUgdGhhdCBpZiBzb2Z0IHRhYnMgYXJlIGVuYWJsZWQgYW5kXG4gICMgdGhlIHRhYiBsZW5ndGggaXMgMiwgYSByb3cgd2l0aCA0IGxlYWRpbmcgc3BhY2VzIHdvdWxkIGhhdmUgYW4gaW5kZW50YXRpb25cbiAgIyBsZXZlbCBvZiAyLlxuICAjXG4gICMgYnVmZmVyUm93IC0gQSB7TnVtYmVyfSBpbmRpY2F0aW5nIHRoZSBidWZmZXIgcm93LlxuICAjXG4gICMgUmV0dXJucyBhIHtOdW1iZXJ9LlxuICBpbmRlbnRhdGlvbkZvckJ1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT5cbiAgICBAaW5kZW50TGV2ZWxGb3JMaW5lKEBsaW5lRm9yQnVmZmVyUm93KGJ1ZmZlclJvdykpXG5cbiAgIyBQdWJsaWM6IFNldCB0aGUgaW5kZW50YXRpb24gbGV2ZWwgZm9yIHRoZSBnaXZlbiBidWZmZXIgcm93LlxuICAjXG4gICMgSW5zZXJ0cyBvciByZW1vdmVzIGhhcmQgdGFicyBvciBzcGFjZXMgYmFzZWQgb24gdGhlIHNvZnQgdGFicyBhbmQgdGFiIGxlbmd0aFxuICAjIHNldHRpbmdzIG9mIHRoaXMgZWRpdG9yIGluIG9yZGVyIHRvIGJyaW5nIGl0IHRvIHRoZSBnaXZlbiBpbmRlbnRhdGlvbiBsZXZlbC5cbiAgIyBOb3RlIHRoYXQgaWYgc29mdCB0YWJzIGFyZSBlbmFibGVkIGFuZCB0aGUgdGFiIGxlbmd0aCBpcyAyLCBhIHJvdyB3aXRoIDRcbiAgIyBsZWFkaW5nIHNwYWNlcyB3b3VsZCBoYXZlIGFuIGluZGVudGF0aW9uIGxldmVsIG9mIDIuXG4gICNcbiAgIyBidWZmZXJSb3cgLSBBIHtOdW1iZXJ9IGluZGljYXRpbmcgdGhlIGJ1ZmZlciByb3cuXG4gICMgbmV3TGV2ZWwgLSBBIHtOdW1iZXJ9IGluZGljYXRpbmcgdGhlIG5ldyBpbmRlbnRhdGlvbiBsZXZlbC5cbiAgIyBvcHRpb25zIC0gQW4ge09iamVjdH0gd2l0aCB0aGUgZm9sbG93aW5nIGtleXM6XG4gICMgICA6cHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZSAtIHRydWUgdG8gcHJlc2VydmUgYW55IHdoaXRlc3BhY2UgYWxyZWFkeSBhdFxuICAjICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lIChkZWZhdWx0OiBmYWxzZSkuXG4gIHNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93OiAoYnVmZmVyUm93LCBuZXdMZXZlbCwge3ByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2V9PXt9KSAtPlxuICAgIGlmIHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2VcbiAgICAgIGVuZENvbHVtbiA9IDBcbiAgICBlbHNlXG4gICAgICBlbmRDb2x1bW4gPSBAbGluZUZvckJ1ZmZlclJvdyhidWZmZXJSb3cpLm1hdGNoKC9eXFxzKi8pWzBdLmxlbmd0aFxuICAgIG5ld0luZGVudFN0cmluZyA9IEBidWlsZEluZGVudFN0cmluZyhuZXdMZXZlbClcbiAgICBAYnVmZmVyLnNldFRleHRJblJhbmdlKFtbYnVmZmVyUm93LCAwXSwgW2J1ZmZlclJvdywgZW5kQ29sdW1uXV0sIG5ld0luZGVudFN0cmluZylcblxuICAjIFB1YmxpYzogR2V0IHRoZSBpbmRlbnRhdGlvbiBsZXZlbCBvZiB0aGUgZ2l2ZW4gbGluZSBvZiB0ZXh0LlxuICAjXG4gICMgUmV0dXJucyBob3cgZGVlcGx5IHRoZSBnaXZlbiBsaW5lIGlzIGluZGVudGVkIGJhc2VkIG9uIHRoZSBzb2Z0IHRhYnMgYW5kXG4gICMgdGFiIGxlbmd0aCBzZXR0aW5ncyBvZiB0aGlzIGVkaXRvci4gTm90ZSB0aGF0IGlmIHNvZnQgdGFicyBhcmUgZW5hYmxlZCBhbmRcbiAgIyB0aGUgdGFiIGxlbmd0aCBpcyAyLCBhIHJvdyB3aXRoIDQgbGVhZGluZyBzcGFjZXMgd291bGQgaGF2ZSBhbiBpbmRlbnRhdGlvblxuICAjIGxldmVsIG9mIDIuXG4gICNcbiAgIyBsaW5lIC0gQSB7U3RyaW5nfSByZXByZXNlbnRpbmcgYSBsaW5lIG9mIHRleHQuXG4gICNcbiAgIyBSZXR1cm5zIGEge051bWJlcn0uXG4gIGluZGVudExldmVsRm9yTGluZTogKGxpbmUpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuaW5kZW50TGV2ZWxGb3JMaW5lKGxpbmUpXG5cbiAgIyBDb25zdHJ1Y3RzIHRoZSBzdHJpbmcgdXNlZCBmb3IgdGFicy5cbiAgYnVpbGRJbmRlbnRTdHJpbmc6IChudW1iZXIpIC0+XG4gICAgaWYgQGdldFNvZnRUYWJzKClcbiAgICAgIF8ubXVsdGlwbHlTdHJpbmcoXCIgXCIsIE1hdGguZmxvb3IobnVtYmVyICogQGdldFRhYkxlbmd0aCgpKSlcbiAgICBlbHNlXG4gICAgICBfLm11bHRpcGx5U3RyaW5nKFwiXFx0XCIsIE1hdGguZmxvb3IobnVtYmVyKSlcblxuICAjIFB1YmxpYzogU2F2ZXMgdGhlIGVkaXRvcidzIHRleHQgYnVmZmVyLlxuICAjXG4gICMgU2VlIHtUZXh0QnVmZmVyOjpzYXZlfSBmb3IgbW9yZSBkZXRhaWxzLlxuICBzYXZlOiAtPiBAYnVmZmVyLnNhdmUoKVxuXG4gICMgUHVibGljOiBTYXZlcyB0aGUgZWRpdG9yJ3MgdGV4dCBidWZmZXIgYXMgdGhlIGdpdmVuIHBhdGguXG4gICNcbiAgIyBTZWUge1RleHRCdWZmZXI6OnNhdmVBc30gZm9yIG1vcmUgZGV0YWlscy5cbiAgI1xuICAjIGZpbGVQYXRoIC0gQSB7U3RyaW5nfSBwYXRoLlxuICBzYXZlQXM6IChmaWxlUGF0aCkgLT4gQGJ1ZmZlci5zYXZlQXMoZmlsZVBhdGgpXG5cbiAgY2hlY2tvdXRIZWFkOiAtPlxuICAgIGlmIGZpbGVQYXRoID0gQGdldFBhdGgoKVxuICAgICAgYXRvbS5wcm9qZWN0LmdldFJlcG8oKT8uY2hlY2tvdXRIZWFkKGZpbGVQYXRoKVxuXG4gICMgQ29waWVzIHRoZSBjdXJyZW50IGZpbGUgcGF0aCB0byB0aGUgbmF0aXZlIGNsaXBib2FyZC5cbiAgY29weVBhdGhUb0NsaXBib2FyZDogLT5cbiAgICBpZiBmaWxlUGF0aCA9IEBnZXRQYXRoKClcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKGZpbGVQYXRoKVxuXG4gICMgUHVibGljOiBSZXR1cm5zIHRoZSB7U3RyaW5nfSBwYXRoIG9mIHRoaXMgZWRpdG9yJ3MgdGV4dCBidWZmZXIuXG4gIGdldFBhdGg6IC0+IEBidWZmZXIuZ2V0UGF0aCgpXG5cbiAgIyBQdWJsaWM6IFJldHVybnMgYSB7U3RyaW5nfSByZXByZXNlbnRpbmcgdGhlIGVudGlyZSBjb250ZW50cyBvZiB0aGUgZWRpdG9yLlxuICBnZXRUZXh0OiAtPiBAYnVmZmVyLmdldFRleHQoKVxuXG4gICMgUHVibGljOiBSZXBsYWNlcyB0aGUgZW50aXJlIGNvbnRlbnRzIG9mIHRoZSBidWZmZXIgd2l0aCB0aGUgZ2l2ZW4ge1N0cmluZ30uXG4gIHNldFRleHQ6ICh0ZXh0KSAtPiBAYnVmZmVyLnNldFRleHQodGV4dClcblxuICAjIEdldCB0aGUgdGV4dCBpbiB0aGUgZ2l2ZW4ge1JhbmdlfS5cbiAgI1xuICAjIFJldHVybnMgYSB7U3RyaW5nfS5cbiAgZ2V0VGV4dEluUmFuZ2U6IChyYW5nZSkgLT4gQGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShyYW5nZSlcblxuICAjIFB1YmxpYzogUmV0dXJucyBhIHtOdW1iZXJ9IHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIGxpbmVzIGluIHRoZSBlZGl0b3IuXG4gIGdldExpbmVDb3VudDogLT4gQGJ1ZmZlci5nZXRMaW5lQ291bnQoKVxuXG4gICMgUmV0cmlldmVzIHRoZSBjdXJyZW50IHtUZXh0QnVmZmVyfS5cbiAgZ2V0QnVmZmVyOiAtPiBAYnVmZmVyXG5cbiAgIyBQdWJsaWM6IFJldHJpZXZlcyB0aGUgY3VycmVudCBidWZmZXIncyBVUkkuXG4gIGdldFVyaTogLT4gQGJ1ZmZlci5nZXRVcmkoKVxuXG4gICMge0RlbGVnYXRlcyB0bzogVGV4dEJ1ZmZlci5pc1Jvd0JsYW5rfVxuICBpc0J1ZmZlclJvd0JsYW5rOiAoYnVmZmVyUm93KSAtPiBAYnVmZmVyLmlzUm93QmxhbmsoYnVmZmVyUm93KVxuXG4gICMgUHVibGljOiBEZXRlcm1pbmUgaWYgdGhlIGdpdmVuIHJvdyBpcyBlbnRpcmVseSBhIGNvbW1lbnRcbiAgaXNCdWZmZXJSb3dDb21tZW50ZWQ6IChidWZmZXJSb3cpIC0+XG4gICAgaWYgbWF0Y2ggPSBAbGluZUZvckJ1ZmZlclJvdyhidWZmZXJSb3cpLm1hdGNoKC9cXFMvKVxuICAgICAgc2NvcGVzID0gQHRva2VuRm9yQnVmZmVyUG9zaXRpb24oW2J1ZmZlclJvdywgbWF0Y2guaW5kZXhdKS5zY29wZXNcbiAgICAgIG5ldyBUZXh0TWF0ZVNjb3BlU2VsZWN0b3IoJ2NvbW1lbnQuKicpLm1hdGNoZXMoc2NvcGVzKVxuXG4gICMge0RlbGVnYXRlcyB0bzogVGV4dEJ1ZmZlci5uZXh0Tm9uQmxhbmtSb3d9XG4gIG5leHROb25CbGFua0J1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT4gQGJ1ZmZlci5uZXh0Tm9uQmxhbmtSb3coYnVmZmVyUm93KVxuXG4gICMge0RlbGVnYXRlcyB0bzogVGV4dEJ1ZmZlci5nZXRFbmRQb3NpdGlvbn1cbiAgZ2V0RW9mQnVmZmVyUG9zaXRpb246IC0+IEBidWZmZXIuZ2V0RW5kUG9zaXRpb24oKVxuXG4gICMgUHVibGljOiBSZXR1cm5zIGEge051bWJlcn0gcmVwcmVzZW50aW5nIHRoZSBsYXN0IHplcm8taW5kZXhlZCBidWZmZXIgcm93XG4gICMgbnVtYmVyIG9mIHRoZSBlZGl0b3IuXG4gIGdldExhc3RCdWZmZXJSb3c6IC0+IEBidWZmZXIuZ2V0TGFzdFJvdygpXG5cbiAgIyBSZXR1cm5zIHRoZSByYW5nZSBmb3IgdGhlIGdpdmVuIGJ1ZmZlciByb3cuXG4gICNcbiAgIyByb3cgLSBBIHJvdyB7TnVtYmVyfS5cbiAgIyBvcHRpb25zIC0gQW4gb3B0aW9ucyBoYXNoIHdpdGggYW4gYGluY2x1ZGVOZXdsaW5lYCBrZXkuXG4gICNcbiAgIyBSZXR1cm5zIGEge1JhbmdlfS5cbiAgYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3c6IChyb3csIHtpbmNsdWRlTmV3bGluZX09e30pIC0+IEBidWZmZXIucmFuZ2VGb3JSb3cocm93LCBpbmNsdWRlTmV3bGluZSlcblxuICAjIFB1YmxpYzogUmV0dXJucyBhIHtTdHJpbmd9IHJlcHJlc2VudGluZyB0aGUgY29udGVudHMgb2YgdGhlIGxpbmUgYXQgdGhlXG4gICMgZ2l2ZW4gYnVmZmVyIHJvdy5cbiAgI1xuICAjIHJvdyAtIEEge051bWJlcn0gcmVwcmVzZW50aW5nIGEgemVyby1pbmRleGVkIGJ1ZmZlciByb3cuXG4gIGxpbmVGb3JCdWZmZXJSb3c6IChyb3cpIC0+IEBidWZmZXIubGluZUZvclJvdyhyb3cpXG5cbiAgIyBQdWJsaWM6IFJldHVybnMgYSB7TnVtYmVyfSByZXByZXNlbnRpbmcgdGhlIGxpbmUgbGVuZ3RoIGZvciB0aGUgZ2l2ZW5cbiAgIyBidWZmZXIgcm93LCBleGNsdXNpdmUgb2YgaXRzIGxpbmUtZW5kaW5nIGNoYXJhY3RlcihzKS5cbiAgI1xuICAjIHJvdyAtIEEge051bWJlcn0gaW5kaWNhdGluZyB0aGUgYnVmZmVyIHJvdy5cbiAgbGluZUxlbmd0aEZvckJ1ZmZlclJvdzogKHJvdykgLT4gQGJ1ZmZlci5saW5lTGVuZ3RoRm9yUm93KHJvdylcblxuICAjIHtEZWxlZ2F0ZXMgdG86IFRleHRCdWZmZXIuc2Nhbn1cbiAgc2NhbjogKGFyZ3MuLi4pIC0+IEBidWZmZXIuc2NhbihhcmdzLi4uKVxuXG4gICMge0RlbGVnYXRlcyB0bzogVGV4dEJ1ZmZlci5zY2FuSW5SYW5nZX1cbiAgc2NhbkluQnVmZmVyUmFuZ2U6IChhcmdzLi4uKSAtPiBAYnVmZmVyLnNjYW5JblJhbmdlKGFyZ3MuLi4pXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBUZXh0QnVmZmVyLmJhY2t3YXJkc1NjYW5JblJhbmdlfVxuICBiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZTogKGFyZ3MuLi4pIC0+IEBidWZmZXIuYmFja3dhcmRzU2NhbkluUmFuZ2UoYXJncy4uLilcblxuICAjIHtEZWxlZ2F0ZXMgdG86IFRleHRCdWZmZXIuaXNNb2RpZmllZH1cbiAgaXNNb2RpZmllZDogLT4gQGJ1ZmZlci5pc01vZGlmaWVkKClcblxuICAjIFB1YmxpYzogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIHVzZXIgc2hvdWxkIGJlIHByb21wdGVkIHRvIHNhdmUgYmVmb3JlIGNsb3NpbmdcbiAgIyB0aGlzIGVkaXRvci5cbiAgc2hvdWxkUHJvbXB0VG9TYXZlOiAtPiBAaXNNb2RpZmllZCgpIGFuZCBub3QgQGJ1ZmZlci5oYXNNdWx0aXBsZUVkaXRvcnMoKVxuXG4gICMgUHVibGljOiBDb252ZXJ0IGEgcG9zaXRpb24gaW4gYnVmZmVyLWNvb3JkaW5hdGVzIHRvIHNjcmVlbi1jb29yZGluYXRlcy5cbiAgI1xuICAjIFRoZSBwb3NpdGlvbiBpcyBjbGlwcGVkIHZpYSB7OjpjbGlwQnVmZmVyUG9zaXRpb259IHByaW9yIHRvIHRoZSBjb252ZXJzaW9uLlxuICAjIFRoZSBwb3NpdGlvbiBpcyBhbHNvIGNsaXBwZWQgdmlhIHs6OmNsaXBTY3JlZW5Qb3NpdGlvbn0gZm9sbG93aW5nIHRoZVxuICAjIGNvbnZlcnNpb24sIHdoaWNoIG9ubHkgbWFrZXMgYSBkaWZmZXJlbmNlIHdoZW4gYG9wdGlvbnNgIGFyZSBzdXBwbGllZC5cbiAgI1xuICAjIGJ1ZmZlclBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgW3JvdywgY29sdW1uXS5cbiAgIyBvcHRpb25zIC0gQW4gb3B0aW9ucyBoYXNoIGZvciB7OjpjbGlwU2NyZWVuUG9zaXRpb259LlxuICAjXG4gICMgUmV0dXJucyBhIHtQb2ludH0uXG4gIHNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb246IChidWZmZXJQb3NpdGlvbiwgb3B0aW9ucykgLT4gQGRpc3BsYXlCdWZmZXIuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbiwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogQ29udmVydCBhIHBvc2l0aW9uIGluIHNjcmVlbi1jb29yZGluYXRlcyB0byBidWZmZXItY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBUaGUgcG9zaXRpb24gaXMgY2xpcHBlZCB2aWEgezo6Y2xpcFNjcmVlblBvc2l0aW9ufSBwcmlvciB0byB0aGUgY29udmVyc2lvbi5cbiAgI1xuICAjIGJ1ZmZlclBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgW3JvdywgY29sdW1uXS5cbiAgIyBvcHRpb25zIC0gQW4gb3B0aW9ucyBoYXNoIGZvciB7OjpjbGlwU2NyZWVuUG9zaXRpb259LlxuICAjXG4gICMgUmV0dXJucyBhIHtQb2ludH0uXG4gIGJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb246IChzY3JlZW5Qb3NpdGlvbiwgb3B0aW9ucykgLT4gQGRpc3BsYXlCdWZmZXIuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbiwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogQ29udmVydCBhIHJhbmdlIGluIGJ1ZmZlci1jb29yZGluYXRlcyB0byBzY3JlZW4tY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBSZXR1cm5zIGEge1JhbmdlfS5cbiAgc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZTogKGJ1ZmZlclJhbmdlKSAtPiBAZGlzcGxheUJ1ZmZlci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlKVxuXG4gICMgUHVibGljOiBDb252ZXJ0IGEgcmFuZ2UgaW4gc2NyZWVuLWNvb3JkaW5hdGVzIHRvIGJ1ZmZlci1jb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgYSB7UmFuZ2V9LlxuICBidWZmZXJSYW5nZUZvclNjcmVlblJhbmdlOiAoc2NyZWVuUmFuZ2UpIC0+IEBkaXNwbGF5QnVmZmVyLmJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG5cbiAgIyBQdWJsaWM6IENsaXAgdGhlIGdpdmVuIHtQb2ludH0gdG8gYSB2YWxpZCBwb3NpdGlvbiBvbiBzY3JlZW4uXG4gICNcbiAgIyBJZiB0aGUgZ2l2ZW4ge1BvaW50fSBkZXNjcmliZXMgYSBwb3NpdGlvbiB0aGF0IGlzIGFjdHVhbGx5IHJlYWNoYWJsZSBieSB0aGVcbiAgIyBjdXJzb3IgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGVudHMgb2YgdGhlIHNjcmVlbiwgaXQgaXMgcmV0dXJuZWRcbiAgIyB1bmNoYW5nZWQuIElmIHRoZSB7UG9pbnR9IGRvZXMgbm90IGRlc2NyaWJlIGEgdmFsaWQgcG9zaXRpb24sIHRoZSBjbG9zZXN0XG4gICMgdmFsaWQgcG9zaXRpb24gaXMgcmV0dXJuZWQgaW5zdGVhZC5cbiAgI1xuICAjIEZvciBleGFtcGxlOlxuICAjICAgKiBgWy0xLCAtMV1gIGlzIGNvbnZlcnRlZCB0byBgWzAsIDBdYC5cbiAgIyAgICogSWYgdGhlIGxpbmUgYXQgc2NyZWVuIHJvdyAyIGlzIDEwIGxvbmcsIGBbMiwgSW5maW5pdHldYCBpcyBjb252ZXJ0ZWQgdG9cbiAgIyAgICAgYFsyLCAxMF1gLlxuICAjXG4gICMgYnVmZmVyUG9zaXRpb24gLSBUaGUge1BvaW50fSByZXByZXNlbnRpbmcgdGhlIHBvc2l0aW9uIHRvIGNsaXAuXG4gICNcbiAgIyBSZXR1cm5zIGEge1BvaW50fS5cbiAgY2xpcFNjcmVlblBvc2l0aW9uOiAoc2NyZWVuUG9zaXRpb24sIG9wdGlvbnMpIC0+IEBkaXNwbGF5QnVmZmVyLmNsaXBTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbiwgb3B0aW9ucylcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIubGluZUZvclJvd31cbiAgbGluZUZvclNjcmVlblJvdzogKHJvdykgLT4gQGRpc3BsYXlCdWZmZXIubGluZUZvclJvdyhyb3cpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmxpbmVzRm9yUm93c31cbiAgbGluZXNGb3JTY3JlZW5Sb3dzOiAoc3RhcnQsIGVuZCkgLT4gQGRpc3BsYXlCdWZmZXIubGluZXNGb3JSb3dzKHN0YXJ0LCBlbmQpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmdldExpbmVDb3VudH1cbiAgZ2V0U2NyZWVuTGluZUNvdW50OiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRMaW5lQ291bnQoKVxuXG4gICMge0RlbGVnYXRlcyB0bzogRGlzcGxheUJ1ZmZlci5nZXRNYXhMaW5lTGVuZ3RofVxuICBnZXRNYXhTY3JlZW5MaW5lTGVuZ3RoOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRNYXhMaW5lTGVuZ3RoKClcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIuZ2V0TGFzdFJvd31cbiAgZ2V0TGFzdFNjcmVlblJvdzogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0TGFzdFJvdygpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmJ1ZmZlclJvd3NGb3JTY3JlZW5Sb3dzfVxuICBidWZmZXJSb3dzRm9yU2NyZWVuUm93czogKHN0YXJ0Um93LCBlbmRSb3cpIC0+IEBkaXNwbGF5QnVmZmVyLmJ1ZmZlclJvd3NGb3JTY3JlZW5Sb3dzKHN0YXJ0Um93LCBlbmRSb3cpXG5cbiAgYnVmZmVyUm93Rm9yU2NyZWVuUm93OiAocm93KSAtPiBAZGlzcGxheUJ1ZmZlci5idWZmZXJSb3dGb3JTY3JlZW5Sb3cocm93KVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHN5bnRhY3RpYyBzY29wZXMgZm9yIHRoZSBtb3N0IHRoZSBnaXZlbiBwb3NpdGlvbiBpbiBidWZmZXJcbiAgIyBjb29yZGl0YW5hdGVzLlxuICAjXG4gICMgRm9yIGV4YW1wbGUsIGlmIGNhbGxlZCB3aXRoIGEgcG9zaXRpb24gaW5zaWRlIHRoZSBwYXJhbWV0ZXIgbGlzdCBvZiBhblxuICAjIGFub255bW91cyBDb2ZmZWVTY3JpcHQgZnVuY3Rpb24sIHRoZSBtZXRob2QgcmV0dXJucyB0aGUgZm9sbG93aW5nIGFycmF5OlxuICAjIGBbXCJzb3VyY2UuY29mZmVlXCIsIFwibWV0YS5pbmxpbmUuZnVuY3Rpb24uY29mZmVlXCIsIFwidmFyaWFibGUucGFyYW1ldGVyLmZ1bmN0aW9uLmNvZmZlZVwiXWBcbiAgI1xuICAjIGJ1ZmZlclBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgW3JvdywgY29sdW1uXS5cbiAgI1xuICAjIFJldHVybnMgYW4ge0FycmF5fSBvZiB7U3RyaW5nfXMuXG4gIHNjb3Blc0ZvckJ1ZmZlclBvc2l0aW9uOiAoYnVmZmVyUG9zaXRpb24pIC0+IEBkaXNwbGF5QnVmZmVyLnNjb3Blc0ZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHJhbmdlIGluIGJ1ZmZlciBjb29yZGluYXRlcyBvZiBhbGwgdG9rZW5zIHN1cnJvdW5kaW5nIHRoZVxuICAjIGN1cnNvciB0aGF0IG1hdGNoIHRoZSBnaXZlbiBzY29wZSBzZWxlY3Rvci5cbiAgI1xuICAjIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudGVkIHRvIGZpbmQgdGhlIHN0cmluZyBzdXJyb3VuZGluZyB0aGUgY3Vyc29yLCB5b3VcbiAgIyBjb3VsZCBjYWxsIGBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0Q3Vyc29yKFwiLnN0cmluZy5xdW90ZWRcIilgLlxuICAjXG4gICMgUmV0dXJucyBhIHtSYW5nZX0uXG4gIGJ1ZmZlclJhbmdlRm9yU2NvcGVBdEN1cnNvcjogKHNlbGVjdG9yKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNlbGVjdG9yLCBAZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIudG9rZW5Gb3JCdWZmZXJQb3NpdGlvbn1cbiAgdG9rZW5Gb3JCdWZmZXJQb3NpdGlvbjogKGJ1ZmZlclBvc2l0aW9uKSAtPiBAZGlzcGxheUJ1ZmZlci50b2tlbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHN5bnRhY3RpYyBzY29wZXMgZm9yIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIGN1cnNvcidzXG4gICMgcG9zaXRpb24uIFNlZSB7OjpzY29wZXNGb3JCdWZmZXJQb3NpdGlvbn0gZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICNcbiAgIyBSZXR1cm5zIGFuIHtBcnJheX0gb2Yge1N0cmluZ31zLlxuICBnZXRDdXJzb3JTY29wZXM6IC0+IEBnZXRDdXJzb3IoKS5nZXRTY29wZXMoKVxuXG4gIGxvZ0N1cnNvclNjb3BlOiAtPlxuICAgIGNvbnNvbGUubG9nIEBnZXRDdXJzb3JTY29wZXMoKVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBzZWxlY3Rpb24sIHJlcGxhY2UgdGhlIHNlbGVjdGVkIHRleHQgd2l0aCB0aGUgZ2l2ZW4gdGV4dC5cbiAgI1xuICAjIHRleHQgLSBBIHtTdHJpbmd9IHJlcHJlc2VudGluZyB0aGUgdGV4dCB0byBpbnNlcnQuXG4gICMgb3B0aW9ucyAtIFNlZSB7U2VsZWN0aW9uOjppbnNlcnRUZXh0fS5cbiAgaW5zZXJ0VGV4dDogKHRleHQsIG9wdGlvbnM9e30pIC0+XG4gICAgb3B0aW9ucy5hdXRvSW5kZW50TmV3bGluZSA/PSBAc2hvdWxkQXV0b0luZGVudCgpXG4gICAgb3B0aW9ucy5hdXRvRGVjcmVhc2VJbmRlbnQgPz0gQHNob3VsZEF1dG9JbmRlbnQoKVxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogRm9yIGVhY2ggc2VsZWN0aW9uLCByZXBsYWNlIHRoZSBzZWxlY3RlZCB0ZXh0IHdpdGggYSBuZXdsaW5lLlxuICBpbnNlcnROZXdsaW5lOiAtPlxuICAgIEBpbnNlcnRUZXh0KCdcXG4nKVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBjdXJzb3IsIGluc2VydCBhIG5ld2xpbmUgYXQgYmVnaW5uaW5nIHRoZSBmb2xsb3dpbmcgbGluZS5cbiAgaW5zZXJ0TmV3bGluZUJlbG93OiAtPlxuICAgIEB0cmFuc2FjdCA9PlxuICAgICAgQG1vdmVDdXJzb3JUb0VuZE9mTGluZSgpXG4gICAgICBAaW5zZXJ0TmV3bGluZSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIGN1cnNvciwgaW5zZXJ0IGEgbmV3bGluZSBhdCB0aGUgZW5kIG9mIHRoZSBwcmVjZWRpbmcgbGluZS5cbiAgaW5zZXJ0TmV3bGluZUFib3ZlOiAtPlxuICAgIEB0cmFuc2FjdCA9PlxuICAgICAgYnVmZmVyUm93ID0gQGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICBpbmRlbnRMZXZlbCA9IEBpbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhidWZmZXJSb3cpXG4gICAgICBvbkZpcnN0TGluZSA9IGJ1ZmZlclJvdyBpcyAwXG5cbiAgICAgIEBtb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZkxpbmUoKVxuICAgICAgQG1vdmVDdXJzb3JMZWZ0KClcbiAgICAgIEBpbnNlcnROZXdsaW5lKClcblxuICAgICAgaWYgQHNob3VsZEF1dG9JbmRlbnQoKSBhbmQgQGluZGVudGF0aW9uRm9yQnVmZmVyUm93KGJ1ZmZlclJvdykgPCBpbmRlbnRMZXZlbFxuICAgICAgICBAc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3coYnVmZmVyUm93LCBpbmRlbnRMZXZlbClcblxuICAgICAgaWYgb25GaXJzdExpbmVcbiAgICAgICAgQG1vdmVDdXJzb3JVcCgpXG4gICAgICAgIEBtb3ZlQ3Vyc29yVG9FbmRPZkxpbmUoKVxuXG4gICMgSW5kZW50IGFsbCBsaW5lcyBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9ucy4gU2VlIHtTZWxlY3Rpb246OmluZGVudH0gZm9yIG1vcmVcbiAgIyBpbmZvcm1hdGlvbi5cbiAgaW5kZW50OiAob3B0aW9ucz17fSktPlxuICAgIG9wdGlvbnMuYXV0b0luZGVudCA/PSBAc2hvdWxkQXV0b0luZGVudCgpXG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uaW5kZW50KG9wdGlvbnMpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgZGVsZXRlIHRoZSBjaGFyYWN0ZXJcbiAgIyBwcmVjZWRpbmcgdGhlIGN1cnNvci4gT3RoZXJ3aXNlIGRlbGV0ZSB0aGUgc2VsZWN0ZWQgdGV4dC5cbiAgYmFja3NwYWNlOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmJhY2tzcGFjZSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgZGVsZXRlIGFsbCBjaGFyYWN0ZXJzXG4gICMgb2YgdGhlIGNvbnRhaW5pbmcgd29yZCB0aGF0IHByZWNlZGUgdGhlIGN1cnNvci4gT3RoZXJ3aXNlIGRlbGV0ZSB0aGVcbiAgIyBzZWxlY3RlZCB0ZXh0LlxuICBiYWNrc3BhY2VUb0JlZ2lubmluZ09mV29yZDogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5iYWNrc3BhY2VUb0JlZ2lubmluZ09mV29yZCgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgZGVsZXRlIGFsbCBjaGFyYWN0ZXJzXG4gICMgb2YgdGhlIGNvbnRhaW5pbmcgbGluZSB0aGF0IHByZWNlZGUgdGhlIGN1cnNvci4gT3RoZXJ3aXNlIGRlbGV0ZSB0aGVcbiAgIyBzZWxlY3RlZCB0ZXh0LlxuICBiYWNrc3BhY2VUb0JlZ2lubmluZ09mTGluZTogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5iYWNrc3BhY2VUb0JlZ2lubmluZ09mTGluZSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgZGVsZXRlIHRoZSBjaGFyYWN0ZXJcbiAgIyBwcmVjZWRpbmcgdGhlIGN1cnNvci4gT3RoZXJ3aXNlIGRlbGV0ZSB0aGUgc2VsZWN0ZWQgdGV4dC5cbiAgZGVsZXRlOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmRlbGV0ZSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgaWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgZGVsZXRlIGFsbCBjaGFyYWN0ZXJzXG4gICMgb2YgdGhlIGNvbnRhaW5pbmcgd29yZCBmb2xsb3dpbmcgdGhlIGN1cnNvci4gT3RoZXJ3aXNlIGRlbGV0ZSB0aGUgc2VsZWN0ZWRcbiAgIyB0ZXh0LlxuICBkZWxldGVUb0VuZE9mV29yZDogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5kZWxldGVUb0VuZE9mV29yZCgpXG5cbiAgIyBQdWJsaWM6IERlbGV0ZSBhbGwgbGluZXMgaW50ZXJzZWN0aW5nIHNlbGVjdGlvbnMuXG4gIGRlbGV0ZUxpbmU6IC0+XG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uZGVsZXRlTGluZSgpXG5cbiAgIyBQdWJsaWM6IEluZGVudCByb3dzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zIGJ5IG9uZSBsZXZlbC5cbiAgaW5kZW50U2VsZWN0ZWRSb3dzOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG5cbiAgIyBQdWJsaWM6IE91dGRlbnQgcm93cyBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9ucyBieSBvbmUgbGV2ZWwuXG4gIG91dGRlbnRTZWxlY3RlZFJvd3M6IC0+XG4gICAgQG11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG5cbiAgIyBQdWJsaWM6IFRvZ2dsZSBsaW5lIGNvbW1lbnRzIGZvciByb3dzIGludGVyc2VjdGluZyBzZWxlY3Rpb25zLlxuICAjXG4gICMgSWYgdGhlIGN1cnJlbnQgZ3JhbW1hciBkb2Vzbid0IHN1cHBvcnQgY29tbWVudHMsIGRvZXMgbm90aGluZy5cbiAgI1xuICAjIFJldHVybnMgYW4ge0FycmF5fSBvZiB0aGUgY29tbWVudGVkIHtSYW5nZX1zLlxuICB0b2dnbGVMaW5lQ29tbWVudHNJblNlbGVjdGlvbjogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi50b2dnbGVMaW5lQ29tbWVudHMoKVxuXG4gICMgUHVibGljOiBJbmRlbnQgcm93cyBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9ucyBiYXNlZCBvbiB0aGUgZ3JhbW1hcidzIHN1Z2dlc3RlZFxuICAjIGluZGVudCBsZXZlbC5cbiAgYXV0b0luZGVudFNlbGVjdGVkUm93czogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKClcblxuICAjIElmIHNvZnQgdGFicyBhcmUgZW5hYmxlZCwgY29udmVydCBhbGwgaGFyZCB0YWJzIHRvIHNvZnQgdGFicyBpbiB0aGUgZ2l2ZW5cbiAgIyB7UmFuZ2V9LlxuICBub3JtYWxpemVUYWJzSW5CdWZmZXJSYW5nZTogKGJ1ZmZlclJhbmdlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGdldFNvZnRUYWJzKClcbiAgICBAc2NhbkluQnVmZmVyUmFuZ2UgL1xcdC9nLCBidWZmZXJSYW5nZSwgKHtyZXBsYWNlfSkgPT4gcmVwbGFjZShAZ2V0VGFiVGV4dCgpKVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBzZWxlY3Rpb24sIGlmIHRoZSBzZWxlY3Rpb24gaXMgZW1wdHksIGN1dCBhbGwgY2hhcmFjdGVyc1xuICAjIG9mIHRoZSBjb250YWluaW5nIGxpbmUgZm9sbG93aW5nIHRoZSBjdXJzb3IuIE90aGVyd2lzZSBjdXQgdGhlIHNlbGVjdGVkXG4gICMgdGV4dC5cbiAgY3V0VG9FbmRPZkxpbmU6IC0+XG4gICAgbWFpbnRhaW5DbGlwYm9hcmQgPSBmYWxzZVxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT5cbiAgICAgIHNlbGVjdGlvbi5jdXRUb0VuZE9mTGluZShtYWludGFpbkNsaXBib2FyZClcbiAgICAgIG1haW50YWluQ2xpcGJvYXJkID0gdHJ1ZVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBzZWxlY3Rpb24sIGN1dCB0aGUgc2VsZWN0ZWQgdGV4dC5cbiAgY3V0U2VsZWN0ZWRUZXh0OiAtPlxuICAgIG1haW50YWluQ2xpcGJvYXJkID0gZmFsc2VcbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+XG4gICAgICBzZWxlY3Rpb24uY3V0KG1haW50YWluQ2xpcGJvYXJkKVxuICAgICAgbWFpbnRhaW5DbGlwYm9hcmQgPSB0cnVlXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgY29weSB0aGUgc2VsZWN0ZWQgdGV4dC5cbiAgY29weVNlbGVjdGVkVGV4dDogLT5cbiAgICBtYWludGFpbkNsaXBib2FyZCA9IGZhbHNlXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICBzZWxlY3Rpb24uY29weShtYWludGFpbkNsaXBib2FyZClcbiAgICAgIG1haW50YWluQ2xpcGJvYXJkID0gdHJ1ZVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBzZWxlY3Rpb24sIHJlcGxhY2UgdGhlIHNlbGVjdGVkIHRleHQgd2l0aCB0aGUgY29udGVudHMgb2ZcbiAgIyB0aGUgY2xpcGJvYXJkLlxuICAjXG4gICMgSWYgdGhlIGNsaXBib2FyZCBjb250YWlucyB0aGUgc2FtZSBudW1iZXIgb2Ygc2VsZWN0aW9ucyBhcyB0aGUgY3VycmVudFxuICAjIGVkaXRvciwgZWFjaCBzZWxlY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBjb250ZW50IG9mIHRoZVxuICAjIGNvcnJlc3BvbmRpbmcgY2xpcGJvYXJkIHNlbGVjdGlvbiB0ZXh0LlxuICAjXG4gICMgb3B0aW9ucyAtIFNlZSB7U2VsZWN0aW9uOjppbnNlcnRUZXh0fS5cbiAgcGFzdGVUZXh0OiAob3B0aW9ucz17fSkgLT5cbiAgICB7dGV4dCwgbWV0YWRhdGF9ID0gYXRvbS5jbGlwYm9hcmQucmVhZFdpdGhNZXRhZGF0YSgpXG5cbiAgICBjb250YWluc05ld2xpbmVzID0gdGV4dC5pbmRleE9mKCdcXG4nKSBpc250IC0xXG5cbiAgICBpZiBtZXRhZGF0YT8uc2VsZWN0aW9ucz8gYW5kIG1ldGFkYXRhLnNlbGVjdGlvbnMubGVuZ3RoIGlzIEBnZXRTZWxlY3Rpb25zKCkubGVuZ3RoXG4gICAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24sIGluZGV4KSA9PlxuICAgICAgICB0ZXh0ID0gbWV0YWRhdGEuc2VsZWN0aW9uc1tpbmRleF1cbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwgb3B0aW9ucylcblxuICAgICAgcmV0dXJuXG5cbiAgICBlbHNlIGlmIGF0b20uY29uZmlnLmdldChcImVkaXRvci5ub3JtYWxpemVJbmRlbnRPblBhc3RlXCIpIGFuZCBtZXRhZGF0YT8uaW5kZW50QmFzaXM/XG4gICAgICBpZiAhQGdldEN1cnNvcigpLmhhc1ByZWNlZGluZ0NoYXJhY3RlcnNPbkxpbmUoKSBvciBjb250YWluc05ld2xpbmVzXG4gICAgICAgIG9wdGlvbnMuaW5kZW50QmFzaXMgPz0gbWV0YWRhdGEuaW5kZW50QmFzaXNcblxuICAgIEBpbnNlcnRUZXh0KHRleHQsIG9wdGlvbnMpXG5cbiAgIyBQdWJsaWM6IFVuZG8gdGhlIGxhc3QgY2hhbmdlLlxuICB1bmRvOiAtPlxuICAgIEBnZXRDdXJzb3IoKS5uZWVkc0F1dG9zY3JvbGwgPSB0cnVlXG4gICAgQGJ1ZmZlci51bmRvKHRoaXMpXG5cbiAgIyBQdWJsaWM6IFJlZG8gdGhlIGxhc3QgY2hhbmdlLlxuICByZWRvOiAtPlxuICAgIEBnZXRDdXJzb3IoKS5uZWVkc0F1dG9zY3JvbGwgPSB0cnVlXG4gICAgQGJ1ZmZlci5yZWRvKHRoaXMpXG5cbiAgIyBQdWJsaWM6IEZvbGQgdGhlIG1vc3QgcmVjZW50IGN1cnNvcidzIHJvdyBiYXNlZCBvbiBpdHMgaW5kZW50YXRpb24gbGV2ZWwuXG4gICNcbiAgIyBUaGUgZm9sZCB3aWxsIGV4dGVuZCBmcm9tIHRoZSBuZWFyZXN0IHByZWNlZGluZyBsaW5lIHdpdGggYSBsb3dlclxuICAjIGluZGVudGF0aW9uIGxldmVsIHVwIHRvIHRoZSBuZWFyZXN0IGZvbGxvd2luZyByb3cgd2l0aCBhIGxvd2VyIGluZGVudGF0aW9uXG4gICMgbGV2ZWwuXG4gIGZvbGRDdXJyZW50Um93OiAtPlxuICAgIGJ1ZmZlclJvdyA9IEBidWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKEBnZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpKS5yb3dcbiAgICBAZm9sZEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IFVuZm9sZCB0aGUgbW9zdCByZWNlbnQgY3Vyc29yJ3Mgcm93IGJ5IG9uZSBsZXZlbC5cbiAgdW5mb2xkQ3VycmVudFJvdzogLT5cbiAgICBidWZmZXJSb3cgPSBAYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihAZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKSkucm93XG4gICAgQHVuZm9sZEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgZm9sZCB0aGUgcm93cyBpdCBpbnRlcnNlY3RzLlxuICBmb2xkU2VsZWN0ZWRMaW5lczogLT5cbiAgICBzZWxlY3Rpb24uZm9sZCgpIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuXG4gICMgUHVibGljOiBGb2xkIGFsbCBmb2xkYWJsZSBsaW5lcy5cbiAgZm9sZEFsbDogLT5cbiAgICBAbGFuZ3VhZ2VNb2RlLmZvbGRBbGwoKVxuXG4gICMgUHVibGljOiBVbmZvbGQgYWxsIGV4aXN0aW5nIGZvbGRzLlxuICB1bmZvbGRBbGw6IC0+XG4gICAgQGxhbmd1YWdlTW9kZS51bmZvbGRBbGwoKVxuXG4gICMgUHVibGljOiBGb2xkIGFsbCBmb2xkYWJsZSBsaW5lcyBhdCB0aGUgZ2l2ZW4gaW5kZW50IGxldmVsLlxuICAjXG4gICMgbGV2ZWwgLSBBIHtOdW1iZXJ9LlxuICBmb2xkQWxsQXRJbmRlbnRMZXZlbDogKGxldmVsKSAtPlxuICAgIEBsYW5ndWFnZU1vZGUuZm9sZEFsbEF0SW5kZW50TGV2ZWwobGV2ZWwpXG5cbiAgIyBQdWJsaWM6IEZvbGQgdGhlIGdpdmVuIHJvdyBpbiBidWZmZXIgY29vcmRpbmF0ZXMgYmFzZWQgb24gaXRzIGluZGVudGF0aW9uXG4gICMgbGV2ZWwuXG4gICNcbiAgIyBJZiB0aGUgZ2l2ZW4gcm93IGlzIGZvbGRhYmxlLCB0aGUgZm9sZCB3aWxsIGJlZ2luIHRoZXJlLiBPdGhlcndpc2UsIGl0IHdpbGxcbiAgIyBiZWdpbiBhdCB0aGUgZmlyc3QgZm9sZGFibGUgcm93IHByZWNlZGluZyB0aGUgZ2l2ZW4gcm93LlxuICAjXG4gICMgYnVmZmVyUm93IC0gQSB7TnVtYmVyfS5cbiAgZm9sZEJ1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT5cbiAgICBAbGFuZ3VhZ2VNb2RlLmZvbGRCdWZmZXJSb3coYnVmZmVyUm93KVxuXG4gICMgUHVibGljOiBVbmZvbGQgYWxsIGZvbGRzIGNvbnRhaW5pbmcgdGhlIGdpdmVuIHJvdyBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBidWZmZXJSb3cgLSBBIHtOdW1iZXJ9XG4gIHVuZm9sZEJ1ZmZlclJvdzogKGJ1ZmZlclJvdykgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci51bmZvbGRCdWZmZXJSb3coYnVmZmVyUm93KVxuXG4gICMgUHVibGljOiBEZXRlcm1pbmUgd2hldGhlciB0aGUgZ2l2ZW4gcm93IGluIGJ1ZmZlciBjb29yZGluYXRlcyBpcyBmb2xkYWJsZS5cbiAgI1xuICAjIEEgKmZvbGRhYmxlKiByb3cgaXMgYSByb3cgdGhhdCAqc3RhcnRzKiBhIHJvdyByYW5nZSB0aGF0IGNhbiBiZSBmb2xkZWQuXG4gICNcbiAgIyBidWZmZXJSb3cgLSBBIHtOdW1iZXJ9XG4gICNcbiAgIyBSZXR1cm5zIGEge0Jvb2xlYW59LlxuICBpc0ZvbGRhYmxlQXRCdWZmZXJSb3c6IChidWZmZXJSb3cpIC0+XG4gICAgQGxhbmd1YWdlTW9kZS5pc0ZvbGRhYmxlQXRCdWZmZXJSb3coYnVmZmVyUm93KVxuXG4gICMgVE9ETzogUmVuYW1lIHRvIGZvbGRSb3dSYW5nZT9cbiAgY3JlYXRlRm9sZDogKHN0YXJ0Um93LCBlbmRSb3cpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuY3JlYXRlRm9sZChzdGFydFJvdywgZW5kUm93KVxuXG4gICMge0RlbGVnYXRlcyB0bzogRGlzcGxheUJ1ZmZlci5kZXN0cm95Rm9sZFdpdGhJZH1cbiAgZGVzdHJveUZvbGRXaXRoSWQ6IChpZCkgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5kZXN0cm95Rm9sZFdpdGhJZChpZClcblxuICAjIFJlbW92ZSBhbnkge0ZvbGR9cyBmb3VuZCB0aGF0IGludGVyc2VjdCB0aGUgZ2l2ZW4gYnVmZmVyIHJvdy5cbiAgZGVzdHJveUZvbGRzSW50ZXJzZWN0aW5nQnVmZmVyUmFuZ2U6IChidWZmZXJSYW5nZSkgLT5cbiAgICBmb3Igcm93IGluIFtidWZmZXJSYW5nZS5zdGFydC5yb3cuLmJ1ZmZlclJhbmdlLmVuZC5yb3ddXG4gICAgICBAdW5mb2xkQnVmZmVyUm93KHJvdylcblxuICAjIFB1YmxpYzogRm9sZCB0aGUgZ2l2ZW4gYnVmZmVyIHJvdyBpZiBpdCBpc24ndCBjdXJyZW50bHkgZm9sZGVkLCBhbmQgdW5mb2xkXG4gICMgaXQgb3RoZXJ3aXNlLlxuICB0b2dnbGVGb2xkQXRCdWZmZXJSb3c6IChidWZmZXJSb3cpIC0+XG4gICAgaWYgQGlzRm9sZGVkQXRCdWZmZXJSb3coYnVmZmVyUm93KVxuICAgICAgQHVuZm9sZEJ1ZmZlclJvdyhidWZmZXJSb3cpXG4gICAgZWxzZVxuICAgICAgQGZvbGRCdWZmZXJSb3coYnVmZmVyUm93KVxuXG4gICMgUHVibGljOiBEZXRlcm1pbmUgd2hldGhlciB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBjdXJzb3IncyByb3cgaXMgZm9sZGVkLlxuICAjXG4gICMgUmV0dXJucyBhIHtCb29sZWFufS5cbiAgaXNGb2xkZWRBdEN1cnNvclJvdzogLT5cbiAgICBAaXNGb2xkZWRBdFNjcmVlblJvdyhAZ2V0Q3Vyc29yU2NyZWVuUm93KCkpXG5cbiAgIyBQdWJsaWM6IERldGVybWluZSB3aGV0aGVyIHRoZSBnaXZlbiByb3cgaW4gYnVmZmVyIGNvb3JkaW5hdGVzIGlzIGZvbGRlZC5cbiAgI1xuICAjIGJ1ZmZlclJvdyAtIEEge051bWJlcn1cbiAgI1xuICAjIFJldHVybnMgYSB7Qm9vbGVhbn0uXG4gIGlzRm9sZGVkQXRCdWZmZXJSb3c6IChidWZmZXJSb3cpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuaXNGb2xkZWRBdEJ1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyBQdWJsaWM6IERldGVybWluZSB3aGV0aGVyIHRoZSBnaXZlbiByb3cgaW4gc2NyZWVuIGNvb3JkaW5hdGVzIGlzIGZvbGRlZC5cbiAgI1xuICAjIHNjcmVlblJvdyAtIEEge051bWJlcn1cbiAgI1xuICAjIFJldHVybnMgYSB7Qm9vbGVhbn0uXG4gIGlzRm9sZGVkQXRTY3JlZW5Sb3c6IChzY3JlZW5Sb3cpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuaXNGb2xkZWRBdFNjcmVlblJvdyhzY3JlZW5Sb3cpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmxhcmdlc3RGb2xkQ29udGFpbmluZ0J1ZmZlclJvd31cbiAgbGFyZ2VzdEZvbGRDb250YWluaW5nQnVmZmVyUm93OiAoYnVmZmVyUm93KSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLmxhcmdlc3RGb2xkQ29udGFpbmluZ0J1ZmZlclJvdyhidWZmZXJSb3cpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLmxhcmdlc3RGb2xkU3RhcnRpbmdBdFNjcmVlblJvd31cbiAgbGFyZ2VzdEZvbGRTdGFydGluZ0F0U2NyZWVuUm93OiAoc2NyZWVuUm93KSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLmxhcmdlc3RGb2xkU3RhcnRpbmdBdFNjcmVlblJvdyhzY3JlZW5Sb3cpXG5cbiAgIyB7RGVsZWdhdGVzIHRvOiBEaXNwbGF5QnVmZmVyLm91dGVybW9zdEZvbGRzRm9yQnVmZmVyUm93UmFuZ2V9XG4gIG91dGVybW9zdEZvbGRzSW5CdWZmZXJSb3dSYW5nZTogKHN0YXJ0Um93LCBlbmRSb3cpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIub3V0ZXJtb3N0Rm9sZHNJbkJ1ZmZlclJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG5cbiAgIyBNb3ZlIGxpbmVzIGludGVyc2VjdGlvbiB0aGUgbW9zdCByZWNlbnQgc2VsZWN0aW9uIHVwIGJ5IG9uZSByb3cgaW4gc2NyZWVuXG4gICMgY29vcmRpbmF0ZXMuXG4gIG1vdmVMaW5lVXA6IC0+XG4gICAgc2VsZWN0aW9uID0gQGdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKVxuICAgIHJldHVybiBpZiBzZWxlY3Rpb24uc3RhcnQucm93IGlzIDBcbiAgICBsYXN0Um93ID0gQGJ1ZmZlci5nZXRMYXN0Um93KClcbiAgICByZXR1cm4gaWYgc2VsZWN0aW9uLmlzRW1wdHkoKSBhbmQgc2VsZWN0aW9uLnN0YXJ0LnJvdyBpcyBsYXN0Um93IGFuZCBAYnVmZmVyLmdldExhc3RMaW5lKCkgaXMgJydcblxuICAgIEB0cmFuc2FjdCA9PlxuICAgICAgZm9sZGVkUm93cyA9IFtdXG4gICAgICByb3dzID0gW3NlbGVjdGlvbi5zdGFydC5yb3cuLnNlbGVjdGlvbi5lbmQucm93XVxuICAgICAgaWYgc2VsZWN0aW9uLnN0YXJ0LnJvdyBpc250IHNlbGVjdGlvbi5lbmQucm93IGFuZCBzZWxlY3Rpb24uZW5kLmNvbHVtbiBpcyAwXG4gICAgICAgIHJvd3MucG9wKCkgdW5sZXNzIEBpc0ZvbGRlZEF0QnVmZmVyUm93KHNlbGVjdGlvbi5lbmQucm93KVxuXG4gICAgICAjIE1vdmUgbGluZSBhcm91bmQgdGhlIGZvbGQgdGhhdCBpcyBkaXJlY3RseSBhYm92ZSB0aGUgc2VsZWN0aW9uXG4gICAgICBwcmVjZWRpbmdTY3JlZW5Sb3cgPSBAc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihbc2VsZWN0aW9uLnN0YXJ0LnJvd10pLnRyYW5zbGF0ZShbLTFdKVxuICAgICAgcHJlY2VkaW5nQnVmZmVyUm93ID0gQGJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24ocHJlY2VkaW5nU2NyZWVuUm93KS5yb3dcbiAgICAgIGlmIGZvbGQgPSBAbGFyZ2VzdEZvbGRDb250YWluaW5nQnVmZmVyUm93KHByZWNlZGluZ0J1ZmZlclJvdylcbiAgICAgICAgaW5zZXJ0RGVsdGEgPSBmb2xkLmdldEJ1ZmZlclJhbmdlKCkuZ2V0Um93Q291bnQoKVxuICAgICAgZWxzZVxuICAgICAgICBpbnNlcnREZWx0YSA9IDFcblxuICAgICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICAgIGlmIGZvbGQgPSBAZGlzcGxheUJ1ZmZlci5sYXJnZXN0Rm9sZFN0YXJ0aW5nQXRCdWZmZXJSb3cocm93KVxuICAgICAgICAgIGJ1ZmZlclJhbmdlID0gZm9sZC5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICAgc3RhcnRSb3cgPSBidWZmZXJSYW5nZS5zdGFydC5yb3dcbiAgICAgICAgICBlbmRSb3cgPSBidWZmZXJSYW5nZS5lbmQucm93XG4gICAgICAgICAgZm9sZGVkUm93cy5wdXNoKHN0YXJ0Um93IC0gaW5zZXJ0RGVsdGEpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzdGFydFJvdyA9IHJvd1xuICAgICAgICAgIGVuZFJvdyA9IHJvd1xuXG4gICAgICAgIGluc2VydFBvc2l0aW9uID0gUG9pbnQuZnJvbU9iamVjdChbc3RhcnRSb3cgLSBpbnNlcnREZWx0YV0pXG4gICAgICAgIGVuZFBvc2l0aW9uID0gUG9pbnQubWluKFtlbmRSb3cgKyAxXSwgQGJ1ZmZlci5nZXRFbmRQb3NpdGlvbigpKVxuICAgICAgICBsaW5lcyA9IEBidWZmZXIuZ2V0VGV4dEluUmFuZ2UoW1tzdGFydFJvd10sIGVuZFBvc2l0aW9uXSlcbiAgICAgICAgaWYgZW5kUG9zaXRpb24ucm93IGlzIGxhc3RSb3cgYW5kIGVuZFBvc2l0aW9uLmNvbHVtbiA+IDAgYW5kIG5vdCBAYnVmZmVyLmxpbmVFbmRpbmdGb3JSb3coZW5kUG9zaXRpb24ucm93KVxuICAgICAgICAgIGxpbmVzID0gXCIje2xpbmVzfVxcblwiXG5cbiAgICAgICAgQGJ1ZmZlci5kZWxldGVSb3dzKHN0YXJ0Um93LCBlbmRSb3cpXG5cbiAgICAgICAgIyBNYWtlIHN1cmUgdGhlIGluc2VydGVkIHRleHQgZG9lc24ndCBnbyBpbnRvIGFuIGV4aXN0aW5nIGZvbGRcbiAgICAgICAgaWYgZm9sZCA9IEBkaXNwbGF5QnVmZmVyLmxhcmdlc3RGb2xkU3RhcnRpbmdBdEJ1ZmZlclJvdyhpbnNlcnRQb3NpdGlvbi5yb3cpXG4gICAgICAgICAgQHVuZm9sZEJ1ZmZlclJvdyhpbnNlcnRQb3NpdGlvbi5yb3cpXG4gICAgICAgICAgZm9sZGVkUm93cy5wdXNoKGluc2VydFBvc2l0aW9uLnJvdyArIGVuZFJvdyAtIHN0YXJ0Um93ICsgZm9sZC5nZXRCdWZmZXJSYW5nZSgpLmdldFJvd0NvdW50KCkpXG5cbiAgICAgICAgQGJ1ZmZlci5pbnNlcnQoaW5zZXJ0UG9zaXRpb24sIGxpbmVzKVxuXG4gICAgICAjIFJlc3RvcmUgZm9sZHMgdGhhdCBleGlzdGVkIGJlZm9yZSB0aGUgbGluZXMgd2VyZSBtb3ZlZFxuICAgICAgZm9yIGZvbGRlZFJvdyBpbiBmb2xkZWRSb3dzIHdoZW4gMCA8PSBmb2xkZWRSb3cgPD0gQGdldExhc3RCdWZmZXJSb3coKVxuICAgICAgICBAZm9sZEJ1ZmZlclJvdyhmb2xkZWRSb3cpXG5cbiAgICAgIEBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHNlbGVjdGlvbi50cmFuc2xhdGUoWy1pbnNlcnREZWx0YV0pLCBwcmVzZXJ2ZUZvbGRzOiB0cnVlLCBhdXRvc2Nyb2xsOiB0cnVlKVxuXG4gICMgTW92ZSBsaW5lcyBpbnRlcnNlY3RpbmcgdGhlIG1vc3QgcmVjZW50IHNlbGVjdGlvbiBkb3duIGJ5IG9uZSByb3cgaW4gc2NyZWVuXG4gICMgY29vcmRpbmF0ZXMuXG4gIG1vdmVMaW5lRG93bjogLT5cbiAgICBzZWxlY3Rpb24gPSBAZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpXG4gICAgbGFzdFJvdyA9IEBidWZmZXIuZ2V0TGFzdFJvdygpXG4gICAgcmV0dXJuIGlmIHNlbGVjdGlvbi5lbmQucm93IGlzIGxhc3RSb3dcbiAgICByZXR1cm4gaWYgc2VsZWN0aW9uLmVuZC5yb3cgaXMgbGFzdFJvdyAtIDEgYW5kIEBidWZmZXIuZ2V0TGFzdExpbmUoKSBpcyAnJ1xuXG4gICAgQHRyYW5zYWN0ID0+XG4gICAgICBmb2xkZWRSb3dzID0gW11cbiAgICAgIHJvd3MgPSBbc2VsZWN0aW9uLmVuZC5yb3cuLnNlbGVjdGlvbi5zdGFydC5yb3ddXG4gICAgICBpZiBzZWxlY3Rpb24uc3RhcnQucm93IGlzbnQgc2VsZWN0aW9uLmVuZC5yb3cgYW5kIHNlbGVjdGlvbi5lbmQuY29sdW1uIGlzIDBcbiAgICAgICAgcm93cy5zaGlmdCgpIHVubGVzcyBAaXNGb2xkZWRBdEJ1ZmZlclJvdyhzZWxlY3Rpb24uZW5kLnJvdylcblxuICAgICAgIyBNb3ZlIGxpbmUgYXJvdW5kIHRoZSBmb2xkIHRoYXQgaXMgZGlyZWN0bHkgYmVsb3cgdGhlIHNlbGVjdGlvblxuICAgICAgZm9sbG93aW5nU2NyZWVuUm93ID0gQHNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oW3NlbGVjdGlvbi5lbmQucm93XSkudHJhbnNsYXRlKFsxXSlcbiAgICAgIGZvbGxvd2luZ0J1ZmZlclJvdyA9IEBidWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGZvbGxvd2luZ1NjcmVlblJvdykucm93XG4gICAgICBpZiBmb2xkID0gQGxhcmdlc3RGb2xkQ29udGFpbmluZ0J1ZmZlclJvdyhmb2xsb3dpbmdCdWZmZXJSb3cpXG4gICAgICAgIGluc2VydERlbHRhID0gZm9sZC5nZXRCdWZmZXJSYW5nZSgpLmdldFJvd0NvdW50KClcbiAgICAgIGVsc2VcbiAgICAgICAgaW5zZXJ0RGVsdGEgPSAxXG5cbiAgICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgICBpZiBmb2xkID0gQGRpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRTdGFydGluZ0F0QnVmZmVyUm93KHJvdylcbiAgICAgICAgICBidWZmZXJSYW5nZSA9IGZvbGQuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICAgIHN0YXJ0Um93ID0gYnVmZmVyUmFuZ2Uuc3RhcnQucm93XG4gICAgICAgICAgZW5kUm93ID0gYnVmZmVyUmFuZ2UuZW5kLnJvd1xuICAgICAgICAgIGZvbGRlZFJvd3MucHVzaChlbmRSb3cgKyBpbnNlcnREZWx0YSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHN0YXJ0Um93ID0gcm93XG4gICAgICAgICAgZW5kUm93ID0gcm93XG5cbiAgICAgICAgaWYgZW5kUm93ICsgMSBpcyBsYXN0Um93XG4gICAgICAgICAgZW5kUG9zaXRpb24gPSBbZW5kUm93LCBAYnVmZmVyLmxpbmVMZW5ndGhGb3JSb3coZW5kUm93KV1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVuZFBvc2l0aW9uID0gW2VuZFJvdyArIDFdXG4gICAgICAgIGxpbmVzID0gQGJ1ZmZlci5nZXRUZXh0SW5SYW5nZShbW3N0YXJ0Um93XSwgZW5kUG9zaXRpb25dKVxuICAgICAgICBAYnVmZmVyLmRlbGV0ZVJvd3Moc3RhcnRSb3csIGVuZFJvdylcblxuICAgICAgICBpbnNlcnRQb3NpdGlvbiA9IFBvaW50Lm1pbihbc3RhcnRSb3cgKyBpbnNlcnREZWx0YV0sIEBidWZmZXIuZ2V0RW5kUG9zaXRpb24oKSlcbiAgICAgICAgaWYgaW5zZXJ0UG9zaXRpb24ucm93IGlzIEBidWZmZXIuZ2V0TGFzdFJvdygpIGFuZCBpbnNlcnRQb3NpdGlvbi5jb2x1bW4gPiAwXG4gICAgICAgICAgbGluZXMgPSBcIlxcbiN7bGluZXN9XCJcblxuICAgICAgICAjIE1ha2Ugc3VyZSB0aGUgaW5zZXJ0ZWQgdGV4dCBkb2Vzbid0IGdvIGludG8gYW4gZXhpc3RpbmcgZm9sZFxuICAgICAgICBpZiBmb2xkID0gQGRpc3BsYXlCdWZmZXIubGFyZ2VzdEZvbGRTdGFydGluZ0F0QnVmZmVyUm93KGluc2VydFBvc2l0aW9uLnJvdylcbiAgICAgICAgICBAdW5mb2xkQnVmZmVyUm93KGluc2VydFBvc2l0aW9uLnJvdylcbiAgICAgICAgICBmb2xkZWRSb3dzLnB1c2goaW5zZXJ0UG9zaXRpb24ucm93ICsgZm9sZC5nZXRCdWZmZXJSYW5nZSgpLmdldFJvd0NvdW50KCkpXG5cbiAgICAgICAgQGJ1ZmZlci5pbnNlcnQoaW5zZXJ0UG9zaXRpb24sIGxpbmVzKVxuXG4gICAgICAjIFJlc3RvcmUgZm9sZHMgdGhhdCBleGlzdGVkIGJlZm9yZSB0aGUgbGluZXMgd2VyZSBtb3ZlZFxuICAgICAgZm9yIGZvbGRlZFJvdyBpbiBmb2xkZWRSb3dzIHdoZW4gMCA8PSBmb2xkZWRSb3cgPD0gQGdldExhc3RCdWZmZXJSb3coKVxuICAgICAgICBAZm9sZEJ1ZmZlclJvdyhmb2xkZWRSb3cpXG5cbiAgICAgIEBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHNlbGVjdGlvbi50cmFuc2xhdGUoW2luc2VydERlbHRhXSksIHByZXNlcnZlRm9sZHM6IHRydWUsIGF1dG9zY3JvbGw6IHRydWUpXG5cbiAgIyBEdXBsaWNhdGUgdGhlIG1vc3QgcmVjZW50IGN1cnNvcidzIGN1cnJlbnQgbGluZS5cbiAgZHVwbGljYXRlTGluZXM6IC0+XG4gICAgQHRyYW5zYWN0ID0+XG4gICAgICBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKS5yZXZlcnNlKClcbiAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICAgICB7c3RhcnR9ID0gc2VsZWN0aW9uLmdldFNjcmVlblJhbmdlKClcbiAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0VG9TY3JlZW5Qb3NpdGlvbihbc3RhcnQucm93ICsgMSwgMF0pXG5cbiAgICAgICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICAgICAgZW5kUm93KytcblxuICAgICAgICBmb2xkZWRSb3dSYW5nZXMgPVxuICAgICAgICAgIEBvdXRlcm1vc3RGb2xkc0luQnVmZmVyUm93UmFuZ2Uoc3RhcnRSb3csIGVuZFJvdylcbiAgICAgICAgICAgIC5tYXAgKGZvbGQpIC0+IGZvbGQuZ2V0QnVmZmVyUm93UmFuZ2UoKVxuXG4gICAgICAgIHJhbmdlVG9EdXBsaWNhdGUgPSBbW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgMF1dXG4gICAgICAgIHRleHRUb0R1cGxpY2F0ZSA9IEBnZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZVRvRHVwbGljYXRlKVxuICAgICAgICB0ZXh0VG9EdXBsaWNhdGUgPSAnXFxuJyArIHRleHRUb0R1cGxpY2F0ZSBpZiBlbmRSb3cgPiBAZ2V0TGFzdEJ1ZmZlclJvdygpXG4gICAgICAgIEBidWZmZXIuaW5zZXJ0KFtlbmRSb3csIDBdLCB0ZXh0VG9EdXBsaWNhdGUpXG5cbiAgICAgICAgZGVsdGEgPSBlbmRSb3cgLSBzdGFydFJvd1xuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2Uoc2VsZWN0ZWRCdWZmZXJSYW5nZS50cmFuc2xhdGUoW2RlbHRhLCAwXSkpXG4gICAgICAgIGZvciBbZm9sZFN0YXJ0Um93LCBmb2xkRW5kUm93XSBpbiBmb2xkZWRSb3dSYW5nZXNcbiAgICAgICAgICBAY3JlYXRlRm9sZChmb2xkU3RhcnRSb3cgKyBkZWx0YSwgZm9sZEVuZFJvdyArIGRlbHRhKVxuXG4gICMgRGVwcmVjYXRlZDogVXNlIHs6OmR1cGxpY2F0ZUxpbmVzfSBpbnN0ZWFkLlxuICBkdXBsaWNhdGVMaW5lOiAtPlxuICAgIGRlcHJlY2F0ZShcIlVzZSBFZGl0b3I6OmR1cGxpY2F0ZUxpbmVzKCkgaW5zdGVhZFwiKVxuICAgIEBkdXBsaWNhdGVMaW5lcygpXG5cbiAgIyBQdWJsaWM6IE11dGF0ZSB0aGUgdGV4dCBvZiBhbGwgdGhlIHNlbGVjdGlvbnMgaW4gYSBzaW5nbGUgdHJhbnNhY3Rpb24uXG4gICNcbiAgIyBBbGwgdGhlIGNoYW5nZXMgbWFkZSBpbnNpZGUgdGhlIGdpdmVuIHtGdW5jdGlvbn0gY2FuIGJlIHJldmVydGVkIHdpdGggYVxuICAjIHNpbmdsZSBjYWxsIHRvIHs6OnVuZG99LlxuICAjXG4gICMgZm4gLSBBIHtGdW5jdGlvbn0gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGVhY2gge1NlbGVjdGlvbn0uXG4gIG11dGF0ZVNlbGVjdGVkVGV4dDogKGZuKSAtPlxuICAgIEB0cmFuc2FjdCA9PiBmbihzZWxlY3Rpb24saW5kZXgpIGZvciBzZWxlY3Rpb24saW5kZXggaW4gQGdldFNlbGVjdGlvbnMoKVxuXG4gIHJlcGxhY2VTZWxlY3RlZFRleHQ6IChvcHRpb25zPXt9LCBmbikgLT5cbiAgICB7c2VsZWN0V29yZElmRW1wdHl9ID0gb3B0aW9uc1xuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgLT5cbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmIHNlbGVjdFdvcmRJZkVtcHR5IGFuZCBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICAgIHNlbGVjdGlvbi5zZWxlY3RXb3JkKClcbiAgICAgIHRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KGZuKHRleHQpKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHtEaXNwbGF5QnVmZmVyTWFya2VyfSBmb3IgdGhlIGdpdmVuIG1hcmtlciBpZC5cbiAgZ2V0TWFya2VyOiAoaWQpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuZ2V0TWFya2VyKGlkKVxuXG4gICMgUHVibGljOiBHZXQgYWxsIHtEaXNwbGF5QnVmZmVyTWFya2VyfXMuXG4gIGdldE1hcmtlcnM6IC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuZ2V0TWFya2VycygpXG5cbiAgIyBQdWJsaWM6IEZpbmQgYWxsIHtEaXNwbGF5QnVmZmVyTWFya2VyfXMgdGhhdCBtYXRjaCB0aGUgZ2l2ZW4gcHJvcGVydGllcy5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIGZpbmRzIG1hcmtlcnMgYmFzZWQgb24gdGhlIGdpdmVuIHByb3BlcnRpZXMuIE1hcmtlcnMgY2FuIGJlXG4gICMgYXNzb2NpYXRlZCB3aXRoIGN1c3RvbSBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBjb21wYXJlZCB3aXRoIGJhc2ljIGVxdWFsaXR5LlxuICAjIEluIGFkZGl0aW9uLCB0aGVyZSBhcmUgc2V2ZXJhbCBzcGVjaWFsIHByb3BlcnRpZXMgdGhhdCB3aWxsIGJlIGNvbXBhcmVkXG4gICMgd2l0aCB0aGUgcmFuZ2Ugb2YgdGhlIG1hcmtlcnMgcmF0aGVyIHRoYW4gdGhlaXIgcHJvcGVydGllcy5cbiAgI1xuICAjIHByb3BlcnRpZXMgLSBBbiB7T2JqZWN0fSBjb250YWluaW5nIHByb3BlcnRpZXMgdGhhdCBlYWNoIHJldHVybmVkIG1hcmtlclxuICAjICAgbXVzdCBzYXRpc2Z5LiBNYXJrZXJzIGNhbiBiZSBhc3NvY2lhdGVkIHdpdGggY3VzdG9tIHByb3BlcnRpZXMsIHdoaWNoIGFyZVxuICAjICAgY29tcGFyZWQgd2l0aCBiYXNpYyBlcXVhbGl0eS4gSW4gYWRkaXRpb24sIHNldmVyYWwgcmVzZXJ2ZWQgcHJvcGVydGllc1xuICAjICAgY2FuIGJlIHVzZWQgdG8gZmlsdGVyIG1hcmtlcnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCByYW5nZTpcbiAgIyAgICAgOnN0YXJ0QnVmZmVyUm93IC0gT25seSBpbmNsdWRlIG1hcmtlcnMgc3RhcnRpbmcgYXQgdGhpcyByb3cgaW4gYnVmZmVyXG4gICMgICAgICAgY29vcmRpbmF0ZXMuXG4gICMgICAgIDplbmRCdWZmZXJSb3cgLSBPbmx5IGluY2x1ZGUgbWFya2VycyBlbmRpbmcgYXQgdGhpcyByb3cgaW4gYnVmZmVyXG4gICMgICAgICAgY29vcmRpbmF0ZXMuXG4gICMgICAgIDpjb250YWluc0J1ZmZlclJhbmdlIC0gT25seSBpbmNsdWRlIG1hcmtlcnMgY29udGFpbmluZyB0aGlzIHtSYW5nZX0gb3JcbiAgIyAgICAgICBpbiByYW5nZS1jb21wYXRpYmxlIHtBcnJheX0gaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICAjICAgICA6Y29udGFpbnNCdWZmZXJQb3NpdGlvbiAtIE9ubHkgaW5jbHVkZSBtYXJrZXJzIGNvbnRhaW5pbmcgdGhpcyB7UG9pbnR9XG4gICMgICAgICAgb3Ige0FycmF5fSBvZiBgW3JvdywgY29sdW1uXWAgaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICBmaW5kTWFya2VyczogKHByb3BlcnRpZXMpIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuZmluZE1hcmtlcnMocHJvcGVydGllcylcblxuICAjIFB1YmxpYzogTWFyayB0aGUgZ2l2ZW4gcmFuZ2UgaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgcmFuZ2UgLSBBIHtSYW5nZX0gb3IgcmFuZ2UtY29tcGF0aWJsZSB7QXJyYXl9LlxuICAjIG9wdGlvbnMgLSBTZWUge1RleHRCdWZmZXI6Om1hcmtSYW5nZX0uXG4gICNcbiAgIyBSZXR1cm5zIGEge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9LlxuICBtYXJrU2NyZWVuUmFuZ2U6IChhcmdzLi4uKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLm1hcmtTY3JlZW5SYW5nZShhcmdzLi4uKVxuXG4gICMgUHVibGljOiBNYXJrIHRoZSBnaXZlbiByYW5nZSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyByYW5nZSAtIEEge1JhbmdlfSBvciByYW5nZS1jb21wYXRpYmxlIHtBcnJheX0uXG4gICMgb3B0aW9ucyAtIFNlZSB7VGV4dEJ1ZmZlcjo6bWFya1JhbmdlfS5cbiAgI1xuICAjIFJldHVybnMgYSB7RGlzcGxheUJ1ZmZlck1hcmtlcn0uXG4gIG1hcmtCdWZmZXJSYW5nZTogKGFyZ3MuLi4pIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIubWFya0J1ZmZlclJhbmdlKGFyZ3MuLi4pXG5cbiAgIyBQdWJsaWM6IE1hcmsgdGhlIGdpdmVuIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgI1xuICAjIHBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgYFtyb3csIGNvbHVtbl1gLlxuICAjIG9wdGlvbnMgLSBTZWUge1RleHRCdWZmZXI6Om1hcmtSYW5nZX0uXG4gICNcbiAgIyBSZXR1cm5zIGEge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9LlxuICBtYXJrU2NyZWVuUG9zaXRpb246IChhcmdzLi4uKSAtPlxuICAgIEBkaXNwbGF5QnVmZmVyLm1hcmtTY3JlZW5Qb3NpdGlvbihhcmdzLi4uKVxuXG4gICMgUHVibGljOiBNYXJrIHRoZSBnaXZlbiBwb3NpdGlvbiBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBwb3NpdGlvbiAtIEEge1BvaW50fSBvciB7QXJyYXl9IG9mIGBbcm93LCBjb2x1bW5dYC5cbiAgIyBvcHRpb25zIC0gU2VlIHtUZXh0QnVmZmVyOjptYXJrUmFuZ2V9LlxuICAjXG4gICMgUmV0dXJucyBhIHtEaXNwbGF5QnVmZmVyTWFya2VyfS5cbiAgbWFya0J1ZmZlclBvc2l0aW9uOiAoYXJncy4uLikgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5tYXJrQnVmZmVyUG9zaXRpb24oYXJncy4uLilcblxuICAjIHtEZWxlZ2F0ZXMgdG86IERpc3BsYXlCdWZmZXIuZGVzdHJveU1hcmtlcn1cbiAgZGVzdHJveU1hcmtlcjogKGFyZ3MuLi4pIC0+XG4gICAgQGRpc3BsYXlCdWZmZXIuZGVzdHJveU1hcmtlcihhcmdzLi4uKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIG51bWJlciBvZiBtYXJrZXJzIGluIHRoaXMgZWRpdG9yJ3MgYnVmZmVyLlxuICAjXG4gICMgUmV0dXJucyBhIHtOdW1iZXJ9LlxuICBnZXRNYXJrZXJDb3VudDogLT5cbiAgICBAYnVmZmVyLmdldE1hcmtlckNvdW50KClcblxuICAjIFB1YmxpYzogRGV0ZXJtaW5lIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBjdXJzb3JzLlxuICBoYXNNdWx0aXBsZUN1cnNvcnM6IC0+XG4gICAgQGdldEN1cnNvcnMoKS5sZW5ndGggPiAxXG5cbiAgIyBQdWJsaWM6IEdldCBhbiBBcnJheSBvZiBhbGwge0N1cnNvcn1zLlxuICBnZXRDdXJzb3JzOiAtPiBuZXcgQXJyYXkoQGN1cnNvcnMuLi4pXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCB7Q3Vyc29yfS5cbiAgZ2V0Q3Vyc29yOiAtPlxuICAgIF8ubGFzdChAY3Vyc29ycylcblxuICAjIFB1YmxpYzogQWRkIGEgY3Vyc29yIGF0IHRoZSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBSZXR1cm5zIGEge0N1cnNvcn0uXG4gIGFkZEN1cnNvckF0U2NyZWVuUG9zaXRpb246IChzY3JlZW5Qb3NpdGlvbikgLT5cbiAgICBAbWFya1NjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uLCBAZ2V0U2VsZWN0aW9uTWFya2VyQXR0cmlidXRlcygpKVxuICAgIEBnZXRMYXN0U2VsZWN0aW9uKCkuY3Vyc29yXG5cbiAgIyBQdWJsaWM6IEFkZCBhIGN1cnNvciBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgUmV0dXJucyBhIHtDdXJzb3J9LlxuICBhZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uOiAoYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgQG1hcmtCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbiwgQGdldFNlbGVjdGlvbk1hcmtlckF0dHJpYnV0ZXMoKSlcbiAgICBAZ2V0TGFzdFNlbGVjdGlvbigpLmN1cnNvclxuXG4gICMgQWRkIGEgY3Vyc29yIGJhc2VkIG9uIHRoZSBnaXZlbiB7RGlzcGxheUJ1ZmZlck1hcmtlcn0uXG4gIGFkZEN1cnNvcjogKG1hcmtlcikgLT5cbiAgICBjdXJzb3IgPSBuZXcgQ3Vyc29yKGVkaXRvcjogdGhpcywgbWFya2VyOiBtYXJrZXIpXG4gICAgQGN1cnNvcnMucHVzaChjdXJzb3IpXG4gICAgQGVtaXQgJ2N1cnNvci1hZGRlZCcsIGN1cnNvclxuICAgIGN1cnNvclxuXG4gICMgUmVtb3ZlIHRoZSBnaXZlbiBjdXJzb3IgZnJvbSB0aGlzIGVkaXRvci5cbiAgcmVtb3ZlQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIF8ucmVtb3ZlKEBjdXJzb3JzLCBjdXJzb3IpXG5cbiAgIyBBZGQgYSB7U2VsZWN0aW9ufSBiYXNlZCBvbiB0aGUgZ2l2ZW4ge0Rpc3BsYXlCdWZmZXJNYXJrZXJ9LlxuICAjXG4gICMgbWFya2VyICAtIFRoZSB7RGlzcGxheUJ1ZmZlck1hcmtlcn0gdG8gaGlnaGxpZ2h0XG4gICMgb3B0aW9ucyAtIEFuIHtPYmplY3R9IHRoYXQgcGVydGFpbnMgdG8gdGhlIHtTZWxlY3Rpb259IGNvbnN0cnVjdG9yLlxuICAjXG4gICMgUmV0dXJucyB0aGUgbmV3IHtTZWxlY3Rpb259LlxuICBhZGRTZWxlY3Rpb246IChtYXJrZXIsIG9wdGlvbnM9e30pIC0+XG4gICAgdW5sZXNzIG1hcmtlci5nZXRBdHRyaWJ1dGVzKCkucHJlc2VydmVGb2xkc1xuICAgICAgQGRlc3Ryb3lGb2xkc0ludGVyc2VjdGluZ0J1ZmZlclJhbmdlKG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKVxuICAgIGN1cnNvciA9IEBhZGRDdXJzb3IobWFya2VyKVxuICAgIHNlbGVjdGlvbiA9IG5ldyBTZWxlY3Rpb24oXy5leHRlbmQoe2VkaXRvcjogdGhpcywgbWFya2VyLCBjdXJzb3J9LCBvcHRpb25zKSlcbiAgICBAc2VsZWN0aW9ucy5wdXNoKHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb25CdWZmZXJSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgQG1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgaWYgc2VsZWN0aW9uLmRlc3Ryb3llZFxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgIGlmIHNlbGVjdGlvbi5pbnRlcnNlY3RzQnVmZmVyUmFuZ2Uoc2VsZWN0aW9uQnVmZmVyUmFuZ2UpXG4gICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblxuICAgIGVsc2VcbiAgICAgIEBlbWl0ICdzZWxlY3Rpb24tYWRkZWQnLCBzZWxlY3Rpb25cbiAgICAgIHNlbGVjdGlvblxuXG4gICMgUHVibGljOiBBZGQgYSBzZWxlY3Rpb24gZm9yIHRoZSBnaXZlbiByYW5nZSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBidWZmZXJSYW5nZSAtIEEge1JhbmdlfVxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIHtPYmplY3R9OlxuICAjICAgOnJldmVyc2VkIC0gQSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHRvIGNyZWF0ZSB0aGUgc2VsZWN0aW9uIGluIGFcbiAgIyAgICAgcmV2ZXJzZWQgb3JpZW50YXRpb24uXG4gICNcbiAgIyBSZXR1cm5zIHRoZSBhZGRlZCB7U2VsZWN0aW9ufS5cbiAgYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2U6IChidWZmZXJSYW5nZSwgb3B0aW9ucz17fSkgLT5cbiAgICBAbWFya0J1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlLCBfLmRlZmF1bHRzKEBnZXRTZWxlY3Rpb25NYXJrZXJBdHRyaWJ1dGVzKCksIG9wdGlvbnMpKVxuICAgIEBnZXRMYXN0U2VsZWN0aW9uKClcblxuICAjIFB1YmxpYzogU2V0IHRoZSBzZWxlY3RlZCByYW5nZSBpbiBidWZmZXIgY29vcmRpbmF0ZXMuIElmIHRoZXJlIGFyZSBtdWx0aXBsZVxuICAjIHNlbGVjdGlvbnMsIHRoZXkgYXJlIHJlZHVjZWQgdG8gYSBzaW5nbGUgc2VsZWN0aW9uIHdpdGggdGhlIGdpdmVuIHJhbmdlLlxuICAjXG4gICMgYnVmZmVyUmFuZ2UgLSBBIHtSYW5nZX0gb3IgcmFuZ2UtY29tcGF0aWJsZSB7QXJyYXl9LlxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIHtPYmplY3R9OlxuICAjICAgOnJldmVyc2VkIC0gQSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHRvIGNyZWF0ZSB0aGUgc2VsZWN0aW9uIGluIGFcbiAgIyAgICAgcmV2ZXJzZWQgb3JpZW50YXRpb24uXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2U6IChidWZmZXJSYW5nZSwgb3B0aW9ucykgLT5cbiAgICBAc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoW2J1ZmZlclJhbmdlXSwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogU2V0IHRoZSBzZWxlY3RlZCByYW5nZSBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuIElmIHRoZXJlIGFyZSBtdWx0aXBsZVxuICAjIHNlbGVjdGlvbnMsIHRoZXkgYXJlIHJlZHVjZWQgdG8gYSBzaW5nbGUgc2VsZWN0aW9uIHdpdGggdGhlIGdpdmVuIHJhbmdlLlxuICAjXG4gICMgc2NyZWVuUmFuZ2UgLSBBIHtSYW5nZX0gb3IgcmFuZ2UtY29tcGF0aWJsZSB7QXJyYXl9LlxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIHtPYmplY3R9OlxuICAjICAgOnJldmVyc2VkIC0gQSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHRvIGNyZWF0ZSB0aGUgc2VsZWN0aW9uIGluIGFcbiAgIyAgICAgcmV2ZXJzZWQgb3JpZW50YXRpb24uXG4gIHNldFNlbGVjdGVkU2NyZWVuUmFuZ2U6IChzY3JlZW5SYW5nZSwgb3B0aW9ucykgLT5cbiAgICBAc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShAYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSwgb3B0aW9ucyksIG9wdGlvbnMpXG5cbiAgIyBQdWJsaWM6IFNldCB0aGUgc2VsZWN0ZWQgcmFuZ2VzIGluIGJ1ZmZlciBjb29yZGluYXRlcy4gSWYgdGhlcmUgYXJlIG11bHRpcGxlXG4gICMgc2VsZWN0aW9ucywgdGhleSBhcmUgcmVwbGFjZWQgYnkgbmV3IHNlbGVjdGlvbnMgd2l0aCB0aGUgZ2l2ZW4gcmFuZ2VzLlxuICAjXG4gICMgYnVmZmVyUmFuZ2VzIC0gQW4ge0FycmF5fSBvZiB7UmFuZ2V9cyBvciByYW5nZS1jb21wYXRpYmxlIHtBcnJheX1zLlxuICAjIG9wdGlvbnMgLSBBbiBvcHRpb25zIHtPYmplY3R9OlxuICAjICAgOnJldmVyc2VkIC0gQSB7Qm9vbGVhbn0gaW5kaWNhdGluZyB3aGV0aGVyIHRvIGNyZWF0ZSB0aGUgc2VsZWN0aW9uIGluIGFcbiAgIyAgICAgcmV2ZXJzZWQgb3JpZW50YXRpb24uXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzOiAoYnVmZmVyUmFuZ2VzLCBvcHRpb25zPXt9KSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihcIlBhc3NlZCBhbiBlbXB0eSBhcnJheSB0byBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlc1wiKSB1bmxlc3MgYnVmZmVyUmFuZ2VzLmxlbmd0aFxuXG4gICAgc2VsZWN0aW9ucyA9IEBnZXRTZWxlY3Rpb25zKClcbiAgICBzZWxlY3Rpb24uZGVzdHJveSgpIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1tidWZmZXJSYW5nZXMubGVuZ3RoLi4uXVxuXG4gICAgQG1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucyBvcHRpb25zLCA9PlxuICAgICAgZm9yIGJ1ZmZlclJhbmdlLCBpIGluIGJ1ZmZlclJhbmdlc1xuICAgICAgICBidWZmZXJSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoYnVmZmVyUmFuZ2UpXG4gICAgICAgIGlmIHNlbGVjdGlvbnNbaV1cbiAgICAgICAgICBzZWxlY3Rpb25zW2ldLnNldEJ1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlLCBvcHRpb25zKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlLCBvcHRpb25zKVxuXG4gICMgUmVtb3ZlIHRoZSBnaXZlbiBzZWxlY3Rpb24uXG4gIHJlbW92ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBfLnJlbW92ZShAc2VsZWN0aW9ucywgc2VsZWN0aW9uKVxuICAgIEBlbWl0ICdzZWxlY3Rpb24tcmVtb3ZlZCcsIHNlbGVjdGlvblxuXG4gICMgUmVkdWNlIG9uZSBvciBtb3JlIHNlbGVjdGlvbnMgdG8gYSBzaW5nbGUgZW1wdHkgc2VsZWN0aW9uIGJhc2VkIG9uIHRoZSBtb3N0XG4gICMgcmVjZW50bHkgYWRkZWQgY3Vyc29yLlxuICBjbGVhclNlbGVjdGlvbnM6IC0+XG4gICAgQGNvbnNvbGlkYXRlU2VsZWN0aW9ucygpXG4gICAgQGdldFNlbGVjdGlvbigpLmNsZWFyKClcblxuICAjIFJlZHVjZSBtdWx0aXBsZSBzZWxlY3Rpb25zIHRvIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHNlbGVjdGlvbi5cbiAgY29uc29saWRhdGVTZWxlY3Rpb25zOiAtPlxuICAgIHNlbGVjdGlvbnMgPSBAZ2V0U2VsZWN0aW9ucygpXG4gICAgaWYgc2VsZWN0aW9ucy5sZW5ndGggPiAxXG4gICAgICBzZWxlY3Rpb24uZGVzdHJveSgpIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1swLi4uLTFdXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBzZWxlY3Rpb25TY3JlZW5SYW5nZUNoYW5nZWQ6IChzZWxlY3Rpb24pIC0+XG4gICAgQGVtaXQgJ3NlbGVjdGlvbi1zY3JlZW4tcmFuZ2UtY2hhbmdlZCcsIHNlbGVjdGlvblxuXG4gICMgUHVibGljOiBHZXQgY3VycmVudCB7U2VsZWN0aW9ufXMuXG4gICNcbiAgIyBSZXR1cm5zOiBBbiB7QXJyYXl9IG9mIHtTZWxlY3Rpb259cy5cbiAgZ2V0U2VsZWN0aW9uczogLT4gbmV3IEFycmF5KEBzZWxlY3Rpb25zLi4uKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIG1vc3QgcmVjZW50IHtTZWxlY3Rpb259IG9yIHRoZSBzZWxlY3Rpb24gYXQgdGhlIGdpdmVuXG4gICMgaW5kZXguXG4gICNcbiAgIyBpbmRleCAtIE9wdGlvbmFsLiBUaGUgaW5kZXggb2YgdGhlIHNlbGVjdGlvbiB0byByZXR1cm4sIGJhc2VkIG9uIHRoZSBvcmRlclxuICAjICAgaW4gd2hpY2ggdGhlIHNlbGVjdGlvbnMgd2VyZSBhZGRlZC5cbiAgI1xuICAjIFJldHVybnMgYSB7U2VsZWN0aW9ufS5cbiAgIyBvciB0aGUgIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gIGdldFNlbGVjdGlvbjogKGluZGV4KSAtPlxuICAgIGluZGV4ID89IEBzZWxlY3Rpb25zLmxlbmd0aCAtIDFcbiAgICBAc2VsZWN0aW9uc1tpbmRleF1cblxuICAjIFB1YmxpYzogR2V0IHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHtTZWxlY3Rpb259LlxuICAjXG4gICMgUmV0dXJucyBhIHtTZWxlY3Rpb259LlxuICBnZXRMYXN0U2VsZWN0aW9uOiAtPlxuICAgIF8ubGFzdChAc2VsZWN0aW9ucylcblxuICAjIFB1YmxpYzogR2V0IGFsbCB7U2VsZWN0aW9ufXMsIG9yZGVyZWQgYnkgdGhlaXIgcG9zaXRpb24gaW4gdGhlIGJ1ZmZlclxuICAjIGluc3RlYWQgb2YgdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgd2VyZSBhZGRlZC5cbiAgI1xuICAjIFJldHVybnMgYW4ge0FycmF5fSBvZiB7U2VsZWN0aW9ufXMuXG4gIGdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbjogLT5cbiAgICBAZ2V0U2VsZWN0aW9ucygpLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIGxhc3Qge1NlbGVjdGlvbn0gYmFzZWQgb24gaXRzIHBvc2l0aW9uIGluIHRoZSBidWZmZXIuXG4gICNcbiAgIyBSZXR1cm5zIGEge1NlbGVjdGlvbn0uXG4gIGdldExhc3RTZWxlY3Rpb25JbkJ1ZmZlcjogLT5cbiAgICBfLmxhc3QoQGdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpKVxuXG4gICMgUHVibGljOiBEZXRlcm1pbmUgaWYgYSBnaXZlbiByYW5nZSBpbiBidWZmZXIgY29vcmRpbmF0ZXMgaW50ZXJzZWN0cyBhXG4gICMgc2VsZWN0aW9uLlxuICAjXG4gICMgYnVmZmVyUmFuZ2UgLSBBIHtSYW5nZX0gb3IgcmFuZ2UtY29tcHRhdGlibGUge0FycmF5fS5cbiAgI1xuICAjIFJldHVybnMgYSB7Qm9vbGVhbn0uXG4gIHNlbGVjdGlvbkludGVyc2VjdHNCdWZmZXJSYW5nZTogKGJ1ZmZlclJhbmdlKSAtPlxuICAgIF8uYW55IEBnZXRTZWxlY3Rpb25zKCksIChzZWxlY3Rpb24pIC0+XG4gICAgICBzZWxlY3Rpb24uaW50ZXJzZWN0c0J1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGdpdmVuIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgI1xuICAjIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBjdXJzb3JzLCB0aGV5IHdpbGwgYmUgY29uc29saWRhdGVkIHRvIGEgc2luZ2xlIGN1cnNvci5cbiAgI1xuICAjIHBvc2l0aW9uIC0gQSB7UG9pbnR9IG9yIHtBcnJheX0gb2YgYFtyb3csIGNvbHVtbl1gXG4gICMgb3B0aW9ucyAgLSBBbiB7T2JqZWN0fSBjb21iaW5pbmcgb3B0aW9ucyBmb3Igezo6Y2xpcFNjcmVlblBvc2l0aW9ufSB3aXRoOlxuICAjICAgOmF1dG9zY3JvbGwgLSBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVkaXRvciBzY3JvbGxzIHRvIHRoZSBuZXcgY3Vyc29yJ3NcbiAgIyAgICAgcG9zaXRpb24uIERlZmF1bHRzIHRvIHRydWUuXG4gIHNldEN1cnNvclNjcmVlblBvc2l0aW9uOiAocG9zaXRpb24sIG9wdGlvbnMpIC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihwb3NpdGlvbiwgb3B0aW9ucylcblxuICAjIFB1YmxpYzogR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBjdXJzb3IgaW4gc2NyZWVuXG4gICMgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBSZXR1cm5zIGEge1BvaW50fS5cbiAgZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb246IC0+XG4gICAgQGdldEN1cnNvcigpLmdldFNjcmVlblBvc2l0aW9uKClcblxuICAjIFB1YmxpYzogR2V0IHRoZSByb3cgb2YgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgY3Vyc29yIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgdGhlIHNjcmVlbiByb3cge051bWJlcn0uXG4gIGdldEN1cnNvclNjcmVlblJvdzogLT5cbiAgICBAZ2V0Q3Vyc29yKCkuZ2V0U2NyZWVuUm93KClcblxuICAjIFB1YmxpYzogTW92ZSB0aGUgY3Vyc29yIHRvIHRoZSBnaXZlbiBwb3NpdGlvbiBpbiBidWZmZXIgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgY3Vyc29ycywgdGhleSB3aWxsIGJlIGNvbnNvbGlkYXRlZCB0byBhIHNpbmdsZSBjdXJzb3IuXG4gICNcbiAgIyBwb3NpdGlvbiAtIEEge1BvaW50fSBvciB7QXJyYXl9IG9mIGBbcm93LCBjb2x1bW5dYFxuICAjIG9wdGlvbnMgIC0gQW4ge09iamVjdH0gY29tYmluaW5nIG9wdGlvbnMgZm9yIHs6OmNsaXBTY3JlZW5Qb3NpdGlvbn0gd2l0aDpcbiAgIyAgIDphdXRvc2Nyb2xsIC0gRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBlZGl0b3Igc2Nyb2xscyB0byB0aGUgbmV3IGN1cnNvcidzXG4gICMgICAgIHBvc2l0aW9uLiBEZWZhdWx0cyB0byB0cnVlLlxuICBzZXRDdXJzb3JCdWZmZXJQb3NpdGlvbjogKHBvc2l0aW9uLCBvcHRpb25zKSAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9zaXRpb24sIG9wdGlvbnMpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUgcG9zaXRpb24gb2YgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgY3Vyc29yIGluIGJ1ZmZlclxuICAjIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgUmV0dXJucyBhIHtQb2ludH0uXG4gIGdldEN1cnNvckJ1ZmZlclBvc2l0aW9uOiAtPlxuICAgIEBnZXRDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUge1JhbmdlfSBvZiB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBzZWxlY3Rpb24gaW4gc2NyZWVuXG4gICMgY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBSZXR1cm5zIGEge1JhbmdlfS5cbiAgZ2V0U2VsZWN0ZWRTY3JlZW5SYW5nZTogLT5cbiAgICBAZ2V0TGFzdFNlbGVjdGlvbigpLmdldFNjcmVlblJhbmdlKClcblxuICAjIFB1YmxpYzogR2V0IHRoZSB7UmFuZ2V9IG9mIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHNlbGVjdGlvbiBpbiBidWZmZXJcbiAgIyBjb29yZGluYXRlcy5cbiAgI1xuICAjIFJldHVybnMgYSB7UmFuZ2V9LlxuICBnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlOiAtPlxuICAgIEBnZXRMYXN0U2VsZWN0aW9uKCkuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHtSYW5nZX1zIG9mIGFsbCBzZWxlY3Rpb25zIGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIFRoZSByYW5nZXMgYXJlIHNvcnRlZCBieSB0aGVpciBwb3NpdGlvbiBpbiB0aGUgYnVmZmVyLlxuICAjXG4gICMgUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtSYW5nZX1zLlxuICBnZXRTZWxlY3RlZEJ1ZmZlclJhbmdlczogLT5cbiAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHtSYW5nZX1zIG9mIGFsbCBzZWxlY3Rpb25zIGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgI1xuICAjIFRoZSByYW5nZXMgYXJlIHNvcnRlZCBieSB0aGVpciBwb3NpdGlvbiBpbiB0aGUgYnVmZmVyLlxuICAjXG4gICMgUmV0dXJucyBhbiB7QXJyYXl9IG9mIHtSYW5nZX1zLlxuICBnZXRTZWxlY3RlZFNjcmVlblJhbmdlczogLT5cbiAgICBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKSBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuXG4gICMgUHVibGljOiBHZXQgdGhlIHNlbGVjdGVkIHRleHQgb2YgdGhlIG1vc3QgcmVjZW50bHkgYWRkZWQgc2VsZWN0aW9uLlxuICAjXG4gICMgUmV0dXJucyBhIHtTdHJpbmd9LlxuICBnZXRTZWxlY3RlZFRleHQ6IC0+XG4gICAgQGdldExhc3RTZWxlY3Rpb24oKS5nZXRUZXh0KClcblxuICAjIFB1YmxpYzogR2V0IHRoZSB0ZXh0IGluIHRoZSBnaXZlbiB7UmFuZ2V9IGluIGJ1ZmZlciBjb29yZGluYXRlcy5cbiAgI1xuICAjIHJhbmdlIC0gQSB7UmFuZ2V9IG9yIHJhbmdlLWNvbXBhdGlibGUge0FycmF5fS5cbiAgI1xuICAjIFJldHVybnMgYSB7U3RyaW5nfS5cbiAgZ2V0VGV4dEluQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBAYnVmZmVyLmdldFRleHRJblJhbmdlKHJhbmdlKVxuXG4gICMgUHVibGljOiBTZXQgdGhlIHRleHQgaW4gdGhlIGdpdmVuIHtSYW5nZX0gaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICAjXG4gICMgcmFuZ2UgLSBBIHtSYW5nZX0gb3IgcmFuZ2UtY29tcGF0aWJsZSB7QXJyYXl9LlxuICAjIHRleHQgLSBBIHtTdHJpbmd9XG4gICNcbiAgIyBSZXR1cm5zIHRoZSB7UmFuZ2V9IG9mIHRoZSBuZXdseS1pbnNlcnRlZCB0ZXh0LlxuICBzZXRUZXh0SW5CdWZmZXJSYW5nZTogKHJhbmdlLCB0ZXh0KSAtPiBAZ2V0QnVmZmVyKCkuc2V0VGV4dEluUmFuZ2UocmFuZ2UsIHRleHQpXG5cbiAgIyBQdWJsaWM6IEdldCB0aGUge1JhbmdlfSBvZiB0aGUgcGFyYWdyYXBoIHN1cnJvdW5kaW5nIHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkXG4gICMgY3Vyc29yLlxuICAjXG4gICMgUmV0dXJucyBhIHtSYW5nZX0uXG4gIGdldEN1cnJlbnRQYXJhZ3JhcGhCdWZmZXJSYW5nZTogLT5cbiAgICBAZ2V0Q3Vyc29yKCkuZ2V0Q3VycmVudFBhcmFncmFwaEJ1ZmZlclJhbmdlKClcblxuICAjIFB1YmxpYzogUmV0dXJucyB0aGUgd29yZCBzdXJyb3VuZGluZyB0aGUgbW9zdCByZWNlbnRseSBhZGRlZCBjdXJzb3IuXG4gICNcbiAgIyBvcHRpb25zIC0gU2VlIHtDdXJzb3I6OmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbn0uXG4gIGdldFdvcmRVbmRlckN1cnNvcjogKG9wdGlvbnMpIC0+XG4gICAgQGdldFRleHRJbkJ1ZmZlclJhbmdlKEBnZXRDdXJzb3IoKS5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKG9wdGlvbnMpKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB1cCBvbmUgcm93IGluIHNjcmVlbiBjb29yZGluYXRlcy5cbiAgbW92ZUN1cnNvclVwOiAobGluZUNvdW50KSAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVVwKGxpbmVDb3VudCwgbW92ZVRvRW5kT2ZTZWxlY3Rpb246IHRydWUpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIGRvd24gb25lIHJvdyBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gIG1vdmVDdXJzb3JEb3duOiAobGluZUNvdW50KSAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZURvd24obGluZUNvdW50LCBtb3ZlVG9FbmRPZlNlbGVjdGlvbjogdHJ1ZSlcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgbGVmdCBvbmUgY29sdW1uLlxuICBtb3ZlQ3Vyc29yTGVmdDogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVMZWZ0KG1vdmVUb0VuZE9mU2VsZWN0aW9uOiB0cnVlKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciByaWdodCBvbmUgY29sdW1uLlxuICBtb3ZlQ3Vyc29yUmlnaHQ6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlUmlnaHQobW92ZVRvRW5kT2ZTZWxlY3Rpb246IHRydWUpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSB0b3Agb2YgdGhlIGJ1ZmZlci5cbiAgI1xuICAjIElmIHRoZXJlIGFyZSBtdWx0aXBsZSBjdXJzb3JzLCB0aGV5IHdpbGwgYmUgbWVyZ2VkIGludG8gYSBzaW5nbGUgY3Vyc29yLlxuICBtb3ZlQ3Vyc29yVG9Ub3A6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9Ub3AoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgYm90dG9tIG9mIHRoZSBidWZmZXIuXG4gICNcbiAgIyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgY3Vyc29ycywgdGhleSB3aWxsIGJlIG1lcmdlZCBpbnRvIGEgc2luZ2xlIGN1cnNvci5cbiAgbW92ZUN1cnNvclRvQm90dG9tOiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVRvQm90dG9tKClcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiBpdHMgbGluZSBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gIG1vdmVDdXJzb3JUb0JlZ2lubmluZ09mU2NyZWVuTGluZTogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0JlZ2lubmluZ09mU2NyZWVuTGluZSgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgaXRzIGxpbmUgaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICBtb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZkxpbmU6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgZmlyc3Qgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyIG9mIGl0cyBsaW5lLlxuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3Rlck9mTGluZTogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgdG8gdGhlIGVuZCBvZiBpdHMgbGluZSBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gIG1vdmVDdXJzb3JUb0VuZE9mU2NyZWVuTGluZTogLT5cbiAgICBAbW92ZUN1cnNvcnMgKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVUb0VuZE9mU2NyZWVuTGluZSgpXG5cbiAgIyBQdWJsaWM6IE1vdmUgZXZlcnkgY3Vyc29yIHRvIHRoZSBlbmQgb2YgaXRzIGxpbmUgaW4gYnVmZmVyIGNvb3JkaW5hdGVzLlxuICBtb3ZlQ3Vyc29yVG9FbmRPZkxpbmU6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9FbmRPZkxpbmUoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIGl0cyBzdXJyb3VuZGluZyB3b3JkLlxuICBtb3ZlQ3Vyc29yVG9CZWdpbm5pbmdPZldvcmQ6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZldvcmQoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgZW5kIG9mIGl0cyBzdXJyb3VuZGluZyB3b3JkLlxuICBtb3ZlQ3Vyc29yVG9FbmRPZldvcmQ6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9FbmRPZldvcmQoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmQuXG4gIG1vdmVDdXJzb3JUb0JlZ2lubmluZ09mTmV4dFdvcmQ6IC0+XG4gICAgQG1vdmVDdXJzb3JzIChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVG9CZWdpbm5pbmdPZk5leHRXb3JkKClcblxuICAjIFB1YmxpYzogTW92ZSBldmVyeSBjdXJzb3IgdG8gdGhlIHByZXZpb3VzIHdvcmQgYm91bmRhcnkuXG4gIG1vdmVDdXJzb3JUb1ByZXZpb3VzV29yZEJvdW5kYXJ5OiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVRvUHJldmlvdXNXb3JkQm91bmRhcnkoKVxuXG4gICMgUHVibGljOiBNb3ZlIGV2ZXJ5IGN1cnNvciB0byB0aGUgbmV4dCB3b3JkIGJvdW5kYXJ5LlxuICBtb3ZlQ3Vyc29yVG9OZXh0V29yZEJvdW5kYXJ5OiAtPlxuICAgIEBtb3ZlQ3Vyc29ycyAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVRvTmV4dFdvcmRCb3VuZGFyeSgpXG5cbiAgc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbjogLT5cbiAgICBAZ2V0Q3Vyc29yKCkuYXV0b3Njcm9sbCgpXG5cbiAgcGFnZVVwOiAtPlxuICAgIEBzZXRTY3JvbGxUb3AoQGdldFNjcm9sbFRvcCgpIC0gQGdldEhlaWdodCgpKVxuXG4gIHBhZ2VEb3duOiAtPlxuICAgIEBzZXRTY3JvbGxUb3AoQGdldFNjcm9sbFRvcCgpICsgQGdldEhlaWdodCgpKVxuXG4gIG1vdmVDdXJzb3JzOiAoZm4pIC0+XG4gICAgQG1vdmluZ0N1cnNvcnMgPSB0cnVlXG4gICAgQGJhdGNoVXBkYXRlcyA9PlxuICAgICAgZm4oY3Vyc29yKSBmb3IgY3Vyc29yIGluIEBnZXRDdXJzb3JzKClcbiAgICAgIEBtZXJnZUN1cnNvcnMoKVxuICAgICAgQG1vdmluZ0N1cnNvcnMgPSBmYWxzZVxuICAgICAgQGVtaXQgJ2N1cnNvcnMtbW92ZWQnXG5cbiAgY3Vyc29yTW92ZWQ6IChldmVudCkgLT5cbiAgICBAZW1pdCAnY3Vyc29yLW1vdmVkJywgZXZlbnRcbiAgICBAZW1pdCAnY3Vyc29ycy1tb3ZlZCcgdW5sZXNzIEBtb3ZpbmdDdXJzb3JzXG5cbiAgIyBQdWJsaWM6IFNlbGVjdCBmcm9tIHRoZSBjdXJyZW50IGN1cnNvciBwb3NpdGlvbiB0byB0aGUgZ2l2ZW4gcG9zaXRpb24gaW5cbiAgIyBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgI1xuICAjIHBvc2l0aW9uIC0gQW4gaW5zdGFuY2Ugb2Yge1BvaW50fSwgd2l0aCBhIGdpdmVuIGByb3dgIGFuZCBgY29sdW1uYC5cbiAgc2VsZWN0VG9TY3JlZW5Qb3NpdGlvbjogKHBvc2l0aW9uKSAtPlxuICAgIGxhc3RTZWxlY3Rpb24gPSBAZ2V0TGFzdFNlbGVjdGlvbigpXG4gICAgbGFzdFNlbGVjdGlvbi5zZWxlY3RUb1NjcmVlblBvc2l0aW9uKHBvc2l0aW9uKVxuICAgIEBtZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMocmV2ZXJzZWQ6IGxhc3RTZWxlY3Rpb24uaXNSZXZlcnNlZCgpKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gb25lIGNoYXJhY3RlciByaWdodHdhcmQgd2hpbGVcbiAgIyBwcmVzZXJ2aW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWF5IG1lcmdlIHNlbGVjdGlvbnMgdGhhdCBlbmQgdXAgaW50ZXNlY3RpbmcuXG4gIHNlbGVjdFJpZ2h0OiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0UmlnaHQoKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gb25lIGNoYXJhY3RlciBsZWZ0d2FyZCB3aGlsZVxuICAjIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgc2VsZWN0TGVmdDogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0JhY2t3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RMZWZ0KClcblxuICAjIFB1YmxpYzogTW92ZSB0aGUgY3Vyc29yIG9mIGVhY2ggc2VsZWN0aW9uIG9uZSBjaGFyYWN0ZXIgdXB3YXJkIHdoaWxlXG4gICMgcHJlc2VydmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICBzZWxlY3RVcDogKHJvd0NvdW50KSAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zQmFja3dhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFVwKHJvd0NvdW50KVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gb25lIGNoYXJhY3RlciBkb3dud2FyZCB3aGlsZVxuICAjIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgc2VsZWN0RG93bjogKHJvd0NvdW50KSAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0RG93bihyb3dDb3VudClcblxuICAjIFB1YmxpYzogU2VsZWN0IGZyb20gdGhlIHRvcCBvZiB0aGUgYnVmZmVyIHRvIHRoZSBlbmQgb2YgdGhlIGxhc3Qgc2VsZWN0aW9uXG4gICMgaW4gdGhlIGJ1ZmZlci5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1lcmdlcyBtdWx0aXBsZSBzZWxlY3Rpb25zIGludG8gYSBzaW5nbGUgc2VsZWN0aW9uLlxuICBzZWxlY3RUb1RvcDogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0JhY2t3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RUb1RvcCgpXG5cbiAgIyBQdWJsaWM6IFNlbGVjdCBhbGwgdGV4dCBpbiB0aGUgYnVmZmVyLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWVyZ2VzIG11bHRpcGxlIHNlbGVjdGlvbnMgaW50byBhIHNpbmdsZSBzZWxlY3Rpb24uXG4gIHNlbGVjdEFsbDogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdEFsbCgpXG5cbiAgIyBQdWJsaWM6IFNlbGVjdHMgZnJvbSB0aGUgdG9wIG9mIHRoZSBmaXJzdCBzZWxlY3Rpb24gaW4gdGhlIGJ1ZmZlciB0byB0aGUgZW5kXG4gICMgb2YgdGhlIGJ1ZmZlci5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1lcmdlcyBtdWx0aXBsZSBzZWxlY3Rpb25zIGludG8gYSBzaW5nbGUgc2VsZWN0aW9uLlxuICBzZWxlY3RUb0JvdHRvbTogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvQm90dG9tKClcblxuICAjIFB1YmxpYzogTW92ZSB0aGUgY3Vyc29yIG9mIGVhY2ggc2VsZWN0aW9uIHRvIHRoZSBiZWdpbm5pbmcgb2YgaXRzIGxpbmVcbiAgIyB3aGlsZSBwcmVzZXJ2aW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWF5IG1lcmdlIHNlbGVjdGlvbnMgdGhhdCBlbmQgdXAgaW50ZXNlY3RpbmcuXG4gIHNlbGVjdFRvQmVnaW5uaW5nT2ZMaW5lOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zQmFja3dhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvQmVnaW5uaW5nT2ZMaW5lKClcblxuICAjIFB1YmxpYzogTW92ZSB0aGUgY3Vyc29yIG9mIGVhY2ggc2VsZWN0aW9uIHRvIHRoZSBmaXJzdCBub24td2hpdGVzcGFjZVxuICAjIGNoYXJhY3RlciBvZiBpdHMgbGluZSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLiBJZiB0aGVcbiAgIyBjdXJzb3IgaXMgYWxyZWFkeSBvbiB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lLCBtb3ZlIGl0IHRvIHRoZVxuICAjIGJlZ2lubmluZyBvZiB0aGUgbGluZS5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICBzZWxlY3RUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zQmFja3dhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG4gICMgUHVibGljOiBNb3ZlIHRoZSBjdXJzb3Igb2YgZWFjaCBzZWxlY3Rpb24gdG8gdGhlIGVuZCBvZiBpdHMgbGluZSB3aGlsZVxuICAjIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gICNcbiAgIyBUaGlzIG1ldGhvZCBtYXkgbWVyZ2Ugc2VsZWN0aW9ucyB0aGF0IGVuZCB1cCBpbnRlc2VjdGluZy5cbiAgc2VsZWN0VG9FbmRPZkxpbmU6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RUb0VuZE9mTGluZSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgbW92ZSBpdHMgY3Vyc29yIHRvIHRoZSBwcmVjZWRpbmcgd29yZCBib3VuZGFyeVxuICAjIHdoaWxlIG1haW50YWluaW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWF5IG1lcmdlIHNlbGVjdGlvbnMgdGhhdCBlbmQgdXAgaW50ZXNlY3RpbmcuXG4gIHNlbGVjdFRvUHJldmlvdXNXb3JkQm91bmRhcnk6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9QcmV2aW91c1dvcmRCb3VuZGFyeSgpXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgbW92ZSBpdHMgY3Vyc29yIHRvIHRoZSBuZXh0IHdvcmQgYm91bmRhcnkgd2hpbGVcbiAgIyBtYWludGFpbmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgI1xuICAjIFRoaXMgbWV0aG9kIG1heSBtZXJnZSBzZWxlY3Rpb25zIHRoYXQgZW5kIHVwIGludGVzZWN0aW5nLlxuICBzZWxlY3RUb05leHRXb3JkQm91bmRhcnk6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RUb05leHRXb3JkQm91bmRhcnkoKVxuXG4gICMgUHVibGljOiBGb3IgZWFjaCBjdXJzb3IsIHNlbGVjdCB0aGUgY29udGFpbmluZyBsaW5lLlxuICAjXG4gICMgVGhpcyBtZXRob2QgbWVyZ2VzIHNlbGVjdGlvbnMgb24gc3VjY2Vzc2l2ZSBsaW5lcy5cbiAgc2VsZWN0TGluZTogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdExpbmUoKVxuXG4gICMgUHVibGljOiBBZGQgYSBzaW1pbGFybHktc2hhcGVkIHNlbGVjdGlvbiB0byB0aGUgbmV4dCBlbGliaWJsZSBsaW5lIGJlbG93XG4gICMgZWFjaCBzZWxlY3Rpb24uXG4gICNcbiAgIyBPcGVyYXRlcyBvbiBhbGwgc2VsZWN0aW9ucy4gSWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgYWRkcyBhbiBlbXB0eVxuICAjIHNlbGVjdGlvbiB0byB0aGUgbmV4dCBmb2xsb3dpbmcgbm9uLWVtcHR5IGxpbmUgYXMgY2xvc2UgdG8gdGhlIGN1cnJlbnRcbiAgIyBzZWxlY3Rpb24ncyBjb2x1bW4gYXMgcG9zc2libGUuIElmIHRoZSBzZWxlY3Rpb24gaXMgbm9uLWVtcHR5LCBhZGRzIGFcbiAgIyBzZWxlY3Rpb24gdG8gdGhlIG5leHQgbGluZSB0aGF0IGlzIGxvbmcgZW5vdWdoIGZvciBhIG5vbi1lbXB0eSBzZWxlY3Rpb25cbiAgIyBzdGFydGluZyBhdCB0aGUgc2FtZSBjb2x1bW4gYXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHRvIGJlIGFkZGVkIHRvIGl0LlxuICBhZGRTZWxlY3Rpb25CZWxvdzogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLmFkZFNlbGVjdGlvbkJlbG93KClcblxuICAjIFB1YmxpYzogQWRkIGEgc2ltaWxhcmx5LXNoYXBlZCBzZWxlY3Rpb24gdG8gdGhlIG5leHQgZWxpYmlibGUgbGluZSBhYm92ZVxuICAjIGVhY2ggc2VsZWN0aW9uLlxuICAjXG4gICMgT3BlcmF0ZXMgb24gYWxsIHNlbGVjdGlvbnMuIElmIHRoZSBzZWxlY3Rpb24gaXMgZW1wdHksIGFkZHMgYW4gZW1wdHlcbiAgIyBzZWxlY3Rpb24gdG8gdGhlIG5leHQgcHJlY2VkaW5nIG5vbi1lbXB0eSBsaW5lIGFzIGNsb3NlIHRvIHRoZSBjdXJyZW50XG4gICMgc2VsZWN0aW9uJ3MgY29sdW1uIGFzIHBvc3NpYmxlLiBJZiB0aGUgc2VsZWN0aW9uIGlzIG5vbi1lbXB0eSwgYWRkcyBhXG4gICMgc2VsZWN0aW9uIHRvIHRoZSBuZXh0IGxpbmUgdGhhdCBpcyBsb25nIGVub3VnaCBmb3IgYSBub24tZW1wdHkgc2VsZWN0aW9uXG4gICMgc3RhcnRpbmcgYXQgdGhlIHNhbWUgY29sdW1uIGFzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiB0byBiZSBhZGRlZCB0byBpdC5cbiAgYWRkU2VsZWN0aW9uQWJvdmU6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uYWRkU2VsZWN0aW9uQWJvdmUoKVxuXG4gICMgUHVibGljOiBTcGxpdCBtdWx0aS1saW5lIHNlbGVjdGlvbnMgaW50byBvbmUgc2VsZWN0aW9uIHBlciBsaW5lLlxuICAjXG4gICMgT3BlcmF0ZXMgb24gYWxsIHNlbGVjdGlvbnMuIFRoaXMgbWV0aG9kIGJyZWFrcyBhcGFydCBhbGwgbXVsdGktbGluZVxuICAjIHNlbGVjdGlvbnMgdG8gY3JlYXRlIG11bHRpcGxlIHNpbmdsZS1saW5lIHNlbGVjdGlvbnMgdGhhdCBjdW11bGF0aXZlbHkgY292ZXJcbiAgIyB0aGUgc2FtZSBvcmlnaW5hbCBhcmVhLlxuICBzcGxpdFNlbGVjdGlvbnNJbnRvTGluZXM6IC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZ2V0U2VsZWN0aW9ucygpXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBjb250aW51ZSBpZiByYW5nZS5pc1NpbmdsZUxpbmUoKVxuXG4gICAgICBzZWxlY3Rpb24uZGVzdHJveSgpXG4gICAgICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICAgICAgQGFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKFtzdGFydCwgW3N0YXJ0LnJvdywgSW5maW5pdHldXSlcbiAgICAgIHtyb3d9ID0gc3RhcnRcbiAgICAgIHdoaWxlICsrcm93IDwgZW5kLnJvd1xuICAgICAgICBAYWRkU2VsZWN0aW9uRm9yQnVmZmVyUmFuZ2UoW1tyb3csIDBdLCBbcm93LCBJbmZpbml0eV1dKVxuICAgICAgQGFkZFNlbGVjdGlvbkZvckJ1ZmZlclJhbmdlKFtbZW5kLnJvdywgMF0sIFtlbmQucm93LCBlbmQuY29sdW1uXV0pXG5cbiAgIyBQdWJsaWM6IEZvciBlYWNoIHNlbGVjdGlvbiwgdHJhbnNwb3NlIHRoZSBzZWxlY3RlZCB0ZXh0LlxuICAjXG4gICMgSWYgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eSwgdGhlIGNoYXJhY3RlcnMgcHJlY2VkaW5nIGFuZCBmb2xsb3dpbmcgdGhlIGN1cnNvclxuICAjIGFyZSBzd2FwcGVkLiBPdGhlcndpc2UsIHRoZSBzZWxlY3RlZCBjaGFyYWN0ZXJzIGFyZSByZXZlcnNlZC5cbiAgdHJhbnNwb3NlOiAtPlxuICAgIEBtdXRhdGVTZWxlY3RlZFRleHQgKHNlbGVjdGlvbikgPT5cbiAgICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgICAgc2VsZWN0aW9uLnNlbGVjdFJpZ2h0KClcbiAgICAgICAgdGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgc2VsZWN0aW9uLmRlbGV0ZSgpXG4gICAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKVxuICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCB0ZXh0XG4gICAgICBlbHNlXG4gICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0IHNlbGVjdGlvbi5nZXRUZXh0KCkuc3BsaXQoJycpLnJldmVyc2UoKS5qb2luKCcnKVxuXG4gICMgUHVibGljOiBDb252ZXJ0IHRoZSBzZWxlY3RlZCB0ZXh0IHRvIHVwcGVyIGNhc2UuXG4gICNcbiAgIyBGb3IgZWFjaCBzZWxlY3Rpb24sIGlmIHRoZSBzZWxlY3Rpb24gaXMgZW1wdHksIGNvbnZlcnRzIHRoZSBjb250YWluaW5nIHdvcmRcbiAgIyB0byB1cHBlciBjYXNlLiBPdGhlcndpc2UgY29udmVydCB0aGUgc2VsZWN0ZWQgdGV4dCB0byB1cHBlciBjYXNlLlxuICB1cHBlckNhc2U6IC0+XG4gICAgQHJlcGxhY2VTZWxlY3RlZFRleHQgc2VsZWN0V29yZElmRW1wdHk6dHJ1ZSwgKHRleHQpID0+IHRleHQudG9VcHBlckNhc2UoKVxuXG4gICMgUHVibGljOiBDb252ZXJ0IHRoZSBzZWxlY3RlZCB0ZXh0IHRvIGxvd2VyIGNhc2UuXG4gICNcbiAgIyBGb3IgZWFjaCBzZWxlY3Rpb24sIGlmIHRoZSBzZWxlY3Rpb24gaXMgZW1wdHksIGNvbnZlcnRzIHRoZSBjb250YWluaW5nIHdvcmRcbiAgIyB0byB1cHBlciBjYXNlLiBPdGhlcndpc2UgY29udmVydCB0aGUgc2VsZWN0ZWQgdGV4dCB0byB1cHBlciBjYXNlLlxuICBsb3dlckNhc2U6IC0+XG4gICAgQHJlcGxhY2VTZWxlY3RlZFRleHQgc2VsZWN0V29yZElmRW1wdHk6dHJ1ZSwgKHRleHQpID0+IHRleHQudG9Mb3dlckNhc2UoKVxuXG4gICMgQ29udmVydCBtdWx0aXBsZSBsaW5lcyB0byBhIHNpbmdsZSBsaW5lLlxuICAjXG4gICMgT3BlcmF0ZXMgb24gYWxsIHNlbGVjdGlvbnMuIElmIHRoZSBzZWxlY3Rpb24gaXMgZW1wdHksIGpvaW5zIHRoZSBjdXJyZW50XG4gICMgbGluZSB3aXRoIHRoZSBuZXh0IGxpbmUuIE90aGVyd2lzZSBpdCBqb2lucyBhbGwgbGluZXMgdGhhdCBpbnRlcnNlY3QgdGhlXG4gICMgc2VsZWN0aW9uLlxuICAjXG4gICMgSm9pbmluZyBhIGxpbmUgbWVhbnMgdGhhdCBtdWx0aXBsZSBsaW5lcyBhcmUgY29udmVydGVkIHRvIGEgc2luZ2xlIGxpbmUgd2l0aFxuICAjIHRoZSBjb250ZW50cyBvZiBlYWNoIG9mIHRoZSBvcmlnaW5hbCBub24tZW1wdHkgbGluZXMgc2VwYXJhdGVkIGJ5IGEgc3BhY2UuXG4gIGpvaW5MaW5lczogLT5cbiAgICBAbXV0YXRlU2VsZWN0ZWRUZXh0IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5qb2luTGluZXMoKVxuXG4gICMgUHVibGljOiBFeHBhbmQgc2VsZWN0aW9ucyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZWlyIGNvbnRhaW5pbmcgd29yZC5cbiAgI1xuICAjIE9wZXJhdGVzIG9uIGFsbCBzZWxlY3Rpb25zLiBNb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlXG4gICMgY29udGFpbmluZyB3b3JkIHdoaWxlIHByZXNlcnZpbmcgdGhlIHNlbGVjdGlvbidzIHRhaWwgcG9zaXRpb24uXG4gIHNlbGVjdFRvQmVnaW5uaW5nT2ZXb3JkOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zQmFja3dhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvQmVnaW5uaW5nT2ZXb3JkKClcblxuICAjIFB1YmxpYzogRXhwYW5kIHNlbGVjdGlvbnMgdG8gdGhlIGVuZCBvZiB0aGVpciBjb250YWluaW5nIHdvcmQuXG4gICNcbiAgIyBPcGVyYXRlcyBvbiBhbGwgc2VsZWN0aW9ucy4gTW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBjb250YWluaW5nXG4gICMgd29yZCB3aGlsZSBwcmVzZXJ2aW5nIHRoZSBzZWxlY3Rpb24ncyB0YWlsIHBvc2l0aW9uLlxuICBzZWxlY3RUb0VuZE9mV29yZDogLT5cbiAgICBAZXhwYW5kU2VsZWN0aW9uc0ZvcndhcmQgKHNlbGVjdGlvbikgPT4gc2VsZWN0aW9uLnNlbGVjdFRvRW5kT2ZXb3JkKClcblxuICAjIFB1YmxpYzogRXhwYW5kIHNlbGVjdGlvbnMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkLlxuICAjXG4gICMgT3BlcmF0ZXMgb24gYWxsIHNlbGVjdGlvbnMuIE1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dFxuICAjIHdvcmQgd2hpbGUgcHJlc2VydmluZyB0aGUgc2VsZWN0aW9uJ3MgdGFpbCBwb3NpdGlvbi5cbiAgc2VsZWN0VG9CZWdpbm5pbmdPZk5leHRXb3JkOiAtPlxuICAgIEBleHBhbmRTZWxlY3Rpb25zRm9yd2FyZCAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uc2VsZWN0VG9CZWdpbm5pbmdPZk5leHRXb3JkKClcblxuICAjIFB1YmxpYzogU2VsZWN0IHRoZSB3b3JkIGNvbnRhaW5pbmcgZWFjaCBjdXJzb3IuXG4gIHNlbGVjdFdvcmQ6IC0+XG4gICAgQGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkIChzZWxlY3Rpb24pID0+IHNlbGVjdGlvbi5zZWxlY3RXb3JkKClcblxuICAjIFB1YmxpYzogU2VsZWN0IHRoZSByYW5nZSBvZiB0aGUgZ2l2ZW4gbWFya2VyIGlmIGl0IGlzIHZhbGlkLlxuICAjXG4gICMgbWFya2VyIC0gQSB7RGlzcGxheUJ1ZmZlck1hcmtlcn1cbiAgI1xuICAjIFJldHVybnMgdGhlIHNlbGVjdGVkIHtSYW5nZX0gb3IgYHVuZGVmaW5lZGAgaWYgdGhlIG1hcmtlciBpcyBpbnZhbGlkLlxuICBzZWxlY3RNYXJrZXI6IChtYXJrZXIpIC0+XG4gICAgaWYgbWFya2VyLmlzVmFsaWQoKVxuICAgICAgcmFuZ2UgPSBtYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgQHNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByYW5nZVxuXG4gICMgTWVyZ2UgY3Vyc29ycyB0aGF0IGhhdmUgdGhlIHNhbWUgc2NyZWVuIHBvc2l0aW9uXG4gIG1lcmdlQ3Vyc29yczogLT5cbiAgICBwb3NpdGlvbnMgPSBbXVxuICAgIGZvciBjdXJzb3IgaW4gQGdldEN1cnNvcnMoKVxuICAgICAgcG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKS50b1N0cmluZygpXG4gICAgICBpZiBwb3NpdGlvbiBpbiBwb3NpdGlvbnNcbiAgICAgICAgY3Vyc29yLmRlc3Ryb3koKVxuICAgICAgZWxzZVxuICAgICAgICBwb3NpdGlvbnMucHVzaChwb3NpdGlvbilcblxuICAjIENhbGxzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aXRoIGVhY2ggc2VsZWN0aW9uLCB0aGVuIG1lcmdlcyBzZWxlY3Rpb25zXG4gIGV4cGFuZFNlbGVjdGlvbnNGb3J3YXJkOiAoZm4pIC0+XG4gICAgQG1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucyA9PlxuICAgICAgZm4oc2VsZWN0aW9uKSBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcblxuICAjIENhbGxzIHRoZSBnaXZlbiBmdW5jdGlvbiB3aXRoIGVhY2ggc2VsZWN0aW9uLCB0aGVuIG1lcmdlcyBzZWxlY3Rpb25zIGluIHRoZVxuICAjIHJldmVyc2VkIG9yaWVudGF0aW9uXG4gIGV4cGFuZFNlbGVjdGlvbnNCYWNrd2FyZDogKGZuKSAtPlxuICAgIEBtZXJnZUludGVyc2VjdGluZ1NlbGVjdGlvbnMgcmV2ZXJzZWQ6IHRydWUsID0+XG4gICAgICBmbihzZWxlY3Rpb24pIGZvciBzZWxlY3Rpb24gaW4gQGdldFNlbGVjdGlvbnMoKVxuXG4gIGZpbmFsaXplU2VsZWN0aW9uczogLT5cbiAgICBzZWxlY3Rpb24uZmluYWxpemUoKSBmb3Igc2VsZWN0aW9uIGluIEBnZXRTZWxlY3Rpb25zKClcblxuICAjIE1lcmdlcyBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9ucy4gSWYgcGFzc2VkIGEgZnVuY3Rpb24sIGl0IGV4ZWN1dGVzXG4gICMgdGhlIGZ1bmN0aW9uIHdpdGggbWVyZ2luZyBzdXBwcmVzc2VkLCB0aGVuIG1lcmdlcyBpbnRlcnNlY3Rpbmcgc2VsZWN0aW9uc1xuICAjIGFmdGVyd2FyZC5cbiAgbWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zOiAoYXJncy4uLikgLT5cbiAgICBmbiA9IGFyZ3MucG9wKCkgaWYgXy5pc0Z1bmN0aW9uKF8ubGFzdChhcmdzKSlcbiAgICBvcHRpb25zID0gYXJncy5wb3AoKSA/IHt9XG5cbiAgICByZXR1cm4gZm4/KCkgaWYgQHN1cHByZXNzU2VsZWN0aW9uTWVyZ2luZ1xuXG4gICAgaWYgZm4/XG4gICAgICBAc3VwcHJlc3NTZWxlY3Rpb25NZXJnaW5nID0gdHJ1ZVxuICAgICAgcmVzdWx0ID0gZm4oKVxuICAgICAgQHN1cHByZXNzU2VsZWN0aW9uTWVyZ2luZyA9IGZhbHNlXG5cbiAgICByZWR1Y2VyID0gKGRpc2pvaW50U2VsZWN0aW9ucywgc2VsZWN0aW9uKSAtPlxuICAgICAgaW50ZXJzZWN0aW5nU2VsZWN0aW9uID0gXy5maW5kKGRpc2pvaW50U2VsZWN0aW9ucywgKHMpIC0+IHMuaW50ZXJzZWN0c1dpdGgoc2VsZWN0aW9uKSlcbiAgICAgIGlmIGludGVyc2VjdGluZ1NlbGVjdGlvbj9cbiAgICAgICAgaW50ZXJzZWN0aW5nU2VsZWN0aW9uLm1lcmdlKHNlbGVjdGlvbiwgb3B0aW9ucylcbiAgICAgICAgZGlzam9pbnRTZWxlY3Rpb25zXG4gICAgICBlbHNlXG4gICAgICAgIGRpc2pvaW50U2VsZWN0aW9ucy5jb25jYXQoW3NlbGVjdGlvbl0pXG5cbiAgICBfLnJlZHVjZShAZ2V0U2VsZWN0aW9ucygpLCByZWR1Y2VyLCBbXSlcblxuICBwcmVzZXJ2ZUN1cnNvclBvc2l0aW9uT25CdWZmZXJSZWxvYWQ6IC0+XG4gICAgY3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgQHN1YnNjcmliZSBAYnVmZmVyLCBcIndpbGwtcmVsb2FkXCIsID0+XG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IEBnZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQHN1YnNjcmliZSBAYnVmZmVyLCBcInJlbG9hZGVkXCIsID0+XG4gICAgICBAc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oY3Vyc29yUG9zaXRpb24pIGlmIGN1cnNvclBvc2l0aW9uXG4gICAgICBjdXJzb3JQb3NpdGlvbiA9IG51bGxcblxuICAjIFB1YmxpYzogR2V0IHRoZSBjdXJyZW50IHtHcmFtbWFyfSBvZiB0aGlzIGVkaXRvci5cbiAgZ2V0R3JhbW1hcjogLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5nZXRHcmFtbWFyKClcblxuICAjIFB1YmxpYzogU2V0IHRoZSBjdXJyZW50IHtHcmFtbWFyfSBvZiB0aGlzIGVkaXRvci5cbiAgI1xuICAjIEFzc2lnbmluZyBhIGdyYW1tYXIgd2lsbCBjYXVzZSB0aGUgZWRpdG9yIHRvIHJlLXRva2VuaXplIGJhc2VkIG9uIHRoZSBuZXdcbiAgIyBncmFtbWFyLlxuICBzZXRHcmFtbWFyOiAoZ3JhbW1hcikgLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5zZXRHcmFtbWFyKGdyYW1tYXIpXG5cbiAgIyBSZWxvYWQgdGhlIGdyYW1tYXIgYmFzZWQgb24gdGhlIGZpbGUgbmFtZS5cbiAgcmVsb2FkR3JhbW1hcjogLT5cbiAgICBAZGlzcGxheUJ1ZmZlci5yZWxvYWRHcmFtbWFyKClcblxuICBzaG91bGRBdXRvSW5kZW50OiAtPlxuICAgIGF0b20uY29uZmlnLmdldChcImVkaXRvci5hdXRvSW5kZW50XCIpXG5cbiAgIyBQdWJsaWM6IEJhdGNoIG11bHRpcGxlIG9wZXJhdGlvbnMgYXMgYSBzaW5nbGUgdW5kby9yZWRvIHN0ZXAuXG4gICNcbiAgIyBBbnkgZ3JvdXAgb2Ygb3BlcmF0aW9ucyB0aGF0IGFyZSBsb2dpY2FsbHkgZ3JvdXBlZCBmcm9tIHRoZSBwZXJzcGVjdGl2ZSBvZlxuICAjIHVuZG9pbmcgYW5kIHJlZG9pbmcgc2hvdWxkIGJlIHBlcmZvcm1lZCBpbiBhIHRyYW5zYWN0aW9uLiBJZiB5b3Ugd2FudCB0b1xuICAjIGFib3J0IHRoZSB0cmFuc2FjdGlvbiwgY2FsbCB7OjphYm9ydFRyYW5zYWN0aW9ufSB0byB0ZXJtaW5hdGUgdGhlIGZ1bmN0aW9uJ3NcbiAgIyBleGVjdXRpb24gYW5kIHJldmVydCBhbnkgY2hhbmdlcyBwZXJmb3JtZWQgdXAgdG8gdGhlIGFib3J0aW9uLlxuICAjXG4gICMgZm4gLSBBIHtGdW5jdGlvbn0gdG8gY2FsbCBpbnNpZGUgdGhlIHRyYW5zYWN0aW9uLlxuICB0cmFuc2FjdDogKGZuKSAtPlxuICAgIEBiYXRjaFVwZGF0ZXMgPT5cbiAgICAgIEBidWZmZXIudHJhbnNhY3QoZm4pXG5cbiAgIyBQdWJsaWM6IFN0YXJ0IGFuIG9wZW4tZW5kZWQgdHJhbnNhY3Rpb24uXG4gICNcbiAgIyBDYWxsIHs6OmNvbW1pdFRyYW5zYWN0aW9ufSBvciB7OjphYm9ydFRyYW5zYWN0aW9ufSB0byB0ZXJtaW5hdGUgdGhlXG4gICMgdHJhbnNhY3Rpb24uIElmIHlvdSBuZXN0IGNhbGxzIHRvIHRyYW5zYWN0aW9ucywgb25seSB0aGUgb3V0ZXJtb3N0XG4gICMgdHJhbnNhY3Rpb24gaXMgY29uc2lkZXJlZC4gWW91IG11c3QgbWF0Y2ggZXZlcnkgYmVnaW4gd2l0aCBhIG1hdGNoaW5nXG4gICMgY29tbWl0LCBidXQgYSBzaW5nbGUgY2FsbCB0byBhYm9ydCB3aWxsIGNhbmNlbCBhbGwgbmVzdGVkIHRyYW5zYWN0aW9ucy5cbiAgYmVnaW5UcmFuc2FjdGlvbjogLT4gQGJ1ZmZlci5iZWdpblRyYW5zYWN0aW9uKClcblxuICAjIFB1YmxpYzogQ29tbWl0IGFuIG9wZW4tZW5kZWQgdHJhbnNhY3Rpb24gc3RhcnRlZCB3aXRoIHs6OmJlZ2luVHJhbnNhY3Rpb259XG4gICMgYW5kIHB1c2ggaXQgdG8gdGhlIHVuZG8gc3RhY2suXG4gICNcbiAgIyBJZiB0cmFuc2FjdGlvbnMgYXJlIG5lc3RlZCwgb25seSB0aGUgb3V0ZXJtb3N0IGNvbW1pdCB0YWtlcyBlZmZlY3QuXG4gIGNvbW1pdFRyYW5zYWN0aW9uOiAtPiBAYnVmZmVyLmNvbW1pdFRyYW5zYWN0aW9uKClcblxuICAjIFB1YmxpYzogQWJvcnQgYW4gb3BlbiB0cmFuc2FjdGlvbiwgdW5kb2luZyBhbnkgb3BlcmF0aW9ucyBwZXJmb3JtZWQgc28gZmFyXG4gICMgd2l0aGluIHRoZSB0cmFuc2FjdGlvbi5cbiAgYWJvcnRUcmFuc2FjdGlvbjogLT4gQGJ1ZmZlci5hYm9ydFRyYW5zYWN0aW9uKClcblxuICBiYXRjaFVwZGF0ZXM6IChmbikgLT5cbiAgICBAZW1pdCAnYmF0Y2hlZC11cGRhdGVzLXN0YXJ0ZWQnXG4gICAgcmVzdWx0ID0gZm4oKVxuICAgIEBlbWl0ICdiYXRjaGVkLXVwZGF0ZXMtZW5kZWQnXG4gICAgcmVzdWx0XG5cbiAgaW5zcGVjdDogLT5cbiAgICBcIjxFZGl0b3IgI3tAaWR9PlwiXG5cbiAgbG9nU2NyZWVuTGluZXM6IChzdGFydCwgZW5kKSAtPiBAZGlzcGxheUJ1ZmZlci5sb2dMaW5lcyhzdGFydCwgZW5kKVxuXG4gIGhhbmRsZUdyYW1tYXJDaGFuZ2U6IC0+XG4gICAgQHVuZm9sZEFsbCgpXG4gICAgQGVtaXQgJ2dyYW1tYXItY2hhbmdlZCdcblxuICBoYW5kbGVNYXJrZXJDcmVhdGVkOiAobWFya2VyKSA9PlxuICAgIGlmIG1hcmtlci5tYXRjaGVzQXR0cmlidXRlcyhAZ2V0U2VsZWN0aW9uTWFya2VyQXR0cmlidXRlcygpKVxuICAgICAgQGFkZFNlbGVjdGlvbihtYXJrZXIpXG5cbiAgZ2V0U2VsZWN0aW9uTWFya2VyQXR0cmlidXRlczogLT5cbiAgICB0eXBlOiAnc2VsZWN0aW9uJywgZWRpdG9ySWQ6IEBpZCwgaW52YWxpZGF0ZTogJ25ldmVyJ1xuXG4gIGdldFZlcnRpY2FsU2Nyb2xsTWFyZ2luOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRWZXJ0aWNhbFNjcm9sbE1hcmdpbigpXG4gIHNldFZlcnRpY2FsU2Nyb2xsTWFyZ2luOiAodmVydGljYWxTY3JvbGxNYXJnaW4pIC0+IEBkaXNwbGF5QnVmZmVyLnNldFZlcnRpY2FsU2Nyb2xsTWFyZ2luKHZlcnRpY2FsU2Nyb2xsTWFyZ2luKVxuXG4gIGdldEhvcml6b250YWxTY3JvbGxNYXJnaW46IC0+IEBkaXNwbGF5QnVmZmVyLmdldEhvcml6b250YWxTY3JvbGxNYXJnaW4oKVxuICBzZXRIb3Jpem9udGFsU2Nyb2xsTWFyZ2luOiAoaG9yaXpvbnRhbFNjcm9sbE1hcmdpbikgLT4gQGRpc3BsYXlCdWZmZXIuc2V0SG9yaXpvbnRhbFNjcm9sbE1hcmdpbihob3Jpem9udGFsU2Nyb2xsTWFyZ2luKVxuXG4gIGdldExpbmVIZWlnaHQ6IC0+IEBkaXNwbGF5QnVmZmVyLmdldExpbmVIZWlnaHQoKVxuICBzZXRMaW5lSGVpZ2h0OiAobGluZUhlaWdodCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0TGluZUhlaWdodChsaW5lSGVpZ2h0KVxuXG4gIGdldFNjb3BlZENoYXJXaWR0aDogKHNjb3BlTmFtZXMsIGNoYXIpIC0+IEBkaXNwbGF5QnVmZmVyLmdldFNjb3BlZENoYXJXaWR0aChzY29wZU5hbWVzLCBjaGFyKVxuICBzZXRTY29wZWRDaGFyV2lkdGg6IChzY29wZU5hbWVzLCBjaGFyLCB3aWR0aCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0U2NvcGVkQ2hhcldpZHRoKHNjb3BlTmFtZXMsIGNoYXIsIHdpZHRoKVxuXG4gIGdldFNjb3BlZENoYXJXaWR0aHM6IChzY29wZU5hbWVzKSAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTY29wZWRDaGFyV2lkdGhzKHNjb3BlTmFtZXMpXG5cbiAgY2xlYXJTY29wZWRDaGFyV2lkdGhzOiAtPiBAZGlzcGxheUJ1ZmZlci5jbGVhclNjb3BlZENoYXJXaWR0aHMoKVxuXG4gIGdldERlZmF1bHRDaGFyV2lkdGg6IC0+IEBkaXNwbGF5QnVmZmVyLmdldERlZmF1bHRDaGFyV2lkdGgoKVxuICBzZXREZWZhdWx0Q2hhcldpZHRoOiAoZGVmYXVsdENoYXJXaWR0aCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0RGVmYXVsdENoYXJXaWR0aChkZWZhdWx0Q2hhcldpZHRoKVxuXG4gIHNldEhlaWdodDogKGhlaWdodCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0SGVpZ2h0KGhlaWdodClcbiAgZ2V0SGVpZ2h0OiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRIZWlnaHQoKVxuXG4gIHNldFdpZHRoOiAod2lkdGgpIC0+IEBkaXNwbGF5QnVmZmVyLnNldFdpZHRoKHdpZHRoKVxuICBnZXRXaWR0aDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0V2lkdGgoKVxuXG4gIGdldFNjcm9sbFRvcDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U2Nyb2xsVG9wKClcbiAgc2V0U2Nyb2xsVG9wOiAoc2Nyb2xsVG9wKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuXG4gIGdldFNjcm9sbEJvdHRvbTogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U2Nyb2xsQm90dG9tKClcbiAgc2V0U2Nyb2xsQm90dG9tOiAoc2Nyb2xsQm90dG9tKSAtPiBAZGlzcGxheUJ1ZmZlci5zZXRTY3JvbGxCb3R0b20oc2Nyb2xsQm90dG9tKVxuXG4gIGdldFNjcm9sbExlZnQ6IC0+IEBkaXNwbGF5QnVmZmVyLmdldFNjcm9sbExlZnQoKVxuICBzZXRTY3JvbGxMZWZ0OiAoc2Nyb2xsTGVmdCkgLT4gQGRpc3BsYXlCdWZmZXIuc2V0U2Nyb2xsTGVmdChzY3JvbGxMZWZ0KVxuXG4gIGdldFNjcm9sbFJpZ2h0OiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRTY3JvbGxSaWdodCgpXG4gIHNldFNjcm9sbFJpZ2h0OiAoc2Nyb2xsUmlnaHQpIC0+IEBkaXNwbGF5QnVmZmVyLnNldFNjcm9sbFJpZ2h0KHNjcm9sbFJpZ2h0KVxuXG4gIGdldFNjcm9sbEhlaWdodDogLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U2Nyb2xsSGVpZ2h0KClcbiAgZ2V0U2Nyb2xsV2lkdGg6IChzY3JvbGxXaWR0aCkgLT4gQGRpc3BsYXlCdWZmZXIuZ2V0U2Nyb2xsV2lkdGgoc2Nyb2xsV2lkdGgpXG5cbiAgZ2V0VmlzaWJsZVJvd1JhbmdlOiAtPiBAZGlzcGxheUJ1ZmZlci5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuXG4gIGludGVyc2VjdHNWaXNpYmxlUm93UmFuZ2U6IChzdGFydFJvdywgZW5kUm93KSAtPiBAZGlzcGxheUJ1ZmZlci5pbnRlcnNlY3RzVmlzaWJsZVJvd1JhbmdlKHN0YXJ0Um93LCBlbmRSb3cpXG5cbiAgc2VsZWN0aW9uSW50ZXJzZWN0c1Zpc2libGVSb3dSYW5nZTogKHNlbGVjdGlvbikgLT4gQGRpc3BsYXlCdWZmZXIuc2VsZWN0aW9uSW50ZXJzZWN0c1Zpc2libGVSb3dSYW5nZShzZWxlY3Rpb24pXG5cbiAgcGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uOiAoc2NyZWVuUG9zaXRpb24pIC0+IEBkaXNwbGF5QnVmZmVyLnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbilcblxuICBwaXhlbFBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb246IChidWZmZXJQb3NpdGlvbikgLT4gQGRpc3BsYXlCdWZmZXIucGl4ZWxQb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gIHNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbjogKHBpeGVsUG9zaXRpb24pIC0+IEBkaXNwbGF5QnVmZmVyLnNjcmVlblBvc2l0aW9uRm9yUGl4ZWxQb3NpdGlvbihwaXhlbFBvc2l0aW9uKVxuXG4gIHBpeGVsUmVjdEZvclNjcmVlblJhbmdlOiAoc2NyZWVuUmFuZ2UpIC0+IEBkaXNwbGF5QnVmZmVyLnBpeGVsUmVjdEZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuXG4gIHNjcm9sbFRvU2NyZWVuUmFuZ2U6IChzY3JlZW5SYW5nZSkgLT4gQGRpc3BsYXlCdWZmZXIuc2Nyb2xsVG9TY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcblxuICBzY3JvbGxUb1NjcmVlblBvc2l0aW9uOiAoc2NyZWVuUG9zaXRpb24pIC0+IEBkaXNwbGF5QnVmZmVyLnNjcm9sbFRvU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pXG5cbiAgc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbjogKGJ1ZmZlclBvc2l0aW9uKSAtPiBAZGlzcGxheUJ1ZmZlci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gICMgRGVwcmVjYXRlZDogQ2FsbCB7Ojpqb2luTGluZXN9IGluc3RlYWQuXG4gIGpvaW5MaW5lOiAtPlxuICAgIGRlcHJlY2F0ZShcIlVzZSBFZGl0b3I6OmpvaW5MaW5lcygpIGluc3RlYWRcIilcbiAgICBAam9pbkxpbmVzKClcbiJdfQ==
