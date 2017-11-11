(function() {
  var CompositeDisposable, basicConfig, config;

  CompositeDisposable = require("atom").CompositeDisposable;

  config = require("./config");

  basicConfig = require("./config-basic");

  module.exports = {
    config: basicConfig,
    modules: {},
    disposables: null,
    activate: function() {
      this.disposables = new CompositeDisposable();
      this.registerWorkspaceCommands();
      return this.registerEditorCommands();
    },
    deactivate: function() {
      var ref;
      if ((ref = this.disposables) != null) {
        ref.dispose();
      }
      this.disposables = null;
      return this.modules = {};
    },
    registerWorkspaceCommands: function() {
      var workspaceCommands;
      workspaceCommands = {};
      ["draft", "post"].forEach((function(_this) {
        return function(file) {
          return workspaceCommands["markdown-writer:new-" + file] = _this.registerView("./views/new-" + file + "-view", {
            optOutGrammars: true
          });
        };
      })(this));
      ["open-cheat-sheet", "create-default-keymaps", "create-project-configs"].forEach((function(_this) {
        return function(command) {
          return workspaceCommands["markdown-writer:" + command] = _this.registerCommand("./commands/" + command, {
            optOutGrammars: true
          });
        };
      })(this));
      return this.disposables.add(atom.commands.add("atom-workspace", workspaceCommands));
    },
    registerEditorCommands: function() {
      var editorCommands;
      editorCommands = {};
      ["tags", "categories"].forEach((function(_this) {
        return function(attr) {
          return editorCommands["markdown-writer:manage-post-" + attr] = _this.registerView("./views/manage-post-" + attr + "-view");
        };
      })(this));
      ["link", "footnote", "image", "table"].forEach((function(_this) {
        return function(media) {
          return editorCommands["markdown-writer:insert-" + media] = _this.registerView("./views/insert-" + media + "-view");
        };
      })(this));
      ["code", "codeblock", "bold", "italic", "keystroke", "strikethrough"].forEach((function(_this) {
        return function(style) {
          return editorCommands["markdown-writer:toggle-" + style + "-text"] = _this.registerCommand("./commands/style-text", {
            args: style
          });
        };
      })(this));
      ["h1", "h2", "h3", "h4", "h5", "ul", "ol", "task", "taskdone", "blockquote"].forEach((function(_this) {
        return function(style) {
          return editorCommands["markdown-writer:toggle-" + style] = _this.registerCommand("./commands/style-line", {
            args: style
          });
        };
      })(this));
      ["previous-heading", "next-heading", "next-table-cell", "reference-definition"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:jump-to-" + command] = _this.registerCommand("./commands/jump-to", {
            args: command
          });
        };
      })(this));
      ["insert-new-line", "indent-list-line"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:" + command] = _this.registerCommand("./commands/edit-line", {
            args: command,
            skipList: ["autocomplete-active"]
          });
        };
      })(this));
      ["correct-order-list-numbers", "format-table"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:" + command] = _this.registerCommand("./commands/format-text", {
            args: command
          });
        };
      })(this));
      ["publish-draft", "open-link-in-browser"].forEach((function(_this) {
        return function(command) {
          return editorCommands["markdown-writer:" + command] = _this.registerCommand("./commands/" + command);
        };
      })(this));
      return this.disposables.add(atom.commands.add("atom-text-editor", editorCommands));
    },
    registerView: function(path, options) {
      if (options == null) {
        options = {};
      }
      return (function(_this) {
        return function(e) {
          var base, moduleInstance;
          if ((options.optOutGrammars || _this.isMarkdown()) && !_this.inSkipList(options.skipList)) {
            if ((base = _this.modules)[path] == null) {
              base[path] = require(path);
            }
            moduleInstance = new _this.modules[path](options.args);
            if (config.get("_skipAction") == null) {
              return moduleInstance.display();
            }
          } else {
            return e.abortKeyBinding();
          }
        };
      })(this);
    },
    registerCommand: function(path, options) {
      if (options == null) {
        options = {};
      }
      return (function(_this) {
        return function(e) {
          var base, moduleInstance;
          if ((options.optOutGrammars || _this.isMarkdown()) && !_this.inSkipList(options.skipList)) {
            if ((base = _this.modules)[path] == null) {
              base[path] = require(path);
            }
            moduleInstance = new _this.modules[path](options.args);
            if (config.get("_skipAction") == null) {
              return moduleInstance.trigger(e);
            }
          } else {
            return e.abortKeyBinding();
          }
        };
      })(this);
    },
    isMarkdown: function() {
      var editor, grammars;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return false;
      }
      grammars = config.get("grammars") || [];
      return grammars.indexOf(editor.getGrammar().scopeName) >= 0;
    },
    inSkipList: function(list) {
      var editorElement;
      if (list == null) {
        return false;
      }
      editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
      if (!((editorElement != null) && (editorElement.classList != null))) {
        return false;
      }
      return list.every(function(className) {
        return editorElement.classList.contains(className);
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9tYXJrZG93bi13cml0ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsV0FBUjtJQUVBLE9BQUEsRUFBUyxFQUZUO0lBR0EsV0FBQSxFQUFhLElBSGI7SUFLQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQTtNQUVuQixJQUFDLENBQUEseUJBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUFBO0lBSlEsQ0FMVjtJQVdBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBWSxDQUFFLE9BQWQsQ0FBQTs7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO2FBQ2YsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUhELENBWFo7SUFnQkEseUJBQUEsRUFBMkIsU0FBQTtBQUN6QixVQUFBO01BQUEsaUJBQUEsR0FBb0I7TUFFcEIsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUFpQixDQUFDLE9BQWxCLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUN4QixpQkFBa0IsQ0FBQSxzQkFBQSxHQUF1QixJQUF2QixDQUFsQixHQUNFLEtBQUMsQ0FBQSxZQUFELENBQWMsY0FBQSxHQUFlLElBQWYsR0FBb0IsT0FBbEMsRUFBMEM7WUFBQSxjQUFBLEVBQWdCLElBQWhCO1dBQTFDO1FBRnNCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtNQUlBLENBQUMsa0JBQUQsRUFBcUIsd0JBQXJC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ckMsQ0FBQSxJQUFtRDtJQUxoRCxDQXpGWjtJQWdHQSxVQUFBLEVBQVksU0FBQyxJQUFEO0FBQ1YsVUFBQTtNQUFBLElBQW9CLFlBQXBCO0FBQUEsZUFBTyxNQUFQOztNQUNBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFuQjtNQUNoQixJQUFBLENBQUEsQ0FBb0IsdUJBQUEsSUFBa0IsaUNBQXRDLENBQUE7QUFBQSxlQUFPLE1BQVA7O0FBQ0EsYUFBTyxJQUFJLENBQUMsS0FBTCxDQUFXLFNBQUMsU0FBRDtlQUFlLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsU0FBakM7TUFBZixDQUFYO0lBSkcsQ0FoR1o7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlIFwiYXRvbVwiXG5cbmNvbmZpZyA9IHJlcXVpcmUgXCIuL2NvbmZpZ1wiXG5iYXNpY0NvbmZpZyA9IHJlcXVpcmUgXCIuL2NvbmZpZy1iYXNpY1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY29uZmlnOiBiYXNpY0NvbmZpZ1xuXG4gIG1vZHVsZXM6IHt9ICMgVG8gY2FjaGUgcmVxdWlyZWQgbW9kdWxlc1xuICBkaXNwb3NhYmxlczogbnVsbCAjIENvbXBvc2l0ZSBkaXNwb3NhYmxlXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgQHJlZ2lzdGVyV29ya3NwYWNlQ29tbWFuZHMoKVxuICAgIEByZWdpc3RlckVkaXRvckNvbW1hbmRzKClcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuICAgIEBtb2R1bGVzID0ge31cblxuICByZWdpc3RlcldvcmtzcGFjZUNvbW1hbmRzOiAtPlxuICAgIHdvcmtzcGFjZUNvbW1hbmRzID0ge31cblxuICAgIFtcImRyYWZ0XCIsIFwicG9zdFwiXS5mb3JFYWNoIChmaWxlKSA9PlxuICAgICAgd29ya3NwYWNlQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6bmV3LSN7ZmlsZX1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJWaWV3KFwiLi92aWV3cy9uZXctI3tmaWxlfS12aWV3XCIsIG9wdE91dEdyYW1tYXJzOiB0cnVlKVxuXG4gICAgW1wib3Blbi1jaGVhdC1zaGVldFwiLCBcImNyZWF0ZS1kZWZhdWx0LWtleW1hcHNcIixcbiAgICAgXCJjcmVhdGUtcHJvamVjdC1jb25maWdzXCJdLmZvckVhY2ggKGNvbW1hbmQpID0+XG4gICAgICB3b3Jrc3BhY2VDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjoje2NvbW1hbmR9XCJdID1cbiAgICAgICAgQHJlZ2lzdGVyQ29tbWFuZChcIi4vY29tbWFuZHMvI3tjb21tYW5kfVwiLCBvcHRPdXRHcmFtbWFyczogdHJ1ZSlcblxuICAgIEBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB3b3Jrc3BhY2VDb21tYW5kcykpXG5cbiAgcmVnaXN0ZXJFZGl0b3JDb21tYW5kczogLT5cbiAgICBlZGl0b3JDb21tYW5kcyA9IHt9XG5cbiAgICBbXCJ0YWdzXCIsIFwiY2F0ZWdvcmllc1wiXS5mb3JFYWNoIChhdHRyKSA9PlxuICAgICAgZWRpdG9yQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6bWFuYWdlLXBvc3QtI3thdHRyfVwiXSA9XG4gICAgICAgIEByZWdpc3RlclZpZXcoXCIuL3ZpZXdzL21hbmFnZS1wb3N0LSN7YXR0cn0tdmlld1wiKVxuXG4gICAgW1wibGlua1wiLCBcImZvb3Rub3RlXCIsIFwiaW1hZ2VcIiwgXCJ0YWJsZVwiXS5mb3JFYWNoIChtZWRpYSkgPT5cbiAgICAgIGVkaXRvckNvbW1hbmRzW1wibWFya2Rvd24td3JpdGVyOmluc2VydC0je21lZGlhfVwiXSA9XG4gICAgICAgIEByZWdpc3RlclZpZXcoXCIuL3ZpZXdzL2luc2VydC0je21lZGlhfS12aWV3XCIpXG5cbiAgICBbXCJjb2RlXCIsIFwiY29kZWJsb2NrXCIsIFwiYm9sZFwiLCBcIml0YWxpY1wiLFxuICAgICBcImtleXN0cm9rZVwiLCBcInN0cmlrZXRocm91Z2hcIl0uZm9yRWFjaCAoc3R5bGUpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjp0b2dnbGUtI3tzdHlsZX0tdGV4dFwiXSA9XG4gICAgICAgIEByZWdpc3RlckNvbW1hbmQoXCIuL2NvbW1hbmRzL3N0eWxlLXRleHRcIiwgYXJnczogc3R5bGUpXG5cbiAgICBbXCJoMVwiLCBcImgyXCIsIFwiaDNcIiwgXCJoNFwiLCBcImg1XCIsIFwidWxcIiwgXCJvbFwiLFxuICAgICBcInRhc2tcIiwgXCJ0YXNrZG9uZVwiLCBcImJsb2NrcXVvdGVcIl0uZm9yRWFjaCAoc3R5bGUpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjp0b2dnbGUtI3tzdHlsZX1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJDb21tYW5kKFwiLi9jb21tYW5kcy9zdHlsZS1saW5lXCIsIGFyZ3M6IHN0eWxlKVxuXG4gICAgW1wicHJldmlvdXMtaGVhZGluZ1wiLCBcIm5leHQtaGVhZGluZ1wiLCBcIm5leHQtdGFibGUtY2VsbFwiLFxuICAgICBcInJlZmVyZW5jZS1kZWZpbml0aW9uXCJdLmZvckVhY2ggKGNvbW1hbmQpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjpqdW1wLXRvLSN7Y29tbWFuZH1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJDb21tYW5kKFwiLi9jb21tYW5kcy9qdW1wLXRvXCIsIGFyZ3M6IGNvbW1hbmQpXG5cbiAgICBbXCJpbnNlcnQtbmV3LWxpbmVcIiwgXCJpbmRlbnQtbGlzdC1saW5lXCJdLmZvckVhY2ggKGNvbW1hbmQpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjoje2NvbW1hbmR9XCJdID1cbiAgICAgICAgQHJlZ2lzdGVyQ29tbWFuZChcIi4vY29tbWFuZHMvZWRpdC1saW5lXCIsXG4gICAgICAgICAgYXJnczogY29tbWFuZCwgc2tpcExpc3Q6IFtcImF1dG9jb21wbGV0ZS1hY3RpdmVcIl0pXG5cbiAgICBbXCJjb3JyZWN0LW9yZGVyLWxpc3QtbnVtYmVyc1wiLCBcImZvcm1hdC10YWJsZVwiXS5mb3JFYWNoIChjb21tYW5kKSA9PlxuICAgICAgZWRpdG9yQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6I3tjb21tYW5kfVwiXSA9XG4gICAgICAgIEByZWdpc3RlckNvbW1hbmQoXCIuL2NvbW1hbmRzL2Zvcm1hdC10ZXh0XCIsIGFyZ3M6IGNvbW1hbmQpXG5cbiAgICBbXCJwdWJsaXNoLWRyYWZ0XCIsIFwib3Blbi1saW5rLWluLWJyb3dzZXJcIl0uZm9yRWFjaCAoY29tbWFuZCkgPT5cbiAgICAgIGVkaXRvckNvbW1hbmRzW1wibWFya2Rvd24td3JpdGVyOiN7Y29tbWFuZH1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJDb21tYW5kKFwiLi9jb21tYW5kcy8je2NvbW1hbmR9XCIpXG5cbiAgICBAZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFwiYXRvbS10ZXh0LWVkaXRvclwiLCBlZGl0b3JDb21tYW5kcykpXG5cbiAgcmVnaXN0ZXJWaWV3OiAocGF0aCwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIChlKSA9PlxuICAgICAgaWYgKG9wdGlvbnMub3B0T3V0R3JhbW1hcnMgfHwgQGlzTWFya2Rvd24oKSkgJiYgIUBpblNraXBMaXN0KG9wdGlvbnMuc2tpcExpc3QpXG4gICAgICAgIEBtb2R1bGVzW3BhdGhdID89IHJlcXVpcmUocGF0aClcbiAgICAgICAgbW9kdWxlSW5zdGFuY2UgPSBuZXcgQG1vZHVsZXNbcGF0aF0ob3B0aW9ucy5hcmdzKVxuICAgICAgICBtb2R1bGVJbnN0YW5jZS5kaXNwbGF5KCkgdW5sZXNzIGNvbmZpZy5nZXQoXCJfc2tpcEFjdGlvblwiKT9cbiAgICAgIGVsc2VcbiAgICAgICAgZS5hYm9ydEtleUJpbmRpbmcoKVxuXG4gIHJlZ2lzdGVyQ29tbWFuZDogKHBhdGgsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICAoZSkgPT5cbiAgICAgIGlmIChvcHRpb25zLm9wdE91dEdyYW1tYXJzIHx8IEBpc01hcmtkb3duKCkpICYmICFAaW5Ta2lwTGlzdChvcHRpb25zLnNraXBMaXN0KVxuICAgICAgICBAbW9kdWxlc1twYXRoXSA/PSByZXF1aXJlKHBhdGgpXG4gICAgICAgIG1vZHVsZUluc3RhbmNlID0gbmV3IEBtb2R1bGVzW3BhdGhdKG9wdGlvbnMuYXJncylcbiAgICAgICAgbW9kdWxlSW5zdGFuY2UudHJpZ2dlcihlKSB1bmxlc3MgY29uZmlnLmdldChcIl9za2lwQWN0aW9uXCIpP1xuICAgICAgZWxzZVxuICAgICAgICBlLmFib3J0S2V5QmluZGluZygpXG5cbiAgaXNNYXJrZG93bjogLT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGVkaXRvcj9cblxuICAgIGdyYW1tYXJzID0gY29uZmlnLmdldChcImdyYW1tYXJzXCIpIHx8IFtdXG4gICAgcmV0dXJuIGdyYW1tYXJzLmluZGV4T2YoZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpID49IDBcblxuICBpblNraXBMaXN0OiAobGlzdCkgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGxpc3Q/XG4gICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkpXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBlZGl0b3JFbGVtZW50PyAmJiBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdD9cbiAgICByZXR1cm4gbGlzdC5ldmVyeSAoY2xhc3NOYW1lKSAtPiBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpXG4iXX0=
