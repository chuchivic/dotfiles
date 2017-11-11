(function() {
  var log, touchbar;

  log = require('./log');

  if (atom.config.get('autocomplete-python.enableTouchBar')) {
    touchbar = require('./touchbar');
  }

  module.exports = {
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref = this.markers;
        for (i = 0, len = ref.length; i < len; i++) {
          marker = ref[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = this.Selector.create(disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref1, text, type, view;
          if (marker.isDestroyed()) {
            return;
          }
          if (results.length > 0) {
            ref1 = results[0], text = ref1.text, fileName = ref1.fileName, line = ref1.line, column = ref1.column, type = ref1.type, description = ref1.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            if (atom.config.get('autocomplete-python.enableTouchBar')) {
              return touchbar.update(results[0]);
            }
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvdG9vbHRpcHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBQ04sSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCLENBQUg7SUFDRSxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVIsRUFEYjs7O0VBR0EsTUFBTSxDQUFDLE9BQVAsR0FDQTtJQUFBLHFCQUFBLEVBQXVCLFNBQUMsS0FBRDtBQUNyQixVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsT0FBSjtBQUNFO0FBQUEsYUFBQSxxQ0FBQTs7VUFDRSxHQUFHLENBQUMsS0FBSixDQUFVLHVCQUFWLEVBQW1DLE1BQW5DO1VBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBQTtBQUZGLFNBREY7T0FBQSxNQUFBO1FBS0UsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUxiOztNQU9BLE1BQUEsR0FBUyxLQUFLLENBQUM7TUFDZixNQUFBLEdBQVMsS0FBSyxDQUFDLE1BQU0sQ0FBQztNQUN0QixlQUFBLEdBQWtCLE1BQU0sQ0FBQyx5QkFBUCxDQUFBO01BQ2xCLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQ2hCLEtBQUssQ0FBQyxpQkFEVTtNQUVsQixVQUFBLEdBQWEsZUFBZSxDQUFDLGFBQWhCLENBQUE7TUFFYixrQkFBQSxHQUF3QixJQUFDLENBQUEsa0JBQUYsR0FBcUI7TUFDNUMsa0JBQUEsR0FBcUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLGtCQUFqQjtNQUVyQixJQUFHLElBQUMsQ0FBQSx3QkFBRCxDQUEwQixrQkFBMUIsRUFBOEMsVUFBOUMsQ0FBSDtRQUNFLEdBQUcsQ0FBQyxLQUFKLENBQVUsOEJBQVY7QUFDQSxlQUZGOztNQUlBLE1BQUEsR0FBUyxNQUFNLENBQUMsZUFBUCxDQUF1QixlQUF2QixFQUF3QztRQUFDLFVBQUEsRUFBWSxPQUFiO09BQXhDO01BRVQsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZDtNQUVBLFVBQUEsR0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRCxFQUFTLGNBQVQ7QUFDWCxjQUFBO1VBQUEsT0FBQSxHQUNFO1lBQUEsRUFBQSxFQUFJLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixTQUFwQixFQUErQixNQUEvQixFQUF1QyxjQUF2QyxDQUFKO1lBQ0EsTUFBQSxFQUFRLFNBRFI7WUFFQSxJQUFBLEVBQU0sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUZOO1lBR0EsTUFBQSxFQUFRLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FIUjtZQUlBLElBQUEsRUFBTSxjQUFjLENBQUMsR0FKckI7WUFLQSxNQUFBLEVBQVEsY0FBYyxDQUFDLE1BTHZCO1lBTUEsTUFBQSxFQUFRLEtBQUMsQ0FBQSxzQkFBRCxDQUFBLENBTlI7O1VBT0YsS0FBQyxDQUFBLFlBQUQsQ0FBYyxLQUFDLENBQUEsVUFBRCxDQUFZLE9BQVosQ0FBZDtBQUNBLGlCQUFXLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRDttQkFDakIsS0FBQyxDQUFBLFFBQVMsQ0FBQSxPQUFPLENBQUMsRUFBUixDQUFWLEdBQXdCO1VBRFAsQ0FBUjtRQVZBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTthQWFiLFVBQUEsQ0FBVyxNQUFYLEVBQW1CLEtBQUssQ0FBQyxpQkFBekIsQ0FBMkMsQ0FBQyxJQUE1QyxDQUFpRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtBQUMvQyxjQUFBO1VBQUEsSUFBRyxNQUFNLENBQUMsV0FBUCxDQUFBLENBQUg7QUFDRSxtQkFERjs7VUFFQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLENBQXBCO1lBQ0UsT0FBb0QsT0FBUSxDQUFBLENBQUEsQ0FBNUQsRUFBQyxnQkFBRCxFQUFPLHdCQUFQLEVBQWlCLGdCQUFqQixFQUF1QixvQkFBdkIsRUFBK0IsZ0JBQS9CLEVBQXFDO1lBRXJDLFdBQUEsR0FBYyxXQUFXLENBQUMsSUFBWixDQUFBO1lBQ2QsSUFBRyxDQUFJLFdBQVA7QUFDRSxxQkFERjs7WUFFQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0NBQXZCO1lBQ1AsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsV0FBeEIsQ0FBakI7WUFDQSxVQUFBLEdBQWEsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsTUFBdEIsRUFBOEI7Y0FDekMsSUFBQSxFQUFNLFNBRG1DO2NBRXpDLElBQUEsRUFBTSxJQUZtQztjQUd6QyxRQUFBLEVBQVUsTUFIK0I7YUFBOUI7WUFLYixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQ0FBaEIsQ0FBSDtxQkFDRSxRQUFRLENBQUMsTUFBVCxDQUFnQixPQUFRLENBQUEsQ0FBQSxDQUF4QixFQURGO2FBYkY7O1FBSCtDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqRDtJQXZDcUIsQ0FBdkI7O0FBTEEiLCJzb3VyY2VzQ29udGVudCI6WyJsb2cgPSByZXF1aXJlICcuL2xvZydcbmlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5lbmFibGVUb3VjaEJhcicpXG4gIHRvdWNoYmFyID0gcmVxdWlyZSAnLi90b3VjaGJhcidcblxubW9kdWxlLmV4cG9ydHMgPVxuX3Nob3dTaWduYXR1cmVPdmVybGF5OiAoZXZlbnQpIC0+XG4gIGlmIEBtYXJrZXJzXG4gICAgZm9yIG1hcmtlciBpbiBAbWFya2Vyc1xuICAgICAgbG9nLmRlYnVnICdkZXN0cm95aW5nIG9sZCBtYXJrZXInLCBtYXJrZXJcbiAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgZWxzZVxuICAgIEBtYXJrZXJzID0gW11cblxuICBjdXJzb3IgPSBldmVudC5jdXJzb3JcbiAgZWRpdG9yID0gZXZlbnQuY3Vyc29yLmVkaXRvclxuICB3b3JkQnVmZmVyUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihcbiAgICBldmVudC5uZXdCdWZmZXJQb3NpdGlvbilcbiAgc2NvcGVDaGFpbiA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZUNoYWluKClcblxuICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBcIiN7QGRpc2FibGVGb3JTZWxlY3Rvcn0sIC5zb3VyY2UucHl0aG9uIC5udW1lcmljLCAuc291cmNlLnB5dGhvbiAuaW50ZWdlciwgLnNvdXJjZS5weXRob24gLmRlY2ltYWwsIC5zb3VyY2UucHl0aG9uIC5wdW5jdHVhdGlvbiwgLnNvdXJjZS5weXRob24gLmtleXdvcmQsIC5zb3VyY2UucHl0aG9uIC5zdG9yYWdlLCAuc291cmNlLnB5dGhvbiAudmFyaWFibGUucGFyYW1ldGVyLCAuc291cmNlLnB5dGhvbiAuZW50aXR5Lm5hbWVcIlxuICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKGRpc2FibGVGb3JTZWxlY3RvcilcblxuICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICBsb2cuZGVidWcgJ2RvIG5vdGhpbmcgZm9yIHRoaXMgc2VsZWN0b3InXG4gICAgcmV0dXJuXG5cbiAgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZSh3b3JkQnVmZmVyUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSlcblxuICBAbWFya2Vycy5wdXNoKG1hcmtlcilcblxuICBnZXRUb29sdGlwID0gKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pID0+XG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgndG9vbHRpcCcsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICd0b29sdGlwJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICBnZXRUb29sdGlwKGVkaXRvciwgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgaWYgbWFya2VyLmlzRGVzdHJveWVkKClcbiAgICAgIHJldHVyblxuICAgIGlmIHJlc3VsdHMubGVuZ3RoID4gMFxuICAgICAge3RleHQsIGZpbGVOYW1lLCBsaW5lLCBjb2x1bW4sIHR5cGUsIGRlc2NyaXB0aW9ufSA9IHJlc3VsdHNbMF1cblxuICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi50cmltKClcbiAgICAgIGlmIG5vdCBkZXNjcmlwdGlvblxuICAgICAgICByZXR1cm5cbiAgICAgIHZpZXcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhdXRvY29tcGxldGUtcHl0aG9uLXN1Z2dlc3Rpb24nKVxuICAgICAgdmlldy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkZXNjcmlwdGlvbikpXG4gICAgICBkZWNvcmF0aW9uID0gZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgIGl0ZW06IHZpZXcsXG4gICAgICAgIHBvc2l0aW9uOiAnaGVhZCdcbiAgICAgIH0pXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZW5hYmxlVG91Y2hCYXInKVxuICAgICAgICB0b3VjaGJhci51cGRhdGUocmVzdWx0c1swXSlcbiJdfQ==
