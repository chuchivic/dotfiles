
"use strict";

var fs = require("fs");
var lessSyntax = require("postcss-less");
var path = require("path");
var postcss = require("postcss");
var scssSyntax = require("postcss-scss");
var sugarssSyntax = require("sugarss");
var dynamicRequire = require("./dynamicRequire");

var postcssProcessor = postcss();

module.exports = function (stylelint /*: stylelint$internalApi*/) /*: Promise<?Object>*/{
  var options /*: {
              code?: string,
              codeFilename?: string,
              filePath?: string,
              codeProcessors?: Array<Function>,
              syntax?: stylelint$syntaxes,
              customSyntax?: string
              }*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var cached /*: ?postcss$result*/ = stylelint._postcssResultCache.get(options.filePath);
  if (cached) return Promise.resolve(cached);

  var getCode = undefined;
  if (options.code !== undefined) {
    getCode = Promise.resolve(options.code);
  } else if (options.filePath) {
    getCode = readFile(options.filePath);
  }

  if (!getCode) {
    throw new Error("code or filePath required");
  }

  return getCode.then(function (code) {
    var customSyntax = stylelint._options.customSyntax;
    var syntax = stylelint._options.syntax;

    if (customSyntax) {
      try {
        syntax = dynamicRequire(customSyntax);
      } catch (e) {
        throw new Error("Cannot resolve custom syntax module " + customSyntax);
      }
    } else {
      var fileExtension = path.extname(options.filePath || "");
      if (syntax === "scss" || !syntax && fileExtension === ".scss") {
        syntax = scssSyntax;
      } else if (syntax === "less" || !syntax && fileExtension === ".less") {
        syntax = lessSyntax;
      } else if (syntax === "sugarss" || !syntax && fileExtension === ".sss") {
        syntax = sugarssSyntax;
      } else if (syntax) {
        throw new Error("You must use a valid syntax option, either: scss, less or sugarss");
      }
    }

    var postcssOptions /*: postcss$options*/ = {};

    postcssOptions.from = options.filePath;

    /*
     * PostCSS allows for syntaxes that only contain a parser, however,
     * it then expects the syntax to be set as the `parser` option rather than `syntax.
     */
    if (syntax && !syntax.stringify) {
      postcssOptions.parser = syntax;
    } else {
      postcssOptions.syntax = syntax;
    }

    var source = options.code ? options.codeFilename : options.filePath;
    var preProcessedCode = code;
    if (options.codeProcessors) {
      options.codeProcessors.forEach(function (codeProcessor) {
        preProcessedCode = codeProcessor(preProcessedCode, source);
      });
    }

    return postcssProcessor.process(preProcessedCode, postcssOptions);
  }).then(function (postcssResult) {
    stylelint._postcssResultCache.set(options.filePath, postcssResult);
    return postcssResult;
  });
};

function readFile(filePath /*: string*/) /*: Promise<string>*/{
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, "utf8", function (err, content) {
      if (err) {
        return reject(err);
      }
      resolve(content);
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvZ2V0UG9zdGNzc1Jlc3VsdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDMUMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzVCLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNsQyxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDMUMsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3hDLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBOztBQUVsRCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sRUFBRSxDQUFBOztBQUVsQyxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsU0FBUyxvREFBbUQ7QUFDckYsTUFBTSxPQUFPOzs7Ozs7O29CQU9QLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTs7QUFFNUUsTUFBTSxNQUFNLHlCQUF3QixTQUFTLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUN2RixNQUFJLE1BQU0sRUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRTFDLE1BQUksT0FBTyxZQUFBLENBQUE7QUFDWCxNQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFF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UUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUs7QUFDOUMsVUFBSSxHQUFHLEVBQUU7QUFDUCxlQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtPQUNuQjtBQUNELGFBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNqQixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL2dldFBvc3Rjc3NSZXN1bHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcbmNvbnN0IGxlc3NTeW50YXggPSByZXF1aXJlKFwicG9zdGNzcy1sZXNzXCIpXG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIilcbmNvbnN0IHBvc3Rjc3MgPSByZXF1aXJlKFwicG9zdGNzc1wiKVxuY29uc3Qgc2Nzc1N5bnRheCA9IHJlcXVpcmUoXCJwb3N0Y3NzLXNjc3NcIilcbmNvbnN0IHN1Z2Fyc3NTeW50YXggPSByZXF1aXJlKFwic3VnYXJzc1wiKVxuY29uc3QgZHluYW1pY1JlcXVpcmUgPSByZXF1aXJlKFwiLi9keW5hbWljUmVxdWlyZVwiKVxuXG5jb25zdCBwb3N0Y3NzUHJvY2Vzc29yID0gcG9zdGNzcygpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHN0eWxlbGludC8qOiBzdHlsZWxpbnQkaW50ZXJuYWxBcGkqLykvKjogUHJvbWlzZTw/T2JqZWN0PiovIHtcbiAgY29uc3Qgb3B0aW9ucy8qOiB7XG4gICAgY29kZT86IHN0cmluZyxcbiAgICBjb2RlRmlsZW5hbWU/OiBzdHJpbmcsXG4gICAgZmlsZVBhdGg/OiBzdHJpbmcsXG4gICAgY29kZVByb2Nlc3NvcnM/OiBBcnJheTxGdW5jdGlvbj4sXG4gICAgc3ludGF4Pzogc3R5bGVsaW50JHN5bnRheGVzLFxuICAgIGN1c3RvbVN5bnRheD86IHN0cmluZ1xuICB9Ki8gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9XG5cbiAgY29uc3QgY2FjaGVkLyo6ID9wb3N0Y3NzJHJlc3VsdCovID0gc3R5bGVsaW50Ll9wb3N0Y3NzUmVzdWx0Q2FjaGUuZ2V0KG9wdGlvbnMuZmlsZVBhdGgpXG4gIGlmIChjYWNoZWQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2FjaGVkKVxuXG4gIGxldCBnZXRDb2RlXG4gIGlmIChvcHRpb25zLmNvZGUgIT09IHVuZGVmaW5lZCkge1xuICAgIGdldENvZGUgPSBQcm9taXNlLnJlc29sdmUob3B0aW9ucy5jb2RlKVxuICB9IGVsc2UgaWYgKG9wdGlvbnMuZmlsZVBhdGgpIHtcbiAgICBnZXRDb2RlID0gcmVhZEZpbGUob3B0aW9ucy5maWxlUGF0aClcbiAgfVxuXG4gIGlmICghZ2V0Q29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcImNvZGUgb3IgZmlsZVBhdGggcmVxdWlyZWRcIilcbiAgfVxuXG4gIHJldHVybiBnZXRDb2RlLnRoZW4oY29kZSA9PiB7XG4gICAgY29uc3QgY3VzdG9tU3ludGF4ID0gc3R5bGVsaW50Ll9vcHRpb25zLmN1c3RvbVN5bnRheFxuICAgIGxldCBzeW50YXggPSBzdHlsZWxpbnQuX29wdGlvbnMuc3ludGF4XG5cbiAgICBpZiAoY3VzdG9tU3ludGF4KSB7XG4gICAgICB0cnkge1xuICAgICAgICBzeW50YXggPSBkeW5hbWljUmVxdWlyZShjdXN0b21TeW50YXgpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHJlc29sdmUgY3VzdG9tIHN5bnRheCBtb2R1bGUgJHtjdXN0b21TeW50YXh9YClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZmlsZUV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShvcHRpb25zLmZpbGVQYXRoIHx8IFwiXCIpXG4gICAgICBpZiAoc3ludGF4ID09PSBcInNjc3NcIiB8fCAhc3ludGF4ICYmIGZpbGVFeHRlbnNpb24gPT09IFwiLnNjc3NcIikge1xuICAgICAgICBzeW50YXggPSBzY3NzU3ludGF4XG4gICAgICB9IGVsc2UgaWYgKHN5bnRheCA9PT0gXCJsZXNzXCIgfHwgIXN5bnRheCAmJiBmaWxlRXh0ZW5zaW9uID09PSBcIi5sZXNzXCIpIHtcbiAgICAgICAgc3ludGF4ID0gbGVzc1N5bnRheFxuICAgICAgfSBlbHNlIGlmIChzeW50YXggPT09IFwic3VnYXJzc1wiIHx8ICFzeW50YXggJiYgZmlsZUV4dGVuc2lvbiA9PT0gXCIuc3NzXCIpIHtcbiAgICAgICAgc3ludGF4ID0gc3VnYXJzc1N5bnRheFxuICAgICAgfSBlbHNlIGlmIChzeW50YXgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgdXNlIGEgdmFsaWQgc3ludGF4IG9wdGlvbiwgZWl0aGVyOiBzY3NzLCBsZXNzIG9yIHN1Z2Fyc3NcIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwb3N0Y3NzT3B0aW9ucy8qOiBwb3N0Y3NzJG9wdGlvbnMqLyA9IHt9XG5cbiAgICBwb3N0Y3NzT3B0aW9ucy5mcm9tID0gb3B0aW9ucy5maWxlUGF0aFxuXG4gICAgLypcbiAgICAgKiBQb3N0Q1NTIGFsbG93cyBmb3Igc3ludGF4ZXMgdGhhdCBvbmx5IGNvbnRhaW4gYSBwYXJzZXIsIGhvd2V2ZXIsXG4gICAgICogaXQgdGhlbiBleHBlY3RzIHRoZSBzeW50YXggdG8gYmUgc2V0IGFzIHRoZSBgcGFyc2VyYCBvcHRpb24gcmF0aGVyIHRoYW4gYHN5bnRheC5cbiAgICAgKi9cbiAgICBpZiAoc3ludGF4ICYmICFzeW50YXguc3RyaW5naWZ5KSB7XG4gICAgICBwb3N0Y3NzT3B0aW9ucy5wYXJzZXIgPSBzeW50YXhcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zdGNzc09wdGlvbnMuc3ludGF4ID0gc3ludGF4XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlID0gb3B0aW9ucy5jb2RlID8gb3B0aW9ucy5jb2RlRmlsZW5hbWUgOiBvcHRpb25zLmZpbGVQYXRoXG4gICAgbGV0IHByZVByb2Nlc3NlZENvZGUgPSBjb2RlXG4gICAgaWYgKG9wdGlvbnMuY29kZVByb2Nlc3NvcnMpIHtcbiAgICAgIG9wdGlvbnMuY29kZVByb2Nlc3NvcnMuZm9yRWFjaChjb2RlUHJvY2Vzc29yID0+IHtcbiAgICAgICAgcHJlUHJvY2Vzc2VkQ29kZSA9IGNvZGVQcm9jZXNzb3IocHJlUHJvY2Vzc2VkQ29kZSwgc291cmNlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zdGNzc1Byb2Nlc3Nvci5wcm9jZXNzKHByZVByb2Nlc3NlZENvZGUsIHBvc3Rjc3NPcHRpb25zKVxuICB9KS50aGVuKHBvc3Rjc3NSZXN1bHQgPT4ge1xuICAgIHN0eWxlbGludC5fcG9zdGNzc1Jlc3VsdENhY2hlLnNldChvcHRpb25zLmZpbGVQYXRoLCBwb3N0Y3NzUmVzdWx0KVxuICAgIHJldHVybiBwb3N0Y3NzUmVzdWx0XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRGaWxlKGZpbGVQYXRoLyo6IHN0cmluZyovKS8qOiBQcm9taXNlPHN0cmluZz4qLyB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMucmVhZEZpbGUoZmlsZVBhdGgsIFwidXRmOFwiLCAoZXJyLCBjb250ZW50KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZWplY3QoZXJyKVxuICAgICAgfVxuICAgICAgcmVzb2x2ZShjb250ZW50KVxuICAgIH0pXG4gIH0pXG59XG4iXX0=