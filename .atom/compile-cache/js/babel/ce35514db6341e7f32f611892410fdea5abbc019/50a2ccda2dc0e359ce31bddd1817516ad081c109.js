
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

    var actualOptionValue = actual[optionName];[].concat(actualOptionValue).forEach(function (a) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvdmFsaWRhdGVPcHRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7O0FBRVosSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUUzQixJQUFNLGNBQWMsR0FBRyxDQUFFLFVBQVUsRUFBRSxTQUFTLENBQUUsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCaEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUNmLE1BQU07QUFDTixRQUFRO2VBQ0s7QUFDYixNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUE7O0FBRW5CLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRXpELG9CQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFBLGlCQUFpQixFQUFJO0FBQzlDLFlBQVEsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7R0FDaEQsQ0FBQyxDQUFBOztBQUVGLFdBQVMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUN6QixZQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ2hCLFVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ25CLG1CQUFhLEVBQUUsZUFBZTtLQUMvQixDQUFDLENBQUE7QUFDRixLQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSwwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQTtHQUNoRDs7QUFFRCxTQUFPLFFBQVEsQ0FBQTtDQUNoQixDQUFBOztBQUVELFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO0FBQzFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDOUIsTUFBTSxNQUFN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LE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25ELFFBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNuQyxRQUFJLE9BQU8sV0FBVyxLQUFLLFVBQVUsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDNUQsYUFBTyxJQUFJLENBQUE7S0FDWjtBQUNELFFBQUksTUFBTSxLQUFLLFdBQVcsRUFBRTtBQUMxQixhQUFPLElBQUksQ0FBQTtLQUNaO0dBQ0Y7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL3ZhbGlkYXRlT3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKVxuXG5jb25zdCBpZ25vcmVkT3B0aW9ucyA9IFsgXCJzZXZlcml0eVwiLCBcIm1lc3NhZ2VcIiBdXG5cbi8qKlxuICogVmFsaWRhdGUgYSBydWxlJ3Mgb3B0aW9ucy5cbiAqXG4gKiBTZWUgZXhpc3RpbmcgcnVsZXMgZm9yIGV4YW1wbGVzLlxuICpcbiAqIEBwYXJhbSB7UmVzdWx0fSByZXN1bHQgLSBwb3N0Y3NzIHJlc3VsdFxuICogQHBhcmFtIHtzdHJpbmd9IHJ1bGVOYW1lXG4gKiBAcGFyYW0gey4uLm9iamVjdH0gLi4ub3B0aW9uRGVzY3JpcHRpb25zIC0gRWFjaCBvcHRpb25EZXNjcmlwdGlvbiBjYW5cbiAqICAgaGF2ZSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAgIFx0LSBgYWN0dWFsYCAocmVxdWlyZWQpOiB0aGUgYWN0dWFsIHBhc3NlZCBvcHRpb24gdmFsdWUgb3Igb2JqZWN0LlxuICogICBcdC0gYHBvc3NpYmxlYCAocmVxdWlyZWQpOiBhIHNjaGVtYSByZXByZXNlbnRhdGlvbiBvZiB3aGF0IHZhbHVlcyBhcmVcbiAqICAgICAgdmFsaWQgZm9yIHRob3NlIG9wdGlvbnMuIGBwb3NzaWJsZWAgc2hvdWxkIGJlIGFuIG9iamVjdCBpZiB0aGVcbiAqICAgICAgb3B0aW9ucyBhcmUgYW4gb2JqZWN0LCB3aXRoIGNvcnJlc3BvbmRpbmcga2V5czsgaWYgdGhlIG9wdGlvbnMgYXJlIG5vdCBhblxuICogICAgICBvYmplY3QsIGBwb3NzaWJsZWAgaXNuJ3QsIGVpdGhlci4gQWxsIGBwb3NzaWJsZWAgdmFsdWUgcmVwcmVzZW50YXRpb25zXG4gKiAgICAgIHNob3VsZCBiZSAqKmFycmF5cyBvZiBlaXRoZXIgdmFsdWVzIG9yIGZ1bmN0aW9ucyoqLiBWYWx1ZXMgYXJlID09PSBjaGVja2VkXG4gKiAgICAgIGFnYWluc3QgYGFjdHVhbGAuIEZ1bmN0aW9ucyBhcmUgZmVkIGBhY3R1YWxgIGFzIGFuIGFyZ3VtZW50IGFuZCB0aGVpclxuICogICAgICByZXR1cm4gdmFsdWUgaXMgaW50ZXJwcmV0ZWQ6IHRydXRoeSA9IHZhbGlkLCBmYWxzeSA9IGludmFsaWQuXG4gKiAgICAtIGBvcHRpb25hbGAgKG9wdGlvbmFsKTogSWYgdGhpcyBpcyBgdHJ1ZWAsIGBhY3R1YWxgIGNhbiBiZSB1bmRlZmluZWQuXG4gKiBAcmV0dXJuIHtib29sZWFufSBXaGV0aGVyIG9yIG5vdCB0aGUgb3B0aW9ucyBhcmUgdmFsaWQgKHRydWUgPSB2YWxpZClcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoXG4gIHJlc3VsdC8qOiBPYmplY3QqLyxcbiAgcnVsZU5hbWUvKjogc3RyaW5nKi9cbikvKjogYm9vbGVhbiovIHtcbiAgbGV0IG5vRXJyb3JzID0gdHJ1ZVxuXG4gIGNvbnN0IG9wdGlvbkRlc2NyaXB0aW9ucyA9IEFycmF5LmZyb20oYXJndW1lbnRzKS5zbGljZSgyKVxuXG4gIG9wdGlvbkRlc2NyaXB0aW9ucy5mb3JFYWNoKG9wdGlvbkRlc2NyaXB0aW9uID0+IHtcbiAgICB2YWxpZGF0ZShvcHRpb25EZXNjcmlwdGlvbiwgcnVsZU5hbWUsIGNvbXBsYWluKVxuICB9KVxuXG4gIGZ1bmN0aW9uIGNvbXBsYWluKG1lc3NhZ2UpIHtcbiAgICBub0Vycm9ycyA9IGZhbHNlXG4gICAgcmVzdWx0Lndhcm4obWVzc2FnZSwge1xuICAgICAgc3R5bGVsaW50VHlwZTogXCJpbnZhbGlkT3B0aW9uXCIsXG4gICAgfSlcbiAgICBfLnNldChyZXN1bHQsIFwic3R5bGVsaW50LnN0eWxlbGludEVycm9yXCIsIHRydWUpXG4gIH1cblxuICByZXR1cm4gbm9FcnJvcnNcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGUob3B0cywgcnVsZU5hbWUsIGNvbXBsYWluKSB7XG4gIGNvbnN0IHBvc3NpYmxlID0gb3B0cy5wb3NzaWJsZVxuICBjb25zdCBhY3R1YWwgPSBvcHRzLmFjdHVhbFxuICBjb25zdCBvcHRpb25hbCA9IG9wdHMub3B0aW9uYWxcblxuICBpZiAoYWN0dWFsID09PSBudWxsIHx8IF8uaXNFcXVhbChhY3R1YWwsIFtudWxsXSkpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IG5vdGhpbmdQb3NzaWJsZSA9IHBvc3NpYmxlID09PSB1bmRlZmluZWQgfHwgQXJyYXkuaXNBcnJheShwb3NzaWJsZSkgJiYgcG9zc2libGUubGVuZ3RoID09PSAwXG5cbiAgaWYgKG5vdGhpbmdQb3NzaWJsZSAmJiBhY3R1YWwgPT09IHRydWUpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChhY3R1YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChub3RoaW5nUG9zc2libGUgfHwgb3B0aW9uYWwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb21wbGFpbihgRXhwZWN0ZWQgb3B0aW9uIHZhbHVlIGZvciBydWxlIFwiJHtydWxlTmFtZX1cImApXG4gICAgcmV0dXJuXG4gIH0gZWxzZSBpZiAobm90aGluZ1Bvc3NpYmxlKSB7XG4gICAgY29tcGxhaW4oYFVuZXhwZWN0ZWQgb3B0aW9uIHZhbHVlIFwiJHthY3R1YWx9XCIgZm9yIHJ1bGUgXCIke3J1bGVOYW1lfVwiYClcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIElmIGBwb3NzaWJsZWAgaXMgYSBmdW5jdGlvbiAuLi5cbiAgaWYgKF8uaXNGdW5jdGlvbihwb3NzaWJsZSkpIHtcbiAgICBpZiAoIXBvc3NpYmxlKGFjdHVhbCkpIHtcbiAgICAgIGNvbXBsYWluKGBJbnZhbGlkIG9wdGlvbiBcIiR7SlNPTi5zdHJpbmdpZnkoYWN0dWFsKX1cIiBmb3IgcnVsZSAke3J1bGVOYW1lfWApXG4gICAgfVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgYHBvc3NpYmxlYCBpcyBhbiBhcnJheSBpbnN0ZWFkIG9mIGFuIG9iamVjdCAuLi5cbiAgaWYgKCFfLmlzUGxhaW5PYmplY3QocG9zc2libGUpKSB7XG4gICAgW10uY29uY2F0KGFjdHVhbCkuZm9yRWFjaChhID0+IHtcbiAgICAgIGlmIChpc1ZhbGlkKHBvc3NpYmxlLCBhKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbXBsYWluKGBJbnZhbGlkIG9wdGlvbiB2YWx1ZSBcIiR7YX1cIiBmb3IgcnVsZSBcIiR7cnVsZU5hbWV9XCJgKVxuICAgIH0pXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBJZiBwb3NzaWJsZSBpcyBhbiBvYmplY3QgLi4uXG4gIGlmICghXy5pc1BsYWluT2JqZWN0KGFjdHVhbCkpIHtcbiAgICBjb21wbGFpbihgSW52YWxpZCBvcHRpb24gdmFsdWUgJHtKU09OLnN0cmluZ2lmeShhY3R1YWwpfSBmb3IgcnVsZSBcIiR7cnVsZU5hbWV9XCI6IGAgKyBcInNob3VsZCBiZSBhbiBvYmplY3RcIilcbiAgICByZXR1cm5cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGFjdHVhbCkuZm9yRWFjaChvcHRpb25OYW1lID0+IHtcbiAgICBpZiAoaWdub3JlZE9wdGlvbnMuaW5kZXhPZihvcHRpb25OYW1lKSAhPT0gLTEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICghcG9zc2libGVbb3B0aW9uTmFtZV0pIHtcbiAgICAgIGNvbXBsYWluKGBJbnZhbGlkIG9wdGlvbiBuYW1lIFwiJHtvcHRpb25OYW1lfVwiIGZvciBydWxlIFwiJHtydWxlTmFtZX1cImApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBhY3R1YWxPcHRpb25WYWx1ZSA9IGFjdHVhbFtvcHRpb25OYW1lXTtbXS5jb25jYXQoYWN0dWFsT3B0aW9uVmFsdWUpLmZvckVhY2goYSA9PiB7XG4gICAgICBpZiAoaXNWYWxpZChwb3NzaWJsZVtvcHRpb25OYW1lXSwgYSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb21wbGFpbihgSW52YWxpZCB2YWx1ZSBcIiR7YX1cIiBmb3Igb3B0aW9uIFwiJHtvcHRpb25OYW1lfVwiIG9mIHJ1bGUgXCIke3J1bGVOYW1lfVwiYClcbiAgICB9KVxuICB9KVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkKHBvc3NpYmxlLCBhY3R1YWwpIHtcbiAgY29uc3QgcG9zc2libGVMaXN0ID0gW10uY29uY2F0KHBvc3NpYmxlKVxuICBmb3IgKGxldCBpID0gMCwgbCA9IHBvc3NpYmxlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBjb25zdCBwb3NzaWJpbGl0eSA9IHBvc3NpYmxlTGlzdFtpXVxuICAgIGlmICh0eXBlb2YgcG9zc2liaWxpdHkgPT09IFwiZnVuY3Rpb25cIiAmJiBwb3NzaWJpbGl0eShhY3R1YWwpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAoYWN0dWFsID09PSBwb3NzaWJpbGl0eSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cbiJdfQ==