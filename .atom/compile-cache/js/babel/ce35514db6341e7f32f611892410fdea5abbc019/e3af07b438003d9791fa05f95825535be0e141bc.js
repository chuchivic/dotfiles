Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.startMeasure = startMeasure;
exports.endMeasure = endMeasure;
exports.createRange = createRange;
exports.getDefaultConfig = getDefaultConfig;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _path = require('path');

var _stylelint = require('stylelint');

var _stylelint2 = _interopRequireDefault(_stylelint);

var _assignDeep = require('assign-deep');

var _assignDeep2 = _interopRequireDefault(_assignDeep);

var _atomLinter = require('atom-linter');

var _stylelintConfigStandard = require('stylelint-config-standard');

var _stylelintConfigStandard2 = _interopRequireDefault(_stylelintConfigStandard);

'use babel';

function startMeasure(baseName) {
  var markName = baseName + '-start';
  // Clear any similar start mark from previous runs
  if (performance.getEntriesByName(markName).length) {
    performance.clearMarks(markName);
  }
  performance.mark(markName);
}

function endMeasure(baseName) {
  if (atom.inDevMode()) {
    performance.mark(baseName + '-end');
    performance.measure(baseName, baseName + '-start', baseName + '-end');
    var duration = Math.round(performance.getEntriesByName(baseName)[0].duration * 10000) / 10000;
    // eslint-disable-next-line no-console
    console.log(baseName + ' took ' + duration + ' ms');
    performance.clearMarks(baseName + '-end');
    performance.clearMeasures(baseName);
  }
  performance.clearMarks(baseName + '-start');
}

function createRange(editor, data) {
  if (!data || !Object.hasOwnProperty.call(data, 'line') && !Object.hasOwnProperty.call(data, 'column')) {
    // data.line & data.column might be undefined for non-fatal invalid rules,
    // e.g.: "block-no-empty": "foo"
    // Return a range encompassing the first line of the file
    return (0, _atomLinter.generateRange)(editor);
  }

  return (0, _atomLinter.generateRange)(editor, data.line - 1, data.column - 1);
}

var parseResults = function parseResults(editor, results, filePath, showIgnored) {
  startMeasure('linter-stylelint: Parsing results');
  if (!results) {
    endMeasure('linter-stylelint: Parsing results');
    endMeasure('linter-stylelint: Lint');
    return [];
  }

  var invalidOptions = results.invalidOptionWarnings.map(function (msg) {
    return {
      severity: 'error',
      excerpt: msg.text,
      location: {
        file: filePath,
        position: createRange(editor)
      }
    };
  });

  var warnings = results.warnings.map(function (warning) {
    // Stylelint only allows 'error' and 'warning' as severity values
    var severity = !warning.severity || warning.severity === 'error' ? 'Error' : 'Warning';
    var message = {
      severity: severity.toLowerCase(),
      excerpt: warning.text,
      location: {
        file: filePath,
        position: createRange(editor, warning)
      }
    };

    var ruleParts = warning.rule.split('/');
    if (ruleParts.length === 1) {
      // Core rule
      message.url = 'http://stylelint.io/user-guide/rules/' + ruleParts[0];
    } else {
      // Plugin rule
      var pluginName = ruleParts[0];
      // const ruleName = ruleParts[1];

      var linterStylelintURL = 'https://github.com/AtomLinter/linter-stylelint/tree/master/docs';
      switch (pluginName) {
        case 'plugin':
          message.url = linterStylelintURL + '/noRuleNamespace.md';
          break;
        default:
          message.url = linterStylelintURL + '/linkingNewRule.md';
      }
    }

    return message;
  });

  var deprecations = results.deprecations.map(function (deprecation) {
    return {
      severity: 'warning',
      excerpt: deprecation.text,
      url: deprecation.reference,
      location: {
        file: filePath,
        position: createRange(editor)
      }
    };
  });

  var ignored = [];
  if (showIgnored && results.ignored) {
    ignored.push({
      severity: 'warning',
      excerpt: 'This file is ignored',
      location: {
        file: filePath,
        position: createRange(editor)
      }
    });
  }

  var toReturn = [].concat(invalidOptions).concat(warnings).concat(deprecations).concat(ignored);

  endMeasure('linter-stylelint: Parsing results');
  endMeasure('linter-stylelint: Lint');
  return toReturn;
};

var runStylelint = _asyncToGenerator(function* (editor, stylelintOptions, filePath, settings) {
  startMeasure('linter-stylelint: Stylelint');
  var data = undefined;
  try {
    data = yield _stylelint2['default'].lint(stylelintOptions);
  } catch (error) {
    endMeasure('linter-stylelint: Stylelint');
    // Was it a code parsing error?
    if (error.line) {
      endMeasure('linter-stylelint: Lint');
      return [{
        severity: 'error',
        excerpt: error.reason || error.message,
        location: {
          file: filePath,
          position: createRange(editor, error)
        }
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

  if (stylelintOptions.code !== editor.getText()) {
    // The editor contents have changed since the lint was requested, tell
    //   Linter not to update the results
    endMeasure('linter-stylelint: Lint');
    return null;
  }
  return parseResults(editor, results, filePath, settings.showIgnored);
});

exports.runStylelint = runStylelint;

function getDefaultConfig(syntax, filePath) {
  var defaultConfig = (0, _assignDeep2['default'])({}, _stylelintConfigStandard2['default']);

  if (syntax === 'sugarss') {
    // `stylelint-config-standard` isn't fully compatible with SugarSS
    // See here for details:
    // https://github.com/stylelint/stylelint-config-standard#using-the-config-with-sugarss-syntax
    defaultConfig.rules['block-closing-brace-empty-line-before'] = null;
    defaultConfig.rules['block-closing-brace-newline-after'] = null;
    defaultConfig.rules['block-closing-brace-newline-before'] = null;
    defaultConfig.rules['block-closing-brace-space-before'] = null;
    defaultConfig.rules['block-opening-brace-newline-after'] = null;
    defaultConfig.rules['block-opening-brace-space-after'] = null;
    defaultConfig.rules['block-opening-brace-space-before'] = null;
    defaultConfig.rules['declaration-block-semicolon-newline-after'] = null;
    defaultConfig.rules['declaration-block-semicolon-space-after'] = null;
    defaultConfig.rules['declaration-block-semicolon-space-before'] = null;
    defaultConfig.rules['declaration-block-trailing-semicolon'] = null;
  }

  // Base the config in the project directory

  var _atom$project$relativizePath = atom.project.relativizePath(filePath);

  var _atom$project$relativizePath2 = _slicedToArray(_atom$project$relativizePath, 1);

  var configBasedir = _atom$project$relativizePath2[0];

  if (configBasedir === null) {
    // Falling back to the file directory if no project is found
    configBasedir = (0, _path.dirname)(filePath);
  }
  defaultConfig.configBasedir = configBasedir;

  return defaultConfig;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbGliL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O29CQUV3QixNQUFNOzt5QkFDUixXQUFXOzs7OzBCQUNWLGFBQWE7Ozs7MEJBQ04sYUFBYTs7dUNBQ2xCLDJCQUEyQjs7OztBQU5wRCxXQUFXLENBQUM7O0FBUUwsU0FBUyxZQUFZLENBQUMsUUFBUSxFQUFFO0FBQ3JDLE1BQU0sUUFBUSxHQUFNLFFBQVEsV0FBUSxDQUFDOztBQUVyQyxNQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDakQsZUFBVyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNsQztBQUNELGFBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDNUI7O0FBRU0sU0FBUyxVQUFVLENBQUMsUUFBUSxFQUFFO0FBQ25DLE1BQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ3BCLGVBQVcsQ0FBQyxJQUFJLENBQUksUUFBUSxVQUFPLENBQUM7QUFDcEMsZUFBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUssUUFBUSxhQUFhLFFBQVEsVUFBTyxDQUFDO0FBQ3RFLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRWhHLFdBQU8sQ0FBQyxHQUFHLENBQUksUUFBUSxjQUFTLFFBQVEsU0FBTSxDQUFDO0FBQy9DLGVBQVcsQ0FBQyxVQUFVLENBQUksUUFBUSxVQUFPLENBQUM7QUFDMUMsZUFBVyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNyQztBQUNELGFBQVcsQ0FBQyxVQUFVLENBQUksUUFBUSxZQUFT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LENBQUM7QUFDakUsaUJBQWEsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDL0QsaUJBQWEsQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDaEUsaUJBQWEsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDOUQsaUJBQWEsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDL0QsaUJBQWEsQ0FBQyxLQUFLLENBQUMsMkNBQTJDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDeEUsaUJBQWEsQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDdEUsaUJBQWEsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDdkUsaUJBQWEsQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsR0FBRyxJQUFJLENBQUM7R0FDcEU7Ozs7cUNBR3FCLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQzs7OztNQUF0RCxhQUFhOztBQUNsQixNQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7O0FBRTFCLGlCQUFhLEdBQUcsbUJBQVEsUUFBUSxDQUFDLENBQUM7R0FDbkM7QUFDRCxlQUFhLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQzs7QUFFNUMsU0FBTyxhQUFhLENBQUM7Q0FDdEIiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXN0eWxlbGludC9saWIvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBkaXJuYW1lIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgc3R5bGVsaW50IGZyb20gJ3N0eWxlbGludCc7XG5pbXBvcnQgYXNzaWduRGVlcCBmcm9tICdhc3NpZ24tZGVlcCc7XG5pbXBvcnQgeyBnZW5lcmF0ZVJhbmdlIH0gZnJvbSAnYXRvbS1saW50ZXInO1xuaW1wb3J0IHByZXNldENvbmZpZyBmcm9tICdzdHlsZWxpbnQtY29uZmlnLXN0YW5kYXJkJztcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0TWVhc3VyZShiYXNlTmFtZSkge1xuICBjb25zdCBtYXJrTmFtZSA9IGAke2Jhc2VOYW1lfS1zdGFydGA7XG4gIC8vIENsZWFyIGFueSBzaW1pbGFyIHN0YXJ0IG1hcmsgZnJvbSBwcmV2aW91cyBydW5zXG4gIGlmIChwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKG1hcmtOYW1lKS5sZW5ndGgpIHtcbiAgICBwZXJmb3JtYW5jZS5jbGVhck1hcmtzKG1hcmtOYW1lKTtcbiAgfVxuICBwZXJmb3JtYW5jZS5tYXJrKG1hcmtOYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZE1lYXN1cmUoYmFzZU5hbWUpIHtcbiAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICBwZXJmb3JtYW5jZS5tYXJrKGAke2Jhc2VOYW1lfS1lbmRgKTtcbiAgICBwZXJmb3JtYW5jZS5tZWFzdXJlKGJhc2VOYW1lLCBgJHtiYXNlTmFtZX0tc3RhcnRgLCBgJHtiYXNlTmFtZX0tZW5kYCk7XG4gICAgY29uc3QgZHVyYXRpb24gPSBNYXRoLnJvdW5kKHBlcmZvcm1hbmNlLmdldEVudHJpZXNCeU5hbWUoYmFzZU5hbWUpWzBdLmR1cmF0aW9uICogMTAwMDApIC8gMTAwMDA7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhgJHtiYXNlTmFtZX0gdG9vayAke2R1cmF0aW9ufSBtc2ApO1xuICAgIHBlcmZvcm1hbmNlLmNsZWFyTWFya3MoYCR7YmFzZU5hbWV9LWVuZGApO1xuICAgIHBlcmZvcm1hbmNlLmNsZWFyTWVhc3VyZXMoYmFzZU5hbWUpO1xuICB9XG4gIHBlcmZvcm1hbmNlLmNsZWFyTWFya3MoYCR7YmFzZU5hbWV9LXN0YXJ0YCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSYW5nZShlZGl0b3IsIGRhdGEpIHtcbiAgaWYgKCFkYXRhIHx8XG4gICAgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCAnbGluZScpICYmICFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCAnY29sdW1uJykpXG4gICkge1xuICAgIC8vIGRhdGEubGluZSAmIGRhdGEuY29sdW1uIG1pZ2h0IGJlIHVuZGVmaW5lZCBmb3Igbm9uLWZhdGFsIGludmFsaWQgcnVsZXMsXG4gICAgLy8gZS5nLjogXCJibG9jay1uby1lbXB0eVwiOiBcImZvb1wiXG4gICAgLy8gUmV0dXJuIGEgcmFuZ2UgZW5jb21wYXNzaW5nIHRoZSBmaXJzdCBsaW5lIG9mIHRoZSBmaWxlXG4gICAgcmV0dXJuIGdlbmVyYXRlUmFuZ2UoZWRpdG9yKTtcbiAgfVxuXG4gIHJldHVybiBnZW5lcmF0ZVJhbmdlKGVkaXRvciwgZGF0YS5saW5lIC0gMSwgZGF0YS5jb2x1bW4gLSAxKTtcbn1cblxuY29uc3QgcGFyc2VSZXN1bHRzID0gKGVkaXRvciwgcmVzdWx0cywgZmlsZVBhdGgsIHNob3dJZ25vcmVkKSA9PiB7XG4gIHN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogUGFyc2luZyByZXN1bHRzJyk7XG4gIGlmICghcmVzdWx0cykge1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFBhcnNpbmcgcmVzdWx0cycpO1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb25zdCBpbnZhbGlkT3B0aW9ucyA9IHJlc3VsdHMuaW52YWxpZE9wdGlvbldhcm5pbmdzLm1hcChtc2cgPT4gKHtcbiAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICBleGNlcnB0OiBtc2cudGV4dCxcbiAgICBsb2NhdGlvbjoge1xuICAgICAgZmlsZTogZmlsZVBhdGgsXG4gICAgICBwb3NpdGlvbjogY3JlYXRlUmFuZ2UoZWRpdG9yKVxuICAgIH1cbiAgfSkpO1xuXG4gIGNvbnN0IHdhcm5pbmdzID0gcmVzdWx0cy53YXJuaW5ncy5tYXAoKHdhcm5pbmcpID0+IHtcbiAgICAvLyBTdHlsZWxpbnQgb25seSBhbGxvd3MgJ2Vycm9yJyBhbmQgJ3dhcm5pbmcnIGFzIHNldmVyaXR5IHZhbHVlc1xuICAgIGNvbnN0IHNldmVyaXR5ID0gIXdhcm5pbmcuc2V2ZXJpdHkgfHwgd2FybmluZy5zZXZlcml0eSA9PT0gJ2Vycm9yJyA/ICdFcnJvcicgOiAnV2FybmluZyc7XG4gICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgIHNldmVyaXR5OiBzZXZlcml0eS50b0xvd2VyQ2FzZSgpLFxuICAgICAgZXhjZXJwdDogd2FybmluZy50ZXh0LFxuICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgZmlsZTogZmlsZVBhdGgsXG4gICAgICAgIHBvc2l0aW9uOiBjcmVhdGVSYW5nZShlZGl0b3IsIHdhcm5pbmcpXG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHJ1bGVQYXJ0cyA9IHdhcm5pbmcucnVsZS5zcGxpdCgnLycpO1xuICAgIGlmIChydWxlUGFydHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAvLyBDb3JlIHJ1bGVcbiAgICAgIG1lc3NhZ2UudXJsID0gYGh0dHA6Ly9zdHlsZWxpbnQuaW8vdXNlci1ndWlkZS9ydWxlcy8ke3J1bGVQYXJ0c1swXX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQbHVnaW4gcnVsZVxuICAgICAgY29uc3QgcGx1Z2luTmFtZSA9IHJ1bGVQYXJ0c1swXTtcbiAgICAgIC8vIGNvbnN0IHJ1bGVOYW1lID0gcnVsZVBhcnRzWzFdO1xuXG4gICAgICBjb25zdCBsaW50ZXJTdHlsZWxpbnRVUkwgPSAnaHR0cHM6Ly9naXRodWIuY29tL0F0b21MaW50ZXIvbGludGVyLXN0eWxlbGludC90cmVlL21hc3Rlci9kb2NzJztcbiAgICAgIHN3aXRjaCAocGx1Z2luTmFtZSkge1xuICAgICAgICBjYXNlICdwbHVnaW4nOlxuICAgICAgICAgIG1lc3NhZ2UudXJsID0gYCR7bGludGVyU3R5bGVsaW50VVJMfS9ub1J1bGVOYW1lc3BhY2UubWRgO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG1lc3NhZ2UudXJsID0gYCR7bGludGVyU3R5bGVsaW50VVJMfS9saW5raW5nTmV3UnVsZS5tZGA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH0pO1xuXG4gIGNvbnN0IGRlcHJlY2F0aW9ucyA9IHJlc3VsdHMuZGVwcmVjYXRpb25zLm1hcChkZXByZWNhdGlvbiA9PiAoe1xuICAgIHNldmVyaXR5OiAnd2FybmluZycsXG4gICAgZXhjZXJwdDogZGVwcmVjYXRpb24udGV4dCxcbiAgICB1cmw6IGRlcHJlY2F0aW9uLnJlZmVyZW5jZSxcbiAgICBsb2NhdGlvbjoge1xuICAgICAgZmlsZTogZmlsZVBhdGgsXG4gICAgICBwb3NpdGlvbjogY3JlYXRlUmFuZ2UoZWRpdG9yKVxuICAgIH1cbiAgfSkpO1xuXG4gIGNvbnN0IGlnbm9yZWQgPSBbXTtcbiAgaWYgKHNob3dJZ25vcmVkICYmIHJlc3VsdHMuaWdub3JlZCkge1xuICAgIGlnbm9yZWQucHVzaCh7XG4gICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgZXhjZXJwdDogJ1RoaXMgZmlsZSBpcyBpZ25vcmVkJyxcbiAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgICBwb3NpdGlvbjogY3JlYXRlUmFuZ2UoZWRpdG9yKVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgdG9SZXR1cm4gPSBbXVxuICAgIC5jb25jYXQoaW52YWxpZE9wdGlvbnMpXG4gICAgLmNvbmNhdCh3YXJuaW5ncylcbiAgICAuY29uY2F0KGRlcHJlY2F0aW9ucylcbiAgICAuY29uY2F0KGlnbm9yZWQpO1xuXG4gIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFBhcnNpbmcgcmVzdWx0cycpO1xuICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gIHJldHVybiB0b1JldHVybjtcbn07XG5cbmV4cG9ydCBjb25zdCBydW5TdHlsZWxpbnQgPSBhc3luYyAoZWRpdG9yLCBzdHlsZWxpbnRPcHRpb25zLCBmaWxlUGF0aCwgc2V0dGluZ3MpID0+IHtcbiAgc3RhcnRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBTdHlsZWxpbnQnKTtcbiAgbGV0IGRhdGE7XG4gIHRyeSB7XG4gICAgZGF0YSA9IGF3YWl0IHN0eWxlbGludC5saW50KHN0eWxlbGludE9wdGlvbnMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IFN0eWxlbGludCcpO1xuICAgIC8vIFdhcyBpdCBhIGNvZGUgcGFyc2luZyBlcnJvcj9cbiAgICBpZiAoZXJyb3IubGluZSkge1xuICAgICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgICAgcmV0dXJuIFt7XG4gICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICBleGNlcnB0OiBlcnJvci5yZWFzb24gfHwgZXJyb3IubWVzc2FnZSxcbiAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICBwb3NpdGlvbjogY3JlYXRlUmFuZ2UoZWRpdG9yLCBlcnJvcilcbiAgICAgICAgfVxuICAgICAgfV07XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ290IGhlcmUsIHN0eWxlbGludCBmb3VuZCBzb21ldGhpbmcgcmVhbGx5IHdyb25nIHdpdGggdGhlXG4gICAgLy8gY29uZmlndXJhdGlvbiwgc3VjaCBhcyBleHRlbmRpbmcgYW4gaW52YWxpZCBjb25maWd1cmF0aW9uXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdVbmFibGUgdG8gcnVuIHN0eWxlbGludCcsIHtcbiAgICAgIGRldGFpbDogZXJyb3IucmVhc29uIHx8IGVycm9yLm1lc3NhZ2UsXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBlbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBTdHlsZWxpbnQnKTtcblxuICBjb25zdCByZXN1bHRzID0gZGF0YS5yZXN1bHRzLnNoaWZ0KCk7XG5cbiAgaWYgKHN0eWxlbGludE9wdGlvbnMuY29kZSAhPT0gZWRpdG9yLmdldFRleHQoKSkge1xuICAgIC8vIFRoZSBlZGl0b3IgY29udGVudHMgaGF2ZSBjaGFuZ2VkIHNpbmNlIHRoZSBsaW50IHdhcyByZXF1ZXN0ZWQsIHRlbGxcbiAgICAvLyAgIExpbnRlciBub3QgdG8gdXBkYXRlIHRoZSByZXN1bHRzXG4gICAgZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBwYXJzZVJlc3VsdHMoZWRpdG9yLCByZXN1bHRzLCBmaWxlUGF0aCwgc2V0dGluZ3Muc2hvd0lnbm9yZWQpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRDb25maWcoc3ludGF4LCBmaWxlUGF0aCkge1xuICBjb25zdCBkZWZhdWx0Q29uZmlnID0gYXNzaWduRGVlcCh7fSwgcHJlc2V0Q29uZmlnKTtcblxuICBpZiAoc3ludGF4ID09PSAnc3VnYXJzcycpIHtcbiAgICAvLyBgc3R5bGVsaW50LWNvbmZpZy1zdGFuZGFyZGAgaXNuJ3QgZnVsbHkgY29tcGF0aWJsZSB3aXRoIFN1Z2FyU1NcbiAgICAvLyBTZWUgaGVyZSBmb3IgZGV0YWlsczpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vc3R5bGVsaW50L3N0eWxlbGludC1jb25maWctc3RhbmRhcmQjdXNpbmctdGhlLWNvbmZpZy13aXRoLXN1Z2Fyc3Mtc3ludGF4XG4gICAgZGVmYXVsdENvbmZpZy5ydWxlc1snYmxvY2stY2xvc2luZy1icmFjZS1lbXB0eS1saW5lLWJlZm9yZSddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydibG9jay1jbG9zaW5nLWJyYWNlLW5ld2xpbmUtYWZ0ZXInXSA9IG51bGw7XG4gICAgZGVmYXVsdENvbmZpZy5ydWxlc1snYmxvY2stY2xvc2luZy1icmFjZS1uZXdsaW5lLWJlZm9yZSddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydibG9jay1jbG9zaW5nLWJyYWNlLXNwYWNlLWJlZm9yZSddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydibG9jay1vcGVuaW5nLWJyYWNlLW5ld2xpbmUtYWZ0ZXInXSA9IG51bGw7XG4gICAgZGVmYXVsdENvbmZpZy5ydWxlc1snYmxvY2stb3BlbmluZy1icmFjZS1zcGFjZS1hZnRlciddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydibG9jay1vcGVuaW5nLWJyYWNlLXNwYWNlLWJlZm9yZSddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydkZWNsYXJhdGlvbi1ibG9jay1zZW1pY29sb24tbmV3bGluZS1hZnRlciddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydkZWNsYXJhdGlvbi1ibG9jay1zZW1pY29sb24tc3BhY2UtYWZ0ZXInXSA9IG51bGw7XG4gICAgZGVmYXVsdENvbmZpZy5ydWxlc1snZGVjbGFyYXRpb24tYmxvY2stc2VtaWNvbG9uLXNwYWNlLWJlZm9yZSddID0gbnVsbDtcbiAgICBkZWZhdWx0Q29uZmlnLnJ1bGVzWydkZWNsYXJhdGlvbi1ibG9jay10cmFpbGluZy1zZW1pY29sb24nXSA9IG51bGw7XG4gIH1cblxuICAvLyBCYXNlIHRoZSBjb25maWcgaW4gdGhlIHByb2plY3QgZGlyZWN0b3J5XG4gIGxldCBbY29uZmlnQmFzZWRpcl0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpO1xuICBpZiAoY29uZmlnQmFzZWRpciA9PT0gbnVsbCkge1xuICAgIC8vIEZhbGxpbmcgYmFjayB0byB0aGUgZmlsZSBkaXJlY3RvcnkgaWYgbm8gcHJvamVjdCBpcyBmb3VuZFxuICAgIGNvbmZpZ0Jhc2VkaXIgPSBkaXJuYW1lKGZpbGVQYXRoKTtcbiAgfVxuICBkZWZhdWx0Q29uZmlnLmNvbmZpZ0Jhc2VkaXIgPSBjb25maWdCYXNlZGlyO1xuXG4gIHJldHVybiBkZWZhdWx0Q29uZmlnO1xufVxuIl19