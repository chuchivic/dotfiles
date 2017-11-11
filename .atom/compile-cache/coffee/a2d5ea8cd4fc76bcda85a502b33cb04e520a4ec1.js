(function() {
  var $, fs, mathjaxHelper, path, temp;

  $ = require('atom-space-pen-views').$;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp').track();

  mathjaxHelper = require('../lib/mathjax-helper');

  describe("MathJax helper module", function() {
    return describe("loading MathJax TeX macros", function() {
      var configDirPath, macros, macrosPath, ref, waitsForMacrosToLoad;
      ref = [], configDirPath = ref[0], macrosPath = ref[1], macros = ref[2];
      beforeEach(function() {
        configDirPath = temp.mkdirSync('atom-config-dir-');
        macrosPath = path.join(configDirPath, 'markdown-preview-plus.cson');
        spyOn(atom, 'getConfigDirPath').andReturn(configDirPath);
        jasmine.useRealClock();
        return mathjaxHelper.resetMathJax();
      });
      afterEach(function() {
        return mathjaxHelper.resetMathJax();
      });
      waitsForMacrosToLoad = function() {
        var span;
        span = [][0];
        waitsForPromise(function() {
          return atom.packages.activatePackage("markdown-preview-plus");
        });
        runs(function() {
          return mathjaxHelper.loadMathJax();
        });
        waitsFor("MathJax to load", function() {
          return typeof MathJax !== "undefined" && MathJax !== null;
        });
        runs(function() {
          var equation;
          span = document.createElement("span");
          equation = document.createElement("script");
          equation.type = "math/tex; mode=display";
          equation.textContent = "\\int_1^2";
          span.appendChild(equation);
          return mathjaxHelper.mathProcessor(span);
        });
        waitsFor("MathJax macros to be defined", function() {
          var ref1, ref2, ref3;
          return macros = (ref1 = MathJax.InputJax) != null ? (ref2 = ref1.TeX) != null ? (ref3 = ref2.Definitions) != null ? ref3.macros : void 0 : void 0 : void 0;
        });
        return waitsFor("MathJax to process span", function() {
          return span.childElementCount === 2;
        });
      };
      describe("when a macros file exists", function() {
        beforeEach(function() {
          var fixturesFile, fixturesPath;
          fixturesPath = path.join(__dirname, 'fixtures/macros.cson');
          fixturesFile = fs.readFileSync(fixturesPath, 'utf8');
          return fs.writeFileSync(macrosPath, fixturesFile);
        });
        it("loads valid macros", function() {
          waitsForMacrosToLoad();
          return runs(function() {
            expect(macros.macroOne).toBeDefined();
            return expect(macros.macroParamOne).toBeDefined();
          });
        });
        return it("doesn't load invalid macros", function() {
          waitsForMacrosToLoad();
          return runs(function() {
            expect(macros.macro1).toBeUndefined();
            expect(macros.macroTwo).toBeUndefined();
            expect(macros.macroParam1).toBeUndefined();
            return expect(macros.macroParamTwo).toBeUndefined();
          });
        });
      });
      return describe("when a macros file doesn't exist", function() {
        return it("creates a template macros file", function() {
          expect(fs.isFileSync(macrosPath)).toBe(false);
          waitsForMacrosToLoad();
          return runs(function() {
            return expect(fs.isFileSync(macrosPath)).toBe(true);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWF0aGpheC1oZWxwZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLElBQWUsT0FBQSxDQUFRLHNCQUFSOztFQUNoQixJQUFBLEdBQWdCLE9BQUEsQ0FBUSxNQUFSOztFQUNoQixFQUFBLEdBQWdCLE9BQUEsQ0FBUSxTQUFSOztFQUNoQixJQUFBLEdBQWdCLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBOztFQUNoQixhQUFBLEdBQWdCLE9BQUEsQ0FBUSx1QkFBUjs7RUFFaEIsUUFBQSxDQUFTLHVCQUFULEVBQWtDLFNBQUE7V0FDaEMsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7QUFDckMsVUFBQTtNQUFBLE1BQXNDLEVBQXRDLEVBQUMsc0JBQUQsRUFBZ0IsbUJBQWhCLEVBQTRCO01BRTVCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsYUFBQSxHQUFnQixJQUFJLENBQUMsU0FBTCxDQUFlLGtCQUFmO1FBQ2hCLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsRUFBeUIsNEJBQXpCO1FBRWIsS0FBQSxDQUFNLElBQU4sRUFBWSxrQkFBWixDQUErQixDQUFDLFNBQWhDLENBQTBDLGFBQTFDO1FBQ0EsT0FBTyxDQUFDLFlBQVIsQ0FBQTtlQUVBLGFBQWEsQ0FBQyxZQUFkLENBQUE7TUFQUyxDQUFYO01BU0EsU0FBQSxDQUFVLFNBQUE7ZUFDUixhQUFhLENBQUMsWUFBZCxDQUFBO01BRFEsQ0FBVjtNQUdBLG9CQUFBLEdBQXVCLFNBQUE7QUFDckIsWUFBQTtRQUFDLE9BQVE7UUFFVCxlQUFBLENBQWdCLFNBQUE7aUJBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHVCQUE5QjtRQURjLENBQWhCO1FBR0EsSUFBQSxDQUFLLFNBQUE7aUJBQ0gsYUFBYSxDQUFDLFdBQWQsQ0FBQTtRQURHLENBQUw7UUFHQSxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtpQkFDMUI7UUFEMEIsQ0FBNUI7UUFLQSxJQUFBLENBQUssU0FBQTtBQUNILGNBQUE7VUFBQSxJQUFBLEdBQXdCLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO1VBQ3hCLFFBQUEsR0FBd0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7VUFDeEIsUUFBUSxDQUFDLElBQVQsR0FBd0I7VUFDeEIsUUFBUSxDQUFDLFdBQVQsR0FBd0I7VUFDeEIsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsUUFBakI7aUJBQ0EsYUFBYSxDQUFDLGFBQWQsQ0FBNEIsSUFBNUI7UUFORyxDQUFMO1FBUUEsUUFBQSxDQUFTLDhCQUFULEVBQXlDLFNBQUE7QUFDdkMsY0FBQTtpQkFBQSxNQUFBLDJHQUEyQyxDQUFFO1FBRE4sQ0FBekM7ZUFHQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQTtpQkFDbEMsSUFBSSxDQUFDLGlCQUFMLEtBQTBCO1FBRFEsQ0FBcEM7TUF6QnFCO01BNEJ2QixRQUFBLENBQVMsMkJBQVQsRUFBc0MsU0FBQTtRQUNwQyxVQUFBLENBQVcsU0FBQTtBQUNULGNBQUE7VUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLHNCQUFyQjtVQUNmLFlBQUEsR0FBZSxFQUFFLENBQUMsWUFBSCxDQUFnQixZQUFoQixFQUE4QixNQUE5QjtpQkFDZixFQUFFLENBQUMsYUFBSCxDQUFpQixVQUFqQixFQUE2QixZQUE3QjtRQUhTLENBQVg7UUFLQSxFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtVQUN2QixvQkFBQSxDQUFBO2lCQUNBLElBQUEsQ0FBSyxTQUFBO1lBQ0gsTUFBQSxDQUFPLE1BQU0sQ0FBQyxRQUFkLENBQXVCLENBQUMsV0FBeEIsQ0FBQTttQkFDQSxNQUFBLENBQU8sTUFBTSxDQUFDLGFBQWQsQ0FBNEIsQ0FBQyxXQUE3QixDQUFBO1VBRkcsQ0FBTDtRQUZ1QixDQUF6QjtlQU1BLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBO1VBQ2hDLG9CQUFBLENBQUE7aUJBQ0EsSUFBQSxDQUFLLFNBQUE7WUFDSCxNQUFBLENBQU8sTUFBTSxDQUFDLE1BQWQsQ0FBcUIsQ0FBQyxhQUF0QixDQUFBO1lBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxRQUFkLENBQXVCLENBQUMsYUFBeEIsQ0FBQTtZQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsV0FBZCxDQUEwQixDQUFDLGFBQTNCLENBQUE7bUJBQ0EsTUFBQSxDQUFPLE1BQU0sQ0FBQyxhQUFkLENBQTRCLENBQUMsYUFBN0IsQ0FBQTtVQUpHLENBQUw7UUFGZ0MsQ0FBbEM7TUFab0MsQ0FBdEM7YUFvQkEsUUFBQSxDQUFTLGtDQUFULEVBQTZDLFNBQUE7ZUFDM0MsRUFBQSxDQUFHLGdDQUFILEVBQXFDLFNBQUE7VUFDbkMsTUFBQSxDQUFPLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFQLENBQWlDLENBQUMsSUFBbEMsQ0FBdUMsS0FBdkM7VUFDQSxvQkFBQSxDQUFBO2lCQUNBLElBQUEsQ0FBSyxTQUFBO21CQUFHLE1BQUEsQ0FBTyxFQUFFLENBQUMsVUFBSCxDQUFjLFVBQWQsQ0FBUCxDQUFpQyxDQUFDLElBQWxDLENBQXVDLElBQXZDO1VBQUgsQ0FBTDtRQUhtQyxDQUFyQztNQUQyQyxDQUE3QztJQS9EcUMsQ0FBdkM7RUFEZ0MsQ0FBbEM7QUFOQSIsInNvdXJjZXNDb250ZW50IjpbInskfSAgICAgICAgICAgPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggICAgICAgICAgPSByZXF1aXJlICdwYXRoJ1xuZnMgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG50ZW1wICAgICAgICAgID0gcmVxdWlyZSgndGVtcCcpLnRyYWNrKClcbm1hdGhqYXhIZWxwZXIgPSByZXF1aXJlICcuLi9saWIvbWF0aGpheC1oZWxwZXInXG5cbmRlc2NyaWJlIFwiTWF0aEpheCBoZWxwZXIgbW9kdWxlXCIsIC0+XG4gIGRlc2NyaWJlIFwibG9hZGluZyBNYXRoSmF4IFRlWCBtYWNyb3NcIiwgLT5cbiAgICBbY29uZmlnRGlyUGF0aCwgbWFjcm9zUGF0aCwgbWFjcm9zXSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBjb25maWdEaXJQYXRoID0gdGVtcC5ta2RpclN5bmMoJ2F0b20tY29uZmlnLWRpci0nKVxuICAgICAgbWFjcm9zUGF0aCA9IHBhdGguam9pbiBjb25maWdEaXJQYXRoLCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmNzb24nXG5cbiAgICAgIHNweU9uKGF0b20sICdnZXRDb25maWdEaXJQYXRoJykuYW5kUmV0dXJuIGNvbmZpZ0RpclBhdGhcbiAgICAgIGphc21pbmUudXNlUmVhbENsb2NrKCkgIyBNYXRoSmF4IHF1ZXVlJ3Mgd2lsbCBOT1Qgd29yayB3aXRob3V0IHRoaXNcblxuICAgICAgbWF0aGpheEhlbHBlci5yZXNldE1hdGhKYXgoKVxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBtYXRoamF4SGVscGVyLnJlc2V0TWF0aEpheCgpXG5cbiAgICB3YWl0c0Zvck1hY3Jvc1RvTG9hZCA9IC0+XG4gICAgICBbc3Bhbl0gPSBbXVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJtYXJrZG93bi1wcmV2aWV3LXBsdXNcIilcblxuICAgICAgcnVucyAtPlxuICAgICAgICBtYXRoamF4SGVscGVyLmxvYWRNYXRoSmF4KClcblxuICAgICAgd2FpdHNGb3IgXCJNYXRoSmF4IHRvIGxvYWRcIiwgLT5cbiAgICAgICAgTWF0aEpheD9cblxuICAgICAgIyBUcmlnZ2VyIE1hdGhKYXggVGVYIGV4dGVuc2lvbiB0byBsb2FkXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgc3BhbiAgICAgICAgICAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIilcbiAgICAgICAgZXF1YXRpb24gICAgICAgICAgICAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKVxuICAgICAgICBlcXVhdGlvbi50eXBlICAgICAgICAgPSBcIm1hdGgvdGV4OyBtb2RlPWRpc3BsYXlcIlxuICAgICAgICBlcXVhdGlvbi50ZXh0Q29udGVudCAgPSBcIlxcXFxpbnRfMV4yXCJcbiAgICAgICAgc3Bhbi5hcHBlbmRDaGlsZCBlcXVhdGlvblxuICAgICAgICBtYXRoamF4SGVscGVyLm1hdGhQcm9jZXNzb3Igc3BhblxuXG4gICAgICB3YWl0c0ZvciBcIk1hdGhKYXggbWFjcm9zIHRvIGJlIGRlZmluZWRcIiwgLT5cbiAgICAgICAgbWFjcm9zID0gTWF0aEpheC5JbnB1dEpheD8uVGVYPy5EZWZpbml0aW9ucz8ubWFjcm9zXG5cbiAgICAgIHdhaXRzRm9yIFwiTWF0aEpheCB0byBwcm9jZXNzIHNwYW5cIiwgLT5cbiAgICAgICAgc3Bhbi5jaGlsZEVsZW1lbnRDb3VudCBpcyAyXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYSBtYWNyb3MgZmlsZSBleGlzdHNcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgZml4dHVyZXNQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL21hY3Jvcy5jc29uJylcbiAgICAgICAgZml4dHVyZXNGaWxlID0gZnMucmVhZEZpbGVTeW5jIGZpeHR1cmVzUGF0aCwgJ3V0ZjgnXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMgbWFjcm9zUGF0aCwgZml4dHVyZXNGaWxlXG5cbiAgICAgIGl0IFwibG9hZHMgdmFsaWQgbWFjcm9zXCIsIC0+XG4gICAgICAgIHdhaXRzRm9yTWFjcm9zVG9Mb2FkKClcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChtYWNyb3MubWFjcm9PbmUpLnRvQmVEZWZpbmVkKClcbiAgICAgICAgICBleHBlY3QobWFjcm9zLm1hY3JvUGFyYW1PbmUpLnRvQmVEZWZpbmVkKClcblxuICAgICAgaXQgXCJkb2Vzbid0IGxvYWQgaW52YWxpZCBtYWNyb3NcIiwgLT5cbiAgICAgICAgd2FpdHNGb3JNYWNyb3NUb0xvYWQoKVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KG1hY3Jvcy5tYWNybzEpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChtYWNyb3MubWFjcm9Ud28pLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChtYWNyb3MubWFjcm9QYXJhbTEpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgICAgIGV4cGVjdChtYWNyb3MubWFjcm9QYXJhbVR3bykudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gYSBtYWNyb3MgZmlsZSBkb2Vzbid0IGV4aXN0XCIsIC0+XG4gICAgICBpdCBcImNyZWF0ZXMgYSB0ZW1wbGF0ZSBtYWNyb3MgZmlsZVwiLCAtPlxuICAgICAgICBleHBlY3QoZnMuaXNGaWxlU3luYyhtYWNyb3NQYXRoKSkudG9CZShmYWxzZSlcbiAgICAgICAgd2FpdHNGb3JNYWNyb3NUb0xvYWQoKVxuICAgICAgICBydW5zIC0+IGV4cGVjdChmcy5pc0ZpbGVTeW5jKG1hY3Jvc1BhdGgpKS50b0JlKHRydWUpXG4iXX0=
