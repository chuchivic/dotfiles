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
var assignDeep = undefined;

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
  if (!assignDeep) {
    assignDeep = require('assign-deep');
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

        var rules = {};
        var options = {
          code: text,
          codeFilename: filePath,
          config: { rules: rules }
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
          options.config = assignDeep(rules, foundConfig.config);
          options.configBasedir = dirname(foundConfig.filepath);
        } else if (_this2.disableWhenNoConfig) {
          // No configuration, and linting without one is disabled
          helpers.endMeasure('linter-stylelint: Lint');
          return [];
        } else if (_this2.useStandard) {
          // No configuration, but using the standard is enabled
          var defaultConfig = helpers.getDefaultConfig(options.syntax, filePath);
          assignDeep(rules, defaultConfig.rules);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUdvQyxNQUFNOzs7QUFIMUMsV0FBVyxDQUFDLEFBTVosSUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLElBQUksT0FBTyxZQUFBLENBQUM7QUFDWixJQUFJLFNBQVMsWUFBQSxDQUFDO0FBQ2QsSUFBSSxVQUFVLFlBQUEsQ0FBQzs7QUFFZixTQUFTLFFBQVEsR0FBRztBQUNsQixNQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osV0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUNoQztBQUNELE1BQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixXQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQztHQUNuQztBQUNELE1BQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxhQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQ2xDO0FBQ0QsTUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGNBQVUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7R0FDckM7Q0FDRjs7cUJBRWM7QUFDYixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLGNBQWMsWUFBQSxDQUFDO0FBQ25CLFFBQU0sMEJBQTBCLEdBQUcsU0FBN0IsMEJBQTBCLEdBQVM7QUFDdkMsWUFBSyxhQUFhLFVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO0FBQ3RCLGVBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO09BQzFEO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0FBQ0Ysa0JBQWMsR0FB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QyxDQUFDOztBQUV0RCxZQUFJLGFBQWEsRUFBRTtBQUNqQixpQkFBTyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQzdDLGNBQUksT0FBSyxXQUFXLEVBQUU7QUFDcEIsbUJBQU8sQ0FBQztBQUNOLHNCQUFRLEVBQUUsU0FBUztBQUNuQixxQkFBTyxFQUFFLHNCQUFzQjtBQUMvQixzQkFBUSxFQUFFO0FBQ1Isb0JBQUksRUFBRSxRQUFRO0FBQ2Qsd0JBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztlQUN0QzthQUNGLENBQUMsQ0FBQztXQUNKO0FBQ0QsaUJBQU8sRUFBRSxDQUFDO1NBQ1g7QUFDRCxZQUFNLFFBQVEsR0FBRztBQUNmLHFCQUFXLEVBQUUsT0FBSyxXQUFXO1NBQzlCLENBQUM7O0FBRUYsZUFBTyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ2xFLENBQUE7S0FDRixDQUFDO0dBQ0g7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L2V4dGVuc2lvbnMsIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llc1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nO1xuXG4vLyBEZXBlbmRlbmNpZXNcbmxldCBoZWxwZXJzO1xubGV0IGRpcm5hbWU7XG5sZXQgc3R5bGVsaW50O1xubGV0IGFzc2lnbkRlZXA7XG5cbmZ1bmN0aW9uIGxvYWREZXBzKCkge1xuICBpZiAoIWhlbHBlcnMpIHtcbiAgICBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG4gIH1cbiAgaWYgKCFkaXJuYW1lKSB7XG4gICAgZGlybmFtZSA9IHJlcXVpcmUoJ3BhdGgnKS5kaXJuYW1lO1xuICB9XG4gIGlmICghc3R5bGVsaW50KSB7XG4gICAgc3R5bGVsaW50ID0gcmVxdWlyZSgnc3R5bGVsaW50Jyk7XG4gIH1cbiAgaWYgKCFhc3NpZ25EZWVwKSB7XG4gICAgYXNzaWduRGVlcCA9IHJlcXVpcmUoJ2Fzc2lnbi1kZWVwJyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmlkbGVDYWxsYmFja3MgPSBuZXcgU2V0KCk7XG4gICAgbGV0IGRlcHNDYWxsYmFja0lEO1xuICAgIGNvbnN0IGluc3RhbGxMaW50ZXJTdHlsZWxpbnREZXBzID0gKCkgPT4ge1xuICAgICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmRlbGV0ZShkZXBzQ2FsbGJhY2tJRCk7XG4gICAgICBpZiAoIWF0b20uaW5TcGVjTW9kZSgpKSB7XG4gICAgICAgIHJlcXVpcmUoJ2F0b20tcGFja2FnZS1kZXBzJykuaW5zdGFsbCgnbGludGVyLXN0eWxlbGludCcpO1xuICAgICAgfVxuICAgICAgbG9hZERlcHMoKTtcbiAgICB9O1xuICAgIGRlcHNDYWxsYmFja0lEID0gd2luZG93LnJlcXVlc3RJZGxlQ2FsbGJhY2soaW5zdGFsbExpbnRlclN0eWxlbGludERlcHMpO1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5hZGQoZGVwc0NhbGxiYWNrSUQpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXN0eWxlbGludC5kaXNhYmxlV2hlbk5vQ29uZmlnJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuZGlzYWJsZVdoZW5Ob0NvbmZpZyA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy51c2VTdGFuZGFyZCAmJiB0aGlzLmRpc2FibGVXaGVuTm9Db25maWcpIHtcbiAgICAgICAgICAvLyBEaXNhYmxlIHVzaW5nIHRoZSBzdGFuZGFyZCBpZiBpdCBpcyBkZXNpcmVkIHRvIHN0b3AgbGludGluZyB3aXRoXG4gICAgICAgICAgLy8gbm8gY29uZmlndXJhdGlvblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXN0eWxlbGludC51c2VTdGFuZGFyZCcsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItc3R5bGVsaW50LnVzZVN0YW5kYXJkJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMudXNlU3RhbmRhcmQgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMudXNlU3RhbmRhcmQgJiYgdGhpcy5kaXNhYmxlV2hlbk5vQ29uZmlnKSB7XG4gICAgICAgICAgLy8gRGlzYWJsZSBkaXNhYmxpbmcgbGludGluZyB3aGVuIHRoZXJlIGlzIG5vIGNvbmZpZ3VyYXRpb24gYXMgdGhlXG4gICAgICAgICAgLy8gc3RhbmRhcmQgY29uZmlndXJhdGlvbiB3aWxsIGFsd2F5cyBiZSBhdmFpbGFibGUuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdsaW50ZXItc3R5bGVsaW50LmRpc2FibGVXaGVuTm9Db25maWcnLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXN0eWxlbGludC5zaG93SWdub3JlZCcsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLnNob3dJZ25vcmVkID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsICh2YWx1ZSkgPT4ge1xuICAgICAgICB0aGlzLmNvcmVJZ25vcmVkID0gdmFsdWU7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgdGhpcy5iYXNlU2NvcGVzID0gW1xuICAgICAgJ3NvdXJjZS5jc3MnLFxuICAgICAgJ3NvdXJjZS5zY3NzJyxcbiAgICAgICdzb3VyY2UuY3NzLnNjc3MnLFxuICAgICAgJ3NvdXJjZS5sZXNzJyxcbiAgICAgICdzb3VyY2UuY3NzLmxlc3MnLFxuICAgICAgJ3NvdXJjZS5jc3MucG9zdGNzcycsXG4gICAgICAnc291cmNlLmNzcy5wb3N0Y3NzLnN1Z2Fyc3MnXG4gICAgXTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuaWRsZUNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrSUQgPT4gd2luZG93LmNhbmNlbElkbGVDYWxsYmFjayhjYWxsYmFja0lEKSk7XG4gICAgdGhpcy5pZGxlQ2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBwcm92aWRlTGludGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnc3R5bGVsaW50JyxcbiAgICAgIGdyYW1tYXJTY29wZXM6IHRoaXMuYmFzZVNjb3BlcyxcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBsaW50c09uQ2hhbmdlOiB0cnVlLFxuICAgICAgbGludDogYXN5bmMgKGVkaXRvcikgPT4ge1xuICAgICAgICAvLyBGb3JjZSB0aGUgZGVwZW5kZW5jaWVzIHRvIGxvYWQgaWYgdGhleSBoYXZlbid0IGFscmVhZHlcbiAgICAgICAgbG9hZERlcHMoKTtcblxuICAgICAgICBoZWxwZXJzLnN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGVkaXRvci5nZXRUZXh0KCk7XG5cbiAgICAgICAgaWYgKCF0ZXh0KSB7XG4gICAgICAgICAgaGVscGVycy5lbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcnVsZXMgPSB7fTtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICBjb2RlOiB0ZXh0LFxuICAgICAgICAgIGNvZGVGaWxlbmFtZTogZmlsZVBhdGgsXG4gICAgICAgICAgY29uZmlnOiB7IHJ1bGVzIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBzY29wZXMgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KCk7XG4gICAgICAgIGlmIChzY29wZXMuaW5jbHVkZXMoJ3NvdXJjZS5jc3Muc2NzcycpIHx8IHNjb3Blcy5pbmNsdWRlcygnc291cmNlLnNjc3MnKSkge1xuICAgICAgICAgIG9wdGlvbnMuc3ludGF4ID0gJ3Njc3MnO1xuICAgICAgICB9IGVsc2UgaWYgKHNjb3Blcy5pbmNsdWRlcygnc291cmNlLmNzcy5sZXNzJykgfHwgc2NvcGVzLmluY2x1ZGVzKCdzb3VyY2UubGVzcycpKSB7XG4gICAgICAgICAgb3B0aW9ucy5zeW50YXggPSAnbGVzcyc7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NvcGVzLmluY2x1ZGVzKCdzb3VyY2UuY3NzLnBvc3Rjc3Muc3VnYXJzcycpKSB7XG4gICAgICAgICAgb3B0aW9ucy5zeW50YXggPSAnc3VnYXJzcyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jb3JlSWdub3JlZCkge1xuICAgICAgICAgIC8vIFdoZW4gQXRvbSAoYW5kIHRodXMgTGludGVyKSBpcyBzZXQgdG8gYWxsb3cgaWdub3JlZCBmaWxlcywgdGVsbFxuICAgICAgICAgIC8vIFN0eWxlbGludCB0byBkbyB0aGUgc2FtZS5cbiAgICAgICAgICBvcHRpb25zLmRpc2FibGVEZWZhdWx0SWdub3JlcyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBoZWxwZXJzLnN0YXJ0TWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ3JlYXRlIExpbnRlcicpO1xuICAgICAgICBjb25zdCBzdHlsZWxpbnRMaW50ZXIgPSBhd2FpdCBzdHlsZWxpbnQuY3JlYXRlTGludGVyKCk7XG4gICAgICAgIGhlbHBlcnMuZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogQ3JlYXRlIExpbnRlcicpO1xuXG4gICAgICAgIGhlbHBlcnMuc3RhcnRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBDb25maWcnKTtcbiAgICAgICAgbGV0IGZvdW5kQ29uZmlnO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZvdW5kQ29uZmlnID0gYXdhaXQgc3R5bGVsaW50TGludGVyLmdldENvbmZpZ0ZvckZpbGUoZmlsZVBhdGgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmICghL05vIGNvbmZpZ3VyYXRpb24gcHJvdmlkZWQgZm9yIC4rLy50ZXN0KGVycm9yLm1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBoZWxwZXJzLmVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENvbmZpZycpO1xuICAgICAgICAgICAgLy8gSWYgd2UgZ290IGhlcmUsIHN0eWxlbGludCBmYWlsZWQgdG8gcGFyc2UgdGhlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgIC8vIHRoZXJlJ3Mgbm8gcG9pbnQgb2YgcmUtbGludGluZyBpZiB1c2VTdGFuZGFyZCBpcyB0cnVlLCBiZWNhdXNlIHRoZVxuICAgICAgICAgICAgLy8gdXNlciBkb2VzIG5vdCBoYXZlIHRoZSBjb21wbGV0ZSBzZXQgb2YgZGVzaXJlZCBydWxlcyBwYXJzZWRcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignVW5hYmxlIHRvIHBhcnNlIHN0eWxlbGludCBjb25maWd1cmF0aW9uJywge1xuICAgICAgICAgICAgICBkZXRhaWw6IGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGhlbHBlcnMuZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBoZWxwZXJzLmVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENvbmZpZycpO1xuXG4gICAgICAgIGlmIChmb3VuZENvbmZpZykge1xuICAgICAgICAgIC8vIFdlIGhhdmUgYSBjb25maWd1cmF0aW9uIGZyb20gU3R5bGVsaW50XG4gICAgICAgICAgb3B0aW9ucy5jb25maWcgPSBhc3NpZ25EZWVwKHJ1bGVzLCBmb3VuZENvbmZpZy5jb25maWcpO1xuICAgICAgICAgIG9wdGlvbnMuY29uZmlnQmFzZWRpciA9IGRpcm5hbWUoZm91bmRDb25maWcuZmlsZXBhdGgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGlzYWJsZVdoZW5Ob0NvbmZpZykge1xuICAgICAgICAgIC8vIE5vIGNvbmZpZ3VyYXRpb24sIGFuZCBsaW50aW5nIHdpdGhvdXQgb25lIGlzIGRpc2FibGVkXG4gICAgICAgICAgaGVscGVycy5lbmRNZWFzdXJlKCdsaW50ZXItc3R5bGVsaW50OiBMaW50Jyk7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudXNlU3RhbmRhcmQpIHtcbiAgICAgICAgICAvLyBObyBjb25maWd1cmF0aW9uLCBidXQgdXNpbmcgdGhlIHN0YW5kYXJkIGlzIGVuYWJsZWRcbiAgICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gaGVscGVycy5nZXREZWZhdWx0Q29uZmlnKG9wdGlvbnMuc3ludGF4LCBmaWxlUGF0aCk7XG4gICAgICAgICAgYXNzaWduRGVlcChydWxlcywgZGVmYXVsdENvbmZpZy5ydWxlcyk7XG4gICAgICAgICAgaWYgKGRlZmF1bHRDb25maWcuZXh0ZW5kcykge1xuICAgICAgICAgICAgb3B0aW9ucy5jb25maWcuZXh0ZW5kcyA9IGRlZmF1bHRDb25maWcuZXh0ZW5kcztcbiAgICAgICAgICB9XG4gICAgICAgICAgb3B0aW9ucy5jb25maWdCYXNlZGlyID0gZGVmYXVsdENvbmZpZy5jb25maWdCYXNlZGlyO1xuICAgICAgICB9XG5cbiAgICAgICAgaGVscGVycy5zdGFydE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENoZWNrIGlnbm9yZWQnKTtcbiAgICAgICAgbGV0IGZpbGVJc0lnbm9yZWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZmlsZUlzSWdub3JlZCA9IGF3YWl0IHN0eWxlbGludExpbnRlci5pc1BhdGhJZ25vcmVkKGZpbGVQYXRoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAvLyBEbyBub3RoaW5nLCBjb25maWd1cmF0aW9uIGVycm9ycyBzaG91bGQgaGF2ZSBhbHJlYWR5IGJlZW4gY2F1Z2h0IGFuZCB0aHJvd24gYWJvdmVcbiAgICAgICAgfVxuICAgICAgICBoZWxwZXJzLmVuZE1lYXN1cmUoJ2xpbnRlci1zdHlsZWxpbnQ6IENoZWNrIGlnbm9yZWQnKTtcblxuICAgICAgICBpZiAoZmlsZUlzSWdub3JlZCkge1xuICAgICAgICAgIGhlbHBlcnMuZW5kTWVhc3VyZSgnbGludGVyLXN0eWxlbGludDogTGludCcpO1xuICAgICAgICAgIGlmICh0aGlzLnNob3dJZ25vcmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgICAgICAgICAgZXhjZXJwdDogJ1RoaXMgZmlsZSBpcyBpZ25vcmVkJyxcbiAgICAgICAgICAgICAgbG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICBmaWxlOiBmaWxlUGF0aCxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogaGVscGVycy5jcmVhdGVSYW5nZShlZGl0b3IpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1dO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgc2hvd0lnbm9yZWQ6IHRoaXMuc2hvd0lnbm9yZWRcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gaGVscGVycy5ydW5TdHlsZWxpbnQoZWRpdG9yLCBvcHRpb25zLCBmaWxlUGF0aCwgc2V0dGluZ3MpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG4iXX0=