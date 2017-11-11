(function() {
  var CompositeDisposable, PrettyJSON, formatter,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  formatter = {};

  formatter.space = function(scope) {
    var softTabs, tabLength;
    softTabs = [
      atom.config.get('editor.softTabs', {
        scope: scope
      })
    ];
    tabLength = Number([
      atom.config.get('editor.tabLength', {
        scope: scope
      })
    ]);
    if (softTabs != null) {
      return Array(tabLength + 1).join(' ');
    } else {
      return '\t';
    }
  };

  formatter.stringify = function(obj, options) {
    var BigNumber, JSONbig, scope, sorted, space, stringify;
    scope = (options != null ? options.scope : void 0) != null ? options.scope : null;
    sorted = (options != null ? options.sorted : void 0) != null ? options.sorted : false;
    JSONbig = require('json-bigint');
    stringify = require('json-stable-stringify');
    BigNumber = require('bignumber.js');
    space = formatter.space(scope);
    if (sorted) {
      return stringify(obj, {
        space: space,
        replacer: function(key, value) {
          try {
            if (value.constructor.name === 'BigNumber') {
              return JSONbig.stringify(value);
            }
          } catch (error1) {

          }
          return value;
        }
      });
    } else {
      return JSONbig.stringify(obj, null, space);
    }
  };

  formatter.parseAndValidate = function(text) {
    var JSONbig, error;
    JSONbig = require('json-bigint');
    try {
      return JSONbig.parse(text);
    } catch (error1) {
      error = error1;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: " + error.name + ": " + error.message + " at character " + error.at + " near \"" + error.text + "\"");
      }
      throw error;
    }
  };

  formatter.pretty = function(text, options) {
    var error, parsed;
    try {
      parsed = formatter.parseAndValidate(text);
    } catch (error1) {
      error = error1;
      return text;
    }
    return formatter.stringify(parsed, options);
  };

  formatter.minify = function(text) {
    var error, uglify;
    try {
      formatter.parseAndValidate(text);
    } catch (error1) {
      error = error1;
      return text;
    }
    uglify = require('jsonminify');
    return uglify(text);
  };

  formatter.jsonify = function(text, options) {
    var error, vm;
    vm = require('vm');
    try {
      vm.runInThisContext("newObject = " + text + ";");
    } catch (error1) {
      error = error1;
      if (atom.config.get('pretty-json.notifyOnParseError')) {
        atom.notifications.addWarning("JSON Pretty: eval issue: " + error);
      }
      return text;
    }
    return formatter.stringify(newObject, options);
  };

  PrettyJSON = {
    config: {
      notifyOnParseError: {
        type: 'boolean',
        "default": true
      },
      prettifyOnSaveJSON: {
        type: 'boolean',
        "default": false,
        title: 'Prettify On Save JSON'
      },
      grammars: {
        type: 'array',
        "default": ['source.json', 'text.plain.null-grammar']
      }
    },
    doEntireFile: function(editor) {
      var grammars, ref;
      grammars = atom.config.get('pretty-json.grammars' != null ? 'pretty-json.grammars' : []);
      if (ref = editor != null ? editor.getGrammar().scopeName : void 0, indexOf.call(grammars, ref) < 0) {
        return false;
      }
      return editor.getLastSelection().isEmpty();
    },
    replaceText: function(editor, fn) {
      return editor.mutateSelectedText(function(selection) {
        var range, text;
        selection.getBufferRange();
        text = selection.getText();
        selection.deleteSelectedText();
        range = selection.insertText(fn(text));
        return selection.setBufferRange(range);
      });
    },
    prettify: function(editor, options) {
      var entire, pos, selected, sorted;
      if (editor == null) {
        return;
      }
      entire = (options != null ? options.entire : void 0) != null ? options.entire : this.doEntireFile(editor);
      sorted = (options != null ? options.sorted : void 0) != null ? options.sorted : false;
      selected = (options != null ? options.selected : void 0) != null ? options.selected : true;
      if (entire) {
        pos = editor.getCursorScreenPosition();
        editor.setText(formatter.pretty(editor.getText(), {
          scope: editor.getRootScopeDescriptor(),
          sorted: sorted
        }));
      } else {
        pos = editor.getLastSelection().getScreenRange().start;
        this.replaceText(editor, function(text) {
          return formatter.pretty(text, {
            scope: ['source.json'],
            sorted: sorted
          });
        });
      }
      if (!selected) {
        return editor.setCursorScreenPosition(pos);
      }
    },
    minify: function(editor, options) {
      var entire, pos, selected;
      entire = (options != null ? options.entire : void 0) != null ? options.entire : this.doEntireFile(editor);
      selected = (options != null ? options.selected : void 0) != null ? options.selected : true;
      if (entire) {
        pos = [0, 0];
        editor.setText(formatter.minify(editor.getText()));
      } else {
        pos = editor.getLastSelection().getScreenRange().start;
        this.replaceText(editor, function(text) {
          return formatter.minify(text);
        });
      }
      if (!selected) {
        return editor.setCursorScreenPosition(pos);
      }
    },
    jsonify: function(editor, options) {
      var entire, pos, selected, sorted;
      entire = (options != null ? options.entire : void 0) != null ? options.entire : this.doEntireFile(editor);
      sorted = (options != null ? options.sorted : void 0) != null ? options.sorted : false;
      selected = (options != null ? options.selected : void 0) != null ? options.selected : true;
      if (entire) {
        pos = editor.getCursorScreenPosition();
        editor.setText(formatter.jsonify(editor.getText(), {
          scope: editor.getRootScopeDescriptor(),
          sorted: sorted
        }));
      } else {
        pos = editor.getLastSelection().getScreenRange().start;
        this.replaceText(editor, function(text) {
          return formatter.jsonify(text, {
            scope: ['source.json'],
            sorted: sorted
          });
        });
      }
      if (!selected) {
        return editor.setCursorScreenPosition(pos);
      }
    },
    activate: function() {
      atom.commands.add('atom-workspace', {
        'pretty-json:prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.prettify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: false,
              selected: true
            });
          };
        })(this),
        'pretty-json:minify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.minify(editor, {
              entire: _this.doEntireFile(editor),
              selected: true
            });
          };
        })(this),
        'pretty-json:sort-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.prettify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: true,
              selected: true
            });
          };
        })(this),
        'pretty-json:jsonify-literal-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.jsonify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: false,
              selected: true
            });
          };
        })(this),
        'pretty-json:jsonify-literal-and-sort-and-prettify': (function(_this) {
          return function() {
            var editor;
            editor = atom.workspace.getActiveTextEditor();
            return _this.jsonify(editor, {
              entire: _this.doEntireFile(editor),
              sorted: true,
              selected: true
            });
          };
        })(this)
      });
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.config.observe('pretty-json.prettifyOnSaveJSON', (function(_this) {
        return function(value) {
          var ref;
          if ((ref = _this.saveSubscriptions) != null) {
            ref.dispose();
          }
          _this.saveSubscriptions = new CompositeDisposable();
          if (value) {
            return _this.subscribeToSaveEvents();
          }
        };
      })(this)));
    },
    subscribeToSaveEvents: function() {
      return this.saveSubscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var bufferSubscriptions;
          if (!(editor != null ? editor.getBuffer() : void 0)) {
            return;
          }
          bufferSubscriptions = new CompositeDisposable();
          bufferSubscriptions.add(editor.getBuffer().onWillSave(function(filePath) {
            if (_this.doEntireFile(editor)) {
              return _this.prettify(editor, {
                entire: true,
                sorted: false,
                selected: false
              });
            }
          }));
          bufferSubscriptions.add(editor.getBuffer().onDidDestroy(function() {
            return bufferSubscriptions.dispose();
          }));
          return _this.saveSubscriptions.add(bufferSubscriptions);
        };
      })(this)));
    },
    deactivate: function() {
      var ref;
      if ((ref = this.subscriptions) != null) {
        ref.dispose();
      }
      return this.subscriptions = null;
    }
  };

  module.exports = PrettyJSON;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvcHJldHR5LWpzb24vaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwQ0FBQTtJQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsU0FBQSxHQUFZOztFQUVaLFNBQVMsQ0FBQyxLQUFWLEdBQWtCLFNBQUMsS0FBRDtBQUNoQixRQUFBO0lBQUEsUUFBQSxHQUFXO01BQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixFQUFtQztRQUFBLEtBQUEsRUFBTyxLQUFQO09BQW5DLENBQUQ7O0lBQ1gsU0FBQSxHQUFZLE1BQUEsQ0FBTztNQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0M7UUFBQSxLQUFBLEVBQU8sS0FBUDtPQUFwQyxDQUFEO0tBQVA7SUFDWixJQUFHLGdCQUFIO0FBQ0UsYUFBTyxLQUFBLENBQU0sU0FBQSxHQUFZLENBQWxCLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsR0FBMUIsRUFEVDtLQUFBLE1BQUE7QUFHRSxhQUFPLEtBSFQ7O0VBSGdCOztFQVFsQixTQUFTLENBQUMsU0FBVixHQUFzQixTQUFDLEdBQUQsRUFBTSxPQUFOO0FBQ3BCLFFBQUE7SUFBQSxLQUFBLEdBQVcsa0RBQUgsR0FBd0IsT0FBTyxDQUFDLEtBQWhDLEdBQTJDO0lBQ25ELE1BQUEsR0FBWSxtREFBSCxHQUF5QixPQUFPLENBQUMsTUFBakMsR0FBNkM7SUFHdEQsT0FBQSxHQUFVLE9BQUEsQ0FBUSxhQUFSO0lBQ1YsU0FBQSxHQUFZLE9BQUEsQ0FBUSx1QkFBUjtJQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUjtJQUVaLEtBQUEsR0FBUSxTQUFTLENBQUMsS0FBVixDQUFnQixLQUFoQjtJQUNSLElBQUcsTUFBSDtBQUNFLGFBQU8sU0FBQSxDQUFVLEdBQVYsRUFDTDtRQUFBLEtBQUEsRUFBTyxLQUFQO1FBQ0EsUUFBQSxFQUFVLFNBQUMsR0FBRCxFQUFNLEtBQU47QUFDUjtZQUNFLElBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFsQixLQUEwQixXQUE3QjtBQUNFLHFCQUFPLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEtBQWxCLEVBRFQ7YUFERjtXQUFBLGNBQUE7QUFBQTs7QUFLQSxpQkFBTztRQU5DLENBRFY7T0FESyxFQURUO0tBQUEsTUFBQTtBQVdFLGFBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsR0FBbEIsRUFBdUIsSUFBdkIsRUFBNkIsS0FBN0IsRUFYVDs7RUFWb0I7O0VBdUJ0QixTQUFTLENBQUMsZ0JBQVYsR0FBNkIsU0FBQyxJQUFEO0FBQzNCLFFBQUE7SUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGFBQVI7QUFDVjtBQUNFLGFBQU8sT0FBTyxDQUFDLEtBQVIsQ0FBYyxJQUFkLEVBRFQ7S0FBQSxjQUFBO01BRU07TUFDSixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsQ0FBSDtRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsZUFBQSxHQUFnQixLQUFLLENBQUMsSUFBdEIsR0FBMkIsSUFBM0IsR0FBK0IsS0FBSyxDQUFDLE9BQXJDLEdBQTZDLGdCQUE3QyxHQUE2RCxLQUFLLENBQUMsRUFBbkUsR0FBc0UsVUFBdEUsR0FBZ0YsS0FBSyxDQUFDLElBQXRGLEdBQTJGLElBQXpILEVBREY7O0FBRUEsWUFBTSxNQUxSOztFQUYyQjs7RUFTN0IsU0FBUyxDQUFDLE1BQVYsR0FBbUIsU0FBQyxJQUFELEVBQU8sT0FBUDtBQUNqQixRQUFBO0FBQUE7TUFDRSxNQUFBLEdBQVMsU0FBUyxDQUFDLGdCQUFWLENBQTJCLElBQTNCLEVBRFg7S0FBQSxjQUFBO01BRU07QUFDSixhQUFPLEtBSFQ7O0FBSUEsV0FBTyxTQUFTLENBQUMsU0FBVixDQUFvQixNQUFwQixFQUE0QixPQUE1QjtFQUxVOztFQU9uQixTQUFTLENBQUMsTUFBVixHQUFtQixTQUFDLElBQUQ7QUFDakIsUUFBQTtBQUFBO01BQ0UsU0FBUyxDQUFDLGdCQUFWLENBQTJCLElBQTNCLEVBREY7S0FBQSxjQUFBO01BRU07QUFDSixhQUFPLEtBSFQ7O0lBSUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxZQUFSO0FBQ1QsV0FBTyxNQUFBLENBQU8sSUFBUDtFQU5VOztFQVFuQixTQUFTLENBQUMsT0FBVixHQUFvQixTQUFDLElBQUQsRUFBTyxPQUFQO0FBQ2xCLFFBQUE7SUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7QUFDTDtNQUNFLEVBQUUsQ0FBQyxnQkFBSCxDQUFvQixjQUFBLEdBQWUsSUFBZixHQUFvQixHQUF4QyxFQURGO0tBQUEsY0FBQTtNQUVNO01BQ0osSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLENBQUg7UUFDRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQW5CLENBQThCLDJCQUFBLEdBQTRCLEtBQTFELEVBREY7O0FBRUEsYUFBTyxLQUxUOztBQU1BLFdBQU8sU0FBUyxDQUFDLFNBQVYsQ0FBb0IsU0FBcEIsRUFBK0IsT0FBL0I7RUFSVzs7RUFVcEIsVUFBQSxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsa0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BREY7TUFHQSxrQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxLQUFBLEVBQU8sdUJBRlA7T0FKRjtNQU9BLFFBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxPQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxDQUFDLGFBQUQsRUFBZ0IseUJBQWhCLENBRFQ7T0FSRjtLQURGO0lBWUEsWUFBQSxFQUFjLFNBQUMsTUFBRDtBQUNaLFVBQUE7TUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLGtDQUFnQix5QkFBeUIsRUFBekM7TUFDWCwyQkFBRyxNQUFNLENBQUUsVUFBUixDQUFBLENBQW9CLENBQUMsa0JBQXJCLEVBQUEsYUFBc0MsUUFBdEMsRUFBQSxHQUFBLEtBQUg7QUFDRSxlQUFPLE1BRFQ7O0FBRUEsYUFBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQUE7SUFKSyxDQVpkO0lBa0JBLFdBQUEsRUFBYSxTQUFDLE1BQUQsRUFBUyxFQUFUO2FBQ1gsTUFBTSxDQUFDLGtCQUFQLENBQTBCLFNBQUMsU0FBRDtBQUN4QixZQUFBO1FBQUEsU0FBUyxDQUFDLGNBQVYsQ0FBQTtRQUNBLElBQUEsR0FBTyxTQUFTLENBQUMsT0FBVixDQUFBO1FBQ1AsU0FBUyxDQUFDLGtCQUFWLENBQUE7UUFDQSxLQUFBLEdBQVEsU0FBUyxDQUFDLFVBQVYsQ0FBcUIsRUFBQSxDQUFHLElBQUgsQ0FBckI7ZUFDUixTQUFTLENBQUMsY0FBVixDQUF5QixLQUF6QjtNQUx3QixDQUExQjtJQURXLENBbEJiO0lBMEJBLFFBQUEsRUFBVSxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ1IsVUFBQTtNQUFBLElBQWMsY0FBZDtBQUFBLGVBQUE7O01BQ0EsTUFBQSxHQUFZLG1EQUFILEdBQXlCLE9BQU8sQ0FBQyxNQUFqQyxHQUE2QyxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQ7TUFDdEQsTUFBQSxHQUFZLG1EQUFILEdBQXlCLE9BQU8sQ0FBQyxNQUFqQyxHQUE2QztNQUN0RCxRQUFBLEdBQWMscURBQUgsR0FBMkIsT0FBTyxDQUFDLFFBQW5DLEdBQWlEO01BQzVELElBQUcsTUFBSDtRQUNFLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBQTtRQUNOLE1BQU0sQ0FBQyxPQUFQLENBQWUsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFqQixFQUNiO1VBQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxzQkFBUCxDQUFBLENBQVA7VUFDQSxNQUFBLEVBQVEsTUFEUjtTQURhLENBQWYsRUFGRjtPQUFBLE1BQUE7UUFNRSxHQUFBLEdBQU0sTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBeUIsQ0FBQyxjQUExQixDQUFBLENBQTBDLENBQUM7UUFDakQsSUFBQyxDQUFBLFdBQUQsQ0FBYSxNQUFiLEVBQXFCLFNBQUMsSUFBRDtpQkFBVSxTQUFTLENBQUMsTUFBVixDQUFpQixJQUFqQixFQUM3QjtZQUFBLEtBQUEsRUFBTyxDQUFDLGFBQUQsQ0FBUDtZQUNBLE1BQUEsRUFBUSxNQURSO1dBRDZCO1FBQVYsQ0FBckIsRUFQRjs7TUFVQSxJQUFBLENBQU8sUUFBUDtlQUNFLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixFQURGOztJQWZRLENBMUJWO0lBNENBLE1BQUEsRUFBUSxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ04sVUFBQTtNQUFBLE1BQUEsR0FBWSxtREFBSCxHQUF5QixPQUFPLENBQUMsTUFBakMsR0FBNkMsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkO01BQ3RELFFBQUEsR0FBYyxxREFBSCxHQUEyQixPQUFPLENBQUMsUUFBbkMsR0FBaUQ7TUFDNUQsSUFBRyxNQUFIO1FBQ0UsR0FBQSxHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7UUFDTixNQUFNLENBQUMsT0FBUCxDQUFlLFNBQVMsQ0FBQyxNQUFWLENBQWlCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBakIsQ0FBZixFQUZGO09BQUEsTUFBQTtRQUlFLEdBQUEsR0FBTSxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDLGNBQTFCLENBQUEsQ0FBMEMsQ0FBQztRQUNqRCxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFBcUIsU0FBQyxJQUFEO2lCQUFVLFNBQVMsQ0FBQyxNQUFWLENBQWlCLElBQWpCO1FBQVYsQ0FBckIsRUFMRjs7TUFNQSxJQUFBLENBQU8sUUFBUDtlQUNFLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixFQURGOztJQVRNLENBNUNSO0lBd0RBLE9BQUEsRUFBUyxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ1AsVUFBQTtNQUFBLE1BQUEsR0FBWSxtREFBSCxHQUF5QixPQUFPLENBQUMsTUFBakMsR0FBNkMsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkO01BQ3RELE1BQUEsR0FBWSxtREFBSCxHQUF5QixPQUFPLENBQUMsTUFBakMsR0FBNkM7TUFDdEQsUUFBQSxHQUFjLHFEQUFILEdBQTJCLE9BQU8sQ0FBQyxRQUFuQyxHQUFpRDtNQUM1RCxJQUFHLE1BQUg7UUFDRSxHQUFBLEdBQU0sTUFBTSxDQUFDLHVCQUFQLENBQUE7UUFDTixNQUFNLENBQUMsT0FBUCxDQUFlLFNBQVMsQ0FBQyxPQUFWLENBQWtCLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBbEIsRUFDYjtVQUFBLEtBQUEsRUFBTyxNQUFNLENBQUMsc0JBQVAsQ0FBQSxDQUFQO1VBQ0EsTUFBQSxFQUFRLE1BRFI7U0FEYSxDQUFmLEVBRkY7T0FBQSxNQUFBO1FBTUUsR0FBQSxHQUFNLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQXlCLENBQUMsY0FBMUIsQ0FBQSxDQUEwQyxDQUFDO1FBQ2pELElBQUMsQ0FBQSxXQUFELENBQWEsTUFBYixFQUFxQixTQUFDLElBQUQ7aUJBQVUsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsSUFBbEIsRUFDN0I7WUFBQSxLQUFBLEVBQU8sQ0FBQyxhQUFELENBQVA7WUFDQSxNQUFBLEVBQVEsTUFEUjtXQUQ2QjtRQUFWLENBQXJCLEVBUEY7O01BVUEsSUFBQSxDQUFPLFFBQVA7ZUFDRSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsRUFERjs7SUFkTyxDQXhEVDtJQXlFQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFDRTtRQUFBLHNCQUFBLEVBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDdEIsZ0JBQUE7WUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO21CQUNULEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUNFO2NBQUEsTUFBQSxFQUFRLEtBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxDQUFSO2NBQ0EsTUFBQSxFQUFRLEtBRFI7Y0FFQSxRQUFBLEVBQVUsSUFGVjthQURGO1VBRnNCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtRQU1BLG9CQUFBLEVBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDcEIsZ0JBQUE7WUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO21CQUNULEtBQUMsQ0FBQSxNQUFELENBQVEsTUFBUixFQUNFO2NBQUEsTUFBQSxFQUFRLEtBQUMsQ0FBQSxZQUFELENBQWMsTUFBZCxDQUFSO2NBQ0EsUUFBQSxFQUFVLElBRFY7YUFERjtVQUZvQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FOdEI7UUFXQSwrQkFBQSxFQUFpQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQy9CLGdCQUFBO1lBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTttQkFDVCxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFDRTtjQUFBLE1BQUEsRUFBUSxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsQ0FBUjtjQUNBLE1BQUEsRUFBUSxJQURSO2NBRUEsUUFBQSxFQUFVLElBRlY7YUFERjtVQUYrQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FYakM7UUFpQkEsMENBQUEsRUFBNEMsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUMxQyxnQkFBQTtZQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7bUJBQ1QsS0FBQyxDQUFBLE9BQUQsQ0FBUyxNQUFULEVBQ0U7Y0FBQSxNQUFBLEVBQVEsS0FBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLENBQVI7Y0FDQSxNQUFBLEVBQVEsS0FEUjtjQUVBLFFBQUEsRUFBVSxJQUZWO2FBREY7VUFGMEM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBakI1QztRQXVCQSxtREFBQSxFQUFxRCxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO0FBQ25ELGdCQUFBO1lBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTttQkFDVCxLQUFDLENBQUEsT0FBRCxDQUFTLE1BQVQsRUFDRTtjQUFBLE1BQUEsRUFBUSxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsQ0FBUjtjQUNBLE1BQUEsRUFBUSxJQURSO2NBRUEsUUFBQSxFQUFVLElBRlY7YUFERjtVQUZtRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0F2QnJEO09BREY7TUErQkEsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTthQUNyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLGdDQUFwQixFQUFzRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUN2RSxjQUFBOztlQUFrQixDQUFFLE9BQXBCLENBQUE7O1VBQ0EsS0FBQyxDQUFBLGlCQUFELEdBQXlCLElBQUEsbUJBQUEsQ0FBQTtVQUN6QixJQUFHLEtBQUg7bUJBQ0UsS0FBQyxDQUFBLHFCQUFELENBQUEsRUFERjs7UUFIdUU7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQW5CO0lBakNRLENBekVWO0lBZ0hBLHFCQUFBLEVBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWYsQ0FBa0MsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7QUFDdkQsY0FBQTtVQUFBLElBQVUsbUJBQUksTUFBTSxDQUFFLFNBQVIsQ0FBQSxXQUFkO0FBQUEsbUJBQUE7O1VBQ0EsbUJBQUEsR0FBMEIsSUFBQSxtQkFBQSxDQUFBO1VBQzFCLG1CQUFtQixDQUFDLEdBQXBCLENBQXdCLE1BQU0sQ0FBQyxTQUFQLENBQUEsQ0FBa0IsQ0FBQyxVQUFuQixDQUE4QixTQUFDLFFBQUQ7WUFDcEQsSUFBRyxLQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsQ0FBSDtxQkFDRSxLQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFDRTtnQkFBQSxNQUFBLEVBQVEsSUFBUjtnQkFDQSxNQUFBLEVBQVEsS0FEUjtnQkFFQSxRQUFBLEVBQVUsS0FGVjtlQURGLEVBREY7O1VBRG9ELENBQTlCLENBQXhCO1VBTUEsbUJBQW1CLENBQUMsR0FBcEIsQ0FBd0IsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLFlBQW5CLENBQWdDLFNBQUE7bUJBQ3RELG1CQUFtQixDQUFDLE9BQXBCLENBQUE7VUFEc0QsQ0FBaEMsQ0FBeEI7aUJBRUEsS0FBQyxDQUFBLGlCQUFpQixDQUFDLEdBQW5CLENBQXVCLG1CQUF2QjtRQVh1RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsQ0FBdkI7SUFEcUIsQ0FoSHZCO0lBOEhBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBYyxDQUFFLE9BQWhCLENBQUE7O2FBQ0EsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFGUCxDQTlIWjs7O0VBa0lGLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBdk1qQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5mb3JtYXR0ZXIgPSB7fVxuXG5mb3JtYXR0ZXIuc3BhY2UgPSAoc2NvcGUpIC0+XG4gIHNvZnRUYWJzID0gW2F0b20uY29uZmlnLmdldCAnZWRpdG9yLnNvZnRUYWJzJywgc2NvcGU6IHNjb3BlXVxuICB0YWJMZW5ndGggPSBOdW1iZXIgW2F0b20uY29uZmlnLmdldCAnZWRpdG9yLnRhYkxlbmd0aCcsIHNjb3BlOiBzY29wZV1cbiAgaWYgc29mdFRhYnM/XG4gICAgcmV0dXJuIEFycmF5KHRhYkxlbmd0aCArIDEpLmpvaW4gJyAnXG4gIGVsc2VcbiAgICByZXR1cm4gJ1xcdCdcblxuZm9ybWF0dGVyLnN0cmluZ2lmeSA9IChvYmosIG9wdGlvbnMpIC0+XG4gIHNjb3BlID0gaWYgb3B0aW9ucz8uc2NvcGU/IHRoZW4gb3B0aW9ucy5zY29wZSBlbHNlIG51bGxcbiAgc29ydGVkID0gaWYgb3B0aW9ucz8uc29ydGVkPyB0aGVuIG9wdGlvbnMuc29ydGVkIGVsc2UgZmFsc2VcblxuICAjIGxhenkgbG9hZCByZXF1aXJlbWVudHNcbiAgSlNPTmJpZyA9IHJlcXVpcmUgJ2pzb24tYmlnaW50J1xuICBzdHJpbmdpZnkgPSByZXF1aXJlICdqc29uLXN0YWJsZS1zdHJpbmdpZnknXG4gIEJpZ051bWJlciA9IHJlcXVpcmUgJ2JpZ251bWJlci5qcydcblxuICBzcGFjZSA9IGZvcm1hdHRlci5zcGFjZSBzY29wZVxuICBpZiBzb3J0ZWRcbiAgICByZXR1cm4gc3RyaW5naWZ5IG9iaixcbiAgICAgIHNwYWNlOiBzcGFjZVxuICAgICAgcmVwbGFjZXI6IChrZXksIHZhbHVlKSAtPlxuICAgICAgICB0cnlcbiAgICAgICAgICBpZiB2YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lIGlzICdCaWdOdW1iZXInXG4gICAgICAgICAgICByZXR1cm4gSlNPTmJpZy5zdHJpbmdpZnkgdmFsdWVcbiAgICAgICAgY2F0Y2hcbiAgICAgICAgICAjIGlnbm9yZVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgZWxzZVxuICAgIHJldHVybiBKU09OYmlnLnN0cmluZ2lmeSBvYmosIG51bGwsIHNwYWNlXG5cbmZvcm1hdHRlci5wYXJzZUFuZFZhbGlkYXRlID0gKHRleHQpIC0+XG4gIEpTT05iaWcgPSByZXF1aXJlICdqc29uLWJpZ2ludCcgIyBsYXp5IGxvYWQgcmVxdWlyZW1lbnRzXG4gIHRyeVxuICAgIHJldHVybiBKU09OYmlnLnBhcnNlIHRleHRcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ3ByZXR0eS1qc29uLm5vdGlmeU9uUGFyc2VFcnJvcidcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiSlNPTiBQcmV0dHk6ICN7ZXJyb3IubmFtZX06ICN7ZXJyb3IubWVzc2FnZX0gYXQgY2hhcmFjdGVyICN7ZXJyb3IuYXR9IG5lYXIgXFxcIiN7ZXJyb3IudGV4dH1cXFwiXCJcbiAgICB0aHJvdyBlcnJvclxuXG5mb3JtYXR0ZXIucHJldHR5ID0gKHRleHQsIG9wdGlvbnMpIC0+XG4gIHRyeVxuICAgIHBhcnNlZCA9IGZvcm1hdHRlci5wYXJzZUFuZFZhbGlkYXRlIHRleHRcbiAgY2F0Y2ggZXJyb3JcbiAgICByZXR1cm4gdGV4dFxuICByZXR1cm4gZm9ybWF0dGVyLnN0cmluZ2lmeSBwYXJzZWQsIG9wdGlvbnNcblxuZm9ybWF0dGVyLm1pbmlmeSA9ICh0ZXh0KSAtPlxuICB0cnlcbiAgICBmb3JtYXR0ZXIucGFyc2VBbmRWYWxpZGF0ZSB0ZXh0XG4gIGNhdGNoIGVycm9yXG4gICAgcmV0dXJuIHRleHRcbiAgdWdsaWZ5ID0gcmVxdWlyZSAnanNvbm1pbmlmeScgIyBsYXp5IGxvYWQgcmVxdWlyZW1lbnRzXG4gIHJldHVybiB1Z2xpZnkgdGV4dFxuXG5mb3JtYXR0ZXIuanNvbmlmeSA9ICh0ZXh0LCBvcHRpb25zKSAtPlxuICB2bSA9IHJlcXVpcmUgJ3ZtJyAjIGxhenkgbG9hZCByZXF1aXJlbWVudHNcbiAgdHJ5XG4gICAgdm0ucnVuSW5UaGlzQ29udGV4dCBcIm5ld09iamVjdCA9ICN7dGV4dH07XCJcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ3ByZXR0eS1qc29uLm5vdGlmeU9uUGFyc2VFcnJvcidcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiSlNPTiBQcmV0dHk6IGV2YWwgaXNzdWU6ICN7ZXJyb3J9XCJcbiAgICByZXR1cm4gdGV4dFxuICByZXR1cm4gZm9ybWF0dGVyLnN0cmluZ2lmeSBuZXdPYmplY3QsIG9wdGlvbnNcblxuUHJldHR5SlNPTiA9XG4gIGNvbmZpZzpcbiAgICBub3RpZnlPblBhcnNlRXJyb3I6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBwcmV0dGlmeU9uU2F2ZUpTT046XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB0aXRsZTogJ1ByZXR0aWZ5IE9uIFNhdmUgSlNPTidcbiAgICBncmFtbWFyczpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IFsnc291cmNlLmpzb24nLCAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInXVxuXG4gIGRvRW50aXJlRmlsZTogKGVkaXRvcikgLT5cbiAgICBncmFtbWFycyA9IGF0b20uY29uZmlnLmdldCAncHJldHR5LWpzb24uZ3JhbW1hcnMnID8gW11cbiAgICBpZiBlZGl0b3I/LmdldEdyYW1tYXIoKS5zY29wZU5hbWUgbm90IGluIGdyYW1tYXJzXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5pc0VtcHR5KClcblxuICByZXBsYWNlVGV4dDogKGVkaXRvciwgZm4pIC0+XG4gICAgZWRpdG9yLm11dGF0ZVNlbGVjdGVkVGV4dCAoc2VsZWN0aW9uKSAtPlxuICAgICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIHRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQgZm4gdGV4dFxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlIHJhbmdlXG5cbiAgcHJldHRpZnk6IChlZGl0b3IsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3I/XG4gICAgZW50aXJlID0gaWYgb3B0aW9ucz8uZW50aXJlPyB0aGVuIG9wdGlvbnMuZW50aXJlIGVsc2UgQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICBzb3J0ZWQgPSBpZiBvcHRpb25zPy5zb3J0ZWQ/IHRoZW4gb3B0aW9ucy5zb3J0ZWQgZWxzZSBmYWxzZVxuICAgIHNlbGVjdGVkID0gaWYgb3B0aW9ucz8uc2VsZWN0ZWQ/IHRoZW4gb3B0aW9ucy5zZWxlY3RlZCBlbHNlIHRydWVcbiAgICBpZiBlbnRpcmVcbiAgICAgIHBvcyA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgICBlZGl0b3Iuc2V0VGV4dCBmb3JtYXR0ZXIucHJldHR5IGVkaXRvci5nZXRUZXh0KCksXG4gICAgICAgIHNjb3BlOiBlZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpXG4gICAgICAgIHNvcnRlZDogc29ydGVkXG4gICAgZWxzZVxuICAgICAgcG9zID0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5nZXRTY3JlZW5SYW5nZSgpLnN0YXJ0XG4gICAgICBAcmVwbGFjZVRleHQgZWRpdG9yLCAodGV4dCkgLT4gZm9ybWF0dGVyLnByZXR0eSB0ZXh0LFxuICAgICAgICBzY29wZTogWydzb3VyY2UuanNvbiddXG4gICAgICAgIHNvcnRlZDogc29ydGVkXG4gICAgdW5sZXNzIHNlbGVjdGVkXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24gcG9zXG5cbiAgbWluaWZ5OiAoZWRpdG9yLCBvcHRpb25zKSAtPlxuICAgIGVudGlyZSA9IGlmIG9wdGlvbnM/LmVudGlyZT8gdGhlbiBvcHRpb25zLmVudGlyZSBlbHNlIEBkb0VudGlyZUZpbGUgZWRpdG9yXG4gICAgc2VsZWN0ZWQgPSBpZiBvcHRpb25zPy5zZWxlY3RlZD8gdGhlbiBvcHRpb25zLnNlbGVjdGVkIGVsc2UgdHJ1ZVxuICAgIGlmIGVudGlyZVxuICAgICAgcG9zID0gWzAsIDBdXG4gICAgICBlZGl0b3Iuc2V0VGV4dCBmb3JtYXR0ZXIubWluaWZ5IGVkaXRvci5nZXRUZXh0KClcbiAgICBlbHNlXG4gICAgICBwb3MgPSBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmdldFNjcmVlblJhbmdlKCkuc3RhcnRcbiAgICAgIEByZXBsYWNlVGV4dCBlZGl0b3IsICh0ZXh0KSAtPiBmb3JtYXR0ZXIubWluaWZ5IHRleHRcbiAgICB1bmxlc3Mgc2VsZWN0ZWRcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbiBwb3NcblxuICBqc29uaWZ5OiAoZWRpdG9yLCBvcHRpb25zKSAtPlxuICAgIGVudGlyZSA9IGlmIG9wdGlvbnM/LmVudGlyZT8gdGhlbiBvcHRpb25zLmVudGlyZSBlbHNlIEBkb0VudGlyZUZpbGUgZWRpdG9yXG4gICAgc29ydGVkID0gaWYgb3B0aW9ucz8uc29ydGVkPyB0aGVuIG9wdGlvbnMuc29ydGVkIGVsc2UgZmFsc2VcbiAgICBzZWxlY3RlZCA9IGlmIG9wdGlvbnM/LnNlbGVjdGVkPyB0aGVuIG9wdGlvbnMuc2VsZWN0ZWQgZWxzZSB0cnVlXG4gICAgaWYgZW50aXJlXG4gICAgICBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgICAgZWRpdG9yLnNldFRleHQgZm9ybWF0dGVyLmpzb25pZnkgZWRpdG9yLmdldFRleHQoKSxcbiAgICAgICAgc2NvcGU6IGVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKClcbiAgICAgICAgc29ydGVkOiBzb3J0ZWRcbiAgICBlbHNlXG4gICAgICBwb3MgPSBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmdldFNjcmVlblJhbmdlKCkuc3RhcnRcbiAgICAgIEByZXBsYWNlVGV4dCBlZGl0b3IsICh0ZXh0KSAtPiBmb3JtYXR0ZXIuanNvbmlmeSB0ZXh0LFxuICAgICAgICBzY29wZTogWydzb3VyY2UuanNvbiddXG4gICAgICAgIHNvcnRlZDogc29ydGVkXG4gICAgdW5sZXNzIHNlbGVjdGVkXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24gcG9zXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdwcmV0dHktanNvbjpwcmV0dGlmeSc6ID0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBAcHJldHRpZnkgZWRpdG9yLFxuICAgICAgICAgIGVudGlyZTogQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICAgICAgICBzb3J0ZWQ6IGZhbHNlXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICdwcmV0dHktanNvbjptaW5pZnknOiA9PlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgQG1pbmlmeSBlZGl0b3IsXG4gICAgICAgICAgZW50aXJlOiBAZG9FbnRpcmVGaWxlIGVkaXRvclxuICAgICAgICAgIHNlbGVjdGVkOiB0cnVlXG4gICAgICAncHJldHR5LWpzb246c29ydC1hbmQtcHJldHRpZnknOiA9PlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgQHByZXR0aWZ5IGVkaXRvcixcbiAgICAgICAgICBlbnRpcmU6IEBkb0VudGlyZUZpbGUgZWRpdG9yXG4gICAgICAgICAgc29ydGVkOiB0cnVlXG4gICAgICAgICAgc2VsZWN0ZWQ6IHRydWVcbiAgICAgICdwcmV0dHktanNvbjpqc29uaWZ5LWxpdGVyYWwtYW5kLXByZXR0aWZ5JzogPT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIEBqc29uaWZ5IGVkaXRvcixcbiAgICAgICAgICBlbnRpcmU6IEBkb0VudGlyZUZpbGUgZWRpdG9yXG4gICAgICAgICAgc29ydGVkOiBmYWxzZVxuICAgICAgICAgIHNlbGVjdGVkOiB0cnVlXG4gICAgICAncHJldHR5LWpzb246anNvbmlmeS1saXRlcmFsLWFuZC1zb3J0LWFuZC1wcmV0dGlmeSc6ID0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBAanNvbmlmeSBlZGl0b3IsXG4gICAgICAgICAgZW50aXJlOiBAZG9FbnRpcmVGaWxlIGVkaXRvclxuICAgICAgICAgIHNvcnRlZDogdHJ1ZVxuICAgICAgICAgIHNlbGVjdGVkOiB0cnVlXG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3ByZXR0eS1qc29uLnByZXR0aWZ5T25TYXZlSlNPTicsICh2YWx1ZSkgPT5cbiAgICAgIEBzYXZlU3Vic2NyaXB0aW9ucz8uZGlzcG9zZSgpXG4gICAgICBAc2F2ZVN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBpZiB2YWx1ZVxuICAgICAgICBAc3Vic2NyaWJlVG9TYXZlRXZlbnRzKClcblxuICBzdWJzY3JpYmVUb1NhdmVFdmVudHM6IC0+XG4gICAgQHNhdmVTdWJzY3JpcHRpb25zLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIHJldHVybiBpZiBub3QgZWRpdG9yPy5nZXRCdWZmZXIoKVxuICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvci5nZXRCdWZmZXIoKS5vbldpbGxTYXZlIChmaWxlUGF0aCkgPT5cbiAgICAgICAgaWYgQGRvRW50aXJlRmlsZSBlZGl0b3JcbiAgICAgICAgICBAcHJldHRpZnkgZWRpdG9yLFxuICAgICAgICAgICAgZW50aXJlOiB0cnVlXG4gICAgICAgICAgICBzb3J0ZWQ6IGZhbHNlXG4gICAgICAgICAgICBzZWxlY3RlZDogZmFsc2VcbiAgICAgIGJ1ZmZlclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZERlc3Ryb3kgLT5cbiAgICAgICAgYnVmZmVyU3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIEBzYXZlU3Vic2NyaXB0aW9ucy5hZGQgYnVmZmVyU3Vic2NyaXB0aW9uc1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnM/LmRpc3Bvc2UoKVxuICAgIEBzdWJzY3JpcHRpb25zID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IFByZXR0eUpTT05cbiJdfQ==
