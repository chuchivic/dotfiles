
"use strict";

var _ = require("lodash");

module.exports = function (results /*: Array<stylelint$result>*/
) /*: stylelint$needlessDisablesReport*/{
  var report = [];

  results.forEach(function (result) {
    // File with `CssSyntaxError` have not `_postcssResult`
    if (!result._postcssResult) {
      return;
    }

    var unused = { source: result.source, ranges: [] };
    var rangeData = _.cloneDeep(result._postcssResult.stylelint.disabledRanges);

    if (!rangeData) {
      return;
    }

    result.warnings.forEach(function (warning) {
      var rule /*: string*/ = warning.rule;

      var ruleRanges = rangeData[rule];
      if (ruleRanges) {
        // Back to front so we get the *last* range that applies to the warning
        for (var range of ruleRanges.reverse()) {
          if (isWarningInRange(warning, range)) {
            range.used = true;
            return;
          }
        }
      }

      for (var range of rangeData.all.reverse()) {
        if (isWarningInRange(warning, range)) {
          range.used = true;
          return;
        }
      }
    });

    Object.keys(rangeData).forEach(function (rule) {
      rangeData[rule].forEach(function (range) {
        // Is an equivalent range already marked as unused?
        var alreadyMarkedUnused = unused.ranges.find(function (unusedRange) {
          return unusedRange.start === range.start && unusedRange.end === range.end;
        });

        // If this range is unused and no equivalent is marked,
        // mark this range as unused
        if (!range.used && !alreadyMarkedUnused) {
          unused.ranges.push(range);
        }

        // If this range is used but an equivalent has been marked as unused,
        // remove that equivalent. This can happen because of the duplication
        // of ranges in rule-specific range sets and the "all" range set
        if (range.used && alreadyMarkedUnused) {
          _.remove(unused.ranges, alreadyMarkedUnused);
        }
      });
    });

    unused.ranges = _.sortBy(unused.ranges, ["start", "end"]);

    report.push(unused);
  });

  return report;
};

function isWarningInRange(warning, /*: {
                                   rule: string,
                                   line: number,
                                   }*/
range /*: {
      rules?: Array<string>,
      start: number,
      end?: number,
      }*/
) /*: boolean*/{
  var rule = warning.rule,
      line = warning.line;

  // Need to check if range.end exist, because line number type cannot be compared to undefined
  return range.start <= line && (range.end !== undefined && range.end >= line || range.end === undefined) && (!range.rules || range.rules.indexOf(rule) !== -1);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbmVlZGxlc3NEaXNhYmxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUNmLE9BQU87d0NBQ2dDO0FBQ3ZDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsU0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTs7QUFFeEIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7QUFDMUIsYUFBTztLQUNSOztBQUVELFFBQU0sTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ3JELFFBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQzNCLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FDL0MsQ0FBQzs7QUFFRixRQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2QsYUFBTztLQUNSOztBQUVELFVBQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQ2pDLFVBQU0sSUFBSSxnQkFBZ0IsT0FBTyxDQUFDLElBQUksQ0FBQzs7QUFFdkMsVUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLFVBQUksVUFBVSxFQUFFOztBQUVkLGFBQUssSUFBTSxLQUFLLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3hDLGNBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ3BDLGlCQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixtQkFBTztXQUNSO1NBQ0Y7T0FDRjs7QUFFRCxXQUFLLElBQU0sS0FBSyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDM0MsWUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDcEMsZUFBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsaUJBQU87U0FDUjtPQUNGO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ3JDLGVBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLEVBQUk7O0FBRS9CLFlBQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxXQUFXLEVBQUk7QUFDNUQsaUJBQ0UsV0FBVyxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FDbEU7U0FDSCxDQUFDLENBQUM7Ozs7QUFJSCxZQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQ3ZDLGdCQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMzQjs7Ozs7QUFLRCxZQUFJLEtBQUssQ0FBQyxJQUFJLElBQUksbUJBQW1CLEVBQUU7QUFDckMsV0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUM7U0FDOUM7T0FDRixDQUFDLENBQUM7S0FDSixDQUFDLENBQUM7O0FBRUgsVUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFMUQsVUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNyQixDQUFDLENBQUM7O0FBRUgsU0FBTyxNQUFNLENBQUM7Q0FDZixDQUFDOztBQUVGLFNBQVMsZ0JBQWdCLENBQ3ZCLE9BQU87Ozs7QUFJUCxLQUFLOzs7OztlQUtTO0FBQ2QsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUk7TUFDdkIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7OztBQUd0QixTQUNFLEtBQUssQ0FBQyxLQUFLLElBQUksSUFBSSxLQUNsQixBQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxJQUM1QyxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQSxBQUFDLEtBQ3pCLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQ2xEO0NBQ0giLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi9uZWVkbGVzc0Rpc2FibGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgcmVzdWx0cyAvKjogQXJyYXk8c3R5bGVsaW50JHJlc3VsdD4qL1xuKSAvKjogc3R5bGVsaW50JG5lZWRsZXNzRGlzYWJsZXNSZXBvcnQqLyB7XG4gIGNvbnN0IHJlcG9ydCA9IFtdO1xuXG4gIHJlc3VsdHMuZm9yRWFjaChyZXN1bHQgPT4ge1xuICAgIC8vIEZpbGUgd2l0aCBgQ3NzU3ludGF4RXJyb3JgIGhhdmUgbm90IGBfcG9zdGNzc1Jlc3VsdGBcbiAgICBpZiAoIXJlc3VsdC5fcG9zdGNzc1Jlc3VsdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHVudXNlZCA9IHsgc291cmNlOiByZXN1bHQuc291cmNlLCByYW5nZXM6IFtdIH07XG4gICAgY29uc3QgcmFuZ2VEYXRhID0gXy5jbG9uZURlZXAoXG4gICAgICByZXN1bHQuX3Bvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LmRpc2FibGVkUmFuZ2VzXG4gICAgKTtcblxuICAgIGlmICghcmFuZ2VEYXRhKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmVzdWx0Lndhcm5pbmdzLmZvckVhY2god2FybmluZyA9PiB7XG4gICAgICBjb25zdCBydWxlIC8qOiBzdHJpbmcqLyA9IHdhcm5pbmcucnVsZTtcblxuICAgICAgY29uc3QgcnVsZVJhbmdlcyA9IHJhbmdlRGF0YVtydWxlXTtcbiAgICAgIGlmIChydWxlUmFuZ2VzKSB7XG4gICAgICAgIC8vIEJhY2sgdG8gZnJvbnQgc28gd2UgZ2V0IHRoZSAqbGFzdCogcmFuZ2UgdGhhdCBhcHBsaWVzIHRvIHRoZSB3YXJuaW5nXG4gICAgICAgIGZvciAoY29uc3QgcmFuZ2Ugb2YgcnVsZVJhbmdlcy5yZXZlcnNlKCkpIHtcbiAgICAgICAgICBpZiAoaXNXYXJuaW5nSW5SYW5nZSh3YXJuaW5nLCByYW5nZSkpIHtcbiAgICAgICAgICAgIHJhbmdlLnVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IHJhbmdlIG9mIHJhbmdlRGF0YS5hbGwucmV2ZXJzZSgpKSB7XG4gICAgICAgIGlmIChpc1dhcm5pbmdJblJhbmdlKHdhcm5pbmcsIHJhbmdlKSkge1xuICAgICAgICAgIHJhbmdlLnVzZWQgPSB0cnVlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmtleXMocmFuZ2VEYXRhKS5mb3JFYWNoKHJ1bGUgPT4ge1xuICAgICAgcmFuZ2VEYXRhW3J1bGVdLmZvckVhY2gocmFuZ2UgPT4ge1xuICAgICAgICAvLyBJcyBhbiBlcXVpdmFsZW50IHJhbmdlIGFscmVhZHkgbWFya2VkIGFzIHVudXNlZD9cbiAgICAgICAgY29uc3QgYWxyZWFkeU1hcmtlZFVudXNlZCA9IHVudXNlZC5yYW5nZXMuZmluZCh1bnVzZWRSYW5nZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHVudXNlZFJhbmdlLnN0YXJ0ID09PSByYW5nZS5zdGFydCAmJiB1bnVzZWRSYW5nZS5lbmQgPT09IHJhbmdlLmVuZFxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElmIHRoaXMgcmFuZ2UgaXMgdW51c2VkIGFuZCBubyBlcXVpdmFsZW50IGlzIG1hcmtlZCxcbiAgICAgICAgLy8gbWFyayB0aGlzIHJhbmdlIGFzIHVudXNlZFxuICAgICAgICBpZiAoIXJhbmdlLnVzZWQgJiYgIWFscmVhZHlNYXJrZWRVbnVzZWQpIHtcbiAgICAgICAgICB1bnVzZWQucmFuZ2VzLnB1c2gocmFuZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhpcyByYW5nZSBpcyB1c2VkIGJ1dCBhbiBlcXVpdmFsZW50IGhhcyBiZWVuIG1hcmtlZCBhcyB1bnVzZWQsXG4gICAgICAgIC8vIHJlbW92ZSB0aGF0IGVxdWl2YWxlbnQuIFRoaXMgY2FuIGhhcHBlbiBiZWNhdXNlIG9mIHRoZSBkdXBsaWNhdGlvblxuICAgICAgICAvLyBvZiByYW5nZXMgaW4gcnVsZS1zcGVjaWZpYyByYW5nZSBzZXRzIGFuZCB0aGUgXCJhbGxcIiByYW5nZSBzZXRcbiAgICAgICAgaWYgKHJhbmdlLnVzZWQgJiYgYWxyZWFkeU1hcmtlZFVudXNlZCkge1xuICAgICAgICAgIF8ucmVtb3ZlKHVudXNlZC5yYW5nZXMsIGFscmVhZHlNYXJrZWRVbnVzZWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHVudXNlZC5yYW5nZXMgPSBfLnNvcnRCeSh1bnVzZWQucmFuZ2VzLCBbXCJzdGFydFwiLCBcImVuZFwiXSk7XG5cbiAgICByZXBvcnQucHVzaCh1bnVzZWQpO1xuICB9KTtcblxuICByZXR1cm4gcmVwb3J0O1xufTtcblxuZnVuY3Rpb24gaXNXYXJuaW5nSW5SYW5nZShcbiAgd2FybmluZyAvKjoge1xuICAgIHJ1bGU6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gIH0qLyxcbiAgcmFuZ2UgLyo6IHtcbiAgICBydWxlcz86IEFycmF5PHN0cmluZz4sXG4gICAgc3RhcnQ6IG51bWJlcixcbiAgICBlbmQ/OiBudW1iZXIsXG4gIH0qL1xuKSAvKjogYm9vbGVhbiovIHtcbiAgY29uc3QgcnVsZSA9IHdhcm5pbmcucnVsZSxcbiAgICBsaW5lID0gd2FybmluZy5saW5lO1xuXG4gIC8vIE5lZWQgdG8gY2hlY2sgaWYgcmFuZ2UuZW5kIGV4aXN0LCBiZWNhdXNlIGxpbmUgbnVtYmVyIHR5cGUgY2Fubm90IGJlIGNvbXBhcmVkIHRvIHVuZGVmaW5lZFxuICByZXR1cm4gKFxuICAgIHJhbmdlLnN0YXJ0IDw9IGxpbmUgJiZcbiAgICAoKHJhbmdlLmVuZCAhPT0gdW5kZWZpbmVkICYmIHJhbmdlLmVuZCA+PSBsaW5lKSB8fFxuICAgICAgcmFuZ2UuZW5kID09PSB1bmRlZmluZWQpICYmXG4gICAgKCFyYW5nZS5ydWxlcyB8fCByYW5nZS5ydWxlcy5pbmRleE9mKHJ1bGUpICE9PSAtMSlcbiAgKTtcbn1cbiJdfQ==