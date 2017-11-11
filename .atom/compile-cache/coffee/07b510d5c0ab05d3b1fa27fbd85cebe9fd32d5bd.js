(function() {
  var CompositeDisposable, Emitter, HighlightedAreaView, MarkerLayer, Range, StatusBarView, escapeRegExp, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter, MarkerLayer = ref.MarkerLayer;

  StatusBarView = require('./status-bar-view');

  escapeRegExp = require('./escape-reg-exp');

  module.exports = HighlightedAreaView = (function() {
    function HighlightedAreaView() {
      this.listenForStatusBarChange = bind(this.listenForStatusBarChange, this);
      this.removeStatusBar = bind(this.removeStatusBar, this);
      this.setupStatusBar = bind(this.setupStatusBar, this);
      this.removeMarkers = bind(this.removeMarkers, this);
      this.handleSelection = bind(this.handleSelection, this);
      this.debouncedHandleSelection = bind(this.debouncedHandleSelection, this);
      this.setStatusBar = bind(this.setStatusBar, this);
      this.enable = bind(this.enable, this);
      this.disable = bind(this.disable, this);
      this.onDidRemoveAllMarkers = bind(this.onDidRemoveAllMarkers, this);
      this.onDidAddSelectedMarkerForEditor = bind(this.onDidAddSelectedMarkerForEditor, this);
      this.onDidAddMarkerForEditor = bind(this.onDidAddMarkerForEditor, this);
      this.onDidAddSelectedMarker = bind(this.onDidAddSelectedMarker, this);
      this.onDidAddMarker = bind(this.onDidAddMarker, this);
      this.destroy = bind(this.destroy, this);
      this.emitter = new Emitter;
      this.markerLayers = [];
      this.resultCount = 0;
      this.enable();
      this.listenForTimeoutChange();
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.debouncedHandleSelection();
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToActiveTextEditor();
      this.listenForStatusBarChange();
    }

    HighlightedAreaView.prototype.destroy = function() {
      var ref1, ref2, ref3;
      clearTimeout(this.handleSelectionTimeout);
      this.activeItemSubscription.dispose();
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      if ((ref2 = this.statusBarView) != null) {
        ref2.removeElement();
      }
      if ((ref3 = this.statusBarTile) != null) {
        ref3.destroy();
      }
      return this.statusBarTile = null;
    };

    HighlightedAreaView.prototype.onDidAddMarker = function(callback) {
      var Grim;
      Grim = require('grim');
      Grim.deprecate("Please do not use. This method will be removed.");
      return this.emitter.on('did-add-marker', callback);
    };

    HighlightedAreaView.prototype.onDidAddSelectedMarker = function(callback) {
      var Grim;
      Grim = require('grim');
      Grim.deprecate("Please do not use. This method will be removed.");
      return this.emitter.on('did-add-selected-marker', callback);
    };

    HighlightedAreaView.prototype.onDidAddMarkerForEditor = function(callback) {
      return this.emitter.on('did-add-marker-for-editor', callback);
    };

    HighlightedAreaView.prototype.onDidAddSelectedMarkerForEditor = function(callback) {
      return this.emitter.on('did-add-selected-marker-for-editor', callback);
    };

    HighlightedAreaView.prototype.onDidRemoveAllMarkers = function(callback) {
      return this.emitter.on('did-remove-marker-layer', callback);
    };

    HighlightedAreaView.prototype.disable = function() {
      this.disabled = true;
      return this.removeMarkers();
    };

    HighlightedAreaView.prototype.enable = function() {
      this.disabled = false;
      return this.debouncedHandleSelection();
    };

    HighlightedAreaView.prototype.setStatusBar = function(statusBar) {
      this.statusBar = statusBar;
      return this.setupStatusBar();
    };

    HighlightedAreaView.prototype.debouncedHandleSelection = function() {
      clearTimeout(this.handleSelectionTimeout);
      return this.handleSelectionTimeout = setTimeout((function(_this) {
        return function() {
          return _this.handleSelection();
        };
      })(this), atom.config.get('highlight-selected.timeout'));
    };

    HighlightedAreaView.prototype.listenForTimeoutChange = function() {
      return atom.config.onDidChange('highlight-selected.timeout', (function(_this) {
        return function() {
          return _this.debouncedHandleSelection();
        };
      })(this));
    };

    HighlightedAreaView.prototype.subscribeToActiveTextEditor = function() {
      var editor, ref1;
      if ((ref1 = this.selectionSubscription) != null) {
        ref1.dispose();
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      this.selectionSubscription = new CompositeDisposable;
      this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
      this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
      return this.handleSelection();
    };

    HighlightedAreaView.prototype.getActiveEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    HighlightedAreaView.prototype.getActiveEditors = function() {
      return atom.workspace.getPanes().map(function(pane) {
        var activeItem;
        activeItem = pane.activeItem;
        if (activeItem && activeItem.constructor.name === 'TextEditor') {
          return activeItem;
        }
      });
    };

    HighlightedAreaView.prototype.handleSelection = function() {
      var editor, ref1, ref2, ref3, regex, regexFlags, regexSearch, result, text;
      this.removeMarkers();
      if (this.disabled) {
        return;
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      if (editor.getLastSelection().isEmpty()) {
        return;
      }
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (!this.isWordSelected(editor.getLastSelection())) {
          return;
        }
      }
      this.selections = editor.getSelections();
      text = escapeRegExp(this.selections[0].getText());
      regex = new RegExp("\\S*\\w*\\b", 'gi');
      result = regex.exec(text);
      if (result == null) {
        return;
      }
      if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
        return;
      }
      regexFlags = 'g';
      if (atom.config.get('highlight-selected.ignoreCase')) {
        regexFlags = 'gi';
      }
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (regexSearch.indexOf("\$") !== -1 && ((ref1 = (ref2 = editor.getGrammar()) != null ? ref2.name : void 0) === 'PHP' || ref1 === 'HACK')) {
          regexSearch = regexSearch.replace("\$", "\$\\b");
        } else {
          regexSearch = "\\b" + regexSearch;
        }
        regexSearch = regexSearch + "\\b";
      }
      this.resultCount = 0;
      if (atom.config.get('highlight-selected.highlightInPanes')) {
        this.getActiveEditors().forEach((function(_this) {
          return function(editor) {
            return _this.highlightSelectionInEditor(editor, regexSearch, regexFlags);
          };
        })(this));
      } else {
        this.highlightSelectionInEditor(editor, regexSearch, regexFlags);
      }
      return (ref3 = this.statusBarElement) != null ? ref3.updateCount(this.resultCount) : void 0;
    };

    HighlightedAreaView.prototype.highlightSelectionInEditor = function(editor, regexSearch, regexFlags) {
      var markerLayer, markerLayerForHiddenMarkers, range;
      markerLayer = editor != null ? editor.addMarkerLayer() : void 0;
      if (markerLayer == null) {
        return;
      }
      markerLayerForHiddenMarkers = editor.addMarkerLayer();
      this.markerLayers.push(markerLayer);
      this.markerLayers.push(markerLayerForHiddenMarkers);
      range = [[0, 0], editor.getEofBufferPosition()];
      editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
        return function(result) {
          var marker;
          _this.resultCount += 1;
          if (_this.showHighlightOnSelectedWord(result.range, _this.selections)) {
            marker = markerLayerForHiddenMarkers.markBufferRange(result.range);
            _this.emitter.emit('did-add-selected-marker', marker);
            return _this.emitter.emit('did-add-selected-marker-for-editor', {
              marker: marker,
              editor: editor
            });
          } else {
            marker = markerLayer.markBufferRange(result.range);
            _this.emitter.emit('did-add-marker', marker);
            return _this.emitter.emit('did-add-marker-for-editor', {
              marker: marker,
              editor: editor
            });
          }
        };
      })(this));
      return editor.decorateMarkerLayer(markerLayer, {
        type: 'highlight',
        "class": this.makeClasses()
      });
    };

    HighlightedAreaView.prototype.makeClasses = function() {
      var className;
      className = 'highlight-selected';
      if (atom.config.get('highlight-selected.lightTheme')) {
        className += ' light-theme';
      }
      if (atom.config.get('highlight-selected.highlightBackground')) {
        className += ' background';
      }
      return className;
    };

    HighlightedAreaView.prototype.showHighlightOnSelectedWord = function(range, selections) {
      var i, len, outcome, selection, selectionRange;
      if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
        return false;
      }
      outcome = false;
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        selectionRange = selection.getBufferRange();
        outcome = (range.start.column === selectionRange.start.column) && (range.start.row === selectionRange.start.row) && (range.end.column === selectionRange.end.column) && (range.end.row === selectionRange.end.row);
        if (outcome) {
          break;
        }
      }
      return outcome;
    };

    HighlightedAreaView.prototype.removeMarkers = function() {
      var ref1;
      this.markerLayers.forEach(function(markerLayer) {
        return markerLayer.destroy();
      });
      this.markerLayers = [];
      if ((ref1 = this.statusBarElement) != null) {
        ref1.updateCount(0);
      }
      return this.emitter.emit('did-remove-marker-layer');
    };

    HighlightedAreaView.prototype.isWordSelected = function(selection) {
      var lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.getActiveEditor().bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = selectionRange.start.isEqual(lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = selectionRange.end.isEqual(lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
      } else {
        return false;
      }
    };

    HighlightedAreaView.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.setupStatusBar = function() {
      if (this.statusBarElement != null) {
        return;
      }
      if (!atom.config.get('highlight-selected.showInStatusBar')) {
        return;
      }
      this.statusBarElement = new StatusBarView();
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this.statusBarElement.getElement(),
        priority: 100
      });
    };

    HighlightedAreaView.prototype.removeStatusBar = function() {
      var ref1;
      if (this.statusBarElement == null) {
        return;
      }
      if ((ref1 = this.statusBarTile) != null) {
        ref1.destroy();
      }
      this.statusBarTile = null;
      return this.statusBarElement = null;
    };

    HighlightedAreaView.prototype.listenForStatusBarChange = function() {
      return atom.config.onDidChange('highlight-selected.showInStatusBar', (function(_this) {
        return function(changed) {
          if (changed.newValue) {
            return _this.setupStatusBar();
          } else {
            return _this.removeStatusBar();
          }
        };
      })(this));
    };

    return HighlightedAreaView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9oaWdobGlnaHRlZC1hcmVhLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1R0FBQTtJQUFBOztFQUFBLE1BQXFELE9BQUEsQ0FBUSxNQUFSLENBQXJELEVBQUMsaUJBQUQsRUFBUSw2Q0FBUixFQUE2QixxQkFBN0IsRUFBc0M7O0VBQ3RDLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSOztFQUNoQixZQUFBLEdBQWUsT0FBQSxDQUFRLGtCQUFSOztFQUVmLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFFUyw2QkFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUNmLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsTUFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHNCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDakUsS0FBQyxDQUFBLHdCQUFELENBQUE7aUJBQ0EsS0FBQyxDQUFBLDJCQUFELENBQUE7UUFGaUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO01BRzFCLElBQUMsQ0FBQSwyQkFBRCxDQUFBO01BQ0EsSUFBQyxDQUFBLHdCQUFELENBQUE7SUFWVzs7a0NBWWIsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxzQkFBZDtNQUNBLElBQUMsQ0FBQSxzQkFBc0IsQ0FBQyxPQUF4QixDQUFBOztZQUNzQixDQUFFLE9BQXhCLENBQUE7OztZQUNjLENBQUUsYUFBaEIsQ0FBQTs7O1lBQ2MsQ0FBRSxP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QUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFKTDs7a0NBTWpCLHdCQUFBLEdBQTBCLFNBQUE7YUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLG9DQUF4QixFQUE4RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtVQUM1RCxJQUFHLE9BQU8sQ0FBQyxRQUFYO21CQUNFLEtBQUMsQ0FBQSxjQUFELENBQUEsRUFERjtXQUFBLE1BQUE7bUJBR0UsS0FBQyxDQUFBLGVBQUQsQ0FBQSxFQUhGOztRQUQ0RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUQ7SUFEd0I7Ozs7O0FBbFA1QiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciwgTWFya2VyTGF5ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcblN0YXR1c0JhclZpZXcgPSByZXF1aXJlICcuL3N0YXR1cy1iYXItdmlldydcbmVzY2FwZVJlZ0V4cCA9IHJlcXVpcmUgJy4vZXNjYXBlLXJlZy1leHAnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEhpZ2hsaWdodGVkQXJlYVZpZXdcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQG1hcmtlckxheWVycyA9IFtdXG4gICAgQHJlc3VsdENvdW50ID0gMFxuICAgIEBlbmFibGUoKVxuICAgIEBsaXN0ZW5Gb3JUaW1lb3V0Q2hhbmdlKClcbiAgICBAYWN0aXZlSXRlbVN1YnNjcmlwdGlvbiA9IGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gPT5cbiAgICAgIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb24oKVxuICAgICAgQHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQHN1YnNjcmliZVRvQWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGxpc3RlbkZvclN0YXR1c0JhckNoYW5nZSgpXG5cbiAgZGVzdHJveTogPT5cbiAgICBjbGVhclRpbWVvdXQoQGhhbmRsZVNlbGVjdGlvblRpbWVvdXQpXG4gICAgQGFjdGl2ZUl0ZW1TdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG4gICAgQHN0YXR1c0JhclZpZXc/LnJlbW92ZUVsZW1lbnQoKVxuICAgIEBzdGF0dXNCYXJUaWxlPy5kZXN0cm95KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IG51bGxcblxuICBvbkRpZEFkZE1hcmtlcjogKGNhbGxiYWNrKSA9PlxuICAgIEdyaW0gPSByZXF1aXJlICdncmltJ1xuICAgIEdyaW0uZGVwcmVjYXRlKFwiUGxlYXNlIGRvIG5vdCB1c2UuIFRoaXMgbWV0aG9kIHdpbGwgYmUgcmVtb3ZlZC5cIilcbiAgICBAZW1pdHRlci5vbiAnZGlkLWFkZC1tYXJrZXInLCBjYWxsYmFja1xuXG4gIG9uRGlkQWRkU2VsZWN0ZWRNYXJrZXI6IChjYWxsYmFjaykgPT5cbiAgICBHcmltID0gcmVxdWlyZSAnZ3JpbSdcbiAgICBHcmltLmRlcHJlY2F0ZShcIlBsZWFzZSBkbyBub3QgdXNlLiBUaGlzIG1ldGhvZCB3aWxsIGJlIHJlbW92ZWQuXCIpXG4gICAgQGVtaXR0ZXIub24gJ2RpZC1hZGQtc2VsZWN0ZWQtbWFya2VyJywgY2FsbGJhY2tcblxuICBvbkRpZEFkZE1hcmtlckZvckVkaXRvcjogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdkaWQtYWRkLW1hcmtlci1mb3ItZWRpdG9yJywgY2FsbGJhY2tcblxuICBvbkRpZEFkZFNlbGVjdGVkTWFya2VyRm9yRWRpdG9yOiAoY2FsbGJhY2spID0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1hZGQtc2VsZWN0ZWQtbWFya2VyLWZvci1lZGl0b3InLCBjYWxsYmFja1xuXG4gIG9uRGlkUmVtb3ZlQWxsTWFya2VyczogKGNhbGxiYWNrKSA9PlxuICAgIEBlbWl0dGVyLm9uICdkaWQtcmVtb3ZlLW1hcmtlci1sYXllcicsIGNhbGxiYWNrXG5cbiAgZGlzYWJsZTogPT5cbiAgICBAZGlzYWJsZWQgPSB0cnVlXG4gICAgQHJlbW92ZU1hcmtlcnMoKVxuXG4gIGVuYWJsZTogPT5cbiAgICBAZGlzYWJsZWQgPSBmYWxzZVxuICAgIEBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb24oKVxuXG4gIHNldFN0YXR1c0JhcjogKHN0YXR1c0JhcikgPT5cbiAgICBAc3RhdHVzQmFyID0gc3RhdHVzQmFyXG4gICAgQHNldHVwU3RhdHVzQmFyKClcblxuICBkZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb246ID0+XG4gICAgY2xlYXJUaW1lb3V0KEBoYW5kbGVTZWxlY3Rpb25UaW1lb3V0KVxuICAgIEBoYW5kbGVTZWxlY3Rpb25UaW1lb3V0ID0gc2V0VGltZW91dCA9PlxuICAgICAgQGhhbmRsZVNlbGVjdGlvbigpXG4gICAgLCBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC50aW1lb3V0JylcblxuICBsaXN0ZW5Gb3JUaW1lb3V0Q2hhbmdlOiAtPlxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdoaWdobGlnaHQtc2VsZWN0ZWQudGltZW91dCcsID0+XG4gICAgICBAZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uKClcblxuICBzdWJzY3JpYmVUb0FjdGl2ZVRleHRFZGl0b3I6IC0+XG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbj8uZGlzcG9zZSgpXG5cbiAgICBlZGl0b3IgPSBAZ2V0QWN0aXZlRWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvclxuXG4gICAgQHNlbGVjdGlvblN1YnNjcmlwdGlvbiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAc2VsZWN0aW9uU3Vic2NyaXB0aW9uLmFkZChcbiAgICAgIGVkaXRvci5vbkRpZEFkZFNlbGVjdGlvbiBAZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uXG4gICAgKVxuICAgIEBzZWxlY3Rpb25TdWJzY3JpcHRpb24uYWRkKFxuICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlU2VsZWN0aW9uUmFuZ2UgQGRlYm91bmNlZEhhbmRsZVNlbGVjdGlvblxuICAgIClcbiAgICBAaGFuZGxlU2VsZWN0aW9uKClcblxuICBnZXRBY3RpdmVFZGl0b3I6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgZ2V0QWN0aXZlRWRpdG9yczogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpLm1hcCAocGFuZSkgLT5cbiAgICAgIGFjdGl2ZUl0ZW0gPSBwYW5lLmFjdGl2ZUl0ZW1cbiAgICAgIGFjdGl2ZUl0ZW0gaWYgYWN0aXZlSXRlbSBhbmQgYWN0aXZlSXRlbS5jb25zdHJ1Y3Rvci5uYW1lID09ICdUZXh0RWRpdG9yJ1xuXG4gIGhhbmRsZVNlbGVjdGlvbjogPT5cbiAgICBAcmVtb3ZlTWFya2VycygpXG5cbiAgICByZXR1cm4gaWYgQGRpc2FibGVkXG5cbiAgICBlZGl0b3IgPSBAZ2V0QWN0aXZlRWRpdG9yKClcblxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yXG4gICAgcmV0dXJuIGlmIGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNFbXB0eSgpXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5vbmx5SGlnaGxpZ2h0V2hvbGVXb3JkcycpXG4gICAgICByZXR1cm4gdW5sZXNzIEBpc1dvcmRTZWxlY3RlZChlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuXG4gICAgQHNlbGVjdGlvbnMgPSBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG5cbiAgICB0ZXh0ID0gZXNjYXBlUmVnRXhwKEBzZWxlY3Rpb25zWzBdLmdldFRleHQoKSlcbiAgICByZWdleCA9IG5ldyBSZWdFeHAoXCJcXFxcUypcXFxcdypcXFxcYlwiLCAnZ2knKVxuICAgIHJlc3VsdCA9IHJlZ2V4LmV4ZWModGV4dClcblxuICAgIHJldHVybiB1bmxlc3MgcmVzdWx0P1xuICAgIHJldHVybiBpZiByZXN1bHRbMF0ubGVuZ3RoIDwgYXRvbS5jb25maWcuZ2V0KFxuICAgICAgJ2hpZ2hsaWdodC1zZWxlY3RlZC5taW5pbXVtTGVuZ3RoJykgb3JcbiAgICAgICAgICAgICAgcmVzdWx0LmluZGV4IGlzbnQgMCBvclxuICAgICAgICAgICAgICByZXN1bHRbMF0gaXNudCByZXN1bHQuaW5wdXRcblxuICAgIHJlZ2V4RmxhZ3MgPSAnZydcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5pZ25vcmVDYXNlJylcbiAgICAgIHJlZ2V4RmxhZ3MgPSAnZ2knXG5cbiAgICBAcmFuZ2VzID0gW11cbiAgICByZWdleFNlYXJjaCA9IHJlc3VsdFswXVxuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQub25seUhpZ2hsaWdodFdob2xlV29yZHMnKVxuICAgICAgaWYgcmVnZXhTZWFyY2guaW5kZXhPZihcIlxcJFwiKSBpc250IC0xIFxcXG4gICAgICBhbmQgZWRpdG9yLmdldEdyYW1tYXIoKT8ubmFtZSBpbiBbJ1BIUCcsICdIQUNLJ11cbiAgICAgICAgcmVnZXhTZWFyY2ggPSByZWdleFNlYXJjaC5yZXBsYWNlKFwiXFwkXCIsIFwiXFwkXFxcXGJcIilcbiAgICAgIGVsc2VcbiAgICAgICAgcmVnZXhTZWFyY2ggPSAgXCJcXFxcYlwiICsgcmVnZXhTZWFyY2hcbiAgICAgIHJlZ2V4U2VhcmNoID0gcmVnZXhTZWFyY2ggKyBcIlxcXFxiXCJcblxuICAgIEByZXN1bHRDb3VudCA9IDBcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5oaWdobGlnaHRJblBhbmVzJylcbiAgICAgIEBnZXRBY3RpdmVFZGl0b3JzKCkuZm9yRWFjaCAoZWRpdG9yKSA9PlxuICAgICAgICBAaGlnaGxpZ2h0U2VsZWN0aW9uSW5FZGl0b3IoZWRpdG9yLCByZWdleFNlYXJjaCwgcmVnZXhGbGFncylcbiAgICBlbHNlXG4gICAgICBAaGlnaGxpZ2h0U2VsZWN0aW9uSW5FZGl0b3IoZWRpdG9yLCByZWdleFNlYXJjaCwgcmVnZXhGbGFncylcblxuICAgIEBzdGF0dXNCYXJFbGVtZW50Py51cGRhdGVDb3VudChAcmVzdWx0Q291bnQpXG5cbiAgaGlnaGxpZ2h0U2VsZWN0aW9uSW5FZGl0b3I6IChlZGl0b3IsIHJlZ2V4U2VhcmNoLCByZWdleEZsYWdzKSAtPlxuICAgIG1hcmtlckxheWVyID0gZWRpdG9yPy5hZGRNYXJrZXJMYXllcigpXG4gICAgcmV0dXJuIHVubGVzcyBtYXJrZXJMYXllcj9cbiAgICBtYXJrZXJMYXllckZvckhpZGRlbk1hcmtlcnMgPSBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBtYXJrZXJMYXllcnMucHVzaChtYXJrZXJMYXllcilcbiAgICBAbWFya2VyTGF5ZXJzLnB1c2gobWFya2VyTGF5ZXJGb3JIaWRkZW5NYXJrZXJzKVxuXG4gICAgcmFuZ2UgPSAgW1swLCAwXSwgZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKCldXG5cbiAgICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgbmV3IFJlZ0V4cChyZWdleFNlYXJjaCwgcmVnZXhGbGFncyksIHJhbmdlLFxuICAgICAgKHJlc3VsdCkgPT5cbiAgICAgICAgQHJlc3VsdENvdW50ICs9IDFcbiAgICAgICAgaWYgQHNob3dIaWdobGlnaHRPblNlbGVjdGVkV29yZChyZXN1bHQucmFuZ2UsIEBzZWxlY3Rpb25zKVxuICAgICAgICAgIG1hcmtlciA9IG1hcmtlckxheWVyRm9ySGlkZGVuTWFya2Vycy5tYXJrQnVmZmVyUmFuZ2UocmVzdWx0LnJhbmdlKVxuICAgICAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1hZGQtc2VsZWN0ZWQtbWFya2VyJywgbWFya2VyXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWFkZC1zZWxlY3RlZC1tYXJrZXItZm9yLWVkaXRvcicsXG4gICAgICAgICAgICBtYXJrZXI6IG1hcmtlclxuICAgICAgICAgICAgZWRpdG9yOiBlZGl0b3JcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG1hcmtlciA9IG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyZXN1bHQucmFuZ2UpXG4gICAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWFkZC1tYXJrZXInLCBtYXJrZXJcbiAgICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtYWRkLW1hcmtlci1mb3ItZWRpdG9yJyxcbiAgICAgICAgICAgIG1hcmtlcjogbWFya2VyXG4gICAgICAgICAgICBlZGl0b3I6IGVkaXRvclxuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlckxheWVyKG1hcmtlckxheWVyLCB7XG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgIGNsYXNzOiBAbWFrZUNsYXNzZXMoKVxuICAgIH0pXG5cbiAgbWFrZUNsYXNzZXM6IC0+XG4gICAgY2xhc3NOYW1lID0gJ2hpZ2hsaWdodC1zZWxlY3RlZCdcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5saWdodFRoZW1lJylcbiAgICAgIGNsYXNzTmFtZSArPSAnIGxpZ2h0LXRoZW1lJ1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuaGlnaGxpZ2h0QmFja2dyb3VuZCcpXG4gICAgICBjbGFzc05hbWUgKz0gJyBiYWNrZ3JvdW5kJ1xuICAgIGNsYXNzTmFtZVxuXG4gIHNob3dIaWdobGlnaHRPblNlbGVjdGVkV29yZDogKHJhbmdlLCBzZWxlY3Rpb25zKSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgYXRvbS5jb25maWcuZ2V0KFxuICAgICAgJ2hpZ2hsaWdodC1zZWxlY3RlZC5oaWRlSGlnaGxpZ2h0T25TZWxlY3RlZFdvcmQnKVxuICAgIG91dGNvbWUgPSBmYWxzZVxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgc2VsZWN0aW9uUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgb3V0Y29tZSA9IChyYW5nZS5zdGFydC5jb2x1bW4gaXMgc2VsZWN0aW9uUmFuZ2Uuc3RhcnQuY29sdW1uKSBhbmRcbiAgICAgICAgICAgICAgICAocmFuZ2Uuc3RhcnQucm93IGlzIHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvdykgYW5kXG4gICAgICAgICAgICAgICAgKHJhbmdlLmVuZC5jb2x1bW4gaXMgc2VsZWN0aW9uUmFuZ2UuZW5kLmNvbHVtbikgYW5kXG4gICAgICAgICAgICAgICAgKHJhbmdlLmVuZC5yb3cgaXMgc2VsZWN0aW9uUmFuZ2UuZW5kLnJvdylcbiAgICAgIGJyZWFrIGlmIG91dGNvbWVcbiAgICBvdXRjb21lXG5cbiAgcmVtb3ZlTWFya2VyczogPT5cbiAgICBAbWFya2VyTGF5ZXJzLmZvckVhY2ggKG1hcmtlckxheWVyKSAtPlxuICAgICAgbWFya2VyTGF5ZXIuZGVzdHJveSgpXG4gICAgQG1hcmtlckxheWVycyA9IFtdXG4gICAgQHN0YXR1c0JhckVsZW1lbnQ/LnVwZGF0ZUNvdW50KDApXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXJlbW92ZS1tYXJrZXItbGF5ZXInXG5cbiAgaXNXb3JkU2VsZWN0ZWQ6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNTaW5nbGVMaW5lKClcbiAgICAgIHNlbGVjdGlvblJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGxpbmVSYW5nZSA9IEBnZXRBY3RpdmVFZGl0b3IoKS5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhcbiAgICAgICAgc2VsZWN0aW9uUmFuZ2Uuc3RhcnQucm93KVxuICAgICAgbm9uV29yZENoYXJhY3RlclRvVGhlTGVmdCA9XG4gICAgICAgIHNlbGVjdGlvblJhbmdlLnN0YXJ0LmlzRXF1YWwobGluZVJhbmdlLnN0YXJ0KSBvclxuICAgICAgICBAaXNOb25Xb3JkQ2hhcmFjdGVyVG9UaGVMZWZ0KHNlbGVjdGlvbilcbiAgICAgIG5vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0ID1cbiAgICAgICAgc2VsZWN0aW9uUmFuZ2UuZW5kLmlzRXF1YWwobGluZVJhbmdlLmVuZCkgb3JcbiAgICAgICAgQGlzTm9uV29yZENoYXJhY3RlclRvVGhlUmlnaHQoc2VsZWN0aW9uKVxuXG4gICAgICBub25Xb3JkQ2hhcmFjdGVyVG9UaGVMZWZ0IGFuZCBub25Xb3JkQ2hhcmFjdGVyVG9UaGVSaWdodFxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgaXNOb25Xb3JkQ2hhcmFjdGVyOiAoY2hhcmFjdGVyKSAtPlxuICAgIG5vbldvcmRDaGFyYWN0ZXJzID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnKVxuICAgIG5ldyBSZWdFeHAoXCJbIFxcdCN7ZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dXCIpLnRlc3QoY2hhcmFjdGVyKVxuXG4gIGlzTm9uV29yZENoYXJhY3RlclRvVGhlTGVmdDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb25TdGFydCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEoc2VsZWN0aW9uU3RhcnQsIDAsIC0xKVxuICAgIEBpc05vbldvcmRDaGFyYWN0ZXIoQGdldEFjdGl2ZUVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcblxuICBpc05vbldvcmRDaGFyYWN0ZXJUb1RoZVJpZ2h0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIHJhbmdlID0gUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHNlbGVjdGlvbkVuZCwgMCwgMSlcbiAgICBAaXNOb25Xb3JkQ2hhcmFjdGVyKEBnZXRBY3RpdmVFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpXG5cbiAgc2V0dXBTdGF0dXNCYXI6ID0+XG4gICAgcmV0dXJuIGlmIEBzdGF0dXNCYXJFbGVtZW50P1xuICAgIHJldHVybiB1bmxlc3MgYXRvbS5jb25maWcuZ2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQuc2hvd0luU3RhdHVzQmFyJylcbiAgICBAc3RhdHVzQmFyRWxlbWVudCA9IG5ldyBTdGF0dXNCYXJWaWV3KClcbiAgICBAc3RhdHVzQmFyVGlsZSA9IEBzdGF0dXNCYXIuYWRkTGVmdFRpbGUoXG4gICAgICBpdGVtOiBAc3RhdHVzQmFyRWxlbWVudC5nZXRFbGVtZW50KCksIHByaW9yaXR5OiAxMDApXG5cbiAgcmVtb3ZlU3RhdHVzQmFyOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHN0YXR1c0JhckVsZW1lbnQ/XG4gICAgQHN0YXR1c0JhclRpbGU/LmRlc3Ryb3koKVxuICAgIEBzdGF0dXNCYXJUaWxlID0gbnVsbFxuICAgIEBzdGF0dXNCYXJFbGVtZW50ID0gbnVsbFxuXG4gIGxpc3RlbkZvclN0YXR1c0JhckNoYW5nZTogPT5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnaGlnaGxpZ2h0LXNlbGVjdGVkLnNob3dJblN0YXR1c0JhcicsIChjaGFuZ2VkKSA9PlxuICAgICAgaWYgY2hhbmdlZC5uZXdWYWx1ZVxuICAgICAgICBAc2V0dXBTdGF0dXNCYXIoKVxuICAgICAgZWxzZVxuICAgICAgICBAcmVtb3ZlU3RhdHVzQmFyKClcbiJdfQ==
