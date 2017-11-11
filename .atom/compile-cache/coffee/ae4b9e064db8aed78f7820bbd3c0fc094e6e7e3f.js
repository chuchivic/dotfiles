(function() {
  var $, bibFile, cslFile, file, fs, pandocHelper, path, temp, tempPath, wrench;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  wrench = require('wrench');

  $ = require('atom-space-pen-views').$;

  pandocHelper = require('../lib/pandoc-helper.coffee');

  bibFile = 'test.bib';

  cslFile = 'foo.csl';

  tempPath = null;

  file = null;

  require('./spec-helper');

  describe("Markdown preview plus pandoc helper", function() {
    var preview, ref, workspaceElement;
    ref = [], workspaceElement = ref[0], preview = ref[1];
    beforeEach(function() {
      var fixturesPath;
      fixturesPath = path.join(__dirname, 'fixtures');
      tempPath = temp.mkdirSync('atom');
      wrench.copyDirSyncRecursive(fixturesPath, tempPath, {
        forceDelete: true
      });
      atom.project.setPaths([tempPath]);
      jasmine.useRealClock();
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      return waitsForPromise(function() {
        return atom.packages.activatePackage("markdown-preview-plus");
      });
    });
    describe("PandocHelper::findFileRecursive", function() {
      var fR;
      fR = pandocHelper.__testing__.findFileRecursive;
      it("should return bibFile in the same directory", function() {
        return runs(function() {
          var bibPath, found;
          bibPath = path.join(tempPath, 'subdir', bibFile);
          fs.writeFileSync(bibPath, '');
          found = fR(path.join(tempPath, 'subdir', 'simple.md'), bibFile);
          return expect(found).toEqual(bibPath);
        });
      });
      it("should return bibFile in a parent directory", function() {
        return runs(function() {
          var bibPath, found;
          bibPath = path.join(tempPath, bibFile);
          fs.writeFileSync(bibPath, '');
          found = fR(path.join(tempPath, 'subdir', 'simple.md'), bibFile);
          return expect(found).toEqual(bibPath);
        });
      });
      return it("shouldn't return bibFile in a out of scope directory", function() {
        return runs(function() {
          var found;
          fs.writeFileSync(path.join(tempPath, '..', bibFile), '');
          found = fR(path.join(tempPath, 'subdir', 'simple.md'), bibFile);
          return expect(found).toEqual(false);
        });
      });
    });
    describe("PandocHelper::getArguments", function() {
      var getArguments;
      getArguments = pandocHelper.__testing__.getArguments;
      it('should work with empty arguments', function() {
        var result;
        atom.config.set('markdown-preview-plus.pandocArguments', []);
        result = getArguments(null);
        return expect(result.length).toEqual(0);
      });
      it('should filter empty arguments', function() {
        var args, result;
        args = {
          foo: 'bar',
          empty: null,
          none: 'lala',
          empty2: false,
          empty3: void 0
        };
        result = getArguments(args);
        expect(result.length).toEqual(2);
        expect(result[0]).toEqual('--foo=bar');
        return expect(result[1]).toEqual('--none=lala');
      });
      it('should load user arguments', function() {
        var args, result;
        atom.config.set('markdown-preview-plus.pandocArguments', ['-v', '--smart', 'rem', '--filter=/foo/bar', '--filter-foo /foo/baz']);
        args = {};
        result = getArguments(args);
        expect(result.length).toEqual(4);
        expect(result[0]).toEqual('-v');
        expect(result[1]).toEqual('--smart');
        expect(result[2]).toEqual('--filter=/foo/bar');
        return expect(result[3]).toEqual('--filter-foo=/foo/baz');
      });
      return it('should combine user arguments and given arguments', function() {
        var args, result;
        atom.config.set('markdown-preview-plus.pandocArguments', ['-v', '--filter-foo /foo/baz']);
        args = {
          foo: 'bar',
          empty3: void 0
        };
        result = getArguments(args);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual('--foo=bar');
        expect(result[1]).toEqual('-v');
        return expect(result[2]).toEqual('--filter-foo=/foo/baz');
      });
    });
    return describe("PandocHelper::setPandocOptions", function() {
      var fallBackBib, fallBackCsl, setPandocOptions;
      fallBackBib = '/foo/fallback.bib';
      fallBackCsl = '/foo/fallback.csl';
      setPandocOptions = pandocHelper.__testing__.setPandocOptions;
      beforeEach(function() {
        file = path.join(tempPath, 'subdir', 'simple.md');
        atom.config.set('markdown-preview-plus.pandocBibliography', true);
        atom.config.set('markdown-preview-plus.pandocBIBFile', bibFile);
        atom.config.set('markdown-preview-plus.pandocBIBFileFallback', fallBackBib);
        atom.config.set('markdown-preview-plus.pandocCSLFile', cslFile);
        return atom.config.set('markdown-preview-plus.pandocCSLFileFallback', fallBackCsl);
      });
      it("shouldn't set pandoc bib options if citations are disabled", function() {
        return runs(function() {
          var config;
          atom.config.set('markdown-preview-plus.pandocBibliography', false);
          fs.writeFileSync(path.join(tempPath, bibFile), '');
          config = setPandocOptions(file);
          return expect(config.args.bibliography).toEqual(void 0);
        });
      });
      it("shouldn't set pandoc bib options if no fallback file exists", function() {
        return runs(function() {
          var config;
          atom.config.set('markdown-preview-plus.pandocBIBFileFallback');
          config = setPandocOptions(file);
          return expect(config.args.bibliography).toEqual(void 0);
        });
      });
      it("should set pandoc bib options if citations are enabled and project bibFile exists", function() {
        return runs(function() {
          var bibPath, config;
          bibPath = path.join(tempPath, bibFile);
          fs.writeFileSync(bibPath, '');
          config = setPandocOptions(file);
          return expect(config.args.bibliography).toEqual(bibPath);
        });
      });
      it("should set pandoc bib options if citations are enabled and use fallback", function() {
        return runs(function() {
          var config;
          config = setPandocOptions(file);
          return expect(config.args.bibliography).toEqual(fallBackBib);
        });
      });
      it("shouldn't set pandoc csl options if citations are disabled", function() {
        return runs(function() {
          var config;
          atom.config.set('markdown-preview-plus.pandocBibliography', false);
          fs.writeFileSync(path.join(tempPath, cslFile), '');
          config = setPandocOptions(file);
          return expect(config.args.csl).toEqual(void 0);
        });
      });
      it("shouldn't set pandoc csl options if no fallback file exists", function() {
        return runs(function() {
          var config;
          atom.config.set('markdown-preview-plus.pandocCSLFileFallback');
          config = setPandocOptions(file);
          return expect(config.args.csl).toEqual(void 0);
        });
      });
      it("should set pandoc csl options if citations are enabled and project cslFile exists", function() {
        return runs(function() {
          var config, cslPath;
          cslPath = path.join(tempPath, cslFile);
          fs.writeFileSync(cslPath, '');
          config = setPandocOptions(file);
          return expect(config.args.csl).toEqual(cslPath);
        });
      });
      return it("should set pandoc csl options if citations are enabled and use fallback", function() {
        return runs(function() {
          var config;
          config = setPandocOptions(file);
          return expect(config.args.csl).toEqual(fallBackCsl);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy1wYW5kb2MtaGVscGVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1IsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBQ04sWUFBQSxHQUFlLE9BQUEsQ0FBUSw2QkFBUjs7RUFFZixPQUFBLEdBQVU7O0VBQ1YsT0FBQSxHQUFVOztFQUVWLFFBQUEsR0FBVzs7RUFDWCxJQUFBLEdBQU87O0VBRVAsT0FBQSxDQUFRLGVBQVI7O0VBRUEsUUFBQSxDQUFTLHFDQUFULEVBQWdELFNBQUE7QUFDOUMsUUFBQTtJQUFBLE1BQThCLEVBQTlCLEVBQUMseUJBQUQsRUFBbUI7SUFFbkIsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixVQUFyQjtNQUNmLFFBQUEsR0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWY7TUFDWCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsWUFBNUIsRUFBMEMsUUFBMUMsRUFBb0Q7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUFwRDtNQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLFFBQUQsQ0FBdEI7TUFFQSxPQUFPLENBQUMsWUFBUixDQUFBO01BRUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixPQUFPLENBQUMsV0FBUixDQUFv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QWZBIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG50ZW1wID0gcmVxdWlyZSAndGVtcCdcbndyZW5jaCA9IHJlcXVpcmUgJ3dyZW5jaCdcbnskfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xucGFuZG9jSGVscGVyID0gcmVxdWlyZSAnLi4vbGliL3BhbmRvYy1oZWxwZXIuY29mZmVlJ1xuXG5iaWJGaWxlID0gJ3Rlc3QuYmliJ1xuY3NsRmlsZSA9ICdmb28uY3NsJ1xuXG50ZW1wUGF0aCA9IG51bGxcbmZpbGUgPSBudWxsXG5cbnJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiTWFya2Rvd24gcHJldmlldyBwbHVzIHBhbmRvYyBoZWxwZXJcIiwgLT5cbiAgW3dvcmtzcGFjZUVsZW1lbnQsIHByZXZpZXddID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZml4dHVyZXNQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzJylcbiAgICB0ZW1wUGF0aCA9IHRlbXAubWtkaXJTeW5jKCdhdG9tJylcbiAgICB3cmVuY2guY29weURpclN5bmNSZWN1cnNpdmUoZml4dHVyZXNQYXRoLCB0ZW1wUGF0aCwgZm9yY2VEZWxldGU6IHRydWUpXG4gICAgYXRvbS5wcm9qZWN0LnNldFBhdGhzKFt0ZW1wUGF0aF0pXG5cbiAgICBqYXNtaW5lLnVzZVJlYWxDbG9jaygpXG5cbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIGphc21pbmUuYXR0YWNoVG9ET00od29ya3NwYWNlRWxlbWVudClcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoXCJtYXJrZG93bi1wcmV2aWV3LXBsdXNcIilcblxuICBkZXNjcmliZSBcIlBhbmRvY0hlbHBlcjo6ZmluZEZpbGVSZWN1cnNpdmVcIiwgLT5cblxuICAgIGZSID0gcGFuZG9jSGVscGVyLl9fdGVzdGluZ19fLmZpbmRGaWxlUmVjdXJzaXZlXG5cbiAgICBpdCBcInNob3VsZCByZXR1cm4gYmliRmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnlcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYmliUGF0aCA9IHBhdGguam9pbih0ZW1wUGF0aCwgJ3N1YmRpcicsIGJpYkZpbGUpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMgYmliUGF0aCwgJydcbiAgICAgICAgZm91bmQgPSBmUiBwYXRoLmpvaW4odGVtcFBhdGgsICdzdWJkaXInLCAnc2ltcGxlLm1kJyksIGJpYkZpbGVcbiAgICAgICAgZXhwZWN0KGZvdW5kKS50b0VxdWFsKGJpYlBhdGgpXG5cbiAgICBpdCBcInNob3VsZCByZXR1cm4gYmliRmlsZSBpbiBhIHBhcmVudCBkaXJlY3RvcnlcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYmliUGF0aCA9IHBhdGguam9pbih0ZW1wUGF0aCwgYmliRmlsZSlcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBiaWJQYXRoLCAnJ1xuICAgICAgICBmb3VuZCA9IGZSIHBhdGguam9pbih0ZW1wUGF0aCwgJ3N1YmRpcicsICdzaW1wbGUubWQnKSwgYmliRmlsZVxuICAgICAgICBleHBlY3QoZm91bmQpLnRvRXF1YWwoYmliUGF0aClcblxuICAgIGl0IFwic2hvdWxkbid0IHJldHVybiBiaWJGaWxlIGluIGEgb3V0IG9mIHNjb3BlIGRpcmVjdG9yeVwiLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHBhdGguam9pbih0ZW1wUGF0aCwgJy4uJywgYmliRmlsZSksICcnXG4gICAgICAgIGZvdW5kID0gZlIgcGF0aC5qb2luKHRlbXBQYXRoLCAnc3ViZGlyJywgJ3NpbXBsZS5tZCcpLCBiaWJGaWxlXG4gICAgICAgIGV4cGVjdChmb3VuZCkudG9FcXVhbChmYWxzZSlcblxuICBkZXNjcmliZSBcIlBhbmRvY0hlbHBlcjo6Z2V0QXJndW1lbnRzXCIsIC0+XG4gICAgZ2V0QXJndW1lbnRzID0gcGFuZG9jSGVscGVyLl9fdGVzdGluZ19fLmdldEFyZ3VtZW50c1xuXG4gICAgaXQgJ3Nob3VsZCB3b3JrIHdpdGggZW1wdHkgYXJndW1lbnRzJywgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0FyZ3VtZW50cycsIFtdXG4gICAgICByZXN1bHQgPSBnZXRBcmd1bWVudHMobnVsbClcbiAgICAgIGV4cGVjdChyZXN1bHQubGVuZ3RoKS50b0VxdWFsKDApXG5cbiAgICBpdCAnc2hvdWxkIGZpbHRlciBlbXB0eSBhcmd1bWVudHMnLCAtPlxuICAgICAgYXJncyA9XG4gICAgICAgIGZvbzogJ2JhcidcbiAgICAgICAgZW1wdHk6IG51bGxcbiAgICAgICAgbm9uZTogJ2xhbGEnXG4gICAgICAgIGVtcHR5MjogZmFsc2VcbiAgICAgICAgZW1wdHkzOiB1bmRlZmluZWRcbiAgICAgIHJlc3VsdCA9IGdldEFyZ3VtZW50cyhhcmdzKVxuICAgICAgZXhwZWN0KHJlc3VsdC5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgIGV4cGVjdChyZXN1bHRbMF0pLnRvRXF1YWwoJy0tZm9vPWJhcicpXG4gICAgICBleHBlY3QocmVzdWx0WzFdKS50b0VxdWFsKCctLW5vbmU9bGFsYScpXG5cbiAgICBpdCAnc2hvdWxkIGxvYWQgdXNlciBhcmd1bWVudHMnLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQXJndW1lbnRzJyxcbiAgICAgICAgWyctdicsICctLXNtYXJ0JywgJ3JlbScsICctLWZpbHRlcj0vZm9vL2JhcicsICctLWZpbHRlci1mb28gL2Zvby9iYXonXVxuICAgICAgYXJncyA9IHt9XG4gICAgICByZXN1bHQgPSBnZXRBcmd1bWVudHMoYXJncylcbiAgICAgIGV4cGVjdChyZXN1bHQubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICBleHBlY3QocmVzdWx0WzBdKS50b0VxdWFsKCctdicpXG4gICAgICBleHBlY3QocmVzdWx0WzFdKS50b0VxdWFsKCctLXNtYXJ0JylcbiAgICAgIGV4cGVjdChyZXN1bHRbMl0pLnRvRXF1YWwoJy0tZmlsdGVyPS9mb28vYmFyJylcbiAgICAgIGV4cGVjdChyZXN1bHRbM10pLnRvRXF1YWwoJy0tZmlsdGVyLWZvbz0vZm9vL2JheicpXG5cbiAgICBpdCAnc2hvdWxkIGNvbWJpbmUgdXNlciBhcmd1bWVudHMgYW5kIGdpdmVuIGFyZ3VtZW50cycsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NBcmd1bWVudHMnLFxuICAgICAgICBbJy12JywgJy0tZmlsdGVyLWZvbyAvZm9vL2JheiddXG4gICAgICBhcmdzID1cbiAgICAgICAgZm9vOiAnYmFyJ1xuICAgICAgICBlbXB0eTM6IHVuZGVmaW5lZFxuICAgICAgcmVzdWx0ID0gZ2V0QXJndW1lbnRzKGFyZ3MpXG4gICAgICBleHBlY3QocmVzdWx0Lmxlbmd0aCkudG9FcXVhbCgzKVxuICAgICAgZXhwZWN0KHJlc3VsdFswXSkudG9FcXVhbCgnLS1mb289YmFyJylcbiAgICAgIGV4cGVjdChyZXN1bHRbMV0pLnRvRXF1YWwoJy12JylcbiAgICAgIGV4cGVjdChyZXN1bHRbMl0pLnRvRXF1YWwoJy0tZmlsdGVyLWZvbz0vZm9vL2JheicpXG5cblxuICBkZXNjcmliZSBcIlBhbmRvY0hlbHBlcjo6c2V0UGFuZG9jT3B0aW9uc1wiLCAtPlxuICAgIGZhbGxCYWNrQmliID0gJy9mb28vZmFsbGJhY2suYmliJ1xuICAgIGZhbGxCYWNrQ3NsID0gJy9mb28vZmFsbGJhY2suY3NsJ1xuICAgIHNldFBhbmRvY09wdGlvbnMgPSBwYW5kb2NIZWxwZXIuX190ZXN0aW5nX18uc2V0UGFuZG9jT3B0aW9uc1xuXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBmaWxlID0gcGF0aC5qb2luIHRlbXBQYXRoLCAnc3ViZGlyJywgJ3NpbXBsZS5tZCdcbiAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0JpYmxpb2dyYXBoeScsIHRydWVcbiAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0JJQkZpbGUnLCBiaWJGaWxlXG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NCSUJGaWxlRmFsbGJhY2snLCBmYWxsQmFja0JpYlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ1NMRmlsZScsIGNzbEZpbGVcbiAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0NTTEZpbGVGYWxsYmFjaycsIGZhbGxCYWNrQ3NsXG5cbiAgICBpdCBcInNob3VsZG4ndCBzZXQgcGFuZG9jIGJpYiBvcHRpb25zIGlmIGNpdGF0aW9ucyBhcmUgZGlzYWJsZWRcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQmlibGlvZ3JhcGh5JywgZmFsc2VcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBwYXRoLmpvaW4odGVtcFBhdGgsIGJpYkZpbGUpLCAnJ1xuICAgICAgICBjb25maWcgPSBzZXRQYW5kb2NPcHRpb25zIGZpbGVcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5hcmdzLmJpYmxpb2dyYXBoeSkudG9FcXVhbCh1bmRlZmluZWQpXG5cbiAgICBpdCBcInNob3VsZG4ndCBzZXQgcGFuZG9jIGJpYiBvcHRpb25zIGlmIG5vIGZhbGxiYWNrIGZpbGUgZXhpc3RzXCIsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLnBhbmRvY0JJQkZpbGVGYWxsYmFjaydcbiAgICAgICAgY29uZmlnID0gc2V0UGFuZG9jT3B0aW9ucyBmaWxlXG4gICAgICAgIGV4cGVjdChjb25maWcuYXJncy5iaWJsaW9ncmFwaHkpLnRvRXF1YWwodW5kZWZpbmVkKVxuXG4gICAgaXQgXCJzaG91bGQgc2V0IHBhbmRvYyBiaWIgb3B0aW9ucyBpZiBjaXRhdGlvbnMgYXJlIGVuYWJsZWQgYW5kIHByb2plY3QgYmliRmlsZSBleGlzdHNcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYmliUGF0aCA9IHBhdGguam9pbih0ZW1wUGF0aCwgYmliRmlsZSlcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyBiaWJQYXRoLCAnJ1xuICAgICAgICBjb25maWcgPSBzZXRQYW5kb2NPcHRpb25zIGZpbGVcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5hcmdzLmJpYmxpb2dyYXBoeSkudG9FcXVhbChiaWJQYXRoKVxuXG4gICAgaXQgXCJzaG91bGQgc2V0IHBhbmRvYyBiaWIgb3B0aW9ucyBpZiBjaXRhdGlvbnMgYXJlIGVuYWJsZWQgYW5kIHVzZSBmYWxsYmFja1wiLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBjb25maWcgPSBzZXRQYW5kb2NPcHRpb25zIGZpbGVcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5hcmdzLmJpYmxpb2dyYXBoeSkudG9FcXVhbChmYWxsQmFja0JpYilcblxuICAgIGl0IFwic2hvdWxkbid0IHNldCBwYW5kb2MgY3NsIG9wdGlvbnMgaWYgY2l0YXRpb25zIGFyZSBkaXNhYmxlZFwiLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5wYW5kb2NCaWJsaW9ncmFwaHknLCBmYWxzZVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jIHBhdGguam9pbih0ZW1wUGF0aCwgY3NsRmlsZSksICcnXG4gICAgICAgIGNvbmZpZyA9IHNldFBhbmRvY09wdGlvbnMgZmlsZVxuICAgICAgICBleHBlY3QoY29uZmlnLmFyZ3MuY3NsKS50b0VxdWFsKHVuZGVmaW5lZClcblxuICAgIGl0IFwic2hvdWxkbid0IHNldCBwYW5kb2MgY3NsIG9wdGlvbnMgaWYgbm8gZmFsbGJhY2sgZmlsZSBleGlzdHNcIiwgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMucGFuZG9jQ1NMRmlsZUZhbGxiYWNrJ1xuICAgICAgICBjb25maWcgPSBzZXRQYW5kb2NPcHRpb25zIGZpbGVcbiAgICAgICAgZXhwZWN0KGNvbmZpZy5hcmdzLmNzbCkudG9FcXVhbCh1bmRlZmluZWQpXG5cbiAgICBpdCBcInNob3VsZCBzZXQgcGFuZG9jIGNzbCBvcHRpb25zIGlmIGNpdGF0aW9ucyBhcmUgZW5hYmxlZCBhbmQgcHJvamVjdCBjc2xGaWxlIGV4aXN0c1wiLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBjc2xQYXRoID0gcGF0aC5qb2luKHRlbXBQYXRoLCBjc2xGaWxlKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGNzbFBhdGgsICcnXG4gICAgICAgIGNvbmZpZyA9IHNldFBhbmRvY09wdGlvbnMgZmlsZVxuICAgICAgICBleHBlY3QoY29uZmlnLmFyZ3MuY3NsKS50b0VxdWFsKGNzbFBhdGgpXG5cbiAgICBpdCBcInNob3VsZCBzZXQgcGFuZG9jIGNzbCBvcHRpb25zIGlmIGNpdGF0aW9ucyBhcmUgZW5hYmxlZCBhbmQgdXNlIGZhbGxiYWNrXCIsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGNvbmZpZyA9IHNldFBhbmRvY09wdGlvbnMgZmlsZVxuICAgICAgICBleHBlY3QoY29uZmlnLmFyZ3MuY3NsKS50b0VxdWFsKGZhbGxCYWNrQ3NsKVxuIl19
