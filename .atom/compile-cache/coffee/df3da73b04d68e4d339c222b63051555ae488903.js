(function() {
  var FormatText;

  FormatText = require("../../lib/commands/format-text");

  describe("FormatText", function() {
    var editor, formatText, ref;
    ref = [], editor = ref[0], formatText = ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage("language-gfm");
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    describe("correctOrderListNumbers", function() {
      beforeEach(function() {
        return formatText = new FormatText("correct-order-list-numbers");
      });
      it("does nothing if it is not an order list", function() {
        editor.setText("text is a long paragraph\ntext is a long paragraph");
        editor.setCursorBufferPosition([0, 3]);
        formatText.trigger();
        return expect(editor.getText()).toBe("text is a long paragraph\ntext is a long paragraph");
      });
      it("correct order list numbers", function() {
        editor.setText("text before\n\n3. aaa\n9. bbb\n  a. 11aa\n  e. 22bb\n    DD. a1\n0. ccc\n  9. aaa\n    - aaa\n  1. bbb\n  1. ccc\n    0. aaa\n      7. aaa\n        - aaa\n        - bbb\n    9. bbb\n  4. ddd\n7. ddd\n7. eee\n\ntext after");
        editor.setCursorBufferPosition([5, 3]);
        formatText.trigger();
        return expect(editor.getText()).toBe("text before\n\n1. aaa\n2. bbb\n  a. 11aa\n  b. 22bb\n    AA. a1\n3. ccc\n  1. aaa\n    - aaa\n  2. bbb\n  3. ccc\n    1. aaa\n      1. aaa\n        - aaa\n        - bbb\n    2. bbb\n  4. ddd\n4. ddd\n5. eee\n\ntext after");
      });
      return it("correct invalid order list numbers", function() {
        editor.setText("text before\n\n  3. aaa\n9. bbb\n  a. 11aa\n\ntext after");
        editor.setCursorBufferPosition([3, 1]);
        formatText.trigger();
        return expect(editor.getText()).toBe("text before\n\n  1. aaa\n1. bbb\n  a. 11aa\n\ntext after");
      });
    });
    return describe("formatTable", function() {
      beforeEach(function() {
        return formatText = new FormatText("format-table");
      });
      it("does nothing if it is not a table", function() {
        editor.setText("text is a long paragraph\ntext is a long paragraph");
        editor.setCursorBufferPosition([0, 3]);
        formatText.trigger();
        return expect(editor.getText()).toBe("text is a long paragraph\ntext is a long paragraph");
      });
      it("format table without alignment", function() {
        var expected;
        editor.setText("text before\n\nh1| h21|h1233|h343\n-|-\n|||\nt123           | t2\n |t12|\n\ntext after");
        expected = "text before\n\nh1   | h21 | h1233 | h343\n-----|-----|-------|-----\n     |     |       |\nt123 | t2  |       |\n     | t12 |       |\n\ntext after";
        editor.setCursorBufferPosition([4, 3]);
        formatText.trigger();
        expect(editor.getText()).toBe(expected);
        editor.setCursorBufferPosition([4, 3]);
        formatText.trigger();
        return expect(editor.getText()).toBe(expected);
      });
      it("format table with alignment", function() {
        var expected;
        editor.setText("text before\n\n|h1-3   | h2-1|h3-2|\n|:-|:-:|--:|:-:|\n| | t2\n|t1| |t3\n|t     |t|    t\n\ntext after");
        expected = "text before\n\n| h1-3 | h2-1 | h3-2 |   |\n|:-----|:----:|-----:|:-:|\n|      |  t2  |      |   |\n| t1   |      |   t3 |   |\n| t    |  t   |    t |   |\n\ntext after";
        editor.setCursorBufferPosition([4, 3]);
        formatText.trigger();
        expect(editor.getText()).toBe(expected);
        editor.setCursorBufferPosition([4, 3]);
        formatText.trigger();
        return expect(editor.getText()).toBe(expected);
      });
      return it("format table with alignment (trailing spaces)", function() {
        var expected;
        editor.setText(["| col 1 | col 2 | ", "| :------ | :----- | ", "| Item One    | Item Two  | "].join("\n"));
        expected = ["| col 1    | col 2    |   |", "|:---------|:---------|---|", "| Item One | Item Two |   |"].join("\n");
        editor.setCursorBufferPosition([2, 3]);
        formatText.trigger();
        expect(editor.getText()).toBe(expected);
        editor.setCursorBufferPosition([1, 5]);
        formatText.trigger();
        return expect(editor.getText()).toBe(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvY29tbWFuZHMvZm9ybWF0LXRleHQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFVBQUEsR0FBYSxPQUFBLENBQVEsZ0NBQVI7O0VBRWIsUUFBQSxDQUFTLFlBQVQsRUFBdUIsU0FBQTtBQUNyQixRQUFBO0lBQUEsTUFBdUIsRUFBdkIsRUFBQyxlQUFELEVBQVM7SUFFVCxVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixnQkFBcEI7TUFBSCxDQUFoQjtNQUNBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixjQUE5QjtNQUFILENBQWhCO2FBQ0EsSUFBQSxDQUFLLFNBQUE7ZUFBRyxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQVosQ0FBTDtJQUhTLENBQVg7SUFLQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQTtNQUNsQyxVQUFBLENBQVcsU0FBQTtlQUFHLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQVcsNEJBQVg7TUFBcEIsQ0FBWDtNQUVBLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBO1FBQzVDLE1BQU0sQ0FBQyxPQUFQLENBQWUsb0RBQWY7UUFJQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEvQjtRQUVBLFVBQVUsQ0FBQyxPQUFYLENBQUE7ZUFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsb0RBQTlCO01BUjRDLENBQTlDO01BYUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUE7UUFDL0IsTUFB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Q0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixRQUE5QjtRQUdBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO1FBQ0EsVUFBVSxDQUFDLE9BQVgsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixRQUE5QjtNQXBCa0QsQ0FBcEQ7SUFwRnNCLENBQXhCO0VBcEdxQixDQUF2QjtBQUZBIiwic291cmNlc0NvbnRlbnQiOlsiRm9ybWF0VGV4dCA9IHJlcXVpcmUgXCIuLi8uLi9saWIvY29tbWFuZHMvZm9ybWF0LXRleHRcIlxuXG5kZXNjcmliZSBcIkZvcm1hdFRleHRcIiwgLT5cbiAgW2VkaXRvciwgZm9ybWF0VGV4dF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcImVtcHR5Lm1hcmtkb3duXCIpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwibGFuZ3VhZ2UtZ2ZtXCIpXG4gICAgcnVucyAtPiBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBkZXNjcmliZSBcImNvcnJlY3RPcmRlckxpc3ROdW1iZXJzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBmb3JtYXRUZXh0ID0gbmV3IEZvcm1hdFRleHQoXCJjb3JyZWN0LW9yZGVyLWxpc3QtbnVtYmVyc1wiKVxuXG4gICAgaXQgXCJkb2VzIG5vdGhpbmcgaWYgaXQgaXMgbm90IGFuIG9yZGVyIGxpc3RcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwiXCJcIlxuICAgICAgdGV4dCBpcyBhIGxvbmcgcGFyYWdyYXBoXG4gICAgICB0ZXh0IGlzIGEgbG9uZyBwYXJhZ3JhcGhcbiAgICAgIFwiXCJcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAzXSlcblxuICAgICAgZm9ybWF0VGV4dC50cmlnZ2VyKClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFwiXCJcIlxuICAgICAgdGV4dCBpcyBhIGxvbmcgcGFyYWdyYXBoXG4gICAgICB0ZXh0IGlzIGEgbG9uZyBwYXJhZ3JhcGhcbiAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJjb3JyZWN0IG9yZGVyIGxpc3QgbnVtYmVyc1wiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICB0ZXh0IGJlZm9yZVxuXG4gICAgICAzLiBhYWFcbiAgICAgIDkuIGJiYlxuICAgICAgICBhLiAxMWFhXG4gICAgICAgIGUuIDIyYmJcbiAgICAgICAgICBERC4gYTFcbiAgICAgIDAuIGNjY1xuICAgICAgICA5LiBhYWFcbiAgICAgICAgICAtIGFhYVxuICAgICAgICAxLiBiYmJcbiAgICAgICAgMS4gY2NjXG4gICAgICAgICAgMC4gYWFhXG4gICAgICAgICAgICA3LiBhYWFcbiAgICAgICAgICAgICAgLSBhYWFcbiAgICAgICAgICAgICAgLSBiYmJcbiAgICAgICAgICA5LiBiYmJcbiAgICAgICAgNC4gZGRkXG4gICAgICA3LiBkZGRcbiAgICAgIDcuIGVlZVxuXG4gICAgICB0ZXh0IGFmdGVyXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNSwgM10pXG5cbiAgICAgIGZvcm1hdFRleHQudHJpZ2dlcigpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgIHRleHQgYmVmb3JlXG5cbiAgICAgIDEuIGFhYVxuICAgICAgMi4gYmJiXG4gICAgICAgIGEuIDExYWFcbiAgICAgICAgYi4gMjJiYlxuICAgICAgICAgIEFBLiBhMVxuICAgICAgMy4gY2NjXG4gICAgICAgIDEuIGFhYVxuICAgICAgICAgIC0gYWFhXG4gICAgICAgIDIuIGJiYlxuICAgICAgICAzLiBjY2NcbiAgICAgICAgICAxLiBhYWFcbiAgICAgICAgICAgIDEuIGFhYVxuICAgICAgICAgICAgICAtIGFhYVxuICAgICAgICAgICAgICAtIGJiYlxuICAgICAgICAgIDIuIGJiYlxuICAgICAgICA0LiBkZGRcbiAgICAgIDQuIGRkZFxuICAgICAgNS4gZWVlXG5cbiAgICAgIHRleHQgYWZ0ZXJcbiAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJjb3JyZWN0IGludmFsaWQgb3JkZXIgbGlzdCBudW1iZXJzXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIHRleHQgYmVmb3JlXG5cbiAgICAgICAgMy4gYWFhXG4gICAgICA5LiBiYmJcbiAgICAgICAgYS4gMTFhYVxuXG4gICAgICB0ZXh0IGFmdGVyXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMywgMV0pXG5cbiAgICAgIGZvcm1hdFRleHQudHJpZ2dlcigpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgIHRleHQgYmVmb3JlXG5cbiAgICAgICAgMS4gYWFhXG4gICAgICAxLiBiYmJcbiAgICAgICAgYS4gMTFhYVxuXG4gICAgICB0ZXh0IGFmdGVyXG4gICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcImZvcm1hdFRhYmxlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBmb3JtYXRUZXh0ID0gbmV3IEZvcm1hdFRleHQoXCJmb3JtYXQtdGFibGVcIilcblxuICAgIGl0IFwiZG9lcyBub3RoaW5nIGlmIGl0IGlzIG5vdCBhIHRhYmxlXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIHRleHQgaXMgYSBsb25nIHBhcmFncmFwaFxuICAgICAgdGV4dCBpcyBhIGxvbmcgcGFyYWdyYXBoXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgM10pXG5cbiAgICAgIGZvcm1hdFRleHQudHJpZ2dlcigpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgIHRleHQgaXMgYSBsb25nIHBhcmFncmFwaFxuICAgICAgdGV4dCBpcyBhIGxvbmcgcGFyYWdyYXBoXG4gICAgICBcIlwiXCJcblxuICAgIGl0IFwiZm9ybWF0IHRhYmxlIHdpdGhvdXQgYWxpZ25tZW50XCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIHRleHQgYmVmb3JlXG5cbiAgICAgIGgxfCBoMjF8aDEyMzN8aDM0M1xuICAgICAgLXwtXG4gICAgICB8fHxcbiAgICAgIHQxMjMgICAgICAgICAgIHwgdDJcbiAgICAgICB8dDEyfFxuXG4gICAgICB0ZXh0IGFmdGVyXG4gICAgICBcIlwiXCJcblxuICAgICAgZXhwZWN0ZWQgPSBcIlwiXCJcbiAgICAgIHRleHQgYmVmb3JlXG5cbiAgICAgIGgxICAgfCBoMjEgfCBoMTIzMyB8IGgzNDNcbiAgICAgIC0tLS0tfC0tLS0tfC0tLS0tLS18LS0tLS1cbiAgICAgICAgICAgfCAgICAgfCAgICAgICB8XG4gICAgICB0MTIzIHwgdDIgIHwgICAgICAgfFxuICAgICAgICAgICB8IHQxMiB8ICAgICAgIHxcblxuICAgICAgdGV4dCBhZnRlclxuICAgICAgXCJcIlwiXG5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNCwgM10pXG4gICAgICBmb3JtYXRUZXh0LnRyaWdnZXIoKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoZXhwZWN0ZWQpXG5cbiAgICAgICMgdHJpZ2dlciB0d2ljZSBzaG91bGRuJ3QgY2hhbmdlIGFueXRoaW5nXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzQsIDNdKVxuICAgICAgZm9ybWF0VGV4dC50cmlnZ2VyKClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKGV4cGVjdGVkKVxuXG4gICAgaXQgXCJmb3JtYXQgdGFibGUgd2l0aCBhbGlnbm1lbnRcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwiXCJcIlxuICAgICAgdGV4dCBiZWZvcmVcblxuICAgICAgfGgxLTMgICB8IGgyLTF8aDMtMnxcbiAgICAgIHw6LXw6LTp8LS06fDotOnxcbiAgICAgIHwgfCB0MlxuICAgICAgfHQxfCB8dDNcbiAgICAgIHx0ICAgICB8dHwgICAgdFxuXG4gICAgICB0ZXh0IGFmdGVyXG4gICAgICBcIlwiXCJcblxuICAgICAgZXhwZWN0ZWQgPSBcIlwiXCJcbiAgICAgIHRleHQgYmVmb3JlXG5cbiAgICAgIHwgaDEtMyB8IGgyLTEgfCBoMy0yIHwgICB8XG4gICAgICB8Oi0tLS0tfDotLS0tOnwtLS0tLTp8Oi06fFxuICAgICAgfCAgICAgIHwgIHQyICB8ICAgICAgfCAgIHxcbiAgICAgIHwgdDEgICB8ICAgICAgfCAgIHQzIHwgICB8XG4gICAgICB8IHQgICAgfCAgdCAgIHwgICAgdCB8ICAgfFxuXG4gICAgICB0ZXh0IGFmdGVyXG4gICAgICBcIlwiXCJcblxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs0LCAzXSlcbiAgICAgIGZvcm1hdFRleHQudHJpZ2dlcigpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZShleHBlY3RlZClcblxuICAgICAgIyB0cmlnZ2VyIHR3aWNlIHNob3VsZG4ndCBjaGFuZ2UgYW55dGhpbmdcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNCwgM10pXG4gICAgICBmb3JtYXRUZXh0LnRyaWdnZXIoKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoZXhwZWN0ZWQpXG5cbiAgICBpdCBcImZvcm1hdCB0YWJsZSB3aXRoIGFsaWdubWVudCAodHJhaWxpbmcgc3BhY2VzKVwiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgW1xuICAgICAgICBcInwgY29sIDEgfCBjb2wgMiB8IFwiXG4gICAgICAgIFwifCA6LS0tLS0tIHwgOi0tLS0tIHwgXCJcbiAgICAgICAgXCJ8IEl0ZW0gT25lICAgIHwgSXRlbSBUd28gIHwgXCJcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgICBleHBlY3RlZCA9IFtcbiAgICAgICAgXCJ8IGNvbCAxICAgIHwgY29sIDIgICAgfCAgIHxcIlxuICAgICAgICBcInw6LS0tLS0tLS0tfDotLS0tLS0tLS18LS0tfFwiXG4gICAgICAgIFwifCBJdGVtIE9uZSB8IEl0ZW0gVHdvIHwgICB8XCJcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDNdKVxuICAgICAgZm9ybWF0VGV4dC50cmlnZ2VyKClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKGV4cGVjdGVkKVxuXG4gICAgICAjIHRyaWdnZXIgdHdpY2Ugc2hvdWxkbid0IGNoYW5nZSBhbnl0aGluZ1xuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCA1XSlcbiAgICAgIGZvcm1hdFRleHQudHJpZ2dlcigpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZShleHBlY3RlZClcbiJdfQ==
