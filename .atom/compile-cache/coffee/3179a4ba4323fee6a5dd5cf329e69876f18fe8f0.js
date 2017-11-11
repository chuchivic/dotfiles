(function() {
  var GitOpenChangedFiles, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  GitOpenChangedFiles = require('../../lib/models/git-open-changed-files');

  describe("GitOpenChangedFiles", function() {
    beforeEach(function() {
      return spyOn(atom.workspace, 'open');
    });
    describe("when file is modified", function() {
      beforeEach(function() {
        spyOn(git, 'status').andReturn(Promise.resolve([' M file1.txt']));
        return waitsForPromise(function() {
          return GitOpenChangedFiles(repo);
        });
      });
      return it("opens changed file", function() {
        return expect(atom.workspace.open).toHaveBeenCalledWith("file1.txt");
      });
    });
    describe("when file is added", function() {
      beforeEach(function() {
        spyOn(git, 'status').andReturn(Promise.resolve(['?? file2.txt']));
        return waitsForPromise(function() {
          return GitOpenChangedFiles(repo);
        });
      });
      return it("opens added file", function() {
        return expect(atom.workspace.open).toHaveBeenCalledWith("file2.txt");
      });
    });
    return describe("when file is renamed", function() {
      beforeEach(function() {
        spyOn(git, 'status').andReturn(Promise.resolve(['R  file3.txt']));
        return waitsForPromise(function() {
          return GitOpenChangedFiles(repo);
        });
      });
      return it("opens renamed file", function() {
        return expect(atom.workspace.open).toHaveBeenCalledWith("file3.txt");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LW9wZW4tY2hhbmdlZC1maWxlcy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNMLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlDQUFSOztFQUV0QixRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQTtJQUM5QixVQUFBLENBQVcsU0FBQTthQUNULEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QjtJQURTLENBQVg7SUFHQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQTtNQUNoQyxVQUFBLENBQVcsU0FBQTtRQUNULEtBQUEsQ0FBTSxHQUFOLEVBQVcsUUFBWCxDQUFvQixDQUFDLFNBQXJCLENBQStCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLENBQUMsY0FBRCxDQUFoQixDQUEvQjtlQUNBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxtQkFBQSxDQUFvQixJQUFwQjtRQUFILENBQWhCO01BRlMsQ0FBWDthQUlBLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBO2VBQ3ZCLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQXRCLENBQTJCLENBQUMsb0JBQTVCLENBQWlELFdBQWpEO01BRHVCLENBQXpCO0lBTGdDLENBQWxDO0lBUUEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUE7TUFDN0IsVUFBQSxDQUFXLFNBQUE7UUFDVCxLQUFBLENBQU0sR0FBTixFQUFXLFFBQVgsQ0FBb0IsQ0FBQyxTQUFyQixDQUErQixPQUFPLENBQUMsT0FBUixDQUFnQixDQUFDLGNBQUQsQ0FBaEIsQ0FBL0I7ZUFDQSxlQUFBLENBQWdCLFNBQUE7aUJBQUcsbUJBQUEsQ0FBb0IsSUFBcEI7UUFBSCxDQUFoQjtNQUZTLENBQVg7YUFJQSxFQUFBLENBQUcsa0JBQUgsRUFBdUIsU0FBQTtlQUNyQixNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUF0QixDQUEyQixDQUFDLG9CQUE1QixDQUFpRCxXQUFqRDtNQURxQixDQUF2QjtJQUw2QixDQUEvQjtXQVFBLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBO01BQy9CLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsS0FBQSxDQUFNLEdBQU4sRUFBVyxRQUFYLENBQW9CLENBQUMsU0FBckIsQ0FBK0IsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQyxjQUFELENBQWhCLENBQS9CO2VBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLG1CQUFBLENBQW9CLElBQXBCO1FBQUgsQ0FBaEI7TUFGUyxDQUFYO2FBSUEsRUFBQSxDQUFHLG9CQUFILEVBQXlCLFNBQUE7ZUFDdkIsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQyxvQkFBNUIsQ0FBaUQsV0FBakQ7TUFEdUIsQ0FBekI7SUFMK0IsQ0FBakM7RUFwQjhCLENBQWhDO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5HaXRPcGVuQ2hhbmdlZEZpbGVzID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtb3Blbi1jaGFuZ2VkLWZpbGVzJ1xuXG5kZXNjcmliZSBcIkdpdE9wZW5DaGFuZ2VkRmlsZXNcIiwgLT5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGZpbGUgaXMgbW9kaWZpZWRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihnaXQsICdzdGF0dXMnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIFsnIE0gZmlsZTEudHh0J11cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRPcGVuQ2hhbmdlZEZpbGVzKHJlcG8pXG5cbiAgICBpdCBcIm9wZW5zIGNoYW5nZWQgZmlsZVwiLCAtPlxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFwiZmlsZTEudHh0XCIpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGZpbGUgaXMgYWRkZWRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihnaXQsICdzdGF0dXMnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIFsnPz8gZmlsZTIudHh0J11cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRPcGVuQ2hhbmdlZEZpbGVzKHJlcG8pXG5cbiAgICBpdCBcIm9wZW5zIGFkZGVkIGZpbGVcIiwgLT5cbiAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChcImZpbGUyLnR4dFwiKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBmaWxlIGlzIHJlbmFtZWRcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihnaXQsICdzdGF0dXMnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIFsnUiAgZmlsZTMudHh0J11cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBHaXRPcGVuQ2hhbmdlZEZpbGVzKHJlcG8pXG5cbiAgICBpdCBcIm9wZW5zIHJlbmFtZWQgZmlsZVwiLCAtPlxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFwiZmlsZTMudHh0XCIpXG4iXX0=
