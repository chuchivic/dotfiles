
"use strict";

var matchesStringOrRegExp = require("./matchesStringOrRegExp");

/**
 * Check if an options object's propertyName contains a user-defined string or
 * regex that matches the passed in input.
 */
module.exports = function optionsMatches(options, /*: Object*/
propertyName, /*: string*/
input /*: string*/
) /*: boolean*/{
  return !!(options && options[propertyName] && typeof input === "string" && matchesStringOrRegExp(input.toLowerCase(), options[propertyName]));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvb3B0aW9uc01hdGNoZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQTs7QUFFWixJQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBOzs7Ozs7QUFNaEUsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLGNBQWMsQ0FDdEMsT0FBTztBQUNQLFlBQVk7QUFDWixLQUFLO2VBQ1E7QUFDYixTQUFPLENBQUMsRUFBRSxPQUFPLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO0NBQzlJLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9vcHRpb25zTWF0Y2hlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG5jb25zdCBtYXRjaGVzU3RyaW5nT3JSZWdFeHAgPSByZXF1aXJlKFwiLi9tYXRjaGVzU3RyaW5nT3JSZWdFeHBcIilcblxuLyoqXG4gKiBDaGVjayBpZiBhbiBvcHRpb25zIG9iamVjdCdzIHByb3BlcnR5TmFtZSBjb250YWlucyBhIHVzZXItZGVmaW5lZCBzdHJpbmcgb3JcbiAqIHJlZ2V4IHRoYXQgbWF0Y2hlcyB0aGUgcGFzc2VkIGluIGlucHV0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9wdGlvbnNNYXRjaGVzKFxuICBvcHRpb25zLyo6IE9iamVjdCovLFxuICBwcm9wZXJ0eU5hbWUvKjogc3RyaW5nKi8sXG4gIGlucHV0Lyo6IHN0cmluZyovXG4pLyo6IGJvb2xlYW4qLyB7XG4gIHJldHVybiAhIShvcHRpb25zICYmIG9wdGlvbnNbcHJvcGVydHlOYW1lXSAmJiB0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIgJiYgbWF0Y2hlc1N0cmluZ09yUmVnRXhwKGlucHV0LnRvTG93ZXJDYXNlKCksIG9wdGlvbnNbcHJvcGVydHlOYW1lXSkpXG59XG4iXX0=