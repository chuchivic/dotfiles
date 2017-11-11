
"use strict";
var _ = require("lodash");
var assignDisabledRanges = require("./assignDisabledRanges");
var configurationError = require("./utils/configurationError");
var path = require("path");
var ruleDefinitions = require("./rules");

// Run stylelint on a PostCSS Result, either one that is provided
// or one that we create
module.exports = function (stylelint, /*: stylelint$internalApi*/
options /*: {
        code?: string,
        codeFilename?: string, // Must be an absolute file path
        filePath?: string, // Must be an absolute file path
        existingPostcssResult?: Object,
        }*/
) /*: Promise<Object>*/{
  options = options || {};

  if (!options.filePath && options.code === undefined && !options.existingPostcssResult) {
    return Promise.reject(new Error("You must provide filePath, code, or existingPostcssResult"));
  }

  var isCodeNotFile = options.code !== undefined;

  var inputFilePath = isCodeNotFile ? options.codeFilename : options.filePath;
  if (inputFilePath !== undefined && !path.isAbsolute(inputFilePath)) {
    if (isCodeNotFile) {
      return Promise.reject(new Error("codeFilename must be an absolute path"));
    } else {
      return Promise.reject(new Error("filePath must be an absolute path"));
    }
  }

  var getIsIgnored = stylelint.isPathIgnored(inputFilePath)["catch"](function (err) {
    if (isCodeNotFile && err.code === "ENOENT") return false;
    throw err;
  });

  return getIsIgnored.then(function (isIgnored) {
    if (isIgnored) {
      var postcssResult = options.existingPostcssResult || createEmptyPostcssResult(inputFilePath);
      postcssResult.stylelint = postcssResult.stylelint || {};
      postcssResult.stylelint.ignored = true;
      postcssResult.standaloneIgnored = true; // TODO: remove need for this
      return postcssResult;
    }

    var configSearchPath = stylelint._options.configFile || inputFilePath;

    var getConfig = stylelint.getConfigForFile(configSearchPath)["catch"](function (err) {
      if (isCodeNotFile && err.code === "ENOENT") return stylelint.getConfigForFile(process.cwd());
      throw err;
    });

    return getConfig.then(function (result) {
      var config = result.config;
      var existingPostcssResult = options.existingPostcssResult;

      if (existingPostcssResult) {
        return lintPostcssResult(stylelint, existingPostcssResult, config).then(function () {
          return existingPostcssResult;
        });
      }

      return stylelint._getPostcssResult({
        code: options.code,
        codeFilename: options.codeFilename,
        filePath: inputFilePath,
        codeProcessors: config.codeProcessors
      }).then(function (postcssResult) {
        return lintPostcssResult(stylelint, postcssResult, config).then(function () {
          return postcssResult;
        });
      });
    });
  });
};

function lintPostcssResult(stylelint, /*: stylelint$internalApi*/
postcssResult, /*: Object*/
config /*: stylelint$config*/
) /*: Promise<>*/{
  postcssResult.stylelint = postcssResult.stylelint || {};
  postcssResult.stylelint.ruleSeverities = {};
  postcssResult.stylelint.customMessages = {};
  postcssResult.stylelint.quiet = config.quiet;

  var postcssRoot = postcssResult.root;
  assignDisabledRanges(postcssRoot, postcssResult);
  if (stylelint._options.reportNeedlessDisables || stylelint._options.ignoreDisables) {
    postcssResult.stylelint.ignoreDisables = true;
  }

  // Promises for the rules. Although the rule code runs synchronously now,
  // the use of Promises makes it compatible with the possibility of async
  // rules down the line.
  var performRules = [];

  var rules = config.rules ? Object.keys(config.rules) : [];

  rules.forEach(function (ruleName) {
    var ruleFunction = ruleDefinitions[ruleName] || _.get(config, ["pluginFunctions", ruleName]);

    if (ruleFunction === undefined) {
      throw configurationError("Undefined rule " + ruleName);
    }

    var ruleSettings = _.get(config, ["rules", ruleName]);
    if (ruleSettings === null || ruleSettings[0] === null) {
      return;
    }

    var primaryOption = ruleSettings[0];
    var secondaryOptions = ruleSettings[1];

    // Log the rule's severity in the PostCSS result
    var defaultSeverity = config.defaultSeverity || "error";
    postcssResult.stylelint.ruleSeverities[ruleName] = _.get(secondaryOptions, "severity", defaultSeverity);
    postcssResult.stylelint.customMessages[ruleName] = _.get(secondaryOptions, "message");

    var performRule = Promise.resolve().then(function () {
      return ruleFunction(primaryOption, secondaryOptions)(postcssRoot, postcssResult);
    });
    performRules.push(performRule);
  });

  return Promise.all(performRules);
}

function createEmptyPostcssResult(filePath /*:: ?: string*/) /*: Object*/{
  return {
    root: {
      source: {
        input: { file: filePath }
      }
    },
    messages: [],
    stylelint: { stylelintError: null }
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbGludFNvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBO0FBQ1osSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNCLElBQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDLENBQUE7QUFDOUQsSUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtBQUNoRSxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDNUIsSUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBOzs7O0FBSTFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFDZixTQUFTO0FBQ1QsT0FBTzs7Ozs7O3VCQU1jO0FBQ3JCLFNBQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFBOztBQUV2QixNQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtBQUNyRixXQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQyxDQUFBO0dBQzlGOztBQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFBOztBQUVoRCxNQUFNLGFBQWEsR0FBRyxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFBO0FBQzdFLE1BQUksYUFBYSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDbEUsUUFBSSxhQUFhLEVBQUU7QUFDakIsYUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElB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QyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDdkcsaUJBQWEsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUE7O0FBRXJGLFFBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUMvQyxhQUFPLFlBQVksQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUE7S0FDakYsQ0FBQyxDQUFBO0FBQ0YsZ0JBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7R0FDL0IsQ0FBQyxDQUFBOztBQUVGLFNBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtDQUNqQzs7QUFFRCxTQUFTLHdCQUF3QixDQUFDLFFBQVEsK0JBQThCO0FBQ3RFLFNBQU87QUFDTCxRQUFJLEVBQUU7QUFDSixZQUFNLEVBQUU7QUFDTixhQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO09BQzFCO0tBQ0Y7QUFDRCxZQUFRLEVBQUUsRUFBRTtBQUNaLGFBQVMsRUFBRSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUU7R0FDcEMsQ0FBQTtDQUNGIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbGludFNvdXJjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIlxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcbmNvbnN0IGFzc2lnbkRpc2FibGVkUmFuZ2VzID0gcmVxdWlyZShcIi4vYXNzaWduRGlzYWJsZWRSYW5nZXNcIilcbmNvbnN0IGNvbmZpZ3VyYXRpb25FcnJvciA9IHJlcXVpcmUoXCIuL3V0aWxzL2NvbmZpZ3VyYXRpb25FcnJvclwiKVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5jb25zdCBydWxlRGVmaW5pdGlvbnMgPSByZXF1aXJlKFwiLi9ydWxlc1wiKVxuXG4vLyBSdW4gc3R5bGVsaW50IG9uIGEgUG9zdENTUyBSZXN1bHQsIGVpdGhlciBvbmUgdGhhdCBpcyBwcm92aWRlZFxuLy8gb3Igb25lIHRoYXQgd2UgY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChcbiAgc3R5bGVsaW50Lyo6IHN0eWxlbGludCRpbnRlcm5hbEFwaSovLFxuICBvcHRpb25zLyo6IHtcbiAgICBjb2RlPzogc3RyaW5nLFxuICAgIGNvZGVGaWxlbmFtZT86IHN0cmluZywgLy8gTXVzdCBiZSBhbiBhYnNvbHV0ZSBmaWxlIHBhdGhcbiAgICBmaWxlUGF0aD86IHN0cmluZywgLy8gTXVzdCBiZSBhbiBhYnNvbHV0ZSBmaWxlIHBhdGhcbiAgICBleGlzdGluZ1Bvc3Rjc3NSZXN1bHQ/OiBPYmplY3QsXG4gIH0qL1xuKS8qOiBQcm9taXNlPE9iamVjdD4qLyB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgaWYgKCFvcHRpb25zLmZpbGVQYXRoICYmIG9wdGlvbnMuY29kZSA9PT0gdW5kZWZpbmVkICYmICFvcHRpb25zLmV4aXN0aW5nUG9zdGNzc1Jlc3VsdCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJZb3UgbXVzdCBwcm92aWRlIGZpbGVQYXRoLCBjb2RlLCBvciBleGlzdGluZ1Bvc3Rjc3NSZXN1bHRcIikpXG4gIH1cblxuICBjb25zdCBpc0NvZGVOb3RGaWxlID0gb3B0aW9ucy5jb2RlICE9PSB1bmRlZmluZWRcblxuICBjb25zdCBpbnB1dEZpbGVQYXRoID0gaXNDb2RlTm90RmlsZSA/IG9wdGlvbnMuY29kZUZpbGVuYW1lIDogb3B0aW9ucy5maWxlUGF0aFxuICBpZiAoaW5wdXRGaWxlUGF0aCAhPT0gdW5kZWZpbmVkICYmICFwYXRoLmlzQWJzb2x1dGUoaW5wdXRGaWxlUGF0aCkpIHtcbiAgICBpZiAoaXNDb2RlTm90RmlsZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcImNvZGVGaWxlbmFtZSBtdXN0IGJlIGFuIGFic29sdXRlIHBhdGhcIikpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJmaWxlUGF0aCBtdXN0IGJlIGFuIGFic29sdXRlIHBhdGhcIikpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgZ2V0SXNJZ25vcmVkID0gc3R5bGVsaW50LmlzUGF0aElnbm9yZWQoaW5wdXRGaWxlUGF0aCkuY2F0Y2goZXJyID0+IHtcbiAgICBpZiAoaXNDb2RlTm90RmlsZSAmJiBlcnIuY29kZSA9PT0gXCJFTk9FTlRcIikgcmV0dXJuIGZhbHNlXG4gICAgdGhyb3cgZXJyXG4gIH0pXG5cbiAgcmV0dXJuIGdldElzSWdub3JlZC50aGVuKGlzSWdub3JlZCA9PiB7XG4gICAgaWYgKGlzSWdub3JlZCkge1xuICAgICAgY29uc3QgcG9zdGNzc1Jlc3VsdCA9IG9wdGlvbnMuZXhpc3RpbmdQb3N0Y3NzUmVzdWx0IHx8IGNyZWF0ZUVtcHR5UG9zdGNzc1Jlc3VsdChpbnB1dEZpbGVQYXRoKVxuICAgICAgcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQgPSBwb3N0Y3NzUmVzdWx0LnN0eWxlbGludCB8fCB7fVxuICAgICAgcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQuaWdub3JlZCA9IHRydWVcbiAgICAgIHBvc3Rjc3NSZXN1bHQuc3RhbmRhbG9uZUlnbm9yZWQgPSB0cnVlIC8vIFRPRE86IHJlbW92ZSBuZWVkIGZvciB0aGlzXG4gICAgICByZXR1cm4gcG9zdGNzc1Jlc3VsdFxuICAgIH1cblxuICAgIGNvbnN0IGNvbmZpZ1NlYXJjaFBhdGggPSBzdHlsZWxpbnQuX29wdGlvbnMuY29uZmlnRmlsZSB8fCBpbnB1dEZpbGVQYXRoXG5cbiAgICBjb25zdCBnZXRDb25maWcgPSBzdHlsZWxpbnQuZ2V0Q29uZmlnRm9yRmlsZShjb25maWdTZWFyY2hQYXRoKS5jYXRjaChlcnIgPT4ge1xuICAgICAgaWYgKGlzQ29kZU5vdEZpbGUgJiYgZXJyLmNvZGUgPT09IFwiRU5PRU5UXCIpIHJldHVybiBzdHlsZWxpbnQuZ2V0Q29uZmlnRm9yRmlsZShwcm9jZXNzLmN3ZCgpKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfSlcblxuICAgIHJldHVybiBnZXRDb25maWcudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICBjb25zdCBjb25maWcgPSByZXN1bHQuY29uZmlnXG4gICAgICBjb25zdCBleGlzdGluZ1Bvc3Rjc3NSZXN1bHQgPSBvcHRpb25zLmV4aXN0aW5nUG9zdGNzc1Jlc3VsdFxuXG4gICAgICBpZiAoZXhpc3RpbmdQb3N0Y3NzUmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBsaW50UG9zdGNzc1Jlc3VsdChzdHlsZWxpbnQsIGV4aXN0aW5nUG9zdGNzc1Jlc3VsdCwgY29uZmlnKS50aGVuKCgpID0+IGV4aXN0aW5nUG9zdGNzc1Jlc3VsdClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0eWxlbGludC5fZ2V0UG9zdGNzc1Jlc3VsdCh7XG4gICAgICAgIGNvZGU6IG9wdGlvbnMuY29kZSxcbiAgICAgICAgY29kZUZpbGVuYW1lOiBvcHRpb25zLmNvZGVGaWxlbmFtZSxcbiAgICAgICAgZmlsZVBhdGg6IGlucHV0RmlsZVBhdGgsXG4gICAgICAgIGNvZGVQcm9jZXNzb3JzOiBjb25maWcuY29kZVByb2Nlc3NvcnMsXG4gICAgICB9KS50aGVuKHBvc3Rjc3NSZXN1bHQgPT4ge1xuICAgICAgICByZXR1cm4gbGludFBvc3Rjc3NSZXN1bHQoc3R5bGVsaW50LCBwb3N0Y3NzUmVzdWx0LCBjb25maWcpLnRoZW4oKCkgPT4gcG9zdGNzc1Jlc3VsdClcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gbGludFBvc3Rjc3NSZXN1bHQoXG4gIHN0eWxlbGludC8qOiBzdHlsZWxpbnQkaW50ZXJuYWxBcGkqLyxcbiAgcG9zdGNzc1Jlc3VsdC8qOiBPYmplY3QqLyxcbiAgY29uZmlnLyo6IHN0eWxlbGludCRjb25maWcqL1xuKS8qOiBQcm9taXNlPD4qLyB7XG4gIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50ID0gcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQgfHwge31cbiAgcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQucnVsZVNldmVyaXRpZXMgPSB7fVxuICBwb3N0Y3NzUmVzdWx0LnN0eWxlbGludC5jdXN0b21NZXNzYWdlcyA9IHt9XG4gIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LnF1aWV0ID0gY29uZmlnLnF1aWV0XG5cbiAgY29uc3QgcG9zdGNzc1Jvb3QgPSBwb3N0Y3NzUmVzdWx0LnJvb3RcbiAgYXNzaWduRGlzYWJsZWRSYW5nZXMocG9zdGNzc1Jvb3QsIHBvc3Rjc3NSZXN1bHQpXG4gIGlmIChzdHlsZWxpbnQuX29wdGlvbnMucmVwb3J0TmVlZGxlc3NEaXNhYmxlcyB8fCBzdHlsZWxpbnQuX29wdGlvbnMuaWdub3JlRGlzYWJsZXMpIHtcbiAgICBwb3N0Y3NzUmVzdWx0LnN0eWxlbGludC5pZ25vcmVEaXNhYmxlcyA9IHRydWVcbiAgfVxuXG4gIC8vIFByb21pc2VzIGZvciB0aGUgcnVsZXMuIEFsdGhvdWdoIHRoZSBydWxlIGNvZGUgcnVucyBzeW5jaHJvbm91c2x5IG5vdyxcbiAgLy8gdGhlIHVzZSBvZiBQcm9taXNlcyBtYWtlcyBpdCBjb21wYXRpYmxlIHdpdGggdGhlIHBvc3NpYmlsaXR5IG9mIGFzeW5jXG4gIC8vIHJ1bGVzIGRvd24gdGhlIGxpbmUuXG4gIGNvbnN0IHBlcmZvcm1SdWxlcyA9IFtdXG5cbiAgY29uc3QgcnVsZXMgPSBjb25maWcucnVsZXMgPyBPYmplY3Qua2V5cyhjb25maWcucnVsZXMpIDogW11cblxuICBydWxlcy5mb3JFYWNoKHJ1bGVOYW1lID0+IHtcbiAgICBjb25zdCBydWxlRnVuY3Rpb24gPSBydWxlRGVmaW5pdGlvbnNbcnVsZU5hbWVdIHx8IF8uZ2V0KGNvbmZpZywgWyBcInBsdWdpbkZ1bmN0aW9uc1wiLCBydWxlTmFtZSBdKVxuXG4gICAgaWYgKHJ1bGVGdW5jdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBjb25maWd1cmF0aW9uRXJyb3IoYFVuZGVmaW5lZCBydWxlICR7cnVsZU5hbWV9YClcbiAgICB9XG5cbiAgICBjb25zdCBydWxlU2V0dGluZ3MgPSBfLmdldChjb25maWcsIFsgXCJydWxlc1wiLCBydWxlTmFtZSBdKVxuICAgIGlmIChydWxlU2V0dGluZ3MgPT09IG51bGwgfHwgcnVsZVNldHRpbmdzWzBdID09PSBudWxsKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwcmltYXJ5T3B0aW9uID0gcnVsZVNldHRpbmdzWzBdXG4gICAgY29uc3Qgc2Vjb25kYXJ5T3B0aW9ucyA9IHJ1bGVTZXR0aW5nc1sxXVxuXG4gICAgLy8gTG9nIHRoZSBydWxlJ3Mgc2V2ZXJpdHkgaW4gdGhlIFBvc3RDU1MgcmVzdWx0XG4gICAgY29uc3QgZGVmYXVsdFNldmVyaXR5ID0gY29uZmlnLmRlZmF1bHRTZXZlcml0eSB8fCBcImVycm9yXCJcbiAgICBwb3N0Y3NzUmVzdWx0LnN0eWxlbGludC5ydWxlU2V2ZXJpdGllc1tydWxlTmFtZV0gPSBfLmdldChzZWNvbmRhcnlPcHRpb25zLCBcInNldmVyaXR5XCIsIGRlZmF1bHRTZXZlcml0eSlcbiAgICBwb3N0Y3NzUmVzdWx0LnN0eWxlbGludC5jdXN0b21NZXNzYWdlc1tydWxlTmFtZV0gPSBfLmdldChzZWNvbmRhcnlPcHRpb25zLCBcIm1lc3NhZ2VcIilcblxuICAgIGNvbnN0IHBlcmZvcm1SdWxlID0gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gcnVsZUZ1bmN0aW9uKHByaW1hcnlPcHRpb24sIHNlY29uZGFyeU9wdGlvbnMpKHBvc3Rjc3NSb290LCBwb3N0Y3NzUmVzdWx0KVxuICAgIH0pXG4gICAgcGVyZm9ybVJ1bGVzLnB1c2gocGVyZm9ybVJ1bGUpXG4gIH0pXG5cbiAgcmV0dXJuIFByb21pc2UuYWxsKHBlcmZvcm1SdWxlcylcbn1cblxuZnVuY3Rpb24gY3JlYXRlRW1wdHlQb3N0Y3NzUmVzdWx0KGZpbGVQYXRoLyo6OiA/OiBzdHJpbmcqLykvKjogT2JqZWN0Ki8ge1xuICByZXR1cm4ge1xuICAgIHJvb3Q6IHtcbiAgICAgIHNvdXJjZToge1xuICAgICAgICBpbnB1dDogeyBmaWxlOiBmaWxlUGF0aCB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIG1lc3NhZ2VzOiBbXSxcbiAgICBzdHlsZWxpbnQ6IHsgc3R5bGVsaW50RXJyb3I6IG51bGwgfSxcbiAgfVxufVxuIl19