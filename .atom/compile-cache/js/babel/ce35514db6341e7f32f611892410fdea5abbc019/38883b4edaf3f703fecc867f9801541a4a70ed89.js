
"use strict";

/**
 * Check whether a word is a variable i.e var(--custom-property).
 */
module.exports = function (word /*: string*/) /*: boolean*/{
  return word.toLowerCase().slice(0, 4) === "var(";
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNWYXJpYWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOzs7OztBQUtaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxJQUFJLDRCQUEyQjtBQUN4RCxTQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQTtDQUNqRCxDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNWYXJpYWJsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSB3b3JkIGlzIGEgdmFyaWFibGUgaS5lIHZhcigtLWN1c3RvbS1wcm9wZXJ0eSkuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHdvcmQvKjogc3RyaW5nKi8pLyo6IGJvb2xlYW4qLyB7XG4gIHJldHVybiB3b3JkLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgNCkgPT09IFwidmFyKFwiXG59XG4iXX0=