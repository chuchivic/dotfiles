
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
  if (rule.mixin) {
    return false;
  }

  // Less detached rulesets
  if (selector.slice(0, 1) === "@" && selector.slice(-1) === ":") {
    return false;
  }

  // Ignore Less &:extend rule
  if (rule.extend) {
    return false;
  }

  // Ignore mixin or &:extend rule
  // https://github.com/shellscape/postcss-less/blob/master/lib/less-parser.js#L52
  if (rule.params && rule.params[0]) {
    return false;
  }

  // Non-outputting Less mixin definition (e.g. .mixin() {})
  if (_.endsWith(selector, ")") && !_.includes(selector, ":")) {
    return false;
  }

  // Less guards
  if (/when\s+(not\s+)*\(/.test(selector)) {
    return false;
  }

  // Ignore Scss nested properties
  if (selector.slice(-1) === ":") {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFJ1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7QUFFYixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUIsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQzs7Ozs7QUFLcEUsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksNEJBQTZCOztBQUV6RCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7OztBQUdqRSxNQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNkLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDOUQsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsTUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsV0FBTyxLQUFLLENBQUM7R0FDZDs7OztBQUlELE1BQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ2pDLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRTtBQUMzRCxXQUFPLEtBQUssQ0FBQztHQUNkOzs7QUFHRCxNQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN2QyxXQUFPLEtBQUssQ0FBQztHQUNkOzs7QUFHRCxNQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDOUIsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9pc1N0YW5kYXJkU3ludGF4UnVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5jb25zdCBpc0N1c3RvbVByb3BlcnR5U2V0ID0gcmVxdWlyZShcIi4uL3V0aWxzL2lzQ3VzdG9tUHJvcGVydHlTZXRcIik7XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIE5vZGUgaXMgYSBzdGFuZGFyZCBydWxlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocnVsZSAvKjogT2JqZWN0Ki8pIC8qOiBib29sZWFuKi8ge1xuICAvLyBHZXQgZnVsbCBzZWxlY3RvclxuICBjb25zdCBzZWxlY3RvciA9IF8uZ2V0KHJ1bGUsIFwicmF3cy5zZWxlY3Rvci5yYXdcIiwgcnVsZS5zZWxlY3Rvcik7XG5cbiAgLy8gQ3VzdG9tIHByb3BlcnR5IHNldCAoZS5nLiAtLWN1c3RvbS1wcm9wZXJ0eS1zZXQ6IHt9KVxuICBpZiAoaXNDdXN0b21Qcm9wZXJ0eVNldChydWxlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENhbGxlZCBMZXNzIG1peGluIChlLmcuIGEgeyAubWl4aW4oKSB9KVxuICBpZiAocnVsZS5taXhpbikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIExlc3MgZGV0YWNoZWQgcnVsZXNldHNcbiAgaWYgKHNlbGVjdG9yLnNsaWNlKDAsIDEpID09PSBcIkBcIiAmJiBzZWxlY3Rvci5zbGljZSgtMSkgPT09IFwiOlwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWdub3JlIExlc3MgJjpleHRlbmQgcnVsZVxuICBpZiAocnVsZS5leHRlbmQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZ25vcmUgbWl4aW4gb3IgJjpleHRlbmQgcnVsZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vc2hlbGxzY2FwZS9wb3N0Y3NzLWxlc3MvYmxvYi9tYXN0ZXIvbGliL2xlc3MtcGFyc2VyLmpzI0w1MlxuICBpZiAocnVsZS5wYXJhbXMgJiYgcnVsZS5wYXJhbXNbMF0pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBOb24tb3V0cHV0dGluZyBMZXNzIG1peGluIGRlZmluaXRpb24gKGUuZy4gLm1peGluKCkge30pXG4gIGlmIChfLmVuZHNXaXRoKHNlbGVjdG9yLCBcIilcIikgJiYgIV8uaW5jbHVkZXMoc2VsZWN0b3IsIFwiOlwiKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIExlc3MgZ3VhcmRzXG4gIGlmICgvd2hlblxccysobm90XFxzKykqXFwoLy50ZXN0KHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIElnbm9yZSBTY3NzIG5lc3RlZCBwcm9wZXJ0aWVzXG4gIGlmIChzZWxlY3Rvci5zbGljZSgtMSkgPT09IFwiOlwiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIl19