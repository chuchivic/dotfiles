(function() {
  var CompositeDisposable, Point, PythonTools, Range, path, ref, regexPatternIn,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  regexPatternIn = function(pattern, list) {
    var item, j, len;
    for (j = 0, len = list.length; j < len; j++) {
      item = list[j];
      if (pattern.test(item)) {
        return true;
      }
    }
    return false;
  };

  PythonTools = {
    config: {
      smartBlockSelection: {
        type: 'boolean',
        description: 'Do not select whitespace outside logical string blocks',
        "default": true
      },
      pythonPath: {
        type: 'string',
        "default": '',
        title: 'Path to python directory',
        description: ',\nOptional. Set it if default values are not working for you or you want to use specific\npython version. For example: `/usr/local/Cellar/python/2.7.3/bin` or `E:\\Python2.7`'
      }
    },
    subscriptions: null,
    _issueReportLink: "https://github.com/michaelaquilina/python-tools/issues/new",
    activate: function(state) {
      var env, j, len, p, path_env, paths, pythonPath;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:show-usages': (function(_this) {
          return function() {
            return _this.jediToolsRequest('usages');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:goto-definition': (function(_this) {
          return function() {
            return _this.jediToolsRequest('gotoDef');
          };
        })(this)
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor[data-grammar="source python"]', {
        'python-tools:select-all-string': (function(_this) {
          return function() {
            return _this.selectAllString();
          };
        })(this)
      }));
      env = process.env;
      pythonPath = atom.config.get('python-tools.pythonPath');
      path_env = null;
      if (/^win/.test(process.platform)) {
        paths = ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python34', 'C:\\Python3.5', 'C:\\Python35', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5'];
        path_env = env.Path || '';
      } else {
        paths = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
        path_env = env.PATH || '';
      }
      path_env = path_env.split(path.delimiter);
      path_env.unshift(pythonPath && indexOf.call(path_env, pythonPath) < 0 ? pythonPath : void 0);
      for (j = 0, len = paths.length; j < len; j++) {
        p = paths[j];
        if (indexOf.call(path_env, p) < 0) {
          path_env.push(p);
        }
      }
      env.PATH = path_env.join(path.delimiter);
      this.provider = require('child_process').spawn('python', [__dirname + '/tools.py'], {
        env: env
      });
      this.readline = require('readline').createInterface({
        input: this.provider.stdout,
        output: this.provider.stdin
      });
      this.provider.on('error', (function(_this) {
        return function(err) {
          if (err.code === 'ENOENT') {
            return atom.notifications.addWarning("python-tools was unable to find your machine's python executable.\n\nPlease try set the path in package settings and then restart atom.\n\nIf the issue persists please post an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          } else {
            return atom.notifications.addError("python-tools unexpected error.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: err,
              dismissable: true
            });
          }
        };
      })(this));
      return this.provider.on('exit', (function(_this) {
        return function(code, signal) {
          if (signal !== 'SIGTERM') {
            return atom.notifications.addError("python-tools experienced an unexpected exit.\n\nPlease consider posting an issue on\n" + _this._issueReportLink, {
              detail: "exit with code " + code + ", signal " + signal,
              dismissable: true
            });
          }
        };
      })(this));
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.provider.kill();
      return this.readline.close();
    },
    selectAllString: function() {
      var block, bufferPosition, delim_index, delimiter, editor, end, end_index, i, j, line, ref1, ref2, scopeDescriptor, scopes, selections, start, start_index, trimmed;
      editor = atom.workspace.getActiveTextEditor();
      bufferPosition = editor.getCursorBufferPosition();
      line = editor.lineTextForBufferRow(bufferPosition.row);
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
      scopes = scopeDescriptor.getScopesArray();
      block = false;
      if (regexPatternIn(/string.quoted.single.single-line.*/, scopes)) {
        delimiter = '\'';
      } else if (regexPatternIn(/string.quoted.double.single-line.*/, scopes)) {
        delimiter = '"';
      } else if (regexPatternIn(/string.quoted.double.block.*/, scopes)) {
        delimiter = '"""';
        block = true;
      } else if (regexPatternIn(/string.quoted.single.block.*/, scopes)) {
        delimiter = '\'\'\'';
        block = true;
      } else {
        return;
      }
      if (!block) {
        start = end = bufferPosition.column;
        while (line[start] !== delimiter) {
          start = start - 1;
          if (start < 0) {
            return;
          }
        }
        while (line[end] !== delimiter) {
          end = end + 1;
          if (end === line.length) {
            return;
          }
        }
        return editor.setSelectedBufferRange(new Range(new Point(bufferPosition.row, start + 1), new Point(bufferPosition.row, end)));
      } else {
        start = end = bufferPosition.row;
        start_index = end_index = -1;
        delim_index = line.indexOf(delimiter);
        if (delim_index !== -1) {
          scopes = editor.scopeDescriptorForBufferPosition(new Point(start, delim_index));
          scopes = scopes.getScopesArray();
          if (regexPatternIn(/punctuation.definition.string.begin.*/, scopes)) {
            start_index = line.indexOf(delimiter);
            while (end_index === -1) {
              end = end + 1;
              line = editor.lineTextForBufferRow(end);
              end_index = line.indexOf(delimiter);
            }
          } else if (regexPatternIn(/punctuation.definition.string.end.*/, scopes)) {
            end_index = line.indexOf(delimiter);
            while (start_index === -1) {
              start = start - 1;
              line = editor.lineTextForBufferRow(start);
              start_index = line.indexOf(delimiter);
            }
          }
        } else {
          while (end_index === -1) {
            end = end + 1;
            line = editor.lineTextForBufferRow(end);
            end_index = line.indexOf(delimiter);
          }
          while (start_index === -1) {
            start = start - 1;
            line = editor.lineTextForBufferRow(start);
            start_index = line.indexOf(delimiter);
          }
        }
        if (atom.config.get('python-tools.smartBlockSelection')) {
          selections = [new Range(new Point(start, start_index + delimiter.length), new Point(start, editor.lineTextForBufferRow(start).length))];
          for (i = j = ref1 = start + 1, ref2 = end; j < ref2; i = j += 1) {
            line = editor.lineTextForBufferRow(i);
            trimmed = line.replace(/^\s+/, "");
            selections.push(new Range(new Point(i, line.length - trimmed.length), new Point(i, line.length)));
          }
          line = editor.lineTextForBufferRow(end);
          trimmed = line.replace(/^\s+/, "");
          selections.push(new Range(new Point(end, line.length - trimmed.length), new Point(end, end_index)));
          return editor.setSelectedBufferRanges(selections.filter(function(range) {
            return !range.isEmpty();
          }));
        } else {
          return editor.setSelectedBufferRange(new Range(new Point(start, start_index + delimiter.length), new Point(end, end_index)));
        }
      }
    },
    handleJediToolsResponse: function(response) {
      var column, editor, first_def, item, j, len, line, options, ref1, selections;
      if ('error' in response) {
        console.error(response['error']);
        atom.notifications.addError(response['error']);
        return;
      }
      if (response['definitions'].length > 0) {
        editor = atom.workspace.getActiveTextEditor();
        if (response['type'] === 'usages') {
          path = editor.getPath();
          selections = [];
          ref1 = response['definitions'];
          for (j = 0, len = ref1.length; j < len; j++) {
            item = ref1[j];
            if (item['path'] === path) {
              selections.push(new Range(new Point(item['line'] - 1, item['col']), new Point(item['line'] - 1, item['col'] + item['name'].length)));
            }
          }
          return editor.setSelectedBufferRanges(selections);
        } else if (response['type'] === 'gotoDef') {
          first_def = response['definitions'][0];
          line = first_def['line'];
          column = first_def['col'];
          if (line !== null && column !== null) {
            options = {
              initialLine: line,
              initialColumn: column,
              searchAllPanes: true
            };
            return atom.workspace.open(first_def['path'], options).then(function(editor) {
              return editor.scrollToCursorPosition();
            });
          }
        } else {
          return atom.notifications.addError("python-tools error. " + this._issueReportLink, {
            detail: JSON.stringify(response),
            dismissable: true
          });
        }
      } else {
        return atom.notifications.addInfo("python-tools could not find any results!");
      }
    },
    jediToolsRequest: function(type) {
      var bufferPosition, editor, grammar, handleJediToolsResponse, payload, readline;
      editor = atom.workspace.getActiveTextEditor();
      grammar = editor.getGrammar();
      bufferPosition = editor.getCursorBufferPosition();
      payload = {
        type: type,
        path: editor.getPath(),
        source: editor.getText(),
        line: bufferPosition.row,
        col: bufferPosition.column,
        project_paths: atom.project.getPaths()
      };
      handleJediToolsResponse = this.handleJediToolsResponse;
      readline = this.readline;
      return new Promise(function(resolve, reject) {
        var response;
        return response = readline.question((JSON.stringify(payload)) + "\n", function(response) {
          handleJediToolsResponse(JSON.parse(response));
          return resolve();
        });
      });
    }
  };

  module.exports = PythonTools;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvcHl0aG9uLXRvb2xzL2xpYi9weXRob24tdG9vbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5RUFBQTtJQUFBOztFQUFBLE1BQXNDLE9BQUEsQ0FBUSxNQUFSLENBQXRDLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNmLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFHUCxjQUFBLEdBQWlCLFNBQUMsT0FBRCxFQUFVLElBQVY7QUFDZixRQUFBO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxJQUFHLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixDQUFIO0FBQ0UsZUFBTyxLQURUOztBQURGO0FBR0EsV0FBTztFQUpROztFQU9qQixXQUFBLEdBQWM7SUFDWixNQUFBLEVBQVE7TUFDTixtQkFBQSxFQUFxQjtRQUNuQixJQUFBLEVBQU0sU0FEYTtRQUVuQixXQUFBLEVBQWEsd0RBRk07UUFHbkIsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhVO09BRGY7TUFNTixVQUFBLEVBQVk7UUFDVixJQUFBLEVBQU0sUUFESTtRQUVWLENBQUEsT0FBQSxDQUFBLEVBQVMsRUFGQztRQUdWLEtBQUEsRUFBTywwQkFIRztRQUlWLFdBQUEsRUFBYSxpTEFKSDtPQU5OO0tBREk7SUFrQlosYUFBQSxFQUFlLElBbEJIO0lBb0JaLGdCQUFBLEVBQWtCLDREQXBCTjtJQXNCWixRQUFBLEVBQVUsU0FBQyxLQUFEO0FBRVIsVUFBQTtNQUFBLElBQUksQ0FBQyxhQUFMLEdBQXFCLElBQUk7TUFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUNFLGdEQURGLEVBRUU7UUFBQywwQkFBQSxFQUE0QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFNLEtBQUksQ0FBQyxnQkFBTCxD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QyxHQUpiO1FBS1IsR0FBQSxFQUFLLGNBQWMsQ0FBQyxNQUxaO1FBTVIsYUFBQSxFQUFlLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFBLENBTlA7O01BVVYsdUJBQUEsR0FBMEIsSUFBSSxDQUFDO01BQy9CLFFBQUEsR0FBVyxJQUFJLENBQUM7QUFFaEIsYUFBVyxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2pCLFlBQUE7ZUFBQSxRQUFBLEdBQVcsUUFBUSxDQUFDLFFBQVQsQ0FBb0IsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQWYsQ0FBRCxDQUFBLEdBQXlCLElBQTdDLEVBQWtELFNBQUMsUUFBRDtVQUMzRCx1QkFBQSxDQUF3QixJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsQ0FBeEI7aUJBQ0EsT0FBQSxDQUFBO1FBRjJELENBQWxEO01BRE0sQ0FBUjtJQW5CSyxDQTlSTjs7O0VBeVRkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBcFVqQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnQsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcblxuXG5yZWdleFBhdHRlcm5JbiA9IChwYXR0ZXJuLCBsaXN0KSAtPlxuICBmb3IgaXRlbSBpbiBsaXN0XG4gICAgaWYgcGF0dGVybi50ZXN0KGl0ZW0pXG4gICAgICByZXR1cm4gdHJ1ZVxuICByZXR1cm4gZmFsc2VcblxuXG5QeXRob25Ub29scyA9IHtcbiAgY29uZmlnOiB7XG4gICAgc21hcnRCbG9ja1NlbGVjdGlvbjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVzY3JpcHRpb246ICdEbyBub3Qgc2VsZWN0IHdoaXRlc3BhY2Ugb3V0c2lkZSBsb2dpY2FsIHN0cmluZyBibG9ja3MnLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgcHl0aG9uUGF0aDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnJyxcbiAgICAgIHRpdGxlOiAnUGF0aCB0byBweXRob24gZGlyZWN0b3J5JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJycsXG4gICAgICBPcHRpb25hbC4gU2V0IGl0IGlmIGRlZmF1bHQgdmFsdWVzIGFyZSBub3Qgd29ya2luZyBmb3IgeW91IG9yIHlvdSB3YW50IHRvIHVzZSBzcGVjaWZpY1xuICAgICAgcHl0aG9uIHZlcnNpb24uIEZvciBleGFtcGxlOiBgL3Vzci9sb2NhbC9DZWxsYXIvcHl0aG9uLzIuNy4zL2JpbmAgb3IgYEU6XFxcXFB5dGhvbjIuN2BcbiAgICAgICcnJ1xuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBfaXNzdWVSZXBvcnRMaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9taWNoYWVsYXF1aWxpbmEvcHl0aG9uLXRvb2xzL2lzc3Vlcy9uZXdcIlxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgIyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcbiAgICAgICAgeydweXRob24tdG9vbHM6c2hvdy11c2FnZXMnOiAoKSA9PiB0aGlzLmplZGlUb29sc1JlcXVlc3QoJ3VzYWdlcycpfVxuICAgICAgKVxuICAgIClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yW2RhdGEtZ3JhbW1hcj1cInNvdXJjZSBweXRob25cIl0nLFxuICAgICAgICB7J3B5dGhvbi10b29sczpnb3RvLWRlZmluaXRpb24nOiAoKSA9PiB0aGlzLmplZGlUb29sc1JlcXVlc3QoJ2dvdG9EZWYnKX1cbiAgICAgIClcbiAgICApXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvcltkYXRhLWdyYW1tYXI9XCJzb3VyY2UgcHl0aG9uXCJdJyxcbiAgICAgICAgeydweXRob24tdG9vbHM6c2VsZWN0LWFsbC1zdHJpbmcnOiAoKSA9PiB0aGlzLnNlbGVjdEFsbFN0cmluZygpfVxuICAgICAgKVxuICAgIClcblxuICAgIGVudiA9IHByb2Nlc3MuZW52XG4gICAgcHl0aG9uUGF0aCA9IGF0b20uY29uZmlnLmdldCgncHl0aG9uLXRvb2xzLnB5dGhvblBhdGgnKVxuICAgIHBhdGhfZW52ID0gbnVsbFxuXG4gICAgaWYgL153aW4vLnRlc3QocHJvY2Vzcy5wbGF0Zm9ybSlcbiAgICAgIHBhdGhzID0gW1xuICAgICAgICAnQzpcXFxcUHl0aG9uMi43JyxcbiAgICAgICAgJ0M6XFxcXFB5dGhvbjMuNCcsXG4gICAgICAgICdDOlxcXFxQeXRob24zNCcsXG4gICAgICAgICdDOlxcXFxQeXRob24zLjUnLFxuICAgICAgICAnQzpcXFxcUHl0aG9uMzUnLFxuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDg2KVxcXFxQeXRob24gMi43JyxcbiAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg4NilcXFxcUHl0aG9uIDMuNCcsXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAzLjUnLFxuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDY0KVxcXFxQeXRob24gMi43JyxcbiAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXMgKHg2NClcXFxcUHl0aG9uIDMuNCcsXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAzLjUnLFxuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQeXRob24gMi43JyxcbiAgICAgICAgJ0M6XFxcXFByb2dyYW0gRmlsZXNcXFxcUHl0aG9uIDMuNCcsXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAzLjUnXG4gICAgICBdXG4gICAgICBwYXRoX2VudiA9IChlbnYuUGF0aCBvciAnJylcbiAgICBlbHNlXG4gICAgICBwYXRocyA9IFsnL3Vzci9sb2NhbC9iaW4nLCAnL3Vzci9iaW4nLCAnL2JpbicsICcvdXNyL3NiaW4nLCAnL3NiaW4nXVxuICAgICAgcGF0aF9lbnYgPSAoZW52LlBBVEggb3IgJycpXG5cbiAgICBwYXRoX2VudiA9IHBhdGhfZW52LnNwbGl0KHBhdGguZGVsaW1pdGVyKVxuICAgIHBhdGhfZW52LnVuc2hpZnQocHl0aG9uUGF0aCBpZiBweXRob25QYXRoIGFuZCBweXRob25QYXRoIG5vdCBpbiBwYXRoX2VudilcbiAgICBmb3IgcCBpbiBwYXRoc1xuICAgICAgaWYgcCBub3QgaW4gcGF0aF9lbnZcbiAgICAgICAgcGF0aF9lbnYucHVzaChwKVxuICAgIGVudi5QQVRIID0gcGF0aF9lbnYuam9pbihwYXRoLmRlbGltaXRlcilcblxuICAgIHRoaXMucHJvdmlkZXIgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd24oXG4gICAgICAncHl0aG9uJywgW19fZGlybmFtZSArICcvdG9vbHMucHknXSwgZW52OiBlbnZcbiAgICApXG5cbiAgICB0aGlzLnJlYWRsaW5lID0gcmVxdWlyZSgncmVhZGxpbmUnKS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgICAgaW5wdXQ6IHRoaXMucHJvdmlkZXIuc3Rkb3V0LFxuICAgICAgb3V0cHV0OiB0aGlzLnByb3ZpZGVyLnN0ZGluXG4gICAgfSlcblxuICAgIHRoaXMucHJvdmlkZXIub24oJ2Vycm9yJywgKGVycikgPT5cbiAgICAgIGlmIGVyci5jb2RlID09ICdFTk9FTlQnXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiXCJcIlxuICAgICAgICAgIHB5dGhvbi10b29scyB3YXMgdW5hYmxlIHRvIGZpbmQgeW91ciBtYWNoaW5lJ3MgcHl0aG9uIGV4ZWN1dGFibGUuXG5cbiAgICAgICAgICBQbGVhc2UgdHJ5IHNldCB0aGUgcGF0aCBpbiBwYWNrYWdlIHNldHRpbmdzIGFuZCB0aGVuIHJlc3RhcnQgYXRvbS5cblxuICAgICAgICAgIElmIHRoZSBpc3N1ZSBwZXJzaXN0cyBwbGVhc2UgcG9zdCBhbiBpc3N1ZSBvblxuICAgICAgICAgICN7dGhpcy5faXNzdWVSZXBvcnRMaW5rfVxuICAgICAgICAgIFwiXCJcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiBlcnIsXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJcIlwiXG4gICAgICAgICAgcHl0aG9uLXRvb2xzIHVuZXhwZWN0ZWQgZXJyb3IuXG5cbiAgICAgICAgICBQbGVhc2UgY29uc2lkZXIgcG9zdGluZyBhbiBpc3N1ZSBvblxuICAgICAgICAgICN7dGhpcy5faXNzdWVSZXBvcnRMaW5rfVxuICAgICAgICAgIFwiXCJcIiwge1xuICAgICAgICAgICAgICBkZXRhaWw6IGVycixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIClcbiAgICB0aGlzLnByb3ZpZGVyLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT5cbiAgICAgIGlmIHNpZ25hbCAhPSAnU0lHVEVSTSdcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIHB5dGhvbi10b29scyBleHBlcmllbmNlZCBhbiB1bmV4cGVjdGVkIGV4aXQuXG5cbiAgICAgICAgICBQbGVhc2UgY29uc2lkZXIgcG9zdGluZyBhbiBpc3N1ZSBvblxuICAgICAgICAgICN7dGhpcy5faXNzdWVSZXBvcnRMaW5rfVxuICAgICAgICAgIFwiXCJcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiBcImV4aXQgd2l0aCBjb2RlICN7Y29kZX0sIHNpZ25hbCAje3NpZ25hbH1cIixcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgKVxuXG4gIGRlYWN0aXZhdGU6ICgpIC0+XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMucHJvdmlkZXIua2lsbCgpXG4gICAgdGhpcy5yZWFkbGluZS5jbG9zZSgpXG5cbiAgc2VsZWN0QWxsU3RyaW5nOiAoKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGJ1ZmZlclBvc2l0aW9uLnJvdylcblxuICAgIHNjb3BlRGVzY3JpcHRvciA9IGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgYmxvY2sgPSBmYWxzZVxuICAgIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLnNpbmdsZS5zaW5nbGUtbGluZS4qLywgc2NvcGVzKVxuICAgICAgZGVsaW1pdGVyID0gJ1xcJydcbiAgICBlbHNlIGlmIHJlZ2V4UGF0dGVybkluKC9zdHJpbmcucXVvdGVkLmRvdWJsZS5zaW5nbGUtbGluZS4qLywgc2NvcGVzKVxuICAgICAgZGVsaW1pdGVyID0gJ1wiJ1xuICAgIGVsc2UgaWYgcmVnZXhQYXR0ZXJuSW4oL3N0cmluZy5xdW90ZWQuZG91YmxlLmJsb2NrLiovLCBzY29wZXMpXG4gICAgICBkZWxpbWl0ZXIgPSAnXCJcIlwiJ1xuICAgICAgYmxvY2sgPSB0cnVlXG4gICAgZWxzZSBpZiByZWdleFBhdHRlcm5Jbigvc3RyaW5nLnF1b3RlZC5zaW5nbGUuYmxvY2suKi8sIHNjb3BlcylcbiAgICAgIGRlbGltaXRlciA9ICdcXCdcXCdcXCcnXG4gICAgICBibG9jayA9IHRydWVcbiAgICBlbHNlXG4gICAgICByZXR1cm5cblxuICAgIGlmIG5vdCBibG9ja1xuICAgICAgc3RhcnQgPSBlbmQgPSBidWZmZXJQb3NpdGlvbi5jb2x1bW5cblxuICAgICAgd2hpbGUgbGluZVtzdGFydF0gIT0gZGVsaW1pdGVyXG4gICAgICAgIHN0YXJ0ID0gc3RhcnQgLSAxXG4gICAgICAgIGlmIHN0YXJ0IDwgMFxuICAgICAgICAgIHJldHVyblxuXG4gICAgICB3aGlsZSBsaW5lW2VuZF0gIT0gZGVsaW1pdGVyXG4gICAgICAgIGVuZCA9IGVuZCArIDFcbiAgICAgICAgaWYgZW5kID09IGxpbmUubGVuZ3RoXG4gICAgICAgICAgcmV0dXJuXG5cbiAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKG5ldyBSYW5nZShcbiAgICAgICAgbmV3IFBvaW50KGJ1ZmZlclBvc2l0aW9uLnJvdywgc3RhcnQgKyAxKSxcbiAgICAgICAgbmV3IFBvaW50KGJ1ZmZlclBvc2l0aW9uLnJvdywgZW5kKSxcbiAgICAgICkpXG4gICAgZWxzZVxuICAgICAgc3RhcnQgPSBlbmQgPSBidWZmZXJQb3NpdGlvbi5yb3dcbiAgICAgIHN0YXJ0X2luZGV4ID0gZW5kX2luZGV4ID0gLTFcblxuICAgICAgIyBEZXRlY3QgaWYgd2UgYXJlIGF0IHRoZSBib3VuZGFyaWVzIG9mIHRoZSBibG9jayBzdHJpbmdcbiAgICAgIGRlbGltX2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcblxuICAgICAgaWYgZGVsaW1faW5kZXggIT0gLTFcbiAgICAgICAgc2NvcGVzID0gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludChzdGFydCwgZGVsaW1faW5kZXgpKVxuICAgICAgICBzY29wZXMgPSBzY29wZXMuZ2V0U2NvcGVzQXJyYXkoKVxuXG4gICAgICAgICMgV2UgYXJlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGJsb2NrXG4gICAgICAgIGlmIHJlZ2V4UGF0dGVybkluKC9wdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5iZWdpbi4qLywgc2NvcGVzKVxuICAgICAgICAgIHN0YXJ0X2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcbiAgICAgICAgICB3aGlsZSBlbmRfaW5kZXggPT0gLTFcbiAgICAgICAgICAgIGVuZCA9IGVuZCArIDFcbiAgICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kKVxuICAgICAgICAgICAgZW5kX2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcblxuICAgICAgICAjIFdlIGFyZSB0aGUgZW5kIG9mIHRoZSBibG9ja1xuICAgICAgICBlbHNlIGlmIHJlZ2V4UGF0dGVybkluKC9wdW5jdHVhdGlvbi5kZWZpbml0aW9uLnN0cmluZy5lbmQuKi8sIHNjb3BlcylcbiAgICAgICAgICBlbmRfaW5kZXggPSBsaW5lLmluZGV4T2YoZGVsaW1pdGVyKVxuICAgICAgICAgIHdoaWxlIHN0YXJ0X2luZGV4ID09IC0xXG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0IC0gMVxuICAgICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhzdGFydClcbiAgICAgICAgICAgIHN0YXJ0X2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcblxuICAgICAgZWxzZVxuICAgICAgICAjIFdlIGFyZSBuZWl0aGVyIGF0IHRoZSBiZWdpbm5pbmcgb3IgdGhlIGVuZCBvZiB0aGUgYmxvY2tcbiAgICAgICAgd2hpbGUgZW5kX2luZGV4ID09IC0xXG4gICAgICAgICAgZW5kID0gZW5kICsgMVxuICAgICAgICAgIGxpbmUgPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coZW5kKVxuICAgICAgICAgIGVuZF9pbmRleCA9IGxpbmUuaW5kZXhPZihkZWxpbWl0ZXIpXG4gICAgICAgIHdoaWxlIHN0YXJ0X2luZGV4ID09IC0xXG4gICAgICAgICAgc3RhcnQgPSBzdGFydCAtIDFcbiAgICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHN0YXJ0KVxuICAgICAgICAgIHN0YXJ0X2luZGV4ID0gbGluZS5pbmRleE9mKGRlbGltaXRlcilcblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdweXRob24tdG9vbHMuc21hcnRCbG9ja1NlbGVjdGlvbicpXG4gICAgICAgICMgU21hcnQgYmxvY2sgc2VsZWN0aW9uc1xuICAgICAgICBzZWxlY3Rpb25zID0gW25ldyBSYW5nZShcbiAgICAgICAgICBuZXcgUG9pbnQoc3RhcnQsIHN0YXJ0X2luZGV4ICsgZGVsaW1pdGVyLmxlbmd0aCksXG4gICAgICAgICAgbmV3IFBvaW50KHN0YXJ0LCBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coc3RhcnQpLmxlbmd0aCksXG4gICAgICAgICldXG5cbiAgICAgICAgZm9yIGkgaW4gW3N0YXJ0ICsgMSAuLi4gZW5kXSBieSAxXG4gICAgICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhpKVxuICAgICAgICAgIHRyaW1tZWQgPSBsaW5lLnJlcGxhY2UoL15cXHMrLywgXCJcIikgICMgbGVmdCB0cmltXG4gICAgICAgICAgc2VsZWN0aW9ucy5wdXNoKG5ldyBSYW5nZShcbiAgICAgICAgICAgIG5ldyBQb2ludChpLCBsaW5lLmxlbmd0aCAtIHRyaW1tZWQubGVuZ3RoKSxcbiAgICAgICAgICAgIG5ldyBQb2ludChpLCBsaW5lLmxlbmd0aCksXG4gICAgICAgICAgKSlcblxuICAgICAgICBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KGVuZClcbiAgICAgICAgdHJpbW1lZCA9IGxpbmUucmVwbGFjZSgvXlxccysvLCBcIlwiKSAgIyBsZWZ0IHRyaW1cblxuICAgICAgICBzZWxlY3Rpb25zLnB1c2gobmV3IFJhbmdlKFxuICAgICAgICAgIG5ldyBQb2ludChlbmQsIGxpbmUubGVuZ3RoIC0gdHJpbW1lZC5sZW5ndGgpLFxuICAgICAgICAgIG5ldyBQb2ludChlbmQsIGVuZF9pbmRleCksXG4gICAgICAgICkpXG5cbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKHNlbGVjdGlvbnMuZmlsdGVyIChyYW5nZSkgLT4gbm90IHJhbmdlLmlzRW1wdHkoKSlcbiAgICAgIGVsc2VcbiAgICAgICAgZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UobmV3IFJhbmdlKFxuICAgICAgICAgIG5ldyBQb2ludChzdGFydCwgc3RhcnRfaW5kZXggKyBkZWxpbWl0ZXIubGVuZ3RoKSxcbiAgICAgICAgICBuZXcgUG9pbnQoZW5kLCBlbmRfaW5kZXgpLFxuICAgICAgICApKVxuXG4gIGhhbmRsZUplZGlUb29sc1Jlc3BvbnNlOiAocmVzcG9uc2UpIC0+XG4gICAgaWYgJ2Vycm9yJyBvZiByZXNwb25zZVxuICAgICAgY29uc29sZS5lcnJvcihyZXNwb25zZVsnZXJyb3InXSlcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihyZXNwb25zZVsnZXJyb3InXSlcbiAgICAgIHJldHVyblxuXG4gICAgaWYgcmVzcG9uc2VbJ2RlZmluaXRpb25zJ10ubGVuZ3RoID4gMFxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgICAgIGlmIHJlc3BvbnNlWyd0eXBlJ10gPT0gJ3VzYWdlcydcbiAgICAgICAgcGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgc2VsZWN0aW9ucyA9IFtdXG4gICAgICAgIGZvciBpdGVtIGluIHJlc3BvbnNlWydkZWZpbml0aW9ucyddXG4gICAgICAgICAgaWYgaXRlbVsncGF0aCddID09IHBhdGhcbiAgICAgICAgICAgIHNlbGVjdGlvbnMucHVzaChuZXcgUmFuZ2UoXG4gICAgICAgICAgICAgIG5ldyBQb2ludChpdGVtWydsaW5lJ10gLSAxLCBpdGVtWydjb2wnXSksXG4gICAgICAgICAgICAgIG5ldyBQb2ludChpdGVtWydsaW5lJ10gLSAxLCBpdGVtWydjb2wnXSArIGl0ZW1bJ25hbWUnXS5sZW5ndGgpLCAgIyBVc2Ugc3RyaW5nIGxlbmd0aFxuICAgICAgICAgICAgKSlcblxuICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoc2VsZWN0aW9ucylcblxuICAgICAgZWxzZSBpZiByZXNwb25zZVsndHlwZSddID09ICdnb3RvRGVmJ1xuICAgICAgICBmaXJzdF9kZWYgPSByZXNwb25zZVsnZGVmaW5pdGlvbnMnXVswXVxuXG4gICAgICAgIGxpbmUgPSBmaXJzdF9kZWZbJ2xpbmUnXVxuICAgICAgICBjb2x1bW4gPSBmaXJzdF9kZWZbJ2NvbCddXG5cbiAgICAgICAgaWYgbGluZSAhPSBudWxsIGFuZCBjb2x1bW4gIT0gbnVsbFxuICAgICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBpbml0aWFsTGluZTogbGluZSxcbiAgICAgICAgICAgIGluaXRpYWxDb2x1bW46IGNvbHVtbixcbiAgICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaXJzdF9kZWZbJ3BhdGgnXSwgb3B0aW9ucykudGhlbigoZWRpdG9yKSAtPlxuICAgICAgICAgICAgZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgIFwicHl0aG9uLXRvb2xzIGVycm9yLiAje3RoaXMuX2lzc3VlUmVwb3J0TGlua31cIiwge1xuICAgICAgICAgICAgZGV0YWlsOiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSksXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgIGVsc2VcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwicHl0aG9uLXRvb2xzIGNvdWxkIG5vdCBmaW5kIGFueSByZXN1bHRzIVwiKVxuXG4gIGplZGlUb29sc1JlcXVlc3Q6ICh0eXBlKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGdyYW1tYXIgPSBlZGl0b3IuZ2V0R3JhbW1hcigpXG5cbiAgICBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBwYXlsb2FkID0ge1xuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKCksXG4gICAgICBzb3VyY2U6IGVkaXRvci5nZXRUZXh0KCksXG4gICAgICBsaW5lOiBidWZmZXJQb3NpdGlvbi5yb3csXG4gICAgICBjb2w6IGJ1ZmZlclBvc2l0aW9uLmNvbHVtbixcbiAgICAgIHByb2plY3RfcGF0aHM6IGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgfVxuXG4gICAgIyBUaGlzIGlzIG5lZWRlZCBmb3IgdGhlIHByb21pc2UgdG8gd29yayBjb3JyZWN0bHlcbiAgICBoYW5kbGVKZWRpVG9vbHNSZXNwb25zZSA9IHRoaXMuaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2VcbiAgICByZWFkbGluZSA9IHRoaXMucmVhZGxpbmVcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgcmVzcG9uc2UgPSByZWFkbGluZS5xdWVzdGlvbihcIiN7SlNPTi5zdHJpbmdpZnkocGF5bG9hZCl9XFxuXCIsIChyZXNwb25zZSkgLT5cbiAgICAgICAgaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UoSlNPTi5wYXJzZShyZXNwb25zZSkpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgKVxuICAgIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQeXRob25Ub29sc1xuIl19
