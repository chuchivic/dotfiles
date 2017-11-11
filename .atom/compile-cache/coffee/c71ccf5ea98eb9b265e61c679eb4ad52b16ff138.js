(function() {
  var TextData, dispatch, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Operator general", function() {
    var bindEnsureOption, editor, editorElement, ensure, ensureByDispatch, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureByDispatch = ref1[2], bindEnsureOption = ref1[3], keystroke = ref1[4], editor = ref1[5], editorElement = ref1[6], vimState = ref1[7];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureByDispatch = vim.ensureByDispatch, bindEnsureOption = vim.bindEnsureOption, keystroke = vim.keystroke, vim;
      });
    });
    describe("cancelling operations", function() {
      return it("clear pending operation", function() {
        keystroke('/');
        expect(vimState.operationStack.isEmpty()).toBe(false);
        vimState.searchInput.cancel();
        expect(vimState.operationStack.isEmpty()).toBe(true);
        return expect(function() {
          return vimState.searchInput.cancel();
        }).not.toThrow();
      });
    });
    describe("the x keybinding", function() {
      describe("on a line with content", function() {
        describe("without vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [1, 4]
            });
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters with a count", function() {
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            return ensure('3 x', {
              text: 'a\n0123\n\nxyz',
              cursor: [0, 0],
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        describe("with multiple cursors", function() {
          beforeEach(function() {
            return set({
              text: "abc\n012345\n\nxyz",
              cursor: [[1, 4], [0, 1]]
            });
          });
          return it("is undone as one operation", function() {
            ensure('x', {
              text: "ac\n01235\n\nxyz"
            });
            return ensure('u', {
              text: 'abc\n012345\n\nxyz'
            });
          });
        });
        return describe("with vim-mode-plus.wrapLeftRightMotion", function() {
          beforeEach(function() {
            set({
              text: 'abc\n012345\n\nxyz',
              cursor: [1, 4]
            });
            return settings.set('wrapLeftRightMotion', true);
          });
          it("deletes a character", function() {
            ensure('x', {
              text: 'abc\n01235\n\nxyz',
              cursor: [1, 4],
              register: {
                '"': {
                  text: '4'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '5'
                }
              }
            });
            ensure('x', {
              text: 'abc\n012\n\nxyz',
              cursor: [1, 2],
              register: {
                '"': {
                  text: '3'
                }
              }
            });
            ensure('x', {
              text: 'abc\n01\n\nxyz',
              cursor: [1, 1],
              register: {
                '"': {
                  text: '2'
                }
              }
            });
            ensure('x', {
              text: 'abc\n0\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '1'
                }
              }
            });
            return ensure('x', {
              text: 'abc\n\n\nxyz',
              cursor: [1, 0],
              register: {
                '"': {
                  text: '0'
                }
              }
            });
          });
          return it("deletes multiple characters and newlines with a count", function() {
            settings.set('wrapLeftRightMotion', true);
            ensure('2 x', {
              text: 'abc\n0123\n\nxyz',
              cursor: [1, 3],
              register: {
                '"': {
                  text: '45'
                }
              }
            });
            set({
              cursor: [0, 1]
            });
            ensure('3 x', {
              text: 'a0123\n\nxyz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: 'bc\n'
                }
              }
            });
            return ensure('7 x', {
              text: 'ayz',
              cursor: [0, 1],
              register: {
                '"': {
                  text: '0123\n\nx'
                }
              }
            });
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        it("deletes nothing on an empty line when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('x', {
            text: "abc\n012345\n\nxyz",
            cursor: [2, 0]
          });
        });
        return it("deletes an empty line when vim-mode-plus.wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('x', {
            text: "abc\n012345\nxyz",
            cursor: [2, 0]
          });
        });
      });
    });
    describe("the X keybinding", function() {
      describe("on a line with content", function() {
        beforeEach(function() {
          return set({
            text: "ab\n012345",
            cursor: [1, 2]
          });
        });
        return it("deletes a character", function() {
          ensure('X', {
            text: 'ab\n02345',
            cursor: [1, 1],
            register: {
              '"': {
                text: '1'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          ensure('X', {
            text: 'ab\n2345',
            cursor: [1, 0],
            register: {
              '"': {
                text: '0'
              }
            }
          });
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: 'ab2345',
            cursor: [0, 2],
            register: {
              '"': {
                text: '\n'
              }
            }
          });
        });
      });
      return describe("on an empty line", function() {
        beforeEach(function() {
          return set({
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        it("deletes nothing when vim-mode-plus.wrapLeftRightMotion is false", function() {
          settings.set('wrapLeftRightMotion', false);
          return ensure('X', {
            text: "012345\n\nabcdef",
            cursor: [1, 0]
          });
        });
        return it("deletes the newline when wrapLeftRightMotion is true", function() {
          settings.set('wrapLeftRightMotion', true);
          return ensure('X', {
            text: "012345\nabcdef",
            cursor: [0, 5]
          });
        });
      });
    });
    describe("the d keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\n\nABCDE\n",
          cursor: [1, 1]
        });
      });
      it("enters operator-pending mode", function() {
        return ensure('d', {
          mode: 'operator-pending'
        });
      });
      describe("when followed by a d", function() {
        it("deletes the current line and exits operator-pending mode", function() {
          set({
            cursor: [1, 1]
          });
          return ensure('d d', {
            text: "12345\n\nABCDE\n",
            cursor: [1, 0],
            register: {
              '"': {
                text: "abcde\n"
              }
            },
            mode: 'normal'
          });
        });
        it("deletes the last line and always make non-blank-line last line", function() {
          set({
            cursor: [2, 0]
          });
          return ensure('2 d d', {
            text: "12345\nabcde\n",
            cursor: [1, 0]
          });
        });
        return it("leaves the cursor on the first nonblank character", function() {
          set({
            textC: "1234|5\n  abcde\n"
          });
          return ensure('d d', {
            textC: "  |abcde\n"
          });
        });
      });
      describe("undo behavior", function() {
        var initialTextC, originalText, ref2;
        ref2 = [], originalText = ref2[0], initialTextC = ref2[1];
        beforeEach(function() {
          initialTextC = "12345\na|bcde\nABCDE\nQWERT";
          set({
            textC: initialTextC
          });
          return originalText = editor.getText();
        });
        it("undoes both lines", function() {
          ensure('d 2 d', {
            textC: "12345\n|QWERT"
          });
          return ensure('u', {
            textC: initialTextC,
            selectedText: ""
          });
        });
        return describe("with multiple cursors", function() {
          describe("setCursorToStartOfChangeOnUndoRedo is true(default)", function() {
            it("clear multiple cursors and set cursor to start of changes of last cursor", function() {
              set({
                text: originalText,
                cursor: [[0, 0], [1, 1]]
              });
              ensure('d l', {
                textC: "|2345\na|cde\nABCDE\nQWERT"
              });
              ensure('u', {
                textC: "12345\na|bcde\nABCDE\nQWERT",
                selectedText: ''
              });
              return ensure('ctrl-r', {
                textC: "2345\na|cde\nABCDE\nQWERT",
                selectedText: ''
              });
            });
            return it("clear multiple cursors and set cursor to start of changes of last cursor", function() {
              set({
                text: originalText,
                cursor: [[1, 1], [0, 0]]
              });
              ensure('d l', {
                text: "2345\nacde\nABCDE\nQWERT",
                cursor: [[1, 1], [0, 0]]
              });
              ensure('u', {
                textC: "|12345\nabcde\nABCDE\nQWERT",
                selectedText: ''
              });
              return ensure('ctrl-r', {
                textC: "|2345\nacde\nABCDE\nQWERT",
                selectedText: ''
              });
            });
          });
          return describe("setCursorToStartOfChangeOnUndoRedo is false", function() {
            initialTextC = null;
            beforeEach(function() {
              initialTextC = "|12345\na|bcde\nABCDE\nQWERT";
              settings.set('setCursorToStartOfChangeOnUndoRedo', false);
              set({
                textC: initialTextC
              });
              return ensure('d l', {
                textC: "|2345\na|cde\nABCDE\nQWERT"
              });
            });
            return it("put cursor to end of change (works in same way of atom's core:undo)", function() {
              return ensure('u', {
                textC: initialTextC,
                selectedText: ['', '']
              });
            });
          });
        });
      });
      describe("when followed by a w", function() {
        it("deletes the next word until the end of the line and exits operator-pending mode", function() {
          set({
            text: 'abcd efg\nabc',
            cursor: [0, 5]
          });
          return ensure('d w', {
            text: "abcd \nabc",
            cursor: [0, 4],
            mode: 'normal'
          });
        });
        return it("deletes to the beginning of the next word", function() {
          set({
            text: 'abcd efg',
            cursor: [0, 2]
          });
          ensure('d w', {
            text: 'abefg',
            cursor: [0, 2]
          });
          set({
            text: 'one two three four',
            cursor: [0, 0]
          });
          return ensure('d 3 w', {
            text: 'four',
            cursor: [0, 0]
          });
        });
      });
      describe("when followed by an iw", function() {
        return it("deletes the containing word", function() {
          set({
            text: "12345 abcde ABCDE",
            cursor: [0, 9]
          });
          ensure('d', {
            mode: 'operator-pending'
          });
          return ensure('i w', {
            text: "12345  ABCDE",
            cursor: [0, 6],
            register: {
              '"': {
                text: 'abcde'
              }
            },
            mode: 'normal'
          });
        });
      });
      describe("when followed by a j", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE\n";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the file", function() {
          return it("deletes the next two lines", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d j', {
              text: 'ABCDE\n'
            });
          });
        });
        describe("on the middle of second line", function() {
          return it("deletes the last two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d j', {
              text: '12345\n'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [1, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d j', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by an k", function() {
        var originalText;
        originalText = "12345\nabcde\nABCDE";
        beforeEach(function() {
          return set({
            text: originalText
          });
        });
        describe("on the end of the file", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [2, 4]
            });
            return ensure('d k', {
              text: '12345\n'
            });
          });
        });
        describe("on the beginning of the file", function() {
          return xit("deletes nothing", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('d k', {
              text: originalText
            });
          });
        });
        describe("when on the middle of second line", function() {
          return it("deletes the first two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d k', {
              text: 'ABCDE'
            });
          });
        });
        return describe("when cursor is on blank line", function() {
          beforeEach(function() {
            return set({
              text: "a\n\n\nb\n",
              cursor: [2, 0]
            });
          });
          return it("deletes both lines", function() {
            return ensure('d k', {
              text: "a\nb\n",
              cursor: [1, 0]
            });
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d G', {
              text: '12345\n'
            });
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('d 2 G', {
              text: '12345\nABCDE'
            });
          });
        });
      });
      describe("when followed by a t)", function() {
        return describe("with the entire line yanked before", function() {
          beforeEach(function() {
            return set({
              text: "test (xyz)",
              cursor: [0, 6]
            });
          });
          return it("deletes until the closing parenthesis", function() {
            return ensure('d t )', {
              text: 'test ()',
              cursor: [0, 6]
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        it("deletes each selection", function() {
          set({
            text: "abcd\n1234\nABCD\n",
            cursor: [[0, 1], [1, 2], [2, 3]]
          });
          return ensure('d e', {
            text: "a\n12\nABC",
            cursor: [[0, 0], [1, 1], [2, 2]]
          });
        });
        return it("doesn't delete empty selections", function() {
          set({
            text: "abcd\nabc\nabd",
            cursor: [[0, 0], [1, 0], [2, 0]]
          });
          return ensure('d t d', {
            text: "d\nabc\nd",
            cursor: [[0, 0], [1, 0], [2, 0]]
          });
        });
      });
      return describe("stayOnDelete setting", function() {
        beforeEach(function() {
          settings.set('stayOnDelete', true);
          return set({
            text_: "___3333\n__2222\n_1111\n__2222\n___3333\n",
            cursor: [0, 3]
          });
        });
        describe("target range is linewise range", function() {
          it("keep original column after delete", function() {
            ensure("d d", {
              cursor: [0, 3],
              text_: "__2222\n_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "_1111\n__2222\n___3333\n"
            });
            ensure(".", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
            return ensure(".", {
              cursor: [0, 3],
              text_: "___3333\n"
            });
          });
          return it("v_D also keep original column after delete", function() {
            return ensure("v 2 j D", {
              cursor: [0, 3],
              text_: "__2222\n___3333\n"
            });
          });
        });
        return describe("target range is text object", function() {
          describe("target is indent", function() {
            var indentText, textData;
            indentText = "0000000000000000\n  22222222222222\n  22222222222222\n  22222222222222\n0000000000000000\n";
            textData = new TextData(indentText);
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("[from top] keep column", function() {
              set({
                cursor: [1, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            it("[from middle] keep column", function() {
              set({
                cursor: [2, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
            return it("[from bottom] keep column", function() {
              set({
                cursor: [3, 10]
              });
              return ensure('d i i', {
                cursor: [1, 10],
                text: textData.getLines([0, 4])
              });
            });
          });
          return describe("target is paragraph", function() {
            var B1, B2, B3, P1, P2, P3, paragraphText, textData;
            paragraphText = "p1---------------\np1---------------\np1---------------\n\np2---------------\np2---------------\np2---------------\n\np3---------------\np3---------------\np3---------------\n";
            textData = new TextData(paragraphText);
            P1 = [0, 1, 2];
            B1 = 3;
            P2 = [4, 5, 6];
            B2 = 7;
            P3 = [8, 9, 10];
            B3 = 11;
            beforeEach(function() {
              return set({
                text: textData.getRaw()
              });
            });
            it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var i, results;
              set({
                cursor: [0, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            it("set cursor to start of deletion after delete [from middle of paragraph]", function() {
              var i, results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('2 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
            return it("set cursor to start of deletion after delete [from bottom of paragraph]", function() {
              var i, results;
              set({
                cursor: [1, 0]
              });
              ensure('d i p', {
                cursor: [0, 0],
                text: textData.getLines((function() {
                  results = [];
                  for (var i = B1; B1 <= B3 ? i <= B3 : i >= B3; B1 <= B3 ? i++ : i--){ results.push(i); }
                  return results;
                }).apply(this), {
                  chomp: true
                })
              });
              ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2].concat(slice.call(P3), [B3]), {
                  chomp: true
                })
              });
              return ensure('3 j .', {
                cursor: [1, 0],
                text: textData.getLines([B1, B2, B3], {
                  chomp: true
                })
              });
            });
          });
        });
      });
    });
    describe("the D keybinding", function() {
      beforeEach(function() {
        return set({
          text: "0000\n1111\n2222\n3333",
          cursor: [0, 1]
        });
      });
      it("deletes the contents until the end of the line", function() {
        return ensure('D', {
          text: "0\n1111\n2222\n3333"
        });
      });
      return it("in visual-mode, it delete whole line", function() {
        ensure('v D', {
          text: "1111\n2222\n3333"
        });
        return ensure("v j D", {
          text: "3333"
        });
      });
    });
    describe("the y keybinding", function() {
      beforeEach(function() {
        return set({
          textC: "012 |345\nabc\n"
        });
      });
      describe("when useClipboardAsDefaultRegister enabled", function() {
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          atom.clipboard.write('___________');
          return ensure({
            register: {
              '"': {
                text: '___________'
              }
            }
          });
        });
        return describe("read/write to clipboard through register", function() {
          return it("writes to clipboard with default register", function() {
            var savedText;
            savedText = '012 345\n';
            ensure('y y', {
              register: {
                '"': {
                  text: savedText
                }
              }
            });
            return expect(atom.clipboard.read()).toBe(savedText);
          });
        });
      });
      describe("visual-mode.linewise", function() {
        beforeEach(function() {
          return set({
            textC: "0000|00\n111111\n222222\n"
          });
        });
        describe("selection not reversed", function() {
          return it("saves to register(type=linewise), cursor move to start of target", function() {
            return ensure("V j y", {
              cursor: [0, 0],
              register: {
                '"': {
                  text: "000000\n111111\n",
                  type: 'linewise'
                }
              }
            });
          });
        });
        return describe("selection is reversed", function() {
          return it("saves to register(type=linewise), cursor doesn't move", function() {
            set({
              cursor: [2, 2]
            });
            return ensure("V k y", {
              cursor: [1, 2],
              register: {
                '"': {
                  text: "111111\n222222\n",
                  type: 'linewise'
                }
              }
            });
          });
        });
      });
      describe("visual-mode.blockwise", function() {
        beforeEach(function() {
          set({
            textC_: "000000\n1!11111\n222222\n333333\n4|44444\n555555\n"
          });
          return ensure("ctrl-v l l j", {
            selectedTextOrdered: ["111", "222", "444", "555"],
            mode: ['visual', 'blockwise']
          });
        });
        describe("when stayOnYank = false", function() {
          return it("place cursor at start of block after yank", function() {
            return ensure("y", {
              mode: 'normal',
              textC_: "000000\n1!11111\n222222\n333333\n4|44444\n555555\n"
            });
          });
        });
        return describe("when stayOnYank = true", function() {
          beforeEach(function() {
            return settings.set('stayOnYank', true);
          });
          return it("place cursor at head of block after yank", function() {
            return ensure("y", {
              mode: 'normal',
              textC_: "000000\n111111\n222!222\n333333\n444444\n555|555\n"
            });
          });
        });
      });
      describe("y y", function() {
        it("saves to register(type=linewise), cursor stay at same position", function() {
          return ensure('y y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\n",
                type: 'linewise'
              }
            }
          });
        });
        it("[N y y] yank N line, starting from the current", function() {
          return ensure('y 2 y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
        return it("[y N y] yank N line, starting from the current", function() {
          return ensure('2 y y', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n"
              }
            }
          });
        });
      });
      describe("with a register", function() {
        return it("saves the line to the a register", function() {
          return ensure('" a y y', {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
        });
      });
      describe("with A register", function() {
        return it("append to existing value of lowercase-named register", function() {
          ensure('" a y y', {
            register: {
              a: {
                text: "012 345\n"
              }
            }
          });
          return ensure('" A y y', {
            register: {
              a: {
                text: "012 345\n012 345\n"
              }
            }
          });
        });
      });
      describe("with a motion", function() {
        beforeEach(function() {
          return settings.set('useClipboardAsDefaultRegister', false);
        });
        it("yank from here to destnation of motion", function() {
          return ensure('y e', {
            cursor: [0, 4],
            register: {
              '"': {
                text: '345'
              }
            }
          });
        });
        it("does not yank when motion failed", function() {
          return ensure('y t x', {
            register: {
              '"': {
                text: void 0
              }
            }
          });
        });
        it("yank and move cursor to start of target", function() {
          return ensure('y h', {
            cursor: [0, 3],
            register: {
              '"': {
                text: ' '
              }
            }
          });
        });
        return it("[with linewise motion] yank and desn't move cursor", function() {
          return ensure('y j', {
            cursor: [0, 4],
            register: {
              '"': {
                text: "012 345\nabc\n",
                type: 'linewise'
              }
            }
          });
        });
      });
      describe("with a text-obj", function() {
        beforeEach(function() {
          return set({
            cursor: [2, 8],
            text: "\n1st paragraph\n1st paragraph\n\n2n paragraph\n2n paragraph\n"
          });
        });
        it("inner-word and move cursor to start of target", function() {
          return ensure('y i w', {
            register: {
              '"': {
                text: "paragraph"
              }
            },
            cursor: [2, 4]
          });
        });
        return it("yank text-object inner-paragraph and move cursor to start of target", function() {
          return ensure('y i p', {
            cursor: [1, 0],
            register: {
              '"': {
                text: "1st paragraph\n1st paragraph\n"
              }
            }
          });
        });
      });
      describe("when followed by a G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE\n";
          return set({
            text: originalText
          });
        });
        it("yank and doesn't move cursor", function() {
          set({
            cursor: [1, 0]
          });
          return ensure('y G', {
            register: {
              '"': {
                text: "abcde\nABCDE\n",
                type: 'linewise'
              }
            },
            cursor: [1, 0]
          });
        });
        return it("yank and doesn't move cursor", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('y G', {
            register: {
              '"': {
                text: "abcde\nABCDE\n",
                type: 'linewise'
              }
            },
            cursor: [1, 2]
          });
        });
      });
      describe("when followed by a goto line G", function() {
        beforeEach(function() {
          var originalText;
          originalText = "12345\nabcde\nABCDE";
          return set({
            text: originalText
          });
        });
        describe("on the beginning of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 0]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
        return describe("on the middle of the second line", function() {
          return it("deletes the bottom two lines", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('y 2 G P', {
              text: '12345\nabcde\nabcde\nABCDE'
            });
          });
        });
      });
      describe("with multiple cursors", function() {
        return it("moves each cursor and copies the last selection's text", function() {
          set({
            text: "  abcd\n  1234",
            cursor: [[0, 0], [1, 5]]
          });
          return ensure('y ^', {
            register: {
              '"': {
                text: '123'
              }
            },
            cursor: [[0, 0], [1, 2]]
          });
        });
      });
      return describe("stayOnYank setting", function() {
        var text;
        text = null;
        beforeEach(function() {
          settings.set('stayOnYank', true);
          text = new TextData("0_234567\n1_234567\n2_234567\n\n4_234567\n");
          return set({
            text: text.getRaw(),
            cursor: [1, 2]
          });
        });
        it("don't move cursor after yank from normal-mode", function() {
          ensure("y i p", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([0, 1, 2])
              }
            }
          });
          ensure("j y y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: text.getLines([2])
              }
            }
          });
          ensure("k .", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          ensure("y h", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "_"
              }
            }
          });
          return ensure("y b", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "1_"
              }
            }
          });
        });
        it("don't move cursor after yank from visual-linewise", function() {
          ensure("V y", {
            cursor: [1, 2],
            register: {
              '"': {
                text: text.getLines([1])
              }
            }
          });
          return ensure("V j y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: text.getLines([1, 2])
              }
            }
          });
        });
        return it("don't move cursor after yank from visual-characterwise", function() {
          ensure("v l l y", {
            cursor: [1, 4],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v h h y", {
            cursor: [1, 2],
            register: {
              '"': {
                text: "234"
              }
            }
          });
          ensure("v j y", {
            cursor: [2, 2],
            register: {
              '"': {
                text: "234567\n2_2"
              }
            }
          });
          return ensure("v 2 k y", {
            cursor: [0, 2],
            register: {
              '"': {
                text: "234567\n1_234567\n2_2"
              }
            }
          });
        });
      });
    });
    describe("the yy keybinding", function() {
      describe("on a single line file", function() {
        beforeEach(function() {
          return set({
            text: "exclamation!\n",
            cursor: [0, 0]
          });
        });
        return it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "exclamation!\n"
              }
            },
            text: "exclamation!\nexclamation!\n"
          });
        });
      });
      return describe("on a single line file with no newline", function() {
        beforeEach(function() {
          return set({
            text: "no newline!",
            cursor: [0, 0]
          });
        });
        it("copies the entire line and pastes it correctly", function() {
          return ensure('y y p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\n"
          });
        });
        return it("copies the entire line and pastes it respecting count and new lines", function() {
          return ensure('y y 2 p', {
            register: {
              '"': {
                text: "no newline!\n"
              }
            },
            text: "no newline!\nno newline!\nno newline!\n"
          });
        });
      });
    });
    describe("the Y keybinding", function() {
      var text;
      text = null;
      beforeEach(function() {
        text = "012 345\nabc\n";
        return set({
          text: text,
          cursor: [0, 4]
        });
      });
      it("saves the line to the default register", function() {
        return ensure('Y', {
          cursor: [0, 4],
          register: {
            '"': {
              text: "012 345\n"
            }
          }
        });
      });
      return it("yank the whole lines to the default register", function() {
        return ensure('v j Y', {
          cursor: [0, 0],
          register: {
            '"': {
              text: text
            }
          }
        });
      });
    });
    describe("the p keybinding", function() {
      describe("with single line character contents", function() {
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', false);
          set({
            textC: "|012\n"
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              'a': {
                text: 'a'
              }
            }
          });
          return atom.clipboard.write("clip");
        });
        describe("from the default register", function() {
          return it("inserts the contents", function() {
            return ensure("p", {
              textC: "034|512\n"
            });
          });
        });
        describe("at the end of a line", function() {
          beforeEach(function() {
            return set({
              textC: "01|2\n"
            });
          });
          return it("positions cursor correctly", function() {
            return ensure("p", {
              textC: "01234|5\n"
            });
          });
        });
        describe("paste to empty line", function() {
          return it("paste content to that empty line", function() {
            set({
              textC: "1st\n|\n3rd",
              register: {
                '"': {
                  text: '2nd'
                }
              }
            });
            return ensure('p', {
              textC: "1st\n2n|d\n3rd"
            });
          });
        });
        describe("when useClipboardAsDefaultRegister enabled", function() {
          return it("inserts contents from clipboard", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            return ensure('p', {
              textC: "0cli|p12\n"
            });
          });
        });
        describe("from a specified register", function() {
          return it("inserts the contents of the 'a' register", function() {
            return ensure('" a p', {
              textC: "0|a12\n"
            });
          });
        });
        return describe("at the end of a line", function() {
          return it("inserts before the current line's newline", function() {
            set({
              textC: "abcde\none |two three"
            });
            return ensure('d $ k $ p', {
              textC_: "abcdetwo thre|e\none_"
            });
          });
        });
      });
      describe("with multiline character contents", function() {
        beforeEach(function() {
          set({
            textC: "|012\n"
          });
          return set({
            register: {
              '"': {
                text: '345\n678'
              }
            }
          });
        });
        it("p place cursor at start of mutation", function() {
          return ensure("p", {
            textC: "0|345\n67812\n"
          });
        });
        return it("P place cursor at start of mutation", function() {
          return ensure("P", {
            textC: "|345\n678012\n"
          });
        });
      });
      describe("with linewise contents", function() {
        describe("on a single line", function() {
          beforeEach(function() {
            return set({
              textC: '0|12',
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register", function() {
            return ensure('p', {
              textC_: "012\n_|345\n"
            });
          });
          return it("replaces the current selection and put cursor to the first char of line", function() {
            return ensure('v p', {
              textC_: "0\n_|345\n2"
            });
          });
        });
        return describe("on multiple lines", function() {
          beforeEach(function() {
            return set({
              text: "012\n 345",
              register: {
                '"': {
                  text: " 456\n",
                  type: 'linewise'
                }
              }
            });
          });
          it("inserts the contents of the default register at middle line", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("p", {
              textC: "012\n |456\n 345"
            });
          });
          return it("inserts the contents of the default register at end of line", function() {
            set({
              cursor: [1, 1]
            });
            return ensure('p', {
              textC: "012\n 345\n |456\n"
            });
          });
        });
      });
      describe("with multiple linewise contents", function() {
        beforeEach(function() {
          return set({
            textC: "012\n|abc",
            register: {
              '"': {
                text: " 345\n 678\n",
                type: 'linewise'
              }
            }
          });
        });
        return it("inserts the contents of the default register", function() {
          return ensure('p', {
            textC: "012\nabc\n |345\n 678\n"
          });
        });
      });
      describe("put-after-with-auto-indent command", function() {
        beforeEach(function() {
          waitsForPromise(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            return atom.packages.activatePackage('language-javascript');
          });
          return runs(function() {
            return set({
              grammar: 'source.js'
            });
          });
        });
        describe("paste with auto-indent", function() {
          it("inserts the contents of the default register", function() {
            set({
              register: {
                '"': {
                  text: " 345\n",
                  type: 'linewise'
                }
              },
              textC_: "if| () {\n}"
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC_: "if () {\n  |345\n}"
            });
          });
          return it("multi-line register contents with auto indent", function() {
            var registerContent;
            registerContent = "if(3) {\n  if(4) {}\n}";
            set({
              register: {
                '"': {
                  text: registerContent,
                  type: 'linewise'
                }
              },
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC: "if (1) {\n  if (2) {\n    |if(3) {\n      if(4) {}\n    }\n  }\n}"
            });
          });
        });
        return describe("when pasting already indented multi-lines register content", function() {
          beforeEach(function() {
            return set({
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
          });
          it("keep original layout", function() {
            var registerContent;
            registerContent = "   a: 123,\nbbbb: 456,";
            set({
              register: {
                '"': {
                  text: registerContent,
                  type: 'linewise'
                }
              }
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC: "if (1) {\n  if (2) {\n       |a: 123,\n    bbbb: 456,\n  }\n}"
            });
          });
          return it("keep original layout [register content have blank row]", function() {
            var registerContent;
            registerContent = "if(3) {\n__abc\n\n__def\n}".replace(/_/g, ' ');
            set({
              register: {
                '"': {
                  text: registerContent,
                  type: 'linewise'
                }
              }
            });
            return ensureByDispatch('vim-mode-plus:put-after-with-auto-indent', {
              textC_: "if (1) {\n  if (2) {\n    |if(3) {\n      abc\n\n      def\n    }\n  }\n}"
            });
          });
        });
      });
      describe("pasting twice", function() {
        beforeEach(function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [1, 1],
            register: {
              '"': {
                text: '123'
              }
            }
          });
          return keystroke('2 p');
        });
        it("inserts the same line twice", function() {
          return ensure({
            text: "12345\nab123123cde\nABCDE\nQWERT"
          });
        });
        return describe("when undone", function() {
          return it("removes both lines", function() {
            return ensure('u', {
              text: "12345\nabcde\nABCDE\nQWERT"
            });
          });
        });
      });
      describe("support multiple cursors", function() {
        return it("paste text for each cursors", function() {
          set({
            text: "12345\nabcde\nABCDE\nQWERT",
            cursor: [[1, 0], [2, 0]],
            register: {
              '"': {
                text: 'ZZZ'
              }
            }
          });
          return ensure('p', {
            text: "12345\naZZZbcde\nAZZZBCDE\nQWERT",
            cursor: [[1, 3], [2, 3]]
          });
        });
      });
      return describe("with a selection", function() {
        beforeEach(function() {
          return set({
            text: '012\n',
            cursor: [0, 1]
          });
        });
        describe("with characterwise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('v p', {
              text: "03452\n",
              cursor: [0, 3]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('v p', {
              text: "0\n345\n2\n",
              cursor: [1, 0]
            });
          });
        });
        return describe("with linewise selection", function() {
          it("replaces selection with charwise content", function() {
            set({
              text: "012\nabc",
              cursor: [0, 1]
            });
            set({
              register: {
                '"': {
                  text: "345"
                }
              }
            });
            return ensure('V p', {
              text: "345\nabc",
              cursor: [0, 0]
            });
          });
          return it("replaces selection with linewise content", function() {
            set({
              register: {
                '"': {
                  text: "345\n"
                }
              }
            });
            return ensure('V p', {
              text: "345\n",
              cursor: [0, 0]
            });
          });
        });
      });
    });
    describe("the P keybinding", function() {
      return describe("with character contents", function() {
        beforeEach(function() {
          set({
            text: "012\n",
            cursor: [0, 0]
          });
          set({
            register: {
              '"': {
                text: '345'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'a'
              }
            }
          });
          return keystroke('P');
        });
        return it("inserts the contents of the default register above", function() {
          return ensure({
            text: "345012\n",
            cursor: [0, 2]
          });
        });
      });
    });
    describe("the . keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n56\n78",
          cursor: [0, 0]
        });
      });
      it("repeats the last operation", function() {
        return ensure('2 d d .', {
          text: ""
        });
      });
      return it("composes with motions", function() {
        return ensure('d d 2 .', {
          text: "78"
        });
      });
    });
    describe("the r keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12\n34\n\n",
          cursor: [[0, 0], [1, 0]]
        });
      });
      it("replaces a single character", function() {
        return ensure('r x', {
          text: 'x2\nx4\n\n'
        });
      });
      it("remain visual-mode when cancelled", function() {
        return ensure('v r escape', {
          text: '12\n34\n\n',
          mode: ['visual', 'characterwise']
        });
      });
      it("replaces a single character with a line break", function() {
        return ensure('r enter', {
          text: '\n2\n\n4\n\n',
          cursor: [[1, 0], [3, 0]]
        });
      });
      it("auto indent when replaced with singe new line", function() {
        set({
          textC_: "__a|bc"
        });
        return ensure('r enter', {
          textC_: "__a\n__|c"
        });
      });
      it("composes properly with motions", function() {
        return ensure('2 r x', {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursor: [2, 0]
        });
        return ensure('r x', {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensure('3 r x', {
          text: '12\n34\n\n'
        });
      });
      describe("cancellation", function() {
        it("does nothing when cancelled", function() {
          return ensure('r escape', {
            text: '12\n34\n\n',
            mode: 'normal'
          });
        });
        it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|    a\n!    a\n|    a\n"
          });
          return ensure("r escape", {
            textC: "|    a\n!    a\n|    a\n",
            mode: "normal"
          });
        });
        return it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|**a\n!**a\n|**a\n"
          });
          ensure("v l", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
          return ensure("r escape", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return keystroke('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensure('r x', {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensure('r x', {
            cursor: [[0, 0], [1, 0]]
          });
        });
      });
      return describe("when in visual-block mode", function() {
        beforeEach(function() {
          set({
            cursor: [1, 4],
            text: "0:2345\n1: o11o\n2: o22o\n3: o33o\n4: o44o\n"
          });
          return ensure('ctrl-v l 3 j', {
            mode: ['visual', 'blockwise'],
            selectedTextOrdered: ['11', '22', '33', '44']
          });
        });
        return it("replaces each selection and put cursor on start of top selection", function() {
          ensure('r x', {
            mode: 'normal',
            cursor: [1, 4],
            text: "0:2345\n1: oxxo\n2: oxxo\n3: oxxo\n4: oxxo\n"
          });
          set({
            cursor: [1, 0]
          });
          return ensure('.', {
            mode: 'normal',
            cursor: [1, 0],
            text: "0:2345\nxx oxxo\nxx oxxo\nxx oxxo\nxx oxxo\n"
          });
        });
      });
    });
    describe('the m keybinding', function() {
      var ensureMarkByMode;
      ensureMarkByMode = function(mode) {
        var _ensure;
        _ensure = bindEnsureOption({
          mode: mode
        });
        _ensure("m a", {
          mark: {
            "a": [0, 2]
          }
        });
        _ensure("l m a", {
          mark: {
            "a": [0, 3]
          }
        });
        _ensure("j m a", {
          mark: {
            "a": [1, 3]
          }
        });
        _ensure("j m b", {
          mark: {
            "a": [1, 3],
            "b": [2, 3]
          }
        });
        return _ensure("l m c", {
          mark: {
            "a": [1, 3],
            "b": [2, 3],
            "c": [2, 4]
          }
        });
      };
      beforeEach(function() {
        return set({
          textC: "0:| 12\n1: 34\n2: 56"
        });
      });
      it("[normal] can mark multiple positon", function() {
        return ensureMarkByMode("normal");
      });
      it("[vC] can mark", function() {
        keystroke("v");
        return ensureMarkByMode(["visual", "characterwise"]);
      });
      return it("[vL] can mark", function() {
        keystroke("V");
        return ensureMarkByMode(["visual", "linewise"]);
      });
    });
    describe('the R keybinding', function() {
      beforeEach(function() {
        return set({
          text: "12345\n67890",
          cursor: [0, 2]
        });
      });
      it("enters replace mode and replaces characters", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("ab");
        return ensure('escape', {
          text: "12ab5\n67890",
          cursor: [0, 3],
          mode: 'normal'
        });
      });
      it("continues beyond end of line as insert", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("abcde");
        return ensure('escape', {
          text: '12abcde\n67890'
        });
      });
      it('treats backspace as undo', function() {
        editor.insertText("foo");
        keystroke('R');
        editor.insertText("a");
        editor.insertText("b");
        ensure({
          text: "12fooab5\n67890"
        });
        ensure('backspace', {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure({
          text: "12fooac5\n67890"
        });
        ensure('backspace backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
        return ensure('backspace', {
          text: "12foo345\n67890",
          selectedText: ''
        });
      });
      it("can be repeated", function() {
        keystroke('R');
        editor.insertText("ab");
        keystroke('escape');
        set({
          cursor: [1, 2]
        });
        ensure('.', {
          text: "12ab5\n67ab0",
          cursor: [1, 3]
        });
        set({
          cursor: [0, 4]
        });
        return ensure('.', {
          text: "12abab\n67ab0",
          cursor: [0, 5]
        });
      });
      it("can be interrupted by arrow keys and behave as insert for repeat", function() {});
      it("repeats correctly when backspace was used in the text", function() {
        keystroke('R');
        editor.insertText("a");
        keystroke('backspace');
        editor.insertText("b");
        keystroke('escape');
        set({
          cursor: [1, 2]
        });
        ensure('.', {
          text: "12b45\n67b90",
          cursor: [1, 2]
        });
        set({
          cursor: [0, 4]
        });
        return ensure('.', {
          text: "12b4b\n67b90",
          cursor: [0, 4]
        });
      });
      it("doesn't replace a character if newline is entered", function() {
        ensure('R', {
          mode: ['insert', 'replace']
        });
        editor.insertText("\n");
        return ensure('escape', {
          text: "12\n345\n67890"
        });
      });
      return describe("multiline situation", function() {
        var textOriginal;
        textOriginal = "01234\n56789";
        beforeEach(function() {
          return set({
            text: textOriginal,
            cursor: [0, 0]
          });
        });
        it("replace character unless input isnt new line(\\n)", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("a\nb\nc");
          return ensure({
            text: "a\nb\nc34\n56789",
            cursor: [2, 1]
          });
        });
        it("handle backspace", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          set({
            cursor: [0, 1]
          });
          editor.insertText("a\nb\nc");
          ensure({
            text: "0a\nb\nc4\n56789",
            cursor: [2, 1]
          });
          ensure('backspace', {
            text: "0a\nb\n34\n56789",
            cursor: [2, 0]
          });
          ensure('backspace', {
            text: "0a\nb34\n56789",
            cursor: [1, 1]
          });
          ensure('backspace', {
            text: "0a\n234\n56789",
            cursor: [1, 0]
          });
          ensure('backspace', {
            text: "0a234\n56789",
            cursor: [0, 2]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          ensure('backspace', {
            text: "01234\n56789",
            cursor: [0, 1]
          });
          return ensure('escape', {
            text: "01234\n56789",
            cursor: [0, 0],
            mode: 'normal'
          });
        });
        it("repeate multiline text case-1", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\ndef");
          ensure({
            text: "abc\ndef\n56789",
            cursor: [1, 3]
          });
          ensure('escape', {
            cursor: [1, 2],
            mode: 'normal'
          });
          ensure('u', {
            text: textOriginal
          });
          ensure('.', {
            text: "abc\ndef\n56789",
            cursor: [1, 2],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\ndef\n56abc\ndef",
            cursor: [3, 2],
            mode: 'normal'
          });
        });
        return it("repeate multiline text case-2", function() {
          ensure('R', {
            mode: ['insert', 'replace']
          });
          editor.insertText("abc\nd");
          ensure({
            text: "abc\nd4\n56789",
            cursor: [1, 1]
          });
          ensure('escape', {
            cursor: [1, 0],
            mode: 'normal'
          });
          return ensure('j .', {
            text: "abc\nd4\nabc\nd9",
            cursor: [3, 0],
            mode: 'normal'
          });
        });
      });
    });
    describe('AddBlankLineBelow, AddBlankLineAbove', function() {
      beforeEach(function() {
        set({
          textC: "line0\nli|ne1\nline2\nline3"
        });
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus.normal-mode': {
            'enter': 'vim-mode-plus:add-blank-line-below',
            'shift-enter': 'vim-mode-plus:add-blank-line-above'
          }
        });
      });
      it("insert blank line below/above", function() {
        ensure("enter", {
          textC: "line0\nli|ne1\n\nline2\nline3"
        });
        return ensure("shift-enter", {
          textC: "line0\n\nli|ne1\n\nline2\nline3"
        });
      });
      return it("[with-count] insert blank line below/above", function() {
        ensure("2 enter", {
          textC: "line0\nli|ne1\n\n\nline2\nline3"
        });
        return ensure("2 shift-enter", {
          textC: "line0\n\n\nli|ne1\n\n\nline2\nline3"
        });
      });
    });
    return describe('Select as operator', function() {
      beforeEach(function() {
        settings.set('keymapSToSelect', true);
        return jasmine.attachToDOM(editorElement);
      });
      return describe("select by target", function() {
        beforeEach(function() {
          return set({
            textC: "0 |ooo xxx ***\n1 xxx *** ooo\n\n3 ooo xxx ***\n4 xxx *** ooo\n"
          });
        });
        it("select text-object", function() {
          return ensure("s p", {
            mode: ["visual", "linewise"],
            selectedText: "0 ooo xxx ***\n1 xxx *** ooo\n",
            propertyHead: [1, 13]
          });
        });
        it("select by motion j with stayOnSelectTextObject", function() {
          settings.set("stayOnSelectTextObject", true);
          return ensure("s i p", {
            mode: ["visual", "linewise"],
            selectedText: "0 ooo xxx ***\n1 xxx *** ooo\n",
            propertyHead: [1, 2]
          });
        });
        it("select occurrence in text-object with occurrence-modifier", function() {
          return ensure("s o p", {
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]]]
          });
        });
        it("select occurrence in text-object with preset-occurrence", function() {
          return ensure("g o s p", {
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]]]
          });
        });
        it("convert presistent-selection into normal selection", function() {
          ensure("v j enter", {
            mode: "normal",
            persistentSelectionCount: 1,
            persistentSelectionBufferRange: [[[0, 2], [1, 3]]]
          });
          ensure("j j v j", {
            persistentSelectionCount: 1,
            persistentSelectionBufferRange: [[[0, 2], [1, 3]]],
            mode: ["visual", "characterwise"],
            selectedText: "ooo xxx ***\n4 x"
          });
          return ensure("s", {
            mode: ["visual", "characterwise"],
            persistentSelectionCount: 0,
            selectedTextOrdered: ["ooo xxx ***\n1 x", "ooo xxx ***\n4 x"]
          });
        });
        it("select preset-occurrence in presistent-selection and normal selection", function() {
          ensure("g o", {
            occurrenceText: ['ooo', 'ooo', 'ooo', 'ooo']
          });
          ensure("V j enter G V", {
            persistentSelectionCount: 1,
            mode: ["visual", "linewise"],
            selectedText: "4 xxx *** ooo\n"
          });
          return ensure("s", {
            persistentSelectionCount: 0,
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]], [[4, 10], [4, 13]]]
          });
        });
        it("select by motion $", function() {
          return ensure("s $", {
            mode: ["visual", "characterwise"],
            selectedText: "ooo xxx ***\n"
          });
        });
        it("select by motion j", function() {
          return ensure("s j", {
            mode: ["visual", "linewise"],
            selectedText: "0 ooo xxx ***\n1 xxx *** ooo\n"
          });
        });
        it("select by motion j v-modifier", function() {
          return ensure("s v j", {
            mode: ["visual", "characterwise"],
            selectedText: "ooo xxx ***\n1 x"
          });
        });
        it("select occurrence by motion G", function() {
          return ensure("s o G", {
            mode: ["visual", "characterwise"],
            selectedText: ["ooo", "ooo", "ooo", "ooo"],
            selectedBufferRangeOrdered: [[[0, 2], [0, 5]], [[1, 10], [1, 13]], [[3, 2], [3, 5]], [[4, 10], [4, 13]]]
          });
        });
        it("select occurrence by motion G with explicit V-modifier", function() {
          return ensure("s o V G", {
            mode: ["visual", "linewise"],
            selectedTextOrdered: ["0 ooo xxx ***\n1 xxx *** ooo\n", "3 ooo xxx ***\n4 xxx *** ooo\n"]
          });
        });
        it("return to normal-mode when fail to select", function() {
          ensure("s i f", {
            mode: "normal",
            cursor: [0, 2]
          });
          return ensure("s f z", {
            mode: "normal",
            cursor: [0, 2]
          });
        });
        return describe("complex scenario", function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return runs(function() {
              return set({
                grammar: 'source.js',
                textC: "const result = []\nfor (const !member of members) {\n  let member2 = member + member\n  let member3 = member + member + member\n  result.push(member2, member3)\n}\n"
              });
            });
          });
          return it("select occurrence in a-fold ,reverse(o) then escape to normal-mode", function() {
            return ensure("s o z o escape", {
              mode: "normal",
              textC: "const result = []\nfor (const |member of members) {\n  let member2 = |member + |member\n  let member3 = |member + |member + |member\n  result.push(member2, member3)\n}\n"
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLWdlbmVyYWwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxPQUFnRyxFQUFoRyxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLDBCQUFkLEVBQWdDLDBCQUFoQyxFQUFrRCxtQkFBbEQsRUFBNkQsZ0JBQTdELEVBQXFFLHVCQUFyRSxFQUFvRjtJQUVwRixVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHVDQUFkLEVBQWdDLHVDQUFoQyxFQUFrRCx5QkFBbEQsRUFBK0Q7TUFIckQsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTthQUNoQyxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtRQUM1QixTQUFBLENBQVUsR0FBVjtRQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQXhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLEtBQS9DO1FBQ0EsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFyQixDQUFBO1FBQ0EsTUFBQSxDQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBeEIsQ0FBQSxDQUFQLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsSUFBL0M7ZUFDQSxNQUFBLENBQU8sU0FBQTtpQkFB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Q25CLGdDQURtQixFQUVuQixnQ0FGbUIsQ0FEckI7V0FERjtRQUQyRCxDQUE3RDtRQVFBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBO1VBRTlDLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sUUFBTjtZQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7V0FERjtpQkFLQSxNQUFBLENBQU8sT0FBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLFFBQU47WUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREY7UUFQOEMsQ0FBaEQ7ZUFXQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtVQUMzQixVQUFBLENBQVcsU0FBQTtZQUNULGVBQUEsQ0FBZ0IsU0FBQTtxQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCO1lBRGMsQ0FBaEI7bUJBR0EsSUFBQSxDQUFLLFNBQUE7cUJBQ0gsR0FBQSxDQUNFO2dCQUFBLE9BQUEsRUFBUyxXQUFUO2dCQUNBLEtBQUEsRUFBTyxzS0FEUDtlQURGO1lBREcsQ0FBTDtVQUpTLENBQVg7aUJBZ0JBLEVBQUEsQ0FBRyxvRUFBSCxFQUF5RSxTQUFBO21CQUN2RSxNQUFBLENBQU8sZ0JBQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxRQUFOO2NBQ0EsS0FBQSxFQUFPLDJLQURQO2FBREY7VUFEdUUsQ0FBekU7UUFqQjJCLENBQTdCO01BakkyQixDQUE3QjtJQUw2QixDQUEvQjtFQWg5QzJCLENBQTdCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgZ2VuZXJhbFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVuc3VyZUJ5RGlzcGF0Y2gsIGJpbmRFbnN1cmVPcHRpb24sIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlQnlEaXNwYXRjaCwgYmluZEVuc3VyZU9wdGlvbiwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiY2FuY2VsbGluZyBvcGVyYXRpb25zXCIsIC0+XG4gICAgaXQgXCJjbGVhciBwZW5kaW5nIG9wZXJhdGlvblwiLCAtPlxuICAgICAga2V5c3Ryb2tlICcvJ1xuICAgICAgZXhwZWN0KHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLmlzRW1wdHkoKSkudG9CZSBmYWxzZVxuICAgICAgdmltU3RhdGUuc2VhcmNoSW5wdXQuY2FuY2VsKClcbiAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUgdHJ1ZVxuICAgICAgZXhwZWN0KC0+IHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpKS5ub3QudG9UaHJvdygpXG5cbiAgZGVzY3JpYmUgXCJ0aGUgeCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJvbiBhIGxpbmUgd2l0aCBjb250ZW50XCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGhvdXQgdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxuXFxueHl6XCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIGEgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMjM1XFxuXFxueHl6JywgY3Vyc29yOiBbMSwgNF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNCdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyM1xcblxcbnh5eicgLCBjdXJzb3I6IFsxLCAzXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc1J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTJcXG5cXG54eXonICAsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzMnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxXFxuXFxueHl6JyAgICwgY3Vyc29yOiBbMSwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMidcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMFxcblxcbnh5eicgICAgLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG5cXG5cXG54eXonICAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAnXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIG11bHRpcGxlIGNoYXJhY3RlcnMgd2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICcyIHgnLCB0ZXh0OiAnYWJjXFxuMDEyM1xcblxcbnh5eicsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzQ1J1xuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSAnMyB4JyxcbiAgICAgICAgICAgIHRleHQ6ICdhXFxuMDEyM1xcblxcbnh5eidcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2JjJ1xuXG4gICAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiXG4gICAgICAgICAgICBjdXJzb3I6IFtbMSwgNF0sIFswLCAxXV1cblxuICAgICAgICBpdCBcImlzIHVuZG9uZSBhcyBvbmUgb3BlcmF0aW9uXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogXCJhY1xcbjAxMjM1XFxuXFxueHl6XCJcbiAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiAnYWJjXFxuMDEyMzQ1XFxuXFxueHl6J1xuXG4gICAgICBkZXNjcmliZSBcIndpdGggdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogJ2FiY1xcbjAxMjM0NVxcblxcbnh5eicsIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcblxuICAgICAgICBpdCBcImRlbGV0ZXMgYSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgICAjIGNvcHkgb2YgdGhlIGVhcmxpZXIgdGVzdCBiZWNhdXNlIHdyYXBMZWZ0UmlnaHRNb3Rpb24gc2hvdWxkIG5vdCBhZmZlY3QgaXRcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyMzVcXG5cXG54eXonLCBjdXJzb3I6IFsxLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JyAsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzUnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMlxcblxcbnh5eicgICwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMydcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDFcXG5cXG54eXonICAgLCBjdXJzb3I6IFsxLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcyJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wXFxuXFxueHl6JyAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzEnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcblxcblxcbnh5eicgICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcblxuICAgICAgICBpdCBcImRlbGV0ZXMgbXVsdGlwbGUgY2hhcmFjdGVycyBhbmQgbmV3bGluZXMgd2l0aCBhIGNvdW50XCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmUgJzIgeCcsIHRleHQ6ICdhYmNcXG4wMTIzXFxuXFxueHl6JywgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNDUnXG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlICczIHgnLCB0ZXh0OiAnYTAxMjNcXG5cXG54eXonLCBjdXJzb3I6IFswLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdiY1xcbidcbiAgICAgICAgICBlbnN1cmUgJzcgeCcsIHRleHQ6ICdheXonLCBjdXJzb3I6IFswLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwMTIzXFxuXFxueCdcblxuICAgIGRlc2NyaWJlIFwib24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIiwgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZSB3aGVuIHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvbiBpcyBmYWxzZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCBmYWxzZSlcbiAgICAgICAgZW5zdXJlICd4JywgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIiwgY3Vyc29yOiBbMiwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIGFuIGVtcHR5IGxpbmUgd2hlbiB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgdHJ1ZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcbnh5elwiLCBjdXJzb3I6IFsyLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIFgga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwib24gYSBsaW5lIHdpdGggY29udGVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJhYlxcbjAxMjM0NVwiLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgYSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiXFxuMDIzNDUnLCBjdXJzb3I6IFsxLCAxXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxJ1xuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWJcXG4yMzQ1JywgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMCdcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiXFxuMjM0NScsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAnXG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6ICdhYjIzNDUnLCBjdXJzb3I6IFswLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdcXG4nXG5cbiAgICBkZXNjcmliZSBcIm9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyBub3RoaW5nIHdoZW4gdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uIGlzIGZhbHNlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIGZhbHNlKVxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiBcIjAxMjM0NVxcblxcbmFiY2RlZlwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIG5ld2xpbmUgd2hlbiB3cmFwTGVmdFJpZ2h0TW90aW9uIGlzIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogXCIwMTIzNDVcXG5hYmNkZWZcIiwgY3Vyc29yOiBbMCwgNV1cblxuICBkZXNjcmliZSBcInRoZSBkIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgMTIzNDVcbiAgICAgICAgICBhYmNkZVxuXG4gICAgICAgICAgQUJDREVcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMSwgMV1cblxuICAgIGl0IFwiZW50ZXJzIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgZW5zdXJlICdkJywgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBkXCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIGN1cnJlbnQgbGluZSBhbmQgZXhpdHMgb3BlcmF0b3ItcGVuZGluZyBtb2RlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2QgZCcsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuXG4gICAgICAgICAgICBBQkNERVxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJhYmNkZVxcblwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBsYXN0IGxpbmUgYW5kIGFsd2F5cyBtYWtlIG5vbi1ibGFuay1saW5lIGxhc3QgbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgZW5zdXJlICcyIGQgZCcsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgYWJjZGVcXG5cbiAgICAgICAgICAgIFwiXCJcIixcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcImxlYXZlcyB0aGUgY3Vyc29yIG9uIHRoZSBmaXJzdCBub25ibGFuayBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDEyMzR8NVxuICAgICAgICAgICAgYWJjZGVcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdkIGQnLFxuICAgICAgICAgIHRleHRDOiBcIiAgfGFiY2RlXFxuXCJcblxuICAgIGRlc2NyaWJlIFwidW5kbyBiZWhhdmlvclwiLCAtPlxuICAgICAgW29yaWdpbmFsVGV4dCwgaW5pdGlhbFRleHRDXSA9IFtdXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGluaXRpYWxUZXh0QyA9IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgYXxiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBRV0VSVFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICBvcmlnaW5hbFRleHQgPSBlZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAgIGl0IFwidW5kb2VzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIDIgZCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgfFFXRVJUXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgICBkZXNjcmliZSBcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8gaXMgdHJ1ZShkZWZhdWx0KVwiLCAtPlxuICAgICAgICAgIGl0IFwiY2xlYXIgbXVsdGlwbGUgY3Vyc29ycyBhbmQgc2V0IGN1cnNvciB0byBzdGFydCBvZiBjaGFuZ2VzIG9mIGxhc3QgY3Vyc29yXCIsIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDFdXVxuXG4gICAgICAgICAgICBlbnN1cmUgJ2QgbCcsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDIzNDVcbiAgICAgICAgICAgICAgYXxjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgICAgYXxiY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgICAgICAgIGVuc3VyZSAnY3RybC1yJyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAyMzQ1XG4gICAgICAgICAgICAgIGF8Y2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgICAgICBpdCBcImNsZWFyIG11bHRpcGxlIGN1cnNvcnMgYW5kIHNldCBjdXJzb3IgdG8gc3RhcnQgb2YgY2hhbmdlcyBvZiBsYXN0IGN1cnNvclwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dFxuICAgICAgICAgICAgICBjdXJzb3I6IFtbMSwgMV0sIFswLCAwXV1cblxuICAgICAgICAgICAgZW5zdXJlICdkIGwnLFxuICAgICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMjM0NVxuICAgICAgICAgICAgICBhY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBjdXJzb3I6IFtbMSwgMV0sIFswLCAwXV1cblxuICAgICAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgICAgYWJjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICAgICAgZW5zdXJlICdjdHJsLXInLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwyMzQ1XG4gICAgICAgICAgICAgIGFjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgICBkZXNjcmliZSBcInNldEN1cnNvclRvU3RhcnRPZkNoYW5nZU9uVW5kb1JlZG8gaXMgZmFsc2VcIiwgLT5cbiAgICAgICAgICBpbml0aWFsVGV4dEMgPSBudWxsXG5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBpbml0aWFsVGV4dEMgPSBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgICAgIGF8YmNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgICAgc2V0dGluZ3Muc2V0KCdzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvJywgZmFsc2UpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICAgICAgZW5zdXJlICdkIGwnLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwyMzQ1XG4gICAgICAgICAgICAgIGF8Y2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgaXQgXCJwdXQgY3Vyc29yIHRvIGVuZCBvZiBjaGFuZ2UgKHdvcmtzIGluIHNhbWUgd2F5IG9mIGF0b20ncyBjb3JlOnVuZG8pXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgICAgICB0ZXh0QzogaW5pdGlhbFRleHRDXG4gICAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogWycnLCAnJ11cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHdcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbmV4dCB3b3JkIHVudGlsIHRoZSBlbmQgb2YgdGhlIGxpbmUgYW5kIGV4aXRzIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2FiY2QgZWZnXFxuYWJjJywgY3Vyc29yOiBbMCwgNV1cbiAgICAgICAgZW5zdXJlICdkIHcnLFxuICAgICAgICAgIHRleHQ6IFwiYWJjZCBcXG5hYmNcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJkZWxldGVzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogJ2FiY2QgZWZnJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdkIHcnLCB0ZXh0OiAnYWJlZmcnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUgZm91cicsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCAzIHcnLCB0ZXh0OiAnZm91cicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYW4gaXdcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgY29udGFpbmluZyB3b3JkXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEyMzQ1IGFiY2RlIEFCQ0RFXCIsIGN1cnNvcjogWzAsIDldXG5cbiAgICAgICAgZW5zdXJlICdkJywgbW9kZTogJ29wZXJhdG9yLXBlbmRpbmcnXG5cbiAgICAgICAgZW5zdXJlICdpIHcnLFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDUgIEFCQ0RFXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWJjZGUnXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGpcIiwgLT5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxcblxuICAgICAgICBcIlwiXCJcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIG5leHQgdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIGonLCB0ZXh0OiAnQUJDREVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGxhc3QgdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIGonLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gYmxhbmsgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgYVxuXG5cbiAgICAgICAgICAgICAgYlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlcyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIGonLCB0ZXh0OiBcImFcXG5iXFxuXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYW4ga1wiLCAtPlxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICAgIDEyMzQ1XG4gICAgICAgIGFiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgZW5kIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCA0XVxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogJzEyMzQ1XFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgeGl0IFwiZGVsZXRlcyBub3RoaW5nXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIGsnLCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIG9uIHRoZSBtaWRkbGUgb2Ygc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBmaXJzdCB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6ICdBQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIGN1cnNvciBpcyBvbiBibGFuayBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICBhXG5cblxuICAgICAgICAgICAgICBiXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgY3Vyc29yOiBbMiwgMF1cbiAgICAgICAgaXQgXCJkZWxldGVzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6IFwiYVxcbmJcXG5cIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIEcnLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIEcnLCB0ZXh0OiAnMTIzNDVcXG4nXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBnb3RvIGxpbmUgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ2QgMiBHJywgdGV4dDogJzEyMzQ1XFxuQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIDIgRycsIHRleHQ6ICcxMjM0NVxcbkFCQ0RFJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgdClcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwid2l0aCB0aGUgZW50aXJlIGxpbmUgeWFua2VkIGJlZm9yZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwidGVzdCAoeHl6KVwiLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgICAgIGl0IFwiZGVsZXRlcyB1bnRpbCB0aGUgY2xvc2luZyBwYXJlbnRoZXNpc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCB0ICknLFxuICAgICAgICAgICAgdGV4dDogJ3Rlc3QgKCknXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgIGl0IFwiZGVsZXRlcyBlYWNoIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIDEyMzRcbiAgICAgICAgICAgIEFCQ0RcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzEsIDJdLCBbMiwgM11dXG5cbiAgICAgICAgZW5zdXJlICdkIGUnLFxuICAgICAgICAgIHRleHQ6IFwiYVxcbjEyXFxuQUJDXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAxXSwgWzIsIDJdXVxuXG4gICAgICBpdCBcImRvZXNuJ3QgZGVsZXRlIGVtcHR5IHNlbGVjdGlvbnNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhYmNkXFxuYWJjXFxuYWJkXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXSwgWzIsIDBdXVxuXG4gICAgICAgIGVuc3VyZSAnZCB0IGQnLFxuICAgICAgICAgIHRleHQ6IFwiZFxcbmFiY1xcbmRcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdLCBbMiwgMF1dXG5cbiAgICBkZXNjcmliZSBcInN0YXlPbkRlbGV0ZSBzZXR0aW5nXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uRGVsZXRlJywgdHJ1ZSlcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fXzMzMzNcbiAgICAgICAgICBfXzIyMjJcbiAgICAgICAgICBfMTExMVxuICAgICAgICAgIF9fMjIyMlxuICAgICAgICAgIF9fXzMzMzNcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgICBkZXNjcmliZSBcInRhcmdldCByYW5nZSBpcyBsaW5ld2lzZSByYW5nZVwiLCAtPlxuICAgICAgICBpdCBcImtlZXAgb3JpZ2luYWwgY29sdW1uIGFmdGVyIGRlbGV0ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgZFwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX18yMjIyXFxuXzExMTFcXG5fXzIyMjJcXG5fX18zMzMzXFxuXCJcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfMTExMVxcbl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuICAgICAgICAgIGVuc3VyZSBcIi5cIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl9fXzMzMzNcXG5cIlxuXG4gICAgICAgIGl0IFwidl9EIGFsc28ga2VlcCBvcmlnaW5hbCBjb2x1bW4gYWZ0ZXIgZGVsZXRlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwidiAyIGogRFwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiX18yMjIyXFxuX19fMzMzM1xcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IHJhbmdlIGlzIHRleHQgb2JqZWN0XCIsIC0+XG4gICAgICAgIGRlc2NyaWJlIFwidGFyZ2V0IGlzIGluZGVudFwiLCAtPlxuICAgICAgICAgIGluZGVudFRleHQgPSBcIlwiXCJcbiAgICAgICAgICAwMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgICAgICAyMjIyMjIyMjIyMjIyMlxuICAgICAgICAgICAgMjIyMjIyMjIyMjIyMjJcbiAgICAgICAgICAgIDIyMjIyMjIyMjIyMjIyXG4gICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMFxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHRleHREYXRhID0gbmV3IFRleHREYXRhKGluZGVudFRleHQpXG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IHRleHREYXRhLmdldFJhdygpXG5cbiAgICAgICAgICBpdCBcIltmcm9tIHRvcF0ga2VlcCBjb2x1bW5cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIGknLCBjdXJzb3I6IFsxLCAxMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFswLCA0XSlcbiAgICAgICAgICBpdCBcIltmcm9tIG1pZGRsZV0ga2VlcCBjb2x1bW5cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIGknLCBjdXJzb3I6IFsxLCAxMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFswLCA0XSlcbiAgICAgICAgICBpdCBcIltmcm9tIGJvdHRvbV0ga2VlcCBjb2x1bW5cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFszLCAxMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIGknLCBjdXJzb3I6IFsxLCAxMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFswLCA0XSlcblxuICAgICAgICBkZXNjcmliZSBcInRhcmdldCBpcyBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgICBwYXJhZ3JhcGhUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgICBwMS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDEtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAxLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgICAgIHAyLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMi0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDItLS0tLS0tLS0tLS0tLS1cblxuICAgICAgICAgICAgcDMtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAzLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMy0tLS0tLS0tLS0tLS0tLVxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICB0ZXh0RGF0YSA9IG5ldyBUZXh0RGF0YShwYXJhZ3JhcGhUZXh0KVxuICAgICAgICAgIFAxID0gWzAsIDEsIDJdXG4gICAgICAgICAgQjEgPSAzXG4gICAgICAgICAgUDIgPSBbNCwgNSwgNl1cbiAgICAgICAgICBCMiA9IDdcbiAgICAgICAgICBQMyA9IFs4LCA5LCAxMF1cbiAgICAgICAgICBCMyA9IDExXG5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dDogdGV4dERhdGEuZ2V0UmF3KClcblxuICAgICAgICAgIGl0IFwic2V0IGN1cnNvciB0byBzdGFydCBvZiBkZWxldGlvbiBhZnRlciBkZWxldGUgW2Zyb20gYm90dG9tIG9mIHBhcmFncmFwaF1cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgcCcsIGN1cnNvcjogWzAsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEuLkIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJ2ogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBQMy4uLiwgQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgaXQgXCJzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGRlbGV0aW9uIGFmdGVyIGRlbGV0ZSBbZnJvbSBtaWRkbGUgb2YgcGFyYWdyYXBoXVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBwJywgY3Vyc29yOiBbMCwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMS4uQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMiBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgUDMuLi4sIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJzIgaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgaXQgXCJzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGRlbGV0aW9uIGFmdGVyIGRlbGV0ZSBbZnJvbSBib3R0b20gb2YgcGFyYWdyYXBoXVwiLCAtPlxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBwJywgY3Vyc29yOiBbMCwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMS4uQjNdLCBjaG9tcDogdHJ1ZSlcbiAgICAgICAgICAgIGVuc3VyZSAnMyBqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgUDMuLi4sIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJzMgaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIEIzXSwgY2hvbXA6IHRydWUpXG5cbiAgZGVzY3JpYmUgXCJ0aGUgRCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwMDAwXG4gICAgICAgIDExMTFcbiAgICAgICAgMjIyMlxuICAgICAgICAzMzMzXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgXCJkZWxldGVzIHRoZSBjb250ZW50cyB1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJ0QnLCB0ZXh0OiBcIjBcXG4xMTExXFxuMjIyMlxcbjMzMzNcIlxuXG4gICAgaXQgXCJpbiB2aXN1YWwtbW9kZSwgaXQgZGVsZXRlIHdob2xlIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBEJywgdGV4dDogXCIxMTExXFxuMjIyMlxcbjMzMzNcIlxuICAgICAgZW5zdXJlIFwidiBqIERcIiwgdGV4dDogXCIzMzMzXCJcblxuICBkZXNjcmliZSBcInRoZSB5IGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAwMTIgfDM0NVxuICAgICAgICBhYmNcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgZW5hYmxlZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoJ19fX19fX19fX19fJylcbiAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnX19fX19fX19fX18nXG5cbiAgICAgIGRlc2NyaWJlIFwicmVhZC93cml0ZSB0byBjbGlwYm9hcmQgdGhyb3VnaCByZWdpc3RlclwiLCAtPlxuICAgICAgICBpdCBcIndyaXRlcyB0byBjbGlwYm9hcmQgd2l0aCBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgc2F2ZWRUZXh0ID0gJzAxMiAzNDVcXG4nXG4gICAgICAgICAgZW5zdXJlICd5IHknLCByZWdpc3RlcjogJ1wiJzogdGV4dDogc2F2ZWRUZXh0XG4gICAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9CZShzYXZlZFRleHQpXG5cbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmxpbmV3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDAwMDB8MDBcbiAgICAgICAgICAgIDExMTExMVxuICAgICAgICAgICAgMjIyMjIyXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gbm90IHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2F2ZXMgdG8gcmVnaXN0ZXIodHlwZT1saW5ld2lzZSksIGN1cnNvciBtb3ZlIHRvIHN0YXJ0IG9mIHRhcmdldFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcIlYgaiB5XCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDAwMDAwXFxuMTExMTExXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSdcblxuICAgICAgZGVzY3JpYmUgXCJzZWxlY3Rpb24gaXMgcmV2ZXJzZWRcIiwgLT5cbiAgICAgICAgaXQgXCJzYXZlcyB0byByZWdpc3Rlcih0eXBlPWxpbmV3aXNlKSwgY3Vyc29yIGRvZXNuJ3QgbW92ZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICAgIGVuc3VyZSBcIlYgayB5XCIsXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMTExMTExXFxuMjIyMjIyXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSdcblxuICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGUuYmxvY2t3aXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgMDAwMDAwXG4gICAgICAgICAgMSExMTExMVxuICAgICAgICAgIDIyMjIyMlxuICAgICAgICAgIDMzMzMzM1xuICAgICAgICAgIDR8NDQ0NDRcbiAgICAgICAgICA1NTU1NTVcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiY3RybC12IGwgbCBqXCIsXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMTExXCIsIFwiMjIyXCIsIFwiNDQ0XCIsIFwiNTU1XCJdXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHN0YXlPbllhbmsgPSBmYWxzZVwiLCAtPlxuICAgICAgICBpdCBcInBsYWNlIGN1cnNvciBhdCBzdGFydCBvZiBibG9jayBhZnRlciB5YW5rXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieVwiLFxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgIDAwMDAwMFxuICAgICAgICAgICAgICAxITExMTExXG4gICAgICAgICAgICAgIDIyMjIyMlxuICAgICAgICAgICAgICAzMzMzMzNcbiAgICAgICAgICAgICAgNHw0NDQ0NFxuICAgICAgICAgICAgICA1NTU1NTVcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3RheU9uWWFuayA9IHRydWVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uWWFuaycsIHRydWUpXG4gICAgICAgIGl0IFwicGxhY2UgY3Vyc29yIGF0IGhlYWQgb2YgYmxvY2sgYWZ0ZXIgeWFua1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInlcIixcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAwMDAwMDBcbiAgICAgICAgICAgICAgMTExMTExXG4gICAgICAgICAgICAgIDIyMiEyMjJcbiAgICAgICAgICAgICAgMzMzMzMzXG4gICAgICAgICAgICAgIDQ0NDQ0NFxuICAgICAgICAgICAgICA1NTV8NTU1XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ5IHlcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgdG8gcmVnaXN0ZXIodHlwZT1saW5ld2lzZSksIGN1cnNvciBzdGF5IGF0IHNhbWUgcG9zaXRpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IHknLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcblwiLCB0eXBlOiAnbGluZXdpc2UnXG4gICAgICBpdCBcIltOIHkgeV0geWFuayBOIGxpbmUsIHN0YXJ0aW5nIGZyb20gdGhlIGN1cnJlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IDIgeScsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuYWJjXFxuXCJcbiAgICAgIGl0IFwiW3kgTiB5XSB5YW5rIE4gbGluZSwgc3RhcnRpbmcgZnJvbSB0aGUgY3VycmVudFwiLCAtPlxuICAgICAgICBlbnN1cmUgJzIgeSB5JyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5hYmNcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgdGhlIGxpbmUgdG8gdGhlIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdcIiBhIHkgeScsXG4gICAgICAgICAgcmVnaXN0ZXI6IGE6IHRleHQ6IFwiMDEyIDM0NVxcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggQSByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJhcHBlbmQgdG8gZXhpc3RpbmcgdmFsdWUgb2YgbG93ZXJjYXNlLW5hbWVkIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IHknLCByZWdpc3RlcjogYTogdGV4dDogXCIwMTIgMzQ1XFxuXCJcbiAgICAgICAgZW5zdXJlICdcIiBBIHkgeScsIHJlZ2lzdGVyOiBhOiB0ZXh0OiBcIjAxMiAzNDVcXG4wMTIgMzQ1XFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIG1vdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2UpXG5cbiAgICAgIGl0IFwieWFuayBmcm9tIGhlcmUgdG8gZGVzdG5hdGlvbiBvZiBtb3Rpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGUnLCBjdXJzb3I6IFswLCA0XSwgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnMzQ1J31cblxuICAgICAgaXQgXCJkb2VzIG5vdCB5YW5rIHdoZW4gbW90aW9uIGZhaWxlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgdCB4JywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiB1bmRlZmluZWR9XG5cbiAgICAgIGl0IFwieWFuayBhbmQgbW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBoJyxcbiAgICAgICAgICBjdXJzb3I6IFswLCAzXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnICdcblxuICAgICAgaXQgXCJbd2l0aCBsaW5ld2lzZSBtb3Rpb25dIHlhbmsgYW5kIGRlc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgaicsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiMDEyIDM0NVxcbmFiY1xcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgdGV4dC1vYmpcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMiwgOF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcblxuICAgICAgICAgIDFzdCBwYXJhZ3JhcGhcbiAgICAgICAgICAxc3QgcGFyYWdyYXBoXG5cbiAgICAgICAgICAybiBwYXJhZ3JhcGhcbiAgICAgICAgICAybiBwYXJhZ3JhcGhcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiaW5uZXItd29yZCBhbmQgbW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBpIHcnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcInBhcmFncmFwaFwiXG4gICAgICAgICAgY3Vyc29yOiBbMiwgNF1cblxuICAgICAgaXQgXCJ5YW5rIHRleHQtb2JqZWN0IGlubmVyLXBhcmFncmFwaCBhbmQgbW92ZSBjdXJzb3IgdG8gc3RhcnQgb2YgdGFyZ2V0XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBpIHAnLFxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMXN0IHBhcmFncmFwaFxcbjFzdCBwYXJhZ3JhcGhcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZGVcbiAgICAgICAgQUJDREVcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgaXQgXCJ5YW5rIGFuZCBkb2Vzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBlbnN1cmUgJ3kgRycsXG4gICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBcImFiY2RlXFxuQUJDREVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcInlhbmsgYW5kIGRvZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAneSBHJyxcbiAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjZGVcXG5BQkNERVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBnb3RvIGxpbmUgR1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICBlbnN1cmUgJ3kgMiBHIFAnLCB0ZXh0OiAnMTIzNDVcXG5hYmNkZVxcbmFiY2RlXFxuQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIG1pZGRsZSBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICd5IDIgRyBQJywgdGV4dDogJzEyMzQ1XFxuYWJjZGVcXG5hYmNkZVxcbkFCQ0RFJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgZWFjaCBjdXJzb3IgYW5kIGNvcGllcyB0aGUgbGFzdCBzZWxlY3Rpb24ncyB0ZXh0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiICBhYmNkXFxuICAxMjM0XCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCA1XV1cbiAgICAgICAgZW5zdXJlICd5IF4nLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMTIzJ1xuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDJdXVxuXG4gICAgZGVzY3JpYmUgXCJzdGF5T25ZYW5rIHNldHRpbmdcIiwgLT5cbiAgICAgIHRleHQgPSBudWxsXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnc3RheU9uWWFuaycsIHRydWUpXG5cbiAgICAgICAgdGV4dCA9IG5ldyBUZXh0RGF0YSBcIlwiXCJcbiAgICAgICAgICAwXzIzNDU2N1xuICAgICAgICAgIDFfMjM0NTY3XG4gICAgICAgICAgMl8yMzQ1NjdcblxuICAgICAgICAgIDRfMjM0NTY3XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiB0ZXh0LmdldFJhdygpLCBjdXJzb3I6IFsxLCAyXVxuXG4gICAgICBpdCBcImRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmsgZnJvbSBub3JtYWwtbW9kZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ5IGkgcFwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzAuLjJdKVxuICAgICAgICBlbnN1cmUgXCJqIHkgeVwiLCBjdXJzb3I6IFsyLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzJdKVxuICAgICAgICBlbnN1cmUgXCJrIC5cIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgZW5zdXJlIFwieSBoXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJfXCJcbiAgICAgICAgZW5zdXJlIFwieSBiXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIxX1wiXG5cbiAgICAgIGl0IFwiZG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFuayBmcm9tIHZpc3VhbC1saW5ld2lzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJWIHlcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsxXSlcbiAgICAgICAgZW5zdXJlIFwiViBqIHlcIiwgY3Vyc29yOiBbMiwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0LmdldExpbmVzKFsxLi4yXSlcblxuICAgICAgaXQgXCJkb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rIGZyb20gdmlzdWFsLWNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwidiBsIGwgeVwiLCBjdXJzb3I6IFsxLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0XCJcbiAgICAgICAgZW5zdXJlIFwidiBoIGggeVwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0XCJcbiAgICAgICAgZW5zdXJlIFwidiBqIHlcIiwgY3Vyc29yOiBbMiwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjIzNDU2N1xcbjJfMlwiXG4gICAgICAgIGVuc3VyZSBcInYgMiBrIHlcIiwgY3Vyc29yOiBbMCwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjIzNDU2N1xcbjFfMjM0NTY3XFxuMl8yXCJcblxuICBkZXNjcmliZSBcInRoZSB5eSBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJvbiBhIHNpbmdsZSBsaW5lIGZpbGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiZXhjbGFtYXRpb24hXFxuXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY29waWVzIHRoZSBlbnRpcmUgbGluZSBhbmQgcGFzdGVzIGl0IGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeSBwJyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJleGNsYW1hdGlvbiFcXG5cIlxuICAgICAgICAgIHRleHQ6IFwiZXhjbGFtYXRpb24hXFxuZXhjbGFtYXRpb24hXFxuXCJcblxuICAgIGRlc2NyaWJlIFwib24gYSBzaW5nbGUgbGluZSBmaWxlIHdpdGggbm8gbmV3bGluZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJubyBuZXdsaW5lIVwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcImNvcGllcyB0aGUgZW50aXJlIGxpbmUgYW5kIHBhc3RlcyBpdCBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IHkgcCcsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwibm8gbmV3bGluZSFcXG5cIlxuICAgICAgICAgIHRleHQ6IFwibm8gbmV3bGluZSFcXG5ubyBuZXdsaW5lIVxcblwiXG5cbiAgICAgIGl0IFwiY29waWVzIHRoZSBlbnRpcmUgbGluZSBhbmQgcGFzdGVzIGl0IHJlc3BlY3RpbmcgY291bnQgYW5kIG5ldyBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeSAyIHAnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIm5vIG5ld2xpbmUhXFxuXCJcbiAgICAgICAgICB0ZXh0OiBcIm5vIG5ld2xpbmUhXFxubm8gbmV3bGluZSFcXG5ubyBuZXdsaW5lIVxcblwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgWSBrZXliaW5kaW5nXCIsIC0+XG4gICAgdGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB0ZXh0ID0gXCJcIlwiXG4gICAgICAwMTIgMzQ1XG4gICAgICBhYmNcXG5cbiAgICAgIFwiXCJcIlxuICAgICAgc2V0IHRleHQ6IHRleHQsIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInNhdmVzIHRoZSBsaW5lIHRvIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJ1knLCBjdXJzb3I6IFswLCA0XSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcblwiXG5cbiAgICBpdCBcInlhbmsgdGhlIHdob2xlIGxpbmVzIHRvIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgaiBZJywgY3Vyc29yOiBbMCwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiB0ZXh0XG5cbiAgZGVzY3JpYmUgXCJ0aGUgcCBrZXliaW5kaW5nXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aXRoIHNpbmdsZSBsaW5lIGNoYXJhY3RlciBjb250ZW50c1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgZmFsc2UpXG5cbiAgICAgICAgc2V0IHRleHRDOiBcInwwMTJcXG5cIlxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnYSdcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoXCJjbGlwXCIpXG5cbiAgICAgIGRlc2NyaWJlIFwiZnJvbSB0aGUgZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwicFwiLCB0ZXh0QzogXCIwMzR8NTEyXFxuXCJcblxuICAgICAgZGVzY3JpYmUgXCJhdCB0aGUgZW5kIG9mIGEgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIjAxfDJcXG5cIlxuICAgICAgICBpdCBcInBvc2l0aW9ucyBjdXJzb3IgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwicFwiLCB0ZXh0QzogXCIwMTIzNHw1XFxuXCJcblxuICAgICAgZGVzY3JpYmUgXCJwYXN0ZSB0byBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwicGFzdGUgY29udGVudCB0byB0aGF0IGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDFzdFxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgM3JkXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMm5kJ1xuXG4gICAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDFzdFxuICAgICAgICAgICAgMm58ZFxuICAgICAgICAgICAgM3JkXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGNvbnRlbnRzIGZyb20gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWUpXG4gICAgICAgICAgZW5zdXJlICdwJywgdGV4dEM6IFwiMGNsaXxwMTJcXG5cIlxuXG4gICAgICBkZXNjcmliZSBcImZyb20gYSBzcGVjaWZpZWQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgJ2EnIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdcIiBhIHAnLCB0ZXh0QzogXCIwfGExMlxcblwiLFxuXG4gICAgICBkZXNjcmliZSBcImF0IHRoZSBlbmQgb2YgYSBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyBiZWZvcmUgdGhlIGN1cnJlbnQgbGluZSdzIG5ld2xpbmVcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICBvbmUgfHR3byB0aHJlZVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdkICQgayAkIHAnLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIGFiY2RldHdvIHRocmV8ZVxuICAgICAgICAgICAgb25lX1xuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlsaW5lIGNoYXJhY3RlciBjb250ZW50c1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifDAxMlxcblwiXG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NVxcbjY3OCdcblxuICAgICAgaXQgXCJwIHBsYWNlIGN1cnNvciBhdCBzdGFydCBvZiBtdXRhdGlvblwiLCAtPiBlbnN1cmUgXCJwXCIsIHRleHRDOiBcIjB8MzQ1XFxuNjc4MTJcXG5cIlxuICAgICAgaXQgXCJQIHBsYWNlIGN1cnNvciBhdCBzdGFydCBvZiBtdXRhdGlvblwiLCAtPiBlbnN1cmUgXCJQXCIsIHRleHRDOiBcInwzNDVcXG42NzgwMTJcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGxpbmV3aXNlIGNvbnRlbnRzXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIm9uIGEgc2luZ2xlIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6ICcwfDEyJ1xuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIiAzNDVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cblxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAwMTJcbiAgICAgICAgICAgIF98MzQ1XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcInJlcGxhY2VzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBhbmQgcHV0IGN1cnNvciB0byB0aGUgZmlyc3QgY2hhciBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd2IHAnLCAjICcxJyB3YXMgcmVwbGFjZWRcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAwXG4gICAgICAgICAgICBffDM0NVxuICAgICAgICAgICAgMlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwib24gbXVsdGlwbGUgbGluZXNcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTJcbiAgICAgICAgICAgICAzNDVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIiA0NTZcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ31cblxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyIGF0IG1pZGRsZSBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlIFwicFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMDEyXG4gICAgICAgICAgICAgfDQ1NlxuICAgICAgICAgICAgIDM0NVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlciBhdCBlbmQgb2YgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAwMTJcbiAgICAgICAgICAgICAzNDVcbiAgICAgICAgICAgICB8NDU2XFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBsaW5ld2lzZSBjb250ZW50c1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMDEyXG4gICAgICAgICAgfGFiY1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIgMzQ1XFxuIDY3OFxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIDAxMlxuICAgICAgICAgIGFiY1xuICAgICAgICAgICB8MzQ1XG4gICAgICAgICAgIDY3OFxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBzZXQgZ3JhbW1hcjogJ3NvdXJjZS5qcydcblxuICAgICAgZGVzY3JpYmUgXCJwYXN0ZSB3aXRoIGF1dG8taW5kZW50XCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogXCIgMzQ1XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgaWZ8ICgpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZUJ5RGlzcGF0Y2ggJ3ZpbS1tb2RlLXBsdXM6cHV0LWFmdGVyLXdpdGgtYXV0by1pbmRlbnQnLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIGlmICgpIHtcbiAgICAgICAgICAgICAgfDM0NVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJtdWx0aS1saW5lIHJlZ2lzdGVyIGNvbnRlbnRzIHdpdGggYXV0byBpbmRlbnRcIiwgLT5cbiAgICAgICAgICByZWdpc3RlckNvbnRlbnQgPSBcIlwiXCJcbiAgICAgICAgICAgIGlmKDMpIHtcbiAgICAgICAgICAgICAgaWYoNCkge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiByZWdpc3RlckNvbnRlbnQsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICB8aWYgKDIpIHtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlQnlEaXNwYXRjaCAndmltLW1vZGUtcGx1czpwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICBpZiAoMikge1xuICAgICAgICAgICAgICAgIHxpZigzKSB7XG4gICAgICAgICAgICAgICAgICBpZig0KSB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBwYXN0aW5nIGFscmVhZHkgaW5kZW50ZWQgbXVsdGktbGluZXMgcmVnaXN0ZXIgY29udGVudFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICB8aWYgKDIpIHtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJrZWVwIG9yaWdpbmFsIGxheW91dFwiLCAtPlxuICAgICAgICAgIHJlZ2lzdGVyQ29udGVudCA9IFwiXCJcIlxuICAgICAgICAgICAgICAgYTogMTIzLFxuICAgICAgICAgICAgYmJiYjogNDU2LFxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiByZWdpc3RlckNvbnRlbnQsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgZW5zdXJlQnlEaXNwYXRjaCAndmltLW1vZGUtcGx1czpwdXQtYWZ0ZXItd2l0aC1hdXRvLWluZGVudCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICBpZiAoMikge1xuICAgICAgICAgICAgICAgICAgIHxhOiAxMjMsXG4gICAgICAgICAgICAgICAgYmJiYjogNDU2LFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImtlZXAgb3JpZ2luYWwgbGF5b3V0IFtyZWdpc3RlciBjb250ZW50IGhhdmUgYmxhbmsgcm93XVwiLCAtPlxuICAgICAgICAgIHJlZ2lzdGVyQ29udGVudCA9IFwiXCJcIlxuICAgICAgICAgICAgaWYoMykge1xuICAgICAgICAgICAgX19hYmNcblxuICAgICAgICAgICAgX19kZWZcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIi5yZXBsYWNlKC9fL2csICcgJylcblxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzoge3RleHQ6IHJlZ2lzdGVyQ29udGVudCwgdHlwZTogJ2xpbmV3aXNlJ31cbiAgICAgICAgICBlbnN1cmVCeURpc3BhdGNoICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50JyxcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICBpZiAoMikge1xuICAgICAgICAgICAgICAgIHxpZigzKSB7XG4gICAgICAgICAgICAgICAgICBhYmNcblxuICAgICAgICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAjIEhFUkVcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAgZGVzY3JpYmUgXCJwYXN0aW5nIHR3aWNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXFxuUVdFUlRcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMjMnXG4gICAgICAgIGtleXN0cm9rZSAnMiBwJ1xuXG4gICAgICBpdCBcImluc2VydHMgdGhlIHNhbWUgbGluZSB0d2ljZVwiLCAtPlxuICAgICAgICBlbnN1cmUgdGV4dDogXCIxMjM0NVxcbmFiMTIzMTIzY2RlXFxuQUJDREVcXG5RV0VSVFwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB1bmRvbmVcIiwgLT5cbiAgICAgICAgaXQgXCJyZW1vdmVzIGJvdGggbGluZXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblFXRVJUXCJcblxuICAgIGRlc2NyaWJlIFwic3VwcG9ydCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICBpdCBcInBhc3RlIHRleHQgZm9yIGVhY2ggY3Vyc29yc1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblFXRVJUXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgMF0sIFsyLCAwXV1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ1paWidcbiAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYVpaWmJjZGVcXG5BWlpaQkNERVxcblFXRVJUXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMSwgM10sIFsyLCAzXV1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIHNlbGVjdGlvblwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAnMDEyXFxuJ1xuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICBkZXNjcmliZSBcIndpdGggY2hhcmFjdGVyd2lzZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJyZXBsYWNlcyBzZWxlY3Rpb24gd2l0aCBjaGFyd2lzZSBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjM0NVwiXG4gICAgICAgICAgZW5zdXJlICd2IHAnLCB0ZXh0OiBcIjAzNDUyXFxuXCIsIGN1cnNvcjogWzAsIDNdXG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggbGluZXdpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcXG5cIlxuICAgICAgICAgIGVuc3VyZSAndiBwJywgdGV4dDogXCIwXFxuMzQ1XFxuMlxcblwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggbGluZXdpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggY2hhcndpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcIjAxMlxcbmFiY1wiLCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcIlxuICAgICAgICAgIGVuc3VyZSAnViBwJywgdGV4dDogXCIzNDVcXG5hYmNcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJyZXBsYWNlcyBzZWxlY3Rpb24gd2l0aCBsaW5ld2lzZSBjb250ZW50XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjM0NVxcblwiXG4gICAgICAgICAgZW5zdXJlICdWIHAnLCB0ZXh0OiBcIjM0NVxcblwiLCBjdXJzb3I6IFswLCAwXVxuXG4gIGRlc2NyaWJlIFwidGhlIFAga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2l0aCBjaGFyYWN0ZXIgY29udGVudHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMDEyXFxuXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYSdcbiAgICAgICAga2V5c3Ryb2tlICdQJ1xuXG4gICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyIGFib3ZlXCIsIC0+XG4gICAgICAgIGVuc3VyZSB0ZXh0OiBcIjM0NTAxMlxcblwiLCBjdXJzb3I6IFswLCAyXVxuXG4gIGRlc2NyaWJlIFwidGhlIC4ga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldCB0ZXh0OiBcIjEyXFxuMzRcXG41Nlxcbjc4XCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdHMgdGhlIGxhc3Qgb3BlcmF0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJzIgZCBkIC4nLCB0ZXh0OiBcIlwiXG5cbiAgICBpdCBcImNvbXBvc2VzIHdpdGggbW90aW9uc1wiLCAtPlxuICAgICAgZW5zdXJlICdkIGQgMiAuJywgdGV4dDogXCI3OFwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgciBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAxMlxuICAgICAgICAzNFxuICAgICAgICBcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXVxuXG4gICAgaXQgXCJyZXBsYWNlcyBhIHNpbmdsZSBjaGFyYWN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSAnciB4JywgdGV4dDogJ3gyXFxueDRcXG5cXG4nXG5cbiAgICBpdCBcInJlbWFpbiB2aXN1YWwtbW9kZSB3aGVuIGNhbmNlbGxlZFwiLCAtPlxuICAgICAgZW5zdXJlICd2IHIgZXNjYXBlJyxcbiAgICAgICAgdGV4dDogJzEyXFxuMzRcXG5cXG4nXG4gICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgaXQgXCJyZXBsYWNlcyBhIHNpbmdsZSBjaGFyYWN0ZXIgd2l0aCBhIGxpbmUgYnJlYWtcIiwgLT5cbiAgICAgIGVuc3VyZSAnciBlbnRlcicsXG4gICAgICAgIHRleHQ6ICdcXG4yXFxuXFxuNFxcblxcbidcbiAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMywgMF1dXG5cbiAgICBpdCBcImF1dG8gaW5kZW50IHdoZW4gcmVwbGFjZWQgd2l0aCBzaW5nZSBuZXcgbGluZVwiLCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYXxiY1xuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnciBlbnRlcicsXG4gICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgIF9fYVxuICAgICAgICBfX3xjXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJjb21wb3NlcyBwcm9wZXJseSB3aXRoIG1vdGlvbnNcIiwgLT5cbiAgICAgIGVuc3VyZSAnMiByIHgnLCB0ZXh0OiAneHhcXG54eFxcblxcbidcblxuICAgIGl0IFwiZG9lcyBub3RoaW5nIG9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZW5zdXJlICdyIHgnLCB0ZXh0OiAnMTJcXG4zNFxcblxcbidcblxuICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFza2VkIHRvIHJlcGxhY2UgbW9yZSBjaGFyYWN0ZXJzIHRoYW4gdGhlcmUgYXJlIG9uIGEgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlICczIHIgeCcsIHRleHQ6ICcxMlxcbjM0XFxuXFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJjYW5jZWxsYXRpb25cIiwgLT5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIHdoZW4gY2FuY2VsbGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnciBlc2NhcGUnLCB0ZXh0OiAnMTJcXG4zNFxcblxcbicsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwia2VlcCBtdWx0aS1jdXJzb3Igb24gY2FuY2VsbGVkXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGFcXG4hICAgIGFcXG58ICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJyIGVzY2FwZVwiLCB0ZXh0QzogXCJ8ICAgIGFcXG4hICAgIGFcXG58ICAgIGFcXG5cIiwgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICBpdCBcImtlZXAgbXVsdGktY3Vyc29yIG9uIGNhbmNlbGxlZFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgdGV4dEM6IFwifCoqYVxcbiEqKmFcXG58KiphXFxuXCJcbiAgICAgICAgZW5zdXJlIFwidiBsXCIsICAgICAgdGV4dEM6IFwiKip8YVxcbioqIWFcXG4qKnxhXFxuXCIsIHNlbGVjdGVkVGV4dDogW1wiKipcIiwgXCIqKlwiLCBcIioqXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgIGVuc3VyZSBcInIgZXNjYXBlXCIsIHRleHRDOiBcIioqfGFcXG4qKiFhXFxuKip8YVxcblwiLCBzZWxlY3RlZFRleHQ6IFtcIioqXCIsIFwiKipcIiwgXCIqKlwiXSwgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGtleXN0cm9rZSAndiBlJ1xuXG4gICAgICBpdCBcInJlcGxhY2VzIHRoZSBlbnRpcmUgc2VsZWN0aW9uIHdpdGggdGhlIGdpdmVuIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3IgeCcsIHRleHQ6ICd4eFxcbnh4XFxuXFxuJ1xuXG4gICAgICBpdCBcImxlYXZlcyB0aGUgY3Vyc29yIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3IgeCcsIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGluIHZpc3VhbC1ibG9jayBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwOjIzNDVcbiAgICAgICAgICAgIDE6IG8xMW9cbiAgICAgICAgICAgIDI6IG8yMm9cbiAgICAgICAgICAgIDM6IG8zM29cbiAgICAgICAgICAgIDQ6IG80NG9cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2N0cmwtdiBsIDMgaicsXG4gICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnYmxvY2t3aXNlJ11cbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbJzExJywgJzIyJywgJzMzJywgJzQ0J10sXG5cbiAgICAgIGl0IFwicmVwbGFjZXMgZWFjaCBzZWxlY3Rpb24gYW5kIHB1dCBjdXJzb3Igb24gc3RhcnQgb2YgdG9wIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3IgeCcsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBjdXJzb3I6IFsxLCA0XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICAxOiBveHhvXG4gICAgICAgICAgICAyOiBveHhvXG4gICAgICAgICAgICAzOiBveHhvXG4gICAgICAgICAgICA0OiBveHhvXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICB4eCBveHhvXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSAndGhlIG0ga2V5YmluZGluZycsIC0+XG4gICAgZW5zdXJlTWFya0J5TW9kZSA9IChtb2RlKSAtPlxuICAgICAgX2Vuc3VyZSA9IGJpbmRFbnN1cmVPcHRpb24oe21vZGV9KVxuICAgICAgX2Vuc3VyZSBcIm0gYVwiLCBtYXJrOiBcImFcIjogWzAsIDJdXG4gICAgICBfZW5zdXJlIFwibCBtIGFcIiwgbWFyazogXCJhXCI6IFswLCAzXVxuICAgICAgX2Vuc3VyZSBcImogbSBhXCIsIG1hcms6IFwiYVwiOiBbMSwgM11cbiAgICAgIF9lbnN1cmUgXCJqIG0gYlwiLCBtYXJrOiBcImFcIjogWzEsIDNdLCBcImJcIjogWzIsIDNdXG4gICAgICBfZW5zdXJlIFwibCBtIGNcIiwgbWFyazogXCJhXCI6IFsxLCAzXSwgXCJiXCI6IFsyLCAzXSwgXCJjXCI6IFsyLCA0XVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgMDp8IDEyXG4gICAgICAgIDE6IDM0XG4gICAgICAgIDI6IDU2XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJbbm9ybWFsXSBjYW4gbWFyayBtdWx0aXBsZSBwb3NpdG9uXCIsIC0+XG4gICAgICBlbnN1cmVNYXJrQnlNb2RlKFwibm9ybWFsXCIpXG4gICAgaXQgXCJbdkNdIGNhbiBtYXJrXCIsIC0+XG4gICAgICBrZXlzdHJva2UgXCJ2XCJcbiAgICAgIGVuc3VyZU1hcmtCeU1vZGUoW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXSlcbiAgICBpdCBcIlt2TF0gY2FuIG1hcmtcIiwgLT5cbiAgICAgIGtleXN0cm9rZSBcIlZcIlxuICAgICAgZW5zdXJlTWFya0J5TW9kZShbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXSlcblxuICBkZXNjcmliZSAndGhlIFIga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgNjc4OTBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwiZW50ZXJzIHJlcGxhY2UgbW9kZSBhbmQgcmVwbGFjZXMgY2hhcmFjdGVyc1wiLCAtPlxuICAgICAgZW5zdXJlICdSJyxcbiAgICAgICAgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dDogXCIxMmFiNVxcbjY3ODkwXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwiY29udGludWVzIGJleW9uZCBlbmQgb2YgbGluZSBhcyBpbnNlcnRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUicsXG4gICAgICAgIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNkZVwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICcxMmFiY2RlXFxuNjc4OTAnXG5cbiAgICBpdCAndHJlYXRzIGJhY2tzcGFjZSBhcyB1bmRvJywgLT5cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZm9vXCJcbiAgICAgIGtleXN0cm9rZSAnUidcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVwiXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImJcIlxuICAgICAgZW5zdXJlIHRleHQ6IFwiMTJmb29hYjVcXG42Nzg5MFwiXG5cbiAgICAgIGVuc3VyZSAnYmFja3NwYWNlJywgdGV4dDogXCIxMmZvb2E0NVxcbjY3ODkwXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiY1wiXG4gICAgICBlbnN1cmUgdGV4dDogXCIxMmZvb2FjNVxcbjY3ODkwXCJcbiAgICAgIGVuc3VyZSAnYmFja3NwYWNlIGJhY2tzcGFjZScsXG4gICAgICAgIHRleHQ6IFwiMTJmb28zNDVcXG42Nzg5MFwiXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICB0ZXh0OiBcIjEyZm9vMzQ1XFxuNjc4OTBcIlxuICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICBpdCBcImNhbiBiZSByZXBlYXRlZFwiLCAtPlxuICAgICAga2V5c3Ryb2tlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYlwiXG4gICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmFiNVxcbjY3YWIwXCIsIGN1cnNvcjogWzEsIDNdXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTJhYmFiXFxuNjdhYjBcIiwgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0IFwiY2FuIGJlIGludGVycnVwdGVkIGJ5IGFycm93IGtleXMgYW5kIGJlaGF2ZSBhcyBpbnNlcnQgZm9yIHJlcGVhdFwiLCAtPlxuICAgICAgIyBGSVhNRSBkb24ndCBrbm93IGhvdyB0byB0ZXN0IHRoaXMgKGFsc28sIGRlcGVuZHMgb24gUFIgIzU2OClcblxuICAgIGl0IFwicmVwZWF0cyBjb3JyZWN0bHkgd2hlbiBiYWNrc3BhY2Ugd2FzIHVzZWQgaW4gdGhlIHRleHRcIiwgLT5cbiAgICAgIGtleXN0cm9rZSAnUidcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVwiXG4gICAgICBrZXlzdHJva2UgJ2JhY2tzcGFjZSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYlwiXG4gICAgICBrZXlzdHJva2UgJ2VzY2FwZSdcbiAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmI0NVxcbjY3YjkwXCIsIGN1cnNvcjogWzEsIDJdXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTJiNGJcXG42N2I5MFwiLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJkb2Vzbid0IHJlcGxhY2UgYSBjaGFyYWN0ZXIgaWYgbmV3bGluZSBpcyBlbnRlcmVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiXFxuXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMlxcbjM0NVxcbjY3ODkwXCJcblxuICAgIGRlc2NyaWJlIFwibXVsdGlsaW5lIHNpdHVhdGlvblwiLCAtPlxuICAgICAgdGV4dE9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgIDAxMjM0XG4gICAgICAgIDU2Nzg5XG4gICAgICAgIFwiXCJcIlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogdGV4dE9yaWdpbmFsLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJyZXBsYWNlIGNoYXJhY3RlciB1bmxlc3MgaW5wdXQgaXNudCBuZXcgbGluZShcXFxcbilcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVxcbmJcXG5jXCJcbiAgICAgICAgZW5zdXJlXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBjMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAxXVxuICAgICAgaXQgXCJoYW5kbGUgYmFja3NwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXFxuYlxcbmNcIlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBjNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwYVxuICAgICAgICAgICAgMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGEyMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJywgIyBkbyBub3RoaW5nXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgaXQgXCJyZXBlYXRlIG11bHRpbGluZSB0ZXh0IGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNcXG5kZWZcIlxuICAgICAgICBlbnN1cmVcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAyXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICd1JywgdGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIDU2YWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwicmVwZWF0ZSBtdWx0aWxpbmUgdGV4dCBjYXNlLTJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYWJjXFxuZFwiXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgMF0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkNFxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGQ5XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gIGRlc2NyaWJlICdBZGRCbGFua0xpbmVCZWxvdywgQWRkQmxhbmtMaW5lQWJvdmUnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcblxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgJ2VudGVyJzogJ3ZpbS1tb2RlLXBsdXM6YWRkLWJsYW5rLWxpbmUtYmVsb3cnXG4gICAgICAgICAgJ3NoaWZ0LWVudGVyJzogJ3ZpbS1tb2RlLXBsdXM6YWRkLWJsYW5rLWxpbmUtYWJvdmUnXG5cbiAgICBpdCBcImluc2VydCBibGFuayBsaW5lIGJlbG93L2Fib3ZlXCIsIC0+XG4gICAgICBlbnN1cmUgXCJlbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlIFwic2hpZnQtZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuXG4gICAgICAgIGxpfG5lMVxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJbd2l0aC1jb3VudF0gaW5zZXJ0IGJsYW5rIGxpbmUgYmVsb3cvYWJvdmVcIiwgLT5cbiAgICAgIGVuc3VyZSBcIjIgZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuICAgICAgICBsaXxuZTFcblxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlIFwiMiBzaGlmdC1lbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG5cblxuICAgICAgICBsaXxuZTFcblxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICdTZWxlY3QgYXMgb3BlcmF0b3InLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgna2V5bWFwU1RvU2VsZWN0JywgdHJ1ZSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICAgIGRlc2NyaWJlIFwic2VsZWN0IGJ5IHRhcmdldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMCB8b29vIHh4eCAqKipcbiAgICAgICAgICAxIHh4eCAqKiogb29vXG5cbiAgICAgICAgICAzIG9vbyB4eHggKioqXG4gICAgICAgICAgNCB4eHggKioqIG9vb1xcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcInNlbGVjdCB0ZXh0LW9iamVjdFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzIHBcIiwgIyBwIGlzIGBpIHBgIHNob3J0aGFuZC5cbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIwIG9vbyB4eHggKioqXFxuMSB4eHggKioqIG9vb1xcblwiXG4gICAgICAgICAgcHJvcGVydHlIZWFkOiBbMSwgMTNdXG5cbiAgICAgIGl0IFwic2VsZWN0IGJ5IG1vdGlvbiBqIHdpdGggc3RheU9uU2VsZWN0VGV4dE9iamVjdFwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIsIHRydWUpXG4gICAgICAgIGVuc3VyZSBcInMgaSBwXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwibGluZXdpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuICAgICAgICAgIHByb3BlcnR5SGVhZDogWzEsIDJdXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gdGV4dC1vYmplY3Qgd2l0aCBvY2N1cnJlbmNlLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgbyBwXCIsICMgcCBpcyBgaSBwYCBzaG9ydGhhbmQuXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFswLCA1XV1cbiAgICAgICAgICAgIFtbMSwgMTBdLCBbMSwgMTNdXVxuICAgICAgICAgIF1cblxuICAgICAgaXQgXCJzZWxlY3Qgb2NjdXJyZW5jZSBpbiB0ZXh0LW9iamVjdCB3aXRoIHByZXNldC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgbyBzIHBcIiwgIyBwIGlzIGBpIHBgIHNob3J0aGFuZC5cbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1xuICAgICAgICAgICAgW1swLCAyXSwgWzAsIDVdXVxuICAgICAgICAgICAgW1sxLCAxMF0sIFsxLCAxM11dXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcImNvbnZlcnQgcHJlc2lzdGVudC1zZWxlY3Rpb24gaW50byBub3JtYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgaiBlbnRlclwiLFxuICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDFcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFsxLCAzXV1cbiAgICAgICAgICBdXG5cbiAgICAgICAgZW5zdXJlIFwiaiBqIHYgalwiLFxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMVxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZTogW1xuICAgICAgICAgICAgW1swLCAyXSwgWzEsIDNdXVxuICAgICAgICAgIF1cbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIm9vbyB4eHggKioqXFxuNCB4XCJcblxuICAgICAgICAjIE5vdyBpdCdzIHNob3cgdGltZSwgdG8gY29udmVydCBwZXJzaXN0ZW50IHNlbGVjdGlvbiBpbnRvIG5vcm1hbCBzZWxlY3Rpb25cbiAgICAgICAgIyBieSBvbmx5IGBzYC5cbiAgICAgICAgZW5zdXJlIFwic1wiLFxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDBcbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJvb28geHh4ICoqKlxcbjEgeFwiLCBcIm9vbyB4eHggKioqXFxuNCB4XCJdXG5cbiAgICAgIGl0IFwic2VsZWN0IHByZXNldC1vY2N1cnJlbmNlIGluIHByZXNpc3RlbnQtc2VsZWN0aW9uIGFuZCBub3JtYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbyddXG5cbiAgICAgICAgZW5zdXJlIFwiViBqIGVudGVyIEcgVlwiLFxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMVxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImxpbmV3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjQgeHh4ICoqKiBvb29cXG5cIlxuXG4gICAgICAgIGVuc3VyZSBcInNcIiwgIyBOb3RpY2UgYG9vb2AgaW4gcm93IDMgaXMgRVhDTFVERUQuXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFswLCA1XV1cbiAgICAgICAgICAgIFtbMSwgMTBdLCBbMSwgMTNdXVxuICAgICAgICAgICAgW1s0LCAxMF0sIFs0LCAxM11dXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcInNlbGVjdCBieSBtb3Rpb24gJFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzICRcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIm9vbyB4eHggKioqXFxuXCJcblxuICAgICAgaXQgXCJzZWxlY3QgYnkgbW90aW9uIGpcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwicyBqXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwibGluZXdpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuXG4gICAgICBpdCBcInNlbGVjdCBieSBtb3Rpb24gaiB2LW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgdiBqXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJvb28geHh4ICoqKlxcbjEgeFwiXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgYnkgbW90aW9uIEdcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwicyBvIEdcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1xuICAgICAgICAgICAgW1swLCAyXSwgWzAsIDVdXVxuICAgICAgICAgICAgW1sxLCAxMF0sIFsxLCAxM11dXG4gICAgICAgICAgICBbWzMsIDJdLCBbMywgNV1dXG4gICAgICAgICAgICBbWzQsIDEwXSwgWzQsIDEzXV1cbiAgICAgICAgICBdXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgYnkgbW90aW9uIEcgd2l0aCBleHBsaWNpdCBWLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgbyBWIEdcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuICAgICAgICAgICAgXCIzIG9vbyB4eHggKioqXFxuNCB4eHggKioqIG9vb1xcblwiXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcInJldHVybiB0byBub3JtYWwtbW9kZSB3aGVuIGZhaWwgdG8gc2VsZWN0XCIsIC0+XG4gICAgICAgICMgYXR0ZW1wdCB0byBzZWxlY3QgaW5uZXItZnVuY3Rpb24gYnV0IHRoZXJlIGlzIG5vIGZ1bmN0aW9uLlxuICAgICAgICBlbnN1cmUgXCJzIGkgZlwiLFxuICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgICAgICMgYXR0ZW1wdCB0byBmaW5kICd6JyBidXQgbm8gXCJ6XCIuXG4gICAgICAgIGVuc3VyZSBcInMgZiB6XCIsXG4gICAgICAgICAgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiY29tcGxleCBzY2VuYXJpb1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgICAgICAgICAgICBmb3IgKGNvbnN0ICFtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICAgIGxldCBtZW1iZXIyID0gbWVtYmVyICsgbWVtYmVyXG4gICAgICAgICAgICAgICAgbGV0IG1lbWJlcjMgPSBtZW1iZXIgKyBtZW1iZXIgKyBtZW1iZXJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtZW1iZXIyLCBtZW1iZXIzKVxuICAgICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gYS1mb2xkICxyZXZlcnNlKG8pIHRoZW4gZXNjYXBlIHRvIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwicyBvIHogbyBlc2NhcGVcIixcbiAgICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHxtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICBsZXQgbWVtYmVyMiA9IHxtZW1iZXIgKyB8bWVtYmVyXG4gICAgICAgICAgICAgIGxldCBtZW1iZXIzID0gfG1lbWJlciArIHxtZW1iZXIgKyB8bWVtYmVyXG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1lbWJlcjIsIG1lbWJlcjMpXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiJdfQ==
