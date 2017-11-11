(function() {
  var getOptions, init, lazyHeaders, markdownIt, markdownItOptions, math, mathBlock, mathBrackets, mathDollars, mathInline, needsInit, renderLaTeX;

  markdownIt = null;

  markdownItOptions = null;

  renderLaTeX = null;

  math = null;

  lazyHeaders = null;

  mathInline = function(string) {
    return "<span class='math'><script type='math/tex'>" + string + "</script></span>";
  };

  mathBlock = function(string) {
    return "<span class='math'><script type='math/tex; mode=display'>" + string + "</script></span>";
  };

  mathDollars = {
    inlineOpen: '$',
    inlineClose: '$',
    blockOpen: '$$',
    blockClose: '$$',
    inlineRenderer: mathInline,
    blockRenderer: mathBlock
  };

  mathBrackets = {
    inlineOpen: '\\(',
    inlineClose: '\\)',
    blockOpen: '\\[',
    blockClose: '\\]',
    inlineRenderer: mathInline,
    blockRenderer: mathBlock
  };

  getOptions = function() {
    return {
      html: true,
      xhtmlOut: false,
      breaks: atom.config.get('markdown-preview-plus.breakOnSingleNewline'),
      langPrefix: 'lang-',
      linkify: true,
      typographer: true
    };
  };

  init = function(rL) {
    renderLaTeX = rL;
    markdownItOptions = getOptions();
    markdownIt = require('markdown-it')(markdownItOptions);
    if (renderLaTeX) {
      if (math == null) {
        math = require('markdown-it-math');
      }
      markdownIt.use(math, mathDollars);
      markdownIt.use(math, mathBrackets);
    }
    lazyHeaders = atom.config.get('markdown-preview-plus.useLazyHeaders');
    if (lazyHeaders) {
      return markdownIt.use(require('markdown-it-lazy-headers'));
    }
  };

  needsInit = function(rL) {
    return (markdownIt == null) || markdownItOptions.breaks !== atom.config.get('markdown-preview-plus.breakOnSingleNewline') || lazyHeaders !== atom.config.get('markdown-preview-plus.useLazyHeaders') || rL !== renderLaTeX;
  };

  exports.render = function(text, rL) {
    if (needsInit(rL)) {
      init(rL);
    }
    return markdownIt.render(text);
  };

  exports.decode = function(url) {
    return markdownIt.normalizeLinkText(url);
  };

  exports.getTokens = function(text, rL) {
    if (needsInit(rL)) {
      init(rL);
    }
    return markdownIt.parse(text, {});
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9tYXJrZG93bi1pdC1oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxVQUFBLEdBQWE7O0VBQ2IsaUJBQUEsR0FBb0I7O0VBQ3BCLFdBQUEsR0FBYzs7RUFDZCxJQUFBLEdBQU87O0VBQ1AsV0FBQSxHQUFjOztFQUVkLFVBQUEsR0FBYSxTQUFDLE1BQUQ7V0FBWSw2Q0FBQSxHQUE4QyxNQUE5QyxHQUFxRDtFQUFqRTs7RUFDYixTQUFBLEdBQVksU0FBQyxNQUFEO1dBQVksMkRBQUEsR0FBNEQsTUFBNUQsR0FBbUU7RUFBL0U7O0VBRVosV0FBQSxHQUNFO0lBQUEsVUFBQSxFQUFZLEdBQVo7SUFDQSxXQUFBLEVBQWEsR0FEYjtJQUVBLFNBQUEsRUFBVyxJQUZYO0lBR0EsVUFBQSxFQUFZLElBSFo7SUFJQSxjQUFBLEVBQWdCLFVBSmhCO0lBS0EsYUFBQSxFQUFlLFNBTGY7OztFQU9GLFlBQUEsR0FDRTtJQUFBLFVBQUEsRUFBWSxLQUFaO0lBQ0EsV0FBQSxFQUFhLEtBRGI7SUFFQSxTQUFBLEVBQVcsS0FGWDtJQUdBLFVBQUEsRUFBWSxLQUhaO0lBSUEsY0FBQSxFQUFnQixVQUpoQjtJQUtBLGFBQUEsRUFBZSxTQUxmOzs7RUFPRixVQUFBLEdBQWEsU0FBQTtXQUNYO01BQUEsSUFBQSxFQUFNLElBQU47TUFDQSxRQUFBLEVBQVUsS0FEVjtNQUVBLE1BQUEsRUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNENBQWhCLENBRlI7TUFHQSxVQUFBLEVBQVksT0FIWjtNQUlBLE9BQUEsRUFBUyxJQUpUO01BS0EsV0FBQSxFQUFhLElBTGI7O0VBRFc7O0VBU2IsSUFBQSxHQUFPLFNBQUMsRUFBRDtJQUVMLFdBQUEsR0FBYztJQUVkLGlCQUFBLEdBQW9CLFVBQUEsQ0FBQTtJQUVwQixVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVIsQ0FBQSxDQUF1QixpQkFBdkI7SUFFYixJQUFHLFdBQUg7O1FBQ0UsT0FBUSxPQUFBLENBQVEsa0JBQVI7O01BQ1IsVUFBVSxDQUFDLEdBQVgsQ0FBZSxJQUFmLEVBQXFCLFdBQXJCO01BQ0EsVUFBVSxDQUFDLEdBQVgsQ0FBZSxJQUFmLEVBQXFCLFlBQXJCLEVBSEY7O0lBS0EsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEI7SUFFZCxJQUFHLFdBQUg7YUFDRSxVQUFVLENBQUMsR0FBWCxDQUFlLE9BQUEsQ0FBUSwwQkFBUixDQUFmLEVBREY7O0VBZks7O0VBbUJQLFNBQUEsR0FBWSxTQUFDLEVBQUQ7V0FDTixvQkFBSixJQUNBLGlCQUFpQixDQUFDLE1BQWxCLEtBQThCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0Q0FBaEIsQ0FEOUIsSUFFQSxXQUFBLEtBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQ0FBaEIsQ0FGakIsSUFHQSxFQUFBLEtBQVE7RUFKRTs7RUFNWixPQUFPLENBQUMsTUFBUixHQUFpQixTQUFDLElBQUQsRUFBTyxFQUFQO0lBQ2YsSUFBWSxTQUFBLENBQVUsRUFBVixDQUFaO01BQUEsSUFBQSxDQUFLLEVBQUwsRUFBQTs7V0FDQSxVQUFVLENBQUMsTUFBWCxDQUFrQixJQUFsQjtFQUZlOztFQUlqQixPQUFPLENBQUMsTUFBUixHQUFpQixTQUFDLEdBQUQ7V0FDZixVQUFVLENBQUMsaUJBQVgsQ0FBNkIsR0FBN0I7RUFEZTs7RUFHakIsT0FBTyxDQUFDLFNBQVIsR0FBb0IsU0FBQyxJQUFELEVBQU8sRUFBUDtJQUNsQixJQUFZLFNBQUEsQ0FBVSxFQUFWLENBQVo7TUFBQSxJQUFBLENBQUssRUFBTCxFQUFBOztXQUNBLFVBQVUsQ0FBQyxLQUFYLENBQWlCLElBQWpCLEVBQXVCLEVBQXZCO0VBRmtCO0FBbEVwQiIsInNvdXJjZXNDb250ZW50IjpbIm1hcmtkb3duSXQgPSBudWxsXG5tYXJrZG93bkl0T3B0aW9ucyA9IG51bGxcbnJlbmRlckxhVGVYID0gbnVsbFxubWF0aCA9IG51bGxcbmxhenlIZWFkZXJzID0gbnVsbFxuXG5tYXRoSW5saW5lID0gKHN0cmluZykgLT4gXCI8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+I3tzdHJpbmd9PC9zY3JpcHQ+PC9zcGFuPlwiXG5tYXRoQmxvY2sgPSAoc3RyaW5nKSAtPiBcIjxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPiN7c3RyaW5nfTwvc2NyaXB0Pjwvc3Bhbj5cIlxuXG5tYXRoRG9sbGFycyA9XG4gIGlubGluZU9wZW46ICckJ1xuICBpbmxpbmVDbG9zZTogJyQnXG4gIGJsb2NrT3BlbjogJyQkJ1xuICBibG9ja0Nsb3NlOiAnJCQnXG4gIGlubGluZVJlbmRlcmVyOiBtYXRoSW5saW5lXG4gIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9ja1xuXG5tYXRoQnJhY2tldHMgPVxuICBpbmxpbmVPcGVuOiAnXFxcXCgnXG4gIGlubGluZUNsb3NlOiAnXFxcXCknXG4gIGJsb2NrT3BlbjogJ1xcXFxbJ1xuICBibG9ja0Nsb3NlOiAnXFxcXF0nXG4gIGlubGluZVJlbmRlcmVyOiBtYXRoSW5saW5lXG4gIGJsb2NrUmVuZGVyZXI6IG1hdGhCbG9ja1xuXG5nZXRPcHRpb25zID0gLT5cbiAgaHRtbDogdHJ1ZVxuICB4aHRtbE91dDogZmFsc2VcbiAgYnJlYWtzOiBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy5icmVha09uU2luZ2xlTmV3bGluZScpXG4gIGxhbmdQcmVmaXg6ICdsYW5nLSdcbiAgbGlua2lmeTogdHJ1ZVxuICB0eXBvZ3JhcGhlcjogdHJ1ZVxuXG5cbmluaXQgPSAockwpIC0+XG5cbiAgcmVuZGVyTGFUZVggPSByTFxuXG4gIG1hcmtkb3duSXRPcHRpb25zID0gZ2V0T3B0aW9ucygpXG5cbiAgbWFya2Rvd25JdCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykobWFya2Rvd25JdE9wdGlvbnMpXG5cbiAgaWYgcmVuZGVyTGFUZVhcbiAgICBtYXRoID89IHJlcXVpcmUoJ21hcmtkb3duLWl0LW1hdGgnKVxuICAgIG1hcmtkb3duSXQudXNlIG1hdGgsIG1hdGhEb2xsYXJzXG4gICAgbWFya2Rvd25JdC51c2UgbWF0aCwgbWF0aEJyYWNrZXRzXG5cbiAgbGF6eUhlYWRlcnMgPSBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VMYXp5SGVhZGVycycpXG5cbiAgaWYgbGF6eUhlYWRlcnNcbiAgICBtYXJrZG93bkl0LnVzZSByZXF1aXJlKCdtYXJrZG93bi1pdC1sYXp5LWhlYWRlcnMnKVxuXG5cbm5lZWRzSW5pdCA9IChyTCkgLT5cbiAgbm90IG1hcmtkb3duSXQ/IG9yXG4gIG1hcmtkb3duSXRPcHRpb25zLmJyZWFrcyBpc250IGF0b20uY29uZmlnLmdldCgnbWFya2Rvd24tcHJldmlldy1wbHVzLmJyZWFrT25TaW5nbGVOZXdsaW5lJykgb3JcbiAgbGF6eUhlYWRlcnMgaXNudCBhdG9tLmNvbmZpZy5nZXQoJ21hcmtkb3duLXByZXZpZXctcGx1cy51c2VMYXp5SGVhZGVycycpIG9yXG4gIHJMIGlzbnQgcmVuZGVyTGFUZVhcblxuZXhwb3J0cy5yZW5kZXIgPSAodGV4dCwgckwpIC0+XG4gIGluaXQockwpIGlmIG5lZWRzSW5pdChyTClcbiAgbWFya2Rvd25JdC5yZW5kZXIgdGV4dFxuXG5leHBvcnRzLmRlY29kZSA9ICh1cmwpIC0+XG4gIG1hcmtkb3duSXQubm9ybWFsaXplTGlua1RleHQgdXJsXG5cbmV4cG9ydHMuZ2V0VG9rZW5zID0gKHRleHQsIHJMKSAtPlxuICBpbml0KHJMKSBpZiBuZWVkc0luaXQockwpXG4gIG1hcmtkb3duSXQucGFyc2UgdGV4dCwge31cbiJdfQ==
