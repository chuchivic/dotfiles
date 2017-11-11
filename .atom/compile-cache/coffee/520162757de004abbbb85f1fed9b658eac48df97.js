(function() {
  var HighlightSelected, Point, Range, path, ref;

  path = require('path');

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  HighlightSelected = require('../lib/highlight-selected');

  describe("HighlightSelected", function() {
    var activationPromise, editor, editorElement, hasMinimap, hasStatusBar, highlightSelected, minimap, minimapHS, minimapModule, ref1, statusBar, workspaceElement;
    ref1 = [], activationPromise = ref1[0], workspaceElement = ref1[1], minimap = ref1[2], statusBar = ref1[3], editor = ref1[4], editorElement = ref1[5], highlightSelected = ref1[6], minimapHS = ref1[7], minimapModule = ref1[8];
    hasMinimap = atom.packages.getAvailablePackageNames().indexOf('minimap') !== -1 && atom.packages.getAvailablePackageNames().indexOf('minimap-highlight-selected') !== -1;
    hasStatusBar = atom.packages.getAvailablePackageNames().indexOf('status-bar') !== -1;
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return atom.project.setPaths([path.join(__dirname, 'fixtures')]);
    });
    afterEach(function() {
      highlightSelected.deactivate();
      if (minimapHS != null) {
        minimapHS.deactivate();
      }
      return minimapModule != null ? minimapModule.deactivate() : void 0;
    });
    describe("when opening a coffee file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('status-bar').then(function(pack) {
            return statusBar = workspaceElement.querySelector("status-bar");
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(arg) {
            var mainModule;
            mainModule = arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.coffee').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("updates debounce when config is changed", function() {
        beforeEach(function() {
          spyOn(highlightSelected.areaView, 'debouncedHandleSelection');
          return atom.config.set('highlight-selected.timeout', 20000);
        });
        return it('calls createDebouce', function() {
          return expect(highlightSelected.areaView.debouncedHandleSelection).toHaveBeenCalled();
        });
      });
      describe("when a whole word is selected", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("adds the decoration to all words", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
        it("creates the highlight selected status bar element", function() {
          expect(workspaceElement.querySelector('status-bar')).toExist();
          return expect(workspaceElement.querySelector('.highlight-selected-status')).toExist();
        });
        it("updates the status bar with highlights number", function() {
          var content;
          content = workspaceElement.querySelector('.highlight-selected-status').innerHTML;
          return expect(content).toBe('Highlighted: 4');
        });
        return describe("when the status bar is disabled", function() {
          beforeEach(function() {
            return atom.config.set('highlight-selected.showInStatusBar', false);
          });
          return it("highlight isn't attached", function() {
            expect(workspaceElement.querySelector('status-bar')).toExist();
            return expect(workspaceElement.querySelector('.highlight-selected-status')).not.toExist();
          });
        });
      });
      describe("when hide highlight on selected word is enabled", function() {
        beforeEach(function() {
          return atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true);
        });
        describe("when a single line is selected", function() {
          beforeEach(function() {
            var range;
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the decoration only on selected words", function() {
            return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
          });
        });
        return describe("when multi lines are selected", function() {
          beforeEach(function() {
            var range1, range2;
            range1 = new Range(new Point(8, 2), new Point(8, 8));
            range2 = new Range(new Point(9, 2), new Point(9, 8));
            editor.setSelectedBufferRanges([range1, range2]);
            return advanceClock(20000);
          });
          return it("adds the decoration only on selected words", function() {
            return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
          });
        });
      });
      describe("leading whitespace doesn't get used", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 0), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', false);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      describe("will not highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will not highlight less than minimum length", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.minimumLength', 7);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will not highlight words in different case", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      return describe("will highlight words in different case", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.ignoreCase', true);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("does add regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(5);
        });
        describe("adds background to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.highlightBackground', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.querySelectorAll('.highlight-selected.background .region')).toHaveLength(4);
          });
        });
        return describe("adds light theme to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.lightTheme', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.querySelectorAll('.highlight-selected.light-theme .region')).toHaveLength(4);
          });
        });
      });
    });
    return describe("when opening a php file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(arg) {
            var mainModule;
            mainModule = arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.php').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-php');
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("being able to highlight variables with '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 2), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 3 regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      return describe("being able to highlight variables when not selecting '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 3), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 4 regions", function() {
          return expect(editorElement.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvaGlnaGxpZ2h0LXNlbGVjdGVkL3NwZWMvaGlnaGxpZ2h0LXNlbGVjdGVkLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxpQkFBRCxFQUFROztFQUNSLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwyQkFBUjs7RUFJcEIsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7QUFDNUIsUUFBQTtJQUFBLE9BQ3VFLEVBRHZFLEVBQUMsMkJBQUQsRUFBb0IsMEJBQXBCLEVBQXNDLGlCQUF0QyxFQUErQyxtQkFBL0MsRUFDQyxnQkFERCxFQUNTLHVCQURULEVBQ3dCLDJCQUR4QixFQUMyQyxtQkFEM0MsRUFDc0Q7SUFFdEQsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQWQsQ0FBQSxDQUNYLENBQUMsT0FEVSxDQUNGLFNBREUsQ0FBQSxLQUNjLENBQUMsQ0FEZixJQUNxQixJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FDaEMsQ0FBQyxPQUQrQixDQUN2Qiw0QkFEdUIsQ0FBQSxLQUNZLENBQUM7SUFFL0MsWUFBQSxHQUFlLElBQUksQ0FBQyxRQUFRLENBQUMsd0JBQWQsQ0FBQSxDQUNiLENBQUMsT0FEWSxDQUNKLFlBREksQ0FBQSxLQUNlLENBQUM7SUFFL0IsVUFBQSxDQUFXLFNBQUE7TUFDVCxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCO2FBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixVQUFyQixDQUFELENBQXRCO0lBRlMsQ0FBWDtJ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QUE4RCxJQUE5RDtVQUNBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBVSxJQUFBLEtBQUEsQ0FBTSxDQUFOLEVBQVMsQ0FBVCxDQUFWLEVBQTJCLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFULENBQTNCO1VBQ1osTUFBTSxDQUFDLHNCQUFQLENBQThCLEtBQTlCO2lCQUNBLFlBQUEsQ0FBYSxLQUFiO1FBSlMsQ0FBWDtlQU1BLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO2lCQUNwQixNQUFBLENBQU8sYUFBYSxDQUFDLGdCQUFkLENBQ0wsNkJBREssQ0FBUCxDQUNpQyxDQUFDLFlBRGxDLENBQytDLENBRC9DO1FBRG9CLENBQXRCO01BUHFELENBQXZEO2FBV0EsUUFBQSxDQUFTLDBEQUFULEVBQXFFLFNBQUE7UUFDbkUsVUFBQSxDQUFXLFNBQUE7QUFDVCxjQUFBO1VBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRDQUFoQixFQUE4RCxJQUE5RDtVQUNBLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBVSxJQUFBLEtBQUEsQ0FBTSxDQUFOLEVBQVMsQ0FBVCxDQUFWLEVBQTJCLElBQUEsS0FBQSxDQUFNLENBQU4sRUFBUyxDQUFULENBQTNCO1VBQ1osTUFBTSxDQUFDLHNCQUFQLENBQThCLEtBQTlCO2lCQUNBLFlBQUEsQ0FBYSxLQUFiO1FBSlMsQ0FBWDtlQU1BLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO2lCQUNwQixNQUFBLENBQU8sYUFBYSxDQUFDLGdCQUFkLENBQ0wsNkJBREssQ0FBUCxDQUNpQyxDQUFDLFlBRGxDLENBQytDLENBRC9DO1FBRG9CLENBQXRCO01BUG1FLENBQXJFO0lBakNrQyxDQUFwQztFQXZONEIsQ0FBOUI7QUFOQSIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xue1JhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuSGlnaGxpZ2h0U2VsZWN0ZWQgPSByZXF1aXJlICcuLi9saWIvaGlnaGxpZ2h0LXNlbGVjdGVkJ1xuXG4jIFVzZSB0aGUgY29tbWFuZCBgd2luZG93OnJ1bi1wYWNrYWdlLXNwZWNzYCAoY21kLWFsdC1jdHJsLXApIHRvIHJ1biBzcGVjcy5cblxuZGVzY3JpYmUgXCJIaWdobGlnaHRTZWxlY3RlZFwiLCAtPlxuICBbYWN0aXZhdGlvblByb21pc2UsIHdvcmtzcGFjZUVsZW1lbnQsIG1pbmltYXAsIHN0YXR1c0JhcixcbiAgIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgaGlnaGxpZ2h0U2VsZWN0ZWQsIG1pbmltYXBIUywgbWluaW1hcE1vZHVsZV0gPSBbXVxuXG4gIGhhc01pbmltYXAgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpXG4gICAgLmluZGV4T2YoJ21pbmltYXAnKSBpc250IC0xIGFuZCBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpXG4gICAgLmluZGV4T2YoJ21pbmltYXAtaGlnaGxpZ2h0LXNlbGVjdGVkJykgaXNudCAtMVxuXG4gIGhhc1N0YXR1c0JhciA9IGF0b20ucGFja2FnZXMuZ2V0QXZhaWxhYmxlUGFja2FnZU5hbWVzKClcbiAgICAuaW5kZXhPZignc3RhdHVzLWJhcicpIGlzbnQgLTFcblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBhdG9tLnByb2plY3Quc2V0UGF0aHMoW3BhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycpXSlcblxuICBhZnRlckVhY2ggLT5cbiAgICBoaWdobGlnaHRTZWxlY3RlZC5kZWFjdGl2YXRlKClcbiAgICBtaW5pbWFwSFM/LmRlYWN0aXZhdGUoKVxuICAgIG1pbmltYXBNb2R1bGU/LmRlYWN0aXZhdGUoKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBvcGVuaW5nIGEgY29mZmVlIGZpbGVcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3N0YXR1cy1iYXInKS50aGVuIChwYWNrKSAtPlxuICAgICAgICAgIHN0YXR1c0JhciA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcInN0YXR1cy1iYXJcIilcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdoaWdobGlnaHQtc2VsZWN0ZWQnKVxuICAgICAgICAgIC50aGVuICh7bWFpbk1vZHVsZX0pIC0+XG4gICAgICAgICAgICBoaWdobGlnaHRTZWxlY3RlZCA9IG1haW5Nb2R1bGVcblxuICAgICAgIyBpZiBoYXNNaW5pbWFwXG4gICAgICAjICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAjICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpLnRoZW4gKHttYWluTW9kdWxlfSkgLT5cbiAgICAgICMgICAgICAgbWluaW1hcE1vZHVsZSA9IG1haW5Nb2R1bGVcbiAgICAgICMgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICMgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtaW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZCcpXG4gICAgICAjICAgICAgIC50aGVuICh7bWFpbk1vZHVsZX0pIC0+XG4gICAgICAjICAgICAgICAgbWluaW1hcEhTID0gbWFpbk1vZHVsZVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3Blbignc2FtcGxlLmNvZmZlZScpLnRoZW4oXG4gICAgICAgICAgKGVkaXRvcikgLT4gZWRpdG9yXG4gICAgICAgICAgLFxuICAgICAgICAgIChlcnJvcikgLT4gdGhyb3coZXJyb3Iuc3RhY2spXG4gICAgICAgIClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgIGRlc2NyaWJlIFwidXBkYXRlcyBkZWJvdW5jZSB3aGVuIGNvbmZpZyBpcyBjaGFuZ2VkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHNweU9uKGhpZ2hsaWdodFNlbGVjdGVkLmFyZWFWaWV3LCAnZGVib3VuY2VkSGFuZGxlU2VsZWN0aW9uJylcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQudGltZW91dCcsIDIwMDAwKVxuXG4gICAgICBpdCAnY2FsbHMgY3JlYXRlRGVib3VjZScsIC0+XG4gICAgICAgIGV4cGVjdChoaWdobGlnaHRTZWxlY3RlZC5hcmVhVmlldy5kZWJvdW5jZWRIYW5kbGVTZWxlY3Rpb24pXG4gICAgICAgICAgLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgd2hvbGUgd29yZCBpcyBzZWxlY3RlZFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoOCwgMiksIG5ldyBQb2ludCg4LCA4KSlcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIGFkdmFuY2VDbG9jaygyMDAwMClcblxuICAgICAgaXQgXCJhZGRzIHRoZSBkZWNvcmF0aW9uIHRvIGFsbCB3b3Jkc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICcuaGlnaGxpZ2h0LXNlbGVjdGVkIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDQpXG5cbiAgICAgIGl0IFwiY3JlYXRlcyB0aGUgaGlnaGxpZ2h0IHNlbGVjdGVkIHN0YXR1cyBiYXIgZWxlbWVudFwiLCAtPlxuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdzdGF0dXMtYmFyJykpLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuaGlnaGxpZ2h0LXNlbGVjdGVkLXN0YXR1cycpKVxuICAgICAgICAgIC50b0V4aXN0KClcblxuICAgICAgaXQgXCJ1cGRhdGVzIHRoZSBzdGF0dXMgYmFyIHdpdGggaGlnaGxpZ2h0cyBudW1iZXJcIiwgLT5cbiAgICAgICAgY29udGVudCA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAnLmhpZ2hsaWdodC1zZWxlY3RlZC1zdGF0dXMnKS5pbm5lckhUTUxcbiAgICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvQmUoJ0hpZ2hsaWdodGVkOiA0JylcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBzdGF0dXMgYmFyIGlzIGRpc2FibGVkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5zaG93SW5TdGF0dXNCYXInLCBmYWxzZSlcblxuICAgICAgICBpdCBcImhpZ2hsaWdodCBpc24ndCBhdHRhY2hlZFwiLCAtPlxuICAgICAgICAgIGV4cGVjdCh3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N0YXR1cy1iYXInKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmhpZ2hsaWdodC1zZWxlY3RlZC1zdGF0dXMnKSlcbiAgICAgICAgICAgIC5ub3QudG9FeGlzdCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gaGlkZSBoaWdobGlnaHQgb24gc2VsZWN0ZWQgd29yZCBpcyBlbmFibGVkXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmhpZGVIaWdobGlnaHRPblNlbGVjdGVkV29yZCcsIHRydWUpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiBhIHNpbmdsZSBsaW5lIGlzIHNlbGVjdGVkXCIsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoOCwgMiksIG5ldyBQb2ludCg4LCA4KSlcbiAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgICAgaXQgXCJhZGRzIHRoZSBkZWNvcmF0aW9uIG9ubHkgb24gc2VsZWN0ZWQgd29yZHNcIiwgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5oaWdobGlnaHQtc2VsZWN0ZWQgLnJlZ2lvbicpKS50b0hhdmVMZW5ndGgoMylcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIG11bHRpIGxpbmVzIGFyZSBzZWxlY3RlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgcmFuZ2UxID0gbmV3IFJhbmdlKG5ldyBQb2ludCg4LCAyKSwgbmV3IFBvaW50KDgsIDgpKVxuICAgICAgICAgIHJhbmdlMiA9IG5ldyBSYW5nZShuZXcgUG9pbnQoOSwgMiksIG5ldyBQb2ludCg5LCA4KSlcbiAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoW3JhbmdlMSwgcmFuZ2UyXSlcbiAgICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgICAgaXQgXCJhZGRzIHRoZSBkZWNvcmF0aW9uIG9ubHkgb24gc2VsZWN0ZWQgd29yZHNcIiwgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5oaWdobGlnaHQtc2VsZWN0ZWQgLnJlZ2lvbicpKS50b0hhdmVMZW5ndGgoMilcblxuICAgIGRlc2NyaWJlIFwibGVhZGluZyB3aGl0ZXNwYWNlIGRvZXNuJ3QgZ2V0IHVzZWRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UobmV3IFBvaW50KDgsIDApLCBuZXcgUG9pbnQoOCwgOCkpXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgIGl0IFwiZG9lc24ndCBhZGQgcmVnaW9uc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICcuaGlnaGxpZ2h0LXNlbGVjdGVkIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDApXG5cbiAgICBkZXNjcmliZSBcIndpbGwgaGlnaGxpZ2h0IG5vbiB3aG9sZSB3b3Jkc1wiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2hpZ2hsaWdodC1zZWxlY3RlZC5vbmx5SGlnaGxpZ2h0V2hvbGVXb3JkcycsIGZhbHNlKVxuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoMTAsIDEzKSwgbmV3IFBvaW50KDEwLCAxNykpXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgIGl0IFwiZG9lcyBhZGQgcmVnaW9uc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICcuaGlnaGxpZ2h0LXNlbGVjdGVkIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDMpXG5cbiAgICBkZXNjcmliZSBcIndpbGwgbm90IGhpZ2hsaWdodCBub24gd2hvbGUgd29yZHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQub25seUhpZ2hsaWdodFdob2xlV29yZHMnLCB0cnVlKVxuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoMTAsIDEzKSwgbmV3IFBvaW50KDEwLCAxNykpXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgIGl0IFwiZG9lcyBhZGQgcmVnaW9uc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICcuaGlnaGxpZ2h0LXNlbGVjdGVkIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDIpXG5cbiAgICBkZXNjcmliZSBcIndpbGwgbm90IGhpZ2hsaWdodCBsZXNzIHRoYW4gbWluaW11bSBsZW5ndGhcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQubWluaW11bUxlbmd0aCcsIDcpXG4gICAgICAgIHJhbmdlID0gbmV3IFJhbmdlKG5ldyBQb2ludCg0LCAwKSwgbmV3IFBvaW50KDQsIDYpKVxuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgICAgYWR2YW5jZUNsb2NrKDIwMDAwKVxuXG4gICAgICBpdCBcImRvZXNuJ3QgYWRkIHJlZ2lvbnNcIiwgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAnLmhpZ2hsaWdodC1zZWxlY3RlZCAucmVnaW9uJykpLnRvSGF2ZUxlbmd0aCgwKVxuXG4gICAgZGVzY3JpYmUgXCJ3aWxsIG5vdCBoaWdobGlnaHQgd29yZHMgaW4gZGlmZmVyZW50IGNhc2VcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UobmV3IFBvaW50KDQsIDApLCBuZXcgUG9pbnQoNCwgNikpXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgIGl0IFwiZG9lcyBhZGQgcmVnaW9uc1wiLCAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdcbiAgICAgICAgICAuaGlnaGxpZ2h0LXNlbGVjdGVkIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDIpXG5cbiAgICBkZXNjcmliZSBcIndpbGwgaGlnaGxpZ2h0IHdvcmRzIGluIGRpZmZlcmVudCBjYXNlXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmlnbm9yZUNhc2UnLCB0cnVlKVxuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoNCwgMCksIG5ldyBQb2ludCg0LCA2KSlcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIGFkdmFuY2VDbG9jaygyMDAwMClcblxuICAgICAgaXQgXCJkb2VzIGFkZCByZWdpb25zXCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgJy5oaWdobGlnaHQtc2VsZWN0ZWQgLnJlZ2lvbicpKS50b0hhdmVMZW5ndGgoNSlcblxuICAgICAgZGVzY3JpYmUgXCJhZGRzIGJhY2tncm91bmQgdG8gc2VsZWN0ZWRcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLmhpZ2hsaWdodEJhY2tncm91bmQnLCB0cnVlKVxuICAgICAgICAgIHJhbmdlID0gbmV3IFJhbmdlKG5ldyBQb2ludCg4LCAyKSwgbmV3IFBvaW50KDgsIDgpKVxuICAgICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICAgIGFkdmFuY2VDbG9jaygyMDAwMClcblxuICAgICAgICBpdCBcImFkZHMgdGhlIGJhY2tncm91bmQgdG8gYWxsIGhpZ2hsaWdodHNcIiwgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuaGlnaGxpZ2h0LXNlbGVjdGVkLmJhY2tncm91bmRcbiAgICAgICAgICAgIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDQpXG5cbiAgICAgIGRlc2NyaWJlIFwiYWRkcyBsaWdodCB0aGVtZSB0byBzZWxlY3RlZFwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQubGlnaHRUaGVtZScsIHRydWUpXG4gICAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UobmV3IFBvaW50KDgsIDIpLCBuZXcgUG9pbnQoOCwgOCkpXG4gICAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgICAgYWR2YW5jZUNsb2NrKDIwMDAwKVxuXG4gICAgICAgIGl0IFwiYWRkcyB0aGUgYmFja2dyb3VuZCB0byBhbGwgaGlnaGxpZ2h0c1wiLCAtPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5oaWdobGlnaHQtc2VsZWN0ZWQubGlnaHQtdGhlbWVcbiAgICAgICAgICAgIC5yZWdpb24nKSkudG9IYXZlTGVuZ3RoKDQpXG5cbiAgICAjIGlmIGhhc01pbmltYXBcbiAgICAjICAgZGVzY3JpYmUgXCJtaW5pbWFwIGhpZ2hsaWdodCBzZWxlY3RlZCBzdGlsbCB3b3Jrc1wiLCAtPlxuICAgICMgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAjICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICMgICAgICAgbWluaW1hcCA9IG1pbmltYXBNb2R1bGUubWluaW1hcEZvckVkaXRvcihlZGl0b3IpXG4gICAgI1xuICAgICMgICAgICAgc3B5T24obWluaW1hcCwgJ2RlY29yYXRlTWFya2VyJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICMgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UobmV3IFBvaW50KDgsIDIpLCBuZXcgUG9pbnQoOCwgOCkpXG4gICAgIyAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAjICAgICAgIGFkdmFuY2VDbG9jaygyMDAwMClcbiAgICAjXG4gICAgIyAgICAgaXQgJ2FkZHMgYSBkZWNvcmF0aW9uIGZvciB0aGUgc2VsZWN0aW9uIGluIHRoZSBtaW5pbWFwJywgLT5cbiAgICAjICAgICAgIGV4cGVjdChtaW5pbWFwLmRlY29yYXRlTWFya2VyKS50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIndoZW4gb3BlbmluZyBhIHBocCBmaWxlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdoaWdobGlnaHQtc2VsZWN0ZWQnKVxuICAgICAgICAgIC50aGVuICh7bWFpbk1vZHVsZX0pIC0+XG4gICAgICAgICAgICBoaWdobGlnaHRTZWxlY3RlZCA9IG1haW5Nb2R1bGVcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5waHAnKS50aGVuKFxuICAgICAgICAgIChlZGl0b3IpIC0+IGVkaXRvclxuICAgICAgICAgICxcbiAgICAgICAgICAoZXJyb3IpIC0+IHRocm93KGVycm9yLnN0YWNrKVxuICAgICAgICApXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtcGhwJylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgIGRlc2NyaWJlIFwiYmVpbmcgYWJsZSB0byBoaWdobGlnaHQgdmFyaWFibGVzIHdpdGggJyQnXCIsIC0+XG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnaGlnaGxpZ2h0LXNlbGVjdGVkLm9ubHlIaWdobGlnaHRXaG9sZVdvcmRzJywgdHJ1ZSlcbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UobmV3IFBvaW50KDEsIDIpLCBuZXcgUG9pbnQoMSwgNykpXG4gICAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgICBhZHZhbmNlQ2xvY2soMjAwMDApXG5cbiAgICAgIGl0IFwiZmluZHMgMyByZWdpb25zXCIsIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgJy5oaWdobGlnaHQtc2VsZWN0ZWQgLnJlZ2lvbicpKS50b0hhdmVMZW5ndGgoMylcblxuICAgIGRlc2NyaWJlIFwiYmVpbmcgYWJsZSB0byBoaWdobGlnaHQgdmFyaWFibGVzIHdoZW4gbm90IHNlbGVjdGluZyAnJCdcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdoaWdobGlnaHQtc2VsZWN0ZWQub25seUhpZ2hsaWdodFdob2xlV29yZHMnLCB0cnVlKVxuICAgICAgICByYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQoMSwgMyksIG5ldyBQb2ludCgxLCA3KSlcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICAgIGFkdmFuY2VDbG9jaygyMDAwMClcblxuICAgICAgaXQgXCJmaW5kcyA0IHJlZ2lvbnNcIiwgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAnLmhpZ2hsaWdodC1zZWxlY3RlZCAucmVnaW9uJykpLnRvSGF2ZUxlbmd0aCg0KVxuIl19
