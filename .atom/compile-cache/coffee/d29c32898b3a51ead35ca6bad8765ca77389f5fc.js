(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1,
    slice = [].slice;

  os = require('os');

  path = require('path');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = [], Metrics = ref1[0], Logger = ref1[1];

  window.DEBUG = false;

  module.exports = {
    config: {
      useKite: {
        type: 'boolean',
        "default": true,
        order: 0,
        title: 'Use Kite-powered Completions (macOS & Windows only)',
        description: 'Kite is a cloud powered autocomplete engine. Choosing\nthis option will allow you to get cloud powered completions and other\nfeatures in addition to the completions provided by Jedi.'
      },
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      },
      enableTouchBar: {
        type: 'boolean',
        "default": false,
        order: 12,
        title: 'Enable Touch Bar support',
        description: 'Proof of concept for now, requires tooltips to be enabled and Atom >=1.19.0.'
      }
    },
    installation: null,
    _handleGrammarChangeEvent: function(grammar) {
      var ref2;
      if ((ref2 = grammar.packageName) === 'language-python' || ref2 === 'MagicPython' || ref2 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    _loadKite: function() {
      var AccountManager, AtomHelper, Installation, Installer, StateController, checkKiteInstallation, compatibility, editorCfg, event, firstInstall, longRunning, pluginCfg, ref2;
      firstInstall = localStorage.getItem('autocomplete-python.installed') === null;
      localStorage.setItem('autocomplete-python.installed', true);
      longRunning = require('process').uptime() > 10;
      if (firstInstall && longRunning) {
        event = "installed";
      } else if (firstInstall) {
        event = "upgraded";
      } else {
        event = "restarted";
      }
      ref2 = require('kite-installer'), AccountManager = ref2.AccountManager, AtomHelper = ref2.AtomHelper, compatibility = ref2.compatibility, Installation = ref2.Installation, Installer = ref2.Installer, Metrics = ref2.Metrics, Logger = ref2.Logger, StateController = ref2.StateController;
      if (atom.config.get('kite.loggingLevel')) {
        Logger.LEVEL = Logger.LEVELS[atom.config.get('kite.loggingLevel').toUpperCase()];
      }
      AccountManager.initClient('alpha.kite.com', -1, true);
      atom.views.addViewProvider(Installation, function(m) {
        return m.element;
      });
      editorCfg = {
        UUID: localStorage.getItem('metrics.userId'),
        name: 'atom'
      };
      pluginCfg = {
        name: 'autocomplete-python'
      };
      Metrics.Tracker.name = "atom acp";
      Metrics.enabled = atom.config.get('core.telemetryConsent') === 'limited';
      atom.packages.onDidActivatePackage((function(_this) {
        return function(pkg) {
          if (pkg.name === 'kite') {
            _this.patchKiteCompletions(pkg);
            return Metrics.Tracker.name = "atom kite+acp";
          }
        };
      })(this));
      checkKiteInstallation = (function(_this) {
        return function() {
          var canInstall, compatible;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          compatible = compatibility.check();
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([compatible, canInstall]).then(function(values) {
              var installer, pane, projectPath, root, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = {};
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                return atom.config.set('autocomplete-python.useKite', false);
              });
              projectPath = atom.project.getPaths()[0];
              root = (projectPath != null) && path.relative(os.homedir(), projectPath).indexOf('..') === 0 ? path.parse(projectPath).root : os.homedir();
              installer = new Installer([root]);
              installer.init(_this.installation.flow, function() {
                Logger.verbose('in onFinish');
                return atom.packages.activatePackage('kite');
              });
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (typeof err !== 'undefined' && err.type === 'denied') {
                return atom.config.set('autocomplete-python.useKite', false);
              }
            });
          }
        };
      })(this);
      checkKiteInstallation();
      return atom.config.onDidChange('autocomplete-python.useKite', function(arg) {
        var newValue, oldValue;
        newValue = arg.newValue, oldValue = arg.oldValue;
        if (newValue) {
          checkKiteInstallation();
          return AtomHelper.enablePackage();
        } else {
          return AtomHelper.disablePackage();
        }
      });
    },
    load: function() {
      var disposable;
      this.disposables = new CompositeDisposable;
      disposable = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor.getGrammar());
          disposable = editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(grammar);
          });
          return _this.disposables.add(disposable);
        };
      })(this));
      this.disposables.add(disposable);
      return this._loadKite();
    },
    activate: function(state) {
      var disposable;
      this.emitter = new Emitter;
      this.provider = require('./provider');
      if (typeof atom.packages.hasActivatedInitialPackages === 'function' && atom.packages.hasActivatedInitialPackages()) {
        return this.load();
      } else {
        return disposable = atom.packages.onDidActivateInitialPackages((function(_this) {
          return function() {
            _this.load();
            return disposable.dispose();
          };
        })(this));
      }
    },
    deactivate: function() {
      if (this.provider) {
        this.provider.dispose();
      }
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return this.provider;
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      var disposable;
      return disposable = this.emitter.on('did-load-provider', (function(_this) {
        return function() {
          _this.provider.setSnippetsManager(snippetsManager);
          return disposable.dispose();
        };
      })(this));
    },
    patchKiteCompletions: function(kite) {
      var getSuggestions;
      if (this.kitePackage != null) {
        return;
      }
      this.kitePackage = kite.mainModule;
      this.kiteProvider = this.kitePackage.completions();
      getSuggestions = this.kiteProvider.getSuggestions;
      return this.kiteProvider.getSuggestions = (function(_this) {
        return function() {
          var args, ref2, ref3;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return getSuggestions != null ? (ref2 = getSuggestions.apply(_this.kiteProvider, args)) != null ? (ref3 = ref2.then(function(suggestions) {
            _this.lastKiteSuggestions = suggestions;
            _this.kiteSuggested = suggestions != null;
            return suggestions;
          })) != null ? ref3["catch"](function(err) {
            _this.lastKiteSuggestions = [];
            _this.kiteSuggested = false;
            throw err;
          }) : void 0 : void 0 : void 0;
        };
      })(this);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFpQyxPQUFBLENBQVEsTUFBUixDQUFqQyxFQUFDLDZDQUFELEVBQXNCOztFQUV0QixPQUFvQixFQUFwQixFQUFDLGlCQUFELEVBQVU7O0VBRVYsTUFBTSxDQUFDLEtBQVAsR0FBZTs7RUFDZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsT0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyxxREFIUDtRQUlBLFdBQUEsRUFBYSx5TEFKYjtPQURGO01BUUEsZ0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8sbUJBSFA7UUFJQSxXQUFBLEVBQWEsZ0RBSmI7T0FURjtNQWNBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxNQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsVUFBaEIsQ0FITjtRQUlBLEtBQUEsRUFBTyxrQ0FKUDtRQUtBLFdBQUEsRUFBYSx5UkFMYjtPQWZGO01BeUJBLFdBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxF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Q0FBQTtNQUNoQixjQUFBLEdBQWlCLElBQUMsQ0FBQSxZQUFZLENBQUM7YUFDL0IsSUFBQyxDQUFBLFlBQVksQ0FBQyxjQUFkLEdBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtBQUM3QixjQUFBO1VBRDhCOzs7Ozs0QkFNOUIsRUFBRSxLQUFGLEVBTEEsQ0FLUSxTQUFDLEdBQUQ7WUFDTixLQUFDLENBQUEsbUJBQUQsR0FBdUI7WUFDdkIsS0FBQyxDQUFBLGFBQUQsR0FBaUI7QUFDakIsa0JBQU07VUFIQSxDQUxSO1FBRDZCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtJQU5YLENBbFF0Qjs7QUFSRiIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbltNZXRyaWNzLCBMb2dnZXJdID0gW11cblxud2luZG93LkRFQlVHID0gZmFsc2Vcbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIHVzZUtpdGU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAwXG4gICAgICB0aXRsZTogJ1VzZSBLaXRlLXBvd2VyZWQgQ29tcGxldGlvbnMgKG1hY09TICYgV2luZG93cyBvbmx5KSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydLaXRlIGlzIGEgY2xvdWQgcG93ZXJlZCBhdXRvY29tcGxldGUgZW5naW5lLiBDaG9vc2luZ1xuICAgICAgdGhpcyBvcHRpb24gd2lsbCBhbGxvdyB5b3UgdG8gZ2V0IGNsb3VkIHBvd2VyZWQgY29tcGxldGlvbnMgYW5kIG90aGVyXG4gICAgICBmZWF0dXJlcyBpbiBhZGRpdGlvbiB0byB0aGUgY29tcGxldGlvbnMgcHJvdmlkZWQgYnkgSmVkaS4nJydcbiAgICBzaG93RGVzY3JpcHRpb25zOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMVxuICAgICAgdGl0bGU6ICdTaG93IERlc2NyaXB0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBkb2Mgc3RyaW5ncyBmcm9tIGZ1bmN0aW9ucywgY2xhc3NlcywgZXRjLidcbiAgICB1c2VTbmlwcGV0czpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnbm9uZSdcbiAgICAgIG9yZGVyOiAyXG4gICAgICBlbnVtOiBbJ25vbmUnLCAnYWxsJywgJ3JlcXVpcmVkJ11cbiAgICAgIHRpdGxlOiAnQXV0b2NvbXBsZXRlIEZ1bmN0aW9uIFBhcmFtZXRlcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQXV0b21hdGljYWxseSBjb21wbGV0ZSBmdW5jdGlvbiBhcmd1bWVudHMgYWZ0ZXIgdHlwaW5nXG4gICAgICBsZWZ0IHBhcmVudGhlc2lzIGNoYXJhY3Rlci4gVXNlIGNvbXBsZXRpb24ga2V5IHRvIGp1bXAgYmV0d2VlblxuICAgICAgYXJndW1lbnRzLiBTZWUgYGF1dG9jb21wbGV0ZS1weXRob246Y29tcGxldGUtYXJndW1lbnRzYCBjb21tYW5kIGlmIHlvdVxuICAgICAgd2FudCB0byB0cmlnZ2VyIGFyZ3VtZW50IGNvbXBsZXRpb25zIG1hbnVhbGx5LiBTZWUgUkVBRE1FIGlmIGl0IGRvZXMgbm90XG4gICAgICB3b3JrIGZvciB5b3UuJycnXG4gICAgcHl0aG9uUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiAzXG4gICAgICB0aXRsZTogJ1B5dGhvbiBFeGVjdXRhYmxlIFBhdGhzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ09wdGlvbmFsIHNlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBwYXRocyB0byBweXRob25cbiAgICAgIGV4ZWN1dGFibGVzIChpbmNsdWRpbmcgZXhlY3V0YWJsZSBuYW1lcyksIHdoZXJlIHRoZSBmaXJzdCBvbmUgd2lsbCB0YWtlXG4gICAgICBoaWdoZXIgcHJpb3JpdHkgb3ZlciB0aGUgbGFzdCBvbmUuIEJ5IGRlZmF1bHQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aWxsXG4gICAgICBhdXRvbWF0aWNhbGx5IGxvb2sgZm9yIHZpcnR1YWwgZW52aXJvbm1lbnRzIGluc2lkZSBvZiB5b3VyIHByb2plY3QgYW5kXG4gICAgICB0cnkgdG8gdXNlIHRoZW0gYXMgd2VsbCBhcyB0cnkgdG8gZmluZCBnbG9iYWwgcHl0aG9uIGV4ZWN1dGFibGUuIElmIHlvdVxuICAgICAgdXNlIHRoaXMgY29uZmlnLCBhdXRvbWF0aWMgbG9va3VwIHdpbGwgaGF2ZSBsb3dlc3QgcHJpb3JpdHkuXG4gICAgICBVc2UgYCRQUk9KRUNUYCBvciBgJFBST0pFQ1RfTkFNRWAgc3Vic3RpdHV0aW9uIGZvciBwcm9qZWN0LXNwZWNpZmljXG4gICAgICBwYXRocyB0byBwb2ludCBvbiBleGVjdXRhYmxlcyBpbiB2aXJ0dWFsIGVudmlyb25tZW50cy5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYC9Vc2Vycy9uYW1lLy52aXJ0dWFsZW52cy8kUFJPSkVDVF9OQU1FL2Jpbi9weXRob247JFBST0pFQ1QvdmVudi9iaW4vcHl0aG9uMzsvdXNyL2Jpbi9weXRob25gLlxuICAgICAgU3VjaCBjb25maWcgd2lsbCBmYWxsIGJhY2sgb24gYC91c3IvYmluL3B5dGhvbmAgZm9yIHByb2plY3RzIG5vdCBwcmVzZW50ZWRcbiAgICAgIHdpdGggc2FtZSBuYW1lIGluIGAudmlydHVhbGVudnNgIGFuZCB3aXRob3V0IGB2ZW52YCBmb2xkZXIgaW5zaWRlIG9mIG9uZVxuICAgICAgb2YgcHJvamVjdCBmb2xkZXJzLlxuICAgICAgSWYgeW91IGFyZSB1c2luZyBweXRob24zIGV4ZWN1dGFibGUgd2hpbGUgY29kaW5nIGZvciBweXRob24yIHlvdSB3aWxsIGdldFxuICAgICAgcHl0aG9uMiBjb21wbGV0aW9ucyBmb3Igc29tZSBidWlsdC1pbnMuJycnXG4gICAgZXh0cmFQYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDRcbiAgICAgIHRpdGxlOiAnRXh0cmEgUGF0aHMgRm9yIFBhY2thZ2VzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbWljb2xvbiBzZXBhcmF0ZWQgbGlzdCBvZiBtb2R1bGVzIHRvIGFkZGl0aW9uYWxseVxuICAgICAgaW5jbHVkZSBmb3IgYXV0b2NvbXBsZXRlLiBZb3UgY2FuIHVzZSBzYW1lIHN1YnN0aXR1dGlvbnMgYXMgaW5cbiAgICAgIGBQeXRob24gRXhlY3V0YWJsZSBQYXRoc2AuXG4gICAgICBOb3RlIHRoYXQgaXQgc3RpbGwgc2hvdWxkIGJlIHZhbGlkIHB5dGhvbiBwYWNrYWdlLlxuICAgICAgRm9yIGV4YW1wbGU6XG4gICAgICBgJFBST0pFQ1QvZW52L2xpYi9weXRob24yLjcvc2l0ZS1wYWNrYWdlc2BcbiAgICAgIG9yXG4gICAgICBgL1VzZXIvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgLlxuICAgICAgWW91IGRvbid0IG5lZWQgdG8gc3BlY2lmeSBleHRyYSBwYXRocyBmb3IgbGlicmFyaWVzIGluc3RhbGxlZCB3aXRoIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZSB5b3UgdXNlLicnJ1xuICAgIGNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA1XG4gICAgICB0aXRsZTogJ0Nhc2UgSW5zZW5zaXRpdmUgQ29tcGxldGlvbidcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGNvbXBsZXRpb24gaXMgYnkgZGVmYXVsdCBjYXNlIGluc2Vuc2l0aXZlLidcbiAgICB0cmlnZ2VyQ29tcGxldGlvblJlZ2V4OlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcoW1xcLlxcIChdfFthLXpBLVpfXVthLXpBLVowLTlfXSopJ1xuICAgICAgb3JkZXI6IDZcbiAgICAgIHRpdGxlOiAnUmVnZXggVG8gVHJpZ2dlciBBdXRvY29tcGxldGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnQnkgZGVmYXVsdCBjb21wbGV0aW9ucyB0cmlnZ2VyZWQgYWZ0ZXIgd29yZHMsIGRvdHMsIHNwYWNlc1xuICAgICAgYW5kIGxlZnQgcGFyZW50aGVzaXMuIFlvdSB3aWxsIG5lZWQgdG8gcmVzdGFydCB5b3VyIGVkaXRvciBhZnRlciBjaGFuZ2luZ1xuICAgICAgdGhpcy4nJydcbiAgICBmdXp6eU1hdGNoZXI6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiA3XG4gICAgICB0aXRsZTogJ1VzZSBGdXp6eSBNYXRjaGVyIEZvciBDb21wbGV0aW9ucy4nXG4gICAgICBkZXNjcmlwdGlvbjogJycnVHlwaW5nIGBzdGRyYCB3aWxsIG1hdGNoIGBzdGRlcnJgLlxuICAgICAgRmlyc3QgY2hhcmFjdGVyIHNob3VsZCBhbHdheXMgbWF0Y2guIFVzZXMgYWRkaXRpb25hbCBjYWNoaW5nIHRodXNcbiAgICAgIGNvbXBsZXRpb25zIHNob3VsZCBiZSBmYXN0ZXIuIE5vdGUgdGhhdCB0aGlzIHNldHRpbmcgZG9lcyBub3QgYWZmZWN0XG4gICAgICBidWlsdC1pbiBhdXRvY29tcGxldGUtcGx1cyBwcm92aWRlci4nJydcbiAgICBvdXRwdXRQcm92aWRlckVycm9yczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA4XG4gICAgICB0aXRsZTogJ091dHB1dCBQcm92aWRlciBFcnJvcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VsZWN0IGlmIHlvdSB3b3VsZCBsaWtlIHRvIHNlZSB0aGUgcHJvdmlkZXIgZXJyb3JzIHdoZW5cbiAgICAgIHRoZXkgaGFwcGVuLiBCeSBkZWZhdWx0IHRoZXkgYXJlIGhpZGRlbi4gTm90ZSB0aGF0IGNyaXRpY2FsIGVycm9ycyBhcmVcbiAgICAgIGFsd2F5cyBzaG93bi4nJydcbiAgICBvdXRwdXREZWJ1ZzpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiA5XG4gICAgICB0aXRsZTogJ091dHB1dCBEZWJ1ZyBMb2dzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgZGVidWcgaW5mb3JtYXRpb24gaW5cbiAgICAgIGRldmVsb3BlciB0b29scyBsb2dzLiBNYXkgc2xvdyBkb3duIHlvdXIgZWRpdG9yLicnJ1xuICAgIHNob3dUb29sdGlwczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAxMFxuICAgICAgdGl0bGU6ICdTaG93IFRvb2x0aXBzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlIG9iamVjdCB1bmRlciB0aGUgY3Vyc29yJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0VYUEVSSU1FTlRBTCBGRUFUVVJFIFdISUNIIElTIE5PVCBGSU5JU0hFRCBZRVQuXG4gICAgICBGZWVkYmFjayBhbmQgaWRlYXMgYXJlIHdlbGNvbWUgb24gZ2l0aHViLicnJ1xuICAgIHN1Z2dlc3Rpb25Qcmlvcml0eTpcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgZGVmYXVsdDogM1xuICAgICAgbWluaW11bTogMFxuICAgICAgbWF4aW11bTogOTlcbiAgICAgIG9yZGVyOiAxMVxuICAgICAgdGl0bGU6ICdTdWdnZXN0aW9uIFByaW9yaXR5J1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1lvdSBjYW4gdXNlIHRoaXMgdG8gc2V0IHRoZSBwcmlvcml0eSBmb3IgYXV0b2NvbXBsZXRlLXB5dGhvblxuICAgICAgc3VnZ2VzdGlvbnMuIEZvciBleGFtcGxlLCB5b3UgY2FuIHVzZSBsb3dlciB2YWx1ZSB0byBnaXZlIGhpZ2hlciBwcmlvcml0eVxuICAgICAgZm9yIHNuaXBwZXRzIGNvbXBsZXRpb25zIHdoaWNoIGhhcyBwcmlvcml0eSBvZiAyLicnJ1xuICAgIGVuYWJsZVRvdWNoQmFyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDEyXG4gICAgICB0aXRsZTogJ0VuYWJsZSBUb3VjaCBCYXIgc3VwcG9ydCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydQcm9vZiBvZiBjb25jZXB0IGZvciBub3csIHJlcXVpcmVzIHRvb2x0aXBzIHRvIGJlIGVuYWJsZWQgYW5kIEF0b20gPj0xLjE5LjAuJycnXG5cbiAgaW5zdGFsbGF0aW9uOiBudWxsXG5cbiAgX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudDogKGdyYW1tYXIpIC0+XG4gICAgIyB0aGlzIHNob3VsZCBiZSBzYW1lIHdpdGggYWN0aXZhdGlvbkhvb2tzIG5hbWVzXG4gICAgaWYgZ3JhbW1hci5wYWNrYWdlTmFtZSBpbiBbJ2xhbmd1YWdlLXB5dGhvbicsICdNYWdpY1B5dGhvbicsICdhdG9tLWRqYW5nbyddXG4gICAgICBAcHJvdmlkZXIubG9hZCgpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtbG9hZC1wcm92aWRlcidcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBfbG9hZEtpdGU6IC0+XG4gICAgZmlyc3RJbnN0YWxsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2F1dG9jb21wbGV0ZS1weXRob24uaW5zdGFsbGVkJykgPT0gbnVsbFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcsIHRydWUpXG4gICAgbG9uZ1J1bm5pbmcgPSByZXF1aXJlKCdwcm9jZXNzJykudXB0aW1lKCkgPiAxMFxuICAgIGlmIGZpcnN0SW5zdGFsbCBhbmQgbG9uZ1J1bm5pbmdcbiAgICAgIGV2ZW50ID0gXCJpbnN0YWxsZWRcIlxuICAgIGVsc2UgaWYgZmlyc3RJbnN0YWxsXG4gICAgICBldmVudCA9IFwidXBncmFkZWRcIlxuICAgIGVsc2VcbiAgICAgIGV2ZW50ID0gXCJyZXN0YXJ0ZWRcIlxuXG4gICAge1xuICAgICAgQWNjb3VudE1hbmFnZXIsXG4gICAgICBBdG9tSGVscGVyLFxuICAgICAgY29tcGF0aWJpbGl0eSxcbiAgICAgIEluc3RhbGxhdGlvbixcbiAgICAgIEluc3RhbGxlcixcbiAgICAgIE1ldHJpY3MsXG4gICAgICBMb2dnZXIsXG4gICAgICBTdGF0ZUNvbnRyb2xsZXJcbiAgICB9ID0gcmVxdWlyZSAna2l0ZS1pbnN0YWxsZXInXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2tpdGUubG9nZ2luZ0xldmVsJylcbiAgICAgIExvZ2dlci5MRVZFTCA9IExvZ2dlci5MRVZFTFNbYXRvbS5jb25maWcuZ2V0KCdraXRlLmxvZ2dpbmdMZXZlbCcpLnRvVXBwZXJDYXNlKCldXG5cbiAgICBBY2NvdW50TWFuYWdlci5pbml0Q2xpZW50ICdhbHBoYS5raXRlLmNvbScsIC0xLCB0cnVlXG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIgSW5zdGFsbGF0aW9uLCAobSkgLT4gbS5lbGVtZW50XG4gICAgZWRpdG9yQ2ZnID1cbiAgICAgIFVVSUQ6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtZXRyaWNzLnVzZXJJZCcpXG4gICAgICBuYW1lOiAnYXRvbSdcbiAgICBwbHVnaW5DZmcgPVxuICAgICAgbmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG5cbiAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBhY3BcIlxuICAgIE1ldHJpY3MuZW5hYmxlZCA9IGF0b20uY29uZmlnLmdldCgnY29yZS50ZWxlbWV0cnlDb25zZW50JykgaXMgJ2xpbWl0ZWQnXG5cbiAgICBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwa2cpID0+XG4gICAgICBpZiBwa2cubmFtZSBpcyAna2l0ZSdcbiAgICAgICAgQHBhdGNoS2l0ZUNvbXBsZXRpb25zKHBrZylcbiAgICAgICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20ga2l0ZSthY3BcIlxuXG4gICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uID0gKCkgPT5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcbiAgICAgICAgcmV0dXJuXG4gICAgICBjYW5JbnN0YWxsID0gU3RhdGVDb250cm9sbGVyLmNhbkluc3RhbGxLaXRlKClcbiAgICAgIGNvbXBhdGlibGUgPSBjb21wYXRpYmlsaXR5LmNoZWNrKClcbiAgICAgIFByb21pc2UuYWxsKFtjb21wYXRpYmxlLCBjYW5JbnN0YWxsXSkudGhlbigodmFsdWVzKSA9PlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgdmFyaWFudCA9IHt9XG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcyA9IHZhcmlhbnRcbiAgICAgICAgTWV0cmljcy5UcmFja2VyLnByb3BzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRpdGxlID0gXCJDaG9vc2UgYSBhdXRvY29tcGxldGUtcHl0aG9uIGVuZ2luZVwiXG4gICAgICAgIEBpbnN0YWxsYXRpb24gPSBuZXcgSW5zdGFsbGF0aW9uIHZhcmlhbnQsIHRpdGxlXG4gICAgICAgIEBpbnN0YWxsYXRpb24uYWNjb3VudENyZWF0ZWQoKCkgPT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgKVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmZsb3dTa2lwcGVkKCgpID0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICApXG4gICAgICAgIFtwcm9qZWN0UGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICByb290ID0gaWYgcHJvamVjdFBhdGg/IGFuZCBwYXRoLnJlbGF0aXZlKG9zLmhvbWVkaXIoKSwgcHJvamVjdFBhdGgpLmluZGV4T2YoJy4uJykgaXMgMFxuICAgICAgICAgIHBhdGgucGFyc2UocHJvamVjdFBhdGgpLnJvb3RcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9zLmhvbWVkaXIoKVxuXG4gICAgICAgIGluc3RhbGxlciA9IG5ldyBJbnN0YWxsZXIoW3Jvb3RdKVxuICAgICAgICBpbnN0YWxsZXIuaW5pdCBAaW5zdGFsbGF0aW9uLmZsb3csIC0+XG4gICAgICAgICAgTG9nZ2VyLnZlcmJvc2UoJ2luIG9uRmluaXNoJylcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgna2l0ZScpXG5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmZsb3cub25Ta2lwSW5zdGFsbCAoKSA9PlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICAgICBwYW5lLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgICAgICAgcGFuZS5hZGRJdGVtIEBpbnN0YWxsYXRpb24sIGluZGV4OiAwXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCAwXG4gICAgICAsIChlcnIpID0+XG4gICAgICAgIGlmIHR5cGVvZiBlcnIgIT0gJ3VuZGVmaW5lZCcgYW5kIGVyci50eXBlID09ICdkZW5pZWQnXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgKSBpZiBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcblxuICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbigpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgKHsgbmV3VmFsdWUsIG9sZFZhbHVlIH0pIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuICAgICAgICBBdG9tSGVscGVyLmVuYWJsZVBhY2thZ2UoKVxuICAgICAgZWxzZVxuICAgICAgICBBdG9tSGVscGVyLmRpc2FibGVQYWNrYWdlKClcblxuICBsb2FkOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICAgIGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChncmFtbWFyKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQF9sb2FkS2l0ZSgpXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHByb3ZpZGVyID0gcmVxdWlyZSgnLi9wcm92aWRlcicpXG4gICAgaWYgdHlwZW9mIGF0b20ucGFja2FnZXMuaGFzQWN0aXZhdGVkSW5pdGlhbFBhY2thZ2VzID09ICdmdW5jdGlvbicgYW5kXG4gICAgICAgIGF0b20ucGFja2FnZXMuaGFzQWN0aXZhdGVkSW5pdGlhbFBhY2thZ2VzKClcbiAgICAgIEBsb2FkKClcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICAgIEBsb2FkKClcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBwcm92aWRlci5kaXNwb3NlKCkgaWYgQHByb3ZpZGVyXG4gICAgQGluc3RhbGxhdGlvbi5kZXN0cm95KCkgaWYgQGluc3RhbGxhdGlvblxuXG4gIGdldFByb3ZpZGVyOiAtPlxuICAgIHJldHVybiBAcHJvdmlkZXJcblxuICBnZXRIeXBlcmNsaWNrUHJvdmlkZXI6IC0+XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vaHlwZXJjbGljay1wcm92aWRlcicpXG5cbiAgY29uc3VtZVNuaXBwZXRzOiAoc25pcHBldHNNYW5hZ2VyKSAtPlxuICAgIGRpc3Bvc2FibGUgPSBAZW1pdHRlci5vbiAnZGlkLWxvYWQtcHJvdmlkZXInLCA9PlxuICAgICAgQHByb3ZpZGVyLnNldFNuaXBwZXRzTWFuYWdlciBzbmlwcGV0c01hbmFnZXJcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgcGF0Y2hLaXRlQ29tcGxldGlvbnM6IChraXRlKSAtPlxuICAgIHJldHVybiBpZiBAa2l0ZVBhY2thZ2U/XG5cbiAgICBAa2l0ZVBhY2thZ2UgPSBraXRlLm1haW5Nb2R1bGVcbiAgICBAa2l0ZVByb3ZpZGVyID0gQGtpdGVQYWNrYWdlLmNvbXBsZXRpb25zKClcbiAgICBnZXRTdWdnZXN0aW9ucyA9IEBraXRlUHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnNcbiAgICBAa2l0ZVByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zID0gKGFyZ3MuLi4pID0+XG4gICAgICBnZXRTdWdnZXN0aW9ucz8uYXBwbHkoQGtpdGVQcm92aWRlciwgYXJncylcbiAgICAgID8udGhlbiAoc3VnZ2VzdGlvbnMpID0+XG4gICAgICAgIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNcbiAgICAgICAgQGtpdGVTdWdnZXN0ZWQgPSBzdWdnZXN0aW9ucz9cbiAgICAgICAgc3VnZ2VzdGlvbnNcbiAgICAgID8uY2F0Y2ggKGVycikgPT5cbiAgICAgICAgQGxhc3RLaXRlU3VnZ2VzdGlvbnMgPSBbXVxuICAgICAgICBAa2l0ZVN1Z2dlc3RlZCA9IGZhbHNlXG4gICAgICAgIHRocm93IGVyclxuIl19
