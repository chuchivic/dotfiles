(function() {
  var cheerio, compareHTML, markdownIt, renderMath;

  markdownIt = require('../lib/markdown-it-helper');

  cheerio = require('cheerio');

  require('./spec-helper');

  renderMath = false;

  compareHTML = function(one, two) {
    one = markdownIt.render(one, renderMath);
    one = one.replace(/\n\s*/g, '');
    two = two.replace(/\n\s*/g, '');
    return expect(one).toEqual(two);
  };

  describe("MarkdownItHelper (Math)", function() {
    var content;
    content = [][0];
    beforeEach(function() {
      content = null;
      return renderMath = true;
    });
    it("Math in markdown inlines", function() {
      var result;
      content = "# Math $x^2$ in heading 1\n\n_math $x^2$ in emphasis_\n\n**math $x^2$ in bold**\n\n[math $x^2$ in link](http://www.mathjax.org/)\n\n`math $x^2$ in code`\n\n~~math $x^2$ in strikethrough~~";
      result = "<h1>Math <span class='math'><script type='math/tex'>x^2</script></span> in heading 1</h1>\n<p><em>math <span class='math'><script type='math/tex'>x^2</script></span> in emphasis</em></p>\n<p><strong>math <span class='math'><script type='math/tex'>x^2</script></span> in bold</strong></p>\n<p><a href=\"http://www.mathjax.org/\">math <span class='math'><script type='math/tex'>x^2</script></span> in link</a></p>\n<p><code>math $x^2$ in code</code></p>\n<p><s>math <span class='math'><script type='math/tex'>x^2</script></span> in strikethrough</s></p>";
      return compareHTML(content, result);
    });
    describe("Interference with markdown syntax (from issue-18)", function() {
      it("should not interfere with *", function() {
        return runs(function() {
          var result;
          content = "This $(f*g*h)(x)$ is no conflict";
          result = "<p>This <span class='math'><script type='math/tex'>(f*g*h)(x)</script></span> is no conflict</p>";
          return compareHTML(content, result);
        });
      });
      it("should not interfere with _", function() {
        return runs(function() {
          var result;
          content = "This $x_1, x_2, \\dots, x_N$ is no conflict";
          result = "<p>This <span class='math'><script type='math/tex'>x_1, x_2, \\dots, x_N</script></span> is no conflict</p>";
          return compareHTML(content, result);
        });
      });
      return it("should not interfere with link syntax", function() {
        return runs(function() {
          var result;
          content = "This $[a+b](c+d)$ is no conflict";
          result = "<p>This <span class='math'><script type='math/tex'>[a+b](c+d)</script></span> is no conflict</p>";
          return compareHTML(content, result);
        });
      });
    });
    describe("Examples from stresstest document (issue-18)", function() {
      it("several tex functions", function() {
        return runs(function() {
          var result;
          content = "$k \\times k$, $n \\times 2$, $2 \\times n$, $\\times$\n\n$x \\cdot y$, $\\cdot$\n\n$\\sqrt{x^2+y^2+z^2}$\n\n$\\alpha \\beta \\gamma$\n\n$$\n\\begin{aligned}\nx\\ &= y\\\\\nmc^2\\ &= E\n\\end{aligned}\n$$";
          result = "<p><span class='math'><script type='math/tex'>k \\times k</script></span>, <span class='math'><script type='math/tex'>n \\times 2</script></span>, <span class='math'><script type='math/tex'>2 \\times n</script></span>, <span class='math'><script type='math/tex'>\\times</script></span></p>\n<p><span class='math'><script type='math/tex'>x \\cdot y</script></span>, <span class='math'><script type='math/tex'>\\cdot</script></span></p>\n<p><span class='math'><script type='math/tex'>\\sqrt{x^2+y^2+z^2}</script></span></p>\n<p><span class='math'><script type='math/tex'>\\alpha \\beta \\gamma</script></span></p>\n<span class='math'><script type='math/tex; mode=display'>\\begin{aligned}\nx\\ &= y\\\\\nmc^2\\ &= E\n\\end{aligned}\n</script></span>";
          return compareHTML(content, result);
        });
      });
      describe("Escaped Math environments", function() {
        xit("Empty lines after $$", function() {
          return runs(function() {
            var result;
            content = "$$\n\nshould be escaped\n\n$$";
            result = "<p>$$</p><p>should be escaped</p><p>$$</p>";
            return compareHTML(content, result);
          });
        });
        it("Inline Math without proper opening and closing", function() {
          return runs(function() {
            var result;
            content = "a $5, a $10 and a \\$100 Bill.";
            result = '<p>a $5, a $10 and a $100 Bill.</p>';
            return compareHTML(content, result);
          });
        });
        it("Double escaped \\[ and \\(", function() {
          return runs(function() {
            var result;
            content = "\n\\\\[\n  x+y\n\\]\n\n\\\\(x+y\\)";
            result = "<p>\\[x+y]</p><p>\\(x+y)</p>";
            return compareHTML(content, result);
          });
        });
        return it("In inline code examples", function() {
          return runs(function() {
            var result;
            content = "`\\$`, `\\[ \\]`, `$x$`";
            result = "<p><code>\\$</code>, <code>\\[ \\]</code>, <code>$x$</code></p>";
            return compareHTML(content, result);
          });
        });
      });
      return describe("Math Blocks", function() {
        it("$$ should work multiline", function() {
          return runs(function() {
            var result;
            content = "$$\na+b\n$$";
            result = "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>";
            return compareHTML(content, result);
          });
        });
        it("$$ should work singeline", function() {
          return runs(function() {
            var result;
            content = "$$a+b$$";
            result = "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>";
            return compareHTML(content, result);
          });
        });
        it("$$ should work directly after paragraph", function() {
          return runs(function() {
            var result;
            content = "Test\n$$\na+b\n$$";
            result = "<p>Test</p><span class='math'><script type='math/tex; mode=display'>a+b</script></span>";
            return compareHTML(content, result);
          });
        });
        it("\\[ should work multiline", function() {
          return runs(function() {
            var result;
            content = "\\[\na+b\n\\]";
            result = "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>";
            return compareHTML(content, result);
          });
        });
        it("\\[ should work singeline", function() {
          return runs(function() {
            var result;
            content = "\\[a+b\\]";
            result = "<span class='math'><script type='math/tex; mode=display'>a+b</script></span>";
            return compareHTML(content, result);
          });
        });
        return it("\\[ should work directly after paragraph", function() {
          return runs(function() {
            var result;
            content = "Test\n\\[\na+b\n\\]";
            result = "<p>Test</p><span class='math'><script type='math/tex; mode=display'>a+b</script></span>";
            return compareHTML(content, result);
          });
        });
      });
    });
    return describe("Examples from issues", function() {
      it("should respect escaped dollar inside code (issue-3)", function() {
        return runs(function() {
          var result;
          content = "```\n\\$\n```";
          result = '<pre><code>\\$</code></pre>';
          return compareHTML(content, result);
        });
      });
      it("should respect escaped dollar inside code (mp-issue-116)", function() {
        return runs(function() {
          var result;
          content = "start\n\n```\n$fgf\n```\n\n\\$ asd\n$x$";
          result = "<p>start</p>\n<pre><code>$fgf</code></pre>\n<p>\n  $ asd\n  <span class='math'>\n    <script type='math/tex'>x</script>\n  </span>\n</p>";
          return compareHTML(content, result);
        });
      });
      it("should render inline math with \\( (issue-7)", function() {
        return runs(function() {
          var result;
          content = "This should \\(x+y\\) work.";
          result = "<p>\n This should <span class='math'>\n   <script type='math/tex'>x+y</script>\n </span> work.\n</p>";
          return compareHTML(content, result);
        });
      });
      it("should render inline math with N\\times N (issue-17)", function() {
        return runs(function() {
          var result;
          content = "An $N\\times N$ grid.";
          result = "<p>\n An <span class='math'>\n   <script type='math/tex'>N\\times N</script>\n </span> grid.\n</p>";
          return compareHTML(content, result);
        });
      });
      return it("should respect inline code (issue-20)", function() {
        return runs(function() {
          var result;
          content = "This is broken `$$`\n\n$$\na+b\n$$";
          result = "<p>This is broken <code>$$</code></p>\n<span class='math'>\n <script type='math/tex; mode=display'>\n   a+b\n </script>\n</span>";
          return compareHTML(content, result);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24tcHJldmlldy1yZW5kZXJlci1tYXRoLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLDJCQUFSOztFQUNiLE9BQUEsR0FBVSxPQUFBLENBQVEsU0FBUjs7RUFFVixPQUFBLENBQVEsZUFBUjs7RUFFQSxVQUFBLEdBQWE7O0VBRWIsV0FBQSxHQUFjLFNBQUMsR0FBRCxFQUFNLEdBQU47SUFFWixHQUFBLEdBQU0sVUFBVSxDQUFDLE1BQVgsQ0FBa0IsR0FBbEIsRUFBdUIsVUFBdkI7SUFFTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxRQUFaLEVBQXNCLEVBQXRCO0lBRU4sR0FBQSxHQUFNLEdBQUcsQ0FBQyxPQUFKLENBQVksUUFBWixFQUFzQixFQUF0QjtXQUVOLE1BQUEsQ0FBTyxHQUFQLENBQVcsQ0FBQyxPQUFaLENBQW9CLEdBQXBCO0VBUlk7O0VBVWQsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUE7QUFDbEMsUUFBQTtJQUFDLFVBQVc7SUFFWixVQUFBLENBQVcsU0FBQTtNQUNULE9BQUEsR0FBVTthQUNWLFVBQUEsR0FBYTtJQUZKLENBQVg7SUFJQSxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQTtBQUU3QixVQUFBO01BQUEsT0FBQSxHQUFVO01BY1YsTUFBQSxHQUFVO2FBU1YsV0FBQSxDQUFZLE9BQVosRUFBcUIsTUFBckI7SUF6QjZCLENBQS9CO0lBMkJBLFFBQUEsQ0FBUyxtREFBVCxFQUE4RCxTQUFBO01BRTVELEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBO2VBQ2hDLElBQUEsQ0FBSyxTQUFBO0FBRUgsY0FBQTtVQUFBLE9BQUEsR0FBVTtVQUVWLE1BQUEsR0FBUztpQkFFVCxX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LEdBQVU7VUFFVixNQUFBLEdBQVM7aUJBUVQsV0FBQSxDQUFZLE9BQVosRUFBcUIsTUFBckI7UUFaRyxDQUFMO01BRHlELENBQTNEO2FBZUEsRUFBQSxDQUFHLHVDQUFILEVBQTRDLFNBQUE7ZUFDMUMsSUFBQSxDQUFLLFNBQUE7QUFFSCxjQUFBO1VBQUEsT0FBQSxHQUFVO1VBUVYsTUFBQSxHQUFTO2lCQVNULFdBQUEsQ0FBWSxPQUFaLEVBQXFCLE1BQXJCO1FBbkJHLENBQUw7TUFEMEMsQ0FBNUM7SUF4RStCLENBQWpDO0VBbk9rQyxDQUFwQztBQWpCQSIsInNvdXJjZXNDb250ZW50IjpbIm1hcmtkb3duSXQgPSByZXF1aXJlICcuLi9saWIvbWFya2Rvd24taXQtaGVscGVyJ1xuY2hlZXJpbyA9IHJlcXVpcmUgJ2NoZWVyaW8nXG5cbnJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5cbnJlbmRlck1hdGggPSBmYWxzZVxuXG5jb21wYXJlSFRNTCA9IChvbmUsIHR3bykgLT5cblxuICBvbmUgPSBtYXJrZG93bkl0LnJlbmRlcihvbmUsIHJlbmRlck1hdGgpXG5cbiAgb25lID0gb25lLnJlcGxhY2UoL1xcblxccyovZywgJycpXG5cbiAgdHdvID0gdHdvLnJlcGxhY2UoL1xcblxccyovZywgJycpXG5cbiAgZXhwZWN0KG9uZSkudG9FcXVhbCh0d28pXG5cbmRlc2NyaWJlIFwiTWFya2Rvd25JdEhlbHBlciAoTWF0aClcIiwgLT5cbiAgW2NvbnRlbnRdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgY29udGVudCA9IG51bGxcbiAgICByZW5kZXJNYXRoID0gdHJ1ZVxuXG4gIGl0IFwiTWF0aCBpbiBtYXJrZG93biBpbmxpbmVzXCIsIC0+XG5cbiAgICBjb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICAgICMgTWF0aCAkeF4yJCBpbiBoZWFkaW5nIDFcblxuICAgICAgICAgICAgICBfbWF0aCAkeF4yJCBpbiBlbXBoYXNpc19cblxuICAgICAgICAgICAgICAqKm1hdGggJHheMiQgaW4gYm9sZCoqXG5cbiAgICAgICAgICAgICAgW21hdGggJHheMiQgaW4gbGlua10oaHR0cDovL3d3dy5tYXRoamF4Lm9yZy8pXG5cbiAgICAgICAgICAgICAgYG1hdGggJHheMiQgaW4gY29kZWBcblxuICAgICAgICAgICAgICB+fm1hdGggJHheMiQgaW4gc3RyaWtldGhyb3VnaH5+XG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgcmVzdWx0ID0gIFwiXCJcIlxuICAgICAgICAgICAgICA8aDE+TWF0aCA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+eF4yPC9zY3JpcHQ+PC9zcGFuPiBpbiBoZWFkaW5nIDE8L2gxPlxuICAgICAgICAgICAgICA8cD48ZW0+bWF0aCA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+eF4yPC9zY3JpcHQ+PC9zcGFuPiBpbiBlbXBoYXNpczwvZW0+PC9wPlxuICAgICAgICAgICAgICA8cD48c3Ryb25nPm1hdGggPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPnheMjwvc2NyaXB0Pjwvc3Bhbj4gaW4gYm9sZDwvc3Ryb25nPjwvcD5cbiAgICAgICAgICAgICAgPHA+PGEgaHJlZj1cImh0dHA6Ly93d3cubWF0aGpheC5vcmcvXCI+bWF0aCA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+eF4yPC9zY3JpcHQ+PC9zcGFuPiBpbiBsaW5rPC9hPjwvcD5cbiAgICAgICAgICAgICAgPHA+PGNvZGU+bWF0aCAkeF4yJCBpbiBjb2RlPC9jb2RlPjwvcD5cbiAgICAgICAgICAgICAgPHA+PHM+bWF0aCA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+eF4yPC9zY3JpcHQ+PC9zcGFuPiBpbiBzdHJpa2V0aHJvdWdoPC9zPjwvcD5cbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cbiAgZGVzY3JpYmUgXCJJbnRlcmZlcmVuY2Ugd2l0aCBtYXJrZG93biBzeW50YXggKGZyb20gaXNzdWUtMTgpXCIsIC0+XG5cbiAgICBpdCBcInNob3VsZCBub3QgaW50ZXJmZXJlIHdpdGggKlwiLCAtPlxuICAgICAgcnVucyAtPlxuXG4gICAgICAgIGNvbnRlbnQgPSBcIlRoaXMgJChmKmcqaCkoeCkkIGlzIG5vIGNvbmZsaWN0XCJcblxuICAgICAgICByZXN1bHQgPSBcIjxwPlRoaXMgPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPihmKmcqaCkoeCk8L3NjcmlwdD48L3NwYW4+IGlzIG5vIGNvbmZsaWN0PC9wPlwiXG5cbiAgICAgICAgY29tcGFyZUhUTUwoY29udGVudCwgcmVzdWx0KVxuXG4gICAgaXQgXCJzaG91bGQgbm90IGludGVyZmVyZSB3aXRoIF9cIiwgLT5cbiAgICAgIHJ1bnMgLT5cblxuICAgICAgICBjb250ZW50ID0gXCJUaGlzICR4XzEsIHhfMiwgXFxcXGRvdHMsIHhfTiQgaXMgbm8gY29uZmxpY3RcIlxuXG4gICAgICAgIHJlc3VsdCA9IFwiPHA+VGhpcyA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+eF8xLCB4XzIsIFxcXFxkb3RzLCB4X048L3NjcmlwdD48L3NwYW4+IGlzIG5vIGNvbmZsaWN0PC9wPlwiXG5cbiAgICAgICAgY29tcGFyZUhUTUwoY29udGVudCwgcmVzdWx0KVxuXG4gICAgaXQgXCJzaG91bGQgbm90IGludGVyZmVyZSB3aXRoIGxpbmsgc3ludGF4XCIsIC0+XG4gICAgICBydW5zIC0+XG5cbiAgICAgICAgY29udGVudCA9IFwiVGhpcyAkW2ErYl0oYytkKSQgaXMgbm8gY29uZmxpY3RcIlxuXG4gICAgICAgIHJlc3VsdCA9IFwiPHA+VGhpcyA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+W2ErYl0oYytkKTwvc2NyaXB0Pjwvc3Bhbj4gaXMgbm8gY29uZmxpY3Q8L3A+XCJcblxuICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cblxuICBkZXNjcmliZSBcIkV4YW1wbGVzIGZyb20gc3RyZXNzdGVzdCBkb2N1bWVudCAoaXNzdWUtMTgpXCIsIC0+XG5cbiAgICBpdCBcInNldmVyYWwgdGV4IGZ1bmN0aW9uc1wiLCAtPlxuICAgICAgcnVucyAtPlxuXG4gICAgICAgIGNvbnRlbnQgPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICRrIFxcXFx0aW1lcyBrJCwgJG4gXFxcXHRpbWVzIDIkLCAkMiBcXFxcdGltZXMgbiQsICRcXFxcdGltZXMkXG5cbiAgICAgICAgICAgICAgICAgICR4IFxcXFxjZG90IHkkLCAkXFxcXGNkb3QkXG5cbiAgICAgICAgICAgICAgICAgICRcXFxcc3FydHt4XjIreV4yK3peMn0kXG5cbiAgICAgICAgICAgICAgICAgICRcXFxcYWxwaGEgXFxcXGJldGEgXFxcXGdhbW1hJFxuXG4gICAgICAgICAgICAgICAgICAkJFxuICAgICAgICAgICAgICAgICAgXFxcXGJlZ2lue2FsaWduZWR9XG4gICAgICAgICAgICAgICAgICB4XFxcXCAmPSB5XFxcXFxcXFxcbiAgICAgICAgICAgICAgICAgIG1jXjJcXFxcICY9IEVcbiAgICAgICAgICAgICAgICAgIFxcXFxlbmR7YWxpZ25lZH1cbiAgICAgICAgICAgICAgICAgICQkXG4gICAgICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICByZXN1bHQgPSAgXCJcIlwiXG4gICAgICAgICAgICAgICAgICA8cD48c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+ayBcXFxcdGltZXMgazwvc2NyaXB0Pjwvc3Bhbj4sIDxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz5uIFxcXFx0aW1lcyAyPC9zY3JpcHQ+PC9zcGFuPiwgPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPjIgXFxcXHRpbWVzIG48L3NjcmlwdD48L3NwYW4+LCA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+XFxcXHRpbWVzPC9zY3JpcHQ+PC9zcGFuPjwvcD5cbiAgICAgICAgICAgICAgICAgIDxwPjxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4Jz54IFxcXFxjZG90IHk8L3NjcmlwdD48L3NwYW4+LCA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+XFxcXGNkb3Q8L3NjcmlwdD48L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgICAgPHA+PHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPlxcXFxzcXJ0e3heMit5XjIrel4yfTwvc2NyaXB0Pjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICA8cD48c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+XFxcXGFscGhhIFxcXFxiZXRhIFxcXFxnYW1tYTwvc2NyaXB0Pjwvc3Bhbj48L3A+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz5cXFxcYmVnaW57YWxpZ25lZH1cbiAgICAgICAgICAgICAgICAgIHhcXFxcICY9IHlcXFxcXFxcXFxuICAgICAgICAgICAgICAgICAgbWNeMlxcXFwgJj0gRVxuICAgICAgICAgICAgICAgICAgXFxcXGVuZHthbGlnbmVkfVxuICAgICAgICAgICAgICAgICAgPC9zY3JpcHQ+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY29tcGFyZUhUTUwoY29udGVudCwgcmVzdWx0KVxuXG4gICAgZGVzY3JpYmUgXCJFc2NhcGVkIE1hdGggZW52aXJvbm1lbnRzXCIsIC0+XG5cbiAgICAgICMgRGlzYWJsZWQgYXMgbWFya2Rvd24taXQtbWF0aCBkb2VzIG5vdCBzdXBwb3J0IGl0XG4gICAgICB4aXQgXCJFbXB0eSBsaW5lcyBhZnRlciAkJFwiLCAtPlxuICAgICAgICBydW5zIC0+XG5cbiAgICAgICAgICBjb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgICQkXG5cbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkIGJlIGVzY2FwZWRcblxuICAgICAgICAgICAgICAgICAgICAkJFxuICAgICAgICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIHJlc3VsdCA9IFwiPHA+JCQ8L3A+PHA+c2hvdWxkIGJlIGVzY2FwZWQ8L3A+PHA+JCQ8L3A+XCJcblxuICAgICAgICAgIGNvbXBhcmVIVE1MKGNvbnRlbnQsIHJlc3VsdClcblxuICAgICAgaXQgXCJJbmxpbmUgTWF0aCB3aXRob3V0IHByb3BlciBvcGVuaW5nIGFuZCBjbG9zaW5nXCIsIC0+XG4gICAgICAgIHJ1bnMgLT5cblxuICAgICAgICAgIGNvbnRlbnQgPSBcImEgJDUsIGEgJDEwIGFuZCBhIFxcXFwkMTAwIEJpbGwuXCJcblxuICAgICAgICAgIHJlc3VsdCA9ICc8cD5hICQ1LCBhICQxMCBhbmQgYSAkMTAwIEJpbGwuPC9wPidcblxuICAgICAgICAgIGNvbXBhcmVIVE1MKGNvbnRlbnQsIHJlc3VsdClcblxuICAgICAgaXQgXCJEb3VibGUgZXNjYXBlZCBcXFxcWyBhbmQgXFxcXChcIiwgLT5cbiAgICAgICAgcnVucyAtPlxuXG4gICAgICAgICAgY29udGVudCA9IFwiXCJcIlxuXG4gICAgICAgICAgICAgICAgICAgIFxcXFxcXFxcW1xuICAgICAgICAgICAgICAgICAgICAgIHgreVxuICAgICAgICAgICAgICAgICAgICBcXFxcXVxuXG4gICAgICAgICAgICAgICAgICAgIFxcXFxcXFxcKHgreVxcXFwpXG4gICAgICAgICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgcmVzdWx0ID0gXCI8cD5cXFxcW3greV08L3A+PHA+XFxcXCh4K3kpPC9wPlwiXG5cbiAgICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cbiAgICAgIGl0IFwiSW4gaW5saW5lIGNvZGUgZXhhbXBsZXNcIiwgLT5cbiAgICAgICAgcnVucyAtPlxuXG4gICAgICAgICAgY29udGVudCA9IFwiYFxcXFwkYCwgYFxcXFxbIFxcXFxdYCwgYCR4JGBcIlxuXG4gICAgICAgICAgcmVzdWx0ID0gXCI8cD48Y29kZT5cXFxcJDwvY29kZT4sIDxjb2RlPlxcXFxbIFxcXFxdPC9jb2RlPiwgPGNvZGU+JHgkPC9jb2RlPjwvcD5cIlxuXG4gICAgICAgICAgY29tcGFyZUhUTUwoY29udGVudCwgcmVzdWx0KVxuXG4gICAgZGVzY3JpYmUgXCJNYXRoIEJsb2Nrc1wiLCAtPlxuXG4gICAgICBpdCBcIiQkIHNob3VsZCB3b3JrIG11bHRpbGluZVwiLCAtPlxuICAgICAgICBydW5zIC0+XG5cbiAgICAgICAgICBjb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICAgICQkXG4gICAgICAgICAgICAgICAgICAgIGErYlxuICAgICAgICAgICAgICAgICAgICAkJFxuICAgICAgICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIHJlc3VsdCA9IFwiPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXg7IG1vZGU9ZGlzcGxheSc+YStiPC9zY3JpcHQ+PC9zcGFuPlwiXG5cbiAgICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cbiAgICAgIGl0IFwiJCQgc2hvdWxkIHdvcmsgc2luZ2VsaW5lXCIsIC0+XG4gICAgICAgIHJ1bnMgLT5cblxuICAgICAgICAgIGNvbnRlbnQgPSBcIiQkYStiJCRcIlxuXG4gICAgICAgICAgcmVzdWx0ID0gXCI8c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz5hK2I8L3NjcmlwdD48L3NwYW4+XCJcblxuICAgICAgICAgIGNvbXBhcmVIVE1MKGNvbnRlbnQsIHJlc3VsdClcblxuICAgICAgaXQgXCIkJCBzaG91bGQgd29yayBkaXJlY3RseSBhZnRlciBwYXJhZ3JhcGhcIiwgLT5cbiAgICAgICAgcnVucyAtPlxuXG4gICAgICAgICAgY29udGVudCA9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgICBUZXN0XG4gICAgICAgICAgICAgICAgICAgICQkXG4gICAgICAgICAgICAgICAgICAgIGErYlxuICAgICAgICAgICAgICAgICAgICAkJFxuICAgICAgICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIHJlc3VsdCA9IFwiPHA+VGVzdDwvcD48c3BhbiBjbGFzcz0nbWF0aCc+PHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz5hK2I8L3NjcmlwdD48L3NwYW4+XCJcblxuICAgICAgICAgIGNvbXBhcmVIVE1MKGNvbnRlbnQsIHJlc3VsdClcblxuICAgICAgaXQgXCJcXFxcWyBzaG91bGQgd29yayBtdWx0aWxpbmVcIiwgLT5cbiAgICAgICAgcnVucyAtPlxuXG4gICAgICAgICAgY29udGVudCA9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgICBcXFxcW1xuICAgICAgICAgICAgICAgICAgICBhK2JcbiAgICAgICAgICAgICAgICAgICAgXFxcXF1cbiAgICAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICByZXN1bHQgPSBcIjxzcGFuIGNsYXNzPSdtYXRoJz48c2NyaXB0IHR5cGU9J21hdGgvdGV4OyBtb2RlPWRpc3BsYXknPmErYjwvc2NyaXB0Pjwvc3Bhbj5cIlxuXG4gICAgICAgICAgY29tcGFyZUhUTUwoY29udGVudCwgcmVzdWx0KVxuXG4gICAgICBpdCBcIlxcXFxbIHNob3VsZCB3b3JrIHNpbmdlbGluZVwiLCAtPlxuICAgICAgICBydW5zIC0+XG5cbiAgICAgICAgICBjb250ZW50ID0gXCJcXFxcW2ErYlxcXFxdXCJcblxuICAgICAgICAgIHJlc3VsdCA9IFwiPHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXg7IG1vZGU9ZGlzcGxheSc+YStiPC9zY3JpcHQ+PC9zcGFuPlwiXG5cbiAgICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cbiAgICAgIGl0IFwiXFxcXFsgc2hvdWxkIHdvcmsgZGlyZWN0bHkgYWZ0ZXIgcGFyYWdyYXBoXCIsIC0+XG4gICAgICAgIHJ1bnMgLT5cblxuICAgICAgICAgIGNvbnRlbnQgPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgVGVzdFxuICAgICAgICAgICAgICAgICAgICBcXFxcW1xuICAgICAgICAgICAgICAgICAgICBhK2JcbiAgICAgICAgICAgICAgICAgICAgXFxcXF1cbiAgICAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICByZXN1bHQgPSBcIjxwPlRlc3Q8L3A+PHNwYW4gY2xhc3M9J21hdGgnPjxzY3JpcHQgdHlwZT0nbWF0aC90ZXg7IG1vZGU9ZGlzcGxheSc+YStiPC9zY3JpcHQ+PC9zcGFuPlwiXG5cbiAgICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cblxuICBkZXNjcmliZSBcIkV4YW1wbGVzIGZyb20gaXNzdWVzXCIsIC0+XG5cbiAgICBpdCBcInNob3VsZCByZXNwZWN0IGVzY2FwZWQgZG9sbGFyIGluc2lkZSBjb2RlIChpc3N1ZS0zKVwiLCAtPlxuICAgICAgcnVucyAtPlxuXG4gICAgICAgIGNvbnRlbnQgPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgICAgICAgXFxcXCRcbiAgICAgICAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgcmVzdWx0ID0gJzxwcmU+PGNvZGU+XFxcXCQ8L2NvZGU+PC9wcmU+J1xuXG4gICAgICAgIGNvbXBhcmVIVE1MKGNvbnRlbnQsIHJlc3VsdClcblxuICAgIGl0IFwic2hvdWxkIHJlc3BlY3QgZXNjYXBlZCBkb2xsYXIgaW5zaWRlIGNvZGUgKG1wLWlzc3VlLTExNilcIiwgLT5cbiAgICAgIHJ1bnMgLT5cblxuICAgICAgICBjb250ZW50ID0gXCJcIlwiXG4gICAgICAgICAgICAgICAgICBzdGFydFxuXG4gICAgICAgICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICAgICAgICRmZ2ZcbiAgICAgICAgICAgICAgICAgIGBgYFxuXG4gICAgICAgICAgICAgICAgICBcXFxcJCBhc2RcbiAgICAgICAgICAgICAgICAgICR4JFxuICAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgcmVzdWx0ID0gXCJcIlwiXG4gICAgICAgICAgICAgICAgIDxwPnN0YXJ0PC9wPlxuICAgICAgICAgICAgICAgICA8cHJlPjxjb2RlPiRmZ2Y8L2NvZGU+PC9wcmU+XG4gICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICQgYXNkXG4gICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9J21hdGgnPlxuICAgICAgICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+eDwvc2NyaXB0PlxuICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG5cbiAgICBpdCBcInNob3VsZCByZW5kZXIgaW5saW5lIG1hdGggd2l0aCBcXFxcKCAoaXNzdWUtNylcIiwgLT5cbiAgICAgIHJ1bnMgLT5cblxuICAgICAgICBjb250ZW50ID0gXCJUaGlzIHNob3VsZCBcXFxcKHgreVxcXFwpIHdvcmsuXCJcblxuICAgICAgICByZXN1bHQgPSBcIlwiXCJcbiAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICBUaGlzIHNob3VsZCA8c3BhbiBjbGFzcz0nbWF0aCc+XG4gICAgICAgICAgICAgICAgICAgIDxzY3JpcHQgdHlwZT0nbWF0aC90ZXgnPngreTwvc2NyaXB0PlxuICAgICAgICAgICAgICAgICAgPC9zcGFuPiB3b3JrLlxuICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGNvbXBhcmVIVE1MKGNvbnRlbnQsIHJlc3VsdClcblxuICAgIGl0IFwic2hvdWxkIHJlbmRlciBpbmxpbmUgbWF0aCB3aXRoIE5cXFxcdGltZXMgTiAoaXNzdWUtMTcpXCIsIC0+XG4gICAgICBydW5zIC0+XG5cbiAgICAgICAgY29udGVudCA9IFwiQW4gJE5cXFxcdGltZXMgTiQgZ3JpZC5cIlxuXG4gICAgICAgIHJlc3VsdCA9IFwiXCJcIlxuICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgIEFuIDxzcGFuIGNsYXNzPSdtYXRoJz5cbiAgICAgICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPSdtYXRoL3RleCc+TlxcXFx0aW1lcyBOPC9zY3JpcHQ+XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+IGdyaWQuXG4gICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgY29tcGFyZUhUTUwoY29udGVudCwgcmVzdWx0KVxuXG4gICAgaXQgXCJzaG91bGQgcmVzcGVjdCBpbmxpbmUgY29kZSAoaXNzdWUtMjApXCIsIC0+XG4gICAgICBydW5zIC0+XG5cbiAgICAgICAgY29udGVudCA9IFwiXCJcIlxuICAgICAgICAgICAgICAgICAgVGhpcyBpcyBicm9rZW4gYCQkYFxuXG4gICAgICAgICAgICAgICAgICAkJFxuICAgICAgICAgICAgICAgICAgYStiXG4gICAgICAgICAgICAgICAgICAkJFxuICAgICAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgcmVzdWx0ID0gXCJcIlwiXG4gICAgICAgICAgICAgICAgIDxwPlRoaXMgaXMgYnJva2VuIDxjb2RlPiQkPC9jb2RlPjwvcD5cbiAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9J21hdGgnPlxuICAgICAgICAgICAgICAgICAgPHNjcmlwdCB0eXBlPSdtYXRoL3RleDsgbW9kZT1kaXNwbGF5Jz5cbiAgICAgICAgICAgICAgICAgICAgYStiXG4gICAgICAgICAgICAgICAgICA8L3NjcmlwdD5cbiAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBjb21wYXJlSFRNTChjb250ZW50LCByZXN1bHQpXG4iXX0=
