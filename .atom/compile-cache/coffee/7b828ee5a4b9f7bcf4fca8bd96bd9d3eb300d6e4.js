(function() {
  var Command, CommandError, CompositeDisposable, Disposable, Emitter, ExState, ref;

  ref = require('event-kit'), Emitter = ref.Emitter, Disposable = ref.Disposable, CompositeDisposable = ref.CompositeDisposable;

  Command = require('./command');

  CommandError = require('./command-error');

  ExState = (function() {
    function ExState(editorElement, globalExState) {
      this.editorElement = editorElement;
      this.globalExState = globalExState;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.registerOperationCommands({
        open: (function(_this) {
          return function(e) {
            return new Command(_this.editor, _this);
          };
        })(this)
      });
    }

    ExState.prototype.destroy = function() {
      return this.subscriptions.dispose();
    };

    ExState.prototype.getExHistoryItem = function(index) {
      return this.globalExState.commandHistory[index];
    };

    ExState.prototype.pushExHistory = function(command) {
      return this.globalExState.commandHistory.unshift(command);
    };

    ExState.prototype.registerOperationCommands = function(commands) {
      var commandName, fn, results;
      results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        results.push((function(_this) {
          return function(fn) {
            var pushFn;
            pushFn = function(e) {
              return _this.pushOperations(fn(e));
            };
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "ex-mode:" + commandName, pushFn));
          };
        })(this)(fn));
      }
      return results;
    };

    ExState.prototype.onDidFailToExecute = function(fn) {
      return this.emitter.on('failed-to-execute', fn);
    };

    ExState.prototype.onDidProcessOpStack = function(fn) {
      return this.emitter.on('processed-op-stack', fn);
    };

    ExState.prototype.pushOperations = function(operations) {
      this.opStack.push(operations);
      if (this.opStack.length === 2) {
        return this.processOpStack();
      }
    };

    ExState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    ExState.prototype.processOpStack = function() {
      var command, e, input, ref1;
      ref1 = this.opStack, command = ref1[0], input = ref1[1];
      if (input.characters.length > 0) {
        this.history.unshift(command);
        try {
          command.execute(input);
        } catch (error) {
          e = error;
          if (e instanceof CommandError) {
            atom.notifications.addError("Command error: " + e.message);
            this.emitter.emit('failed-to-execute');
          } else {
            throw e;
          }
        }
      }
      this.clearOpStack();
      return this.emitter.emit('processed-op-stack');
    };

    ExState.prototype.getSelections = function() {
      var filtered, id, ref1, selection;
      filtered = {};
      ref1 = this.editor.getSelections();
      for (id in ref1) {
        selection = ref1[id];
        if (!selection.isEmpty()) {
          filtered[id] = selection;
        }
      }
      return filtered;
    };

    return ExState;

  })();

  module.exports = ExState;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZXgtc3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2QyxPQUFBLENBQVEsV0FBUixDQUE3QyxFQUFDLHFCQUFELEVBQVUsMkJBQVYsRUFBc0I7O0VBRXRCLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7RUFDVixZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUVUO0lBQ1MsaUJBQUMsYUFBRCxFQUFpQixhQUFqQjtNQUFDLElBQUMsQ0FBQSxnQkFBRDtNQUFnQixJQUFDLENBQUEsZ0JBQUQ7TUFDNUIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxhQUFhLENBQUMsUUFBZixDQUFBO01BQ1YsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVc7TUFFWCxJQUFDLENBQUEseUJBQUQsQ0FDRTtRQUFBLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLENBQUQ7bUJBQVcsSUFBQSxPQUFBLENBQVEsS0FBQyxDQUFBLE1BQVQsRUFBaUIsS0FBakI7VUFBWDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTjtPQURGO0lBUFc7O3NCQVViLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFETzs7c0JBR1QsZ0JBQUEsR0FBa0IsU0FBQyxLQUFEO2FBQ2hCLElBQUMsQ0FBQSxhQUFhLENBQUMsY0FBZSxDQUFBLEtBQUE7SUFEZDs7c0JBR2xCLGFBQUEsR0FBZSxTQUFDLE9BQUQ7YUFDYixJQUFDLENBQUEsYUFBYSxDQUFDLGNBQWMsQ0FBQyxPQUE5QixDQUFzQyxPQUF0QztJQURhOztzQkFHZix5QkFBQSxHQUEyQixTQUFDLFFBQUQ7QUFDekIsVUFBQTtBQUFBO1dBQUEsdUJBQUE7O3FCQUNLLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsRUFBRDtBQUNELGdCQUFBO1lBQUEsTUFBQSxHQUFTLFNBQUMsQ0FBRDtxQkFBTyxLQUFDLENBQUEsY0FBRCxDQUFnQixFQUFBLENBQUcsQ0FBSCxDQUFoQjtZQUFQO21CQUNULEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixLQUFDLENBQUEsYUFBbkIsRUFBa0MsVUFBQSxHQUFXLFdBQTdDLEVBQTRELE1BQTVELENBREY7VUFGQztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBSCxDQUFJLEVBQUo7QUFERjs7SUFEeUI7O3NCQVEzQixrQkFBQSxHQUFvQixTQUFDLEVBQUQ7YUFDbEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksbUJBQVosRUFBaUMsRUFBakM7SUFEa0I7O3NCQUdwQixtQkFBQSxHQUFxQixTQUFDLEVBQUQ7YUFDbkIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksb0JBQVosRUFBa0MsRUFBbEM7SUFEbUI7O3NCQUdyQixjQUFBLEdBQWdCLFNBQUMsVUFBRDtNQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFVBQWQ7TUFFQSxJQUFxQixJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsS0FBbUIsQ0FBeEM7ZUFBQSxJQUFDLENBQUEsY0FBRCxDQUFBLEVBQUE7O0lBSGM7O3NCQUtoQixZQUFBLEdBQWMsU0FBQTthQUNaLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFEQzs7c0JBR2QsY0FBQSxHQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLE9BQW1CLElBQUMsQ0FBQSxPQUFwQixFQUFDLGlCQUFELEVBQVU7TUFDVixJQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBakIsR0FBMEIsQ0FBN0I7UUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBaUIsT0FBakI7QUFDQTtVQUNFLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEtBQWhCLEVBREY7U0FBQSxhQUFBO1VBRU07VUFDSixJQUFJLENBQUEsWUFBYSxZQUFqQjtZQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsaUJBQUEsR0FBa0IsQ0FBQyxDQUFDLE9BQWhEO1lBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsbUJBQWQsRUFGRjtXQUFBLE1BQUE7QUFJRSxrQkFBTSxFQUpSO1dBSEY7U0FGRjs7TUFVQSxJQUFDLENBQUEsWUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsb0JBQWQ7SUFiYzs7c0JBZ0JoQixhQUFBLEdBQWUsU0FBQTtBQUNiLFVBQUE7TUFBQSxRQUFBLEdBQVc7QUFDWDtBQUFBLFdBQUEsVUFBQTs7UUFDRSxJQUFBLENBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFQO1VBQ0UsUUFBUyxDQUFBLEVBQUEsQ0FBVCxHQUFlLFVBRGpCOztBQURGO0FBSUEsYUFBTztJQU5NOzs7Ozs7RUFRakIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF2RWpCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnZXZlbnQta2l0J1xuXG5Db21tYW5kID0gcmVxdWlyZSAnLi9jb21tYW5kJ1xuQ29tbWFuZEVycm9yID0gcmVxdWlyZSAnLi9jb21tYW5kLWVycm9yJ1xuXG5jbGFzcyBFeFN0YXRlXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvckVsZW1lbnQsIEBnbG9iYWxFeFN0YXRlKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVkaXRvciA9IEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICBAb3BTdGFjayA9IFtdXG4gICAgQGhpc3RvcnkgPSBbXVxuXG4gICAgQHJlZ2lzdGVyT3BlcmF0aW9uQ29tbWFuZHNcbiAgICAgIG9wZW46IChlKSA9PiBuZXcgQ29tbWFuZChAZWRpdG9yLCBAKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgZ2V0RXhIaXN0b3J5SXRlbTogKGluZGV4KSAtPlxuICAgIEBnbG9iYWxFeFN0YXRlLmNvbW1hbmRIaXN0b3J5W2luZGV4XVxuXG4gIHB1c2hFeEhpc3Rvcnk6IChjb21tYW5kKSAtPlxuICAgIEBnbG9iYWxFeFN0YXRlLmNvbW1hbmRIaXN0b3J5LnVuc2hpZnQgY29tbWFuZFxuXG4gIHJlZ2lzdGVyT3BlcmF0aW9uQ29tbWFuZHM6IChjb21tYW5kcykgLT5cbiAgICBmb3IgY29tbWFuZE5hbWUsIGZuIG9mIGNvbW1hbmRzXG4gICAgICBkbyAoZm4pID0+XG4gICAgICAgIHB1c2hGbiA9IChlKSA9PiBAcHVzaE9wZXJhdGlvbnMoZm4oZSkpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgXCJleC1tb2RlOiN7Y29tbWFuZE5hbWV9XCIsIHB1c2hGbilcbiAgICAgICAgKVxuXG4gIG9uRGlkRmFpbFRvRXhlY3V0ZTogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdmYWlsZWQtdG8tZXhlY3V0ZScsIGZuKVxuXG4gIG9uRGlkUHJvY2Vzc09wU3RhY2s6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbigncHJvY2Vzc2VkLW9wLXN0YWNrJywgZm4pXG5cbiAgcHVzaE9wZXJhdGlvbnM6IChvcGVyYXRpb25zKSAtPlxuICAgIEBvcFN0YWNrLnB1c2ggb3BlcmF0aW9uc1xuXG4gICAgQHByb2Nlc3NPcFN0YWNrKCkgaWYgQG9wU3RhY2subGVuZ3RoID09IDJcblxuICBjbGVhck9wU3RhY2s6IC0+XG4gICAgQG9wU3RhY2sgPSBbXVxuXG4gIHByb2Nlc3NPcFN0YWNrOiAtPlxuICAgIFtjb21tYW5kLCBpbnB1dF0gPSBAb3BTdGFja1xuICAgIGlmIGlucHV0LmNoYXJhY3RlcnMubGVuZ3RoID4gMFxuICAgICAgQGhpc3RvcnkudW5zaGlmdCBjb21tYW5kXG4gICAgICB0cnlcbiAgICAgICAgY29tbWFuZC5leGVjdXRlKGlucHV0KVxuICAgICAgY2F0Y2ggZVxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIENvbW1hbmRFcnJvcilcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJDb21tYW5kIGVycm9yOiAje2UubWVzc2FnZX1cIilcbiAgICAgICAgICBAZW1pdHRlci5lbWl0KCdmYWlsZWQtdG8tZXhlY3V0ZScpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aHJvdyBlXG4gICAgQGNsZWFyT3BTdGFjaygpXG4gICAgQGVtaXR0ZXIuZW1pdCgncHJvY2Vzc2VkLW9wLXN0YWNrJylcblxuICAjIFJldHVybnMgYWxsIG5vbi1lbXB0eSBzZWxlY3Rpb25zXG4gIGdldFNlbGVjdGlvbnM6IC0+XG4gICAgZmlsdGVyZWQgPSB7fVxuICAgIGZvciBpZCwgc2VsZWN0aW9uIG9mIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB1bmxlc3Mgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgICBmaWx0ZXJlZFtpZF0gPSBzZWxlY3Rpb25cblxuICAgIHJldHVybiBmaWx0ZXJlZFxuXG5tb2R1bGUuZXhwb3J0cyA9IEV4U3RhdGVcbiJdfQ==
