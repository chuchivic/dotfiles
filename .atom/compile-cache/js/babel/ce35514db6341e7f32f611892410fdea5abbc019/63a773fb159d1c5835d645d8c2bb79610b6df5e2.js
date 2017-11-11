
"use strict";

var autoprefixer = require("autoprefixer");
var Browsers = require("autoprefixer/lib/browsers");
var Prefixes = require("autoprefixer/lib/prefixes");

/**
 * Use Autoprefixer's secret powers to determine whether or
 * not a certain CSS identifier contains a vendor prefix that
 * Autoprefixer, given the standardized identifier, could add itself.
 *
 * Used by `*-no-vendor-prefix-*` rules to find superfluous
 * vendor prefixes.
 */

var prefixes = new Prefixes(autoprefixer.data.prefixes, new Browsers(autoprefixer.data.browsers, []));

/**
 * Most identifier types have to be looked up in a unique way,
 * so we're exposing special functions for each.
 */
module.exports = {
  atRuleName: function atRuleName(identifier /*: string*/) /*: boolean*/{
    return prefixes.remove["@" + identifier.toLowerCase()];
  },

  selector: function selector(identifier /*: string*/) /*: boolean*/{
    return prefixes.remove.selectors.some(function (selectorObj) {
      return identifier.toLowerCase() === selectorObj.prefixed;
    });
  },

  mediaFeatureName: function mediaFeatureName(identifier /*: string*/) /*: boolean*/{
    return identifier.toLowerCase().indexOf("device-pixel-ratio") !== -1;
  },

  property: function property(identifier /*: string*/) /*: boolean*/{
    return autoprefixer.data.prefixes[prefixes.unprefixed(identifier.toLowerCase())];
  },

  propertyValue: function propertyValue(prop, /*: string*/value /*: string*/) /*: boolean*/{
    var possiblePrefixableValues = prefixes.remove[prop.toLowerCase()] && prefixes.remove[prop.toLowerCase()].values;
    return possiblePrefixableValues && possiblePrefixableValues.some(function (valueObj) {
      return value.toLowerCase() === valueObj.prefixed;
    });
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNBdXRvcHJlZml4YWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3QyxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUN0RCxJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7QUFXdEQsSUFBTSxRQUFRLEdBQUcsSUFBSSxRQUFRLENBQzNCLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUMxQixJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FDN0MsQ0FBQzs7Ozs7O0FBTUYsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFlBQVUsRUFBQSxvQkFBQyxVQUFVLDRCQUE2QjtBQUNoRCxXQUFPLFFBQVEsQ0FBQyxNQUFNLE9BQUssVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFHLENBQUM7R0FDeEQ7O0FBRUQsVUFBUSxFQUFBLGtCQUFDLFVBQVUsNEJBQTZCO0FBQzlDLFdBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUEsV0FBVyxFQUFJO0FBQ25ELGFBQU8sVUFBVSxDQUFDLFdBQVcsRUFBRSxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUM7S0FDMUQsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsVUFBVSw0QkFBNkI7QUFDdEQsV0FBTyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDdEU7O0FBRUQsVUFBUSxFQUFBLGtCQUFDLFVBQVUsNEJBQTZCO0FBQzlDLFdBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQy9CLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQzlDLENBQUM7R0FDSDs7QUFFRCxlQUFhLEVBQUEsdUJBQUMsSUFBSSxjQUFlLEtBQUssNEJBQTZCO0FBQ2pFLFFBQU0sd0JBQXdCLEdBQzVCLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQ25DLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzdDLFdBQ0Usd0JBQXdCLElBQ3hCLHdCQUF3QixDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUN4QyxhQUFPLEtBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUMsUUFBUSxDQUFDO0tBQ2xELENBQUMsQ0FDRjtHQUNIO0NBQ0YsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzQXV0b3ByZWZpeGFibGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IGF1dG9wcmVmaXhlciA9IHJlcXVpcmUoXCJhdXRvcHJlZml4ZXJcIik7XG5jb25zdCBCcm93c2VycyA9IHJlcXVpcmUoXCJhdXRvcHJlZml4ZXIvbGliL2Jyb3dzZXJzXCIpO1xuY29uc3QgUHJlZml4ZXMgPSByZXF1aXJlKFwiYXV0b3ByZWZpeGVyL2xpYi9wcmVmaXhlc1wiKTtcblxuLyoqXG4gKiBVc2UgQXV0b3ByZWZpeGVyJ3Mgc2VjcmV0IHBvd2VycyB0byBkZXRlcm1pbmUgd2hldGhlciBvclxuICogbm90IGEgY2VydGFpbiBDU1MgaWRlbnRpZmllciBjb250YWlucyBhIHZlbmRvciBwcmVmaXggdGhhdFxuICogQXV0b3ByZWZpeGVyLCBnaXZlbiB0aGUgc3RhbmRhcmRpemVkIGlkZW50aWZpZXIsIGNvdWxkIGFkZCBpdHNlbGYuXG4gKlxuICogVXNlZCBieSBgKi1uby12ZW5kb3ItcHJlZml4LSpgIHJ1bGVzIHRvIGZpbmQgc3VwZXJmbHVvdXNcbiAqIHZlbmRvciBwcmVmaXhlcy5cbiAqL1xuXG5jb25zdCBwcmVmaXhlcyA9IG5ldyBQcmVmaXhlcyhcbiAgYXV0b3ByZWZpeGVyLmRhdGEucHJlZml4ZXMsXG4gIG5ldyBCcm93c2VycyhhdXRvcHJlZml4ZXIuZGF0YS5icm93c2VycywgW10pXG4pO1xuXG4vKipcbiAqIE1vc3QgaWRlbnRpZmllciB0eXBlcyBoYXZlIHRvIGJlIGxvb2tlZCB1cCBpbiBhIHVuaXF1ZSB3YXksXG4gKiBzbyB3ZSdyZSBleHBvc2luZyBzcGVjaWFsIGZ1bmN0aW9ucyBmb3IgZWFjaC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGF0UnVsZU5hbWUoaWRlbnRpZmllciAvKjogc3RyaW5nKi8pIC8qOiBib29sZWFuKi8ge1xuICAgIHJldHVybiBwcmVmaXhlcy5yZW1vdmVbYEAke2lkZW50aWZpZXIudG9Mb3dlckNhc2UoKX1gXTtcbiAgfSxcblxuICBzZWxlY3RvcihpZGVudGlmaWVyIC8qOiBzdHJpbmcqLykgLyo6IGJvb2xlYW4qLyB7XG4gICAgcmV0dXJuIHByZWZpeGVzLnJlbW92ZS5zZWxlY3RvcnMuc29tZShzZWxlY3Rvck9iaiA9PiB7XG4gICAgICByZXR1cm4gaWRlbnRpZmllci50b0xvd2VyQ2FzZSgpID09PSBzZWxlY3Rvck9iai5wcmVmaXhlZDtcbiAgICB9KTtcbiAgfSxcblxuICBtZWRpYUZlYXR1cmVOYW1lKGlkZW50aWZpZXIgLyo6IHN0cmluZyovKSAvKjogYm9vbGVhbiovIHtcbiAgICByZXR1cm4gaWRlbnRpZmllci50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJkZXZpY2UtcGl4ZWwtcmF0aW9cIikgIT09IC0xO1xuICB9LFxuXG4gIHByb3BlcnR5KGlkZW50aWZpZXIgLyo6IHN0cmluZyovKSAvKjogYm9vbGVhbiovIHtcbiAgICByZXR1cm4gYXV0b3ByZWZpeGVyLmRhdGEucHJlZml4ZXNbXG4gICAgICBwcmVmaXhlcy51bnByZWZpeGVkKGlkZW50aWZpZXIudG9Mb3dlckNhc2UoKSlcbiAgICBdO1xuICB9LFxuXG4gIHByb3BlcnR5VmFsdWUocHJvcCAvKjogc3RyaW5nKi8sIHZhbHVlIC8qOiBzdHJpbmcqLykgLyo6IGJvb2xlYW4qLyB7XG4gICAgY29uc3QgcG9zc2libGVQcmVmaXhhYmxlVmFsdWVzID1cbiAgICAgIHByZWZpeGVzLnJlbW92ZVtwcm9wLnRvTG93ZXJDYXNlKCldICYmXG4gICAgICBwcmVmaXhlcy5yZW1vdmVbcHJvcC50b0xvd2VyQ2FzZSgpXS52YWx1ZXM7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvc3NpYmxlUHJlZml4YWJsZVZhbHVlcyAmJlxuICAgICAgcG9zc2libGVQcmVmaXhhYmxlVmFsdWVzLnNvbWUodmFsdWVPYmogPT4ge1xuICAgICAgICByZXR1cm4gdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gdmFsdWVPYmoucHJlZml4ZWQ7XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn07XG4iXX0=