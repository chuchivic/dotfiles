(function() {
  var RemoteBranchListView;

  RemoteBranchListView = require('../../lib/views/remote-branch-list-view');

  describe("RemoteBranchListView", function() {
    var onConfirm, view;
    onConfirm = jasmine.createSpy();
    view = new RemoteBranchListView("remote/branch1\nremote/branch2\norigin/branch3", "remote", onConfirm);
    it("only shows branches from the selected remote", function() {
      return expect(view.items.length).toBe(2);
    });
    return describe("when an item is selected", function() {
      return it("calls the provided callback with the selected item", function() {
        view.confirmSelection();
        return expect(onConfirm).toHaveBeenCalledWith({
          name: 'remote/branch1'
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9yZW1vdGUtYnJhbmNoLWxpc3Qtdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsb0JBQUEsR0FBdUIsT0FBQSxDQUFRLHlDQUFSOztFQUV2QixRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQTtBQUMvQixRQUFBO0lBQUEsU0FBQSxHQUFZLE9BQU8sQ0FBQyxTQUFSLENBQUE7SUFDWixJQUFBLEdBQVcsSUFBQSxvQkFBQSxDQUFxQixnREFBckIsRUFBdUUsUUFBdkUsRUFBaUYsU0FBakY7SUFFWCxFQUFBLENBQUcsOENBQUgsRUFBbUQsU0FBQTthQUNqRCxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFsQixDQUF5QixDQUFDLElBQTFCLENBQStCLENBQS9CO0lBRGlELENBQW5EO1dBR0EsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUE7YUFDbkMsRUFBQSxDQUFHLG9EQUFILEVBQXlELFNBQUE7UUFDdkQsSUFBSSxDQUFDLGdCQUFMLENBQUE7ZUFDQSxNQUFBLENBQU8sU0FBUCxDQUFpQixDQUFDLG9CQUFsQixDQUF1QztVQUFBLElBQUEsRUFBTSxnQkFBTjtTQUF2QztNQUZ1RCxDQUF6RDtJQURtQyxDQUFyQztFQVArQixDQUFqQztBQUZBIiwic291cmNlc0NvbnRlbnQiOlsiUmVtb3RlQnJhbmNoTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvcmVtb3RlLWJyYW5jaC1saXN0LXZpZXcnXG5cbmRlc2NyaWJlIFwiUmVtb3RlQnJhbmNoTGlzdFZpZXdcIiwgLT5cbiAgb25Db25maXJtID0gamFzbWluZS5jcmVhdGVTcHkoKVxuICB2aWV3ID0gbmV3IFJlbW90ZUJyYW5jaExpc3RWaWV3KFwicmVtb3RlL2JyYW5jaDFcXG5yZW1vdGUvYnJhbmNoMlxcbm9yaWdpbi9icmFuY2gzXCIsIFwicmVtb3RlXCIsIG9uQ29uZmlybSlcblxuICBpdCBcIm9ubHkgc2hvd3MgYnJhbmNoZXMgZnJvbSB0aGUgc2VsZWN0ZWQgcmVtb3RlXCIsIC0+XG4gICAgZXhwZWN0KHZpZXcuaXRlbXMubGVuZ3RoKS50b0JlIDJcblxuICBkZXNjcmliZSBcIndoZW4gYW4gaXRlbSBpcyBzZWxlY3RlZFwiLCAtPlxuICAgIGl0IFwiY2FsbHMgdGhlIHByb3ZpZGVkIGNhbGxiYWNrIHdpdGggdGhlIHNlbGVjdGVkIGl0ZW1cIiwgLT5cbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICBleHBlY3Qob25Db25maXJtKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBuYW1lOiAncmVtb3RlL2JyYW5jaDEnXG4iXX0=
