
"use strict";

var normalizeRuleSettings = require("../normalizeRuleSettings");
var Result = require("postcss/lib/result");
var rules = require("../rules");

// Useful for third-party code (e.g. plugins) to run a PostCSS Root
// against a specific rule and do something with the warnings
module.exports = function (options, /*: {
                                    ruleName: string,
                                    ruleSettings: stylelint$configRuleSettings,
                                    root: Object,
                                    }*/
callback /*: Function*/
) {
  if (!options) throw new Error("checkAgainstRule requires an options object with 'ruleName', 'ruleSettings', and 'root' properties");
  if (!callback) throw new Error("checkAgainstRule requires a callback");
  if (!options.ruleName) throw new Error("checkAgainstRule requires a 'ruleName' option");
  if (!rules[options.ruleName]) throw new Error("Rule '" + options.ruleName + "' does not exist");
  if (!options.ruleSettings) throw new Error("checkAgainstRule requires a 'ruleSettings' option");
  if (!options.root) throw new Error("checkAgainstRule requires a 'root' option");

  var settings = normalizeRuleSettings(options.ruleSettings, options.ruleName);
  if (!settings) {
    return;
  }

  var tmpPostcssResult = new Result();
  rules[options.ruleName](settings[0], settings[1], {})(options.root, tmpPostcssResult);
  tmpPostcssResult.warnings().forEach(callback);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvY2hlY2tBZ2FpbnN0UnVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDbEUsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDN0MsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDOzs7O0FBSWxDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFDZixPQUFPOzs7OztBQUtQLFFBQVE7RUFDUjtBQUNBLE1BQUksQ0FBQyxPQUFPLEVBQ1YsTUFBTSxJQUFJLEtBQUssQ0FDYixvR0FBb0csQ0FDckcsQ0FBQztBQUNKLE1BQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQ3ZFLE1BQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7QUFDbkUsTUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQzFCLE1BQU0sSUFBSSxLQUFLLFlBQVUsT0FBTyxDQUFDLFFBQVEsc0JBQW1CLENBQUM7QUFDL0QsTUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztBQUN2RSxNQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7O0FBRS9ELE1BQU0sUUFBUSxHQUFHLHFCQUFxQixDQUNwQyxPQUFPLENBQUMsWUFBWSxFQUNwQixPQUFPLENBQUMsUUFBUSxDQUNqQixDQUFDO0FBQ0YsTUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLFdBQU87R0FDUjs7QUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7QUFDdEMsT0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNuRCxPQUFPLENBQUMsSUFBSSxFQUNaLGdCQUFnQixDQUNqQixDQUFDO0FBQ0Ysa0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQy9DLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9jaGVja0FnYWluc3RSdWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBub3JtYWxpemVSdWxlU2V0dGluZ3MgPSByZXF1aXJlKFwiLi4vbm9ybWFsaXplUnVsZVNldHRpbmdzXCIpO1xuY29uc3QgUmVzdWx0ID0gcmVxdWlyZShcInBvc3Rjc3MvbGliL3Jlc3VsdFwiKTtcbmNvbnN0IHJ1bGVzID0gcmVxdWlyZShcIi4uL3J1bGVzXCIpO1xuXG4vLyBVc2VmdWwgZm9yIHRoaXJkLXBhcnR5IGNvZGUgKGUuZy4gcGx1Z2lucykgdG8gcnVuIGEgUG9zdENTUyBSb290XG4vLyBhZ2FpbnN0IGEgc3BlY2lmaWMgcnVsZSBhbmQgZG8gc29tZXRoaW5nIHdpdGggdGhlIHdhcm5pbmdzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFxuICBvcHRpb25zIC8qOiB7XG4gICAgcnVsZU5hbWU6IHN0cmluZyxcbiAgICBydWxlU2V0dGluZ3M6IHN0eWxlbGludCRjb25maWdSdWxlU2V0dGluZ3MsXG4gICAgcm9vdDogT2JqZWN0LFxuICB9Ki8sXG4gIGNhbGxiYWNrIC8qOiBGdW5jdGlvbiovXG4pIHtcbiAgaWYgKCFvcHRpb25zKVxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIFwiY2hlY2tBZ2FpbnN0UnVsZSByZXF1aXJlcyBhbiBvcHRpb25zIG9iamVjdCB3aXRoICdydWxlTmFtZScsICdydWxlU2V0dGluZ3MnLCBhbmQgJ3Jvb3QnIHByb3BlcnRpZXNcIlxuICAgICk7XG4gIGlmICghY2FsbGJhY2spIHRocm93IG5ldyBFcnJvcihcImNoZWNrQWdhaW5zdFJ1bGUgcmVxdWlyZXMgYSBjYWxsYmFja1wiKTtcbiAgaWYgKCFvcHRpb25zLnJ1bGVOYW1lKVxuICAgIHRocm93IG5ldyBFcnJvcihcImNoZWNrQWdhaW5zdFJ1bGUgcmVxdWlyZXMgYSAncnVsZU5hbWUnIG9wdGlvblwiKTtcbiAgaWYgKCFydWxlc1tvcHRpb25zLnJ1bGVOYW1lXSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFJ1bGUgJyR7b3B0aW9ucy5ydWxlTmFtZX0nIGRvZXMgbm90IGV4aXN0YCk7XG4gIGlmICghb3B0aW9ucy5ydWxlU2V0dGluZ3MpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY2hlY2tBZ2FpbnN0UnVsZSByZXF1aXJlcyBhICdydWxlU2V0dGluZ3MnIG9wdGlvblwiKTtcbiAgaWYgKCFvcHRpb25zLnJvb3QpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiY2hlY2tBZ2FpbnN0UnVsZSByZXF1aXJlcyBhICdyb290JyBvcHRpb25cIik7XG5cbiAgY29uc3Qgc2V0dGluZ3MgPSBub3JtYWxpemVSdWxlU2V0dGluZ3MoXG4gICAgb3B0aW9ucy5ydWxlU2V0dGluZ3MsXG4gICAgb3B0aW9ucy5ydWxlTmFtZVxuICApO1xuICBpZiAoIXNldHRpbmdzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgdG1wUG9zdGNzc1Jlc3VsdCA9IG5ldyBSZXN1bHQoKTtcbiAgcnVsZXNbb3B0aW9ucy5ydWxlTmFtZV0oc2V0dGluZ3NbMF0sIHNldHRpbmdzWzFdLCB7fSkoXG4gICAgb3B0aW9ucy5yb290LFxuICAgIHRtcFBvc3Rjc3NSZXN1bHRcbiAgKTtcbiAgdG1wUG9zdGNzc1Jlc3VsdC53YXJuaW5ncygpLmZvckVhY2goY2FsbGJhY2spO1xufTtcbiJdfQ==