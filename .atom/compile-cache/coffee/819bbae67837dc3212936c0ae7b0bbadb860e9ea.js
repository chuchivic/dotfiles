(function() {
  var getVimState;

  getVimState = require('./spec-helper').getVimState;

  describe("Insert mode commands", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
    });
    return describe("Copy from line above/below", function() {
      beforeEach(function() {
        set({
          text: "12345\n\nabcd\nefghi",
          cursor: [[1, 0], [3, 0]]
        });
        return ensure('i');
      });
      describe("the ctrl-y command", function() {
        it("copies from the line above", function() {
          ensure('ctrl-y', {
            text: "12345\n1\nabcd\naefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-y', {
            text: "12345\n1 3\nabcd\na cefghi"
          });
        });
        it("does nothing if there's nothing above the cursor", function() {
          editor.insertText('fill');
          ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
          return ensure('ctrl-y', {
            text: "12345\nfill5\nabcd\nfillefghi"
          });
        });
        return it("does nothing on the first line", function() {
          set({
            textC: "12|345\n\nabcd\nef!ghi"
          });
          editor.insertText('a');
          ensure(null, {
            textC: "12a|345\n\nabcd\nefa!ghi"
          });
          return ensure('ctrl-y', {
            textC: "12a|345\n\nabcd\nefad!ghi"
          });
        });
      });
      describe("the ctrl-e command", function() {
        beforeEach(function() {
          return atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-e': 'vim-mode-plus:copy-from-line-below'
            }
          });
        });
        it("copies from the line below", function() {
          ensure('ctrl-e', {
            text: "12345\na\nabcd\nefghi"
          });
          editor.insertText(' ');
          return ensure('ctrl-e', {
            text: "12345\na c\nabcd\n efghi"
          });
        });
        return it("does nothing if there's nothing below the cursor", function() {
          editor.insertText('foo');
          ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
          return ensure('ctrl-e', {
            text: "12345\nfood\nabcd\nfooefghi"
          });
        });
      });
      return describe("InsertLastInserted", function() {
        var ensureInsertLastInserted;
        ensureInsertLastInserted = function(key, options) {
          var finalText, insert, text;
          insert = options.insert, text = options.text, finalText = options.finalText;
          ensure(key);
          editor.insertText(insert);
          ensure("escape", {
            text: text
          });
          return ensure("G I ctrl-a", {
            text: finalText
          });
        };
        beforeEach(function() {
          var initialText;
          atom.keymaps.add("test", {
            'atom-text-editor.vim-mode-plus.insert-mode': {
              'ctrl-a': 'vim-mode-plus:insert-last-inserted'
            }
          });
          initialText = "abc\ndef\n";
          set({
            text: "",
            cursor: [0, 0]
          });
          ensure('i');
          editor.insertText(initialText);
          return ensure("escape g g", {
            text: initialText,
            cursor: [0, 0]
          });
        });
        it("case-i: single-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx',
            text: "xxxabc\ndef\n",
            finalText: "xxxabc\nxxxdef\n"
          });
        });
        it("case-o: single-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx',
            text: "abc\nxxx\ndef\n",
            finalText: "abc\nxxx\nxxxdef\n"
          });
        });
        it("case-O: single-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx',
            text: "xxx\nabc\ndef\n",
            finalText: "xxx\nabc\nxxxdef\n"
          });
        });
        it("case-i: multi-line", function() {
          return ensureInsertLastInserted('i', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\nabc\ndef\n",
            finalText: "xxx\nyyy\nabc\nxxx\nyyy\ndef\n"
          });
        });
        it("case-o: multi-line", function() {
          return ensureInsertLastInserted('o', {
            insert: 'xxx\nyyy\n',
            text: "abc\nxxx\nyyy\n\ndef\n",
            finalText: "abc\nxxx\nyyy\n\nxxx\nyyy\ndef\n"
          });
        });
        return it("case-O: multi-line", function() {
          return ensureInsertLastInserted('O', {
            insert: 'xxx\nyyy\n',
            text: "xxx\nyyy\n\nabc\ndef\n",
            finalText: "xxx\nyyy\n\nabc\nxxx\nyyy\ndef\n"
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL2luc2VydC1tb2RlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxjQUFlLE9BQUEsQ0FBUSxlQUFSOztFQUVoQixRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtBQUMvQixRQUFBO0lBQUEsTUFBaUQsRUFBakQsRUFBQyxZQUFELEVBQU0sZUFBTixFQUFjLGVBQWQsRUFBc0Isc0JBQXRCLEVBQXFDO0lBRXJDLFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsU0FBRCxFQUFZLEdBQVo7UUFDVixRQUFBLEdBQVc7UUFDVix5QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWdCO01BSE4sQ0FBWjtJQURTLENBQVg7V0FNQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQTtNQUNyQyxVQUFBLENBQVcsU0FBQTtRQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSxzQkFBTjtVQU1BLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxDQU5SO1NBREY7ZUFRQSxNQUFBLENBQU8sR0FBUDtNQVRTLENBQVg7TUFXQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtRQUM3QixFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQTtVQUMvQixNQUFBLENBQU8sUUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLHdCQUFOO1dBREY7VUFPQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjtpQkFDQSxNQUFBLENBQU8sUUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLDRCQUFOO1dBREY7UUFUK0IsQ0FBakM7UUFpQkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUE7VUFDckQsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBbEI7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLCtCQUFOO1dBREY7aUJBT0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSwrQkFBTjtXQURGO1FBVHFELENBQXZEO2VBaUJBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1VBQ25DLEdBQUEsQ0FDRTtZQUFBLEtBQUEsRUFBTyx3QkFBUDtXQURGO1VBUUEsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7VUFDQSxNQUFBLENBQU8sSUFBUCxFQUNFO1lBQUEsS0FBQSxFQUFPLDBCQUFQO1dBREY7aUJBT0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLEtBQUEsRUFBTywyQkFBUDtXQURGO1FBakJtQyxDQUFyQztNQW5DNkIsQ0FBL0I7TUE0REEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7UUFDN0IsVUFBQSxDQUFXLFNBQUE7aUJBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFiLENBQWlCLE1BQWpCLEVBQ0U7WUFBQSw0Q0FBQSxFQUNFO2NBQUEsUUFBQSxFQUFVLG9DQUFWO2FBREY7V0FERjtRQURTLENBQVg7UUFLQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQTtVQUMvQixNQUFBLENBQU8sUUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLHVCQUFOO1dBREY7VUFPQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjtpQkFDQSxNQUFBLENBQU8sUUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLDBCQUFOO1dBREY7UUFUK0IsQ0FBakM7ZUFpQkEsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUE7VUFDckQsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsS0FBbEI7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLDZCQUFOO1dBREY7aUJBT0EsTUFBQSxDQUFPLFFBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSw2QkFBTjtXQURGO1FBVHFELENBQXZEO01BdkI2QixDQUEvQjthQXdDQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtBQUM3QixZQUFBO1FBQUEsd0JBQUEsR0FBMkIsU0FBQyxHQUFELEVBQU0sT0FBTjtBQUN6QixjQUFBO1VBQUMsdUJBQUQsRUFBUyxtQkFBVCxFQUFlO1VBQ2YsTUFBQSxDQUFPLEdBQVA7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQjtVQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLElBQU47V0FBakI7aUJBQ0EsTUFBQSxDQUFPLFlBQVAsRUFBcUI7WUFBQSxJQUFBLEVBQU0sU0FBTjtXQUFyQjtRQUx5QjtRQU8zQixVQUFBLENBQVcsU0FBQTtBQUNULGNBQUE7VUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsTUFBakIsRUFDRTtZQUFBLDRDQUFBLEVBQ0U7Y0FBQSxRQUFBLEVBQVUsb0NBQVY7YUFERjtXQURGO1VBSUEsV0FBQSxHQUFjO1VBSWQsR0FBQSxDQUFJO1lBQUEsSUFBQSxFQUFNLEVBQU47WUFBVSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFsQjtXQUFKO1VBQ0EsTUFBQSxDQUFPLEdBQVA7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixXQUFsQjtpQkFDQSxNQUFBLENBQU8sWUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLFdBQU47WUFDQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQURSO1dBREY7UUFaUyxDQUFYO1FBZ0JBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBO2lCQUN4Qix3QkFBQSxDQUF5QixHQUF6QixFQUNFO1lBQUEsTUFBQSxFQUFRLEtBQVI7WUFDQSxJQUFBLEVBQU0sZUFETjtZQUVBLFNBQUEsRUFBVyxrQkFGWDtXQURGO1FBRHdCLENBQTFCO1FBS0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUE7aUJBQ3hCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsS0FBUjtZQUNBLElBQUEsRUFBTSxpQkFETjtZQUVBLFNBQUEsRUFBVyxvQkFGWDtXQURGO1FBRHdCLENBQTFCO1FBS0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUE7aUJBQ3hCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsS0FBUjtZQUNBLElBQUEsRUFBTSxpQkFETjtZQUVBLFNBQUEsRUFBVyxvQkFGWDtXQURGO1FBRHdCLENBQTFCO1FBTUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7aUJBQ3ZCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsWUFBUjtZQUNBLElBQUEsRUFBTSxzQkFETjtZQUVBLFNBQUEsRUFBVyxnQ0FGWDtXQURGO1FBRHVCLENBQXpCO1FBS0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7aUJBQ3ZCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsWUFBUjtZQUNBLElBQUEsRUFBTSx3QkFETjtZQUVBLFNBQUEsRUFBVyxrQ0FGWDtXQURGO1FBRHVCLENBQXpCO2VBS0EsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7aUJBQ3ZCLHdCQUFBLENBQXlCLEdBQXpCLEVBQ0U7WUFBQSxNQUFBLEVBQVEsWUFBUjtZQUNBLElBQUEsRUFBTSx3QkFETjtZQUVBLFNBQUEsRUFBVyxrQ0FGWDtXQURGO1FBRHVCLENBQXpCO01BbEQ2QixDQUEvQjtJQWhIcUMsQ0FBdkM7RUFUK0IsQ0FBakM7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIkluc2VydCBtb2RlIGNvbW1hbmRzXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoX3ZpbVN0YXRlLCB2aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IF92aW1TdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSBfdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZX0gPSB2aW1cblxuICBkZXNjcmliZSBcIkNvcHkgZnJvbSBsaW5lIGFib3ZlL2JlbG93XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDEyMzQ1XG5cbiAgICAgICAgICBhYmNkXG4gICAgICAgICAgZWZnaGlcbiAgICAgICAgICBcIlwiXCJcbiAgICAgICAgY3Vyc29yOiBbWzEsIDBdLCBbMywgMF1dXG4gICAgICBlbnN1cmUgJ2knXG5cbiAgICBkZXNjcmliZSBcInRoZSBjdHJsLXkgY29tbWFuZFwiLCAtPlxuICAgICAgaXQgXCJjb3BpZXMgZnJvbSB0aGUgbGluZSBhYm92ZVwiLCAtPlxuICAgICAgICBlbnN1cmUgJ2N0cmwteScsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxMjM0NVxuICAgICAgICAgICAgMVxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgYWVmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJyAnXG4gICAgICAgIGVuc3VyZSAnY3RybC15JyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICAxIDNcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGEgY2VmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgdGhlcmUncyBub3RoaW5nIGFib3ZlIHRoZSBjdXJzb3JcIiwgLT5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2ZpbGwnXG4gICAgICAgIGVuc3VyZSAnY3RybC15JyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBmaWxsNVxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZmlsbGVmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZW5zdXJlICdjdHJsLXknLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGZpbGw1XG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBmaWxsZWZnaGlcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICBpdCBcImRvZXMgbm90aGluZyBvbiB0aGUgZmlyc3QgbGluZVwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgMTJ8MzQ1XG5cbiAgICAgICAgICBhYmNkXG4gICAgICAgICAgZWYhZ2hpXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJ2EnXG4gICAgICAgIGVuc3VyZSBudWxsLFxuICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyYXwzNDVcblxuICAgICAgICAgICAgYWJjZFxuICAgICAgICAgICAgZWZhIWdoaVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnY3RybC15JyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMmF8MzQ1XG5cbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGVmYWQhZ2hpXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwidGhlIGN0cmwtZSBjb21tYW5kXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20ua2V5bWFwcy5hZGQgXCJ0ZXN0XCIsXG4gICAgICAgICAgJ2F0b20tdGV4dC1lZGl0b3IudmltLW1vZGUtcGx1cy5pbnNlcnQtbW9kZSc6XG4gICAgICAgICAgICAnY3RybC1lJzogJ3ZpbS1tb2RlLXBsdXM6Y29weS1mcm9tLWxpbmUtYmVsb3cnXG5cbiAgICAgIGl0IFwiY29waWVzIGZyb20gdGhlIGxpbmUgYmVsb3dcIiwgLT5cbiAgICAgICAgZW5zdXJlICdjdHJsLWUnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTIzNDVcbiAgICAgICAgICAgIGFcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgIGVmZ2hpXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQgJyAnXG4gICAgICAgIGVuc3VyZSAnY3RybC1lJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBhIGNcbiAgICAgICAgICAgIGFiY2RcbiAgICAgICAgICAgICBlZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIHRoZXJlJ3Mgbm90aGluZyBiZWxvdyB0aGUgY3Vyc29yXCIsIC0+XG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0ICdmb28nXG4gICAgICAgIGVuc3VyZSAnY3RybC1lJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBmb29kXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBmb29lZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGVuc3VyZSAnY3RybC1lJyxcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDEyMzQ1XG4gICAgICAgICAgICBmb29kXG4gICAgICAgICAgICBhYmNkXG4gICAgICAgICAgICBmb29lZmdoaVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIkluc2VydExhc3RJbnNlcnRlZFwiLCAtPlxuICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkID0gKGtleSwgb3B0aW9ucykgLT5cbiAgICAgICAge2luc2VydCwgdGV4dCwgZmluYWxUZXh0fSA9IG9wdGlvbnNcbiAgICAgICAgZW5zdXJlIGtleVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChpbnNlcnQpXG4gICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCB0ZXh0OiB0ZXh0XG4gICAgICAgIGVuc3VyZSBcIkcgSSBjdHJsLWFcIiwgdGV4dDogZmluYWxUZXh0XG5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5rZXltYXBzLmFkZCBcInRlc3RcIixcbiAgICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzLmluc2VydC1tb2RlJzpcbiAgICAgICAgICAgICdjdHJsLWEnOiAndmltLW1vZGUtcGx1czppbnNlcnQtbGFzdC1pbnNlcnRlZCdcblxuICAgICAgICBpbml0aWFsVGV4dCA9IFwiXCJcIlxuICAgICAgICAgIGFiY1xuICAgICAgICAgIGRlZlxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICBzZXQgdGV4dDogXCJcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdpJ1xuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dChpbml0aWFsVGV4dClcbiAgICAgICAgZW5zdXJlIFwiZXNjYXBlIGcgZ1wiLFxuICAgICAgICAgIHRleHQ6IGluaXRpYWxUZXh0XG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cblxuICAgICAgaXQgXCJjYXNlLWk6IHNpbmdsZS1saW5lXCIsIC0+XG4gICAgICAgIGVuc3VyZUluc2VydExhc3RJbnNlcnRlZCAnaScsXG4gICAgICAgICAgaW5zZXJ0OiAneHh4J1xuICAgICAgICAgIHRleHQ6IFwieHh4YWJjXFxuZGVmXFxuXCJcbiAgICAgICAgICBmaW5hbFRleHQ6IFwieHh4YWJjXFxueHh4ZGVmXFxuXCJcbiAgICAgIGl0IFwiY2FzZS1vOiBzaW5nbGUtbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ28nLFxuICAgICAgICAgIGluc2VydDogJ3h4eCdcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbnh4eFxcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcImFiY1xcbnh4eFxcbnh4eGRlZlxcblwiXG4gICAgICBpdCBcImNhc2UtTzogc2luZ2xlLWxpbmVcIiwgLT5cbiAgICAgICAgZW5zdXJlSW5zZXJ0TGFzdEluc2VydGVkICdPJyxcbiAgICAgICAgICBpbnNlcnQ6ICd4eHgnXG4gICAgICAgICAgdGV4dDogXCJ4eHhcXG5hYmNcXG5kZWZcXG5cIlxuICAgICAgICAgIGZpbmFsVGV4dDogXCJ4eHhcXG5hYmNcXG54eHhkZWZcXG5cIlxuXG4gICAgICBpdCBcImNhc2UtaTogbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ2knLFxuICAgICAgICAgIGluc2VydDogJ3h4eFxcbnl5eVxcbidcbiAgICAgICAgICB0ZXh0OiBcInh4eFxcbnl5eVxcbmFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcInh4eFxcbnl5eVxcbmFiY1xcbnh4eFxcbnl5eVxcbmRlZlxcblwiXG4gICAgICBpdCBcImNhc2UtbzogbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ28nLFxuICAgICAgICAgIGluc2VydDogJ3h4eFxcbnl5eVxcbidcbiAgICAgICAgICB0ZXh0OiBcImFiY1xcbnh4eFxcbnl5eVxcblxcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcImFiY1xcbnh4eFxcbnl5eVxcblxcbnh4eFxcbnl5eVxcbmRlZlxcblwiXG4gICAgICBpdCBcImNhc2UtTzogbXVsdGktbGluZVwiLCAtPlxuICAgICAgICBlbnN1cmVJbnNlcnRMYXN0SW5zZXJ0ZWQgJ08nLFxuICAgICAgICAgIGluc2VydDogJ3h4eFxcbnl5eVxcbidcbiAgICAgICAgICB0ZXh0OiBcInh4eFxcbnl5eVxcblxcbmFiY1xcbmRlZlxcblwiXG4gICAgICAgICAgZmluYWxUZXh0OiBcInh4eFxcbnl5eVxcblxcbmFiY1xcbnh4eFxcbnl5eVxcbmRlZlxcblwiXG4iXX0=
