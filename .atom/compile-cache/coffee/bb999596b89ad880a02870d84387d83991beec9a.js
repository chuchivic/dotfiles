(function() {
  var MarkdownPreviewView, fs, markdownIt, mathjaxHelper, path, queryString, temp, url;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  MarkdownPreviewView = require('../lib/markdown-preview-view');

  markdownIt = require('../lib/markdown-it-helper');

  mathjaxHelper = require('../lib/mathjax-helper');

  url = require('url');

  queryString = require('querystring');

  require('./spec-helper');

  describe("MarkdownPreviewView", function() {
    var expectPreviewInSplitPane, filePath, preview, ref;
    ref = [], filePath = ref[0], preview = ref[1];
    beforeEach(function() {
      preview = filePath = null;
      waitsForPromise(function() {
        return Promise.all([atom.packages.activatePackage('language-ruby'), atom.packages.activatePackage('language-javascript')]);
      });
      waitsFor(function() {
        return atom.grammars.grammarForScopeName('source.ruby') !== void 0;
      });
      waitsFor(function() {
        return atom.grammars.grammarForScopeName('source.js') !== void 0;
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('markdown-preview-plus');
      });
      return runs(function() {
        filePath = atom.project.getDirectories()[0].resolve('subdir/file.markdown');
        preview = new MarkdownPreviewView({
          filePath: filePath
        });
        jasmine.attachToDOM(preview.element);
        return this.addMatchers({
          toStartWith: function(expected) {
            return this.actual.slice(0, expected.length) === expected;
          }
        });
      });
    });
    afterEach(function() {
      return preview.destroy();
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
    describe("::constructor", function() {
      return it("shows an error message when there is an error", function() {
        preview.showError("Not a real file");
        return expect(preview.text()).toContain("Failed");
      });
    });
    describe("serialization", function() {
      var newPreview;
      newPreview = null;
      afterEach(function() {
        return newPreview != null ? newPreview.destroy() : void 0;
      });
      it("recreates the preview when serialized/deserialized", function() {
        newPreview = atom.deserializers.deserialize(preview.serialize());
        jasmine.attachToDOM(newPreview.element);
        return expect(newPreview.getPath()).toBe(preview.getPath());
      });
      it("does not recreate a preview when the file no longer exists", function() {
        var serialized;
        filePath = path.join(temp.mkdirSync('markdown-preview-'), 'foo.md');
        fs.writeFileSync(filePath, '# Hi');
        newPreview = new MarkdownPreviewView({
          filePath: filePath
        });
        serialized = newPreview.serialize();
        fs.removeSync(filePath);
        newPreview = atom.deserializers.deserialize(serialized);
        return expect(newPreview).toBeUndefined();
      });
      return it("serializes the editor id when opened for an editor", function() {
        preview.destroy();
        waitsForPromise(function() {
          return atom.workspace.open('new.markdown');
        });
        return runs(function() {
          preview = new MarkdownPreviewView({
            editorId: atom.workspace.getActiveTextEditor().id
          });
          jasmine.attachToDOM(preview.element);
          expect(preview.getPath()).toBe(atom.workspace.getActiveTextEditor().getPath());
          newPreview = atom.deserializers.deserialize(preview.serialize());
          jasmine.attachToDOM(newPreview.element);
          return expect(newPreview.getPath()).toBe(preview.getPath());
        });
      });
    });
    describe("header rendering", function() {
      it("should render headings with and without space", function() {
        waitsForPromise(function() {
          return preview.renderMarkdown();
        });
        return runs(function() {
          var headlines;
          headlines = preview.find('h2');
          expect(headlines).toExist();
          expect(headlines.length).toBe(2);
          expect(headlines[0].outerHTML).toBe("<h2>Level two header without space</h2>");
          return expect(headlines[1].outerHTML).toBe("<h2>Level two header with space</h2>");
        });
      });
      return it("should render headings with and without space", function() {
        atom.config.set('markdown-preview-plus.useLazyHeaders', false);
        waitsForPromise(function() {
          return preview.renderMarkdown();
        });
        return runs(function() {
          var headlines;
          headlines = preview.find('h2');
          expect(headlines).toExist();
          expect(headlines.length).toBe(1);
          return expect(headlines[0].outerHTML).toBe("<h2>Level two header with space</h2>");
        });
      });
    });
    describe("code block conversion to atom-text-editor tags", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return preview.renderMarkdown();
        });
      });
      it("removes line decorations on rendered code blocks", function() {
        var decorations, editor;
        editor = preview.find("atom-text-editor[data-grammar='text plain null-grammar']");
        decorations = editor[0].getModel().getDecorations({
          "class": 'cursor-line',
          type: 'line'
        });
        return expect(decorations.length).toBe(0);
      });
      it("removes a trailing newline but preserves remaining leading and trailing whitespace", function() {
        var newFilePath, newPreview;
        newFilePath = atom.project.getDirectories()[0].resolve('subdir/trim-nl.md');
        newPreview = new MarkdownPreviewView({
          filePath: newFilePath
        });
        jasmine.attachToDOM(newPreview.element);
        waitsForPromise(function() {
          return newPreview.renderMarkdown();
        });
        runs(function() {
          var editor;
          editor = newPreview.find("atom-text-editor");
          expect(editor).toExist();
          return expect(editor[0].getModel().getText()).toBe("\n     a\n    b\n   c\n  d\n e\nf\n");
        });
        return runs(function() {
          return newPreview.destroy();
        });
      });
      describe("when the code block's fence name has a matching grammar", function() {
        return it("assigns the grammar on the atom-text-editor", function() {
          var jsEditor, rubyEditor;
          rubyEditor = preview.find("atom-text-editor[data-grammar='source ruby']");
          expect(rubyEditor).toExist();
          expect(rubyEditor[0].getModel().getText()).toBe("def func\n  x = 1\nend");
          jsEditor = preview.find("atom-text-editor[data-grammar='source js']");
          expect(jsEditor).toExist();
          return expect(jsEditor[0].getModel().getText()).toBe("if a === 3 {\n  b = 5\n}");
        });
      });
      return describe("when the code block's fence name doesn't have a matching grammar", function() {
        return it("does not assign a specific grammar", function() {
          var plainEditor;
          plainEditor = preview.find("atom-text-editor[data-grammar='text plain null-grammar']");
          expect(plainEditor).toExist();
          return expect(plainEditor[0].getModel().getText()).toBe("function f(x) {\n  return x++;\n}");
        });
      });
    });
    describe("image resolving", function() {
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
          expect(markdownIt.decode).toHaveBeenCalled();
          return expect(image.attr('src')).toStartWith(atom.project.getDirectories()[0].resolve('subdir/image1.png'));
        });
      });
      describe("when the image uses an absolute path that does not exist", function() {
        return it("resolves to a path relative to the project root", function() {
          var image;
          image = preview.find("img[alt=Image2]");
          expect(markdownIt.decode).toHaveBeenCalled();
          return expect(image.attr('src')).toStartWith(atom.project.getDirectories()[0].resolve('tmp/image2.png'));
        });
      });
      describe("when the image uses an absolute path that exists", function() {
        return it("adds a query to the URL", function() {
          preview.destroy();
          filePath = path.join(temp.mkdirSync('atom'), 'foo.md');
          fs.writeFileSync(filePath, "![absolute](" + filePath + ")");
          preview = new MarkdownPreviewView({
            filePath: filePath
          });
          jasmine.attachToDOM(preview.element);
          waitsForPromise(function() {
            return preview.renderMarkdown();
          });
          return runs(function() {
            expect(markdownIt.decode).toHaveBeenCalled();
            return expect(preview.find("img[alt=absolute]").attr('src')).toStartWith(filePath + "?v=");
          });
        });
      });
      return describe("when the image uses a URL", function() {
        it("doesn't change the web URL", function() {
          var image;
          image = preview.find("img[alt=Image3]");
          expect(markdownIt.decode).toHaveBeenCalled();
          return expect(image.attr('src')).toBe('https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png');
        });
        return it("doesn't change the data URL", function() {
          var image;
          image = preview.find("img[alt=Image4]");
          expect(markdownIt.decode).toHaveBeenCalled();
          return expect(image.attr('src')).toBe('data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ0frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7');
        });
      });
    });
    describe("image modification", function() {
      var dirPath, getImageVersion, img1Path, ref1, workspaceElement;
      ref1 = [], dirPath = ref1[0], filePath = ref1[1], img1Path = ref1[2], workspaceElement = ref1[3];
      beforeEach(function() {
        preview.destroy();
        jasmine.useRealClock();
        dirPath = temp.mkdirSync('atom');
        filePath = path.join(dirPath, 'image-modification.md');
        img1Path = path.join(dirPath, 'img1.png');
        fs.writeFileSync(filePath, "![img1](" + img1Path + ")");
        fs.writeFileSync(img1Path, "clearly not a png but good enough for tests");
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
      getImageVersion = function(imagePath, imageURL) {
        var urlQuery, urlQueryStr;
        expect(imageURL).toStartWith(imagePath + "?v=");
        urlQueryStr = url.parse(imageURL).query;
        urlQuery = queryString.parse(urlQueryStr);
        return urlQuery.v;
      };
      describe("when a local image is previewed", function() {
        return it("adds a timestamp query to the URL", function() {
          waitsForPromise(function() {
            return atom.workspace.open(filePath);
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          expectPreviewInSplitPane();
          return runs(function() {
            var imageURL, imageVer;
            imageURL = preview.find("img[alt=img1]").attr('src');
            imageVer = getImageVersion(img1Path, imageURL);
            return expect(imageVer).not.toEqual('deleted');
          });
        });
      });
      describe("when a local image is modified during a preview #notwercker", function() {
        return it("rerenders the image with a more recent timestamp query", function() {
          var imageURL, imageVer, ref2;
          ref2 = [], imageURL = ref2[0], imageVer = ref2[1];
          waitsForPromise(function() {
            return atom.workspace.open(filePath);
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          expectPreviewInSplitPane();
          runs(function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            imageVer = getImageVersion(img1Path, imageURL);
            expect(imageVer).not.toEqual('deleted');
            return fs.writeFileSync(img1Path, "still clearly not a png ;D");
          });
          waitsFor("image src attribute to update", function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            return !imageURL.endsWith(imageVer);
          });
          return runs(function() {
            var newImageVer;
            newImageVer = getImageVersion(img1Path, imageURL);
            expect(newImageVer).not.toEqual('deleted');
            return expect(parseInt(newImageVer)).toBeGreaterThan(parseInt(imageVer));
          });
        });
      });
      describe("when three images are previewed and all are modified #notwercker", function() {
        return it("rerenders the images with a more recent timestamp as they are modified", function() {
          var expectQueryValues, getImageElementsURL, img1URL, img1Ver, img2Path, img2URL, img2Ver, img3Path, img3URL, img3Ver, ref2, ref3, ref4;
          ref2 = [], img2Path = ref2[0], img3Path = ref2[1];
          ref3 = [], img1Ver = ref3[0], img2Ver = ref3[1], img3Ver = ref3[2];
          ref4 = [], img1URL = ref4[0], img2URL = ref4[1], img3URL = ref4[2];
          runs(function() {
            preview.destroy();
            img2Path = path.join(dirPath, 'img2.png');
            img3Path = path.join(dirPath, 'img3.png');
            fs.writeFileSync(img2Path, "i'm not really a png ;D");
            fs.writeFileSync(img3Path, "neither am i ;D");
            return fs.writeFileSync(filePath, "![img1](" + img1Path + ")\n![img2](" + img2Path + ")\n![img3](" + img3Path + ")");
          });
          waitsForPromise(function() {
            return atom.workspace.open(filePath);
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          expectPreviewInSplitPane();
          getImageElementsURL = function() {
            return [preview.find("img[alt=img1]").attr('src'), preview.find("img[alt=img2]").attr('src'), preview.find("img[alt=img3]").attr('src')];
          };
          expectQueryValues = function(queryValues) {
            var ref5;
            ref5 = getImageElementsURL(), img1URL = ref5[0], img2URL = ref5[1], img3URL = ref5[2];
            if (queryValues.img1 != null) {
              expect(img1URL).toStartWith(img1Path + "?v=");
              expect(img1URL).toBe(img1Path + "?v=" + queryValues.img1);
            }
            if (queryValues.img2 != null) {
              expect(img2URL).toStartWith(img2Path + "?v=");
              expect(img2URL).toBe(img2Path + "?v=" + queryValues.img2);
            }
            if (queryValues.img3 != null) {
              expect(img3URL).toStartWith(img3Path + "?v=");
              return expect(img3URL).toBe(img3Path + "?v=" + queryValues.img3);
            }
          };
          runs(function() {
            var ref5;
            ref5 = getImageElementsURL(), img1URL = ref5[0], img2URL = ref5[1], img3URL = ref5[2];
            img1Ver = getImageVersion(img1Path, img1URL);
            img2Ver = getImageVersion(img2Path, img2URL);
            img3Ver = getImageVersion(img3Path, img3URL);
            return fs.writeFileSync(img1Path, "still clearly not a png ;D");
          });
          waitsFor("img1 src attribute to update", function() {
            img1URL = preview.find("img[alt=img1]").attr('src');
            return !img1URL.endsWith(img1Ver);
          });
          runs(function() {
            var newImg1Ver;
            expectQueryValues({
              img2: img2Ver,
              img3: img3Ver
            });
            newImg1Ver = getImageVersion(img1Path, img1URL);
            expect(newImg1Ver).not.toEqual('deleted');
            expect(parseInt(newImg1Ver)).toBeGreaterThan(parseInt(img1Ver));
            img1Ver = newImg1Ver;
            return fs.writeFileSync(img2Path, "still clearly not a png either ;D");
          });
          waitsFor("img2 src attribute to update", function() {
            img2URL = preview.find("img[alt=img2]").attr('src');
            return !img2URL.endsWith(img2Ver);
          });
          runs(function() {
            var newImg2Ver;
            expectQueryValues({
              img1: img1Ver,
              img3: img3Ver
            });
            newImg2Ver = getImageVersion(img2Path, img2URL);
            expect(newImg2Ver).not.toEqual('deleted');
            expect(parseInt(newImg2Ver)).toBeGreaterThan(parseInt(img2Ver));
            img2Ver = newImg2Ver;
            return fs.writeFileSync(img3Path, "you better believe i'm not a png ;D");
          });
          waitsFor("img3 src attribute to update", function() {
            img3URL = preview.find("img[alt=img3]").attr('src');
            return !img3URL.endsWith(img3Ver);
          });
          return runs(function() {
            var newImg3Ver;
            expectQueryValues({
              img1: img1Ver,
              img2: img2Ver
            });
            newImg3Ver = getImageVersion(img3Path, img3URL);
            expect(newImg3Ver).not.toEqual('deleted');
            return expect(parseInt(newImg3Ver)).toBeGreaterThan(parseInt(img3Ver));
          });
        });
      });
      describe("when a previewed image is deleted then restored", function() {
        return it("removes the query timestamp and restores the timestamp after a rerender", function() {
          var imageURL, imageVer, ref2;
          ref2 = [], imageURL = ref2[0], imageVer = ref2[1];
          waitsForPromise(function() {
            return atom.workspace.open(filePath);
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          expectPreviewInSplitPane();
          runs(function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            imageVer = getImageVersion(img1Path, imageURL);
            expect(imageVer).not.toEqual('deleted');
            return fs.unlinkSync(img1Path);
          });
          waitsFor("image src attribute to update", function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            return !imageURL.endsWith(imageVer);
          });
          runs(function() {
            expect(imageURL).toBe(img1Path);
            fs.writeFileSync(img1Path, "clearly not a png but good enough for tests");
            return preview.renderMarkdown();
          });
          waitsFor("image src attribute to update", function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            return imageURL !== img1Path;
          });
          return runs(function() {
            var newImageVer;
            newImageVer = getImageVersion(img1Path, imageURL);
            return expect(parseInt(newImageVer)).toBeGreaterThan(parseInt(imageVer));
          });
        });
      });
      return describe("when a previewed image is renamed and then restored with its original name", function() {
        return it("removes the query timestamp and restores the timestamp after a rerender", function() {
          var imageURL, imageVer, ref2;
          ref2 = [], imageURL = ref2[0], imageVer = ref2[1];
          waitsForPromise(function() {
            return atom.workspace.open(filePath);
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          expectPreviewInSplitPane();
          runs(function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            imageVer = getImageVersion(img1Path, imageURL);
            expect(imageVer).not.toEqual('deleted');
            return fs.renameSync(img1Path, img1Path + "trol");
          });
          waitsFor("image src attribute to update", function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            return !imageURL.endsWith(imageVer);
          });
          runs(function() {
            expect(imageURL).toBe(img1Path);
            fs.renameSync(img1Path + "trol", img1Path);
            return preview.renderMarkdown();
          });
          waitsFor("image src attribute to update", function() {
            imageURL = preview.find("img[alt=img1]").attr('src');
            return imageURL !== img1Path;
          });
          return runs(function() {
            var newImageVer;
            newImageVer = getImageVersion(img1Path, imageURL);
            return expect(parseInt(newImageVer)).toBeGreaterThan(parseInt(imageVer));
          });
        });
      });
    });
    describe("gfm newlines", function() {
      describe("when gfm newlines are not enabled", function() {
        return it("creates a single paragraph with <br>", function() {
          atom.config.set('markdown-preview-plus.breakOnSingleNewline', false);
          waitsForPromise(function() {
            return preview.renderMarkdown();
          });
          return runs(function() {
            return expect(preview.find("p:last-child br").length).toBe(0);
          });
        });
      });
      return describe("when gfm newlines are enabled", function() {
        return it("creates a single paragraph with no <br>", function() {
          atom.config.set('markdown-preview-plus.breakOnSingleNewline', true);
          waitsForPromise(function() {
            return preview.renderMarkdown();
          });
          return runs(function() {
            return expect(preview.find("p:last-child br").length).toBe(1);
          });
        });
      });
    });
    describe("when core:save-as is triggered", function() {
      beforeEach(function() {
        preview.destroy();
        filePath = atom.project.getDirectories()[0].resolve('subdir/code-block.md');
        preview = new MarkdownPreviewView({
          filePath: filePath
        });
        return jasmine.attachToDOM(preview.element);
      });
      it("saves the rendered HTML and opens it", function() {
        var atomTextEditorStyles, createRule, expectedFilePath, expectedOutput, markdownPreviewStyles, openedPromise, outputPath, textEditor;
        outputPath = temp.path({
          suffix: '.html'
        });
        expectedFilePath = atom.project.getDirectories()[0].resolve('saved-html.html');
        expectedOutput = fs.readFileSync(expectedFilePath).toString();
        createRule = function(selector, css) {
          return {
            selectorText: selector,
            cssText: selector + " " + css
          };
        };
        markdownPreviewStyles = [
          {
            rules: [createRule(".markdown-preview", "{ color: orange; }")]
          }, {
            rules: [createRule(".not-included", "{ color: green; }"), createRule(".markdown-preview :host", "{ color: purple; }")]
          }
        ];
        atomTextEditorStyles = ["atom-text-editor .line { color: brown; }\natom-text-editor .number { color: cyan; }", "atom-text-editor :host .something { color: black; }", "atom-text-editor .hr { background: url(atom://markdown-preview-plus/assets/hr.png); }"];
        expect(fs.isFileSync(outputPath)).toBe(false);
        waitsForPromise("renderMarkdown", function() {
          return preview.renderMarkdown();
        });
        textEditor = null;
        openedPromise = new Promise(function(resolve) {
          return atom.workspace.onDidAddTextEditor(function(event) {
            textEditor = event.textEditor;
            return resolve();
          });
        });
        runs(function() {
          spyOn(atom, 'showSaveDialogSync').andReturn(outputPath);
          spyOn(preview, 'getDocumentStyleSheets').andReturn(markdownPreviewStyles);
          spyOn(preview, 'getTextEditorStyles').andReturn(atomTextEditorStyles);
          return atom.commands.dispatch(preview.element, 'core:save-as');
        });
        waitsForPromise("text editor opened", function() {
          return openedPromise;
        });
        return runs(function() {
          var savedHTML;
          expect(fs.isFileSync(outputPath)).toBe(true);
          expect(fs.realpathSync(textEditor.getPath())).toBe(fs.realpathSync(outputPath));
          savedHTML = textEditor.getText().replace(/<body class='markdown-preview'><div>/, '<body class=\'markdown-preview\'>').replace(/\n<\/div><\/body>/, '</body>');
          return expect(savedHTML).toBe(expectedOutput.replace(/\r\n/g, '\n'));
        });
      });
      return describe("text editor style extraction", function() {
        var extractedStyles, textEditorStyle, unrelatedStyle;
        extractedStyles = [][0];
        textEditorStyle = ".editor-style .extraction-test { color: blue; }";
        unrelatedStyle = ".something else { color: red; }";
        beforeEach(function() {
          atom.styles.addStyleSheet(textEditorStyle, {
            context: 'atom-text-editor'
          });
          atom.styles.addStyleSheet(unrelatedStyle, {
            context: 'unrelated-context'
          });
          return extractedStyles = preview.getTextEditorStyles();
        });
        it("returns an array containing atom-text-editor css style strings", function() {
          return expect(extractedStyles.indexOf(textEditorStyle)).toBeGreaterThan(-1);
        });
        return it("does not return other styles", function() {
          return expect(extractedStyles.indexOf(unrelatedStyle)).toBe(-1);
        });
      });
    });
    describe("when core:copy is triggered", function() {
      return it("writes the rendered HTML to the clipboard", function() {
        preview.destroy();
        preview.element.remove();
        filePath = atom.project.getDirectories()[0].resolve('subdir/code-block.md');
        preview = new MarkdownPreviewView({
          filePath: filePath
        });
        jasmine.attachToDOM(preview.element);
        waitsForPromise(function() {
          return preview.renderMarkdown();
        });
        runs(function() {
          return atom.commands.dispatch(preview.element, 'core:copy');
        });
        waitsFor(function() {
          return atom.clipboard.read() !== "initial clipboard content";
        });
        return runs(function() {
          return expect(atom.clipboard.read()).toBe("<h1>Code Block</h1>\n<pre class=\"editor-colors lang-javascript\"><div class=\"line\"><span class=\"syntax--source syntax--js\"><span class=\"syntax--keyword syntax--control syntax--js\"><span>if</span></span><span>&nbsp;a&nbsp;</span><span class=\"syntax--keyword syntax--operator syntax--comparison syntax--js\"><span>===</span></span><span>&nbsp;</span><span class=\"syntax--constant syntax--numeric syntax--decimal syntax--js\"><span>3</span></span><span>&nbsp;</span><span class=\"syntax--meta syntax--brace syntax--curly syntax--js\"><span>{</span></span></span>\n</div><div class=\"line\"><span class=\"syntax--source syntax--js\"><span>&nbsp;&nbsp;b&nbsp;</span><span class=\"syntax--keyword syntax--operator syntax--assignment syntax--js\"><span>=</span></span><span>&nbsp;</span><span class=\"syntax--constant syntax--numeric syntax--decimal syntax--js\"><span>5</span></span></span>\n</div><div class=\"line\"><span class=\"syntax--source syntax--js\"><span class=\"syntax--meta syntax--brace syntax--curly syntax--js\"><span>}</span></span></span>\n</div></pre>\n<p>encoding → issue</p>");
        });
      });
    });
    return describe("when maths rendering is enabled by default", function() {
      return it("notifies the user MathJax is loading when first preview is opened", function() {
        var workspaceElement;
        workspaceElement = [][0];
        preview.destroy();
        waitsForPromise(function() {
          return atom.packages.activatePackage('notifications');
        });
        runs(function() {
          workspaceElement = atom.views.getView(atom.workspace);
          return jasmine.attachToDOM(workspaceElement);
        });
        waitsForPromise(function() {
          return atom.workspace.open(filePath);
        });
        runs(function() {
          mathjaxHelper.resetMathJax();
          atom.config.set('markdown-preview-plus.enableLatexRenderingByDefault', true);
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        waitsFor("notification", function() {
          return workspaceElement.querySelector('atom-notification');
        });
        return runs(function() {
          var notification;
          notification = workspaceElement.querySelector('atom-notification.info');
          return expect(notification).toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxtQkFBQSxHQUFzQixPQUFBLENBQVEsOEJBQVI7O0VBQ3RCLFVBQUEsR0FBYSxPQUFBLENBQVEsMkJBQVI7O0VBQ2IsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVI7O0VBQ2hCLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVI7O0VBRWQsT0FBQSxDQUFRLGVBQVI7O0VBRUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7QUFDOUIsUUFBQTtJQUFBLE1BQXNCLEVBQXRCLEVBQUMsaUJBQUQsRUFBVztJQUVYLFVBQUEsQ0FBVyxTQUFBO01BQ1QsT0FBQSxHQUFVLFFBQUEsR0FBVztNQUNyQixlQUFBLENBQWdCLFNBQUE7ZUFDZCxPQUFPLENBQUMsR0FBUixDQUFZLENBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCLENBRFUsRUFFVixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLENBRlUsQ0FBWjtNQURjLENBQWhCO01BTUEsUUFBQSxDQUFTLFNBQUE7ZUFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGFBQWxDLENBQUEsS0FBc0Q7TUFEL0MsQ0FBVDtNQUdBLFFBQUEsQ0FBUyxTQUFBO2VBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxXQUFsQyxDQUFBLEtBQW9EO01BRDdD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QTtRQUZHLENBQUw7TUF2QnNFLENBQXhFO0lBRHFELENBQXZEO0VBOWtCOEIsQ0FBaEM7QUFYQSIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xudGVtcCA9IHJlcXVpcmUgJ3RlbXAnXG5NYXJrZG93blByZXZpZXdWaWV3ID0gcmVxdWlyZSAnLi4vbGliL21hcmtkb3duLXByZXZpZXctdmlldydcbm1hcmtkb3duSXQgPSByZXF1aXJlICcuLi9saWIvbWFya2Rvd24taXQtaGVscGVyJ1xubWF0aGpheEhlbHBlciA9IHJlcXVpcmUgJy4uL2xpYi9tYXRoamF4LWhlbHBlcidcbnVybCA9IHJlcXVpcmUgJ3VybCdcbnF1ZXJ5U3RyaW5nID0gcmVxdWlyZSAncXVlcnlzdHJpbmcnXG5cbnJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbmRlc2NyaWJlIFwiTWFya2Rvd25QcmV2aWV3Vmlld1wiLCAtPlxuICBbZmlsZVBhdGgsIHByZXZpZXddID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgcHJldmlldyA9IGZpbGVQYXRoID0gbnVsbFxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgUHJvbWlzZS5hbGwgW1xuICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtcnVieScpXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1qYXZhc2NyaXB0JylcbiAgICAgIF1cblxuICAgIHdhaXRzRm9yIC0+XG4gICAgICBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5ydWJ5JykgaXNudCB1bmRlZmluZWRcblxuICAgIHdhaXRzRm9yIC0+XG4gICAgICBhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoJ3NvdXJjZS5qcycpIGlzbnQgdW5kZWZpbmVkXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKVxuXG4gICAgcnVucyAtPlxuICAgICAgZmlsZVBhdGggPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvZmlsZS5tYXJrZG93bicpXG4gICAgICBwcmV2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe2ZpbGVQYXRofSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00ocHJldmlldy5lbGVtZW50KVxuXG4gICAgICB0aGlzLmFkZE1hdGNoZXJzXG4gICAgICAgIHRvU3RhcnRXaXRoOiAoZXhwZWN0ZWQpIC0+XG4gICAgICAgICAgdGhpcy5hY3R1YWwuc2xpY2UoMCwgZXhwZWN0ZWQubGVuZ3RoKSBpcyBleHBlY3RlZFxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lID0gLT5cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0UGFuZXMoKS5sZW5ndGggaXMgMlxuXG4gICAgd2FpdHNGb3IgXCJtYXJrZG93biBwcmV2aWV3IHRvIGJlIGNyZWF0ZWRcIiwgLT5cbiAgICAgIHByZXZpZXcgPSBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRQYW5lcygpWzFdLmdldEFjdGl2ZUl0ZW0oKVxuXG4gICAgcnVucyAtPlxuICAgICAgZXhwZWN0KHByZXZpZXcpLnRvQmVJbnN0YW5jZU9mKE1hcmtkb3duUHJldmlld1ZpZXcpXG4gICAgICBleHBlY3QocHJldmlldy5nZXRQYXRoKCkpLnRvQmUgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKS5nZXRQYXRoKClcblxuICBkZXNjcmliZSBcIjo6Y29uc3RydWN0b3JcIiwgLT5cbiAgICAjIExvYWRpbmcgc3Bpbm5lciBkaXNhYmxlZCB3aGVuIERPTSB1cGRhdGUgYnkgZGlmZiB3YXMgaW50cm9kdWNlZC4gSWZcbiAgICAjIHNwaW5uZXIgY29kZSBpbiBgbGliL21hcmtkb3duLXByZXZpZXctdmlld2AgaXMgcmVtb3ZlZCBjb21wbGV0bHkgdGhpc1xuICAgICMgc3BlYyBzaG91bGQgYWxzbyBiZSByZW1vdmVkXG4gICAgI1xuICAgICMgaXQgXCJzaG93cyBhIGxvYWRpbmcgc3Bpbm5lciBhbmQgcmVuZGVycyB0aGUgbWFya2Rvd25cIiwgLT5cbiAgICAjICAgcHJldmlldy5zaG93TG9hZGluZygpXG4gICAgIyAgIGV4cGVjdChwcmV2aWV3LmZpbmQoJy5tYXJrZG93bi1zcGlubmVyJykpLnRvRXhpc3QoKVxuICAgICNcbiAgICAjICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgIyAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG4gICAgI1xuICAgICMgICBydW5zIC0+XG4gICAgIyAgICAgZXhwZWN0KHByZXZpZXcuZmluZChcIi5lbW9qaVwiKSkudG9FeGlzdCgpXG5cbiAgICBpdCBcInNob3dzIGFuIGVycm9yIG1lc3NhZ2Ugd2hlbiB0aGVyZSBpcyBhbiBlcnJvclwiLCAtPlxuICAgICAgcHJldmlldy5zaG93RXJyb3IoXCJOb3QgYSByZWFsIGZpbGVcIilcbiAgICAgIGV4cGVjdChwcmV2aWV3LnRleHQoKSkudG9Db250YWluIFwiRmFpbGVkXCJcblxuICBkZXNjcmliZSBcInNlcmlhbGl6YXRpb25cIiwgLT5cbiAgICBuZXdQcmV2aWV3ID0gbnVsbFxuXG4gICAgYWZ0ZXJFYWNoIC0+XG4gICAgICBuZXdQcmV2aWV3Py5kZXN0cm95KClcblxuICAgIGl0IFwicmVjcmVhdGVzIHRoZSBwcmV2aWV3IHdoZW4gc2VyaWFsaXplZC9kZXNlcmlhbGl6ZWRcIiwgLT5cbiAgICAgIG5ld1ByZXZpZXcgPSBhdG9tLmRlc2VyaWFsaXplcnMuZGVzZXJpYWxpemUocHJldmlldy5zZXJpYWxpemUoKSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00obmV3UHJldmlldy5lbGVtZW50KVxuICAgICAgZXhwZWN0KG5ld1ByZXZpZXcuZ2V0UGF0aCgpKS50b0JlIHByZXZpZXcuZ2V0UGF0aCgpXG5cbiAgICBpdCBcImRvZXMgbm90IHJlY3JlYXRlIGEgcHJldmlldyB3aGVuIHRoZSBmaWxlIG5vIGxvbmdlciBleGlzdHNcIiwgLT5cbiAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHRlbXAubWtkaXJTeW5jKCdtYXJrZG93bi1wcmV2aWV3LScpLCAnZm9vLm1kJylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsICcjIEhpJylcblxuICAgICAgbmV3UHJldmlldyA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHtmaWxlUGF0aH0pXG4gICAgICBzZXJpYWxpemVkID0gbmV3UHJldmlldy5zZXJpYWxpemUoKVxuICAgICAgZnMucmVtb3ZlU3luYyhmaWxlUGF0aClcblxuICAgICAgbmV3UHJldmlldyA9IGF0b20uZGVzZXJpYWxpemVycy5kZXNlcmlhbGl6ZShzZXJpYWxpemVkKVxuICAgICAgZXhwZWN0KG5ld1ByZXZpZXcpLnRvQmVVbmRlZmluZWQoKVxuXG4gICAgaXQgXCJzZXJpYWxpemVzIHRoZSBlZGl0b3IgaWQgd2hlbiBvcGVuZWQgZm9yIGFuIGVkaXRvclwiLCAtPlxuICAgICAgcHJldmlldy5kZXN0cm95KClcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ25ldy5tYXJrZG93bicpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgcHJldmlldyA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHtlZGl0b3JJZDogYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmlkfSlcblxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHByZXZpZXcuZWxlbWVudClcbiAgICAgICAgZXhwZWN0KHByZXZpZXcuZ2V0UGF0aCgpKS50b0JlIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKS5nZXRQYXRoKClcblxuICAgICAgICBuZXdQcmV2aWV3ID0gYXRvbS5kZXNlcmlhbGl6ZXJzLmRlc2VyaWFsaXplKHByZXZpZXcuc2VyaWFsaXplKCkpXG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00obmV3UHJldmlldy5lbGVtZW50KVxuICAgICAgICBleHBlY3QobmV3UHJldmlldy5nZXRQYXRoKCkpLnRvQmUgcHJldmlldy5nZXRQYXRoKClcblxuICBkZXNjcmliZSBcImhlYWRlciByZW5kZXJpbmdcIiwgLT5cblxuICAgIGl0IFwic2hvdWxkIHJlbmRlciBoZWFkaW5ncyB3aXRoIGFuZCB3aXRob3V0IHNwYWNlXCIsIC0+XG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBoZWFkbGluZXMgPSBwcmV2aWV3LmZpbmQoJ2gyJylcbiAgICAgICAgZXhwZWN0KGhlYWRsaW5lcykudG9FeGlzdCgpXG4gICAgICAgIGV4cGVjdChoZWFkbGluZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgIGV4cGVjdChoZWFkbGluZXNbMF0ub3V0ZXJIVE1MKS50b0JlKFwiPGgyPkxldmVsIHR3byBoZWFkZXIgd2l0aG91dCBzcGFjZTwvaDI+XCIpXG4gICAgICAgIGV4cGVjdChoZWFkbGluZXNbMV0ub3V0ZXJIVE1MKS50b0JlKFwiPGgyPkxldmVsIHR3byBoZWFkZXIgd2l0aCBzcGFjZTwvaDI+XCIpXG5cbiAgICBpdCBcInNob3VsZCByZW5kZXIgaGVhZGluZ3Mgd2l0aCBhbmQgd2l0aG91dCBzcGFjZVwiLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlTGF6eUhlYWRlcnMnLCBmYWxzZVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgaGVhZGxpbmVzID0gcHJldmlldy5maW5kKCdoMicpXG4gICAgICAgIGV4cGVjdChoZWFkbGluZXMpLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QoaGVhZGxpbmVzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3QoaGVhZGxpbmVzWzBdLm91dGVySFRNTCkudG9CZShcIjxoMj5MZXZlbCB0d28gaGVhZGVyIHdpdGggc3BhY2U8L2gyPlwiKVxuXG5cbiAgZGVzY3JpYmUgXCJjb2RlIGJsb2NrIGNvbnZlcnNpb24gdG8gYXRvbS10ZXh0LWVkaXRvciB0YWdzXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgaXQgXCJyZW1vdmVzIGxpbmUgZGVjb3JhdGlvbnMgb24gcmVuZGVyZWQgY29kZSBibG9ja3NcIiwgLT5cbiAgICAgIGVkaXRvciA9IHByZXZpZXcuZmluZChcImF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPSd0ZXh0IHBsYWluIG51bGwtZ3JhbW1hciddXCIpXG4gICAgICBkZWNvcmF0aW9ucyA9IGVkaXRvclswXS5nZXRNb2RlbCgpLmdldERlY29yYXRpb25zKGNsYXNzOiAnY3Vyc29yLWxpbmUnLCB0eXBlOiAnbGluZScpXG4gICAgICBleHBlY3QoZGVjb3JhdGlvbnMubGVuZ3RoKS50b0JlIDBcblxuICAgIGl0IFwicmVtb3ZlcyBhIHRyYWlsaW5nIG5ld2xpbmUgYnV0IHByZXNlcnZlcyByZW1haW5pbmcgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVwiLCAtPlxuICAgICAgbmV3RmlsZVBhdGggPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvdHJpbS1ubC5tZCcpXG4gICAgICBuZXdQcmV2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe2ZpbGVQYXRoOiBuZXdGaWxlUGF0aH0pXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKG5ld1ByZXZpZXcuZWxlbWVudClcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIG5ld1ByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IG5ld1ByZXZpZXcuZmluZChcImF0b20tdGV4dC1lZGl0b3JcIilcbiAgICAgICAgZXhwZWN0KGVkaXRvcikudG9FeGlzdCgpXG4gICAgICAgIGV4cGVjdChlZGl0b3JbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KCkpLnRvQmUgXCJcIlwiXG5cbiAgICAgICAgICAgICAgIGFcbiAgICAgICAgICAgICAgYlxuICAgICAgICAgICAgIGNcbiAgICAgICAgICAgIGRcbiAgICAgICAgICAgZVxuICAgICAgICAgIGZcblxuICAgICAgICBcIlwiXCJcblxuICAgICAgcnVucyAtPlxuICAgICAgICBuZXdQcmV2aWV3LmRlc3Ryb3koKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBjb2RlIGJsb2NrJ3MgZmVuY2UgbmFtZSBoYXMgYSBtYXRjaGluZyBncmFtbWFyXCIsIC0+XG4gICAgICBpdCBcImFzc2lnbnMgdGhlIGdyYW1tYXIgb24gdGhlIGF0b20tdGV4dC1lZGl0b3JcIiwgLT5cbiAgICAgICAgcnVieUVkaXRvciA9IHByZXZpZXcuZmluZChcImF0b20tdGV4dC1lZGl0b3JbZGF0YS1ncmFtbWFyPSdzb3VyY2UgcnVieSddXCIpXG4gICAgICAgIGV4cGVjdChydWJ5RWRpdG9yKS50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KHJ1YnlFZGl0b3JbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KCkpLnRvQmUgXCJcIlwiXG4gICAgICAgICAgZGVmIGZ1bmNcbiAgICAgICAgICAgIHggPSAxXG4gICAgICAgICAgZW5kXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICAgICMgbmVzdGVkIGluIGEgbGlzdCBpdGVtXG4gICAgICAgIGpzRWRpdG9yID0gcHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9J3NvdXJjZSBqcyddXCIpXG4gICAgICAgIGV4cGVjdChqc0VkaXRvcikudG9FeGlzdCgpXG4gICAgICAgIGV4cGVjdChqc0VkaXRvclswXS5nZXRNb2RlbCgpLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgICAgICBpZiBhID09PSAzIHtcbiAgICAgICAgICAgIGIgPSA1XG4gICAgICAgICAgfVxuICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY29kZSBibG9jaydzIGZlbmNlIG5hbWUgZG9lc24ndCBoYXZlIGEgbWF0Y2hpbmcgZ3JhbW1hclwiLCAtPlxuICAgICAgaXQgXCJkb2VzIG5vdCBhc3NpZ24gYSBzcGVjaWZpYyBncmFtbWFyXCIsIC0+XG4gICAgICAgIHBsYWluRWRpdG9yID0gcHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9J3RleHQgcGxhaW4gbnVsbC1ncmFtbWFyJ11cIilcbiAgICAgICAgZXhwZWN0KHBsYWluRWRpdG9yKS50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KHBsYWluRWRpdG9yWzBdLmdldE1vZGVsKCkuZ2V0VGV4dCgpKS50b0JlIFwiXCJcIlxuICAgICAgICAgIGZ1bmN0aW9uIGYoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHgrKztcbiAgICAgICAgICB9XG4gICAgICAgIFwiXCJcIlxuXG4gIGRlc2NyaWJlIFwiaW1hZ2UgcmVzb2x2aW5nXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc3B5T24obWFya2Rvd25JdCwgJ2RlY29kZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgaW1hZ2UgdXNlcyBhIHJlbGF0aXZlIHBhdGhcIiwgLT5cbiAgICAgIGl0IFwicmVzb2x2ZXMgdG8gYSBwYXRoIHJlbGF0aXZlIHRvIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIGltYWdlID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1JbWFnZTFdXCIpXG4gICAgICAgIGV4cGVjdChtYXJrZG93bkl0LmRlY29kZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChpbWFnZS5hdHRyKCdzcmMnKSkudG9TdGFydFdpdGggYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgnc3ViZGlyL2ltYWdlMS5wbmcnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbWFnZSB1c2VzIGFuIGFic29sdXRlIHBhdGggdGhhdCBkb2VzIG5vdCBleGlzdFwiLCAtPlxuICAgICAgaXQgXCJyZXNvbHZlcyB0byBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIHByb2plY3Qgcm9vdFwiLCAtPlxuICAgICAgICBpbWFnZSA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9SW1hZ2UyXVwiKVxuICAgICAgICBleHBlY3QobWFya2Rvd25JdC5kZWNvZGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoaW1hZ2UuYXR0cignc3JjJykpLnRvU3RhcnRXaXRoIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3RtcC9pbWFnZTIucG5nJylcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgaW1hZ2UgdXNlcyBhbiBhYnNvbHV0ZSBwYXRoIHRoYXQgZXhpc3RzXCIsIC0+XG4gICAgICBpdCBcImFkZHMgYSBxdWVyeSB0byB0aGUgVVJMXCIsIC0+XG4gICAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4odGVtcC5ta2RpclN5bmMoJ2F0b20nKSwgJ2Zvby5tZCcpXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIFwiIVthYnNvbHV0ZV0oI3tmaWxlUGF0aH0pXCIpXG4gICAgICAgIHByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGh9KVxuICAgICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHByZXZpZXcuZWxlbWVudClcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QocHJldmlldy5maW5kKFwiaW1nW2FsdD1hYnNvbHV0ZV1cIikuYXR0cignc3JjJykpLnRvU3RhcnRXaXRoIFwiI3tmaWxlUGF0aH0/dj1cIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbWFnZSB1c2VzIGEgVVJMXCIsIC0+XG4gICAgICBpdCBcImRvZXNuJ3QgY2hhbmdlIHRoZSB3ZWIgVVJMXCIsIC0+XG4gICAgICAgIGltYWdlID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1JbWFnZTNdXCIpXG4gICAgICAgIGV4cGVjdChtYXJrZG93bkl0LmRlY29kZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChpbWFnZS5hdHRyKCdzcmMnKSkudG9CZSAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0dhbGFkaXJpdGgvbWFya2Rvd24tcHJldmlldy1wbHVzL21hc3Rlci9hc3NldHMvaHIucG5nJ1xuXG4gICAgICBpdCBcImRvZXNuJ3QgY2hhbmdlIHRoZSBkYXRhIFVSTFwiLCAtPlxuICAgICAgICBpbWFnZSA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9SW1hZ2U0XVwiKVxuICAgICAgICBleHBlY3QobWFya2Rvd25JdC5kZWNvZGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICBleHBlY3QoaW1hZ2UuYXR0cignc3JjJykpLnRvQmUgJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEVBQVFBTVFBQU9SSEhPVlNLdWRmT3VsclNPcDNXT3lEWnU2UWR2Q2NoUEdvbGZPMG8vWEJzL2ZOd2ZqWjBmcmwzL3p5Ny8vLy93QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQ0g1QkFrQUFCQUFMQUFBQUFBUUFCQUFBQVZWSUNTT1pHbENRQW9zSjZtdTdmaXlaZUtxTktUb1FHRHNNOGhCQURnVVhvR0FpcWhTdnA1UUFuUUtHSWdVaHdGVVlMQ1ZERkNyS1VFMWxCYXZBVmlGSURsVEltYktDNUdtMmhCMFNsQkNCTVFpQjBVaklRQTcnXG5cbiAgZGVzY3JpYmUgXCJpbWFnZSBtb2RpZmljYXRpb25cIiwgLT5cbiAgICBbZGlyUGF0aCwgZmlsZVBhdGgsIGltZzFQYXRoLCB3b3Jrc3BhY2VFbGVtZW50XSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuXG4gICAgICBqYXNtaW5lLnVzZVJlYWxDbG9jaygpXG5cbiAgICAgIGRpclBhdGggICA9IHRlbXAubWtkaXJTeW5jKCdhdG9tJylcbiAgICAgIGZpbGVQYXRoICA9IHBhdGguam9pbiBkaXJQYXRoLCAnaW1hZ2UtbW9kaWZpY2F0aW9uLm1kJ1xuICAgICAgaW1nMVBhdGggID0gcGF0aC5qb2luIGRpclBhdGgsICdpbWcxLnBuZydcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgXCIhW2ltZzFdKCN7aW1nMVBhdGh9KVwiXG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGltZzFQYXRoLCBcImNsZWFybHkgbm90IGEgcG5nIGJ1dCBnb29kIGVub3VnaCBmb3IgdGVzdHNcIlxuXG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgZ2V0SW1hZ2VWZXJzaW9uID0gKGltYWdlUGF0aCwgaW1hZ2VVUkwpIC0+XG4gICAgICBleHBlY3QoaW1hZ2VVUkwpLnRvU3RhcnRXaXRoIFwiI3tpbWFnZVBhdGh9P3Y9XCJcbiAgICAgIHVybFF1ZXJ5U3RyID0gdXJsLnBhcnNlKGltYWdlVVJMKS5xdWVyeVxuICAgICAgdXJsUXVlcnkgICAgPSBxdWVyeVN0cmluZy5wYXJzZSh1cmxRdWVyeVN0cilcbiAgICAgIHVybFF1ZXJ5LnZcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhIGxvY2FsIGltYWdlIGlzIHByZXZpZXdlZFwiLCAtPlxuICAgICAgaXQgXCJhZGRzIGEgdGltZXN0YW1wIHF1ZXJ5IHRvIHRoZSBVUkxcIiwgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltYWdlVVJMKVxuICAgICAgICAgIGV4cGVjdChpbWFnZVZlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgbG9jYWwgaW1hZ2UgaXMgbW9kaWZpZWQgZHVyaW5nIGEgcHJldmlldyAjbm90d2VyY2tlclwiLCAtPlxuICAgICAgaXQgXCJyZXJlbmRlcnMgdGhlIGltYWdlIHdpdGggYSBtb3JlIHJlY2VudCB0aW1lc3RhbXAgcXVlcnlcIiwgLT5cbiAgICAgICAgW2ltYWdlVVJMLCBpbWFnZVZlcl0gPSBbXVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG4gICAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGltYWdlVVJMID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcxXVwiKS5hdHRyKCdzcmMnKVxuICAgICAgICAgIGltYWdlVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzFQYXRoLCBpbWFnZVVSTClcbiAgICAgICAgICBleHBlY3QoaW1hZ2VWZXIpLm5vdC50b0VxdWFsKCdkZWxldGVkJylcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgaW1nMVBhdGgsIFwic3RpbGwgY2xlYXJseSBub3QgYSBwbmcgO0RcIlxuXG4gICAgICAgIHdhaXRzRm9yIFwiaW1hZ2Ugc3JjIGF0dHJpYnV0ZSB0byB1cGRhdGVcIiwgLT5cbiAgICAgICAgICBpbWFnZVVSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMV1cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1hZ2VVUkwuZW5kc1dpdGggaW1hZ2VWZXJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgbmV3SW1hZ2VWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltYWdlVVJMKVxuICAgICAgICAgIGV4cGVjdChuZXdJbWFnZVZlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuICAgICAgICAgIGV4cGVjdChwYXJzZUludChuZXdJbWFnZVZlcikpLnRvQmVHcmVhdGVyVGhhbihwYXJzZUludChpbWFnZVZlcikpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhyZWUgaW1hZ2VzIGFyZSBwcmV2aWV3ZWQgYW5kIGFsbCBhcmUgbW9kaWZpZWQgI25vdHdlcmNrZXJcIiwgLT5cbiAgICAgIGl0IFwicmVyZW5kZXJzIHRoZSBpbWFnZXMgd2l0aCBhIG1vcmUgcmVjZW50IHRpbWVzdGFtcCBhcyB0aGV5IGFyZSBtb2RpZmllZFwiLCAtPlxuICAgICAgICBbaW1nMlBhdGgsIGltZzNQYXRoXSA9IFtdXG4gICAgICAgIFtpbWcxVmVyLCBpbWcyVmVyLCBpbWczVmVyXSA9IFtdXG4gICAgICAgIFtpbWcxVVJMLCBpbWcyVVJMLCBpbWczVVJMXSA9IFtdXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgICAgICAgICBpbWcyUGF0aCAgPSBwYXRoLmpvaW4gZGlyUGF0aCwgJ2ltZzIucG5nJ1xuICAgICAgICAgIGltZzNQYXRoICA9IHBhdGguam9pbiBkaXJQYXRoLCAnaW1nMy5wbmcnXG5cbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGltZzJQYXRoLCBcImknbSBub3QgcmVhbGx5IGEgcG5nIDtEXCJcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGltZzNQYXRoLCBcIm5laXRoZXIgYW0gaSA7RFwiXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgXCJcIlwiXG4gICAgICAgICAgICAhW2ltZzFdKCN7aW1nMVBhdGh9KVxuICAgICAgICAgICAgIVtpbWcyXSgje2ltZzJQYXRofSlcbiAgICAgICAgICAgICFbaW1nM10oI3tpbWczUGF0aH0pXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgICBnZXRJbWFnZUVsZW1lbnRzVVJMID0gLT5cbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcxXVwiKS5hdHRyKCdzcmMnKSxcbiAgICAgICAgICAgIHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMl1cIikuYXR0cignc3JjJyksXG4gICAgICAgICAgICBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzNdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgXVxuXG4gICAgICAgIGV4cGVjdFF1ZXJ5VmFsdWVzID0gKHF1ZXJ5VmFsdWVzKSAtPlxuICAgICAgICAgIFtpbWcxVVJMLCBpbWcyVVJMLCBpbWczVVJMXSA9IGdldEltYWdlRWxlbWVudHNVUkwoKVxuICAgICAgICAgIGlmIHF1ZXJ5VmFsdWVzLmltZzE/XG4gICAgICAgICAgICBleHBlY3QoaW1nMVVSTCkudG9TdGFydFdpdGggXCIje2ltZzFQYXRofT92PVwiXG4gICAgICAgICAgICBleHBlY3QoaW1nMVVSTCkudG9CZSBcIiN7aW1nMVBhdGh9P3Y9I3txdWVyeVZhbHVlcy5pbWcxfVwiXG4gICAgICAgICAgaWYgcXVlcnlWYWx1ZXMuaW1nMj9cbiAgICAgICAgICAgIGV4cGVjdChpbWcyVVJMKS50b1N0YXJ0V2l0aCBcIiN7aW1nMlBhdGh9P3Y9XCJcbiAgICAgICAgICAgIGV4cGVjdChpbWcyVVJMKS50b0JlIFwiI3tpbWcyUGF0aH0/dj0je3F1ZXJ5VmFsdWVzLmltZzJ9XCJcbiAgICAgICAgICBpZiBxdWVyeVZhbHVlcy5pbWczP1xuICAgICAgICAgICAgZXhwZWN0KGltZzNVUkwpLnRvU3RhcnRXaXRoIFwiI3tpbWczUGF0aH0/dj1cIlxuICAgICAgICAgICAgZXhwZWN0KGltZzNVUkwpLnRvQmUgXCIje2ltZzNQYXRofT92PSN7cXVlcnlWYWx1ZXMuaW1nM31cIlxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBbaW1nMVVSTCwgaW1nMlVSTCwgaW1nM1VSTF0gPSBnZXRJbWFnZUVsZW1lbnRzVVJMKClcblxuICAgICAgICAgIGltZzFWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltZzFVUkwpXG4gICAgICAgICAgaW1nMlZlciA9IGdldEltYWdlVmVyc2lvbihpbWcyUGF0aCwgaW1nMlVSTClcbiAgICAgICAgICBpbWczVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzNQYXRoLCBpbWczVVJMKVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBpbWcxUGF0aCwgXCJzdGlsbCBjbGVhcmx5IG5vdCBhIHBuZyA7RFwiXG5cbiAgICAgICAgd2FpdHNGb3IgXCJpbWcxIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1nMVVSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMV1cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1nMVVSTC5lbmRzV2l0aCBpbWcxVmVyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdFF1ZXJ5VmFsdWVzXG4gICAgICAgICAgICBpbWcyOiBpbWcyVmVyXG4gICAgICAgICAgICBpbWczOiBpbWczVmVyXG5cbiAgICAgICAgICBuZXdJbWcxVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzFQYXRoLCBpbWcxVVJMKVxuICAgICAgICAgIGV4cGVjdChuZXdJbWcxVmVyKS5ub3QudG9FcXVhbCgnZGVsZXRlZCcpXG4gICAgICAgICAgZXhwZWN0KHBhcnNlSW50KG5ld0ltZzFWZXIpKS50b0JlR3JlYXRlclRoYW4ocGFyc2VJbnQoaW1nMVZlcikpXG4gICAgICAgICAgaW1nMVZlciA9IG5ld0ltZzFWZXJcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgaW1nMlBhdGgsIFwic3RpbGwgY2xlYXJseSBub3QgYSBwbmcgZWl0aGVyIDtEXCJcblxuICAgICAgICB3YWl0c0ZvciBcImltZzIgc3JjIGF0dHJpYnV0ZSB0byB1cGRhdGVcIiwgLT5cbiAgICAgICAgICBpbWcyVVJMID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcyXVwiKS5hdHRyKCdzcmMnKVxuICAgICAgICAgIG5vdCBpbWcyVVJMLmVuZHNXaXRoIGltZzJWZXJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0UXVlcnlWYWx1ZXNcbiAgICAgICAgICAgIGltZzE6IGltZzFWZXJcbiAgICAgICAgICAgIGltZzM6IGltZzNWZXJcblxuICAgICAgICAgIG5ld0ltZzJWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMlBhdGgsIGltZzJVUkwpXG4gICAgICAgICAgZXhwZWN0KG5ld0ltZzJWZXIpLm5vdC50b0VxdWFsKCdkZWxldGVkJylcbiAgICAgICAgICBleHBlY3QocGFyc2VJbnQobmV3SW1nMlZlcikpLnRvQmVHcmVhdGVyVGhhbihwYXJzZUludChpbWcyVmVyKSlcbiAgICAgICAgICBpbWcyVmVyID0gbmV3SW1nMlZlclxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBpbWczUGF0aCwgXCJ5b3UgYmV0dGVyIGJlbGlldmUgaSdtIG5vdCBhIHBuZyA7RFwiXG5cbiAgICAgICAgd2FpdHNGb3IgXCJpbWczIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1nM1VSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nM11cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1nM1VSTC5lbmRzV2l0aCBpbWczVmVyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdFF1ZXJ5VmFsdWVzXG4gICAgICAgICAgICBpbWcxOiBpbWcxVmVyXG4gICAgICAgICAgICBpbWcyOiBpbWcyVmVyXG5cbiAgICAgICAgICBuZXdJbWczVmVyICA9IGdldEltYWdlVmVyc2lvbihpbWczUGF0aCwgaW1nM1VSTClcbiAgICAgICAgICBleHBlY3QobmV3SW1nM1Zlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuICAgICAgICAgIGV4cGVjdChwYXJzZUludChuZXdJbWczVmVyKSkudG9CZUdyZWF0ZXJUaGFuKHBhcnNlSW50KGltZzNWZXIpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgcHJldmlld2VkIGltYWdlIGlzIGRlbGV0ZWQgdGhlbiByZXN0b3JlZFwiLCAtPlxuICAgICAgaXQgXCJyZW1vdmVzIHRoZSBxdWVyeSB0aW1lc3RhbXAgYW5kIHJlc3RvcmVzIHRoZSB0aW1lc3RhbXAgYWZ0ZXIgYSByZXJlbmRlclwiLCAtPlxuICAgICAgICBbaW1hZ2VVUkwsIGltYWdlVmVyXSA9IFtdXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltYWdlVVJMKVxuICAgICAgICAgIGV4cGVjdChpbWFnZVZlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuXG4gICAgICAgICAgZnMudW5saW5rU3luYyBpbWcxUGF0aFxuXG4gICAgICAgIHdhaXRzRm9yIFwiaW1hZ2Ugc3JjIGF0dHJpYnV0ZSB0byB1cGRhdGVcIiwgLT5cbiAgICAgICAgICBpbWFnZVVSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMV1cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1hZ2VVUkwuZW5kc1dpdGggaW1hZ2VWZXJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KGltYWdlVVJMKS50b0JlIGltZzFQYXRoXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBpbWcxUGF0aCwgXCJjbGVhcmx5IG5vdCBhIHBuZyBidXQgZ29vZCBlbm91Z2ggZm9yIHRlc3RzXCJcbiAgICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgICB3YWl0c0ZvciBcImltYWdlIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VVUkwgaXNudCBpbWcxUGF0aFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBuZXdJbWFnZVZlciA9IGdldEltYWdlVmVyc2lvbihpbWcxUGF0aCwgaW1hZ2VVUkwpXG4gICAgICAgICAgZXhwZWN0KHBhcnNlSW50KG5ld0ltYWdlVmVyKSkudG9CZUdyZWF0ZXJUaGFuKHBhcnNlSW50KGltYWdlVmVyKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhIHByZXZpZXdlZCBpbWFnZSBpcyByZW5hbWVkIGFuZCB0aGVuIHJlc3RvcmVkIHdpdGggaXRzIG9yaWdpbmFsIG5hbWVcIiwgLT5cbiAgICAgIGl0IFwicmVtb3ZlcyB0aGUgcXVlcnkgdGltZXN0YW1wIGFuZCByZXN0b3JlcyB0aGUgdGltZXN0YW1wIGFmdGVyIGEgcmVyZW5kZXJcIiwgLT5cbiAgICAgICAgW2ltYWdlVVJMLCBpbWFnZVZlcl0gPSBbXVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG4gICAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGltYWdlVVJMID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcxXVwiKS5hdHRyKCdzcmMnKVxuICAgICAgICAgIGltYWdlVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzFQYXRoLCBpbWFnZVVSTClcbiAgICAgICAgICBleHBlY3QoaW1hZ2VWZXIpLm5vdC50b0VxdWFsKCdkZWxldGVkJylcblxuICAgICAgICAgIGZzLnJlbmFtZVN5bmMgaW1nMVBhdGgsIGltZzFQYXRoICsgXCJ0cm9sXCJcblxuICAgICAgICB3YWl0c0ZvciBcImltYWdlIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgbm90IGltYWdlVVJMLmVuZHNXaXRoIGltYWdlVmVyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChpbWFnZVVSTCkudG9CZSBpbWcxUGF0aFxuICAgICAgICAgIGZzLnJlbmFtZVN5bmMgaW1nMVBhdGggKyBcInRyb2xcIiwgaW1nMVBhdGhcbiAgICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgICB3YWl0c0ZvciBcImltYWdlIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VVUkwgaXNudCBpbWcxUGF0aFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBuZXdJbWFnZVZlciA9IGdldEltYWdlVmVyc2lvbihpbWcxUGF0aCwgaW1hZ2VVUkwpXG4gICAgICAgICAgZXhwZWN0KHBhcnNlSW50KG5ld0ltYWdlVmVyKSkudG9CZUdyZWF0ZXJUaGFuKHBhcnNlSW50KGltYWdlVmVyKSlcblxuICBkZXNjcmliZSBcImdmbSBuZXdsaW5lc1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBnZm0gbmV3bGluZXMgYXJlIG5vdCBlbmFibGVkXCIsIC0+XG4gICAgICBpdCBcImNyZWF0ZXMgYSBzaW5nbGUgcGFyYWdyYXBoIHdpdGggPGJyPlwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsIGZhbHNlKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJldmlldy5maW5kKFwicDpsYXN0LWNoaWxkIGJyXCIpLmxlbmd0aCkudG9CZSAwXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZ2ZtIG5ld2xpbmVzIGFyZSBlbmFibGVkXCIsIC0+XG4gICAgICBpdCBcImNyZWF0ZXMgYSBzaW5nbGUgcGFyYWdyYXBoIHdpdGggbm8gPGJyPlwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcmV2aWV3LmZpbmQoXCJwOmxhc3QtY2hpbGQgYnJcIikubGVuZ3RoKS50b0JlIDFcblxuICBkZXNjcmliZSBcIndoZW4gY29yZTpzYXZlLWFzIGlzIHRyaWdnZXJlZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHByZXZpZXcuZGVzdHJveSgpXG4gICAgICBmaWxlUGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3N1YmRpci9jb2RlLWJsb2NrLm1kJylcbiAgICAgIHByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGh9KVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShwcmV2aWV3LmVsZW1lbnQpXG5cbiAgICBpdCBcInNhdmVzIHRoZSByZW5kZXJlZCBIVE1MIGFuZCBvcGVucyBpdFwiLCAtPlxuICAgICAgb3V0cHV0UGF0aCA9IHRlbXAucGF0aChzdWZmaXg6ICcuaHRtbCcpXG4gICAgICBleHBlY3RlZEZpbGVQYXRoID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgnc2F2ZWQtaHRtbC5odG1sJylcbiAgICAgIGV4cGVjdGVkT3V0cHV0ID0gZnMucmVhZEZpbGVTeW5jKGV4cGVjdGVkRmlsZVBhdGgpLnRvU3RyaW5nKClcblxuICAgICAgY3JlYXRlUnVsZSA9IChzZWxlY3RvciwgY3NzKSAtPlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNlbGVjdG9yVGV4dDogc2VsZWN0b3JcbiAgICAgICAgICBjc3NUZXh0OiBcIiN7c2VsZWN0b3J9ICN7Y3NzfVwiXG4gICAgICAgIH1cblxuICAgICAgbWFya2Rvd25QcmV2aWV3U3R5bGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIGNyZWF0ZVJ1bGUgXCIubWFya2Rvd24tcHJldmlld1wiLCBcInsgY29sb3I6IG9yYW5nZTsgfVwiXG4gICAgICAgICAgXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIGNyZWF0ZVJ1bGUgXCIubm90LWluY2x1ZGVkXCIsIFwieyBjb2xvcjogZ3JlZW47IH1cIlxuICAgICAgICAgICAgY3JlYXRlUnVsZSBcIi5tYXJrZG93bi1wcmV2aWV3IDpob3N0XCIsIFwieyBjb2xvcjogcHVycGxlOyB9XCJcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cblxuICAgICAgYXRvbVRleHRFZGl0b3JTdHlsZXMgPSBbXG4gICAgICAgIFwiYXRvbS10ZXh0LWVkaXRvciAubGluZSB7IGNvbG9yOiBicm93bjsgfVxcbmF0b20tdGV4dC1lZGl0b3IgLm51bWJlciB7IGNvbG9yOiBjeWFuOyB9XCJcbiAgICAgICAgXCJhdG9tLXRleHQtZWRpdG9yIDpob3N0IC5zb21ldGhpbmcgeyBjb2xvcjogYmxhY2s7IH1cIlxuICAgICAgICBcImF0b20tdGV4dC1lZGl0b3IgLmhyIHsgYmFja2dyb3VuZDogdXJsKGF0b206Ly9tYXJrZG93bi1wcmV2aWV3LXBsdXMvYXNzZXRzL2hyLnBuZyk7IH1cIlxuICAgICAgXVxuXG4gICAgICBleHBlY3QoZnMuaXNGaWxlU3luYyhvdXRwdXRQYXRoKSkudG9CZSBmYWxzZVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgXCJyZW5kZXJNYXJrZG93blwiLCAtPlxuICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgdGV4dEVkaXRvciA9IG51bGxcbiAgICAgIG9wZW5lZFByb21pc2UgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRUZXh0RWRpdG9yIChldmVudCkgLT5cbiAgICAgICAgICB0ZXh0RWRpdG9yID0gZXZlbnQudGV4dEVkaXRvclxuICAgICAgICAgIHJlc29sdmUoKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4ob3V0cHV0UGF0aClcbiAgICAgICAgc3B5T24ocHJldmlldywgJ2dldERvY3VtZW50U3R5bGVTaGVldHMnKS5hbmRSZXR1cm4obWFya2Rvd25QcmV2aWV3U3R5bGVzKVxuICAgICAgICBzcHlPbihwcmV2aWV3LCAnZ2V0VGV4dEVkaXRvclN0eWxlcycpLmFuZFJldHVybihhdG9tVGV4dEVkaXRvclN0eWxlcylcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCBwcmV2aWV3LmVsZW1lbnQsICdjb3JlOnNhdmUtYXMnXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSBcInRleHQgZWRpdG9yIG9wZW5lZFwiLCAtPlxuICAgICAgICBvcGVuZWRQcm9taXNlXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGZzLmlzRmlsZVN5bmMob3V0cHV0UGF0aCkpLnRvQmUgdHJ1ZVxuICAgICAgICBleHBlY3QoZnMucmVhbHBhdGhTeW5jKHRleHRFZGl0b3IuZ2V0UGF0aCgpKSkudG9CZSBmcy5yZWFscGF0aFN5bmMob3V0cHV0UGF0aClcbiAgICAgICAgc2F2ZWRIVE1MID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgICAucmVwbGFjZSgvPGJvZHkgY2xhc3M9J21hcmtkb3duLXByZXZpZXcnPjxkaXY+LywgJzxib2R5IGNsYXNzPVxcJ21hcmtkb3duLXByZXZpZXdcXCc+JylcbiAgICAgICAgICAucmVwbGFjZSgvXFxuPFxcL2Rpdj48XFwvYm9keT4vLCAnPC9ib2R5PicpXG4gICAgICAgIGV4cGVjdChzYXZlZEhUTUwpLnRvQmUgZXhwZWN0ZWRPdXRwdXQucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKVxuXG4gICAgZGVzY3JpYmUgXCJ0ZXh0IGVkaXRvciBzdHlsZSBleHRyYWN0aW9uXCIsIC0+XG5cbiAgICAgIFtleHRyYWN0ZWRTdHlsZXNdID0gW11cblxuICAgICAgdGV4dEVkaXRvclN0eWxlID0gXCIuZWRpdG9yLXN0eWxlIC5leHRyYWN0aW9uLXRlc3QgeyBjb2xvcjogYmx1ZTsgfVwiXG4gICAgICB1bnJlbGF0ZWRTdHlsZSAgPSBcIi5zb21ldGhpbmcgZWxzZSB7IGNvbG9yOiByZWQ7IH1cIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uc3R5bGVzLmFkZFN0eWxlU2hlZXQgdGV4dEVkaXRvclN0eWxlLFxuICAgICAgICAgIGNvbnRleHQ6ICdhdG9tLXRleHQtZWRpdG9yJ1xuXG4gICAgICAgIGF0b20uc3R5bGVzLmFkZFN0eWxlU2hlZXQgdW5yZWxhdGVkU3R5bGUsXG4gICAgICAgICAgY29udGV4dDogJ3VucmVsYXRlZC1jb250ZXh0J1xuXG4gICAgICAgIGV4dHJhY3RlZFN0eWxlcyA9IHByZXZpZXcuZ2V0VGV4dEVkaXRvclN0eWxlcygpXG5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGF0b20tdGV4dC1lZGl0b3IgY3NzIHN0eWxlIHN0cmluZ3NcIiwgLT5cbiAgICAgICAgZXhwZWN0KGV4dHJhY3RlZFN0eWxlcy5pbmRleE9mKHRleHRFZGl0b3JTdHlsZSkpLnRvQmVHcmVhdGVyVGhhbigtMSlcblxuICAgICAgaXQgXCJkb2VzIG5vdCByZXR1cm4gb3RoZXIgc3R5bGVzXCIsIC0+XG4gICAgICAgIGV4cGVjdChleHRyYWN0ZWRTdHlsZXMuaW5kZXhPZih1bnJlbGF0ZWRTdHlsZSkpLnRvQmUoLTEpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNvcmU6Y29weSBpcyB0cmlnZ2VyZWRcIiwgLT5cbiAgICBpdCBcIndyaXRlcyB0aGUgcmVuZGVyZWQgSFRNTCB0byB0aGUgY2xpcGJvYXJkXCIsIC0+XG4gICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuICAgICAgcHJldmlldy5lbGVtZW50LnJlbW92ZSgpXG5cbiAgICAgIGZpbGVQYXRoID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgnc3ViZGlyL2NvZGUtYmxvY2subWQnKVxuICAgICAgcHJldmlldyA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHtmaWxlUGF0aH0pXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHByZXZpZXcuZWxlbWVudClcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggcHJldmlldy5lbGVtZW50LCAnY29yZTpjb3B5J1xuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBhdG9tLmNsaXBib2FyZC5yZWFkKCkgaXNudCBcImluaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnRcIlxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvQmUgXCJcIlwiXG4gICAgICAgICA8aDE+Q29kZSBCbG9jazwvaDE+XG4gICAgICAgICA8cHJlIGNsYXNzPVwiZWRpdG9yLWNvbG9ycyBsYW5nLWphdmFzY3JpcHRcIj48ZGl2IGNsYXNzPVwibGluZVwiPjxzcGFuIGNsYXNzPVwic3ludGF4LS1zb3VyY2Ugc3ludGF4LS1qc1wiPjxzcGFuIGNsYXNzPVwic3ludGF4LS1rZXl3b3JkIHN5bnRheC0tY29udHJvbCBzeW50YXgtLWpzXCI+PHNwYW4+aWY8L3NwYW4+PC9zcGFuPjxzcGFuPiZuYnNwO2EmbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzeW50YXgtLWtleXdvcmQgc3ludGF4LS1vcGVyYXRvciBzeW50YXgtLWNvbXBhcmlzb24gc3ludGF4LS1qc1wiPjxzcGFuPj09PTwvc3Bhbj48L3NwYW4+PHNwYW4+Jm5ic3A7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3ludGF4LS1jb25zdGFudCBzeW50YXgtLW51bWVyaWMgc3ludGF4LS1kZWNpbWFsIHN5bnRheC0tanNcIj48c3Bhbj4zPC9zcGFuPjwvc3Bhbj48c3Bhbj4mbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzeW50YXgtLW1ldGEgc3ludGF4LS1icmFjZSBzeW50YXgtLWN1cmx5IHN5bnRheC0tanNcIj48c3Bhbj57PC9zcGFuPjwvc3Bhbj48L3NwYW4+XG4gICAgICAgICA8L2Rpdj48ZGl2IGNsYXNzPVwibGluZVwiPjxzcGFuIGNsYXNzPVwic3ludGF4LS1zb3VyY2Ugc3ludGF4LS1qc1wiPjxzcGFuPiZuYnNwOyZuYnNwO2ImbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzeW50YXgtLWtleXdvcmQgc3ludGF4LS1vcGVyYXRvciBzeW50YXgtLWFzc2lnbm1lbnQgc3ludGF4LS1qc1wiPjxzcGFuPj08L3NwYW4+PC9zcGFuPjxzcGFuPiZuYnNwOzwvc3Bhbj48c3BhbiBjbGFzcz1cInN5bnRheC0tY29uc3RhbnQgc3ludGF4LS1udW1lcmljIHN5bnRheC0tZGVjaW1hbCBzeW50YXgtLWpzXCI+PHNwYW4+NTwvc3Bhbj48L3NwYW4+PC9zcGFuPlxuICAgICAgICAgPC9kaXY+PGRpdiBjbGFzcz1cImxpbmVcIj48c3BhbiBjbGFzcz1cInN5bnRheC0tc291cmNlIHN5bnRheC0tanNcIj48c3BhbiBjbGFzcz1cInN5bnRheC0tbWV0YSBzeW50YXgtLWJyYWNlIHN5bnRheC0tY3VybHkgc3ludGF4LS1qc1wiPjxzcGFuPn08L3NwYW4+PC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgIDwvZGl2PjwvcHJlPlxuICAgICAgICAgPHA+ZW5jb2Rpbmcg4oaSIGlzc3VlPC9wPlxuICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIndoZW4gbWF0aHMgcmVuZGVyaW5nIGlzIGVuYWJsZWQgYnkgZGVmYXVsdFwiLCAtPlxuICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgTWF0aEpheCBpcyBsb2FkaW5nIHdoZW4gZmlyc3QgcHJldmlldyBpcyBvcGVuZWRcIiwgLT5cbiAgICAgIFt3b3Jrc3BhY2VFbGVtZW50XSA9IFtdXG5cbiAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbm90aWZpY2F0aW9ucycpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBtYXRoamF4SGVscGVyLnJlc2V0TWF0aEpheCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JywgdHJ1ZVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuXG4gICAgICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUoKVxuXG4gICAgICB3YWl0c0ZvciBcIm5vdGlmaWNhdGlvblwiLCAtPlxuICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgJ2F0b20tbm90aWZpY2F0aW9uJ1xuXG4gICAgICBydW5zIC0+XG4gICAgICAgIG5vdGlmaWNhdGlvbiA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvciAnYXRvbS1ub3RpZmljYXRpb24uaW5mbydcbiAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbikudG9FeGlzdCgpXG4iXX0=
