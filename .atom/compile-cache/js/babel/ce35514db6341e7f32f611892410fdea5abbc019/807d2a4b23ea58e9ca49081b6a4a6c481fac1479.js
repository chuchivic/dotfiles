
"use strict";

/**
 * Check whether a media feature is a range context one
 *
 * @param {string} media feature
 * @return {boolean} If `true`, media feature is a range context one
 */
module.exports = function (mediaFeature /*: string*/) /*: boolean*/{
  return mediaFeature.indexOf("=") !== -1 || mediaFeature.indexOf("<") !== -1 || mediaFeature.indexOf(">") !== -1;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNSYW5nZUNvbnRleHRNZWRpYUZlYXR1cmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7Ozs7Ozs7QUFRYixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsWUFBWSw0QkFBNkI7QUFDakUsU0FDRSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUNoQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUNoQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUNoQztDQUNILENBQUMiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9ub2RlX21vZHVsZXMvc3R5bGVsaW50L2xpYi91dGlscy9pc1JhbmdlQ29udGV4dE1lZGlhRmVhdHVyZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgbWVkaWEgZmVhdHVyZSBpcyBhIHJhbmdlIGNvbnRleHQgb25lXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1lZGlhIGZlYXR1cmVcbiAqIEByZXR1cm4ge2Jvb2xlYW59IElmIGB0cnVlYCwgbWVkaWEgZmVhdHVyZSBpcyBhIHJhbmdlIGNvbnRleHQgb25lXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWVkaWFGZWF0dXJlIC8qOiBzdHJpbmcqLykgLyo6IGJvb2xlYW4qLyB7XG4gIHJldHVybiAoXG4gICAgbWVkaWFGZWF0dXJlLmluZGV4T2YoXCI9XCIpICE9PSAtMSB8fFxuICAgIG1lZGlhRmVhdHVyZS5pbmRleE9mKFwiPFwiKSAhPT0gLTEgfHxcbiAgICBtZWRpYUZlYXR1cmUuaW5kZXhPZihcIj5cIikgIT09IC0xXG4gICk7XG59O1xuIl19