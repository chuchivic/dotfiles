(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, ensureWait, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], ensureWait = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, ensureWait = vim.ensureWait, vim;
      });
    });
    describe("Repeat", function() {
      describe("with operations", function() {
        beforeEach(function() {
          return set({
            text: "123456789abc",
            cursor: [0, 0]
          });
        });
        it("repeats N times", function() {
          return ensure('3 x', {
            text: '456789abc'
          });
        });
        return it("repeats NN times", function() {
          return ensure('1 0 x', {
            text: 'bc'
          });
        });
      });
      describe("with motions", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats N times", function() {
          return ensure('d 2 w', {
            text: 'three'
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            text: 'one two three',
            cursor: [0, 0]
          });
        });
        return it("repeats movements in visual mode", function() {
          return ensure('v 2 w', {
            cursor: [0, 9]
          });
        });
      });
    });
    describe("Register", function() {
      beforeEach(function() {
        return vimState.globalState.reset('register');
      });
      describe("the a register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
        return it("overwrites a value previously in the register", function() {
          set({
            register: {
              a: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              a: {
                text: 'new content'
              }
            }
          });
        });
      });
      describe("with yank command", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0],
            text: "aaa bbb ccc"
          });
        });
        it("save to pre specified register", function() {
          ensure('" a y i w', {
            register: {
              a: {
                text: 'aaa'
              }
            }
          });
          ensure('w " b y i w', {
            register: {
              b: {
                text: 'bbb'
              }
            }
          });
          return ensure('w " c y i w', {
            register: {
              c: {
                text: 'ccc'
              }
            }
          });
        });
        return it("work with motion which also require input such as 't'", function() {
          return ensure('" a y t c', {
            register: {
              a: {
                text: 'aaa bbb '
              }
            }
          });
        });
      });
      describe("With p command", function() {
        beforeEach(function() {
          vimState.globalState.reset('register');
          set({
            register: {
              a: {
                text: 'new content'
              }
            }
          });
          return set({
            text: "abc\ndef",
            cursor: [0, 0]
          });
        });
        describe("when specified register have no text", function() {
          it("can paste from a register", function() {
            ensure(null, {
              mode: "normal"
            });
            return ensure('" a p', {
              textC: "anew conten|tbc\ndef"
            });
          });
          return it("but do nothing for z register", function() {
            return ensure('" z p', {
              textC: "|abc\ndef"
            });
          });
        });
        return describe("blockwise-mode paste just use register have no text", function() {
          return it("paste from a register to each selction", function() {
            return ensure('ctrl-v j " a p', {
              textC: "|new contentbc\nnew contentef"
            });
          });
        });
      });
      describe("the B register", function() {
        it("saves a value for future reading", function() {
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          ensure(null, {
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              B: {
                text: 'new content'
              }
            }
          });
        });
        it("appends to a value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'contentnew content'
              }
            }
          });
        });
        it("appends linewise to a linewise value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content\n',
                type: 'linewise'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
        return it("appends linewise to a character value previously in the register", function() {
          set({
            register: {
              b: {
                text: 'content'
              }
            }
          });
          set({
            register: {
              B: {
                text: 'new content\n',
                type: 'linewise'
              }
            }
          });
          return ensure(null, {
            register: {
              b: {
                text: 'content\nnew content\n'
              }
            }
          });
        });
      });
      describe("the * register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure(null, {
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the + register", function() {
        describe("reading", function() {
          return it("is the same the system clipboard", function() {
            return ensure(null, {
              register: {
                '*': {
                  text: 'initial clipboard content',
                  type: 'characterwise'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          beforeEach(function() {
            return set({
              register: {
                '*': {
                  text: 'new content'
                }
              }
            });
          });
          return it("overwrites the contents of the system clipboard", function() {
            return expect(atom.clipboard.read()).toEqual('new content');
          });
        });
      });
      describe("the _ register", function() {
        describe("reading", function() {
          return it("is always the empty string", function() {
            return ensure(null, {
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '_': {
                  text: 'new content'
                }
              }
            });
            return ensure(null, {
              register: {
                '_': {
                  text: ''
                }
              }
            });
          });
        });
      });
      describe("the % register", function() {
        beforeEach(function() {
          return spyOn(editor, 'getURI').andReturn('/Users/atom/known_value.txt');
        });
        describe("reading", function() {
          return it("returns the filename of the current editor", function() {
            return ensure(null, {
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
        return describe("writing", function() {
          return it("throws away anything written to it", function() {
            set({
              register: {
                '%': {
                  text: 'new content'
                }
              }
            });
            return ensure(null, {
              register: {
                '%': {
                  text: '/Users/atom/known_value.txt'
                }
              }
            });
          });
        });
      });
      describe("the numbered 0-9 register", function() {
        describe("0", function() {
          return it("keep most recent yank-ed text", function() {
            ensure(null, {
              register: {
                '"': {
                  text: 'initial clipboard content'
                },
                '0': {
                  text: void 0
                }
              }
            });
            set({
              textC: "|000"
            });
            ensure("y w", {
              register: {
                '"': {
                  text: "000"
                },
                '0': {
                  text: "000"
                }
              }
            });
            return ensure("y l", {
              register: {
                '"': {
                  text: "0"
                },
                '0': {
                  text: "0"
                }
              }
            });
          });
        });
        return describe("1-9 and small-delete(-) register", function() {
          beforeEach(function() {
            return set({
              textC: "|0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            });
          });
          it("keep deleted text", function() {
            ensure("d d", {
              textC: "|1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '1\n'
                },
                '2': {
                  text: '0\n'
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '2\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '2\n'
                },
                '2': {
                  text: '1\n'
                },
                '3': {
                  text: '0\n'
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '3\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '3\n'
                },
                '2': {
                  text: '2\n'
                },
                '3': {
                  text: '1\n'
                },
                '4': {
                  text: '0\n'
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '4\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '4\n'
                },
                '2': {
                  text: '3\n'
                },
                '3': {
                  text: '2\n'
                },
                '4': {
                  text: '1\n'
                },
                '5': {
                  text: '0\n'
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '5\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '5\n'
                },
                '2': {
                  text: '4\n'
                },
                '3': {
                  text: '3\n'
                },
                '4': {
                  text: '2\n'
                },
                '5': {
                  text: '1\n'
                },
                '6': {
                  text: '0\n'
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '6\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '6\n'
                },
                '2': {
                  text: '5\n'
                },
                '3': {
                  text: '4\n'
                },
                '4': {
                  text: '3\n'
                },
                '5': {
                  text: '2\n'
                },
                '6': {
                  text: '1\n'
                },
                '7': {
                  text: '0\n'
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|8\n9\n10\n",
              register: {
                '"': {
                  text: '7\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '7\n'
                },
                '2': {
                  text: '6\n'
                },
                '3': {
                  text: '5\n'
                },
                '4': {
                  text: '4\n'
                },
                '5': {
                  text: '3\n'
                },
                '6': {
                  text: '2\n'
                },
                '7': {
                  text: '1\n'
                },
                '8': {
                  text: '0\n'
                },
                '9': {
                  text: void 0
                }
              }
            });
            ensure(".", {
              textC: "|9\n10\n",
              register: {
                '"': {
                  text: '8\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '8\n'
                },
                '2': {
                  text: '7\n'
                },
                '3': {
                  text: '6\n'
                },
                '4': {
                  text: '5\n'
                },
                '5': {
                  text: '4\n'
                },
                '6': {
                  text: '3\n'
                },
                '7': {
                  text: '2\n'
                },
                '8': {
                  text: '1\n'
                },
                '9': {
                  text: '0\n'
                }
              }
            });
            return ensure(".", {
              textC: "|10\n",
              register: {
                '"': {
                  text: '9\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '9\n'
                },
                '2': {
                  text: '8\n'
                },
                '3': {
                  text: '7\n'
                },
                '4': {
                  text: '6\n'
                },
                '5': {
                  text: '5\n'
                },
                '6': {
                  text: '4\n'
                },
                '7': {
                  text: '3\n'
                },
                '8': {
                  text: '2\n'
                },
                '9': {
                  text: '1\n'
                }
              }
            });
          });
          it("also keeps changed text", function() {
            return ensure("c j", {
              textC: "|\n2\n3\n4\n5\n6\n7\n8\n9\n10\n",
              register: {
                '"': {
                  text: '0\n1\n'
                },
                '-': {
                  text: void 0
                },
                '1': {
                  text: '0\n1\n'
                },
                '2': {
                  text: void 0
                },
                '3': {
                  text: void 0
                },
                '4': {
                  text: void 0
                },
                '5': {
                  text: void 0
                },
                '6': {
                  text: void 0
                },
                '7': {
                  text: void 0
                },
                '8': {
                  text: void 0
                },
                '9': {
                  text: void 0
                }
              }
            });
          });
          return describe("which goes to numbered and which goes to small-delete register", function() {
            beforeEach(function() {
              return set({
                textC: "|{abc}\n"
              });
            });
            it("small-change goes to - register", function() {
              return ensure("c $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("small-delete goes to - register", function() {
              return ensure("d $", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: '{abc}'
                  },
                  '1': {
                    text: void 0
                  },
                  '2': {
                    text: void 0
                  },
                  '3': {
                    text: void 0
                  },
                  '4': {
                    text: void 0
                  },
                  '5': {
                    text: void 0
                  },
                  '6': {
                    text: void 0
                  },
                  '7': {
                    text: void 0
                  },
                  '8': {
                    text: void 0
                  },
                  '9': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] % motion always save to numbered", function() {
              set({
                textC: "|{abc}\n"
              });
              return ensure("d %", {
                textC: "|\n",
                register: {
                  '"': {
                    text: '{abc}'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc}'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("[exception] / motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|{abc}\n"
              });
              return ensure("d / } enter", {
                textC: "|}\n",
                register: {
                  '"': {
                    text: '{abc'
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: '{abc'
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
            });
            it("/, n motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "|abc axx abc\n"
              });
              ensure("d / a enter", {
                textC: "|axx abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              return ensure("d n", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: 'abc '
                  }
                }
              });
            });
            return it("?, N motion always save to numbered", function() {
              jasmine.attachToDOM(atom.workspace.getElement());
              set({
                textC: "abc axx |abc\n"
              });
              ensure("d ? a enter", {
                textC: "abc |abc\n",
                register: {
                  '"': {
                    text: 'axx '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'axx '
                  },
                  '2': {
                    text: void 0
                  }
                }
              });
              ensure("0", {
                textC: "|abc abc\n"
              });
              return ensure("c N", {
                textC: "|abc\n",
                register: {
                  '"': {
                    text: 'abc '
                  },
                  '-': {
                    text: void 0
                  },
                  '1': {
                    text: 'abc '
                  },
                  '2': {
                    text: "axx "
                  }
                }
              });
            });
          });
        });
      });
      describe("the ctrl-r command in insert mode", function() {
        beforeEach(function() {
          atom.clipboard.write("clip");
          set({
            register: {
              '"': {
                text: '345'
              },
              'a': {
                text: 'abc'
              },
              '*': {
                text: 'abc'
              }
            }
          });
          set({
            textC: "01|2\n"
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          return it("inserts from \" paste clipboard content", function() {
            settings.set('useClipboardAsDefaultRegister', true);
            atom.clipboard.write("clip");
            return ensureWait('ctrl-r "', {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          return it("inserts from \" register ", function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            atom.clipboard.write("clip");
            return ensureWait('ctrl-r "', {
              text: '013452\n'
            });
          });
        });
        return describe("insert from named register", function() {
          it("insert from 'a'", function() {
            return ensureWait('ctrl-r a', {
              textC: '01abc|2\n',
              mode: 'insert'
            });
          });
          return it("cancel with escape", function() {
            return ensureWait('ctrl-r escape', {
              textC: '01|2\n',
              mode: 'insert'
            });
          });
        });
      });
      return describe("per selection clipboard", function() {
        var ensurePerSelectionRegister;
        ensurePerSelectionRegister = function() {
          var i, j, len, ref1, results, selection, texts;
          texts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          ref1 = editor.getSelections();
          results = [];
          for (i = j = 0, len = ref1.length; j < len; i = ++j) {
            selection = ref1[i];
            results.push(ensure(null, {
              register: {
                '*': {
                  text: texts[i],
                  selection: selection
                }
              }
            }));
          }
          return results;
        };
        beforeEach(function() {
          settings.set('useClipboardAsDefaultRegister', true);
          return set({
            text: "012:\nabc:\ndef:\n",
            cursor: [[0, 1], [1, 1], [2, 1]]
          });
        });
        describe("on selection destroye", function() {
          return it("remove corresponding subscriptin and clipboard entry", function() {
            var clipboardBySelection, j, len, ref1, ref2, selection, subscriptionBySelection;
            ref1 = vimState.register, clipboardBySelection = ref1.clipboardBySelection, subscriptionBySelection = ref1.subscriptionBySelection;
            expect(clipboardBySelection.size).toBe(0);
            expect(subscriptionBySelection.size).toBe(0);
            ensure("y i w");
            ensurePerSelectionRegister('012', 'abc', 'def');
            expect(clipboardBySelection.size).toBe(3);
            expect(subscriptionBySelection.size).toBe(3);
            ref2 = editor.getSelections();
            for (j = 0, len = ref2.length; j < len; j++) {
              selection = ref2[j];
              selection.destroy();
            }
            expect(clipboardBySelection.size).toBe(0);
            return expect(subscriptionBySelection.size).toBe(0);
          });
        });
        describe("Yank", function() {
          return it("save text to per selection register", function() {
            ensure("y i w");
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
        });
        describe("Delete family", function() {
          it("d", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            return ensurePerSelectionRegister('012', 'abc', 'def');
          });
          it("x", function() {
            ensure("x", {
              text: "02:\nac:\ndf:\n"
            });
            return ensurePerSelectionRegister('1', 'b', 'e');
          });
          it("X", function() {
            ensure("X", {
              text: "12:\nbc:\nef:\n"
            });
            return ensurePerSelectionRegister('0', 'a', 'd');
          });
          return it("D", function() {
            ensure("D", {
              text: "0\na\nd\n"
            });
            return ensurePerSelectionRegister('12:', 'bc:', 'ef:');
          });
        });
        describe("Put family", function() {
          it("p paste text from per selection register", function() {
            return ensure("y i w $ p", {
              text: "012:012\nabc:abc\ndef:def\n"
            });
          });
          return it("P paste text from per selection register", function() {
            return ensure("y i w $ P", {
              text: "012012:\nabcabc:\ndefdef:\n"
            });
          });
        });
        return describe("ctrl-r in insert mode", function() {
          return it("insert from per selection registe", function() {
            ensure("d i w", {
              text: ":\n:\n:\n"
            });
            ensure('a', {
              mode: 'insert'
            });
            return ensureWait('ctrl-r "', {
              text: ":012\n:abc\n:def\n"
            });
          });
        });
      });
    });
    describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
    describe("Count modifier", function() {
      beforeEach(function() {
        return set({
          text: "000 111 222 333 444 555 666 777 888 999",
          cursor: [0, 0]
        });
      });
      it("repeat operator", function() {
        return ensure('3 d w', {
          text: "333 444 555 666 777 888 999"
        });
      });
      it("repeat motion", function() {
        return ensure('d 2 w', {
          text: "222 333 444 555 666 777 888 999"
        });
      });
      return it("repeat operator and motion respectively", function() {
        return ensure('3 d 2 w', {
          text: "666 777 888 999"
        });
      });
    });
    return describe("blackholeRegisteredOperators settings", function() {
      var originalText;
      originalText = "initial clipboard content";
      beforeEach(function() {
        return set({
          textC: "a|bc"
        });
      });
      describe("when false(default)", function() {
        it("default", function() {
          return ensure(null, {
            register: {
              '"': {
                text: originalText
              }
            }
          });
        });
        it('c update', function() {
          return ensure('c l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('C update', function() {
          return ensure('C', {
            register: {
              '"': {
                text: 'bc'
              }
            }
          });
        });
        it('x update', function() {
          return ensure('x', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('X update', function() {
          return ensure('X', {
            register: {
              '"': {
                text: 'a'
              }
            }
          });
        });
        it('y update', function() {
          return ensure('y l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('Y update', function() {
          return ensure('Y', {
            register: {
              '"': {
                text: "abc\n"
              }
            }
          });
        });
        it('s update', function() {
          return ensure('s', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        it('S update', function() {
          return ensure('S', {
            register: {
              '"': {
                text: 'abc\n'
              }
            }
          });
        });
        it('d update', function() {
          return ensure('d l', {
            register: {
              '"': {
                text: 'b'
              }
            }
          });
        });
        return it('D update', function() {
          return ensure('D', {
            register: {
              '"': {
                text: 'bc'
              }
            }
          });
        });
      });
      return describe("when true(default)", function() {
        describe("blackhole all", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change", "change-to-last-character-of-line", "change-line", "change-occurrence", "change-occurrence-from-search", "delete", "delete-to-last-character-of-line", "delete-line", "delete-right", "delete-left", "substitute", "substitute-line", "yank", "yank-line"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X NOT update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('y NOT update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('Y NOT update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('s NOT update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('S NOT update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('d NOT update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          return it('D NOT update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
        });
        describe("blackhole selectively", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change-to-last-character-of-line", "delete-right", "substitute"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: 'a'
                }
              }
            });
          });
          it('y update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('Y update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: "abc\n"
                }
              }
            });
          });
          it('s NOT update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('S update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: 'abc\n'
                }
              }
            });
          });
          it('d update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          return it('D update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: 'bc'
                }
              }
            });
          });
        });
        return describe("blackhole by wildcard", function() {
          beforeEach(function() {
            return settings.set("blackholeRegisteredOperators", ["change*", "delete*"]);
          });
          it("default", function() {
            return ensure(null, {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('c update if specified', function() {
            return ensure('" a c l', {
              register: {
                'a': {
                  text: "b"
                }
              }
            });
          });
          it('c NOT update', function() {
            return ensure('c l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('C NOT update', function() {
            return ensure('C', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('x NOT update', function() {
            return ensure('x', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('X NOT update', function() {
            return ensure('X', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          it('y update', function() {
            return ensure('y l', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('Y update', function() {
            return ensure('Y', {
              register: {
                '"': {
                  text: "abc\n"
                }
              }
            });
          });
          it('s update', function() {
            return ensure('s', {
              register: {
                '"': {
                  text: 'b'
                }
              }
            });
          });
          it('S update', function() {
            return ensure('S', {
              register: {
                '"': {
                  text: 'abc\n'
                }
              }
            });
          });
          it('d NOT update', function() {
            return ensure('d l', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
          return it('D NOT update', function() {
            return ensure('D', {
              register: {
                '"': {
                  text: originalText
                }
              }
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3ByZWZpeC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUNoQixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE1BQTZELEVBQTdELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxtQkFBZCxFQUEwQixlQUExQixFQUFrQyxzQkFBbEMsRUFBaUQ7SUFFakQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYywyQkFBZCxFQUE0QjtNQUhsQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7TUFDakIsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUE7UUFDMUIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLGNBQU47WUFBc0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUI7V0FBSjtRQURTLENBQVg7UUFHQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtpQkFDcEIsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLElBQUEsRUFBTSxXQUFOO1dBQWQ7UUFEb0IsQ0FBdEI7ZUFHQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtpQkFDckIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7WUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFoQjtRQURxQixDQUF2QjtNQVAwQixDQUE1QjtNQVVBLFFBQUEsQ0FBUyxjQUFULEVB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RDtFQTVibUIsQ0FBckI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiUHJlZml4ZXNcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0LCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0fSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwiUmVwZWF0XCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aXRoIG9wZXJhdGlvbnNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMTIzNDU2Nzg5YWJjXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMyB4JywgdGV4dDogJzQ1Njc4OWFiYydcblxuICAgICAgaXQgXCJyZXBlYXRzIE5OIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMSAwIHgnLCB0ZXh0OiAnYmMnXG5cbiAgICBkZXNjcmliZSBcIndpdGggbW90aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgTiB0aW1lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgMiB3JywgdGV4dDogJ3RocmVlJ1xuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogJ29uZSB0d28gdGhyZWUnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcInJlcGVhdHMgbW92ZW1lbnRzIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAndiAyIHcnLCBjdXJzb3I6IFswLCA5XVxuXG4gIGRlc2NyaWJlIFwiUmVnaXN0ZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgncmVnaXN0ZXInKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgYSByZWdpc3RlclwiLCAtPlxuICAgICAgaXQgXCJzYXZlcyBhIHZhbHVlIGZvciBmdXR1cmUgcmVhZGluZ1wiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwib3ZlcndyaXRlcyBhIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgIGRlc2NyaWJlIFwid2l0aCB5YW5rIGNvbW1hbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYWEgYmJiIGNjY1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJzYXZlIHRvIHByZSBzcGVjaWZpZWQgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgZW5zdXJlICdcIiBhIHkgaSB3JywgICByZWdpc3RlcjogYTogdGV4dDogJ2FhYSdcbiAgICAgICAgZW5zdXJlICd3IFwiIGIgeSBpIHcnLCByZWdpc3RlcjogYjogdGV4dDogJ2JiYidcbiAgICAgICAgZW5zdXJlICd3IFwiIGMgeSBpIHcnLCByZWdpc3RlcjogYzogdGV4dDogJ2NjYydcblxuICAgICAgaXQgXCJ3b3JrIHdpdGggbW90aW9uIHdoaWNoIGFsc28gcmVxdWlyZSBpbnB1dCBzdWNoIGFzICd0J1wiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSB0IGMnLCByZWdpc3RlcjogYTogdGV4dDogJ2FhYSBiYmIgJ1xuXG4gICAgZGVzY3JpYmUgXCJXaXRoIHAgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICB2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5yZXNldCgncmVnaXN0ZXInKVxuICAgICAgICBzZXQgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgYWJjXG4gICAgICAgICAgZGVmXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHNwZWNpZmllZCByZWdpc3RlciBoYXZlIG5vIHRleHRcIiwgLT5cbiAgICAgICAgaXQgXCJjYW4gcGFzdGUgZnJvbSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICBlbnN1cmUgJ1wiIGEgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBhbmV3IGNvbnRlbnx0YmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJidXQgZG8gbm90aGluZyBmb3IgeiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnXCIgeiBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxhYmNcbiAgICAgICAgICAgIGRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlIFwiYmxvY2t3aXNlLW1vZGUgcGFzdGUganVzdCB1c2UgcmVnaXN0ZXIgaGF2ZSBubyB0ZXh0XCIsIC0+XG4gICAgICAgIGl0IFwicGFzdGUgZnJvbSBhIHJlZ2lzdGVyIHRvIGVhY2ggc2VsY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiBqIFwiIGEgcCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8bmV3IGNvbnRlbnRiY1xuICAgICAgICAgICAgbmV3IGNvbnRlbnRlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcInRoZSBCIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IGI6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwiYXBwZW5kcyB0byBhIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50bmV3IGNvbnRlbnQnXG5cbiAgICAgIGl0IFwiYXBwZW5kcyBsaW5ld2lzZSB0byBhIGxpbmV3aXNlIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG4nLCB0eXBlOiAnbGluZXdpc2UnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxubmV3IGNvbnRlbnRcXG4nXG5cbiAgICAgIGl0IFwiYXBwZW5kcyBsaW5ld2lzZSB0byBhIGNoYXJhY3RlciB2YWx1ZSBwcmV2aW91c2x5IGluIHRoZSByZWdpc3RlclwiLCAtPlxuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50J1xuICAgICAgICBzZXQgICAgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudFxcbicsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbm5ldyBjb250ZW50XFxuJ1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgKiByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgdGhlIHNhbWUgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgcmVnaXN0ZXI6ICcqJzogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgICAgIGl0IFwib3ZlcndyaXRlcyB0aGUgY29udGVudHMgb2YgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0VxdWFsICduZXcgY29udGVudCdcblxuICAgICMgRklYTUU6IG9uY2UgbGludXggc3VwcG9ydCBjb21lcyBvdXQsIHRoaXMgbmVlZHMgdG8gcmVhZCBmcm9tXG4gICAgIyB0aGUgY29ycmVjdCBjbGlwYm9hcmQuIEZvciBub3cgaXQgYmVoYXZlcyBqdXN0IGxpa2UgdGhlICogcmVnaXN0ZXJcbiAgICAjIFNlZSA6aGVscCB4MTEtY3V0LWJ1ZmZlciBhbmQgOmhlbHAgcmVnaXN0ZXJzIGZvciBtb3JlIGRldGFpbHMgb24gaG93IHRoZXNlXG4gICAgIyByZWdpc3RlcnMgd29yayBvbiBhbiBYMTEgYmFzZWQgc3lzdGVtLlxuICAgIGRlc2NyaWJlIFwidGhlICsgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcImlzIHRoZSBzYW1lIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOlxuICAgICAgICAgICAgJyonOiB0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCcsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgICAgaXQgXCJvdmVyd3JpdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwgJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ0aGUgXyByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgYWx3YXlzIHRoZSBlbXB0eSBzdHJpbmdcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICdfJzogdGV4dDogJydcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGl0IFwidGhyb3dzIGF3YXkgYW55dGhpbmcgd3JpdHRlbiB0byBpdFwiLCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogICAgJ18nOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnXyc6IHRleHQ6ICcnXG5cbiAgICBkZXNjcmliZSBcInRoZSAlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGVkaXRvciwgJ2dldFVSSScpLmFuZFJldHVybiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJyZXR1cm5zIHRoZSBmaWxlbmFtZSBvZiB0aGUgY3VycmVudCBlZGl0b3JcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICclJzogdGV4dDogJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgICAgZGVzY3JpYmUgXCJ3cml0aW5nXCIsIC0+XG4gICAgICAgIGl0IFwidGhyb3dzIGF3YXkgYW55dGhpbmcgd3JpdHRlbiB0byBpdFwiLCAtPlxuICAgICAgICAgIHNldCAgICByZWdpc3RlcjogJyUnOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBudW1iZXJlZCAwLTkgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiMFwiLCAtPlxuICAgICAgICBpdCBcImtlZXAgbW9zdCByZWNlbnQgeWFuay1lZCB0ZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIG51bGwsIHJlZ2lzdGVyOiAnXCInOiB7dGV4dDogJ2luaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnQnfSwgJzAnOiB7dGV4dDogdW5kZWZpbmVkfVxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8MDAwXCJcbiAgICAgICAgICBlbnN1cmUgXCJ5IHdcIiwgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIjAwMFwifSwgJzAnOiB7dGV4dDogXCIwMDBcIn1cbiAgICAgICAgICBlbnN1cmUgXCJ5IGxcIiwgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiBcIjBcIn0sICcwJzoge3RleHQ6IFwiMFwifVxuXG4gICAgICBkZXNjcmliZSBcIjEtOSBhbmQgc21hbGwtZGVsZXRlKC0pIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwifDBcXG4xXFxuMlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG5cbiAgICAgICAgaXQgXCJrZWVwIGRlbGV0ZWQgdGV4dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgZFwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInwxXFxuMlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcwXFxuJ30sICAgICAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMFxcbid9LCAgICAgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMVxcbid9LCAgICAgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzFcXG4nfSwgICAgICcyJzoge3RleHQ6ICcwXFxuJ30sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInwzXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMlxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMlxcbid9LCAnMic6IHt0ZXh0OiAnMVxcbid9LCAnMyc6IHt0ZXh0OiAnMFxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8NFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnM1xcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnM1xcbid9LCAnMic6IHt0ZXh0OiAnMlxcbid9LCAnMyc6IHt0ZXh0OiAnMVxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnMFxcbid9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8NVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc0XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc0XFxuJ30sICAgICAnMic6IHt0ZXh0OiAnM1xcbid9LCAgICAgJzMnOiB7dGV4dDogJzJcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzFcXG4nfSwgICAgICc1Jzoge3RleHQ6ICcwXFxuJ30sICAgICAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8NlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzVcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzVcXG4nfSwgICAgICcyJzoge3RleHQ6ICc0XFxuJ30sICAgICAnMyc6IHt0ZXh0OiAnM1xcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnMlxcbid9LCAgICAgJzUnOiB7dGV4dDogJzFcXG4nfSwgICAgICc2Jzoge3RleHQ6ICcwXFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw3XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc2XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc2XFxuJ30sICcyJzoge3RleHQ6ICc1XFxuJ30sICAgICAnMyc6IHt0ZXh0OiAnNFxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnM1xcbid9LCAnNSc6IHt0ZXh0OiAnMlxcbid9LCAgICAgJzYnOiB7dGV4dDogJzFcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzBcXG4nfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnN1xcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnN1xcbid9LCAnMic6IHt0ZXh0OiAnNlxcbid9LCAnMyc6IHt0ZXh0OiAnNVxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnNFxcbid9LCAnNSc6IHt0ZXh0OiAnM1xcbid9LCAnNic6IHt0ZXh0OiAnMlxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnMVxcbid9LCAnOCc6IHt0ZXh0OiAnMFxcbid9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8OVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzhcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzhcXG4nfSwgJzInOiB7dGV4dDogJzdcXG4nfSwgJzMnOiB7dGV4dDogJzZcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzVcXG4nfSwgJzUnOiB7dGV4dDogJzRcXG4nfSwgJzYnOiB7dGV4dDogJzNcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzJcXG4nfSwgJzgnOiB7dGV4dDogJzFcXG4nfSwgJzknOiB7dGV4dDogJzBcXG4nfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzlcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzlcXG4nfSwgJzInOiB7dGV4dDogJzhcXG4nfSwgJzMnOiB7dGV4dDogJzdcXG4nfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogJzZcXG4nfSwgJzUnOiB7dGV4dDogJzVcXG4nfSwgJzYnOiB7dGV4dDogJzRcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogJzNcXG4nfSwgJzgnOiB7dGV4dDogJzJcXG4nfSwgJzknOiB7dGV4dDogJzFcXG4nfVxuICAgICAgICBpdCBcImFsc28ga2VlcHMgY2hhbmdlZCB0ZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiYyBqXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifFxcbjJcXG4zXFxuNFxcbjVcXG42XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnMFxcbjFcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzBcXG4xXFxuJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH0sICczJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aGljaCBnb2VzIHRvIG51bWJlcmVkIGFuZCB3aGljaCBnb2VzIHRvIHNtYWxsLWRlbGV0ZSByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cXG5cIlxuXG4gICAgICAgICAgaXQgXCJzbWFsbC1jaGFuZ2UgZ29lcyB0byAtIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJjICRcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifFxcblwiXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAne2FiY30nfSwgJy0nOiB7dGV4dDogJ3thYmN9J30sXG4gICAgICAgICAgICAgICAgJzEnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgaXQgXCJzbWFsbC1kZWxldGUgZ29lcyB0byAtIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgXCJkICRcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifFxcblwiXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAne2FiY30nfSwgJy0nOiB7dGV4dDogJ3thYmN9J30sXG4gICAgICAgICAgICAgICAgJzEnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgaXQgXCJbZXhjZXB0aW9uXSAlIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVxcblwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkICVcIiwgdGV4dEM6IFwifFxcblwiLCByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAne2FiY30nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ3thYmN9J30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG4gICAgICAgICAgaXQgXCJbZXhjZXB0aW9uXSAvIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgLyB9IGVudGVyXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInx9XFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICd7YWJjJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICd7YWJjJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG5cbiAgICAgICAgICBpdCBcIi8sIG4gbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjIGF4eCBhYmNcXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCAvIGEgZW50ZXJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGF4eCBhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2FiYyAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2FiYyAnfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cbiAgICAgICAgICAgIGVuc3VyZSBcImQgblwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdheHggJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdheHggJ30sICcyJzoge3RleHQ6ICdhYmMgJ319XG4gICAgICAgICAgaXQgXCI/LCBOIG1vdGlvbiBhbHdheXMgc2F2ZSB0byBudW1iZXJlZFwiLCAtPlxuICAgICAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShhdG9tLndvcmtzcGFjZS5nZXRFbGVtZW50KCkpXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwiYWJjIGF4eCB8YWJjXFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgPyBhIGVudGVyXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcImFiYyB8YWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdheHggJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdheHggJ30sICcyJzoge3RleHQ6IHVuZGVmaW5lZH19XG4gICAgICAgICAgICBlbnN1cmUgXCIwXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxhYmMgYWJjXFxuXCIsXG4gICAgICAgICAgICBlbnN1cmUgXCJjIE5cIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGFiY1xcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAnYWJjICd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAnYWJjICd9LCAnMic6IHt0ZXh0OiBcImF4eCBcIn19XG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLXIgY29tbWFuZCBpbiBpbnNlcnQgbW9kZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuICAgICAgICBzZXRcbiAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICdcIic6IHRleHQ6ICczNDUnXG4gICAgICAgICAgICAnYSc6IHRleHQ6ICdhYmMnXG4gICAgICAgICAgICAnKic6IHRleHQ6ICdhYmMnXG4gICAgICAgIHNldCB0ZXh0QzogXCIwMXwyXFxuXCJcbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcblxuICAgICAgZGVzY3JpYmUgXCJ1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciA9IHRydWVcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGZyb20gXFxcIiBwYXN0ZSBjbGlwYm9hcmQgY29udGVudFwiLCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlXG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUgXCJjbGlwXCJcbiAgICAgICAgICBlbnN1cmVXYWl0ICdjdHJsLXIgXCInLCB0ZXh0OiAnMDFjbGlwMlxcbidcblxuICAgICAgZGVzY3JpYmUgXCJ1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciA9IGZhbHNlXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0cyBmcm9tIFxcXCIgcmVnaXN0ZXIgXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG4gICAgICAgICAgZW5zdXJlV2FpdCAnY3RybC1yIFwiJywgdGV4dDogJzAxMzQ1MlxcbidcblxuICAgICAgZGVzY3JpYmUgXCJpbnNlcnQgZnJvbSBuYW1lZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBpdCBcImluc2VydCBmcm9tICdhJ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ2N0cmwtciBhJywgdGV4dEM6ICcwMWFiY3wyXFxuJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgaXQgXCJjYW5jZWwgd2l0aCBlc2NhcGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmVXYWl0ICdjdHJsLXIgZXNjYXBlJywgdGV4dEM6ICcwMXwyXFxuJywgbW9kZTogJ2luc2VydCdcblxuICAgIGRlc2NyaWJlIFwicGVyIHNlbGVjdGlvbiBjbGlwYm9hcmRcIiwgLT5cbiAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyID0gKHRleHRzLi4uKSAtPlxuICAgICAgICBmb3Igc2VsZWN0aW9uLCBpIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBlbnN1cmUgbnVsbCwgcmVnaXN0ZXI6ICcqJzoge3RleHQ6IHRleHRzW2ldLCBzZWxlY3Rpb246IHNlbGVjdGlvbn1cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQgJ3VzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyJywgdHJ1ZVxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDAxMjpcbiAgICAgICAgICAgIGFiYzpcbiAgICAgICAgICAgIGRlZjpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzEsIDFdLCBbMiwgMV1dXG5cbiAgICAgIGRlc2NyaWJlIFwib24gc2VsZWN0aW9uIGRlc3Ryb3llXCIsIC0+XG4gICAgICAgIGl0IFwicmVtb3ZlIGNvcnJlc3BvbmRpbmcgc3Vic2NyaXB0aW4gYW5kIGNsaXBib2FyZCBlbnRyeVwiLCAtPlxuICAgICAgICAgIHtjbGlwYm9hcmRCeVNlbGVjdGlvbiwgc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb259ID0gdmltU3RhdGUucmVnaXN0ZXJcbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgd1wiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcblxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDMpXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMylcbiAgICAgICAgICBzZWxlY3Rpb24uZGVzdHJveSgpIGZvciBzZWxlY3Rpb24gaW4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmRCeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcblxuICAgICAgZGVzY3JpYmUgXCJZYW5rXCIsIC0+XG4gICAgICAgIGl0IFwic2F2ZSB0ZXh0IHRvIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgd1wiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcblxuICAgICAgZGVzY3JpYmUgXCJEZWxldGUgZmFtaWx5XCIsIC0+XG4gICAgICAgIGl0IFwiZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgaSB3XCIsIHRleHQ6IFwiOlxcbjpcXG46XFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMDEyJywgJ2FiYycsICdkZWYnKVxuICAgICAgICBpdCBcInhcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ4XCIsIHRleHQ6IFwiMDI6XFxuYWM6XFxuZGY6XFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMScsICdiJywgJ2UnKVxuICAgICAgICBpdCBcIlhcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJYXCIsIHRleHQ6IFwiMTI6XFxuYmM6XFxuZWY6XFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMCcsICdhJywgJ2QnKVxuICAgICAgICBpdCBcIkRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJEXCIsIHRleHQ6IFwiMFxcbmFcXG5kXFxuXCJcbiAgICAgICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlcignMTI6JywgJ2JjOicsICdlZjonKVxuXG4gICAgICBkZXNjcmliZSBcIlB1dCBmYW1pbHlcIiwgLT5cbiAgICAgICAgaXQgXCJwIHBhc3RlIHRleHQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBpIHcgJCBwXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICAgMDEyOjAxMlxuICAgICAgICAgICAgICBhYmM6YWJjXG4gICAgICAgICAgICAgIGRlZjpkZWZcXG5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiUCBwYXN0ZSB0ZXh0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3ICQgUFwiLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDAxMjAxMjpcbiAgICAgICAgICAgICAgYWJjYWJjOlxuICAgICAgICAgICAgICBkZWZkZWY6XFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJjdHJsLXIgaW4gaW5zZXJ0IG1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJpbnNlcnQgZnJvbSBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgd1wiLCB0ZXh0OiBcIjpcXG46XFxuOlxcblwiXG4gICAgICAgICAgZW5zdXJlICdhJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICBlbnN1cmVXYWl0ICdjdHJsLXIgXCInLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDowMTJcbiAgICAgICAgICAgICAgOmFiY1xuICAgICAgICAgICAgICA6ZGVmXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiQ291bnQgbW9kaWZpZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIwMDAgMTExIDIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIHcnLCB0ZXh0OiBcIjMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgbW90aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QgMiB3JywgdGV4dDogXCIyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvciBhbmQgbW90aW9uIHJlc3BlY3RpdmVseVwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgMiB3JywgdGV4dDogXCI2NjYgNzc3IDg4OCA5OTlcIlxuICBkZXNjcmliZSBcIkNvdW50IG1vZGlmaWVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiMDAwIDExMSAyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCB3JywgdGV4dDogXCIzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG1vdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6IFwiMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3IgYW5kIG1vdGlvbiByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIDIgdycsIHRleHQ6IFwiNjY2IDc3NyA4ODggOTk5XCJcblxuICBkZXNjcmliZSBcImJsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcnMgc2V0dGluZ3NcIiwgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBcImluaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnRcIlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJhfGJjXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmYWxzZShkZWZhdWx0KVwiLCAtPlxuICAgICAgaXQgXCJkZWZhdWx0XCIsICAtPiBlbnN1cmUgbnVsbCwgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgaXQgJ2MgdXBkYXRlJywgLT4gZW5zdXJlICdjIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdDIHVwZGF0ZScsIC0+IGVuc3VyZSAnQycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYmMnfVxuICAgICAgaXQgJ3ggdXBkYXRlJywgLT4gZW5zdXJlICd4JywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdYIHVwZGF0ZScsIC0+IGVuc3VyZSAnWCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYSd9XG4gICAgICBpdCAneSB1cGRhdGUnLCAtPiBlbnN1cmUgJ3kgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ1kgdXBkYXRlJywgLT4gZW5zdXJlICdZJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjXFxuXCJ9XG4gICAgICBpdCAncyB1cGRhdGUnLCAtPiBlbnN1cmUgJ3MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ1MgdXBkYXRlJywgLT4gZW5zdXJlICdTJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNcXG4nfVxuICAgICAgaXQgJ2QgdXBkYXRlJywgLT4gZW5zdXJlICdkIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdEIHVwZGF0ZScsIC0+IGVuc3VyZSAnRCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYmMnfVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRydWUoZGVmYXVsdClcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYmxhY2tob2xlIGFsbFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0IFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiLCBbXG4gICAgICAgICAgICBcImNoYW5nZVwiICMgY1xuICAgICAgICAgICAgXCJjaGFuZ2UtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZVwiICMgQ1xuICAgICAgICAgICAgXCJjaGFuZ2UtbGluZVwiICMgQyBpbiB2aXN1YWxcbiAgICAgICAgICAgIFwiY2hhbmdlLW9jY3VycmVuY2VcIlxuICAgICAgICAgICAgXCJjaGFuZ2Utb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiXG4gICAgICAgICAgICBcImRlbGV0ZVwiICMgZFxuICAgICAgICAgICAgXCJkZWxldGUtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZVwiICMgRFxuICAgICAgICAgICAgXCJkZWxldGUtbGluZVwiICMgRCBpbiB2aXN1YWxcbiAgICAgICAgICAgIFwiZGVsZXRlLXJpZ2h0XCIgIyB4XG4gICAgICAgICAgICBcImRlbGV0ZS1sZWZ0XCIgIyBYXG4gICAgICAgICAgICBcInN1YnN0aXR1dGVcIiAjIHNcbiAgICAgICAgICAgIFwic3Vic3RpdHV0ZS1saW5lXCIgIyBTXG4gICAgICAgICAgICBcInlhbmtcIiAjIHlcbiAgICAgICAgICAgIFwieWFuay1saW5lXCIgIyBZXG4gICAgICAgICAgICAjIFwiZGVsZXRlKlwiXG4gICAgICAgICAgICAjIFwiY2hhbmdlKlwiXG4gICAgICAgICAgICAjIFwieWFuaypcIlxuICAgICAgICAgICAgIyBcInN1YnN0aXR1dGUqXCJcbiAgICAgICAgICBdXG5cbiAgICAgICAgaXQgXCJkZWZhdWx0XCIsICAgICAgLT4gZW5zdXJlIG51bGwsICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnYyBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdDIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ0MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICd4JywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1ggTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnWCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd5IE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3kgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnWSBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdZJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAncycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdTIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ1MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnZCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdkIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ0QgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnRCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG5cbiAgICAgIGRlc2NyaWJlIFwiYmxhY2tob2xlIHNlbGVjdGl2ZWx5XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzXCIsIFtcbiAgICAgICAgICAgIFwiY2hhbmdlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmVcIiAjIENcbiAgICAgICAgICAgIFwiZGVsZXRlLXJpZ2h0XCIgIyB4XG4gICAgICAgICAgICBcInN1YnN0aXR1dGVcIiAjIHNcbiAgICAgICAgICBdXG5cbiAgICAgICAgaXQgXCJkZWZhdWx0XCIsICAgICAgLT4gZW5zdXJlIG51bGwsICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnYyBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdDIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ0MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICd4JywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1ggdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnWCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYSd9XG4gICAgICAgIGl0ICd5IHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ3kgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgICBpdCAnWSB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdZJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjXFxuXCJ9XG4gICAgICAgIGl0ICdzIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnUyB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdTJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNcXG4nfVxuICAgICAgICBpdCAnZCB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdkIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ0QgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnRCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYmMnfVxuXG4gICAgICBkZXNjcmliZSBcImJsYWNraG9sZSBieSB3aWxkY2FyZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0IFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiLCBbXG4gICAgICAgICAgICBcImNoYW5nZSpcIiAjIENcbiAgICAgICAgICAgIFwiZGVsZXRlKlwiICMgeFxuICAgICAgICAgICAgIyBcInN1YnN0aXR1dGUqXCIgIyBzXG4gICAgICAgICAgICAjIFwieWFuaypcIlxuICAgICAgICAgIF1cblxuICAgICAgICBpdCBcImRlZmF1bHRcIiwgICAgICAgICAgICAgICAtPiBlbnN1cmUgbnVsbCwgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnYyBsJywgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnYyB1cGRhdGUgaWYgc3BlY2lmaWVkJywgLT4gZW5zdXJlICdcIiBhIGMgbCcsIHJlZ2lzdGVyOiB7J2EnOiB0ZXh0OiBcImJcIn1cbiAgICAgICAgaXQgJ2MgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnYyBsJywgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnQyBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdDJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd4IE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ3gnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1ggTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnWCcsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneSB1cGRhdGUnLCAgICAgICAgICAgICAgLT4gZW5zdXJlICd5IGwnLCAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdZIHVwZGF0ZScsICAgICAgICAgICAgICAtPiBlbnN1cmUgJ1knLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjXFxuXCJ9XG4gICAgICAgIGl0ICdzIHVwZGF0ZScsICAgICAgICAgICAgICAtPiBlbnN1cmUgJ3MnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ1MgdXBkYXRlJywgICAgICAgICAgICAgIC0+IGVuc3VyZSAnUycsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2FiY1xcbid9XG4gICAgICAgIGl0ICdkIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ2QgbCcsICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ0QgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnRCcsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuIl19
