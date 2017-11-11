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
      pandocFilters: {
        type: 'array',
        "default": [],
        title: 'Pandoc Options: Filters',
        description: 'Comma separated pandoc filters, in order of application. Will be passed via command-line arguments',
        dependencies: ['enablePandoc'],
        order: 115
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
        description: 'Enable this for bibliography parsing.\nNote: pandoc-citeproc is applied after other filters specified in\nFilters, but before other commandline arguments',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEVBQUE7SUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ04sRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLG1CQUFBLEdBQXNCOztFQUN0QixRQUFBLEdBQVc7O0VBQ1gsYUFBQSxHQUFnQjs7RUFFaEIscUJBQUEsR0FBd0IsU0FBQyxNQUFEOztNQUN0QixzQkFBdUIsT0FBQSxDQUFRLHlCQUFSOztXQUN2QixNQUFBLFlBQWtCO0VBRkk7O0VBSXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxvQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtPQURGO01BSUEsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sRUFGUDtPQUxGO01BUUEsc0JBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLEVBRlA7T0FURjtNQVlBLG1CQUFBLEVBQ0U7UUFBQSxLQUFBLEVBQU8sNkNBQVA7UUFDQSxJQUFBLEVBQU0sUUFETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsT0FGVDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUhOO1FBSUEsS0FBQSxFQUFPLEVBSlA7T0FiRjtNQWtCQSxRQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMs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QUFzQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQXRCLEVBQXdDLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBeEMsRUFBNkQsV0FBN0QsRUFBMEUsSUFBMUUsRUFBZ0YsU0FBQyxLQUFELEVBQVEsSUFBUjtRQUM5RSxJQUFHLEtBQUg7aUJBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxpQ0FBYixFQUFnRCxLQUFoRCxFQURGO1NBQUEsTUFFSyxJQUFHLFdBQUg7O1lBQ0gsZ0JBQWlCLE9BQUEsQ0FBUSxrQkFBUjs7aUJBQ2pCLGFBQWEsQ0FBQyxpQkFBZCxDQUFnQyxJQUFoQyxFQUFzQyxTQUFDLE9BQUQ7WUFDcEMsT0FBQSxHQUFVLE9BQU8sQ0FBQyxPQUFSLENBQWdCLG1DQUFoQixFQUFxRCxTQUFDLEtBQUQ7cUJBQzdELEtBQUssQ0FBQyxPQUFOLENBQWMsbUJBQWQsRUFBbUMsYUFBQSxHQUFjLFNBQWQsR0FBd0IsR0FBM0Q7WUFENkQsQ0FBckQ7bUJBRVYsUUFBQSxDQUFTLE9BQVQ7VUFIb0MsQ0FBdEMsRUFGRztTQUFBLE1BQUE7aUJBT0gsUUFBQSxDQUFTLElBQVQsRUFQRzs7TUFIeUUsQ0FBaEY7SUFQUSxDQXZPVjs7QUFaRiIsInNvdXJjZXNDb250ZW50IjpbInVybCA9IHJlcXVpcmUgJ3VybCdcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxuTWFya2Rvd25QcmV2aWV3VmlldyA9IG51bGxcbnJlbmRlcmVyID0gbnVsbFxubWF0aGpheEhlbHBlciA9IG51bGxcblxuaXNNYXJrZG93blByZXZpZXdWaWV3ID0gKG9iamVjdCkgLT5cbiAgTWFya2Rvd25QcmV2aWV3VmlldyA/PSByZXF1aXJlICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbiAgb2JqZWN0IGluc3RhbmNlb2YgTWFya2Rvd25QcmV2aWV3Vmlld1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICBicmVha09uU2luZ2xlTmV3bGluZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAwXG4gICAgbGl2ZVVwZGF0ZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDEwXG4gICAgb3BlblByZXZpZXdJblNwbGl0UGFuZTpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDIwXG4gICAgcHJldmlld1NwbGl0UGFuZURpcjpcbiAgICAgIHRpdGxlOiAnRGlyZWN0aW9uIHRvIGxvYWQgdGhlIHByZXZpZXcgaW4gc3BsaXQgcGFuZSdcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAncmlnaHQnXG4gICAgICBlbnVtOiBbJ2Rvd24nLCAncmlnaHQnXVxuICAgICAgb3JkZXI6IDI1XG4gICAgZ3JhbW1hcnM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbXG4gICAgICAgICdzb3VyY2UuZ2ZtJ1xuICAgICAgICAnc291cmNlLmxpdGNvZmZlZSdcbiAgICAgICAgJ3RleHQuaHRtbC5iYXNpYydcbiAgICAgICAgJ3RleHQubWQnXG4gICAgICAgICd0ZXh0LnBsYWluJ1xuICAgICAgICAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInXG4gICAgICBdXG4gICAgICBvcmRlcjogMzBcbiAgICBlbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdDpcbiAgICAgIHRpdGxlOiAnRW5hYmxlIE1hdGggUmVuZGVyaW5nIEJ5IERlZmF1bHQnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogNDBcbiAgICB1c2VMYXp5SGVhZGVyczpcbiAgICAgIHRpdGxlOiAnVXNlIExhenkgSGVhZGVycydcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVxdWlyZSBubyBzcGFjZSBhZnRlciBoZWFkaW5ncyAjJ1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogNDVcbiAgICB1c2VHaXRIdWJTdHlsZTpcbiAgICAgIHRpdGxlOiAnVXNlIEdpdEh1Yi5jb20gc3R5bGUnXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogNTBcbiAgICBlbmFibGVQYW5kb2M6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB0aXRsZTogJ0VuYWJsZSBQYW5kb2MgUGFyc2VyJ1xuICAgICAgb3JkZXI6IDEwMFxuICAgIHVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBkZXNjcmlwdGlvbjogJycnXG4gICAgICAgIERvbid0IGNvbnZlcnQgZmVuY2VkIGNvZGUgYmxvY2tzIHRvIEF0b20gZWRpdG9ycyB3aGVuIHVzaW5nXG4gICAgICAgIFBhbmRvYyBwYXJzZXInJydcbiAgICAgIG9yZGVyOiAxMDVcbiAgICBwYW5kb2NQYXRoOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdwYW5kb2MnXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBQYXRoJ1xuICAgICAgZGVzY3JpcHRpb246ICdQbGVhc2Ugc3BlY2lmeSB0aGUgY29ycmVjdCBwYXRoIHRvIHlvdXIgcGFuZG9jIGV4ZWN1dGFibGUnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ11cbiAgICAgIG9yZGVyOiAxMTBcbiAgICBwYW5kb2NGaWx0ZXJzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW11cbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEZpbHRlcnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbW1hIHNlcGFyYXRlZCBwYW5kb2MgZmlsdGVycywgaW4gb3JkZXIgb2YgYXBwbGljYXRpb24uIFdpbGwgYmUgcGFzc2VkIHZpYSBjb21tYW5kLWxpbmUgYXJndW1lbnRzJ1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddXG4gICAgICBvcmRlcjogMTE1XG4gICAgcGFuZG9jQXJndW1lbnRzOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogW11cbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IENvbW1hbmRsaW5lIEFyZ3VtZW50cydcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29tbWEgc2VwYXJhdGVkIHBhbmRvYyBhcmd1bWVudHMgZS5nLiBgLS1zbWFydCwgLS1maWx0ZXI9L2Jpbi9leGVgLiBQbGVhc2UgdXNlIGxvbmcgYXJndW1lbnQgbmFtZXMuJ1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ2VuYWJsZVBhbmRvYyddXG4gICAgICBvcmRlcjogMTIwXG4gICAgcGFuZG9jTWFya2Rvd25GbGF2b3I6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ21hcmtkb3duLXJhd190ZXgrdGV4X21hdGhfc2luZ2xlX2JhY2tzbGFzaCdcbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IE1hcmtkb3duIEZsYXZvcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW50ZXIgdGhlIHBhbmRvYyBtYXJrZG93biBmbGF2b3IgeW91IHdhbnQnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ11cbiAgICAgIG9yZGVyOiAxMzBcbiAgICBwYW5kb2NCaWJsaW9ncmFwaHk6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBDaXRhdGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJycnXG4gICAgICAgIEVuYWJsZSB0aGlzIGZvciBiaWJsaW9ncmFwaHkgcGFyc2luZy5cbiAgICAgICAgTm90ZTogcGFuZG9jLWNpdGVwcm9jIGlzIGFwcGxpZWQgYWZ0ZXIgb3RoZXIgZmlsdGVycyBzcGVjaWZpZWQgaW5cbiAgICAgICAgRmlsdGVycywgYnV0IGJlZm9yZSBvdGhlciBjb21tYW5kbGluZSBhcmd1bWVudHNcbiAgICAgICAgJycnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsnZW5hYmxlUGFuZG9jJ11cbiAgICAgIG9yZGVyOiAxNDBcbiAgICBwYW5kb2NSZW1vdmVSZWZlcmVuY2VzOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBSZW1vdmUgUmVmZXJlbmNlcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnUmVtb3ZlcyByZWZlcmVuY2VzIGF0IHRoZSBlbmQgb2YgdGhlIEhUTUwgcHJldmlldydcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE1MFxuICAgIHBhbmRvY0JJQkZpbGU6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ2JpYmxpb2dyYXBoeS5iaWInXG4gICAgICB0aXRsZTogJ1BhbmRvYyBPcHRpb25zOiBCaWJsaW9ncmFwaHkgKGJpYmZpbGUpJ1xuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIGJpYmZpbGUgdG8gc2VhcmNoIGZvciByZWN1cnNpdmVseSdcbiAgICAgIGRlcGVuZGVuY2llczogWydwYW5kb2NCaWJsaW9ncmFwaHknXVxuICAgICAgb3JkZXI6IDE2MFxuICAgIHBhbmRvY0JJQkZpbGVGYWxsYmFjazpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogRmFsbGJhY2sgQmlibGlvZ3JhcGh5IChiaWJmaWxlKSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnRnVsbCBwYXRoIHRvIGZhbGxiYWNrIGJpYmZpbGUnXG4gICAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J11cbiAgICAgIG9yZGVyOiAxNjVcbiAgICBwYW5kb2NDU0xGaWxlOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdjdXN0b20uY3NsJ1xuICAgICAgdGl0bGU6ICdQYW5kb2MgT3B0aW9uczogQmlibGlvZ3JhcGh5IFN0eWxlIChjc2xmaWxlKSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiBjc2xmaWxlIHRvIHNlYXJjaCBmb3IgcmVjdXJzaXZlbHknXG4gICAgICBkZXBlbmRlbmNpZXM6IFsncGFuZG9jQmlibGlvZ3JhcGh5J11cbiAgICAgIG9yZGVyOiAxNzBcbiAgICBwYW5kb2NDU0xGaWxlRmFsbGJhY2s6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIHRpdGxlOiAnUGFuZG9jIE9wdGlvbnM6IEZhbGxiYWNrIEJpYmxpb2dyYXBoeSBTdHlsZSAoY3NsZmlsZSknXG4gICAgICBkZXNjcmlwdGlvbjogJ0Z1bGwgcGF0aCB0byBmYWxsYmFjayBjc2xmaWxlJ1xuICAgICAgZGVwZW5kZW5jaWVzOiBbJ3BhbmRvY0JpYmxpb2dyYXBoeSddXG4gICAgICBvcmRlcjogMTc1XG5cblxuICBhY3RpdmF0ZTogLT5cbiAgICBpZiBwYXJzZUZsb2F0KGF0b20uZ2V0VmVyc2lvbigpKSA8IDEuN1xuICAgICAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZFxuICAgICAgICBuYW1lOiAnTWFya2Rvd25QcmV2aWV3VmlldydcbiAgICAgICAgZGVzZXJpYWxpemU6IG1vZHVsZS5leHBvcnRzLmNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcuYmluZChtb2R1bGUuZXhwb3J0cylcblxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnRvZ2dsZSc6ID0+XG4gICAgICAgIEB0b2dnbGUoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpjb3B5LWh0bWwnOiA9PlxuICAgICAgICBAY29weUh0bWwoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtYnJlYWstb24tc2luZ2xlLW5ld2xpbmUnOiAtPlxuICAgICAgICBrZXlQYXRoID0gJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZSdcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KGtleVBhdGgsIG5vdCBhdG9tLmNvbmZpZy5nZXQoa2V5UGF0aCkpXG5cbiAgICBwcmV2aWV3RmlsZSA9IEBwcmV2aWV3RmlsZS5iaW5kKHRoaXMpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1hcmtkb3duXScsICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cHJldmlldy1maWxlJywgcHJldmlld0ZpbGVcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWRdJywgJ21hcmtkb3duLXByZXZpZXctcGx1czpwcmV2aWV3LWZpbGUnLCBwcmV2aWV3RmlsZVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5tZG93bl0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1rZF0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1rZG93bl0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLnJvbl0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJy50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLnR4dF0nLCAnbWFya2Rvd24tcHJldmlldy1wbHVzOnByZXZpZXctZmlsZScsIHByZXZpZXdGaWxlXG5cbiAgICBhdG9tLndvcmtzcGFjZS5hZGRPcGVuZXIgKHVyaVRvT3BlbikgPT5cbiAgICAgIHRyeVxuICAgICAgICB7cHJvdG9jb2wsIGhvc3QsIHBhdGhuYW1lfSA9IHVybC5wYXJzZSh1cmlUb09wZW4pXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZXR1cm5cblxuICAgICAgcmV0dXJuIHVubGVzcyBwcm90b2NvbCBpcyAnbWFya2Rvd24tcHJldmlldy1wbHVzOidcblxuICAgICAgdHJ5XG4gICAgICAgIHBhdGhuYW1lID0gZGVjb2RlVVJJKHBhdGhuYW1lKSBpZiBwYXRobmFtZVxuICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGlmIGhvc3QgaXMgJ2VkaXRvcidcbiAgICAgICAgQGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoZWRpdG9ySWQ6IHBhdGhuYW1lLnN1YnN0cmluZygxKSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXcoZmlsZVBhdGg6IHBhdGhuYW1lKVxuXG4gIGNyZWF0ZU1hcmtkb3duUHJldmlld1ZpZXc6IChzdGF0ZSkgLT5cbiAgICBpZiBzdGF0ZS5lZGl0b3JJZCBvciBmcy5pc0ZpbGVTeW5jKHN0YXRlLmZpbGVQYXRoKVxuICAgICAgTWFya2Rvd25QcmV2aWV3VmlldyA/PSByZXF1aXJlICcuL21hcmtkb3duLXByZXZpZXctdmlldydcbiAgICAgIG5ldyBNYXJrZG93blByZXZpZXdWaWV3KHN0YXRlKVxuXG4gIHRvZ2dsZTogLT5cbiAgICBpZiBpc01hcmtkb3duUHJldmlld1ZpZXcoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSlcbiAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lSXRlbSgpXG4gICAgICByZXR1cm5cblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuXG4gICAgZ3JhbW1hcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5ncmFtbWFycycpID8gW11cbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lIGluIGdyYW1tYXJzXG5cbiAgICBAYWRkUHJldmlld0ZvckVkaXRvcihlZGl0b3IpIHVubGVzcyBAcmVtb3ZlUHJldmlld0ZvckVkaXRvcihlZGl0b3IpXG5cbiAgdXJpRm9yRWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIFwibWFya2Rvd24tcHJldmlldy1wbHVzOi8vZWRpdG9yLyN7ZWRpdG9yLmlkfVwiXG5cbiAgcmVtb3ZlUHJldmlld0ZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICB1cmkgPSBAdXJpRm9yRWRpdG9yKGVkaXRvcilcbiAgICBwcmV2aWV3UGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkodXJpKVxuICAgIGlmIHByZXZpZXdQYW5lP1xuICAgICAgcHJldmlldyA9IHByZXZpZXdQYW5lLml0ZW1Gb3JVUkkodXJpKVxuICAgICAgaWYgcHJldmlldyBpc250IHByZXZpZXdQYW5lLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgICBwcmV2aWV3UGFuZS5hY3RpdmF0ZUl0ZW0ocHJldmlldylcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICBwcmV2aWV3UGFuZS5kZXN0cm95SXRlbShwcmV2aWV3KVxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgYWRkUHJldmlld0ZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICB1cmkgPSBAdXJpRm9yRWRpdG9yKGVkaXRvcilcbiAgICBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBvcHRpb25zID1cbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMub3BlblByZXZpZXdJblNwbGl0UGFuZScpXG4gICAgICBvcHRpb25zLnNwbGl0ID0gYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMucHJldmlld1NwbGl0UGFuZURpcicpXG4gICAgYXRvbS53b3Jrc3BhY2Uub3Blbih1cmksIG9wdGlvbnMpLnRoZW4gKG1hcmtkb3duUHJldmlld1ZpZXcpIC0+XG4gICAgICBpZiBpc01hcmtkb3duUHJldmlld1ZpZXcobWFya2Rvd25QcmV2aWV3VmlldylcbiAgICAgICAgcHJldmlvdXNBY3RpdmVQYW5lLmFjdGl2YXRlKClcblxuICBwcmV2aWV3RmlsZTogKHt0YXJnZXR9KSAtPlxuICAgIGZpbGVQYXRoID0gdGFyZ2V0LmRhdGFzZXQucGF0aFxuICAgIHJldHVybiB1bmxlc3MgZmlsZVBhdGhcblxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKSB3aGVuIGVkaXRvci5nZXRQYXRoKCkgaXMgZmlsZVBhdGhcbiAgICAgIEBhZGRQcmV2aWV3Rm9yRWRpdG9yKGVkaXRvcilcbiAgICAgIHJldHVyblxuXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBcIm1hcmtkb3duLXByZXZpZXctcGx1czovLyN7ZW5jb2RlVVJJKGZpbGVQYXRoKX1cIiwgc2VhcmNoQWxsUGFuZXM6IHRydWVcblxuICBjb3B5SHRtbDogKGNhbGxiYWNrID0gYXRvbS5jbGlwYm9hcmQud3JpdGUuYmluZChhdG9tLmNsaXBib2FyZCksIHNjYWxlTWF0aCA9IDEwMCkgLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gdW5sZXNzIGVkaXRvcj9cblxuICAgIHJlbmRlcmVyID89IHJlcXVpcmUgJy4vcmVuZGVyZXInXG4gICAgdGV4dCA9IGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSBvciBlZGl0b3IuZ2V0VGV4dCgpXG4gICAgcmVuZGVyTGFUZVggPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCdcbiAgICByZW5kZXJlci50b0hUTUwgdGV4dCwgZWRpdG9yLmdldFBhdGgoKSwgZWRpdG9yLmdldEdyYW1tYXIoKSwgcmVuZGVyTGFUZVgsIHRydWUsIChlcnJvciwgaHRtbCkgLT5cbiAgICAgIGlmIGVycm9yXG4gICAgICAgIGNvbnNvbGUud2FybignQ29weWluZyBNYXJrZG93biBhcyBIVE1MIGZhaWxlZCcsIGVycm9yKVxuICAgICAgZWxzZSBpZiByZW5kZXJMYVRlWFxuICAgICAgICBtYXRoamF4SGVscGVyID89IHJlcXVpcmUgJy4vbWF0aGpheC1oZWxwZXInXG4gICAgICAgIG1hdGhqYXhIZWxwZXIucHJvY2Vzc0hUTUxTdHJpbmcgaHRtbCwgKHByb0hUTUwpIC0+XG4gICAgICAgICAgcHJvSFRNTCA9IHByb0hUTUwucmVwbGFjZSAvTWF0aEpheFxcX1NWRy4qP2ZvbnRcXC1zaXplXFw6IDEwMCUvZywgKG1hdGNoKSAtPlxuICAgICAgICAgICAgbWF0Y2gucmVwbGFjZSAvZm9udFxcLXNpemVcXDogMTAwJS8sIFwiZm9udC1zaXplOiAje3NjYWxlTWF0aH0lXCJcbiAgICAgICAgICBjYWxsYmFjayhwcm9IVE1MKVxuICAgICAgZWxzZVxuICAgICAgICBjYWxsYmFjayhodG1sKVxuIl19
