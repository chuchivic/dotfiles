
"use strict";
var _ = require("lodash");
var rules = require("./rules");

// Rule settings can take a number of forms, e.g.
// a. "rule-name": null
// b. "rule-name": [null, ...]
// c. "rule-name": primaryOption
// d. "rule-name": [primaryOption]
// e. "rule-name": [primaryOption, secondaryOption]
// Where primaryOption can be anything: primitive, Object, or Array.
//
// This function normalizes all the possibilities into the
// standard form: [primaryOption, secondaryOption]
// Except in the cases with null, a & b, in which case
// null is returned
module.exports = function (rawSettings, /*: stylelint$configRuleSettings*/
ruleName, /*: string*/
// If primaryOptionArray is not provided, we try to get it from the
primaryOptionArray /*:: ?: boolean*/
) // rules themselves, which will not work for plugins
/*: [any, Object] | Array<any | [any, Object]> | null*/{
  if (rawSettings === null) {
    return null;
  }

  if (!Array.isArray(rawSettings)) {
    return [rawSettings];
  }
  // Everything below is an array ...

  if (rawSettings[0] === null) {
    return null;
  }

  // This cursed rule needs a special case
  if (ruleName === "declaration-block-properties-order") {
    if (rawSettings[0] === "alphabetical") {
      return rawSettings;
    }
    if (typeof rawSettings[0] === "string") {
      return [rawSettings];
    }
  }

  if (primaryOptionArray === undefined) {
    var rule = rules[ruleName];
    primaryOptionArray = _.get(rule, "primaryOptionArray");
  }

  if (!primaryOptionArray) {
    return rawSettings;
  }
  // Everything below is a rule that CAN have an array for a primary option ...
  // (they might also have something else, e.g. rule-properties-order can
  // have the string "alphabetical")

  if (rawSettings.length === 1 && Array.isArray(rawSettings[0])) {
    return rawSettings;
  }

  if (rawSettings.length === 2 && !_.isPlainObject(rawSettings[0]) && _.isPlainObject(rawSettings[1])) {
    return rawSettings;
  }

  return [rawSettings];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbm9ybWFsaXplUnVsZVNldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7QUFDWixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBOzs7Ozs7Ozs7Ozs7OztBQWNoQyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQ2YsV0FBVztBQUNYLFFBQVE7O0FBR1Isa0JBQWtCOzt1REFDcUM7QUFDdkQsTUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO0FBQ3hCLFdBQU8sSUFBSSxDQUFBO0dBQ1o7O0FBRUQsTUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDL0IsV0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0dBQ3JCOzs7QUFHRCxNQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDM0IsV0FBTyxJQUFJLENBQUE7R0FDWjs7O0FBR0QsTUFBSSxRQUFRLEtBQUssb0NBQW9DLEVBQUU7QUFDckQsUUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssY0FBYyxFQUFFO0FBQ3JDLGFBQU8sV0FBVyxDQUFBO0tBQ25CO0FBQ0QsUUFBSSxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7QUFDdEMsYUFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0tBQ3JCO0dBQ0Y7O0FBRUQsTUFBSSxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7QUFDcEMsUUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzVCLHNCQUFrQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG9CQUFvQixDQUFDLENBQUE7R0FDdkQ7O0FBRUQsTUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ3ZCLFdBQU8sV0FBVyxDQUFBO0dBQ25COzs7OztBQUtELE1BQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM3RCxXQUFPLFdBQVcsQ0FBQTtHQUNuQjs7QUFFRCxNQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ25HLFdBQU8sV0FBVyxDQUFBO0dBQ25COztBQUVELFNBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQTtDQUNyQixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbm9ybWFsaXplUnVsZVNldHRpbmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKVxuY29uc3QgcnVsZXMgPSByZXF1aXJlKFwiLi9ydWxlc1wiKVxuXG4vLyBSdWxlIHNldHRpbmdzIGNhbiB0YWtlIGEgbnVtYmVyIG9mIGZvcm1zLCBlLmcuXG4vLyBhLiBcInJ1bGUtbmFtZVwiOiBudWxsXG4vLyBiLiBcInJ1bGUtbmFtZVwiOiBbbnVsbCwgLi4uXVxuLy8gYy4gXCJydWxlLW5hbWVcIjogcHJpbWFyeU9wdGlvblxuLy8gZC4gXCJydWxlLW5hbWVcIjogW3ByaW1hcnlPcHRpb25dXG4vLyBlLiBcInJ1bGUtbmFtZVwiOiBbcHJpbWFyeU9wdGlvbiwgc2Vjb25kYXJ5T3B0aW9uXVxuLy8gV2hlcmUgcHJpbWFyeU9wdGlvbiBjYW4gYmUgYW55dGhpbmc6IHByaW1pdGl2ZSwgT2JqZWN0LCBvciBBcnJheS5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIG5vcm1hbGl6ZXMgYWxsIHRoZSBwb3NzaWJpbGl0aWVzIGludG8gdGhlXG4vLyBzdGFuZGFyZCBmb3JtOiBbcHJpbWFyeU9wdGlvbiwgc2Vjb25kYXJ5T3B0aW9uXVxuLy8gRXhjZXB0IGluIHRoZSBjYXNlcyB3aXRoIG51bGwsIGEgJiBiLCBpbiB3aGljaCBjYXNlXG4vLyBudWxsIGlzIHJldHVybmVkXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChcbiAgcmF3U2V0dGluZ3MvKjogc3R5bGVsaW50JGNvbmZpZ1J1bGVTZXR0aW5ncyovLFxuICBydWxlTmFtZS8qOiBzdHJpbmcqLyxcbiAgLy8gSWYgcHJpbWFyeU9wdGlvbkFycmF5IGlzIG5vdCBwcm92aWRlZCwgd2UgdHJ5IHRvIGdldCBpdCBmcm9tIHRoZVxuICAvLyBydWxlcyB0aGVtc2VsdmVzLCB3aGljaCB3aWxsIG5vdCB3b3JrIGZvciBwbHVnaW5zXG4gIHByaW1hcnlPcHRpb25BcnJheS8qOjogPzogYm9vbGVhbiovXG4pLyo6IFthbnksIE9iamVjdF0gfCBBcnJheTxhbnkgfCBbYW55LCBPYmplY3RdPiB8IG51bGwqLyB7XG4gIGlmIChyYXdTZXR0aW5ncyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAoIUFycmF5LmlzQXJyYXkocmF3U2V0dGluZ3MpKSB7XG4gICAgcmV0dXJuIFtyYXdTZXR0aW5nc11cbiAgfVxuICAvLyBFdmVyeXRoaW5nIGJlbG93IGlzIGFuIGFycmF5IC4uLlxuXG4gIGlmIChyYXdTZXR0aW5nc1swXSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyBUaGlzIGN1cnNlZCBydWxlIG5lZWRzIGEgc3BlY2lhbCBjYXNlXG4gIGlmIChydWxlTmFtZSA9PT0gXCJkZWNsYXJhdGlvbi1ibG9jay1wcm9wZXJ0aWVzLW9yZGVyXCIpIHtcbiAgICBpZiAocmF3U2V0dGluZ3NbMF0gPT09IFwiYWxwaGFiZXRpY2FsXCIpIHtcbiAgICAgIHJldHVybiByYXdTZXR0aW5nc1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHJhd1NldHRpbmdzWzBdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gW3Jhd1NldHRpbmdzXVxuICAgIH1cbiAgfVxuXG4gIGlmIChwcmltYXJ5T3B0aW9uQXJyYXkgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHJ1bGUgPSBydWxlc1tydWxlTmFtZV1cbiAgICBwcmltYXJ5T3B0aW9uQXJyYXkgPSBfLmdldChydWxlLCBcInByaW1hcnlPcHRpb25BcnJheVwiKVxuICB9XG5cbiAgaWYgKCFwcmltYXJ5T3B0aW9uQXJyYXkpIHtcbiAgICByZXR1cm4gcmF3U2V0dGluZ3NcbiAgfVxuICAvLyBFdmVyeXRoaW5nIGJlbG93IGlzIGEgcnVsZSB0aGF0IENBTiBoYXZlIGFuIGFycmF5IGZvciBhIHByaW1hcnkgb3B0aW9uIC4uLlxuICAvLyAodGhleSBtaWdodCBhbHNvIGhhdmUgc29tZXRoaW5nIGVsc2UsIGUuZy4gcnVsZS1wcm9wZXJ0aWVzLW9yZGVyIGNhblxuICAvLyBoYXZlIHRoZSBzdHJpbmcgXCJhbHBoYWJldGljYWxcIilcblxuICBpZiAocmF3U2V0dGluZ3MubGVuZ3RoID09PSAxICYmIEFycmF5LmlzQXJyYXkocmF3U2V0dGluZ3NbMF0pKSB7XG4gICAgcmV0dXJuIHJhd1NldHRpbmdzXG4gIH1cblxuICBpZiAocmF3U2V0dGluZ3MubGVuZ3RoID09PSAyICYmICFfLmlzUGxhaW5PYmplY3QocmF3U2V0dGluZ3NbMF0pICYmIF8uaXNQbGFpbk9iamVjdChyYXdTZXR0aW5nc1sxXSkpIHtcbiAgICByZXR1cm4gcmF3U2V0dGluZ3NcbiAgfVxuXG4gIHJldHVybiBbcmF3U2V0dGluZ3NdXG59XG4iXX0=