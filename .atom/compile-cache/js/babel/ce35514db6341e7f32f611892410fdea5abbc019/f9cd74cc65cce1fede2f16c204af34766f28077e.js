
"use strict";
var _ = require("lodash");
var configurationError = require("./utils/configurationError");
var dynamicRequire = require("./dynamicRequire");
var getModulePath = require("./utils/getModulePath");
var globjoin = require("globjoin");
var normalizeRuleSettings = require("./normalizeRuleSettings");
var path = require("path");
var rules = require("./rules");

// - Merges config and configOverrides
// - Makes all paths absolute
// - Merges extends
function augmentConfigBasic(stylelint, /*: stylelint$internalApi*/
config, /*: stylelint$config*/
configDir, /*: string*/
allowOverrides /*:: ?: boolean*/
) /*: Promise<stylelint$config>*/{
  return Promise.resolve().then(function () {
    if (!allowOverrides) return config;
    return _.merge(config, stylelint._options.configOverrides);
  }).then(function (augmentedConfig) {
    return extendConfig(stylelint, augmentedConfig, configDir);
  }).then(function (augmentedConfig) {
    return absolutizePaths(augmentedConfig, configDir);
  });
}

// Extended configs need to be run through augmentConfigBasic
// but do not need the full treatment. Things like pluginFunctions
// will be resolved and added by the parent config.
function augmentConfigExtended(stylelint, /*: stylelint$internalApi*/
cosmiconfigResultArg /*: ?{
                     config: stylelint$config,
                     filepath: string,
                     }*/
) /*: Promise<?{ config: stylelint$config, filepath: string }>*/{
  var cosmiconfigResult = cosmiconfigResultArg; // Lock in for Flow
  if (!cosmiconfigResult) return Promise.resolve(null);

  var configDir = path.dirname(cosmiconfigResult.filepath || "");
  var cleanedConfig = _.omit(cosmiconfigResult.config, "ignoreFiles");
  return augmentConfigBasic(stylelint, cleanedConfig, configDir).then(function (augmentedConfig) {
    return {
      config: augmentedConfig,
      filepath: cosmiconfigResult.filepath
    };
  });
}

function augmentConfigFull(stylelint, /*: stylelint$internalApi*/
cosmiconfigResultArg /*: ?{
                     config: stylelint$config,
                     filepath: string,
                     }*/
) /*: Promise<?{ config: stylelint$config, filepath: string }>*/{
  var cosmiconfigResult = cosmiconfigResultArg; // Lock in for Flow
  if (!cosmiconfigResult) return Promise.resolve(null);

  var config = cosmiconfigResult.config,
      filepath = cosmiconfigResult.filepath;

  var configDir = stylelint._options.configBasedir || path.dirname(filepath || "");

  return augmentConfigBasic(stylelint, config, configDir, true).then(function (augmentedConfig) {
    return addPluginFunctions(augmentedConfig);
  }).then(function (augmentedConfig) {
    return addProcessorFunctions(augmentedConfig);
  }).then(function (augmentedConfig) {
    if (!augmentedConfig.rules) {
      throw configurationError('No rules found within configuration. Have you provided a "rules" property?');
    }

    return normalizeAllRuleSettings(augmentedConfig);
  }).then(function (augmentedConfig) {
    return {
      config: augmentedConfig,
      filepath: cosmiconfigResult.filepath
    };
  });
}

// Make all paths in the config absolute:
// - ignoreFiles
// - plugins
// - processors
// (extends handled elsewhere)
function absolutizePaths(config, /*: stylelint$config*/
configDir /*: string*/
) /*: stylelint$config*/{
  if (config.ignoreFiles) {
    config.ignoreFiles = [].concat(config.ignoreFiles).map(function (glob) {
      if (path.isAbsolute(glob.replace(/^!/, ""))) return glob;
      return globjoin(configDir, glob);
    });
  }

  if (config.plugins) {
    config.plugins = [].concat(config.plugins).map(function (lookup) {
      return getModulePath(configDir, lookup);
    });
  }

  if (config.processors) {
    config.processors = absolutizeProcessors(config.processors, configDir);
  }

  return config;
}

// Processors are absolutized in their own way because
// they can be and return a string or an array
function absolutizeProcessors(processors, /*: stylelint$configProcessors*/
configDir /*: string*/
) /*: stylelint$configProcessors*/{
  var normalizedProcessors = Array.isArray(processors) ? processors : [processors];

  return normalizedProcessors.map(function (item) {
    if (typeof item === "string") {
      return getModulePath(configDir, item);
    }

    return [getModulePath(configDir, item[0]), item[1]];
  });
}

function extendConfig(stylelint, /*: stylelint$internalApi*/
config, /*: stylelint$config*/
configDir /*: string*/
) /*: Promise<stylelint$config>*/{
  if (config["extends"] === undefined) return Promise.resolve(config);
  var normalizedExtends = Array.isArray(config["extends"]) ? config["extends"] : [config["extends"]];

  var originalWithoutExtends = _.omit(config, "extends");
  var loadExtends = normalizedExtends.reduce(function (resultPromise, extendLookup) {
    return resultPromise.then(function (resultConfig) {
      return loadExtendedConfig(stylelint, resultConfig, configDir, extendLookup).then(function (extendResult) {
        if (!extendResult) return resultConfig;
        return mergeConfigs(resultConfig, extendResult.config);
      });
    });
  }, Promise.resolve(originalWithoutExtends));

  return loadExtends.then(function (resultConfig) {
    return mergeConfigs(resultConfig, originalWithoutExtends);
  });
}

function loadExtendedConfig(stylelint, /*: stylelint$internalApi*/
config, /*: stylelint$config*/
configDir, /*: string*/
extendLookup /*: string*/
) /*: Promise<?{ config: stylelint$config, filepath: string }>*/{
  var extendPath = getModulePath(configDir, extendLookup);
  return stylelint._extendExplorer.load(null, extendPath);
}

// When merging configs (via extends)
// - plugin and processor arrays are joined
// - rules are merged via Object.assign, so there is no attempt made to
//   merge any given rule's settings. If b contains the same rule as a,
//   b's rule settings will override a's rule settings entirely.
// - Everything else is merged via Object.assign
function mergeConfigs(a, /*: stylelint$config*/
b /*: stylelint$config*/
) /*: stylelint$config*/{
  var pluginMerger = {};
  if (a.plugins || b.plugins) {
    pluginMerger.plugins = [];
    if (a.plugins) {
      pluginMerger.plugins = pluginMerger.plugins.concat(a.plugins);
    }
    if (b.plugins) {
      pluginMerger.plugins = _.uniq(pluginMerger.plugins.concat(b.plugins));
    }
  }

  var processorMerger = {};
  if (a.processors || b.processors) {
    processorMerger.processors = [];
    if (a.processors) {
      processorMerger.processors = processorMerger.processors.concat(a.processors);
    }
    if (b.processors) {
      processorMerger.processors = _.uniq(processorMerger.processors.concat(b.processors));
    }
  }

  var rulesMerger = {};
  if (a.rules || b.rules) {
    rulesMerger.rules = Object.assign({}, a.rules, b.rules);
  }

  var result = Object.assign({}, a, b, processorMerger, pluginMerger, rulesMerger);
  return result;
}

function addPluginFunctions(config /*: stylelint$config*/
) /*: stylelint$config*/{
  if (!config.plugins) return config;

  var normalizedPlugins = Array.isArray(config.plugins) ? config.plugins : [config.plugins];

  var pluginFunctions = normalizedPlugins.reduce(function (result, pluginLookup) {
    var pluginImport = dynamicRequire(pluginLookup);
    // Handle either ES6 or CommonJS modules
    pluginImport = pluginImport["default"] || pluginImport;

    // A plugin can export either a single rule definition
    // or an array of them
    var normalizedPluginImport = Array.isArray(pluginImport) ? pluginImport : [pluginImport];

    normalizedPluginImport.forEach(function (pluginRuleDefinition) {
      if (!pluginRuleDefinition.ruleName) {
        throw configurationError("stylelint v3+ requires plugins to expose a ruleName. " + ("The plugin \"" + pluginLookup + "\" is not doing this, so will not work ") + "with stylelint v3+. Please file an issue with the plugin.");
      }

      if (!_.includes(pluginRuleDefinition.ruleName, "/")) {
        throw configurationError("stylelint v7+ requires plugin rules to be namspaced, " + "i.e. only `plugin-namespace/plugin-rule-name` plugin rule names are supported. " + ("The plugin rule \"" + pluginRuleDefinition.ruleName + "\" does not do this, so will not work. ") + "Please file an issue with the plugin.");
      }

      result[pluginRuleDefinition.ruleName] = pluginRuleDefinition.rule;
    });

    return result;
  }, {});

  config.pluginFunctions = pluginFunctions;
  return config;
}

function normalizeAllRuleSettings(config /*: stylelint$config*/
) /*: stylelint$config*/{
  var normalizedRules = {};
  if (!config.rules) return config;
  Object.keys(config.rules).forEach(function (ruleName) {
    var rawRuleSettings = _.get(config, ["rules", ruleName]);
    var rule = rules[ruleName] || _.get(config, ["pluginFunctions", ruleName]);
    if (!rule) {
      throw configurationError("Undefined rule " + ruleName);
    }
    normalizedRules[ruleName] = normalizeRuleSettings(rawRuleSettings, ruleName, _.get(rule, "primaryOptionArray"));
  });
  config.rules = normalizedRules;
  return config;
}

// Given an array of processors strings, we want to add two
// properties to the augmented config:
// - codeProcessors: functions that will run on code as it comes in
// - resultProcessors: functions that will run on results as they go out
//
// To create these properties, we need to:
// - Find the processor module
// - Intialize the processor module by calling its functions with any
//   provided options
// - Push the processor's code and result processors to their respective arrays
var processorCache = new Map();
function addProcessorFunctions(config /*: stylelint$config*/
) /*: stylelint$config*/{
  if (!config.processors) return config;

  var codeProcessors = [];
  var resultProcessors = [];
  [].concat(config.processors).forEach(function (processorConfig) {
    var processorKey = JSON.stringify(processorConfig);

    var initializedProcessor = undefined;
    if (processorCache.has(processorKey)) {
      initializedProcessor = processorCache.get(processorKey);
    } else {
      processorConfig = [].concat(processorConfig);
      var processorLookup = processorConfig[0];
      var processorOptions = processorConfig[1];
      var processor = dynamicRequire(processorLookup);
      processor = processor["default"] || processor;
      initializedProcessor = processor(processorOptions);
      processorCache.set(processorKey, initializedProcessor);
    }

    if (initializedProcessor && initializedProcessor.code) {
      codeProcessors.push(initializedProcessor.code);
    }
    if (initializedProcessor && initializedProcessor.result) {
      resultProcessors.push(initializedProcessor.result);
    }
  });

  config.codeProcessors = codeProcessors;
  config.resultProcessors = resultProcessors;
  return config;
}

module.exports = { augmentConfigExtended: augmentConfigExtended, augmentConfigFull: augmentConfigFull };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvYXVnbWVudENvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDO0FBQ2IsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVCLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDakUsSUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDbkQsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDdkQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLElBQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDakUsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7Ozs7QUFLakMsU0FBUyxrQkFBa0IsQ0FDekIsU0FBUztBQUNULE1BQU07QUFDTixTQUFTO0FBQ1QsY0FBYztpQ0FDa0I7QUFDaEMsU0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQ3JCLElBQUksQ0FBQyxZQUFNO0FBQ1YsUUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLE1BQU0sQ0FBQztBQUNuQyxXQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7R0FDNUQsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFBLGVBQWUsRUFBSTtBQUN2QixXQUFPLFlBQVksQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0dBQzVELENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBQSxl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QUMsTUFBTSxFQUFFO0FBQ3ZELHNCQUFnQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNwRDtHQUNGLENBQUMsQ0FBQzs7QUFFSCxRQUFNLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztBQUN2QyxRQUFNLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFDM0MsU0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUscUJBQXFCLEVBQXJCLHFCQUFxQixFQUFFLGlCQUFpQixFQUFqQixpQkFBaUIsRUFBRSxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvYXVnbWVudENvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcbmNvbnN0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuY29uc3QgY29uZmlndXJhdGlvbkVycm9yID0gcmVxdWlyZShcIi4vdXRpbHMvY29uZmlndXJhdGlvbkVycm9yXCIpO1xuY29uc3QgZHluYW1pY1JlcXVpcmUgPSByZXF1aXJlKFwiLi9keW5hbWljUmVxdWlyZVwiKTtcbmNvbnN0IGdldE1vZHVsZVBhdGggPSByZXF1aXJlKFwiLi91dGlscy9nZXRNb2R1bGVQYXRoXCIpO1xuY29uc3QgZ2xvYmpvaW4gPSByZXF1aXJlKFwiZ2xvYmpvaW5cIik7XG5jb25zdCBub3JtYWxpemVSdWxlU2V0dGluZ3MgPSByZXF1aXJlKFwiLi9ub3JtYWxpemVSdWxlU2V0dGluZ3NcIik7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBydWxlcyA9IHJlcXVpcmUoXCIuL3J1bGVzXCIpO1xuXG4vLyAtIE1lcmdlcyBjb25maWcgYW5kIGNvbmZpZ092ZXJyaWRlc1xuLy8gLSBNYWtlcyBhbGwgcGF0aHMgYWJzb2x1dGVcbi8vIC0gTWVyZ2VzIGV4dGVuZHNcbmZ1bmN0aW9uIGF1Z21lbnRDb25maWdCYXNpYyhcbiAgc3R5bGVsaW50IC8qOiBzdHlsZWxpbnQkaW50ZXJuYWxBcGkqLyxcbiAgY29uZmlnIC8qOiBzdHlsZWxpbnQkY29uZmlnKi8sXG4gIGNvbmZpZ0RpciAvKjogc3RyaW5nKi8sXG4gIGFsbG93T3ZlcnJpZGVzIC8qOjogPzogYm9vbGVhbiovXG4pIC8qOiBQcm9taXNlPHN0eWxlbGludCRjb25maWc+Ki8ge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICBpZiAoIWFsbG93T3ZlcnJpZGVzKSByZXR1cm4gY29uZmlnO1xuICAgICAgcmV0dXJuIF8ubWVyZ2UoY29uZmlnLCBzdHlsZWxpbnQuX29wdGlvbnMuY29uZmlnT3ZlcnJpZGVzKTtcbiAgICB9KVxuICAgIC50aGVuKGF1Z21lbnRlZENvbmZpZyA9PiB7XG4gICAgICByZXR1cm4gZXh0ZW5kQ29uZmlnKHN0eWxlbGludCwgYXVnbWVudGVkQ29uZmlnLCBjb25maWdEaXIpO1xuICAgIH0pXG4gICAgLnRoZW4oYXVnbWVudGVkQ29uZmlnID0+IHtcbiAgICAgIHJldHVybiBhYnNvbHV0aXplUGF0aHMoYXVnbWVudGVkQ29uZmlnLCBjb25maWdEaXIpO1xuICAgIH0pO1xufVxuXG4vLyBFeHRlbmRlZCBjb25maWdzIG5lZWQgdG8gYmUgcnVuIHRocm91Z2ggYXVnbWVudENvbmZpZ0Jhc2ljXG4vLyBidXQgZG8gbm90IG5lZWQgdGhlIGZ1bGwgdHJlYXRtZW50LiBUaGluZ3MgbGlrZSBwbHVnaW5GdW5jdGlvbnNcbi8vIHdpbGwgYmUgcmVzb2x2ZWQgYW5kIGFkZGVkIGJ5IHRoZSBwYXJlbnQgY29uZmlnLlxuZnVuY3Rpb24gYXVnbWVudENvbmZpZ0V4dGVuZGVkKFxuICBzdHlsZWxpbnQgLyo6IHN0eWxlbGludCRpbnRlcm5hbEFwaSovLFxuICBjb3NtaWNvbmZpZ1Jlc3VsdEFyZyAvKjogP3tcbiAgICAgY29uZmlnOiBzdHlsZWxpbnQkY29uZmlnLFxuICAgICBmaWxlcGF0aDogc3RyaW5nLFxuICAgfSovXG4pIC8qOiBQcm9taXNlPD97IGNvbmZpZzogc3R5bGVsaW50JGNvbmZpZywgZmlsZXBhdGg6IHN0cmluZyB9PiovIHtcbiAgY29uc3QgY29zbWljb25maWdSZXN1bHQgPSBjb3NtaWNvbmZpZ1Jlc3VsdEFyZzsgLy8gTG9jayBpbiBmb3IgRmxvd1xuICBpZiAoIWNvc21pY29uZmlnUmVzdWx0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXG4gIGNvbnN0IGNvbmZpZ0RpciA9IHBhdGguZGlybmFtZShjb3NtaWNvbmZpZ1Jlc3VsdC5maWxlcGF0aCB8fCBcIlwiKTtcbiAgY29uc3QgY2xlYW5lZENvbmZpZyA9IF8ub21pdChjb3NtaWNvbmZpZ1Jlc3VsdC5jb25maWcsIFwiaWdub3JlRmlsZXNcIik7XG4gIHJldHVybiBhdWdtZW50Q29uZmlnQmFzaWMoXG4gICAgc3R5bGVsaW50LFxuICAgIGNsZWFuZWRDb25maWcsXG4gICAgY29uZmlnRGlyXG4gICkudGhlbihhdWdtZW50ZWRDb25maWcgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWc6IGF1Z21lbnRlZENvbmZpZyxcbiAgICAgIGZpbGVwYXRoOiBjb3NtaWNvbmZpZ1Jlc3VsdC5maWxlcGF0aFxuICAgIH07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhdWdtZW50Q29uZmlnRnVsbChcbiAgc3R5bGVsaW50IC8qOiBzdHlsZWxpbnQkaW50ZXJuYWxBcGkqLyxcbiAgY29zbWljb25maWdSZXN1bHRBcmcgLyo6ID97XG4gICBjb25maWc6IHN0eWxlbGludCRjb25maWcsXG4gICBmaWxlcGF0aDogc3RyaW5nLFxuICB9Ki9cbikgLyo6IFByb21pc2U8P3sgY29uZmlnOiBzdHlsZWxpbnQkY29uZmlnLCBmaWxlcGF0aDogc3RyaW5nIH0+Ki8ge1xuICBjb25zdCBjb3NtaWNvbmZpZ1Jlc3VsdCA9IGNvc21pY29uZmlnUmVzdWx0QXJnOyAvLyBMb2NrIGluIGZvciBGbG93XG4gIGlmICghY29zbWljb25maWdSZXN1bHQpIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cbiAgY29uc3QgY29uZmlnID0gY29zbWljb25maWdSZXN1bHQuY29uZmlnLFxuICAgIGZpbGVwYXRoID0gY29zbWljb25maWdSZXN1bHQuZmlsZXBhdGg7XG5cbiAgY29uc3QgY29uZmlnRGlyID1cbiAgICBzdHlsZWxpbnQuX29wdGlvbnMuY29uZmlnQmFzZWRpciB8fCBwYXRoLmRpcm5hbWUoZmlsZXBhdGggfHwgXCJcIik7XG5cbiAgcmV0dXJuIGF1Z21lbnRDb25maWdCYXNpYyhzdHlsZWxpbnQsIGNvbmZpZywgY29uZmlnRGlyLCB0cnVlKVxuICAgIC50aGVuKGF1Z21lbnRlZENvbmZpZyA9PiB7XG4gICAgICByZXR1cm4gYWRkUGx1Z2luRnVuY3Rpb25zKGF1Z21lbnRlZENvbmZpZyk7XG4gICAgfSlcbiAgICAudGhlbihhdWdtZW50ZWRDb25maWcgPT4ge1xuICAgICAgcmV0dXJuIGFkZFByb2Nlc3NvckZ1bmN0aW9ucyhhdWdtZW50ZWRDb25maWcpO1xuICAgIH0pXG4gICAgLnRoZW4oYXVnbWVudGVkQ29uZmlnID0+IHtcbiAgICAgIGlmICghYXVnbWVudGVkQ29uZmlnLnJ1bGVzKSB7XG4gICAgICAgIHRocm93IGNvbmZpZ3VyYXRpb25FcnJvcihcbiAgICAgICAgICAnTm8gcnVsZXMgZm91bmQgd2l0aGluIGNvbmZpZ3VyYXRpb24uIEhhdmUgeW91IHByb3ZpZGVkIGEgXCJydWxlc1wiIHByb3BlcnR5PydcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5vcm1hbGl6ZUFsbFJ1bGVTZXR0aW5ncyhhdWdtZW50ZWRDb25maWcpO1xuICAgIH0pXG4gICAgLnRoZW4oYXVnbWVudGVkQ29uZmlnID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbmZpZzogYXVnbWVudGVkQ29uZmlnLFxuICAgICAgICBmaWxlcGF0aDogY29zbWljb25maWdSZXN1bHQuZmlsZXBhdGhcbiAgICAgIH07XG4gICAgfSk7XG59XG5cbi8vIE1ha2UgYWxsIHBhdGhzIGluIHRoZSBjb25maWcgYWJzb2x1dGU6XG4vLyAtIGlnbm9yZUZpbGVzXG4vLyAtIHBsdWdpbnNcbi8vIC0gcHJvY2Vzc29yc1xuLy8gKGV4dGVuZHMgaGFuZGxlZCBlbHNld2hlcmUpXG5mdW5jdGlvbiBhYnNvbHV0aXplUGF0aHMoXG4gIGNvbmZpZyAvKjogc3R5bGVsaW50JGNvbmZpZyovLFxuICBjb25maWdEaXIgLyo6IHN0cmluZyovXG4pIC8qOiBzdHlsZWxpbnQkY29uZmlnKi8ge1xuICBpZiAoY29uZmlnLmlnbm9yZUZpbGVzKSB7XG4gICAgY29uZmlnLmlnbm9yZUZpbGVzID0gW10uY29uY2F0KGNvbmZpZy5pZ25vcmVGaWxlcykubWFwKGdsb2IgPT4ge1xuICAgICAgaWYgKHBhdGguaXNBYnNvbHV0ZShnbG9iLnJlcGxhY2UoL14hLywgXCJcIikpKSByZXR1cm4gZ2xvYjtcbiAgICAgIHJldHVybiBnbG9iam9pbihjb25maWdEaXIsIGdsb2IpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5wbHVnaW5zKSB7XG4gICAgY29uZmlnLnBsdWdpbnMgPSBbXS5jb25jYXQoY29uZmlnLnBsdWdpbnMpLm1hcChsb29rdXAgPT4ge1xuICAgICAgcmV0dXJuIGdldE1vZHVsZVBhdGgoY29uZmlnRGlyLCBsb29rdXApO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5wcm9jZXNzb3JzKSB7XG4gICAgY29uZmlnLnByb2Nlc3NvcnMgPSBhYnNvbHV0aXplUHJvY2Vzc29ycyhjb25maWcucHJvY2Vzc29ycywgY29uZmlnRGlyKTtcbiAgfVxuXG4gIHJldHVybiBjb25maWc7XG59XG5cbi8vIFByb2Nlc3NvcnMgYXJlIGFic29sdXRpemVkIGluIHRoZWlyIG93biB3YXkgYmVjYXVzZVxuLy8gdGhleSBjYW4gYmUgYW5kIHJldHVybiBhIHN0cmluZyBvciBhbiBhcnJheVxuZnVuY3Rpb24gYWJzb2x1dGl6ZVByb2Nlc3NvcnMoXG4gIHByb2Nlc3NvcnMgLyo6IHN0eWxlbGludCRjb25maWdQcm9jZXNzb3JzKi8sXG4gIGNvbmZpZ0RpciAvKjogc3RyaW5nKi9cbikgLyo6IHN0eWxlbGludCRjb25maWdQcm9jZXNzb3JzKi8ge1xuICBjb25zdCBub3JtYWxpemVkUHJvY2Vzc29ycyA9IEFycmF5LmlzQXJyYXkocHJvY2Vzc29ycylcbiAgICA/IHByb2Nlc3NvcnNcbiAgICA6IFtwcm9jZXNzb3JzXTtcblxuICByZXR1cm4gbm9ybWFsaXplZFByb2Nlc3NvcnMubWFwKGl0ZW0gPT4ge1xuICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmV0dXJuIGdldE1vZHVsZVBhdGgoY29uZmlnRGlyLCBpdGVtKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW2dldE1vZHVsZVBhdGgoY29uZmlnRGlyLCBpdGVtWzBdKSwgaXRlbVsxXV07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBleHRlbmRDb25maWcoXG4gIHN0eWxlbGludCAvKjogc3R5bGVsaW50JGludGVybmFsQXBpKi8sXG4gIGNvbmZpZyAvKjogc3R5bGVsaW50JGNvbmZpZyovLFxuICBjb25maWdEaXIgLyo6IHN0cmluZyovXG4pIC8qOiBQcm9taXNlPHN0eWxlbGludCRjb25maWc+Ki8ge1xuICBpZiAoY29uZmlnLmV4dGVuZHMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjb25maWcpO1xuICBjb25zdCBub3JtYWxpemVkRXh0ZW5kcyA9IEFycmF5LmlzQXJyYXkoY29uZmlnLmV4dGVuZHMpXG4gICAgPyBjb25maWcuZXh0ZW5kc1xuICAgIDogW2NvbmZpZy5leHRlbmRzXTtcblxuICBjb25zdCBvcmlnaW5hbFdpdGhvdXRFeHRlbmRzID0gXy5vbWl0KGNvbmZpZywgXCJleHRlbmRzXCIpO1xuICBjb25zdCBsb2FkRXh0ZW5kcyA9IG5vcm1hbGl6ZWRFeHRlbmRzLnJlZHVjZShcbiAgICAocmVzdWx0UHJvbWlzZSwgZXh0ZW5kTG9va3VwKSA9PiB7XG4gICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZS50aGVuKHJlc3VsdENvbmZpZyA9PiB7XG4gICAgICAgIHJldHVybiBsb2FkRXh0ZW5kZWRDb25maWcoXG4gICAgICAgICAgc3R5bGVsaW50LFxuICAgICAgICAgIHJlc3VsdENvbmZpZyxcbiAgICAgICAgICBjb25maWdEaXIsXG4gICAgICAgICAgZXh0ZW5kTG9va3VwXG4gICAgICAgICkudGhlbihleHRlbmRSZXN1bHQgPT4ge1xuICAgICAgICAgIGlmICghZXh0ZW5kUmVzdWx0KSByZXR1cm4gcmVzdWx0Q29uZmlnO1xuICAgICAgICAgIHJldHVybiBtZXJnZUNvbmZpZ3MocmVzdWx0Q29uZmlnLCBleHRlbmRSZXN1bHQuY29uZmlnKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIFByb21pc2UucmVzb2x2ZShvcmlnaW5hbFdpdGhvdXRFeHRlbmRzKVxuICApO1xuXG4gIHJldHVybiBsb2FkRXh0ZW5kcy50aGVuKHJlc3VsdENvbmZpZyA9PiB7XG4gICAgcmV0dXJuIG1lcmdlQ29uZmlncyhyZXN1bHRDb25maWcsIG9yaWdpbmFsV2l0aG91dEV4dGVuZHMpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbG9hZEV4dGVuZGVkQ29uZmlnKFxuICBzdHlsZWxpbnQgLyo6IHN0eWxlbGludCRpbnRlcm5hbEFwaSovLFxuICBjb25maWcgLyo6IHN0eWxlbGludCRjb25maWcqLyxcbiAgY29uZmlnRGlyIC8qOiBzdHJpbmcqLyxcbiAgZXh0ZW5kTG9va3VwIC8qOiBzdHJpbmcqL1xuKSAvKjogUHJvbWlzZTw/eyBjb25maWc6IHN0eWxlbGludCRjb25maWcsIGZpbGVwYXRoOiBzdHJpbmcgfT4qLyB7XG4gIGNvbnN0IGV4dGVuZFBhdGggPSBnZXRNb2R1bGVQYXRoKGNvbmZpZ0RpciwgZXh0ZW5kTG9va3VwKTtcbiAgcmV0dXJuIHN0eWxlbGludC5fZXh0ZW5kRXhwbG9yZXIubG9hZChudWxsLCBleHRlbmRQYXRoKTtcbn1cblxuLy8gV2hlbiBtZXJnaW5nIGNvbmZpZ3MgKHZpYSBleHRlbmRzKVxuLy8gLSBwbHVnaW4gYW5kIHByb2Nlc3NvciBhcnJheXMgYXJlIGpvaW5lZFxuLy8gLSBydWxlcyBhcmUgbWVyZ2VkIHZpYSBPYmplY3QuYXNzaWduLCBzbyB0aGVyZSBpcyBubyBhdHRlbXB0IG1hZGUgdG9cbi8vICAgbWVyZ2UgYW55IGdpdmVuIHJ1bGUncyBzZXR0aW5ncy4gSWYgYiBjb250YWlucyB0aGUgc2FtZSBydWxlIGFzIGEsXG4vLyAgIGIncyBydWxlIHNldHRpbmdzIHdpbGwgb3ZlcnJpZGUgYSdzIHJ1bGUgc2V0dGluZ3MgZW50aXJlbHkuXG4vLyAtIEV2ZXJ5dGhpbmcgZWxzZSBpcyBtZXJnZWQgdmlhIE9iamVjdC5hc3NpZ25cbmZ1bmN0aW9uIG1lcmdlQ29uZmlncyhcbiAgYSAvKjogc3R5bGVsaW50JGNvbmZpZyovLFxuICBiIC8qOiBzdHlsZWxpbnQkY29uZmlnKi9cbikgLyo6IHN0eWxlbGludCRjb25maWcqLyB7XG4gIGNvbnN0IHBsdWdpbk1lcmdlciA9IHt9O1xuICBpZiAoYS5wbHVnaW5zIHx8IGIucGx1Z2lucykge1xuICAgIHBsdWdpbk1lcmdlci5wbHVnaW5zID0gW107XG4gICAgaWYgKGEucGx1Z2lucykge1xuICAgICAgcGx1Z2luTWVyZ2VyLnBsdWdpbnMgPSBwbHVnaW5NZXJnZXIucGx1Z2lucy5jb25jYXQoYS5wbHVnaW5zKTtcbiAgICB9XG4gICAgaWYgKGIucGx1Z2lucykge1xuICAgICAgcGx1Z2luTWVyZ2VyLnBsdWdpbnMgPSBfLnVuaXEocGx1Z2luTWVyZ2VyLnBsdWdpbnMuY29uY2F0KGIucGx1Z2lucykpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHByb2Nlc3Nvck1lcmdlciA9IHt9O1xuICBpZiAoYS5wcm9jZXNzb3JzIHx8IGIucHJvY2Vzc29ycykge1xuICAgIHByb2Nlc3Nvck1lcmdlci5wcm9jZXNzb3JzID0gW107XG4gICAgaWYgKGEucHJvY2Vzc29ycykge1xuICAgICAgcHJvY2Vzc29yTWVyZ2VyLnByb2Nlc3NvcnMgPSBwcm9jZXNzb3JNZXJnZXIucHJvY2Vzc29ycy5jb25jYXQoXG4gICAgICAgIGEucHJvY2Vzc29yc1xuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGIucHJvY2Vzc29ycykge1xuICAgICAgcHJvY2Vzc29yTWVyZ2VyLnByb2Nlc3NvcnMgPSBfLnVuaXEoXG4gICAgICAgIHByb2Nlc3Nvck1lcmdlci5wcm9jZXNzb3JzLmNvbmNhdChiLnByb2Nlc3NvcnMpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJ1bGVzTWVyZ2VyID0ge307XG4gIGlmIChhLnJ1bGVzIHx8IGIucnVsZXMpIHtcbiAgICBydWxlc01lcmdlci5ydWxlcyA9IE9iamVjdC5hc3NpZ24oe30sIGEucnVsZXMsIGIucnVsZXMpO1xuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbihcbiAgICB7fSxcbiAgICBhLFxuICAgIGIsXG4gICAgcHJvY2Vzc29yTWVyZ2VyLFxuICAgIHBsdWdpbk1lcmdlcixcbiAgICBydWxlc01lcmdlclxuICApO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBhZGRQbHVnaW5GdW5jdGlvbnMoXG4gIGNvbmZpZyAvKjogc3R5bGVsaW50JGNvbmZpZyovXG4pIC8qOiBzdHlsZWxpbnQkY29uZmlnKi8ge1xuICBpZiAoIWNvbmZpZy5wbHVnaW5zKSByZXR1cm4gY29uZmlnO1xuXG4gIGNvbnN0IG5vcm1hbGl6ZWRQbHVnaW5zID0gQXJyYXkuaXNBcnJheShjb25maWcucGx1Z2lucylcbiAgICA/IGNvbmZpZy5wbHVnaW5zXG4gICAgOiBbY29uZmlnLnBsdWdpbnNdO1xuXG4gIGNvbnN0IHBsdWdpbkZ1bmN0aW9ucyA9IG5vcm1hbGl6ZWRQbHVnaW5zLnJlZHVjZSgocmVzdWx0LCBwbHVnaW5Mb29rdXApID0+IHtcbiAgICBsZXQgcGx1Z2luSW1wb3J0ID0gZHluYW1pY1JlcXVpcmUocGx1Z2luTG9va3VwKTtcbiAgICAvLyBIYW5kbGUgZWl0aGVyIEVTNiBvciBDb21tb25KUyBtb2R1bGVzXG4gICAgcGx1Z2luSW1wb3J0ID0gcGx1Z2luSW1wb3J0LmRlZmF1bHQgfHwgcGx1Z2luSW1wb3J0O1xuXG4gICAgLy8gQSBwbHVnaW4gY2FuIGV4cG9ydCBlaXRoZXIgYSBzaW5nbGUgcnVsZSBkZWZpbml0aW9uXG4gICAgLy8gb3IgYW4gYXJyYXkgb2YgdGhlbVxuICAgIGNvbnN0IG5vcm1hbGl6ZWRQbHVnaW5JbXBvcnQgPSBBcnJheS5pc0FycmF5KHBsdWdpbkltcG9ydClcbiAgICAgID8gcGx1Z2luSW1wb3J0XG4gICAgICA6IFtwbHVnaW5JbXBvcnRdO1xuXG4gICAgbm9ybWFsaXplZFBsdWdpbkltcG9ydC5mb3JFYWNoKHBsdWdpblJ1bGVEZWZpbml0aW9uID0+IHtcbiAgICAgIGlmICghcGx1Z2luUnVsZURlZmluaXRpb24ucnVsZU5hbWUpIHtcbiAgICAgICAgdGhyb3cgY29uZmlndXJhdGlvbkVycm9yKFxuICAgICAgICAgIFwic3R5bGVsaW50IHYzKyByZXF1aXJlcyBwbHVnaW5zIHRvIGV4cG9zZSBhIHJ1bGVOYW1lLiBcIiArXG4gICAgICAgICAgICBgVGhlIHBsdWdpbiBcIiR7cGx1Z2luTG9va3VwfVwiIGlzIG5vdCBkb2luZyB0aGlzLCBzbyB3aWxsIG5vdCB3b3JrIGAgK1xuICAgICAgICAgICAgXCJ3aXRoIHN0eWxlbGludCB2MysuIFBsZWFzZSBmaWxlIGFuIGlzc3VlIHdpdGggdGhlIHBsdWdpbi5cIlxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIV8uaW5jbHVkZXMocGx1Z2luUnVsZURlZmluaXRpb24ucnVsZU5hbWUsIFwiL1wiKSkge1xuICAgICAgICB0aHJvdyBjb25maWd1cmF0aW9uRXJyb3IoXG4gICAgICAgICAgXCJzdHlsZWxpbnQgdjcrIHJlcXVpcmVzIHBsdWdpbiBydWxlcyB0byBiZSBuYW1zcGFjZWQsIFwiICtcbiAgICAgICAgICAgIFwiaS5lLiBvbmx5IGBwbHVnaW4tbmFtZXNwYWNlL3BsdWdpbi1ydWxlLW5hbWVgIHBsdWdpbiBydWxlIG5hbWVzIGFyZSBzdXBwb3J0ZWQuIFwiICtcbiAgICAgICAgICAgIGBUaGUgcGx1Z2luIHJ1bGUgXCIke3BsdWdpblJ1bGVEZWZpbml0aW9uLnJ1bGVOYW1lfVwiIGRvZXMgbm90IGRvIHRoaXMsIHNvIHdpbGwgbm90IHdvcmsuIGAgK1xuICAgICAgICAgICAgXCJQbGVhc2UgZmlsZSBhbiBpc3N1ZSB3aXRoIHRoZSBwbHVnaW4uXCJcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0W3BsdWdpblJ1bGVEZWZpbml0aW9uLnJ1bGVOYW1lXSA9IHBsdWdpblJ1bGVEZWZpbml0aW9uLnJ1bGU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9LCB7fSk7XG5cbiAgY29uZmlnLnBsdWdpbkZ1bmN0aW9ucyA9IHBsdWdpbkZ1bmN0aW9ucztcbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQWxsUnVsZVNldHRpbmdzKFxuICBjb25maWcgLyo6IHN0eWxlbGludCRjb25maWcqL1xuKSAvKjogc3R5bGVsaW50JGNvbmZpZyovIHtcbiAgY29uc3Qgbm9ybWFsaXplZFJ1bGVzID0ge307XG4gIGlmICghY29uZmlnLnJ1bGVzKSByZXR1cm4gY29uZmlnO1xuICBPYmplY3Qua2V5cyhjb25maWcucnVsZXMpLmZvckVhY2gocnVsZU5hbWUgPT4ge1xuICAgIGNvbnN0IHJhd1J1bGVTZXR0aW5ncyA9IF8uZ2V0KGNvbmZpZywgW1wicnVsZXNcIiwgcnVsZU5hbWVdKTtcbiAgICBjb25zdCBydWxlID1cbiAgICAgIHJ1bGVzW3J1bGVOYW1lXSB8fCBfLmdldChjb25maWcsIFtcInBsdWdpbkZ1bmN0aW9uc1wiLCBydWxlTmFtZV0pO1xuICAgIGlmICghcnVsZSkge1xuICAgICAgdGhyb3cgY29uZmlndXJhdGlvbkVycm9yKGBVbmRlZmluZWQgcnVsZSAke3J1bGVOYW1lfWApO1xuICAgIH1cbiAgICBub3JtYWxpemVkUnVsZXNbcnVsZU5hbWVdID0gbm9ybWFsaXplUnVsZVNldHRpbmdzKFxuICAgICAgcmF3UnVsZVNldHRpbmdzLFxuICAgICAgcnVsZU5hbWUsXG4gICAgICBfLmdldChydWxlLCBcInByaW1hcnlPcHRpb25BcnJheVwiKVxuICAgICk7XG4gIH0pO1xuICBjb25maWcucnVsZXMgPSBub3JtYWxpemVkUnVsZXM7XG4gIHJldHVybiBjb25maWc7XG59XG5cbi8vIEdpdmVuIGFuIGFycmF5IG9mIHByb2Nlc3NvcnMgc3RyaW5ncywgd2Ugd2FudCB0byBhZGQgdHdvXG4vLyBwcm9wZXJ0aWVzIHRvIHRoZSBhdWdtZW50ZWQgY29uZmlnOlxuLy8gLSBjb2RlUHJvY2Vzc29yczogZnVuY3Rpb25zIHRoYXQgd2lsbCBydW4gb24gY29kZSBhcyBpdCBjb21lcyBpblxuLy8gLSByZXN1bHRQcm9jZXNzb3JzOiBmdW5jdGlvbnMgdGhhdCB3aWxsIHJ1biBvbiByZXN1bHRzIGFzIHRoZXkgZ28gb3V0XG4vL1xuLy8gVG8gY3JlYXRlIHRoZXNlIHByb3BlcnRpZXMsIHdlIG5lZWQgdG86XG4vLyAtIEZpbmQgdGhlIHByb2Nlc3NvciBtb2R1bGVcbi8vIC0gSW50aWFsaXplIHRoZSBwcm9jZXNzb3IgbW9kdWxlIGJ5IGNhbGxpbmcgaXRzIGZ1bmN0aW9ucyB3aXRoIGFueVxuLy8gICBwcm92aWRlZCBvcHRpb25zXG4vLyAtIFB1c2ggdGhlIHByb2Nlc3NvcidzIGNvZGUgYW5kIHJlc3VsdCBwcm9jZXNzb3JzIHRvIHRoZWlyIHJlc3BlY3RpdmUgYXJyYXlzXG5jb25zdCBwcm9jZXNzb3JDYWNoZSA9IG5ldyBNYXAoKTtcbmZ1bmN0aW9uIGFkZFByb2Nlc3NvckZ1bmN0aW9ucyhcbiAgY29uZmlnIC8qOiBzdHlsZWxpbnQkY29uZmlnKi9cbikgLyo6IHN0eWxlbGludCRjb25maWcqLyB7XG4gIGlmICghY29uZmlnLnByb2Nlc3NvcnMpIHJldHVybiBjb25maWc7XG5cbiAgY29uc3QgY29kZVByb2Nlc3NvcnMgPSBbXTtcbiAgY29uc3QgcmVzdWx0UHJvY2Vzc29ycyA9IFtdO1xuICBbXS5jb25jYXQoY29uZmlnLnByb2Nlc3NvcnMpLmZvckVhY2gocHJvY2Vzc29yQ29uZmlnID0+IHtcbiAgICBjb25zdCBwcm9jZXNzb3JLZXkgPSBKU09OLnN0cmluZ2lmeShwcm9jZXNzb3JDb25maWcpO1xuXG4gICAgbGV0IGluaXRpYWxpemVkUHJvY2Vzc29yO1xuICAgIGlmIChwcm9jZXNzb3JDYWNoZS5oYXMocHJvY2Vzc29yS2V5KSkge1xuICAgICAgaW5pdGlhbGl6ZWRQcm9jZXNzb3IgPSBwcm9jZXNzb3JDYWNoZS5nZXQocHJvY2Vzc29yS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvY2Vzc29yQ29uZmlnID0gW10uY29uY2F0KHByb2Nlc3NvckNvbmZpZyk7XG4gICAgICBjb25zdCBwcm9jZXNzb3JMb29rdXAgPSBwcm9jZXNzb3JDb25maWdbMF07XG4gICAgICBjb25zdCBwcm9jZXNzb3JPcHRpb25zID0gcHJvY2Vzc29yQ29uZmlnWzFdO1xuICAgICAgbGV0IHByb2Nlc3NvciA9IGR5bmFtaWNSZXF1aXJlKHByb2Nlc3Nvckxvb2t1cCk7XG4gICAgICBwcm9jZXNzb3IgPSBwcm9jZXNzb3IuZGVmYXVsdCB8fCBwcm9jZXNzb3I7XG4gICAgICBpbml0aWFsaXplZFByb2Nlc3NvciA9IHByb2Nlc3Nvcihwcm9jZXNzb3JPcHRpb25zKTtcbiAgICAgIHByb2Nlc3NvckNhY2hlLnNldChwcm9jZXNzb3JLZXksIGluaXRpYWxpemVkUHJvY2Vzc29yKTtcbiAgICB9XG5cbiAgICBpZiAoaW5pdGlhbGl6ZWRQcm9jZXNzb3IgJiYgaW5pdGlhbGl6ZWRQcm9jZXNzb3IuY29kZSkge1xuICAgICAgY29kZVByb2Nlc3NvcnMucHVzaChpbml0aWFsaXplZFByb2Nlc3Nvci5jb2RlKTtcbiAgICB9XG4gICAgaWYgKGluaXRpYWxpemVkUHJvY2Vzc29yICYmIGluaXRpYWxpemVkUHJvY2Vzc29yLnJlc3VsdCkge1xuICAgICAgcmVzdWx0UHJvY2Vzc29ycy5wdXNoKGluaXRpYWxpemVkUHJvY2Vzc29yLnJlc3VsdCk7XG4gICAgfVxuICB9KTtcblxuICBjb25maWcuY29kZVByb2Nlc3NvcnMgPSBjb2RlUHJvY2Vzc29ycztcbiAgY29uZmlnLnJlc3VsdFByb2Nlc3NvcnMgPSByZXN1bHRQcm9jZXNzb3JzO1xuICByZXR1cm4gY29uZmlnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgYXVnbWVudENvbmZpZ0V4dGVuZGVkLCBhdWdtZW50Q29uZmlnRnVsbCB9O1xuIl19