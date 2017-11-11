(function() {
  var GitMerge, git, repo;

  repo = require('../fixtures').repo;

  git = require('../../lib/git');

  GitMerge = require('../../lib/models/git-merge');

  describe("GitMerge", function() {
    describe("when called with no options", function() {
      return it("calls git.cmd with 'branch'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(''));
        GitMerge(repo);
        return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color'], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
    return describe("when called with { remote: true } option", function() {
      return it("calls git.cmd with 'branch -r'", function() {
        spyOn(git, 'cmd').andReturn(Promise.resolve(''));
        GitMerge(repo, {
          remote: true
        });
        return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color', '-r'], {
          cwd: repo.getWorkingDirectory()
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LW1lcmdlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLDRCQUFSOztFQUVYLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUE7SUFDbkIsUUFBQSxDQUFTLDZCQUFULEVBQXdDLFNBQUE7YUFDdEMsRUFBQSxDQUFHLDZCQUFILEVBQWtDLFNBQUE7UUFDaEMsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBaEIsQ0FBNUI7UUFDQSxRQUFBLENBQVMsSUFBVDtlQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsR0FBWCxDQUFlLENBQUMsb0JBQWhCLENBQXFDLENBQUMsUUFBRCxFQUFXLFlBQVgsQ0FBckMsRUFBK0Q7VUFBQSxHQUFBLEVBQUssSUFBSSxDQUFDLG1CQUFMLENBQUEsQ0FBTDtTQUEvRDtNQUhnQyxDQUFsQztJQURzQyxDQUF4QztXQU1BLFFBQUEsQ0FBUywwQ0FBVCxFQUFxRCxTQUFBO2FBQ25ELEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBO1FBQ25DLEtBQUEsQ0FBTSxHQUFOLEVBQVcsS0FBWCxDQUFpQixDQUFDLFNBQWxCLENBQTRCLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQWhCLENBQTVCO1FBQ0EsUUFBQSxDQUFTLElBQVQsRUFBZTtVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQWY7ZUFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLFFBQUQsRUFBVyxZQUFYLEVBQXlCLElBQXpCLENBQXJDLEVBQXFFO1VBQUEsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQUw7U0FBckU7TUFIbUMsQ0FBckM7SUFEbUQsQ0FBckQ7RUFQbUIsQ0FBckI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbkdpdE1lcmdlID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtbWVyZ2UnXG5cbmRlc2NyaWJlIFwiR2l0TWVyZ2VcIiwgLT5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNhbGxlZCB3aXRoIG5vIG9wdGlvbnNcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnYnJhbmNoJ1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnJ1xuICAgICAgR2l0TWVyZ2UocmVwbylcbiAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2JyYW5jaCcsICctLW5vLWNvbG9yJ10sIGN3ZDogcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KClcblxuICBkZXNjcmliZSBcIndoZW4gY2FsbGVkIHdpdGggeyByZW1vdGU6IHRydWUgfSBvcHRpb25cIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnYnJhbmNoIC1yJ1wiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAnJ1xuICAgICAgR2l0TWVyZ2UocmVwbywgcmVtb3RlOiB0cnVlKVxuICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnYnJhbmNoJywgJy0tbm8tY29sb3InLCAnLXInXSwgY3dkOiByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKVxuIl19
