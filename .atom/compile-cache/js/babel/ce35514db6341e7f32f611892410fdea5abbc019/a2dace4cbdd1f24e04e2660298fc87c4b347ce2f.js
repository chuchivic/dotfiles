
"use strict";

/**
 * Get the next non-comment node in a PostCSS AST
 * at or after a given node.
 */
module.exports = function nextNonCommentNode(_x) {
  var _again = true;

  _function: while (_again) /*: Object*/
  /*: ?Object*/{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvbmV4dE5vbkNvbW1lbnROb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7Ozs7OztBQU1iLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxrQkFBa0I7Ozs7ZUFFNUI7UUFEZCxTQUFTOzs7QUFFVCxRQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLElBQUksQ0FBQzs7QUFFL0MsUUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtXQUNOLFNBQVMsQ0FBQyxJQUFJLEVBQUU7OztLQUMzQzs7QUFFRCxXQUFPLFNBQVMsQ0FBQztHQUNsQjtDQUFBLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9uZXh0Tm9uQ29tbWVudE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogR2V0IHRoZSBuZXh0IG5vbi1jb21tZW50IG5vZGUgaW4gYSBQb3N0Q1NTIEFTVFxuICogYXQgb3IgYWZ0ZXIgYSBnaXZlbiBub2RlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5leHROb25Db21tZW50Tm9kZShcbiAgc3RhcnROb2RlIC8qOiBPYmplY3QqL1xuKSAvKjogP09iamVjdCovIHtcbiAgaWYgKCFzdGFydE5vZGUgfHwgIXN0YXJ0Tm9kZS5uZXh0KSByZXR1cm4gbnVsbDtcblxuICBpZiAoc3RhcnROb2RlLnR5cGUgPT09IFwiY29tbWVudFwiKSB7XG4gICAgcmV0dXJuIG5leHROb25Db21tZW50Tm9kZShzdGFydE5vZGUubmV4dCgpKTtcbiAgfVxuXG4gIHJldHVybiBzdGFydE5vZGU7XG59O1xuIl19