
"use strict";

/**
 * Check if a value is a valid 3, 4, 6 or 8 digit hex
 */
module.exports = function (value /*: string*/) /*: boolean*/{
  return (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNWYWxpZEhleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOzs7OztBQUtaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLDRCQUEyQjtBQUN6RCxTQUFRLHdEQUF1RCxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDMUU7Q0FDRixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNWYWxpZEhleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG4vKipcbiAqIENoZWNrIGlmIGEgdmFsdWUgaXMgYSB2YWxpZCAzLCA0LCA2IG9yIDggZGlnaXQgaGV4XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlLyo6IHN0cmluZyovKS8qOiBib29sZWFuKi8ge1xuICByZXR1cm4gKC9eIyg/OlswLTlhLWZBLUZdezMsNH18WzAtOWEtZkEtRl17Nn18WzAtOWEtZkEtRl17OH0pJC8udGVzdCh2YWx1ZSlcbiAgKVxufVxuIl19