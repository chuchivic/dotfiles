(function() {
  var TouchBar, spinning;

  TouchBar = require('remote').TouchBar;

  spinning = false;

  module.exports = {
    update: function(data) {
      var TouchBarButton, TouchBarLabel, TouchBarSpacer, button, touchBar, window;
      if (!TouchBar) {
        return;
      }
      TouchBarLabel = TouchBar.TouchBarLabel, TouchBarButton = TouchBar.TouchBarButton, TouchBarSpacer = TouchBar.TouchBarSpacer;
      button = new TouchBarButton({
        label: data.text + ": " + (data.description.trim().split('\n')[0]),
        backgroundColor: '#353232',
        click: function() {
          var promise;
          promise = atom.workspace.open(data.fileName);
          return promise.then(function(editor) {
            editor.setCursorBufferPosition([data.line, data.column]);
            return editor.scrollToCursorPosition();
          });
        }
      });
      touchBar = new TouchBar([
        button, new TouchBarSpacer({
          size: 'small'
        })
      ]);
      window = atom.getCurrentWindow();
      return window.setTouchBar(touchBar);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvdG91Y2hiYXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxXQUFZLE9BQUEsQ0FBUSxRQUFSOztFQUViLFFBQUEsR0FBVzs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsTUFBQSxFQUFRLFNBQUMsSUFBRDtBQUNOLFVBQUE7TUFBQSxJQUFHLENBQUksUUFBUDtBQUNFLGVBREY7O01BRUMsc0NBQUQsRUFBZ0Isd0NBQWhCLEVBQWdDO01BQ2hDLE1BQUEsR0FBYSxJQUFBLGNBQUEsQ0FBZTtRQUMxQixLQUFBLEVBQVUsSUFBSSxDQUFDLElBQU4sR0FBVyxJQUFYLEdBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQWpCLENBQUEsQ0FBdUIsQ0FBQyxLQUF4QixDQUE4QixJQUE5QixDQUFvQyxDQUFBLENBQUEsQ0FBckMsQ0FERztRQUUxQixlQUFBLEVBQWlCLFNBRlM7UUFHMUIsS0FBQSxFQUFPLFNBQUE7QUFDTCxjQUFBO1VBQUEsT0FBQSxHQUFVLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixJQUFJLENBQUMsUUFBekI7aUJBQ1YsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFDLE1BQUQ7WUFDWCxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxJQUFJLENBQUMsSUFBTixFQUFZLElBQUksQ0FBQyxNQUFqQixDQUEvQjttQkFDQSxNQUFNLENBQUMsc0JBQVAsQ0FBQTtVQUZXLENBQWI7UUFGSyxDQUhtQjtPQUFmO01BU2IsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTO1FBQ3RCLE1BRHNCLEVBRWxCLElBQUEsY0FBQSxDQUFlO1VBQUMsSUFBQSxFQUFNLE9BQVA7U0FBZixDQUZrQjtPQUFUO01BSWYsTUFBQSxHQUFTLElBQUksQ0FBQyxnQkFBTCxDQUFBO2FBQ1QsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsUUFBbkI7SUFsQk0sQ0FBUjs7QUFMRiIsInNvdXJjZXNDb250ZW50IjpbIntUb3VjaEJhcn0gPSByZXF1aXJlKCdyZW1vdGUnKVxuXG5zcGlubmluZyA9IGZhbHNlXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgdXBkYXRlOiAoZGF0YSkgLT5cbiAgICBpZiBub3QgVG91Y2hCYXJcbiAgICAgIHJldHVyblxuICAgIHtUb3VjaEJhckxhYmVsLCBUb3VjaEJhckJ1dHRvbiwgVG91Y2hCYXJTcGFjZXJ9ID0gVG91Y2hCYXJcbiAgICBidXR0b24gPSBuZXcgVG91Y2hCYXJCdXR0b24oe1xuICAgICAgbGFiZWw6IFwiI3tkYXRhLnRleHR9OiAje2RhdGEuZGVzY3JpcHRpb24udHJpbSgpLnNwbGl0KCdcXG4nKVswXX1cIixcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyMzNTMyMzInLFxuICAgICAgY2xpY2s6ICgpIC0+XG4gICAgICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuKGRhdGEuZmlsZU5hbWUpXG4gICAgICAgIHByb21pc2UudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbZGF0YS5saW5lLCBkYXRhLmNvbHVtbl0pXG4gICAgICAgICAgZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKVxuICAgIH0pXG4gICAgdG91Y2hCYXIgPSBuZXcgVG91Y2hCYXIoW1xuICAgICAgYnV0dG9uLFxuICAgICAgbmV3IFRvdWNoQmFyU3BhY2VyKHtzaXplOiAnc21hbGwnfSksXG4gICAgXSlcbiAgICB3aW5kb3cgPSBhdG9tLmdldEN1cnJlbnRXaW5kb3coKVxuICAgIHdpbmRvdy5zZXRUb3VjaEJhcih0b3VjaEJhcilcbiJdfQ==
