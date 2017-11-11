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
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref = this.markers;
        for (i = 0, len = ref.length; i < len; i++) {
          marker = ref[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = this.Selector.create(disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        persistent: false,
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref1, text, type, view;
          if (results.length > 0) {
            ref1 = results[0], text = ref1.text, fileName = ref1.fileName, line = ref1.line, column = ref1.column, type = ref1.type, description = ref1.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            return log.debug('decorated marker', marker);
          }
        };
      })(this));
    },
    _handleGrammarChangeEvent: function(editor, grammar) {
      var disposable, eventId, eventName;
      eventName = 'keyup';
      eventId = editor.id + "." + eventName;
      if (grammar.scopeName === 'source.python') {
        if (atom.config.get('autocomplete-python.showTooltips') === true) {
          editor.onDidChangeCursorPosition((function(_this) {
            return function(event) {
              return _this._showSignatureOverlay(event);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBRU4sTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxnQkFBVjtJQUNBLGtCQUFBLEVBQW9CLGlEQURwQjtJQUVBLGlCQUFBLEVBQW1CLENBRm5CO0lBR0Esa0JBQUEsRUFBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixDQUhwQjtJQUlBLG9CQUFBLEVBQXNCLEtBSnRCO0lBS0EsU0FBQSxFQUFXLEVBTFg7SUFPQSxpQkFBQSxFQUFtQixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLE9BQXBCO0FBQ2pCLFVBQUE7TUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE1BQW5CO01BQ2IsVUFBVSxDQUFDLGdCQUFYLENBQTRCLFNBQTVCLEVBQXVDLE9BQXZDO01BQ0EsVUFBQSxHQUFpQixJQUFBLElBQUMsQ0FBQSxVQUFELENBQVksU0FBQTtRQUMzQixHQUFHLENBQUMsS0FBSixDQUFVLG9DQUFWLEVBQWdELFNBQWhELEVBQTJELE9BQTNEO2VBQ0EsVUFBVSxDQUFDLG1CQUFYLENBQStCLFNBQS9CLEVBQTBDLE9BQTFDO01BRjJCLENBQVo7QUFHakIsYUFBTztJQU5VLENBUG5CO0lBZUEsa0JBQUEsRUFBb0IsU0FBQyxLQUFEO01BQ2xCLElBQUcsSUFBQyxDQUFBLG9CQUFKO0FBQ0UsZUFERjs7TUFFQSxHQUFHLENBQUMsT0FBSixDQUFZLDRCQUFaLEVBQTBDLEtBQTFDO01BQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUNFLG1EQURGLEVBQ3VEO1FBQ3JELE1BQUEsRUFBUSxxTUFB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QSxlQUFlLENBQUMsT0FBakIsQ0FBQSxFQURGOztNQUVBLElBQUMsQ0FBQSxlQUFELEdBQXVCLElBQUEsSUFBQyxDQUFBLGVBQUQsQ0FBQTthQUN2QixJQUFDLENBQUEsY0FBRCxDQUFnQixNQUFoQixFQUF3QixjQUF4QixDQUF1QyxDQUFDLElBQXhDLENBQTZDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO1VBQzNDLEtBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBMEIsT0FBMUI7VUFDQSxJQUFHLE9BQU8sQ0FBQyxNQUFSLEtBQWtCLENBQXJCO21CQUNFLEtBQUMsQ0FBQSxlQUFlLENBQUMsU0FBakIsQ0FBMkIsT0FBUSxDQUFBLENBQUEsQ0FBbkMsRUFERjs7UUFGMkM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDO0lBUmMsQ0E5ZmhCO0lBMmdCQSxPQUFBLEVBQVMsU0FBQTtNQUNQLElBQUcsSUFBQyxDQUFBLFdBQUo7UUFDRSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQSxFQURGOztNQUVBLElBQUcsSUFBQyxDQUFBLFFBQUo7ZUFDRSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBQSxFQURGOztJQUhPLENBM2dCVDs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbImxvZyA9IHJlcXVpcmUgJy4vbG9nJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHNlbGVjdG9yOiAnLnNvdXJjZS5weXRob24nXG4gIGRpc2FibGVGb3JTZWxlY3RvcjogJy5zb3VyY2UucHl0aG9uIC5jb21tZW50LCAuc291cmNlLnB5dGhvbiAuc3RyaW5nJ1xuICBpbmNsdXNpb25Qcmlvcml0eTogMlxuICBzdWdnZXN0aW9uUHJpb3JpdHk6IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5zdWdnZXN0aW9uUHJpb3JpdHknKVxuICBleGNsdWRlTG93ZXJQcmlvcml0eTogZmFsc2VcbiAgY2FjaGVTaXplOiAxMFxuXG4gIF9hZGRFdmVudExpc3RlbmVyOiAoZWRpdG9yLCBldmVudE5hbWUsIGhhbmRsZXIpIC0+XG4gICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyBlZGl0b3JcbiAgICBlZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIgZXZlbnROYW1lLCBoYW5kbGVyXG4gICAgZGlzcG9zYWJsZSA9IG5ldyBARGlzcG9zYWJsZSAtPlxuICAgICAgbG9nLmRlYnVnICdVbnN1YnNjcmliaW5nIGZyb20gZXZlbnQgbGlzdGVuZXIgJywgZXZlbnROYW1lLCBoYW5kbGVyXG4gICAgICBlZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIgZXZlbnROYW1lLCBoYW5kbGVyXG4gICAgcmV0dXJuIGRpc3Bvc2FibGVcblxuICBfbm9FeGVjdXRhYmxlRXJyb3I6IChlcnJvcikgLT5cbiAgICBpZiBAcHJvdmlkZXJOb0V4ZWN1dGFibGVcbiAgICAgIHJldHVyblxuICAgIGxvZy53YXJuaW5nICdObyBweXRob24gZXhlY3V0YWJsZSBmb3VuZCcsIGVycm9yXG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbiB1bmFibGUgdG8gZmluZCBweXRob24gYmluYXJ5LicsIHtcbiAgICAgIGRldGFpbDogXCJcIlwiUGxlYXNlIHNldCBwYXRoIHRvIHB5dGhvbiBleGVjdXRhYmxlIG1hbnVhbGx5IGluIHBhY2thZ2VcbiAgICAgIHNldHRpbmdzIGFuZCByZXN0YXJ0IHlvdXIgZWRpdG9yLiBCZSBzdXJlIHRvIG1pZ3JhdGUgb24gbmV3IHNldHRpbmdzXG4gICAgICBpZiBldmVyeXRoaW5nIHdvcmtlZCBvbiBwcmV2aW91cyB2ZXJzaW9uLlxuICAgICAgRGV0YWlsZWQgZXJyb3IgbWVzc2FnZTogI3tlcnJvcn1cblxuICAgICAgQ3VycmVudCBjb25maWc6ICN7YXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnB5dGhvblBhdGhzJyl9XCJcIlwiXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZX0pXG4gICAgQHByb3ZpZGVyTm9FeGVjdXRhYmxlID0gdHJ1ZVxuXG4gIF9zcGF3bkRhZW1vbjogLT5cbiAgICBpbnRlcnByZXRlciA9IEBJbnRlcnByZXRlckxvb2t1cC5nZXRJbnRlcnByZXRlcigpXG4gICAgbG9nLmRlYnVnICdVc2luZyBpbnRlcnByZXRlcicsIGludGVycHJldGVyXG4gICAgQHByb3ZpZGVyID0gbmV3IEBCdWZmZXJlZFByb2Nlc3NcbiAgICAgIGNvbW1hbmQ6IGludGVycHJldGVyIG9yICdweXRob24nXG4gICAgICBhcmdzOiBbX19kaXJuYW1lICsgJy9jb21wbGV0aW9uLnB5J11cbiAgICAgIHN0ZG91dDogKGRhdGEpID0+XG4gICAgICAgIEBfZGVzZXJpYWxpemUoZGF0YSlcbiAgICAgIHN0ZGVycjogKGRhdGEpID0+XG4gICAgICAgIGlmIGRhdGEuaW5kZXhPZignaXMgbm90IHJlY29nbml6ZWQgYXMgYW4gaW50ZXJuYWwgb3IgZXh0ZXJuYWwnKSA+IC0xXG4gICAgICAgICAgcmV0dXJuIEBfbm9FeGVjdXRhYmxlRXJyb3IoZGF0YSlcbiAgICAgICAgbG9nLmRlYnVnIFwiYXV0b2NvbXBsZXRlLXB5dGhvbiB0cmFjZWJhY2sgb3V0cHV0OiAje2RhdGF9XCJcbiAgICAgICAgaWYgZGF0YS5pbmRleE9mKCdqZWRpJykgPiAtMVxuICAgICAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5vdXRwdXRQcm92aWRlckVycm9ycycpXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAgICAgJycnTG9va3MgbGlrZSB0aGlzIGVycm9yIG9yaWdpbmF0ZWQgZnJvbSBKZWRpLiBQbGVhc2UgZG8gbm90XG4gICAgICAgICAgICAgIHJlcG9ydCBzdWNoIGlzc3VlcyBpbiBhdXRvY29tcGxldGUtcHl0aG9uIGlzc3VlIHRyYWNrZXIuIFJlcG9ydFxuICAgICAgICAgICAgICB0aGVtIGRpcmVjdGx5IHRvIEplZGkuIFR1cm4gb2ZmIGBvdXRwdXRQcm92aWRlckVycm9yc2Agc2V0dGluZ1xuICAgICAgICAgICAgICB0byBoaWRlIHN1Y2ggZXJyb3JzIGluIGZ1dHVyZS4gVHJhY2ViYWNrIG91dHB1dDonJycsIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiBcIiN7ZGF0YX1cIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgJ2F1dG9jb21wbGV0ZS1weXRob24gdHJhY2ViYWNrIG91dHB1dDonLCB7XG4gICAgICAgICAgICAgIGRldGFpbDogXCIje2RhdGF9XCIsXG4gICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlfSlcblxuICAgICAgICBsb2cuZGVidWcgXCJGb3JjaW5nIHRvIHJlc29sdmUgI3tPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aH0gcHJvbWlzZXNcIlxuICAgICAgICBmb3IgcmVxdWVzdElkLCByZXNvbHZlIG9mIEByZXF1ZXN0c1xuICAgICAgICAgIGlmIHR5cGVvZiByZXNvbHZlID09ICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJlc29sdmUoW10pXG4gICAgICAgICAgZGVsZXRlIEByZXF1ZXN0c1tyZXF1ZXN0SWRdXG5cbiAgICAgIGV4aXQ6IChjb2RlKSA9PlxuICAgICAgICBsb2cud2FybmluZyAnUHJvY2VzcyBleGl0IHdpdGgnLCBjb2RlLCBAcHJvdmlkZXJcbiAgICBAcHJvdmlkZXIub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLCBoYW5kbGV9KSA9PlxuICAgICAgaWYgZXJyb3IuY29kZSBpcyAnRU5PRU5UJyBhbmQgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKCdzcGF3bicpIGlzIDBcbiAgICAgICAgQF9ub0V4ZWN1dGFibGVFcnJvcihlcnJvcilcbiAgICAgICAgQGRpc3Bvc2UoKVxuICAgICAgICBoYW5kbGUoKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBlcnJvclxuXG4gICAgQHByb3ZpZGVyLnByb2Nlc3M/LnN0ZGluLm9uICdlcnJvcicsIChlcnIpIC0+XG4gICAgICBsb2cuZGVidWcgJ3N0ZGluJywgZXJyXG5cbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICBsb2cuZGVidWcgJ0tpbGxpbmcgcHl0aG9uIHByb2Nlc3MgYWZ0ZXIgdGltZW91dC4uLidcbiAgICAgIGlmIEBwcm92aWRlciBhbmQgQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgICAgQHByb3ZpZGVyLmtpbGwoKVxuICAgICwgNjAgKiAxMCAqIDEwMDBcblxuICBsb2FkOiAtPlxuICAgIGlmIG5vdCBAY29uc3RydWN0ZWRcbiAgICAgIEBjb25zdHJ1Y3RvcigpXG4gICAgcmV0dXJuIHRoaXNcblxuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICB7QERpc3Bvc2FibGUsIEBDb21wb3NpdGVEaXNwb3NhYmxlLCBAQnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG4gICAge0BzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW59ID0gcmVxdWlyZSAnLi9zY29wZS1oZWxwZXJzJ1xuICAgIHtAU2VsZWN0b3J9ID0gcmVxdWlyZSAnc2VsZWN0b3Ita2l0J1xuICAgIEBEZWZpbml0aW9uc1ZpZXcgPSByZXF1aXJlICcuL2RlZmluaXRpb25zLXZpZXcnXG4gICAgQFVzYWdlc1ZpZXcgPSByZXF1aXJlICcuL3VzYWdlcy12aWV3J1xuICAgIEBPdmVycmlkZVZpZXcgPSByZXF1aXJlICcuL292ZXJyaWRlLXZpZXcnXG4gICAgQFJlbmFtZVZpZXcgPSByZXF1aXJlICcuL3JlbmFtZS12aWV3J1xuICAgIEBJbnRlcnByZXRlckxvb2t1cCA9IHJlcXVpcmUgJy4vaW50ZXJwcmV0ZXJzLWxvb2t1cCdcbiAgICBAXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUnXG4gICAgQGZpbHRlciA9IHJlcXVpcmUoJ2Z1enphbGRyaW4tcGx1cycpLmZpbHRlclxuXG4gICAgQHJlcXVlc3RzID0ge31cbiAgICBAcmVzcG9uc2VzID0ge31cbiAgICBAcHJvdmlkZXIgPSBudWxsXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IEBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIEBkZWZpbml0aW9uc1ZpZXcgPSBudWxsXG4gICAgQHVzYWdlc1ZpZXcgPSBudWxsXG4gICAgQHJlbmFtZVZpZXcgPSBudWxsXG4gICAgQGNvbnN0cnVjdGVkID0gdHJ1ZVxuICAgIEBzbmlwcGV0c01hbmFnZXIgPSBudWxsXG5cbiAgICBsb2cuZGVidWcgXCJJbml0IGF1dG9jb21wbGV0ZS1weXRob24gd2l0aCBwcmlvcml0eSAje0BzdWdnZXN0aW9uUHJpb3JpdHl9XCJcblxuICAgIHRyeVxuICAgICAgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXggPSBSZWdFeHAgYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi50cmlnZ2VyQ29tcGxldGlvblJlZ2V4JylcbiAgICBjYXRjaCBlcnJcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnJydhdXRvY29tcGxldGUtcHl0aG9uIGludmFsaWQgcmVnZXhwIHRvIHRyaWdnZXIgYXV0b2NvbXBsZXRpb25zLlxuICAgICAgICBGYWxsaW5nIGJhY2sgdG8gZGVmYXVsdCB2YWx1ZS4nJycsIHtcbiAgICAgICAgZGV0YWlsOiBcIk9yaWdpbmFsIGV4Y2VwdGlvbjogI3tlcnJ9XCJcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnRyaWdnZXJDb21wbGV0aW9uUmVnZXgnLFxuICAgICAgICAgICAgICAgICAgICAgICcoW1xcLlxcIF18W2EtekEtWl9dW2EtekEtWjAtOV9dKiknKVxuICAgICAgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXggPSAvKFtcXC5cXCBdfFthLXpBLVpfXVthLXpBLVowLTlfXSopL1xuXG4gICAgc2VsZWN0b3IgPSAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXJ+PXB5dGhvbl0nXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOmdvLXRvLWRlZmluaXRpb24nLCA9PlxuICAgICAgQGdvVG9EZWZpbml0aW9uKClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246Y29tcGxldGUtYXJndW1lbnRzJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgQF9jb21wbGV0ZUFyZ3VtZW50cyhlZGl0b3IsIGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLCB0cnVlKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOnNob3ctdXNhZ2VzJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgaWYgQHVzYWdlc1ZpZXdcbiAgICAgICAgQHVzYWdlc1ZpZXcuZGVzdHJveSgpXG4gICAgICBAdXNhZ2VzVmlldyA9IG5ldyBAVXNhZ2VzVmlldygpXG4gICAgICBAZ2V0VXNhZ2VzKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnRoZW4gKHVzYWdlcykgPT5cbiAgICAgICAgQHVzYWdlc1ZpZXcuc2V0SXRlbXModXNhZ2VzKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgc2VsZWN0b3IsICdhdXRvY29tcGxldGUtcHl0aG9uOm92ZXJyaWRlLW1ldGhvZCcsID0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGlmIEBvdmVycmlkZVZpZXdcbiAgICAgICAgQG92ZXJyaWRlVmlldy5kZXN0cm95KClcbiAgICAgIEBvdmVycmlkZVZpZXcgPSBuZXcgQE92ZXJyaWRlVmlldygpXG4gICAgICBAZ2V0TWV0aG9kcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh7bWV0aG9kcywgaW5kZW50LCBidWZmZXJQb3NpdGlvbn0pID0+XG4gICAgICAgIEBvdmVycmlkZVZpZXcuaW5kZW50ID0gaW5kZW50XG4gICAgICAgIEBvdmVycmlkZVZpZXcuYnVmZmVyUG9zaXRpb24gPSBidWZmZXJQb3NpdGlvblxuICAgICAgICBAb3ZlcnJpZGVWaWV3LnNldEl0ZW1zKG1ldGhvZHMpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCBzZWxlY3RvciwgJ2F1dG9jb21wbGV0ZS1weXRob246cmVuYW1lJywgPT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgQGdldFVzYWdlcyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuICh1c2FnZXMpID0+XG4gICAgICAgIGlmIEByZW5hbWVWaWV3XG4gICAgICAgICAgQHJlbmFtZVZpZXcuZGVzdHJveSgpXG4gICAgICAgIGlmIHVzYWdlcy5sZW5ndGggPiAwXG4gICAgICAgICAgQHJlbmFtZVZpZXcgPSBuZXcgQFJlbmFtZVZpZXcodXNhZ2VzKVxuICAgICAgICAgIEByZW5hbWVWaWV3Lm9uSW5wdXQgKG5ld05hbWUpID0+XG4gICAgICAgICAgICBmb3IgZmlsZU5hbWUsIHVzYWdlcyBvZiBAXy5ncm91cEJ5KHVzYWdlcywgJ2ZpbGVOYW1lJylcbiAgICAgICAgICAgICAgW3Byb2plY3QsIF9yZWxhdGl2ZV0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZU5hbWUpXG4gICAgICAgICAgICAgIGlmIHByb2plY3RcbiAgICAgICAgICAgICAgICBAX3VwZGF0ZVVzYWdlc0luRmlsZShmaWxlTmFtZSwgdXNhZ2VzLCBuZXdOYW1lKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBmaWxlIG91dHNpZGUgb2YgcHJvamVjdCcsIGZpbGVOYW1lXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiBAdXNhZ2VzVmlld1xuICAgICAgICAgICAgQHVzYWdlc1ZpZXcuZGVzdHJveSgpXG4gICAgICAgICAgQHVzYWdlc1ZpZXcgPSBuZXcgQFVzYWdlc1ZpZXcoKVxuICAgICAgICAgIEB1c2FnZXNWaWV3LnNldEl0ZW1zKHVzYWdlcylcblxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBlZGl0b3IuZ2V0R3JhbW1hcigpKVxuICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZWRpdG9yLCBncmFtbWFyKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgPT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgICBAX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudChlZGl0b3IsIGVkaXRvci5nZXRHcmFtbWFyKCkpXG5cbiAgX3VwZGF0ZVVzYWdlc0luRmlsZTogKGZpbGVOYW1lLCB1c2FnZXMsIG5ld05hbWUpIC0+XG4gICAgY29sdW1uT2Zmc2V0ID0ge31cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVOYW1lLCBhY3RpdmF0ZUl0ZW06IGZhbHNlKS50aGVuIChlZGl0b3IpIC0+XG4gICAgICBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGZvciB1c2FnZSBpbiB1c2FnZXNcbiAgICAgICAge25hbWUsIGxpbmUsIGNvbHVtbn0gPSB1c2FnZVxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gPz0gMFxuICAgICAgICBsb2cuZGVidWcgJ1JlcGxhY2luZycsIHVzYWdlLCAnd2l0aCcsIG5ld05hbWUsICdpbicsIGVkaXRvci5pZFxuICAgICAgICBsb2cuZGVidWcgJ09mZnNldCBmb3IgbGluZScsIGxpbmUsICdpcycsIGNvbHVtbk9mZnNldFtsaW5lXVxuICAgICAgICBidWZmZXIuc2V0VGV4dEluUmFuZ2UoW1xuICAgICAgICAgIFtsaW5lIC0gMSwgY29sdW1uICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcbiAgICAgICAgICBbbGluZSAtIDEsIGNvbHVtbiArIG5hbWUubGVuZ3RoICsgY29sdW1uT2Zmc2V0W2xpbmVdXSxcbiAgICAgICAgICBdLCBuZXdOYW1lKVxuICAgICAgICBjb2x1bW5PZmZzZXRbbGluZV0gKz0gbmV3TmFtZS5sZW5ndGggLSBuYW1lLmxlbmd0aFxuICAgICAgYnVmZmVyLnNhdmUoKVxuXG5cbiAgX3Nob3dTaWduYXR1cmVPdmVybGF5OiAoZXZlbnQpIC0+XG4gICAgaWYgQG1hcmtlcnNcbiAgICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNcbiAgICAgICAgbG9nLmRlYnVnICdkZXN0cm95aW5nIG9sZCBtYXJrZXInLCBtYXJrZXJcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIEBtYXJrZXJzID0gW11cblxuICAgIGN1cnNvciA9IGV2ZW50LmN1cnNvclxuICAgIGVkaXRvciA9IGV2ZW50LmN1cnNvci5lZGl0b3JcbiAgICB3b3JkQnVmZmVyUmFuZ2UgPSBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSgpXG4gICAgc2NvcGVEZXNjcmlwdG9yID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKFxuICAgICAgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pXG4gICAgc2NvcGVDaGFpbiA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZUNoYWluKClcblxuICAgIGRpc2FibGVGb3JTZWxlY3RvciA9IFwiI3tAZGlzYWJsZUZvclNlbGVjdG9yfSwgLnNvdXJjZS5weXRob24gLm51bWVyaWMsIC5zb3VyY2UucHl0aG9uIC5pbnRlZ2VyLCAuc291cmNlLnB5dGhvbiAuZGVjaW1hbCwgLnNvdXJjZS5weXRob24gLnB1bmN0dWF0aW9uLCAuc291cmNlLnB5dGhvbiAua2V5d29yZCwgLnNvdXJjZS5weXRob24gLnN0b3JhZ2UsIC5zb3VyY2UucHl0aG9uIC52YXJpYWJsZS5wYXJhbWV0ZXIsIC5zb3VyY2UucHl0aG9uIC5lbnRpdHkubmFtZVwiXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShkaXNhYmxlRm9yU2VsZWN0b3IpXG5cbiAgICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICAgIGxvZy5kZWJ1ZyAnZG8gbm90aGluZyBmb3IgdGhpcyBzZWxlY3RvcidcbiAgICAgIHJldHVyblxuXG4gICAgbWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShcbiAgICAgIHdvcmRCdWZmZXJSYW5nZSxcbiAgICAgIHtwZXJzaXN0ZW50OiBmYWxzZSwgaW52YWxpZGF0ZTogJ25ldmVyJ30pXG5cbiAgICBAbWFya2Vycy5wdXNoKG1hcmtlcilcblxuICAgIGdldFRvb2x0aXAgPSAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgPT5cbiAgICAgIHBheWxvYWQgPVxuICAgICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgndG9vbHRpcCcsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICAgIGxvb2t1cDogJ3Rvb2x0aXAnXG4gICAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcbiAgICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICAgIGdldFRvb2x0aXAoZWRpdG9yLCBldmVudC5uZXdCdWZmZXJQb3NpdGlvbikudGhlbiAocmVzdWx0cykgPT5cbiAgICAgIGlmIHJlc3VsdHMubGVuZ3RoID4gMFxuICAgICAgICB7dGV4dCwgZmlsZU5hbWUsIGxpbmUsIGNvbHVtbiwgdHlwZSwgZGVzY3JpcHRpb259ID0gcmVzdWx0c1swXVxuXG4gICAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24udHJpbSgpXG4gICAgICAgIGlmIG5vdCBkZXNjcmlwdGlvblxuICAgICAgICAgIHJldHVyblxuICAgICAgICB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXV0b2NvbXBsZXRlLXB5dGhvbi1zdWdnZXN0aW9uJylcbiAgICAgICAgdmlldy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkZXNjcmlwdGlvbikpXG4gICAgICAgIGRlY29yYXRpb24gPSBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgICAgICBpdGVtOiB2aWV3LFxuICAgICAgICAgICAgcG9zaXRpb246ICdoZWFkJ1xuICAgICAgICB9KVxuICAgICAgICBsb2cuZGVidWcoJ2RlY29yYXRlZCBtYXJrZXInLCBtYXJrZXIpXG5cbiAgX2hhbmRsZUdyYW1tYXJDaGFuZ2VFdmVudDogKGVkaXRvciwgZ3JhbW1hcikgLT5cbiAgICBldmVudE5hbWUgPSAna2V5dXAnXG4gICAgZXZlbnRJZCA9IFwiI3tlZGl0b3IuaWR9LiN7ZXZlbnROYW1lfVwiXG4gICAgaWYgZ3JhbW1hci5zY29wZU5hbWUgPT0gJ3NvdXJjZS5weXRob24nXG5cbiAgICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93VG9vbHRpcHMnKSBpcyB0cnVlXG4gICAgICAgIGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uIChldmVudCkgPT5cbiAgICAgICAgICBAX3Nob3dTaWduYXR1cmVPdmVybGF5KGV2ZW50KVxuXG4gICAgICBpZiBub3QgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicpXG4gICAgICAgIGxvZy5kZWJ1ZyAnSWdub3Jpbmcga2V5dXAgZXZlbnRzIGR1ZSB0byBhdXRvY29tcGxldGUtcGx1cyBzZXR0aW5ncy4nXG4gICAgICAgIHJldHVyblxuICAgICAgZGlzcG9zYWJsZSA9IEBfYWRkRXZlbnRMaXN0ZW5lciBlZGl0b3IsIGV2ZW50TmFtZSwgKGUpID0+XG4gICAgICAgIGlmIGF0b20ua2V5bWFwcy5rZXlzdHJva2VGb3JLZXlib2FyZEV2ZW50KGUpID09ICdeKCdcbiAgICAgICAgICBsb2cuZGVidWcgJ1RyeWluZyB0byBjb21wbGV0ZSBhcmd1bWVudHMgb24ga2V5dXAgZXZlbnQnLCBlXG4gICAgICAgICAgQF9jb21wbGV0ZUFyZ3VtZW50cyhlZGl0b3IsIGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBkaXNwb3NhYmxlXG4gICAgICBAc3Vic2NyaXB0aW9uc1tldmVudElkXSA9IGRpc3Bvc2FibGVcbiAgICAgIGxvZy5kZWJ1ZyAnU3Vic2NyaWJlZCBvbiBldmVudCcsIGV2ZW50SWRcbiAgICBlbHNlXG4gICAgICBpZiBldmVudElkIG9mIEBzdWJzY3JpcHRpb25zXG4gICAgICAgIEBzdWJzY3JpcHRpb25zW2V2ZW50SWRdLmRpc3Bvc2UoKVxuICAgICAgICBsb2cuZGVidWcgJ1Vuc3Vic2NyaWJlZCBmcm9tIGV2ZW50JywgZXZlbnRJZFxuXG4gIF9zZXJpYWxpemU6IChyZXF1ZXN0KSAtPlxuICAgIGxvZy5kZWJ1ZyAnU2VyaWFsaXppbmcgcmVxdWVzdCB0byBiZSBzZW50IHRvIEplZGknLCByZXF1ZXN0XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpXG5cbiAgX3NlbmRSZXF1ZXN0OiAoZGF0YSwgcmVzcGF3bmVkKSAtPlxuICAgIGxvZy5kZWJ1ZyAnUGVuZGluZyByZXF1ZXN0czonLCBPYmplY3Qua2V5cyhAcmVxdWVzdHMpLmxlbmd0aCwgQHJlcXVlc3RzXG4gICAgaWYgT2JqZWN0LmtleXMoQHJlcXVlc3RzKS5sZW5ndGggPiAxMFxuICAgICAgbG9nLmRlYnVnICdDbGVhbmluZyB1cCByZXF1ZXN0IHF1ZXVlIHRvIGF2b2lkIG92ZXJmbG93LCBpZ25vcmluZyByZXF1ZXN0J1xuICAgICAgQHJlcXVlc3RzID0ge31cbiAgICAgIGlmIEBwcm92aWRlciBhbmQgQHByb3ZpZGVyLnByb2Nlc3NcbiAgICAgICAgbG9nLmRlYnVnICdLaWxsaW5nIHB5dGhvbiBwcm9jZXNzJ1xuICAgICAgICBAcHJvdmlkZXIua2lsbCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgaWYgQHByb3ZpZGVyIGFuZCBAcHJvdmlkZXIucHJvY2Vzc1xuICAgICAgcHJvY2VzcyA9IEBwcm92aWRlci5wcm9jZXNzXG4gICAgICBpZiBwcm9jZXNzLmV4aXRDb2RlID09IG51bGwgYW5kIHByb2Nlc3Muc2lnbmFsQ29kZSA9PSBudWxsXG4gICAgICAgIGlmIEBwcm92aWRlci5wcm9jZXNzLnBpZFxuICAgICAgICAgIHJldHVybiBAcHJvdmlkZXIucHJvY2Vzcy5zdGRpbi53cml0ZShkYXRhICsgJ1xcbicpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsb2cuZGVidWcgJ0F0dGVtcHQgdG8gY29tbXVuaWNhdGUgd2l0aCB0ZXJtaW5hdGVkIHByb2Nlc3MnLCBAcHJvdmlkZXJcbiAgICAgIGVsc2UgaWYgcmVzcGF3bmVkXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgIFtcIkZhaWxlZCB0byBzcGF3biBkYWVtb24gZm9yIGF1dG9jb21wbGV0ZS1weXRob24uXCJcbiAgICAgICAgICAgXCJDb21wbGV0aW9ucyB3aWxsIG5vdCB3b3JrIGFueW1vcmVcIlxuICAgICAgICAgICBcInVubGVzcyB5b3UgcmVzdGFydCB5b3VyIGVkaXRvci5cIl0uam9pbignICcpLCB7XG4gICAgICAgICAgZGV0YWlsOiBbXCJleGl0Q29kZTogI3twcm9jZXNzLmV4aXRDb2RlfVwiXG4gICAgICAgICAgICAgICAgICAgXCJzaWduYWxDb2RlOiAje3Byb2Nlc3Muc2lnbmFsQ29kZX1cIl0uam9pbignXFxuJyksXG4gICAgICAgICAgZGlzbWlzc2FibGU6IHRydWV9KVxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBfc3Bhd25EYWVtb24oKVxuICAgICAgICBAX3NlbmRSZXF1ZXN0KGRhdGEsIHJlc3Bhd25lZDogdHJ1ZSlcbiAgICAgICAgbG9nLmRlYnVnICdSZS1zcGF3bmluZyBweXRob24gcHJvY2Vzcy4uLidcbiAgICBlbHNlXG4gICAgICBsb2cuZGVidWcgJ1NwYXduaW5nIHB5dGhvbiBwcm9jZXNzLi4uJ1xuICAgICAgQF9zcGF3bkRhZW1vbigpXG4gICAgICBAX3NlbmRSZXF1ZXN0KGRhdGEpXG5cbiAgX2Rlc2VyaWFsaXplOiAocmVzcG9uc2UpIC0+XG4gICAgbG9nLmRlYnVnICdEZXNlcmVhbGl6aW5nIHJlc3BvbnNlIGZyb20gSmVkaScsIHJlc3BvbnNlXG4gICAgbG9nLmRlYnVnIFwiR290ICN7cmVzcG9uc2UudHJpbSgpLnNwbGl0KCdcXG4nKS5sZW5ndGh9IGxpbmVzXCJcbiAgICBmb3IgcmVzcG9uc2VTb3VyY2UgaW4gcmVzcG9uc2UudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgICAgdHJ5XG4gICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZVNvdXJjZSlcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiXCJcIkZhaWxlZCB0byBwYXJzZSBKU09OIGZyb20gXFxcIiN7cmVzcG9uc2VTb3VyY2V9XFxcIi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIE9yaWdpbmFsIGV4Y2VwdGlvbjogI3tlfVwiXCJcIilcblxuICAgICAgaWYgcmVzcG9uc2VbJ2FyZ3VtZW50cyddXG4gICAgICAgIGVkaXRvciA9IEByZXF1ZXN0c1tyZXNwb25zZVsnaWQnXV1cbiAgICAgICAgaWYgdHlwZW9mIGVkaXRvciA9PSAnb2JqZWN0J1xuICAgICAgICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICAgICAgICAjIENvbXBhcmUgcmVzcG9uc2UgSUQgd2l0aCBjdXJyZW50IHN0YXRlIHRvIGF2b2lkIHN0YWxlIGNvbXBsZXRpb25zXG4gICAgICAgICAgaWYgcmVzcG9uc2VbJ2lkJ10gPT0gQF9nZW5lcmF0ZVJlcXVlc3RJZCgnYXJndW1lbnRzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgICAgICAgIEBzbmlwcGV0c01hbmFnZXI/Lmluc2VydFNuaXBwZXQocmVzcG9uc2VbJ2FyZ3VtZW50cyddLCBlZGl0b3IpXG4gICAgICBlbHNlXG4gICAgICAgIHJlc29sdmUgPSBAcmVxdWVzdHNbcmVzcG9uc2VbJ2lkJ11dXG4gICAgICAgIGlmIHR5cGVvZiByZXNvbHZlID09ICdmdW5jdGlvbidcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlWydyZXN1bHRzJ10pXG4gICAgICBjYWNoZVNpemVEZWx0YSA9IE9iamVjdC5rZXlzKEByZXNwb25zZXMpLmxlbmd0aCA+IEBjYWNoZVNpemVcbiAgICAgIGlmIGNhY2hlU2l6ZURlbHRhID4gMFxuICAgICAgICBpZHMgPSBPYmplY3Qua2V5cyhAcmVzcG9uc2VzKS5zb3J0IChhLCBiKSA9PlxuICAgICAgICAgIHJldHVybiBAcmVzcG9uc2VzW2FdWyd0aW1lc3RhbXAnXSAtIEByZXNwb25zZXNbYl1bJ3RpbWVzdGFtcCddXG4gICAgICAgIGZvciBpZCBpbiBpZHMuc2xpY2UoMCwgY2FjaGVTaXplRGVsdGEpXG4gICAgICAgICAgbG9nLmRlYnVnICdSZW1vdmluZyBvbGQgaXRlbSBmcm9tIGNhY2hlIHdpdGggSUQnLCBpZFxuICAgICAgICAgIGRlbGV0ZSBAcmVzcG9uc2VzW2lkXVxuICAgICAgQHJlc3BvbnNlc1tyZXNwb25zZVsnaWQnXV0gPVxuICAgICAgICBzb3VyY2U6IHJlc3BvbnNlU291cmNlXG4gICAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKVxuICAgICAgbG9nLmRlYnVnICdDYWNoZWQgcmVxdWVzdCB3aXRoIElEJywgcmVzcG9uc2VbJ2lkJ11cbiAgICAgIGRlbGV0ZSBAcmVxdWVzdHNbcmVzcG9uc2VbJ2lkJ11dXG5cbiAgX2dlbmVyYXRlUmVxdWVzdElkOiAodHlwZSwgZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgdGV4dCkgLT5cbiAgICBpZiBub3QgdGV4dFxuICAgICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICByZXR1cm4gcmVxdWlyZSgnY3J5cHRvJykuY3JlYXRlSGFzaCgnbWQ1JykudXBkYXRlKFtcbiAgICAgIGVkaXRvci5nZXRQYXRoKCksIHRleHQsIGJ1ZmZlclBvc2l0aW9uLnJvdyxcbiAgICAgIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiwgdHlwZV0uam9pbigpKS5kaWdlc3QoJ2hleCcpXG5cbiAgX2dlbmVyYXRlUmVxdWVzdENvbmZpZzogLT5cbiAgICBleHRyYVBhdGhzID0gQEludGVycHJldGVyTG9va3VwLmFwcGx5U3Vic3RpdHV0aW9ucyhcbiAgICAgIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5leHRyYVBhdGhzJykuc3BsaXQoJzsnKSlcbiAgICBhcmdzID1cbiAgICAgICdleHRyYVBhdGhzJzogZXh0cmFQYXRoc1xuICAgICAgJ3VzZVNuaXBwZXRzJzogYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLnVzZVNuaXBwZXRzJylcbiAgICAgICdjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJzogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5jYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uJylcbiAgICAgICdzaG93RGVzY3JpcHRpb25zJzogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbi5zaG93RGVzY3JpcHRpb25zJylcbiAgICAgICdmdXp6eU1hdGNoZXInOiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICByZXR1cm4gYXJnc1xuXG4gIHNldFNuaXBwZXRzTWFuYWdlcjogKEBzbmlwcGV0c01hbmFnZXIpIC0+XG5cbiAgX2NvbXBsZXRlQXJndW1lbnRzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgZm9yY2UpIC0+XG4gICAgdXNlU25pcHBldHMgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24udXNlU25pcHBldHMnKVxuICAgIGlmIG5vdCBmb3JjZSBhbmQgdXNlU25pcHBldHMgPT0gJ25vbmUnXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20tdGV4dC1lZGl0b3InKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1dG9jb21wbGV0ZS1wbHVzOmFjdGl2YXRlJylcbiAgICAgIHJldHVyblxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICBzY29wZUNoYWluID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3BlQ2hhaW4oKVxuICAgIGRpc2FibGVGb3JTZWxlY3RvciA9IEBTZWxlY3Rvci5jcmVhdGUoQGRpc2FibGVGb3JTZWxlY3RvcilcbiAgICBpZiBAc2VsZWN0b3JzTWF0Y2hTY29wZUNoYWluKGRpc2FibGVGb3JTZWxlY3Rvciwgc2NvcGVDaGFpbilcbiAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgYXJndW1lbnQgY29tcGxldGlvbiBpbnNpZGUgb2YnLCBzY29wZUNoYWluXG4gICAgICByZXR1cm5cblxuICAgICMgd2UgZG9uJ3Qgd2FudCB0byBjb21wbGV0ZSBhcmd1bWVudHMgaW5zaWRlIG9mIGV4aXN0aW5nIGNvZGVcbiAgICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG4gICAgbGluZSA9IGxpbmVzW2J1ZmZlclBvc2l0aW9uLnJvd11cbiAgICBwcmVmaXggPSBsaW5lLnNsaWNlKGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiAtIDEsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcbiAgICBpZiBwcmVmaXggaXNudCAnKCdcbiAgICAgIGxvZy5kZWJ1ZyAnSWdub3JpbmcgYXJndW1lbnQgY29tcGxldGlvbiB3aXRoIHByZWZpeCcsIHByZWZpeFxuICAgICAgcmV0dXJuXG4gICAgc3VmZml4ID0gbGluZS5zbGljZSBidWZmZXJQb3NpdGlvbi5jb2x1bW4sIGxpbmUubGVuZ3RoXG4gICAgaWYgbm90IC9eKFxcKSg/OiR8XFxzKXxcXHN8JCkvLnRlc3Qoc3VmZml4KVxuICAgICAgbG9nLmRlYnVnICdJZ25vcmluZyBhcmd1bWVudCBjb21wbGV0aW9uIHdpdGggc3VmZml4Jywgc3VmZml4XG4gICAgICByZXR1cm5cblxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ2FyZ3VtZW50cycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICBsb29rdXA6ICdhcmd1bWVudHMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IGVkaXRvclxuXG4gIF9mdXp6eUZpbHRlcjogKGNhbmRpZGF0ZXMsIHF1ZXJ5KSAtPlxuICAgIGlmIGNhbmRpZGF0ZXMubGVuZ3RoIGlzbnQgMCBhbmQgcXVlcnkgbm90IGluIFsnICcsICcuJywgJygnXVxuICAgICAgY2FuZGlkYXRlcyA9IEBmaWx0ZXIoY2FuZGlkYXRlcywgcXVlcnksIGtleTogJ3RleHQnKVxuICAgIHJldHVybiBjYW5kaWRhdGVzXG5cbiAgZ2V0U3VnZ2VzdGlvbnM6ICh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgc2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIEBsb2FkKClcbiAgICBpZiBub3QgQHRyaWdnZXJDb21wbGV0aW9uUmVnZXgudGVzdChwcmVmaXgpXG4gICAgICByZXR1cm4gQGxhc3RTdWdnZXN0aW9ucyA9IFtdXG4gICAgYnVmZmVyUG9zaXRpb24gPVxuICAgICAgcm93OiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgbGluZXMgPSBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5mdXp6eU1hdGNoZXInKVxuICAgICAgIyB3ZSB3YW50IHRvIGRvIG91ciBvd24gZmlsdGVyaW5nLCBoaWRlIGFueSBleGlzdGluZyBzdWZmaXggZnJvbSBKZWRpXG4gICAgICBsaW5lID0gbGluZXNbYnVmZmVyUG9zaXRpb24ucm93XVxuICAgICAgbGFzdElkZW50aWZpZXIgPSAvXFwuP1thLXpBLVpfXVthLXpBLVowLTlfXSokLy5leGVjKFxuICAgICAgICBsaW5lLnNsaWNlIDAsIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbilcbiAgICAgIGlmIGxhc3RJZGVudGlmaWVyXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uLmNvbHVtbiA9IGxhc3RJZGVudGlmaWVyLmluZGV4ICsgMVxuICAgICAgICBsaW5lc1tidWZmZXJQb3NpdGlvbi5yb3ddID0gbGluZS5zbGljZSgwLCBidWZmZXJQb3NpdGlvbi5jb2x1bW4pXG4gICAgcmVxdWVzdElkID0gQF9nZW5lcmF0ZVJlcXVlc3RJZChcbiAgICAgICdjb21wbGV0aW9ucycsIGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIGxpbmVzLmpvaW4oJ1xcbicpKVxuICAgIGlmIHJlcXVlc3RJZCBvZiBAcmVzcG9uc2VzXG4gICAgICBsb2cuZGVidWcgJ1VzaW5nIGNhY2hlZCByZXNwb25zZSB3aXRoIElEJywgcmVxdWVzdElkXG4gICAgICAjIFdlIGhhdmUgdG8gcGFyc2UgSlNPTiBvbiBlYWNoIHJlcXVlc3QgaGVyZSB0byBwYXNzIG9ubHkgYSBjb3B5XG4gICAgICBtYXRjaGVzID0gSlNPTi5wYXJzZShAcmVzcG9uc2VzW3JlcXVlc3RJZF1bJ3NvdXJjZSddKVsncmVzdWx0cyddXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICAgICAgcmV0dXJuIEBsYXN0U3VnZ2VzdGlvbnMgPSBAX2Z1enp5RmlsdGVyKG1hdGNoZXMsIHByZWZpeClcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIEBsYXN0U3VnZ2VzdGlvbnMgPSBtYXRjaGVzXG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogcmVxdWVzdElkXG4gICAgICBwcmVmaXg6IHByZWZpeFxuICAgICAgbG9va3VwOiAnY29tcGxldGlvbnMnXG4gICAgICBwYXRoOiBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvd1xuICAgICAgY29sdW1uOiBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICAgIGNvbmZpZzogQF9nZW5lcmF0ZVJlcXVlc3RDb25maWcoKVxuXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZnV6enlNYXRjaGVyJylcbiAgICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gKG1hdGNoZXMpID0+XG4gICAgICAgICAgcmVzb2x2ZShAbGFzdFN1Z2dlc3Rpb25zID0gQF9mdXp6eUZpbHRlcihtYXRjaGVzLCBwcmVmaXgpKVxuICAgICAgZWxzZVxuICAgICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSAoc3VnZ2VzdGlvbnMpID0+XG4gICAgICAgICAgcmVzb2x2ZShAbGFzdFN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnMpXG5cbiAgZ2V0RGVmaW5pdGlvbnM6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ2RlZmluaXRpb25zJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ2RlZmluaXRpb25zJ1xuICAgICAgcGF0aDogZWRpdG9yLmdldFBhdGgoKVxuICAgICAgc291cmNlOiBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIGNvbHVtbjogYnVmZmVyUG9zaXRpb24uY29sdW1uXG4gICAgICBjb25maWc6IEBfZ2VuZXJhdGVSZXF1ZXN0Q29uZmlnKClcblxuICAgIEBfc2VuZFJlcXVlc3QoQF9zZXJpYWxpemUocGF5bG9hZCkpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgQHJlcXVlc3RzW3BheWxvYWQuaWRdID0gcmVzb2x2ZVxuXG4gIGdldFVzYWdlczogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgcGF5bG9hZCA9XG4gICAgICBpZDogQF9nZW5lcmF0ZVJlcXVlc3RJZCgndXNhZ2VzJywgZWRpdG9yLCBidWZmZXJQb3NpdGlvbilcbiAgICAgIGxvb2t1cDogJ3VzYWdlcydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IHJlc29sdmVcblxuICBnZXRNZXRob2RzOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICBpbmRlbnQgPSBidWZmZXJQb3NpdGlvbi5jb2x1bW5cbiAgICBsaW5lcyA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRMaW5lcygpXG4gICAgbGluZXMuc3BsaWNlKGJ1ZmZlclBvc2l0aW9uLnJvdyArIDEsIDAsIFwiICBkZWYgX19hdXRvY29tcGxldGVfcHl0aG9uKHMpOlwiKVxuICAgIGxpbmVzLnNwbGljZShidWZmZXJQb3NpdGlvbi5yb3cgKyAyLCAwLCBcIiAgICBzLlwiKVxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ21ldGhvZHMnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAnbWV0aG9kcydcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogbGluZXMuam9pbignXFxuJylcbiAgICAgIGxpbmU6IGJ1ZmZlclBvc2l0aW9uLnJvdyArIDJcbiAgICAgIGNvbHVtbjogNlxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG5cbiAgICBAX3NlbmRSZXF1ZXN0KEBfc2VyaWFsaXplKHBheWxvYWQpKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgIEByZXF1ZXN0c1twYXlsb2FkLmlkXSA9IChtZXRob2RzKSAtPlxuICAgICAgICByZXNvbHZlKHttZXRob2RzLCBpbmRlbnQsIGJ1ZmZlclBvc2l0aW9ufSlcblxuICBnb1RvRGVmaW5pdGlvbjogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAgaWYgbm90IGVkaXRvclxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgaWYgbm90IGJ1ZmZlclBvc2l0aW9uXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQGRlZmluaXRpb25zVmlld1xuICAgICAgQGRlZmluaXRpb25zVmlldy5kZXN0cm95KClcbiAgICBAZGVmaW5pdGlvbnNWaWV3ID0gbmV3IEBEZWZpbml0aW9uc1ZpZXcoKVxuICAgIEBnZXREZWZpbml0aW9ucyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgICAgQGRlZmluaXRpb25zVmlldy5zZXRJdGVtcyhyZXN1bHRzKVxuICAgICAgaWYgcmVzdWx0cy5sZW5ndGggPT0gMVxuICAgICAgICBAZGVmaW5pdGlvbnNWaWV3LmNvbmZpcm1lZChyZXN1bHRzWzBdKVxuXG4gIGRpc3Bvc2U6IC0+XG4gICAgaWYgQGRpc3Bvc2FibGVzXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgaWYgQHByb3ZpZGVyXG4gICAgICBAcHJvdmlkZXIua2lsbCgpXG4iXX0=
