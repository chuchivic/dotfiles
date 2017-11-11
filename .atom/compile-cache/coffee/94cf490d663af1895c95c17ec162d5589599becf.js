(function() {
  var PublishDraft, path, pathSep;

  path = require("path");

  PublishDraft = require("../../lib/commands/publish-draft");

  pathSep = "[/\\\\]";

  describe("PublishDraft", function() {
    var editor, publishDraft, ref;
    ref = [], editor = ref[0], publishDraft = ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    describe(".trigger", function() {
      return it("abort publish draft when not confirm publish", function() {
        publishDraft = new PublishDraft({});
        publishDraft.confirmPublish = function() {
          return {};
        };
        publishDraft.trigger();
        expect(publishDraft.draftPath).toMatch(RegExp(pathSep + "fixtures" + pathSep + "empty\\.markdown$"));
        return expect(publishDraft.postPath).toMatch(RegExp(pathSep + "\\d{4}" + pathSep + "\\d{4}-\\d\\d-\\d\\d-empty\\.markdown$"));
      });
    });
    describe(".getSlug", function() {
      it("get title from front matter by config", function() {
        atom.config.set("markdown-writer.publishRenameBasedOnTitle", true);
        editor.setText("---\ntitle: Markdown Writer\n---");
        publishDraft = new PublishDraft({});
        return expect(publishDraft.getSlug()).toBe("markdown-writer");
      });
      it("get title from front matter if no draft path", function() {
        editor.setText("---\ntitle: Markdown Writer (New Post)\n---");
        publishDraft = new PublishDraft({});
        publishDraft.draftPath = void 0;
        return expect(publishDraft.getSlug()).toBe("markdown-writer-new-post");
      });
      it("get title from draft path", function() {
        publishDraft = new PublishDraft({});
        publishDraft.draftPath = path.join("test", "name-of-post.md");
        return expect(publishDraft.getSlug()).toBe("name-of-post");
      });
      return it("get new-post when no front matter/draft path", function() {
        publishDraft = new PublishDraft({});
        publishDraft.draftPath = void 0;
        return expect(publishDraft.getSlug()).toBe("new-post");
      });
    });
    return describe(".getExtension", function() {
      beforeEach(function() {
        return publishDraft = new PublishDraft({});
      });
      it("get draft path extname by config", function() {
        atom.config.set("markdown-writer.publishKeepFileExtname", true);
        publishDraft.draftPath = path.join("test", "name.md");
        return expect(publishDraft.getExtension()).toBe(".md");
      });
      return it("get default extname", function() {
        publishDraft.draftPath = path.join("test", "name.md");
        return expect(publishDraft.getExtension()).toBe(".markdown");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvY29tbWFuZHMvcHVibGlzaC1kcmFmdC1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFlBQUEsR0FBZSxPQUFBLENBQVEsa0NBQVI7O0VBRWYsT0FBQSxHQUFVOztFQUVWLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7QUFDdkIsUUFBQTtJQUFBLE1BQXlCLEVBQXpCLEVBQUMsZUFBRCxFQUFTO0lBRVQsVUFBQSxDQUFXLFNBQUE7TUFDVCxlQUFBLENBQWdCLFNBQUE7ZUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsZ0JBQXBCO01BQUgsQ0FBaEI7YUFDQSxJQUFBLENBQUssU0FBQTtlQUFHLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7TUFBWixDQUFMO0lBRlMsQ0FBWDtJQUlBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7YUFDbkIsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7UUFDakQsWUFBQSxHQUFtQixJQUFBLFlBQUEsQ0FBYSxFQUFiO1FBQ25CLFlBQVksQ0FBQyxjQUFiLEdBQThCLFNBQUE7aUJBQUc7UUFBSDtRQUU5QixZQUFZLENBQUMsT0FBYixDQUFBO1FBRUEsTUFBQSxDQUFPLFlBQVksQ0FBQyxTQUFwQixDQUE4QixDQUFDLE9BQS9CLENBQXVDLE1BQUEsQ0FBTSxPQUFELEdBQVMsVUFBVCxHQUFtQixPQUFuQixHQUEyQixtQkFBaEMsQ0FBdkM7ZUFDQSxNQUFBLENBQU8sWUFBWSxDQUFDLFFBQXBCLENBQTZCLENBQUMsT0FBOUIsQ0FBc0MsTUFBQSxDQUFNLE9BQUQsR0FBUyxRQUFULEdBQWdCLE9BQWhCLEdBQXdCLHdDQUE3QixDQUF0QztNQVBpRCxDQUFuRDtJQURtQixDQUFyQjtJQVVBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7TUFDbkIsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUE7UUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDJDQUFoQixFQUE2RCxJQUE3RDtRQUNBLE1BQU0sQ0FBQyxPQUFQLENBQWUsa0NBQWY7UUFNQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLEVBQWI7ZUFDbkIsTUFBQSxDQUFPLFlBQVksQ0FBQyxPQUFiLENBQUEsQ0FBUCxDQUE4QixDQUFDLElBQS9CLENBQW9DLGlCQUFwQztNQVQwQyxDQUE1QztNQVdBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO1FBQ2pELE1BQU0sQ0FBQyxPQUFQLENBQWUsNkNBQWY7UUFNQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLEVBQWI7UUFDbkIsWUFBWSxDQUFDLFNBQWIsR0FBeUI7ZUFDekIsTUFBQSxDQUFPLFlBQVksQ0FBQyxPQUFiLENBQUEsQ0FBUCxDQUE4QixDQUFDLElBQS9CLENBQW9DLDBCQUFwQztNQVRpRCxDQUFuRDtNQVdBLEVBQUEsQ0FBRywyQkFBSCxFQUFnQyxTQUFBO1FBQzlCLFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQWEsRUFBYjtRQUNuQixZQUFZLENBQUMsU0FBYixHQUF5QixJQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsRUFBa0IsaUJBQWxCO2VBQ3pCLE1BQUEsQ0FBTyxZQUFZLENBQUMsT0FBYixDQUFBLENBQVAsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxjQUFwQztNQUg4QixDQUFoQzthQUtBLEVBQUEsQ0FBRyw4Q0FBSCxFQUFtRCxTQUFBO1FBQ2pELFlBQUEsR0FBbUIsSUFBQSxZQUFBLENBQWEsRUFBYjtRQUNuQixZQUFZLENBQUMsU0FBYixHQUF5QjtlQUN6QixNQUFBLENBQU8sWUFBWSxDQUFDLE9BQWIsQ0FBQSxDQUFQLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsVUFBcEM7TUFIaUQsQ0FBbkQ7SUE1Qm1CLENBQXJCO1dBaUNBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUE7TUFDeEIsVUFBQSxDQUFXLFNBQUE7ZUFBRyxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFhLEVBQWI7TUFBdEIsQ0FBWDtNQUVBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBO1FBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFBMEQsSUFBMUQ7UUFDQSxZQUFZLENBQUMsU0FBYixHQUF5QixJQUFJLENBQUMsSUFBTCxDQUFVLE1BQVYsRUFBa0IsU0FBbEI7ZUFDekIsTUFBQSxDQUFPLFlBQVksQ0FBQyxZQUFiLENBQUEsQ0FBUCxDQUFtQyxDQUFDLElBQXBDLENBQXlDLEtBQXpDO01BSHFDLENBQXZDO2FBS0EsRUFBQSxDQUFHLHFCQUFILEVBQTBCLFNBQUE7UUFDeEIsWUFBWSxDQUFDLFNBQWIsR0FBeUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLEVBQWtCLFNBQWxCO2VBQ3pCLE1BQUEsQ0FBTyxZQUFZLENBQUMsWUFBYixDQUFBLENBQVAsQ0FBbUMsQ0FBQyxJQUFwQyxDQUF5QyxXQUF6QztNQUZ3QixDQUExQjtJQVJ3QixDQUExQjtFQWxEdUIsQ0FBekI7QUFMQSIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5QdWJsaXNoRHJhZnQgPSByZXF1aXJlIFwiLi4vLi4vbGliL2NvbW1hbmRzL3B1Ymxpc2gtZHJhZnRcIlxuXG5wYXRoU2VwID0gXCJbL1xcXFxcXFxcXVwiXG5cbmRlc2NyaWJlIFwiUHVibGlzaERyYWZ0XCIsIC0+XG4gIFtlZGl0b3IsIHB1Ymxpc2hEcmFmdF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcImVtcHR5Lm1hcmtkb3duXCIpXG4gICAgcnVucyAtPiBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBkZXNjcmliZSBcIi50cmlnZ2VyXCIsIC0+XG4gICAgaXQgXCJhYm9ydCBwdWJsaXNoIGRyYWZ0IHdoZW4gbm90IGNvbmZpcm0gcHVibGlzaFwiLCAtPlxuICAgICAgcHVibGlzaERyYWZ0ID0gbmV3IFB1Ymxpc2hEcmFmdCh7fSlcbiAgICAgIHB1Ymxpc2hEcmFmdC5jb25maXJtUHVibGlzaCA9IC0+IHt9ICMgRG91YmxlIGNvbmZpcm1QdWJsaXNoXG5cbiAgICAgIHB1Ymxpc2hEcmFmdC50cmlnZ2VyKClcblxuICAgICAgZXhwZWN0KHB1Ymxpc2hEcmFmdC5kcmFmdFBhdGgpLnRvTWF0Y2goLy8vICN7cGF0aFNlcH1maXh0dXJlcyN7cGF0aFNlcH1lbXB0eVxcLm1hcmtkb3duJCAvLy8pXG4gICAgICBleHBlY3QocHVibGlzaERyYWZ0LnBvc3RQYXRoKS50b01hdGNoKC8vLyAje3BhdGhTZXB9XFxkezR9I3twYXRoU2VwfVxcZHs0fS1cXGRcXGQtXFxkXFxkLWVtcHR5XFwubWFya2Rvd24kIC8vLylcblxuICBkZXNjcmliZSBcIi5nZXRTbHVnXCIsIC0+XG4gICAgaXQgXCJnZXQgdGl0bGUgZnJvbSBmcm9udCBtYXR0ZXIgYnkgY29uZmlnXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJtYXJrZG93bi13cml0ZXIucHVibGlzaFJlbmFtZUJhc2VkT25UaXRsZVwiLCB0cnVlKVxuICAgICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICAtLS1cbiAgICAgIHRpdGxlOiBNYXJrZG93biBXcml0ZXJcbiAgICAgIC0tLVxuICAgICAgXCJcIlwiXG5cbiAgICAgIHB1Ymxpc2hEcmFmdCA9IG5ldyBQdWJsaXNoRHJhZnQoe30pXG4gICAgICBleHBlY3QocHVibGlzaERyYWZ0LmdldFNsdWcoKSkudG9CZShcIm1hcmtkb3duLXdyaXRlclwiKVxuXG4gICAgaXQgXCJnZXQgdGl0bGUgZnJvbSBmcm9udCBtYXR0ZXIgaWYgbm8gZHJhZnQgcGF0aFwiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICAtLS1cbiAgICAgIHRpdGxlOiBNYXJrZG93biBXcml0ZXIgKE5ldyBQb3N0KVxuICAgICAgLS0tXG4gICAgICBcIlwiXCJcblxuICAgICAgcHVibGlzaERyYWZ0ID0gbmV3IFB1Ymxpc2hEcmFmdCh7fSlcbiAgICAgIHB1Ymxpc2hEcmFmdC5kcmFmdFBhdGggPSB1bmRlZmluZWRcbiAgICAgIGV4cGVjdChwdWJsaXNoRHJhZnQuZ2V0U2x1ZygpKS50b0JlKFwibWFya2Rvd24td3JpdGVyLW5ldy1wb3N0XCIpXG5cbiAgICBpdCBcImdldCB0aXRsZSBmcm9tIGRyYWZ0IHBhdGhcIiwgLT5cbiAgICAgIHB1Ymxpc2hEcmFmdCA9IG5ldyBQdWJsaXNoRHJhZnQoe30pXG4gICAgICBwdWJsaXNoRHJhZnQuZHJhZnRQYXRoID0gcGF0aC5qb2luKFwidGVzdFwiLCBcIm5hbWUtb2YtcG9zdC5tZFwiKVxuICAgICAgZXhwZWN0KHB1Ymxpc2hEcmFmdC5nZXRTbHVnKCkpLnRvQmUoXCJuYW1lLW9mLXBvc3RcIilcblxuICAgIGl0IFwiZ2V0IG5ldy1wb3N0IHdoZW4gbm8gZnJvbnQgbWF0dGVyL2RyYWZ0IHBhdGhcIiwgLT5cbiAgICAgIHB1Ymxpc2hEcmFmdCA9IG5ldyBQdWJsaXNoRHJhZnQoe30pXG4gICAgICBwdWJsaXNoRHJhZnQuZHJhZnRQYXRoID0gdW5kZWZpbmVkXG4gICAgICBleHBlY3QocHVibGlzaERyYWZ0LmdldFNsdWcoKSkudG9CZShcIm5ldy1wb3N0XCIpXG5cbiAgZGVzY3JpYmUgXCIuZ2V0RXh0ZW5zaW9uXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPiBwdWJsaXNoRHJhZnQgPSBuZXcgUHVibGlzaERyYWZ0KHt9KVxuXG4gICAgaXQgXCJnZXQgZHJhZnQgcGF0aCBleHRuYW1lIGJ5IGNvbmZpZ1wiLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KFwibWFya2Rvd24td3JpdGVyLnB1Ymxpc2hLZWVwRmlsZUV4dG5hbWVcIiwgdHJ1ZSlcbiAgICAgIHB1Ymxpc2hEcmFmdC5kcmFmdFBhdGggPSBwYXRoLmpvaW4oXCJ0ZXN0XCIsIFwibmFtZS5tZFwiKVxuICAgICAgZXhwZWN0KHB1Ymxpc2hEcmFmdC5nZXRFeHRlbnNpb24oKSkudG9CZShcIi5tZFwiKVxuXG4gICAgaXQgXCJnZXQgZGVmYXVsdCBleHRuYW1lXCIsIC0+XG4gICAgICBwdWJsaXNoRHJhZnQuZHJhZnRQYXRoID0gcGF0aC5qb2luKFwidGVzdFwiLCBcIm5hbWUubWRcIilcbiAgICAgIGV4cGVjdChwdWJsaXNoRHJhZnQuZ2V0RXh0ZW5zaW9uKCkpLnRvQmUoXCIubWFya2Rvd25cIilcbiJdfQ==
