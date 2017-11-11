
"use strict";
module.exports = function (atRule /*: postcss$atRule*/) /*: number*/{
  // Initial 1 is for the `@`
  var index = 1 + atRule.name.length;
  if (atRule.raws.afterName) {
    index += atRule.raws.afterName.length;
  }
  return index;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYXRSdWxlUGFyYW1JbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDO0FBQ2IsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLE1BQU0sbUNBQW9DOztBQUVsRSxNQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDbkMsTUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN6QixTQUFLLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0dBQ3ZDO0FBQ0QsU0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYXRSdWxlUGFyYW1JbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXRSdWxlIC8qOiBwb3N0Y3NzJGF0UnVsZSovKSAvKjogbnVtYmVyKi8ge1xuICAvLyBJbml0aWFsIDEgaXMgZm9yIHRoZSBgQGBcbiAgbGV0IGluZGV4ID0gMSArIGF0UnVsZS5uYW1lLmxlbmd0aDtcbiAgaWYgKGF0UnVsZS5yYXdzLmFmdGVyTmFtZSkge1xuICAgIGluZGV4ICs9IGF0UnVsZS5yYXdzLmFmdGVyTmFtZS5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIGluZGV4O1xufTtcbiJdfQ==