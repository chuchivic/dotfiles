(function() {
  module.exports = {
    get: function() {
      var sublimeTabs, treeView;
      if (atom.packages.isPackageLoaded('tree-view')) {
        treeView = atom.packages.getLoadedPackage('tree-view');
        treeView = require(treeView.mainModulePath);
        return treeView.serialize();
      } else if (atom.packages.isPackageLoaded('sublime-tabs')) {
        sublimeTabs = atom.packages.getLoadedPackage('sublime-tabs');
        sublimeTabs = require(sublimeTabs.mainModulePath);
        return sublimeTabs.serialize();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2NvbnRleHQtcGFja2FnZS1maW5kZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLEdBQUEsRUFBSyxTQUFBO0FBQ0gsVUFBQTtNQUFBLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLENBQUg7UUFDRSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQjtRQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsUUFBUSxDQUFDLGNBQWpCO2VBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQSxFQUhGO09BQUEsTUFJSyxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixjQUE5QixDQUFIO1FBQ0gsV0FBQSxHQUFjLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsY0FBL0I7UUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLFdBQVcsQ0FBQyxjQUFwQjtlQUNkLFdBQVcsQ0FBQyxTQUFaLENBQUEsRUFIRzs7SUFMRixDQUFMOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBnZXQ6IC0+XG4gICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VMb2FkZWQoJ3RyZWUtdmlldycpXG4gICAgICB0cmVlVmlldyA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgndHJlZS12aWV3JylcbiAgICAgIHRyZWVWaWV3ID0gcmVxdWlyZSh0cmVlVmlldy5tYWluTW9kdWxlUGF0aClcbiAgICAgIHRyZWVWaWV3LnNlcmlhbGl6ZSgpXG4gICAgZWxzZSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgnc3VibGltZS10YWJzJylcbiAgICAgIHN1YmxpbWVUYWJzID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdzdWJsaW1lLXRhYnMnKVxuICAgICAgc3VibGltZVRhYnMgPSByZXF1aXJlKHN1YmxpbWVUYWJzLm1haW5Nb2R1bGVQYXRoKVxuICAgICAgc3VibGltZVRhYnMuc2VyaWFsaXplKClcbiJdfQ==
