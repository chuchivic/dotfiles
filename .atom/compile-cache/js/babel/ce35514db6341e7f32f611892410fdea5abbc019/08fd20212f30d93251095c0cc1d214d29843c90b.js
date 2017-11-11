Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideLinter = provideLinter;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/**
 * Note that this can't be loaded lazily as `atom` doesn't export it correctly
 * for that, however as this comes from app.asar it is pre-compiled and is
 * essentially "free" as there is no expensive compilation step.
 */
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

'use babel';

var lazyReq = require('lazy-req')(require);

var _lazyReq = lazyReq('path')('dirname');

var dirname = _lazyReq.dirname;

var stylelint = lazyReq('stylelint');

var _lazyReq2 = lazyReq('atom-linter')('generateRange');

var generateRange = _lazyReq2.generateRange;

var assignDeep = lazyReq('assign-deep');
var escapeHTML = lazyReq('escape-html');

// Settings
var useStandard = undefined;
var presetConfig = undefined;
var disableWhenNoConfig = undefined;
var showIgnored = undefined;

// Internal vars
var subscriptions = undefined;
var baseScopes = ['source.css', 'source.scss', 'source.css.scss', 'source.less', 'source.css.less', 'source.css.postcss', 'source.css.postcss.sugarss'];

function startMeasure(baseName) {
  performance.mark(baseName + '-start');
}

function endMeasure(baseName) {
  if (atom.inDevMode()) {
    performance.mark(baseName + '-end');
    performance.measure(baseName, baseName + '-start', baseName + '-end');
    // eslint-disable-next-line no-console
    console.log(baseName + ' took: ', performance.getEntriesByName(baseName)[0].duration);
    performance.clearMarks(baseName + '-end');
    performance.clearMeasures(baseName);
  }
  performance.clearMarks(baseName + '-start');
}

function createRange(editor, data) {
  if (!Object.hasOwnProperty.call(data, 'line') && !Object.hasOwnProperty.call(data, 'column')) {
    // data.line & data.column might be undefined for non-fatal invalid rules,
    // e.g.: "block-no-empty": "foo"
    // Return `false` so Linter will ignore the range
    return false;
  }

  return generateRange(editor, data.line - 1, data.column - 1);
}

function activate() {
  startMeasure('linter-stylelint: Activation');
  require('atom-package-deps').install('linter-stylelint');

  subscriptions = new _atom.CompositeDisposable();

  subscriptions.add(atom.config.observe('linter-stylelint.useStandard', function (value) {
    useStandard = value;
  }));
  subscriptions.add(atom.config.observe('linter-stylelint.disableWhenNoConfig', function (value) {
    disableWhenNoConfig = value;
  }));
  subscriptions.add(atom.config.observe('linter-stylelint.showIgnored', function (value) {
    showIgnored = value;
  }));

  endMeasure('linter-stylelint: Activation');
}

function deactivate() {
  subscriptions.dispose();
}

function generateHTMLMessage(message) {
  if (!message.rule || message.rule === 'CssSyntaxError') {
    return escapeHTML()(message.text);
  }

  var ruleParts = message.rule.split('/');
  var url = undefined;

  if (ruleParts.length === 1) {
    // Core rule
    url = 'http://stylelint.io/user-guide/rules/' + ruleParts[0];
  } else {
    // Plugin rule
    var pluginName = ruleParts[0];
    // const ruleName = ruleParts[1];

    switch (pluginName) {
      case 'plugin':
        url = 'https://github.com/AtomLinter/linter-stylelint/tree/master/docs/noRuleNamespace.md';
        break;
      default:
        url = 'https://github.com/AtomLinter/linter-stylelint/tree/master/docs/linkingNewRule.md';
    }
  }

  // Escape any HTML in the message, and replace the rule ID with a link
  return escapeHTML()(message.text).replace('(' + message.rule + ')', '(<a href="' + url + '">' + message.rule + '</a>)');
}

var parseResults = function parseResults(editor, options, results, filePath) {
  startMeasure('linter-stylelint: Parsing results');
  if (options.code !== editor.getText()) {
    // The editor contents have changed since the lint was requested, tell
    //   Linter not to update the results
    endMeasure('linter-stylelint: Parsing results');
    endMeasure('linter-stylelint: Lint');
    return null;
  }

  if (!results) {
    endMeasure('linter-stylelint: Parsing results');
    endMeasure('linter-stylelint: Lint');
    return [];
  }

  var invalidOptions = results.invalidOptionWarnings.map(function (msg) {
    return {
      type: 'Error',
      severity: 'error',
      text: msg.text,
      filePath: filePath
    };
  });

  var warnings = results.warnings.map(function (warning) {
    // Stylelint only allows 'error' and 'warning' as severity values
    var severity = !warning.severity || warning.severity === 'error' ? 'Error' : 'Warning';
    return {
      type: severity,
      severity: severity.toLowerCase(),
      html: generateHTMLMessage(warning),
      filePath: filePath,
      range: createRange(editor, warning)
    };
  });

  var deprecations = results.deprecations.map(function (deprecation) {
    return {
      type: 'Warning',
      severity: 'warning',
      html: escapeHTML()(deprecation.text) + ' (<a href="' + deprecation.reference + '">reference</a>)',
      filePath: filePath
    };
  });

  var ignored = [];
  if (showIgnored && results.ignored) {
    ignored.push({
      type: 'Warning',
      severity: 'warning',
      text: 'This file is ignored',
      filePath: filePath
    });
  }

  var toReturn = [].concat(invalidOptions).concat(warnings).concat(deprecations).concat(ignored);

  endMeasure('linter-stylelint: Parsing results');
  endMeasure('linter-stylelint: Lint');
  return toReturn;
};

var runStylelint = _asyncToGenerator(function* (editor, options, filePath) {
  startMeasure('linter-stylelint: Stylelint');
  var data = undefined;
  try {
    data = yield stylelint().lint(options);
  } catch (error) {
    endMeasure('linter-stylelint: Stylelint');
    // Was it a code parsing error?
    if (error.line) {
      endMeasure('linter-stylelint: Lint');
      return [{
        type: 'Error',
        severity: 'error',
        text: error.reason || error.message,
        filePath: filePath,
        range: createRange(editor, error)
      }];
    }

    // If we got here, stylelint found something really wrong with the
    // configuration, such as extending an invalid configuration
    atom.notifications.addError('Unable to run stylelint', {
      detail: error.reason || error.message,
      dismissable: true
    });

    endMeasure('linter-stylelint: Lint');
    return [];
  }
  endMeasure('linter-stylelint: Stylelint');

  var results = data.results.shift();
  return parseResults(editor, options, results, filePath);
});

function provideLinter() {
  return {
    name: 'stylelint',
    grammarScopes: baseScopes,
    scope: 'file',
    lintOnFly: true,
    lint: _asyncToGenerator(function* (editor) {
      startMeasure('linter-stylelint: Lint');
      var scopes = editor.getLastCursor().getScopeDescriptor().getScopesArray();

      var filePath = editor.getPath();
      var text = editor.getText();

      if (!text) {
        endMeasure('linter-stylelint: Lint');
        return [];
      }

      // Require stylelint-config-standard if it hasn't already been loaded
      if (!presetConfig && useStandard) {
        presetConfig = require('stylelint-config-standard');
      }
      // Setup base config if useStandard() is true
      var defaultConfig = {
        rules: {}
      };

      // Base the config in the project directory

      var _atom$project$relativizePath = atom.project.relativizePath(filePath);

      var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 1);

      var configBasedir = _atom$project$relativizePath2[0];

      if (configBasedir === null) {
        // Falling back to the file directory if no project is found
        configBasedir = dirname(filePath);
      }

      var rules = useStandard ? assignDeep()({}, presetConfig) : defaultConfig;

      var options = {
        code: text,
        codeFilename: filePath,
        config: rules,
        configBasedir: configBasedir
      };

      if (scopes.includes('source.css.scss') || scopes.includes('source.scss')) {
        options.syntax = 'scss';
      }
      if (scopes.includes('source.css.less') || scopes.includes('source.less')) {
        options.syntax = 'less';
      }
      if (scopes.includes('source.css.postcss.sugarss')) {
        options.syntax = 'sugarss';
        // `stylelint-config-standard` isn't fully compatible with SugarSS
        // See here for details:
        // https://github.com/stylelint/stylelint-config-standard#using-the-config-with-sugarss-syntax
        options.config.rules['block-closing-brace-empty-line-before'] = null;
        options.config.rules['block-closing-brace-newline-after'] = null;
        options.config.rules['block-closing-brace-newline-before'] = null;
        options.config.rules['block-closing-brace-space-before'] = null;
        options.config.rules['block-opening-brace-newline-after'] = null;
        options.config.rules['block-opening-brace-space-after'] = null;
        options.config.rules['block-opening-brace-space-before'] = null;
        options.config.rules['declaration-block-semicolon-newline-after'] = null;
        options.config.rules['declaration-block-semicolon-space-after'] = null;
        options.config.rules['declaration-block-semicolon-space-before'] = null;
        options.config.rules['declaration-block-trailing-semicolon'] = null;
        options.config.rules['declaration-block-trailing-semicolon'] = null;
      }

      startMeasure('linter-stylelint: Create Linter');
      var stylelintLinter = yield stylelint().createLinter();
      endMeasure('linter-stylelint: Create Linter');

      startMeasure('linter-stylelint: Config');
      var foundConfig = undefined;
      try {
        foundConfig = yield stylelintLinter.getConfigForFile(filePath);
      } catch (error) {
        if (!/No configuration provided for .+/.test(error.message)) {
          endMeasure('linter-stylelint: Config');
          // If we got here, stylelint failed to parse the configuration
          // there's no point of re-linting if useStandard is true, because the
          // user does not have the complete set of desired rules parsed
          atom.notifications.addError('Unable to parse stylelint configuration', {
            detail: error.message,
            dismissable: true
          });
          endMeasure('linter-stylelint: Lint');
          return [];
        }
      }
      endMeasure('linter-stylelint: Config');

      if (foundConfig) {
        options.config = assignDeep()(rules, foundConfig.config);
        options.configBasedir = dirname(foundConfig.filepath);
      }

      if (!foundConfig && disableWhenNoConfig) {
        endMeasure('linter-stylelint: Lint');
        return [];
      }

      startMeasure('linter-stylelint: Check ignored');
      var fileIsIgnored = undefined;
      try {
        fileIsIgnored = yield stylelintLinter.isPathIgnored(filePath);
      } catch (error) {
        // Do nothing, configuration errors should have already been caught and thrown above
      }
      endMeasure('linter-stylelint: Check ignored');

      if (fileIsIgnored) {
        endMeasure('linter-stylelint: Lint');
        if (showIgnored) {
          return [{
            type: 'Warning',
            severity: 'warning',
            text: 'This file is ignored',
            filePath: filePath
          }];
        }
        return [];
      }

      var results = yield runStylelint(editor, options, filePath);
      return results;
    })
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBUW9DLE1BQU07O0FBUjFDLFdBQVcsQ0FBQzs7QUFVWixJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7O2VBRXpCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUM7O0lBQXRDLE9BQU8sWUFBUCxPQUFPOztBQUNmLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7Z0JBQ2IsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQzs7SUFBekQsYUFBYSxhQUFiLGFBQWE7O0FBQ3JCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMxQyxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7OztBQUcxQyxJQUFJLFdBQVcsWUFBQSxDQUFDO0FBQ2hCLElBQUksWUFBWSxZQUFBLENBQUM7QUFDakIsSUFBSSxtQkFBbUIsWUFBQSxDQUFDO0FBQ3hCLElBQUksV0FBVyxZQUFBLENBQUM7OztBQUdoQixJQUFJLGFBQWEsWUFBQSxDQUFDO0FBQ2xCLElBQU0sVUFBVSxHQUFHLENBQ2pCLFlBQVksRUFDWixhQUFhLEVBQ2IsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDYixpQkFBaUIsRUFDakIsb0JBQW9CLEVBQ3BCLDRCQUE0QixDQUM3QixDQUFDOztBQUVGLFNBQVMsWUFBWSxDQUFDLFFBQVEsRUFBRTtBQUM5QixhQUFXLENBQUMsSUFBSSxDQUFJLFFBQVEsWUFBUyxDQUFDO0NBQ3ZDOztBQUVELFNBQVMsVUFBVSxDQUFDLFFBQVEsRUFBRTtBQUM1QixNQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtBQUNwQixlQUFXLENBQUMsSUFBSSxD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ckMsZUFBTyxFQUFFLENBQUM7T0FDWDs7QUFFRCxrQkFBWSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDaEQsVUFBSSxhQUFhLFlBQUEsQ0FBQztBQUNsQixVQUFJO0FBQ0YscUJBQWEsR0FBRyxNQUFNLGVBQWUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDL0QsQ0FBQyxPQUFPLEtBQUssRUFBRTs7T0FFZjtBQUNELGdCQUFVLENBQUMsaUNBQWlDLENBQUMsQ0FBQzs7QUFFOUMsVUFBSSxhQUFhLEVBQUU7QUFDakIsa0JBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3JDLFlBQUksV0FBVyxFQUFFO0FBQ2YsaUJBQU8sQ0FBQztBQUNOLGdCQUFJLEVBQUUsU0FBUztBQUNmLG9CQUFRLEVBQUUsU0FBUztBQUNuQixnQkFBSSxFQUFFLHNCQUFzQjtBQUM1QixvQkFBUSxFQUFSLFFBQVE7V0FDVCxDQUFDLENBQUM7U0FDSjtBQUNELGVBQU8sRUFBRSxDQUFDO09BQ1g7O0FBRUQsVUFBTSxPQUFPLEdBQUcsTUFBTSxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5RCxhQUFPLE9BQU8sQ0FBQztLQUNoQixDQUFBO0dBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbi8qKlxuICogTm90ZSB0aGF0IHRoaXMgY2FuJ3QgYmUgbG9hZGVkIGxhemlseSBhcyBgYXRvbWAgZG9lc24ndCBleHBvcnQgaXQgY29ycmVjdGx5XG4gKiBmb3IgdGhhdCwgaG93ZXZlciBhcyB0aGlzIGNvbWVzIGZyb20gYXBwLmFzYXIgaXQgaXMgcHJlLWNvbXBpbGVkIGFuZCBpc1xuICogZXNzZW50aWFsbHkgXCJmcmVlXCIgYXMgdGhlcmUgaXMgbm8gZXhwZW5zaXZlIGNvbXBpbGF0aW9uIHN0ZXAuXG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvZXh0ZW5zaW9ucywgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbmNvbnN0IGxhenlSZXEgPSByZXF1aXJlKCdsYXp5LXJlcScpKHJlcXVpcmUpO1xuXG5jb25zdCB7IGRpcm5hbWUgfSA9IGxhenlSZXEoJ3BhdGgnKSgnZGlybmFtZScpO1xuY29uc3Qgc3R5bGVsaW50ID0gbGF6eVJlcSgnc3R5bGVsaW50Jyk7XG5jb25zdCB7IGdlbmVyYXRlUmFuZ2UgfSA9IGxhenlSZXEoJ2F0b20tbGludGVyJykoJ2dlbmVyYXRlUmFuZ2UnKTtcbmNvbnN0IGFzc2lnbkRlZXAgPSBsYXp5UmVxKCdhc3NpZ24tZGVlcCcpO1xuY29uc3QgZXNjYXBlSFRNTCA9IGxhenlSZXEoJ2VzY2FwZS1odG1sJyk7XG5cbi8vIFNldHRpbmdzXG5sZXQgdXNlU3RhbmRhcmQ7XG5sZXQgcHJlc2V0Q29uZmlnO1xubGV0IGRpc2FibGVXaGVuTm9Db25maWc7XG5sZXQgc2hvd0lnbm9yZWQ7XG5cbi8vIEludGVybmFsIHZhcnNcbmxldCBzdWJzY3JpcHRpb25zO1xuY29uc3QgYmFzZVNjb3BlcyA9IFtcbiAgJ3NvdXJjZS5jc3MnLFxuICAnc291cmNlLnNjc3MnLFxuICAnc291cmNlLmNzcy5zY3NzJyxcbiAgJ3NvdXJjZS5sZXNzJyxcbiAgJ3NvdXJjZS5jc3MubGVzcycsXG4gICdzb3VyY2UuY3NzLnBvc3Rjc3MnLFxuICAnc291cmNlLmNzcy5wb3N0Y3NzLnN1Z2Fyc3MnXG5dO1xuXG5mdW5jdGlvbiBzdGFydE1lYXN1cmUoYmFzZU5hbWUpIHtcbiAgcGVyZm9ybWFuY2UubWFyayhgJHtiYXNlTmFtZX0tc3RhcnRgKTtcbn1cblxuZnVuY3Rpb24gZW5kTWVhc3VyZShiYXNlTmFtZSkge1xuICBpZiAoYXRvbS5pbkRldk1vZGUoKSkge1xuICAgIHBlcmZvcm1hbmNlLm1hcmsoYCR7YmFzZU5hbWV9LWVuZGApO1xuICAgIHBlcmZvcm1hbmNlLm1lYXN1cmUoYmFzZU5hbWUsIGAke2Jhc2VOYW1lfS1zdGFydGAsIGAke2Jhc2VOYW1lfS1lbmRgKTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUubG9nKGAke2Jhc2VOYW1lfSB0b29rOiBgLCBwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKGJhc2VOYW1lKVswXS5kdXJhdGlvbik7XG4gICAgcGVyZm9ybWFuY2UuY2xlYXJNYXJrcyhgJHtiYXNlTmFtZX0tZW5kYCk7XG4gICAgcGVyZm9ybWFuY2UuY2xlYXJNZWFzdXJlcyhiYXNlTmFtZSk7XG4gIH1cbiAgcGVyZm9ybWFuY2UuY2xlYXJNYXJrcyhgJHtiYXNlTmFtZX0tc3RhcnRgKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmFuZ2UoZWRpdG9yLCBkYXRhKSB7XG4gIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgJ2xpbmUnKSAmJiAhT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgJ2NvbHVtbicpKSB7XG4gICAgLy8gZGF0YS5saW5lICYgZGF0YS5jb2x1bW4gbWlnaHQgYmUgdW5kZWZpbmVkIGZvciBub24tZmF0YWwgaW52YWxpZCBydWxlcyxcbiAgICAvLyBlLmcuOiBcImJsb2NrLW5vLWVtcHR5XCI6IFwiZm9vXCJcbiAgICAvLyBSZXR1cm4gYGZhbHNlYCBzbyBMaW50ZXIgd2lsbCBpZ25vcmUgdGhlIHJhbmdlXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGdlbmVyYXRlUmFuZ2UoZWRpdG9yLCBkYXRhLmxpbmUgLSAxLCBkYXRhLmNvbHVtbiAtIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoKSB7XG4gIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQWN0aXZhdGlvbicpO1xuICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1zdHlsZWxpbnQnKTtcblxuICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItc3R5bGVsaW50LnVzZVN0YW5kYXJkJywgKHZhbHVlKSA9PiB7XG4gICAgdXNlU3RhbmRhcmQgPSB2YWx1ZTtcbiAgfSkpO1xuICBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItc3R5bGVsaW50LmRpc2FibGVXaGVuTm9Db25maWcnLCAodmFsdWUpID0+IHtcbiAgICBkaXNhYmxlV2hlbk5vQ29uZmlnID0gdmFsdWU7XG4gIH0pKTtcbiAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXN0eWxlbGludC5zaG93SWdub3JlZCcsICh2YWx1ZSkgPT4ge1xuICAgIHNob3dJZ25vcmVkID0gdmFsdWU7XG4gIH0pKTtcblxuICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBBY3RpdmF0aW9uJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVIVE1MTWVzc2FnZShtZXNzYWdlKSB7XG4gIGlmICghbWVzc2FnZS5ydWxlIHx8IG1lc3NhZ2UucnVsZSA9PT0gJ0Nzc1N5bnRheEVycm9yJykge1xuICAgIHJldHVybiBlc2NhcGVIVE1MKCkobWVzc2FnZS50ZXh0KTtcbiAgfVxuXG4gIGNvbnN0IHJ1bGVQYXJ0cyA9IG1lc3NhZ2UucnVsZS5zcGxpdCgnLycpO1xuICBsZXQgdXJsO1xuXG4gIGlmIChydWxlUGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gQ29yZSBydWxlXG4gICAgdXJsID0gYGh0dHA6Ly9zdHlsZWxpbnQuaW8vdXNlci1ndWlkZS9ydWxlcy8ke3J1bGVQYXJ0c1swXX1gO1xuICB9IGVsc2Uge1xuICAgIC8vIFBsdWdpbiBydWxlXG4gICAgY29uc3QgcGx1Z2luTmFtZSA9IHJ1bGVQYXJ0c1swXTtcbiAgICAvLyBjb25zdCBydWxlTmFtZSA9IHJ1bGVQYXJ0c1sxXTtcblxuICAgIHN3aXRjaCAocGx1Z2luTmFtZSkge1xuICAgICAgY2FzZSAncGx1Z2luJzpcbiAgICAgICAgdXJsID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL2xpbnRlci1zdHlsZWxpbnQvdHJlZS9tYXN0ZXIvZG9jcy9ub1J1bGVOYW1lc3BhY2UubWQnO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHVybCA9ICdodHRwczovL2dpdGh1Yi5jb20vQXRvbUxpbnRlci9saW50ZXItc3R5bGVsaW50L3RyZWUvbWFzdGVyL2RvY3MvbGlua2luZ05ld1J1bGUubWQnO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVzY2FwZSBhbnkgSFRNTCBpbiB0aGUgbWVzc2FnZSwgYW5kIHJlcGxhY2UgdGhlIHJ1bGUgSUQgd2l0aCBhIGxpbmtcbiAgcmV0dXJuIGVzY2FwZUhUTUwoKShtZXNzYWdlLnRleHQpLnJlcGxhY2UoXG4gICAgYCgke21lc3NhZ2UucnVsZX0pYCwgYCg8YSBocmVmPVwiJHt1cmx9XCI+JHttZXNzYWdlLnJ1bGV9PC9hPilgXG4gICk7XG59XG5cbmNvbnN0IHBhcnNlUmVzdWx0cyA9IChlZGl0b3IsIG9wdGlvbnMsIHJlc3VsdHMsIGZpbGVQYXRoKSA9PiB7XG4gIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogUGFyc2luZyByZXN1bHRzJyk7XG4gIGlmIChvcHRpb25zLmNvZGUgIT09IGVkaXRvci5nZXRUZXh0KCkpIHtcbiAgICAvLyBUaGUgZWRpdG9yIGNvbnRlbnRzIGhhdmUgY2hhbmdlZCBzaW5jZSB0aGUgbGludCB3YXMgcmVxdWVzdGVkLCB0ZWxsXG4gICAgLy8gICBMaW50ZXIgbm90IHRvIHVwZGF0ZSB0aGUgcmVzdWx0c1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFBhcnNpbmcgcmVzdWx0cycpO1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmICghcmVzdWx0cykge1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFBhcnNpbmcgcmVzdWx0cycpO1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBpbnZhbGlkT3B0aW9ucyA9IHJlc3VsdHMuaW52YWxpZE9wdGlvbldhcm5pbmdzLm1hcChtc2cgPT4gKHtcbiAgICB0eXBlOiAnRXJyb3InLFxuICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgIHRleHQ6IG1zZy50ZXh0LFxuICAgIGZpbGVQYXRoXG4gIH0pKTtcblxuICBjb25zdCB3YXJuaW5ncyA9IHJlc3VsdHMud2FybmluZ3MubWFwKCh3YXJuaW5nKSA9PiB7XG4gICAgLy8gU3R5bGVsaW50IG9ubHkgYWxsb3dzICdlcnJvcicgYW5kICd3YXJuaW5nJyBhcyBzZXZlcml0eSB2YWx1ZXNcbiAgICBjb25zdCBzZXZlcml0eSA9ICF3YXJuaW5nLnNldmVyaXR5IHx8IHdhcm5pbmcuc2V2ZXJpdHkgPT09ICdlcnJvcicgPyAnRXJyb3InIDogJ1dhcm5pbmcnO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBzZXZlcml0eSxcbiAgICAgIHNldmVyaXR5OiBzZXZlcml0eS50b0xvd2VyQ2FzZSgpLFxuICAgICAgaHRtbDogZ2VuZXJhdGVIVE1MTWVzc2FnZSh3YXJuaW5nKSxcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgcmFuZ2U6IGNyZWF0ZVJhbmdlKGVkaXRvciwgd2FybmluZylcbiAgICB9O1xuICB9KTtcblxuICBjb25zdCBkZXByZWNhdGlvbnMgPSByZXN1bHRzLmRlcHJlY2F0aW9ucy5tYXAoZGVwcmVjYXRpb24gPT4gKHtcbiAgICB0eXBlOiAnV2FybmluZycsXG4gICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICBodG1sOiBgJHtlc2NhcGVIVE1MKCkoZGVwcmVjYXRpb24udGV4dCl9ICg8YSBocmVmPVwiJHtkZXByZWNhdGlvbi5yZWZlcmVuY2V9XCI+cmVmZXJlbmNlPC9hPilgLFxuICAgIGZpbGVQYXRoXG4gIH0pKTtcblxuICBjb25zdCBpZ25vcmVkID0gW107XG4gIGlmIChzaG93SWdub3JlZCAmJiByZXN1bHRzLmlnbm9yZWQpIHtcbiAgICBpZ25vcmVkLnB1c2goe1xuICAgICAgdHlwZTogJ1dhcm5pbmcnLFxuICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgIHRleHQ6ICdUaGlzIGZpbGUgaXMgaWdub3JlZCcsXG4gICAgICBmaWxlUGF0aFxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgdG9SZXR1cm4gPSBbXVxuICAgIC5jb25jYXQoaW52YWxpZE9wdGlvbnMpXG4gICAgLmNvbmNhdCh3YXJuaW5ncylcbiAgICAuY29uY2F0KGRlcHJlY2F0aW9ucylcbiAgICAuY29uY2F0KGlnbm9yZWQpO1xuXG4gIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFBhcnNpbmcgcmVzdWx0cycpO1xuICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gIHJldHVybiB0b1JldHVybjtcbn07XG5cbmNvbnN0IHJ1blN0eWxlbGludCA9IGFzeW5jIChlZGl0b3IsIG9wdGlvbnMsIGZpbGVQYXRoKSA9PiB7XG4gIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogU3R5bGVsaW50Jyk7XG4gIGxldCBkYXRhO1xuICB0cnkge1xuICAgIGRhdGEgPSBhd2FpdCBzdHlsZWxpbnQoKS5saW50KG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFN0eWxlbGludCcpO1xuICAgIC8vIFdhcyBpdCBhIGNvZGUgcGFyc2luZyBlcnJvcj9cbiAgICBpZiAoZXJyb3IubGluZSkge1xuICAgICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgICAgcmV0dXJuIFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICB0ZXh0OiBlcnJvci5yZWFzb24gfHwgZXJyb3IubWVzc2FnZSxcbiAgICAgICAgZmlsZVBhdGgsXG4gICAgICAgIHJhbmdlOiBjcmVhdGVSYW5nZShlZGl0b3IsIGVycm9yKVxuICAgICAgfV07XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ290IGhlcmUsIHN0eWxlbGludCBmb3VuZCBzb21ldGhpbmcgcmVhbGx5IHdyb25nIHdpdGggdGhlXG4gICAgLy8gY29uZmlndXJhdGlvbiwgc3VjaCBhcyBleHRlbmRpbmcgYW4gaW52YWxpZCBjb25maWd1cmF0aW9uXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdVbmFibGUgdG8gcnVuIHN0eWxlbGludCcsIHtcbiAgICAgIGRldGFpbDogZXJyb3IucmVhc29uIHx8IGVycm9yLm1lc3NhZ2UsXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBTdHlsZWxpbnQnKTtcblxuICBjb25zdCByZXN1bHRzID0gZGF0YS5yZXN1bHRzLnNoaWZ0KCk7XG4gIHJldHVybiBwYXJzZVJlc3VsdHMoZWRpdG9yLCBvcHRpb25zLCByZXN1bHRzLCBmaWxlUGF0aCk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUxpbnRlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnc3R5bGVsaW50JyxcbiAgICBncmFtbWFyU2NvcGVzOiBiYXNlU2NvcGVzLFxuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgbGludE9uRmx5OiB0cnVlLFxuICAgIGxpbnQ6IGFzeW5jIChlZGl0b3IpID0+IHtcbiAgICAgIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgICAgY29uc3Qgc2NvcGVzID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpO1xuXG4gICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICBjb25zdCB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKTtcblxuICAgICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXF1aXJlIHN0eWxlbGludC1jb25maWctc3RhbmRhcmQgaWYgaXQgaGFzbid0IGFscmVhZHkgYmVlbiBsb2FkZWRcbiAgICAgIGlmICghcHJlc2V0Q29uZmlnICYmIHVzZVN0YW5kYXJkKSB7XG4gICAgICAgIHByZXNldENvbmZpZyA9IHJlcXVpcmUoJ3N0eWxlbGludC1jb25maWctc3RhbmRhcmQnKTtcbiAgICAgIH1cbiAgICAgIC8vIFNldHVwIGJhc2UgY29uZmlnIGlmIHVzZVN0YW5kYXJkKCkgaXMgdHJ1ZVxuICAgICAgY29uc3QgZGVmYXVsdENvbmZpZyA9IHtcbiAgICAgICAgcnVsZXM6IHt9XG4gICAgICB9O1xuXG4gICAgICAvLyBCYXNlIHRoZSBjb25maWcgaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5XG4gICAgICBsZXQgW2NvbmZpZ0Jhc2VkaXJdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKTtcbiAgICAgIGlmIChjb25maWdCYXNlZGlyID09PSBudWxsKSB7XG4gICAgICAgIC8vIEZhbGxpbmcgYmFjayB0byB0aGUgZmlsZSBkaXJlY3RvcnkgaWYgbm8gcHJvamVjdCBpcyBmb3VuZFxuICAgICAgICBjb25maWdCYXNlZGlyID0gZGlybmFtZShmaWxlUGF0aCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJ1bGVzID0gdXNlU3RhbmRhcmQgPyBhc3NpZ25EZWVwKCkoe30sIHByZXNldENvbmZpZykgOiBkZWZhdWx0Q29uZmlnO1xuXG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBjb2RlOiB0ZXh0LFxuICAgICAgICBjb2RlRmlsZW5hbWU6IGZpbGVQYXRoLFxuICAgICAgICBjb25maWc6IHJ1bGVzLFxuICAgICAgICBjb25maWdCYXNlZGlyXG4gICAgICB9O1xuXG4gICAgICBpZiAoc2NvcGVzLmluY2x1ZGVzKCdzb3VyY2UuY3NzLnNjc3MnKSB8fCBzY29wZXMuaW5jbHVkZXMoJ3NvdXJjZS5zY3NzJykpIHtcbiAgICAgICAgb3B0aW9ucy5zeW50YXggPSAnc2Nzcyc7XG4gICAgICB9XG4gICAgICBpZiAoc2NvcGVzLmluY2x1ZGVzKCdzb3VyY2UuY3NzLmxlc3MnKSB8fCBzY29wZXMuaW5jbHVkZXMoJ3NvdXJjZS5sZXNzJykpIHtcbiAgICAgICAgb3B0aW9ucy5zeW50YXggPSAnbGVzcyc7XG4gICAgICB9XG4gICAgICBpZiAoc2NvcGVzLmluY2x1ZGVzKCdzb3VyY2UuY3NzLnBvc3Rjc3Muc3VnYXJzcycpKSB7XG4gICAgICAgIG9wdGlvbnMuc3ludGF4ID0gJ3N1Z2Fyc3MnO1xuICAgICAgICAvLyBgc3R5bGVsaW50LWNvbmZpZy1zdGFuZGFyZGAgaXNuJ3QgZnVsbHkgY29tcGF0aWJsZSB3aXRoIFN1Z2FyU1NcbiAgICAgICAgLy8gU2VlIGhlcmUgZm9yIGRldGFpbHM6XG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdHlsZWxpbnQvc3R5bGVsaW50LWNvbmZpZy1zdGFuZGFyZCN1c2luZy10aGUtY29uZmlnLXdpdGgtc3VnYXJzcy1zeW50YXhcbiAgICAgICAgb3B0aW9ucy5jb25maWcucnVsZXNbJ2Jsb2NrLWNsb3NpbmctYnJhY2UtZW1wdHktbGluZS1iZWZvcmUnXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydibG9jay1jbG9zaW5nLWJyYWNlLW5ld2xpbmUtYWZ0ZXInXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydibG9jay1jbG9zaW5nLWJyYWNlLW5ld2xpbmUtYmVmb3JlJ10gPSBudWxsO1xuICAgICAgICBvcHRpb25zLmNvbmZpZy5ydWxlc1snYmxvY2stY2xvc2luZy1icmFjZS1zcGFjZS1iZWZvcmUnXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydibG9jay1vcGVuaW5nLWJyYWNlLW5ld2xpbmUtYWZ0ZXInXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydibG9jay1vcGVuaW5nLWJyYWNlLXNwYWNlLWFmdGVyJ10gPSBudWxsO1xuICAgICAgICBvcHRpb25zLmNvbmZpZy5ydWxlc1snYmxvY2stb3BlbmluZy1icmFjZS1zcGFjZS1iZWZvcmUnXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydkZWNsYXJhdGlvbi1ibG9jay1zZW1pY29sb24tbmV3bGluZS1hZnRlciddID0gbnVsbDtcbiAgICAgICAgb3B0aW9ucy5jb25maWcucnVsZXNbJ2RlY2xhcmF0aW9uLWJsb2NrLXNlbWljb2xvbi1zcGFjZS1hZnRlciddID0gbnVsbDtcbiAgICAgICAgb3B0aW9ucy5jb25maWcucnVsZXNbJ2RlY2xhcmF0aW9uLWJsb2NrLXNlbWljb2xvbi1zcGFjZS1iZWZvcmUnXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydkZWNsYXJhdGlvbi1ibG9jay10cmFpbGluZy1zZW1pY29sb24nXSA9IG51bGw7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnLnJ1bGVzWydkZWNsYXJhdGlvbi1ibG9jay10cmFpbGluZy1zZW1pY29sb24nXSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ3JlYXRlIExpbnRlcicpO1xuICAgICAgY29uc3Qgc3R5bGVsaW50TGludGVyID0gYXdhaXQgc3R5bGVsaW50KCkuY3JlYXRlTGludGVyKCk7XG4gICAgICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBDcmVhdGUgTGludGVyJyk7XG5cbiAgICAgIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ29uZmlnJyk7XG4gICAgICBsZXQgZm91bmRDb25maWc7XG4gICAgICB0cnkge1xuICAgICAgICBmb3VuZENvbmZpZyA9IGF3YWl0IHN0eWxlbGludExpbnRlci5nZXRDb25maWdGb3JGaWxlKGZpbGVQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmICghL05vIGNvbmZpZ3VyYXRpb24gcHJvdmlkZWQgZm9yIC4rLy50ZXN0KGVycm9yLm1lc3NhZ2UpKSB7XG4gICAgICAgICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ29uZmlnJyk7XG4gICAgICAgICAgLy8gSWYgd2UgZ290IGhlcmUsIHN0eWxlbGludCBmYWlsZWQgdG8gcGFyc2UgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAvLyB0aGVyZSdzIG5vIHBvaW50IG9mIHJlLWxpbnRpbmcgaWYgdXNlU3RhbmRhcmQgaXMgdHJ1ZSwgYmVjYXVzZSB0aGVcbiAgICAgICAgICAvLyB1c2VyIGRvZXMgbm90IGhhdmUgdGhlIGNvbXBsZXRlIHNldCBvZiBkZXNpcmVkIHJ1bGVzIHBhcnNlZFxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignVW5hYmxlIHRvIHBhcnNlIHN0eWxlbGludCBjb25maWd1cmF0aW9uJywge1xuICAgICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBDb25maWcnKTtcblxuICAgICAgaWYgKGZvdW5kQ29uZmlnKSB7XG4gICAgICAgIG9wdGlvbnMuY29uZmlnID0gYXNzaWduRGVlcCgpKHJ1bGVzLCBmb3VuZENvbmZpZy5jb25maWcpO1xuICAgICAgICBvcHRpb25zLmNvbmZpZ0Jhc2VkaXIgPSBkaXJuYW1lKGZvdW5kQ29uZmlnLmZpbGVwYXRoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFmb3VuZENvbmZpZyAmJiBkaXNhYmxlV2hlbk5vQ29uZmlnKSB7XG4gICAgICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICBzdGFydE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENoZWNrIGlnbm9yZWQnKTtcbiAgICAgIGxldCBmaWxlSXNJZ25vcmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZmlsZUlzSWdub3JlZCA9IGF3YWl0IHN0eWxlbGludExpbnRlci5pc1BhdGhJZ25vcmVkKGZpbGVQYXRoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcsIGNvbmZpZ3VyYXRpb24gZXJyb3JzIHNob3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYXVnaHQgYW5kIHRocm93biBhYm92ZVxuICAgICAgfVxuICAgICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ2hlY2sgaWdub3JlZCcpO1xuXG4gICAgICBpZiAoZmlsZUlzSWdub3JlZCkge1xuICAgICAgICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gICAgICAgIGlmIChzaG93SWdub3JlZCkge1xuICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgdHlwZTogJ1dhcm5pbmcnLFxuICAgICAgICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgIHRleHQ6ICdUaGlzIGZpbGUgaXMgaWdub3JlZCcsXG4gICAgICAgICAgICBmaWxlUGF0aFxuICAgICAgICAgIH1dO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJ1blN0eWxlbGludChlZGl0b3IsIG9wdGlvbnMsIGZpbGVQYXRoKTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==