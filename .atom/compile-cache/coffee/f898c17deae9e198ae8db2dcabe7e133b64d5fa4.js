(function() {
  module.exports = {
    get: function() {
      var sublimeTabs, treeView;
      if (atom.packages.isPackageLoaded('tree-view')) {
        treeView = atom.packages.getLoadedPackage('tree-view');
        treeView = require(treeView.mainModulePath).getTreeViewInstance();
        return treeView.serialize();
      } else if (atom.packages.isPackageLoaded('sublime-tabs')) {
        sublimeTabs = atom.packages.getLoadedPackage('sublime-tabs');
        sublimeTabs = require(sublimeTabs.mainModulePath);
        return sublimeTabs.serialize();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2NvbnRleHQtcGFja2FnZS1maW5kZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLEdBQUEsRUFBSyxTQUFBO0FBQ0gsVUFBQTtNQUFBLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLFdBQTlCLENBQUg7UUFDRSxRQUFBLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQjtRQUNYLFFBQUEsR0FBVyxPQUFBLENBQVEsUUFBUSxDQUFDLGNBQWpCLENBQWdDLENBQUMsbUJBQWpDLENBQUE7ZUFDWCxRQUFRLENBQUMsU0FBVCxDQUFBLEVBSEY7T0FBQSxNQUlLLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLGNBQTlCLENBQUg7UUFDSCxXQUFBLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixjQUEvQjtRQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsV0FBVyxDQUFDLGNBQXBCO2VBQ2QsV0FBVyxDQUFDLFNBQVosQ0FBQSxFQUhHOztJQUxGLENBQUw7O0FBREYiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG4gIGdldDogLT5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgndHJlZS12aWV3JylcbiAgICAgIHRyZWVWaWV3ID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCd0cmVlLXZpZXcnKVxuICAgICAgdHJlZVZpZXcgPSByZXF1aXJlKHRyZWVWaWV3Lm1haW5Nb2R1bGVQYXRoKS5nZXRUcmVlVmlld0luc3RhbmNlKClcbiAgICAgIHRyZWVWaWV3LnNlcmlhbGl6ZSgpXG4gICAgZWxzZSBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUxvYWRlZCgnc3VibGltZS10YWJzJylcbiAgICAgIHN1YmxpbWVUYWJzID0gYXRvbS5wYWNrYWdlcy5nZXRMb2FkZWRQYWNrYWdlKCdzdWJsaW1lLXRhYnMnKVxuICAgICAgc3VibGltZVRhYnMgPSByZXF1aXJlKHN1YmxpbWVUYWJzLm1haW5Nb2R1bGVQYXRoKVxuICAgICAgc3VibGltZVRhYnMuc2VyaWFsaXplKClcbiJdfQ==
