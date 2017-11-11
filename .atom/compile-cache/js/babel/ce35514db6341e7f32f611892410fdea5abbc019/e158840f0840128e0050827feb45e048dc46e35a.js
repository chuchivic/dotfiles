
"use strict";

var _ = require("lodash");
var assignDisabledRanges = require("./assignDisabledRanges");
var configurationError = require("./utils/configurationError");
var getOsEol = require("./utils/getOsEol");
var path = require("path");
var ruleDefinitions = require("./rules");

// Run stylelint on a PostCSS Result, either one that is provided
// or one that we create
module.exports = function lintSource(stylelint, /*: stylelint$internalApi*/
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
) /*: Promise<Array<*>>*/{
  postcssResult.stylelint = postcssResult.stylelint || {};
  postcssResult.stylelint.ruleSeverities = {};
  postcssResult.stylelint.customMessages = {};
  postcssResult.stylelint.quiet = config.quiet;

  var newlineMatch = postcssResult.root.toResult({
    stringifier: postcssResult.opts.syntax
  }).css.match(/\r?\n/);
  var newline = newlineMatch ? newlineMatch[0] : getOsEol();

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
      return ruleFunction(primaryOption, secondaryOptions, {
        fix: stylelint._options.fix,
        newline: newline
      })(postcssRoot, postcssResult);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbGludFNvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQy9ELElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDakUsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDN0MsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7OztBQUkzQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsVUFBVSxDQUNsQyxTQUFTO0FBQ1QsT0FBTzs7Ozs7O3VCQU1lO0FBQ3RCLFNBQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDOztBQUV4QixNQUNFLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFDakIsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLElBQzFCLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUM5QjtBQUNBLFdBQU8sT0FBTyxDQUFDLE1BQU0sQ0FDbkIsSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FDdkUsQ0FBQztHQUNIOztBQUVELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDOztBQUVqRCxNQUFNLGFBQWEsR0FBRyxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQzlFLE1BQUksYUFBYSxLQUFLLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxD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QUFFLGNBQWMsRUFBRSxJQUFJLEVBQUU7R0FDcEMsQ0FBQztDQUNIIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvbGludFNvdXJjZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5jb25zdCBhc3NpZ25EaXNhYmxlZFJhbmdlcyA9IHJlcXVpcmUoXCIuL2Fzc2lnbkRpc2FibGVkUmFuZ2VzXCIpO1xuY29uc3QgY29uZmlndXJhdGlvbkVycm9yID0gcmVxdWlyZShcIi4vdXRpbHMvY29uZmlndXJhdGlvbkVycm9yXCIpO1xuY29uc3QgZ2V0T3NFb2wgPSByZXF1aXJlKFwiLi91dGlscy9nZXRPc0VvbFwiKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcbmNvbnN0IHJ1bGVEZWZpbml0aW9ucyA9IHJlcXVpcmUoXCIuL3J1bGVzXCIpO1xuXG4vLyBSdW4gc3R5bGVsaW50IG9uIGEgUG9zdENTUyBSZXN1bHQsIGVpdGhlciBvbmUgdGhhdCBpcyBwcm92aWRlZFxuLy8gb3Igb25lIHRoYXQgd2UgY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxpbnRTb3VyY2UoXG4gIHN0eWxlbGludCAvKjogc3R5bGVsaW50JGludGVybmFsQXBpKi8sXG4gIG9wdGlvbnMgLyo6IHtcbiAgICBjb2RlPzogc3RyaW5nLFxuICAgIGNvZGVGaWxlbmFtZT86IHN0cmluZywgLy8gTXVzdCBiZSBhbiBhYnNvbHV0ZSBmaWxlIHBhdGhcbiAgICBmaWxlUGF0aD86IHN0cmluZywgLy8gTXVzdCBiZSBhbiBhYnNvbHV0ZSBmaWxlIHBhdGhcbiAgICBleGlzdGluZ1Bvc3Rjc3NSZXN1bHQ/OiBPYmplY3QsXG4gIH0qL1xuKSAvKjogUHJvbWlzZTxPYmplY3Q+Ki8ge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAoXG4gICAgIW9wdGlvbnMuZmlsZVBhdGggJiZcbiAgICBvcHRpb25zLmNvZGUgPT09IHVuZGVmaW5lZCAmJlxuICAgICFvcHRpb25zLmV4aXN0aW5nUG9zdGNzc1Jlc3VsdFxuICApIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXG4gICAgICBuZXcgRXJyb3IoXCJZb3UgbXVzdCBwcm92aWRlIGZpbGVQYXRoLCBjb2RlLCBvciBleGlzdGluZ1Bvc3Rjc3NSZXN1bHRcIilcbiAgICApO1xuICB9XG5cbiAgY29uc3QgaXNDb2RlTm90RmlsZSA9IG9wdGlvbnMuY29kZSAhPT0gdW5kZWZpbmVkO1xuXG4gIGNvbnN0IGlucHV0RmlsZVBhdGggPSBpc0NvZGVOb3RGaWxlID8gb3B0aW9ucy5jb2RlRmlsZW5hbWUgOiBvcHRpb25zLmZpbGVQYXRoO1xuICBpZiAoaW5wdXRGaWxlUGF0aCAhPT0gdW5kZWZpbmVkICYmICFwYXRoLmlzQWJzb2x1dGUoaW5wdXRGaWxlUGF0aCkpIHtcbiAgICBpZiAoaXNDb2RlTm90RmlsZSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcImNvZGVGaWxlbmFtZSBtdXN0IGJlIGFuIGFic29sdXRlIHBhdGhcIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiZmlsZVBhdGggbXVzdCBiZSBhbiBhYnNvbHV0ZSBwYXRoXCIpKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBnZXRJc0lnbm9yZWQgPSBzdHlsZWxpbnQuaXNQYXRoSWdub3JlZChpbnB1dEZpbGVQYXRoKS5jYXRjaChlcnIgPT4ge1xuICAgIGlmIChpc0NvZGVOb3RGaWxlICYmIGVyci5jb2RlID09PSBcIkVOT0VOVFwiKSByZXR1cm4gZmFsc2U7XG4gICAgdGhyb3cgZXJyO1xuICB9KTtcblxuICByZXR1cm4gZ2V0SXNJZ25vcmVkLnRoZW4oaXNJZ25vcmVkID0+IHtcbiAgICBpZiAoaXNJZ25vcmVkKSB7XG4gICAgICBjb25zdCBwb3N0Y3NzUmVzdWx0ID1cbiAgICAgICAgb3B0aW9ucy5leGlzdGluZ1Bvc3Rjc3NSZXN1bHQgfHxcbiAgICAgICAgY3JlYXRlRW1wdHlQb3N0Y3NzUmVzdWx0KGlucHV0RmlsZVBhdGgpO1xuICAgICAgcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQgPSBwb3N0Y3NzUmVzdWx0LnN0eWxlbGludCB8fCB7fTtcbiAgICAgIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50Lmlnbm9yZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHBvc3Rjc3NSZXN1bHQ7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlnU2VhcmNoUGF0aCA9IHN0eWxlbGludC5fb3B0aW9ucy5jb25maWdGaWxlIHx8IGlucHV0RmlsZVBhdGg7XG5cbiAgICBjb25zdCBnZXRDb25maWcgPSBzdHlsZWxpbnRcbiAgICAgIC5nZXRDb25maWdGb3JGaWxlKGNvbmZpZ1NlYXJjaFBhdGgpXG4gICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgaWYgKGlzQ29kZU5vdEZpbGUgJiYgZXJyLmNvZGUgPT09IFwiRU5PRU5UXCIpXG4gICAgICAgICAgcmV0dXJuIHN0eWxlbGludC5nZXRDb25maWdGb3JGaWxlKHByb2Nlc3MuY3dkKCkpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcblxuICAgIHJldHVybiBnZXRDb25maWcudGhlbihyZXN1bHQgPT4ge1xuICAgICAgY29uc3QgY29uZmlnID0gcmVzdWx0LmNvbmZpZztcbiAgICAgIGNvbnN0IGV4aXN0aW5nUG9zdGNzc1Jlc3VsdCA9IG9wdGlvbnMuZXhpc3RpbmdQb3N0Y3NzUmVzdWx0O1xuXG4gICAgICBpZiAoZXhpc3RpbmdQb3N0Y3NzUmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBsaW50UG9zdGNzc1Jlc3VsdChzdHlsZWxpbnQsIGV4aXN0aW5nUG9zdGNzc1Jlc3VsdCwgY29uZmlnKS50aGVuKFxuICAgICAgICAgICgpID0+IGV4aXN0aW5nUG9zdGNzc1Jlc3VsdFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3R5bGVsaW50XG4gICAgICAgIC5fZ2V0UG9zdGNzc1Jlc3VsdCh7XG4gICAgICAgICAgY29kZTogb3B0aW9ucy5jb2RlLFxuICAgICAgICAgIGNvZGVGaWxlbmFtZTogb3B0aW9ucy5jb2RlRmlsZW5hbWUsXG4gICAgICAgICAgZmlsZVBhdGg6IGlucHV0RmlsZVBhdGgsXG4gICAgICAgICAgY29kZVByb2Nlc3NvcnM6IGNvbmZpZy5jb2RlUHJvY2Vzc29yc1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihwb3N0Y3NzUmVzdWx0ID0+IHtcbiAgICAgICAgICByZXR1cm4gbGludFBvc3Rjc3NSZXN1bHQoc3R5bGVsaW50LCBwb3N0Y3NzUmVzdWx0LCBjb25maWcpLnRoZW4oXG4gICAgICAgICAgICAoKSA9PiBwb3N0Y3NzUmVzdWx0XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuZnVuY3Rpb24gbGludFBvc3Rjc3NSZXN1bHQoXG4gIHN0eWxlbGludCAvKjogc3R5bGVsaW50JGludGVybmFsQXBpKi8sXG4gIHBvc3Rjc3NSZXN1bHQgLyo6IE9iamVjdCovLFxuICBjb25maWcgLyo6IHN0eWxlbGludCRjb25maWcqL1xuKSAvKjogUHJvbWlzZTxBcnJheTwqPj4qLyB7XG4gIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50ID0gcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQgfHwge307XG4gIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LnJ1bGVTZXZlcml0aWVzID0ge307XG4gIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LmN1c3RvbU1lc3NhZ2VzID0ge307XG4gIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LnF1aWV0ID0gY29uZmlnLnF1aWV0O1xuXG4gIGNvbnN0IG5ld2xpbmVNYXRjaCA9IHBvc3Rjc3NSZXN1bHQucm9vdFxuICAgIC50b1Jlc3VsdCh7XG4gICAgICBzdHJpbmdpZmllcjogcG9zdGNzc1Jlc3VsdC5vcHRzLnN5bnRheFxuICAgIH0pXG4gICAgLmNzcy5tYXRjaCgvXFxyP1xcbi8pO1xuICBjb25zdCBuZXdsaW5lID0gbmV3bGluZU1hdGNoID8gbmV3bGluZU1hdGNoWzBdIDogZ2V0T3NFb2woKTtcblxuICBjb25zdCBwb3N0Y3NzUm9vdCA9IHBvc3Rjc3NSZXN1bHQucm9vdDtcbiAgYXNzaWduRGlzYWJsZWRSYW5nZXMocG9zdGNzc1Jvb3QsIHBvc3Rjc3NSZXN1bHQpO1xuICBpZiAoXG4gICAgc3R5bGVsaW50Ll9vcHRpb25zLnJlcG9ydE5lZWRsZXNzRGlzYWJsZXMgfHxcbiAgICBzdHlsZWxpbnQuX29wdGlvbnMuaWdub3JlRGlzYWJsZXNcbiAgKSB7XG4gICAgcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQuaWdub3JlRGlzYWJsZXMgPSB0cnVlO1xuICB9XG5cbiAgLy8gUHJvbWlzZXMgZm9yIHRoZSBydWxlcy4gQWx0aG91Z2ggdGhlIHJ1bGUgY29kZSBydW5zIHN5bmNocm9ub3VzbHkgbm93LFxuICAvLyB0aGUgdXNlIG9mIFByb21pc2VzIG1ha2VzIGl0IGNvbXBhdGlibGUgd2l0aCB0aGUgcG9zc2liaWxpdHkgb2YgYXN5bmNcbiAgLy8gcnVsZXMgZG93biB0aGUgbGluZS5cbiAgY29uc3QgcGVyZm9ybVJ1bGVzID0gW107XG5cbiAgY29uc3QgcnVsZXMgPSBjb25maWcucnVsZXMgPyBPYmplY3Qua2V5cyhjb25maWcucnVsZXMpIDogW107XG5cbiAgcnVsZXMuZm9yRWFjaChydWxlTmFtZSA9PiB7XG4gICAgY29uc3QgcnVsZUZ1bmN0aW9uID1cbiAgICAgIHJ1bGVEZWZpbml0aW9uc1tydWxlTmFtZV0gfHwgXy5nZXQoY29uZmlnLCBbXCJwbHVnaW5GdW5jdGlvbnNcIiwgcnVsZU5hbWVdKTtcblxuICAgIGlmIChydWxlRnVuY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgY29uZmlndXJhdGlvbkVycm9yKGBVbmRlZmluZWQgcnVsZSAke3J1bGVOYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IHJ1bGVTZXR0aW5ncyA9IF8uZ2V0KGNvbmZpZywgW1wicnVsZXNcIiwgcnVsZU5hbWVdKTtcbiAgICBpZiAocnVsZVNldHRpbmdzID09PSBudWxsIHx8IHJ1bGVTZXR0aW5nc1swXSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByaW1hcnlPcHRpb24gPSBydWxlU2V0dGluZ3NbMF07XG4gICAgY29uc3Qgc2Vjb25kYXJ5T3B0aW9ucyA9IHJ1bGVTZXR0aW5nc1sxXTtcblxuICAgIC8vIExvZyB0aGUgcnVsZSdzIHNldmVyaXR5IGluIHRoZSBQb3N0Q1NTIHJlc3VsdFxuICAgIGNvbnN0IGRlZmF1bHRTZXZlcml0eSA9IGNvbmZpZy5kZWZhdWx0U2V2ZXJpdHkgfHwgXCJlcnJvclwiO1xuICAgIHBvc3Rjc3NSZXN1bHQuc3R5bGVsaW50LnJ1bGVTZXZlcml0aWVzW3J1bGVOYW1lXSA9IF8uZ2V0KFxuICAgICAgc2Vjb25kYXJ5T3B0aW9ucyxcbiAgICAgIFwic2V2ZXJpdHlcIixcbiAgICAgIGRlZmF1bHRTZXZlcml0eVxuICAgICk7XG4gICAgcG9zdGNzc1Jlc3VsdC5zdHlsZWxpbnQuY3VzdG9tTWVzc2FnZXNbcnVsZU5hbWVdID0gXy5nZXQoXG4gICAgICBzZWNvbmRhcnlPcHRpb25zLFxuICAgICAgXCJtZXNzYWdlXCJcbiAgICApO1xuXG4gICAgY29uc3QgcGVyZm9ybVJ1bGUgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgIHJldHVybiBydWxlRnVuY3Rpb24ocHJpbWFyeU9wdGlvbiwgc2Vjb25kYXJ5T3B0aW9ucywge1xuICAgICAgICBmaXg6IHN0eWxlbGludC5fb3B0aW9ucy5maXgsXG4gICAgICAgIG5ld2xpbmVcbiAgICAgIH0pKHBvc3Rjc3NSb290LCBwb3N0Y3NzUmVzdWx0KTtcbiAgICB9KTtcbiAgICBwZXJmb3JtUnVsZXMucHVzaChwZXJmb3JtUnVsZSk7XG4gIH0pO1xuXG4gIHJldHVybiBQcm9taXNlLmFsbChwZXJmb3JtUnVsZXMpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVFbXB0eVBvc3Rjc3NSZXN1bHQoZmlsZVBhdGggLyo6OiA/OiBzdHJpbmcqLykgLyo6IE9iamVjdCovIHtcbiAgcmV0dXJuIHtcbiAgICByb290OiB7XG4gICAgICBzb3VyY2U6IHtcbiAgICAgICAgaW5wdXQ6IHsgZmlsZTogZmlsZVBhdGggfVxuICAgICAgfVxuICAgIH0sXG4gICAgbWVzc2FnZXM6IFtdLFxuICAgIHN0eWxlbGludDogeyBzdHlsZWxpbnRFcnJvcjogbnVsbCB9XG4gIH07XG59XG4iXX0=