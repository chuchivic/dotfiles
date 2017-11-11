
"use strict";

/**
 * Check if a string contains at least one empty line
 */
module.exports = function (string /*:: ?: string*/) /*: boolean*/{
  if (string === "" || string === undefined) return false;
  return string.indexOf("\n\n") !== -1 || string.indexOf("\n\r\n") !== -1;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaGFzRW1wdHlMaW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7Ozs7O0FBS1osTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLE1BQU0sZ0NBQStCO0FBQzlELE1BQUksTUFBTSxLQUFLLEVBQUUsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFLE9BQU8sS0FBSyxDQUFBO0FBQ3ZELFNBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0NBQ3hFLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9oYXNFbXB0eUxpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuLyoqXG4gKiBDaGVjayBpZiBhIHN0cmluZyBjb250YWlucyBhdCBsZWFzdCBvbmUgZW1wdHkgbGluZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChzdHJpbmcvKjo6ID86IHN0cmluZyovKS8qOiBib29sZWFuKi8ge1xuICBpZiAoc3RyaW5nID09PSBcIlwiIHx8IHN0cmluZyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHN0cmluZy5pbmRleE9mKFwiXFxuXFxuXCIpICE9PSAtMSB8fCBzdHJpbmcuaW5kZXhPZihcIlxcblxcclxcblwiKSAhPT0gLTFcbn1cbiJdfQ==