(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Scrolling", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        set = vim.set, ensure = vim.ensure;
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
          textC: "100\n200\n30|0\n400\n500\n600\n700\n800\n900\n1000"
        });
        return expect(editorElement.getVisibleRowRange()).toEqual(initialRowRange);
      });
      return describe("the ctrl-e and ctrl-y keybindings", function() {
        return it("moves the screen up and down by one and keeps cursor onscreen", function() {
          ensure('ctrl-e', {
            cursor: [3, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          expect(editor.getLastVisibleScreenRow()).toBe(6);
          ensure('2 ctrl-e', {
            cursor: [5, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(3);
          expect(editor.getLastVisibleScreenRow()).toBe(8);
          ensure('2 ctrl-y', {
            cursor: [4, 2]
          });
          expect(editor.getFirstVisibleScreenRow()).toBe(1);
          return expect(editor.getLastVisibleScreenRow()).toBe(6);
        });
      });
    });
    describe("redraw-cursor-line keybindings", function() {
      var _ensure;
      _ensure = function(keystroke, arg) {
        var moveToFirstChar, scrollTop;
        scrollTop = arg.scrollTop, moveToFirstChar = arg.moveToFirstChar;
        ensure(keystroke);
        expect(editorElement.setScrollTop).toHaveBeenCalledWith(scrollTop);
        if (moveToFirstChar) {
          return expect(editor.moveToFirstCharacterOfLine).toHaveBeenCalled();
        } else {
          return expect(editor.moveToFirstCharacterOfLine).not.toHaveBeenCalled();
        }
      };
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
      describe("at top", function() {
        it("without move cursor", function() {
          return _ensure('z t', {
            scrollTop: 960,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z enter', {
            scrollTop: 960,
            moveToFirstChar: true
          });
        });
      });
      describe("at upper-middle", function() {
        it("without move cursor", function() {
          return _ensure('z u', {
            scrollTop: 950,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z space', {
            scrollTop: 950,
            moveToFirstChar: true
          });
        });
      });
      describe("at middle", function() {
        it("without move cursor", function() {
          return _ensure('z z', {
            scrollTop: 900,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z .', {
            scrollTop: 900,
            moveToFirstChar: true
          });
        });
      });
      return describe("at bottom", function() {
        it("without move cursor", function() {
          return _ensure('z b', {
            scrollTop: 860,
            moveToFirstChar: false
          });
        });
        return it("with move to 1st char", function() {
          return _ensure('z -', {
            scrollTop: 860,
            moveToFirstChar: true
          });
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
          ensure('z s');
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
          ensure('z e');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3Njcm9sbC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsY0FBZSxPQUFBLENBQVEsZUFBUjs7RUFFaEIsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTtBQUNwQixRQUFBO0lBQUEsTUFBaUQsRUFBakQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGVBQWQsRUFBc0Isc0JBQXRCLEVBQXFDO0lBRXJDLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO1FBQ1IsYUFBRCxFQUFNO2VBQ04sT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFKVSxDQUFaO0lBRFMsQ0FBWDtJQU9BLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO01BQ2hDLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsWUFBQTtRQUFDLFlBQWE7UUFDZCxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUF4QixHQUFpQyxTQUFTLENBQUMsYUFBVixDQUFBLENBQUEsR0FBNEIsQ0FBNUIsR0FBZ0M7UUFDakUsYUFBYSxDQUFDLGlCQUFkLENBQUE7UUFDQSxlQUFBLEdBQWtCLENBQUMsQ0FBRCxFQUFJLENBQUo7UUFFbEIsR0FBQSxDQUNFO1VBQUEsS0FBQSxFQUFPLG9EQUFQO1NBREY7ZUFhQSxNQUFBLENBQU8sYUFBYSxDQUFDLGtCQUFkLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELGVBQW5EO01BbkJTLENBQVg7YUFxQkEsUUFBQSxDQUFTLG1DQUFULEVBQThDLFNBQUE7ZUFDNUMsRUFBQSxDQUFHLCtEQUFILEVBQW9FLFNBQUE7VUFDbEUsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxNQUFBLEVB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QTJCLENBQUMsT0FBNUIsQ0FBb0MsRUFBcEM7UUFMb0QsQ0FBdEQ7ZUFPQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQTtVQUN4QyxNQUFNLENBQUMsT0FBUCxDQUFlLE9BQWY7VUFDQSxhQUFBLEdBQWdCLGFBQWEsQ0FBQyxhQUFkLENBQUE7VUFDaEIsTUFBQSxDQUFPLEtBQUEsQ0FBTSxDQUFOLENBQVAsQ0FBZ0IsQ0FBQyxPQUFqQixDQUF5QixhQUF6QjtpQkFDQSxNQUFBLENBQU8sS0FBQSxDQUFNLEVBQU4sQ0FBUCxDQUFpQixDQUFDLE9BQWxCLENBQTBCLGFBQTFCO1FBSndDLENBQTFDO01BNUI0QixDQUE5QjtJQTFEK0MsQ0FBakQ7RUFqRm9CLENBQXRCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxuZGVzY3JpYmUgXCJTY3JvbGxpbmdcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlfSA9IHZpbVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwic2Nyb2xsaW5nIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAge2NvbXBvbmVudH0gPSBlZGl0b3JcbiAgICAgIGNvbXBvbmVudC5lbGVtZW50LnN0eWxlLmhlaWdodCA9IGNvbXBvbmVudC5nZXRMaW5lSGVpZ2h0KCkgKiA1ICsgJ3B4J1xuICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG4gICAgICBpbml0aWFsUm93UmFuZ2UgPSBbMCwgNV1cblxuICAgICAgc2V0XG4gICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAxMDBcbiAgICAgICAgICAyMDBcbiAgICAgICAgICAzMHwwXG4gICAgICAgICAgNDAwXG4gICAgICAgICAgNTAwXG4gICAgICAgICAgNjAwXG4gICAgICAgICAgNzAwXG4gICAgICAgICAgODAwXG4gICAgICAgICAgOTAwXG4gICAgICAgICAgMTAwMFxuICAgICAgICBcIlwiXCJcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFZpc2libGVSb3dSYW5nZSgpKS50b0VxdWFsKGluaXRpYWxSb3dSYW5nZSlcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtZSBhbmQgY3RybC15IGtleWJpbmRpbmdzXCIsIC0+XG4gICAgICBpdCBcIm1vdmVzIHRoZSBzY3JlZW4gdXAgYW5kIGRvd24gYnkgb25lIGFuZCBrZWVwcyBjdXJzb3Igb25zY3JlZW5cIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLCBjdXJzb3I6IFszLCAyXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDFcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpKS50b0JlIDZcblxuICAgICAgICBlbnN1cmUgJzIgY3RybC1lJywgY3Vyc29yOiBbNSwgMl1cbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSAzXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKSkudG9CZSA4XG5cbiAgICAgICAgZW5zdXJlICcyIGN0cmwteScsIGN1cnNvcjogWzQsIDJdXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgMVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RWaXNpYmxlU2NyZWVuUm93KCkpLnRvQmUgNlxuXG4gIGRlc2NyaWJlIFwicmVkcmF3LWN1cnNvci1saW5lIGtleWJpbmRpbmdzXCIsIC0+XG4gICAgX2Vuc3VyZSA9IChrZXlzdHJva2UsIHtzY3JvbGxUb3AsIG1vdmVUb0ZpcnN0Q2hhcn0pIC0+XG4gICAgICBlbnN1cmUoa2V5c3Ryb2tlKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChzY3JvbGxUb3ApXG4gICAgICBpZiBtb3ZlVG9GaXJzdENoYXJcbiAgICAgICAgZXhwZWN0KGVkaXRvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBlbHNlXG4gICAgICAgIGV4cGVjdChlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFsxLi4yMDBdLmpvaW4oXCJcXG5cIilcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUubGluZUhlaWdodCA9IFwiMjBweFwiXG5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDIwICogMTApXG4gICAgICBlZGl0b3JFbGVtZW50Lm1lYXN1cmVEaW1lbnNpb25zKClcblxuICAgICAgc3B5T24oZWRpdG9yLCAnbW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUnKVxuICAgICAgc3B5T24oZWRpdG9yRWxlbWVudCwgJ3NldFNjcm9sbFRvcCcpXG4gICAgICBzcHlPbihlZGl0b3IsICdnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cnKS5hbmRSZXR1cm4oOTApXG4gICAgICBzcHlPbihlZGl0b3IsICdnZXRMYXN0VmlzaWJsZVNjcmVlblJvdycpLmFuZFJldHVybigxMTApXG4gICAgICBzcHlPbihlZGl0b3JFbGVtZW50LCAncGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uJykuYW5kUmV0dXJuKHt0b3A6IDEwMDAsIGxlZnQ6IDB9KVxuXG4gICAgZGVzY3JpYmUgXCJhdCB0b3BcIiwgLT5cbiAgICAgIGl0IFwid2l0aG91dCBtb3ZlIGN1cnNvclwiLCAtPiAgIF9lbnN1cmUgJ3ogdCcsICAgICBzY3JvbGxUb3A6IDk2MCwgbW92ZVRvRmlyc3RDaGFyOiBmYWxzZVxuICAgICAgaXQgXCJ3aXRoIG1vdmUgdG8gMXN0IGNoYXJcIiwgLT4gX2Vuc3VyZSAneiBlbnRlcicsIHNjcm9sbFRvcDogOTYwLCBtb3ZlVG9GaXJzdENoYXI6IHRydWVcbiAgICBkZXNjcmliZSBcImF0IHVwcGVyLW1pZGRsZVwiLCAtPlxuICAgICAgaXQgXCJ3aXRob3V0IG1vdmUgY3Vyc29yXCIsIC0+ICAgX2Vuc3VyZSAneiB1JywgICAgIHNjcm9sbFRvcDogOTUwLCBtb3ZlVG9GaXJzdENoYXI6IGZhbHNlXG4gICAgICBpdCBcIndpdGggbW92ZSB0byAxc3QgY2hhclwiLCAtPiBfZW5zdXJlICd6IHNwYWNlJywgc2Nyb2xsVG9wOiA5NTAsIG1vdmVUb0ZpcnN0Q2hhcjogdHJ1ZVxuICAgIGRlc2NyaWJlIFwiYXQgbWlkZGxlXCIsIC0+XG4gICAgICBpdCBcIndpdGhvdXQgbW92ZSBjdXJzb3JcIiwgLT4gICBfZW5zdXJlICd6IHonLCAgICAgc2Nyb2xsVG9wOiA5MDAsIG1vdmVUb0ZpcnN0Q2hhcjogZmFsc2VcbiAgICAgIGl0IFwid2l0aCBtb3ZlIHRvIDFzdCBjaGFyXCIsIC0+IF9lbnN1cmUgJ3ogLicsICAgICBzY3JvbGxUb3A6IDkwMCwgbW92ZVRvRmlyc3RDaGFyOiB0cnVlXG4gICAgZGVzY3JpYmUgXCJhdCBib3R0b21cIiwgLT5cbiAgICAgIGl0IFwid2l0aG91dCBtb3ZlIGN1cnNvclwiLCAtPiAgIF9lbnN1cmUgJ3ogYicsICAgICBzY3JvbGxUb3A6IDg2MCwgbW92ZVRvRmlyc3RDaGFyOiBmYWxzZVxuICAgICAgaXQgXCJ3aXRoIG1vdmUgdG8gMXN0IGNoYXJcIiwgLT4gX2Vuc3VyZSAneiAtJywgICAgIHNjcm9sbFRvcDogODYwLCBtb3ZlVG9GaXJzdENoYXI6IHRydWVcblxuICBkZXNjcmliZSBcImhvcml6b250YWwgc2Nyb2xsIGN1cnNvciBrZXliaW5kaW5nc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0V2lkdGgoNjAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNjAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5saW5lSGVpZ2h0ID0gXCIxMHB4XCJcbiAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZm9udCA9IFwiMTZweCBtb25vc3BhY2VcIlxuICAgICAgZWRpdG9yRWxlbWVudC5tZWFzdXJlRGltZW5zaW9ucygpXG5cbiAgICAgIHRleHQgPSBcIlwiXG4gICAgICBmb3IgaSBpbiBbMTAwLi4xOTldXG4gICAgICAgIHRleHQgKz0gXCIje2l9IFwiXG4gICAgICBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAwXSlcblxuICAgIGRlc2NyaWJlIFwidGhlIHpzIGtleWJpbmRpbmdcIiwgLT5cbiAgICAgIHN0YXJ0UG9zaXRpb24gPSBudWxsXG5cbiAgICAgIHpzUG9zID0gKHBvcykgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCBwb3NdKVxuICAgICAgICBlbnN1cmUgJ3ogcydcbiAgICAgICAgZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzdGFydFBvc2l0aW9uID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxMZWZ0KClcblxuICAgICAgIyBGSVhNRTogcmVtb3ZlIGluIGZ1dHVyZVxuICAgICAgeGl0IFwiZG9lcyBub3RoaW5nIG5lYXIgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvczEgPSB6c1BvcygxKVxuICAgICAgICBleHBlY3QocG9zMSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdGhlIG5lYXJlc3QgaXQgY2FuIHRvIHRoZSBsZWZ0IGVkZ2Ugb2YgdGhlIGVkaXRvclwiLCAtPlxuICAgICAgICBwb3MxMCA9IHpzUG9zKDEwKVxuICAgICAgICBleHBlY3QocG9zMTApLnRvQmVHcmVhdGVyVGhhbihzdGFydFBvc2l0aW9uKVxuXG4gICAgICAgIHBvczExID0genNQb3MoMTEpXG4gICAgICAgIGV4cGVjdChwb3MxMSAtIHBvczEwKS50b0VxdWFsKDEwKVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBlbmQgb2YgdGhlIGxpbmVcIiwgLT5cbiAgICAgICAgcG9zRW5kID0genNQb3MoMzk5KVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5OV1cblxuICAgICAgICBwb3MzOTAgPSB6c1BvcygzOTApXG4gICAgICAgIGV4cGVjdChwb3MzOTApLnRvRXF1YWwocG9zRW5kKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwgWzAsIDM5MF1cblxuICAgICAgICBwb3MzNDAgPSB6c1BvcygzNDApXG4gICAgICAgIGV4cGVjdChwb3MzNDApLnRvRXF1YWwocG9zRW5kKVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBpZiBhbGwgbGluZXMgYXJlIHNob3J0XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRUZXh0KCdzaG9ydCcpXG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgICAgICBwb3MxID0genNQb3MoMSlcbiAgICAgICAgZXhwZWN0KHBvczEpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCAxXVxuICAgICAgICBwb3MxMCA9IHpzUG9zKDEwKVxuICAgICAgICBleHBlY3QocG9zMTApLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsIFswLCA0XVxuXG4gICAgZGVzY3JpYmUgXCJ0aGUgemUga2V5YmluZGluZ1wiLCAtPlxuICAgICAgemVQb3MgPSAocG9zKSAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIHBvc10pXG4gICAgICAgIGVuc3VyZSAneiBlJ1xuICAgICAgICBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICBzdGFydFBvc2l0aW9uID0gbnVsbFxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHN0YXJ0UG9zaXRpb24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBuZWFyIHRoZSBzdGFydCBvZiB0aGUgbGluZVwiLCAtPlxuICAgICAgICBleHBlY3QoemVQb3MoMSkpLnRvRXF1YWwoc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KHplUG9zKDQwKSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuXG4gICAgICBpdCBcIm1vdmVzIHRoZSBjdXJzb3IgdGhlIG5lYXJlc3QgaXQgY2FuIHRvIHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0b3JcIiwgLT5cbiAgICAgICAgcG9zMTEwID0gemVQb3MoMTEwKVxuICAgICAgICBleHBlY3QocG9zMTEwKS50b0JlR3JlYXRlclRoYW4oc3RhcnRQb3NpdGlvbilcbiAgICAgICAgZXhwZWN0KHBvczExMCAtIHplUG9zKDEwOSkpLnRvRXF1YWwoMTApXG5cbiAgICAgICMgRklYTUUgZGVzY3JpcHRpb24gaXMgbm8gbG9uZ2VyIGFwcHJvcHJpYXRlXG4gICAgICBpdCBcImRvZXMgbm90aGluZyB3aGVuIHZlcnkgbmVhciB0aGUgZW5kIG9mIHRoZSBsaW5lXCIsIC0+XG4gICAgICAgIHBvc0VuZCA9IHplUG9zKDM5OSlcbiAgICAgICAgZXhwZWN0KHplUG9zKDM5NykpLnRvQmVMZXNzVGhhbihwb3NFbmQpXG4gICAgICAgIHBvczM4MCA9IHplUG9zKDM4MClcbiAgICAgICAgZXhwZWN0KHBvczM4MCkudG9CZUxlc3NUaGFuKHBvc0VuZClcbiAgICAgICAgZXhwZWN0KHplUG9zKDM4MikgLSBwb3MzODApLnRvRXF1YWwoMTkpXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGFsbCBsaW5lcyBhcmUgc2hvcnRcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldFRleHQoJ3Nob3J0JylcbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsTGVmdCgpXG4gICAgICAgIGV4cGVjdCh6ZVBvcygxKSkudG9FcXVhbChzdGFydFBvc2l0aW9uKVxuICAgICAgICBleHBlY3QoemVQb3MoMTApKS50b0VxdWFsKHN0YXJ0UG9zaXRpb24pXG4iXX0=
