(function() {
  var Os, Path, head, homedir, mocks, pathToRepoFile;

  Path = require('path');

  Os = require('os');

  homedir = Os.homedir();

  pathToRepoFile = Path.join(homedir, "some/repository/directory/file");

  head = jasmine.createSpyObj('head', ['replace']);

  module.exports = mocks = {
    pathToRepoFile: pathToRepoFile,
    pathToSampleDir: homedir,
    repo: {
      getPath: function() {
        return Path.join(this.getWorkingDirectory(), ".git");
      },
      getWorkingDirectory: function() {
        return Path.join(homedir, "some/repository");
      },
      getConfigValue: function(key) {
        return 'some-value';
      },
      refreshStatus: function() {
        return void 0;
      },
      relativize: function(path) {
        if (path === pathToRepoFile) {
          return "directory/file";
        } else {
          return path;
        }
      },
      getReferences: function() {
        return {
          heads: [head]
        };
      },
      getShortHead: function() {
        return 'short head';
      },
      getUpstreamBranch: function() {
        return 'refs/remotes/origin/foo';
      },
      isPathModified: function() {
        return false;
      },
      repo: {
        submoduleForPath: function(path) {
          return void 0;
        }
      }
    },
    currentPane: {
      isAlive: function() {
        return true;
      },
      activate: function() {
        return void 0;
      },
      destroy: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return pathToRepoFile;
            }
          }
        ];
      }
    },
    commitPane: {
      isAlive: function() {
        return true;
      },
      destroy: function() {
        return mocks.textEditor.destroy();
      },
      splitRight: function() {
        return void 0;
      },
      getItems: function() {
        return [
          {
            getURI: function() {
              return Path.join(mocks.repo.getPath(), 'COMMIT_EDITMSG');
            }
          }
        ];
      }
    },
    textEditor: {
      getPath: function() {
        return pathToRepoFile;
      },
      getURI: function() {
        return pathToRepoFile;
      },
      onDidDestroy: function(destroy) {
        this.destroy = destroy;
        return {
          dispose: function() {}
        };
      },
      onDidSave: function(save) {
        this.save = save;
        return {
          dispose: function() {
            return void 0;
          }
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9maXh0dXJlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsT0FBQSxHQUFVLEVBQUUsQ0FBQyxPQUFILENBQUE7O0VBQ1YsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsZ0NBQW5COztFQUNqQixJQUFBLEdBQU8sT0FBTyxDQUFDLFlBQVIsQ0FBcUIsTUFBckIsRUFBNkIsQ0FBQyxTQUFELENBQTdCOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQUEsR0FDZjtJQUFBLGNBQUEsRUFBZ0IsY0FBaEI7SUFDQSxlQUFBLEVBQWlCLE9BRGpCO0lBR0EsSUFBQSxFQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQVYsRUFBc0MsTUFBdEM7TUFBSCxDQUFUO01BQ0EsbUJBQUEsRUFBcUIsU0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixpQkFBbkI7TUFBSCxDQURyQjtNQUVBLGNBQUEsRUFBZ0IsU0FBQyxHQUFEO2VBQVM7TUFBVCxDQUZoQjtNQUdBLGFBQUEsRUFBZSxTQUFBO2VBQUc7TUFBSCxDQUhmO01BSUEsVUFBQSxFQUFZLFNBQUMsSUFBRDtRQUFVLElBQUcsSUFBQSxLQUFRLGNBQVg7aUJBQStCLGlCQUEvQjtTQUFBLE1BQUE7aUJBQXFELEtBQXJEOztNQUFWLENBSlo7TUFLQSxhQUFBLEVBQWUsU0FBQTtlQUNiO1VBQUEsS0FBQSxFQUFPLENBQUMsSUFBRCxDQUFQOztNQURhLENBTGY7TUFPQSxZQUFBLEVBQWMsU0FBQTtlQUFHO01BQUgsQ0FQZDtNQVFBLGlCQUFBLEVBQW1CLFNBQUE7ZUFBRztNQUFILENBUm5CO01BU0EsY0FBQSxFQUFnQixTQUFBO2VBQUc7TUFBSCxDQVRoQjtNQVVBLElBQUEsRUFDRTtRQUFBLGdCQUFBLEVBQWtCLFNBQUMsSUFBRDtpQkFBVTtRQUFWLENBQWxCO09BWEY7S0FKRjtJQWlCQSxXQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQVMsU0FBQTtlQUFHO01BQUgsQ0FBVDtNQUNBLFFBQUEsRUFBVSxTQUFBO2VBQUc7TUFBSCxDQURWO01BRUEsT0FBQSxFQUFTLFNBQUE7ZUFBRztNQUFILENBRlQ7TUFHQSxRQUFBLEVBQVUsU0FBQTtlQUFHO1VBQ1g7WUFBQSxNQUFBLEVBQVEsU0FBQTtxQkFBRztZQUFILENBQVI7V0FEVzs7TUFBSCxDQUhWO0tBbEJGO0lBeUJBLFVBQUEsRUFDRTtNQUFBLE9BQUEsRUFBUyxTQUFBO2VBQUc7TUFBSCxDQUFUO01BQ0EsT0FBQSxFQUFTLFNBQUE7ZUFBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQWpCLENBQUE7TUFBSCxDQURUO01BRUEsVUFBQSxFQUFZLFNBQUE7ZUFBRztNQUFILENBRlo7TUFHQSxRQUFBLEVBQVUsU0FBQTtlQUFHO1VBQ1g7WUFBQSxNQUFBLEVBQVEsU0FBQTtxQkFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBWCxDQUFBLENBQVYsRUFBZ0MsZ0JBQWhDO1lBQUgsQ0FBUjtXQURXOztNQUFILENBSFY7S0ExQkY7SUFpQ0EsVUFBQSxFQUNFO01BQUEsT0FBQSxFQUFTLFNBQUE7ZUFBRztNQUFILENBQVQ7TUFDQSxNQUFBLEVBQVEsU0FBQTtlQUFHO01BQUgsQ0FEUjtNQUVBLFlBQUEsRUFBYyxTQUFDLE9BQUQ7UUFBQyxJQUFDLENBQUEsVUFBRDtlQUNiO1VBQUEsT0FBQSxFQUFTLFNBQUEsR0FBQSxDQUFUOztNQURZLENBRmQ7TUFJQSxTQUFBLEVBQVcsU0FBQyxJQUFEO1FBQUMsSUFBQyxDQUFBLE9BQUQ7ZUFDVjtVQUFBLE9BQUEsRUFBUyxTQUFBO21CQUFHO1VBQUgsQ0FBVDs7TUFEUyxDQUpYO0tBbENGOztBQVJGIiwic291cmNlc0NvbnRlbnQiOlsiUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5PcyA9IHJlcXVpcmUgJ29zJ1xuXG5ob21lZGlyID0gT3MuaG9tZWRpcigpXG5wYXRoVG9SZXBvRmlsZSA9IFBhdGguam9pbihob21lZGlyLCBcInNvbWUvcmVwb3NpdG9yeS9kaXJlY3RvcnkvZmlsZVwiKVxuaGVhZCA9IGphc21pbmUuY3JlYXRlU3B5T2JqKCdoZWFkJywgWydyZXBsYWNlJ10pXG5cbm1vZHVsZS5leHBvcnRzID0gbW9ja3MgPVxuICBwYXRoVG9SZXBvRmlsZTogcGF0aFRvUmVwb0ZpbGVcbiAgcGF0aFRvU2FtcGxlRGlyOiBob21lZGlyXG5cbiAgcmVwbzpcbiAgICBnZXRQYXRoOiAtPiBQYXRoLmpvaW4gdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksIFwiLmdpdFwiXG4gICAgZ2V0V29ya2luZ0RpcmVjdG9yeTogLT4gUGF0aC5qb2luKGhvbWVkaXIsIFwic29tZS9yZXBvc2l0b3J5XCIpXG4gICAgZ2V0Q29uZmlnVmFsdWU6IChrZXkpIC0+ICdzb21lLXZhbHVlJ1xuICAgIHJlZnJlc2hTdGF0dXM6IC0+IHVuZGVmaW5lZFxuICAgIHJlbGF0aXZpemU6IChwYXRoKSAtPiBpZiBwYXRoIGlzIHBhdGhUb1JlcG9GaWxlIHRoZW4gXCJkaXJlY3RvcnkvZmlsZVwiIGVsc2UgcGF0aFxuICAgIGdldFJlZmVyZW5jZXM6IC0+XG4gICAgICBoZWFkczogW2hlYWRdXG4gICAgZ2V0U2hvcnRIZWFkOiAtPiAnc2hvcnQgaGVhZCdcbiAgICBnZXRVcHN0cmVhbUJyYW5jaDogLT4gJ3JlZnMvcmVtb3Rlcy9vcmlnaW4vZm9vJ1xuICAgIGlzUGF0aE1vZGlmaWVkOiAtPiBmYWxzZVxuICAgIHJlcG86XG4gICAgICBzdWJtb2R1bGVGb3JQYXRoOiAocGF0aCkgLT4gdW5kZWZpbmVkXG5cbiAgY3VycmVudFBhbmU6XG4gICAgaXNBbGl2ZTogLT4gdHJ1ZVxuICAgIGFjdGl2YXRlOiAtPiB1bmRlZmluZWRcbiAgICBkZXN0cm95OiAtPiB1bmRlZmluZWRcbiAgICBnZXRJdGVtczogLT4gW1xuICAgICAgZ2V0VVJJOiAtPiBwYXRoVG9SZXBvRmlsZVxuICAgIF1cblxuICBjb21taXRQYW5lOlxuICAgIGlzQWxpdmU6IC0+IHRydWVcbiAgICBkZXN0cm95OiAtPiBtb2Nrcy50ZXh0RWRpdG9yLmRlc3Ryb3koKVxuICAgIHNwbGl0UmlnaHQ6IC0+IHVuZGVmaW5lZFxuICAgIGdldEl0ZW1zOiAtPiBbXG4gICAgICBnZXRVUkk6IC0+IFBhdGguam9pbiBtb2Nrcy5yZXBvLmdldFBhdGgoKSwgJ0NPTU1JVF9FRElUTVNHJ1xuICAgIF1cblxuICB0ZXh0RWRpdG9yOlxuICAgIGdldFBhdGg6IC0+IHBhdGhUb1JlcG9GaWxlXG4gICAgZ2V0VVJJOiAtPiBwYXRoVG9SZXBvRmlsZVxuICAgIG9uRGlkRGVzdHJveTogKEBkZXN0cm95KSAtPlxuICAgICAgZGlzcG9zZTogLT5cbiAgICBvbkRpZFNhdmU6IChAc2F2ZSkgLT5cbiAgICAgIGRpc3Bvc2U6IC0+IHVuZGVmaW5lZFxuIl19
