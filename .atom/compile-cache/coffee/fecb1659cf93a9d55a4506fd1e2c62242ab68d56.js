(function() {
  var LoadingView;

  module.exports = LoadingView = (function() {
    function LoadingView() {
      var icon, message, messageOuter;
      this.element = document.createElement('div');
      this.element.classList.add('split-diff-modal');
      icon = document.createElement('div');
      icon.classList.add('split-diff-icon');
      this.element.appendChild(icon);
      message = document.createElement('div');
      message.textContent = "Computing the diff for you.";
      message.classList.add('split-diff-message');
      messageOuter = document.createElement('div');
      messageOuter.appendChild(message);
      this.element.appendChild(messageOuter);
    }

    LoadingView.prototype.destroy = function() {
      this.element.remove();
      return this.modalPanel.destroy();
    };

    LoadingView.prototype.getElement = function() {
      return this.element;
    };

    LoadingView.prototype.createModal = function() {
      this.modalPanel = atom.workspace.addModalPanel({
        item: this.element,
        visible: false
      });
      return this.modalPanel.item.parentNode.classList.add('split-diff-hide-mask');
    };

    LoadingView.prototype.show = function() {
      return this.modalPanel.show();
    };

    LoadingView.prototype.hide = function() {
      return this.modalPanel.hide();
    };

    return LoadingView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvdWkvbG9hZGluZy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHFCQUFBO0FBRVgsVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixrQkFBdkI7TUFHQSxJQUFBLEdBQU8sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDUCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQWYsQ0FBbUIsaUJBQW5CO01BQ0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLElBQXJCO01BR0EsT0FBQSxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ1YsT0FBTyxDQUFDLFdBQVIsR0FBc0I7TUFDdEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFsQixDQUFzQixvQkFBdEI7TUFDQSxZQUFBLEdBQWUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDZixZQUFZLENBQUMsV0FBYixDQUF5QixPQUF6QjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixZQUFyQjtJQWhCVzs7MEJBbUJiLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUE7YUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQTtJQUZPOzswQkFJVCxVQUFBLEdBQVksU0FBQTthQUNWLElBQUMsQ0FBQTtJQURTOzswQkFHWixXQUFBLEdBQWEsU0FBQTtNQUNYLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxPQUFQO1FBQWdCLE9BQUEsRUFBUyxLQUF6QjtPQUE3QjthQUNkLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsR0FBdEMsQ0FBMEMsc0JBQTFDO0lBRlc7OzBCQUliLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQUE7SUFESTs7MEJBR04sSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsVUFBVSxDQUFDLElBQVosQ0FBQTtJQURJOzs7OztBQW5DUiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExvYWRpbmdWaWV3XG4gIGNvbnN0cnVjdG9yOiAoKSAtPlxuICAgICMgQ3JlYXRlIHJvb3QgZWxlbWVudFxuICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmLW1vZGFsJylcblxuICAgICMgQ3JlYXRlIGljb24gZWxlbWVudFxuICAgIGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGljb24uY2xhc3NMaXN0LmFkZCgnc3BsaXQtZGlmZi1pY29uJylcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChpY29uKVxuXG4gICAgIyBDcmVhdGUgbWVzc2FnZSBlbGVtZW50XG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiQ29tcHV0aW5nIHRoZSBkaWZmIGZvciB5b3UuXCJcbiAgICBtZXNzYWdlLmNsYXNzTGlzdC5hZGQoJ3NwbGl0LWRpZmYtbWVzc2FnZScpXG4gICAgbWVzc2FnZU91dGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBtZXNzYWdlT3V0ZXIuYXBwZW5kQ2hpbGQobWVzc2FnZSlcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlT3V0ZXIpXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICBAZWxlbWVudC5yZW1vdmUoKVxuICAgIEBtb2RhbFBhbmVsLmRlc3Ryb3koKVxuXG4gIGdldEVsZW1lbnQ6IC0+XG4gICAgQGVsZW1lbnRcblxuICBjcmVhdGVNb2RhbDogLT5cbiAgICBAbW9kYWxQYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogQGVsZW1lbnQsIHZpc2libGU6IGZhbHNlKVxuICAgIEBtb2RhbFBhbmVsLml0ZW0ucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmLWhpZGUtbWFzaycpXG5cbiAgc2hvdzogLT5cbiAgICBAbW9kYWxQYW5lbC5zaG93KClcblxuICBoaWRlOiAtPlxuICAgIEBtb2RhbFBhbmVsLmhpZGUoKVxuIl19
