(function() {
  var GitInit, git;

  git = require('../../lib/git');

  GitInit = require('../../lib/models/git-init');

  describe("GitInit", function() {
    return it("sets the project path to the new repo path", function() {
      spyOn(atom.project, 'setPaths');
      spyOn(atom.project, 'getPaths').andCallFake(function() {
        return ['some/path'];
      });
      spyOn(git, 'cmd').andCallFake(function() {
        return Promise.resolve(true);
      });
      return waitsForPromise(function() {
        return GitInit().then(function() {
          return expect(atom.project.setPaths).toHaveBeenCalledWith(['some/path']);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9tb2RlbHMvZ2l0LWluaXQtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEdBQUEsR0FBTSxPQUFBLENBQVEsZUFBUjs7RUFDTixPQUFBLEdBQVUsT0FBQSxDQUFRLDJCQUFSOztFQUVWLFFBQUEsQ0FBUyxTQUFULEVBQW9CLFNBQUE7V0FDbEIsRUFBQSxDQUFHLDRDQUFILEVBQWlELFNBQUE7TUFDL0MsS0FBQSxDQUFNLElBQUksQ0FBQyxPQUFYLEVBQW9CLFVBQXBCO01BQ0EsS0FBQSxDQUFNLElBQUksQ0FBQyxPQUFYLEVBQW9CLFVBQXBCLENBQStCLENBQUMsV0FBaEMsQ0FBNEMsU0FBQTtlQUFHLENBQUMsV0FBRDtNQUFILENBQTVDO01BQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsV0FBbEIsQ0FBOEIsU0FBQTtlQUM1QixPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQjtNQUQ0QixDQUE5QjthQUVBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLE9BQUEsQ0FBQSxDQUFTLENBQUMsSUFBVixDQUFlLFNBQUE7aUJBQ2IsTUFBQSxDQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsQ0FBQyxvQkFBOUIsQ0FBbUQsQ0FBQyxXQUFELENBQW5EO1FBRGEsQ0FBZjtNQURjLENBQWhCO0lBTCtDLENBQWpEO0VBRGtCLENBQXBCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xuR2l0SW5pdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9tb2RlbHMvZ2l0LWluaXQnXG5cbmRlc2NyaWJlIFwiR2l0SW5pdFwiLCAtPlxuICBpdCBcInNldHMgdGhlIHByb2plY3QgcGF0aCB0byB0aGUgbmV3IHJlcG8gcGF0aFwiLCAtPlxuICAgIHNweU9uKGF0b20ucHJvamVjdCwgJ3NldFBhdGhzJylcbiAgICBzcHlPbihhdG9tLnByb2plY3QsICdnZXRQYXRocycpLmFuZENhbGxGYWtlIC0+IFsnc29tZS9wYXRoJ11cbiAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgUHJvbWlzZS5yZXNvbHZlIHRydWVcbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIEdpdEluaXQoKS50aGVuIC0+XG4gICAgICAgIGV4cGVjdChhdG9tLnByb2plY3Quc2V0UGF0aHMpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnc29tZS9wYXRoJ11cbiJdfQ==
