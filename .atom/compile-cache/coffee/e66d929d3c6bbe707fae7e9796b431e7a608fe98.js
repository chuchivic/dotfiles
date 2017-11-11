(function() {
  var TagListView, git, repo;

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  TagListView = require('../../lib/views/tag-list-view');

  describe("TagListView", function() {
    describe("when there are two tags", function() {
      return it("displays a list of tags", function() {
        var view;
        view = new TagListView(repo, "tag1\ntag2");
        return expect(view.items.length).toBe(2);
      });
    });
    return describe("when there are no tags", function() {
      return it("displays a message to 'Add Tag'", function() {
        var view;
        view = new TagListView(repo);
        expect(view.items.length).toBe(1);
        return expect(view.items[0].tag).toBe('+ Add Tag');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy90YWctbGlzdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLCtCQUFSOztFQUVkLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7SUFDdEIsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUE7YUFDbEMsRUFBQSxDQUFHLHlCQUFILEVBQThCLFNBQUE7QUFDNUIsWUFBQTtRQUFBLElBQUEsR0FBVyxJQUFBLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLFlBQWxCO2VBQ1gsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUEvQjtNQUY0QixDQUE5QjtJQURrQyxDQUFwQztXQUtBLFFBQUEsQ0FBUyx3QkFBVCxFQUFtQyxTQUFBO2FBQ2pDLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBO0FBQ3BDLFlBQUE7UUFBQSxJQUFBLEdBQVcsSUFBQSxXQUFBLENBQVksSUFBWjtRQUNYLE1BQUEsQ0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQWxCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsQ0FBL0I7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxHQUFyQixDQUF5QixDQUFDLElBQTFCLENBQStCLFdBQS9CO01BSG9DLENBQXRDO0lBRGlDLENBQW5DO0VBTnNCLENBQXhCO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xue3JlcG99ID0gcmVxdWlyZSAnLi4vZml4dHVyZXMnXG5UYWdMaXN0VmlldyA9IHJlcXVpcmUgJy4uLy4uL2xpYi92aWV3cy90YWctbGlzdC12aWV3J1xuXG5kZXNjcmliZSBcIlRhZ0xpc3RWaWV3XCIsIC0+XG4gIGRlc2NyaWJlIFwid2hlbiB0aGVyZSBhcmUgdHdvIHRhZ3NcIiwgLT5cbiAgICBpdCBcImRpc3BsYXlzIGEgbGlzdCBvZiB0YWdzXCIsIC0+XG4gICAgICB2aWV3ID0gbmV3IFRhZ0xpc3RWaWV3KHJlcG8sIFwidGFnMVxcbnRhZzJcIilcbiAgICAgIGV4cGVjdCh2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZXJlIGFyZSBubyB0YWdzXCIsIC0+XG4gICAgaXQgXCJkaXNwbGF5cyBhIG1lc3NhZ2UgdG8gJ0FkZCBUYWcnXCIsIC0+XG4gICAgICB2aWV3ID0gbmV3IFRhZ0xpc3RWaWV3KHJlcG8pXG4gICAgICBleHBlY3Qodmlldy5pdGVtcy5sZW5ndGgpLnRvQmUgMVxuICAgICAgZXhwZWN0KHZpZXcuaXRlbXNbMF0udGFnKS50b0JlICcrIEFkZCBUYWcnXG4iXX0=
