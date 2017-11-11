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
            return _this.provider.goToDefinition(editor, bufferPosition);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvaHlwZXJjbGljay1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLENBQVY7SUFDQSxZQUFBLEVBQWMscUJBRGQ7SUFFQSxrQkFBQSxFQUFvQiw0UUFGcEI7SUFHQSxXQUFBLEVBQWEsS0FIYjtJQUtBLFdBQUEsRUFBYSxTQUFBO01BQ1gsSUFBQyxDQUFBLFFBQUQsR0FBWSxPQUFBLENBQVEsWUFBUjtNQUNaLElBQUMsQ0FBQSxHQUFELEdBQU8sT0FBQSxDQUFRLE9BQVI7TUFDTixJQUFDLENBQUEsMkJBQTRCLE9BQUEsQ0FBUSxpQkFBUixFQUE1QjtNQUNELElBQUMsQ0FBQSxXQUFZLE9BQUEsQ0FBUSxjQUFSLEVBQVo7TUFDRixJQUFDLENBQUEsV0FBRCxHQUFlO2FBQ2YsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFMLENBQVcsd0NBQVg7SUFOVyxDQUxiO0lBYUEsVUFBQSxFQUFZLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDVixhQUFPLE1BQU0sQ0FBQyxnQ0FBUCxDQUF3QyxLQUF4QyxDQUE4QyxDQUFDO0lBRDVDLENBYlo7SUFnQkEsb0JBQUEsRUFBc0IsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEtBQWY7QUFDcEIsVUFBQTtNQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsV0FBUjtRQUNFLElBQUMsQ0FBQSxXQUFELENBQUEsRUFERjs7TUFFQSxJQUFHLElBQUEsS0FBUyxHQUFULElBQUEsSUFBQSxLQUFjLEdBQWpCO0FBQ0UsZUFERjs7TUFFQSxJQUFHLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUFTLENBQUMsT0FBOUIsQ0FBc0MsZUFBdEMsQ0FBQSxHQUF5RCxDQUFDLENBQTdEO1FBQ0UsY0FBQSxHQUFpQixLQUFLLENBQUM7UUFDdkIsZUFBQSxHQUFrQixNQUFNLENBQUMsZ0NBQVAsQ0FDaEIsY0FEZ0I7UUFFbEIsVUFBQSxHQUFhLGVBQWUsQ0FBQyxhQUFoQixDQUFBO1FBQ2Isa0JBQUEsR0FBcUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLElBQUMsQ0FBQSxrQkFBbEI7UUFDckIsSUFBRyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsa0JBQTFCLEVBQThDLFVBQTlDLENBQUg7QUFDRSxpQkFERjs7UUFHQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixpQ0FBaEIsQ0FBSDtVQUNFLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxLQUFqQixFQUF3QixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEtBQTFCLENBQXhCO1VBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLEdBQWpCLEVBQXNCLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixFQUFvQixLQUFLLENBQUMsR0FBMUIsQ0FBdEIsRUFGRjs7UUFHQSxRQUFBLEdBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDVCxLQUFDLENBQUEsUUFBUSxDQUFDLGNBQVYsQ0FBeUIsTUFBekIsRUFBaUMsY0FBakM7VUFEUztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7QUFFWCxlQUFPO1VBQUMsT0FBQSxLQUFEO1VBQVEsVUFBQSxRQUFSO1VBZFQ7O0lBTG9CLENBaEJ0Qjs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgcHJpb3JpdHk6IDFcbiAgcHJvdmlkZXJOYW1lOiAnYXV0b2NvbXBsZXRlLXB5dGhvbidcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24gLmNvbW1lbnQsIC5zb3VyY2UucHl0aG9uIC5zdHJpbmcsIC5zb3VyY2UucHl0aG9uIC5udW1lcmljLCAuc291cmNlLnB5dGhvbiAuaW50ZWdlciwgLnNvdXJjZS5weXRob24gLmRlY2ltYWwsIC5zb3VyY2UucHl0aG9uIC5wdW5jdHVhdGlvbiwgLnNvdXJjZS5weXRob24gLmtleXdvcmQsIC5zb3VyY2UucHl0aG9uIC5zdG9yYWdlLCAuc291cmNlLnB5dGhvbiAudmFyaWFibGUucGFyYW1ldGVyLCAuc291cmNlLnB5dGhvbiAuZW50aXR5Lm5hbWUnXG4gIGNvbnN0cnVjdGVkOiBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBwcm92aWRlciA9IHJlcXVpcmUgJy4vcHJvdmlkZXInXG4gICAgQGxvZyA9IHJlcXVpcmUgJy4vbG9nJ1xuICAgIHtAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWlufSA9IHJlcXVpcmUgJy4vc2NvcGUtaGVscGVycydcbiAgICB7QFNlbGVjdG9yfSA9IHJlcXVpcmUgJ3NlbGVjdG9yLWtpdCdcbiAgICBAY29uc3RydWN0ZWQgPSB0cnVlXG4gICAgQGxvZy5kZWJ1ZyAnTG9hZGluZyBweXRob24gaHlwZXItY2xpY2sgcHJvdmlkZXIuLi4nXG5cbiAgX2dldFNjb3BlczogKGVkaXRvciwgcmFuZ2UpIC0+XG4gICAgcmV0dXJuIGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihyYW5nZSkuc2NvcGVzXG5cbiAgZ2V0U3VnZ2VzdGlvbkZvcldvcmQ6IChlZGl0b3IsIHRleHQsIHJhbmdlKSAtPlxuICAgIGlmIG5vdCBAY29uc3RydWN0ZWRcbiAgICAgIEBjb25zdHJ1Y3RvcigpXG4gICAgaWYgdGV4dCBpbiBbJy4nLCAnOiddXG4gICAgICByZXR1cm5cbiAgICBpZiBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZS5pbmRleE9mKCdzb3VyY2UucHl0aG9uJykgPiAtMVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSByYW5nZS5zdGFydFxuICAgICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFxuICAgICAgICBidWZmZXJQb3NpdGlvbilcbiAgICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG4gICAgICBkaXNhYmxlRm9yU2VsZWN0b3IgPSBAU2VsZWN0b3IuY3JlYXRlKEBkaXNhYmxlRm9yU2VsZWN0b3IpXG4gICAgICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5vdXRwdXREZWJ1ZycpXG4gICAgICAgIEBsb2cuZGVidWcgcmFuZ2Uuc3RhcnQsIEBfZ2V0U2NvcGVzKGVkaXRvciwgcmFuZ2Uuc3RhcnQpXG4gICAgICAgIEBsb2cuZGVidWcgcmFuZ2UuZW5kLCBAX2dldFNjb3BlcyhlZGl0b3IsIHJhbmdlLmVuZClcbiAgICAgIGNhbGxiYWNrID0gPT5cbiAgICAgICAgQHByb3ZpZGVyLmdvVG9EZWZpbml0aW9uKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICByZXR1cm4ge3JhbmdlLCBjYWxsYmFja31cbiJdfQ==
