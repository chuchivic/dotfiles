(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
        title: 'Use Kite-powered Completions (macOS only)',
        description: 'Kite is a cloud powered autocomplete engine. It provides\nsignificantly more autocomplete suggestions than the local Jedi engine.'
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
      var AccountManager, AtomHelper, DecisionMaker, Installation, Installer, StateController, checkKiteInstallation, dm, editorCfg, event, firstInstall, longRunning, pluginCfg, ref2;
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
      ref2 = require('kite-installer'), AccountManager = ref2.AccountManager, AtomHelper = ref2.AtomHelper, DecisionMaker = ref2.DecisionMaker, Installation = ref2.Installation, Installer = ref2.Installer, Metrics = ref2.Metrics, Logger = ref2.Logger, StateController = ref2.StateController;
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
      dm = new DecisionMaker(editorCfg, pluginCfg);
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
          var canInstall, throttle;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          throttle = dm.shouldOfferKite(event);
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([throttle, canInstall]).then(function(values) {
              var installer, pane, projectPath, root, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = values[0];
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                _this.track("account created");
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                _this.track("flow aborted");
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
                _this.track("skipped kite");
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (err.type === 'denied') {
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
    trackCompletions: function() {
      var promises;
      promises = [atom.packages.activatePackage('autocomplete-plus')];
      if (atom.packages.getLoadedPackage('kite') != null) {
        this.disposables.add(atom.config.observe('kite.loggingLevel', function(level) {
          return Logger.LEVEL = Logger.LEVELS[(level != null ? level : 'info').toUpperCase()];
        }));
        promises.push(atom.packages.activatePackage('kite'));
        Metrics.Tracker.name = "atom kite+acp";
      }
      return Promise.all(promises).then((function(_this) {
        return function(arg) {
          var autocompleteManager, autocompletePlus, kite, safeConfirm, safeDisplaySuggestions;
          autocompletePlus = arg[0], kite = arg[1];
          if (kite != null) {
            _this.patchKiteCompletions(kite);
          }
          autocompleteManager = autocompletePlus.mainModule.getAutocompleteManager();
          if (!((autocompleteManager != null) && (autocompleteManager.confirm != null) && (autocompleteManager.displaySuggestions != null))) {
            return;
          }
          safeConfirm = autocompleteManager.confirm;
          safeDisplaySuggestions = autocompleteManager.displaySuggestions;
          autocompleteManager.displaySuggestions = function(suggestions, options) {
            _this.trackSuggestions(suggestions, autocompleteManager.editor);
            return safeDisplaySuggestions.call(autocompleteManager, suggestions, options);
          };
          return autocompleteManager.confirm = function(suggestion) {
            _this.trackUsedSuggestion(suggestion, autocompleteManager.editor);
            return safeConfirm.call(autocompleteManager, suggestion);
          };
        };
      })(this));
    },
    trackSuggestions: function(suggestions, editor) {
      var hasJediSuggestions, hasKiteSuggestions;
      if (/\.py$/.test(editor.getPath()) && (this.kiteProvider != null)) {
        hasKiteSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.kiteProvider;
          };
        })(this));
        hasJediSuggestions = suggestions.some((function(_this) {
          return function(s) {
            return s.provider === _this.provider;
          };
        })(this));
        if (hasKiteSuggestions && hasJediSuggestions) {
          return this.track('Atom shows both Kite and Jedi completions');
        } else if (hasKiteSuggestions) {
          return this.track('Atom shows Kite but not Jedi completions');
        } else if (hasJediSuggestions) {
          return this.track('Atom shows Jedi but not Kite completions');
        } else {
          return this.track('Atom shows neither Kite nor Jedi completions');
        }
      }
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
    },
    trackUsedSuggestion: function(suggestion, editor) {
      var altSuggestion;
      if (/\.py$/.test(editor.getPath())) {
        if (this.kiteProvider != null) {
          if (this.lastKiteSuggestions != null) {
            if (indexOf.call(this.lastKiteSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.provider.lastSuggestions || []);
              if (altSuggestion != null) {
                return this.track('used completion returned by Kite but also returned by Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion),
                  jediHasDocumentation: this.hasDocumentation(altSuggestion)
                });
              } else {
                return this.track('used completion returned by Kite but not Jedi', {
                  kiteHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
              altSuggestion = this.hasSameSuggestion(suggestion, this.lastKiteSuggestions);
              if (altSuggestion != null) {
                return this.track('used completion returned by Jedi but also returned by Kite', {
                  kiteHasDocumentation: this.hasDocumentation(altSuggestion),
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                if (this.kitePackage.isEditorWhitelisted != null) {
                  if (this.kitePackage.isEditorWhitelisted(editor)) {
                    return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  } else {
                    return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                      jediHasDocumentation: this.hasDocumentation(suggestion)
                    });
                  }
                } else {
                  return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                    jediHasDocumentation: this.hasDocumentation(suggestion)
                  });
                }
              }
            } else {
              return this.track('used completion from neither Kite nor Jedi');
            }
          } else {
            if (this.kitePackage.isEditorWhitelisted != null) {
              if (this.kitePackage.isEditorWhitelisted(editor)) {
                return this.track('used completion returned by Jedi but not Kite (whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              } else {
                return this.track('used completion returned by Jedi but not Kite (non-whitelisted filepath)', {
                  jediHasDocumentation: this.hasDocumentation(suggestion)
                });
              }
            } else {
              return this.track('used completion returned by Jedi but not Kite (not-whitelisted filepath)', {
                jediHasDocumentation: this.hasDocumentation(suggestion)
              });
            }
          }
        } else {
          if (this.provider.lastSuggestions && indexOf.call(this.provider.lastSuggestions, suggestion) >= 0) {
            return this.track('used completion returned by Jedi', {
              jediHasDocumentation: this.hasDocumentation(suggestion)
            });
          } else {
            return this.track('used completion not returned by Jedi');
          }
        }
      }
    },
    hasSameSuggestion: function(suggestion, suggestions) {
      return suggestions.filter(function(s) {
        return s.text === suggestion.text;
      })[0];
    },
    hasDocumentation: function(suggestion) {
      return ((suggestion.description != null) && suggestion.description !== '') || ((suggestion.descriptionMarkdown != null) && suggestion.descriptionMarkdown !== '');
    },
    track: function(msg, data) {
      var e;
      try {
        return Metrics.Tracker.trackEvent(msg, data);
      } catch (error) {
        e = error;
        if (e instanceof TypeError) {
          return console.error(e);
        } else {
          throw e;
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFFdEIsT0FBb0IsRUFBcEIsRUFBQyxpQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxLQUFQLEdBQWU7O0VBQ2YsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8sMkNBSFA7UUFJQSxXQUFBLEVBQWEsbUlBSmI7T0FERjtNQU9BLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLG1CQUhQO1FBSUEsV0FBQSxFQUFhLGdEQUpiO09BUkY7TUFhQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFVBQWhCLENBSE47UUFJQSxLQUFBLEVBQU8sa0NBSlA7UUFLQSxXQUFBLEVBQWEseVJBTGI7T0FkRjtNQXdCQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMs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QUFBQTtlQUNFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBaEIsQ0FBMkIsR0FBM0IsRUFBZ0MsSUFBaEMsRUFERjtPQUFBLGFBQUE7UUFFTTtRQUVKLElBQUcsQ0FBQSxZQUFhLFNBQWhCO2lCQUNFLE9BQU8sQ0FBQyxLQUFSLENBQWMsQ0FBZCxFQURGO1NBQUEsTUFBQTtBQUdFLGdCQUFNLEVBSFI7U0FKRjs7SUFESyxDQS9YUDs7QUFSRiIsInNvdXJjZXNDb250ZW50IjpbIm9zID0gcmVxdWlyZSAnb3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbltNZXRyaWNzLCBMb2dnZXJdID0gW11cblxud2luZG93LkRFQlVHID0gZmFsc2Vcbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOlxuICAgIHVzZUtpdGU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAwXG4gICAgICB0aXRsZTogJ1VzZSBLaXRlLXBvd2VyZWQgQ29tcGxldGlvbnMgKG1hY09TIG9ubHkpJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0tpdGUgaXMgYSBjbG91ZCBwb3dlcmVkIGF1dG9jb21wbGV0ZSBlbmdpbmUuIEl0IHByb3ZpZGVzXG4gICAgICBzaWduaWZpY2FudGx5IG1vcmUgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zIHRoYW4gdGhlIGxvY2FsIEplZGkgZW5naW5lLicnJ1xuICAgIHNob3dEZXNjcmlwdGlvbnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAxXG4gICAgICB0aXRsZTogJ1Nob3cgRGVzY3JpcHRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGRvYyBzdHJpbmdzIGZyb20gZnVuY3Rpb25zLCBjbGFzc2VzLCBldGMuJ1xuICAgIHVzZVNuaXBwZXRzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdub25lJ1xuICAgICAgb3JkZXI6IDJcbiAgICAgIGVudW06IFsnbm9uZScsICdhbGwnLCAncmVxdWlyZWQnXVxuICAgICAgdGl0bGU6ICdBdXRvY29tcGxldGUgRnVuY3Rpb24gUGFyYW1ldGVycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydBdXRvbWF0aWNhbGx5IGNvbXBsZXRlIGZ1bmN0aW9uIGFyZ3VtZW50cyBhZnRlciB0eXBpbmdcbiAgICAgIGxlZnQgcGFyZW50aGVzaXMgY2hhcmFjdGVyLiBVc2UgY29tcGxldGlvbiBrZXkgdG8ganVtcCBiZXR3ZWVuXG4gICAgICBhcmd1bWVudHMuIFNlZSBgYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHNgIGNvbW1hbmQgaWYgeW91XG4gICAgICB3YW50IHRvIHRyaWdnZXIgYXJndW1lbnQgY29tcGxldGlvbnMgbWFudWFsbHkuIFNlZSBSRUFETUUgaWYgaXQgZG9lcyBub3RcbiAgICAgIHdvcmsgZm9yIHlvdS4nJydcbiAgICBweXRob25QYXRoczpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgb3JkZXI6IDNcbiAgICAgIHRpdGxlOiAnUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnT3B0aW9uYWwgc2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIHBhdGhzIHRvIHB5dGhvblxuICAgICAgZXhlY3V0YWJsZXMgKGluY2x1ZGluZyBleGVjdXRhYmxlIG5hbWVzKSwgd2hlcmUgdGhlIGZpcnN0IG9uZSB3aWxsIHRha2VcbiAgICAgIGhpZ2hlciBwcmlvcml0eSBvdmVyIHRoZSBsYXN0IG9uZS4gQnkgZGVmYXVsdCBhdXRvY29tcGxldGUtcHl0aG9uIHdpbGxcbiAgICAgIGF1dG9tYXRpY2FsbHkgbG9vayBmb3IgdmlydHVhbCBlbnZpcm9ubWVudHMgaW5zaWRlIG9mIHlvdXIgcHJvamVjdCBhbmRcbiAgICAgIHRyeSB0byB1c2UgdGhlbSBhcyB3ZWxsIGFzIHRyeSB0byBmaW5kIGdsb2JhbCBweXRob24gZXhlY3V0YWJsZS4gSWYgeW91XG4gICAgICB1c2UgdGhpcyBjb25maWcsIGF1dG9tYXRpYyBsb29rdXAgd2lsbCBoYXZlIGxvd2VzdCBwcmlvcml0eS5cbiAgICAgIFVzZSBgJFBST0pFQ1RgIG9yIGAkUFJPSkVDVF9OQU1FYCBzdWJzdGl0dXRpb24gZm9yIHByb2plY3Qtc3BlY2lmaWNcbiAgICAgIHBhdGhzIHRvIHBvaW50IG9uIGV4ZWN1dGFibGVzIGluIHZpcnR1YWwgZW52aXJvbm1lbnRzLlxuICAgICAgRm9yIGV4YW1wbGU6XG4gICAgICBgL1VzZXJzL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvYmluL3B5dGhvbjskUFJPSkVDVC92ZW52L2Jpbi9weXRob24zOy91c3IvYmluL3B5dGhvbmAuXG4gICAgICBTdWNoIGNvbmZpZyB3aWxsIGZhbGwgYmFjayBvbiBgL3Vzci9iaW4vcHl0aG9uYCBmb3IgcHJvamVjdHMgbm90IHByZXNlbnRlZFxuICAgICAgd2l0aCBzYW1lIG5hbWUgaW4gYC52aXJ0dWFsZW52c2AgYW5kIHdpdGhvdXQgYHZlbnZgIGZvbGRlciBpbnNpZGUgb2Ygb25lXG4gICAgICBvZiBwcm9qZWN0IGZvbGRlcnMuXG4gICAgICBJZiB5b3UgYXJlIHVzaW5nIHB5dGhvbjMgZXhlY3V0YWJsZSB3aGlsZSBjb2RpbmcgZm9yIHB5dGhvbjIgeW91IHdpbGwgZ2V0XG4gICAgICBweXRob24yIGNvbXBsZXRpb25zIGZvciBzb21lIGJ1aWx0LWlucy4nJydcbiAgICBleHRyYVBhdGhzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBvcmRlcjogNFxuICAgICAgdGl0bGU6ICdFeHRyYSBQYXRocyBGb3IgUGFja2FnZXMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VtaWNvbG9uIHNlcGFyYXRlZCBsaXN0IG9mIG1vZHVsZXMgdG8gYWRkaXRpb25hbGx5XG4gICAgICBpbmNsdWRlIGZvciBhdXRvY29tcGxldGUuIFlvdSBjYW4gdXNlIHNhbWUgc3Vic3RpdHV0aW9ucyBhcyBpblxuICAgICAgYFB5dGhvbiBFeGVjdXRhYmxlIFBhdGhzYC5cbiAgICAgIE5vdGUgdGhhdCBpdCBzdGlsbCBzaG91bGQgYmUgdmFsaWQgcHl0aG9uIHBhY2thZ2UuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAkUFJPSkVDVC9lbnYvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYFxuICAgICAgb3JcbiAgICAgIGAvVXNlci9uYW1lLy52aXJ0dWFsZW52cy8kUFJPSkVDVF9OQU1FL2xpYi9weXRob24yLjcvc2l0ZS1wYWNrYWdlc2AuXG4gICAgICBZb3UgZG9uJ3QgbmVlZCB0byBzcGVjaWZ5IGV4dHJhIHBhdGhzIGZvciBsaWJyYXJpZXMgaW5zdGFsbGVkIHdpdGggcHl0aG9uXG4gICAgICBleGVjdXRhYmxlIHlvdSB1c2UuJycnXG4gICAgY2FzZUluc2Vuc2l0aXZlQ29tcGxldGlvbjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDVcbiAgICAgIHRpdGxlOiAnQ2FzZSBJbnNlbnNpdGl2ZSBDb21wbGV0aW9uJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgY29tcGxldGlvbiBpcyBieSBkZWZhdWx0IGNhc2UgaW5zZW5zaXRpdmUuJ1xuICAgIHRyaWdnZXJDb21wbGV0aW9uUmVnZXg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJyhbXFwuXFwgKF18W2EtekEtWl9dW2EtekEtWjAtOV9dKiknXG4gICAgICBvcmRlcjogNlxuICAgICAgdGl0bGU6ICdSZWdleCBUbyBUcmlnZ2VyIEF1dG9jb21wbGV0aW9ucydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydCeSBkZWZhdWx0IGNvbXBsZXRpb25zIHRyaWdnZXJlZCBhZnRlciB3b3JkcywgZG90cywgc3BhY2VzXG4gICAgICBhbmQgbGVmdCBwYXJlbnRoZXNpcy4gWW91IHdpbGwgbmVlZCB0byByZXN0YXJ0IHlvdXIgZWRpdG9yIGFmdGVyIGNoYW5naW5nXG4gICAgICB0aGlzLicnJ1xuICAgIGZ1enp5TWF0Y2hlcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDdcbiAgICAgIHRpdGxlOiAnVXNlIEZ1enp5IE1hdGNoZXIgRm9yIENvbXBsZXRpb25zLidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydUeXBpbmcgYHN0ZHJgIHdpbGwgbWF0Y2ggYHN0ZGVycmAuXG4gICAgICBGaXJzdCBjaGFyYWN0ZXIgc2hvdWxkIGFsd2F5cyBtYXRjaC4gVXNlcyBhZGRpdGlvbmFsIGNhY2hpbmcgdGh1c1xuICAgICAgY29tcGxldGlvbnMgc2hvdWxkIGJlIGZhc3Rlci4gTm90ZSB0aGF0IHRoaXMgc2V0dGluZyBkb2VzIG5vdCBhZmZlY3RcbiAgICAgIGJ1aWx0LWluIGF1dG9jb21wbGV0ZS1wbHVzIHByb3ZpZGVyLicnJ1xuICAgIG91dHB1dFByb3ZpZGVyRXJyb3JzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDhcbiAgICAgIHRpdGxlOiAnT3V0cHV0IFByb3ZpZGVyIEVycm9ycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIHRoZSBwcm92aWRlciBlcnJvcnMgd2hlblxuICAgICAgdGhleSBoYXBwZW4uIEJ5IGRlZmF1bHQgdGhleSBhcmUgaGlkZGVuLiBOb3RlIHRoYXQgY3JpdGljYWwgZXJyb3JzIGFyZVxuICAgICAgYWx3YXlzIHNob3duLicnJ1xuICAgIG91dHB1dERlYnVnOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDlcbiAgICAgIHRpdGxlOiAnT3V0cHV0IERlYnVnIExvZ3MnXG4gICAgICBkZXNjcmlwdGlvbjogJycnU2VsZWN0IGlmIHlvdSB3b3VsZCBsaWtlIHRvIHNlZSBkZWJ1ZyBpbmZvcm1hdGlvbiBpblxuICAgICAgZGV2ZWxvcGVyIHRvb2xzIGxvZ3MuIE1heSBzbG93IGRvd24geW91ciBlZGl0b3IuJycnXG4gICAgc2hvd1Rvb2x0aXBzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDEwXG4gICAgICB0aXRsZTogJ1Nob3cgVG9vbHRpcHMgd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgb2JqZWN0IHVuZGVyIHRoZSBjdXJzb3InXG4gICAgICBkZXNjcmlwdGlvbjogJycnRVhQRVJJTUVOVEFMIEZFQVRVUkUgV0hJQ0ggSVMgTk9UIEZJTklTSEVEIFlFVC5cbiAgICAgIEZlZWRiYWNrIGFuZCBpZGVhcyBhcmUgd2VsY29tZSBvbiBnaXRodWIuJycnXG4gICAgc3VnZ2VzdGlvblByaW9yaXR5OlxuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAzXG4gICAgICBtaW5pbXVtOiAwXG4gICAgICBtYXhpbXVtOiA5OVxuICAgICAgb3JkZXI6IDExXG4gICAgICB0aXRsZTogJ1N1Z2dlc3Rpb24gUHJpb3JpdHknXG4gICAgICBkZXNjcmlwdGlvbjogJycnWW91IGNhbiB1c2UgdGhpcyB0byBzZXQgdGhlIHByaW9yaXR5IGZvciBhdXRvY29tcGxldGUtcHl0aG9uXG4gICAgICBzdWdnZXN0aW9ucy4gRm9yIGV4YW1wbGUsIHlvdSBjYW4gdXNlIGxvd2VyIHZhbHVlIHRvIGdpdmUgaGlnaGVyIHByaW9yaXR5XG4gICAgICBmb3Igc25pcHBldHMgY29tcGxldGlvbnMgd2hpY2ggaGFzIHByaW9yaXR5IG9mIDIuJycnXG5cbiAgaW5zdGFsbGF0aW9uOiBudWxsXG5cbiAgX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudDogKGdyYW1tYXIpIC0+XG4gICAgIyB0aGlzIHNob3VsZCBiZSBzYW1lIHdpdGggYWN0aXZhdGlvbkhvb2tzIG5hbWVzXG4gICAgaWYgZ3JhbW1hci5wYWNrYWdlTmFtZSBpbiBbJ2xhbmd1YWdlLXB5dGhvbicsICdNYWdpY1B5dGhvbicsICdhdG9tLWRqYW5nbyddXG4gICAgICBAcHJvdmlkZXIubG9hZCgpXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtbG9hZC1wcm92aWRlcidcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBfbG9hZEtpdGU6IC0+XG4gICAgZmlyc3RJbnN0YWxsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2F1dG9jb21wbGV0ZS1weXRob24uaW5zdGFsbGVkJykgPT0gbnVsbFxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcsIHRydWUpXG4gICAgbG9uZ1J1bm5pbmcgPSByZXF1aXJlKCdwcm9jZXNzJykudXB0aW1lKCkgPiAxMFxuICAgIGlmIGZpcnN0SW5zdGFsbCBhbmQgbG9uZ1J1bm5pbmdcbiAgICAgIGV2ZW50ID0gXCJpbnN0YWxsZWRcIlxuICAgIGVsc2UgaWYgZmlyc3RJbnN0YWxsXG4gICAgICBldmVudCA9IFwidXBncmFkZWRcIlxuICAgIGVsc2VcbiAgICAgIGV2ZW50ID0gXCJyZXN0YXJ0ZWRcIlxuXG4gICAge1xuICAgICAgQWNjb3VudE1hbmFnZXIsXG4gICAgICBBdG9tSGVscGVyLFxuICAgICAgRGVjaXNpb25NYWtlcixcbiAgICAgIEluc3RhbGxhdGlvbixcbiAgICAgIEluc3RhbGxlcixcbiAgICAgIE1ldHJpY3MsXG4gICAgICBMb2dnZXIsXG4gICAgICBTdGF0ZUNvbnRyb2xsZXJcbiAgICB9ID0gcmVxdWlyZSAna2l0ZS1pbnN0YWxsZXInXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2tpdGUubG9nZ2luZ0xldmVsJylcbiAgICAgIExvZ2dlci5MRVZFTCA9IExvZ2dlci5MRVZFTFNbYXRvbS5jb25maWcuZ2V0KCdraXRlLmxvZ2dpbmdMZXZlbCcpLnRvVXBwZXJDYXNlKCldXG5cbiAgICBBY2NvdW50TWFuYWdlci5pbml0Q2xpZW50ICdhbHBoYS5raXRlLmNvbScsIC0xLCB0cnVlXG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIgSW5zdGFsbGF0aW9uLCAobSkgLT4gbS5lbGVtZW50XG4gICAgZWRpdG9yQ2ZnID1cbiAgICAgIFVVSUQ6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtZXRyaWNzLnVzZXJJZCcpXG4gICAgICBuYW1lOiAnYXRvbSdcbiAgICBwbHVnaW5DZmcgPVxuICAgICAgbmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG4gICAgZG0gPSBuZXcgRGVjaXNpb25NYWtlciBlZGl0b3JDZmcsIHBsdWdpbkNmZ1xuXG4gICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20gYWNwXCJcbiAgICBNZXRyaWNzLmVuYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUudGVsZW1ldHJ5Q29uc2VudCcpIGlzICdsaW1pdGVkJ1xuXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSA9PlxuICAgICAgaWYgcGtnLm5hbWUgaXMgJ2tpdGUnXG4gICAgICAgIEBwYXRjaEtpdGVDb21wbGV0aW9ucyhwa2cpXG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGtpdGUrYWNwXCJcblxuICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbiA9ICgpID0+XG4gICAgICBpZiBub3QgYXRvbS5jb25maWcuZ2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnXG4gICAgICAgIHJldHVyblxuICAgICAgY2FuSW5zdGFsbCA9IFN0YXRlQ29udHJvbGxlci5jYW5JbnN0YWxsS2l0ZSgpXG4gICAgICB0aHJvdHRsZSA9IGRtLnNob3VsZE9mZmVyS2l0ZShldmVudClcbiAgICAgIFByb21pc2UuYWxsKFt0aHJvdHRsZSwgY2FuSW5zdGFsbF0pLnRoZW4oKHZhbHVlcykgPT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCB0cnVlXG4gICAgICAgIHZhcmlhbnQgPSB2YWx1ZXNbMF1cbiAgICAgICAgTWV0cmljcy5UcmFja2VyLnByb3BzID0gdmFyaWFudFxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIucHJvcHMubGFzdEV2ZW50ID0gZXZlbnRcbiAgICAgICAgdGl0bGUgPSBcIkNob29zZSBhIGF1dG9jb21wbGV0ZS1weXRob24gZW5naW5lXCJcbiAgICAgICAgQGluc3RhbGxhdGlvbiA9IG5ldyBJbnN0YWxsYXRpb24gdmFyaWFudCwgdGl0bGVcbiAgICAgICAgQGluc3RhbGxhdGlvbi5hY2NvdW50Q3JlYXRlZCgoKSA9PlxuICAgICAgICAgIEB0cmFjayBcImFjY291bnQgY3JlYXRlZFwiXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCB0cnVlXG4gICAgICAgIClcbiAgICAgICAgQGluc3RhbGxhdGlvbi5mbG93U2tpcHBlZCgoKSA9PlxuICAgICAgICAgIEB0cmFjayBcImZsb3cgYWJvcnRlZFwiXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICApXG4gICAgICAgIFtwcm9qZWN0UGF0aF0gPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgICByb290ID0gaWYgcHJvamVjdFBhdGg/IGFuZCBwYXRoLnJlbGF0aXZlKG9zLmhvbWVkaXIoKSwgcHJvamVjdFBhdGgpLmluZGV4T2YoJy4uJykgaXMgMFxuICAgICAgICAgIHBhdGgucGFyc2UocHJvamVjdFBhdGgpLnJvb3RcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG9zLmhvbWVkaXIoKVxuXG4gICAgICAgIGluc3RhbGxlciA9IG5ldyBJbnN0YWxsZXIoW3Jvb3RdKVxuICAgICAgICBpbnN0YWxsZXIuaW5pdCBAaW5zdGFsbGF0aW9uLmZsb3csIC0+XG4gICAgICAgICAgTG9nZ2VyLnZlcmJvc2UoJ2luIG9uRmluaXNoJylcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgna2l0ZScpXG5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmZsb3cub25Ta2lwSW5zdGFsbCAoKSA9PlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICAgICBAdHJhY2sgXCJza2lwcGVkIGtpdGVcIlxuICAgICAgICAgIHBhbmUuZGVzdHJveUFjdGl2ZUl0ZW0oKVxuICAgICAgICBwYW5lLmFkZEl0ZW0gQGluc3RhbGxhdGlvbiwgaW5kZXg6IDBcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4IDBcbiAgICAgICwgKGVycikgPT5cbiAgICAgICAgaWYgZXJyLnR5cGUgPT0gJ2RlbmllZCdcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICApIGlmIGF0b20uY29uZmlnLmdldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJ1xuXG4gICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uKClcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCAoeyBuZXdWYWx1ZSwgb2xkVmFsdWUgfSkgLT5cbiAgICAgIGlmIG5ld1ZhbHVlXG4gICAgICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbigpXG4gICAgICAgIEF0b21IZWxwZXIuZW5hYmxlUGFja2FnZSgpXG4gICAgICBlbHNlXG4gICAgICAgIEF0b21IZWxwZXIuZGlzYWJsZVBhY2thZ2UoKVxuXG4gIGxvYWQ6IC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBkaXNwb3NhYmxlID0gYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IuZ2V0R3JhbW1hcigpKVxuICAgICAgZGlzcG9zYWJsZSA9IGVkaXRvci5vbkRpZENoYW5nZUdyYW1tYXIgKGdyYW1tYXIpID0+XG4gICAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGdyYW1tYXIpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVcbiAgICBAX2xvYWRLaXRlKClcbiAgICAjIEB0cmFja0NvbXBsZXRpb25zKClcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAcHJvdmlkZXIgPSByZXF1aXJlKCcuL3Byb3ZpZGVyJylcbiAgICBpZiB0eXBlb2YgYXRvbS5wYWNrYWdlcy5oYXNBY3RpdmF0ZWRJbml0aWFsUGFja2FnZXMgPT0gJ2Z1bmN0aW9uJyBhbmRcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5oYXNBY3RpdmF0ZWRJbml0aWFsUGFja2FnZXMoKVxuICAgICAgQGxvYWQoKVxuICAgIGVsc2VcbiAgICAgIGRpc3Bvc2FibGUgPSBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMgPT5cbiAgICAgICAgQGxvYWQoKVxuICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHByb3ZpZGVyLmRpc3Bvc2UoKSBpZiBAcHJvdmlkZXJcbiAgICBAaW5zdGFsbGF0aW9uLmRlc3Ryb3koKSBpZiBAaW5zdGFsbGF0aW9uXG5cbiAgZ2V0UHJvdmlkZXI6IC0+XG4gICAgcmV0dXJuIEBwcm92aWRlclxuXG4gIGdldEh5cGVyY2xpY2tQcm92aWRlcjogLT5cbiAgICByZXR1cm4gcmVxdWlyZSgnLi9oeXBlcmNsaWNrLXByb3ZpZGVyJylcblxuICBjb25zdW1lU25pcHBldHM6IChzbmlwcGV0c01hbmFnZXIpIC0+XG4gICAgZGlzcG9zYWJsZSA9IEBlbWl0dGVyLm9uICdkaWQtbG9hZC1wcm92aWRlcicsID0+XG4gICAgICBAcHJvdmlkZXIuc2V0U25pcHBldHNNYW5hZ2VyIHNuaXBwZXRzTWFuYWdlclxuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICB0cmFja0NvbXBsZXRpb25zOiAtPlxuICAgIHByb21pc2VzID0gW2F0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpXVxuXG4gICAgaWYgYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdraXRlJyk/XG5cbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAna2l0ZS5sb2dnaW5nTGV2ZWwnLCAobGV2ZWwpIC0+XG4gICAgICAgIExvZ2dlci5MRVZFTCA9IExvZ2dlci5MRVZFTFNbKGxldmVsID8gJ2luZm8nKS50b1VwcGVyQ2FzZSgpXVxuXG4gICAgICBwcm9taXNlcy5wdXNoKGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdraXRlJykpXG4gICAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBraXRlK2FjcFwiXG5cbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbiAoW2F1dG9jb21wbGV0ZVBsdXMsIGtpdGVdKSA9PlxuICAgICAgaWYga2l0ZT9cbiAgICAgICAgQHBhdGNoS2l0ZUNvbXBsZXRpb25zKGtpdGUpXG5cbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIgPSBhdXRvY29tcGxldGVQbHVzLm1haW5Nb2R1bGUuZ2V0QXV0b2NvbXBsZXRlTWFuYWdlcigpXG5cbiAgICAgIHJldHVybiB1bmxlc3MgYXV0b2NvbXBsZXRlTWFuYWdlcj8gYW5kIGF1dG9jb21wbGV0ZU1hbmFnZXIuY29uZmlybT8gYW5kIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zP1xuXG4gICAgICBzYWZlQ29uZmlybSA9IGF1dG9jb21wbGV0ZU1hbmFnZXIuY29uZmlybVxuICAgICAgc2FmZURpc3BsYXlTdWdnZXN0aW9ucyA9IGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucyA9IChzdWdnZXN0aW9ucywgb3B0aW9ucykgPT5cbiAgICAgICAgQHRyYWNrU3VnZ2VzdGlvbnMoc3VnZ2VzdGlvbnMsIGF1dG9jb21wbGV0ZU1hbmFnZXIuZWRpdG9yKVxuICAgICAgICBzYWZlRGlzcGxheVN1Z2dlc3Rpb25zLmNhbGwoYXV0b2NvbXBsZXRlTWFuYWdlciwgc3VnZ2VzdGlvbnMsIG9wdGlvbnMpXG5cbiAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuY29uZmlybSA9IChzdWdnZXN0aW9uKSA9PlxuICAgICAgICBAdHJhY2tVc2VkU3VnZ2VzdGlvbihzdWdnZXN0aW9uLCBhdXRvY29tcGxldGVNYW5hZ2VyLmVkaXRvcilcbiAgICAgICAgc2FmZUNvbmZpcm0uY2FsbChhdXRvY29tcGxldGVNYW5hZ2VyLCBzdWdnZXN0aW9uKVxuXG4gIHRyYWNrU3VnZ2VzdGlvbnM6IChzdWdnZXN0aW9ucywgZWRpdG9yKSAtPlxuICAgIGlmIC9cXC5weSQvLnRlc3QoZWRpdG9yLmdldFBhdGgoKSkgYW5kIEBraXRlUHJvdmlkZXI/XG4gICAgICBoYXNLaXRlU3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5zb21lIChzKSA9PiBzLnByb3ZpZGVyIGlzIEBraXRlUHJvdmlkZXJcbiAgICAgIGhhc0plZGlTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLnNvbWUgKHMpID0+IHMucHJvdmlkZXIgaXMgQHByb3ZpZGVyXG5cbiAgICAgIGlmIGhhc0tpdGVTdWdnZXN0aW9ucyBhbmQgaGFzSmVkaVN1Z2dlc3Rpb25zXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBib3RoIEtpdGUgYW5kIEplZGkgY29tcGxldGlvbnMnXG4gICAgICBlbHNlIGlmIGhhc0tpdGVTdWdnZXN0aW9uc1xuICAgICAgICBAdHJhY2sgJ0F0b20gc2hvd3MgS2l0ZSBidXQgbm90IEplZGkgY29tcGxldGlvbnMnXG4gICAgICBlbHNlIGlmIGhhc0plZGlTdWdnZXN0aW9uc1xuICAgICAgICBAdHJhY2sgJ0F0b20gc2hvd3MgSmVkaSBidXQgbm90IEtpdGUgY29tcGxldGlvbnMnXG4gICAgICBlbHNlXG4gICAgICAgIEB0cmFjayAnQXRvbSBzaG93cyBuZWl0aGVyIEtpdGUgbm9yIEplZGkgY29tcGxldGlvbnMnXG5cbiAgcGF0Y2hLaXRlQ29tcGxldGlvbnM6IChraXRlKSAtPlxuICAgIHJldHVybiBpZiBAa2l0ZVBhY2thZ2U/XG5cbiAgICBAa2l0ZVBhY2thZ2UgPSBraXRlLm1haW5Nb2R1bGVcbiAgICBAa2l0ZVByb3ZpZGVyID0gQGtpdGVQYWNrYWdlLmNvbXBsZXRpb25zKClcbiAgICBnZXRTdWdnZXN0aW9ucyA9IEBraXRlUHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnNcbiAgICBAa2l0ZVByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zID0gKGFyZ3MuLi4pID0+XG4gICAgICBnZXRTdWdnZXN0aW9ucz8uYXBwbHkoQGtpdGVQcm92aWRlciwgYXJncylcbiAgICAgID8udGhlbiAoc3VnZ2VzdGlvbnMpID0+XG4gICAgICAgIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnNcbiAgICAgICAgQGtpdGVTdWdnZXN0ZWQgPSBzdWdnZXN0aW9ucz9cbiAgICAgICAgc3VnZ2VzdGlvbnNcbiAgICAgID8uY2F0Y2ggKGVycikgPT5cbiAgICAgICAgQGxhc3RLaXRlU3VnZ2VzdGlvbnMgPSBbXVxuICAgICAgICBAa2l0ZVN1Z2dlc3RlZCA9IGZhbHNlXG4gICAgICAgIHRocm93IGVyclxuXG4gIHRyYWNrVXNlZFN1Z2dlc3Rpb246IChzdWdnZXN0aW9uLCBlZGl0b3IpIC0+XG4gICAgaWYgL1xcLnB5JC8udGVzdChlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgaWYgQGtpdGVQcm92aWRlcj9cbiAgICAgICAgaWYgQGxhc3RLaXRlU3VnZ2VzdGlvbnM/XG4gICAgICAgICAgaWYgc3VnZ2VzdGlvbiBpbiBAbGFzdEtpdGVTdWdnZXN0aW9uc1xuICAgICAgICAgICAgYWx0U3VnZ2VzdGlvbiA9IEBoYXNTYW1lU3VnZ2VzdGlvbihzdWdnZXN0aW9uLCBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zIG9yIFtdKVxuICAgICAgICAgICAgaWYgYWx0U3VnZ2VzdGlvbj9cbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgS2l0ZSBidXQgYWxzbyByZXR1cm5lZCBieSBKZWRpJywge1xuICAgICAgICAgICAgICAgIGtpdGVIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihhbHRTdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEtpdGUgYnV0IG5vdCBKZWRpJywge1xuICAgICAgICAgICAgICAgIGtpdGVIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zIGFuZCAgc3VnZ2VzdGlvbiBpbiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zXG4gICAgICAgICAgICBhbHRTdWdnZXN0aW9uID0gQGhhc1NhbWVTdWdnZXN0aW9uKHN1Z2dlc3Rpb24sIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zKVxuICAgICAgICAgICAgaWYgYWx0U3VnZ2VzdGlvbj9cbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgYWxzbyByZXR1cm5lZCBieSBLaXRlJywge1xuICAgICAgICAgICAgICAgIGtpdGVIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihhbHRTdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGlmIEBraXRlUGFja2FnZS5pc0VkaXRvcldoaXRlbGlzdGVkP1xuICAgICAgICAgICAgICAgIGlmIEBraXRlUGFja2FnZS5pc0VkaXRvcldoaXRlbGlzdGVkKGVkaXRvcilcbiAgICAgICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlICh3aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlIChub24td2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlICh3aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gZnJvbSBuZWl0aGVyIEtpdGUgbm9yIEplZGknXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBAa2l0ZVBhY2thZ2UuaXNFZGl0b3JXaGl0ZWxpc3RlZD9cbiAgICAgICAgICAgIGlmIEBraXRlUGFja2FnZS5pc0VkaXRvcldoaXRlbGlzdGVkKGVkaXRvcilcbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKHdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAobm9uLXdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlIChub3Qtd2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgIH1cbiAgICAgIGVsc2VcbiAgICAgICAgaWYgQHByb3ZpZGVyLmxhc3RTdWdnZXN0aW9ucyBhbmQgc3VnZ2VzdGlvbiBpbiBAcHJvdmlkZXIubGFzdFN1Z2dlc3Rpb25zXG4gICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaScsIHtcbiAgICAgICAgICAgIGplZGlIYXNEb2N1bWVudGF0aW9uOiBAaGFzRG9jdW1lbnRhdGlvbihzdWdnZXN0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIG5vdCByZXR1cm5lZCBieSBKZWRpJ1xuXG4gIGhhc1NhbWVTdWdnZXN0aW9uOiAoc3VnZ2VzdGlvbiwgc3VnZ2VzdGlvbnMpIC0+XG4gICAgc3VnZ2VzdGlvbnMuZmlsdGVyKChzKSAtPiBzLnRleHQgaXMgc3VnZ2VzdGlvbi50ZXh0KVswXVxuXG4gIGhhc0RvY3VtZW50YXRpb246IChzdWdnZXN0aW9uKSAtPlxuICAgIChzdWdnZXN0aW9uLmRlc2NyaXB0aW9uPyBhbmQgc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbiBpc250ICcnKSBvclxuICAgIChzdWdnZXN0aW9uLmRlc2NyaXB0aW9uTWFya2Rvd24/IGFuZCBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uTWFya2Rvd24gaXNudCAnJylcblxuICB0cmFjazogKG1zZywgZGF0YSkgLT5cbiAgICB0cnlcbiAgICAgIE1ldHJpY3MuVHJhY2tlci50cmFja0V2ZW50IG1zZywgZGF0YVxuICAgIGNhdGNoIGVcbiAgICAgICMgVE9ETzogdGhpcyBzaG91bGQgYmUgcmVtb3ZlZCBhZnRlciBraXRlLWluc3RhbGxlciBpcyBmaXhlZFxuICAgICAgaWYgZSBpbnN0YW5jZW9mIFR5cGVFcnJvclxuICAgICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVcbiJdfQ==
