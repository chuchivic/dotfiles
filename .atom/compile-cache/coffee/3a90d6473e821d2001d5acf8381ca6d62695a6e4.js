(function() {
  var TextData, dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData;

  settings = require('../lib/settings');

  describe("Motion Find", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      settings.set('useExperimentalFasterInput', true);
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    xdescribe('the f performance', function() {
      var measureWithPerformanceNow, measureWithTimeEnd, timesToExecute;
      timesToExecute = 500;
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      measureWithPerformanceNow = function(fn) {
        var t0, t1;
        t0 = performance.now();
        fn();
        t1 = performance.now();
        return console.log("[performance.now] took " + (t1 - t0) + " msec");
      };
      beforeEach(function() {
        return set({
          text: "  " + "l".repeat(timesToExecute),
          cursor: [0, 0]
        });
      });
      xdescribe('the f read-char-via-keybinding performance', function() {
        beforeEach(function() {
          return vimState.useMiniEditor = false;
        });
        return it('[with keybind] moves to l char', function() {
          var testPerformanceOfKeybind;
          testPerformanceOfKeybind = function() {
            var i, n, ref2;
            for (n = i = 1, ref2 = timesToExecute; 1 <= ref2 ? i <= ref2 : i >= ref2; n = 1 <= ref2 ? ++i : --i) {
              keystroke("f l");
            }
            return ensure({
              cursor: [0, timesToExecute + 1]
            });
          };
          console.log("== keybind");
          ensure("f l", {
            cursor: [0, 2]
          });
          set({
            cursor: [0, 0]
          });
          return measureWithTimeEnd(testPerformanceOfKeybind);
        });
      });
      return describe('[with hidden-input] moves to l char', function() {
        return it('[with hidden-input] moves to l char', function() {
          var testPerformanceOfHiddenInput;
          testPerformanceOfHiddenInput = function() {
            var i, n, ref2;
            for (n = i = 1, ref2 = timesToExecute; 1 <= ref2 ? i <= ref2 : i >= ref2; n = 1 <= ref2 ? ++i : --i) {
              keystroke('f l');
            }
            return ensure({
              cursor: [0, timesToExecute + 1]
            });
          };
          console.log("== hidden");
          ensure('f l', {
            cursor: [0, 2]
          });
          set({
            cursor: [0, 0]
          });
          return measureWithTimeEnd(testPerformanceOfHiddenInput);
        });
      });
    });
    describe('the f/F keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the first specified character it finds', function() {
        return ensure('f c', {
          cursor: [0, 2]
        });
      });
      it('extends visual selection in visual-mode and repetable', function() {
        ensure('v', {
          mode: ['visual', 'characterwise']
        });
        ensure('f c', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
        ensure(';', {
          selectedText: 'abcabc',
          cursor: [0, 6]
        });
        return ensure(',', {
          selectedText: 'abc',
          cursor: [0, 3]
        });
      });
      it('moves backwards to the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure('F a', {
          cursor: [0, 0]
        });
      });
      it('respects count forward', function() {
        return ensure('2 f a', {
          cursor: [0, 6]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure('2 F a', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure('f d', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure('1 0 f a', {
          cursor: [0, 0]
        });
        ensure('1 1 f a', {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure('1 0 F a', {
          cursor: [0, 6]
        });
        return ensure('1 1 F a', {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d 2 f a', {
          text: 'abcbc\n'
        });
      });
      return it("F behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d F a', {
          text: 'abcabcabc\n'
        });
      });
    });
    describe("[regression gurad] repeat(; or ,) after used as operator target", function() {
      it("repeat after d f", function() {
        set({
          textC: "a1    |a2    a3    a4"
        });
        ensure("d f a", {
          textC: "a1    |3    a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a1    3    |a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "|a1    3    a4",
          mode: "normal",
          selectedText: ""
        });
      });
      it("repeat after d t", function() {
        set({
          textC: "|a1    a2    a3    a4"
        });
        ensure("d t a", {
          textC: "|a2    a3    a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a2   | a3    a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "a|2    a3    a4",
          mode: "normal",
          selectedText: ""
        });
      });
      it("repeat after d F", function() {
        set({
          textC: "a1    a2    a3    |a4"
        });
        ensure("d F a", {
          textC: "a1    a2    |a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a1    |a2    a4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "a1    a2    |a4",
          mode: "normal",
          selectedText: ""
        });
      });
      return it("repeat after d T", function() {
        set({
          textC: "a1    a2    a3    |a4"
        });
        set({
          textC: "a1    a2    a|a4"
        });
        ensure("d T a", {
          textC: "a1    a2    a|a4",
          mode: "normal",
          selectedText: ""
        });
        ensure(";", {
          textC: "a1    a|2    aa4",
          mode: "normal",
          selectedText: ""
        });
        return ensure(",", {
          textC: "a1    a2   | aa4",
          mode: "normal",
          selectedText: ""
        });
      });
    });
    describe("cancellation", function() {
      return it("keeps multiple-cursors when cancelled", function() {
        set({
          textC: "|   a\n!   a\n|   a\n"
        });
        return ensure("f escape", {
          textC: "|   a\n!   a\n|   a\n"
        });
      });
    });
    describe('the t/T keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it('moves to the character previous to the first specified character it finds', function() {
        ensure('t a', {
          cursor: [0, 2]
        });
        return ensure('t a', {
          cursor: [0, 2]
        });
      });
      it('moves backwards to the character after the first specified character it finds', function() {
        set({
          cursor: [0, 2]
        });
        return ensure('T a', {
          cursor: [0, 1]
        });
      });
      it('respects count forward', function() {
        return ensure('2 t a', {
          cursor: [0, 5]
        });
      });
      it('respects count backward', function() {
        set({
          cursor: [0, 6]
        });
        return ensure('2 T a', {
          cursor: [0, 1]
        });
      });
      it("doesn't move if the character specified isn't found", function() {
        return ensure('t d', {
          cursor: [0, 0]
        });
      });
      it("doesn't move if there aren't the specified count of the specified character", function() {
        ensure('1 0 t d', {
          cursor: [0, 0]
        });
        ensure('1 1 t a', {
          cursor: [0, 0]
        });
        set({
          cursor: [0, 6]
        });
        ensure('1 0 T a', {
          cursor: [0, 6]
        });
        return ensure('1 1 T a', {
          cursor: [0, 6]
        });
      });
      it("composes with d", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d 2 t b', {
          text: 'abcbcabc\n'
        });
      });
      it("delete char under cursor even when no movement happens since it's inclusive motion", function() {
        set({
          cursor: [0, 0]
        });
        return ensure('d t b', {
          text: 'bcabcabcabc\n'
        });
      });
      it("do nothing when inclusiveness inverted by v operator-modifier", function() {
        ({
          text: "abcabcabcabc\n"
        });
        set({
          cursor: [0, 0]
        });
        return ensure('d v t b', {
          text: 'abcabcabcabc\n'
        });
      });
      it("T behaves exclusively when composes with operator", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d T b', {
          text: 'ababcabcabc\n'
        });
      });
      return it("T don't delete character under cursor even when no movement happens", function() {
        set({
          cursor: [0, 3]
        });
        return ensure('d T c', {
          text: 'abcabcabcabc\n'
        });
      });
    });
    describe('the ; and , keybindings', function() {
      beforeEach(function() {
        return set({
          text: "abcabcabcabc\n",
          cursor: [0, 0]
        });
      });
      it("repeat f in same direction", function() {
        ensure('f c', {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 8]
        });
      });
      it("repeat F in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure('F c', {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(';', {
          cursor: [0, 2]
        });
      });
      it("repeat f in opposite direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure('f c', {
          cursor: [0, 8]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("repeat F in opposite direction", function() {
        set({
          cursor: [0, 4]
        });
        ensure('F c', {
          cursor: [0, 2]
        });
        ensure(',', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("alternate repeat f in same direction and reverse", function() {
        ensure('f c', {
          cursor: [0, 2]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 2]
        });
      });
      it("alternate repeat F in same direction and reverse", function() {
        set({
          cursor: [0, 10]
        });
        ensure('F c', {
          cursor: [0, 8]
        });
        ensure(';', {
          cursor: [0, 5]
        });
        return ensure(',', {
          cursor: [0, 8]
        });
      });
      it("repeat t in same direction", function() {
        ensure('t c', {
          cursor: [0, 1]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in same direction", function() {
        set({
          cursor: [0, 10]
        });
        ensure('T c', {
          cursor: [0, 9]
        });
        return ensure(';', {
          cursor: [0, 6]
        });
      });
      it("repeat t in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 3]
        });
        ensure('t c', {
          cursor: [0, 4]
        });
        ensure(',', {
          cursor: [0, 3]
        });
        return ensure(';', {
          cursor: [0, 4]
        });
      });
      it("repeat T in opposite direction first, and then reverse", function() {
        set({
          cursor: [0, 4]
        });
        ensure('T c', {
          cursor: [0, 3]
        });
        ensure(',', {
          cursor: [0, 4]
        });
        return ensure(';', {
          cursor: [0, 3]
        });
      });
      it("repeat with count in same direction", function() {
        set({
          cursor: [0, 0]
        });
        ensure('f c', {
          cursor: [0, 2]
        });
        return ensure('2 ;', {
          cursor: [0, 8]
        });
      });
      return it("repeat with count in reverse direction", function() {
        set({
          cursor: [0, 6]
        });
        ensure('f c', {
          cursor: [0, 8]
        });
        return ensure('2 ,', {
          cursor: [0, 2]
        });
      });
    });
    describe("last find/till is repeatable on other editor", function() {
      var other, otherEditor, pane, ref2;
      ref2 = [], other = ref2[0], otherEditor = ref2[1], pane = ref2[2];
      beforeEach(function() {
        return getVimState(function(otherVimState, _other) {
          set({
            text: "a baz bar\n",
            cursor: [0, 0]
          });
          other = _other;
          other.set({
            text: "foo bar baz",
            cursor: [0, 0]
          });
          otherEditor = otherVimState.editor;
          pane = atom.workspace.getActivePane();
          return pane.activateItem(editor);
        });
      });
      it("shares the most recent find/till command with other editors", function() {
        ensure('f b', {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        other.keystroke(';');
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 4]
        });
        other.keystroke('t r');
        ensure({
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 5]
        });
        pane.activateItem(editor);
        ensure(';', {
          cursor: [0, 7]
        });
        return other.ensure({
          cursor: [0, 5]
        });
      });
      return it("is still repeatable after original editor was destroyed", function() {
        ensure('f b', {
          cursor: [0, 2]
        });
        other.ensure({
          cursor: [0, 0]
        });
        pane.activateItem(otherEditor);
        editor.destroy();
        expect(editor.isAlive()).toBe(false);
        other.ensure(';', {
          cursor: [0, 4]
        });
        other.ensure(';', {
          cursor: [0, 8]
        });
        return other.ensure(',', {
          cursor: [0, 4]
        });
      });
    });
    return describe("vmp unique feature of `f` family", function() {
      describe("ignoreCaseForFind", function() {
        beforeEach(function() {
          return settings.set("ignoreCaseForFind", true);
        });
        return it("ignore case to find", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    ab    |a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
      });
      describe("useSmartcaseForFind", function() {
        beforeEach(function() {
          return settings.set("useSmartcaseForFind", true);
        });
        it("ignore case when input is lower char", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure(";", {
            textC: "    A    ab    |a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
        return it("find case-sensitively when input is lager char", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f A", {
            textC: "    |A    ab    a    Ab    a"
          });
          ensure("f A", {
            textC: "    A    ab    a    |Ab    a"
          });
          ensure(",", {
            textC: "    |A    ab    a    Ab    a"
          });
          return ensure(";", {
            textC: "    A    ab    a    |Ab    a"
          });
        });
      });
      describe("reuseFindForRepeatFind", function() {
        beforeEach(function() {
          return settings.set("reuseFindForRepeatFind", true);
        });
        it("can reuse f and t as ;, F and T as ',' respectively", function() {
          set({
            textC: "|    A    ab    a    Ab    a"
          });
          ensure("f a", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure("f", {
            textC: "    A    ab    |a    Ab    a"
          });
          ensure("f", {
            textC: "    A    ab    a    Ab    |a"
          });
          ensure("F", {
            textC: "    A    ab    |a    Ab    a"
          });
          ensure("F", {
            textC: "    A    |ab    a    Ab    a"
          });
          ensure("t", {
            textC: "    A    ab   | a    Ab    a"
          });
          ensure("t", {
            textC: "    A    ab    a    Ab   | a"
          });
          ensure("T", {
            textC: "    A    ab    a|    Ab    a"
          });
          return ensure("T", {
            textC: "    A    a|b    a    Ab    a"
          });
        });
        return it("behave as normal f if no successful previous find was exists", function() {
          set({
            textC: "  |  A    ab    a    Ab    a"
          });
          ensure("f escape", {
            textC: "  |  A    ab    a    Ab    a"
          });
          expect(vimState.globalState.get("currentFind")).toBeNull();
          ensure("f a", {
            textC: "    A    |ab    a    Ab    a"
          });
          return expect(vimState.globalState.get("currentFind")).toBeTruthy();
        });
      });
      describe("findAcrossLines", function() {
        beforeEach(function() {
          return settings.set("findAcrossLines", true);
        });
        return it("searches across multiple lines", function() {
          set({
            textC: "|0:    a    a\n1:    a    a\n2:    a    a\n"
          });
          ensure("f a", {
            textC: "0:    |a    a\n1:    a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    |a\n1:    a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    |a    a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          ensure(";", {
            textC: "0:    a    a\n1:    a    a\n2:    |a    a\n"
          });
          ensure("F a", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          ensure("t a", {
            textC: "0:    a    a\n1:    a    a\n2:   | a    a\n"
          });
          ensure("T a", {
            textC: "0:    a    a\n1:    a    |a\n2:    a    a\n"
          });
          return ensure("T a", {
            textC: "0:    a    a\n1:    a|    a\n2:    a    a\n"
          });
        });
      });
      describe("find-next/previous-pre-confirmed", function() {
        beforeEach(function() {
          settings.set("findCharsMax", 10);
          return jasmine.attachToDOM(atom.workspace.getElement());
        });
        return describe("can find one or two char", function() {
          it("adjust to next-pre-confirmed", function() {
            var element;
            set({
              textC: "|    a    ab    a    cd    a"
            });
            keystroke("f a");
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            return ensure("enter", {
              textC: "    a    ab    |a    cd    a"
            });
          });
          it("adjust to previous-pre-confirmed", function() {
            var element;
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("3 f a enter", {
              textC: "    a    ab    |a    cd    a"
            });
            set({
              textC: "|    a    ab    a    cd    a"
            });
            keystroke("3 f a");
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-previous-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-previous-pre-confirmed");
            return ensure("enter", {
              textC: "    |a    ab    a    cd    a"
            });
          });
          return it("is useful to skip earlier spot interactivelly", function() {
            var element;
            set({
              textC: 'text = "this is |\"example\" of use case"'
            });
            keystroke('c t "');
            element = vimState.inputEditor.element;
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            dispatch(element, "vim-mode-plus:find-next-pre-confirmed");
            return ensure("enter", {
              textC: 'text = "this is |"',
              mode: "insert"
            });
          });
        });
      });
      return describe("findCharsMax", function() {
        beforeEach(function() {
          return jasmine.attachToDOM(atom.workspace.getElement());
        });
        describe("with 2 length", function() {
          beforeEach(function() {
            return settings.set("findCharsMax", 2);
          });
          return describe("can find one or two char", function() {
            it("can find by two char", function() {
              set({
                textC: "|    a    ab    a    cd    a"
              });
              ensure("f a b", {
                textC: "    a    |ab    a    cd    a"
              });
              return ensure("f c d", {
                textC: "    a    ab    a    |cd    a"
              });
            });
            return it("can find by one-char by confirming explicitly", function() {
              set({
                textC: "|    a    ab    a    cd    a"
              });
              ensure("f a enter", {
                textC: "    |a    ab    a    cd    a"
              });
              return ensure("f c enter", {
                textC: "    a    ab    a    |cd    a"
              });
            });
          });
        });
        describe("with 3 length", function() {
          beforeEach(function() {
            return settings.set("findCharsMax", 3);
          });
          return describe("can find 3 at maximum", function() {
            return it("can find by one or two or three char", function() {
              set({
                textC: "|    a    ab    a    cd    efg"
              });
              ensure("f a b enter", {
                textC: "    a    |ab    a    cd    efg"
              });
              ensure("f a enter", {
                textC: "    a    ab    |a    cd    efg"
              });
              ensure("f c d enter", {
                textC: "    a    ab    a    |cd    efg"
              });
              return ensure("f e f g", {
                textC: "    a    ab    a    cd    |efg"
              });
            });
          });
        });
        return describe("autoConfirmTimeout", function() {
          beforeEach(function() {
            settings.set("findCharsMax", 2);
            return settings.set("findConfirmByTimeout", 500);
          });
          return it("auto-confirm single-char input on timeout", function() {
            set({
              textC: "|    a    ab    a    cd    a"
            });
            ensure("f a", {
              textC: "|    a    ab    a    cd    a"
            });
            advanceClock(500);
            ensure({
              textC: "    |a    ab    a    cd    a"
            });
            ensure("f c d", {
              textC: "    a    ab    a    |cd    a"
            });
            ensure("f a", {
              textC: "    a    ab    a    |cd    a"
            });
            advanceClock(500);
            ensure({
              textC: "    a    ab    a    cd    |a"
            });
            ensure("F b", {
              textC: "    a    ab    a    cd    |a"
            });
            advanceClock(500);
            return ensure({
              textC: "    a    a|b    a    cd    a"
            });
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL21vdGlvbi1maW5kLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFvQyxPQUFBLENBQVEsZUFBUixDQUFwQyxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0I7O0VBQ3hCLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSw0QkFBYixFQUEyQyxJQUEzQzthQUdBLFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7SUFKUyxDQUFYO0lBU0EsU0FBQSxDQUFVLG1CQUFWLEVBQStCLFNBQUE7QUFDN0IsVUFBQTtNQUFBLGNBQUEsR0FBaUI7TUFFakIsa0JBQUEsR0FBcUIsU0FBQyxFQUFEO1FBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBRSxDQUFDLElBQWhCO1FBQ0EsRUFBQSxDQUFBO2VBRUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBRSxDQUFDLElBQW5CO01BSm1CO01BTXJCLHlCQUFBLEdBQTRCLFNBQUMsRUFBRDtBQUMxQixZQUFBO1FBQUEsRUFBQSxHQUFLLFdBQVcsQ0FBQyxHQUFaLENBQUE7UUFDTCxFQUFBLENBQUE7UUFDQSxFQUFBLEdBQUssV0FBVyxDQUFDLEdBQVosQ0FBQTtlQUNMLE9BQU8sQ0FBQyxHQUFSLENBQVkseUJBQUEsR0FBeUIsQ0FBQyxFQUFBLEdBQUssRUFBTixDQUF6QixHQUFrQyxPQUE5QztNQUowQjtNQU01QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxJQUFBLEdBQU8sR0FBRyxDQUFDLE1BQUosQ0FBVyxjQUFYLENBQWI7VUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1NBREY7TUFEUyxDQUFYO01BS0EsU0FBQSxDQUFVLDRDQUFWLEVBQXdELFNBQUE7UUFDdEQsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsUUFBUSxDQUFDLGFBQVQsR0FBeUI7UUFEaEIsQ0FBWDtlQUdBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO0FBQ25DLGNBQUE7VUFBQSx3QkFBQSxHQUEyQixTQUFBO0FBQ3pCLGdCQUFBO0FBQUEsaUJBQXlCLDhGQUF6QjtjQUFBLFNBQUEsQ0FBVSxLQUFWO0FBQUE7bUJBQ0EsTUFBQSxDQUFPO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLGNBQUEsR0FBaUIsQ0FBckIsQ0FBUjthQUFQO1VBRnlCO1VBSTNCLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQWQ7VUFDQSxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0Esa0JBQUEsQ0FBbUIsd0JBQW5CO1FBUm1DLENBQXJDO01BSnNELENBQXhEO2FBZ0JBLFFBQUEsQ0FBUyxxQ0FBVCxFQUFnRCxTQUFBO2VBQzlDLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBO0FBQ3hDLGNBQUE7VUFBQSw0QkFBQSxHQUErQixTQUFBO0FBQzdCLGdCQUFBO0FBQUEsaUJBQXlCLDhGQUF6QjtjQUFBLFNBQUEsQ0FBVSxLQUFWO0FBQUE7bUJBQ0EsTUFBQSxDQUFPO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLGNBQUEsR0FBaUIsQ0FBckIsQ0FBUjthQUFQO1VBRjZCO1VBSS9CLE9BQU8sQ0FBQyxHQUFSLENBQVksV0FBWjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQWQ7VUFFQSxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0Esa0JBQUEsQ0FBbUIsNEJBQW5CO1FBVHdDLENBQTFDO01BRDhDLENBQWhEO0lBcEM2QixDQUEvQjtJQWtEQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtNQUM5QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQURTLENBQVg7TUFLQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTtlQUNwRCxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BRG9ELENBQXREO01BR0EsRUFBQSxDQUFHLHVEQUFILEVBQTRELFNBQUE7UUFDMUQsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBQU47U0FBZDtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxZQUFBLEVBQWMsS0FBZDtVQUF3QixNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFoQztTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLFlBQUEsRUFBYyxRQUFkO1VBQXdCLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWhDO1NBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1VBQUEsWUFBQSxFQUFjLEtBQWQ7VUFBd0IsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBaEM7U0FBZDtNQUowRCxDQUE1RDtNQU1BLEVBQUEsQ0FBRywyREFBSCxFQUFnRSxTQUFBO1FBQzlELEdBQUEsQ0FBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFGOEQsQ0FBaEU7TUFJQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtlQUMzQixNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBaEI7TUFEMkIsQ0FBN0I7TUFHQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtRQUM1QixHQUFBLENBQWdCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFoQjtlQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFoQjtNQUY0QixDQUE5QjtNQUlBLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO2VBQ3hELE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFEd0QsQ0FBMUQ7TUFHQSxFQUFBLENBQUcsNkVBQUgsRUFBa0YsU0FBQTtRQUNoRixNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7UUFFQSxNQUFBLENBQU8sU0FBUCxFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7UUFFQSxHQUFBLENBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtRQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtlQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtNQVBnRixDQUFsRjtNQVNBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO1FBQ3BCLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQWtCO1VBQUEsSUFBQSxFQUFNLFNBQU47U0FBbEI7TUFGb0IsQ0FBdEI7YUFJQSxFQUFBLENBQUcsbURBQUgsRUFBd0QsU0FBQTtRQUN0RCxHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLElBQUEsRUFBTSxhQUFOO1NBQWhCO01BRnNELENBQXhEO0lBMUM4QixDQUFoQztJQThDQSxRQUFBLENBQVMsaUVBQVQsRUFBNEUsU0FBQTtNQUMxRSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtRQUNyQixHQUFBLENBQWdCO1VBQUEsS0FBQSxFQUFPLHVCQUFQO1NBQWhCO1FBQ0EsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7VUFBQSxLQUFBLEVBQU8sZ0JBQVA7VUFBeUIsSUFBQSxFQUFNLFFBQS9CO1VBQXlDLFlBQUEsRUFBYyxFQUF2RDtTQUFoQjtRQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWdCO1VBQUEsS0FBQSxFQUFPLGdCQUFQO1VBQXlCLElBQUEsRUFBTSxRQUEvQjtVQUF5QyxZQUFBLEVBQWMsRUFBdkQ7U0FBaEI7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFnQjtVQUFBLEtBQUEsRUFBTyxnQkFBUDtVQUF5QixJQUFBLEVBQU0sUUFBL0I7VUFBeUMsWUFBQSxFQUFjLEVBQXZEO1NBQWhCO01BSnFCLENBQXZCO01BS0EsRUFBQSxDQUFHLGtCQUFILEVBQXVCLFNBQUE7UUFDckIsR0FBQSxDQUFnQjtVQUFBLEtBQUEsRUFBTyx1QkFBUDtTQUFoQjtRQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsS0FBQSxFQUFPLGlCQUFQO1VBQTBCLElBQUEsRUFBTSxRQUFoQztVQUEwQyxZQUFBLEVBQWMsRUFBeEQ7U0FBaEI7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFnQjtVQUFBLEtBQUEsRUFBTyxpQkFBUDtVQUEwQixJQUFBLEVBQU0sUUFBaEM7VUFBMEMsWUFBQSxFQUFjLEVBQXhEO1NBQWhCO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBZ0I7VUFBQSxLQUFBLEVBQU8saUJBQVA7VUFBMEIsSUFBQSxFQUFNLFFBQWhDO1VBQTBDLFlBQUEsRUFBYyxFQUF4RDtTQUFoQjtNQUpxQixDQUF2QjtNQUtBLEVBQUEsQ0FBRyxrQkFBSCxFQUF1QixTQUFBO1FBQ3JCLEdBQUEsQ0FBZ0I7VUFBQSxLQUFBLEVBQU8sdUJBQVA7U0FBaEI7UUFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLEtBQUEsRUFBTyxpQkFBUDtVQUEwQixJQUFBLEVBQU0sUUFBaEM7VUFBMEMsWUFBQSxFQUFjLEVBQXhEO1NBQWhCO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBZ0I7VUFBQSxLQUFBLEVBQU8saUJBQVA7VUFBMEIsSUFBQSxFQUFNLFFBQWhDO1VBQTBDLFlBQUEsRUFBYyxFQUF4RDtTQUFoQjtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWdCO1VBQUEsS0FBQSxFQUFPLGlCQUFQO1VBQTBCLElBQUEsRUFBTSxRQUFoQztVQUEwQyxZQUFBLEVBQWMsRUFBeEQ7U0FBaEI7TUFKcUIsQ0FBdkI7YUFLQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtRQUNyQixHQUFBLENBQWdCO1VBQUEsS0FBQSxFQUFPLHVCQUFQO1NBQWhCO1FBQ0EsR0FBQSxDQUFnQjtVQUFBLEtBQUEsRUFBTyxrQkFBUDtTQUFoQjtRQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO1VBQUEsS0FBQSxFQUFPLGtCQUFQO1VBQTJCLElBQUEsRUFBTSxRQUFqQztVQUEyQyxZQUFBLEVBQWMsRUFBekQ7U0FBaEI7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFnQjtVQUFBLEtBQUEsRUFBTyxrQkFBUDtVQUEyQixJQUFBLEVBQU0sUUFBakM7VUFBMkMsWUFBQSxFQUFjLEVBQXpEO1NBQWhCO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBZ0I7VUFBQSxLQUFBLEVBQU8sa0JBQVA7VUFBMkIsSUFBQSxFQUFNLFFBQWpDO1VBQTJDLFlBQUEsRUFBYyxFQUF6RDtTQUFoQjtNQUxxQixDQUF2QjtJQWhCMEUsQ0FBNUU7SUF1QkEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTthQUN2QixFQUFBLENBQUcsdUNBQUgsRUFBNEMsU0FBQTtRQUMxQyxHQUFBLENBQW9CO1VBQUEsS0FBQSxFQUFPLHVCQUFQO1NBQXBCO2VBQ0EsTUFBQSxDQUFPLFVBQVAsRUFBb0I7VUFBQSxLQUFBLEVBQU8sdUJBQVA7U0FBcEI7TUFGMEMsQ0FBNUM7SUFEdUIsQ0FBekI7SUFLQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtNQUM5QixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQURTLENBQVg7TUFLQSxFQUFBLENBQUcsMkVBQUgsRUFBZ0YsU0FBQTtRQUM5RSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO2VBRUEsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtNQUg4RSxDQUFoRjtNQUtBLEVBQUEsQ0FBRywrRUFBSCxFQUFvRixTQUFBO1FBQ2xGLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFGa0YsQ0FBcEY7TUFJQSxFQUFBLENBQUcsd0JBQUgsRUFBNkIsU0FBQTtlQUMzQixNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBaEI7TUFEMkIsQ0FBN0I7TUFHQSxFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtRQUM1QixHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBaEI7TUFGNEIsQ0FBOUI7TUFJQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtlQUN4RCxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BRHdELENBQTFEO01BR0EsRUFBQSxDQUFHLDZFQUFILEVBQWtGLFNBQUE7UUFDaEYsTUFBQSxDQUFPLFNBQVAsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO1FBRUEsTUFBQSxDQUFPLFNBQVAsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO1FBRUEsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO1FBQ0EsTUFBQSxDQUFPLFNBQVAsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO2VBQ0EsTUFBQSxDQUFPLFNBQVAsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO01BUGdGLENBQWxGO01BU0EsRUFBQSxDQUFHLGlCQUFILEVBQXNCLFNBQUE7UUFDcEIsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLFNBQVAsRUFDRTtVQUFBLElBQUEsRUFBTSxZQUFOO1NBREY7TUFGb0IsQ0FBdEI7TUFLQSxFQUFBLENBQUcsb0ZBQUgsRUFBeUYsU0FBQTtRQUN2RixHQUFBLENBQUk7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQUo7ZUFDQSxNQUFBLENBQU8sT0FBUCxFQUNFO1VBQUEsSUFBQSxFQUFNLGVBQU47U0FERjtNQUZ1RixDQUF6RjtNQUlBLEVBQUEsQ0FBRywrREFBSCxFQUFvRSxTQUFBO1FBQ2xFLENBQUE7VUFBQSxJQUFBLEVBQU0sZ0JBQU47U0FBQTtRQUNBLEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQ0U7VUFBQSxJQUFBLEVBQU0sZ0JBQU47U0FERjtNQUhrRSxDQUFwRTtNQU1BLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBO1FBQ3RELEdBQUEsQ0FBSTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBSjtlQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7VUFBQSxJQUFBLEVBQU0sZUFBTjtTQURGO01BRnNELENBQXhEO2FBS0EsRUFBQSxDQUFHLHFFQUFILEVBQTBFLFNBQUE7UUFDeEUsR0FBQSxDQUFJO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFKO2VBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtTQURGO01BRndFLENBQTFFO0lBdEQ4QixDQUFoQztJQTJEQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQTtNQUNsQyxVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxnQkFBTjtVQUNBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBRFI7U0FERjtNQURTLENBQVg7TUFLQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQTtRQUMvQixNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFIK0IsQ0FBakM7TUFLQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQTtRQUMvQixHQUFBLENBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFKK0IsQ0FBakM7TUFNQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQTtRQUNuQyxHQUFBLENBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFKbUMsQ0FBckM7TUFNQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQTtRQUNuQyxHQUFBLENBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFKbUMsQ0FBckM7TUFNQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtRQUNyRCxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFIcUQsQ0FBdkQ7TUFLQSxFQUFBLENBQUcsa0RBQUgsRUFBdUQsU0FBQTtRQUNyRCxHQUFBLENBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksRUFBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFKcUQsQ0FBdkQ7TUFNQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQTtRQUMvQixNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO2VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtNQUYrQixDQUFqQztNQUlBLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO1FBQy9CLEdBQUEsQ0FBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxFQUFKLENBQVI7U0FBZDtRQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BSCtCLENBQWpDO01BS0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUE7UUFDM0QsR0FBQSxDQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtRQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BSjJELENBQTdEO01BTUEsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUE7UUFDM0QsR0FBQSxDQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtRQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7ZUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO01BSjJELENBQTdEO01BTUEsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUE7UUFDeEMsR0FBQSxDQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtlQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7TUFId0MsQ0FBMUM7YUFLQSxFQUFBLENBQUcsd0NBQUgsRUFBNkMsU0FBQTtRQUMzQyxHQUFBLENBQWM7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWQ7UUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO2VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtNQUgyQyxDQUE3QztJQWxFa0MsQ0FBcEM7SUF1RUEsUUFBQSxDQUFTLDhDQUFULEVBQXlELFNBQUE7QUFDdkQsVUFBQTtNQUFBLE9BQTZCLEVBQTdCLEVBQUMsZUFBRCxFQUFRLHFCQUFSLEVBQXFCO01BQ3JCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsV0FBQSxDQUFZLFNBQUMsYUFBRCxFQUFnQixNQUFoQjtVQUNWLEdBQUEsQ0FDRTtZQUFBLElBQUEsRUFBTSxhQUFOO1lBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGO1VBSUEsS0FBQSxHQUFRO1VBQ1IsS0FBSyxDQUFDLEdBQU4sQ0FDRTtZQUFBLElBQUEsRUFBTSxhQUFOO1lBQ0EsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FEUjtXQURGO1VBR0EsV0FBQSxHQUFjLGFBQWEsQ0FBQztVQUc1QixJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUE7aUJBQ1AsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsTUFBbEI7UUFiVSxDQUFaO01BRFMsQ0FBWDtNQWdCQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQTtRQUNoRSxNQUFBLENBQU8sS0FBUCxFQUFjO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFkO1FBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBYjtRQUdBLElBQUksQ0FBQyxZQUFMLENBQWtCLFdBQWxCO1FBQ0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEI7UUFDQSxNQUFBLENBQU87VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVA7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFiO1FBR0EsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsS0FBaEI7UUFDQSxNQUFBLENBQU87VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQVA7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFiO1FBR0EsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsTUFBbEI7UUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFaO2VBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBYjtNQWxCZ0UsQ0FBbEU7YUFvQkEsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUE7UUFDNUQsTUFBQSxDQUFPLEtBQVAsRUFBYztVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBZDtRQUNBLEtBQUssQ0FBQyxNQUFOLENBQWE7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWI7UUFFQSxJQUFJLENBQUMsWUFBTCxDQUFrQixXQUFsQjtRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUE7UUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsS0FBOUI7UUFDQSxLQUFLLENBQUMsTUFBTixDQUFhLEdBQWIsRUFBa0I7VUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1NBQWxCO1FBQ0EsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUFiLEVBQWtCO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtTQUFsQjtlQUNBLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUFrQjtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7U0FBbEI7TUFUNEQsQ0FBOUQ7SUF0Q3VELENBQXpEO1dBaURBLFFBQUEsQ0FBUyxrQ0FBVCxFQUE2QyxTQUFBO01BQzNDLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO1FBQzVCLFVBQUEsQ0FBVyxTQUFBO2lCQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsbUJBQWIsRUFBa0MsSUFBbEM7UUFEUyxDQUFYO2VBR0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUE7VUFDeEIsR0FBQSxDQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sS0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7aUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw4QkFBUDtXQUFkO1FBTHdCLENBQTFCO01BSjRCLENBQTlCO01BV0EsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7UUFDOUIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxxQkFBYixFQUFvQyxJQUFwQztRQURTLENBQVg7UUFHQSxFQUFBLENBQUcsc0NBQUgsRUFBMkMsU0FBQTtVQUN6QyxHQUFBLENBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7UUFMeUMsQ0FBM0M7ZUFPQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQTtVQUNuRCxHQUFBLENBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFjO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQWQ7UUFMbUQsQ0FBckQ7TUFYOEIsQ0FBaEM7TUFrQkEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUE7UUFDakMsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSx3QkFBYixFQUF1QyxJQUF2QztRQURTLENBQVg7UUFHQSxFQUFBLENBQUcscURBQUgsRUFBMEQsU0FBQTtVQUN4RCxHQUFBLENBQUk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBSjtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBZDtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtVQUNBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBWjtpQkFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQVo7UUFWd0QsQ0FBMUQ7ZUFZQSxFQUFBLENBQUcsOERBQUgsRUFBbUUsU0FBQTtVQUNqRSxHQUFBLENBQW1CO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQW5CO1VBQ0EsTUFBQSxDQUFPLFVBQVAsRUFBbUI7WUFBQSxLQUFBLEVBQU8sOEJBQVA7V0FBbkI7VUFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFyQixDQUF5QixhQUF6QixDQUFQLENBQStDLENBQUMsUUFBaEQsQ0FBQTtVQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQW1CO1lBQUEsS0FBQSxFQUFPLDhCQUFQO1dBQW5CO2lCQUNBLE1BQUEsQ0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQXJCLENBQXlCLGFBQXpCLENBQVAsQ0FBK0MsQ0FBQyxVQUFoRCxDQUFBO1FBTGlFLENBQW5FO01BaEJpQyxDQUFuQztNQXVCQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtRQUMxQixVQUFBLENBQVcsU0FBQTtpQkFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLGlCQUFiLEVBQWdDLElBQWhDO1FBRFMsQ0FBWDtlQUdBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1VBQ25DLEdBQUEsQ0FBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEdBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO1VBQ0EsTUFBQSxDQUFPLEtBQVAsRUFBYztZQUFBLEtBQUEsRUFBTyw2Q0FBUDtXQUFkO2lCQUNBLE1BQUEsQ0FBTyxLQUFQLEVBQWM7WUFBQSxLQUFBLEVBQU8sNkNBQVA7V0FBZDtRQVZtQyxDQUFyQztNQUowQixDQUE1QjtNQWdCQSxRQUFBLENBQVMsa0NBQVQsRUFBNkMsU0FBQTtRQUMzQyxVQUFBLENBQVcsU0FBQTtVQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixFQUE2QixFQUE3QjtpQkFFQSxPQUFPLENBQUMsV0FBUixDQUFvQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWYsQ0FBQSxDQUFwQjtRQUhTLENBQVg7ZUFLQSxRQUFBLENBQVMsMEJBQVQsRUFBcUMsU0FBQTtVQUNuQyxFQUFBLENBQUcsOEJBQUgsRUFBbUMsU0FBQTtBQUNqQyxnQkFBQTtZQUFBLEdBQUEsQ0FBb0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBcEI7WUFDQSxTQUFBLENBQVUsS0FBVjtZQUNBLE9BQUEsR0FBVSxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQy9CLFFBQUEsQ0FBUyxPQUFULEVBQWtCLHVDQUFsQjtZQUNBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLHVDQUFsQjttQkFDQSxNQUFBLENBQU8sT0FBUCxFQUFvQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFwQjtVQU5pQyxDQUFuQztVQVFBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBO0FBQ3JDLGdCQUFBO1lBQUEsR0FBQSxDQUFzQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUF0QjtZQUNBLE1BQUEsQ0FBTyxhQUFQLEVBQXNCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQXRCO1lBQ0EsR0FBQSxDQUFzQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUF0QjtZQUNBLFNBQUEsQ0FBVSxPQUFWO1lBQ0EsT0FBQSxHQUFVLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDL0IsUUFBQSxDQUFTLE9BQVQsRUFBa0IsMkNBQWxCO1lBQ0EsUUFBQSxDQUFTLE9BQVQsRUFBa0IsMkNBQWxCO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQW9CO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQXBCO1VBUnFDLENBQXZDO2lCQVVBLEVBQUEsQ0FBRywrQ0FBSCxFQUFvRCxTQUFBO0FBQ2xELGdCQUFBO1lBQUEsR0FBQSxDQUFLO2NBQUEsS0FBQSxFQUFPLDJDQUFQO2FBQUw7WUFDQSxTQUFBLENBQVUsT0FBVjtZQUNBLE9BQUEsR0FBVSxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQy9CLFFBQUEsQ0FBUyxPQUFULEVBQWtCLHVDQUFsQjtZQUNBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLHVDQUFsQjttQkFDQSxNQUFBLENBQU8sT0FBUCxFQUFnQjtjQUFBLEtBQUEsRUFBTyxvQkFBUDtjQUE2QixJQUFBLEVBQU0sUUFBbkM7YUFBaEI7VUFOa0QsQ0FBcEQ7UUFuQm1DLENBQXJDO01BTjJDLENBQTdDO2FBaUNBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7UUFDdkIsVUFBQSxDQUFXLFNBQUE7aUJBRVQsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFmLENBQUEsQ0FBcEI7UUFGUyxDQUFYO1FBSUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtVQUN4QixVQUFBLENBQVcsU0FBQTttQkFDVCxRQUFRLENBQUMsR0FBVCxDQUFhLGNBQWIsRUFBNkIsQ0FBN0I7VUFEUyxDQUFYO2lCQUdBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBO1lBQ25DLEVBQUEsQ0FBRyxzQkFBSCxFQUEyQixTQUFBO2NBQ3pCLEdBQUEsQ0FBZ0I7Z0JBQUEsS0FBQSxFQUFPLDhCQUFQO2VBQWhCO2NBQ0EsTUFBQSxDQUFPLE9BQVAsRUFBZ0I7Z0JBQUEsS0FBQSxFQUFPLDhCQUFQO2VBQWhCO3FCQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO2dCQUFBLEtBQUEsRUFBTyw4QkFBUDtlQUFoQjtZQUh5QixDQUEzQjttQkFLQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQTtjQUNsRCxHQUFBLENBQW9CO2dCQUFBLEtBQUEsRUFBTyw4QkFBUDtlQUFwQjtjQUNBLE1BQUEsQ0FBTyxXQUFQLEVBQW9CO2dCQUFBLEtBQUEsRUFBTyw4QkFBUDtlQUFwQjtxQkFDQSxNQUFBLENBQU8sV0FBUCxFQUFvQjtnQkFBQSxLQUFBLEVBQU8sOEJBQVA7ZUFBcEI7WUFIa0QsQ0FBcEQ7VUFObUMsQ0FBckM7UUFKd0IsQ0FBMUI7UUFlQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO1VBQ3hCLFVBQUEsQ0FBVyxTQUFBO21CQUNULFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixFQUE2QixDQUE3QjtVQURTLENBQVg7aUJBR0EsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7bUJBQ2hDLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBO2NBQ3pDLEdBQUEsQ0FBc0I7Z0JBQUEsS0FBQSxFQUFPLGdDQUFQO2VBQXRCO2NBQ0EsTUFBQSxDQUFPLGFBQVAsRUFBc0I7Z0JBQUEsS0FBQSxFQUFPLGdDQUFQO2VBQXRCO2NBQ0EsTUFBQSxDQUFPLFdBQVAsRUFBc0I7Z0JBQUEsS0FBQSxFQUFPLGdDQUFQO2VBQXRCO2NBQ0EsTUFBQSxDQUFPLGFBQVAsRUFBc0I7Z0JBQUEsS0FBQSxFQUFPLGdDQUFQO2VBQXRCO3FCQUNBLE1BQUEsQ0FBTyxTQUFQLEVBQXNCO2dCQUFBLEtBQUEsRUFBTyxnQ0FBUDtlQUF0QjtZQUx5QyxDQUEzQztVQURnQyxDQUFsQztRQUp3QixDQUExQjtlQVlBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO1VBQzdCLFVBQUEsQ0FBVyxTQUFBO1lBQ1QsUUFBUSxDQUFDLEdBQVQsQ0FBYSxjQUFiLEVBQTZCLENBQTdCO21CQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsc0JBQWIsRUFBcUMsR0FBckM7VUFGUyxDQUFYO2lCQUlBLEVBQUEsQ0FBRywyQ0FBSCxFQUFnRCxTQUFBO1lBQzlDLEdBQUEsQ0FBZ0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7WUFFQSxNQUFBLENBQU8sS0FBUCxFQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUNBLFlBQUEsQ0FBYSxHQUFiO1lBQ0EsTUFBQSxDQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUVBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCO2NBQUEsS0FBQSxFQUFPLDhCQUFQO2FBQWhCO1lBRUEsTUFBQSxDQUFPLEtBQVAsRUFBZ0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7WUFDQSxZQUFBLENBQWEsR0FBYjtZQUNBLE1BQUEsQ0FBZ0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7WUFFQSxNQUFBLENBQU8sS0FBUCxFQUFnQjtjQUFBLEtBQUEsRUFBTyw4QkFBUDthQUFoQjtZQUNBLFlBQUEsQ0FBYSxHQUFiO21CQUNBLE1BQUEsQ0FBZ0I7Y0FBQSxLQUFBLEVBQU8sOEJBQVA7YUFBaEI7VUFmOEMsQ0FBaEQ7UUFMNkIsQ0FBL0I7TUFoQ3VCLENBQXpCO0lBdEcyQyxDQUE3QztFQTNUc0IsQ0FBeEI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhfSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJNb3Rpb24gRmluZFwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzZXR0aW5ncy5zZXQoJ3VzZUV4cGVyaW1lbnRhbEZhc3RlcklucHV0JywgdHJ1ZSlcbiAgICAjIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuXG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuXG4gIHhkZXNjcmliZSAndGhlIGYgcGVyZm9ybWFuY2UnLCAtPlxuICAgIHRpbWVzVG9FeGVjdXRlID0gNTAwXG4gICAgIyB0aW1lc1RvRXhlY3V0ZSA9IDFcbiAgICBtZWFzdXJlV2l0aFRpbWVFbmQgPSAoZm4pIC0+XG4gICAgICBjb25zb2xlLnRpbWUoZm4ubmFtZSlcbiAgICAgIGZuKClcbiAgICAgICMgY29uc29sZS5sb2cgXCJbdGltZS1lbmRdXCJcbiAgICAgIGNvbnNvbGUudGltZUVuZChmbi5uYW1lKVxuXG4gICAgbWVhc3VyZVdpdGhQZXJmb3JtYW5jZU5vdyA9IChmbikgLT5cbiAgICAgIHQwID0gcGVyZm9ybWFuY2Uubm93KClcbiAgICAgIGZuKClcbiAgICAgIHQxID0gcGVyZm9ybWFuY2Uubm93KClcbiAgICAgIGNvbnNvbGUubG9nIFwiW3BlcmZvcm1hbmNlLm5vd10gdG9vayAje3QxIC0gdDB9IG1zZWNcIlxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiICBcIiArIFwibFwiLnJlcGVhdCh0aW1lc1RvRXhlY3V0ZSlcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIHhkZXNjcmliZSAndGhlIGYgcmVhZC1jaGFyLXZpYS1rZXliaW5kaW5nIHBlcmZvcm1hbmNlJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgdmltU3RhdGUudXNlTWluaUVkaXRvciA9IGZhbHNlXG5cbiAgICAgIGl0ICdbd2l0aCBrZXliaW5kXSBtb3ZlcyB0byBsIGNoYXInLCAtPlxuICAgICAgICB0ZXN0UGVyZm9ybWFuY2VPZktleWJpbmQgPSAtPlxuICAgICAgICAgIGtleXN0cm9rZSBcImYgbFwiIGZvciBuIGluIFsxLi50aW1lc1RvRXhlY3V0ZV1cbiAgICAgICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgdGltZXNUb0V4ZWN1dGUgKyAxXVxuXG4gICAgICAgIGNvbnNvbGUubG9nIFwiPT0ga2V5YmluZFwiXG4gICAgICAgIGVuc3VyZSBcImYgbFwiLCBjdXJzb3I6IFswLCAyXVxuICAgICAgICBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgbWVhc3VyZVdpdGhUaW1lRW5kKHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZClcbiAgICAgICAgIyBzZXQgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgIyBtZWFzdXJlV2l0aFBlcmZvcm1hbmNlTm93KHRlc3RQZXJmb3JtYW5jZU9mS2V5YmluZClcblxuICAgIGRlc2NyaWJlICdbd2l0aCBoaWRkZW4taW5wdXRdIG1vdmVzIHRvIGwgY2hhcicsIC0+XG4gICAgICBpdCAnW3dpdGggaGlkZGVuLWlucHV0XSBtb3ZlcyB0byBsIGNoYXInLCAtPlxuICAgICAgICB0ZXN0UGVyZm9ybWFuY2VPZkhpZGRlbklucHV0ID0gLT5cbiAgICAgICAgICBrZXlzdHJva2UgJ2YgbCcgZm9yIG4gaW4gWzEuLnRpbWVzVG9FeGVjdXRlXVxuICAgICAgICAgIGVuc3VyZSBjdXJzb3I6IFswLCB0aW1lc1RvRXhlY3V0ZSArIDFdXG5cbiAgICAgICAgY29uc29sZS5sb2cgXCI9PSBoaWRkZW5cIlxuICAgICAgICBlbnN1cmUgJ2YgbCcsIGN1cnNvcjogWzAsIDJdXG5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgIG1lYXN1cmVXaXRoVGltZUVuZCh0ZXN0UGVyZm9ybWFuY2VPZkhpZGRlbklucHV0KVxuICAgICAgICAjIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAjIG1lYXN1cmVXaXRoUGVyZm9ybWFuY2VOb3codGVzdFBlcmZvcm1hbmNlT2ZIaWRkZW5JbnB1dClcblxuICBkZXNjcmliZSAndGhlIGYvRiBrZXliaW5kaW5ncycsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiYWJjYWJjYWJjYWJjXFxuXCJcbiAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0ICdtb3ZlcyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCAnZXh0ZW5kcyB2aXN1YWwgc2VsZWN0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCByZXBldGFibGUnLCAtPlxuICAgICAgZW5zdXJlICd2JywgICBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgIGVuc3VyZSAnZiBjJywgc2VsZWN0ZWRUZXh0OiAnYWJjJywgICAgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnOycsICAgc2VsZWN0ZWRUZXh0OiAnYWJjYWJjJywgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnLCcsICAgc2VsZWN0ZWRUZXh0OiAnYWJjJywgICAgY3Vyc29yOiBbMCwgM11cblxuICAgIGl0ICdtb3ZlcyBiYWNrd2FyZHMgdG8gdGhlIGZpcnN0IHNwZWNpZmllZCBjaGFyYWN0ZXIgaXQgZmluZHMnLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdGIGEnLCBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGZvcndhcmQnLCAtPlxuICAgICAgZW5zdXJlICcyIGYgYScsIGN1cnNvcjogWzAsIDZdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgYmFja3dhcmQnLCAtPlxuICAgICAgc2V0ICAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzIgRiBhJywgY3Vyc29yOiBbMCwgMF1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgZCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlICcxIDAgZiBhJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgJzEgMSBmIGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0ICAgICAgICAgICAgICAgY3Vyc29yOiBbMCwgNl1cbiAgICAgIGVuc3VyZSAnMSAwIEYgYScsIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMSBGIGEnLCBjdXJzb3I6IFswLCA2XVxuXG4gICAgaXQgXCJjb21wb3NlcyB3aXRoIGRcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIDIgZiBhJywgdGV4dDogJ2FiY2JjXFxuJ1xuXG4gICAgaXQgXCJGIGJlaGF2ZXMgZXhjbHVzaXZlbHkgd2hlbiBjb21wb3NlcyB3aXRoIG9wZXJhdG9yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCBGIGEnLCB0ZXh0OiAnYWJjYWJjYWJjXFxuJ1xuXG4gIGRlc2NyaWJlIFwiW3JlZ3Jlc3Npb24gZ3VyYWRdIHJlcGVhdCg7IG9yICwpIGFmdGVyIHVzZWQgYXMgb3BlcmF0b3IgdGFyZ2V0XCIsIC0+XG4gICAgaXQgXCJyZXBlYXQgYWZ0ZXIgZCBmXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwiYTEgICAgfGEyICAgIGEzICAgIGE0XCJcbiAgICAgIGVuc3VyZSBcImQgZiBhXCIsIHRleHRDOiBcImExICAgIHwzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiO1wiLCAgICAgdGV4dEM6IFwiYTEgICAgMyAgICB8YTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCIsXCIsICAgICB0ZXh0QzogXCJ8YTEgICAgMyAgICBhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcbiAgICBpdCBcInJlcGVhdCBhZnRlciBkIHRcIiwgLT5cbiAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJ8YTEgICAgYTIgICAgYTMgICAgYTRcIlxuICAgICAgZW5zdXJlIFwiZCB0IGFcIiwgdGV4dEM6IFwifGEyICAgIGEzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiO1wiLCAgICAgdGV4dEM6IFwiYTIgICB8IGEzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiLFwiLCAgICAgdGV4dEM6IFwiYXwyICAgIGEzICAgIGE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgIGl0IFwicmVwZWF0IGFmdGVyIGQgRlwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICAgIHRleHRDOiBcImExICAgIGEyICAgIGEzICAgIHxhNFwiXG4gICAgICBlbnN1cmUgXCJkIEYgYVwiLCB0ZXh0QzogXCJhMSAgICBhMiAgICB8YTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCI7XCIsICAgICB0ZXh0QzogXCJhMSAgICB8YTIgICAgYTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCIsXCIsICAgICB0ZXh0QzogXCJhMSAgICBhMiAgICB8YTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgaXQgXCJyZXBlYXQgYWZ0ZXIgZCBUXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgICAgdGV4dEM6IFwiYTEgICAgYTIgICAgYTMgICAgfGE0XCJcbiAgICAgIHNldCAgICAgICAgICAgICB0ZXh0QzogXCJhMSAgICBhMiAgICBhfGE0XCJcbiAgICAgIGVuc3VyZSBcImQgVCBhXCIsIHRleHRDOiBcImExICAgIGEyICAgIGF8YTRcIiwgbW9kZTogXCJub3JtYWxcIiwgc2VsZWN0ZWRUZXh0OiBcIlwiXG4gICAgICBlbnN1cmUgXCI7XCIsICAgICB0ZXh0QzogXCJhMSAgICBhfDIgICAgYWE0XCIsIG1vZGU6IFwibm9ybWFsXCIsIHNlbGVjdGVkVGV4dDogXCJcIlxuICAgICAgZW5zdXJlIFwiLFwiLCAgICAgdGV4dEM6IFwiYTEgICAgYTIgICB8IGFhNFwiLCBtb2RlOiBcIm5vcm1hbFwiLCBzZWxlY3RlZFRleHQ6IFwiXCJcblxuICBkZXNjcmliZSBcImNhbmNlbGxhdGlvblwiLCAtPlxuICAgIGl0IFwia2VlcHMgbXVsdGlwbGUtY3Vyc29ycyB3aGVuIGNhbmNlbGxlZFwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgYVxcbiEgICBhXFxufCAgIGFcXG5cIlxuICAgICAgZW5zdXJlIFwiZiBlc2NhcGVcIiwgIHRleHRDOiBcInwgICBhXFxuISAgIGFcXG58ICAgYVxcblwiXG5cbiAgZGVzY3JpYmUgJ3RoZSB0L1Qga2V5YmluZGluZ3MnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcImFiY2FiY2FiY2FiY1xcblwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCAnbW92ZXMgdG8gdGhlIGNoYXJhY3RlciBwcmV2aW91cyB0byB0aGUgZmlyc3Qgc3BlY2lmaWVkIGNoYXJhY3RlciBpdCBmaW5kcycsIC0+XG4gICAgICBlbnN1cmUgJ3QgYScsIGN1cnNvcjogWzAsIDJdXG4gICAgICAjIG9yIHN0YXlzIHB1dCB3aGVuIGl0J3MgYWxyZWFkeSB0aGVyZVxuICAgICAgZW5zdXJlICd0IGEnLCBjdXJzb3I6IFswLCAyXVxuXG4gICAgaXQgJ21vdmVzIGJhY2t3YXJkcyB0byB0aGUgY2hhcmFjdGVyIGFmdGVyIHRoZSBmaXJzdCBzcGVjaWZpZWQgY2hhcmFjdGVyIGl0IGZpbmRzJywgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICdUIGEnLCBjdXJzb3I6IFswLCAxXVxuXG4gICAgaXQgJ3Jlc3BlY3RzIGNvdW50IGZvcndhcmQnLCAtPlxuICAgICAgZW5zdXJlICcyIHQgYScsIGN1cnNvcjogWzAsIDVdXG5cbiAgICBpdCAncmVzcGVjdHMgY291bnQgYmFja3dhcmQnLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzIgVCBhJywgY3Vyc29yOiBbMCwgMV1cblxuICAgIGl0IFwiZG9lc24ndCBtb3ZlIGlmIHRoZSBjaGFyYWN0ZXIgc3BlY2lmaWVkIGlzbid0IGZvdW5kXCIsIC0+XG4gICAgICBlbnN1cmUgJ3QgZCcsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcImRvZXNuJ3QgbW92ZSBpZiB0aGVyZSBhcmVuJ3QgdGhlIHNwZWNpZmllZCBjb3VudCBvZiB0aGUgc3BlY2lmaWVkIGNoYXJhY3RlclwiLCAtPlxuICAgICAgZW5zdXJlICcxIDAgdCBkJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgICMgYSBidWcgd2FzIG1ha2luZyB0aGlzIGJlaGF2aW91ciBkZXBlbmQgb24gdGhlIGNvdW50XG4gICAgICBlbnN1cmUgJzEgMSB0IGEnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgIyBhbmQgYmFja3dhcmRzIG5vd1xuICAgICAgc2V0IGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJzEgMCBUIGEnLCBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICcxIDEgVCBhJywgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwiY29tcG9zZXMgd2l0aCBkXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCAyIHQgYicsXG4gICAgICAgIHRleHQ6ICdhYmNiY2FiY1xcbidcblxuICAgIGl0IFwiZGVsZXRlIGNoYXIgdW5kZXIgY3Vyc29yIGV2ZW4gd2hlbiBubyBtb3ZlbWVudCBoYXBwZW5zIHNpbmNlIGl0J3MgaW5jbHVzaXZlIG1vdGlvblwiLCAtPlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2QgdCBiJyxcbiAgICAgICAgdGV4dDogJ2JjYWJjYWJjYWJjXFxuJ1xuICAgIGl0IFwiZG8gbm90aGluZyB3aGVuIGluY2x1c2l2ZW5lc3MgaW52ZXJ0ZWQgYnkgdiBvcGVyYXRvci1tb2RpZmllclwiLCAtPlxuICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICBlbnN1cmUgJ2QgdiB0IGInLFxuICAgICAgICB0ZXh0OiAnYWJjYWJjYWJjYWJjXFxuJ1xuXG4gICAgaXQgXCJUIGJlaGF2ZXMgZXhjbHVzaXZlbHkgd2hlbiBjb21wb3NlcyB3aXRoIG9wZXJhdG9yXCIsIC0+XG4gICAgICBzZXQgY3Vyc29yOiBbMCwgM11cbiAgICAgIGVuc3VyZSAnZCBUIGInLFxuICAgICAgICB0ZXh0OiAnYWJhYmNhYmNhYmNcXG4nXG5cbiAgICBpdCBcIlQgZG9uJ3QgZGVsZXRlIGNoYXJhY3RlciB1bmRlciBjdXJzb3IgZXZlbiB3aGVuIG5vIG1vdmVtZW50IGhhcHBlbnNcIiwgLT5cbiAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICdkIFQgYycsXG4gICAgICAgIHRleHQ6ICdhYmNhYmNhYmNhYmNcXG4nXG5cbiAgZGVzY3JpYmUgJ3RoZSA7IGFuZCAsIGtleWJpbmRpbmdzJywgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dDogXCJhYmNhYmNhYmNhYmNcXG5cIlxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuXG4gICAgaXQgXCJyZXBlYXQgZiBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgRiBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCAxMF1cbiAgICAgIGVuc3VyZSAnRiBjJywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIGVuc3VyZSAnOycsICAgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnOycsICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwicmVwZWF0IGYgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICBlbnN1cmUgJ2YgYycsIGN1cnNvcjogWzAsIDhdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDVdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDJdXG5cbiAgICBpdCBcInJlcGVhdCBGIGluIG9wcG9zaXRlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICdGIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcsJywgICBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgICBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJhbHRlcm5hdGUgcmVwZWF0IGYgaW4gc2FtZSBkaXJlY3Rpb24gYW5kIHJldmVyc2VcIiwgLT5cbiAgICAgIGVuc3VyZSAnZiBjJywgY3Vyc29yOiBbMCwgMl1cbiAgICAgIGVuc3VyZSAnOycsICAgY3Vyc29yOiBbMCwgNV1cbiAgICAgIGVuc3VyZSAnLCcsICAgY3Vyc29yOiBbMCwgMl1cblxuICAgIGl0IFwiYWx0ZXJuYXRlIHJlcGVhdCBGIGluIHNhbWUgZGlyZWN0aW9uIGFuZCByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDEwXVxuICAgICAgZW5zdXJlICdGIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA1XVxuICAgICAgZW5zdXJlICcsJywgICBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgdCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgZW5zdXJlICd0IGMnLCBjdXJzb3I6IFswLCAxXVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCA0XVxuXG4gICAgaXQgXCJyZXBlYXQgVCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCAxMF1cbiAgICAgIGVuc3VyZSAnVCBjJywgY3Vyc29yOiBbMCwgOV1cbiAgICAgIGVuc3VyZSAnOycsICAgY3Vyc29yOiBbMCwgNl1cblxuICAgIGl0IFwicmVwZWF0IHQgaW4gb3Bwb3NpdGUgZGlyZWN0aW9uIGZpcnN0LCBhbmQgdGhlbiByZXZlcnNlXCIsIC0+XG4gICAgICBzZXQgICAgICAgICAgIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJ3QgYycsIGN1cnNvcjogWzAsIDRdXG4gICAgICBlbnN1cmUgJywnLCAgIGN1cnNvcjogWzAsIDNdXG4gICAgICBlbnN1cmUgJzsnLCAgIGN1cnNvcjogWzAsIDRdXG5cbiAgICBpdCBcInJlcGVhdCBUIGluIG9wcG9zaXRlIGRpcmVjdGlvbiBmaXJzdCwgYW5kIHRoZW4gcmV2ZXJzZVwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICdUIGMnLCBjdXJzb3I6IFswLCAzXVxuICAgICAgZW5zdXJlICcsJywgICBjdXJzb3I6IFswLCA0XVxuICAgICAgZW5zdXJlICc7JywgICBjdXJzb3I6IFswLCAzXVxuXG4gICAgaXQgXCJyZXBlYXQgd2l0aCBjb3VudCBpbiBzYW1lIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCAyXVxuICAgICAgZW5zdXJlICcyIDsnLCBjdXJzb3I6IFswLCA4XVxuXG4gICAgaXQgXCJyZXBlYXQgd2l0aCBjb3VudCBpbiByZXZlcnNlIGRpcmVjdGlvblwiLCAtPlxuICAgICAgc2V0ICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgZW5zdXJlICdmIGMnLCBjdXJzb3I6IFswLCA4XVxuICAgICAgZW5zdXJlICcyICwnLCBjdXJzb3I6IFswLCAyXVxuXG4gIGRlc2NyaWJlIFwibGFzdCBmaW5kL3RpbGwgaXMgcmVwZWF0YWJsZSBvbiBvdGhlciBlZGl0b3JcIiwgLT5cbiAgICBbb3RoZXIsIG90aGVyRWRpdG9yLCBwYW5lXSA9IFtdXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZ2V0VmltU3RhdGUgKG90aGVyVmltU3RhdGUsIF9vdGhlcikgLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJhIGJheiBiYXJcXG5cIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgICAgb3RoZXIgPSBfb3RoZXJcbiAgICAgICAgb3RoZXIuc2V0XG4gICAgICAgICAgdGV4dDogXCJmb28gYmFyIGJhelwiLFxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIG90aGVyRWRpdG9yID0gb3RoZXJWaW1TdGF0ZS5lZGl0b3JcbiAgICAgICAgIyBqYXNtaW5lLmF0dGFjaFRvRE9NKG90aGVyRWRpdG9yLmVsZW1lbnQpXG5cbiAgICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpXG5cbiAgICBpdCBcInNoYXJlcyB0aGUgbW9zdCByZWNlbnQgZmluZC90aWxsIGNvbW1hbmQgd2l0aCBvdGhlciBlZGl0b3JzXCIsIC0+XG4gICAgICBlbnN1cmUgJ2YgYicsIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgIyByZXBsYXkgc2FtZSBmaW5kIGluIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuICAgICAgb3RoZXIua2V5c3Ryb2tlICc7J1xuICAgICAgZW5zdXJlIGN1cnNvcjogWzAsIDJdXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgNF1cblxuICAgICAgIyBkbyBhIHRpbGwgaW4gdGhlIG90aGVyIGVkaXRvclxuICAgICAgb3RoZXIua2V5c3Ryb2tlICd0IHInXG4gICAgICBlbnN1cmUgY3Vyc29yOiBbMCwgMl1cbiAgICAgIG90aGVyLmVuc3VyZSBjdXJzb3I6IFswLCA1XVxuXG4gICAgICAjIGFuZCByZXBsYXkgaW4gdGhlIG5vcm1hbCBlZGl0b3JcbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKGVkaXRvcilcbiAgICAgIGVuc3VyZSAnOycsIGN1cnNvcjogWzAsIDddXG4gICAgICBvdGhlci5lbnN1cmUgY3Vyc29yOiBbMCwgNV1cblxuICAgIGl0IFwiaXMgc3RpbGwgcmVwZWF0YWJsZSBhZnRlciBvcmlnaW5hbCBlZGl0b3Igd2FzIGRlc3Ryb3llZFwiLCAtPlxuICAgICAgZW5zdXJlICdmIGInLCBjdXJzb3I6IFswLCAyXVxuICAgICAgb3RoZXIuZW5zdXJlIGN1cnNvcjogWzAsIDBdXG5cbiAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKG90aGVyRWRpdG9yKVxuICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuICAgICAgZXhwZWN0KGVkaXRvci5pc0FsaXZlKCkpLnRvQmUoZmFsc2UpXG4gICAgICBvdGhlci5lbnN1cmUgJzsnLCBjdXJzb3I6IFswLCA0XVxuICAgICAgb3RoZXIuZW5zdXJlICc7JywgY3Vyc29yOiBbMCwgOF1cbiAgICAgIG90aGVyLmVuc3VyZSAnLCcsIGN1cnNvcjogWzAsIDRdXG5cbiAgZGVzY3JpYmUgXCJ2bXAgdW5pcXVlIGZlYXR1cmUgb2YgYGZgIGZhbWlseVwiLCAtPlxuICAgIGRlc2NyaWJlIFwiaWdub3JlQ2FzZUZvckZpbmRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiaWdub3JlQ2FzZUZvckZpbmRcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJpZ25vcmUgY2FzZSB0byBmaW5kXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwifCAgICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImYgYVwiLCB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhICAgIHxBYiAgICBhXCJcblxuICAgIGRlc2NyaWJlIFwidXNlU21hcnRjYXNlRm9yRmluZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJ1c2VTbWFydGNhc2VGb3JGaW5kXCIsIHRydWUpXG5cbiAgICAgIGl0IFwiaWdub3JlIGNhc2Ugd2hlbiBpbnB1dCBpcyBsb3dlciBjaGFyXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwifCAgICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImYgYVwiLCB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiICAgIEEgICAgYWIgICAgfGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhICAgIHxBYiAgICBhXCJcblxuICAgICAgaXQgXCJmaW5kIGNhc2Utc2Vuc2l0aXZlbHkgd2hlbiBpbnB1dCBpcyBsYWdlciBjaGFyXCIsIC0+XG4gICAgICAgIHNldCAgICAgICAgICAgdGV4dEM6IFwifCAgICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImYgQVwiLCB0ZXh0QzogXCIgICAgfEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBBXCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgfEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCIsXCIsICAgdGV4dEM6IFwiICAgIHxBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIgICAgQSAgICBhYiAgICBhICAgIHxBYiAgICBhXCJcblxuICAgIGRlc2NyaWJlIFwicmV1c2VGaW5kRm9yUmVwZWF0RmluZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJyZXVzZUZpbmRGb3JSZXBlYXRGaW5kXCIsIHRydWUpXG5cbiAgICAgIGl0IFwiY2FuIHJldXNlIGYgYW5kIHQgYXMgOywgRiBhbmQgVCBhcyAnLCcgcmVzcGVjdGl2ZWx5XCIsIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCJ8ICAgIEEgICAgYWIgICAgYSAgICBBYiAgICBhXCJcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmXCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIHxhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJmXCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgQWIgICAgfGFcIlxuICAgICAgICBlbnN1cmUgXCJGXCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIHxhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJGXCIsIHRleHRDOiBcIiAgICBBICAgIHxhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJ0XCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgfCBhICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJ0XCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGEgICAgQWIgICB8IGFcIlxuICAgICAgICBlbnN1cmUgXCJUXCIsIHRleHRDOiBcIiAgICBBICAgIGFiICAgIGF8ICAgIEFiICAgIGFcIlxuICAgICAgICBlbnN1cmUgXCJUXCIsIHRleHRDOiBcIiAgICBBICAgIGF8YiAgICBhICAgIEFiICAgIGFcIlxuXG4gICAgICBpdCBcImJlaGF2ZSBhcyBub3JtYWwgZiBpZiBubyBzdWNjZXNzZnVsIHByZXZpb3VzIGZpbmQgd2FzIGV4aXN0c1wiLCAtPlxuICAgICAgICBzZXQgICAgICAgICAgICAgICAgdGV4dEM6IFwiICB8ICBBICAgIGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGVuc3VyZSBcImYgZXNjYXBlXCIsIHRleHRDOiBcIiAgfCAgQSAgICBhYiAgICBhICAgIEFiICAgIGFcIlxuICAgICAgICBleHBlY3QodmltU3RhdGUuZ2xvYmFsU3RhdGUuZ2V0KFwiY3VycmVudEZpbmRcIikpLnRvQmVOdWxsKClcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsICAgICAgdGV4dEM6IFwiICAgIEEgICAgfGFiICAgIGEgICAgQWIgICAgYVwiXG4gICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5nbG9iYWxTdGF0ZS5nZXQoXCJjdXJyZW50RmluZFwiKSkudG9CZVRydXRoeSgpXG5cbiAgICBkZXNjcmliZSBcImZpbmRBY3Jvc3NMaW5lc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXR0aW5ncy5zZXQoXCJmaW5kQWNyb3NzTGluZXNcIiwgdHJ1ZSlcblxuICAgICAgaXQgXCJzZWFyY2hlcyBhY3Jvc3MgbXVsdGlwbGUgbGluZXNcIiwgLT5cbiAgICAgICAgc2V0ICAgICAgICAgICB0ZXh0QzogXCJ8MDogICAgYSAgICBhXFxuMTogICAgYSAgICBhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiZiBhXCIsIHRleHRDOiBcIjA6ICAgIHxhICAgIGFcXG4xOiAgICBhICAgIGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiMDogICAgYSAgICB8YVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIjtcIiwgICB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICB8YSAgICBhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwiO1wiLCAgIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgfGFcXG4yOiAgICBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCI7XCIsICAgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYSAgICBhXFxuMjogICAgfGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIkYgYVwiLCB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhICAgIHxhXFxuMjogICAgYSAgICBhXFxuXCJcbiAgICAgICAgZW5zdXJlIFwidCBhXCIsIHRleHRDOiBcIjA6ICAgIGEgICAgYVxcbjE6ICAgIGEgICAgYVxcbjI6ICAgfCBhICAgIGFcXG5cIlxuICAgICAgICBlbnN1cmUgXCJUIGFcIiwgdGV4dEM6IFwiMDogICAgYSAgICBhXFxuMTogICAgYSAgICB8YVxcbjI6ICAgIGEgICAgYVxcblwiXG4gICAgICAgIGVuc3VyZSBcIlQgYVwiLCB0ZXh0QzogXCIwOiAgICBhICAgIGFcXG4xOiAgICBhfCAgICBhXFxuMjogICAgYSAgICBhXFxuXCJcblxuICAgIGRlc2NyaWJlIFwiZmluZC1uZXh0L3ByZXZpb3VzLXByZS1jb25maXJtZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0dGluZ3Muc2V0KFwiZmluZENoYXJzTWF4XCIsIDEwKVxuICAgICAgICAjIFRvIHBhc3MgaGxGaW5kIGxvZ2ljIGl0IHJlcXVpcmUgXCJ2aXNpYmxlXCIgc2NyZWVuIHJhbmdlLlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGF0b20ud29ya3NwYWNlLmdldEVsZW1lbnQoKSlcblxuICAgICAgZGVzY3JpYmUgXCJjYW4gZmluZCBvbmUgb3IgdHdvIGNoYXJcIiwgLT5cbiAgICAgICAgaXQgXCJhZGp1c3QgdG8gbmV4dC1wcmUtY29uZmlybWVkXCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBhXCJcbiAgICAgICAgICBrZXlzdHJva2UgXCJmIGFcIlxuICAgICAgICAgIGVsZW1lbnQgPSB2aW1TdGF0ZS5pbnB1dEVkaXRvci5lbGVtZW50XG4gICAgICAgICAgZGlzcGF0Y2goZWxlbWVudCwgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCIpXG4gICAgICAgICAgZGlzcGF0Y2goZWxlbWVudCwgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCIpXG4gICAgICAgICAgZW5zdXJlIFwiZW50ZXJcIiwgICAgIHRleHRDOiBcIiAgICBhICAgIGFiICAgIHxhICAgIGNkICAgIGFcIlxuXG4gICAgICAgIGl0IFwiYWRqdXN0IHRvIHByZXZpb3VzLXByZS1jb25maXJtZWRcIiwgLT5cbiAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgZW5zdXJlIFwiMyBmIGEgZW50ZXJcIiwgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgfGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgc2V0ICAgICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgIGtleXN0cm9rZSBcIjMgZiBhXCJcbiAgICAgICAgICBlbGVtZW50ID0gdmltU3RhdGUuaW5wdXRFZGl0b3IuZWxlbWVudFxuICAgICAgICAgIGRpc3BhdGNoKGVsZW1lbnQsIFwidmltLW1vZGUtcGx1czpmaW5kLXByZXZpb3VzLXByZS1jb25maXJtZWRcIilcbiAgICAgICAgICBkaXNwYXRjaChlbGVtZW50LCBcInZpbS1tb2RlLXBsdXM6ZmluZC1wcmV2aW91cy1wcmUtY29uZmlybWVkXCIpXG4gICAgICAgICAgZW5zdXJlIFwiZW50ZXJcIiwgICAgIHRleHRDOiBcIiAgICB8YSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuXG4gICAgICAgIGl0IFwiaXMgdXNlZnVsIHRvIHNraXAgZWFybGllciBzcG90IGludGVyYWN0aXZlbGx5XCIsIC0+XG4gICAgICAgICAgc2V0ICB0ZXh0QzogJ3RleHQgPSBcInRoaXMgaXMgfFxcXCJleGFtcGxlXFxcIiBvZiB1c2UgY2FzZVwiJ1xuICAgICAgICAgIGtleXN0cm9rZSAnYyB0IFwiJ1xuICAgICAgICAgIGVsZW1lbnQgPSB2aW1TdGF0ZS5pbnB1dEVkaXRvci5lbGVtZW50XG4gICAgICAgICAgZGlzcGF0Y2goZWxlbWVudCwgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCIpICMgdGFiXG4gICAgICAgICAgZGlzcGF0Y2goZWxlbWVudCwgXCJ2aW0tbW9kZS1wbHVzOmZpbmQtbmV4dC1wcmUtY29uZmlybWVkXCIpICMgdGFiXG4gICAgICAgICAgZW5zdXJlIFwiZW50ZXJcIiwgdGV4dEM6ICd0ZXh0ID0gXCJ0aGlzIGlzIHxcIicsIG1vZGU6IFwiaW5zZXJ0XCJcblxuICAgIGRlc2NyaWJlIFwiZmluZENoYXJzTWF4XCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICMgVG8gcGFzcyBobEZpbmQgbG9naWMgaXQgcmVxdWlyZSBcInZpc2libGVcIiBzY3JlZW4gcmFuZ2UuXG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oYXRvbS53b3Jrc3BhY2UuZ2V0RWxlbWVudCgpKVxuXG4gICAgICBkZXNjcmliZSBcIndpdGggMiBsZW5ndGhcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldChcImZpbmRDaGFyc01heFwiLCAyKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiY2FuIGZpbmQgb25lIG9yIHR3byBjaGFyXCIsIC0+XG4gICAgICAgICAgaXQgXCJjYW4gZmluZCBieSB0d28gY2hhclwiLCAtPlxuICAgICAgICAgICAgc2V0ICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBhIGJcIiwgdGV4dEM6IFwiICAgIGEgICAgfGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGMgZFwiLCB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIHxjZCAgICBhXCJcblxuICAgICAgICAgIGl0IFwiY2FuIGZpbmQgYnkgb25lLWNoYXIgYnkgY29uZmlybWluZyBleHBsaWNpdGx5XCIsIC0+XG4gICAgICAgICAgICBzZXQgICAgICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBhIGVudGVyXCIsIHRleHRDOiBcIiAgICB8YSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBjIGVudGVyXCIsIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGFcIlxuXG4gICAgICBkZXNjcmliZSBcIndpdGggMyBsZW5ndGhcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldChcImZpbmRDaGFyc01heFwiLCAzKVxuXG4gICAgICAgIGRlc2NyaWJlIFwiY2FuIGZpbmQgMyBhdCBtYXhpbXVtXCIsIC0+XG4gICAgICAgICAgaXQgXCJjYW4gZmluZCBieSBvbmUgb3IgdHdvIG9yIHRocmVlIGNoYXJcIiwgLT5cbiAgICAgICAgICAgIHNldCAgICAgICAgICAgICAgICAgICB0ZXh0QzogXCJ8ICAgIGEgICAgYWIgICAgYSAgICBjZCAgICBlZmdcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBhIGIgZW50ZXJcIiwgdGV4dEM6IFwiICAgIGEgICAgfGFiICAgIGEgICAgY2QgICAgZWZnXCJcbiAgICAgICAgICAgIGVuc3VyZSBcImYgYSBlbnRlclwiLCAgIHRleHRDOiBcIiAgICBhICAgIGFiICAgIHxhICAgIGNkICAgIGVmZ1wiXG4gICAgICAgICAgICBlbnN1cmUgXCJmIGMgZCBlbnRlclwiLCB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIHxjZCAgICBlZmdcIlxuICAgICAgICAgICAgZW5zdXJlIFwiZiBlIGYgZ1wiLCAgICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICBjZCAgICB8ZWZnXCJcblxuICAgICAgZGVzY3JpYmUgXCJhdXRvQ29uZmlybVRpbWVvdXRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldHRpbmdzLnNldChcImZpbmRDaGFyc01heFwiLCAyKVxuICAgICAgICAgIHNldHRpbmdzLnNldChcImZpbmRDb25maXJtQnlUaW1lb3V0XCIsIDUwMClcblxuICAgICAgICBpdCBcImF1dG8tY29uZmlybSBzaW5nbGUtY2hhciBpbnB1dCBvbiB0aW1lb3V0XCIsIC0+XG4gICAgICAgICAgc2V0ICAgICAgICAgICAgIHRleHRDOiBcInwgICAgYSAgICBhYiAgICBhICAgIGNkICAgIGFcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiZiBhXCIsICAgdGV4dEM6IFwifCAgICBhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG4gICAgICAgICAgYWR2YW5jZUNsb2NrKDUwMClcbiAgICAgICAgICBlbnN1cmUgICAgICAgICAgdGV4dEM6IFwiICAgIHxhICAgIGFiICAgIGEgICAgY2QgICAgYVwiXG5cbiAgICAgICAgICBlbnN1cmUgXCJmIGMgZFwiLCB0ZXh0QzogXCIgICAgYSAgICBhYiAgICBhICAgIHxjZCAgICBhXCJcblxuICAgICAgICAgIGVuc3VyZSBcImYgYVwiLCAgIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgfGNkICAgIGFcIlxuICAgICAgICAgIGFkdmFuY2VDbG9jayg1MDApXG4gICAgICAgICAgZW5zdXJlICAgICAgICAgIHRleHRDOiBcIiAgICBhICAgIGFiICAgIGEgICAgY2QgICAgfGFcIlxuXG4gICAgICAgICAgZW5zdXJlIFwiRiBiXCIsICAgdGV4dEM6IFwiICAgIGEgICAgYWIgICAgYSAgICBjZCAgICB8YVwiXG4gICAgICAgICAgYWR2YW5jZUNsb2NrKDUwMClcbiAgICAgICAgICBlbnN1cmUgICAgICAgICAgdGV4dEM6IFwiICAgIGEgICAgYXxiICAgIGEgICAgY2QgICAgYVwiXG4iXX0=
