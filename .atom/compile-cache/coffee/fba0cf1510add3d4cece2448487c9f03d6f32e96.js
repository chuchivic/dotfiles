(function() {
  var AtomRunner;

  AtomRunner = require('../lib/runner');

  describe("AtomRunner", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('atomRunner');
    });
    return describe("when the atom-runner:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.atom-runner')).not.toExist();
        atom.workspaceView.trigger('atom-runner:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.atom-runner')).toExist();
          atom.workspaceView.trigger('atom-runner:toggle');
          return expect(atom.workspaceView.find('.atom-runner')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXRvbS1ydW5uZXIvc3BlYy9hdG9tLXJ1bm5lci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQU9iLFFBQUEsQ0FBUyxZQUFULEVBQXVCLFNBQUE7QUFDckIsUUFBQTtJQUFBLGlCQUFBLEdBQW9CO0lBRXBCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBSTthQUN6QixpQkFBQSxHQUFvQixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUI7SUFGWCxDQUFYO1dBSUEsUUFBQSxDQUFTLGdEQUFULEVBQTJELFNBQUE7YUFDekQsRUFBQSxDQUFHLHFDQUFILEVBQTBDLFNBQUE7UUFDeEMsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsY0FBeEIsQ0FBUCxDQUErQyxDQUFDLEdBQUcsQ0FBQyxPQUFwRCxDQUFBO1FBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixvQkFBM0I7UUFFQSxlQUFBLENBQWdCLFNBQUE7aUJBQ2Q7UUFEYyxDQUFoQjtlQUdBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBbkIsQ0FBd0IsY0FBeEIsQ0FBUCxDQUErQyxDQUFDLE9BQWhELENBQUE7VUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLG9CQUEzQjtpQkFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixjQUF4QixDQUFQLENBQStDLENBQUMsR0FBRyxDQUFDLE9BQXBELENBQUE7UUFIRyxDQUFMO01BVndDLENBQTFDO0lBRHlELENBQTNEO0VBUHFCLENBQXZCO0FBUEEiLCJzb3VyY2VzQ29udGVudCI6WyJBdG9tUnVubmVyID0gcmVxdWlyZSAnLi4vbGliL3J1bm5lcidcblxuIyBVc2UgdGhlIGNvbW1hbmQgYHdpbmRvdzpydW4tcGFja2FnZS1zcGVjc2AgKGNtZC1hbHQtY3RybC1wKSB0byBydW4gc3BlY3MuXG4jXG4jIFRvIHJ1biBhIHNwZWNpZmljIGBpdGAgb3IgYGRlc2NyaWJlYCBibG9jayBhZGQgYW4gYGZgIHRvIHRoZSBmcm9udCAoZS5nLiBgZml0YFxuIyBvciBgZmRlc2NyaWJlYCkuIFJlbW92ZSB0aGUgYGZgIHRvIHVuZm9jdXMgdGhlIGJsb2NrLlxuXG5kZXNjcmliZSBcIkF0b21SdW5uZXJcIiwgLT5cbiAgYWN0aXZhdGlvblByb21pc2UgPSBudWxsXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGF0b20ud29ya3NwYWNlVmlldyA9IG5ldyBXb3Jrc3BhY2VWaWV3XG4gICAgYWN0aXZhdGlvblByb21pc2UgPSBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXRvbVJ1bm5lcicpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBhdG9tLXJ1bm5lcjp0b2dnbGUgZXZlbnQgaXMgdHJpZ2dlcmVkXCIsIC0+XG4gICAgaXQgXCJhdHRhY2hlcyBhbmQgdGhlbiBkZXRhY2hlcyB0aGUgdmlld1wiLCAtPlxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlVmlldy5maW5kKCcuYXRvbS1ydW5uZXInKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAjIFRoaXMgaXMgYW4gYWN0aXZhdGlvbiBldmVudCwgdHJpZ2dlcmluZyBpdCB3aWxsIGNhdXNlIHRoZSBwYWNrYWdlIHRvIGJlXG4gICAgICAjIGFjdGl2YXRlZC5cbiAgICAgIGF0b20ud29ya3NwYWNlVmlldy50cmlnZ2VyICdhdG9tLXJ1bm5lcjp0b2dnbGUnXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhY3RpdmF0aW9uUHJvbWlzZVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChhdG9tLndvcmtzcGFjZVZpZXcuZmluZCgnLmF0b20tcnVubmVyJykpLnRvRXhpc3QoKVxuICAgICAgICBhdG9tLndvcmtzcGFjZVZpZXcudHJpZ2dlciAnYXRvbS1ydW5uZXI6dG9nZ2xlJ1xuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2VWaWV3LmZpbmQoJy5hdG9tLXJ1bm5lcicpKS5ub3QudG9FeGlzdCgpXG4iXX0=
