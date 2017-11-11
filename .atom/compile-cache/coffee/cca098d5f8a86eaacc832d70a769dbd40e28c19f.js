(function() {
  var dispatch, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator TransformString", function() {
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
    describe('the ~ keybinding', function() {
      beforeEach(function() {
        return set({
          textC: "|aBc\n|XyZ"
        });
      });
      it('toggles the case and moves right', function() {
        ensure('~', {
          textC: "A|Bc\nx|yZ"
        });
        ensure('~', {
          textC: "Ab|c\nxY|Z"
        });
        return ensure('~', {
          textC: "Ab|C\nxY|z"
        });
      });
      it('takes a count', function() {
        return ensure('4 ~', {
          textC: "Ab|C\nxY|z"
        });
      });
      describe("in visual mode", function() {
        return it("toggles the case of the selected text", function() {
          set({
            cursor: [0, 0]
          });
          return ensure('V ~', {
            text: 'AbC\nXyZ'
          });
        });
      });
      return describe("with g and motion", function() {
        it("toggles the case of text, won't move cursor", function() {
          set({
            textC: "|aBc\nXyZ"
          });
          return ensure('g ~ 2 l', {
            textC: '|Abc\nXyZ'
          });
        });
        it("g~~ toggles the line of text, won't move cursor", function() {
          set({
            textC: "a|Bc\nXyZ"
          });
          return ensure('g ~ ~', {
            textC: 'A|bC\nXyZ'
          });
        });
        return it("g~g~ toggles the line of text, won't move cursor", function() {
          set({
            textC: "a|Bc\nXyZ"
          });
          return ensure('g ~ g ~', {
            textC: 'A|bC\nXyZ'
          });
        });
      });
    });
    describe('the U keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes text uppercase with g and motion, and won't move cursor", function() {
        ensure('g U l', {
          text: 'ABc\nXyZ',
          cursor: [0, 0]
        });
        ensure('g U e', {
          text: 'ABC\nXyZ',
          cursor: [0, 0]
        });
        set({
          cursor: [1, 0]
        });
        return ensure('g U $', {
          text: 'ABC\nXYZ',
          cursor: [1, 0]
        });
      });
      it("makes the selected text uppercase in visual mode", function() {
        return ensure('V U', {
          text: 'ABC\nXyZ'
        });
      });
      it("gUU upcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g U U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gUgU upcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g U g U', {
          text: 'ABC\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe('the u keybinding', function() {
      beforeEach(function() {
        return set({
          text: 'aBc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes text lowercase with g and motion, and won't move cursor", function() {
        return ensure('g u $', {
          text: 'abc\nXyZ',
          cursor: [0, 0]
        });
      });
      it("makes the selected text lowercase in visual mode", function() {
        return ensure('V u', {
          text: 'abc\nXyZ'
        });
      });
      it("guu downcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g u u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
      return it("gugu downcase the line of text, won't move cursor", function() {
        set({
          cursor: [0, 1]
        });
        return ensure('g u g u', {
          text: 'abc\nXyZ',
          cursor: [0, 1]
        });
      });
    });
    describe("the > keybinding", function() {
      beforeEach(function() {
        return set({
          text: "12345\nabcde\nABCDE"
        });
      });
      describe("> >", function() {
        describe("from first line", function() {
          it("indents the current line", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('> >', {
              textC: "  |12345\nabcde\nABCDE"
            });
          });
          return it("count means N line indents and undoable, repeatable", function() {
            set({
              cursor: [0, 0]
            });
            ensure('3 > >', {
              textC_: "__|12345\n__abcde\n__ABCDE"
            });
            ensure('u', {
              textC: "|12345\nabcde\nABCDE"
            });
            return ensure('. .', {
              textC_: "____|12345\n____abcde\n____ABCDE"
            });
          });
        });
        return describe("from last line", function() {
          return it("indents the current line", function() {
            set({
              cursor: [2, 0]
            });
            return ensure('> >', {
              textC: "12345\nabcde\n  |ABCDE"
            });
          });
        });
      });
      describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            cursor: [0, 0]
          });
        });
        it("[vC] indent selected lines", function() {
          return ensure("v j >", {
            mode: 'normal',
            textC_: "__|12345\n__abcde\nABCDE"
          });
        });
        it("[vL] indent selected lines", function() {
          ensure("V >", {
            mode: 'normal',
            textC_: "__|12345\nabcde\nABCDE"
          });
          return ensure('.', {
            textC_: "____|12345\nabcde\nABCDE"
          });
        });
        return it("[vL] count means N times indent", function() {
          ensure("V 3 >", {
            mode: 'normal',
            textC_: "______|12345\nabcde\nABCDE"
          });
          return ensure('.', {
            textC_: "____________|12345\nabcde\nABCDE"
          });
        });
      });
      return describe("in visual mode and stayOnTransformString enabled", function() {
        beforeEach(function() {
          settings.set('stayOnTransformString', true);
          return set({
            cursor: [0, 0]
          });
        });
        it("indents the current selection and exits visual mode", function() {
          return ensure('v j >', {
            mode: 'normal',
            textC: "  12345\n  |abcde\nABCDE"
          });
        });
        it("when repeated, operate on same range when cursor was not moved", function() {
          ensure('v j >', {
            mode: 'normal',
            textC: "  12345\n  |abcde\nABCDE"
          });
          return ensure('.', {
            mode: 'normal',
            textC: "    12345\n    |abcde\nABCDE"
          });
        });
        return it("when repeated, operate on relative range from cursor position with same extent when cursor was moved", function() {
          ensure('v j >', {
            mode: 'normal',
            textC: "  12345\n  |abcde\nABCDE"
          });
          return ensure('l .', {
            mode: 'normal',
            textC_: "__12345\n____a|bcde\n__ABCDE"
          });
        });
      });
    });
    describe("the < keybinding", function() {
      beforeEach(function() {
        return set({
          textC_: "|__12345\n__abcde\nABCDE"
        });
      });
      describe("when followed by a <", function() {
        return it("indents the current line", function() {
          return ensure('< <', {
            textC_: "|12345\n__abcde\nABCDE"
          });
        });
      });
      describe("when followed by a repeating <", function() {
        return it("indents multiple lines at once and undoable", function() {
          ensure('2 < <', {
            textC_: "|12345\nabcde\nABCDE"
          });
          return ensure('u', {
            textC_: "|__12345\n__abcde\nABCDE"
          });
        });
      });
      return describe("in visual mode", function() {
        beforeEach(function() {
          return set({
            textC_: "|______12345\n______abcde\nABCDE"
          });
        });
        return it("count means N times outdent", function() {
          ensure('V j 2 <', {
            textC_: "__|12345\n__abcde\nABCDE"
          });
          return ensure('u', {
            textC_: "______12345\n|______abcde\nABCDE"
          });
        });
      });
    });
    describe("the = keybinding", function() {
      var oldGrammar;
      oldGrammar = [];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        oldGrammar = editor.getGrammar();
        return set({
          text: "foo\n  bar\n  baz",
          cursor: [1, 0]
        });
      });
      return describe("when used in a scope that supports auto-indent", function() {
        beforeEach(function() {
          var jsGrammar;
          jsGrammar = atom.grammars.grammarForScopeName('source.js');
          return editor.setGrammar(jsGrammar);
        });
        afterEach(function() {
          return editor.setGrammar(oldGrammar);
        });
        describe("when followed by a =", function() {
          beforeEach(function() {
            return ensure('= =');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return ensure('2 = =');
          });
          it("autoindents multiple lines at once", function() {
            return ensure(null, {
              text: "foo\nbar\nbaz",
              cursor: [1, 0]
            });
          });
          return describe("undo behavior", function() {
            return it("indents both lines", function() {
              return ensure('u', {
                text: "foo\n  bar\n  baz"
              });
            });
          });
        });
      });
    });
    describe('CamelCase', function() {
      beforeEach(function() {
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g C $', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g C', {
          text: 'vimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g C g C', {
          text: 'vimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('PascalCase', function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g C': 'vim-mode-plus:pascal-case'
          }
        });
        return set({
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g C $', {
          text: 'VimMode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'VimMode\nAtomTextEditor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g C', {
          text: 'VimMode\natomTextEditor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g C g C', {
          text: 'VimMode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('SnakeCase', function() {
      beforeEach(function() {
        set({
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return atom.keymaps.add("g_", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g _': 'vim-mode-plus:snake-case'
          }
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g _ $', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g _', {
          text: 'vim_mode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g _ g _', {
          text: 'vim_mode\natom-text-editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('DashCase', function() {
      beforeEach(function() {
        return set({
          text: 'vimMode\natom_text_editor\n',
          cursor: [0, 0]
        });
      });
      it("transform text by motion and repeatable", function() {
        ensure('g - $', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 0]
        });
        return ensure('j .', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [1, 0]
        });
      });
      it("transform selection", function() {
        return ensure('V j g -', {
          text: 'vim-mode\natom-text-editor\n',
          cursor: [0, 0]
        });
      });
      return it("repeating twice works on current-line and won't move cursor", function() {
        return ensure('l g - g -', {
          text: 'vim-mode\natom_text_editor\n',
          cursor: [0, 1]
        });
      });
    });
    describe('ConvertToSoftTab', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g tab': 'vim-mode-plus:convert-to-soft-tab'
          }
        });
      });
      return describe("basic behavior", function() {
        return it("convert tabs to spaces", function() {
          expect(editor.getTabLength()).toBe(2);
          set({
            text: "\tvar10 =\t\t0;",
            cursor: [0, 0]
          });
          return ensure('g tab $', {
            text: "  var10 =   0;"
          });
        });
      });
    });
    describe('ConvertToHardTab', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g shift-tab': 'vim-mode-plus:convert-to-hard-tab'
          }
        });
      });
      return describe("basic behavior", function() {
        return it("convert spaces to tabs", function() {
          expect(editor.getTabLength()).toBe(2);
          set({
            text: "  var10 =    0;",
            cursor: [0, 0]
          });
          return ensure('g shift-tab $', {
            text: "\tvar10\t=\t\t 0;"
          });
        });
      });
    });
    describe('CompactSpaces', function() {
      beforeEach(function() {
        return set({
          cursor: [0, 0]
        });
      });
      return describe("basic behavior", function() {
        it("compats multiple space into one", function() {
          set({
            text: 'var0   =   0; var10   =   10',
            cursor: [0, 0]
          });
          return ensure('g space $', {
            text: 'var0 = 0; var10 = 10'
          });
        });
        it("don't apply compaction for leading and trailing space", function() {
          set({
            text_: "___var0   =   0; var10   =   10___\n___var1   =   1; var11   =   11___\n___var2   =   2; var12   =   12___\n\n___var4   =   4; var14   =   14___",
            cursor: [0, 0]
          });
          return ensure('g space i p', {
            text_: "___var0 = 0; var10 = 10___\n___var1 = 1; var11 = 11___\n___var2 = 2; var12 = 12___\n\n___var4   =   4; var14   =   14___"
          });
        });
        return it("but it compact spaces when target all text is spaces", function() {
          set({
            text: '01234    90',
            cursor: [0, 5]
          });
          return ensure('g space w', {
            text: '01234 90'
          });
        });
      });
    });
    describe('AlignOccurrence family', function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g |': 'vim-mode-plus:align-occurrence'
          }
        });
      });
      return describe("AlignOccurrence", function() {
        it("align by =", function() {
          set({
            textC: "\na |= 100\nbcd = 1\nijklm = 1000\n"
          });
          return ensure("g | p", {
            textC: "\na |    = 100\nbcd   = 1\nijklm = 1000\n"
          });
        });
        it("align by comma", function() {
          set({
            textC: "\na|, 100, 30\nb, 30000, 50\n200000, 1\n"
          });
          return ensure("g | p", {
            textC: "\na|,      100,   30\nb,      30000, 50\n200000, 1\n"
          });
        });
        it("align by non-word-char-ending", function() {
          set({
            textC: "\nabc|: 10\ndefgh: 20\nij: 30\n"
          });
          return ensure("g | p", {
            textC: "\nabc|:   10\ndefgh: 20\nij:    30\n"
          });
        });
        it("align by normal word", function() {
          set({
            textC: "\nxxx fir|stName: \"Hello\", lastName: \"World\"\nyyyyyyyy firstName: \"Good Bye\", lastName: \"World\"\n"
          });
          return ensure("g | p", {
            textC: "\nxxx    |  firstName: \"Hello\", lastName: \"World\"\nyyyyyyyy firstName: \"Good Bye\", lastName: \"World\"\n"
          });
        });
        return it("align by `|` table-like text", function() {
          set({
            text: "\n+--------+------------------+---------+\n| where | move to 1st char | no move |\n+--------+------------------+---------+\n| top | `z enter` | `z t` |\n| middle | `z .` | `z z` |\n| bottom | `z -` | `z b` |\n+--------+------------------+---------+\n",
            cursor: [2, 0]
          });
          return ensure("g | p", {
            text: "\n+--------+------------------+---------+\n| where  | move to 1st char | no move |\n+--------+------------------+---------+\n| top    | `z enter`        | `z t`   |\n| middle | `z .`            | `z z`   |\n| bottom | `z -`            | `z b`   |\n+--------+------------------+---------+\n",
            cursor: [2, 0]
          });
        });
      });
    });
    describe('TrimString', function() {
      beforeEach(function() {
        return set({
          text: " text = @getNewText( selection.getText(), selection )  ",
          cursor: [0, 42]
        });
      });
      return describe("basic behavior", function() {
        it("trim string for a-line text object", function() {
          set({
            text_: "___abc___\n___def___",
            cursor: [0, 0]
          });
          ensure('g | a l', {
            text_: "abc\n___def___"
          });
          return ensure('j .', {
            text_: "abc\ndef"
          });
        });
        it("trim string for inner-parenthesis text object", function() {
          set({
            text_: "(  abc  )\n(  def  )",
            cursor: [0, 0]
          });
          ensure('g | i (', {
            text_: "(abc)\n(  def  )"
          });
          return ensure('j .', {
            text_: "(abc)\n(def)"
          });
        });
        return it("trim string for inner-any-pair text object", function() {
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.operator-pending-mode, atom-text-editor.vim-mode-plus.visual-mode': {
              'i ;': 'vim-mode-plus:inner-any-pair'
            }
          });
          set({
            text_: "( [ {  abc  } ] )",
            cursor: [0, 8]
          });
          ensure('g | i ;', {
            text_: "( [ {abc} ] )"
          });
          ensure('2 h .', {
            text_: "( [{abc}] )"
          });
          return ensure('2 h .', {
            text_: "([{abc}])"
          });
        });
      });
    });
    describe('surround family', function() {
      beforeEach(function() {
        var keymapsForSurround;
        keymapsForSurround = {
          'atom-text-editor.vim-mode-plus.normal-mode': {
            'y s': 'vim-mode-plus:surround',
            'd s': 'vim-mode-plus:delete-surround-any-pair',
            'd S': 'vim-mode-plus:delete-surround',
            'c s': 'vim-mode-plus:change-surround-any-pair',
            'c S': 'vim-mode-plus:change-surround'
          },
          'atom-text-editor.vim-mode-plus.operator-pending-mode.surround-pending': {
            's': 'vim-mode-plus:inner-current-line'
          },
          'atom-text-editor.vim-mode-plus.visual-mode': {
            'S': 'vim-mode-plus:surround'
          }
        };
        atom.keymaps.add("keymaps-for-surround", keymapsForSurround);
        return set({
          textC: "|apple\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
        });
      });
      describe('cancellation', function() {
        beforeEach(function() {
          return set({
            textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n"
          });
        });
        describe('surround cancellation', function() {
          it("[normal] keep multpcursor on surround cancel", function() {
            return ensure("y s escape", {
              textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n",
              mode: "normal"
            });
          });
          return it("[visual] keep multpcursor on surround cancel", function() {
            ensure("v", {
              mode: ["visual", "characterwise"],
              textC: "(ab|c) def\n(gh!i) jkl\n(mn|o) pqr\n",
              selectedTextOrdered: ["b", "h", "n"]
            });
            return ensureWait("S escape", {
              mode: ["visual", "characterwise"],
              textC: "(ab|c) def\n(gh!i) jkl\n(mn|o) pqr\n",
              selectedTextOrdered: ["b", "h", "n"]
            });
          });
        });
        describe('delete-surround cancellation', function() {
          return it("[from normal] keep multpcursor on cancel", function() {
            return ensure("d S escape", {
              mode: "normal",
              textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n"
            });
          });
        });
        describe('change-surround cancellation', function() {
          it("[from normal] keep multpcursor on cancel of 1st input", function() {
            return ensure("c S escape", {
              mode: "normal",
              textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n"
            });
          });
          return it("[from normal] keep multpcursor on cancel of 2nd input", function() {
            ensure("c S (", {
              selectedTextOrdered: ["(abc)", "(ghi)", "(mno)"]
            });
            return ensureWait("escape", {
              mode: "normal",
              textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n"
            });
          });
        });
        return describe('surround-word cancellation', function() {
          beforeEach(function() {
            return atom.keymaps.add("surround-test", {
              'atom-text-editor.vim-mode-plus.normal-mode': {
                'y s w': 'vim-mode-plus:surround-word'
              }
            });
          });
          return it("[from normal] keep multi cursor on cancel", function() {
            ensure("y s w", {
              selectedTextOrdered: ["abc", "ghi", "mno"]
            });
            return ensureWait("escape", {
              mode: "normal",
              textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n"
            });
          });
        });
      });
      describe('alias keymap for surround, change-surround, delete-surround', function() {
        describe("surround by aliased char", function() {
          it("c1", function() {
            set({
              textC: "|abc"
            });
            return ensureWait('y s i w b', {
              text: "(abc)"
            });
          });
          it("c2", function() {
            set({
              textC: "|abc"
            });
            return ensureWait('y s i w B', {
              text: "{abc}"
            });
          });
          it("c3", function() {
            set({
              textC: "|abc"
            });
            return ensureWait('y s i w r', {
              text: "[abc]"
            });
          });
          return it("c4", function() {
            set({
              textC: "|abc"
            });
            return ensureWait('y s i w a', {
              text: "<abc>"
            });
          });
        });
        describe("delete surround by aliased char", function() {
          it("c1", function() {
            set({
              textC: "|(abc)"
            });
            return ensure('d S b', {
              text: "abc"
            });
          });
          it("c2", function() {
            set({
              textC: "|{abc}"
            });
            return ensure('d S B', {
              text: "abc"
            });
          });
          it("c3", function() {
            set({
              textC: "|[abc]"
            });
            return ensure('d S r', {
              text: "abc"
            });
          });
          return it("c4", function() {
            set({
              textC: "|<abc>"
            });
            return ensure('d S a', {
              text: "abc"
            });
          });
        });
        return describe("change surround by aliased char", function() {
          it("c1", function() {
            set({
              textC: "|(abc)"
            });
            return ensureWait('c S b B', {
              text: "{abc}"
            });
          });
          it("c2", function() {
            set({
              textC: "|(abc)"
            });
            return ensureWait('c S b r', {
              text: "[abc]"
            });
          });
          it("c3", function() {
            set({
              textC: "|(abc)"
            });
            return ensureWait('c S b a', {
              text: "<abc>"
            });
          });
          it("c4", function() {
            set({
              textC: "|{abc}"
            });
            return ensureWait('c S B b', {
              text: "(abc)"
            });
          });
          it("c5", function() {
            set({
              textC: "|{abc}"
            });
            return ensureWait('c S B r', {
              text: "[abc]"
            });
          });
          it("c6", function() {
            set({
              textC: "|{abc}"
            });
            return ensureWait('c S B a', {
              text: "<abc>"
            });
          });
          it("c7", function() {
            set({
              textC: "|[abc]"
            });
            return ensureWait('c S r b', {
              text: "(abc)"
            });
          });
          it("c8", function() {
            set({
              textC: "|[abc]"
            });
            return ensureWait('c S r B', {
              text: "{abc}"
            });
          });
          it("c9", function() {
            set({
              textC: "|[abc]"
            });
            return ensureWait('c S r a', {
              text: "<abc>"
            });
          });
          it("c10", function() {
            set({
              textC: "|<abc>"
            });
            return ensureWait('c S a b', {
              text: "(abc)"
            });
          });
          it("c11", function() {
            set({
              textC: "|<abc>"
            });
            return ensureWait('c S a B', {
              text: "{abc}"
            });
          });
          return it("c12", function() {
            set({
              textC: "|<abc>"
            });
            return ensureWait('c S a r', {
              text: "[abc]"
            });
          });
        });
      });
      describe('surround', function() {
        describe('basic behavior', function() {
          it("surround text object with ( and repeatable", function() {
            ensureWait('y s i w (', {
              textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
            });
            return ensureWait('j .', {
              textC: "(apple)\n|(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
            });
          });
          it("surround text object with { and repeatable", function() {
            ensureWait('y s i w {', {
              textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
            });
            return ensureWait('j .', {
              textC: "{apple}\n|{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
            });
          });
          return it("surround current-line", function() {
            ensureWait('y s s {', {
              textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
            });
            return ensureWait('j .', {
              textC: "{apple}\n|{pairs: [brackets]}\npairs: [brackets]\n( multi\n  line )"
            });
          });
        });
        describe('adjustIndentation when surround linewise target', function() {
          beforeEach(function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('language-javascript');
            });
            return runs(function() {
              return set({
                textC: "function hello() {\n  if true {\n  |  console.log('hello');\n  }\n}",
                grammar: 'source.js'
              });
            });
          });
          return it("adjustIndentation surrounded text ", function() {
            return ensureWait('y s i f {', {
              textC: "function hello() {\n|  {\n    if true {\n      console.log('hello');\n    }\n  }\n}"
            });
          });
        });
        describe('with motion which takes user-input', function() {
          beforeEach(function() {
            return set({
              text: "s _____ e",
              cursor: [0, 0]
            });
          });
          describe("with 'f' motion", function() {
            return it("surround with 'f' motion", function() {
              return ensureWait('y s f e (', {
                text: "(s _____ e)",
                cursor: [0, 0]
              });
            });
          });
          return describe("with '`' motion", function() {
            beforeEach(function() {
              runs(function() {
                set({
                  cursor: [0, 8]
                });
                return ensureWait('m a', {
                  mark: {
                    'a': [0, 8]
                  }
                });
              });
              return runs(function() {
                return set({
                  cursor: [0, 0]
                });
              });
            });
            return it("surround with '`' motion", function() {
              return ensureWait('y s ` a (', {
                text: "(s _____ )e",
                cursor: [0, 0]
              });
            });
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
            return set({
              textC: "|apple\norange\nlemmon"
            });
          });
          describe("char is in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensureWait('y s i w (', {
                text: "( apple )\norange\nlemmon"
              });
              ensureWait('j y s i w {', {
                text: "( apple )\n{ orange }\nlemmon"
              });
              return ensureWait('j y s i w [', {
                text: "( apple )\n{ orange }\n[ lemmon ]"
              });
            });
          });
          describe("char is not in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensureWait('y s i w )', {
                text: "(apple)\norange\nlemmon"
              });
              ensureWait('j y s i w }', {
                text: "(apple)\n{orange}\nlemmon"
              });
              return ensureWait('j y s i w ]', {
                text: "(apple)\n{orange}\n[lemmon]"
              });
            });
          });
          return describe("it distinctively handle aliased keymap", function() {
            beforeEach(function() {
              return set({
                textC: "|abc"
              });
            });
            describe("normal pair-chars are set to add space", function() {
              beforeEach(function() {
                return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[', '<']);
              });
              it("c1", function() {
                return ensureWait('y s i w (', {
                  text: "( abc )"
                });
              });
              it("c2", function() {
                return ensureWait('y s i w b', {
                  text: "(abc)"
                });
              });
              it("c3", function() {
                return ensureWait('y s i w {', {
                  text: "{ abc }"
                });
              });
              it("c4", function() {
                return ensureWait('y s i w B', {
                  text: "{abc}"
                });
              });
              it("c5", function() {
                return ensureWait('y s i w [', {
                  text: "[ abc ]"
                });
              });
              it("c6", function() {
                return ensureWait('y s i w r', {
                  text: "[abc]"
                });
              });
              it("c7", function() {
                return ensureWait('y s i w <', {
                  text: "< abc >"
                });
              });
              return it("c8", function() {
                return ensureWait('y s i w a', {
                  text: "<abc>"
                });
              });
            });
            return describe("aliased pair-chars are set to add space", function() {
              beforeEach(function() {
                return settings.set('charactersToAddSpaceOnSurround', ['b', 'B', 'r', 'a']);
              });
              it("c1", function() {
                return ensureWait('y s i w (', {
                  text: "(abc)"
                });
              });
              it("c2", function() {
                return ensureWait('y s i w b', {
                  text: "( abc )"
                });
              });
              it("c3", function() {
                return ensureWait('y s i w {', {
                  text: "{abc}"
                });
              });
              it("c4", function() {
                return ensureWait('y s i w B', {
                  text: "{ abc }"
                });
              });
              it("c5", function() {
                return ensureWait('y s i w [', {
                  text: "[abc]"
                });
              });
              it("c6", function() {
                return ensureWait('y s i w r', {
                  text: "[ abc ]"
                });
              });
              it("c7", function() {
                return ensureWait('y s i w <', {
                  text: "<abc>"
                });
              });
              return it("c8", function() {
                return ensureWait('y s i w a', {
                  text: "< abc >"
                });
              });
            });
          });
        });
      });
      describe('map-surround', function() {
        beforeEach(function() {
          jasmine.attachToDOM(editorElement);
          set({
            textC: "\n|apple\npairs tomato\norange\nmilk\n"
          });
          return atom.keymaps.add("ms", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'm s': 'vim-mode-plus:map-surround'
            },
            'atom-text-editor.vim-mode-plus.visual-mode': {
              'm s': 'vim-mode-plus:map-surround'
            }
          });
        });
        it("surround text for each word in target case-1", function() {
          return ensureWait('m s i p (', {
            text: "\n(apple)\n(pairs) (tomato)\n(orange)\n(milk)\n"
          });
        });
        it("surround text for each word in target case-2", function() {
          set({
            cursor: [2, 1]
          });
          return ensureWait('m s i l <', {
            textC: "\napple\n<|pairs> <tomato>\norange\nmilk\n"
          });
        });
        return it("surround text for each word in visual selection", function() {
          settings.set("stayOnSelectTextObject", true);
          return ensureWait('v i p m s "', {
            textC: "\n\"apple\"\n\"pairs\" \"tomato\"\n\"orange\"\n|\"milk\"\n"
          });
        });
      });
      describe('delete surround', function() {
        beforeEach(function() {
          return set({
            cursor: [1, 8]
          });
        });
        it("delete surrounded chars and repeatable", function() {
          ensure('d S [', {
            text: "apple\npairs: brackets\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j l .', {
            text: "apple\npairs: brackets\npairs: brackets\n( multi\n  line )"
          });
        });
        it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure('d S (', {
            text: "apple\npairs: [brackets]\npairs: [brackets]\n multi\n  line "
          });
        });
        it("delete surrounded chars and trim padding spaces for non-identical pair-char", function() {
          set({
            text: "( apple )\n{  orange   }\n",
            cursor: [0, 0]
          });
          ensure('d S (', {
            text: "apple\n{  orange   }\n"
          });
          return ensure('j d S {', {
            text: "apple\norange\n"
          });
        });
        it("delete surrounded chars and NOT trim padding spaces for identical pair-char", function() {
          set({
            text: "` apple `\n\"  orange   \"\n",
            cursor: [0, 0]
          });
          ensure('d S `', {
            text_: '_apple_\n"__orange___"\n'
          });
          return ensure('j d S "', {
            text_: "_apple_\n__orange___\n"
          });
        });
        return it("delete surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure('d S {', {
            text: ["highlightRanges @editor, range, ", "  timeout: timeout", "  hello: world", ""].join("\n")
          });
        });
      });
      describe('change surround', function() {
        beforeEach(function() {
          return set({
            text: "(apple)\n(grape)\n<lemmon>\n{orange}",
            cursor: [0, 1]
          });
        });
        it("change surrounded chars and repeatable", function() {
          ensureWait('c S ( [', {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensureWait('j l .', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensureWait('j j c S < "', {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensureWait('j l c S { !', {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensureWait('c S { (', {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
          });
          describe('when input char is in charactersToAddSpaceOnSurround', function() {
            describe('[single line text] add single space around pair regardless of exsiting inner text', function() {
              it("case1", function() {
                set({
                  textC: "|(apple)"
                });
                return ensureWait('c S ( {', {
                  text: "{ apple }"
                });
              });
              it("case2", function() {
                set({
                  textC: "|( apple )"
                });
                return ensureWait('c S ( {', {
                  text: "{ apple }"
                });
              });
              return it("case3", function() {
                set({
                  textC: "|(  apple  )"
                });
                return ensureWait('c S ( {', {
                  text: "{ apple }"
                });
              });
            });
            return describe("[multi line text] don't add single space around pair", function() {
              return it("don't add single space around pair", function() {
                set({
                  textC: "|(\napple\n)"
                });
                return ensureWait("c S ( {", {
                  text: "{\napple\n}"
                });
              });
            });
          });
          return describe('when first input char is not in charactersToAddSpaceOnSurround', function() {
            describe("remove surrounding space of inner text for identical pair-char", function() {
              it("case1", function() {
                set({
                  textC: "|(apple)"
                });
                return ensureWait("c S ( }", {
                  text: "{apple}"
                });
              });
              it("case2", function() {
                set({
                  textC: "|( apple )"
                });
                return ensureWait("c S ( }", {
                  text: "{apple}"
                });
              });
              return it("case3", function() {
                set({
                  textC: "|(  apple  )"
                });
                return ensureWait("c S ( }", {
                  text: "{apple}"
                });
              });
            });
            return describe("doesn't remove surrounding space of inner text for non-identical pair-char", function() {
              it("case1", function() {
                set({
                  textC: '|"apple"'
                });
                return ensureWait('c S " `', {
                  text: "`apple`"
                });
              });
              it("case2", function() {
                set({
                  textC: '|"  apple  "'
                });
                return ensureWait('c S " `', {
                  text: "`  apple  `"
                });
              });
              return it("case3", function() {
                set({
                  textC: '|"  apple  "'
                });
                return ensureWait('c S " \'', {
                  text: "'  apple  '"
                });
              });
            });
          });
        });
      });
      describe('surround-word', function() {
        beforeEach(function() {
          return atom.keymaps.add("surround-test", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'y s w': 'vim-mode-plus:surround-word'
            }
          });
        });
        it("surround a word with ( and repeatable", function() {
          ensureWait('y s w (', {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensureWait('j .', {
            textC: "(apple)\n|(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensureWait('y s w {', {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensureWait('j .', {
            textC: "{apple}\n|{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
      });
      describe('delete-surround-any-pair', function() {
        beforeEach(function() {
          return set({
            textC: "apple\n(pairs: [|brackets])\n{pairs \"s\" [brackets]}\n( multi\n  line )"
          });
        });
        it("delete surrounded any pair found and repeatable", function() {
          ensure('d s', {
            text: 'apple\n(pairs: brackets)\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\npairs: brackets\n{pairs "s" [brackets]}\n( multi\n  line )'
          });
        });
        it("delete surrounded any pair found with skip pair out of cursor and repeatable", function() {
          set({
            cursor: [2, 14]
          });
          ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" brackets}\n( multi\n  line )'
          });
          ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
          return ensure('.', {
            text: 'apple\n(pairs: [brackets])\npairs "s" brackets\n( multi\n  line )'
          });
        });
        return it("delete surrounded chars expanded to multi-line", function() {
          set({
            cursor: [3, 1]
          });
          return ensure('d s', {
            text: 'apple\n(pairs: [brackets])\n{pairs "s" [brackets]}\n multi\n  line '
          });
        });
      });
      describe('delete-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          atom.keymaps.add("keymaps-for-surround", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'd s': 'vim-mode-plus:delete-surround-any-pair-allow-forwarding'
            }
          });
          return settings.set('stayOnTransformString', true);
        });
        return it("[1] single line", function() {
          set({
            textC: "|___(inner)\n___(inner)"
          });
          ensure('d s', {
            textC: "|___inner\n___(inner)"
          });
          return ensure('j .', {
            textC: "___inner\n|___inner"
          });
        });
      });
      describe('change-surround-any-pair', function() {
        beforeEach(function() {
          return set({
            textC: "(|apple)\n(grape)\n<lemmon>\n{orange}"
          });
        });
        return it("change any surrounded pair found and repeatable", function() {
          ensureWait('c s <', {
            textC: "|<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensureWait('j .', {
            textC: "<apple>\n|<grape>\n<lemmon>\n{orange}"
          });
          return ensureWait('2 j .', {
            textC: "<apple>\n<grape>\n<lemmon>\n|<orange>"
          });
        });
      });
      return describe('change-surround-any-pair-allow-forwarding', function() {
        beforeEach(function() {
          atom.keymaps.add("keymaps-for-surround", {
            'atom-text-editor.vim-mode-plus.normal-mode': {
              'c s': 'vim-mode-plus:change-surround-any-pair-allow-forwarding'
            }
          });
          return settings.set('stayOnTransformString', true);
        });
        return it("[1] single line", function() {
          set({
            textC: "|___(inner)\n___(inner)"
          });
          ensureWait('c s <', {
            textC: "|___<inner>\n___(inner)"
          });
          return ensureWait('j .', {
            textC: "___<inner>\n|___<inner>"
          });
        });
      });
    });
    describe('ReplaceWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            '_': 'vim-mode-plus:replace-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (parenthesis)\nhere (parenthesis)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'characterwise'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'characterwise'
            }
          }
        });
      });
      it("replace selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('_', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register')
        });
      });
      it("replace text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i (', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'default register')
        });
      });
      it("can repeat", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('_ i ( j .', {
          mode: 'normal',
          text: originalText.replace(/parenthesis/g, 'default register')
        });
      });
      return it("can use specified register to replace with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('" a _ i (', {
          mode: 'normal',
          text: originalText.replace('parenthesis', 'A register')
        });
      });
    });
    describe('SwapWithRegister', function() {
      var originalText;
      originalText = null;
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g p': 'vim-mode-plus:swap-with-register'
          }
        });
        originalText = "abc def 'aaa'\nhere (111)\nhere (222)";
        set({
          text: originalText,
          cursor: [0, 9]
        });
        set({
          register: {
            '"': {
              text: 'default register',
              type: 'characterwise'
            }
          }
        });
        return set({
          register: {
            'a': {
              text: 'A register',
              type: 'characterwise'
            }
          }
        });
      });
      it("swap selection with regisgter's content", function() {
        ensure('v i w', {
          selectedText: 'aaa'
        });
        return ensure('g p', {
          mode: 'normal',
          text: originalText.replace('aaa', 'default register'),
          register: {
            '"': {
              text: 'aaa'
            }
          }
        });
      });
      it("swap text object with regisgter's content", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('g p i (', {
          mode: 'normal',
          text: originalText.replace('111', 'default register'),
          register: {
            '"': {
              text: '111'
            }
          }
        });
      });
      it("can repeat", function() {
        var updatedText;
        set({
          cursor: [1, 6]
        });
        updatedText = "abc def 'aaa'\nhere (default register)\nhere (111)";
        return ensure('g p i ( j .', {
          mode: 'normal',
          text: updatedText,
          register: {
            '"': {
              text: '222'
            }
          }
        });
      });
      return it("can use specified register to swap with", function() {
        set({
          cursor: [1, 6]
        });
        return ensure('" a g p i (', {
          mode: 'normal',
          text: originalText.replace('111', 'A register'),
          register: {
            'a': {
              text: '111'
            }
          }
        });
      });
    });
    describe("Join and it's family", function() {
      beforeEach(function() {
        return set({
          textC_: "__0|12\n__345\n__678\n__9ab\n"
        });
      });
      describe("Join", function() {
        it("joins lines with triming leading whitespace", function() {
          ensure('J', {
            textC_: "__012| 345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__012 345| 678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__012 345 678| 9ab\n"
          });
          ensure('u', {
            textC_: "__012 345| 678\n__9ab\n"
          });
          ensure('u', {
            textC_: "__012| 345\n__678\n__9ab\n"
          });
          return ensure('u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
        });
        it("joins do nothing when it cannot join any more", function() {
          return ensure('1 0 0 J', {
            textC_: "  012 345 678 9a|b\n"
          });
        });
        return it("joins do nothing when it cannot join any more", function() {
          ensure('J J J', {
            textC_: "  012 345 678| 9ab\n"
          });
          ensure('J', {
            textC_: "  012 345 678 9a|b"
          });
          return ensure('J', {
            textC_: "  012 345 678 9a|b"
          });
        });
      });
      describe("JoinWithKeepingSpace", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g J': 'vim-mode-plus:join-with-keeping-space'
            }
          });
        });
        return it("joins lines without triming leading whitespace", function() {
          ensure('g J', {
            textC_: "__0|12__345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__0|12__345__678\n__9ab\n"
          });
          ensure('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensure('4 g J', {
            textC_: "__0|12__345__678__9ab\n"
          });
        });
      });
      describe("JoinByInput", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g J': 'vim-mode-plus:join-by-input'
            }
          });
        });
        it("joins lines by char from user with triming leading whitespace", function() {
          ensureWait('g J : : enter', {
            textC_: "__0|12::345\n__678\n__9ab\n"
          });
          ensureWait('.', {
            textC_: "__0|12::345::678\n__9ab\n"
          });
          ensureWait('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensureWait('4 g J : : enter', {
            textC_: "__0|12::345::678::9ab\n"
          });
        });
        return it("keep multi-cursors on cancel", function() {
          set({
            textC: "  0|12\n  345\n  6!78\n  9ab\n  c|de\n  fgh\n"
          });
          return ensureWait("g J : escape", {
            textC: "  0|12\n  345\n  6!78\n  9ab\n  c|de\n  fgh\n"
          });
        });
      });
      return describe("JoinByInputWithKeepingSpace", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
              'g J': 'vim-mode-plus:join-by-input-with-keeping-space'
            }
          });
        });
        return it("joins lines by char from user without triming leading whitespace", function() {
          ensureWait('g J : : enter', {
            textC_: "__0|12::__345\n__678\n__9ab\n"
          });
          ensureWait('.', {
            textC_: "__0|12::__345::__678\n__9ab\n"
          });
          ensureWait('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensureWait('4 g J : : enter', {
            textC_: "__0|12::__345::__678::__9ab\n"
          });
        });
      });
    });
    describe('ToggleLineComments', function() {
      var oldGrammar, originalText, ref3;
      ref3 = [], oldGrammar = ref3[0], originalText = ref3[1];
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-coffee-script');
        });
        return runs(function() {
          var grammar;
          oldGrammar = editor.getGrammar();
          grammar = atom.grammars.grammarForScopeName('source.coffee');
          editor.setGrammar(grammar);
          originalText = "class Base\n  constructor: (args) ->\n    pivot = items.shift()\n    left = []\n    right = []\n\nconsole.log \"hello\"";
          return set({
            text: originalText
          });
        });
      });
      afterEach(function() {
        return editor.setGrammar(oldGrammar);
      });
      it('toggle comment for textobject for indent and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i i', {
          text: "class Base\n  constructor: (args) ->\n    # pivot = items.shift()\n    # left = []\n    # right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
      return it('toggle comment for textobject for paragraph and repeatable', function() {
        set({
          cursor: [2, 0]
        });
        ensure('g / i p', {
          text: "# class Base\n#   constructor: (args) ->\n#     pivot = items.shift()\n#     left = []\n#     right = []\n\nconsole.log \"hello\""
        });
        return ensure('.', {
          text: originalText
        });
      });
    });
    describe("SplitString, SplitStringWithKeepingSplitter", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g /': 'vim-mode-plus:split-string',
            'g ?': 'vim-mode-plus:split-string-with-keeping-splitter'
          }
        });
        return set({
          textC: "|a:b:c\nd:e:f\n"
        });
      });
      describe("SplitString", function() {
        it("split string into lines", function() {
          ensureWait("g / : enter", {
            textC: "|a\nb\nc\nd:e:f\n"
          });
          return ensureWait("G .", {
            textC: "a\nb\nc\n|d\ne\nf\n"
          });
        });
        it("[from normal] keep multi-cursors on cancel", function() {
          set({
            textC_: "  0|12  345  6!78  9ab  c|de  fgh"
          });
          return ensureWait("g / : escape", {
            textC_: "  0|12  345  6!78  9ab  c|de  fgh"
          });
        });
        return it("[from visual] keep multi-cursors on cancel", function() {
          set({
            textC: "  0|12  345  6!78  9ab  c|de  fgh"
          });
          ensure("v", {
            textC: "  01|2  345  67!8  9ab  cd|e  fgh",
            selectedTextOrdered: ["1", "7", "d"],
            mode: ["visual", "characterwise"]
          });
          return ensureWait("g / escape", {
            textC: "  01|2  345  67!8  9ab  cd|e  fgh",
            selectedTextOrdered: ["1", "7", "d"],
            mode: ["visual", "characterwise"]
          });
        });
      });
      return describe("SplitStringWithKeepingSplitter", function() {
        it("split string into lines without removing spliter char", function() {
          ensureWait("g ? : enter", {
            textC: "|a:\nb:\nc\nd:e:f\n"
          });
          return ensureWait("G .", {
            textC: "a:\nb:\nc\n|d:\ne:\nf\n"
          });
        });
        it("keep multi-cursors on cancel", function() {
          set({
            textC_: "  0|12  345  6!78  9ab  c|de  fgh"
          });
          return ensureWait("g ? : escape", {
            textC_: "  0|12  345  6!78  9ab  c|de  fgh"
          });
        });
        return it("[from visual] keep multi-cursors on cancel", function() {
          set({
            textC: "  0|12  345  6!78  9ab  c|de  fgh"
          });
          ensure("v", {
            textC: "  01|2  345  67!8  9ab  cd|e  fgh",
            selectedTextOrdered: ["1", "7", "d"],
            mode: ["visual", "characterwise"]
          });
          return ensureWait("g ? escape", {
            textC: "  01|2  345  67!8  9ab  cd|e  fgh",
            selectedTextOrdered: ["1", "7", "d"],
            mode: ["visual", "characterwise"]
          });
        });
      });
    });
    describe("SplitArguments, SplitArgumentsWithRemoveSeparator", function() {
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g ,': 'vim-mode-plus:split-arguments',
            'g !': 'vim-mode-plus:split-arguments-with-remove-separator'
          }
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        return runs(function() {
          return set({
            grammar: 'source.js',
            text: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = `abc def hij`\n}"
          });
        });
      });
      describe("SplitArguments", function() {
        it("split by commma with adjust indent", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g , i {', {
            textC: "hello = () => {\n  |{\n    f1,\n    f2,\n    f3\n  } = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = `abc def hij`\n}"
          });
        });
        it("split by commma with adjust indent", function() {
          set({
            cursor: [2, 5]
          });
          ensure('g , i (', {
            textC: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1|(\n    f2(1, \"a, b, c\"),\n    2,\n    (arg) => console.log(arg)\n  )\n  s = `abc def hij`\n}"
          });
          ensure('j w');
          return ensure('g , i (', {
            textC: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1(\n    f2|(\n      1,\n      \"a, b, c\"\n    ),\n    2,\n    (arg) => console.log(arg)\n  )\n  s = `abc def hij`\n}"
          });
        });
        return it("split by white-space with adjust indent", function() {
          set({
            cursor: [3, 10]
          });
          return ensure('g , i `', {
            textC: "hello = () => {\n  {f1, f2, f3} = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = |`\n  abc\n  def\n  hij\n  `\n}"
          });
        });
      });
      return describe("SplitByArgumentsWithRemoveSeparator", function() {
        beforeEach(function() {});
        return it("remove splitter when split", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g ! i {', {
            textC: "hello = () => {\n  |{\n    f1\n    f2\n    f3\n  } = require('hello')\n  f1(f2(1, \"a, b, c\"), 2, (arg) => console.log(arg))\n  s = `abc def hij`\n}"
          });
        });
      });
    });
    describe("Change Order faimliy: Reverse, Sort, SortCaseInsensitively, SortByNumber", function() {
      beforeEach(function() {
        return atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g r': 'vim-mode-plus:reverse',
            'g s': 'vim-mode-plus:sort',
            'g S': 'vim-mode-plus:sort-by-number'
          }
        });
      });
      describe("characterwise target", function() {
        describe("Reverse", function() {
          it("[comma separated] reverse text", function() {
            set({
              textC: "   ( dog, ca|t, fish, rabbit, duck, gopher, squid )"
            });
            return ensure('g r i (', {
              textC_: "   (| squid, gopher, duck, rabbit, fish, cat, dog )"
            });
          });
          it("[comma sparated] reverse text", function() {
            set({
              textC: "   ( 'dog ca|t', 'fish rabbit', 'duck gopher squid' )"
            });
            return ensure('g r i (', {
              textC_: "   (| 'duck gopher squid', 'fish rabbit', 'dog cat' )"
            });
          });
          it("[space sparated] reverse text", function() {
            set({
              textC: "   ( dog ca|t fish rabbit duck gopher squid )"
            });
            return ensure('g r i (', {
              textC_: "   (| squid gopher duck rabbit fish cat dog )"
            });
          });
          it("[comma sparated multi-line] reverse text", function() {
            set({
              textC: "{\n  |1, 2, 3, 4,\n  5, 6,\n  7,\n  8, 9\n}"
            });
            return ensure('g r i {', {
              textC: "{\n|  9, 8, 7, 6,\n  5, 4,\n  3,\n  2, 1\n}"
            });
          });
          it("[comma sparated multi-line] keep comma followed to last entry", function() {
            set({
              textC: "[\n  |1, 2, 3, 4,\n  5, 6,\n]"
            });
            return ensure('g r i [', {
              textC: "[\n|  6, 5, 4, 3,\n  2, 1,\n]"
            });
          });
          it("[comma sparated multi-line] aware of nexted pair and quotes and escaped quote", function() {
            set({
              textC: "(\n  |\"(a, b, c)\", \"[( d e f\", test(g, h, i),\n  \"\\\"j, k, l\",\n  '\\'m, n', test(o, p),\n)"
            });
            return ensure('g r i (', {
              textC: "(\n|  test(o, p), '\\'m, n', \"\\\"j, k, l\",\n  test(g, h, i),\n  \"[( d e f\", \"(a, b, c)\",\n)"
            });
          });
          return it("[space sparated multi-line] aware of nexted pair and quotes and escaped quote", function() {
            set({
              textC_: "(\n  |\"(a, b, c)\" \"[( d e f\"      test(g, h, i)\n  \"\\\"j, k, l\"___\n  '\\'m, n'    test(o, p)\n)"
            });
            return ensure('g r i (', {
              textC_: "(\n|  test(o, p) '\\'m, n'      \"\\\"j, k, l\"\n  test(g, h, i)___\n  \"[( d e f\"    \"(a, b, c)\"\n)"
            });
          });
        });
        describe("Sort", function() {
          return it("[comma separated] sort text", function() {
            set({
              textC: "   ( dog, ca|t, fish, rabbit, duck, gopher, squid )"
            });
            return ensure('g s i (', {
              textC: "   (| cat, dog, duck, fish, gopher, rabbit, squid )"
            });
          });
        });
        return describe("SortByNumber", function() {
          return it("[comma separated] sort by number", function() {
            set({
              textC_: "___(9, 1, |10, 5)"
            });
            return ensure('g S i (', {
              textC_: "___(|1, 5, 9, 10)"
            });
          });
        });
      });
      return describe("linewise target", function() {
        beforeEach(function() {
          return set({
            textC: "|z\n\n10a\nb\na\n\n5\n1\n"
          });
        });
        describe("Reverse", function() {
          return it("reverse rows", function() {
            return ensure('g r G', {
              textC: "|1\n5\n\na\nb\n10a\n\nz\n"
            });
          });
        });
        describe("Sort", function() {
          return it("sort rows", function() {
            return ensure('g s G', {
              textC: "|\n\n1\n10a\n5\na\nb\nz\n"
            });
          });
        });
        describe("SortByNumber", function() {
          return it("sort rows numerically", function() {
            return ensure("g S G", {
              textC: "|1\n5\n10a\nz\n\nb\na\n\n"
            });
          });
        });
        return describe("SortCaseInsensitively", function() {
          beforeEach(function() {
            return atom.keymaps.add("test", {
              'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
                'g s': 'vim-mode-plus:sort-case-insensitively'
              }
            });
          });
          return it("Sort rows case-insensitively", function() {
            set({
              textC: "|apple\nBeef\nAPPLE\nDOG\nbeef\nApple\nBEEF\nDog\ndog\n"
            });
            return ensure("g s G", {
              text: "apple\nApple\nAPPLE\nbeef\nBeef\nBEEF\ndog\nDog\nDOG\n"
            });
          });
        });
      });
    });
    describe("NumberingLines", function() {
      var ensureNumbering;
      ensureNumbering = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        dispatch(editor.element, 'vim-mode-plus:numbering-lines');
        return ensure.apply(null, args);
      };
      beforeEach(function() {
        return set({
          textC: "|a\nb\nc\n\n"
        });
      });
      it("numbering by motion", function() {
        return ensureNumbering("j", {
          textC: "|1: a\n2: b\nc\n\n"
        });
      });
      return it("numbering by text-object", function() {
        return ensureNumbering("p", {
          textC: "|1: a\n2: b\n3: c\n\n"
        });
      });
    });
    return describe("DuplicateWithCommentOutOriginal", function() {
      beforeEach(function() {
        return set({
          textC: "\n1: |Pen\n2: Pineapple\n\n4: Apple\n5: Pen\n"
        });
      });
      it("dup-and-commentout", function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript').then(function() {
            set({
              grammar: "source.js"
            });
            dispatch(editor.element, 'vim-mode-plus:duplicate-with-comment-out-original');
            return ensure("i p", {
              textC: "\n// 1: Pen\n// 2: Pineapple\n1: |Pen\n2: Pineapple\n\n4: Apple\n5: Pen\n"
            });
          });
        });
        return runs(function() {
          return ensure(".", {
            textC: "\n// // 1: Pen\n// // 2: Pineapple\n// 1: Pen\n// 2: Pineapple\n// 1: Pen\n// 2: Pineapple\n1: |Pen\n2: Pineapple\n\n4: Apple\n5: Pen\n"
          });
        });
      });
      return it("dup-and-commentout", function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-ruby').then(function() {
            set({
              grammar: "source.ruby"
            });
            dispatch(editor.element, 'vim-mode-plus:duplicate-with-comment-out-original');
            return ensure("i p", {
              textC: "\n# 1: Pen\n# 2: Pineapple\n1: |Pen\n2: Pineapple\n\n4: Apple\n5: Pen\n"
            });
          });
        });
        return runs(function() {
          return ensure(".", {
            textC: "\n# # 1: Pen\n# # 2: Pineapple\n# 1: Pen\n# 2: Pineapple\n# 1: Pen\n# 2: Pineapple\n1: |Pen\n2: Pineapple\n\n4: Apple\n5: Pen\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9DQUFBO0lBQUE7O0VBQUEsTUFBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyw2QkFBRCxFQUFjOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUE7QUFDbkMsUUFBQTtJQUFBLE9BQW9FLEVBQXBFLEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsb0JBQWQsRUFBMEIsMEJBQTFCLEVBQTRDO0lBQzVDLE9BQW9DLEVBQXBDLEVBQUMsZ0JBQUQsRUFBUyx1QkFBVCxFQUF3QjtJQUV4QixVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLDJCQUFkLEVBQTBCLHVDQUExQixFQUE0QywrQ0FBNUMsRUFBb0U7TUFIMUQsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtNQUMzQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLEtBQUEsRUFBTyxZQUFQO1NBREY7TUFEUyxDQUFYO01BT0EsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7UUFDckMsTUFBQSxDQUFPLEdBQVAsRUFDRTtVQUFBLEtBQUEsRUFBTyxZQUFQO1NBREY7UUFLQSxNQUFBLENBQU8sR0FBUCxFQUNFO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FERjtlQU1BLE1BQUEsQ0FBUSxHQUFSLEVBQ0U7VUFBQSxLQUFBLEVBQU8sWUFBUDtTQURGO01BWnFDLENBQXZDO01Ba0JB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UyxpQ0FBVCxFQUE0QyxTQUFBO1VBQzFDLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7bUJBQXFCLFVBQUEsQ0FBVyxTQUFYLEVBQXNCO2NBQUEsSUFBQSxFQUFNLE9BQU47YUFBdEI7VUFBeEIsQ0FBVDtVQUNBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7bUJBQXFCLFVBQUEsQ0FBVyxTQUFYLEVBQXNCO2NBQUEsSUFBQSxFQUFNLE9BQU47YUFBdEI7VUFBeEIsQ0FBVDtVQUNBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7bUJBQXFCLFVBQUEsQ0FBVyxTQUFYLEVBQXNCO2NBQUEsSUFBQSxFQUFNLE9BQU47YUFBdEI7VUFBeEIsQ0FBVDtVQUVBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7bUJBQXFCLFVBQUEsQ0FBVyxTQUFYLEVBQXNCO2NBQUEsSUFBQSxFQUFNLE9BQU47YUFBdEI7VUFBeEIsQ0FBVDtVQUNBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7bUJBQXFCLFVBQUEsQ0FBVyxTQUFYLEVBQXNCO2NBQUEsSUFBQSxFQUFNLE9BQU47YUFBdEI7VUFBeEIsQ0FBVDtVQUNBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7bUJBQXFCLFVBQUEsQ0FBVyxTQUFYLEVBQXNCO2NBQUEsSUFBQSxFQUFNLE9BQU47YUFBdEI7VUFBeEIsQ0FBVDtVQUVBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtZQUFHLEdBQUEsQ0FBSTtjQUFBLEtBQUEsRUFBTyxRQUFQO2FBQUo7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S0FBUCxFQUNFO2NBQUEsS0FBQSxFQUFPLHlFQUFQO2FBREY7VUFIa0QsQ0FBcEQ7UUFEYyxDQUFoQjtlQWVBLElBQUEsQ0FBSyxTQUFBO2lCQUNILE1BQUEsQ0FBTyxHQUFQLEVBQ0U7WUFBQSxLQUFBLEVBQU8saUlBQVA7V0FERjtRQURHLENBQUw7TUFoQnVCLENBQXpCO0lBNUMwQyxDQUE1QztFQTd2RG1DLENBQXJDO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNofSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBUcmFuc2Zvcm1TdHJpbmdcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlbnN1cmVXYWl0LCBiaW5kRW5zdXJlT3B0aW9uLCBiaW5kRW5zdXJlV2FpdE9wdGlvbl0gPSBbXVxuICBbZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwgZW5zdXJlV2FpdCwgYmluZEVuc3VyZU9wdGlvbiwgYmluZEVuc3VyZVdhaXRPcHRpb259ID0gdmltXG5cbiAgZGVzY3JpYmUgJ3RoZSB+IGtleWJpbmRpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIHxhQmNcbiAgICAgICAgfFh5WlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICd0b2dnbGVzIHRoZSBjYXNlIGFuZCBtb3ZlcyByaWdodCcsIC0+XG4gICAgICBlbnN1cmUgJ34nLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIEF8QmNcbiAgICAgICAgeHx5WlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQWJ8Y1xuICAgICAgICB4WXxaXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBlbnN1cmUgICd+JyxcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBBYnxDXG4gICAgICAgIHhZfHpcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAndGFrZXMgYSBjb3VudCcsIC0+XG4gICAgICBlbnN1cmUgJzQgficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQWJ8Q1xuICAgICAgICB4WXx6XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgaXQgXCJ0b2dnbGVzIHRoZSBjYXNlIG9mIHRoZSBzZWxlY3RlZCB0ZXh0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1YgficsIHRleHQ6ICdBYkNcXG5YeVonXG5cbiAgICBkZXNjcmliZSBcIndpdGggZyBhbmQgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcInRvZ2dsZXMgdGhlIGNhc2Ugb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxhQmNcXG5YeVpcIlxuICAgICAgICBlbnN1cmUgJ2cgfiAyIGwnLCB0ZXh0QzogJ3xBYmNcXG5YeVonXG5cbiAgICAgIGl0IFwiZ35+IHRvZ2dsZXMgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcImF8QmNcXG5YeVpcIlxuICAgICAgICBlbnN1cmUgJ2cgfiB+JywgdGV4dEM6ICdBfGJDXFxuWHlaJ1xuXG4gICAgICBpdCBcImd+Z34gdG9nZ2xlcyB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiYXxCY1xcblh5WlwiXG4gICAgICAgIGVuc3VyZSAnZyB+IGcgficsIHRleHRDOiAnQXxiQ1xcblh5WidcblxuICBkZXNjcmliZSAndGhlIFUga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICdhQmNcXG5YeVonXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRleHQgdXBwZXJjYXNlIHdpdGggZyBhbmQgbW90aW9uLCBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBVIGwnLCB0ZXh0OiAnQUJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZyBVIGUnLCB0ZXh0OiAnQUJDXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgZW5zdXJlICdnIFUgJCcsIHRleHQ6ICdBQkNcXG5YWVonLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJtYWtlcyB0aGUgc2VsZWN0ZWQgdGV4dCB1cHBlcmNhc2UgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBVJywgdGV4dDogJ0FCQ1xcblh5WidcblxuICAgIGl0IFwiZ1VVIHVwY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgVSBVJywgdGV4dDogJ0FCQ1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImdVZ1UgdXBjYXNlIHRoZSBsaW5lIG9mIHRleHQsIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnZyBVIGcgVScsIHRleHQ6ICdBQkNcXG5YeVonLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICd0aGUgdSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogJ2FCY1xcblh5WicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRleHQgbG93ZXJjYXNlIHdpdGggZyBhbmQgbW90aW9uLCBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyB1ICQnLCB0ZXh0OiAnYWJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwibWFrZXMgdGhlIHNlbGVjdGVkIHRleHQgbG93ZXJjYXNlIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgdScsIHRleHQ6ICdhYmNcXG5YeVonXG5cbiAgICBpdCBcImd1dSBkb3duY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgdSB1JywgdGV4dDogJ2FiY1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImd1Z3UgZG93bmNhc2UgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgZW5zdXJlICdnIHUgZyB1JywgdGV4dDogJ2FiY1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgPiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiPiA+XCIsIC0+XG4gICAgICBkZXNjcmliZSBcImZyb20gZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImluZGVudHMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnPiA+JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImNvdW50IG1lYW5zIE4gbGluZSBpbmRlbnRzIGFuZCB1bmRvYWJsZSwgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnMyA+ID4nLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgICBfX0FCQ0RFXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmUgJy4gLicsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgX19fX3wxMjM0NVxuICAgICAgICAgICAgX19fX2FiY2RlXG4gICAgICAgICAgICBfX19fQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImZyb20gbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICc+ID4nLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICAgIHxBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIlt2Q10gaW5kZW50IHNlbGVjdGVkIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgaiA+XCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIlt2TF0gaW5kZW50IHNlbGVjdGVkIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIlYgPlwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX3wxMjM0NVxuICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fX198MTIzNDVcbiAgICAgICAgICBhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIlt2TF0gY291bnQgbWVhbnMgTiB0aW1lcyBpbmRlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiViAzID5cIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19fX19fX19ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZSBhbmQgc3RheU9uVHJhbnNmb3JtU3RyaW5nIGVuYWJsZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBhbmQgZXhpdHMgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGogPicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwid2hlbiByZXBlYXRlZCwgb3BlcmF0ZSBvbiBzYW1lIHJhbmdlIHdoZW4gY3Vyc29yIHdhcyBub3QgbW92ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGogPicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwid2hlbiByZXBlYXRlZCwgb3BlcmF0ZSBvbiByZWxhdGl2ZSByYW5nZSBmcm9tIGN1cnNvciBwb3NpdGlvbiB3aXRoIHNhbWUgZXh0ZW50IHdoZW4gY3Vyc29yIHdhcyBtb3ZlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaiA+JyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICB8YWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2wgLicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMTIzNDVcbiAgICAgICAgICBfX19fYXxiY2RlXG4gICAgICAgICAgX19BQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwidGhlIDwga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICB8X18xMjM0NVxuICAgICAgICBfX2FiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgPFwiLCAtPlxuICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICc8IDwnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSByZXBlYXRpbmcgPFwiLCAtPlxuICAgICAgaXQgXCJpbmRlbnRzIG11bHRpcGxlIGxpbmVzIGF0IG9uY2UgYW5kIHVuZG9hYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMiA8IDwnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfF9fMTIzNDVcbiAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICB8X19fX19fMTIzNDVcbiAgICAgICAgICBfX19fX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY291bnQgbWVhbnMgTiB0aW1lcyBvdXRkZW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnViBqIDIgPCcsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX3wxMjM0NVxuICAgICAgICAgIF9fYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAjIFRoaXMgaXMgbm90IGlkZWFsIGN1cnNvciBwb3NpdGlvbiwgYnV0IGN1cnJlbnQgbGltaXRhdGlvbi5cbiAgICAgICAgIyBTaW5jZSBpbmRlbnQgZGVwZW5kaW5nIG9uIEF0b20ncyBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcbiAgICAgICAgIyBJbXBsZW1lbnRpbmcgaXQgdm1wIGluZGVwZW5kZW50bHkgc29sdmUgaXNzdWUsIGJ1dCBJIGhhdmUgYW5vdGhlciBpZGVhIGFuZCB3YW50IHRvIHVzZSBBdG9tJ3Mgb25lIG5vdy5cbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fX19fXzEyMzQ1XG4gICAgICAgICAgfF9fX19fX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInRoZSA9IGtleWJpbmRpbmdcIiwgLT5cbiAgICBvbGRHcmFtbWFyID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG5cbiAgICAgIG9sZEdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgICBzZXQgdGV4dDogXCJmb29cXG4gIGJhclxcbiAgYmF6XCIsIGN1cnNvcjogWzEsIDBdXG5cblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VkIGluIGEgc2NvcGUgdGhhdCBzdXBwb3J0cyBhdXRvLWluZGVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqc0dyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5qcycpXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGpzR3JhbW1hcilcblxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKG9sZEdyYW1tYXIpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhID1cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGVuc3VyZSAnPSA9J1xuXG4gICAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdygxKSkudG9CZSAwXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHJlcGVhdGluZyA9XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBlbnN1cmUgJzIgPSA9J1xuXG4gICAgICAgIGl0IFwiYXV0b2luZGVudHMgbXVsdGlwbGUgbGluZXMgYXQgb25jZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBudWxsLCB0ZXh0OiBcImZvb1xcbmJhclxcbmJhelwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwidW5kbyBiZWhhdmlvclwiLCAtPlxuICAgICAgICAgIGl0IFwiaW5kZW50cyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcImZvb1xcbiAgYmFyXFxuICBiYXpcIlxuXG4gIGRlc2NyaWJlICdDYW1lbENhc2UnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiAndmltLW1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gdGV4dCBieSBtb3Rpb24gYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBDICQnLCB0ZXh0OiAndmltTW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiAndmltTW9kZVxcbmF0b21UZXh0RWRpdG9yXFxuJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdWIGogZyBDJywgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tVGV4dEVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdGluZyB0d2ljZSB3b3JrcyBvbiBjdXJyZW50LWxpbmUgYW5kIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBlbnN1cmUgJ2wgZyBDIGcgQycsIHRleHQ6ICd2aW1Nb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ1Bhc2NhbENhc2UnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIEMnOiAndmltLW1vZGUtcGx1czpwYXNjYWwtY2FzZSdcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSB0ZXh0IGJ5IG1vdGlvbiBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgZW5zdXJlICdnIEMgJCcsIHRleHQ6ICdWaW1Nb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6ICdWaW1Nb2RlXFxuQXRvbVRleHRFZGl0b3JcXG4nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gc2VsZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBnIEMnLCB0ZXh0OiAnVmltTW9kZVxcbmF0b21UZXh0RWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0aW5nIHR3aWNlIHdvcmtzIG9uIGN1cnJlbnQtbGluZSBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnbCBnIEMgZyBDJywgdGV4dDogJ1ZpbU1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSAnU25ha2VDYXNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbidcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJnX1wiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBfJzogJ3ZpbS1tb2RlLXBsdXM6c25ha2UtY2FzZSdcblxuICAgIGl0IFwidHJhbnNmb3JtIHRleHQgYnkgbW90aW9uIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2cgXyAkJywgdGV4dDogJ3ZpbV9tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6ICd2aW1fbW9kZVxcbmF0b21fdGV4dF9lZGl0b3JcXG4nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gc2VsZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBnIF8nLCB0ZXh0OiAndmltX21vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0aW5nIHR3aWNlIHdvcmtzIG9uIGN1cnJlbnQtbGluZSBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnbCBnIF8gZyBfJywgdGV4dDogJ3ZpbV9tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ0Rhc2hDYXNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gdGV4dCBieSBtb3Rpb24gYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyAtICQnLCB0ZXh0OiAndmltLW1vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGcgLScsIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRpbmcgdHdpY2Ugd29ya3Mgb24gY3VycmVudC1saW5lIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdsIGcgLSBnIC0nLCB0ZXh0OiAndmltLW1vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSAnQ29udmVydFRvU29mdFRhYicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgdGFiJzogJ3ZpbS1tb2RlLXBsdXM6Y29udmVydC10by1zb2Z0LXRhYidcblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGl0IFwiY29udmVydCB0YWJzIHRvIHNwYWNlc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRhYkxlbmd0aCgpKS50b0JlKDIpXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXFx0dmFyMTAgPVxcdFxcdDA7XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgdGFiICQnLFxuICAgICAgICAgIHRleHQ6IFwiICB2YXIxMCA9ICAgMDtcIlxuXG4gIGRlc2NyaWJlICdDb252ZXJ0VG9IYXJkVGFiJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBzaGlmdC10YWInOiAndmltLW1vZGUtcGx1czpjb252ZXJ0LXRvLWhhcmQtdGFiJ1xuXG4gICAgZGVzY3JpYmUgXCJiYXNpYyBiZWhhdmlvclwiLCAtPlxuICAgICAgaXQgXCJjb252ZXJ0IHNwYWNlcyB0byB0YWJzXCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkpLnRvQmUoMilcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIgIHZhcjEwID0gICAgMDtcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzaGlmdC10YWIgJCcsXG4gICAgICAgICAgdGV4dDogXCJcXHR2YXIxMFxcdD1cXHRcXHQgMDtcIlxuXG4gIGRlc2NyaWJlICdDb21wYWN0U3BhY2VzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGl0IFwiY29tcGF0cyBtdWx0aXBsZSBzcGFjZSBpbnRvIG9uZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAndmFyMCAgID0gICAwOyB2YXIxMCAgID0gICAxMCdcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgc3BhY2UgJCcsXG4gICAgICAgICAgdGV4dDogJ3ZhcjAgPSAwOyB2YXIxMCA9IDEwJ1xuICAgICAgaXQgXCJkb24ndCBhcHBseSBjb21wYWN0aW9uIGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyBzcGFjZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fdmFyMCAgID0gICAwOyB2YXIxMCAgID0gICAxMF9fX1xuICAgICAgICAgIF9fX3ZhcjEgICA9ICAgMTsgdmFyMTEgICA9ICAgMTFfX19cbiAgICAgICAgICBfX192YXIyICAgPSAgIDI7IHZhcjEyICAgPSAgIDEyX19fXG5cbiAgICAgICAgICBfX192YXI0ICAgPSAgIDQ7IHZhcjE0ICAgPSAgIDE0X19fXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHNwYWNlIGkgcCcsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fX3ZhcjAgPSAwOyB2YXIxMCA9IDEwX19fXG4gICAgICAgICAgX19fdmFyMSA9IDE7IHZhcjExID0gMTFfX19cbiAgICAgICAgICBfX192YXIyID0gMjsgdmFyMTIgPSAxMl9fX1xuXG4gICAgICAgICAgX19fdmFyNCAgID0gICA0OyB2YXIxNCAgID0gICAxNF9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJidXQgaXQgY29tcGFjdCBzcGFjZXMgd2hlbiB0YXJnZXQgYWxsIHRleHQgaXMgc3BhY2VzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6ICcwMTIzNCAgICA5MCdcbiAgICAgICAgICBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJ2cgc3BhY2UgdycsXG4gICAgICAgICAgdGV4dDogJzAxMjM0IDkwJ1xuXG4gIGRlc2NyaWJlICdBbGlnbk9jY3VycmVuY2UgZmFtaWx5JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyB8JzogJ3ZpbS1tb2RlLXBsdXM6YWxpZ24tb2NjdXJyZW5jZSdcblxuICAgIGRlc2NyaWJlIFwiQWxpZ25PY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcImFsaWduIGJ5ID1cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYSB8PSAxMDBcbiAgICAgICAgICBiY2QgPSAxXG4gICAgICAgICAgaWprbG0gPSAxMDAwXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiZyB8IHBcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBhIHwgICAgPSAxMDBcbiAgICAgICAgICBiY2QgICA9IDFcbiAgICAgICAgICBpamtsbSA9IDEwMDBcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJhbGlnbiBieSBjb21tYVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBhfCwgMTAwLCAzMFxuICAgICAgICAgIGIsIDMwMDAwLCA1MFxuICAgICAgICAgIDIwMDAwMCwgMVxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImcgfCBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYXwsICAgICAgMTAwLCAgIDMwXG4gICAgICAgICAgYiwgICAgICAzMDAwMCwgNTBcbiAgICAgICAgICAyMDAwMDAsIDFcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJhbGlnbiBieSBub24td29yZC1jaGFyLWVuZGluZ1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBhYmN8OiAxMFxuICAgICAgICAgIGRlZmdoOiAyMFxuICAgICAgICAgIGlqOiAzMFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImcgfCBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYWJjfDogICAxMFxuICAgICAgICAgIGRlZmdoOiAyMFxuICAgICAgICAgIGlqOiAgICAzMFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImFsaWduIGJ5IG5vcm1hbCB3b3JkXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIHh4eCBmaXJ8c3ROYW1lOiBcIkhlbGxvXCIsIGxhc3ROYW1lOiBcIldvcmxkXCJcbiAgICAgICAgICB5eXl5eXl5eSBmaXJzdE5hbWU6IFwiR29vZCBCeWVcIiwgbGFzdE5hbWU6IFwiV29ybGRcIlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImcgfCBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgeHh4ICAgIHwgIGZpcnN0TmFtZTogXCJIZWxsb1wiLCBsYXN0TmFtZTogXCJXb3JsZFwiXG4gICAgICAgICAgeXl5eXl5eXkgZmlyc3ROYW1lOiBcIkdvb2QgQnllXCIsIGxhc3ROYW1lOiBcIldvcmxkXCJcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJhbGlnbiBieSBgfGAgdGFibGUtbGlrZSB0ZXh0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4gICAgICAgICAgfCB3aGVyZSB8IG1vdmUgdG8gMXN0IGNoYXIgfCBubyBtb3ZlIHxcbiAgICAgICAgICArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbiAgICAgICAgICB8IHRvcCB8IGB6IGVudGVyYCB8IGB6IHRgIHxcbiAgICAgICAgICB8IG1pZGRsZSB8IGB6IC5gIHwgYHogemAgfFxuICAgICAgICAgIHwgYm90dG9tIHwgYHogLWAgfCBgeiBiYCB8XG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgXCJnIHwgcFwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4gICAgICAgICAgfCB3aGVyZSAgfCBtb3ZlIHRvIDFzdCBjaGFyIHwgbm8gbW92ZSB8XG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4gICAgICAgICAgfCB0b3AgICAgfCBgeiBlbnRlcmAgICAgICAgIHwgYHogdGAgICB8XG4gICAgICAgICAgfCBtaWRkbGUgfCBgeiAuYCAgICAgICAgICAgIHwgYHogemAgICB8XG4gICAgICAgICAgfCBib3R0b20gfCBgeiAtYCAgICAgICAgICAgIHwgYHogYmAgICB8XG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuXG4gIGRlc2NyaWJlICdUcmltU3RyaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIgdGV4dCA9IEBnZXROZXdUZXh0KCBzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24gKSAgXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNDJdXG5cbiAgICBkZXNjcmliZSBcImJhc2ljIGJlaGF2aW9yXCIsIC0+XG4gICAgICBpdCBcInRyaW0gc3RyaW5nIGZvciBhLWxpbmUgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fX2FiY19fX1xuICAgICAgICAgIF9fX2RlZl9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyB8IGEgbCcsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIF9fX2RlZl9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGRlZlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ0cmltIHN0cmluZyBmb3IgaW5uZXItcGFyZW50aGVzaXMgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICggIGFiYyAgKVxuICAgICAgICAgICggIGRlZiAgKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyB8IGkgKCcsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIChhYmMpXG4gICAgICAgICAgKCAgZGVmICApXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgKGFiYylcbiAgICAgICAgICAoZGVmKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ0cmltIHN0cmluZyBmb3IgaW5uZXItYW55LXBhaXIgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSwgYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAgICdpIDsnOiAgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXInXG5cbiAgICAgICAgc2V0IHRleHRfOiBcIiggWyB7ICBhYmMgIH0gXSApXCIsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZyB8IGkgOycsIHRleHRfOiBcIiggWyB7YWJjfSBdIClcIlxuICAgICAgICBlbnN1cmUgJzIgaCAuJywgdGV4dF86IFwiKCBbe2FiY31dIClcIlxuICAgICAgICBlbnN1cmUgJzIgaCAuJywgdGV4dF86IFwiKFt7YWJjfV0pXCJcblxuICBkZXNjcmliZSAnc3Vycm91bmQgZmFtaWx5JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBrZXltYXBzRm9yU3Vycm91bmQgPSB7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICd5IHMnOiAndmltLW1vZGUtcGx1czpzdXJyb3VuZCdcbiAgICAgICAgICAnZCBzJzogJ3ZpbS1tb2RlLXBsdXM6ZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyJ1xuICAgICAgICAgICdkIFMnOiAndmltLW1vZGUtcGx1czpkZWxldGUtc3Vycm91bmQnXG4gICAgICAgICAgJ2Mgcyc6ICd2aW0tbW9kZS1wbHVzOmNoYW5nZS1zdXJyb3VuZC1hbnktcGFpcidcbiAgICAgICAgICAnYyBTJzogJ3ZpbS1tb2RlLXBsdXM6Y2hhbmdlLXN1cnJvdW5kJ1xuXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMub3BlcmF0b3ItcGVuZGluZy1tb2RlLnN1cnJvdW5kLXBlbmRpbmcnOlxuICAgICAgICAgICdzJzogJ3ZpbS1tb2RlLXBsdXM6aW5uZXItY3VycmVudC1saW5lJ1xuXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMudmlzdWFsLW1vZGUnOlxuICAgICAgICAgICdTJzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQnXG4gICAgICB9XG5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQoXCJrZXltYXBzLWZvci1zdXJyb3VuZFwiLCBrZXltYXBzRm9yU3Vycm91bmQpXG5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgcGFpcnM6IFticmFja2V0c11cbiAgICAgICAgICBwYWlyczogW2JyYWNrZXRzXVxuICAgICAgICAgICggbXVsdGlcbiAgICAgICAgICAgIGxpbmUgKVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgJ2NhbmNlbGxhdGlvbicsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAoYXxiYykgZGVmXG4gICAgICAgICAgKGchaGkpIGprbFxuICAgICAgICAgIChtfG5vKSBwcXJcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ3N1cnJvdW5kIGNhbmNlbGxhdGlvbicsIC0+XG4gICAgICAgIGl0IFwiW25vcm1hbF0ga2VlcCBtdWx0cGN1cnNvciBvbiBzdXJyb3VuZCBjYW5jZWxcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IHMgZXNjYXBlXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAoYXxiYykgZGVmXG4gICAgICAgICAgICAoZyFoaSkgamtsXG4gICAgICAgICAgICAobXxubykgcHFyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcblxuICAgICAgICBpdCBcIlt2aXN1YWxdIGtlZXAgbXVsdHBjdXJzb3Igb24gc3Vycm91bmQgY2FuY2VsXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwidlwiLFxuICAgICAgICAgICAgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKGFifGMpIGRlZlxuICAgICAgICAgICAgKGdoIWkpIGprbFxuICAgICAgICAgICAgKG1ufG8pIHBxclxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJiXCIsIFwiaFwiLCBcIm5cIl1cbiAgICAgICAgICBlbnN1cmVXYWl0IFwiUyBlc2NhcGVcIixcbiAgICAgICAgICAgIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChhYnxjKSBkZWZcbiAgICAgICAgICAgIChnaCFpKSBqa2xcbiAgICAgICAgICAgIChtbnxvKSBwcXJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiYlwiLCBcImhcIiwgXCJuXCJdXG5cbiAgICAgIGRlc2NyaWJlICdkZWxldGUtc3Vycm91bmQgY2FuY2VsbGF0aW9uJywgLT5cbiAgICAgICAgaXQgXCJbZnJvbSBub3JtYWxdIGtlZXAgbXVsdHBjdXJzb3Igb24gY2FuY2VsXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiZCBTIGVzY2FwZVwiLFxuICAgICAgICAgICAgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKGF8YmMpIGRlZlxuICAgICAgICAgICAgKGchaGkpIGprbFxuICAgICAgICAgICAgKG18bm8pIHBxclxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlICdjaGFuZ2Utc3Vycm91bmQgY2FuY2VsbGF0aW9uJywgLT5cbiAgICAgICAgaXQgXCJbZnJvbSBub3JtYWxdIGtlZXAgbXVsdHBjdXJzb3Igb24gY2FuY2VsIG9mIDFzdCBpbnB1dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImMgUyBlc2NhcGVcIiwgIyBPbiBjaG9vc2luZyBkZWxldGluZyBwYWlyLWNoYXJcbiAgICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChhfGJjKSBkZWZcbiAgICAgICAgICAgIChnIWhpKSBqa2xcbiAgICAgICAgICAgIChtfG5vKSBwcXJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltmcm9tIG5vcm1hbF0ga2VlcCBtdWx0cGN1cnNvciBvbiBjYW5jZWwgb2YgMm5kIGlucHV0XCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwiYyBTIChcIixcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIihhYmMpXCIsIFwiKGdoaSlcIiwgXCIobW5vKVwiXSAjIGVhcmx5IHNlbGVjdChmb3IgYmV0dGVyIFVYKSBlZmZlY3QuXG5cbiAgICAgICAgICBlbnN1cmVXYWl0IFwiZXNjYXBlXCIsICMgT24gY2hvb3NpbmcgZGVsZXRpbmcgcGFpci1jaGFyXG4gICAgICAgICAgICBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAoYXxiYykgZGVmXG4gICAgICAgICAgICAoZyFoaSkgamtsXG4gICAgICAgICAgICAobXxubykgcHFyXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ3N1cnJvdW5kLXdvcmQgY2FuY2VsbGF0aW9uJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJzdXJyb3VuZC10ZXN0XCIsXG4gICAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICAgJ3kgcyB3JzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQtd29yZCdcblxuICAgICAgICBpdCBcIltmcm9tIG5vcm1hbF0ga2VlcCBtdWx0aSBjdXJzb3Igb24gY2FuY2VsXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIFwieSBzIHdcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiYWJjXCIsIFwiZ2hpXCIsIFwibW5vXCJdICMgc2VsZWN0IHRhcmdldCBpbW1lZGlhdGVseVxuICAgICAgICAgIGVuc3VyZVdhaXQgXCJlc2NhcGVcIixcbiAgICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChhfGJjKSBkZWZcbiAgICAgICAgICAgIChnIWhpKSBqa2xcbiAgICAgICAgICAgIChtfG5vKSBwcXJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgJ2FsaWFzIGtleW1hcCBmb3Igc3Vycm91bmQsIGNoYW5nZS1zdXJyb3VuZCwgZGVsZXRlLXN1cnJvdW5kJywgLT5cbiAgICAgIGRlc2NyaWJlIFwic3Vycm91bmQgYnkgYWxpYXNlZCBjaGFyXCIsIC0+XG4gICAgICAgIGl0IFwiYzFcIiwgLT4gc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlV2FpdCAneSBzIGkgdyBiJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIGl0IFwiYzJcIiwgLT4gc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlV2FpdCAneSBzIGkgdyBCJywgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgIGl0IFwiYzNcIiwgLT4gc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlV2FpdCAneSBzIGkgdyByJywgdGV4dDogXCJbYWJjXVwiXG4gICAgICAgIGl0IFwiYzRcIiwgLT4gc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlV2FpdCAneSBzIGkgdyBhJywgdGV4dDogXCI8YWJjPlwiXG4gICAgICBkZXNjcmliZSBcImRlbGV0ZSBzdXJyb3VuZCBieSBhbGlhc2VkIGNoYXJcIiwgLT5cbiAgICAgICAgaXQgXCJjMVwiLCAtPiBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZSAnZCBTIGInLCB0ZXh0OiBcImFiY1wiXG4gICAgICAgIGl0IFwiYzJcIiwgLT4gc2V0IHRleHRDOiBcInx7YWJjfVwiOyBlbnN1cmUgJ2QgUyBCJywgdGV4dDogXCJhYmNcIlxuICAgICAgICBpdCBcImMzXCIsIC0+IHNldCB0ZXh0QzogXCJ8W2FiY11cIjsgZW5zdXJlICdkIFMgcicsIHRleHQ6IFwiYWJjXCJcbiAgICAgICAgaXQgXCJjNFwiLCAtPiBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZSAnZCBTIGEnLCB0ZXh0OiBcImFiY1wiXG4gICAgICBkZXNjcmliZSBcImNoYW5nZSBzdXJyb3VuZCBieSBhbGlhc2VkIGNoYXJcIiwgLT5cbiAgICAgICAgaXQgXCJjMVwiLCAtPiBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZVdhaXQgJ2MgUyBiIEInLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgaXQgXCJjMlwiLCAtPiBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZVdhaXQgJ2MgUyBiIHInLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgaXQgXCJjM1wiLCAtPiBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZVdhaXQgJ2MgUyBiIGEnLCB0ZXh0OiBcIjxhYmM+XCJcblxuICAgICAgICBpdCBcImM0XCIsIC0+IHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlV2FpdCAnYyBTIEIgYicsIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICBpdCBcImM1XCIsIC0+IHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlV2FpdCAnYyBTIEIgcicsIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICBpdCBcImM2XCIsIC0+IHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlV2FpdCAnYyBTIEIgYScsIHRleHQ6IFwiPGFiYz5cIlxuXG4gICAgICAgIGl0IFwiYzdcIiwgLT4gc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmVXYWl0ICdjIFMgciBiJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIGl0IFwiYzhcIiwgLT4gc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmVXYWl0ICdjIFMgciBCJywgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgIGl0IFwiYzlcIiwgLT4gc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmVXYWl0ICdjIFMgciBhJywgdGV4dDogXCI8YWJjPlwiXG5cbiAgICAgICAgaXQgXCJjMTBcIiwgLT4gc2V0IHRleHRDOiBcInw8YWJjPlwiOyBlbnN1cmVXYWl0ICdjIFMgYSBiJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIGl0IFwiYzExXCIsIC0+IHNldCB0ZXh0QzogXCJ8PGFiYz5cIjsgZW5zdXJlV2FpdCAnYyBTIGEgQicsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICBpdCBcImMxMlwiLCAtPiBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZVdhaXQgJ2MgUyBhIHInLCB0ZXh0OiBcIlthYmNdXCJcblxuICAgIGRlc2NyaWJlICdzdXJyb3VuZCcsIC0+XG4gICAgICBkZXNjcmliZSAnYmFzaWMgYmVoYXZpb3InLCAtPlxuICAgICAgICBpdCBcInN1cnJvdW5kIHRleHQgb2JqZWN0IHdpdGggKCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ3kgcyBpIHcgKCcsIHRleHRDOiBcInwoYXBwbGUpXFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgICAgZW5zdXJlV2FpdCAnaiAuJywgICAgICAgdGV4dEM6IFwiKGFwcGxlKVxcbnwocGFpcnMpOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBpdCBcInN1cnJvdW5kIHRleHQgb2JqZWN0IHdpdGggeyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ3kgcyBpIHcgeycsIHRleHRDOiBcInx7YXBwbGV9XFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgICAgZW5zdXJlV2FpdCAnaiAuJywgICAgICAgdGV4dEM6IFwie2FwcGxlfVxcbnx7cGFpcnN9OiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBpdCBcInN1cnJvdW5kIGN1cnJlbnQtbGluZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ3kgcyBzIHsnLCB0ZXh0QzogXCJ8e2FwcGxlfVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICAgIGVuc3VyZVdhaXQgJ2ogLicsICAgICB0ZXh0QzogXCJ7YXBwbGV9XFxufHtwYWlyczogW2JyYWNrZXRzXX1cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG5cbiAgICAgIGRlc2NyaWJlICdhZGp1c3RJbmRlbnRhdGlvbiB3aGVuIHN1cnJvdW5kIGxpbmV3aXNlIHRhcmdldCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBzZXRcbiAgICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKCkge1xuICAgICAgICAgICAgICAgICAgaWYgdHJ1ZSB7XG4gICAgICAgICAgICAgICAgICB8ICBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgICAgIGdyYW1tYXI6ICdzb3VyY2UuanMnXG5cbiAgICAgICAgaXQgXCJhZGp1c3RJbmRlbnRhdGlvbiBzdXJyb3VuZGVkIHRleHQgXCIsIC0+XG4gICAgICAgICAgZW5zdXJlV2FpdCAneSBzIGkgZiB7JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgZnVuY3Rpb24gaGVsbG8oKSB7XG4gICAgICAgICAgICAgIHwgIHtcbiAgICAgICAgICAgICAgICAgIGlmIHRydWUge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGRlc2NyaWJlICd3aXRoIG1vdGlvbiB3aGljaCB0YWtlcyB1c2VyLWlucHV0JywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldCB0ZXh0OiBcInMgX19fX18gZVwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBkZXNjcmliZSBcIndpdGggJ2YnIG1vdGlvblwiLCAtPlxuICAgICAgICAgIGl0IFwic3Vycm91bmQgd2l0aCAnZicgbW90aW9uXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmVXYWl0ICd5IHMgZiBlICgnLCB0ZXh0OiBcIihzIF9fX19fIGUpXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aXRoICdgJyBtb3Rpb25cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA4XSAjIHN0YXJ0IGF0IGBlYCBjaGFyXG4gICAgICAgICAgICAgIGVuc3VyZVdhaXQgJ20gYScsIG1hcms6ICdhJzogWzAsIDhdXG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICAgICAgaXQgXCJzdXJyb3VuZCB3aXRoICdgJyBtb3Rpb25cIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZVdhaXQgJ3kgcyBgIGEgKCcsIHRleHQ6IFwiKHMgX19fX18gKWVcIiwgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgZGVzY3JpYmUgJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCBzZXR0aW5nJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWyddKVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwifGFwcGxlXFxub3JhbmdlXFxubGVtbW9uXCJcblxuICAgICAgICBkZXNjcmliZSBcImNoYXIgaXMgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgaXQgXCJhZGQgYWRkaXRpb25hbCBzcGFjZSBpbnNpZGUgcGFpciBjaGFyIHdoZW4gc3Vycm91bmRcIiwgLT5cbiAgICAgICAgICAgIGVuc3VyZVdhaXQgJ3kgcyBpIHcgKCcsICAgdGV4dDogXCIoIGFwcGxlIClcXG5vcmFuZ2VcXG5sZW1tb25cIlxuICAgICAgICAgICAgZW5zdXJlV2FpdCAnaiB5IHMgaSB3IHsnLCB0ZXh0OiBcIiggYXBwbGUgKVxcbnsgb3JhbmdlIH1cXG5sZW1tb25cIlxuICAgICAgICAgICAgZW5zdXJlV2FpdCAnaiB5IHMgaSB3IFsnLCB0ZXh0OiBcIiggYXBwbGUgKVxcbnsgb3JhbmdlIH1cXG5bIGxlbW1vbiBdXCJcblxuICAgICAgICBkZXNjcmliZSBcImNoYXIgaXMgbm90IGluIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiLCAtPlxuICAgICAgICAgIGl0IFwiYWRkIGFkZGl0aW9uYWwgc3BhY2UgaW5zaWRlIHBhaXIgY2hhciB3aGVuIHN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmVXYWl0ICd5IHMgaSB3ICknLCAgIHRleHQ6IFwiKGFwcGxlKVxcbm9yYW5nZVxcbmxlbW1vblwiXG4gICAgICAgICAgICBlbnN1cmVXYWl0ICdqIHkgcyBpIHcgfScsIHRleHQ6IFwiKGFwcGxlKVxcbntvcmFuZ2V9XFxubGVtbW9uXCJcbiAgICAgICAgICAgIGVuc3VyZVdhaXQgJ2ogeSBzIGkgdyBdJywgdGV4dDogXCIoYXBwbGUpXFxue29yYW5nZX1cXG5bbGVtbW9uXVwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJpdCBkaXN0aW5jdGl2ZWx5IGhhbmRsZSBhbGlhc2VkIGtleW1hcFwiLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0IHRleHRDOiBcInxhYmNcIlxuICAgICAgICAgIGRlc2NyaWJlIFwibm9ybWFsIHBhaXItY2hhcnMgYXJlIHNldCB0byBhZGQgc3BhY2VcIiwgLT5cbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCBbJygnLCAneycsICdbJywgJzwnXSlcbiAgICAgICAgICAgIGl0IFwiYzFcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyAoJywgdGV4dDogXCIoIGFiYyApXCJcbiAgICAgICAgICAgIGl0IFwiYzJcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyBiJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgICAgICBpdCBcImMzXCIsIC0+IGVuc3VyZVdhaXQgJ3kgcyBpIHcgeycsIHRleHQ6IFwieyBhYmMgfVwiXG4gICAgICAgICAgICBpdCBcImM0XCIsIC0+IGVuc3VyZVdhaXQgJ3kgcyBpIHcgQicsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICAgICAgaXQgXCJjNVwiLCAtPiBlbnN1cmVXYWl0ICd5IHMgaSB3IFsnLCB0ZXh0OiBcIlsgYWJjIF1cIlxuICAgICAgICAgICAgaXQgXCJjNlwiLCAtPiBlbnN1cmVXYWl0ICd5IHMgaSB3IHInLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgICAgIGl0IFwiYzdcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyA8JywgdGV4dDogXCI8IGFiYyA+XCJcbiAgICAgICAgICAgIGl0IFwiYzhcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyBhJywgdGV4dDogXCI8YWJjPlwiXG4gICAgICAgICAgZGVzY3JpYmUgXCJhbGlhc2VkIHBhaXItY2hhcnMgYXJlIHNldCB0byBhZGQgc3BhY2VcIiwgLT5cbiAgICAgICAgICAgIGJlZm9yZUVhY2ggLT4gc2V0dGluZ3Muc2V0KCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCBbJ2InLCAnQicsICdyJywgJ2EnXSlcbiAgICAgICAgICAgIGl0IFwiYzFcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyAoJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgICAgICBpdCBcImMyXCIsIC0+IGVuc3VyZVdhaXQgJ3kgcyBpIHcgYicsIHRleHQ6IFwiKCBhYmMgKVwiXG4gICAgICAgICAgICBpdCBcImMzXCIsIC0+IGVuc3VyZVdhaXQgJ3kgcyBpIHcgeycsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICAgICAgaXQgXCJjNFwiLCAtPiBlbnN1cmVXYWl0ICd5IHMgaSB3IEInLCB0ZXh0OiBcInsgYWJjIH1cIlxuICAgICAgICAgICAgaXQgXCJjNVwiLCAtPiBlbnN1cmVXYWl0ICd5IHMgaSB3IFsnLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgICAgIGl0IFwiYzZcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyByJywgdGV4dDogXCJbIGFiYyBdXCJcbiAgICAgICAgICAgIGl0IFwiYzdcIiwgLT4gZW5zdXJlV2FpdCAneSBzIGkgdyA8JywgdGV4dDogXCI8YWJjPlwiXG4gICAgICAgICAgICBpdCBcImM4XCIsIC0+IGVuc3VyZVdhaXQgJ3kgcyBpIHcgYScsIHRleHQ6IFwiPCBhYmMgPlwiXG5cbiAgICBkZXNjcmliZSAnbWFwLXN1cnJvdW5kJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgICBwYWlycyB0b21hdG9cbiAgICAgICAgICAgIG9yYW5nZVxuICAgICAgICAgICAgbWlsa1xuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwibXNcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdtIHMnOiAndmltLW1vZGUtcGx1czptYXAtc3Vycm91bmQnXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgICAnbSBzJzogICd2aW0tbW9kZS1wbHVzOm1hcC1zdXJyb3VuZCdcblxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IGZvciBlYWNoIHdvcmQgaW4gdGFyZ2V0IGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmVXYWl0ICdtIHMgaSBwICgnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgKGFwcGxlKVxuICAgICAgICAgIChwYWlycykgKHRvbWF0bylcbiAgICAgICAgICAob3JhbmdlKVxuICAgICAgICAgIChtaWxrKVxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgZm9yIGVhY2ggd29yZCBpbiB0YXJnZXQgY2FzZS0yXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAxXVxuICAgICAgICBlbnN1cmVXYWl0ICdtIHMgaSBsIDwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGFwcGxlXG4gICAgICAgICAgPHxwYWlycz4gPHRvbWF0bz5cbiAgICAgICAgICBvcmFuZ2VcbiAgICAgICAgICBtaWxrXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic3Vycm91bmQgdGV4dCBmb3IgZWFjaCB3b3JkIGluIHZpc3VhbCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwic3RheU9uU2VsZWN0VGV4dE9iamVjdFwiLCB0cnVlKVxuICAgICAgICBlbnN1cmVXYWl0ICd2IGkgcCBtIHMgXCInLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIFwiYXBwbGVcIlxuICAgICAgICAgIFwicGFpcnNcIiBcInRvbWF0b1wiXG4gICAgICAgICAgXCJvcmFuZ2VcIlxuICAgICAgICAgIHxcIm1pbGtcIlxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnZGVsZXRlIHN1cnJvdW5kJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDhdXG5cbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdkIFMgWycsXG4gICAgICAgICAgdGV4dDogXCJhcHBsZVxcbnBhaXJzOiBicmFja2V0c1xcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIGwgLicsXG4gICAgICAgICAgdGV4dDogXCJhcHBsZVxcbnBhaXJzOiBicmFja2V0c1xcbnBhaXJzOiBicmFja2V0c1xcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZGVkIGNoYXJzIGV4cGFuZGVkIHRvIG11bHRpLWxpbmVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzMsIDFdXG4gICAgICAgIGVuc3VyZSAnZCBTICgnLFxuICAgICAgICAgIHRleHQ6IFwiYXBwbGVcXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuIG11bHRpXFxuICBsaW5lIFwiXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZGVkIGNoYXJzIGFuZCB0cmltIHBhZGRpbmcgc3BhY2VzIGZvciBub24taWRlbnRpY2FsIHBhaXItY2hhclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgICggYXBwbGUgKVxuICAgICAgICAgICAgeyAgb3JhbmdlICAgfVxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdkIFMgKCcsIHRleHQ6IFwiYXBwbGVcXG57ICBvcmFuZ2UgICB9XFxuXCJcbiAgICAgICAgZW5zdXJlICdqIGQgUyB7JywgdGV4dDogXCJhcHBsZVxcbm9yYW5nZVxcblwiXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZGVkIGNoYXJzIGFuZCBOT1QgdHJpbSBwYWRkaW5nIHNwYWNlcyBmb3IgaWRlbnRpY2FsIHBhaXItY2hhclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGAgYXBwbGUgYFxuICAgICAgICAgICAgXCIgIG9yYW5nZSAgIFwiXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgUyBgJywgdGV4dF86ICdfYXBwbGVfXFxuXCJfX29yYW5nZV9fX1wiXFxuJ1xuICAgICAgICBlbnN1cmUgJ2ogZCBTIFwiJywgdGV4dF86IFwiX2FwcGxlX1xcbl9fb3JhbmdlX19fXFxuXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgZm9yIG11bHRpLWxpbmUgYnV0IGRvbnQgYWZmZWN0IGNvZGUgbGF5b3V0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIGN1cnNvcjogWzAsIDM0XVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCB7XG4gICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXRcbiAgICAgICAgICAgICAgaGVsbG86IHdvcmxkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdkIFMgeycsXG4gICAgICAgICAgdGV4dDogW1xuICAgICAgICAgICAgICBcImhpZ2hsaWdodFJhbmdlcyBAZWRpdG9yLCByYW5nZSwgXCJcbiAgICAgICAgICAgICAgXCIgIHRpbWVvdXQ6IHRpbWVvdXRcIlxuICAgICAgICAgICAgICBcIiAgaGVsbG86IHdvcmxkXCJcbiAgICAgICAgICAgICAgXCJcIlxuICAgICAgICAgICAgXS5qb2luKFwiXFxuXCIpXG5cbiAgICBkZXNjcmliZSAnY2hhbmdlIHN1cnJvdW5kJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAoYXBwbGUpXG4gICAgICAgICAgICAoZ3JhcGUpXG4gICAgICAgICAgICA8bGVtbW9uPlxuICAgICAgICAgICAge29yYW5nZX1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDFdXG4gICAgICBpdCBcImNoYW5nZSBzdXJyb3VuZGVkIGNoYXJzIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZVdhaXQgJ2MgUyAoIFsnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgW2FwcGxlXVxuICAgICAgICAgICAgKGdyYXBlKVxuICAgICAgICAgICAgPGxlbW1vbj5cbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlV2FpdCAnaiBsIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgW2FwcGxlXVxuICAgICAgICAgICAgW2dyYXBlXVxuICAgICAgICAgICAgPGxlbW1vbj5cbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kZWQgY2hhcnNcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAnaiBqIGMgUyA8IFwiJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIFwibGVtbW9uXCJcbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlV2FpdCAnaiBsIGMgUyB7ICEnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgKGFwcGxlKVxuICAgICAgICAgICAgKGdyYXBlKVxuICAgICAgICAgICAgXCJsZW1tb25cIlxuICAgICAgICAgICAgIW9yYW5nZSFcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImNoYW5nZSBzdXJyb3VuZGVkIGZvciBtdWx0aS1saW5lIGJ1dCBkb250IGFmZmVjdCBjb2RlIGxheW91dFwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICBjdXJzb3I6IFswLCAzNF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGhpZ2hsaWdodFJhbmdlcyBAZWRpdG9yLCByYW5nZSwge1xuICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0XG4gICAgICAgICAgICAgIGhlbGxvOiB3b3JsZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZVdhaXQgJ2MgUyB7ICgnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCAoXG4gICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXRcbiAgICAgICAgICAgICAgaGVsbG86IHdvcmxkXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCBzZXR0aW5nJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWyddKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIGlucHV0IGNoYXIgaXMgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgLT5cbiAgICAgICAgICBkZXNjcmliZSAnW3NpbmdsZSBsaW5lIHRleHRdIGFkZCBzaW5nbGUgc3BhY2UgYXJvdW5kIHBhaXIgcmVnYXJkbGVzcyBvZiBleHNpdGluZyBpbm5lciB0ZXh0JywgLT5cbiAgICAgICAgICAgIGl0IFwiY2FzZTFcIiwgLT4gc2V0IHRleHRDOiBcInwoYXBwbGUpXCI7ICAgICBlbnN1cmVXYWl0ICdjIFMgKCB7JywgdGV4dDogXCJ7IGFwcGxlIH1cIlxuICAgICAgICAgICAgaXQgXCJjYXNlMlwiLCAtPiBzZXQgdGV4dEM6IFwifCggYXBwbGUgKVwiOyAgIGVuc3VyZVdhaXQgJ2MgUyAoIHsnLCB0ZXh0OiBcInsgYXBwbGUgfVwiXG4gICAgICAgICAgICBpdCBcImNhc2UzXCIsIC0+IHNldCB0ZXh0QzogXCJ8KCAgYXBwbGUgIClcIjsgZW5zdXJlV2FpdCAnYyBTICggeycsIHRleHQ6IFwieyBhcHBsZSB9XCJcblxuICAgICAgICAgIGRlc2NyaWJlIFwiW211bHRpIGxpbmUgdGV4dF0gZG9uJ3QgYWRkIHNpbmdsZSBzcGFjZSBhcm91bmQgcGFpclwiLCAtPlxuICAgICAgICAgICAgaXQgXCJkb24ndCBhZGQgc2luZ2xlIHNwYWNlIGFyb3VuZCBwYWlyXCIsIC0+XG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8KFxcbmFwcGxlXFxuKVwiOyBlbnN1cmVXYWl0IFwiYyBTICgge1wiLCB0ZXh0OiBcIntcXG5hcHBsZVxcbn1cIlxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIGZpcnN0IGlucHV0IGNoYXIgaXMgbm90IGluIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCcsIC0+XG4gICAgICAgICAgZGVzY3JpYmUgXCJyZW1vdmUgc3Vycm91bmRpbmcgc3BhY2Ugb2YgaW5uZXIgdGV4dCBmb3IgaWRlbnRpY2FsIHBhaXItY2hhclwiLCAtPlxuICAgICAgICAgICAgaXQgXCJjYXNlMVwiLCAtPiBzZXQgdGV4dEM6IFwifChhcHBsZSlcIjsgICAgIGVuc3VyZVdhaXQgXCJjIFMgKCB9XCIsIHRleHQ6IFwie2FwcGxlfVwiXG4gICAgICAgICAgICBpdCBcImNhc2UyXCIsIC0+IHNldCB0ZXh0QzogXCJ8KCBhcHBsZSApXCI7ICAgZW5zdXJlV2FpdCBcImMgUyAoIH1cIiwgdGV4dDogXCJ7YXBwbGV9XCJcbiAgICAgICAgICAgIGl0IFwiY2FzZTNcIiwgLT4gc2V0IHRleHRDOiBcInwoICBhcHBsZSAgKVwiOyBlbnN1cmVXYWl0IFwiYyBTICggfVwiLCB0ZXh0OiBcInthcHBsZX1cIlxuICAgICAgICAgIGRlc2NyaWJlIFwiZG9lc24ndCByZW1vdmUgc3Vycm91bmRpbmcgc3BhY2Ugb2YgaW5uZXIgdGV4dCBmb3Igbm9uLWlkZW50aWNhbCBwYWlyLWNoYXJcIiwgLT5cbiAgICAgICAgICAgIGl0IFwiY2FzZTFcIiwgLT4gc2V0IHRleHRDOiAnfFwiYXBwbGVcIic7ICAgICBlbnN1cmVXYWl0ICdjIFMgXCIgYCcsIHRleHQ6IFwiYGFwcGxlYFwiXG4gICAgICAgICAgICBpdCBcImNhc2UyXCIsIC0+IHNldCB0ZXh0QzogJ3xcIiAgYXBwbGUgIFwiJzsgZW5zdXJlV2FpdCAnYyBTIFwiIGAnLCB0ZXh0OiBcImAgIGFwcGxlICBgXCJcbiAgICAgICAgICAgIGl0IFwiY2FzZTNcIiwgLT4gc2V0IHRleHRDOiAnfFwiICBhcHBsZSAgXCInOyBlbnN1cmVXYWl0ICdjIFMgXCIgXFwnJywgdGV4dDogXCInICBhcHBsZSAgJ1wiXG5cbiAgICBkZXNjcmliZSAnc3Vycm91bmQtd29yZCcsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJzdXJyb3VuZC10ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgICAneSBzIHcnOiAndmltLW1vZGUtcGx1czpzdXJyb3VuZC13b3JkJ1xuXG4gICAgICBpdCBcInN1cnJvdW5kIGEgd29yZCB3aXRoICggYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAneSBzIHcgKCcsIHRleHRDOiBcInwoYXBwbGUpXFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZVdhaXQgJ2ogLicsICAgICB0ZXh0QzogXCIoYXBwbGUpXFxufChwYWlycyk6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICBpdCBcInN1cnJvdW5kIGEgd29yZCB3aXRoIHsgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAneSBzIHcgeycsIHRleHRDOiBcInx7YXBwbGV9XFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZVdhaXQgJ2ogLicsICAgICB0ZXh0QzogXCJ7YXBwbGV9XFxufHtwYWlyc306IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG5cbiAgICBkZXNjcmliZSAnZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgYXBwbGVcbiAgICAgICAgICAgIChwYWlyczogW3xicmFja2V0c10pXG4gICAgICAgICAgICB7cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cbiAgICAgICAgICAgICggbXVsdGlcbiAgICAgICAgICAgICAgbGluZSApXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBhbnkgcGFpciBmb3VuZCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgcycsIHRleHQ6ICdhcHBsZVxcbihwYWlyczogYnJhY2tldHMpXFxue3BhaXJzIFwic1wiIFticmFja2V0c119XFxuKCBtdWx0aVxcbiAgbGluZSApJ1xuICAgICAgICBlbnN1cmUgJy4nLCAgIHRleHQ6ICdhcHBsZVxcbnBhaXJzOiBicmFja2V0c1xcbntwYWlycyBcInNcIiBbYnJhY2tldHNdfVxcbiggbXVsdGlcXG4gIGxpbmUgKSdcblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBhbnkgcGFpciBmb3VuZCB3aXRoIHNraXAgcGFpciBvdXQgb2YgY3Vyc29yIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCAxNF1cbiAgICAgICAgZW5zdXJlICdkIHMnLCB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IFticmFja2V0c10pXFxue3BhaXJzIFwic1wiIGJyYWNrZXRzfVxcbiggbXVsdGlcXG4gIGxpbmUgKSdcbiAgICAgICAgZW5zdXJlICcuJywgICB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IFticmFja2V0c10pXFxucGFpcnMgXCJzXCIgYnJhY2tldHNcXG4oIG11bHRpXFxuICBsaW5lICknXG4gICAgICAgIGVuc3VyZSAnLicsICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBbYnJhY2tldHNdKVxcbnBhaXJzIFwic1wiIGJyYWNrZXRzXFxuKCBtdWx0aVxcbiAgbGluZSApJyAjIGRvIG5vdGhpbmcgYW55IG1vcmVcblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBjaGFycyBleHBhbmRlZCB0byBtdWx0aS1saW5lXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAxXVxuICAgICAgICBlbnN1cmUgJ2QgcycsIHRleHQ6ICdhcHBsZVxcbihwYWlyczogW2JyYWNrZXRzXSlcXG57cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cXG4gbXVsdGlcXG4gIGxpbmUgJ1xuXG4gICAgZGVzY3JpYmUgJ2RlbGV0ZS1zdXJyb3VuZC1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImtleW1hcHMtZm9yLXN1cnJvdW5kXCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgICAnZCBzJzogJ3ZpbS1tb2RlLXBsdXM6ZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnXG5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuXG4gICAgICBpdCBcIlsxXSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXyhpbm5lcilcbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZCBzJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fX2lubmVyXG4gICAgICAgICAgX19fKGlubmVyKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIF9fX2lubmVyXG4gICAgICAgICAgfF9fX2lubmVyXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKHxhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY2hhbmdlIGFueSBzdXJyb3VuZGVkIHBhaXIgZm91bmQgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAnYyBzIDwnLCB0ZXh0QzogXCJ8PGFwcGxlPlxcbihncmFwZSlcXG48bGVtbW9uPlxcbntvcmFuZ2V9XCJcbiAgICAgICAgZW5zdXJlV2FpdCAnaiAuJywgICB0ZXh0QzogXCI8YXBwbGU+XFxufDxncmFwZT5cXG48bGVtbW9uPlxcbntvcmFuZ2V9XCJcbiAgICAgICAgZW5zdXJlV2FpdCAnMiBqIC4nLCB0ZXh0QzogXCI8YXBwbGU+XFxuPGdyYXBlPlxcbjxsZW1tb24+XFxufDxvcmFuZ2U+XCJcblxuICAgIGRlc2NyaWJlICdjaGFuZ2Utc3Vycm91bmQtYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZycsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJrZXltYXBzLWZvci1zdXJyb3VuZFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICAgJ2Mgcyc6ICd2aW0tbW9kZS1wbHVzOmNoYW5nZS1zdXJyb3VuZC1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJ1xuICAgICAgICBzZXR0aW5ncy5zZXQoJ3N0YXlPblRyYW5zZm9ybVN0cmluZycsIHRydWUpXG4gICAgICBpdCBcIlsxXSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXyhpbm5lcilcbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZVdhaXQgJ2MgcyA8JyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXzxpbm5lcj5cbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZVdhaXQgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIF9fXzxpbm5lcj5cbiAgICAgICAgICB8X19fPGlubmVyPlxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICdSZXBsYWNlV2l0aFJlZ2lzdGVyJywgLT5cbiAgICBvcmlnaW5hbFRleHQgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ18nOiAndmltLW1vZGUtcGx1czpyZXBsYWNlLXdpdGgtcmVnaXN0ZXInXG5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgYWJjIGRlZiAnYWFhJ1xuICAgICAgaGVyZSAocGFyZW50aGVzaXMpXG4gICAgICBoZXJlIChwYXJlbnRoZXNpcylcbiAgICAgIFwiXCJcIlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dFxuICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdkZWZhdWx0IHJlZ2lzdGVyJywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG4gICAgICBzZXQgcmVnaXN0ZXI6ICdhJzogdGV4dDogJ0EgcmVnaXN0ZXInLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgIGl0IFwicmVwbGFjZSBzZWxlY3Rpb24gd2l0aCByZWdpc2d0ZXIncyBjb250ZW50XCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgaSB3JyxcbiAgICAgICAgc2VsZWN0ZWRUZXh0OiAnYWFhJ1xuICAgICAgZW5zdXJlICdfJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJ2FhYScsICdkZWZhdWx0IHJlZ2lzdGVyJylcblxuICAgIGl0IFwicmVwbGFjZSB0ZXh0IG9iamVjdCB3aXRoIHJlZ2lzZ3RlcidzIGNvbnRlbnRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCA2XVxuICAgICAgZW5zdXJlICdfIGkgKCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCdwYXJlbnRoZXNpcycsICdkZWZhdWx0IHJlZ2lzdGVyJylcblxuICAgIGl0IFwiY2FuIHJlcGVhdFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ18gaSAoIGogLicsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKC9wYXJlbnRoZXNpcy9nLCAnZGVmYXVsdCByZWdpc3RlcicpXG5cbiAgICBpdCBcImNhbiB1c2Ugc3BlY2lmaWVkIHJlZ2lzdGVyIHRvIHJlcGxhY2Ugd2l0aFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ1wiIGEgXyBpICgnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgncGFyZW50aGVzaXMnLCAnQSByZWdpc3RlcicpXG5cbiAgZGVzY3JpYmUgJ1N3YXBXaXRoUmVnaXN0ZXInLCAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBwJzogJ3ZpbS1tb2RlLXBsdXM6c3dhcC13aXRoLXJlZ2lzdGVyJ1xuXG4gICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgIGFiYyBkZWYgJ2FhYSdcbiAgICAgIGhlcmUgKDExMSlcbiAgICAgIGhlcmUgKDIyMilcbiAgICAgIFwiXCJcIlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dFxuICAgICAgICBjdXJzb3I6IFswLCA5XVxuXG4gICAgICBzZXQgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICdkZWZhdWx0IHJlZ2lzdGVyJywgdHlwZTogJ2NoYXJhY3Rlcndpc2UnXG4gICAgICBzZXQgcmVnaXN0ZXI6ICdhJzogdGV4dDogJ0EgcmVnaXN0ZXInLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcblxuICAgIGl0IFwic3dhcCBzZWxlY3Rpb24gd2l0aCByZWdpc2d0ZXIncyBjb250ZW50XCIsIC0+XG4gICAgICBlbnN1cmUgJ3YgaSB3Jywgc2VsZWN0ZWRUZXh0OiAnYWFhJ1xuICAgICAgZW5zdXJlICdnIHAnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgnYWFhJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2FhYSdcblxuICAgIGl0IFwic3dhcCB0ZXh0IG9iamVjdCB3aXRoIHJlZ2lzZ3RlcidzIGNvbnRlbnRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCA2XVxuICAgICAgZW5zdXJlICdnIHAgaSAoJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJzExMScsICdkZWZhdWx0IHJlZ2lzdGVyJylcbiAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcxMTEnXG5cbiAgICBpdCBcImNhbiByZXBlYXRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCA2XVxuICAgICAgdXBkYXRlZFRleHQgPSBcIlwiXCJcbiAgICAgICAgYWJjIGRlZiAnYWFhJ1xuICAgICAgICBoZXJlIChkZWZhdWx0IHJlZ2lzdGVyKVxuICAgICAgICBoZXJlICgxMTEpXG4gICAgICAgIFwiXCJcIlxuICAgICAgZW5zdXJlICdnIHAgaSAoIGogLicsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IHVwZGF0ZWRUZXh0XG4gICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnMjIyJ1xuXG4gICAgaXQgXCJjYW4gdXNlIHNwZWNpZmllZCByZWdpc3RlciB0byBzd2FwIHdpdGhcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsxLCA2XVxuICAgICAgZW5zdXJlICdcIiBhIGcgcCBpICgnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgnMTExJywgJ0EgcmVnaXN0ZXInKVxuICAgICAgICByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnMTExJ1xuXG4gIGRlc2NyaWJlIFwiSm9pbiBhbmQgaXQncyBmYW1pbHlcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgX18wfDEyXG4gICAgICAgIF9fMzQ1XG4gICAgICAgIF9fNjc4XG4gICAgICAgIF9fOWFiXFxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJKb2luXCIsIC0+XG4gICAgICBpdCBcImpvaW5zIGxpbmVzIHdpdGggdHJpbWluZyBsZWFkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlICdKJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyfCAzNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMiAzNDV8IDY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMiAzNDUgNjc4fCA5YWJcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wMTIgMzQ1fCA2NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wMTJ8IDM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMlxuICAgICAgICAgIF9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImpvaW5zIGRvIG5vdGhpbmcgd2hlbiBpdCBjYW5ub3Qgam9pbiBhbnkgbW9yZVwiLCAtPlxuICAgICAgICAjIEZJWE1FOiBcIlxcblwiIHJlbWFpbiBpdCdzIGluY29uc2lzdGVudCB3aXRoIG11bHRpLXRpbWUgSlxuICAgICAgICBlbnN1cmUgJzEgMCAwIEonLCB0ZXh0Q186IFwiICAwMTIgMzQ1IDY3OCA5YXxiXFxuXCJcblxuICAgICAgaXQgXCJqb2lucyBkbyBub3RoaW5nIHdoZW4gaXQgY2Fubm90IGpvaW4gYW55IG1vcmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdKIEogSicsIHRleHRDXzogXCIgIDAxMiAzNDUgNjc4fCA5YWJcXG5cIlxuICAgICAgICBlbnN1cmUgJ0onLCB0ZXh0Q186IFwiICAwMTIgMzQ1IDY3OCA5YXxiXCJcbiAgICAgICAgZW5zdXJlICdKJywgdGV4dENfOiBcIiAgMDEyIDM0NSA2NzggOWF8YlwiXG5cbiAgICBkZXNjcmliZSBcIkpvaW5XaXRoS2VlcGluZ1NwYWNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnZyBKJzogJ3ZpbS1tb2RlLXBsdXM6am9pbi13aXRoLWtlZXBpbmctc3BhY2UnXG5cbiAgICAgIGl0IFwiam9pbnMgbGluZXMgd2l0aG91dCB0cmltaW5nIGxlYWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgSicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJfXzM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMl9fMzQ1X182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UgdScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJcbiAgICAgICAgICBfXzM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICc0IGcgSicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTJfXzM0NV9fNjc4X185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiSm9pbkJ5SW5wdXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdnIEonOiAndmltLW1vZGUtcGx1czpqb2luLWJ5LWlucHV0J1xuXG4gICAgICBpdCBcImpvaW5zIGxpbmVzIGJ5IGNoYXIgZnJvbSB1c2VyIHdpdGggdHJpbWluZyBsZWFkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAnZyBKIDogOiBlbnRlcicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6OjM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlV2FpdCAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6OjM0NTo6Njc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlV2FpdCAndSB1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMlxuICAgICAgICAgIF9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmVXYWl0ICc0IGcgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjozNDU6OjY3ODo6OWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwia2VlcCBtdWx0aS1jdXJzb3JzIG9uIGNhbmNlbFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCIgIDB8MTJcXG4gIDM0NVxcbiAgNiE3OFxcbiAgOWFiXFxuICBjfGRlXFxuICBmZ2hcXG5cIlxuICAgICAgICBlbnN1cmVXYWl0IFwiZyBKIDogZXNjYXBlXCIsIHRleHRDOiBcIiAgMHwxMlxcbiAgMzQ1XFxuICA2ITc4XFxuICA5YWJcXG4gIGN8ZGVcXG4gIGZnaFxcblwiXG5cbiAgICBkZXNjcmliZSBcIkpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZVwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgSic6ICd2aW0tbW9kZS1wbHVzOmpvaW4tYnktaW5wdXQtd2l0aC1rZWVwaW5nLXNwYWNlJ1xuXG4gICAgICBpdCBcImpvaW5zIGxpbmVzIGJ5IGNoYXIgZnJvbSB1c2VyIHdpdGhvdXQgdHJpbWluZyBsZWFkaW5nIHdoaXRlc3BhY2VcIiwgLT5cbiAgICAgICAgZW5zdXJlV2FpdCAnZyBKIDogOiBlbnRlcicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6Ol9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmVXYWl0ICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6X18zNDU6Ol9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlV2FpdCAndSB1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMlxuICAgICAgICAgIF9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmVXYWl0ICc0IGcgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjpfXzM0NTo6X182Nzg6Ol9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ1RvZ2dsZUxpbmVDb21tZW50cycsIC0+XG4gICAgW29sZEdyYW1tYXIsIG9yaWdpbmFsVGV4dF0gPSBbXVxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtY29mZmVlLXNjcmlwdCcpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgb2xkR3JhbW1hciA9IGVkaXRvci5nZXRHcmFtbWFyKClcbiAgICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmNvZmZlZScpXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGdyYW1tYXIpXG4gICAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAgIGNsYXNzIEJhc2VcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoYXJncykgLT5cbiAgICAgICAgICAgICAgcGl2b3QgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgICAgICAgIGxlZnQgPSBbXVxuICAgICAgICAgICAgICByaWdodCA9IFtdXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcImhlbGxvXCJcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIHNldCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgIGFmdGVyRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldEdyYW1tYXIob2xkR3JhbW1hcilcblxuICAgIGl0ICd0b2dnbGUgY29tbWVudCBmb3IgdGV4dG9iamVjdCBmb3IgaW5kZW50IGFuZCByZXBlYXRhYmxlJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZW5zdXJlICdnIC8gaSBpJyxcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgY2xhc3MgQmFzZVxuICAgICAgICAgICAgY29uc3RydWN0b3I6IChhcmdzKSAtPlxuICAgICAgICAgICAgICAjIHBpdm90ID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICAgICAgICAjIGxlZnQgPSBbXVxuICAgICAgICAgICAgICAjIHJpZ2h0ID0gW11cblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiaGVsbG9cIlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gICAgaXQgJ3RvZ2dsZSBjb21tZW50IGZvciB0ZXh0b2JqZWN0IGZvciBwYXJhZ3JhcGggYW5kIHJlcGVhdGFibGUnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICBlbnN1cmUgJ2cgLyBpIHAnLFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAjIGNsYXNzIEJhc2VcbiAgICAgICAgICAjICAgY29uc3RydWN0b3I6IChhcmdzKSAtPlxuICAgICAgICAgICMgICAgIHBpdm90ID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICAgICMgICAgIGxlZnQgPSBbXVxuICAgICAgICAgICMgICAgIHJpZ2h0ID0gW11cblxuICAgICAgICAgIGNvbnNvbGUubG9nIFwiaGVsbG9cIlxuICAgICAgICBcIlwiXCJcblxuICAgICAgZW5zdXJlICcuJywgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgZGVzY3JpYmUgXCJTcGxpdFN0cmluZywgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgLyc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LXN0cmluZydcbiAgICAgICAgICAnZyA/JzogJ3ZpbS1tb2RlLXBsdXM6c3BsaXQtc3RyaW5nLXdpdGgta2VlcGluZy1zcGxpdHRlcidcbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIHxhOmI6Y1xuICAgICAgICBkOmU6ZlxcblxuICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcIlNwbGl0U3RyaW5nXCIsIC0+XG4gICAgICBpdCBcInNwbGl0IHN0cmluZyBpbnRvIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZVdhaXQgXCJnIC8gOiBlbnRlclwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8YVxuICAgICAgICAgIGJcbiAgICAgICAgICBjXG4gICAgICAgICAgZDplOmZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlV2FpdCBcIkcgLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICBhXG4gICAgICAgICAgYlxuICAgICAgICAgIGNcbiAgICAgICAgICB8ZFxuICAgICAgICAgIGVcbiAgICAgICAgICBmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIltmcm9tIG5vcm1hbF0ga2VlcCBtdWx0aS1jdXJzb3JzIG9uIGNhbmNlbFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0Q186IFwiICAwfDEyICAzNDUgIDYhNzggIDlhYiAgY3xkZSAgZmdoXCJcbiAgICAgICAgZW5zdXJlV2FpdCBcImcgLyA6IGVzY2FwZVwiLCB0ZXh0Q186IFwiICAwfDEyICAzNDUgIDYhNzggIDlhYiAgY3xkZSAgZmdoXCJcbiAgICAgIGl0IFwiW2Zyb20gdmlzdWFsXSBrZWVwIG11bHRpLWN1cnNvcnMgb24gY2FuY2VsXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCIgIDB8MTIgIDM0NSAgNiE3OCAgOWFiICBjfGRlICBmZ2hcIlxuICAgICAgICBlbnN1cmUgXCJ2XCIsICAgICAgICAgICAgICB0ZXh0QzogXCIgIDAxfDIgIDM0NSAgNjchOCAgOWFiICBjZHxlICBmZ2hcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMVwiLCBcIjdcIiwgXCJkXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgIGVuc3VyZVdhaXQgXCJnIC8gZXNjYXBlXCIsIHRleHRDOiBcIiAgMDF8MiAgMzQ1ICA2NyE4ICA5YWIgIGNkfGUgIGZnaFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIxXCIsIFwiN1wiLCBcImRcIl0sIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cblxuICAgIGRlc2NyaWJlIFwiU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyXCIsIC0+XG4gICAgICBpdCBcInNwbGl0IHN0cmluZyBpbnRvIGxpbmVzIHdpdGhvdXQgcmVtb3Zpbmcgc3BsaXRlciBjaGFyXCIsIC0+XG4gICAgICAgIGVuc3VyZVdhaXQgXCJnID8gOiBlbnRlclwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8YTpcbiAgICAgICAgICBiOlxuICAgICAgICAgIGNcbiAgICAgICAgICBkOmU6ZlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmVXYWl0IFwiRyAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGE6XG4gICAgICAgICAgYjpcbiAgICAgICAgICBjXG4gICAgICAgICAgfGQ6XG4gICAgICAgICAgZTpcbiAgICAgICAgICBmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImtlZXAgbXVsdGktY3Vyc29ycyBvbiBjYW5jZWxcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgICAgICAgICAgdGV4dENfOiBcIiAgMHwxMiAgMzQ1ICA2ITc4ICA5YWIgIGN8ZGUgIGZnaFwiXG4gICAgICAgIGVuc3VyZVdhaXQgXCJnID8gOiBlc2NhcGVcIiwgdGV4dENfOiBcIiAgMHwxMiAgMzQ1ICA2ITc4ICA5YWIgIGN8ZGUgIGZnaFwiXG4gICAgICBpdCBcIltmcm9tIHZpc3VhbF0ga2VlcCBtdWx0aS1jdXJzb3JzIG9uIGNhbmNlbFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgICAgdGV4dEM6IFwiICAwfDEyICAzNDUgIDYhNzggIDlhYiAgY3xkZSAgZmdoXCJcbiAgICAgICAgZW5zdXJlIFwidlwiLCAgICAgICAgICAgICAgdGV4dEM6IFwiICAwMXwyICAzNDUgIDY3ITggIDlhYiAgY2R8ZSAgZmdoXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjFcIiwgXCI3XCIsIFwiZFwiXSwgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuICAgICAgICBlbnN1cmVXYWl0IFwiZyA/IGVzY2FwZVwiLCB0ZXh0QzogXCIgIDAxfDIgIDM0NSAgNjchOCAgOWFiICBjZHxlICBmZ2hcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMVwiLCBcIjdcIiwgXCJkXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG5cbiAgZGVzY3JpYmUgXCJTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgLCc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LWFyZ3VtZW50cydcbiAgICAgICAgICAnZyAhJzogJ3ZpbS1tb2RlLXBsdXM6c3BsaXQtYXJndW1lbnRzLXdpdGgtcmVtb3ZlLXNlcGFyYXRvcidcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB7ZjEsIGYyLCBmM30gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxKGYyKDEsIFwiYSwgYiwgY1wiKSwgMiwgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKSlcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJTcGxpdEFyZ3VtZW50c1wiLCAtPlxuICAgICAgaXQgXCJzcGxpdCBieSBjb21tbWEgd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgLCBpIHsnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB8e1xuICAgICAgICAgICAgICAgIGYxLFxuICAgICAgICAgICAgICAgIGYyLFxuICAgICAgICAgICAgICAgIGYzXG4gICAgICAgICAgICAgIH0gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxKGYyKDEsIFwiYSwgYiwgY1wiKSwgMiwgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKSlcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJzcGxpdCBieSBjb21tbWEgd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgICAgICBlbnN1cmUgJ2cgLCBpICgnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB7ZjEsIGYyLCBmM30gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxfChcbiAgICAgICAgICAgICAgICBmMigxLCBcImEsIGIsIGNcIiksXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgICAoYXJnKSA9PiBjb25zb2xlLmxvZyhhcmcpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogdydcbiAgICAgICAgZW5zdXJlICdnICwgaSAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShcbiAgICAgICAgICAgICAgICBmMnwoXG4gICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgXCJhLCBiLCBjXCJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHMgPSBgYWJjIGRlZiBoaWpgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic3BsaXQgYnkgd2hpdGUtc3BhY2Ugd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAxMF1cbiAgICAgICAgZW5zdXJlICdnICwgaSBgJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICAgIHMgPSB8YFxuICAgICAgICAgICAgICBhYmNcbiAgICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICAgIGhpalxuICAgICAgICAgICAgICBgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiU3BsaXRCeUFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGl0IFwicmVtb3ZlIHNwbGl0dGVyIHdoZW4gc3BsaXRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZyAhIGkgeycsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgfHtcbiAgICAgICAgICAgICAgZjFcbiAgICAgICAgICAgICAgZjJcbiAgICAgICAgICAgICAgZjNcbiAgICAgICAgICAgIH0gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICBzID0gYGFiYyBkZWYgaGlqYFxuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIkNoYW5nZSBPcmRlciBmYWltbGl5OiBSZXZlcnNlLCBTb3J0LCBTb3J0Q2FzZUluc2Vuc2l0aXZlbHksIFNvcnRCeU51bWJlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHInOiAndmltLW1vZGUtcGx1czpyZXZlcnNlJ1xuICAgICAgICAgICdnIHMnOiAndmltLW1vZGUtcGx1czpzb3J0J1xuICAgICAgICAgICdnIFMnOiAndmltLW1vZGUtcGx1czpzb3J0LWJ5LW51bWJlcidcbiAgICBkZXNjcmliZSBcImNoYXJhY3Rlcndpc2UgdGFyZ2V0XCIsIC0+XG4gICAgICBkZXNjcmliZSBcIlJldmVyc2VcIiwgLT5cbiAgICAgICAgaXQgXCJbY29tbWEgc2VwYXJhdGVkXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiICAgKCBkb2csIGNhfHQsIGZpc2gsIHJhYmJpdCwgZHVjaywgZ29waGVyLCBzcXVpZCApXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLCB0ZXh0Q186IFwiICAgKHwgc3F1aWQsIGdvcGhlciwgZHVjaywgcmFiYml0LCBmaXNoLCBjYXQsIGRvZyApXCJcbiAgICAgICAgaXQgXCJbY29tbWEgc3BhcmF0ZWRdIHJldmVyc2UgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoICdkb2cgY2F8dCcsICdmaXNoIHJhYmJpdCcsICdkdWNrIGdvcGhlciBzcXVpZCcgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSAoJywgdGV4dENfOiBcIiAgICh8ICdkdWNrIGdvcGhlciBzcXVpZCcsICdmaXNoIHJhYmJpdCcsICdkb2cgY2F0JyApXCJcbiAgICAgICAgaXQgXCJbc3BhY2Ugc3BhcmF0ZWRdIHJldmVyc2UgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoIGRvZyBjYXx0IGZpc2ggcmFiYml0IGR1Y2sgZ29waGVyIHNxdWlkIClcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsIHRleHRDXzogXCIgICAofCBzcXVpZCBnb3BoZXIgZHVjayByYWJiaXQgZmlzaCBjYXQgZG9nIClcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8MSwgMiwgMywgNCxcbiAgICAgICAgICAgICAgNSwgNixcbiAgICAgICAgICAgICAgNyxcbiAgICAgICAgICAgICAgOCwgOVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSB7JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIHwgIDksIDgsIDcsIDYsXG4gICAgICAgICAgICAgIDUsIDQsXG4gICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgIDIsIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSBrZWVwIGNvbW1hIGZvbGxvd2VkIHRvIGxhc3QgZW50cnlcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB8MSwgMiwgMywgNCxcbiAgICAgICAgICAgICAgNSwgNixcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgWycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICB8ICA2LCA1LCA0LCAzLFxuICAgICAgICAgICAgICAyLCAxLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2NvbW1hIHNwYXJhdGVkIG11bHRpLWxpbmVdIGF3YXJlIG9mIG5leHRlZCBwYWlyIGFuZCBxdW90ZXMgYW5kIGVzY2FwZWQgcXVvdGVcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICB8XCIoYSwgYiwgYylcIiwgXCJbKCBkIGUgZlwiLCB0ZXN0KGcsIGgsIGkpLFxuICAgICAgICAgICAgICBcIlxcXFxcImosIGssIGxcIixcbiAgICAgICAgICAgICAgJ1xcXFwnbSwgbicsIHRlc3QobywgcCksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgfCAgdGVzdChvLCBwKSwgJ1xcXFwnbSwgbicsIFwiXFxcXFwiaiwgaywgbFwiLFxuICAgICAgICAgICAgICB0ZXN0KGcsIGgsIGkpLFxuICAgICAgICAgICAgICBcIlsoIGQgZSBmXCIsIFwiKGEsIGIsIGMpXCIsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbc3BhY2Ugc3BhcmF0ZWQgbXVsdGktbGluZV0gYXdhcmUgb2YgbmV4dGVkIHBhaXIgYW5kIHF1b3RlcyBhbmQgZXNjYXBlZCBxdW90ZVwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICB8XCIoYSwgYiwgYylcIiBcIlsoIGQgZSBmXCIgICAgICB0ZXN0KGcsIGgsIGkpXG4gICAgICAgICAgICAgIFwiXFxcXFwiaiwgaywgbFwiX19fXG4gICAgICAgICAgICAgICdcXFxcJ20sIG4nICAgIHRlc3QobywgcClcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgfCAgdGVzdChvLCBwKSAnXFxcXCdtLCBuJyAgICAgIFwiXFxcXFwiaiwgaywgbFwiXG4gICAgICAgICAgICAgIHRlc3QoZywgaCwgaSlfX19cbiAgICAgICAgICAgICAgXCJbKCBkIGUgZlwiICAgIFwiKGEsIGIsIGMpXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0XCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gc29ydCB0ZXh0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIiAgICggZG9nLCBjYXx0LCBmaXNoLCByYWJiaXQsIGR1Y2ssIGdvcGhlciwgc3F1aWQgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHMgaSAoJywgdGV4dEM6IFwiICAgKHwgY2F0LCBkb2csIGR1Y2ssIGZpc2gsIGdvcGhlciwgcmFiYml0LCBzcXVpZCApXCJcbiAgICAgIGRlc2NyaWJlIFwiU29ydEJ5TnVtYmVyXCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gc29ydCBieSBudW1iZXJcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dENfOiBcIl9fXyg5LCAxLCB8MTAsIDUpXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgUyBpICgnLCB0ZXh0Q186IFwiX19fKHwxLCA1LCA5LCAxMClcIlxuXG4gICAgZGVzY3JpYmUgXCJsaW5ld2lzZSB0YXJnZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHx6XG5cbiAgICAgICAgICAxMGFcbiAgICAgICAgICBiXG4gICAgICAgICAgYVxuXG4gICAgICAgICAgNVxuICAgICAgICAgIDFcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiUmV2ZXJzZVwiLCAtPlxuICAgICAgICBpdCBcInJldmVyc2Ugcm93c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyByIEcnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfDFcbiAgICAgICAgICAgIDVcblxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgMTBhXG5cbiAgICAgICAgICAgIHpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0XCIsIC0+XG4gICAgICAgIGl0IFwic29ydCByb3dzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIHMgRycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8XG5cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIDEwYVxuICAgICAgICAgICAgNVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgelxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRCeU51bWJlclwiLCAtPlxuICAgICAgICBpdCBcInNvcnQgcm93cyBudW1lcmljYWxseVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgUyBHXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MVxuICAgICAgICAgICAgNVxuICAgICAgICAgICAgMTBhXG4gICAgICAgICAgICB6XG5cbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRDYXNlSW5zZW5zaXRpdmVseVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgICAnZyBzJzogJ3ZpbS1tb2RlLXBsdXM6c29ydC1jYXNlLWluc2Vuc2l0aXZlbHknXG4gICAgICAgIGl0IFwiU29ydCByb3dzIGNhc2UtaW5zZW5zaXRpdmVseVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgICBCZWVmXG4gICAgICAgICAgICBBUFBMRVxuICAgICAgICAgICAgRE9HXG4gICAgICAgICAgICBiZWVmXG4gICAgICAgICAgICBBcHBsZVxuICAgICAgICAgICAgQkVFRlxuICAgICAgICAgICAgRG9nXG4gICAgICAgICAgICBkb2dcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZyBzIEdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYXBwbGVcbiAgICAgICAgICAgIEFwcGxlXG4gICAgICAgICAgICBBUFBMRVxuICAgICAgICAgICAgYmVlZlxuICAgICAgICAgICAgQmVlZlxuICAgICAgICAgICAgQkVFRlxuICAgICAgICAgICAgZG9nXG4gICAgICAgICAgICBEb2dcbiAgICAgICAgICAgIERPR1xcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJOdW1iZXJpbmdMaW5lc1wiLCAtPlxuICAgIGVuc3VyZU51bWJlcmluZyA9IChhcmdzLi4uKSAtPlxuICAgICAgZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOm51bWJlcmluZy1saW5lcycpXG4gICAgICBlbnN1cmUgYXJncy4uLlxuXG4gICAgYmVmb3JlRWFjaCAtPiBzZXQgdGV4dEM6IFwifGFcXG5iXFxuY1xcblxcblwiXG4gICAgaXQgXCJudW1iZXJpbmcgYnkgbW90aW9uXCIsIC0+ICAgICBlbnN1cmVOdW1iZXJpbmcgXCJqXCIsIHRleHRDOiBcInwxOiBhXFxuMjogYlxcbmNcXG5cXG5cIlxuICAgIGl0IFwibnVtYmVyaW5nIGJ5IHRleHQtb2JqZWN0XCIsIC0+IGVuc3VyZU51bWJlcmluZyBcInBcIiwgdGV4dEM6IFwifDE6IGFcXG4yOiBiXFxuMzogY1xcblxcblwiXG5cbiAgZGVzY3JpYmUgXCJEdXBsaWNhdGVXaXRoQ29tbWVudE91dE9yaWdpbmFsXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAxOiB8UGVuXG4gICAgICAgIDI6IFBpbmVhcHBsZVxuXG4gICAgICAgIDQ6IEFwcGxlXG4gICAgICAgIDU6IFBlblxcblxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwiZHVwLWFuZC1jb21tZW50b3V0XCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKS50aGVuIC0+XG4gICAgICAgICAgc2V0IGdyYW1tYXI6IFwic291cmNlLmpzXCJcbiAgICAgICAgICBkaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6ZHVwbGljYXRlLXdpdGgtY29tbWVudC1vdXQtb3JpZ2luYWwnKVxuICAgICAgICAgIGVuc3VyZSBcImkgcFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICAvLyAxOiBQZW5cbiAgICAgICAgICAgIC8vIDI6IFBpbmVhcHBsZVxuICAgICAgICAgICAgMTogfFBlblxuICAgICAgICAgICAgMjogUGluZWFwcGxlXG5cbiAgICAgICAgICAgIDQ6IEFwcGxlXG4gICAgICAgICAgICA1OiBQZW5cXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgcnVucyAtPlxuICAgICAgICBlbnN1cmUgXCIuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgLy8gLy8gMTogUGVuXG4gICAgICAgICAgLy8gLy8gMjogUGluZWFwcGxlXG4gICAgICAgICAgLy8gMTogUGVuXG4gICAgICAgICAgLy8gMjogUGluZWFwcGxlXG4gICAgICAgICAgLy8gMTogUGVuXG4gICAgICAgICAgLy8gMjogUGluZWFwcGxlXG4gICAgICAgICAgMTogfFBlblxuICAgICAgICAgIDI6IFBpbmVhcHBsZVxuXG4gICAgICAgICAgNDogQXBwbGVcbiAgICAgICAgICA1OiBQZW5cXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICBpdCBcImR1cC1hbmQtY29tbWVudG91dFwiLCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1ydWJ5JykudGhlbiAtPlxuICAgICAgICAgIHNldCBncmFtbWFyOiBcInNvdXJjZS5ydWJ5XCJcbiAgICAgICAgICBkaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ3ZpbS1tb2RlLXBsdXM6ZHVwbGljYXRlLXdpdGgtY29tbWVudC1vdXQtb3JpZ2luYWwnKVxuICAgICAgICAgIGVuc3VyZSBcImkgcFwiLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgICAjIDE6IFBlblxuICAgICAgICAgICAgIyAyOiBQaW5lYXBwbGVcbiAgICAgICAgICAgIDE6IHxQZW5cbiAgICAgICAgICAgIDI6IFBpbmVhcHBsZVxuXG4gICAgICAgICAgICA0OiBBcHBsZVxuICAgICAgICAgICAgNTogUGVuXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZW5zdXJlIFwiLlwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICMgIyAxOiBQZW5cbiAgICAgICAgICAjICMgMjogUGluZWFwcGxlXG4gICAgICAgICAgIyAxOiBQZW5cbiAgICAgICAgICAjIDI6IFBpbmVhcHBsZVxuICAgICAgICAgICMgMTogUGVuXG4gICAgICAgICAgIyAyOiBQaW5lYXBwbGVcbiAgICAgICAgICAxOiB8UGVuXG4gICAgICAgICAgMjogUGluZWFwcGxlXG5cbiAgICAgICAgICA0OiBBcHBsZVxuICAgICAgICAgIDU6IFBlblxcblxuICAgICAgICAgIFwiXCJcIlxuIl19
