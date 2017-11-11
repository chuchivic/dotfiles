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
      return describe("when the image uses a web URL", function() {
        return it("doesn't change the URL", function() {
          var image;
          image = preview.find("img[alt=Image3]");
          expect(markdownIt.decode).toHaveBeenCalled();
          return expect(image.attr('src')).toBe('https://raw.githubusercontent.com/Galadirith/markdown-preview-plus/master/assets/hr.png');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxtQkFBQSxHQUFzQixPQUFBLENBQVEsOEJBQVI7O0VBQ3RCLFVBQUEsR0FBYSxPQUFBLENBQVEsMkJBQVI7O0VBQ2IsYUFBQSxHQUFnQixPQUFBLENBQVEsdUJBQVI7O0VBQ2hCLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVI7O0VBRWQsT0FBQSxDQUFRLGVBQVI7O0VBRUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUE7QUFDOUIsUUFBQTtJQUFBLE1BQXNCLEVBQXRCLEVBQUMsaUJBQUQsRUFBVztJQUVYLFVBQUEsQ0FBVyxTQUFBO01BQ1QsT0FBQSxHQUFVLFFBQUEsR0FBVztNQUNyQixlQUFBLENBQWdCLFNBQUE7ZUFDZCxPQUFPLENBQUMsR0FBUixDQUFZLENBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGVBQTlCLENBRFUsRUFFVixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLENBRlUsQ0FBWjtNQURjLENBQWhCO01BTUEsUUFBQSxDQUFTLFNBQUE7ZUFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFkLENBQWtDLGFBQWxDLENBQUEsS0FBc0Q7TUFEL0MsQ0FBVDtNQUdBLFFBQUEsQ0FBUyxTQUFBO2VBQ1AsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBZCxDQUFrQyxXQUFsQyxDQUFBLEtBQW9EO01BRDdD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QUFDLE9BQVIsQ0FBQTtRQUVBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUI7UUFBSCxDQUFoQjtRQUVBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtpQkFDbkIsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsZ0JBQXBCO1FBRkcsQ0FBTDtRQUlBLGVBQUEsQ0FBZ0IsU0FBQTtpQkFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7UUFBSCxDQUFoQjtRQUVBLElBQUEsQ0FBSyxTQUFBO1VBQ0gsYUFBYSxDQUFDLFlBQWQsQ0FBQTtVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxREFBaEIsRUFBdUUsSUFBdkU7aUJBQ0EsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyw4QkFBekM7UUFIRyxDQUFMO1FBS0Esd0JBQUEsQ0FBQTtRQUVBLFFBQUEsQ0FBUyxjQUFULEVBQXlCLFNBQUE7aUJBQ3ZCLGdCQUFnQixDQUFDLGFBQWpCLENBQStCLG1CQUEvQjtRQUR1QixDQUF6QjtlQUdBLElBQUEsQ0FBSyxTQUFBO0FBQ0gsY0FBQTtVQUFBLFlBQUEsR0FBZSxnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQix3QkFBL0I7aUJBQ2YsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxPQUFyQixDQUFBO1FBRkcsQ0FBTDtNQXZCc0UsQ0FBeEU7SUFEcUQsQ0FBdkQ7RUF6a0I4QixDQUFoQztBQVhBIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG50ZW1wID0gcmVxdWlyZSAndGVtcCdcbk1hcmtkb3duUHJldmlld1ZpZXcgPSByZXF1aXJlICcuLi9saWIvbWFya2Rvd24tcHJldmlldy12aWV3J1xubWFya2Rvd25JdCA9IHJlcXVpcmUgJy4uL2xpYi9tYXJrZG93bi1pdC1oZWxwZXInXG5tYXRoamF4SGVscGVyID0gcmVxdWlyZSAnLi4vbGliL21hdGhqYXgtaGVscGVyJ1xudXJsID0gcmVxdWlyZSAndXJsJ1xucXVlcnlTdHJpbmcgPSByZXF1aXJlICdxdWVyeXN0cmluZydcblxucmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxuZGVzY3JpYmUgXCJNYXJrZG93blByZXZpZXdWaWV3XCIsIC0+XG4gIFtmaWxlUGF0aCwgcHJldmlld10gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBwcmV2aWV3ID0gZmlsZVBhdGggPSBudWxsXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBQcm9taXNlLmFsbCBbXG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1ydWJ5JylcbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuICAgICAgXVxuXG4gICAgd2FpdHNGb3IgLT5cbiAgICAgIGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLnJ1YnknKSBpc250IHVuZGVmaW5lZFxuXG4gICAgd2FpdHNGb3IgLT5cbiAgICAgIGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZSgnc291cmNlLmpzJykgaXNudCB1bmRlZmluZWRcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ21hcmtkb3duLXByZXZpZXctcGx1cycpXG5cbiAgICBydW5zIC0+XG4gICAgICBmaWxlUGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3N1YmRpci9maWxlLm1hcmtkb3duJylcbiAgICAgIHByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGh9KVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShwcmV2aWV3LmVsZW1lbnQpXG5cbiAgICAgIHRoaXMuYWRkTWF0Y2hlcnNcbiAgICAgICAgdG9TdGFydFdpdGg6IChleHBlY3RlZCkgLT5cbiAgICAgICAgICB0aGlzLmFjdHVhbC5zbGljZSgwLCBleHBlY3RlZC5sZW5ndGgpIGlzIGV4cGVjdGVkXG5cbiAgYWZ0ZXJFYWNoIC0+XG4gICAgcHJldmlldy5kZXN0cm95KClcblxuICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUgPSAtPlxuICAgIHdhaXRzRm9yIC0+XG4gICAgICBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5nZXRQYW5lcygpLmxlbmd0aCBpcyAyXG5cbiAgICB3YWl0c0ZvciBcIm1hcmtkb3duIHByZXZpZXcgdG8gYmUgY3JlYXRlZFwiLCAtPlxuICAgICAgcHJldmlldyA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldFBhbmVzKClbMV0uZ2V0QWN0aXZlSXRlbSgpXG5cbiAgICBydW5zIC0+XG4gICAgICBleHBlY3QocHJldmlldykudG9CZUluc3RhbmNlT2YoTWFya2Rvd25QcmV2aWV3VmlldylcbiAgICAgIGV4cGVjdChwcmV2aWV3LmdldFBhdGgoKSkudG9CZSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpLmdldFBhdGgoKVxuXG4gIGRlc2NyaWJlIFwiOjpjb25zdHJ1Y3RvclwiLCAtPlxuICAgICMgTG9hZGluZyBzcGlubmVyIGRpc2FibGVkIHdoZW4gRE9NIHVwZGF0ZSBieSBkaWZmIHdhcyBpbnRyb2R1Y2VkLiBJZlxuICAgICMgc3Bpbm5lciBjb2RlIGluIGBsaWIvbWFya2Rvd24tcHJldmlldy12aWV3YCBpcyByZW1vdmVkIGNvbXBsZXRseSB0aGlzXG4gICAgIyBzcGVjIHNob3VsZCBhbHNvIGJlIHJlbW92ZWRcbiAgICAjXG4gICAgIyBpdCBcInNob3dzIGEgbG9hZGluZyBzcGlubmVyIGFuZCByZW5kZXJzIHRoZSBtYXJrZG93blwiLCAtPlxuICAgICMgICBwcmV2aWV3LnNob3dMb2FkaW5nKClcbiAgICAjICAgZXhwZWN0KHByZXZpZXcuZmluZCgnLm1hcmtkb3duLXNwaW5uZXInKSkudG9FeGlzdCgpXG4gICAgI1xuICAgICMgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAjICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcbiAgICAjXG4gICAgIyAgIHJ1bnMgLT5cbiAgICAjICAgICBleHBlY3QocHJldmlldy5maW5kKFwiLmVtb2ppXCIpKS50b0V4aXN0KClcblxuICAgIGl0IFwic2hvd3MgYW4gZXJyb3IgbWVzc2FnZSB3aGVuIHRoZXJlIGlzIGFuIGVycm9yXCIsIC0+XG4gICAgICBwcmV2aWV3LnNob3dFcnJvcihcIk5vdCBhIHJlYWwgZmlsZVwiKVxuICAgICAgZXhwZWN0KHByZXZpZXcudGV4dCgpKS50b0NvbnRhaW4gXCJGYWlsZWRcIlxuXG4gIGRlc2NyaWJlIFwic2VyaWFsaXphdGlvblwiLCAtPlxuICAgIG5ld1ByZXZpZXcgPSBudWxsXG5cbiAgICBhZnRlckVhY2ggLT5cbiAgICAgIG5ld1ByZXZpZXc/LmRlc3Ryb3koKVxuXG4gICAgaXQgXCJyZWNyZWF0ZXMgdGhlIHByZXZpZXcgd2hlbiBzZXJpYWxpemVkL2Rlc2VyaWFsaXplZFwiLCAtPlxuICAgICAgbmV3UHJldmlldyA9IGF0b20uZGVzZXJpYWxpemVycy5kZXNlcmlhbGl6ZShwcmV2aWV3LnNlcmlhbGl6ZSgpKVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShuZXdQcmV2aWV3LmVsZW1lbnQpXG4gICAgICBleHBlY3QobmV3UHJldmlldy5nZXRQYXRoKCkpLnRvQmUgcHJldmlldy5nZXRQYXRoKClcblxuICAgIGl0IFwiZG9lcyBub3QgcmVjcmVhdGUgYSBwcmV2aWV3IHdoZW4gdGhlIGZpbGUgbm8gbG9uZ2VyIGV4aXN0c1wiLCAtPlxuICAgICAgZmlsZVBhdGggPSBwYXRoLmpvaW4odGVtcC5ta2RpclN5bmMoJ21hcmtkb3duLXByZXZpZXctJyksICdmb28ubWQnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgJyMgSGknKVxuXG4gICAgICBuZXdQcmV2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe2ZpbGVQYXRofSlcbiAgICAgIHNlcmlhbGl6ZWQgPSBuZXdQcmV2aWV3LnNlcmlhbGl6ZSgpXG4gICAgICBmcy5yZW1vdmVTeW5jKGZpbGVQYXRoKVxuXG4gICAgICBuZXdQcmV2aWV3ID0gYXRvbS5kZXNlcmlhbGl6ZXJzLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWQpXG4gICAgICBleHBlY3QobmV3UHJldmlldykudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBpdCBcInNlcmlhbGl6ZXMgdGhlIGVkaXRvciBpZCB3aGVuIG9wZW5lZCBmb3IgYW4gZWRpdG9yXCIsIC0+XG4gICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignbmV3Lm1hcmtkb3duJylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBwcmV2aWV3ID0gbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoe2VkaXRvcklkOiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuaWR9KVxuXG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00ocHJldmlldy5lbGVtZW50KVxuICAgICAgICBleHBlY3QocHJldmlldy5nZXRQYXRoKCkpLnRvQmUgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFBhdGgoKVxuXG4gICAgICAgIG5ld1ByZXZpZXcgPSBhdG9tLmRlc2VyaWFsaXplcnMuZGVzZXJpYWxpemUocHJldmlldy5zZXJpYWxpemUoKSlcbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShuZXdQcmV2aWV3LmVsZW1lbnQpXG4gICAgICAgIGV4cGVjdChuZXdQcmV2aWV3LmdldFBhdGgoKSkudG9CZSBwcmV2aWV3LmdldFBhdGgoKVxuXG4gIGRlc2NyaWJlIFwiaGVhZGVyIHJlbmRlcmluZ1wiLCAtPlxuXG4gICAgaXQgXCJzaG91bGQgcmVuZGVyIGhlYWRpbmdzIHdpdGggYW5kIHdpdGhvdXQgc3BhY2VcIiwgLT5cblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGhlYWRsaW5lcyA9IHByZXZpZXcuZmluZCgnaDInKVxuICAgICAgICBleHBlY3QoaGVhZGxpbmVzKS50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KGhlYWRsaW5lcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgZXhwZWN0KGhlYWRsaW5lc1swXS5vdXRlckhUTUwpLnRvQmUoXCI8aDI+TGV2ZWwgdHdvIGhlYWRlciB3aXRob3V0IHNwYWNlPC9oMj5cIilcbiAgICAgICAgZXhwZWN0KGhlYWRsaW5lc1sxXS5vdXRlckhUTUwpLnRvQmUoXCI8aDI+TGV2ZWwgdHdvIGhlYWRlciB3aXRoIHNwYWNlPC9oMj5cIilcblxuICAgIGl0IFwic2hvdWxkIHJlbmRlciBoZWFkaW5ncyB3aXRoIGFuZCB3aXRob3V0IHNwYWNlXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VMYXp5SGVhZGVycycsIGZhbHNlXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBoZWFkbGluZXMgPSBwcmV2aWV3LmZpbmQoJ2gyJylcbiAgICAgICAgZXhwZWN0KGhlYWRsaW5lcykudG9FeGlzdCgpXG4gICAgICAgIGV4cGVjdChoZWFkbGluZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgIGV4cGVjdChoZWFkbGluZXNbMF0ub3V0ZXJIVE1MKS50b0JlKFwiPGgyPkxldmVsIHR3byBoZWFkZXIgd2l0aCBzcGFjZTwvaDI+XCIpXG5cblxuICBkZXNjcmliZSBcImNvZGUgYmxvY2sgY29udmVyc2lvbiB0byBhdG9tLXRleHQtZWRpdG9yIHRhZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICBpdCBcInJlbW92ZXMgbGluZSBkZWNvcmF0aW9ucyBvbiByZW5kZXJlZCBjb2RlIGJsb2Nrc1wiLCAtPlxuICAgICAgZWRpdG9yID0gcHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9J3RleHQgcGxhaW4gbnVsbC1ncmFtbWFyJ11cIilcbiAgICAgIGRlY29yYXRpb25zID0gZWRpdG9yWzBdLmdldE1vZGVsKCkuZ2V0RGVjb3JhdGlvbnMoY2xhc3M6ICdjdXJzb3ItbGluZScsIHR5cGU6ICdsaW5lJylcbiAgICAgIGV4cGVjdChkZWNvcmF0aW9ucy5sZW5ndGgpLnRvQmUgMFxuXG4gICAgaXQgXCJyZW1vdmVzIGEgdHJhaWxpbmcgbmV3bGluZSBidXQgcHJlc2VydmVzIHJlbWFpbmluZyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlXCIsIC0+XG4gICAgICBuZXdGaWxlUGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3N1YmRpci90cmltLW5sLm1kJylcbiAgICAgIG5ld1ByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGg6IG5ld0ZpbGVQYXRofSlcbiAgICAgIGphc21pbmUuYXR0YWNoVG9ET00obmV3UHJldmlldy5lbGVtZW50KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgbmV3UHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZWRpdG9yID0gbmV3UHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvclwiKVxuICAgICAgICBleHBlY3QoZWRpdG9yKS50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KGVkaXRvclswXS5nZXRNb2RlbCgpLmdldFRleHQoKSkudG9CZSBcIlwiXCJcblxuICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgICBiXG4gICAgICAgICAgICAgY1xuICAgICAgICAgICAgZFxuICAgICAgICAgICBlXG4gICAgICAgICAgZlxuXG4gICAgICAgIFwiXCJcIlxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIG5ld1ByZXZpZXcuZGVzdHJveSgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGNvZGUgYmxvY2sncyBmZW5jZSBuYW1lIGhhcyBhIG1hdGNoaW5nIGdyYW1tYXJcIiwgLT5cbiAgICAgIGl0IFwiYXNzaWducyB0aGUgZ3JhbW1hciBvbiB0aGUgYXRvbS10ZXh0LWVkaXRvclwiLCAtPlxuICAgICAgICBydWJ5RWRpdG9yID0gcHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9J3NvdXJjZSBydWJ5J11cIilcbiAgICAgICAgZXhwZWN0KHJ1YnlFZGl0b3IpLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QocnVieUVkaXRvclswXS5nZXRNb2RlbCgpLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgICAgICBkZWYgZnVuY1xuICAgICAgICAgICAgeCA9IDFcbiAgICAgICAgICBlbmRcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgIyBuZXN0ZWQgaW4gYSBsaXN0IGl0ZW1cbiAgICAgICAganNFZGl0b3IgPSBwcmV2aWV3LmZpbmQoXCJhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj0nc291cmNlIGpzJ11cIilcbiAgICAgICAgZXhwZWN0KGpzRWRpdG9yKS50b0V4aXN0KClcbiAgICAgICAgZXhwZWN0KGpzRWRpdG9yWzBdLmdldE1vZGVsKCkuZ2V0VGV4dCgpKS50b0JlIFwiXCJcIlxuICAgICAgICAgIGlmIGEgPT09IDMge1xuICAgICAgICAgICAgYiA9IDVcbiAgICAgICAgICB9XG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBjb2RlIGJsb2NrJ3MgZmVuY2UgbmFtZSBkb2Vzbid0IGhhdmUgYSBtYXRjaGluZyBncmFtbWFyXCIsIC0+XG4gICAgICBpdCBcImRvZXMgbm90IGFzc2lnbiBhIHNwZWNpZmljIGdyYW1tYXJcIiwgLT5cbiAgICAgICAgcGxhaW5FZGl0b3IgPSBwcmV2aWV3LmZpbmQoXCJhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj0ndGV4dCBwbGFpbiBudWxsLWdyYW1tYXInXVwiKVxuICAgICAgICBleHBlY3QocGxhaW5FZGl0b3IpLnRvRXhpc3QoKVxuICAgICAgICBleHBlY3QocGxhaW5FZGl0b3JbMF0uZ2V0TW9kZWwoKS5nZXRUZXh0KCkpLnRvQmUgXCJcIlwiXG4gICAgICAgICAgZnVuY3Rpb24gZih4KSB7XG4gICAgICAgICAgICByZXR1cm4geCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJpbWFnZSByZXNvbHZpbmdcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbihtYXJrZG93bkl0LCAnZGVjb2RlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbWFnZSB1c2VzIGEgcmVsYXRpdmUgcGF0aFwiLCAtPlxuICAgICAgaXQgXCJyZXNvbHZlcyB0byBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgaW1hZ2UgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PUltYWdlMV1cIilcbiAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGltYWdlLmF0dHIoJ3NyYycpKS50b1N0YXJ0V2l0aCBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvaW1hZ2UxLnBuZycpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGltYWdlIHVzZXMgYW4gYWJzb2x1dGUgcGF0aCB0aGF0IGRvZXMgbm90IGV4aXN0XCIsIC0+XG4gICAgICBpdCBcInJlc29sdmVzIHRvIGEgcGF0aCByZWxhdGl2ZSB0byB0aGUgcHJvamVjdCByb290XCIsIC0+XG4gICAgICAgIGltYWdlID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1JbWFnZTJdXCIpXG4gICAgICAgIGV4cGVjdChtYXJrZG93bkl0LmRlY29kZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChpbWFnZS5hdHRyKCdzcmMnKSkudG9TdGFydFdpdGggYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgndG1wL2ltYWdlMi5wbmcnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBpbWFnZSB1c2VzIGFuIGFic29sdXRlIHBhdGggdGhhdCBleGlzdHNcIiwgLT5cbiAgICAgIGl0IFwiYWRkcyBhIHF1ZXJ5IHRvIHRoZSBVUkxcIiwgLT5cbiAgICAgICAgcHJldmlldy5kZXN0cm95KClcblxuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbih0ZW1wLm1rZGlyU3luYygnYXRvbScpLCAnZm9vLm1kJylcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgXCIhW2Fic29sdXRlXSgje2ZpbGVQYXRofSlcIilcbiAgICAgICAgcHJldmlldyA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHtmaWxlUGF0aH0pXG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00ocHJldmlldy5lbGVtZW50KVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QobWFya2Rvd25JdC5kZWNvZGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWFic29sdXRlXVwiKS5hdHRyKCdzcmMnKSkudG9TdGFydFdpdGggXCIje2ZpbGVQYXRofT92PVwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGltYWdlIHVzZXMgYSB3ZWIgVVJMXCIsIC0+XG4gICAgICBpdCBcImRvZXNuJ3QgY2hhbmdlIHRoZSBVUkxcIiwgLT5cbiAgICAgICAgaW1hZ2UgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PUltYWdlM11cIilcbiAgICAgICAgZXhwZWN0KG1hcmtkb3duSXQuZGVjb2RlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KGltYWdlLmF0dHIoJ3NyYycpKS50b0JlICdodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vR2FsYWRpcml0aC9tYXJrZG93bi1wcmV2aWV3LXBsdXMvbWFzdGVyL2Fzc2V0cy9oci5wbmcnXG5cbiAgZGVzY3JpYmUgXCJpbWFnZSBtb2RpZmljYXRpb25cIiwgLT5cbiAgICBbZGlyUGF0aCwgZmlsZVBhdGgsIGltZzFQYXRoLCB3b3Jrc3BhY2VFbGVtZW50XSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuXG4gICAgICBqYXNtaW5lLnVzZVJlYWxDbG9jaygpXG5cbiAgICAgIGRpclBhdGggICA9IHRlbXAubWtkaXJTeW5jKCdhdG9tJylcbiAgICAgIGZpbGVQYXRoICA9IHBhdGguam9pbiBkaXJQYXRoLCAnaW1hZ2UtbW9kaWZpY2F0aW9uLm1kJ1xuICAgICAgaW1nMVBhdGggID0gcGF0aC5qb2luIGRpclBhdGgsICdpbWcxLnBuZydcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgXCIhW2ltZzFdKCN7aW1nMVBhdGh9KVwiXG4gICAgICBmcy53cml0ZUZpbGVTeW5jIGltZzFQYXRoLCBcImNsZWFybHkgbm90IGEgcG5nIGJ1dCBnb29kIGVub3VnaCBmb3IgdGVzdHNcIlxuXG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgZ2V0SW1hZ2VWZXJzaW9uID0gKGltYWdlUGF0aCwgaW1hZ2VVUkwpIC0+XG4gICAgICBleHBlY3QoaW1hZ2VVUkwpLnRvU3RhcnRXaXRoIFwiI3tpbWFnZVBhdGh9P3Y9XCJcbiAgICAgIHVybFF1ZXJ5U3RyID0gdXJsLnBhcnNlKGltYWdlVVJMKS5xdWVyeVxuICAgICAgdXJsUXVlcnkgICAgPSBxdWVyeVN0cmluZy5wYXJzZSh1cmxRdWVyeVN0cilcbiAgICAgIHVybFF1ZXJ5LnZcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhIGxvY2FsIGltYWdlIGlzIHByZXZpZXdlZFwiLCAtPlxuICAgICAgaXQgXCJhZGRzIGEgdGltZXN0YW1wIHF1ZXJ5IHRvIHRoZSBVUkxcIiwgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltYWdlVVJMKVxuICAgICAgICAgIGV4cGVjdChpbWFnZVZlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgbG9jYWwgaW1hZ2UgaXMgbW9kaWZpZWQgZHVyaW5nIGEgcHJldmlldyAjbm90d2VyY2tlclwiLCAtPlxuICAgICAgaXQgXCJyZXJlbmRlcnMgdGhlIGltYWdlIHdpdGggYSBtb3JlIHJlY2VudCB0aW1lc3RhbXAgcXVlcnlcIiwgLT5cbiAgICAgICAgW2ltYWdlVVJMLCBpbWFnZVZlcl0gPSBbXVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG4gICAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGltYWdlVVJMID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcxXVwiKS5hdHRyKCdzcmMnKVxuICAgICAgICAgIGltYWdlVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzFQYXRoLCBpbWFnZVVSTClcbiAgICAgICAgICBleHBlY3QoaW1hZ2VWZXIpLm5vdC50b0VxdWFsKCdkZWxldGVkJylcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgaW1nMVBhdGgsIFwic3RpbGwgY2xlYXJseSBub3QgYSBwbmcgO0RcIlxuXG4gICAgICAgIHdhaXRzRm9yIFwiaW1hZ2Ugc3JjIGF0dHJpYnV0ZSB0byB1cGRhdGVcIiwgLT5cbiAgICAgICAgICBpbWFnZVVSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMV1cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1hZ2VVUkwuZW5kc1dpdGggaW1hZ2VWZXJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgbmV3SW1hZ2VWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltYWdlVVJMKVxuICAgICAgICAgIGV4cGVjdChuZXdJbWFnZVZlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuICAgICAgICAgIGV4cGVjdChwYXJzZUludChuZXdJbWFnZVZlcikpLnRvQmVHcmVhdGVyVGhhbihwYXJzZUludChpbWFnZVZlcikpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhyZWUgaW1hZ2VzIGFyZSBwcmV2aWV3ZWQgYW5kIGFsbCBhcmUgbW9kaWZpZWQgI25vdHdlcmNrZXJcIiwgLT5cbiAgICAgIGl0IFwicmVyZW5kZXJzIHRoZSBpbWFnZXMgd2l0aCBhIG1vcmUgcmVjZW50IHRpbWVzdGFtcCBhcyB0aGV5IGFyZSBtb2RpZmllZFwiLCAtPlxuICAgICAgICBbaW1nMlBhdGgsIGltZzNQYXRoXSA9IFtdXG4gICAgICAgIFtpbWcxVmVyLCBpbWcyVmVyLCBpbWczVmVyXSA9IFtdXG4gICAgICAgIFtpbWcxVVJMLCBpbWcyVVJMLCBpbWczVVJMXSA9IFtdXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgICAgICAgICBpbWcyUGF0aCAgPSBwYXRoLmpvaW4gZGlyUGF0aCwgJ2ltZzIucG5nJ1xuICAgICAgICAgIGltZzNQYXRoICA9IHBhdGguam9pbiBkaXJQYXRoLCAnaW1nMy5wbmcnXG5cbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGltZzJQYXRoLCBcImknbSBub3QgcmVhbGx5IGEgcG5nIDtEXCJcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGltZzNQYXRoLCBcIm5laXRoZXIgYW0gaSA7RFwiXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBmaWxlUGF0aCwgXCJcIlwiXG4gICAgICAgICAgICAhW2ltZzFdKCN7aW1nMVBhdGh9KVxuICAgICAgICAgICAgIVtpbWcyXSgje2ltZzJQYXRofSlcbiAgICAgICAgICAgICFbaW1nM10oI3tpbWczUGF0aH0pXG4gICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgICBnZXRJbWFnZUVsZW1lbnRzVVJMID0gLT5cbiAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcxXVwiKS5hdHRyKCdzcmMnKSxcbiAgICAgICAgICAgIHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMl1cIikuYXR0cignc3JjJyksXG4gICAgICAgICAgICBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzNdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgXVxuXG4gICAgICAgIGV4cGVjdFF1ZXJ5VmFsdWVzID0gKHF1ZXJ5VmFsdWVzKSAtPlxuICAgICAgICAgIFtpbWcxVVJMLCBpbWcyVVJMLCBpbWczVVJMXSA9IGdldEltYWdlRWxlbWVudHNVUkwoKVxuICAgICAgICAgIGlmIHF1ZXJ5VmFsdWVzLmltZzE/XG4gICAgICAgICAgICBleHBlY3QoaW1nMVVSTCkudG9TdGFydFdpdGggXCIje2ltZzFQYXRofT92PVwiXG4gICAgICAgICAgICBleHBlY3QoaW1nMVVSTCkudG9CZSBcIiN7aW1nMVBhdGh9P3Y9I3txdWVyeVZhbHVlcy5pbWcxfVwiXG4gICAgICAgICAgaWYgcXVlcnlWYWx1ZXMuaW1nMj9cbiAgICAgICAgICAgIGV4cGVjdChpbWcyVVJMKS50b1N0YXJ0V2l0aCBcIiN7aW1nMlBhdGh9P3Y9XCJcbiAgICAgICAgICAgIGV4cGVjdChpbWcyVVJMKS50b0JlIFwiI3tpbWcyUGF0aH0/dj0je3F1ZXJ5VmFsdWVzLmltZzJ9XCJcbiAgICAgICAgICBpZiBxdWVyeVZhbHVlcy5pbWczP1xuICAgICAgICAgICAgZXhwZWN0KGltZzNVUkwpLnRvU3RhcnRXaXRoIFwiI3tpbWczUGF0aH0/dj1cIlxuICAgICAgICAgICAgZXhwZWN0KGltZzNVUkwpLnRvQmUgXCIje2ltZzNQYXRofT92PSN7cXVlcnlWYWx1ZXMuaW1nM31cIlxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBbaW1nMVVSTCwgaW1nMlVSTCwgaW1nM1VSTF0gPSBnZXRJbWFnZUVsZW1lbnRzVVJMKClcblxuICAgICAgICAgIGltZzFWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltZzFVUkwpXG4gICAgICAgICAgaW1nMlZlciA9IGdldEltYWdlVmVyc2lvbihpbWcyUGF0aCwgaW1nMlVSTClcbiAgICAgICAgICBpbWczVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzNQYXRoLCBpbWczVVJMKVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBpbWcxUGF0aCwgXCJzdGlsbCBjbGVhcmx5IG5vdCBhIHBuZyA7RFwiXG5cbiAgICAgICAgd2FpdHNGb3IgXCJpbWcxIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1nMVVSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMV1cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1nMVVSTC5lbmRzV2l0aCBpbWcxVmVyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdFF1ZXJ5VmFsdWVzXG4gICAgICAgICAgICBpbWcyOiBpbWcyVmVyXG4gICAgICAgICAgICBpbWczOiBpbWczVmVyXG5cbiAgICAgICAgICBuZXdJbWcxVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzFQYXRoLCBpbWcxVVJMKVxuICAgICAgICAgIGV4cGVjdChuZXdJbWcxVmVyKS5ub3QudG9FcXVhbCgnZGVsZXRlZCcpXG4gICAgICAgICAgZXhwZWN0KHBhcnNlSW50KG5ld0ltZzFWZXIpKS50b0JlR3JlYXRlclRoYW4ocGFyc2VJbnQoaW1nMVZlcikpXG4gICAgICAgICAgaW1nMVZlciA9IG5ld0ltZzFWZXJcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgaW1nMlBhdGgsIFwic3RpbGwgY2xlYXJseSBub3QgYSBwbmcgZWl0aGVyIDtEXCJcblxuICAgICAgICB3YWl0c0ZvciBcImltZzIgc3JjIGF0dHJpYnV0ZSB0byB1cGRhdGVcIiwgLT5cbiAgICAgICAgICBpbWcyVVJMID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcyXVwiKS5hdHRyKCdzcmMnKVxuICAgICAgICAgIG5vdCBpbWcyVVJMLmVuZHNXaXRoIGltZzJWZXJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0UXVlcnlWYWx1ZXNcbiAgICAgICAgICAgIGltZzE6IGltZzFWZXJcbiAgICAgICAgICAgIGltZzM6IGltZzNWZXJcblxuICAgICAgICAgIG5ld0ltZzJWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMlBhdGgsIGltZzJVUkwpXG4gICAgICAgICAgZXhwZWN0KG5ld0ltZzJWZXIpLm5vdC50b0VxdWFsKCdkZWxldGVkJylcbiAgICAgICAgICBleHBlY3QocGFyc2VJbnQobmV3SW1nMlZlcikpLnRvQmVHcmVhdGVyVGhhbihwYXJzZUludChpbWcyVmVyKSlcbiAgICAgICAgICBpbWcyVmVyID0gbmV3SW1nMlZlclxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBpbWczUGF0aCwgXCJ5b3UgYmV0dGVyIGJlbGlldmUgaSdtIG5vdCBhIHBuZyA7RFwiXG5cbiAgICAgICAgd2FpdHNGb3IgXCJpbWczIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1nM1VSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nM11cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1nM1VSTC5lbmRzV2l0aCBpbWczVmVyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdFF1ZXJ5VmFsdWVzXG4gICAgICAgICAgICBpbWcxOiBpbWcxVmVyXG4gICAgICAgICAgICBpbWcyOiBpbWcyVmVyXG5cbiAgICAgICAgICBuZXdJbWczVmVyICA9IGdldEltYWdlVmVyc2lvbihpbWczUGF0aCwgaW1nM1VSTClcbiAgICAgICAgICBleHBlY3QobmV3SW1nM1Zlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuICAgICAgICAgIGV4cGVjdChwYXJzZUludChuZXdJbWczVmVyKSkudG9CZUdyZWF0ZXJUaGFuKHBhcnNlSW50KGltZzNWZXIpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgcHJldmlld2VkIGltYWdlIGlzIGRlbGV0ZWQgdGhlbiByZXN0b3JlZFwiLCAtPlxuICAgICAgaXQgXCJyZW1vdmVzIHRoZSBxdWVyeSB0aW1lc3RhbXAgYW5kIHJlc3RvcmVzIHRoZSB0aW1lc3RhbXAgYWZ0ZXIgYSByZXJlbmRlclwiLCAtPlxuICAgICAgICBbaW1hZ2VVUkwsIGltYWdlVmVyXSA9IFtdXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VWZXIgPSBnZXRJbWFnZVZlcnNpb24oaW1nMVBhdGgsIGltYWdlVVJMKVxuICAgICAgICAgIGV4cGVjdChpbWFnZVZlcikubm90LnRvRXF1YWwoJ2RlbGV0ZWQnKVxuXG4gICAgICAgICAgZnMudW5saW5rU3luYyBpbWcxUGF0aFxuXG4gICAgICAgIHdhaXRzRm9yIFwiaW1hZ2Ugc3JjIGF0dHJpYnV0ZSB0byB1cGRhdGVcIiwgLT5cbiAgICAgICAgICBpbWFnZVVSTCA9IHByZXZpZXcuZmluZChcImltZ1thbHQ9aW1nMV1cIikuYXR0cignc3JjJylcbiAgICAgICAgICBub3QgaW1hZ2VVUkwuZW5kc1dpdGggaW1hZ2VWZXJcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KGltYWdlVVJMKS50b0JlIGltZzFQYXRoXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyBpbWcxUGF0aCwgXCJjbGVhcmx5IG5vdCBhIHBuZyBidXQgZ29vZCBlbm91Z2ggZm9yIHRlc3RzXCJcbiAgICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgICB3YWl0c0ZvciBcImltYWdlIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VVUkwgaXNudCBpbWcxUGF0aFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBuZXdJbWFnZVZlciA9IGdldEltYWdlVmVyc2lvbihpbWcxUGF0aCwgaW1hZ2VVUkwpXG4gICAgICAgICAgZXhwZWN0KHBhcnNlSW50KG5ld0ltYWdlVmVyKSkudG9CZUdyZWF0ZXJUaGFuKHBhcnNlSW50KGltYWdlVmVyKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBhIHByZXZpZXdlZCBpbWFnZSBpcyByZW5hbWVkIGFuZCB0aGVuIHJlc3RvcmVkIHdpdGggaXRzIG9yaWdpbmFsIG5hbWVcIiwgLT5cbiAgICAgIGl0IFwicmVtb3ZlcyB0aGUgcXVlcnkgdGltZXN0YW1wIGFuZCByZXN0b3JlcyB0aGUgdGltZXN0YW1wIGFmdGVyIGEgcmVyZW5kZXJcIiwgLT5cbiAgICAgICAgW2ltYWdlVVJMLCBpbWFnZVZlcl0gPSBbXVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG4gICAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGltYWdlVVJMID0gcHJldmlldy5maW5kKFwiaW1nW2FsdD1pbWcxXVwiKS5hdHRyKCdzcmMnKVxuICAgICAgICAgIGltYWdlVmVyID0gZ2V0SW1hZ2VWZXJzaW9uKGltZzFQYXRoLCBpbWFnZVVSTClcbiAgICAgICAgICBleHBlY3QoaW1hZ2VWZXIpLm5vdC50b0VxdWFsKCdkZWxldGVkJylcblxuICAgICAgICAgIGZzLnJlbmFtZVN5bmMgaW1nMVBhdGgsIGltZzFQYXRoICsgXCJ0cm9sXCJcblxuICAgICAgICB3YWl0c0ZvciBcImltYWdlIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgbm90IGltYWdlVVJMLmVuZHNXaXRoIGltYWdlVmVyXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChpbWFnZVVSTCkudG9CZSBpbWcxUGF0aFxuICAgICAgICAgIGZzLnJlbmFtZVN5bmMgaW1nMVBhdGggKyBcInRyb2xcIiwgaW1nMVBhdGhcbiAgICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgICB3YWl0c0ZvciBcImltYWdlIHNyYyBhdHRyaWJ1dGUgdG8gdXBkYXRlXCIsIC0+XG4gICAgICAgICAgaW1hZ2VVUkwgPSBwcmV2aWV3LmZpbmQoXCJpbWdbYWx0PWltZzFdXCIpLmF0dHIoJ3NyYycpXG4gICAgICAgICAgaW1hZ2VVUkwgaXNudCBpbWcxUGF0aFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBuZXdJbWFnZVZlciA9IGdldEltYWdlVmVyc2lvbihpbWcxUGF0aCwgaW1hZ2VVUkwpXG4gICAgICAgICAgZXhwZWN0KHBhcnNlSW50KG5ld0ltYWdlVmVyKSkudG9CZUdyZWF0ZXJUaGFuKHBhcnNlSW50KGltYWdlVmVyKSlcblxuICBkZXNjcmliZSBcImdmbSBuZXdsaW5lc1wiLCAtPlxuICAgIGRlc2NyaWJlIFwid2hlbiBnZm0gbmV3bGluZXMgYXJlIG5vdCBlbmFibGVkXCIsIC0+XG4gICAgICBpdCBcImNyZWF0ZXMgYSBzaW5nbGUgcGFyYWdyYXBoIHdpdGggPGJyPlwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsIGZhbHNlKVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJldmlldy5maW5kKFwicDpsYXN0LWNoaWxkIGJyXCIpLmxlbmd0aCkudG9CZSAwXG5cbiAgICBkZXNjcmliZSBcIndoZW4gZ2ZtIG5ld2xpbmVzIGFyZSBlbmFibGVkXCIsIC0+XG4gICAgICBpdCBcImNyZWF0ZXMgYSBzaW5nbGUgcGFyYWdyYXBoIHdpdGggbm8gPGJyPlwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsIHRydWUpXG5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93bigpXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChwcmV2aWV3LmZpbmQoXCJwOmxhc3QtY2hpbGQgYnJcIikubGVuZ3RoKS50b0JlIDFcblxuICBkZXNjcmliZSBcIndoZW4gY29yZTpzYXZlLWFzIGlzIHRyaWdnZXJlZFwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHByZXZpZXcuZGVzdHJveSgpXG4gICAgICBmaWxlUGF0aCA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpWzBdLnJlc29sdmUoJ3N1YmRpci9jb2RlLWJsb2NrLm1kJylcbiAgICAgIHByZXZpZXcgPSBuZXcgTWFya2Rvd25QcmV2aWV3Vmlldyh7ZmlsZVBhdGh9KVxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShwcmV2aWV3LmVsZW1lbnQpXG5cbiAgICBpdCBcInNhdmVzIHRoZSByZW5kZXJlZCBIVE1MIGFuZCBvcGVucyBpdFwiLCAtPlxuICAgICAgb3V0cHV0UGF0aCA9IHRlbXAucGF0aChzdWZmaXg6ICcuaHRtbCcpXG4gICAgICBleHBlY3RlZEZpbGVQYXRoID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgnc2F2ZWQtaHRtbC5odG1sJylcbiAgICAgIGV4cGVjdGVkT3V0cHV0ID0gZnMucmVhZEZpbGVTeW5jKGV4cGVjdGVkRmlsZVBhdGgpLnRvU3RyaW5nKClcblxuICAgICAgY3JlYXRlUnVsZSA9IChzZWxlY3RvciwgY3NzKSAtPlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHNlbGVjdG9yVGV4dDogc2VsZWN0b3JcbiAgICAgICAgICBjc3NUZXh0OiBcIiN7c2VsZWN0b3J9ICN7Y3NzfVwiXG4gICAgICAgIH1cblxuICAgICAgbWFya2Rvd25QcmV2aWV3U3R5bGVzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIGNyZWF0ZVJ1bGUgXCIubWFya2Rvd24tcHJldmlld1wiLCBcInsgY29sb3I6IG9yYW5nZTsgfVwiXG4gICAgICAgICAgXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIGNyZWF0ZVJ1bGUgXCIubm90LWluY2x1ZGVkXCIsIFwieyBjb2xvcjogZ3JlZW47IH1cIlxuICAgICAgICAgICAgY3JlYXRlUnVsZSBcIi5tYXJrZG93bi1wcmV2aWV3IDpob3N0XCIsIFwieyBjb2xvcjogcHVycGxlOyB9XCJcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cblxuICAgICAgYXRvbVRleHRFZGl0b3JTdHlsZXMgPSBbXG4gICAgICAgIFwiYXRvbS10ZXh0LWVkaXRvciAubGluZSB7IGNvbG9yOiBicm93bjsgfVxcbmF0b20tdGV4dC1lZGl0b3IgLm51bWJlciB7IGNvbG9yOiBjeWFuOyB9XCJcbiAgICAgICAgXCJhdG9tLXRleHQtZWRpdG9yIDpob3N0IC5zb21ldGhpbmcgeyBjb2xvcjogYmxhY2s7IH1cIlxuICAgICAgICBcImF0b20tdGV4dC1lZGl0b3IgLmhyIHsgYmFja2dyb3VuZDogdXJsKGF0b206Ly9tYXJrZG93bi1wcmV2aWV3LXBsdXMvYXNzZXRzL2hyLnBuZyk7IH1cIlxuICAgICAgXVxuXG4gICAgICBleHBlY3QoZnMuaXNGaWxlU3luYyhvdXRwdXRQYXRoKSkudG9CZSBmYWxzZVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgXCJyZW5kZXJNYXJrZG93blwiLCAtPlxuICAgICAgICBwcmV2aWV3LnJlbmRlck1hcmtkb3duKClcblxuICAgICAgdGV4dEVkaXRvciA9IG51bGxcbiAgICAgIG9wZW5lZFByb21pc2UgPSBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub25EaWRBZGRUZXh0RWRpdG9yIChldmVudCkgLT5cbiAgICAgICAgICB0ZXh0RWRpdG9yID0gZXZlbnQudGV4dEVkaXRvclxuICAgICAgICAgIHJlc29sdmUoKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNweU9uKGF0b20sICdzaG93U2F2ZURpYWxvZ1N5bmMnKS5hbmRSZXR1cm4ob3V0cHV0UGF0aClcbiAgICAgICAgc3B5T24ocHJldmlldywgJ2dldERvY3VtZW50U3R5bGVTaGVldHMnKS5hbmRSZXR1cm4obWFya2Rvd25QcmV2aWV3U3R5bGVzKVxuICAgICAgICBzcHlPbihwcmV2aWV3LCAnZ2V0VGV4dEVkaXRvclN0eWxlcycpLmFuZFJldHVybihhdG9tVGV4dEVkaXRvclN0eWxlcylcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCBwcmV2aWV3LmVsZW1lbnQsICdjb3JlOnNhdmUtYXMnXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSBcInRleHQgZWRpdG9yIG9wZW5lZFwiLCAtPlxuICAgICAgICBvcGVuZWRQcm9taXNlXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGZzLmlzRmlsZVN5bmMob3V0cHV0UGF0aCkpLnRvQmUgdHJ1ZVxuICAgICAgICBleHBlY3QoZnMucmVhbHBhdGhTeW5jKHRleHRFZGl0b3IuZ2V0UGF0aCgpKSkudG9CZSBmcy5yZWFscGF0aFN5bmMob3V0cHV0UGF0aClcbiAgICAgICAgc2F2ZWRIVE1MID0gdGV4dEVkaXRvci5nZXRUZXh0KClcbiAgICAgICAgICAucmVwbGFjZSgvPGJvZHkgY2xhc3M9J21hcmtkb3duLXByZXZpZXcnPjxkaXY+LywgJzxib2R5IGNsYXNzPVxcJ21hcmtkb3duLXByZXZpZXdcXCc+JylcbiAgICAgICAgICAucmVwbGFjZSgvXFxuPFxcL2Rpdj48XFwvYm9keT4vLCAnPC9ib2R5PicpXG4gICAgICAgIGV4cGVjdChzYXZlZEhUTUwpLnRvQmUgZXhwZWN0ZWRPdXRwdXQucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKVxuXG4gICAgZGVzY3JpYmUgXCJ0ZXh0IGVkaXRvciBzdHlsZSBleHRyYWN0aW9uXCIsIC0+XG5cbiAgICAgIFtleHRyYWN0ZWRTdHlsZXNdID0gW11cblxuICAgICAgdGV4dEVkaXRvclN0eWxlID0gXCIuZWRpdG9yLXN0eWxlIC5leHRyYWN0aW9uLXRlc3QgeyBjb2xvcjogYmx1ZTsgfVwiXG4gICAgICB1bnJlbGF0ZWRTdHlsZSAgPSBcIi5zb21ldGhpbmcgZWxzZSB7IGNvbG9yOiByZWQ7IH1cIlxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIGF0b20uc3R5bGVzLmFkZFN0eWxlU2hlZXQgdGV4dEVkaXRvclN0eWxlLFxuICAgICAgICAgIGNvbnRleHQ6ICdhdG9tLXRleHQtZWRpdG9yJ1xuXG4gICAgICAgIGF0b20uc3R5bGVzLmFkZFN0eWxlU2hlZXQgdW5yZWxhdGVkU3R5bGUsXG4gICAgICAgICAgY29udGV4dDogJ3VucmVsYXRlZC1jb250ZXh0J1xuXG4gICAgICAgIGV4dHJhY3RlZFN0eWxlcyA9IHByZXZpZXcuZ2V0VGV4dEVkaXRvclN0eWxlcygpXG5cbiAgICAgIGl0IFwicmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGF0b20tdGV4dC1lZGl0b3IgY3NzIHN0eWxlIHN0cmluZ3NcIiwgLT5cbiAgICAgICAgZXhwZWN0KGV4dHJhY3RlZFN0eWxlcy5pbmRleE9mKHRleHRFZGl0b3JTdHlsZSkpLnRvQmVHcmVhdGVyVGhhbigtMSlcblxuICAgICAgaXQgXCJkb2VzIG5vdCByZXR1cm4gb3RoZXIgc3R5bGVzXCIsIC0+XG4gICAgICAgIGV4cGVjdChleHRyYWN0ZWRTdHlsZXMuaW5kZXhPZih1bnJlbGF0ZWRTdHlsZSkpLnRvQmUoLTEpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGNvcmU6Y29weSBpcyB0cmlnZ2VyZWRcIiwgLT5cbiAgICBpdCBcIndyaXRlcyB0aGUgcmVuZGVyZWQgSFRNTCB0byB0aGUgY2xpcGJvYXJkXCIsIC0+XG4gICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuICAgICAgcHJldmlldy5lbGVtZW50LnJlbW92ZSgpXG5cbiAgICAgIGZpbGVQYXRoID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF0ucmVzb2x2ZSgnc3ViZGlyL2NvZGUtYmxvY2subWQnKVxuICAgICAgcHJldmlldyA9IG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHtmaWxlUGF0aH0pXG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHByZXZpZXcuZWxlbWVudClcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHByZXZpZXcucmVuZGVyTWFya2Rvd24oKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggcHJldmlldy5lbGVtZW50LCAnY29yZTpjb3B5J1xuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBhdG9tLmNsaXBib2FyZC5yZWFkKCkgaXNudCBcImluaXRpYWwgY2xpcGJvYXJkIGNvbnRlbnRcIlxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvQmUgXCJcIlwiXG4gICAgICAgICA8aDE+Q29kZSBCbG9jazwvaDE+XG4gICAgICAgICA8cHJlIGNsYXNzPVwiZWRpdG9yLWNvbG9ycyBsYW5nLWphdmFzY3JpcHRcIj48ZGl2IGNsYXNzPVwibGluZVwiPjxzcGFuIGNsYXNzPVwic3ludGF4LS1zb3VyY2Ugc3ludGF4LS1qc1wiPjxzcGFuIGNsYXNzPVwic3ludGF4LS1rZXl3b3JkIHN5bnRheC0tY29udHJvbCBzeW50YXgtLWpzXCI+PHNwYW4+aWY8L3NwYW4+PC9zcGFuPjxzcGFuPiZuYnNwO2EmbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzeW50YXgtLWtleXdvcmQgc3ludGF4LS1vcGVyYXRvciBzeW50YXgtLWNvbXBhcmlzb24gc3ludGF4LS1qc1wiPjxzcGFuPj09PTwvc3Bhbj48L3NwYW4+PHNwYW4+Jm5ic3A7PC9zcGFuPjxzcGFuIGNsYXNzPVwic3ludGF4LS1jb25zdGFudCBzeW50YXgtLW51bWVyaWMgc3ludGF4LS1kZWNpbWFsIHN5bnRheC0tanNcIj48c3Bhbj4zPC9zcGFuPjwvc3Bhbj48c3Bhbj4mbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzeW50YXgtLW1ldGEgc3ludGF4LS1icmFjZSBzeW50YXgtLWN1cmx5IHN5bnRheC0tanNcIj48c3Bhbj57PC9zcGFuPjwvc3Bhbj48L3NwYW4+XG4gICAgICAgICA8L2Rpdj48ZGl2IGNsYXNzPVwibGluZVwiPjxzcGFuIGNsYXNzPVwic3ludGF4LS1zb3VyY2Ugc3ludGF4LS1qc1wiPjxzcGFuPiZuYnNwOyZuYnNwO2ImbmJzcDs8L3NwYW4+PHNwYW4gY2xhc3M9XCJzeW50YXgtLWtleXdvcmQgc3ludGF4LS1vcGVyYXRvciBzeW50YXgtLWFzc2lnbm1lbnQgc3ludGF4LS1qc1wiPjxzcGFuPj08L3NwYW4+PC9zcGFuPjxzcGFuPiZuYnNwOzwvc3Bhbj48c3BhbiBjbGFzcz1cInN5bnRheC0tY29uc3RhbnQgc3ludGF4LS1udW1lcmljIHN5bnRheC0tZGVjaW1hbCBzeW50YXgtLWpzXCI+PHNwYW4+NTwvc3Bhbj48L3NwYW4+PC9zcGFuPlxuICAgICAgICAgPC9kaXY+PGRpdiBjbGFzcz1cImxpbmVcIj48c3BhbiBjbGFzcz1cInN5bnRheC0tc291cmNlIHN5bnRheC0tanNcIj48c3BhbiBjbGFzcz1cInN5bnRheC0tbWV0YSBzeW50YXgtLWJyYWNlIHN5bnRheC0tY3VybHkgc3ludGF4LS1qc1wiPjxzcGFuPn08L3NwYW4+PC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgIDwvZGl2PjwvcHJlPlxuICAgICAgICAgPHA+ZW5jb2Rpbmcg4oaSIGlzc3VlPC9wPlxuICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIndoZW4gbWF0aHMgcmVuZGVyaW5nIGlzIGVuYWJsZWQgYnkgZGVmYXVsdFwiLCAtPlxuICAgIGl0IFwibm90aWZpZXMgdGhlIHVzZXIgTWF0aEpheCBpcyBsb2FkaW5nIHdoZW4gZmlyc3QgcHJldmlldyBpcyBvcGVuZWRcIiwgLT5cbiAgICAgIFt3b3Jrc3BhY2VFbGVtZW50XSA9IFtdXG5cbiAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbm90aWZpY2F0aW9ucycpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgamFzbWluZS5hdHRhY2hUb0RPTSh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBtYXRoamF4SGVscGVyLnJlc2V0TWF0aEpheCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0JywgdHJ1ZVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuXG4gICAgICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUoKVxuXG4gICAgICB3YWl0c0ZvciBcIm5vdGlmaWNhdGlvblwiLCAtPlxuICAgICAgICB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IgJ2F0b20tbm90aWZpY2F0aW9uJ1xuXG4gICAgICBydW5zIC0+XG4gICAgICAgIG5vdGlmaWNhdGlvbiA9IHdvcmtzcGFjZUVsZW1lbnQucXVlcnlTZWxlY3RvciAnYXRvbS1ub3RpZmljYXRpb24uaW5mbydcbiAgICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbikudG9FeGlzdCgpXG4iXX0=
