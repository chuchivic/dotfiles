(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, ref, semver, settings, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  settings = require('../lib/settings');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    globalState.reset();
    settings.set("stayOnTransformString", false);
    settings.set("stayOnYank", false);
    settings.set("stayOnDelete", false);
    settings.set("stayOnSelectTextObject", false);
    return settings.set("stayOnVerticalMotion", true);
  });

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var j, key, len, modifier, options, part, parts;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      if (indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(slice.call(eventArgs)));
    return event;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, ref1;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = [], editor = ref1[0], file = ref1[1], callback = ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, arg) {
      var chomp, line, text;
      chomp = (arg != null ? arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          results.push(this.lines[line]);
        }
        return results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getLine = function(line, options) {
      return this.getLines([line], options);
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  collectIndexInText = function(char, text) {
    var fromIndex, index, indexes;
    indexes = [];
    fromIndex = 0;
    while ((index = text.indexOf(char, fromIndex)) >= 0) {
      fromIndex = index + 1;
      indexes.push(index);
    }
    return indexes;
  };

  collectCharPositionsInText = function(char, text) {
    var i, index, j, k, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        index = ref2[i];
        positions.push([rowNumber, index - i]);
      }
    }
    return positions;
  };

  VimEditor = (function() {
    var ensureExclusiveRules, ensureOptionsOrdered, setExclusiveRules, setOptionsOrdered;

    function VimEditor(vimState1) {
      var ref1;
      this.vimState = vimState1;
      this._keystroke = bind(this._keystroke, this);
      this.bindEnsureWaitOption = bind(this.bindEnsureWaitOption, this);
      this.bindEnsureOption = bind(this.bindEnsureOption, this);
      this.ensureWait = bind(this.ensureWait, this);
      this.ensure = bind(this.ensure, this);
      this.set = bind(this.set, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error(message + ": " + (inspect(invalidOptions)));
      }
    };

    VimEditor.prototype.validateExclusiveOptions = function(options, rules) {
      var allOptions, exclusiveOptions, option, results, violatingOptions;
      allOptions = Object.keys(options);
      results = [];
      for (option in rules) {
        exclusiveOptions = rules[option];
        if (!(option in options)) {
          continue;
        }
        violatingOptions = exclusiveOptions.filter(function(exclusiveOption) {
          return indexOf.call(allOptions, exclusiveOption) >= 0;
        });
        if (violatingOptions.length) {
          throw new Error(option + " is exclusive with [" + violatingOptions + "]");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    setOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'grammar', 'cursor', 'cursorScreen', 'addCursor', 'cursorScreen', 'register', 'selectedBufferRange'];

    setExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.set = function(options) {
      var j, len, method, name, results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      this.validateExclusiveOptions(options, setExclusiveRules);
      results = [];
      for (j = 0, len = setOptionsOrdered.length; j < len; j++) {
        name = setOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      this.setText(text.replace(/[\|!]/g, ''));
      cursors = cursors.concat(lastCursor);
      if (cursors.length) {
        return this.setCursor(cursors);
      }
    };

    VimEditor.prototype.setTextC_ = function(text) {
      return this.setTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setCursorScreen = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var j, len, point, ref1, results;
      ref1 = toArrayOfPoint(points);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        point = ref1[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, results, value;
      results = [];
      for (name in register) {
        value = register[name];
        results.push(this.vimState.register.set(name, value));
      }
      return results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'selectedText', 'selectedText_', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorScreen', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'propertyHead', 'propertyTail', 'scrollTop', 'mark', 'mode'];

    ensureExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.getAndDeleteKeystrokeOptions = function(options) {
      var partialMatchTimeout, waitsForFinish;
      partialMatchTimeout = options.partialMatchTimeout, waitsForFinish = options.waitsForFinish;
      delete options.partialMatchTimeout;
      delete options.waitsForFinish;
      return {
        partialMatchTimeout: partialMatchTimeout,
        waitsForFinish: waitsForFinish
      };
    };

    VimEditor.prototype.ensure = function(keystroke, options) {
      var keystrokeOptions, runSmart;
      if (options == null) {
        options = {};
      }
      if (typeof options !== 'object') {
        throw new Error("Invalid options for 'ensure': must be 'object' but got '" + (typeof options) + "'");
      }
      if ((keystroke != null) && !(typeof keystroke === 'string' || Array.isArray(keystroke))) {
        throw new Error("Invalid keystroke for 'ensure': must be 'string' or 'array' but got '" + (typeof keystroke) + "'");
      }
      keystrokeOptions = this.getAndDeleteKeystrokeOptions(options);
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      this.validateExclusiveOptions(options, ensureExclusiveRules);
      runSmart = function(fn) {
        if (keystrokeOptions.waitsForFinish) {
          return runs(fn);
        } else {
          return fn();
        }
      };
      runSmart((function(_this) {
        return function() {
          if (!_.isEmpty(keystroke)) {
            return _this._keystroke(keystroke, keystrokeOptions);
          }
        };
      })(this));
      return runSmart((function(_this) {
        return function() {
          var j, len, method, name, results;
          results = [];
          for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
            name = ensureOptionsOrdered[j];
            if (!(options[name] != null)) {
              continue;
            }
            method = 'ensure' + _.capitalize(_.camelize(name));
            results.push(_this[method](options[name]));
          }
          return results;
        };
      })(this));
    };

    VimEditor.prototype.ensureWait = function(keystroke, options) {
      if (options == null) {
        options = {};
      }
      return this.ensure(keystroke, Object.assign(options, {
        waitsForFinish: true
      }));
    };

    VimEditor.prototype.bindEnsureOption = function(optionsBase, wait) {
      if (wait == null) {
        wait = false;
      }
      return (function(_this) {
        return function(keystroke, options) {
          var intersectingOptions;
          intersectingOptions = _.intersection(_.keys(options), _.keys(optionsBase));
          if (intersectingOptions.length) {
            throw new Error("conflict with bound options " + (inspect(intersectingOptions)));
          }
          options = _.defaults(_.clone(options), optionsBase);
          if (wait) {
            options.waitsForFinish = true;
          }
          return _this.ensure(keystroke, options);
        };
      })(this);
    };

    VimEditor.prototype.bindEnsureWaitOption = function(optionsBase) {
      return this.bindEnsureOption(optionsBase, true);
    };

    VimEditor.prototype._keystroke = function(keys, options) {
      var event, finished, i, j, key, keystrokesToExecute, lastKeystrokeIndex, len, ref1, target, waitsForFinish;
      if (options == null) {
        options = {};
      }
      target = this.editorElement;
      keystrokesToExecute = keys.split(/\s+/);
      lastKeystrokeIndex = keystrokesToExecute.length - 1;
      for (i = j = 0, len = keystrokesToExecute.length; j < len; i = ++j) {
        key = keystrokesToExecute[i];
        waitsForFinish = (i === lastKeystrokeIndex) && options.waitsForFinish;
        if (waitsForFinish) {
          finished = false;
          this.vimState.onDidFinishOperation(function() {
            return finished = true;
          });
        }
        if ((ref1 = this.vimState.__searchInput) != null ? ref1.hasFocus() : void 0) {
          target = this.vimState.searchInput.editorElement;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.searchInput.editor.insertText(key);
          }
        } else if (this.vimState.inputEditor != null) {
          target = this.vimState.inputEditor.element;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.inputEditor.insertText(key);
          }
        } else {
          event = buildKeydownEventFromKeystroke(normalizeKeystrokes(key), target);
          atom.keymaps.handleKeyboardEvent(event);
        }
        if (waitsForFinish) {
          waitsFor(function() {
            return finished;
          });
        }
      }
      if (options.partialMatchTimeout) {
        return advanceClock(atom.keymaps.getPartialMatchTimeout());
      }
    };

    VimEditor.prototype.keystroke = function() {
      throw new Error('Dont use `keystroke("x y z")`, instead use `ensure("x y z")`');
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      cursors = cursors.concat(lastCursor);
      cursors = cursors.map(function(point) {
        return Point.fromObject(point);
      }).sort(function(a, b) {
        return a.compare(b);
      });
      this.ensureText(text.replace(/[\|!]/g, ''));
      if (cursors.length) {
        this.ensureCursor(cursors, true);
      }
      if (lastCursor.length) {
        return expect(this.editor.getCursorBufferPosition()).toEqual(lastCursor[0]);
      }
    };

    VimEditor.prototype.ensureTextC_ = function(text) {
      return this.ensureTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(s.getText());
        }
        return results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedText_ = function(text, ordered) {
      return this.ensureSelectedText(text.replace(/_/g, ' '), ordered);
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.modeManager.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points, ordered) {
      var actual;
      if (ordered == null) {
        ordered = false;
      }
      actual = this.editor.getCursorBufferPositions();
      actual = actual.sort(function(a, b) {
        if (ordered) {
          return a.compare(b);
        }
      });
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorScreen = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var _value, ensure, name, property, reg, results, selection;
      results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        results.push((function() {
          var results1;
          results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            results1.push(expect(reg[property]).toEqual(_value));
          }
          return results1;
        })());
      }
      return results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(fn(s));
        }
        return results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, j, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        actual = selection.isReversed();
        results.push(expect(actual).toBe(reversed));
      }
      return results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = markers.length; j < len; j++) {
          r = markers[j];
          results.push(r.getBufferRange());
        }
        return results;
      })();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = ranges.length; j < len; j++) {
          r = ranges[j];
          results.push(this.editor.getTextInBufferRange(r));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensurePropertyHead = function(points) {
      var actual, getHeadProperty, s;
      getHeadProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('head', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getHeadProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensurePropertyTail = function(points) {
      var actual, getTailProperty, s;
      getTailProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('tail', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getTailProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, results;
      results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        results.push(expect(actual).toEqual(point));
      }
      return results;
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var j, k, len, len1, m, ref1, results, shouldNotContainClasses;
      mode = toArray(mode).slice();
      expect((ref1 = this.vimState).isMode.apply(ref1, mode)).toBe(true);
      mode[0] = mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (j = 0, len = mode.length; j < len; j++) {
        m = mode[j];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      results = [];
      for (k = 0, len1 = shouldNotContainClasses.length; k < len1; k++) {
        m = shouldNotContainClasses[k];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMFhBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNkLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBQ1osV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7RUFDNUIsc0JBQXVCLE9BQUEsQ0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVosR0FBMkIsdUNBQW5DOztFQUV4QixrQkFBQSxHQUFxQixDQUNuQixhQURtQixFQUVuQixhQUZtQixFQUduQixhQUhtQixFQUluQixTQUptQixFQUtuQixVQUxtQixFQU1uQixXQU5tQixFQU9uQixlQVBtQjs7RUFZckIsVUFBQSxDQUFXLFNBQUE7SUFDVCxXQUFXLENBQUMsS0FBWixDQUFBO0lBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSx1QkFBYixFQUFzQyxLQUF0QztJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsWUFBYixFQUEyQixLQUEzQjtJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixFQUE2QixLQUE3QjtJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsd0JBQWIsRUFBdUMsS0FBdkM7V0FDQSxRQUFRLENBQUMsR0FBVCxDQUFhLHNCQUFiLEVBQXFDLElBQXJDO0VBTlMsQ0FBWDs7RUFVQSxPQUFBLEdBQVUsU0FBQyxLQUFEO1dBQ1IsSUFBSSxDQUFDLEtBQUss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LE9BQWQ7SUFBdUIsVUFBQSxRQUF2QjtJQUFpQyxVQUFBLFFBQWpDO0lBQTJDLGtCQUFBLGdCQUEzQzs7QUEzZWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbntSYW5nZSwgUG9pbnQsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4uL2xpYi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuS2V5bWFwTWFuYWdlciA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvclxue25vcm1hbGl6ZUtleXN0cm9rZXN9ID0gcmVxdWlyZShhdG9tLmNvbmZpZy5yZXNvdXJjZVBhdGggKyBcIi9ub2RlX21vZHVsZXMvYXRvbS1rZXltYXAvbGliL2hlbHBlcnNcIilcblxuc3VwcG9ydGVkTW9kZUNsYXNzID0gW1xuICAnbm9ybWFsLW1vZGUnXG4gICd2aXN1YWwtbW9kZSdcbiAgJ2luc2VydC1tb2RlJ1xuICAncmVwbGFjZSdcbiAgJ2xpbmV3aXNlJ1xuICAnYmxvY2t3aXNlJ1xuICAnY2hhcmFjdGVyd2lzZSdcbl1cblxuIyBJbml0IHNwZWMgc3RhdGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYmVmb3JlRWFjaCAtPlxuICBnbG9iYWxTdGF0ZS5yZXNldCgpXG4gIHNldHRpbmdzLnNldChcInN0YXlPblRyYW5zZm9ybVN0cmluZ1wiLCBmYWxzZSlcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uWWFua1wiLCBmYWxzZSlcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uRGVsZXRlXCIsIGZhbHNlKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIsIGZhbHNlKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25WZXJ0aWNhbE1vdGlvblwiLCB0cnVlKVxuXG4jIFV0aWxzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFZpZXcgPSAobW9kZWwpIC0+XG4gIGF0b20udmlld3MuZ2V0Vmlldyhtb2RlbClcblxuZGlzcGF0Y2ggPSAodGFyZ2V0LCBjb21tYW5kKSAtPlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgY29tbWFuZClcblxud2l0aE1vY2tQbGF0Zm9ybSA9ICh0YXJnZXQsIHBsYXRmb3JtLCBmbikgLT5cbiAgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gcGxhdGZvcm1cbiAgd3JhcHBlci5hcHBlbmRDaGlsZCh0YXJnZXQpXG4gIGZuKClcbiAgdGFyZ2V0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuXG5idWlsZEtleWRvd25FdmVudCA9IChrZXksIG9wdGlvbnMpIC0+XG4gIEtleW1hcE1hbmFnZXIuYnVpbGRLZXlkb3duRXZlbnQoa2V5LCBvcHRpb25zKVxuXG5idWlsZEtleWRvd25FdmVudEZyb21LZXlzdHJva2UgPSAoa2V5c3Ryb2tlLCB0YXJnZXQpIC0+XG4gIG1vZGlmaWVyID0gWydjdHJsJywgJ2FsdCcsICdzaGlmdCcsICdjbWQnXVxuICBwYXJ0cyA9IGlmIGtleXN0cm9rZSBpcyAnLSdcbiAgICBbJy0nXVxuICBlbHNlXG4gICAga2V5c3Ryb2tlLnNwbGl0KCctJylcblxuICBvcHRpb25zID0ge3RhcmdldH1cbiAga2V5ID0gbnVsbFxuICBmb3IgcGFydCBpbiBwYXJ0c1xuICAgIGlmIHBhcnQgaW4gbW9kaWZpZXJcbiAgICAgIG9wdGlvbnNbcGFydF0gPSB0cnVlXG4gICAgZWxzZVxuICAgICAga2V5ID0gcGFydFxuXG4gIGlmIHNlbXZlci5zYXRpc2ZpZXMoYXRvbS5nZXRWZXJzaW9uKCksICc8IDEuMTInKVxuICAgIGtleSA9ICcgJyBpZiBrZXkgaXMgJ3NwYWNlJ1xuICBidWlsZEtleWRvd25FdmVudChrZXksIG9wdGlvbnMpXG5cbmJ1aWxkVGV4dElucHV0RXZlbnQgPSAoa2V5KSAtPlxuICBldmVudEFyZ3MgPSBbXG4gICAgdHJ1ZSAjIGJ1YmJsZXNcbiAgICB0cnVlICMgY2FuY2VsYWJsZVxuICAgIHdpbmRvdyAjIHZpZXdcbiAgICBrZXkgICMga2V5IGNoYXJcbiAgXVxuICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdUZXh0RXZlbnQnKVxuICBldmVudC5pbml0VGV4dEV2ZW50KFwidGV4dElucHV0XCIsIGV2ZW50QXJncy4uLilcbiAgZXZlbnRcblxuaXNQb2ludCA9IChvYmopIC0+XG4gIGlmIG9iaiBpbnN0YW5jZW9mIFBvaW50XG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgb2JqLmxlbmd0aCBpcyAyIGFuZCBfLmlzTnVtYmVyKG9ialswXSkgYW5kIF8uaXNOdW1iZXIob2JqWzFdKVxuXG5pc1JhbmdlID0gKG9iaikgLT5cbiAgaWYgb2JqIGluc3RhbmNlb2YgUmFuZ2VcbiAgICB0cnVlXG4gIGVsc2VcbiAgICBfLmFsbChbXG4gICAgICBfLmlzQXJyYXkob2JqKSxcbiAgICAgIChvYmoubGVuZ3RoIGlzIDIpLFxuICAgICAgaXNQb2ludChvYmpbMF0pLFxuICAgICAgaXNQb2ludChvYmpbMV0pXG4gICAgXSlcblxudG9BcnJheSA9IChvYmosIGNvbmQ9bnVsbCkgLT5cbiAgaWYgXy5pc0FycmF5KGNvbmQgPyBvYmopIHRoZW4gb2JqIGVsc2UgW29ial1cblxudG9BcnJheU9mUG9pbnQgPSAob2JqKSAtPlxuICBpZiBfLmlzQXJyYXkob2JqKSBhbmQgaXNQb2ludChvYmpbMF0pXG4gICAgb2JqXG4gIGVsc2VcbiAgICBbb2JqXVxuXG50b0FycmF5T2ZSYW5nZSA9IChvYmopIC0+XG4gIGlmIF8uaXNBcnJheShvYmopIGFuZCBfLmFsbChvYmoubWFwIChlKSAtPiBpc1JhbmdlKGUpKVxuICAgIG9ialxuICBlbHNlXG4gICAgW29ial1cblxuIyBNYWluXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFZpbVN0YXRlID0gKGFyZ3MuLi4pIC0+XG4gIFtlZGl0b3IsIGZpbGUsIGNhbGxiYWNrXSA9IFtdXG4gIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgIHdoZW4gMSB0aGVuIFtjYWxsYmFja10gPSBhcmdzXG4gICAgd2hlbiAyIHRoZW4gW2ZpbGUsIGNhbGxiYWNrXSA9IGFyZ3NcblxuICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgZmlsZSA9IGF0b20ucHJvamVjdC5yZXNvbHZlUGF0aChmaWxlKSBpZiBmaWxlXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlKS50aGVuIChlKSAtPiBlZGl0b3IgPSBlXG5cbiAgcnVucyAtPlxuICAgIG1haW4gPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5tYWluTW9kdWxlXG4gICAgdmltU3RhdGUgPSBtYWluLmdldEVkaXRvclN0YXRlKGVkaXRvcilcbiAgICBjYWxsYmFjayh2aW1TdGF0ZSwgbmV3IFZpbUVkaXRvcih2aW1TdGF0ZSkpXG5cbmNsYXNzIFRleHREYXRhXG4gIGNvbnN0cnVjdG9yOiAoQHJhd0RhdGEpIC0+XG4gICAgQGxpbmVzID0gQHJhd0RhdGEuc3BsaXQoXCJcXG5cIilcblxuICBnZXRMaW5lczogKGxpbmVzLCB7Y2hvbXB9PXt9KSAtPlxuICAgIGNob21wID89IGZhbHNlXG4gICAgdGV4dCA9IChAbGluZXNbbGluZV0gZm9yIGxpbmUgaW4gbGluZXMpLmpvaW4oXCJcXG5cIilcbiAgICBpZiBjaG9tcFxuICAgICAgdGV4dFxuICAgIGVsc2VcbiAgICAgIHRleHQgKyBcIlxcblwiXG5cbiAgZ2V0TGluZTogKGxpbmUsIG9wdGlvbnMpIC0+XG4gICAgQGdldExpbmVzKFtsaW5lXSwgb3B0aW9ucylcblxuICBnZXRSYXc6IC0+XG4gICAgQHJhd0RhdGFcblxuY29sbGVjdEluZGV4SW5UZXh0ID0gKGNoYXIsIHRleHQpIC0+XG4gIGluZGV4ZXMgPSBbXVxuICBmcm9tSW5kZXggPSAwXG4gIHdoaWxlIChpbmRleCA9IHRleHQuaW5kZXhPZihjaGFyLCBmcm9tSW5kZXgpKSA+PSAwXG4gICAgZnJvbUluZGV4ID0gaW5kZXggKyAxXG4gICAgaW5kZXhlcy5wdXNoKGluZGV4KVxuICBpbmRleGVzXG5cbmNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0ID0gKGNoYXIsIHRleHQpIC0+XG4gIHBvc2l0aW9ucyA9IFtdXG4gIGZvciBsaW5lVGV4dCwgcm93TnVtYmVyIGluIHRleHQuc3BsaXQoL1xcbi8pXG4gICAgZm9yIGluZGV4LCBpIGluIGNvbGxlY3RJbmRleEluVGV4dChjaGFyLCBsaW5lVGV4dClcbiAgICAgIHBvc2l0aW9ucy5wdXNoKFtyb3dOdW1iZXIsIGluZGV4IC0gaV0pXG4gIHBvc2l0aW9uc1xuXG5jbGFzcyBWaW1FZGl0b3JcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuXG4gIHZhbGlkYXRlT3B0aW9uczogKG9wdGlvbnMsIHZhbGlkT3B0aW9ucywgbWVzc2FnZSkgLT5cbiAgICBpbnZhbGlkT3B0aW9ucyA9IF8ud2l0aG91dChfLmtleXMob3B0aW9ucyksIHZhbGlkT3B0aW9ucy4uLilcbiAgICBpZiBpbnZhbGlkT3B0aW9ucy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIiN7bWVzc2FnZX06ICN7aW5zcGVjdChpbnZhbGlkT3B0aW9ucyl9XCIpXG5cbiAgdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zOiAob3B0aW9ucywgcnVsZXMpIC0+XG4gICAgYWxsT3B0aW9ucyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpXG4gICAgZm9yIG9wdGlvbiwgZXhjbHVzaXZlT3B0aW9ucyBvZiBydWxlcyB3aGVuIG9wdGlvbiBvZiBvcHRpb25zXG4gICAgICB2aW9sYXRpbmdPcHRpb25zID0gZXhjbHVzaXZlT3B0aW9ucy5maWx0ZXIgKGV4Y2x1c2l2ZU9wdGlvbikgLT4gZXhjbHVzaXZlT3B0aW9uIGluIGFsbE9wdGlvbnNcbiAgICAgIGlmIHZpb2xhdGluZ09wdGlvbnMubGVuZ3RoXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIiN7b3B0aW9ufSBpcyBleGNsdXNpdmUgd2l0aCBbI3t2aW9sYXRpbmdPcHRpb25zfV1cIilcblxuICBzZXRPcHRpb25zT3JkZXJlZCA9IFtcbiAgICAndGV4dCcsICd0ZXh0XycsXG4gICAgJ3RleHRDJywgJ3RleHRDXycsXG4gICAgJ2dyYW1tYXInLFxuICAgICdjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdhZGRDdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdyZWdpc3RlcicsXG4gICAgJ3NlbGVjdGVkQnVmZmVyUmFuZ2UnXG4gIF1cblxuICBzZXRFeGNsdXNpdmVSdWxlcyA9XG4gICAgdGV4dEM6IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG4gICAgdGV4dENfOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuXG4gICMgUHVibGljXG4gIHNldDogKG9wdGlvbnMpID0+XG4gICAgQHZhbGlkYXRlT3B0aW9ucyhvcHRpb25zLCBzZXRPcHRpb25zT3JkZXJlZCwgJ0ludmFsaWQgc2V0IG9wdGlvbnMnKVxuICAgIEB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnMob3B0aW9ucywgc2V0RXhjbHVzaXZlUnVsZXMpXG5cbiAgICBmb3IgbmFtZSBpbiBzZXRPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnc2V0JyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgc2V0VGV4dDogKHRleHQpIC0+XG4gICAgQGVkaXRvci5zZXRUZXh0KHRleHQpXG5cbiAgc2V0VGV4dF86ICh0ZXh0KSAtPlxuICAgIEBzZXRUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIHNldFRleHRDOiAodGV4dCkgLT5cbiAgICBjdXJzb3JzID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJ3wnLCB0ZXh0LnJlcGxhY2UoLyEvZywgJycpKVxuICAgIGxhc3RDdXJzb3IgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnIScsIHRleHQucmVwbGFjZSgvXFx8L2csICcnKSlcbiAgICBAc2V0VGV4dCh0ZXh0LnJlcGxhY2UoL1tcXHwhXS9nLCAnJykpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnMuY29uY2F0KGxhc3RDdXJzb3IpXG4gICAgaWYgY3Vyc29ycy5sZW5ndGhcbiAgICAgIEBzZXRDdXJzb3IoY3Vyc29ycylcblxuICBzZXRUZXh0Q186ICh0ZXh0KSAtPlxuICAgIEBzZXRUZXh0Qyh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBzZXRHcmFtbWFyOiAoc2NvcGUpIC0+XG4gICAgQGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSkpXG5cbiAgc2V0Q3Vyc29yOiAocG9pbnRzKSAtPlxuICAgIHBvaW50cyA9IHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50cy5zaGlmdCgpKVxuICAgIGZvciBwb2ludCBpbiBwb2ludHNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBzZXRDdXJzb3JTY3JlZW46IChwb2ludHMpIC0+XG4gICAgcG9pbnRzID0gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24ocG9pbnRzLnNoaWZ0KCkpXG4gICAgZm9yIHBvaW50IGluIHBvaW50c1xuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdFNjcmVlblBvc2l0aW9uKHBvaW50KVxuXG4gIHNldEFkZEN1cnNvcjogKHBvaW50cykgLT5cbiAgICBmb3IgcG9pbnQgaW4gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNldFJlZ2lzdGVyOiAocmVnaXN0ZXIpIC0+XG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIHJlZ2lzdGVyXG4gICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KG5hbWUsIHZhbHVlKVxuXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgZW5zdXJlT3B0aW9uc09yZGVyZWQgPSBbXG4gICAgJ3RleHQnLCAndGV4dF8nLFxuICAgICd0ZXh0QycsICd0ZXh0Q18nLFxuICAgICdzZWxlY3RlZFRleHQnLCAnc2VsZWN0ZWRUZXh0XycsICdzZWxlY3RlZFRleHRPcmRlcmVkJywgXCJzZWxlY3Rpb25Jc05hcnJvd2VkXCJcbiAgICAnY3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAnbnVtQ3Vyc29ycydcbiAgICAncmVnaXN0ZXInLFxuICAgICdzZWxlY3RlZFNjcmVlblJhbmdlJywgJ3NlbGVjdGVkU2NyZWVuUmFuZ2VPcmRlcmVkJ1xuICAgICdzZWxlY3RlZEJ1ZmZlclJhbmdlJywgJ3NlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkJ1xuICAgICdzZWxlY3Rpb25Jc1JldmVyc2VkJyxcbiAgICAncGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlJywgJ3BlcnNpc3RlbnRTZWxlY3Rpb25Db3VudCdcbiAgICAnb2NjdXJyZW5jZUNvdW50JywgJ29jY3VycmVuY2VUZXh0J1xuICAgICdwcm9wZXJ0eUhlYWQnXG4gICAgJ3Byb3BlcnR5VGFpbCdcbiAgICAnc2Nyb2xsVG9wJyxcbiAgICAnbWFyaydcbiAgICAnbW9kZScsXG4gIF1cbiAgZW5zdXJlRXhjbHVzaXZlUnVsZXMgPVxuICAgIHRleHRDOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuICAgIHRleHRDXzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cblxuICBnZXRBbmREZWxldGVLZXlzdHJva2VPcHRpb25zOiAob3B0aW9ucykgLT5cbiAgICB7cGFydGlhbE1hdGNoVGltZW91dCwgd2FpdHNGb3JGaW5pc2h9ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLnBhcnRpYWxNYXRjaFRpbWVvdXRcbiAgICBkZWxldGUgb3B0aW9ucy53YWl0c0ZvckZpbmlzaFxuICAgIHtwYXJ0aWFsTWF0Y2hUaW1lb3V0LCB3YWl0c0ZvckZpbmlzaH1cblxuICAjIFB1YmxpY1xuICBlbnN1cmU6IChrZXlzdHJva2UsIG9wdGlvbnM9e30pID0+XG4gICAgdW5sZXNzIHR5cGVvZihvcHRpb25zKSBpcyAnb2JqZWN0J1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBvcHRpb25zIGZvciAnZW5zdXJlJzogbXVzdCBiZSAnb2JqZWN0JyBidXQgZ290ICcje3R5cGVvZihvcHRpb25zKX0nXCIpXG4gICAgaWYga2V5c3Ryb2tlPyBhbmQgbm90ICh0eXBlb2Yoa2V5c3Ryb2tlKSBpcyAnc3RyaW5nJyBvciBBcnJheS5pc0FycmF5KGtleXN0cm9rZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGtleXN0cm9rZSBmb3IgJ2Vuc3VyZSc6IG11c3QgYmUgJ3N0cmluZycgb3IgJ2FycmF5JyBidXQgZ290ICcje3R5cGVvZihrZXlzdHJva2UpfSdcIilcblxuICAgIGtleXN0cm9rZU9wdGlvbnMgPSBAZ2V0QW5kRGVsZXRlS2V5c3Ryb2tlT3B0aW9ucyhvcHRpb25zKVxuXG4gICAgQHZhbGlkYXRlT3B0aW9ucyhvcHRpb25zLCBlbnN1cmVPcHRpb25zT3JkZXJlZCwgJ0ludmFsaWQgZW5zdXJlIG9wdGlvbicpXG4gICAgQHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9ucyhvcHRpb25zLCBlbnN1cmVFeGNsdXNpdmVSdWxlcylcblxuICAgIHJ1blNtYXJ0ID0gKGZuKSAtPiBpZiBrZXlzdHJva2VPcHRpb25zLndhaXRzRm9yRmluaXNoIHRoZW4gcnVucyhmbikgZWxzZSBmbigpXG5cbiAgICBydW5TbWFydCA9PlxuICAgICAgQF9rZXlzdHJva2Uoa2V5c3Ryb2tlLCBrZXlzdHJva2VPcHRpb25zKSB1bmxlc3MgXy5pc0VtcHR5KGtleXN0cm9rZSlcblxuICAgIHJ1blNtYXJ0ID0+XG4gICAgICBmb3IgbmFtZSBpbiBlbnN1cmVPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICAgIG1ldGhvZCA9ICdlbnN1cmUnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICAgIHRoaXNbbWV0aG9kXShvcHRpb25zW25hbWVdKVxuXG4gIGVuc3VyZVdhaXQ6IChrZXlzdHJva2UsIG9wdGlvbnM9e30pID0+XG4gICAgQGVuc3VyZShrZXlzdHJva2UsIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgd2FpdHNGb3JGaW5pc2g6IHRydWUpKVxuXG4gIGJpbmRFbnN1cmVPcHRpb246IChvcHRpb25zQmFzZSwgd2FpdD1mYWxzZSkgPT5cbiAgICAoa2V5c3Ryb2tlLCBvcHRpb25zKSA9PlxuICAgICAgaW50ZXJzZWN0aW5nT3B0aW9ucyA9IF8uaW50ZXJzZWN0aW9uKF8ua2V5cyhvcHRpb25zKSwgXy5rZXlzKG9wdGlvbnNCYXNlKSlcbiAgICAgIGlmIGludGVyc2VjdGluZ09wdGlvbnMubGVuZ3RoXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNvbmZsaWN0IHdpdGggYm91bmQgb3B0aW9ucyAje2luc3BlY3QoaW50ZXJzZWN0aW5nT3B0aW9ucyl9XCIpXG5cbiAgICAgIG9wdGlvbnMgPSBfLmRlZmF1bHRzKF8uY2xvbmUob3B0aW9ucyksIG9wdGlvbnNCYXNlKVxuICAgICAgb3B0aW9ucy53YWl0c0ZvckZpbmlzaCA9IHRydWUgaWYgd2FpdFxuICAgICAgQGVuc3VyZShrZXlzdHJva2UsIG9wdGlvbnMpXG5cbiAgYmluZEVuc3VyZVdhaXRPcHRpb246IChvcHRpb25zQmFzZSkgPT5cbiAgICBAYmluZEVuc3VyZU9wdGlvbihvcHRpb25zQmFzZSwgdHJ1ZSlcblxuICBfa2V5c3Ryb2tlOiAoa2V5cywgb3B0aW9ucz17fSkgPT5cbiAgICB0YXJnZXQgPSBAZWRpdG9yRWxlbWVudFxuICAgIGtleXN0cm9rZXNUb0V4ZWN1dGUgPSBrZXlzLnNwbGl0KC9cXHMrLylcbiAgICBsYXN0S2V5c3Ryb2tlSW5kZXggPSBrZXlzdHJva2VzVG9FeGVjdXRlLmxlbmd0aCAtIDFcblxuICAgIGZvciBrZXksIGkgaW4ga2V5c3Ryb2tlc1RvRXhlY3V0ZVxuICAgICAgd2FpdHNGb3JGaW5pc2ggPSAoaSBpcyBsYXN0S2V5c3Ryb2tlSW5kZXgpIGFuZCBvcHRpb25zLndhaXRzRm9yRmluaXNoXG4gICAgICBpZiB3YWl0c0ZvckZpbmlzaFxuICAgICAgICBmaW5pc2hlZCA9IGZhbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5vbkRpZEZpbmlzaE9wZXJhdGlvbiAtPiBmaW5pc2hlZCA9IHRydWVcblxuICAgICAgIyBbRklYTUVdIFdoeSBjYW4ndCBJIGxldCBhdG9tLmtleW1hcHMgaGFuZGxlIGVudGVyL2VzY2FwZSBieSBidWlsZEV2ZW50IGFuZCBoYW5kbGVLZXlib2FyZEV2ZW50XG4gICAgICBpZiBAdmltU3RhdGUuX19zZWFyY2hJbnB1dD8uaGFzRm9jdXMoKSAjIHRvIGF2b2lkIGF1dG8gcG9wdWxhdGVcbiAgICAgICAgdGFyZ2V0ID0gQHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvckVsZW1lbnRcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgIHdoZW4gXCJlbnRlclwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIHdoZW4gXCJlc2NhcGVcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjYW5jZWwnKVxuICAgICAgICAgIGVsc2UgQHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvci5pbnNlcnRUZXh0KGtleSlcblxuICAgICAgZWxzZSBpZiBAdmltU3RhdGUuaW5wdXRFZGl0b3I/XG4gICAgICAgIHRhcmdldCA9IEB2aW1TdGF0ZS5pbnB1dEVkaXRvci5lbGVtZW50XG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICB3aGVuIFwiZW50ZXJcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICB3aGVuIFwiZXNjYXBlXCIgdGhlbiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ2NvcmU6Y2FuY2VsJylcbiAgICAgICAgICBlbHNlIEB2aW1TdGF0ZS5pbnB1dEVkaXRvci5pbnNlcnRUZXh0KGtleSlcblxuICAgICAgZWxzZVxuICAgICAgICBldmVudCA9IGJ1aWxkS2V5ZG93bkV2ZW50RnJvbUtleXN0cm9rZShub3JtYWxpemVLZXlzdHJva2VzKGtleSksIHRhcmdldClcbiAgICAgICAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQpXG5cbiAgICAgIGlmIHdhaXRzRm9yRmluaXNoXG4gICAgICAgIHdhaXRzRm9yIC0+IGZpbmlzaGVkXG5cbiAgICBpZiBvcHRpb25zLnBhcnRpYWxNYXRjaFRpbWVvdXRcbiAgICAgIGFkdmFuY2VDbG9jayhhdG9tLmtleW1hcHMuZ2V0UGFydGlhbE1hdGNoVGltZW91dCgpKVxuXG4gIGtleXN0cm9rZTogLT5cbiAgICAjIERPTlQgcmVtb3ZlIHRoaXMgbWV0aG9kIHNpbmNlIGZpZWxkIGV4dHJhY3Rpb24gaXMgc3RpbGwgdXNlZCBpbiB2bXAgcGx1Z2luc1xuICAgIHRocm93IG5ldyBFcnJvcignRG9udCB1c2UgYGtleXN0cm9rZShcInggeSB6XCIpYCwgaW5zdGVhZCB1c2UgYGVuc3VyZShcInggeSB6XCIpYCcpXG5cbiAgIyBFbnN1cmUgZWFjaCBvcHRpb25zIGZyb20gaGVyZVxuICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGVuc3VyZVRleHQ6ICh0ZXh0KSAtPlxuICAgIGV4cGVjdChAZWRpdG9yLmdldFRleHQoKSkudG9FcXVhbCh0ZXh0KVxuXG4gIGVuc3VyZVRleHRfOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlVGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBlbnN1cmVUZXh0QzogKHRleHQpIC0+XG4gICAgY3Vyc29ycyA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCd8JywgdGV4dC5yZXBsYWNlKC8hL2csICcnKSlcbiAgICBsYXN0Q3Vyc29yID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJyEnLCB0ZXh0LnJlcGxhY2UoL1xcfC9nLCAnJykpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnMuY29uY2F0KGxhc3RDdXJzb3IpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnNcbiAgICAgIC5tYXAgKHBvaW50KSAtPiBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICAgICAgLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuICAgIEBlbnN1cmVUZXh0KHRleHQucmVwbGFjZSgvW1xcfCFdL2csICcnKSlcbiAgICBpZiBjdXJzb3JzLmxlbmd0aFxuICAgICAgQGVuc3VyZUN1cnNvcihjdXJzb3JzLCB0cnVlKVxuXG4gICAgaWYgbGFzdEN1cnNvci5sZW5ndGhcbiAgICAgIGV4cGVjdChAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwobGFzdEN1cnNvclswXSlcblxuICBlbnN1cmVUZXh0Q186ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVUZXh0Qyh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBlbnN1cmVTZWxlY3RlZFRleHQ6ICh0ZXh0LCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBpZiBvcmRlcmVkXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBhY3R1YWwgPSAocy5nZXRUZXh0KCkgZm9yIHMgaW4gc2VsZWN0aW9ucylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXkodGV4dCkpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0XzogKHRleHQsIG9yZGVyZWQpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkVGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSwgb3JkZXJlZClcblxuICBlbnN1cmVTZWxlY3Rpb25Jc05hcnJvd2VkOiAoaXNOYXJyb3dlZCkgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUubW9kZU1hbmFnZXIuaXNOYXJyb3dlZCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbChpc05hcnJvd2VkKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dE9yZGVyZWQ6ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFRleHQodGV4dCwgdHJ1ZSlcblxuICBlbnN1cmVDdXJzb3I6IChwb2ludHMsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbnMoKVxuICAgIGFjdHVhbCA9IGFjdHVhbC5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYikgaWYgb3JkZXJlZFxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVDdXJzb3JTY3JlZW46IChwb2ludHMpIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbnMoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVSZWdpc3RlcjogKHJlZ2lzdGVyKSAtPlxuICAgIGZvciBuYW1lLCBlbnN1cmUgb2YgcmVnaXN0ZXJcbiAgICAgIHtzZWxlY3Rpb259ID0gZW5zdXJlXG4gICAgICBkZWxldGUgZW5zdXJlLnNlbGVjdGlvblxuICAgICAgcmVnID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChuYW1lLCBzZWxlY3Rpb24pXG4gICAgICBmb3IgcHJvcGVydHksIF92YWx1ZSBvZiBlbnN1cmVcbiAgICAgICAgZXhwZWN0KHJlZ1twcm9wZXJ0eV0pLnRvRXF1YWwoX3ZhbHVlKVxuXG4gIGVuc3VyZU51bUN1cnNvcnM6IChudW1iZXIpIC0+XG4gICAgZXhwZWN0KEBlZGl0b3IuZ2V0Q3Vyc29ycygpKS50b0hhdmVMZW5ndGggbnVtYmVyXG5cbiAgX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlLCBmbikgLT5cbiAgICBzZWxlY3Rpb25zID0gaWYgb3JkZXJlZFxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgYWN0dWFsID0gKGZuKHMpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZSYW5nZShyYW5nZSkpXG5cbiAgZW5zdXJlU2VsZWN0ZWRTY3JlZW5SYW5nZTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIEBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5IHJhbmdlLCBvcmRlcmVkLCAocykgLT4gcy5nZXRTY3JlZW5SYW5nZSgpXG5cbiAgZW5zdXJlU2VsZWN0ZWRTY3JlZW5SYW5nZU9yZGVyZWQ6IChyYW5nZSkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRTY3JlZW5SYW5nZShyYW5nZSwgdHJ1ZSlcblxuICBlbnN1cmVTZWxlY3RlZEJ1ZmZlclJhbmdlOiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgQF9lbnN1cmVTZWxlY3RlZFJhbmdlQnkgcmFuZ2UsIG9yZGVyZWQsIChzKSAtPiBzLmdldEJ1ZmZlclJhbmdlKClcblxuICBlbnN1cmVTZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogKHJhbmdlKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlLCB0cnVlKVxuXG4gIGVuc3VyZVNlbGVjdGlvbklzUmV2ZXJzZWQ6IChyZXZlcnNlZCkgLT5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICBhY3R1YWwgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBleHBlY3QoYWN0dWFsKS50b0JlKHJldmVyc2VkKVxuXG4gIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZTogKHJhbmdlKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckJ1ZmZlclJhbmdlcygpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZSYW5nZShyYW5nZSkpXG5cbiAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAobnVtYmVyKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmdldE1hcmtlckNvdW50KClcbiAgICBleHBlY3QoYWN0dWFsKS50b0JlIG51bWJlclxuXG4gIGVuc3VyZU9jY3VycmVuY2VDb3VudDogKG51bWJlcikgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQ291bnQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvQmUgbnVtYmVyXG5cbiAgZW5zdXJlT2NjdXJyZW5jZVRleHQ6ICh0ZXh0KSAtPlxuICAgIG1hcmtlcnMgPSBAdmltU3RhdGUub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VycygpXG4gICAgcmFuZ2VzID0gKHIuZ2V0QnVmZmVyUmFuZ2UoKSBmb3IgciBpbiBtYXJrZXJzKVxuICAgIGFjdHVhbCA9IChAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHIpIGZvciByIGluIHJhbmdlcylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXkodGV4dCkpXG5cbiAgZW5zdXJlUHJvcGVydHlIZWFkOiAocG9pbnRzKSAtPlxuICAgIGdldEhlYWRQcm9wZXJ0eSA9IChzZWxlY3Rpb24pID0+XG4gICAgICBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignaGVhZCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBhY3R1YWwgPSAoZ2V0SGVhZFByb3BlcnR5KHMpIGZvciBzIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVQcm9wZXJ0eVRhaWw6IChwb2ludHMpIC0+XG4gICAgZ2V0VGFpbFByb3BlcnR5ID0gKHNlbGVjdGlvbikgPT5cbiAgICAgIEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCd0YWlsJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGFjdHVhbCA9IChnZXRUYWlsUHJvcGVydHkocykgZm9yIHMgaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVNjcm9sbFRvcDogKHNjcm9sbFRvcCkgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwgc2Nyb2xsVG9wXG5cbiAgZW5zdXJlTWFyazogKG1hcmspIC0+XG4gICAgZm9yIG5hbWUsIHBvaW50IG9mIG1hcmtcbiAgICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5tYXJrLmdldChuYW1lKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbChwb2ludClcblxuICBlbnN1cmVNb2RlOiAobW9kZSkgLT5cbiAgICBtb2RlID0gdG9BcnJheShtb2RlKS5zbGljZSgpXG4gICAgZXhwZWN0KEB2aW1TdGF0ZS5pc01vZGUobW9kZS4uLikpLnRvQmUodHJ1ZSlcblxuICAgIG1vZGVbMF0gPSBcIiN7bW9kZVswXX0tbW9kZVwiXG4gICAgbW9kZSA9IG1vZGUuZmlsdGVyKChtKSAtPiBtKVxuICAgIGV4cGVjdChAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3ZpbS1tb2RlLXBsdXMnKSkudG9CZSh0cnVlKVxuICAgIGZvciBtIGluIG1vZGVcbiAgICAgIGV4cGVjdChAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobSkpLnRvQmUodHJ1ZSlcbiAgICBzaG91bGROb3RDb250YWluQ2xhc3NlcyA9IF8uZGlmZmVyZW5jZShzdXBwb3J0ZWRNb2RlQ2xhc3MsIG1vZGUpXG4gICAgZm9yIG0gaW4gc2hvdWxkTm90Q29udGFpbkNsYXNzZXNcbiAgICAgIGV4cGVjdChAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMobSkpLnRvQmUoZmFsc2UpXG5cbm1vZHVsZS5leHBvcnRzID0ge2dldFZpbVN0YXRlLCBnZXRWaWV3LCBkaXNwYXRjaCwgVGV4dERhdGEsIHdpdGhNb2NrUGxhdGZvcm19XG4iXX0=
