(function() {
  var MarkdownPreviewView, fs, isMarkdownPreviewView, mathjaxHelper, renderer, url,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  url = require('url');

  fs = require('fs-plus');

  MarkdownPreviewView = null;

  renderer = null;

  mathjaxHelper = null;

  isMarkdownPreviewView = function(object) {
    if (MarkdownPreviewView == null) {
      MarkdownPreviewView = require('./markdown-preview-view');
    }
    return object instanceof MarkdownPreviewView;
  };

  module.exports = {
    config: {
      breakOnSingleNewline: {
        type: 'boolean',
        "default": false,
        order: 0
      },
      liveUpdate: {
        type: 'boolean',
        "default": true,
        order: 10
      },
      openPreviewInSplitPane: {
        type: 'boolean',
        "default": true,
        order: 20
      },
      previewSplitPaneDir: {
        title: 'Direction to load the preview in split pane',
        type: 'string',
        "default": 'right',
        "enum": ['down', 'right'],
        order: 25
      },
      grammars: {
        type: 'array',
        "default": ['source.gfm', 'source.litcoffee', 'text.html.basic', 'text.md', 'text.plain', 'text.plain.null-grammar'],
        order: 30
      },
      enableLatexRenderingByDefault: {
        title: 'Enable Math Rendering By Default',
        type: 'boolean',
        "default": false,
        order: 40
      },
      useLazyHeaders: {
        title: 'Use Lazy Headers',
        description: 'Require no space after headings #',
        type: 'boolean',
        "default": true,
        order: 45
      },
      useGitHubStyle: {
        title: 'Use GitHub.com style',
        type: 'boolean',
        "default": false,
        order: 50
      },
      enablePandoc: {
        type: 'boolean',
        "default": false,
        title: 'Enable Pandoc Parser',
        order: 100
      },
      useNativePandocCodeStyles: {
        type: 'boolean',
        "default": false,
        description: 'Don\'t convert fenced code blocks to Atom editors when using\nPandoc parser',
        order: 105
      },
      pandocPath: {
        type: 'string',
        "default": 'pandoc',
        title: 'Pandoc Options: Path',
        description: 'Please specify the correct path to your pandoc executable',
        dependencies: ['enablePandoc'],
        order: 110
      },
      pandocArguments: {
        type: 'array',
        "default": [],
        title: 'Pandoc Options: Commandline Arguments',
        description: 'Comma separated pandoc arguments e.g. `--smart, --filter=/bin/exe`. Please use long argument names.',
        dependencies: ['enablePandoc'],
        order: 120
      },
      pandocMarkdownFlavor: {
        type: 'string',
        "default": 'markdown-raw_tex+tex_math_single_backslash',
        title: 'Pandoc Options: Markdown Flavor',
        description: 'Enter the pandoc markdown flavor you want',
        dependencies: ['enablePandoc'],
        order: 130
      },
      pandocBibliography: {
        type: 'boolean',
        "default": false,
        title: 'Pandoc Options: Citations',
        description: 'Enable this for bibliography parsing',
        dependencies: ['enablePandoc'],
        order: 140
      },
      pandocRemoveReferences: {
        type: 'boolean',
        "default": true,
        title: 'Pandoc Options: Remove References',
        description: 'Removes references at the end of the HTML preview',
        dependencies: ['pandocBibliography'],
        order: 150
      },
      pandocBIBFile: {
        type: 'string',
        "default": 'bibliography.bib',
        title: 'Pandoc Options: Bibliography (bibfile)',
        description: 'Name of bibfile to search for recursively',
        dependencies: ['pandocBibliography'],
        order: 160
      },
      pandocBIBFileFallback: {
        type: 'string',
        "default": '',
        title: 'Pandoc Options: Fallback Bibliography (bibfile)',
        description: 'Full path to fallback bibfile',
        dependencies: ['pandocBibliography'],
        order: 165
      },
      pandocCSLFile: {
        type: 'string',
        "default": 'custom.csl',
        title: 'Pandoc Options: Bibliography Style (cslfile)',
        description: 'Name of cslfile to search for recursively',
        dependencies: ['pandocBibliography'],
        order: 170
      },
      pandocCSLFileFallback: {
        type: 'string',
        "default": '',
        title: 'Pandoc Options: Fallback Bibliography Style (cslfile)',
        description: 'Full path to fallback cslfile',
        dependencies: ['pandocBibliography'],
        order: 175
      }
    },
    activate: function() {
      var previewFile;
      if (parseFloat(atom.getVersion()) < 1.7) {
        atom.deserializers.add({
          name: 'MarkdownPreviewView',
          deserialize: module.exports.createMarkdownPreviewView.bind(module.exports)
        });
      }
      atom.commands.add('atom-workspace', {
        'markdown-preview-plus:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this),
        'markdown-preview-plus:copy-html': (function(_this) {
          return function() {
            return _this.copyHtml();
          };
        })(this),
        'markdown-preview-plus:toggle-break-on-single-newline': function() {
          var keyPath;
          keyPath = 'markdown-preview-plus.breakOnSingleNewline';
          return atom.config.set(keyPath, !atom.config.get(keyPath));
        }
      });
      previewFile = this.previewFile.bind(this);
      atom.commands.add('.tree-view .file .name[data-name$=\\.markdown]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.md]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mdown]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkd]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.mkdown]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.ron]', 'markdown-preview-plus:preview-file', previewFile);
      atom.commands.add('.tree-view .file .name[data-name$=\\.txt]', 'markdown-preview-plus:preview-file', previewFile);
      return atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var error, host, pathname, protocol, ref;
          try {
            ref = url.parse(uriToOpen), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
          } catch (error1) {
            error = error1;
            return;
          }
          if (protocol !== 'markdown-preview-plus:') {
            return;
          }
          try {
            if (pathname) {
              pathname = decodeURI(pathname);
            }
          } catch (error1) {
            error = error1;
            return;
          }
          if (host === 'editor') {
            return _this.createMarkdownPreviewView({
              editorId: pathname.substring(1)
            });
          } else {
            return _this.createMarkdownPreviewView({
              filePath: pathname
            });
          }
        };
      })(this));
    },
    createMarkdownPreviewView: function(state) {
      if (state.editorId || fs.isFileSync(state.filePath)) {
        if (MarkdownPreviewView == null) {
          MarkdownPreviewView = require('./markdown-preview-view');
        }
        return new MarkdownPreviewView(state);
      }
    },
    toggle: function() {
      var editor, grammars, ref, ref1;
      if (isMarkdownPreviewView(atom.workspace.getActivePaneItem())) {
        atom.workspace.destroyActivePaneItem();
        return;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      grammars = (ref = atom.config.get('markdown-preview-plus.grammars')) != null ? ref : [];
      if (ref1 = editor.getGrammar().scopeName, indexOf.call(grammars, ref1) < 0) {
        return;
      }
      if (!this.removePreviewForEditor(editor)) {
        return this.addPreviewForEditor(editor);
      }
    },
    uriForEditor: function(editor) {
      return "markdown-preview-plus://editor/" + editor.id;
    },
    removePreviewForEditor: function(editor) {
      var preview, previewPane, uri;
      uri = this.uriForEditor(editor);
      previewPane = atom.workspace.paneForURI(uri);
      if (previewPane != null) {
        preview = previewPane.itemForURI(uri);
        if (preview !== previewPane.getActiveItem()) {
          previewPane.activateItem(preview);
          return false;
        }
        previewPane.destroyItem(preview);
        return true;
      } else {
        return false;
      }
    },
    addPreviewForEditor: function(editor) {
      var options, previousActivePane, uri;
      uri = this.uriForEditor(editor);
      previousActivePane = atom.workspace.getActivePane();
      options = {
        searchAllPanes: true
      };
      if (atom.config.get('markdown-preview-plus.openPreviewInSplitPane')) {
        options.split = atom.config.get('markdown-preview-plus.previewSplitPaneDir');
      }
      return atom.workspace.open(uri, options).then(function(markdownPreviewView) {
        if (isMarkdownPreviewView(markdownPreviewView)) {
          return previousActivePane.activate();
        }
      });
    },
    previewFile: function(arg) {
      var editor, filePath, i, len, ref, target;
      target = arg.target;
      filePath = target.dataset.path;
      if (!filePath) {
        return;
      }
      ref = atom.workspace.getTextEditors();
      for (i = 0, len = ref.length; i < len; i++) {
        editor = ref[i];
        if (!(editor.getPath() === filePath)) {
          continue;
        }
        this.addPreviewForEditor(editor);
        return;
      }
      return atom.workspace.open("markdown-preview-plus://" + (encodeURI(filePath)), {
        searchAllPanes: true
      });
    },
    copyHtml: function(callback, scaleMath) {
      var editor, renderLaTeX, text;
      if (callback == null) {
        callback = atom.clipboard.write.bind(atom.clipboard);
      }
      if (scaleMath == null) {
        scaleMath = 100;
      }
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      if (renderer == null) {
        renderer = require('./renderer');
      }
      text = editor.getSelectedText() || editor.getText();
      renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
      return renderer.toHTML(text, editor.getPath(), editor.getGrammar(), renderLaTeX, true, function(error, html) {
        if (error) {
          return console.warn('Copying Markdown as HTML failed', error);
        } else if (renderLaTeX) {
          if (mathjaxHelper == null) {
            mathjaxHelper = require('./mathjax-helper');
          }
          return mathjaxHelper.processHTMLString(html, function(proHTML) {
            proHTML = proHTML.replace(/MathJax\_SVG.*?font\-size\: 100%/g, function(match) {
              return match.replace(/font\-size\: 100%/, "font-size: " + scaleMath + "%");
            });
            return callback(proHTML);
          });
        } else {
          return callback(html);
        }
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEVBQUE7SUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ04sRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLG1CQUFBLEdBQXNCOztFQUN0QixRQUFBLEdBQVc7O0VBQ1gsYUFBQSxHQUFnQjs7RUFFaEIscUJBQUEsR0FBd0IsU0FBQyxNQUFEOztNQUN0QixzQkFBdUIsT0FBQSxDQUFRLHlCQUFSOztXQUN2QixNQUFBLFlBQWtCO0VBRkk7O0VBSXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxvQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtPQURGO01BSUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sRUFGUDtPQUxGO01BUUEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLEVBRlA7T0FURjtNQVlBLG1CQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sNkNBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUhOO1FBSUEsS0FBQSxFQUFPLEVBSlA7T0FiRjtNQWtCQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMs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Z0QsS0FBaEQsRUFERjtTQUFBLE1BRUssSUFBRyxXQUFIOztZQUNILGdCQUFpQixPQUFBLENBQVEsa0JBQVI7O2lCQUNqQixhQUFhLENBQUMsaUJBQWQsQ0FBZ0MsSUFBaEMsRUFBc0MsU0FBQyxPQUFEO1lBQ3BDLE9BQUEsR0FBVSxPQUFPLENBQUMsT0FBUixDQUFnQixtQ0FBaEIsRUFBcUQsU0FBQyxLQUFEO3FCQUM3RCxLQUFLLENBQUMsT0FBTixDQUFjLG1CQUFkLEVBQW1DLGFBQUEsR0FBYyxTQUFkLEdBQXdCLEdBQTNEO1lBRDZELENBQXJEO21CQUVWLFFBQUEsQ0FBUyxPQUFUO1VBSG9DLENBQXRDLEVBRkc7U0FBQSxNQUFBO2lCQU9ILFFBQUEsQ0FBUyxJQUFULEVBUEc7O01BSHlFLENBQWhGO0lBUFEsQ0E1TlY7O0FBWkYiLCJzb3VyY2VzQ29udGVudCI6WyJ1cmwgPSByZXF1aXJlICd1cmwnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cbk1hcmtkb3duUHJldmlld1ZpZXcgPSBudWxsXG5yZW5kZXJlciA9IG51bGxcbm1hdGhqYXhIZWxwZXIgPSBudWxsXG5cbmlzTWFya2Rvd25QcmV2aWV3VmlldyA9IChvYmplY3QpIC0+XG4gIE1hcmtkb3duUHJldmlld1ZpZXcgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG4gIG9iamVjdCBpbnN0YW5jZW9mIE1hcmtkb3duUHJldmlld1ZpZXdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgYnJlYWtPblNpbmdsZU5ld2xpbmU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMFxuICAgIGxpdmVVcGRhdGU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAxMFxuICAgIG9wZW5QcmV2aWV3SW5TcGxpdFBhbmU6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIG9yZGVyOiAyMFxuICAgIHByZXZpZXdTcGxpdFBhbmVEaXI6XG4gICAgICB0aXRsZTogJ0RpcmVjdGlvbiB0byBsb2FkIHRoZSBwcmV2aWV3IGluIHNwbGl0IHBhbmUnXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ3JpZ2h0J1xuICAgICAgZW51bTogWydkb3duJywgJ3JpZ2h0J11cbiAgICAgIG9yZGVyOiAyNVxuICAgIGdyYW1tYXJzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW1xuICAgICAgICAnc291cmNlLmdmbSdcbiAgICAgICAgJ3NvdXJjZS5saXRjb2ZmZWUnXG4gICAgICAgICd0ZXh0Lmh0bWwuYmFzaWMnXG4gICAgICAgICd0ZXh0Lm1kJ1xuICAgICAgICAndGV4dC5wbGFpbidcbiAgICAgICAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJ1xuICAgICAgXVxuICAgICAgb3JkZXI6IDMwXG4gICAgZW5hYmxlTGF0ZXhSZW5kZXJpbmdCeURlZmF1bHQ6XG4gICAgICB0aXRsZTogJ0VuYWJsZSBNYXRoIFJlbmRlcmluZyBCeSBEZWZhdWx0J1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDQwXG4gICAgdXNlTGF6eUhlYWRlcnM6XG4gICAgICB0aXRsZTogJ1VzZSBMYXp5IEhlYWRlcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ1JlcXVpcmUgbm8gc3BhY2UgYWZ0ZXIgaGVhZGluZ3MgIydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDQ1XG4gICAgdXNlR2l0SHViU3R5bGU6XG4gICAgICB0aXRsZTogJ1VzZSBHaXRIdWIuY29tIHN0eWxlJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgb3JkZXI6IDUwXG4gICAgZW5hYmxlUGFuZG9jOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgdGl0bGU6ICdFbmFibGUgUGFuZG9jIFBhcnNlcidcbiAgICAgIG9yZGVyOiAxMDBcbiAgICB1c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246ICcnJ1xuICAgICAgICBEb24ndCBjb252ZXJ0IGZlbmNlZCBjb2RlIGJsb2NrcyB0byBBdG9tIGVkaXRvcnMgd2hlbiB1c2luZ1xuICAgICAgICBQYW5kb2MgcGFyc2VyJycnXG4gICAgICBvcmRlcjogMTA1XG4gICAgcGFuZG9jUGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAncGFuZG9jJ1xuICAgICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogUGF0aCdcbiAgICAgIGRlc2NyaXB0aW9uOiAnUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCB0byB5b3VyIHBhbmRvYyBleGVjdXRhYmxlJ1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddXG4gICAgICBvcmRlcjogMTEwXG4gICAgcGFuZG9jQXJndW1lbnRzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW11cbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IENvbW1hbmRsaW5lIEFyZ3VtZW50cydcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJ1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddXG4gICAgICBvcmRlcjogMTIwXG4gICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ21hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaCdcbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IE1hcmtkb3duIEZsYXZvcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ11cbiAgICAgIG9yZGVyOiAxMzBcbiAgICBwYW5kb2NCaWJsaW9ncmFwaHk6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBDaXRhdGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZydcbiAgICAgIGRlcGVuZGVuY2llczogWydlbmFibGVQYW5kb2MnXVxuICAgICAgb3JkZXI6IDE0MFxuICAgIHBhbmRvY1JlbW92ZVJlZmVyZW5jZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IFJlbW92ZSBSZWZlcmVuY2VzJ1xuICAgICAgZGVzY3JpcHRpb246ICdSZW1vdmVzIHJlZmVyZW5jZXMgYXQgdGhlIGVuZCBvZiB0aGUgSFRNTCBwcmV2aWV3J1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddXG4gICAgICBvcmRlcjogMTUwXG4gICAgcGFuZG9jQklCRmlsZTpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnYmlibGlvZ3JhcGh5LmJpYidcbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEJpYmxpb2dyYXBoeSAoYmliZmlsZSknXG4gICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgYmliZmlsZSB0byBzZWFyY2ggZm9yIHJlY3Vyc2l2ZWx5J1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddXG4gICAgICBvcmRlcjogMTYwXG4gICAgcGFuZG9jQklCRmlsZUZhbGxiYWNrOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBGYWxsYmFjayBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdGdWxsIHBhdGggdG8gZmFsbGJhY2sgYmliZmlsZSdcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE2NVxuICAgIHBhbmRvY0NTTEZpbGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2N1c3RvbS5jc2wnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgU3R5bGUgKGNzbGZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGNzbGZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseSdcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE3MFxuICAgIHBhbmRvY0NTTEZpbGVGYWxsYmFjazpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogRmFsbGJhY2sgQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGNzbGZpbGUnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J11cbiAgICAgIG9yZGVyOiAxNzVcblxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIGlmIHBhcnNlRmxvYXQoYXRvbS5nZXRWZXJzaW9uKCkpIDwgMS43XG4gICAgICBhdG9tLmRlc2VyaWFsaXplcnMuYWRkXG4gICAgICAgIG5hbWU6ICdNYXJrZG93blByZXZpZXdWaWV3J1xuICAgICAgICBkZXNlcmlhbGl6ZTogbW9kdWxlLmV4cG9ydHMuY3JlYXRlTWFya2Rvd25QcmV2aWV3Vmlldy5iaW5kKG1vZHVsZS5leHBvcnRzKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlJzogPT5cbiAgICAgICAgQHRvZ2dsZSgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOmNvcHktaHRtbCc6ID0+XG4gICAgICAgIEBjb3B5SHRtbCgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZS1icmVhay1vbi1zaW5nbGUtbmV3bGluZSc6IC0+XG4gICAgICAgIGtleVBhdGggPSAnbWFya2Rvd24tcHJldmlldy1wbHVzLmJyZWFrT25TaW5nbGVOZXdsaW5lJ1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoa2V5UGF0aCwgbm90IGF0b20uY29uZmlnLmdldChrZXlQYXRoKSlcblxuICAgIHByZXZpZXdGaWxlID0gQHByZXZpZXdGaWxlLmJpbmQodGhpcylcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWFya2Rvd25dJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5tZF0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1kb3duXScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWtkXScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWtkb3duXScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwucm9uXScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwudHh0XScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcblxuICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpVG9PcGVuKSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHtwcm90b2NvbCwgaG9zdCwgcGF0aG5hbWV9ID0gdXJsLnBhcnNlKHVyaVRvT3BlbilcbiAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgIHJldHVyblxuXG4gICAgICByZXR1cm4gdW5sZXNzIHByb3RvY29sIGlzICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6J1xuXG4gICAgICB0cnlcbiAgICAgICAgcGF0aG5hbWUgPSBkZWNvZGVVUkkocGF0aG5hbWUpIGlmIHBhdGhuYW1lXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgaG9zdCBpcyAnZWRpdG9yJ1xuICAgICAgICBAY3JlYXRlTWFya2Rvd25QcmV2aWV3VmlldyhlZGl0b3JJZDogcGF0aG5hbWUuc3Vic3RyaW5nKDEpKVxuICAgICAgZWxzZVxuICAgICAgICBAY3JlYXRlTWFya2Rvd25QcmV2aWV3VmlldyhmaWxlUGF0aDogcGF0aG5hbWUpXG5cbiAgY3JlYXRlTWFya2Rvd25QcmV2aWV3VmlldzogKHN0YXRlKSAtPlxuICAgIGlmIHN0YXRlLmVkaXRvcklkIG9yIGZzLmlzRmlsZVN5bmMoc3RhdGUuZmlsZVBhdGgpXG4gICAgICBNYXJrZG93blByZXZpZXdWaWV3ID89IHJlcXVpcmUgJy4vbWFya2Rvd24tcHJldmlldy12aWV3J1xuICAgICAgbmV3IE1hcmtkb3duUHJldmlld1ZpZXcoc3RhdGUpXG5cbiAgdG9nZ2xlOiAtPlxuICAgIGlmIGlzTWFya2Rvd25QcmV2aWV3VmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpKVxuICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmVJdGVtKClcbiAgICAgIHJldHVyblxuXG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3I/XG5cbiAgICBncmFtbWFycyA9IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmdyYW1tYXJzJykgPyBbXVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUgaW4gZ3JhbW1hcnNcblxuICAgIEBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcikgdW5sZXNzIEByZW1vdmVQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcblxuICB1cmlGb3JFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly9lZGl0b3IvI3tlZGl0b3IuaWR9XCJcblxuICByZW1vdmVQcmV2aWV3Rm9yRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIHVyaSA9IEB1cmlGb3JFZGl0b3IoZWRpdG9yKVxuICAgIHByZXZpZXdQYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSSh1cmkpXG4gICAgaWYgcHJldmlld1BhbmU/XG4gICAgICBwcmV2aWV3ID0gcHJldmlld1BhbmUuaXRlbUZvclVSSSh1cmkpXG4gICAgICBpZiBwcmV2aWV3IGlzbnQgcHJldmlld1BhbmUuZ2V0QWN0aXZlSXRlbSgpXG4gICAgICAgIHByZXZpZXdQYW5lLmFjdGl2YXRlSXRlbShwcmV2aWV3KVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIHByZXZpZXdQYW5lLmRlc3Ryb3lJdGVtKHByZXZpZXcpXG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuICBhZGRQcmV2aWV3Rm9yRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIHVyaSA9IEB1cmlGb3JFZGl0b3IoZWRpdG9yKVxuICAgIHByZXZpb3VzQWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIG9wdGlvbnMgPVxuICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWVcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5vcGVuUHJldmlld0luU3BsaXRQYW5lJylcbiAgICAgIG9wdGlvbnMuc3BsaXQgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5wcmV2aWV3U3BsaXRQYW5lRGlyJylcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHVyaSwgb3B0aW9ucykudGhlbiAobWFya2Rvd25QcmV2aWV3VmlldykgLT5cbiAgICAgIGlmIGlzTWFya2Rvd25QcmV2aWV3VmlldyhtYXJrZG93blByZXZpZXdWaWV3KVxuICAgICAgICBwcmV2aW91c0FjdGl2ZVBhbmUuYWN0aXZhdGUoKVxuXG4gIHByZXZpZXdGaWxlOiAoe3RhcmdldH0pIC0+XG4gICAgZmlsZVBhdGggPSB0YXJnZXQuZGF0YXNldC5wYXRoXG4gICAgcmV0dXJuIHVubGVzcyBmaWxlUGF0aFxuXG4gICAgZm9yIGVkaXRvciBpbiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpIHdoZW4gZWRpdG9yLmdldFBhdGgoKSBpcyBmaWxlUGF0aFxuICAgICAgQGFkZFByZXZpZXdGb3JFZGl0b3IoZWRpdG9yKVxuICAgICAgcmV0dXJuXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIFwibWFya2Rvd24tcHJldmlldy1wbHVzOi8vI3tlbmNvZGVVUkkoZmlsZVBhdGgpfVwiLCBzZWFyY2hBbGxQYW5lczogdHJ1ZVxuXG4gIGNvcHlIdG1sOiAoY2FsbGJhY2sgPSBhdG9tLmNsaXBib2FyZC53cml0ZS5iaW5kKGF0b20uY2xpcGJvYXJkKSwgc2NhbGVNYXRoID0gMTAwKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuXG4gICAgcmVuZGVyZXIgPz0gcmVxdWlyZSAnLi9yZW5kZXJlcidcbiAgICB0ZXh0ID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpIG9yIGVkaXRvci5nZXRUZXh0KClcbiAgICByZW5kZXJMYVRlWCA9IGF0b20uY29uZmlnLmdldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0J1xuICAgIHJlbmRlcmVyLnRvSFRNTCB0ZXh0LCBlZGl0b3IuZ2V0UGF0aCgpLCBlZGl0b3IuZ2V0R3JhbW1hcigpLCByZW5kZXJMYVRlWCwgdHJ1ZSwgKGVycm9yLCBodG1sKSAtPlxuICAgICAgaWYgZXJyb3JcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3B5aW5nIE1hcmtkb3duIGFzIEhUTUwgZmFpbGVkJywgZXJyb3IpXG4gICAgICBlbHNlIGlmIHJlbmRlckxhVGVYXG4gICAgICAgIG1hdGhqYXhIZWxwZXIgPz0gcmVxdWlyZSAnLi9tYXRoamF4LWhlbHBlcidcbiAgICAgICAgbWF0aGpheEhlbHBlci5wcm9jZXNzSFRNTFN0cmluZyBodG1sLCAocHJvSFRNTCkgLT5cbiAgICAgICAgICBwcm9IVE1MID0gcHJvSFRNTC5yZXBsYWNlIC9NYXRoSmF4XFxfU1ZHLio/Zm9udFxcLXNpemVcXDogMTAwJS9nLCAobWF0Y2gpIC0+XG4gICAgICAgICAgICBtYXRjaC5yZXBsYWNlIC9mb250XFwtc2l6ZVxcOiAxMDAlLywgXCJmb250LXNpemU6ICN7c2NhbGVNYXRofSVcIlxuICAgICAgICAgIGNhbGxiYWNrKHByb0hUTUwpXG4gICAgICBlbHNlXG4gICAgICAgIGNhbGxiYWNrKGh0bWwpXG4iXX0=
