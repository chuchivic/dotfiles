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
              results.push(img.src = "" + src);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYXJrZG93bi1wcmV2aWV3LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3S0FBQTtJQUFBOzs7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQTZDLE9BQUEsQ0FBUSxNQUFSLENBQTdDLEVBQUMscUJBQUQsRUFBVSwyQkFBVixFQUFzQjs7RUFDdEIsT0FBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsVUFBRCxFQUFJLGNBQUosRUFBUzs7RUFDVCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0osT0FBUSxPQUFBLENBQVEsTUFBUjs7RUFFVCxRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsYUFBQSxHQUFnQixPQUFBLENBQVEsa0JBQVI7O0VBQ2hCLFVBQUEsR0FBYTs7RUFDYixZQUFBLEdBQWU7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNDQUFQO1FBQStDLFFBQUEsRUFBVSxDQUFDLENBQTFEO09BQUwsRUFBa0UsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUVoRSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDtXQUFMO1FBRmdFO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRTtJQURROztJQUtHLDZCQUFDLEdBQUQ7TUFBRSxJQUFDLENBQUEsZUFBQSxVQUFVLElBQUMsQ0FBQSxlQUFBOzs7OztN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QXJCLENBQThCLGdCQUE5QixDQUFuQztRQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxjQUFYLENBQUEsRUFBQTs7TUFDQSxZQUFBLEdBQWUsSUFBQyxDQUFBLE9BQU8sQ0FBQyxZQUFULEdBQXdCLElBQUMsQ0FBQSxXQUFELENBQUE7TUFDdkMsSUFBQSxDQUFBLENBQThDLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxJQUFnQixZQUE5RCxDQUFBO1FBQUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFULElBQXNCLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBQSxHQUFlLEVBQXJDOztNQUVBLE9BQU8sQ0FBQyxRQUFSLENBQWlCLE9BQWpCO01BQ0EsVUFBQSxDQUFXLENBQUUsU0FBQTtlQUFHLE9BQU8sQ0FBQyxXQUFSLENBQW9CLE9BQXBCO01BQUgsQ0FBRixDQUFYLEVBQWdELElBQWhEO0FBRUEsYUFBTyxPQUFRLENBQUEsQ0FBQTtJQXJCSjs7OztLQXpoQm1COztFQWdqQmxDLElBQUcsSUFBSSxDQUFDLHFCQUFSO0lBQ0UsbUJBQW1CLENBQUEsU0FBRSxDQUFBLEVBQXJCLEdBQTBCLFNBQUMsU0FBRDtNQUN4QixJQUFHLFNBQUEsS0FBYSxtQ0FBaEI7UUFDRSxJQUFJLENBQUMsU0FBTCxDQUFlLDhHQUFmLEVBREY7O2FBRUEsNkNBQUEsU0FBQTtJQUh3QixFQUQ1Qjs7QUEvakJBIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbntFbWl0dGVyLCBEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgJCQkLCBTY3JvbGxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuR3JpbSA9IHJlcXVpcmUgJ2dyaW0nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xue0ZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcblxucmVuZGVyZXIgPSByZXF1aXJlICcuL3JlbmRlcmVyJ1xuVXBkYXRlUHJldmlldyA9IHJlcXVpcmUgJy4vdXBkYXRlLXByZXZpZXcnXG5tYXJrZG93bkl0ID0gbnVsbCAjIERlZmVyIHVudGlsIHVzZWRcbmltYWdlV2F0Y2hlciA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWFya2Rvd25QcmV2aWV3VmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ21hcmtkb3duLXByZXZpZXcgbmF0aXZlLWtleS1iaW5kaW5ncycsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgICMgSWYgeW91IGRvbnQgZXhwbGljaXRseSBkZWNsYXJlIGEgY2xhc3MgdGhlbiB0aGUgZWxlbWVudHMgd29udCBiZSBjcmVhdGVkXG4gICAgICBAZGl2IGNsYXNzOiAndXBkYXRlLXByZXZpZXcnXG5cbiAgY29uc3RydWN0b3I6ICh7QGVkaXRvcklkLCBAZmlsZVBhdGh9KSAtPlxuICAgIEB1cGRhdGVQcmV2aWV3ICA9IG51bGxcbiAgICBAcmVuZGVyTGFUZVggICAgPSBhdG9tLmNvbmZpZy5nZXQgJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVMYXRleFJlbmRlcmluZ0J5RGVmYXVsdCdcbiAgICBzdXBlclxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBsb2FkZWQgPSB0cnVlICMgRG8gbm90IHNob3cgdGhlIGxvYWRpbmcgc3Bpbm5vciBvbiBpbml0aWFsIGxvYWRcblxuICBhdHRhY2hlZDogLT5cbiAgICByZXR1cm4gaWYgQGlzQXR0YWNoZWRcbiAgICBAaXNBdHRhY2hlZCA9IHRydWVcblxuICAgIGlmIEBlZGl0b3JJZD9cbiAgICAgIEByZXNvbHZlRWRpdG9yKEBlZGl0b3JJZClcbiAgICBlbHNlXG4gICAgICBpZiBhdG9tLndvcmtzcGFjZT9cbiAgICAgICAgQHN1YnNjcmliZVRvRmlsZVBhdGgoQGZpbGVQYXRoKVxuICAgICAgZWxzZVxuICAgICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICAgIEBzdWJzY3JpYmVUb0ZpbGVQYXRoKEBmaWxlUGF0aClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZGVzZXJpYWxpemVyOiAnTWFya2Rvd25QcmV2aWV3VmlldydcbiAgICBmaWxlUGF0aDogQGdldFBhdGgoKSA/IEBmaWxlUGF0aFxuICAgIGVkaXRvcklkOiBAZWRpdG9ySWRcblxuICBkZXN0cm95OiAtPlxuICAgIGltYWdlV2F0Y2hlciA/PSByZXF1aXJlICcuL2ltYWdlLXdhdGNoLWhlbHBlcidcbiAgICBpbWFnZVdhdGNoZXIucmVtb3ZlRmlsZShAZ2V0UGF0aCgpKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBvbkRpZENoYW5nZVRpdGxlOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtdGl0bGUnLCBjYWxsYmFja1xuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQ6IChjYWxsYmFjaykgLT5cbiAgICAjIE5vIG9wIHRvIHN1cHByZXNzIGRlcHJlY2F0aW9uIHdhcm5pbmdcbiAgICBuZXcgRGlzcG9zYWJsZVxuXG4gIG9uRGlkQ2hhbmdlTWFya2Rvd246IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS1tYXJrZG93bicsIGNhbGxiYWNrXG5cbiAgc3Vic2NyaWJlVG9GaWxlUGF0aDogKGZpbGVQYXRoKSAtPlxuICAgIEBmaWxlID0gbmV3IEZpbGUoZmlsZVBhdGgpXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS10aXRsZSdcbiAgICBAaGFuZGxlRXZlbnRzKClcbiAgICBAcmVuZGVyTWFya2Rvd24oKVxuXG4gIHJlc29sdmVFZGl0b3I6IChlZGl0b3JJZCkgLT5cbiAgICByZXNvbHZlID0gPT5cbiAgICAgIEBlZGl0b3IgPSBAZWRpdG9yRm9ySWQoZWRpdG9ySWQpXG5cbiAgICAgIGlmIEBlZGl0b3I/XG4gICAgICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtdGl0bGUnIGlmIEBlZGl0b3I/XG4gICAgICAgIEBoYW5kbGVFdmVudHMoKVxuICAgICAgICBAcmVuZGVyTWFya2Rvd24oKVxuICAgICAgZWxzZVxuICAgICAgICAjIFRoZSBlZGl0b3IgdGhpcyBwcmV2aWV3IHdhcyBjcmVhdGVkIGZvciBoYXMgYmVlbiBjbG9zZWQgc28gY2xvc2VcbiAgICAgICAgIyB0aGlzIHByZXZpZXcgc2luY2UgYSBwcmV2aWV3IGNhbm5vdCBiZSByZW5kZXJlZCB3aXRob3V0IGFuIGVkaXRvclxuICAgICAgICBhdG9tLndvcmtzcGFjZT8ucGFuZUZvckl0ZW0odGhpcyk/LmRlc3Ryb3lJdGVtKHRoaXMpXG5cbiAgICBpZiBhdG9tLndvcmtzcGFjZT9cbiAgICAgIHJlc29sdmUoKVxuICAgIGVsc2VcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlSW5pdGlhbFBhY2thZ2VzKHJlc29sdmUpXG5cbiAgZWRpdG9yRm9ySWQ6IChlZGl0b3JJZCkgLT5cbiAgICBmb3IgZWRpdG9yIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIHJldHVybiBlZGl0b3IgaWYgZWRpdG9yLmlkPy50b1N0cmluZygpIGlzIGVkaXRvcklkLnRvU3RyaW5nKClcbiAgICBudWxsXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5ncmFtbWFycy5vbkRpZEFkZEdyYW1tYXIgPT4gXy5kZWJvdW5jZSgoPT4gQHJlbmRlck1hcmtkb3duKCkpLCAyNTApXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmdyYW1tYXJzLm9uRGlkVXBkYXRlR3JhbW1hciBfLmRlYm91bmNlKCg9PiBAcmVuZGVyTWFya2Rvd24oKSksIDI1MClcblxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2NvcmU6bW92ZS11cCc6ID0+XG4gICAgICAgIEBzY3JvbGxVcCgpXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiA9PlxuICAgICAgICBAc2Nyb2xsRG93bigpXG4gICAgICAnY29yZTpzYXZlLWFzJzogKGV2ZW50KSA9PlxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBAc2F2ZUFzKClcbiAgICAgICdjb3JlOmNvcHknOiAoZXZlbnQpID0+XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpIGlmIEBjb3B5VG9DbGlwYm9hcmQoKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLWluJzogPT5cbiAgICAgICAgem9vbUxldmVsID0gcGFyc2VGbG9hdChAY3NzKCd6b29tJykpIG9yIDFcbiAgICAgICAgQGNzcygnem9vbScsIHpvb21MZXZlbCArIC4xKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czp6b29tLW91dCc6ID0+XG4gICAgICAgIHpvb21MZXZlbCA9IHBhcnNlRmxvYXQoQGNzcygnem9vbScpKSBvciAxXG4gICAgICAgIEBjc3MoJ3pvb20nLCB6b29tTGV2ZWwgLSAuMSlcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6cmVzZXQtem9vbSc6ID0+XG4gICAgICAgIEBjc3MoJ3pvb20nLCAxKVxuICAgICAgJ21hcmtkb3duLXByZXZpZXctcGx1czpzeW5jLXNvdXJjZSc6IChldmVudCkgPT5cbiAgICAgICAgQGdldE1hcmtkb3duU291cmNlKCkudGhlbiAoc291cmNlKSA9PlxuICAgICAgICAgIHJldHVybiB1bmxlc3Mgc291cmNlP1xuICAgICAgICAgIEBzeW5jU291cmNlIHNvdXJjZSwgZXZlbnQudGFyZ2V0XG5cbiAgICBjaGFuZ2VIYW5kbGVyID0gPT5cbiAgICAgIEByZW5kZXJNYXJrZG93bigpXG5cbiAgICAgICMgVE9ETzogUmVtb3ZlIHBhbmVGb3JVUkkgY2FsbCB3aGVuIDo6cGFuZUZvckl0ZW0gaXMgcmVsZWFzZWRcbiAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbT8odGhpcykgPyBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKEBnZXRVUkkoKSlcbiAgICAgIGlmIHBhbmU/IGFuZCBwYW5lIGlzbnQgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtKHRoaXMpXG5cbiAgICBpZiBAZmlsZT9cbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGZpbGUub25EaWRDaGFuZ2UoY2hhbmdlSGFuZGxlcilcbiAgICBlbHNlIGlmIEBlZGl0b3I/XG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTdG9wQ2hhbmdpbmcgLT5cbiAgICAgICAgY2hhbmdlSGFuZGxlcigpIGlmIGF0b20uY29uZmlnLmdldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VQYXRoID0+IEBlbWl0dGVyLmVtaXQgJ2RpZC1jaGFuZ2UtdGl0bGUnXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3IuZ2V0QnVmZmVyKCkub25EaWRTYXZlIC0+XG4gICAgICAgIGNoYW5nZUhhbmRsZXIoKSB1bmxlc3MgYXRvbS5jb25maWcuZ2V0ICdtYXJrZG93bi1wcmV2aWV3LXBsdXMubGl2ZVVwZGF0ZSdcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZFJlbG9hZCAtPlxuICAgICAgICBjaGFuZ2VIYW5kbGVyKCkgdW5sZXNzIGF0b20uY29uZmlnLmdldCAnbWFya2Rvd24tcHJldmlldy1wbHVzLmxpdmVVcGRhdGUnXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkKCBhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvciksXG4gICAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6c3luYy1wcmV2aWV3JzogKGV2ZW50KSA9PlxuICAgICAgICAgIEBnZXRNYXJrZG93blNvdXJjZSgpLnRoZW4gKHNvdXJjZSkgPT5cbiAgICAgICAgICAgIHJldHVybiB1bmxlc3Mgc291cmNlP1xuICAgICAgICAgICAgQHN5bmNQcmV2aWV3IHNvdXJjZSwgQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyApXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdtYXJrZG93bi1wcmV2aWV3LXBsdXMuYnJlYWtPblNpbmdsZU5ld2xpbmUnLCBjaGFuZ2VIYW5kbGVyXG5cbiAgICAjIFRvZ2dsZSBMYVRlWCByZW5kZXJpbmcgaWYgZm9jdXMgaXMgb24gcHJldmlldyBwYW5lIG9yIGFzc29jaWF0ZWQgZWRpdG9yLlxuICAgIEBkaXNwb3NhYmxlcy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdtYXJrZG93bi1wcmV2aWV3LXBsdXM6dG9nZ2xlLXJlbmRlci1sYXRleCc6ID0+XG4gICAgICAgIGlmIChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpIGlzIHRoaXMpIG9yIChhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkgaXMgQGVkaXRvcilcbiAgICAgICAgICBAcmVuZGVyTGFUZVggPSBub3QgQHJlbmRlckxhVGVYXG4gICAgICAgICAgY2hhbmdlSGFuZGxlcigpXG4gICAgICAgIHJldHVyblxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlICdtYXJrZG93bi1wcmV2aWV3LXBsdXMudXNlR2l0SHViU3R5bGUnLCAodXNlR2l0SHViU3R5bGUpID0+XG4gICAgICBpZiB1c2VHaXRIdWJTdHlsZVxuICAgICAgICBAZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScsICcnKVxuICAgICAgZWxzZVxuICAgICAgICBAZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdXNlLWdpdGh1Yi1zdHlsZScpXG5cbiAgcmVuZGVyTWFya2Rvd246IC0+XG4gICAgQHNob3dMb2FkaW5nKCkgdW5sZXNzIEBsb2FkZWRcbiAgICBAZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuIChzb3VyY2UpID0+IEByZW5kZXJNYXJrZG93blRleHQoc291cmNlKSBpZiBzb3VyY2U/XG5cbiAgcmVmcmVzaEltYWdlczogKG9sZHNyYykgLT5cbiAgICBpbWdzID0gQGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcImltZ1tzcmNdXCIpXG4gICAgaW1hZ2VXYXRjaGVyID89IHJlcXVpcmUgJy4vaW1hZ2Utd2F0Y2gtaGVscGVyJ1xuICAgIGZvciBpbWcgaW4gaW1nc1xuICAgICAgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICAgIG1hdGNoID0gc3JjLm1hdGNoKC9eKC4qKVxcP3Y9KFxcZCspJC8pXG4gICAgICBbc3JjLCBvdl0gPSBtYXRjaD8uc2xpY2U/KDEpID8gW3NyY11cbiAgICAgIGlmIHNyYyBpcyBvbGRzcmNcbiAgICAgICAgb3YgPSBwYXJzZUludChvdikgaWYgb3Y/XG4gICAgICAgIHYgPSBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihzcmMsIEBnZXRQYXRoKCkpXG4gICAgICAgIGlmIHYgaXNudCBvdlxuICAgICAgICAgIGlmIHZcbiAgICAgICAgICAgIGltZy5zcmMgPSBcIiN7c3JjfT92PSN7dn1cIlxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGltZy5zcmMgPSBcIiN7c3JjfVwiXG5cbiAgZ2V0TWFya2Rvd25Tb3VyY2U6IC0+XG4gICAgaWYgQGZpbGU/LmdldFBhdGgoKVxuICAgICAgQGZpbGUucmVhZCgpXG4gICAgZWxzZSBpZiBAZWRpdG9yP1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKEBlZGl0b3IuZ2V0VGV4dCgpKVxuICAgIGVsc2VcbiAgICAgIFByb21pc2UucmVzb2x2ZShudWxsKVxuXG4gIGdldEhUTUw6IChjYWxsYmFjaykgLT5cbiAgICBAZ2V0TWFya2Rvd25Tb3VyY2UoKS50aGVuIChzb3VyY2UpID0+XG4gICAgICByZXR1cm4gdW5sZXNzIHNvdXJjZT9cblxuICAgICAgcmVuZGVyZXIudG9IVE1MIHNvdXJjZSwgQGdldFBhdGgoKSwgQGdldEdyYW1tYXIoKSwgQHJlbmRlckxhVGVYLCBmYWxzZSwgY2FsbGJhY2tcblxuICByZW5kZXJNYXJrZG93blRleHQ6ICh0ZXh0KSAtPlxuICAgIHJlbmRlcmVyLnRvRE9NRnJhZ21lbnQgdGV4dCwgQGdldFBhdGgoKSwgQGdldEdyYW1tYXIoKSwgQHJlbmRlckxhVGVYLCAoZXJyb3IsIGRvbUZyYWdtZW50KSA9PlxuICAgICAgaWYgZXJyb3JcbiAgICAgICAgQHNob3dFcnJvcihlcnJvcilcbiAgICAgIGVsc2VcbiAgICAgICAgQGxvYWRpbmcgPSBmYWxzZVxuICAgICAgICBAbG9hZGVkID0gdHJ1ZVxuICAgICAgICAjIGRpdi51cGRhdGUtcHJldmlldyBjcmVhdGVkIGFmdGVyIGNvbnN0cnVjdG9yIHN0IFVwZGF0ZVByZXZpZXcgY2Fubm90XG4gICAgICAgICMgYmUgaW5zdGFuY2VkIGluIHRoZSBjb25zdHJ1Y3RvclxuICAgICAgICB1bmxlc3MgQHVwZGF0ZVByZXZpZXdcbiAgICAgICAgICBAdXBkYXRlUHJldmlldyA9IG5ldyBVcGRhdGVQcmV2aWV3KEBmaW5kKFwiZGl2LnVwZGF0ZS1wcmV2aWV3XCIpWzBdKVxuICAgICAgICBAdXBkYXRlUHJldmlldy51cGRhdGUoZG9tRnJhZ21lbnQsIEByZW5kZXJMYVRlWClcbiAgICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWNoYW5nZS1tYXJrZG93bidcbiAgICAgICAgQG9yaWdpbmFsVHJpZ2dlcignbWFya2Rvd24tcHJldmlldy1wbHVzOm1hcmtkb3duLWNoYW5nZWQnKVxuXG4gIGdldFRpdGxlOiAtPlxuICAgIGlmIEBmaWxlP1xuICAgICAgXCIje3BhdGguYmFzZW5hbWUoQGdldFBhdGgoKSl9IFByZXZpZXdcIlxuICAgIGVsc2UgaWYgQGVkaXRvcj9cbiAgICAgIFwiI3tAZWRpdG9yLmdldFRpdGxlKCl9IFByZXZpZXdcIlxuICAgIGVsc2VcbiAgICAgIFwiTWFya2Rvd24gUHJldmlld1wiXG5cbiAgZ2V0SWNvbk5hbWU6IC0+XG4gICAgXCJtYXJrZG93blwiXG5cbiAgZ2V0VVJJOiAtPlxuICAgIGlmIEBmaWxlP1xuICAgICAgXCJtYXJrZG93bi1wcmV2aWV3LXBsdXM6Ly8je0BnZXRQYXRoKCl9XCJcbiAgICBlbHNlXG4gICAgICBcIm1hcmtkb3duLXByZXZpZXctcGx1czovL2VkaXRvci8je0BlZGl0b3JJZH1cIlxuXG4gIGdldFBhdGg6IC0+XG4gICAgaWYgQGZpbGU/XG4gICAgICBAZmlsZS5nZXRQYXRoKClcbiAgICBlbHNlIGlmIEBlZGl0b3I/XG4gICAgICBAZWRpdG9yLmdldFBhdGgoKVxuXG4gIGdldEdyYW1tYXI6IC0+XG4gICAgQGVkaXRvcj8uZ2V0R3JhbW1hcigpXG5cbiAgZ2V0RG9jdW1lbnRTdHlsZVNoZWV0czogLT4gIyBUaGlzIGZ1bmN0aW9uIGV4aXN0cyBzbyB3ZSBjYW4gc3R1YiBpdFxuICAgIGRvY3VtZW50LnN0eWxlU2hlZXRzXG5cbiAgZ2V0VGV4dEVkaXRvclN0eWxlczogLT5cblxuICAgIHRleHRFZGl0b3JTdHlsZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXRvbS1zdHlsZXNcIilcbiAgICB0ZXh0RWRpdG9yU3R5bGVzLmluaXRpYWxpemUoYXRvbS5zdHlsZXMpXG4gICAgdGV4dEVkaXRvclN0eWxlcy5zZXRBdHRyaWJ1dGUgXCJjb250ZXh0XCIsIFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCB0ZXh0RWRpdG9yU3R5bGVzXG5cbiAgICAjIEV4dHJhY3Qgc3R5bGUgZWxlbWVudHMgY29udGVudFxuICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseSh0ZXh0RWRpdG9yU3R5bGVzLmNoaWxkTm9kZXMpLm1hcCAoc3R5bGVFbGVtZW50KSAtPlxuICAgICAgc3R5bGVFbGVtZW50LmlubmVyVGV4dFxuXG4gIGdldE1hcmtkb3duUHJldmlld0NTUzogLT5cbiAgICBtYXJrZG93UHJldmlld1J1bGVzID0gW11cbiAgICBydWxlUmVnRXhwID0gL1xcLm1hcmtkb3duLXByZXZpZXcvXG4gICAgY3NzVXJsUmVmRXhwID0gL3VybFxcKGF0b206XFwvXFwvbWFya2Rvd24tcHJldmlldy1wbHVzXFwvYXNzZXRzXFwvKC4qKVxcKS9cblxuICAgIGZvciBzdHlsZXNoZWV0IGluIEBnZXREb2N1bWVudFN0eWxlU2hlZXRzKClcbiAgICAgIGlmIHN0eWxlc2hlZXQucnVsZXM/XG4gICAgICAgIGZvciBydWxlIGluIHN0eWxlc2hlZXQucnVsZXNcbiAgICAgICAgICAjIFdlIG9ubHkgbmVlZCBgLm1hcmtkb3duLXJldmlld2AgY3NzXG4gICAgICAgICAgbWFya2Rvd1ByZXZpZXdSdWxlcy5wdXNoKHJ1bGUuY3NzVGV4dCkgaWYgcnVsZS5zZWxlY3RvclRleHQ/Lm1hdGNoKHJ1bGVSZWdFeHApP1xuXG4gICAgbWFya2Rvd1ByZXZpZXdSdWxlc1xuICAgICAgLmNvbmNhdChAZ2V0VGV4dEVkaXRvclN0eWxlcygpKVxuICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAucmVwbGFjZSgvYXRvbS10ZXh0LWVkaXRvci9nLCAncHJlLmVkaXRvci1jb2xvcnMnKVxuICAgICAgLnJlcGxhY2UoLzpob3N0L2csICcuaG9zdCcpICMgUmVtb3ZlIHNoYWRvdy1kb20gOmhvc3Qgc2VsZWN0b3IgY2F1c2luZyBwcm9ibGVtIG9uIEZGXG4gICAgICAucmVwbGFjZSBjc3NVcmxSZWZFeHAsIChtYXRjaCwgYXNzZXRzTmFtZSwgb2Zmc2V0LCBzdHJpbmcpIC0+ICMgYmFzZTY0IGVuY29kZSBhc3NldHNcbiAgICAgICAgYXNzZXRQYXRoID0gcGF0aC5qb2luIF9fZGlybmFtZSwgJy4uL2Fzc2V0cycsIGFzc2V0c05hbWVcbiAgICAgICAgb3JpZ2luYWxEYXRhID0gZnMucmVhZEZpbGVTeW5jIGFzc2V0UGF0aCwgJ2JpbmFyeSdcbiAgICAgICAgYmFzZTY0RGF0YSA9IG5ldyBCdWZmZXIob3JpZ2luYWxEYXRhLCAnYmluYXJ5JykudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIFwidXJsKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCN7YmFzZTY0RGF0YX0nKVwiXG5cbiAgc2hvd0Vycm9yOiAocmVzdWx0KSAtPlxuICAgIGZhaWx1cmVNZXNzYWdlID0gcmVzdWx0Py5tZXNzYWdlXG5cbiAgICBAaHRtbCAkJCQgLT5cbiAgICAgIEBoMiAnUHJldmlld2luZyBNYXJrZG93biBGYWlsZWQnXG4gICAgICBAaDMgZmFpbHVyZU1lc3NhZ2UgaWYgZmFpbHVyZU1lc3NhZ2U/XG5cbiAgc2hvd0xvYWRpbmc6IC0+XG4gICAgQGxvYWRpbmcgPSB0cnVlXG4gICAgQGh0bWwgJCQkIC0+XG4gICAgICBAZGl2IGNsYXNzOiAnbWFya2Rvd24tc3Bpbm5lcicsICdMb2FkaW5nIE1hcmtkb3duXFx1MjAyNidcblxuICBjb3B5VG9DbGlwYm9hcmQ6IC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBsb2FkaW5nXG5cbiAgICBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKClcbiAgICBzZWxlY3RlZFRleHQgPSBzZWxlY3Rpb24udG9TdHJpbmcoKVxuICAgIHNlbGVjdGVkTm9kZSA9IHNlbGVjdGlvbi5iYXNlTm9kZVxuXG4gICAgIyBVc2UgZGVmYXVsdCBjb3B5IGV2ZW50IGhhbmRsZXIgaWYgdGhlcmUgaXMgc2VsZWN0ZWQgdGV4dCBpbnNpZGUgdGhpcyB2aWV3XG4gICAgcmV0dXJuIGZhbHNlIGlmIHNlbGVjdGVkVGV4dCBhbmQgc2VsZWN0ZWROb2RlPyBhbmQgKEBbMF0gaXMgc2VsZWN0ZWROb2RlIG9yICQuY29udGFpbnMoQFswXSwgc2VsZWN0ZWROb2RlKSlcblxuICAgIEBnZXRIVE1MIChlcnJvciwgaHRtbCkgLT5cbiAgICAgIGlmIGVycm9yP1xuICAgICAgICBjb25zb2xlLndhcm4oJ0NvcHlpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoaHRtbClcblxuICAgIHRydWVcblxuICBzYXZlQXM6IC0+XG4gICAgcmV0dXJuIGlmIEBsb2FkaW5nXG5cbiAgICBmaWxlUGF0aCA9IEBnZXRQYXRoKClcbiAgICB0aXRsZSA9ICdNYXJrZG93biB0byBIVE1MJ1xuICAgIGlmIGZpbGVQYXRoXG4gICAgICB0aXRsZSA9IHBhdGgucGFyc2UoZmlsZVBhdGgpLm5hbWVcbiAgICAgIGZpbGVQYXRoICs9ICcuaHRtbCdcbiAgICBlbHNlXG4gICAgICBmaWxlUGF0aCA9ICd1bnRpdGxlZC5tZC5odG1sJ1xuICAgICAgaWYgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgICBmaWxlUGF0aCA9IHBhdGguam9pbihwcm9qZWN0UGF0aCwgZmlsZVBhdGgpXG5cbiAgICBpZiBodG1sRmlsZVBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYyhmaWxlUGF0aClcblxuICAgICAgQGdldEhUTUwgKGVycm9yLCBodG1sQm9keSkgPT5cbiAgICAgICAgaWYgZXJyb3I/XG4gICAgICAgICAgY29uc29sZS53YXJuKCdTYXZpbmcgTWFya2Rvd24gYXMgSFRNTCBmYWlsZWQnLCBlcnJvcilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIEByZW5kZXJMYVRlWFxuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9IFwiXCJcIlxuXG4gICAgICAgICAgICAgIDxzY3JpcHQgdHlwZT1cInRleHQveC1tYXRoamF4LWNvbmZpZ1wiPlxuICAgICAgICAgICAgICAgIE1hdGhKYXguSHViLkNvbmZpZyh7XG4gICAgICAgICAgICAgICAgICBqYXg6IFtcImlucHV0L1RlWFwiLFwib3V0cHV0L0hUTUwtQ1NTXCJdLFxuICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uczogW10sXG4gICAgICAgICAgICAgICAgICBUZVg6IHtcbiAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uczogW1wiQU1TbWF0aC5qc1wiLFwiQU1Tc3ltYm9scy5qc1wiLFwibm9FcnJvcnMuanNcIixcIm5vVW5kZWZpbmVkLmpzXCJdXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgc2hvd01hdGhNZW51OiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCIgc3JjPVwiaHR0cHM6Ly9jZG4ubWF0aGpheC5vcmcvbWF0aGpheC9sYXRlc3QvTWF0aEpheC5qc1wiPlxuICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgbWF0aGpheFNjcmlwdCA9IFwiXCJcbiAgICAgICAgICBodG1sID0gXCJcIlwiXG4gICAgICAgICAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICAgICAgICAgIDxodG1sPlxuICAgICAgICAgICAgICA8aGVhZD5cbiAgICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJzZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgICAgICAgICAgICA8dGl0bGU+I3t0aXRsZX08L3RpdGxlPiN7bWF0aGpheFNjcmlwdH1cbiAgICAgICAgICAgICAgICAgIDxzdHlsZT4je0BnZXRNYXJrZG93blByZXZpZXdDU1MoKX08L3N0eWxlPlxuICAgICAgICAgICAgICA8L2hlYWQ+XG4gICAgICAgICAgICAgIDxib2R5IGNsYXNzPSdtYXJrZG93bi1wcmV2aWV3Jz4je2h0bWxCb2R5fTwvYm9keT5cbiAgICAgICAgICAgIDwvaHRtbD5cIlwiXCIgKyBcIlxcblwiICMgRW5zdXJlIHRyYWlsaW5nIG5ld2xpbmVcblxuICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMoaHRtbEZpbGVQYXRoLCBodG1sKVxuICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oaHRtbEZpbGVQYXRoKVxuXG4gIGlzRXF1YWw6IChvdGhlcikgLT5cbiAgICBAWzBdIGlzIG90aGVyP1swXSAjIENvbXBhcmUgRE9NIGVsZW1lbnRzXG5cbiAgI1xuICAjIEZpbmQgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgYW4gZWxlbWVudCB0aGF0IGlzIG5vdCBhIGRlY2VuZGFudCBvZiBlaXRoZXJcbiAgIyBgc3Bhbi5tYXRoYCBvciBgc3Bhbi5hdG9tLXRleHQtZWRpdG9yYC5cbiAgI1xuICAjIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgZnJvbSB3aGljaCB0aGUgc2VhcmNoIGZvciBhXG4gICMgICBjbG9zZXN0IGFuY2VzdG9yIGJlZ2lucy5cbiAgIyBAcmV0dXJuIHtIVE1MRWxlbWVudH0gVGhlIGNsb3Nlc3QgYW5jZXN0b3IgdG8gYGVsZW1lbnRgIHRoYXQgZG9lcyBub3RcbiAgIyAgIGNvbnRhaW4gZWl0aGVyIGBzcGFuLm1hdGhgIG9yIGBzcGFuLmF0b20tdGV4dC1lZGl0b3JgLlxuICAjXG4gIGJ1YmJsZVRvQ29udGFpbmVyRWxlbWVudDogKGVsZW1lbnQpIC0+XG4gICAgdGVzdEVsZW1lbnQgPSBlbGVtZW50XG4gICAgd2hpbGUgdGVzdEVsZW1lbnQgaXNudCBkb2N1bWVudC5ib2R5XG4gICAgICBwYXJlbnQgPSB0ZXN0RWxlbWVudC5wYXJlbnROb2RlXG4gICAgICByZXR1cm4gcGFyZW50LnBhcmVudE5vZGUgaWYgcGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnTWF0aEpheF9EaXNwbGF5JylcbiAgICAgIHJldHVybiBwYXJlbnQgaWYgcGFyZW50LmNsYXNzTGlzdC5jb250YWlucygnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgICB0ZXN0RWxlbWVudCA9IHBhcmVudFxuICAgIHJldHVybiBlbGVtZW50XG5cbiAgI1xuICAjIERldGVybWluZSBhIHN1YnNlcXVlbmNlIG9mIGEgc2VxdWVuY2Ugb2YgdG9rZW5zIHJlcHJlc2VudGluZyBhIHBhdGggdGhyb3VnaFxuICAjIEhUTUxFbGVtZW50cyB0aGF0IGRvZXMgbm90IGNvbnRpbnVlIGRlZXBlciB0aGFuIGEgdGFibGUgZWxlbWVudC5cbiAgI1xuICAjIEBwYXJhbSB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBwYXRoVG9Ub2tlbiBBcnJheSBvZiB0b2tlbnNcbiAgIyAgIHJlcHJlc2VudGluZyBhIHBhdGggdG8gYSBIVE1MRWxlbWVudCB3aXRoIHRoZSByb290IGVsZW1lbnQgYXRcbiAgIyAgIHBhdGhUb1Rva2VuWzBdIGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnQgYXQgdGhlIGhpZ2hlc3QgaW5kZXguIEVhY2ggZWxlbWVudFxuICAjICAgY29uc2lzdHMgb2YgYSBgdGFnYCBhbmQgYGluZGV4YCByZXByZXNlbnRpbmcgaXRzIGluZGV4IGFtb25nc3QgaXRzXG4gICMgICBzaWJsaW5nIGVsZW1lbnRzIG9mIHRoZSBzYW1lIGB0YWdgLlxuICAjIEByZXR1cm4geyh0YWc6IDx0YWc+LCBpbmRleDogPGluZGV4PilbXX0gVGhlIHN1YnNlcXVlbmNlIG9mIHBhdGhUb1Rva2VuIHRoYXRcbiAgIyAgIG1haW50YWlucyB0aGUgc2FtZSByb290IGJ1dCB0ZXJtaW5hdGVzIGF0IGEgdGFibGUgZWxlbWVudCBvciB0aGUgdGFyZ2V0XG4gICMgICBlbGVtZW50LCB3aGljaGV2ZXIgY29tZXMgZmlyc3QuXG4gICNcbiAgYnViYmxlVG9Db250YWluZXJUb2tlbjogKHBhdGhUb1Rva2VuKSAtPlxuICAgIGZvciBpIGluIFswLi4ocGF0aFRvVG9rZW4ubGVuZ3RoLTEpXSBieSAxXG4gICAgICByZXR1cm4gcGF0aFRvVG9rZW4uc2xpY2UoMCwgaSsxKSBpZiBwYXRoVG9Ub2tlbltpXS50YWcgaXMgJ3RhYmxlJ1xuICAgIHJldHVybiBwYXRoVG9Ub2tlblxuXG4gICNcbiAgIyBFbmNvZGUgdGFncyBmb3IgbWFya2Rvd24taXQuXG4gICNcbiAgIyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IEVuY29kZSB0aGUgdGFnIG9mIGVsZW1lbnQuXG4gICMgQHJldHVybiB7c3RyaW5nfSBFbmNvZGVkIHRhZy5cbiAgI1xuICBlbmNvZGVUYWc6IChlbGVtZW50KSAtPlxuICAgIHJldHVybiAnbWF0aCcgaWYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hdGgnKVxuICAgIHJldHVybiAnY29kZScgaWYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F0b20tdGV4dC1lZGl0b3InKSAjIG9ubHkgdG9rZW4udHlwZSBpcyBgZmVuY2VgIGNvZGUgYmxvY2tzIHNob3VsZCBldmVyIGJlIGZvdW5kIGluIHRoZSBmaXJzdCBsZXZlbCBvZiB0aGUgdG9rZW5zIGFycmF5XG4gICAgcmV0dXJuIGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpXG5cbiAgI1xuICAjIERlY29kZSB0YWdzIHVzZWQgYnkgbWFya2Rvd24taXRcbiAgI1xuICAjIEBwYXJhbSB7bWFya2Rvd24taXQuVG9rZW59IHRva2VuIERlY29kZSB0aGUgdGFnIG9mIHRva2VuLlxuICAjIEByZXR1cm4ge3N0cmluZ3xudWxsfSBEZWNvZGVkIHRhZyBvciBgbnVsbGAgaWYgdGhlIHRva2VuIGhhcyBubyB0YWcuXG4gICNcbiAgZGVjb2RlVGFnOiAodG9rZW4pIC0+XG4gICAgcmV0dXJuICdzcGFuJyBpZiB0b2tlbi50YWcgaXMgJ21hdGgnXG4gICAgcmV0dXJuICdzcGFuJyBpZiB0b2tlbi50YWcgaXMgJ2NvZGUnXG4gICAgcmV0dXJuIG51bGwgaWYgdG9rZW4udGFnIGlzIFwiXCJcbiAgICByZXR1cm4gdG9rZW4udGFnXG5cbiAgI1xuICAjIERldGVybWluZSBwYXRoIHRvIGEgdGFyZ2V0IGVsZW1lbnQgZnJvbSBhIGNvbnRhaW5lciBgLm1hcmtkb3duLXByZXZpZXdgLlxuICAjXG4gICMgQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBUYXJnZXQgSFRNTEVsZW1lbnQuXG4gICMgQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSBvZiB0b2tlbnMgcmVwcmVzZW50aW5nIGEgcGF0aFxuICAjICAgdG8gYGVsZW1lbnRgIGZyb20gYC5tYXJrZG93bi1wcmV2aWV3YC4gVGhlIHJvb3QgYC5tYXJrZG93bi1wcmV2aWV3YFxuICAjICAgZWxlbWVudCBpcyB0aGUgZmlyc3QgZWxlbWVudHMgaW4gdGhlIGFycmF5IGFuZCB0aGUgdGFyZ2V0IGVsZW1lbnRcbiAgIyAgIGBlbGVtZW50YCBhdCB0aGUgaGlnaGVzdCBpbmRleC4gRWFjaCBlbGVtZW50IGNvbnNpc3RzIG9mIGEgYHRhZ2AgYW5kXG4gICMgICBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHMgc2libGluZyBlbGVtZW50cyBvZiB0aGUgc2FtZVxuICAjICAgYHRhZ2AuXG4gICNcbiAgZ2V0UGF0aFRvRWxlbWVudDogKGVsZW1lbnQpID0+XG4gICAgaWYgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21hcmtkb3duLXByZXZpZXcnKVxuICAgICAgcmV0dXJuIFtcbiAgICAgICAgdGFnOiAnZGl2J1xuICAgICAgICBpbmRleDogMFxuICAgICAgXVxuXG4gICAgZWxlbWVudCAgICAgICA9IEBidWJibGVUb0NvbnRhaW5lckVsZW1lbnQgZWxlbWVudFxuICAgIHRhZyAgICAgICAgICAgPSBAZW5jb2RlVGFnIGVsZW1lbnRcbiAgICBzaWJsaW5ncyAgICAgID0gZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXNcbiAgICBzaWJsaW5nc0NvdW50ID0gMFxuXG4gICAgZm9yIHNpYmxpbmcgaW4gc2libGluZ3NcbiAgICAgIHNpYmxpbmdUYWcgID0gaWYgc2libGluZy5ub2RlVHlwZSBpcyAxIHRoZW4gQGVuY29kZVRhZyhzaWJsaW5nKSBlbHNlIG51bGxcbiAgICAgIGlmIHNpYmxpbmcgaXMgZWxlbWVudFxuICAgICAgICBwYXRoVG9FbGVtZW50ID0gQGdldFBhdGhUb0VsZW1lbnQoZWxlbWVudC5wYXJlbnROb2RlKVxuICAgICAgICBwYXRoVG9FbGVtZW50LnB1c2hcbiAgICAgICAgICB0YWc6IHRhZ1xuICAgICAgICAgIGluZGV4OiBzaWJsaW5nc0NvdW50XG4gICAgICAgIHJldHVybiBwYXRoVG9FbGVtZW50XG4gICAgICBlbHNlIGlmIHNpYmxpbmdUYWcgaXMgdGFnXG4gICAgICAgIHNpYmxpbmdzQ291bnQrK1xuXG4gICAgcmV0dXJuXG5cbiAgI1xuICAjIFNldCB0aGUgYXNzb2NpYXRlZCBlZGl0b3JzIGN1cnNvciBidWZmZXIgcG9zaXRpb24gdG8gdGhlIGxpbmUgcmVwcmVzZW50aW5nXG4gICMgdGhlIHNvdXJjZSBtYXJrZG93biBvZiBhIHRhcmdldCBlbGVtZW50LlxuICAjXG4gICMgQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgIyBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IFRhcmdldCBlbGVtZW50IGNvbnRhaW5lZCB3aXRoaW4gdGhlIGFzc29pY2F0ZWRcbiAgIyAgIGAubWFya2Rvd24tcHJldmlld2AgY29udGFpbmVyLiBUaGUgbWV0aG9kIHdpbGwgYXR0ZW1wdCB0byBpZGVudGlmeSB0aGVcbiAgIyAgIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAgYW5kIHNldCB0aGUgY3Vyc29yIHRvIHRoYXQgbGluZS5cbiAgIyBAcmV0dXJuIHtudW1iZXJ8bnVsbH0gVGhlIGxpbmUgb2YgYHRleHRgIHRoYXQgcmVwcmVzZW50cyBgZWxlbWVudGAuIElmIG5vXG4gICMgICBsaW5lIGlzIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAjXG4gIHN5bmNTb3VyY2U6ICh0ZXh0LCBlbGVtZW50KSA9PlxuICAgIHBhdGhUb0VsZW1lbnQgPSBAZ2V0UGF0aFRvRWxlbWVudCBlbGVtZW50XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpICMgcmVtb3ZlIGRpdi5tYXJrZG93bi1wcmV2aWV3XG4gICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpICMgcmVtb3ZlIGRpdi51cGRhdGUtcHJldmlld1xuICAgIHJldHVybiB1bmxlc3MgcGF0aFRvRWxlbWVudC5sZW5ndGhcblxuICAgIG1hcmtkb3duSXQgID89IHJlcXVpcmUgJy4vbWFya2Rvd24taXQtaGVscGVyJ1xuICAgIHRva2VucyAgICAgID0gbWFya2Rvd25JdC5nZXRUb2tlbnMgdGV4dCwgQHJlbmRlckxhVGVYXG4gICAgZmluYWxUb2tlbiAgPSBudWxsXG4gICAgbGV2ZWwgICAgICAgPSAwXG5cbiAgICBmb3IgdG9rZW4gaW4gdG9rZW5zXG4gICAgICBicmVhayBpZiB0b2tlbi5sZXZlbCA8IGxldmVsXG4gICAgICBjb250aW51ZSBpZiB0b2tlbi5oaWRkZW5cbiAgICAgIGlmIHRva2VuLnRhZyBpcyBwYXRoVG9FbGVtZW50WzBdLnRhZyBhbmQgdG9rZW4ubGV2ZWwgaXMgbGV2ZWxcbiAgICAgICAgaWYgdG9rZW4ubmVzdGluZyBpcyAxXG4gICAgICAgICAgaWYgcGF0aFRvRWxlbWVudFswXS5pbmRleCBpcyAwXG4gICAgICAgICAgICBmaW5hbFRva2VuID0gdG9rZW4gaWYgdG9rZW4ubWFwP1xuICAgICAgICAgICAgcGF0aFRvRWxlbWVudC5zaGlmdCgpXG4gICAgICAgICAgICBsZXZlbCsrXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcGF0aFRvRWxlbWVudFswXS5pbmRleC0tXG4gICAgICAgIGVsc2UgaWYgdG9rZW4ubmVzdGluZyBpcyAwIGFuZCB0b2tlbi50YWcgaW4gWydtYXRoJywgJ2NvZGUnLCAnaHInXVxuICAgICAgICAgIGlmIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXggaXMgMFxuICAgICAgICAgICAgZmluYWxUb2tlbiA9IHRva2VuXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBhdGhUb0VsZW1lbnRbMF0uaW5kZXgtLVxuICAgICAgYnJlYWsgaWYgcGF0aFRvRWxlbWVudC5sZW5ndGggaXMgMFxuXG4gICAgaWYgZmluYWxUb2tlbj9cbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24gW2ZpbmFsVG9rZW4ubWFwWzBdLCAwXVxuICAgICAgcmV0dXJuIGZpbmFsVG9rZW4ubWFwWzBdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG51bGxcblxuICAjXG4gICMgRGV0ZXJtaW5lIHBhdGggdG8gYSB0YXJnZXQgdG9rZW4uXG4gICNcbiAgIyBAcGFyYW0geyhtYXJrZG93bi1pdC5Ub2tlbilbXX0gdG9rZW5zIEFycmF5IG9mIHRva2VucyBhcyByZXR1cm5lZCBieVxuICAjICAgYG1hcmtkb3duLWl0LnBhcnNlKClgLlxuICAjIEBwYXJhbSB7bnVtYmVyfSBsaW5lIExpbmUgcmVwcmVzZW50aW5nIHRoZSB0YXJnZXQgdG9rZW4uXG4gICMgQHJldHVybiB7KHRhZzogPHRhZz4sIGluZGV4OiA8aW5kZXg+KVtdfSBBcnJheSByZXByZXNlbnRpbmcgYSBwYXRoIHRvIHRoZVxuICAjICAgdGFyZ2V0IHRva2VuLiBUaGUgcm9vdCB0b2tlbiBpcyByZXByZXNlbnRlZCBieSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGVcbiAgIyAgIGFycmF5IGFuZCB0aGUgdGFyZ2V0IHRva2VuIGJ5IHRoZSBsYXN0IGVsbWVudC4gRWFjaCBlbGVtZW50IGNvbnNpc3RzIG9mIGFcbiAgIyAgIGB0YWdgIGFuZCBgaW5kZXhgIHJlcHJlc2VudGluZyBpdHMgaW5kZXggYW1vbmdzdCBpdHMgc2libGluZyB0b2tlbnMgaW5cbiAgIyAgIGB0b2tlbnNgIG9mIHRoZSBzYW1lIGB0YWdgLiBgbGluZWAgd2lsbCBsaWUgYmV0d2VlbiB0aGUgcHJvcGVydGllc1xuICAjICAgYG1hcFswXWAgYW5kIGBtYXBbMV1gIG9mIHRoZSB0YXJnZXQgdG9rZW4uXG4gICNcbiAgZ2V0UGF0aFRvVG9rZW46ICh0b2tlbnMsIGxpbmUpID0+XG4gICAgcGF0aFRvVG9rZW4gICA9IFtdXG4gICAgdG9rZW5UYWdDb3VudCA9IFtdXG4gICAgbGV2ZWwgICAgICAgICA9IDBcblxuICAgIGZvciB0b2tlbiBpbiB0b2tlbnNcbiAgICAgIGJyZWFrIGlmIHRva2VuLmxldmVsIDwgbGV2ZWxcbiAgICAgIGNvbnRpbnVlIGlmIHRva2VuLmhpZGRlblxuICAgICAgY29udGludWUgaWYgdG9rZW4ubmVzdGluZyBpcyAtMVxuXG4gICAgICB0b2tlbi50YWcgPSBAZGVjb2RlVGFnIHRva2VuXG4gICAgICBjb250aW51ZSB1bmxlc3MgdG9rZW4udGFnP1xuXG4gICAgICBpZiB0b2tlbi5tYXA/IGFuZCBsaW5lID49IHRva2VuLm1hcFswXSBhbmQgbGluZSA8PSAodG9rZW4ubWFwWzFdLTEpXG4gICAgICAgIGlmIHRva2VuLm5lc3RpbmcgaXMgMVxuICAgICAgICAgIHBhdGhUb1Rva2VuLnB1c2hcbiAgICAgICAgICAgIHRhZzogdG9rZW4udGFnXG4gICAgICAgICAgICBpbmRleDogdG9rZW5UYWdDb3VudFt0b2tlbi50YWddID8gMFxuICAgICAgICAgIHRva2VuVGFnQ291bnQgPSBbXVxuICAgICAgICAgIGxldmVsKytcbiAgICAgICAgZWxzZSBpZiB0b2tlbi5uZXN0aW5nIGlzIDBcbiAgICAgICAgICBwYXRoVG9Ub2tlbi5wdXNoXG4gICAgICAgICAgICB0YWc6IHRva2VuLnRhZ1xuICAgICAgICAgICAgaW5kZXg6IHRva2VuVGFnQ291bnRbdG9rZW4udGFnXSA/IDBcbiAgICAgICAgICBicmVha1xuICAgICAgZWxzZSBpZiB0b2tlbi5sZXZlbCBpcyBsZXZlbFxuICAgICAgICBpZiB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10/XG4gICAgICAgIHRoZW4gdG9rZW5UYWdDb3VudFt0b2tlbi50YWddKytcbiAgICAgICAgZWxzZSB0b2tlblRhZ0NvdW50W3Rva2VuLnRhZ10gPSAxXG5cbiAgICBwYXRoVG9Ub2tlbiA9IEBidWJibGVUb0NvbnRhaW5lclRva2VuIHBhdGhUb1Rva2VuXG4gICAgcmV0dXJuIHBhdGhUb1Rva2VuXG5cbiAgI1xuICAjIFNjcm9sbCB0aGUgYXNzb2NpYXRlZCBwcmV2aWV3IHRvIHRoZSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgdGFyZ2V0IGxpbmUgb2ZcbiAgIyBvZiB0aGUgc291cmNlIG1hcmtkb3duLlxuICAjXG4gICMgQHBhcmFtIHtzdHJpbmd9IHRleHQgU291cmNlIG1hcmtkb3duIG9mIHRoZSBhc3NvY2lhdGVkIGVkaXRvci5cbiAgIyBAcGFyYW0ge251bWJlcn0gbGluZSBUYXJnZXQgbGluZSBvZiBgdGV4dGAuIFRoZSBtZXRob2Qgd2lsbCBhdHRlbXB0IHRvXG4gICMgICBpZGVudGlmeSB0aGUgZWxtZW50IG9mIHRoZSBhc3NvY2lhdGVkIGAubWFya2Rvd24tcHJldmlld2AgdGhhdCByZXByZXNlbnRzXG4gICMgICBgbGluZWAgYW5kIHNjcm9sbCB0aGUgYC5tYXJrZG93bi1wcmV2aWV3YCB0byB0aGF0IGVsZW1lbnQuXG4gICMgQHJldHVybiB7bnVtYmVyfG51bGx9IFRoZSBlbGVtZW50IHRoYXQgcmVwcmVzZW50cyBgbGluZWAuIElmIG5vIGVsZW1lbnQgaXNcbiAgIyAgIGlkZW50aWZpZWQgYG51bGxgIGlzIHJldHVybmVkLlxuICAjXG4gIHN5bmNQcmV2aWV3OiAodGV4dCwgbGluZSkgPT5cbiAgICBtYXJrZG93bkl0ICA/PSByZXF1aXJlICcuL21hcmtkb3duLWl0LWhlbHBlcidcbiAgICB0b2tlbnMgICAgICA9IG1hcmtkb3duSXQuZ2V0VG9rZW5zIHRleHQsIEByZW5kZXJMYVRlWFxuICAgIHBhdGhUb1Rva2VuID0gQGdldFBhdGhUb1Rva2VuIHRva2VucywgbGluZVxuXG4gICAgZWxlbWVudCA9IEBmaW5kKCcudXBkYXRlLXByZXZpZXcnKS5lcSgwKVxuICAgIGZvciB0b2tlbiBpbiBwYXRoVG9Ub2tlblxuICAgICAgY2FuZGlkYXRlRWxlbWVudCA9IGVsZW1lbnQuY2hpbGRyZW4odG9rZW4udGFnKS5lcSh0b2tlbi5pbmRleClcbiAgICAgIGlmIGNhbmRpZGF0ZUVsZW1lbnQubGVuZ3RoIGlzbnQgMFxuICAgICAgdGhlbiBlbGVtZW50ID0gY2FuZGlkYXRlRWxlbWVudFxuICAgICAgZWxzZSBicmVha1xuXG4gICAgcmV0dXJuIG51bGwgaWYgZWxlbWVudFswXS5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JykgIyBEbyBub3QganVtcCB0byB0aGUgdG9wIG9mIHRoZSBwcmV2aWV3IGZvciBiYWQgc3luY3NcblxuICAgIGVsZW1lbnRbMF0uc2Nyb2xsSW50b1ZpZXcoKSB1bmxlc3MgZWxlbWVudFswXS5jbGFzc0xpc3QuY29udGFpbnMoJ3VwZGF0ZS1wcmV2aWV3JylcbiAgICBtYXhTY3JvbGxUb3AgPSBAZWxlbWVudC5zY3JvbGxIZWlnaHQgLSBAaW5uZXJIZWlnaHQoKVxuICAgIEBlbGVtZW50LnNjcm9sbFRvcCAtPSBAaW5uZXJIZWlnaHQoKS80IHVubGVzcyBAc2Nyb2xsVG9wKCkgPj0gbWF4U2Nyb2xsVG9wXG5cbiAgICBlbGVtZW50LmFkZENsYXNzKCdmbGFzaCcpXG4gICAgc2V0VGltZW91dCAoIC0+IGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZsYXNoJykgKSwgMTAwMFxuXG4gICAgcmV0dXJuIGVsZW1lbnRbMF1cblxuaWYgR3JpbS5pbmNsdWRlRGVwcmVjYXRlZEFQSXNcbiAgTWFya2Rvd25QcmV2aWV3Vmlldzo6b24gPSAoZXZlbnROYW1lKSAtPlxuICAgIGlmIGV2ZW50TmFtZSBpcyAnbWFya2Rvd24tcHJldmlldzptYXJrZG93bi1jaGFuZ2VkJ1xuICAgICAgR3JpbS5kZXByZWNhdGUoXCJVc2UgTWFya2Rvd25QcmV2aWV3Vmlldzo6b25EaWRDaGFuZ2VNYXJrZG93biBpbnN0ZWFkIG9mIHRoZSAnbWFya2Rvd24tcHJldmlldzptYXJrZG93bi1jaGFuZ2VkJyBqUXVlcnkgZXZlbnRcIilcbiAgICBzdXBlclxuIl19
