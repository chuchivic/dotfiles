Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies

var _atom = require('atom');

// Dependencies
'use babel';var helpers = undefined;
var dirname = undefined;
var stylelint = undefined;

function loadDeps() {
  if (!helpers) {
    helpers = require('./helpers');
  }
  if (!dirname) {
    dirname = require('path').dirname;
  }
  if (!stylelint) {
    stylelint = require('stylelint');
  }
}

exports['default'] = {
  activate: function activate() {
    var _this = this;

    this.idleCallbacks = new Set();
    var depsCallbackID = undefined;
    var installLinterStylelintDeps = function installLinterStylelintDeps() {
      _this.idleCallbacks['delete'](depsCallbackID);
      if (!atom.inSpecMode()) {
        require('atom-package-deps').install('linter-stylelint');
      }
      loadDeps();
    };
    depsCallbackID = window.requestIdleCallback(installLinterStylelintDeps);
    this.idleCallbacks.add(depsCallbackID);

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.config.observe('linter-stylelint.disableWhenNoConfig', function (value) {
      _this.disableWhenNoConfig = value;
      if (_this.useStandard && _this.disableWhenNoConfig) {
        // Disable using the standard if it is desired to stop linting with
        // no configuration
        atom.config.set('linter-stylelint.useStandard', false);
      }
    }), atom.config.observe('linter-stylelint.useStandard', function (value) {
      _this.useStandard = value;
      if (_this.useStandard && _this.disableWhenNoConfig) {
        // Disable disabling linting when there is no configuration as the
        // standard configuration will always be available.
        atom.config.set('linter-stylelint.disableWhenNoConfig', false);
      }
    }), atom.config.observe('linter-stylelint.showIgnored', function (value) {
      _this.showIgnored = value;
    }), atom.config.observe('core.excludeVcsIgnoredPaths', function (value) {
      _this.coreIgnored = value;
    }));

    this.baseScopes = ['source.css', 'source.scss', 'source.css.scss', 'source.less', 'source.css.less', 'source.css.postcss', 'source.css.postcss.sugarss'];
  },

  deactivate: function deactivate() {
    this.idleCallbacks.forEach(function (callbackID) {
      return window.cancelIdleCallback(callbackID);
    });
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter: function provideLinter() {
    var _this2 = this;

    return {
      name: 'stylelint',
      grammarScopes: this.baseScopes,
      scope: 'file',
      lintsOnChange: true,
      lint: _asyncToGenerator(function* (editor) {
        // Force the dependencies to load if they haven't already
        loadDeps();

        helpers.startMeasure('linter-stylelint: Lint');

        var filePath = editor.getPath();
        var text = editor.getText();

        if (!text) {
          helpers.endMeasure('linter-stylelint: Lint');
          return [];
        }

        var options = {
          code: text,
          codeFilename: filePath
        };

        var scopes = editor.getLastCursor().getScopeDescriptor().getScopesArray();
        if (scopes.includes('source.css.scss') || scopes.includes('source.scss')) {
          options.syntax = 'scss';
        } else if (scopes.includes('source.css.less') || scopes.includes('source.less')) {
          options.syntax = 'less';
        } else if (scopes.includes('source.css.postcss.sugarss')) {
          options.syntax = 'sugarss';
        }

        if (_this2.coreIgnored) {
          // When Atom (and thus Linter) is set to allow ignored files, tell
          // Stylelint to do the same.
          options.disableDefaultIgnores = true;
        }

        helpers.startMeasure('linter-stylelint: Create Linter');
        var stylelintLinter = yield stylelint.createLinter();
        helpers.endMeasure('linter-stylelint: Create Linter');

        helpers.startMeasure('linter-stylelint: Config');
        var foundConfig = undefined;
        try {
          foundConfig = yield stylelintLinter.getConfigForFile(filePath);
        } catch (error) {
          if (!/No configuration provided for .+/.test(error.message)) {
            helpers.endMeasure('linter-stylelint: Config');
            // If we got here, stylelint failed to parse the configuration
            // there's no point of re-linting if useStandard is true, because the
            // user does not have the complete set of desired rules parsed
            atom.notifications.addError('Unable to parse stylelint configuration', {
              detail: error.message,
              dismissable: true
            });
            helpers.endMeasure('linter-stylelint: Lint');
            return [];
          }
        }
        helpers.endMeasure('linter-stylelint: Config');

        if (foundConfig) {
          // We have a configuration from Stylelint
          options.config = foundConfig.config;
          options.configBasedir = dirname(foundConfig.filepath);
        } else if (_this2.disableWhenNoConfig) {
          // No configuration, and linting without one is disabled
          helpers.endMeasure('linter-stylelint: Lint');
          return [];
        } else if (_this2.useStandard) {
          // No configuration, but using the standard is enabled
          var defaultConfig = helpers.getDefaultConfig(options.syntax);
          options.config = { rules: defaultConfig.rules };
          if (defaultConfig['extends']) {
            options.config['extends'] = defaultConfig['extends'];
          }
          options.configBasedir = defaultConfig.configBasedir;
        }

        helpers.startMeasure('linter-stylelint: Check ignored');
        var fileIsIgnored = undefined;
        try {
          fileIsIgnored = yield stylelintLinter.isPathIgnored(filePath);
        } catch (error) {
          // Do nothing, configuration errors should have already been caught and thrown above
        }
        helpers.endMeasure('linter-stylelint: Check ignored');

        if (fileIsIgnored) {
          helpers.endMeasure('linter-stylelint: Lint');
          if (_this2.showIgnored) {
            return [{
              severity: 'warning',
              excerpt: 'This file is ignored',
              location: {
                file: filePath,
                position: helpers.createRange(editor)
              }
            }];
          }
          return [];
        }
        var settings = {
          showIgnored: _this2.showIgnored
        };

        return helpers.runStylelint(editor, options, filePath, settings);
      })
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUdvQyxNQUFNOzs7QUFIMUMsV0FBVyxDQUFDLEFBTVosSUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLElBQUksT0FBTyxZQUFBLENBQUM7QUFDWixJQUFJLFNBQVMsWUFBQSxDQUFDOztBQUVkLFNBQVMsUUFBUSxHQUFHO0FBQ2xCLE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixXQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ2hDO0FBQ0QsTUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLFdBQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDO0dBQ25DO0FBQ0QsTUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLGFBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDbEM7Q0FDRjs7cUJBRWM7QUFDYixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLGNBQWMsWUFBQSxDQUFDO0FBQ25CLFFBQU0sMEJBQTBCLEdBQUcsU0FBN0IsMEJBQTBCLEdBQVM7QUFDdkMsWUFBSyxhQUFhLFVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO09BQzFEO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0FBQ0Ysa0JBQWMsR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN4RSxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFF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RUFBRSxRQUFRO0FBQ2Qsd0JBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztlQUN0QzthQUNGLENBQUMsQ0FBQztXQUNKO0FBQ0QsaUJBQU8sRUFBRSxDQUFDO1NBQ1g7QUFDRCxZQUFNLFFBQVEsR0FBRztBQUNmLHFCQUFXLEVBQUUsT0FBSyxXQUFXO1NBQzlCLENBQUM7O0FBRUYsZUFBTyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ2xFLENBQUE7S0FDRixDQUFDO0dBQ0g7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG4vLyBEZXBlbmRlbmNpZXNcbmxldCBoZWxwZXJzO1xubGV0IGRpcm5hbWU7XG5sZXQgc3R5bGVsaW50O1xuXG5mdW5jdGlvbiBsb2FkRGVwcygpIHtcbiAgaWYgKCFoZWxwZXJzKSB7XG4gICAgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuICB9XG4gIGlmICghZGlybmFtZSkge1xuICAgIGRpcm5hbWUgPSByZXF1aXJlKCdwYXRoJykuZGlybmFtZTtcbiAgfVxuICBpZiAoIXN0eWxlbGludCkge1xuICAgIHN0eWxlbGludCA9IHJlcXVpcmUoJ3N0eWxlbGludCcpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzID0gbmV3IFNldCgpO1xuICAgIGxldCBkZXBzQ2FsbGJhY2tJRDtcbiAgICBjb25zdCBpbnN0YWxsTGludGVyU3R5bGVsaW50RGVwcyA9ICgpID0+IHtcbiAgICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5kZWxldGUoZGVwc0NhbGxiYWNrSUQpO1xuICAgICAgaWYgKCFhdG9tLmluU3BlY01vZGUoKSkge1xuICAgICAgICByZXF1aXJlKCdhdG9tLXBhY2thZ2UtZGVwcycpLmluc3RhbGwoJ2xpbnRlci1zdHlsZWxpbnQnKTtcbiAgICAgIH1cbiAgICAgIGxvYWREZXBzKCk7XG4gICAgfTtcbiAgICBkZXBzQ2FsbGJhY2tJRCA9IHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrKGluc3RhbGxMaW50ZXJTdHlsZWxpbnREZXBzKTtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuYWRkKGRlcHNDYWxsYmFja0lEKTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1zdHlsZWxpbnQuZGlzYWJsZVdoZW5Ob0NvbmZpZycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmRpc2FibGVXaGVuTm9Db25maWcgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudXNlU3RhbmRhcmQgJiYgdGhpcy5kaXNhYmxlV2hlbk5vQ29uZmlnKSB7XG4gICAgICAgICAgLy8gRGlzYWJsZSB1c2luZyB0aGUgc3RhbmRhcmQgaWYgaXQgaXMgZGVzaXJlZCB0byBzdG9wIGxpbnRpbmcgd2l0aFxuICAgICAgICAgIC8vIG5vIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci1zdHlsZWxpbnQudXNlU3RhbmRhcmQnLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXN0eWxlbGludC51c2VTdGFuZGFyZCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnVzZVN0YW5kYXJkID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLnVzZVN0YW5kYXJkICYmIHRoaXMuZGlzYWJsZVdoZW5Ob0NvbmZpZykge1xuICAgICAgICAgIC8vIERpc2FibGUgZGlzYWJsaW5nIGxpbnRpbmcgd2hlbiB0aGVyZSBpcyBubyBjb25maWd1cmF0aW9uIGFzIHRoZVxuICAgICAgICAgIC8vIHN0YW5kYXJkIGNvbmZpZ3VyYXRpb24gd2lsbCBhbHdheXMgYmUgYXZhaWxhYmxlLlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXN0eWxlbGludC5kaXNhYmxlV2hlbk5vQ29uZmlnJywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci1zdHlsZWxpbnQuc2hvd0lnbm9yZWQnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5zaG93SWdub3JlZCA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnLCAodmFsdWUpID0+IHtcbiAgICAgICAgdGhpcy5jb3JlSWdub3JlZCA9IHZhbHVlO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIHRoaXMuYmFzZVNjb3BlcyA9IFtcbiAgICAgICdzb3VyY2UuY3NzJyxcbiAgICAgICdzb3VyY2Uuc2NzcycsXG4gICAgICAnc291cmNlLmNzcy5zY3NzJyxcbiAgICAgICdzb3VyY2UubGVzcycsXG4gICAgICAnc291cmNlLmNzcy5sZXNzJyxcbiAgICAgICdzb3VyY2UuY3NzLnBvc3Rjc3MnLFxuICAgICAgJ3NvdXJjZS5jc3MucG9zdGNzcy5zdWdhcnNzJ1xuICAgIF07XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MuZm9yRWFjaChjYWxsYmFja0lEID0+IHdpbmRvdy5jYW5jZWxJZGxlQ2FsbGJhY2soY2FsbGJhY2tJRCkpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5jbGVhcigpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgcHJvdmlkZUxpbnRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ3N0eWxlbGludCcsXG4gICAgICBncmFtbWFyU2NvcGVzOiB0aGlzLmJhc2VTY29wZXMsXG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgbGludHNPbkNoYW5nZTogdHJ1ZSxcbiAgICAgIGxpbnQ6IGFzeW5jIChlZGl0b3IpID0+IHtcbiAgICAgICAgLy8gRm9yY2UgdGhlIGRlcGVuZGVuY2llcyB0byBsb2FkIGlmIHRoZXkgaGF2ZW4ndCBhbHJlYWR5XG4gICAgICAgIGxvYWREZXBzKCk7XG5cbiAgICAgICAgaGVscGVycy5zdGFydE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcblxuICAgICAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuXG4gICAgICAgIGlmICghdGV4dCkge1xuICAgICAgICAgIGhlbHBlcnMuZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgY29kZTogdGV4dCxcbiAgICAgICAgICBjb2RlRmlsZW5hbWU6IGZpbGVQYXRoXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qgc2NvcGVzID0gZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpO1xuICAgICAgICBpZiAoc2NvcGVzLmluY2x1ZGVzKCdzb3VyY2UuY3NzLnNjc3MnKSB8fCBzY29wZXMuaW5jbHVkZXMoJ3NvdXJjZS5zY3NzJykpIHtcbiAgICAgICAgICBvcHRpb25zLnN5bnRheCA9ICdzY3NzJztcbiAgICAgICAgfSBlbHNlIGlmIChzY29wZXMuaW5jbHVkZXMoJ3NvdXJjZS5jc3MubGVzcycpIHx8IHNjb3Blcy5pbmNsdWRlcygnc291cmNlLmxlc3MnKSkge1xuICAgICAgICAgIG9wdGlvbnMuc3ludGF4ID0gJ2xlc3MnO1xuICAgICAgICB9IGVsc2UgaWYgKHNjb3Blcy5pbmNsdWRlcygnc291cmNlLmNzcy5wb3N0Y3NzLnN1Z2Fyc3MnKSkge1xuICAgICAgICAgIG9wdGlvbnMuc3ludGF4ID0gJ3N1Z2Fyc3MnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY29yZUlnbm9yZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIEF0b20gKGFuZCB0aHVzIExpbnRlcikgaXMgc2V0IHRvIGFsbG93IGlnbm9yZWQgZmlsZXMsIHRlbGxcbiAgICAgICAgICAvLyBTdHlsZWxpbnQgdG8gZG8gdGhlIHNhbWUuXG4gICAgICAgICAgb3B0aW9ucy5kaXNhYmxlRGVmYXVsdElnbm9yZXMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVscGVycy5zdGFydE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENyZWF0ZSBMaW50ZXInKTtcbiAgICAgICAgY29uc3Qgc3R5bGVsaW50TGludGVyID0gYXdhaXQgc3R5bGVsaW50LmNyZWF0ZUxpbnRlcigpO1xuICAgICAgICBoZWxwZXJzLmVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENyZWF0ZSBMaW50ZXInKTtcblxuICAgICAgICBoZWxwZXJzLnN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ29uZmlnJyk7XG4gICAgICAgIGxldCBmb3VuZENvbmZpZztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmb3VuZENvbmZpZyA9IGF3YWl0IHN0eWxlbGludExpbnRlci5nZXRDb25maWdGb3JGaWxlKGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoIS9ObyBjb25maWd1cmF0aW9uIHByb3ZpZGVkIGZvciAuKy8udGVzdChlcnJvci5tZXNzYWdlKSkge1xuICAgICAgICAgICAgaGVscGVycy5lbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBDb25maWcnKTtcbiAgICAgICAgICAgIC8vIElmIHdlIGdvdCBoZXJlLCBzdHlsZWxpbnQgZmFpbGVkIHRvIHBhcnNlIHRoZSBjb25maWd1cmF0aW9uXG4gICAgICAgICAgICAvLyB0aGVyZSdzIG5vIHBvaW50IG9mIHJlLWxpbnRpbmcgaWYgdXNlU3RhbmRhcmQgaXMgdHJ1ZSwgYmVjYXVzZSB0aGVcbiAgICAgICAgICAgIC8vIHVzZXIgZG9lcyBub3QgaGF2ZSB0aGUgY29tcGxldGUgc2V0IG9mIGRlc2lyZWQgcnVsZXMgcGFyc2VkXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ1VuYWJsZSB0byBwYXJzZSBzdHlsZWxpbnQgY29uZmlndXJhdGlvbicsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBoZWxwZXJzLmVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IExpbnQnKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaGVscGVycy5lbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBDb25maWcnKTtcblxuICAgICAgICBpZiAoZm91bmRDb25maWcpIHtcbiAgICAgICAgICAvLyBXZSBoYXZlIGEgY29uZmlndXJhdGlvbiBmcm9tIFN0eWxlbGludFxuICAgICAgICAgIG9wdGlvbnMuY29uZmlnID0gZm91bmRDb25maWcuY29uZmlnO1xuICAgICAgICAgIG9wdGlvbnMuY29uZmlnQmFzZWRpciA9IGRpcm5hbWUoZm91bmRDb25maWcuZmlsZXBhdGgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZVdoZW5Ob0NvbmZpZykge1xuICAgICAgICAgIC8vIE5vIGNvbmZpZ3VyYXRpb24sIGFuZCBsaW50aW5nIHdpdGhvdXQgb25lIGlzIGRpc2FibGVkXG4gICAgICAgICAgaGVscGVycy5lbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudXNlU3RhbmRhcmQpIHtcbiAgICAgICAgICAvLyBObyBjb25maWd1cmF0aW9uLCBidXQgdXNpbmcgdGhlIHN0YW5kYXJkIGlzIGVuYWJsZWRcbiAgICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gaGVscGVycy5nZXREZWZhdWx0Q29uZmlnKG9wdGlvbnMuc3ludGF4KTtcbiAgICAgICAgICBvcHRpb25zLmNvbmZpZyA9IHsgcnVsZXM6IGRlZmF1bHRDb25maWcucnVsZXMgfTtcbiAgICAgICAgICBpZiAoZGVmYXVsdENvbmZpZy5leHRlbmRzKSB7XG4gICAgICAgICAgICBvcHRpb25zLmNvbmZpZy5leHRlbmRzID0gZGVmYXVsdENvbmZpZy5leHRlbmRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvcHRpb25zLmNvbmZpZ0Jhc2VkaXIgPSBkZWZhdWx0Q29uZmlnLmNvbmZpZ0Jhc2VkaXI7XG4gICAgICAgIH1cblxuICAgICAgICBoZWxwZXJzLnN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ2hlY2sgaWdub3JlZCcpO1xuICAgICAgICBsZXQgZmlsZUlzSWdub3JlZDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBmaWxlSXNJZ25vcmVkID0gYXdhaXQgc3R5bGVsaW50TGludGVyLmlzUGF0aElnbm9yZWQoZmlsZVBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIC8vIERvIG5vdGhpbmcsIGNvbmZpZ3VyYXRpb24gZXJyb3JzIHNob3VsZCBoYXZlIGFscmVhZHkgYmVlbiBjYXVnaHQgYW5kIHRocm93biBhYm92ZVxuICAgICAgICB9XG4gICAgICAgIGhlbHBlcnMuZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ2hlY2sgaWdub3JlZCcpO1xuXG4gICAgICAgIGlmIChmaWxlSXNJZ25vcmVkKSB7XG4gICAgICAgICAgaGVscGVycy5lbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gICAgICAgICAgaWYgKHRoaXMuc2hvd0lnbm9yZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICBleGNlcnB0OiAnVGhpcyBmaWxlIGlzIGlnbm9yZWQnLFxuICAgICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBoZWxwZXJzLmNyZWF0ZVJhbmdlKGVkaXRvcilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHtcbiAgICAgICAgICBzaG93SWdub3JlZDogdGhpcy5zaG93SWdub3JlZFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBoZWxwZXJzLnJ1blN0eWxlbGludChlZGl0b3IsIG9wdGlvbnMsIGZpbGVQYXRoLCBzZXR0aW5ncyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcbiJdfQ==