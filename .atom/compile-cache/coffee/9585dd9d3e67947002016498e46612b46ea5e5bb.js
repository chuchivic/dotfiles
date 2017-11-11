(function() {
  var MarkdownPreviewView, fs, markdownIt, pandocHelper, path, queryString, temp, url;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  MarkdownPreviewView = require('../lib/markdown-preview-view');

  markdownIt = require('../lib/markdown-it-helper');

  pandocHelper = require('../lib/pandoc-helper.coffee');

  url = require('url');

  queryString = require('querystring');

  require('./spec-helper');

  describe("MarkdownPreviewView when Pandoc is enabled", function() {
    var filePath, html, preview, ref;
    ref = [], html = ref[0], preview = ref[1], filePath = ref[2];
    beforeEach(function() {
      var htmlPath;
      filePath = atom.project.getDirectories()[0].resolve('subdir/file.markdown');
      htmlPath = atom.project.getDirectories()[0].resolve('subdir/file-pandoc.html');
      html = fs.readFileSync(htmlPath, {
        encoding: 'utf-8'
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('markdown-preview-plus');
      });
      runs(function() {
        atom.config.set('markdown-preview-plus.enablePandoc', true);
        spyOn(pandocHelper, 'renderPandoc').andCallFake(function(text, filePath, renderMath, cb) {
          return cb(null, html);
        });
        preview = new MarkdownPreviewView({
          filePath: filePath
        });
        return jasmine.attachToDOM(preview.element);
      });
      return this.addMatchers({
        toStartWith: function(expected) {
          return this.actual.slice(0, expected.length) === expected;
        }
      });
    });
    afterEach(function() {
      return preview.destroy();
    });
    return describe("image resolving", function() {
      beforeEach(function() {
        spyOn(markdownIt, 'decode').andCallThrough();
        return waitsForPromise(function() {
          return preview.renderMarkdown();
        });
      });
      describe("when the image uses a relative path", function() {
        return it("resolves to a path relative to the file", function() {
          var image;
          image = preview.find("img[alt=Image1]");
          expect(markdownIt.decode).not.toHaveBeenCalled();
          return expect(image.attr('src')).toStartWith(atom.project.getDirectories()[0].resolve('subdir/image1.png'));
        });
      });
      describe("when the image uses an absolute path that does not exist", function() {
        return it("resolves to a path relative to the project root", function() {
          var image;
          image = preview.find("img[alt=Image2]");
          expect(markdownIt.decode).not.toHaveBeenCalled();
          return expect(image.attr('src')).toStartWith(atom.project.getDirectories()[0].resolve('tmp/image2.png'));
        });
      });
      describe("when the image uses an absolute path that exists", function() {
        return it("adds a query to the URL", function() {
          preview.destroy();
          filePath = path.join(temp.mkdirSync('atom'), 'foo.md');
          fs.writeFileSync(filePath, "![absolute](" + filePath + ")");
          jasmine.unspy(pandocHelper, 'renderPandoc');
          spyOn(pandocHelper, 'renderPandoc').andCallFake(function(text, filePath, renderMath, cb) {
            return cb(null, "<div class=\"figure\">\n<img src=\"" + filePath + "\" alt=\"absolute\"><p class=\"caption\">absolute</p>\n</div>");
          });
          preview = new MarkdownPreviewView({
            filePath: filePath
          });
          jasmine.attachToDOM(preview.element);
          waitsForPromise(function() {
            return preview.renderMarkdown();
          });
          return runs(function() {
            expect(markdownIt.decode).not.toHaveBeenCalled();
            return expect(preview.find("img[alt=absolute]").attr('src')).toStartWith(filePath + "?v=");
          });
        });
      });
      return describe("when the image uses a web URL", function() {
        return it("doesn't change the URL", function() {
          var image;
          image = preview.find("img[alt=Image3]");
          expect(markdownIt.decode).not.toHaveBeenCalled();
          return expect(image.attr('src')).toBe('https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy12aWV3LXBhbmRvYy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDhCQUFSOztFQUN0QixVQUFBLEdBQWEsT0FBQSxDQUFRLDJCQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsNkJBQVI7O0VBQ2YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLFdBQUEsR0FBYyxPQUFBLENBQVEsYUFBUjs7RUFFZCxPQUFBLENBQVEsZUFBUjs7RUFFQSxRQUFBLENBQVMsNENBQVQsRUFBdUQsU0FBQTtBQUNyRCxRQUFBO0lBQUEsTUFBNEIsRUFBNUIsRUFBQyxhQUFELEVBQU8sZ0JBQVAsRUFBZ0I7SUFFaEIsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakMsQ0FBeUMsc0JBQXpDO01BQ1gsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakMsQ0FBeUMseUJBQXpDO01BQ1gsSUFBQSxHQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQ0w7UUFBQSxRQUFBLEVBQVUsT0FBVjtPQURLO01BR1AsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHVCQUE5QjtNQURj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QUM5QyxFQUFBLENBQUcsSUFBSCxFQUFTLHFDQUFBLEdBRUssUUFGTCxHQUVjLCtEQUZ2QjtVQUQ4QyxDQUFoRDtVQU9BLE9BQUEsR0FBYyxJQUFBLG1CQUFBLENBQW9CO1lBQUMsVUFBQSxRQUFEO1dBQXBCO1VBQ2QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBTyxDQUFDLE9BQTVCO1VBRUEsZUFBQSxDQUFnQixTQUFBO21CQUNkLE9BQU8sQ0FBQyxjQUFSLENBQUE7VUFEYyxDQUFoQjtpQkFHQSxJQUFBLENBQUssU0FBQTtZQUNILE1BQUEsQ0FBTyxVQUFVLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxHQUFHLENBQUMsZ0JBQTlCLENBQUE7bUJBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsbUJBQWIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxLQUF2QyxDQUFQLENBQXFELENBQUMsV0FBdEQsQ0FBcUUsUUFBRCxHQUFVLEtBQTlFO1VBRkcsQ0FBTDtRQXBCNEIsQ0FBOUI7TUFEMkQsQ0FBN0Q7YUF5QkEsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7ZUFDeEMsRUFBQSxDQUFHLHdCQUFILEVBQTZCLFNBQUE7QUFDM0IsY0FBQTtVQUFBLEtBQUEsR0FBUSxPQUFPLENBQUMsSUFBUixDQUFhLGlCQUFiO1VBQ1IsTUFBQSxDQUFPLFVBQVUsQ0FBQyxNQUFsQixDQUF5QixDQUFDLEdBQUcsQ0FBQyxnQkFBOUIsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQVAsQ0FBeUIsQ0FBQyxJQUExQixDQUErQix5RkFBL0I7UUFIMkIsQ0FBN0I7TUFEd0MsQ0FBMUM7SUEzQzBCLENBQTVCO0VBM0JxRCxDQUF2RDtBQVhBIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG50ZW1wID0gcmVxdWlyZSAndGVtcCdcbk1hcmtkb3duUHJldmlld1ZpZXcgPSByZXF1aXJlICcuLi9saWIvbWFya2Rvd24tcHJldmlldy12aWV3J1xubWFya2Rvd25JdCA9IHJlcXVpcmUgJy4uL2xpYi9tYXJrZG93bi1pdC1oZWxwZXInXG5wYW5kb2NIZWxwZXIgPSByZXF1aXJlICcuLi9saWIvcGFuZG9jLWhlbHBlci5jb2ZmZWUnXG51cmwgPSByZXF1aXJlICd1cmwnXG5xdWVyeVN0cmluZyA9IHJlcXVpcmUgJ3F1ZXJ5c3RyaW5nJ1xuXG5yZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIk1hcmtkb3duUHJldmlld1ZpZXcgd2hlbiBQYW5kb2MgaXMgZW5hYmxlZFwiLCAtPlxuICBbaHRtbCwgcHJldmlldywgZmlsZVBhdGhdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZmlsZVBhdGggPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvZmlsZS5tYXJrZG93bicpXG4gICAgaHRtbFBhdGggPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvZmlsZS1wYW5kb2MuaHRtbCcpXG4gICAgaHRtbCA9IGZzLnJlYWRGaWxlU3luYyBodG1sUGF0aCxcbiAgICAgIGVuY29kaW5nOiAndXRmLTgnXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKVxuXG4gICAgcnVucyAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlUGFuZG9jJywgdHJ1ZVxuICAgICAgc3B5T24ocGFuZG9jSGVscGVyLCAncmVuZGVyUGFuZG9jJykuYW5kQ2FsbEZha2UgKHRleHQsIGZpbGVQYXRoLCByZW5kZXJNYXRoLCBjYikgLT5cbiAgICAgICAgY2IgbnVsbCwgaHRtbFxuXG4gICAgICBwcmV2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe2ZpbGVQYXRofSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00ocHJldmlldy5lbGVtZW50KVxuXG4gICAgdGhpcy5hZGRNYXRjaGVyc1xuICAgICAgdG9TdGFydFdpdGg6IChleHBlY3RlZCkgLT5cbiAgICAgICAgdGhpcy5hY3R1YWwuc2xpY2UoMCwgZXhwZWN0ZWQubGVuZ3RoKSBpcyBleHBlY3RlZFxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgXCJpbWFnZSByZXNvbHZpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihtYXJrZG93bkl0LCAnZGVjb2RlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbWFnZSB1c2VzIGEgcmVsYXRpdmUgcGF0aFwiLCAtPlxuICAgICAgaXQgXCJyZXNvbHZlcyB0byBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgaW1hZ2UgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PUltYWdlMV1cIilcbiAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChpbWFnZS5hdHRyKCdzcmMnKSkudG9TdGFydFdpdGggYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgnc3ViZGlyL2ltYWdlMS5wbmcnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbWFnZSB1c2VzIGFuIGFic29sdXRlIHBhdGggdGhhdCBkb2VzIG5vdCBleGlzdFwiLCAtPlxuICAgICAgaXQgXCJyZXNvbHZlcyB0byBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIHByb2plY3Qgcm9vdFwiLCAtPlxuICAgICAgICBpbWFnZSA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9SW1hZ2UyXVwiKVxuICAgICAgICBleHBlY3QobWFya2Rvd25JdC5kZWNvZGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGltYWdlLmF0dHIoJ3NyYycpKS50b1N0YXJ0V2l0aCBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCd0bXAvaW1hZ2UyLnBuZycpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGltYWdlIHVzZXMgYW4gYWJzb2x1dGUgcGF0aCB0aGF0IGV4aXN0c1wiLCAtPlxuICAgICAgaXQgXCJhZGRzIGEgcXVlcnkgdG8gdGhlIFVSTFwiLCAtPlxuICAgICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHRlbXAubWtkaXJTeW5jKCdhdG9tJyksICdmb28ubWQnKVxuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBcIiFbYWJzb2x1dGVdKCN7ZmlsZVBhdGh9KVwiKVxuXG4gICAgICAgIGphc21pbmUudW5zcHkocGFuZG9jSGVscGVyLCAncmVuZGVyUGFuZG9jJylcbiAgICAgICAgc3B5T24ocGFuZG9jSGVscGVyLCAncmVuZGVyUGFuZG9jJykuYW5kQ2FsbEZha2UgKHRleHQsIGZpbGVQYXRoLCByZW5kZXJNYXRoLCBjYikgLT5cbiAgICAgICAgICBjYiBudWxsLCBcIlwiXCJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWd1cmVcIj5cbiAgICAgICAgICAgIDxpbWcgc3JjPVwiI3tmaWxlUGF0aH1cIiBhbHQ9XCJhYnNvbHV0ZVwiPjxwIGNsYXNzPVwiY2FwdGlvblwiPmFic29sdXRlPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBwcmV2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe2ZpbGVQYXRofSlcbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShwcmV2aWV3LmVsZW1lbnQpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChtYXJrZG93bkl0LmRlY29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWFic29sdXRlXVwiKS5hdHRyKCdzcmMnKSkudG9TdGFydFdpdGggXCIje2ZpbGVQYXRofT92PVwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGltYWdlIHVzZXMgYSB3ZWIgVVJMXCIsIC0+XG4gICAgICBpdCBcImRvZXNuJ3QgY2hhbmdlIHRoZSBVUkxcIiwgLT5cbiAgICAgICAgaW1hZ2UgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PUltYWdlM11cIilcbiAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChpbWFnZS5hdHRyKCdzcmMnKSkudG9CZSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0dhbGFkaXJpdGgvbWFya2Rvd24tcHJldmlldy1wbHVzL21hc3Rlci9hc3NldHMvaHIucG5nJ1xuIl19
