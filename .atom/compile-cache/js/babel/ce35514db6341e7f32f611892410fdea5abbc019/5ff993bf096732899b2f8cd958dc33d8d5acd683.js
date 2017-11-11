
"use strict";

/**
 * Check whether a string has less interpolation
 *
 * @param {string} string
 * @return {boolean} If `true`, a string has less interpolation
 */
module.exports = function (string /*: string*/) /*: boolean*/{
  if (/@{.+?}/.test(string)) {
    return true;
  }

  return false;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaGFzTGVzc0ludGVycG9sYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQTs7Ozs7Ozs7QUFRWixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsTUFBTSw0QkFBMkI7QUFDMUQsTUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3pCLFdBQU8sSUFBSSxDQUFBO0dBQ1o7O0FBRUQsU0FBTyxLQUFLLENBQUE7Q0FDYixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaGFzTGVzc0ludGVycG9sYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RyaW5nIGhhcyBsZXNzIGludGVycG9sYXRpb25cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtib29sZWFufSBJZiBgdHJ1ZWAsIGEgc3RyaW5nIGhhcyBsZXNzIGludGVycG9sYXRpb25cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyaW5nLyo6IHN0cmluZyovKS8qOiBib29sZWFuKi8ge1xuICBpZiAoL0B7Lis/fS8udGVzdChzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuIl19