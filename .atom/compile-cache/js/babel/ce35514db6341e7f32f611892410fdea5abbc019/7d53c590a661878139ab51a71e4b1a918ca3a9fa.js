
"use strict";
module.exports = function (statement, /*: Object*/
options /*:: ?: Object*/
) /*: string*/{
  options = options || {};

  var result = "";
  var rule = undefined; /*?: postcss$rule*/
  var atRule = undefined; /*?: postcss$atRule*/

  if (statement.type === "rule") {
    rule = statement;
  }
  if (statement.type === "atrule") {
    atRule = statement;
  }

  if (!rule && !atRule) {
    return result;
  }

  var before = statement.raws.before || "";

  if (!options.noRawBefore) {
    result += before;
  }
  if (rule) {
    result += rule.selector;
  }
  if (atRule) {
    result += "@" + atRule.name + (atRule.raws.afterName || "") + atRule.params;
  }

  var between = statement.raws.between;

  if (between !== undefined) {
    result += between;
  }

  return result;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYmVmb3JlQmxvY2tTdHJpbmcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQztBQUNiLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFDZixTQUFTO0FBQ1QsT0FBTztjQUNNO0FBQ2IsU0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7O0FBRXhCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixNQUFJLElBQUksWUFBQSxDQUFDO0FBQ1QsTUFBSSxNQUFNLFlBQUEsQ0FBQzs7QUFFWCxNQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQzdCLFFBQUksR0FBRyxTQUFTLENBQUM7R0FDbEI7QUFDRCxNQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQy9CLFVBQU0sR0FBRyxTQUFTLENBQUM7R0FDcEI7O0FBRUQsTUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNwQixXQUFPLE1BQU0sQ0FBQztHQUNmOztBQUVELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQzs7QUFFM0MsTUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDeEIsVUFBTSxJQUFJLE1BQU0sQ0FBQztHQUNsQjtBQUNELE1BQUksSUFBSSxFQUFFO0FBQ1IsVUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUM7R0FDekI7QUFDRCxNQUFJLE1BQU0sRUFBRTtBQUNWLFVBQU0sSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxFQUFFLENBQUEsQUFBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7R0FDN0U7O0FBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRXZDLE1BQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtBQUN6QixVQUFNLElBQUksT0FBTyxDQUFDO0dBQ25COztBQUVELFNBQU8sTUFBTSxDQUFDO0NBQ2YsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2JlZm9yZUJsb2NrU3RyaW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihcbiAgc3RhdGVtZW50IC8qOiBPYmplY3QqLyxcbiAgb3B0aW9ucyAvKjo6ID86IE9iamVjdCovXG4pIC8qOiBzdHJpbmcqLyB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGxldCByZXN1bHQgPSBcIlwiO1xuICBsZXQgcnVsZTsgLyo/OiBwb3N0Y3NzJHJ1bGUqL1xuICBsZXQgYXRSdWxlOyAvKj86IHBvc3Rjc3MkYXRSdWxlKi9cblxuICBpZiAoc3RhdGVtZW50LnR5cGUgPT09IFwicnVsZVwiKSB7XG4gICAgcnVsZSA9IHN0YXRlbWVudDtcbiAgfVxuICBpZiAoc3RhdGVtZW50LnR5cGUgPT09IFwiYXRydWxlXCIpIHtcbiAgICBhdFJ1bGUgPSBzdGF0ZW1lbnQ7XG4gIH1cblxuICBpZiAoIXJ1bGUgJiYgIWF0UnVsZSkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjb25zdCBiZWZvcmUgPSBzdGF0ZW1lbnQucmF3cy5iZWZvcmUgfHwgXCJcIjtcblxuICBpZiAoIW9wdGlvbnMubm9SYXdCZWZvcmUpIHtcbiAgICByZXN1bHQgKz0gYmVmb3JlO1xuICB9XG4gIGlmIChydWxlKSB7XG4gICAgcmVzdWx0ICs9IHJ1bGUuc2VsZWN0b3I7XG4gIH1cbiAgaWYgKGF0UnVsZSkge1xuICAgIHJlc3VsdCArPSBcIkBcIiArIGF0UnVsZS5uYW1lICsgKGF0UnVsZS5yYXdzLmFmdGVyTmFtZSB8fCBcIlwiKSArIGF0UnVsZS5wYXJhbXM7XG4gIH1cblxuICBjb25zdCBiZXR3ZWVuID0gc3RhdGVtZW50LnJhd3MuYmV0d2VlbjtcblxuICBpZiAoYmV0d2VlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdWx0ICs9IGJldHdlZW47XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcbiJdfQ==