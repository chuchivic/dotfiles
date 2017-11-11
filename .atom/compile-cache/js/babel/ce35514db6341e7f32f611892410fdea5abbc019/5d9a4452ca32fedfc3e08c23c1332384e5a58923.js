
"use strict";

var hasInterpolation = require("../utils/hasInterpolation");
/**
 * Check whether a property is standard
 */
module.exports = function (property /*: string*/) /*: boolean*/{
  // SCSS var (e.g. $var: x), list (e.g. $list: (x)) or map (e.g. $map: (key:value))
  if (property[0] === "$") {
    return false;
  }

  // Less var (e.g. @var: x)
  if (property[0] === "@") {
    return false;
  }

  // SCSS or Less interpolation
  if (hasInterpolation(property)) {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFByb3BlcnR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7O0FBRVosSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQTs7OztBQUk3RCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsUUFBUSw0QkFBMkI7O0FBRTVELE1BQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUN2QixXQUFPLEtBQUssQ0FBQTtHQUNiOzs7QUFHRCxNQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDdkIsV0FBTyxLQUFLLENBQUE7R0FDYjs7O0FBR0QsTUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM5QixXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELFNBQU8sSUFBSSxDQUFBO0NBQ1osQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzU3RhbmRhcmRTeW50YXhQcm9wZXJ0eS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG5jb25zdCBoYXNJbnRlcnBvbGF0aW9uID0gcmVxdWlyZShcIi4uL3V0aWxzL2hhc0ludGVycG9sYXRpb25cIilcbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHByb3BlcnR5IGlzIHN0YW5kYXJkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHByb3BlcnR5Lyo6IHN0cmluZyovKS8qOiBib29sZWFuKi8ge1xuICAvLyBTQ1NTIHZhciAoZS5nLiAkdmFyOiB4KSwgbGlzdCAoZS5nLiAkbGlzdDogKHgpKSBvciBtYXAgKGUuZy4gJG1hcDogKGtleTp2YWx1ZSkpXG4gIGlmIChwcm9wZXJ0eVswXSA9PT0gXCIkXCIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIExlc3MgdmFyIChlLmcuIEB2YXI6IHgpXG4gIGlmIChwcm9wZXJ0eVswXSA9PT0gXCJAXCIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIFNDU1Mgb3IgTGVzcyBpbnRlcnBvbGF0aW9uXG4gIGlmIChoYXNJbnRlcnBvbGF0aW9uKHByb3BlcnR5KSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cbiJdfQ==