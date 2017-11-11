(function() {
  var GitRemove, currentPane, git, pathToRepoFile, ref, repo, textEditor,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile, textEditor = ref.textEditor, currentPane = ref.currentPane;

  GitRemove = require('../../lib/models/git-remove');

  describe("GitRemove", function() {
    beforeEach(function() {
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn(textEditor);
      spyOn(atom.workspace, 'getActivePaneItem').andReturn(currentPane);
      return spyOn(git, 'cmd').andReturn(Promise.resolve(repo.relativize(pathToRepoFile)));
    });
    describe("when the file has been modified and user confirms", function() {
      beforeEach(function() {
        spyOn(window, 'confirm').andReturn(true);
        return spyOn(repo, 'isPathModified').andReturn(true);
      });
      describe("when there is a current file open", function() {
        return it("calls git.cmd with 'rm' and " + pathToRepoFile, function() {
          var args, ref1;
          GitRemove(repo);
          args = git.cmd.mostRecentCall.args[0];
          expect(indexOf.call(args, 'rm') >= 0).toBe(true);
          return expect((ref1 = repo.relativize(pathToRepoFile), indexOf.call(args, ref1) >= 0)).toBe(true);
        });
      });
      return describe("when 'showSelector' is set to true", function() {
        return it("calls git.cmd with '*' instead of " + pathToRepoFile, function() {
          var args;
          GitRemove(repo, {
            showSelector: true
          });
          args = git.cmd.mostRecentCall.args[0];
          return expect(indexOf.call(args, '*') >= 0).toBe(true);
        });
      });
    });
    return describe("when the file has not been modified and user doesn't need to confirm", function() {
      beforeEach(function() {
        spyOn(window, 'confirm').andReturn(false);
        return spyOn(repo, 'isPathModified').andReturn(false);
      });
      describe("when there is a current file open", function() {
        return it("calls git.cmd with 'rm' and " + pathToRepoFile, function() {
          var args, ref1;
          GitRemove(repo);
          args = git.cmd.mostRecentCall.args[0];
          expect(indexOf.call(args, 'rm') >= 0).toBe(true);
          expect((ref1 = repo.relativize(pathToRepoFile), indexOf.call(args, ref1) >= 0)).toBe(true);
          return expect(window.confirm).not.toHaveBeenCalled();
        });
      });
      return describe("when 'showSelector' is set to true", function() {
        return it("calls git.cmd with '*' instead of " + pathToRepoFile, function() {
          var args;
          GitRemove(repo, {
            showSelector: true
          });
          args = git.cmd.mostRecentCall.args[0];
          return expect(indexOf.call(args, '*') >= 0).toBe(true);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXJlbW92ZS1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0VBQUE7SUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sTUFBa0QsT0FBQSxDQUFRLGFBQVIsQ0FBbEQsRUFBQyxlQUFELEVBQU8sbUNBQVAsRUFBdUIsMkJBQXZCLEVBQW1DOztFQUNuQyxTQUFBLEdBQVksT0FBQSxDQUFRLDZCQUFSOztFQUVaLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUE7SUFDcEIsVUFBQSxDQUFXLFNBQUE7TUFDVCxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IscUJBQXRCLENBQTRDLENBQUMsU0FBN0MsQ0FBdUQsVUFBdkQ7TUFDQSxLQUFBLENBQU0sSUFBSSxDQUFDLFNBQVgsRUFBc0IsbUJBQXRCLENBQTBDLENBQUMsU0FBM0MsQ0FBcUQsV0FBckQ7YUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLEtBQVgsQ0FBaUIsQ0FBQyxTQUFsQixDQUE0QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFJLENBQUMsVUFBTCxDQUFnQixjQUFoQixDQUFoQixDQUE1QjtJQUhTLENBQVg7SUFLQSxRQUFBLENBQVMsbURBQVQsRUFBOEQsU0FBQTtNQUM1RCxVQUFBLENBQVcsU0FBQTtRQUNULEtBQUEsQ0FBTSxNQUFOLEVBQWMsU0FBZCxDQUF3QixDQUFDLFNBQXpCLENBQW1DLElBQW5DO2VBQ0EsS0FBQSxDQUFNLElBQU4sRUFBWSxnQkFBWixDQUE2QixDQUFDLFNBQTlCLENBQXdDLElBQXhDO01BRlMsQ0FBWDtNQUlBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBO2VBQzVDLEVBQUEsQ0FBRyw4QkFBQSxHQUErQixjQUFsQyxFQUFvRCxTQUFBO0FBQ2xELGNBQUE7VUFBQSxTQUFBLENBQVUsSUFBVjtVQUNBLElBQUEsR0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQTtVQUNuQyxNQUFBLENBQU8sYUFBUSxJQUFSLEVBQUEsSUFBQSxNQUFQLENBQW9CLENBQUMsSUFBckIsQ0FBMEIsSUFBMUI7aUJBQ0EsTUFBQSxDQUFPLFFBQUEsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsY0FBaEIsQ0FBQSxFQUFBLGFBQW1DLElBQW5DLEVBQUEsSUFBQSxNQUFBLENBQVAsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxJQUFyRDtRQUprRCxDQUFwRDtNQUQ0QyxDQUE5QzthQU9BLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBO2VBQzdDLEVBQUEsQ0FBRyxvQ0FBQSxHQUFxQyxjQUF4QyxFQUEwRCxTQUFBO0FBQ3hELGNBQUE7VUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQjtZQUFBLFlBQUEsRUFBYyxJQUFkO1dBQWhCO1VBQ0EsSUFBQSxHQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBO2lCQUNuQyxNQUFBLENBQU8sYUFBTyxJQUFQLEVBQUEsR0FBQSxNQUFQLENBQW1CLENBQUMsSUFBcEIsQ0FBeUIsSUFBekI7UUFId0QsQ0FBMUQ7TUFENkMsQ0FBL0M7SUFaNEQsQ0FBOUQ7V0FrQkEsUUFBQSxDQUFTLHNFQUFULEVBQWlGLFNBQUE7TUFDL0UsVUFBQSxDQUFXLFNBQUE7UUFDVCxLQUFBLENBQU0sTUFBTixFQUFjLFNBQWQsQ0FBd0IsQ0FBQyxTQUF6QixDQUFtQyxLQUFuQztlQUNBLEtBQUEsQ0FBTSxJQUFOLEVBQVksZ0JBQVosQ0FBNkIsQ0FBQyxTQUE5QixDQUF3QyxLQUF4QztNQUZTLENBQVg7TUFJQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQTtlQUM1QyxFQUFBLENBQUcsOEJBQUEsR0FBK0IsY0FBbEMsRUFBb0QsU0FBQTtBQUNsRCxjQUFBO1VBQUEsU0FBQSxDQUFVLElBQVY7VUFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUE7VUFDbkMsTUFBQSxDQUFPLGFBQVEsSUFBUixFQUFBLElBQUEsTUFBUCxDQUFvQixDQUFDLElBQXJCLENBQTBCLElBQTFCO1VBQ0EsTUFBQSxDQUFPLFFBQUEsSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsY0FBaEIsQ0FBQSxFQUFBLGFBQW1DLElBQW5DLEVBQUEsSUFBQSxNQUFBLENBQVAsQ0FBK0MsQ0FBQyxJQUFoRCxDQUFxRCxJQUFyRDtpQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQWQsQ0FBc0IsQ0FBQyxHQUFHLENBQUMsZ0JBQTNCLENBQUE7UUFMa0QsQ0FBcEQ7TUFENEMsQ0FBOUM7YUFRQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQTtlQUM3QyxFQUFBLENBQUcsb0NBQUEsR0FBcUMsY0FBeEMsRUFBMEQsU0FBQTtBQUN4RCxjQUFBO1VBQUEsU0FBQSxDQUFVLElBQVYsRUFBZ0I7WUFBQSxZQUFBLEVBQWMsSUFBZDtXQUFoQjtVQUNBLElBQUEsR0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQTtpQkFDbkMsTUFBQSxDQUFPLGFBQU8sSUFBUCxFQUFBLEdBQUEsTUFBUCxDQUFtQixDQUFDLElBQXBCLENBQXlCLElBQXpCO1FBSHdELENBQTFEO01BRDZDLENBQS9DO0lBYitFLENBQWpGO0VBeEJvQixDQUF0QjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvLCBwYXRoVG9SZXBvRmlsZSwgdGV4dEVkaXRvciwgY3VycmVudFBhbmV9ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5HaXRSZW1vdmUgPSByZXF1aXJlICcuLi8uLi9saWIvbW9kZWxzL2dpdC1yZW1vdmUnXG5cbmRlc2NyaWJlIFwiR2l0UmVtb3ZlXCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzcHlPbihhdG9tLndvcmtzcGFjZSwgJ2dldEFjdGl2ZVRleHRFZGl0b3InKS5hbmRSZXR1cm4gdGV4dEVkaXRvclxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlUGFuZUl0ZW0nKS5hbmRSZXR1cm4gY3VycmVudFBhbmVcbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlIHJlcG8ucmVsYXRpdml6ZShwYXRoVG9SZXBvRmlsZSlcblxuICBkZXNjcmliZSBcIndoZW4gdGhlIGZpbGUgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIHVzZXIgY29uZmlybXNcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbih3aW5kb3csICdjb25maXJtJykuYW5kUmV0dXJuIHRydWVcbiAgICAgIHNweU9uKHJlcG8sICdpc1BhdGhNb2RpZmllZCcpLmFuZFJldHVybiB0cnVlXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlcmUgaXMgYSBjdXJyZW50IGZpbGUgb3BlblwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ3JtJyBhbmQgI3twYXRoVG9SZXBvRmlsZX1cIiwgLT5cbiAgICAgICAgR2l0UmVtb3ZlIHJlcG9cbiAgICAgICAgYXJncyA9IGdpdC5jbWQubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICBleHBlY3QoJ3JtJyBpbiBhcmdzKS50b0JlIHRydWVcbiAgICAgICAgZXhwZWN0KHJlcG8ucmVsYXRpdml6ZShwYXRoVG9SZXBvRmlsZSkgaW4gYXJncykudG9CZSB0cnVlXG5cbiAgICBkZXNjcmliZSBcIndoZW4gJ3Nob3dTZWxlY3RvcicgaXMgc2V0IHRvIHRydWVcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICcqJyBpbnN0ZWFkIG9mICN7cGF0aFRvUmVwb0ZpbGV9XCIsIC0+XG4gICAgICAgIEdpdFJlbW92ZSByZXBvLCBzaG93U2VsZWN0b3I6IHRydWVcbiAgICAgICAgYXJncyA9IGdpdC5jbWQubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICBleHBlY3QoJyonIGluIGFyZ3MpLnRvQmUgdHJ1ZVxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGUgZmlsZSBoYXMgbm90IGJlZW4gbW9kaWZpZWQgYW5kIHVzZXIgZG9lc24ndCBuZWVkIHRvIGNvbmZpcm1cIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbih3aW5kb3csICdjb25maXJtJykuYW5kUmV0dXJuIGZhbHNlXG4gICAgICBzcHlPbihyZXBvLCAnaXNQYXRoTW9kaWZpZWQnKS5hbmRSZXR1cm4gZmFsc2VcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGVyZSBpcyBhIGN1cnJlbnQgZmlsZSBvcGVuXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAncm0nIGFuZCAje3BhdGhUb1JlcG9GaWxlfVwiLCAtPlxuICAgICAgICBHaXRSZW1vdmUgcmVwb1xuICAgICAgICBhcmdzID0gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgICAgIGV4cGVjdCgncm0nIGluIGFyZ3MpLnRvQmUgdHJ1ZVxuICAgICAgICBleHBlY3QocmVwby5yZWxhdGl2aXplKHBhdGhUb1JlcG9GaWxlKSBpbiBhcmdzKS50b0JlIHRydWVcbiAgICAgICAgZXhwZWN0KHdpbmRvdy5jb25maXJtKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gJ3Nob3dTZWxlY3RvcicgaXMgc2V0IHRvIHRydWVcIiwgLT5cbiAgICAgIGl0IFwiY2FsbHMgZ2l0LmNtZCB3aXRoICcqJyBpbnN0ZWFkIG9mICN7cGF0aFRvUmVwb0ZpbGV9XCIsIC0+XG4gICAgICAgIEdpdFJlbW92ZSByZXBvLCBzaG93U2VsZWN0b3I6IHRydWVcbiAgICAgICAgYXJncyA9IGdpdC5jbWQubW9zdFJlY2VudENhbGwuYXJnc1swXVxuICAgICAgICBleHBlY3QoJyonIGluIGFyZ3MpLnRvQmUgdHJ1ZVxuIl19
