
"use strict";

/**
 * Check if a value is a valid 3, 4, 6 or 8 digit hex
 */
module.exports = function (value /*: string*/) /*: boolean*/{
  return (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNWYWxpZEhleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOzs7OztBQUtiLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLDRCQUE2QjtBQUMxRCxTQUFPLHdEQUF1RCxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFBQztDQUM1RSxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNWYWxpZEhleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDaGVjayBpZiBhIHZhbHVlIGlzIGEgdmFsaWQgMywgNCwgNiBvciA4IGRpZ2l0IGhleFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbHVlIC8qOiBzdHJpbmcqLykgLyo6IGJvb2xlYW4qLyB7XG4gIHJldHVybiAvXiMoPzpbMC05YS1mQS1GXXszLDR9fFswLTlhLWZBLUZdezZ9fFswLTlhLWZBLUZdezh9KSQvLnRlc3QodmFsdWUpO1xufTtcbiJdfQ==