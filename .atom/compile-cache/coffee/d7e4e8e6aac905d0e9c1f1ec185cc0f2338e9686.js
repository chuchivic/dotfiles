(function() {
  var InsertImageFileView, config;

  config = require("../../lib/config");

  InsertImageFileView = require("../../lib/views/insert-image-file-view");

  describe("InsertImageFileView", function() {
    var editor, insertImageView, ref;
    ref = [], editor = ref[0], insertImageView = ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        return insertImageView = new InsertImageFileView({});
      });
    });
    describe(".isInSiteDir", function() {
      beforeEach(function() {
        return atom.config.set("markdown-writer.siteLocalDir", editor.getPath().replace("empty.markdown", ""));
      });
      it("check a file is in site local dir", function() {
        var fixture;
        fixture = (config.get("siteLocalDir")) + "/image.jpg";
        return expect(insertImageView.isInSiteDir(fixture)).toBe(true);
      });
      return it("check a file is not in site local dir", function() {
        var fixture;
        fixture = 'some/random/path/image.jpg';
        return expect(insertImageView.isInSiteDir(fixture)).toBe(false);
      });
    });
    describe(".resolveImagePath", function() {
      it("return empty image path", function() {
        var fixture;
        fixture = "";
        return expect(insertImageView.resolveImagePath(fixture)).toBe(fixture);
      });
      it("return URL image path", function() {
        var fixture;
        fixture = "https://assets-cdn.github.com/images/icons/emoji/octocat.png";
        return expect(insertImageView.resolveImagePath(fixture)).toBe(fixture);
      });
      it("return relative image path", function() {
        var fixture;
        insertImageView.editor = editor;
        fixture = editor.getPath().replace("empty.markdown", "octocat.png");
        return expect(insertImageView.resolveImagePath(fixture)).toBe(fixture);
      });
      return it("return absolute image path", function() {
        var expected, fixture;
        insertImageView.editor = editor;
        atom.config.set("markdown-writer.siteLocalDir", editor.getPath().replace("empty.markdown", ""));
        fixture = "octocat.png";
        expected = editor.getPath().replace("empty.markdown", "octocat.png");
        return expect(insertImageView.resolveImagePath(fixture)).toBe(expected);
      });
    });
    describe(".getCopiedImageDestPath", function() {
      it("return the local path with original filename", function() {
        var fixture;
        atom.config.set("markdown-writer.renameImageOnCopy", false);
        fixture = "images/icons/emoji/octocat.png";
        return expect(insertImageView.getCopiedImageDestPath(fixture, "name")).toMatch(/[\/\\]octocat\.png/);
      });
      return it("return the local path with new filename", function() {
        var fixture;
        atom.config.set("markdown-writer.renameImageOnCopy", true);
        fixture = "images/icons/emoji/octocat.png";
        expect(insertImageView.getCopiedImageDestPath(fixture, "New name")).toMatch(/[\/\\]new-name\.png/);
        fixture = "images/icons/emoji/octocat";
        expect(insertImageView.getCopiedImageDestPath(fixture, "New name")).toMatch(/[\/\\]new-name/);
        fixture = "images/icons/emoji/octocat.png";
        return expect(insertImageView.getCopiedImageDestPath(fixture, "")).toMatch(/[\/\\]octocat.png/);
      });
    });
    return describe(".generateImageSrc", function() {
      it("return empty image path", function() {
        var fixture;
        fixture = "";
        return expect(insertImageView.generateImageSrc(fixture)).toBe(fixture);
      });
      it("return URL image path", function() {
        var fixture;
        fixture = "https://assets-cdn.github.com/images/icons/emoji/octocat.png";
        return expect(insertImageView.generateImageSrc(fixture)).toBe(fixture);
      });
      it("return relative image path from file", function() {
        var fixture;
        insertImageView.editor = editor;
        atom.config.set("markdown-writer.relativeImagePath", true);
        fixture = editor.getPath().replace("empty.markdown", "octocat.png");
        return expect(insertImageView.generateImageSrc(fixture)).toBe("octocat.png");
      });
      it("return relative image path from site", function() {
        var fixture;
        atom.config.set("markdown-writer.siteLocalDir", "/assets/images/icons/emoji");
        fixture = "/assets/images/icons/emoji/octocat.png";
        return expect(insertImageView.generateImageSrc(fixture)).toBe("octocat.png");
      });
      return it("return image dir path using config template", function() {
        var expected, fixture;
        insertImageView.display();
        fixture = "octocat.png";
        expected = /^\/images\/\d{4}\/\d\d\/octocat\.png$/;
        return expect(insertImageView.generateImageSrc(fixture)).toMatch(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvdmlld3MvaW5zZXJ0LWltYWdlLWZpbGUtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFDVCxtQkFBQSxHQUFzQixPQUFBLENBQVEsd0NBQVI7O0VBRXRCLFFBQUEsQ0FBUyxxQkFBVCxFQUFnQyxTQUFBO0FBQzlCLFFBQUE7SUFBQSxNQUE0QixFQUE1QixFQUFDLGVBQUQsRUFBUztJQUVULFVBQUEsQ0FBVyxTQUFBO01BQ1QsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGdCQUFwQjtNQUFILENBQWhCO2FBRUEsSUFBQSxDQUFLLFNBQUE7UUFDSCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO2VBQ1QsZUFBQSxHQUFzQixJQUFBLG1CQUFBLENBQW9CLEVBQXBCO01BRm5CLENBQUw7SUFIUyxDQUFYO0lBT0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtNQUN2QixVQUFBLENBQVcsU0FBQTtlQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw4QkFBaEIsRUFBZ0QsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFnQixDQUFDLE9BQWpCLENBQXlCLGdCQUF6QixFQUEyQyxFQUEzQyxDQUFoRDtNQURTLENBQVg7TUFHQSxFQUFBLENBQUcsbUNBQUgsRUFBd0MsU0FBQTtBQUN0QyxZQUFBO1FBQUEsT0FBQSxHQUFZLENBQUMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxjQUFYLENBQUQsQ0FBQSxHQUE0QjtlQUN4QyxNQUFBLENBQU8sZUFBZSxDQUFDLFdBQWhCLENBQTRCLE9BQTVCLENBQVAsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxJ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T0FBaEIsQ0FBQTtRQUNBLE9BQUEsR0FBVTtRQUNWLFFBQUEsR0FBVztlQUNYLE1BQUEsQ0FBTyxlQUFlLENBQUMsZ0JBQWhCLENBQWlDLE9BQWpDLENBQVAsQ0FBaUQsQ0FBQyxPQUFsRCxDQUEwRCxRQUExRDtNQUpnRCxDQUFsRDtJQXRCNEIsQ0FBOUI7RUE5RDhCLENBQWhDO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJjb25maWcgPSByZXF1aXJlIFwiLi4vLi4vbGliL2NvbmZpZ1wiXG5JbnNlcnRJbWFnZUZpbGVWaWV3ID0gcmVxdWlyZSBcIi4uLy4uL2xpYi92aWV3cy9pbnNlcnQtaW1hZ2UtZmlsZS12aWV3XCJcblxuZGVzY3JpYmUgXCJJbnNlcnRJbWFnZUZpbGVWaWV3XCIsIC0+XG4gIFtlZGl0b3IsIGluc2VydEltYWdlVmlld10gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcImVtcHR5Lm1hcmtkb3duXCIpXG5cbiAgICBydW5zIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGluc2VydEltYWdlVmlldyA9IG5ldyBJbnNlcnRJbWFnZUZpbGVWaWV3KHt9KVxuXG4gIGRlc2NyaWJlIFwiLmlzSW5TaXRlRGlyXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KFwibWFya2Rvd24td3JpdGVyLnNpdGVMb2NhbERpclwiLCBlZGl0b3IuZ2V0UGF0aCgpLnJlcGxhY2UoXCJlbXB0eS5tYXJrZG93blwiLCBcIlwiKSlcblxuICAgIGl0IFwiY2hlY2sgYSBmaWxlIGlzIGluIHNpdGUgbG9jYWwgZGlyXCIsIC0+XG4gICAgICBmaXh0dXJlID0gXCIje2NvbmZpZy5nZXQoXCJzaXRlTG9jYWxEaXJcIil9L2ltYWdlLmpwZ1wiXG4gICAgICBleHBlY3QoaW5zZXJ0SW1hZ2VWaWV3LmlzSW5TaXRlRGlyKGZpeHR1cmUpKS50b0JlKHRydWUpXG5cbiAgICBpdCBcImNoZWNrIGEgZmlsZSBpcyBub3QgaW4gc2l0ZSBsb2NhbCBkaXJcIiwgLT5cbiAgICAgIGZpeHR1cmUgPSAnc29tZS9yYW5kb20vcGF0aC9pbWFnZS5qcGcnXG4gICAgICBleHBlY3QoaW5zZXJ0SW1hZ2VWaWV3LmlzSW5TaXRlRGlyKGZpeHR1cmUpKS50b0JlKGZhbHNlKVxuXG4gIGRlc2NyaWJlIFwiLnJlc29sdmVJbWFnZVBhdGhcIiwgLT5cbiAgICBpdCBcInJldHVybiBlbXB0eSBpbWFnZSBwYXRoXCIsIC0+XG4gICAgICBmaXh0dXJlID0gXCJcIlxuICAgICAgZXhwZWN0KGluc2VydEltYWdlVmlldy5yZXNvbHZlSW1hZ2VQYXRoKGZpeHR1cmUpKS50b0JlKGZpeHR1cmUpXG5cbiAgICBpdCBcInJldHVybiBVUkwgaW1hZ2UgcGF0aFwiLCAtPlxuICAgICAgZml4dHVyZSA9IFwiaHR0cHM6Ly9hc3NldHMtY2RuLmdpdGh1Yi5jb20vaW1hZ2VzL2ljb25zL2Vtb2ppL29jdG9jYXQucG5nXCJcbiAgICAgIGV4cGVjdChpbnNlcnRJbWFnZVZpZXcucmVzb2x2ZUltYWdlUGF0aChmaXh0dXJlKSkudG9CZShmaXh0dXJlKVxuXG4gICAgaXQgXCJyZXR1cm4gcmVsYXRpdmUgaW1hZ2UgcGF0aFwiLCAtPlxuICAgICAgaW5zZXJ0SW1hZ2VWaWV3LmVkaXRvciA9IGVkaXRvclxuICAgICAgZml4dHVyZSA9IGVkaXRvci5nZXRQYXRoKCkucmVwbGFjZShcImVtcHR5Lm1hcmtkb3duXCIsIFwib2N0b2NhdC5wbmdcIilcbiAgICAgIGV4cGVjdChpbnNlcnRJbWFnZVZpZXcucmVzb2x2ZUltYWdlUGF0aChmaXh0dXJlKSkudG9CZShmaXh0dXJlKVxuXG4gICAgaXQgXCJyZXR1cm4gYWJzb2x1dGUgaW1hZ2UgcGF0aFwiLCAtPlxuICAgICAgaW5zZXJ0SW1hZ2VWaWV3LmVkaXRvciA9IGVkaXRvclxuICAgICAgYXRvbS5jb25maWcuc2V0KFwibWFya2Rvd24td3JpdGVyLnNpdGVMb2NhbERpclwiLCBlZGl0b3IuZ2V0UGF0aCgpLnJlcGxhY2UoXCJlbXB0eS5tYXJrZG93blwiLCBcIlwiKSlcblxuICAgICAgZml4dHVyZSA9IFwib2N0b2NhdC5wbmdcIlxuICAgICAgZXhwZWN0ZWQgPSBlZGl0b3IuZ2V0UGF0aCgpLnJlcGxhY2UoXCJlbXB0eS5tYXJrZG93blwiLCBcIm9jdG9jYXQucG5nXCIpXG4gICAgICBleHBlY3QoaW5zZXJ0SW1hZ2VWaWV3LnJlc29sdmVJbWFnZVBhdGgoZml4dHVyZSkpLnRvQmUoZXhwZWN0ZWQpXG5cbiAgZGVzY3JpYmUgXCIuZ2V0Q29waWVkSW1hZ2VEZXN0UGF0aFwiLCAtPlxuICAgIGl0IFwicmV0dXJuIHRoZSBsb2NhbCBwYXRoIHdpdGggb3JpZ2luYWwgZmlsZW5hbWVcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5yZW5hbWVJbWFnZU9uQ29weVwiLCBmYWxzZSlcbiAgICAgIGZpeHR1cmUgPSBcImltYWdlcy9pY29ucy9lbW9qaS9vY3RvY2F0LnBuZ1wiXG4gICAgICBleHBlY3QoaW5zZXJ0SW1hZ2VWaWV3LmdldENvcGllZEltYWdlRGVzdFBhdGgoZml4dHVyZSwgXCJuYW1lXCIpKS50b01hdGNoKC9bXFwvXFxcXF1vY3RvY2F0XFwucG5nLylcblxuICAgIGl0IFwicmV0dXJuIHRoZSBsb2NhbCBwYXRoIHdpdGggbmV3IGZpbGVuYW1lXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJtYXJrZG93bi13cml0ZXIucmVuYW1lSW1hZ2VPbkNvcHlcIiwgdHJ1ZSlcbiAgICAgICMgbm9ybWFsIGNhc2VcbiAgICAgIGZpeHR1cmUgPSBcImltYWdlcy9pY29ucy9lbW9qaS9vY3RvY2F0LnBuZ1wiXG4gICAgICBleHBlY3QoaW5zZXJ0SW1hZ2VWaWV3LmdldENvcGllZEltYWdlRGVzdFBhdGgoZml4dHVyZSwgXCJOZXcgbmFtZVwiKSkudG9NYXRjaCgvW1xcL1xcXFxdbmV3LW5hbWVcXC5wbmcvKVxuICAgICAgIyBubyBleHRlbnNpb25cbiAgICAgIGZpeHR1cmUgPSBcImltYWdlcy9pY29ucy9lbW9qaS9vY3RvY2F0XCJcbiAgICAgIGV4cGVjdChpbnNlcnRJbWFnZVZpZXcuZ2V0Q29waWVkSW1hZ2VEZXN0UGF0aChmaXh0dXJlLCBcIk5ldyBuYW1lXCIpKS50b01hdGNoKC9bXFwvXFxcXF1uZXctbmFtZS8pXG4gICAgICAjIG5vIGFsdCB0ZXh0IHNldFxuICAgICAgZml4dHVyZSA9IFwiaW1hZ2VzL2ljb25zL2Vtb2ppL29jdG9jYXQucG5nXCJcbiAgICAgIGV4cGVjdChpbnNlcnRJbWFnZVZpZXcuZ2V0Q29waWVkSW1hZ2VEZXN0UGF0aChmaXh0dXJlLCBcIlwiKSkudG9NYXRjaCgvW1xcL1xcXFxdb2N0b2NhdC5wbmcvKVxuXG4gIGRlc2NyaWJlIFwiLmdlbmVyYXRlSW1hZ2VTcmNcIiwgLT5cbiAgICBpdCBcInJldHVybiBlbXB0eSBpbWFnZSBwYXRoXCIsIC0+XG4gICAgICBmaXh0dXJlID0gXCJcIlxuICAgICAgZXhwZWN0KGluc2VydEltYWdlVmlldy5nZW5lcmF0ZUltYWdlU3JjKGZpeHR1cmUpKS50b0JlKGZpeHR1cmUpXG5cbiAgICBpdCBcInJldHVybiBVUkwgaW1hZ2UgcGF0aFwiLCAtPlxuICAgICAgZml4dHVyZSA9IFwiaHR0cHM6Ly9hc3NldHMtY2RuLmdpdGh1Yi5jb20vaW1hZ2VzL2ljb25zL2Vtb2ppL29jdG9jYXQucG5nXCJcbiAgICAgIGV4cGVjdChpbnNlcnRJbWFnZVZpZXcuZ2VuZXJhdGVJbWFnZVNyYyhmaXh0dXJlKSkudG9CZShmaXh0dXJlKVxuXG4gICAgaXQgXCJyZXR1cm4gcmVsYXRpdmUgaW1hZ2UgcGF0aCBmcm9tIGZpbGVcIiwgLT5cbiAgICAgIGluc2VydEltYWdlVmlldy5lZGl0b3IgPSBlZGl0b3JcbiAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5yZWxhdGl2ZUltYWdlUGF0aFwiLCB0cnVlKVxuXG4gICAgICBmaXh0dXJlID0gZWRpdG9yLmdldFBhdGgoKS5yZXBsYWNlKFwiZW1wdHkubWFya2Rvd25cIiwgXCJvY3RvY2F0LnBuZ1wiKVxuICAgICAgZXhwZWN0KGluc2VydEltYWdlVmlldy5nZW5lcmF0ZUltYWdlU3JjKGZpeHR1cmUpKS50b0JlKFwib2N0b2NhdC5wbmdcIilcblxuICAgIGl0IFwicmV0dXJuIHJlbGF0aXZlIGltYWdlIHBhdGggZnJvbSBzaXRlXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJtYXJrZG93bi13cml0ZXIuc2l0ZUxvY2FsRGlyXCIsIFwiL2Fzc2V0cy9pbWFnZXMvaWNvbnMvZW1vamlcIilcblxuICAgICAgZml4dHVyZSA9IFwiL2Fzc2V0cy9pbWFnZXMvaWNvbnMvZW1vamkvb2N0b2NhdC5wbmdcIlxuICAgICAgZXhwZWN0KGluc2VydEltYWdlVmlldy5nZW5lcmF0ZUltYWdlU3JjKGZpeHR1cmUpKS50b0JlKFwib2N0b2NhdC5wbmdcIilcblxuICAgIGl0IFwicmV0dXJuIGltYWdlIGRpciBwYXRoIHVzaW5nIGNvbmZpZyB0ZW1wbGF0ZVwiLCAtPlxuICAgICAgaW5zZXJ0SW1hZ2VWaWV3LmRpc3BsYXkoKVxuICAgICAgZml4dHVyZSA9IFwib2N0b2NhdC5wbmdcIlxuICAgICAgZXhwZWN0ZWQgPSAvLy8gXiBcXC9pbWFnZXNcXC9cXGR7NH1cXC9cXGRcXGRcXC9vY3RvY2F0XFwucG5nICQgLy8vXG4gICAgICBleHBlY3QoaW5zZXJ0SW1hZ2VWaWV3LmdlbmVyYXRlSW1hZ2VTcmMoZml4dHVyZSkpLnRvTWF0Y2goZXhwZWN0ZWQpXG4iXX0=
