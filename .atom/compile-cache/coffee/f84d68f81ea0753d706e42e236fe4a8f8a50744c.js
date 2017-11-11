(function() {
  var AnsiToHtml, AtomRunnerView, ScrollView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ScrollView = require('atom-space-pen-views').ScrollView;

  AnsiToHtml = require('ansi-to-html');

  module.exports = AtomRunnerView = (function(superClass) {
    extend(AtomRunnerView, superClass);

    atom.deserializers.add(AtomRunnerView);

    AtomRunnerView.deserialize = function(arg) {
      var footer, output, title, view;
      title = arg.title, output = arg.output, footer = arg.footer;
      view = new AtomRunnerView(title);
      view._output.html(output);
      view._footer.html(footer);
      return view;
    };

    AtomRunnerView.content = function() {
      return this.div({
        "class": 'atom-runner',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h1('Atom Runner');
          _this.pre({
            "class": 'output'
          });
          return _this.div({
            "class": 'footer'
          });
        };
      })(this));
    };

    function AtomRunnerView(title) {
      AtomRunnerView.__super__.constructor.apply(this, arguments);
      this._output = this.find('.output');
      this._footer = this.find('.footer');
      this.setTitle(title);
    }

    AtomRunnerView.prototype.serialize = function() {
      return {
        deserializer: 'AtomRunnerView',
        title: this.title,
        output: this._output.html(),
        footer: this._footer.html()
      };
    };

    AtomRunnerView.prototype.getTitle = function() {
      return "Atom Runner: " + this.title;
    };

    AtomRunnerView.prototype.setTitle = function(title) {
      this.title = title;
      return this.find('h1').html(this.getTitle());
    };

    AtomRunnerView.prototype.clear = function() {
      this._output.html('');
      return this._footer.html('');
    };

    AtomRunnerView.prototype.append = function(text, className) {
      var node, span;
      span = document.createElement('span');
      node = document.createTextNode(text);
      span.appendChild(node);
      span.innerHTML = new AnsiToHtml().toHtml(span.innerHTML);
      span.className = className || 'stdout';
      return this._output.append(span);
    };

    AtomRunnerView.prototype.appendFooter = function(text) {
      return this._footer.html(this._footer.html() + text);
    };

    AtomRunnerView.prototype.footer = function(text) {
      return this._footer.html(text);
    };

    return AtomRunnerView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXRvbS1ydW5uZXIvbGliL2F0b20tcnVubmVyLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxzQ0FBQTtJQUFBOzs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxzQkFBUjs7RUFDZixVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QixjQUF2Qjs7SUFFQSxjQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsR0FBRDtBQUNaLFVBQUE7TUFEYyxtQkFBTyxxQkFBUTtNQUM3QixJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsS0FBZjtNQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixNQUFsQjtNQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixNQUFsQjthQUNBO0lBSlk7O0lBTWQsY0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtRQUFzQixRQUFBLEVBQVUsQ0FBQyxDQUFqQztPQUFMLEVBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUN2QyxLQUFDLENBQUEsRUFBRCxDQUFJLGFBQUo7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO1dBQUw7aUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtXQUFMO1FBSHVDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QztJQURROztJQU1HLHdCQUFDLEtBQUQ7TUFDWCxpREFBQSxTQUFBO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU47TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTjtNQUNYLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVjtJQUxXOzs2QkFPYixTQUFBLEdBQVcsU0FBQTthQUNUO1FBQUEsWUFBQSxFQUFjLGdCQUFkO1FBQ0EsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQURSO1FBRUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBLENBRlI7UUFHQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsQ0FIUjs7SUFEUzs7NkJBTVgsUUFBQSxHQUFVLFNBQUE7YUFDUixlQUFBLEdBQWdCLElBQUMsQ0FBQTtJQURUOzs2QkFHVixRQUFBLEdBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixDQUFXLENBQUMsSUFBWixDQUFpQixJQUFDLENBQUEsUUFBRCxDQUFBLENBQWpCO0lBRlE7OzZCQUlWLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsRUFBZDthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEVBQWQ7SUFGSzs7NkJBSVAsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLFNBQVA7QUFDTixVQUFBO01BQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLElBQXhCO01BQ1AsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakI7TUFDQSxJQUFJLENBQUMsU0FBTCxHQUFxQixJQUFBLFVBQUEsQ0FBQSxDQUFZLENBQUMsTUFBYixDQUFvQixJQUFJLENBQUMsU0FBekI7TUFDckIsSUFBSSxDQUFDLFNBQUwsR0FBaUIsU0FBQSxJQUFhO2FBQzlCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFnQixJQUFoQjtJQU5NOzs2QkFRUixZQUFBLEdBQWMsU0FBQyxJQUFEO2FBQ1osSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsQ0FBQSxHQUFrQixJQUFoQztJQURZOzs2QkFHZCxNQUFBLEdBQVEsU0FBQyxJQUFEO2FBQ04sSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZDtJQURNOzs7O0tBbERtQjtBQUo3QiIsInNvdXJjZXNDb250ZW50IjpbIntTY3JvbGxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuQW5zaVRvSHRtbCA9IHJlcXVpcmUgJ2Fuc2ktdG8taHRtbCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQXRvbVJ1bm5lclZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG4gIGF0b20uZGVzZXJpYWxpemVycy5hZGQodGhpcylcblxuICBAZGVzZXJpYWxpemU6ICh7dGl0bGUsIG91dHB1dCwgZm9vdGVyfSkgLT5cbiAgICB2aWV3ID0gbmV3IEF0b21SdW5uZXJWaWV3KHRpdGxlKVxuICAgIHZpZXcuX291dHB1dC5odG1sKG91dHB1dClcbiAgICB2aWV3Ll9mb290ZXIuaHRtbChmb290ZXIpXG4gICAgdmlld1xuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6ICdhdG9tLXJ1bm5lcicsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgIEBoMSAnQXRvbSBSdW5uZXInXG4gICAgICBAcHJlIGNsYXNzOiAnb3V0cHV0J1xuICAgICAgQGRpdiBjbGFzczogJ2Zvb3RlcidcblxuICBjb25zdHJ1Y3RvcjogKHRpdGxlKSAtPlxuICAgIHN1cGVyXG5cbiAgICBAX291dHB1dCA9IEBmaW5kKCcub3V0cHV0JylcbiAgICBAX2Zvb3RlciA9IEBmaW5kKCcuZm9vdGVyJylcbiAgICBAc2V0VGl0bGUodGl0bGUpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGRlc2VyaWFsaXplcjogJ0F0b21SdW5uZXJWaWV3J1xuICAgIHRpdGxlOiBAdGl0bGVcbiAgICBvdXRwdXQ6IEBfb3V0cHV0Lmh0bWwoKVxuICAgIGZvb3RlcjogQF9mb290ZXIuaHRtbCgpXG5cbiAgZ2V0VGl0bGU6IC0+XG4gICAgXCJBdG9tIFJ1bm5lcjogI3tAdGl0bGV9XCJcblxuICBzZXRUaXRsZTogKHRpdGxlKSAtPlxuICAgIEB0aXRsZSA9IHRpdGxlXG4gICAgQGZpbmQoJ2gxJykuaHRtbChAZ2V0VGl0bGUoKSlcblxuICBjbGVhcjogLT5cbiAgICBAX291dHB1dC5odG1sKCcnKVxuICAgIEBfZm9vdGVyLmh0bWwoJycpXG5cbiAgYXBwZW5kOiAodGV4dCwgY2xhc3NOYW1lKSAtPlxuICAgIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dClcbiAgICBzcGFuLmFwcGVuZENoaWxkKG5vZGUpXG4gICAgc3Bhbi5pbm5lckhUTUwgPSBuZXcgQW5zaVRvSHRtbCgpLnRvSHRtbChzcGFuLmlubmVySFRNTClcbiAgICBzcGFuLmNsYXNzTmFtZSA9IGNsYXNzTmFtZSB8fCAnc3Rkb3V0J1xuICAgIEBfb3V0cHV0LmFwcGVuZChzcGFuKVxuICBcbiAgYXBwZW5kRm9vdGVyOiAodGV4dCkgLT5cbiAgICBAX2Zvb3Rlci5odG1sKEBfZm9vdGVyLmh0bWwoKSArIHRleHQpXG5cbiAgZm9vdGVyOiAodGV4dCkgLT5cbiAgICBAX2Zvb3Rlci5odG1sKHRleHQpXG4iXX0=
