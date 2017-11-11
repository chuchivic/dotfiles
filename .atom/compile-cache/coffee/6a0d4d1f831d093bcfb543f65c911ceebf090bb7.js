(function() {
  var getVimState, settings,
    slice = [].slice;

  getVimState = require('./spec-helper').getVimState;

  settings = require('../lib/settings');

  describe("Prefixes", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
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
          return ensure({
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
          return ensure({
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
            ensure({
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
          ensure({
            register: {
              b: {
                text: 'new content'
              }
            }
          });
          return ensure({
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
          return ensure({
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
          return ensure({
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
          return ensure({
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
            return ensure({
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
            return ensure({
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
            return ensure({
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
            return ensure({
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
            return ensure({
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
            return ensure({
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
            ensure({
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
                text: 'abc'
              }
            }
          });
          set({
            register: {
              '*': {
                text: 'abc'
              }
            }
          });
          atom.clipboard.write("clip");
          set({
            text: "012\n",
            cursor: [0, 2]
          });
          return ensure('i', {
            mode: 'insert'
          });
        });
        describe("useClipboardAsDefaultRegister = true", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', true);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from clipboard with \"", function() {
            return ensure('ctrl-r "', {
              text: '01clip2\n'
            });
          });
        });
        describe("useClipboardAsDefaultRegister = false", function() {
          beforeEach(function() {
            settings.set('useClipboardAsDefaultRegister', false);
            set({
              register: {
                '"': {
                  text: '345'
                }
              }
            });
            return atom.clipboard.write("clip");
          });
          return it("inserts contents from \" with \"", function() {
            return ensure('ctrl-r "', {
              text: '013452\n'
            });
          });
        });
        it("inserts contents of the 'a' register", function() {
          return ensure('ctrl-r a', {
            text: '01abc2\n'
          });
        });
        return it("is cancelled with the escape key", function() {
          return ensure('ctrl-r escape', {
            text: '012\n',
            mode: 'insert',
            cursor: [0, 2]
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
            results.push(ensure({
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
            keystroke("y i w");
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
            keystroke("y i w");
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
            return ensure('ctrl-r "', {
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
          return ensure({
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
            return ensure({
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
            return ensure({
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
            return ensure({
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3ByZWZpeC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEscUJBQUE7SUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUNoQixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE1BQTRELEVBQTVELEVBQUMsWUFBRCxFQUFNLGVBQU4sRUFBYyxrQkFBZCxFQUF5QixlQUF6QixFQUFpQyxzQkFBakMsRUFBZ0Q7SUFFaEQsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBYyx5QkFBZCxFQUEyQjtNQUhqQixDQUFaO0lBRFMsQ0FBWDtJQU1BLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7TUFDakIsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUE7UUFDMUIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLGNBQU47WUFBc0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBOUI7V0FBSjtRQURTLENBQVg7UUFHQSxFQUFBLENBQUcsaUJBQUgsRUFBc0IsU0FBQTtpQkFDcEIsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLElBQUEsRUFBTSxXQUFOO1dBQWQ7UUFEb0IsQ0FBdEI7ZUFHQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtpQkFDckIsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7WUFBQSxJQUFBLEVBQU0sSUFBTjtXQUFoQjtRQURxQixDQUF2QjtNQVAwQixDQUE1QjtNQVVBLFFBQUEsQ0FBUyxjQUFULEVB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VUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sR0FBTjtlQUFOO2FBQVY7V0FBZDtRQUFILENBQWY7UUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sR0FBTjtlQUFOO2FBQVY7V0FBZDtRQUFILENBQWY7UUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sT0FBTjtlQUFOO2FBQVY7V0FBZDtRQUFILENBQWY7UUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sR0FBTjtlQUFOO2FBQVY7V0FBZDtRQUFILENBQWY7UUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sT0FBTjtlQUFOO2FBQVY7V0FBZDtRQUFILENBQWY7UUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sR0FBTjtlQUFOO2FBQVY7V0FBZDtRQUFILENBQWY7ZUFDQSxFQUFBLENBQUcsVUFBSCxFQUFlLFNBQUE7aUJBQUcsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLFFBQUEsRUFBVTtjQUFDLEdBQUEsRUFBSztnQkFBQSxJQUFBLEVBQU0sSUFBTjtlQUFOO2FBQVY7V0FBZDtR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QmdDLENBQWxDO01BeEQ2QixDQUEvQjtJQW5CZ0QsQ0FBbEQ7RUFsY21CLENBQXJCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIlByZWZpeGVzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgXCJSZXBlYXRcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGggb3BlcmF0aW9uc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgdGV4dDogXCIxMjM0NTY3ODlhYmNcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJyZXBlYXRzIE4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICczIHgnLCB0ZXh0OiAnNDU2Nzg5YWJjJ1xuXG4gICAgICBpdCBcInJlcGVhdHMgTk4gdGltZXNcIiwgLT5cbiAgICAgICAgZW5zdXJlICcxIDAgeCcsIHRleHQ6ICdiYydcblxuICAgIGRlc2NyaWJlIFwid2l0aCBtb3Rpb25zXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBOIHRpbWVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZCAyIHcnLCB0ZXh0OiAndGhyZWUnXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0OiAnb25lIHR3byB0aHJlZScsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGl0IFwicmVwZWF0cyBtb3ZlbWVudHMgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IDIgdycsIGN1cnNvcjogWzAsIDldXG5cbiAgZGVzY3JpYmUgXCJSZWdpc3RlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG5cbiAgICBkZXNjcmliZSBcInRoZSBhIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBpdCBcInNhdmVzIGEgdmFsdWUgZm9yIGZ1dHVyZSByZWFkaW5nXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGE6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJvdmVyd3JpdGVzIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuXG4gICAgZGVzY3JpYmUgXCJ3aXRoIHlhbmsgY29tbWFuZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFhYSBiYmIgY2NjXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInNhdmUgdG8gcHJlIHNwZWNpZmllZCByZWdpc3RlclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ1wiIGEgeSBpIHcnLCAgIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYWFhJ1xuICAgICAgICBlbnN1cmUgJ3cgXCIgYiB5IGkgdycsIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnYmJiJ1xuICAgICAgICBlbnN1cmUgJ3cgXCIgYyB5IGkgdycsIHJlZ2lzdGVyOiBjOiB0ZXh0OiAnY2NjJ1xuXG4gICAgICBpdCBcIndvcmsgd2l0aCBtb3Rpb24gd2hpY2ggYWxzbyByZXF1aXJlIGlucHV0IHN1Y2ggYXMgJ3QnXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnXCIgYSB5IHQgYycsIHJlZ2lzdGVyOiBhOiB0ZXh0OiAnYWFhIGJiYiAnXG5cbiAgICBkZXNjcmliZSBcIldpdGggcCBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KCdyZWdpc3RlcicpXG4gICAgICAgIHNldCByZWdpc3RlcjogYTogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICBhYmNcbiAgICAgICAgICBkZWZcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gc3BlY2lmaWVkIHJlZ2lzdGVyIGhhdmUgbm8gdGV4dFwiLCAtPlxuICAgICAgICBpdCBcImNhbiBwYXN0ZSBmcm9tIGEgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgIGVuc3VyZSAnXCIgYSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGFuZXcgY29udGVufHRiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImJ1dCBkbyBub3RoaW5nIGZvciB6IHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdcIiB6IHAnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGFiY1xuICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgXCJibG9ja3dpc2UtbW9kZSBwYXN0ZSBqdXN0IHVzZSByZWdpc3RlciBoYXZlIG5vIHRleHRcIiwgLT5cbiAgICAgICAgaXQgXCJwYXN0ZSBmcm9tIGEgcmVnaXN0ZXIgdG8gZWFjaCBzZWxjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC12IGogXCIgYSBwJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHxuZXcgY29udGVudGJjXG4gICAgICAgICAgICBuZXcgY29udGVudGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwidGhlIEIgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGl0IFwic2F2ZXMgYSB2YWx1ZSBmb3IgZnV0dXJlIHJlYWRpbmdcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ25ldyBjb250ZW50J1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IEI6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgaXQgXCJhcHBlbmRzIHRvIGEgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudCdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRuZXcgY29udGVudCdcblxuICAgICAgaXQgXCJhcHBlbmRzIGxpbmV3aXNlIHRvIGEgbGluZXdpc2UgdmFsdWUgcHJldmlvdXNseSBpbiB0aGUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBiOiB0ZXh0OiAnY29udGVudFxcbicsIHR5cGU6ICdsaW5ld2lzZSdcbiAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiBCOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG4gICAgICAgIGVuc3VyZSByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnRcXG5uZXcgY29udGVudFxcbidcblxuICAgICAgaXQgXCJhcHBlbmRzIGxpbmV3aXNlIHRvIGEgY2hhcmFjdGVyIHZhbHVlIHByZXZpb3VzbHkgaW4gdGhlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIHNldCAgICByZWdpc3RlcjogYjogdGV4dDogJ2NvbnRlbnQnXG4gICAgICAgIHNldCAgICByZWdpc3RlcjogQjogdGV4dDogJ25ldyBjb250ZW50XFxuJywgdHlwZTogJ2xpbmV3aXNlJ1xuICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6IGI6IHRleHQ6ICdjb250ZW50XFxubmV3IGNvbnRlbnRcXG4nXG5cbiAgICBkZXNjcmliZSBcInRoZSAqIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyB0aGUgc2FtZSB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyonOiB0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCcsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnbmV3IGNvbnRlbnQnXG5cbiAgICAgICAgaXQgXCJvdmVyd3JpdGVzIHRoZSBjb250ZW50cyBvZiB0aGUgc3lzdGVtIGNsaXBib2FyZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvRXF1YWwgJ25ldyBjb250ZW50J1xuXG4gICAgIyBGSVhNRTogb25jZSBsaW51eCBzdXBwb3J0IGNvbWVzIG91dCwgdGhpcyBuZWVkcyB0byByZWFkIGZyb21cbiAgICAjIHRoZSBjb3JyZWN0IGNsaXBib2FyZC4gRm9yIG5vdyBpdCBiZWhhdmVzIGp1c3QgbGlrZSB0aGUgKiByZWdpc3RlclxuICAgICMgU2VlIDpoZWxwIHgxMS1jdXQtYnVmZmVyIGFuZCA6aGVscCByZWdpc3RlcnMgZm9yIG1vcmUgZGV0YWlscyBvbiBob3cgdGhlc2VcbiAgICAjIHJlZ2lzdGVycyB3b3JrIG9uIGFuIFgxMSBiYXNlZCBzeXN0ZW0uXG4gICAgZGVzY3JpYmUgXCJ0aGUgKyByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJyZWFkaW5nXCIsIC0+XG4gICAgICAgIGl0IFwiaXMgdGhlIHNhbWUgdGhlIHN5c3RlbSBjbGlwYm9hcmRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6XG4gICAgICAgICAgICAnKic6IHRleHQ6ICdpbml0aWFsIGNsaXBib2FyZCBjb250ZW50JywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG5cbiAgICAgIGRlc2NyaWJlIFwid3JpdGluZ1wiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnKic6IHRleHQ6ICduZXcgY29udGVudCdcblxuICAgICAgICBpdCBcIm92ZXJ3cml0ZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBzeXN0ZW0gY2xpcGJvYXJkXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGF0b20uY2xpcGJvYXJkLnJlYWQoKSkudG9FcXVhbCAnbmV3IGNvbnRlbnQnXG5cbiAgICBkZXNjcmliZSBcInRoZSBfIHJlZ2lzdGVyXCIsIC0+XG4gICAgICBkZXNjcmliZSBcInJlYWRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJpcyBhbHdheXMgdGhlIGVtcHR5IHN0cmluZ1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJ18nOiB0ZXh0OiAnJ1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYXdheSBhbnl0aGluZyB3cml0dGVuIHRvIGl0XCIsIC0+XG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAgICAnXyc6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICdfJzogdGV4dDogJydcblxuICAgIGRlc2NyaWJlIFwidGhlICUgcmVnaXN0ZXJcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0VVJJJykuYW5kUmV0dXJuICcvVXNlcnMvYXRvbS9rbm93bl92YWx1ZS50eHQnXG5cbiAgICAgIGRlc2NyaWJlIFwicmVhZGluZ1wiLCAtPlxuICAgICAgICBpdCBcInJldHVybnMgdGhlIGZpbGVuYW1lIG9mIHRoZSBjdXJyZW50IGVkaXRvclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSByZWdpc3RlcjogJyUnOiB0ZXh0OiAnL1VzZXJzL2F0b20va25vd25fdmFsdWUudHh0J1xuXG4gICAgICBkZXNjcmliZSBcIndyaXRpbmdcIiwgLT5cbiAgICAgICAgaXQgXCJ0aHJvd3MgYXdheSBhbnl0aGluZyB3cml0dGVuIHRvIGl0XCIsIC0+XG4gICAgICAgICAgc2V0ICAgIHJlZ2lzdGVyOiAnJSc6IHRleHQ6ICduZXcgY29udGVudCdcbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICclJzogdGV4dDogJy9Vc2Vycy9hdG9tL2tub3duX3ZhbHVlLnR4dCdcblxuICAgIGRlc2NyaWJlIFwidGhlIG51bWJlcmVkIDAtOSByZWdpc3RlclwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCIwXCIsIC0+XG4gICAgICAgIGl0IFwia2VlcCBtb3N0IHJlY2VudCB5YW5rLWVkIHRleHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgcmVnaXN0ZXI6ICdcIic6IHt0ZXh0OiAnaW5pdGlhbCBjbGlwYm9hcmQgY29udGVudCd9LCAnMCc6IHt0ZXh0OiB1bmRlZmluZWR9XG4gICAgICAgICAgc2V0IHRleHRDOiBcInwwMDBcIlxuICAgICAgICAgIGVuc3VyZSBcInkgd1wiLCByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiMDAwXCJ9LCAnMCc6IHt0ZXh0OiBcIjAwMFwifVxuICAgICAgICAgIGVuc3VyZSBcInkgbFwiLCByZWdpc3RlcjogJ1wiJzoge3RleHQ6IFwiMFwifSwgJzAnOiB7dGV4dDogXCIwXCJ9XG5cbiAgICAgIGRlc2NyaWJlIFwiMS05IGFuZCBzbWFsbC1kZWxldGUoLSkgcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCJ8MFxcbjFcXG4yXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcblxuICAgICAgICBpdCBcImtlZXAgZGVsZXRlZCB0ZXh0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBkXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDFcXG4yXFxuM1xcbjRcXG41XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzBcXG4nfSwgICAgICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICcwXFxuJ30sICAgICAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnNic6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8MlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcxXFxuJ30sICAgICAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMVxcbid9LCAgICAgJzInOiB7dGV4dDogJzBcXG4nfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcyXFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICcyXFxuJ30sICcyJzoge3RleHQ6ICcxXFxuJ30sICczJzoge3RleHQ6ICcwXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw0XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICczXFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICczXFxuJ30sICcyJzoge3RleHQ6ICcyXFxuJ30sICczJzoge3RleHQ6ICcxXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICcwXFxuJ30sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw1XFxuNlxcbjdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzRcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzRcXG4nfSwgICAgICcyJzoge3RleHQ6ICczXFxuJ30sICAgICAnMyc6IHt0ZXh0OiAnMlxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnMVxcbid9LCAgICAgJzUnOiB7dGV4dDogJzBcXG4nfSwgICAgICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc4Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw2XFxuN1xcbjhcXG45XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnNVxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnNVxcbid9LCAgICAgJzInOiB7dGV4dDogJzRcXG4nfSwgICAgICczJzoge3RleHQ6ICczXFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICcyXFxuJ30sICAgICAnNSc6IHt0ZXh0OiAnMVxcbid9LCAgICAgJzYnOiB7dGV4dDogJzBcXG4nfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgICB0ZXh0QzogIFwifDdcXG44XFxuOVxcbjEwXFxuXCJcbiAgICAgICAgICAgIHJlZ2lzdGVyOlxuICAgICAgICAgICAgICAnXCInOiB7dGV4dDogJzZcXG4nfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzEnOiB7dGV4dDogJzZcXG4nfSwgJzInOiB7dGV4dDogJzVcXG4nfSwgICAgICczJzoge3RleHQ6ICc0XFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICczXFxuJ30sICc1Jzoge3RleHQ6ICcyXFxuJ30sICAgICAnNic6IHt0ZXh0OiAnMVxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnMFxcbid9LCAnOCc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnOSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8OFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICc3XFxuJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICcxJzoge3RleHQ6ICc3XFxuJ30sICcyJzoge3RleHQ6ICc2XFxuJ30sICczJzoge3RleHQ6ICc1XFxuJ30sXG4gICAgICAgICAgICAgICc0Jzoge3RleHQ6ICc0XFxuJ30sICc1Jzoge3RleHQ6ICczXFxuJ30sICc2Jzoge3RleHQ6ICcyXFxuJ30sXG4gICAgICAgICAgICAgICc3Jzoge3RleHQ6ICcxXFxuJ30sICc4Jzoge3RleHQ6ICcwXFxuJ30sICc5Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgICAgdGV4dEM6ICBcInw5XFxuMTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnOFxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnOFxcbid9LCAnMic6IHt0ZXh0OiAnN1xcbid9LCAnMyc6IHt0ZXh0OiAnNlxcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnNVxcbid9LCAnNSc6IHt0ZXh0OiAnNFxcbid9LCAnNic6IHt0ZXh0OiAnM1xcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnMlxcbid9LCAnOCc6IHt0ZXh0OiAnMVxcbid9LCAnOSc6IHt0ZXh0OiAnMFxcbid9LFxuICAgICAgICAgIGVuc3VyZSBcIi5cIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8MTBcXG5cIlxuICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICdcIic6IHt0ZXh0OiAnOVxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnOVxcbid9LCAnMic6IHt0ZXh0OiAnOFxcbid9LCAnMyc6IHt0ZXh0OiAnN1xcbid9LFxuICAgICAgICAgICAgICAnNCc6IHt0ZXh0OiAnNlxcbid9LCAnNSc6IHt0ZXh0OiAnNVxcbid9LCAnNic6IHt0ZXh0OiAnNFxcbid9LFxuICAgICAgICAgICAgICAnNyc6IHt0ZXh0OiAnM1xcbid9LCAnOCc6IHt0ZXh0OiAnMlxcbid9LCAnOSc6IHt0ZXh0OiAnMVxcbid9XG4gICAgICAgIGl0IFwiYWxzbyBrZWVwcyBjaGFuZ2VkIHRleHRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJjIGpcIixcbiAgICAgICAgICAgIHRleHRDOiAgXCJ8XFxuMlxcbjNcXG40XFxuNVxcbjZcXG43XFxuOFxcbjlcXG4xMFxcblwiXG4gICAgICAgICAgICByZWdpc3RlcjpcbiAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICcwXFxuMVxcbid9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiAnMFxcbjFcXG4nfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfSwgJzMnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzQnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzUnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzYnOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcblxuICAgICAgICBkZXNjcmliZSBcIndoaWNoIGdvZXMgdG8gbnVtYmVyZWQgYW5kIHdoaWNoIGdvZXMgdG8gc21hbGwtZGVsZXRlIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInx7YWJjfVxcblwiXG5cbiAgICAgICAgICBpdCBcInNtYWxsLWNoYW5nZSBnb2VzIHRvIC0gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImMgJFwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8XFxuXCJcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICd7YWJjfSd9LCAnLSc6IHt0ZXh0OiAne2FiY30nfSxcbiAgICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBpdCBcInNtYWxsLWRlbGV0ZSBnb2VzIHRvIC0gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZSBcImQgJFwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8XFxuXCJcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6XG4gICAgICAgICAgICAgICAgJ1wiJzoge3RleHQ6ICd7YWJjfSd9LCAnLSc6IHt0ZXh0OiAne2FiY30nfSxcbiAgICAgICAgICAgICAgICAnMSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMyc6IHt0ZXh0OiB1bmRlZmluZWR9LFxuICAgICAgICAgICAgICAgICc0Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc1Jzoge3RleHQ6IHVuZGVmaW5lZH0sICc2Jzoge3RleHQ6IHVuZGVmaW5lZH0sXG4gICAgICAgICAgICAgICAgJzcnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzgnOiB7dGV4dDogdW5kZWZpbmVkfSwgJzknOiB7dGV4dDogdW5kZWZpbmVkfSxcbiAgICAgICAgICBpdCBcIltleGNlcHRpb25dICUgbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XFxuXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImQgJVwiLCB0ZXh0QzogXCJ8XFxuXCIsIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICd7YWJjfSd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAne2FiY30nfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cbiAgICAgICAgICBpdCBcIltleGNlcHRpb25dIC8gbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCAvIH0gZW50ZXJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifH1cXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ3thYmMnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ3thYmMnfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cblxuICAgICAgICAgIGl0IFwiLywgbiBtb3Rpb24gYWx3YXlzIHNhdmUgdG8gbnVtYmVyZWRcIiwgLT5cbiAgICAgICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmMgYXh4IGFiY1xcblwiXG4gICAgICAgICAgICBlbnN1cmUgXCJkIC8gYSBlbnRlclwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YXh4IGFiY1xcblwiLFxuICAgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHt0ZXh0OiAnYWJjICd9LCAnLSc6IHt0ZXh0OiB1bmRlZmluZWR9LCAnMSc6IHt0ZXh0OiAnYWJjICd9LCAnMic6IHt0ZXh0OiB1bmRlZmluZWR9fVxuICAgICAgICAgICAgZW5zdXJlIFwiZCBuXCIsXG4gICAgICAgICAgICAgIHRleHRDOiBcInxhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2F4eCAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2F4eCAnfSwgJzInOiB7dGV4dDogJ2FiYyAnfX1cbiAgICAgICAgICBpdCBcIj8sIE4gbW90aW9uIGFsd2F5cyBzYXZlIHRvIG51bWJlcmVkXCIsIC0+XG4gICAgICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJhYmMgYXh4IHxhYmNcXG5cIlxuICAgICAgICAgICAgZW5zdXJlIFwiZCA/IGEgZW50ZXJcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwiYWJjIHxhYmNcXG5cIixcbiAgICAgICAgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB7dGV4dDogJ2F4eCAnfSwgJy0nOiB7dGV4dDogdW5kZWZpbmVkfSwgJzEnOiB7dGV4dDogJ2F4eCAnfSwgJzInOiB7dGV4dDogdW5kZWZpbmVkfX1cbiAgICAgICAgICAgIGVuc3VyZSBcIjBcIixcbiAgICAgICAgICAgICAgdGV4dEM6IFwifGFiYyBhYmNcXG5cIixcbiAgICAgICAgICAgIGVuc3VyZSBcImMgTlwiLFxuICAgICAgICAgICAgICB0ZXh0QzogXCJ8YWJjXFxuXCIsXG4gICAgICAgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzoge3RleHQ6ICdhYmMgJ30sICctJzoge3RleHQ6IHVuZGVmaW5lZH0sICcxJzoge3RleHQ6ICdhYmMgJ30sICcyJzoge3RleHQ6IFwiYXh4IFwifX1cblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtciBjb21tYW5kIGluIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJzM0NSdcbiAgICAgICAgc2V0IHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICdhYmMnXG4gICAgICAgIHNldCByZWdpc3RlcjogJyonOiB0ZXh0OiAnYWJjJ1xuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZSBcImNsaXBcIlxuICAgICAgICBzZXQgdGV4dDogXCIwMTJcXG5cIiwgY3Vyc29yOiBbMCwgMl1cbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcblxuICAgICAgZGVzY3JpYmUgXCJ1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlciA9IHRydWVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCAndXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXInLCB0cnVlXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGNvbnRlbnRzIGZyb20gY2xpcGJvYXJkIHdpdGggXFxcIlwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC1yIFwiJywgdGV4dDogJzAxY2xpcDJcXG4nXG5cbiAgICAgIGRlc2NyaWJlIFwidXNlQ2xpcGJvYXJkQXNEZWZhdWx0UmVnaXN0ZXIgPSBmYWxzZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIGZhbHNlXG4gICAgICAgICAgc2V0IHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMzQ1J1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlIFwiY2xpcFwiXG5cbiAgICAgICAgaXQgXCJpbnNlcnRzIGNvbnRlbnRzIGZyb20gXFxcIiB3aXRoIFxcXCJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtciBcIicsIHRleHQ6ICcwMTM0NTJcXG4nXG5cbiAgICAgIGl0IFwiaW5zZXJ0cyBjb250ZW50cyBvZiB0aGUgJ2EnIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1yIGEnLCB0ZXh0OiAnMDFhYmMyXFxuJ1xuXG4gICAgICBpdCBcImlzIGNhbmNlbGxlZCB3aXRoIHRoZSBlc2NhcGUga2V5XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1yIGVzY2FwZScsXG4gICAgICAgICAgdGV4dDogJzAxMlxcbidcbiAgICAgICAgICBtb2RlOiAnaW5zZXJ0J1xuICAgICAgICAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBkZXNjcmliZSBcInBlciBzZWxlY3Rpb24gY2xpcGJvYXJkXCIsIC0+XG4gICAgICBlbnN1cmVQZXJTZWxlY3Rpb25SZWdpc3RlciA9ICh0ZXh0cy4uLikgLT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiwgaSBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgZW5zdXJlIHJlZ2lzdGVyOiAnKic6IHt0ZXh0OiB0ZXh0c1tpXSwgc2VsZWN0aW9uOiBzZWxlY3Rpb259XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0ICd1c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcicsIHRydWVcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAwMTI6XG4gICAgICAgICAgICBhYmM6XG4gICAgICAgICAgICBkZWY6XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFtbMCwgMV0sIFsxLCAxXSwgWzIsIDFdXVxuXG4gICAgICBkZXNjcmliZSBcIm9uIHNlbGVjdGlvbiBkZXN0cm95ZVwiLCAtPlxuICAgICAgICBpdCBcInJlbW92ZSBjb3JyZXNwb25kaW5nIHN1YnNjcmlwdGluIGFuZCBjbGlwYm9hcmQgZW50cnlcIiwgLT5cbiAgICAgICAgICB7Y2xpcGJvYXJkQnlTZWxlY3Rpb24sIHN1YnNjcmlwdGlvbkJ5U2VsZWN0aW9ufSA9IHZpbVN0YXRlLnJlZ2lzdGVyXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZEJ5U2VsZWN0aW9uLnNpemUpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3Qoc3Vic2NyaXB0aW9uQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuXG4gICAgICAgICAga2V5c3Ryb2tlIFwieSBpIHdcIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG5cbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgzKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDMpXG4gICAgICAgICAgc2VsZWN0aW9uLmRlc3Ryb3koKSBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkQnlTZWxlY3Rpb24uc2l6ZSkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChzdWJzY3JpcHRpb25CeVNlbGVjdGlvbi5zaXplKS50b0JlKDApXG5cbiAgICAgIGRlc2NyaWJlIFwiWWFua1wiLCAtPlxuICAgICAgICBpdCBcInNhdmUgdGV4dCB0byBwZXIgc2VsZWN0aW9uIHJlZ2lzdGVyXCIsIC0+XG4gICAgICAgICAga2V5c3Ryb2tlIFwieSBpIHdcIlxuICAgICAgICAgIGVuc3VyZVBlclNlbGVjdGlvblJlZ2lzdGVyKCcwMTInLCAnYWJjJywgJ2RlZicpXG5cbiAgICAgIGRlc2NyaWJlIFwiRGVsZXRlIGZhbWlseVwiLCAtPlxuICAgICAgICBpdCBcImRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJkIGkgd1wiLCB0ZXh0OiBcIjpcXG46XFxuOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAxMicsICdhYmMnLCAnZGVmJylcbiAgICAgICAgaXQgXCJ4XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieFwiLCB0ZXh0OiBcIjAyOlxcbmFjOlxcbmRmOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzEnLCAnYicsICdlJylcbiAgICAgICAgaXQgXCJYXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiWFwiLCB0ZXh0OiBcIjEyOlxcbmJjOlxcbmVmOlxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzAnLCAnYScsICdkJylcbiAgICAgICAgaXQgXCJEXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiRFwiLCB0ZXh0OiBcIjBcXG5hXFxuZFxcblwiXG4gICAgICAgICAgZW5zdXJlUGVyU2VsZWN0aW9uUmVnaXN0ZXIoJzEyOicsICdiYzonLCAnZWY6JylcblxuICAgICAgZGVzY3JpYmUgXCJQdXQgZmFtaWx5XCIsIC0+XG4gICAgICAgIGl0IFwicCBwYXN0ZSB0ZXh0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlclwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgaSB3ICQgcFwiLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDAxMjowMTJcbiAgICAgICAgICAgICAgYWJjOmFiY1xuICAgICAgICAgICAgICBkZWY6ZGVmXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIlAgcGFzdGUgdGV4dCBmcm9tIHBlciBzZWxlY3Rpb24gcmVnaXN0ZXJcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IGkgdyAkIFBcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgICAwMTIwMTI6XG4gICAgICAgICAgICAgIGFiY2FiYzpcbiAgICAgICAgICAgICAgZGVmZGVmOlxcblxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiY3RybC1yIGluIGluc2VydCBtb2RlXCIsIC0+XG4gICAgICAgIGl0IFwiaW5zZXJ0IGZyb20gcGVyIHNlbGVjdGlvbiByZWdpc3RlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBpIHdcIiwgdGV4dDogXCI6XFxuOlxcbjpcXG5cIlxuICAgICAgICAgIGVuc3VyZSAnYScsIG1vZGU6ICdpbnNlcnQnXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXIgXCInLFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDowMTJcbiAgICAgICAgICAgICAgOmFiY1xuICAgICAgICAgICAgICA6ZGVmXFxuXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiQ291bnQgbW9kaWZpZXJcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIwMDAgMTExIDIyMiAzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIHcnLCB0ZXh0OiBcIjMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgbW90aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ2QgMiB3JywgdGV4dDogXCIyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICBpdCBcInJlcGVhdCBvcGVyYXRvciBhbmQgbW90aW9uIHJlc3BlY3RpdmVseVwiLCAtPlxuICAgICAgZW5zdXJlICczIGQgMiB3JywgdGV4dDogXCI2NjYgNzc3IDg4OCA5OTlcIlxuICBkZXNjcmliZSBcIkNvdW50IG1vZGlmaWVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiMDAwIDExMSAyMjIgMzMzIDQ0NCA1NTUgNjY2IDc3NyA4ODggOTk5XCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0IG9wZXJhdG9yXCIsIC0+XG4gICAgICBlbnN1cmUgJzMgZCB3JywgdGV4dDogXCIzMzMgNDQ0IDU1NSA2NjYgNzc3IDg4OCA5OTlcIlxuICAgIGl0IFwicmVwZWF0IG1vdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdkIDIgdycsIHRleHQ6IFwiMjIyIDMzMyA0NDQgNTU1IDY2NiA3NzcgODg4IDk5OVwiXG4gICAgaXQgXCJyZXBlYXQgb3BlcmF0b3IgYW5kIG1vdGlvbiByZXNwZWN0aXZlbHlcIiwgLT5cbiAgICAgIGVuc3VyZSAnMyBkIDIgdycsIHRleHQ6IFwiNjY2IDc3NyA4ODggOTk5XCJcblxuICBkZXNjcmliZSBcImJsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcnMgc2V0dGluZ3NcIiwgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBcImluaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnRcIlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJhfGJjXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiBmYWxzZShkZWZhdWx0KVwiLCAtPlxuICAgICAgaXQgXCJkZWZhdWx0XCIsICAtPiBlbnN1cmUgICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgaXQgJ2MgdXBkYXRlJywgLT4gZW5zdXJlICdjIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdDIHVwZGF0ZScsIC0+IGVuc3VyZSAnQycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYmMnfVxuICAgICAgaXQgJ3ggdXBkYXRlJywgLT4gZW5zdXJlICd4JywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdYIHVwZGF0ZScsIC0+IGVuc3VyZSAnWCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYSd9XG4gICAgICBpdCAneSB1cGRhdGUnLCAtPiBlbnN1cmUgJ3kgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ1kgdXBkYXRlJywgLT4gZW5zdXJlICdZJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjXFxuXCJ9XG4gICAgICBpdCAncyB1cGRhdGUnLCAtPiBlbnN1cmUgJ3MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgaXQgJ1MgdXBkYXRlJywgLT4gZW5zdXJlICdTJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNcXG4nfVxuICAgICAgaXQgJ2QgdXBkYXRlJywgLT4gZW5zdXJlICdkIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgIGl0ICdEIHVwZGF0ZScsIC0+IGVuc3VyZSAnRCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYmMnfVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRydWUoZGVmYXVsdClcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwiYmxhY2tob2xlIGFsbFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0IFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiLCBbXG4gICAgICAgICAgICBcImNoYW5nZVwiICMgY1xuICAgICAgICAgICAgXCJjaGFuZ2UtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZVwiICMgQ1xuICAgICAgICAgICAgXCJjaGFuZ2UtbGluZVwiICMgQyBpbiB2aXN1YWxcbiAgICAgICAgICAgIFwiY2hhbmdlLW9jY3VycmVuY2VcIlxuICAgICAgICAgICAgXCJjaGFuZ2Utb2NjdXJyZW5jZS1mcm9tLXNlYXJjaFwiXG4gICAgICAgICAgICBcImRlbGV0ZVwiICMgZFxuICAgICAgICAgICAgXCJkZWxldGUtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZVwiICMgRFxuICAgICAgICAgICAgXCJkZWxldGUtbGluZVwiICMgRCBpbiB2aXN1YWxcbiAgICAgICAgICAgIFwiZGVsZXRlLXJpZ2h0XCIgIyB4XG4gICAgICAgICAgICBcImRlbGV0ZS1sZWZ0XCIgIyBYXG4gICAgICAgICAgICBcInN1YnN0aXR1dGVcIiAjIHNcbiAgICAgICAgICAgIFwic3Vic3RpdHV0ZS1saW5lXCIgIyBTXG4gICAgICAgICAgICBcInlhbmtcIiAjIHlcbiAgICAgICAgICAgIFwieWFuay1saW5lXCIgIyBZXG4gICAgICAgICAgICAjIFwiZGVsZXRlKlwiXG4gICAgICAgICAgICAjIFwiY2hhbmdlKlwiXG4gICAgICAgICAgICAjIFwieWFuaypcIlxuICAgICAgICAgICAgIyBcInN1YnN0aXR1dGUqXCJcbiAgICAgICAgICBdXG5cbiAgICAgICAgaXQgXCJkZWZhdWx0XCIsICAgICAgLT4gZW5zdXJlICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnYyBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdDIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ0MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICd4JywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1ggTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnWCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd5IE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3kgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnWSBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdZJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ3MgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAncycsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICdTIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ1MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnZCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICdkIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ0QgTk9UIHVwZGF0ZScsIC0+IGVuc3VyZSAnRCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG5cbiAgICAgIGRlc2NyaWJlIFwiYmxhY2tob2xlIHNlbGVjdGl2ZWx5XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQgXCJibGFja2hvbGVSZWdpc3RlcmVkT3BlcmF0b3JzXCIsIFtcbiAgICAgICAgICAgIFwiY2hhbmdlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmVcIiAjIENcbiAgICAgICAgICAgIFwiZGVsZXRlLXJpZ2h0XCIgIyB4XG4gICAgICAgICAgICBcInN1YnN0aXR1dGVcIiAjIHNcbiAgICAgICAgICBdXG5cbiAgICAgICAgaXQgXCJkZWZhdWx0XCIsICAgICAgLT4gZW5zdXJlICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnYyBsJywgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdDIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ0MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneCBOT1QgdXBkYXRlJywgLT4gZW5zdXJlICd4JywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1ggdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnWCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYSd9XG4gICAgICAgIGl0ICd5IHVwZGF0ZScsICAgICAtPiBlbnN1cmUgJ3kgbCcsIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2InfVxuICAgICAgICBpdCAnWSB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdZJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjXFxuXCJ9XG4gICAgICAgIGl0ICdzIE5PVCB1cGRhdGUnLCAtPiBlbnN1cmUgJ3MnLCAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnUyB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdTJywgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdhYmNcXG4nfVxuICAgICAgICBpdCAnZCB1cGRhdGUnLCAgICAgLT4gZW5zdXJlICdkIGwnLCByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ0QgdXBkYXRlJywgICAgIC0+IGVuc3VyZSAnRCcsICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYmMnfVxuXG4gICAgICBkZXNjcmliZSBcImJsYWNraG9sZSBieSB3aWxkY2FyZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0IFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiLCBbXG4gICAgICAgICAgICBcImNoYW5nZSpcIiAjIENcbiAgICAgICAgICAgIFwiZGVsZXRlKlwiICMgeFxuICAgICAgICAgICAgIyBcInN1YnN0aXR1dGUqXCIgIyBzXG4gICAgICAgICAgICAjIFwieWFuaypcIlxuICAgICAgICAgIF1cblxuICAgICAgICBpdCBcImRlZmF1bHRcIiwgICAgICAgICAgICAgICAtPiBlbnN1cmUgICAgICAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ2MgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnYyBsJywgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnYyB1cGRhdGUgaWYgc3BlY2lmaWVkJywgLT4gZW5zdXJlICdcIiBhIGMgbCcsIHJlZ2lzdGVyOiB7J2EnOiB0ZXh0OiBcImJcIn1cbiAgICAgICAgaXQgJ2MgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnYyBsJywgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAnQyBOT1QgdXBkYXRlJywgICAgICAgICAgLT4gZW5zdXJlICdDJywgICAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiBvcmlnaW5hbFRleHR9XG4gICAgICAgIGl0ICd4IE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ3gnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ1ggTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnWCcsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuICAgICAgICBpdCAneSB1cGRhdGUnLCAgICAgICAgICAgICAgLT4gZW5zdXJlICd5IGwnLCAgICAgcmVnaXN0ZXI6IHsnXCInOiB0ZXh0OiAnYid9XG4gICAgICAgIGl0ICdZIHVwZGF0ZScsICAgICAgICAgICAgICAtPiBlbnN1cmUgJ1knLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IFwiYWJjXFxuXCJ9XG4gICAgICAgIGl0ICdzIHVwZGF0ZScsICAgICAgICAgICAgICAtPiBlbnN1cmUgJ3MnLCAgICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6ICdiJ31cbiAgICAgICAgaXQgJ1MgdXBkYXRlJywgICAgICAgICAgICAgIC0+IGVuc3VyZSAnUycsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogJ2FiY1xcbid9XG4gICAgICAgIGl0ICdkIE5PVCB1cGRhdGUnLCAgICAgICAgICAtPiBlbnN1cmUgJ2QgbCcsICAgICByZWdpc3RlcjogeydcIic6IHRleHQ6IG9yaWdpbmFsVGV4dH1cbiAgICAgICAgaXQgJ0QgTk9UIHVwZGF0ZScsICAgICAgICAgIC0+IGVuc3VyZSAnRCcsICAgICAgIHJlZ2lzdGVyOiB7J1wiJzogdGV4dDogb3JpZ2luYWxUZXh0fVxuIl19
