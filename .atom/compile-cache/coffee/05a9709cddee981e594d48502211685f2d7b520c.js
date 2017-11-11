(function() {
  var GitShow, Os, Path, fs, git, pathToRepoFile, ref, repo,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Path = require('path');

  fs = require('fs-plus');

  Os = require('os');

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  GitShow = require('../../lib/models/git-show');

  describe("GitShow", function() {
    beforeEach(function() {
      return spyOn(git, 'cmd').andReturn(Promise.resolve('foobar'));
    });
    it("calls git.cmd with 'show' and " + pathToRepoFile, function() {
      var args;
      GitShow(repo, 'foobar-hash', pathToRepoFile);
      args = git.cmd.mostRecentCall.args[0];
      expect(indexOf.call(args, 'show') >= 0).toBe(true);
      return expect(indexOf.call(args, pathToRepoFile) >= 0).toBe(true);
    });
    it("uses the format option from package settings", function() {
      var args;
      atom.config.set('git-plus.general.showFormat', 'fuller');
      GitShow(repo, 'foobar-hash', pathToRepoFile);
      args = git.cmd.mostRecentCall.args[0];
      return expect(indexOf.call(args, '--format=fuller') >= 0).toBe(true);
    });
    it("writes the output to a file", function() {
      var outputFile;
      spyOn(fs, 'writeFile').andCallFake(function() {
        return fs.writeFile.mostRecentCall.args[3]();
      });
      outputFile = Path.join(Os.tmpDir(), "foobar-hash.diff");
      waitsForPromise(function() {
        return GitShow(repo, 'foobar-hash', pathToRepoFile);
      });
      return runs(function() {
        var args;
        args = fs.writeFile.mostRecentCall.args;
        expect(args[0]).toBe(outputFile);
        return expect(args[1]).toBe('foobar');
      });
    });
    return describe("When a hash is not specified", function() {
      return it("returns a view for entering a hash", function() {
        var view;
        view = GitShow(repo);
        return expect(view).toBeDefined();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXNob3ctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE1BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUNQLE9BQUEsR0FBVSxPQUFBLENBQVEsMkJBQVI7O0VBRVYsUUFBQSxDQUFTLFNBQVQsRUFBb0IsU0FBQTtJQUNsQixVQUFBLENBQVcsU0FBQTthQUNULEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLFFBQWhCLENBQTVCO0lBRFMsQ0FBWDtJQUdBLEVBQUEsQ0FBRyxnQ0FBQSxHQUFpQyxjQUFwQyxFQUFzRCxTQUFBO0FBQ3BELFVBQUE7TUFBQSxPQUFBLENBQVEsSUFBUixFQUFjLGFBQWQsRUFBNkIsY0FBN0I7TUFDQSxJQUFBLEdBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUE7TUFDbkMsTUFBQSxDQUFPLGFBQVUsSUFBVixFQUFBLE1BQUEsTUFBUCxDQUFzQixDQUFDLElBQXZCLENBQTRCLElBQTVCO2FBQ0EsTUFBQSxDQUFPLGFBQWtCLElBQWxCLEVBQUEsY0FBQSxNQUFQLENBQThCLENBQUMsSUFBL0IsQ0FBb0MsSUFBcEM7SUFKb0QsQ0FBdEQ7SUFNQSxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTtBQUNqRCxVQUFBO01BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixFQUErQyxRQUEvQztNQUNBLE9BQUEsQ0FBUSxJQUFSLEVBQWMsYUFBZCxFQUE2QixjQUE3QjtNQUNBLElBQUEsR0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQTthQUNuQyxNQUFBLENBQU8sYUFBcUIsSUFBckIsRUFBQSxpQkFBQSxNQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsSUFBdkM7SUFKaUQsQ0FBbkQ7SUFNQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTtBQUNoQyxVQUFBO01BQUEsS0FBQSxDQUFNLEVBQU4sRUFBVSxXQUFWLENBQXNCLENBQUMsV0FBdkIsQ0FBbUMsU0FBQTtlQUNqQyxFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFqQyxDQUFBO01BRGlDLENBQW5DO01BRUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBRSxDQUFDLE1BQUgsQ0FBQSxDQUFWLEVBQXVCLGtCQUF2QjtNQUNiLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLE9BQUEsQ0FBUSxJQUFSLEVBQWMsYUFBZCxFQUE2QixjQUE3QjtNQURjLENBQWhCO2FBRUEsSUFBQSxDQUFLLFNBQUE7QUFDSCxZQUFBO1FBQUEsSUFBQSxHQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO1FBQ25DLE1BQUEsQ0FBTyxJQUFLLENBQUEsQ0FBQSxDQUFaLENBQWUsQ0FBQyxJQUFoQixDQUFxQixVQUFyQjtlQUNBLE1BQUEsQ0FBTyxJQUFLLENBQUEsQ0FBQSxDQUFaLENBQWUsQ0FBQyxJQUFoQixDQUFxQixRQUFyQjtNQUhHLENBQUw7SUFOZ0MsQ0FBbEM7V0FXQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQTthQUN2QyxFQUFBLENBQUcsb0NBQUgsRUFBeUMsU0FBQTtBQUN2QyxZQUFBO1FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSO2VBQ1AsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLFdBQWIsQ0FBQTtNQUZ1QyxDQUF6QztJQUR1QyxDQUF6QztFQTNCa0IsQ0FBcEI7QUFQQSIsInNvdXJjZXNDb250ZW50IjpbIlBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuT3MgPSByZXF1aXJlICdvcydcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwbywgcGF0aFRvUmVwb0ZpbGV9ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5HaXRTaG93ID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc2hvdydcblxuZGVzY3JpYmUgXCJHaXRTaG93XCIsIC0+XG4gIGJlZm9yZUVhY2ggLT5cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdmb29iYXInXG5cbiAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggJ3Nob3cnIGFuZCAje3BhdGhUb1JlcG9GaWxlfVwiLCAtPlxuICAgIEdpdFNob3cgcmVwbywgJ2Zvb2Jhci1oYXNoJywgcGF0aFRvUmVwb0ZpbGVcbiAgICBhcmdzID0gZ2l0LmNtZC5tb3N0UmVjZW50Q2FsbC5hcmdzWzBdXG4gICAgZXhwZWN0KCdzaG93JyBpbiBhcmdzKS50b0JlIHRydWVcbiAgICBleHBlY3QocGF0aFRvUmVwb0ZpbGUgaW4gYXJncykudG9CZSB0cnVlXG5cbiAgaXQgXCJ1c2VzIHRoZSBmb3JtYXQgb3B0aW9uIGZyb20gcGFja2FnZSBzZXR0aW5nc1wiLCAtPlxuICAgIGF0b20uY29uZmlnLnNldCgnZ2l0LXBsdXMuZ2VuZXJhbC5zaG93Rm9ybWF0JywgJ2Z1bGxlcicpXG4gICAgR2l0U2hvdyByZXBvLCAnZm9vYmFyLWhhc2gnLCBwYXRoVG9SZXBvRmlsZVxuICAgIGFyZ3MgPSBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICBleHBlY3QoJy0tZm9ybWF0PWZ1bGxlcicgaW4gYXJncykudG9CZSB0cnVlXG5cbiAgaXQgXCJ3cml0ZXMgdGhlIG91dHB1dCB0byBhIGZpbGVcIiwgLT5cbiAgICBzcHlPbihmcywgJ3dyaXRlRmlsZScpLmFuZENhbGxGYWtlIC0+XG4gICAgICBmcy53cml0ZUZpbGUubW9zdFJlY2VudENhbGwuYXJnc1szXSgpXG4gICAgb3V0cHV0RmlsZSA9IFBhdGguam9pbiBPcy50bXBEaXIoKSwgXCJmb29iYXItaGFzaC5kaWZmXCJcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIEdpdFNob3cgcmVwbywgJ2Zvb2Jhci1oYXNoJywgcGF0aFRvUmVwb0ZpbGVcbiAgICBydW5zIC0+XG4gICAgICBhcmdzID0gZnMud3JpdGVGaWxlLm1vc3RSZWNlbnRDYWxsLmFyZ3NcbiAgICAgIGV4cGVjdChhcmdzWzBdKS50b0JlIG91dHB1dEZpbGVcbiAgICAgIGV4cGVjdChhcmdzWzFdKS50b0JlICdmb29iYXInXG5cbiAgZGVzY3JpYmUgXCJXaGVuIGEgaGFzaCBpcyBub3Qgc3BlY2lmaWVkXCIsIC0+XG4gICAgaXQgXCJyZXR1cm5zIGEgdmlldyBmb3IgZW50ZXJpbmcgYSBoYXNoXCIsIC0+XG4gICAgICB2aWV3ID0gR2l0U2hvdyByZXBvXG4gICAgICBleHBlY3QodmlldykudG9CZURlZmluZWQoKVxuIl19
