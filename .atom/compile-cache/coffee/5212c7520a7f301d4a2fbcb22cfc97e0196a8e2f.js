(function() {
  var TextData, dispatch, getView, getVimState, ref, settings, withMockPlatform;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView, withMockPlatform = ref.withMockPlatform;

  settings = require('../lib/settings');

  describe("mini DSL used in vim-mode-plus's spec", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    describe("old exisisting spec options", function() {
      beforeEach(function() {
        return set({
          text: "abc",
          cursor: [0, 0]
        });
      });
      return it("toggle and move right", function() {
        return ensure("~", {
          text: "Abc",
          cursor: [0, 1]
        });
      });
    });
    describe("new 'textC' spec options with explanatory ensure", function() {
      describe("| represent cursor", function() {
        beforeEach(function() {
          set({
            textC: "|abc"
          });
          return ensure({
            text: "abc",
            cursor: [0, 0]
          });
        });
        return it("toggle and move right", function() {
          ensure("~", {
            textC: "A|bc"
          });
          return ensure({
            text: "Abc",
            cursor: [0, 1]
          });
        });
      });
      describe("! represent cursor", function() {
        beforeEach(function() {
          set({
            textC: "!abc"
          });
          return ensure({
            text: "abc",
            cursor: [0, 0]
          });
        });
        return it("toggle and move right", function() {
          ensure("~", {
            textC: "A!bc"
          });
          return ensure({
            text: "Abc",
            cursor: [0, 1]
          });
        });
      });
      return describe("| and ! is exchangable", function() {
        return it("both are OK", function() {
          set({
            textC: "|abc"
          });
          ensure("~", {
            textC: "A!bc"
          });
          set({
            textC: "a!bc"
          });
          return ensure("~", {
            textC: "aB!c"
          });
        });
      });
    });
    return describe("multi-low, multi-cursor case", function() {
      describe("without ! cursor", function() {
        return it("last | become last cursor", function() {
          set({
            textC: "|0: line0\n|1: line1"
          });
          ensure({
            cursor: [[0, 0], [1, 0]]
          });
          return expect(editor.getLastCursor().getBufferPosition()).toEqual([1, 0]);
        });
      });
      describe("with ! cursor", function() {
        return it("! become last cursor", function() {
          set({
            textC: "|012|345|678"
          });
          ensure({
            textC: "|012|345|678"
          });
          ensure({
            cursor: [[0, 0], [0, 3], [0, 6]]
          });
          expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 6]);
          set({
            textC: "!012|345|678"
          });
          ensure({
            textC: "!012|345|678"
          });
          ensure({
            cursor: [[0, 3], [0, 6], [0, 0]]
          });
          expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 0]);
          set({
            textC: "|012!345|678"
          });
          ensure({
            textC: "|012!345|678"
          });
          ensure({
            cursor: [[0, 0], [0, 6], [0, 3]]
          });
          expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 3]);
          set({
            textC: "|012|345!678"
          });
          ensure({
            textC: "|012|345!678"
          });
          ensure({
            cursor: [[0, 0], [0, 3], [0, 6]]
          });
          return expect(editor.getLastCursor().getBufferPosition()).toEqual([0, 6]);
        });
      });
      return describe("without ! cursor", function() {
        beforeEach(function() {
          set({
            textC: "|ab|cde|fg\nhi|jklmn\nopqrstu\n"
          });
          return ensure({
            text: "abcdefg\nhijklmn\nopqrstu\n",
            cursor: [[0, 0], [0, 2], [0, 5], [1, 2]]
          });
        });
        return it("toggle and move right", function() {
          ensure('~', {
            textC: "A|bC|deF|g\nhiJ|klmn\nopqrstu\n"
          });
          return ensure({
            text: "AbCdeFg\nhiJklmn\nopqrstu\n",
            cursor: [[0, 1], [0, 3], [0, 6], [1, 3]]
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3NwZWMtaGVscGVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUErRCxPQUFBLENBQVEsZUFBUixDQUEvRCxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDLHFCQUFsQyxFQUEyQzs7RUFDM0MsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsdUNBQVQsRUFBa0QsU0FBQTtBQUNoRCxRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMseUJBQWQsRUFBMkI7TUFIakIsQ0FBWjthQUtBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsYUFBcEI7TUFERyxDQUFMO0lBTlMsQ0FBWDtJQVNBLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBO01BQ3RDLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUFJO1VBQUEsSUFBQSxFQUFNLEtBQU47VUFBYSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFyQjtTQUFKO01BRFMsQ0FBWDthQUdBLEVBQUEsQ0FBRyx1QkFBSCxFQUE0QixTQUFBO2VBQzFCLE1BQUEsQ0FBTyxHQUFQLEVBQVk7VUFBQSxJQUFBLEVBQU0sS0FBTjtVQUFhLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXJCO1NBQVo7TUFEMEIsQ0FBNUI7SUFKc0Ms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Q0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxpQkFBdkIsQ0FBQSxDQUFQLENBQWtELENBQUMsT0FBbkQsQ0FBMkQsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEzRDtRQW5CeUIsQ0FBM0I7TUFEd0IsQ0FBMUI7YUFzQkEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7UUFDM0IsVUFBQSxDQUFXLFNBQUE7VUFDVCxHQUFBLENBQ0U7WUFBQSxLQUFBLEVBQU8saUNBQVA7V0FERjtpQkFPQSxNQUFBLENBQ0U7WUFBQSxJQUFBLEVBQU0sNkJBQU47WUFLQSxNQUFBLEVBQVEsQ0FBQyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQUQsRUFBUyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVQsRUFBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFqQixFQUF5QixDQUFDLENBQUQsRUFBSSxDQUFKLENBQXpCLENBTFI7V0FERjtRQVJTLENBQVg7ZUFnQkEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7VUFDMUIsTUFBQSxDQUFPLEdBQVAsRUFDRTtZQUFBLEtBQUEsRUFBTyxpQ0FBUDtXQURGO2lCQU9BLE1BQUEsQ0FDRTtZQUFBLElBQUEsRUFBTSw2QkFBTjtZQUtBLE1BQUEsRUFBUSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVCxFQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQWpCLEVBQXlCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBekIsQ0FMUjtXQURGO1FBUjBCLENBQTVCO01BakIyQixDQUE3QjtJQWxDdUMsQ0FBekM7RUE5Q2dELENBQWxEO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlldywgd2l0aE1vY2tQbGF0Zm9ybX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwibWluaSBEU0wgdXNlZCBpbiB2aW0tbW9kZS1wbHVzJ3Mgc3BlY1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwib2xkIGV4aXNpc3Rpbmcgc3BlYyBvcHRpb25zXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0IHRleHQ6IFwiYWJjXCIsIGN1cnNvcjogWzAsIDBdXG5cbiAgICBpdCBcInRvZ2dsZSBhbmQgbW92ZSByaWdodFwiLCAtPlxuICAgICAgZW5zdXJlIFwiflwiLCB0ZXh0OiBcIkFiY1wiLCBjdXJzb3I6IFswLCAxXVxuXG4gIGRlc2NyaWJlIFwibmV3ICd0ZXh0Qycgc3BlYyBvcHRpb25zIHdpdGggZXhwbGFuYXRvcnkgZW5zdXJlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ8IHJlcHJlc2VudCBjdXJzb3JcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIlxuICAgICAgICBlbnN1cmUgdGV4dDogXCJhYmNcIiwgY3Vyc29yOiBbMCwgMF0gIyBleHBsYW5hdG9yeSBwdXJwb3NlXG5cbiAgICAgIGl0IFwidG9nZ2xlIGFuZCBtb3ZlIHJpZ2h0XCIsIC0+XG4gICAgICAgIGVuc3VyZSBcIn5cIiwgdGV4dEM6IFwiQXxiY1wiXG4gICAgICAgIGVuc3VyZSB0ZXh0OiBcIkFiY1wiLCBjdXJzb3I6IFswLCAxXSAjIGV4cGxhbmF0b3J5IHB1cnBvc2VcblxuICAgIGRlc2NyaWJlIFwiISByZXByZXNlbnQgY3Vyc29yXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNldCB0ZXh0QzogXCIhYWJjXCJcbiAgICAgICAgZW5zdXJlIHRleHQ6IFwiYWJjXCIsIGN1cnNvcjogWzAsIDBdICMgZXhwbGFuYXRvcnkgcHVycG9zZVxuXG4gICAgICBpdCBcInRvZ2dsZSBhbmQgbW92ZSByaWdodFwiLCAtPlxuICAgICAgICBlbnN1cmUgXCJ+XCIsIHRleHRDOiBcIkEhYmNcIlxuICAgICAgICBlbnN1cmUgdGV4dDogXCJBYmNcIiwgY3Vyc29yOiBbMCwgMV0gIyBleHBsYW5hdG9yeSBwdXJwb3NlXG5cbiAgICBkZXNjcmliZSBcInwgYW5kICEgaXMgZXhjaGFuZ2FibGVcIiwgLT5cbiAgICAgIGl0IFwiYm90aCBhcmUgT0tcIiwgLT5cbiAgICAgICAgc2V0IHRleHRDOiBcInxhYmNcIlxuICAgICAgICBlbnN1cmUgXCJ+XCIsIHRleHRDOiBcIkEhYmNcIlxuXG4gICAgICAgIHNldCB0ZXh0QzogXCJhIWJjXCJcbiAgICAgICAgZW5zdXJlIFwiflwiLCB0ZXh0QzogXCJhQiFjXCJcblxuICBkZXNjcmliZSBcIm11bHRpLWxvdywgbXVsdGktY3Vyc29yIGNhc2VcIiwgLT5cbiAgICBkZXNjcmliZSBcIndpdGhvdXQgISBjdXJzb3JcIiwgLT5cbiAgICAgIGl0IFwibGFzdCB8IGJlY29tZSBsYXN0IGN1cnNvclwiLCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfDA6IGxpbmUwXG4gICAgICAgICAgfDE6IGxpbmUxXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgZW5zdXJlIGN1cnNvcjogW1swLCAwXSwgWzEsIDBdXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKFsxLCAwXSlcblxuICAgIGRlc2NyaWJlIFwid2l0aCAhIGN1cnNvclwiLCAtPlxuICAgICAgaXQgXCIhIGJlY29tZSBsYXN0IGN1cnNvclwiLCAtPlxuICAgICAgICBzZXQgdGV4dEM6IFwifDAxMnwzNDV8Njc4XCJcbiAgICAgICAgZW5zdXJlIHRleHRDOiBcInwwMTJ8MzQ1fDY3OFwiXG4gICAgICAgIGVuc3VyZSBjdXJzb3I6IFtbMCwgMF0sIFswLCAzXSwgWzAsIDZdXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKFswLCA2XSlcblxuICAgICAgICBzZXQgdGV4dEM6IFwiITAxMnwzNDV8Njc4XCJcbiAgICAgICAgZW5zdXJlIHRleHRDOiBcIiEwMTJ8MzQ1fDY3OFwiXG4gICAgICAgIGVuc3VyZSBjdXJzb3I6IFtbMCwgM10sIFswLCA2XSwgWzAsIDBdXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKFswLCAwXSlcblxuICAgICAgICBzZXQgdGV4dEM6IFwifDAxMiEzNDV8Njc4XCJcbiAgICAgICAgZW5zdXJlIHRleHRDOiBcInwwMTIhMzQ1fDY3OFwiXG4gICAgICAgIGVuc3VyZSBjdXJzb3I6IFtbMCwgMF0sIFswLCA2XSwgWzAsIDNdXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKFswLCAzXSlcblxuICAgICAgICBzZXQgdGV4dEM6IFwifDAxMnwzNDUhNjc4XCJcbiAgICAgICAgZW5zdXJlIHRleHRDOiBcInwwMTJ8MzQ1ITY3OFwiXG4gICAgICAgIGVuc3VyZSBjdXJzb3I6IFtbMCwgMF0sIFswLCAzXSwgWzAsIDZdXVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldExhc3RDdXJzb3IoKS5nZXRCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKFswLCA2XSlcblxuICAgIGRlc2NyaWJlIFwid2l0aG91dCAhIGN1cnNvclwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgfGFifGNkZXxmZ1xuICAgICAgICAgIGhpfGprbG1uXG4gICAgICAgICAgb3BxcnN0dVxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIGFiY2RlZmdcbiAgICAgICAgICBoaWprbG1uXG4gICAgICAgICAgb3BxcnN0dVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAwXSwgWzAsIDJdLCBbMCwgNV0sIFsxLCAyXV1cblxuICAgICAgaXQgXCJ0b2dnbGUgYW5kIG1vdmUgcmlnaHRcIiwgLT5cbiAgICAgICAgZW5zdXJlICd+JyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgQXxiQ3xkZUZ8Z1xuICAgICAgICAgIGhpSnxrbG1uXG4gICAgICAgICAgb3BxcnN0dVxcblxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGVuc3VyZVxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIEFiQ2RlRmdcbiAgICAgICAgICBoaUprbG1uXG4gICAgICAgICAgb3BxcnN0dVxcblxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogW1swLCAxXSwgWzAsIDNdLCBbMCwgNl0sIFsxLCAzXV1cbiJdfQ==