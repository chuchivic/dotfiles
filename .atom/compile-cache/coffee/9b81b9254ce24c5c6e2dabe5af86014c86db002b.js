(function() {
  var GitLog, LogListView, git, logFileURI, pathToRepoFile, ref, repo, view;

  git = require('../../lib/git');

  ref = require('../fixtures'), repo = ref.repo, pathToRepoFile = ref.pathToRepoFile;

  GitLog = require('../../lib/models/git-log');

  LogListView = require('../../lib/views/log-list-view');

  view = new LogListView;

  logFileURI = 'atom://git-plus:log';

  describe("GitLog", function() {
    beforeEach(function() {
      spyOn(atom.workspace, 'open').andReturn(Promise.resolve(view));
      spyOn(atom.workspace, 'addOpener');
      spyOn(atom.workspace, 'getActiveTextEditor').andReturn({
        getPath: function() {
          return pathToRepoFile;
        }
      });
      spyOn(view, 'branchLog');
      return waitsForPromise(function() {
        return GitLog(repo);
      });
    });
    it("adds a custom opener for the log file URI", function() {
      return expect(atom.workspace.addOpener).toHaveBeenCalled();
    });
    it("opens the log file URI", function() {
      return expect(atom.workspace.open).toHaveBeenCalledWith(logFileURI);
    });
    it("calls branchLog on the view", function() {
      return expect(view.branchLog).toHaveBeenCalledWith(repo);
    });
    return describe("when 'onlyCurrentFile' option is true", function() {
      return it("calls currentFileLog on the view", function() {
        spyOn(view, 'currentFileLog');
        waitsForPromise(function() {
          return GitLog(repo, {
            onlyCurrentFile: true
          });
        });
        return runs(function() {
          return expect(view.currentFileLog).toHaveBeenCalledWith(repo, repo.relativize(pathToRepoFile));
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWxvZy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNOLE1BQXlCLE9BQUEsQ0FBUSxhQUFSLENBQXpCLEVBQUMsZUFBRCxFQUFPOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsMEJBQVI7O0VBQ1QsV0FBQSxHQUFjLE9BQUEsQ0FBUSwrQkFBUjs7RUFFZCxJQUFBLEdBQU8sSUFBSTs7RUFDWCxVQUFBLEdBQWE7O0VBRWIsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtJQUNqQixVQUFBLENBQVcsU0FBQTtNQUNULEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QixDQUE2QixDQUFDLFNBQTlCLENBQXdDLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQWhCLENBQXhDO01BQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLFdBQXRCO01BQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxTQUFYLEVBQXNCLHFCQUF0QixDQUE0QyxDQUFDLFNBQTdDLENBQXVEO1FBQUUsT0FBQSxFQUFTLFNBQUE7aUJBQUc7UUFBSCxDQUFYO09BQXZEO01BQ0EsS0FBQSxDQUFNLElBQU4sRUFBWSxXQUFaO2FBQ0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsTUFBQSxDQUFPLElBQVA7TUFBSCxDQUFoQjtJQUxTLENBQVg7SUFPQSxFQUFBLENBQUcsMkNBQUgsRUFBZ0QsU0FBQTthQUM5QyxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUF0QixDQUFnQyxDQUFDLGdCQUFqQyxDQUFBO0lBRDhDLENBQWhEO0lBR0EsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUE7YUFDM0IsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBdEIsQ0FBMkIsQ0FBQyxvQkFBNUIsQ0FBaUQsVUFBakQ7SUFEMkIsQ0FBN0I7SUFHQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTthQUNoQyxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVosQ0FBc0IsQ0FBQyxvQkFBdkIsQ0FBNEMsSUFBNUM7SUFEZ0MsQ0FBbEM7V0FHQSxRQUFBLENBQVMsdUNBQVQsRUFBa0QsU0FBQTthQUNoRCxFQUFBLENBQUcsa0NBQUgsRUFBdUMsU0FBQTtRQUNyQyxLQUFBLENBQU0sSUFBTixFQUFZLGdCQUFaO1FBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUFHLE1BQUEsQ0FBTyxJQUFQLEVBQWE7WUFBQSxlQUFBLEVBQWlCLElBQWpCO1dBQWI7UUFBSCxDQUFoQjtlQUNBLElBQUEsQ0FBSyxTQUFBO2lCQUNILE1BQUEsQ0FBTyxJQUFJLENBQUMsY0FBWixDQUEyQixDQUFDLG9CQUE1QixDQUFpRCxJQUFqRCxFQUF1RCxJQUFJLENBQUMsVUFBTCxDQUFnQixjQUFoQixDQUF2RDtRQURHLENBQUw7TUFIcUMsQ0FBdkM7SUFEZ0QsQ0FBbEQ7RUFqQmlCLENBQW5CO0FBUkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG8sIHBhdGhUb1JlcG9GaWxlfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuR2l0TG9nID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtbG9nJ1xuTG9nTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvbG9nLWxpc3QtdmlldydcblxudmlldyA9IG5ldyBMb2dMaXN0Vmlld1xubG9nRmlsZVVSSSA9ICdhdG9tOi8vZ2l0LXBsdXM6bG9nJ1xuXG5kZXNjcmliZSBcIkdpdExvZ1wiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSB2aWV3XG4gICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdhZGRPcGVuZXInKVxuICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnZ2V0QWN0aXZlVGV4dEVkaXRvcicpLmFuZFJldHVybiB7IGdldFBhdGg6IC0+IHBhdGhUb1JlcG9GaWxlIH1cbiAgICBzcHlPbih2aWV3LCAnYnJhbmNoTG9nJylcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0TG9nIHJlcG9cblxuICBpdCBcImFkZHMgYSBjdXN0b20gb3BlbmVyIGZvciB0aGUgbG9nIGZpbGUgVVJJXCIsIC0+XG4gICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcikudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgaXQgXCJvcGVucyB0aGUgbG9nIGZpbGUgVVJJXCIsIC0+XG4gICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIGxvZ0ZpbGVVUklcblxuICBpdCBcImNhbGxzIGJyYW5jaExvZyBvbiB0aGUgdmlld1wiLCAtPlxuICAgIGV4cGVjdCh2aWV3LmJyYW5jaExvZykudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwb1xuXG4gIGRlc2NyaWJlIFwid2hlbiAnb25seUN1cnJlbnRGaWxlJyBvcHRpb24gaXMgdHJ1ZVwiLCAtPlxuICAgIGl0IFwiY2FsbHMgY3VycmVudEZpbGVMb2cgb24gdGhlIHZpZXdcIiwgLT5cbiAgICAgIHNweU9uKHZpZXcsICdjdXJyZW50RmlsZUxvZycpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0TG9nIHJlcG8sIG9ubHlDdXJyZW50RmlsZTogdHJ1ZVxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3Qodmlldy5jdXJyZW50RmlsZUxvZykudG9IYXZlQmVlbkNhbGxlZFdpdGggcmVwbywgcmVwby5yZWxhdGl2aXplIHBhdGhUb1JlcG9GaWxlXG4iXX0=
