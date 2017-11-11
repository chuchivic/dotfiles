
"use strict";

var hasInterpolation = require("../utils/hasInterpolation");
/**
 * Check whether a media feature is standard
 */
module.exports = function (mediaFeature /*: string*/) /*: boolean*/{
  // Remove outside parens
  mediaFeature = mediaFeature.slice(1, -1);

  // Parentheticals used for non-standard operations e.g. ($var - 10)
  if (mediaFeature.indexOf("(") !== -1) {
    return false;
  }

  // SCSS or Less interpolation
  if (hasInterpolation(mediaFeature)) {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheE1lZGlhRmVhdHVyZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUE7Ozs7QUFJN0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLFlBQVksNEJBQTJCOztBQUVoRSxjQUFZLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTs7O0FBR3hDLE1BQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtBQUNwQyxXQUFPLEtBQUssQ0FBQTtHQUNiOzs7QUFHRCxNQUFJLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxFQUFFO0FBQ2xDLFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheE1lZGlhRmVhdHVyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG5jb25zdCBoYXNJbnRlcnBvbGF0aW9uID0gcmVxdWlyZShcIi4uL3V0aWxzL2hhc0ludGVycG9sYXRpb25cIilcbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIG1lZGlhIGZlYXR1cmUgaXMgc3RhbmRhcmRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWVkaWFGZWF0dXJlLyo6IHN0cmluZyovKS8qOiBib29sZWFuKi8ge1xuICAvLyBSZW1vdmUgb3V0c2lkZSBwYXJlbnNcbiAgbWVkaWFGZWF0dXJlID0gbWVkaWFGZWF0dXJlLnNsaWNlKDEsIC0xKVxuXG4gIC8vIFBhcmVudGhldGljYWxzIHVzZWQgZm9yIG5vbi1zdGFuZGFyZCBvcGVyYXRpb25zIGUuZy4gKCR2YXIgLSAxMClcbiAgaWYgKG1lZGlhRmVhdHVyZS5pbmRleE9mKFwiKFwiKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIFNDU1Mgb3IgTGVzcyBpbnRlcnBvbGF0aW9uXG4gIGlmIChoYXNJbnRlcnBvbGF0aW9uKG1lZGlhRmVhdHVyZSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG4iXX0=