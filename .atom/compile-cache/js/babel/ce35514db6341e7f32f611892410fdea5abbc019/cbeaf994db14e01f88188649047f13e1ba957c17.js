
"use strict";

/**
 * Get the next non-comment node in a PostCSS AST
 * at or after a given node.
 */
module.exports = function nextNonCommentNode(_x) {
  var _again = true;

  _function: while (_again) /*: Object*/ /*: ?Object*/{
    var startNode = _x;
    _again = false;

    if (!startNode || !startNode.next) return null;

    if (startNode.type === "comment") {
      _x = startNode.next();
      _again = true;
      continue _function;
    }

    return startNode;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvbmV4dE5vbkNvbW1lbnROb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7Ozs7OztBQU1aLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxrQkFBa0I7OztzREFBcUM7UUFBcEMsU0FBUzs7O0FBQ3BELFFBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sSUFBSSxDQUFBOztBQUU5QyxRQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1dBQ04sU0FBUyxDQUFDLElBQUksRUFBRTs7O0tBQzNDOztBQUVELFdBQU8sU0FBUyxDQUFBO0dBQ2pCO0NBQUEsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL25leHROb25Db21tZW50Tm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG4vKipcbiAqIEdldCB0aGUgbmV4dCBub24tY29tbWVudCBub2RlIGluIGEgUG9zdENTUyBBU1RcbiAqIGF0IG9yIGFmdGVyIGEgZ2l2ZW4gbm9kZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBuZXh0Tm9uQ29tbWVudE5vZGUoc3RhcnROb2RlLyo6IE9iamVjdCovKS8qOiA/T2JqZWN0Ki8ge1xuICBpZiAoIXN0YXJ0Tm9kZSB8fCAhc3RhcnROb2RlLm5leHQpIHJldHVybiBudWxsXG5cbiAgaWYgKHN0YXJ0Tm9kZS50eXBlID09PSBcImNvbW1lbnRcIikge1xuICAgIHJldHVybiBuZXh0Tm9uQ29tbWVudE5vZGUoc3RhcnROb2RlLm5leHQoKSlcbiAgfVxuXG4gIHJldHVybiBzdGFydE5vZGVcbn1cbiJdfQ==