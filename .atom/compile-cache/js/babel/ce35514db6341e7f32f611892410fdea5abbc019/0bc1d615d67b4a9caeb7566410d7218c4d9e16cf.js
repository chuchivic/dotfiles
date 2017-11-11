
"use strict";

var keywordSets = require("../reference/keywordSets");

/**
 * Check whether a string is a keyframe selector.
 */
module.exports = function (selector /*: string*/) /*: boolean*/{
  if (keywordSets.keyframeSelectorKeywords.has(selector)) {
    return true;
  }

  // Percentages
  if (/^(?:\d+\.?\d*|\d*\.?\d+)%$/.test(selector)) {
    return true;
  }

  return false;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNLZXlmcmFtZVNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7Ozs7O0FBS3hELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBUyxRQUFRLDRCQUE2QjtBQUM3RCxNQUFJLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDdEQsV0FBTyxJQUFJLENBQUM7R0FDYjs7O0FBR0QsTUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDL0MsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkLENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9pc0tleWZyYW1lU2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IGtleXdvcmRTZXRzID0gcmVxdWlyZShcIi4uL3JlZmVyZW5jZS9rZXl3b3JkU2V0c1wiKTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RyaW5nIGlzIGEga2V5ZnJhbWUgc2VsZWN0b3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IgLyo6IHN0cmluZyovKSAvKjogYm9vbGVhbiovIHtcbiAgaWYgKGtleXdvcmRTZXRzLmtleWZyYW1lU2VsZWN0b3JLZXl3b3Jkcy5oYXMoc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBQZXJjZW50YWdlc1xuICBpZiAoL14oPzpcXGQrXFwuP1xcZCp8XFxkKlxcLj9cXGQrKSUkLy50ZXN0KHNlbGVjdG9yKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcbiJdfQ==