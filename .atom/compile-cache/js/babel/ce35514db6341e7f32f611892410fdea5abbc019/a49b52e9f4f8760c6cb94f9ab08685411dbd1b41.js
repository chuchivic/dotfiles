
"use strict";

var isWhitespace = require("./isWhitespace");

/**
 * Returns a Boolean indicating whether the the input string is only whitespace.
 */
module.exports = function (input /*: string*/) /*: boolean*/{
  var isOnlyWhitespace = true;
  for (var i = 0, l = input.length; i < l; i++) {
    if (!isWhitespace(input[i])) {
      isOnlyWhitespace = false;
      break;
    }
  }
  return isOnlyWhitespace;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNPbmx5V2hpdGVzcGFjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBOzs7OztBQUs5QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsS0FBSyw0QkFBMkI7QUFDekQsTUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7QUFDM0IsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxRQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzNCLHNCQUFnQixHQUFHLEtBQUssQ0FBQTtBQUN4QixZQUFLO0tBQ047R0FDRjtBQUNELFNBQU8sZ0JBQWdCLENBQUE7Q0FDeEIsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzT25seVdoaXRlc3BhY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgaXNXaGl0ZXNwYWNlID0gcmVxdWlyZShcIi4vaXNXaGl0ZXNwYWNlXCIpXG5cbi8qKlxuICogUmV0dXJucyBhIEJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB0aGUgaW5wdXQgc3RyaW5nIGlzIG9ubHkgd2hpdGVzcGFjZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5wdXQvKjogc3RyaW5nKi8pLyo6IGJvb2xlYW4qLyB7XG4gIGxldCBpc09ubHlXaGl0ZXNwYWNlID0gdHJ1ZVxuICBmb3IgKGxldCBpID0gMCwgbCA9IGlucHV0Lmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGlmICghaXNXaGl0ZXNwYWNlKGlucHV0W2ldKSkge1xuICAgICAgaXNPbmx5V2hpdGVzcGFjZSA9IGZhbHNlXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXNPbmx5V2hpdGVzcGFjZVxufVxuIl19