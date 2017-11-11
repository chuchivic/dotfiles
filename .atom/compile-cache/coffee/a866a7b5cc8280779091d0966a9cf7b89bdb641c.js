(function() {
  var MergeListView, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  MergeListView = require('../../lib/views/merge-list-view');

  describe("MergeListView", function() {
    beforeEach(function() {
      this.view = new MergeListView(repo, "branch1\nbranch2");
      return spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve('');
      });
    });
    it("displays a list of branches", function() {
      return expect(this.view.items.length).toBe(2);
    });
    it("calls git.cmd with 'merge branch1' when branch1 is selected", function() {
      this.view.confirmSelection();
      waitsFor(function() {
        return git.cmd.callCount > 0;
      });
      return expect(git.cmd).toHaveBeenCalledWith(['merge', 'branch1'], {
        cwd: repo.getWorkingDirectory()
      }, {
        color: true
      });
    });
    return describe("when passed extra arguments", function() {
      return it("calls git.cmd with 'merge [extraArgs] branch1' when branch1 is selected", function() {
        var view;
        view = new MergeListView(repo, "branch1", ['--no-ff']);
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return expect(git.cmd).toHaveBeenCalledWith(['merge', '--no-ff', 'branch1'], {
          cwd: repo.getWorkingDirectory()
        }, {
          color: true
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9tZXJnZS1saXN0LXZpZXctc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTCxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlDQUFSOztFQUVoQixRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBO0lBQ3hCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsSUFBQyxDQUFBLElBQUQsR0FBWSxJQUFBLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLGtCQUFwQjthQUNaLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUE7ZUFBRyxPQUFPLENBQUMsT0FBUixDQUFnQixFQUFoQjtNQUFILENBQTlCO0lBRlMsQ0FBWDtJQUlBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBO2FBQ2hDLE1BQUEsQ0FBTyxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFuQixDQUEwQixDQUFDLElBQTNCLENBQWdDLENBQWhDO0lBRGdDLENBQWxDO0lBR0EsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUE7TUFDaEUsSUFBQyxDQUFBLElBQUksQ0FBQyxnQkFBTixDQUFBO01BQ0EsUUFBQSxDQUFTLFNBQUE7ZUFBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVIsR0FBb0I7TUFBdkIsQ0FBVDthQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsT0FBRCxFQUFVLFNBQVYsQ0FBckMsRUFBMkQ7UUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtPQUEzRCxFQUE0RjtRQUFDLEtBQUEsRUFBTyxJQUFSO09BQTVGO0lBSGdFLENBQWxFO1dBS0EsUUFBQSxDQUFTLDZCQUFULEVBQXdDLFNBQUE7YUFDdEMsRUFBQSxDQUFHLHlFQUFILEVBQThFLFNBQUE7QUFDNUUsWUFBQTtRQUFBLElBQUEsR0FBVyxJQUFBLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLFNBQXBCLEVBQStCLENBQUMsU0FBRCxDQUEvQjtRQUNYLElBQUksQ0FBQyxnQkFBTCxDQUFBO1FBQ0EsUUFBQSxDQUFTLFNBQUE7aUJBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLEdBQW9CO1FBQXZCLENBQVQ7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE9BQUQsRUFBVSxTQUFWLEVBQXFCLFNBQXJCLENBQXJDLEVBQXNFO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBdEUsRUFBdUc7VUFBQyxLQUFBLEVBQU8sSUFBUjtTQUF2RztNQUo0RSxDQUE5RTtJQURzQyxDQUF4QztFQWJ3QixDQUExQjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuTWVyZ2VMaXN0VmlldyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy9tZXJnZS1saXN0LXZpZXcnXG5cbmRlc2NyaWJlIFwiTWVyZ2VMaXN0Vmlld1wiLCAtPlxuICBiZWZvcmVFYWNoIC0+XG4gICAgQHZpZXcgPSBuZXcgTWVyZ2VMaXN0VmlldyhyZXBvLCBcImJyYW5jaDFcXG5icmFuY2gyXCIpXG4gICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT4gUHJvbWlzZS5yZXNvbHZlICcnXG5cbiAgaXQgXCJkaXNwbGF5cyBhIGxpc3Qgb2YgYnJhbmNoZXNcIiwgLT5cbiAgICBleHBlY3QoQHZpZXcuaXRlbXMubGVuZ3RoKS50b0JlIDJcblxuICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnbWVyZ2UgYnJhbmNoMScgd2hlbiBicmFuY2gxIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgQHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnbWVyZ2UnLCAnYnJhbmNoMSddLCBjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpLCB7Y29sb3I6IHRydWV9XG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHBhc3NlZCBleHRyYSBhcmd1bWVudHNcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnbWVyZ2UgW2V4dHJhQXJnc10gYnJhbmNoMScgd2hlbiBicmFuY2gxIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICB2aWV3ID0gbmV3IE1lcmdlTGlzdFZpZXcocmVwbywgXCJicmFuY2gxXCIsIFsnLS1uby1mZiddKVxuICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnbWVyZ2UnLCAnLS1uby1mZicsICdicmFuY2gxJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCksIHtjb2xvcjogdHJ1ZX1cbiJdfQ==
