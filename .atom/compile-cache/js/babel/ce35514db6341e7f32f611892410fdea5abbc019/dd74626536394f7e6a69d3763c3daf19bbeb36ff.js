
"use strict";

/**
 * Find the at-rule in which a rule is nested.
 *
 * Returns `null` if the rule is not nested within an at-rule.
 */
module.exports = function findAtRuleContext(_x) {
  var _again = true;

  _function: while (_again) /*: postcss$rule */
  /*: ?postcss$node*/{
    var rule = _x;
    _again = false;

    var parent = rule.parent;

    if (parent.type === "root") {
      return null;
    }
    if (parent.type === "atrule") {
      return parent;
    }
    _x = parent;
    _again = true;
    parent = undefined;
    continue _function;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZmluZEF0UnVsZUNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7Ozs7OztBQU9iLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxpQkFBaUI7Ozs7cUJBRXJCO1FBRHBCLElBQUk7OztBQUVKLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRTNCLFFBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDMUIsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFFBQUksTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDNUIsYUFBTyxNQUFNLENBQUM7S0FDZjtTQUN3QixNQUFNOztBQVJ6QixVQUFNOztHQVNiO0NBQUEsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2ZpbmRBdFJ1bGVDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEZpbmQgdGhlIGF0LXJ1bGUgaW4gd2hpY2ggYSBydWxlIGlzIG5lc3RlZC5cbiAqXG4gKiBSZXR1cm5zIGBudWxsYCBpZiB0aGUgcnVsZSBpcyBub3QgbmVzdGVkIHdpdGhpbiBhbiBhdC1ydWxlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmRBdFJ1bGVDb250ZXh0KFxuICBydWxlIC8qOiBwb3N0Y3NzJHJ1bGUgKi9cbikgLyo6ID9wb3N0Y3NzJG5vZGUqLyB7XG4gIGNvbnN0IHBhcmVudCA9IHJ1bGUucGFyZW50O1xuXG4gIGlmIChwYXJlbnQudHlwZSA9PT0gXCJyb290XCIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAocGFyZW50LnR5cGUgPT09IFwiYXRydWxlXCIpIHtcbiAgICByZXR1cm4gcGFyZW50O1xuICB9XG4gIHJldHVybiBmaW5kQXRSdWxlQ29udGV4dChwYXJlbnQpO1xufTtcbiJdfQ==