Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var iconHTML = "<img src='" + __dirname + "/../static/logo.svg' style='width: 100%;'>";

var regexes = {
  // pretty dodgy, adapted from http://stackoverflow.com/a/8396658
  r: /([^\d\W]|[.])[\w.$]*$/,

  // adapted from http://stackoverflow.com/q/5474008
  python: /([^\d\W]|[\u00A0-\uFFFF])[\w.\u00A0-\uFFFF]*$/,

  // adapted from http://php.net/manual/en/language.variables.basics.php
  php: /[$a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/
};

function parseCompletions(results, prefix) {
  var matches = results.matches;
  var cursor_start = results.cursor_start;
  var cursor_end = results.cursor_end;
  var metadata = results.metadata;

  if (metadata && metadata._jupyter_types_experimental) {
    var comps = metadata._jupyter_types_experimental;
    if (comps.length > 0 && comps[0].text != null && comps[0].start != null && comps[0].end != null) {
      return _lodash2["default"].map(comps, function (match) {
        return {
          text: match.text,
          replacementPrefix: prefix.slice(match.start, match.end),
          type: match.type,
          iconHTML: !match.type || match.type === "<unknown>" ? iconHTML : undefined
        };
      });
    }
  }

  var replacementPrefix = prefix.slice(cursor_start, cursor_end);

  return _lodash2["default"].map(matches, function (match) {
    return {
      text: match,
      replacementPrefix: replacementPrefix,
      iconHTML: iconHTML
    };
  });
}

exports["default"] = function () {
  var autocompleteProvider = {
    selector: ".source",
    disableForSelector: ".comment, .string",

    // `excludeLowerPriority: false` won't suppress providers with lower
    // priority.
    // The default provider has a priority of 0.
    inclusionPriority: 1,
    excludeLowerPriority: false,

    // Required: Return a promise, an array of suggestions, or null.
    getSuggestions: function getSuggestions(_ref) {
      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

      var kernel = _store2["default"].kernel;

      if (!kernel || kernel.executionState !== "idle") {
        return null;
      }

      var line = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);

      var regex = regexes[kernel.language];
      if (regex) {
        prefix = _lodash2["default"].head(line.match(regex)) || "";
      } else {
        prefix = line;
      }

      // return if cursor is at whitespace
      if (prefix.trimRight().length < prefix.length) {
        return null;
      }

      if (prefix.trim().length < 3) {
        return null;
      }

      (0, _utils.log)("autocompleteProvider: request:", line, bufferPosition, prefix);

      return new Promise(function (resolve) {
        return kernel.complete(prefix, function (results) {
          return resolve(parseCompletions(results, prefix));
        });
      });
    }
  };

  return autocompleteProvider;
};

module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9hdXRvY29tcGxldGUtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3NCQUVjLFFBQVE7Ozs7cUJBQ0YsU0FBUzs7cUJBQ1gsU0FBUzs7OztBQXNCM0IsSUFBTSxRQUFRLGtCQUFnQixTQUFTLCtDQUE0QyxDQUFDOztBQUVwRixJQUFNLE9BQU8sR0FBRzs7QUFFZCxHQUFDLEVBQUUsdUJBQXVCOzs7QUFHMUIsUUFBTSxFQUFFLCtDQUErQzs7O0FBR3ZELEtBQUcsRUFBRSw0Q0FBNEM7Q0FDbEQsQ0FBQzs7QUFFRixTQUFTLGdCQUFnQixDQUFDLE9BQXNCLEVBQUUsTUFBYyxFQUFFO01BQ3hELE9BQU8sR0FBeUMsT0FBTyxDQUF2RCxPQUFPO01BQUUsWUFBWSxHQUEyQixPQUFPLENBQTlDLFlBQVk7TUFBRSxVQUFVLEdBQWUsT0FBTyxDQUFoQyxVQUFVO01BQUUsUUFBUSxHQUFLLE9BQU8sQ0FBcEIsUUFBUTs7QUFFbkQsTUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLDJCQUEyQixFQUFFO0FBQ3BELFFBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQztBQUNuRCxRQUNFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUNoQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksSUFDckIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLElBQ3RCLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxFQUNwQjtBQUNBLGFBQU8sb0JBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFBLEtBQUs7ZUFBSztBQUM1QixjQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7QUFDaEIsMkJBQWlCLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDdkQsY0FBSSxFQUFFLEtBQUssQ0FBQyxJQUFJO0FBQ2hCLGtCQUFRLEVBQ04sQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssV0FBVyxHQUFHLFFBQVEsR0FBRyxTQUFTO1NBQ25FO09BQUMsQ0FBQyxDQUFDO0tBQ0w7R0FDRjs7QUFFRCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUVqRSxTQUFPLG9CQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBQSxLQUFLO1dBQUs7QUFDOUIsVUFBSSxFQUFFLEtBQUs7QUFDWCx1QkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLGNBQVEsRUFBUixRQUFRO0tBQ1Q7R0FBQyxDQUFDLENBQUM7Q0FDTDs7cUJBRWMsWUFBVztBQUN4QixNQUFNLG9CQUFvQixHQUFHO0FBQzNCLFlBQVEsRUFBRSxTQUFTO0FBQ25CLHNCQUFrQixFQUFFLG1CQUFtQjs7Ozs7QUFLdkMscUJBQWlCLEVBQUUsQ0FBQztBQUNwQix3QkFBb0IsRUFBRSxLQUFLOzs7QUFHM0Isa0JBQWMsRUFBQSx3QkFBQyxJQUlBLEVBQWlDO1VBSDlDLE1BQU0sR0FETyxJQUlBLENBSGIsTUFBTTtVQUNOLGNBQWMsR0FGRCxJQUlBLENBRmIsY0FBYztVQUNkLE1BQU0sR0FITyxJQUlBLENBRGIsTUFBTTs7QUFFTixVQUFNLE1BQU0sR0FBRyxtQkFBTSxNQUFNLENBQUM7O0FBRTVCLFVBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLGNBQWMsS0FBSyxNQUFNLEVBQUU7QUFDL0MsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFNLElBQUksR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FDdkMsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUN2QixjQUFjLENBQ2YsQ0FBQyxDQUFDOztBQUVILFVBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsVUFBSSxLQUFLLEVBQUU7QUFDVCxjQUFNLEdBQUcsb0JBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDMUMsTUFBTTtBQUNMLGNBQU0sR0FBRyxJQUFJLENBQUM7T0FDZjs7O0FBR0QsVUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDN0MsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFFRCxVQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzVCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsc0JBQUksZ0NBQWdDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFcEUsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU87ZUFDeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsVUFBQyxPQUFPLEVBQW9CO0FBQ2xELGlCQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUNuRCxDQUFDO09BQUEsQ0FDSCxDQUFDO0tBQ0g7R0FDRixDQUFDOztBQUVGLFNBQU8sb0JBQW9CLENBQUM7Q0FDN0IiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2F1dG9jb21wbGV0ZS1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgc3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxudHlwZSBBdXRvY29tcGxldGUgPSB7XG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICBidWZmZXJQb3NpdGlvbjogYXRvbSRQb2ludCxcbiAgcHJlZml4OiBzdHJpbmdcbn07XG5cbnR5cGUgQ29tcGxldGVSZXBseSA9IHtcbiAgbWF0Y2hlczogQXJyYXk8c3RyaW5nPixcbiAgY3Vyc29yX3N0YXJ0OiBudW1iZXIsXG4gIGN1cnNvcl9lbmQ6IG51bWJlcixcbiAgbWV0YWRhdGE/OiB7XG4gICAgX2p1cHl0ZXJfdHlwZXNfZXhwZXJpbWVudGFsPzogQXJyYXk8e1xuICAgICAgc3RhcnQ/OiBudW1iZXIsXG4gICAgICBlbmQ/OiBudW1iZXIsXG4gICAgICB0ZXh0Pzogc3RyaW5nLFxuICAgICAgdHlwZT86IHN0cmluZ1xuICAgIH0+XG4gIH1cbn07XG5cbmNvbnN0IGljb25IVE1MID0gYDxpbWcgc3JjPScke19fZGlybmFtZX0vLi4vc3RhdGljL2xvZ28uc3ZnJyBzdHlsZT0nd2lkdGg6IDEwMCU7Jz5gO1xuXG5jb25zdCByZWdleGVzID0ge1xuICAvLyBwcmV0dHkgZG9kZ3ksIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84Mzk2NjU4XG4gIHI6IC8oW15cXGRcXFddfFsuXSlbXFx3LiRdKiQvLFxuXG4gIC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcS81NDc0MDA4XG4gIHB5dGhvbjogLyhbXlxcZFxcV118W1xcdTAwQTAtXFx1RkZGRl0pW1xcdy5cXHUwMEEwLVxcdUZGRkZdKiQvLFxuXG4gIC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vbGFuZ3VhZ2UudmFyaWFibGVzLmJhc2ljcy5waHBcbiAgcGhwOiAvWyRhLXpBLVpfXFx4N2YtXFx4ZmZdW2EtekEtWjAtOV9cXHg3Zi1cXHhmZl0qJC9cbn07XG5cbmZ1bmN0aW9uIHBhcnNlQ29tcGxldGlvbnMocmVzdWx0czogQ29tcGxldGVSZXBseSwgcHJlZml4OiBzdHJpbmcpIHtcbiAgY29uc3QgeyBtYXRjaGVzLCBjdXJzb3Jfc3RhcnQsIGN1cnNvcl9lbmQsIG1ldGFkYXRhIH0gPSByZXN1bHRzO1xuXG4gIGlmIChtZXRhZGF0YSAmJiBtZXRhZGF0YS5fanVweXRlcl90eXBlc19leHBlcmltZW50YWwpIHtcbiAgICBjb25zdCBjb21wcyA9IG1ldGFkYXRhLl9qdXB5dGVyX3R5cGVzX2V4cGVyaW1lbnRhbDtcbiAgICBpZiAoXG4gICAgICBjb21wcy5sZW5ndGggPiAwICYmXG4gICAgICBjb21wc1swXS50ZXh0ICE9IG51bGwgJiZcbiAgICAgIGNvbXBzWzBdLnN0YXJ0ICE9IG51bGwgJiZcbiAgICAgIGNvbXBzWzBdLmVuZCAhPSBudWxsXG4gICAgKSB7XG4gICAgICByZXR1cm4gXy5tYXAoY29tcHMsIG1hdGNoID0+ICh7XG4gICAgICAgIHRleHQ6IG1hdGNoLnRleHQsXG4gICAgICAgIHJlcGxhY2VtZW50UHJlZml4OiBwcmVmaXguc2xpY2UobWF0Y2guc3RhcnQsIG1hdGNoLmVuZCksXG4gICAgICAgIHR5cGU6IG1hdGNoLnR5cGUsXG4gICAgICAgIGljb25IVE1MOlxuICAgICAgICAgICFtYXRjaC50eXBlIHx8IG1hdGNoLnR5cGUgPT09IFwiPHVua25vd24+XCIgPyBpY29uSFRNTCA6IHVuZGVmaW5lZFxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHJlcGxhY2VtZW50UHJlZml4ID0gcHJlZml4LnNsaWNlKGN1cnNvcl9zdGFydCwgY3Vyc29yX2VuZCk7XG5cbiAgcmV0dXJuIF8ubWFwKG1hdGNoZXMsIG1hdGNoID0+ICh7XG4gICAgdGV4dDogbWF0Y2gsXG4gICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgaWNvbkhUTUxcbiAgfSkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgY29uc3QgYXV0b2NvbXBsZXRlUHJvdmlkZXIgPSB7XG4gICAgc2VsZWN0b3I6IFwiLnNvdXJjZVwiLFxuICAgIGRpc2FibGVGb3JTZWxlY3RvcjogXCIuY29tbWVudCwgLnN0cmluZ1wiLFxuXG4gICAgLy8gYGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZWAgd29uJ3Qgc3VwcHJlc3MgcHJvdmlkZXJzIHdpdGggbG93ZXJcbiAgICAvLyBwcmlvcml0eS5cbiAgICAvLyBUaGUgZGVmYXVsdCBwcm92aWRlciBoYXMgYSBwcmlvcml0eSBvZiAwLlxuICAgIGluY2x1c2lvblByaW9yaXR5OiAxLFxuICAgIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZSxcblxuICAgIC8vIFJlcXVpcmVkOiBSZXR1cm4gYSBwcm9taXNlLCBhbiBhcnJheSBvZiBzdWdnZXN0aW9ucywgb3IgbnVsbC5cbiAgICBnZXRTdWdnZXN0aW9ucyh7XG4gICAgICBlZGl0b3IsXG4gICAgICBidWZmZXJQb3NpdGlvbixcbiAgICAgIHByZWZpeFxuICAgIH06IEF1dG9jb21wbGV0ZSk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4gfCBudWxsIHtcbiAgICAgIGNvbnN0IGtlcm5lbCA9IHN0b3JlLmtlcm5lbDtcblxuICAgICAgaWYgKCFrZXJuZWwgfHwga2VybmVsLmV4ZWN1dGlvblN0YXRlICE9PSBcImlkbGVcIikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbXG4gICAgICAgIFtidWZmZXJQb3NpdGlvbi5yb3csIDBdLFxuICAgICAgICBidWZmZXJQb3NpdGlvblxuICAgICAgXSk7XG5cbiAgICAgIGNvbnN0IHJlZ2V4ID0gcmVnZXhlc1trZXJuZWwubGFuZ3VhZ2VdO1xuICAgICAgaWYgKHJlZ2V4KSB7XG4gICAgICAgIHByZWZpeCA9IF8uaGVhZChsaW5lLm1hdGNoKHJlZ2V4KSkgfHwgXCJcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByZWZpeCA9IGxpbmU7XG4gICAgICB9XG5cbiAgICAgIC8vIHJldHVybiBpZiBjdXJzb3IgaXMgYXQgd2hpdGVzcGFjZVxuICAgICAgaWYgKHByZWZpeC50cmltUmlnaHQoKS5sZW5ndGggPCBwcmVmaXgubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJlZml4LnRyaW0oKS5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBsb2coXCJhdXRvY29tcGxldGVQcm92aWRlcjogcmVxdWVzdDpcIiwgbGluZSwgYnVmZmVyUG9zaXRpb24sIHByZWZpeCk7XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+XG4gICAgICAgIGtlcm5lbC5jb21wbGV0ZShwcmVmaXgsIChyZXN1bHRzOiBDb21wbGV0ZVJlcGx5KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUocGFyc2VDb21wbGV0aW9ucyhyZXN1bHRzLCBwcmVmaXgpKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBhdXRvY29tcGxldGVQcm92aWRlcjtcbn1cbiJdfQ==