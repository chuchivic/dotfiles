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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFFdEIsT0FBb0IsRUFBcEIsRUFBQyxpQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxLQUFQLEdBQWU7O0VBQ2YsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8sMkNBSFA7UUFJQSxXQUFBLEVBQWEsbUlBSmI7T0FERjtNQU9BLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLG1CQUhQO1FBSUEsV0FBQSxFQUFhLGdEQUpiO09BUkY7TUFhQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFVBQWhCLENBSE47UUFJQSxLQUFBLEVBQU8sa0NBSlA7UUFLQSxXQUFBLEVBQWEseVJBTGI7T0FkRjtNQXdCQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMs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QUMsV0FBWCxLQUE0QixFQUF6RCxDQUFBLElBQ0EsQ0FBQyx3Q0FBQSxJQUFvQyxVQUFVLENBQUMsbUJBQVgsS0FBb0MsRUFBekU7SUFGZ0IsQ0FqWWxCO0lBcVlBLEtBQUEsRUFBTyxTQUFDLEdBQUQsRUFBTSxJQUFOO0FBQ0wsVUFBQTtBQUFBO2VBQ0UsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFoQixDQUEyQixHQUEzQixFQUFnQyxJQUFoQyxFQURGO09BQUEsYUFBQTtRQUVNO1FBRUosSUFBRyxDQUFBLFlBQWEsU0FBaEI7aUJBQ0UsT0FBTyxDQUFDLEtBQVIsQ0FBYyxDQUFkLEVBREY7U0FBQSxNQUFBO0FBR0UsZ0JBQU0sRUFIUjtTQUpGOztJQURLLENBcllQOztBQVJGIiwic291cmNlc0NvbnRlbnQiOlsib3MgPSByZXF1aXJlICdvcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcblxuW01ldHJpY3MsIExvZ2dlcl0gPSBbXVxuXG53aW5kb3cuREVCVUcgPSBmYWxzZVxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgdXNlS2l0ZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDBcbiAgICAgIHRpdGxlOiAnVXNlIEtpdGUtcG93ZXJlZCBDb21wbGV0aW9ucyAobWFjT1Mgb25seSknXG4gICAgICBkZXNjcmlwdGlvbjogJycnS2l0ZSBpcyBhIGNsb3VkIHBvd2VyZWQgYXV0b2NvbXBsZXRlIGVuZ2luZS4gSXQgcHJvdmlkZXNcbiAgICAgIHNpZ25pZmljYW50bHkgbW9yZSBhdXRvY29tcGxldGUgc3VnZ2VzdGlvbnMgdGhhbiB0aGUgbG9jYWwgSmVkaSBlbmdpbmUuJycnXG4gICAgc2hvd0Rlc2NyaXB0aW9uczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDFcbiAgICAgIHRpdGxlOiAnU2hvdyBEZXNjcmlwdGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgZG9jIHN0cmluZ3MgZnJvbSBmdW5jdGlvbnMsIGNsYXNzZXMsIGV0Yy4nXG4gICAgdXNlU25pcHBldHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ25vbmUnXG4gICAgICBvcmRlcjogMlxuICAgICAgZW51bTogWydub25lJywgJ2FsbCcsICdyZXF1aXJlZCddXG4gICAgICB0aXRsZTogJ0F1dG9jb21wbGV0ZSBGdW5jdGlvbiBQYXJhbWV0ZXJzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0F1dG9tYXRpY2FsbHkgY29tcGxldGUgZnVuY3Rpb24gYXJndW1lbnRzIGFmdGVyIHR5cGluZ1xuICAgICAgbGVmdCBwYXJlbnRoZXNpcyBjaGFyYWN0ZXIuIFVzZSBjb21wbGV0aW9uIGtleSB0byBqdW1wIGJldHdlZW5cbiAgICAgIGFyZ3VtZW50cy4gU2VlIGBhdXRvY29tcGxldGUtcHl0aG9uOmNvbXBsZXRlLWFyZ3VtZW50c2AgY29tbWFuZCBpZiB5b3VcbiAgICAgIHdhbnQgdG8gdHJpZ2dlciBhcmd1bWVudCBjb21wbGV0aW9ucyBtYW51YWxseS4gU2VlIFJFQURNRSBpZiBpdCBkb2VzIG5vdFxuICAgICAgd29yayBmb3IgeW91LicnJ1xuICAgIHB5dGhvblBhdGhzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBvcmRlcjogM1xuICAgICAgdGl0bGU6ICdQeXRob24gRXhlY3V0YWJsZSBQYXRocydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydPcHRpb25hbCBzZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgcGF0aHMgdG8gcHl0aG9uXG4gICAgICBleGVjdXRhYmxlcyAoaW5jbHVkaW5nIGV4ZWN1dGFibGUgbmFtZXMpLCB3aGVyZSB0aGUgZmlyc3Qgb25lIHdpbGwgdGFrZVxuICAgICAgaGlnaGVyIHByaW9yaXR5IG92ZXIgdGhlIGxhc3Qgb25lLiBCeSBkZWZhdWx0IGF1dG9jb21wbGV0ZS1weXRob24gd2lsbFxuICAgICAgYXV0b21hdGljYWxseSBsb29rIGZvciB2aXJ0dWFsIGVudmlyb25tZW50cyBpbnNpZGUgb2YgeW91ciBwcm9qZWN0IGFuZFxuICAgICAgdHJ5IHRvIHVzZSB0aGVtIGFzIHdlbGwgYXMgdHJ5IHRvIGZpbmQgZ2xvYmFsIHB5dGhvbiBleGVjdXRhYmxlLiBJZiB5b3VcbiAgICAgIHVzZSB0aGlzIGNvbmZpZywgYXV0b21hdGljIGxvb2t1cCB3aWxsIGhhdmUgbG93ZXN0IHByaW9yaXR5LlxuICAgICAgVXNlIGAkUFJPSkVDVGAgb3IgYCRQUk9KRUNUX05BTUVgIHN1YnN0aXR1dGlvbiBmb3IgcHJvamVjdC1zcGVjaWZpY1xuICAgICAgcGF0aHMgdG8gcG9pbnQgb24gZXhlY3V0YWJsZXMgaW4gdmlydHVhbCBlbnZpcm9ubWVudHMuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAvVXNlcnMvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9iaW4vcHl0aG9uOyRQUk9KRUNUL3ZlbnYvYmluL3B5dGhvbjM7L3Vzci9iaW4vcHl0aG9uYC5cbiAgICAgIFN1Y2ggY29uZmlnIHdpbGwgZmFsbCBiYWNrIG9uIGAvdXNyL2Jpbi9weXRob25gIGZvciBwcm9qZWN0cyBub3QgcHJlc2VudGVkXG4gICAgICB3aXRoIHNhbWUgbmFtZSBpbiBgLnZpcnR1YWxlbnZzYCBhbmQgd2l0aG91dCBgdmVudmAgZm9sZGVyIGluc2lkZSBvZiBvbmVcbiAgICAgIG9mIHByb2plY3QgZm9sZGVycy5cbiAgICAgIElmIHlvdSBhcmUgdXNpbmcgcHl0aG9uMyBleGVjdXRhYmxlIHdoaWxlIGNvZGluZyBmb3IgcHl0aG9uMiB5b3Ugd2lsbCBnZXRcbiAgICAgIHB5dGhvbjIgY29tcGxldGlvbnMgZm9yIHNvbWUgYnVpbHQtaW5zLicnJ1xuICAgIGV4dHJhUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiA0XG4gICAgICB0aXRsZTogJ0V4dHJhIFBhdGhzIEZvciBQYWNrYWdlcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgbW9kdWxlcyB0byBhZGRpdGlvbmFsbHlcbiAgICAgIGluY2x1ZGUgZm9yIGF1dG9jb21wbGV0ZS4gWW91IGNhbiB1c2Ugc2FtZSBzdWJzdGl0dXRpb25zIGFzIGluXG4gICAgICBgUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHNgLlxuICAgICAgTm90ZSB0aGF0IGl0IHN0aWxsIHNob3VsZCBiZSB2YWxpZCBweXRob24gcGFja2FnZS5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYCRQUk9KRUNUL2Vudi9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgXG4gICAgICBvclxuICAgICAgYC9Vc2VyL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYC5cbiAgICAgIFlvdSBkb24ndCBuZWVkIHRvIHNwZWNpZnkgZXh0cmEgcGF0aHMgZm9yIGxpYnJhcmllcyBpbnN0YWxsZWQgd2l0aCBweXRob25cbiAgICAgIGV4ZWN1dGFibGUgeW91IHVzZS4nJydcbiAgICBjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogNVxuICAgICAgdGl0bGU6ICdDYXNlIEluc2Vuc2l0aXZlIENvbXBsZXRpb24nXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb21wbGV0aW9uIGlzIGJ5IGRlZmF1bHQgY2FzZSBpbnNlbnNpdGl2ZS4nXG4gICAgdHJpZ2dlckNvbXBsZXRpb25SZWdleDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnKFtcXC5cXCAoXXxbYS16QS1aX11bYS16QS1aMC05X10qKSdcbiAgICAgIG9yZGVyOiA2XG4gICAgICB0aXRsZTogJ1JlZ2V4IFRvIFRyaWdnZXIgQXV0b2NvbXBsZXRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0J5IGRlZmF1bHQgY29tcGxldGlvbnMgdHJpZ2dlcmVkIGFmdGVyIHdvcmRzLCBkb3RzLCBzcGFjZXNcbiAgICAgIGFuZCBsZWZ0IHBhcmVudGhlc2lzLiBZb3Ugd2lsbCBuZWVkIHRvIHJlc3RhcnQgeW91ciBlZGl0b3IgYWZ0ZXIgY2hhbmdpbmdcbiAgICAgIHRoaXMuJycnXG4gICAgZnV6enlNYXRjaGVyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogN1xuICAgICAgdGl0bGU6ICdVc2UgRnV6enkgTWF0Y2hlciBGb3IgQ29tcGxldGlvbnMuJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1R5cGluZyBgc3RkcmAgd2lsbCBtYXRjaCBgc3RkZXJyYC5cbiAgICAgIEZpcnN0IGNoYXJhY3RlciBzaG91bGQgYWx3YXlzIG1hdGNoLiBVc2VzIGFkZGl0aW9uYWwgY2FjaGluZyB0aHVzXG4gICAgICBjb21wbGV0aW9ucyBzaG91bGQgYmUgZmFzdGVyLiBOb3RlIHRoYXQgdGhpcyBzZXR0aW5nIGRvZXMgbm90IGFmZmVjdFxuICAgICAgYnVpbHQtaW4gYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIuJycnXG4gICAgb3V0cHV0UHJvdmlkZXJFcnJvcnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOFxuICAgICAgdGl0bGU6ICdPdXRwdXQgUHJvdmlkZXIgRXJyb3JzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgdGhlIHByb3ZpZGVyIGVycm9ycyB3aGVuXG4gICAgICB0aGV5IGhhcHBlbi4gQnkgZGVmYXVsdCB0aGV5IGFyZSBoaWRkZW4uIE5vdGUgdGhhdCBjcml0aWNhbCBlcnJvcnMgYXJlXG4gICAgICBhbHdheXMgc2hvd24uJycnXG4gICAgb3V0cHV0RGVidWc6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOVxuICAgICAgdGl0bGU6ICdPdXRwdXQgRGVidWcgTG9ncydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIGRlYnVnIGluZm9ybWF0aW9uIGluXG4gICAgICBkZXZlbG9wZXIgdG9vbHMgbG9ncy4gTWF5IHNsb3cgZG93biB5b3VyIGVkaXRvci4nJydcbiAgICBzaG93VG9vbHRpcHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMTBcbiAgICAgIHRpdGxlOiAnU2hvdyBUb29sdGlwcyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvYmplY3QgdW5kZXIgdGhlIGN1cnNvcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydFWFBFUklNRU5UQUwgRkVBVFVSRSBXSElDSCBJUyBOT1QgRklOSVNIRUQgWUVULlxuICAgICAgRmVlZGJhY2sgYW5kIGlkZWFzIGFyZSB3ZWxjb21lIG9uIGdpdGh1Yi4nJydcbiAgICBzdWdnZXN0aW9uUHJpb3JpdHk6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDNcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIG1heGltdW06IDk5XG4gICAgICBvcmRlcjogMTFcbiAgICAgIHRpdGxlOiAnU3VnZ2VzdGlvbiBQcmlvcml0eSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydZb3UgY2FuIHVzZSB0aGlzIHRvIHNldCB0aGUgcHJpb3JpdHkgZm9yIGF1dG9jb21wbGV0ZS1weXRob25cbiAgICAgIHN1Z2dlc3Rpb25zLiBGb3IgZXhhbXBsZSwgeW91IGNhbiB1c2UgbG93ZXIgdmFsdWUgdG8gZ2l2ZSBoaWdoZXIgcHJpb3JpdHlcbiAgICAgIGZvciBzbmlwcGV0cyBjb21wbGV0aW9ucyB3aGljaCBoYXMgcHJpb3JpdHkgb2YgMi4nJydcbiAgICBlbmFibGVUb3VjaEJhcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAxMlxuICAgICAgdGl0bGU6ICdFbmFibGUgVG91Y2ggQmFyIHN1cHBvcnQnXG4gICAgICBkZXNjcmlwdGlvbjogJycnUHJvb2Ygb2YgY29uY2VwdCBmb3Igbm93LCByZXF1aXJlcyB0b29sdGlwcyB0byBiZSBlbmFibGVkIGFuZCBBdG9tID49MS4xOS4wLicnJ1xuXG4gIGluc3RhbGxhdGlvbjogbnVsbFxuXG4gIF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQ6IChncmFtbWFyKSAtPlxuICAgICMgdGhpcyBzaG91bGQgYmUgc2FtZSB3aXRoIGFjdGl2YXRpb25Ib29rcyBuYW1lc1xuICAgIGlmIGdyYW1tYXIucGFja2FnZU5hbWUgaW4gWydsYW5ndWFnZS1weXRob24nLCAnTWFnaWNQeXRob24nLCAnYXRvbS1kamFuZ28nXVxuICAgICAgQHByb3ZpZGVyLmxvYWQoKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWxvYWQtcHJvdmlkZXInXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgX2xvYWRLaXRlOiAtPlxuICAgIGZpcnN0SW5zdGFsbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcpID09IG51bGxcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0b2NvbXBsZXRlLXB5dGhvbi5pbnN0YWxsZWQnLCB0cnVlKVxuICAgIGxvbmdSdW5uaW5nID0gcmVxdWlyZSgncHJvY2VzcycpLnVwdGltZSgpID4gMTBcbiAgICBpZiBmaXJzdEluc3RhbGwgYW5kIGxvbmdSdW5uaW5nXG4gICAgICBldmVudCA9IFwiaW5zdGFsbGVkXCJcbiAgICBlbHNlIGlmIGZpcnN0SW5zdGFsbFxuICAgICAgZXZlbnQgPSBcInVwZ3JhZGVkXCJcbiAgICBlbHNlXG4gICAgICBldmVudCA9IFwicmVzdGFydGVkXCJcblxuICAgIHtcbiAgICAgIEFjY291bnRNYW5hZ2VyLFxuICAgICAgQXRvbUhlbHBlcixcbiAgICAgIERlY2lzaW9uTWFrZXIsXG4gICAgICBJbnN0YWxsYXRpb24sXG4gICAgICBJbnN0YWxsZXIsXG4gICAgICBNZXRyaWNzLFxuICAgICAgTG9nZ2VyLFxuICAgICAgU3RhdGVDb250cm9sbGVyXG4gICAgfSA9IHJlcXVpcmUgJ2tpdGUtaW5zdGFsbGVyJ1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdraXRlLmxvZ2dpbmdMZXZlbCcpXG4gICAgICBMb2dnZXIuTEVWRUwgPSBMb2dnZXIuTEVWRUxTW2F0b20uY29uZmlnLmdldCgna2l0ZS5sb2dnaW5nTGV2ZWwnKS50b1VwcGVyQ2FzZSgpXVxuXG4gICAgQWNjb3VudE1hbmFnZXIuaW5pdENsaWVudCAnYWxwaGEua2l0ZS5jb20nLCAtMSwgdHJ1ZVxuICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyIEluc3RhbGxhdGlvbiwgKG0pIC0+IG0uZWxlbWVudFxuICAgIGVkaXRvckNmZyA9XG4gICAgICBVVUlEOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbWV0cmljcy51c2VySWQnKVxuICAgICAgbmFtZTogJ2F0b20nXG4gICAgcGx1Z2luQ2ZnID1cbiAgICAgIG5hbWU6ICdhdXRvY29tcGxldGUtcHl0aG9uJ1xuICAgIGRtID0gbmV3IERlY2lzaW9uTWFrZXIgZWRpdG9yQ2ZnLCBwbHVnaW5DZmdcblxuICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGFjcFwiXG4gICAgTWV0cmljcy5lbmFibGVkID0gYXRvbS5jb25maWcuZ2V0KCdjb3JlLnRlbGVtZXRyeUNvbnNlbnQnKSBpcyAnbGltaXRlZCdcblxuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBrZykgPT5cbiAgICAgIGlmIHBrZy5uYW1lIGlzICdraXRlJ1xuICAgICAgICBAcGF0Y2hLaXRlQ29tcGxldGlvbnMocGtnKVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBraXRlK2FjcFwiXG5cbiAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24gPSAoKSA9PlxuICAgICAgaWYgbm90IGF0b20uY29uZmlnLmdldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJ1xuICAgICAgICByZXR1cm5cbiAgICAgIGNhbkluc3RhbGwgPSBTdGF0ZUNvbnRyb2xsZXIuY2FuSW5zdGFsbEtpdGUoKVxuICAgICAgdGhyb3R0bGUgPSBkbS5zaG91bGRPZmZlcktpdGUoZXZlbnQpXG4gICAgICBQcm9taXNlLmFsbChbdGhyb3R0bGUsIGNhbkluc3RhbGxdKS50aGVuKCh2YWx1ZXMpID0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgdHJ1ZVxuICAgICAgICB2YXJpYW50ID0gdmFsdWVzWzBdXG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcyA9IHZhcmlhbnRcbiAgICAgICAgTWV0cmljcy5UcmFja2VyLnByb3BzLmxhc3RFdmVudCA9IGV2ZW50XG4gICAgICAgIHRpdGxlID0gXCJDaG9vc2UgYSBhdXRvY29tcGxldGUtcHl0aG9uIGVuZ2luZVwiXG4gICAgICAgIEBpbnN0YWxsYXRpb24gPSBuZXcgSW5zdGFsbGF0aW9uIHZhcmlhbnQsIHRpdGxlXG4gICAgICAgIEBpbnN0YWxsYXRpb24uYWNjb3VudENyZWF0ZWQoKCkgPT5cbiAgICAgICAgICBAdHJhY2sgXCJhY2NvdW50IGNyZWF0ZWRcIlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgdHJ1ZVxuICAgICAgICApXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvd1NraXBwZWQoKCkgPT5cbiAgICAgICAgICBAdHJhY2sgXCJmbG93IGFib3J0ZWRcIlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICAgKVxuICAgICAgICBbcHJvamVjdFBhdGhdID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgcm9vdCA9IGlmIHByb2plY3RQYXRoPyBhbmQgcGF0aC5yZWxhdGl2ZShvcy5ob21lZGlyKCksIHByb2plY3RQYXRoKS5pbmRleE9mKCcuLicpIGlzIDBcbiAgICAgICAgICBwYXRoLnBhcnNlKHByb2plY3RQYXRoKS5yb290XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcy5ob21lZGlyKClcblxuICAgICAgICBpbnN0YWxsZXIgPSBuZXcgSW5zdGFsbGVyKFtyb290XSlcbiAgICAgICAgaW5zdGFsbGVyLmluaXQgQGluc3RhbGxhdGlvbi5mbG93LCAtPlxuICAgICAgICAgIExvZ2dlci52ZXJib3NlKCdpbiBvbkZpbmlzaCcpXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKVxuXG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgQGluc3RhbGxhdGlvbi5mbG93Lm9uU2tpcEluc3RhbGwgKCkgPT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICAgICAgQHRyYWNrIFwic2tpcHBlZCBraXRlXCJcbiAgICAgICAgICBwYW5lLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgICAgICAgcGFuZS5hZGRJdGVtIEBpbnN0YWxsYXRpb24sIGluZGV4OiAwXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCAwXG4gICAgICAsIChlcnIpID0+XG4gICAgICAgIGlmIGVyci50eXBlID09ICdkZW5pZWQnXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgKSBpZiBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcblxuICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbigpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgKHsgbmV3VmFsdWUsIG9sZFZhbHVlIH0pIC0+XG4gICAgICBpZiBuZXdWYWx1ZVxuICAgICAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuICAgICAgICBBdG9tSGVscGVyLmVuYWJsZVBhY2thZ2UoKVxuICAgICAgZWxzZVxuICAgICAgICBBdG9tSGVscGVyLmRpc2FibGVQYWNrYWdlKClcblxuICBsb2FkOiAtPlxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgZGlzcG9zYWJsZSA9IGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLmdldEdyYW1tYXIoKSlcbiAgICAgIGRpc3Bvc2FibGUgPSBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChncmFtbWFyKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgQF9sb2FkS2l0ZSgpXG4gICAgIyBAdHJhY2tDb21wbGV0aW9ucygpXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHByb3ZpZGVyID0gcmVxdWlyZSgnLi9wcm92aWRlcicpXG4gICAgaWYgdHlwZW9mIGF0b20ucGFja2FnZXMuaGFzQWN0aXZhdGVkSW5pdGlhbFBhY2thZ2VzID09ICdmdW5jdGlvbicgYW5kXG4gICAgICAgIGF0b20ucGFja2FnZXMuaGFzQWN0aXZhdGVkSW5pdGlhbFBhY2thZ2VzKClcbiAgICAgIEBsb2FkKClcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICAgIEBsb2FkKClcbiAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBwcm92aWRlci5kaXNwb3NlKCkgaWYgQHByb3ZpZGVyXG4gICAgQGluc3RhbGxhdGlvbi5kZXN0cm95KCkgaWYgQGluc3RhbGxhdGlvblxuXG4gIGdldFByb3ZpZGVyOiAtPlxuICAgIHJldHVybiBAcHJvdmlkZXJcblxuICBnZXRIeXBlcmNsaWNrUHJvdmlkZXI6IC0+XG4gICAgcmV0dXJuIHJlcXVpcmUoJy4vaHlwZXJjbGljay1wcm92aWRlcicpXG5cbiAgY29uc3VtZVNuaXBwZXRzOiAoc25pcHBldHNNYW5hZ2VyKSAtPlxuICAgIGRpc3Bvc2FibGUgPSBAZW1pdHRlci5vbiAnZGlkLWxvYWQtcHJvdmlkZXInLCA9PlxuICAgICAgQHByb3ZpZGVyLnNldFNuaXBwZXRzTWFuYWdlciBzbmlwcGV0c01hbmFnZXJcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgdHJhY2tDb21wbGV0aW9uczogLT5cbiAgICBwcm9taXNlcyA9IFthdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXV0b2NvbXBsZXRlLXBsdXMnKV1cblxuICAgIGlmIGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgna2l0ZScpP1xuXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2tpdGUubG9nZ2luZ0xldmVsJywgKGxldmVsKSAtPlxuICAgICAgICBMb2dnZXIuTEVWRUwgPSBMb2dnZXIuTEVWRUxTWyhsZXZlbCA/ICdpbmZvJykudG9VcHBlckNhc2UoKV1cblxuICAgICAgcHJvbWlzZXMucHVzaChhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgna2l0ZScpKVxuICAgICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20ga2l0ZSthY3BcIlxuXG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4gKFthdXRvY29tcGxldGVQbHVzLCBraXRlXSkgPT5cbiAgICAgIGlmIGtpdGU/XG4gICAgICAgIEBwYXRjaEtpdGVDb21wbGV0aW9ucyhraXRlKVxuXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gYXV0b2NvbXBsZXRlUGx1cy5tYWluTW9kdWxlLmdldEF1dG9jb21wbGV0ZU1hbmFnZXIoKVxuXG4gICAgICByZXR1cm4gdW5sZXNzIGF1dG9jb21wbGV0ZU1hbmFnZXI/IGFuZCBhdXRvY29tcGxldGVNYW5hZ2VyLmNvbmZpcm0/IGFuZCBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucz9cblxuICAgICAgc2FmZUNvbmZpcm0gPSBhdXRvY29tcGxldGVNYW5hZ2VyLmNvbmZpcm1cbiAgICAgIHNhZmVEaXNwbGF5U3VnZ2VzdGlvbnMgPSBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9uc1xuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMgPSAoc3VnZ2VzdGlvbnMsIG9wdGlvbnMpID0+XG4gICAgICAgIEB0cmFja1N1Z2dlc3Rpb25zKHN1Z2dlc3Rpb25zLCBhdXRvY29tcGxldGVNYW5hZ2VyLmVkaXRvcilcbiAgICAgICAgc2FmZURpc3BsYXlTdWdnZXN0aW9ucy5jYWxsKGF1dG9jb21wbGV0ZU1hbmFnZXIsIHN1Z2dlc3Rpb25zLCBvcHRpb25zKVxuXG4gICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmNvbmZpcm0gPSAoc3VnZ2VzdGlvbikgPT5cbiAgICAgICAgQHRyYWNrVXNlZFN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgYXV0b2NvbXBsZXRlTWFuYWdlci5lZGl0b3IpXG4gICAgICAgIHNhZmVDb25maXJtLmNhbGwoYXV0b2NvbXBsZXRlTWFuYWdlciwgc3VnZ2VzdGlvbilcblxuICB0cmFja1N1Z2dlc3Rpb25zOiAoc3VnZ2VzdGlvbnMsIGVkaXRvcikgLT5cbiAgICBpZiAvXFwucHkkLy50ZXN0KGVkaXRvci5nZXRQYXRoKCkpIGFuZCBAa2l0ZVByb3ZpZGVyP1xuICAgICAgaGFzS2l0ZVN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMuc29tZSAocykgPT4gcy5wcm92aWRlciBpcyBAa2l0ZVByb3ZpZGVyXG4gICAgICBoYXNKZWRpU3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucy5zb21lIChzKSA9PiBzLnByb3ZpZGVyIGlzIEBwcm92aWRlclxuXG4gICAgICBpZiBoYXNLaXRlU3VnZ2VzdGlvbnMgYW5kIGhhc0plZGlTdWdnZXN0aW9uc1xuICAgICAgICBAdHJhY2sgJ0F0b20gc2hvd3MgYm90aCBLaXRlIGFuZCBKZWRpIGNvbXBsZXRpb25zJ1xuICAgICAgZWxzZSBpZiBoYXNLaXRlU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIEtpdGUgYnV0IG5vdCBKZWRpIGNvbXBsZXRpb25zJ1xuICAgICAgZWxzZSBpZiBoYXNKZWRpU3VnZ2VzdGlvbnNcbiAgICAgICAgQHRyYWNrICdBdG9tIHNob3dzIEplZGkgYnV0IG5vdCBLaXRlIGNvbXBsZXRpb25zJ1xuICAgICAgZWxzZVxuICAgICAgICBAdHJhY2sgJ0F0b20gc2hvd3MgbmVpdGhlciBLaXRlIG5vciBKZWRpIGNvbXBsZXRpb25zJ1xuXG4gIHBhdGNoS2l0ZUNvbXBsZXRpb25zOiAoa2l0ZSkgLT5cbiAgICByZXR1cm4gaWYgQGtpdGVQYWNrYWdlP1xuXG4gICAgQGtpdGVQYWNrYWdlID0ga2l0ZS5tYWluTW9kdWxlXG4gICAgQGtpdGVQcm92aWRlciA9IEBraXRlUGFja2FnZS5jb21wbGV0aW9ucygpXG4gICAgZ2V0U3VnZ2VzdGlvbnMgPSBAa2l0ZVByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zXG4gICAgQGtpdGVQcm92aWRlci5nZXRTdWdnZXN0aW9ucyA9IChhcmdzLi4uKSA9PlxuICAgICAgZ2V0U3VnZ2VzdGlvbnM/LmFwcGx5KEBraXRlUHJvdmlkZXIsIGFyZ3MpXG4gICAgICA/LnRoZW4gKHN1Z2dlc3Rpb25zKSA9PlxuICAgICAgICBAbGFzdEtpdGVTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zXG4gICAgICAgIEBraXRlU3VnZ2VzdGVkID0gc3VnZ2VzdGlvbnM/XG4gICAgICAgIHN1Z2dlc3Rpb25zXG4gICAgICA/LmNhdGNoIChlcnIpID0+XG4gICAgICAgIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgQGtpdGVTdWdnZXN0ZWQgPSBmYWxzZVxuICAgICAgICB0aHJvdyBlcnJcblxuICB0cmFja1VzZWRTdWdnZXN0aW9uOiAoc3VnZ2VzdGlvbiwgZWRpdG9yKSAtPlxuICAgIGlmIC9cXC5weSQvLnRlc3QoZWRpdG9yLmdldFBhdGgoKSlcbiAgICAgIGlmIEBraXRlUHJvdmlkZXI/XG4gICAgICAgIGlmIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zP1xuICAgICAgICAgIGlmIHN1Z2dlc3Rpb24gaW4gQGxhc3RLaXRlU3VnZ2VzdGlvbnNcbiAgICAgICAgICAgIGFsdFN1Z2dlc3Rpb24gPSBAaGFzU2FtZVN1Z2dlc3Rpb24oc3VnZ2VzdGlvbiwgQHByb3ZpZGVyLmxhc3RTdWdnZXN0aW9ucyBvciBbXSlcbiAgICAgICAgICAgIGlmIGFsdFN1Z2dlc3Rpb24/XG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEtpdGUgYnV0IGFsc28gcmV0dXJuZWQgYnkgSmVkaScsIHtcbiAgICAgICAgICAgICAgICBraXRlSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oYWx0U3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBLaXRlIGJ1dCBub3QgSmVkaScsIHtcbiAgICAgICAgICAgICAgICBraXRlSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgQHByb3ZpZGVyLmxhc3RTdWdnZXN0aW9ucyBhbmQgIHN1Z2dlc3Rpb24gaW4gQHByb3ZpZGVyLmxhc3RTdWdnZXN0aW9uc1xuICAgICAgICAgICAgYWx0U3VnZ2VzdGlvbiA9IEBoYXNTYW1lU3VnZ2VzdGlvbihzdWdnZXN0aW9uLCBAbGFzdEtpdGVTdWdnZXN0aW9ucylcbiAgICAgICAgICAgIGlmIGFsdFN1Z2dlc3Rpb24/XG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IGFsc28gcmV0dXJuZWQgYnkgS2l0ZScsIHtcbiAgICAgICAgICAgICAgICBraXRlSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oYWx0U3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBpZiBAa2l0ZVBhY2thZ2UuaXNFZGl0b3JXaGl0ZWxpc3RlZD9cbiAgICAgICAgICAgICAgICBpZiBAa2l0ZVBhY2thZ2UuaXNFZGl0b3JXaGl0ZWxpc3RlZChlZGl0b3IpXG4gICAgICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAod2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAobm9uLXdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAod2hpdGVsaXN0ZWQgZmlsZXBhdGgpJywge1xuICAgICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIGZyb20gbmVpdGhlciBLaXRlIG5vciBKZWRpJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgQGtpdGVQYWNrYWdlLmlzRWRpdG9yV2hpdGVsaXN0ZWQ/XG4gICAgICAgICAgICBpZiBAa2l0ZVBhY2thZ2UuaXNFZGl0b3JXaGl0ZWxpc3RlZChlZGl0b3IpXG4gICAgICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGkgYnV0IG5vdCBLaXRlICh3aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgQHRyYWNrICd1c2VkIGNvbXBsZXRpb24gcmV0dXJuZWQgYnkgSmVkaSBidXQgbm90IEtpdGUgKG5vbi13aGl0ZWxpc3RlZCBmaWxlcGF0aCknLCB7XG4gICAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiByZXR1cm5lZCBieSBKZWRpIGJ1dCBub3QgS2l0ZSAobm90LXdoaXRlbGlzdGVkIGZpbGVwYXRoKScsIHtcbiAgICAgICAgICAgICAgamVkaUhhc0RvY3VtZW50YXRpb246IEBoYXNEb2N1bWVudGF0aW9uKHN1Z2dlc3Rpb24pXG4gICAgICAgICAgICB9XG4gICAgICBlbHNlXG4gICAgICAgIGlmIEBwcm92aWRlci5sYXN0U3VnZ2VzdGlvbnMgYW5kIHN1Z2dlc3Rpb24gaW4gQHByb3ZpZGVyLmxhc3RTdWdnZXN0aW9uc1xuICAgICAgICAgIEB0cmFjayAndXNlZCBjb21wbGV0aW9uIHJldHVybmVkIGJ5IEplZGknLCB7XG4gICAgICAgICAgICBqZWRpSGFzRG9jdW1lbnRhdGlvbjogQGhhc0RvY3VtZW50YXRpb24oc3VnZ2VzdGlvbilcbiAgICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAdHJhY2sgJ3VzZWQgY29tcGxldGlvbiBub3QgcmV0dXJuZWQgYnkgSmVkaSdcblxuICBoYXNTYW1lU3VnZ2VzdGlvbjogKHN1Z2dlc3Rpb24sIHN1Z2dlc3Rpb25zKSAtPlxuICAgIHN1Z2dlc3Rpb25zLmZpbHRlcigocykgLT4gcy50ZXh0IGlzIHN1Z2dlc3Rpb24udGV4dClbMF1cblxuICBoYXNEb2N1bWVudGF0aW9uOiAoc3VnZ2VzdGlvbikgLT5cbiAgICAoc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbj8gYW5kIHN1Z2dlc3Rpb24uZGVzY3JpcHRpb24gaXNudCAnJykgb3JcbiAgICAoc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbk1hcmtkb3duPyBhbmQgc3VnZ2VzdGlvbi5kZXNjcmlwdGlvbk1hcmtkb3duIGlzbnQgJycpXG5cbiAgdHJhY2s6IChtc2csIGRhdGEpIC0+XG4gICAgdHJ5XG4gICAgICBNZXRyaWNzLlRyYWNrZXIudHJhY2tFdmVudCBtc2csIGRhdGFcbiAgICBjYXRjaCBlXG4gICAgICAjIFRPRE86IHRoaXMgc2hvdWxkIGJlIHJlbW92ZWQgYWZ0ZXIga2l0ZS1pbnN0YWxsZXIgaXMgZml4ZWRcbiAgICAgIGlmIGUgaW5zdGFuY2VvZiBUeXBlRXJyb3JcbiAgICAgICAgY29uc29sZS5lcnJvcihlKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBlXG4iXX0=
