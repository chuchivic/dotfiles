(function() {
  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: '.source.python .comment, .source.python .string, .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name',
    constructed: false,
    constructor: function() {
      this.provider = require('./provider');
      this.log = require('./log');
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.constructed = true;
      return this.log.debug('Loading python hyper-click provider...');
    },
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (!this.constructed) {
        this.constructor();
      }
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = this.Selector.create(this.disableForSelector);
        if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          this.log.debug(range.start, this._getScopes(editor, range.start));
          this.log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = (function(_this) {
          return function() {
            return _this.provider.load().goToDefinition(editor, bufferPosition);
          };
        })(this);
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvaHlwZXJjbGljay1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLENBQVY7SUFDQSxZQUFBLEVBQWMscUJBRGQ7SUFFQSxrQkFBQSxFQUFvQiw0UUFGcEI7SUFHQSxXQUFBLEVBQWEsS0FIYjtJQUtBLFdBQUEsRUFBYSxTQUFBO01BQ1gsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFBLENBQVEsWUFBUjtNQUNaLElBQUMsQ0FBQSxHQUFELEdBQU8sT0FBQSxDQUFRLE9BQVI7TUFDTixJQUFDLENBQUEsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1QjtNQUNELElBQUMsQ0FBQSxXQUFZLE9BQUEsQ0FBUSxjQUFSLEVBQVo7TUFDRixJQUFDLENBQUEsV0FBRCxHQUFlO2FBQ2YsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFMLENBQVcsd0NBQVg7SUFOVyxDQUxiO0lBYUEsVUFBQSxFQUFZLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDVixhQUFPLE1BQU0sQ0FBQyxnQ0FBUCxDQUF3QyxLQUF4QyxDQUE4QyxDQUFDO0lBRDVDLENBYlo7SUFnQkEsb0JBQUEsRUFBc0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEtBQWY7QUFDcEIsVUFBQTtNQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsV0FBUjtRQUNFLElBQUMsQ0FBQSxXQUFELENBQUEsRUFERjs7TUFFQSxJQUFHLElBQUEsS0FBUyxHQUFULElBQUEsSUFBQSxLQUFjLEdBQWpCO0FBQ0UsZUFERjs7TUFFQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUFTLENBQUMsT0FBOUIsQ0FBc0MsZUFBdEMsQ0FBQSxHQUF5RCxDQUFDLENBQTdEO1FBQ0UsY0FBQSxHQUFpQixLQUFLLENBQUM7UUFDdkIsZUFBQSxHQUFrQixNQUFNLENBQUMsZ0NBQVAsQ0FDaEIsY0FEZ0I7UUFFbEIsVUFBQSxHQUFhLGVBQWUsQ0FBQyxhQUFoQixDQUFBO1FBQ2Isa0JBQUEsR0FBcUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxrQkFBbEI7UUFDckIsSUFBRyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsa0JBQTFCLEVBQThDLFVBQTlDLENBQUg7QUFDRSxpQkFERjs7UUFHQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBSDtVQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxLQUFqQixFQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEtBQTFCLENBQXhCO1VBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLEdBQWpCLEVBQXNCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsR0FBMUIsQ0FBdEIsRUFGRjs7UUFHQSxRQUFBLEdBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDVCxLQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQSxDQUFnQixDQUFDLGNBQWpCLENBQWdDLE1BQWhDLEVBQXdDLGNBQXhDO1VBRFM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0FBRVgsZUFBTztVQUFDLE9BQUEsS0FBRDtVQUFRLFVBQUEsUUFBUjtVQWRUOztJQUxvQixDQWhCdEI7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIHByaW9yaXR5OiAxXG4gIHByb3ZpZGVyTmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogJy5zb3VyY2UucHl0aG9uIC5jb21tZW50LCAuc291cmNlLnB5dGhvbiAuc3RyaW5nLCAuc291cmNlLnB5dGhvbiAubnVtZXJpYywgLnNvdXJjZS5weXRob24gLmludGVnZXIsIC5zb3VyY2UucHl0aG9uIC5kZWNpbWFsLCAuc291cmNlLnB5dGhvbiAucHVuY3R1YXRpb24sIC5zb3VyY2UucHl0aG9uIC5rZXl3b3JkLCAuc291cmNlLnB5dGhvbiAuc3RvcmFnZSwgLnNvdXJjZS5weXRob24gLnZhcmlhYmxlLnBhcmFtZXRlciwgLnNvdXJjZS5weXRob24gLmVudGl0eS5uYW1lJ1xuICBjb25zdHJ1Y3RlZDogZmFsc2VcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcHJvdmlkZXIgPSByZXF1aXJlICcuL3Byb3ZpZGVyJ1xuICAgIEBsb2cgPSByZXF1aXJlICcuL2xvZydcbiAgICB7QHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbn0gPSByZXF1aXJlICcuL3Njb3BlLWhlbHBlcnMnXG4gICAge0BTZWxlY3Rvcn0gPSByZXF1aXJlICdzZWxlY3Rvci1raXQnXG4gICAgQGNvbnN0cnVjdGVkID0gdHJ1ZVxuICAgIEBsb2cuZGVidWcgJ0xvYWRpbmcgcHl0aG9uIGh5cGVyLWNsaWNrIHByb3ZpZGVyLi4uJ1xuXG4gIF9nZXRTY29wZXM6IChlZGl0b3IsIHJhbmdlKSAtPlxuICAgIHJldHVybiBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocmFuZ2UpLnNjb3Blc1xuXG4gIGdldFN1Z2dlc3Rpb25Gb3JXb3JkOiAoZWRpdG9yLCB0ZXh0LCByYW5nZSkgLT5cbiAgICBpZiBub3QgQGNvbnN0cnVjdGVkXG4gICAgICBAY29uc3RydWN0b3IoKVxuICAgIGlmIHRleHQgaW4gWycuJywgJzonXVxuICAgICAgcmV0dXJuXG4gICAgaWYgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuaW5kZXhPZignc291cmNlLnB5dGhvbicpID4gLTFcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihcbiAgICAgICAgYnVmZmVyUG9zaXRpb24pXG4gICAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgICAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShAZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgICAgaWYgQHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbihkaXNhYmxlRm9yU2VsZWN0b3IsIHNjb3BlQ2hhaW4pXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ub3V0cHV0RGVidWcnKVxuICAgICAgICBAbG9nLmRlYnVnIHJhbmdlLnN0YXJ0LCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLnN0YXJ0KVxuICAgICAgICBAbG9nLmRlYnVnIHJhbmdlLmVuZCwgQF9nZXRTY29wZXMoZWRpdG9yLCByYW5nZS5lbmQpXG4gICAgICBjYWxsYmFjayA9ID0+XG4gICAgICAgIEBwcm92aWRlci5sb2FkKCkuZ29Ub0RlZmluaXRpb24oZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIHJldHVybiB7cmFuZ2UsIGNhbGxiYWNrfVxuIl19
