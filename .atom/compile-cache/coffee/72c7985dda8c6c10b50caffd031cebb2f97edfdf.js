(function() {
  var Range;

  Range = require('atom').Range;

  module.exports = {
    copyType: function(text) {
      if (text.lastIndexOf("\n") === text.length - 1) {
        return 'linewise';
      } else if (text.lastIndexOf("\r") === text.length - 1) {
        return 'linewise';
      } else {
        return 'character';
      }
    },
    mergeRanges: function(oldRange, newRange) {
      oldRange = Range.fromObject(oldRange);
      newRange = Range.fromObject(newRange);
      if (oldRange.isEmpty()) {
        return newRange;
      } else {
        return oldRange.union(newRange);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3V0aWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsUUFBUyxPQUFBLENBQVEsTUFBUjs7RUFFVixNQUFNLENBQUMsT0FBUCxHQU9FO0lBQUEsUUFBQSxFQUFVLFNBQUMsSUFBRDtNQUNSLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsQ0FBQSxLQUEwQixJQUFJLENBQUMsTUFBTCxHQUFjLENBQTNDO2VBQ0UsV0FERjtPQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFqQixDQUFBLEtBQTBCLElBQUksQ0FBQyxNQUFMLEdBQWMsQ0FBM0M7ZUFDSCxXQURHO09BQUEsTUFBQTtlQUdILFlBSEc7O0lBSEcsQ0FBVjtJQVdBLFdBQUEsRUFBYSxTQUFDLFFBQUQsRUFBVyxRQUFYO01BQ1gsUUFBQSxHQUFXLEtBQUssQ0FBQyxVQUFOLENBQWlCLFFBQWpCO01BQ1gsUUFBQSxHQUFXLEtBQUssQ0FBQyxVQUFOLENBQWlCLFFBQWpCO01BQ1gsSUFBRyxRQUFRLENBQUMsT0FBVCxDQUFBLENBQUg7ZUFDRSxTQURGO09BQUEsTUFBQTtlQUdFLFFBQVEsQ0FBQyxLQUFULENBQWUsUUFBZixFQUhGOztJQUhXLENBWGI7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuICAjIFB1YmxpYzogRGV0ZXJtaW5lcyBpZiBhIHN0cmluZyBzaG91bGQgYmUgY29uc2lkZXJlZCBsaW5ld2lzZSBvciBjaGFyYWN0ZXJcbiAgI1xuICAjIHRleHQgLSBUaGUgc3RyaW5nIHRvIGNvbnNpZGVyXG4gICNcbiAgIyBSZXR1cm5zICdsaW5ld2lzZScgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBsaW5lIHJldHVybiBhbmQgJ2NoYXJhY3RlcidcbiAgIyAgb3RoZXJ3aXNlLlxuICBjb3B5VHlwZTogKHRleHQpIC0+XG4gICAgaWYgdGV4dC5sYXN0SW5kZXhPZihcIlxcblwiKSBpcyB0ZXh0Lmxlbmd0aCAtIDFcbiAgICAgICdsaW5ld2lzZSdcbiAgICBlbHNlIGlmIHRleHQubGFzdEluZGV4T2YoXCJcXHJcIikgaXMgdGV4dC5sZW5ndGggLSAxXG4gICAgICAnbGluZXdpc2UnXG4gICAgZWxzZVxuICAgICAgJ2NoYXJhY3RlcidcblxuICAjIFB1YmxpYzogcmV0dXJuIGEgdW5pb24gb2YgdHdvIHJhbmdlcywgb3Igc2ltcGx5IHRoZSBuZXdSYW5nZSBpZiB0aGUgb2xkUmFuZ2UgaXMgZW1wdHkuXG4gICNcbiAgIyBSZXR1cm5zIGEgUmFuZ2VcbiAgbWVyZ2VSYW5nZXM6IChvbGRSYW5nZSwgbmV3UmFuZ2UpIC0+XG4gICAgb2xkUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0IG9sZFJhbmdlXG4gICAgbmV3UmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0IG5ld1JhbmdlXG4gICAgaWYgb2xkUmFuZ2UuaXNFbXB0eSgpXG4gICAgICBuZXdSYW5nZVxuICAgIGVsc2VcbiAgICAgIG9sZFJhbmdlLnVuaW9uKG5ld1JhbmdlKVxuIl19
