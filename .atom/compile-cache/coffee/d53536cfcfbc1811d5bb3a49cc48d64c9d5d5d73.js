(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke;
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("scrolling keybindings", function() {
      beforeEach(function() {
        var component, initialRowRange;
        component = editor.component;
        component.element.style.height = component.getLineHeight() * 5 + 'px';
        editorElement.measureDimensions();
        initialRowRange = [0, 5];
        set({
          cursor: [1, 2],
          text: "100\n200\n300\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual(initialRowRange);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(6);
          ensure('2 ctrl-e', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(8);
          ensure('2 ctrl-y', {
            cursor: [2, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(6);
        });
      });
    });
    describe("scroll cursor keybindings", function() {
      beforeEach(function() {
        var j, results;
        editor.setText((function() {
          results = [];
          for (j = 1; j <= 200; j++){ results.push(j); }
          return results;
        }).apply(this).join("\n"));
        editorElement.style.lineHeight = "20px";
        editorElement.setHeight(20 * 10);
        editorElement.measureDimensions();
        spyOn(editor, 'moveToFirstCharacterOfLine');
        spyOn(editorElement, 'setScrollTop');
        spyOn(editor, 'getFirstVisibleScreenRow').andReturn(90);
        spyOn(editor, 'getLastVisibleScreenRow').andReturn(110);
        return spyOn(editorElement, 'pixelPositionForScreenPosition').andReturn({
          top: 1000,
          left: 0
        });
      });
      describe("the z<CR> keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z enter');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zt keybinding", function() {
        return it("moves the screen to position cursor at the top of the window and leave cursor in the same column", function() {
          keystroke('z t');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(960);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z. keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z .');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      describe("the zz keybinding", function() {
        return it("moves the screen to position cursor at the center of the window and leave cursor in the same column", function() {
          keystroke('z z');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(900);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
      describe("the z- keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and moves cursor to first non-blank in the line", function() {
          keystroke('z -');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        });
      });
      return describe("the zb keybinding", function() {
        return it("moves the screen to position cursor at the bottom of the window and leave cursor in the same column", function() {
          keystroke('z b');
          expect(editorElement.setScrollTop).toHaveBeenCalledWith(860);
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        });
      });
    });
    return describe("horizontal scroll cursor keybindings", function() {
      beforeEach(function() {
        var i, j, text;
        editorElement.setWidth(600);
        editorElement.setHeight(600);
        editorElement.style.lineHeight = "10px";
        editorElement.style.font = "16px monospace";
        editorElement.measureDimensions();
        text = "";
        for (i = j = 100; j <= 199; i = ++j) {
          text += i + " ";
        }
        editor.setText(text);
        return editor.setCursorBufferPosition([0, 0]);
      });
      describe("the zs keybinding", function() {
        var startPosition, zsPos;
        startPosition = null;
        zsPos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z s');
          return editorElement.getScrollLeft();
        };
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        xit("does nothing near the start of the line", function() {
          var pos1;
          pos1 = zsPos(1);
          return expect(pos1).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the left edge of the editor", function() {
          var pos10, pos11;
          pos10 = zsPos(10);
          expect(pos10).toBeGreaterThan(startPosition);
          pos11 = zsPos(11);
          return expect(pos11 - pos10).toEqual(10);
        });
        it("does nothing near the end of the line", function() {
          var pos340, pos390, posEnd;
          posEnd = zsPos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos390 = zsPos(390);
          expect(pos390).toEqual(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 390]);
          pos340 = zsPos(340);
          return expect(pos340).toEqual(posEnd);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zsPos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zsPos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
      return describe("the ze keybinding", function() {
        var startPosition, zePos;
        zePos = function(pos) {
          editor.setCursorBufferPosition([0, pos]);
          keystroke('z e');
          return editorElement.getScrollLeft();
        };
        startPosition = null;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          expect(zePos(1)).toEqual(startPosition);
          return expect(zePos(40)).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          return expect(pos110 - zePos(109)).toEqual(10);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, posEnd;
          posEnd = zePos(399);
          expect(zePos(397)).toBeLessThan(posEnd);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          return expect(zePos(382) - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          expect(zePos(1)).toEqual(startPosition);
          return expect(zePos(10)).toEqual(startPosition);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3Njcm9sbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjO2VBQ2QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFKVSxDQUFaO0lBRFMsQ0FBWDtJQU9BLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO01BQ2hDLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsWUFBQTtRQUFDLFlBQWE7UUFDZCxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUF4QixHQUFpQyxTQUFTLENBQUMsYUFBVixDQUFBLENBQUEsR0FBNEIsQ0FBNUIsR0FBZ0M7UUFDakUsYUFBYSxDQUFDLGlCQUFkLENBQUE7UUFDQSxlQUFBLEdBQWtCLENBQUMsQ0FBRCxFQUFJLENBQUo7UUFFbEIsR0FBQSxDQUNFO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtVQUNBLElBQUEsRUFBTSxtREFETjtTQURGO2VBY0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxrQkFBZCxDQUFBLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxlQUFuRDtNQXBCUyxDQUFYO2FBc0JBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBO2VBQzVDLEVBQUEsQ0FBRywrREFBSCxFQUFvRSxTQUFBO1VBQ2xFLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFqQjtVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsd0JBQVAsQ0FBQSxDQUFQLENBQXlDLENBQUMsSUFBMUMsQ0FBK0MsQ0FBL0M7VUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBUCxDQUF3QyxDQUFDLElBQXpDLENBQThDLENBQTlDO1VBRUEsTUFBQSxDQUFPLFVBQVAsRUFBbUI7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQW5CO1VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyx3QkFBUCxDQUFBLENBQVAsQ0FBeUMsQ0FBQyxJQUExQyxDQUErQyxDQUEvQztVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsQ0FBOUM7VUFFQSxNQUFBLENBQU8sVUFBUCxFQUFtQjtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBbkI7VUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLHdCQUFQLENBQUEsQ0FBUCxDQUF5QyxDQUFDLElBQTFDLENBQStDLENBQS9DO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsQ0FBOUM7UUFYa0UsQ0FBcEU7TUFENEMsQ0FBOUM7SUF2QmdDLENBQWxDO0lBcUNBLFFBQUEsQ0FBUywyQkFBVCxFQUFzQyxTQUFBO01BQ3BDLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsWUFBQTtRQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWU7Ozs7c0JBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxDQUFmO1FBQ0EsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFwQixHQUFpQztRQUVqQyxhQUFhLENBQUMsU0FBZCxDQUF3QixFQUFBLEdBQUssRUFBN0I7UUFDQSxhQUFhLENBQUMsaUJBQWQsQ0FBQTtRQUVBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsNEJBQWQ7UUFDQSxLQUFBLENBQU0sYUFBTixFQUFxQixjQUFyQjtRQUNBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsMEJBQWQsQ0FBeUMsQ0FBQyxTQUExQyxDQUFvRCxFQUFwRDtRQUNBLEtBQUEsQ0FBTSxNQUFOLEVBQWMseUJBQWQsQ0FBd0MsQ0FBQyxTQUF6QyxDQUFtRCxHQUFuRDtlQUNBLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLGdDQUFyQixDQUFzRCxDQUFDLFNBQXZELENBQWlFO1VBQUMsR0FBQSxFQUFLLElBQU47VUFBWSxJQUFBLEVBQU0sQ0FBbEI7U0FBakU7TUFYUyxDQUFYO01BYUEsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUE7ZUFDL0IsRUFBQSxDQUFHLDhHQUFILEVBQW1ILFNBQUE7VUFDakgsU0FBQSxDQUFVLFNBQVY7VUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFlBQXJCLENBQWtDLENBQUMsb0JBQW5DLENBQXdELEdBQXhEO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsMEJBQWQsQ0FBeUMsQ0FBQyxnQkFBMUMsQ0FBQTtRQUhpSCxDQUFuSDtNQUQrQixDQUFqQztNQU1BLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO2VBQzVCLEVBQUEsQ0FBRyxrR0FBSCxFQUF1RyxTQUFBO1VBQ3JHLFNBQUEsQ0FBVSxLQUFWO1VBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxZQUFyQixDQUFrQyxDQUFDLG9CQUFuQyxDQUF3RCxHQUF4RDtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLDBCQUFkLENBQXlDLENBQUMsR0FBRyxDQUFDLGdCQUE5QyxDQUFBO1FBSHFHLENBQXZHO01BRDRCLENBQTlCO01BTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7ZUFDNUIsRUFBQSxDQUFHLGlIQUFILEVBQXNILFNBQUE7VUFDcEgsU0FBQSxDQUFVLEtBQVY7VUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFlBQXJCLENBQWtDLENBQUMsb0JBQW5DLENBQXdELEdBQXhEO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsMEJBQWQsQ0FBeUMsQ0FBQyxnQkFBMUMsQ0FBQTtRQUhvSCxDQUF0SDtNQUQ0QixDQUE5QjtNQU1BLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO2VBQzVCLEVBQUEsQ0FBRyxxR0FBSCxFQUEwRyxTQUFBO1VBQ3hHLFNBQUEsQ0FBVSxLQUFWO1VBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxZQUFyQixDQUFrQyxDQUFDLG9CQUFuQyxDQUF3RCxHQUF4RDtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLDBCQUFkLENBQXlDLENBQUMsR0FBRyxDQUFDLGdCQUE5QyxDQUFBO1FBSHdHLENBQTFHO01BRDRCLENBQTlCO01BTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7ZUFDNUIsRUFBQSxDQUFHLGlIQUFILEVBQXNILFNBQUE7VUFDcEgsU0FBQSxDQUFVLEtBQVY7VUFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFlBQXJCLENBQWtDLENBQUMsb0JBQW5DLENBQXdELEdBQXhEO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsMEJBQWQsQ0FBeUMsQ0FBQyxnQkFBMUMsQ0FBQTtRQUhvSCxDQUF0SDtNQUQ0QixDQUE5QjthQU1BLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO2VBQzVCLEVBQUEsQ0FBRyxxR0FBSCxFQUEwRyxTQUFBO1VBQ3hHLFNBQUEsQ0FBVSxLQUFWO1VBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxZQUFyQixDQUFrQyxDQUFDLG9CQUFuQyxDQUF3RCxHQUF4RDtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLDBCQUFkLENBQXlDLENBQUMsR0FBRyxDQUFDLGdCQUE5QyxDQUFBO1FBSHdHLENBQTFHO01BRDRCLENBQTlCO0lBNUNvQyxDQUF0QztXQWtEQSxRQUFBLENBQVMsc0NBQVQsRUFBaUQsU0FBQTtNQUMvQyxVQUFBLENBQVcsU0FBQTtBQUNULFlBQUE7UUFBQSxhQUFhLENBQUMsUUFBZCxDQUF1QixHQUF2QjtRQUNBLGFBQWEsQ0FBQyxTQUFkLENBQXdCLEdBQXhCO1FBQ0EsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFwQixHQUFpQztRQUNqQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQXBCLEdBQTJCO1FBQzNCLGFBQWEsQ0FBQyxpQkFBZCxDQUFBO1FBRUEsSUFBQSxHQUFPO0FBQ1AsYUFBUyw4QkFBVDtVQUNFLElBQUEsSUFBVyxDQUFELEdBQUc7QUFEZjtRQUVBLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZjtlQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO01BWFMsQ0FBWDtNQWFBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO0FBQzVCLFlBQUE7UUFBQSxhQUFBLEdBQWdCO1FBRWhCLEtBQUEsR0FBUSxTQUFDLEdBQUQ7VUFDTixNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksR0FBSixDQUEvQjtVQUNBLFNBQUEsQ0FBVSxLQUFWO2lCQUNBLGFBQWEsQ0FBQyxhQUFkLENBQUE7UUFITTtRQUtSLFVBQUEsQ0FBVyxTQUFBO2lCQUNULGFBQUEsR0FBZ0IsYUFBYSxDQUFDLGFBQWQsQ0FBQTtRQURQLENBQVg7UUFJQSxHQUFBLENBQUkseUNBQUosRUFBK0MsU0FBQTtBQUM3QyxjQUFBO1VBQUEsSUFBQSxHQUFPLEtBQUEsQ0FBTSxDQUFOO2lCQUNQLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxPQUFiLENBQXFCLGFBQXJCO1FBRjZDLENBQS9DO1FBSUEsRUFBQSxDQUFHLG9FQUFILEVBQXlFLFNBQUE7QUFDdkUsY0FBQTtVQUFBLEtBQUEsR0FBUSxLQUFBLENBQU0sRUFBTjtVQUNSLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxlQUFkLENBQThCLGFBQTlCO1VBRUEsS0FBQSxHQUFRLEtBQUEsQ0FBTSxFQUFOO2lCQUNSLE1BQUEsQ0FBTyxLQUFBLEdBQVEsS0FBZixDQUFxQixDQUFDLE9BQXRCLENBQThCLEVBQTlCO1FBTHVFLENBQXpFO1FBT0EsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUE7QUFDMUMsY0FBQTtVQUFBLE1BQUEsR0FBUyxLQUFBLENBQU0sR0FBTjtVQUNULE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBQyxDQUFELEVBQUksR0FBSixDQUFqRDtVQUVBLE1BQUEsR0FBUyxLQUFBLENBQU0sR0FBTjtVQUNULE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLE1BQXZCO1VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxDQUFDLENBQUQsRUFBSSxHQUFKLENBQWpEO1VBRUEsTUFBQSxHQUFTLEtBQUEsQ0FBTSxHQUFOO2lCQUNULE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLE1BQXZCO1FBVDBDLENBQTVDO2VBV0EsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUE7QUFDeEMsY0FBQTtVQUFBLE1BQU0sQ0FBQyxPQUFQLENBQWUsT0FBZjtVQUNBLGFBQUEsR0FBZ0IsYUFBYSxDQUFDLGFBQWQsQ0FBQTtVQUNoQixJQUFBLEdBQU8sS0FBQSxDQUFNLENBQU47VUFDUCxNQUFBLENBQU8sSUFBUCxDQUFZLENBQUMsT0FBYixDQUFxQixhQUFyQjtVQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqRDtVQUNBLEtBQUEsR0FBUSxLQUFBLENBQU0sRUFBTjtVQUNSLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxPQUFkLENBQXNCLGFBQXRCO2lCQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsdUJBQVAsQ0FBQSxDQUFQLENBQXdDLENBQUMsT0FBekMsQ0FBaUQsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqRDtRQVJ3QyxDQUExQztNQWxDNEIsQ0FBOUI7YUE0Q0EsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7QUFDNUIsWUFBQTtRQUFBLEtBQUEsR0FBUSxTQUFDLEdBQUQ7VUFDTixNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksR0FBSixDQUEvQjtVQUNBLFNBQUEsQ0FBVSxLQUFWO2lCQUNBLGFBQWEsQ0FBQyxhQUFkLENBQUE7UUFITTtRQUtSLGFBQUEsR0FBZ0I7UUFFaEIsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsYUFBQSxHQUFnQixhQUFhLENBQUMsYUFBZCxDQUFBO1FBRFAsQ0FBWDtRQUdBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO1VBQzVDLE1BQUEsQ0FBTyxLQUFBLENBQU0sQ0FBTixDQUFQLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsYUFBekI7aUJBQ0EsTUFBQSxDQUFPLEtBQUEsQ0FBTSxFQUFOLENBQVAsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQixhQUExQjtRQUY0QyxDQUE5QztRQUlBLEVBQUEsQ0FBRyxxRUFBSCxFQUEwRSxTQUFBO0FBQ3hFLGNBQUE7VUFBQSxNQUFBLEdBQVMsS0FBQSxDQUFNLEdBQU47VUFDVCxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsZUFBZixDQUErQixhQUEvQjtpQkFDQSxNQUFBLENBQU8sTUFBQSxHQUFTLEtBQUEsQ0FBTSxHQUFOLENBQWhCLENBQTJCLENBQUMsT0FBNUIsQ0FBb0MsRUFBcEM7UUFId0UsQ0FBMUU7UUFNQSxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTtBQUNwRCxjQUFBO1VBQUEsTUFBQSxHQUFTLEtBQUEsQ0FBTSxHQUFOO1VBQ1QsTUFBQSxDQUFPLEtBQUEsQ0FBTSxHQUFOLENBQVAsQ0FBa0IsQ0FBQyxZQUFuQixDQUFnQyxNQUFoQztVQUNBLE1BQUEsR0FBUyxLQUFBLENBQU0sR0FBTjtVQUNULE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxZQUFmLENBQTRCLE1BQTVCO2lCQUNBLE1BQUEsQ0FBTyxLQUFBLENBQU0sR0FBTixDQUFBLEdBQWEsTUFBcEIsQ0FBMkIsQ0FBQyxPQUE1QixDQUFvQyxFQUFwQztRQUxvRCxDQUF0RDtlQU9BLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBO1VBQ3hDLE1BQU0sQ0FBQyxPQUFQLENBQWUsT0FBZjtVQUNBLGFBQUEsR0FBZ0IsYUFBYSxDQUFDLGFBQWQsQ0FBQTtVQUNoQixNQUFBLENBQU8sS0FBQSxDQUFNLENBQU4sQ0FBUCxDQUFnQixDQUFDLE9BQWpCLENBQXlCLGFBQXpCO2lCQUNBLE1BQUEsQ0FBTyxLQUFBLENBQU0sRUFBTixDQUFQLENBQWlCLENBQUMsT0FBbEIsQ0FBMEIsYUFBMUI7UUFKd0MsQ0FBMUM7TUE1QjRCLENBQTlCO0lBMUQrQyxDQUFqRDtFQWpHb0IsQ0FBdEI7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIlNjcm9sbGluZ1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwic2Nyb2xsaW5nIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAge2NvbXBvbmVudH0gPSBlZGl0b3JcbiAgICAgIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbXBvbmVudC5nZXRMaW5lSGVpZ2h0KCkgKiA1ICsgJ3B4J1xuICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG4gICAgICBpbml0aWFsUm93UmFuZ2UgPSBbMCwgNV1cblxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzEsIDJdXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEwMFxuICAgICAgICAgIDIwMFxuICAgICAgICAgIDMwMFxuICAgICAgICAgIDQwMFxuICAgICAgICAgIDUwMFxuICAgICAgICAgIDYwMFxuICAgICAgICAgIDcwMFxuICAgICAgICAgIDgwMFxuICAgICAgICAgIDkwMFxuICAgICAgICAgIDEwMDBcbiAgICAgICAgXCJcIlwiXG4gICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRWaXNpYmxlUm93UmFuZ2UoKSkudG9FcXVhbChpbml0aWFsUm93UmFuZ2UpXG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLWUgYW5kIGN0cmwteSBrZXliaW5kaW5nc1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHVwIGFuZCBkb3duIGJ5IG9uZSBhbmQga2VlcHMgY3Vyc29yIG9uc2NyZWVuXCIsIC0+XG4gICAgICAgIGVuc3VyZSAnY3RybC1lJywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAxXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA2XG5cbiAgICAgICAgZW5zdXJlICcyIGN0cmwtZScsIGN1cnNvcjogWzQsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgM1xuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgOFxuXG4gICAgICAgIGVuc3VyZSAnMiBjdHJsLXknLCBjdXJzb3I6IFsyLCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDFcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDZcblxuICBkZXNjcmliZSBcInNjcm9sbCBjdXJzb3Iga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBbMS4uMjAwXS5qb2luKFwiXFxuXCIpXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjIwcHhcIlxuXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCgyMCAqIDEwKVxuICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG5cbiAgICAgIHNweU9uKGVkaXRvciwgJ21vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lJylcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdzZXRTY3JvbGxUb3AnKVxuICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDkwKVxuICAgICAgc3B5T24oZWRpdG9yLCAnZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oMTEwKVxuICAgICAgc3B5T24oZWRpdG9yRWxlbWVudCwgJ3BpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbicpLmFuZFJldHVybih7dG9wOiAxMDAwLCBsZWZ0OiAwfSlcblxuICAgIGRlc2NyaWJlIFwidGhlIHo8Q1I+IGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIHRvcCBvZiB0aGUgd2luZG93IGFuZCBtb3ZlcyBjdXJzb3IgdG8gZmlyc3Qgbm9uLWJsYW5rIGluIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiBlbnRlcidcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg5NjApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgenQga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgdG9wIG9mIHRoZSB3aW5kb3cgYW5kIGxlYXZlIGN1cnNvciBpbiB0aGUgc2FtZSBjb2x1bW5cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IHQnXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoOTYwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6LiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSBjZW50ZXIgb2YgdGhlIHdpbmRvdyBhbmQgbW92ZXMgY3Vyc29yIHRvIGZpcnN0IG5vbi1ibGFuayBpbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogLidcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg5MDApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgenoga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgY2VudGVyIG9mIHRoZSB3aW5kb3cgYW5kIGxlYXZlIGN1cnNvciBpbiB0aGUgc2FtZSBjb2x1bW5cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IHonXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoOTAwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcInRoZSB6LSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSBib3R0b20gb2YgdGhlIHdpbmRvdyBhbmQgbW92ZXMgY3Vyc29yIHRvIGZpcnN0IG5vbi1ibGFuayBpbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogLSdcbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCg4NjApXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgemIga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cgYW5kIGxlYXZlIGN1cnNvciBpbiB0aGUgc2FtZSBjb2x1bW5cIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IGInXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoODYwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgZGVzY3JpYmUgXCJob3Jpem9udGFsIHNjcm9sbCBjdXJzb3Iga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDYwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDYwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUubGluZUhlaWdodCA9IFwiMTBweFwiXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmZvbnQgPSBcIjE2cHggbW9ub3NwYWNlXCJcbiAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuXG4gICAgICB0ZXh0ID0gXCJcIlxuICAgICAgZm9yIGkgaW4gWzEwMC4uMTk5XVxuICAgICAgICB0ZXh0ICs9IFwiI3tpfSBcIlxuICAgICAgZWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG5cbiAgICBkZXNjcmliZSBcInRoZSB6cyBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBzdGFydFBvc2l0aW9uID0gbnVsbFxuXG4gICAgICB6c1BvcyA9IChwb3MpIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgcG9zXSlcbiAgICAgICAga2V5c3Ryb2tlICd6IHMnXG4gICAgICAgIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgICMgRklYTUU6IHJlbW92ZSBpbiBmdXR1cmVcbiAgICAgIHhpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBzdGFydCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3MxID0genNQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRoZSBuZWFyZXN0IGl0IGNhbiB0byB0aGUgbGVmdCBlZGdlIG9mIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgICAgcG9zMTAgPSB6c1BvcygxMClcbiAgICAgICAgZXhwZWN0KHBvczEwKS50b0JlR3JlYXRlclRoYW4oc3RhcnRQb3NpdGlvbilcblxuICAgICAgICBwb3MxMSA9IHpzUG9zKDExKVxuICAgICAgICBleHBlY3QocG9zMTEgLSBwb3MxMCkudG9FcXVhbCgxMClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvc0VuZCA9IHpzUG9zKDM5OSlcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTldXG5cbiAgICAgICAgcG9zMzkwID0genNQb3MoMzkwKVxuICAgICAgICBleHBlY3QocG9zMzkwKS50b0VxdWFsKHBvc0VuZClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAzOTBdXG5cbiAgICAgICAgcG9zMzQwID0genNQb3MoMzQwKVxuICAgICAgICBleHBlY3QocG9zMzQwKS50b0VxdWFsKHBvc0VuZClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgYWxsIGxpbmVzIGFyZSBzaG9ydFwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCgnc2hvcnQnKVxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcbiAgICAgICAgcG9zMSA9IHpzUG9zKDEpXG4gICAgICAgIGV4cGVjdChwb3MxKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMV1cbiAgICAgICAgcG9zMTAgPSB6c1BvcygxMClcbiAgICAgICAgZXhwZWN0KHBvczEwKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgNF1cblxuICAgIGRlc2NyaWJlIFwidGhlIHplIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIHplUG9zID0gKHBvcykgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCBwb3NdKVxuICAgICAgICBrZXlzdHJva2UgJ3ogZSdcbiAgICAgICAgZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgc3RhcnRQb3NpdGlvbiA9IG51bGxcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgZXhwZWN0KHplUG9zKDEpKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdCh6ZVBvcyg0MCkpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcblxuICAgICAgaXQgXCJtb3ZlcyB0aGUgY3Vyc29yIHRoZSBuZWFyZXN0IGl0IGNhbiB0byB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICAgIHBvczExMCA9IHplUG9zKDExMClcbiAgICAgICAgZXhwZWN0KHBvczExMCkudG9CZUdyZWF0ZXJUaGFuKHN0YXJ0UG9zaXRpb24pXG4gICAgICAgIGV4cGVjdChwb3MxMTAgLSB6ZVBvcygxMDkpKS50b0VxdWFsKDEwKVxuXG4gICAgICAjIEZJWE1FIGRlc2NyaXB0aW9uIGlzIG5vIGxvbmdlciBhcHByb3ByaWF0ZVxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgd2hlbiB2ZXJ5IG5lYXIgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3NFbmQgPSB6ZVBvcygzOTkpXG4gICAgICAgIGV4cGVjdCh6ZVBvcygzOTcpKS50b0JlTGVzc1RoYW4ocG9zRW5kKVxuICAgICAgICBwb3MzODAgPSB6ZVBvcygzODApXG4gICAgICAgIGV4cGVjdChwb3MzODApLnRvQmVMZXNzVGhhbihwb3NFbmQpXG4gICAgICAgIGV4cGVjdCh6ZVBvcygzODIpIC0gcG9zMzgwKS50b0VxdWFsKDE5KVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiBhbGwgbGluZXMgYXJlIHNob3J0XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdzaG9ydCcpXG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgICAgICBleHBlY3QoemVQb3MoMSkpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KHplUG9zKDEwKSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuIl19
