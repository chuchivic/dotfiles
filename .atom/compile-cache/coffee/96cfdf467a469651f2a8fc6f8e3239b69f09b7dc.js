(function() {
  var $, MarkdownPreviewView, cson, markdownIt, mathjaxHelper, path, temp;

  $ = require('atom-space-pen-views').$;

  path = require('path');

  temp = require('temp').track();

  cson = require('season');

  markdownIt = require('../lib/markdown-it-helper');

  mathjaxHelper = require('../lib/mathjax-helper');

  MarkdownPreviewView = require('../lib/markdown-preview-view');

  describe("Syncronization of source and preview", function() {
    var expectPreviewInSplitPane, fixturesPath, generateSelector, preview, ref, waitsForQueuedMathJax, workspaceElement;
    ref = [], preview = ref[0], workspaceElement = ref[1], fixturesPath = ref[2];
    beforeEach(function() {
      var configDirPath;
      fixturesPath = path.join(__dirname, 'fixtures');
      jasmine.useRealClock();
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      configDirPath = temp.mkdirSync('atom-config-dir-');
      spyOn(atom, 'getConfigDirPath').andReturn(configDirPath);
      mathjaxHelper.resetMathJax();
      waitsForPromise(function() {
        return atom.packages.activatePackage("markdown-preview-plus");
      });
      waitsFor("LaTeX rendering to be enabled", function() {
        return atom.config.set('markdown-preview-plus.enableLatexRenderingByDefault', true);
      });
      waitsForPromise(function() {
        return atom.workspace.open(path.join(fixturesPath, 'sync.md'));
      });
      runs(function() {
        spyOn(mathjaxHelper, 'mathProcessor').andCallThrough();
        return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
      });
      expectPreviewInSplitPane();
      waitsFor("mathjaxHelper.mathProcessor to be called", function() {
        return mathjaxHelper.mathProcessor.calls.length;
      });
      waitsFor("MathJax to load", function() {
        return typeof MathJax !== "undefined" && MathJax !== null;
      });
      return waitsForQueuedMathJax();
    });
    afterEach(function() {
      preview.destroy();
      return mathjaxHelper.resetMathJax();
    });
    expectPreviewInSplitPane = function() {
      waitsFor(function() {
        return atom.workspace.getCenter().getPanes().length === 2;
      });
      waitsFor("markdown preview to be created", function() {
        return preview = atom.workspace.getCenter().getPanes()[1].getActiveItem();
      });
      return runs(function() {
        expect(preview).toBeInstanceOf(MarkdownPreviewView);
        return expect(preview.getPath()).toBe(atom.workspace.getActivePaneItem().getPath());
      });
    };
    waitsForQueuedMathJax = function() {
      var callback, done;
      done = [][0];
      callback = function() {
        return done = true;
      };
      runs(function() {
        return MathJax.Hub.Queue([callback]);
      });
      return waitsFor("queued MathJax operations to complete", function() {
        return done;
      });
    };
    generateSelector = function(token) {
      var element, j, len, ref1, selector;
      selector = null;
      ref1 = token.path;
      for (j = 0, len = ref1.length; j < len; j++) {
        element = ref1[j];
        if (selector === null) {
          selector = ".update-preview > " + element.tag + ":eq(" + element.index + ")";
        } else {
          selector = selector + " > " + element.tag + ":eq(" + element.index + ")";
        }
      }
      return selector;
    };
    describe("Syncronizing preview with source", function() {
      var ref1, sourceMap, tokens;
      ref1 = [], sourceMap = ref1[0], tokens = ref1[1];
      beforeEach(function() {
        sourceMap = cson.readFileSync(path.join(fixturesPath, 'sync-preview.cson'));
        return tokens = markdownIt.getTokens(preview.editor.getText(), true);
      });
      it("identifies the correct HTMLElement path", function() {
        var elementPath, i, j, len, results, sourceLine;
        results = [];
        for (j = 0, len = sourceMap.length; j < len; j++) {
          sourceLine = sourceMap[j];
          elementPath = preview.getPathToToken(tokens, sourceLine.line);
          results.push((function() {
            var k, ref2, results1;
            results1 = [];
            for (i = k = 0, ref2 = elementPath.length - 1; k <= ref2; i = k += 1) {
              expect(elementPath[i].tag).toBe(sourceLine.path[i].tag);
              results1.push(expect(elementPath[i].index).toBe(sourceLine.path[i].index));
            }
            return results1;
          })());
        }
        return results;
      });
      return it("scrolls to the correct HTMLElement", function() {
        var element, j, len, results, selector, sourceLine, syncElement;
        results = [];
        for (j = 0, len = sourceMap.length; j < len; j++) {
          sourceLine = sourceMap[j];
          selector = generateSelector(sourceLine);
          if (selector != null) {
            element = preview.find(selector)[0];
          } else {
            continue;
          }
          syncElement = preview.syncPreview(preview.editor.getText(), sourceLine.line);
          results.push(expect(element).toBe(syncElement));
        }
        return results;
      });
    });
    return describe("Syncronizing source with preview", function() {
      return it("sets the editors cursor buffer location to the correct line", function() {
        var element, j, len, results, selector, sourceElement, sourceMap, syncLine;
        sourceMap = cson.readFileSync(path.join(fixturesPath, 'sync-source.cson'));
        results = [];
        for (j = 0, len = sourceMap.length; j < len; j++) {
          sourceElement = sourceMap[j];
          selector = generateSelector(sourceElement);
          if (selector != null) {
            element = preview.find(selector)[0];
          } else {
            continue;
          }
          syncLine = preview.syncSource(preview.editor.getText(), element);
          if (syncLine) {
            results.push(expect(syncLine).toBe(sourceElement.line));
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvc3luYy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsSUFBZSxPQUFBLENBQVEsc0JBQVI7O0VBQ2hCLElBQUEsR0FBZ0IsT0FBQSxDQUFRLE1BQVI7O0VBQ2hCLElBQUEsR0FBZ0IsT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ2hCLElBQUEsR0FBZ0IsT0FBQSxDQUFRLFFBQVI7O0VBQ2hCLFVBQUEsR0FBZ0IsT0FBQSxDQUFRLDJCQUFSOztFQUNoQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSx1QkFBUjs7RUFDaEIsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDhCQUFSOztFQUV0QixRQUFBLENBQVMsc0NBQVQsRUFBaUQsU0FBQTtBQUMvQyxRQUFBO0lBQUEsTUFBNEMsRUFBNUMsRUFBQyxnQkFBRCxFQUFVLHlCQUFWLEVBQTRCO0lBRTVCLFVBQUEsQ0FBVyxTQUFBO0FBQ1QsVUFBQTtNQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsVUFBckI7TUFHZixPQUFPLENBQUMsWUFBUixDQUFBO01BQ0EsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEI7TUFHQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxTQUFMLENBQWUsa0JBQWY7TUFDaEIsS0FBQSxDQUFNLElBQU4sRUFBWSxrQkFBWixDQUErQixDQUFDLFNBQWhDLENBQTBDLGFBQTFDO01BRUEsYUFBYSxDQUFDLFlBQWQsQ0FBQTtNQUVBLGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix1QkFBOUI7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LFNBQUE7YUFDM0MsRUFBQSxDQUFHLDZEQUFILEVBQWtFLFNBQUE7QUFDaEUsWUFBQTtRQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsWUFBTCxDQUFrQixJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBd0Isa0JBQXhCLENBQWxCO0FBRVo7YUFBQSwyQ0FBQTs7VUFDRSxRQUFBLEdBQVcsZ0JBQUEsQ0FBaUIsYUFBakI7VUFDWCxJQUFHLGdCQUFIO1lBQWtCLE9BQUEsR0FBVSxPQUFPLENBQUMsSUFBUixDQUFhLFFBQWIsQ0FBdUIsQ0FBQSxDQUFBLEVBQW5EO1dBQUEsTUFBQTtBQUEyRCxxQkFBM0Q7O1VBQ0EsUUFBQSxHQUFXLE9BQU8sQ0FBQyxVQUFSLENBQW1CLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBZixDQUFBLENBQW5CLEVBQTZDLE9BQTdDO1VBQ1gsSUFBNkMsUUFBN0M7eUJBQUEsTUFBQSxDQUFPLFFBQVAsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixhQUFhLENBQUMsSUFBcEMsR0FBQTtXQUFBLE1BQUE7aUNBQUE7O0FBSkY7O01BSGdFLENBQWxFO0lBRDJDLENBQTdDO0VBM0YrQyxDQUFqRDtBQVJBIiwic291cmNlc0NvbnRlbnQiOlsieyR9ICAgICAgICAgICA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGF0aCAgICAgICAgICA9IHJlcXVpcmUgJ3BhdGgnXG50ZW1wICAgICAgICAgID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbmNzb24gICAgICAgICAgPSByZXF1aXJlICdzZWFzb24nXG5tYXJrZG93bkl0ICAgID0gcmVxdWlyZSAnLi4vbGliL21hcmtkb3duLWl0LWhlbHBlcidcbm1hdGhqYXhIZWxwZXIgPSByZXF1aXJlICcuLi9saWIvbWF0aGpheC1oZWxwZXInXG5NYXJrZG93blByZXZpZXdWaWV3ID0gcmVxdWlyZSAnLi4vbGliL21hcmtkb3duLXByZXZpZXctdmlldydcblxuZGVzY3JpYmUgXCJTeW5jcm9uaXphdGlvbiBvZiBzb3VyY2UgYW5kIHByZXZpZXdcIiwgLT5cbiAgW3ByZXZpZXcsIHdvcmtzcGFjZUVsZW1lbnQsIGZpeHR1cmVzUGF0aF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBmaXh0dXJlc1BhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZml4dHVyZXMnKVxuXG4gICAgIyBTZXR1cCBKYXNtaW5lIGVudmlyb25tZW50XG4gICAgamFzbWluZS51c2VSZWFsQ2xvY2soKSAjIE1hdGhKYXggcXVldWUncyB3aWxsIE5PVCB3b3JrIHdpdGhvdXQgdGhpc1xuICAgIHdvcmtzcGFjZUVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpXG4gICAgamFzbWluZS5hdHRhY2hUb0RPTSB3b3Jrc3BhY2VFbGVtZW50XG5cbiAgICAjIFJlZGlyZWN0IGF0b20gdG8gYSB0ZW1wIGNvbmZpZyBkaXJlY3RvcnlcbiAgICBjb25maWdEaXJQYXRoID0gdGVtcC5ta2RpclN5bmMoJ2F0b20tY29uZmlnLWRpci0nKVxuICAgIHNweU9uKGF0b20sICdnZXRDb25maWdEaXJQYXRoJykuYW5kUmV0dXJuIGNvbmZpZ0RpclBhdGhcblxuICAgIG1hdGhqYXhIZWxwZXIucmVzZXRNYXRoSmF4KClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJtYXJrZG93bi1wcmV2aWV3LXBsdXNcIilcblxuICAgIHdhaXRzRm9yIFwiTGFUZVggcmVuZGVyaW5nIHRvIGJlIGVuYWJsZWRcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JywgdHJ1ZVxuXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuIHBhdGguam9pbihmaXh0dXJlc1BhdGgsICdzeW5jLm1kJylcblxuICAgIHJ1bnMgLT5cbiAgICAgIHNweU9uKG1hdGhqYXhIZWxwZXIsICdtYXRoUHJvY2Vzc29yJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcblxuICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICB3YWl0c0ZvciBcIm1hdGhqYXhIZWxwZXIubWF0aFByb2Nlc3NvciB0byBiZSBjYWxsZWRcIiwgLT5cbiAgICAgIG1hdGhqYXhIZWxwZXIubWF0aFByb2Nlc3Nvci5jYWxscy5sZW5ndGhcblxuICAgIHdhaXRzRm9yIFwiTWF0aEpheCB0byBsb2FkXCIsIC0+XG4gICAgICBNYXRoSmF4P1xuXG4gICAgd2FpdHNGb3JRdWV1ZWRNYXRoSmF4KClcblxuICBhZnRlckVhY2ggLT5cbiAgICBwcmV2aWV3LmRlc3Ryb3koKVxuICAgIG1hdGhqYXhIZWxwZXIucmVzZXRNYXRoSmF4KClcblxuICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUgPSAtPlxuICAgIHdhaXRzRm9yIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRQYW5lcygpLmxlbmd0aCBpcyAyXG5cbiAgICB3YWl0c0ZvciBcIm1hcmtkb3duIHByZXZpZXcgdG8gYmUgY3JlYXRlZFwiLCAtPlxuICAgICAgcHJldmlldyA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldFBhbmVzKClbMV0uZ2V0QWN0aXZlSXRlbSgpXG5cbiAgICBydW5zIC0+XG4gICAgICBleHBlY3QocHJldmlldykudG9CZUluc3RhbmNlT2YoTWFya2Rvd25QcmV2aWV3VmlldylcbiAgICAgIGV4cGVjdChwcmV2aWV3LmdldFBhdGgoKSkudG9CZSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpLmdldFBhdGgoKVxuXG4gIHdhaXRzRm9yUXVldWVkTWF0aEpheCA9IC0+XG4gICAgW2RvbmVdID0gW11cblxuICAgIGNhbGxiYWNrID0gLT4gZG9uZSA9IHRydWVcbiAgICBydW5zIC0+IE1hdGhKYXguSHViLlF1ZXVlIFtjYWxsYmFja11cbiAgICB3YWl0c0ZvciBcInF1ZXVlZCBNYXRoSmF4IG9wZXJhdGlvbnMgdG8gY29tcGxldGVcIiwgLT4gZG9uZVxuXG4gIGdlbmVyYXRlU2VsZWN0b3IgPSAodG9rZW4pIC0+XG4gICAgc2VsZWN0b3IgPSBudWxsXG4gICAgZm9yIGVsZW1lbnQgaW4gdG9rZW4ucGF0aFxuICAgICAgaWYgc2VsZWN0b3IgaXMgbnVsbFxuICAgICAgdGhlbiBzZWxlY3RvciA9IFwiLnVwZGF0ZS1wcmV2aWV3ID4gI3tlbGVtZW50LnRhZ306ZXEoI3tlbGVtZW50LmluZGV4fSlcIlxuICAgICAgZWxzZSBzZWxlY3RvciA9IFwiI3tzZWxlY3Rvcn0gPiAje2VsZW1lbnQudGFnfTplcSgje2VsZW1lbnQuaW5kZXh9KVwiXG4gICAgcmV0dXJuIHNlbGVjdG9yXG5cbiAgZGVzY3JpYmUgXCJTeW5jcm9uaXppbmcgcHJldmlldyB3aXRoIHNvdXJjZVwiLCAtPlxuICAgIFtzb3VyY2VNYXAsIHRva2Vuc10gPSBbXVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc291cmNlTWFwID0gY3Nvbi5yZWFkRmlsZVN5bmMgcGF0aC5qb2luKGZpeHR1cmVzUGF0aCwgJ3N5bmMtcHJldmlldy5jc29uJylcbiAgICAgIHRva2VucyA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zIHByZXZpZXcuZWRpdG9yLmdldFRleHQoKSwgdHJ1ZVxuXG4gICAgaXQgXCJpZGVudGlmaWVzIHRoZSBjb3JyZWN0IEhUTUxFbGVtZW50IHBhdGhcIiwgLT5cbiAgICAgIGZvciBzb3VyY2VMaW5lIGluIHNvdXJjZU1hcFxuICAgICAgICBlbGVtZW50UGF0aCA9IHByZXZpZXcuZ2V0UGF0aFRvVG9rZW4gdG9rZW5zLCBzb3VyY2VMaW5lLmxpbmVcbiAgICAgICAgZm9yIGkgaW4gWzAuLihlbGVtZW50UGF0aC5sZW5ndGgtMSldIGJ5IDFcbiAgICAgICAgICBleHBlY3QoZWxlbWVudFBhdGhbaV0udGFnKS50b0JlKHNvdXJjZUxpbmUucGF0aFtpXS50YWcpXG4gICAgICAgICAgZXhwZWN0KGVsZW1lbnRQYXRoW2ldLmluZGV4KS50b0JlKHNvdXJjZUxpbmUucGF0aFtpXS5pbmRleClcblxuICAgIGl0IFwic2Nyb2xscyB0byB0aGUgY29ycmVjdCBIVE1MRWxlbWVudFwiLCAtPlxuICAgICAgZm9yIHNvdXJjZUxpbmUgaW4gc291cmNlTWFwXG4gICAgICAgIHNlbGVjdG9yID0gZ2VuZXJhdGVTZWxlY3Rvcihzb3VyY2VMaW5lKVxuICAgICAgICBpZiBzZWxlY3Rvcj8gdGhlbiBlbGVtZW50ID0gcHJldmlldy5maW5kKHNlbGVjdG9yKVswXSBlbHNlIGNvbnRpbnVlXG4gICAgICAgIHN5bmNFbGVtZW50ID0gcHJldmlldy5zeW5jUHJldmlldyBwcmV2aWV3LmVkaXRvci5nZXRUZXh0KCksIHNvdXJjZUxpbmUubGluZVxuICAgICAgICBleHBlY3QoZWxlbWVudCkudG9CZShzeW5jRWxlbWVudClcblxuICBkZXNjcmliZSBcIlN5bmNyb25pemluZyBzb3VyY2Ugd2l0aCBwcmV2aWV3XCIsIC0+XG4gICAgaXQgXCJzZXRzIHRoZSBlZGl0b3JzIGN1cnNvciBidWZmZXIgbG9jYXRpb24gdG8gdGhlIGNvcnJlY3QgbGluZVwiLCAtPlxuICAgICAgc291cmNlTWFwID0gY3Nvbi5yZWFkRmlsZVN5bmMgcGF0aC5qb2luKGZpeHR1cmVzUGF0aCwgJ3N5bmMtc291cmNlLmNzb24nKVxuXG4gICAgICBmb3Igc291cmNlRWxlbWVudCBpbiBzb3VyY2VNYXBcbiAgICAgICAgc2VsZWN0b3IgPSBnZW5lcmF0ZVNlbGVjdG9yKHNvdXJjZUVsZW1lbnQpXG4gICAgICAgIGlmIHNlbGVjdG9yPyB0aGVuIGVsZW1lbnQgPSBwcmV2aWV3LmZpbmQoc2VsZWN0b3IpWzBdIGVsc2UgY29udGludWVcbiAgICAgICAgc3luY0xpbmUgPSBwcmV2aWV3LnN5bmNTb3VyY2UgcHJldmlldy5lZGl0b3IuZ2V0VGV4dCgpLCBlbGVtZW50XG4gICAgICAgIGV4cGVjdChzeW5jTGluZSkudG9CZShzb3VyY2VFbGVtZW50LmxpbmUpIGlmIHN5bmNMaW5lXG4iXX0=
