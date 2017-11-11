(function() {
  var VimNormalModeInputElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  VimNormalModeInputElement = (function(superClass) {
    extend(VimNormalModeInputElement, superClass);

    function VimNormalModeInputElement() {
      return VimNormalModeInputElement.__super__.constructor.apply(this, arguments);
    }

    VimNormalModeInputElement.prototype.createdCallback = function() {
      return this.className = "normal-mode-input";
    };

    VimNormalModeInputElement.prototype.initialize = function(viewModel, mainEditorElement, opts) {
      var ref;
      this.viewModel = viewModel;
      this.mainEditorElement = mainEditorElement;
      if (opts == null) {
        opts = {};
      }
      if (opts["class"] != null) {
        this.classList.add(opts["class"]);
      }
      this.editorElement = document.createElement("atom-text-editor");
      this.editorElement.classList.add('editor');
      this.editorElement.getModel().setMini(true);
      this.editorElement.setAttribute('mini', '');
      this.appendChild(this.editorElement);
      this.singleChar = opts.singleChar;
      this.defaultText = (ref = opts.defaultText) != null ? ref : '';
      if (opts.hidden) {
        this.classList.add('vim-hidden-normal-mode-input');
        this.mainEditorElement.parentNode.appendChild(this);
      } else {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          priority: 100
        });
      }
      this.focus();
      this.handleEvents();
      return this;
    };

    VimNormalModeInputElement.prototype.handleEvents = function() {
      var compositing;
      if (this.singleChar != null) {
        compositing = false;
        this.editorElement.getModel().getBuffer().onDidChange((function(_this) {
          return function(e) {
            if (e.newText && !compositing) {
              return _this.confirm();
            }
          };
        })(this));
        this.editorElement.addEventListener('compositionstart', function() {
          return compositing = true;
        });
        this.editorElement.addEventListener('compositionend', function() {
          return compositing = false;
        });
      } else {
        atom.commands.add(this.editorElement, 'editor:newline', this.confirm.bind(this));
      }
      atom.commands.add(this.editorElement, 'core:confirm', this.confirm.bind(this));
      atom.commands.add(this.editorElement, 'core:cancel', this.cancel.bind(this));
      return atom.commands.add(this.editorElement, 'blur', this.cancel.bind(this));
    };

    VimNormalModeInputElement.prototype.confirm = function() {
      this.value = this.editorElement.getModel().getText() || this.defaultText;
      this.viewModel.confirm(this);
      return this.removePanel();
    };

    VimNormalModeInputElement.prototype.focus = function() {
      return this.editorElement.focus();
    };

    VimNormalModeInputElement.prototype.cancel = function(e) {
      this.viewModel.cancel(this);
      return this.removePanel();
    };

    VimNormalModeInputElement.prototype.removePanel = function() {
      atom.workspace.getActivePane().activate();
      if (this.panel != null) {
        return this.panel.destroy();
      } else {
        return this.remove();
      }
    };

    return VimNormalModeInputElement;

  })(HTMLDivElement);

  module.exports = document.registerElement("vim-normal-mode-input", {
    "extends": "div",
    prototype: VimNormalModeInputElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpZXctbW9kZWxzL3ZpbS1ub3JtYWwtbW9kZS1pbnB1dC1lbGVtZW50LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUJBQUE7SUFBQTs7O0VBQU07Ozs7Ozs7d0NBQ0osZUFBQSxHQUFpQixTQUFBO2FBQ2YsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQURFOzt3Q0FHakIsVUFBQSxHQUFZLFNBQUMsU0FBRCxFQUFhLGlCQUFiLEVBQWlDLElBQWpDO0FBQ1YsVUFBQTtNQURXLElBQUMsQ0FBQSxZQUFEO01BQVksSUFBQyxDQUFBLG9CQUFEOztRQUFvQixPQUFPOztNQUNsRCxJQUFHLHFCQUFIO1FBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsSUFBSSxFQUFDLEtBQUQsRUFBbkIsRUFERjs7TUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixRQUFRLENBQUMsYUFBVCxDQUF1QixrQkFBdkI7TUFDakIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsUUFBN0I7TUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQSxDQUF5QixDQUFDLE9BQTFCLENBQWtDLElBQWxDO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxZQUFmLENBQTRCLE1BQTVCLEVBQW9DLEVBQXBDO01BQ0EsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFDLENBQUEsYUFBZDtNQUVBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDO01BQ25CLElBQUMsQ0FBQSxXQUFELDRDQUFrQztNQUVsQyxJQUFHLElBQUksQ0FBQyxNQUFSO1FBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxHQUFYLENBQWUsOEJBQWY7UUFDQSxJQUFDLENBQUEsaUJBQWlCLENBQUMsVUFBVSxDQUFDLFdBQTlCLENBQTBDLElBQTFD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bnRlbnQiOlsiY2xhc3MgVmltTm9ybWFsTW9kZUlucHV0RWxlbWVudCBleHRlbmRzIEhUTUxEaXZFbGVtZW50XG4gIGNyZWF0ZWRDYWxsYmFjazogLT5cbiAgICBAY2xhc3NOYW1lID0gXCJub3JtYWwtbW9kZS1pbnB1dFwiXG5cbiAgaW5pdGlhbGl6ZTogKEB2aWV3TW9kZWwsIEBtYWluRWRpdG9yRWxlbWVudCwgb3B0cyA9IHt9KSAtPlxuICAgIGlmIG9wdHMuY2xhc3M/XG4gICAgICBAY2xhc3NMaXN0LmFkZChvcHRzLmNsYXNzKVxuXG4gICAgQGVkaXRvckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiYXRvbS10ZXh0LWVkaXRvclwiXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZWRpdG9yJylcbiAgICBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLnNldE1pbmkodHJ1ZSlcbiAgICBAZWRpdG9yRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ21pbmknLCAnJylcbiAgICBAYXBwZW5kQ2hpbGQoQGVkaXRvckVsZW1lbnQpXG5cbiAgICBAc2luZ2xlQ2hhciA9IG9wdHMuc2luZ2xlQ2hhclxuICAgIEBkZWZhdWx0VGV4dCA9IG9wdHMuZGVmYXVsdFRleHQgPyAnJ1xuXG4gICAgaWYgb3B0cy5oaWRkZW5cbiAgICAgIEBjbGFzc0xpc3QuYWRkKCd2aW0taGlkZGVuLW5vcm1hbC1tb2RlLWlucHV0JylcbiAgICAgIEBtYWluRWRpdG9yRWxlbWVudC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMpXG4gICAgZWxzZVxuICAgICAgQHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwoaXRlbTogdGhpcywgcHJpb3JpdHk6IDEwMClcblxuICAgIEBmb2N1cygpXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgICB0aGlzXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIGlmIEBzaW5nbGVDaGFyP1xuICAgICAgY29tcG9zaXRpbmcgPSBmYWxzZVxuICAgICAgQGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZSAoZSkgPT5cbiAgICAgICAgQGNvbmZpcm0oKSBpZiBlLm5ld1RleHQgYW5kIG5vdCBjb21wb3NpdGluZ1xuICAgICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY29tcG9zaXRpb25zdGFydCcsIC0+IGNvbXBvc2l0aW5nID0gdHJ1ZVxuICAgICAgQGVkaXRvckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAnY29tcG9zaXRpb25lbmQnLCAtPiBjb21wb3NpdGluZyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsICdlZGl0b3I6bmV3bGluZScsIEBjb25maXJtLmJpbmQodGhpcykpXG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2NvcmU6Y29uZmlybScsIEBjb25maXJtLmJpbmQodGhpcykpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoQGVkaXRvckVsZW1lbnQsICdjb3JlOmNhbmNlbCcsIEBjYW5jZWwuYmluZCh0aGlzKSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgJ2JsdXInLCBAY2FuY2VsLmJpbmQodGhpcykpXG5cbiAgY29uZmlybTogLT5cbiAgICBAdmFsdWUgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldFRleHQoKSBvciBAZGVmYXVsdFRleHRcbiAgICBAdmlld01vZGVsLmNvbmZpcm0odGhpcylcbiAgICBAcmVtb3ZlUGFuZWwoKVxuXG4gIGZvY3VzOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LmZvY3VzKClcblxuICBjYW5jZWw6IChlKSAtPlxuICAgIEB2aWV3TW9kZWwuY2FuY2VsKHRoaXMpXG4gICAgQHJlbW92ZVBhbmVsKClcblxuICByZW1vdmVQYW5lbDogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKVxuICAgIGlmIEBwYW5lbD9cbiAgICAgIEBwYW5lbC5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlbW92ZSgpXG5cbm1vZHVsZS5leHBvcnRzID1cbmRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudChcInZpbS1ub3JtYWwtbW9kZS1pbnB1dFwiXG4gIGV4dGVuZHM6IFwiZGl2XCIsXG4gIHByb3RvdHlwZTogVmltTm9ybWFsTW9kZUlucHV0RWxlbWVudC5wcm90b3R5cGVcbilcbiJdfQ==
