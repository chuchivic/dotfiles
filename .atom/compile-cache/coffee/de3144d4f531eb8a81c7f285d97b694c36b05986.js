(function() {
  var RemoveListView, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  RemoveListView = require('../../lib/views/remove-list-view');

  describe("RemoveListView", function() {
    return it("displays a list of files", function() {
      var view;
      view = new RemoveListView(repo, ['file1', 'file2']);
      return expect(view.items.length).toBe(2);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9yZW1vdmUtYnJhbmNoLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxlQUFSOztFQUNMLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVI7O0VBRWpCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO1dBQ3pCLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBO0FBQzdCLFVBQUE7TUFBQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixDQUFDLE9BQUQsRUFBVSxPQUFWLENBQXJCO2FBQ1gsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUEvQjtJQUY2QixDQUEvQjtFQUR5QixDQUEzQjtBQUpBIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vLi4vbGliL2dpdCdcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xuUmVtb3ZlTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvcmVtb3ZlLWxpc3QtdmlldydcblxuZGVzY3JpYmUgXCJSZW1vdmVMaXN0Vmlld1wiLCAtPlxuICBpdCBcImRpc3BsYXlzIGEgbGlzdCBvZiBmaWxlc1wiLCAtPlxuICAgIHZpZXcgPSBuZXcgUmVtb3ZlTGlzdFZpZXcocmVwbywgWydmaWxlMScsICdmaWxlMiddKVxuICAgIGV4cGVjdCh2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG4iXX0=
