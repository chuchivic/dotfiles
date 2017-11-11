(function() {
  var ExCommandModeInputElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ExCommandModeInputElement = (function(superClass) {
    extend(ExCommandModeInputElement, superClass);

    function ExCommandModeInputElement() {
      return ExCommandModeInputElement.__super__.constructor.apply(this, arguments);
    }

    ExCommandModeInputElement.prototype.createdCallback = function() {
      this.className = "command-mode-input";
      this.editorContainer = document.createElement("div");
      this.editorContainer.className = "editor-container";
      return this.appendChild(this.editorContainer);
    };

    ExCommandModeInputElement.prototype.initialize = function(viewModel, opts) {
      var ref;
      this.viewModel = viewModel;
      if (opts == null) {
        opts = {};
      }
      if (opts["class"] != null) {
        this.editorContainer.classList.add(opts["class"]);
      }
      if (opts.hidden) {
        this.editorContainer.style.height = "0px";
      }
      this.editorElement = document.createElement("atom-text-editor");
      this.editorElement.classList.add('editor');
      this.editorElement.classList.add('ex-mode-editor');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.editorContainer.appendChild(this.editorElement);
      this.singleChar = opts.singleChar;
      this.defaultText = (ref = opts.defaultText) != null ? ref : '';
      this.panel = atom.workspace.addBottomPanel({
        item: this,
        priority: 100
      });
      this.focus();
      this.handleEvents();
      return this;
    };

    ExCommandModeInputElement.prototype.handleEvents = function() {
      if (this.singleChar != null) {
        this.editorElement.getModel().getBuffer().onDidChange((function(_this) {
          return function(e) {
            if (e.newText) {
              return _this.confirm();
            }
          };
        })(this));
      } else {
        atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
        atom.commands.add(this.editorElement, 'core:backspace', this.backspace.bind(this));
      }
      atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
      atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
      atom.commands.add(this.editorElement, 'ex-mode:close', this.cancel.bind(this));
      return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
    };

    ExCommandModeInputElement.prototype.backspace = function() {
      if (!this.editorElement.getModel().getText().length) {
        return this.cancel();
      }
    };

    ExCommandModeInputElement.prototype.confirm = function() {
      this.value = this.editorElement.getModel().getText() || this.defaultText;
      this.viewModel.confirm(this);
      return this.removePanel();
    };

    ExCommandModeInputElement.prototype.focus = function() {
      return this.editorElement.focus();
    };

    ExCommandModeInputElement.prototype.cancel = function(e) {
      this.viewModel.cancel(this);
      return this.removePanel();
    };

    ExCommandModeInputElement.prototype.removePanel = function() {
      atom.workspace.getActivePane().activate();
      return this.panel.destroy();
    };

    return ExCommandModeInputElement;

  })(HTMLDivElement);

  module.exports = document.registerElement("ex-command-mode-input", {
    "extends": "div",
    prototype: ExCommandModeInputElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZXgtbm9ybWFsLW1vZGUtaW5wdXQtZWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHlCQUFBO0lBQUE7OztFQUFNOzs7Ozs7O3dDQUNKLGVBQUEsR0FBaUIsU0FBQTtNQUNmLElBQUMsQ0FBQSxTQUFELEdBQWE7TUFFYixJQUFDLENBQUEsZUFBRCxHQUFtQixRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNuQixJQUFDLENBQUEsZUFBZSxDQUFDLFNBQWpCLEdBQTZCO2FBRTdCLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLGVBQWQ7SUFOZTs7d0NBUWpCLFVBQUEsR0FBWSxTQUFDLFNBQUQsRUFBYSxJQUFiO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxZQUFEOztRQUFZLE9BQU87O01BQzlCLElBQUcscUJBQUg7UUFDRSxJQUFDLENBQUEsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixJQUFJLEVBQUMsS0FBRCxFQUFuQyxFQURGOztNQUdBLElBQUcsSUFBSSxDQUFDLE1BQVI7UUFDRSxJQUFDLENBQUEsZUFBZSxDQUFDLEtBQUssQ0FBQyxNQUF2QixHQUFnQyxNQURsQzs7TUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixRQUFRLENBQUMsYUFBVCxDQUF1QixrQkFBdkI7TUFDakIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsUUFBN0I7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixnQkFBN0I7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQWtDLElBQWxDO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxZQUFmLENBQTRCLE1BQTVCLEVBQW9DLEVB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QUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUZXOzs7O0tBOUR5Qjs7RUFrRXhDLE1BQU0sQ0FBQyxPQUFQLEdBQ0EsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsdUJBQXpCLEVBQ0U7SUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBQVQ7SUFDQSxTQUFBLEVBQVcseUJBQXlCLENBQUMsU0FEckM7R0FERjtBQW5FQSIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEV4Q29tbWFuZE1vZGVJbnB1dEVsZW1lbnQgZXh0ZW5kcyBIVE1MRGl2RWxlbWVudFxuICBjcmVhdGVkQ2FsbGJhY2s6IC0+XG4gICAgQGNsYXNzTmFtZSA9IFwiY29tbWFuZC1tb2RlLWlucHV0XCJcblxuICAgIEBlZGl0b3JDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG4gICAgQGVkaXRvckNvbnRhaW5lci5jbGFzc05hbWUgPSBcImVkaXRvci1jb250YWluZXJcIlxuXG4gICAgQGFwcGVuZENoaWxkKEBlZGl0b3JDb250YWluZXIpXG5cbiAgaW5pdGlhbGl6ZTogKEB2aWV3TW9kZWwsIG9wdHMgPSB7fSkgLT5cbiAgICBpZiBvcHRzLmNsYXNzP1xuICAgICAgQGVkaXRvckNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKG9wdHMuY2xhc3MpXG5cbiAgICBpZiBvcHRzLmhpZGRlblxuICAgICAgQGVkaXRvckNvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBcIjBweFwiXG5cbiAgICBAZWRpdG9yRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJhdG9tLXRleHQtZWRpdG9yXCJcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdlZGl0b3InKSAjIENvbnNpZGVyIHRoaXMgZGVwcmVjYXRlZCFcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdleC1tb2RlLWVkaXRvcicpXG4gICAgQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5zZXRNaW5pKHRydWUpXG4gICAgQGVkaXRvckVsZW1lbnQuc2V0QXR0cmlidXRlKCdtaW5pJywgJycpXG4gICAgQGVkaXRvckNvbnRhaW5lci5hcHBlbmRDaGlsZChAZWRpdG9yRWxlbWVudClcblxuICAgIEBzaW5nbGVDaGFyID0gb3B0cy5zaW5nbGVDaGFyXG4gICAgQGRlZmF1bHRUZXh0ID0gb3B0cy5kZWZhdWx0VGV4dCA/ICcnXG5cbiAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCBwcmlvcml0eTogMTAwKVxuXG4gICAgQGZvY3VzKClcbiAgICBAaGFuZGxlRXZlbnRzKClcblxuICAgIHRoaXNcblxuICBoYW5kbGVFdmVudHM6IC0+XG4gICAgaWYgQHNpbmdsZUNoYXI/XG4gICAgICBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldEJ1ZmZlcigpLm9uRGlkQ2hhbmdlIChlKSA9PlxuICAgICAgICBAY29uZmlybSgpIGlmIGUubmV3VGV4dFxuICAgIGVsc2VcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnZWRpdG9yOm5ld2xpbmUnLCBAY29uZmlybS5iaW5kKHRoaXMpKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsICdjb3JlOmJhY2tzcGFjZScsIEBiYWNrc3BhY2UuYmluZCh0aGlzKSlcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnY29yZTpjb25maXJtJywgQGNvbmZpcm0uYmluZCh0aGlzKSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2NvcmU6Y2FuY2VsJywgQGNhbmNlbC5iaW5kKHRoaXMpKVxuICAgIGF0b20uY29tbWFuZHMuYWRkKEBlZGl0b3JFbGVtZW50LCAnZXgtbW9kZTpjbG9zZScsIEBjYW5jZWwuYmluZCh0aGlzKSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2JsdXInLCBAY2FuY2VsLmJpbmQodGhpcykpXG5cbiAgYmFja3NwYWNlOiAtPlxuICAgICMgcHJlc3NpbmcgYmFja3NwYWNlIG92ZXIgZW1wdHkgYDpgIHNob3VsZCBjYW5jZWwgZXgtbW9kZVxuICAgIEBjYW5jZWwoKSB1bmxlc3MgQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRUZXh0KCkubGVuZ3RoXG5cbiAgY29uZmlybTogLT5cbiAgICBAdmFsdWUgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldFRleHQoKSBvciBAZGVmYXVsdFRleHRcbiAgICBAdmlld01vZGVsLmNvbmZpcm0odGhpcylcbiAgICBAcmVtb3ZlUGFuZWwoKVxuXG4gIGZvY3VzOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmZvY3VzKClcblxuICBjYW5jZWw6IChlKSAtPlxuICAgIEB2aWV3TW9kZWwuY2FuY2VsKHRoaXMpXG4gICAgQHJlbW92ZVBhbmVsKClcblxuICByZW1vdmVQYW5lbDogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuICAgIEBwYW5lbC5kZXN0cm95KClcblxubW9kdWxlLmV4cG9ydHMgPVxuZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KFwiZXgtY29tbWFuZC1tb2RlLWlucHV0XCJcbiAgZXh0ZW5kczogXCJkaXZcIixcbiAgcHJvdG90eXBlOiBFeENvbW1hbmRNb2RlSW5wdXRFbGVtZW50LnByb3RvdHlwZVxuKVxuIl19
