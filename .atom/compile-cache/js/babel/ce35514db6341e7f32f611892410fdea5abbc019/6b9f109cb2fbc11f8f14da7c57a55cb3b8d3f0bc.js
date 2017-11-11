
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheEF0UnVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOzs7Ozs7OztBQVFiLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBUyxNQUFNLG9DQUFxQzs7QUFFbkUsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxFQUFFLEVBQUU7QUFDekMsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsTUFDRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssRUFBRSxJQUM1QixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFDeEI7QUFDQSxXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzU3RhbmRhcmRTeW50YXhBdFJ1bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIGF0LXJ1bGUgaXMgc3RhbmRhcmRcbiAqXG4gKiBAcGFyYW0ge2F0UnVsZX0gcG9zdGNzcyBhdC1ydWxlIG5vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59IElmIGB0cnVlYCwgdGhlIGRlY2xhcmF0aW9uIGlzIHN0YW5kYXJkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXRSdWxlIC8qOiBwb3N0Y3NzJGF0UnVsZSovKSAvKjogYm9vbGVhbiovIHtcbiAgLy8gSWdub3JlIHNjc3MgYEBjb250ZW50YCBpbnNpZGUgbWl4aW5zXG4gIGlmICghYXRSdWxlLm5vZGVzICYmIGF0UnVsZS5wYXJhbXMgPT09IFwiXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZ25vcmUgZGV0YWNoZWQgcnVsZXNldCBgQGRldGFjaGVkLXJ1bGVzZXQ6IHsgYmFja2dyb3VuZDogcmVkOyB9OyAudG9wIHsgQGRldGFjaGVkLXJ1bGVzZXQoKTsgfWBcbiAgaWYgKFxuICAgICFhdFJ1bGUubm9kZXMgJiZcbiAgICBhdFJ1bGUucmF3cy5hZnRlck5hbWUgPT09IFwiXCIgJiZcbiAgICBhdFJ1bGUucGFyYW1zWzBdID09PSBcIihcIlxuICApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iXX0=