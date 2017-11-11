
"use strict";

/**
 * Check if a string contains at least one empty line
 */
module.exports = function (string /*:: ?: string*/) /*: boolean*/{
  if (string === "" || string === undefined) return false;

  return (/\n[\r\t ]*\n/.test(string)
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaGFzRW1wdHlMaW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7Ozs7O0FBS2IsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLE1BQU0sZ0NBQWlDO0FBQy9ELE1BQUksTUFBTSxLQUFLLEVBQUUsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLE9BQU8sS0FBSyxDQUFDOztBQUV4RCxTQUFPLGVBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQUM7Q0FDcEMsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2hhc0VtcHR5TGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDaGVjayBpZiBhIHN0cmluZyBjb250YWlucyBhdCBsZWFzdCBvbmUgZW1wdHkgbGluZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cmluZyAvKjo6ID86IHN0cmluZyovKSAvKjogYm9vbGVhbiovIHtcbiAgaWYgKHN0cmluZyA9PT0gXCJcIiB8fCBzdHJpbmcgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiAvXFxuW1xcclxcdCBdKlxcbi8udGVzdChzdHJpbmcpO1xufTtcbiJdfQ==