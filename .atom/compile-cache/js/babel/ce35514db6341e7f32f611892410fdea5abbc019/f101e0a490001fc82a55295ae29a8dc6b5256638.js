
"use strict";

var balancedMatch = require("balanced-match");
var styleSearch = require("style-search");

/**
 * Search a CSS string for functions by name.
 * For every match, invoke the callback, passing the function's
 * "argument(s) string" (whatever is inside the parentheses)
 * as an argument.
 *
 * Callback will be called once for every matching function found,
 * with the function's "argument(s) string" and its starting index
 * as the arguments.
 */
module.exports = function (source, /*: string*/
functionName, /*: string*/
callback /*: Function*/
) {
  styleSearch({
    source: source,
    target: functionName,
    functionNames: "check"
  }, function (match) {
    if (source[match.endIndex] !== "(") {
      return;
    }
    var parensMatch = balancedMatch("(", ")", source.substr(match.startIndex));
    callback(parensMatch.body, match.endIndex + 1);
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZnVuY3Rpb25Bcmd1bWVudHNTZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7QUFFYixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQVk1QyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQ2YsTUFBTTtBQUNOLFlBQVk7QUFDWixRQUFRO0VBQ1I7QUFDQSxhQUFXLENBQ1Q7QUFDRSxVQUFNLEVBQU4sTUFBTTtBQUNOLFVBQU0sRUFBRSxZQUFZO0FBQ3BCLGlCQUFhLEVBQUUsT0FBTztHQUN2QixFQUNELFVBQUEsS0FBSyxFQUFJO0FBQ1AsUUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNsQyxhQUFPO0tBQ1I7QUFDRCxRQUFNLFdBQVcsR0FBRyxhQUFhLENBQy9CLEdBQUcsRUFDSCxHQUFHLEVBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQ2hDLENBQUM7QUFDRixZQUFRLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ2hELENBQ0YsQ0FBQztDQUNILENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9mdW5jdGlvbkFyZ3VtZW50c1NlYXJjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgYmFsYW5jZWRNYXRjaCA9IHJlcXVpcmUoXCJiYWxhbmNlZC1tYXRjaFwiKTtcbmNvbnN0IHN0eWxlU2VhcmNoID0gcmVxdWlyZShcInN0eWxlLXNlYXJjaFwiKTtcblxuLyoqXG4gKiBTZWFyY2ggYSBDU1Mgc3RyaW5nIGZvciBmdW5jdGlvbnMgYnkgbmFtZS5cbiAqIEZvciBldmVyeSBtYXRjaCwgaW52b2tlIHRoZSBjYWxsYmFjaywgcGFzc2luZyB0aGUgZnVuY3Rpb24nc1xuICogXCJhcmd1bWVudChzKSBzdHJpbmdcIiAod2hhdGV2ZXIgaXMgaW5zaWRlIHRoZSBwYXJlbnRoZXNlcylcbiAqIGFzIGFuIGFyZ3VtZW50LlxuICpcbiAqIENhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9uY2UgZm9yIGV2ZXJ5IG1hdGNoaW5nIGZ1bmN0aW9uIGZvdW5kLFxuICogd2l0aCB0aGUgZnVuY3Rpb24ncyBcImFyZ3VtZW50KHMpIHN0cmluZ1wiIGFuZCBpdHMgc3RhcnRpbmcgaW5kZXhcbiAqIGFzIHRoZSBhcmd1bWVudHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oXG4gIHNvdXJjZSAvKjogc3RyaW5nKi8sXG4gIGZ1bmN0aW9uTmFtZSAvKjogc3RyaW5nKi8sXG4gIGNhbGxiYWNrIC8qOiBGdW5jdGlvbiovXG4pIHtcbiAgc3R5bGVTZWFyY2goXG4gICAge1xuICAgICAgc291cmNlLFxuICAgICAgdGFyZ2V0OiBmdW5jdGlvbk5hbWUsXG4gICAgICBmdW5jdGlvbk5hbWVzOiBcImNoZWNrXCJcbiAgICB9LFxuICAgIG1hdGNoID0+IHtcbiAgICAgIGlmIChzb3VyY2VbbWF0Y2guZW5kSW5kZXhdICE9PSBcIihcIikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBwYXJlbnNNYXRjaCA9IGJhbGFuY2VkTWF0Y2goXG4gICAgICAgIFwiKFwiLFxuICAgICAgICBcIilcIixcbiAgICAgICAgc291cmNlLnN1YnN0cihtYXRjaC5zdGFydEluZGV4KVxuICAgICAgKTtcbiAgICAgIGNhbGxiYWNrKHBhcmVuc01hdGNoLmJvZHksIG1hdGNoLmVuZEluZGV4ICsgMSk7XG4gICAgfVxuICApO1xufTtcbiJdfQ==