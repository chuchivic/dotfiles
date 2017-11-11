Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.tokenize = tokenize;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tokenizer2 = require('tokenizer2');

var _tokenizer22 = _interopRequireDefault(_tokenizer2);

/**
 * Copy pasted most of this from json-tokenizer package
 * https://github.com/Floby/node-json-tokenizer/blob/master/JsonTokenizer.js
 * 
 * @return {Stream} a token stream describing the JSON grammar.
 */
'use babel';

function createTokenStream() {
  var stream = (0, _tokenizer22['default'])();
  stream.addRule(/^,$/, TokenType.COMMA);
  stream.addRule(/^:$/, TokenType.END_LABEL);
  stream.addRule(/^\{$/, TokenType.BEGIN_OBJECT);
  stream.addRule(/^\}$/, TokenType.END_OBJECT);
  stream.addRule(/^\[$/, TokenType.BEGIN_ARRAY);
  stream.addRule(/^\]$/, TokenType.END_ARRAY);

  stream.addRule(/^"(\\["\\/bfnrtu"]|[^"\\"])*"$/, TokenType.STRING);
  stream.addRule(/^"([^"]|\\")*$/, 'maybe-string');
  stream.addRule(/^null$/, TokenType.NULL);
  stream.addRule(/^(true|false)$/, TokenType.BOOLEAN);

  stream.addRule(/^-?\d+(\.\d+)?([eE]-?\d+)?$/, TokenType.NUMBER);
  stream.addRule(/^-?\d+\.$/, 'maybe-decimal-number');
  stream.addRule(/^-$/, 'maybe-negative-number');
  stream.addRule(/^-?\d+(\.\d+)?([eE])?$/, 'maybe-exponential-number');
  stream.addRule(/^-?\d+(\.\d+)?([eE]-)?$/, 'maybe-exponential-number-negative');

  stream.addRule(/^\w+$/, TokenType.SYMBOL);

  stream.addRule(/^[\s]+$/, TokenType.WHITESPACE);

  return stream;
}

var TokenType = {
  COMMA: 'comma',
  END_LABEL: 'end-label',
  BEGIN_OBJECT: 'begin-object',
  END_OBJECT: 'end-object',
  BEGIN_ARRAY: 'begin-array',
  END_ARRAY: 'end-array',
  STRING: 'string',
  NULL: 'null',
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  SYMBOL: 'symbol',
  WHITESPACE: 'whitespace'
};

exports.TokenType = TokenType;
/**
 * Tokenizes the given buffer
 * @param {Buffer} buffer A Buffer to tokenize
 * @return {Promise} a Promise, which when resolved yields the JSON tokens in the buffer as an array
 */

function tokenize(buffer) {
  return new Promise(function (resolve, reject) {
    var tokens = [];
    var tokenStream = createTokenStream();
    tokenStream.on('data', function (token) {
      // Ignore whitespace.
      if (token.type !== TokenType.WHITESPACE) {
        tokens.push(token);
      }
    });
    tokenStream.on('error', function (error) {
      return reject(error);
    });
    tokenStream.on('end', function () {
      return resolve(tokens);
    });
    tokenStream.end(buffer);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy90b2tlbml6ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzswQkFFdUIsWUFBWTs7Ozs7Ozs7OztBQUZuQyxXQUFXLENBQUE7O0FBVVgsU0FBUyxpQkFBaUIsR0FBRztBQUMzQixNQUFNLE1BQU0sR0FBRyw4QkFBWSxDQUFBO0FBQzNCLFFBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN0QyxRQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDMUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQzlDLFFBQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM1QyxRQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDN0MsUUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFBOztBQUUzQyxRQUFNLENBQUMsT0FBTyxDQUFDLGdDQUFnQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsRSxRQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBQyxDQUFBO0FBQ2hELFFBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QyxRQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQTs7QUFFbkQsUUFBTSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDL0QsUUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtBQUNuRCxRQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFBO0FBQzlDLFFBQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRSxRQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLG1DQUFtQyxDQUFDLENBQUE7O0FBRTlFLFFBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFekMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFBOztBQUUvQyxTQUFPLE1BQU0sQ0FBQTtDQUNkOztBQUVNLElBQU0sU0FBUyxHQUFHO0FBQ3ZCLE9BQUssRUFBRSxPQUFPO0FBQ2QsV0FBUyxFQUFFLFdBQVc7QUFDdEIsY0FBWSxFQUFFLGNBQWM7QUFDNUIsWUFBVSxFQUFFLFlBQVk7QUFDeEIsYUFBVyxFQUFFLGFBQWE7QUFDMUIsV0FBUyxFQUFFLFdBQVc7QUFDdEIsUUFBTSxFQUFFLFFBQVE7QUFDaEIsTUFBSSxFQUFFLE1BQU07QUFDWixTQUFPLEVBQUUsU0FBUztBQUNsQixRQUFNLEVBQUUsUUFBUTtBQUNoQixRQUFNLEVBQUUsUUFBUTtBQUNoQixZQUFVLEVBQUUsWUFBWTtDQUN6QixDQUFBOzs7Ozs7Ozs7QUFPTSxTQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDL0IsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsUUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2pCLFFBQU0sV0FBVyxHQUFHLGlCQUFpQixFQUFFLENBQUE7QUFDdkMsZUFBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxLQUFLLEVBQUk7O0FBRTlCLFVBQUksS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsVUFBVSxFQUFFO0FBQ3ZDLGNBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDbkI7S0FDRixDQUFDLENBQUE7QUFDRixlQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEtBQUs7YUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO0tBQUEsQ0FBQyxDQUFBO0FBQy9DLGVBQVcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO2FBQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUFBLENBQUMsQ0FBQTtBQUM1QyxlQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBQ3hCLENBQUMsQ0FBQTtDQUNIIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy90b2tlbml6ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgdG9rZW5pemVyMiBmcm9tICd0b2tlbml6ZXIyJ1xuXG4vKipcbiAqIENvcHkgcGFzdGVkIG1vc3Qgb2YgdGhpcyBmcm9tIGpzb24tdG9rZW5pemVyIHBhY2thZ2VcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9GbG9ieS9ub2RlLWpzb24tdG9rZW5pemVyL2Jsb2IvbWFzdGVyL0pzb25Ub2tlbml6ZXIuanNcbiAqIFxuICogQHJldHVybiB7U3RyZWFtfSBhIHRva2VuIHN0cmVhbSBkZXNjcmliaW5nIHRoZSBKU09OIGdyYW1tYXIuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVRva2VuU3RyZWFtKCkge1xuICBjb25zdCBzdHJlYW0gPSB0b2tlbml6ZXIyKClcbiAgc3RyZWFtLmFkZFJ1bGUoL14sJC8sIFRva2VuVHlwZS5DT01NQSlcbiAgc3RyZWFtLmFkZFJ1bGUoL146JC8sIFRva2VuVHlwZS5FTkRfTEFCRUwpXG4gIHN0cmVhbS5hZGRSdWxlKC9eXFx7JC8sIFRva2VuVHlwZS5CRUdJTl9PQkpFQ1QpXG4gIHN0cmVhbS5hZGRSdWxlKC9eXFx9JC8sIFRva2VuVHlwZS5FTkRfT0JKRUNUKVxuICBzdHJlYW0uYWRkUnVsZSgvXlxcWyQvLCBUb2tlblR5cGUuQkVHSU5fQVJSQVkpXG4gIHN0cmVhbS5hZGRSdWxlKC9eXFxdJC8sIFRva2VuVHlwZS5FTkRfQVJSQVkpXG5cbiAgc3RyZWFtLmFkZFJ1bGUoL15cIihcXFxcW1wiXFxcXC9iZm5ydHVcIl18W15cIlxcXFxcIl0pKlwiJC8sIFRva2VuVHlwZS5TVFJJTkcpXG4gIHN0cmVhbS5hZGRSdWxlKC9eXCIoW15cIl18XFxcXFwiKSokLywgJ21heWJlLXN0cmluZycpXG4gIHN0cmVhbS5hZGRSdWxlKC9ebnVsbCQvLCBUb2tlblR5cGUuTlVMTClcbiAgc3RyZWFtLmFkZFJ1bGUoL14odHJ1ZXxmYWxzZSkkLywgVG9rZW5UeXBlLkJPT0xFQU4pXG5cbiAgc3RyZWFtLmFkZFJ1bGUoL14tP1xcZCsoXFwuXFxkKyk/KFtlRV0tP1xcZCspPyQvLCBUb2tlblR5cGUuTlVNQkVSKVxuICBzdHJlYW0uYWRkUnVsZSgvXi0/XFxkK1xcLiQvLCAnbWF5YmUtZGVjaW1hbC1udW1iZXInKVxuICBzdHJlYW0uYWRkUnVsZSgvXi0kLywgJ21heWJlLW5lZ2F0aXZlLW51bWJlcicpXG4gIHN0cmVhbS5hZGRSdWxlKC9eLT9cXGQrKFxcLlxcZCspPyhbZUVdKT8kLywgJ21heWJlLWV4cG9uZW50aWFsLW51bWJlcicpXG4gIHN0cmVhbS5hZGRSdWxlKC9eLT9cXGQrKFxcLlxcZCspPyhbZUVdLSk/JC8sICdtYXliZS1leHBvbmVudGlhbC1udW1iZXItbmVnYXRpdmUnKVxuXG4gIHN0cmVhbS5hZGRSdWxlKC9eXFx3KyQvLCBUb2tlblR5cGUuU1lNQk9MKVxuXG4gIHN0cmVhbS5hZGRSdWxlKC9eW1xcc10rJC8sIFRva2VuVHlwZS5XSElURVNQQUNFKVxuXG4gIHJldHVybiBzdHJlYW1cbn1cblxuZXhwb3J0IGNvbnN0IFRva2VuVHlwZSA9IHtcbiAgQ09NTUE6ICdjb21tYScsXG4gIEVORF9MQUJFTDogJ2VuZC1sYWJlbCcsXG4gIEJFR0lOX09CSkVDVDogJ2JlZ2luLW9iamVjdCcsXG4gIEVORF9PQkpFQ1Q6ICdlbmQtb2JqZWN0JyxcbiAgQkVHSU5fQVJSQVk6ICdiZWdpbi1hcnJheScsXG4gIEVORF9BUlJBWTogJ2VuZC1hcnJheScsXG4gIFNUUklORzogJ3N0cmluZycsXG4gIE5VTEw6ICdudWxsJyxcbiAgQk9PTEVBTjogJ2Jvb2xlYW4nLFxuICBOVU1CRVI6ICdudW1iZXInLFxuICBTWU1CT0w6ICdzeW1ib2wnLFxuICBXSElURVNQQUNFOiAnd2hpdGVzcGFjZSdcbn1cblxuLyoqXG4gKiBUb2tlbml6ZXMgdGhlIGdpdmVuIGJ1ZmZlclxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBBIEJ1ZmZlciB0byB0b2tlbml6ZVxuICogQHJldHVybiB7UHJvbWlzZX0gYSBQcm9taXNlLCB3aGljaCB3aGVuIHJlc29sdmVkIHlpZWxkcyB0aGUgSlNPTiB0b2tlbnMgaW4gdGhlIGJ1ZmZlciBhcyBhbiBhcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUoYnVmZmVyKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgdG9rZW5zID0gW11cbiAgICBjb25zdCB0b2tlblN0cmVhbSA9IGNyZWF0ZVRva2VuU3RyZWFtKClcbiAgICB0b2tlblN0cmVhbS5vbignZGF0YScsIHRva2VuID0+IHtcbiAgICAgIC8vIElnbm9yZSB3aGl0ZXNwYWNlLlxuICAgICAgaWYgKHRva2VuLnR5cGUgIT09IFRva2VuVHlwZS5XSElURVNQQUNFKSB7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKVxuICAgICAgfVxuICAgIH0pXG4gICAgdG9rZW5TdHJlYW0ub24oJ2Vycm9yJywgZXJyb3IgPT4gcmVqZWN0KGVycm9yKSlcbiAgICB0b2tlblN0cmVhbS5vbignZW5kJywgKCkgPT4gcmVzb2x2ZSh0b2tlbnMpKVxuICAgIHRva2VuU3RyZWFtLmVuZChidWZmZXIpXG4gIH0pXG59XG4iXX0=