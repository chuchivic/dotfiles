
"use strict";

var _ = require("lodash");

/**
 * Check whether the variable is an object and all it's properties are arrays of string values:
 *
 * ignoreProperties = {
 *   value1: ["item11", "item12", "item13"],
 *   value2: ["item21", "item22", "item23"],
 *   value3: ["item31", "item32", "item33"],
 * }
 */

module.exports = function (value /*: Object*/) /*: boolean*/{
  if (!_.isPlainObject(value)) {
    return false;
  }

  return Object.keys(value).every(function (key) {
    if (!_.isArray(value[key])) {
      return false;
    }

    // Make sure the array items are strings
    return value[key].every(function (item) {
      return _.isString(item);
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvdmFsaWRhdGVPYmplY3RXaXRoU3RyaW5nQXJyYXlQcm9wcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7Ozs7Ozs7Ozs7O0FBWTNCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxLQUFLLDRCQUEyQjtBQUN6RCxNQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMzQixXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELFNBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDckMsUUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDMUIsYUFBTyxLQUFLLENBQUE7S0FDYjs7O0FBR0QsV0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsSUFBSTthQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0tBQUEsQ0FBQyxDQUFBO0dBQ2xELENBQUMsQ0FBQTtDQUNILENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy92YWxpZGF0ZU9iamVjdFdpdGhTdHJpbmdBcnJheVByb3BzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiXG5cbmNvbnN0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgdmFyaWFibGUgaXMgYW4gb2JqZWN0IGFuZCBhbGwgaXQncyBwcm9wZXJ0aWVzIGFyZSBhcnJheXMgb2Ygc3RyaW5nIHZhbHVlczpcbiAqXG4gKiBpZ25vcmVQcm9wZXJ0aWVzID0ge1xuICogICB2YWx1ZTE6IFtcIml0ZW0xMVwiLCBcIml0ZW0xMlwiLCBcIml0ZW0xM1wiXSxcbiAqICAgdmFsdWUyOiBbXCJpdGVtMjFcIiwgXCJpdGVtMjJcIiwgXCJpdGVtMjNcIl0sXG4gKiAgIHZhbHVlMzogW1wiaXRlbTMxXCIsIFwiaXRlbTMyXCIsIFwiaXRlbTMzXCJdLFxuICogfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlLyo6IE9iamVjdCovKS8qOiBib29sZWFuKi8ge1xuICBpZiAoIV8uaXNQbGFpbk9iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiBPYmplY3Qua2V5cyh2YWx1ZSkuZXZlcnkoa2V5ID0+IHtcbiAgICBpZiAoIV8uaXNBcnJheSh2YWx1ZVtrZXldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZSBhcnJheSBpdGVtcyBhcmUgc3RyaW5nc1xuICAgIHJldHVybiB2YWx1ZVtrZXldLmV2ZXJ5KGl0ZW0gPT4gXy5pc1N0cmluZyhpdGVtKSlcbiAgfSlcbn1cbiJdfQ==