Object.defineProperty(exports, "__esModule", {
  value: true
});

var Config = {
  getJson: function getJson(key) {
    var _default = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var value = atom.config.get("Hydrogen." + key);
    if (!value || typeof value !== "string") return _default;
    try {
      return JSON.parse(value);
    } catch (error) {
      var message = "Your Hydrogen config is broken: " + key;
      atom.notifications.addError(message, { detail: error });
    }
    return _default;
  },

  schema: {
    autocomplete: {
      title: "Enable Autocomplete",
      includeTitle: false,
      description: "If enabled, use autocomplete options provided by the current kernel.",
      type: "boolean",
      "default": true
    },
    autoScroll: {
      title: "Enable Autoscroll",
      includeTitle: false,
      description: "If enabled, Hydrogen will automatically scroll to the bottom of the result view.",
      type: "boolean",
      "default": true
    },
    outputAreaFontSize: {
      title: "Output area fontsize",
      includeTitle: false,
      description: "Change the fontsize of the Output area.",
      type: "integer",
      minimum: 0,
      "default": 0
    },
    debug: {
      title: "Enable Debug Messages",
      includeTitle: false,
      description: "If enabled, log debug messages onto the dev console.",
      type: "boolean",
      "default": false
    },
    startDir: {
      title: "Directory to start kernel in",
      includeTitle: false,
      description: "Restart the kernel for changes to take effect.",
      type: "string",
      "enum": [{
        value: "firstProjectDir",
        description: "The first started project's directory (default)"
      }, {
        value: "projectDirOfFile",
        description: "The project directory relative to the file"
      }, {
        value: "dirOfFile",
        description: "Current directory of the file"
      }],
      "default": "firstProjectDir"
    },
    kernelNotifications: {
      title: "Enable Kernel Notifications",
      includeTitle: false,
      description: "Notify if kernels writes to stdout. By default, kernel notifications are only displayed in the developer console.",
      type: "boolean",
      "default": false
    },
    gateways: {
      title: "Kernel Gateways",
      includeTitle: false,
      description: 'Hydrogen can connect to remote notebook servers and kernel gateways. Each gateway needs at minimum a name and a value for options.baseUrl. The options are passed directly to the `jupyter-js-services` npm package, which includes documentation for additional fields. Example value: ``` [{ "name": "Remote notebook", "options": { "baseUrl": "http://mysite.com:8888" } }] ```',
      type: "string",
      "default": "[]"
    },
    kernelspec: {
      title: "Kernel Specs",
      includeTitle: false,
      description: 'This field is populated on every launch or by invoking the command `hydrogen:update-kernels`. It contains the JSON string resulting from running `jupyter kernelspec list --json` or `ipython kernelspec list --json`. You can also edit this field and specify custom kernel specs , like this: ``` { "kernelspecs": { "ijavascript": { "spec": { "display_name": "IJavascript", "env": {}, "argv": [ "node", "/home/user/node_modules/ijavascript/lib/kernel.js", "--protocol=5.0", "{connection_file}" ], "language": "javascript" }, "resources_dir": "/home/user/node_modules/ijavascript/images" } } } ```',
      type: "string",
      "default": "{}"
    },
    languageMappings: {
      title: "Language Mappings",
      includeTitle: false,
      description: 'Custom Atom grammars and some kernels use non-standard language names. That leaves Hydrogen unable to figure out what kernel to start for your code. This field should be a valid JSON mapping from a kernel language name to Atom\'s grammar name ``` { "kernel name": "grammar name" } ```. For example ``` { "scala211": "scala", "javascript": "babel es6 javascript", "python": "magicpython" } ```.',
      type: "string",
      "default": "{}"
    },
    startupCode: {
      title: "Startup Code",
      includeTitle: false,
      description: 'This code will be executed on kernel startup. Format: `{"kernel": "your code \\nmore code"}`. Example: `{"Python 2": "%matplotlib inline"}`',
      type: "string",
      "default": "{}"
    },
    outputAreaDock: {
      title: "Output Area Dock",
      description: "Do not close dock when switching to an editor without a running kernel",
      type: "boolean",
      "default": false
    }
  }
};

exports["default"] = Config;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLElBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBTyxFQUFBLGlCQUFDLEdBQVcsRUFBeUI7UUFBdkIsUUFBZ0IseURBQUcsRUFBRTs7QUFDeEMsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWEsR0FBRyxDQUFHLENBQUM7QUFDakQsUUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsT0FBTyxRQUFRLENBQUM7QUFDekQsUUFBSTtBQUNGLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsVUFBTSxPQUFPLHdDQUFzQyxHQUFHLEFBQUUsQ0FBQztBQUN6RCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN6RDtBQUNELFdBQU8sUUFBUSxDQUFDO0dBQ2pCOztBQUVELFFBQU0sRUFBRTtBQUNOLGdCQUFZLEVBQUU7QUFDWixXQUFLLEVBQUUscUJBQXFCO0FBQzVCLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUNULHNFQUFzRTtBQUN4RSxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7S0FDZDtBQUNELGNBQVUsRUFBRTtBQUNWLFdBQUssRUFBRSxtQkFBbUI7QUFDMUIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1Qsa0ZBQWtGO0FBQ3BGLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0Qsc0JBQWtCLEVBQUU7QUFDbEIsV0FBSyxFQUFFLHNCQUFzQjtBQUM3QixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFBRSx5Q0FBeUM7QUFDdEQsVUFBSSxFQUFFLFNBQVM7QUFDZixhQUFPLEVBQUUsQ0FBQztBQUNWLGlCQUFTLENBQUM7S0FDWDtBQUNELFNBQUssRUFBRTtBQUNMLFdBQUssRUFBRSx1QkFBdUI7QUFDOUIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQUUsc0RBQXNEO0FBQ25FLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsS0FBSztLQUNmO0FBQ0QsWUFBUSxFQUFFO0FBQ1IsV0FBSyxFQUFFLDhCQUE4QjtBQUNyQyxrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFBRSxnREFBZ0Q7QUFDN0QsVUFBSSxFQUFFLFFBQVE7QUFDZCxjQUFNLENBQ0o7QUFDRSxhQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLG1CQUFXLEVBQUUsaURBQWlEO09BQy9ELEVBQ0Q7QUFDRSxhQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLG1CQUFXLEVBQUUsNENBQTRDO09BQzFELEVBQ0Q7QUFDRSxhQUFLLEVBQUUsV0FBVztBQUNsQixtQkFBVyxFQUFFLCtCQUErQjtPQUM3QyxDQUNGO0FBQ0QsaUJBQVMsaUJBQWlCO0tBQzNCO0FBQ0QsdUJBQW1CLEVBQUU7QUFDbkIsV0FBSyxFQUFFLDZCQUE2QjtBQUNwQyxrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCxtSEFBbUg7QUFDckgsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxZQUFRLEVBQUU7QUFDUixXQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUNULHFYQUFxWDtBQUN2WCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLElBQUk7S0FDZDtBQUNELGNBQVUsRUFBRTtBQUNWLFdBQUssRUFBRSxjQUFjO0FBQ3JCLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUNULGtsQkFBa2xCO0FBQ3BsQixVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLElBQUk7S0FDZDtBQUNELG9CQUFnQixFQUFFO0FBQ2hCLFdBQUssRUFBRSxtQkFBbUI7QUFDMUIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1QsMllBQTJZO0FBQzdZLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsZUFBVyxFQUFFO0FBQ1gsV0FBSyxFQUFFLGNBQWM7QUFDckIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1QsNklBQTZJO0FBQy9JLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsSUFBSTtLQUNkO0FBQ0Qsa0JBQWMsRUFBRTtBQUNkLFdBQUssRUFBRSxrQkFBa0I7QUFDekIsaUJBQVcsRUFDVCx3RUFBd0U7QUFDMUUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7R0FDRjtDQUNGLENBQUM7O3FCQUVhLE1BQU0iLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmNvbnN0IENvbmZpZyA9IHtcbiAgZ2V0SnNvbihrZXk6IHN0cmluZywgX2RlZmF1bHQ6IE9iamVjdCA9IHt9KSB7XG4gICAgY29uc3QgdmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQoYEh5ZHJvZ2VuLiR7a2V5fWApO1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSByZXR1cm4gX2RlZmF1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGBZb3VyIEh5ZHJvZ2VuIGNvbmZpZyBpcyBicm9rZW46ICR7a2V5fWA7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgeyBkZXRhaWw6IGVycm9yIH0pO1xuICAgIH1cbiAgICByZXR1cm4gX2RlZmF1bHQ7XG4gIH0sXG5cbiAgc2NoZW1hOiB7XG4gICAgYXV0b2NvbXBsZXRlOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgQXV0b2NvbXBsZXRlXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiSWYgZW5hYmxlZCwgdXNlIGF1dG9jb21wbGV0ZSBvcHRpb25zIHByb3ZpZGVkIGJ5IHRoZSBjdXJyZW50IGtlcm5lbC5cIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgYXV0b1Njcm9sbDoge1xuICAgICAgdGl0bGU6IFwiRW5hYmxlIEF1dG9zY3JvbGxcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJJZiBlbmFibGVkLCBIeWRyb2dlbiB3aWxsIGF1dG9tYXRpY2FsbHkgc2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIHJlc3VsdCB2aWV3LlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBvdXRwdXRBcmVhRm9udFNpemU6IHtcbiAgICAgIHRpdGxlOiBcIk91dHB1dCBhcmVhIGZvbnRzaXplXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIHRoZSBmb250c2l6ZSBvZiB0aGUgT3V0cHV0IGFyZWEuXCIsXG4gICAgICB0eXBlOiBcImludGVnZXJcIixcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAwXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgdGl0bGU6IFwiRW5hYmxlIERlYnVnIE1lc3NhZ2VzXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgZW5hYmxlZCwgbG9nIGRlYnVnIG1lc3NhZ2VzIG9udG8gdGhlIGRldiBjb25zb2xlLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgc3RhcnREaXI6IHtcbiAgICAgIHRpdGxlOiBcIkRpcmVjdG9yeSB0byBzdGFydCBrZXJuZWwgaW5cIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZXN0YXJ0IHRoZSBrZXJuZWwgZm9yIGNoYW5nZXMgdG8gdGFrZSBlZmZlY3QuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW51bTogW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IFwiZmlyc3RQcm9qZWN0RGlyXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGZpcnN0IHN0YXJ0ZWQgcHJvamVjdCdzIGRpcmVjdG9yeSAoZGVmYXVsdClcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IFwicHJvamVjdERpck9mRmlsZVwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBwcm9qZWN0IGRpcmVjdG9yeSByZWxhdGl2ZSB0byB0aGUgZmlsZVwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogXCJkaXJPZkZpbGVcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJDdXJyZW50IGRpcmVjdG9yeSBvZiB0aGUgZmlsZVwiXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBkZWZhdWx0OiBcImZpcnN0UHJvamVjdERpclwiXG4gICAgfSxcbiAgICBrZXJuZWxOb3RpZmljYXRpb25zOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgS2VybmVsIE5vdGlmaWNhdGlvbnNcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJOb3RpZnkgaWYga2VybmVscyB3cml0ZXMgdG8gc3Rkb3V0LiBCeSBkZWZhdWx0LCBrZXJuZWwgbm90aWZpY2F0aW9ucyBhcmUgb25seSBkaXNwbGF5ZWQgaW4gdGhlIGRldmVsb3BlciBjb25zb2xlLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZ2F0ZXdheXM6IHtcbiAgICAgIHRpdGxlOiBcIktlcm5lbCBHYXRld2F5c1wiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnSHlkcm9nZW4gY2FuIGNvbm5lY3QgdG8gcmVtb3RlIG5vdGVib29rIHNlcnZlcnMgYW5kIGtlcm5lbCBnYXRld2F5cy4gRWFjaCBnYXRld2F5IG5lZWRzIGF0IG1pbmltdW0gYSBuYW1lIGFuZCBhIHZhbHVlIGZvciBvcHRpb25zLmJhc2VVcmwuIFRoZSBvcHRpb25zIGFyZSBwYXNzZWQgZGlyZWN0bHkgdG8gdGhlIGBqdXB5dGVyLWpzLXNlcnZpY2VzYCBucG0gcGFja2FnZSwgd2hpY2ggaW5jbHVkZXMgZG9jdW1lbnRhdGlvbiBmb3IgYWRkaXRpb25hbCBmaWVsZHMuIEV4YW1wbGUgdmFsdWU6IGBgYCBbeyBcIm5hbWVcIjogXCJSZW1vdGUgbm90ZWJvb2tcIiwgXCJvcHRpb25zXCI6IHsgXCJiYXNlVXJsXCI6IFwiaHR0cDovL215c2l0ZS5jb206ODg4OFwiIH0gfV0gYGBgJyxcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcIltdXCJcbiAgICB9LFxuICAgIGtlcm5lbHNwZWM6IHtcbiAgICAgIHRpdGxlOiBcIktlcm5lbCBTcGVjc1wiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnVGhpcyBmaWVsZCBpcyBwb3B1bGF0ZWQgb24gZXZlcnkgbGF1bmNoIG9yIGJ5IGludm9raW5nIHRoZSBjb21tYW5kIGBoeWRyb2dlbjp1cGRhdGUta2VybmVsc2AuIEl0IGNvbnRhaW5zIHRoZSBKU09OIHN0cmluZyByZXN1bHRpbmcgZnJvbSBydW5uaW5nIGBqdXB5dGVyIGtlcm5lbHNwZWMgbGlzdCAtLWpzb25gIG9yIGBpcHl0aG9uIGtlcm5lbHNwZWMgbGlzdCAtLWpzb25gLiBZb3UgY2FuIGFsc28gZWRpdCB0aGlzIGZpZWxkIGFuZCBzcGVjaWZ5IGN1c3RvbSBrZXJuZWwgc3BlY3MgLCBsaWtlIHRoaXM6IGBgYCB7IFwia2VybmVsc3BlY3NcIjogeyBcImlqYXZhc2NyaXB0XCI6IHsgXCJzcGVjXCI6IHsgXCJkaXNwbGF5X25hbWVcIjogXCJJSmF2YXNjcmlwdFwiLCBcImVudlwiOiB7fSwgXCJhcmd2XCI6IFsgXCJub2RlXCIsIFwiL2hvbWUvdXNlci9ub2RlX21vZHVsZXMvaWphdmFzY3JpcHQvbGliL2tlcm5lbC5qc1wiLCBcIi0tcHJvdG9jb2w9NS4wXCIsIFwie2Nvbm5lY3Rpb25fZmlsZX1cIiBdLCBcImxhbmd1YWdlXCI6IFwiamF2YXNjcmlwdFwiIH0sIFwicmVzb3VyY2VzX2RpclwiOiBcIi9ob21lL3VzZXIvbm9kZV9tb2R1bGVzL2lqYXZhc2NyaXB0L2ltYWdlc1wiIH0gfSB9IGBgYCcsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZGVmYXVsdDogXCJ7fVwiXG4gICAgfSxcbiAgICBsYW5ndWFnZU1hcHBpbmdzOiB7XG4gICAgICB0aXRsZTogXCJMYW5ndWFnZSBNYXBwaW5nc1wiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnQ3VzdG9tIEF0b20gZ3JhbW1hcnMgYW5kIHNvbWUga2VybmVscyB1c2Ugbm9uLXN0YW5kYXJkIGxhbmd1YWdlIG5hbWVzLiBUaGF0IGxlYXZlcyBIeWRyb2dlbiB1bmFibGUgdG8gZmlndXJlIG91dCB3aGF0IGtlcm5lbCB0byBzdGFydCBmb3IgeW91ciBjb2RlLiBUaGlzIGZpZWxkIHNob3VsZCBiZSBhIHZhbGlkIEpTT04gbWFwcGluZyBmcm9tIGEga2VybmVsIGxhbmd1YWdlIG5hbWUgdG8gQXRvbVxcJ3MgZ3JhbW1hciBuYW1lIGBgYCB7IFwia2VybmVsIG5hbWVcIjogXCJncmFtbWFyIG5hbWVcIiB9IGBgYC4gRm9yIGV4YW1wbGUgYGBgIHsgXCJzY2FsYTIxMVwiOiBcInNjYWxhXCIsIFwiamF2YXNjcmlwdFwiOiBcImJhYmVsIGVzNiBqYXZhc2NyaXB0XCIsIFwicHl0aG9uXCI6IFwibWFnaWNweXRob25cIiB9IGBgYC4nLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6IFwie31cIlxuICAgIH0sXG4gICAgc3RhcnR1cENvZGU6IHtcbiAgICAgIHRpdGxlOiBcIlN0YXJ0dXAgQ29kZVwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnVGhpcyBjb2RlIHdpbGwgYmUgZXhlY3V0ZWQgb24ga2VybmVsIHN0YXJ0dXAuIEZvcm1hdDogYHtcImtlcm5lbFwiOiBcInlvdXIgY29kZSBcXFxcbm1vcmUgY29kZVwifWAuIEV4YW1wbGU6IGB7XCJQeXRob24gMlwiOiBcIiVtYXRwbG90bGliIGlubGluZVwifWAnLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6IFwie31cIlxuICAgIH0sXG4gICAgb3V0cHV0QXJlYURvY2s6IHtcbiAgICAgIHRpdGxlOiBcIk91dHB1dCBBcmVhIERvY2tcIixcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIkRvIG5vdCBjbG9zZSBkb2NrIHdoZW4gc3dpdGNoaW5nIHRvIGFuIGVkaXRvciB3aXRob3V0IGEgcnVubmluZyBrZXJuZWxcIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbmZpZztcbiJdfQ==