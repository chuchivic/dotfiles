(function() {
  var BranchListView, repo;

  repo = require('../fixtures').repo;

  BranchListView = require('../../lib/views/branch-list-view');

  describe("BranchListView", function() {
    var onConfirm, view;
    onConfirm = jasmine.createSpy();
    view = new BranchListView("*branch1\nbranch2", onConfirm);
    it("displays a list of branches", function() {
      return expect(view.items.length).toBe(2);
    });
    return describe("when an item is selected", function() {
      return it("runs the provided function with the selected item", function() {
        view.confirmSelection();
        return expect(onConfirm).toHaveBeenCalledWith({
          name: 'branch1'
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9icmFuY2gtbGlzdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxPQUFRLE9BQUEsQ0FBUSxhQUFSOztFQUNULGNBQUEsR0FBaUIsT0FBQSxDQUFRLGtDQUFSOztFQUVqQixRQUFBLENBQVMsZ0JBQVQsRUFBMkIsU0FBQTtBQUN6QixRQUFBO0lBQUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQUE7SUFDWixJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsbUJBQWYsRUFBb0MsU0FBcEM7SUFFWCxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTthQUNoQyxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFsQixDQUF5QixDQUFDLElBQTFCLENBQStCLENBQS9CO0lBRGdDLENBQWxDO1dBR0EsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUE7YUFDbkMsRUFBQSxDQUFHLG1EQUFILEVBQXdELFNBQUE7UUFDdEQsSUFBSSxDQUFDLGdCQUFMLENBQUE7ZUFDQSxNQUFBLENBQU8sU0FBUCxDQUFpQixDQUFDLG9CQUFsQixDQUF1QztVQUFBLElBQUEsRUFBTSxTQUFOO1NBQXZDO01BRnNELENBQXhEO0lBRG1DLENBQXJDO0VBUHlCLENBQTNCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcbkJyYW5jaExpc3RWaWV3ID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL2JyYW5jaC1saXN0LXZpZXcnXG5cbmRlc2NyaWJlIFwiQnJhbmNoTGlzdFZpZXdcIiwgLT5cbiAgb25Db25maXJtID0gamFzbWluZS5jcmVhdGVTcHkoKVxuICB2aWV3ID0gbmV3IEJyYW5jaExpc3RWaWV3KFwiKmJyYW5jaDFcXG5icmFuY2gyXCIsIG9uQ29uZmlybSlcblxuICBpdCBcImRpc3BsYXlzIGEgbGlzdCBvZiBicmFuY2hlc1wiLCAtPlxuICAgIGV4cGVjdCh2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGFuIGl0ZW0gaXMgc2VsZWN0ZWRcIiwgLT5cbiAgICBpdCBcInJ1bnMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIHdpdGggdGhlIHNlbGVjdGVkIGl0ZW1cIiwgLT5cbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICBleHBlY3Qob25Db25maXJtKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBuYW1lOiAnYnJhbmNoMSdcbiJdfQ==
