var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _editorDiffExtender = require('./editor-diff-extender');

var _editorDiffExtender2 = _interopRequireDefault(_editorDiffExtender);

var _computeWordDiff = require('./compute-word-diff');

var _computeWordDiff2 = _interopRequireDefault(_computeWordDiff);

'use babel';

module.exports = (function () {
  /*
   * @param editors Array of editors being diffed.
   */

  function DiffView(editors) {
    _classCallCheck(this, DiffView);

    this._editorDiffExtender1 = new _editorDiffExtender2['default'](editors.editor1);
    this._editorDiffExtender2 = new _editorDiffExtender2['default'](editors.editor2);
    this._chunks = [];
    this._isSelectionActive = false;
    this._selectedChunkIndex = 0;
    this._COPY_HELP_MESSAGE = 'No differences selected.';
    this._markerLayers = {};
  }

  /**
   * Adds highlighting to the editors to show the diff.
   *
   * @param diff The diff to highlight.
   * @param leftHighlightType The type of highlight (ex: 'added').
   * @param rightHighlightType The type of highlight (ex: 'removed').
   * @param isWordDiffEnabled Whether differences between words per line should be highlighted.
   * @param isWhitespaceIgnored Whether whitespace should be ignored.
   */

  _createClass(DiffView, [{
    key: 'displayDiff',
    value: function displayDiff(diff, leftHighlightType, rightHighlightType, isWordDiffEnabled, isWhitespaceIgnored) {
      this._chunks = diff.chunks || [];

      // make the last chunk equal size on both screens so the editors retain sync scroll #58
      if (this.getNumDifferences() > 0) {
        var lastChunk = this._chunks[this._chunks.length - 1];
        var oldChunkRange = lastChunk.oldLineEnd - lastChunk.oldLineStart;
        var newChunkRange = lastChunk.newLineEnd - lastChunk.newLineStart;
        if (oldChunkRange > newChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.newLineOffsets[lastChunk.newLineStart + newChunkRange] = oldChunkRange - newChunkRange;
        } else if (newChunkRange > oldChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.oldLineOffsets[lastChunk.oldLineStart + oldChunkRange] = newChunkRange - oldChunkRange;
        }
      }

      for (var chunk of this._chunks) {
        this._editorDiffExtender1.highlightLines(chunk.oldLineStart, chunk.oldLineEnd, leftHighlightType);
        this._editorDiffExtender2.highlightLines(chunk.newLineStart, chunk.newLineEnd, rightHighlightType);

        if (isWordDiffEnabled) {
          this._highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored);
        }
      }

      this._editorDiffExtender1.setLineOffsets(diff.oldLineOffsets);
      this._editorDiffExtender2.setLineOffsets(diff.newLineOffsets);

      this._markerLayers = {
        editor1: {
          id: this._editorDiffExtender1.getEditor().id,
          lineMarkerLayer: this._editorDiffExtender1.getLineMarkerLayer(),
          highlightType: leftHighlightType,
          selectionMarkerLayer: this._editorDiffExtender1.getSelectionMarkerLayer()
        },
        editor2: {
          id: this._editorDiffExtender2.getEditor().id,
          lineMarkerLayer: this._editorDiffExtender2.getLineMarkerLayer(),
          highlightType: rightHighlightType,
          selectionMarkerLayer: this._editorDiffExtender2.getSelectionMarkerLayer()
        }
      };
    }

    /**
     * Clears the diff highlighting and offsets from the editors.
     */
  }, {
    key: 'clearDiff',
    value: function clearDiff() {
      this._editorDiffExtender1.destroyMarkers();
      this._editorDiffExtender2.destroyMarkers();
    }

    /**
     * Called to move the current selection highlight to the next diff chunk.
     */
  }, {
    key: 'nextDiff',
    value: function nextDiff() {
      if (this._isSelectionActive) {
        this._selectedChunkIndex++;
        if (this._selectedChunkIndex >= this.getNumDifferences()) {
          this._selectedChunkIndex = 0;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex, true);
      return this._selectedChunkIndex;
    }

    /**
     * Called to move the current selection highlight to the previous diff chunk.
     */
  }, {
    key: 'prevDiff',
    value: function prevDiff() {
      if (this._isSelectionActive) {
        this._selectedChunkIndex--;
        if (this._selectedChunkIndex < 0) {
          this._selectedChunkIndex = this.getNumDifferences() - 1;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex, true);
      return this._selectedChunkIndex;
    }

    /**
     * Copies the currently selected diff chunk from the left editor to the right
     * editor.
     */
  }, {
    key: 'copyToRight',
    value: function copyToRight() {
      var foundSelection = false;
      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)

      for (var diffChunk of this._chunks) {
        if (diffChunk.isSelected) {
          foundSelection = true;

          var textToCopy = this._editorDiffExtender1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
          var lastBufferRow = this._editorDiffExtender2.getEditor().getLastBufferRow();

          // insert new line if the chunk we want to copy will be below the last line of the other editor
          if (diffChunk.newLineStart + offset > lastBufferRow) {
            this._editorDiffExtender2.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
            this._editorDiffExtender2.getEditor().insertNewline();
          }

          this._editorDiffExtender2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], textToCopy);
          // offset will be the amount of lines to be copied minus the amount of lines overwritten
          offset += diffChunk.oldLineEnd - diffChunk.oldLineStart - (diffChunk.newLineEnd - diffChunk.newLineStart);
          // move the selection pointer back so the next diff chunk is not skipped
          if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
            this._selectedChunkIndex--;
          }
        }
      }

      if (!foundSelection) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }
    }

    /**
     * Copies the currently selected diff chunk from the right editor to the left
     * editor.
     */
  }, {
    key: 'copyToLeft',
    value: function copyToLeft() {
      var foundSelection = false;
      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)

      for (var diffChunk of this._chunks) {
        if (diffChunk.isSelected) {
          foundSelection = true;

          var textToCopy = this._editorDiffExtender2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
          var lastBufferRow = this._editorDiffExtender1.getEditor().getLastBufferRow();
          // insert new line if the chunk we want to copy will be below the last line of the other editor
          if (diffChunk.oldLineStart + offset > lastBufferRow) {
            this._editorDiffExtender1.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
            this._editorDiffExtender1.getEditor().insertNewline();
          }

          this._editorDiffExtender1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], textToCopy);
          // offset will be the amount of lines to be copied minus the amount of lines overwritten
          offset += diffChunk.newLineEnd - diffChunk.newLineStart - (diffChunk.oldLineEnd - diffChunk.oldLineStart);
          // move the selection pointer back so the next diff chunk is not skipped
          if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
            this._selectedChunkIndex--;
          }
        }
      }

      if (!foundSelection) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }
    }

    /**
     * Cleans up the editor indicated by index. A clean up will remove the editor
     * or the pane if necessary. Typically left editor == 1 and right editor == 2.
     *
     * @param editorIndex The index of the editor to clean up.
     */
  }, {
    key: 'cleanUpEditor',
    value: function cleanUpEditor(editorIndex) {
      if (editorIndex === 1) {
        this._editorDiffExtender1.cleanUp();
      } else if (editorIndex === 2) {
        this._editorDiffExtender2.cleanUp();
      }
    }

    /**
     * Destroys the editor diff extenders.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._editorDiffExtender1.destroy();
      this._editorDiffExtender2.destroy();
    }

    /**
     * Gets the number of differences between the editors.
     *
     * @return int The number of differences between the editors.
     */
  }, {
    key: 'getNumDifferences',
    value: function getNumDifferences() {
      return Array.isArray(this._chunks) ? this._chunks.length : 0;
    }
  }, {
    key: 'getMarkerLayers',
    value: function getMarkerLayers() {
      return this._markerLayers;
    }
  }, {
    key: 'handleCursorChange',
    value: function handleCursorChange(cursor, oldBufferPosition, newBufferPosition) {
      var editorIndex = cursor.editor === this._editorDiffExtender1.getEditor() ? 1 : 2;
      var oldPositionChunkIndex = this._getChunkIndexByLineNumber(editorIndex, oldBufferPosition.row);
      var newPositionChunkIndex = this._getChunkIndexByLineNumber(editorIndex, newBufferPosition.row);

      if (oldPositionChunkIndex >= 0) {
        var diffChunk = this._chunks[oldPositionChunkIndex];
        diffChunk.isSelected = false;
        this._editorDiffExtender1.deselectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender2.deselectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
      }
      if (newPositionChunkIndex >= 0) {
        this._selectChunk(newPositionChunkIndex, false);
      }
    }

    // ----------------------------------------------------------------------- //
    // --------------------------- PRIVATE METHODS --------------------------- //
    // ----------------------------------------------------------------------- //

    /**
     * Selects and highlights the diff chunk in both editors according to the
     * given index.
     *
     * @param index The index of the diff chunk to highlight in both editors.
     */
  }, {
    key: '_selectChunk',
    value: function _selectChunk(index, isNextOrPrev) {
      var diffChunk = this._chunks[index];
      if (diffChunk != null) {
        diffChunk.isSelected = true;

        if (isNextOrPrev) {
          // deselect previous next/prev highlights
          this._editorDiffExtender1.deselectAllLines();
          this._editorDiffExtender2.deselectAllLines();
          // scroll the editors
          this._editorDiffExtender1.getEditor().setCursorBufferPosition([diffChunk.oldLineStart, 0], { autoscroll: true });
          this._editorDiffExtender2.getEditor().setCursorBufferPosition([diffChunk.newLineStart, 0], { autoscroll: true });
        }

        // highlight selection in both editors
        this._editorDiffExtender1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
      }
    }
  }, {
    key: '_getChunkIndexByLineNumber',
    value: function _getChunkIndexByLineNumber(editorIndex, lineNumber) {
      for (var i = 0; i < this._chunks.length; i++) {
        var diffChunk = this._chunks[i];
        if (editorIndex === 1) {
          if (diffChunk.oldLineStart <= lineNumber && diffChunk.oldLineEnd > lineNumber) {
            return i;
          }
        } else if (editorIndex === 2) {
          if (diffChunk.newLineStart <= lineNumber && diffChunk.newLineEnd > lineNumber) {
            return i;
          }
        }
      }

      return -1;
    }

    /**
     * Highlights the word diff of the chunk passed in.
     *
     * @param chunk The chunk that should have its words highlighted.
     */
  }, {
    key: '_highlightWordsInChunk',
    value: function _highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored) {
      var leftLineNumber = chunk.oldLineStart;
      var rightLineNumber = chunk.newLineStart;
      // for each line that has a corresponding line
      while (leftLineNumber < chunk.oldLineEnd && rightLineNumber < chunk.newLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        var editor2LineText = this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber);

        if (editor1LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: editor2LineText }], rightHighlightType, isWhitespaceIgnored);
        } else if (editor2LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        } else {
          // perform regular word diff
          var wordDiff = _computeWordDiff2['default'].computeWordDiff(editor1LineText, editor2LineText);
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, wordDiff.removedWords, leftHighlightType, isWhitespaceIgnored);
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, wordDiff.addedWords, rightHighlightType, isWhitespaceIgnored);
        }

        leftLineNumber++;
        rightLineNumber++;
      }

      // highlight remaining lines in left editor
      while (leftLineNumber < chunk.oldLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        leftLineNumber++;
      }
      // highlight remaining lines in the right editor
      while (rightLineNumber < chunk.newLineEnd) {
        this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber) }], rightHighlightType, isWhitespaceIgnored);
        rightLineNumber++;
      }
    }
  }]);

  return DiffView;
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL3NwbGl0LWRpZmYvbGliL2RpZmYtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7a0NBRStCLHdCQUF3Qjs7OzsrQkFDM0IscUJBQXFCOzs7O0FBSGpELFdBQVcsQ0FBQTs7QUFNWCxNQUFNLENBQUMsT0FBTzs7Ozs7QUFJRCxXQUpVLFFBQVEsQ0FJakIsT0FBTyxFQUFFOzBCQUpBLFFBQVE7O0FBSzNCLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBdUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BFLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQ0FBdUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BFLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7QUFDaEMsUUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztBQUM3QixRQUFJLENBQUMsa0JBQWtCLEdBQUcsMEJBQTBCLENBQUM7QUFDckQsUUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7R0FDekI7Ozs7Ozs7Ozs7OztlQVpvQixRQUFROztXQXVCbEIscUJBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFO0FBQy9GLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7OztBQUdqQyxVQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsRUFBRTtBQUMvQixZQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RELFlBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxVQUFVLEdBQUcs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LGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDakcsWUFBSSxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFDLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQy9JLHNCQUFjLEVBQUUsQ0FBQztPQUNsQjs7QUFFRCxhQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFO0FBQ3hDLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLENBQUMsRUFBQyxDQUFDLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM3TSx1QkFBZSxFQUFFLENBQUM7T0FDbkI7S0FDRjs7O1NBbFVvQixRQUFRO0lBbVU5QixDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL3NwbGl0LWRpZmYvbGliL2RpZmYtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBFZGl0b3JEaWZmRXh0ZW5kZXIgZnJvbSAnLi9lZGl0b3ItZGlmZi1leHRlbmRlcic7XG5pbXBvcnQgQ29tcHV0ZVdvcmREaWZmIGZyb20gJy4vY29tcHV0ZS13b3JkLWRpZmYnO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRGlmZlZpZXcge1xuICAvKlxuICAgKiBAcGFyYW0gZWRpdG9ycyBBcnJheSBvZiBlZGl0b3JzIGJlaW5nIGRpZmZlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVkaXRvcnMpIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxID0gbmV3IEVkaXRvckRpZmZFeHRlbmRlcihlZGl0b3JzLmVkaXRvcjEpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIgPSBuZXcgRWRpdG9yRGlmZkV4dGVuZGVyKGVkaXRvcnMuZWRpdG9yMik7XG4gICAgdGhpcy5fY2h1bmtzID0gW107XG4gICAgdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSAwO1xuICAgIHRoaXMuX0NPUFlfSEVMUF9NRVNTQUdFID0gJ05vIGRpZmZlcmVuY2VzIHNlbGVjdGVkLic7XG4gICAgdGhpcy5fbWFya2VyTGF5ZXJzID0ge307XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBoaWdobGlnaHRpbmcgdG8gdGhlIGVkaXRvcnMgdG8gc2hvdyB0aGUgZGlmZi5cbiAgICpcbiAgICogQHBhcmFtIGRpZmYgVGhlIGRpZmYgdG8gaGlnaGxpZ2h0LlxuICAgKiBAcGFyYW0gbGVmdEhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IChleDogJ2FkZGVkJykuXG4gICAqIEBwYXJhbSByaWdodEhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IChleDogJ3JlbW92ZWQnKS5cbiAgICogQHBhcmFtIGlzV29yZERpZmZFbmFibGVkIFdoZXRoZXIgZGlmZmVyZW5jZXMgYmV0d2VlbiB3b3JkcyBwZXIgbGluZSBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQuXG4gICAqIEBwYXJhbSBpc1doaXRlc3BhY2VJZ25vcmVkIFdoZXRoZXIgd2hpdGVzcGFjZSBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGRpc3BsYXlEaWZmKGRpZmYsIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV29yZERpZmZFbmFibGVkLCBpc1doaXRlc3BhY2VJZ25vcmVkKSB7XG4gICAgdGhpcy5fY2h1bmtzID0gZGlmZi5jaHVua3MgfHwgW107XG5cbiAgICAvLyBtYWtlIHRoZSBsYXN0IGNodW5rIGVxdWFsIHNpemUgb24gYm90aCBzY3JlZW5zIHNvIHRoZSBlZGl0b3JzIHJldGFpbiBzeW5jIHNjcm9sbCAjNThcbiAgICBpZih0aGlzLmdldE51bURpZmZlcmVuY2VzKCkgPiAwKSB7XG4gICAgICB2YXIgbGFzdENodW5rID0gdGhpcy5fY2h1bmtzW3RoaXMuX2NodW5rcy5sZW5ndGggLSAxXTtcbiAgICAgIHZhciBvbGRDaHVua1JhbmdlID0gbGFzdENodW5rLm9sZExpbmVFbmQgLSBsYXN0Q2h1bmsub2xkTGluZVN0YXJ0O1xuICAgICAgdmFyIG5ld0NodW5rUmFuZ2UgPSBsYXN0Q2h1bmsubmV3TGluZUVuZCAtIGxhc3RDaHVuay5uZXdMaW5lU3RhcnQ7XG4gICAgICBpZihvbGRDaHVua1JhbmdlID4gbmV3Q2h1bmtSYW5nZSkge1xuICAgICAgICAvLyBtYWtlIHRoZSBvZmZzZXQgYXMgbGFyZ2UgYXMgbmVlZGVkIHRvIG1ha2UgdGhlIGNodW5rIHRoZSBzYW1lIHNpemUgaW4gYm90aCBlZGl0b3JzXG4gICAgICAgIGRpZmYubmV3TGluZU9mZnNldHNbbGFzdENodW5rLm5ld0xpbmVTdGFydCArIG5ld0NodW5rUmFuZ2VdID0gb2xkQ2h1bmtSYW5nZSAtIG5ld0NodW5rUmFuZ2U7XG4gICAgICB9IGVsc2UgaWYobmV3Q2h1bmtSYW5nZSA+IG9sZENodW5rUmFuZ2UpIHtcbiAgICAgICAgLy8gbWFrZSB0aGUgb2Zmc2V0IGFzIGxhcmdlIGFzIG5lZWRlZCB0byBtYWtlIHRoZSBjaHVuayB0aGUgc2FtZSBzaXplIGluIGJvdGggZWRpdG9yc1xuICAgICAgICBkaWZmLm9sZExpbmVPZmZzZXRzW2xhc3RDaHVuay5vbGRMaW5lU3RhcnQgKyBvbGRDaHVua1JhbmdlXSA9IG5ld0NodW5rUmFuZ2UgLSBvbGRDaHVua1JhbmdlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvcih2YXIgY2h1bmsgb2YgdGhpcy5fY2h1bmtzKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhpZ2hsaWdodExpbmVzKGNodW5rLm9sZExpbmVTdGFydCwgY2h1bmsub2xkTGluZUVuZCwgbGVmdEhpZ2hsaWdodFR5cGUpO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5oaWdobGlnaHRMaW5lcyhjaHVuay5uZXdMaW5lU3RhcnQsIGNodW5rLm5ld0xpbmVFbmQsIHJpZ2h0SGlnaGxpZ2h0VHlwZSk7XG5cbiAgICAgIGlmKGlzV29yZERpZmZFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuX2hpZ2hsaWdodFdvcmRzSW5DaHVuayhjaHVuaywgbGVmdEhpZ2hsaWdodFR5cGUsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRMaW5lT2Zmc2V0cyhkaWZmLm9sZExpbmVPZmZzZXRzKTtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldExpbmVPZmZzZXRzKGRpZmYubmV3TGluZU9mZnNldHMpO1xuXG4gICAgdGhpcy5fbWFya2VyTGF5ZXJzID0ge1xuICAgICAgZWRpdG9yMToge1xuICAgICAgICBpZDogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5pZCxcbiAgICAgICAgbGluZU1hcmtlckxheWVyOiB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldExpbmVNYXJrZXJMYXllcigpLFxuICAgICAgICBoaWdobGlnaHRUeXBlOiBsZWZ0SGlnaGxpZ2h0VHlwZSxcbiAgICAgICAgc2VsZWN0aW9uTWFya2VyTGF5ZXI6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0U2VsZWN0aW9uTWFya2VyTGF5ZXIoKVxuICAgICAgfSxcbiAgICAgIGVkaXRvcjI6IHtcbiAgICAgICAgaWQ6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuaWQsXG4gICAgICAgIGxpbmVNYXJrZXJMYXllcjogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRMaW5lTWFya2VyTGF5ZXIoKSxcbiAgICAgICAgaGlnaGxpZ2h0VHlwZTogcmlnaHRIaWdobGlnaHRUeXBlLFxuICAgICAgICBzZWxlY3Rpb25NYXJrZXJMYXllcjogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRTZWxlY3Rpb25NYXJrZXJMYXllcigpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgZGlmZiBoaWdobGlnaHRpbmcgYW5kIG9mZnNldHMgZnJvbSB0aGUgZWRpdG9ycy5cbiAgICovXG4gIGNsZWFyRGlmZigpIHtcbiAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmRlc3Ryb3lNYXJrZXJzKCk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXN0cm95TWFya2VycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBtb3ZlIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBoaWdobGlnaHQgdG8gdGhlIG5leHQgZGlmZiBjaHVuay5cbiAgICovXG4gIG5leHREaWZmKCkge1xuICAgIGlmKHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgrKztcbiAgICAgIGlmKHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCA+PSB0aGlzLmdldE51bURpZmZlcmVuY2VzKCkpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gMDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX3NlbGVjdENodW5rKHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCwgdHJ1ZSk7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgdG8gbW92ZSB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGlnaGxpZ2h0IHRvIHRoZSBwcmV2aW91cyBkaWZmIGNodW5rLlxuICAgKi9cbiAgcHJldkRpZmYoKSB7XG4gICAgaWYodGhpcy5faXNTZWxlY3Rpb25BY3RpdmUpIHtcbiAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleC0tO1xuICAgICAgaWYodGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4IDwgMCkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSB0aGlzLmdldE51bURpZmZlcmVuY2VzKCkgLSAxXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZWxlY3RDaHVuayh0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgsIHRydWUpO1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGlmZiBjaHVuayBmcm9tIHRoZSBsZWZ0IGVkaXRvciB0byB0aGUgcmlnaHRcbiAgICogZWRpdG9yLlxuICAgKi9cbiAgY29weVRvUmlnaHQoKSB7XG4gICAgdmFyIGZvdW5kU2VsZWN0aW9uID0gZmFsc2U7XG4gICAgdmFyIG9mZnNldCA9IDA7IC8vIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuXG4gICAgZm9yKHZhciBkaWZmQ2h1bmsgb2YgdGhpcy5fY2h1bmtzKSB7XG4gICAgICBpZihkaWZmQ2h1bmsuaXNTZWxlY3RlZCkge1xuICAgICAgICBmb3VuZFNlbGVjdGlvbiA9IHRydWU7XG5cbiAgICAgICAgdmFyIHRleHRUb0NvcHkgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbZGlmZkNodW5rLm9sZExpbmVTdGFydCwgMF0sIFtkaWZmQ2h1bmsub2xkTGluZUVuZCwgMF1dKTtcbiAgICAgICAgdmFyIGxhc3RCdWZmZXJSb3cgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmdldExhc3RCdWZmZXJSb3coKTtcblxuICAgICAgICAvLyBpbnNlcnQgbmV3IGxpbmUgaWYgdGhlIGNodW5rIHdlIHdhbnQgdG8gY29weSB3aWxsIGJlIGJlbG93IHRoZSBsYXN0IGxpbmUgb2YgdGhlIG90aGVyIGVkaXRvclxuICAgICAgICBpZigoZGlmZkNodW5rLm5ld0xpbmVTdGFydCArIG9mZnNldCkgPiBsYXN0QnVmZmVyUm93KSB7XG4gICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbbGFzdEJ1ZmZlclJvdywgMF0sIHthdXRvc2Nyb2xsOiBmYWxzZX0pO1xuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuaW5zZXJ0TmV3bGluZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQsIDBdLCBbZGlmZkNodW5rLm5ld0xpbmVFbmQgKyBvZmZzZXQsIDBdXSwgdGV4dFRvQ29weSk7XG4gICAgICAgIC8vIG9mZnNldCB3aWxsIGJlIHRoZSBhbW91bnQgb2YgbGluZXMgdG8gYmUgY29waWVkIG1pbnVzIHRoZSBhbW91bnQgb2YgbGluZXMgb3ZlcndyaXR0ZW5cbiAgICAgICAgb2Zmc2V0ICs9IChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpIC0gKGRpZmZDaHVuay5uZXdMaW5lRW5kIC0gZGlmZkNodW5rLm5ld0xpbmVTdGFydCk7XG4gICAgICAgIC8vIG1vdmUgdGhlIHNlbGVjdGlvbiBwb2ludGVyIGJhY2sgc28gdGhlIG5leHQgZGlmZiBjaHVuayBpcyBub3Qgc2tpcHBlZFxuICAgICAgICBpZih0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhhc1NlbGVjdGlvbigpIHx8IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuaGFzU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFmb3VuZFNlbGVjdGlvbikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSwgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGlmZiBjaHVuayBmcm9tIHRoZSByaWdodCBlZGl0b3IgdG8gdGhlIGxlZnRcbiAgICogZWRpdG9yLlxuICAgKi9cbiAgY29weVRvTGVmdCgpIHtcbiAgICB2YXIgZm91bmRTZWxlY3Rpb24gPSBmYWxzZTtcbiAgICB2YXIgb2Zmc2V0ID0gMDsgLy8ga2VlcCB0cmFjayBvZiBsaW5lIG9mZnNldCAodXNlZCB3aGVuIHRoZXJlIGFyZSBtdWx0aXBsZSBjaHVua3MgYmVpbmcgbW92ZWQpXG5cbiAgICBmb3IodmFyIGRpZmZDaHVuayBvZiB0aGlzLl9jaHVua3MpIHtcbiAgICAgIGlmKGRpZmZDaHVuay5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGZvdW5kU2VsZWN0aW9uID0gdHJ1ZTtcblxuICAgICAgICB2YXIgdGV4dFRvQ29weSA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kLCAwXV0pO1xuICAgICAgICB2YXIgbGFzdEJ1ZmZlclJvdyA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuZ2V0TGFzdEJ1ZmZlclJvdygpO1xuICAgICAgICAvLyBpbnNlcnQgbmV3IGxpbmUgaWYgdGhlIGNodW5rIHdlIHdhbnQgdG8gY29weSB3aWxsIGJlIGJlbG93IHRoZSBsYXN0IGxpbmUgb2YgdGhlIG90aGVyIGVkaXRvclxuICAgICAgICBpZigoZGlmZkNodW5rLm9sZExpbmVTdGFydCArIG9mZnNldCkgPiBsYXN0QnVmZmVyUm93KSB7XG4gICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbbGFzdEJ1ZmZlclJvdywgMF0sIHthdXRvc2Nyb2xsOiBmYWxzZX0pO1xuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuaW5zZXJ0TmV3bGluZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5zZXRUZXh0SW5CdWZmZXJSYW5nZShbW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQgKyBvZmZzZXQsIDBdLCBbZGlmZkNodW5rLm9sZExpbmVFbmQgKyBvZmZzZXQsIDBdXSwgdGV4dFRvQ29weSk7XG4gICAgICAgIC8vIG9mZnNldCB3aWxsIGJlIHRoZSBhbW91bnQgb2YgbGluZXMgdG8gYmUgY29waWVkIG1pbnVzIHRoZSBhbW91bnQgb2YgbGluZXMgb3ZlcndyaXR0ZW5cbiAgICAgICAgb2Zmc2V0ICs9IChkaWZmQ2h1bmsubmV3TGluZUVuZCAtIGRpZmZDaHVuay5uZXdMaW5lU3RhcnQpIC0gKGRpZmZDaHVuay5vbGRMaW5lRW5kIC0gZGlmZkNodW5rLm9sZExpbmVTdGFydCk7XG4gICAgICAgIC8vIG1vdmUgdGhlIHNlbGVjdGlvbiBwb2ludGVyIGJhY2sgc28gdGhlIG5leHQgZGlmZiBjaHVuayBpcyBub3Qgc2tpcHBlZFxuICAgICAgICBpZih0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhhc1NlbGVjdGlvbigpIHx8IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuaGFzU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCFmb3VuZFNlbGVjdGlvbikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSwgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHVwIHRoZSBlZGl0b3IgaW5kaWNhdGVkIGJ5IGluZGV4LiBBIGNsZWFuIHVwIHdpbGwgcmVtb3ZlIHRoZSBlZGl0b3JcbiAgICogb3IgdGhlIHBhbmUgaWYgbmVjZXNzYXJ5LiBUeXBpY2FsbHkgbGVmdCBlZGl0b3IgPT0gMSBhbmQgcmlnaHQgZWRpdG9yID09IDIuXG4gICAqXG4gICAqIEBwYXJhbSBlZGl0b3JJbmRleCBUaGUgaW5kZXggb2YgdGhlIGVkaXRvciB0byBjbGVhbiB1cC5cbiAgICovXG4gIGNsZWFuVXBFZGl0b3IoZWRpdG9ySW5kZXgpIHtcbiAgICBpZihlZGl0b3JJbmRleCA9PT0gMSkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5jbGVhblVwKCk7XG4gICAgfSBlbHNlIGlmKGVkaXRvckluZGV4ID09PSAyKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmNsZWFuVXAoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGVkaXRvciBkaWZmIGV4dGVuZGVycy5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXN0cm95KCk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXN0cm95KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGVkaXRvcnMuXG4gICAqXG4gICAqIEByZXR1cm4gaW50IFRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgZWRpdG9ycy5cbiAgICovXG4gIGdldE51bURpZmZlcmVuY2VzKCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHRoaXMuX2NodW5rcykgPyB0aGlzLl9jaHVua3MubGVuZ3RoIDogMDtcbiAgfVxuXG4gIGdldE1hcmtlckxheWVycygpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFya2VyTGF5ZXJzO1xuICB9XG5cbiAgaGFuZGxlQ3Vyc29yQ2hhbmdlKGN1cnNvciwgb2xkQnVmZmVyUG9zaXRpb24sIG5ld0J1ZmZlclBvc2l0aW9uKSB7XG4gICAgdmFyIGVkaXRvckluZGV4ID0gKGN1cnNvci5lZGl0b3IgPT09IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkpID8gMSA6IDI7XG4gICAgdmFyIG9sZFBvc2l0aW9uQ2h1bmtJbmRleCA9IHRoaXMuX2dldENodW5rSW5kZXhCeUxpbmVOdW1iZXIoZWRpdG9ySW5kZXgsIG9sZEJ1ZmZlclBvc2l0aW9uLnJvdyk7XG4gICAgdmFyIG5ld1Bvc2l0aW9uQ2h1bmtJbmRleCA9IHRoaXMuX2dldENodW5rSW5kZXhCeUxpbmVOdW1iZXIoZWRpdG9ySW5kZXgsIG5ld0J1ZmZlclBvc2l0aW9uLnJvdyk7XG5cbiAgICBpZihvbGRQb3NpdGlvbkNodW5rSW5kZXggPj0gMCkge1xuICAgICAgdmFyIGRpZmZDaHVuayA9IHRoaXMuX2NodW5rc1tvbGRQb3NpdGlvbkNodW5rSW5kZXhdO1xuICAgICAgZGlmZkNodW5rLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZGVzZWxlY3RMaW5lcyhkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCBkaWZmQ2h1bmsub2xkTGluZUVuZCk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmRlc2VsZWN0TGluZXMoZGlmZkNodW5rLm5ld0xpbmVTdGFydCwgZGlmZkNodW5rLm5ld0xpbmVFbmQpO1xuICAgIH1cbiAgICBpZihuZXdQb3NpdGlvbkNodW5rSW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5fc2VsZWN0Q2h1bmsobmV3UG9zaXRpb25DaHVua0luZGV4LCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBSSVZBVEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuICAvKipcbiAgICogU2VsZWN0cyBhbmQgaGlnaGxpZ2h0cyB0aGUgZGlmZiBjaHVuayBpbiBib3RoIGVkaXRvcnMgYWNjb3JkaW5nIHRvIHRoZVxuICAgKiBnaXZlbiBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZGlmZiBjaHVuayB0byBoaWdobGlnaHQgaW4gYm90aCBlZGl0b3JzLlxuICAgKi9cbiAgX3NlbGVjdENodW5rKGluZGV4LCBpc05leHRPclByZXYpIHtcbiAgICB2YXIgZGlmZkNodW5rID0gdGhpcy5fY2h1bmtzW2luZGV4XTtcbiAgICBpZihkaWZmQ2h1bmsgIT0gbnVsbCkge1xuICAgICAgZGlmZkNodW5rLmlzU2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgICBpZihpc05leHRPclByZXYpIHtcbiAgICAgICAgLy8gZGVzZWxlY3QgcHJldmlvdXMgbmV4dC9wcmV2IGhpZ2hsaWdodHNcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXNlbGVjdEFsbExpbmVzKCk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzZWxlY3RBbGxMaW5lcygpO1xuICAgICAgICAvLyBzY3JvbGwgdGhlIGVkaXRvcnNcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZGlmZkNodW5rLm9sZExpbmVTdGFydCwgMF0sIHthdXRvc2Nyb2xsOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQsIDBdLCB7YXV0b3Njcm9sbDogdHJ1ZX0pO1xuICAgICAgfVxuXG4gICAgICAvLyBoaWdobGlnaHQgc2VsZWN0aW9uIGluIGJvdGggZWRpdG9yc1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZWxlY3RMaW5lcyhkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCBkaWZmQ2h1bmsub2xkTGluZUVuZCk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNlbGVjdExpbmVzKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQsIGRpZmZDaHVuay5uZXdMaW5lRW5kKTtcbiAgICB9XG4gIH1cblxuICBfZ2V0Q2h1bmtJbmRleEJ5TGluZU51bWJlcihlZGl0b3JJbmRleCwgbGluZU51bWJlcikge1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuX2NodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRpZmZDaHVuayA9IHRoaXMuX2NodW5rc1tpXTtcbiAgICAgIGlmKGVkaXRvckluZGV4ID09PSAxKSB7XG4gICAgICAgIGlmKGRpZmZDaHVuay5vbGRMaW5lU3RhcnQgPD0gbGluZU51bWJlciAmJiBkaWZmQ2h1bmsub2xkTGluZUVuZCA+IGxpbmVOdW1iZXIpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKGVkaXRvckluZGV4ID09PSAyKSB7XG4gICAgICAgIGlmKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQgPD0gbGluZU51bWJlciAmJiBkaWZmQ2h1bmsubmV3TGluZUVuZCA+IGxpbmVOdW1iZXIpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHRoZSB3b3JkIGRpZmYgb2YgdGhlIGNodW5rIHBhc3NlZCBpbi5cbiAgICpcbiAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0aGF0IHNob3VsZCBoYXZlIGl0cyB3b3JkcyBoaWdobGlnaHRlZC5cbiAgICovXG4gIF9oaWdobGlnaHRXb3Jkc0luQ2h1bmsoY2h1bmssIGxlZnRIaWdobGlnaHRUeXBlLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpIHtcbiAgICB2YXIgbGVmdExpbmVOdW1iZXIgPSBjaHVuay5vbGRMaW5lU3RhcnQ7XG4gICAgdmFyIHJpZ2h0TGluZU51bWJlciA9IGNodW5rLm5ld0xpbmVTdGFydDtcbiAgICAvLyBmb3IgZWFjaCBsaW5lIHRoYXQgaGFzIGEgY29ycmVzcG9uZGluZyBsaW5lXG4gICAgd2hpbGUobGVmdExpbmVOdW1iZXIgPCBjaHVuay5vbGRMaW5lRW5kICYmIHJpZ2h0TGluZU51bWJlciA8IGNodW5rLm5ld0xpbmVFbmQpIHtcbiAgICAgIHZhciBlZGl0b3IxTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGxlZnRMaW5lTnVtYmVyKTtcbiAgICAgIHZhciBlZGl0b3IyTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJpZ2h0TGluZU51bWJlcik7XG5cbiAgICAgIGlmKGVkaXRvcjFMaW5lVGV4dCA9PSAnJykge1xuICAgICAgICAvLyBjb21wdXRlV29yZERpZmYgcmV0dXJucyBlbXB0eSBmb3IgbGluZXMgdGhhdCBhcmUgcGFpcmVkIHdpdGggZW1wdHkgbGluZXNcbiAgICAgICAgLy8gbmVlZCB0byBmb3JjZSBhIGhpZ2hsaWdodFxuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldFdvcmRIaWdobGlnaHRzKHJpZ2h0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogZWRpdG9yMkxpbmVUZXh0fV0sIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICB9IGVsc2UgaWYoIGVkaXRvcjJMaW5lVGV4dCA9PSAnJyApIHtcbiAgICAgICAgLy8gY29tcHV0ZVdvcmREaWZmIHJldHVybnMgZW1wdHkgZm9yIGxpbmVzIHRoYXQgYXJlIHBhaXJlZCB3aXRoIGVtcHR5IGxpbmVzXG4gICAgICAgIC8vIG5lZWQgdG8gZm9yY2UgYSBoaWdobGlnaHRcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyhsZWZ0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogZWRpdG9yMUxpbmVUZXh0fV0sIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHBlcmZvcm0gcmVndWxhciB3b3JkIGRpZmZcbiAgICAgICAgdmFyIHdvcmREaWZmID0gQ29tcHV0ZVdvcmREaWZmLmNvbXB1dGVXb3JkRGlmZihlZGl0b3IxTGluZVRleHQsIGVkaXRvcjJMaW5lVGV4dCk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0V29yZEhpZ2hsaWdodHMobGVmdExpbmVOdW1iZXIsIHdvcmREaWZmLnJlbW92ZWRXb3JkcywgbGVmdEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQpO1xuICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldFdvcmRIaWdobGlnaHRzKHJpZ2h0TGluZU51bWJlciwgd29yZERpZmYuYWRkZWRXb3JkcywgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkKTtcbiAgICAgIH1cblxuICAgICAgbGVmdExpbmVOdW1iZXIrKztcbiAgICAgIHJpZ2h0TGluZU51bWJlcisrO1xuICAgIH1cblxuICAgIC8vIGhpZ2hsaWdodCByZW1haW5pbmcgbGluZXMgaW4gbGVmdCBlZGl0b3JcbiAgICB3aGlsZShsZWZ0TGluZU51bWJlciA8IGNodW5rLm9sZExpbmVFbmQpIHtcbiAgICAgIHZhciBlZGl0b3IxTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGxlZnRMaW5lTnVtYmVyKTtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0V29yZEhpZ2hsaWdodHMobGVmdExpbmVOdW1iZXIsIFt7Y2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjFMaW5lVGV4dH1dLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICBsZWZ0TGluZU51bWJlcisrO1xuICAgIH1cbiAgICAvLyBoaWdobGlnaHQgcmVtYWluaW5nIGxpbmVzIGluIHRoZSByaWdodCBlZGl0b3JcbiAgICB3aGlsZShyaWdodExpbmVOdW1iZXIgPCBjaHVuay5uZXdMaW5lRW5kKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNldFdvcmRIaWdobGlnaHRzKHJpZ2h0TGluZU51bWJlciwgW3tjaGFuZ2VkOiB0cnVlLCB2YWx1ZTogdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyhyaWdodExpbmVOdW1iZXIpfV0sIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCk7XG4gICAgICByaWdodExpbmVOdW1iZXIrKztcbiAgICB9XG4gIH1cbn07XG4iXX0=