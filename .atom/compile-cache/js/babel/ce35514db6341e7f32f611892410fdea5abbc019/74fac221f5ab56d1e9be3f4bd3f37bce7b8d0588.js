
"use strict";

var blurInterpolation = require("./blurInterpolation");
var _ = require("lodash");
var isStandardSyntaxValue = require("./isStandardSyntaxValue");
var valueParser = require("postcss-value-parser");

/**
 * Get unit from value node
 *
 * Returns `null` if the unit is not found.
 */
module.exports = function (node /*: Object*/) /*: ?string*/{
  if (!node || node && !node.value) {
    return null;
  }

  var value = blurInterpolation(node.value, "")
  // ignore hack unit
  .replace("\\0", "").replace("\\9", "")
  // ignore decimal place
  .replace(".", "");

  if (node.type !== "word" || !isStandardSyntaxValue(value) || !_.isFinite(parseInt(value)) || node.value[0] === "#") {
    return null;
  }

  var parsedUnit = valueParser.unit(value);

  if (!parsedUnit) {
    return null;
  }

  return parsedUnit.unit;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZ2V0VW5pdEZyb21WYWx1ZU5vZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQTs7QUFFWixJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3hELElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixJQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0FBQ2hFLElBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBOzs7Ozs7O0FBT25ELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxJQUFJLDRCQUEyQjtBQUN4RCxNQUFJLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDaEMsV0FBTyxJQUFJLENBQUE7R0FDWjs7QUFFRCxNQUFNLEtBQUssR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQzs7R0FFOUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQzs7R0FFckMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTs7QUFFakIsTUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUNsSCxXQUFPLElBQUksQ0FBQTtHQUNaOztBQUVELE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7O0FBRTFDLE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixXQUFPLElBQUksQ0FBQTtHQUNaOztBQUVELFNBQU8sVUFBVSxDQUFDLElBQUksQ0FBQTtDQUN2QixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZ2V0VW5pdEZyb21WYWx1ZU5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgYmx1ckludGVycG9sYXRpb24gPSByZXF1aXJlKFwiLi9ibHVySW50ZXJwb2xhdGlvblwiKVxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcbmNvbnN0IGlzU3RhbmRhcmRTeW50YXhWYWx1ZSA9IHJlcXVpcmUoXCIuL2lzU3RhbmRhcmRTeW50YXhWYWx1ZVwiKVxuY29uc3QgdmFsdWVQYXJzZXIgPSByZXF1aXJlKFwicG9zdGNzcy12YWx1ZS1wYXJzZXJcIilcblxuLyoqXG4gKiBHZXQgdW5pdCBmcm9tIHZhbHVlIG5vZGVcbiAqXG4gKiBSZXR1cm5zIGBudWxsYCBpZiB0aGUgdW5pdCBpcyBub3QgZm91bmQuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5vZGUvKjogT2JqZWN0Ki8pLyo6ID9zdHJpbmcqLyB7XG4gIGlmICghbm9kZSB8fCBub2RlICYmICFub2RlLnZhbHVlKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IHZhbHVlID0gYmx1ckludGVycG9sYXRpb24obm9kZS52YWx1ZSwgXCJcIilcbiAgLy8gaWdub3JlIGhhY2sgdW5pdFxuICAucmVwbGFjZShcIlxcXFwwXCIsIFwiXCIpLnJlcGxhY2UoXCJcXFxcOVwiLCBcIlwiKVxuICAvLyBpZ25vcmUgZGVjaW1hbCBwbGFjZVxuICAucmVwbGFjZShcIi5cIiwgXCJcIilcblxuICBpZiAobm9kZS50eXBlICE9PSBcIndvcmRcIiB8fCAhaXNTdGFuZGFyZFN5bnRheFZhbHVlKHZhbHVlKSB8fCAhXy5pc0Zpbml0ZShwYXJzZUludCh2YWx1ZSkpIHx8IG5vZGUudmFsdWVbMF0gPT09IFwiI1wiKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IHBhcnNlZFVuaXQgPSB2YWx1ZVBhcnNlci51bml0KHZhbHVlKVxuXG4gIGlmICghcGFyc2VkVW5pdCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gcGFyc2VkVW5pdC51bml0XG59XG4iXX0=