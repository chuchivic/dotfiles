(function() {
  var $, _, cheerio, fs, highlight, highlighter, imageWatcher, markdownIt, packagePath, pandocHelper, path, render, resolveImagePaths, resourcePath, sanitize, scopeForFenceName, tokenizeCodeBlocks;

  path = require('path');

  _ = require('underscore-plus');

  cheerio = require('cheerio');

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
    var attribute, attributesToRemove, i, len, o;
    o = cheerio.load(html);
    o("script:not([type^='math/tex'])").remove();
    attributesToRemove = ['onabort', 'onblur', 'onchange', 'onclick', 'ondbclick', 'onerror', 'onfocus', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove', 'onmouseover', 'onmouseout', 'onmouseup', 'onreset', 'onresize', 'onscroll', 'onselect', 'onsubmit', 'onunload'];
    for (i = 0, len = attributesToRemove.length; i < len; i++) {
      attribute = attributesToRemove[i];
      o('*').removeAttr(attribute);
    }
    return o.html();
  };

  resolveImagePaths = function(html, filePath, copyHTMLFlag) {
    var e, i, img, imgElement, len, o, ref, rootDirectory, src, v;
    if (atom.project != null) {
      rootDirectory = atom.project.relativizePath(filePath)[0];
    }
    o = cheerio.load(html);
    ref = o('img');
    for (i = 0, len = ref.length; i < len; i++) {
      imgElement = ref[i];
      img = o(imgElement);
      if (src = img.attr('src')) {
        if (!atom.config.get('markdown-preview-plus.enablePandoc')) {
          if (markdownIt == null) {
            markdownIt = require('./markdown-it-helper');
          }
          src = markdownIt.decode(src);
        }
        if (src.match(/^(https?|atom):\/\//)) {
          continue;
        }
        if (src.startsWith(process.resourcesPath)) {
          continue;
        }
        if (src.startsWith(resourcePath)) {
          continue;
        }
        if (src.startsWith(packagePath)) {
          continue;
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
        img.attr('src', src);
      }
    }
    return o.html();
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
    var codeBlock, fenceName, fontFamily, highlightedBlock, highlightedHtml, i, len, o, preElement, ref, ref1, ref2;
    if (defaultLanguage == null) {
      defaultLanguage = 'text';
    }
    o = cheerio.load(html);
    if (fontFamily = atom.config.get('editor.fontFamily')) {
      o('code').css('font-family', fontFamily);
    }
    ref = o("pre");
    for (i = 0, len = ref.length; i < len; i++) {
      preElement = ref[i];
      codeBlock = o(preElement).children().first();
      fenceName = (ref1 = (ref2 = codeBlock.attr('class')) != null ? ref2.replace(/^(lang-|sourceCode )/, '') : void 0) != null ? ref1 : defaultLanguage;
      highlightedHtml = highlight({
        fileContents: codeBlock.text(),
        scopeName: scopeForFenceName(fenceName),
        nbsp: true,
        lineDivs: true,
        editorDiv: true,
        editorDivTag: 'pre',
        editorDivClass: 'editor-colors'
      });
      highlightedBlock = o(highlightedHtml);
      highlightedBlock.addClass("lang-" + fenceName);
      o(preElement).replaceWith(highlightedBlock);
    }
    return o.html();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9yZW5kZXJlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFDVixFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsU0FBQSxHQUFZLE9BQUEsQ0FBUSxnQkFBUjs7RUFDWCxJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFDTixZQUFBLEdBQWU7O0VBQ2YsVUFBQSxHQUFhOztFQUNaLG9CQUFxQixPQUFBLENBQVEsb0JBQVI7O0VBQ3RCLFlBQUEsR0FBZSxPQUFBLENBQVEsc0JBQVI7O0VBRWYsV0FBQSxHQUFjOztFQUNiLGVBQWdCLElBQUksQ0FBQyxlQUFMLENBQUE7O0VBQ2pCLFdBQUEsR0FBYyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWI7O0VBRWQsT0FBTyxDQUFDLGFBQVIsR0FBd0IsU0FBQyxJQUFELEVBQVUsUUFBVixFQUFvQixPQUFwQixFQUE2QixXQUE3QixFQUEwQyxRQUExQzs7TUFBQyxPQUFLOztXQUM1QixNQUFBLENBQU8sSUFBUCxFQUFhLFFBQWIsRUFBdUIsV0FBdkIsRUFBb0MsS0FBcEMsRUFBMkMsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUN6QyxVQUFBO01BQUEsSUFBMEIsYUFBMUI7QUFBQSxlQUFPLFFBQUEsQ0FBUyxLQUFULEVBQVA7O01BRUEsUUFBQSxHQUFXLFFBQVEsQ0FBQyxhQUFULENBQXVCLFVBQXZCO01BQ1gsUUFBUSxDQUFDLFNBQVQsR0FBcUI7TUFDckIsV0FBQSxHQUFjLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBakIsQ0FBMkIsSUFBM0I7YUFFZCxRQUFBLENBQVMs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Q0FBMEIsZ0JBQTFCO0FBakJGO1dBbUJBLENBQUMsQ0FBQyxJQUFGLENBQUE7RUF6Qm1CO0FBckpyQiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbmNoZWVyaW8gPSByZXF1aXJlICdjaGVlcmlvJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuaGlnaGxpZ2h0ID0gcmVxdWlyZSAnYXRvbS1oaWdobGlnaHQnXG57JH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhbmRvY0hlbHBlciA9IG51bGwgIyBEZWZlciB1bnRpbCB1c2VkXG5tYXJrZG93bkl0ID0gbnVsbCAjIERlZmVyIHVudGlsIHVzZWRcbntzY29wZUZvckZlbmNlTmFtZX0gPSByZXF1aXJlICcuL2V4dGVuc2lvbi1oZWxwZXInXG5pbWFnZVdhdGNoZXIgPSByZXF1aXJlICcuL2ltYWdlLXdhdGNoLWhlbHBlcidcblxuaGlnaGxpZ2h0ZXIgPSBudWxsXG57cmVzb3VyY2VQYXRofSA9IGF0b20uZ2V0TG9hZFNldHRpbmdzKClcbnBhY2thZ2VQYXRoID0gcGF0aC5kaXJuYW1lKF9fZGlybmFtZSlcblxuZXhwb3J0cy50b0RPTUZyYWdtZW50ID0gKHRleHQ9JycsIGZpbGVQYXRoLCBncmFtbWFyLCByZW5kZXJMYVRlWCwgY2FsbGJhY2spIC0+XG4gIHJlbmRlciB0ZXh0LCBmaWxlUGF0aCwgcmVuZGVyTGFUZVgsIGZhbHNlLCAoZXJyb3IsIGh0bWwpIC0+XG4gICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKSBpZiBlcnJvcj9cblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKVxuICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWxcbiAgICBkb21GcmFnbWVudCA9IHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpXG5cbiAgICBjYWxsYmFjayhudWxsLCBkb21GcmFnbWVudClcblxuZXhwb3J0cy50b0hUTUwgPSAodGV4dD0nJywgZmlsZVBhdGgsIGdyYW1tYXIsIHJlbmRlckxhVGVYLCBjb3B5SFRNTEZsYWcsIGNhbGxiYWNrKSAtPlxuICByZW5kZXIgdGV4dCwgZmlsZVBhdGgsIHJlbmRlckxhVGVYLCBjb3B5SFRNTEZsYWcsIChlcnJvciwgaHRtbCkgLT5cbiAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IpIGlmIGVycm9yP1xuICAgICMgRGVmYXVsdCBjb2RlIGJsb2NrcyB0byBiZSBjb2ZmZWUgaW4gTGl0ZXJhdGUgQ29mZmVlU2NyaXB0IGZpbGVzXG4gICAgZGVmYXVsdENvZGVMYW5ndWFnZSA9ICdjb2ZmZWUnIGlmIGdyYW1tYXI/LnNjb3BlTmFtZSBpcyAnc291cmNlLmxpdGNvZmZlZSdcbiAgICB1bmxlc3MgYXRvbS5jb25maWcuZ2V0KCdtYXJrZG93bi1wcmV2aWV3LXBsdXMuZW5hYmxlUGFuZG9jJykgXFxcbiAgICAgICAgYW5kIGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLnVzZU5hdGl2ZVBhbmRvY0NvZGVTdHlsZXMnKVxuICAgICAgaHRtbCA9IHRva2VuaXplQ29kZUJsb2NrcyhodG1sLCBkZWZhdWx0Q29kZUxhbmd1YWdlKVxuICAgIGNhbGxiYWNrKG51bGwsIGh0bWwpXG5cbnJlbmRlciA9ICh0ZXh0LCBmaWxlUGF0aCwgcmVuZGVyTGFUZVgsIGNvcHlIVE1MRmxhZywgY2FsbGJhY2spIC0+XG4gICMgUmVtb3ZlIHRoZSA8IWRvY3R5cGU+IHNpbmNlIG90aGVyd2lzZSBtYXJrZWQgd2lsbCBlc2NhcGUgaXRcbiAgIyBodHRwczovL2dpdGh1Yi5jb20vY2hqai9tYXJrZWQvaXNzdWVzLzM1NFxuICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC9eXFxzKjwhZG9jdHlwZShcXHMrLiopPz5cXHMqL2ksICcnKVxuXG4gIGNhbGxiYWNrRnVuY3Rpb24gPSAoZXJyb3IsIGh0bWwpIC0+XG4gICAgcmV0dXJuIGNhbGxiYWNrKGVycm9yKSBpZiBlcnJvcj9cbiAgICBodG1sID0gc2FuaXRpemUoaHRtbClcbiAgICBodG1sID0gcmVzb2x2ZUltYWdlUGF0aHMoaHRtbCwgZmlsZVBhdGgsIGNvcHlIVE1MRmxhZylcbiAgICBjYWxsYmFjayhudWxsLCBodG1sLnRyaW0oKSlcblxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5lbmFibGVQYW5kb2MnKVxuICAgIHBhbmRvY0hlbHBlciA/PSByZXF1aXJlICcuL3BhbmRvYy1oZWxwZXInXG4gICAgcGFuZG9jSGVscGVyLnJlbmRlclBhbmRvYyB0ZXh0LCBmaWxlUGF0aCwgcmVuZGVyTGFUZVgsIGNhbGxiYWNrRnVuY3Rpb25cbiAgZWxzZVxuXG4gICAgbWFya2Rvd25JdCA/PSByZXF1aXJlICcuL21hcmtkb3duLWl0LWhlbHBlcidcblxuICAgIGNhbGxiYWNrRnVuY3Rpb24gbnVsbCwgbWFya2Rvd25JdC5yZW5kZXIodGV4dCwgcmVuZGVyTGFUZVgpXG5cbnNhbml0aXplID0gKGh0bWwpIC0+XG4gIG8gPSBjaGVlcmlvLmxvYWQoaHRtbClcbiAgIyBEbyBub3QgcmVtb3ZlIE1hdGhKYXggc2NyaXB0IGRlbGltaXRlZCBibG9ja3NcbiAgbyhcInNjcmlwdDpub3QoW3R5cGVePSdtYXRoL3RleCddKVwiKS5yZW1vdmUoKVxuICBhdHRyaWJ1dGVzVG9SZW1vdmUgPSBbXG4gICAgJ29uYWJvcnQnXG4gICAgJ29uYmx1cidcbiAgICAnb25jaGFuZ2UnXG4gICAgJ29uY2xpY2snXG4gICAgJ29uZGJjbGljaydcbiAgICAnb25lcnJvcidcbiAgICAnb25mb2N1cydcbiAgICAnb25rZXlkb3duJ1xuICAgICdvbmtleXByZXNzJ1xuICAgICdvbmtleXVwJ1xuICAgICdvbmxvYWQnXG4gICAgJ29ubW91c2Vkb3duJ1xuICAgICdvbm1vdXNlbW92ZSdcbiAgICAnb25tb3VzZW92ZXInXG4gICAgJ29ubW91c2VvdXQnXG4gICAgJ29ubW91c2V1cCdcbiAgICAnb25yZXNldCdcbiAgICAnb25yZXNpemUnXG4gICAgJ29uc2Nyb2xsJ1xuICAgICdvbnNlbGVjdCdcbiAgICAnb25zdWJtaXQnXG4gICAgJ29udW5sb2FkJ1xuICBdXG4gIG8oJyonKS5yZW1vdmVBdHRyKGF0dHJpYnV0ZSkgZm9yIGF0dHJpYnV0ZSBpbiBhdHRyaWJ1dGVzVG9SZW1vdmVcbiAgby5odG1sKClcblxuXG5yZXNvbHZlSW1hZ2VQYXRocyA9IChodG1sLCBmaWxlUGF0aCwgY29weUhUTUxGbGFnKSAtPlxuICBpZiBhdG9tLnByb2plY3Q/XG4gICAgW3Jvb3REaXJlY3RvcnldID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVxuICBvID0gY2hlZXJpby5sb2FkKGh0bWwpXG4gIGZvciBpbWdFbGVtZW50IGluIG8oJ2ltZycpXG4gICAgaW1nID0gbyhpbWdFbGVtZW50KVxuICAgIGlmIHNyYyA9IGltZy5hdHRyKCdzcmMnKVxuICAgICAgaWYgbm90IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmVuYWJsZVBhbmRvYycpXG4gICAgICAgIG1hcmtkb3duSXQgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1pdC1oZWxwZXInXG4gICAgICAgIHNyYyA9IG1hcmtkb3duSXQuZGVjb2RlKHNyYylcblxuICAgICAgY29udGludWUgaWYgc3JjLm1hdGNoKC9eKGh0dHBzP3xhdG9tKTpcXC9cXC8vKVxuICAgICAgY29udGludWUgaWYgc3JjLnN0YXJ0c1dpdGgocHJvY2Vzcy5yZXNvdXJjZXNQYXRoKVxuICAgICAgY29udGludWUgaWYgc3JjLnN0YXJ0c1dpdGgocmVzb3VyY2VQYXRoKVxuICAgICAgY29udGludWUgaWYgc3JjLnN0YXJ0c1dpdGgocGFja2FnZVBhdGgpXG5cbiAgICAgIGlmIHNyY1swXSBpcyAnLydcbiAgICAgICAgdW5sZXNzIGZzLmlzRmlsZVN5bmMoc3JjKVxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgc3JjID0gcGF0aC5qb2luKHJvb3REaXJlY3RvcnksIHNyYy5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgY2F0Y2ggZVxuICAgICAgZWxzZVxuICAgICAgICBzcmMgPSBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgc3JjKVxuXG4gICAgICAjIFVzZSBtb3N0IHJlY2VudCB2ZXJzaW9uIG9mIGltYWdlXG4gICAgICBpZiBub3QgY29weUhUTUxGbGFnXG4gICAgICAgIHYgPSBpbWFnZVdhdGNoZXIuZ2V0VmVyc2lvbihzcmMsIGZpbGVQYXRoKVxuICAgICAgICBzcmMgPSBcIiN7c3JjfT92PSN7dn1cIiBpZiB2XG5cbiAgICAgIGltZy5hdHRyKCdzcmMnLCBzcmMpXG5cbiAgby5odG1sKClcblxuZXhwb3J0cy5jb252ZXJ0Q29kZUJsb2Nrc1RvQXRvbUVkaXRvcnMgPSAoZG9tRnJhZ21lbnQsIGRlZmF1bHRMYW5ndWFnZT0ndGV4dCcpIC0+XG4gIGlmIGZvbnRGYW1pbHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBmb3IgY29kZUVsZW1lbnQgaW4gZG9tRnJhZ21lbnQucXVlcnlTZWxlY3RvckFsbCgnY29kZScpXG4gICAgICBjb2RlRWxlbWVudC5zdHlsZS5mb250RmFtaWx5ID0gZm9udEZhbWlseVxuXG4gIGZvciBwcmVFbGVtZW50IGluIGRvbUZyYWdtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3ByZScpXG4gICAgY29kZUJsb2NrID0gcHJlRWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZCA/IHByZUVsZW1lbnRcbiAgICBmZW5jZU5hbWUgPSBjb2RlQmxvY2suZ2V0QXR0cmlidXRlKCdjbGFzcycpPy5yZXBsYWNlKC9eKGxhbmctfHNvdXJjZUNvZGUgKS8sICcnKSA/IGRlZmF1bHRMYW5ndWFnZVxuXG4gICAgZWRpdG9yRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2F0b20tdGV4dC1lZGl0b3InKVxuICAgIGVkaXRvckVsZW1lbnQuc2V0QXR0cmlidXRlTm9kZShkb2N1bWVudC5jcmVhdGVBdHRyaWJ1dGUoJ2d1dHRlci1oaWRkZW4nKSlcbiAgICBlZGl0b3JFbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKSAjIG1ha2UgcmVhZC1vbmx5XG5cbiAgICBwcmVFbGVtZW50LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVkaXRvckVsZW1lbnQsIHByZUVsZW1lbnQpXG4gICAgcHJlRWxlbWVudC5yZW1vdmUoKVxuXG4gICAgZWRpdG9yID0gZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgIyByZW1vdmUgdGhlIGRlZmF1bHQgc2VsZWN0aW9uIG9mIGEgbGluZSBpbiBlYWNoIGVkaXRvclxuICAgIGlmIGVkaXRvci5jdXJzb3JMaW5lRGVjb3JhdGlvbnM/XG4gICAgICBmb3IgY3Vyc29yTGluZURlY29yYXRpb24gaW4gZWRpdG9yLmN1cnNvckxpbmVEZWNvcmF0aW9uc1xuICAgICAgICBjdXJzb3JMaW5lRGVjb3JhdGlvbi5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBlZGl0b3IuZ2V0RGVjb3JhdGlvbnMoY2xhc3M6ICdjdXJzb3ItbGluZScsIHR5cGU6ICdsaW5lJylbMF0uZGVzdHJveSgpXG4gICAgZWRpdG9yLnNldFRleHQoY29kZUJsb2NrLnRleHRDb250ZW50LnJlcGxhY2UoL1xcbiQvLCAnJykpXG4gICAgaWYgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZUZvckZlbmNlTmFtZShmZW5jZU5hbWUpKVxuICAgICAgZWRpdG9yLnNldEdyYW1tYXIoZ3JhbW1hcilcblxuICBkb21GcmFnbWVudFxuXG50b2tlbml6ZUNvZGVCbG9ja3MgPSAoaHRtbCwgZGVmYXVsdExhbmd1YWdlPSd0ZXh0JykgLT5cbiAgbyA9IGNoZWVyaW8ubG9hZChodG1sKVxuXG4gIGlmIGZvbnRGYW1pbHkgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250RmFtaWx5JylcbiAgICBvKCdjb2RlJykuY3NzKCdmb250LWZhbWlseScsIGZvbnRGYW1pbHkpXG5cbiAgZm9yIHByZUVsZW1lbnQgaW4gbyhcInByZVwiKVxuICAgIGNvZGVCbG9jayA9IG8ocHJlRWxlbWVudCkuY2hpbGRyZW4oKS5maXJzdCgpXG4gICAgZmVuY2VOYW1lID0gY29kZUJsb2NrLmF0dHIoJ2NsYXNzJyk/LnJlcGxhY2UoL14obGFuZy18c291cmNlQ29kZSApLywgJycpID8gZGVmYXVsdExhbmd1YWdlXG5cbiAgICBoaWdobGlnaHRlZEh0bWwgPSBoaWdobGlnaHRcbiAgICAgIGZpbGVDb250ZW50czogY29kZUJsb2NrLnRleHQoKVxuICAgICAgc2NvcGVOYW1lOiBzY29wZUZvckZlbmNlTmFtZShmZW5jZU5hbWUpXG4gICAgICBuYnNwOiB0cnVlXG4gICAgICBsaW5lRGl2czogdHJ1ZVxuICAgICAgZWRpdG9yRGl2OiB0cnVlXG4gICAgICBlZGl0b3JEaXZUYWc6ICdwcmUnXG4gICAgICAjIFRoZSBgZWRpdG9yYCBjbGFzcyBtZXNzZXMgdGhpbmdzIHVwIGFzIGAuZWRpdG9yYCBoYXMgYWJzb2x1dGVseSBwb3NpdGlvbmVkIGxpbmVzXG4gICAgICBlZGl0b3JEaXZDbGFzczogJ2VkaXRvci1jb2xvcnMnXG5cbiAgICBoaWdobGlnaHRlZEJsb2NrID0gbyhoaWdobGlnaHRlZEh0bWwpXG4gICAgaGlnaGxpZ2h0ZWRCbG9jay5hZGRDbGFzcyhcImxhbmctI3tmZW5jZU5hbWV9XCIpXG5cbiAgICBvKHByZUVsZW1lbnQpLnJlcGxhY2VXaXRoKGhpZ2hsaWdodGVkQmxvY2spXG5cbiAgby5odG1sKClcbiJdfQ==
