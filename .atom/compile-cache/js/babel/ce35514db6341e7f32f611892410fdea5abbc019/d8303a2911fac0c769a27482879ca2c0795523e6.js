
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
  if (url[0] === "'" && url[url.length - 1] === "'" || url[0] === "\"" && url[url.length - 1] === "\"") {
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
  if (url.indexOf("$") !== -1 && /^[\$\sA-Za-z0-9+-/*_'"\/]+$/.test(url) && url[url.length - 1] !== "/") {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFVybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUE7QUFDckUsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQTtBQUNuRSxJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQywrQkFBK0IsQ0FBQyxDQUFBOzs7OztBQUtyRSxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsR0FBRyw0QkFBMkI7QUFDdkQsTUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNwQixXQUFPLElBQUksQ0FBQTtHQUNaOzs7QUFHRCxNQUFJLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3pELFdBQU8sS0FBSyxDQUFBO0dBQ2I7OztBQUdELE1BQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDcEcsUUFBSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM3QixhQUFPLEtBQUssQ0FBQTtLQUNiOztBQUVELFdBQU8sSUFBSSxDQUFBO0dBQ1o7Ozs7O0FBS0QsTUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDN0MsV0FBTyxLQUFLLENBQUE7R0FDYjs7Ozs7QUFLRCxNQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksNkJBQTZCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNyRyxXQUFPLEtBQUssQ0FBQTtHQUNiOztBQUVELFNBQU8sSUFBSSxDQUFBO0NBQ1osQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzU3RhbmRhcmRTeW50YXhVcmwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgaGFzTGVzc0ludGVycG9sYXRpb24gPSByZXF1aXJlKFwiLi4vdXRpbHMvaGFzTGVzc0ludGVycG9sYXRpb25cIilcbmNvbnN0IGhhc1BzdkludGVycG9sYXRpb24gPSByZXF1aXJlKFwiLi4vdXRpbHMvaGFzUHN2SW50ZXJwb2xhdGlvblwiKVxuY29uc3QgaGFzU2Nzc0ludGVycG9sYXRpb24gPSByZXF1aXJlKFwiLi4vdXRpbHMvaGFzU2Nzc0ludGVycG9sYXRpb25cIilcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgVVJMIGlzIHN0YW5kYXJkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybC8qOiBzdHJpbmcqLykvKjogYm9vbGVhbiovIHtcbiAgaWYgKHVybC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gU2FzcyBpbnRlcnBvbGF0aW9uIHdvcmtzIGFueXdoZXJlXG4gIGlmIChoYXNTY3NzSW50ZXJwb2xhdGlvbih1cmwpIHx8IGhhc1BzdkludGVycG9sYXRpb24odXJsKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gSW5zaWRlIGAnYCBhbmQgYFwiYCB3b3JrIG9ubHkgTEVTUyBpbnRlcnBvbGF0aW9uXG4gIGlmICh1cmxbMF0gPT09IFwiJ1wiICYmIHVybFt1cmwubGVuZ3RoIC0gMV0gPT09IFwiJ1wiIHx8IHVybFswXSA9PT0gXCJcXFwiXCIgJiYgdXJsW3VybC5sZW5ndGggLSAxXSA9PT0gXCJcXFwiXCIpIHtcbiAgICBpZiAoaGFzTGVzc0ludGVycG9sYXRpb24odXJsKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8vIExlc3MgdmFyaWFibGUgd29ya3Mgb25seSBhdCB0aGUgYmVnaW5uaW5nXG4gIC8vIENoZWNrIGlzIGxlc3MgdmFyaWFibGUsIGFsbG93IHVzZSAnQHVybC9zb21lL3BhdGgnXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9sZXNzL2xlc3MuanMvYmxvYi8zLngvbGliL2xlc3MvcGFyc2VyL3BhcnNlci5qcyNMNTQ3XG4gIGlmICh1cmxbMF0gPT09IFwiQFwiICYmIC9eQEA/W1xcdy1dKyQvLnRlc3QodXJsKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gSW4gdXJsIHdpdGhvdXQgcXVvdGVzIHNjc3MgdmFyaWFibGUgY2FuIGJlIGV2ZXJ5d2hlcmVcbiAgLy8gQnV0IGluIHRoaXMgY2FzZSBpdCBpcyBhbGxvd2VkIHRvIHVzZSBvbmx5IHNwZWNpZmljIGNoYXJhY3RlcnNcbiAgLy8gQWxzbyBmb3JiaWRkZW4gXCIvXCIgYXQgdGhlIGVuZCBvZiB1cmxcbiAgaWYgKHVybC5pbmRleE9mKFwiJFwiKSAhPT0gLTEgJiYgL15bXFwkXFxzQS1aYS16MC05Ky0vKl8nXCJcXC9dKyQvLnRlc3QodXJsKSAmJiB1cmxbdXJsLmxlbmd0aCAtIDFdICE9PSBcIi9cIikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cbiJdfQ==