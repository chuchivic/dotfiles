(function() {
  var $, MarkdownPreviewView, fs, path, temp, wrench;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  wrench = require('wrench');

  MarkdownPreviewView = require('../lib/markdown-preview-view');

  $ = require('atom-space-pen-views').$;

  require('./spec-helper');

  describe("Markdown preview plus package", function() {
    var expectPreviewInSplitPane, preview, ref, workspaceElement;
    ref = [], workspaceElement = ref[0], preview = ref[1];
    beforeEach(function() {
      var fixturesPath, tempPath;
      fixturesPath = path.join(__dirname, 'fixtures');
      tempPath = temp.mkdirSync('atom');
      wrench.copyDirSyncRecursive(fixturesPath, tempPath, {
        forceDelete: true
      });
      atom.project.setPaths([tempPath]);
      jasmine.useRealClock();
      workspaceElement = atom.views.getView(atom.workspace);
      jasmine.attachToDOM(workspaceElement);
      waitsForPromise(function() {
        return atom.packages.activatePackage("markdown-preview-plus");
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-gfm');
      });
    });
    afterEach(function() {
      if (preview instanceof MarkdownPreviewView) {
        preview.destroy();
      }
      return preview = null;
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
    describe("when a preview has not been created for the file", function() {
      it("displays a markdown preview in a split pane", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/file.markdown");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          var editorPane;
          editorPane = atom.workspace.getPanes()[0];
          expect(editorPane.getItems()).toHaveLength(1);
          return expect(editorPane.isActive()).toBe(true);
        });
      });
      describe("when the editor's path does not exist", function() {
        return it("splits the current pane to the right with a markdown preview for the file", function() {
          waitsForPromise(function() {
            return atom.workspace.open("new.markdown");
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          return expectPreviewInSplitPane();
        });
      });
      describe("when the editor does not have a path", function() {
        return it("splits the current pane to the right with a markdown preview for the file", function() {
          waitsForPromise(function() {
            return atom.workspace.open("");
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          return expectPreviewInSplitPane();
        });
      });
      describe("when the path contains a space", function() {
        return it("renders the preview", function() {
          waitsForPromise(function() {
            return atom.workspace.open("subdir/file with space.md");
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          return expectPreviewInSplitPane();
        });
      });
      return describe("when the path contains accented characters", function() {
        return it("renders the preview", function() {
          waitsForPromise(function() {
            return atom.workspace.open("subdir/áccéntéd.md");
          });
          runs(function() {
            return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          });
          return expectPreviewInSplitPane();
        });
      });
    });
    describe("when a preview has been created for the file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/file.markdown");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        return expectPreviewInSplitPane();
      });
      it("closes the existing preview when toggle is triggered a second time on the editor and when the preview is its panes active item", function() {
        var editorPane, previewPane, ref1;
        atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        ref1 = atom.workspace.getPanes(), editorPane = ref1[0], previewPane = ref1[1];
        expect(editorPane.isActive()).toBe(true);
        return expect(previewPane.getActiveItem()).toBeUndefined();
      });
      it("activates the existing preview when toggle is triggered a second time on the editor and when the preview is not its panes active item #nottravis", function() {
        var editorPane, previewPane, ref1;
        ref1 = atom.workspace.getPanes(), editorPane = ref1[0], previewPane = ref1[1];
        editorPane.activate();
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        waitsFor("second markdown preview to be created", function() {
          return previewPane.getItems().length === 2;
        });
        waitsFor("second markdown preview to be activated", function() {
          return previewPane.getActiveItemIndex() === 1;
        });
        runs(function() {
          preview = previewPane.getActiveItem();
          expect(preview).toBeInstanceOf(MarkdownPreviewView);
          expect(preview.getPath()).toBe(editorPane.getActiveItem().getPath());
          expect(preview.getPath()).toBe(atom.workspace.getActivePaneItem().getPath());
          editorPane.activate();
          editorPane.activateItemAtIndex(0);
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        waitsFor("first preview to be activated", function() {
          return previewPane.getActiveItemIndex() === 0;
        });
        return runs(function() {
          preview = previewPane.getActiveItem();
          expect(previewPane.getItems().length).toBe(2);
          expect(preview.getPath()).toBe(editorPane.getActiveItem().getPath());
          return expect(preview.getPath()).toBe(atom.workspace.getActivePaneItem().getPath());
        });
      });
      it("closes the existing preview when toggle is triggered on it and it has focus", function() {
        var editorPane, previewPane, ref1;
        ref1 = atom.workspace.getPanes(), editorPane = ref1[0], previewPane = ref1[1];
        previewPane.activate();
        atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        return expect(previewPane.getActiveItem()).toBeUndefined();
      });
      describe("when the editor is modified", function() {
        it("re-renders the preview", function() {
          var markdownEditor;
          spyOn(preview, 'showLoading');
          markdownEditor = atom.workspace.getActiveTextEditor();
          markdownEditor.setText("Hey!");
          waitsFor(function() {
            return preview.text().indexOf("Hey!") >= 0;
          });
          return runs(function() {
            return expect(preview.showLoading).not.toHaveBeenCalled();
          });
        });
        it("invokes ::onDidChangeMarkdown listeners", function() {
          var listener, markdownEditor;
          markdownEditor = atom.workspace.getActiveTextEditor();
          preview.onDidChangeMarkdown(listener = jasmine.createSpy('didChangeMarkdownListener'));
          runs(function() {
            return markdownEditor.setText("Hey!");
          });
          return waitsFor("::onDidChangeMarkdown handler to be called", function() {
            return listener.callCount > 0;
          });
        });
        describe("when the preview is in the active pane but is not the active item", function() {
          return it("re-renders the preview but does not make it active", function() {
            var markdownEditor, previewPane;
            markdownEditor = atom.workspace.getActiveTextEditor();
            previewPane = atom.workspace.getPanes()[1];
            previewPane.activate();
            waitsForPromise(function() {
              return atom.workspace.open();
            });
            runs(function() {
              return markdownEditor.setText("Hey!");
            });
            waitsFor(function() {
              return preview.text().indexOf("Hey!") >= 0;
            });
            return runs(function() {
              expect(previewPane.isActive()).toBe(true);
              return expect(previewPane.getActiveItem()).not.toBe(preview);
            });
          });
        });
        describe("when the preview is not the active item and not in the active pane", function() {
          return it("re-renders the preview and makes it active", function() {
            var editorPane, markdownEditor, previewPane, ref1;
            markdownEditor = atom.workspace.getActiveTextEditor();
            ref1 = atom.workspace.getPanes(), editorPane = ref1[0], previewPane = ref1[1];
            previewPane.splitRight({
              copyActiveItem: true
            });
            previewPane.activate();
            waitsForPromise(function() {
              return atom.workspace.open();
            });
            runs(function() {
              editorPane.activate();
              return markdownEditor.setText("Hey!");
            });
            waitsFor(function() {
              return preview.text().indexOf("Hey!") >= 0;
            });
            return runs(function() {
              expect(editorPane.isActive()).toBe(true);
              return expect(previewPane.getActiveItem()).toBe(preview);
            });
          });
        });
        return describe("when the liveUpdate config is set to false", function() {
          return it("only re-renders the markdown when the editor is saved, not when the contents are modified", function() {
            var didStopChangingHandler;
            atom.config.set('markdown-preview-plus.liveUpdate', false);
            didStopChangingHandler = jasmine.createSpy('didStopChangingHandler');
            atom.workspace.getActiveTextEditor().getBuffer().onDidStopChanging(didStopChangingHandler);
            atom.workspace.getActiveTextEditor().setText('ch ch changes');
            waitsFor(function() {
              return didStopChangingHandler.callCount > 0;
            });
            runs(function() {
              expect(preview.text()).not.toContain("ch ch changes");
              return atom.workspace.getActiveTextEditor().save();
            });
            return waitsFor(function() {
              return preview.text().indexOf("ch ch changes") >= 0;
            });
          });
        });
      });
      return describe("when a new grammar is loaded", function() {
        return it("re-renders the preview", function() {
          var grammarAdded;
          atom.workspace.getActiveTextEditor().setText("```javascript\nvar x = y;\n```");
          waitsFor("markdown to be rendered after its text changed", function() {
            return preview.find("atom-text-editor").data("grammar") === "text plain null-grammar";
          });
          grammarAdded = false;
          runs(function() {
            return atom.grammars.onDidAddGrammar(function() {
              return grammarAdded = true;
            });
          });
          waitsForPromise(function() {
            expect(atom.packages.isPackageActive('language-javascript')).toBe(false);
            return atom.packages.activatePackage('language-javascript');
          });
          waitsFor("grammar to be added", function() {
            return grammarAdded;
          });
          return waitsFor("markdown to be rendered after grammar was added", function() {
            return preview.find("atom-text-editor").data("grammar") !== "source js";
          });
        });
      });
    });
    describe("when the markdown preview view is requested by file URI", function() {
      return it("opens a preview editor and watches the file for changes", function() {
        waitsForPromise("atom.workspace.open promise to be resolved", function() {
          return atom.workspace.open("markdown-preview-plus://" + (atom.project.getDirectories()[0].resolve('subdir/file.markdown')));
        });
        runs(function() {
          preview = atom.workspace.getActivePaneItem();
          expect(preview).toBeInstanceOf(MarkdownPreviewView);
          spyOn(preview, 'renderMarkdownText');
          return preview.file.emitter.emit('did-change');
        });
        return waitsFor("markdown to be re-rendered after file changed", function() {
          return preview.renderMarkdownText.callCount > 0;
        });
      });
    });
    describe("when the editor's grammar it not enabled for preview", function() {
      return it("does not open the markdown preview", function() {
        atom.config.set('markdown-preview-plus.grammars', []);
        waitsForPromise(function() {
          return atom.workspace.open("subdir/file.markdown");
        });
        return runs(function() {
          spyOn(atom.workspace, 'open').andCallThrough();
          atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
          return expect(atom.workspace.open).not.toHaveBeenCalled();
        });
      });
    });
    describe("when the editor's path changes on #win32 and #darwin", function() {
      return it("updates the preview's title", function() {
        var titleChangedCallback;
        titleChangedCallback = jasmine.createSpy('titleChangedCallback');
        waitsForPromise(function() {
          return atom.workspace.open("subdir/file.markdown");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        runs(function() {
          var filePath;
          expect(preview.getTitle()).toBe('file.markdown Preview');
          preview.onDidChangeTitle(titleChangedCallback);
          filePath = atom.workspace.getActiveTextEditor().getPath();
          return fs.renameSync(filePath, path.join(path.dirname(filePath), 'file2.md'));
        });
        waitsFor(function() {
          return preview.getTitle() === "file2.md Preview";
        });
        return runs(function() {
          expect(titleChangedCallback).toHaveBeenCalled();
          return preview.destroy();
        });
      });
    });
    describe("when the URI opened does not have a markdown-preview-plus protocol", function() {
      return it("does not throw an error trying to decode the URI (regression)", function() {
        waitsForPromise(function() {
          return atom.workspace.open('%');
        });
        return runs(function() {
          return expect(atom.workspace.getActiveTextEditor()).toBeTruthy();
        });
      });
    });
    describe("when markdown-preview-plus:copy-html is triggered", function() {
      it("copies the HTML to the clipboard", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        return runs(function() {
          atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:copy-html');
          expect(atom.clipboard.read()).toBe("<p><em>italic</em></p>\n<p><strong>bold</strong></p>\n<p>encoding \u2192 issue</p>");
          atom.workspace.getActiveTextEditor().setSelectedBufferRange([[0, 0], [1, 0]]);
          atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:copy-html');
          return expect(atom.clipboard.read()).toBe("<p><em>italic</em></p>");
        });
      });
      return describe("code block tokenization", function() {
        preview = null;
        beforeEach(function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-ruby');
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('markdown-preview-plus');
          });
          waitsForPromise(function() {
            return atom.workspace.open("subdir/file.markdown");
          });
          return runs(function() {
            workspaceElement = atom.views.getView(atom.workspace);
            atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:copy-html');
            return preview = $('<div>').append(atom.clipboard.read());
          });
        });
        describe("when the code block's fence name has a matching grammar", function() {
          return it("tokenizes the code block with the grammar", function() {
            return expect(preview.find("pre span.syntax--entity.syntax--name.syntax--function.syntax--ruby")).toExist();
          });
        });
        describe("when the code block's fence name doesn't have a matching grammar", function() {
          return it("does not tokenize the code block", function() {
            return expect(preview.find("pre.lang-kombucha .line .syntax--null-grammar").children().length).toBe(2);
          });
        });
        describe("when the code block contains empty lines", function() {
          return it("doesn't remove the empty lines", function() {
            expect(preview.find("pre.lang-python").children().length).toBe(6);
            expect(preview.find("pre.lang-python div:nth-child(2)").text().trim()).toBe('');
            expect(preview.find("pre.lang-python div:nth-child(4)").text().trim()).toBe('');
            return expect(preview.find("pre.lang-python div:nth-child(5)").text().trim()).toBe('');
          });
        });
        return describe("when the code block is nested in a list", function() {
          return it("detects and styles the block", function() {
            return expect(preview.find("pre.lang-javascript")).toHaveClass('editor-colors');
          });
        });
      });
    });
    describe("when main::copyHtml() is called directly", function() {
      var mpp;
      mpp = null;
      beforeEach(function() {
        return mpp = atom.packages.getActivePackage('markdown-preview-plus').mainModule;
      });
      it("copies the HTML to the clipboard by default", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        return runs(function() {
          mpp.copyHtml();
          expect(atom.clipboard.read()).toBe("<p><em>italic</em></p>\n<p><strong>bold</strong></p>\n<p>encoding \u2192 issue</p>");
          atom.workspace.getActiveTextEditor().setSelectedBufferRange([[0, 0], [1, 0]]);
          mpp.copyHtml();
          return expect(atom.clipboard.read()).toBe("<p><em>italic</em></p>");
        });
      });
      it("passes the HTML to a callback if supplied as the first argument", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        return runs(function() {
          expect(mpp.copyHtml(function(html) {
            return html;
          })).toBe("<p><em>italic</em></p>\n<p><strong>bold</strong></p>\n<p>encoding \u2192 issue</p>");
          atom.workspace.getActiveTextEditor().setSelectedBufferRange([[0, 0], [1, 0]]);
          return expect(mpp.copyHtml(function(html) {
            return html;
          })).toBe("<p><em>italic</em></p>");
        });
      });
      return describe("when LaTeX rendering is enabled by default", function() {
        beforeEach(function() {
          spyOn(atom.clipboard, 'write').andCallThrough();
          waitsFor("LaTeX rendering to be enabled", function() {
            return atom.config.set('markdown-preview-plus.enableLatexRenderingByDefault', true);
          });
          waitsForPromise(function() {
            return atom.workspace.open("subdir/simple.md");
          });
          return runs(function() {
            return atom.workspace.getActiveTextEditor().setText('$$\\int_3^4$$');
          });
        });
        it("copies the HTML with maths blocks as svg's to the clipboard by default", function() {
          mpp.copyHtml();
          waitsFor("atom.clipboard.write to have been called", function() {
            return atom.clipboard.write.callCount === 1;
          });
          return runs(function() {
            var clipboard;
            clipboard = atom.clipboard.read();
            expect(clipboard.match(/MathJax\_SVG\_Hidden/).length).toBe(1);
            return expect(clipboard.match(/class\=\"MathJax\_SVG\"/).length).toBe(1);
          });
        });
        it("scales the svg's if the scaleMath parameter is passed", function() {
          mpp.copyHtml(null, 200);
          waitsFor("atom.clipboard.write to have been called", function() {
            return atom.clipboard.write.callCount === 1;
          });
          return runs(function() {
            var clipboard;
            clipboard = atom.clipboard.read();
            return expect(clipboard.match(/font\-size\: 200%/).length).toBe(1);
          });
        });
        return it("passes the HTML to a callback if supplied as the first argument", function() {
          var html;
          html = null;
          mpp.copyHtml(function(proHTML) {
            return html = proHTML;
          });
          waitsFor("markdown to be parsed and processed by MathJax", function() {
            return html != null;
          });
          return runs(function() {
            expect(html.match(/MathJax\_SVG\_Hidden/).length).toBe(1);
            return expect(html.match(/class\=\"MathJax\_SVG\"/).length).toBe(1);
          });
        });
      });
    });
    describe("sanitization", function() {
      it("removes script tags and attributes that commonly contain inline scripts", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/evil.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          return expect($(preview[0]).find("div.update-preview").html()).toBe("<p>hello</p>\n\n\n<p>sad\n<img>\nworld</p>");
        });
      });
      return it("remove the first <!doctype> tag at the beginning of the file", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/doctype-tag.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          return expect($(preview[0]).find("div.update-preview").html()).toBe("<p>content\n&lt;!doctype html&gt;</p>");
        });
      });
    });
    describe("when the markdown contains an <html> tag", function() {
      return it("does not throw an exception", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/html-tag.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          return expect($(preview[0]).find("div.update-preview").html()).toBe("content");
        });
      });
    });
    describe("when the markdown contains a <pre> tag", function() {
      return it("does not throw an exception", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/pre-tag.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          return expect(preview.find('atom-text-editor')).toExist();
        });
      });
    });
    return describe("GitHub style markdown preview", function() {
      beforeEach(function() {
        return atom.config.set('markdown-preview-plus.useGitHubStyle', false);
      });
      it("renders markdown using the default style when GitHub styling is disabled", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          return expect(preview.element.getAttribute('data-use-github-style')).toBeNull();
        });
      });
      it("renders markdown using the GitHub styling when enabled", function() {
        atom.config.set('markdown-preview-plus.useGitHubStyle', true);
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          return expect(preview.element.getAttribute('data-use-github-style')).toBe('');
        });
      });
      return it("updates the rendering style immediately when the configuration is changed", function() {
        waitsForPromise(function() {
          return atom.workspace.open("subdir/simple.md");
        });
        runs(function() {
          return atom.commands.dispatch(workspaceElement, 'markdown-preview-plus:toggle');
        });
        expectPreviewInSplitPane();
        return runs(function() {
          expect(preview.element.getAttribute('data-use-github-style')).toBeNull();
          atom.config.set('markdown-preview-plus.useGitHubStyle', true);
          expect(preview.element.getAttribute('data-use-github-style')).not.toBeNull();
          atom.config.set('markdown-preview-plus.useGitHubStyle', false);
          return expect(preview.element.getAttribute('data-use-github-style')).toBeNull();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULG1CQUFBLEdBQXNCLE9BQUEsQ0FBUSw4QkFBUjs7RUFDckIsSUFBSyxPQUFBLENBQVEsc0JBQVI7O0VBRU4sT0FBQSxDQUFRLGVBQVI7O0VBRUEsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7QUFDeEMsUUFBQTtJQUFBLE1BQThCLEVBQTlCLEVBQUMseUJBQUQsRUFBbUI7SUFFbkIsVUFBQSxDQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBVixFQUFxQixVQUFyQjtNQUNmLFFBQUEsR0FBVyxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQWY7TUFDWCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsWUFBNUIsRUFBMEMsUUFBMUMsRUFBb0Q7UUFBQSxXQUFBLEVBQWEsSUFBYjtPQUFwRDtNQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixDQUFDLFFBQUQsQ0FBdEI7TUFFQSxPQUFPLENBQUMsWUFBUixDQUFBO01BRUEsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtNQUNuQixPQUFPLENBQUMsV0FBUixDQUFvQixnQkFBcEI7TUFFQSxlQUFBLENBQWdCLFNBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsdUJBQTlCO01B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QkFDQSxNQUFBLENBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFoQixDQUE2Qix1QkFBN0IsQ0FBUCxDQUE2RCxDQUFDLFFBQTlELENBQUE7UUFQRyxDQUFMO01BTDhFLENBQWhGO0lBcEJ3QyxDQUExQztFQTNkd0MsQ0FBMUM7QUFUQSIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xudGVtcCA9IHJlcXVpcmUgJ3RlbXAnXG53cmVuY2ggPSByZXF1aXJlICd3cmVuY2gnXG5NYXJrZG93blByZXZpZXdWaWV3ID0gcmVxdWlyZSAnLi4vbGliL21hcmtkb3duLXByZXZpZXctdmlldydcbnskfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5yZXF1aXJlICcuL3NwZWMtaGVscGVyJ1xuXG5kZXNjcmliZSBcIk1hcmtkb3duIHByZXZpZXcgcGx1cyBwYWNrYWdlXCIsIC0+XG4gIFt3b3Jrc3BhY2VFbGVtZW50LCBwcmV2aWV3XSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGZpeHR1cmVzUGF0aCA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcycpXG4gICAgdGVtcFBhdGggPSB0ZW1wLm1rZGlyU3luYygnYXRvbScpXG4gICAgd3JlbmNoLmNvcHlEaXJTeW5jUmVjdXJzaXZlKGZpeHR1cmVzUGF0aCwgdGVtcFBhdGgsIGZvcmNlRGVsZXRlOiB0cnVlKVxuICAgIGF0b20ucHJvamVjdC5zZXRQYXRocyhbdGVtcFBhdGhdKVxuXG4gICAgamFzbWluZS51c2VSZWFsQ2xvY2soKVxuXG4gICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKFwibWFya2Rvd24tcHJldmlldy1wbHVzXCIpXG5cbiAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1nZm0nKVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIGlmIHByZXZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blByZXZpZXdWaWV3XG4gICAgICBwcmV2aWV3LmRlc3Ryb3koKVxuICAgIHByZXZpZXcgPSBudWxsXG5cbiAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lID0gLT5cbiAgICB3YWl0c0ZvciAtPlxuICAgICAgIyBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0UGFuZXMoKSkudG9IYXZlTGVuZ3RoIDJcbiAgICAgIGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLmdldFBhbmVzKCkubGVuZ3RoIGlzIDJcblxuICAgIHdhaXRzRm9yIFwibWFya2Rvd24gcHJldmlldyB0byBiZSBjcmVhdGVkXCIsIC0+XG4gICAgICBwcmV2aWV3ID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0UGFuZXMoKVsxXS5nZXRBY3RpdmVJdGVtKClcblxuICAgIHJ1bnMgLT5cbiAgICAgIGV4cGVjdChwcmV2aWV3KS50b0JlSW5zdGFuY2VPZihNYXJrZG93blByZXZpZXdWaWV3KVxuICAgICAgZXhwZWN0KHByZXZpZXcuZ2V0UGF0aCgpKS50b0JlIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkuZ2V0UGF0aCgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIGEgcHJldmlldyBoYXMgbm90IGJlZW4gY3JlYXRlZCBmb3IgdGhlIGZpbGVcIiwgLT5cbiAgICBpdCBcImRpc3BsYXlzIGEgbWFya2Rvd24gcHJldmlldyBpbiBhIHNwbGl0IHBhbmVcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL2ZpbGUubWFya2Rvd25cIilcbiAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgW2VkaXRvclBhbmVdID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgICBleHBlY3QoZWRpdG9yUGFuZS5nZXRJdGVtcygpKS50b0hhdmVMZW5ndGggMVxuICAgICAgICBleHBlY3QoZWRpdG9yUGFuZS5pc0FjdGl2ZSgpKS50b0JlIHRydWVcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgZWRpdG9yJ3MgcGF0aCBkb2VzIG5vdCBleGlzdFwiLCAtPlxuICAgICAgaXQgXCJzcGxpdHMgdGhlIGN1cnJlbnQgcGFuZSB0byB0aGUgcmlnaHQgd2l0aCBhIG1hcmtkb3duIHByZXZpZXcgZm9yIHRoZSBmaWxlXCIsIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKFwibmV3Lm1hcmtkb3duXCIpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgZWRpdG9yIGRvZXMgbm90IGhhdmUgYSBwYXRoXCIsIC0+XG4gICAgICBpdCBcInNwbGl0cyB0aGUgY3VycmVudCBwYW5lIHRvIHRoZSByaWdodCB3aXRoIGEgbWFya2Rvd24gcHJldmlldyBmb3IgdGhlIGZpbGVcIiwgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJcIilcbiAgICAgICAgcnVucyAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuICAgICAgICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUoKVxuXG4gICAgIyBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9tYXJrZG93bi1wcmV2aWV3L2lzc3Vlcy8yOFxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgcGF0aCBjb250YWlucyBhIHNwYWNlXCIsIC0+XG4gICAgICBpdCBcInJlbmRlcnMgdGhlIHByZXZpZXdcIiwgLT5cbiAgICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJzdWJkaXIvZmlsZSB3aXRoIHNwYWNlLm1kXCIpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICMgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vbWFya2Rvd24tcHJldmlldy9pc3N1ZXMvMjlcbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIHBhdGggY29udGFpbnMgYWNjZW50ZWQgY2hhcmFjdGVyc1wiLCAtPlxuICAgICAgaXQgXCJyZW5kZXJzIHRoZSBwcmV2aWV3XCIsIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL8OhY2PDqW50w6lkLm1kXCIpXG4gICAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICBkZXNjcmliZSBcIndoZW4gYSBwcmV2aWV3IGhhcyBiZWVuIGNyZWF0ZWQgZm9yIHRoZSBmaWxlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJzdWJkaXIvZmlsZS5tYXJrZG93blwiKVxuICAgICAgcnVucyAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgIGl0IFwiY2xvc2VzIHRoZSBleGlzdGluZyBwcmV2aWV3IHdoZW4gdG9nZ2xlIGlzIHRyaWdnZXJlZCBhIHNlY29uZCB0aW1lIG9uIHRoZSBlZGl0b3IgYW5kIHdoZW4gdGhlIHByZXZpZXcgaXMgaXRzIHBhbmVzIGFjdGl2ZSBpdGVtXCIsIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuXG4gICAgICBbZWRpdG9yUGFuZSwgcHJldmlld1BhbmVdID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgZXhwZWN0KGVkaXRvclBhbmUuaXNBY3RpdmUoKSkudG9CZSB0cnVlXG4gICAgICBleHBlY3QocHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpKS50b0JlVW5kZWZpbmVkKClcblxuICAgIGl0IFwiYWN0aXZhdGVzIHRoZSBleGlzdGluZyBwcmV2aWV3IHdoZW4gdG9nZ2xlIGlzIHRyaWdnZXJlZCBhIHNlY29uZCB0aW1lIG9uIHRoZSBlZGl0b3IgYW5kIHdoZW4gdGhlIHByZXZpZXcgaXMgbm90IGl0cyBwYW5lcyBhY3RpdmUgaXRlbSAjbm90dHJhdmlzXCIsIC0+XG4gICAgICBbZWRpdG9yUGFuZSwgcHJldmlld1BhbmVdID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuXG4gICAgICBlZGl0b3JQYW5lLmFjdGl2YXRlKClcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL3NpbXBsZS5tZFwiKVxuICAgICAgcnVucyAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuXG4gICAgICB3YWl0c0ZvciBcInNlY29uZCBtYXJrZG93biBwcmV2aWV3IHRvIGJlIGNyZWF0ZWRcIiwgLT5cbiAgICAgICAgcHJldmlld1BhbmUuZ2V0SXRlbXMoKS5sZW5ndGggaXMgMlxuXG4gICAgICB3YWl0c0ZvciBcInNlY29uZCBtYXJrZG93biBwcmV2aWV3IHRvIGJlIGFjdGl2YXRlZFwiLCAtPlxuICAgICAgICBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtSW5kZXgoKSBpcyAxXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgcHJldmlldyA9IHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgICBleHBlY3QocHJldmlldykudG9CZUluc3RhbmNlT2YoTWFya2Rvd25QcmV2aWV3VmlldylcbiAgICAgICAgZXhwZWN0KHByZXZpZXcuZ2V0UGF0aCgpKS50b0JlIGVkaXRvclBhbmUuZ2V0QWN0aXZlSXRlbSgpLmdldFBhdGgoKVxuICAgICAgICBleHBlY3QocHJldmlldy5nZXRQYXRoKCkpLnRvQmUgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKS5nZXRQYXRoKClcblxuICAgICAgICBlZGl0b3JQYW5lLmFjdGl2YXRlKClcbiAgICAgICAgZWRpdG9yUGFuZS5hY3RpdmF0ZUl0ZW1BdEluZGV4KDApXG5cbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcblxuICAgICAgd2FpdHNGb3IgXCJmaXJzdCBwcmV2aWV3IHRvIGJlIGFjdGl2YXRlZFwiLCAtPlxuICAgICAgICBwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtSW5kZXgoKSBpcyAwXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgcHJldmlldyA9IHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgICBleHBlY3QocHJldmlld1BhbmUuZ2V0SXRlbXMoKS5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgZXhwZWN0KHByZXZpZXcuZ2V0UGF0aCgpKS50b0JlIGVkaXRvclBhbmUuZ2V0QWN0aXZlSXRlbSgpLmdldFBhdGgoKVxuICAgICAgICBleHBlY3QocHJldmlldy5nZXRQYXRoKCkpLnRvQmUgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKS5nZXRQYXRoKClcblxuICAgIGl0IFwiY2xvc2VzIHRoZSBleGlzdGluZyBwcmV2aWV3IHdoZW4gdG9nZ2xlIGlzIHRyaWdnZXJlZCBvbiBpdCBhbmQgaXQgaGFzIGZvY3VzXCIsIC0+XG4gICAgICBbZWRpdG9yUGFuZSwgcHJldmlld1BhbmVdID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgcHJldmlld1BhbmUuYWN0aXZhdGUoKVxuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuICAgICAgZXhwZWN0KHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKSkudG9CZVVuZGVmaW5lZCgpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gdGhlIGVkaXRvciBpcyBtb2RpZmllZFwiLCAtPlxuICAgICAgaXQgXCJyZS1yZW5kZXJzIHRoZSBwcmV2aWV3XCIsIC0+XG4gICAgICAgIHNweU9uKHByZXZpZXcsICdzaG93TG9hZGluZycpXG5cbiAgICAgICAgbWFya2Rvd25FZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgbWFya2Rvd25FZGl0b3Iuc2V0VGV4dCBcIkhleSFcIlxuXG4gICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgcHJldmlldy50ZXh0KCkuaW5kZXhPZihcIkhleSFcIikgPj0gMFxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QocHJldmlldy5zaG93TG9hZGluZykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgICBpdCBcImludm9rZXMgOjpvbkRpZENoYW5nZU1hcmtkb3duIGxpc3RlbmVyc1wiLCAtPlxuICAgICAgICBtYXJrZG93bkVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBwcmV2aWV3Lm9uRGlkQ2hhbmdlTWFya2Rvd24obGlzdGVuZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkQ2hhbmdlTWFya2Rvd25MaXN0ZW5lcicpKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBtYXJrZG93bkVkaXRvci5zZXRUZXh0KFwiSGV5IVwiKVxuXG4gICAgICAgIHdhaXRzRm9yIFwiOjpvbkRpZENoYW5nZU1hcmtkb3duIGhhbmRsZXIgdG8gYmUgY2FsbGVkXCIsIC0+XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbENvdW50ID4gMFxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIHByZXZpZXcgaXMgaW4gdGhlIGFjdGl2ZSBwYW5lIGJ1dCBpcyBub3QgdGhlIGFjdGl2ZSBpdGVtXCIsIC0+XG4gICAgICAgIGl0IFwicmUtcmVuZGVycyB0aGUgcHJldmlldyBidXQgZG9lcyBub3QgbWFrZSBpdCBhY3RpdmVcIiwgLT5cbiAgICAgICAgICBtYXJrZG93bkVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICAgIHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVsxXVxuICAgICAgICAgIHByZXZpZXdQYW5lLmFjdGl2YXRlKClcblxuICAgICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbigpXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBtYXJrZG93bkVkaXRvci5zZXRUZXh0KFwiSGV5IVwiKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIHByZXZpZXcudGV4dCgpLmluZGV4T2YoXCJIZXkhXCIpID49IDBcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChwcmV2aWV3UGFuZS5pc0FjdGl2ZSgpKS50b0JlIHRydWVcbiAgICAgICAgICAgIGV4cGVjdChwcmV2aWV3UGFuZS5nZXRBY3RpdmVJdGVtKCkpLm5vdC50b0JlIHByZXZpZXdcblxuICAgICAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBwcmV2aWV3IGlzIG5vdCB0aGUgYWN0aXZlIGl0ZW0gYW5kIG5vdCBpbiB0aGUgYWN0aXZlIHBhbmVcIiwgLT5cbiAgICAgICAgaXQgXCJyZS1yZW5kZXJzIHRoZSBwcmV2aWV3IGFuZCBtYWtlcyBpdCBhY3RpdmVcIiwgLT5cbiAgICAgICAgICBtYXJrZG93bkVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICAgIFtlZGl0b3JQYW5lLCBwcmV2aWV3UGFuZV0gPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG4gICAgICAgICAgcHJldmlld1BhbmUuc3BsaXRSaWdodChjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcbiAgICAgICAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZSgpXG5cbiAgICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oKVxuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZWRpdG9yUGFuZS5hY3RpdmF0ZSgpXG4gICAgICAgICAgICBtYXJrZG93bkVkaXRvci5zZXRUZXh0KFwiSGV5IVwiKVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIHByZXZpZXcudGV4dCgpLmluZGV4T2YoXCJIZXkhXCIpID49IDBcblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JQYW5lLmlzQWN0aXZlKCkpLnRvQmUgdHJ1ZVxuICAgICAgICAgICAgZXhwZWN0KHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKSkudG9CZSBwcmV2aWV3XG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgbGl2ZVVwZGF0ZSBjb25maWcgaXMgc2V0IHRvIGZhbHNlXCIsIC0+XG4gICAgICAgIGl0IFwib25seSByZS1yZW5kZXJzIHRoZSBtYXJrZG93biB3aGVuIHRoZSBlZGl0b3IgaXMgc2F2ZWQsIG5vdCB3aGVuIHRoZSBjb250ZW50cyBhcmUgbW9kaWZpZWRcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJywgZmFsc2VcblxuICAgICAgICAgIGRpZFN0b3BDaGFuZ2luZ0hhbmRsZXIgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGlkU3RvcENoYW5naW5nSGFuZGxlcicpXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldEJ1ZmZlcigpLm9uRGlkU3RvcENoYW5naW5nIGRpZFN0b3BDaGFuZ2luZ0hhbmRsZXJcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuc2V0VGV4dCgnY2ggY2ggY2hhbmdlcycpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgZGlkU3RvcENoYW5naW5nSGFuZGxlci5jYWxsQ291bnQgPiAwXG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QocHJldmlldy50ZXh0KCkpLm5vdC50b0NvbnRhaW4oXCJjaCBjaCBjaGFuZ2VzXCIpXG4gICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuc2F2ZSgpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgcHJldmlldy50ZXh0KCkuaW5kZXhPZihcImNoIGNoIGNoYW5nZXNcIikgPj0gMFxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIGEgbmV3IGdyYW1tYXIgaXMgbG9hZGVkXCIsIC0+XG4gICAgICBpdCBcInJlLXJlbmRlcnMgdGhlIHByZXZpZXdcIiwgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLnNldFRleHQgXCJcIlwiXG4gICAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICAgIHZhciB4ID0geTtcbiAgICAgICAgICBgYGBcbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgd2FpdHNGb3IgXCJtYXJrZG93biB0byBiZSByZW5kZXJlZCBhZnRlciBpdHMgdGV4dCBjaGFuZ2VkXCIsIC0+XG4gICAgICAgICAgcHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvclwiKS5kYXRhKFwiZ3JhbW1hclwiKSBpcyBcInRleHQgcGxhaW4gbnVsbC1ncmFtbWFyXCJcblxuICAgICAgICBncmFtbWFyQWRkZWQgPSBmYWxzZVxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIgLT4gZ3JhbW1hckFkZGVkID0gdHJ1ZVxuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGV4cGVjdChhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZSgnbGFuZ3VhZ2UtamF2YXNjcmlwdCcpKS50b0JlIGZhbHNlXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2xhbmd1YWdlLWphdmFzY3JpcHQnKVxuXG4gICAgICAgIHdhaXRzRm9yIFwiZ3JhbW1hciB0byBiZSBhZGRlZFwiLCAtPiBncmFtbWFyQWRkZWRcblxuICAgICAgICB3YWl0c0ZvciBcIm1hcmtkb3duIHRvIGJlIHJlbmRlcmVkIGFmdGVyIGdyYW1tYXIgd2FzIGFkZGVkXCIsIC0+XG4gICAgICAgICAgcHJldmlldy5maW5kKFwiYXRvbS10ZXh0LWVkaXRvclwiKS5kYXRhKFwiZ3JhbW1hclwiKSBpc250IFwic291cmNlIGpzXCJcblxuICBkZXNjcmliZSBcIndoZW4gdGhlIG1hcmtkb3duIHByZXZpZXcgdmlldyBpcyByZXF1ZXN0ZWQgYnkgZmlsZSBVUklcIiwgLT5cbiAgICBpdCBcIm9wZW5zIGEgcHJldmlldyBlZGl0b3IgYW5kIHdhdGNoZXMgdGhlIGZpbGUgZm9yIGNoYW5nZXNcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSBcImF0b20ud29ya3NwYWNlLm9wZW4gcHJvbWlzZSB0byBiZSByZXNvbHZlZFwiLCAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFwibWFya2Rvd24tcHJldmlldy1wbHVzOi8vI3thdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXS5yZXNvbHZlKCdzdWJkaXIvZmlsZS5tYXJrZG93bicpfVwiKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHByZXZpZXcgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgICAgIGV4cGVjdChwcmV2aWV3KS50b0JlSW5zdGFuY2VPZihNYXJrZG93blByZXZpZXdWaWV3KVxuXG4gICAgICAgIHNweU9uKHByZXZpZXcsICdyZW5kZXJNYXJrZG93blRleHQnKVxuICAgICAgICBwcmV2aWV3LmZpbGUuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJylcblxuICAgICAgd2FpdHNGb3IgXCJtYXJrZG93biB0byBiZSByZS1yZW5kZXJlZCBhZnRlciBmaWxlIGNoYW5nZWRcIiwgLT5cbiAgICAgICAgcHJldmlldy5yZW5kZXJNYXJrZG93blRleHQuY2FsbENvdW50ID4gMFxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGUgZWRpdG9yJ3MgZ3JhbW1hciBpdCBub3QgZW5hYmxlZCBmb3IgcHJldmlld1wiLCAtPlxuICAgIGl0IFwiZG9lcyBub3Qgb3BlbiB0aGUgbWFya2Rvd24gcHJldmlld1wiLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZ3JhbW1hcnMnLCBbXSlcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oXCJzdWJkaXIvZmlsZS5tYXJrZG93blwiKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcblxuICBkZXNjcmliZSBcIndoZW4gdGhlIGVkaXRvcidzIHBhdGggY2hhbmdlcyBvbiAjd2luMzIgYW5kICNkYXJ3aW5cIiwgLT5cbiAgICBpdCBcInVwZGF0ZXMgdGhlIHByZXZpZXcncyB0aXRsZVwiLCAtPlxuICAgICAgdGl0bGVDaGFuZ2VkQ2FsbGJhY2sgPSBqYXNtaW5lLmNyZWF0ZVNweSgndGl0bGVDaGFuZ2VkQ2FsbGJhY2snKVxuXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcInN1YmRpci9maWxlLm1hcmtkb3duXCIpXG4gICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG5cbiAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHByZXZpZXcuZ2V0VGl0bGUoKSkudG9CZSAnZmlsZS5tYXJrZG93biBQcmV2aWV3J1xuICAgICAgICBwcmV2aWV3Lm9uRGlkQ2hhbmdlVGl0bGUodGl0bGVDaGFuZ2VkQ2FsbGJhY2spXG4gICAgICAgIGZpbGVQYXRoID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFBhdGgoKVxuICAgICAgICBmcy5yZW5hbWVTeW5jKGZpbGVQYXRoLCBwYXRoLmpvaW4ocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgJ2ZpbGUyLm1kJykpXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIHByZXZpZXcuZ2V0VGl0bGUoKSBpcyBcImZpbGUyLm1kIFByZXZpZXdcIlxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdCh0aXRsZUNoYW5nZWRDYWxsYmFjaykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIHByZXZpZXcuZGVzdHJveSgpXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSBVUkkgb3BlbmVkIGRvZXMgbm90IGhhdmUgYSBtYXJrZG93bi1wcmV2aWV3LXBsdXMgcHJvdG9jb2xcIiwgLT5cbiAgICBpdCBcImRvZXMgbm90IHRocm93IGFuIGVycm9yIHRyeWluZyB0byBkZWNvZGUgdGhlIFVSSSAocmVncmVzc2lvbilcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCclJylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpKS50b0JlVHJ1dGh5KClcblxuICBkZXNjcmliZSBcIndoZW4gbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCBpcyB0cmlnZ2VyZWRcIiwgLT5cbiAgICBpdCBcImNvcGllcyB0aGUgSFRNTCB0byB0aGUgY2xpcGJvYXJkXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihcInN1YmRpci9zaW1wbGUubWRcIilcblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJ1xuICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0JlIFwiXCJcIlxuICAgICAgICAgIDxwPjxlbT5pdGFsaWM8L2VtPjwvcD5cbiAgICAgICAgICA8cD48c3Ryb25nPmJvbGQ8L3N0cm9uZz48L3A+XG4gICAgICAgICAgPHA+ZW5jb2RpbmcgXFx1MjE5MiBpc3N1ZTwvcD5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UgW1swLCAwXSwgWzEsIDBdXVxuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJ1xuICAgICAgICBleHBlY3QoYXRvbS5jbGlwYm9hcmQucmVhZCgpKS50b0JlIFwiXCJcIlxuICAgICAgICAgIDxwPjxlbT5pdGFsaWM8L2VtPjwvcD5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImNvZGUgYmxvY2sgdG9rZW5pemF0aW9uXCIsIC0+XG4gICAgICBwcmV2aWV3ID0gbnVsbFxuXG4gICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdsYW5ndWFnZS1ydWJ5JylcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWFya2Rvd24tcHJldmlldy1wbHVzJylcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL2ZpbGUubWFya2Rvd25cIilcblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6Y29weS1odG1sJ1xuICAgICAgICAgIHByZXZpZXcgPSAkKCc8ZGl2PicpLmFwcGVuZChhdG9tLmNsaXBib2FyZC5yZWFkKCkpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY29kZSBibG9jaydzIGZlbmNlIG5hbWUgaGFzIGEgbWF0Y2hpbmcgZ3JhbW1hclwiLCAtPlxuICAgICAgICBpdCBcInRva2VuaXplcyB0aGUgY29kZSBibG9jayB3aXRoIHRoZSBncmFtbWFyXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KHByZXZpZXcuZmluZChcInByZSBzcGFuLnN5bnRheC0tZW50aXR5LnN5bnRheC0tbmFtZS5zeW50YXgtLWZ1bmN0aW9uLnN5bnRheC0tcnVieVwiKSkudG9FeGlzdCgpXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY29kZSBibG9jaydzIGZlbmNlIG5hbWUgZG9lc24ndCBoYXZlIGEgbWF0Y2hpbmcgZ3JhbW1hclwiLCAtPlxuICAgICAgICBpdCBcImRvZXMgbm90IHRva2VuaXplIHRoZSBjb2RlIGJsb2NrXCIsIC0+XG4gICAgICAgICAgZXhwZWN0KHByZXZpZXcuZmluZChcInByZS5sYW5nLWtvbWJ1Y2hhIC5saW5lIC5zeW50YXgtLW51bGwtZ3JhbW1hclwiKS5jaGlsZHJlbigpLmxlbmd0aCkudG9CZSAyXG5cbiAgICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgY29kZSBibG9jayBjb250YWlucyBlbXB0eSBsaW5lc1wiLCAtPlxuICAgICAgICBpdCBcImRvZXNuJ3QgcmVtb3ZlIHRoZSBlbXB0eSBsaW5lc1wiLCAtPlxuICAgICAgICAgIGV4cGVjdChwcmV2aWV3LmZpbmQoXCJwcmUubGFuZy1weXRob25cIikuY2hpbGRyZW4oKS5sZW5ndGgpLnRvQmUgNlxuICAgICAgICAgIGV4cGVjdChwcmV2aWV3LmZpbmQoXCJwcmUubGFuZy1weXRob24gZGl2Om50aC1jaGlsZCgyKVwiKS50ZXh0KCkudHJpbSgpKS50b0JlICcnXG4gICAgICAgICAgZXhwZWN0KHByZXZpZXcuZmluZChcInByZS5sYW5nLXB5dGhvbiBkaXY6bnRoLWNoaWxkKDQpXCIpLnRleHQoKS50cmltKCkpLnRvQmUgJydcbiAgICAgICAgICBleHBlY3QocHJldmlldy5maW5kKFwicHJlLmxhbmctcHl0aG9uIGRpdjpudGgtY2hpbGQoNSlcIikudGV4dCgpLnRyaW0oKSkudG9CZSAnJ1xuXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGhlIGNvZGUgYmxvY2sgaXMgbmVzdGVkIGluIGEgbGlzdFwiLCAtPlxuICAgICAgICBpdCBcImRldGVjdHMgYW5kIHN0eWxlcyB0aGUgYmxvY2tcIiwgLT5cbiAgICAgICAgICBleHBlY3QocHJldmlldy5maW5kKFwicHJlLmxhbmctamF2YXNjcmlwdFwiKSkudG9IYXZlQ2xhc3MgJ2VkaXRvci1jb2xvcnMnXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIG1haW46OmNvcHlIdG1sKCkgaXMgY2FsbGVkIGRpcmVjdGx5XCIsIC0+XG4gICAgbXBwID0gbnVsbFxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgbXBwID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdtYXJrZG93bi1wcmV2aWV3LXBsdXMnKS5tYWluTW9kdWxlXG5cbiAgICBpdCBcImNvcGllcyB0aGUgSFRNTCB0byB0aGUgY2xpcGJvYXJkIGJ5IGRlZmF1bHRcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL3NpbXBsZS5tZFwiKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIG1wcC5jb3B5SHRtbCgpXG4gICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvQmUgXCJcIlwiXG4gICAgICAgICAgPHA+PGVtPml0YWxpYzwvZW0+PC9wPlxuICAgICAgICAgIDxwPjxzdHJvbmc+Ym9sZDwvc3Ryb25nPjwvcD5cbiAgICAgICAgICA8cD5lbmNvZGluZyBcXHUyMTkyIGlzc3VlPC9wPlxuICAgICAgICBcIlwiXCJcblxuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSBbWzAsIDBdLCBbMSwgMF1dXG4gICAgICAgIG1wcC5jb3B5SHRtbCgpXG4gICAgICAgIGV4cGVjdChhdG9tLmNsaXBib2FyZC5yZWFkKCkpLnRvQmUgXCJcIlwiXG4gICAgICAgICAgPHA+PGVtPml0YWxpYzwvZW0+PC9wPlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwicGFzc2VzIHRoZSBIVE1MIHRvIGEgY2FsbGJhY2sgaWYgc3VwcGxpZWQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50XCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihcInN1YmRpci9zaW1wbGUubWRcIilcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QobXBwLmNvcHlIdG1sKCAoaHRtbCkgLT4gaHRtbCApKS50b0JlIFwiXCJcIlxuICAgICAgICAgIDxwPjxlbT5pdGFsaWM8L2VtPjwvcD5cbiAgICAgICAgICA8cD48c3Ryb25nPmJvbGQ8L3N0cm9uZz48L3A+XG4gICAgICAgICAgPHA+ZW5jb2RpbmcgXFx1MjE5MiBpc3N1ZTwvcD5cbiAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UgW1swLCAwXSwgWzEsIDBdXVxuICAgICAgICBleHBlY3QobXBwLmNvcHlIdG1sKCAoaHRtbCkgLT4gaHRtbCApKS50b0JlIFwiXCJcIlxuICAgICAgICAgIDxwPjxlbT5pdGFsaWM8L2VtPjwvcD5cbiAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcIndoZW4gTGFUZVggcmVuZGVyaW5nIGlzIGVuYWJsZWQgYnkgZGVmYXVsdFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzcHlPbihhdG9tLmNsaXBib2FyZCwgJ3dyaXRlJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIHdhaXRzRm9yIFwiTGFUZVggcmVuZGVyaW5nIHRvIGJlIGVuYWJsZWRcIiwgLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCcsIHRydWVcblxuICAgICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL3NpbXBsZS5tZFwiKVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuc2V0VGV4dCAnJCRcXFxcaW50XzNeNCQkJ1xuXG4gICAgICBpdCBcImNvcGllcyB0aGUgSFRNTCB3aXRoIG1hdGhzIGJsb2NrcyBhcyBzdmcncyB0byB0aGUgY2xpcGJvYXJkIGJ5IGRlZmF1bHRcIiwgLT5cbiAgICAgICAgbXBwLmNvcHlIdG1sKClcblxuICAgICAgICB3YWl0c0ZvciBcImF0b20uY2xpcGJvYXJkLndyaXRlIHRvIGhhdmUgYmVlbiBjYWxsZWRcIiwgLT5cbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZS5jYWxsQ291bnQgaXMgMVxuXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBjbGlwYm9hcmQgPSBhdG9tLmNsaXBib2FyZC5yZWFkKClcbiAgICAgICAgICBleHBlY3QoY2xpcGJvYXJkLm1hdGNoKC9NYXRoSmF4XFxfU1ZHXFxfSGlkZGVuLykubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGNsaXBib2FyZC5tYXRjaCgvY2xhc3NcXD1cXFwiTWF0aEpheFxcX1NWR1xcXCIvKS5sZW5ndGgpLnRvQmUoMSlcblxuICAgICAgaXQgXCJzY2FsZXMgdGhlIHN2ZydzIGlmIHRoZSBzY2FsZU1hdGggcGFyYW1ldGVyIGlzIHBhc3NlZFwiLCAtPlxuICAgICAgICBtcHAuY29weUh0bWwobnVsbCwgMjAwKVxuXG4gICAgICAgIHdhaXRzRm9yIFwiYXRvbS5jbGlwYm9hcmQud3JpdGUgdG8gaGF2ZSBiZWVuIGNhbGxlZFwiLCAtPlxuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlLmNhbGxDb3VudCBpcyAxXG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGNsaXBib2FyZCA9IGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuICAgICAgICAgIGV4cGVjdChjbGlwYm9hcmQubWF0Y2goL2ZvbnRcXC1zaXplXFw6IDIwMCUvKS5sZW5ndGgpLnRvQmUoMSlcblxuICAgICAgaXQgXCJwYXNzZXMgdGhlIEhUTUwgdG8gYSBjYWxsYmFjayBpZiBzdXBwbGllZCBhcyB0aGUgZmlyc3QgYXJndW1lbnRcIiwgLT5cbiAgICAgICAgaHRtbCA9IG51bGxcbiAgICAgICAgbXBwLmNvcHlIdG1sIChwcm9IVE1MKSAtPlxuICAgICAgICAgIGh0bWwgPSBwcm9IVE1MXG5cbiAgICAgICAgd2FpdHNGb3IgXCJtYXJrZG93biB0byBiZSBwYXJzZWQgYW5kIHByb2Nlc3NlZCBieSBNYXRoSmF4XCIsIC0+IGh0bWw/XG5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChodG1sLm1hdGNoKC9NYXRoSmF4XFxfU1ZHXFxfSGlkZGVuLykubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGh0bWwubWF0Y2goL2NsYXNzXFw9XFxcIk1hdGhKYXhcXF9TVkdcXFwiLykubGVuZ3RoKS50b0JlKDEpXG5cbiAgZGVzY3JpYmUgXCJzYW5pdGl6YXRpb25cIiwgLT5cbiAgICBpdCBcInJlbW92ZXMgc2NyaXB0IHRhZ3MgYW5kIGF0dHJpYnV0ZXMgdGhhdCBjb21tb25seSBjb250YWluIGlubGluZSBzY3JpcHRzXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcInN1YmRpci9ldmlsLm1kXCIpXG4gICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG4gICAgICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUoKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdCgkKHByZXZpZXdbMF0pLmZpbmQoXCJkaXYudXBkYXRlLXByZXZpZXdcIikuaHRtbCgpKS50b0JlIFwiXCJcIlxuICAgICAgICAgIDxwPmhlbGxvPC9wPlxuXG5cbiAgICAgICAgICA8cD5zYWRcbiAgICAgICAgICA8aW1nPlxuICAgICAgICAgIHdvcmxkPC9wPlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwicmVtb3ZlIHRoZSBmaXJzdCA8IWRvY3R5cGU+IHRhZyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcInN1YmRpci9kb2N0eXBlLXRhZy5tZFwiKVxuICAgICAgcnVucyAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoJChwcmV2aWV3WzBdKS5maW5kKFwiZGl2LnVwZGF0ZS1wcmV2aWV3XCIpLmh0bWwoKSkudG9CZSBcIlwiXCJcbiAgICAgICAgICA8cD5jb250ZW50XG4gICAgICAgICAgJmx0OyFkb2N0eXBlIGh0bWwmZ3Q7PC9wPlxuICAgICAgICBcIlwiXCJcblxuICBkZXNjcmliZSBcIndoZW4gdGhlIG1hcmtkb3duIGNvbnRhaW5zIGFuIDxodG1sPiB0YWdcIiwgLT5cbiAgICBpdCBcImRvZXMgbm90IHRocm93IGFuIGV4Y2VwdGlvblwiLCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJzdWJkaXIvaHRtbC10YWcubWRcIilcbiAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgIHJ1bnMgLT4gZXhwZWN0KCQocHJldmlld1swXSkuZmluZChcImRpdi51cGRhdGUtcHJldmlld1wiKS5odG1sKCkpLnRvQmUgXCJjb250ZW50XCJcblxuICBkZXNjcmliZSBcIndoZW4gdGhlIG1hcmtkb3duIGNvbnRhaW5zIGEgPHByZT4gdGFnXCIsIC0+XG4gICAgaXQgXCJkb2VzIG5vdCB0aHJvdyBhbiBleGNlcHRpb25cIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL3ByZS10YWcubWRcIilcbiAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgIHJ1bnMgLT4gZXhwZWN0KHByZXZpZXcuZmluZCgnYXRvbS10ZXh0LWVkaXRvcicpKS50b0V4aXN0KClcblxuICAjIFdBUk5JTkcgSWYgZm9jdXMgaXMgZ2l2ZW4gdG8gdGhpcyBzcGVjIGFsb25lIHlvdXIgYGNvbmZpZy5jc29uYCBtYXkgYmVcbiAgIyBvdmVyd3JpdHRlbi4gUGxlYXNlIGVuc3VyZSB0aGF0IHlvdSBoYXZlIHlvdXJzIGJhY2tlZCB1cCA6RFxuICBkZXNjcmliZSBcIkdpdEh1YiBzdHlsZSBtYXJrZG93biBwcmV2aWV3XCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLCBmYWxzZVxuXG4gICAgaXQgXCJyZW5kZXJzIG1hcmtkb3duIHVzaW5nIHRoZSBkZWZhdWx0IHN0eWxlIHdoZW4gR2l0SHViIHN0eWxpbmcgaXMgZGlzYWJsZWRcIiwgLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPiBhdG9tLndvcmtzcGFjZS5vcGVuKFwic3ViZGlyL3NpbXBsZS5tZFwiKVxuICAgICAgcnVucyAtPiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJ1xuICAgICAgZXhwZWN0UHJldmlld0luU3BsaXRQYW5lKClcblxuICAgICAgcnVucyAtPiBleHBlY3QocHJldmlldy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJykpLnRvQmVOdWxsKClcblxuICAgIGl0IFwicmVuZGVycyBtYXJrZG93biB1c2luZyB0aGUgR2l0SHViIHN0eWxpbmcgd2hlbiBlbmFibGVkXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsIHRydWVcblxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJzdWJkaXIvc2ltcGxlLm1kXCIpXG4gICAgICBydW5zIC0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUnXG4gICAgICBleHBlY3RQcmV2aWV3SW5TcGxpdFBhbmUoKVxuXG4gICAgICBydW5zIC0+IGV4cGVjdChwcmV2aWV3LmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKSkudG9CZSAnJ1xuXG4gICAgaXQgXCJ1cGRhdGVzIHRoZSByZW5kZXJpbmcgc3R5bGUgaW1tZWRpYXRlbHkgd2hlbiB0aGUgY29uZmlndXJhdGlvbiBpcyBjaGFuZ2VkXCIsIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT4gYXRvbS53b3Jrc3BhY2Uub3BlbihcInN1YmRpci9zaW1wbGUubWRcIilcbiAgICAgIHJ1bnMgLT4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSdcbiAgICAgIGV4cGVjdFByZXZpZXdJblNwbGl0UGFuZSgpXG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KHByZXZpZXcuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScpKS50b0JlTnVsbCgpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLCB0cnVlXG4gICAgICAgIGV4cGVjdChwcmV2aWV3LmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKSkubm90LnRvQmVOdWxsKClcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsIGZhbHNlXG4gICAgICAgIGV4cGVjdChwcmV2aWV3LmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXVzZS1naXRodWItc3R5bGUnKSkudG9CZU51bGwoKVxuIl19
