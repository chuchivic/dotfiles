
"use strict";

module.exports = function (statement /*: postcss$node*/) /*: boolean*/{
  var parentNode = statement.parent;

  return parentNode !== undefined && parentNode.type !== "root" && statement === parentNode.first;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNGaXJzdE5lc3RlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBUyxTQUFTLGtDQUFtQztBQUNwRSxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDOztBQUVwQyxTQUNFLFVBQVUsS0FBSyxTQUFTLElBQ3hCLFVBQVUsQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUMxQixTQUFTLEtBQUssVUFBVSxDQUFDLEtBQUssQ0FDOUI7Q0FDSCxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNGaXJzdE5lc3RlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdGF0ZW1lbnQgLyo6IHBvc3Rjc3Mkbm9kZSovKSAvKjogYm9vbGVhbiovIHtcbiAgY29uc3QgcGFyZW50Tm9kZSA9IHN0YXRlbWVudC5wYXJlbnQ7XG5cbiAgcmV0dXJuIChcbiAgICBwYXJlbnROb2RlICE9PSB1bmRlZmluZWQgJiZcbiAgICBwYXJlbnROb2RlLnR5cGUgIT09IFwicm9vdFwiICYmXG4gICAgc3RhdGVtZW50ID09PSBwYXJlbnROb2RlLmZpcnN0XG4gICk7XG59O1xuIl19