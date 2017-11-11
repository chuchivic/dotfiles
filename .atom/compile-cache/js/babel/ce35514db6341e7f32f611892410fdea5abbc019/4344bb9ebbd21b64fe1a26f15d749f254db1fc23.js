
"use strict";

var _ = require("lodash");

/**
 * Report a violation.
 *
 * This function accounts for `disabledRanges` attached to the result.
 * That is, if the reported violation is within a disabledRange,
 * it is ignored. Otherwise, it is attached to the result as a
 * postcss warning.
 *
 * It also accounts for the rule's severity.
 *
 * You *must* pass *either* a node or a line number.
 */
module.exports = function (violation /*: {
                                     ruleName: string,
                                     result: Object,
                                     message: string,
                                     node: Object,
                                     index?: number,
                                     word?: string,
                                     line?: number
                                     }*/) {
  var ruleName = violation.ruleName;
  var result = violation.result;
  var message = violation.message;
  var line = violation.line;
  var node = violation.node;
  var index = violation.index;
  var word = violation.word;

  result.stylelint = result.stylelint || {};

  // In quiet mode, mere warnings are ignored
  if (result.stylelint.quiet && result.stylelint.ruleSeverities[ruleName] !== "error") {
    return;
  }

  // If a line is not passed, use the node.positionBy method to get the
  // line number that the complaint pertains to
  var startLine = line || node.positionBy({ index: index }).line;

  if (result.stylelint.disabledRanges && !result.stylelint.ignoreDisables) {
    var ranges = result.stylelint.disabledRanges[ruleName] || result.stylelint.disabledRanges.all;
    for (var range of ranges) {
      if (
      // If the violation is within a disabledRange,
      // and that disabledRange's rules include this one,
      // do not register a warning
      range.start <= startLine && (range.end >= startLine || range.end === undefined) && (!range.rules || range.rules.indexOf(ruleName) !== -1)) {
        return;
      }
    }
  }

  var severity = _.get(result.stylelint, ["ruleSeverities", ruleName], "ignore");

  if (!result.stylelint.stylelintError && severity === "error") {
    result.stylelint.stylelintError = true;
  }

  var warningProperties /*: Object*/ = {
    severity: severity,
    rule: ruleName
  };
  if (node) {
    warningProperties.node = node;
  }
  if (index) {
    warningProperties.index = index;
  }
  if (word) {
    warningProperties.word = word;
  }

  var warningMessage = _.get(result.stylelint, ["customMessages", ruleName], message);
  result.warn(warningMessage, warningProperties);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvcmVwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7O0FBRVosSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOzs7Ozs7Ozs7Ozs7OztBQWMzQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsU0FBUzs7Ozs7Ozs7MENBUS9CO0FBQ0gsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQTtBQUNuQyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFBO0FBQy9CLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7QUFDakMsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQTtBQUMzQixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFBO0FBQzNCLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUE7QUFDN0IsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQTs7QUFFM0IsUUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQTs7O0FBR3pDLE1BQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssT0FBTyxFQUFFO0FBQ25GLFdBQU07R0FDUDs7OztBQUlELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFMLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFBOztBQUV6RCxNQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUU7QUFDdkUsUUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFBO0FBQy9GLFNBQUssSUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO0FBQzFCOzs7O0FBSUEsV0FBSyxDQUFDLEtBQUssSUFBSSxTQUFTLEtBQUssS0FBSyxDQUFDLEdBQUcsSUFBSSxTQUFTLElBQUksS0FBSyxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUEsQUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQSxBQUFDLEVBQUU7QUFDekksZUFBTTtPQUNQO0tBQ0Y7R0FDRjs7QUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBRSxnQkFBZ0IsRUFBRSxRQUFRLENBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTs7QUFFbEYsTUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxJQUFJLFFBQVEsS0FBSyxPQUFPLEVBQUU7QUFDNUQsVUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0dBQ3ZDOztBQUVELE1BQU0saUJBQWlCLGdCQUFlO0FBQ3BDLFlBQVEsRUFBUixRQUFRO0FBQ1IsUUFBSSxFQUFFLFFBQVE7R0FDZixDQUFBO0FBQ0QsTUFBSSxJQUFJLEVBQUU7QUFDUixxQkFBaUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQzlCO0FBQ0QsTUFBSSxLQUFLLEVBQUU7QUFDVCxxQkFBaUIsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0dBQ2hDO0FBQ0QsTUFBSSxJQUFJLEVBQUU7QUFDUixxQkFBaUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0dBQzlCOztBQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBRSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3ZGLFFBQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLENBQUE7Q0FDL0MsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL3JlcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKVxuXG4vKipcbiAqIFJlcG9ydCBhIHZpb2xhdGlvbi5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGFjY291bnRzIGZvciBgZGlzYWJsZWRSYW5nZXNgIGF0dGFjaGVkIHRvIHRoZSByZXN1bHQuXG4gKiBUaGF0IGlzLCBpZiB0aGUgcmVwb3J0ZWQgdmlvbGF0aW9uIGlzIHdpdGhpbiBhIGRpc2FibGVkUmFuZ2UsXG4gKiBpdCBpcyBpZ25vcmVkLiBPdGhlcndpc2UsIGl0IGlzIGF0dGFjaGVkIHRvIHRoZSByZXN1bHQgYXMgYVxuICogcG9zdGNzcyB3YXJuaW5nLlxuICpcbiAqIEl0IGFsc28gYWNjb3VudHMgZm9yIHRoZSBydWxlJ3Mgc2V2ZXJpdHkuXG4gKlxuICogWW91ICptdXN0KiBwYXNzICplaXRoZXIqIGEgbm9kZSBvciBhIGxpbmUgbnVtYmVyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2aW9sYXRpb24vKjoge1xuICBydWxlTmFtZTogc3RyaW5nLFxuICByZXN1bHQ6IE9iamVjdCxcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBub2RlOiBPYmplY3QsXG4gIGluZGV4PzogbnVtYmVyLFxuICB3b3JkPzogc3RyaW5nLFxuICBsaW5lPzogbnVtYmVyXG59Ki8pIHtcbiAgY29uc3QgcnVsZU5hbWUgPSB2aW9sYXRpb24ucnVsZU5hbWVcbiAgY29uc3QgcmVzdWx0ID0gdmlvbGF0aW9uLnJlc3VsdFxuICBjb25zdCBtZXNzYWdlID0gdmlvbGF0aW9uLm1lc3NhZ2VcbiAgY29uc3QgbGluZSA9IHZpb2xhdGlvbi5saW5lXG4gIGNvbnN0IG5vZGUgPSB2aW9sYXRpb24ubm9kZVxuICBjb25zdCBpbmRleCA9IHZpb2xhdGlvbi5pbmRleFxuICBjb25zdCB3b3JkID0gdmlvbGF0aW9uLndvcmRcblxuICByZXN1bHQuc3R5bGVsaW50ID0gcmVzdWx0LnN0eWxlbGludCB8fCB7fVxuXG4gIC8vIEluIHF1aWV0IG1vZGUsIG1lcmUgd2FybmluZ3MgYXJlIGlnbm9yZWRcbiAgaWYgKHJlc3VsdC5zdHlsZWxpbnQucXVpZXQgJiYgcmVzdWx0LnN0eWxlbGludC5ydWxlU2V2ZXJpdGllc1tydWxlTmFtZV0gIT09IFwiZXJyb3JcIikge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgYSBsaW5lIGlzIG5vdCBwYXNzZWQsIHVzZSB0aGUgbm9kZS5wb3NpdGlvbkJ5IG1ldGhvZCB0byBnZXQgdGhlXG4gIC8vIGxpbmUgbnVtYmVyIHRoYXQgdGhlIGNvbXBsYWludCBwZXJ0YWlucyB0b1xuICBjb25zdCBzdGFydExpbmUgPSBsaW5lIHx8IG5vZGUucG9zaXRpb25CeSh7IGluZGV4IH0pLmxpbmVcblxuICBpZiAocmVzdWx0LnN0eWxlbGludC5kaXNhYmxlZFJhbmdlcyAmJiAhcmVzdWx0LnN0eWxlbGludC5pZ25vcmVEaXNhYmxlcykge1xuICAgIGNvbnN0IHJhbmdlcyA9IHJlc3VsdC5zdHlsZWxpbnQuZGlzYWJsZWRSYW5nZXNbcnVsZU5hbWVdIHx8IHJlc3VsdC5zdHlsZWxpbnQuZGlzYWJsZWRSYW5nZXMuYWxsXG4gICAgZm9yIChjb25zdCByYW5nZSBvZiByYW5nZXMpIHtcbiAgICAgIGlmIChcbiAgICAgIC8vIElmIHRoZSB2aW9sYXRpb24gaXMgd2l0aGluIGEgZGlzYWJsZWRSYW5nZSxcbiAgICAgIC8vIGFuZCB0aGF0IGRpc2FibGVkUmFuZ2UncyBydWxlcyBpbmNsdWRlIHRoaXMgb25lLFxuICAgICAgLy8gZG8gbm90IHJlZ2lzdGVyIGEgd2FybmluZ1xuICAgICAgcmFuZ2Uuc3RhcnQgPD0gc3RhcnRMaW5lICYmIChyYW5nZS5lbmQgPj0gc3RhcnRMaW5lIHx8IHJhbmdlLmVuZCA9PT0gdW5kZWZpbmVkKSAmJiAoIXJhbmdlLnJ1bGVzIHx8IHJhbmdlLnJ1bGVzLmluZGV4T2YocnVsZU5hbWUpICE9PSAtMSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgc2V2ZXJpdHkgPSBfLmdldChyZXN1bHQuc3R5bGVsaW50LCBbIFwicnVsZVNldmVyaXRpZXNcIiwgcnVsZU5hbWUgXSwgXCJpZ25vcmVcIilcblxuICBpZiAoIXJlc3VsdC5zdHlsZWxpbnQuc3R5bGVsaW50RXJyb3IgJiYgc2V2ZXJpdHkgPT09IFwiZXJyb3JcIikge1xuICAgIHJlc3VsdC5zdHlsZWxpbnQuc3R5bGVsaW50RXJyb3IgPSB0cnVlXG4gIH1cblxuICBjb25zdCB3YXJuaW5nUHJvcGVydGllcy8qOiBPYmplY3QqLyA9IHtcbiAgICBzZXZlcml0eSxcbiAgICBydWxlOiBydWxlTmFtZSxcbiAgfVxuICBpZiAobm9kZSkge1xuICAgIHdhcm5pbmdQcm9wZXJ0aWVzLm5vZGUgPSBub2RlXG4gIH1cbiAgaWYgKGluZGV4KSB7XG4gICAgd2FybmluZ1Byb3BlcnRpZXMuaW5kZXggPSBpbmRleFxuICB9XG4gIGlmICh3b3JkKSB7XG4gICAgd2FybmluZ1Byb3BlcnRpZXMud29yZCA9IHdvcmRcbiAgfVxuXG4gIGNvbnN0IHdhcm5pbmdNZXNzYWdlID0gXy5nZXQocmVzdWx0LnN0eWxlbGludCwgWyBcImN1c3RvbU1lc3NhZ2VzXCIsIHJ1bGVOYW1lIF0sIG1lc3NhZ2UpXG4gIHJlc3VsdC53YXJuKHdhcm5pbmdNZXNzYWdlLCB3YXJuaW5nUHJvcGVydGllcylcbn1cbiJdfQ==