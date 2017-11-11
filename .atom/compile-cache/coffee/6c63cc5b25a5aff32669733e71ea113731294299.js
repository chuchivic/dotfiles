(function() {
  var $, _, fs, highlight, highlighter, imageWatcher, markdownIt, packagePath, pandocHelper, path, render, resolveImagePaths, resourcePath, sanitize, scopeForFenceName, tokenizeCodeBlocks;

  path = require('path');

  _ = require('underscore-plus');

  fs = require('fs-plus');

  highlight = require('atom-highlight');

  $ = require('atom-space-pen-views').$;

  pandocHelper = null;

  markdownIt = null;

  scopeForFenceName = require('./extension-helper').scopeForFenceName;

  imageWatcher = require('./image-watch-helper');

  highlighter = null;

  resourcePath = atom.getLoadSettings().resourcePath;

  packagePath = path.dirname(__dirname);

  exports.toDOMFragment = function(text, filePath, grammar, renderLaTeX, callback) {
    if (text == null) {
      text = '';
    }
    return render(text, filePath, renderLaTeX, false, function(error, html) {
      var domFragment, template;
      if (error != null) {
        return callback(error);
      }
      template = document.createElement('template');
      template.innerHTML = html;
      domFragment = template.content.cloneNode(true);
      return callback(null, domFragment);
    });
  };

  exports.toHTML = function(text, filePath, grammar, renderLaTeX, copyHTMLFlag, callback) {
    if (text == null) {
      text = '';
    }
    return render(text, filePath, renderLaTeX, copyHTMLFlag, function(error, html) {
      var defaultCodeLanguage;
      if (error != null) {
        return callback(error);
      }
      if ((grammar != null ? grammar.scopeName : void 0) === 'source.litcoffee') {
        defaultCodeLanguage = 'coffee';
      }
      if (!(atom.config.get('markdown-preview-plus.enablePandoc') && atom.config.get('markdown-preview-plus.useNativePandocCodeStyles'))) {
        html = tokenizeCodeBlocks(html, defaultCodeLanguage);
      }
      return callback(null, html);
    });
  };

  render = function(text, filePath, renderLaTeX, copyHTMLFlag, callback) {
    var callbackFunction;
    text = text.replace(/^\s*<!doctype(\s+.*)?>\s*/i, '');
    callbackFunction = function(error, html) {
      if (error != null) {
        return callback(error);
      }
      html = sanitize(html);
      html = resolveImagePaths(html, filePath, copyHTMLFlag);
      return callback(null, html.trim());
    };
    if (atom.config.get('markdown-preview-plus.enablePandoc')) {
      if (pandocHelper == null) {
        pandocHelper = require('./pandoc-helper');
      }
      return pandocHelper.renderPandoc(text, filePath, renderLaTeX, callbackFunction);
    } else {
      if (markdownIt == null) {
        markdownIt = require('./markdown-it-helper');
      }
      return callbackFunction(null, markdownIt.render(text, renderLaTeX));
    }
  };

  sanitize = function(html) {
    var attributesToRemove, doc;
    doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll("script:not([type^='math/tex'])").forEach(function(elem) {
      return elem.remove();
    });
    attributesToRemove = ['onabort', 'onblur', 'onchange', 'onclick', 'ondbclick', 'onerror', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove', 'onmouseover', 'onmouseout', 'onmouseup', 'onreset', 'onresize', 'onscroll', 'onselect', 'onsubmit', 'onunload'];
    doc.querySelectorAll('*').forEach(function(elem) {
      var attribute, i, len, results;
      results = [];
      for (i = 0, len = attributesToRemove.length; i < len; i++) {
        attribute = attributesToRemove[i];
        results.push(elem.removeAttribute(attribute));
      }
      return results;
    });
    return doc.innerHTML;
  };

  resolveImagePaths = function(html, filePath, copyHTMLFlag) {
    var doc, rootDirectory;
    if (atom.project != null) {
      rootDirectory = atom.project.relativizePath(filePath)[0];
    }
    doc = document.createElement('div');
    doc.innerHTML = html;
    doc.querySelectorAll('img').forEach(function(img) {
      var e, src, v;
      if (src = img.getAttribute('src')) {
        if (!atom.config.get('markdown-preview-plus.enablePandoc')) {
          if (markdownIt == null) {
            markdownIt = require('./markdown-it-helper');
          }
          src = markdownIt.decode(src);
        }
        if (src.match(/^(https?|atom|data):/)) {
          return;
        }
        if (src.startsWith(process.resourcesPath)) {
          return;
        }
        if (src.startsWith(resourcePath)) {
          return;
        }
        if (src.startsWith(packagePath)) {
          return;
        }
        if (src[0] === '/') {
          if (!fs.isFileSync(src)) {
            try {
              src = path.join(rootDirectory, src.substring(1));
            } catch (error1) {
              e = error1;
            }
          }
        } else {
          src = path.resolve(path.dirname(filePath), src);
        }
        if (!copyHTMLFlag) {
          v = imageWatcher.getVersion(src, filePath);
          if (v) {
            src = src + "?v=" + v;
          }
        }
        return img.src = src;
      }
    });
    return doc.innerHTML;
  };

  exports.convertCodeBlocksToAtomEditors = function(domFragment, defaultLanguage) {
    var codeBlock, codeElement, cursorLineDecoration, editor, editorElement, fenceName, fontFamily, grammar, i, j, k, len, len1, len2, preElement, ref, ref1, ref2, ref3, ref4, ref5;
    if (defaultLanguage == null) {
      defaultLanguage = 'text';
    }
    if (fontFamily = atom.config.get('editor.fontFamily')) {
      ref = domFragment.querySelectorAll('code');
      for (i = 0, len = ref.length; i < len; i++) {
        codeElement = ref[i];
        codeElement.style.fontFamily = fontFamily;
      }
    }
    ref1 = domFragment.querySelectorAll('pre');
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      preElement = ref1[j];
      codeBlock = (ref2 = preElement.firstElementChild) != null ? ref2 : preElement;
      fenceName = (ref3 = (ref4 = codeBlock.getAttribute('class')) != null ? ref4.replace(/^(lang-|sourceCode )/, '') : void 0) != null ? ref3 : defaultLanguage;
      editorElement = document.createElement('atom-text-editor');
      editorElement.setAttributeNode(document.createAttribute('gutter-hidden'));
      editorElement.removeAttribute('tabindex');
      preElement.parentNode.insertBefore(editorElement, preElement);
      preElement.remove();
      editor = editorElement.getModel();
      if (editor.cursorLineDecorations != null) {
        ref5 = editor.cursorLineDecorations;
        for (k = 0, len2 = ref5.length; k < len2; k++) {
          cursorLineDecoration = ref5[k];
          cursorLineDecoration.destroy();
        }
      } else {
        editor.getDecorations({
          "class": 'cursor-line',
          type: 'line'
        })[0].destroy();
      }
      editor.setText(codeBlock.textContent.replace(/\n$/, ''));
      if (grammar = atom.grammars.grammarForScopeName(scopeForFenceName(fenceName))) {
        editor.setGrammar(grammar);
      }
    }
    return domFragment;
  };

  tokenizeCodeBlocks = function(html, defaultLanguage) {
    var doc, fontFamily;
    if (defaultLanguage == null) {
      defaultLanguage = 'text';
    }
    doc = document.createElement('div');
    doc.innerHTML = html;
    if (fontFamily = atom.config.get('editor.fontFamily')) {
      doc.querySelectorAll('code').forEach(function(code) {
        return code.style.fontFamily = fontFamily;
      });
    }
    doc.querySelectorAll("pre").forEach(function(preElement) {
      var codeBlock, fenceName, highlightedHtml, ref;
      codeBlock = preElement.firstElementChild;
      fenceName = (ref = codeBlock.className.replace(/^(lang-|sourceCode )/, '')) != null ? ref : defaultLanguage;
      highlightedHtml = highlight({
        fileContents: codeBlock.innerText,
        scopeName: scopeForFenceName(fenceName),
        nbsp: true,
        lineDivs: true,
        editorDiv: true,
        editorDivTag: 'pre',
        editorDivClass: fenceName ? "editor-colors lang-" + fenceName : "editor-colors"
      });
      return preElement.outerHTML = highlightedHtml;
    });
    return doc.innerHTML;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9yZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxTQUFBLEdBQVksT0FBQSxDQUFRLGdCQUFSOztFQUNYLElBQUssT0FBQSxDQUFRLHNCQUFSOztFQUNOLFlBQUEsR0FBZTs7RUFDZixVQUFBLEdBQWE7O0VBQ1osb0JBQXFCLE9BQUEsQ0FBUSxvQkFBUjs7RUFDdEIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxzQkFBUjs7RUFFZixXQUFBLEdBQWM7O0VBQ2IsZUFBZ0IsSUFBSSxDQUFDLGVBQUwsQ0FBQTs7RUFDakIsV0FBQSxHQUFjLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYjs7RUFFZCxPQUFPLENBQUMsYUFBUixHQUF3QixTQUFDLElBQUQsRUFBVSxRQUFWLEVBQW9CLE9BQXBCLEVBQTZCLFdBQTdCLEVBQTBDLFFBQTFDOztNQUFDLE9BQUs7O1dBQzVCLE1BQUEsQ0FBTyxJQUFQLEVBQWEsUUFBYixFQUF1QixXQUF2QixFQUFvQyxLQUFwQyxFQUEyQyxTQUFDLEtBQUQsRUFBUSxJQUFSO0FBQ3pDLFVBQUE7TUFBQSxJQUEwQixhQUExQjtBQUFBLGVBQU8sUUFBQSxDQUFTLEtBQVQsRUFBUDs7TUFFQSxRQUFBLEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsVUFBdkI7TUFDWCxRQUFRLENBQUMsU0FBVCxHQUFxQjtNQUNyQixXQUFBLEdBQWMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFqQixDQUEyQixJQUEzQjthQUVkLFFBQUEsQ0FBUyxJQUFULEVBQWUsV0FBZjtJQVB5QyxDQUEzQztFQURz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aUJBQUEsQ0FBa0IsU0FBbEIsQ0FEWDtRQUVBLElBQUEsRUFBTSxJQUZOO1FBR0EsUUFBQSxFQUFVLElBSFY7UUFJQSxTQUFBLEVBQVcsSUFKWDtRQUtBLFlBQUEsRUFBYyxLQUxkO1FBT0EsY0FBQSxFQUNLLFNBQUgsR0FDRSxxQkFBQSxHQUFzQixTQUR4QixHQUdFLGVBWEo7T0FEZ0I7YUFjbEIsVUFBVSxDQUFDLFNBQVgsR0FBdUI7SUFsQlcsQ0FBcEM7V0FvQkEsR0FBRyxDQUFDO0VBNUJlO0FBdEpyQiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbmhpZ2hsaWdodCA9IHJlcXVpcmUgJ2F0b20taGlnaGxpZ2h0J1xueyR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5wYW5kb2NIZWxwZXIgPSBudWxsICMgRGVmZXIgdW50aWwgdXNlZFxubWFya2Rvd25JdCA9IG51bGwgIyBEZWZlciB1bnRpbCB1c2VkXG57c2NvcGVGb3JGZW5jZU5hbWV9ID0gcmVxdWlyZSAnLi9leHRlbnNpb24taGVscGVyJ1xuaW1hZ2VXYXRjaGVyID0gcmVxdWlyZSAnLi9pbWFnZS13YXRjaC1oZWxwZXInXG5cbmhpZ2hsaWdodGVyID0gbnVsbFxue3Jlc291cmNlUGF0aH0gPSBhdG9tLmdldExvYWRTZXR0aW5ncygpXG5wYWNrYWdlUGF0aCA9IHBhdGguZGlybmFtZShfX2Rpcm5hbWUpXG5cbmV4cG9ydHMudG9ET01GcmFnbWVudCA9ICh0ZXh0PScnLCBmaWxlUGF0aCwgZ3JhbW1hciwgcmVuZGVyTGFUZVgsIGNhbGxiYWNrKSAtPlxuICByZW5kZXIgdGV4dCwgZmlsZVBhdGgsIHJlbmRlckxhVGVYLCBmYWxzZSwgKGVycm9yLCBodG1sKSAtPlxuICAgIHJldHVybiBjYWxsYmFjayhlcnJvcikgaWYgZXJyb3I/XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJylcbiAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSBodG1sXG4gICAgZG9tRnJhZ21lbnQgPSB0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKVxuXG4gICAgY2FsbGJhY2sobnVsbCwgZG9tRnJhZ21lbnQpXG5cbmV4cG9ydHMudG9IVE1MID0gKHRleHQ9JycsIGZpbGVQYXRoLCBncmFtbWFyLCByZW5kZXJMYVRlWCwgY29weUhUTUxGbGFnLCBjYWxsYmFjaykgLT5cbiAgcmVuZGVyIHRleHQsIGZpbGVQYXRoLCByZW5kZXJMYVRlWCwgY29weUhUTUxGbGFnLCAoZXJyb3IsIGh0bWwpIC0+XG4gICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKSBpZiBlcnJvcj9cbiAgICAjIERlZmF1bHQgY29kZSBibG9ja3MgdG8gYmUgY29mZmVlIGluIExpdGVyYXRlIENvZmZlZVNjcmlwdCBmaWxlc1xuICAgIGRlZmF1bHRDb2RlTGFuZ3VhZ2UgPSAnY29mZmVlJyBpZiBncmFtbWFyPy5zY29wZU5hbWUgaXMgJ3NvdXJjZS5saXRjb2ZmZWUnXG4gICAgdW5sZXNzIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZVBhbmRvYycpIFxcXG4gICAgICAgIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VOYXRpdmVQYW5kb2NDb2RlU3R5bGVzJylcbiAgICAgIGh0bWwgPSB0b2tlbml6ZUNvZGVCbG9ja3MoaHRtbCwgZGVmYXVsdENvZGVMYW5ndWFnZSlcbiAgICBjYWxsYmFjayhudWxsLCBodG1sKVxuXG5yZW5kZXIgPSAodGV4dCwgZmlsZVBhdGgsIHJlbmRlckxhVGVYLCBjb3B5SFRNTEZsYWcsIGNhbGxiYWNrKSAtPlxuICAjIFJlbW92ZSB0aGUgPCFkb2N0eXBlPiBzaW5jZSBvdGhlcndpc2UgbWFya2VkIHdpbGwgZXNjYXBlIGl0XG4gICMgaHR0cHM6Ly9naXRodWIuY29tL2NoamovbWFya2VkL2lzc3Vlcy8zNTRcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXlxccyo8IWRvY3R5cGUoXFxzKy4qKT8+XFxzKi9pLCAnJylcblxuICBjYWxsYmFja0Z1bmN0aW9uID0gKGVycm9yLCBodG1sKSAtPlxuICAgIHJldHVybiBjYWxsYmFjayhlcnJvcikgaWYgZXJyb3I/XG4gICAgaHRtbCA9IHNhbml0aXplKGh0bWwpXG4gICAgaHRtbCA9IHJlc29sdmVJbWFnZVBhdGhzKGh0bWwsIGZpbGVQYXRoLCBjb3B5SFRNTEZsYWcpXG4gICAgY2FsbGJhY2sobnVsbCwgaHRtbC50cmltKCkpXG5cbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlUGFuZG9jJylcbiAgICBwYW5kb2NIZWxwZXIgPz0gcmVxdWlyZSAnLi9wYW5kb2MtaGVscGVyJ1xuICAgIHBhbmRvY0hlbHBlci5yZW5kZXJQYW5kb2MgdGV4dCwgZmlsZVBhdGgsIHJlbmRlckxhVGVYLCBjYWxsYmFja0Z1bmN0aW9uXG4gIGVsc2VcblxuICAgIG1hcmtkb3duSXQgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1pdC1oZWxwZXInXG5cbiAgICBjYWxsYmFja0Z1bmN0aW9uIG51bGwsIG1hcmtkb3duSXQucmVuZGVyKHRleHQsIHJlbmRlckxhVGVYKVxuXG5zYW5pdGl6ZSA9IChodG1sKSAtPlxuICBkb2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkb2MuaW5uZXJIVE1MID0gaHRtbFxuICAjIERvIG5vdCByZW1vdmUgTWF0aEpheCBzY3JpcHQgZGVsaW1pdGVkIGJsb2Nrc1xuICBkb2MucXVlcnlTZWxlY3RvckFsbChcInNjcmlwdDpub3QoW3R5cGVePSdtYXRoL3RleCddKVwiKS5mb3JFYWNoIChlbGVtKSAtPiBlbGVtLnJlbW92ZSgpXG4gIGF0dHJpYnV0ZXNUb1JlbW92ZSA9IFtcbiAgICAnb25hYm9ydCdcbiAgICAnb25ibHVyJ1xuICAgICdvbmNoYW5nZSdcbiAgICAnb25jbGljaydcbiAgICAnb25kYmNsaWNrJ1xuICAgICdvbmVycm9yJ1xuICAgICdvbmZvY3VzJ1xuICAgICdvbmtleWRvd24nXG4gICAgJ29ua2V5cHJlc3MnXG4gICAgJ29ua2V5dXAnXG4gICAgJ29ubG9hZCdcbiAgICAnb25tb3VzZWRvd24nXG4gICAgJ29ubW91c2Vtb3ZlJ1xuICAgICdvbm1vdXNlb3ZlcidcbiAgICAnb25tb3VzZW91dCdcbiAgICAnb25tb3VzZXVwJ1xuICAgICdvbnJlc2V0J1xuICAgICdvbnJlc2l6ZSdcbiAgICAnb25zY3JvbGwnXG4gICAgJ29uc2VsZWN0J1xuICAgICdvbnN1Ym1pdCdcbiAgICAnb251bmxvYWQnXG4gIF1cbiAgZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoJyonKS5mb3JFYWNoIChlbGVtKSAtPlxuICAgIGVsZW0ucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSkgZm9yIGF0dHJpYnV0ZSBpbiBhdHRyaWJ1dGVzVG9SZW1vdmVcbiAgZG9jLmlubmVySFRNTFxuXG5cbnJlc29sdmVJbWFnZVBhdGhzID0gKGh0bWwsIGZpbGVQYXRoLCBjb3B5SFRNTEZsYWcpIC0+XG4gIGlmIGF0b20ucHJvamVjdD9cbiAgICBbcm9vdERpcmVjdG9yeV0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZVBhdGgpXG4gIGRvYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGRvYy5pbm5lckhUTUwgPSBodG1sXG4gIGRvYy5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKS5mb3JFYWNoIChpbWcpIC0+XG4gICAgaWYgc3JjID0gaW1nLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVQYW5kb2MnKVxuICAgICAgICBtYXJrZG93bkl0ID89IHJlcXVpcmUgJy4vbWFya2Rvd24taXQtaGVscGVyJ1xuICAgICAgICBzcmMgPSBtYXJrZG93bkl0LmRlY29kZShzcmMpXG5cbiAgICAgIHJldHVybiBpZiBzcmMubWF0Y2goL14oaHR0cHM/fGF0b218ZGF0YSk6LylcbiAgICAgIHJldHVybiBpZiBzcmMuc3RhcnRzV2l0aChwcm9jZXNzLnJlc291cmNlc1BhdGgpXG4gICAgICByZXR1cm4gaWYgc3JjLnN0YXJ0c1dpdGgocmVzb3VyY2VQYXRoKVxuICAgICAgcmV0dXJuIGlmIHNyYy5zdGFydHNXaXRoKHBhY2thZ2VQYXRoKVxuXG4gICAgICBpZiBzcmNbMF0gaXMgJy8nXG4gICAgICAgIHVubGVzcyBmcy5pc0ZpbGVTeW5jKHNyYylcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHNyYyA9IHBhdGguam9pbihyb290RGlyZWN0b3J5LCBzcmMuc3Vic3RyaW5nKDEpKVxuICAgICAgICAgIGNhdGNoIGVcbiAgICAgIGVsc2VcbiAgICAgICAgc3JjID0gcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShmaWxlUGF0aCksIHNyYylcblxuICAgICAgIyBVc2UgbW9zdCByZWNlbnQgdmVyc2lvbiBvZiBpbWFnZVxuICAgICAgaWYgbm90IGNvcHlIVE1MRmxhZ1xuICAgICAgICB2ID0gaW1hZ2VXYXRjaGVyLmdldFZlcnNpb24oc3JjLCBmaWxlUGF0aClcbiAgICAgICAgc3JjID0gXCIje3NyY30/dj0je3Z9XCIgaWYgdlxuXG4gICAgICBpbWcuc3JjID0gc3JjXG5cbiAgZG9jLmlubmVySFRNTFxuXG5leHBvcnRzLmNvbnZlcnRDb2RlQmxvY2tzVG9BdG9tRWRpdG9ycyA9IChkb21GcmFnbWVudCwgZGVmYXVsdExhbmd1YWdlPSd0ZXh0JykgLT5cbiAgaWYgZm9udEZhbWlseSA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKVxuICAgIGZvciBjb2RlRWxlbWVudCBpbiBkb21GcmFnbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdjb2RlJylcbiAgICAgIGNvZGVFbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBmb250RmFtaWx5XG5cbiAgZm9yIHByZUVsZW1lbnQgaW4gZG9tRnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCgncHJlJylcbiAgICBjb2RlQmxvY2sgPSBwcmVFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkID8gcHJlRWxlbWVudFxuICAgIGZlbmNlTmFtZSA9IGNvZGVCbG9jay5nZXRBdHRyaWJ1dGUoJ2NsYXNzJyk/LnJlcGxhY2UoL14obGFuZy18c291cmNlQ29kZSApLywgJycpID8gZGVmYXVsdExhbmd1YWdlXG5cbiAgICBlZGl0b3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXRvbS10ZXh0LWVkaXRvcicpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRBdHRyaWJ1dGVOb2RlKGRvY3VtZW50LmNyZWF0ZUF0dHJpYnV0ZSgnZ3V0dGVyLWhpZGRlbicpKVxuICAgIGVkaXRvckVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpICMgbWFrZSByZWFkLW9ubHlcblxuICAgIHByZUVsZW1lbnQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWRpdG9yRWxlbWVudCwgcHJlRWxlbWVudClcbiAgICBwcmVFbGVtZW50LnJlbW92ZSgpXG5cbiAgICBlZGl0b3IgPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICAjIHJlbW92ZSB0aGUgZGVmYXVsdCBzZWxlY3Rpb24gb2YgYSBsaW5lIGluIGVhY2ggZWRpdG9yXG4gICAgaWYgZWRpdG9yLmN1cnNvckxpbmVEZWNvcmF0aW9ucz9cbiAgICAgIGZvciBjdXJzb3JMaW5lRGVjb3JhdGlvbiBpbiBlZGl0b3IuY3Vyc29yTGluZURlY29yYXRpb25zXG4gICAgICAgIGN1cnNvckxpbmVEZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgIGVsc2VcbiAgICAgIGVkaXRvci5nZXREZWNvcmF0aW9ucyhjbGFzczogJ2N1cnNvci1saW5lJywgdHlwZTogJ2xpbmUnKVswXS5kZXN0cm95KClcbiAgICBlZGl0b3Iuc2V0VGV4dChjb2RlQmxvY2sudGV4dENvbnRlbnQucmVwbGFjZSgvXFxuJC8sICcnKSlcbiAgICBpZiBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKHNjb3BlRm9yRmVuY2VOYW1lKGZlbmNlTmFtZSkpXG4gICAgICBlZGl0b3Iuc2V0R3JhbW1hcihncmFtbWFyKVxuXG4gIGRvbUZyYWdtZW50XG5cbnRva2VuaXplQ29kZUJsb2NrcyA9IChodG1sLCBkZWZhdWx0TGFuZ3VhZ2U9J3RleHQnKSAtPlxuICBkb2MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBkb2MuaW5uZXJIVE1MID0gaHRtbFxuXG4gIGlmIGZvbnRGYW1pbHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBkb2MucXVlcnlTZWxlY3RvckFsbCgnY29kZScpLmZvckVhY2ggKGNvZGUpIC0+XG4gICAgICBjb2RlLnN0eWxlLmZvbnRGYW1pbHkgPSBmb250RmFtaWx5XG5cbiAgZG9jLnF1ZXJ5U2VsZWN0b3JBbGwoXCJwcmVcIikuZm9yRWFjaCAocHJlRWxlbWVudCkgLT5cbiAgICBjb2RlQmxvY2sgPSBwcmVFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkXG4gICAgZmVuY2VOYW1lID0gY29kZUJsb2NrLmNsYXNzTmFtZS5yZXBsYWNlKC9eKGxhbmctfHNvdXJjZUNvZGUgKS8sICcnKSA/IGRlZmF1bHRMYW5ndWFnZVxuXG4gICAgaGlnaGxpZ2h0ZWRIdG1sID0gaGlnaGxpZ2h0XG4gICAgICBmaWxlQ29udGVudHM6IGNvZGVCbG9jay5pbm5lclRleHRcbiAgICAgIHNjb3BlTmFtZTogc2NvcGVGb3JGZW5jZU5hbWUoZmVuY2VOYW1lKVxuICAgICAgbmJzcDogdHJ1ZVxuICAgICAgbGluZURpdnM6IHRydWVcbiAgICAgIGVkaXRvckRpdjogdHJ1ZVxuICAgICAgZWRpdG9yRGl2VGFnOiAncHJlJ1xuICAgICAgIyBUaGUgYGVkaXRvcmAgY2xhc3MgbWVzc2VzIHRoaW5ncyB1cCBhcyBgLmVkaXRvcmAgaGFzIGFic29sdXRlbHkgcG9zaXRpb25lZCBsaW5lc1xuICAgICAgZWRpdG9yRGl2Q2xhc3M6XG4gICAgICAgIGlmIGZlbmNlTmFtZVxuICAgICAgICAgIFwiZWRpdG9yLWNvbG9ycyBsYW5nLSN7ZmVuY2VOYW1lfVwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBcImVkaXRvci1jb2xvcnNcIlxuXG4gICAgcHJlRWxlbWVudC5vdXRlckhUTUwgPSBoaWdobGlnaHRlZEh0bWxcblxuICBkb2MuaW5uZXJIVE1MXG4iXX0=
