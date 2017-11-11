
"use strict";

/**
 * Check whether a at-rule is standard
 *
 * @param {atRule} postcss at-rule node
 * @return {boolean} If `true`, the declaration is standard
 */
module.exports = function (atRule /*: postcss$atRule*/) /*: boolean*/{
  // Ignore scss `@content` inside mixins
  if (!atRule.nodes && atRule.params === "") {
    return false;
  }

  // Ignore detached ruleset `@detached-ruleset: { background: red; }; .top { @detached-ruleset(); }`
  if (!atRule.nodes && atRule.raws.afterName === "" && atRule.params[0] === "(") {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheEF0UnVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOzs7Ozs7OztBQVFaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxNQUFNLG9DQUFtQzs7QUFFbEUsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUU7QUFDekMsV0FBTyxLQUFLLENBQUE7R0FDYjs7O0FBR0QsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssRUFBRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQzdFLFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheEF0UnVsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBhdC1ydWxlIGlzIHN0YW5kYXJkXG4gKlxuICogQHBhcmFtIHthdFJ1bGV9IHBvc3Rjc3MgYXQtcnVsZSBub2RlXG4gKiBAcmV0dXJuIHtib29sZWFufSBJZiBgdHJ1ZWAsIHRoZSBkZWNsYXJhdGlvbiBpcyBzdGFuZGFyZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhdFJ1bGUvKjogcG9zdGNzcyRhdFJ1bGUqLykvKjogYm9vbGVhbiovIHtcbiAgLy8gSWdub3JlIHNjc3MgYEBjb250ZW50YCBpbnNpZGUgbWl4aW5zXG4gIGlmICghYXRSdWxlLm5vZGVzICYmIGF0UnVsZS5wYXJhbXMgPT09IFwiXCIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIElnbm9yZSBkZXRhY2hlZCBydWxlc2V0IGBAZGV0YWNoZWQtcnVsZXNldDogeyBiYWNrZ3JvdW5kOiByZWQ7IH07IC50b3AgeyBAZGV0YWNoZWQtcnVsZXNldCgpOyB9YFxuICBpZiAoIWF0UnVsZS5ub2RlcyAmJiBhdFJ1bGUucmF3cy5hZnRlck5hbWUgPT09IFwiXCIgJiYgYXRSdWxlLnBhcmFtc1swXSA9PT0gXCIoXCIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG4iXX0=