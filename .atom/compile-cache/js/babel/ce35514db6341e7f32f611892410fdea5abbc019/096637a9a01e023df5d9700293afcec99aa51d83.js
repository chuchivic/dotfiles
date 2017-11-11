
"use strict";
var augmentConfigFull = require("./augmentConfig").augmentConfigFull;
var configurationError = require("./utils/configurationError");
var path = require("path");

module.exports = function (stylelint, /*: stylelint$internalApi*/
searchPath /*:: ?: string*/
) /*: Promise<?{ config: stylelint$config, filepath: string }>*/{
  searchPath = searchPath || process.cwd();

  var optionsConfig = stylelint._options.config;

  if (optionsConfig !== undefined) {
    var cached = stylelint._specifiedConfigCache.get(optionsConfig);
    if (cached) return cached;

    // stylelint._fullExplorer (cosmiconfig) is already configured to
    // run augmentConfigFull; but since we're making up the result here,
    // we need to manually run the transform
    var augmentedResult = augmentConfigFull(stylelint, {
      config: optionsConfig,
      // Add the extra path part so that we can get the directory without being
      // confused
      filepath: path.join(process.cwd(), "argument-config")
    });
    stylelint._specifiedConfigCache.set(optionsConfig, augmentedResult);
    return augmentedResult;
  }

  return stylelint._fullExplorer.load(searchPath, stylelint._options.configFile).then(function (config) {
    // If no config was found, try looking from process.cwd
    if (!config) return stylelint._fullExplorer.load(process.cwd());
    return config;
  }).then(function (config) {
    if (!config) {
      var ending = searchPath ? " for " + searchPath : "";
      throw configurationError("No configuration provided" + ending);
    }
    return config;
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvZ2V0Q29uZmlnRm9yRmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBO0FBQ1osSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQTtBQUN0RSxJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0FBQ2hFLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUNmLFNBQVM7QUFDVCxVQUFVO2dFQUNvRDtBQUM5RCxZQUFVLEdBQUcsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQTs7QUFFeEMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUE7O0FBRS9DLE1BQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtBQUMvQixRQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2pFLFFBQUksTUFBTSxFQUFFLE9BQU8sTUFBTSxDQUFBOzs7OztBQUt6QixRQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUU7QUFDbkQsWUFBTSxFQUFFLGFBQWE7OztBQUdyQixjQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsaUJBQWlCLENBQUM7S0FDdEQsQ0FBQyxDQUFBO0FBQ0YsYUFBUyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDbkUsV0FBTyxlQUFlLENBQUE7R0FDdkI7O0FBRUQsU0FBTyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLEVBQUk7O0FBRTVGLFFBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUMvRCxXQUFPLE1BQU0sQ0FBQTtHQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEIsUUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sTUFBTSxHQUFHLFVBQVUsYUFBVyxVQUFVLEdBQUssRUFBRSxDQUFBO0FBQ3JELFlBQU0sa0JBQWtCLCtCQUE2QixNQUFNLENBQUcsQ0FBQTtLQUMvRDtBQUNELFdBQU8sTUFBTSxDQUFBO0dBQ2QsQ0FBQyxDQUFBO0NBQ0gsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL2dldENvbmZpZ0ZvckZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcbmNvbnN0IGF1Z21lbnRDb25maWdGdWxsID0gcmVxdWlyZShcIi4vYXVnbWVudENvbmZpZ1wiKS5hdWdtZW50Q29uZmlnRnVsbFxuY29uc3QgY29uZmlndXJhdGlvbkVycm9yID0gcmVxdWlyZShcIi4vdXRpbHMvY29uZmlndXJhdGlvbkVycm9yXCIpXG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIilcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoXG4gIHN0eWxlbGludC8qOiBzdHlsZWxpbnQkaW50ZXJuYWxBcGkqLyxcbiAgc2VhcmNoUGF0aC8qOjogPzogc3RyaW5nKi9cbikvKjogUHJvbWlzZTw/eyBjb25maWc6IHN0eWxlbGludCRjb25maWcsIGZpbGVwYXRoOiBzdHJpbmcgfT4qLyB7XG4gIHNlYXJjaFBhdGggPSBzZWFyY2hQYXRoIHx8IHByb2Nlc3MuY3dkKClcblxuICBjb25zdCBvcHRpb25zQ29uZmlnID0gc3R5bGVsaW50Ll9vcHRpb25zLmNvbmZpZ1xuXG4gIGlmIChvcHRpb25zQ29uZmlnICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBjYWNoZWQgPSBzdHlsZWxpbnQuX3NwZWNpZmllZENvbmZpZ0NhY2hlLmdldChvcHRpb25zQ29uZmlnKVxuICAgIGlmIChjYWNoZWQpIHJldHVybiBjYWNoZWRcblxuICAgIC8vIHN0eWxlbGludC5fZnVsbEV4cGxvcmVyIChjb3NtaWNvbmZpZykgaXMgYWxyZWFkeSBjb25maWd1cmVkIHRvXG4gICAgLy8gcnVuIGF1Z21lbnRDb25maWdGdWxsOyBidXQgc2luY2Ugd2UncmUgbWFraW5nIHVwIHRoZSByZXN1bHQgaGVyZSxcbiAgICAvLyB3ZSBuZWVkIHRvIG1hbnVhbGx5IHJ1biB0aGUgdHJhbnNmb3JtXG4gICAgY29uc3QgYXVnbWVudGVkUmVzdWx0ID0gYXVnbWVudENvbmZpZ0Z1bGwoc3R5bGVsaW50LCB7XG4gICAgICBjb25maWc6IG9wdGlvbnNDb25maWcsXG4gICAgICAvLyBBZGQgdGhlIGV4dHJhIHBhdGggcGFydCBzbyB0aGF0IHdlIGNhbiBnZXQgdGhlIGRpcmVjdG9yeSB3aXRob3V0IGJlaW5nXG4gICAgICAvLyBjb25mdXNlZFxuICAgICAgZmlsZXBhdGg6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBcImFyZ3VtZW50LWNvbmZpZ1wiKSxcbiAgICB9KVxuICAgIHN0eWxlbGludC5fc3BlY2lmaWVkQ29uZmlnQ2FjaGUuc2V0KG9wdGlvbnNDb25maWcsIGF1Z21lbnRlZFJlc3VsdClcbiAgICByZXR1cm4gYXVnbWVudGVkUmVzdWx0XG4gIH1cblxuICByZXR1cm4gc3R5bGVsaW50Ll9mdWxsRXhwbG9yZXIubG9hZChzZWFyY2hQYXRoLCBzdHlsZWxpbnQuX29wdGlvbnMuY29uZmlnRmlsZSkudGhlbihjb25maWcgPT4ge1xuICAgIC8vIElmIG5vIGNvbmZpZyB3YXMgZm91bmQsIHRyeSBsb29raW5nIGZyb20gcHJvY2Vzcy5jd2RcbiAgICBpZiAoIWNvbmZpZykgcmV0dXJuIHN0eWxlbGludC5fZnVsbEV4cGxvcmVyLmxvYWQocHJvY2Vzcy5jd2QoKSlcbiAgICByZXR1cm4gY29uZmlnXG4gIH0pLnRoZW4oY29uZmlnID0+IHtcbiAgICBpZiAoIWNvbmZpZykge1xuICAgICAgY29uc3QgZW5kaW5nID0gc2VhcmNoUGF0aCA/IGAgZm9yICR7c2VhcmNoUGF0aH1gIDogXCJcIlxuICAgICAgdGhyb3cgY29uZmlndXJhdGlvbkVycm9yKGBObyBjb25maWd1cmF0aW9uIHByb3ZpZGVkJHtlbmRpbmd9YClcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZ1xuICB9KVxufVxuIl19