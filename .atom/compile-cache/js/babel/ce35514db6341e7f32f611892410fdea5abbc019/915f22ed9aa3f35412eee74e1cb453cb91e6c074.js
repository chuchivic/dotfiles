
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvdmFsaWRhdGVPYmplY3RXaXRoU3RyaW5nQXJyYXlQcm9wcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWTVCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBUyxLQUFLLDRCQUE2QjtBQUMxRCxNQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUMzQixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDckMsUUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDMUIsYUFBTyxLQUFLLENBQUM7S0FDZDs7O0FBR0QsV0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsSUFBSTthQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQ25ELENBQUMsQ0FBQztDQUNKLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy92YWxpZGF0ZU9iamVjdFdpdGhTdHJpbmdBcnJheVByb3BzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSB2YXJpYWJsZSBpcyBhbiBvYmplY3QgYW5kIGFsbCBpdCdzIHByb3BlcnRpZXMgYXJlIGFycmF5cyBvZiBzdHJpbmcgdmFsdWVzOlxuICpcbiAqIGlnbm9yZVByb3BlcnRpZXMgPSB7XG4gKiAgIHZhbHVlMTogW1wiaXRlbTExXCIsIFwiaXRlbTEyXCIsIFwiaXRlbTEzXCJdLFxuICogICB2YWx1ZTI6IFtcIml0ZW0yMVwiLCBcIml0ZW0yMlwiLCBcIml0ZW0yM1wiXSxcbiAqICAgdmFsdWUzOiBbXCJpdGVtMzFcIiwgXCJpdGVtMzJcIiwgXCJpdGVtMzNcIl0sXG4gKiB9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWx1ZSAvKjogT2JqZWN0Ki8pIC8qOiBib29sZWFuKi8ge1xuICBpZiAoIV8uaXNQbGFpbk9iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpLmV2ZXJ5KGtleSA9PiB7XG4gICAgaWYgKCFfLmlzQXJyYXkodmFsdWVba2V5XSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIGFycmF5IGl0ZW1zIGFyZSBzdHJpbmdzXG4gICAgcmV0dXJuIHZhbHVlW2tleV0uZXZlcnkoaXRlbSA9PiBfLmlzU3RyaW5nKGl0ZW0pKTtcbiAgfSk7XG59O1xuIl19