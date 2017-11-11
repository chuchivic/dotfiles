(function() {
  module.exports = function(string) {
    if (string) {
      return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    } else {
      return '';
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9lc2NhcGUtcmVnLWV4cC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE1BQUQ7SUFDZixJQUFHLE1BQUg7YUFDRSxNQUFNLENBQUMsT0FBUCxDQUFlLHdCQUFmLEVBQXlDLE1BQXpDLEVBREY7S0FBQSxNQUFBO2FBR0UsR0FIRjs7RUFEZTtBQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdW5kZXJzY29yZS1wbHVzL2Jsb2IvNGEwMjJjZjcyL3NyYy91bmRlcnNjb3JlLXBsdXMuY29mZmVlI0wxMzYtTDE0MFxuXG5tb2R1bGUuZXhwb3J0cyA9IChzdHJpbmcpIC0+XG4gIGlmIHN0cmluZ1xuICAgIHN0cmluZy5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKVxuICBlbHNlXG4gICAgJydcbiJdfQ==
