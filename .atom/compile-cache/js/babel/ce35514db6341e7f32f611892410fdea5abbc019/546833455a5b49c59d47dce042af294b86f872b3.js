Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

/** @babel */

// eslint-disable-next-line

var _atom = require('atom');

var _definitionsView = require('./definitions-view');

var _definitionsView2 = _interopRequireDefault(_definitionsView);

var _searcher = require('./searcher');

var _searcher2 = _interopRequireDefault(_searcher);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

exports['default'] = {
  config: {
    contextMenuDisplayAtFirst: {
      type: 'boolean',
      'default': true
    },
    performanceMode: {
      type: 'boolean',
      'default': false
    },
    disableScopeNames: {
      type: 'array',
      description: 'Scope name list separated by comma(for example "source.js.jsx, source.go")',
      'default': []
    }
  },

  firstContextMenu: {
    'atom-text-editor': [{
      label: 'Goto Definition',
      command: 'goto-definition:go'
    }, {
      type: 'separator'
    }]
  },

  normalContextMenu: {
    'atom-text-editor': [{
      label: 'Goto Definition',
      command: 'goto-definition:go'
    }]
  },

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor', 'goto-definition:go', this.go.bind(this)));
    if (atom.config.get('goto-definition.contextMenuDisplayAtFirst')) {
      this.subscriptions.add(atom.contextMenu.add(this.firstContextMenu));
      atom.contextMenu.itemSets.unshift(atom.contextMenu.itemSets.pop());
    } else {
      this.subscriptions.add(atom.contextMenu.add(this.normalContextMenu));
    }
    this.subscriptions.add(atom.config.observe('goto-definition.disableScopeNames', function (value) {
      _this.disableScopeNames = new Set(value);
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  getSelectedWord: function getSelectedWord(editor, wordRegex) {
    return (editor.getSelectedText() || editor.getWordUnderCursor({
      wordRegex: wordRegex,
      includeNonWordCharacters: true
    })).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  },

  getScanOptions: function getScanOptions(editor) {
    var filePath = editor.getPath();
    if (!filePath) {
      return {
        message: 'This file must be saved to disk .'
      };
    }
    var fileExtension = '*.' + filePath.split('.').pop();

    var scanGrammars = [];
    var scanRegexes = [];
    var scanFiles = [];
    var wordRegexes = [];
    var grammarNames = Object.keys(_config2['default']);
    for (var i = 0; i < grammarNames.length; i++) {
      var grammarName = grammarNames[i];
      var grammarOption = _config2['default'][grammarName];
      if (grammarOption.files.includes(fileExtension)) {
        if (grammarOption.dependencies) {
          grammarOption.dependencies.map(function (x) {
            return scanGrammars.push(x);
          });
        }

        scanGrammars.push(grammarName);
      }
    }
    for (var i = 0; i < scanGrammars.length; i++) {
      var _scanRegexes, _scanFiles;

      var grammarName = scanGrammars[i];
      var grammarOption = _config2['default'][grammarName];

      (_scanRegexes = scanRegexes).push.apply(_scanRegexes, _toConsumableArray(grammarOption.regexes.map(function (x) {
        return x.source;
      })));
      (_scanFiles = scanFiles).push.apply(_scanFiles, _toConsumableArray(grammarOption.files));
      wordRegexes.push(grammarOption.word.source);
    }

    if (scanRegexes.length === 0) {
      return {
        message: 'This language is not supported . Pull Request Welcome 👏.'
      };
    }

    wordRegexes = wordRegexes.filter(function (e, i, a) {
      return a.lastIndexOf(e) === i;
    }).join('|');
    var word = this.getSelectedWord(editor, new RegExp(wordRegexes, 'i'));
    if (!word.trim().length) {
      return {
        message: 'Unknown keyword .'
      };
    }

    scanRegexes = scanRegexes.filter(function (e, i, a) {
      return a.lastIndexOf(e) === i;
    });
    scanFiles = scanFiles.filter(function (e, i, a) {
      return a.lastIndexOf(e) === i;
    });

    return {
      regex: scanRegexes.join('|').replace(/{word}/g, word),
      fileTypes: scanFiles
    };
  },

  getProvider: function getProvider() {
    var _this2 = this;

    var avaiableFileExtensions = new Set(Object.keys(_config2['default']).map(function (key) {
      return _config2['default'][key].files;
    }).reduce(function (a, b) {
      return a.concat(b);
    }));
    return {
      providerName: 'goto-definition-hyperclick',
      wordRegExp: /[$0-9a-zA-Z_-]+/g,
      getSuggestionForWord: function getSuggestionForWord(editor, text, range) {
        if (!text) {
          return null;
        }

        var filePath = editor.getPath();
        if (!filePath) {
          return null;
        }
        var fileExtension = '*.' + filePath.split('.').pop();
        if (!avaiableFileExtensions.has(fileExtension)) {
          return null;
        }

        var _editor$getGrammar = editor.getGrammar();

        var scopeName = _editor$getGrammar.scopeName;

        if (_this2.disableScopeNames.has(scopeName)) {
          return null;
        }

        return {
          range: range,
          callback: function callback() {
            _this2.go(editor);
          }
        };
      }
    };
  },

  go: function go(editor) {
    var _this3 = this;

    var activeEditor = editor && editor.constructor.name === 'TextEditor' ? editor : atom.workspace.getActiveTextEditor();

    var _getScanOptions = this.getScanOptions(activeEditor);

    var regex = _getScanOptions.regex;
    var fileTypes = _getScanOptions.fileTypes;
    var message = _getScanOptions.message;

    if (!regex) {
      return atom.notifications.addWarning(message);
    }

    if (this.definitionsView) {
      this.definitionsView.cancel();
    }

    this.definitionsView = new _definitionsView2['default']();
    this.state = 'started';

    var iterator = function iterator(items) {
      _this3.state = 'searching';
      _this3.definitionsView.addItems(items);
    };

    var callback = function callback() {
      _this3.state = 'completed';
      if (_this3.definitionsView.items.length === 0) {
        _this3.definitionsView.show();
      } else if (_this3.definitionsView.items.length === 1) {
        _this3.definitionsView.confirmedFirst();
      }
    };

    var scanPaths = atom.project.getDirectories().map(function (x) {
      return x.path;
    });

    if (atom.config.get('goto-definition.performanceMode')) {
      _searcher2['default'].ripgrepScan(activeEditor, scanPaths, fileTypes, regex, iterator, callback);
    } else {
      _searcher2['default'].atomWorkspaceScan(activeEditor, scanPaths, fileTypes, regex, iterator, callback);
    }
    return null;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvZ290by1kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFHb0MsTUFBTTs7K0JBQ2Qsb0JBQW9COzs7O3dCQUMzQixZQUFZOzs7O3NCQUNkLFVBQVU7Ozs7cUJBRWQ7QUFDYixRQUFNLEVBQUU7QUFDTiw2QkFBeUIsRUFBRTtBQUN6QixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELG1CQUFlLEVBQUU7QUFDZixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELHFCQUFpQixFQUFFO0FBQ2pCLFVBQUksRUFBRSxPQUFPO0FBQ2IsaUJBQVcsRUFBRSw0RUFBNEU7QUFDekYsaUJBQVMsRUFBRTtLQUNaO0dBQ0Y7O0FBRUQsa0JBQWdCLEVBQUU7QUFDaEIsc0JBQWtCLEVBQUUsQ0FDbEI7QUFDRSxXQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGFBQU8sRUFBRSxvQkFBb0I7S0FDOUIsRUFBRTtBQUNELFVBQUksRUFBRSxXQUFXO0tBQ2xCLENBQ0Y7R0FDRjs7QUFFRCxtQkFBaUIsRUFBRTtBQUNqQixzQkFBa0IsRUFBRSxDQUNsQjtBQUNFLFdBQUssRUFBRSxpQkFBaUI7QUFDeEIsYUFBTyxFQUFFLG9CQUFvQjtLQUM5QixDQUNGO0dBQ0Y7O0FBRUQsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDO0FBQy9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RyxRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxDQUFDLEVBQUU7QUFDaEUsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUNwRSxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztLQUNwRSxNQUFNO0FBQ0wsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztLQUN0RTtBQUNELFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3pGLFlBQUssaUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekMsQ0FBQyxDQUFDLENBQUM7R0FDTDs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQzlCOztBQUVELGlCQUFlLEVBQUEseUJBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUNqQyxXQUFPLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztBQUM1RCxlQUFTLEVBQVQsU0FBUztBQUNULDhCQUF3QixFQUFFLElBQUk7S0FDL0IsQ0FBQyxDQUFBLENBQUUsT0FBTyxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxDQUFDO0dBQzlDOztBQUVELGdCQUFjLEVBQUEsd0JBQUMsTUFBTSxFQUFFO0FBQ3JCLFFBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxRQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsYUFBTztBQUNMLGVBQU8sRUFBRSxtQ0FBbUM7T0FDN0MsQ0FBQztLQUNIO0FBQ0QsUUFBTSxhQUFhLFVBQVEsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQUFBRSxDQUFDOztBQUV2RCxRQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDeEIsUUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNuQixRQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDckIsUUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUkscUJBQVEsQ0FBQztBQUN6QyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxVQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsVUFBTSxhQUFhLEdBQUcsb0JBQU8sV0FBVyxDQUFDLENBQUM7QUFDMUMsVUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUMvQyxZQUFJLGFBQWEsQ0FBQyxZQUFZLEVBQUU7QUFDOUIsdUJBQWEsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQzttQkFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztXQUFBLENBQUMsQ0FBQztTQUMzRDs7QUFFRCxvQkFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztPQUNoQztLQUNGO0FBQ0QsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7OztBQUM1QyxVQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEMsVUFBTSxhQUFhLEdBQUcsb0JBQU8sV0FBVyxDQUFDLENBQUM7O0FBRTFDLHNCQUFBLFdBQVcsRUFBQyxJQUFJLE1BQUEsa0NBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE1BQU07T0FBQSxDQUFDLEVBQUMsQ0FBQztBQUM5RCxvQkFBQSxTQUFTLEVBQUMsSUFBSSxNQUFBLGdDQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUMsQ0FBQztBQUN2QyxpQkFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzdDOztBQUVELFFBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDNUIsYUFBTztBQUNMLGVBQU8sRUFBRSwyREFBMkQ7T0FDckUsQ0FBQztLQUNIOztBQUVELGVBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRixRQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4RSxRQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTtBQUN2QixhQUFPO0FBQ0wsZUFBTyxFQUFFLG1CQUFtQjtPQUM3QixDQUFDO0tBQ0g7O0FBRUQsZUFBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FBQSxDQUFDLENBQUM7QUFDdEUsYUFBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFBSyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FBQSxDQUFDLENBQUM7O0FBRWxFLFdBQU87QUFDTCxXQUFLLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztBQUNyRCxlQUFTLEVBQUUsU0FBUztLQUNyQixDQUFDO0dBQ0g7O0FBRUQsYUFBVyxFQUFBLHVCQUFHOzs7QUFDWixRQUFNLHNCQUFzQixHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHFCQUFRLENBQ3ZELEdBQUcsQ0FBQyxVQUFBLEdBQUc7YUFBSSxvQkFBTyxHQUFHLENBQUMsQ0FBQyxLQUFLO0tBQUEsQ0FBQyxDQUM3QixNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQzthQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQUEsQ0FBQyxDQUFDLENBQUM7QUFDbEMsV0FBTztBQUNMLGtCQUFZLEVBQUUsNEJBQTRCO0FBQzFDLGdCQUFVLEVBQUUsa0JBQWtCO0FBQzlCLDBCQUFvQixFQUFFLDhCQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFLO0FBQzdDLFlBQUksQ0FBQyxJQUFJLEVBQUU7QUFDVCxpQkFBTyxJQUFJLENBQUM7U0FDYjs7QUFFRCxZQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsWUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGlCQUFPLElBQUksQ0FBQztTQUNiO0FBQ0QsWUFBTSxhQUFhLFVBQVEsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQUFBRSxDQUFDO0FBQ3ZELFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDOUMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O2lDQUVxQixNQUFNLENBQUMsVUFBVSxFQUFFOztZQUFqQyxTQUFTLHNCQUFULFNBQVM7O0FBQ2pCLFlBQUksT0FBSyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDekMsaUJBQU8sSUFBSSxDQUFDO1NBQ2I7O0FBRUQsZUFBTztBQUNMLGVBQUssRUFBTCxLQUFLO0FBQ0wsa0JBQVEsRUFBRSxvQkFBTTtBQUNkLG1CQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztXQUNqQjtTQUNGLENBQUM7T0FDSDtLQUNGLENBQUM7R0FDSDs7QUFFRCxJQUFFLEVBQUEsWUFBQyxNQUFNLEVBQUU7OztBQUNULFFBQU0sWUFBWSxHQUFHLEFBQ25CLE1BQU0sSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxZQUFZLEdBQ2hELE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7OzBCQUVaLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDOztRQUEvRCxLQUFLLG1CQUFMLEtBQUs7UUFBRSxTQUFTLG1CQUFULFNBQVM7UUFBRSxPQUFPLG1CQUFQLE9BQU87O0FBQ2pDLFFBQUksQ0FBQyxLQUFLLEVBQUU7QUFDVixhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9DOztBQUVELFFBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtBQUN4QixVQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQy9COztBQUVELFFBQUksQ0FBQyxlQUFlLEdBQUcsa0NBQXFCLENBQUM7QUFDN0MsUUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7O0FBRXZCLFFBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFJLEtBQUssRUFBSztBQUMxQixhQUFLLEtBQUssR0FBRyxXQUFXLENBQUM7QUFDekIsYUFBSyxlQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3RDLENBQUM7O0FBRUYsUUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQVM7QUFDckIsYUFBSyxLQUFLLEdBQUcsV0FBVyxDQUFDO0FBQ3pCLFVBQUksT0FBSyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDM0MsZUFBSyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDN0IsTUFBTSxJQUFJLE9BQUssZUFBZSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ2xELGVBQUssZUFBZSxDQUFDLGNBQWMsRUFBRSxDQUFDO09BQ3ZDO0tBQ0YsQ0FBQzs7QUFFRixRQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7YUFBSSxDQUFDLENBQUMsSUFBSTtLQUFBLENBQUMsQ0FBQzs7QUFFakUsUUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFO0FBQ3RELDRCQUFTLFdBQVcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3JGLE1BQU07QUFDTCw0QkFBUyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNGO0FBQ0QsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvZ290by1kZWZpbml0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCBEZWZpbml0aW9uc1ZpZXcgZnJvbSAnLi9kZWZpbml0aW9ucy12aWV3JztcbmltcG9ydCBTZWFyY2hlciBmcm9tICcuL3NlYXJjaGVyJztcbmltcG9ydCBDb25maWcgZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbmZpZzoge1xuICAgIGNvbnRleHRNZW51RGlzcGxheUF0Rmlyc3Q6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgfSxcbiAgICBwZXJmb3JtYW5jZU1vZGU6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0sXG4gICAgZGlzYWJsZVNjb3BlTmFtZXM6IHtcbiAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1Njb3BlIG5hbWUgbGlzdCBzZXBhcmF0ZWQgYnkgY29tbWEoZm9yIGV4YW1wbGUgXCJzb3VyY2UuanMuanN4LCBzb3VyY2UuZ29cIiknLFxuICAgICAgZGVmYXVsdDogW10sXG4gICAgfSxcbiAgfSxcblxuICBmaXJzdENvbnRleHRNZW51OiB7XG4gICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnR290byBEZWZpbml0aW9uJyxcbiAgICAgICAgY29tbWFuZDogJ2dvdG8tZGVmaW5pdGlvbjpnbycsXG4gICAgICB9LCB7XG4gICAgICAgIHR5cGU6ICdzZXBhcmF0b3InLFxuICAgICAgfSxcbiAgICBdLFxuICB9LFxuXG4gIG5vcm1hbENvbnRleHRNZW51OiB7XG4gICAgJ2F0b20tdGV4dC1lZGl0b3InOiBbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnR290byBEZWZpbml0aW9uJyxcbiAgICAgICAgY29tbWFuZDogJ2dvdG8tZGVmaW5pdGlvbjpnbycsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG5cbiAgYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywgJ2dvdG8tZGVmaW5pdGlvbjpnbycsIHRoaXMuZ28uYmluZCh0aGlzKSkpO1xuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2dvdG8tZGVmaW5pdGlvbi5jb250ZXh0TWVudURpc3BsYXlBdEZpcnN0JykpIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQodGhpcy5maXJzdENvbnRleHRNZW51KSk7XG4gICAgICBhdG9tLmNvbnRleHRNZW51Lml0ZW1TZXRzLnVuc2hpZnQoYXRvbS5jb250ZXh0TWVudS5pdGVtU2V0cy5wb3AoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb250ZXh0TWVudS5hZGQodGhpcy5ub3JtYWxDb250ZXh0TWVudSkpO1xuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2dvdG8tZGVmaW5pdGlvbi5kaXNhYmxlU2NvcGVOYW1lcycsICh2YWx1ZSkgPT4ge1xuICAgICAgdGhpcy5kaXNhYmxlU2NvcGVOYW1lcyA9IG5ldyBTZXQodmFsdWUpO1xuICAgIH0pKTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH0sXG5cbiAgZ2V0U2VsZWN0ZWRXb3JkKGVkaXRvciwgd29yZFJlZ2V4KSB7XG4gICAgcmV0dXJuIChlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkgfHwgZWRpdG9yLmdldFdvcmRVbmRlckN1cnNvcih7XG4gICAgICB3b3JkUmVnZXgsXG4gICAgICBpbmNsdWRlTm9uV29yZENoYXJhY3RlcnM6IHRydWUsXG4gICAgfSkpLnJlcGxhY2UoL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbiAgfSxcblxuICBnZXRTY2FuT3B0aW9ucyhlZGl0b3IpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVzc2FnZTogJ1RoaXMgZmlsZSBtdXN0IGJlIHNhdmVkIHRvIGRpc2sgLicsXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gYCouJHtmaWxlUGF0aC5zcGxpdCgnLicpLnBvcCgpfWA7XG5cbiAgICBjb25zdCBzY2FuR3JhbW1hcnMgPSBbXTtcbiAgICBsZXQgc2NhblJlZ2V4ZXMgPSBbXTtcbiAgICBsZXQgc2NhbkZpbGVzID0gW107XG4gICAgbGV0IHdvcmRSZWdleGVzID0gW107XG4gICAgY29uc3QgZ3JhbW1hck5hbWVzID0gT2JqZWN0LmtleXMoQ29uZmlnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyYW1tYXJOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZ3JhbW1hck5hbWUgPSBncmFtbWFyTmFtZXNbaV07XG4gICAgICBjb25zdCBncmFtbWFyT3B0aW9uID0gQ29uZmlnW2dyYW1tYXJOYW1lXTtcbiAgICAgIGlmIChncmFtbWFyT3B0aW9uLmZpbGVzLmluY2x1ZGVzKGZpbGVFeHRlbnNpb24pKSB7XG4gICAgICAgIGlmIChncmFtbWFyT3B0aW9uLmRlcGVuZGVuY2llcykge1xuICAgICAgICAgIGdyYW1tYXJPcHRpb24uZGVwZW5kZW5jaWVzLm1hcCh4ID0+IHNjYW5HcmFtbWFycy5wdXNoKHgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjYW5HcmFtbWFycy5wdXNoKGdyYW1tYXJOYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzY2FuR3JhbW1hcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGdyYW1tYXJOYW1lID0gc2NhbkdyYW1tYXJzW2ldO1xuICAgICAgY29uc3QgZ3JhbW1hck9wdGlvbiA9IENvbmZpZ1tncmFtbWFyTmFtZV07XG5cbiAgICAgIHNjYW5SZWdleGVzLnB1c2goLi4uZ3JhbW1hck9wdGlvbi5yZWdleGVzLm1hcCh4ID0+IHguc291cmNlKSk7XG4gICAgICBzY2FuRmlsZXMucHVzaCguLi5ncmFtbWFyT3B0aW9uLmZpbGVzKTtcbiAgICAgIHdvcmRSZWdleGVzLnB1c2goZ3JhbW1hck9wdGlvbi53b3JkLnNvdXJjZSk7XG4gICAgfVxuXG4gICAgaWYgKHNjYW5SZWdleGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVzc2FnZTogJ1RoaXMgbGFuZ3VhZ2UgaXMgbm90IHN1cHBvcnRlZCAuIFB1bGwgUmVxdWVzdCBXZWxjb21lIPCfkY8uJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgd29yZFJlZ2V4ZXMgPSB3b3JkUmVnZXhlcy5maWx0ZXIoKGUsIGksIGEpID0+IGEubGFzdEluZGV4T2YoZSkgPT09IGkpLmpvaW4oJ3wnKTtcbiAgICBjb25zdCB3b3JkID0gdGhpcy5nZXRTZWxlY3RlZFdvcmQoZWRpdG9yLCBuZXcgUmVnRXhwKHdvcmRSZWdleGVzLCAnaScpKTtcbiAgICBpZiAoIXdvcmQudHJpbSgpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWVzc2FnZTogJ1Vua25vd24ga2V5d29yZCAuJyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc2NhblJlZ2V4ZXMgPSBzY2FuUmVnZXhlcy5maWx0ZXIoKGUsIGksIGEpID0+IGEubGFzdEluZGV4T2YoZSkgPT09IGkpO1xuICAgIHNjYW5GaWxlcyA9IHNjYW5GaWxlcy5maWx0ZXIoKGUsIGksIGEpID0+IGEubGFzdEluZGV4T2YoZSkgPT09IGkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZ2V4OiBzY2FuUmVnZXhlcy5qb2luKCd8JykucmVwbGFjZSgve3dvcmR9L2csIHdvcmQpLFxuICAgICAgZmlsZVR5cGVzOiBzY2FuRmlsZXMsXG4gICAgfTtcbiAgfSxcblxuICBnZXRQcm92aWRlcigpIHtcbiAgICBjb25zdCBhdmFpYWJsZUZpbGVFeHRlbnNpb25zID0gbmV3IFNldChPYmplY3Qua2V5cyhDb25maWcpXG4gICAgICAubWFwKGtleSA9PiBDb25maWdba2V5XS5maWxlcylcbiAgICAgIC5yZWR1Y2UoKGEsIGIpID0+IGEuY29uY2F0KGIpKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3ZpZGVyTmFtZTogJ2dvdG8tZGVmaW5pdGlvbi1oeXBlcmNsaWNrJyxcbiAgICAgIHdvcmRSZWdFeHA6IC9bJDAtOWEtekEtWl8tXSsvZyxcbiAgICAgIGdldFN1Z2dlc3Rpb25Gb3JXb3JkOiAoZWRpdG9yLCB0ZXh0LCByYW5nZSkgPT4ge1xuICAgICAgICBpZiAoIXRleHQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBgKi4ke2ZpbGVQYXRoLnNwbGl0KCcuJykucG9wKCl9YDtcbiAgICAgICAgaWYgKCFhdmFpYWJsZUZpbGVFeHRlbnNpb25zLmhhcyhmaWxlRXh0ZW5zaW9uKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyBzY29wZU5hbWUgfSA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVTY29wZU5hbWVzLmhhcyhzY29wZU5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmdvKGVkaXRvcik7XG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcblxuICBnbyhlZGl0b3IpIHtcbiAgICBjb25zdCBhY3RpdmVFZGl0b3IgPSAoXG4gICAgICBlZGl0b3IgJiYgZWRpdG9yLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdUZXh0RWRpdG9yJ1xuICAgICkgPyBlZGl0b3IgOiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG5cbiAgICBjb25zdCB7IHJlZ2V4LCBmaWxlVHlwZXMsIG1lc3NhZ2UgfSA9IHRoaXMuZ2V0U2Nhbk9wdGlvbnMoYWN0aXZlRWRpdG9yKTtcbiAgICBpZiAoIXJlZ2V4KSB7XG4gICAgICByZXR1cm4gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGVmaW5pdGlvbnNWaWV3KSB7XG4gICAgICB0aGlzLmRlZmluaXRpb25zVmlldy5jYW5jZWwoKTtcbiAgICB9XG5cbiAgICB0aGlzLmRlZmluaXRpb25zVmlldyA9IG5ldyBEZWZpbml0aW9uc1ZpZXcoKTtcbiAgICB0aGlzLnN0YXRlID0gJ3N0YXJ0ZWQnO1xuXG4gICAgY29uc3QgaXRlcmF0b3IgPSAoaXRlbXMpID0+IHtcbiAgICAgIHRoaXMuc3RhdGUgPSAnc2VhcmNoaW5nJztcbiAgICAgIHRoaXMuZGVmaW5pdGlvbnNWaWV3LmFkZEl0ZW1zKGl0ZW1zKTtcbiAgICB9O1xuXG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICB0aGlzLnN0YXRlID0gJ2NvbXBsZXRlZCc7XG4gICAgICBpZiAodGhpcy5kZWZpbml0aW9uc1ZpZXcuaXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuZGVmaW5pdGlvbnNWaWV3LnNob3coKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5kZWZpbml0aW9uc1ZpZXcuaXRlbXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHRoaXMuZGVmaW5pdGlvbnNWaWV3LmNvbmZpcm1lZEZpcnN0KCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHNjYW5QYXRocyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLm1hcCh4ID0+IHgucGF0aCk7XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdnb3RvLWRlZmluaXRpb24ucGVyZm9ybWFuY2VNb2RlJykpIHtcbiAgICAgIFNlYXJjaGVyLnJpcGdyZXBTY2FuKGFjdGl2ZUVkaXRvciwgc2NhblBhdGhzLCBmaWxlVHlwZXMsIHJlZ2V4LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBTZWFyY2hlci5hdG9tV29ya3NwYWNlU2NhbihhY3RpdmVFZGl0b3IsIHNjYW5QYXRocywgZmlsZVR5cGVzLCByZWdleCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG59O1xuIl19