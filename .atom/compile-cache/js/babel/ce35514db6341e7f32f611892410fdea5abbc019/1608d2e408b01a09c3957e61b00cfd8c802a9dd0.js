
"use strict";

var _ = require("lodash");

module.exports = function (results /*: Array<stylelint$result>*/) /*: stylelint$needlessDisablesReport*/{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbmVlZGxlc3NEaXNhYmxlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFM0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLE9BQU8sc0VBQXFFO0FBQ3JHLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTs7QUFFakIsU0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sRUFBSTs7QUFFeEIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7QUFDMUIsYUFBTTtLQUNQOztBQUVELFFBQU0sTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFBO0FBQ3BELFFBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUE7O0FBRTdFLFFBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxhQUFNO0tBQ1A7O0FBRUQsVUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFDakMsVUFBTSxJQUFJLGdCQUFlLE9BQU8sQ0FBQyxJQUFJLENBQUE7O0FBRXJDLFVBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNsQyxVQUFJLFVBQVUsRUFBRTs7QUFFZCxhQUFLLElBQU0sS0FBSyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUN4QyxjQUFJLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBRTtBQUNwQyxpQkFBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDakIsbUJBQU07V0FDUDtTQUNGO09BQ0Y7O0FBRUQsV0FBSyxJQUFNLEtBQUssSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQzNDLFlBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO0FBQ3BDLGVBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2pCLGlCQUFNO1NBQ1A7T0FDRjtLQUNGLENBQUMsQ0FBQTs7QUFFRixVQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNyQyxlQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSyxFQUFJOztBQUUvQixZQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQzVELGlCQUFPLFdBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUE7U0FDMUUsQ0FBQyxDQUFBOzs7O0FBSUYsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUN2QyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7U0FDMUI7Ozs7O0FBS0QsWUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLG1CQUFtQixFQUFFO0FBQ3JDLFdBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsQ0FBQyxDQUFBO1NBQzdDO09BQ0YsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLFVBQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUUsT0FBTyxFQUFFLEtBQUssQ0FBRSxDQUFDLENBQUE7O0FBRTNELFVBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7R0FDcEIsQ0FBQyxDQUFBOztBQUVGLFNBQU8sTUFBTSxDQUFBO0NBQ2QsQ0FBQTs7QUFFRCxTQUFTLGdCQUFnQixDQUN2QixPQUFPOzs7O0FBSVAsS0FBSzs7Ozs7ZUFLUTtBQUNiLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJO01BQ3ZCLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFBOzs7QUFHckIsU0FBTyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQSxBQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtDQUM5SiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL25lZWRsZXNzRGlzYWJsZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVzdWx0cy8qOiBBcnJheTxzdHlsZWxpbnQkcmVzdWx0PiovKS8qOiBzdHlsZWxpbnQkbmVlZGxlc3NEaXNhYmxlc1JlcG9ydCovIHtcbiAgY29uc3QgcmVwb3J0ID0gW11cblxuICByZXN1bHRzLmZvckVhY2gocmVzdWx0ID0+IHtcbiAgICAvLyBGaWxlIHdpdGggYENzc1N5bnRheEVycm9yYCBoYXZlIG5vdCBgX3Bvc3Rjc3NSZXN1bHRgXG4gICAgaWYgKCFyZXN1bHQuX3Bvc3Rjc3NSZXN1bHQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHVudXNlZCA9IHsgc291cmNlOiByZXN1bHQuc291cmNlLCByYW5nZXM6IFtdIH1cbiAgICBjb25zdCByYW5nZURhdGEgPSBfLmNsb25lRGVlcChyZXN1bHQuX3Bvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LmRpc2FibGVkUmFuZ2VzKVxuXG4gICAgaWYgKCFyYW5nZURhdGEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJlc3VsdC53YXJuaW5ncy5mb3JFYWNoKHdhcm5pbmcgPT4ge1xuICAgICAgY29uc3QgcnVsZS8qOiBzdHJpbmcqLyA9IHdhcm5pbmcucnVsZVxuXG4gICAgICBjb25zdCBydWxlUmFuZ2VzID0gcmFuZ2VEYXRhW3J1bGVdXG4gICAgICBpZiAocnVsZVJhbmdlcykge1xuICAgICAgICAvLyBCYWNrIHRvIGZyb250IHNvIHdlIGdldCB0aGUgKmxhc3QqIHJhbmdlIHRoYXQgYXBwbGllcyB0byB0aGUgd2FybmluZ1xuICAgICAgICBmb3IgKGNvbnN0IHJhbmdlIG9mIHJ1bGVSYW5nZXMucmV2ZXJzZSgpKSB7XG4gICAgICAgICAgaWYgKGlzV2FybmluZ0luUmFuZ2Uod2FybmluZywgcmFuZ2UpKSB7XG4gICAgICAgICAgICByYW5nZS51c2VkID0gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgcmFuZ2Ugb2YgcmFuZ2VEYXRhLmFsbC5yZXZlcnNlKCkpIHtcbiAgICAgICAgaWYgKGlzV2FybmluZ0luUmFuZ2Uod2FybmluZywgcmFuZ2UpKSB7XG4gICAgICAgICAgcmFuZ2UudXNlZCA9IHRydWVcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBPYmplY3Qua2V5cyhyYW5nZURhdGEpLmZvckVhY2gocnVsZSA9PiB7XG4gICAgICByYW5nZURhdGFbcnVsZV0uZm9yRWFjaChyYW5nZSA9PiB7XG4gICAgICAgIC8vIElzIGFuIGVxdWl2YWxlbnQgcmFuZ2UgYWxyZWFkeSBtYXJrZWQgYXMgdW51c2VkP1xuICAgICAgICBjb25zdCBhbHJlYWR5TWFya2VkVW51c2VkID0gdW51c2VkLnJhbmdlcy5maW5kKHVudXNlZFJhbmdlID0+IHtcbiAgICAgICAgICByZXR1cm4gdW51c2VkUmFuZ2Uuc3RhcnQgPT09IHJhbmdlLnN0YXJ0ICYmIHVudXNlZFJhbmdlLmVuZCA9PT0gcmFuZ2UuZW5kXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gSWYgdGhpcyByYW5nZSBpcyB1bnVzZWQgYW5kIG5vIGVxdWl2YWxlbnQgaXMgbWFya2VkLFxuICAgICAgICAvLyBtYXJrIHRoaXMgcmFuZ2UgYXMgdW51c2VkXG4gICAgICAgIGlmICghcmFuZ2UudXNlZCAmJiAhYWxyZWFkeU1hcmtlZFVudXNlZCkge1xuICAgICAgICAgIHVudXNlZC5yYW5nZXMucHVzaChyYW5nZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoaXMgcmFuZ2UgaXMgdXNlZCBidXQgYW4gZXF1aXZhbGVudCBoYXMgYmVlbiBtYXJrZWQgYXMgdW51c2VkLFxuICAgICAgICAvLyByZW1vdmUgdGhhdCBlcXVpdmFsZW50LiBUaGlzIGNhbiBoYXBwZW4gYmVjYXVzZSBvZiB0aGUgZHVwbGljYXRpb25cbiAgICAgICAgLy8gb2YgcmFuZ2VzIGluIHJ1bGUtc3BlY2lmaWMgcmFuZ2Ugc2V0cyBhbmQgdGhlIFwiYWxsXCIgcmFuZ2Ugc2V0XG4gICAgICAgIGlmIChyYW5nZS51c2VkICYmIGFscmVhZHlNYXJrZWRVbnVzZWQpIHtcbiAgICAgICAgICBfLnJlbW92ZSh1bnVzZWQucmFuZ2VzLCBhbHJlYWR5TWFya2VkVW51c2VkKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB1bnVzZWQucmFuZ2VzID0gXy5zb3J0QnkodW51c2VkLnJhbmdlcywgWyBcInN0YXJ0XCIsIFwiZW5kXCIgXSlcblxuICAgIHJlcG9ydC5wdXNoKHVudXNlZClcbiAgfSlcblxuICByZXR1cm4gcmVwb3J0XG59XG5cbmZ1bmN0aW9uIGlzV2FybmluZ0luUmFuZ2UoXG4gIHdhcm5pbmcvKjoge1xuICAgIHJ1bGU6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gIH0qLyxcbiAgcmFuZ2UvKjoge1xuICAgIHJ1bGVzPzogQXJyYXk8c3RyaW5nPixcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIGVuZD86IG51bWJlcixcbiAgfSovXG4pLyo6IGJvb2xlYW4qLyB7XG4gIGNvbnN0IHJ1bGUgPSB3YXJuaW5nLnJ1bGUsXG4gICAgbGluZSA9IHdhcm5pbmcubGluZVxuXG4gIC8vIE5lZWQgdG8gY2hlY2sgaWYgcmFuZ2UuZW5kIGV4aXN0LCBiZWNhdXNlIGxpbmUgbnVtYmVyIHR5cGUgY2Fubm90IGJlIGNvbXBhcmVkIHRvIHVuZGVmaW5lZFxuICByZXR1cm4gcmFuZ2Uuc3RhcnQgPD0gbGluZSAmJiAocmFuZ2UuZW5kICE9PSB1bmRlZmluZWQgJiYgcmFuZ2UuZW5kID49IGxpbmUgfHwgcmFuZ2UuZW5kID09PSB1bmRlZmluZWQpICYmICghcmFuZ2UucnVsZXMgfHwgcmFuZ2UucnVsZXMuaW5kZXhPZihydWxlKSAhPT0gLTEpXG59XG4iXX0=