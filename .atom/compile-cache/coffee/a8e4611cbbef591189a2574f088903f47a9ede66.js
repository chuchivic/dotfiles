(function() {
  var git, quibble, repo;

  quibble = require('quibble');

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  describe("GitStageFilesBeta", function() {
    return it("calls git.unstagedFiles and git.stagedFiles", function() {
      var GitStageFiles, SelectView, stagedFile, unstagedFile;
      SelectView = quibble('../../lib/views/select-stage-files-view-beta', jasmine.createSpy('SelectView'));
      GitStageFiles = require('../../lib/models/git-stage-files-beta');
      unstagedFile = {
        path: 'unstaged.file',
        status: 'M',
        staged: false
      };
      stagedFile = {
        path: 'staged.file',
        status: 'M',
        staged: true
      };
      spyOn(git, 'unstagedFiles').andReturn(Promise.resolve([unstagedFile]));
      spyOn(git, 'stagedFiles').andReturn(Promise.resolve([stagedFile]));
      waitsForPromise(function() {
        return GitStageFiles(repo);
      });
      return runs(function() {
        expect(git.unstagedFiles).toHaveBeenCalled();
        expect(git.stagedFiles).toHaveBeenCalled();
        return expect(SelectView).toHaveBeenCalledWith(repo, [unstagedFile, stagedFile]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LXN0YWdlLWZpbGVzLWJldGEtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFFVCxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtXQUM1QixFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQTtBQUNoRCxVQUFBO01BQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSw4Q0FBUixFQUF3RCxPQUFPLENBQUMsU0FBUixDQUFrQixZQUFsQixDQUF4RDtNQUNiLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVDQUFSO01BRWhCLFlBQUEsR0FBZTtRQUFBLElBQUEsRUFBTSxlQUFOO1FBQXVCLE1BQUEsRUFBUSxHQUEvQjtRQUFvQyxNQUFBLEVBQVEsS0FBNUM7O01BQ2YsVUFBQSxHQUFhO1FBQUEsSUFBQSxFQUFNLGFBQU47UUFBcUIsTUFBQSxFQUFRLEdBQTdCO1FBQWtDLE1BQUEsRUFBUSxJQUExQzs7TUFFYixLQUFBLENBQU0sR0FBTixFQUFXLGVBQVgsQ0FBMkIsQ0FBQyxTQUE1QixDQUFzQyxPQUFPLENBQUMsT0FBUixDQUFnQixDQUFDLFlBQUQsQ0FBaEIsQ0FBdEM7TUFDQSxLQUFBLENBQU0sR0FBTixFQUFXLGFBQVgsQ0FBeUIsQ0FBQyxTQUExQixDQUFvQyxPQUFPLENBQUMsT0FBUixDQUFnQixDQUFDLFVBQUQsQ0FBaEIsQ0FBcEM7TUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFBRyxhQUFBLENBQWMsSUFBZDtNQUFILENBQWhCO2FBQ0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxNQUFBLENBQU8sR0FBRyxDQUFDLGFBQVgsQ0FBeUIsQ0FBQyxnQkFBMUIsQ0FBQTtRQUNBLE1BQUEsQ0FBTyxHQUFHLENBQUMsV0FBWCxDQUF1QixDQUFDLGdCQUF4QixDQUFBO2VBQ0EsTUFBQSxDQUFPLFVBQVAsQ0FBa0IsQ0FBQyxvQkFBbkIsQ0FBd0MsSUFBeEMsRUFBOEMsQ0FBQyxZQUFELEVBQWUsVUFBZixDQUE5QztNQUhHLENBQUw7SUFWZ0QsQ0FBbEQ7RUFENEIsQ0FBOUI7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbInF1aWJibGUgPSByZXF1aXJlICdxdWliYmxlJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuXG5kZXNjcmliZSBcIkdpdFN0YWdlRmlsZXNCZXRhXCIsIC0+XG4gIGl0IFwiY2FsbHMgZ2l0LnVuc3RhZ2VkRmlsZXMgYW5kIGdpdC5zdGFnZWRGaWxlc1wiLCAtPlxuICAgIFNlbGVjdFZpZXcgPSBxdWliYmxlICcuLi8uLi9saWIvdmlld3Mvc2VsZWN0LXN0YWdlLWZpbGVzLXZpZXctYmV0YScsIGphc21pbmUuY3JlYXRlU3B5KCdTZWxlY3RWaWV3JylcbiAgICBHaXRTdGFnZUZpbGVzID0gcmVxdWlyZSAnLi4vLi4vbGliL21vZGVscy9naXQtc3RhZ2UtZmlsZXMtYmV0YSdcblxuICAgIHVuc3RhZ2VkRmlsZSA9IHBhdGg6ICd1bnN0YWdlZC5maWxlJywgc3RhdHVzOiAnTScsIHN0YWdlZDogZmFsc2VcbiAgICBzdGFnZWRGaWxlID0gcGF0aDogJ3N0YWdlZC5maWxlJywgc3RhdHVzOiAnTScsIHN0YWdlZDogdHJ1ZVxuXG4gICAgc3B5T24oZ2l0LCAndW5zdGFnZWRGaWxlcycpLmFuZFJldHVybiBQcm9taXNlLnJlc29sdmUoW3Vuc3RhZ2VkRmlsZV0pXG4gICAgc3B5T24oZ2l0LCAnc3RhZ2VkRmlsZXMnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtzdGFnZWRGaWxlXSlcbiAgICB3YWl0c0ZvclByb21pc2UgLT4gR2l0U3RhZ2VGaWxlcyByZXBvXG4gICAgcnVucyAtPlxuICAgICAgZXhwZWN0KGdpdC51bnN0YWdlZEZpbGVzKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChnaXQuc3RhZ2VkRmlsZXMpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgZXhwZWN0KFNlbGVjdFZpZXcpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIHJlcG8sIFt1bnN0YWdlZEZpbGUsIHN0YWdlZEZpbGVdXG4iXX0=
