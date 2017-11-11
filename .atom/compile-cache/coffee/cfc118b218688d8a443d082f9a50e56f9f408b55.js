(function() {
  var CommandKeystrokeFinder, DarwinEditorKeyMap, DarwinKeyMap, Win32LinuxEditorKeyMap, Win32LinuxKeyMap, _, getCommandsFromKeymap, mockFindKeyBindings, selector, setupKeyBindings;

  CommandKeystrokeFinder = require('../lib/command-keystroke-humanizer');

  _ = require('underscore-plus');

  selector = {
    Darwin: '.platform-darwin',
    DarwinEditor: '.platform-darwin atom-text-editor',
    Win32: '.platform-win32',
    Linux: '.platform-linux',
    Win32Linux: '.platform-win32, .platform-linux',
    Win32LinuxEditor: '.platform-win32 atom-text-editor, .platform-linux atom-text-editor'
  };

  DarwinKeyMap = {
    'cmd-shift-h': 'git-plus:menu',
    'cmd-shift-a s': 'git-plus:status',
    'cmd-shift-a q': 'git-plus:add-and-commit-and-push'
  };

  Win32LinuxKeyMap = {
    'ctrl-shift-h': 'git-plus:menu',
    'ctrl-shift-x': 'git-plus:commit',
    'ctrl-shift-a s': 'git-plus:status',
    'ctrl-shift-a q': 'git-plus:add-and-commit-and-push',
    'ctrl-shift-a a': 'git-plus:add-all-and-commit',
    'ctrl-shift-a p': 'git-plus:add-all-commit-and-push'
  };

  DarwinEditorKeyMap = {
    'cmd-shift-a': 'git-plus:add',
    'cmd-shift-a c': 'git-plus:add-and-commit'
  };

  Win32LinuxEditorKeyMap = {
    'ctrl-shift-a': 'git-plus:add',
    'ctrl-shift-a c': 'git-plus:add-and-commit'
  };

  getCommandsFromKeymap = function(keymap) {
    var cmd, commands, ks;
    commands = [];
    for (ks in keymap) {
      cmd = keymap[ks];
      commands.push([cmd]);
    }
    return commands;
  };

  mockFindKeyBindings = function(bindings) {
    return function(arg) {
      var command;
      command = arg.command;
      return bindings.filter(function(binding) {
        return binding.command === command;
      });
    };
  };

  setupKeyBindings = function(keymaps, selector) {
    var gitCommand, keybindings, keystrokes;
    keybindings = [];
    for (keystrokes in keymaps) {
      gitCommand = keymaps[keystrokes];
      keybindings.push({
        command: gitCommand,
        selector: selector,
        keystrokes: keystrokes
      });
    }
    return spyOn(atom.keymaps, "findKeyBindings").andCallFake(mockFindKeyBindings(keybindings));
  };

  describe("Git-Plus command keystroke humanizer", function() {
    describe("On any platform", function() {
      return describe("when an empty command list is provided", function() {
        return it("returns empty map", function() {
          var keymaps;
          keymaps = [
            {
              command: 'cmd-shift-a',
              selector: selector.Darwin
            }
          ];
          spyOn(atom.keymaps, "findKeyBindings").andCallFake(mockFindKeyBindings(keymaps));
          return expect(CommandKeystrokeFinder().get([])).toEqual({});
        });
      });
    });
    describe("when platform is Darwin", function() {
      var humanizer;
      humanizer = null;
      beforeEach(function() {
        return humanizer = CommandKeystrokeFinder("darwin");
      });
      describe("when selector is " + selector.Darwin, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(DarwinKeyMap, selector.Darwin);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(DarwinKeyMap));
          results = [];
          for (keystrokes in DarwinKeyMap) {
            gitCommand = DarwinKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.DarwinEditor, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(DarwinEditorKeyMap, selector.DarwinEditor);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(DarwinEditorKeyMap));
          results = [];
          for (keystrokes in DarwinEditorKeyMap) {
            gitCommand = DarwinEditorKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.Win32Linux, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(Win32LinuxKeyMap, selector.Win32Linux);
          return expect(humanizer.get(getCommandsFromKeymap(Win32LinuxKeyMap))).toEqual({});
        });
      });
      return describe("when selector is " + selector.Win32LinuxEditor, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(Win32LinuxEditorKeyMap, selector.Win32LinuxEditor);
          return expect(humanizer.get(getCommandsFromKeymap(Win32LinuxEditorKeyMap))).toEqual({});
        });
      });
    });
    return describe("when platform is " + selector.Win32 + " or " + selector.Linux, function() {
      var humanizer;
      humanizer = null;
      beforeEach(function() {
        return humanizer = CommandKeystrokeFinder("win32");
      });
      describe("when selector is " + selector.Win32Linux, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(Win32LinuxKeyMap, selector.Win32Linux);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(Win32LinuxKeyMap));
          results = [];
          for (keystrokes in Win32LinuxKeyMap) {
            gitCommand = Win32LinuxKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.Win32LinuxEditor, function() {
        return it("it must return all keystrokes in humanized form", function() {
          var gitCommand, humanizedKeystrokes, keystrokes, results;
          setupKeyBindings(Win32LinuxEditorKeyMap, selector.Win32LinuxEditor);
          humanizedKeystrokes = humanizer.get(getCommandsFromKeymap(Win32LinuxEditorKeyMap));
          results = [];
          for (keystrokes in Win32LinuxEditorKeyMap) {
            gitCommand = Win32LinuxEditorKeyMap[keystrokes];
            results.push(expect(humanizedKeystrokes[gitCommand]).toEqual(_.humanizeKeystroke(keystrokes)));
          }
          return results;
        });
      });
      describe("when selector is " + selector.Darwin, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(DarwinKeyMap, selector.Darwin);
          return expect(humanizer.get(getCommandsFromKeymap(DarwinKeyMap))).toEqual({});
        });
      });
      return describe("when selector is " + selector.DarwinEditor, function() {
        return it("it must return empty map", function() {
          setupKeyBindings(DarwinEditorKeyMap, selector.DarwinEditor);
          return expect(humanizer.get(getCommandsFromKeymap(DarwinEditorKeyMap))).toEqual({});
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy9jb21tYW5kLWtleXN0cm9rZS1odW1hbml6ZXItc3BlYy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxvQ0FBUjs7RUFDekIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixRQUFBLEdBQ0U7SUFBQSxNQUFBLEVBQW9CLGtCQUFwQjtJQUNBLFlBQUEsRUFBb0IsbUNBRHBCO0lBRUEsS0FBQSxFQUFvQixpQkFGcEI7SUFHQSxLQUFBLEVBQW9CLGlCQUhwQjtJQUlBLFVBQUEsRUFBb0Isa0NBSnBCO0lBS0EsZ0JBQUEsRUFBb0Isb0VBTHBCOzs7RUFPRixZQUFBLEdBQ0U7SUFBQSxhQUFBLEVBQW9CLGVBQXBCO0lBQ0EsZUFBQSxFQUFvQixpQkFEcEI7SUFFQSxlQUFBLEVBQW9CLGtDQUZwQjs7O0VBSUYsZ0JBQUEsR0FDRTtJQUFBLGNBQUEsRUFBb0IsZUFBcEI7SUFDQSxjQUFBLEVBQW9CLGlCQURwQjtJQUVBLGdCQUFBLEVBQW9CLGlCQUZwQjtJQUdBLGdCQUFBLEVBQW9CLGtDQUhwQjtJQUlBLGdCQUFBLEVBQW9CLDZCQUpwQjtJQUtBLGdCQUFBLEVBQW9CLGtDQUxwQjs7O0VBT0Ysa0JBQUEsR0FDRTtJQUFBLGFBQUEsRUFBb0IsY0FBcEI7SUFDQSxlQUFBLEVBQW9CLHlCQURwQjs7O0VBR0Ysc0JBQUEsR0FDRTtJQUFBLGNBQUEsRUFBb0IsY0FBcEI7SUFDQSxnQkFBQSxFQUFvQix5QkFEcEI7OztFQUdGLHFCQUFBLEdBQXdCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0lBQUEsUUFBQSxHQUFXO0FBQ1gsU0FBQSxZQUFBOztNQUNFLFFBQVEsQ0FBQyxJQUFULENBQWMsQ0FBQyxHQUFELENBQWQ7QUFERjtXQUVBO0VBSnNCOztFQU14QixtQkFBQSxHQUFzQixTQUFDLFFBQUQ7V0FDcEIsU0FBQyxHQUFEO0FBQ0UsVUFBQTtNQURBLFVBQUQ7YUFDQyxRQUFRLENBQUMsTUFBVCxDQUFnQixTQUFDLE9BQUQ7ZUFBYSxPQUFPLENBQUMsT0FBUixLQUFtQjtNQUFoQyxDQUFoQjtJQURGO0VBRG9COztFQUl0QixnQkFBQSxHQUFtQixTQUFDLE9BQUQsRUFBVSxRQUFWO0FBQ2pCLFFBQUE7SUFBQSxXQUFBLEdBQWM7QUFDZCxTQUFBLHFCQUFBOztNQUNFLFdBQVcsQ0FBQyxJQUFaLENBQWlCO1FBQUMsT0FBQSxFQUFTLFVBQVY7UUFBc0IsUUFBQSxFQUFVLFFBQWhDO1FBQTBDLFVBQUEsRUFBWSxVQUF0RDtPQUFqQjtBQURGO1dBRUEsS0FBQSxDQUFNLElBQUksQ0FBQyxPQUFYLEVBQW9CLGlCQUFwQixDQUFzQyxDQUFDLFdBQXZDLENBQW1ELG1CQUFBLENBQW9CLFdBQXBCLENBQW5EO0VBSmlCOztFQU9uQixRQUFBLENBQVMsc0NBQVQsRUFBaUQsU0FBQTtJQUMvQyxRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTthQUMxQixRQUFBLENBQVMsd0NBQVQsRUFBbUQsU0FBQTtlQUNqRCxFQUFBLENBQUcsbUJBQUgsRUFBd0IsU0FBQTtBQUN0QixjQUFBO1VBQUEsT0FBQSxHQUFVO1lBQUM7Y0FBQyxPQUFBLEVBQVMsYUFBVjtjQUF5QixRQUFBLEVBQVUsUUFBUSxDQUFDLE1BQTVDO2FBQUQ7O1VBQ1YsS0FBQSxDQUFNLElBQUksQ0FBQyxPQUFYLEVBQW9CLGlCQUFwQixDQUFzQyxDQUFDLFdBQXZDLENBQW1ELG1CQUFBLENBQW9CLE9BQXBCLENBQW5EO2lCQUNBLE1BQUEsQ0FBTyxzQkFBQSxDQUFBLENBQXdCLENBQUMsR0FBekIsQ0FBNkIsRUFBN0IsQ0FBUCxDQUF3QyxDQUFDLE9BQXpDLENBQWlELEVBQWpEO1FBSHNCLENBQXhCO01BRGlELENBQW5EO0lBRDBCLENBQTVCO0lBT0EsUUFBQSxDQUFTLHlCQUFULEVBQW9DLFNBQUE7QUFDbEMsVUFBQTtNQUFBLFNBQUEsR0FBWTtNQUNaLFVBQUEsQ0FBVyxTQUFBO2VBQUcsU0FBQSxHQUFZLHNCQUFBLENBQXVCLFFBQXZCO01BQWYsQ0FBWDtNQUVBLFFBQUEsQ0FBUyxtQkFBQSxHQUFvQixRQUFRLENBQUMsTUFBdEMsRUFBaUQsU0FBQTtlQUMvQyxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTtBQUNwRCxjQUFBO1VBQUEsZ0JBQUEsQ0FBaUIsWUFBakIsRUFBK0IsUUFBUSxDQUFDLE1BQXhDO1VBQ0EsbUJBQUEsR0FBc0IsU0FBUyxDQUFDLEdBQVYsQ0FBYyxxQkFBQSxDQUFzQixZQUF0QixDQUFkO0FBQ3RCO2VBQUEsMEJBQUE7O3lCQUNFLE1BQUEsQ0FBTyxtQkFBb0IsQ0FBQSxVQUFBLENBQTNCLENBQXVDLENBQUMsT0FBeEMsQ0FBZ0QsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLFVBQXBCLENBQWhEO0FBREY7O1FBSG9ELENBQXREO01BRCtDLENBQWpEO01BT0EsUUFBQSxDQUFTLG1CQUFBLEdBQW9CLFFBQVEsQ0FBQyxZQUF0QyxFQUF1RCxTQUFBO2VBQ3JELEVBQUEsQ0FBRyxpREFBSCxFQUFzRCxTQUFBO0FBQ3BELGNBQUE7VUFBQSxnQkFBQSxDQUFpQixrQkFBakIsRUFBcUMsUUFBUSxDQUFDLFlBQTlDO1VBQ0EsbUJBQUEsR0FBc0IsU0FBUyxDQUFDLEdBQVYsQ0FBYyxxQkFBQSxDQUFzQixrQkFBdEIsQ0FBZDtBQUN0QjtlQUFBLGdDQUFBOzt5QkFDRSxNQUFBLENBQU8sbUJBQW9CLENBQUEsVUFBQSxDQUEzQixDQUF1QyxDQUFDLE9BQXhDLENBQWdELENBQUMsQ0FBQyxpQkFBRixDQUFvQixVQUFwQixDQUFoRDtBQURGOztRQUhvRCxDQUF0RDtNQURxRCxDQUF2RDtNQU9BLFFBQUEsQ0FBUyxtQkFBQSxHQUFvQixRQUFRLENBQUMsVUFBdEMsRUFBcUQsU0FBQTtlQUNuRCxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQTtVQUM3QixnQkFBQSxDQUFpQixnQkFBakIsRUFBbUMsUUFBUSxDQUFDLFVBQTVDO2lCQUNBLE1BQUEsQ0FBTyxTQUFTLENBQUMsR0FBVixDQUFjLHFCQUFBLENBQXNCLGdCQUF0QixDQUFkLENBQVAsQ0FBOEQsQ0FBQyxPQUEvRCxDQUF1RSxFQUF2RTtRQUY2QixDQUEvQjtNQURtRCxDQUFyRDthQUtBLFFBQUEsQ0FBUyxtQkFBQSxHQUFvQixRQUFRLENBQUMsZ0JBQXRDLEVBQTJELFNBQUE7ZUFDekQsRUFBQSxDQUFHLDBCQUFILEVBQStCLFNBQUE7VUFDN0IsZ0JBQUEsQ0FBaUIsc0JBQWpCLEVBQXlDLFFBQVEsQ0FBQyxnQkFBbEQ7aUJBQ0EsTUFBQSxDQUFPLFNBQVMsQ0FBQyxHQUFWLENBQWMscUJBQUEsQ0FBc0Isc0JBQXRCLENBQWQsQ0FBUCxDQUFvRSxDQUFDLE9BQXJFLENBQTZFLEVBQTdFO1FBRjZCLENBQS9CO01BRHlELENBQTNEO0lBdkJrQyxDQUFwQztXQTRCQSxRQUFBLENBQVMsbUJBQUEsR0FBb0IsUUFBUSxDQUFDLEtBQTdCLEdBQW1DLE1BQW5DLEdBQXlDLFFBQVEsQ0FBQyxLQUEzRCxFQUFvRSxTQUFBO0FBQ2xFLFVBQUE7TUFBQSxTQUFBLEdBQVk7TUFDWixVQUFBLENBQVcsU0FBQTtlQUFHLFNBQUEsR0FBWSxzQkFBQSxDQUF1QixPQUF2QjtNQUFmLENBQVg7TUFFQSxRQUFBLENBQVMsbUJBQUEsR0FBb0IsUUFBUSxDQUFDLFVBQXRDLEVBQXFELFNBQUE7ZUFDbkQsRUFBQSxDQUFHLGlEQUFILEVBQXNELFNBQUE7QUFDcEQsY0FBQTtVQUFBLGdCQUFBLENBQWlCLGdCQUFqQixFQUFtQyxRQUFRLENBQUMsVUFBNUM7VUFDQSxtQkFBQSxHQUFzQixTQUFTLENBQUMsR0FBVixDQUFjLHFCQUFBLENBQXNCLGdCQUF0QixDQUFkO0FBQ3RCO2VBQUEsOEJBQUE7O3lCQUNFLE1BQUEsQ0FBTyxtQkFBb0IsQ0FBQSxVQUFBLENBQTNCLENBQXVDLENBQUMsT0FBeEMsQ0FBZ0QsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLFVBQXBCLENBQWhEO0FBREY7O1FBSG9ELENBQXREO01BRG1ELENBQXJEO01BT0EsUUFBQSxDQUFTLG1CQUFBLEdBQW9CLFFBQVEsQ0FBQyxnQkFBdEMsRUFBMkQsU0FBQTtlQUN6RCxFQUFBLENBQUcsaURBQUgsRUFBc0QsU0FBQTtBQUNwRCxjQUFBO1VBQUEsZ0JBQUEsQ0FBaUIsc0JBQWpCLEVBQXlDLFFBQVEsQ0FBQyxnQkFBbEQ7VUFDQSxtQkFBQSxHQUFzQixTQUFTLENBQUMsR0FBVixDQUFjLHFCQUFBLENBQXNCLHNCQUF0QixDQUFkO0FBQ3RCO2VBQUEsb0NBQUE7O3lCQUNFLE1BQUEsQ0FBTyxtQkFBb0IsQ0FBQSxVQUFBLENBQTNCLENBQXVDLENBQUMsT0FBeEMsQ0FBZ0QsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLFVBQXBCLENBQWhEO0FBREY7O1FBSG9ELENBQXREO01BRHlELENBQTNEO01BT0EsUUFBQSxDQUFTLG1CQUFBLEdBQW9CLFFBQVEsQ0FBQyxNQUF0QyxFQUFpRCxTQUFBO2VBQy9DLEVBQUEsQ0FBRywwQkFBSCxFQUErQixTQUFBO1VBQzdCLGdCQUFBLENBQWlCLFlBQWpCLEVBQStCLFFBQVEsQ0FBQyxNQUF4QztpQkFDQSxNQUFBLENBQU8sU0FBUyxDQUFDLEdBQVYsQ0FBYyxxQkFBQSxDQUFzQixZQUF0QixDQUFkLENBQVAsQ0FBMEQsQ0FBQyxPQUEzRCxDQUFtRSxFQUFuRTtRQUY2QixDQUEvQjtNQUQrQyxDQUFqRDthQUtBLFFBQUEsQ0FBUyxtQkFBQSxHQUFvQixRQUFRLENBQUMsWUFBdEMsRUFBdUQsU0FBQTtlQUNyRCxFQUFBLENBQUcsMEJBQUgsRUFBK0IsU0FBQTtVQUM3QixnQkFBQSxDQUFpQixrQkFBakIsRUFBcUMsUUFBUSxDQUFDLFlBQTlDO2lCQUNBLE1BQUEsQ0FBTyxTQUFTLENBQUMsR0FBVixDQUFjLHFCQUFBLENBQXNCLGtCQUF0QixDQUFkLENBQVAsQ0FBZ0UsQ0FBQyxPQUFqRSxDQUF5RSxFQUF6RTtRQUY2QixDQUEvQjtNQURxRCxDQUF2RDtJQXZCa0UsQ0FBcEU7RUFwQytDLENBQWpEO0FBakRBIiwic291cmNlc0NvbnRlbnQiOlsiQ29tbWFuZEtleXN0cm9rZUZpbmRlciA9IHJlcXVpcmUgJy4uL2xpYi9jb21tYW5kLWtleXN0cm9rZS1odW1hbml6ZXInXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5zZWxlY3RvciA9XG4gIERhcndpbjogICAgICAgICAgICAgJy5wbGF0Zm9ybS1kYXJ3aW4nXG4gIERhcndpbkVkaXRvcjogICAgICAgJy5wbGF0Zm9ybS1kYXJ3aW4gYXRvbS10ZXh0LWVkaXRvcidcbiAgV2luMzI6ICAgICAgICAgICAgICAnLnBsYXRmb3JtLXdpbjMyJ1xuICBMaW51eDogICAgICAgICAgICAgICcucGxhdGZvcm0tbGludXgnXG4gIFdpbjMyTGludXg6ICAgICAgICAgJy5wbGF0Zm9ybS13aW4zMiwgLnBsYXRmb3JtLWxpbnV4J1xuICBXaW4zMkxpbnV4RWRpdG9yOiAgICcucGxhdGZvcm0td2luMzIgYXRvbS10ZXh0LWVkaXRvciwgLnBsYXRmb3JtLWxpbnV4IGF0b20tdGV4dC1lZGl0b3InXG5cbkRhcndpbktleU1hcCA9XG4gICdjbWQtc2hpZnQtaCc6ICAgICAgJ2dpdC1wbHVzOm1lbnUnXG4gICdjbWQtc2hpZnQtYSBzJzogICAgJ2dpdC1wbHVzOnN0YXR1cydcbiAgJ2NtZC1zaGlmdC1hIHEnOiAgICAnZ2l0LXBsdXM6YWRkLWFuZC1jb21taXQtYW5kLXB1c2gnXG5cbldpbjMyTGludXhLZXlNYXAgPVxuICAnY3RybC1zaGlmdC1oJzogICAgICdnaXQtcGx1czptZW51J1xuICAnY3RybC1zaGlmdC14JzogICAgICdnaXQtcGx1czpjb21taXQnXG4gICdjdHJsLXNoaWZ0LWEgcyc6ICAgJ2dpdC1wbHVzOnN0YXR1cydcbiAgJ2N0cmwtc2hpZnQtYSBxJzogICAnZ2l0LXBsdXM6YWRkLWFuZC1jb21taXQtYW5kLXB1c2gnXG4gICdjdHJsLXNoaWZ0LWEgYSc6ICAgJ2dpdC1wbHVzOmFkZC1hbGwtYW5kLWNvbW1pdCdcbiAgJ2N0cmwtc2hpZnQtYSBwJzogICAnZ2l0LXBsdXM6YWRkLWFsbC1jb21taXQtYW5kLXB1c2gnXG5cbkRhcndpbkVkaXRvcktleU1hcCA9XG4gICdjbWQtc2hpZnQtYSc6ICAgICAgJ2dpdC1wbHVzOmFkZCdcbiAgJ2NtZC1zaGlmdC1hIGMnOiAgICAnZ2l0LXBsdXM6YWRkLWFuZC1jb21taXQnXG5cbldpbjMyTGludXhFZGl0b3JLZXlNYXAgPVxuICAnY3RybC1zaGlmdC1hJzogICAgICdnaXQtcGx1czphZGQnXG4gICdjdHJsLXNoaWZ0LWEgYyc6ICAgJ2dpdC1wbHVzOmFkZC1hbmQtY29tbWl0J1xuXG5nZXRDb21tYW5kc0Zyb21LZXltYXAgPSAoa2V5bWFwKSAtPlxuICBjb21tYW5kcyA9IFtdXG4gIGZvciBrcywgY21kIG9mIGtleW1hcFxuICAgIGNvbW1hbmRzLnB1c2ggW2NtZF1cbiAgY29tbWFuZHNcblxubW9ja0ZpbmRLZXlCaW5kaW5ncyA9IChiaW5kaW5ncykgLT5cbiAgKHtjb21tYW5kfSkgLT5cbiAgICBiaW5kaW5ncy5maWx0ZXIgKGJpbmRpbmcpIC0+IGJpbmRpbmcuY29tbWFuZCBpcyBjb21tYW5kXG5cbnNldHVwS2V5QmluZGluZ3MgPSAoa2V5bWFwcywgc2VsZWN0b3IpLT5cbiAga2V5YmluZGluZ3MgPSBbXVxuICBmb3Iga2V5c3Ryb2tlcywgZ2l0Q29tbWFuZCBvZiBrZXltYXBzXG4gICAga2V5YmluZGluZ3MucHVzaCB7Y29tbWFuZDogZ2l0Q29tbWFuZCwgc2VsZWN0b3I6IHNlbGVjdG9yLCBrZXlzdHJva2VzOiBrZXlzdHJva2VzfVxuICBzcHlPbihhdG9tLmtleW1hcHMsIFwiZmluZEtleUJpbmRpbmdzXCIpLmFuZENhbGxGYWtlKG1vY2tGaW5kS2V5QmluZGluZ3Moa2V5YmluZGluZ3MpKVxuXG5cbmRlc2NyaWJlIFwiR2l0LVBsdXMgY29tbWFuZCBrZXlzdHJva2UgaHVtYW5pemVyXCIsIC0+XG4gIGRlc2NyaWJlIFwiT24gYW55IHBsYXRmb3JtXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIGFuIGVtcHR5IGNvbW1hbmQgbGlzdCBpcyBwcm92aWRlZFwiLCAtPlxuICAgICAgaXQgXCJyZXR1cm5zIGVtcHR5IG1hcFwiLCAtPlxuICAgICAgICBrZXltYXBzID0gW3tjb21tYW5kOiAnY21kLXNoaWZ0LWEnLCBzZWxlY3Rvcjogc2VsZWN0b3IuRGFyd2lufV1cbiAgICAgICAgc3B5T24oYXRvbS5rZXltYXBzLCBcImZpbmRLZXlCaW5kaW5nc1wiKS5hbmRDYWxsRmFrZSBtb2NrRmluZEtleUJpbmRpbmdzKGtleW1hcHMpXG4gICAgICAgIGV4cGVjdChDb21tYW5kS2V5c3Ryb2tlRmluZGVyKCkuZ2V0KFtdKSkudG9FcXVhbCB7fVxuXG4gIGRlc2NyaWJlIFwid2hlbiBwbGF0Zm9ybSBpcyBEYXJ3aW5cIiwgLT5cbiAgICBodW1hbml6ZXIgPSBudWxsXG4gICAgYmVmb3JlRWFjaCAtPiBodW1hbml6ZXIgPSBDb21tYW5kS2V5c3Ryb2tlRmluZGVyKFwiZGFyd2luXCIpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0b3IgaXMgI3tzZWxlY3Rvci5EYXJ3aW59XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBhbGwga2V5c3Ryb2tlcyBpbiBodW1hbml6ZWQgZm9ybVwiLCAtPlxuICAgICAgICBzZXR1cEtleUJpbmRpbmdzKERhcndpbktleU1hcCwgc2VsZWN0b3IuRGFyd2luKVxuICAgICAgICBodW1hbml6ZWRLZXlzdHJva2VzID0gaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoRGFyd2luS2V5TWFwKSlcbiAgICAgICAgZm9yIGtleXN0cm9rZXMsIGdpdENvbW1hbmQgb2YgRGFyd2luS2V5TWFwXG4gICAgICAgICAgZXhwZWN0KGh1bWFuaXplZEtleXN0cm9rZXNbZ2l0Q29tbWFuZF0pLnRvRXF1YWwoXy5odW1hbml6ZUtleXN0cm9rZShrZXlzdHJva2VzKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3RvciBpcyAje3NlbGVjdG9yLkRhcndpbkVkaXRvcn1cIiAsIC0+XG4gICAgICBpdCBcIml0IG11c3QgcmV0dXJuIGFsbCBrZXlzdHJva2VzIGluIGh1bWFuaXplZCBmb3JtXCIsIC0+XG4gICAgICAgIHNldHVwS2V5QmluZGluZ3MoRGFyd2luRWRpdG9yS2V5TWFwLCBzZWxlY3Rvci5EYXJ3aW5FZGl0b3IpXG4gICAgICAgIGh1bWFuaXplZEtleXN0cm9rZXMgPSBodW1hbml6ZXIuZ2V0KGdldENvbW1hbmRzRnJvbUtleW1hcChEYXJ3aW5FZGl0b3JLZXlNYXApKVxuICAgICAgICBmb3Iga2V5c3Ryb2tlcywgZ2l0Q29tbWFuZCBvZiBEYXJ3aW5FZGl0b3JLZXlNYXBcbiAgICAgICAgICBleHBlY3QoaHVtYW5pemVkS2V5c3Ryb2tlc1tnaXRDb21tYW5kXSkudG9FcXVhbChfLmh1bWFuaXplS2V5c3Ryb2tlKGtleXN0cm9rZXMpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHNlbGVjdG9yIGlzICN7c2VsZWN0b3IuV2luMzJMaW51eH1cIiAsIC0+XG4gICAgICBpdCBcIml0IG11c3QgcmV0dXJuIGVtcHR5IG1hcFwiLCAtPlxuICAgICAgICBzZXR1cEtleUJpbmRpbmdzKFdpbjMyTGludXhLZXlNYXAsIHNlbGVjdG9yLldpbjMyTGludXgpXG4gICAgICAgIGV4cGVjdChodW1hbml6ZXIuZ2V0KGdldENvbW1hbmRzRnJvbUtleW1hcChXaW4zMkxpbnV4S2V5TWFwKSkpLnRvRXF1YWwge31cblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3RvciBpcyAje3NlbGVjdG9yLldpbjMyTGludXhFZGl0b3J9XCIgLCAtPlxuICAgICAgaXQgXCJpdCBtdXN0IHJldHVybiBlbXB0eSBtYXBcIiwgLT5cbiAgICAgICAgc2V0dXBLZXlCaW5kaW5ncyhXaW4zMkxpbnV4RWRpdG9yS2V5TWFwLCBzZWxlY3Rvci5XaW4zMkxpbnV4RWRpdG9yKVxuICAgICAgICBleHBlY3QoaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoV2luMzJMaW51eEVkaXRvcktleU1hcCkpKS50b0VxdWFsIHt9XG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHBsYXRmb3JtIGlzICN7c2VsZWN0b3IuV2luMzJ9IG9yICN7c2VsZWN0b3IuTGludXh9XCIsIC0+XG4gICAgaHVtYW5pemVyID0gbnVsbFxuICAgIGJlZm9yZUVhY2ggLT4gaHVtYW5pemVyID0gQ29tbWFuZEtleXN0cm9rZUZpbmRlcihcIndpbjMyXCIpXG5cbiAgICBkZXNjcmliZSBcIndoZW4gc2VsZWN0b3IgaXMgI3tzZWxlY3Rvci5XaW4zMkxpbnV4fVwiICwgLT5cbiAgICAgIGl0IFwiaXQgbXVzdCByZXR1cm4gYWxsIGtleXN0cm9rZXMgaW4gaHVtYW5pemVkIGZvcm1cIiwgLT5cbiAgICAgICAgc2V0dXBLZXlCaW5kaW5ncyhXaW4zMkxpbnV4S2V5TWFwLCBzZWxlY3Rvci5XaW4zMkxpbnV4KVxuICAgICAgICBodW1hbml6ZWRLZXlzdHJva2VzID0gaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoV2luMzJMaW51eEtleU1hcCkpXG4gICAgICAgIGZvciBrZXlzdHJva2VzLCBnaXRDb21tYW5kIG9mIFdpbjMyTGludXhLZXlNYXBcbiAgICAgICAgICBleHBlY3QoaHVtYW5pemVkS2V5c3Ryb2tlc1tnaXRDb21tYW5kXSkudG9FcXVhbChfLmh1bWFuaXplS2V5c3Ryb2tlKGtleXN0cm9rZXMpKVxuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHNlbGVjdG9yIGlzICN7c2VsZWN0b3IuV2luMzJMaW51eEVkaXRvcn1cIiAsIC0+XG4gICAgICBpdCBcIml0IG11c3QgcmV0dXJuIGFsbCBrZXlzdHJva2VzIGluIGh1bWFuaXplZCBmb3JtXCIsIC0+XG4gICAgICAgIHNldHVwS2V5QmluZGluZ3MoV2luMzJMaW51eEVkaXRvcktleU1hcCwgc2VsZWN0b3IuV2luMzJMaW51eEVkaXRvcilcbiAgICAgICAgaHVtYW5pemVkS2V5c3Ryb2tlcyA9IGh1bWFuaXplci5nZXQoZ2V0Q29tbWFuZHNGcm9tS2V5bWFwKFdpbjMyTGludXhFZGl0b3JLZXlNYXApKVxuICAgICAgICBmb3Iga2V5c3Ryb2tlcywgZ2l0Q29tbWFuZCBvZiBXaW4zMkxpbnV4RWRpdG9yS2V5TWFwXG4gICAgICAgICAgZXhwZWN0KGh1bWFuaXplZEtleXN0cm9rZXNbZ2l0Q29tbWFuZF0pLnRvRXF1YWwoXy5odW1hbml6ZUtleXN0cm9rZShrZXlzdHJva2VzKSlcblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3RvciBpcyAje3NlbGVjdG9yLkRhcndpbn1cIiAsIC0+XG4gICAgICBpdCBcIml0IG11c3QgcmV0dXJuIGVtcHR5IG1hcFwiLCAtPlxuICAgICAgICBzZXR1cEtleUJpbmRpbmdzKERhcndpbktleU1hcCwgc2VsZWN0b3IuRGFyd2luKVxuICAgICAgICBleHBlY3QoaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoRGFyd2luS2V5TWFwKSkpLnRvRXF1YWwge31cblxuICAgIGRlc2NyaWJlIFwid2hlbiBzZWxlY3RvciBpcyAje3NlbGVjdG9yLkRhcndpbkVkaXRvcn1cIiAsIC0+XG4gICAgICBpdCBcIml0IG11c3QgcmV0dXJuIGVtcHR5IG1hcFwiLCAtPlxuICAgICAgICBzZXR1cEtleUJpbmRpbmdzKERhcndpbkVkaXRvcktleU1hcCwgc2VsZWN0b3IuRGFyd2luRWRpdG9yKVxuICAgICAgICBleHBlY3QoaHVtYW5pemVyLmdldChnZXRDb21tYW5kc0Zyb21LZXltYXAoRGFyd2luRWRpdG9yS2V5TWFwKSkpLnRvRXF1YWwge31cbiJdfQ==
