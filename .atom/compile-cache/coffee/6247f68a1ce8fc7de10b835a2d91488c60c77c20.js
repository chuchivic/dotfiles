(function() {
  var TextData, dispatch, getView, getVimState, ref, settings, withMockPlatform;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView, withMockPlatform = ref.withMockPlatform;

  settings = require('../lib/settings');

  describe("Operator modifier", function() {
    var editor, editorElement, ensure, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], editor = ref1[2], editorElement = ref1[3], vimState = ref1[4];
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    return describe("operator-modifier to force wise", function() {
      beforeEach(function() {
        return set({
          text: "012345 789\nABCDEF EFG"
        });
      });
      describe("operator-modifier-characterwise", function() {
        describe("when target is linewise", function() {
          return it("operate characterwisely and exclusively", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("d v j", {
              text: "0BCDEF EFG"
            });
          });
        });
        return describe("when target is characterwise", function() {
          it("operate inclusively for exclusive target", function() {
            set({
              cursor: [0, 9]
            });
            return ensure("d v b", {
              cursor: [0, 6],
              text_: "012345_\nABCDEF EFG"
            });
          });
          return it("operate exclusively for inclusive target", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("d v e", {
              cursor: [0, 0],
              text: "5 789\nABCDEF EFG"
            });
          });
        });
      });
      return describe("operator-modifier-linewise", function() {
        return it("operate linewisely for characterwise target", function() {
          set({
            cursor: [0, 1]
          });
          return ensure('d V / DEF enter', {
            cursor: [0, 0],
            text: ""
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLW1vZGlmaWVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUErRCxPQUFBLENBQVEsZUFBUixDQUEvRCxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDLHFCQUFsQyxFQUEyQzs7RUFDM0MsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtBQUM1QixRQUFBO0lBQUEsT0FBaUQsRUFBakQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxnQkFBZCxFQUFzQix1QkFBdEIsRUFBcUM7SUFFckMsVUFBQSxDQUFXLFNBQUE7TUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsR0FBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixhQUFELEVBQU0sbUJBQU4sRUFBZ0I7TUFITixDQUFaO2FBS0EsSUFBQSxDQUFLLFNBQUE7ZUFDSCxPQUFPLENBQUMsV0FBUixDQUFvQixhQUFwQjtNQURHLENBQUw7SUFOUyxDQUFYO1dBU0EsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUE7TUFDMUMsVUFBQSxDQUFXLFNBQUE7ZUFDVCxHQUFBLENBQ0U7VUFBQSxJQUFBLEVBQU0sd0JBQU47U0FERjtNQURTLENBQVg7TUFNQSxRQUFBLENBQVMsaUNBQVQsRUFBNEMsU0FBQTtRQUMxQyxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQTtpQkFDbEMsRUFBQSxDQUFHLHlDQUFILEVBQThDLFNBQUE7WUFDNUMsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7Y0FBQSxJQUFBLEVBQU0sWUFBTjthQURGO1VBRjRDLENBQTlDO1FBRGtDLENBQXBDO2VBT0EsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUE7VUFDdkMsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7WUFDN0MsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2NBQ0EsS0FBQSxFQUFPLHFCQURQO2FBREY7VUFGNkMsQ0FBL0M7aUJBUUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7WUFDN0MsR0FBQSxDQUFJO2NBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjthQUFKO21CQUNBLE1BQUEsQ0FBTyxPQUFQLEVBQ0U7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2NBQ0EsSUFBQSxFQUFNLG1CQUROO2FBREY7VUFGNkMsQ0FBL0M7UUFUdUMsQ0FBekM7TUFSMEMsQ0FBNUM7YUF5QkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7ZUFDckMsRUFBQSxDQUFHLDZDQUFILEVBQWtELFNBQUE7VUFDaEQsR0FBQSxDQUFJO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtXQUFKO2lCQUNBLE1BQUEsQ0FBTyxpQkFBUCxFQUNFO1lBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtZQUNBLElBQUEsRUFBTSxFQUROO1dBREY7UUFGZ0QsQ0FBbEQ7TUFEcUMsQ0FBdkM7SUFoQzBDLENBQTVDO0VBWjRCLENBQTlCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNoLCBUZXh0RGF0YSwgZ2V0Vmlldywgd2l0aE1vY2tQbGF0Zm9ybX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbmRlc2NyaWJlIFwiT3BlcmF0b3IgbW9kaWZpZXJcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlfSA9IHZpbVxuXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwib3BlcmF0b3ItbW9kaWZpZXIgdG8gZm9yY2Ugd2lzZVwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgMDEyMzQ1IDc4OVxuICAgICAgICBBQkNERUYgRUZHXG4gICAgICAgIFwiXCJcIlxuICAgIGRlc2NyaWJlIFwib3BlcmF0b3ItbW9kaWZpZXItY2hhcmFjdGVyd2lzZVwiLCAtPlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRhcmdldCBpcyBsaW5ld2lzZVwiLCAtPlxuICAgICAgICBpdCBcIm9wZXJhdGUgY2hhcmFjdGVyd2lzZWx5IGFuZCBleGNsdXNpdmVseVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICAgIGVuc3VyZSBcImQgdiBqXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDBCQ0RFRiBFRkdcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRhcmdldCBpcyBjaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwib3BlcmF0ZSBpbmNsdXNpdmVseSBmb3IgZXhjbHVzaXZlIHRhcmdldFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCA5XVxuICAgICAgICAgIGVuc3VyZSBcImQgdiBiXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCA2XVxuICAgICAgICAgICAgdGV4dF86IFwiXCJcIlxuICAgICAgICAgICAgMDEyMzQ1X1xuICAgICAgICAgICAgQUJDREVGIEVGR1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwib3BlcmF0ZSBleGNsdXNpdmVseSBmb3IgaW5jbHVzaXZlIHRhcmdldFwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgIGVuc3VyZSBcImQgdiBlXCIsXG4gICAgICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICA1IDc4OVxuICAgICAgICAgICAgQUJDREVGIEVGR1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJvcGVyYXRvci1tb2RpZmllci1saW5ld2lzZVwiLCAtPlxuICAgICAgaXQgXCJvcGVyYXRlIGxpbmV3aXNlbHkgZm9yIGNoYXJhY3Rlcndpc2UgdGFyZ2V0XCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAxXVxuICAgICAgICBlbnN1cmUgJ2QgViAvIERFRiBlbnRlcicsXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXG4iXX0=
