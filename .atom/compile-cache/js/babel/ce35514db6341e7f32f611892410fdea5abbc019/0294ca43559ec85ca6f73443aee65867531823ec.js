
"use strict";
var augmentConfig = require("./augmentConfig");
var _ = require("lodash");
var cosmiconfig = require("cosmiconfig");
var createStylelintResult = require("./createStylelintResult");
var getConfigForFile = require("./getConfigForFile");
var getPostcssResult = require("./getPostcssResult");
var isPathIgnored = require("./isPathIgnored");
var lintSource = require("./lintSource");

// The stylelint "internal API" is passed among functions
// so that methods on a stylelint instance can invoke
// each other while sharing options and caches
module.exports = function (options /*: stylelint$options*/) /*: stylelint$internalApi*/{
  options = options || {};
  var stylelint /*: Object*/ = { _options: options };

  // Two separate explorers so they can each have their own transform
  // function whose results are cached by cosmiconfig
  stylelint._fullExplorer = cosmiconfig("stylelint", {
    argv: false,
    rcExtensions: true,
    transform: _.partial(augmentConfig.augmentConfigFull, stylelint)
  });
  stylelint._extendExplorer = cosmiconfig(null, {
    argv: false,
    transform: _.partial(augmentConfig.augmentConfigExtended, stylelint)
  });

  stylelint._specifiedConfigCache = new Map();
  stylelint._postcssResultCache = new Map();
  stylelint._createStylelintResult = _.partial(createStylelintResult, stylelint);
  stylelint._getPostcssResult = _.partial(getPostcssResult, stylelint);
  stylelint._lintSource = _.partial(lintSource, stylelint);

  stylelint.getConfigForFile = _.partial(getConfigForFile, stylelint);
  stylelint.isPathIgnored = _.partial(isPathIgnored, stylelint);

  return stylelint;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvY3JlYXRlU3R5bGVsaW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUE7QUFDWixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtBQUNoRCxJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDM0IsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQzFDLElBQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFDaEUsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtBQUN0RCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3RELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBQ2hELElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTs7Ozs7QUFLMUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLE9BQU8scURBQW9EO0FBQ3BGLFNBQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFBO0FBQ3ZCLE1BQU0sU0FBUyxnQkFBZSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQTs7OztBQUluRCxXQUFTLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxXQUFXLEVBQUU7QUFDakQsUUFBSSxFQUFFLEtBQUs7QUFDWCxnQkFBWSxFQUFFLElBQUk7QUFDbEIsYUFBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQztHQUNqRSxDQUFDLENBQUE7QUFDRixXQUFTLENBQUMsZUFBZSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDNUMsUUFBSSxFQUFFLEtBQUs7QUFDWCxhQUFTLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsU0FBUyxDQUFDO0dBQ3JFLENBQUMsQ0FBQTs7QUFFRixXQUFTLENBQUMscUJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUMzQyxXQUFTLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN6QyxXQUFTLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUM5RSxXQUFTLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUNwRSxXQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFBOztBQUV4RCxXQUFTLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUNuRSxXQUFTLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFBOztBQUU3RCxTQUFPLFNBQVMsQ0FBQTtDQUNqQixDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvY3JlYXRlU3R5bGVsaW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiXG5jb25zdCBhdWdtZW50Q29uZmlnID0gcmVxdWlyZShcIi4vYXVnbWVudENvbmZpZ1wiKVxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcbmNvbnN0IGNvc21pY29uZmlnID0gcmVxdWlyZShcImNvc21pY29uZmlnXCIpXG5jb25zdCBjcmVhdGVTdHlsZWxpbnRSZXN1bHQgPSByZXF1aXJlKFwiLi9jcmVhdGVTdHlsZWxpbnRSZXN1bHRcIilcbmNvbnN0IGdldENvbmZpZ0ZvckZpbGUgPSByZXF1aXJlKFwiLi9nZXRDb25maWdGb3JGaWxlXCIpXG5jb25zdCBnZXRQb3N0Y3NzUmVzdWx0ID0gcmVxdWlyZShcIi4vZ2V0UG9zdGNzc1Jlc3VsdFwiKVxuY29uc3QgaXNQYXRoSWdub3JlZCA9IHJlcXVpcmUoXCIuL2lzUGF0aElnbm9yZWRcIilcbmNvbnN0IGxpbnRTb3VyY2UgPSByZXF1aXJlKFwiLi9saW50U291cmNlXCIpXG5cbi8vIFRoZSBzdHlsZWxpbnQgXCJpbnRlcm5hbCBBUElcIiBpcyBwYXNzZWQgYW1vbmcgZnVuY3Rpb25zXG4vLyBzbyB0aGF0IG1ldGhvZHMgb24gYSBzdHlsZWxpbnQgaW5zdGFuY2UgY2FuIGludm9rZVxuLy8gZWFjaCBvdGhlciB3aGlsZSBzaGFyaW5nIG9wdGlvbnMgYW5kIGNhY2hlc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucy8qOiBzdHlsZWxpbnQkb3B0aW9ucyovKS8qOiBzdHlsZWxpbnQkaW50ZXJuYWxBcGkqLyB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIGNvbnN0IHN0eWxlbGludC8qOiBPYmplY3QqLyA9IHsgX29wdGlvbnM6IG9wdGlvbnMgfVxuXG4gIC8vIFR3byBzZXBhcmF0ZSBleHBsb3JlcnMgc28gdGhleSBjYW4gZWFjaCBoYXZlIHRoZWlyIG93biB0cmFuc2Zvcm1cbiAgLy8gZnVuY3Rpb24gd2hvc2UgcmVzdWx0cyBhcmUgY2FjaGVkIGJ5IGNvc21pY29uZmlnXG4gIHN0eWxlbGludC5fZnVsbEV4cGxvcmVyID0gY29zbWljb25maWcoXCJzdHlsZWxpbnRcIiwge1xuICAgIGFyZ3Y6IGZhbHNlLFxuICAgIHJjRXh0ZW5zaW9uczogdHJ1ZSxcbiAgICB0cmFuc2Zvcm06IF8ucGFydGlhbChhdWdtZW50Q29uZmlnLmF1Z21lbnRDb25maWdGdWxsLCBzdHlsZWxpbnQpLFxuICB9KVxuICBzdHlsZWxpbnQuX2V4dGVuZEV4cGxvcmVyID0gY29zbWljb25maWcobnVsbCwge1xuICAgIGFyZ3Y6IGZhbHNlLFxuICAgIHRyYW5zZm9ybTogXy5wYXJ0aWFsKGF1Z21lbnRDb25maWcuYXVnbWVudENvbmZpZ0V4dGVuZGVkLCBzdHlsZWxpbnQpLFxuICB9KVxuXG4gIHN0eWxlbGludC5fc3BlY2lmaWVkQ29uZmlnQ2FjaGUgPSBuZXcgTWFwKClcbiAgc3R5bGVsaW50Ll9wb3N0Y3NzUmVzdWx0Q2FjaGUgPSBuZXcgTWFwKClcbiAgc3R5bGVsaW50Ll9jcmVhdGVTdHlsZWxpbnRSZXN1bHQgPSBfLnBhcnRpYWwoY3JlYXRlU3R5bGVsaW50UmVzdWx0LCBzdHlsZWxpbnQpXG4gIHN0eWxlbGludC5fZ2V0UG9zdGNzc1Jlc3VsdCA9IF8ucGFydGlhbChnZXRQb3N0Y3NzUmVzdWx0LCBzdHlsZWxpbnQpXG4gIHN0eWxlbGludC5fbGludFNvdXJjZSA9IF8ucGFydGlhbChsaW50U291cmNlLCBzdHlsZWxpbnQpXG5cbiAgc3R5bGVsaW50LmdldENvbmZpZ0ZvckZpbGUgPSBfLnBhcnRpYWwoZ2V0Q29uZmlnRm9yRmlsZSwgc3R5bGVsaW50KVxuICBzdHlsZWxpbnQuaXNQYXRoSWdub3JlZCA9IF8ucGFydGlhbChpc1BhdGhJZ25vcmVkLCBzdHlsZWxpbnQpXG5cbiAgcmV0dXJuIHN0eWxlbGludFxufVxuIl19