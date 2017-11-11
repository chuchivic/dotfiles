(function() {
  var EditLine;

  EditLine = require("../../lib/commands/edit-line");

  describe("EditLine", function() {
    var editLine, editor, event, ref;
    ref = [], editor = ref[0], editLine = ref[1], event = ref[2];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        event = {
          abortKeyBinding: function() {
            return {};
          }
        };
        return spyOn(event, "abortKeyBinding");
      });
    });
    describe("insertNewLine", function() {
      beforeEach(function() {
        return editLine = new EditLine("insert-new-line");
      });
      it("does not affect normal new line", function() {
        editor.setText("this is normal line");
        editor.setCursorBufferPosition([0, 4]);
        editLine.trigger(event);
        return expect(event.abortKeyBinding).toHaveBeenCalled();
      });
      it("continue if config inlineNewLineContinuation enabled", function() {
        atom.config.set("markdown-writer.inlineNewLineContinuation", true);
        editor.setText("- inline line");
        editor.setCursorBufferPosition([0, 8]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe("- inline\n-  line");
      });
      it("continue after unordered list line", function() {
        editor.setText("- line");
        editor.setCursorBufferPosition([0, 6]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["- line", "- "].join("\n"));
      });
      it("continue after ordered task list line", function() {
        editor.setText("1. [ ] Epic Tasks\n  1. [X] Sub-task A");
        editor.setCursorBufferPosition([1, 19]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["1. [ ] Epic Tasks", "  1. [X] Sub-task A", "  2. [ ] "].join("\n"));
      });
      it("continue after ordered task list line (without number continuation)", function() {
        atom.config.set("markdown-writer.orderedNewLineNumberContinuation", false);
        editor.setText("1. Epic Order One");
        editor.setCursorBufferPosition([0, 17]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["1. Epic Order One", "1. "].join("\n"));
      });
      it("continue after alpha ordered task list line", function() {
        editor.setText("1. [ ] Epic Tasks\n  y. [X] Sub-task A");
        editor.setCursorBufferPosition([1, 19]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["1. [ ] Epic Tasks", "  y. [X] Sub-task A", "  z. [ ] "].join("\n"));
      });
      it("continue after blockquote line", function() {
        editor.setText("> Your time is limited, so don’t waste it living someone else’s life.");
        editor.setCursorBufferPosition([0, 69]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["> Your time is limited, so don’t waste it living someone else’s life.", "> "].join("\n"));
      });
      it("not continue after empty unordered task list line", function() {
        editor.setText("- [ ]");
        editor.setCursorBufferPosition([0, 5]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["", ""].join("\n"));
      });
      it("not continue after empty ordered list line", function() {
        editor.setText(["1. [ ] parent", "  - child", "  - "].join("\n"));
        editor.setCursorBufferPosition([2, 4]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["1. [ ] parent", "  - child", "2. [ ] "].join("\n"));
      });
      return it("not continue after empty ordered paragraph", function() {
        editor.setText(["1. parent", "  - child has a paragraph", "", "    paragraph one", "", "    paragraph two", "", "  - "].join("\n"));
        editor.setCursorBufferPosition([7, 4]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe(["1. parent", "  - child has a paragraph", "", "    paragraph one", "", "    paragraph two", "", "2. "].join("\n"));
      });
    });
    describe("insertNewLine (Table)", function() {
      beforeEach(function() {
        editLine = new EditLine("insert-new-line");
        return editor.setText(["a | b | c", "a | b | c", "", "random line | with bar", "", "a | b | c", "--|---|--", "a | b | c", "a | b | c", "  |   |  "].join("\n"));
      });
      it("continue after table separator", function() {
        editor.setCursorBufferPosition([6, 5]);
        editLine.trigger(event);
        expect(editor.getText()).toBe(["a | b | c", "a | b | c", "", "random line | with bar", "", "a | b | c", "--|---|--", "  |   |  ", "a | b | c", "a | b | c", "  |   |  "].join("\n"));
        return expect(editor.getCursorBufferPosition().toString()).toBe("(7, 0)");
      });
      it("continue after table rows", function() {
        editor.setCursorBufferPosition([1, 9]);
        editLine.trigger(event);
        expect(editor.getText()).toBe(["a | b | c", "a | b | c", "  |   |  ", "", "random line | with bar", "", "a | b | c", "--|---|--", "a | b | c", "a | b | c", "  |   |  "].join("\n"));
        return expect(editor.getCursorBufferPosition().toString()).toBe("(2, 0)");
      });
      it("continue in a table row", function() {
        editor.setCursorBufferPosition([7, 3]);
        editLine.trigger(event);
        expect(editor.getText()).toBe(["a | b | c", "a | b | c", "", "random line | with bar", "", "a | b | c", "--|---|--", "a | b | c", "  |   |  ", "a | b | c", "  |   |  "].join("\n"));
        return expect(editor.getCursorBufferPosition().toString()).toBe("(8, 0)");
      });
      it("not continue after empty table row", function() {
        editor.setCursorBufferPosition([9, 8]);
        editLine.trigger(event);
        expect(editor.getText()).toBe(["a | b | c", "a | b | c", "", "random line | with bar", "", "a | b | c", "--|---|--", "a | b | c", "a | b | c", "", ""].join("\n"));
        return expect(editor.getCursorBufferPosition().toString()).toBe("(10, 0)");
      });
      it("has not effect at table head", function() {
        editor.setCursorBufferPosition([5, 9]);
        editLine.trigger(event);
        expect(editor.getText()).toBe(["a | b | c", "a | b | c", "", "random line | with bar", "", "a | b | c", "--|---|--", "a | b | c", "a | b | c", "  |   |  "].join("\n"));
        return expect(editor.getCursorBufferPosition().toString()).toBe("(5, 9)");
      });
      return it("has not effect at random line", function() {
        editor.setCursorBufferPosition([3, 9]);
        editLine.trigger(event);
        expect(editor.getText()).toBe(["a | b | c", "a | b | c", "", "random line | with bar", "", "a | b | c", "--|---|--", "a | b | c", "a | b | c", "  |   |  "].join("\n"));
        return expect(editor.getCursorBufferPosition().toString()).toBe("(3, 9)");
      });
    });
    return describe("indentListLine", function() {
      beforeEach(function() {
        return editLine = new EditLine("indent-list-line");
      });
      it("indent line if it is at head of line", function() {
        editor.setText("  normal line");
        editor.setCursorBufferPosition([0, 1]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe("    normal line");
      });
      it("indent line if it is an unordered list", function() {
        editor.setText("- list");
        editor.setCursorBufferPosition([0, 5]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe("  - list");
      });
      it("indent line if it is an ordered list", function() {
        editor.setText("3. list");
        editor.setCursorBufferPosition([0, 5]);
        editLine.trigger(event);
        return expect(editor.getText()).toBe("  1. list");
      });
      return it("insert space if it is text", function() {
        editor.setText("texttext");
        editor.setCursorBufferPosition([0, 4]);
        editLine.trigger(event);
        return expect(event.abortKeyBinding).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvY29tbWFuZHMvZWRpdC1saW5lLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVcsT0FBQSxDQUFRLDhCQUFSOztFQUVYLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7QUFDbkIsUUFBQTtJQUFBLE1BQTRCLEVBQTVCLEVBQUMsZUFBRCxFQUFTLGlCQUFULEVBQW1CO0lBRW5CLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGdCQUFwQjtNQUFILENBQWhCO2FBQ0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO1FBRVQsS0FBQSxHQUFRO1VBQUUsZUFBQSxFQUFpQixTQUFBO21CQUFHO1VBQUgsQ0FBbkI7O2VBQ1IsS0FBQSxDQUFNLEtBQU4sRUFBYSxpQkFBYjtNQUpHLENBQUw7SUFGUyxDQUFYO0lBUUEsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtNQUN4QixVQUFBLENBQVcsU0FBQTtlQUFHLFFBQUEsR0FBZSxJQUFBLFFBQUEsQ0FBUyxpQkFBVDtNQUFsQixDQUFYO01BRUEsRUFBQSxDQUFHLGlDQUFILEVBQXNDLFNBQUE7UUFDcEMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxxQkFBZjtRQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO1FBRUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsS0FBakI7ZUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLGVBQWIsQ0FBNkIsQ0FBQyxnQkFBOUIsQ0FBQTtNQUxvQyxDQUF0QztNQU9BLEVBQUEsQ0FBRyxzREFBSCxFQUEyRCxTQUFB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LEtBQWpCO2VBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBUCxDQUF3QixDQUFDLElBQXpCLENBQThCLFVBQTlCO01BTDJDLENBQTdDO01BT0EsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUE7UUFDekMsTUFBTSxDQUFDLE9BQVAsQ0FBZSxTQUFmO1FBQ0EsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0I7UUFFQSxRQUFRLENBQUMsT0FBVCxDQUFpQixLQUFqQjtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsT0FBUCxDQUFBLENBQVAsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixXQUE5QjtNQUx5QyxDQUEzQzthQU9BLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO1FBQy9CLE1BQU0sQ0FBQyxPQUFQLENBQWUsVUFBZjtRQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO1FBRUEsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsS0FBakI7ZUFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLGVBQWIsQ0FBNkIsQ0FBQyxnQkFBOUIsQ0FBQTtNQUwrQixDQUFqQztJQXhCeUIsQ0FBM0I7RUFsUm1CLENBQXJCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJFZGl0TGluZSA9IHJlcXVpcmUgXCIuLi8uLi9saWIvY29tbWFuZHMvZWRpdC1saW5lXCJcblxuZGVzY3JpYmUgXCJFZGl0TGluZVwiLCAtPlxuICBbZWRpdG9yLCBlZGl0TGluZSwgZXZlbnRdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJlbXB0eS5tYXJrZG93blwiKVxuICAgIHJ1bnMgLT5cbiAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgICBldmVudCA9IHsgYWJvcnRLZXlCaW5kaW5nOiAtPiB7fSB9XG4gICAgICBzcHlPbihldmVudCwgXCJhYm9ydEtleUJpbmRpbmdcIilcblxuICBkZXNjcmliZSBcImluc2VydE5ld0xpbmVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+IGVkaXRMaW5lID0gbmV3IEVkaXRMaW5lKFwiaW5zZXJ0LW5ldy1saW5lXCIpXG5cbiAgICBpdCBcImRvZXMgbm90IGFmZmVjdCBub3JtYWwgbmV3IGxpbmVcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwidGhpcyBpcyBub3JtYWwgbGluZVwiXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDRdKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGV2ZW50LmFib3J0S2V5QmluZGluZykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBpdCBcImNvbnRpbnVlIGlmIGNvbmZpZyBpbmxpbmVOZXdMaW5lQ29udGludWF0aW9uIGVuYWJsZWRcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5pbmxpbmVOZXdMaW5lQ29udGludWF0aW9uXCIsIHRydWUpXG5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwiLSBpbmxpbmUgbGluZVwiXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDhdKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgXCJcIlwiXG4gICAgICAtIGlubGluZVxuICAgICAgLSAgbGluZVxuICAgICAgXCJcIlwiXG5cbiAgICBpdCBcImNvbnRpbnVlIGFmdGVyIHVub3JkZXJlZCBsaXN0IGxpbmVcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwiLSBsaW5lXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgNl0pXG5cbiAgICAgIGVkaXRMaW5lLnRyaWdnZXIoZXZlbnQpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBbXG4gICAgICAgIFwiLSBsaW5lXCJcbiAgICAgICAgXCItIFwiICMgbGFzdCBpdGVtIHdpdGggdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgXS5qb2luKFwiXFxuXCIpXG5cbiAgICBpdCBcImNvbnRpbnVlIGFmdGVyIG9yZGVyZWQgdGFzayBsaXN0IGxpbmVcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwiXCJcIlxuICAgICAgMS4gWyBdIEVwaWMgVGFza3NcbiAgICAgICAgMS4gW1hdIFN1Yi10YXNrIEFcbiAgICAgIFwiXCJcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCAxOV0pXG5cbiAgICAgIGVkaXRMaW5lLnRyaWdnZXIoZXZlbnQpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBbXG4gICAgICAgIFwiMS4gWyBdIEVwaWMgVGFza3NcIlxuICAgICAgICBcIiAgMS4gW1hdIFN1Yi10YXNrIEFcIlxuICAgICAgICBcIiAgMi4gWyBdIFwiICMgbGFzdCBpdGVtIHdpdGggdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgXS5qb2luKFwiXFxuXCIpXG5cbiAgICBpdCBcImNvbnRpbnVlIGFmdGVyIG9yZGVyZWQgdGFzayBsaXN0IGxpbmUgKHdpdGhvdXQgbnVtYmVyIGNvbnRpbnVhdGlvbilcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5vcmRlcmVkTmV3TGluZU51bWJlckNvbnRpbnVhdGlvblwiLCBmYWxzZSlcblxuICAgICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICAxLiBFcGljIE9yZGVyIE9uZVxuICAgICAgXCJcIlwiXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDE3XSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFtcbiAgICAgICAgXCIxLiBFcGljIE9yZGVyIE9uZVwiXG4gICAgICAgIFwiMS4gXCIgIyBsYXN0IGl0ZW0gd2l0aCB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICBdLmpvaW4oXCJcXG5cIilcblxuICAgIGl0IFwiY29udGludWUgYWZ0ZXIgYWxwaGEgb3JkZXJlZCB0YXNrIGxpc3QgbGluZVwiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICAxLiBbIF0gRXBpYyBUYXNrc1xuICAgICAgICB5LiBbWF0gU3ViLXRhc2sgQVxuICAgICAgXCJcIlwiXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzEsIDE5XSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFtcbiAgICAgICAgXCIxLiBbIF0gRXBpYyBUYXNrc1wiXG4gICAgICAgIFwiICB5LiBbWF0gU3ViLXRhc2sgQVwiXG4gICAgICAgIFwiICB6LiBbIF0gXCIgIyBsYXN0IGl0ZW0gd2l0aCB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICBdLmpvaW4oXCJcXG5cIilcblxuICAgIGl0IFwiY29udGludWUgYWZ0ZXIgYmxvY2txdW90ZSBsaW5lXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgID4gWW91ciB0aW1lIGlzIGxpbWl0ZWQsIHNvIGRvbuKAmXQgd2FzdGUgaXQgbGl2aW5nIHNvbWVvbmUgZWxzZeKAmXMgbGlmZS5cbiAgICAgIFwiXCJcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCA2OV0pXG5cbiAgICAgIGVkaXRMaW5lLnRyaWdnZXIoZXZlbnQpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBbXG4gICAgICAgIFwiPiBZb3VyIHRpbWUgaXMgbGltaXRlZCwgc28gZG9u4oCZdCB3YXN0ZSBpdCBsaXZpbmcgc29tZW9uZSBlbHNl4oCZcyBsaWZlLlwiXG4gICAgICAgIFwiPiBcIiAjIGxhc3QgaXRlbSB3aXRoIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgaXQgXCJub3QgY29udGludWUgYWZ0ZXIgZW1wdHkgdW5vcmRlcmVkIHRhc2sgbGlzdCBsaW5lXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIC0gWyBdXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgNV0pXG5cbiAgICAgIGVkaXRMaW5lLnRyaWdnZXIoZXZlbnQpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBbXCJcIiwgXCJcIl0uam9pbihcIlxcblwiKVxuXG4gICAgaXQgXCJub3QgY29udGludWUgYWZ0ZXIgZW1wdHkgb3JkZXJlZCBsaXN0IGxpbmVcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFtcbiAgICAgICAgXCIxLiBbIF0gcGFyZW50XCJcbiAgICAgICAgXCIgIC0gY2hpbGRcIlxuICAgICAgICBcIiAgLSBcIiAjIGxhc3QgaXRlbSB3aXRoIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgIF0uam9pbihcIlxcblwiKVxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsyLCA0XSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFtcbiAgICAgICAgXCIxLiBbIF0gcGFyZW50XCJcbiAgICAgICAgXCIgIC0gY2hpbGRcIlxuICAgICAgICBcIjIuIFsgXSBcIiAjIGxhc3QgaXRlbSB3aXRoIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgaXQgXCJub3QgY29udGludWUgYWZ0ZXIgZW1wdHkgb3JkZXJlZCBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFtcbiAgICAgICAgXCIxLiBwYXJlbnRcIlxuICAgICAgICBcIiAgLSBjaGlsZCBoYXMgYSBwYXJhZ3JhcGhcIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwiICAgIHBhcmFncmFwaCBvbmVcIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwiICAgIHBhcmFncmFwaCB0d29cIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwiICAtIFwiICMgbGFzdCBpdGVtIHdpdGggdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgXS5qb2luKFwiXFxuXCIpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzcsIDRdKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgW1xuICAgICAgICBcIjEuIHBhcmVudFwiXG4gICAgICAgIFwiICAtIGNoaWxkIGhhcyBhIHBhcmFncmFwaFwiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCIgICAgcGFyYWdyYXBoIG9uZVwiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCIgICAgcGFyYWdyYXBoIHR3b1wiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCIyLiBcIiAjIGxhc3QgaXRlbSB3aXRoIHRyYWlsaW5nIHdoaXRlc3BhY2VcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gIGRlc2NyaWJlIFwiaW5zZXJ0TmV3TGluZSAoVGFibGUpXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgZWRpdExpbmUgPSBuZXcgRWRpdExpbmUoXCJpbnNlcnQtbmV3LWxpbmVcIilcbiAgICAgIGVkaXRvci5zZXRUZXh0IFtcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCJyYW5kb20gbGluZSB8IHdpdGggYmFyXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiLS18LS0tfC0tXCJcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiICB8ICAgfCAgXCJcbiAgICAgIF0uam9pbihcIlxcblwiKVxuXG4gICAgaXQgXCJjb250aW51ZSBhZnRlciB0YWJsZSBzZXBhcmF0b3JcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNiwgNV0pXG5cbiAgICAgIGVkaXRMaW5lLnRyaWdnZXIoZXZlbnQpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBbXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwicmFuZG9tIGxpbmUgfCB3aXRoIGJhclwiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcIi0tfC0tLXwtLVwiXG4gICAgICAgIFwiICB8ICAgfCAgXCJcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiICB8ICAgfCAgXCJcbiAgICAgIF0uam9pbihcIlxcblwiKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnRvU3RyaW5nKCkpLnRvQmUoXCIoNywgMClcIilcblxuICAgIGl0IFwiY29udGludWUgYWZ0ZXIgdGFibGUgcm93c1wiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCA5XSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFtcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiICB8ICAgfCAgXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcInJhbmRvbSBsaW5lIHwgd2l0aCBiYXJcIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCItLXwtLS18LS1cIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCIgIHwgICB8ICBcIlxuICAgICAgXS5qb2luKFwiXFxuXCIpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkudG9TdHJpbmcoKSkudG9CZShcIigyLCAwKVwiKVxuXG4gICAgaXQgXCJjb250aW51ZSBpbiBhIHRhYmxlIHJvd1wiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFs3LCAzXSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFtcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCJyYW5kb20gbGluZSB8IHdpdGggYmFyXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiLS18LS0tfC0tXCJcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcIiAgfCAgIHwgIFwiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCIgIHwgICB8ICBcIlxuICAgICAgXS5qb2luKFwiXFxuXCIpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkudG9TdHJpbmcoKSkudG9CZShcIig4LCAwKVwiKVxuXG4gICAgaXQgXCJub3QgY29udGludWUgYWZ0ZXIgZW1wdHkgdGFibGUgcm93XCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzksIDhdKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgW1xuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcInJhbmRvbSBsaW5lIHwgd2l0aCBiYXJcIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCItLXwtLS18LS1cIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcIlwiXG4gICAgICBdLmpvaW4oXCJcXG5cIilcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS50b1N0cmluZygpKS50b0JlKFwiKDEwLCAwKVwiKVxuXG4gICAgaXQgXCJoYXMgbm90IGVmZmVjdCBhdCB0YWJsZSBoZWFkXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzUsIDldKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgW1xuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcInJhbmRvbSBsaW5lIHwgd2l0aCBiYXJcIlxuICAgICAgICBcIlwiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCItLXwtLS18LS1cIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiYSB8IGIgfCBjXCJcbiAgICAgICAgXCIgIHwgICB8ICBcIlxuICAgICAgXS5qb2luKFwiXFxuXCIpXG4gICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkudG9TdHJpbmcoKSkudG9CZShcIig1LCA5KVwiKVxuXG4gICAgaXQgXCJoYXMgbm90IGVmZmVjdCBhdCByYW5kb20gbGluZVwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCA5XSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFtcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiXCJcbiAgICAgICAgXCJyYW5kb20gbGluZSB8IHdpdGggYmFyXCJcbiAgICAgICAgXCJcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiLS18LS0tfC0tXCJcbiAgICAgICAgXCJhIHwgYiB8IGNcIlxuICAgICAgICBcImEgfCBiIHwgY1wiXG4gICAgICAgIFwiICB8ICAgfCAgXCJcbiAgICAgIF0uam9pbihcIlxcblwiKVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnRvU3RyaW5nKCkpLnRvQmUoXCIoMywgOSlcIilcblxuICBkZXNjcmliZSBcImluZGVudExpc3RMaW5lXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBlZGl0TGluZSA9IG5ldyBFZGl0TGluZShcImluZGVudC1saXN0LWxpbmVcIilcblxuICAgIGl0IFwiaW5kZW50IGxpbmUgaWYgaXQgaXMgYXQgaGVhZCBvZiBsaW5lXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIiAgbm9ybWFsIGxpbmVcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCAxXSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlKFwiICAgIG5vcm1hbCBsaW5lXCIpXG5cbiAgICBpdCBcImluZGVudCBsaW5lIGlmIGl0IGlzIGFuIHVub3JkZXJlZCBsaXN0XCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIi0gbGlzdFwiXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDVdKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoXCIgIC0gbGlzdFwiKVxuXG4gICAgaXQgXCJpbmRlbnQgbGluZSBpZiBpdCBpcyBhbiBvcmRlcmVkIGxpc3RcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwiMy4gbGlzdFwiXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDVdKVxuXG4gICAgICBlZGl0TGluZS50cmlnZ2VyKGV2ZW50KVxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUoXCIgIDEuIGxpc3RcIilcblxuICAgIGl0IFwiaW5zZXJ0IHNwYWNlIGlmIGl0IGlzIHRleHRcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwidGV4dHRleHRcIlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFswLCA0XSlcblxuICAgICAgZWRpdExpbmUudHJpZ2dlcihldmVudClcbiAgICAgIGV4cGVjdChldmVudC5hYm9ydEtleUJpbmRpbmcpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuIl19
