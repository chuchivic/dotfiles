(function() {
  var packagesToTest;

  packagesToTest = {
    Python: {
      name: 'language-python',
      file: 'test.py'
    }
  };

  describe('Python autocompletions', function() {
    var editor, getCompletions, provider, ref;
    ref = [], editor = ref[0], provider = ref[1];
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-python');
      });
      waitsForPromise(function() {
        return atom.workspace.open('test.py');
      });
      runs(function() {
        editor = atom.workspace.getActiveTextEditor();
        editor.setGrammar(atom.grammars.grammarsByScopeName['source.python']);
        return atom.packages.loadPackage('autocomplete-python').activationHooks = [];
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-python');
      });
      runs(function() {
        return atom.packages.getActivePackage('autocomplete-python').mainModule.load();
      });
      return runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-python').mainModule.getProvider();
      });
    });
    it('autocompletes builtins', function() {
      editor.setText('isinstanc');
      editor.setCursorBufferPosition([1, 0]);
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          var completion, i, len;
          for (i = 0, len = completions.length; i < len; i++) {
            completion = completions[i];
            expect(completion.text.length).toBeGreaterThan(0);
            expect(completion.text).toBe('isinstance');
          }
          return expect(completions.length).toBe(1);
        });
      });
    });
    it('autocompletes python keywords', function() {
      var completion, completions, i, len;
      editor.setText('impo');
      editor.setCursorBufferPosition([1, 0]);
      completions = getCompletions();
      for (i = 0, len = completions.length; i < len; i++) {
        completion = completions[i];
        if (completion.type === 'keyword') {
          expect(completion.text).toBe('import');
        }
        expect(completion.text.length).toBeGreaterThan(0);
      }
      return expect(completions.length).toBe(3);
    });
    return it('autocompletes defined functions', function() {
      editor.setText("def hello_world():\n  return True\nhell");
      editor.setCursorBufferPosition([3, 0]);
      return waitsForPromise(function() {
        return getCompletions().then(function(completions) {
          expect(completions[0].text).toBe('hello_world');
          return expect(completions.length).toBe(1);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9zcGVjL3Byb3ZpZGVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxjQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0saUJBQU47TUFDQSxJQUFBLEVBQU0sU0FETjtLQURGOzs7RUFJRixRQUFBLENBQVMsd0JBQVQsRUFBbUMsU0FBQTtBQUNqQyxRQUFBO0lBQUEsTUFBcUIsRUFBckIsRUFBQyxlQUFELEVBQVM7SUFFVCxjQUFBLEdBQWlCLFNBQUE7QUFDZixVQUFBO01BQUEsTUFBQSxHQUFTLE1BQU0sQ0FBQyxhQUFQLENBQUE7TUFDVCxLQUFBLEdBQVEsTUFBTSxDQUFDLHVDQUFQLENBQUE7TUFDUixHQUFBLEdBQU0sTUFBTSxDQUFDLGlCQUFQLENBQUE7TUFDTixNQUFBLEdBQVMsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQyxLQUFELEVBQVEsR0FBUixDQUF0QjtNQUNULE9BQUEsR0FDRTtRQUFBLE1BQUEsRUFBUSxNQUFSO1FBQ0EsY0FBQSxFQUFnQixHQURoQjtRQUVBLGVBQUEsRUFBaUIsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FGakI7UUFHQSxNQUFBLEVBQVEsTUFIUjs7YUFJRixRQUFRLENBQUMsY0FBVCxDQUF3QixPQUF4QjtJQVZlO0lBWWpCLFVBQUEsQ0FBVyxTQUFBO01BQ1QsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGlCQUE5QjtNQUFILENBQWhCO01BQ0EsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFNBQXBCO01BQUgsQ0FBaEI7TUFDQSxJQUFBLENBQUssU0FBQTtRQUNILE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7UUFDVCxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFvQixDQUFBLGVBQUEsQ0FBcEQ7ZUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIscUJBQTFCLENBQWdELENBQUMsZUFBakQsR0FBbUU7TUFIaEUsQ0FBTDtNQUlBLGVBQUEsQ0FBZ0IsU0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixxQkFBOUI7TUFBSCxDQUFoQjtNQUNBLElBQUEsQ0FBSyxTQUFBO2VBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixxQkFBL0IsQ0FBcUQsQ0FBQyxVQUFVLENBQUMsSUFBakUsQ0FBQTtNQURHLENBQUw7YUFFQSxJQUFBLENBQUssU0FBQTtlQUFHLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQ2pCLHFCQURpQixDQUNLLENBQUMsVUFBVSxDQUFDLFdBRGpCLENBQUE7TUFBZCxDQUFMO0lBVlMsQ0FBWDtJQWFBLEVBQUEsQ0FBRyx3QkFBSCxFQUE2QixTQUFBO01BQzNCLE1BQU0sQ0FBQyxPQUFQLENBQWUsV0FBZjtNQUNBLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLENBQUQsRUFBSSxDQUFKLENBQS9CO2FBQ0EsZUFBQSxDQUFnQixTQUFBO2VBQ2QsY0FBQSxDQUFBLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxXQUFEO0FBQ3BCLGNBQUE7QUFBQSxlQUFBLDZDQUFBOztZQUNFLE1BQUEsQ0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQXZCLENBQThCLENBQUMsZUFBL0IsQ0FBK0MsQ0FBL0M7WUFDQSxNQUFBLENBQU8sVUFBVSxDQUFDLElBQWxCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsWUFBN0I7QUFGRjtpQkFHQSxNQUFBLENBQU8sV0FBVyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEM7UUFKb0IsQ0FBdEI7TUFEYyxDQUFoQjtJQUgyQixDQUE3QjtJQVVBLEVBQUEsQ0FBRywrQkFBSCxFQUFvQyxTQUFBO0FBQ2xDLFVBQUE7TUFBQSxNQUFNLENBQUMsT0FBUCxDQUFlLE1BQWY7TUFDQSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUEvQjtNQUNBLFdBQUEsR0FBYyxjQUFBLENBQUE7QUFDZCxXQUFBLDZDQUFBOztRQUNFLElBQUcsVUFBVSxDQUFDLElBQVgsS0FBbUIsU0FBdEI7VUFDRSxNQUFBLENBQU8sVUFBVSxDQUFDLElBQWxCLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsUUFBN0IsRUFERjs7UUFFQSxNQUFBLENBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxNQUF2QixDQUE4QixDQUFDLGVBQS9CLENBQStDLENBQS9DO0FBSEY7YUFJQSxNQUFBLENBQU8sV0FBVyxDQUFDLE1BQW5CLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsQ0FBaEM7SUFSa0MsQ0FBcEM7V0FVQSxFQUFBLENBQUcsaUNBQUgsRUFBc0MsU0FBQTtNQUNwQyxNQUFNLENBQUMsT0FBUCxDQUFlLHlDQUFmO01BS0EsTUFBTSxDQUFDLHVCQUFQLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0I7YUFDQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxjQUFBLENBQUEsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixTQUFDLFdBQUQ7VUFDcEIsTUFBQSxDQUFPLFdBQVksQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUF0QixDQUEyQixDQUFDLElBQTVCLENBQWlDLGFBQWpDO2lCQUNBLE1BQUEsQ0FBTyxXQUFXLENBQUMsTUFBbkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFoQztRQUZvQixDQUF0QjtNQURjLENBQWhCO0lBUG9DLENBQXRDO0VBaERpQyxDQUFuQztBQUxBIiwic291cmNlc0NvbnRlbnQiOlsicGFja2FnZXNUb1Rlc3QgPVxuICBQeXRob246XG4gICAgbmFtZTogJ2xhbmd1YWdlLXB5dGhvbidcbiAgICBmaWxlOiAndGVzdC5weSdcblxuZGVzY3JpYmUgJ1B5dGhvbiBhdXRvY29tcGxldGlvbnMnLCAtPlxuICBbZWRpdG9yLCBwcm92aWRlcl0gPSBbXVxuXG4gIGdldENvbXBsZXRpb25zID0gLT5cbiAgICBjdXJzb3IgPSBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG4gICAgc3RhcnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbmQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIHByZWZpeCA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShbc3RhcnQsIGVuZF0pXG4gICAgcmVxdWVzdCA9XG4gICAgICBlZGl0b3I6IGVkaXRvclxuICAgICAgYnVmZmVyUG9zaXRpb246IGVuZFxuICAgICAgc2NvcGVEZXNjcmlwdG9yOiBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKClcbiAgICAgIHByZWZpeDogcHJlZml4XG4gICAgcHJvdmlkZXIuZ2V0U3VnZ2VzdGlvbnMocmVxdWVzdClcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1weXRob24nKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKCd0ZXN0LnB5JylcbiAgICBydW5zIC0+XG4gICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hcnNCeVNjb3BlTmFtZVsnc291cmNlLnB5dGhvbiddKVxuICAgICAgYXRvbS5wYWNrYWdlcy5sb2FkUGFja2FnZSgnYXV0b2NvbXBsZXRlLXB5dGhvbicpLmFjdGl2YXRpb25Ib29rcyA9IFtdXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcHl0aG9uJylcbiAgICBydW5zIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ2F1dG9jb21wbGV0ZS1weXRob24nKS5tYWluTW9kdWxlLmxvYWQoKVxuICAgIHJ1bnMgLT4gcHJvdmlkZXIgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoXG4gICAgICAnYXV0b2NvbXBsZXRlLXB5dGhvbicpLm1haW5Nb2R1bGUuZ2V0UHJvdmlkZXIoKVxuXG4gIGl0ICdhdXRvY29tcGxldGVzIGJ1aWx0aW5zJywgLT5cbiAgICBlZGl0b3Iuc2V0VGV4dCAnaXNpbnN0YW5jJ1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMSwgMF0pXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBnZXRDb21wbGV0aW9ucygpLnRoZW4gKGNvbXBsZXRpb25zKSAtPlxuICAgICAgICBmb3IgY29tcGxldGlvbiBpbiBjb21wbGV0aW9uc1xuICAgICAgICAgIGV4cGVjdChjb21wbGV0aW9uLnRleHQubGVuZ3RoKS50b0JlR3JlYXRlclRoYW4gMFxuICAgICAgICAgIGV4cGVjdChjb21wbGV0aW9uLnRleHQpLnRvQmUgJ2lzaW5zdGFuY2UnXG4gICAgICAgIGV4cGVjdChjb21wbGV0aW9ucy5sZW5ndGgpLnRvQmUgMVxuXG4gIGl0ICdhdXRvY29tcGxldGVzIHB5dGhvbiBrZXl3b3JkcycsIC0+XG4gICAgZWRpdG9yLnNldFRleHQgJ2ltcG8nXG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFsxLCAwXSlcbiAgICBjb21wbGV0aW9ucyA9IGdldENvbXBsZXRpb25zKClcbiAgICBmb3IgY29tcGxldGlvbiBpbiBjb21wbGV0aW9uc1xuICAgICAgaWYgY29tcGxldGlvbi50eXBlID09ICdrZXl3b3JkJ1xuICAgICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0KS50b0JlICdpbXBvcnQnXG4gICAgICBleHBlY3QoY29tcGxldGlvbi50ZXh0Lmxlbmd0aCkudG9CZUdyZWF0ZXJUaGFuIDBcbiAgICBleHBlY3QoY29tcGxldGlvbnMubGVuZ3RoKS50b0JlIDNcblxuICBpdCAnYXV0b2NvbXBsZXRlcyBkZWZpbmVkIGZ1bmN0aW9ucycsIC0+XG4gICAgZWRpdG9yLnNldFRleHQgXCJcIlwiXG4gICAgICBkZWYgaGVsbG9fd29ybGQoKTpcbiAgICAgICAgcmV0dXJuIFRydWVcbiAgICAgIGhlbGxcbiAgICBcIlwiXCJcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzMsIDBdKVxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgZ2V0Q29tcGxldGlvbnMoKS50aGVuIChjb21wbGV0aW9ucykgLT5cbiAgICAgICAgZXhwZWN0KGNvbXBsZXRpb25zWzBdLnRleHQpLnRvQmUgJ2hlbGxvX3dvcmxkJ1xuICAgICAgICBleHBlY3QoY29tcGxldGlvbnMubGVuZ3RoKS50b0JlIDFcbiJdfQ==
