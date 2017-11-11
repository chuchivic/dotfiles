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
      ["link", "footnote", "image-file", "image-clipboard", "table"].forEach((function(_this) {
        return function(media) {
          return editorCommands["markdown-writer:insert-" + media] = _this.registerView("./views/insert-" + media + "-view");
        };
      })(this));
      ["code", "codeblock", "bold", "italic", "strikethrough", "keystroke"].forEach((function(_this) {
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
      ["publish-draft", "open-link-in-browser", "insert-image"].forEach((function(_this) {
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
              return moduleInstance.display(e);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9tYXJrZG93bi13cml0ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7RUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsV0FBUjtJQUVBLE9BQUEsRUFBUyxFQUZUO0lBR0EsV0FBQSxFQUFhLElBSGI7SUFLQSxRQUFBLEVBQVUsU0FBQTtNQUNSLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQTtNQUVuQixJQUFDLENBQUEseUJBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxzQkFBRCxDQUFBO0lBSlEsQ0FMVjtJQVdBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBWSxDQUFFLE9BQWQsQ0FBQTs7TUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlO2FBQ2YsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUhELENBWFo7SUFnQkEseUJBQUEsRUFBMkIsU0FBQTtBQUN6QixVQUFBO01BQUEsaUJBQUEsR0FBb0I7TUFFcEIsQ0FBQyxPQUFELEVBQVUsTUFBVixDQUFpQixDQUFDLE9BQWxCLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO2lCQUN4QixpQkFBa0IsQ0FBQSxzQkFBQSxHQUF1QixJQUF2QixDQUFsQixHQUNFLEtBQUMsQ0FBQSxZQUFELENBQWMsY0FBQSxHQUFlLElBQWYsR0FBb0IsT0FBbEMsRUFBMEM7WUFBQSxjQUFBLEVBQWdCLElBQWhCO1dBQTFDO1FBRnNCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUExQjtNQUlBLENBQUMsa0JBQUQsRUFBcUIsd0JBQXJC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QUFULENBQWlCLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUFyQyxDQUFBLElBQW1EO0lBTGhELENBckZaO0lBNEZBLFVBQUEsRUFBWSxTQUFDLElBQUQ7QUFDVixVQUFBO01BQUEsSUFBb0IsWUFBcEI7QUFBQSxlQUFPLE1BQVA7O01BQ0EsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBLENBQW5CO01BQ2hCLElBQUEsQ0FBQSxDQUFvQix1QkFBQSxJQUFrQixpQ0FBdEMsQ0FBQTtBQUFBLGVBQU8sTUFBUDs7QUFDQSxhQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBQyxTQUFEO2VBQWUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxTQUFqQztNQUFmLENBQVg7SUFKRyxDQTVGWjs7QUFORiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgXCJhdG9tXCJcblxuY29uZmlnID0gcmVxdWlyZSBcIi4vY29uZmlnXCJcbmJhc2ljQ29uZmlnID0gcmVxdWlyZSBcIi4vY29uZmlnLWJhc2ljXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6IGJhc2ljQ29uZmlnXG5cbiAgbW9kdWxlczoge30gIyBUbyBjYWNoZSByZXF1aXJlZCBtb2R1bGVzXG4gIGRpc3Bvc2FibGVzOiBudWxsICMgQ29tcG9zaXRlIGRpc3Bvc2FibGVcblxuICBhY3RpdmF0ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAcmVnaXN0ZXJXb3Jrc3BhY2VDb21tYW5kcygpXG4gICAgQHJlZ2lzdGVyRWRpdG9yQ29tbWFuZHMoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMgPSBudWxsXG4gICAgQG1vZHVsZXMgPSB7fVxuXG4gIHJlZ2lzdGVyV29ya3NwYWNlQ29tbWFuZHM6IC0+XG4gICAgd29ya3NwYWNlQ29tbWFuZHMgPSB7fVxuXG4gICAgW1wiZHJhZnRcIiwgXCJwb3N0XCJdLmZvckVhY2ggKGZpbGUpID0+XG4gICAgICB3b3Jrc3BhY2VDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjpuZXctI3tmaWxlfVwiXSA9XG4gICAgICAgIEByZWdpc3RlclZpZXcoXCIuL3ZpZXdzL25ldy0je2ZpbGV9LXZpZXdcIiwgb3B0T3V0R3JhbW1hcnM6IHRydWUpXG5cbiAgICBbXCJvcGVuLWNoZWF0LXNoZWV0XCIsIFwiY3JlYXRlLWRlZmF1bHQta2V5bWFwc1wiLCBcImNyZWF0ZS1wcm9qZWN0LWNvbmZpZ3NcIl0uZm9yRWFjaCAoY29tbWFuZCkgPT5cbiAgICAgIHdvcmtzcGFjZUNvbW1hbmRzW1wibWFya2Rvd24td3JpdGVyOiN7Y29tbWFuZH1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJDb21tYW5kKFwiLi9jb21tYW5kcy8je2NvbW1hbmR9XCIsIG9wdE91dEdyYW1tYXJzOiB0cnVlKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHdvcmtzcGFjZUNvbW1hbmRzKSlcblxuICByZWdpc3RlckVkaXRvckNvbW1hbmRzOiAtPlxuICAgIGVkaXRvckNvbW1hbmRzID0ge31cblxuICAgIFtcInRhZ3NcIiwgXCJjYXRlZ29yaWVzXCJdLmZvckVhY2ggKGF0dHIpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjptYW5hZ2UtcG9zdC0je2F0dHJ9XCJdID1cbiAgICAgICAgQHJlZ2lzdGVyVmlldyhcIi4vdmlld3MvbWFuYWdlLXBvc3QtI3thdHRyfS12aWV3XCIpXG5cbiAgICBbXCJsaW5rXCIsIFwiZm9vdG5vdGVcIiwgXCJpbWFnZS1maWxlXCIsIFwiaW1hZ2UtY2xpcGJvYXJkXCIsIFwidGFibGVcIl0uZm9yRWFjaCAobWVkaWEpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjppbnNlcnQtI3ttZWRpYX1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJWaWV3KFwiLi92aWV3cy9pbnNlcnQtI3ttZWRpYX0tdmlld1wiKVxuXG4gICAgW1wiY29kZVwiLCBcImNvZGVibG9ja1wiLCBcImJvbGRcIiwgXCJpdGFsaWNcIiwgXCJzdHJpa2V0aHJvdWdoXCIsIFwia2V5c3Ryb2tlXCJdLmZvckVhY2ggKHN0eWxlKSA9PlxuICAgICAgZWRpdG9yQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6dG9nZ2xlLSN7c3R5bGV9LXRleHRcIl0gPVxuICAgICAgICBAcmVnaXN0ZXJDb21tYW5kKFwiLi9jb21tYW5kcy9zdHlsZS10ZXh0XCIsIGFyZ3M6IHN0eWxlKVxuXG4gICAgW1wiaDFcIiwgXCJoMlwiLCBcImgzXCIsIFwiaDRcIiwgXCJoNVwiLCBcInVsXCIsIFwib2xcIiwgXCJ0YXNrXCIsIFwidGFza2RvbmVcIiwgXCJibG9ja3F1b3RlXCJdLmZvckVhY2ggKHN0eWxlKSA9PlxuICAgICAgZWRpdG9yQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6dG9nZ2xlLSN7c3R5bGV9XCJdID1cbiAgICAgICAgQHJlZ2lzdGVyQ29tbWFuZChcIi4vY29tbWFuZHMvc3R5bGUtbGluZVwiLCBhcmdzOiBzdHlsZSlcblxuICAgIFtcInByZXZpb3VzLWhlYWRpbmdcIiwgXCJuZXh0LWhlYWRpbmdcIiwgXCJuZXh0LXRhYmxlLWNlbGxcIiwgXCJyZWZlcmVuY2UtZGVmaW5pdGlvblwiXS5mb3JFYWNoIChjb21tYW5kKSA9PlxuICAgICAgZWRpdG9yQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6anVtcC10by0je2NvbW1hbmR9XCJdID1cbiAgICAgICAgQHJlZ2lzdGVyQ29tbWFuZChcIi4vY29tbWFuZHMvanVtcC10b1wiLCBhcmdzOiBjb21tYW5kKVxuXG4gICAgW1wiaW5zZXJ0LW5ldy1saW5lXCIsIFwiaW5kZW50LWxpc3QtbGluZVwiXS5mb3JFYWNoIChjb21tYW5kKSA9PlxuICAgICAgZWRpdG9yQ29tbWFuZHNbXCJtYXJrZG93bi13cml0ZXI6I3tjb21tYW5kfVwiXSA9XG4gICAgICAgIEByZWdpc3RlckNvbW1hbmQoXCIuL2NvbW1hbmRzL2VkaXQtbGluZVwiLFxuICAgICAgICAgIGFyZ3M6IGNvbW1hbmQsIHNraXBMaXN0OiBbXCJhdXRvY29tcGxldGUtYWN0aXZlXCJdKVxuXG4gICAgW1wiY29ycmVjdC1vcmRlci1saXN0LW51bWJlcnNcIiwgXCJmb3JtYXQtdGFibGVcIl0uZm9yRWFjaCAoY29tbWFuZCkgPT5cbiAgICAgIGVkaXRvckNvbW1hbmRzW1wibWFya2Rvd24td3JpdGVyOiN7Y29tbWFuZH1cIl0gPVxuICAgICAgICBAcmVnaXN0ZXJDb21tYW5kKFwiLi9jb21tYW5kcy9mb3JtYXQtdGV4dFwiLCBhcmdzOiBjb21tYW5kKVxuXG4gICAgW1wicHVibGlzaC1kcmFmdFwiLCBcIm9wZW4tbGluay1pbi1icm93c2VyXCIsIFwiaW5zZXJ0LWltYWdlXCJdLmZvckVhY2ggKGNvbW1hbmQpID0+XG4gICAgICBlZGl0b3JDb21tYW5kc1tcIm1hcmtkb3duLXdyaXRlcjoje2NvbW1hbmR9XCJdID1cbiAgICAgICAgQHJlZ2lzdGVyQ29tbWFuZChcIi4vY29tbWFuZHMvI3tjb21tYW5kfVwiKVxuXG4gICAgQGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcImF0b20tdGV4dC1lZGl0b3JcIiwgZWRpdG9yQ29tbWFuZHMpKVxuXG4gIHJlZ2lzdGVyVmlldzogKHBhdGgsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICAoZSkgPT5cbiAgICAgIGlmIChvcHRpb25zLm9wdE91dEdyYW1tYXJzIHx8IEBpc01hcmtkb3duKCkpICYmICFAaW5Ta2lwTGlzdChvcHRpb25zLnNraXBMaXN0KVxuICAgICAgICBAbW9kdWxlc1twYXRoXSA/PSByZXF1aXJlKHBhdGgpXG4gICAgICAgIG1vZHVsZUluc3RhbmNlID0gbmV3IEBtb2R1bGVzW3BhdGhdKG9wdGlvbnMuYXJncylcbiAgICAgICAgbW9kdWxlSW5zdGFuY2UuZGlzcGxheShlKSB1bmxlc3MgY29uZmlnLmdldChcIl9za2lwQWN0aW9uXCIpP1xuICAgICAgZWxzZVxuICAgICAgICBlLmFib3J0S2V5QmluZGluZygpXG5cbiAgcmVnaXN0ZXJDb21tYW5kOiAocGF0aCwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIChlKSA9PlxuICAgICAgaWYgKG9wdGlvbnMub3B0T3V0R3JhbW1hcnMgfHwgQGlzTWFya2Rvd24oKSkgJiYgIUBpblNraXBMaXN0KG9wdGlvbnMuc2tpcExpc3QpXG4gICAgICAgIEBtb2R1bGVzW3BhdGhdID89IHJlcXVpcmUocGF0aClcbiAgICAgICAgbW9kdWxlSW5zdGFuY2UgPSBuZXcgQG1vZHVsZXNbcGF0aF0ob3B0aW9ucy5hcmdzKVxuICAgICAgICBtb2R1bGVJbnN0YW5jZS50cmlnZ2VyKGUpIHVubGVzcyBjb25maWcuZ2V0KFwiX3NraXBBY3Rpb25cIik/XG4gICAgICBlbHNlXG4gICAgICAgIGUuYWJvcnRLZXlCaW5kaW5nKClcblxuICBpc01hcmtkb3duOiAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZWRpdG9yP1xuXG4gICAgZ3JhbW1hcnMgPSBjb25maWcuZ2V0KFwiZ3JhbW1hcnNcIikgfHwgW11cbiAgICByZXR1cm4gZ3JhbW1hcnMuaW5kZXhPZihlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgPj0gMFxuXG4gIGluU2tpcExpc3Q6IChsaXN0KSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgbGlzdD9cbiAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGVkaXRvckVsZW1lbnQ/ICYmIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0P1xuICAgIHJldHVybiBsaXN0LmV2ZXJ5IChjbGFzc05hbWUpIC0+IGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSlcbiJdfQ==
