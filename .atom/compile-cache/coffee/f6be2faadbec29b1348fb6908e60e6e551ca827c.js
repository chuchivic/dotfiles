(function() {
  var dispatch, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator TransformString", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
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
            return keystroke('= =');
          });
          return it("indents the current line", function() {
            return expect(editor.indentationForBufferRow(1)).toBe(0);
          });
        });
        return describe("when followed by a repeating =", function() {
          beforeEach(function() {
            return keystroke('2 = =');
          });
          it("autoindents multiple lines at once", function() {
            return ensure({
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
    describe('surround', function() {
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
            return ensure("S escape", {
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
            return ensure("escape", {
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
          return it("[from normal] keep multpcursor on cancel", function() {
            ensure("y s w", {
              selectedTextOrdered: ["abc", "ghi", "mno"]
            });
            return ensure("escape", {
              mode: "normal",
              textC: "(a|bc) def\n(g!hi) jkl\n(m|no) pqr\n"
            });
          });
        });
      });
      describe('alias keymap for surround, change-surround, delete-surround', function() {
        it("surround by aliased char", function() {
          set({
            textC: "|abc"
          });
          ensure('y s i w b', {
            text: "(abc)"
          });
          set({
            textC: "|abc"
          });
          ensure('y s i w B', {
            text: "{abc}"
          });
          set({
            textC: "|abc"
          });
          ensure('y s i w r', {
            text: "[abc]"
          });
          set({
            textC: "|abc"
          });
          return ensure('y s i w a', {
            text: "<abc>"
          });
        });
        it("delete surround by aliased char", function() {
          set({
            textC: "|(abc)"
          });
          ensure('d S b', {
            text: "abc"
          });
          set({
            textC: "|{abc}"
          });
          ensure('d S B', {
            text: "abc"
          });
          set({
            textC: "|[abc]"
          });
          ensure('d S r', {
            text: "abc"
          });
          set({
            textC: "|<abc>"
          });
          return ensure('d S a', {
            text: "abc"
          });
        });
        return it("change surround by aliased char", function() {
          set({
            textC: "|(abc)"
          });
          ensure('c S b B', {
            text: "{abc}"
          });
          set({
            textC: "|(abc)"
          });
          ensure('c S b r', {
            text: "[abc]"
          });
          set({
            textC: "|(abc)"
          });
          ensure('c S b a', {
            text: "<abc>"
          });
          set({
            textC: "|{abc}"
          });
          ensure('c S B b', {
            text: "(abc)"
          });
          set({
            textC: "|{abc}"
          });
          ensure('c S B r', {
            text: "[abc]"
          });
          set({
            textC: "|{abc}"
          });
          ensure('c S B a', {
            text: "<abc>"
          });
          set({
            textC: "|[abc]"
          });
          ensure('c S r b', {
            text: "(abc)"
          });
          set({
            textC: "|[abc]"
          });
          ensure('c S r B', {
            text: "{abc}"
          });
          set({
            textC: "|[abc]"
          });
          ensure('c S r a', {
            text: "<abc>"
          });
          set({
            textC: "|<abc>"
          });
          ensure('c S a b', {
            text: "(abc)"
          });
          set({
            textC: "|<abc>"
          });
          ensure('c S a B', {
            text: "{abc}"
          });
          set({
            textC: "|<abc>"
          });
          return ensure('c S a r', {
            text: "[abc]"
          });
        });
      });
      describe('surround', function() {
        it("surround text object with ( and repeatable", function() {
          ensure('y s i w (', {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            text: "(apple)\n(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround text object with { and repeatable", function() {
          ensure('y s i w {', {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "{apple}\n|{pairs}: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        it("surround current-line", function() {
          ensure('y s s {', {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "{apple}\n|{pairs: [brackets]}\npairs: [brackets]\n( multi\n  line )"
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
            return ensure('y s i f {', {
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
              return ensure('y s f e (', {
                text: "(s _____ e)",
                cursor: [0, 0]
              });
            });
          });
          return describe("with '`' motion", function() {
            beforeEach(function() {
              set({
                cursor: [0, 8]
              });
              ensure('m a', {
                mark: {
                  'a': [0, 8]
                }
              });
              return set({
                cursor: [0, 0]
              });
            });
            return it("surround with '`' motion", function() {
              return ensure('y s ` a (', {
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
              ensure('y s i w (', {
                text: "( apple )\norange\nlemmon"
              });
              keystroke('j');
              ensure('y s i w {', {
                text: "( apple )\n{ orange }\nlemmon"
              });
              keystroke('j');
              return ensure('y s i w [', {
                text: "( apple )\n{ orange }\n[ lemmon ]"
              });
            });
          });
          describe("char is not in charactersToAddSpaceOnSurround", function() {
            return it("add additional space inside pair char when surround", function() {
              ensure('y s i w )', {
                text: "(apple)\norange\nlemmon"
              });
              keystroke('j');
              ensure('y s i w }', {
                text: "(apple)\n{orange}\nlemmon"
              });
              keystroke('j');
              return ensure('y s i w ]', {
                text: "(apple)\n{orange}\n[lemmon]"
              });
            });
          });
          return describe("it distinctively handle aliased keymap", function() {
            describe("normal pair-chars are set to add space", function() {
              beforeEach(function() {
                return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[', '<']);
              });
              return it("distinctively handle", function() {
                set({
                  textC: "|abc"
                });
                ensure('y s i w (', {
                  text: "( abc )"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w b', {
                  text: "(abc)"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w {', {
                  text: "{ abc }"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w B', {
                  text: "{abc}"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w [', {
                  text: "[ abc ]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w r', {
                  text: "[abc]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w <', {
                  text: "< abc >"
                });
                set({
                  textC: "|abc"
                });
                return ensure('y s i w a', {
                  text: "<abc>"
                });
              });
            });
            return describe("aliased pair-chars are set to add space", function() {
              beforeEach(function() {
                return settings.set('charactersToAddSpaceOnSurround', ['b', 'B', 'r', 'a']);
              });
              return it("distinctively handle", function() {
                set({
                  textC: "|abc"
                });
                ensure('y s i w (', {
                  text: "(abc)"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w b', {
                  text: "( abc )"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w {', {
                  text: "{abc}"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w B', {
                  text: "{ abc }"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w [', {
                  text: "[abc]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w r', {
                  text: "[ abc ]"
                });
                set({
                  textC: "|abc"
                });
                ensure('y s i w <', {
                  text: "<abc>"
                });
                set({
                  textC: "|abc"
                });
                return ensure('y s i w a', {
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
          return ensure('m s i p (', {
            textC: "\n|(apple)\n(pairs) (tomato)\n(orange)\n(milk)\n"
          });
        });
        it("surround text for each word in target case-2", function() {
          set({
            cursor: [2, 1]
          });
          return ensure('m s i l <', {
            textC: "\napple\n<|pairs> <tomato>\norange\nmilk\n"
          });
        });
        return it("surround text for each word in visual selection", function() {
          settings.set("stayOnSelectTextObject", true);
          return ensure('v i p m s "', {
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
          ensure('c S ( [', {
            text: "[apple]\n(grape)\n<lemmon>\n{orange}"
          });
          return ensure('j l .', {
            text: "[apple]\n[grape]\n<lemmon>\n{orange}"
          });
        });
        it("change surrounded chars", function() {
          ensure('j j c S < "', {
            text: "(apple)\n(grape)\n\"lemmon\"\n{orange}"
          });
          return ensure('j l c S { !', {
            text: "(apple)\n(grape)\n\"lemmon\"\n!orange!"
          });
        });
        it("change surrounded for multi-line but dont affect code layout", function() {
          set({
            cursor: [0, 34],
            text: "highlightRanges @editor, range, {\n  timeout: timeout\n  hello: world\n}"
          });
          return ensure('c S { (', {
            text: "highlightRanges @editor, range, (\n  timeout: timeout\n  hello: world\n)"
          });
        });
        return describe('charactersToAddSpaceOnSurround setting', function() {
          beforeEach(function() {
            return settings.set('charactersToAddSpaceOnSurround', ['(', '{', '[']);
          });
          describe('when input char is in charactersToAddSpaceOnSurround', function() {
            describe('single line text', function() {
              return it("add single space around pair regardless of exsiting inner text", function() {
                set({
                  textC: "|(apple)"
                });
                ensure('c S ( {', {
                  text: "{ apple }"
                });
                set({
                  textC: "|( apple )"
                });
                ensure('c S ( {', {
                  text: "{ apple }"
                });
                set({
                  textC: "|(  apple  )"
                });
                return ensure('c S ( {', {
                  text: "{ apple }"
                });
              });
            });
            return describe('multi line text', function() {
              return it("don't sadd single space around pair", function() {
                set({
                  textC: "|(\napple\n)"
                });
                return ensure("c S ( {", {
                  text: "{\napple\n}"
                });
              });
            });
          });
          return describe('when first input char is not in charactersToAddSpaceOnSurround', function() {
            it("remove surrounding space of inner text for identical pair-char", function() {
              set({
                textC: "|(apple)"
              });
              ensure("c S ( }", {
                text: "{apple}"
              });
              set({
                textC: "|( apple )"
              });
              ensure("c S ( }", {
                text: "{apple}"
              });
              set({
                textC: "|(  apple  )"
              });
              return ensure("c S ( }", {
                text: "{apple}"
              });
            });
            return it("doesn't remove surrounding space of inner text for non-identical pair-char", function() {
              set({
                textC: '|"apple"'
              });
              ensure('c S " `', {
                text: "`apple`"
              });
              set({
                textC: '|"  apple  "'
              });
              ensure('c S " `', {
                text: "`  apple  `"
              });
              set({
                textC: '|"  apple  "'
              });
              return ensure('c S " \'', {
                text: "'  apple  '"
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
          ensure('y s w (', {
            textC: "|(apple)\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
            textC: "(apple)\n|(pairs): [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
        });
        return it("surround a word with { and repeatable", function() {
          ensure('y s w {', {
            textC: "|{apple}\npairs: [brackets]\npairs: [brackets]\n( multi\n  line )"
          });
          return ensure('j .', {
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
          ensure('c s <', {
            textC: "|<apple>\n(grape)\n<lemmon>\n{orange}"
          });
          ensure('j .', {
            textC: "<apple>\n|<grape>\n<lemmon>\n{orange}"
          });
          return ensure('j j .', {
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
          ensure('c s <', {
            textC: "|___<inner>\n___(inner)"
          });
          return ensure('j .', {
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
          ensure('g J : : enter', {
            textC_: "__0|12::345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__0|12::345::678\n__9ab\n"
          });
          ensure('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensure('4 g J : : enter', {
            textC_: "__0|12::345::678::9ab\n"
          });
        });
        return it("keep multi-cursors on cancel", function() {
          set({
            textC: "  0|12\n  345\n  6!78\n  9ab\n  c|de\n  fgh\n"
          });
          return ensure("g J : escape", {
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
          ensure('g J : : enter', {
            textC_: "__0|12::__345\n__678\n__9ab\n"
          });
          ensure('.', {
            textC_: "__0|12::__345::__678\n__9ab\n"
          });
          ensure('u u', {
            textC_: "__0|12\n__345\n__678\n__9ab\n"
          });
          return ensure('4 g J : : enter', {
            textC_: "__0|12::__345::__678::__9ab\n"
          });
        });
      });
    });
    describe('ToggleLineComments', function() {
      var oldGrammar, originalText, ref2;
      ref2 = [], oldGrammar = ref2[0], originalText = ref2[1];
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
          ensure("g / : enter", {
            textC: "|a\nb\nc\nd:e:f\n"
          });
          return ensure("G .", {
            textC: "a\nb\nc\n|d\ne\nf\n"
          });
        });
        it("[from normal] keep multi-cursors on cancel", function() {
          set({
            textC_: "  0|12  345  6!78  9ab  c|de  fgh"
          });
          return ensure("g / : escape", {
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
          return ensure("g / escape", {
            textC: "  01|2  345  67!8  9ab  cd|e  fgh",
            selectedTextOrdered: ["1", "7", "d"],
            mode: ["visual", "characterwise"]
          });
        });
      });
      return describe("SplitStringWithKeepingSplitter", function() {
        it("split string into lines without removing spliter char", function() {
          ensure("g ? : enter", {
            textC: "|a:\nb:\nc\nd:e:f\n"
          });
          return ensure("G .", {
            textC: "a:\nb:\nc\n|d:\ne:\nf\n"
          });
        });
        it("keep multi-cursors on cancel", function() {
          set({
            textC_: "  0|12  345  6!78  9ab  c|de  fgh"
          });
          return ensure("g ? : escape", {
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
          return ensure("g ? escape", {
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
          keystroke('j w');
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
    return describe("NumberingLines", function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLXRyYW5zZm9ybS1zdHJpbmctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9DQUFBO0lBQUE7O0VBQUEsTUFBMEIsT0FBQSxDQUFRLGVBQVIsQ0FBMUIsRUFBQyw2QkFBRCxFQUFjOztFQUNkLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUE7QUFDbkMsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFEUyxDQUFYO0lBTUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7TUFDM0IsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxLQUFBLEVBQU8sWUFBUDtTQURGO01BRFMsQ0FBWDtNQU9BLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBO1FBQ3JDLE1BQUEsQ0FBTyxHQUFQLEVBQ0U7VUFBQSxLQUFBLEVBQU8sWUFBUDtTQURGO1FBS0EsTUFBQSxDQUFPLEdBQVAsRUFDRTtVQUFBLEtBQUEsRUFBTyxZQUFQO1NBREY7ZUFNQSxNQUFBLENBQVEsR0FBUixFQUNFO1VBQUEsS0FBQSxFQUFPLFlBQVA7U0FERjtNQVpxQyxDQUF2QztNQWtCQSxFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO2VBQ2xCLE1BQUEsQ0FBTyxLQUFQLEVBQ0U7VUFBQSxL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Q0FBNUI7UUFEdUIsQ0FBekI7ZUFhQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTtVQUNoQyxVQUFBLENBQVcsU0FBQTttQkFDVCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFDRTtjQUFBLGtEQUFBLEVBQ0U7Z0JBQUEsS0FBQSxFQUFPLHVDQUFQO2VBREY7YUFERjtVQURTLENBQVg7aUJBSUEsRUFBQSxDQUFHLDhCQUFILEVBQW1DLFNBQUE7WUFDakMsR0FBQSxDQUNFO2NBQUEsS0FBQSxFQUFPLHlEQUFQO2FBREY7bUJBYUEsTUFBQSxDQUFPLE9BQVAsRUFDRTtjQUFBLElBQUEsRUFBTSx3REFBTjthQURGO1VBZGlDLENBQW5DO1FBTGdDLENBQWxDO01BcEQwQixDQUE1QjtJQTNGbUYsQ0FBckY7V0ErS0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7QUFDekIsVUFBQTtNQUFBLGVBQUEsR0FBa0IsU0FBQTtBQUNoQixZQUFBO1FBRGlCO1FBQ2pCLFFBQUEsQ0FBUyxNQUFNLENBQUMsT0FBaEIsRUFBeUIsK0JBQXpCO2VBQ0EsTUFBQSxhQUFPLElBQVA7TUFGZ0I7TUFJbEIsVUFBQSxDQUFXLFNBQUE7ZUFBRyxHQUFBLENBQUk7VUFBQSxLQUFBLEVBQU8sY0FBUDtTQUFKO01BQUgsQ0FBWDtNQUNBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBO2VBQU8sZUFBQSxDQUFnQixHQUFoQixFQUFxQjtVQUFBLEtBQUEsRUFBTyxvQkFBUDtTQUFyQjtNQUFQLENBQTFCO2FBQ0EsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUE7ZUFBRyxlQUFBLENBQWdCLEdBQWhCLEVBQXFCO1VBQUEsS0FBQSxFQUFPLHVCQUFQO1NBQXJCO01BQUgsQ0FBL0I7SUFQeUIsQ0FBM0I7RUF6d0RtQyxDQUFyQztBQUhBIiwic291cmNlc0NvbnRlbnQiOlsie2dldFZpbVN0YXRlLCBkaXNwYXRjaH0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgVHJhbnNmb3JtU3RyaW5nXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgZGVzY3JpYmUgJ3RoZSB+IGtleWJpbmRpbmcnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIHxhQmNcbiAgICAgICAgfFh5WlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0ICd0b2dnbGVzIHRoZSBjYXNlIGFuZCBtb3ZlcyByaWdodCcsIC0+XG4gICAgICBlbnN1cmUgJ34nLFxuICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgIEF8QmNcbiAgICAgICAgeHx5WlxuICAgICAgICBcIlwiXCJcbiAgICAgIGVuc3VyZSAnficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQWJ8Y1xuICAgICAgICB4WXxaXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBlbnN1cmUgICd+JyxcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICBBYnxDXG4gICAgICAgIHhZfHpcbiAgICAgICAgXCJcIlwiXG5cbiAgICBpdCAndGFrZXMgYSBjb3VudCcsIC0+XG4gICAgICBlbnN1cmUgJzQgficsXG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgQWJ8Q1xuICAgICAgICB4WXx6XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZVwiLCAtPlxuICAgICAgaXQgXCJ0b2dnbGVzIHRoZSBjYXNlIG9mIHRoZSBzZWxlY3RlZCB0ZXh0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ1YgficsIHRleHQ6ICdBYkNcXG5YeVonXG5cbiAgICBkZXNjcmliZSBcIndpdGggZyBhbmQgbW90aW9uXCIsIC0+XG4gICAgICBpdCBcInRvZ2dsZXMgdGhlIGNhc2Ugb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxhQmNcXG5YeVpcIlxuICAgICAgICBlbnN1cmUgJ2cgfiAyIGwnLCB0ZXh0QzogJ3xBYmNcXG5YeVonXG5cbiAgICAgIGl0IFwiZ35+IHRvZ2dsZXMgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcImF8QmNcXG5YeVpcIlxuICAgICAgICBlbnN1cmUgJ2cgfiB+JywgdGV4dEM6ICdBfGJDXFxuWHlaJ1xuXG4gICAgICBpdCBcImd+Z34gdG9nZ2xlcyB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwiYXxCY1xcblh5WlwiXG4gICAgICAgIGVuc3VyZSAnZyB+IGcgficsIHRleHRDOiAnQXxiQ1xcblh5WidcblxuICBkZXNjcmliZSAndGhlIFUga2V5YmluZGluZycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICdhQmNcXG5YeVonXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRleHQgdXBwZXJjYXNlIHdpdGggZyBhbmQgbW90aW9uLCBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBVIGwnLCB0ZXh0OiAnQUJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnZyBVIGUnLCB0ZXh0OiAnQUJDXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIHNldCBjdXJzb3I6IFsxLCAwXVxuICAgICAgZW5zdXJlICdnIFUgJCcsIHRleHQ6ICdBQkNcXG5YWVonLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJtYWtlcyB0aGUgc2VsZWN0ZWQgdGV4dCB1cHBlcmNhc2UgaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnViBVJywgdGV4dDogJ0FCQ1xcblh5WidcblxuICAgIGl0IFwiZ1VVIHVwY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgVSBVJywgdGV4dDogJ0FCQ1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImdVZ1UgdXBjYXNlIHRoZSBsaW5lIG9mIHRleHQsIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGVuc3VyZSAnZyBVIGcgVScsIHRleHQ6ICdBQkNcXG5YeVonLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlICd0aGUgdSBrZXliaW5kaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXQgdGV4dDogJ2FCY1xcblh5WicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcIm1ha2VzIHRleHQgbG93ZXJjYXNlIHdpdGggZyBhbmQgbW90aW9uLCBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyB1ICQnLCB0ZXh0OiAnYWJjXFxuWHlaJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwibWFrZXMgdGhlIHNlbGVjdGVkIHRleHQgbG93ZXJjYXNlIGluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgdScsIHRleHQ6ICdhYmNcXG5YeVonXG5cbiAgICBpdCBcImd1dSBkb3duY2FzZSB0aGUgbGluZSBvZiB0ZXh0LCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICBlbnN1cmUgJ2cgdSB1JywgdGV4dDogJ2FiY1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgICBpdCBcImd1Z3UgZG93bmNhc2UgdGhlIGxpbmUgb2YgdGV4dCwgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgZW5zdXJlICdnIHUgZyB1JywgdGV4dDogJ2FiY1xcblh5WicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgXCJ0aGUgPiBrZXliaW5kaW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiXCJcIlxuICAgICAgICAxMjM0NVxuICAgICAgICBhYmNkZVxuICAgICAgICBBQkNERVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiPiA+XCIsIC0+XG4gICAgICBkZXNjcmliZSBcImZyb20gZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICBpdCBcImluZGVudHMgdGhlIGN1cnJlbnQgbGluZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnPiA+JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgICBhYmNkZVxuICAgICAgICAgICAgQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImNvdW50IG1lYW5zIE4gbGluZSBpbmRlbnRzIGFuZCB1bmRvYWJsZSwgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSAnMyA+ID4nLFxuICAgICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgICBfX0FCQ0RFXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICBBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmUgJy4gLicsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgX19fX3wxMjM0NVxuICAgICAgICAgICAgX19fX2FiY2RlXG4gICAgICAgICAgICBfX19fQUJDREVcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSBcImZyb20gbGFzdCBsaW5lXCIsIC0+XG4gICAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDBdXG4gICAgICAgICAgZW5zdXJlICc+ID4nLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgICAgIHxBQkNERVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImluIHZpc3VhbCBtb2RlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuXG4gICAgICBpdCBcIlt2Q10gaW5kZW50IHNlbGVjdGVkIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcInYgaiA+XCIsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9ffDEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIlt2TF0gaW5kZW50IHNlbGVjdGVkIGxpbmVzXCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIlYgPlwiLFxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX3wxMjM0NVxuICAgICAgICAgIGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fX198MTIzNDVcbiAgICAgICAgICBhYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcIlt2TF0gY291bnQgbWVhbnMgTiB0aW1lcyBpbmRlbnRcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiViAzID5cIixcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX19fX19fX19fX19ffDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbiB2aXN1YWwgbW9kZSBhbmQgc3RheU9uVHJhbnNmb3JtU3RyaW5nIGVuYWJsZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBhbmQgZXhpdHMgdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGogPicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwid2hlbiByZXBlYXRlZCwgb3BlcmF0ZSBvbiBzYW1lIHJhbmdlIHdoZW4gY3Vyc29yIHdhcyBub3QgbW92ZWRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2IGogPicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgICAgfGFiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwid2hlbiByZXBlYXRlZCwgb3BlcmF0ZSBvbiByZWxhdGl2ZSByYW5nZSBmcm9tIGN1cnNvciBwb3NpdGlvbiB3aXRoIHNhbWUgZXh0ZW50IHdoZW4gY3Vyc29yIHdhcyBtb3ZlZFwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YgaiA+JyxcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICB8YWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2wgLicsXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMTIzNDVcbiAgICAgICAgICBfX19fYXxiY2RlXG4gICAgICAgICAgX19BQkNERVxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwidGhlIDwga2V5YmluZGluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICB8X18xMjM0NVxuICAgICAgICBfX2FiY2RlXG4gICAgICAgIEFCQ0RFXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGZvbGxvd2VkIGJ5IGEgPFwiLCAtPlxuICAgICAgaXQgXCJpbmRlbnRzIHRoZSBjdXJyZW50IGxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlICc8IDwnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZm9sbG93ZWQgYnkgYSByZXBlYXRpbmcgPFwiLCAtPlxuICAgICAgaXQgXCJpbmRlbnRzIG11bHRpcGxlIGxpbmVzIGF0IG9uY2UgYW5kIHVuZG9hYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnMiA8IDwnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfDEyMzQ1XG4gICAgICAgICAgYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgfF9fMTIzNDVcbiAgICAgICAgICBfX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiaW4gdmlzdWFsIG1vZGVcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICB8X19fX19fMTIzNDVcbiAgICAgICAgICBfX19fX19hYmNkZVxuICAgICAgICAgIEFCQ0RFXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY291bnQgbWVhbnMgTiB0aW1lcyBvdXRkZW50XCIsIC0+XG4gICAgICAgIGVuc3VyZSAnViBqIDIgPCcsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfX3wxMjM0NVxuICAgICAgICAgIF9fYWJjZGVcbiAgICAgICAgICBBQkNERVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAjIFRoaXMgaXMgbm90IGlkZWFsIGN1cnNvciBwb3NpdGlvbiwgYnV0IGN1cnJlbnQgbGltaXRhdGlvbi5cbiAgICAgICAgIyBTaW5jZSBpbmRlbnQgZGVwZW5kaW5nIG9uIEF0b20ncyBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcbiAgICAgICAgIyBJbXBsZW1lbnRpbmcgaXQgdm1wIGluZGVwZW5kZW50bHkgc29sdmUgaXNzdWUsIGJ1dCBJIGhhdmUgYW5vdGhlciBpZGVhIGFuZCB3YW50IHRvIHVzZSBBdG9tJ3Mgb25lIG5vdy5cbiAgICAgICAgZW5zdXJlICd1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fX19fXzEyMzQ1XG4gICAgICAgICAgfF9fX19fX2FiY2RlXG4gICAgICAgICAgQUJDREVcbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcInRoZSA9IGtleWJpbmRpbmdcIiwgLT5cbiAgICBvbGRHcmFtbWFyID0gW11cblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpXG5cbiAgICAgIG9sZEdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgICBzZXQgdGV4dDogXCJmb29cXG4gIGJhclxcbiAgYmF6XCIsIGN1cnNvcjogWzEsIDBdXG5cblxuICAgIGRlc2NyaWJlIFwid2hlbiB1c2VkIGluIGEgc2NvcGUgdGhhdCBzdXBwb3J0cyBhdXRvLWluZGVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBqc0dyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5qcycpXG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGpzR3JhbW1hcilcblxuICAgICAgYWZ0ZXJFYWNoIC0+XG4gICAgICAgIGVkaXRvci5zZXRHcmFtbWFyKG9sZEdyYW1tYXIpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhID1cIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGtleXN0cm9rZSAnPSA9J1xuXG4gICAgICAgIGl0IFwiaW5kZW50cyB0aGUgY3VycmVudCBsaW5lXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdygxKSkudG9CZSAwXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBmb2xsb3dlZCBieSBhIHJlcGVhdGluZyA9XCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBrZXlzdHJva2UgJzIgPSA9J1xuXG4gICAgICAgIGl0IFwiYXV0b2luZGVudHMgbXVsdGlwbGUgbGluZXMgYXQgb25jZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSB0ZXh0OiBcImZvb1xcbmJhclxcbmJhelwiLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgICAgIGRlc2NyaWJlIFwidW5kbyBiZWhhdmlvclwiLCAtPlxuICAgICAgICAgIGl0IFwiaW5kZW50cyBib3RoIGxpbmVzXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3UnLCB0ZXh0OiBcImZvb1xcbiAgYmFyXFxuICBiYXpcIlxuXG4gIGRlc2NyaWJlICdDYW1lbENhc2UnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiAndmltLW1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gdGV4dCBieSBtb3Rpb24gYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyBDICQnLCB0ZXh0OiAndmltTW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdqIC4nLCB0ZXh0OiAndmltTW9kZVxcbmF0b21UZXh0RWRpdG9yXFxuJywgY3Vyc29yOiBbMSwgMF1cblxuICAgIGl0IFwidHJhbnNmb3JtIHNlbGVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdWIGogZyBDJywgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tVGV4dEVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInJlcGVhdGluZyB0d2ljZSB3b3JrcyBvbiBjdXJyZW50LWxpbmUgYW5kIHdvbid0IG1vdmUgY3Vyc29yXCIsIC0+XG4gICAgICBlbnN1cmUgJ2wgZyBDIGcgQycsIHRleHQ6ICd2aW1Nb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ1Bhc2NhbENhc2UnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIEMnOiAndmltLW1vZGUtcGx1czpwYXNjYWwtY2FzZSdcblxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSB0ZXh0IGJ5IG1vdGlvbiBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgZW5zdXJlICdnIEMgJCcsIHRleHQ6ICdWaW1Nb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6ICdWaW1Nb2RlXFxuQXRvbVRleHRFZGl0b3JcXG4nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gc2VsZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBnIEMnLCB0ZXh0OiAnVmltTW9kZVxcbmF0b21UZXh0RWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0aW5nIHR3aWNlIHdvcmtzIG9uIGN1cnJlbnQtbGluZSBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnbCBnIEMgZyBDJywgdGV4dDogJ1ZpbU1vZGVcXG5hdG9tLXRleHQtZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSAnU25ha2VDYXNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbidcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJnX1wiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBfJzogJ3ZpbS1tb2RlLXBsdXM6c25ha2UtY2FzZSdcblxuICAgIGl0IFwidHJhbnNmb3JtIHRleHQgYnkgbW90aW9uIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICBlbnN1cmUgJ2cgXyAkJywgdGV4dDogJ3ZpbV9tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2ogLicsIHRleHQ6ICd2aW1fbW9kZVxcbmF0b21fdGV4dF9lZGl0b3JcXG4nLCBjdXJzb3I6IFsxLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gc2VsZWN0aW9uXCIsIC0+XG4gICAgICBlbnN1cmUgJ1YgaiBnIF8nLCB0ZXh0OiAndmltX21vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwicmVwZWF0aW5nIHR3aWNlIHdvcmtzIG9uIGN1cnJlbnQtbGluZSBhbmQgd29uJ3QgbW92ZSBjdXJzb3JcIiwgLT5cbiAgICAgIGVuc3VyZSAnbCBnIF8gZyBfJywgdGV4dDogJ3ZpbV9tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzAsIDFdXG5cbiAgZGVzY3JpYmUgJ0Rhc2hDYXNlJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogJ3ZpbU1vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJ1xuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJ0cmFuc2Zvcm0gdGV4dCBieSBtb3Rpb24gYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgIGVuc3VyZSAnZyAtICQnLCB0ZXh0OiAndmltLW1vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGVuc3VyZSAnaiAuJywgdGV4dDogJ3ZpbS1tb2RlXFxuYXRvbS10ZXh0LWVkaXRvclxcbicsIGN1cnNvcjogWzEsIDBdXG5cbiAgICBpdCBcInRyYW5zZm9ybSBzZWxlY3Rpb25cIiwgLT5cbiAgICAgIGVuc3VyZSAnViBqIGcgLScsIHRleHQ6ICd2aW0tbW9kZVxcbmF0b20tdGV4dC1lZGl0b3JcXG4nLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXRpbmcgdHdpY2Ugd29ya3Mgb24gY3VycmVudC1saW5lIGFuZCB3b24ndCBtb3ZlIGN1cnNvclwiLCAtPlxuICAgICAgZW5zdXJlICdsIGcgLSBnIC0nLCB0ZXh0OiAndmltLW1vZGVcXG5hdG9tX3RleHRfZWRpdG9yXFxuJywgY3Vyc29yOiBbMCwgMV1cblxuICBkZXNjcmliZSAnQ29udmVydFRvU29mdFRhYicsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgdGFiJzogJ3ZpbS1tb2RlLXBsdXM6Y29udmVydC10by1zb2Z0LXRhYidcblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGl0IFwiY29udmVydCB0YWJzIHRvIHNwYWNlc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRhYkxlbmd0aCgpKS50b0JlKDIpXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXFx0dmFyMTAgPVxcdFxcdDA7XCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgdGFiICQnLFxuICAgICAgICAgIHRleHQ6IFwiICB2YXIxMCA9ICAgMDtcIlxuXG4gIGRlc2NyaWJlICdDb252ZXJ0VG9IYXJkVGFiJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBzaGlmdC10YWInOiAndmltLW1vZGUtcGx1czpjb252ZXJ0LXRvLWhhcmQtdGFiJ1xuXG4gICAgZGVzY3JpYmUgXCJiYXNpYyBiZWhhdmlvclwiLCAtPlxuICAgICAgaXQgXCJjb252ZXJ0IHNwYWNlcyB0byB0YWJzXCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGFiTGVuZ3RoKCkpLnRvQmUoMilcbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCIgIHZhcjEwID0gICAgMDtcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBzaGlmdC10YWIgJCcsXG4gICAgICAgICAgdGV4dDogXCJcXHR2YXIxMFxcdD1cXHRcXHQgMDtcIlxuXG4gIGRlc2NyaWJlICdDb21wYWN0U3BhY2VzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGRlc2NyaWJlIFwiYmFzaWMgYmVoYXZpb3JcIiwgLT5cbiAgICAgIGl0IFwiY29tcGF0cyBtdWx0aXBsZSBzcGFjZSBpbnRvIG9uZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiAndmFyMCAgID0gICAwOyB2YXIxMCAgID0gICAxMCdcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2cgc3BhY2UgJCcsXG4gICAgICAgICAgdGV4dDogJ3ZhcjAgPSAwOyB2YXIxMCA9IDEwJ1xuICAgICAgaXQgXCJkb24ndCBhcHBseSBjb21wYWN0aW9uIGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyBzcGFjZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgX19fdmFyMCAgID0gICAwOyB2YXIxMCAgID0gICAxMF9fX1xuICAgICAgICAgIF9fX3ZhcjEgICA9ICAgMTsgdmFyMTEgICA9ICAgMTFfX19cbiAgICAgICAgICBfX192YXIyICAgPSAgIDI7IHZhcjEyICAgPSAgIDEyX19fXG5cbiAgICAgICAgICBfX192YXI0ICAgPSAgIDQ7IHZhcjE0ICAgPSAgIDE0X19fXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIHNwYWNlIGkgcCcsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fX3ZhcjAgPSAwOyB2YXIxMCA9IDEwX19fXG4gICAgICAgICAgX19fdmFyMSA9IDE7IHZhcjExID0gMTFfX19cbiAgICAgICAgICBfX192YXIyID0gMjsgdmFyMTIgPSAxMl9fX1xuXG4gICAgICAgICAgX19fdmFyNCAgID0gICA0OyB2YXIxNCAgID0gICAxNF9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJidXQgaXQgY29tcGFjdCBzcGFjZXMgd2hlbiB0YXJnZXQgYWxsIHRleHQgaXMgc3BhY2VzXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6ICcwMTIzNCAgICA5MCdcbiAgICAgICAgICBjdXJzb3I6IFswLCA1XVxuICAgICAgICBlbnN1cmUgJ2cgc3BhY2UgdycsXG4gICAgICAgICAgdGV4dDogJzAxMjM0IDkwJ1xuXG4gIGRlc2NyaWJlICdBbGlnbk9jY3VycmVuY2UgZmFtaWx5JywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyB8JzogJ3ZpbS1tb2RlLXBsdXM6YWxpZ24tb2NjdXJyZW5jZSdcblxuICAgIGRlc2NyaWJlIFwiQWxpZ25PY2N1cnJlbmNlXCIsIC0+XG4gICAgICBpdCBcImFsaWduIGJ5ID1cIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYSB8PSAxMDBcbiAgICAgICAgICBiY2QgPSAxXG4gICAgICAgICAgaWprbG0gPSAxMDAwXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiZyB8IHBcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBhIHwgICAgPSAxMDBcbiAgICAgICAgICBiY2QgICA9IDFcbiAgICAgICAgICBpamtsbSA9IDEwMDBcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJhbGlnbiBieSBjb21tYVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBhfCwgMTAwLCAzMFxuICAgICAgICAgIGIsIDMwMDAwLCA1MFxuICAgICAgICAgIDIwMDAwMCwgMVxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImcgfCBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYXwsICAgICAgMTAwLCAgIDMwXG4gICAgICAgICAgYiwgICAgICAzMDAwMCwgNTBcbiAgICAgICAgICAyMDAwMDAsIDFcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJhbGlnbiBieSBub24td29yZC1jaGFyLWVuZGluZ1wiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG5cbiAgICAgICAgICBhYmN8OiAxMFxuICAgICAgICAgIGRlZmdoOiAyMFxuICAgICAgICAgIGlqOiAzMFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImcgfCBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgYWJjfDogICAxMFxuICAgICAgICAgIGRlZmdoOiAyMFxuICAgICAgICAgIGlqOiAgICAzMFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImFsaWduIGJ5IG5vcm1hbCB3b3JkXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIHh4eCBmaXJ8c3ROYW1lOiBcIkhlbGxvXCIsIGxhc3ROYW1lOiBcIldvcmxkXCJcbiAgICAgICAgICB5eXl5eXl5eSBmaXJzdE5hbWU6IFwiR29vZCBCeWVcIiwgbGFzdE5hbWU6IFwiV29ybGRcIlxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSBcImcgfCBwXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgeHh4ICAgIHwgIGZpcnN0TmFtZTogXCJIZWxsb1wiLCBsYXN0TmFtZTogXCJXb3JsZFwiXG4gICAgICAgICAgeXl5eXl5eXkgZmlyc3ROYW1lOiBcIkdvb2QgQnllXCIsIGxhc3ROYW1lOiBcIldvcmxkXCJcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJhbGlnbiBieSBgfGAgdGFibGUtbGlrZSB0ZXh0XCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4gICAgICAgICAgfCB3aGVyZSB8IG1vdmUgdG8gMXN0IGNoYXIgfCBubyBtb3ZlIHxcbiAgICAgICAgICArLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLStcbiAgICAgICAgICB8IHRvcCB8IGB6IGVudGVyYCB8IGB6IHRgIHxcbiAgICAgICAgICB8IG1pZGRsZSB8IGB6IC5gIHwgYHogemAgfFxuICAgICAgICAgIHwgYm90dG9tIHwgYHogLWAgfCBgeiBiYCB8XG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuICAgICAgICBlbnN1cmUgXCJnIHwgcFwiLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuXG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4gICAgICAgICAgfCB3aGVyZSAgfCBtb3ZlIHRvIDFzdCBjaGFyIHwgbm8gbW92ZSB8XG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG4gICAgICAgICAgfCB0b3AgICAgfCBgeiBlbnRlcmAgICAgICAgIHwgYHogdGAgICB8XG4gICAgICAgICAgfCBtaWRkbGUgfCBgeiAuYCAgICAgICAgICAgIHwgYHogemAgICB8XG4gICAgICAgICAgfCBib3R0b20gfCBgeiAtYCAgICAgICAgICAgIHwgYHogYmAgICB8XG4gICAgICAgICAgKy0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLSstLS0tLS0tLS0rXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFsyLCAwXVxuXG4gIGRlc2NyaWJlICdUcmltU3RyaW5nJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCIgdGV4dCA9IEBnZXROZXdUZXh0KCBzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24gKSAgXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgNDJdXG5cbiAgICBkZXNjcmliZSBcImJhc2ljIGJlaGF2aW9yXCIsIC0+XG4gICAgICBpdCBcInRyaW0gc3RyaW5nIGZvciBhLWxpbmUgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIF9fX2FiY19fX1xuICAgICAgICAgIF9fX2RlZl9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyB8IGEgbCcsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIF9fX2RlZl9fX1xuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGRlZlxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ0cmltIHN0cmluZyBmb3IgaW5uZXItcGFyZW50aGVzaXMgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICggIGFiYyAgKVxuICAgICAgICAgICggIGRlZiAgKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyB8IGkgKCcsXG4gICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgIChhYmMpXG4gICAgICAgICAgKCAgZGVmICApXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgKGFiYylcbiAgICAgICAgICAoZGVmKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJ0cmltIHN0cmluZyBmb3IgaW5uZXItYW55LXBhaXIgdGV4dCBvYmplY3RcIiwgLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm9wZXJhdG9yLXBlbmRpbmctbW9kZSwgYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLnZpc3VhbC1tb2RlJzpcbiAgICAgICAgICAgICdpIDsnOiAgJ3ZpbS1tb2RlLXBsdXM6aW5uZXItYW55LXBhaXInXG5cbiAgICAgICAgc2V0IHRleHRfOiBcIiggWyB7ICBhYmMgIH0gXSApXCIsIGN1cnNvcjogWzAsIDhdXG4gICAgICAgIGVuc3VyZSAnZyB8IGkgOycsIHRleHRfOiBcIiggWyB7YWJjfSBdIClcIlxuICAgICAgICBlbnN1cmUgJzIgaCAuJywgdGV4dF86IFwiKCBbe2FiY31dIClcIlxuICAgICAgICBlbnN1cmUgJzIgaCAuJywgdGV4dF86IFwiKFt7YWJjfV0pXCJcblxuICBkZXNjcmliZSAnc3Vycm91bmQnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGtleW1hcHNGb3JTdXJyb3VuZCA9IHtcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgJ3kgcyc6ICd2aW0tbW9kZS1wbHVzOnN1cnJvdW5kJ1xuICAgICAgICAgICdkIHMnOiAndmltLW1vZGUtcGx1czpkZWxldGUtc3Vycm91bmQtYW55LXBhaXInXG4gICAgICAgICAgJ2QgUyc6ICd2aW0tbW9kZS1wbHVzOmRlbGV0ZS1zdXJyb3VuZCdcbiAgICAgICAgICAnYyBzJzogJ3ZpbS1tb2RlLXBsdXM6Y2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyJ1xuICAgICAgICAgICdjIFMnOiAndmltLW1vZGUtcGx1czpjaGFuZ2Utc3Vycm91bmQnXG5cbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5vcGVyYXRvci1wZW5kaW5nLW1vZGUuc3Vycm91bmQtcGVuZGluZyc6XG4gICAgICAgICAgJ3MnOiAndmltLW1vZGUtcGx1czppbm5lci1jdXJyZW50LWxpbmUnXG5cbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgJ1MnOiAndmltLW1vZGUtcGx1czpzdXJyb3VuZCdcbiAgICAgIH1cblxuICAgICAgYXRvbS5rZXltYXBzLmFkZChcImtleW1hcHMtZm9yLXN1cnJvdW5kXCIsIGtleW1hcHNGb3JTdXJyb3VuZClcblxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8YXBwbGVcbiAgICAgICAgICBwYWlyczogW2JyYWNrZXRzXVxuICAgICAgICAgIHBhaXJzOiBbYnJhY2tldHNdXG4gICAgICAgICAgKCBtdWx0aVxuICAgICAgICAgICAgbGluZSApXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnY2FuY2VsbGF0aW9uJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIChhfGJjKSBkZWZcbiAgICAgICAgICAoZyFoaSkgamtsXG4gICAgICAgICAgKG18bm8pIHBxclxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSAnc3Vycm91bmQgY2FuY2VsbGF0aW9uJywgLT5cbiAgICAgICAgaXQgXCJbbm9ybWFsXSBrZWVwIG11bHRwY3Vyc29yIG9uIHN1cnJvdW5kIGNhbmNlbFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcInkgcyBlc2NhcGVcIixcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChhfGJjKSBkZWZcbiAgICAgICAgICAgIChnIWhpKSBqa2xcbiAgICAgICAgICAgIChtfG5vKSBwcXJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgbW9kZTogXCJub3JtYWxcIlxuXG4gICAgICAgIGl0IFwiW3Zpc3VhbF0ga2VlcCBtdWx0cGN1cnNvciBvbiBzdXJyb3VuZCBjYW5jZWxcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ2XCIsXG4gICAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAoYWJ8YykgZGVmXG4gICAgICAgICAgICAoZ2ghaSkgamtsXG4gICAgICAgICAgICAobW58bykgcHFyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcImJcIiwgXCJoXCIsIFwiblwiXVxuICAgICAgICAgIGVuc3VyZSBcIlMgZXNjYXBlXCIsXG4gICAgICAgICAgICBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAoYWJ8YykgZGVmXG4gICAgICAgICAgICAoZ2ghaSkgamtsXG4gICAgICAgICAgICAobW58bykgcHFyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcImJcIiwgXCJoXCIsIFwiblwiXVxuXG4gICAgICBkZXNjcmliZSAnZGVsZXRlLXN1cnJvdW5kIGNhbmNlbGxhdGlvbicsIC0+XG4gICAgICAgIGl0IFwiW2Zyb20gbm9ybWFsXSBrZWVwIG11bHRwY3Vyc29yIG9uIGNhbmNlbFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImQgUyBlc2NhcGVcIixcbiAgICAgICAgICAgIG1vZGU6IFwibm9ybWFsXCJcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIChhfGJjKSBkZWZcbiAgICAgICAgICAgIChnIWhpKSBqa2xcbiAgICAgICAgICAgIChtfG5vKSBwcXJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSAnY2hhbmdlLXN1cnJvdW5kIGNhbmNlbGxhdGlvbicsIC0+XG4gICAgICAgIGl0IFwiW2Zyb20gbm9ybWFsXSBrZWVwIG11bHRwY3Vyc29yIG9uIGNhbmNlbCBvZiAxc3QgaW5wdXRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJjIFMgZXNjYXBlXCIsICMgT24gY2hvb3NpbmcgZGVsZXRpbmcgcGFpci1jaGFyXG4gICAgICAgICAgICBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAoYXxiYykgZGVmXG4gICAgICAgICAgICAoZyFoaSkgamtsXG4gICAgICAgICAgICAobXxubykgcHFyXFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbZnJvbSBub3JtYWxdIGtlZXAgbXVsdHBjdXJzb3Igb24gY2FuY2VsIG9mIDJuZCBpbnB1dFwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImMgUyAoXCIsXG4gICAgICAgICAgICBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIoYWJjKVwiLCBcIihnaGkpXCIsIFwiKG1ubylcIl0gIyBlYXJseSBzZWxlY3QoZm9yIGJldHRlciBVWCkgZWZmZWN0LlxuXG4gICAgICAgICAgZW5zdXJlIFwiZXNjYXBlXCIsICMgT24gY2hvb3NpbmcgZGVsZXRpbmcgcGFpci1jaGFyXG4gICAgICAgICAgICBtb2RlOiBcIm5vcm1hbFwiXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAoYXxiYykgZGVmXG4gICAgICAgICAgICAoZyFoaSkgamtsXG4gICAgICAgICAgICAobXxubykgcHFyXFxuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ3N1cnJvdW5kLXdvcmQgY2FuY2VsbGF0aW9uJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJzdXJyb3VuZC10ZXN0XCIsXG4gICAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICAgJ3kgcyB3JzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQtd29yZCdcblxuICAgICAgICBpdCBcIltmcm9tIG5vcm1hbF0ga2VlcCBtdWx0cGN1cnNvciBvbiBjYW5jZWxcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgXCJ5IHMgd1wiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCJhYmNcIiwgXCJnaGlcIiwgXCJtbm9cIl0gIyBlYXJseSBzZWxlY3QoZm9yIGJldHRlciBVWCkgZWZmZWN0LlxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLFxuICAgICAgICAgICAgbW9kZTogXCJub3JtYWxcIlxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKGF8YmMpIGRlZlxuICAgICAgICAgICAgKGchaGkpIGprbFxuICAgICAgICAgICAgKG18bm8pIHBxclxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnYWxpYXMga2V5bWFwIGZvciBzdXJyb3VuZCwgY2hhbmdlLXN1cnJvdW5kLCBkZWxldGUtc3Vycm91bmQnLCAtPlxuICAgICAgaXQgXCJzdXJyb3VuZCBieSBhbGlhc2VkIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IGInLCB0ZXh0OiBcIihhYmMpXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IEInLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IHInLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IGEnLCB0ZXh0OiBcIjxhYmM+XCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kIGJ5IGFsaWFzZWQgY2hhclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifChhYmMpXCI7IGVuc3VyZSAnZCBTIGInLCB0ZXh0OiBcImFiY1wiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8e2FiY31cIjsgZW5zdXJlICdkIFMgQicsIHRleHQ6IFwiYWJjXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInxbYWJjXVwiOyBlbnN1cmUgJ2QgUyByJywgdGV4dDogXCJhYmNcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifDxhYmM+XCI7IGVuc3VyZSAnZCBTIGEnLCB0ZXh0OiBcImFiY1wiXG4gICAgICBpdCBcImNoYW5nZSBzdXJyb3VuZCBieSBhbGlhc2VkIGNoYXJcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInwoYWJjKVwiOyBlbnN1cmUgJ2MgUyBiIEInLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgc2V0IHRleHRDOiBcInwoYWJjKVwiOyBlbnN1cmUgJ2MgUyBiIHInLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInwoYWJjKVwiOyBlbnN1cmUgJ2MgUyBiIGEnLCB0ZXh0OiBcIjxhYmM+XCJcblxuICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XCI7IGVuc3VyZSAnYyBTIEIgYicsIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XCI7IGVuc3VyZSAnYyBTIEIgcicsIHRleHQ6IFwiW2FiY11cIlxuICAgICAgICBzZXQgdGV4dEM6IFwifHthYmN9XCI7IGVuc3VyZSAnYyBTIEIgYScsIHRleHQ6IFwiPGFiYz5cIlxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8W2FiY11cIjsgZW5zdXJlICdjIFMgciBiJywgdGV4dDogXCIoYWJjKVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8W2FiY11cIjsgZW5zdXJlICdjIFMgciBCJywgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgIHNldCB0ZXh0QzogXCJ8W2FiY11cIjsgZW5zdXJlICdjIFMgciBhJywgdGV4dDogXCI8YWJjPlwiXG5cbiAgICAgICAgc2V0IHRleHRDOiBcInw8YWJjPlwiOyBlbnN1cmUgJ2MgUyBhIGInLCB0ZXh0OiBcIihhYmMpXCJcbiAgICAgICAgc2V0IHRleHRDOiBcInw8YWJjPlwiOyBlbnN1cmUgJ2MgUyBhIEInLCB0ZXh0OiBcInthYmN9XCJcbiAgICAgICAgc2V0IHRleHRDOiBcInw8YWJjPlwiOyBlbnN1cmUgJ2MgUyBhIHInLCB0ZXh0OiBcIlthYmNdXCJcblxuICAgIGRlc2NyaWJlICdzdXJyb3VuZCcsIC0+XG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgb2JqZWN0IHdpdGggKCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgcyBpIHcgKCcsXG4gICAgICAgICAgdGV4dEM6IFwifChhcHBsZSlcXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHQ6IFwiKGFwcGxlKVxcbihwYWlycyk6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICBpdCBcInN1cnJvdW5kIHRleHQgb2JqZWN0IHdpdGggeyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgcyBpIHcgeycsXG4gICAgICAgICAgdGV4dEM6IFwifHthcHBsZX1cXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRDOiBcInthcHBsZX1cXG58e3BhaXJzfTogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwic3Vycm91bmQgY3VycmVudC1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBzIHMgeycsXG4gICAgICAgICAgdGV4dEM6IFwifHthcHBsZX1cXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRDOiBcInthcHBsZX1cXG58e3BhaXJzOiBbYnJhY2tldHNdfVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcblxuICAgICAgZGVzY3JpYmUgJ2FkanVzdEluZGVudGF0aW9uIHdoZW4gc3Vycm91bmQgbGluZXdpc2UgdGFyZ2V0JywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHNldFxuICAgICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gaGVsbG8oKSB7XG4gICAgICAgICAgICAgICAgICBpZiB0cnVlIHtcbiAgICAgICAgICAgICAgICAgIHwgIGNvbnNvbGUubG9nKCdoZWxsbycpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcblxuICAgICAgICBpdCBcImFkanVzdEluZGVudGF0aW9uIHN1cnJvdW5kZWQgdGV4dCBcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ3kgcyBpIGYgeycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIGhlbGxvKCkge1xuICAgICAgICAgICAgICB8ICB7XG4gICAgICAgICAgICAgICAgICBpZiB0cnVlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2hlbGxvJyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBkZXNjcmliZSAnd2l0aCBtb3Rpb24gd2hpY2ggdGFrZXMgdXNlci1pbnB1dCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXQgdGV4dDogXCJzIF9fX19fIGVcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZGVzY3JpYmUgXCJ3aXRoICdmJyBtb3Rpb25cIiwgLT5cbiAgICAgICAgICBpdCBcInN1cnJvdW5kIHdpdGggJ2YnIG1vdGlvblwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd5IHMgZiBlICgnLCB0ZXh0OiBcIihzIF9fX19fIGUpXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgZGVzY3JpYmUgXCJ3aXRoICdgJyBtb3Rpb25cIiwgLT5cbiAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICBzZXQgY3Vyc29yOiBbMCwgOF0gIyBzdGFydCBhdCBgZWAgY2hhclxuICAgICAgICAgICAgZW5zdXJlICdtIGEnLCBtYXJrOiAnYSc6IFswLCA4XVxuICAgICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgICBpdCBcInN1cnJvdW5kIHdpdGggJ2AnIG1vdGlvblwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd5IHMgYCBhICgnLCB0ZXh0OiBcIihzIF9fX19fICllXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIGRlc2NyaWJlICdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQgc2V0dGluZycsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCcsIFsnKCcsICd7JywgJ1snXSlcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcInxhcHBsZVxcbm9yYW5nZVxcbmxlbW1vblwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjaGFyIGlzIGluIGNoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZFwiLCAtPlxuICAgICAgICAgIGl0IFwiYWRkIGFkZGl0aW9uYWwgc3BhY2UgaW5zaWRlIHBhaXIgY2hhciB3aGVuIHN1cnJvdW5kXCIsIC0+XG4gICAgICAgICAgICBlbnN1cmUgJ3kgcyBpIHcgKCcsIHRleHQ6IFwiKCBhcHBsZSApXFxub3JhbmdlXFxubGVtbW9uXCJcbiAgICAgICAgICAgIGtleXN0cm9rZSAnaidcbiAgICAgICAgICAgIGVuc3VyZSAneSBzIGkgdyB7JywgdGV4dDogXCIoIGFwcGxlIClcXG57IG9yYW5nZSB9XFxubGVtbW9uXCJcbiAgICAgICAgICAgIGtleXN0cm9rZSAnaidcbiAgICAgICAgICAgIGVuc3VyZSAneSBzIGkgdyBbJywgdGV4dDogXCIoIGFwcGxlIClcXG57IG9yYW5nZSB9XFxuWyBsZW1tb24gXVwiXG5cbiAgICAgICAgZGVzY3JpYmUgXCJjaGFyIGlzIG5vdCBpbiBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmRcIiwgLT5cbiAgICAgICAgICBpdCBcImFkZCBhZGRpdGlvbmFsIHNwYWNlIGluc2lkZSBwYWlyIGNoYXIgd2hlbiBzdXJyb3VuZFwiLCAtPlxuICAgICAgICAgICAgZW5zdXJlICd5IHMgaSB3ICknLCB0ZXh0OiBcIihhcHBsZSlcXG5vcmFuZ2VcXG5sZW1tb25cIlxuICAgICAgICAgICAga2V5c3Ryb2tlICdqJ1xuICAgICAgICAgICAgZW5zdXJlICd5IHMgaSB3IH0nLCB0ZXh0OiBcIihhcHBsZSlcXG57b3JhbmdlfVxcbmxlbW1vblwiXG4gICAgICAgICAgICBrZXlzdHJva2UgJ2onXG4gICAgICAgICAgICBlbnN1cmUgJ3kgcyBpIHcgXScsIHRleHQ6IFwiKGFwcGxlKVxcbntvcmFuZ2V9XFxuW2xlbW1vbl1cIlxuXG4gICAgICAgIGRlc2NyaWJlIFwiaXQgZGlzdGluY3RpdmVseSBoYW5kbGUgYWxpYXNlZCBrZXltYXBcIiwgLT5cbiAgICAgICAgICBkZXNjcmliZSBcIm5vcm1hbCBwYWlyLWNoYXJzIGFyZSBzZXQgdG8gYWRkIHNwYWNlXCIsIC0+XG4gICAgICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWycsICc8J10pXG4gICAgICAgICAgICBpdCBcImRpc3RpbmN0aXZlbHkgaGFuZGxlXCIsIC0+XG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyAoJywgdGV4dDogXCIoIGFiYyApXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IGInLCB0ZXh0OiBcIihhYmMpXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IHsnLCB0ZXh0OiBcInsgYWJjIH1cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgQicsIHRleHQ6IFwie2FiY31cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgWycsIHRleHQ6IFwiWyBhYmMgXVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyByJywgdGV4dDogXCJbYWJjXVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyA8JywgdGV4dDogXCI8IGFiYyA+XCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IGEnLCB0ZXh0OiBcIjxhYmM+XCJcbiAgICAgICAgICBkZXNjcmliZSBcImFsaWFzZWQgcGFpci1jaGFycyBhcmUgc2V0IHRvIGFkZCBzcGFjZVwiLCAtPlxuICAgICAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCcsIFsnYicsICdCJywgJ3InLCAnYSddKVxuICAgICAgICAgICAgaXQgXCJkaXN0aW5jdGl2ZWx5IGhhbmRsZVwiLCAtPlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgKCcsIHRleHQ6IFwiKGFiYylcIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgYicsIHRleHQ6IFwiKCBhYmMgKVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyB7JywgdGV4dDogXCJ7YWJjfVwiXG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8YWJjXCI7IGVuc3VyZSAneSBzIGkgdyBCJywgdGV4dDogXCJ7IGFiYyB9XCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IFsnLCB0ZXh0OiBcIlthYmNdXCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIjsgZW5zdXJlICd5IHMgaSB3IHInLCB0ZXh0OiBcIlsgYWJjIF1cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgPCcsIHRleHQ6IFwiPGFiYz5cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifGFiY1wiOyBlbnN1cmUgJ3kgcyBpIHcgYScsIHRleHQ6IFwiPCBhYmMgPlwiXG5cbiAgICBkZXNjcmliZSAnbWFwLXN1cnJvdW5kJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgICBwYWlycyB0b21hdG9cbiAgICAgICAgICAgIG9yYW5nZVxuICAgICAgICAgICAgbWlsa1xuXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwibXNcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdtIHMnOiAndmltLW1vZGUtcGx1czptYXAtc3Vycm91bmQnXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy52aXN1YWwtbW9kZSc6XG4gICAgICAgICAgICAnbSBzJzogICd2aW0tbW9kZS1wbHVzOm1hcC1zdXJyb3VuZCdcblxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IGZvciBlYWNoIHdvcmQgaW4gdGFyZ2V0IGNhc2UtMVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ20gcyBpIHAgKCcsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgfChhcHBsZSlcbiAgICAgICAgICAocGFpcnMpICh0b21hdG8pXG4gICAgICAgICAgKG9yYW5nZSlcbiAgICAgICAgICAobWlsaylcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJzdXJyb3VuZCB0ZXh0IGZvciBlYWNoIHdvcmQgaW4gdGFyZ2V0IGNhc2UtMlwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMiwgMV1cbiAgICAgICAgZW5zdXJlICdtIHMgaSBsIDwnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcblxuICAgICAgICAgIGFwcGxlXG4gICAgICAgICAgPHxwYWlycz4gPHRvbWF0bz5cbiAgICAgICAgICBvcmFuZ2VcbiAgICAgICAgICBtaWxrXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICMgVE9ETyM2OTggRklYIHdoZW4gZmluaXNoZWRcbiAgICAgIGl0IFwic3Vycm91bmQgdGV4dCBmb3IgZWFjaCB3b3JkIGluIHZpc3VhbCBzZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwic3RheU9uU2VsZWN0VGV4dE9iamVjdFwiLCB0cnVlKVxuICAgICAgICBlbnN1cmUgJ3YgaSBwIG0gcyBcIicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuXG4gICAgICAgICAgXCJhcHBsZVwiXG4gICAgICAgICAgXCJwYWlyc1wiIFwidG9tYXRvXCJcbiAgICAgICAgICBcIm9yYW5nZVwiXG4gICAgICAgICAgfFwibWlsa1wiXG5cbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlICdkZWxldGUgc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgOF1cblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBjaGFycyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgUyBbJyxcbiAgICAgICAgICB0ZXh0OiBcImFwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxucGFpcnM6IFticmFja2V0c11cXG4oIG11bHRpXFxuICBsaW5lIClcIlxuICAgICAgICBlbnN1cmUgJ2ogbCAuJyxcbiAgICAgICAgICB0ZXh0OiBcImFwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxucGFpcnM6IGJyYWNrZXRzXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgZXhwYW5kZWQgdG8gbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlICdkIFMgKCcsXG4gICAgICAgICAgdGV4dDogXCJhcHBsZVxcbnBhaXJzOiBbYnJhY2tldHNdXFxucGFpcnM6IFticmFja2V0c11cXG4gbXVsdGlcXG4gIGxpbmUgXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHRyaW0gcGFkZGluZyBzcGFjZXMgZm9yIG5vbi1pZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgKCBhcHBsZSApXG4gICAgICAgICAgICB7ICBvcmFuZ2UgICB9XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJ2QgUyAoJywgdGV4dDogXCJhcHBsZVxcbnsgIG9yYW5nZSAgIH1cXG5cIlxuICAgICAgICBlbnN1cmUgJ2ogZCBTIHsnLCB0ZXh0OiBcImFwcGxlXFxub3JhbmdlXFxuXCJcbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIE5PVCB0cmltIHBhZGRpbmcgc3BhY2VzIGZvciBpZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgIHNldFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYCBhcHBsZSBgXG4gICAgICAgICAgICBcIiAgb3JhbmdlICAgXCJcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZCBTIGAnLCB0ZXh0XzogJ19hcHBsZV9cXG5cIl9fb3JhbmdlX19fXCJcXG4nXG4gICAgICAgIGVuc3VyZSAnaiBkIFMgXCInLCB0ZXh0XzogXCJfYXBwbGVfXFxuX19vcmFuZ2VfX19cXG5cIlxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBmb3IgbXVsdGktbGluZSBidXQgZG9udCBhZmZlY3QgY29kZSBsYXlvdXRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2QgUyB7JyxcbiAgICAgICAgICB0ZXh0OiBbXG4gICAgICAgICAgICAgIFwiaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCBcIlxuICAgICAgICAgICAgICBcIiAgdGltZW91dDogdGltZW91dFwiXG4gICAgICAgICAgICAgIFwiICBoZWxsbzogd29ybGRcIlxuICAgICAgICAgICAgICBcIlwiXG4gICAgICAgICAgICBdLmpvaW4oXCJcXG5cIilcblxuICAgIGRlc2NyaWJlICdjaGFuZ2Ugc3Vycm91bmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMV1cbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kZWQgY2hhcnMgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjIFMgKCBbJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIFthcHBsZV1cbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiBsIC4nLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgW2FwcGxlXVxuICAgICAgICAgICAgW2dyYXBlXVxuICAgICAgICAgICAgPGxlbW1vbj5cbiAgICAgICAgICAgIHtvcmFuZ2V9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiY2hhbmdlIHN1cnJvdW5kZWQgY2hhcnNcIiwgLT5cbiAgICAgICAgZW5zdXJlICdqIGogYyBTIDwgXCInLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgKGFwcGxlKVxuICAgICAgICAgICAgKGdyYXBlKVxuICAgICAgICAgICAgXCJsZW1tb25cIlxuICAgICAgICAgICAge29yYW5nZX1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogbCBjIFMgeyAhJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIChhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIFwibGVtbW9uXCJcbiAgICAgICAgICAgICFvcmFuZ2UhXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJjaGFuZ2Ugc3Vycm91bmRlZCBmb3IgbXVsdGktbGluZSBidXQgZG9udCBhZmZlY3QgY29kZSBsYXlvdXRcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMzRdXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICBoaWdobGlnaHRSYW5nZXMgQGVkaXRvciwgcmFuZ2UsIHtcbiAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dFxuICAgICAgICAgICAgICBoZWxsbzogd29ybGRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2MgUyB7ICgnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgaGlnaGxpZ2h0UmFuZ2VzIEBlZGl0b3IsIHJhbmdlLCAoXG4gICAgICAgICAgICAgIHRpbWVvdXQ6IHRpbWVvdXRcbiAgICAgICAgICAgICAgaGVsbG86IHdvcmxkXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgZGVzY3JpYmUgJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCBzZXR0aW5nJywgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldCgnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgWycoJywgJ3snLCAnWyddKVxuXG4gICAgICAgIGRlc2NyaWJlICd3aGVuIGlucHV0IGNoYXIgaXMgaW4gY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJywgLT5cbiAgICAgICAgICBkZXNjcmliZSAnc2luZ2xlIGxpbmUgdGV4dCcsIC0+XG4gICAgICAgICAgICBpdCBcImFkZCBzaW5nbGUgc3BhY2UgYXJvdW5kIHBhaXIgcmVnYXJkbGVzcyBvZiBleHNpdGluZyBpbm5lciB0ZXh0XCIsIC0+XG4gICAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8KGFwcGxlKVwiOyAgICAgZW5zdXJlICdjIFMgKCB7JywgdGV4dDogXCJ7IGFwcGxlIH1cIlxuICAgICAgICAgICAgICBzZXQgdGV4dEM6IFwifCggYXBwbGUgKVwiOyAgIGVuc3VyZSAnYyBTICggeycsIHRleHQ6IFwieyBhcHBsZSB9XCJcbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInwoICBhcHBsZSAgKVwiOyBlbnN1cmUgJ2MgUyAoIHsnLCB0ZXh0OiBcInsgYXBwbGUgfVwiXG5cbiAgICAgICAgICBkZXNjcmliZSAnbXVsdGkgbGluZSB0ZXh0JywgLT5cbiAgICAgICAgICAgIGl0IFwiZG9uJ3Qgc2FkZCBzaW5nbGUgc3BhY2UgYXJvdW5kIHBhaXJcIiwgLT5cbiAgICAgICAgICAgICAgc2V0IHRleHRDOiBcInwoXFxuYXBwbGVcXG4pXCI7IGVuc3VyZSBcImMgUyAoIHtcIiwgdGV4dDogXCJ7XFxuYXBwbGVcXG59XCJcblxuICAgICAgICBkZXNjcmliZSAnd2hlbiBmaXJzdCBpbnB1dCBjaGFyIGlzIG5vdCBpbiBjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnLCAtPlxuICAgICAgICAgIGl0IFwicmVtb3ZlIHN1cnJvdW5kaW5nIHNwYWNlIG9mIGlubmVyIHRleHQgZm9yIGlkZW50aWNhbCBwYWlyLWNoYXJcIiwgLT5cbiAgICAgICAgICAgIHNldCB0ZXh0QzogXCJ8KGFwcGxlKVwiOyAgICAgZW5zdXJlIFwiYyBTICggfVwiLCB0ZXh0OiBcInthcHBsZX1cIlxuICAgICAgICAgICAgc2V0IHRleHRDOiBcInwoIGFwcGxlIClcIjsgICBlbnN1cmUgXCJjIFMgKCB9XCIsIHRleHQ6IFwie2FwcGxlfVwiXG4gICAgICAgICAgICBzZXQgdGV4dEM6IFwifCggIGFwcGxlICApXCI7IGVuc3VyZSBcImMgUyAoIH1cIiwgdGV4dDogXCJ7YXBwbGV9XCJcbiAgICAgICAgICBpdCBcImRvZXNuJ3QgcmVtb3ZlIHN1cnJvdW5kaW5nIHNwYWNlIG9mIGlubmVyIHRleHQgZm9yIG5vbi1pZGVudGljYWwgcGFpci1jaGFyXCIsIC0+XG4gICAgICAgICAgICBzZXQgdGV4dEM6ICd8XCJhcHBsZVwiJzsgICAgIGVuc3VyZSAnYyBTIFwiIGAnLCB0ZXh0OiBcImBhcHBsZWBcIlxuICAgICAgICAgICAgc2V0IHRleHRDOiAnfFwiICBhcHBsZSAgXCInOyBlbnN1cmUgJ2MgUyBcIiBgJywgdGV4dDogXCJgICBhcHBsZSAgYFwiXG4gICAgICAgICAgICBzZXQgdGV4dEM6ICd8XCIgIGFwcGxlICBcIic7IGVuc3VyZSAnYyBTIFwiIFxcJycsIHRleHQ6IFwiJyAgYXBwbGUgICdcIlxuXG4gICAgZGVzY3JpYmUgJ3N1cnJvdW5kLXdvcmQnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwic3Vycm91bmQtdGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXMubm9ybWFsLW1vZGUnOlxuICAgICAgICAgICAgJ3kgcyB3JzogJ3ZpbS1tb2RlLXBsdXM6c3Vycm91bmQtd29yZCdcblxuICAgICAgaXQgXCJzdXJyb3VuZCBhIHdvcmQgd2l0aCAoIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAneSBzIHcgKCcsXG4gICAgICAgICAgdGV4dEM6IFwifChhcHBsZSlcXG5wYWlyczogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgICAgZW5zdXJlICdqIC4nLFxuICAgICAgICAgIHRleHRDOiBcIihhcHBsZSlcXG58KHBhaXJzKTogW2JyYWNrZXRzXVxcbnBhaXJzOiBbYnJhY2tldHNdXFxuKCBtdWx0aVxcbiAgbGluZSApXCJcbiAgICAgIGl0IFwic3Vycm91bmQgYSB3b3JkIHdpdGggeyBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3kgcyB3IHsnLFxuICAgICAgICAgIHRleHRDOiBcInx7YXBwbGV9XFxucGFpcnM6IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJ7YXBwbGV9XFxufHtwYWlyc306IFticmFja2V0c11cXG5wYWlyczogW2JyYWNrZXRzXVxcbiggbXVsdGlcXG4gIGxpbmUgKVwiXG5cbiAgICBkZXNjcmliZSAnZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgYXBwbGVcbiAgICAgICAgICAgIChwYWlyczogW3xicmFja2V0c10pXG4gICAgICAgICAgICB7cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cbiAgICAgICAgICAgICggbXVsdGlcbiAgICAgICAgICAgICAgbGluZSApXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkZWxldGUgc3Vycm91bmRlZCBhbnkgcGFpciBmb3VuZCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2QgcycsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBicmFja2V0cylcXG57cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cXG4oIG11bHRpXFxuICBsaW5lICknXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxucGFpcnM6IGJyYWNrZXRzXFxue3BhaXJzIFwic1wiIFticmFja2V0c119XFxuKCBtdWx0aVxcbiAgbGluZSApJ1xuXG4gICAgICBpdCBcImRlbGV0ZSBzdXJyb3VuZGVkIGFueSBwYWlyIGZvdW5kIHdpdGggc2tpcCBwYWlyIG91dCBvZiBjdXJzb3IgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzIsIDE0XVxuICAgICAgICBlbnN1cmUgJ2QgcycsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBbYnJhY2tldHNdKVxcbntwYWlycyBcInNcIiBicmFja2V0c31cXG4oIG11bHRpXFxuICBsaW5lICknXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dDogJ2FwcGxlXFxuKHBhaXJzOiBbYnJhY2tldHNdKVxcbnBhaXJzIFwic1wiIGJyYWNrZXRzXFxuKCBtdWx0aVxcbiAgbGluZSApJ1xuICAgICAgICBlbnN1cmUgJy4nLCAjIGRvIG5vdGhpbmcgYW55IG1vcmVcbiAgICAgICAgICB0ZXh0OiAnYXBwbGVcXG4ocGFpcnM6IFticmFja2V0c10pXFxucGFpcnMgXCJzXCIgYnJhY2tldHNcXG4oIG11bHRpXFxuICBsaW5lICknXG5cbiAgICAgIGl0IFwiZGVsZXRlIHN1cnJvdW5kZWQgY2hhcnMgZXhwYW5kZWQgdG8gbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMywgMV1cbiAgICAgICAgZW5zdXJlICdkIHMnLFxuICAgICAgICAgIHRleHQ6ICdhcHBsZVxcbihwYWlyczogW2JyYWNrZXRzXSlcXG57cGFpcnMgXCJzXCIgW2JyYWNrZXRzXX1cXG4gbXVsdGlcXG4gIGxpbmUgJ1xuXG4gICAgZGVzY3JpYmUgJ2RlbGV0ZS1zdXJyb3VuZC1hbnktcGFpci1hbGxvdy1mb3J3YXJkaW5nJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcImtleW1hcHMtZm9yLXN1cnJvdW5kXCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5ub3JtYWwtbW9kZSc6XG4gICAgICAgICAgICAnZCBzJzogJ3ZpbS1tb2RlLXBsdXM6ZGVsZXRlLXN1cnJvdW5kLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnXG5cbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuXG4gICAgICBpdCBcIlsxXSBzaW5nbGUgbGluZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXyhpbm5lcilcbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnZCBzJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fX2lubmVyXG4gICAgICAgICAgX19fKGlubmVyKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2ogLicsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIF9fX2lubmVyXG4gICAgICAgICAgfF9fX2lubmVyXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSAnY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKHxhcHBsZSlcbiAgICAgICAgICAgIChncmFwZSlcbiAgICAgICAgICAgIDxsZW1tb24+XG4gICAgICAgICAgICB7b3JhbmdlfVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiY2hhbmdlIGFueSBzdXJyb3VuZGVkIHBhaXIgZm91bmQgYW5kIHJlcGVhdGFibGVcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjIHMgPCcsIHRleHRDOiBcInw8YXBwbGU+XFxuKGdyYXBlKVxcbjxsZW1tb24+XFxue29yYW5nZX1cIlxuICAgICAgICBlbnN1cmUgJ2ogLicsIHRleHRDOiBcIjxhcHBsZT5cXG58PGdyYXBlPlxcbjxsZW1tb24+XFxue29yYW5nZX1cIlxuICAgICAgICBlbnN1cmUgJ2ogaiAuJywgdGV4dEM6IFwiPGFwcGxlPlxcbjxncmFwZT5cXG48bGVtbW9uPlxcbnw8b3JhbmdlPlwiXG5cbiAgICBkZXNjcmliZSAnY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyLWFsbG93LWZvcndhcmRpbmcnLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwia2V5bWFwcy1mb3Itc3Vycm91bmRcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLm5vcm1hbC1tb2RlJzpcbiAgICAgICAgICAgICdjIHMnOiAndmltLW1vZGUtcGx1czpjaGFuZ2Utc3Vycm91bmQtYW55LXBhaXItYWxsb3ctZm9yd2FyZGluZydcbiAgICAgICAgc2V0dGluZ3Muc2V0KCdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnLCB0cnVlKVxuICAgICAgaXQgXCJbMV0gc2luZ2xlIGxpbmVcIiwgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHxfX18oaW5uZXIpXG4gICAgICAgICAgX19fKGlubmVyKVxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ2MgcyA8JyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfF9fXzxpbm5lcj5cbiAgICAgICAgICBfX18oaW5uZXIpXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnaiAuJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgX19fPGlubmVyPlxuICAgICAgICAgIHxfX188aW5uZXI+XG4gICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgJ1JlcGxhY2VXaXRoUmVnaXN0ZXInLCAtPlxuICAgIG9yaWdpbmFsVGV4dCA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnXyc6ICd2aW0tbW9kZS1wbHVzOnJlcGxhY2Utd2l0aC1yZWdpc3RlcidcblxuICAgICAgb3JpZ2luYWxUZXh0ID0gXCJcIlwiXG4gICAgICBhYmMgZGVmICdhYWEnXG4gICAgICBoZXJlIChwYXJlbnRoZXNpcylcbiAgICAgIGhlcmUgKHBhcmVudGhlc2lzKVxuICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2RlZmF1bHQgcmVnaXN0ZXInLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnQSByZWdpc3RlcicsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgaXQgXCJyZXBsYWNlIHNlbGVjdGlvbiB3aXRoIHJlZ2lzZ3RlcidzIGNvbnRlbnRcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBpIHcnLFxuICAgICAgICBzZWxlY3RlZFRleHQ6ICdhYWEnXG4gICAgICBlbnN1cmUgJ18nLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgnYWFhJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuXG4gICAgaXQgXCJyZXBsYWNlIHRleHQgb2JqZWN0IHdpdGggcmVnaXNndGVyJ3MgY29udGVudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ18gaSAoJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoJ3BhcmVudGhlc2lzJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuXG4gICAgaXQgXCJjYW4gcmVwZWF0XCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSAnXyBpICggaiAuJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0LnJlcGxhY2UoL3BhcmVudGhlc2lzL2csICdkZWZhdWx0IHJlZ2lzdGVyJylcblxuICAgIGl0IFwiY2FuIHVzZSBzcGVjaWZpZWQgcmVnaXN0ZXIgdG8gcmVwbGFjZSB3aXRoXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMSwgNl1cbiAgICAgIGVuc3VyZSAnXCIgYSBfIGkgKCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCdwYXJlbnRoZXNpcycsICdBIHJlZ2lzdGVyJylcblxuICBkZXNjcmliZSAnU3dhcFdpdGhSZWdpc3RlcicsIC0+XG4gICAgb3JpZ2luYWxUZXh0ID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHAnOiAndmltLW1vZGUtcGx1czpzd2FwLXdpdGgtcmVnaXN0ZXInXG5cbiAgICAgIG9yaWdpbmFsVGV4dCA9IFwiXCJcIlxuICAgICAgYWJjIGRlZiAnYWFhJ1xuICAgICAgaGVyZSAoMTExKVxuICAgICAgaGVyZSAoMjIyKVxuICAgICAgXCJcIlwiXG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogb3JpZ2luYWxUZXh0XG4gICAgICAgIGN1cnNvcjogWzAsIDldXG5cbiAgICAgIHNldCByZWdpc3RlcjogJ1wiJzogdGV4dDogJ2RlZmF1bHQgcmVnaXN0ZXInLCB0eXBlOiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgIHNldCByZWdpc3RlcjogJ2EnOiB0ZXh0OiAnQSByZWdpc3RlcicsIHR5cGU6ICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gICAgaXQgXCJzd2FwIHNlbGVjdGlvbiB3aXRoIHJlZ2lzZ3RlcidzIGNvbnRlbnRcIiwgLT5cbiAgICAgIGVuc3VyZSAndiBpIHcnLCBzZWxlY3RlZFRleHQ6ICdhYWEnXG4gICAgICBlbnN1cmUgJ2cgcCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCdhYWEnLCAnZGVmYXVsdCByZWdpc3RlcicpXG4gICAgICAgIHJlZ2lzdGVyOiAnXCInOiB0ZXh0OiAnYWFhJ1xuXG4gICAgaXQgXCJzd2FwIHRleHQgb2JqZWN0IHdpdGggcmVnaXNndGVyJ3MgY29udGVudFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ2cgcCBpICgnLFxuICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICB0ZXh0OiBvcmlnaW5hbFRleHQucmVwbGFjZSgnMTExJywgJ2RlZmF1bHQgcmVnaXN0ZXInKVxuICAgICAgICByZWdpc3RlcjogJ1wiJzogdGV4dDogJzExMSdcblxuICAgIGl0IFwiY2FuIHJlcGVhdFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICB1cGRhdGVkVGV4dCA9IFwiXCJcIlxuICAgICAgICBhYmMgZGVmICdhYWEnXG4gICAgICAgIGhlcmUgKGRlZmF1bHQgcmVnaXN0ZXIpXG4gICAgICAgIGhlcmUgKDExMSlcbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgJ2cgcCBpICggaiAuJyxcbiAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgdGV4dDogdXBkYXRlZFRleHRcbiAgICAgICAgcmVnaXN0ZXI6ICdcIic6IHRleHQ6ICcyMjInXG5cbiAgICBpdCBcImNhbiB1c2Ugc3BlY2lmaWVkIHJlZ2lzdGVyIHRvIHN3YXAgd2l0aFwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzEsIDZdXG4gICAgICBlbnN1cmUgJ1wiIGEgZyBwIGkgKCcsXG4gICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICAgIHRleHQ6IG9yaWdpbmFsVGV4dC5yZXBsYWNlKCcxMTEnLCAnQSByZWdpc3RlcicpXG4gICAgICAgIHJlZ2lzdGVyOiAnYSc6IHRleHQ6ICcxMTEnXG5cbiAgZGVzY3JpYmUgXCJKb2luIGFuZCBpdCdzIGZhbWlseVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICBfXzB8MTJcbiAgICAgICAgX18zNDVcbiAgICAgICAgX182NzhcbiAgICAgICAgX185YWJcXG5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIkpvaW5cIiwgLT5cbiAgICAgIGl0IFwiam9pbnMgbGluZXMgd2l0aCB0cmltaW5nIGxlYWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0onLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wMTJ8IDM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyIDM0NXwgNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMDEyIDM0NSA2Nzh8IDlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMiAzNDV8IDY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndScsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzAxMnwgMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJ3UnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyXG4gICAgICAgICAgX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiam9pbnMgZG8gbm90aGluZyB3aGVuIGl0IGNhbm5vdCBqb2luIGFueSBtb3JlXCIsIC0+XG4gICAgICAgICMgRklYTUU6IFwiXFxuXCIgcmVtYWluIGl0J3MgaW5jb25zaXN0ZW50IHdpdGggbXVsdGktdGltZSBKXG4gICAgICAgIGVuc3VyZSAnMSAwIDAgSicsIHRleHRDXzogXCIgIDAxMiAzNDUgNjc4IDlhfGJcXG5cIlxuXG4gICAgICBpdCBcImpvaW5zIGRvIG5vdGhpbmcgd2hlbiBpdCBjYW5ub3Qgam9pbiBhbnkgbW9yZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ0ogSiBKJywgdGV4dENfOiBcIiAgMDEyIDM0NSA2Nzh8IDlhYlxcblwiXG4gICAgICAgIGVuc3VyZSAnSicsIHRleHRDXzogXCIgIDAxMiAzNDUgNjc4IDlhfGJcIlxuICAgICAgICBlbnN1cmUgJ0onLCB0ZXh0Q186IFwiICAwMTIgMzQ1IDY3OCA5YXxiXCJcblxuICAgIGRlc2NyaWJlIFwiSm9pbldpdGhLZWVwaW5nU3BhY2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAgICdnIEonOiAndmltLW1vZGUtcGx1czpqb2luLXdpdGgta2VlcGluZy1zcGFjZSdcblxuICAgICAgaXQgXCJqb2lucyBsaW5lcyB3aXRob3V0IHRyaW1pbmcgbGVhZGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnZyBKJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMl9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJy4nLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyX18zNDVfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAndSB1JyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMlxuICAgICAgICAgIF9fMzQ1XG4gICAgICAgICAgX182NzhcbiAgICAgICAgICBfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBlbnN1cmUgJzQgZyBKJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMl9fMzQ1X182NzhfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJKb2luQnlJbnB1dFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgJ2cgSic6ICd2aW0tbW9kZS1wbHVzOmpvaW4tYnktaW5wdXQnXG5cbiAgICAgIGl0IFwiam9pbnMgbGluZXMgYnkgY2hhciBmcm9tIHVzZXIgd2l0aCB0cmltaW5nIGxlYWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjozNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgdGV4dENfOiBcIlwiXCJcbiAgICAgICAgICBfXzB8MTI6OjM0NTo6Njc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1IHUnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyXG4gICAgICAgICAgX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnNCBnIEogOiA6IGVudGVyJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6MzQ1Ojo2Nzg6OjlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImtlZXAgbXVsdGktY3Vyc29ycyBvbiBjYW5jZWxcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCIgIDB8MTJcXG4gIDM0NVxcbiAgNiE3OFxcbiAgOWFiXFxuICBjfGRlXFxuICBmZ2hcXG5cIlxuICAgICAgICBlbnN1cmUgXCJnIEogOiBlc2NhcGVcIiwgdGV4dEM6IFwiICAwfDEyXFxuICAzNDVcXG4gIDYhNzhcXG4gIDlhYlxcbiAgY3xkZVxcbiAgZmdoXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgICAnZyBKJzogJ3ZpbS1tb2RlLXBsdXM6am9pbi1ieS1pbnB1dC13aXRoLWtlZXBpbmctc3BhY2UnXG5cbiAgICAgIGl0IFwiam9pbnMgbGluZXMgYnkgY2hhciBmcm9tIHVzZXIgd2l0aG91dCB0cmltaW5nIGxlYWRpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2cgSiA6IDogZW50ZXInLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyOjpfXzM0NVxuICAgICAgICAgIF9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6X18zNDU6Ol9fNjc4XG4gICAgICAgICAgX185YWJcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICd1IHUnLFxuICAgICAgICAgIHRleHRDXzogXCJcIlwiXG4gICAgICAgICAgX18wfDEyXG4gICAgICAgICAgX18zNDVcbiAgICAgICAgICBfXzY3OFxuICAgICAgICAgIF9fOWFiXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnNCBnIEogOiA6IGVudGVyJyxcbiAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgIF9fMHwxMjo6X18zNDU6Ol9fNjc4OjpfXzlhYlxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlICdUb2dnbGVMaW5lQ29tbWVudHMnLCAtPlxuICAgIFtvbGRHcmFtbWFyLCBvcmlnaW5hbFRleHRdID0gW11cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWNvZmZlZS1zY3JpcHQnKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIG9sZEdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgICAgIGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5jb2ZmZWUnKVxuICAgICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuICAgICAgICBvcmlnaW5hbFRleHQgPSBcIlwiXCJcbiAgICAgICAgICBjbGFzcyBCYXNlXG4gICAgICAgICAgICBjb25zdHJ1Y3RvcjogKGFyZ3MpIC0+XG4gICAgICAgICAgICAgIHBpdm90ID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICAgICAgICBsZWZ0ID0gW11cbiAgICAgICAgICAgICAgcmlnaHQgPSBbXVxuXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJoZWxsb1wiXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogb3JpZ2luYWxUZXh0XG5cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRHcmFtbWFyKG9sZEdyYW1tYXIpXG5cbiAgICBpdCAndG9nZ2xlIGNvbW1lbnQgZm9yIHRleHRvYmplY3QgZm9yIGluZGVudCBhbmQgcmVwZWF0YWJsZScsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMiwgMF1cbiAgICAgIGVuc3VyZSAnZyAvIGkgaScsXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGNsYXNzIEJhc2VcbiAgICAgICAgICAgIGNvbnN0cnVjdG9yOiAoYXJncykgLT5cbiAgICAgICAgICAgICAgIyBwaXZvdCA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgICAgICAgIyBsZWZ0ID0gW11cbiAgICAgICAgICAgICAgIyByaWdodCA9IFtdXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcImhlbGxvXCJcbiAgICAgICAgXCJcIlwiXG4gICAgICBlbnN1cmUgJy4nLCB0ZXh0OiBvcmlnaW5hbFRleHRcblxuICAgIGl0ICd0b2dnbGUgY29tbWVudCBmb3IgdGV4dG9iamVjdCBmb3IgcGFyYWdyYXBoIGFuZCByZXBlYXRhYmxlJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFsyLCAwXVxuICAgICAgZW5zdXJlICdnIC8gaSBwJyxcbiAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgIyBjbGFzcyBCYXNlXG4gICAgICAgICAgIyAgIGNvbnN0cnVjdG9yOiAoYXJncykgLT5cbiAgICAgICAgICAjICAgICBwaXZvdCA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgICAjICAgICBsZWZ0ID0gW11cbiAgICAgICAgICAjICAgICByaWdodCA9IFtdXG5cbiAgICAgICAgICBjb25zb2xlLmxvZyBcImhlbGxvXCJcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgIGVuc3VyZSAnLicsIHRleHQ6IG9yaWdpbmFsVGV4dFxuXG4gIGRlc2NyaWJlIFwiU3BsaXRTdHJpbmcsIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIC8nOiAndmltLW1vZGUtcGx1czpzcGxpdC1zdHJpbmcnXG4gICAgICAgICAgJ2cgPyc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LXN0cmluZy13aXRoLWtlZXBpbmctc3BsaXR0ZXInXG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICB8YTpiOmNcbiAgICAgICAgZDplOmZcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJTcGxpdFN0cmluZ1wiLCAtPlxuICAgICAgaXQgXCJzcGxpdCBzdHJpbmcgaW50byBsaW5lc1wiLCAtPlxuICAgICAgICBlbnN1cmUgXCJnIC8gOiBlbnRlclwiLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICB8YVxuICAgICAgICAgIGJcbiAgICAgICAgICBjXG4gICAgICAgICAgZDplOmZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiRyAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGFcbiAgICAgICAgICBiXG4gICAgICAgICAgY1xuICAgICAgICAgIHxkXG4gICAgICAgICAgZVxuICAgICAgICAgIGZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwiW2Zyb20gbm9ybWFsXSBrZWVwIG11bHRpLWN1cnNvcnMgb24gY2FuY2VsXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0Q186IFwiICAwfDEyICAzNDUgIDYhNzggIDlhYiAgY3xkZSAgZmdoXCJcbiAgICAgICAgZW5zdXJlIFwiZyAvIDogZXNjYXBlXCIsIHRleHRDXzogXCIgIDB8MTIgIDM0NSAgNiE3OCAgOWFiICBjfGRlICBmZ2hcIlxuICAgICAgaXQgXCJbZnJvbSB2aXN1YWxdIGtlZXAgbXVsdGktY3Vyc29ycyBvbiBjYW5jZWxcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICAgICAgICAgdGV4dEM6IFwiICAwfDEyICAzNDUgIDYhNzggIDlhYiAgY3xkZSAgZmdoXCJcbiAgICAgICAgZW5zdXJlIFwidlwiLCAgICAgICAgICB0ZXh0QzogXCIgIDAxfDIgIDM0NSAgNjchOCAgOWFiICBjZHxlICBmZ2hcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMVwiLCBcIjdcIiwgXCJkXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG4gICAgICAgIGVuc3VyZSBcImcgLyBlc2NhcGVcIiwgdGV4dEM6IFwiICAwMXwyICAzNDUgIDY3ITggIDlhYiAgY2R8ZSAgZmdoXCIsIHNlbGVjdGVkVGV4dE9yZGVyZWQ6IFtcIjFcIiwgXCI3XCIsIFwiZFwiXSwgbW9kZTogW1widmlzdWFsXCIsIFwiY2hhcmFjdGVyd2lzZVwiXVxuXG4gICAgZGVzY3JpYmUgXCJTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXJcIiwgLT5cbiAgICAgIGl0IFwic3BsaXQgc3RyaW5nIGludG8gbGluZXMgd2l0aG91dCByZW1vdmluZyBzcGxpdGVyIGNoYXJcIiwgLT5cbiAgICAgICAgZW5zdXJlIFwiZyA/IDogZW50ZXJcIixcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGE6XG4gICAgICAgICAgYjpcbiAgICAgICAgICBjXG4gICAgICAgICAgZDplOmZcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlIFwiRyAuXCIsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGE6XG4gICAgICAgICAgYjpcbiAgICAgICAgICBjXG4gICAgICAgICAgfGQ6XG4gICAgICAgICAgZTpcbiAgICAgICAgICBmXFxuXG4gICAgICAgICAgXCJcIlwiXG4gICAgICBpdCBcImtlZXAgbXVsdGktY3Vyc29ycyBvbiBjYW5jZWxcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDXzogXCIgIDB8MTIgIDM0NSAgNiE3OCAgOWFiICBjfGRlICBmZ2hcIlxuICAgICAgICBlbnN1cmUgXCJnID8gOiBlc2NhcGVcIiwgdGV4dENfOiBcIiAgMHwxMiAgMzQ1ICA2ITc4ICA5YWIgIGN8ZGUgIGZnaFwiXG4gICAgICBpdCBcIltmcm9tIHZpc3VhbF0ga2VlcCBtdWx0aS1jdXJzb3JzIG9uIGNhbmNlbFwiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgICB0ZXh0QzogXCIgIDB8MTIgIDM0NSAgNiE3OCAgOWFiICBjfGRlICBmZ2hcIlxuICAgICAgICBlbnN1cmUgXCJ2XCIsICAgICAgICAgIHRleHRDOiBcIiAgMDF8MiAgMzQ1ICA2NyE4ICA5YWIgIGNkfGUgIGZnaFwiLCBzZWxlY3RlZFRleHRPcmRlcmVkOiBbXCIxXCIsIFwiN1wiLCBcImRcIl0sIG1vZGU6IFtcInZpc3VhbFwiLCBcImNoYXJhY3Rlcndpc2VcIl1cbiAgICAgICAgZW5zdXJlIFwiZyA/IGVzY2FwZVwiLCB0ZXh0QzogXCIgIDAxfDIgIDM0NSAgNjchOCAgOWFiICBjZHxlICBmZ2hcIiwgc2VsZWN0ZWRUZXh0T3JkZXJlZDogW1wiMVwiLCBcIjdcIiwgXCJkXCJdLCBtb2RlOiBbXCJ2aXN1YWxcIiwgXCJjaGFyYWN0ZXJ3aXNlXCJdXG5cbiAgZGVzY3JpYmUgXCJTcGxpdEFyZ3VtZW50cywgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1czpub3QoLmluc2VydC1tb2RlKSc6XG4gICAgICAgICAgJ2cgLCc6ICd2aW0tbW9kZS1wbHVzOnNwbGl0LWFyZ3VtZW50cydcbiAgICAgICAgICAnZyAhJzogJ3ZpbS1tb2RlLXBsdXM6c3BsaXQtYXJndW1lbnRzLXdpdGgtcmVtb3ZlLXNlcGFyYXRvcidcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgZ3JhbW1hcjogJ3NvdXJjZS5qcydcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB7ZjEsIGYyLCBmM30gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxKGYyKDEsIFwiYSwgYiwgY1wiKSwgMiwgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKSlcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJTcGxpdEFyZ3VtZW50c1wiLCAtPlxuICAgICAgaXQgXCJzcGxpdCBieSBjb21tbWEgd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgLCBpIHsnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB8e1xuICAgICAgICAgICAgICAgIGYxLFxuICAgICAgICAgICAgICAgIGYyLFxuICAgICAgICAgICAgICAgIGYzXG4gICAgICAgICAgICAgIH0gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxKGYyKDEsIFwiYSwgYiwgY1wiKSwgMiwgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKSlcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgaXQgXCJzcGxpdCBieSBjb21tbWEgd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsyLCA1XVxuICAgICAgICBlbnN1cmUgJ2cgLCBpICgnLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgICB7ZjEsIGYyLCBmM30gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICAgIGYxfChcbiAgICAgICAgICAgICAgICBmMigxLCBcImEsIGIsIGNcIiksXG4gICAgICAgICAgICAgICAgMixcbiAgICAgICAgICAgICAgICAoYXJnKSA9PiBjb25zb2xlLmxvZyhhcmcpXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgcyA9IGBhYmMgZGVmIGhpamBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBrZXlzdHJva2UgJ2ogdydcbiAgICAgICAgZW5zdXJlICdnICwgaSAoJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShcbiAgICAgICAgICAgICAgICBmMnwoXG4gICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgXCJhLCBiLCBjXCJcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAgICAgKGFyZykgPT4gY29uc29sZS5sb2coYXJnKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHMgPSBgYWJjIGRlZiBoaWpgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGl0IFwic3BsaXQgYnkgd2hpdGUtc3BhY2Ugd2l0aCBhZGp1c3QgaW5kZW50XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFszLCAxMF1cbiAgICAgICAgZW5zdXJlICdnICwgaSBgJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBoZWxsbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAge2YxLCBmMiwgZjN9ID0gcmVxdWlyZSgnaGVsbG8nKVxuICAgICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICAgIHMgPSB8YFxuICAgICAgICAgICAgICBhYmNcbiAgICAgICAgICAgICAgZGVmXG4gICAgICAgICAgICAgIGhpalxuICAgICAgICAgICAgICBgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiU3BsaXRCeUFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGl0IFwicmVtb3ZlIHNwbGl0dGVyIHdoZW4gc3BsaXRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAnZyAhIGkgeycsXG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIGhlbGxvID0gKCkgPT4ge1xuICAgICAgICAgICAgfHtcbiAgICAgICAgICAgICAgZjFcbiAgICAgICAgICAgICAgZjJcbiAgICAgICAgICAgICAgZjNcbiAgICAgICAgICAgIH0gPSByZXF1aXJlKCdoZWxsbycpXG4gICAgICAgICAgICBmMShmMigxLCBcImEsIGIsIGNcIiksIDIsIChhcmcpID0+IGNvbnNvbGUubG9nKGFyZykpXG4gICAgICAgICAgICBzID0gYGFiYyBkZWYgaGlqYFxuICAgICAgICAgIH1cbiAgICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIkNoYW5nZSBPcmRlciBmYWltbGl5OiBSZXZlcnNlLCBTb3J0LCBTb3J0Q2FzZUluc2Vuc2l0aXZlbHksIFNvcnRCeU51bWJlclwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICdnIHInOiAndmltLW1vZGUtcGx1czpyZXZlcnNlJ1xuICAgICAgICAgICdnIHMnOiAndmltLW1vZGUtcGx1czpzb3J0J1xuICAgICAgICAgICdnIFMnOiAndmltLW1vZGUtcGx1czpzb3J0LWJ5LW51bWJlcidcbiAgICBkZXNjcmliZSBcImNoYXJhY3Rlcndpc2UgdGFyZ2V0XCIsIC0+XG4gICAgICBkZXNjcmliZSBcIlJldmVyc2VcIiwgLT5cbiAgICAgICAgaXQgXCJbY29tbWEgc2VwYXJhdGVkXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiICAgKCBkb2csIGNhfHQsIGZpc2gsIHJhYmJpdCwgZHVjaywgZ29waGVyLCBzcXVpZCApXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLCB0ZXh0Q186IFwiICAgKHwgc3F1aWQsIGdvcGhlciwgZHVjaywgcmFiYml0LCBmaXNoLCBjYXQsIGRvZyApXCJcbiAgICAgICAgaXQgXCJbY29tbWEgc3BhcmF0ZWRdIHJldmVyc2UgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoICdkb2cgY2F8dCcsICdmaXNoIHJhYmJpdCcsICdkdWNrIGdvcGhlciBzcXVpZCcgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSAoJywgdGV4dENfOiBcIiAgICh8ICdkdWNrIGdvcGhlciBzcXVpZCcsICdmaXNoIHJhYmJpdCcsICdkb2cgY2F0JyApXCJcbiAgICAgICAgaXQgXCJbc3BhY2Ugc3BhcmF0ZWRdIHJldmVyc2UgdGV4dFwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0QzogXCIgICAoIGRvZyBjYXx0IGZpc2ggcmFiYml0IGR1Y2sgZ29waGVyIHNxdWlkIClcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsIHRleHRDXzogXCIgICAofCBzcXVpZCBnb3BoZXIgZHVjayByYWJiaXQgZmlzaCBjYXQgZG9nIClcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSByZXZlcnNlIHRleHRcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB8MSwgMiwgMywgNCxcbiAgICAgICAgICAgICAgNSwgNixcbiAgICAgICAgICAgICAgNyxcbiAgICAgICAgICAgICAgOCwgOVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdnIHIgaSB7JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgIHwgIDksIDgsIDcsIDYsXG4gICAgICAgICAgICAgIDUsIDQsXG4gICAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAgIDIsIDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcIltjb21tYSBzcGFyYXRlZCBtdWx0aS1saW5lXSBrZWVwIGNvbW1hIGZvbGxvd2VkIHRvIGxhc3QgZW50cnlcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICB8MSwgMiwgMywgNCxcbiAgICAgICAgICAgICAgNSwgNixcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgWycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICB8ICA2LCA1LCA0LCAzLFxuICAgICAgICAgICAgICAyLCAxLFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiW2NvbW1hIHNwYXJhdGVkIG11bHRpLWxpbmVdIGF3YXJlIG9mIG5leHRlZCBwYWlyIGFuZCBxdW90ZXMgYW5kIGVzY2FwZWQgcXVvdGVcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICB8XCIoYSwgYiwgYylcIiwgXCJbKCBkIGUgZlwiLCB0ZXN0KGcsIGgsIGkpLFxuICAgICAgICAgICAgICBcIlxcXFxcImosIGssIGxcIixcbiAgICAgICAgICAgICAgJ1xcXFwnbSwgbicsIHRlc3QobywgcCksXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgciBpICgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgfCAgdGVzdChvLCBwKSwgJ1xcXFwnbSwgbicsIFwiXFxcXFwiaiwgaywgbFwiLFxuICAgICAgICAgICAgICB0ZXN0KGcsIGgsIGkpLFxuICAgICAgICAgICAgICBcIlsoIGQgZSBmXCIsIFwiKGEsIGIsIGMpXCIsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJbc3BhY2Ugc3BhcmF0ZWQgbXVsdGktbGluZV0gYXdhcmUgb2YgbmV4dGVkIHBhaXIgYW5kIHF1b3RlcyBhbmQgZXNjYXBlZCBxdW90ZVwiLCAtPlxuICAgICAgICAgIHNldCB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgICB8XCIoYSwgYiwgYylcIiBcIlsoIGQgZSBmXCIgICAgICB0ZXN0KGcsIGgsIGkpXG4gICAgICAgICAgICAgIFwiXFxcXFwiaiwgaywgbFwiX19fXG4gICAgICAgICAgICAgICdcXFxcJ20sIG4nICAgIHRlc3QobywgcClcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGVuc3VyZSAnZyByIGkgKCcsXG4gICAgICAgICAgICB0ZXh0Q186IFwiXCJcIlxuICAgICAgICAgICAgKFxuICAgICAgICAgICAgfCAgdGVzdChvLCBwKSAnXFxcXCdtLCBuJyAgICAgIFwiXFxcXFwiaiwgaywgbFwiXG4gICAgICAgICAgICAgIHRlc3QoZywgaCwgaSlfX19cbiAgICAgICAgICAgICAgXCJbKCBkIGUgZlwiICAgIFwiKGEsIGIsIGMpXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0XCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gc29ydCB0ZXh0XCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcIiAgICggZG9nLCBjYXx0LCBmaXNoLCByYWJiaXQsIGR1Y2ssIGdvcGhlciwgc3F1aWQgKVwiXG4gICAgICAgICAgZW5zdXJlICdnIHMgaSAoJywgdGV4dEM6IFwiICAgKHwgY2F0LCBkb2csIGR1Y2ssIGZpc2gsIGdvcGhlciwgcmFiYml0LCBzcXVpZCApXCJcbiAgICAgIGRlc2NyaWJlIFwiU29ydEJ5TnVtYmVyXCIsIC0+XG4gICAgICAgIGl0IFwiW2NvbW1hIHNlcGFyYXRlZF0gc29ydCBieSBudW1iZXJcIiwgLT5cbiAgICAgICAgICBzZXQgdGV4dENfOiBcIl9fXyg5LCAxLCB8MTAsIDUpXCJcbiAgICAgICAgICBlbnN1cmUgJ2cgUyBpICgnLCB0ZXh0Q186IFwiX19fKHwxLCA1LCA5LCAxMClcIlxuXG4gICAgZGVzY3JpYmUgXCJsaW5ld2lzZSB0YXJnZXRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgIHx6XG5cbiAgICAgICAgICAxMGFcbiAgICAgICAgICBiXG4gICAgICAgICAgYVxuXG4gICAgICAgICAgNVxuICAgICAgICAgIDFcXG5cbiAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwiUmV2ZXJzZVwiLCAtPlxuICAgICAgICBpdCBcInJldmVyc2Ugcm93c1wiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnZyByIEcnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfDFcbiAgICAgICAgICAgIDVcblxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgMTBhXG5cbiAgICAgICAgICAgIHpcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJTb3J0XCIsIC0+XG4gICAgICAgIGl0IFwic29ydCByb3dzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdnIHMgRycsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8XG5cbiAgICAgICAgICAgIDFcbiAgICAgICAgICAgIDEwYVxuICAgICAgICAgICAgNVxuICAgICAgICAgICAgYVxuICAgICAgICAgICAgYlxuICAgICAgICAgICAgelxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRCeU51bWJlclwiLCAtPlxuICAgICAgICBpdCBcInNvcnQgcm93cyBudW1lcmljYWxseVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSBcImcgUyBHXCIsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MVxuICAgICAgICAgICAgNVxuICAgICAgICAgICAgMTBhXG4gICAgICAgICAgICB6XG5cbiAgICAgICAgICAgIGJcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIFxcblxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIlNvcnRDYXNlSW5zZW5zaXRpdmVseVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAgICdhdG9tLXRleHQtZWRpdG9yLnZpbS1tb2RlLXBsdXM6bm90KC5pbnNlcnQtbW9kZSknOlxuICAgICAgICAgICAgICAnZyBzJzogJ3ZpbS1tb2RlLXBsdXM6c29ydC1jYXNlLWluc2Vuc2l0aXZlbHknXG4gICAgICAgIGl0IFwiU29ydCByb3dzIGNhc2UtaW5zZW5zaXRpdmVseVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfGFwcGxlXG4gICAgICAgICAgICBCZWVmXG4gICAgICAgICAgICBBUFBMRVxuICAgICAgICAgICAgRE9HXG4gICAgICAgICAgICBiZWVmXG4gICAgICAgICAgICBBcHBsZVxuICAgICAgICAgICAgQkVFRlxuICAgICAgICAgICAgRG9nXG4gICAgICAgICAgICBkb2dcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZyBzIEdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgYXBwbGVcbiAgICAgICAgICAgIEFwcGxlXG4gICAgICAgICAgICBBUFBMRVxuICAgICAgICAgICAgYmVlZlxuICAgICAgICAgICAgQmVlZlxuICAgICAgICAgICAgQkVFRlxuICAgICAgICAgICAgZG9nXG4gICAgICAgICAgICBEb2dcbiAgICAgICAgICAgIERPR1xcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJOdW1iZXJpbmdMaW5lc1wiLCAtPlxuICAgIGVuc3VyZU51bWJlcmluZyA9IChhcmdzLi4uKSAtPlxuICAgICAgZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICd2aW0tbW9kZS1wbHVzOm51bWJlcmluZy1saW5lcycpXG4gICAgICBlbnN1cmUgYXJncy4uLlxuXG4gICAgYmVmb3JlRWFjaCAtPiBzZXQgdGV4dEM6IFwifGFcXG5iXFxuY1xcblxcblwiXG4gICAgaXQgXCJudW1iZXJpbmcgYnkgbW90aW9uXCIsIC0+ICAgICBlbnN1cmVOdW1iZXJpbmcgXCJqXCIsIHRleHRDOiBcInwxOiBhXFxuMjogYlxcbmNcXG5cXG5cIlxuICAgIGl0IFwibnVtYmVyaW5nIGJ5IHRleHQtb2JqZWN0XCIsIC0+IGVuc3VyZU51bWJlcmluZyBcInBcIiwgdGV4dEM6IFwifDE6IGFcXG4yOiBiXFxuMzogY1xcblxcblwiXG4iXX0=
