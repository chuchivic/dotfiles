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
    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-text-editor', 'goto-definition:go', this.go.bind(this)));
    if (atom.config.get('goto-definition.contextMenuDisplayAtFirst')) {
      this.subscriptions.add(atom.contextMenu.add(this.firstContextMenu));
      atom.contextMenu.itemSets.unshift(atom.contextMenu.itemSets.pop());
    } else {
      this.subscriptions.add(atom.contextMenu.add(this.normalContextMenu));
    }
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
    var self = this;
    return {
      providerName: 'goto-definition-hyperclick',
      wordRegExp: /[$0-9a-zA-Z_-]+/g,
      getSuggestionForWord: function getSuggestionForWord(editor, text, range) {
        return {
          range: range,
          callback: function callback() {
            if (text) {
              self.go(editor);
            }
          }
        };
      }
    };
  },

  go: function go(editor) {
    var _this = this;

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
      _this.state = 'searching';
      _this.definitionsView.addItems(items);
    };

    var callback = function callback() {
      _this.state = 'completed';
      if (_this.definitionsView.items.length === 0) {
        _this.definitionsView.show();
      } else if (_this.definitionsView.items.length === 1) {
        _this.definitionsView.confirmedFirst();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvZ290by1kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztvQkFHb0MsTUFBTTs7K0JBQ2Qsb0JBQW9COzs7O3dCQUMzQixZQUFZOzs7O3NCQUNkLFVBQVU7Ozs7cUJBRWQ7QUFDYixRQUFNLEVBQUU7QUFDTiw2QkFBeUIsRUFBRTtBQUN6QixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELG1CQUFlLEVBQUU7QUFDZixVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtHQUNGOztBQUVELGtCQUFnQixFQUFFO0FBQ2hCLHNCQUFrQixFQUFFLENBQ2xCO0FBQ0UsV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixhQUFPLEVBQUUsb0JBQW9CO0tBQzlCLEVBQUU7QUFDRCxVQUFJLEVBQUUsV0FBVztLQUNsQixDQUNGO0dBQ0Y7O0FBRUQsbUJBQWlCLEVBQUU7QUFDakIsc0JBQWtCLEVBQUUsQ0FDbEI7QUFDRSxXQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGFBQU8sRUFBRSxvQkFBb0I7S0FDOUIsQ0FDRjtHQUNGOztBQUVELFVBQVEsRUFBQSxvQkFBRztBQUNULFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUM7QUFDL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hHLFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsMkNBQTJDLENBQUMsRUFBRTtBQUNoRSxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBQ3BFLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQ3BFLE1BQU07QUFDTCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0tBQ3RFO0dBQ0Y7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUM5Qjs7QUFFRCxpQkFBZSxFQUFBLHlCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDakMsV0FBTyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsSUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUM7QUFDNUQsZUFBUyxFQUFULFNBQVM7QUFDVCw4QkFBd0IsRUFBRSxJQUFJO0tBQy9CLENBQUMsQ0FBQSxDQUFFLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUM5Qzs7QUFFRCxnQkFBYyxFQUFBLHdCQUFDLE1BQU0sRUFBRTtBQUNyQixRQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsUUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGFBQU87QUFDTCxlQUFPLEVBQUUsbUNBQW1DO09BQzdDLENBQUM7S0FDSDtBQUNELFFBQU0sYUFBYSxVQUFRLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEFBQUUsQ0FBQzs7QUFFdkQsUUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUNyQixRQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBQ3JCLFFBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFRLENBQUM7QUFDekMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsVUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFVBQU0sYUFBYSxHQUFHLG9CQUFPLFdBQVcsQ0FBQyxDQUFDO0FBQzFDLFVBQUksYUFBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDL0MsWUFBSSxhQUFhLENBQUMsWUFBWSxFQUFFO0FBQzlCLHVCQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7bUJBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7V0FBQSxDQUFDLENBQUM7U0FDM0Q7O0FBRUQsb0JBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7T0FDaEM7S0FDRjtBQUNELFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOzs7QUFDNUMsVUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFVBQU0sYUFBYSxHQUFHLG9CQUFPLFdBQVcsQ0FBQyxDQUFDOztBQUUxQyxzQkFBQSxXQUFXLEVBQUMsSUFBSSxNQUFBLGtDQUFJLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxNQUFNO09BQUEsQ0FBQyxFQUFDLENBQUM7QUFDOUQsb0JBQUEsU0FBUyxFQUFDLElBQUksTUFBQSxnQ0FBSSxhQUFhLENBQUMsS0FBSyxFQUFDLENBQUM7QUFDdkMsaUJBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM3Qzs7QUFFRCxRQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzVCLGFBQU87QUFDTCxlQUFPLEVBQUUsMkRBQTJEO09BQ3JFLENBQUM7S0FDSDs7QUFFRCxlQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEYsUUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEUsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7QUFDdkIsYUFBTztBQUNMLGVBQU8sRUFBRSxtQkFBbUI7T0FDN0IsQ0FBQztLQUNIOztBQUVELGVBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQ3RFLGFBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQUEsQ0FBQyxDQUFDOztBQUVsRSxXQUFPO0FBQ0wsV0FBSyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7QUFDckQsZUFBUyxFQUFFLFNBQVM7S0FDckIsQ0FBQztHQUNIOztBQUVELGFBQVcsRUFBQSx1QkFBRztBQUNaLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixXQUFPO0FBQ0wsa0JBQVksRUFBRSw0QkFBNEI7QUFDMUMsZ0JBQVUsRUFBRSxrQkFBa0I7QUFDOUIsMEJBQW9CLEVBQUUsOEJBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLO2VBQU07QUFDOUMsZUFBSyxFQUFMLEtBQUs7QUFDTCxrQkFBUSxFQUFBLG9CQUFHO0FBQ1QsZ0JBQUksSUFBSSxFQUFFO0FBQ1Isa0JBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDakI7V0FDRjtTQUNGO09BQUM7S0FDSCxDQUFDO0dBQ0g7O0FBRUQsSUFBRSxFQUFBLFlBQUMsTUFBTSxFQUFFOzs7QUFDVCxRQUFNLFlBQVksR0FBRyxBQUNuQixNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssWUFBWSxHQUNoRCxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOzswQkFFWixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQzs7UUFBL0QsS0FBSyxtQkFBTCxLQUFLO1FBQUUsU0FBUyxtQkFBVCxTQUFTO1FBQUUsT0FBTyxtQkFBUCxPQUFPOztBQUNqQyxRQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1YsYUFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMvQzs7QUFFRCxRQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDeEIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUMvQjs7QUFFRCxRQUFJLENBQUMsZUFBZSxHQUFHLGtDQUFxQixDQUFDO0FBQzdDLFFBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDOztBQUV2QixRQUFNLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBSSxLQUFLLEVBQUs7QUFDMUIsWUFBSyxLQUFLLEdBQUcsV0FBVyxDQUFDO0FBQ3pCLFlBQUssZUFBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN0QyxDQUFDOztBQUVGLFFBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxHQUFTO0FBQ3JCLFlBQUssS0FBSyxHQUFHLFdBQVcsQ0FBQztBQUN6QixVQUFJLE1BQUssZUFBZSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzNDLGNBQUssZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO09BQzdCLE1BQU0sSUFBSSxNQUFLLGVBQWUsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNsRCxjQUFLLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztPQUN2QztLQUNGLENBQUM7O0FBRUYsUUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2FBQUksQ0FBQyxDQUFDLElBQUk7S0FBQSxDQUFDLENBQUM7O0FBRWpFLFFBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsRUFBRTtBQUN0RCw0QkFBUyxXQUFXLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNyRixNQUFNO0FBQ0wsNEJBQVMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUMzRjtBQUNELFdBQU8sSUFBSSxDQUFDO0dBQ2I7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9nb3RvLWRlZmluaXRpb24vbGliL2dvdG8tZGVmaW5pdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgRGVmaW5pdGlvbnNWaWV3IGZyb20gJy4vZGVmaW5pdGlvbnMtdmlldyc7XG5pbXBvcnQgU2VhcmNoZXIgZnJvbSAnLi9zZWFyY2hlcic7XG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IHtcbiAgICBjb250ZXh0TWVudURpc3BsYXlBdEZpcnN0OiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiB0cnVlLFxuICAgIH0sXG4gICAgcGVyZm9ybWFuY2VNb2RlOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB9LFxuICB9LFxuXG4gIGZpcnN0Q29udGV4dE1lbnU6IHtcbiAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdHb3RvIERlZmluaXRpb24nLFxuICAgICAgICBjb21tYW5kOiAnZ290by1kZWZpbml0aW9uOmdvJyxcbiAgICAgIH0sIHtcbiAgICAgICAgdHlwZTogJ3NlcGFyYXRvcicsXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG5cbiAgbm9ybWFsQ29udGV4dE1lbnU6IHtcbiAgICAnYXRvbS10ZXh0LWVkaXRvcic6IFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdHb3RvIERlZmluaXRpb24nLFxuICAgICAgICBjb21tYW5kOiAnZ290by1kZWZpbml0aW9uOmdvJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3InLCAnZ290by1kZWZpbml0aW9uOmdvJywgdGhpcy5nby5iaW5kKHRoaXMpKSk7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnZ290by1kZWZpbml0aW9uLmNvbnRleHRNZW51RGlzcGxheUF0Rmlyc3QnKSkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh0aGlzLmZpcnN0Q29udGV4dE1lbnUpKTtcbiAgICAgIGF0b20uY29udGV4dE1lbnUuaXRlbVNldHMudW5zaGlmdChhdG9tLmNvbnRleHRNZW51Lml0ZW1TZXRzLnBvcCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbnRleHRNZW51LmFkZCh0aGlzLm5vcm1hbENvbnRleHRNZW51KSk7XG4gICAgfVxuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBnZXRTZWxlY3RlZFdvcmQoZWRpdG9yLCB3b3JkUmVnZXgpIHtcbiAgICByZXR1cm4gKGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSB8fCBlZGl0b3IuZ2V0V29yZFVuZGVyQ3Vyc29yKHtcbiAgICAgIHdvcmRSZWdleCxcbiAgICAgIGluY2x1ZGVOb25Xb3JkQ2hhcmFjdGVyczogdHJ1ZSxcbiAgICB9KSkucmVwbGFjZSgvWy0vXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpO1xuICB9LFxuXG4gIGdldFNjYW5PcHRpb25zKGVkaXRvcikge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZXNzYWdlOiAnVGhpcyBmaWxlIG11c3QgYmUgc2F2ZWQgdG8gZGlzayAuJyxcbiAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBgKi4ke2ZpbGVQYXRoLnNwbGl0KCcuJykucG9wKCl9YDtcblxuICAgIGNvbnN0IHNjYW5HcmFtbWFycyA9IFtdO1xuICAgIGxldCBzY2FuUmVnZXhlcyA9IFtdO1xuICAgIGxldCBzY2FuRmlsZXMgPSBbXTtcbiAgICBsZXQgd29yZFJlZ2V4ZXMgPSBbXTtcbiAgICBjb25zdCBncmFtbWFyTmFtZXMgPSBPYmplY3Qua2V5cyhDb25maWcpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ3JhbW1hck5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBncmFtbWFyTmFtZSA9IGdyYW1tYXJOYW1lc1tpXTtcbiAgICAgIGNvbnN0IGdyYW1tYXJPcHRpb24gPSBDb25maWdbZ3JhbW1hck5hbWVdO1xuICAgICAgaWYgKGdyYW1tYXJPcHRpb24uZmlsZXMuaW5jbHVkZXMoZmlsZUV4dGVuc2lvbikpIHtcbiAgICAgICAgaWYgKGdyYW1tYXJPcHRpb24uZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgICAgZ3JhbW1hck9wdGlvbi5kZXBlbmRlbmNpZXMubWFwKHggPT4gc2NhbkdyYW1tYXJzLnB1c2goeCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NhbkdyYW1tYXJzLnB1c2goZ3JhbW1hck5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjYW5HcmFtbWFycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZ3JhbW1hck5hbWUgPSBzY2FuR3JhbW1hcnNbaV07XG4gICAgICBjb25zdCBncmFtbWFyT3B0aW9uID0gQ29uZmlnW2dyYW1tYXJOYW1lXTtcblxuICAgICAgc2NhblJlZ2V4ZXMucHVzaCguLi5ncmFtbWFyT3B0aW9uLnJlZ2V4ZXMubWFwKHggPT4geC5zb3VyY2UpKTtcbiAgICAgIHNjYW5GaWxlcy5wdXNoKC4uLmdyYW1tYXJPcHRpb24uZmlsZXMpO1xuICAgICAgd29yZFJlZ2V4ZXMucHVzaChncmFtbWFyT3B0aW9uLndvcmQuc291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAoc2NhblJlZ2V4ZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZXNzYWdlOiAnVGhpcyBsYW5ndWFnZSBpcyBub3Qgc3VwcG9ydGVkIC4gUHVsbCBSZXF1ZXN0IFdlbGNvbWUg8J+Rjy4nLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB3b3JkUmVnZXhlcyA9IHdvcmRSZWdleGVzLmZpbHRlcigoZSwgaSwgYSkgPT4gYS5sYXN0SW5kZXhPZihlKSA9PT0gaSkuam9pbignfCcpO1xuICAgIGNvbnN0IHdvcmQgPSB0aGlzLmdldFNlbGVjdGVkV29yZChlZGl0b3IsIG5ldyBSZWdFeHAod29yZFJlZ2V4ZXMsICdpJykpO1xuICAgIGlmICghd29yZC50cmltKCkubGVuZ3RoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZXNzYWdlOiAnVW5rbm93biBrZXl3b3JkIC4nLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBzY2FuUmVnZXhlcyA9IHNjYW5SZWdleGVzLmZpbHRlcigoZSwgaSwgYSkgPT4gYS5sYXN0SW5kZXhPZihlKSA9PT0gaSk7XG4gICAgc2NhbkZpbGVzID0gc2NhbkZpbGVzLmZpbHRlcigoZSwgaSwgYSkgPT4gYS5sYXN0SW5kZXhPZihlKSA9PT0gaSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVnZXg6IHNjYW5SZWdleGVzLmpvaW4oJ3wnKS5yZXBsYWNlKC97d29yZH0vZywgd29yZCksXG4gICAgICBmaWxlVHlwZXM6IHNjYW5GaWxlcyxcbiAgICB9O1xuICB9LFxuXG4gIGdldFByb3ZpZGVyKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICBwcm92aWRlck5hbWU6ICdnb3RvLWRlZmluaXRpb24taHlwZXJjbGljaycsXG4gICAgICB3b3JkUmVnRXhwOiAvWyQwLTlhLXpBLVpfLV0rL2csXG4gICAgICBnZXRTdWdnZXN0aW9uRm9yV29yZDogKGVkaXRvciwgdGV4dCwgcmFuZ2UpID0+ICh7XG4gICAgICAgIHJhbmdlLFxuICAgICAgICBjYWxsYmFjaygpIHtcbiAgICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgc2VsZi5nbyhlZGl0b3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgIH07XG4gIH0sXG5cbiAgZ28oZWRpdG9yKSB7XG4gICAgY29uc3QgYWN0aXZlRWRpdG9yID0gKFxuICAgICAgZWRpdG9yICYmIGVkaXRvci5jb25zdHJ1Y3Rvci5uYW1lID09PSAnVGV4dEVkaXRvcidcbiAgICApID8gZWRpdG9yIDogYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuXG4gICAgY29uc3QgeyByZWdleCwgZmlsZVR5cGVzLCBtZXNzYWdlIH0gPSB0aGlzLmdldFNjYW5PcHRpb25zKGFjdGl2ZUVkaXRvcik7XG4gICAgaWYgKCFyZWdleCkge1xuICAgICAgcmV0dXJuIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmRlZmluaXRpb25zVmlldykge1xuICAgICAgdGhpcy5kZWZpbml0aW9uc1ZpZXcuY2FuY2VsKCk7XG4gICAgfVxuXG4gICAgdGhpcy5kZWZpbml0aW9uc1ZpZXcgPSBuZXcgRGVmaW5pdGlvbnNWaWV3KCk7XG4gICAgdGhpcy5zdGF0ZSA9ICdzdGFydGVkJztcblxuICAgIGNvbnN0IGl0ZXJhdG9yID0gKGl0ZW1zKSA9PiB7XG4gICAgICB0aGlzLnN0YXRlID0gJ3NlYXJjaGluZyc7XG4gICAgICB0aGlzLmRlZmluaXRpb25zVmlldy5hZGRJdGVtcyhpdGVtcyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5zdGF0ZSA9ICdjb21wbGV0ZWQnO1xuICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmRlZmluaXRpb25zVmlldy5zaG93KCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICB0aGlzLmRlZmluaXRpb25zVmlldy5jb25maXJtZWRGaXJzdCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBzY2FuUGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5tYXAoeCA9PiB4LnBhdGgpO1xuXG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgnZ290by1kZWZpbml0aW9uLnBlcmZvcm1hbmNlTW9kZScpKSB7XG4gICAgICBTZWFyY2hlci5yaXBncmVwU2NhbihhY3RpdmVFZGl0b3IsIHNjYW5QYXRocywgZmlsZVR5cGVzLCByZWdleCwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgU2VhcmNoZXIuYXRvbVdvcmtzcGFjZVNjYW4oYWN0aXZlRWRpdG9yLCBzY2FuUGF0aHMsIGZpbGVUeXBlcywgcmVnZXgsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxufTtcbiJdfQ==