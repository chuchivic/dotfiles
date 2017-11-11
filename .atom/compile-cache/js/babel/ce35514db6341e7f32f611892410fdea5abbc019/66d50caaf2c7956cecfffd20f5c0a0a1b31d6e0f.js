'use babel';
var git = require('../../lib/git');
var GitDeleteBranch = require('../../lib/models/git-delete-branch');

var _require = require('../fixtures');

var repo = _require.repo;

var cwd = repo.getWorkingDirectory();

describe("GitDeleteBranch", function () {
  describe("when the remote option is false", function () {
    beforeEach(function () {
      spyOn(git, 'cmd').andReturn(Promise.resolve('branch1\nbranch2'));
    });

    it("gets a list of the repo's branches", function () {
      waitsForPromise(function () {
        return GitDeleteBranch(repo);
      });
      runs(function () {
        expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color'], { cwd: cwd });
      });
    });

    it("deletes the selected local branch", function () {
      waitsForPromise(function () {
        return GitDeleteBranch(repo).then(function (view) {
          return view.confirmSelection();
        });
      });
      runs(function () {
        return expect(git.cmd).toHaveBeenCalledWith(['branch', '-D', 'branch1'], { cwd: cwd });
      });
    });
  });

  describe("when the remote option is true", function () {
    beforeEach(function () {
      spyOn(git, 'cmd').andReturn(Promise.resolve('origin/branch1\norigin/branch2'));
    });

    it("gets a list of the repo's remote branches", function () {
      waitsForPromise(function () {
        return GitDeleteBranch(repo, { remote: true });
      });
      runs(function () {
        expect(git.cmd).toHaveBeenCalledWith(['branch', '-r', '--no-color'], { cwd: cwd });
      });
    });

    it("deletes the selected remote branch", function () {
      waitsForPromise(function () {
        return GitDeleteBranch(repo, { remote: true }).then(function (view) {
          return view.confirmSelection();
        });
      });
      runs(function () {
        return expect(git.cmd).toHaveBeenCalledWith(['push', 'origin', '--delete', 'branch1'], { cwd: cwd });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL3NwZWMvbW9kZWxzL2dpdC1kZWxldGUtYnJhbmNoLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBO0FBQ1gsSUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3BDLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBOztlQUV0RCxPQUFPLENBQUMsYUFBYSxDQUFDOztJQUE5QixJQUFJLFlBQUosSUFBSTs7QUFDWCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTs7QUFFdEMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLFlBQU07QUFDaEMsVUFBUSxDQUFDLGlDQUFpQyxFQUFFLFlBQU07QUFDaEQsY0FBVSxDQUFDLFlBQU07QUFDZixXQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQTtLQUNqRSxDQUFDLENBQUE7O0FBRUYsTUFBRSxDQUFDLG9DQUFvQyxFQUFFLFlBQU07QUFDN0MscUJBQWUsQ0FBQztlQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDNUMsVUFBSSxDQUFDLFlBQU07QUFDVCxjQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBQyxDQUFDLENBQUE7T0FDdEUsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQyxtQ0FBbUMsRUFBRSxZQUFNO0FBQzVDLHFCQUFlLENBQUM7ZUFBTSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7U0FBQSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ2xGLFVBQUksQ0FBQztlQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBQyxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQ3JGLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsZ0NBQWdDLEVBQUUsWUFBTTtBQUMvQyxjQUFVLENBQUMsWUFBTTtBQUNmLFdBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFBO0tBQy9FLENBQUMsQ0FBQTs7QUFFRixNQUFFLENBQUMsMkNBQTJDLEVBQUUsWUFBTTtBQUNwRCxxQkFBZSxDQUFDO2VBQU0sZUFBZSxDQUFDLElBQUksRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUM1RCxVQUFJLENBQUMsWUFBTTtBQUNULGNBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBQyxDQUFDLENBQUE7T0FDNUUsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBOztBQUVGLE1BQUUsQ0FBQyxvQ0FBb0MsRUFBRSxZQUFNO0FBQzdDLHFCQUFlLENBQUM7ZUFBTSxlQUFlLENBQUMsSUFBSSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtpQkFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7U0FBQSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ2xHLFVBQUksQ0FBQztlQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBSCxHQUFHLEVBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUNuRyxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FFSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWRlbGV0ZS1icmFuY2gtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5jb25zdCBnaXQgPSByZXF1aXJlKCcuLi8uLi9saWIvZ2l0JylcbmNvbnN0IEdpdERlbGV0ZUJyYW5jaCA9IHJlcXVpcmUoJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWRlbGV0ZS1icmFuY2gnKVxuXG5jb25zdCB7cmVwb30gPSByZXF1aXJlKCcuLi9maXh0dXJlcycpXG5jb25zdCBjd2QgPSByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuXG5kZXNjcmliZShcIkdpdERlbGV0ZUJyYW5jaFwiLCAoKSA9PiB7XG4gIGRlc2NyaWJlKFwid2hlbiB0aGUgcmVtb3RlIG9wdGlvbiBpcyBmYWxzZVwiLCAoKSA9PiB7XG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4oUHJvbWlzZS5yZXNvbHZlKCdicmFuY2gxXFxuYnJhbmNoMicpKVxuICAgIH0pXG5cbiAgICBpdChcImdldHMgYSBsaXN0IG9mIHRoZSByZXBvJ3MgYnJhbmNoZXNcIiwgKCkgPT4ge1xuICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IEdpdERlbGV0ZUJyYW5jaChyZXBvKSlcbiAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoWydicmFuY2gnLCAnLS1uby1jb2xvciddLCB7Y3dkfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KFwiZGVsZXRlcyB0aGUgc2VsZWN0ZWQgbG9jYWwgYnJhbmNoXCIsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBHaXREZWxldGVCcmFuY2gocmVwbykudGhlbih2aWV3ID0+IHZpZXcuY29uZmlybVNlbGVjdGlvbigpKSlcbiAgICAgIHJ1bnMoKCkgPT4gZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFsnYnJhbmNoJywgJy1EJywgJ2JyYW5jaDEnXSwge2N3ZH0pKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoXCJ3aGVuIHRoZSByZW1vdGUgb3B0aW9uIGlzIHRydWVcIiwgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuKFByb21pc2UucmVzb2x2ZSgnb3JpZ2luL2JyYW5jaDFcXG5vcmlnaW4vYnJhbmNoMicpKVxuICAgIH0pXG5cbiAgICBpdChcImdldHMgYSBsaXN0IG9mIHRoZSByZXBvJ3MgcmVtb3RlIGJyYW5jaGVzXCIsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBHaXREZWxldGVCcmFuY2gocmVwbywge3JlbW90ZTogdHJ1ZX0pKVxuICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChbJ2JyYW5jaCcsICctcicsICctLW5vLWNvbG9yJ10sIHtjd2R9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgaXQoXCJkZWxldGVzIHRoZSBzZWxlY3RlZCByZW1vdGUgYnJhbmNoXCIsICgpID0+IHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBHaXREZWxldGVCcmFuY2gocmVwbywge3JlbW90ZTogdHJ1ZX0pLnRoZW4odmlldyA9PiB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKSkpXG4gICAgICBydW5zKCgpID0+IGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChbJ3B1c2gnLCAnb3JpZ2luJywgJy0tZGVsZXRlJywgJ2JyYW5jaDEnXSwge2N3ZH0pKVxuICAgIH0pXG4gIH0pXG5cbn0pXG4iXX0=