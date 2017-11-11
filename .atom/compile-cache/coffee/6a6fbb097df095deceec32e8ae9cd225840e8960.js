(function() {
  var log;

  log = require('./log');

  module.exports = {
    selector: '.source.python',
    disableForSelector: '.source.python .comment, .source.python .string',
    inclusionPriority: 2,
    suggestionPriority: atom.config.get('autocomplete-python.suggestionPriority'),
    excludeLowerPriority: false,
    cacheSize: 10,
    _addEventListener: function(editor, eventName, handler) {
      var disposable, editorView;
      editorView = atom.views.getView(editor);
      editorView.addEventListener(eventName, handler);
      disposable = new this.Disposable(function() {
        log.debug('Unsubscribing from event listener ', eventName, handler);
        return editorView.removeEventListener(eventName, handler);
      });
      return disposable;
    },
    _noExecutableError: function(error) {
      if (this.providerNoExecutable) {
        return;
      }
      log.warning('No python executable found', error);
      atom.notifications.addWarning('autocomplete-python unable to find python binary.', {
        detail: "Please set path to python executable manually in package\nsettings and restart your editor. Be sure to migrate on new settings\nif everything worked on previous version.\nDetailed error message: " + error + "\n\nCurrent config: " + (atom.config.get('autocomplete-python.pythonPaths')),
        dismissable: true
      });
      return this.providerNoExecutable = true;
    },
    _spawnDaemon: function() {
      var interpreter, ref;
      interpreter = this.InterpreterLookup.getInterpreter();
      log.debug('Using interpreter', interpreter);
      this.provider = new this.BufferedProcess({
        command: interpreter || 'python',
        args: [__dirname + '/completion.py'],
        stdout: (function(_this) {
          return function(data) {
            return _this._deserialize(data);
          };
        })(this),
        stderr: (function(_this) {
          return function(data) {
            var ref, requestId, resolve, results1;
            if (data.indexOf('is not recognized as an internal or external') > -1) {
              return _this._noExecutableError(data);
            }
            log.debug("autocomplete-python traceback output: " + data);
            if (data.indexOf('jedi') > -1) {
              if (atom.config.get('autocomplete-python.outputProviderErrors')) {
                atom.notifications.addWarning('Looks like this error originated from Jedi. Please do not\nreport such issues in autocomplete-python issue tracker. Report\nthem directly to Jedi. Turn off `outputProviderErrors` setting\nto hide such errors in future. Traceback output:', {
                  detail: "" + data,
                  dismissable: true
                });
              }
            } else {
              atom.notifications.addError('autocomplete-python traceback output:', {
                detail: "" + data,
                dismissable: true
              });
            }
            log.debug("Forcing to resolve " + (Object.keys(_this.requests).length) + " promises");
            ref = _this.requests;
            results1 = [];
            for (requestId in ref) {
              resolve = ref[requestId];
              if (typeof resolve === 'function') {
                resolve([]);
              }
              results1.push(delete _this.requests[requestId]);
            }
            return results1;
          };
        })(this),
        exit: (function(_this) {
          return function(code) {
            return log.warning('Process exit with', code, _this.provider);
          };
        })(this)
      });
      this.provider.onWillThrowError((function(_this) {
        return function(arg) {
          var error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            _this._noExecutableError(error);
            _this.dispose();
            return handle();
          } else {
            throw error;
          }
        };
      })(this));
      if ((ref = this.provider.process) != null) {
        ref.stdin.on('error', function(err) {
          return log.debug('stdin', err);
        });
      }
      return setTimeout((function(_this) {
        return function() {
          log.debug('Killing python process after timeout...');
          if (_this.provider && _this.provider.process) {
            return _this.provider.kill();
          }
        };
      })(this), 60 * 10 * 1000);
    },
    load: function() {
      if (!this.constructed) {
        this.constructor();
      }
      return this;
    },
    constructor: function() {
      var err, ref, selector;
      ref = require('atom'), this.Disposable = ref.Disposable, this.CompositeDisposable = ref.CompositeDisposable, this.BufferedProcess = ref.BufferedProcess;
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.DefinitionsView = require('./definitions-view');
      this.UsagesView = require('./usages-view');
      this.OverrideView = require('./override-view');
      this.RenameView = require('./rename-view');
      this.InterpreterLookup = require('./interpreters-lookup');
      this._ = require('underscore');
      this.filter = require('fuzzaldrin-plus').filter;
      this._showSignatureOverlay = require('./tooltips')._showSignatureOverlay;
      this.requests = {};
      this.responses = {};
      this.provider = null;
      this.disposables = new this.CompositeDisposable;
      this.subscriptions = {};
      this.definitionsView = null;
      this.usagesView = null;
      this.renameView = null;
      this.constructed = true;
      this.snippetsManager = null;
      log.debug("Init autocomplete-python with priority " + this.suggestionPriority);
      try {
        this.triggerCompletionRegex = RegExp(atom.config.get('autocomplete-python.triggerCompletionRegex'));
      } catch (error1) {
        err = error1;
        atom.notifications.addWarning('autocomplete-python invalid regexp to trigger autocompletions.\nFalling back to default value.', {
          detail: "Original exception: " + err,
          dismissable: true
        });
        atom.config.set('autocomplete-python.triggerCompletionRegex', '([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)');
        this.triggerCompletionRegex = /([\.\ ]|[a-zA-Z_][a-zA-Z0-9_]*)/;
      }
      selector = 'atom-text-editor[data-grammar~=python]';
      atom.commands.add(selector, 'autocomplete-python:go-to-definition', (function(_this) {
        return function() {
          return _this.goToDefinition();
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:complete-arguments', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this._completeArguments(editor, editor.getCursorBufferPosition(), true);
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:show-usages', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.usagesView) {
            _this.usagesView.destroy();
          }
          _this.usagesView = new _this.UsagesView();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            return _this.usagesView.setItems(usages);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:override-method', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          if (_this.overrideView) {
            _this.overrideView.destroy();
          }
          _this.overrideView = new _this.OverrideView();
          return _this.getMethods(editor, bufferPosition).then(function(arg) {
            var bufferPosition, indent, methods;
            methods = arg.methods, indent = arg.indent, bufferPosition = arg.bufferPosition;
            _this.overrideView.indent = indent;
            _this.overrideView.bufferPosition = bufferPosition;
            return _this.overrideView.setItems(methods);
          });
        };
      })(this));
      atom.commands.add(selector, 'autocomplete-python:rename', (function(_this) {
        return function() {
          var bufferPosition, editor;
          editor = atom.workspace.getActiveTextEditor();
          bufferPosition = editor.getCursorBufferPosition();
          return _this.getUsages(editor, bufferPosition).then(function(usages) {
            if (_this.renameView) {
              _this.renameView.destroy();
            }
            if (usages.length > 0) {
              _this.renameView = new _this.RenameView(usages);
              return _this.renameView.onInput(function(newName) {
                var _relative, fileName, project, ref1, ref2, results1;
                ref1 = _this._.groupBy(usages, 'fileName');
                results1 = [];
                for (fileName in ref1) {
                  usages = ref1[fileName];
                  ref2 = atom.project.relativizePath(fileName), project = ref2[0], _relative = ref2[1];
                  if (project) {
                    results1.push(_this._updateUsagesInFile(fileName, usages, newName));
                  } else {
                    results1.push(log.debug('Ignoring file outside of project', fileName));
                  }
                }
                return results1;
              });
            } else {
              if (_this.usagesView) {
                _this.usagesView.destroy();
              }
              _this.usagesView = new _this.UsagesView();
              return _this.usagesView.setItems(usages);
            }
          });
        };
      })(this));
      atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          return editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(editor, grammar);
          });
        };
      })(this));
      return atom.config.onDidChange('autocomplete-plus.enableAutoActivation', (function(_this) {
        return function() {
          return atom.workspace.observeTextEditors(function(editor) {
            return _this._handleGrammarChangeEvent(editor, editor.getGrammar());
          });
        };
      })(this));
    },
    _updateUsagesInFile: function(fileName, usages, newName) {
      var columnOffset;
      columnOffset = {};
      return atom.workspace.open(fileName, {
        activateItem: false
      }).then(function(editor) {
        var buffer, column, i, len, line, name, usage;
        buffer = editor.getBuffer();
        for (i = 0, len = usages.length; i < len; i++) {
          usage = usages[i];
          name = usage.name, line = usage.line, column = usage.column;
          if (columnOffset[line] == null) {
            columnOffset[line] = 0;
          }
          log.debug('Replacing', usage, 'with', newName, 'in', editor.id);
          log.debug('Offset for line', line, 'is', columnOffset[line]);
          buffer.setTextInRange([[line - 1, column + columnOffset[line]], [line - 1, column + name.length + columnOffset[line]]], newName);
          columnOffset[line] += newName.length - name.length;
        }
        return buffer.save();
      });
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event, _this);
            };
          })(this));
        }
        if (!atom.config.get('autocomplete-plus.enableAutoActivation')) {
          log.debug('Ignoring keyup events due to autocomplete-plus settings.');
          return;
        }
        disposable = this._addEventListener(editor, eventName, (function(_this) {
          return function(e) {
            if (atom.keymaps.keystrokeForKeyboardEvent(e) === '^(') {
              log.debug('Trying to complete arguments on keyup event', e);
              return _this._completeArguments(editor, editor.getCursorBufferPosition());
            }
          };
        })(this));
        this.disposables.add(disposable);
        this.subscriptions[eventId] = disposable;
        return log.debug('Subscribed on event', eventId);
      } else {
        if (eventId in this.subscriptions) {
          this.subscriptions[eventId].dispose();
          return log.debug('Unsubscribed from event', eventId);
        }
      }
    },
    _serialize: function(request) {
      log.debug('Serializing request to be sent to Jedi', request);
      return JSON.stringify(request);
    },
    _sendRequest: function(data, respawned) {
      var process;
      log.debug('Pending requests:', Object.keys(this.requests).length, this.requests);
      if (Object.keys(this.requests).length > 10) {
        log.debug('Cleaning up request queue to avoid overflow, ignoring request');
        this.requests = {};
        if (this.provider && this.provider.process) {
          log.debug('Killing python process');
          this.provider.kill();
          return;
        }
      }
      if (this.provider && this.provider.process) {
        process = this.provider.process;
        if (process.exitCode === null && process.signalCode === null) {
          if (this.provider.process.pid) {
            return this.provider.process.stdin.write(data + '\n');
          } else {
            return log.debug('Attempt to communicate with terminated process', this.provider);
          }
        } else if (respawned) {
          atom.notifications.addWarning(["Failed to spawn daemon for autocomplete-python.", "Completions will not work anymore", "unless you restart your editor."].join(' '), {
            detail: ["exitCode: " + process.exitCode, "signalCode: " + process.signalCode].join('\n'),
            dismissable: true
          });
          return this.dispose();
        } else {
          this._spawnDaemon();
          this._sendRequest(data, {
            respawned: true
          });
          return log.debug('Re-spawning python process...');
        }
      } else {
        log.debug('Spawning python process...');
        this._spawnDaemon();
        return this._sendRequest(data);
      }
    },
    _deserialize: function(response) {
      var bufferPosition, cacheSizeDelta, e, editor, i, id, ids, j, len, len1, ref, ref1, ref2, resolve, responseSource, results1;
      log.debug('Deserealizing response from Jedi', response);
      log.debug("Got " + (response.trim().split('\n').length) + " lines");
      ref = response.trim().split('\n');
      results1 = [];
      for (i = 0, len = ref.length; i < len; i++) {
        responseSource = ref[i];
        try {
          response = JSON.parse(responseSource);
        } catch (error1) {
          e = error1;
          throw new Error("Failed to parse JSON from \"" + responseSource + "\".\nOriginal exception: " + e);
        }
        if (response['arguments']) {
          editor = this.requests[response['id']];
          if (typeof editor === 'object') {
            bufferPosition = editor.getCursorBufferPosition();
            if (response['id'] === this._generateRequestId('arguments', editor, bufferPosition)) {
              if ((ref1 = this.snippetsManager) != null) {
                ref1.insertSnippet(response['arguments'], editor);
              }
            }
          }
        } else {
          resolve = this.requests[response['id']];
          if (typeof resolve === 'function') {
            resolve(response['results']);
          }
        }
        cacheSizeDelta = Object.keys(this.responses).length > this.cacheSize;
        if (cacheSizeDelta > 0) {
          ids = Object.keys(this.responses).sort((function(_this) {
            return function(a, b) {
              return _this.responses[a]['timestamp'] - _this.responses[b]['timestamp'];
            };
          })(this));
          ref2 = ids.slice(0, cacheSizeDelta);
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            id = ref2[j];
            log.debug('Removing old item from cache with ID', id);
            delete this.responses[id];
          }
        }
        this.responses[response['id']] = {
          source: responseSource,
          timestamp: Date.now()
        };
        log.debug('Cached request with ID', response['id']);
        results1.push(delete this.requests[response['id']]);
      }
      return results1;
    },
    _generateRequestId: function(type, editor, bufferPosition, text) {
      if (!text) {
        text = editor.getText();
      }
      return require('crypto').createHash('md5').update([editor.getPath(), text, bufferPosition.row, bufferPosition.column, type].join()).digest('hex');
    },
    _generateRequestConfig: function() {
      var args, extraPaths;
      extraPaths = this.InterpreterLookup.applySubstitutions(atom.config.get('autocomplete-python.extraPaths').split(';'));
      args = {
        'extraPaths': extraPaths,
        'useSnippets': atom.config.get('autocomplete-python.useSnippets'),
        'caseInsensitiveCompletion': atom.config.get('autocomplete-python.caseInsensitiveCompletion'),
        'showDescriptions': atom.config.get('autocomplete-python.showDescriptions'),
        'fuzzyMatcher': atom.config.get('autocomplete-python.fuzzyMatcher')
      };
      return args;
    },
    setSnippetsManager: function(snippetsManager) {
      this.snippetsManager = snippetsManager;
    },
    _completeArguments: function(editor, bufferPosition, force) {
      var disableForSelector, line, lines, payload, prefix, scopeChain, scopeDescriptor, suffix, useSnippets;
      useSnippets = atom.config.get('autocomplete-python.useSnippets');
      if (!force && useSnippets === 'none') {
        atom.commands.dispatch(document.querySelector('atom-text-editor'), 'autocomplete-plus:activate');
        return;
      }
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.Selector.create(this.disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('Ignoring argument completion inside of', scopeChain);
        return;
      }
      lines = editor.getBuffer().getLines();
      line = lines[bufferPosition.row];
      prefix = line.slice(bufferPosition.column - 1, bufferPosition.column);
      if (prefix !== '(') {
        log.debug('Ignoring argument completion with prefix', prefix);
        return;
      }
      suffix = line.slice(bufferPosition.column, line.length);
      if (!/^(\)(?:$|\s)|\s|$)/.test(suffix)) {
        log.debug('Ignoring argument completion with suffix', suffix);
        return;
      }
      payload = {
        id: this._generateRequestId('arguments', editor, bufferPosition),
        lookup: 'arguments',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function() {
          return _this.requests[payload.id] = editor;
        };
      })(this));
    },
    _fuzzyFilter: function(candidates, query) {
      if (candidates.length !== 0 && (query !== ' ' && query !== '.' && query !== '(')) {
        candidates = this.filter(candidates, query, {
          key: 'text'
        });
      }
      return candidates;
    },
    getSuggestions: function(arg) {
      var bufferPosition, editor, lastIdentifier, line, lines, matches, payload, prefix, requestId, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      this.load();
      if (!this.triggerCompletionRegex.test(prefix)) {
        return this.lastSuggestions = [];
      }
      bufferPosition = {
        row: bufferPosition.row,
        column: bufferPosition.column
      };
      lines = editor.getBuffer().getLines();
      if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
        line = lines[bufferPosition.row];
        lastIdentifier = /\.?[a-zA-Z_][a-zA-Z0-9_]*$/.exec(line.slice(0, bufferPosition.column));
        if (lastIdentifier) {
          bufferPosition.column = lastIdentifier.index + 1;
          lines[bufferPosition.row] = line.slice(0, bufferPosition.column);
        }
      }
      requestId = this._generateRequestId('completions', editor, bufferPosition, lines.join('\n'));
      if (requestId in this.responses) {
        log.debug('Using cached response with ID', requestId);
        matches = JSON.parse(this.responses[requestId]['source'])['results'];
        if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
          return this.lastSuggestions = this._fuzzyFilter(matches, prefix);
        } else {
          return this.lastSuggestions = matches;
        }
      }
      payload = {
        id: requestId,
        prefix: prefix,
        lookup: 'completions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          if (atom.config.get('autocomplete-python.fuzzyMatcher')) {
            return _this.requests[payload.id] = function(matches) {
              return resolve(_this.lastSuggestions = _this._fuzzyFilter(matches, prefix));
            };
          } else {
            return _this.requests[payload.id] = function(suggestions) {
              return resolve(_this.lastSuggestions = suggestions);
            };
          }
        };
      })(this));
    },
    getDefinitions: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('definitions', editor, bufferPosition),
        lookup: 'definitions',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getUsages: function(editor, bufferPosition) {
      var payload;
      payload = {
        id: this._generateRequestId('usages', editor, bufferPosition),
        lookup: 'usages',
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        column: bufferPosition.column,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = resolve;
        };
      })(this));
    },
    getMethods: function(editor, bufferPosition) {
      var indent, lines, payload;
      indent = bufferPosition.column;
      lines = editor.getBuffer().getLines();
      lines.splice(bufferPosition.row + 1, 0, "  def __autocomplete_python(s):");
      lines.splice(bufferPosition.row + 2, 0, "    s.");
      payload = {
        id: this._generateRequestId('methods', editor, bufferPosition),
        lookup: 'methods',
        path: editor.getPath(),
        source: lines.join('\n'),
        line: bufferPosition.row + 2,
        column: 6,
        config: this._generateRequestConfig()
      };
      this._sendRequest(this._serialize(payload));
      return new Promise((function(_this) {
        return function(resolve) {
          return _this.requests[payload.id] = function(methods) {
            return resolve({
              methods: methods,
              indent: indent,
              bufferPosition: bufferPosition
            });
          };
        };
      })(this));
    },
    goToDefinition: function(editor, bufferPosition) {
      if (!editor) {
        editor = atom.workspace.getActiveTextEditor();
      }
      if (!bufferPosition) {
        bufferPosition = editor.getCursorBufferPosition();
      }
      if (this.definitionsView) {
        this.definitionsView.destroy();
      }
      this.definitionsView = new this.DefinitionsView();
      return this.getDefinitions(editor, bufferPosition).then((function(_this) {
        return function(results) {
          _this.definitionsView.setItems(results);
          if (results.length === 1) {
            return _this.definitionsView.confirmed(results[0]);
          }
        };
      })(this));
    },
    dispose: function() {
      if (this.disposables) {
        this.disposables.dispose();
      }
      if (this.provider) {
        return this.provider.kill();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxnQkFBVjtJQUNBLGtCQUFBLEVBQW9CLGlEQURwQjtJQUVBLGlCQUFBLEVBQW1CLENBRm5CO0lBR0Esa0JBQUEsRUFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUhwQjtJQUlBLG9CQUFBLEVBQXNCLEtBSnRCO0lBS0EsU0FBQSxFQUFXLEVBTFg7SUFPQSxpQkFBQSxFQUFtQixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLE9BQXBCO0FBQ2pCLFVBQUE7TUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CO01BQ2IsVUFBVSxDQUFDLGdCQUFYLENBQTRCLFNBQTVCLEVBQXVDLE9BQXZDO01BQ0EsVUFBQSxHQUFpQixJQUFBLElBQUMsQ0FBQSxVQUFELENBQVksU0FBQTtRQUMzQixHQUFHLENBQUMsS0FBSixDQUFVLG9DQUFWLEVBQWdELFNBQWhELEVBQTJELE9BQTNEO2VBQ0EsVUFBVSxDQUFDLG1CQUFYLENBQStCLFNBQS9CLEVBQTBDLE9BQTFDO01BRjJCLENBQVo7QUFHakIsYUFBTztJQU5VLENBUG5CO0lBZUEsa0JBQUEsRUFBb0IsU0FBQyxLQUFEO01BQ2xCLElBQUcsSUFBQyxDQUFBLG9CQUFKO0FBQ0UsZUFERjs7TUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLDRCQUFaLEVBQTBDLEtBQTFDO01BQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUNFLG1EQURGLEVBQ3VEO1FBQ3JELE1BQUEsRUFBUSxxTUFB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QUFBLGVBQUQsR0FBdUIsSUFBQSxJQUFDLENBQUEsZUFBRCxDQUFBO2FBQ3ZCLElBQUMsQ0FBQSxjQUFELENBQWdCLE1BQWhCLEVBQXdCLGNBQXhCLENBQXVDLENBQUMsSUFBeEMsQ0FBNkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7VUFDM0MsS0FBQyxDQUFBLGVBQWUsQ0FBQyxRQUFqQixDQUEwQixPQUExQjtVQUNBLElBQUcsT0FBTyxDQUFDLE1BQVIsS0FBa0IsQ0FBckI7bUJBQ0UsS0FBQyxDQUFBLGVBQWUsQ0FBQyxTQUFqQixDQUEyQixPQUFRLENBQUEsQ0FBQSxDQUFuQyxFQURGOztRQUYyQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0M7SUFSYyxDQXRjaEI7SUFtZEEsT0FBQSxFQUFTLFNBQUE7TUFDUCxJQUFHLElBQUMsQ0FBQSxXQUFKO1FBQ0UsSUFBQyxDQUFBLFdBQVcsQ0FBQyxPQUFiLENBQUEsRUFERjs7TUFFQSxJQUFHLElBQUMsQ0FBQSxRQUFKO2VBQ0UsSUFBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUEsRUFERjs7SUFITyxDQW5kVDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbImxvZyA9IHJlcXVpcmUgJy4vbG9nJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24nXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogJy5zb3VyY2UucHl0aG9uIC5jb21tZW50LCAuc291cmNlLnB5dGhvbiAuc3RyaW5nJ1xuICBpbmNsdXNpb25Qcmlvcml0eTogMlxuICBzdWdnZXN0aW9uUHJpb3JpdHk6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5zdWdnZXN0aW9uUHJpb3JpdHknKVxuICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2VcbiAgY2FjaGVTaXplOiAxMFxuXG4gIF9hZGRFdmVudExpc3RlbmVyOiAoZWRpdG9yLCBldmVudE5hbWUsIGhhbmRsZXIpIC0+XG4gICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyBlZGl0b3JcbiAgICBlZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIgZXZlbnROYW1lLCBoYW5kbGVyXG4gICAgZGlzcG9zYWJsZSA9IG5ldyBARGlzcG9zYWJsZSAtPlxuICAgICAgbG9nLmRlYnVnICdVbnN1YnNjcmliaW5nIGZyb20gZXZlbnQgbGlzdGVuZXIgJywgZXZlbnROYW1lLCBoYW5kbGVyXG4gICAgICBlZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIgZXZlbnROYW1lLCBoYW5kbGVyXG4gICAgcmV0dXJuIGRpc3Bvc2FibGVcblxuICBfbm9FeGVjdXRhYmxlRXJyb3I6IChlcnJvcikgLT5cbiAgICBpZiBAcHJvdmlkZXJOb0V4ZWN1dGFibGVcbiAgICAgIHJldHVyblxuICAgIGxvZy53YXJuaW5nICdObyBweXRob24gZXhlY3V0YWJsZSBmb3VuZCcsIGVycm9yXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbiB1bmFibGUgdG8gZmluZCBweXRob24gYmluYXJ5LicsIHtcbiAgICAgIGRldGFpbDogXCJcIlwiUGxlYXNlIHNldCBwYXRoIHRvIHB5dGhvbiBleGVjdXRhYmxlIG1hbnVhbGx5IGluIHBhY2thZ2VcbiAgICAgIHNldHRpbmdzIGFuZCByZXN0YXJ0IHlvdXIgZWRpdG9yLiBCZSBzdXJlIHRvIG1pZ3JhdGUgb24gbmV3IHNldHRpbmdzXG4gICAgICBpZiBldmVyeXRoaW5nIHdvcmtlZCBvbiBwcmV2aW91cyB2ZXJzaW9uLlxuICAgICAgRGV0YWlsZWQgZXJyb3IgbWVzc2FnZTogI3tlcnJvcn1cblxuICAgICAgQ3VycmVudCBjb25maWc6ICN7YXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnB5dGhvblBhdGhzJyl9XCJcIlwiXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgQHByb3ZpZGVyTm9FeGVjdXRhYmxlID0gdHJ1ZVxuXG4gIF9zcGF3bkRhZW1vbjogLT5cbiAgICBpbnRlcnByZXRlciA9IEBJbnRlcnByZXRlckxvb2t1cC5nZXRJbnRlcnByZXRlcigpXG4gICAgbG9nLmRlYnVnICdVc2luZyBpbnRlcnByZXRlcicsIGludGVycHJldGVyXG4gICAgQHByb3ZpZGVyID0gbmV3IEBCdWZmZXJlZFByb2Nlc3NcbiAgICAgIGNvbW1hbmQ6IGludGVycHJldGVyIG9yICdweXRob24nXG4gICAgICBhcmdzOiBbX19kaXJuYW1lICsgJy9jb21wbGV0aW9uLnB5J11cbiAgICAgIHN0ZG91dDogKGRhdGEpID0+XG4gICAgICAgIEBfZGVzZXJpYWxpemUoZGF0YSlcbiAgICAgIHN0ZGVycjogKGRhdGEpID0+XG4gICAgICAgIGlmIGRhdGEuaW5kZXhPZignaXMgbm90IHJlY29nbml6ZWQgYXMgYW4gaW50ZXJuYWwgb3IgZXh0ZXJuYWwnKSA+IC0xXG4gICAgICAgICAgcmV0dXJuIEBfbm9FeGVjdXRhYmxlRXJyb3IoZGF0YSlcbiAgICAgICAgbG9nLmRlYnVnIFwiYXV0b2NvbXBsZXRlLXB5dGhvbiB0cmFjZWJhY2sgb3V0cHV0OiAje2RhdGF9XCJcbiAgICAgICAgaWYgZGF0YS5pbmRleE9mKCdqZWRpJykgPiAtMVxuICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5vdXRwdXRQcm92aWRlckVycm9ycycpXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAgICAgJycnTG9va3MgbGlrZSB0aGlzIGVycm9yIG9yaWdpbmF0ZWQgZnJvbSBKZWRpLiBQbGVhc2UgZG8gbm90XG4gICAgICAgICAgICAgIHJlcG9ydCBzdWNoIGlzc3VlcyBpbiBhdXRvY29tcGxldGUtcHl0aG9uIGlzc3VlIHRyYWNrZXIuIFJlcG9ydFxuICAgICAgICAgICAgICB0aGVtIGRpcmVjdGx5IHRvIEplZGkuIFR1cm4gb2ZmIGBvdXRwdXRQcm92aWRlckVycm9yc2Agc2V0dGluZ1xuICAgICAgICAgICAgICB0byBoaWRlIHN1Y2ggZXJyb3JzIGluIGZ1dHVyZS4gVHJhY2ViYWNrIG91dHB1dDonJycsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZGF0YX1cIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24gdHJhY2ViYWNrIG91dHB1dDonLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogXCIje2RhdGF9XCIsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcblxuICAgICAgICBsb2cuZGVidWcgXCJGb3JjaW5nIHRvIHJlc29sdmUgI3tPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aH0gcHJvbWlzZXNcIlxuICAgICAgICBmb3IgcmVxdWVzdElkLCByZXNvbHZlIG9mIEByZXF1ZXN0c1xuICAgICAgICAgIGlmIHR5cGVvZiByZXNvbHZlID09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJlc29sdmUoW10pXG4gICAgICAgICAgZGVsZXRlIEByZXF1ZXN0c1tyZXF1ZXN0SWRdXG5cbiAgICAgIGV4aXQ6IChjb2RlKSA9PlxuICAgICAgICBsb2cud2FybmluZyAnUHJvY2VzcyBleGl0IHdpdGgnLCBjb2RlLCBAcHJvdmlkZXJcbiAgICBAcHJvdmlkZXIub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLCBoYW5kbGV9KSA9PlxuICAgICAgaWYgZXJyb3IuY29kZSBpcyAnRU5PRU5UJyBhbmQgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKCdzcGF3bicpIGlzIDBcbiAgICAgICAgQF9ub0V4ZWN1dGFibGVFcnJvcihlcnJvcilcbiAgICAgICAgQGRpc3Bvc2UoKVxuICAgICAgICBoYW5kbGUoKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBlcnJvclxuXG4gICAgQHByb3ZpZGVyLnByb2Nlc3M/LnN0ZGluLm9uICdlcnJvcicsIChlcnIpIC0+XG4gICAgICBsb2cuZGVidWcgJ3N0ZGluJywgZXJyXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICBsb2cuZGVidWcgJ0tpbGxpbmcgcHl0aG9uIHByb2Nlc3MgYWZ0ZXIgdGltZW91dC4uLidcbiAgICAgIGlmIEBwcm92aWRlciBhbmQgQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgICAgQHByb3ZpZGVyLmtpbGwoKVxuICAgICwgNjAgKiAxMCAqIDEwMDBcblxuICBsb2FkOiAtPlxuICAgIGlmIG5vdCBAY29uc3RydWN0ZWRcbiAgICAgIEBjb25zdHJ1Y3RvcigpXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICB7QERpc3Bvc2FibGUsIEBDb21wb3NpdGVEaXNwb3NhYmxlLCBAQnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG4gICAge0BzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW59ID0gcmVxdWlyZSAnLi9zY29wZS1oZWxwZXJzJ1xuICAgIHtAU2VsZWN0b3J9ID0gcmVxdWlyZSAnc2VsZWN0b3Ita2l0J1xuICAgIEBEZWZpbml0aW9uc1ZpZXcgPSByZXF1aXJlICcuL2RlZmluaXRpb25zLXZpZXcnXG4gICAgQFVzYWdlc1ZpZXcgPSByZXF1aXJlICcuL3VzYWdlcy12aWV3J1xuICAgIEBPdmVycmlkZVZpZXcgPSByZXF1aXJlICcuL292ZXJyaWRlLXZpZXcnXG4gICAgQFJlbmFtZVZpZXcgPSByZXF1aXJlICcuL3JlbmFtZS12aWV3J1xuICAgIEBJbnRlcnByZXRlckxvb2t1cCA9IHJlcXVpcmUgJy4vaW50ZXJwcmV0ZXJzLWxvb2t1cCdcbiAgICBAXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG4gICAgQGZpbHRlciA9IHJlcXVpcmUoJ2Z1enphbGRyaW4tcGx1cycpLmZpbHRlclxuICAgIHtAX3Nob3dTaWduYXR1cmVPdmVybGF5fSA9IHJlcXVpcmUgJy4vdG9vbHRpcHMnXG5cbiAgICBAcmVxdWVzdHMgPSB7fVxuICAgIEByZXNwb25zZXMgPSB7fVxuICAgIEBwcm92aWRlciA9IG51bGxcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAc3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgQGRlZmluaXRpb25zVmlldyA9IG51bGxcbiAgICBAdXNhZ2VzVmlldyA9IG51bGxcbiAgICBAcmVuYW1lVmlldyA9IG51bGxcbiAgICBAY29uc3RydWN0ZWQgPSB0cnVlXG4gICAgQHNuaXBwZXRzTWFuYWdlciA9IG51bGxcblxuICAgIGxvZy5kZWJ1ZyBcIkluaXQgYXV0b2NvbXBsZXRlLXB5dGhvbiB3aXRoIHByaW9yaXR5ICN7QHN1Z2dlc3Rpb25Qcmlvcml0eX1cIlxuXG4gICAgdHJ5XG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IFJlZ0V4cCBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnRyaWdnZXJDb21wbGV0aW9uUmVnZXgnKVxuICAgIGNhdGNoIGVyclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICcnJ2F1dG9jb21wbGV0ZS1weXRob24gaW52YWxpZCByZWdleHAgdG8gdHJpZ2dlciBhdXRvY29tcGxldGlvbnMuXG4gICAgICAgIEZhbGxpbmcgYmFjayB0byBkZWZhdWx0IHZhbHVlLicnJywge1xuICAgICAgICBkZXRhaWw6IFwiT3JpZ2luYWwgZXhjZXB0aW9uOiAje2Vycn1cIlxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udHJpZ2dlckNvbXBsZXRpb25SZWdleCcsXG4gICAgICAgICAgICAgICAgICAgICAgJyhbXFwuXFwgXXxbYS16QS1aX11bYS16QS1aMC05X10qKScpXG4gICAgICBAdHJpZ2dlckNvbXBsZXRpb25SZWdleCA9IC8oW1xcLlxcIF18W2EtekEtWl9dW2EtekEtWjAtOV9dKikvXG5cbiAgICBzZWxlY3RvciA9ICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcn49cHl0aG9uXSdcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246Z28tdG8tZGVmaW5pdGlvbicsID0+XG4gICAgICBAZ29Ub0RlZmluaXRpb24oKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpjb21wbGV0ZS1hcmd1bWVudHMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCksIHRydWUpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246c2hvdy11c2FnZXMnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBpZiBAdXNhZ2VzVmlld1xuICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgIEB1c2FnZXNWaWV3ID0gbmV3IEBVc2FnZXNWaWV3KClcbiAgICAgIEBnZXRVc2FnZXMoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikudGhlbiAodXNhZ2VzKSA9PlxuICAgICAgICBAdXNhZ2VzVmlldy5zZXRJdGVtcyh1c2FnZXMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246b3ZlcnJpZGUtbWV0aG9kJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgQG92ZXJyaWRlVmlld1xuICAgICAgICBAb3ZlcnJpZGVWaWV3LmRlc3Ryb3koKVxuICAgICAgQG92ZXJyaWRlVmlldyA9IG5ldyBAT3ZlcnJpZGVWaWV3KClcbiAgICAgIEBnZXRNZXRob2RzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHttZXRob2RzLCBpbmRlbnQsIGJ1ZmZlclBvc2l0aW9ufSkgPT5cbiAgICAgICAgQG92ZXJyaWRlVmlldy5pbmRlbnQgPSBpbmRlbnRcbiAgICAgICAgQG92ZXJyaWRlVmlldy5idWZmZXJQb3NpdGlvbiA9IGJ1ZmZlclBvc2l0aW9uXG4gICAgICAgIEBvdmVycmlkZVZpZXcuc2V0SXRlbXMobWV0aG9kcylcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIHNlbGVjdG9yLCAnYXV0b2NvbXBsZXRlLXB5dGhvbjpyZW5hbWUnLCA9PlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgICBAZ2V0VXNhZ2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHVzYWdlcykgPT5cbiAgICAgICAgaWYgQHJlbmFtZVZpZXdcbiAgICAgICAgICBAcmVuYW1lVmlldy5kZXN0cm95KClcbiAgICAgICAgaWYgdXNhZ2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICBAcmVuYW1lVmlldyA9IG5ldyBAUmVuYW1lVmlldyh1c2FnZXMpXG4gICAgICAgICAgQHJlbmFtZVZpZXcub25JbnB1dCAobmV3TmFtZSkgPT5cbiAgICAgICAgICAgIGZvciBmaWxlTmFtZSwgdXNhZ2VzIG9mIEBfLmdyb3VwQnkodXNhZ2VzLCAnZmlsZU5hbWUnKVxuICAgICAgICAgICAgICBbcHJvamVjdCwgX3JlbGF0aXZlXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlTmFtZSlcbiAgICAgICAgICAgICAgaWYgcHJvamVjdFxuICAgICAgICAgICAgICAgIEBfdXBkYXRlVXNhZ2VzSW5GaWxlKGZpbGVOYW1lLCB1c2FnZXMsIG5ld05hbWUpXG4gICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGZpbGUgb3V0c2lkZSBvZiBwcm9qZWN0JywgZmlsZU5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEB1c2FnZXNWaWV3XG4gICAgICAgICAgICBAdXNhZ2VzVmlldy5kZXN0cm95KClcbiAgICAgICAgICBAdXNhZ2VzVmlldyA9IG5ldyBAVXNhZ2VzVmlldygpXG4gICAgICAgICAgQHVzYWdlc1ZpZXcuc2V0SXRlbXModXNhZ2VzKVxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgICBlZGl0b3Iub25EaWRDaGFuZ2VHcmFtbWFyIChncmFtbWFyKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGdyYW1tYXIpXG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnYXV0b2NvbXBsZXRlLXBsdXMuZW5hYmxlQXV0b0FjdGl2YXRpb24nLCA9PlxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvciwgZWRpdG9yLmdldEdyYW1tYXIoKSlcblxuICBfdXBkYXRlVXNhZ2VzSW5GaWxlOiAoZmlsZU5hbWUsIHVzYWdlcywgbmV3TmFtZSkgLT5cbiAgICBjb2x1bW5PZmZzZXQgPSB7fVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZU5hbWUsIGFjdGl2YXRlSXRlbTogZmFsc2UpLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGJ1ZmZlciA9IGVkaXRvci5nZXRCdWZmZXIoKVxuICAgICAgZm9yIHVzYWdlIGluIHVzYWdlc1xuICAgICAgICB7bmFtZSwgbGluZSwgY29sdW1ufSA9IHVzYWdlXG4gICAgICAgIGNvbHVtbk9mZnNldFtsaW5lXSA/PSAwXG4gICAgICAgIGxvZy5kZWJ1ZyAnUmVwbGFjaW5nJywgdXNhZ2UsICd3aXRoJywgbmV3TmFtZSwgJ2luJywgZWRpdG9yLmlkXG4gICAgICAgIGxvZy5kZWJ1ZyAnT2Zmc2V0IGZvciBsaW5lJywgbGluZSwgJ2lzJywgY29sdW1uT2Zmc2V0W2xpbmVdXG4gICAgICAgIGJ1ZmZlci5zZXRUZXh0SW5SYW5nZShbXG4gICAgICAgICAgW2xpbmUgLSAxLCBjb2x1bW4gKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgbmFtZS5sZW5ndGggKyBjb2x1bW5PZmZzZXRbbGluZV1dLFxuICAgICAgICAgIF0sIG5ld05hbWUpXG4gICAgICAgIGNvbHVtbk9mZnNldFtsaW5lXSArPSBuZXdOYW1lLmxlbmd0aCAtIG5hbWUubGVuZ3RoXG4gICAgICBidWZmZXIuc2F2ZSgpXG5cblxuICBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50OiAoZWRpdG9yLCBncmFtbWFyKSAtPlxuICAgIGV2ZW50TmFtZSA9ICdrZXl1cCdcbiAgICBldmVudElkID0gXCIje2VkaXRvci5pZH0uI3tldmVudE5hbWV9XCJcbiAgICBpZiBncmFtbWFyLnNjb3BlTmFtZSA9PSAnc291cmNlLnB5dGhvbidcblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dUb29sdGlwcycpIGlzIHRydWVcbiAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24gKGV2ZW50KSA9PlxuICAgICAgICAgIEBfc2hvd1NpZ25hdHVyZU92ZXJsYXkoZXZlbnQsIEApXG5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJylcbiAgICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBrZXl1cCBldmVudHMgZHVlIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHNldHRpbmdzLidcbiAgICAgICAgcmV0dXJuXG4gICAgICBkaXNwb3NhYmxlID0gQF9hZGRFdmVudExpc3RlbmVyIGVkaXRvciwgZXZlbnROYW1lLCAoZSkgPT5cbiAgICAgICAgaWYgYXRvbS5rZXltYXBzLmtleXN0cm9rZUZvcktleWJvYXJkRXZlbnQoZSkgPT0gJ14oJ1xuICAgICAgICAgIGxvZy5kZWJ1ZyAnVHJ5aW5nIHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBvbiBrZXl1cCBldmVudCcsIGVcbiAgICAgICAgICBAX2NvbXBsZXRlQXJndW1lbnRzKGVkaXRvciwgZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGRpc3Bvc2FibGVcbiAgICAgIEBzdWJzY3JpcHRpb25zW2V2ZW50SWRdID0gZGlzcG9zYWJsZVxuICAgICAgbG9nLmRlYnVnICdTdWJzY3JpYmVkIG9uIGV2ZW50JywgZXZlbnRJZFxuICAgIGVsc2VcbiAgICAgIGlmIGV2ZW50SWQgb2YgQHN1YnNjcmlwdGlvbnNcbiAgICAgICAgQHN1YnNjcmlwdGlvbnNbZXZlbnRJZF0uZGlzcG9zZSgpXG4gICAgICAgIGxvZy5kZWJ1ZyAnVW5zdWJzY3JpYmVkIGZyb20gZXZlbnQnLCBldmVudElkXG5cbiAgX3NlcmlhbGl6ZTogKHJlcXVlc3QpIC0+XG4gICAgbG9nLmRlYnVnICdTZXJpYWxpemluZyByZXF1ZXN0IHRvIGJlIHNlbnQgdG8gSmVkaScsIHJlcXVlc3RcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmVxdWVzdClcblxuICBfc2VuZFJlcXVlc3Q6IChkYXRhLCByZXNwYXduZWQpIC0+XG4gICAgbG9nLmRlYnVnICdQZW5kaW5nIHJlcXVlc3RzOicsIE9iamVjdC5rZXlzKEByZXF1ZXN0cykubGVuZ3RoLCBAcmVxdWVzdHNcbiAgICBpZiBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCA+IDEwXG4gICAgICBsb2cuZGVidWcgJ0NsZWFuaW5nIHVwIHJlcXVlc3QgcXVldWUgdG8gYXZvaWQgb3ZlcmZsb3csIGlnbm9yaW5nIHJlcXVlc3QnXG4gICAgICBAcmVxdWVzdHMgPSB7fVxuICAgICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgICBsb2cuZGVidWcgJ0tpbGxpbmcgcHl0aG9uIHByb2Nlc3MnXG4gICAgICAgIEBwcm92aWRlci5raWxsKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBpZiBAcHJvdmlkZXIgYW5kIEBwcm92aWRlci5wcm9jZXNzXG4gICAgICBwcm9jZXNzID0gQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgIGlmIHByb2Nlc3MuZXhpdENvZGUgPT0gbnVsbCBhbmQgcHJvY2Vzcy5zaWduYWxDb2RlID09IG51bGxcbiAgICAgICAgaWYgQHByb3ZpZGVyLnByb2Nlc3MucGlkXG4gICAgICAgICAgcmV0dXJuIEBwcm92aWRlci5wcm9jZXNzLnN0ZGluLndyaXRlKGRhdGEgKyAnXFxuJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxvZy5kZWJ1ZyAnQXR0ZW1wdCB0byBjb21tdW5pY2F0ZSB3aXRoIHRlcm1pbmF0ZWQgcHJvY2VzcycsIEBwcm92aWRlclxuICAgICAgZWxzZSBpZiByZXNwYXduZWRcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICAgW1wiRmFpbGVkIHRvIHNwYXduIGRhZW1vbiBmb3IgYXV0b2NvbXBsZXRlLXB5dGhvbi5cIlxuICAgICAgICAgICBcIkNvbXBsZXRpb25zIHdpbGwgbm90IHdvcmsgYW55bW9yZVwiXG4gICAgICAgICAgIFwidW5sZXNzIHlvdSByZXN0YXJ0IHlvdXIgZWRpdG9yLlwiXS5qb2luKCcgJyksIHtcbiAgICAgICAgICBkZXRhaWw6IFtcImV4aXRDb2RlOiAje3Byb2Nlc3MuZXhpdENvZGV9XCJcbiAgICAgICAgICAgICAgICAgICBcInNpZ25hbENvZGU6ICN7cHJvY2Vzcy5zaWduYWxDb2RlfVwiXS5qb2luKCdcXG4nKSxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgICAgIEBkaXNwb3NlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQF9zcGF3bkRhZW1vbigpXG4gICAgICAgIEBfc2VuZFJlcXVlc3QoZGF0YSwgcmVzcGF3bmVkOiB0cnVlKVxuICAgICAgICBsb2cuZGVidWcgJ1JlLXNwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xuICAgIGVsc2VcbiAgICAgIGxvZy5kZWJ1ZyAnU3Bhd25pbmcgcHl0aG9uIHByb2Nlc3MuLi4nXG4gICAgICBAX3NwYXduRGFlbW9uKClcbiAgICAgIEBfc2VuZFJlcXVlc3QoZGF0YSlcblxuICBfZGVzZXJpYWxpemU6IChyZXNwb25zZSkgLT5cbiAgICBsb2cuZGVidWcgJ0Rlc2VyZWFsaXppbmcgcmVzcG9uc2UgZnJvbSBKZWRpJywgcmVzcG9uc2VcbiAgICBsb2cuZGVidWcgXCJHb3QgI3tyZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpLmxlbmd0aH0gbGluZXNcIlxuICAgIGZvciByZXNwb25zZVNvdXJjZSBpbiByZXNwb25zZS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgICB0cnlcbiAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlU291cmNlKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJcIlwiRmFpbGVkIHRvIHBhcnNlIEpTT04gZnJvbSBcXFwiI3tyZXNwb25zZVNvdXJjZX1cXFwiLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgT3JpZ2luYWwgZXhjZXB0aW9uOiAje2V9XCJcIlwiKVxuXG4gICAgICBpZiByZXNwb25zZVsnYXJndW1lbnRzJ11cbiAgICAgICAgZWRpdG9yID0gQHJlcXVlc3RzW3Jlc3BvbnNlWydpZCddXVxuICAgICAgICBpZiB0eXBlb2YgZWRpdG9yID09ICdvYmplY3QnXG4gICAgICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgICMgQ29tcGFyZSByZXNwb25zZSBJRCB3aXRoIGN1cnJlbnQgc3RhdGUgdG8gYXZvaWQgc3RhbGUgY29tcGxldGlvbnNcbiAgICAgICAgICBpZiByZXNwb25zZVsnaWQnXSA9PSBAX2dlbmVyYXRlUmVxdWVzdElkKCdhcmd1bWVudHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICAgICAgQHNuaXBwZXRzTWFuYWdlcj8uaW5zZXJ0U25pcHBldChyZXNwb25zZVsnYXJndW1lbnRzJ10sIGVkaXRvcilcbiAgICAgIGVsc2VcbiAgICAgICAgcmVzb2x2ZSA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cbiAgICAgICAgaWYgdHlwZW9mIHJlc29sdmUgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2VbJ3Jlc3VsdHMnXSlcbiAgICAgIGNhY2hlU2l6ZURlbHRhID0gT2JqZWN0LmtleXMoQHJlc3BvbnNlcykubGVuZ3RoID4gQGNhY2hlU2l6ZVxuICAgICAgaWYgY2FjaGVTaXplRGVsdGEgPiAwXG4gICAgICAgIGlkcyA9IE9iamVjdC5rZXlzKEByZXNwb25zZXMpLnNvcnQgKGEsIGIpID0+XG4gICAgICAgICAgcmV0dXJuIEByZXNwb25zZXNbYV1bJ3RpbWVzdGFtcCddIC0gQHJlc3BvbnNlc1tiXVsndGltZXN0YW1wJ11cbiAgICAgICAgZm9yIGlkIGluIGlkcy5zbGljZSgwLCBjYWNoZVNpemVEZWx0YSlcbiAgICAgICAgICBsb2cuZGVidWcgJ1JlbW92aW5nIG9sZCBpdGVtIGZyb20gY2FjaGUgd2l0aCBJRCcsIGlkXG4gICAgICAgICAgZGVsZXRlIEByZXNwb25zZXNbaWRdXG4gICAgICBAcmVzcG9uc2VzW3Jlc3BvbnNlWydpZCddXSA9XG4gICAgICAgIHNvdXJjZTogcmVzcG9uc2VTb3VyY2VcbiAgICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpXG4gICAgICBsb2cuZGVidWcgJ0NhY2hlZCByZXF1ZXN0IHdpdGggSUQnLCByZXNwb25zZVsnaWQnXVxuICAgICAgZGVsZXRlIEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cblxuICBfZ2VuZXJhdGVSZXF1ZXN0SWQ6ICh0eXBlLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCB0ZXh0KSAtPlxuICAgIGlmIG5vdCB0ZXh0XG4gICAgICB0ZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuICAgIHJldHVybiByZXF1aXJlKCdjcnlwdG8nKS5jcmVhdGVIYXNoKCdtZDUnKS51cGRhdGUoW1xuICAgICAgZWRpdG9yLmdldFBhdGgoKSwgdGV4dCwgYnVmZmVyUG9zaXRpb24ucm93LFxuICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uLCB0eXBlXS5qb2luKCkpLmRpZ2VzdCgnaGV4JylcblxuICBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnOiAtPlxuICAgIGV4dHJhUGF0aHMgPSBASW50ZXJwcmV0ZXJMb29rdXAuYXBwbHlTdWJzdGl0dXRpb25zKFxuICAgICAgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmV4dHJhUGF0aHMnKS5zcGxpdCgnOycpKVxuICAgIGFyZ3MgPVxuICAgICAgJ2V4dHJhUGF0aHMnOiBleHRyYVBhdGhzXG4gICAgICAndXNlU25pcHBldHMnOiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udXNlU25pcHBldHMnKVxuICAgICAgJ2Nhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nOiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLmNhc2VJbnNlbnNpdGl2ZUNvbXBsZXRpb24nKVxuICAgICAgJ3Nob3dEZXNjcmlwdGlvbnMnOiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgICdhdXRvY29tcGxldGUtcHl0aG9uLnNob3dEZXNjcmlwdGlvbnMnKVxuICAgICAgJ2Z1enp5TWF0Y2hlcic6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgIHJldHVybiBhcmdzXG5cbiAgc2V0U25pcHBldHNNYW5hZ2VyOiAoQHNuaXBwZXRzTWFuYWdlcikgLT5cblxuICBfY29tcGxldGVBcmd1bWVudHM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBmb3JjZSkgLT5cbiAgICB1c2VTbmlwcGV0cyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VTbmlwcGV0cycpXG4gICAgaWYgbm90IGZvcmNlIGFuZCB1c2VTbmlwcGV0cyA9PSAnbm9uZSdcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS10ZXh0LWVkaXRvcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKVxuICAgICAgcmV0dXJuXG4gICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuICAgIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShAZGlzYWJsZUZvclNlbGVjdG9yKVxuICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIGluc2lkZSBvZicsIHNjb3BlQ2hhaW5cbiAgICAgIHJldHVyblxuXG4gICAgIyB3ZSBkb24ndCB3YW50IHRvIGNvbXBsZXRlIGFyZ3VtZW50cyBpbnNpZGUgb2YgZXhpc3RpbmcgY29kZVxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBsaW5lID0gbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XVxuICAgIHByZWZpeCA9IGxpbmUuc2xpY2UoYnVmZmVyUG9zaXRpb24uY29sdW1uIC0gMSwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgIGlmIHByZWZpeCBpc250ICcoJ1xuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIHdpdGggcHJlZml4JywgcHJlZml4XG4gICAgICByZXR1cm5cbiAgICBzdWZmaXggPSBsaW5lLnNsaWNlIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiwgbGluZS5sZW5ndGhcbiAgICBpZiBub3QgL14oXFwpKD86JHxcXHMpfFxcc3wkKS8udGVzdChzdWZmaXgpXG4gICAgICBsb2cuZGVidWcgJ0lnbm9yaW5nIGFyZ3VtZW50IGNvbXBsZXRpb24gd2l0aCBzdWZmaXgnLCBzdWZmaXhcbiAgICAgIHJldHVyblxuXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnYXJndW1lbnRzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ2FyZ3VtZW50cydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gZWRpdG9yXG5cbiAgX2Z1enp5RmlsdGVyOiAoY2FuZGlkYXRlcywgcXVlcnkpIC0+XG4gICAgaWYgY2FuZGlkYXRlcy5sZW5ndGggaXNudCAwIGFuZCBxdWVyeSBub3QgaW4gWycgJywgJy4nLCAnKCddXG4gICAgICBjYW5kaWRhdGVzID0gQGZpbHRlcihjYW5kaWRhdGVzLCBxdWVyeSwga2V5OiAndGV4dCcpXG4gICAgcmV0dXJuIGNhbmRpZGF0ZXNcblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgQGxvYWQoKVxuICAgIGlmIG5vdCBAdHJpZ2dlckNvbXBsZXRpb25SZWdleC50ZXN0KHByZWZpeClcbiAgICAgIHJldHVybiBAbGFzdFN1Z2dlc3Rpb25zID0gW11cbiAgICBidWZmZXJQb3NpdGlvbiA9XG4gICAgICByb3c6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmZ1enp5TWF0Y2hlcicpXG4gICAgICAjIHdlIHdhbnQgdG8gZG8gb3VyIG93biBmaWx0ZXJpbmcsIGhpZGUgYW55IGV4aXN0aW5nIHN1ZmZpeCBmcm9tIEplZGlcbiAgICAgIGxpbmUgPSBsaW5lc1tidWZmZXJQb3NpdGlvbi5yb3ddXG4gICAgICBsYXN0SWRlbnRpZmllciA9IC9cXC4/W2EtekEtWl9dW2EtekEtWjAtOV9dKiQvLmV4ZWMoXG4gICAgICAgIGxpbmUuc2xpY2UgMCwgYnVmZmVyUG9zaXRpb24uY29sdW1uKVxuICAgICAgaWYgbGFzdElkZW50aWZpZXJcbiAgICAgICAgYnVmZmVyUG9zaXRpb24uY29sdW1uID0gbGFzdElkZW50aWZpZXIuaW5kZXggKyAxXG4gICAgICAgIGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd10gPSBsaW5lLnNsaWNlKDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcbiAgICByZXF1ZXN0SWQgPSBAX2dlbmVyYXRlUmVxdWVzdElkKFxuICAgICAgJ2NvbXBsZXRpb25zJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgbGluZXMuam9pbignXFxuJykpXG4gICAgaWYgcmVxdWVzdElkIG9mIEByZXNwb25zZXNcbiAgICAgIGxvZy5kZWJ1ZyAnVXNpbmcgY2FjaGVkIHJlc3BvbnNlIHdpdGggSUQnLCByZXF1ZXN0SWRcbiAgICAgICMgV2UgaGF2ZSB0byBwYXJzZSBKU09OIG9uIGVhY2ggcmVxdWVzdCBoZXJlIHRvIHBhc3Mgb25seSBhIGNvcHlcbiAgICAgIG1hdGNoZXMgPSBKU09OLnBhcnNlKEByZXNwb25zZXNbcmVxdWVzdElkXVsnc291cmNlJ10pWydyZXN1bHRzJ11cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgICByZXR1cm4gQGxhc3RTdWdnZXN0aW9ucyA9IEBfZnV6enlGaWx0ZXIobWF0Y2hlcywgcHJlZml4KVxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gQGxhc3RTdWdnZXN0aW9ucyA9IG1hdGNoZXNcbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiByZXF1ZXN0SWRcbiAgICAgIHByZWZpeDogcHJlZml4XG4gICAgICBsb29rdXA6ICdjb21wbGV0aW9ucydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAobWF0Y2hlcykgPT5cbiAgICAgICAgICByZXNvbHZlKEBsYXN0U3VnZ2VzdGlvbnMgPSBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeCkpXG4gICAgICBlbHNlXG4gICAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IChzdWdnZXN0aW9ucykgPT5cbiAgICAgICAgICByZXNvbHZlKEBsYXN0U3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucylcblxuICBnZXREZWZpbml0aW9uczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnZGVmaW5pdGlvbnMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAnZGVmaW5pdGlvbnMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSByZXNvbHZlXG5cbiAgZ2V0VXNhZ2VzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBwYXlsb2FkID1cbiAgICAgIGlkOiBAX2dlbmVyYXRlUmVxdWVzdElkKCd1c2FnZXMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAndXNhZ2VzJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gIGdldE1ldGhvZHM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGluZGVudCA9IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgIGxpbmVzID0gZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClcbiAgICBsaW5lcy5zcGxpY2UoYnVmZmVyUG9zaXRpb24ucm93ICsgMSwgMCwgXCIgIGRlZiBfX2F1dG9jb21wbGV0ZV9weXRob24ocyk6XCIpXG4gICAgbGluZXMuc3BsaWNlKGJ1ZmZlclBvc2l0aW9uLnJvdyArIDIsIDAsIFwiICAgIHMuXCIpXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgnbWV0aG9kcycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICdtZXRob2RzJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBsaW5lcy5qb2luKCdcXG4nKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93ICsgMlxuICAgICAgY29sdW1uOiA2XG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gKG1ldGhvZHMpIC0+XG4gICAgICAgIHJlc29sdmUoe21ldGhvZHMsIGluZGVudCwgYnVmZmVyUG9zaXRpb259KVxuXG4gIGdvVG9EZWZpbml0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBpZiBub3QgZWRpdG9yXG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBub3QgYnVmZmVyUG9zaXRpb25cbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiBAZGVmaW5pdGlvbnNWaWV3XG4gICAgICBAZGVmaW5pdGlvbnNWaWV3LmRlc3Ryb3koKVxuICAgIEBkZWZpbml0aW9uc1ZpZXcgPSBuZXcgQERlZmluaXRpb25zVmlldygpXG4gICAgQGdldERlZmluaXRpb25zKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHJlc3VsdHMpID0+XG4gICAgICBAZGVmaW5pdGlvbnNWaWV3LnNldEl0ZW1zKHJlc3VsdHMpXG4gICAgICBpZiByZXN1bHRzLmxlbmd0aCA9PSAxXG4gICAgICAgIEBkZWZpbml0aW9uc1ZpZXcuY29uZmlybWVkKHJlc3VsdHNbMF0pXG5cbiAgZGlzcG9zZTogLT5cbiAgICBpZiBAZGlzcG9zYWJsZXNcbiAgICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBpZiBAcHJvdmlkZXJcbiAgICAgIEBwcm92aWRlci5raWxsKClcbiJdfQ==
