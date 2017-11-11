
"use strict";

/**
 * Find the at-rule in which a rule is nested.
 *
 * Returns `null` if the rule is not nested within an at-rule.
 */
module.exports = function findAtRuleContext(_x) {
  var _again = true;

  _function: while (_again) /*: postcss$rule */
  /*: ?postcss$atRule*/{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZmluZEF0UnVsZUNvbnRleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQTs7Ozs7OztBQU9aLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxpQkFBaUI7Ozs7dUJBRXBCO1FBRHJCLElBQUk7OztBQUVKLFFBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7O0FBRTFCLFFBQUksTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7QUFDMUIsYUFBTyxJQUFJLENBQUE7S0FDWjtBQUNELFFBQUksTUFBTSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDNUIsYUFBTyxNQUFNLENBQUE7S0FDZDtTQUN3QixNQUFNOztBQVJ6QixVQUFNOztHQVNiO0NBQUEsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2ZpbmRBdFJ1bGVDb250ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiXG5cbi8qKlxuICogRmluZCB0aGUgYXQtcnVsZSBpbiB3aGljaCBhIHJ1bGUgaXMgbmVzdGVkLlxuICpcbiAqIFJldHVybnMgYG51bGxgIGlmIHRoZSBydWxlIGlzIG5vdCBuZXN0ZWQgd2l0aGluIGFuIGF0LXJ1bGUuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZmluZEF0UnVsZUNvbnRleHQoXG4gIHJ1bGUvKjogcG9zdGNzcyRydWxlICovXG4pLyo6ID9wb3N0Y3NzJGF0UnVsZSovIHtcbiAgY29uc3QgcGFyZW50ID0gcnVsZS5wYXJlbnRcblxuICBpZiAocGFyZW50LnR5cGUgPT09IFwicm9vdFwiKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAocGFyZW50LnR5cGUgPT09IFwiYXRydWxlXCIpIHtcbiAgICByZXR1cm4gcGFyZW50XG4gIH1cbiAgcmV0dXJuIGZpbmRBdFJ1bGVDb250ZXh0KHBhcmVudClcbn1cbiJdfQ==