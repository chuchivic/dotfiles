(function() {
  var JumpTo;

  JumpTo = require("../../lib/commands/jump-to");

  describe("JumpTo", function() {
    var editor;
    editor = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    describe(".trigger", function() {
      it("triggers correct command", function() {
        var jumpTo;
        jumpTo = new JumpTo("next-heading");
        spyOn(jumpTo, "nextHeading");
        jumpTo.trigger({
          abortKeyBinding: function() {
            return {};
          }
        });
        return expect(jumpTo.nextHeading).toHaveBeenCalled();
      });
      return it("jumps to correct position", function() {
        var jumpTo;
        jumpTo = new JumpTo("previous-heading");
        jumpTo.previousHeading = function() {
          return [5, 5];
        };
        spyOn(jumpTo.editor, "setCursorBufferPosition");
        jumpTo.trigger();
        return expect(jumpTo.editor.setCursorBufferPosition).toHaveBeenCalledWith([5, 5]);
      });
    });
    describe(".previousHeading", function() {
      var text;
      text = "# Title\n\ncontent content\n\n## Subtitle\n\ncontent content";
      it("finds nothing if no headings", function() {
        var jumpTo;
        jumpTo = new JumpTo();
        return expect(jumpTo.previousHeading()).toBe(false);
      });
      it("finds nothing if no previous heading", function() {
        var jumpTo;
        editor.setText(text);
        editor.setCursorBufferPosition([0, 1]);
        jumpTo = new JumpTo();
        return expect(jumpTo.previousHeading()).toEqual(false);
      });
      it("finds previous subtitle", function() {
        var jumpTo;
        editor.setText(text);
        editor.setCursorBufferPosition([6, 6]);
        jumpTo = new JumpTo();
        return expect(jumpTo.previousHeading()).toEqual({
          row: 4,
          column: 0
        });
      });
      return it("finds previous title", function() {
        var jumpTo;
        editor.setText(text);
        editor.setCursorBufferPosition([4, 1]);
        jumpTo = new JumpTo();
        return expect(jumpTo.previousHeading()).toEqual({
          row: 0,
          column: 0
        });
      });
    });
    describe(".nextHeading", function() {
      var text;
      text = "# Title\n\ncontent content\n\n## Subtitle\n\ncontent content";
      it("finds nothing if no headings", function() {
        var jumpTo;
        jumpTo = new JumpTo();
        return expect(jumpTo.nextHeading()).toBe(false);
      });
      it("finds next subtitle", function() {
        var jumpTo;
        editor.setText(text);
        editor.setCursorBufferPosition([3, 6]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextHeading()).toEqual({
          row: 4,
          column: 0
        });
      });
      return it("finds top title", function() {
        var jumpTo;
        editor.setText(text);
        editor.setCursorBufferPosition([6, 5]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextHeading()).toEqual({
          row: 0,
          column: 0
        });
      });
    });
    describe(".referenceDefinition", function() {
      var text;
      text = "empty line with no link\nempty line with orphan [link][link]\n\nlink to [zhuochun/md-writer][cfc27b01] should work\nlink to [Markdown-Writer for Atom][] should work as well\n\n  [cfc27b01]: https://github.com/zhuochun/md-writer \"Markdown-Writer for Atom\"\n  [Markdown-Writer for Atom]: https://github.com/zhuochun/md-writer \"Markdown-Writer for Atom\"\n  [nofound]: https://example.com\n\nfootnotes[^fn] is a kind of special link\n\n  [^fn]: footnote definition";
      it("finds nothing if no word under cursor", function() {
        var jumpTo;
        jumpTo = new JumpTo();
        return expect(jumpTo.referenceDefinition()).toBe(false);
      });
      it("finds nothing if no link found", function() {
        var jumpTo;
        editor.setText(text);
        editor.setCursorBufferPosition([0, 2]);
        jumpTo = new JumpTo();
        return expect(jumpTo.referenceDefinition()).toBe(false);
      });
      describe("links", function() {
        beforeEach(function() {
          return editor.setText(text);
        });
        it("finds nothing if no link definition", function() {
          var jumpTo;
          editor.setCursorBufferPosition([1, 2]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toBe(false);
        });
        it("finds nothing if no link reference", function() {
          var jumpTo;
          editor.setCursorBufferPosition([8, 2]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toBe(false);
        });
        it("finds definition (on the line)", function() {
          var jumpTo;
          editor.setCursorBufferPosition([3, 0]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toEqual([6, 0]);
        });
        it("finds definition (empty id label)", function() {
          var jumpTo;
          editor.setCursorBufferPosition([4, 8]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toEqual([7, 0]);
        });
        it("finds reference (on the line)", function() {
          var jumpTo;
          editor.setCursorBufferPosition([6, 0]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toEqual([3, 8]);
        });
        return it("finds reference (empty id label)", function() {
          var jumpTo;
          editor.setCursorBufferPosition([7, 4]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toEqual([4, 8]);
        });
      });
      return describe("foonotes", function() {
        beforeEach(function() {
          return editor.setText(text);
        });
        it("finds definition", function() {
          var jumpTo;
          editor.setCursorBufferPosition([10, 12]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toEqual([12, 2]);
        });
        return it("finds reference", function() {
          var jumpTo;
          editor.setCursorBufferPosition([12, 6]);
          jumpTo = new JumpTo();
          return expect(jumpTo.referenceDefinition()).toEqual([10, 9]);
        });
      });
    });
    return describe(".nextTableCell", function() {
      beforeEach(function() {
        return editor.setText("this is a table:\n\n| Header One | Header Two |\n|:-----------|:-----------|\n| Item One   | Item Two   |\n\nthis is another table:\n\nHeader One    |   Header Two | Header Three\n:-------------|-------------:|:-----------:\nItem One      |     Item Two |  Item Three");
      });
      it("finds nothing if it is not a table row", function() {
        var jumpTo;
        editor.setCursorBufferPosition([0, 2]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextTableCell()).toBe(false);
      });
      it("finds row 1, cell 2 in table 1", function() {
        var jumpTo;
        editor.setCursorBufferPosition([2, 2]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextTableCell()).toEqual([2, 25]);
      });
      it("finds row 2, cell 1 in table 1 from end of row 1", function() {
        var jumpTo;
        editor.setCursorBufferPosition([2, 25]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextTableCell()).toEqual([4, 10]);
      });
      it("finds row 2, cell 1 in table 1 from row separator", function() {
        var jumpTo;
        editor.setCursorBufferPosition([3, 0]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextTableCell()).toEqual([4, 10]);
      });
      it("finds row 1, cell 3 in table 2", function() {
        var jumpTo;
        editor.setCursorBufferPosition([8, 24]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextTableCell()).toEqual([8, 43]);
      });
      return it("finds row 2, cell 1 in table 2", function() {
        var jumpTo;
        editor.setCursorBufferPosition([8, 42]);
        jumpTo = new JumpTo();
        return expect(jumpTo.nextTableCell()).toEqual([10, 8]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvY29tbWFuZHMvanVtcC10by1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSw0QkFBUjs7RUFFVCxRQUFBLENBQVMsUUFBVCxFQUFtQixTQUFBO0FBQ2pCLFFBQUE7SUFBQSxNQUFBLEdBQVM7SUFFVCxVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixnQkFBcEI7TUFBSCxDQUFoQjthQUNBLElBQUEsQ0FBSyxTQUFBO2VBQUcsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUFaLENBQUw7SUFGUyxDQUFYO0lBSUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQTtNQUNuQixFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQTtBQUM3QixZQUFBO1FBQUEsTUFBQSxHQUFhLElBQUEsTUFBQSxDQUFPLGNBQVA7UUFDYixLQUFBLENBQU0sTUFBTixFQUFjLGFBQWQ7UUFFQSxNQUFNLENBQUMsT0FBUCxDQUFlO1VBQUEsZUFBQSxFQUFpQixTQUFBO21CQUFHO1VBQUgsQ0FBakI7U0FBZjtlQUVBLE1BQUEsQ0FBTyxNQUFNLENBQUMsV0FBZCxDQUEwQixDQUFDLGdCQUEzQixDQUFBO01BTjZCLENBQS9CO2FBUUEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7QUFDOUIsWUFBQTtRQUFBLE1BQUEsR0FBYSxJQUFBLE1BQUEsQ0FBTyxrQkFBUDtRQUViLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLFNBQUE7aUJBQUcsQ0FBQyxDQUFELEVBQUksQ0FBSjtRQUFIO1FBQ3pCLEtBQUEsQ0FBTSxNQUFNLENBQUMsTUFBYixFQUFxQix5QkFBckI7UUFF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LENBQUcsZ0NBQUgsRUFBcUMsU0FBQTtBQUNuQyxZQUFBO1FBQUEsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLEVBQUosQ0FBL0I7UUFDQSxNQUFBLEdBQWEsSUFBQSxNQUFBLENBQUE7ZUFDYixNQUFBLENBQU8sTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFQLENBQThCLENBQUMsT0FBL0IsQ0FBdUMsQ0FBQyxDQUFELEVBQUksRUFBSixDQUF2QztNQUhtQyxDQUFyQzthQUtBLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO0FBQ25DLFlBQUE7UUFBQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksRUFBSixDQUEvQjtRQUNBLE1BQUEsR0FBYSxJQUFBLE1BQUEsQ0FBQTtlQUNiLE1BQUEsQ0FBTyxNQUFNLENBQUMsYUFBUCxDQUFBLENBQVAsQ0FBOEIsQ0FBQyxPQUEvQixDQUF1QyxDQUFDLEVBQUQsRUFBSyxDQUFMLENBQXZDO01BSG1DLENBQXJDO0lBekN5QixDQUEzQjtFQXJLaUIsQ0FBbkI7QUFGQSIsInNvdXJjZXNDb250ZW50IjpbIkp1bXBUbyA9IHJlcXVpcmUgXCIuLi8uLi9saWIvY29tbWFuZHMvanVtcC10b1wiXG5cbmRlc2NyaWJlIFwiSnVtcFRvXCIsIC0+XG4gIGVkaXRvciA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJlbXB0eS5tYXJrZG93blwiKVxuICAgIHJ1bnMgLT4gZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgZGVzY3JpYmUgXCIudHJpZ2dlclwiLCAtPlxuICAgIGl0IFwidHJpZ2dlcnMgY29ycmVjdCBjb21tYW5kXCIsIC0+XG4gICAgICBqdW1wVG8gPSBuZXcgSnVtcFRvKFwibmV4dC1oZWFkaW5nXCIpXG4gICAgICBzcHlPbihqdW1wVG8sIFwibmV4dEhlYWRpbmdcIilcblxuICAgICAganVtcFRvLnRyaWdnZXIoYWJvcnRLZXlCaW5kaW5nOiAtPiB7fSlcblxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0SGVhZGluZykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImp1bXBzIHRvIGNvcnJlY3QgcG9zaXRpb25cIiwgLT5cbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oXCJwcmV2aW91cy1oZWFkaW5nXCIpXG5cbiAgICAgIGp1bXBUby5wcmV2aW91c0hlYWRpbmcgPSAtPiBbNSwgNV1cbiAgICAgIHNweU9uKGp1bXBUby5lZGl0b3IsIFwic2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25cIilcblxuICAgICAganVtcFRvLnRyaWdnZXIoKVxuXG4gICAgICBleHBlY3QoanVtcFRvLmVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbikudG9IYXZlQmVlbkNhbGxlZFdpdGgoWzUsIDVdKVxuXG4gIGRlc2NyaWJlIFwiLnByZXZpb3VzSGVhZGluZ1wiLCAtPlxuICAgIHRleHQgPSBcIlwiXCJcbiAgICAjIFRpdGxlXG5cbiAgICBjb250ZW50IGNvbnRlbnRcblxuICAgICMjIFN1YnRpdGxlXG5cbiAgICBjb250ZW50IGNvbnRlbnRcbiAgICBcIlwiXCJcblxuICAgIGl0IFwiZmluZHMgbm90aGluZyBpZiBubyBoZWFkaW5nc1wiLCAtPlxuICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICBleHBlY3QoanVtcFRvLnByZXZpb3VzSGVhZGluZygpKS50b0JlKGZhbHNlKVxuXG4gICAgaXQgXCJmaW5kcyBub3RoaW5nIGlmIG5vIHByZXZpb3VzIGhlYWRpbmdcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDFdKVxuXG4gICAgICBqdW1wVG8gPSBuZXcgSnVtcFRvKClcbiAgICAgIGV4cGVjdChqdW1wVG8ucHJldmlvdXNIZWFkaW5nKCkpLnRvRXF1YWwoZmFsc2UpXG5cbiAgICBpdCBcImZpbmRzIHByZXZpb3VzIHN1YnRpdGxlXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs2LCA2XSlcblxuICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICBleHBlY3QoanVtcFRvLnByZXZpb3VzSGVhZGluZygpKS50b0VxdWFsKHJvdzogNCwgY29sdW1uOiAwKVxuXG4gICAgaXQgXCJmaW5kcyBwcmV2aW91cyB0aXRsZVwiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNCwgMV0pXG5cbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5wcmV2aW91c0hlYWRpbmcoKSkudG9FcXVhbChyb3c6IDAsIGNvbHVtbjogMClcblxuICBkZXNjcmliZSBcIi5uZXh0SGVhZGluZ1wiLCAtPlxuICAgIHRleHQgPSBcIlwiXCJcbiAgICAjIFRpdGxlXG5cbiAgICBjb250ZW50IGNvbnRlbnRcblxuICAgICMjIFN1YnRpdGxlXG5cbiAgICBjb250ZW50IGNvbnRlbnRcbiAgICBcIlwiXCJcblxuICAgIGl0IFwiZmluZHMgbm90aGluZyBpZiBubyBoZWFkaW5nc1wiLCAtPlxuICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICBleHBlY3QoanVtcFRvLm5leHRIZWFkaW5nKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBpdCBcImZpbmRzIG5leHQgc3VidGl0bGVcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzMsIDZdKVxuXG4gICAgICBqdW1wVG8gPSBuZXcgSnVtcFRvKClcbiAgICAgIGV4cGVjdChqdW1wVG8ubmV4dEhlYWRpbmcoKSkudG9FcXVhbChyb3c6IDQsIGNvbHVtbjogMClcblxuICAgIGl0IFwiZmluZHMgdG9wIHRpdGxlXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs2LCA1XSlcblxuICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICBleHBlY3QoanVtcFRvLm5leHRIZWFkaW5nKCkpLnRvRXF1YWwocm93OiAwLCBjb2x1bW46IDApXG5cbiAgZGVzY3JpYmUgXCIucmVmZXJlbmNlRGVmaW5pdGlvblwiLCAtPlxuICAgIHRleHQgPSBcIlwiXCJcbiAgICBlbXB0eSBsaW5lIHdpdGggbm8gbGlua1xuICAgIGVtcHR5IGxpbmUgd2l0aCBvcnBoYW4gW2xpbmtdW2xpbmtdXG5cbiAgICBsaW5rIHRvIFt6aHVvY2h1bi9tZC13cml0ZXJdW2NmYzI3YjAxXSBzaG91bGQgd29ya1xuICAgIGxpbmsgdG8gW01hcmtkb3duLVdyaXRlciBmb3IgQXRvbV1bXSBzaG91bGQgd29yayBhcyB3ZWxsXG5cbiAgICAgIFtjZmMyN2IwMV06IGh0dHBzOi8vZ2l0aHViLmNvbS96aHVvY2h1bi9tZC13cml0ZXIgXCJNYXJrZG93bi1Xcml0ZXIgZm9yIEF0b21cIlxuICAgICAgW01hcmtkb3duLVdyaXRlciBmb3IgQXRvbV06IGh0dHBzOi8vZ2l0aHViLmNvbS96aHVvY2h1bi9tZC13cml0ZXIgXCJNYXJrZG93bi1Xcml0ZXIgZm9yIEF0b21cIlxuICAgICAgW25vZm91bmRdOiBodHRwczovL2V4YW1wbGUuY29tXG5cbiAgICBmb290bm90ZXNbXmZuXSBpcyBhIGtpbmQgb2Ygc3BlY2lhbCBsaW5rXG5cbiAgICAgIFteZm5dOiBmb290bm90ZSBkZWZpbml0aW9uXG4gICAgXCJcIlwiXG5cbiAgICBpdCBcImZpbmRzIG5vdGhpbmcgaWYgbm8gd29yZCB1bmRlciBjdXJzb3JcIiwgLT5cbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5yZWZlcmVuY2VEZWZpbml0aW9uKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBpdCBcImZpbmRzIG5vdGhpbmcgaWYgbm8gbGluayBmb3VuZFwiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMl0pXG5cbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5yZWZlcmVuY2VEZWZpbml0aW9uKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBkZXNjcmliZSBcImxpbmtzXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+IGVkaXRvci5zZXRUZXh0KHRleHQpXG5cbiAgICAgIGl0IFwiZmluZHMgbm90aGluZyBpZiBubyBsaW5rIGRlZmluaXRpb25cIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCAyXSlcbiAgICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICAgIGV4cGVjdChqdW1wVG8ucmVmZXJlbmNlRGVmaW5pdGlvbigpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcImZpbmRzIG5vdGhpbmcgaWYgbm8gbGluayByZWZlcmVuY2VcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs4LCAyXSlcbiAgICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICAgIGV4cGVjdChqdW1wVG8ucmVmZXJlbmNlRGVmaW5pdGlvbigpKS50b0JlKGZhbHNlKVxuXG4gICAgICBpdCBcImZpbmRzIGRlZmluaXRpb24gKG9uIHRoZSBsaW5lKVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzMsIDBdKVxuICAgICAgICBqdW1wVG8gPSBuZXcgSnVtcFRvKClcbiAgICAgICAgZXhwZWN0KGp1bXBUby5yZWZlcmVuY2VEZWZpbml0aW9uKCkpLnRvRXF1YWwoWzYsIDBdKVxuXG4gICAgICBpdCBcImZpbmRzIGRlZmluaXRpb24gKGVtcHR5IGlkIGxhYmVsKVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzQsIDhdKVxuICAgICAgICBqdW1wVG8gPSBuZXcgSnVtcFRvKClcbiAgICAgICAgZXhwZWN0KGp1bXBUby5yZWZlcmVuY2VEZWZpbml0aW9uKCkpLnRvRXF1YWwoWzcsIDBdKVxuXG4gICAgICBpdCBcImZpbmRzIHJlZmVyZW5jZSAob24gdGhlIGxpbmUpXCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNiwgMF0pXG4gICAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgICBleHBlY3QoanVtcFRvLnJlZmVyZW5jZURlZmluaXRpb24oKSkudG9FcXVhbChbMywgOF0pXG5cbiAgICAgIGl0IFwiZmluZHMgcmVmZXJlbmNlIChlbXB0eSBpZCBsYWJlbClcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs3LCA0XSlcbiAgICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICAgIGV4cGVjdChqdW1wVG8ucmVmZXJlbmNlRGVmaW5pdGlvbigpKS50b0VxdWFsKFs0LCA4XSlcblxuICAgIGRlc2NyaWJlIFwiZm9vbm90ZXNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT4gZWRpdG9yLnNldFRleHQodGV4dClcblxuICAgICAgaXQgXCJmaW5kcyBkZWZpbml0aW9uXCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMTAsIDEyXSlcbiAgICAgICAganVtcFRvID0gbmV3IEp1bXBUbygpXG4gICAgICAgIGV4cGVjdChqdW1wVG8ucmVmZXJlbmNlRGVmaW5pdGlvbigpKS50b0VxdWFsKFsxMiwgMl0pXG5cbiAgICAgIGl0IFwiZmluZHMgcmVmZXJlbmNlXCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMTIsIDZdKVxuICAgICAgICBqdW1wVG8gPSBuZXcgSnVtcFRvKClcbiAgICAgICAgZXhwZWN0KGp1bXBUby5yZWZlcmVuY2VEZWZpbml0aW9uKCkpLnRvRXF1YWwoWzEwLCA5XSlcblxuICBkZXNjcmliZSBcIi5uZXh0VGFibGVDZWxsXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICB0aGlzIGlzIGEgdGFibGU6XG5cbiAgICAgIHwgSGVhZGVyIE9uZSB8IEhlYWRlciBUd28gfFxuICAgICAgfDotLS0tLS0tLS0tLXw6LS0tLS0tLS0tLS18XG4gICAgICB8IEl0ZW0gT25lICAgfCBJdGVtIFR3byAgIHxcblxuICAgICAgdGhpcyBpcyBhbm90aGVyIHRhYmxlOlxuXG4gICAgICBIZWFkZXIgT25lICAgIHwgICBIZWFkZXIgVHdvIHwgSGVhZGVyIFRocmVlXG4gICAgICA6LS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS0tOnw6LS0tLS0tLS0tLS06XG4gICAgICBJdGVtIE9uZSAgICAgIHwgICAgIEl0ZW0gVHdvIHwgIEl0ZW0gVGhyZWVcbiAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJmaW5kcyBub3RoaW5nIGlmIGl0IGlzIG5vdCBhIHRhYmxlIHJvd1wiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAyXSlcbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0VGFibGVDZWxsKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBpdCBcImZpbmRzIHJvdyAxLCBjZWxsIDIgaW4gdGFibGUgMVwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsyLCAyXSlcbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0VGFibGVDZWxsKCkpLnRvRXF1YWwoWzIsIDI1XSlcblxuICAgIGl0IFwiZmluZHMgcm93IDIsIGNlbGwgMSBpbiB0YWJsZSAxIGZyb20gZW5kIG9mIHJvdyAxXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzIsIDI1XSlcbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0VGFibGVDZWxsKCkpLnRvRXF1YWwoWzQsIDEwXSlcblxuICAgIGl0IFwiZmluZHMgcm93IDIsIGNlbGwgMSBpbiB0YWJsZSAxIGZyb20gcm93IHNlcGFyYXRvclwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCAwXSlcbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0VGFibGVDZWxsKCkpLnRvRXF1YWwoWzQsIDEwXSlcblxuICAgIGl0IFwiZmluZHMgcm93IDEsIGNlbGwgMyBpbiB0YWJsZSAyXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzgsIDI0XSlcbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0VGFibGVDZWxsKCkpLnRvRXF1YWwoWzgsIDQzXSlcblxuICAgIGl0IFwiZmluZHMgcm93IDIsIGNlbGwgMSBpbiB0YWJsZSAyXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzgsIDQyXSlcbiAgICAgIGp1bXBUbyA9IG5ldyBKdW1wVG8oKVxuICAgICAgZXhwZWN0KGp1bXBUby5uZXh0VGFibGVDZWxsKCkpLnRvRXF1YWwoWzEwLCA4XSlcbiJdfQ==
