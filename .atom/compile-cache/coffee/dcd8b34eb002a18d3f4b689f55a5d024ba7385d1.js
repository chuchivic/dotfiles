(function() {
  var _, getVimState;

  _ = require('underscore-plus');

  getVimState = require('./spec-helper').getVimState;

  xdescribe("visual-mode performance", function() {
    var editor, editorElement, ensure, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], editor = ref[2], editorElement = ref[3], vimState = ref[4];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, _vim;
      });
    });
    afterEach(function() {
      vimState.resetNormalMode();
      return vimState.globalState.reset();
    });
    return describe("slow down editor", function() {
      var measureWithTimeEnd, moveRightAndLeftCheck;
      moveRightAndLeftCheck = function(scenario, modeSig) {
        var moveBySelect, moveByVMP, moveCount;
        console.log([scenario, modeSig, atom.getVersion(), atom.packages.getActivePackage('vim-mode-plus').metadata.version]);
        moveCount = 89;
        switch (scenario) {
          case 'vmp':
            moveByVMP = function() {
              _.times(moveCount, function() {
                return ensure('l');
              });
              return _.times(moveCount, function() {
                return ensure('h');
              });
            };
            return _.times(10, function() {
              return measureWithTimeEnd(moveByVMP);
            });
          case 'sel':
            moveBySelect = function() {
              _.times(moveCount, function() {
                return editor.getLastSelection().selectRight();
              });
              return _.times(moveCount, function() {
                return editor.getLastSelection().selectLeft();
              });
            };
            return _.times(15, function() {
              return measureWithTimeEnd(moveBySelect);
            });
        }
      };
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      beforeEach(function() {
        return set({
          cursor: [0, 0],
          text: "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
        });
      });
      return describe("vmp", function() {
        it("[normal] slow down editor", function() {
          return moveRightAndLeftCheck('vmp', 'moveCount');
        });
        it("[vC] slow down editor", function() {
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          ensure('escape', {
            mode: 'normal'
          });
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          return ensure('escape', {
            mode: 'normal'
          });
        });
        return it("[vC] slow down editor", function() {
          return moveRightAndLeftCheck('sel', 'vC');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3BlcmZvcm1hbmNlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVILGNBQWUsT0FBQSxDQUFRLGVBQVI7O0VBRWhCLFNBQUEsQ0FBVSx5QkFBVixFQUFxQyxTQUFBO0FBQ25DLFFBQUE7SUFBQSxNQUFpRCxFQUFqRCxFQUFDLFlBQUQsRUFBTSxlQUFOLEVBQWMsZUFBZCxFQUFzQixzQkFBdEIsRUFBcUM7SUFFckMsVUFBQSxDQUFXLFNBQUE7YUFDVCxXQUFBLENBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtRQUNWLFFBQUEsR0FBVztRQUNWLHdCQUFELEVBQVM7ZUFDUixjQUFELEVBQU0sb0JBQU4sRUFBZ0I7TUFITixDQUFaO0lBRFMsQ0FBWDtJQU1BLFNBQUEsQ0FBVSxTQUFBO01BQ1IsUUFBUSxDQUFDLGVBQVQsQ0FBQTthQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBckIsQ0FBQTtJQUZRLENBQVY7V0FJQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQTtBQUMzQixVQUFBO01BQUEscUJBQUEsR0FBd0IsU0FBQyxRQUFELEVBQVcsT0FBWDtBQUN0QixZQUFBO1FBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxDQUFDLFFBQUQsRUFBVyxPQUFYLEVBQW9CLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBcEIsRUFBdUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixlQUEvQixDQUErQyxDQUFDLFFBQVEsQ0FBQyxPQUFoRyxDQUFaO1FBRUEsU0FBQSxHQUFZO0FBQ1osZ0JBQU8sUUFBUDtBQUFBLGVBQ08sS0FEUDtZQUVJLFNBQUEsR0FBWSxTQUFBO2NBQ1YsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsTUFBQSxDQUFPLEdBQVA7Y0FBSCxDQUFuQjtxQkFDQSxDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxNQUFBLENBQU8sR0FBUDtjQUFILENBQW5CO1lBRlU7bUJBR1osQ0FBQyxDQUFDLEtBQUYsQ0FBUSxFQUFSLEVBQVksU0FBQTtxQkFBRyxrQkFBQSxDQUFtQixTQUFuQjtZQUFILENBQVo7QUFMSixlQU1PLEtBTlA7WUFPSSxZQUFBLEdBQWUsU0FBQTtjQUNiLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQXlCLENBQUMsV0FBMUIsQ0FBQTtjQUFILENBQW5CO3FCQUNBLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUFBLENBQXlCLENBQUMsVUFBMUIsQ0FBQTtjQUFILENBQW5CO1lBRmE7bUJBR2YsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxFQUFSLEVBQVksU0FBQTtxQkFBRyxrQkFBQSxDQUFtQixZQUFuQjtZQUFILENBQVo7QUFWSjtNQUpzQjtNQWdCeEIsa0JBQUEsR0FBcUIsU0FBQyxFQUFEO1FBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsRUFBRSxDQUFDLElBQWhCO1FBQ0EsRUFBQSxDQUFBO2VBQ0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsRUFBRSxDQUFDLElBQW5CO01BSG1CO01BS3JCLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsR0FBQSxDQUNFO1VBQUEsTUFBQSxFQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBUjtVQUNBLElBQUEsRUFBTSw0RkFETjtTQURGO01BRFMsQ0FBWDthQU9BLFFBQUEsQ0FBUyxLQUFULEVBQWdCLFNBQUE7UUFFZCxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQTtpQkFDOUIscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsV0FBN0I7UUFEOEIsQ0FBaEM7UUFFQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTtVQUMxQixNQUFBLENBQU8sR0FBUCxFQUFZO1lBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLGVBQVgsQ0FBTjtXQUFaO1VBQ0EscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBN0I7VUFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO1VBRUEsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBQU47V0FBWjtVQUNBLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLElBQTdCO2lCQUNBLE1BQUEsQ0FBTyxRQUFQLEVBQWlCO1lBQUEsSUFBQSxFQUFNLFFBQU47V0FBakI7UUFQMEIsQ0FBNUI7ZUFTQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQTtpQkFFMUIscUJBQUEsQ0FBc0IsS0FBdEIsRUFBNkIsSUFBN0I7UUFGMEIsQ0FBNUI7TUFiYyxDQUFoQjtJQTdCMkIsQ0FBN0I7RUFibUMsQ0FBckM7QUFKQSIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbntnZXRWaW1TdGF0ZX0gPSByZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG54ZGVzY3JpYmUgXCJ2aXN1YWwtbW9kZSBwZXJmb3JtYW5jZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlfSA9IF92aW1cblxuICBhZnRlckVhY2ggLT5cbiAgICB2aW1TdGF0ZS5yZXNldE5vcm1hbE1vZGUoKVxuICAgIHZpbVN0YXRlLmdsb2JhbFN0YXRlLnJlc2V0KClcblxuICBkZXNjcmliZSBcInNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2sgPSAoc2NlbmFyaW8sIG1vZGVTaWcpIC0+XG4gICAgICBjb25zb2xlLmxvZyBbc2NlbmFyaW8sIG1vZGVTaWcsIGF0b20uZ2V0VmVyc2lvbigpLCBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5tZXRhZGF0YS52ZXJzaW9uXVxuXG4gICAgICBtb3ZlQ291bnQgPSA4OVxuICAgICAgc3dpdGNoIHNjZW5hcmlvXG4gICAgICAgIHdoZW4gJ3ZtcCdcbiAgICAgICAgICBtb3ZlQnlWTVAgPSAtPlxuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGVuc3VyZSAnbCdcbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBlbnN1cmUgJ2gnXG4gICAgICAgICAgXy50aW1lcyAxMCwgLT4gbWVhc3VyZVdpdGhUaW1lRW5kKG1vdmVCeVZNUClcbiAgICAgICAgd2hlbiAnc2VsJ1xuICAgICAgICAgIG1vdmVCeVNlbGVjdCA9IC0+XG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5zZWxlY3RSaWdodCgpXG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5zZWxlY3RMZWZ0KClcbiAgICAgICAgICBfLnRpbWVzIDE1LCAtPiBtZWFzdXJlV2l0aFRpbWVFbmQobW92ZUJ5U2VsZWN0KVxuXG4gICAgbWVhc3VyZVdpdGhUaW1lRW5kID0gKGZuKSAtPlxuICAgICAgY29uc29sZS50aW1lKGZuLm5hbWUpXG4gICAgICBmbigpXG4gICAgICBjb25zb2xlLnRpbWVFbmQoZm4ubmFtZSlcblxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNldFxuICAgICAgICBjdXJzb3I6IFswLCAwXVxuICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODlcbiAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwidm1wXCIsIC0+XG4gICAgICAjIGJlZm9yZUVhY2ggLT5cbiAgICAgIGl0IFwiW25vcm1hbF0gc2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3ZtcCcsICdtb3ZlQ291bnQnKVxuICAgICAgaXQgXCJbdkNdIHNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygndm1wJywgJ3ZDJylcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICAgIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3ZtcCcsICd2QycpXG4gICAgICAgIGVuc3VyZSAnZXNjYXBlJywgbW9kZTogJ25vcm1hbCdcblxuICAgICAgaXQgXCJbdkNdIHNsb3cgZG93biBlZGl0b3JcIiwgLT5cbiAgICAgICAgIyBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCdzZWwnLCAndkMnKVxuIl19
