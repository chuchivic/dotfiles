(function() {
  var GitRun, git, repo;

  git = require('../lib/git');

  GitRun = require('../lib/models/git-run');

  repo = require('./fixtures').repo;

  describe("Git-Plus service", function() {
    var service;
    service = null;
    beforeEach(function() {
      atom.config.set('git-plus.experimental.customCommands', true);
      return service = require('../lib/service');
    });
    describe("registerCommand", function() {
      return it("registers the given command with atom and saves it for the Git-Plus command palette", function() {
        var command, fn;
        fn = function() {};
        service.registerCommand('some-element', 'foobar:do-cool-stuff', fn);
        command = service.getCustomCommands()[0];
        expect(command[0]).toBe('foobar:do-cool-stuff');
        expect(command[1]).toBe('Do Cool Stuff');
        return expect(command[2]).toBe(fn);
      });
    });
    describe("::getRepo", function() {
      return it("is the getRepo function", function() {
        return expect(git.getRepo).toBe(service.getRepo);
      });
    });
    return describe("::run", function() {
      return it("is the GitRun function", function() {
        return expect(GitRun).toBe(service.run);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9zZXJ2aWNlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFlBQVI7O0VBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSx1QkFBUjs7RUFDUixPQUFRLE9BQUEsQ0FBUSxZQUFSOztFQUVULFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO0FBQzNCLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFFVixVQUFBLENBQVcsU0FBQTtNQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsRUFBd0QsSUFBeEQ7YUFDQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSO0lBRkQsQ0FBWDtJQUlBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO2FBQzFCLEVBQUEsQ0FBRyxxRkFBSCxFQUEwRixTQUFBO0FBQ3hGLFlBQUE7UUFBQSxFQUFBLEdBQUssU0FBQSxHQUFBO1FBQ0wsT0FBTyxDQUFDLGVBQVIsQ0FBd0IsY0FBeEIsRUFBd0Msc0JBQXhDLEVBQWdFLEVBQWhFO1FBQ0EsT0FBQSxHQUFVLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQTRCLENBQUEsQ0FBQTtRQUN0QyxNQUFBLENBQU8sT0FBUSxDQUFBLENBQUEsQ0FBZixDQUFrQixDQUFDLElBQW5CLENBQXdCLHNCQUF4QjtRQUNBLE1BQUEsQ0FBTyxPQUFRLENBQUEsQ0FBQSxDQUFmLENBQWtCLENBQUMsSUFBbkIsQ0FBd0IsZUFBeEI7ZUFDQSxNQUFBLENBQU8sT0FBUSxDQUFBLENBQUEsQ0FBZixDQUFrQixDQUFDLElBQW5CLENBQXdCLEVBQXhCO01BTndGLENBQTFGO0lBRDBCLENBQTVCO0lBU0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQTthQUNwQixFQUFBLENBQUcseUJBQUgsRUFBOEIsU0FBQTtlQUM1QixNQUFBLENBQU8sR0FBRyxDQUFDLE9BQVgsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixPQUFPLENBQUMsT0FBakM7TUFENEIsQ0FBOUI7SUFEb0IsQ0FBdEI7V0FJQSxRQUFBLENBQVMsT0FBVCxFQUFrQixTQUFBO2FBQ2hCLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO2VBQzNCLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxJQUFmLENBQW9CLE9BQU8sQ0FBQyxHQUE1QjtNQUQyQixDQUE3QjtJQURnQixDQUFsQjtFQXBCMkIsQ0FBN0I7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4uL2xpYi9naXQnXG5HaXRSdW4gPSByZXF1aXJlICcuLi9saWIvbW9kZWxzL2dpdC1ydW4nXG57cmVwb30gPSByZXF1aXJlICcuL2ZpeHR1cmVzJ1xuXG5kZXNjcmliZSBcIkdpdC1QbHVzIHNlcnZpY2VcIiwgLT5cbiAgc2VydmljZSA9IG51bGxcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgYXRvbS5jb25maWcuc2V0KCdnaXQtcGx1cy5leHBlcmltZW50YWwuY3VzdG9tQ29tbWFuZHMnLCB0cnVlKVxuICAgIHNlcnZpY2UgPSByZXF1aXJlICcuLi9saWIvc2VydmljZSdcblxuICBkZXNjcmliZSBcInJlZ2lzdGVyQ29tbWFuZFwiLCAtPlxuICAgIGl0IFwicmVnaXN0ZXJzIHRoZSBnaXZlbiBjb21tYW5kIHdpdGggYXRvbSBhbmQgc2F2ZXMgaXQgZm9yIHRoZSBHaXQtUGx1cyBjb21tYW5kIHBhbGV0dGVcIiwgLT5cbiAgICAgIGZuID0gKCkgLT5cbiAgICAgIHNlcnZpY2UucmVnaXN0ZXJDb21tYW5kKCdzb21lLWVsZW1lbnQnLCAnZm9vYmFyOmRvLWNvb2wtc3R1ZmYnLCBmbilcbiAgICAgIGNvbW1hbmQgPSBzZXJ2aWNlLmdldEN1c3RvbUNvbW1hbmRzKClbMF1cbiAgICAgIGV4cGVjdChjb21tYW5kWzBdKS50b0JlICdmb29iYXI6ZG8tY29vbC1zdHVmZidcbiAgICAgIGV4cGVjdChjb21tYW5kWzFdKS50b0JlICdEbyBDb29sIFN0dWZmJ1xuICAgICAgZXhwZWN0KGNvbW1hbmRbMl0pLnRvQmUgZm5cblxuICBkZXNjcmliZSBcIjo6Z2V0UmVwb1wiLCAtPlxuICAgIGl0IFwiaXMgdGhlIGdldFJlcG8gZnVuY3Rpb25cIiwgLT5cbiAgICAgIGV4cGVjdChnaXQuZ2V0UmVwbykudG9CZSBzZXJ2aWNlLmdldFJlcG9cblxuICBkZXNjcmliZSBcIjo6cnVuXCIsIC0+XG4gICAgaXQgXCJpcyB0aGUgR2l0UnVuIGZ1bmN0aW9uXCIsIC0+XG4gICAgICBleHBlY3QoR2l0UnVuKS50b0JlIHNlcnZpY2UucnVuXG4iXX0=
