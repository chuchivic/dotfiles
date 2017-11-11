(function() {
  var Point, PythonTools, Range, ref;

  PythonTools = require('../lib/python-tools');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  describe("PythonTools", function() {
    var pythonTools;
    pythonTools = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('python-tools');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-python');
      });
      return runs(function() {
        return pythonTools = atom.packages.getActivePackage('python-tools').mainModule;
      });
    });
    describe("when running jedi commands", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('test.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("import json");
        });
      });
      return it("does not send too many commands over time", function() {
        editor.setCursorBufferPosition(new Point(0, 9));
        spyOn(pythonTools, 'handleJediToolsResponse');
        waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef');
        });
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(pythonTools.handleJediToolsResponse.calls.length).toEqual(2);
          });
        });
      });
    });
    describe("when running the goto definitions command", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('mike.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("import json\n\nclass Snake(object):\n    def slither(self, dict):\n        return json.dumps(dict)\n\nsnake = Snake()\nsnake.slither({'x': 10, 'y': 20})\n\ni_dont_exist()");
        });
      });
      it("moves to the correct class location", function() {
        editor.setCursorBufferPosition(new Point(6, 9));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(editor.getCursorBufferPosition()).toEqual(new Point(3, 6));
          });
        });
      });
      it("moves to the correct method location", function() {
        editor.setCursorBufferPosition(new Point(7, 7));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(editor.getCursorBufferPosition()).toEqual(new Point(4, 8));
          });
        });
      });
      it("does nothing if symbol does not exist", function() {
        editor.setCursorBufferPosition(new Point(9, 7));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            return expect(editor.getCursorBufferPosition()).toEqual(new Point(9, 7));
          });
        });
      });
      return it("opens appropriate file if required", function() {
        editor.setCursorBufferPosition(new Point(0, 9));
        spyOn(atom.workspace, 'open').andCallThrough();
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('gotoDef').then(function() {
            var path;
            path = atom.workspace.open.mostRecentCall.args[0];
            if (/^win/.test(process.platform)) {
              return expect(path).toMatch(/.*\\json\\__init__.py/);
            } else {
              return expect(path).toMatch(/.*\/json\/__init__.py/);
            }
          });
        });
      });
    });
    describe("when tools.py gets an invalid request", function() {
      var editor;
      editor = null;
      return beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('error.py');
        });
        return runs(function() {
          return editor = atom.workspace.getActiveTextEditor();
        });
      });
    });
    describe("when running the show usages command", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('foo.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("def my_function(a, b):\n    return a + b\n\nprint my_function(10, 20)");
        });
      });
      xit("selects the correct symbols", function() {
        editor.setCursorBufferPosition(new Point(3, 8));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('usages').then(function() {
            return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(0, 4), new Point(0, 15)), new Range(new Point(3, 6), new Point(3, 17))]);
          });
        });
      });
      return xit("doesn't alter current selection on no results", function() {
        editor.setCursorBufferPosition(new Point(3, 2));
        return waitsForPromise(function() {
          return pythonTools.jediToolsRequest('usages').then(function() {
            return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(3, 2), new Point(3, 2))]);
          });
        });
      });
    });
    describe("when running the select string command", function() {
      var editor;
      editor = null;
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('lolcat.py');
        });
        return runs(function() {
          editor = atom.workspace.getActiveTextEditor();
          return editor.setText("class Lolcat(object):\n  mystring = 'hello world'\n  anotherstring = \"this is some text\"\n  block_text = \"\"\"\n  This was a triumph!\n  I'm making a note here:\n  Huge success!\n  \"\"\"\n  more_blocks = '''\n  This is some text\n  '''\n  sql_text = \"\"\"SELECT *\n  FROM foo\n  \"\"\"\n  sql_text2 = '''SELECT *\n  FROM bar\n  '''");
        });
      });
      it("selects single-line single qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(1, 17));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(1, 14), new Point(1, 25)));
      });
      it("selects single-line double qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(2, 25));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(2, 19), new Point(2, 36)));
      });
      it("selects block string double qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(4, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(3, 18), new Point(7, 2)));
      });
      it("smart selects double qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(4, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(4, 2), new Point(4, 21)), new Range(new Point(5, 2), new Point(5, 25)), new Range(new Point(6, 2), new Point(6, 15))]);
      });
      it("selects block string single qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(9, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(8, 19), new Point(10, 2)));
      });
      it("smart selects single qoutes correctly", function() {
        editor.setCursorBufferPosition(new Point(9, 15));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRanges()).toEqual([new Range(new Point(9, 2), new Point(9, 19))]);
      });
      it("it selects block SQL double qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(12, 20));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(11, 16), new Point(13, 2)));
      });
      return it("it selects block SQL single qoutes correctly", function() {
        atom.config.set('python-tools.smartBlockSelection', false);
        editor.setCursorBufferPosition(new Point(14, 20));
        pythonTools.selectAllString();
        return expect(editor.getSelectedBufferRange()).toEqual(new Range(new Point(14, 17), new Point(16, 2)));
      });
    });
    return describe("when a response is returned from tools.py", function() {
      it("informs the user with an info notification when no items were found", function() {
        var notification;
        pythonTools.handleJediToolsResponse({
          type: "usages",
          definitions: []
        });
        notification = atom.notifications.getNotifications()[0];
        return expect(notification.type).toBe('info');
      });
      it("informs the user with an error notification on error", function() {
        var notification;
        pythonTools.handleJediToolsResponse({
          "error": "this is a test error"
        });
        notification = atom.notifications.getNotifications()[0];
        return expect(notification.type).toBe('error');
      });
      return it("informs the user with an error notification on invalid type", function() {
        var notification;
        pythonTools.handleJediToolsResponse({
          type: "monkeys",
          definitions: [
            {
              line: 0,
              column: 0
            }
          ]
        });
        notification = atom.notifications.getNotifications()[0];
        return expect(notification.type).toBe('error');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvcHl0aG9uLXRvb2xzL3NwZWMvcHl0aG9uLXRvb2xzLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLHFCQUFSOztFQUNkLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFFUixRQUFBLENBQVMsYUFBVCxFQUF3QixTQUFBO0FBQ3RCLFFBQUE7SUFBQSxXQUFBLEdBQWM7SUFDZCxVQUFBLENBQVcsU0FBQTtNQUNULGVBQUEsQ0FBZ0IsU0FBQTtlQUNkLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixjQUE5QjtNQURjLENBQWhCO01BRUEsZUFBQSxDQUFnQixTQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGlCQUE5QjtNQURjLENBQWhCO2FBRUEsSUFBQSxDQUFLLFNBQUE7ZUFDSCxXQUFBLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixjQUEvQixDQUE4QyxDQUFDO01BRDFELENBQUw7SUFMUyxDQUFYO0lBUUEsUUFBQSxDQUFTLDRCQUFULEVBQXVDLFNBQUE7QUFDckMsVUFBQTtNQUFBLE1BQUEsR0FBUztNQUNULFVBQUEsQ0FBVyxTQUFBO1FBQ1QsZUFBQSxDQUFnQixTQUFBO2lCQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixTQUFwQjtRQURjLENBQWhCO2VBR0EsSUFBQSxDQUFLLFNBQUE7VUFDSCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO2lCQUNULE1BQU0sQ0FBQyxPQUFQLENBQWUsYUFBZjtRQUZHLENBQUw7TUFKUyxDQUFYO2FBVUEsRUFBQSxDQUFHLDJDQUFILEVBQWdELFNBQUE7UUFDOUMsTUFBTSxDQUFDLHVCQUFQLENB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QUEsRUFBTSxTQUFOO1VBQ0EsV0FBQSxFQUFhO1lBQUM7Y0FDVixJQUFBLEVBQU0sQ0FESTtjQUVWLE1BQUEsRUFBUSxDQUZFO2FBQUQ7V0FEYjtTQURGO1FBT0MsZUFBZ0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBbkIsQ0FBQTtlQUNqQixNQUFBLENBQU8sWUFBWSxDQUFDLElBQXBCLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsT0FBL0I7TUFUZ0UsQ0FBbEU7SUFqQm9ELENBQXREO0VBdE9zQixDQUF4QjtBQUhBIiwic291cmNlc0NvbnRlbnQiOlsiUHl0aG9uVG9vbHMgPSByZXF1aXJlKCcuLi9saWIvcHl0aG9uLXRvb2xzJyk7XG57UG9pbnQsIFJhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxuZGVzY3JpYmUgXCJQeXRob25Ub29sc1wiLCAtPlxuICBweXRob25Ub29scyA9IG51bGxcbiAgYmVmb3JlRWFjaCAtPlxuICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3B5dGhvbi10b29scycpXG4gICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbGFuZ3VhZ2UtcHl0aG9uJylcbiAgICBydW5zIC0+XG4gICAgICBweXRob25Ub29scyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgncHl0aG9uLXRvb2xzJykubWFpbk1vZHVsZVxuXG4gIGRlc2NyaWJlIFwid2hlbiBydW5uaW5nIGplZGkgY29tbWFuZHNcIiwgLT5cbiAgICBlZGl0b3IgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3Rlc3QucHknKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcIlwiXCJcbiAgICAgICAgaW1wb3J0IGpzb25cbiAgICAgICAgXCJcIlwiKVxuXG4gICAgaXQgXCJkb2VzIG5vdCBzZW5kIHRvbyBtYW55IGNvbW1hbmRzIG92ZXIgdGltZVwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgwLCA5KSlcbiAgICAgIHNweU9uKHB5dGhvblRvb2xzLCAnaGFuZGxlSmVkaVRvb2xzUmVzcG9uc2UnKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHB5dGhvblRvb2xzLmplZGlUb29sc1JlcXVlc3QoJ2dvdG9EZWYnKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHB5dGhvblRvb2xzLmplZGlUb29sc1JlcXVlc3QoJ2dvdG9EZWYnKS50aGVuIC0+XG4gICAgICAgICAgZXhwZWN0KHB5dGhvblRvb2xzLmhhbmRsZUplZGlUb29sc1Jlc3BvbnNlLmNhbGxzLmxlbmd0aCkudG9FcXVhbCgyKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBydW5uaW5nIHRoZSBnb3RvIGRlZmluaXRpb25zIGNvbW1hbmRcIiwgLT5cbiAgICBlZGl0b3IgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ21pa2UucHknKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcIlwiXCJcbiAgICAgICAgaW1wb3J0IGpzb25cblxuICAgICAgICBjbGFzcyBTbmFrZShvYmplY3QpOlxuICAgICAgICAgICAgZGVmIHNsaXRoZXIoc2VsZiwgZGljdCk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb24uZHVtcHMoZGljdClcblxuICAgICAgICBzbmFrZSA9IFNuYWtlKClcbiAgICAgICAgc25ha2Uuc2xpdGhlcih7J3gnOiAxMCwgJ3knOiAyMH0pXG5cbiAgICAgICAgaV9kb250X2V4aXN0KClcbiAgICAgICAgXCJcIlwiKVxuXG4gICAgaXQgXCJtb3ZlcyB0byB0aGUgY29ycmVjdCBjbGFzcyBsb2NhdGlvblwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCg2LCA5KSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBweXRob25Ub29scy5qZWRpVG9vbHNSZXF1ZXN0KCdnb3RvRGVmJykudGhlbiggKCkgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwobmV3IFBvaW50KDMsIDYpKVxuICAgICAgICApXG5cbiAgICBpdCBcIm1vdmVzIHRvIHRoZSBjb3JyZWN0IG1ldGhvZCBsb2NhdGlvblwiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCg3LCA3KSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBweXRob25Ub29scy5qZWRpVG9vbHNSZXF1ZXN0KCdnb3RvRGVmJykudGhlbiggKCkgLT5cbiAgICAgICAgICBleHBlY3QoZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpLnRvRXF1YWwobmV3IFBvaW50KDQsIDgpKVxuICAgICAgICApXG5cbiAgICBpdCBcImRvZXMgbm90aGluZyBpZiBzeW1ib2wgZG9lcyBub3QgZXhpc3RcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoOSwgNykpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHl0aG9uVG9vbHMuamVkaVRvb2xzUmVxdWVzdCgnZ290b0RlZicpLnRoZW4oICgpIC0+XG4gICAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKG5ldyBQb2ludCg5LCA3KSlcbiAgICAgICAgKVxuXG4gICAgaXQgXCJvcGVucyBhcHByb3ByaWF0ZSBmaWxlIGlmIHJlcXVpcmVkXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDAsIDkpKVxuICAgICAgc3B5T24oYXRvbS53b3Jrc3BhY2UsICdvcGVuJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgICAgIHB5dGhvblRvb2xzLmplZGlUb29sc1JlcXVlc3QoJ2dvdG9EZWYnKS50aGVuKCAoKSAtPlxuICAgICAgICAgIHBhdGggPSBhdG9tLndvcmtzcGFjZS5vcGVuLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF1cbiAgICAgICAgICBpZiAvXndpbi8udGVzdCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICAgICAgICBleHBlY3QocGF0aCkudG9NYXRjaCgvLipcXFxcanNvblxcXFxfX2luaXRfXy5weS8pXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZXhwZWN0KHBhdGgpLnRvTWF0Y2goLy4qXFwvanNvblxcL19faW5pdF9fLnB5LylcbiAgICAgICAgKVxuXG4gIGRlc2NyaWJlIFwid2hlbiB0b29scy5weSBnZXRzIGFuIGludmFsaWQgcmVxdWVzdFwiLCAtPlxuICAgIGVkaXRvciA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignZXJyb3IucHknKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gIGRlc2NyaWJlIFwid2hlbiBydW5uaW5nIHRoZSBzaG93IHVzYWdlcyBjb21tYW5kXCIsIC0+XG4gICAgZWRpdG9yID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKCdmb28ucHknKVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dChcIlwiXCJcbiAgICAgICAgZGVmIG15X2Z1bmN0aW9uKGEsIGIpOlxuICAgICAgICAgICAgcmV0dXJuIGEgKyBiXG5cbiAgICAgICAgcHJpbnQgbXlfZnVuY3Rpb24oMTAsIDIwKVxuICAgICAgICBcIlwiXCIpXG5cbiAgICB4aXQgXCJzZWxlY3RzIHRoZSBjb3JyZWN0IHN5bWJvbHNcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoMywgOCkpXG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgcHl0aG9uVG9vbHMuamVkaVRvb2xzUmVxdWVzdCgndXNhZ2VzJykudGhlbiggKCktPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKSkudG9FcXVhbChbXG4gICAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDAsIDQpLCBuZXcgUG9pbnQoMCwgMTUpKSxcbiAgICAgICAgICAgIG5ldyBSYW5nZShuZXcgUG9pbnQoMywgNiksIG5ldyBQb2ludCgzLCAxNykpLFxuICAgICAgICAgIF0pXG4gICAgICAgIClcblxuICAgIHhpdCBcImRvZXNuJ3QgYWx0ZXIgY3VycmVudCBzZWxlY3Rpb24gb24gbm8gcmVzdWx0c1wiLCAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgzLCAyKSlcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgICAgICBweXRob25Ub29scy5qZWRpVG9vbHNSZXF1ZXN0KCd1c2FnZXMnKS50aGVuKCAoKSAtPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKSkudG9FcXVhbChbXG4gICAgICAgICAgICAgIG5ldyBSYW5nZShuZXcgUG9pbnQoMywgMiksIG5ldyBQb2ludCgzLCAyKSlcbiAgICAgICAgICBdKVxuICAgICAgICApXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHJ1bm5pbmcgdGhlIHNlbGVjdCBzdHJpbmcgY29tbWFuZFwiLCAtPlxuICAgIGVkaXRvciA9IG51bGxcbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbignbG9sY2F0LnB5JylcblxuICAgICAgcnVucyAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgZWRpdG9yLnNldFRleHQoXCJcIlwiXG4gICAgICAgIGNsYXNzIExvbGNhdChvYmplY3QpOlxuICAgICAgICAgIG15c3RyaW5nID0gJ2hlbGxvIHdvcmxkJ1xuICAgICAgICAgIGFub3RoZXJzdHJpbmcgPSBcInRoaXMgaXMgc29tZSB0ZXh0XCJcbiAgICAgICAgICBibG9ja190ZXh0ID0gXFxcIlxcXCJcXFwiXG4gICAgICAgICAgVGhpcyB3YXMgYSB0cml1bXBoIVxuICAgICAgICAgIEknbSBtYWtpbmcgYSBub3RlIGhlcmU6XG4gICAgICAgICAgSHVnZSBzdWNjZXNzIVxuICAgICAgICAgIFxcXCJcXFwiXFxcIlxuICAgICAgICAgIG1vcmVfYmxvY2tzID0gJycnXG4gICAgICAgICAgVGhpcyBpcyBzb21lIHRleHRcbiAgICAgICAgICAnJydcbiAgICAgICAgICBzcWxfdGV4dCA9IFxcXCJcXFwiXFxcIlNFTEVDVCAqXG4gICAgICAgICAgRlJPTSBmb29cbiAgICAgICAgICBcXFwiXFxcIlxcXCJcbiAgICAgICAgICBzcWxfdGV4dDIgPSAnJydTRUxFQ1QgKlxuICAgICAgICAgIEZST00gYmFyXG4gICAgICAgICAgJycnXG4gICAgICAgIFwiXCJcIilcblxuICAgIGl0IFwic2VsZWN0cyBzaW5nbGUtbGluZSBzaW5nbGUgcW91dGVzIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDEsIDE3KSlcbiAgICAgICAgcHl0aG9uVG9vbHMuc2VsZWN0QWxsU3RyaW5nKClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKCkpLnRvRXF1YWwobmV3IFJhbmdlKFxuICAgICAgICAgICAgbmV3IFBvaW50KDEsIDE0KSxcbiAgICAgICAgICAgIG5ldyBQb2ludCgxLCAyNSksXG4gICAgICAgICAgKVxuICAgICAgICApXG5cbiAgICBpdCBcInNlbGVjdHMgc2luZ2xlLWxpbmUgZG91YmxlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKG5ldyBQb2ludCgyLCAyNSkpXG4gICAgICAgIHB5dGhvblRvb2xzLnNlbGVjdEFsbFN0cmluZygpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKS50b0VxdWFsKG5ldyBSYW5nZShcbiAgICAgICAgICAgIG5ldyBQb2ludCgyLCAxOSksXG4gICAgICAgICAgICBuZXcgUG9pbnQoMiwgMzYpLFxuICAgICAgICAgIClcbiAgICAgICAgKVxuXG4gICAgaXQgXCJzZWxlY3RzIGJsb2NrIHN0cmluZyBkb3VibGUgcW91dGVzIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3B5dGhvbi10b29scy5zbWFydEJsb2NrU2VsZWN0aW9uJywgZmFsc2UpXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoNCwgMTUpKVxuICAgICAgICBweXRob25Ub29scy5zZWxlY3RBbGxTdHJpbmcoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSkudG9FcXVhbChuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQoMywgMTgpLFxuICAgICAgICAgICAgbmV3IFBvaW50KDcsIDIpLFxuICAgICAgICAgIClcbiAgICAgICAgKVxuXG4gICAgaXQgXCJzbWFydCBzZWxlY3RzIGRvdWJsZSBxb3V0ZXMgY29ycmVjdGx5XCIsIC0+XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoNCwgMTUpKVxuICAgICAgICBweXRob25Ub29scy5zZWxlY3RBbGxTdHJpbmcoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKCkpLnRvRXF1YWwoW1xuICAgICAgICAgIG5ldyBSYW5nZShuZXcgUG9pbnQoNCwgMiksIG5ldyBQb2ludCg0LCAyMSkpLFxuICAgICAgICAgIG5ldyBSYW5nZShuZXcgUG9pbnQoNSwgMiksIG5ldyBQb2ludCg1LCAyNSkpLFxuICAgICAgICAgIG5ldyBSYW5nZShuZXcgUG9pbnQoNiwgMiksIG5ldyBQb2ludCg2LCAxNSkpLFxuICAgICAgICBdKVxuXG4gICAgaXQgXCJzZWxlY3RzIGJsb2NrIHN0cmluZyBzaW5nbGUgcW91dGVzIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3B5dGhvbi10b29scy5zbWFydEJsb2NrU2VsZWN0aW9uJywgZmFsc2UpXG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihuZXcgUG9pbnQoOSwgMTUpKVxuICAgICAgICBweXRob25Ub29scy5zZWxlY3RBbGxTdHJpbmcoKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2UoKSkudG9FcXVhbChuZXcgUmFuZ2UoXG4gICAgICAgICAgICBuZXcgUG9pbnQoOCwgMTkpLFxuICAgICAgICAgICAgbmV3IFBvaW50KDEwLCAyKSxcbiAgICAgICAgICApXG4gICAgICAgIClcblxuICAgIGl0IFwic21hcnQgc2VsZWN0cyBzaW5nbGUgcW91dGVzIGNvcnJlY3RseVwiLCAtPlxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDksIDE1KSlcbiAgICAgICAgcHl0aG9uVG9vbHMuc2VsZWN0QWxsU3RyaW5nKClcbiAgICAgICAgZXhwZWN0KGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpKS50b0VxdWFsKFtcbiAgICAgICAgICBuZXcgUmFuZ2UobmV3IFBvaW50KDksIDIpLCBuZXcgUG9pbnQoOSwgMTkpKSxcbiAgICAgICAgXSlcblxuICAgIGl0IFwiaXQgc2VsZWN0cyBibG9jayBTUUwgZG91YmxlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdweXRob24tdG9vbHMuc21hcnRCbG9ja1NlbGVjdGlvbicsIGZhbHNlKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDEyLCAyMCkpXG4gICAgICAgIHB5dGhvblRvb2xzLnNlbGVjdEFsbFN0cmluZygpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKS50b0VxdWFsKG5ldyBSYW5nZShcbiAgICAgICAgICAgIG5ldyBQb2ludCgxMSwgMTYpLFxuICAgICAgICAgICAgbmV3IFBvaW50KDEzLCAyKSxcbiAgICAgICAgICApXG4gICAgICAgIClcblxuICAgIGl0IFwiaXQgc2VsZWN0cyBibG9jayBTUUwgc2luZ2xlIHFvdXRlcyBjb3JyZWN0bHlcIiwgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdweXRob24tdG9vbHMuc21hcnRCbG9ja1NlbGVjdGlvbicsIGZhbHNlKVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24obmV3IFBvaW50KDE0LCAyMCkpXG4gICAgICAgIHB5dGhvblRvb2xzLnNlbGVjdEFsbFN0cmluZygpXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZSgpKS50b0VxdWFsKG5ldyBSYW5nZShcbiAgICAgICAgICAgIG5ldyBQb2ludCgxNCwgMTcpLFxuICAgICAgICAgICAgbmV3IFBvaW50KDE2LCAyKSxcbiAgICAgICAgICApXG4gICAgICAgIClcblxuICBkZXNjcmliZSBcIndoZW4gYSByZXNwb25zZSBpcyByZXR1cm5lZCBmcm9tIHRvb2xzLnB5XCIsIC0+XG5cbiAgICBpdCBcImluZm9ybXMgdGhlIHVzZXIgd2l0aCBhbiBpbmZvIG5vdGlmaWNhdGlvbiB3aGVuIG5vIGl0ZW1zIHdlcmUgZm91bmRcIiwgLT5cbiAgICAgIHB5dGhvblRvb2xzLmhhbmRsZUplZGlUb29sc1Jlc3BvbnNlKFxuICAgICAgICB0eXBlOiBcInVzYWdlc1wiXG4gICAgICAgIGRlZmluaXRpb25zOiBbXVxuICAgICAgKVxuICAgICAgW25vdGlmaWNhdGlvbl0gPSBhdG9tLm5vdGlmaWNhdGlvbnMuZ2V0Tm90aWZpY2F0aW9ucygpXG4gICAgICBleHBlY3Qobm90aWZpY2F0aW9uLnR5cGUpLnRvQmUoJ2luZm8nKVxuXG4gICAgaXQgXCJpbmZvcm1zIHRoZSB1c2VyIHdpdGggYW4gZXJyb3Igbm90aWZpY2F0aW9uIG9uIGVycm9yXCIsIC0+XG4gICAgICBweXRob25Ub29scy5oYW5kbGVKZWRpVG9vbHNSZXNwb25zZShcbiAgICAgICAgXCJlcnJvclwiOiBcInRoaXMgaXMgYSB0ZXN0IGVycm9yXCJcbiAgICAgIClcbiAgICAgIFtub3RpZmljYXRpb25dID0gYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKVxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi50eXBlKS50b0JlKCdlcnJvcicpXG5cbiAgICBpdCBcImluZm9ybXMgdGhlIHVzZXIgd2l0aCBhbiBlcnJvciBub3RpZmljYXRpb24gb24gaW52YWxpZCB0eXBlXCIsIC0+XG4gICAgICBweXRob25Ub29scy5oYW5kbGVKZWRpVG9vbHNSZXNwb25zZShcbiAgICAgICAgdHlwZTogXCJtb25rZXlzXCJcbiAgICAgICAgZGVmaW5pdGlvbnM6IFt7XG4gICAgICAgICAgICBsaW5lOiAwXG4gICAgICAgICAgICBjb2x1bW46IDBcbiAgICAgICAgfSAgIF1cbiAgICAgIClcbiAgICAgIFtub3RpZmljYXRpb25dID0gYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKVxuICAgICAgZXhwZWN0KG5vdGlmaWNhdGlvbi50eXBlKS50b0JlKCdlcnJvcicpXG4iXX0=
