(function() {
  var Point, TextData, dispatch, getView, getVimState, ref, setEditorWidthInCharacters, settings;

  Point = require('atom').Point;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  setEditorWidthInCharacters = function(editor, widthInCharacters) {
    var component;
    editor.setDefaultCharWidth(1);
    component = editor.component;
    component.element.style.width = component.getGutterContainerWidth() + widthInCharacters * component.measurements.baseCharacterWidth + "px";
    return component.getNextUpdatePromise();
  };

  describe("Motion general", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    describe("simple motions", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = new TextData("12345\nabcd\nABCDE\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      describe("the h keybinding", function() {
        describe("as a motion", function() {
          it("moves the cursor left, but not to the previous line", function() {
            ensure('h', {
              cursor: [1, 0]
            });
            return ensure('h', {
              cursor: [1, 0]
            });
          });
          return it("moves the cursor to the previous line if wrapLeftRightMotion is true", function() {
            settings.set('wrapLeftRightMotion', true);
            return ensure('h h', {
              cursor: [0, 4]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects the character to the left", function() {
            return ensure('y h', {
              cursor: [1, 0],
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
      });
      describe("the j keybinding", function() {
        it("moves the cursor down, but not to the end of the last line", function() {
          ensure('j', {
            cursor: [2, 1]
          });
          return ensure('j', {
            cursor: [2, 1]
          });
        });
        it("moves the cursor to the end of the line, not past it", function() {
          set({
            cursor: [0, 4]
          });
          return ensure('j', {
            cursor: [1, 3]
          });
        });
        it("remembers the column it was in after moving to shorter line", function() {
          set({
            cursor: [0, 4]
          });
          ensure('j', {
            cursor: [1, 3]
          });
          return ensure('j', {
            cursor: [2, 4]
          });
        });
        it("never go past last newline", function() {
          return ensure('1 0 j', {
            cursor: [2, 1]
          });
        });
        return describe("when visual mode", function() {
          beforeEach(function() {
            return ensure('v', {
              cursor: [1, 2],
              selectedText: 'b'
            });
          });
          it("moves the cursor down", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("doesn't go over after the last line", function() {
            return ensure('j', {
              cursor: [2, 2],
              selectedText: "bcd\nAB"
            });
          });
          it("keep same column(goalColumn) even after across the empty line", function() {
            keystroke('escape');
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [0, 3]
            });
            ensure('v', {
              cursor: [0, 4]
            });
            return ensure('j j', {
              cursor: [2, 4],
              selectedText: "defg\n\nabcd"
            });
          });
          return it("original visual line remains when jk across orignal selection", function() {
            text = new TextData("line0\nline1\nline2\n");
            set({
              text: text.getRaw(),
              cursor: [1, 1]
            });
            ensure('V', {
              selectedText: text.getLines([1])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([1])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([1])
            });
            return ensure('j', {
              selectedText: text.getLines([1, 2])
            });
          });
        });
      });
      describe("move-down-wrap, move-up-wrap", function() {
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'k': 'vim-mode-plus:move-up-wrap',
              'j': 'vim-mode-plus:move-down-wrap'
            }
          });
          return set({
            text: "hello\nhello\nhello\nhello\n"
          });
        });
        describe('move-down-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('j', {
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 j', {
              cursor: [1, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 j', {
              cursor: [3, 1]
            });
          });
        });
        return describe('move-up-wrap', function() {
          beforeEach(function() {
            return set({
              cursor: [0, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('k', {
              cursor: [3, 1]
            });
          });
          it("move down with wrawp", function() {
            return ensure('2 k', {
              cursor: [2, 1]
            });
          });
          return it("move down with wrawp", function() {
            return ensure('4 k', {
              cursor: [0, 1]
            });
          });
        });
      });
      xdescribe("with big count was given", function() {
        var BIG_NUMBER, ensureBigCountMotion;
        BIG_NUMBER = Number.MAX_SAFE_INTEGER;
        ensureBigCountMotion = function(keystrokes, options) {
          var count;
          count = String(BIG_NUMBER).split('').join(' ');
          keystrokes = keystrokes.split('').join(' ');
          return ensure(count + " " + keystrokes, options);
        };
        beforeEach(function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g {': 'vim-mode-plus:move-to-previous-fold-start',
              'g }': 'vim-mode-plus:move-to-next-fold-start',
              ', N': 'vim-mode-plus:move-to-previous-number',
              ', n': 'vim-mode-plus:move-to-next-number'
            }
          });
          return set({
            text: "0000\n1111\n2222\n",
            cursor: [1, 2]
          });
        });
        it("by `j`", function() {
          return ensureBigCountMotion('j', {
            cursor: [2, 2]
          });
        });
        it("by `k`", function() {
          return ensureBigCountMotion('k', {
            cursor: [0, 2]
          });
        });
        it("by `h`", function() {
          return ensureBigCountMotion('h', {
            cursor: [1, 0]
          });
        });
        it("by `l`", function() {
          return ensureBigCountMotion('l', {
            cursor: [1, 3]
          });
        });
        it("by `[`", function() {
          return ensureBigCountMotion('[', {
            cursor: [0, 2]
          });
        });
        it("by `]`", function() {
          return ensureBigCountMotion(']', {
            cursor: [2, 2]
          });
        });
        it("by `w`", function() {
          return ensureBigCountMotion('w', {
            cursor: [2, 3]
          });
        });
        it("by `W`", function() {
          return ensureBigCountMotion('W', {
            cursor: [2, 3]
          });
        });
        it("by `b`", function() {
          return ensureBigCountMotion('b', {
            cursor: [0, 0]
          });
        });
        it("by `B`", function() {
          return ensureBigCountMotion('B', {
            cursor: [0, 0]
          });
        });
        it("by `e`", function() {
          return ensureBigCountMotion('e', {
            cursor: [2, 3]
          });
        });
        it("by `(`", function() {
          return ensureBigCountMotion('(', {
            cursor: [0, 0]
          });
        });
        it("by `)`", function() {
          return ensureBigCountMotion(')', {
            cursor: [2, 3]
          });
        });
        it("by `{`", function() {
          return ensureBigCountMotion('{', {
            cursor: [0, 0]
          });
        });
        it("by `}`", function() {
          return ensureBigCountMotion('}', {
            cursor: [2, 3]
          });
        });
        it("by `-`", function() {
          return ensureBigCountMotion('-', {
            cursor: [0, 0]
          });
        });
        it("by `_`", function() {
          return ensureBigCountMotion('_', {
            cursor: [2, 0]
          });
        });
        it("by `g {`", function() {
          return ensureBigCountMotion('g {', {
            cursor: [1, 2]
          });
        });
        it("by `g }`", function() {
          return ensureBigCountMotion('g }', {
            cursor: [1, 2]
          });
        });
        it("by `, N`", function() {
          return ensureBigCountMotion(', N', {
            cursor: [1, 2]
          });
        });
        return it("by `, n`", function() {
          return ensureBigCountMotion(', n', {
            cursor: [1, 2]
          });
        });
      });
      describe("the k keybinding", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 1]
          });
        });
        it("moves the cursor up", function() {
          return ensure('k', {
            cursor: [1, 1]
          });
        });
        it("moves the cursor up and remember column it was in", function() {
          set({
            cursor: [2, 4]
          });
          ensure('k', {
            cursor: [1, 3]
          });
          return ensure('k', {
            cursor: [0, 4]
          });
        });
        it("moves the cursor up, but not to the beginning of the first line", function() {
          return ensure('1 0 k', {
            cursor: [0, 1]
          });
        });
        return describe("when visual mode", function() {
          return it("keep same column(goalColumn) even after across the empty line", function() {
            set({
              text: "abcdefg\n\nabcdefg",
              cursor: [2, 3]
            });
            ensure('v', {
              cursor: [2, 4],
              selectedText: 'd'
            });
            return ensure('k k', {
              cursor: [0, 3],
              selectedText: "defg\n\nabcd"
            });
          });
        });
      });
      describe("gj gk in softwrap", function() {
        text = [][0];
        beforeEach(function() {
          editor.setSoftWrapped(true);
          editor.setEditorWidthInChars(10);
          editor.setDefaultCharWidth(1);
          text = new TextData("1st line of buffer\n2nd line of buffer, Very long line\n3rd line of buffer\n\n5th line of buffer\n");
          return set({
            text: text.getRaw(),
            cursor: [0, 0]
          });
        });
        describe("selection is not reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            ensure('V', {
              selectedText: text.getLines([0])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('j', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1])
            });
            ensure('k', {
              selectedText: text.getLines([0])
            });
            return ensure('k', {
              selectedText: text.getLines([0])
            });
          });
        });
        return describe("selection is reversed", function() {
          it("screen position and buffer position is different", function() {
            ensure('g j', {
              cursorScreen: [1, 0],
              cursor: [0, 9]
            });
            ensure('g j', {
              cursorScreen: [2, 0],
              cursor: [1, 0]
            });
            ensure('g j', {
              cursorScreen: [3, 0],
              cursor: [1, 9]
            });
            return ensure('g j', {
              cursorScreen: [4, 0],
              cursor: [1, 12]
            });
          });
          return it("jk move selection buffer-line wise", function() {
            set({
              cursor: [4, 0]
            });
            ensure('V', {
              selectedText: text.getLines([4])
            });
            ensure('k', {
              selectedText: text.getLines([3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('k', {
              selectedText: text.getLines([0, 1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([1, 2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([2, 3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([3, 4])
            });
            ensure('j', {
              selectedText: text.getLines([4])
            });
            return ensure('j', {
              selectedText: text.getLines([4])
            });
          });
        });
      });
      describe("the l keybinding", function() {
        beforeEach(function() {
          set({
            textC: "0: aaaa\n1: bbbb\n2: cccc\n\n4:\n"
          });
          return set({
            cursor: [1, 2]
          });
        });
        describe("when wrapLeftRightMotion = false(=default)", function() {
          it("[normal] move to right, count support, but not wrap to next-line", function() {
            set({
              cursor: [0, 0]
            });
            ensure('l', {
              cursor: [0, 1]
            });
            ensure('l', {
              cursor: [0, 2]
            });
            ensure('2 l', {
              cursor: [0, 4]
            });
            ensure('5 l', {
              cursor: [0, 6]
            });
            return ensure('l', {
              cursor: [0, 6]
            });
          });
          it("[normal: at-blank-row] not wrap to next line", function() {
            set({
              cursor: [3, 0]
            });
            return ensure('l', {
              cursor: [3, 0],
              mode: "normal"
            });
          });
          it("[visual: at-last-char] can select newline but not wrap to next-line", function() {
            set({
              cursor: [0, 6]
            });
            ensure("v", {
              selectedText: "a",
              mode: ['visual', 'characterwise'],
              cursor: [0, 7]
            });
            expect(editor.getLastCursor().isAtEndOfLine()).toBe(true);
            ensure("l", {
              selectedText: "a\n",
              mode: ['visual', 'characterwise'],
              cursor: [1, 0]
            });
            return ensure("l", {
              selectedText: "a\n",
              mode: ['visual', 'characterwise'],
              cursor: [1, 0]
            });
          });
          return it("[visual: at-blank-row] can select newline but not wrap to next-line", function() {
            set({
              cursor: [3, 0]
            });
            ensure("v", {
              selectedText: "\n",
              mode: ['visual', 'characterwise'],
              cursor: [4, 0]
            });
            return ensure("l", {
              selectedText: "\n",
              mode: ['visual', 'characterwise'],
              cursor: [4, 0]
            });
          });
        });
        return describe("when wrapLeftRightMotion = true", function() {
          beforeEach(function() {
            return settings.set('wrapLeftRightMotion', true);
          });
          it("[normal: at-last-char] moves the cursor to the next line", function() {
            set({
              cursor: [0, 6]
            });
            return ensure('l', {
              cursor: [1, 0],
              mode: "normal"
            });
          });
          it("[normal: at-blank-row] wrap to next line", function() {
            set({
              cursor: [3, 0]
            });
            return ensure('l', {
              cursor: [4, 0],
              mode: "normal"
            });
          });
          it("[visual: at-last-char] select newline then move to next-line", function() {
            set({
              cursor: [0, 6]
            });
            ensure("v", {
              selectedText: "a",
              mode: ['visual', 'characterwise'],
              cursor: [0, 7]
            });
            expect(editor.getLastCursor().isAtEndOfLine()).toBe(true);
            ensure("l", {
              selectedText: "a\n",
              mode: ['visual', 'characterwise'],
              cursor: [1, 0]
            });
            return ensure("l", {
              selectedText: "a\n1",
              mode: ['visual', 'characterwise'],
              cursor: [1, 1]
            });
          });
          return it("[visual: at-blank-row] move to next-line", function() {
            set({
              cursor: [3, 0]
            });
            ensure("v", {
              selectedText: "\n",
              mode: ['visual', 'characterwise'],
              cursor: [4, 0]
            });
            return ensure("l", {
              selectedText: "\n4",
              mode: ['visual', 'characterwise'],
              cursor: [4, 1]
            });
          });
        });
      });
      return describe("move-(up/down)-to-edge", function() {
        text = null;
        beforeEach(function() {
          text = new TextData("0:  4 67  01234567890123456789\n1:         1234567890123456789\n2:    6 890         0123456789\n3:    6 890         0123456789\n4:   56 890         0123456789\n5:                  0123456789\n6:                  0123456789\n7:  4 67            0123456789\n");
          return set({
            text: text.getRaw(),
            cursor: [4, 3]
          });
        });
        describe("edgeness of first-line and last-line", function() {
          beforeEach(function() {
            return set({
              text_: "____this is line 0\n____this is text of line 1\n____this is text of line 2\n______hello line 3\n______hello line 4",
              cursor: [2, 2]
            });
          });
          describe("when column is leading spaces", function() {
            it("move cursor if it's stoppable", function() {
              ensure('[', {
                cursor: [0, 2]
              });
              return ensure(']', {
                cursor: [4, 2]
              });
            });
            return it("doesn't move cursor if it's NOT stoppable", function() {
              set({
                text_: "__\n____this is text of line 1\n____this is text of line 2\n______hello line 3\n______hello line 4\n__",
                cursor: [2, 2]
              });
              ensure('[', {
                cursor: [2, 2]
              });
              return ensure(']', {
                cursor: [2, 2]
              });
            });
          });
          return describe("when column is trailing spaces", function() {
            return it("doesn't move cursor", function() {
              set({
                cursor: [1, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure(']', {
                cursor: [2, 20]
              });
              ensure('[', {
                cursor: [1, 20]
              });
              return ensure('[', {
                cursor: [1, 20]
              });
            });
          });
        });
        it("move to non-blank-char on both first and last row", function() {
          set({
            cursor: [4, 4]
          });
          ensure('[', {
            cursor: [0, 4]
          });
          return ensure(']', {
            cursor: [7, 4]
          });
        });
        it("move to white space char when both side column is non-blank char", function() {
          set({
            cursor: [4, 5]
          });
          ensure('[', {
            cursor: [0, 5]
          });
          ensure(']', {
            cursor: [4, 5]
          });
          return ensure(']', {
            cursor: [7, 5]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-1", function() {
          set({
            cursor: [4, 6]
          });
          ensure('[', {
            cursor: [2, 6]
          });
          ensure('[', {
            cursor: [0, 6]
          });
          ensure(']', {
            cursor: [2, 6]
          });
          ensure(']', {
            cursor: [4, 6]
          });
          return ensure(']', {
            cursor: [7, 6]
          });
        });
        it("only stops on row one of [first row, last row, up-or-down-row is blank] case-2", function() {
          set({
            cursor: [4, 7]
          });
          ensure('[', {
            cursor: [2, 7]
          });
          ensure('[', {
            cursor: [0, 7]
          });
          ensure(']', {
            cursor: [2, 7]
          });
          ensure(']', {
            cursor: [4, 7]
          });
          return ensure(']', {
            cursor: [7, 7]
          });
        });
        it("support count", function() {
          set({
            cursor: [4, 6]
          });
          ensure('2 [', {
            cursor: [0, 6]
          });
          return ensure('3 ]', {
            cursor: [7, 6]
          });
        });
        return describe('editor for hardTab', function() {
          var pack;
          pack = 'language-go';
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage(pack);
            });
            getVimState('sample.go', function(state, vimEditor) {
              editor = state.editor, editorElement = state.editorElement;
              return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
            });
            return runs(function() {
              set({
                cursorScreen: [8, 2]
              });
              return ensure({
                cursor: [8, 1]
              });
            });
          });
          afterEach(function() {
            return atom.packages.deactivatePackage(pack);
          });
          return it("move up/down to next edge of same *screen* column", function() {
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            ensure('[', {
              cursorScreen: [0, 2]
            });
            ensure(']', {
              cursorScreen: [2, 2]
            });
            ensure(']', {
              cursorScreen: [3, 2]
            });
            ensure(']', {
              cursorScreen: [5, 2]
            });
            ensure(']', {
              cursorScreen: [9, 2]
            });
            ensure(']', {
              cursorScreen: [11, 2]
            });
            ensure(']', {
              cursorScreen: [14, 2]
            });
            ensure(']', {
              cursorScreen: [17, 2]
            });
            ensure('[', {
              cursorScreen: [14, 2]
            });
            ensure('[', {
              cursorScreen: [11, 2]
            });
            ensure('[', {
              cursorScreen: [9, 2]
            });
            ensure('[', {
              cursorScreen: [5, 2]
            });
            ensure('[', {
              cursorScreen: [3, 2]
            });
            ensure('[', {
              cursorScreen: [2, 2]
            });
            return ensure('[', {
              cursorScreen: [0, 2]
            });
          });
        });
      });
    });
    describe('moveSuccessOnLinewise behaviral characteristic', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        settings.set('useClipboardAsDefaultRegister', false);
        set({
          text: "000\n111\n222\n"
        });
        originalText = editor.getText();
        return ensure({
          register: {
            '"': {
              text: void 0
            }
          }
        });
      });
      describe("moveSuccessOnLinewise=false motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by j", function() {
            return ensure("d j", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by j", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by j", function() {
            return ensure("c j", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by k", function() {
            return ensure("d k", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by k", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by k", function() {
            return ensure("c k", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by dk", function() {
            return ensure("d k", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yk", function() {
            return ensure("y k", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by ck", function() {
            return ensure("c k", {
              textC: "|000\n111\n222\n",
              register: {
                '"': {
                  text: "\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by dj", function() {
            return ensure("d j", {
              text: originalText,
              mode: 'normal'
            });
          });
          it("yank by yj", function() {
            return ensure("y j", {
              text: originalText,
              register: {
                '"': {
                  text: void 0
                }
              },
              mode: 'normal'
            });
          });
          return it("change by cj", function() {
            return ensure("c j", {
              textC: "000\n111\n|222\n",
              register: {
                '"': {
                  text: "\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
      return describe("moveSuccessOnLinewise=true motion", function() {
        describe("when it can move", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'normal'
            });
          });
          it("change by G", function() {
            return ensure("c G", {
              textC: "000\n|\n",
              register: {
                '"': {
                  text: "111\n222\n"
                }
              },
              mode: 'insert'
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n222\n",
              register: {
                '"': {
                  text: "000\n111\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        describe("when it can not move-up", function() {
          beforeEach(function() {
            return set({
              cursor: [0, 0]
            });
          });
          it("delete by gg", function() {
            return ensure("d g g", {
              text: "111\n222\n",
              mode: 'normal'
            });
          });
          it("yank by gg", function() {
            return ensure("y g g", {
              text: originalText,
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by gg", function() {
            return ensure("c g g", {
              textC: "|\n111\n222\n",
              register: {
                '"': {
                  text: "000\n"
                }
              },
              mode: 'insert'
            });
          });
        });
        return describe("when it can not move-down", function() {
          beforeEach(function() {
            return set({
              cursor: [2, 0]
            });
          });
          it("delete by G", function() {
            return ensure("d G", {
              text: "000\n111\n",
              mode: 'normal'
            });
          });
          it("yank by G", function() {
            return ensure("y G", {
              text: originalText,
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'normal'
            });
          });
          return it("change by G", function() {
            return ensure("c G", {
              textC: "000\n111\n|\n",
              register: {
                '"': {
                  text: "222\n"
                }
              },
              mode: 'insert'
            });
          });
        });
      });
    });
    describe("the w keybinding", function() {
      var baseText;
      baseText = "ab cde1+-\n xyz\n\nzip";
      beforeEach(function() {
        return set({
          text: baseText
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('w', {
            cursor: [0, 3]
          });
          ensure('w', {
            cursor: [0, 7]
          });
          ensure('w', {
            cursor: [1, 1]
          });
          ensure('w', {
            cursor: [2, 0]
          });
          ensure('w', {
            cursor: [3, 0]
          });
          ensure('w', {
            cursor: [3, 2]
          });
          return ensure('w', {
            cursor: [3, 2]
          });
        });
        it("moves the cursor to the end of the word if last word in file", function() {
          set({
            text: 'abc',
            cursor: [0, 0]
          });
          return ensure('w', {
            cursor: [0, 2]
          });
        });
        it("move to next word by skipping trailing white spaces", function() {
          set({
            textC_: "012|___\n  234"
          });
          return ensure('w', {
            textC_: "012___\n  |234"
          });
        });
        it("move to next word from EOL", function() {
          set({
            textC_: "|\n__234\""
          });
          return ensure('w', {
            textC_: "\n__|234\""
          });
        });
        return describe("for CRLF buffer", function() {
          beforeEach(function() {
            return set({
              text: baseText.replace(/\n/g, "\r\n")
            });
          });
          return describe("as a motion", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 0]
              });
            });
            return it("moves the cursor to the beginning of the next word", function() {
              ensure('w', {
                cursor: [0, 3]
              });
              ensure('w', {
                cursor: [0, 7]
              });
              ensure('w', {
                cursor: [1, 1]
              });
              ensure('w', {
                cursor: [2, 0]
              });
              ensure('w', {
                cursor: [3, 0]
              });
              ensure('w', {
                cursor: [3, 2]
              });
              return ensure('w', {
                cursor: [3, 2]
              });
            });
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text_: "__var1 = 1\n__var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('c w', {
              text_: "__v = 1\n__var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('c w', {
              text_: "var1 = 1\n__var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text_: "abc__\ndef\n",
              cursor: [0, 3]
            });
            return ensure('c w', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5 c w', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y w', {
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects the whitespace", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y w', {
              register: {
                '"': {
                  text: ' '
                }
              }
            });
          });
        });
      });
    });
    describe("the W keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab \n xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the beginning of the next word", function() {
          ensure('W', {
            cursor: [0, 7]
          });
          ensure('W', {
            cursor: [1, 1]
          });
          ensure('W', {
            cursor: [2, 0]
          });
          return ensure('W', {
            cursor: [3, 0]
          });
        });
        it("moves the cursor to beginning of the next word of next line when all remaining text is white space.", function() {
          set({
            text_: "012___\n__234",
            cursor: [0, 3]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
        return it("moves the cursor to beginning of the next word of next line when cursor is at EOL.", function() {
          set({
            text_: "\n__234",
            cursor: [0, 0]
          });
          return ensure('W', {
            cursor: [1, 2]
          });
        });
      });
      describe("when used by Change operator", function() {
        beforeEach(function() {
          return set({
            text_: "__var1 = 1\n__var2 = 2\n"
          });
        });
        describe("when cursor is on word", function() {
          return it("not eat whitespace", function() {
            set({
              cursor: [0, 3]
            });
            return ensure('c W', {
              text_: "__v = 1\n__var2 = 2\n",
              cursor: [0, 3]
            });
          });
        });
        describe("when cursor is on white space", function() {
          return it("only eat white space", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('c W', {
              text_: "var1 = 1\n__var2 = 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("when text to EOL is all white space", function() {
          it("wont eat new line character", function() {
            set({
              text: "abc  \ndef\n",
              cursor: [0, 3]
            });
            return ensure('c W', {
              text: "abc\ndef\n",
              cursor: [0, 3]
            });
          });
          return it("cant eat new line when count is specified", function() {
            set({
              text: "\n\n\n\n\nline6\n",
              cursor: [0, 0]
            });
            return ensure('5 c W', {
              text: "\nline6\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the whole word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y W', {
              register: {
                '"': {
                  text: 'cde1+- '
                }
              }
            });
          });
        });
        it("continues past blank lines", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('d W', {
            text_: "cde1+- ab_\n_xyz\nzip",
            register: {
              '"': {
                text: "\n"
              }
            }
          });
        });
        return it("doesn't go past the end of the file", function() {
          set({
            cursor: [3, 0]
          });
          return ensure('d W', {
            text_: "cde1+- ab_\n_xyz\n\n",
            register: {
              '"': {
                text: 'zip'
              }
            }
          });
        });
      });
    });
    describe("the e keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab cde1+-_\n_xyz\n\nzip"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("moves the cursor to the end of the current word", function() {
          ensure('e', {
            cursor: [0, 1]
          });
          ensure('e', {
            cursor: [0, 6]
          });
          ensure('e', {
            cursor: [0, 8]
          });
          ensure('e', {
            cursor: [1, 3]
          });
          return ensure('e', {
            cursor: [3, 2]
          });
        });
        return it("skips whitespace until EOF", function() {
          set({
            text: "012\n\n\n012\n\n",
            cursor: [0, 0]
          });
          ensure('e', {
            cursor: [0, 2]
          });
          ensure('e', {
            cursor: [3, 2]
          });
          return ensure('e', {
            cursor: [4, 0]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y e', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y e', {
              register: {
                '"': {
                  text: ' cde1'
                }
              }
            });
          });
        });
      });
    });
    describe("the ge keybinding", function() {
      describe("as a motion", function() {
        it("moves the cursor to the end of the previous word", function() {
          set({
            text: "1234 5678 wordword",
            cursor: [0, 16]
          });
          ensure('g e', {
            cursor: [0, 8]
          });
          ensure('g e', {
            cursor: [0, 3]
          });
          ensure('g e', {
            cursor: [0, 0]
          });
          return ensure('g e', {
            cursor: [0, 0]
          });
        });
        it("moves corrently when starting between words", function() {
          set({
            text: "1 leading     end",
            cursor: [0, 12]
          });
          return ensure('g e', {
            cursor: [0, 8]
          });
        });
        it("takes a count", function() {
          set({
            text: "vim mode plus is getting there",
            cursor: [0, 28]
          });
          return ensure('5 g e', {
            cursor: [0, 2]
          });
        });
        xit("handles non-words inside words like vim", function() {
          set({
            text: "1234 5678 word-word",
            cursor: [0, 18]
          });
          ensure('g e', {
            cursor: [0, 14]
          });
          ensure('g e', {
            cursor: [0, 13]
          });
          return ensure('g e', {
            cursor: [0, 8]
          });
        });
        return xit("handles newlines like vim", function() {
          set({
            text: "1234\n\n\n\n5678",
            cursor: [5, 2]
          });
          ensure('g e', {
            cursor: [4, 0]
          });
          ensure('g e', {
            cursor: [3, 0]
          });
          ensure('g e', {
            cursor: [2, 0]
          });
          ensure('g e', {
            cursor: [1, 0]
          });
          ensure('g e', {
            cursor: [1, 0]
          });
          ensure('g e', {
            cursor: [0, 3]
          });
          return ensure('g e', {
            cursor: [0, 0]
          });
        });
      });
      describe("when used by Change operator", function() {
        it("changes word fragments", function() {
          set({
            text: "cet document",
            cursor: [0, 7]
          });
          return ensure('c g e', {
            cursor: [0, 2],
            text: "cement",
            mode: 'insert'
          });
        });
        return it("changes whitespace properly", function() {
          set({
            text: "ce    doc",
            cursor: [0, 4]
          });
          return ensure('c g e', {
            cursor: [0, 1],
            text: "c doc",
            mode: 'insert'
          });
        });
      });
      return describe("in characterwise visual mode", function() {
        return it("selects word fragments", function() {
          set({
            text: "cet document",
            cursor: [0, 7]
          });
          return ensure('v g e', {
            cursor: [0, 2],
            selectedText: "t docu"
          });
        });
      });
    });
    describe("the E keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "ab  cde1+-_\n_xyz_\n\nzip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("moves the cursor to the end of the current word", function() {
          ensure('E', {
            cursor: [0, 1]
          });
          ensure('E', {
            cursor: [0, 9]
          });
          ensure('E', {
            cursor: [1, 3]
          });
          ensure('E', {
            cursor: [3, 2]
          });
          return ensure('E', {
            cursor: [3, 2]
          });
        });
      });
      return describe("as selection", function() {
        describe("within a word", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: 'ab'
                }
              }
            });
          });
        });
        describe("between words", function() {
          return it("selects to the end of the next word", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('y E', {
              register: {
                '"': {
                  text: '  cde1+-'
                }
              }
            });
          });
        });
        return describe("press more than once", function() {
          return it("selects to the end of the current word", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('v E E y', {
              register: {
                '"': {
                  text: 'ab  cde1+-'
                }
              }
            });
          });
        });
      });
    });
    describe("the gE keybinding", function() {
      return describe("as a motion", function() {
        return it("moves the cursor to the end of the previous word", function() {
          set({
            text: "12.4 5~7- word-word",
            cursor: [0, 16]
          });
          ensure('g E', {
            cursor: [0, 8]
          });
          ensure('g E', {
            cursor: [0, 3]
          });
          ensure('g E', {
            cursor: [0, 0]
          });
          return ensure('g E', {
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the (,) sentence keybinding", function() {
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "sentence one.])'\"    sen.tence .two.\nhere.  sentence three\nmore three\n\n   sentence four\n\n\nsentence five.\nmore five\nmore six\n\n last sentence\nall done seven"
          });
        });
        it("moves the cursor to the end of the sentence", function() {
          ensure(')', {
            cursor: [0, 21]
          });
          ensure(')', {
            cursor: [1, 0]
          });
          ensure(')', {
            cursor: [1, 7]
          });
          ensure(')', {
            cursor: [3, 0]
          });
          ensure(')', {
            cursor: [4, 3]
          });
          ensure(')', {
            cursor: [5, 0]
          });
          ensure(')', {
            cursor: [7, 0]
          });
          ensure(')', {
            cursor: [8, 0]
          });
          ensure(')', {
            cursor: [10, 0]
          });
          ensure(')', {
            cursor: [11, 1]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure(')', {
            cursor: [12, 13]
          });
          ensure('(', {
            cursor: [11, 1]
          });
          ensure('(', {
            cursor: [10, 0]
          });
          ensure('(', {
            cursor: [8, 0]
          });
          ensure('(', {
            cursor: [7, 0]
          });
          ensure('(', {
            cursor: [6, 0]
          });
          ensure('(', {
            cursor: [4, 3]
          });
          ensure('(', {
            cursor: [3, 0]
          });
          ensure('(', {
            cursor: [1, 7]
          });
          ensure('(', {
            cursor: [1, 0]
          });
          ensure('(', {
            cursor: [0, 21]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
        it("skips to beginning of sentence", function() {
          set({
            cursor: [4, 15]
          });
          return ensure('(', {
            cursor: [4, 3]
          });
        });
        it("supports a count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 )', {
            cursor: [1, 7]
          });
          return ensure('3 (', {
            cursor: [0, 0]
          });
        });
        it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('2 0 )', {
            cursor: [12, 13]
          });
          return ensure('2 0 (', {
            cursor: [0, 0]
          });
        });
        return describe("sentence motion with skip-blank-row", function() {
          beforeEach(function() {
            return atom.keymaps.add("test", {
              'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
                'g )': 'vim-mode-plus:move-to-next-sentence-skip-blank-row',
                'g (': 'vim-mode-plus:move-to-previous-sentence-skip-blank-row'
              }
            });
          });
          return it("moves the cursor to the end of the sentence", function() {
            ensure('g )', {
              cursor: [0, 21]
            });
            ensure('g )', {
              cursor: [1, 0]
            });
            ensure('g )', {
              cursor: [1, 7]
            });
            ensure('g )', {
              cursor: [4, 3]
            });
            ensure('g )', {
              cursor: [7, 0]
            });
            ensure('g )', {
              cursor: [8, 0]
            });
            ensure('g )', {
              cursor: [11, 1]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g )', {
              cursor: [12, 13]
            });
            ensure('g (', {
              cursor: [11, 1]
            });
            ensure('g (', {
              cursor: [8, 0]
            });
            ensure('g (', {
              cursor: [7, 0]
            });
            ensure('g (', {
              cursor: [4, 3]
            });
            ensure('g (', {
              cursor: [1, 7]
            });
            ensure('g (', {
              cursor: [1, 0]
            });
            ensure('g (', {
              cursor: [0, 21]
            });
            ensure('g (', {
              cursor: [0, 0]
            });
            return ensure('g (', {
              cursor: [0, 0]
            });
          });
        });
      });
      describe("moving inside a blank document", function() {
        beforeEach(function() {
          return set({
            text_: "_____\n_____"
          });
        });
        return it("moves without crashing", function() {
          set({
            cursor: [0, 0]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure(')', {
            cursor: [1, 4]
          });
          ensure('(', {
            cursor: [0, 0]
          });
          return ensure('(', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        beforeEach(function() {
          return set({
            text: "sentence one. sentence two.\n  sentence three."
          });
        });
        it('selects to the end of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y )', {
            register: {
              '"': {
                text: "ce two.\n  "
              }
            }
          });
        });
        return it('selects to the beginning of the current sentence', function() {
          set({
            cursor: [0, 20]
          });
          return ensure('y (', {
            register: {
              '"': {
                text: "senten"
              }
            }
          });
        });
      });
    });
    describe("the {,} keybinding", function() {
      beforeEach(function() {
        return set({
          text: "\n\n\n3: paragraph-1\n4: paragraph-1\n\n\n\n8: paragraph-2\n\n\n\n12: paragraph-3\n13: paragraph-3\n\n\n16: paragprah-4\n",
          cursor: [0, 0]
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the paragraph", function() {
          set({
            cursor: [0, 0]
          });
          ensure('}', {
            cursor: [5, 0]
          });
          ensure('}', {
            cursor: [9, 0]
          });
          ensure('}', {
            cursor: [14, 0]
          });
          ensure('{', {
            cursor: [11, 0]
          });
          ensure('{', {
            cursor: [7, 0]
          });
          return ensure('{', {
            cursor: [2, 0]
          });
        });
        it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 }', {
            cursor: [14, 0]
          });
          return ensure('3 {', {
            cursor: [2, 0]
          });
        });
        return it("can move start of buffer or end of buffer at maximum", function() {
          set({
            cursor: [0, 0]
          });
          ensure('1 0 }', {
            cursor: [16, 14]
          });
          return ensure('1 0 {', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it('selects to the end of the current paragraph', function() {
          set({
            cursor: [3, 3]
          });
          return ensure('y }', {
            register: {
              '"': {
                text: "paragraph-1\n4: paragraph-1\n"
              }
            }
          });
        });
        return it('selects to the end of the current paragraph', function() {
          set({
            cursor: [4, 3]
          });
          return ensure('y {', {
            register: {
              '"': {
                text: "\n3: paragraph-1\n4: "
              }
            }
          });
        });
      });
    });
    describe("the b keybinding", function() {
      beforeEach(function() {
        return set({
          textC_: "_ab cde1+-_\n_xyz\n\nzip }\n_|last"
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('b', {
            textC: " ab cde1+- \n xyz\n\nzip |}\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n xyz\n\n|zip }\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n xyz\n|\nzip }\n last"
          });
          ensure('b', {
            textC: " ab cde1+- \n |xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " ab cde1|+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " ab |cde1+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: " |ab cde1+- \n xyz\n\nzip }\n last"
          });
          ensure('b', {
            textC: "| ab cde1+- \n xyz\n\nzip }\n last"
          });
          return ensure('b', {
            textC: "| ab cde1+- \n xyz\n\nzip }\n last"
          });
        });
      });
      return describe("as a selection", function() {
        describe("within a word", function() {
          return it("selects to the beginning of the current word", function() {
            set({
              textC: " a|b cd"
            });
            return ensure('y b', {
              textC: " |ab cd",
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
        });
        return describe("between words", function() {
          return it("selects to the beginning of the last word", function() {
            set({
              textC: " ab |cd"
            });
            return ensure('y b', {
              textC: " |ab cd",
              register: {
                '"': {
                  text: 'ab '
                }
              }
            });
          });
        });
      });
    });
    describe("the B keybinding", function() {
      beforeEach(function() {
        return set({
          text: "cde1+- ab\n\t xyz-123\n\n zip\n"
        });
      });
      describe("as a motion", function() {
        beforeEach(function() {
          return set({
            cursor: [4, 0]
          });
        });
        return it("moves the cursor to the beginning of the previous word", function() {
          ensure('B', {
            cursor: [3, 1]
          });
          ensure('B', {
            cursor: [2, 0]
          });
          ensure('B', {
            cursor: [1, 2]
          });
          ensure('B', {
            cursor: [0, 7]
          });
          return ensure('B', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        it("selects to the beginning of the whole word", function() {
          set({
            cursor: [1, 8]
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'xyz-12'
              }
            }
          });
        });
        return it("doesn't go past the beginning of the file", function() {
          set({
            cursor: [0, 0],
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
          return ensure('y B', {
            register: {
              '"': {
                text: 'abc'
              }
            }
          });
        });
      });
    });
    describe("the ^ keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "|  abcde"
        });
      });
      describe("from the beginning of the line", function() {
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: 'abcde',
              cursor: [0, 0]
            });
          });
        });
      });
      describe("from the first character of the line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("stays put", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("does nothing", function() {
            return ensure('d ^', {
              text: '  abcde',
              cursor: [0, 2]
            });
          });
        });
      });
      return describe("from the middle of a word", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 4]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the line", function() {
            return ensure('^', {
              cursor: [0, 2]
            });
          });
        });
        return describe("as a selection", function() {
          it('selects to the first character of the line', function() {
            return ensure('d ^', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
          return it('selects to the first character of the line', function() {
            return ensure('d I', {
              text: '  cde',
              cursor: [0, 2]
            });
          });
        });
      });
    });
    describe("the 0 keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "  ab|cde"
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the first column", function() {
          return ensure('0', {
            cursor: [0, 0]
          });
        });
      });
      return describe("as a selection", function() {
        return it('selects to the first column of the line', function() {
          return ensure('d 0', {
            text: 'cde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("g 0, g ^ and g $", function() {
      var enableSoftWrapAndEnsure;
      enableSoftWrapAndEnsure = function() {
        editor.setSoftWrapped(true);
        expect(editor.lineTextForScreenRow(0)).toBe(" 1234567");
        expect(editor.lineTextForScreenRow(1)).toBe(" 89B1234");
        expect(editor.lineTextForScreenRow(2)).toBe(" 56789C1");
        expect(editor.lineTextForScreenRow(3)).toBe(" 2345678");
        return expect(editor.lineTextForScreenRow(4)).toBe(" 9");
      };
      beforeEach(function() {
        var scrollbarStyle;
        scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = '::-webkit-scrollbar { -webkit-appearance: none }';
        jasmine.attachToDOM(scrollbarStyle);
        set({
          text_: "_123456789B123456789C123456789"
        });
        jasmine.attachToDOM(getView(atom.workspace));
        return waitsForPromise(function() {
          return setEditorWidthInCharacters(editor, 10);
        });
      });
      describe("the g 0 keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to column 0 of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g 0", {
                cursorScreen: [0, 0]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g 0", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to column 0 of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 0]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first visible colum of screen line", function() {
              return ensure("g 0", {
                cursor: [0, 10]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to column 0 of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g 0", {
                cursorScreen: [0, 0]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g 0", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
      });
      describe("the g ^ keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to first-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g ^", {
                cursorScreen: [0, 1]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g ^", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, firstColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 3]
              });
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 1]
              });
            });
          });
          describe("softwrap = false, firstColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to first-char of screen line", function() {
              return ensure("g ^", {
                cursor: [0, 10]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to first-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g ^", {
                cursorScreen: [0, 1]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g ^", {
                cursorScreen: [1, 1]
              });
            });
          });
        });
      });
      return describe("the g $ keybinding", function() {
        describe("allowMoveToOffScreenColumnOnScreenLineMotion = true(default)", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', true);
          });
          describe("softwrap = false, lastColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 27]
              });
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          describe("softwrap = false, lastColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to last-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g $", {
                cursorScreen: [0, 7]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g $", {
                cursorScreen: [1, 7]
              });
            });
          });
        });
        return describe("allowMoveToOffScreenColumnOnScreenLineMotion = false", function() {
          beforeEach(function() {
            return settings.set('allowMoveToOffScreenColumnOnScreenLineMotion', false);
          });
          describe("softwrap = false, lastColumnIsVisible = true", function() {
            beforeEach(function() {
              return set({
                cursor: [0, 27]
              });
            });
            return it("move to last-char of screen line", function() {
              return ensure("g $", {
                cursor: [0, 29]
              });
            });
          });
          describe("softwrap = false, lastColumnIsVisible = false", function() {
            beforeEach(function() {
              set({
                cursor: [0, 15]
              });
              return editor.setFirstVisibleScreenColumn(10);
            });
            return it("move to last-char in visible screen line", function() {
              return ensure("g $", {
                cursor: [0, 18]
              });
            });
          });
          return describe("softwrap = true", function() {
            beforeEach(function() {
              return enableSoftWrapAndEnsure();
            });
            return it("move to last-char of screen line", function() {
              set({
                cursorScreen: [0, 3]
              });
              ensure("g $", {
                cursorScreen: [0, 7]
              });
              set({
                cursorScreen: [1, 3]
              });
              return ensure("g $", {
                cursorScreen: [1, 7]
              });
            });
          });
        });
      });
    });
    describe("the | keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde",
          cursor: [0, 4]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the number column", function() {
          ensure('|', {
            cursor: [0, 0]
          });
          ensure('1 |', {
            cursor: [0, 0]
          });
          ensure('3 |', {
            cursor: [0, 2]
          });
          return ensure('4 |', {
            cursor: [0, 3]
          });
        });
      });
      return describe("as operator's target", function() {
        return it('behave exclusively', function() {
          set({
            cursor: [0, 0]
          });
          return ensure('d 4 |', {
            text: 'bcde',
            cursor: [0, 0]
          });
        });
      });
    });
    describe("the $ keybinding", function() {
      beforeEach(function() {
        return set({
          text: "  abcde\n\n1234567890",
          cursor: [0, 4]
        });
      });
      describe("as a motion from empty line", function() {
        return it("moves the cursor to the end of the line", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('$', {
            cursor: [1, 0]
          });
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the end of the line", function() {
          return ensure('$', {
            cursor: [0, 6]
          });
        });
        it("set goalColumn Infinity", function() {
          expect(editor.getLastCursor().goalColumn).toBe(null);
          ensure('$', {
            cursor: [0, 6]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
        it("should remain in the last column when moving down", function() {
          ensure('$ j', {
            cursor: [1, 0]
          });
          return ensure('j', {
            cursor: [2, 9]
          });
        });
        return it("support count", function() {
          return ensure('3 $', {
            cursor: [2, 9]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the end of the lines", function() {
          return ensure('d $', {
            text: "  ab\n\n1234567890",
            cursor: [0, 3]
          });
        });
      });
    });
    describe("the - keybinding", function() {
      beforeEach(function() {
        return set({
          text: "abcdefg\n  abc\n  abc\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the last character of the previous line", function() {
            return ensure('-', {
              cursor: [0, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and previous line", function() {
            return ensure('d -', {
              text: "  abc\n",
              cursor: [0, 2]
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the previous one", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the previous line (directly above)", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line (directly above)", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line preceded by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the previous line", function() {
            return ensure('-', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the previous line", function() {
            return ensure('d -', {
              text: "abcdefg\n"
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [4, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines previous", function() {
            return ensure('3 -', {
              cursor: [1, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many previous lines", function() {
            return ensure('d 3 -', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the + keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [2, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current and next line", function() {
            return ensure('d +', {
              text: "  abc\n"
            });
          });
        });
      });
      describe("from the first character of a line indented the same as the next one", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 2]
          });
        });
        describe("as a motion", function() {
          return it("moves to the first character of the next line (directly below)", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line (directly below)", function() {
            return ensure('d +', {
              text: "abcdefg\n"
            });
          });
        });
      });
      describe("from the beginning of a line followed by an indented line", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the next line", function() {
            return ensure('+', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("selects to the first character of the next line", function() {
            return ensure('d +', {
              text: "abcdefg\n",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 +', {
              cursor: [4, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 +', {
              text: "1\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the _ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "__abc\n__abc\nabcdefg\n"
        });
      });
      describe("from the middle of a line", function() {
        beforeEach(function() {
          return set({
            cursor: [1, 3]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of the current line", function() {
            return ensure('_', {
              cursor: [1, 2]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line", function() {
            return ensure('d _', {
              text_: "__abc\nabcdefg\n",
              cursor: [1, 0]
            });
          });
        });
      });
      return describe("with a count", function() {
        beforeEach(function() {
          return set({
            text: "1\n2\n3\n4\n5\n6\n",
            cursor: [1, 0]
          });
        });
        describe("as a motion", function() {
          return it("moves the cursor to the first character of that many lines following", function() {
            return ensure('3 _', {
              cursor: [3, 0]
            });
          });
        });
        return describe("as a selection", function() {
          return it("deletes the current line plus that many following lines", function() {
            return ensure('d 3 _', {
              text: "1\n5\n6\n",
              cursor: [1, 0]
            });
          });
        });
      });
    });
    describe("the enter keybinding", function() {
      var startingText;
      startingText = "  abc\n  abc\nabcdefg\n";
      return describe("from the middle of a line", function() {
        var startingCursorPosition;
        startingCursorPosition = [1, 3];
        describe("as a motion", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('+');
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('enter', {
              cursor: referenceCursorPosition
            });
          });
        });
        return describe("as a selection", function() {
          return it("acts the same as the + keybinding", function() {
            var referenceCursorPosition, referenceText;
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            keystroke('d +');
            referenceText = editor.getText();
            referenceCursorPosition = editor.getCursorScreenPosition();
            set({
              text: startingText,
              cursor: startingCursorPosition
            });
            return ensure('d enter', {
              text: referenceText,
              cursor: referenceCursorPosition
            });
          });
        });
      });
    });
    describe("the gg keybinding with stayOnVerticalMotion = false", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text: " 1abc\n 2\n3\n",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        describe("in normal mode", function() {
          it("moves the cursor to the beginning of the first line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
          return it("move to same position if its on first line and first char", function() {
            return ensure('g g', {
              cursor: [0, 1]
            });
          });
        });
        describe("in linewise visual mode", function() {
          return it("selects to the first line in the file", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('V g g', {
              selectedText: " 1abc\n 2\n",
              cursor: [0, 0]
            });
          });
        });
        return describe("in characterwise visual mode", function() {
          beforeEach(function() {
            return set({
              cursor: [1, 1]
            });
          });
          return it("selects to the first line in the file", function() {
            return ensure('v g g', {
              selectedText: "1abc\n 2",
              cursor: [0, 1]
            });
          });
        });
      });
      return describe("when count specified", function() {
        describe("in normal mode", function() {
          return it("moves the cursor to first char of a specified line", function() {
            return ensure('2 g g', {
              cursor: [1, 1]
            });
          });
        });
        describe("in linewise visual motion", function() {
          return it("selects to a specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('V 2 g g', {
              selectedText: " 2\n3\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("in characterwise visual motion", function() {
          return it("selects to a first character of specified line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('v 2 g g', {
              selectedText: "2\n3",
              cursor: [1, 1]
            });
          });
        });
      });
    });
    describe("the g_ keybinding", function() {
      beforeEach(function() {
        return set({
          text_: "1__\n    2__\n 3abc\n_"
        });
      });
      describe("as a motion", function() {
        it("moves the cursor to the last nonblank character", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('g _', {
            cursor: [1, 4]
          });
        });
        return it("will move the cursor to the beginning of the line if necessary", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('g _', {
            cursor: [0, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor downward and outward", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('2 g _', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects the current line excluding whitespace", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v 2 g _', {
            selectedText: "  2  \n 3abc"
          });
        });
      });
    });
    describe("the G keybinding (stayOnVerticalMotion = false)", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text_: "1\n____2\n_3abc\n_",
          cursor: [0, 2]
        });
      });
      describe("as a motion", function() {
        return it("moves the cursor to the last line after whitespace", function() {
          return ensure('G', {
            cursor: [3, 0]
          });
        });
      });
      describe("as a repeated motion", function() {
        return it("moves the cursor to a specified line", function() {
          return ensure('2 G', {
            cursor: [1, 4]
          });
        });
      });
      return describe("as a selection", function() {
        return it("selects to the last line in the file", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('v G', {
            selectedText: "    2\n 3abc\n ",
            cursor: [3, 1]
          });
        });
      });
    });
    describe("the N% keybinding", function() {
      beforeEach(function() {
        var i, results;
        return set({
          text: (function() {
            results = [];
            for (i = 0; i <= 999; i++){ results.push(i); }
            return results;
          }).apply(this).join("\n"),
          cursor: [0, 0]
        });
      });
      return describe("put cursor on line specified by percent", function() {
        it("50%", function() {
          return ensure('5 0 %', {
            cursor: [499, 0]
          });
        });
        it("30%", function() {
          return ensure('3 0 %', {
            cursor: [299, 0]
          });
        });
        it("100%", function() {
          return ensure('1 0 0 %', {
            cursor: [999, 0]
          });
        });
        return it("120%", function() {
          return ensure('1 2 0 %', {
            cursor: [999, 0]
          });
        });
      });
    });
    describe("the H, M, L keybinding( stayOnVerticalMotio = false )", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', false);
        return set({
          text: "  1\n2\n3\n4\n  5\n6\n7\n8\n9\n  10",
          cursor: [8, 0]
        });
      });
      describe("the H keybinding", function() {
        it("moves the cursor to the non-blank-char on first row if visible", function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('H', {
            cursor: [0, 2]
          });
        });
        it("moves the cursor to the non-blank-char on first visible row plus scroll offset", function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(2);
          return ensure('H', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return ensure('4 H', {
            cursor: [3, 0]
          });
        });
      });
      describe("the L keybinding", function() {
        it("moves the cursor to non-blank-char on last row if visible", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('L', {
            cursor: [9, 2]
          });
        });
        it("moves the cursor to the first visible row plus offset", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(7);
          return ensure('L', {
            cursor: [4, 2]
          });
        });
        return it("respects counts", function() {
          spyOn(editor, 'getLastVisibleScreenRow').andReturn(9);
          return ensure('3 L', {
            cursor: [7, 0]
          });
        });
      });
      return describe("the M keybinding", function() {
        beforeEach(function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(10);
        });
        return it("moves the cursor to the non-blank-char of middle of screen", function() {
          return ensure('M', {
            cursor: [4, 2]
          });
        });
      });
    });
    describe("stayOnVerticalMotion setting", function() {
      beforeEach(function() {
        settings.set('stayOnVerticalMotion', true);
        return set({
          text: "  0 000000000000\n  1 111111111111\n2 222222222222\n",
          cursor: [2, 10]
        });
      });
      describe("gg, G, N%", function() {
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('g g', {
            cursor: [0, 10]
          });
          ensure('$', {
            cursor: [0, 15]
          });
          ensure('G', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 %', {
            cursor: [0, 15]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('1 0 h', {
            cursor: [0, 5]
          });
          ensure('5 0 %', {
            cursor: [1, 5]
          });
          return ensure('1 0 0 %', {
            cursor: [2, 5]
          });
        });
      });
      return describe("H, M, L", function() {
        beforeEach(function() {
          spyOn(editor, 'getFirstVisibleScreenRow').andReturn(0);
          return spyOn(editor, 'getLastVisibleScreenRow').andReturn(3);
        });
        return it("go to row with keep column and respect cursor.goalColum", function() {
          ensure('H', {
            cursor: [0, 10]
          });
          ensure('M', {
            cursor: [1, 10]
          });
          ensure('L', {
            cursor: [2, 10]
          });
          ensure('$', {
            cursor: [2, 13]
          });
          expect(editor.getLastCursor().goalColumn).toBe(2e308);
          ensure('H', {
            cursor: [0, 15]
          });
          ensure('M', {
            cursor: [1, 15]
          });
          ensure('L', {
            cursor: [2, 13]
          });
          return expect(editor.getLastCursor().goalColumn).toBe(2e308);
        });
      });
    });
    describe('the mark keybindings', function() {
      beforeEach(function() {
        return set({
          text: "  12\n    34\n56\n",
          cursor: [0, 1]
        });
      });
      it('moves to the beginning of the line of a mark', function() {
        set({
          cursor: [1, 1]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure("' a", {
          cursor: [1, 4]
        });
      });
      it('moves literally to a mark', function() {
        set({
          cursor: [1, 2]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure('` a', {
          cursor: [1, 2]
        });
      });
      it('deletes to a mark by line', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [0, 0]
        });
        return ensure("d ' a", {
          text: '56\n'
        });
      });
      it('deletes before to a mark literally', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [0, 2]
        });
        return ensure('d ` a', {
          text: '  4\n56\n'
        });
      });
      it('deletes after to a mark literally', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('m a');
        set({
          cursor: [2, 1]
        });
        return ensure('d ` a', {
          text: '  12\n    36\n'
        });
      });
      return it('moves back to previous', function() {
        set({
          cursor: [1, 5]
        });
        keystroke('` `');
        set({
          cursor: [2, 1]
        });
        return ensure('` `', {
          cursor: [1, 5]
        });
      });
    });
    describe("jump command update ` and ' mark", function() {
      var ensureJumpAndBack, ensureJumpAndBackLinewise, ensureJumpMark;
      ensureJumpMark = function(value) {
        ensure({
          mark: {
            "`": value
          }
        });
        return ensure({
          mark: {
            "'": value
          }
        });
      };
      ensureJumpAndBack = function(keystroke, option) {
        var afterMove, beforeMove;
        afterMove = option.cursor;
        beforeMove = editor.getCursorBufferPosition();
        ensure(keystroke, {
          cursor: afterMove
        });
        ensureJumpMark(beforeMove);
        expect(beforeMove.isEqual(afterMove)).toBe(false);
        ensure("` `", {
          cursor: beforeMove
        });
        return ensureJumpMark(afterMove);
      };
      ensureJumpAndBackLinewise = function(keystroke, option) {
        var afterMove, beforeMove;
        afterMove = option.cursor;
        beforeMove = editor.getCursorBufferPosition();
        expect(beforeMove.column).not.toBe(0);
        ensure(keystroke, {
          cursor: afterMove
        });
        ensureJumpMark(beforeMove);
        expect(beforeMove.isEqual(afterMove)).toBe(false);
        ensure("' '", {
          cursor: [beforeMove.row, 0]
        });
        return ensureJumpMark(afterMove);
      };
      beforeEach(function() {
        var i, len, mark, ref2, ref3;
        ref2 = "`'";
        for (i = 0, len = ref2.length; i < len; i++) {
          mark = ref2[i];
          if ((ref3 = vimState.mark.marks[mark]) != null) {
            ref3.destroy();
          }
          vimState.mark.marks[mark] = null;
        }
        return set({
          text: "0: oo 0\n1: 1111\n2: 2222\n3: oo 3\n4: 4444\n5: oo 5",
          cursor: [1, 0]
        });
      });
      describe("initial state", function() {
        return it("return [0, 0]", function() {
          ensure({
            mark: {
              "'": [0, 0]
            }
          });
          return ensure({
            mark: {
              "`": [0, 0]
            }
          });
        });
      });
      return describe("jump motion in normal-mode", function() {
        var initial;
        initial = [3, 3];
        beforeEach(function() {
          var component;
          jasmine.attachToDOM(getView(atom.workspace));
          if (editorElement.measureDimensions != null) {
            component = editor.component;
            component.element.style.height = component.getLineHeight() * editor.getLineCount() + 'px';
            editorElement.measureDimensions();
          }
          ensure({
            mark: {
              "'": [0, 0]
            }
          });
          ensure({
            mark: {
              "`": [0, 0]
            }
          });
          return set({
            cursor: initial
          });
        });
        it("G jump&back", function() {
          return ensureJumpAndBack('G', {
            cursor: [5, 3]
          });
        });
        it("g g jump&back", function() {
          return ensureJumpAndBack("g g", {
            cursor: [0, 3]
          });
        });
        it("100 % jump&back", function() {
          return ensureJumpAndBack("1 0 0 %", {
            cursor: [5, 3]
          });
        });
        it(") jump&back", function() {
          return ensureJumpAndBack(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back", function() {
          return ensureJumpAndBack("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back", function() {
          return ensureJumpAndBack("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back", function() {
          return ensureJumpAndBack("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back", function() {
          return ensureJumpAndBack("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back", function() {
          return ensureJumpAndBack("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back", function() {
          return ensureJumpAndBack("L", {
            cursor: [5, 3]
          });
        });
        it("H jump&back", function() {
          return ensureJumpAndBack("H", {
            cursor: [0, 3]
          });
        });
        it("M jump&back", function() {
          return ensureJumpAndBack("M", {
            cursor: [2, 3]
          });
        });
        it("* jump&back", function() {
          return ensureJumpAndBack("*", {
            cursor: [5, 3]
          });
        });
        it("Sharp(#) jump&back", function() {
          return ensureJumpAndBack('#', {
            cursor: [0, 3]
          });
        });
        it("/ jump&back", function() {
          return ensureJumpAndBack('/ oo enter', {
            cursor: [5, 3]
          });
        });
        it("? jump&back", function() {
          return ensureJumpAndBack('? oo enter', {
            cursor: [0, 3]
          });
        });
        it("n jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure('/ oo enter', {
            cursor: [0, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [5, 3]
          });
        });
        it("N jump&back", function() {
          set({
            cursor: [0, 0]
          });
          ensure('? oo enter', {
            cursor: [5, 3]
          });
          ensureJumpAndBack("n", {
            cursor: [3, 3]
          });
          return ensureJumpAndBack("N", {
            cursor: [0, 3]
          });
        });
        it("G jump&back linewise", function() {
          return ensureJumpAndBackLinewise('G', {
            cursor: [5, 3]
          });
        });
        it("g g jump&back linewise", function() {
          return ensureJumpAndBackLinewise("g g", {
            cursor: [0, 3]
          });
        });
        it("100 % jump&back linewise", function() {
          return ensureJumpAndBackLinewise("1 0 0 %", {
            cursor: [5, 3]
          });
        });
        it(") jump&back linewise", function() {
          return ensureJumpAndBackLinewise(")", {
            cursor: [5, 6]
          });
        });
        it("( jump&back linewise", function() {
          return ensureJumpAndBackLinewise("(", {
            cursor: [0, 0]
          });
        });
        it("] jump&back linewise", function() {
          return ensureJumpAndBackLinewise("]", {
            cursor: [5, 3]
          });
        });
        it("[ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("[", {
            cursor: [0, 3]
          });
        });
        it("} jump&back linewise", function() {
          return ensureJumpAndBackLinewise("}", {
            cursor: [5, 6]
          });
        });
        it("{ jump&back linewise", function() {
          return ensureJumpAndBackLinewise("{", {
            cursor: [0, 0]
          });
        });
        it("L jump&back linewise", function() {
          return ensureJumpAndBackLinewise("L", {
            cursor: [5, 3]
          });
        });
        it("H jump&back linewise", function() {
          return ensureJumpAndBackLinewise("H", {
            cursor: [0, 3]
          });
        });
        it("M jump&back linewise", function() {
          return ensureJumpAndBackLinewise("M", {
            cursor: [2, 3]
          });
        });
        return it("* jump&back linewise", function() {
          return ensureJumpAndBackLinewise("*", {
            cursor: [5, 3]
          });
        });
      });
    });
    describe('the V keybinding', function() {
      var text;
      text = [][0];
      beforeEach(function() {
        text = new TextData("01\n002\n0003\n00004\n000005\n");
        return set({
          text: text.getRaw(),
          cursor: [1, 1]
        });
      });
      it("selects down a line", function() {
        return ensure('V j j', {
          selectedText: text.getLines([1, 2, 3])
        });
      });
      return it("selects up a line", function() {
        return ensure('V k', {
          selectedText: text.getLines([0, 1])
        });
      });
    });
    describe('MoveTo(Previous|Next)Fold(Start|End)', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        getVimState('sample.coffee', function(state, vim) {
          editor = state.editor, editorElement = state.editorElement;
          return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
        });
        return runs(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              '[ [': 'vim-mode-plus:move-to-previous-fold-start',
              '] [': 'vim-mode-plus:move-to-next-fold-start',
              '[ ]': 'vim-mode-plus:move-to-previous-fold-end',
              '] ]': 'vim-mode-plus:move-to-next-fold-end'
            }
          });
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage('language-coffee-script');
      });
      describe("MoveToPreviousFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold start row", function() {
          ensure('[ [', {
            cursor: [22, 6]
          });
          ensure('[ [', {
            cursor: [20, 6]
          });
          ensure('[ [', {
            cursor: [18, 4]
          });
          ensure('[ [', {
            cursor: [9, 2]
          });
          return ensure('[ [', {
            cursor: [8, 0]
          });
        });
      });
      describe("MoveToNextFoldStart", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold start row", function() {
          ensure('] [', {
            cursor: [8, 0]
          });
          ensure('] [', {
            cursor: [9, 2]
          });
          ensure('] [', {
            cursor: [18, 4]
          });
          ensure('] [', {
            cursor: [20, 6]
          });
          return ensure('] [', {
            cursor: [22, 6]
          });
        });
      });
      describe("MoveToPrevisFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [30, 0]
          });
        });
        return it("move to first char of previous fold end row", function() {
          ensure('[ ]', {
            cursor: [28, 2]
          });
          ensure('[ ]', {
            cursor: [25, 4]
          });
          ensure('[ ]', {
            cursor: [23, 8]
          });
          return ensure('[ ]', {
            cursor: [21, 8]
          });
        });
      });
      return describe("MoveToNextFoldEnd", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        return it("move to first char of next fold end row", function() {
          ensure('] ]', {
            cursor: [21, 8]
          });
          ensure('] ]', {
            cursor: [23, 8]
          });
          ensure('] ]', {
            cursor: [25, 4]
          });
          return ensure('] ]', {
            cursor: [28, 2]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)String', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g s': 'vim-mode-plus:move-to-next-string',
            'g S': 'vim-mode-plus:move-to-previous-string'
          }
        });
      });
      describe('editor for softTab', function() {
        var pack;
        pack = 'language-coffee-script';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return runs(function() {
            return set({
              text: "disposable?.dispose()\ndisposable = atom.commands.add 'atom-workspace',\n  'check-up': -> fun('backward')\n  'check-down': -> fun('forward')\n\n",
              grammar: 'source.coffee'
            });
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursor: [0, 0]
          });
          ensure('g s', {
            cursor: [1, 31]
          });
          ensure('g s', {
            cursor: [2, 2]
          });
          ensure('g s', {
            cursor: [2, 21]
          });
          ensure('g s', {
            cursor: [3, 2]
          });
          return ensure('g s', {
            cursor: [3, 23]
          });
        });
        it("move to previous string", function() {
          set({
            cursor: [4, 0]
          });
          ensure('g S', {
            cursor: [3, 23]
          });
          ensure('g S', {
            cursor: [3, 2]
          });
          ensure('g S', {
            cursor: [2, 21]
          });
          ensure('g S', {
            cursor: [2, 2]
          });
          return ensure('g S', {
            cursor: [1, 31]
          });
        });
        return it("support count", function() {
          set({
            cursor: [0, 0]
          });
          ensure('3 g s', {
            cursor: [2, 21]
          });
          return ensure('3 g S', {
            cursor: [1, 31]
          });
        });
      });
      return describe('editor for hardTab', function() {
        var pack;
        pack = 'language-go';
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage(pack);
          });
          return getVimState('sample.go', function(state, vimEditor) {
            editor = state.editor, editorElement = state.editorElement;
            return set = vimEditor.set, ensure = vimEditor.ensure, keystroke = vimEditor.keystroke, vimEditor;
          });
        });
        afterEach(function() {
          return atom.packages.deactivatePackage(pack);
        });
        it("move to next string", function() {
          set({
            cursorScreen: [0, 0]
          });
          ensure('g s', {
            cursorScreen: [2, 7]
          });
          ensure('g s', {
            cursorScreen: [3, 7]
          });
          ensure('g s', {
            cursorScreen: [8, 8]
          });
          ensure('g s', {
            cursorScreen: [9, 8]
          });
          ensure('g s', {
            cursorScreen: [11, 20]
          });
          ensure('g s', {
            cursorScreen: [12, 15]
          });
          ensure('g s', {
            cursorScreen: [13, 15]
          });
          ensure('g s', {
            cursorScreen: [15, 15]
          });
          return ensure('g s', {
            cursorScreen: [16, 15]
          });
        });
        return it("move to previous string", function() {
          set({
            cursorScreen: [18, 0]
          });
          ensure('g S', {
            cursorScreen: [16, 15]
          });
          ensure('g S', {
            cursorScreen: [15, 15]
          });
          ensure('g S', {
            cursorScreen: [13, 15]
          });
          ensure('g S', {
            cursorScreen: [12, 15]
          });
          ensure('g S', {
            cursorScreen: [11, 20]
          });
          ensure('g S', {
            cursorScreen: [9, 8]
          });
          ensure('g S', {
            cursorScreen: [8, 8]
          });
          ensure('g S', {
            cursorScreen: [3, 7]
          });
          return ensure('g S', {
            cursorScreen: [2, 7]
          });
        });
      });
    });
    describe('MoveTo(Previous|Next)Number', function() {
      var pack;
      pack = 'language-coffee-script';
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g n': 'vim-mode-plus:move-to-next-number',
            'g N': 'vim-mode-plus:move-to-previous-number'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage(pack);
        });
        runs(function() {
          return set({
            grammar: 'source.coffee'
          });
        });
        return set({
          text: "num1 = 1\narr1 = [1, 101, 1001]\narr2 = [\"1\", \"2\", \"3\"]\nnum2 = 2\nfun(\"1\", 2, 3)\n\n"
        });
      });
      afterEach(function() {
        return atom.packages.deactivatePackage(pack);
      });
      it("move to next number", function() {
        set({
          cursor: [0, 0]
        });
        ensure('g n', {
          cursor: [0, 7]
        });
        ensure('g n', {
          cursor: [1, 8]
        });
        ensure('g n', {
          cursor: [1, 11]
        });
        ensure('g n', {
          cursor: [1, 16]
        });
        ensure('g n', {
          cursor: [3, 7]
        });
        ensure('g n', {
          cursor: [4, 9]
        });
        return ensure('g n', {
          cursor: [4, 12]
        });
      });
      it("move to previous number", function() {
        set({
          cursor: [5, 0]
        });
        ensure('g N', {
          cursor: [4, 12]
        });
        ensure('g N', {
          cursor: [4, 9]
        });
        ensure('g N', {
          cursor: [3, 7]
        });
        ensure('g N', {
          cursor: [1, 16]
        });
        ensure('g N', {
          cursor: [1, 11]
        });
        ensure('g N', {
          cursor: [1, 8]
        });
        return ensure('g N', {
          cursor: [0, 7]
        });
      });
      return it("support count", function() {
        set({
          cursor: [0, 0]
        });
        ensure('5 g n', {
          cursor: [3, 7]
        });
        return ensure('3 g N', {
          cursor: [1, 8]
        });
      });
    });
    return describe('subword motion', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'q': 'vim-mode-plus:move-to-next-subword',
            'Q': 'vim-mode-plus:move-to-previous-subword',
            'ctrl-e': 'vim-mode-plus:move-to-end-of-subword'
          }
        });
      });
      it("move to next/previous subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case|_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake|_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\n|snake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-|case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActerRs\n\n|dash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaRActer|Rs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) ChaR|ActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special) |ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (with |special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase => (|with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase =>| (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camelCase| => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('Q', {
          textC: "camel|Case => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        return ensure('Q', {
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
      });
      return it("move-to-end-of-subword", function() {
        set({
          textC: "|camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "came|lCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCas|e => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase =|> (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => |(with special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (wit|h special) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with specia|l) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special|) ChaRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Ch|aRActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) Cha|RActerRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActe|rRs\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerR|s\n\ndash-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndas|h-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash|-case\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-cas|e\n\nsnake_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnak|e_case_word\n"
        });
        ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_cas|e_word\n"
        });
        return ensure('ctrl-e', {
          textC: "camelCase => (with special) ChaRActerRs\n\ndash-case\n\nsnake_case_wor|d\n"
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1nZW5lcmFsLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsaUJBQVQ7QUFDM0IsUUFBQTtJQUFBLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixDQUEzQjtJQUNBLFNBQUEsR0FBWSxNQUFNLENBQUM7SUFDbkIsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBeEIsR0FDRSxTQUFTLENBQUMsdUJBQVYsQ0FBQSxDQUFBLEdBQXNDLGlCQUFBLEdBQW9CLFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWpGLEdBQXNHO0FBQ3hHLFdBQU8sU0FBUyxDQUFDLG9CQUFWLENBQUE7RUFMb0I7O0VBTzdCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFFBQUE7SUFBQSxPQUE0RCxFQUE1RCxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG1CQUFkLEVBQXlCLGdCQUF6QixFQUFpQyx1QkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBYywwQkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFVBQUE7TUFBQSxJQUFBLEdBQU87TUFD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QUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQVo7TUFuQ2tDLENBQXBDO2FBb0NBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO1FBQzNCLEdBQUEsQ0FBSTtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFKO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7UUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtRQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1VBQUEsS0FBQSxFQUFPLDRFQUFQO1NBQWpCO1FBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7VUFBQSxLQUFBLEVBQU8sNEVBQVA7U0FBakI7ZUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtVQUFBLEtBQUEsRUFBTyw0RUFBUDtTQUFqQjtNQWxCMkIsQ0FBN0I7SUE1Q3lCLENBQTNCO0VBNWpFeUIsQ0FBM0I7QUFYQSIsInNvdXJjZXNDb250ZW50IjpbIntQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xue2dldFZpbVN0YXRlLCBkaXNwYXRjaCwgVGV4dERhdGEsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5zZXRFZGl0b3JXaWR0aEluQ2hhcmFjdGVycyA9IChlZGl0b3IsIHdpZHRoSW5DaGFyYWN0ZXJzKSAtPlxuICBlZGl0b3Iuc2V0RGVmYXVsdENoYXJXaWR0aCgxKVxuICBjb21wb25lbnQgPSBlZGl0b3IuY29tcG9uZW50XG4gIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLndpZHRoID1cbiAgICBjb21wb25lbnQuZ2V0R3V0dGVyQ29udGFpbmVyV2lkdGgoKSArIHdpZHRoSW5DaGFyYWN0ZXJzICogY29tcG9uZW50Lm1lYXN1cmVtZW50cy5iYXNlQ2hhcmFjdGVyV2lkdGggKyBcInB4XCJcbiAgcmV0dXJuIGNvbXBvbmVudC5nZXROZXh0VXBkYXRlUHJvbWlzZSgpXG5cbmRlc2NyaWJlIFwiTW90aW9uIGdlbmVyYWxcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuXG4gIGRlc2NyaWJlIFwic2ltcGxlIG1vdGlvbnNcIiwgLT5cbiAgICB0ZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RcbiAgICAgICAgQUJDREVcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiB0ZXh0LmdldFJhdygpXG4gICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICBkZXNjcmliZSBcInRoZSBoIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGxlZnQsIGJ1dCBub3QgdG8gdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2gnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnaCcsIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBwcmV2aW91cyBsaW5lIGlmIHdyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgICAgZW5zdXJlICdoIGgnLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0aGUgY2hhcmFjdGVyIHRvIHRoZSBsZWZ0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd5IGgnLFxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYSdcblxuICAgIGRlc2NyaWJlIFwidGhlIGoga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGRvd24sIGJ1dCBub3QgdG8gdGhlIGVuZCBvZiB0aGUgbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBsaW5lLCBub3QgcGFzdCBpdFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgM11cblxuICAgICAgaXQgXCJyZW1lbWJlcnMgdGhlIGNvbHVtbiBpdCB3YXMgaW4gYWZ0ZXIgbW92aW5nIHRvIHNob3J0ZXIgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdqJywgY3Vyc29yOiBbMiwgNF1cblxuICAgICAgaXQgXCJuZXZlciBnbyBwYXN0IGxhc3QgbmV3bGluZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJzEgMCBqJywgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJ3YnLCBjdXJzb3I6IFsxLCAyXSwgc2VsZWN0ZWRUZXh0OiAnYidcblxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgZG93blwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnaicsIGN1cnNvcjogWzIsIDJdLCBzZWxlY3RlZFRleHQ6IFwiYmNkXFxuQUJcIlxuXG4gICAgICAgIGl0IFwiZG9lc24ndCBnbyBvdmVyIGFmdGVyIHRoZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2onLCBjdXJzb3I6IFsyLCAyXSwgc2VsZWN0ZWRUZXh0OiBcImJjZFxcbkFCXCJcblxuICAgICAgICBpdCBcImtlZXAgc2FtZSBjb2x1bW4oZ29hbENvbHVtbikgZXZlbiBhZnRlciBhY3Jvc3MgdGhlIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhYmNkZWZnXG5cbiAgICAgICAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJ2ogaicsIGN1cnNvcjogWzIsIDRdLCBzZWxlY3RlZFRleHQ6IFwiZGVmZ1xcblxcbmFiY2RcIlxuXG4gICAgICAgICMgW0ZJWE1FXSB0aGUgcGxhY2Ugb2YgdGhpcyBzcGVjIGlzIG5vdCBhcHByb3ByaWF0ZS5cbiAgICAgICAgaXQgXCJvcmlnaW5hbCB2aXN1YWwgbGluZSByZW1haW5zIHdoZW4gamsgYWNyb3NzIG9yaWduYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAgIGxpbmUwXG4gICAgICAgICAgICBsaW5lMVxuICAgICAgICAgICAgbGluZTJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICAgICAgICAgIGVuc3VyZSAnVicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLCAyXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMCwgMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEsIDJdKVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlLWRvd24td3JhcCwgbW92ZS11cC13cmFwXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnayc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdXAtd3JhcCdcbiAgICAgICAgICAgICdqJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS1kb3duLXdyYXAnXG5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgaGVsbG9cbiAgICAgICAgICBoZWxsb1xuICAgICAgICAgIGhlbGxvXG4gICAgICAgICAgaGVsbG9cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlICdtb3ZlLWRvd24td3JhcCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJ2onLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnMiBqJywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzQgaicsIGN1cnNvcjogWzMsIDFdXG5cbiAgICAgIGRlc2NyaWJlICdtb3ZlLXVwLXdyYXAnLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJ2snLCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBpdCBcIm1vdmUgZG93biB3aXRoIHdyYXdwXCIsIC0+IGVuc3VyZSAnMiBrJywgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgaXQgXCJtb3ZlIGRvd24gd2l0aCB3cmF3cFwiLCAtPiBlbnN1cmUgJzQgaycsIGN1cnNvcjogWzAsIDFdXG5cblxuICAgICMgW05PVEVdIFNlZSAjNTYwXG4gICAgIyBUaGlzIHNwZWMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiBsb2NhbCB0ZXN0LCBub3QgYXQgQ0kgc2VydmljZS5cbiAgICAjIFNhZmUgdG8gZXhlY3V0ZSBpZiBpdCBwYXNzZXMsIGJ1dCBmcmVlemUgZWRpdG9yIHdoZW4gaXQgZmFpbC5cbiAgICAjIFNvIGV4cGxpY2l0bHkgZGlzYWJsZWQgYmVjYXVzZSBJIGRvbid0IHdhbnQgYmUgYmFubmVkIGJ5IENJIHNlcnZpY2UuXG4gICAgIyBFbmFibGUgdGhpcyBvbiBkZW1tYW5kIHdoZW4gZnJlZXppbmcgaGFwcGVucyBhZ2FpbiFcbiAgICB4ZGVzY3JpYmUgXCJ3aXRoIGJpZyBjb3VudCB3YXMgZ2l2ZW5cIiwgLT5cbiAgICAgIEJJR19OVU1CRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxuICAgICAgZW5zdXJlQmlnQ291bnRNb3Rpb24gPSAoa2V5c3Ryb2tlcywgb3B0aW9ucykgLT5cbiAgICAgICAgY291bnQgPSBTdHJpbmcoQklHX05VTUJFUikuc3BsaXQoJycpLmpvaW4oJyAnKVxuICAgICAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5zcGxpdCgnJykuam9pbignICcpXG4gICAgICAgIGVuc3VyZShcIiN7Y291bnR9ICN7a2V5c3Ryb2tlc31cIiwgb3B0aW9ucylcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgeyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdnIH0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICcsIE4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLW51bWJlcidcbiAgICAgICAgICAgICcsIG4nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtbnVtYmVyJ1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMDAwXG4gICAgICAgICAgMTExMVxuICAgICAgICAgIDIyMjJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImJ5IGBqYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdqJywgICBjdXJzb3I6IFsyLCAyXVxuICAgICAgaXQgXCJieSBga2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnaycsICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiYnkgYGhgXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2gnLCAgIGN1cnNvcjogWzEsIDBdXG4gICAgICBpdCBcImJ5IGBsYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdsJywgICBjdXJzb3I6IFsxLCAzXVxuICAgICAgaXQgXCJieSBgW2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnWycsICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGl0IFwiYnkgYF1gXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ10nLCAgIGN1cnNvcjogWzIsIDJdXG4gICAgICBpdCBcImJ5IGB3YFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICd3JywgICBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBgV2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnVycsICAgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYGJgXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2InLCAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGBCYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdCJywgICBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgZWBcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnZScsICAgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiYnkgYChgXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJygnLCAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcImJ5IGApYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcpJywgICBjdXJzb3I6IFsyLCAzXVxuICAgICAgaXQgXCJieSBge2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAneycsICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiYnkgYH1gXCIsICAgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ30nLCAgIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcImJ5IGAtYFwiLCAgIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICctJywgICBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJieSBgX2BcIiwgICAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnXycsICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGl0IFwiYnkgYGcge2BcIiwgLT4gZW5zdXJlQmlnQ291bnRNb3Rpb24gJ2cgeycsIGN1cnNvcjogWzEsIDJdICMgTm8gZm9sZCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGBnIH1gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICdnIH0nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGZvbGQgbm8gbW92ZSBidXQgd29uJ3QgZnJlZXplLlxuICAgICAgaXQgXCJieSBgLCBOYFwiLCAtPiBlbnN1cmVCaWdDb3VudE1vdGlvbiAnLCBOJywgY3Vyc29yOiBbMSwgMl0gIyBObyBncmFtbWFyLCBubyBtb3ZlIGJ1dCB3b24ndCBmcmVlemUuXG4gICAgICBpdCBcImJ5IGAsIG5gXCIsIC0+IGVuc3VyZUJpZ0NvdW50TW90aW9uICcsIG4nLCBjdXJzb3I6IFsxLCAyXSAjIE5vIGdyYW1tYXIsIG5vIG1vdmUgYnV0IHdvbid0IGZyZWV6ZS5cblxuICAgIGRlc2NyaWJlIFwidGhlIGsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHVwXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnaycsIGN1cnNvcjogWzEsIDFdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB1cCBhbmQgcmVtZW1iZXIgY29sdW1uIGl0IHdhcyBpblwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgNF1cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdrJywgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHVwLCBidXQgbm90IHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpcnN0IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgaycsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcImtlZXAgc2FtZSBjb2x1bW4oZ29hbENvbHVtbikgZXZlbiBhZnRlciBhY3Jvc3MgdGhlIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhYmNkZWZnXG5cbiAgICAgICAgICAgICAgYWJjZGVmZ1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzIsIDNdXG4gICAgICAgICAgZW5zdXJlICd2JywgY3Vyc29yOiBbMiwgNF0sIHNlbGVjdGVkVGV4dDogJ2QnXG4gICAgICAgICAgZW5zdXJlICdrIGsnLCBjdXJzb3I6IFswLCAzXSwgc2VsZWN0ZWRUZXh0OiBcImRlZmdcXG5cXG5hYmNkXCJcblxuICAgIGRlc2NyaWJlIFwiZ2ogZ2sgaW4gc29mdHdyYXBcIiwgLT5cbiAgICAgIFt0ZXh0XSA9IFtdXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZWRpdG9yLnNldFNvZnRXcmFwcGVkKHRydWUpXG4gICAgICAgIGVkaXRvci5zZXRFZGl0b3JXaWR0aEluQ2hhcnMoMTApXG4gICAgICAgIGVkaXRvci5zZXREZWZhdWx0Q2hhcldpZHRoKDEpXG4gICAgICAgIHRleHQgPSBuZXcgVGV4dERhdGEgXCJcIlwiXG4gICAgICAgICAgMXN0IGxpbmUgb2YgYnVmZmVyXG4gICAgICAgICAgMm5kIGxpbmUgb2YgYnVmZmVyLCBWZXJ5IGxvbmcgbGluZVxuICAgICAgICAgIDNyZCBsaW5lIG9mIGJ1ZmZlclxuXG4gICAgICAgICAgNXRoIGxpbmUgb2YgYnVmZmVyXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcInNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzY3JlZW4gcG9zaXRpb24gYW5kIGJ1ZmZlciBwb3NpdGlvbiBpcyBkaWZmZXJlbnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzEsIDBdLCBjdXJzb3I6IFswLCA5XVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMiwgMF0sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFszLCAwXSwgY3Vyc29yOiBbMSwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzQsIDBdLCBjdXJzb3I6IFsxLCAxMl1cblxuICAgICAgICBpdCBcImprIG1vdmUgc2VsZWN0aW9uIGJ1ZmZlci1saW5lIHdpc2VcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjBdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMV0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4yXSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjNdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4zXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMV0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4wXSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjBdKSAjIGRvIG5vdGhpbmdcblxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzY3JlZW4gcG9zaXRpb24gYW5kIGJ1ZmZlciBwb3NpdGlvbiBpcyBkaWZmZXJlbnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzEsIDBdLCBjdXJzb3I6IFswLCA5XVxuICAgICAgICAgIGVuc3VyZSAnZyBqJywgY3Vyc29yU2NyZWVuOiBbMiwgMF0sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnIGonLCBjdXJzb3JTY3JlZW46IFszLCAwXSwgY3Vyc29yOiBbMSwgOV1cbiAgICAgICAgICBlbnN1cmUgJ2cgaicsIGN1cnNvclNjcmVlbjogWzQsIDBdLCBjdXJzb3I6IFsxLCAxMl1cblxuICAgICAgICBpdCBcImprIG1vdmUgc2VsZWN0aW9uIGJ1ZmZlci1saW5lIHdpc2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YnLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNF0pXG4gICAgICAgICAgZW5zdXJlICdrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsyLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2snLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaycsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzIuLjRdKVxuICAgICAgICAgIGVuc3VyZSAnaicsIHNlbGVjdGVkVGV4dDogdGV4dC5nZXRMaW5lcyhbMy4uNF0pXG4gICAgICAgICAgZW5zdXJlICdqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFs0Li40XSlcbiAgICAgICAgICBlbnN1cmUgJ2onLCBzZWxlY3RlZFRleHQ6IHRleHQuZ2V0TGluZXMoWzQuLjRdKSAjIGRvIG5vdGhpbmdcblxuICAgIGRlc2NyaWJlIFwidGhlIGwga2V5YmluZGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMDogYWFhYVxuICAgICAgICAgIDE6IGJiYmJcbiAgICAgICAgICAyOiBjY2NjXG5cbiAgICAgICAgICA0OlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHdyYXBMZWZ0UmlnaHRNb3Rpb24gPSBmYWxzZSg9ZGVmYXVsdClcIiwgLT5cbiAgICAgICAgaXQgXCJbbm9ybWFsXSBtb3ZlIHRvIHJpZ2h0LCBjb3VudCBzdXBwb3J0LCBidXQgbm90IHdyYXAgdG8gbmV4dC1saW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAnMiBsJywgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICBlbnN1cmUgJzUgbCcsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlICdsJywgY3Vyc29yOiBbMCwgNl0gIyBubyB3cmFwXG4gICAgICAgIGl0IFwiW25vcm1hbDogYXQtYmxhbmstcm93XSBub3Qgd3JhcCB0byBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2wnLCBjdXJzb3I6IFszLCAwXSwgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICBpdCBcIlt2aXN1YWw6IGF0LWxhc3QtY2hhcl0gY2FuIHNlbGVjdCBuZXdsaW5lIGJ1dCBub3Qgd3JhcCB0byBuZXh0LWxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICBlbnN1cmUgXCJ2XCIsIHNlbGVjdGVkVGV4dDogXCJhXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5pc0F0RW5kT2ZMaW5lKCkpLnRvQmUodHJ1ZSlcbiAgICAgICAgICBlbnN1cmUgXCJsXCIsIHNlbGVjdGVkVGV4dDogXCJhXFxuXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgXCJsXCIsIHNlbGVjdGVkVGV4dDogXCJhXFxuXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgaXQgXCJbdmlzdWFsOiBhdC1ibGFuay1yb3ddIGNhbiBzZWxlY3QgbmV3bGluZSBidXQgbm90IHdyYXAgdG8gbmV4dC1saW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgICAgZW5zdXJlIFwidlwiLCBzZWxlY3RlZFRleHQ6IFwiXFxuXCIsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXSwgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgICBlbnN1cmUgXCJsXCIsIHNlbGVjdGVkVGV4dDogXCJcXG5cIiwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFs0LCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gd3JhcExlZnRSaWdodE1vdGlvbiA9IHRydWVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgaXQgXCJbbm9ybWFsOiBhdC1sYXN0LWNoYXJdIG1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzEsIDBdLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIGl0IFwiW25vcm1hbDogYXQtYmxhbmstcm93XSB3cmFwIHRvIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgIGVuc3VyZSAnbCcsIGN1cnNvcjogWzQsIDBdLCBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgIGl0IFwiW3Zpc3VhbDogYXQtbGFzdC1jaGFyXSBzZWxlY3QgbmV3bGluZSB0aGVuIG1vdmUgdG8gbmV4dC1saW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgZW5zdXJlIFwidlwiLCBzZWxlY3RlZFRleHQ6IFwiYVwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzAsIDddXG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuaXNBdEVuZE9mTGluZSgpKS50b0JlKHRydWUpXG4gICAgICAgICAgZW5zdXJlIFwibFwiLCBzZWxlY3RlZFRleHQ6IFwiYVxcblwiLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ10sIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlIFwibFwiLCBzZWxlY3RlZFRleHQ6IFwiYVxcbjFcIiwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBpdCBcIlt2aXN1YWw6IGF0LWJsYW5rLXJvd10gbW92ZSB0byBuZXh0LWxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBlbnN1cmUgXCJ2XCIsIHNlbGVjdGVkVGV4dDogXCJcXG5cIiwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFs0LCAwXVxuICAgICAgICAgIGVuc3VyZSBcImxcIiwgc2VsZWN0ZWRUZXh0OiBcIlxcbjRcIiwgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddLCBjdXJzb3I6IFs0LCAxXVxuXG4gICAgZGVzY3JpYmUgXCJtb3ZlLSh1cC9kb3duKS10by1lZGdlXCIsIC0+XG4gICAgICB0ZXh0ID0gbnVsbFxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDA6ICA0IDY3ICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIDE6ICAgICAgICAgMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIDI6ICAgIDYgODkwICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDM6ICAgIDYgODkwICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDQ6ICAgNTYgODkwICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDU6ICAgICAgICAgICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDY6ICAgICAgICAgICAgICAgICAgMDEyMzQ1Njc4OVxuICAgICAgICAgIDc6ICA0IDY3ICAgICAgICAgICAgMDEyMzQ1Njc4OVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogdGV4dC5nZXRSYXcoKSwgY3Vyc29yOiBbNCwgM11cblxuICAgICAgZGVzY3JpYmUgXCJlZGdlbmVzcyBvZiBmaXJzdC1saW5lIGFuZCBsYXN0LWxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX19fX3RoaXMgaXMgbGluZSAwXG4gICAgICAgICAgICBfX19fdGhpcyBpcyB0ZXh0IG9mIGxpbmUgMVxuICAgICAgICAgICAgX19fX3RoaXMgaXMgdGV4dCBvZiBsaW5lIDJcbiAgICAgICAgICAgIF9fX19fX2hlbGxvIGxpbmUgM1xuICAgICAgICAgICAgX19fX19faGVsbG8gbGluZSA0XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzIsIDJdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGVuIGNvbHVtbiBpcyBsZWFkaW5nIHNwYWNlc1wiLCAtPlxuICAgICAgICAgIGl0IFwibW92ZSBjdXJzb3IgaWYgaXQncyBzdG9wcGFibGVcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs0LCAyXVxuXG4gICAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yIGlmIGl0J3MgTk9UIHN0b3BwYWJsZVwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgX19cbiAgICAgICAgICAgICAgX19fX3RoaXMgaXMgdGV4dCBvZiBsaW5lIDFcbiAgICAgICAgICAgICAgX19fX3RoaXMgaXMgdGV4dCBvZiBsaW5lIDJcbiAgICAgICAgICAgICAgX19fX19faGVsbG8gbGluZSAzXG4gICAgICAgICAgICAgIF9fX19fX2hlbGxvIGxpbmUgNFxuICAgICAgICAgICAgICBfX1xuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCAyXVxuXG4gICAgICAgIGRlc2NyaWJlIFwid2hlbiBjb2x1bW4gaXMgdHJhaWxpbmcgc3BhY2VzXCIsIC0+XG4gICAgICAgICAgaXQgXCJkb2Vzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFsyLCAyMF1cbiAgICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDIwXVxuICAgICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMSwgMjBdXG4gICAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFsxLCAyMF1cblxuICAgICAgaXQgXCJtb3ZlIHRvIG5vbi1ibGFuay1jaGFyIG9uIGJvdGggZmlyc3QgYW5kIGxhc3Qgcm93XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA0XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA0XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA0XVxuICAgICAgaXQgXCJtb3ZlIHRvIHdoaXRlIHNwYWNlIGNoYXIgd2hlbiBib3RoIHNpZGUgY29sdW1uIGlzIG5vbi1ibGFuayBjaGFyXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCA1XVxuICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs0LCA1XVxuICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3I6IFs3LCA1XVxuICAgICAgaXQgXCJvbmx5IHN0b3BzIG9uIHJvdyBvbmUgb2YgW2ZpcnN0IHJvdywgbGFzdCByb3csIHVwLW9yLWRvd24tcm93IGlzIGJsYW5rXSBjYXNlLTFcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDZdXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzIsIDZdXG4gICAgICAgIGVuc3VyZSAnWycsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzIsIDZdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzQsIDZdXG4gICAgICAgIGVuc3VyZSAnXScsIGN1cnNvcjogWzcsIDZdXG4gICAgICBpdCBcIm9ubHkgc3RvcHMgb24gcm93IG9uZSBvZiBbZmlyc3Qgcm93LCBsYXN0IHJvdywgdXAtb3ItZG93bi1yb3cgaXMgYmxhbmtdIGNhc2UtMlwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgN11cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMiwgN11cbiAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbMiwgN11cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNCwgN11cbiAgICAgICAgZW5zdXJlICddJywgY3Vyc29yOiBbNywgN11cbiAgICAgIGl0IFwic3VwcG9ydCBjb3VudFwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbNCwgNl1cbiAgICAgICAgZW5zdXJlICcyIFsnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgJzMgXScsIGN1cnNvcjogWzcsIDZdXG5cbiAgICAgIGRlc2NyaWJlICdlZGl0b3IgZm9yIGhhcmRUYWInLCAtPlxuICAgICAgICBwYWNrID0gJ2xhbmd1YWdlLWdvJ1xuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5nbycsIChzdGF0ZSwgdmltRWRpdG9yKSAtPlxuICAgICAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltRWRpdG9yXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbOCwgMl1cbiAgICAgICAgICAgICMgSW4gaGFyZFRhYiBpbmRlbnQgYnVmZmVyUG9zaXRpb24gaXMgbm90IHNhbWUgYXMgc2NyZWVuUG9zaXRpb25cbiAgICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFs4LCAxXVxuXG4gICAgICAgIGFmdGVyRWFjaCAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICBpdCBcIm1vdmUgdXAvZG93biB0byBuZXh0IGVkZ2Ugb2Ygc2FtZSAqc2NyZWVuKiBjb2x1bW5cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFs1LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzMsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFswLCAyXVxuXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFszLCAyXVxuICAgICAgICAgIGVuc3VyZSAnXScsIGN1cnNvclNjcmVlbjogWzUsIDJdXG4gICAgICAgICAgZW5zdXJlICddJywgY3Vyc29yU2NyZWVuOiBbOSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsxMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsxNCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ10nLCBjdXJzb3JTY3JlZW46IFsxNywgMl1cblxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzE0LCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzExLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzksIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbNSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ1snLCBjdXJzb3JTY3JlZW46IFszLCAyXVxuICAgICAgICAgIGVuc3VyZSAnWycsIGN1cnNvclNjcmVlbjogWzIsIDJdXG4gICAgICAgICAgZW5zdXJlICdbJywgY3Vyc29yU2NyZWVuOiBbMCwgMl1cblxuICBkZXNjcmliZSAnbW92ZVN1Y2Nlc3NPbkxpbmV3aXNlIGJlaGF2aXJhbCBjaGFyYWN0ZXJpc3RpYycsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMDBcbiAgICAgICAgICAxMTFcbiAgICAgICAgICAyMjJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIG9yaWdpbmFsVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgIGVuc3VyZSByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH1cblxuICAgIGRlc2NyaWJlIFwibW92ZVN1Y2Nlc3NPbkxpbmV3aXNlPWZhbHNlIG1vdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBtb3ZlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGpcIiwgLT4gZW5zdXJlIFwiZCBqXCIsIHRleHQ6IFwiMDAwXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBqXCIsIC0+ICAgZW5zdXJlIFwieSBqXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjExMVxcbjIyMlxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgalwiLCAtPiBlbnN1cmUgXCJjIGpcIiwgdGV4dEM6IFwiMDAwXFxufFxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGtcIiwgLT4gZW5zdXJlIFwiZCBrXCIsIHRleHQ6IFwiMjIyXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBrXCIsIC0+ICAgZW5zdXJlIFwieSBrXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcbjExMVxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkga1wiLCAtPiBlbnN1cmUgXCJjIGtcIiwgdGV4dEM6IFwifFxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLXVwXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGRrXCIsIC0+IGVuc3VyZSBcImQga1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSB5a1wiLCAtPiAgIGVuc3VyZSBcInkga1wiLCB0ZXh0OiBvcmlnaW5hbFRleHQsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogdW5kZWZpbmVkfSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgY2tcIiwgLT4gZW5zdXJlIFwiYyBrXCIsIHRleHRDOiBcInwwMDBcXG4xMTFcXG4yMjJcXG5cIiwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIlxcblwifSwgbW9kZTogJ2luc2VydCcgIyBGSVhNRSwgaW5jb21wYXRpYmxlOiBzaG91ZCByZW1haW4gaW4gbm9ybWFsLlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLWRvd25cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgXCJkZWxldGUgYnkgZGpcIiwgLT4gZW5zdXJlIFwiZCBqXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJ5YW5rIGJ5IHlqXCIsIC0+ICAgZW5zdXJlIFwieSBqXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBjalwiLCAtPiBlbnN1cmUgXCJjIGpcIiwgdGV4dEM6IFwiMDAwXFxuMTExXFxufDIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0JyAjIEZJWE1FLCBpbmNvbXBhdGlibGU6IHNob3VkIHJlbWFpbiBpbiBub3JtYWwuXG5cbiAgICBkZXNjcmliZSBcIm1vdmVTdWNjZXNzT25MaW5ld2lzZT10cnVlIG1vdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBtb3ZlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IEdcIiwgLT4gZW5zdXJlIFwiZCBHXCIsIHRleHQ6IFwiMDAwXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBHXCIsIC0+ICAgZW5zdXJlIFwieSBHXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjExMVxcbjIyMlxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgR1wiLCAtPiBlbnN1cmUgXCJjIEdcIiwgdGV4dEM6IFwiMDAwXFxufFxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMTExXFxuMjIyXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGdnXCIsIC0+IGVuc3VyZSBcImQgZyBnXCIsIHRleHQ6IFwiMjIyXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBnZ1wiLCAtPiAgIGVuc3VyZSBcInkgZyBnXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcbjExMVxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiYyBnIGdcIiwgdGV4dEM6IFwifFxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuMTExXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gaXQgY2FuIG5vdCBtb3ZlLXVwXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IGdnXCIsIC0+IGVuc3VyZSBcImQgZyBnXCIsIHRleHQ6IFwiMTExXFxuMjIyXFxuXCIsIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGl0IFwieWFuayBieSBnZ1wiLCAtPiAgIGVuc3VyZSBcInkgZyBnXCIsIHRleHQ6IG9yaWdpbmFsVGV4dCwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcIjAwMFxcblwifSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgaXQgXCJjaGFuZ2UgYnkgZ2dcIiwgLT4gZW5zdXJlIFwiYyBnIGdcIiwgdGV4dEM6IFwifFxcbjExMVxcbjIyMlxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDAwXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGl0IGNhbiBub3QgbW92ZS1kb3duXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlIGJ5IEdcIiwgLT4gIGVuc3VyZSBcImQgR1wiLCB0ZXh0OiBcIjAwMFxcbjExMVxcblwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcInlhbmsgYnkgR1wiLCAtPiAgICBlbnN1cmUgXCJ5IEdcIiwgdGV4dDogb3JpZ2luYWxUZXh0LCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMjIyXFxuXCJ9LCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICBpdCBcImNoYW5nZSBieSBHXCIsIC0+ICBlbnN1cmUgXCJjIEdcIiwgdGV4dEM6IFwiMDAwXFxuMTExXFxufFxcblwiLCByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMjIyXFxuXCJ9LCBtb2RlOiAnaW5zZXJ0J1xuXG4gIGRlc2NyaWJlIFwidGhlIHcga2V5YmluZGluZ1wiLCAtPlxuICAgIGJhc2VUZXh0ID0gXCJcIlwiXG4gICAgICBhYiBjZGUxKy1cbiAgICAgICB4eXpcblxuICAgICAgemlwXG4gICAgICBcIlwiXCJcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogYmFzZVRleHRcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgIyBXaGVuIHRoZSBjdXJzb3IgZ2V0cyB0byB0aGUgRU9GLCBpdCBzaG91bGQgc3RheSB0aGVyZS5cbiAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHdvcmQgaWYgbGFzdCB3b3JkIGluIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdhYmMnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCB3b3JkIGJ5IHNraXBwaW5nIHRyYWlsaW5nIHdoaXRlIHNwYWNlc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgMDEyfF9fX1xuICAgICAgICAgICAgICAyMzRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3cnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAwMTJfX19cbiAgICAgICAgICAgICAgfDIzNFxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZSB0byBuZXh0IHdvcmQgZnJvbSBFT0xcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIHxcbiAgICAgICAgICAgIF9fMjM0XCJcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3cnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG5cbiAgICAgICAgICAgIF9ffDIzNFwiXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgIyBbRklYTUVdIGltcHJvdmUgc3BlYyB0byBsb29wIHNhbWUgc2VjdGlvbiB3aXRoIGRpZmZlcmVudCB0ZXh0XG4gICAgICBkZXNjcmliZSBcImZvciBDUkxGIGJ1ZmZlclwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IGJhc2VUZXh0LnJlcGxhY2UoL1xcbi9nLCBcIlxcclxcblwiKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgICAgIGVuc3VyZSAndycsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICAgICAgZW5zdXJlICd3JywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgICAgICMgV2hlbiB0aGUgY3Vyc29yIGdldHMgdG8gdGhlIEVPRiwgaXQgc2hvdWxkIHN0YXkgdGhlcmUuXG4gICAgICAgICAgICBlbnN1cmUgJ3cnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZWQgYnkgQ2hhbmdlIG9wZXJhdG9yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX3ZhcjEgPSAxXG4gICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJub3QgZWF0IHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2MgdycsXG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICBfX3YgPSAxXG4gICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgaXQgXCJvbmx5IGVhdCB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnYyB3JyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIHZhcjEgPSAxXG4gICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0ZXh0IHRvIEVPTCBpcyBhbGwgd2hpdGUgc3BhY2VcIiwgLT5cbiAgICAgICAgaXQgXCJ3b250IGVhdCBuZXcgbGluZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIGFiY19fXG4gICAgICAgICAgICBkZWZcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2MgdycsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgICAgaXQgXCJjYW50IGVhdCBuZXcgbGluZSB3aGVuIGNvdW50IGlzIHNwZWNpZmllZFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIlxcblxcblxcblxcblxcbmxpbmU2XFxuXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICc1IGMgdycsIHRleHQ6IFwiXFxubGluZTZcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSB3JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYiAnXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdGhlIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgdycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnICdcblxuICBkZXNjcmliZSBcInRoZSBXIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJjZGUxKy0gYWIgXFxuIHh5elxcblxcbnppcFwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzAsIDddXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzMsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZCBvZiBuZXh0IGxpbmUgd2hlbiBhbGwgcmVtYWluaW5nIHRleHQgaXMgd2hpdGUgc3BhY2UuXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMl9fX1xuICAgICAgICAgICAgX18yMzRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZCBvZiBuZXh0IGxpbmUgd2hlbiBjdXJzb3IgaXMgYXQgRU9MLlwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG5cbiAgICAgICAgICBfXzIzNFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnVycsIGN1cnNvcjogWzEsIDJdXG5cbiAgICAjIFRoaXMgc3BlYyBpcyByZWR1bmRhbnQgc2luY2UgVyhNb3ZlVG9OZXh0V2hvbGVXb3JkKSBpcyBjaGlsZCBvZiB3KE1vdmVUb05leHRXb3JkKS5cbiAgICBkZXNjcmliZSBcIndoZW4gdXNlZCBieSBDaGFuZ2Ugb3BlcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgX192YXIxID0gMVxuICAgICAgICAgICAgX192YXIyID0gMlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gd29yZFwiLCAtPlxuICAgICAgICBpdCBcIm5vdCBlYXQgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGVuc3VyZSAnYyBXJyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgICAgX192ID0gMVxuICAgICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBpdCBcIm9ubHkgZWF0IHdoaXRlIHNwYWNlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdjIFcnLFxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgICB2YXIxID0gMVxuICAgICAgICAgICAgICBfX3ZhcjIgPSAyXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRleHQgdG8gRU9MIGlzIGFsbCB3aGl0ZSBzcGFjZVwiLCAtPlxuICAgICAgICBpdCBcIndvbnQgZWF0IG5ldyBsaW5lIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcImFiYyAgXFxuZGVmXFxuXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgZW5zdXJlICdjIFcnLCB0ZXh0OiBcImFiY1xcbmRlZlxcblwiLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgICAgIGl0IFwiY2FudCBlYXQgbmV3IGxpbmUgd2hlbiBjb3VudCBpcyBzcGVjaWZpZWRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJcXG5cXG5cXG5cXG5cXG5saW5lNlxcblwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnNSBjIFcnLCB0ZXh0OiBcIlxcbmxpbmU2XFxuXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhpbiBhIHdvcmRcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIHdob2xlIHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgVycsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnY2RlMSstICdcblxuICAgICAgaXQgXCJjb250aW51ZXMgcGFzdCBibGFuayBsaW5lc1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICdkIFcnLFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBjZGUxKy0gYWJfXG4gICAgICAgICAgX3h5elxuICAgICAgICAgIHppcFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIlxcblwiXG5cbiAgICAgIGl0IFwiZG9lc24ndCBnbyBwYXN0IHRoZSBlbmQgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDBdXG4gICAgICAgIGVuc3VyZSAnZCBXJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgY2RlMSstIGFiX1xuICAgICAgICAgIF94eXpcXG5cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ3ppcCdcblxuICBkZXNjcmliZSBcInRoZSBlIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgYWIgY2RlMSstX1xuICAgICAgX3h5elxuXG4gICAgICB6aXBcbiAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFszLCAyXVxuXG4gICAgICBpdCBcInNraXBzIHdoaXRlc3BhY2UgdW50aWwgRU9GXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMDEyXFxuXFxuXFxuMDEyXFxuXFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBlbnN1cmUgJ2UnLCBjdXJzb3I6IFs0LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICd5IGUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiJ1xuXG4gICAgICBkZXNjcmliZSBcImJldHdlZW4gd29yZHNcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgICAgIGVuc3VyZSAneSBlJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgY2RlMSdcblxuICBkZXNjcmliZSBcInRoZSBnZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNCA1Njc4IHdvcmR3b3JkXCIsIGN1cnNvcjogWzAsIDE2XVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwibW92ZXMgY29ycmVudGx5IHdoZW4gc3RhcnRpbmcgYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxIGxlYWRpbmcgICAgIGVuZFwiLCBjdXJzb3I6IFswLCAxMl1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgICBpdCBcInRha2VzIGEgY291bnRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwidmltIG1vZGUgcGx1cyBpcyBnZXR0aW5nIHRoZXJlXCIsIGN1cnNvcjogWzAsIDI4XVxuICAgICAgICBlbnN1cmUgJzUgZyBlJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgIyB0ZXN0IHdpbGwgZmFpbCB1bnRpbCB0aGUgY29kZSBpcyBmaXhlZFxuICAgICAgeGl0IFwiaGFuZGxlcyBub24td29yZHMgaW5zaWRlIHdvcmRzIGxpa2UgdmltXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQgNTY3OCB3b3JkLXdvcmRcIiwgY3Vyc29yOiBbMCwgMThdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMTRdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMTNdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgOF1cblxuICAgICAgIyB0ZXN0IHdpbGwgZmFpbCB1bnRpbCB0aGUgY29kZSBpcyBmaXhlZFxuICAgICAgeGl0IFwiaGFuZGxlcyBuZXdsaW5lcyBsaWtlIHZpbVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0XFxuXFxuXFxuXFxuNTY3OFwiLCBjdXJzb3I6IFs1LCAyXVxuICAgICAgICAjIHZpbSBzZWVtcyB0byB0aGluayBhbiBlbmQtb2Ytd29yZCBpcyBhdCBldmVyeSBibGFuayBsaW5lXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbNCwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdnIGUnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgZScsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGVuc3VyZSAnZyBlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VkIGJ5IENoYW5nZSBvcGVyYXRvclwiLCAtPlxuICAgICAgaXQgXCJjaGFuZ2VzIHdvcmQgZnJhZ21lbnRzXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcImNldCBkb2N1bWVudFwiLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ2MgZyBlJywgY3Vyc29yOiBbMCwgMl0sIHRleHQ6IFwiY2VtZW50XCIsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICMgVE9ETzogSSdtIG5vdCBzdXJlIGhvdyB0byBjaGVjayB0aGUgcmVnaXN0ZXIgYWZ0ZXIgY2hlY2tpbmcgdGhlIGRvY3VtZW50XG4gICAgICAgICMgZW5zdXJlIHJlZ2lzdGVyOiAnXCInLCB0ZXh0OiAndCBkb2N1J1xuXG4gICAgICBpdCBcImNoYW5nZXMgd2hpdGVzcGFjZSBwcm9wZXJseVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJjZSAgICBkb2NcIiwgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgZW5zdXJlICdjIGcgZScsIGN1cnNvcjogWzAsIDFdLCB0ZXh0OiBcImMgZG9jXCIsIG1vZGU6ICdpbnNlcnQnXG5cbiAgICBkZXNjcmliZSBcImluIGNoYXJhY3Rlcndpc2UgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB3b3JkIGZyYWdtZW50c1wiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJjZXQgZG9jdW1lbnRcIiwgY3Vyc29yOiBbMCwgN11cbiAgICAgICAgZW5zdXJlICd2IGcgZScsIGN1cnNvcjogWzAsIDJdLCBzZWxlY3RlZFRleHQ6IFwidCBkb2N1XCJcblxuICBkZXNjcmliZSBcInRoZSBFIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgYWIgIGNkZTErLV9cbiAgICAgIF94eXpfXG5cbiAgICAgIHppcFxcblxuICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzAsIDldXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzMsIDJdXG4gICAgICAgIGVuc3VyZSAnRScsIGN1cnNvcjogWzMsIDJdXG5cbiAgICBkZXNjcmliZSBcImFzIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRoaW4gYSB3b3JkXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgRScsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWInXG5cbiAgICAgIGRlc2NyaWJlIFwiYmV0d2VlbiB3b3Jkc1wiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgbmV4dCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd5IEUnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJyAgY2RlMSstJ1xuXG4gICAgICBkZXNjcmliZSBcInByZXNzIG1vcmUgdGhhbiBvbmNlXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3YgRSBFIHknLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiICBjZGUxKy0nXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ0Uga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBwcmV2aW91cyB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyLjQgNX43LSB3b3JkLXdvcmRcIiwgY3Vyc29yOiBbMCwgMTZdXG4gICAgICAgIGVuc3VyZSAnZyBFJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgICAgZW5zdXJlICdnIEUnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgRScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBFJywgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSAoLCkgc2VudGVuY2Uga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBzZW50ZW5jZSBvbmUuXSknXCIgICAgc2VuLnRlbmNlIC50d28uXG4gICAgICAgICAgaGVyZS4gIHNlbnRlbmNlIHRocmVlXG4gICAgICAgICAgbW9yZSB0aHJlZVxuXG4gICAgICAgICAgICAgc2VudGVuY2UgZm91clxuXG5cbiAgICAgICAgICBzZW50ZW5jZSBmaXZlLlxuICAgICAgICAgIG1vcmUgZml2ZVxuICAgICAgICAgIG1vcmUgc2l4XG5cbiAgICAgICAgICAgbGFzdCBzZW50ZW5jZVxuICAgICAgICAgIGFsbCBkb25lIHNldmVuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZW5kIG9mIHRoZSBzZW50ZW5jZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFswLCAyMV1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMSwgN11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgZW5zdXJlICcpJywgY3Vyc29yOiBbNSwgMF0gIyBib3VuZGFyeSBpcyBkaWZmZXJlbnQgYnkgZGlyZWN0aW9uXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEwLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMSwgMV1cblxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxMiwgMTNdXG4gICAgICAgIGVuc3VyZSAnKScsIGN1cnNvcjogWzEyLCAxM11cblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxMSwgMV1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbMTAsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgIGVuc3VyZSAnKCcsIGN1cnNvcjogWzYsIDBdICMgYm91bmRhcnkgaXMgZGlmZmVyZW50IGJ5IGRpcmVjdGlvblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFs0LCAzXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFszLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAyMV1cblxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInNraXBzIHRvIGJlZ2lubmluZyBvZiBzZW50ZW5jZVwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFs0LCAxNV1cbiAgICAgICAgZW5zdXJlICcoJywgY3Vyc29yOiBbNCwgM11cblxuICAgICAgaXQgXCJzdXBwb3J0cyBhIGNvdW50XCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczICknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICBlbnN1cmUgJzMgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY2FuIG1vdmUgc3RhcnQgb2YgYnVmZmVyIG9yIGVuZCBvZiBidWZmZXIgYXQgbWF4aW11bVwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcyIDAgKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgZW5zdXJlICcyIDAgKCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwic2VudGVuY2UgbW90aW9uIHdpdGggc2tpcC1ibGFuay1yb3dcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICAgJ2cgKSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1zZW50ZW5jZS1za2lwLWJsYW5rLXJvdydcbiAgICAgICAgICAgICAgJ2cgKCc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtc2VudGVuY2Utc2tpcC1ibGFuay1yb3cnXG5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFswLCAyMV1cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbNCwgM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzcsIDBdXG4gICAgICAgICAgZW5zdXJlICdnICknLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyApJywgY3Vyc29yOiBbMTEsIDFdXG5cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEyLCAxM11cbiAgICAgICAgICBlbnN1cmUgJ2cgKScsIGN1cnNvcjogWzEyLCAxM11cblxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMTEsIDFdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFs4LCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzQsIDNdXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFsxLCA3XVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgKCcsIGN1cnNvcjogWzAsIDIxXVxuXG4gICAgICAgICAgZW5zdXJlICdnICgnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZyAoJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwibW92aW5nIGluc2lkZSBhIGJsYW5rIGRvY3VtZW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX19fX1xuICAgICAgICAgIF9fX19fXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwibW92ZXMgd2l0aG91dCBjcmFzaGluZ1wiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgJyknLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJygnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJzZW50ZW5jZSBvbmUuIHNlbnRlbmNlIHR3by5cXG4gIHNlbnRlbmNlIHRocmVlLlwiXG5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgc2VudGVuY2UnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMjBdXG4gICAgICAgIGVuc3VyZSAneSApJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiY2UgdHdvLlxcbiAgXCJcblxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY3VycmVudCBzZW50ZW5jZScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyMF1cbiAgICAgICAgZW5zdXJlICd5ICgnLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJzZW50ZW5cIlxuXG4gIGRlc2NyaWJlIFwidGhlIHssfSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuXG5cblxuICAgICAgICAzOiBwYXJhZ3JhcGgtMVxuICAgICAgICA0OiBwYXJhZ3JhcGgtMVxuXG5cblxuICAgICAgICA4OiBwYXJhZ3JhcGgtMlxuXG5cblxuICAgICAgICAxMjogcGFyYWdyYXBoLTNcbiAgICAgICAgMTM6IHBhcmFncmFwaC0zXG5cblxuICAgICAgICAxNjogcGFyYWdwcmFoLTRcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzUsIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzksIDBdXG4gICAgICAgIGVuc3VyZSAnfScsIGN1cnNvcjogWzE0LCAwXVxuICAgICAgICBlbnN1cmUgJ3snLCBjdXJzb3I6IFsxMSwgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbNywgMF1cbiAgICAgICAgZW5zdXJlICd7JywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICczIH0nLCBjdXJzb3I6IFsxNCwgMF1cbiAgICAgICAgZW5zdXJlICczIHsnLCBjdXJzb3I6IFsyLCAwXVxuXG4gICAgICBpdCBcImNhbiBtb3ZlIHN0YXJ0IG9mIGJ1ZmZlciBvciBlbmQgb2YgYnVmZmVyIGF0IG1heGltdW1cIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMSAwIH0nLCBjdXJzb3I6IFsxNiwgMTRdXG4gICAgICAgIGVuc3VyZSAnMSAwIHsnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGVuZCBvZiB0aGUgY3VycmVudCBwYXJhZ3JhcGgnLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlICd5IH0nLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJwYXJhZ3JhcGgtMVxcbjQ6IHBhcmFncmFwaC0xXFxuXCJcbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgcGFyYWdyYXBoJywgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDNdXG4gICAgICAgIGVuc3VyZSAneSB7JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiXFxuMzogcGFyYWdyYXBoLTFcXG40OiBcIlxuXG4gIGRlc2NyaWJlIFwidGhlIGIga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfYWIgY2RlMSstX1xuICAgICAgICBfeHl6XG5cbiAgICAgICAgemlwIH1cbiAgICAgICAgX3xsYXN0XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHByZXZpb3VzIHdvcmRcIiwgLT5cbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIGFiIGNkZTErLSBcXG4geHl6XFxuXFxuemlwIHx9XFxuIGxhc3RcIlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgYWIgY2RlMSstIFxcbiB4eXpcXG5cXG58emlwIH1cXG4gbGFzdFwiXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiBhYiBjZGUxKy0gXFxuIHh5elxcbnxcXG56aXAgfVxcbiBsYXN0XCJcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIGFiIGNkZTErLSBcXG4gfHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuICAgICAgICBlbnN1cmUgJ2InLCB0ZXh0QzogXCIgYWIgY2RlMXwrLSBcXG4geHl6XFxuXFxuemlwIH1cXG4gbGFzdFwiXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcIiBhYiB8Y2RlMSstIFxcbiB4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcbiAgICAgICAgZW5zdXJlICdiJywgdGV4dEM6IFwiIHxhYiBjZGUxKy0gXFxuIHh5elxcblxcbnppcCB9XFxuIGxhc3RcIlxuXG4gICAgICAgICMgR28gdG8gc3RhcnQgb2YgdGhlIGZpbGUsIGFmdGVyIG1vdmluZyBwYXN0IHRoZSBmaXJzdCB3b3JkXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcInwgYWIgY2RlMSstIFxcbiB4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcbiAgICAgICAgIyBEbyBub3RoaW5nXG4gICAgICAgIGVuc3VyZSAnYicsIHRleHRDOiBcInwgYWIgY2RlMSstIFxcbiB4eXpcXG5cXG56aXAgfVxcbiBsYXN0XCJcblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aGluIGEgd29yZFwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY3VycmVudCB3b3JkXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIiBhfGIgY2RcIjsgZW5zdXJlICd5IGInLCB0ZXh0QzogXCIgfGFiIGNkXCIsIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYSdcblxuICAgICAgZGVzY3JpYmUgXCJiZXR3ZWVuIHdvcmRzXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsYXN0IHdvcmRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiIGFiIHxjZFwiOyBlbnN1cmUgJ3kgYicsIHRleHRDOiBcIiB8YWIgY2RcIiwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYiAnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgQiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGNkZTErLSBhYlxuICAgICAgICAgIFxcdCB4eXotMTIzXG5cbiAgICAgICAgICAgemlwXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFs0LCAwXVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgcHJldmlvdXMgd29yZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFswLCA3XVxuICAgICAgICBlbnN1cmUgJ0InLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHdob2xlIHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDhdXG4gICAgICAgIGVuc3VyZSAneSBCJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICd4eXotMTInICMgYmVjYXVzZSBjdXJzb3IgaXMgb24gdGhlIGAzYFxuXG4gICAgICBpdCBcImRvZXNuJ3QgZ28gcGFzdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmMnXG4gICAgICAgIGVuc3VyZSAneSBCJywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdhYmMnXG5cbiAgZGVzY3JpYmUgXCJ0aGUgXiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRDOiBcInwgIGFiY2RlXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdeJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCAnc2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lJywgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgXicsIHRleHQ6ICdhYmNkZScsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBJJywgdGV4dDogJ2FiY2RlJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic3RheXMgcHV0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdeJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRvZXMgbm90aGluZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBeJyxcbiAgICAgICAgICAgIHRleHQ6ICcgIGFiY2RlJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgd29yZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXicsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIF4nLFxuICAgICAgICAgICAgdGV4dDogJyAgY2RlJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgaXQgJ3NlbGVjdHMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbGluZScsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIEknLCB0ZXh0OiAnICBjZGUnLCBjdXJzb3I6IFswLCAyXSxcblxuICBkZXNjcmliZSBcInRoZSAwIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dEM6IFwiICBhYnxjZGVcIlxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjb2x1bW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICcwJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0ICdzZWxlY3RzIHRvIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGhlIGxpbmUnLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMCcsIHRleHQ6ICdjZGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwiZyAwLCBnIF4gYW5kIGcgJFwiLCAtPlxuICAgIGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlID0gLT5cbiAgICAgIGVkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKVxuICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdygwKSkudG9CZShcIiAxMjM0NTY3XCIpXG4gICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KDEpKS50b0JlKFwiIDg5QjEyMzRcIikgIyBmaXJzdCBzcGFjZSBpcyBzb2Z0d3JhcCBpbmRlbnRhdGlvblxuICAgICAgZXhwZWN0KGVkaXRvci5saW5lVGV4dEZvclNjcmVlblJvdygyKSkudG9CZShcIiA1Njc4OUMxXCIpICMgZmlyc3Qgc3BhY2UgaXMgc29mdHdyYXAgaW5kZW50YXRpb25cbiAgICAgIGV4cGVjdChlZGl0b3IubGluZVRleHRGb3JTY3JlZW5Sb3coMykpLnRvQmUoXCIgMjM0NTY3OFwiKSAjIGZpcnN0IHNwYWNlIGlzIHNvZnR3cmFwIGluZGVudGF0aW9uXG4gICAgICBleHBlY3QoZWRpdG9yLmxpbmVUZXh0Rm9yU2NyZWVuUm93KDQpKS50b0JlKFwiIDlcIikgIyBmaXJzdCBzcGFjZSBpcyBzb2Z0d3JhcCBpbmRlbnRhdGlvblxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgIyBGb3JjZSBzY3JvbGxiYXJzIHRvIGJlIHZpc2libGUgcmVnYXJkbGVzcyBvZiBsb2NhbCBzeXN0ZW0gY29uZmlndXJhdGlvblxuICAgICAgc2Nyb2xsYmFyU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICBzY3JvbGxiYXJTdHlsZS50ZXh0Q29udGVudCA9ICc6Oi13ZWJraXQtc2Nyb2xsYmFyIHsgLXdlYmtpdC1hcHBlYXJhbmNlOiBub25lIH0nXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHNjcm9sbGJhclN0eWxlKVxuXG5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICBfMTIzNDU2Nzg5QjEyMzQ1Njc4OUMxMjM0NTY3ODlcbiAgICAgIFwiXCJcIlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShnZXRWaWV3KGF0b20ud29ya3NwYWNlKSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBzZXRFZGl0b3JXaWR0aEluQ2hhcmFjdGVycyhlZGl0b3IsIDEwKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgZyAwIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBjb2x1bW4gMCBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gZmFsc2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAxNV07IGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Db2x1bW4oMTApXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgMFwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSgpXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgMFwiLCBjdXJzb3JTY3JlZW46IFswLCAwXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgZmFsc2UpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBjb2x1bW4gMCBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGZpcnN0Q29sdW1uSXNWaXNpYmxlID0gZmFsc2VcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAxNV07IGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Db2x1bW4oMTApXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0IHZpc2libGUgY29sdW0gb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAwXCIsIGN1cnNvcjogWzAsIDEwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSB0cnVlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBlbmFibGVTb2Z0V3JhcEFuZEVuc3VyZSgpXG4gICAgICAgICAgaXQgXCJtb3ZlIHRvIGNvbHVtbiAwIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgMFwiLCBjdXJzb3JTY3JlZW46IFswLCAwXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIDBcIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgZyBeIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24gPSB0cnVlKGRlZmF1bHQpXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdhbGxvd01vdmVUb09mZlNjcmVlbkNvbHVtbk9uU2NyZWVuTGluZU1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgXlwiLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgZmlyc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yOiBbMCwgMV1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gZW5hYmxlU29mdFdyYXBBbmRFbnN1cmUoKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgXlwiLCBjdXJzb3JTY3JlZW46IFswLCAxXVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yU2NyZWVuOiBbMSwgMV0gIyBza2lwIHNvZnR3cmFwIGluZGVudGF0aW9uLlxuXG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgZmFsc2UpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBmaXJzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIGl0IFwibW92ZSB0byBmaXJzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgXlwiLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgZmlyc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yOiBbMCwgMTBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlKClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gZmlyc3QtY2hhciBvZiBzY3JlZW4gbGluZVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzAsIDNdOyBlbnN1cmUgXCJnIF5cIiwgY3Vyc29yU2NyZWVuOiBbMCwgMV1cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFsxLCAzXTsgZW5zdXJlIFwiZyBeXCIsIGN1cnNvclNjcmVlbjogWzEsIDFdICMgc2tpcCBzb2Z0d3JhcCBpbmRlbnRhdGlvbi5cblxuICAgIGRlc2NyaWJlIFwidGhlIGcgJCBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gdHJ1ZShkZWZhdWx0KVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+IHNldHRpbmdzLnNldCgnYWxsb3dNb3ZlVG9PZmZTY3JlZW5Db2x1bW5PblNjcmVlbkxpbmVNb3Rpb24nLCB0cnVlKVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgbGFzdENvbHVtbklzVmlzaWJsZSA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAyN11cbiAgICAgICAgICBpdCBcIm1vdmUgdG8gbGFzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgJFwiLCBjdXJzb3I6IFswLCAyOV1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gZmFsc2UsIGxhc3RDb2x1bW5Jc1Zpc2libGUgPSBmYWxzZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDE1XTsgZWRpdG9yLnNldEZpcnN0VmlzaWJsZVNjcmVlbkNvbHVtbigxMClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gbGFzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+IGVuc3VyZSBcImcgJFwiLCBjdXJzb3I6IFswLCAyOV1cblxuICAgICAgICBkZXNjcmliZSBcInNvZnR3cmFwID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gZW5hYmxlU29mdFdyYXBBbmRFbnN1cmUoKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3JTY3JlZW46IFswLCAzXTsgZW5zdXJlIFwiZyAkXCIsIGN1cnNvclNjcmVlbjogWzAsIDddXG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMSwgM107IGVuc3VyZSBcImcgJFwiLCBjdXJzb3JTY3JlZW46IFsxLCA3XVxuXG4gICAgICBkZXNjcmliZSBcImFsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uID0gZmFsc2VcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXR0aW5ncy5zZXQoJ2FsbG93TW92ZVRvT2ZmU2NyZWVuQ29sdW1uT25TY3JlZW5MaW5lTW90aW9uJywgZmFsc2UpXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IGZhbHNlLCBsYXN0Q29sdW1uSXNWaXNpYmxlID0gdHJ1ZVwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IGN1cnNvcjogWzAsIDI3XVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgb2Ygc2NyZWVuIGxpbmVcIiwgLT4gZW5zdXJlIFwiZyAkXCIsIGN1cnNvcjogWzAsIDI5XVxuXG4gICAgICAgIGRlc2NyaWJlIFwic29mdHdyYXAgPSBmYWxzZSwgbGFzdENvbHVtbklzVmlzaWJsZSA9IGZhbHNlXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMCwgMTVdOyBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuQ29sdW1uKDEwKVxuICAgICAgICAgIGl0IFwibW92ZSB0byBsYXN0LWNoYXIgaW4gdmlzaWJsZSBzY3JlZW4gbGluZVwiLCAtPiBlbnN1cmUgXCJnICRcIiwgY3Vyc29yOiBbMCwgMThdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzb2Z0d3JhcCA9IHRydWVcIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+IGVuYWJsZVNvZnRXcmFwQW5kRW5zdXJlKClcbiAgICAgICAgICBpdCBcIm1vdmUgdG8gbGFzdC1jaGFyIG9mIHNjcmVlbiBsaW5lXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMCwgM107IGVuc3VyZSBcImcgJFwiLCBjdXJzb3JTY3JlZW46IFswLCA3XVxuICAgICAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzEsIDNdOyBlbnN1cmUgXCJnICRcIiwgY3Vyc29yU2NyZWVuOiBbMSwgN11cblxuICBkZXNjcmliZSBcInRoZSB8IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIgIGFiY2RlXCIsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIG51bWJlciBjb2x1bW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICd8JywgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzEgfCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnMyB8JywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICc0IHwnLCBjdXJzb3I6IFswLCAzXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBvcGVyYXRvcidzIHRhcmdldFwiLCAtPlxuICAgICAgaXQgJ2JlaGF2ZSBleGNsdXNpdmVseScsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgNCB8JywgdGV4dDogJ2JjZGUnLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlICQga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIiAgYWJjZGVcXG5cXG4xMjM0NTY3ODkwXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb24gZnJvbSBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJyQnLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgIyBGSVhNRTogU2VlIGF0b20vdmltLW1vZGUjMlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMCwgNl1cblxuICAgICAgaXQgXCJzZXQgZ29hbENvbHVtbiBJbmZpbml0eVwiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKG51bGwpXG4gICAgICAgIGVuc3VyZSAnJCcsIGN1cnNvcjogWzAsIDZdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG5cbiAgICAgIGl0IFwic2hvdWxkIHJlbWFpbiBpbiB0aGUgbGFzdCBjb2x1bW4gd2hlbiBtb3ZpbmcgZG93blwiLCAtPlxuICAgICAgICBlbnN1cmUgJyQgaicsIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnaicsICAgY3Vyc29yOiBbMiwgOV1cblxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMyAkJywgY3Vyc29yOiBbMiwgOV1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZW5kIG9mIHRoZSBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgJCcsXG4gICAgICAgICAgdGV4dDogXCIgIGFiXFxuXFxuMTIzNDU2Nzg5MFwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICBkZXNjcmliZSBcInRoZSAtIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCJcIlwiXG4gICAgICAgIGFiY2RlZmdcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBhYmNcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIG1pZGRsZSBvZiBhIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgbGFzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBhbmQgcHJldmlvdXMgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAtJywgdGV4dDogXCIgIGFiY1xcblwiLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYSBsaW5lIGluZGVudGVkIHRoZSBzYW1lIGFzIHRoZSBwcmV2aW91cyBvbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lIChkaXJlY3RseSBhYm92ZSlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lIChkaXJlY3RseSBhYm92ZSlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgLScsIHRleHQ6IFwiYWJjZGVmZ1xcblwiXG4gICAgICAgICAgIyBGSVhNRSBjb21tZW50ZWQgb3V0IGJlY2F1c2UgdGhlIGNvbHVtbiBpcyB3cm9uZyBkdWUgdG8gYSBidWcgaW4gYGtgOyByZS1lbmFibGUgd2hlbiBga2AgaXMgZml4ZWRcbiAgICAgICAgICAjIGVuc3VyZSBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5lIHByZWNlZGVkIGJ5IGFuIGluZGVudGVkIGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHByZXZpb3VzIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJy0nLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBwcmV2aW91cyBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIC0nLCB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgY291bnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhhdCBtYW55IGxpbmVzIHByZXZpb3VzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICczIC0nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIHBsdXMgdGhhdCBtYW55IHByZXZpb3VzIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgLScsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG42XFxuXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXSxcblxuICBkZXNjcmliZSBcInRoZSArIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dF86IFwiXCJcIlxuICAgICAgX19hYmNcbiAgICAgIF9fYWJjXG4gICAgICBhYmNkZWZnXFxuXG4gICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmV4dCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcrJywgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgYW5kIG5leHQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJywgdGV4dDogXCIgIGFiY1xcblwiXG5cbiAgICBkZXNjcmliZSBcImZyb20gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhIGxpbmUgaW5kZW50ZWQgdGhlIHNhbWUgYXMgdGhlIG5leHQgb25lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgbmV4dCBsaW5lIChkaXJlY3RseSBiZWxvdylcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmUgKGRpcmVjdGx5IGJlbG93KVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCArJywgdGV4dDogXCJhYmNkZWZnXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgYmVnaW5uaW5nIG9mIGEgbGluZSBmb2xsb3dlZCBieSBhbiBpbmRlbnRlZCBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJysnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwic2VsZWN0cyB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBuZXh0IGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgKycsXG4gICAgICAgICAgICB0ZXh0OiBcImFiY2RlZmdcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMVxcbjJcXG4zXFxuNFxcbjVcXG42XFxuXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoYXQgbWFueSBsaW5lcyBmb2xsb3dpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzMgKycsIGN1cnNvcjogWzQsIDBdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgcGx1cyB0aGF0IG1hbnkgZm9sbG93aW5nIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIDMgKycsXG4gICAgICAgICAgICB0ZXh0OiBcIjFcXG42XFxuXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgXyBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHRfOiBcIlwiXCJcbiAgICAgICAgX19hYmNcbiAgICAgICAgX19hYmNcbiAgICAgICAgYWJjZGVmZ1xcblxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgbWlkZGxlIG9mIGEgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPiBzZXQgY3Vyc29yOiBbMSwgM11cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdfJywgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBfJyxcbiAgICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICAgIF9fYWJjXG4gICAgICAgICAgICBhYmNkZWZnXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBjb3VudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcblwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGF0IG1hbnkgbGluZXMgZm9sbG93aW5nXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICczIF8nLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImFzIGEgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY3VycmVudCBsaW5lIHBsdXMgdGhhdCBtYW55IGZvbGxvd2luZyBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCAzIF8nLFxuICAgICAgICAgICAgdGV4dDogXCIxXFxuNVxcbjZcXG5cIlxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBlbnRlciBrZXliaW5kaW5nXCIsIC0+XG4gICAgIyBbRklYTUVdIERpcnR5IHRlc3QsIHdoYXRzIHRoaXMhP1xuICAgIHN0YXJ0aW5nVGV4dCA9IFwiICBhYmNcXG4gIGFiY1xcbmFiY2RlZmdcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBtaWRkbGUgb2YgYSBsaW5lXCIsIC0+XG4gICAgICBzdGFydGluZ0N1cnNvclBvc2l0aW9uID0gWzEsIDNdXG5cbiAgICAgIGRlc2NyaWJlIFwiYXMgYSBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJhY3RzIHRoZSBzYW1lIGFzIHRoZSArIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgICAgICAjIGRvIGl0IHdpdGggKyBhbmQgc2F2ZSB0aGUgcmVzdWx0c1xuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBrZXlzdHJva2UgJysnXG4gICAgICAgICAgcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogc3RhcnRpbmdUZXh0XG4gICAgICAgICAgICBjdXJzb3I6IHN0YXJ0aW5nQ3Vyc29yUG9zaXRpb25cbiAgICAgICAgICBlbnN1cmUgJ2VudGVyJyxcbiAgICAgICAgICAgIGN1cnNvcjogcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb25cblxuICAgICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImFjdHMgdGhlIHNhbWUgYXMgdGhlICsga2V5YmluZGluZ1wiLCAtPlxuICAgICAgICAgICMgZG8gaXQgd2l0aCArIGFuZCBzYXZlIHRoZSByZXN1bHRzXG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBzdGFydGluZ1RleHRcbiAgICAgICAgICAgIGN1cnNvcjogc3RhcnRpbmdDdXJzb3JQb3NpdGlvblxuXG4gICAgICAgICAga2V5c3Ryb2tlICdkICsnXG4gICAgICAgICAgcmVmZXJlbmNlVGV4dCA9IGVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgICByZWZlcmVuY2VDdXJzb3JQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IHN0YXJ0aW5nVGV4dFxuICAgICAgICAgICAgY3Vyc29yOiBzdGFydGluZ0N1cnNvclBvc2l0aW9uXG4gICAgICAgICAgZW5zdXJlICdkIGVudGVyJyxcbiAgICAgICAgICAgIHRleHQ6IHJlZmVyZW5jZVRleHRcbiAgICAgICAgICAgIGN1cnNvcjogcmVmZXJlbmNlQ3Vyc29yUG9zaXRpb25cblxuICBkZXNjcmliZSBcInRoZSBnZyBrZXliaW5kaW5nIHdpdGggc3RheU9uVmVydGljYWxNb3Rpb24gPSBmYWxzZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uVmVydGljYWxNb3Rpb24nLCBmYWxzZSlcbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgMWFiY1xuICAgICAgICAgICAyXG4gICAgICAgICAgM1xcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJpbiBub3JtYWwgbW9kZVwiLCAtPlxuICAgICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2cgZycsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgICAgaXQgXCJtb3ZlIHRvIHNhbWUgcG9zaXRpb24gaWYgaXRzIG9uIGZpcnN0IGxpbmUgYW5kIGZpcnN0IGNoYXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2cgZycsIGN1cnNvcjogWzAsIDFdXG5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbGluZXdpc2UgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBmaXJzdCBsaW5lIGluIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIGcgZycsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiIDFhYmNcXG4gMlxcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImluIGNoYXJhY3Rlcndpc2UgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gdGhlIGZpcnN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgZyBnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIxYWJjXFxuIDJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBjb3VudCBzcGVjaWZpZWRcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiaW4gbm9ybWFsIG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGZpcnN0IGNoYXIgb2YgYSBzcGVjaWZpZWQgbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMiBnIGcnLCBjdXJzb3I6IFsxLCAxXVxuXG4gICAgICBkZXNjcmliZSBcImluIGxpbmV3aXNlIHZpc3VhbCBtb3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJzZWxlY3RzIHRvIGEgc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ1YgMiBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIiAyXFxuM1xcblwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcImluIGNoYXJhY3Rlcndpc2UgdmlzdWFsIG1vdGlvblwiLCAtPlxuICAgICAgICBpdCBcInNlbGVjdHMgdG8gYSBmaXJzdCBjaGFyYWN0ZXIgb2Ygc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3YgMiBnIGcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjJcXG4zXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZ18ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0XzogXCJcIlwiXG4gICAgICAgIDFfX1xuICAgICAgICAgICAgMl9fXG4gICAgICAgICAzYWJjXG4gICAgICAgIF9cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImFzIGEgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdG8gdGhlIGxhc3Qgbm9uYmxhbmsgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdnIF8nLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgICBpdCBcIndpbGwgbW92ZSB0aGUgY3Vyc29yIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgaWYgbmVjZXNzYXJ5XCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdnIF8nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHJlcGVhdGVkIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIGRvd253YXJkIGFuZCBvdXR3YXJkXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzIgZyBfJywgY3Vyc29yOiBbMSwgNF1cblxuICAgIGRlc2NyaWJlIFwiYXMgYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGl0IFwic2VsZWN0cyB0aGUgY3VycmVudCBsaW5lIGV4Y2x1ZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICBlbnN1cmUgJ3YgMiBnIF8nLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIgIDIgIFxcbiAzYWJjXCJcblxuICBkZXNjcmliZSBcInRoZSBHIGtleWJpbmRpbmcgKHN0YXlPblZlcnRpY2FsTW90aW9uID0gZmFsc2UpXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25WZXJ0aWNhbE1vdGlvbicsIGZhbHNlKVxuICAgICAgc2V0XG4gICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgMVxuICAgICAgICBfX19fMlxuICAgICAgICBfM2FiY1xuICAgICAgICBfXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBsYXN0IGxpbmUgYWZ0ZXIgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0cnLCBjdXJzb3I6IFszLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHJlcGVhdGVkIG1vdGlvblwiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIGEgc3BlY2lmaWVkIGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIEcnLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJhcyBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3RzIHRvIHRoZSBsYXN0IGxpbmUgaW4gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAndiBHJyxcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiICAgIDJcXG4gM2FiY1xcbiBcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgTiUga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBbMC4uOTk5XS5qb2luKFwiXFxuXCIpXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcInB1dCBjdXJzb3Igb24gbGluZSBzcGVjaWZpZWQgYnkgcGVyY2VudFwiLCAtPlxuICAgICAgaXQgXCI1MCVcIiwgLT4gIGVuc3VyZSAnNSAwICUnLCAgIGN1cnNvcjogWzQ5OSwgMF1cbiAgICAgIGl0IFwiMzAlXCIsIC0+ICBlbnN1cmUgJzMgMCAlJywgICBjdXJzb3I6IFsyOTksIDBdXG4gICAgICBpdCBcIjEwMCVcIiwgLT4gZW5zdXJlICcxIDAgMCAlJywgY3Vyc29yOiBbOTk5LCAwXVxuICAgICAgaXQgXCIxMjAlXCIsIC0+IGVuc3VyZSAnMSAyIDAgJScsIGN1cnNvcjogWzk5OSwgMF1cblxuICBkZXNjcmliZSBcInRoZSBILCBNLCBMIGtleWJpbmRpbmcoIHN0YXlPblZlcnRpY2FsTW90aW8gPSBmYWxzZSApXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25WZXJ0aWNhbE1vdGlvbicsIGZhbHNlKVxuXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxXG4gICAgICAgICAgMlxuICAgICAgICAgIDNcbiAgICAgICAgICA0XG4gICAgICAgICAgICA1XG4gICAgICAgICAgNlxuICAgICAgICAgIDdcbiAgICAgICAgICA4XG4gICAgICAgICAgOVxuICAgICAgICAgICAgMTBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbOCwgMF1cblxuICAgIGRlc2NyaWJlIFwidGhlIEgga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBub24tYmxhbmstY2hhciBvbiBmaXJzdCByb3cgaWYgdmlzaWJsZVwiLCAtPlxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMClcbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMl1cblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBub24tYmxhbmstY2hhciBvbiBmaXJzdCB2aXNpYmxlIHJvdyBwbHVzIHNjcm9sbCBvZmZzZXRcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDIpXG4gICAgICAgIGVuc3VyZSAnSCcsIGN1cnNvcjogWzQsIDJdXG5cbiAgICAgIGl0IFwicmVzcGVjdHMgY291bnRzXCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBlbnN1cmUgJzQgSCcsIGN1cnNvcjogWzMsIDBdXG5cbiAgICBkZXNjcmliZSBcInRoZSBMIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byBub24tYmxhbmstY2hhciBvbiBsYXN0IHJvdyBpZiB2aXNpYmxlXCIsIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDkpXG4gICAgICAgIGVuc3VyZSAnTCcsIGN1cnNvcjogWzksIDJdXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0byB0aGUgZmlyc3QgdmlzaWJsZSByb3cgcGx1cyBvZmZzZXRcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oNylcbiAgICAgICAgZW5zdXJlICdMJywgY3Vyc29yOiBbNCwgMl1cblxuICAgICAgaXQgXCJyZXNwZWN0cyBjb3VudHNcIiwgLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oOSlcbiAgICAgICAgZW5zdXJlICczIEwnLCBjdXJzb3I6IFs3LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgTSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigxMClcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRvIHRoZSBub24tYmxhbmstY2hhciBvZiBtaWRkbGUgb2Ygc2NyZWVuXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnTScsIGN1cnNvcjogWzQsIDJdXG5cbiAgZGVzY3JpYmUgXCJzdGF5T25WZXJ0aWNhbE1vdGlvbiBzZXR0aW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25WZXJ0aWNhbE1vdGlvbicsIHRydWUpXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMCAwMDAwMDAwMDAwMDBcbiAgICAgICAgICAxIDExMTExMTExMTExMVxuICAgICAgICAyIDIyMjIyMjIyMjIyMlxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMiwgMTBdXG5cbiAgICBkZXNjcmliZSBcImdnLCBHLCBOJVwiLCAtPlxuICAgICAgaXQgXCJnbyB0byByb3cgd2l0aCBrZWVwIGNvbHVtbiBhbmQgcmVzcGVjdCBjdXJzb3IuZ29hbENvbHVtXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBnJywgICAgIGN1cnNvcjogWzAsIDEwXVxuICAgICAgICBlbnN1cmUgJyQnLCAgICAgICBjdXJzb3I6IFswLCAxNV1cbiAgICAgICAgZW5zdXJlICdHJywgICAgICAgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnMSAlJywgICAgIGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nb2FsQ29sdW1uKS50b0JlKEluZmluaXR5KVxuICAgICAgICBlbnN1cmUgJzEgMCBoJywgICBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJzUgMCAlJywgICBjdXJzb3I6IFsxLCA1XVxuICAgICAgICBlbnN1cmUgJzEgMCAwICUnLCBjdXJzb3I6IFsyLCA1XVxuXG4gICAgZGVzY3JpYmUgXCJILCBNLCBMXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigwKVxuICAgICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigzKVxuXG4gICAgICBpdCBcImdvIHRvIHJvdyB3aXRoIGtlZXAgY29sdW1uIGFuZCByZXNwZWN0IGN1cnNvci5nb2FsQ29sdW1cIiwgLT5cbiAgICAgICAgZW5zdXJlICdIJywgY3Vyc29yOiBbMCwgMTBdXG4gICAgICAgIGVuc3VyZSAnTScsIGN1cnNvcjogWzEsIDEwXVxuICAgICAgICBlbnN1cmUgJ0wnLCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgZW5zdXJlICckJywgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG4gICAgICAgIGVuc3VyZSAnSCcsIGN1cnNvcjogWzAsIDE1XVxuICAgICAgICBlbnN1cmUgJ00nLCBjdXJzb3I6IFsxLCAxNV1cbiAgICAgICAgZW5zdXJlICdMJywgY3Vyc29yOiBbMiwgMTNdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdEN1cnNvcigpLmdvYWxDb2x1bW4pLnRvQmUoSW5maW5pdHkpXG5cbiAgZGVzY3JpYmUgJ3RoZSBtYXJrIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTJcbiAgICAgICAgICAgIDM0XG4gICAgICAgIDU2XFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgJ21vdmVzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgb2YgYSBtYXJrJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAga2V5c3Ryb2tlICdtIGEnXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSBcIicgYVwiLCBjdXJzb3I6IFsxLCA0XVxuXG4gICAgaXQgJ21vdmVzIGxpdGVyYWxseSB0byBhIG1hcmsnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdgIGEnLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgaXQgJ2RlbGV0ZXMgdG8gYSBtYXJrIGJ5IGxpbmUnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlIFwiZCAnIGFcIiwgdGV4dDogJzU2XFxuJ1xuXG4gICAgaXQgJ2RlbGV0ZXMgYmVmb3JlIHRvIGEgbWFyayBsaXRlcmFsbHknLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdkIGAgYScsIHRleHQ6ICcgIDRcXG41NlxcbidcblxuICAgIGl0ICdkZWxldGVzIGFmdGVyIHRvIGEgbWFyayBsaXRlcmFsbHknLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ20gYSdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgZW5zdXJlICdkIGAgYScsIHRleHQ6ICcgIDEyXFxuICAgIDM2XFxuJ1xuXG4gICAgaXQgJ21vdmVzIGJhY2sgdG8gcHJldmlvdXMnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDVdXG4gICAgICBrZXlzdHJva2UgJ2AgYCdcbiAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgZW5zdXJlICdgIGAnLCBjdXJzb3I6IFsxLCA1XVxuXG4gIGRlc2NyaWJlIFwianVtcCBjb21tYW5kIHVwZGF0ZSBgIGFuZCAnIG1hcmtcIiwgLT5cbiAgICBlbnN1cmVKdW1wTWFyayA9ICh2YWx1ZSkgLT5cbiAgICAgIGVuc3VyZSBtYXJrOiBcImBcIjogdmFsdWVcbiAgICAgIGVuc3VyZSBtYXJrOiBcIidcIjogdmFsdWVcblxuICAgIGVuc3VyZUp1bXBBbmRCYWNrID0gKGtleXN0cm9rZSwgb3B0aW9uKSAtPlxuICAgICAgYWZ0ZXJNb3ZlID0gb3B0aW9uLmN1cnNvclxuICAgICAgYmVmb3JlTW92ZSA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGVuc3VyZSBrZXlzdHJva2UsIGN1cnNvcjogYWZ0ZXJNb3ZlXG4gICAgICBlbnN1cmVKdW1wTWFyayhiZWZvcmVNb3ZlKVxuXG4gICAgICBleHBlY3QoYmVmb3JlTW92ZS5pc0VxdWFsKGFmdGVyTW92ZSkpLnRvQmUoZmFsc2UpXG5cbiAgICAgIGVuc3VyZSBcImAgYFwiLCBjdXJzb3I6IGJlZm9yZU1vdmVcbiAgICAgIGVuc3VyZUp1bXBNYXJrKGFmdGVyTW92ZSlcblxuICAgIGVuc3VyZUp1bXBBbmRCYWNrTGluZXdpc2UgPSAoa2V5c3Ryb2tlLCBvcHRpb24pIC0+XG4gICAgICBhZnRlck1vdmUgPSBvcHRpb24uY3Vyc29yXG4gICAgICBiZWZvcmVNb3ZlID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgZXhwZWN0KGJlZm9yZU1vdmUuY29sdW1uKS5ub3QudG9CZSgwKVxuXG4gICAgICBlbnN1cmUga2V5c3Ryb2tlLCBjdXJzb3I6IGFmdGVyTW92ZVxuICAgICAgZW5zdXJlSnVtcE1hcmsoYmVmb3JlTW92ZSlcblxuICAgICAgZXhwZWN0KGJlZm9yZU1vdmUuaXNFcXVhbChhZnRlck1vdmUpKS50b0JlKGZhbHNlKVxuXG4gICAgICBlbnN1cmUgXCInICdcIiwgY3Vyc29yOiBbYmVmb3JlTW92ZS5yb3csIDBdXG4gICAgICBlbnN1cmVKdW1wTWFyayhhZnRlck1vdmUpXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmb3IgbWFyayBpbiBcImAnXCJcbiAgICAgICAgdmltU3RhdGUubWFyay5tYXJrc1ttYXJrXT8uZGVzdHJveSgpXG4gICAgICAgIHZpbVN0YXRlLm1hcmsubWFya3NbbWFya10gPSBudWxsXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDogb28gMFxuICAgICAgICAxOiAxMTExXG4gICAgICAgIDI6IDIyMjJcbiAgICAgICAgMzogb28gM1xuICAgICAgICA0OiA0NDQ0XG4gICAgICAgIDU6IG9vIDVcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcImluaXRpYWwgc3RhdGVcIiwgLT5cbiAgICAgIGl0IFwicmV0dXJuIFswLCAwXVwiLCAtPlxuICAgICAgICBlbnN1cmUgbWFyazogXCInXCI6IFswLCAwXVxuICAgICAgICBlbnN1cmUgbWFyazogXCJgXCI6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJqdW1wIG1vdGlvbiBpbiBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgaW5pdGlhbCA9IFszLCAzXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGdldFZpZXcoYXRvbS53b3Jrc3BhY2UpKSAjIGZvciBMLCBNLCBIXG5cbiAgICAgICAgIyBUT0RPOiByZW1vdmUgd2hlbiAxLjE5IGJlY29tZSBzdGFibGVcbiAgICAgICAgaWYgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucz9cbiAgICAgICAgICB7Y29tcG9uZW50fSA9IGVkaXRvclxuICAgICAgICAgIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbXBvbmVudC5nZXRMaW5lSGVpZ2h0KCkgKiBlZGl0b3IuZ2V0TGluZUNvdW50KCkgKyAncHgnXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG5cbiAgICAgICAgZW5zdXJlIG1hcms6IFwiJ1wiOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlIG1hcms6IFwiYFwiOiBbMCwgMF1cbiAgICAgICAgc2V0IGN1cnNvcjogaW5pdGlhbFxuXG4gICAgICBpdCBcIkcganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrICdHJywgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiZyBnIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcImcgZ1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCIxMDAgJSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCIxIDAgMCAlXCIsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIikganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKVwiLCBjdXJzb3I6IFs1LCA2XVxuICAgICAgaXQgXCIoIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIihcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiXSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJdXCIsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIlsganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiW1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCJ9IGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIn1cIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwieyBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJ7XCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIkwganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiTFwiLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgaXQgXCJIIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayBcIkhcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwiTSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2sgXCJNXCIsIGN1cnNvcjogWzIsIDNdXG4gICAgICBpdCBcIioganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrIFwiKlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gICAgICAjIFtCVUddIFN0cmFuZ2UgYnVnIG9mIGphc21pbmUgb3IgYXRvbSdzIGphc21pbmUgZW5oYW5jbWVudD9cbiAgICAgICMgVXNpbmcgc3ViamVjdCBcIiMganVtcCAmIGJhY2tcIiBza2lwcyBzcGVjLlxuICAgICAgIyBOb3RlIGF0IEF0b20gdjEuMTEuMlxuICAgICAgaXQgXCJTaGFycCgjKSBqdW1wJmJhY2tcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2soJyMnLCBjdXJzb3I6IFswLCAzXSlcblxuICAgICAgaXQgXCIvIGp1bXAmYmFja1wiLCAtPiBlbnN1cmVKdW1wQW5kQmFjayAnLyBvbyBlbnRlcicsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcIj8ganVtcCZiYWNrXCIsIC0+IGVuc3VyZUp1bXBBbmRCYWNrICc/IG9vIGVudGVyJywgY3Vyc29yOiBbMCwgM11cblxuICAgICAgaXQgXCJuIGp1bXAmYmFja1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICcvIG9vIGVudGVyJywgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJuXCIsIGN1cnNvcjogWzMsIDNdXG4gICAgICAgIGVuc3VyZUp1bXBBbmRCYWNrIFwiTlwiLCBjdXJzb3I6IFs1LCAzXVxuXG4gICAgICBpdCBcIk4ganVtcCZiYWNrXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJz8gb28gZW50ZXInLCBjdXJzb3I6IFs1LCAzXVxuICAgICAgICBlbnN1cmVKdW1wQW5kQmFjayBcIm5cIiwgY3Vyc29yOiBbMywgM11cbiAgICAgICAgZW5zdXJlSnVtcEFuZEJhY2sgXCJOXCIsIGN1cnNvcjogWzAsIDNdXG5cbiAgICAgIGl0IFwiRyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSAnRycsIGN1cnNvcjogWzUsIDNdXG4gICAgICBpdCBcImcgZyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcImcgZ1wiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgaXQgXCIxMDAgJSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIjEgMCAwICVcIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiKSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIilcIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwiKCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIihcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiXSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIl1cIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiWyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIltcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwifSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIn1cIiwgY3Vyc29yOiBbNSwgNl1cbiAgICAgIGl0IFwieyBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIntcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiTCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIkxcIiwgY3Vyc29yOiBbNSwgM11cbiAgICAgIGl0IFwiSCBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIkhcIiwgY3Vyc29yOiBbMCwgM11cbiAgICAgIGl0IFwiTSBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIk1cIiwgY3Vyc29yOiBbMiwgM11cbiAgICAgIGl0IFwiKiBqdW1wJmJhY2sgbGluZXdpc2VcIiwgLT4gZW5zdXJlSnVtcEFuZEJhY2tMaW5ld2lzZSBcIipcIiwgY3Vyc29yOiBbNSwgM11cblxuICBkZXNjcmliZSAndGhlIFYga2V5YmluZGluZycsIC0+XG4gICAgW3RleHRdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAwMVxuICAgICAgICAwMDJcbiAgICAgICAgMDAwM1xuICAgICAgICAwMDAwNFxuICAgICAgICAwMDAwMDVcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogdGV4dC5nZXRSYXcoKVxuICAgICAgICBjdXJzb3I6IFsxLCAxXVxuXG4gICAgaXQgXCJzZWxlY3RzIGRvd24gYSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBqJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFsxLi4zXSlcblxuICAgIGl0IFwic2VsZWN0cyB1cCBhIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBrJywgc2VsZWN0ZWRUZXh0OiB0ZXh0LmdldExpbmVzKFswLi4xXSlcblxuICBkZXNjcmliZSAnTW92ZVRvKFByZXZpb3VzfE5leHQpRm9sZChTdGFydHxFbmQpJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuICAgICAgZ2V0VmltU3RhdGUgJ3NhbXBsZS5jb2ZmZWUnLCAoc3RhdGUsIHZpbSkgLT5cbiAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ1sgWyc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tcHJldmlvdXMtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICddIFsnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtZm9sZC1zdGFydCdcbiAgICAgICAgICAgICdbIF0nOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLWZvbGQtZW5kJ1xuICAgICAgICAgICAgJ10gXSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tbmV4dC1mb2xkLWVuZCdcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICBkZXNjcmliZSBcIk1vdmVUb1ByZXZpb3VzRm9sZFN0YXJ0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszMCwgMF1cbiAgICAgIGl0IFwibW92ZSB0byBmaXJzdCBjaGFyIG9mIHByZXZpb3VzIGZvbGQgc3RhcnQgcm93XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMjIsIDZdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMjAsIDZdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbMTgsIDRdXG4gICAgICAgIGVuc3VyZSAnWyBbJywgY3Vyc29yOiBbOSwgMl1cbiAgICAgICAgZW5zdXJlICdbIFsnLCBjdXJzb3I6IFs4LCAwXVxuXG4gICAgZGVzY3JpYmUgXCJNb3ZlVG9OZXh0Rm9sZFN0YXJ0XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJtb3ZlIHRvIGZpcnN0IGNoYXIgb2YgbmV4dCBmb2xkIHN0YXJ0IHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ10gWycsIGN1cnNvcjogWzgsIDBdXG4gICAgICAgIGVuc3VyZSAnXSBbJywgY3Vyc29yOiBbOSwgMl1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFsxOCwgNF1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFsyMCwgNl1cbiAgICAgICAgZW5zdXJlICddIFsnLCBjdXJzb3I6IFsyMiwgNl1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvUHJldmlzRm9sZEVuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBwcmV2aW91cyBmb2xkIGVuZCByb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyOCwgMl1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyNSwgNF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyMywgOF1cbiAgICAgICAgZW5zdXJlICdbIF0nLCBjdXJzb3I6IFsyMSwgOF1cblxuICAgIGRlc2NyaWJlIFwiTW92ZVRvTmV4dEZvbGRFbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm1vdmUgdG8gZmlyc3QgY2hhciBvZiBuZXh0IGZvbGQgZW5kIHJvd1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzIxLCA4XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzIzLCA4XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzI1LCA0XVxuICAgICAgICBlbnN1cmUgJ10gXScsIGN1cnNvcjogWzI4LCAyXVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClTdHJpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHMnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLW5leHQtc3RyaW5nJ1xuICAgICAgICAgICdnIFMnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLXN0cmluZydcblxuICAgIGRlc2NyaWJlICdlZGl0b3IgZm9yIHNvZnRUYWInLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1jb2ZmZWUtc2NyaXB0J1xuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgZGlzcG9zYWJsZT8uZGlzcG9zZSgpXG4gICAgICAgICAgICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgICAgICAgJ2NoZWNrLXVwJzogLT4gZnVuKCdiYWNrd2FyZCcpXG4gICAgICAgICAgICAgICdjaGVjay1kb3duJzogLT4gZnVuKCdmb3J3YXJkJylcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBncmFtbWFyOiAnc291cmNlLmNvZmZlZSdcblxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgaXQgXCJtb3ZlIHRvIG5leHQgc3RyaW5nXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzEsIDMxXVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMiwgMjFdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3I6IFszLCAyM11cbiAgICAgIGl0IFwibW92ZSB0byBwcmV2aW91cyBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzQsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMywgMjNdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yOiBbMywgMl1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFsyLCAyMV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvcjogWzEsIDMxXVxuICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzMgZyBzJywgY3Vyc29yOiBbMiwgMjFdXG4gICAgICAgIGVuc3VyZSAnMyBnIFMnLCBjdXJzb3I6IFsxLCAzMV1cblxuICAgIGRlc2NyaWJlICdlZGl0b3IgZm9yIGhhcmRUYWInLCAtPlxuICAgICAgcGFjayA9ICdsYW5ndWFnZS1nbydcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UocGFjaylcblxuICAgICAgICBnZXRWaW1TdGF0ZSAnc2FtcGxlLmdvJywgKHN0YXRlLCB2aW1FZGl0b3IpIC0+XG4gICAgICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBzdGF0ZVxuICAgICAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbUVkaXRvclxuXG4gICAgICBhZnRlckVhY2ggLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBpdCBcIm1vdmUgdG8gbmV4dCBzdHJpbmdcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvclNjcmVlbjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMiwgN11cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFszLCA3XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzgsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbOSwgOF1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxMSwgMjBdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTIsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgcycsIGN1cnNvclNjcmVlbjogWzEzLCAxNV1cbiAgICAgICAgZW5zdXJlICdnIHMnLCBjdXJzb3JTY3JlZW46IFsxNSwgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBzJywgY3Vyc29yU2NyZWVuOiBbMTYsIDE1XVxuICAgICAgaXQgXCJtb3ZlIHRvIHByZXZpb3VzIHN0cmluZ1wiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yU2NyZWVuOiBbMTgsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTYsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzE1LCAxNV1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsxMywgMTVdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMTIsIDE1XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzExLCAyMF1cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFs5LCA4XVxuICAgICAgICBlbnN1cmUgJ2cgUycsIGN1cnNvclNjcmVlbjogWzgsIDhdXG4gICAgICAgIGVuc3VyZSAnZyBTJywgY3Vyc29yU2NyZWVuOiBbMywgN11cbiAgICAgICAgZW5zdXJlICdnIFMnLCBjdXJzb3JTY3JlZW46IFsyLCA3XVxuXG4gIGRlc2NyaWJlICdNb3ZlVG8oUHJldmlvdXN8TmV4dClOdW1iZXInLCAtPlxuICAgIHBhY2sgPSAnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCdcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBuJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LW51bWJlcidcbiAgICAgICAgICAnZyBOJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1wcmV2aW91cy1udW1iZXInXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNldCBncmFtbWFyOiAnc291cmNlLmNvZmZlZSdcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBudW0xID0gMVxuICAgICAgICBhcnIxID0gWzEsIDEwMSwgMTAwMV1cbiAgICAgICAgYXJyMiA9IFtcIjFcIiwgXCIyXCIsIFwiM1wiXVxuICAgICAgICBudW0yID0gMlxuICAgICAgICBmdW4oXCIxXCIsIDIsIDMpXG4gICAgICAgIFxcblxuICAgICAgICBcIlwiXCJcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5kZWFjdGl2YXRlUGFja2FnZShwYWNrKVxuXG4gICAgaXQgXCJtb3ZlIHRvIG5leHQgbnVtYmVyXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMCwgN11cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgOF1cbiAgICAgIGVuc3VyZSAnZyBuJywgY3Vyc29yOiBbMSwgMTFdXG4gICAgICBlbnN1cmUgJ2cgbicsIGN1cnNvcjogWzEsIDE2XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFszLCA3XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFs0LCA5XVxuICAgICAgZW5zdXJlICdnIG4nLCBjdXJzb3I6IFs0LCAxMl1cbiAgICBpdCBcIm1vdmUgdG8gcHJldmlvdXMgbnVtYmVyXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbNSwgMF1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbNCwgMTJdXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzQsIDldXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJ2cgTicsIGN1cnNvcjogWzEsIDE2XVxuICAgICAgZW5zdXJlICdnIE4nLCBjdXJzb3I6IFsxLCAxMV1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMSwgOF1cbiAgICAgIGVuc3VyZSAnZyBOJywgY3Vyc29yOiBbMCwgN11cbiAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICc1IGcgbicsIGN1cnNvcjogWzMsIDddXG4gICAgICBlbnN1cmUgJzMgZyBOJywgY3Vyc29yOiBbMSwgOF1cblxuICBkZXNjcmliZSAnc3Vid29yZCBtb3Rpb24nLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdxJzogJ3ZpbS1tb2RlLXBsdXM6bW92ZS10by1uZXh0LXN1YndvcmQnXG4gICAgICAgICAgJ1EnOiAndmltLW1vZGUtcGx1czptb3ZlLXRvLXByZXZpb3VzLXN1YndvcmQnXG4gICAgICAgICAgJ2N0cmwtZSc6ICd2aW0tbW9kZS1wbHVzOm1vdmUtdG8tZW5kLW9mLXN1YndvcmQnXG5cbiAgICBpdCBcIm1vdmUgdG8gbmV4dC9wcmV2aW91cyBzdWJ3b3JkXCIsIC0+XG4gICAgICBzZXQgdGV4dEM6IFwifGNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbHxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZXwgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+fCAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHx3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCB8c3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWx8KSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgfENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJ8QWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyfFJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbnxkYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaHwtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLXxjYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnxzbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdxJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2V8X2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ3EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlfF93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAncScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yfGRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZXxfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZXxfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnxzbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC18Y2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNofC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbnxkYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlcnxSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUnxBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGF8UkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIHxDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbHwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCB8c3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh8d2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT58ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnUScsIHRleHRDOiBcImNhbWVsQ2FzZXwgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdRJywgdGV4dEM6IFwiY2FtZWx8Q2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ1EnLCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICBpdCBcIm1vdmUtdG8tZW5kLW9mLXN1YndvcmRcIiwgLT5cbiAgICAgIHNldCB0ZXh0QzogXCJ8Y2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZXxsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzfGUgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPXw+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+IHwod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0fGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhfGwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWx8KSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaHxhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhfFJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlfHJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSfHNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXN8aC1jYXNlXFxuXFxuc25ha2VfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaHwtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzfGVcXG5cXG5zbmFrZV9jYXNlX3dvcmRcXG5cIlxuICAgICAgZW5zdXJlICdjdHJsLWUnLCB0ZXh0QzogXCJjYW1lbENhc2UgPT4gKHdpdGggc3BlY2lhbCkgQ2hhUkFjdGVyUnNcXG5cXG5kYXNoLWNhc2VcXG5cXG5zbmFrfGVfY2FzZV93b3JkXFxuXCJcbiAgICAgIGVuc3VyZSAnY3RybC1lJywgdGV4dEM6IFwiY2FtZWxDYXNlID0+ICh3aXRoIHNwZWNpYWwpIENoYVJBY3RlclJzXFxuXFxuZGFzaC1jYXNlXFxuXFxuc25ha2VfY2FzfGVfd29yZFxcblwiXG4gICAgICBlbnN1cmUgJ2N0cmwtZScsIHRleHRDOiBcImNhbWVsQ2FzZSA9PiAod2l0aCBzcGVjaWFsKSBDaGFSQWN0ZXJSc1xcblxcbmRhc2gtY2FzZVxcblxcbnNuYWtlX2Nhc2Vfd29yfGRcXG5cIlxuIl19