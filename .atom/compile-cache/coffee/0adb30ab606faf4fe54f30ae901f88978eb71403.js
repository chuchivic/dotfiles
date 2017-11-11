(function() {
  var scopesByFenceName;

  scopesByFenceName = {
    'sh': 'source.shell',
    'bash': 'source.shell',
    'c': 'source.c',
    'c++': 'source.cpp',
    'cpp': 'source.cpp',
    'coffee': 'source.coffee',
    'coffeescript': 'source.coffee',
    'coffee-script': 'source.coffee',
    'cs': 'source.cs',
    'csharp': 'source.cs',
    'css': 'source.css',
    'scss': 'source.css.scss',
    'sass': 'source.sass',
    'erlang': 'source.erl',
    'go': 'source.go',
    'html': 'text.html.basic',
    'java': 'source.java',
    'js': 'source.js',
    'javascript': 'source.js',
    'json': 'source.json',
    'less': 'source.less',
    'mustache': 'text.html.mustache',
    'objc': 'source.objc',
    'objective-c': 'source.objc',
    'php': 'text.html.php',
    'py': 'source.python',
    'python': 'source.python',
    'rb': 'source.ruby',
    'ruby': 'source.ruby',
    'text': 'text.plain',
    'toml': 'source.toml',
    'xml': 'text.xml',
    'yaml': 'source.yaml',
    'yml': 'source.yaml'
  };

  module.exports = {
    scopeForFenceName: function(fenceName) {
      var ref;
      return (ref = scopesByFenceName[fenceName]) != null ? ref : "source." + fenceName;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9leHRlbnNpb24taGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsaUJBQUEsR0FDRTtJQUFBLElBQUEsRUFBTSxjQUFOO0lBQ0EsTUFBQSxFQUFRLGNBRFI7SUFFQSxHQUFBLEVBQUssVUFGTDtJQUdBLEtBQUEsRUFBTyxZQUhQO0lBSUEsS0FBQSxFQUFPLFlBSlA7SUFLQSxRQUFBLEVBQVUsZUFMVjtJQU1BLGNBQUEsRUFBZ0IsZUFOaEI7SUFPQSxlQUFBLEVBQWlCLGVBUGpCO0lBUUEsSUFBQSxFQUFNLFdBUk47SUFTQSxRQUFBLEVBQVUsV0FUVjtJQVVBLEtBQUEsRUFBTyxZQVZQO0lBV0EsTUFBQSxFQUFRLGlCQVhSO0lBWUEsTUFBQSxFQUFRLGFBWlI7SUFhQSxRQUFBLEVBQVUsWUFiVjtJQWNBLElBQUEsRUFBTSxXQWROO0lBZUEsTUFBQSxFQUFRLGlCQWZSO0lBZ0JBLE1BQUEsRUFBUSxhQWhCUjtJQWlCQSxJQUFBLEVBQU0sV0FqQk47SUFrQkEsWUFBQSxFQUFjLFdBbEJkO0lBbUJBLE1BQUEsRUFBUSxhQW5CUjtJQW9CQSxNQUFBLEVBQVEsYUFwQlI7SUFxQkEsVUFBQSxFQUFZLG9CQXJCWjtJQXNCQSxNQUFBLEVBQVEsYUF0QlI7SUF1QkEsYUFBQSxFQUFlLGFBdkJmO0lBd0JBLEtBQUEsRUFBTyxlQXhCUDtJQXlCQSxJQUFBLEVBQU0sZUF6Qk47SUEwQkEsUUFBQSxFQUFVLGVBMUJWO0lBMkJBLElBQUEsRUFBTSxhQTNCTjtJQTRCQSxNQUFBLEVBQVEsYUE1QlI7SUE2QkEsTUFBQSxFQUFRLFlBN0JSO0lBOEJBLE1BQUEsRUFBUSxhQTlCUjtJQStCQSxLQUFBLEVBQU8sVUEvQlA7SUFnQ0EsTUFBQSxFQUFRLGFBaENSO0lBaUNBLEtBQUEsRUFBTyxhQWpDUDs7O0VBbUNGLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxpQkFBQSxFQUFtQixTQUFDLFNBQUQ7QUFDakIsVUFBQTtrRUFBK0IsU0FBQSxHQUFVO0lBRHhCLENBQW5COztBQXJDRiIsInNvdXJjZXNDb250ZW50IjpbInNjb3Blc0J5RmVuY2VOYW1lID1cbiAgJ3NoJzogJ3NvdXJjZS5zaGVsbCdcbiAgJ2Jhc2gnOiAnc291cmNlLnNoZWxsJ1xuICAnYyc6ICdzb3VyY2UuYydcbiAgJ2MrKyc6ICdzb3VyY2UuY3BwJ1xuICAnY3BwJzogJ3NvdXJjZS5jcHAnXG4gICdjb2ZmZWUnOiAnc291cmNlLmNvZmZlZSdcbiAgJ2NvZmZlZXNjcmlwdCc6ICdzb3VyY2UuY29mZmVlJ1xuICAnY29mZmVlLXNjcmlwdCc6ICdzb3VyY2UuY29mZmVlJ1xuICAnY3MnOiAnc291cmNlLmNzJ1xuICAnY3NoYXJwJzogJ3NvdXJjZS5jcydcbiAgJ2Nzcyc6ICdzb3VyY2UuY3NzJ1xuICAnc2Nzcyc6ICdzb3VyY2UuY3NzLnNjc3MnXG4gICdzYXNzJzogJ3NvdXJjZS5zYXNzJ1xuICAnZXJsYW5nJzogJ3NvdXJjZS5lcmwnXG4gICdnbyc6ICdzb3VyY2UuZ28nXG4gICdodG1sJzogJ3RleHQuaHRtbC5iYXNpYydcbiAgJ2phdmEnOiAnc291cmNlLmphdmEnXG4gICdqcyc6ICdzb3VyY2UuanMnXG4gICdqYXZhc2NyaXB0JzogJ3NvdXJjZS5qcydcbiAgJ2pzb24nOiAnc291cmNlLmpzb24nXG4gICdsZXNzJzogJ3NvdXJjZS5sZXNzJ1xuICAnbXVzdGFjaGUnOiAndGV4dC5odG1sLm11c3RhY2hlJ1xuICAnb2JqYyc6ICdzb3VyY2Uub2JqYydcbiAgJ29iamVjdGl2ZS1jJzogJ3NvdXJjZS5vYmpjJ1xuICAncGhwJzogJ3RleHQuaHRtbC5waHAnXG4gICdweSc6ICdzb3VyY2UucHl0aG9uJ1xuICAncHl0aG9uJzogJ3NvdXJjZS5weXRob24nXG4gICdyYic6ICdzb3VyY2UucnVieSdcbiAgJ3J1YnknOiAnc291cmNlLnJ1YnknXG4gICd0ZXh0JzogJ3RleHQucGxhaW4nXG4gICd0b21sJzogJ3NvdXJjZS50b21sJ1xuICAneG1sJzogJ3RleHQueG1sJ1xuICAneWFtbCc6ICdzb3VyY2UueWFtbCdcbiAgJ3ltbCc6ICdzb3VyY2UueWFtbCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBzY29wZUZvckZlbmNlTmFtZTogKGZlbmNlTmFtZSkgLT5cbiAgICBzY29wZXNCeUZlbmNlTmFtZVtmZW5jZU5hbWVdID8gXCJzb3VyY2UuI3tmZW5jZU5hbWV9XCJcbiJdfQ==
