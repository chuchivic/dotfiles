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
      return describe("when the image uses an URL", function() {
        it("doesn't change the http(s) URL", function() {
          var image;
          image = preview.find("img[alt=Image3]");
          expect(markdownIt.decode).not.toHaveBeenCalled();
          return expect(image.attr('src')).toBe('https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png');
        });
        return it("doesn't change the data URL", function() {
          var image;
          image = preview.find("img[alt=Image4]");
          expect(markdownIt.decode).not.toHaveBeenCalled();
          return expect(image.attr('src')).toBe('data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy12aWV3LXBhbmRvYy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLDhCQUFSOztFQUN0QixVQUFBLEdBQWEsT0FBQSxDQUFRLDJCQUFSOztFQUNiLFlBQUEsR0FBZSxPQUFBLENBQVEsNkJBQVI7O0VBQ2YsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLFdBQUEsR0FBYyxPQUFBLENBQVEsYUFBUjs7RUFFZCxPQUFBLENBQVEsZUFBUjs7RUFFQSxRQUFBLENBQVMsNENBQVQsRUFBdUQsU0FBQTtBQUNyRCxRQUFBO0lBQUEsTUFBNEIsRUFBNUIsRUFBQyxhQUFELEVBQU8sZ0JBQVAsRUFBZ0I7SUFFaEIsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakMsQ0FBeUMsc0JBQXpDO01BQ1gsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakMsQ0FBeUMseUJBQXpDO01BQ1gsSUFBQSxHQUFPLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQ0w7UUFBQSxRQUFBLEVBQVUsT0FBVjtPQURLO01BR1AsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHVCQUE5QjtNQURjLENBQWhCO01BR0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCLEVBQXNELElBQXREO1FBQ0EsS0FBQSxDQUFNLFlBQU4sRUFBb0IsY0FBcEIsQ0FBbUMsQ0FBQyxXQUFwQyxDQUFnRCxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLFVBQWpCLEVBQTZCLEVBQTdCO2lCQUM5QyxFQUFBLENBQUcsSUFBSCxFQUFTLElBQVQ7UUFEOEMsQ0FBaEQ7UUFHQSxPQUFBLEdBQWMsSUFBQSxtQkFBQSxDQUFvQjtVQUFDLFVBQUEsUUFBRDtTQUFwQjtlQUNkLE9BQU8sQ0FBQyxXQUFSLENBQW9CLE9BQU8sQ0FBQyxPQUE1QjtNQU5HLENBQUw7YUFRQSxJQUFJLENBQUMsV0FBTCxDQUNFO1FBQUEsV0FBQSxFQUFhLFNBQUMsUUFBRDtpQkFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVosQ0FBa0IsQ0FBbEIsRUFBcUIsUUFBUSxDQUFDLE1BQTlCLENBQUEsS0FBeUM7UUFEOUIsQ0FBYjtPQURGO0lBakJTLENBQVg7SUFxQkEsU0FBQSxDQUFVLFNBQUE7YUFDUixPQUFPLENBQUMsT0FBUixDQUFBO0lBRFEsQ0FBVjtXQUdBLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBO01BQzFCLFVBQUEsQ0FBVyxTQUFBO1FBQ1QsS0FBQSxDQUFNLFVBQU4sRUFBa0IsUUFBbEIsQ0FBMkIsQ0FBQyxjQUE1QixDQUFBO2VBQ0EsZUFBQSxDQUFnQixTQUFBO2lCQUNkLE9BQU8sQ0FBQyxjQUFSLENBQUE7UUFEYyxDQUFoQjtNQUZTLENBQVg7TUFLQSxRQUFBLENBQVMscUNBQVQsRUFBZ0QsU0FBQTtlQUM5QyxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtBQUM1QyxjQUFBO1VBQUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxJQUFSLENBQWEsaUJBQWI7VUFDUixNQUFBLENBQU8sVUFBVSxDQUFDLE1BQWxCLENBQXlCLENBQUMsR0FBRyxDQUFDLGdCQUE5QixDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsQ0FBUCxDQUF5QixDQUFDLFdBQTFCLENBQXNDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBLENBQThCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBakMsQ0FBeUMsbUJBQXpDLENBQXRDO1FBSDRDLENBQTlDO01BRDhDLENBQWhEO01BTUEsUUFBQSxDQUFTLDBEQUFULEVBQXFFLFNBQUE7ZUFDbkUsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUE7QUFDcEQsY0FBQTtVQUFBLEtBQUEsR0FBUSxPQUFPLENBQUMsSUFBUixDQUFhLGlCQUFiO1VBQ1IsTUFBQSxDQUFPLFVBQVUsQ0FBQyxNQUFsQixDQUF5QixDQUFDLEdBQUcsQ0FBQyxnQkFBOUIsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQVAsQ0FBeUIsQ0FBQyxXQUExQixDQUFzQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBQSxDQUE4QixDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWpDLENBQXlDLGdCQUF6QyxDQUF0QztRQUhvRCxDQUF0RDtNQURtRSxDQUFyRTtNQU1BLFFBQUEsQ0FBUyxrREFBVCxFQUE2RCxTQUFBO2VBQzNELEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBO1VBQzVCLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFFQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWYsQ0FBVixFQUFrQyxRQUFsQztVQUNYLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLGNBQUEsR0FBZSxRQUFmLEdBQXdCLEdBQW5EO1VBRUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxZQUFkLEVBQTRCLGNBQTVCO1VBQ0EsS0FBQSxDQUFNLFlBQU4sRUFBb0IsY0FBcEIsQ0FBbUMsQ0FBQyxXQUFwQyxDQUFnRCxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLFVBQWpCLEVBQTZCLEVBQTdCO21CQUM5QyxFQUFBLENBQUcsSUFBSCxFQUFTLHFDQUFBLEdBRUssUUFGTCxHQUVjLCtEQUZ2QjtVQUQ4QyxDQUFoRDtVQU9BLE9BQUEsR0FBYyxJQUFBLG1CQUFBLENBQW9CO1lBQUMsVUFBQSxRQUFEO1dBQXBCO1VBQ2QsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBTyxDQUFDLE9BQTVCO1VBRUEsZUFBQSxDQUFnQixTQUFBO21CQUNkLE9BQU8sQ0FBQyxjQUFSLENBQUE7VUFEYyxDQUFoQjtpQkFHQSxJQUFBLENBQUssU0FBQTtZQUNILE1BQUEsQ0FBTyxVQUFVLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxHQUFHLENBQUMsZ0JBQTlCLENBQUE7bUJBQ0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsbUJBQWIsQ0FBaUMsQ0FBQyxJQUFsQyxDQUF1QyxLQUF2QyxDQUFQLENBQXFELENBQUMsV0FBdEQsQ0FBcUUsUUFBRCxHQUFVLEtBQTlFO1VBRkcsQ0FBTDtRQXBCNEIsQ0FBOUI7TUFEMkQsQ0FBN0Q7YUF5QkEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7UUFDckMsRUFBQSxDQUFHLGdDQUFILEVBQXFDLFNBQUE7QUFDbkMsY0FBQTtVQUFBLEtBQUEsR0FBUSxPQUFPLENBQUMsSUFBUixDQUFhLGlCQUFiO1VBQ1IsTUFBQSxDQUFPLFVBQVUsQ0FBQyxNQUFsQixDQUF5QixDQUFDLEdBQUcsQ0FBQyxnQkFBOUIsQ0FBQTtpQkFDQSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFYLENBQVAsQ0FBeUIsQ0FBQyxJQUExQixDQUErQix5RkFBL0I7UUFIbUMsQ0FBckM7ZUFLQSxFQUFBLENBQUcsNkJBQUgsRUFBa0MsU0FBQTtBQUNoQyxjQUFBO1VBQUEsS0FBQSxHQUFRLE9BQU8sQ0FBQyxJQUFSLENBQWEsaUJBQWI7VUFDUixNQUFBLENBQU8sVUFBVSxDQUFDLE1BQWxCLENBQXlCLENBQUMsR0FBRyxDQUFDLGdCQUE5QixDQUFBO2lCQUNBLE1BQUEsQ0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEtBQVgsQ0FBUCxDQUF5QixDQUFDLElBQTFCLENBQStCLHdUQUEvQjtRQUhnQyxDQUFsQztNQU5xQyxDQUF2QztJQTNDMEIsQ0FBNUI7RUEzQnFELENBQXZEO0FBWEEiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnRlbXAgPSByZXF1aXJlICd0ZW1wJ1xuTWFya2Rvd25QcmV2aWV3VmlldyA9IHJlcXVpcmUgJy4uL2xpYi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG5tYXJrZG93bkl0ID0gcmVxdWlyZSAnLi4vbGliL21hcmtkb3duLWl0LWhlbHBlcidcbnBhbmRvY0hlbHBlciA9IHJlcXVpcmUgJy4uL2xpYi9wYW5kb2MtaGVscGVyLmNvZmZlZSdcbnVybCA9IHJlcXVpcmUgJ3VybCdcbnF1ZXJ5U3RyaW5nID0gcmVxdWlyZSAncXVlcnlzdHJpbmcnXG5cbnJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiTWFya2Rvd25QcmV2aWV3VmlldyB3aGVuIFBhbmRvYyBpcyBlbmFibGVkXCIsIC0+XG4gIFtodG1sLCBwcmV2aWV3LCBmaWxlUGF0aF0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBmaWxlUGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3N1YmRpci9maWxlLm1hcmtkb3duJylcbiAgICBodG1sUGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3N1YmRpci9maWxlLXBhbmRvYy5odG1sJylcbiAgICBodG1sID0gZnMucmVhZEZpbGVTeW5jIGh0bWxQYXRoLFxuICAgICAgZW5jb2Rpbmc6ICd1dGYtOCdcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXctcGx1cycpXG5cbiAgICBydW5zIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVQYW5kb2MnLCB0cnVlXG4gICAgICBzcHlPbihwYW5kb2NIZWxwZXIsICdyZW5kZXJQYW5kb2MnKS5hbmRDYWxsRmFrZSAodGV4dCwgZmlsZVBhdGgsIHJlbmRlck1hdGgsIGNiKSAtPlxuICAgICAgICBjYiBudWxsLCBodG1sXG5cbiAgICAgIHByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGh9KVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShwcmV2aWV3LmVsZW1lbnQpXG5cbiAgICB0aGlzLmFkZE1hdGNoZXJzXG4gICAgICB0b1N0YXJ0V2l0aDogKGV4cGVjdGVkKSAtPlxuICAgICAgICB0aGlzLmFjdHVhbC5zbGljZSgwLCBleHBlY3RlZC5sZW5ndGgpIGlzIGV4cGVjdGVkXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgcHJldmlldy5kZXN0cm95KClcblxuICBkZXNjcmliZSBcImltYWdlIHJlc29sdmluZ1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHNweU9uKG1hcmtkb3duSXQsICdkZWNvZGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGltYWdlIHVzZXMgYSByZWxhdGl2ZSBwYXRoXCIsIC0+XG4gICAgICBpdCBcInJlc29sdmVzIHRvIGEgcGF0aCByZWxhdGl2ZSB0byB0aGUgZmlsZVwiLCAtPlxuICAgICAgICBpbWFnZSA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9SW1hZ2UxXVwiKVxuICAgICAgICBleHBlY3QobWFya2Rvd25JdC5kZWNvZGUpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGltYWdlLmF0dHIoJ3NyYycpKS50b1N0YXJ0V2l0aCBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvaW1hZ2UxLnBuZycpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGltYWdlIHVzZXMgYW4gYWJzb2x1dGUgcGF0aCB0aGF0IGRvZXMgbm90IGV4aXN0XCIsIC0+XG4gICAgICBpdCBcInJlc29sdmVzIHRvIGEgcGF0aCByZWxhdGl2ZSB0byB0aGUgcHJvamVjdCByb290XCIsIC0+XG4gICAgICAgIGltYWdlID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1JbWFnZTJdXCIpXG4gICAgICAgIGV4cGVjdChtYXJrZG93bkl0LmRlY29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoaW1hZ2UuYXR0cignc3JjJykpLnRvU3RhcnRXaXRoIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3RtcC9pbWFnZTIucG5nJylcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgaW1hZ2UgdXNlcyBhbiBhYnNvbHV0ZSBwYXRoIHRoYXQgZXhpc3RzXCIsIC0+XG4gICAgICBpdCBcImFkZHMgYSBxdWVyeSB0byB0aGUgVVJMXCIsIC0+XG4gICAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4odGVtcC5ta2RpclN5bmMoJ2F0b20nKSwgJ2Zvby5tZCcpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIFwiIVthYnNvbHV0ZV0oI3tmaWxlUGF0aH0pXCIpXG5cbiAgICAgICAgamFzbWluZS51bnNweShwYW5kb2NIZWxwZXIsICdyZW5kZXJQYW5kb2MnKVxuICAgICAgICBzcHlPbihwYW5kb2NIZWxwZXIsICdyZW5kZXJQYW5kb2MnKS5hbmRDYWxsRmFrZSAodGV4dCwgZmlsZVBhdGgsIHJlbmRlck1hdGgsIGNiKSAtPlxuICAgICAgICAgIGNiIG51bGwsIFwiXCJcIlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZpZ3VyZVwiPlxuICAgICAgICAgICAgPGltZyBzcmM9XCIje2ZpbGVQYXRofVwiIGFsdD1cImFic29sdXRlXCI+PHAgY2xhc3M9XCJjYXB0aW9uXCI+YWJzb2x1dGU8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIHByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGh9KVxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHByZXZpZXcuZWxlbWVudClcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KHByZXZpZXcuZmluZChcImltZ1thbHQ9YWJzb2x1dGVdXCIpLmF0dHIoJ3NyYycpKS50b1N0YXJ0V2l0aCBcIiN7ZmlsZVBhdGh9P3Y9XCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgaW1hZ2UgdXNlcyBhbiBVUkxcIiwgLT5cbiAgICAgIGl0IFwiZG9lc24ndCBjaGFuZ2UgdGhlIGh0dHAocykgVVJMXCIsIC0+XG4gICAgICAgIGltYWdlID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1JbWFnZTNdXCIpXG4gICAgICAgIGV4cGVjdChtYXJrZG93bkl0LmRlY29kZSkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoaW1hZ2UuYXR0cignc3JjJykpLnRvQmUgJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9HYWxhZGlyaXRoL21hcmtkb3duLXByZXZpZXctcGx1cy9tYXN0ZXIvYXNzZXRzL2hyLnBuZydcblxuICAgICAgaXQgXCJkb2Vzbid0IGNoYW5nZSB0aGUgZGF0YSBVUkxcIiwgLT5cbiAgICAgICAgaW1hZ2UgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PUltYWdlNF1cIilcbiAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChpbWFnZS5hdHRyKCdzcmMnKSkudG9CZSAnZGF0YTppbWFnZS9naWY7YmFzZTY0LFIwbEdPRGxoRUFBUUFNUUFBT1JISE9WU0t1ZGZPdWxyU09wM1dPeURadTZRZHZDY2hQR29sZk8wby9YQnMvZk53ZmpaMGZybDMvenk3Ly8vL3dBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFDSDVCQWtBQUJBQUxBQUFBQUFRQUJBQUFBVlZJQ1NPWkdsQ1FBb3NKNm11N2ZpeVplS3FOS1RvUUdEc004aEJBRGdVWG9HQWlxaFN2cDVRQW5RS0dJZ1Vod0ZVWUxDVkRGQ3JLVUUxbEJhdkFWaUZJRGxUSW1iS0M1R20yaEIwU2xCQ0JNUWlCMFVqSVFBNydcbiJdfQ==
