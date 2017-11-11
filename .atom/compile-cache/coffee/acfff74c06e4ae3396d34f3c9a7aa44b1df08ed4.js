(function() {
  var TextData, dispatch, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Operator general", function() {
    var bindEnsureOption, bindEnsureWaitOption, editor, editorElement, ensure, ensureWait, ref1, ref2, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], ensureWait = ref1[2], bindEnsureOption = ref1[3], bindEnsureWaitOption = ref1[4];
    ref2 = [], editor = ref2[0], editorElement = ref2[1], vimState = ref2[2];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, bindEnsureOption = vim.bindEnsureOption, bindEnsureWaitOption = vim.bindEnsureWaitOption, vim;
      });
    });
    describe("cancelling operations", function() {
      return it("clear pending operation", function() {
        ensure('/');
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
        var initialTextC, originalText, ref3;
        ref3 = [], originalText = ref3[0], initialTextC = ref3[1];
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
          return ensure(null, {
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
        var ensurePutAfterWithAutoIndent;
        ensurePutAfterWithAutoIndent = function(options) {
          dispatch(editor.element, 'vim-mode-plus:put-after-with-auto-indent');
          return ensure(null, options);
        };
        beforeEach(function() {
          return waitsForPromise(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            return atom.packages.activatePackage('language-javascript').then(function() {
              return set({
                grammar: 'source.js'
              });
            });
          });
        });
        describe("paste with auto-indent", function() {
          it("inserts the contents of the default register", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: " 345\n"
                }
              },
              textC_: "if| () {\n}"
            });
            return ensurePutAfterWithAutoIndent({
              textC_: "if () {\n  |345\n}"
            });
          });
          return it("multi-line register contents with auto indent", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: "if(3) {\n  if(4) {}\n}"
                }
              },
              textC: "if (1) {\n  |if (2) {\n  }\n}"
            });
            return ensurePutAfterWithAutoIndent({
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
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: "   a: 123,\nbbbb: 456,"
                }
              }
            });
            return ensurePutAfterWithAutoIndent({
              textC: "if (1) {\n  if (2) {\n       |a: 123,\n    bbbb: 456,\n  }\n}"
            });
          });
          return it("keep original layout [register content have blank row]", function() {
            set({
              register: {
                '"': {
                  type: 'linewise',
                  text: "if(3) {\n__abc\n\n__def\n}".replace(/_/g, ' ')
                }
              }
            });
            return ensurePutAfterWithAutoIndent({
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
          return ensure('2 p');
        });
        it("inserts the same line twice", function() {
          return ensure(null, {
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
          return ensure('P');
        });
        return it("inserts the contents of the default register above", function() {
          return ensure(null, {
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
        return ensureWait('r x', {
          text: 'x2\nx4\n\n'
        });
      });
      it("remain visual-mode when cancelled", function() {
        return ensureWait('v r escape', {
          text: '12\n34\n\n',
          mode: ['visual', 'characterwise']
        });
      });
      it("replaces a single character with a line break", function() {
        return ensureWait('r enter', {
          text: '\n2\n\n4\n\n',
          cursor: [[1, 0], [3, 0]]
        });
      });
      it("auto indent when replaced with singe new line", function() {
        set({
          textC_: "__a|bc"
        });
        return ensureWait('r enter', {
          textC_: "__a\n__|c"
        });
      });
      it("composes properly with motions", function() {
        return ensureWait('2 r x', {
          text: 'xx\nxx\n\n'
        });
      });
      it("does nothing on an empty line", function() {
        set({
          cursor: [2, 0]
        });
        return ensureWait('r x', {
          text: '12\n34\n\n'
        });
      });
      it("does nothing if asked to replace more characters than there are on a line", function() {
        return ensureWait('3 r x', {
          text: '12\n34\n\n'
        });
      });
      describe("cancellation", function() {
        it("does nothing when cancelled", function() {
          return ensureWait('r escape', {
            text: '12\n34\n\n',
            mode: 'normal'
          });
        });
        it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|    a\n!    a\n|    a\n"
          });
          return ensureWait("r escape", {
            textC: "|    a\n!    a\n|    a\n",
            mode: "normal"
          });
        });
        return it("keep multi-cursor on cancelled", function() {
          set({
            textC: "|**a\n!**a\n|**a\n"
          });
          ensureWait("v l", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
          return ensureWait("r escape", {
            textC: "**|a\n**!a\n**|a\n",
            selectedText: ["**", "**", "**"],
            mode: ["visual", "characterwise"]
          });
        });
      });
      describe("when in visual mode", function() {
        beforeEach(function() {
          return ensure('v e');
        });
        it("replaces the entire selection with the given character", function() {
          return ensureWait('r x', {
            text: 'xx\nxx\n\n'
          });
        });
        return it("leaves the cursor at the beginning of the selection", function() {
          return ensureWait('r x', {
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
          runs(function() {
            return ensureWait('r x', {
              mode: 'normal',
              cursor: [1, 4],
              text: "0:2345\n1: oxxo\n2: oxxo\n3: oxxo\n4: oxxo\n"
            });
          });
          runs(function() {
            return set({
              cursor: [1, 0]
            });
          });
          return runs(function() {
            return ensureWait('.', {
              mode: 'normal',
              cursor: [1, 0],
              text: "0:2345\nxx oxxo\nxx oxxo\nxx oxxo\nxx oxxo\n"
            });
          });
        });
      });
    });
    describe('the m keybinding', function() {
      var ensureMarkByMode;
      ensureMarkByMode = function(mode) {
        var _ensure;
        _ensure = bindEnsureWaitOption({
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
        ensure("v");
        return ensureMarkByMode(["visual", "characterwise"]);
      });
      return it("[vL] can mark", function() {
        ensure("V");
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
        ensure('R');
        editor.insertText("a");
        editor.insertText("b");
        ensure(null, {
          text: "12fooab5\n67890"
        });
        ensure('backspace', {
          text: "12fooa45\n67890"
        });
        editor.insertText("c");
        ensure(null, {
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
        ensure('R');
        editor.insertText("ab");
        ensure('escape');
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
        ensure('R');
        editor.insertText("a");
        ensure('backspace');
        editor.insertText("b");
        ensure('escape');
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
          return ensure(null, {
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
          ensure(null, {
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
          ensure(null, {
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
          ensure(null, {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLWdlbmVyYWwtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7O0VBQUEsTUFBb0MsT0FBQSxDQUFRLGVBQVIsQ0FBcEMsRUFBQyw2QkFBRCxFQUFjLHVCQUFkLEVBQXdCOztFQUN4QixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxPQUFvRSxFQUFwRSxFQUFDLGFBQUQsRUFBTSxnQkFBTixFQUFjLG9CQUFkLEVBQTBCLDBCQUExQixFQUE0QztJQUM1QyxPQUFvQyxFQUFwQyxFQUFDLGdCQUFELEVBQVMsdUJBQVQsRUFBd0I7SUFFeEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYywyQkFBZCxFQUEwQix1Q0FBMUIsRUFBNEMsK0NBQTVDLEVBQW9FO01BSDFELENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7YUFDaEMsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7UUFDNUIsTUFBQSxDQUFPLEdBQVA7UUFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUF4QixDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxLQUEvQztRQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBckIsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQXhCLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLElBQS9DO2VBQ0EsTUFBQSxDQUFPLFNB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VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgZ2VuZXJhbFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVuc3VyZVdhaXQsIGJpbmRFbnN1cmVPcHRpb24sIGJpbmRFbnN1cmVXYWl0T3B0aW9uXSA9IFtdXG4gIFtlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0LCBiaW5kRW5zdXJlT3B0aW9uLCBiaW5kRW5zdXJlV2FpdE9wdGlvbn0gPSB2aW1cblxuICBkZXNjcmliZSBcImNhbmNlbGxpbmcgb3BlcmF0aW9uc1wiLCAtPlxuICAgIGl0IFwiY2xlYXIgcGVuZGluZyBvcGVyYXRpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnLydcbiAgICAgIGV4cGVjdCh2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5pc0VtcHR5KCkpLnRvQmUgZmFsc2VcbiAgICAgIHZpbVN0YXRlLnNlYXJjaElucHV0LmNhbmNlbCgpXG4gICAgICBleHBlY3QodmltU3RhdGUub3BlcmF0aW9uU3RhY2suaXNFbXB0eSgpKS50b0JlIHRydWVcbiAgICAgIGV4cGVjdCgtPiB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5jYW5jZWwoKSkubm90LnRvVGhyb3coKVxuXG4gIGRlc2NyaWJlIFwidGhlIHgga2V5YmluZGluZ1wiLCAtPlxuICAgIGRlc2NyaWJlIFwib24gYSBsaW5lIHdpdGggY29udGVudFwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aXRob3V0IHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvblwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcImFiY1xcbjAxMjM0NVxcblxcbnh5elwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCA0XVxuXG4gICAgICAgIGl0IFwiZGVsZXRlcyBhIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTIzNVxcblxcbnh5eicsIGN1cnNvcjogWzEsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzQnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMjNcXG5cXG54eXonICwgY3Vyc29yOiBbMSwgM10sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNSdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyXFxuXFxueHl6JyAgLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMVxcblxcbnh5eicgICAsIGN1cnNvcjogWzEsIDFdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzInXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjBcXG5cXG54eXonICAgICwgY3Vyc29yOiBbMSwgMF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMSdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuXFxuXFxueHl6JyAgICAgLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwJ1xuXG4gICAgICAgIGl0IFwiZGVsZXRlcyBtdWx0aXBsZSBjaGFyYWN0ZXJzIHdpdGggYSBjb3VudFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnMiB4JywgdGV4dDogJ2FiY1xcbjAxMjNcXG5cXG54eXonLCBjdXJzb3I6IFsxLCAzXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc0NSdcbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBlbnN1cmUgJzMgeCcsXG4gICAgICAgICAgICB0ZXh0OiAnYVxcbjAxMjNcXG5cXG54eXonXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdiYydcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG5cXG54eXpcIlxuICAgICAgICAgICAgY3Vyc29yOiBbWzEsIDRdLCBbMCwgMV1dXG5cbiAgICAgICAgaXQgXCJpcyB1bmRvbmUgYXMgb25lIG9wZXJhdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6IFwiYWNcXG4wMTIzNVxcblxcbnh5elwiXG4gICAgICAgICAgZW5zdXJlICd1JywgdGV4dDogJ2FiY1xcbjAxMjM0NVxcblxcbnh5eidcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvblwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6ICdhYmNcXG4wMTIzNDVcXG5cXG54eXonLCBjdXJzb3I6IFsxLCA0XVxuICAgICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIGEgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgICAgIyBjb3B5IG9mIHRoZSBlYXJsaWVyIHRlc3QgYmVjYXVzZSB3cmFwTGVmdFJpZ2h0TW90aW9uIHNob3VsZCBub3QgYWZmZWN0IGl0XG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxMjM1XFxuXFxueHl6JywgY3Vyc29yOiBbMSwgNF0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnNCdcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMDEyM1xcblxcbnh5eicgLCBjdXJzb3I6IFsxLCAzXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICc1J1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG4wMTJcXG5cXG54eXonICAsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzMnXG4gICAgICAgICAgZW5zdXJlICd4JywgdGV4dDogJ2FiY1xcbjAxXFxuXFxueHl6JyAgICwgY3Vyc29yOiBbMSwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMidcbiAgICAgICAgICBlbnN1cmUgJ3gnLCB0ZXh0OiAnYWJjXFxuMFxcblxcbnh5eicgICAgLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxJ1xuICAgICAgICAgIGVuc3VyZSAneCcsIHRleHQ6ICdhYmNcXG5cXG5cXG54eXonICAgICAsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAnXG5cbiAgICAgICAgaXQgXCJkZWxldGVzIG11bHRpcGxlIGNoYXJhY3RlcnMgYW5kIG5ld2xpbmVzIHdpdGggYSBjb3VudFwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgICAgZW5zdXJlICcyIHgnLCB0ZXh0OiAnYWJjXFxuMDEyM1xcblxcbnh5eicsIGN1cnNvcjogWzEsIDNdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzQ1J1xuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSAnMyB4JywgdGV4dDogJ2EwMTIzXFxuXFxueHl6JywgY3Vyc29yOiBbMCwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYmNcXG4nXG4gICAgICAgICAgZW5zdXJlICc3IHgnLCB0ZXh0OiAnYXl6JywgY3Vyc29yOiBbMCwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMDEyM1xcblxcbngnXG5cbiAgICBkZXNjcmliZSBcIm9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxuXFxueHl6XCIsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyBub3RoaW5nIG9uIGFuIGVtcHR5IGxpbmUgd2hlbiB2aW0tbW9kZS1wbHVzLndyYXBMZWZ0UmlnaHRNb3Rpb24gaXMgZmFsc2VcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgZmFsc2UpXG4gICAgICAgIGVuc3VyZSAneCcsIHRleHQ6IFwiYWJjXFxuMDEyMzQ1XFxuXFxueHl6XCIsIGN1cnNvcjogWzIsIDBdXG5cbiAgICAgIGl0IFwiZGVsZXRlcyBhbiBlbXB0eSBsaW5lIHdoZW4gdmltLW1vZGUtcGx1cy53cmFwTGVmdFJpZ2h0TW90aW9uIGlzIHRydWVcIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd3cmFwTGVmdFJpZ2h0TW90aW9uJywgdHJ1ZSlcbiAgICAgICAgZW5zdXJlICd4JywgdGV4dDogXCJhYmNcXG4wMTIzNDVcXG54eXpcIiwgY3Vyc29yOiBbMiwgMF1cblxuICBkZXNjcmliZSBcInRoZSBYIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIm9uIGEgbGluZSB3aXRoIGNvbnRlbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiYWJcXG4wMTIzNDVcIiwgY3Vyc29yOiBbMSwgMl1cblxuICAgICAgaXQgXCJkZWxldGVzIGEgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6ICdhYlxcbjAyMzQ1JywgY3Vyc29yOiBbMSwgMV0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMSdcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogJ2FiXFxuMjM0NScsIGN1cnNvcjogWzEsIDBdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzAnXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6ICdhYlxcbjIzNDUnLCBjdXJzb3I6IFsxLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcwJ1xuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ1gnLCB0ZXh0OiAnYWIyMzQ1JywgY3Vyc29yOiBbMCwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnXFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJvbiBhbiBlbXB0eSBsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiMDEyMzQ1XFxuXFxuYWJjZGVmXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICBpdCBcImRlbGV0ZXMgbm90aGluZyB3aGVuIHZpbS1tb2RlLXBsdXMud3JhcExlZnRSaWdodE1vdGlvbiBpcyBmYWxzZVwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3dyYXBMZWZ0UmlnaHRNb3Rpb24nLCBmYWxzZSlcbiAgICAgICAgZW5zdXJlICdYJywgdGV4dDogXCIwMTIzNDVcXG5cXG5hYmNkZWZcIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBuZXdsaW5lIHdoZW4gd3JhcExlZnRSaWdodE1vdGlvbiBpcyB0cnVlXCIsIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgnd3JhcExlZnRSaWdodE1vdGlvbicsIHRydWUpXG4gICAgICAgIGVuc3VyZSAnWCcsIHRleHQ6IFwiMDEyMzQ1XFxuYWJjZGVmXCIsIGN1cnNvcjogWzAsIDVdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgZCBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgYWJjZGVcblxuICAgICAgICAgIEFCQ0RFXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzEsIDFdXG5cbiAgICBpdCBcImVudGVycyBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZCcsIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgZFwiLCAtPlxuICAgICAgaXQgXCJkZWxldGVzIHRoZSBjdXJyZW50IGxpbmUgYW5kIGV4aXRzIG9wZXJhdG9yLXBlbmRpbmcgbW9kZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMV1cbiAgICAgICAgZW5zdXJlICdkIGQnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcblxuICAgICAgICAgICAgQUJDREVcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiYWJjZGVcXG5cIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiZGVsZXRlcyB0aGUgbGFzdCBsaW5lIGFuZCBhbHdheXMgbWFrZSBub24tYmxhbmstbGluZSBsYXN0IGxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnMiBkIGQnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGFiY2RlXFxuXG4gICAgICAgICAgICBcIlwiXCIsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgaXQgXCJsZWF2ZXMgdGhlIGN1cnNvciBvbiB0aGUgZmlyc3Qgbm9uYmxhbmsgY2hhcmFjdGVyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAxMjM0fDVcbiAgICAgICAgICAgIGFiY2RlXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZCBkJyxcbiAgICAgICAgICB0ZXh0QzogXCIgIHxhYmNkZVxcblwiXG5cbiAgICBkZXNjcmliZSBcInVuZG8gYmVoYXZpb3JcIiwgLT5cbiAgICAgIFtvcmlnaW5hbFRleHQsIGluaXRpYWxUZXh0Q10gPSBbXVxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBpbml0aWFsVGV4dEMgPSBcIlwiXCJcbiAgICAgICAgICAxMjM0NVxuICAgICAgICAgIGF8YmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgUVdFUlRcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHRDOiBpbml0aWFsVGV4dENcbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gZWRpdG9yLmdldFRleHQoKVxuXG4gICAgICBpdCBcInVuZG9lcyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAyIGQnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAxMjM0NVxuICAgICAgICAgIHxRV0VSVFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDOiBpbml0aWFsVGV4dENcbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgZGVzY3JpYmUgXCJzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvIGlzIHRydWUoZGVmYXVsdClcIiwgLT5cbiAgICAgICAgICBpdCBcImNsZWFyIG11bHRpcGxlIGN1cnNvcnMgYW5kIHNldCBjdXJzb3IgdG8gc3RhcnQgb2YgY2hhbmdlcyBvZiBsYXN0IGN1cnNvclwiLCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dFxuICAgICAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAxXV1cblxuICAgICAgICAgICAgZW5zdXJlICdkIGwnLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIHwyMzQ1XG4gICAgICAgICAgICAgIGF8Y2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICAgIGF8YmNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICAgICAgICBlbnN1cmUgJ2N0cmwtcicsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMjM0NVxuICAgICAgICAgICAgICBhfGNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgc2VsZWN0ZWRUZXh0OiAnJ1xuXG4gICAgICAgICAgaXQgXCJjbGVhciBtdWx0aXBsZSBjdXJzb3JzIGFuZCBzZXQgY3Vyc29yIHRvIHN0YXJ0IG9mIGNoYW5nZXMgb2YgbGFzdCBjdXJzb3JcIiwgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHRcbiAgICAgICAgICAgICAgY3Vyc29yOiBbWzEsIDFdLCBbMCwgMF1dXG5cbiAgICAgICAgICAgIGVuc3VyZSAnZCBsJyxcbiAgICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDIzNDVcbiAgICAgICAgICAgICAgYWNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgY3Vyc29yOiBbWzEsIDFdLCBbMCwgMF1dXG5cbiAgICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgICAgICAgIGVuc3VyZSAnY3RybC1yJyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MjM0NVxuICAgICAgICAgICAgICBhY2RlXG4gICAgICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgICAgIFFXRVJUXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICAgICAgZGVzY3JpYmUgXCJzZXRDdXJzb3JUb1N0YXJ0T2ZDaGFuZ2VPblVuZG9SZWRvIGlzIGZhbHNlXCIsIC0+XG4gICAgICAgICAgaW5pdGlhbFRleHRDID0gbnVsbFxuXG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgaW5pdGlhbFRleHRDID0gXCJcIlwiXG4gICAgICAgICAgICAgIHwxMjM0NVxuICAgICAgICAgICAgICBhfGJjZGVcbiAgICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgICAgUVdFUlRcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICAgIHNldHRpbmdzLnNldCgnc2V0Q3Vyc29yVG9TdGFydE9mQ2hhbmdlT25VbmRvUmVkbycsIGZhbHNlKVxuICAgICAgICAgICAgc2V0IHRleHRDOiBpbml0aWFsVGV4dENcbiAgICAgICAgICAgIGVuc3VyZSAnZCBsJyxcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MjM0NVxuICAgICAgICAgICAgICBhfGNkZVxuICAgICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgICBRV0VSVFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGl0IFwicHV0IGN1cnNvciB0byBlbmQgb2YgY2hhbmdlICh3b3JrcyBpbiBzYW1lIHdheSBvZiBhdG9tJ3MgY29yZTp1bmRvKVwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICAgICAgdGV4dEM6IGluaXRpYWxUZXh0Q1xuICAgICAgICAgICAgICBzZWxlY3RlZFRleHQ6IFsnJywgJyddXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSB3XCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIG5leHQgd29yZCB1bnRpbCB0aGUgZW5kIG9mIHRoZSBsaW5lIGFuZCBleGl0cyBvcGVyYXRvci1wZW5kaW5nIG1vZGVcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdhYmNkIGVmZ1xcbmFiYycsIGN1cnNvcjogWzAsIDVdXG4gICAgICAgIGVuc3VyZSAnZCB3JyxcbiAgICAgICAgICB0ZXh0OiBcImFiY2QgXFxuYWJjXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwiZGVsZXRlcyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHdvcmRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6ICdhYmNkIGVmZycsIGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnZCB3JywgdGV4dDogJ2FiZWZnJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgc2V0IHRleHQ6ICdvbmUgdHdvIHRocmVlIGZvdXInLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgMyB3JywgdGV4dDogJ2ZvdXInLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGFuIGl3XCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZXMgdGhlIGNvbnRhaW5pbmcgd29yZFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NSBhYmNkZSBBQkNERVwiLCBjdXJzb3I6IFswLCA5XVxuXG4gICAgICAgIGVuc3VyZSAnZCcsIG1vZGU6ICdvcGVyYXRvci1wZW5kaW5nJ1xuXG4gICAgICAgIGVuc3VyZSAnaSB3JyxcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1ICBBQkNERVwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FiY2RlJ1xuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBqXCIsIC0+XG4gICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgICAgMTIzNDVcbiAgICAgICAgYWJjZGVcbiAgICAgICAgQUJDREVcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBuZXh0IHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZCBqJywgdGV4dDogJ0FCQ0RFXFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2Ygc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBsYXN0IHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnZCBqJywgdGV4dDogJzEyMzQ1XFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gY3Vyc29yIGlzIG9uIGJsYW5rIGxpbmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIGFcblxuXG4gICAgICAgICAgICAgIGJcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICBpdCBcImRlbGV0ZXMgYm90aCBsaW5lc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZCBqJywgdGV4dDogXCJhXFxuYlxcblwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGFuIGtcIiwgLT5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxuICAgICAgICBcIlwiXCJcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGVuZCBvZiB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgNF1cbiAgICAgICAgICBlbnN1cmUgJ2QgaycsIHRleHQ6ICcxMjM0NVxcbidcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIHhpdCBcImRlbGV0ZXMgbm90aGluZ1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZCBrJywgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBvbiB0aGUgbWlkZGxlIG9mIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgZmlyc3QgdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdkIGsnLCB0ZXh0OiAnQUJDREUnXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBjdXJzb3IgaXMgb24gYmxhbmsgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgYVxuXG5cbiAgICAgICAgICAgICAgYlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGl0IFwiZGVsZXRlcyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdkIGsnLCB0ZXh0OiBcImFcXG5iXFxuXCIsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAnZCBHJywgdGV4dDogJzEyMzQ1XFxuJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnZCBHJywgdGV4dDogJzEyMzQ1XFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgZ290byBsaW5lIEdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgb3JpZ2luYWxUZXh0ID0gXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICAgIGRlc2NyaWJlIFwib24gdGhlIGJlZ2lubmluZyBvZiB0aGUgc2Vjb25kIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJkZWxldGVzIHRoZSBib3R0b20gdHdvIGxpbmVzXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgICAgZW5zdXJlICdkIDIgRycsIHRleHQ6ICcxMjM0NVxcbkFCQ0RFJ1xuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBtaWRkbGUgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIGVuc3VyZSAnZCAyIEcnLCB0ZXh0OiAnMTIzNDVcXG5BQkNERSdcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHQpXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndpdGggdGhlIGVudGlyZSBsaW5lIHlhbmtlZCBiZWZvcmVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcInRlc3QgKHh5eilcIiwgY3Vyc29yOiBbMCwgNl1cblxuICAgICAgICBpdCBcImRlbGV0ZXMgdW50aWwgdGhlIGNsb3NpbmcgcGFyZW50aGVzaXNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2QgdCApJyxcbiAgICAgICAgICAgIHRleHQ6ICd0ZXN0ICgpJ1xuICAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cblxuICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICBpdCBcImRlbGV0ZXMgZWFjaCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICAxMjM0XG4gICAgICAgICAgICBBQkNEXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMV0sIFsxLCAyXSwgWzIsIDNdXVxuXG4gICAgICAgIGVuc3VyZSAnZCBlJyxcbiAgICAgICAgICB0ZXh0OiBcImFcXG4xMlxcbkFCQ1wiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMV0sIFsyLCAyXV1cblxuICAgICAgaXQgXCJkb2Vzbid0IGRlbGV0ZSBlbXB0eSBzZWxlY3Rpb25zXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiYWJjZFxcbmFiY1xcbmFiZFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF0sIFsyLCAwXV1cblxuICAgICAgICBlbnN1cmUgJ2QgdCBkJyxcbiAgICAgICAgICB0ZXh0OiBcImRcXG5hYmNcXG5kXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXSwgWzIsIDBdXVxuXG4gICAgZGVzY3JpYmUgXCJzdGF5T25EZWxldGUgc2V0dGluZ1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPbkRlbGV0ZScsIHRydWUpXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRfOiBcIlwiXCJcbiAgICAgICAgICBfX18zMzMzXG4gICAgICAgICAgX18yMjIyXG4gICAgICAgICAgXzExMTFcbiAgICAgICAgICBfXzIyMjJcbiAgICAgICAgICBfX18zMzMzXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgM11cblxuICAgICAgZGVzY3JpYmUgXCJ0YXJnZXQgcmFuZ2UgaXMgbGluZXdpc2UgcmFuZ2VcIiwgLT5cbiAgICAgICAgaXQgXCJrZWVwIG9yaWdpbmFsIGNvbHVtbiBhZnRlciBkZWxldGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGRcIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl9fMjIyMlxcbl8xMTExXFxuX18yMjIyXFxuX19fMzMzM1xcblwiXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLCBjdXJzb3I6IFswLCAzXSwgdGV4dF86IFwiXzExMTFcXG5fXzIyMjJcXG5fX18zMzMzXFxuXCJcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfXzIyMjJcXG5fX18zMzMzXFxuXCJcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsIGN1cnNvcjogWzAsIDNdLCB0ZXh0XzogXCJfX18zMzMzXFxuXCJcblxuICAgICAgICBpdCBcInZfRCBhbHNvIGtlZXAgb3JpZ2luYWwgY29sdW1uIGFmdGVyIGRlbGV0ZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInYgMiBqIERcIiwgY3Vyc29yOiBbMCwgM10sIHRleHRfOiBcIl9fMjIyMlxcbl9fXzMzMzNcXG5cIlxuXG4gICAgICBkZXNjcmliZSBcInRhcmdldCByYW5nZSBpcyB0ZXh0IG9iamVjdFwiLCAtPlxuICAgICAgICBkZXNjcmliZSBcInRhcmdldCBpcyBpbmRlbnRcIiwgLT5cbiAgICAgICAgICBpbmRlbnRUZXh0ID0gXCJcIlwiXG4gICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMFxuICAgICAgICAgICAgMjIyMjIyMjIyMjIyMjJcbiAgICAgICAgICAgIDIyMjIyMjIyMjIyMjIyXG4gICAgICAgICAgICAyMjIyMjIyMjIyMjIyMlxuICAgICAgICAgIDAwMDAwMDAwMDAwMDAwMDBcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICB0ZXh0RGF0YSA9IG5ldyBUZXh0RGF0YShpbmRlbnRUZXh0KVxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0OiB0ZXh0RGF0YS5nZXRSYXcoKVxuXG4gICAgICAgICAgaXQgXCJbZnJvbSB0b3BdIGtlZXAgY29sdW1uXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMTBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBpJywgY3Vyc29yOiBbMSwgMTBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbMCwgNF0pXG4gICAgICAgICAgaXQgXCJbZnJvbSBtaWRkbGVdIGtlZXAgY29sdW1uXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMTBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBpJywgY3Vyc29yOiBbMSwgMTBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbMCwgNF0pXG4gICAgICAgICAgaXQgXCJbZnJvbSBib3R0b21dIGtlZXAgY29sdW1uXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMywgMTBdXG4gICAgICAgICAgICBlbnN1cmUgJ2QgaSBpJywgY3Vyc29yOiBbMSwgMTBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbMCwgNF0pXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ0YXJnZXQgaXMgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgICAgcGFyYWdyYXBoVGV4dCA9IFwiXCJcIlxuICAgICAgICAgICAgcDEtLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAxLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAgICAgICBwMi0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDItLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHAyLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgICAgICAgIHAzLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBwMy0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgcDMtLS0tLS0tLS0tLS0tLS1cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgdGV4dERhdGEgPSBuZXcgVGV4dERhdGEocGFyYWdyYXBoVGV4dClcbiAgICAgICAgICBQMSA9IFswLCAxLCAyXVxuICAgICAgICAgIEIxID0gM1xuICAgICAgICAgIFAyID0gWzQsIDUsIDZdXG4gICAgICAgICAgQjIgPSA3XG4gICAgICAgICAgUDMgPSBbOCwgOSwgMTBdXG4gICAgICAgICAgQjMgPSAxMVxuXG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0XG4gICAgICAgICAgICAgIHRleHQ6IHRleHREYXRhLmdldFJhdygpXG5cbiAgICAgICAgICBpdCBcInNldCBjdXJzb3IgdG8gc3RhcnQgb2YgZGVsZXRpb24gYWZ0ZXIgZGVsZXRlIFtmcm9tIGJvdHRvbSBvZiBwYXJhZ3JhcGhdXCIsIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIGVuc3VyZSAnZCBpIHAnLCBjdXJzb3I6IFswLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLi5CM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICdqIC4nLCBjdXJzb3I6IFsxLCAwXSwgdGV4dDogdGV4dERhdGEuZ2V0TGluZXMoW0IxLCBCMiwgUDMuLi4sIEIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJ2ogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBCM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgIGl0IFwic2V0IGN1cnNvciB0byBzdGFydCBvZiBkZWxldGlvbiBhZnRlciBkZWxldGUgW2Zyb20gbWlkZGxlIG9mIHBhcmFncmFwaF1cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgcCcsIGN1cnNvcjogWzAsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEuLkIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJzIgaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIFAzLi4uLCBCM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICcyIGogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBCM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgIGl0IFwic2V0IGN1cnNvciB0byBzdGFydCBvZiBkZWxldGlvbiBhZnRlciBkZWxldGUgW2Zyb20gYm90dG9tIG9mIHBhcmFncmFwaF1cIiwgLT5cbiAgICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgZW5zdXJlICdkIGkgcCcsIGN1cnNvcjogWzAsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEuLkIzXSwgY2hvbXA6IHRydWUpXG4gICAgICAgICAgICBlbnN1cmUgJzMgaiAuJywgY3Vyc29yOiBbMSwgMF0sIHRleHQ6IHRleHREYXRhLmdldExpbmVzKFtCMSwgQjIsIFAzLi4uLCBCM10sIGNob21wOiB0cnVlKVxuICAgICAgICAgICAgZW5zdXJlICczIGogLicsIGN1cnNvcjogWzEsIDBdLCB0ZXh0OiB0ZXh0RGF0YS5nZXRMaW5lcyhbQjEsIEIyLCBCM10sIGNob21wOiB0cnVlKVxuXG4gIGRlc2NyaWJlIFwidGhlIEQga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDAwMFxuICAgICAgICAxMTExXG4gICAgICAgIDIyMjJcbiAgICAgICAgMzMzM1xuICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZGVsZXRlcyB0aGUgY29udGVudHMgdW50aWwgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgZW5zdXJlICdEJywgdGV4dDogXCIwXFxuMTExMVxcbjIyMjJcXG4zMzMzXCJcblxuICAgIGl0IFwiaW4gdmlzdWFsLW1vZGUsIGl0IGRlbGV0ZSB3aG9sZSBsaW5lXCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgRCcsIHRleHQ6IFwiMTExMVxcbjIyMjJcXG4zMzMzXCJcbiAgICAgIGVuc3VyZSBcInYgaiBEXCIsIHRleHQ6IFwiMzMzM1wiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgeSBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgMDEyIHwzNDVcbiAgICAgICAgYWJjXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyIGVuYWJsZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWUpXG4gICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKCdfX19fX19fX19fXycpXG4gICAgICAgIGVuc3VyZSBudWxsLCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ19fX19fX19fX19fJ1xuXG4gICAgICBkZXNjcmliZSBcInJlYWQvd3JpdGUgdG8gY2xpcGJvYXJkIHRocm91Z2ggcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgaXQgXCJ3cml0ZXMgdG8gY2xpcGJvYXJkIHdpdGggZGVmYXVsdCByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIHNhdmVkVGV4dCA9ICcwMTIgMzQ1XFxuJ1xuICAgICAgICAgIGVuc3VyZSAneSB5JywgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHNhdmVkVGV4dFxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvQmUoc2F2ZWRUZXh0KVxuXG4gICAgZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZS5saW5ld2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAwMDAwfDAwXG4gICAgICAgICAgICAxMTExMTFcbiAgICAgICAgICAgIDIyMjIyMlxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIG5vdCByZXZlcnNlZFwiLCAtPlxuICAgICAgICBpdCBcInNhdmVzIHRvIHJlZ2lzdGVyKHR5cGU9bGluZXdpc2UpLCBjdXJzb3IgbW92ZSB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJWIGogeVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAwMDAwMFxcbjExMTExMVxcblwiLCB0eXBlOiAnbGluZXdpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwic2VsZWN0aW9uIGlzIHJldmVyc2VkXCIsIC0+XG4gICAgICAgIGl0IFwic2F2ZXMgdG8gcmVnaXN0ZXIodHlwZT1saW5ld2lzZSksIGN1cnNvciBkb2Vzbid0IG1vdmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgICBlbnN1cmUgXCJWIGsgeVwiLFxuICAgICAgICAgICAgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjExMTExMVxcbjIyMjIyMlxcblwiLCB0eXBlOiAnbGluZXdpc2UnXG5cbiAgICBkZXNjcmliZSBcInZpc3VhbC1tb2RlLmJsb2Nrd2lzZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIDAwMDAwMFxuICAgICAgICAgIDEhMTExMTFcbiAgICAgICAgICAyMjIyMjJcbiAgICAgICAgICAzMzMzMzNcbiAgICAgICAgICA0fDQ0NDQ0XG4gICAgICAgICAgNTU1NTU1XFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImN0cmwtdiBsIGwgalwiLFxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjExMVwiLCBcIjIyMlwiLCBcIjQ0NFwiLCBcIjU1NVwiXVxuICAgICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2Jsb2Nrd2lzZSddXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBzdGF5T25ZYW5rID0gZmFsc2VcIiwgLT5cbiAgICAgICAgaXQgXCJwbGFjZSBjdXJzb3IgYXQgc3RhcnQgb2YgYmxvY2sgYWZ0ZXIgeWFua1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInlcIixcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgICAwMDAwMDBcbiAgICAgICAgICAgICAgMSExMTExMVxuICAgICAgICAgICAgICAyMjIyMjJcbiAgICAgICAgICAgICAgMzMzMzMzXG4gICAgICAgICAgICAgIDR8NDQ0NDRcbiAgICAgICAgICAgICAgNTU1NTU1XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHN0YXlPbllhbmsgPSB0cnVlXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPbllhbmsnLCB0cnVlKVxuICAgICAgICBpdCBcInBsYWNlIGN1cnNvciBhdCBoZWFkIG9mIGJsb2NrIGFmdGVyIHlhbmtcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5XCIsXG4gICAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgMDAwMDAwXG4gICAgICAgICAgICAgIDExMTExMVxuICAgICAgICAgICAgICAyMjIhMjIyXG4gICAgICAgICAgICAgIDMzMzMzM1xuICAgICAgICAgICAgICA0NDQ0NDRcbiAgICAgICAgICAgICAgNTU1fDU1NVxcblxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwieSB5XCIsIC0+XG4gICAgICBpdCBcInNhdmVzIHRvIHJlZ2lzdGVyKHR5cGU9bGluZXdpc2UpLCBjdXJzb3Igc3RheSBhdCBzYW1lIHBvc2l0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5JyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjAxMiAzNDVcXG5cIiwgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgaXQgXCJbTiB5IHldIHlhbmsgTiBsaW5lLCBzdGFydGluZyBmcm9tIHRoZSBjdXJyZW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSAyIHknLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDRdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMDEyIDM0NVxcbmFiY1xcblwiXG4gICAgICBpdCBcIlt5IE4geV0geWFuayBOIGxpbmUsIHN0YXJ0aW5nIGZyb20gdGhlIGN1cnJlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlICcyIHkgeScsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgNF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuYWJjXFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIHRoZSBsaW5lIHRvIHRoZSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IHknLCByZWdpc3RlcjogYTogdGV4dDogXCIwMTIgMzQ1XFxuXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBBIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcImFwcGVuZCB0byBleGlzdGluZyB2YWx1ZSBvZiBsb3dlcmNhc2UtbmFtZWQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdcIiBhIHkgeScsIHJlZ2lzdGVyOiBhOiB0ZXh0OiBcIjAxMiAzNDVcXG5cIlxuICAgICAgICBlbnN1cmUgJ1wiIEEgeSB5JywgcmVnaXN0ZXI6IGE6IHRleHQ6IFwiMDEyIDM0NVxcbjAxMiAzNDVcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIGEgbW90aW9uXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcblxuICAgICAgaXQgXCJ5YW5rIGZyb20gaGVyZSB0byBkZXN0bmF0aW9uIG9mIG1vdGlvblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgZScsIGN1cnNvcjogWzAsIDRdLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICczNDUnfVxuXG4gICAgICBpdCBcImRvZXMgbm90IHlhbmsgd2hlbiBtb3Rpb24gZmFpbGVkXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB0IHgnLCByZWdpc3RlcjogeydcIic6IHRleHQ6IHVuZGVmaW5lZH1cblxuICAgICAgaXQgXCJ5YW5rIGFuZCBtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGgnLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcgJ1xuXG4gICAgICBpdCBcIlt3aXRoIGxpbmV3aXNlIG1vdGlvbl0geWFuayBhbmQgZGVzbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBqJyxcbiAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuYWJjXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICBkZXNjcmliZSBcIndpdGggYSB0ZXh0LW9ialwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFsyLCA4XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgMXN0IHBhcmFncmFwaFxuICAgICAgICAgIDFzdCBwYXJhZ3JhcGhcblxuICAgICAgICAgIDJuIHBhcmFncmFwaFxuICAgICAgICAgIDJuIHBhcmFncmFwaFxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJpbm5lci13b3JkIGFuZCBtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGkgdycsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwicGFyYWdyYXBoXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCA0XVxuXG4gICAgICBpdCBcInlhbmsgdGV4dC1vYmplY3QgaW5uZXItcGFyYWdyYXBoIGFuZCBtb3ZlIGN1cnNvciB0byBzdGFydCBvZiB0YXJnZXRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd5IGkgcCcsXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIxc3QgcGFyYWdyYXBoXFxuMXN0IHBhcmFncmFwaFxcblwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxcblxuICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBpdCBcInlhbmsgYW5kIGRvZXNuJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDBdXG4gICAgICAgIGVuc3VyZSAneSBHJyxcbiAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjZGVcXG5BQkNERVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuICAgICAgICAgIGN1cnNvcjogWzEsIDBdXG5cbiAgICAgIGl0IFwieWFuayBhbmQgZG9lc24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICd5IEcnLFxuICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogXCJhYmNkZVxcbkFCQ0RFXFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG4gICAgICAgICAgY3Vyc29yOiBbMSwgMl1cblxuICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIGdvdG8gbGluZSBHXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiMTIzNDVcXG5hYmNkZVxcbkFCQ0RFXCJcbiAgICAgICAgc2V0IHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgICBkZXNjcmliZSBcIm9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlY29uZCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiZGVsZXRlcyB0aGUgYm90dG9tIHR3byBsaW5lc1wiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgIGVuc3VyZSAneSAyIEcgUCcsIHRleHQ6ICcxMjM0NVxcbmFiY2RlXFxuYWJjZGVcXG5BQkNERSdcblxuICAgICAgZGVzY3JpYmUgXCJvbiB0aGUgbWlkZGxlIG9mIHRoZSBzZWNvbmQgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImRlbGV0ZXMgdGhlIGJvdHRvbSB0d28gbGluZXNcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgICBlbnN1cmUgJ3kgMiBHIFAnLCB0ZXh0OiAnMTIzNDVcXG5hYmNkZVxcbmFiY2RlXFxuQUJDREUnXG5cbiAgICBkZXNjcmliZSBcIndpdGggbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyBlYWNoIGN1cnNvciBhbmQgY29waWVzIHRoZSBsYXN0IHNlbGVjdGlvbidzIHRleHRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIgIGFiY2RcXG4gIDEyMzRcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzEsIDVdXVxuICAgICAgICBlbnN1cmUgJ3kgXicsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMjMnXG4gICAgICAgICAgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMl1dXG5cbiAgICBkZXNjcmliZSBcInN0YXlPbllhbmsgc2V0dGluZ1wiLCAtPlxuICAgICAgdGV4dCA9IG51bGxcbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25ZYW5rJywgdHJ1ZSlcblxuICAgICAgICB0ZXh0ID0gbmV3IFRleHREYXRhIFwiXCJcIlxuICAgICAgICAgIDBfMjM0NTY3XG4gICAgICAgICAgMV8yMzQ1NjdcbiAgICAgICAgICAyXzIzNDU2N1xuXG4gICAgICAgICAgNF8yMzQ1NjdcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgc2V0IHRleHQ6IHRleHQuZ2V0UmF3KCksIGN1cnNvcjogWzEsIDJdXG5cbiAgICAgIGl0IFwiZG9uJ3QgbW92ZSBjdXJzb3IgYWZ0ZXIgeWFuayBmcm9tIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInkgaSBwXCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMC4uMl0pXG4gICAgICAgIGVuc3VyZSBcImogeSB5XCIsIGN1cnNvcjogWzIsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogdGV4dC5nZXRMaW5lcyhbMl0pXG4gICAgICAgIGVuc3VyZSBcImsgLlwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICBlbnN1cmUgXCJ5IGhcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIl9cIlxuICAgICAgICBlbnN1cmUgXCJ5IGJcIiwgY3Vyc29yOiBbMSwgMl0sIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcIjFfXCJcblxuICAgICAgaXQgXCJkb24ndCBtb3ZlIGN1cnNvciBhZnRlciB5YW5rIGZyb20gdmlzdWFsLWxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIlYgeVwiLCBjdXJzb3I6IFsxLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzFdKVxuICAgICAgICBlbnN1cmUgXCJWIGogeVwiLCBjdXJzb3I6IFsyLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHQuZ2V0TGluZXMoWzEuLjJdKVxuXG4gICAgICBpdCBcImRvbid0IG1vdmUgY3Vyc29yIGFmdGVyIHlhbmsgZnJvbSB2aXN1YWwtY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ2IGwgbCB5XCIsIGN1cnNvcjogWzEsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIyMzRcIlxuICAgICAgICBlbnN1cmUgXCJ2IGggaCB5XCIsIGN1cnNvcjogWzEsIDJdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIyMzRcIlxuICAgICAgICBlbnN1cmUgXCJ2IGogeVwiLCBjdXJzb3I6IFsyLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0NTY3XFxuMl8yXCJcbiAgICAgICAgZW5zdXJlIFwidiAyIGsgeVwiLCBjdXJzb3I6IFswLCAyXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMjM0NTY3XFxuMV8yMzQ1NjdcXG4yXzJcIlxuXG4gIGRlc2NyaWJlIFwidGhlIHl5IGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIm9uIGEgc2luZ2xlIGxpbmUgZmlsZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCJleGNsYW1hdGlvbiFcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJjb3BpZXMgdGhlIGVudGlyZSBsaW5lIGFuZCBwYXN0ZXMgaXQgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5IHAnLFxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiBcImV4Y2xhbWF0aW9uIVxcblwiXG4gICAgICAgICAgdGV4dDogXCJleGNsYW1hdGlvbiFcXG5leGNsYW1hdGlvbiFcXG5cIlxuXG4gICAgZGVzY3JpYmUgXCJvbiBhIHNpbmdsZSBsaW5lIGZpbGUgd2l0aCBubyBuZXdsaW5lXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIm5vIG5ld2xpbmUhXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwiY29waWVzIHRoZSBlbnRpcmUgbGluZSBhbmQgcGFzdGVzIGl0IGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgeSBwJyxcbiAgICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogXCJubyBuZXdsaW5lIVxcblwiXG4gICAgICAgICAgdGV4dDogXCJubyBuZXdsaW5lIVxcbm5vIG5ld2xpbmUhXFxuXCJcblxuICAgICAgaXQgXCJjb3BpZXMgdGhlIGVudGlyZSBsaW5lIGFuZCBwYXN0ZXMgaXQgcmVzcGVjdGluZyBjb3VudCBhbmQgbmV3IGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSB5IDIgcCcsXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwibm8gbmV3bGluZSFcXG5cIlxuICAgICAgICAgIHRleHQ6IFwibm8gbmV3bGluZSFcXG5ubyBuZXdsaW5lIVxcbm5vIG5ld2xpbmUhXFxuXCJcblxuICBkZXNjcmliZSBcInRoZSBZIGtleWJpbmRpbmdcIiwgLT5cbiAgICB0ZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHRleHQgPSBcIlwiXCJcbiAgICAgIDAxMiAzNDVcbiAgICAgIGFiY1xcblxuICAgICAgXCJcIlwiXG4gICAgICBzZXQgdGV4dDogdGV4dCwgY3Vyc29yOiBbMCwgNF1cblxuICAgIGl0IFwic2F2ZXMgdGhlIGxpbmUgdG8gdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSAnWScsIGN1cnNvcjogWzAsIDRdLCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIwMTIgMzQ1XFxuXCJcblxuICAgIGl0IFwieWFuayB0aGUgd2hvbGUgbGluZXMgdG8gdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBqIFknLCBjdXJzb3I6IFswLCAwXSwgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IHRleHRcblxuICBkZXNjcmliZSBcInRoZSBwIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggc2luZ2xlIGxpbmUgY2hhcmFjdGVyIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldHRpbmdzLnNldCgndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCBmYWxzZSlcblxuICAgICAgICBzZXQgdGV4dEM6IFwifDAxMlxcblwiXG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICdhJ1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShcImNsaXBcIilcblxuICAgICAgZGVzY3JpYmUgXCJmcm9tIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHNcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJwXCIsIHRleHRDOiBcIjAzNHw1MTJcXG5cIlxuXG4gICAgICBkZXNjcmliZSBcImF0IHRoZSBlbmQgb2YgYSBsaW5lXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiMDF8MlxcblwiXG4gICAgICAgIGl0IFwicG9zaXRpb25zIGN1cnNvciBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJwXCIsIHRleHRDOiBcIjAxMjM0fDVcXG5cIlxuXG4gICAgICBkZXNjcmliZSBcInBhc3RlIHRvIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJwYXN0ZSBjb250ZW50IHRvIHRoYXQgZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMXN0XG4gICAgICAgICAgICB8XG4gICAgICAgICAgICAzcmRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcybmQnXG5cbiAgICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMXN0XG4gICAgICAgICAgICAybnxkXG4gICAgICAgICAgICAzcmRcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgZW5hYmxlZFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgY29udGVudHMgZnJvbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmUgJ3AnLCB0ZXh0QzogXCIwY2xpfHAxMlxcblwiXG5cbiAgICAgIGRlc2NyaWJlIFwiZnJvbSBhIHNwZWNpZmllZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSAnYScgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ1wiIGEgcCcsIHRleHRDOiBcIjB8YTEyXFxuXCIsXG5cbiAgICAgIGRlc2NyaWJlIFwiYXQgdGhlIGVuZCBvZiBhIGxpbmVcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGJlZm9yZSB0aGUgY3VycmVudCBsaW5lJ3MgbmV3bGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgYWJjZGVcbiAgICAgICAgICAgIG9uZSB8dHdvIHRocmVlXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2QgJCBrICQgcCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgYWJjZGV0d28gdGhyZXxlXG4gICAgICAgICAgICBvbmVfXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtdWx0aWxpbmUgY2hhcmFjdGVyIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8MDEyXFxuXCJcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1XFxuNjc4J1xuXG4gICAgICBpdCBcInAgcGxhY2UgY3Vyc29yIGF0IHN0YXJ0IG9mIG11dGF0aW9uXCIsIC0+IGVuc3VyZSBcInBcIiwgdGV4dEM6IFwiMHwzNDVcXG42NzgxMlxcblwiXG4gICAgICBpdCBcIlAgcGxhY2UgY3Vyc29yIGF0IHN0YXJ0IG9mIG11dGF0aW9uXCIsIC0+IGVuc3VyZSBcIlBcIiwgdGV4dEM6IFwifDM0NVxcbjY3ODAxMlxcblwiXG5cbiAgICBkZXNjcmliZSBcIndpdGggbGluZXdpc2UgY29udGVudHNcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwib24gYSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogJzB8MTInXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDM0NVxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3AnLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgX3wzNDVcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwicmVwbGFjZXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCBwdXQgY3Vyc29yIHRvIHRoZSBmaXJzdCBjaGFyIG9mIGxpbmVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3YgcCcsICMgJzEnIHdhcyByZXBsYWNlZFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF98MzQ1XG4gICAgICAgICAgICAyXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJvbiBtdWx0aXBsZSBsaW5lc1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgIDM0NVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiIDQ1NlxcblwiLCB0eXBlOiAnbGluZXdpc2UnfVxuXG4gICAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXIgYXQgbWlkZGxlIGxpbmVcIiwgLT5cbiAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBlbnN1cmUgXCJwXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAwMTJcbiAgICAgICAgICAgICB8NDU2XG4gICAgICAgICAgICAgMzQ1XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyIGF0IGVuZCBvZiBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDFdXG4gICAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDAxMlxuICAgICAgICAgICAgIDM0NVxuICAgICAgICAgICAgIHw0NTZcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIG11bHRpcGxlIGxpbmV3aXNlIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAwMTJcbiAgICAgICAgICB8YWJjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIiAzNDVcXG4gNjc4XFxuXCIsIHR5cGU6ICdsaW5ld2lzZSd9XG5cbiAgICAgIGl0IFwiaW5zZXJ0cyB0aGUgY29udGVudHMgb2YgdGhlIGRlZmF1bHQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdwJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMDEyXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgIHwzNDVcbiAgICAgICAgICAgNjc4XFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50IGNvbW1hbmRcIiwgLT5cbiAgICAgIGVuc3VyZVB1dEFmdGVyV2l0aEF1dG9JbmRlbnQgPSAob3B0aW9ucykgLT5cbiAgICAgICAgZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOnB1dC1hZnRlci13aXRoLWF1dG8taW5kZW50JylcbiAgICAgICAgZW5zdXJlKG51bGwsIG9wdGlvbnMpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlKVxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JykudGhlbiAtPlxuICAgICAgICAgICAgc2V0IGdyYW1tYXI6ICdzb3VyY2UuanMnXG5cbiAgICAgIGRlc2NyaWJlIFwicGFzdGUgd2l0aCBhdXRvLWluZGVudFwiLCAtPlxuICAgICAgICBpdCBcImluc2VydHMgdGhlIGNvbnRlbnRzIG9mIHRoZSBkZWZhdWx0IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICByZWdpc3RlcjogJ1wiJzpcbiAgICAgICAgICAgICAgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICAgICAgICB0ZXh0OiBcIiAzNDVcXG5cIixcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgIGlmfCAoKSB7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlUHV0QWZ0ZXJXaXRoQXV0b0luZGVudFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgICAgaWYgKCkge1xuICAgICAgICAgICAgICAgIHwzNDVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJtdWx0aS1saW5lIHJlZ2lzdGVyIGNvbnRlbnRzIHdpdGggYXV0byBpbmRlbnRcIiwgLT5cbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOlxuICAgICAgICAgICAgICB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAgIGlmKDMpIHtcbiAgICAgICAgICAgICAgICAgIGlmKDQpIHt9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICAgIHxpZiAoMikge1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmVQdXRBZnRlcldpdGhBdXRvSW5kZW50XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICBpZiAoMikge1xuICAgICAgICAgICAgICAgIHxpZigzKSB7XG4gICAgICAgICAgICAgICAgICBpZig0KSB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBwYXN0aW5nIGFscmVhZHkgaW5kZW50ZWQgbXVsdGktbGluZXMgcmVnaXN0ZXIgY29udGVudFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBpZiAoMSkge1xuICAgICAgICAgICAgICB8aWYgKDIpIHtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJrZWVwIG9yaWdpbmFsIGxheW91dFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzpcbiAgICAgICAgICAgIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAgYTogMTIzLFxuICAgICAgICAgICAgYmJiYjogNDU2LFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlUHV0QWZ0ZXJXaXRoQXV0b0luZGVudFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgaWYgKDEpIHtcbiAgICAgICAgICAgICAgaWYgKDIpIHtcbiAgICAgICAgICAgICAgICAgICB8YTogMTIzLFxuICAgICAgICAgICAgICAgIGJiYmI6IDQ1NixcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJrZWVwIG9yaWdpbmFsIGxheW91dCBbcmVnaXN0ZXIgY29udGVudCBoYXZlIGJsYW5rIHJvd11cIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6XG4gICAgICAgICAgICB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgaWYoMykge1xuICAgICAgICAgICAgICBfX2FiY1xuXG4gICAgICAgICAgICAgIF9fZGVmXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXCJcIlwiLnJlcGxhY2UoL18vZywgJyAnKVxuICAgICAgICAgIGVuc3VyZVB1dEFmdGVyV2l0aEF1dG9JbmRlbnRcbiAgICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgICAgIGlmICgxKSB7XG4gICAgICAgICAgICAgICAgaWYgKDIpIHtcbiAgICAgICAgICAgICAgICAgIHxpZigzKSB7XG4gICAgICAgICAgICAgICAgICAgIGFiY1xuXG4gICAgICAgICAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwicGFzdGluZyB0d2ljZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIjEyMzQ1XFxuYWJjZGVcXG5BQkNERVxcblFXRVJUXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuICAgICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMTIzJ1xuICAgICAgICBlbnN1cmUgJzIgcCdcblxuICAgICAgaXQgXCJpbnNlcnRzIHRoZSBzYW1lIGxpbmUgdHdpY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlIG51bGwsIHRleHQ6IFwiMTIzNDVcXG5hYjEyMzEyM2NkZVxcbkFCQ0RFXFxuUVdFUlRcIlxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdW5kb25lXCIsIC0+XG4gICAgICAgIGl0IFwicmVtb3ZlcyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICd1JywgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5RV0VSVFwiXG5cbiAgICBkZXNjcmliZSBcInN1cHBvcnQgbXVsdGlwbGUgY3Vyc29yc1wiLCAtPlxuICAgICAgaXQgXCJwYXN0ZSB0ZXh0IGZvciBlYWNoIGN1cnNvcnNcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFiY2RlXFxuQUJDREVcXG5RV0VSVFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMiwgMF1dXG4gICAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdaWlonXG4gICAgICAgIGVuc3VyZSAncCcsXG4gICAgICAgICAgdGV4dDogXCIxMjM0NVxcbmFaWlpiY2RlXFxuQVpaWkJDREVcXG5RV0VSVFwiXG4gICAgICAgICAgY3Vyc29yOiBbWzEsIDNdLCBbMiwgM11dXG5cbiAgICBkZXNjcmliZSBcIndpdGggYSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogJzAxMlxcbidcbiAgICAgICAgICBjdXJzb3I6IFswLCAxXVxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGNoYXJhY3Rlcndpc2Ugc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggY2hhcndpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcIlxuICAgICAgICAgIGVuc3VyZSAndiBwJywgdGV4dDogXCIwMzQ1MlxcblwiLCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBpdCBcInJlcGxhY2VzIHNlbGVjdGlvbiB3aXRoIGxpbmV3aXNlIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMzQ1XFxuXCJcbiAgICAgICAgICBlbnN1cmUgJ3YgcCcsIHRleHQ6IFwiMFxcbjM0NVxcbjJcXG5cIiwgY3Vyc29yOiBbMSwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aXRoIGxpbmV3aXNlIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcInJlcGxhY2VzIHNlbGVjdGlvbiB3aXRoIGNoYXJ3aXNlIGNvbnRlbnRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCIwMTJcXG5hYmNcIiwgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6IFwiMzQ1XCJcbiAgICAgICAgICBlbnN1cmUgJ1YgcCcsIHRleHQ6IFwiMzQ1XFxuYWJjXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGl0IFwicmVwbGFjZXMgc2VsZWN0aW9uIHdpdGggbGluZXdpc2UgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogXCIzNDVcXG5cIlxuICAgICAgICAgIGVuc3VyZSAnViBwJywgdGV4dDogXCIzNDVcXG5cIiwgY3Vyc29yOiBbMCwgMF1cblxuICBkZXNjcmliZSBcInRoZSBQIGtleWJpbmRpbmdcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggY2hhcmFjdGVyIGNvbnRlbnRzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjAxMlxcblwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgIHNldCByZWdpc3RlcjogYTogdGV4dDogJ2EnXG4gICAgICAgIGVuc3VyZSAnUCdcblxuICAgICAgaXQgXCJpbnNlcnRzIHRoZSBjb250ZW50cyBvZiB0aGUgZGVmYXVsdCByZWdpc3RlciBhYm92ZVwiLCAtPlxuICAgICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCIzNDUwMTJcXG5cIiwgY3Vyc29yOiBbMCwgMl1cblxuICBkZXNjcmliZSBcInRoZSAuIGtleWJpbmRpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogXCIxMlxcbjM0XFxuNTZcXG43OFwiLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRzIHRoZSBsYXN0IG9wZXJhdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICcyIGQgZCAuJywgdGV4dDogXCJcIlxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIG1vdGlvbnNcIiwgLT5cbiAgICAgIGVuc3VyZSAnZCBkIDIgLicsIHRleHQ6IFwiNzhcIlxuXG4gIGRlc2NyaWJlIFwidGhlIHIga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMTJcbiAgICAgICAgMzRcbiAgICAgICAgXFxuXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBjdXJzb3I6IFtbMCwgMF0sIFsxLCAwXV1cblxuICAgIGl0IFwicmVwbGFjZXMgYSBzaW5nbGUgY2hhcmFjdGVyXCIsIC0+XG4gICAgICBlbnN1cmVXYWl0ICdyIHgnLCB0ZXh0OiAneDJcXG54NFxcblxcbidcblxuICAgIGl0IFwicmVtYWluIHZpc3VhbC1tb2RlIHdoZW4gY2FuY2VsbGVkXCIsIC0+XG4gICAgICBlbnN1cmVXYWl0ICd2IHIgZXNjYXBlJyxcbiAgICAgICAgdGV4dDogJzEyXFxuMzRcXG5cXG4nXG4gICAgICAgIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuXG4gICAgaXQgXCJyZXBsYWNlcyBhIHNpbmdsZSBjaGFyYWN0ZXIgd2l0aCBhIGxpbmUgYnJlYWtcIiwgLT5cbiAgICAgIGVuc3VyZVdhaXQgJ3IgZW50ZXInLFxuICAgICAgICB0ZXh0OiAnXFxuMlxcblxcbjRcXG5cXG4nXG4gICAgICAgIGN1cnNvcjogW1sxLCAwXSwgWzMsIDBdXVxuXG4gICAgaXQgXCJhdXRvIGluZGVudCB3aGVuIHJlcGxhY2VkIHdpdGggc2luZ2UgbmV3IGxpbmVcIiwgLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfX2F8YmNcbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmVXYWl0ICdyIGVudGVyJyxcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX19hXG4gICAgICAgIF9ffGNcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImNvbXBvc2VzIHByb3Blcmx5IHdpdGggbW90aW9uc1wiLCAtPlxuICAgICAgZW5zdXJlV2FpdCAnMiByIHgnLCB0ZXh0OiAneHhcXG54eFxcblxcbidcblxuICAgIGl0IFwiZG9lcyBub3RoaW5nIG9uIGFuIGVtcHR5IGxpbmVcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZW5zdXJlV2FpdCAnciB4JywgdGV4dDogJzEyXFxuMzRcXG5cXG4nXG5cbiAgICBpdCBcImRvZXMgbm90aGluZyBpZiBhc2tlZCB0byByZXBsYWNlIG1vcmUgY2hhcmFjdGVycyB0aGFuIHRoZXJlIGFyZSBvbiBhIGxpbmVcIiwgLT5cbiAgICAgIGVuc3VyZVdhaXQgJzMgciB4JywgdGV4dDogJzEyXFxuMzRcXG5cXG4nXG5cbiAgICBkZXNjcmliZSBcImNhbmNlbGxhdGlvblwiLCAtPlxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgd2hlbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAnciBlc2NhcGUnLCB0ZXh0OiAnMTJcXG4zNFxcblxcbicsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgIGl0IFwia2VlcCBtdWx0aS1jdXJzb3Igb24gY2FuY2VsbGVkXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGFcXG4hICAgIGFcXG58ICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmVXYWl0IFwiciBlc2NhcGVcIiwgdGV4dEM6IFwifCAgICBhXFxuISAgICBhXFxufCAgICBhXFxuXCIsIG1vZGU6IFwibm9ybWFsXCJcblxuICAgICAgaXQgXCJrZWVwIG11bHRpLWN1cnNvciBvbiBjYW5jZWxsZWRcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgIHRleHRDOiBcInwqKmFcXG4hKiphXFxufCoqYVxcblwiXG4gICAgICAgIGVuc3VyZVdhaXQgXCJ2IGxcIiwgICAgICB0ZXh0QzogXCIqKnxhXFxuKiohYVxcbioqfGFcXG5cIiwgc2VsZWN0ZWRUZXh0OiBbXCIqKlwiLCBcIioqXCIsIFwiKipcIl0sIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgZW5zdXJlV2FpdCBcInIgZXNjYXBlXCIsIHRleHRDOiBcIioqfGFcXG4qKiFhXFxuKip8YVxcblwiLCBzZWxlY3RlZFRleHQ6IFtcIioqXCIsIFwiKipcIiwgXCIqKlwiXSwgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGVuc3VyZSAndiBlJ1xuXG4gICAgICBpdCBcInJlcGxhY2VzIHRoZSBlbnRpcmUgc2VsZWN0aW9uIHdpdGggdGhlIGdpdmVuIGNoYXJhY3RlclwiLCAtPlxuICAgICAgICBlbnN1cmVXYWl0ICdyIHgnLCB0ZXh0OiAneHhcXG54eFxcblxcbidcblxuICAgICAgaXQgXCJsZWF2ZXMgdGhlIGN1cnNvciBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAnciB4JywgY3Vyc29yOiBbWzAsIDBdLCBbMSwgMF1dXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaW4gdmlzdWFsLWJsb2NrIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMSwgNF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDA6MjM0NVxuICAgICAgICAgICAgMTogbzExb1xuICAgICAgICAgICAgMjogbzIyb1xuICAgICAgICAgICAgMzogbzMzb1xuICAgICAgICAgICAgNDogbzQ0b1xcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnY3RybC12IGwgMyBqJyxcbiAgICAgICAgICBtb2RlOiBbJ3Zpc3VhbCcsICdibG9ja3dpc2UnXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFsnMTEnLCAnMjInLCAnMzMnLCAnNDQnXSxcblxuICAgICAgaXQgXCJyZXBsYWNlcyBlYWNoIHNlbGVjdGlvbiBhbmQgcHV0IGN1cnNvciBvbiBzdGFydCBvZiB0b3Agc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBlbnN1cmVXYWl0ICdyIHgnLFxuICAgICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICAgIGN1cnNvcjogWzEsIDRdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDoyMzQ1XG4gICAgICAgICAgICAgIDE6IG94eG9cbiAgICAgICAgICAgICAgMjogb3h4b1xuICAgICAgICAgICAgICAzOiBveHhvXG4gICAgICAgICAgICAgIDQ6IG94eG9cXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBlbnN1cmVXYWl0ICcuJyxcbiAgICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgICBjdXJzb3I6IFsxLCAwXVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDA6MjM0NVxuICAgICAgICAgICAgICB4eCBveHhvXG4gICAgICAgICAgICAgIHh4IG94eG9cbiAgICAgICAgICAgICAgeHggb3h4b1xuICAgICAgICAgICAgICB4eCBveHhvXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICd0aGUgbSBrZXliaW5kaW5nJywgLT5cbiAgICBlbnN1cmVNYXJrQnlNb2RlID0gKG1vZGUpIC0+XG4gICAgICBfZW5zdXJlID0gYmluZEVuc3VyZVdhaXRPcHRpb24oe21vZGV9KVxuICAgICAgX2Vuc3VyZSBcIm0gYVwiLCBtYXJrOiBcImFcIjogWzAsIDJdXG4gICAgICBfZW5zdXJlIFwibCBtIGFcIiwgbWFyazogXCJhXCI6IFswLCAzXVxuICAgICAgX2Vuc3VyZSBcImogbSBhXCIsIG1hcms6IFwiYVwiOiBbMSwgM11cbiAgICAgIF9lbnN1cmUgXCJqIG0gYlwiLCBtYXJrOiBcImFcIjogWzEsIDNdLCBcImJcIjogWzIsIDNdXG4gICAgICBfZW5zdXJlIFwibCBtIGNcIiwgbWFyazogXCJhXCI6IFsxLCAzXSwgXCJiXCI6IFsyLCAzXSwgXCJjXCI6IFsyLCA0XVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgMDp8IDEyXG4gICAgICAgIDE6IDM0XG4gICAgICAgIDI6IDU2XG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJbbm9ybWFsXSBjYW4gbWFyayBtdWx0aXBsZSBwb3NpdG9uXCIsIC0+XG4gICAgICBlbnN1cmVNYXJrQnlNb2RlKFwibm9ybWFsXCIpXG4gICAgaXQgXCJbdkNdIGNhbiBtYXJrXCIsIC0+XG4gICAgICBlbnN1cmUgXCJ2XCJcbiAgICAgIGVuc3VyZU1hcmtCeU1vZGUoW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXSlcbiAgICBpdCBcIlt2TF0gY2FuIG1hcmtcIiwgLT5cbiAgICAgIGVuc3VyZSBcIlZcIlxuICAgICAgZW5zdXJlTWFya0J5TW9kZShbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXSlcblxuICBkZXNjcmliZSAndGhlIFIga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgNjc4OTBcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwiZW50ZXJzIHJlcGxhY2UgbW9kZSBhbmQgcmVwbGFjZXMgY2hhcmFjdGVyc1wiLCAtPlxuICAgICAgZW5zdXJlICdSJyxcbiAgICAgICAgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImFiXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgdGV4dDogXCIxMmFiNVxcbjY3ODkwXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgICAgbW9kZTogJ25vcm1hbCdcblxuICAgIGl0IFwiY29udGludWVzIGJleW9uZCBlbmQgb2YgbGluZSBhcyBpbnNlcnRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUicsXG4gICAgICAgIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNkZVwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZScsIHRleHQ6ICcxMmFiY2RlXFxuNjc4OTAnXG5cbiAgICBpdCAndHJlYXRzIGJhY2tzcGFjZSBhcyB1bmRvJywgLT5cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiZm9vXCJcbiAgICAgIGVuc3VyZSAnUidcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVwiXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dCBcImJcIlxuICAgICAgZW5zdXJlIG51bGwsIHRleHQ6IFwiMTJmb29hYjVcXG42Nzg5MFwiXG5cbiAgICAgIGVuc3VyZSAnYmFja3NwYWNlJywgdGV4dDogXCIxMmZvb2E0NVxcbjY3ODkwXCJcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiY1wiXG4gICAgICBlbnN1cmUgbnVsbCwgdGV4dDogXCIxMmZvb2FjNVxcbjY3ODkwXCJcbiAgICAgIGVuc3VyZSAnYmFja3NwYWNlIGJhY2tzcGFjZScsXG4gICAgICAgIHRleHQ6IFwiMTJmb28zNDVcXG42Nzg5MFwiXG4gICAgICAgIHNlbGVjdGVkVGV4dDogJydcblxuICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICB0ZXh0OiBcIjEyZm9vMzQ1XFxuNjc4OTBcIlxuICAgICAgICBzZWxlY3RlZFRleHQ6ICcnXG5cbiAgICBpdCBcImNhbiBiZSByZXBlYXRlZFwiLCAtPlxuICAgICAgZW5zdXJlICdSJ1xuICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZSdcbiAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmFiNVxcbjY3YWIwXCIsIGN1cnNvcjogWzEsIDNdXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTJhYmFiXFxuNjdhYjBcIiwgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0IFwiY2FuIGJlIGludGVycnVwdGVkIGJ5IGFycm93IGtleXMgYW5kIGJlaGF2ZSBhcyBpbnNlcnQgZm9yIHJlcGVhdFwiLCAtPlxuICAgICAgIyBGSVhNRSBkb24ndCBrbm93IGhvdyB0byB0ZXN0IHRoaXMgKGFsc28sIGRlcGVuZHMgb24gUFIgIzU2OClcblxuICAgIGl0IFwicmVwZWF0cyBjb3JyZWN0bHkgd2hlbiBiYWNrc3BhY2Ugd2FzIHVzZWQgaW4gdGhlIHRleHRcIiwgLT5cbiAgICAgIGVuc3VyZSAnUidcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVwiXG4gICAgICBlbnN1cmUgJ2JhY2tzcGFjZSdcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYlwiXG4gICAgICBlbnN1cmUgJ2VzY2FwZSdcbiAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgZW5zdXJlICcuJywgdGV4dDogXCIxMmI0NVxcbjY3YjkwXCIsIGN1cnNvcjogWzEsIDJdXG4gICAgICBzZXQgY3Vyc29yOiBbMCwgNF1cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiMTJiNGJcXG42N2I5MFwiLCBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJkb2Vzbid0IHJlcGxhY2UgYSBjaGFyYWN0ZXIgaWYgbmV3bGluZSBpcyBlbnRlcmVkXCIsIC0+XG4gICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiXFxuXCJcbiAgICAgIGVuc3VyZSAnZXNjYXBlJywgdGV4dDogXCIxMlxcbjM0NVxcbjY3ODkwXCJcblxuICAgIGRlc2NyaWJlIFwibXVsdGlsaW5lIHNpdHVhdGlvblwiLCAtPlxuICAgICAgdGV4dE9yaWdpbmFsID0gXCJcIlwiXG4gICAgICAgIDAxMjM0XG4gICAgICAgIDU2Nzg5XG4gICAgICAgIFwiXCJcIlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogdGV4dE9yaWdpbmFsLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJyZXBsYWNlIGNoYXJhY3RlciB1bmxlc3MgaW5wdXQgaXNudCBuZXcgbGluZShcXFxcbilcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYVxcbmJcXG5jXCJcbiAgICAgICAgZW5zdXJlIG51bGwsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBjMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAxXVxuICAgICAgaXQgXCJoYW5kbGUgYmFja3NwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnUicsIG1vZGU6IFsnaW5zZXJ0JywgJ3JlcGxhY2UnXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhXFxuYlxcbmNcIlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICBjNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiXG4gICAgICAgICAgICAzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzIsIDBdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBhXG4gICAgICAgICAgICBiMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsxLCAxXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwYVxuICAgICAgICAgICAgMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgMF1cbiAgICAgICAgZW5zdXJlICdiYWNrc3BhY2UnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMGEyMzRcbiAgICAgICAgICAgIDU2Nzg5XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgICBlbnN1cmUgJ2JhY2tzcGFjZScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnYmFja3NwYWNlJywgIyBkbyBub3RoaW5nXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjM0XG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgaXQgXCJyZXBlYXRlIG11bHRpbGluZSB0ZXh0IGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1InLCBtb2RlOiBbJ2luc2VydCcsICdyZXBsYWNlJ11cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgXCJhYmNcXG5kZWZcIlxuICAgICAgICBlbnN1cmUgbnVsbCxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICA1Njc4OVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMSwgM11cbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBjdXJzb3I6IFsxLCAyXSwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICd1JywgdGV4dDogdGV4dE9yaWdpbmFsXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIDU2YWJjXG4gICAgICAgICAgICBkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzMsIDJdXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwicmVwZWF0ZSBtdWx0aWxpbmUgdGV4dCBjYXNlLTJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdSJywgbW9kZTogWydpbnNlcnQnLCAncmVwbGFjZSddXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiYWJjXFxuZFwiXG4gICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYWJjXG4gICAgICAgICAgICBkNFxuICAgICAgICAgICAgNTY3ODlcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzEsIDFdXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgY3Vyc29yOiBbMSwgMF0sIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkNFxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGQ5XG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMywgMF1cbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuXG4gIGRlc2NyaWJlICdBZGRCbGFua0xpbmVCZWxvdywgQWRkQmxhbmtMaW5lQWJvdmUnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuICAgICAgICBsaW5lMlxuICAgICAgICBsaW5lM1xuICAgICAgICBcIlwiXCJcblxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgJ2VudGVyJzogJ3ZpbS1tb2RlLXBsdXM6YWRkLWJsYW5rLWxpbmUtYmVsb3cnXG4gICAgICAgICAgJ3NoaWZ0LWVudGVyJzogJ3ZpbS1tb2RlLXBsdXM6YWRkLWJsYW5rLWxpbmUtYWJvdmUnXG5cbiAgICBpdCBcImluc2VydCBibGFuayBsaW5lIGJlbG93L2Fib3ZlXCIsIC0+XG4gICAgICBlbnN1cmUgXCJlbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG4gICAgICAgIGxpfG5lMVxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlIFwic2hpZnQtZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuXG4gICAgICAgIGxpfG5lMVxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJbd2l0aC1jb3VudF0gaW5zZXJ0IGJsYW5rIGxpbmUgYmVsb3cvYWJvdmVcIiwgLT5cbiAgICAgIGVuc3VyZSBcIjIgZW50ZXJcIixcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBsaW5lMFxuICAgICAgICBsaXxuZTFcblxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlIFwiMiBzaGlmdC1lbnRlclwiLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIGxpbmUwXG5cblxuICAgICAgICBsaXxuZTFcblxuXG4gICAgICAgIGxpbmUyXG4gICAgICAgIGxpbmUzXG4gICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICdTZWxlY3QgYXMgb3BlcmF0b3InLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldHRpbmdzLnNldCgna2V5bWFwU1RvU2VsZWN0JywgdHJ1ZSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICAgIGRlc2NyaWJlIFwic2VsZWN0IGJ5IHRhcmdldFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMCB8b29vIHh4eCAqKipcbiAgICAgICAgICAxIHh4eCAqKiogb29vXG5cbiAgICAgICAgICAzIG9vbyB4eHggKioqXG4gICAgICAgICAgNCB4eHggKioqIG9vb1xcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcInNlbGVjdCB0ZXh0LW9iamVjdFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzIHBcIiwgIyBwIGlzIGBpIHBgIHNob3J0aGFuZC5cbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCIwIG9vbyB4eHggKioqXFxuMSB4eHggKioqIG9vb1xcblwiXG4gICAgICAgICAgcHJvcGVydHlIZWFkOiBbMSwgMTNdXG5cbiAgICAgIGl0IFwic2VsZWN0IGJ5IG1vdGlvbiBqIHdpdGggc3RheU9uU2VsZWN0VGV4dE9iamVjdFwiLCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIsIHRydWUpXG4gICAgICAgIGVuc3VyZSBcInMgaSBwXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwibGluZXdpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuICAgICAgICAgIHByb3BlcnR5SGVhZDogWzEsIDJdXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gdGV4dC1vYmplY3Qgd2l0aCBvY2N1cnJlbmNlLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgbyBwXCIsICMgcCBpcyBgaSBwYCBzaG9ydGhhbmQuXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFswLCA1XV1cbiAgICAgICAgICAgIFtbMSwgMTBdLCBbMSwgMTNdXVxuICAgICAgICAgIF1cblxuICAgICAgaXQgXCJzZWxlY3Qgb2NjdXJyZW5jZSBpbiB0ZXh0LW9iamVjdCB3aXRoIHByZXNldC1vY2N1cnJlbmNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgbyBzIHBcIiwgIyBwIGlzIGBpIHBgIHNob3J0aGFuZC5cbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1xuICAgICAgICAgICAgW1swLCAyXSwgWzAsIDVdXVxuICAgICAgICAgICAgW1sxLCAxMF0sIFsxLCAxM11dXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcImNvbnZlcnQgcHJlc2lzdGVudC1zZWxlY3Rpb24gaW50byBub3JtYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgaiBlbnRlclwiLFxuICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDFcbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFsxLCAzXV1cbiAgICAgICAgICBdXG5cbiAgICAgICAgZW5zdXJlIFwiaiBqIHYgalwiLFxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMVxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZTogW1xuICAgICAgICAgICAgW1swLCAyXSwgWzEsIDNdXVxuICAgICAgICAgIF1cbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIm9vbyB4eHggKioqXFxuNCB4XCJcblxuICAgICAgICAjIE5vdyBpdCdzIHNob3cgdGltZSwgdG8gY29udmVydCBwZXJzaXN0ZW50IHNlbGVjdGlvbiBpbnRvIG5vcm1hbCBzZWxlY3Rpb25cbiAgICAgICAgIyBieSBvbmx5IGBzYC5cbiAgICAgICAgZW5zdXJlIFwic1wiLFxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgICBwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IDBcbiAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJvb28geHh4ICoqKlxcbjEgeFwiLCBcIm9vbyB4eHggKioqXFxuNCB4XCJdXG5cbiAgICAgIGl0IFwic2VsZWN0IHByZXNldC1vY2N1cnJlbmNlIGluIHByZXNpc3RlbnQtc2VsZWN0aW9uIGFuZCBub3JtYWwgc2VsZWN0aW9uXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcImcgb1wiLFxuICAgICAgICAgIG9jY3VycmVuY2VUZXh0OiBbJ29vbycsICdvb28nLCAnb29vJywgJ29vbyddXG5cbiAgICAgICAgZW5zdXJlIFwiViBqIGVudGVyIEcgVlwiLFxuICAgICAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogMVxuICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImxpbmV3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIjQgeHh4ICoqKiBvb29cXG5cIlxuXG4gICAgICAgIGVuc3VyZSBcInNcIiwgIyBOb3RpY2UgYG9vb2AgaW4gcm93IDMgaXMgRVhDTFVERUQuXG4gICAgICAgICAgcGVyc2lzdGVudFNlbGVjdGlvbkNvdW50OiAwXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogW1wib29vXCIsIFwib29vXCIsIFwib29vXCJdXG4gICAgICAgICAgc2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFtbMCwgMl0sIFswLCA1XV1cbiAgICAgICAgICAgIFtbMSwgMTBdLCBbMSwgMTNdXVxuICAgICAgICAgICAgW1s0LCAxMF0sIFs0LCAxM11dXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcInNlbGVjdCBieSBtb3Rpb24gJFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJzICRcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBcIm9vbyB4eHggKioqXFxuXCJcblxuICAgICAgaXQgXCJzZWxlY3QgYnkgbW90aW9uIGpcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwicyBqXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwibGluZXdpc2VcIl1cbiAgICAgICAgICBzZWxlY3RlZFRleHQ6IFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuXG4gICAgICBpdCBcInNlbGVjdCBieSBtb3Rpb24gaiB2LW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgdiBqXCIsXG4gICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dDogXCJvb28geHh4ICoqKlxcbjEgeFwiXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgYnkgbW90aW9uIEdcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwicyBvIEdcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgc2VsZWN0ZWRUZXh0OiBbXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIiwgXCJvb29cIl1cbiAgICAgICAgICBzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZDogW1xuICAgICAgICAgICAgW1swLCAyXSwgWzAsIDVdXVxuICAgICAgICAgICAgW1sxLCAxMF0sIFsxLCAxM11dXG4gICAgICAgICAgICBbWzMsIDJdLCBbMywgNV1dXG4gICAgICAgICAgICBbWzQsIDEwXSwgWzQsIDEzXV1cbiAgICAgICAgICBdXG5cbiAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgYnkgbW90aW9uIEcgd2l0aCBleHBsaWNpdCBWLW1vZGlmaWVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInMgbyBWIEdcIixcbiAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJsaW5ld2lzZVwiXVxuICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcbiAgICAgICAgICAgIFwiMCBvb28geHh4ICoqKlxcbjEgeHh4ICoqKiBvb29cXG5cIlxuICAgICAgICAgICAgXCIzIG9vbyB4eHggKioqXFxuNCB4eHggKioqIG9vb1xcblwiXG4gICAgICAgICAgXVxuXG4gICAgICBpdCBcInJldHVybiB0byBub3JtYWwtbW9kZSB3aGVuIGZhaWwgdG8gc2VsZWN0XCIsIC0+XG4gICAgICAgICMgYXR0ZW1wdCB0byBzZWxlY3QgaW5uZXItZnVuY3Rpb24gYnV0IHRoZXJlIGlzIG5vIGZ1bmN0aW9uLlxuICAgICAgICBlbnN1cmUgXCJzIGkgZlwiLFxuICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuXG4gICAgICAgICMgYXR0ZW1wdCB0byBmaW5kICd6JyBidXQgbm8gXCJ6XCIuXG4gICAgICAgIGVuc3VyZSBcInMgZiB6XCIsXG4gICAgICAgICAgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgIGRlc2NyaWJlIFwiY29tcGxleCBzY2VuYXJpb1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXVxuICAgICAgICAgICAgICBmb3IgKGNvbnN0ICFtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICAgIGxldCBtZW1iZXIyID0gbWVtYmVyICsgbWVtYmVyXG4gICAgICAgICAgICAgICAgbGV0IG1lbWJlcjMgPSBtZW1iZXIgKyBtZW1iZXIgKyBtZW1iZXJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChtZW1iZXIyLCBtZW1iZXIzKVxuICAgICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwic2VsZWN0IG9jY3VycmVuY2UgaW4gYS1mb2xkICxyZXZlcnNlKG8pIHRoZW4gZXNjYXBlIHRvIG5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwicyBvIHogbyBlc2NhcGVcIixcbiAgICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHxtZW1iZXIgb2YgbWVtYmVycykge1xuICAgICAgICAgICAgICBsZXQgbWVtYmVyMiA9IHxtZW1iZXIgKyB8bWVtYmVyXG4gICAgICAgICAgICAgIGxldCBtZW1iZXIzID0gfG1lbWJlciArIHxtZW1iZXIgKyB8bWVtYmVyXG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG1lbWJlcjIsIG1lbWJlcjMpXG4gICAgICAgICAgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiJdfQ==
