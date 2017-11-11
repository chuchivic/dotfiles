
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
                                     }*/
) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvcmVwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQWM1QixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQ2YsU0FBUzs7Ozs7Ozs7O0VBU1Q7QUFDQSxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO0FBQ3BDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDaEMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztBQUNsQyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQzVCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFDNUIsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztBQUM5QixNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDOztBQUU1QixRQUFNLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDOzs7QUFHMUMsTUFDRSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssSUFDdEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssT0FBTyxFQUNyRDtBQUNBLFdBQU87R0FDUjs7OztBQUlELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSyxFQUFMLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDOztBQUUxRCxNQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUU7QUFDdkUsUUFBTSxNQUFNLEdBQ1YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQ3pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQztBQUN0QyxTQUFLLElBQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtBQUMxQjs7OztBQUlFLFdBQUssQ0FBQyxLQUFLLElBQUksU0FBUyxLQUN2QixLQUFLLENBQUMsR0FBRyxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQSxBQUFDLEtBQ2xELENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQSxBQUFDLEVBQ3REO0FBQ0EsZUFBTztPQUNSO0tBQ0Y7R0FDRjs7QUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUNwQixNQUFNLENBQUMsU0FBUyxFQUNoQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxFQUM1QixRQUFRLENBQ1QsQ0FBQzs7QUFFRixNQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLElBQUksUUFBUSxLQUFLLE9BQU8sRUFBRTtBQUM1RCxVQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7R0FDeEM7O0FBRUQsTUFBTSxpQkFBaUIsZ0JBQWdCO0FBQ3JDLFlBQVEsRUFBUixRQUFRO0FBQ1IsUUFBSSxFQUFFLFFBQVE7R0FDZixDQUFDO0FBQ0YsTUFBSSxJQUFJLEVBQUU7QUFDUixxQkFBaUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0dBQy9CO0FBQ0QsTUFBSSxLQUFLLEVBQUU7QUFDVCxxQkFBaUIsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQ2pDO0FBQ0QsTUFBSSxJQUFJLEVBQUU7QUFDUixxQkFBaUIsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0dBQy9COztBQUVELE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQzFCLE1BQU0sQ0FBQyxTQUFTLEVBQ2hCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLEVBQzVCLE9BQU8sQ0FDUixDQUFDO0FBQ0YsUUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztDQUNoRCxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvcmVwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuLyoqXG4gKiBSZXBvcnQgYSB2aW9sYXRpb24uXG4gKlxuICogVGhpcyBmdW5jdGlvbiBhY2NvdW50cyBmb3IgYGRpc2FibGVkUmFuZ2VzYCBhdHRhY2hlZCB0byB0aGUgcmVzdWx0LlxuICogVGhhdCBpcywgaWYgdGhlIHJlcG9ydGVkIHZpb2xhdGlvbiBpcyB3aXRoaW4gYSBkaXNhYmxlZFJhbmdlLFxuICogaXQgaXMgaWdub3JlZC4gT3RoZXJ3aXNlLCBpdCBpcyBhdHRhY2hlZCB0byB0aGUgcmVzdWx0IGFzIGFcbiAqIHBvc3Rjc3Mgd2FybmluZy5cbiAqXG4gKiBJdCBhbHNvIGFjY291bnRzIGZvciB0aGUgcnVsZSdzIHNldmVyaXR5LlxuICpcbiAqIFlvdSAqbXVzdCogcGFzcyAqZWl0aGVyKiBhIG5vZGUgb3IgYSBsaW5lIG51bWJlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgdmlvbGF0aW9uIC8qOiB7XG4gIHJ1bGVOYW1lOiBzdHJpbmcsXG4gIHJlc3VsdDogT2JqZWN0LFxuICBtZXNzYWdlOiBzdHJpbmcsXG4gIG5vZGU6IE9iamVjdCxcbiAgaW5kZXg/OiBudW1iZXIsXG4gIHdvcmQ/OiBzdHJpbmcsXG4gIGxpbmU/OiBudW1iZXJcbn0qL1xuKSB7XG4gIGNvbnN0IHJ1bGVOYW1lID0gdmlvbGF0aW9uLnJ1bGVOYW1lO1xuICBjb25zdCByZXN1bHQgPSB2aW9sYXRpb24ucmVzdWx0O1xuICBjb25zdCBtZXNzYWdlID0gdmlvbGF0aW9uLm1lc3NhZ2U7XG4gIGNvbnN0IGxpbmUgPSB2aW9sYXRpb24ubGluZTtcbiAgY29uc3Qgbm9kZSA9IHZpb2xhdGlvbi5ub2RlO1xuICBjb25zdCBpbmRleCA9IHZpb2xhdGlvbi5pbmRleDtcbiAgY29uc3Qgd29yZCA9IHZpb2xhdGlvbi53b3JkO1xuXG4gIHJlc3VsdC5zdHlsZWxpbnQgPSByZXN1bHQuc3R5bGVsaW50IHx8IHt9O1xuXG4gIC8vIEluIHF1aWV0IG1vZGUsIG1lcmUgd2FybmluZ3MgYXJlIGlnbm9yZWRcbiAgaWYgKFxuICAgIHJlc3VsdC5zdHlsZWxpbnQucXVpZXQgJiZcbiAgICByZXN1bHQuc3R5bGVsaW50LnJ1bGVTZXZlcml0aWVzW3J1bGVOYW1lXSAhPT0gXCJlcnJvclwiXG4gICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIGEgbGluZSBpcyBub3QgcGFzc2VkLCB1c2UgdGhlIG5vZGUucG9zaXRpb25CeSBtZXRob2QgdG8gZ2V0IHRoZVxuICAvLyBsaW5lIG51bWJlciB0aGF0IHRoZSBjb21wbGFpbnQgcGVydGFpbnMgdG9cbiAgY29uc3Qgc3RhcnRMaW5lID0gbGluZSB8fCBub2RlLnBvc2l0aW9uQnkoeyBpbmRleCB9KS5saW5lO1xuXG4gIGlmIChyZXN1bHQuc3R5bGVsaW50LmRpc2FibGVkUmFuZ2VzICYmICFyZXN1bHQuc3R5bGVsaW50Lmlnbm9yZURpc2FibGVzKSB7XG4gICAgY29uc3QgcmFuZ2VzID1cbiAgICAgIHJlc3VsdC5zdHlsZWxpbnQuZGlzYWJsZWRSYW5nZXNbcnVsZU5hbWVdIHx8XG4gICAgICByZXN1bHQuc3R5bGVsaW50LmRpc2FibGVkUmFuZ2VzLmFsbDtcbiAgICBmb3IgKGNvbnN0IHJhbmdlIG9mIHJhbmdlcykge1xuICAgICAgaWYgKFxuICAgICAgICAvLyBJZiB0aGUgdmlvbGF0aW9uIGlzIHdpdGhpbiBhIGRpc2FibGVkUmFuZ2UsXG4gICAgICAgIC8vIGFuZCB0aGF0IGRpc2FibGVkUmFuZ2UncyBydWxlcyBpbmNsdWRlIHRoaXMgb25lLFxuICAgICAgICAvLyBkbyBub3QgcmVnaXN0ZXIgYSB3YXJuaW5nXG4gICAgICAgIHJhbmdlLnN0YXJ0IDw9IHN0YXJ0TGluZSAmJlxuICAgICAgICAocmFuZ2UuZW5kID49IHN0YXJ0TGluZSB8fCByYW5nZS5lbmQgPT09IHVuZGVmaW5lZCkgJiZcbiAgICAgICAgKCFyYW5nZS5ydWxlcyB8fCByYW5nZS5ydWxlcy5pbmRleE9mKHJ1bGVOYW1lKSAhPT0gLTEpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNldmVyaXR5ID0gXy5nZXQoXG4gICAgcmVzdWx0LnN0eWxlbGludCxcbiAgICBbXCJydWxlU2V2ZXJpdGllc1wiLCBydWxlTmFtZV0sXG4gICAgXCJpZ25vcmVcIlxuICApO1xuXG4gIGlmICghcmVzdWx0LnN0eWxlbGludC5zdHlsZWxpbnRFcnJvciAmJiBzZXZlcml0eSA9PT0gXCJlcnJvclwiKSB7XG4gICAgcmVzdWx0LnN0eWxlbGludC5zdHlsZWxpbnRFcnJvciA9IHRydWU7XG4gIH1cblxuICBjb25zdCB3YXJuaW5nUHJvcGVydGllcyAvKjogT2JqZWN0Ki8gPSB7XG4gICAgc2V2ZXJpdHksXG4gICAgcnVsZTogcnVsZU5hbWVcbiAgfTtcbiAgaWYgKG5vZGUpIHtcbiAgICB3YXJuaW5nUHJvcGVydGllcy5ub2RlID0gbm9kZTtcbiAgfVxuICBpZiAoaW5kZXgpIHtcbiAgICB3YXJuaW5nUHJvcGVydGllcy5pbmRleCA9IGluZGV4O1xuICB9XG4gIGlmICh3b3JkKSB7XG4gICAgd2FybmluZ1Byb3BlcnRpZXMud29yZCA9IHdvcmQ7XG4gIH1cblxuICBjb25zdCB3YXJuaW5nTWVzc2FnZSA9IF8uZ2V0KFxuICAgIHJlc3VsdC5zdHlsZWxpbnQsXG4gICAgW1wiY3VzdG9tTWVzc2FnZXNcIiwgcnVsZU5hbWVdLFxuICAgIG1lc3NhZ2VcbiAgKTtcbiAgcmVzdWx0Lndhcm4od2FybmluZ01lc3NhZ2UsIHdhcm5pbmdQcm9wZXJ0aWVzKTtcbn07XG4iXX0=