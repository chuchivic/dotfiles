
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheERlY2xhcmF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7Ozs7O0FBS1osTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQUksNEJBQTJCO0FBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO01BQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBOzs7O0FBSXRCLE1BQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDMUIsV0FBTyxLQUFLLENBQUE7R0FDYjs7O0FBR0QsTUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ25CLFdBQU8sS0FBSyxDQUFBO0dBQ2I7OztBQUdELE1BQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ3RDLFdBQU8sS0FBSyxDQUFBO0dBQ2I7OztBQUdELE1BQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO0FBQ3RILFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNTdGFuZGFyZFN5bnRheERlY2xhcmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIGRlY2xhcmF0aW9uIGlzIHN0YW5kYXJkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGRlY2wvKjogT2JqZWN0Ki8pLyo6IGJvb2xlYW4qLyB7XG4gIGNvbnN0IHByb3AgPSBkZWNsLnByb3AsXG4gICAgcGFyZW50ID0gZGVjbC5wYXJlbnRcblxuICAvLyBEZWNsYXJhdGlvbnMgYmVsb25nIGluIGEgZGVjbGFyYXRpb24gYmxvY2tcblxuICBpZiAocGFyZW50LnR5cGUgPT09IFwicm9vdFwiKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBTQ1NTIHZhciAoZS5nLiAkdmFyOiB4KSwgbmVzdGVkIGxpc3QgKGUuZy4gJGxpc3Q6ICh4KSkgb3IgbmVzdGVkIG1hcCAoZS5nLiAkbWFwOiAoa2V5OnZhbHVlKSlcbiAgaWYgKHByb3BbMF0gPT09IFwiJFwiKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvLyBMZXNzIHZhciAoZS5nLiBAdmFyOiB4KSwgYnV0IGV4Y2x1ZGUgdmFyaWFibGUgaW50ZXJwb2xhdGlvbiAoZS5nLiBAe3Zhcn0pXG4gIGlmIChwcm9wWzBdID09PSBcIkBcIiAmJiBwcm9wWzFdICE9PSBcIntcIikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gU0NTUyBuZXN0ZWQgcHJvcGVydGllcyAoZS5nLiBib3JkZXI6IHsgc3R5bGU6IHNvbGlkOyBjb2xvcjogcmVkOyB9KVxuICBpZiAocGFyZW50LnNlbGVjdG9yICYmIHBhcmVudC5zZWxlY3RvcltwYXJlbnQuc2VsZWN0b3IubGVuZ3RoIC0gMV0gPT09IFwiOlwiICYmIHBhcmVudC5zZWxlY3Rvci5zdWJzdHJpbmcoMCwgMikgIT09IFwiLS1cIikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cbiJdfQ==