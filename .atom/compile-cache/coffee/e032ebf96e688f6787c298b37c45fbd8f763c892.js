(function() {
  var CompositeDisposable, Disposable, Emitter, Grim, InsertMode, Motions, Operators, Point, Prefixes, Range, Scroll, TextObjects, Utils, VimState, _, ref, ref1, settings,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Grim = require('grim');

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('event-kit'), Emitter = ref1.Emitter, Disposable = ref1.Disposable, CompositeDisposable = ref1.CompositeDisposable;

  settings = require('./settings');

  Operators = require('./operators/index');

  Prefixes = require('./prefixes');

  Motions = require('./motions/index');

  InsertMode = require('./insert-mode');

  TextObjects = require('./text-objects');

  Utils = require('./utils');

  Scroll = require('./scroll');

  module.exports = VimState = (function() {
    VimState.prototype.editor = null;

    VimState.prototype.opStack = null;

    VimState.prototype.mode = null;

    VimState.prototype.submode = null;

    VimState.prototype.destroyed = false;

    VimState.prototype.replaceModeListener = null;

    function VimState(editorElement, statusBarManager, globalVimState) {
      this.editorElement = editorElement;
      this.statusBarManager = statusBarManager;
      this.globalVimState = globalVimState;
      this.ensureCursorsWithinLine = bind(this.ensureCursorsWithinLine, this);
      this.checkSelections = bind(this.checkSelections, this);
      this.replaceModeUndoHandler = bind(this.replaceModeUndoHandler, this);
      this.replaceModeInsertHandler = bind(this.replaceModeInsertHandler, this);
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.marks = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.editorElement.addEventListener('mouseup', this.checkSelections);
      if (atom.commands.onDidDispatch != null) {
        this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
          return function(e) {
            if (e.target === _this.editorElement) {
              return _this.checkSelections();
            }
          };
        })(this)));
      }
      this.editorElement.classList.add("vim-mode");
      this.setupNormalMode();
      if (settings.startInInsertMode()) {
        this.activateInsertMode();
      } else {
        this.activateNormalMode();
      }
    }

    VimState.prototype.destroy = function() {
      var ref2;
      if (!this.destroyed) {
        this.destroyed = true;
        this.subscriptions.dispose();
        if (this.editor.isAlive()) {
          this.deactivateInsertMode();
          if ((ref2 = this.editorElement.component) != null) {
            ref2.setInputEnabled(true);
          }
          this.editorElement.classList.remove("vim-mode");
          this.editorElement.classList.remove("normal-mode");
        }
        this.editorElement.removeEventListener('mouseup', this.checkSelections);
        this.editor = null;
        this.editorElement = null;
        return this.emitter.emit('did-destroy');
      }
    };

    VimState.prototype.setupNormalMode = function() {
      this.registerCommands({
        'activate-normal-mode': (function(_this) {
          return function() {
            return _this.activateNormalMode();
          };
        })(this),
        'activate-linewise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('linewise');
          };
        })(this),
        'activate-characterwise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('characterwise');
          };
        })(this),
        'activate-blockwise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('blockwise');
          };
        })(this),
        'reset-normal-mode': (function(_this) {
          return function() {
            return _this.resetNormalMode();
          };
        })(this),
        'repeat-prefix': (function(_this) {
          return function(e) {
            return _this.repeatPrefix(e);
          };
        })(this),
        'reverse-selections': (function(_this) {
          return function(e) {
            return _this.reverseSelections(e);
          };
        })(this),
        'undo': (function(_this) {
          return function(e) {
            return _this.undo(e);
          };
        })(this),
        'replace-mode-backspace': (function(_this) {
          return function() {
            return _this.replaceModeUndo();
          };
        })(this),
        'insert-mode-put': (function(_this) {
          return function(e) {
            return _this.insertRegister(_this.registerName(e));
          };
        })(this),
        'copy-from-line-above': (function(_this) {
          return function() {
            return InsertMode.copyCharacterFromAbove(_this.editor, _this);
          };
        })(this),
        'copy-from-line-below': (function(_this) {
          return function() {
            return InsertMode.copyCharacterFromBelow(_this.editor, _this);
          };
        })(this)
      });
      return this.registerOperationCommands({
        'activate-insert-mode': (function(_this) {
          return function() {
            return new Operators.Insert(_this.editor, _this);
          };
        })(this),
        'activate-replace-mode': (function(_this) {
          return function() {
            return new Operators.ReplaceMode(_this.editor, _this);
          };
        })(this),
        'substitute': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveRight(_this.editor, _this)];
          };
        })(this),
        'substitute-line': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveToRelativeLine(_this.editor, _this)];
          };
        })(this),
        'insert-after': (function(_this) {
          return function() {
            return new Operators.InsertAfter(_this.editor, _this);
          };
        })(this),
        'insert-after-end-of-line': (function(_this) {
          return function() {
            return new Operators.InsertAfterEndOfLine(_this.editor, _this);
          };
        })(this),
        'insert-at-beginning-of-line': (function(_this) {
          return function() {
            return new Operators.InsertAtBeginningOfLine(_this.editor, _this);
          };
        })(this),
        'insert-above-with-newline': (function(_this) {
          return function() {
            return new Operators.InsertAboveWithNewline(_this.editor, _this);
          };
        })(this),
        'insert-below-with-newline': (function(_this) {
          return function() {
            return new Operators.InsertBelowWithNewline(_this.editor, _this);
          };
        })(this),
        'delete': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Delete);
          };
        })(this),
        'change': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Change);
          };
        })(this),
        'change-to-last-character-of-line': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveToLastCharacterOfLine(_this.editor, _this)];
          };
        })(this),
        'delete-right': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveRight(_this.editor, _this)];
          };
        })(this),
        'delete-left': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveLeft(_this.editor, _this)];
          };
        })(this),
        'delete-to-last-character-of-line': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveToLastCharacterOfLine(_this.editor, _this)];
          };
        })(this),
        'toggle-case': (function(_this) {
          return function() {
            return new Operators.ToggleCase(_this.editor, _this);
          };
        })(this),
        'upper-case': (function(_this) {
          return function() {
            return new Operators.UpperCase(_this.editor, _this);
          };
        })(this),
        'lower-case': (function(_this) {
          return function() {
            return new Operators.LowerCase(_this.editor, _this);
          };
        })(this),
        'toggle-case-now': (function(_this) {
          return function() {
            return new Operators.ToggleCase(_this.editor, _this, {
              complete: true
            });
          };
        })(this),
        'yank': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Yank);
          };
        })(this),
        'yank-line': (function(_this) {
          return function() {
            return [new Operators.Yank(_this.editor, _this), new Motions.MoveToRelativeLine(_this.editor, _this)];
          };
        })(this),
        'put-before': (function(_this) {
          return function() {
            return new Operators.Put(_this.editor, _this, {
              location: 'before'
            });
          };
        })(this),
        'put-after': (function(_this) {
          return function() {
            return new Operators.Put(_this.editor, _this, {
              location: 'after'
            });
          };
        })(this),
        'join': (function(_this) {
          return function() {
            return new Operators.Join(_this.editor, _this);
          };
        })(this),
        'indent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Indent);
          };
        })(this),
        'outdent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Outdent);
          };
        })(this),
        'auto-indent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Autoindent);
          };
        })(this),
        'increase': (function(_this) {
          return function() {
            return new Operators.Increase(_this.editor, _this);
          };
        })(this),
        'decrease': (function(_this) {
          return function() {
            return new Operators.Decrease(_this.editor, _this);
          };
        })(this),
        'move-left': (function(_this) {
          return function() {
            return new Motions.MoveLeft(_this.editor, _this);
          };
        })(this),
        'move-up': (function(_this) {
          return function() {
            return new Motions.MoveUp(_this.editor, _this);
          };
        })(this),
        'move-down': (function(_this) {
          return function() {
            return new Motions.MoveDown(_this.editor, _this);
          };
        })(this),
        'move-right': (function(_this) {
          return function() {
            return new Motions.MoveRight(_this.editor, _this);
          };
        })(this),
        'move-to-next-word': (function(_this) {
          return function() {
            return new Motions.MoveToNextWord(_this.editor, _this);
          };
        })(this),
        'move-to-next-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToNextWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-end-of-word': (function(_this) {
          return function() {
            return new Motions.MoveToEndOfWord(_this.editor, _this);
          };
        })(this),
        'move-to-end-of-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToEndOfWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-previous-word': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousWord(_this.editor, _this);
          };
        })(this),
        'move-to-previous-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-next-paragraph': (function(_this) {
          return function() {
            return new Motions.MoveToNextParagraph(_this.editor, _this);
          };
        })(this),
        'move-to-next-sentence': (function(_this) {
          return function() {
            return new Motions.MoveToNextSentence(_this.editor, _this);
          };
        })(this),
        'move-to-previous-sentence': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousSentence(_this.editor, _this);
          };
        })(this),
        'move-to-previous-paragraph': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousParagraph(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLine(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line-and-down': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineAndDown(_this.editor, _this);
          };
        })(this),
        'move-to-last-character-of-line': (function(_this) {
          return function() {
            return new Motions.MoveToLastCharacterOfLine(_this.editor, _this);
          };
        })(this),
        'move-to-last-nonblank-character-of-line-and-down': (function(_this) {
          return function() {
            return new Motions.MoveToLastNonblankCharacterOfLineAndDown(_this.editor, _this);
          };
        })(this),
        'move-to-beginning-of-line': (function(_this) {
          return function(e) {
            return _this.moveOrRepeat(e);
          };
        })(this),
        'move-to-first-character-of-line-up': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineUp(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line-down': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineDown(_this.editor, _this);
          };
        })(this),
        'move-to-start-of-file': (function(_this) {
          return function() {
            return new Motions.MoveToStartOfFile(_this.editor, _this);
          };
        })(this),
        'move-to-line': (function(_this) {
          return function() {
            return new Motions.MoveToAbsoluteLine(_this.editor, _this);
          };
        })(this),
        'move-to-top-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToTopOfScreen(_this.editorElement, _this);
          };
        })(this),
        'move-to-bottom-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToBottomOfScreen(_this.editorElement, _this);
          };
        })(this),
        'move-to-middle-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToMiddleOfScreen(_this.editorElement, _this);
          };
        })(this),
        'scroll-down': (function(_this) {
          return function() {
            return new Scroll.ScrollDown(_this.editorElement);
          };
        })(this),
        'scroll-up': (function(_this) {
          return function() {
            return new Scroll.ScrollUp(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-top': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToTop(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-top-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToTop(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-cursor-to-middle': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToMiddle(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-middle-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToMiddle(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-cursor-to-bottom': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToBottom(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-bottom-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToBottom(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-half-screen-up': (function(_this) {
          return function() {
            return new Motions.ScrollHalfUpKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-full-screen-up': (function(_this) {
          return function() {
            return new Motions.ScrollFullUpKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-half-screen-down': (function(_this) {
          return function() {
            return new Motions.ScrollHalfDownKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-full-screen-down': (function(_this) {
          return function() {
            return new Motions.ScrollFullDownKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-cursor-to-left': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToLeft(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-right': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToRight(_this.editorElement);
          };
        })(this),
        'select-inside-word': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideWord(_this.editor);
          };
        })(this),
        'select-inside-whole-word': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideWholeWord(_this.editor);
          };
        })(this),
        'select-inside-double-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '"', false);
          };
        })(this),
        'select-inside-single-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '\'', false);
          };
        })(this),
        'select-inside-back-ticks': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '`', false);
          };
        })(this),
        'select-inside-curly-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '{', '}', false);
          };
        })(this),
        'select-inside-angle-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '<', '>', false);
          };
        })(this),
        'select-inside-tags': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '>', '<', false);
          };
        })(this),
        'select-inside-square-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '[', ']', false);
          };
        })(this),
        'select-inside-parentheses': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '(', ')', false);
          };
        })(this),
        'select-inside-paragraph': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideParagraph(_this.editor, false);
          };
        })(this),
        'select-a-word': (function(_this) {
          return function() {
            return new TextObjects.SelectAWord(_this.editor);
          };
        })(this),
        'select-a-whole-word': (function(_this) {
          return function() {
            return new TextObjects.SelectAWholeWord(_this.editor);
          };
        })(this),
        'select-around-double-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '"', true);
          };
        })(this),
        'select-around-single-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '\'', true);
          };
        })(this),
        'select-around-back-ticks': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '`', true);
          };
        })(this),
        'select-around-curly-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '{', '}', true);
          };
        })(this),
        'select-around-angle-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '<', '>', true);
          };
        })(this),
        'select-around-square-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '[', ']', true);
          };
        })(this),
        'select-around-parentheses': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '(', ')', true);
          };
        })(this),
        'select-around-paragraph': (function(_this) {
          return function() {
            return new TextObjects.SelectAParagraph(_this.editor, true);
          };
        })(this),
        'register-prefix': (function(_this) {
          return function(e) {
            return _this.registerPrefix(e);
          };
        })(this),
        'repeat': (function(_this) {
          return function(e) {
            return new Operators.Repeat(_this.editor, _this);
          };
        })(this),
        'repeat-search': (function(_this) {
          return function(e) {
            return new Motions.RepeatSearch(_this.editor, _this);
          };
        })(this),
        'repeat-search-backwards': (function(_this) {
          return function(e) {
            return new Motions.RepeatSearch(_this.editor, _this).reversed();
          };
        })(this),
        'move-to-mark': (function(_this) {
          return function(e) {
            return new Motions.MoveToMark(_this.editor, _this);
          };
        })(this),
        'move-to-mark-literal': (function(_this) {
          return function(e) {
            return new Motions.MoveToMark(_this.editor, _this, false);
          };
        })(this),
        'mark': (function(_this) {
          return function(e) {
            return new Operators.Mark(_this.editor, _this);
          };
        })(this),
        'find': (function(_this) {
          return function(e) {
            return new Motions.Find(_this.editor, _this);
          };
        })(this),
        'find-backwards': (function(_this) {
          return function(e) {
            return new Motions.Find(_this.editor, _this).reverse();
          };
        })(this),
        'till': (function(_this) {
          return function(e) {
            return new Motions.Till(_this.editor, _this);
          };
        })(this),
        'till-backwards': (function(_this) {
          return function(e) {
            return new Motions.Till(_this.editor, _this).reverse();
          };
        })(this),
        'repeat-find': (function(_this) {
          return function(e) {
            if (_this.globalVimState.currentFind) {
              return new _this.globalVimState.currentFind.constructor(_this.editor, _this, {
                repeated: true
              });
            }
          };
        })(this),
        'repeat-find-reverse': (function(_this) {
          return function(e) {
            if (_this.globalVimState.currentFind) {
              return new _this.globalVimState.currentFind.constructor(_this.editor, _this, {
                repeated: true,
                reverse: true
              });
            }
          };
        })(this),
        'replace': (function(_this) {
          return function(e) {
            return new Operators.Replace(_this.editor, _this);
          };
        })(this),
        'search': (function(_this) {
          return function(e) {
            return new Motions.Search(_this.editor, _this);
          };
        })(this),
        'reverse-search': (function(_this) {
          return function(e) {
            return (new Motions.Search(_this.editor, _this)).reversed();
          };
        })(this),
        'search-current-word': (function(_this) {
          return function(e) {
            return new Motions.SearchCurrentWord(_this.editor, _this);
          };
        })(this),
        'bracket-matching-motion': (function(_this) {
          return function(e) {
            return new Motions.BracketMatchingMotion(_this.editor, _this);
          };
        })(this),
        'reverse-search-current-word': (function(_this) {
          return function(e) {
            return (new Motions.SearchCurrentWord(_this.editor, _this)).reversed();
          };
        })(this)
      });
    };

    VimState.prototype.registerCommands = function(commands) {
      var commandName, fn, results;
      results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        results.push((function(_this) {
          return function(fn) {
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "vim-mode:" + commandName, fn));
          };
        })(this)(fn));
      }
      return results;
    };

    VimState.prototype.registerOperationCommands = function(operationCommands) {
      var commandName, commands, fn1, operationFn;
      commands = {};
      fn1 = (function(_this) {
        return function(operationFn) {
          return commands[commandName] = function(event) {
            return _this.pushOperations(operationFn(event));
          };
        };
      })(this);
      for (commandName in operationCommands) {
        operationFn = operationCommands[commandName];
        fn1(operationFn);
      }
      return this.registerCommands(commands);
    };

    VimState.prototype.pushOperations = function(operations) {
      var i, len, operation, results, topOp;
      if (operations == null) {
        return;
      }
      if (!_.isArray(operations)) {
        operations = [operations];
      }
      results = [];
      for (i = 0, len = operations.length; i < len; i++) {
        operation = operations[i];
        if (this.mode === 'visual' && (operation instanceof Motions.Motion || operation instanceof TextObjects.TextObject)) {
          operation.execute = operation.select;
        }
        if (((topOp = this.topOperation()) != null) && (topOp.canComposeWith != null) && !topOp.canComposeWith(operation)) {
          this.resetNormalMode();
          this.emitter.emit('failed-to-compose');
          break;
        }
        this.opStack.push(operation);
        if (this.mode === 'visual' && operation instanceof Operators.Operator) {
          this.opStack.push(new Motions.CurrentSelection(this.editor, this));
        }
        results.push(this.processOpStack());
      }
      return results;
    };

    VimState.prototype.onDidFailToCompose = function(fn) {
      return this.emitter.on('failed-to-compose', fn);
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    VimState.prototype.undo = function() {
      this.editor.undo();
      return this.activateNormalMode();
    };

    VimState.prototype.processOpStack = function() {
      var e, poppedOperation;
      if (!(this.opStack.length > 0)) {
        return;
      }
      if (!this.topOperation().isComplete()) {
        if (this.mode === 'normal' && this.topOperation() instanceof Operators.Operator) {
          this.activateOperatorPendingMode();
        }
        return;
      }
      poppedOperation = this.opStack.pop();
      if (this.opStack.length) {
        try {
          this.topOperation().compose(poppedOperation);
          return this.processOpStack();
        } catch (error) {
          e = error;
          if ((e instanceof Operators.OperatorError) || (e instanceof Motions.MotionError)) {
            return this.resetNormalMode();
          } else {
            throw e;
          }
        }
      } else {
        if (poppedOperation.isRecordable()) {
          this.history.unshift(poppedOperation);
        }
        return poppedOperation.execute();
      }
    };

    VimState.prototype.topOperation = function() {
      return _.last(this.opStack);
    };

    VimState.prototype.getRegister = function(name) {
      var text, type;
      if (name === '"') {
        name = settings.defaultRegister();
      }
      if (name === '*' || name === '+') {
        text = atom.clipboard.read();
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else if (name === '%') {
        text = this.editor.getURI();
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else if (name === "_") {
        text = '';
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else {
        return this.globalVimState.registers[name.toLowerCase()];
      }
    };

    VimState.prototype.getMark = function(name) {
      if (this.marks[name]) {
        return this.marks[name].getBufferRange().start;
      } else {
        return void 0;
      }
    };

    VimState.prototype.setRegister = function(name, value) {
      if (name === '"') {
        name = settings.defaultRegister();
      }
      if (name === '*' || name === '+') {
        return atom.clipboard.write(value.text);
      } else if (name === '_') {

      } else if (/^[A-Z]$/.test(name)) {
        return this.appendRegister(name.toLowerCase(), value);
      } else {
        return this.globalVimState.registers[name] = value;
      }
    };

    VimState.prototype.appendRegister = function(name, value) {
      var base, register;
      register = (base = this.globalVimState.registers)[name] != null ? base[name] : base[name] = {
        type: 'character',
        text: ""
      };
      if (register.type === 'linewise' && value.type !== 'linewise') {
        return register.text += value.text + '\n';
      } else if (register.type !== 'linewise' && value.type === 'linewise') {
        register.text += '\n' + value.text;
        return register.type = 'linewise';
      } else {
        return register.text += value.text;
      }
    };

    VimState.prototype.setMark = function(name, pos) {
      var charCode, marker;
      if ((charCode = name.charCodeAt(0)) >= 96 && charCode <= 122) {
        marker = this.editor.markBufferRange(new Range(pos, pos), {
          invalidate: 'never',
          persistent: false
        });
        return this.marks[name] = marker;
      }
    };

    VimState.prototype.pushSearchHistory = function(search) {
      return this.globalVimState.searchHistory.unshift(search);
    };

    VimState.prototype.getSearchHistoryItem = function(index) {
      if (index == null) {
        index = 0;
      }
      return this.globalVimState.searchHistory[index];
    };

    VimState.prototype.activateNormalMode = function() {
      var i, len, ref2, selection;
      this.deactivateInsertMode();
      this.deactivateVisualMode();
      this.mode = 'normal';
      this.submode = null;
      this.changeModeClass('normal-mode');
      this.clearOpStack();
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        selection.clear({
          autoscroll: false
        });
      }
      this.ensureCursorsWithinLine();
      return this.updateStatusBar();
    };

    VimState.prototype.activateCommandMode = function() {
      Grim.deprecate("Use ::activateNormalMode instead");
      return this.activateNormalMode();
    };

    VimState.prototype.activateInsertMode = function(subtype) {
      if (subtype == null) {
        subtype = null;
      }
      this.mode = 'insert';
      this.editorElement.component.setInputEnabled(true);
      this.setInsertionCheckpoint();
      this.submode = subtype;
      this.changeModeClass('insert-mode');
      return this.updateStatusBar();
    };

    VimState.prototype.activateReplaceMode = function() {
      this.activateInsertMode('replace');
      this.replaceModeCounter = 0;
      this.editorElement.classList.add('replace-mode');
      this.subscriptions.add(this.replaceModeListener = this.editor.onWillInsertText(this.replaceModeInsertHandler));
      return this.subscriptions.add(this.replaceModeUndoListener = this.editor.onDidInsertText(this.replaceModeUndoHandler));
    };

    VimState.prototype.replaceModeInsertHandler = function(event) {
      var char, chars, i, j, len, len1, ref2, selection, selections;
      chars = ((ref2 = event.text) != null ? ref2.split('') : void 0) || [];
      selections = this.editor.getSelections();
      for (i = 0, len = chars.length; i < len; i++) {
        char = chars[i];
        if (char === '\n') {
          continue;
        }
        for (j = 0, len1 = selections.length; j < len1; j++) {
          selection = selections[j];
          if (!selection.cursor.isAtEndOfLine()) {
            selection["delete"]();
          }
        }
      }
    };

    VimState.prototype.replaceModeUndoHandler = function(event) {
      return this.replaceModeCounter++;
    };

    VimState.prototype.replaceModeUndo = function() {
      if (this.replaceModeCounter > 0) {
        this.editor.undo();
        this.editor.undo();
        this.editor.moveLeft();
        return this.replaceModeCounter--;
      }
    };

    VimState.prototype.setInsertionCheckpoint = function() {
      if (this.insertionCheckpoint == null) {
        return this.insertionCheckpoint = this.editor.createCheckpoint();
      }
    };

    VimState.prototype.deactivateInsertMode = function() {
      var changes, cursor, i, item, len, ref2, ref3;
      if ((ref2 = this.mode) !== null && ref2 !== 'insert') {
        return;
      }
      this.editorElement.component.setInputEnabled(false);
      this.editorElement.classList.remove('replace-mode');
      this.editor.groupChangesSinceCheckpoint(this.insertionCheckpoint);
      changes = this.editor.buffer.getChangesSinceCheckpoint(this.insertionCheckpoint);
      item = this.inputOperator(this.history[0]);
      this.insertionCheckpoint = null;
      if (item != null) {
        item.confirmChanges(changes);
      }
      ref3 = this.editor.getCursors();
      for (i = 0, len = ref3.length; i < len; i++) {
        cursor = ref3[i];
        if (!cursor.isAtBeginningOfLine()) {
          cursor.moveLeft();
        }
      }
      if (this.replaceModeListener != null) {
        this.replaceModeListener.dispose();
        this.subscriptions.remove(this.replaceModeListener);
        this.replaceModeListener = null;
        this.replaceModeUndoListener.dispose();
        this.subscriptions.remove(this.replaceModeUndoListener);
        return this.replaceModeUndoListener = null;
      }
    };

    VimState.prototype.deactivateVisualMode = function() {
      var i, len, ref2, results, selection;
      if (this.mode !== 'visual') {
        return;
      }
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        if (!(selection.isEmpty() || selection.isReversed())) {
          results.push(selection.cursor.moveLeft());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    VimState.prototype.inputOperator = function(item) {
      var ref2;
      if (item == null) {
        return item;
      }
      if (typeof item.inputOperator === "function" ? item.inputOperator() : void 0) {
        return item;
      }
      if ((ref2 = item.composedObject) != null ? typeof ref2.inputOperator === "function" ? ref2.inputOperator() : void 0 : void 0) {
        return item.composedObject;
      }
    };

    VimState.prototype.activateVisualMode = function(type) {
      var end, endRow, i, j, k, len, len1, originalRange, ref2, ref3, ref4, ref5, ref6, ref7, ref8, row, selection, start, startRow;
      if (this.mode === 'visual') {
        if (this.submode === type) {
          this.activateNormalMode();
          return;
        }
        this.submode = type;
        if (this.submode === 'linewise') {
          ref2 = this.editor.getSelections();
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            originalRange = selection.getBufferRange();
            selection.marker.setProperties({
              originalRange: originalRange
            });
            ref3 = selection.getBufferRowRange(), start = ref3[0], end = ref3[1];
            for (row = j = ref4 = start, ref5 = end; ref4 <= ref5 ? j <= ref5 : j >= ref5; row = ref4 <= ref5 ? ++j : --j) {
              selection.selectLine(row);
            }
          }
        } else if ((ref6 = this.submode) === 'characterwise' || ref6 === 'blockwise') {
          ref7 = this.editor.getSelections();
          for (k = 0, len1 = ref7.length; k < len1; k++) {
            selection = ref7[k];
            originalRange = selection.marker.getProperties().originalRange;
            if (originalRange) {
              ref8 = selection.getBufferRowRange(), startRow = ref8[0], endRow = ref8[1];
              originalRange.start.row = startRow;
              originalRange.end.row = endRow;
              selection.setBufferRange(originalRange);
            }
          }
        }
      } else {
        this.deactivateInsertMode();
        this.mode = 'visual';
        this.submode = type;
        this.changeModeClass('visual-mode');
        if (this.submode === 'linewise') {
          this.editor.selectLinesContainingCursors();
        } else if (this.editor.getSelectedText() === '') {
          this.editor.selectRight();
        }
      }
      return this.updateStatusBar();
    };

    VimState.prototype.resetVisualMode = function() {
      return this.activateVisualMode(this.submode);
    };

    VimState.prototype.activateOperatorPendingMode = function() {
      this.deactivateInsertMode();
      this.mode = 'operator-pending';
      this.submode = null;
      this.changeModeClass('operator-pending-mode');
      return this.updateStatusBar();
    };

    VimState.prototype.changeModeClass = function(targetMode) {
      var i, len, mode, ref2, results;
      ref2 = ['normal-mode', 'insert-mode', 'visual-mode', 'operator-pending-mode'];
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        mode = ref2[i];
        if (mode === targetMode) {
          results.push(this.editorElement.classList.add(mode));
        } else {
          results.push(this.editorElement.classList.remove(mode));
        }
      }
      return results;
    };

    VimState.prototype.resetNormalMode = function() {
      this.clearOpStack();
      this.editor.clearSelections();
      return this.activateNormalMode();
    };

    VimState.prototype.registerPrefix = function(e) {
      return new Prefixes.Register(this.registerName(e));
    };

    VimState.prototype.registerName = function(e) {
      var keyboardEvent, name, ref2, ref3;
      keyboardEvent = (ref2 = (ref3 = e.originalEvent) != null ? ref3.originalEvent : void 0) != null ? ref2 : e.originalEvent;
      name = atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
      if (name.lastIndexOf('shift-', 0) === 0) {
        name = name.slice(6);
      }
      return name;
    };

    VimState.prototype.repeatPrefix = function(e) {
      var keyboardEvent, num, ref2, ref3;
      keyboardEvent = (ref2 = (ref3 = e.originalEvent) != null ? ref3.originalEvent : void 0) != null ? ref2 : e.originalEvent;
      num = parseInt(atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent));
      if (this.topOperation() instanceof Prefixes.Repeat) {
        return this.topOperation().addDigit(num);
      } else {
        if (num === 0) {
          return e.abortKeyBinding();
        } else {
          return this.pushOperations(new Prefixes.Repeat(num));
        }
      }
    };

    VimState.prototype.reverseSelections = function() {
      var i, len, ref2, results, reversed, selection;
      reversed = !this.editor.getLastSelection().isReversed();
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(selection.setBufferRange(selection.getBufferRange(), {
          reversed: reversed
        }));
      }
      return results;
    };

    VimState.prototype.moveOrRepeat = function(e) {
      if (this.topOperation() instanceof Prefixes.Repeat) {
        this.repeatPrefix(e);
        return null;
      } else {
        return new Motions.MoveToBeginningOfLine(this.editor, this);
      }
    };

    VimState.prototype.linewiseAliasedOperator = function(constructor) {
      if (this.isOperatorPending(constructor)) {
        return new Motions.MoveToRelativeLine(this.editor, this);
      } else {
        return new constructor(this.editor, this);
      }
    };

    VimState.prototype.isOperatorPending = function(constructor) {
      var i, len, op, ref2;
      if (constructor != null) {
        ref2 = this.opStack;
        for (i = 0, len = ref2.length; i < len; i++) {
          op = ref2[i];
          if (op instanceof constructor) {
            return op;
          }
        }
        return false;
      } else {
        return this.opStack.length > 0;
      }
    };

    VimState.prototype.updateStatusBar = function() {
      return this.statusBarManager.update(this.mode, this.submode);
    };

    VimState.prototype.insertRegister = function(name) {
      var ref2, text;
      text = (ref2 = this.getRegister(name)) != null ? ref2.text : void 0;
      if (text != null) {
        return this.editor.insertText(text);
      }
    };

    VimState.prototype.checkSelections = function() {
      if (this.editor == null) {
        return;
      }
      if (this.editor.getSelections().every(function(selection) {
        return selection.isEmpty();
      })) {
        if (this.mode === 'normal') {
          this.ensureCursorsWithinLine();
        }
        if (this.mode === 'visual') {
          return this.activateNormalMode();
        }
      } else {
        if (this.mode === 'normal') {
          return this.activateVisualMode('characterwise');
        }
      }
    };

    VimState.prototype.ensureCursorsWithinLine = function() {
      var cursor, goalColumn, i, len, ref2;
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        goalColumn = cursor.goalColumn;
        if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) {
          cursor.moveLeft();
        }
        cursor.goalColumn = goalColumn;
      }
      return this.editor.mergeCursors();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9LQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFRLE9BQUEsQ0FBUSxNQUFSOztFQUNSLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLE9BQTZDLE9BQUEsQ0FBUSxXQUFSLENBQTdDLEVBQUMsc0JBQUQsRUFBVSw0QkFBVixFQUFzQjs7RUFDdEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLFNBQUEsR0FBWSxPQUFBLENBQVEsbUJBQVI7O0VBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUNYLE9BQUEsR0FBVSxPQUFBLENBQVEsaUJBQVI7O0VBQ1YsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUViLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUNNO3VCQUNKLE1BQUEsR0FBUTs7dUJBQ1IsT0FBQSxHQUFTOzt1QkFDVCxJQUFBLEdBQU07O3VCQUNOLE9BQUEsR0FBUzs7dUJBQ1QsU0FBQSxHQUFXOzt1QkFDWCxtQkFBQSxHQUFxQjs7SUFFUixrQkFBQyxhQUFELEVBQWlCLGdCQUFqQixFQUFvQyxjQUFwQztNQUFDLElBQUMsQ0FBQSxnQkFBRDtNQUFnQixJQUFDLENBQUEsbUJBQUQ7TUFBbUIsSUFBQyxDQUFBLGlCQUFEOzs7OztNQUMvQyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FB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QUFDLENBQUEsSUFBRCxLQUFTLFFBQWxDO2lCQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBLEVBQUE7U0FGRjtPQUFBLE1BQUE7UUFJRSxJQUF3QyxJQUFDLENBQUEsSUFBRCxLQUFTLFFBQWpEO2lCQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFvQixlQUFwQixFQUFBO1NBSkY7O0lBRmU7O3VCQVNqQix1QkFBQSxHQUF5QixTQUFBO0FBQ3ZCLFVBQUE7QUFBQTtBQUFBLFdBQUEsc0NBQUE7O1FBQ0csYUFBYztRQUNmLElBQUcsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFBLElBQTJCLENBQUksTUFBTSxDQUFDLG1CQUFQLENBQUEsQ0FBbEM7VUFDRSxNQUFNLENBQUMsUUFBUCxDQUFBLEVBREY7O1FBRUEsTUFBTSxDQUFDLFVBQVAsR0FBb0I7QUFKdEI7YUFNQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBQTtJQVB1Qjs7Ozs7QUF4cEIzQiIsInNvdXJjZXNDb250ZW50IjpbIkdyaW0gID0gcmVxdWlyZSAnZ3JpbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG57RW1pdHRlciwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbk9wZXJhdG9ycyA9IHJlcXVpcmUgJy4vb3BlcmF0b3JzL2luZGV4J1xuUHJlZml4ZXMgPSByZXF1aXJlICcuL3ByZWZpeGVzJ1xuTW90aW9ucyA9IHJlcXVpcmUgJy4vbW90aW9ucy9pbmRleCdcbkluc2VydE1vZGUgPSByZXF1aXJlICcuL2luc2VydC1tb2RlJ1xuXG5UZXh0T2JqZWN0cyA9IHJlcXVpcmUgJy4vdGV4dC1vYmplY3RzJ1xuVXRpbHMgPSByZXF1aXJlICcuL3V0aWxzJ1xuU2Nyb2xsID0gcmVxdWlyZSAnLi9zY3JvbGwnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZpbVN0YXRlXG4gIGVkaXRvcjogbnVsbFxuICBvcFN0YWNrOiBudWxsXG4gIG1vZGU6IG51bGxcbiAgc3VibW9kZTogbnVsbFxuICBkZXN0cm95ZWQ6IGZhbHNlXG4gIHJlcGxhY2VNb2RlTGlzdGVuZXI6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3JFbGVtZW50LCBAc3RhdHVzQmFyTWFuYWdlciwgQGdsb2JhbFZpbVN0YXRlKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVkaXRvciA9IEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICBAb3BTdGFjayA9IFtdXG4gICAgQGhpc3RvcnkgPSBbXVxuICAgIEBtYXJrcyA9IHt9XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95ID0+IEBkZXN0cm95KClcblxuICAgIEBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCBAY2hlY2tTZWxlY3Rpb25zXG4gICAgaWYgYXRvbS5jb21tYW5kcy5vbkRpZERpc3BhdGNoP1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaCAoZSkgPT5cbiAgICAgICAgaWYgZS50YXJnZXQgaXMgQGVkaXRvckVsZW1lbnRcbiAgICAgICAgICBAY2hlY2tTZWxlY3Rpb25zKClcblxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJ2aW0tbW9kZVwiKVxuICAgIEBzZXR1cE5vcm1hbE1vZGUoKVxuICAgIGlmIHNldHRpbmdzLnN0YXJ0SW5JbnNlcnRNb2RlKClcbiAgICAgIEBhY3RpdmF0ZUluc2VydE1vZGUoKVxuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgdW5sZXNzIEBkZXN0cm95ZWRcbiAgICAgIEBkZXN0cm95ZWQgPSB0cnVlXG4gICAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIGlmIEBlZGl0b3IuaXNBbGl2ZSgpXG4gICAgICAgIEBkZWFjdGl2YXRlSW5zZXJ0TW9kZSgpXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudD8uc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJ2aW0tbW9kZVwiKVxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwibm9ybWFsLW1vZGVcIilcbiAgICAgIEBlZGl0b3JFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNldXAnLCBAY2hlY2tTZWxlY3Rpb25zXG4gICAgICBAZWRpdG9yID0gbnVsbFxuICAgICAgQGVkaXRvckVsZW1lbnQgPSBudWxsXG4gICAgICBAZW1pdHRlci5lbWl0ICdkaWQtZGVzdHJveSdcblxuICAjIFByaXZhdGU6IENyZWF0ZXMgdGhlIHBsdWdpbidzIGJpbmRpbmdzXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIHNldHVwTm9ybWFsTW9kZTogLT5cbiAgICBAcmVnaXN0ZXJDb21tYW5kc1xuICAgICAgJ2FjdGl2YXRlLW5vcm1hbC1tb2RlJzogPT4gQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG4gICAgICAnYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGUnOiA9PiBAYWN0aXZhdGVWaXN1YWxNb2RlKCdsaW5ld2lzZScpXG4gICAgICAnYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZSc6ID0+IEBhY3RpdmF0ZVZpc3VhbE1vZGUoJ2NoYXJhY3Rlcndpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZSc6ID0+IEBhY3RpdmF0ZVZpc3VhbE1vZGUoJ2Jsb2Nrd2lzZScpXG4gICAgICAncmVzZXQtbm9ybWFsLW1vZGUnOiA9PiBAcmVzZXROb3JtYWxNb2RlKClcbiAgICAgICdyZXBlYXQtcHJlZml4JzogKGUpID0+IEByZXBlYXRQcmVmaXgoZSlcbiAgICAgICdyZXZlcnNlLXNlbGVjdGlvbnMnOiAoZSkgPT4gQHJldmVyc2VTZWxlY3Rpb25zKGUpXG4gICAgICAndW5kbyc6IChlKSA9PiBAdW5kbyhlKVxuICAgICAgJ3JlcGxhY2UtbW9kZS1iYWNrc3BhY2UnOiA9PiBAcmVwbGFjZU1vZGVVbmRvKClcbiAgICAgICdpbnNlcnQtbW9kZS1wdXQnOiAoZSkgPT4gQGluc2VydFJlZ2lzdGVyKEByZWdpc3Rlck5hbWUoZSkpXG4gICAgICAnY29weS1mcm9tLWxpbmUtYWJvdmUnOiA9PiBJbnNlcnRNb2RlLmNvcHlDaGFyYWN0ZXJGcm9tQWJvdmUoQGVkaXRvciwgdGhpcylcbiAgICAgICdjb3B5LWZyb20tbGluZS1iZWxvdyc6ID0+IEluc2VydE1vZGUuY29weUNoYXJhY3RlckZyb21CZWxvdyhAZWRpdG9yLCB0aGlzKVxuXG4gICAgQHJlZ2lzdGVyT3BlcmF0aW9uQ29tbWFuZHNcbiAgICAgICdhY3RpdmF0ZS1pbnNlcnQtbW9kZSc6ID0+IG5ldyBPcGVyYXRvcnMuSW5zZXJ0KEBlZGl0b3IsIHRoaXMpXG4gICAgICAnYWN0aXZhdGUtcmVwbGFjZS1tb2RlJzogPT4gbmV3IE9wZXJhdG9ycy5SZXBsYWNlTW9kZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ3N1YnN0aXR1dGUnOiA9PiBbbmV3IE9wZXJhdG9ycy5DaGFuZ2UoQGVkaXRvciwgdGhpcyksIG5ldyBNb3Rpb25zLk1vdmVSaWdodChAZWRpdG9yLCB0aGlzKV1cbiAgICAgICdzdWJzdGl0dXRlLWxpbmUnOiA9PiBbbmV3IE9wZXJhdG9ycy5DaGFuZ2UoQGVkaXRvciwgdGhpcyksIG5ldyBNb3Rpb25zLk1vdmVUb1JlbGF0aXZlTGluZShAZWRpdG9yLCB0aGlzKV1cbiAgICAgICdpbnNlcnQtYWZ0ZXInOiA9PiBuZXcgT3BlcmF0b3JzLkluc2VydEFmdGVyKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnaW5zZXJ0LWFmdGVyLWVuZC1vZi1saW5lJzogPT4gbmV3IE9wZXJhdG9ycy5JbnNlcnRBZnRlckVuZE9mTGluZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2luc2VydC1hdC1iZWdpbm5pbmctb2YtbGluZSc6ID0+IG5ldyBPcGVyYXRvcnMuSW5zZXJ0QXRCZWdpbm5pbmdPZkxpbmUoQGVkaXRvciwgdGhpcylcbiAgICAgICdpbnNlcnQtYWJvdmUtd2l0aC1uZXdsaW5lJzogPT4gbmV3IE9wZXJhdG9ycy5JbnNlcnRBYm92ZVdpdGhOZXdsaW5lKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnaW5zZXJ0LWJlbG93LXdpdGgtbmV3bGluZSc6ID0+IG5ldyBPcGVyYXRvcnMuSW5zZXJ0QmVsb3dXaXRoTmV3bGluZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2RlbGV0ZSc6ID0+IEBsaW5ld2lzZUFsaWFzZWRPcGVyYXRvcihPcGVyYXRvcnMuRGVsZXRlKVxuICAgICAgJ2NoYW5nZSc6ID0+IEBsaW5ld2lzZUFsaWFzZWRPcGVyYXRvcihPcGVyYXRvcnMuQ2hhbmdlKVxuICAgICAgJ2NoYW5nZS10by1sYXN0LWNoYXJhY3Rlci1vZi1saW5lJzogPT4gW25ldyBPcGVyYXRvcnMuQ2hhbmdlKEBlZGl0b3IsIHRoaXMpLCBuZXcgTW90aW9ucy5Nb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lKEBlZGl0b3IsIHRoaXMpXVxuICAgICAgJ2RlbGV0ZS1yaWdodCc6ID0+IFtuZXcgT3BlcmF0b3JzLkRlbGV0ZShAZWRpdG9yLCB0aGlzKSwgbmV3IE1vdGlvbnMuTW92ZVJpZ2h0KEBlZGl0b3IsIHRoaXMpXVxuICAgICAgJ2RlbGV0ZS1sZWZ0JzogPT4gW25ldyBPcGVyYXRvcnMuRGVsZXRlKEBlZGl0b3IsIHRoaXMpLCBuZXcgTW90aW9ucy5Nb3ZlTGVmdChAZWRpdG9yLCB0aGlzKV1cbiAgICAgICdkZWxldGUtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZSc6ID0+IFtuZXcgT3BlcmF0b3JzLkRlbGV0ZShAZWRpdG9yLCB0aGlzKSwgbmV3IE1vdGlvbnMuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZShAZWRpdG9yLCB0aGlzKV1cbiAgICAgICd0b2dnbGUtY2FzZSc6ID0+IG5ldyBPcGVyYXRvcnMuVG9nZ2xlQ2FzZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ3VwcGVyLWNhc2UnOiA9PiBuZXcgT3BlcmF0b3JzLlVwcGVyQ2FzZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2xvd2VyLWNhc2UnOiA9PiBuZXcgT3BlcmF0b3JzLkxvd2VyQ2FzZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ3RvZ2dsZS1jYXNlLW5vdyc6ID0+IG5ldyBPcGVyYXRvcnMuVG9nZ2xlQ2FzZShAZWRpdG9yLCB0aGlzLCBjb21wbGV0ZTogdHJ1ZSlcbiAgICAgICd5YW5rJzogPT4gQGxpbmV3aXNlQWxpYXNlZE9wZXJhdG9yKE9wZXJhdG9ycy5ZYW5rKVxuICAgICAgJ3lhbmstbGluZSc6ID0+IFtuZXcgT3BlcmF0b3JzLllhbmsoQGVkaXRvciwgdGhpcyksIG5ldyBNb3Rpb25zLk1vdmVUb1JlbGF0aXZlTGluZShAZWRpdG9yLCB0aGlzKV1cbiAgICAgICdwdXQtYmVmb3JlJzogPT4gbmV3IE9wZXJhdG9ycy5QdXQoQGVkaXRvciwgdGhpcywgbG9jYXRpb246ICdiZWZvcmUnKVxuICAgICAgJ3B1dC1hZnRlcic6ID0+IG5ldyBPcGVyYXRvcnMuUHV0KEBlZGl0b3IsIHRoaXMsIGxvY2F0aW9uOiAnYWZ0ZXInKVxuICAgICAgJ2pvaW4nOiA9PiBuZXcgT3BlcmF0b3JzLkpvaW4oQGVkaXRvciwgdGhpcylcbiAgICAgICdpbmRlbnQnOiA9PiBAbGluZXdpc2VBbGlhc2VkT3BlcmF0b3IoT3BlcmF0b3JzLkluZGVudClcbiAgICAgICdvdXRkZW50JzogPT4gQGxpbmV3aXNlQWxpYXNlZE9wZXJhdG9yKE9wZXJhdG9ycy5PdXRkZW50KVxuICAgICAgJ2F1dG8taW5kZW50JzogPT4gQGxpbmV3aXNlQWxpYXNlZE9wZXJhdG9yKE9wZXJhdG9ycy5BdXRvaW5kZW50KVxuICAgICAgJ2luY3JlYXNlJzogPT4gbmV3IE9wZXJhdG9ycy5JbmNyZWFzZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2RlY3JlYXNlJzogPT4gbmV3IE9wZXJhdG9ycy5EZWNyZWFzZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtbGVmdCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVMZWZ0KEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS11cCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVVcChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtZG93bic6ID0+IG5ldyBNb3Rpb25zLk1vdmVEb3duKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS1yaWdodCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVSaWdodChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tbmV4dC13b3JkJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvTmV4dFdvcmQoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLW5leHQtd2hvbGUtd29yZCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb05leHRXaG9sZVdvcmQoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWVuZC1vZi13b3JkJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvRW5kT2ZXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1lbmQtb2Ytd2hvbGUtd29yZCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb0VuZE9mV2hvbGVXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1wcmV2aW91cy13b3JkJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvUHJldmlvdXNXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1wcmV2aW91cy13aG9sZS13b3JkJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvUHJldmlvdXNXaG9sZVdvcmQoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLW5leHQtcGFyYWdyYXBoJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvTmV4dFBhcmFncmFwaChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tbmV4dC1zZW50ZW5jZSc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb05leHRTZW50ZW5jZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tcHJldmlvdXMtc2VudGVuY2UnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9QcmV2aW91c1NlbnRlbmNlKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1wcmV2aW91cy1wYXJhZ3JhcGgnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9QcmV2aW91c1BhcmFncmFwaChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUtYW5kLWRvd24nOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZUFuZERvd24oQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmUnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1sYXN0LW5vbmJsYW5rLWNoYXJhY3Rlci1vZi1saW5lLWFuZC1kb3duJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvTGFzdE5vbmJsYW5rQ2hhcmFjdGVyT2ZMaW5lQW5kRG93bihAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tYmVnaW5uaW5nLW9mLWxpbmUnOiAoZSkgPT4gQG1vdmVPclJlcGVhdChlKVxuICAgICAgJ21vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUtdXAnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZVVwKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1maXJzdC1jaGFyYWN0ZXItb2YtbGluZS1kb3duJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVEb3duKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1zdGFydC1vZi1maWxlJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvU3RhcnRPZkZpbGUoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWxpbmUnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9BYnNvbHV0ZUxpbmUoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLXRvcC1vZi1zY3JlZW4nOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9Ub3BPZlNjcmVlbihAZWRpdG9yRWxlbWVudCwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWJvdHRvbS1vZi1zY3JlZW4nOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9Cb3R0b21PZlNjcmVlbihAZWRpdG9yRWxlbWVudCwgdGhpcylcbiAgICAgICdtb3ZlLXRvLW1pZGRsZS1vZi1zY3JlZW4nOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9NaWRkbGVPZlNjcmVlbihAZWRpdG9yRWxlbWVudCwgdGhpcylcbiAgICAgICdzY3JvbGwtZG93bic6ID0+IG5ldyBTY3JvbGwuU2Nyb2xsRG93bihAZWRpdG9yRWxlbWVudClcbiAgICAgICdzY3JvbGwtdXAnOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbFVwKEBlZGl0b3JFbGVtZW50KVxuICAgICAgJ3Njcm9sbC1jdXJzb3ItdG8tdG9wJzogPT4gbmV3IFNjcm9sbC5TY3JvbGxDdXJzb3JUb1RvcChAZWRpdG9yRWxlbWVudClcbiAgICAgICdzY3JvbGwtY3Vyc29yLXRvLXRvcC1sZWF2ZSc6ID0+IG5ldyBTY3JvbGwuU2Nyb2xsQ3Vyc29yVG9Ub3AoQGVkaXRvckVsZW1lbnQsIHtsZWF2ZUN1cnNvcjogdHJ1ZX0pXG4gICAgICAnc2Nyb2xsLWN1cnNvci10by1taWRkbGUnOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbEN1cnNvclRvTWlkZGxlKEBlZGl0b3JFbGVtZW50KVxuICAgICAgJ3Njcm9sbC1jdXJzb3ItdG8tbWlkZGxlLWxlYXZlJzogPT4gbmV3IFNjcm9sbC5TY3JvbGxDdXJzb3JUb01pZGRsZShAZWRpdG9yRWxlbWVudCwge2xlYXZlQ3Vyc29yOiB0cnVlfSlcbiAgICAgICdzY3JvbGwtY3Vyc29yLXRvLWJvdHRvbSc6ID0+IG5ldyBTY3JvbGwuU2Nyb2xsQ3Vyc29yVG9Cb3R0b20oQGVkaXRvckVsZW1lbnQpXG4gICAgICAnc2Nyb2xsLWN1cnNvci10by1ib3R0b20tbGVhdmUnOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbEN1cnNvclRvQm90dG9tKEBlZGl0b3JFbGVtZW50LCB7bGVhdmVDdXJzb3I6IHRydWV9KVxuICAgICAgJ3Njcm9sbC1oYWxmLXNjcmVlbi11cCc6ID0+IG5ldyBNb3Rpb25zLlNjcm9sbEhhbGZVcEtlZXBDdXJzb3IoQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnc2Nyb2xsLWZ1bGwtc2NyZWVuLXVwJzogPT4gbmV3IE1vdGlvbnMuU2Nyb2xsRnVsbFVwS2VlcEN1cnNvcihAZWRpdG9yRWxlbWVudCwgdGhpcylcbiAgICAgICdzY3JvbGwtaGFsZi1zY3JlZW4tZG93bic6ID0+IG5ldyBNb3Rpb25zLlNjcm9sbEhhbGZEb3duS2VlcEN1cnNvcihAZWRpdG9yRWxlbWVudCwgdGhpcylcbiAgICAgICdzY3JvbGwtZnVsbC1zY3JlZW4tZG93bic6ID0+IG5ldyBNb3Rpb25zLlNjcm9sbEZ1bGxEb3duS2VlcEN1cnNvcihAZWRpdG9yRWxlbWVudCwgdGhpcylcbiAgICAgICdzY3JvbGwtY3Vyc29yLXRvLWxlZnQnOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbEN1cnNvclRvTGVmdChAZWRpdG9yRWxlbWVudClcbiAgICAgICdzY3JvbGwtY3Vyc29yLXRvLXJpZ2h0JzogPT4gbmV3IFNjcm9sbC5TY3JvbGxDdXJzb3JUb1JpZ2h0KEBlZGl0b3JFbGVtZW50KVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtd29yZCc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVXb3JkKEBlZGl0b3IpXG4gICAgICAnc2VsZWN0LWluc2lkZS13aG9sZS13b3JkJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZVdob2xlV29yZChAZWRpdG9yKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtZG91YmxlLXF1b3Rlcyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVRdW90ZXMoQGVkaXRvciwgJ1wiJywgZmFsc2UpXG4gICAgICAnc2VsZWN0LWluc2lkZS1zaW5nbGUtcXVvdGVzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZVF1b3RlcyhAZWRpdG9yLCAnXFwnJywgZmFsc2UpXG4gICAgICAnc2VsZWN0LWluc2lkZS1iYWNrLXRpY2tzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZVF1b3RlcyhAZWRpdG9yLCAnYCcsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtY3VybHktYnJhY2tldHMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJ3snLCAnfScsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtYW5nbGUtYnJhY2tldHMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJzwnLCAnPicsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtdGFncyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVCcmFja2V0cyhAZWRpdG9yLCAnPicsICc8JywgZmFsc2UpXG4gICAgICAnc2VsZWN0LWluc2lkZS1zcXVhcmUtYnJhY2tldHMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJ1snLCAnXScsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtcGFyZW50aGVzZXMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJygnLCAnKScsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtcGFyYWdyYXBoJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZVBhcmFncmFwaChAZWRpdG9yLCBmYWxzZSlcbiAgICAgICdzZWxlY3QtYS13b3JkJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEFXb3JkKEBlZGl0b3IpXG4gICAgICAnc2VsZWN0LWEtd2hvbGUtd29yZCc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RBV2hvbGVXb3JkKEBlZGl0b3IpXG4gICAgICAnc2VsZWN0LWFyb3VuZC1kb3VibGUtcXVvdGVzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZVF1b3RlcyhAZWRpdG9yLCAnXCInLCB0cnVlKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtc2luZ2xlLXF1b3Rlcyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVRdW90ZXMoQGVkaXRvciwgJ1xcJycsIHRydWUpXG4gICAgICAnc2VsZWN0LWFyb3VuZC1iYWNrLXRpY2tzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZVF1b3RlcyhAZWRpdG9yLCAnYCcsIHRydWUpXG4gICAgICAnc2VsZWN0LWFyb3VuZC1jdXJseS1icmFja2V0cyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVCcmFja2V0cyhAZWRpdG9yLCAneycsICd9JywgdHJ1ZSlcbiAgICAgICdzZWxlY3QtYXJvdW5kLWFuZ2xlLWJyYWNrZXRzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICc8JywgJz4nLCB0cnVlKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtc3F1YXJlLWJyYWNrZXRzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICdbJywgJ10nLCB0cnVlKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtcGFyZW50aGVzZXMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJygnLCAnKScsIHRydWUpXG4gICAgICAnc2VsZWN0LWFyb3VuZC1wYXJhZ3JhcGgnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0QVBhcmFncmFwaChAZWRpdG9yLCB0cnVlKVxuICAgICAgJ3JlZ2lzdGVyLXByZWZpeCc6IChlKSA9PiBAcmVnaXN0ZXJQcmVmaXgoZSlcbiAgICAgICdyZXBlYXQnOiAoZSkgPT4gbmV3IE9wZXJhdG9ycy5SZXBlYXQoQGVkaXRvciwgdGhpcylcbiAgICAgICdyZXBlYXQtc2VhcmNoJzogKGUpID0+IG5ldyBNb3Rpb25zLlJlcGVhdFNlYXJjaChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ3JlcGVhdC1zZWFyY2gtYmFja3dhcmRzJzogKGUpID0+IG5ldyBNb3Rpb25zLlJlcGVhdFNlYXJjaChAZWRpdG9yLCB0aGlzKS5yZXZlcnNlZCgpXG4gICAgICAnbW92ZS10by1tYXJrJzogKGUpID0+IG5ldyBNb3Rpb25zLk1vdmVUb01hcmsoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLW1hcmstbGl0ZXJhbCc6IChlKSA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9NYXJrKEBlZGl0b3IsIHRoaXMsIGZhbHNlKVxuICAgICAgJ21hcmsnOiAoZSkgPT4gbmV3IE9wZXJhdG9ycy5NYXJrKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnZmluZCc6IChlKSA9PiBuZXcgTW90aW9ucy5GaW5kKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnZmluZC1iYWNrd2FyZHMnOiAoZSkgPT4gbmV3IE1vdGlvbnMuRmluZChAZWRpdG9yLCB0aGlzKS5yZXZlcnNlKClcbiAgICAgICd0aWxsJzogKGUpID0+IG5ldyBNb3Rpb25zLlRpbGwoQGVkaXRvciwgdGhpcylcbiAgICAgICd0aWxsLWJhY2t3YXJkcyc6IChlKSA9PiBuZXcgTW90aW9ucy5UaWxsKEBlZGl0b3IsIHRoaXMpLnJldmVyc2UoKVxuICAgICAgJ3JlcGVhdC1maW5kJzogKGUpID0+IG5ldyBAZ2xvYmFsVmltU3RhdGUuY3VycmVudEZpbmQuY29uc3RydWN0b3IoQGVkaXRvciwgdGhpcywgcmVwZWF0ZWQ6IHRydWUpIGlmIEBnbG9iYWxWaW1TdGF0ZS5jdXJyZW50RmluZFxuICAgICAgJ3JlcGVhdC1maW5kLXJldmVyc2UnOiAoZSkgPT4gbmV3IEBnbG9iYWxWaW1TdGF0ZS5jdXJyZW50RmluZC5jb25zdHJ1Y3RvcihAZWRpdG9yLCB0aGlzLCByZXBlYXRlZDogdHJ1ZSwgcmV2ZXJzZTogdHJ1ZSkgaWYgQGdsb2JhbFZpbVN0YXRlLmN1cnJlbnRGaW5kXG4gICAgICAncmVwbGFjZSc6IChlKSA9PiBuZXcgT3BlcmF0b3JzLlJlcGxhY2UoQGVkaXRvciwgdGhpcylcbiAgICAgICdzZWFyY2gnOiAoZSkgPT4gbmV3IE1vdGlvbnMuU2VhcmNoKEBlZGl0b3IsIHRoaXMpXG4gICAgICAncmV2ZXJzZS1zZWFyY2gnOiAoZSkgPT4gKG5ldyBNb3Rpb25zLlNlYXJjaChAZWRpdG9yLCB0aGlzKSkucmV2ZXJzZWQoKVxuICAgICAgJ3NlYXJjaC1jdXJyZW50LXdvcmQnOiAoZSkgPT4gbmV3IE1vdGlvbnMuU2VhcmNoQ3VycmVudFdvcmQoQGVkaXRvciwgdGhpcylcbiAgICAgICdicmFja2V0LW1hdGNoaW5nLW1vdGlvbic6IChlKSA9PiBuZXcgTW90aW9ucy5CcmFja2V0TWF0Y2hpbmdNb3Rpb24oQGVkaXRvciwgdGhpcylcbiAgICAgICdyZXZlcnNlLXNlYXJjaC1jdXJyZW50LXdvcmQnOiAoZSkgPT4gKG5ldyBNb3Rpb25zLlNlYXJjaEN1cnJlbnRXb3JkKEBlZGl0b3IsIHRoaXMpKS5yZXZlcnNlZCgpXG5cbiAgIyBQcml2YXRlOiBSZWdpc3RlciBtdWx0aXBsZSBjb21tYW5kIGhhbmRsZXJzIHZpYSBhbiB7T2JqZWN0fSB0aGF0IG1hcHNcbiAgIyBjb21tYW5kIG5hbWVzIHRvIGNvbW1hbmQgaGFuZGxlciBmdW5jdGlvbnMuXG4gICNcbiAgIyBQcmVmaXhlcyB0aGUgZ2l2ZW4gY29tbWFuZCBuYW1lcyB3aXRoICd2aW0tbW9kZTonIHRvIHJlZHVjZSByZWR1bmRhbmN5IGluXG4gICMgdGhlIHByb3ZpZGVkIG9iamVjdC5cbiAgcmVnaXN0ZXJDb21tYW5kczogKGNvbW1hbmRzKSAtPlxuICAgIGZvciBjb21tYW5kTmFtZSwgZm4gb2YgY29tbWFuZHNcbiAgICAgIGRvIChmbikgPT5cbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCBcInZpbS1tb2RlOiN7Y29tbWFuZE5hbWV9XCIsIGZuKSlcblxuICAjIFByaXZhdGU6IFJlZ2lzdGVyIG11bHRpcGxlIE9wZXJhdG9ycyB2aWEgYW4ge09iamVjdH0gdGhhdFxuICAjIG1hcHMgY29tbWFuZCBuYW1lcyB0byBmdW5jdGlvbnMgdGhhdCByZXR1cm4gb3BlcmF0aW9ucyB0byBwdXNoLlxuICAjXG4gICMgUHJlZml4ZXMgdGhlIGdpdmVuIGNvbW1hbmQgbmFtZXMgd2l0aCAndmltLW1vZGU6JyB0byByZWR1Y2UgcmVkdW5kYW5jeSBpblxuICAjIHRoZSBnaXZlbiBvYmplY3QuXG4gIHJlZ2lzdGVyT3BlcmF0aW9uQ29tbWFuZHM6IChvcGVyYXRpb25Db21tYW5kcykgLT5cbiAgICBjb21tYW5kcyA9IHt9XG4gICAgZm9yIGNvbW1hbmROYW1lLCBvcGVyYXRpb25GbiBvZiBvcGVyYXRpb25Db21tYW5kc1xuICAgICAgZG8gKG9wZXJhdGlvbkZuKSA9PlxuICAgICAgICBjb21tYW5kc1tjb21tYW5kTmFtZV0gPSAoZXZlbnQpID0+IEBwdXNoT3BlcmF0aW9ucyhvcGVyYXRpb25GbihldmVudCkpXG4gICAgQHJlZ2lzdGVyQ29tbWFuZHMoY29tbWFuZHMpXG5cbiAgIyBQcml2YXRlOiBQdXNoIHRoZSBnaXZlbiBvcGVyYXRpb25zIG9udG8gdGhlIG9wZXJhdGlvbiBzdGFjaywgdGhlbiBwcm9jZXNzXG4gICMgaXQuXG4gIHB1c2hPcGVyYXRpb25zOiAob3BlcmF0aW9ucykgLT5cbiAgICByZXR1cm4gdW5sZXNzIG9wZXJhdGlvbnM/XG4gICAgb3BlcmF0aW9ucyA9IFtvcGVyYXRpb25zXSB1bmxlc3MgXy5pc0FycmF5KG9wZXJhdGlvbnMpXG5cbiAgICBmb3Igb3BlcmF0aW9uIGluIG9wZXJhdGlvbnNcbiAgICAgICMgTW90aW9ucyBpbiB2aXN1YWwgbW9kZSBwZXJmb3JtIHRoZWlyIHNlbGVjdGlvbnMuXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgKG9wZXJhdGlvbiBpbnN0YW5jZW9mIE1vdGlvbnMuTW90aW9uIG9yIG9wZXJhdGlvbiBpbnN0YW5jZW9mIFRleHRPYmplY3RzLlRleHRPYmplY3QpXG4gICAgICAgIG9wZXJhdGlvbi5leGVjdXRlID0gb3BlcmF0aW9uLnNlbGVjdFxuXG4gICAgICAjIGlmIHdlIGhhdmUgc3RhcnRlZCBhbiBvcGVyYXRpb24gdGhhdCByZXNwb25kcyB0byBjYW5Db21wb3NlV2l0aCBjaGVjayBpZiBpdCBjYW4gY29tcG9zZVxuICAgICAgIyB3aXRoIHRoZSBvcGVyYXRpb24gd2UncmUgZ29pbmcgdG8gcHVzaCBvbnRvIHRoZSBzdGFja1xuICAgICAgaWYgKHRvcE9wID0gQHRvcE9wZXJhdGlvbigpKT8gYW5kIHRvcE9wLmNhbkNvbXBvc2VXaXRoPyBhbmQgbm90IHRvcE9wLmNhbkNvbXBvc2VXaXRoKG9wZXJhdGlvbilcbiAgICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICAgIEBlbWl0dGVyLmVtaXQoJ2ZhaWxlZC10by1jb21wb3NlJylcbiAgICAgICAgYnJlYWtcblxuICAgICAgQG9wU3RhY2sucHVzaChvcGVyYXRpb24pXG5cbiAgICAgICMgSWYgd2UndmUgcmVjZWl2ZWQgYW4gb3BlcmF0b3IgaW4gdmlzdWFsIG1vZGUsIG1hcmsgdGhlIGN1cnJlbnRcbiAgICAgICMgc2VsZWN0aW9uIGFzIHRoZSBtb3Rpb24gdG8gb3BlcmF0ZSBvbi5cbiAgICAgIGlmIEBtb2RlIGlzICd2aXN1YWwnIGFuZCBvcGVyYXRpb24gaW5zdGFuY2VvZiBPcGVyYXRvcnMuT3BlcmF0b3JcbiAgICAgICAgQG9wU3RhY2sucHVzaChuZXcgTW90aW9ucy5DdXJyZW50U2VsZWN0aW9uKEBlZGl0b3IsIHRoaXMpKVxuXG4gICAgICBAcHJvY2Vzc09wU3RhY2soKVxuXG4gIG9uRGlkRmFpbFRvQ29tcG9zZTogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdmYWlsZWQtdG8tY29tcG9zZScsIGZuKVxuXG4gIG9uRGlkRGVzdHJveTogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGZuKVxuXG4gICMgUHJpdmF0ZTogUmVtb3ZlcyBhbGwgb3BlcmF0aW9ucyBmcm9tIHRoZSBzdGFjay5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgY2xlYXJPcFN0YWNrOiAtPlxuICAgIEBvcFN0YWNrID0gW11cblxuICB1bmRvOiAtPlxuICAgIEBlZGl0b3IudW5kbygpXG4gICAgQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG5cbiAgIyBQcml2YXRlOiBQcm9jZXNzZXMgdGhlIGNvbW1hbmQgaWYgdGhlIGxhc3Qgb3BlcmF0aW9uIGlzIGNvbXBsZXRlLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBwcm9jZXNzT3BTdGFjazogLT5cbiAgICB1bmxlc3MgQG9wU3RhY2subGVuZ3RoID4gMFxuICAgICAgcmV0dXJuXG5cbiAgICB1bmxlc3MgQHRvcE9wZXJhdGlvbigpLmlzQ29tcGxldGUoKVxuICAgICAgaWYgQG1vZGUgaXMgJ25vcm1hbCcgYW5kIEB0b3BPcGVyYXRpb24oKSBpbnN0YW5jZW9mIE9wZXJhdG9ycy5PcGVyYXRvclxuICAgICAgICBAYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlKClcbiAgICAgIHJldHVyblxuXG4gICAgcG9wcGVkT3BlcmF0aW9uID0gQG9wU3RhY2sucG9wKClcbiAgICBpZiBAb3BTdGFjay5sZW5ndGhcbiAgICAgIHRyeVxuICAgICAgICBAdG9wT3BlcmF0aW9uKCkuY29tcG9zZShwb3BwZWRPcGVyYXRpb24pXG4gICAgICAgIEBwcm9jZXNzT3BTdGFjaygpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgT3BlcmF0b3JzLk9wZXJhdG9yRXJyb3IpIG9yIChlIGluc3RhbmNlb2YgTW90aW9ucy5Nb3Rpb25FcnJvcilcbiAgICAgICAgICBAcmVzZXROb3JtYWxNb2RlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRocm93IGVcbiAgICBlbHNlXG4gICAgICBAaGlzdG9yeS51bnNoaWZ0KHBvcHBlZE9wZXJhdGlvbikgaWYgcG9wcGVkT3BlcmF0aW9uLmlzUmVjb3JkYWJsZSgpXG4gICAgICBwb3BwZWRPcGVyYXRpb24uZXhlY3V0ZSgpXG5cbiAgIyBQcml2YXRlOiBGZXRjaGVzIHRoZSBsYXN0IG9wZXJhdGlvbi5cbiAgI1xuICAjIFJldHVybnMgdGhlIGxhc3Qgb3BlcmF0aW9uLlxuICB0b3BPcGVyYXRpb246IC0+XG4gICAgXy5sYXN0IEBvcFN0YWNrXG5cbiAgIyBQcml2YXRlOiBGZXRjaGVzIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSByZWdpc3RlciB0byBmZXRjaC5cbiAgI1xuICAjIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiByZWdpc3RlciBvciB1bmRlZmluZWQgaWYgaXQgaGFzbid0XG4gICMgYmVlbiBzZXQuXG4gIGdldFJlZ2lzdGVyOiAobmFtZSkgLT5cbiAgICBpZiBuYW1lIGlzICdcIidcbiAgICAgIG5hbWUgPSBzZXR0aW5ncy5kZWZhdWx0UmVnaXN0ZXIoKVxuICAgIGlmIG5hbWUgaW4gWycqJywgJysnXVxuICAgICAgdGV4dCA9IGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuICAgICAgdHlwZSA9IFV0aWxzLmNvcHlUeXBlKHRleHQpXG4gICAgICB7dGV4dCwgdHlwZX1cbiAgICBlbHNlIGlmIG5hbWUgaXMgJyUnXG4gICAgICB0ZXh0ID0gQGVkaXRvci5nZXRVUkkoKVxuICAgICAgdHlwZSA9IFV0aWxzLmNvcHlUeXBlKHRleHQpXG4gICAgICB7dGV4dCwgdHlwZX1cbiAgICBlbHNlIGlmIG5hbWUgaXMgXCJfXCIgIyBCbGFja2hvbGUgYWx3YXlzIHJldHVybnMgbm90aGluZ1xuICAgICAgdGV4dCA9ICcnXG4gICAgICB0eXBlID0gVXRpbHMuY29weVR5cGUodGV4dClcbiAgICAgIHt0ZXh0LCB0eXBlfVxuICAgIGVsc2VcbiAgICAgIEBnbG9iYWxWaW1TdGF0ZS5yZWdpc3RlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXVxuXG4gICMgUHJpdmF0ZTogRmV0Y2hlcyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBtYXJrLlxuICAjXG4gICMgbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBtYXJrIHRvIGZldGNoLlxuICAjXG4gICMgUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIG1hcmsgb3IgdW5kZWZpbmVkIGlmIGl0IGhhc24ndFxuICAjIGJlZW4gc2V0LlxuICBnZXRNYXJrOiAobmFtZSkgLT5cbiAgICBpZiBAbWFya3NbbmFtZV1cbiAgICAgIEBtYXJrc1tuYW1lXS5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgZWxzZVxuICAgICAgdW5kZWZpbmVkXG5cbiAgIyBQcml2YXRlOiBTZXRzIHRoZSB2YWx1ZSBvZiBhIGdpdmVuIHJlZ2lzdGVyLlxuICAjXG4gICMgbmFtZSAgLSBUaGUgbmFtZSBvZiB0aGUgcmVnaXN0ZXIgdG8gZmV0Y2guXG4gICMgdmFsdWUgLSBUaGUgdmFsdWUgdG8gc2V0IHRoZSByZWdpc3RlciB0by5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgc2V0UmVnaXN0ZXI6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICBpZiBuYW1lIGlzICdcIidcbiAgICAgIG5hbWUgPSBzZXR0aW5ncy5kZWZhdWx0UmVnaXN0ZXIoKVxuICAgIGlmIG5hbWUgaW4gWycqJywgJysnXVxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodmFsdWUudGV4dClcbiAgICBlbHNlIGlmIG5hbWUgaXMgJ18nXG4gICAgICAjIEJsYWNraG9sZSByZWdpc3Rlciwgbm90aGluZyB0byBkb1xuICAgIGVsc2UgaWYgL15bQS1aXSQvLnRlc3QobmFtZSlcbiAgICAgIEBhcHBlbmRSZWdpc3RlcihuYW1lLnRvTG93ZXJDYXNlKCksIHZhbHVlKVxuICAgIGVsc2VcbiAgICAgIEBnbG9iYWxWaW1TdGF0ZS5yZWdpc3RlcnNbbmFtZV0gPSB2YWx1ZVxuXG5cbiAgIyBQcml2YXRlOiBhcHBlbmQgYSB2YWx1ZSBpbnRvIGEgZ2l2ZW4gcmVnaXN0ZXJcbiAgIyBsaWtlIHNldFJlZ2lzdGVyLCBidXQgYXBwZW5kcyB0aGUgdmFsdWVcbiAgYXBwZW5kUmVnaXN0ZXI6IChuYW1lLCB2YWx1ZSkgLT5cbiAgICByZWdpc3RlciA9IEBnbG9iYWxWaW1TdGF0ZS5yZWdpc3RlcnNbbmFtZV0gPz1cbiAgICAgIHR5cGU6ICdjaGFyYWN0ZXInXG4gICAgICB0ZXh0OiBcIlwiXG4gICAgaWYgcmVnaXN0ZXIudHlwZSBpcyAnbGluZXdpc2UnIGFuZCB2YWx1ZS50eXBlIGlzbnQgJ2xpbmV3aXNlJ1xuICAgICAgcmVnaXN0ZXIudGV4dCArPSB2YWx1ZS50ZXh0ICsgJ1xcbidcbiAgICBlbHNlIGlmIHJlZ2lzdGVyLnR5cGUgaXNudCAnbGluZXdpc2UnIGFuZCB2YWx1ZS50eXBlIGlzICdsaW5ld2lzZSdcbiAgICAgIHJlZ2lzdGVyLnRleHQgKz0gJ1xcbicgKyB2YWx1ZS50ZXh0XG4gICAgICByZWdpc3Rlci50eXBlID0gJ2xpbmV3aXNlJ1xuICAgIGVsc2VcbiAgICAgIHJlZ2lzdGVyLnRleHQgKz0gdmFsdWUudGV4dFxuXG4gICMgUHJpdmF0ZTogU2V0cyB0aGUgdmFsdWUgb2YgYSBnaXZlbiBtYXJrLlxuICAjXG4gICMgbmFtZSAgLSBUaGUgbmFtZSBvZiB0aGUgbWFyayB0byBmZXRjaC5cbiAgIyBwb3Mge1BvaW50fSAtIFRoZSB2YWx1ZSB0byBzZXQgdGhlIG1hcmsgdG8uXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIHNldE1hcms6IChuYW1lLCBwb3MpIC0+XG4gICAgIyBjaGVjayB0byBtYWtlIHN1cmUgbmFtZSBpcyBpbiBbYS16XSBvciBpcyBgXG4gICAgaWYgKGNoYXJDb2RlID0gbmFtZS5jaGFyQ29kZUF0KDApKSA+PSA5NiBhbmQgY2hhckNvZGUgPD0gMTIyXG4gICAgICBtYXJrZXIgPSBAZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShuZXcgUmFuZ2UocG9zLCBwb3MpLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgcGVyc2lzdGVudDogZmFsc2V9KVxuICAgICAgQG1hcmtzW25hbWVdID0gbWFya2VyXG5cbiAgIyBQdWJsaWM6IEFwcGVuZCBhIHNlYXJjaCB0byB0aGUgc2VhcmNoIGhpc3RvcnkuXG4gICNcbiAgIyBNb3Rpb25zLlNlYXJjaCAtIFRoZSBjb25maXJtZWQgc2VhcmNoIG1vdGlvbiB0byBhcHBlbmRcbiAgI1xuICAjIFJldHVybnMgbm90aGluZ1xuICBwdXNoU2VhcmNoSGlzdG9yeTogKHNlYXJjaCkgLT5cbiAgICBAZ2xvYmFsVmltU3RhdGUuc2VhcmNoSGlzdG9yeS51bnNoaWZ0IHNlYXJjaFxuXG4gICMgUHVibGljOiBHZXQgdGhlIHNlYXJjaCBoaXN0b3J5IGl0ZW0gYXQgdGhlIGdpdmVuIGluZGV4LlxuICAjXG4gICMgaW5kZXggLSB0aGUgaW5kZXggb2YgdGhlIHNlYXJjaCBoaXN0b3J5IGl0ZW1cbiAgI1xuICAjIFJldHVybnMgYSBzZWFyY2ggbW90aW9uXG4gIGdldFNlYXJjaEhpc3RvcnlJdGVtOiAoaW5kZXggPSAwKSAtPlxuICAgIEBnbG9iYWxWaW1TdGF0ZS5zZWFyY2hIaXN0b3J5W2luZGV4XVxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIE1vZGUgU3dpdGNoaW5nXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG4gICMgUHJpdmF0ZTogVXNlZCB0byBlbmFibGUgbm9ybWFsIG1vZGUuXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGFjdGl2YXRlTm9ybWFsTW9kZTogLT5cbiAgICBAZGVhY3RpdmF0ZUluc2VydE1vZGUoKVxuICAgIEBkZWFjdGl2YXRlVmlzdWFsTW9kZSgpXG5cbiAgICBAbW9kZSA9ICdub3JtYWwnXG4gICAgQHN1Ym1vZGUgPSBudWxsXG5cbiAgICBAY2hhbmdlTW9kZUNsYXNzKCdub3JtYWwtbW9kZScpXG5cbiAgICBAY2xlYXJPcFN0YWNrKClcbiAgICBzZWxlY3Rpb24uY2xlYXIoYXV0b3Njcm9sbDogZmFsc2UpIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBAZW5zdXJlQ3Vyc29yc1dpdGhpbkxpbmUoKVxuXG4gICAgQHVwZGF0ZVN0YXR1c0JhcigpXG5cbiAgIyBUT0RPOiByZW1vdmUgdGhpcyBtZXRob2QgYW5kIGJ1bXAgdGhlIGB2aW0tbW9kZWAgc2VydmljZSB2ZXJzaW9uIG51bWJlci5cbiAgYWN0aXZhdGVDb21tYW5kTW9kZTogLT5cbiAgICBHcmltLmRlcHJlY2F0ZShcIlVzZSA6OmFjdGl2YXRlTm9ybWFsTW9kZSBpbnN0ZWFkXCIpXG4gICAgQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG5cbiAgIyBQcml2YXRlOiBVc2VkIHRvIGVuYWJsZSBpbnNlcnQgbW9kZS5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgYWN0aXZhdGVJbnNlcnRNb2RlOiAoc3VidHlwZSA9IG51bGwpIC0+XG4gICAgQG1vZGUgPSAnaW5zZXJ0J1xuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5zZXRJbnB1dEVuYWJsZWQodHJ1ZSlcbiAgICBAc2V0SW5zZXJ0aW9uQ2hlY2twb2ludCgpXG4gICAgQHN1Ym1vZGUgPSBzdWJ0eXBlXG4gICAgQGNoYW5nZU1vZGVDbGFzcygnaW5zZXJ0LW1vZGUnKVxuICAgIEB1cGRhdGVTdGF0dXNCYXIoKVxuXG4gIGFjdGl2YXRlUmVwbGFjZU1vZGU6IC0+XG4gICAgQGFjdGl2YXRlSW5zZXJ0TW9kZSgncmVwbGFjZScpXG4gICAgQHJlcGxhY2VNb2RlQ291bnRlciA9IDBcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXBsYWNlLW1vZGUnKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAcmVwbGFjZU1vZGVMaXN0ZW5lciA9IEBlZGl0b3Iub25XaWxsSW5zZXJ0VGV4dCBAcmVwbGFjZU1vZGVJbnNlcnRIYW5kbGVyXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEByZXBsYWNlTW9kZVVuZG9MaXN0ZW5lciA9IEBlZGl0b3Iub25EaWRJbnNlcnRUZXh0IEByZXBsYWNlTW9kZVVuZG9IYW5kbGVyXG5cbiAgcmVwbGFjZU1vZGVJbnNlcnRIYW5kbGVyOiAoZXZlbnQpID0+XG4gICAgY2hhcnMgPSBldmVudC50ZXh0Py5zcGxpdCgnJykgb3IgW11cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBmb3IgY2hhciBpbiBjaGFyc1xuICAgICAgY29udGludWUgaWYgY2hhciBpcyAnXFxuJ1xuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBzZWxlY3Rpb25zXG4gICAgICAgIHNlbGVjdGlvbi5kZWxldGUoKSB1bmxlc3Mgc2VsZWN0aW9uLmN1cnNvci5pc0F0RW5kT2ZMaW5lKClcbiAgICByZXR1cm5cblxuICByZXBsYWNlTW9kZVVuZG9IYW5kbGVyOiAoZXZlbnQpID0+XG4gICAgQHJlcGxhY2VNb2RlQ291bnRlcisrXG5cbiAgcmVwbGFjZU1vZGVVbmRvOiAtPlxuICAgIGlmIEByZXBsYWNlTW9kZUNvdW50ZXIgPiAwXG4gICAgICBAZWRpdG9yLnVuZG8oKVxuICAgICAgQGVkaXRvci51bmRvKClcbiAgICAgIEBlZGl0b3IubW92ZUxlZnQoKVxuICAgICAgQHJlcGxhY2VNb2RlQ291bnRlci0tXG5cbiAgc2V0SW5zZXJ0aW9uQ2hlY2twb2ludDogLT5cbiAgICBAaW5zZXJ0aW9uQ2hlY2twb2ludCA9IEBlZGl0b3IuY3JlYXRlQ2hlY2twb2ludCgpIHVubGVzcyBAaW5zZXJ0aW9uQ2hlY2twb2ludD9cblxuICBkZWFjdGl2YXRlSW5zZXJ0TW9kZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlIGluIFtudWxsLCAnaW5zZXJ0J11cbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQuc2V0SW5wdXRFbmFibGVkKGZhbHNlKVxuICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3JlcGxhY2UtbW9kZScpXG4gICAgQGVkaXRvci5ncm91cENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoQGluc2VydGlvbkNoZWNrcG9pbnQpXG4gICAgY2hhbmdlcyA9IEBlZGl0b3IuYnVmZmVyLmdldENoYW5nZXNTaW5jZUNoZWNrcG9pbnQoQGluc2VydGlvbkNoZWNrcG9pbnQpXG4gICAgaXRlbSA9IEBpbnB1dE9wZXJhdG9yKEBoaXN0b3J5WzBdKVxuICAgIEBpbnNlcnRpb25DaGVja3BvaW50ID0gbnVsbFxuICAgIGlmIGl0ZW0/XG4gICAgICBpdGVtLmNvbmZpcm1DaGFuZ2VzKGNoYW5nZXMpXG4gICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgY3Vyc29yLm1vdmVMZWZ0KCkgdW5sZXNzIGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICBpZiBAcmVwbGFjZU1vZGVMaXN0ZW5lcj9cbiAgICAgIEByZXBsYWNlTW9kZUxpc3RlbmVyLmRpc3Bvc2UoKVxuICAgICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlIEByZXBsYWNlTW9kZUxpc3RlbmVyXG4gICAgICBAcmVwbGFjZU1vZGVMaXN0ZW5lciA9IG51bGxcbiAgICAgIEByZXBsYWNlTW9kZVVuZG9MaXN0ZW5lci5kaXNwb3NlKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAcmVwbGFjZU1vZGVVbmRvTGlzdGVuZXJcbiAgICAgIEByZXBsYWNlTW9kZVVuZG9MaXN0ZW5lciA9IG51bGxcblxuICBkZWFjdGl2YXRlVmlzdWFsTW9kZTogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBtb2RlIGlzICd2aXN1YWwnXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc2VsZWN0aW9uLmN1cnNvci5tb3ZlTGVmdCgpIHVubGVzcyAoc2VsZWN0aW9uLmlzRW1wdHkoKSBvciBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpKVxuXG4gICMgUHJpdmF0ZTogR2V0IHRoZSBpbnB1dCBvcGVyYXRvciB0aGF0IG5lZWRzIHRvIGJlIHRvbGQgYWJvdXQgYWJvdXQgdGhlXG4gICMgdHlwZWQgdW5kbyB0cmFuc2FjdGlvbiBpbiBhIHJlY2VudGx5IGNvbXBsZXRlZCBvcGVyYXRpb24sIGlmIHRoZXJlXG4gICMgaXMgb25lLlxuICBpbnB1dE9wZXJhdG9yOiAoaXRlbSkgLT5cbiAgICByZXR1cm4gaXRlbSB1bmxlc3MgaXRlbT9cbiAgICByZXR1cm4gaXRlbSBpZiBpdGVtLmlucHV0T3BlcmF0b3I/KClcbiAgICByZXR1cm4gaXRlbS5jb21wb3NlZE9iamVjdCBpZiBpdGVtLmNvbXBvc2VkT2JqZWN0Py5pbnB1dE9wZXJhdG9yPygpXG5cbiAgIyBQcml2YXRlOiBVc2VkIHRvIGVuYWJsZSB2aXN1YWwgbW9kZS5cbiAgI1xuICAjIHR5cGUgLSBPbmUgb2YgJ2NoYXJhY3Rlcndpc2UnLCAnbGluZXdpc2UnIG9yICdibG9ja3dpc2UnXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGFjdGl2YXRlVmlzdWFsTW9kZTogKHR5cGUpIC0+XG4gICAgIyBBbHJlYWR5IGluICd2aXN1YWwnLCB0aGlzIG1lYW5zIG9uZSBvZiBmb2xsb3dpbmcgY29tbWFuZCBpc1xuICAgICMgZXhlY3V0ZWQgd2l0aGluIGB2aW0tbW9kZS52aXN1YWwtbW9kZWBcbiAgICAjICAqIGFjdGl2YXRlLWJsb2Nrd2lzZS12aXN1YWwtbW9kZVxuICAgICMgICogYWN0aXZhdGUtY2hhcmFjdGVyd2lzZS12aXN1YWwtbW9kZVxuICAgICMgICogYWN0aXZhdGUtbGluZXdpc2UtdmlzdWFsLW1vZGVcbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQHN1Ym1vZGUgaXMgdHlwZVxuICAgICAgICBAYWN0aXZhdGVOb3JtYWxNb2RlKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIEBzdWJtb2RlID0gdHlwZVxuICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgIyBLZWVwIG9yaWdpbmFsIHJhbmdlIGFzIG1hcmtlcidzIHByb3BlcnR5IHRvIGdldCBiYWNrXG4gICAgICAgICAgIyB0byBjaGFyYWN0ZXJ3aXNlLlxuICAgICAgICAgICMgU2luY2Ugc2VsZWN0TGluZSBsb3N0IG9yaWdpbmFsIGN1cnNvciBjb2x1bW4uXG4gICAgICAgICAgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICAgc2VsZWN0aW9uLm1hcmtlci5zZXRQcm9wZXJ0aWVzKHtvcmlnaW5hbFJhbmdlfSlcbiAgICAgICAgICBbc3RhcnQsIGVuZF0gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgICAgICAgIHNlbGVjdGlvbi5zZWxlY3RMaW5lKHJvdykgZm9yIHJvdyBpbiBbc3RhcnQuLmVuZF1cblxuICAgICAgZWxzZSBpZiBAc3VibW9kZSBpbiBbJ2NoYXJhY3Rlcndpc2UnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgIyBDdXJyZW50bHksICdibG9ja3dpc2UnIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gICAgICAgICMgU28gdHJlYXQgaXQgYXMgY2hhcmFjdGVyd2lzZS5cbiAgICAgICAgIyBSZWNvdmVyIG9yaWdpbmFsIHJhbmdlLlxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAge29yaWdpbmFsUmFuZ2V9ID0gc2VsZWN0aW9uLm1hcmtlci5nZXRQcm9wZXJ0aWVzKClcbiAgICAgICAgICBpZiBvcmlnaW5hbFJhbmdlXG4gICAgICAgICAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUm93UmFuZ2UoKVxuICAgICAgICAgICAgb3JpZ2luYWxSYW5nZS5zdGFydC5yb3cgPSBzdGFydFJvd1xuICAgICAgICAgICAgb3JpZ2luYWxSYW5nZS5lbmQucm93ICAgPSBlbmRSb3dcbiAgICAgICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShvcmlnaW5hbFJhbmdlKVxuICAgIGVsc2VcbiAgICAgIEBkZWFjdGl2YXRlSW5zZXJ0TW9kZSgpXG4gICAgICBAbW9kZSA9ICd2aXN1YWwnXG4gICAgICBAc3VibW9kZSA9IHR5cGVcbiAgICAgIEBjaGFuZ2VNb2RlQ2xhc3MoJ3Zpc3VhbC1tb2RlJylcblxuICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2xpbmV3aXNlJ1xuICAgICAgICBAZWRpdG9yLnNlbGVjdExpbmVzQ29udGFpbmluZ0N1cnNvcnMoKVxuICAgICAgZWxzZSBpZiBAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpIGlzICcnXG4gICAgICAgIEBlZGl0b3Iuc2VsZWN0UmlnaHQoKVxuXG4gICAgQHVwZGF0ZVN0YXR1c0JhcigpXG5cbiAgIyBQcml2YXRlOiBVc2VkIHRvIHJlLWVuYWJsZSB2aXN1YWwgbW9kZVxuICByZXNldFZpc3VhbE1vZGU6IC0+XG4gICAgQGFjdGl2YXRlVmlzdWFsTW9kZShAc3VibW9kZSlcblxuICAjIFByaXZhdGU6IFVzZWQgdG8gZW5hYmxlIG9wZXJhdG9yLXBlbmRpbmcgbW9kZS5cbiAgYWN0aXZhdGVPcGVyYXRvclBlbmRpbmdNb2RlOiAtPlxuICAgIEBkZWFjdGl2YXRlSW5zZXJ0TW9kZSgpXG4gICAgQG1vZGUgPSAnb3BlcmF0b3ItcGVuZGluZydcbiAgICBAc3VibW9kZSA9IG51bGxcbiAgICBAY2hhbmdlTW9kZUNsYXNzKCdvcGVyYXRvci1wZW5kaW5nLW1vZGUnKVxuXG4gICAgQHVwZGF0ZVN0YXR1c0JhcigpXG5cbiAgY2hhbmdlTW9kZUNsYXNzOiAodGFyZ2V0TW9kZSkgLT5cbiAgICBmb3IgbW9kZSBpbiBbJ25vcm1hbC1tb2RlJywgJ2luc2VydC1tb2RlJywgJ3Zpc3VhbC1tb2RlJywgJ29wZXJhdG9yLXBlbmRpbmctbW9kZSddXG4gICAgICBpZiBtb2RlIGlzIHRhcmdldE1vZGVcbiAgICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZChtb2RlKVxuICAgICAgZWxzZVxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKG1vZGUpXG5cbiAgIyBQcml2YXRlOiBSZXNldHMgdGhlIG5vcm1hbCBtb2RlIGJhY2sgdG8gaXQncyBpbml0aWFsIHN0YXRlLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICByZXNldE5vcm1hbE1vZGU6IC0+XG4gICAgQGNsZWFyT3BTdGFjaygpXG4gICAgQGVkaXRvci5jbGVhclNlbGVjdGlvbnMoKVxuICAgIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuXG4gICMgUHJpdmF0ZTogQSBnZW5lcmljIHdheSB0byBjcmVhdGUgYSBSZWdpc3RlciBwcmVmaXggYmFzZWQgb24gdGhlIGV2ZW50LlxuICAjXG4gICMgZSAtIFRoZSBldmVudCB0aGF0IHRyaWdnZXJlZCB0aGUgUmVnaXN0ZXIgcHJlZml4LlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICByZWdpc3RlclByZWZpeDogKGUpIC0+XG4gICAgbmV3IFByZWZpeGVzLlJlZ2lzdGVyKEByZWdpc3Rlck5hbWUoZSkpXG5cbiAgIyBQcml2YXRlOiBHZXRzIGEgcmVnaXN0ZXIgbmFtZSBmcm9tIGEga2V5Ym9hcmQgZXZlbnRcbiAgI1xuICAjIGUgLSBUaGUgZXZlbnRcbiAgI1xuICAjIFJldHVybnMgdGhlIG5hbWUgb2YgdGhlIHJlZ2lzdGVyXG4gIHJlZ2lzdGVyTmFtZTogKGUpIC0+XG4gICAga2V5Ym9hcmRFdmVudCA9IGUub3JpZ2luYWxFdmVudD8ub3JpZ2luYWxFdmVudCA/IGUub3JpZ2luYWxFdmVudFxuICAgIG5hbWUgPSBhdG9tLmtleW1hcHMua2V5c3Ryb2tlRm9yS2V5Ym9hcmRFdmVudChrZXlib2FyZEV2ZW50KVxuICAgIGlmIG5hbWUubGFzdEluZGV4T2YoJ3NoaWZ0LScsIDApIGlzIDBcbiAgICAgIG5hbWUgPSBuYW1lLnNsaWNlKDYpXG4gICAgbmFtZVxuXG4gICMgUHJpdmF0ZTogQSBnZW5lcmljIHdheSB0byBjcmVhdGUgYSBOdW1iZXIgcHJlZml4IGJhc2VkIG9uIHRoZSBldmVudC5cbiAgI1xuICAjIGUgLSBUaGUgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIE51bWJlciBwcmVmaXguXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIHJlcGVhdFByZWZpeDogKGUpIC0+XG4gICAga2V5Ym9hcmRFdmVudCA9IGUub3JpZ2luYWxFdmVudD8ub3JpZ2luYWxFdmVudCA/IGUub3JpZ2luYWxFdmVudFxuICAgIG51bSA9IHBhcnNlSW50KGF0b20ua2V5bWFwcy5rZXlzdHJva2VGb3JLZXlib2FyZEV2ZW50KGtleWJvYXJkRXZlbnQpKVxuICAgIGlmIEB0b3BPcGVyYXRpb24oKSBpbnN0YW5jZW9mIFByZWZpeGVzLlJlcGVhdFxuICAgICAgQHRvcE9wZXJhdGlvbigpLmFkZERpZ2l0KG51bSlcbiAgICBlbHNlXG4gICAgICBpZiBudW0gaXMgMFxuICAgICAgICBlLmFib3J0S2V5QmluZGluZygpXG4gICAgICBlbHNlXG4gICAgICAgIEBwdXNoT3BlcmF0aW9ucyhuZXcgUHJlZml4ZXMuUmVwZWF0KG51bSkpXG5cbiAgcmV2ZXJzZVNlbGVjdGlvbnM6IC0+XG4gICAgcmV2ZXJzZWQgPSBub3QgQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkuaXNSZXZlcnNlZCgpXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLCB7cmV2ZXJzZWR9KVxuXG4gICMgUHJpdmF0ZTogRmlndXJlIG91dCB3aGV0aGVyIG9yIG5vdCB3ZSBhcmUgaW4gYSByZXBlYXQgc2VxdWVuY2Ugb3Igd2UganVzdFxuICAjIHdhbnQgdG8gbW92ZSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLiBJZiB3ZSBhcmUgd2l0aGluIGEgcmVwZWF0XG4gICMgc2VxdWVuY2UsIHdlIHBhc3MgY29udHJvbCBvdmVyIHRvIEByZXBlYXRQcmVmaXguXG4gICNcbiAgIyBlIC0gVGhlIHRyaWdnZXJlZCBldmVudC5cbiAgI1xuICAjIFJldHVybnMgbmV3IG1vdGlvbiBvciBub3RoaW5nLlxuICBtb3ZlT3JSZXBlYXQ6IChlKSAtPlxuICAgIGlmIEB0b3BPcGVyYXRpb24oKSBpbnN0YW5jZW9mIFByZWZpeGVzLlJlcGVhdFxuICAgICAgQHJlcGVhdFByZWZpeChlKVxuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIG5ldyBNb3Rpb25zLk1vdmVUb0JlZ2lubmluZ09mTGluZShAZWRpdG9yLCB0aGlzKVxuXG4gICMgUHJpdmF0ZTogQSBnZW5lcmljIHdheSB0byBoYW5kbGUgT3BlcmF0b3JzIHRoYXQgY2FuIGJlIHJlcGVhdGVkIGZvclxuICAjIHRoZWlyIGxpbmV3aXNlIGZvcm0uXG4gICNcbiAgIyBjb25zdHJ1Y3RvciAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgb3BlcmF0b3IuXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGxpbmV3aXNlQWxpYXNlZE9wZXJhdG9yOiAoY29uc3RydWN0b3IpIC0+XG4gICAgaWYgQGlzT3BlcmF0b3JQZW5kaW5nKGNvbnN0cnVjdG9yKVxuICAgICAgbmV3IE1vdGlvbnMuTW92ZVRvUmVsYXRpdmVMaW5lKEBlZGl0b3IsIHRoaXMpXG4gICAgZWxzZVxuICAgICAgbmV3IGNvbnN0cnVjdG9yKEBlZGl0b3IsIHRoaXMpXG5cbiAgIyBQcml2YXRlOiBDaGVjayBpZiB0aGVyZSBpcyBhIHBlbmRpbmcgb3BlcmF0aW9uIG9mIGEgY2VydGFpbiB0eXBlLCBvclxuICAjIGlmIHRoZXJlIGlzIGFueSBwZW5kaW5nIG9wZXJhdGlvbiwgaWYgbm8gdHlwZSBnaXZlbi5cbiAgI1xuICAjIGNvbnN0cnVjdG9yIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBvYmplY3QgdHlwZSB5b3UncmUgbG9va2luZyBmb3IuXG4gICNcbiAgaXNPcGVyYXRvclBlbmRpbmc6IChjb25zdHJ1Y3RvcikgLT5cbiAgICBpZiBjb25zdHJ1Y3Rvcj9cbiAgICAgIGZvciBvcCBpbiBAb3BTdGFja1xuICAgICAgICByZXR1cm4gb3AgaWYgb3AgaW5zdGFuY2VvZiBjb25zdHJ1Y3RvclxuICAgICAgZmFsc2VcbiAgICBlbHNlXG4gICAgICBAb3BTdGFjay5sZW5ndGggPiAwXG5cbiAgdXBkYXRlU3RhdHVzQmFyOiAtPlxuICAgIEBzdGF0dXNCYXJNYW5hZ2VyLnVwZGF0ZShAbW9kZSwgQHN1Ym1vZGUpXG5cbiAgIyBQcml2YXRlOiBpbnNlcnQgdGhlIGNvbnRlbnRzIG9mIHRoZSByZWdpc3RlciBpbiB0aGUgZWRpdG9yXG4gICNcbiAgIyBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHJlZ2lzdGVyIHRvIGluc2VydFxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBpbnNlcnRSZWdpc3RlcjogKG5hbWUpIC0+XG4gICAgdGV4dCA9IEBnZXRSZWdpc3RlcihuYW1lKT8udGV4dFxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dCh0ZXh0KSBpZiB0ZXh0P1xuXG4gICMgUHJpdmF0ZTogZW5zdXJlIHRoZSBtb2RlIGZvbGxvd3MgdGhlIHN0YXRlIG9mIHNlbGVjdGlvbnNcbiAgY2hlY2tTZWxlY3Rpb25zOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvcj9cbiAgICBpZiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5ldmVyeSgoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uaXNFbXB0eSgpKVxuICAgICAgQGVuc3VyZUN1cnNvcnNXaXRoaW5MaW5lKCkgaWYgQG1vZGUgaXMgJ25vcm1hbCdcbiAgICAgIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKSBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgIGVsc2VcbiAgICAgIEBhY3RpdmF0ZVZpc3VhbE1vZGUoJ2NoYXJhY3Rlcndpc2UnKSBpZiBAbW9kZSBpcyAnbm9ybWFsJ1xuXG4gICMgUHJpdmF0ZTogZW5zdXJlIHRoZSBjdXJzb3Igc3RheXMgd2l0aGluIHRoZSBsaW5lIGFzIGFwcHJvcHJpYXRlXG4gIGVuc3VyZUN1cnNvcnNXaXRoaW5MaW5lOiA9PlxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIHtnb2FsQ29sdW1ufSA9IGN1cnNvclxuICAgICAgaWYgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBhbmQgbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKClcbiAgICAgICAgY3Vyc29yLm1vdmVMZWZ0KClcbiAgICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtblxuXG4gICAgQGVkaXRvci5tZXJnZUN1cnNvcnMoKVxuIl19
