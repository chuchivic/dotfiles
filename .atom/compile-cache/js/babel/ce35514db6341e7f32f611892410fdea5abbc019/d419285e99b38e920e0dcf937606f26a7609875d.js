
"use strict";

var _ = require("lodash");
var hasInterpolation = require("../utils/hasInterpolation");
/**
 * Check whether a property is standard
 */
module.exports = function (property /*: string*/) /*: boolean*/{
  // SCSS var (e.g. $var: x), list (e.g. $list: (x)) or map (e.g. $map: (key:value))
  if (property[0] === "$") {
    return false;
  }

  // Less var (e.g. @var: x)
  if (property[0] === "@") {
    return false;
  }

  // Less append property value with space (e.g. transform+_: scale(2))
  if (_.endsWith(property, "+") || _.endsWith(property, "+_")) {
    return false;
  }

  // SCSS or Less interpolation
  if (hasInterpolation(property)) {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheFByb3BlcnR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVCLElBQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7Ozs7QUFJOUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLFFBQVEsNEJBQTZCOztBQUU3RCxNQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDdkIsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsTUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDM0QsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsTUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUM5QixXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzU3RhbmRhcmRTeW50YXhQcm9wZXJ0eS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5jb25zdCBoYXNJbnRlcnBvbGF0aW9uID0gcmVxdWlyZShcIi4uL3V0aWxzL2hhc0ludGVycG9sYXRpb25cIik7XG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBwcm9wZXJ0eSBpcyBzdGFuZGFyZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BlcnR5IC8qOiBzdHJpbmcqLykgLyo6IGJvb2xlYW4qLyB7XG4gIC8vIFNDU1MgdmFyIChlLmcuICR2YXI6IHgpLCBsaXN0IChlLmcuICRsaXN0OiAoeCkpIG9yIG1hcCAoZS5nLiAkbWFwOiAoa2V5OnZhbHVlKSlcbiAgaWYgKHByb3BlcnR5WzBdID09PSBcIiRcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIExlc3MgdmFyIChlLmcuIEB2YXI6IHgpXG4gIGlmIChwcm9wZXJ0eVswXSA9PT0gXCJAXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBMZXNzIGFwcGVuZCBwcm9wZXJ0eSB2YWx1ZSB3aXRoIHNwYWNlIChlLmcuIHRyYW5zZm9ybStfOiBzY2FsZSgyKSlcbiAgaWYgKF8uZW5kc1dpdGgocHJvcGVydHksIFwiK1wiKSB8fCBfLmVuZHNXaXRoKHByb3BlcnR5LCBcIitfXCIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gU0NTUyBvciBMZXNzIGludGVycG9sYXRpb25cbiAgaWYgKGhhc0ludGVycG9sYXRpb24ocHJvcGVydHkpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuIl19