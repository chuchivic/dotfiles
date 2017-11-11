
"use strict";

var hasLessInterpolation = require("../utils/hasLessInterpolation");
var hasPsvInterpolation = require("../utils/hasPsvInterpolation");
var hasScssInterpolation = require("../utils/hasScssInterpolation");

/**
 * Check whether a URL is standard
 */
module.exports = function (url /*: string*/) /*: boolean*/{
  if (url.length === 0) {
    return true;
  }

  // Sass interpolation works anywhere
  if (hasScssInterpolation(url) || hasPsvInterpolation(url)) {
    return false;
  }

  // Inside `'` and `"` work only LESS interpolation
  if (url[0] === "'" && url[url.length - 1] === "'" || url[0] === '"' && url[url.length - 1] === '"') {
    if (hasLessInterpolation(url)) {
      return false;
    }

    return true;
  }

  // Less variable works only at the beginning
  // Check is less variable, allow use '@url/some/path'
  // https://github.com/less/less.js/blob/3.x/lib/less/parser/parser.js#L547
  if (url[0] === "@" && /^@@?[\w-]+$/.test(url)) {
    return false;
  }

  // In url without quotes scss variable can be everywhere
  // But in this case it is allowed to use only specific characters
  // Also forbidden "/" at the end of url
  if (url.indexOf("$") !== -1 && /^[$\sA-Za-z0-9+-/*_'"/]+$/.test(url) && url[url.length - 1] !== "/") {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFVybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDdEUsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUNwRSxJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFDOzs7OztBQUt0RSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsR0FBRyw0QkFBNkI7QUFDeEQsTUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNwQixXQUFPLElBQUksQ0FBQztHQUNiOzs7QUFHRCxNQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pELFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQ0UsQUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFDN0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEFBQUMsRUFDL0M7QUFDQSxRQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLGFBQU8sS0FBSyxDQUFDO0tBQ2Q7O0FBRUQsV0FBTyxJQUFJLENBQUM7R0FDYjs7Ozs7QUFLRCxNQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM3QyxXQUFPLEtBQUssQ0FBQztHQUNkOzs7OztBQUtELE1BQ0UsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFDdkIsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUNyQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQzNCO0FBQ0EsV0FBTyxLQUFLLENBQUM7R0FDZDs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9pc1N0YW5kYXJkU3ludGF4VXJsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBoYXNMZXNzSW50ZXJwb2xhdGlvbiA9IHJlcXVpcmUoXCIuLi91dGlscy9oYXNMZXNzSW50ZXJwb2xhdGlvblwiKTtcbmNvbnN0IGhhc1BzdkludGVycG9sYXRpb24gPSByZXF1aXJlKFwiLi4vdXRpbHMvaGFzUHN2SW50ZXJwb2xhdGlvblwiKTtcbmNvbnN0IGhhc1Njc3NJbnRlcnBvbGF0aW9uID0gcmVxdWlyZShcIi4uL3V0aWxzL2hhc1Njc3NJbnRlcnBvbGF0aW9uXCIpO1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBVUkwgaXMgc3RhbmRhcmRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwgLyo6IHN0cmluZyovKSAvKjogYm9vbGVhbiovIHtcbiAgaWYgKHVybC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFNhc3MgaW50ZXJwb2xhdGlvbiB3b3JrcyBhbnl3aGVyZVxuICBpZiAoaGFzU2Nzc0ludGVycG9sYXRpb24odXJsKSB8fCBoYXNQc3ZJbnRlcnBvbGF0aW9uKHVybCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJbnNpZGUgYCdgIGFuZCBgXCJgIHdvcmsgb25seSBMRVNTIGludGVycG9sYXRpb25cbiAgaWYgKFxuICAgICh1cmxbMF0gPT09IFwiJ1wiICYmIHVybFt1cmwubGVuZ3RoIC0gMV0gPT09IFwiJ1wiKSB8fFxuICAgICh1cmxbMF0gPT09ICdcIicgJiYgdXJsW3VybC5sZW5ndGggLSAxXSA9PT0gJ1wiJylcbiAgKSB7XG4gICAgaWYgKGhhc0xlc3NJbnRlcnBvbGF0aW9uKHVybCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIExlc3MgdmFyaWFibGUgd29ya3Mgb25seSBhdCB0aGUgYmVnaW5uaW5nXG4gIC8vIENoZWNrIGlzIGxlc3MgdmFyaWFibGUsIGFsbG93IHVzZSAnQHVybC9zb21lL3BhdGgnXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9sZXNzL2xlc3MuanMvYmxvYi8zLngvbGliL2xlc3MvcGFyc2VyL3BhcnNlci5qcyNMNTQ3XG4gIGlmICh1cmxbMF0gPT09IFwiQFwiICYmIC9eQEA/W1xcdy1dKyQvLnRlc3QodXJsKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEluIHVybCB3aXRob3V0IHF1b3RlcyBzY3NzIHZhcmlhYmxlIGNhbiBiZSBldmVyeXdoZXJlXG4gIC8vIEJ1dCBpbiB0aGlzIGNhc2UgaXQgaXMgYWxsb3dlZCB0byB1c2Ugb25seSBzcGVjaWZpYyBjaGFyYWN0ZXJzXG4gIC8vIEFsc28gZm9yYmlkZGVuIFwiL1wiIGF0IHRoZSBlbmQgb2YgdXJsXG4gIGlmIChcbiAgICB1cmwuaW5kZXhPZihcIiRcIikgIT09IC0xICYmXG4gICAgL15bJFxcc0EtWmEtejAtOSstLypfJ1wiL10rJC8udGVzdCh1cmwpICYmXG4gICAgdXJsW3VybC5sZW5ndGggLSAxXSAhPT0gXCIvXCJcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIl19