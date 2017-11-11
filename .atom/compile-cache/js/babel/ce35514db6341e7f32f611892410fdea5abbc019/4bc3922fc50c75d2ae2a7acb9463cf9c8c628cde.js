
"use strict";

/**
 * Check whether a function is standard
 */
module.exports = function (node /*: Object*/) /*: boolean*/{
  // Function nodes without names are things in parentheses like Sass lists
  if (!node.value) {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheEZ1bmN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7Ozs7O0FBS2IsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksNEJBQTZCOztBQUV6RCxNQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNmLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheEZ1bmN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBmdW5jdGlvbiBpcyBzdGFuZGFyZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5vZGUgLyo6IE9iamVjdCovKSAvKjogYm9vbGVhbiovIHtcbiAgLy8gRnVuY3Rpb24gbm9kZXMgd2l0aG91dCBuYW1lcyBhcmUgdGhpbmdzIGluIHBhcmVudGhlc2VzIGxpa2UgU2FzcyBsaXN0c1xuICBpZiAoIW5vZGUudmFsdWUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG4iXX0=