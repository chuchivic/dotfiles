(function() {
  var getView, getVimState, packageName, ref;

  ref = require('./spec-helper'), getVimState = ref.getVimState, getView = ref.getView;

  packageName = 'vim-mode-plus';

  describe("vim-mode-plus", function() {
    var editor, editorElement, ensure, ref1, set, vimState, workspaceElement;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4], workspaceElement = ref1[5];
    beforeEach(function() {
      getVimState(function(_vimState, vim) {
        vimState = _vimState;
        editor = _vimState.editor, editorElement = _vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
      workspaceElement = getView(atom.workspace);
      return waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
    });
    describe(".activate", function() {
      it("puts the editor in normal-mode initially by default", function() {
        return ensure(null, {
          mode: 'normal'
        });
      });
      return it("shows the current vim mode in the status bar", function() {
        var statusBarTile;
        statusBarTile = null;
        waitsFor(function() {
          return statusBarTile = workspaceElement.querySelector("#status-bar-vim-mode-plus");
        });
        return runs(function() {
          expect(statusBarTile.textContent).toBe("N");
          ensure('i', {
            mode: 'insert'
          });
          return expect(statusBarTile.textContent).toBe("I");
        });
      });
    });
    return describe(".deactivate", function() {
      it("removes the vim classes from the editor", function() {
        atom.packages.deactivatePackage(packageName);
        expect(editorElement.classList.contains("vim-mode-plus")).toBe(false);
        return expect(editorElement.classList.contains("normal-mode")).toBe(false);
      });
      return it("removes the vim commands from the editor element", function() {
        var vimCommands;
        vimCommands = function() {
          return atom.commands.findCommands({
            target: editorElement
          }).filter(function(cmd) {
            return cmd.name.startsWith("vim-mode-plus:");
          });
        };
        expect(vimCommands().length).toBeGreaterThan(0);
        atom.packages.deactivatePackage(packageName);
        return expect(vimCommands().length).toBe(0);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3ZpbS1tb2RlLXBsdXMtc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQXlCLE9BQUEsQ0FBUSxlQUFSLENBQXpCLEVBQUMsNkJBQUQsRUFBYzs7RUFFZCxXQUFBLEdBQWM7O0VBQ2QsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQTtBQUN4QixRQUFBO0lBQUEsT0FBbUUsRUFBbkUsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxnQkFBZCxFQUFzQix1QkFBdEIsRUFBcUMsa0JBQXJDLEVBQStDO0lBRS9DLFVBQUEsQ0FBVyxTQUFBO01BQ1QsV0FBQSxDQUFZLFNBQUMsU0FBRCxFQUFZLEdBQVo7UUFDVixRQUFBLEdBQVc7UUFDVix5QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWdCO01BSE4sQ0FBWjtNQUtBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxJQUFJLENBQUMsU0FBYjthQUVuQixlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsWUFBOUI7TUFEYyxDQUFoQjtJQVJTLENBQVg7SUFXQSxRQUFBLENBQVMsV0FBVCxFQUFzQixTQUFBO01BQ3BCLEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBO2VBQ3hELE1BQUEsQ0FBTyxJQUFQLEVBQWE7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUFiO01BRHdELENBQTFEO2FBR0EsRUFBQSxDQUFHLDhDQUFILEVBQW1ELFNBQUE7QUFDakQsWUFBQTtRQUFBLGFBQUEsR0FBZ0I7UUFFaEIsUUFBQSxDQUFTLFNBQUE7aUJBQ1AsYUFBQSxHQUFnQixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQiwyQkFBL0I7UUFEVCxDQUFUO2VBR0EsSUFBQSxDQUFLLFNBQUE7VUFDSCxNQUFBLENBQU8sYUFBYSxDQUFDLFdBQXJCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkM7VUFDQSxNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBWjtpQkFDQSxNQUFBLENBQU8sYUFBYSxDQUFDLFdBQXJCLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsR0FBdkM7UUFIRyxDQUFMO01BTmlELENBQW5EO0lBSm9CLENBQXRCO1dBZUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtNQUN0QixFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtRQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFkLENBQWdDLFdBQWhDO1FBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsZUFBakMsQ0FBUCxDQUF5RCxDQUFDLElBQTFELENBQStELEtBQS9EO2VBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsYUFBakMsQ0FBUCxDQUF1RCxDQUFDLElBQXhELENBQTZELEtBQTdEO01BSDRDLENBQTlDO2FBS0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUE7QUFDckQsWUFBQTtRQUFBLFdBQUEsR0FBYyxTQUFBO2lCQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBZCxDQUEyQjtZQUFBLE1BQUEsRUFBUSxhQUFSO1dBQTNCLENBQWlELENBQUMsTUFBbEQsQ0FBeUQsU0FBQyxHQUFEO21CQUN2RCxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVQsQ0FBb0IsZ0JBQXBCO1VBRHVELENBQXpEO1FBRFk7UUFJZCxNQUFBLENBQU8sV0FBQSxDQUFBLENBQWEsQ0FBQyxNQUFyQixDQUE0QixDQUFDLGVBQTdCLENBQTZDLENBQTdDO1FBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBZCxDQUFnQyxXQUFoQztlQUNBLE1BQUEsQ0FBTyxXQUFBLENBQUEsQ0FBYSxDQUFDLE1BQXJCLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsQ0FBbEM7TUFQcUQsQ0FBdkQ7SUFOc0IsQ0FBeEI7RUE3QndCLENBQTFCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGdldFZpZXd9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxucGFja2FnZU5hbWUgPSAndmltLW1vZGUtcGx1cydcbmRlc2NyaWJlIFwidmltLW1vZGUtcGx1c1wiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGUsIHdvcmtzcGFjZUVsZW1lbnRdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKF92aW1TdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBfdmltU3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gX3ZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmV9ID0gdmltXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3N0YXR1cy1iYXInKVxuXG4gIGRlc2NyaWJlIFwiLmFjdGl2YXRlXCIsIC0+XG4gICAgaXQgXCJwdXRzIHRoZSBlZGl0b3IgaW4gbm9ybWFsLW1vZGUgaW5pdGlhbGx5IGJ5IGRlZmF1bHRcIiwgLT5cbiAgICAgIGVuc3VyZSBudWxsLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgaXQgXCJzaG93cyB0aGUgY3VycmVudCB2aW0gbW9kZSBpbiB0aGUgc3RhdHVzIGJhclwiLCAtPlxuICAgICAgc3RhdHVzQmFyVGlsZSA9IG51bGxcblxuICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgc3RhdHVzQmFyVGlsZSA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNzdGF0dXMtYmFyLXZpbS1tb2RlLXBsdXNcIilcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3Qoc3RhdHVzQmFyVGlsZS50ZXh0Q29udGVudCkudG9CZShcIk5cIilcbiAgICAgICAgZW5zdXJlICdpJywgbW9kZTogJ2luc2VydCdcbiAgICAgICAgZXhwZWN0KHN0YXR1c0JhclRpbGUudGV4dENvbnRlbnQpLnRvQmUoXCJJXCIpXG5cbiAgZGVzY3JpYmUgXCIuZGVhY3RpdmF0ZVwiLCAtPlxuICAgIGl0IFwicmVtb3ZlcyB0aGUgdmltIGNsYXNzZXMgZnJvbSB0aGUgZWRpdG9yXCIsIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmRlYWN0aXZhdGVQYWNrYWdlKHBhY2thZ2VOYW1lKVxuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwidmltLW1vZGUtcGx1c1wiKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm5vcm1hbC1tb2RlXCIpKS50b0JlKGZhbHNlKVxuXG4gICAgaXQgXCJyZW1vdmVzIHRoZSB2aW0gY29tbWFuZHMgZnJvbSB0aGUgZWRpdG9yIGVsZW1lbnRcIiwgLT5cbiAgICAgIHZpbUNvbW1hbmRzID0gLT5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5maW5kQ29tbWFuZHModGFyZ2V0OiBlZGl0b3JFbGVtZW50KS5maWx0ZXIgKGNtZCkgLT5cbiAgICAgICAgICBjbWQubmFtZS5zdGFydHNXaXRoKFwidmltLW1vZGUtcGx1czpcIilcblxuICAgICAgZXhwZWN0KHZpbUNvbW1hbmRzKCkubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4oMClcbiAgICAgIGF0b20ucGFja2FnZXMuZGVhY3RpdmF0ZVBhY2thZ2UocGFja2FnZU5hbWUpXG4gICAgICBleHBlY3QodmltQ29tbWFuZHMoKS5sZW5ndGgpLnRvQmUoMClcbiJdfQ==
