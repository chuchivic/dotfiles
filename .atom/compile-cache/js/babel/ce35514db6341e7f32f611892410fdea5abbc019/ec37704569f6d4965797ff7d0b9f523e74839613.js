
"use strict";

var _ = require("lodash");

var ignoredOptions = ["severity", "message"];

/**
 * Validate a rule's options.
 *
 * See existing rules for examples.
 *
 * @param {Result} result - postcss result
 * @param {string} ruleName
 * @param {...object} ...optionDescriptions - Each optionDescription can
 *   have the following properties:
 *   	- `actual` (required): the actual passed option value or object.
 *   	- `possible` (required): a schema representation of what values are
 *      valid for those options. `possible` should be an object if the
 *      options are an object, with corresponding keys; if the options are not an
 *      object, `possible` isn't, either. All `possible` value representations
 *      should be **arrays of either values or functions**. Values are === checked
 *      against `actual`. Functions are fed `actual` as an argument and their
 *      return value is interpreted: truthy = valid, falsy = invalid.
 *    - `optional` (optional): If this is `true`, `actual` can be undefined.
 * @return {boolean} Whether or not the options are valid (true = valid)
 */
module.exports = function (result, /*: Object*/
ruleName /*: string*/
) /*: boolean*/{
  var noErrors = true;

  var optionDescriptions = Array.from(arguments).slice(2);

  optionDescriptions.forEach(function (optionDescription) {
    validate(optionDescription, ruleName, complain);
  });

  function complain(message) {
    noErrors = false;
    result.warn(message, {
      stylelintType: "invalidOption"
    });
    _.set(result, "stylelint.stylelintError", true);
  }

  return noErrors;
};

function validate(opts, ruleName, complain) {
  var possible = opts.possible;
  var actual = opts.actual;
  var optional = opts.optional;

  if (actual === null || _.isEqual(actual, [null])) {
    return;
  }

  var nothingPossible = possible === undefined || Array.isArray(possible) && possible.length === 0;

  if (nothingPossible && actual === true) {
    return;
  }

  if (actual === undefined) {
    if (nothingPossible || optional) {
      return;
    }
    complain("Expected option value for rule \"" + ruleName + "\"");
    return;
  } else if (nothingPossible) {
    complain("Unexpected option value \"" + actual + "\" for rule \"" + ruleName + "\"");
    return;
  }

  // If `possible` is a function ...
  if (_.isFunction(possible)) {
    if (!possible(actual)) {
      complain("Invalid option \"" + JSON.stringify(actual) + "\" for rule " + ruleName);
    }
    return;
  }

  // If `possible` is an array instead of an object ...
  if (!_.isPlainObject(possible)) {
    [].concat(actual).forEach(function (a) {
      if (isValid(possible, a)) {
        return;
      }
      complain("Invalid option value \"" + a + "\" for rule \"" + ruleName + "\"");
    });
    return;
  }

  // If possible is an object ...
  if (!_.isPlainObject(actual)) {
    complain("Invalid option value " + JSON.stringify(actual) + " for rule \"" + ruleName + "\": " + "should be an object");
    return;
  }

  Object.keys(actual).forEach(function (optionName) {
    if (ignoredOptions.indexOf(optionName) !== -1) {
      return;
    }

    if (!possible[optionName]) {
      complain("Invalid option name \"" + optionName + "\" for rule \"" + ruleName + "\"");
      return;
    }

    var actualOptionValue = actual[optionName];
    [].concat(actualOptionValue).forEach(function (a) {
      if (isValid(possible[optionName], a)) {
        return;
      }
      complain("Invalid value \"" + a + "\" for option \"" + optionName + "\" of rule \"" + ruleName + "\"");
    });
  });
}

function isValid(possible, actual) {
  var possibleList = [].concat(possible);
  for (var i = 0, l = possibleList.length; i < l; i++) {
    var possibility = possibleList[i];
    if (typeof possibility === "function" && possibility(actual)) {
      return true;
    }
    if (actual === possibility) {
      return true;
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvdmFsaWRhdGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUU1QixJQUFNLGNBQWMsR0FBRyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUNmLE1BQU07QUFDTixRQUFRO2VBQ007QUFDZCxNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7O0FBRXBCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTFELG9CQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFBLGlCQUFpQixFQUFJO0FBQzlDLFlBQVEsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDakQsQ0FBQyxDQUFDOztBQUVILFdBQVMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUN6QixZQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ2pCLFVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ25CLG1CQUFhLEVBQUUsZUFBZTtLQUMvQixDQUFDLENBQUM7QUFDSCxLQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSwwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNqRDs7QUFFRCxTQUFPLFFBQVEsQ0FBQztDQUNqQixDQUFDOztBQUVGLFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDL0IsTUFBTSxNQUFN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QUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25ELFFBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQyxRQUFJLE9BQU8sV0FBVyxLQUFLLFVBQVUsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDNUQsYUFBTyxJQUFJLENBQUM7S0FDYjtBQUNELFFBQUksTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUMxQixhQUFPLElBQUksQ0FBQztLQUNiO0dBQ0Y7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL3ZhbGlkYXRlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbmNvbnN0IGlnbm9yZWRPcHRpb25zID0gW1wic2V2ZXJpdHlcIiwgXCJtZXNzYWdlXCJdO1xuXG4vKipcbiAqIFZhbGlkYXRlIGEgcnVsZSdzIG9wdGlvbnMuXG4gKlxuICogU2VlIGV4aXN0aW5nIHJ1bGVzIGZvciBleGFtcGxlcy5cbiAqXG4gKiBAcGFyYW0ge1Jlc3VsdH0gcmVzdWx0IC0gcG9zdGNzcyByZXN1bHRcbiAqIEBwYXJhbSB7c3RyaW5nfSBydWxlTmFtZVxuICogQHBhcmFtIHsuLi5vYmplY3R9IC4uLm9wdGlvbkRlc2NyaXB0aW9ucyAtIEVhY2ggb3B0aW9uRGVzY3JpcHRpb24gY2FuXG4gKiAgIGhhdmUgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICogICBcdC0gYGFjdHVhbGAgKHJlcXVpcmVkKTogdGhlIGFjdHVhbCBwYXNzZWQgb3B0aW9uIHZhbHVlIG9yIG9iamVjdC5cbiAqICAgXHQtIGBwb3NzaWJsZWAgKHJlcXVpcmVkKTogYSBzY2hlbWEgcmVwcmVzZW50YXRpb24gb2Ygd2hhdCB2YWx1ZXMgYXJlXG4gKiAgICAgIHZhbGlkIGZvciB0aG9zZSBvcHRpb25zLiBgcG9zc2libGVgIHNob3VsZCBiZSBhbiBvYmplY3QgaWYgdGhlXG4gKiAgICAgIG9wdGlvbnMgYXJlIGFuIG9iamVjdCwgd2l0aCBjb3JyZXNwb25kaW5nIGtleXM7IGlmIHRoZSBvcHRpb25zIGFyZSBub3QgYW5cbiAqICAgICAgb2JqZWN0LCBgcG9zc2libGVgIGlzbid0LCBlaXRoZXIuIEFsbCBgcG9zc2libGVgIHZhbHVlIHJlcHJlc2VudGF0aW9uc1xuICogICAgICBzaG91bGQgYmUgKiphcnJheXMgb2YgZWl0aGVyIHZhbHVlcyBvciBmdW5jdGlvbnMqKi4gVmFsdWVzIGFyZSA9PT0gY2hlY2tlZFxuICogICAgICBhZ2FpbnN0IGBhY3R1YWxgLiBGdW5jdGlvbnMgYXJlIGZlZCBgYWN0dWFsYCBhcyBhbiBhcmd1bWVudCBhbmQgdGhlaXJcbiAqICAgICAgcmV0dXJuIHZhbHVlIGlzIGludGVycHJldGVkOiB0cnV0aHkgPSB2YWxpZCwgZmFsc3kgPSBpbnZhbGlkLlxuICogICAgLSBgb3B0aW9uYWxgIChvcHRpb25hbCk6IElmIHRoaXMgaXMgYHRydWVgLCBgYWN0dWFsYCBjYW4gYmUgdW5kZWZpbmVkLlxuICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBvciBub3QgdGhlIG9wdGlvbnMgYXJlIHZhbGlkICh0cnVlID0gdmFsaWQpXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oXG4gIHJlc3VsdCAvKjogT2JqZWN0Ki8sXG4gIHJ1bGVOYW1lIC8qOiBzdHJpbmcqL1xuKSAvKjogYm9vbGVhbiovIHtcbiAgbGV0IG5vRXJyb3JzID0gdHJ1ZTtcblxuICBjb25zdCBvcHRpb25EZXNjcmlwdGlvbnMgPSBBcnJheS5mcm9tKGFyZ3VtZW50cykuc2xpY2UoMik7XG5cbiAgb3B0aW9uRGVzY3JpcHRpb25zLmZvckVhY2gob3B0aW9uRGVzY3JpcHRpb24gPT4ge1xuICAgIHZhbGlkYXRlKG9wdGlvbkRlc2NyaXB0aW9uLCBydWxlTmFtZSwgY29tcGxhaW4pO1xuICB9KTtcblxuICBmdW5jdGlvbiBjb21wbGFpbihtZXNzYWdlKSB7XG4gICAgbm9FcnJvcnMgPSBmYWxzZTtcbiAgICByZXN1bHQud2FybihtZXNzYWdlLCB7XG4gICAgICBzdHlsZWxpbnRUeXBlOiBcImludmFsaWRPcHRpb25cIlxuICAgIH0pO1xuICAgIF8uc2V0KHJlc3VsdCwgXCJzdHlsZWxpbnQuc3R5bGVsaW50RXJyb3JcIiwgdHJ1ZSk7XG4gIH1cblxuICByZXR1cm4gbm9FcnJvcnM7XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZShvcHRzLCBydWxlTmFtZSwgY29tcGxhaW4pIHtcbiAgY29uc3QgcG9zc2libGUgPSBvcHRzLnBvc3NpYmxlO1xuICBjb25zdCBhY3R1YWwgPSBvcHRzLmFjdHVhbDtcbiAgY29uc3Qgb3B0aW9uYWwgPSBvcHRzLm9wdGlvbmFsO1xuXG4gIGlmIChhY3R1YWwgPT09IG51bGwgfHwgXy5pc0VxdWFsKGFjdHVhbCwgW251bGxdKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IG5vdGhpbmdQb3NzaWJsZSA9XG4gICAgcG9zc2libGUgPT09IHVuZGVmaW5lZCB8fFxuICAgIChBcnJheS5pc0FycmF5KHBvc3NpYmxlKSAmJiBwb3NzaWJsZS5sZW5ndGggPT09IDApO1xuXG4gIGlmIChub3RoaW5nUG9zc2libGUgJiYgYWN0dWFsID09PSB0cnVlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGFjdHVhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKG5vdGhpbmdQb3NzaWJsZSB8fCBvcHRpb25hbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb21wbGFpbihgRXhwZWN0ZWQgb3B0aW9uIHZhbHVlIGZvciBydWxlIFwiJHtydWxlTmFtZX1cImApO1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmIChub3RoaW5nUG9zc2libGUpIHtcbiAgICBjb21wbGFpbihgVW5leHBlY3RlZCBvcHRpb24gdmFsdWUgXCIke2FjdHVhbH1cIiBmb3IgcnVsZSBcIiR7cnVsZU5hbWV9XCJgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiBgcG9zc2libGVgIGlzIGEgZnVuY3Rpb24gLi4uXG4gIGlmIChfLmlzRnVuY3Rpb24ocG9zc2libGUpKSB7XG4gICAgaWYgKCFwb3NzaWJsZShhY3R1YWwpKSB7XG4gICAgICBjb21wbGFpbihcbiAgICAgICAgYEludmFsaWQgb3B0aW9uIFwiJHtKU09OLnN0cmluZ2lmeShhY3R1YWwpfVwiIGZvciBydWxlICR7cnVsZU5hbWV9YFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgYHBvc3NpYmxlYCBpcyBhbiBhcnJheSBpbnN0ZWFkIG9mIGFuIG9iamVjdCAuLi5cbiAgaWYgKCFfLmlzUGxhaW5PYmplY3QocG9zc2libGUpKSB7XG4gICAgW10uY29uY2F0KGFjdHVhbCkuZm9yRWFjaChhID0+IHtcbiAgICAgIGlmIChpc1ZhbGlkKHBvc3NpYmxlLCBhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb21wbGFpbihgSW52YWxpZCBvcHRpb24gdmFsdWUgXCIke2F9XCIgZm9yIHJ1bGUgXCIke3J1bGVOYW1lfVwiYCk7XG4gICAgfSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgcG9zc2libGUgaXMgYW4gb2JqZWN0IC4uLlxuICBpZiAoIV8uaXNQbGFpbk9iamVjdChhY3R1YWwpKSB7XG4gICAgY29tcGxhaW4oXG4gICAgICBgSW52YWxpZCBvcHRpb24gdmFsdWUgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgICAgYWN0dWFsXG4gICAgICApfSBmb3IgcnVsZSBcIiR7cnVsZU5hbWV9XCI6IGAgKyBcInNob3VsZCBiZSBhbiBvYmplY3RcIlxuICAgICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgT2JqZWN0LmtleXMoYWN0dWFsKS5mb3JFYWNoKG9wdGlvbk5hbWUgPT4ge1xuICAgIGlmIChpZ25vcmVkT3B0aW9ucy5pbmRleE9mKG9wdGlvbk5hbWUpICE9PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghcG9zc2libGVbb3B0aW9uTmFtZV0pIHtcbiAgICAgIGNvbXBsYWluKGBJbnZhbGlkIG9wdGlvbiBuYW1lIFwiJHtvcHRpb25OYW1lfVwiIGZvciBydWxlIFwiJHtydWxlTmFtZX1cImApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdHVhbE9wdGlvblZhbHVlID0gYWN0dWFsW29wdGlvbk5hbWVdO1xuICAgIFtdLmNvbmNhdChhY3R1YWxPcHRpb25WYWx1ZSkuZm9yRWFjaChhID0+IHtcbiAgICAgIGlmIChpc1ZhbGlkKHBvc3NpYmxlW29wdGlvbk5hbWVdLCBhKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb21wbGFpbihcbiAgICAgICAgYEludmFsaWQgdmFsdWUgXCIke2F9XCIgZm9yIG9wdGlvbiBcIiR7b3B0aW9uTmFtZX1cIiBvZiBydWxlIFwiJHtydWxlTmFtZX1cImBcbiAgICAgICk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkKHBvc3NpYmxlLCBhY3R1YWwpIHtcbiAgY29uc3QgcG9zc2libGVMaXN0ID0gW10uY29uY2F0KHBvc3NpYmxlKTtcbiAgZm9yIChsZXQgaSA9IDAsIGwgPSBwb3NzaWJsZUxpc3QubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgY29uc3QgcG9zc2liaWxpdHkgPSBwb3NzaWJsZUxpc3RbaV07XG4gICAgaWYgKHR5cGVvZiBwb3NzaWJpbGl0eSA9PT0gXCJmdW5jdGlvblwiICYmIHBvc3NpYmlsaXR5KGFjdHVhbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYWN0dWFsID09PSBwb3NzaWJpbGl0eSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59XG4iXX0=