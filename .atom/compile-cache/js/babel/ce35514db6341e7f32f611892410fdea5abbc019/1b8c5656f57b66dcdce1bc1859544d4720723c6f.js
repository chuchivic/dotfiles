
"use strict";

var hasInterpolation = require("../utils/hasInterpolation");
/**
 * Check whether a selector is standard
 */
module.exports = function (selector /*: string*/) /*: boolean*/{
  // SCSS or Less interpolation
  if (hasInterpolation(selector)) {
    return false;
  }

  // SCSS placeholder selectors
  if (selector.indexOf("%") === 0) {
    return false;
  }

  // Less :extend()
  if (/:extend(\(.*?\))?/.test(selector)) {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs7OztBQUk5RCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsUUFBUSw0QkFBNkI7O0FBRTdELE1BQUksZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDOUIsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsTUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMvQixXQUFPLEtBQUssQ0FBQztHQUNkOzs7QUFHRCxNQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0QyxXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzU3RhbmRhcmRTeW50YXhTZWxlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgaGFzSW50ZXJwb2xhdGlvbiA9IHJlcXVpcmUoXCIuLi91dGlscy9oYXNJbnRlcnBvbGF0aW9uXCIpO1xuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc2VsZWN0b3IgaXMgc3RhbmRhcmRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWxlY3RvciAvKjogc3RyaW5nKi8pIC8qOiBib29sZWFuKi8ge1xuICAvLyBTQ1NTIG9yIExlc3MgaW50ZXJwb2xhdGlvblxuICBpZiAoaGFzSW50ZXJwb2xhdGlvbihzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBTQ1NTIHBsYWNlaG9sZGVyIHNlbGVjdG9yc1xuICBpZiAoc2VsZWN0b3IuaW5kZXhPZihcIiVcIikgPT09IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBMZXNzIDpleHRlbmQoKVxuICBpZiAoLzpleHRlbmQoXFwoLio/XFwpKT8vLnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIl19