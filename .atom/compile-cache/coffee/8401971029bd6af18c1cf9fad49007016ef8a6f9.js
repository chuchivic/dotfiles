(function() {
  var CSON, defaults, engines, filetypes, getConfigFile, packagePath, path, prefix,
    slice = [].slice;

  CSON = require("season");

  path = require("path");

  prefix = "markdown-writer";

  packagePath = atom.packages.resolvePackagePath("markdown-writer");

  getConfigFile = function() {
    var parts;
    parts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (packagePath) {
      return path.join.apply(path, [packagePath, "lib"].concat(slice.call(parts)));
    } else {
      return path.join.apply(path, [__dirname].concat(slice.call(parts)));
    }
  };

  defaults = CSON.readFileSync(getConfigFile("config.cson"));

  defaults["siteEngine"] = "general";

  defaults["projectConfigFile"] = "_mdwriter.cson";

  defaults["siteLinkPath"] = path.join(atom.getConfigDirPath(), prefix + "-links.cson");

  defaults["grammars"] = ['source.gfm', 'source.gfm.nvatom', 'source.litcoffee', 'source.asciidoc', 'text.md', 'text.plain', 'text.plain.null-grammar'];

  filetypes = {
    'source.asciidoc': CSON.readFileSync(getConfigFile("filetypes", "asciidoc.cson"))
  };

  engines = {
    html: {
      imageTag: "<a href=\"{site}/{slug}.html\" target=\"_blank\">\n  <img class=\"align{align}\" alt=\"{alt}\" src=\"{src}\" width=\"{width}\" height=\"{height}\" />\n</a>"
    },
    jekyll: {
      textStyles: {
        codeblock: {
          before: "{% highlight %}\n",
          after: "\n{% endhighlight %}",
          regexBefore: "{% highlight(?: .+)? %}\\r?\\n",
          regexAfter: "\\r?\\n{% endhighlight %}"
        }
      }
    },
    octopress: {
      imageTag: "{% img {align} {src} {width} {height} '{alt}' %}"
    },
    hexo: {
      newPostFileName: "{title}{extension}",
      frontMatter: "layout: \"{layout}\"\ntitle: \"{title}\"\ndate: \"{date}\"\n---"
    }
  };

  module.exports = {
    projectConfigs: {},
    engineNames: function() {
      return Object.keys(engines);
    },
    keyPath: function(key) {
      return prefix + "." + key;
    },
    get: function(key, options) {
      var allow_blank, config, i, len, ref, val;
      if (options == null) {
        options = {};
      }
      allow_blank = options["allow_blank"] != null ? options["allow_blank"] : true;
      ref = ["Project", "User", "Engine", "Filetype", "Default"];
      for (i = 0, len = ref.length; i < len; i++) {
        config = ref[i];
        val = this["get" + config](key);
        if (allow_blank) {
          if (val != null) {
            return val;
          }
        } else {
          if (val) {
            return val;
          }
        }
      }
    },
    set: function(key, val) {
      return atom.config.set(this.keyPath(key), val);
    },
    restoreDefault: function(key) {
      return atom.config.unset(this.keyPath(key));
    },
    getDefault: function(key) {
      return this._valueForKeyPath(defaults, key);
    },
    getFiletype: function(key) {
      var editor, filetypeConfig;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return void 0;
      }
      filetypeConfig = filetypes[editor.getGrammar().scopeName];
      if (filetypeConfig == null) {
        return void 0;
      }
      return this._valueForKeyPath(filetypeConfig, key);
    },
    getEngine: function(key) {
      var engine, engineConfig;
      engine = this.getProject("siteEngine") || this.getUser("siteEngine") || this.getDefault("siteEngine");
      engineConfig = engines[engine];
      if (engineConfig == null) {
        return void 0;
      }
      return this._valueForKeyPath(engineConfig, key);
    },
    getCurrentDefault: function(key) {
      return this.getEngine(key) || this.getDefault(key);
    },
    getUser: function(key) {
      return atom.config.get(this.keyPath(key), {
        sources: [atom.config.getUserConfigPath()]
      });
    },
    getProject: function(key) {
      var config, configFile;
      configFile = this.getProjectConfigFile();
      if (!configFile) {
        return;
      }
      config = this._loadProjectConfig(configFile);
      return this._valueForKeyPath(config, key);
    },
    getSampleConfigFile: function() {
      return getConfigFile("config.cson");
    },
    getProjectConfigFile: function() {
      var fileName, projectPath;
      if (!atom.project || atom.project.getPaths().length < 1) {
        return;
      }
      projectPath = atom.project.getPaths()[0];
      fileName = this.getUser("projectConfigFile") || this.getDefault("projectConfigFile");
      return path.join(projectPath, fileName);
    },
    _loadProjectConfig: function(configFile) {
      var error;
      if (this.projectConfigs[configFile]) {
        return this.projectConfigs[configFile];
      }
      try {
        return this.projectConfigs[configFile] = CSON.readFileSync(configFile) || {};
      } catch (error1) {
        error = error1;
        if (atom.inDevMode() && !/ENOENT/.test(error.message)) {
          console.info("Markdown Writer [config.coffee]: " + error);
        }
        return this.projectConfigs[configFile] = {};
      }
    },
    _valueForKeyPath: function(object, keyPath) {
      var i, key, keys, len;
      keys = keyPath.split(".");
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        object = object[key];
        if (object == null) {
          return;
        }
      }
      return object;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb25maWcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0RUFBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBQSxHQUFTOztFQUNULFdBQUEsR0FBYyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFkLENBQWlDLGlCQUFqQzs7RUFDZCxhQUFBLEdBQWdCLFNBQUE7QUFDZCxRQUFBO0lBRGU7SUFDZixJQUFHLFdBQUg7YUFBb0IsSUFBSSxDQUFDLElBQUwsYUFBVSxDQUFBLFdBQUEsRUFBYSxLQUFPLFNBQUEsV0FBQSxLQUFBLENBQUEsQ0FBOUIsRUFBcEI7S0FBQSxNQUFBO2FBQ0ssSUFBSSxDQUFDLElBQUwsYUFBVSxDQUFBLFNBQVcsU0FBQSxXQUFBLEtBQUEsQ0FBQSxDQUFyQixFQURMOztFQURjOztFQUtoQixRQUFBLEdBQVcsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsYUFBQSxDQUFjLGFBQWQsQ0FBbEI7O0VBR1gsUUFBUyxDQUFBLFlBQUEsQ0FBVCxHQUF5Qjs7RUFHekIsUUFBUyxDQUFBLG1CQUFBLENBQVQsR0FBZ0M7O0VBR2hDLFFBQVMsQ0FBQSxjQUFBLENBQVQsR0FBMkIsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUFWLEVBQXNDLE1BQUQsR0FBUSxhQUE3Qzs7RUFFM0IsUUFBUyxDQUFBLFVBQUEsQ0FBVCxHQUF1QixDQUNyQixZQURxQixFQUVyQixtQkFGcUIsRUFHckIsa0JBSHFCLEVBSXJCLGlCQUpxQixFQUtyQixTQUxxQixFQU1yQixZQU5xQixFQU9yQix5QkFQcUI7O0VBV3ZCLFNBQUEsR0FDRTtJQUFBLGlCQUFBLEVBQW1CLElBQUksQ0FBQyxZ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QUFBLGNBQWUsQ0FBQSxVQUFBLENBQWhCLEdBQThCLElBQUksQ0FBQyxZQUFMLENBQWtCLFVBQWxCLENBQUEsSUFBaUMsR0FGakU7T0FBQSxjQUFBO1FBR007UUFHSixJQUFHLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBQSxJQUFvQixDQUFDLFFBQVEsQ0FBQyxJQUFULENBQWMsS0FBSyxDQUFDLE9BQXBCLENBQXhCO1VBQ0UsT0FBTyxDQUFDLElBQVIsQ0FBYSxtQ0FBQSxHQUFvQyxLQUFqRCxFQURGOztlQUdBLElBQUMsQ0FBQSxjQUFlLENBQUEsVUFBQSxDQUFoQixHQUE4QixHQVRoQzs7SUFIa0IsQ0F2RXBCO0lBcUZBLGdCQUFBLEVBQWtCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDaEIsVUFBQTtNQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsS0FBUixDQUFjLEdBQWQ7QUFDUCxXQUFBLHNDQUFBOztRQUNFLE1BQUEsR0FBUyxNQUFPLENBQUEsR0FBQTtRQUNoQixJQUFjLGNBQWQ7QUFBQSxpQkFBQTs7QUFGRjthQUdBO0lBTGdCLENBckZsQjs7QUE5REYiLCJzb3VyY2VzQ29udGVudCI6WyJDU09OID0gcmVxdWlyZSBcInNlYXNvblwiXG5wYXRoID0gcmVxdWlyZSBcInBhdGhcIlxuXG5wcmVmaXggPSBcIm1hcmtkb3duLXdyaXRlclwiXG5wYWNrYWdlUGF0aCA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKFwibWFya2Rvd24td3JpdGVyXCIpXG5nZXRDb25maWdGaWxlID0gKHBhcnRzLi4uKSAtPlxuICBpZiBwYWNrYWdlUGF0aCB0aGVuIHBhdGguam9pbihwYWNrYWdlUGF0aCwgXCJsaWJcIiwgcGFydHMuLi4pXG4gIGVsc2UgcGF0aC5qb2luKF9fZGlybmFtZSwgcGFydHMuLi4pXG5cbiMgbG9hZCBzYW1wbGUgY29uZmlnIHRvIGRlZmF1bHRzXG5kZWZhdWx0cyA9IENTT04ucmVhZEZpbGVTeW5jKGdldENvbmZpZ0ZpbGUoXCJjb25maWcuY3NvblwiKSlcblxuIyBzdGF0aWMgZW5naW5lIG9mIHlvdXIgYmxvZywgc2VlIGBAZW5naW5lc2BcbmRlZmF1bHRzW1wic2l0ZUVuZ2luZVwiXSA9IFwiZ2VuZXJhbFwiXG4jIHByb2plY3Qgc3BlY2lmaWMgY29uZmlndXJhdGlvbiBmaWxlIG5hbWVcbiMgaHR0cHM6Ly9naXRodWIuY29tL3podW9jaHVuL21kLXdyaXRlci93aWtpL1NldHRpbmdzLWZvci1pbmRpdmlkdWFsLXByb2plY3RzXG5kZWZhdWx0c1tcInByb2plY3RDb25maWdGaWxlXCJdID0gXCJfbWR3cml0ZXIuY3NvblwiXG4jIHBhdGggdG8gYSBjc29uIGZpbGUgdGhhdCBzdG9yZXMgbGlua3MgYWRkZWQgZm9yIGF1dG9tYXRpYyBsaW5raW5nXG4jIGRlZmF1bHQgdG8gYG1hcmtkb3duLXdyaXRlci1saW5rcy5jc29uYCBmaWxlIHVuZGVyIHVzZXIncyBjb25maWcgZGlyZWN0b3J5XG5kZWZhdWx0c1tcInNpdGVMaW5rUGF0aFwiXSA9IHBhdGguam9pbihhdG9tLmdldENvbmZpZ0RpclBhdGgoKSwgXCIje3ByZWZpeH0tbGlua3MuY3NvblwiKVxuIyBmaWxldHlwZXMgbWFya2Rvd24td3JpdGVyIGNvbW1hbmRzIGFwcGx5XG5kZWZhdWx0c1tcImdyYW1tYXJzXCJdID0gW1xuICAnc291cmNlLmdmbSdcbiAgJ3NvdXJjZS5nZm0ubnZhdG9tJ1xuICAnc291cmNlLmxpdGNvZmZlZSdcbiAgJ3NvdXJjZS5hc2NpaWRvYydcbiAgJ3RleHQubWQnXG4gICd0ZXh0LnBsYWluJ1xuICAndGV4dC5wbGFpbi5udWxsLWdyYW1tYXInXG5dXG5cbiMgZmlsZXR5cGUgZGVmYXVsdHNcbmZpbGV0eXBlcyA9XG4gICdzb3VyY2UuYXNjaWlkb2MnOiBDU09OLnJlYWRGaWxlU3luYyhnZXRDb25maWdGaWxlKFwiZmlsZXR5cGVzXCIsIFwiYXNjaWlkb2MuY3NvblwiKSlcblxuIyBlbmdpbmUgZGVmYXVsdHNcbmVuZ2luZXMgPVxuICBodG1sOlxuICAgIGltYWdlVGFnOiBcIlwiXCJcbiAgICAgIDxhIGhyZWY9XCJ7c2l0ZX0ve3NsdWd9Lmh0bWxcIiB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgPGltZyBjbGFzcz1cImFsaWdue2FsaWdufVwiIGFsdD1cInthbHR9XCIgc3JjPVwie3NyY31cIiB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIC8+XG4gICAgICA8L2E+XG4gICAgICBcIlwiXCJcbiAgamVreWxsOlxuICAgIHRleHRTdHlsZXM6XG4gICAgICBjb2RlYmxvY2s6XG4gICAgICAgIGJlZm9yZTogXCJ7JSBoaWdobGlnaHQgJX1cXG5cIlxuICAgICAgICBhZnRlcjogXCJcXG57JSBlbmRoaWdobGlnaHQgJX1cIlxuICAgICAgICByZWdleEJlZm9yZTogXCJ7JSBoaWdobGlnaHQoPzogLispPyAlfVxcXFxyP1xcXFxuXCJcbiAgICAgICAgcmVnZXhBZnRlcjogXCJcXFxccj9cXFxcbnslIGVuZGhpZ2hsaWdodCAlfVwiXG4gIG9jdG9wcmVzczpcbiAgICBpbWFnZVRhZzogXCJ7JSBpbWcge2FsaWdufSB7c3JjfSB7d2lkdGh9IHtoZWlnaHR9ICd7YWx0fScgJX1cIlxuICBoZXhvOlxuICAgIG5ld1Bvc3RGaWxlTmFtZTogXCJ7dGl0bGV9e2V4dGVuc2lvbn1cIlxuICAgIGZyb250TWF0dGVyOiBcIlwiXCJcbiAgICAgIGxheW91dDogXCJ7bGF5b3V0fVwiXG4gICAgICB0aXRsZTogXCJ7dGl0bGV9XCJcbiAgICAgIGRhdGU6IFwie2RhdGV9XCJcbiAgICAgIC0tLVxuICAgICAgXCJcIlwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgcHJvamVjdENvbmZpZ3M6IHt9XG5cbiAgZW5naW5lTmFtZXM6IC0+IE9iamVjdC5rZXlzKGVuZ2luZXMpXG5cbiAga2V5UGF0aDogKGtleSkgLT4gXCIje3ByZWZpeH0uI3trZXl9XCJcblxuICBnZXQ6IChrZXksIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBhbGxvd19ibGFuayA9IGlmIG9wdGlvbnNbXCJhbGxvd19ibGFua1wiXT8gdGhlbiBvcHRpb25zW1wiYWxsb3dfYmxhbmtcIl0gZWxzZSB0cnVlXG5cbiAgICBmb3IgY29uZmlnIGluIFtcIlByb2plY3RcIiwgXCJVc2VyXCIsIFwiRW5naW5lXCIsIFwiRmlsZXR5cGVcIiwgXCJEZWZhdWx0XCJdXG4gICAgICB2YWwgPSBAW1wiZ2V0I3tjb25maWd9XCJdKGtleSlcblxuICAgICAgaWYgYWxsb3dfYmxhbmsgdGhlbiByZXR1cm4gdmFsIGlmIHZhbD9cbiAgICAgIGVsc2UgcmV0dXJuIHZhbCBpZiB2YWxcblxuICBzZXQ6IChrZXksIHZhbCkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoQGtleVBhdGgoa2V5KSwgdmFsKVxuXG4gIHJlc3RvcmVEZWZhdWx0OiAoa2V5KSAtPlxuICAgIGF0b20uY29uZmlnLnVuc2V0KEBrZXlQYXRoKGtleSkpXG5cbiAgIyBnZXQgY29uZmlnLmRlZmF1bHRzXG4gIGdldERlZmF1bHQ6IChrZXkpIC0+XG4gICAgQF92YWx1ZUZvcktleVBhdGgoZGVmYXVsdHMsIGtleSlcblxuICAjIGdldCBjb25maWcuZmlsZXR5cGVzW2ZpbGV0eXBlXSBiYXNlZCBvbiBjdXJyZW50IGZpbGVcbiAgZ2V0RmlsZXR5cGU6IChrZXkpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVuZGVmaW5lZCB1bmxlc3MgZWRpdG9yP1xuXG4gICAgZmlsZXR5cGVDb25maWcgPSBmaWxldHlwZXNbZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWVdXG4gICAgcmV0dXJuIHVuZGVmaW5lZCB1bmxlc3MgZmlsZXR5cGVDb25maWc/XG5cbiAgICBAX3ZhbHVlRm9yS2V5UGF0aChmaWxldHlwZUNvbmZpZywga2V5KVxuXG4gICMgZ2V0IGNvbmZpZy5lbmdpbmVzIGJhc2VkIG9uIHNpdGVFbmdpbmUgc2V0XG4gIGdldEVuZ2luZTogKGtleSkgLT5cbiAgICBlbmdpbmUgPSBAZ2V0UHJvamVjdChcInNpdGVFbmdpbmVcIikgfHxcbiAgICAgICAgICAgICBAZ2V0VXNlcihcInNpdGVFbmdpbmVcIikgfHxcbiAgICAgICAgICAgICBAZ2V0RGVmYXVsdChcInNpdGVFbmdpbmVcIilcblxuICAgIGVuZ2luZUNvbmZpZyA9IGVuZ2luZXNbZW5naW5lXVxuICAgIHJldHVybiB1bmRlZmluZWQgdW5sZXNzIGVuZ2luZUNvbmZpZz9cblxuICAgIEBfdmFsdWVGb3JLZXlQYXRoKGVuZ2luZUNvbmZpZywga2V5KVxuXG4gICMgZ2V0IGNvbmZpZyBiYXNlZCBvbiBlbmdpbmUgc2V0IG9yIGdsb2JhbCBkZWZhdWx0c1xuICBnZXRDdXJyZW50RGVmYXVsdDogKGtleSkgLT5cbiAgICBAZ2V0RW5naW5lKGtleSkgfHwgQGdldERlZmF1bHQoa2V5KVxuXG4gICMgZ2V0IGNvbmZpZyBmcm9tIHVzZXIncyBjb25maWcgZmlsZVxuICBnZXRVc2VyOiAoa2V5KSAtPlxuICAgIGF0b20uY29uZmlnLmdldChAa2V5UGF0aChrZXkpLCBzb3VyY2VzOiBbYXRvbS5jb25maWcuZ2V0VXNlckNvbmZpZ1BhdGgoKV0pXG5cbiAgIyBnZXQgcHJvamVjdCBzcGVjaWZpYyBjb25maWcgZnJvbSBwcm9qZWN0J3MgY29uZmlnIGZpbGVcbiAgZ2V0UHJvamVjdDogKGtleSkgLT5cbiAgICBjb25maWdGaWxlID0gQGdldFByb2plY3RDb25maWdGaWxlKClcbiAgICByZXR1cm4gdW5sZXNzIGNvbmZpZ0ZpbGVcblxuICAgIGNvbmZpZyA9IEBfbG9hZFByb2plY3RDb25maWcoY29uZmlnRmlsZSlcbiAgICBAX3ZhbHVlRm9yS2V5UGF0aChjb25maWcsIGtleSlcblxuICBnZXRTYW1wbGVDb25maWdGaWxlOiAtPiBnZXRDb25maWdGaWxlKFwiY29uZmlnLmNzb25cIilcblxuICBnZXRQcm9qZWN0Q29uZmlnRmlsZTogLT5cbiAgICByZXR1cm4gaWYgIWF0b20ucHJvamVjdCB8fCBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGggPCAxXG5cbiAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgZmlsZU5hbWUgPSBAZ2V0VXNlcihcInByb2plY3RDb25maWdGaWxlXCIpIHx8IEBnZXREZWZhdWx0KFwicHJvamVjdENvbmZpZ0ZpbGVcIilcbiAgICBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGZpbGVOYW1lKVxuXG4gIF9sb2FkUHJvamVjdENvbmZpZzogKGNvbmZpZ0ZpbGUpIC0+XG4gICAgcmV0dXJuIEBwcm9qZWN0Q29uZmlnc1tjb25maWdGaWxlXSBpZiBAcHJvamVjdENvbmZpZ3NbY29uZmlnRmlsZV1cblxuICAgIHRyeVxuICAgICAgIyB3aGVuIGNvbmZpZ0ZpbGUgaXMgZW1wdHksIENTT04gcmV0dXJuIHVuZGVmaW5lZCwgZmFsbGJhY2sgdG8ge31cbiAgICAgIEBwcm9qZWN0Q29uZmlnc1tjb25maWdGaWxlXSA9IENTT04ucmVhZEZpbGVTeW5jKGNvbmZpZ0ZpbGUpIHx8IHt9XG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgICMgbG9nIGVycm9yIG1lc3NhZ2UgaW4gZGV2IG1vZGUgZm9yIGVhc2llciB0cm91Ymxlc2hvdHRpbmcsXG4gICAgICAjIGJ1dCBpZ25vcmluZyBmaWxlIG5vdCBleGlzdHMgZXJyb3JcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgJiYgIS9FTk9FTlQvLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgY29uc29sZS5pbmZvKFwiTWFya2Rvd24gV3JpdGVyIFtjb25maWcuY29mZmVlXTogI3tlcnJvcn1cIilcblxuICAgICAgQHByb2plY3RDb25maWdzW2NvbmZpZ0ZpbGVdID0ge31cblxuICBfdmFsdWVGb3JLZXlQYXRoOiAob2JqZWN0LCBrZXlQYXRoKSAtPlxuICAgIGtleXMgPSBrZXlQYXRoLnNwbGl0KFwiLlwiKVxuICAgIGZvciBrZXkgaW4ga2V5c1xuICAgICAgb2JqZWN0ID0gb2JqZWN0W2tleV1cbiAgICAgIHJldHVybiB1bmxlc3Mgb2JqZWN0P1xuICAgIG9iamVjdFxuIl19
