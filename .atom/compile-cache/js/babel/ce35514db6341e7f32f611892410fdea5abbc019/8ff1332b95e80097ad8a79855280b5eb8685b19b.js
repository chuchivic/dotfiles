
"use strict";

/**
 * Check whether a declaration is standard
 */
module.exports = function (decl /*: Object*/) /*: boolean*/{
  var prop = decl.prop,
      parent = decl.parent;

  // Declarations belong in a declaration block

  if (parent.type === "root") {
    return false;
  }

  // SCSS var (e.g. $var: x), nested list (e.g. $list: (x)) or nested map (e.g. $map: (key:value))
  if (prop[0] === "$") {
    return false;
  }

  // Less var (e.g. @var: x), but exclude variable interpolation (e.g. @{var})
  if (prop[0] === "@" && prop[1] !== "{") {
    return false;
  }

  // SCSS nested properties (e.g. border: { style: solid; color: red; })
  if (parent.selector && parent.selector[parent.selector.length - 1] === ":" && parent.selector.substring(0, 2) !== "--") {
    return false;
  }

  return true;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheERlY2xhcmF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7Ozs7O0FBS2IsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksNEJBQTZCO0FBQ3pELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO01BQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOzs7O0FBSXZCLE1BQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDMUIsV0FBTyxLQUFLLENBQUM7R0FDZDs7O0FBR0QsTUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ25CLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3RDLFdBQU8sS0FBSyxDQUFDO0dBQ2Q7OztBQUdELE1BQ0UsTUFBTSxDQUFDLFFBQVEsSUFDZixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFDbkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFDeEM7QUFDQSxXQUFPLEtBQUssQ0FBQztHQUNkOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzU3RhbmRhcmRTeW50YXhEZWNsYXJhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgZGVjbGFyYXRpb24gaXMgc3RhbmRhcmRcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkZWNsIC8qOiBPYmplY3QqLykgLyo6IGJvb2xlYW4qLyB7XG4gIGNvbnN0IHByb3AgPSBkZWNsLnByb3AsXG4gICAgcGFyZW50ID0gZGVjbC5wYXJlbnQ7XG5cbiAgLy8gRGVjbGFyYXRpb25zIGJlbG9uZyBpbiBhIGRlY2xhcmF0aW9uIGJsb2NrXG5cbiAgaWYgKHBhcmVudC50eXBlID09PSBcInJvb3RcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFNDU1MgdmFyIChlLmcuICR2YXI6IHgpLCBuZXN0ZWQgbGlzdCAoZS5nLiAkbGlzdDogKHgpKSBvciBuZXN0ZWQgbWFwIChlLmcuICRtYXA6IChrZXk6dmFsdWUpKVxuICBpZiAocHJvcFswXSA9PT0gXCIkXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBMZXNzIHZhciAoZS5nLiBAdmFyOiB4KSwgYnV0IGV4Y2x1ZGUgdmFyaWFibGUgaW50ZXJwb2xhdGlvbiAoZS5nLiBAe3Zhcn0pXG4gIGlmIChwcm9wWzBdID09PSBcIkBcIiAmJiBwcm9wWzFdICE9PSBcIntcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFNDU1MgbmVzdGVkIHByb3BlcnRpZXMgKGUuZy4gYm9yZGVyOiB7IHN0eWxlOiBzb2xpZDsgY29sb3I6IHJlZDsgfSlcbiAgaWYgKFxuICAgIHBhcmVudC5zZWxlY3RvciAmJlxuICAgIHBhcmVudC5zZWxlY3RvcltwYXJlbnQuc2VsZWN0b3IubGVuZ3RoIC0gMV0gPT09IFwiOlwiICYmXG4gICAgcGFyZW50LnNlbGVjdG9yLnN1YnN0cmluZygwLCAyKSAhPT0gXCItLVwiXG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcbiJdfQ==