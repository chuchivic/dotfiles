
"use strict";

var _ = require("lodash");
var isCustomPropertySet = require("../utils/isCustomPropertySet");

/**
 * Check whether a Node is a standard rule
 */
module.exports = function (rule /*: Object*/) /*: boolean*/{
  // Get full selector
  var selector = _.get(rule, "raws.selector.raw", rule.selector);

  // Custom property set (e.g. --custom-property-set: {})
  if (isCustomPropertySet(rule)) {
    return false;
  }

  // Called Less mixin (e.g. a { .mixin() })
  if (rule.ruleWithoutBody) {
    return false;
  }

  // Less detached rulesets
  if (selector.slice(0, 1) === "@" && selector.slice(-1) === ":") {
    return false;
  }

  // Ignore mixin or &:extend rule
  // https://github.com/webschik/postcss-less/blob/master/lib/less-parser.js#L52
  if (rule.params && rule.params[0]) {
    return false;
  }

  // Non-outputting Less mixin definition (e.g. .mixin() {})
  if (_.endsWith(selector, ")") && !_.includes(selector, ":")) {
    return false;
  }

  // Ignore Scss nested properties
  if (selector.slice(-1) === ":") {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFJ1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQTs7QUFFWixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQTs7Ozs7QUFLbkUsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQUksNEJBQTJCOztBQUV4RCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7OztBQUdoRSxNQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdCLFdBQU8sS0FBSyxDQUFBO0dBQ2I7OztBQUdELE1BQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN4QixXQUFPLEtBQUssQ0FBQTtHQUNiOzs7QUFHRCxNQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQzlELFdBQU8sS0FBSyxDQUFBO0dBQ2I7Ozs7QUFJRCxNQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNqQyxXQUFPLEtBQUssQ0FBQTtHQUNiOzs7QUFHRCxNQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUU7QUFDM0QsV0FBTyxLQUFLLENBQUE7R0FDYjs7O0FBR0QsTUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQzlCLFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFJ1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcbmNvbnN0IGlzQ3VzdG9tUHJvcGVydHlTZXQgPSByZXF1aXJlKFwiLi4vdXRpbHMvaXNDdXN0b21Qcm9wZXJ0eVNldFwiKVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBOb2RlIGlzIGEgc3RhbmRhcmQgcnVsZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChydWxlLyo6IE9iamVjdCovKS8qOiBib29sZWFuKi8ge1xuICAvLyBHZXQgZnVsbCBzZWxlY3RvclxuICBjb25zdCBzZWxlY3RvciA9IF8uZ2V0KHJ1bGUsIFwicmF3cy5zZWxlY3Rvci5yYXdcIiwgcnVsZS5zZWxlY3RvcilcblxuICAvLyBDdXN0b20gcHJvcGVydHkgc2V0IChlLmcuIC0tY3VzdG9tLXByb3BlcnR5LXNldDoge30pXG4gIGlmIChpc0N1c3RvbVByb3BlcnR5U2V0KHJ1bGUpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBDYWxsZWQgTGVzcyBtaXhpbiAoZS5nLiBhIHsgLm1peGluKCkgfSlcbiAgaWYgKHJ1bGUucnVsZVdpdGhvdXRCb2R5KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBMZXNzIGRldGFjaGVkIHJ1bGVzZXRzXG4gIGlmIChzZWxlY3Rvci5zbGljZSgwLCAxKSA9PT0gXCJAXCIgJiYgc2VsZWN0b3Iuc2xpY2UoLTEpID09PSBcIjpcIikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gSWdub3JlIG1peGluIG9yICY6ZXh0ZW5kIHJ1bGVcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYnNjaGlrL3Bvc3Rjc3MtbGVzcy9ibG9iL21hc3Rlci9saWIvbGVzcy1wYXJzZXIuanMjTDUyXG4gIGlmIChydWxlLnBhcmFtcyAmJiBydWxlLnBhcmFtc1swXSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gTm9uLW91dHB1dHRpbmcgTGVzcyBtaXhpbiBkZWZpbml0aW9uIChlLmcuIC5taXhpbigpIHt9KVxuICBpZiAoXy5lbmRzV2l0aChzZWxlY3RvciwgXCIpXCIpICYmICFfLmluY2x1ZGVzKHNlbGVjdG9yLCBcIjpcIikpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIElnbm9yZSBTY3NzIG5lc3RlZCBwcm9wZXJ0aWVzXG4gIGlmIChzZWxlY3Rvci5zbGljZSgtMSkgPT09IFwiOlwiKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuIl19