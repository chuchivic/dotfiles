
"use strict";
module.exports = function (atRule /*: postcss$atRule*/) /*: number*/{
  // Initial 1 is for the `@`
  var index = 1 + atRule.name.length;
  if (atRule.raws.afterName) {
    index += atRule.raws.afterName.length;
  }
  return index;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYXRSdWxlUGFyYW1JbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBO0FBQ1osTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLE1BQU0sbUNBQWtDOztBQUVqRSxNQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7QUFDbEMsTUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN6QixTQUFLLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFBO0dBQ3RDO0FBQ0QsU0FBTyxLQUFLLENBQUE7Q0FDYixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYXRSdWxlUGFyYW1JbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXRSdWxlLyo6IHBvc3Rjc3MkYXRSdWxlKi8pLyo6IG51bWJlciovIHtcbiAgLy8gSW5pdGlhbCAxIGlzIGZvciB0aGUgYEBgXG4gIGxldCBpbmRleCA9IDEgKyBhdFJ1bGUubmFtZS5sZW5ndGhcbiAgaWYgKGF0UnVsZS5yYXdzLmFmdGVyTmFtZSkge1xuICAgIGluZGV4ICs9IGF0UnVsZS5yYXdzLmFmdGVyTmFtZS5sZW5ndGhcbiAgfVxuICByZXR1cm4gaW5kZXhcbn1cbiJdfQ==