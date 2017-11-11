(function() {
  var NewDraftView, NewFileView, NewPostView, path;

  path = require("path");

  NewFileView = require("../../lib/views/new-file-view");

  NewDraftView = require("../../lib/views/new-draft-view");

  NewPostView = require("../../lib/views/new-post-view");

  describe("NewFileView", function() {
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
    });
    describe("NewFileView", function() {
      var newFileView;
      newFileView = null;
      beforeEach(function() {
        return newFileView = new NewFileView({});
      });
      return describe('.getFileName', function() {
        return it("get filename in hexo format", function() {
          atom.config.set("markdown-writer.newFileFileName", "file-{slug}{extension}");
          atom.config.set("markdown-writer.fileExtension", ".md");
          newFileView.titleEditor.setText("Hexo format");
          return expect(newFileView.getFileName()).toBe("file-hexo-format.md");
        });
      });
    });
    describe("NewDraftView", function() {
      var newDraftView;
      newDraftView = null;
      beforeEach(function() {
        return newDraftView = new NewDraftView({});
      });
      describe("class methods", function() {
        return it("override correctly", function() {
          expect(NewDraftView.fileType).toBe("Draft");
          expect(NewDraftView.pathConfig).toBe("siteDraftsDir");
          return expect(NewDraftView.fileNameConfig).toBe("newDraftFileName");
        });
      });
      describe(".display", function() {
        return it('display correct message', function() {
          newDraftView.display();
          newDraftView.dateEditor.setText("2015-08-23 11:19");
          newDraftView.titleEditor.setText("Draft Title");
          return expect(newDraftView.message.text()).toBe("Site Directory: " + (atom.project.getPaths()[0]) + "\nCreate Draft At: " + (path.join("_drafts", "draft-title.markdown")));
        });
      });
      return describe(".getFrontMatter", function() {
        return it("get the correct front matter", function() {
          var frontMatter;
          newDraftView.dateEditor.setText("2015-08-23 11:19");
          newDraftView.titleEditor.setText("Draft Title");
          frontMatter = newDraftView.getFrontMatter();
          expect(frontMatter.layout).toBe("post");
          expect(frontMatter.published).toBe(false);
          expect(frontMatter.title).toBe("Draft Title");
          expect(frontMatter.slug).toBe("draft-title");
          return expect(frontMatter.date).toBe("2015-08-23 11:19");
        });
      });
    });
    return describe("NewPostView", function() {
      var newPostView;
      newPostView = null;
      beforeEach(function() {
        return newPostView = new NewPostView({});
      });
      describe("class methods", function() {
        return it("override correctly", function() {
          expect(NewPostView.fileType).toBe("Post");
          expect(NewPostView.pathConfig).toBe("sitePostsDir");
          return expect(NewPostView.fileNameConfig).toBe("newPostFileName");
        });
      });
      describe(".display", function() {
        return it('display correct message', function() {
          newPostView.display();
          newPostView.dateEditor.setText("2015-08-23 11:19");
          newPostView.titleEditor.setText("Post's Title");
          return expect(newPostView.message.text()).toBe("Site Directory: " + (atom.project.getPaths()[0]) + "\nCreate Post At: " + (path.join("_posts", "2015", "2015-08-23-post-s-title.markdown")));
        });
      });
      return describe(".getFrontMatter", function() {
        return it("get the correct front matter", function() {
          var frontMatter;
          newPostView.dateEditor.setText("2015-08-24 11:19");
          newPostView.titleEditor.setText("Post's Title: Subtitle");
          frontMatter = newPostView.getFrontMatter();
          expect(frontMatter.layout).toBe("post");
          expect(frontMatter.published).toBe(true);
          expect(frontMatter.title).toBe("Post's Title: Subtitle");
          expect(frontMatter.slug).toBe("post-s-title-subtitle");
          return expect(frontMatter.date).toBe("2015-08-24 11:19");
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvdmlld3MvbmV3LWZpbGUtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsK0JBQVI7O0VBQ2QsWUFBQSxHQUFlLE9BQUEsQ0FBUSxnQ0FBUjs7RUFDZixXQUFBLEdBQWMsT0FBQSxDQUFRLCtCQUFSOztFQUVkLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7SUFDdEIsVUFBQSxDQUFXLFNBQUE7YUFDVCxlQUFBLENBQWdCLFNBQUE7ZUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsZ0JBQXBCO01BQUgsQ0FBaEI7SUFEUyxDQUFYO0lBR0EsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtBQUN0QixVQUFBO01BQUEsV0FBQSxHQUFjO01BRWQsVUFBQSxDQUFXLFNBQUE7ZUFDVCxXQUFBLEdBQWtCLElBQUEsV0FBQSxDQUFZLEVBQVo7TUFEVCxDQUFYO2FBR0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtlQUN2QixFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTtVQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLEVBQW1ELHdCQUFuRDtVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsRUFBaUQsS0FBakQ7VUFFQSxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQXhCLENBQWdDLGFBQWhDO2lCQUNBLE1BQUEsQ0FBTyxXQUFXLENBQUMsV0FBWixDQUFBLENBQVAsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxxQkFBdkM7UUFMZ0MsQ0FBbEM7TUFEdUIsQ0FBekI7SUFOc0IsQ0FBeEI7SUFjQSxRQUFBLENBQVMs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LENBQXhCO0VBdERzQixDQUF4QjtBQUxBIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcbk5ld0ZpbGVWaWV3ID0gcmVxdWlyZSBcIi4uLy4uL2xpYi92aWV3cy9uZXctZmlsZS12aWV3XCJcbk5ld0RyYWZ0VmlldyA9IHJlcXVpcmUgXCIuLi8uLi9saWIvdmlld3MvbmV3LWRyYWZ0LXZpZXdcIlxuTmV3UG9zdFZpZXcgPSByZXF1aXJlIFwiLi4vLi4vbGliL3ZpZXdzL25ldy1wb3N0LXZpZXdcIlxuXG5kZXNjcmliZSBcIk5ld0ZpbGVWaWV3XCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcImVtcHR5Lm1hcmtkb3duXCIpXG5cbiAgZGVzY3JpYmUgXCJOZXdGaWxlVmlld1wiLCAtPlxuICAgIG5ld0ZpbGVWaWV3ID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgbmV3RmlsZVZpZXcgPSBuZXcgTmV3RmlsZVZpZXcoe30pXG5cbiAgICBkZXNjcmliZSAnLmdldEZpbGVOYW1lJywgLT5cbiAgICAgIGl0IFwiZ2V0IGZpbGVuYW1lIGluIGhleG8gZm9ybWF0XCIsIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5uZXdGaWxlRmlsZU5hbWVcIiwgXCJmaWxlLXtzbHVnfXtleHRlbnNpb259XCIpXG4gICAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5maWxlRXh0ZW5zaW9uXCIsIFwiLm1kXCIpXG5cbiAgICAgICAgbmV3RmlsZVZpZXcudGl0bGVFZGl0b3Iuc2V0VGV4dChcIkhleG8gZm9ybWF0XCIpXG4gICAgICAgIGV4cGVjdChuZXdGaWxlVmlldy5nZXRGaWxlTmFtZSgpKS50b0JlKFwiZmlsZS1oZXhvLWZvcm1hdC5tZFwiKVxuXG4gIGRlc2NyaWJlIFwiTmV3RHJhZnRWaWV3XCIsIC0+XG4gICAgbmV3RHJhZnRWaWV3ID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgbmV3RHJhZnRWaWV3ID0gbmV3IE5ld0RyYWZ0Vmlldyh7fSlcblxuICAgIGRlc2NyaWJlIFwiY2xhc3MgbWV0aG9kc1wiLCAtPlxuICAgICAgaXQgXCJvdmVycmlkZSBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZXhwZWN0KE5ld0RyYWZ0Vmlldy5maWxlVHlwZSkudG9CZShcIkRyYWZ0XCIpXG4gICAgICAgIGV4cGVjdChOZXdEcmFmdFZpZXcucGF0aENvbmZpZykudG9CZShcInNpdGVEcmFmdHNEaXJcIilcbiAgICAgICAgZXhwZWN0KE5ld0RyYWZ0Vmlldy5maWxlTmFtZUNvbmZpZykudG9CZShcIm5ld0RyYWZ0RmlsZU5hbWVcIilcblxuICAgIGRlc2NyaWJlIFwiLmRpc3BsYXlcIiwgLT5cbiAgICAgIGl0ICdkaXNwbGF5IGNvcnJlY3QgbWVzc2FnZScsIC0+XG4gICAgICAgIG5ld0RyYWZ0Vmlldy5kaXNwbGF5KClcblxuICAgICAgICBuZXdEcmFmdFZpZXcuZGF0ZUVkaXRvci5zZXRUZXh0KFwiMjAxNS0wOC0yMyAxMToxOVwiKVxuICAgICAgICBuZXdEcmFmdFZpZXcudGl0bGVFZGl0b3Iuc2V0VGV4dChcIkRyYWZ0IFRpdGxlXCIpXG5cbiAgICAgICAgZXhwZWN0KG5ld0RyYWZ0Vmlldy5tZXNzYWdlLnRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgICAgU2l0ZSBEaXJlY3Rvcnk6ICN7YXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF19XG4gICAgICAgIENyZWF0ZSBEcmFmdCBBdDogI3twYXRoLmpvaW4oXCJfZHJhZnRzXCIsIFwiZHJhZnQtdGl0bGUubWFya2Rvd25cIil9XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCIuZ2V0RnJvbnRNYXR0ZXJcIiwgLT5cbiAgICAgIGl0IFwiZ2V0IHRoZSBjb3JyZWN0IGZyb250IG1hdHRlclwiLCAtPlxuICAgICAgICBuZXdEcmFmdFZpZXcuZGF0ZUVkaXRvci5zZXRUZXh0KFwiMjAxNS0wOC0yMyAxMToxOVwiKVxuICAgICAgICBuZXdEcmFmdFZpZXcudGl0bGVFZGl0b3Iuc2V0VGV4dChcIkRyYWZ0IFRpdGxlXCIpXG5cbiAgICAgICAgZnJvbnRNYXR0ZXIgPSBuZXdEcmFmdFZpZXcuZ2V0RnJvbnRNYXR0ZXIoKVxuICAgICAgICBleHBlY3QoZnJvbnRNYXR0ZXIubGF5b3V0KS50b0JlKFwicG9zdFwiKVxuICAgICAgICBleHBlY3QoZnJvbnRNYXR0ZXIucHVibGlzaGVkKS50b0JlKGZhbHNlKVxuICAgICAgICBleHBlY3QoZnJvbnRNYXR0ZXIudGl0bGUpLnRvQmUoXCJEcmFmdCBUaXRsZVwiKVxuICAgICAgICBleHBlY3QoZnJvbnRNYXR0ZXIuc2x1ZykudG9CZShcImRyYWZ0LXRpdGxlXCIpXG4gICAgICAgIGV4cGVjdChmcm9udE1hdHRlci5kYXRlKS50b0JlKFwiMjAxNS0wOC0yMyAxMToxOVwiKVxuXG4gIGRlc2NyaWJlIFwiTmV3UG9zdFZpZXdcIiwgLT5cbiAgICBuZXdQb3N0VmlldyA9IG51bGxcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIG5ld1Bvc3RWaWV3ID0gbmV3IE5ld1Bvc3RWaWV3KHt9KVxuXG4gICAgZGVzY3JpYmUgXCJjbGFzcyBtZXRob2RzXCIsIC0+XG4gICAgICBpdCBcIm92ZXJyaWRlIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBleHBlY3QoTmV3UG9zdFZpZXcuZmlsZVR5cGUpLnRvQmUoXCJQb3N0XCIpXG4gICAgICAgIGV4cGVjdChOZXdQb3N0Vmlldy5wYXRoQ29uZmlnKS50b0JlKFwic2l0ZVBvc3RzRGlyXCIpXG4gICAgICAgIGV4cGVjdChOZXdQb3N0Vmlldy5maWxlTmFtZUNvbmZpZykudG9CZShcIm5ld1Bvc3RGaWxlTmFtZVwiKVxuXG4gICAgZGVzY3JpYmUgXCIuZGlzcGxheVwiLCAtPlxuICAgICAgaXQgJ2Rpc3BsYXkgY29ycmVjdCBtZXNzYWdlJywgLT5cbiAgICAgICAgbmV3UG9zdFZpZXcuZGlzcGxheSgpXG5cbiAgICAgICAgbmV3UG9zdFZpZXcuZGF0ZUVkaXRvci5zZXRUZXh0KFwiMjAxNS0wOC0yMyAxMToxOVwiKVxuICAgICAgICBuZXdQb3N0Vmlldy50aXRsZUVkaXRvci5zZXRUZXh0KFwiUG9zdCdzIFRpdGxlXCIpXG5cbiAgICAgICAgZXhwZWN0KG5ld1Bvc3RWaWV3Lm1lc3NhZ2UudGV4dCgpKS50b0JlIFwiXCJcIlxuICAgICAgICBTaXRlIERpcmVjdG9yeTogI3thdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXX1cbiAgICAgICAgQ3JlYXRlIFBvc3QgQXQ6ICN7cGF0aC5qb2luKFwiX3Bvc3RzXCIsIFwiMjAxNVwiLCBcIjIwMTUtMDgtMjMtcG9zdC1zLXRpdGxlLm1hcmtkb3duXCIpfVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiLmdldEZyb250TWF0dGVyXCIsIC0+XG4gICAgICBpdCBcImdldCB0aGUgY29ycmVjdCBmcm9udCBtYXR0ZXJcIiwgLT5cbiAgICAgICAgbmV3UG9zdFZpZXcuZGF0ZUVkaXRvci5zZXRUZXh0KFwiMjAxNS0wOC0yNCAxMToxOVwiKVxuICAgICAgICBuZXdQb3N0Vmlldy50aXRsZUVkaXRvci5zZXRUZXh0KFwiUG9zdCdzIFRpdGxlOiBTdWJ0aXRsZVwiKVxuXG4gICAgICAgIGZyb250TWF0dGVyID0gbmV3UG9zdFZpZXcuZ2V0RnJvbnRNYXR0ZXIoKVxuICAgICAgICBleHBlY3QoZnJvbnRNYXR0ZXIubGF5b3V0KS50b0JlKFwicG9zdFwiKVxuICAgICAgICBleHBlY3QoZnJvbnRNYXR0ZXIucHVibGlzaGVkKS50b0JlKHRydWUpXG4gICAgICAgIGV4cGVjdChmcm9udE1hdHRlci50aXRsZSkudG9CZShcIlBvc3QncyBUaXRsZTogU3VidGl0bGVcIilcbiAgICAgICAgZXhwZWN0KGZyb250TWF0dGVyLnNsdWcpLnRvQmUoXCJwb3N0LXMtdGl0bGUtc3VidGl0bGVcIilcbiAgICAgICAgZXhwZWN0KGZyb250TWF0dGVyLmRhdGUpLnRvQmUoXCIyMDE1LTA4LTI0IDExOjE5XCIpXG4iXX0=