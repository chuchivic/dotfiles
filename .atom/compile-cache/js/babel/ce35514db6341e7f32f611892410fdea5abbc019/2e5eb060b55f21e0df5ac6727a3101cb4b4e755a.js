Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIncludes = require('lodash/includes');

var _lodashIncludes2 = _interopRequireDefault(_lodashIncludes);

var _lodashTrimStart = require('lodash/trimStart');

var _lodashTrimStart2 = _interopRequireDefault(_lodashTrimStart);

var _tokenizer = require('./tokenizer');

var _structureProvider = require('./structure-provider');

var _utils = require('./utils');

'use babel';

var STRING = _tokenizer.TokenType.STRING;
var END_OBJECT = _tokenizer.TokenType.END_OBJECT;
var END_ARRAY = _tokenizer.TokenType.END_ARRAY;
var COMMA = _tokenizer.TokenType.COMMA;

var RootProvider = (function () {
  function RootProvider() {
    var providers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, RootProvider);

    this.selector = '.source.json';
    this.inclusionPriority = 1;
    this.providers = providers;
  }

  _createClass(RootProvider, [{
    key: 'getSuggestions',
    value: function getSuggestions(originalRequest) {
      var _this = this;

      var editor = originalRequest.editor;
      var bufferPosition = originalRequest.bufferPosition;
      var activatedManually = originalRequest.activatedManually;

      if (!this.checkRequest(originalRequest)) {
        return Promise.resolve([]);
      }

      if (editor.lineTextForBufferRow(bufferPosition.row).charAt(bufferPosition.column - 1) === ',' && !activatedManually) {
        return Promise.resolve([]); // hack, to prevent activation right after inserting a comma
      }

      var providers = this.getMatchingProviders(editor.buffer.file);
      if (providers.length === 0) {
        return Promise.resolve([]); // no provider no proposals
      }
      return (0, _tokenizer.tokenize)(editor.getText()).then(function (tokens) {
        return (0, _structureProvider.provideStructure)(tokens, bufferPosition);
      }).then(function (structure) {
        var request = _this.buildRequest(structure, originalRequest);
        return Promise.all(providers.map(function (provider) {
          return provider.getProposals(request);
        })).then(function (proposals) {
          return Array.prototype.concat.apply([], proposals);
        });
      });
    }
  }, {
    key: 'checkRequest',
    value: function checkRequest(request) {
      var editor = request.editor;
      var bufferPosition = request.bufferPosition;

      return Boolean(editor && editor.buffer && editor.buffer.file && editor.buffer.file.getBaseName && editor.lineTextForBufferRow && editor.getText && bufferPosition);
    }
  }, {
    key: 'buildRequest',
    value: function buildRequest(structure, originalRequest) {
      var contents = structure.contents;
      var positionInfo = structure.positionInfo;
      var tokens = structure.tokens;
      var editor = originalRequest.editor;
      var bufferPosition = originalRequest.bufferPosition;

      var shouldAddComma = function shouldAddComma(info) {
        if (!info || !info.nextToken || !tokens || tokens.length === 0) {
          return false;
        }
        if (info.nextToken && (0, _lodashIncludes2['default'])([END_ARRAY, END_OBJECT], info.nextToken.type)) {
          return false;
        }
        return !(info.nextToken && (0, _lodashIncludes2['default'])([END_ARRAY, END_OBJECT], info.nextToken.type)) && info.nextToken.type !== COMMA;
      };

      var prefix = function prefix(info) {
        if (!info || !info.editedToken) {
          return '';
        }
        var length = bufferPosition.column - info.editedToken.col + 1;
        return (0, _lodashTrimStart2['default'])(info.editedToken.src.substr(0, length), '"');
      };

      return {
        contents: contents,
        prefix: prefix(positionInfo),
        segments: positionInfo ? positionInfo.segments : null,
        token: positionInfo ? positionInfo.editedToken ? positionInfo.editedToken.src : null : null,
        isKeyPosition: Boolean(positionInfo && positionInfo.keyPosition),
        isValuePosition: Boolean(positionInfo && positionInfo.valuePosition),
        isBetweenQuotes: Boolean(positionInfo && positionInfo.editedToken && positionInfo.editedToken.type === STRING),
        shouldAddComma: Boolean(shouldAddComma(positionInfo)),
        isFileEmpty: tokens.length === 0,
        editor: editor
      };
    }
  }, {
    key: 'getMatchingProviders',
    value: function getMatchingProviders(file) {
      return this.providers.filter(function (p) {
        return (0, _utils.matches)(file, p.getFilePattern()) || p.getFilePattern() === '*';
      });
    }
  }, {
    key: 'onDidInsertSuggestion',
    value: function onDidInsertSuggestion() {
      // noop for now
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      // noop for now
    }
  }]);

  return RootProvider;
})();

exports['default'] = RootProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9yb290LXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OEJBRXFCLGlCQUFpQjs7OzsrQkFDaEIsa0JBQWtCOzs7O3lCQUVKLGFBQWE7O2lDQUNoQixzQkFBc0I7O3FCQUMvQixTQUFTOztBQVBqQyxXQUFXLENBQUE7O0lBU0gsTUFBTSx3QkFBTixNQUFNO0lBQUUsVUFBVSx3QkFBVixVQUFVO0lBQUUsU0FBUyx3QkFBVCxTQUFTO0lBQUUsS0FBSyx3QkFBTCxLQUFLOztJQUV2QixZQUFZO0FBRXBCLFdBRlEsWUFBWSxHQUVIO1FBQWhCLFNBQVMseURBQUcsRUFBRTs7MEJBRlAsWUFBWTs7QUFHN0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUE7QUFDOUIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQTtBQUMxQixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtHQUMzQjs7ZUFOa0IsWUFBWTs7V0FRakIsd0JBQUMsZUFBZSxFQUFFOzs7VUFDdkIsTUFBTSxHQUF1QyxlQUFlLENBQTVELE1BQU07VUFBRSxjQUFjLEdBQXVCLGVBQWUsQ0FBcEQsY0FBYztVQUFFLGlCQUFpQixHQUFJLGVBQWUsQ0FBcEMsaUJBQWlCOztBQUVoRCxVQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUN2QyxlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7T0FDM0I7O0FBRUQsVUFBSSxNQUFNLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFO0FBQ25ILGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FB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L2F1dG9jb21wbGV0ZS1qc29uL3NyYy9yb290LXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGluY2x1ZGVzIGZyb20gJ2xvZGFzaC9pbmNsdWRlcydcbmltcG9ydCB0cmltU3RhcnQgZnJvbSAnbG9kYXNoL3RyaW1TdGFydCdcblxuaW1wb3J0IHsgdG9rZW5pemUsIFRva2VuVHlwZSB9IGZyb20gJy4vdG9rZW5pemVyJ1xuaW1wb3J0IHsgcHJvdmlkZVN0cnVjdHVyZSB9IGZyb20gJy4vc3RydWN0dXJlLXByb3ZpZGVyJ1xuaW1wb3J0IHsgbWF0Y2hlcyB9IGZyb20gJy4vdXRpbHMnXG5cbmNvbnN0IHsgU1RSSU5HLCBFTkRfT0JKRUNULCBFTkRfQVJSQVksIENPTU1BIH0gPSBUb2tlblR5cGVcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vdFByb3ZpZGVyIHtcblxuICBjb25zdHJ1Y3Rvcihwcm92aWRlcnMgPSBbXSkge1xuICAgIHRoaXMuc2VsZWN0b3IgPSAnLnNvdXJjZS5qc29uJ1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSAxXG4gICAgdGhpcy5wcm92aWRlcnMgPSBwcm92aWRlcnNcbiAgfVxuXG4gIGdldFN1Z2dlc3Rpb25zKG9yaWdpbmFsUmVxdWVzdCkge1xuICAgIGNvbnN0IHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBhY3RpdmF0ZWRNYW51YWxseX0gPSBvcmlnaW5hbFJlcXVlc3RcblxuICAgIGlmICghdGhpcy5jaGVja1JlcXVlc3Qob3JpZ2luYWxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSlcbiAgICB9XG5cbiAgICBpZiAoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGJ1ZmZlclBvc2l0aW9uLnJvdykuY2hhckF0KGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIDEpID09PSAnLCcgJiYgIWFjdGl2YXRlZE1hbnVhbGx5KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKSAvLyBoYWNrLCB0byBwcmV2ZW50IGFjdGl2YXRpb24gcmlnaHQgYWZ0ZXIgaW5zZXJ0aW5nIGEgY29tbWFcbiAgICB9XG5cbiAgICBjb25zdCBwcm92aWRlcnMgPSB0aGlzLmdldE1hdGNoaW5nUHJvdmlkZXJzKGVkaXRvci5idWZmZXIuZmlsZSlcbiAgICBpZiAocHJvdmlkZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSkgLy8gbm8gcHJvdmlkZXIgbm8gcHJvcG9zYWxzXG4gICAgfVxuICAgIHJldHVybiB0b2tlbml6ZShlZGl0b3IuZ2V0VGV4dCgpKVxuICAgICAgLnRoZW4odG9rZW5zID0+IHByb3ZpZGVTdHJ1Y3R1cmUodG9rZW5zLCBidWZmZXJQb3NpdGlvbikpXG4gICAgICAudGhlbihzdHJ1Y3R1cmUgPT4ge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5idWlsZFJlcXVlc3Qoc3RydWN0dXJlLCBvcmlnaW5hbFJlcXVlc3QpXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm92aWRlcnMubWFwKHByb3ZpZGVyID0+IHByb3ZpZGVyLmdldFByb3Bvc2FscyhyZXF1ZXN0KSkpXG4gICAgICAgICAgLnRoZW4ocHJvcG9zYWxzID0+IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHByb3Bvc2FscykpXG4gICAgICB9KVxuICB9XG5cbiAgY2hlY2tSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICBjb25zdCB7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbn0gPSByZXF1ZXN0XG4gICAgcmV0dXJuIEJvb2xlYW4oZWRpdG9yXG4gICAgICAmJiBlZGl0b3IuYnVmZmVyXG4gICAgICAmJiBlZGl0b3IuYnVmZmVyLmZpbGVcbiAgICAgICYmIGVkaXRvci5idWZmZXIuZmlsZS5nZXRCYXNlTmFtZVxuICAgICAgJiYgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93XG4gICAgICAmJiBlZGl0b3IuZ2V0VGV4dFxuICAgICAgJiYgYnVmZmVyUG9zaXRpb24pXG4gIH1cblxuXG4gIGJ1aWxkUmVxdWVzdChzdHJ1Y3R1cmUsIG9yaWdpbmFsUmVxdWVzdCkge1xuICAgIGNvbnN0IHtjb250ZW50cywgcG9zaXRpb25JbmZvLCB0b2tlbnN9ID0gc3RydWN0dXJlXG4gICAgY29uc3Qge2VkaXRvciwgYnVmZmVyUG9zaXRpb259ID0gb3JpZ2luYWxSZXF1ZXN0XG5cbiAgICBjb25zdCBzaG91bGRBZGRDb21tYSA9IGluZm8gPT4ge1xuICAgICAgaWYgKCFpbmZvIHx8ICFpbmZvLm5leHRUb2tlbiB8fCAhdG9rZW5zIHx8IHRva2Vucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoaW5mby5uZXh0VG9rZW4gJiYgaW5jbHVkZXMoW0VORF9BUlJBWSwgRU5EX09CSkVDVF0sIGluZm8ubmV4dFRva2VuLnR5cGUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcmV0dXJuICEoaW5mby5uZXh0VG9rZW4gJiYgaW5jbHVkZXMoW0VORF9BUlJBWSwgRU5EX09CSkVDVF0sIGluZm8ubmV4dFRva2VuLnR5cGUpKSAmJiBpbmZvLm5leHRUb2tlbi50eXBlICE9PSBDT01NQVxuICAgIH1cblxuICAgIGNvbnN0IHByZWZpeCA9IGluZm8gPT4ge1xuICAgICAgaWYgKCFpbmZvIHx8ICFpbmZvLmVkaXRlZFRva2VuKSB7XG4gICAgICAgIHJldHVybiAnJ1xuICAgICAgfVxuICAgICAgY29uc3QgbGVuZ3RoID0gYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gaW5mby5lZGl0ZWRUb2tlbi5jb2wgKyAxXG4gICAgICByZXR1cm4gdHJpbVN0YXJ0KGluZm8uZWRpdGVkVG9rZW4uc3JjLnN1YnN0cigwLCBsZW5ndGgpLCAnXCInKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb250ZW50cyxcbiAgICAgIHByZWZpeDogcHJlZml4KHBvc2l0aW9uSW5mbyksXG4gICAgICBzZWdtZW50czogcG9zaXRpb25JbmZvID8gcG9zaXRpb25JbmZvLnNlZ21lbnRzIDogbnVsbCxcbiAgICAgIHRva2VuOiBwb3NpdGlvbkluZm8gPyAocG9zaXRpb25JbmZvLmVkaXRlZFRva2VuKSA/IHBvc2l0aW9uSW5mby5lZGl0ZWRUb2tlbi5zcmMgOiBudWxsIDogbnVsbCxcbiAgICAgIGlzS2V5UG9zaXRpb246IEJvb2xlYW4ocG9zaXRpb25JbmZvICYmIHBvc2l0aW9uSW5mby5rZXlQb3NpdGlvbiksXG4gICAgICBpc1ZhbHVlUG9zaXRpb246IEJvb2xlYW4ocG9zaXRpb25JbmZvICYmIHBvc2l0aW9uSW5mby52YWx1ZVBvc2l0aW9uKSxcbiAgICAgIGlzQmV0d2VlblF1b3RlczogQm9vbGVhbihwb3NpdGlvbkluZm8gJiYgcG9zaXRpb25JbmZvLmVkaXRlZFRva2VuICYmIHBvc2l0aW9uSW5mby5lZGl0ZWRUb2tlbi50eXBlID09PSBTVFJJTkcpLFxuICAgICAgc2hvdWxkQWRkQ29tbWE6IEJvb2xlYW4oc2hvdWxkQWRkQ29tbWEocG9zaXRpb25JbmZvKSksXG4gICAgICBpc0ZpbGVFbXB0eTogdG9rZW5zLmxlbmd0aCA9PT0gMCxcbiAgICAgIGVkaXRvclxuICAgIH1cbiAgfVxuXG4gIGdldE1hdGNoaW5nUHJvdmlkZXJzKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5wcm92aWRlcnMuZmlsdGVyKHAgPT4gbWF0Y2hlcyhmaWxlLCBwLmdldEZpbGVQYXR0ZXJuKCkpIHx8IHAuZ2V0RmlsZVBhdHRlcm4oKSA9PT0gJyonKVxuICB9XG5cbiAgb25EaWRJbnNlcnRTdWdnZXN0aW9uKCkge1xuICAgIC8vIG5vb3AgZm9yIG5vd1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBub29wIGZvciBub3dcbiAgfVxufVxuIl19