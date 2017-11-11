(function() {
  var $, $$$, CompositeDisposable, Disposable, Emitter, File, Grim, MarkdownPreviewView, ScrollView, UpdatePreview, _, fs, imageWatcher, markdownIt, path, ref, ref1, renderer,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require('path');

  ref = require('atom'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, $$$ = ref1.$$$, ScrollView = ref1.ScrollView;

  Grim = require('grim');

  _ = require('underscore-plus');

  fs = require('fs-plus');

  File = require('atom').File;

  renderer = require('./renderer');

  UpdatePreview = require('./update-preview');

  markdownIt = null;

  imageWatcher = null;

  module.exports = MarkdownPreviewView = (function(superClass) {
    extend(MarkdownPreviewView, superClass);

    MarkdownPreviewView.content = function() {
      return this.div({
        "class": 'markdown-preview native-key-bindings',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'update-preview'
          });
        };
      })(this));
    };

    function MarkdownPreviewView(arg) {
      this.editorId = arg.editorId, this.filePath = arg.filePath;
      this.syncPreview = bind(this.syncPreview, this);
      this.getPathToToken = bind(this.getPathToToken, this);
      this.syncSource = bind(this.syncSource, this);
      this.getPathToElement = bind(this.getPathToElement, this);
      this.updatePreview = null;
      this.renderLaTeX = atom.config.get('markdown-preview-plus.enableLatexRenderingByDefault');
      MarkdownPreviewView.__super__.constructor.apply(this, arguments);
      this.emitter = new Emitter;
      this.disposables = new CompositeDisposable;
      this.loaded = true;
    }

    MarkdownPreviewView.prototype.attached = function() {
      if (this.isAttached) {
        return;
      }
      this.isAttached = true;
      if (this.editorId != null) {
        return this.resolveEditor(this.editorId);
      } else {
        if (atom.workspace != null) {
          return this.subscribeToFilePath(this.filePath);
        } else {
          return this.disposables.add(atom.packages.onDidActivateInitialPackages((function(_this) {
            return function() {
              return _this.subscribeToFilePath(_this.filePath);
            };
          })(this)));
        }
      }
    };

    MarkdownPreviewView.prototype.serialize = function() {
      var ref2;
      return {
        deserializer: 'MarkdownPreviewView',
        filePath: (ref2 = this.getPath()) != null ? ref2 : this.filePath,
        editorId: this.editorId
      };
    };

    MarkdownPreviewView.prototype.destroy = function() {
      if (imageWatcher == null) {
        imageWatcher = require('./image-watch-helper');
      }
      imageWatcher.removeFile(this.getPath());
      return this.disposables.dispose();
    };

    MarkdownPreviewView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    MarkdownPreviewView.prototype.onDidChangeModified = function(callback) {
      return new Disposable;
    };

    MarkdownPreviewView.prototype.onDidChangeMarkdown = function(callback) {
      return this.emitter.on('did-change-markdown', callback);
    };

    MarkdownPreviewView.prototype.subscribeToFilePath = function(filePath) {
      this.file = new File(filePath);
      this.emitter.emit('did-change-title');
      this.handleEvents();
      return this.renderMarkdown();
    };

    MarkdownPreviewView.prototype.resolveEditor = function(editorId) {
      var resolve;
      resolve = (function(_this) {
        return function() {
          var ref2, ref3;
          _this.editor = _this.editorForId(editorId);
          if (_this.editor != null) {
            if (_this.editor != null) {
              _this.emitter.emit('did-change-title');
            }
            _this.handleEvents();
            return _this.renderMarkdown();
          } else {
            return (ref2 = atom.workspace) != null ? (ref3 = ref2.paneForItem(_this)) != null ? ref3.destroyItem(_this) : void 0 : void 0;
          }
        };
      })(this);
      if (atom.workspace != null) {
        return resolve();
      } else {
        return this.disposables.add(atom.packages.onDidActivateInitialPackages(resolve));
      }
    };

    MarkdownPreviewView.prototype.editorForId = function(editorId) {
      var editor, j, len, ref2, ref3;
      ref2 = atom.workspace.getTextEditors();
      for (j = 0, len = ref2.length; j < len; j++) {
        editor = ref2[j];
        if (((ref3 = editor.id) != null ? ref3.toString() : void 0) === editorId.toString()) {
          return editor;
        }
      }
      return null;
    };

    MarkdownPreviewView.prototype.handleEvents = function() {
      var changeHandler;
      this.disposables.add(atom.grammars.onDidAddGrammar((function(_this) {
        return function() {
          return _.debounce((function() {
            return _this.renderMarkdown();
          }), 250);
        };
      })(this)));
      this.disposables.add(atom.grammars.onDidUpdateGrammar(_.debounce(((function(_this) {
        return function() {
          return _this.renderMarkdown();
        };
      })(this)), 250)));
      atom.commands.add(this.element, {
        'core:move-up': (function(_this) {
          return function() {
            return _this.scrollUp();
          };
        })(this),
        'core:move-down': (function(_this) {
          return function() {
            return _this.scrollDown();
          };
        })(this),
        'core:save-as': (function(_this) {
          return function(event) {
            event.stopPropagation();
            return _this.saveAs();
          };
        })(this),
        'core:copy': (function(_this) {
          return function(event) {
            if (_this.copyToClipboard()) {
              return event.stopPropagation();
            }
          };
        })(this),
        'markdown-preview-plus:zoom-in': (function(_this) {
          return function() {
            var zoomLevel;
            zoomLevel = parseFloat(_this.css('zoom')) || 1;
            return _this.css('zoom', zoomLevel + .1);
          };
        })(this),
        'markdown-preview-plus:zoom-out': (function(_this) {
          return function() {
            var zoomLevel;
            zoomLevel = parseFloat(_this.css('zoom')) || 1;
            return _this.css('zoom', zoomLevel - .1);
          };
        })(this),
        'markdown-preview-plus:reset-zoom': (function(_this) {
          return function() {
            return _this.css('zoom', 1);
          };
        })(this),
        'markdown-preview-plus:sync-source': (function(_this) {
          return function(event) {
            return _this.getMarkdownSource().then(function(source) {
              if (source == null) {
                return;
              }
              return _this.syncSource(source, event.target);
            });
          };
        })(this)
      });
      changeHandler = (function(_this) {
        return function() {
          var base, pane, ref2;
          _this.renderMarkdown();
          pane = (ref2 = typeof (base = atom.workspace).paneForItem === "function" ? base.paneForItem(_this) : void 0) != null ? ref2 : atom.workspace.paneForURI(_this.getURI());
          if ((pane != null) && pane !== atom.workspace.getActivePane()) {
            return pane.activateItem(_this);
          }
        };
      })(this);
      if (this.file != null) {
        this.disposables.add(this.file.onDidChange(changeHandler));
      } else if (this.editor != null) {
        this.disposables.add(this.editor.getBuffer().onDidStopChanging(function() {
          if (atom.config.get('markdown-preview-plus.liveUpdate')) {
            return changeHandler();
          }
        }));
        this.disposables.add(this.editor.onDidChangePath((function(_this) {
          return function() {
            return _this.emitter.emit('did-change-title');
          };
        })(this)));
        this.disposables.add(this.editor.getBuffer().onDidSave(function() {
          if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
            return changeHandler();
          }
        }));
        this.disposables.add(this.editor.getBuffer().onDidReload(function() {
          if (!atom.config.get('markdown-preview-plus.liveUpdate')) {
            return changeHandler();
          }
        }));
        this.disposables.add(atom.commands.add(atom.views.getView(this.editor), {
          'markdown-preview-plus:sync-preview': (function(_this) {
            return function(event) {
              return _this.getMarkdownSource().then(function(source) {
                if (source == null) {
                  return;
                }
                return _this.syncPreview(source, _this.editor.getCursorBufferPosition().row);
              });
            };
          })(this)
        }));
      }
      this.disposables.add(atom.config.onDidChange('markdown-preview-plus.breakOnSingleNewline', changeHandler));
      this.disposables.add(atom.commands.add('atom-workspace', {
        'markdown-preview-plus:toggle-render-latex': (function(_this) {
          return function() {
            if ((atom.workspace.getActivePaneItem() === _this) || (atom.workspace.getActiveTextEditor() === _this.editor)) {
              _this.renderLaTeX = !_this.renderLaTeX;
              changeHandler();
            }
          };
        })(this)
      }));
      return this.disposables.add(atom.config.observe('markdown-preview-plus.useGitHubStyle', (function(_this) {
        return function(useGitHubStyle) {
          if (useGitHubStyle) {
            return _this.element.setAttribute('data-use-github-style', '');
          } else {
            return _this.element.removeAttribute('data-use-github-style');
          }
        };
      })(this)));
    };

    MarkdownPreviewView.prototype.renderMarkdown = function() {
      if (!this.loaded) {
        this.showLoading();
      }
      return this.getMarkdownSource().then((function(_this) {
        return function(source) {
          if (source != null) {
            return _this.renderMarkdownText(source);
          }
        };
      })(this));
    };

    MarkdownPreviewView.prototype.refreshImages = function(oldsrc) {
      var img, imgs, j, len, match, ov, ref2, ref3, results, src, v;
      imgs = this.element.querySelectorAll("img[src]");
      if (imageWatcher == null) {
        imageWatcher = require('./image-watch-helper');
      }
      results = [];
      for (j = 0, len = imgs.length; j < len; j++) {
        img = imgs[j];
        src = img.getAttribute('src');
        match = src.match(/^(.*)\?v=(\d+)$/);
        ref3 = (ref2 = match != null ? typeof match.slice === "function" ? match.slice(1) : void 0 : void 0) != null ? ref2 : [src], src = ref3[0], ov = ref3[1];
        if (src === oldsrc) {
          if (ov != null) {
            ov = parseInt(ov);
          }
          v = imageWatcher.getVersion(src, this.getPath());
          if (v !== ov) {
            if (v) {
              results.push(img.src = src + "?v=" + v);
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    MarkdownPreviewView.prototype.getMarkdownSource = function() {
      var ref2;
      if ((ref2 = this.file) != null ? ref2.getPath() : void 0) {
        return this.file.read();
      } else if (this.editor != null) {
        return Promise.resolve(this.editor.getText());
      } else {
        return Promise.resolve(null);
      }
    };

    MarkdownPreviewView.prototype.getHTML = function(callback) {
      return this.getMarkdownSource().then((function(_this) {
        return function(source) {
          if (source == null) {
            return;
          }
          return renderer.toHTML(source, _this.getPath(), _this.getGrammar(), _this.renderLaTeX, false, callback);
        };
      })(this));
    };

    MarkdownPreviewView.prototype.renderMarkdownText = function(text) {
      return renderer.toDOMFragment(text, this.getPath(), this.getGrammar(), this.renderLaTeX, (function(_this) {
        return function(error, domFragment) {
          if (error) {
            return _this.showError(error);
          } else {
            _this.loading = false;
            _this.loaded = true;
            if (!_this.updatePreview) {
              _this.updatePreview = new UpdatePreview(_this.find("div.update-preview")[0]);
            }
            _this.updatePreview.update(domFragment, _this.renderLaTeX);
            _this.emitter.emit('did-change-markdown');
            return _this.originalTrigger('markdown-preview-plus:markdown-changed');
          }
        };
      })(this));
    };

    MarkdownPreviewView.prototype.getTitle = function() {
      if (this.file != null) {
        return (path.basename(this.getPath())) + " Preview";
      } else if (this.editor != null) {
        return (this.editor.getTitle()) + " Preview";
      } else {
        return "Markdown Preview";
      }
    };

    MarkdownPreviewView.prototype.getIconName = function() {
      return "markdown";
    };

    MarkdownPreviewView.prototype.getURI = function() {
      if (this.file != null) {
        return "markdown-preview-plus://" + (this.getPath());
      } else {
        return "markdown-preview-plus://editor/" + this.editorId;
      }
    };

    MarkdownPreviewView.prototype.getPath = function() {
      if (this.file != null) {
        return this.file.getPath();
      } else if (this.editor != null) {
        return this.editor.getPath();
      }
    };

    MarkdownPreviewView.prototype.getGrammar = function() {
      var ref2;
      return (ref2 = this.editor) != null ? ref2.getGrammar() : void 0;
    };

    MarkdownPreviewView.prototype.getDocumentStyleSheets = function() {
      return document.styleSheets;
    };

    MarkdownPreviewView.prototype.getTextEditorStyles = function() {
      var textEditorStyles;
      textEditorStyles = document.createElement("atom-styles");
      textEditorStyles.initialize(atom.styles);
      textEditorStyles.setAttribute("context", "atom-text-editor");
      document.body.appendChild(textEditorStyles);
      return Array.prototype.slice.apply(textEditorStyles.childNodes).map(function(styleElement) {
        return styleElement.innerText;
      });
    };

    MarkdownPreviewView.prototype.getMarkdownPreviewCSS = function() {
      var cssUrlRefExp, j, k, len, len1, markdowPreviewRules, ref2, ref3, ref4, rule, ruleRegExp, stylesheet;
      markdowPreviewRules = [];
      ruleRegExp = /\.markdown-preview/;
      cssUrlRefExp = /url\(atom:\/\/markdown-preview-plus\/assets\/(.*)\)/;
      ref2 = this.getDocumentStyleSheets();
      for (j = 0, len = ref2.length; j < len; j++) {
        stylesheet = ref2[j];
        if (stylesheet.rules != null) {
          ref3 = stylesheet.rules;
          for (k = 0, len1 = ref3.length; k < len1; k++) {
            rule = ref3[k];
            if (((ref4 = rule.selectorText) != null ? ref4.match(ruleRegExp) : void 0) != null) {
              markdowPreviewRules.push(rule.cssText);
            }
          }
        }
      }
      return markdowPreviewRules.concat(this.getTextEditorStyles()).join('\n').replace(/atom-text-editor/g, 'pre.editor-colors').replace(/:host/g, '.host').replace(cssUrlRefExp, function(match, assetsName, offset, string) {
        var assetPath, base64Data, originalData;
        assetPath = path.join(__dirname, '../assets', assetsName);
        originalData = fs.readFileSync(assetPath, 'binary');
        base64Data = new Buffer(originalData, 'binary').toString('base64');
        return "url('data:image/jpeg;base64," + base64Data + "')";
      });
    };

    MarkdownPreviewView.prototype.showError = function(result) {
      var failureMessage;
      failureMessage = result != null ? result.message : void 0;
      return this.html($$$(function() {
        this.h2('Previewing Markdown Failed');
        if (failureMessage != null) {
          return this.h3(failureMessage);
        }
      }));
    };

    MarkdownPreviewView.prototype.showLoading = function() {
      this.loading = true;
      return this.html($$$(function() {
        return this.div({
          "class": 'markdown-spinner'
        }, 'Loading Markdown\u2026');
      }));
    };

    MarkdownPreviewView.prototype.copyToClipboard = function() {
      var selectedNode, selectedText, selection;
      if (this.loading) {
        return false;
      }
      selection = window.getSelection();
      selectedText = selection.toString();
      selectedNode = selection.baseNode;
      if (selectedText && (selectedNode != null) && (this[0] === selectedNode || $.contains(this[0], selectedNode))) {
        return false;
      }
      this.getHTML(function(error, html) {
        if (error != null) {
          return console.warn('Copying Markdown as HTML failed', error);
        } else {
          return atom.clipboard.write(html);
        }
      });
      return true;
    };

    MarkdownPreviewView.prototype.saveAs = function() {
      var filePath, htmlFilePath, projectPath, title;
      if (this.loading) {
        return;
      }
      filePath = this.getPath();
      title = 'Markdown to HTML';
      if (filePath) {
        title = path.parse(filePath).name;
        filePath += '.html';
      } else {
        filePath = 'untitled.md.html';
        if (projectPath = atom.project.getPaths()[0]) {
          filePath = path.join(projectPath, filePath);
        }
      }
      if (htmlFilePath = atom.showSaveDialogSync(filePath)) {
        return this.getHTML((function(_this) {
          return function(error, htmlBody) {
            var html, mathjaxScript;
            if (error != null) {
              return console.warn('Saving Markdown as HTML failed', error);
            } else {
              if (_this.renderLaTeX) {
                mathjaxScript = "\n<script type=\"text/x-mathjax-config\">\n  MathJax.Hub.Config({\n    jax: [\"input/TeX\",\"output/HTML-CSS\"],\n    extensions: [],\n    TeX: {\n      extensions: [\"AMSmath.js\",\"AMSsymbols.js\",\"noErrors.js\",\"noUndefined.js\"]\n    },\n    showMathMenu: false\n  });\n</script>\n<script type=\"text/javascript\" src=\"https://cdn.mathjax.org/mathjax/latest/MathJax.js\">\n</script>";
              } else {
                mathjaxScript = "";
              }
              html = ("<!DOCTYPE html>\n<html>\n  <head>\n      <meta charset=\"utf-8\" />\n      <title>" + title + "</title>" + mathjaxScript + "\n      <style>" + (_this.getMarkdownPreviewCSS()) + "</style>\n  </head>\n  <body class='markdown-preview'>" + htmlBody + "</body>\n</html>") + "\n";
              fs.writeFileSync(htmlFilePath, html);
              return atom.workspace.open(htmlFilePath);
            }
          };
        })(this));
      }
    };

    MarkdownPreviewView.prototype.isEqual = function(other) {
      return this[0] === (other != null ? other[0] : void 0);
    };

    MarkdownPreviewView.prototype.bubbleToContainerElement = function(element) {
      var parent, testElement;
      testElement = element;
      while (testElement !== document.body) {
        parent = testElement.parentNode;
        if (parent.classList.contains('MathJax_Display')) {
          return parent.parentNode;
        }
        if (parent.classList.contains('atom-text-editor')) {
          return parent;
        }
        testElement = parent;
      }
      return element;
    };

    MarkdownPreviewView.prototype.bubbleToContainerToken = function(pathToToken) {
      var i, j, ref2;
      for (i = j = 0, ref2 = pathToToken.length - 1; j <= ref2; i = j += 1) {
        if (pathToToken[i].tag === 'table') {
          return pathToToken.slice(0, i + 1);
        }
      }
      return pathToToken;
    };

    MarkdownPreviewView.prototype.encodeTag = function(element) {
      if (element.classList.contains('math')) {
        return 'math';
      }
      if (element.classList.contains('atom-text-editor')) {
        return 'code';
      }
      return element.tagName.toLowerCase();
    };

    MarkdownPreviewView.prototype.decodeTag = function(token) {
      if (token.tag === 'math') {
        return 'span';
      }
      if (token.tag === 'code') {
        return 'span';
      }
      if (token.tag === "") {
        return null;
      }
      return token.tag;
    };

    MarkdownPreviewView.prototype.getPathToElement = function(element) {
      var j, len, pathToElement, sibling, siblingTag, siblings, siblingsCount, tag;
      if (element.classList.contains('markdown-preview')) {
        return [
          {
            tag: 'div',
            index: 0
          }
        ];
      }
      element = this.bubbleToContainerElement(element);
      tag = this.encodeTag(element);
      siblings = element.parentNode.childNodes;
      siblingsCount = 0;
      for (j = 0, len = siblings.length; j < len; j++) {
        sibling = siblings[j];
        siblingTag = sibling.nodeType === 1 ? this.encodeTag(sibling) : null;
        if (sibling === element) {
          pathToElement = this.getPathToElement(element.parentNode);
          pathToElement.push({
            tag: tag,
            index: siblingsCount
          });
          return pathToElement;
        } else if (siblingTag === tag) {
          siblingsCount++;
        }
      }
    };

    MarkdownPreviewView.prototype.syncSource = function(text, element) {
      var finalToken, j, len, level, pathToElement, ref2, token, tokens;
      pathToElement = this.getPathToElement(element);
      pathToElement.shift();
      pathToElement.shift();
      if (!pathToElement.length) {
        return;
      }
      if (markdownIt == null) {
        markdownIt = require('./markdown-it-helper');
      }
      tokens = markdownIt.getTokens(text, this.renderLaTeX);
      finalToken = null;
      level = 0;
      for (j = 0, len = tokens.length; j < len; j++) {
        token = tokens[j];
        if (token.level < level) {
          break;
        }
        if (token.hidden) {
          continue;
        }
        if (token.tag === pathToElement[0].tag && token.level === level) {
          if (token.nesting === 1) {
            if (pathToElement[0].index === 0) {
              if (token.map != null) {
                finalToken = token;
              }
              pathToElement.shift();
              level++;
            } else {
              pathToElement[0].index--;
            }
          } else if (token.nesting === 0 && ((ref2 = token.tag) === 'math' || ref2 === 'code' || ref2 === 'hr')) {
            if (pathToElement[0].index === 0) {
              finalToken = token;
              break;
            } else {
              pathToElement[0].index--;
            }
          }
        }
        if (pathToElement.length === 0) {
          break;
        }
      }
      if (finalToken != null) {
        this.editor.setCursorBufferPosition([finalToken.map[0], 0]);
        return finalToken.map[0];
      } else {
        return null;
      }
    };

    MarkdownPreviewView.prototype.getPathToToken = function(tokens, line) {
      var j, len, level, pathToToken, ref2, ref3, token, tokenTagCount;
      pathToToken = [];
      tokenTagCount = [];
      level = 0;
      for (j = 0, len = tokens.length; j < len; j++) {
        token = tokens[j];
        if (token.level < level) {
          break;
        }
        if (token.hidden) {
          continue;
        }
        if (token.nesting === -1) {
          continue;
        }
        token.tag = this.decodeTag(token);
        if (token.tag == null) {
          continue;
        }
        if ((token.map != null) && line >= token.map[0] && line <= (token.map[1] - 1)) {
          if (token.nesting === 1) {
            pathToToken.push({
              tag: token.tag,
              index: (ref2 = tokenTagCount[token.tag]) != null ? ref2 : 0
            });
            tokenTagCount = [];
            level++;
          } else if (token.nesting === 0) {
            pathToToken.push({
              tag: token.tag,
              index: (ref3 = tokenTagCount[token.tag]) != null ? ref3 : 0
            });
            break;
          }
        } else if (token.level === level) {
          if (tokenTagCount[token.tag] != null) {
            tokenTagCount[token.tag]++;
          } else {
            tokenTagCount[token.tag] = 1;
          }
        }
      }
      pathToToken = this.bubbleToContainerToken(pathToToken);
      return pathToToken;
    };

    MarkdownPreviewView.prototype.syncPreview = function(text, line) {
      var candidateElement, element, j, len, maxScrollTop, pathToToken, token, tokens;
      if (markdownIt == null) {
        markdownIt = require('./markdown-it-helper');
      }
      tokens = markdownIt.getTokens(text, this.renderLaTeX);
      pathToToken = this.getPathToToken(tokens, line);
      element = this.find('.update-preview').eq(0);
      for (j = 0, len = pathToToken.length; j < len; j++) {
        token = pathToToken[j];
        candidateElement = element.children(token.tag).eq(token.index);
        if (candidateElement.length !== 0) {
          element = candidateElement;
        } else {
          break;
        }
      }
      if (element[0].classList.contains('update-preview')) {
        return null;
      }
      if (!element[0].classList.contains('update-preview')) {
        element[0].scrollIntoView();
      }
      maxScrollTop = this.element.scrollHeight - this.innerHeight();
      if (!(this.scrollTop() >= maxScrollTop)) {
        this.element.scrollTop -= this.innerHeight() / 4;
      }
      element.addClass('flash');
      setTimeout((function() {
        return element.removeClass('flash');
      }), 1000);
      return element[0];
    };

    return MarkdownPreviewView;

  })(ScrollView);

  if (Grim.includeDeprecatedAPIs) {
    MarkdownPreviewView.prototype.on = function(eventName) {
      if (eventName === 'markdown-preview:markdown-changed') {
        Grim.deprecate("Use MarkdownPreviewView::onDidChangeMarkdown instead of the 'markdown-preview:markdown-changed' jQuery event");
      }
      return MarkdownPreviewView.__super__.on.apply(this, arguments);
    };
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYXJrZG93bi1wcmV2aWV3LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3S0FBQTtJQUFBOzs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQjs7RUFDdEIsT0FBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsVUFBRCxFQUFJLGNBQUosRUFBUzs7RUFDVCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0osT0FBUSxPQUFBLENBQVEsTUFBUjs7RUFFVCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLFVBQUEsR0FBYTs7RUFDYixZQUFBLEdBQWU7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNDQUFQO1FBQStDLFFBQUEsRUFBVSxDQUFDLENBQTFEO09BQUwsRUFBa0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUVoRSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDtXQUFMO1FBRmdFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRTtJQURROztJQUtHLDZCQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsZUFBQSxVQUFVLElBQUMsQ0FBQSxlQUFBOzs7OztN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QUFBLENBQUEsQ0FBRSxDQUFDLGNBQVgsQ0FBQSxFQUFBOztNQUNBLFlBQUEsR0FBZSxJQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsR0FBd0IsSUFBQyxDQUFBLFdBQUQsQ0FBQTtNQUN2QyxJQUFBLENBQUEsQ0FBOEMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLElBQWdCLFlBQTlELENBQUE7UUFBQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsSUFBc0IsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLEdBQWUsRUFBckM7O01BRUEsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsT0FBakI7TUFDQSxVQUFBLENBQVcsQ0FBRSxTQUFBO2VBQUcsT0FBTyxDQUFDLFdBQVIsQ0FBb0IsT0FBcEI7TUFBSCxDQUFGLENBQVgsRUFBZ0QsSUFBaEQ7QUFFQSxhQUFPLE9BQVEsQ0FBQSxDQUFBO0lBckJKOzs7O0tBdGhCbUI7O0VBNmlCbEMsSUFBRyxJQUFJLENBQUMscUJBQVI7SUFDRSxtQkFBbUIsQ0FBQSxTQUFFLENBQUEsRUFBckIsR0FBMEIsU0FBQyxTQUFEO01BQ3hCLElBQUcsU0FBQSxLQUFhLG1DQUFoQjtRQUNFLElBQUksQ0FBQyxTQUFMLENBQWUsOEdBQWYsRUFERjs7YUFFQSw2Q0FBQSxTQUFBO0lBSHdCLEVBRDVCOztBQTVqQkEiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSAncGF0aCdcblxue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCAkJCQsIFNjcm9sbFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5HcmltID0gcmVxdWlyZSAnZ3JpbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG57RmlsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5yZW5kZXJlciA9IHJlcXVpcmUgJy4vcmVuZGVyZXInXG5VcGRhdGVQcmV2aWV3ID0gcmVxdWlyZSAnLi91cGRhdGUtcHJldmlldydcbm1hcmtkb3duSXQgPSBudWxsICMgRGVmZXIgdW50aWwgdXNlZFxuaW1hZ2VXYXRjaGVyID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNYXJrZG93blByZXZpZXdWaWV3IGV4dGVuZHMgU2Nyb2xsVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnbWFya2Rvd24tcHJldmlldyBuYXRpdmUta2V5LWJpbmRpbmdzJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgIyBJZiB5b3UgZG9udCBleHBsaWNpdGx5IGRlY2xhcmUgYSBjbGFzcyB0aGVuIHRoZSBlbGVtZW50cyB3b250IGJlIGNyZWF0ZWRcbiAgICAgIEBkaXYgY2xhc3M6ICd1cGRhdGUtcHJldmlldydcblxuICBjb25zdHJ1Y3RvcjogKHtAZWRpdG9ySWQsIEBmaWxlUGF0aH0pIC0+XG4gICAgQHVwZGF0ZVByZXZpZXcgID0gbnVsbFxuICAgIEByZW5kZXJMYVRlWCAgICA9IGF0b20uY29uZmlnLmdldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZUxhdGV4UmVuZGVyaW5nQnlEZWZhdWx0J1xuICAgIHN1cGVyXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGxvYWRlZCA9IHRydWUgIyBEbyBub3Qgc2hvdyB0aGUgbG9hZGluZyBzcGlubm9yIG9uIGluaXRpYWwgbG9hZFxuXG4gIGF0dGFjaGVkOiAtPlxuICAgIHJldHVybiBpZiBAaXNBdHRhY2hlZFxuICAgIEBpc0F0dGFjaGVkID0gdHJ1ZVxuXG4gICAgaWYgQGVkaXRvcklkP1xuICAgICAgQHJlc29sdmVFZGl0b3IoQGVkaXRvcklkKVxuICAgIGVsc2VcbiAgICAgIGlmIGF0b20ud29ya3NwYWNlP1xuICAgICAgICBAc3Vic2NyaWJlVG9GaWxlUGF0aChAZmlsZVBhdGgpXG4gICAgICBlbHNlXG4gICAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzID0+XG4gICAgICAgICAgQHN1YnNjcmliZVRvRmlsZVBhdGgoQGZpbGVQYXRoKVxuXG4gIHNlcmlhbGl6ZTogLT5cbiAgICBkZXNlcmlhbGl6ZXI6ICdNYXJrZG93blByZXZpZXdWaWV3J1xuICAgIGZpbGVQYXRoOiBAZ2V0UGF0aCgpID8gQGZpbGVQYXRoXG4gICAgZWRpdG9ySWQ6IEBlZGl0b3JJZFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgaW1hZ2VXYXRjaGVyID89IHJlcXVpcmUgJy4vaW1hZ2Utd2F0Y2gtaGVscGVyJ1xuICAgIGltYWdlV2F0Y2hlci5yZW1vdmVGaWxlKEBnZXRQYXRoKCkpXG4gICAgQGRpc3Bvc2FibGVzLmRpc3Bvc2UoKVxuXG4gIG9uRGlkQ2hhbmdlVGl0bGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS10aXRsZScsIGNhbGxiYWNrXG5cbiAgb25EaWRDaGFuZ2VNb2RpZmllZDogKGNhbGxiYWNrKSAtPlxuICAgICMgTm8gb3AgdG8gc3VwcHJlc3MgZGVwcmVjYXRpb24gd2FybmluZ1xuICAgIG5ldyBEaXNwb3NhYmxlXG5cbiAgb25EaWRDaGFuZ2VNYXJrZG93bjogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLW1hcmtkb3duJywgY2FsbGJhY2tcblxuICBzdWJzY3JpYmVUb0ZpbGVQYXRoOiAoZmlsZVBhdGgpIC0+XG4gICAgQGZpbGUgPSBuZXcgRmlsZShmaWxlUGF0aClcbiAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLXRpdGxlJ1xuICAgIEBoYW5kbGVFdmVudHMoKVxuICAgIEByZW5kZXJNYXJrZG93bigpXG5cbiAgcmVzb2x2ZUVkaXRvcjogKGVkaXRvcklkKSAtPlxuICAgIHJlc29sdmUgPSA9PlxuICAgICAgQGVkaXRvciA9IEBlZGl0b3JGb3JJZChlZGl0b3JJZClcblxuICAgICAgaWYgQGVkaXRvcj9cbiAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS10aXRsZScgaWYgQGVkaXRvcj9cbiAgICAgICAgQGhhbmRsZUV2ZW50cygpXG4gICAgICAgIEByZW5kZXJNYXJrZG93bigpXG4gICAgICBlbHNlXG4gICAgICAgICMgVGhlIGVkaXRvciB0aGlzIHByZXZpZXcgd2FzIGNyZWF0ZWQgZm9yIGhhcyBiZWVuIGNsb3NlZCBzbyBjbG9zZVxuICAgICAgICAjIHRoaXMgcHJldmlldyBzaW5jZSBhIHByZXZpZXcgY2Fubm90IGJlIHJlbmRlcmVkIHdpdGhvdXQgYW4gZWRpdG9yXG4gICAgICAgIGF0b20ud29ya3NwYWNlPy5wYW5lRm9ySXRlbSh0aGlzKT8uZGVzdHJveUl0ZW0odGhpcylcblxuICAgIGlmIGF0b20ud29ya3NwYWNlP1xuICAgICAgcmVzb2x2ZSgpXG4gICAgZWxzZVxuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVJbml0aWFsUGFja2FnZXMocmVzb2x2ZSlcblxuICBlZGl0b3JGb3JJZDogKGVkaXRvcklkKSAtPlxuICAgIGZvciBlZGl0b3IgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKVxuICAgICAgcmV0dXJuIGVkaXRvciBpZiBlZGl0b3IuaWQ/LnRvU3RyaW5nKCkgaXMgZWRpdG9ySWQudG9TdHJpbmcoKVxuICAgIG51bGxcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmdyYW1tYXJzLm9uRGlkQWRkR3JhbW1hciA9PiBfLmRlYm91bmNlKCg9PiBAcmVuZGVyTWFya2Rvd24oKSksIDI1MClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uZ3JhbW1hcnMub25EaWRVcGRhdGVHcmFtbWFyIF8uZGVib3VuY2UoKD0+IEByZW5kZXJNYXJrZG93bigpKSwgMjUwKVxuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgQGVsZW1lbnQsXG4gICAgICAnY29yZTptb3ZlLXVwJzogPT5cbiAgICAgICAgQHNjcm9sbFVwKClcbiAgICAgICdjb3JlOm1vdmUtZG93bic6ID0+XG4gICAgICAgIEBzY3JvbGxEb3duKClcbiAgICAgICdjb3JlOnNhdmUtYXMnOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIEBzYXZlQXMoKVxuICAgICAgJ2NvcmU6Y29weSc6IChldmVudCkgPT5cbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkgaWYgQGNvcHlUb0NsaXBib2FyZCgpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20taW4nOiA9PlxuICAgICAgICB6b29tTGV2ZWwgPSBwYXJzZUZsb2F0KEBjc3MoJ3pvb20nKSkgb3IgMVxuICAgICAgICBAY3NzKCd6b29tJywgem9vbUxldmVsICsgLjEpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnpvb20tb3V0JzogPT5cbiAgICAgICAgem9vbUxldmVsID0gcGFyc2VGbG9hdChAY3NzKCd6b29tJykpIG9yIDFcbiAgICAgICAgQGNzcygnem9vbScsIHpvb21MZXZlbCAtIC4xKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpyZXNldC16b29tJzogPT5cbiAgICAgICAgQGNzcygnem9vbScsIDEpXG4gICAgICAnbWFya2Rvd24tcHJldmlldy1wbHVzOnN5bmMtc291cmNlJzogKGV2ZW50KSA9PlxuICAgICAgICBAZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuIChzb3VyY2UpID0+XG4gICAgICAgICAgcmV0dXJuIHVubGVzcyBzb3VyY2U/XG4gICAgICAgICAgQHN5bmNTb3VyY2Ugc291cmNlLCBldmVudC50YXJnZXRcblxuICAgIGNoYW5nZUhhbmRsZXIgPSA9PlxuICAgICAgQHJlbmRlck1hcmtkb3duKClcblxuICAgICAgIyBUT0RPOiBSZW1vdmUgcGFuZUZvclVSSSBjYWxsIHdoZW4gOjpwYW5lRm9ySXRlbSBpcyByZWxlYXNlZFxuICAgICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtPyh0aGlzKSA/IGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkoQGdldFVSSSgpKVxuICAgICAgaWYgcGFuZT8gYW5kIHBhbmUgaXNudCBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgcGFuZS5hY3RpdmF0ZUl0ZW0odGhpcylcblxuICAgIGlmIEBmaWxlP1xuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBAZmlsZS5vbkRpZENoYW5nZShjaGFuZ2VIYW5kbGVyKVxuICAgIGVsc2UgaWYgQGVkaXRvcj9cbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFN0b3BDaGFuZ2luZyAtPlxuICAgICAgICBjaGFuZ2VIYW5kbGVyKCkgaWYgYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZSdcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVBhdGggPT4gQGVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS10aXRsZSdcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFNhdmUgLT5cbiAgICAgICAgY2hhbmdlSGFuZGxlcigpIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5saXZlVXBkYXRlJ1xuICAgICAgQGRpc3Bvc2FibGVzLmFkZCBAZWRpdG9yLmdldEJ1ZmZlcigpLm9uRGlkUmVsb2FkIC0+XG4gICAgICAgIGNoYW5nZUhhbmRsZXIoKSB1bmxlc3MgYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZSdcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQoIGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKSxcbiAgICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXByZXZpZXcnOiAoZXZlbnQpID0+XG4gICAgICAgICAgQGdldE1hcmtkb3duU291cmNlKCkudGhlbiAoc291cmNlKSA9PlxuICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBzb3VyY2U/XG4gICAgICAgICAgICBAc3luY1ByZXZpZXcgc291cmNlLCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93IClcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScsIGNoYW5nZUhhbmRsZXJcblxuICAgICMgVG9nZ2xlIExhVGVYIHJlbmRlcmluZyBpZiBmb2N1cyBpcyBvbiBwcmV2aWV3IHBhbmUgb3IgYXNzb2NpYXRlZCBlZGl0b3IuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLFxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp0b2dnbGUtcmVuZGVyLWxhdGV4JzogPT5cbiAgICAgICAgaWYgKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgaXMgdGhpcykgb3IgKGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSBpcyBAZWRpdG9yKVxuICAgICAgICAgIEByZW5kZXJMYVRlWCA9IG5vdCBAcmVuZGVyTGFUZVhcbiAgICAgICAgICBjaGFuZ2VIYW5kbGVyKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VHaXRIdWJTdHlsZScsICh1c2VHaXRIdWJTdHlsZSkgPT5cbiAgICAgIGlmIHVzZUdpdEh1YlN0eWxlXG4gICAgICAgIEBlbGVtZW50LnNldEF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJywgJycpXG4gICAgICBlbHNlXG4gICAgICAgIEBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS11c2UtZ2l0aHViLXN0eWxlJylcblxuICByZW5kZXJNYXJrZG93bjogLT5cbiAgICBAc2hvd0xvYWRpbmcoKSB1bmxlc3MgQGxvYWRlZFxuICAgIEBnZXRNYXJrZG93blNvdXJjZSgpLnRoZW4gKHNvdXJjZSkgPT4gQHJlbmRlck1hcmtkb3duVGV4dChzb3VyY2UpIGlmIHNvdXJjZT9cblxuICByZWZyZXNoSW1hZ2VzOiAob2xkc3JjKSAtPlxuICAgIGltZ3MgPSBAZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nW3NyY11cIilcbiAgICBpbWFnZVdhdGNoZXIgPz0gcmVxdWlyZSAnLi9pbWFnZS13YXRjaC1oZWxwZXInXG4gICAgZm9yIGltZyBpbiBpbWdzXG4gICAgICBzcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdzcmMnKVxuICAgICAgbWF0Y2ggPSBzcmMubWF0Y2goL14oLiopXFw/dj0oXFxkKykkLylcbiAgICAgIFtzcmMsIG92XSA9IG1hdGNoPy5zbGljZT8oMSkgPyBbc3JjXVxuICAgICAgaWYgc3JjIGlzIG9sZHNyY1xuICAgICAgICBvdiA9IHBhcnNlSW50KG92KSBpZiBvdj9cbiAgICAgICAgdiA9IGltYWdlV2F0Y2hlci5nZXRWZXJzaW9uKHNyYywgQGdldFBhdGgoKSlcbiAgICAgICAgaWYgdiBpc250IG92XG4gICAgICAgICAgaW1nLnNyYyA9IFwiI3tzcmN9P3Y9I3t2fVwiIGlmIHZcblxuICBnZXRNYXJrZG93blNvdXJjZTogLT5cbiAgICBpZiBAZmlsZT8uZ2V0UGF0aCgpXG4gICAgICBAZmlsZS5yZWFkKClcbiAgICBlbHNlIGlmIEBlZGl0b3I/XG4gICAgICBQcm9taXNlLnJlc29sdmUoQGVkaXRvci5nZXRUZXh0KCkpXG4gICAgZWxzZVxuICAgICAgUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgZ2V0SFRNTDogKGNhbGxiYWNrKSAtPlxuICAgIEBnZXRNYXJrZG93blNvdXJjZSgpLnRoZW4gKHNvdXJjZSkgPT5cbiAgICAgIHJldHVybiB1bmxlc3Mgc291cmNlP1xuXG4gICAgICByZW5kZXJlci50b0hUTUwgc291cmNlLCBAZ2V0UGF0aCgpLCBAZ2V0R3JhbW1hcigpLCBAcmVuZGVyTGFUZVgsIGZhbHNlLCBjYWxsYmFja1xuXG4gIHJlbmRlck1hcmtkb3duVGV4dDogKHRleHQpIC0+XG4gICAgcmVuZGVyZXIudG9ET01GcmFnbWVudCB0ZXh0LCBAZ2V0UGF0aCgpLCBAZ2V0R3JhbW1hcigpLCBAcmVuZGVyTGFUZVgsIChlcnJvciwgZG9tRnJhZ21lbnQpID0+XG4gICAgICBpZiBlcnJvclxuICAgICAgICBAc2hvd0Vycm9yKGVycm9yKVxuICAgICAgZWxzZVxuICAgICAgICBAbG9hZGluZyA9IGZhbHNlXG4gICAgICAgIEBsb2FkZWQgPSB0cnVlXG4gICAgICAgICMgZGl2LnVwZGF0ZS1wcmV2aWV3IGNyZWF0ZWQgYWZ0ZXIgY29uc3RydWN0b3Igc3QgVXBkYXRlUHJldmlldyBjYW5ub3RcbiAgICAgICAgIyBiZSBpbnN0YW5jZWQgaW4gdGhlIGNvbnN0cnVjdG9yXG4gICAgICAgIHVubGVzcyBAdXBkYXRlUHJldmlld1xuICAgICAgICAgIEB1cGRhdGVQcmV2aWV3ID0gbmV3IFVwZGF0ZVByZXZpZXcoQGZpbmQoXCJkaXYudXBkYXRlLXByZXZpZXdcIilbMF0pXG4gICAgICAgIEB1cGRhdGVQcmV2aWV3LnVwZGF0ZShkb21GcmFnbWVudCwgQHJlbmRlckxhVGVYKVxuICAgICAgICBAZW1pdHRlci5lbWl0ICdkaWQtY2hhbmdlLW1hcmtkb3duJ1xuICAgICAgICBAb3JpZ2luYWxUcmlnZ2VyKCdtYXJrZG93bi1wcmV2aWV3LXBsdXM6bWFya2Rvd24tY2hhbmdlZCcpXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgaWYgQGZpbGU/XG4gICAgICBcIiN7cGF0aC5iYXNlbmFtZShAZ2V0UGF0aCgpKX0gUHJldmlld1wiXG4gICAgZWxzZSBpZiBAZWRpdG9yP1xuICAgICAgXCIje0BlZGl0b3IuZ2V0VGl0bGUoKX0gUHJldmlld1wiXG4gICAgZWxzZVxuICAgICAgXCJNYXJrZG93biBQcmV2aWV3XCJcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcIm1hcmtkb3duXCJcblxuICBnZXRVUkk6IC0+XG4gICAgaWYgQGZpbGU/XG4gICAgICBcIm1hcmtkb3duLXByZXZpZXctcGx1czovLyN7QGdldFBhdGgoKX1cIlxuICAgIGVsc2VcbiAgICAgIFwibWFya2Rvd24tcHJldmlldy1wbHVzOi8vZWRpdG9yLyN7QGVkaXRvcklkfVwiXG5cbiAgZ2V0UGF0aDogLT5cbiAgICBpZiBAZmlsZT9cbiAgICAgIEBmaWxlLmdldFBhdGgoKVxuICAgIGVsc2UgaWYgQGVkaXRvcj9cbiAgICAgIEBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgZ2V0R3JhbW1hcjogLT5cbiAgICBAZWRpdG9yPy5nZXRHcmFtbWFyKClcblxuICBnZXREb2N1bWVudFN0eWxlU2hlZXRzOiAtPiAjIFRoaXMgZnVuY3Rpb24gZXhpc3RzIHNvIHdlIGNhbiBzdHViIGl0XG4gICAgZG9jdW1lbnQuc3R5bGVTaGVldHNcblxuICBnZXRUZXh0RWRpdG9yU3R5bGVzOiAtPlxuXG4gICAgdGV4dEVkaXRvclN0eWxlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdG9tLXN0eWxlc1wiKVxuICAgIHRleHRFZGl0b3JTdHlsZXMuaW5pdGlhbGl6ZShhdG9tLnN0eWxlcylcbiAgICB0ZXh0RWRpdG9yU3R5bGVzLnNldEF0dHJpYnV0ZSBcImNvbnRleHRcIiwgXCJhdG9tLXRleHQtZWRpdG9yXCJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkIHRleHRFZGl0b3JTdHlsZXNcblxuICAgICMgRXh0cmFjdCBzdHlsZSBlbGVtZW50cyBjb250ZW50XG4gICAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KHRleHRFZGl0b3JTdHlsZXMuY2hpbGROb2RlcykubWFwIChzdHlsZUVsZW1lbnQpIC0+XG4gICAgICBzdHlsZUVsZW1lbnQuaW5uZXJUZXh0XG5cbiAgZ2V0TWFya2Rvd25QcmV2aWV3Q1NTOiAtPlxuICAgIG1hcmtkb3dQcmV2aWV3UnVsZXMgPSBbXVxuICAgIHJ1bGVSZWdFeHAgPSAvXFwubWFya2Rvd24tcHJldmlldy9cbiAgICBjc3NVcmxSZWZFeHAgPSAvdXJsXFwoYXRvbTpcXC9cXC9tYXJrZG93bi1wcmV2aWV3LXBsdXNcXC9hc3NldHNcXC8oLiopXFwpL1xuXG4gICAgZm9yIHN0eWxlc2hlZXQgaW4gQGdldERvY3VtZW50U3R5bGVTaGVldHMoKVxuICAgICAgaWYgc3R5bGVzaGVldC5ydWxlcz9cbiAgICAgICAgZm9yIHJ1bGUgaW4gc3R5bGVzaGVldC5ydWxlc1xuICAgICAgICAgICMgV2Ugb25seSBuZWVkIGAubWFya2Rvd24tcmV2aWV3YCBjc3NcbiAgICAgICAgICBtYXJrZG93UHJldmlld1J1bGVzLnB1c2gocnVsZS5jc3NUZXh0KSBpZiBydWxlLnNlbGVjdG9yVGV4dD8ubWF0Y2gocnVsZVJlZ0V4cCk/XG5cbiAgICBtYXJrZG93UHJldmlld1J1bGVzXG4gICAgICAuY29uY2F0KEBnZXRUZXh0RWRpdG9yU3R5bGVzKCkpXG4gICAgICAuam9pbignXFxuJylcbiAgICAgIC5yZXBsYWNlKC9hdG9tLXRleHQtZWRpdG9yL2csICdwcmUuZWRpdG9yLWNvbG9ycycpXG4gICAgICAucmVwbGFjZSgvOmhvc3QvZywgJy5ob3N0JykgIyBSZW1vdmUgc2hhZG93LWRvbSA6aG9zdCBzZWxlY3RvciBjYXVzaW5nIHByb2JsZW0gb24gRkZcbiAgICAgIC5yZXBsYWNlIGNzc1VybFJlZkV4cCwgKG1hdGNoLCBhc3NldHNOYW1lLCBvZmZzZXQsIHN0cmluZykgLT4gIyBiYXNlNjQgZW5jb2RlIGFzc2V0c1xuICAgICAgICBhc3NldFBhdGggPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4vYXNzZXRzJywgYXNzZXRzTmFtZVxuICAgICAgICBvcmlnaW5hbERhdGEgPSBmcy5yZWFkRmlsZVN5bmMgYXNzZXRQYXRoLCAnYmluYXJ5J1xuICAgICAgICBiYXNlNjREYXRhID0gbmV3IEJ1ZmZlcihvcmlnaW5hbERhdGEsICdiaW5hcnknKS50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgXCJ1cmwoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsI3tiYXNlNjREYXRhfScpXCJcblxuICBzaG93RXJyb3I6IChyZXN1bHQpIC0+XG4gICAgZmFpbHVyZU1lc3NhZ2UgPSByZXN1bHQ/Lm1lc3NhZ2VcblxuICAgIEBodG1sICQkJCAtPlxuICAgICAgQGgyICdQcmV2aWV3aW5nIE1hcmtkb3duIEZhaWxlZCdcbiAgICAgIEBoMyBmYWlsdXJlTWVzc2FnZSBpZiBmYWlsdXJlTWVzc2FnZT9cblxuICBzaG93TG9hZGluZzogLT5cbiAgICBAbG9hZGluZyA9IHRydWVcbiAgICBAaHRtbCAkJCQgLT5cbiAgICAgIEBkaXYgY2xhc3M6ICdtYXJrZG93bi1zcGlubmVyJywgJ0xvYWRpbmcgTWFya2Rvd25cXHUyMDI2J1xuXG4gIGNvcHlUb0NsaXBib2FyZDogLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgQGxvYWRpbmdcblxuICAgIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKVxuICAgIHNlbGVjdGVkVGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpXG4gICAgc2VsZWN0ZWROb2RlID0gc2VsZWN0aW9uLmJhc2VOb2RlXG5cbiAgICAjIFVzZSBkZWZhdWx0IGNvcHkgZXZlbnQgaGFuZGxlciBpZiB0aGVyZSBpcyBzZWxlY3RlZCB0ZXh0IGluc2lkZSB0aGlzIHZpZXdcbiAgICByZXR1cm4gZmFsc2UgaWYgc2VsZWN0ZWRUZXh0IGFuZCBzZWxlY3RlZE5vZGU/IGFuZCAoQFswXSBpcyBzZWxlY3RlZE5vZGUgb3IgJC5jb250YWlucyhAWzBdLCBzZWxlY3RlZE5vZGUpKVxuXG4gICAgQGdldEhUTUwgKGVycm9yLCBodG1sKSAtPlxuICAgICAgaWYgZXJyb3I/XG4gICAgICAgIGNvbnNvbGUud2FybignQ29weWluZyBNYXJrZG93biBhcyBIVE1MIGZhaWxlZCcsIGVycm9yKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShodG1sKVxuXG4gICAgdHJ1ZVxuXG4gIHNhdmVBczogLT5cbiAgICByZXR1cm4gaWYgQGxvYWRpbmdcblxuICAgIGZpbGVQYXRoID0gQGdldFBhdGgoKVxuICAgIHRpdGxlID0gJ01hcmtkb3duIHRvIEhUTUwnXG4gICAgaWYgZmlsZVBhdGhcbiAgICAgIHRpdGxlID0gcGF0aC5wYXJzZShmaWxlUGF0aCkubmFtZVxuICAgICAgZmlsZVBhdGggKz0gJy5odG1sJ1xuICAgIGVsc2VcbiAgICAgIGZpbGVQYXRoID0gJ3VudGl0bGVkLm1kLmh0bWwnXG4gICAgICBpZiBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKHByb2plY3RQYXRoLCBmaWxlUGF0aClcblxuICAgIGlmIGh0bWxGaWxlUGF0aCA9IGF0b20uc2hvd1NhdmVEaWFsb2dTeW5jKGZpbGVQYXRoKVxuXG4gICAgICBAZ2V0SFRNTCAoZXJyb3IsIGh0bWxCb2R5KSA9PlxuICAgICAgICBpZiBlcnJvcj9cbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1NhdmluZyBNYXJrZG93biBhcyBIVE1MIGZhaWxlZCcsIGVycm9yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgQHJlbmRlckxhVGVYXG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gXCJcIlwiXG5cbiAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVwidGV4dC94LW1hdGhqYXgtY29uZmlnXCI+XG4gICAgICAgICAgICAgICAgTWF0aEpheC5IdWIuQ29uZmlnKHtcbiAgICAgICAgICAgICAgICAgIGpheDogW1wiaW5wdXQvVGVYXCIsXCJvdXRwdXQvSFRNTC1DU1NcIl0sXG4gICAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBbXSxcbiAgICAgICAgICAgICAgICAgIFRlWDoge1xuICAgICAgICAgICAgICAgICAgICBleHRlbnNpb25zOiBbXCJBTVNtYXRoLmpzXCIsXCJBTVNzeW1ib2xzLmpzXCIsXCJub0Vycm9ycy5qc1wiLFwibm9VbmRlZmluZWQuanNcIl1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBzaG93TWF0aE1lbnU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgICA8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCJodHRwczovL2Nkbi5tYXRoamF4Lm9yZy9tYXRoamF4L2xhdGVzdC9NYXRoSmF4LmpzXCI+XG4gICAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBtYXRoamF4U2NyaXB0ID0gXCJcIlxuICAgICAgICAgIGh0bWwgPSBcIlwiXCJcbiAgICAgICAgICAgIDwhRE9DVFlQRSBodG1sPlxuICAgICAgICAgICAgPGh0bWw+XG4gICAgICAgICAgICAgIDxoZWFkPlxuICAgICAgICAgICAgICAgICAgPG1ldGEgY2hhcnNldD1cInV0Zi04XCIgLz5cbiAgICAgICAgICAgICAgICAgIDx0aXRsZT4je3RpdGxlfTwvdGl0bGU+I3ttYXRoamF4U2NyaXB0fVxuICAgICAgICAgICAgICAgICAgPHN0eWxlPiN7QGdldE1hcmtkb3duUHJldmlld0NTUygpfTwvc3R5bGU+XG4gICAgICAgICAgICAgIDwvaGVhZD5cbiAgICAgICAgICAgICAgPGJvZHkgY2xhc3M9J21hcmtkb3duLXByZXZpZXcnPiN7aHRtbEJvZHl9PC9ib2R5PlxuICAgICAgICAgICAgPC9odG1sPlwiXCJcIiArIFwiXFxuXCIgIyBFbnN1cmUgdHJhaWxpbmcgbmV3bGluZVxuXG4gICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhodG1sRmlsZVBhdGgsIGh0bWwpXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihodG1sRmlsZVBhdGgpXG5cbiAgaXNFcXVhbDogKG90aGVyKSAtPlxuICAgIEBbMF0gaXMgb3RoZXI/WzBdICMgQ29tcGFyZSBET00gZWxlbWVudHNcblxuICAjXG4gICMgRmluZCB0aGUgY2xvc2VzdCBhbmNlc3RvciBvZiBhbiBlbGVtZW50IHRoYXQgaXMgbm90IGEgZGVjZW5kYW50IG9mIGVpdGhlclxuICAjIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAjXG4gICMgQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCBmcm9tIHdoaWNoIHRoZSBzZWFyY2ggZm9yIGFcbiAgIyAgIGNsb3Nlc3QgYW5jZXN0b3IgYmVnaW5zLlxuICAjIEByZXR1cm4ge0hUTUxFbGVtZW50fSBUaGUgY2xvc2VzdCBhbmNlc3RvciB0byBgZWxlbWVudGAgdGhhdCBkb2VzIG5vdFxuICAjICAgY29udGFpbiBlaXRoZXIgYHNwYW4ubWF0aGAgb3IgYHNwYW4uYXRvbS10ZXh0LWVkaXRvcmAuXG4gICNcbiAgYnViYmxlVG9Db250YWluZXJFbGVtZW50OiAoZWxlbWVudCkgLT5cbiAgICB0ZXN0RWxlbWVudCA9IGVsZW1lbnRcbiAgICB3aGlsZSB0ZXN0RWxlbWVudCBpc250IGRvY3VtZW50LmJvZHlcbiAgICAgIHBhcmVudCA9IHRlc3RFbGVtZW50LnBhcmVudE5vZGVcbiAgICAgIHJldHVybiBwYXJlbnQucGFyZW50Tm9kZSBpZiBwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdNYXRoSmF4X0Rpc3BsYXknKVxuICAgICAgcmV0dXJuIHBhcmVudCBpZiBwYXJlbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhdG9tLXRleHQtZWRpdG9yJylcbiAgICAgIHRlc3RFbGVtZW50ID0gcGFyZW50XG4gICAgcmV0dXJuIGVsZW1lbnRcblxuICAjXG4gICMgRGV0ZXJtaW5lIGEgc3Vic2VxdWVuY2Ugb2YgYSBzZXF1ZW5jZSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aCB0aHJvdWdoXG4gICMgSFRNTEVsZW1lbnRzIHRoYXQgZG9lcyBub3QgY29udGludWUgZGVlcGVyIHRoYW4gYSB0YWJsZSBlbGVtZW50LlxuICAjXG4gICMgQHBhcmFtIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IHBhdGhUb1Rva2VuIEFycmF5IG9mIHRva2Vuc1xuICAjICAgcmVwcmVzZW50aW5nIGEgcGF0aCB0byBhIEhUTUxFbGVtZW50IHdpdGggdGhlIHJvb3QgZWxlbWVudCBhdFxuICAjICAgcGF0aFRvVG9rZW5bMF0gYW5kIHRoZSB0YXJnZXQgZWxlbWVudCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50XG4gICMgICBjb25zaXN0cyBvZiBhIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHNcbiAgIyAgIHNpYmxpbmcgZWxlbWVudHMgb2YgdGhlIHNhbWUgYHRhZ2AuXG4gICMgQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBUaGUgc3Vic2VxdWVuY2Ugb2YgcGF0aFRvVG9rZW4gdGhhdFxuICAjICAgbWFpbnRhaW5zIHRoZSBzYW1lIHJvb3QgYnV0IHRlcm1pbmF0ZXMgYXQgYSB0YWJsZSBlbGVtZW50IG9yIHRoZSB0YXJnZXRcbiAgIyAgIGVsZW1lbnQsIHdoaWNoZXZlciBjb21lcyBmaXJzdC5cbiAgI1xuICBidWJibGVUb0NvbnRhaW5lclRva2VuOiAocGF0aFRvVG9rZW4pIC0+XG4gICAgZm9yIGkgaW4gWzAuLihwYXRoVG9Ub2tlbi5sZW5ndGgtMSldIGJ5IDFcbiAgICAgIHJldHVybiBwYXRoVG9Ub2tlbi5zbGljZSgwLCBpKzEpIGlmIHBhdGhUb1Rva2VuW2ldLnRhZyBpcyAndGFibGUnXG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG5cbiAgI1xuICAjIEVuY29kZSB0YWdzIGZvciBtYXJrZG93bi1pdC5cbiAgI1xuICAjIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgRW5jb2RlIHRoZSB0YWcgb2YgZWxlbWVudC5cbiAgIyBAcmV0dXJuIHtzdHJpbmd9IEVuY29kZWQgdGFnLlxuICAjXG4gIGVuY29kZVRhZzogKGVsZW1lbnQpIC0+XG4gICAgcmV0dXJuICdtYXRoJyBpZiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWF0aCcpXG4gICAgcmV0dXJuICdjb2RlJyBpZiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnYXRvbS10ZXh0LWVkaXRvcicpICMgb25seSB0b2tlbi50eXBlIGlzIGBmZW5jZWAgY29kZSBibG9ja3Mgc2hvdWxkIGV2ZXIgYmUgZm91bmQgaW4gdGhlIGZpcnN0IGxldmVsIG9mIHRoZSB0b2tlbnMgYXJyYXlcbiAgICByZXR1cm4gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKClcblxuICAjXG4gICMgRGVjb2RlIHRhZ3MgdXNlZCBieSBtYXJrZG93bi1pdFxuICAjXG4gICMgQHBhcmFtIHttYXJrZG93bi1pdC5Ub2tlbn0gdG9rZW4gRGVjb2RlIHRoZSB0YWcgb2YgdG9rZW4uXG4gICMgQHJldHVybiB7c3RyaW5nfG51bGx9IERlY29kZWQgdGFnIG9yIGBudWxsYCBpZiB0aGUgdG9rZW4gaGFzIG5vIHRhZy5cbiAgI1xuICBkZWNvZGVUYWc6ICh0b2tlbikgLT5cbiAgICByZXR1cm4gJ3NwYW4nIGlmIHRva2VuLnRhZyBpcyAnbWF0aCdcbiAgICByZXR1cm4gJ3NwYW4nIGlmIHRva2VuLnRhZyBpcyAnY29kZSdcbiAgICByZXR1cm4gbnVsbCBpZiB0b2tlbi50YWcgaXMgXCJcIlxuICAgIHJldHVybiB0b2tlbi50YWdcblxuICAjXG4gICMgRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgZWxlbWVudCBmcm9tIGEgY29udGFpbmVyIGAubWFya2Rvd24tcHJldmlld2AuXG4gICNcbiAgIyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBIVE1MRWxlbWVudC5cbiAgIyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IG9mIHRva2VucyByZXByZXNlbnRpbmcgYSBwYXRoXG4gICMgICB0byBgZWxlbWVudGAgZnJvbSBgLm1hcmtkb3duLXByZXZpZXdgLiBUaGUgcm9vdCBgLm1hcmtkb3duLXByZXZpZXdgXG4gICMgICBlbGVtZW50IGlzIHRoZSBmaXJzdCBlbGVtZW50cyBpbiB0aGUgYXJyYXkgYW5kIHRoZSB0YXJnZXQgZWxlbWVudFxuICAjICAgYGVsZW1lbnRgIGF0IHRoZSBoaWdoZXN0IGluZGV4LiBFYWNoIGVsZW1lbnQgY29uc2lzdHMgb2YgYSBgdGFnYCBhbmRcbiAgIyAgIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lXG4gICMgICBgdGFnYC5cbiAgI1xuICBnZXRQYXRoVG9FbGVtZW50OiAoZWxlbWVudCkgPT5cbiAgICBpZiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbWFya2Rvd24tcHJldmlldycpXG4gICAgICByZXR1cm4gW1xuICAgICAgICB0YWc6ICdkaXYnXG4gICAgICAgIGluZGV4OiAwXG4gICAgICBdXG5cbiAgICBlbGVtZW50ICAgICAgID0gQGJ1YmJsZVRvQ29udGFpbmVyRWxlbWVudCBlbGVtZW50XG4gICAgdGFnICAgICAgICAgICA9IEBlbmNvZGVUYWcgZWxlbWVudFxuICAgIHNpYmxpbmdzICAgICAgPSBlbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2Rlc1xuICAgIHNpYmxpbmdzQ291bnQgPSAwXG5cbiAgICBmb3Igc2libGluZyBpbiBzaWJsaW5nc1xuICAgICAgc2libGluZ1RhZyAgPSBpZiBzaWJsaW5nLm5vZGVUeXBlIGlzIDEgdGhlbiBAZW5jb2RlVGFnKHNpYmxpbmcpIGVsc2UgbnVsbFxuICAgICAgaWYgc2libGluZyBpcyBlbGVtZW50XG4gICAgICAgIHBhdGhUb0VsZW1lbnQgPSBAZ2V0UGF0aFRvRWxlbWVudChlbGVtZW50LnBhcmVudE5vZGUpXG4gICAgICAgIHBhdGhUb0VsZW1lbnQucHVzaFxuICAgICAgICAgIHRhZzogdGFnXG4gICAgICAgICAgaW5kZXg6IHNpYmxpbmdzQ291bnRcbiAgICAgICAgcmV0dXJuIHBhdGhUb0VsZW1lbnRcbiAgICAgIGVsc2UgaWYgc2libGluZ1RhZyBpcyB0YWdcbiAgICAgICAgc2libGluZ3NDb3VudCsrXG5cbiAgICByZXR1cm5cblxuICAjXG4gICMgU2V0IHRoZSBhc3NvY2lhdGVkIGVkaXRvcnMgY3Vyc29yIGJ1ZmZlciBwb3NpdGlvbiB0byB0aGUgbGluZSByZXByZXNlbnRpbmdcbiAgIyB0aGUgc291cmNlIG1hcmtkb3duIG9mIGEgdGFyZ2V0IGVsZW1lbnQuXG4gICNcbiAgIyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAjIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGFyZ2V0IGVsZW1lbnQgY29udGFpbmVkIHdpdGhpbiB0aGUgYXNzb2ljYXRlZFxuICAjICAgYC5tYXJrZG93bi1wcmV2aWV3YCBjb250YWluZXIuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvIGlkZW50aWZ5IHRoZVxuICAjICAgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YCBhbmQgc2V0IHRoZSBjdXJzb3IgdG8gdGhhdCBsaW5lLlxuICAjIEByZXR1cm4ge251bWJlcnxudWxsfSBUaGUgbGluZSBvZiBgdGV4dGAgdGhhdCByZXByZXNlbnRzIGBlbGVtZW50YC4gSWYgbm9cbiAgIyAgIGxpbmUgaXMgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gICNcbiAgc3luY1NvdXJjZTogKHRleHQsIGVsZW1lbnQpID0+XG4gICAgcGF0aFRvRWxlbWVudCA9IEBnZXRQYXRoVG9FbGVtZW50IGVsZW1lbnRcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgIyByZW1vdmUgZGl2Lm1hcmtkb3duLXByZXZpZXdcbiAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KCkgIyByZW1vdmUgZGl2LnVwZGF0ZS1wcmV2aWV3XG4gICAgcmV0dXJuIHVubGVzcyBwYXRoVG9FbGVtZW50Lmxlbmd0aFxuXG4gICAgbWFya2Rvd25JdCAgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1pdC1oZWxwZXInXG4gICAgdG9rZW5zICAgICAgPSBtYXJrZG93bkl0LmdldFRva2VucyB0ZXh0LCBAcmVuZGVyTGFUZVhcbiAgICBmaW5hbFRva2VuICA9IG51bGxcbiAgICBsZXZlbCAgICAgICA9IDBcblxuICAgIGZvciB0b2tlbiBpbiB0b2tlbnNcbiAgICAgIGJyZWFrIGlmIHRva2VuLmxldmVsIDwgbGV2ZWxcbiAgICAgIGNvbnRpbnVlIGlmIHRva2VuLmhpZGRlblxuICAgICAgaWYgdG9rZW4udGFnIGlzIHBhdGhUb0VsZW1lbnRbMF0udGFnIGFuZCB0b2tlbi5sZXZlbCBpcyBsZXZlbFxuICAgICAgICBpZiB0b2tlbi5uZXN0aW5nIGlzIDFcbiAgICAgICAgICBpZiBwYXRoVG9FbGVtZW50WzBdLmluZGV4IGlzIDBcbiAgICAgICAgICAgIGZpbmFsVG9rZW4gPSB0b2tlbiBpZiB0b2tlbi5tYXA/XG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50LnNoaWZ0KClcbiAgICAgICAgICAgIGxldmVsKytcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwYXRoVG9FbGVtZW50WzBdLmluZGV4LS1cbiAgICAgICAgZWxzZSBpZiB0b2tlbi5uZXN0aW5nIGlzIDAgYW5kIHRva2VuLnRhZyBpbiBbJ21hdGgnLCAnY29kZScsICdociddXG4gICAgICAgICAgaWYgcGF0aFRvRWxlbWVudFswXS5pbmRleCBpcyAwXG4gICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW5cbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICBicmVhayBpZiBwYXRoVG9FbGVtZW50Lmxlbmd0aCBpcyAwXG5cbiAgICBpZiBmaW5hbFRva2VuP1xuICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbZmluYWxUb2tlbi5tYXBbMF0sIDBdXG4gICAgICByZXR1cm4gZmluYWxUb2tlbi5tYXBbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICNcbiAgIyBEZXRlcm1pbmUgcGF0aCB0byBhIHRhcmdldCB0b2tlbi5cbiAgI1xuICAjIEBwYXJhbSB7KG1hcmtkb3duLWl0LlRva2VuKVtdfSB0b2tlbnMgQXJyYXkgb2YgdG9rZW5zIGFzIHJldHVybmVkIGJ5XG4gICMgICBgbWFya2Rvd24taXQucGFyc2UoKWAuXG4gICMgQHBhcmFtIHtudW1iZXJ9IGxpbmUgTGluZSByZXByZXNlbnRpbmcgdGhlIHRhcmdldCB0b2tlbi5cbiAgIyBAcmV0dXJuIHsodGFnOiA8dGFnPiwgaW5kZXg6IDxpbmRleD4pW119IEFycmF5IHJlcHJlc2VudGluZyBhIHBhdGggdG8gdGhlXG4gICMgICB0YXJnZXQgdG9rZW4uIFRoZSByb290IHRva2VuIGlzIHJlcHJlc2VudGVkIGJ5IHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZVxuICAjICAgYXJyYXkgYW5kIHRoZSB0YXJnZXQgdG9rZW4gYnkgdGhlIGxhc3QgZWxtZW50LiBFYWNoIGVsZW1lbnQgY29uc2lzdHMgb2YgYVxuICAjICAgYHRhZ2AgYW5kIGBpbmRleGAgcmVwcmVzZW50aW5nIGl0cyBpbmRleCBhbW9uZ3N0IGl0cyBzaWJsaW5nIHRva2VucyBpblxuICAjICAgYHRva2Vuc2Agb2YgdGhlIHNhbWUgYHRhZ2AuIGBsaW5lYCB3aWxsIGxpZSBiZXR3ZWVuIHRoZSBwcm9wZXJ0aWVzXG4gICMgICBgbWFwWzBdYCBhbmQgYG1hcFsxXWAgb2YgdGhlIHRhcmdldCB0b2tlbi5cbiAgI1xuICBnZXRQYXRoVG9Ub2tlbjogKHRva2VucywgbGluZSkgPT5cbiAgICBwYXRoVG9Ub2tlbiAgID0gW11cbiAgICB0b2tlblRhZ0NvdW50ID0gW11cbiAgICBsZXZlbCAgICAgICAgID0gMFxuXG4gICAgZm9yIHRva2VuIGluIHRva2Vuc1xuICAgICAgYnJlYWsgaWYgdG9rZW4ubGV2ZWwgPCBsZXZlbFxuICAgICAgY29udGludWUgaWYgdG9rZW4uaGlkZGVuXG4gICAgICBjb250aW51ZSBpZiB0b2tlbi5uZXN0aW5nIGlzIC0xXG5cbiAgICAgIHRva2VuLnRhZyA9IEBkZWNvZGVUYWcgdG9rZW5cbiAgICAgIGNvbnRpbnVlIHVubGVzcyB0b2tlbi50YWc/XG5cbiAgICAgIGlmIHRva2VuLm1hcD8gYW5kIGxpbmUgPj0gdG9rZW4ubWFwWzBdIGFuZCBsaW5lIDw9ICh0b2tlbi5tYXBbMV0tMSlcbiAgICAgICAgaWYgdG9rZW4ubmVzdGluZyBpcyAxXG4gICAgICAgICAgcGF0aFRvVG9rZW4ucHVzaFxuICAgICAgICAgICAgdGFnOiB0b2tlbi50YWdcbiAgICAgICAgICAgIGluZGV4OiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gPyAwXG4gICAgICAgICAgdG9rZW5UYWdDb3VudCA9IFtdXG4gICAgICAgICAgbGV2ZWwrK1xuICAgICAgICBlbHNlIGlmIHRva2VuLm5lc3RpbmcgaXMgMFxuICAgICAgICAgIHBhdGhUb1Rva2VuLnB1c2hcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnXG4gICAgICAgICAgICBpbmRleDogdG9rZW5UYWdDb3VudFt0b2tlbi50YWddID8gMFxuICAgICAgICAgIGJyZWFrXG4gICAgICBlbHNlIGlmIHRva2VuLmxldmVsIGlzIGxldmVsXG4gICAgICAgIGlmIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXT9cbiAgICAgICAgdGhlbiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10rK1xuICAgICAgICBlbHNlIHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA9IDFcblxuICAgIHBhdGhUb1Rva2VuID0gQGJ1YmJsZVRvQ29udGFpbmVyVG9rZW4gcGF0aFRvVG9rZW5cbiAgICByZXR1cm4gcGF0aFRvVG9rZW5cblxuICAjXG4gICMgU2Nyb2xsIHRoZSBhc3NvY2lhdGVkIHByZXZpZXcgdG8gdGhlIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgbGluZSBvZlxuICAjIG9mIHRoZSBzb3VyY2UgbWFya2Rvd24uXG4gICNcbiAgIyBAcGFyYW0ge3N0cmluZ30gdGV4dCBTb3VyY2UgbWFya2Rvd24gb2YgdGhlIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAjIEBwYXJhbSB7bnVtYmVyfSBsaW5lIFRhcmdldCBsaW5lIG9mIGB0ZXh0YC4gVGhlIG1ldGhvZCB3aWxsIGF0dGVtcHQgdG9cbiAgIyAgIGlkZW50aWZ5IHRoZSBlbG1lbnQgb2YgdGhlIGFzc29jaWF0ZWQgYC5tYXJrZG93bi1wcmV2aWV3YCB0aGF0IHJlcHJlc2VudHNcbiAgIyAgIGBsaW5lYCBhbmQgc2Nyb2xsIHRoZSBgLm1hcmtkb3duLXByZXZpZXdgIHRvIHRoYXQgZWxlbWVudC5cbiAgIyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIGBsaW5lYC4gSWYgbm8gZWxlbWVudCBpc1xuICAjICAgaWRlbnRpZmllZCBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gICNcbiAgc3luY1ByZXZpZXc6ICh0ZXh0LCBsaW5lKSA9PlxuICAgIG1hcmtkb3duSXQgID89IHJlcXVpcmUgJy4vbWFya2Rvd24taXQtaGVscGVyJ1xuICAgIHRva2VucyAgICAgID0gbWFya2Rvd25JdC5nZXRUb2tlbnMgdGV4dCwgQHJlbmRlckxhVGVYXG4gICAgcGF0aFRvVG9rZW4gPSBAZ2V0UGF0aFRvVG9rZW4gdG9rZW5zLCBsaW5lXG5cbiAgICBlbGVtZW50ID0gQGZpbmQoJy51cGRhdGUtcHJldmlldycpLmVxKDApXG4gICAgZm9yIHRva2VuIGluIHBhdGhUb1Rva2VuXG4gICAgICBjYW5kaWRhdGVFbGVtZW50ID0gZWxlbWVudC5jaGlsZHJlbih0b2tlbi50YWcpLmVxKHRva2VuLmluZGV4KVxuICAgICAgaWYgY2FuZGlkYXRlRWxlbWVudC5sZW5ndGggaXNudCAwXG4gICAgICB0aGVuIGVsZW1lbnQgPSBjYW5kaWRhdGVFbGVtZW50XG4gICAgICBlbHNlIGJyZWFrXG5cbiAgICByZXR1cm4gbnVsbCBpZiBlbGVtZW50WzBdLmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKSAjIERvIG5vdCBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIHByZXZpZXcgZm9yIGJhZCBzeW5jc1xuXG4gICAgZWxlbWVudFswXS5zY3JvbGxJbnRvVmlldygpIHVubGVzcyBlbGVtZW50WzBdLmNsYXNzTGlzdC5jb250YWlucygndXBkYXRlLXByZXZpZXcnKVxuICAgIG1heFNjcm9sbFRvcCA9IEBlbGVtZW50LnNjcm9sbEhlaWdodCAtIEBpbm5lckhlaWdodCgpXG4gICAgQGVsZW1lbnQuc2Nyb2xsVG9wIC09IEBpbm5lckhlaWdodCgpLzQgdW5sZXNzIEBzY3JvbGxUb3AoKSA+PSBtYXhTY3JvbGxUb3BcblxuICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2ZsYXNoJylcbiAgICBzZXRUaW1lb3V0ICggLT4gZWxlbWVudC5yZW1vdmVDbGFzcygnZmxhc2gnKSApLCAxMDAwXG5cbiAgICByZXR1cm4gZWxlbWVudFswXVxuXG5pZiBHcmltLmluY2x1ZGVEZXByZWNhdGVkQVBJc1xuICBNYXJrZG93blByZXZpZXdWaWV3OjpvbiA9IChldmVudE5hbWUpIC0+XG4gICAgaWYgZXZlbnROYW1lIGlzICdtYXJrZG93bi1wcmV2aWV3Om1hcmtkb3duLWNoYW5nZWQnXG4gICAgICBHcmltLmRlcHJlY2F0ZShcIlVzZSBNYXJrZG93blByZXZpZXdWaWV3OjpvbkRpZENoYW5nZU1hcmtkb3duIGluc3RlYWQgb2YgdGhlICdtYXJrZG93bi1wcmV2aWV3Om1hcmtkb3duLWNoYW5nZWQnIGpRdWVyeSBldmVudFwiKVxuICAgIHN1cGVyXG4iXX0=
