
"use strict";
var beforeBlockString = require("./beforeBlockString");
var hasBlock = require("./hasBlock");
var rawNodeString = require("./rawNodeString");

/**
 * Return a CSS statement's block -- the string that starts and `{` and ends with `}`.
 *
 * If the statement has no block (e.g. `@import url(foo.css);`),
 * return undefined.
 *
 * @param {Rule|AtRule} statement - postcss rule or at-rule node
 * @return {string|undefined}
 */
module.exports = function (statement /*: postcss$rule | postcss$atRule*/
) /*: string | boolean*/{
  if (!hasBlock(statement)) {
    return false;
  }
  return rawNodeString(statement).slice(beforeBlockString(statement).length);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYmxvY2tTdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQztBQUNiLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDekQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZDLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOzs7Ozs7Ozs7OztBQVdqRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQ2YsU0FBUzt3QkFDYztBQUN2QixNQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQ3hCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7QUFDRCxTQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDNUUsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2Jsb2NrU3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuY29uc3QgYmVmb3JlQmxvY2tTdHJpbmcgPSByZXF1aXJlKFwiLi9iZWZvcmVCbG9ja1N0cmluZ1wiKTtcbmNvbnN0IGhhc0Jsb2NrID0gcmVxdWlyZShcIi4vaGFzQmxvY2tcIik7XG5jb25zdCByYXdOb2RlU3RyaW5nID0gcmVxdWlyZShcIi4vcmF3Tm9kZVN0cmluZ1wiKTtcblxuLyoqXG4gKiBSZXR1cm4gYSBDU1Mgc3RhdGVtZW50J3MgYmxvY2sgLS0gdGhlIHN0cmluZyB0aGF0IHN0YXJ0cyBhbmQgYHtgIGFuZCBlbmRzIHdpdGggYH1gLlxuICpcbiAqIElmIHRoZSBzdGF0ZW1lbnQgaGFzIG5vIGJsb2NrIChlLmcuIGBAaW1wb3J0IHVybChmb28uY3NzKTtgKSxcbiAqIHJldHVybiB1bmRlZmluZWQuXG4gKlxuICogQHBhcmFtIHtSdWxlfEF0UnVsZX0gc3RhdGVtZW50IC0gcG9zdGNzcyBydWxlIG9yIGF0LXJ1bGUgbm9kZVxuICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgc3RhdGVtZW50IC8qOiBwb3N0Y3NzJHJ1bGUgfCBwb3N0Y3NzJGF0UnVsZSovXG4pIC8qOiBzdHJpbmcgfCBib29sZWFuKi8ge1xuICBpZiAoIWhhc0Jsb2NrKHN0YXRlbWVudCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHJhd05vZGVTdHJpbmcoc3RhdGVtZW50KS5zbGljZShiZWZvcmVCbG9ja1N0cmluZyhzdGF0ZW1lbnQpLmxlbmd0aCk7XG59O1xuIl19