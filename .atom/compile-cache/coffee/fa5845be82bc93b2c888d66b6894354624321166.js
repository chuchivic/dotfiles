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
        startPosition = 0/0;
        beforeEach(function() {
          return startPosition = editorElement.getScrollLeft();
        });
        it("does nothing near the start of the line", function() {
          var pos1, pos40;
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          pos40 = zePos(40);
          return expect(pos40).toEqual(startPosition);
        });
        it("moves the cursor the nearest it can to the right edge of the editor", function() {
          var pos109, pos110;
          pos110 = zePos(110);
          expect(pos110).toBeGreaterThan(startPosition);
          pos109 = zePos(109);
          return expect(pos110 - pos109).toEqual(10);
        });
        it("does nothing when very near the end of the line", function() {
          var pos380, pos382, pos397, posEnd;
          posEnd = zePos(399);
          expect(editor.getCursorBufferPosition()).toEqual([0, 399]);
          pos397 = zePos(397);
          expect(pos397).toBeLessThan(posEnd);
          expect(editor.getCursorBufferPosition()).toEqual([0, 397]);
          pos380 = zePos(380);
          expect(pos380).toBeLessThan(posEnd);
          pos382 = zePos(382);
          return expect(pos382 - pos380).toEqual(19);
        });
        return it("does nothing if all lines are short", function() {
          var pos1, pos10;
          editor.setText('short');
          startPosition = editorElement.getScrollLeft();
          pos1 = zePos(1);
          expect(pos1).toEqual(startPosition);
          expect(editor.getCursorBufferPosition()).toEqual([0, 1]);
          pos10 = zePos(10);
          expect(pos10).toEqual(startPosition);
          return expect(editor.getCursorBufferPosition()).toEqual([0, 4]);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3Njcm9sbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsTUFBNEQsRUFBNUQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGtCQUFkLEVBQXlCLGVBQXpCLEVBQWlDLHNCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTthQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztRQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjO2VBQ2QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFKVSxDQUFaO0lBRFMsQ0FBWDtJQU9BLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO01BQ2hDLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsWUFBQTtRQUFDLFlBQWE7UUFDZCxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUF4QixHQUFpQyxTQUFTLENBQUMsYUFBVixDQUFBLENBQUEsR0FBNEIsQ0FBNUIsR0FBZ0M7UUFDakUsYUFBYSxDQUFDLGlCQUFkLENBQUE7UUFDQSxlQUFBLEdBQWtCLENBQUMsQ0FBRCxFQUFJLENBQUo7UUFFbEIsR0FBQSxDQUNFO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtVQUNBLElBQUEsRUFBTSxtREFETjtTQURGO2VBY0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxrQkFBZCxDQUFBLENBQVAsQ0FBMEMsQ0FBQyxPQUEzQyxDQUFtRCxlQUFuRDtNQXBCUyxDQUFYO2FBc0JBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBO2VBQzVDLEVB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QSxDQUFPLE1BQVAsQ0FBYyxDQUFDLFlBQWYsQ0FBNEIsTUFBNUI7VUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBUCxDQUF3QyxDQUFDLE9BQXpDLENBQWlELENBQUMsQ0FBRCxFQUFJLEdBQUosQ0FBakQ7VUFFQSxNQUFBLEdBQVMsS0FBQSxDQUFNLEdBQU47VUFDVCxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsWUFBZixDQUE0QixNQUE1QjtVQUVBLE1BQUEsR0FBUyxLQUFBLENBQU0sR0FBTjtpQkFDVCxNQUFBLENBQU8sTUFBQSxHQUFTLE1BQWhCLENBQXVCLENBQUMsT0FBeEIsQ0FBZ0MsRUFBaEM7UUFab0QsQ0FBdEQ7ZUFjQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQTtBQUN4QyxjQUFBO1VBQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxPQUFmO1VBQ0EsYUFBQSxHQUFnQixhQUFhLENBQUMsYUFBZCxDQUFBO1VBQ2hCLElBQUEsR0FBTyxLQUFBLENBQU0sQ0FBTjtVQUNQLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxPQUFiLENBQXFCLGFBQXJCO1VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpEO1VBQ0EsS0FBQSxHQUFRLEtBQUEsQ0FBTSxFQUFOO1VBQ1IsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsYUFBdEI7aUJBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyx1QkFBUCxDQUFBLENBQVAsQ0FBd0MsQ0FBQyxPQUF6QyxDQUFpRCxDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpEO1FBUndDLENBQTFDO01BeEM0QixDQUE5QjtJQTFEK0MsQ0FBakQ7RUFqR29CLENBQXRCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxuZGVzY3JpYmUgXCJTY3JvbGxpbmdcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSB2aW1cbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00oZWRpdG9yRWxlbWVudClcblxuICBkZXNjcmliZSBcInNjcm9sbGluZyBrZXliaW5kaW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHtjb21wb25lbnR9ID0gZWRpdG9yXG4gICAgICBjb21wb25lbnQuZWxlbWVudC5zdHlsZS5oZWlnaHQgPSBjb21wb25lbnQuZ2V0TGluZUhlaWdodCgpICogNSArICdweCdcbiAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuICAgICAgaW5pdGlhbFJvd1JhbmdlID0gWzAsIDVdXG5cbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFsxLCAyXVxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAxMDBcbiAgICAgICAgICAyMDBcbiAgICAgICAgICAzMDBcbiAgICAgICAgICA0MDBcbiAgICAgICAgICA1MDBcbiAgICAgICAgICA2MDBcbiAgICAgICAgICA3MDBcbiAgICAgICAgICA4MDBcbiAgICAgICAgICA5MDBcbiAgICAgICAgICAxMDAwXG4gICAgICAgIFwiXCJcIlxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKCkpLnRvRXF1YWwoaW5pdGlhbFJvd1JhbmdlKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgY3RybC1lIGFuZCBjdHJsLXkga2V5YmluZGluZ3NcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB1cCBhbmQgZG93biBieSBvbmUgYW5kIGtlZXBzIGN1cnNvciBvbnNjcmVlblwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwtZScsIGN1cnNvcjogWzIsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgMVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgNlxuXG4gICAgICAgIGVuc3VyZSAnMiBjdHJsLWUnLCBjdXJzb3I6IFs0LCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDNcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDhcblxuICAgICAgICBlbnN1cmUgJzIgY3RybC15JywgY3Vyc29yOiBbMiwgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAxXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA2XG5cbiAgZGVzY3JpYmUgXCJzY3JvbGwgY3Vyc29yIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgWzEuLjIwMF0uam9pbihcIlxcblwiKVxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5saW5lSGVpZ2h0ID0gXCIyMHB4XCJcblxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoMjAgKiAxMClcbiAgICAgIGVkaXRvckVsZW1lbnQubWVhc3VyZURpbWVuc2lvbnMoKVxuXG4gICAgICBzcHlPbihlZGl0b3IsICdtb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZScpXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAnc2V0U2Nyb2xsVG9wJylcbiAgICAgIHNweU9uKGVkaXRvciwgJ2dldEZpcnN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybig5MClcbiAgICAgIHNweU9uKGVkaXRvciwgJ2dldExhc3RWaXNpYmxlU2NyZWVuUm93JykuYW5kUmV0dXJuKDExMClcbiAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQsICdwaXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24nKS5hbmRSZXR1cm4oe3RvcDogMTAwMCwgbGVmdDogMH0pXG5cbiAgICBkZXNjcmliZSBcInRoZSB6PENSPiBrZXliaW5kaW5nXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdG8gcG9zaXRpb24gY3Vyc29yIGF0IHRoZSB0b3Agb2YgdGhlIHdpbmRvdyBhbmQgbW92ZXMgY3Vyc29yIHRvIGZpcnN0IG5vbi1ibGFuayBpbiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBrZXlzdHJva2UgJ3ogZW50ZXInXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoOTYwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwidGhlIHp0IGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIHRvcCBvZiB0aGUgd2luZG93IGFuZCBsZWF2ZSBjdXJzb3IgaW4gdGhlIHNhbWUgY29sdW1uXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiB0J1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKDk2MClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgei4ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgY2VudGVyIG9mIHRoZSB3aW5kb3cgYW5kIG1vdmVzIGN1cnNvciB0byBmaXJzdCBub24tYmxhbmsgaW4gdGhlIGxpbmVcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IC4nXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoOTAwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwidGhlIHp6IGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIGNlbnRlciBvZiB0aGUgd2luZG93IGFuZCBsZWF2ZSBjdXJzb3IgaW4gdGhlIHNhbWUgY29sdW1uXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiB6J1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKDkwMClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgei0ga2V5YmluZGluZ1wiLCAtPlxuICAgICAgaXQgXCJtb3ZlcyB0aGUgc2NyZWVuIHRvIHBvc2l0aW9uIGN1cnNvciBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cgYW5kIG1vdmVzIGN1cnNvciB0byBmaXJzdCBub24tYmxhbmsgaW4gdGhlIGxpbmVcIiwgLT5cbiAgICAgICAga2V5c3Ryb2tlICd6IC0nXG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoODYwKVxuICAgICAgICBleHBlY3QoZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGRlc2NyaWJlIFwidGhlIHpiIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIGl0IFwibW92ZXMgdGhlIHNjcmVlbiB0byBwb3NpdGlvbiBjdXJzb3IgYXQgdGhlIGJvdHRvbSBvZiB0aGUgd2luZG93IGFuZCBsZWF2ZSBjdXJzb3IgaW4gdGhlIHNhbWUgY29sdW1uXCIsIC0+XG4gICAgICAgIGtleXN0cm9rZSAneiBiJ1xuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKDg2MClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gIGRlc2NyaWJlIFwiaG9yaXpvbnRhbCBzY3JvbGwgY3Vyc29yIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCg2MDApXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg2MDApXG4gICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmxpbmVIZWlnaHQgPSBcIjEwcHhcIlxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5mb250ID0gXCIxNnB4IG1vbm9zcGFjZVwiXG4gICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcblxuICAgICAgdGV4dCA9IFwiXCJcbiAgICAgIGZvciBpIGluIFsxMDAuLjE5OV1cbiAgICAgICAgdGV4dCArPSBcIiN7aX0gXCJcbiAgICAgIGVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgenMga2V5YmluZGluZ1wiLCAtPlxuICAgICAgc3RhcnRQb3NpdGlvbiA9IG51bGxcblxuICAgICAgenNQb3MgPSAocG9zKSAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIHBvc10pXG4gICAgICAgIGtleXN0cm9rZSAneiBzJ1xuICAgICAgICBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICAjIEZJWE1FOiByZW1vdmUgaW4gZnV0dXJlXG4gICAgICB4aXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zMSA9IHpzUG9zKDEpXG4gICAgICAgIGV4cGVjdChwb3MxKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0aGUgbmVhcmVzdCBpdCBjYW4gdG8gdGhlIGxlZnQgZWRnZSBvZiB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICAgIHBvczEwID0genNQb3MoMTApXG4gICAgICAgIGV4cGVjdChwb3MxMCkudG9CZUdyZWF0ZXJUaGFuKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgICAgcG9zMTEgPSB6c1BvcygxMSlcbiAgICAgICAgZXhwZWN0KHBvczExIC0gcG9zMTApLnRvRXF1YWwoMTApXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIG5lYXIgdGhlIGVuZCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBwb3NFbmQgPSB6c1BvcygzOTkpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMzk5XVxuXG4gICAgICAgIHBvczM5MCA9IHpzUG9zKDM5MClcbiAgICAgICAgZXhwZWN0KHBvczM5MCkudG9FcXVhbChwb3NFbmQpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMzkwXVxuXG4gICAgICAgIHBvczM0MCA9IHpzUG9zKDM0MClcbiAgICAgICAgZXhwZWN0KHBvczM0MCkudG9FcXVhbChwb3NFbmQpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFsbCBsaW5lcyBhcmUgc2hvcnRcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ3Nob3J0JylcbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICAgIHBvczEgPSB6c1BvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDFdXG4gICAgICAgIHBvczEwID0genNQb3MoMTApXG4gICAgICAgIGV4cGVjdChwb3MxMCkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDRdXG5cbiAgICBkZXNjcmliZSBcInRoZSB6ZSBrZXliaW5kaW5nXCIsIC0+XG4gICAgICB6ZVBvcyA9IChwb3MpIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgcG9zXSlcbiAgICAgICAga2V5c3Ryb2tlICd6IGUnXG4gICAgICAgIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG5cbiAgICAgIHN0YXJ0UG9zaXRpb24gPSBOYU5cblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgbmVhciB0aGUgc3RhcnQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zMSA9IHplUG9zKDEpXG4gICAgICAgIGV4cGVjdChwb3MxKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgICAgcG9zNDAgPSB6ZVBvcyg0MClcbiAgICAgICAgZXhwZWN0KHBvczQwKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG5cbiAgICAgIGl0IFwibW92ZXMgdGhlIGN1cnNvciB0aGUgbmVhcmVzdCBpdCBjYW4gdG8gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGVkaXRvclwiLCAtPlxuICAgICAgICBwb3MxMTAgPSB6ZVBvcygxMTApXG4gICAgICAgIGV4cGVjdChwb3MxMTApLnRvQmVHcmVhdGVyVGhhbihzdGFydFBvc2l0aW9uKVxuXG4gICAgICAgIHBvczEwOSA9IHplUG9zKDEwOSlcbiAgICAgICAgZXhwZWN0KHBvczExMCAtIHBvczEwOSkudG9FcXVhbCgxMClcblxuICAgICAgIyBGSVhNRSBkZXNjcmlwdGlvbiBpcyBubyBsb25nZXIgYXBwcm9wcmlhdGVcbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIHdoZW4gdmVyeSBuZWFyIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zRW5kID0gemVQb3MoMzk5KVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5OV1cblxuICAgICAgICBwb3MzOTcgPSB6ZVBvcygzOTcpXG4gICAgICAgIGV4cGVjdChwb3MzOTcpLnRvQmVMZXNzVGhhbihwb3NFbmQpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbCBbMCwgMzk3XVxuXG4gICAgICAgIHBvczM4MCA9IHplUG9zKDM4MClcbiAgICAgICAgZXhwZWN0KHBvczM4MCkudG9CZUxlc3NUaGFuKHBvc0VuZClcblxuICAgICAgICBwb3MzODIgPSB6ZVBvcygzODIpXG4gICAgICAgIGV4cGVjdChwb3MzODIgLSBwb3MzODApLnRvRXF1YWwoMTkpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFsbCBsaW5lcyBhcmUgc2hvcnRcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ3Nob3J0JylcbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICAgIHBvczEgPSB6ZVBvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDFdXG4gICAgICAgIHBvczEwID0gemVQb3MoMTApXG4gICAgICAgIGV4cGVjdChwb3MxMCkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDRdXG4iXX0=
