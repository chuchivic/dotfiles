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
    kernelspec: {},
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
      title: "Leave output dock open",
      description: "Do not close dock when switching to an editor without a running kernel",
      type: "boolean",
      "default": false
    },
    outputAreaDefault: {
      title: "View output in the dock by default",
      description: "If enabled, output will be displayed in the dock by default rather than inline",
      type: "boolean",
      "default": false
    }
  }
};

exports["default"] = Config;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLElBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBTyxFQUFBLGlCQUFDLEdBQVcsRUFBeUI7UUFBdkIsUUFBZ0IseURBQUcsRUFBRTs7QUFDeEMsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWEsR0FBRyxDQUFHLENBQUM7QUFDakQsUUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsT0FBTyxRQUFRLENBQUM7QUFDekQsUUFBSTtBQUNGLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsVUFBTSxPQUFPLHdDQUFzQyxHQUFHLEFBQUUsQ0FBQztBQUN6RCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN6RDtBQUNELFdBQU8sUUFBUSxDQUFDO0dBQ2pCOztBQUVELFFBQU0sRUFBRTtBQUNOLGNBQVUsRUFBRSxFQUFFO0FBQ2QsZ0JBQVksRUFBRTtBQUNaLFdBQUssRUFBRSxxQkFBcUI7QUFDNUIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1Qsc0VBQXNFO0FBQ3hFLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsSUFBSTtLQUNkO0FBQ0QsY0FBVSxFQUFFO0FBQ1YsV0FBSyxFQUFFLG1CQUFtQjtBQUMxQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCxrRkFBa0Y7QUFDcEYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxzQkFBa0IsRUFBRTtBQUNsQixXQUFLLEVBQUUsc0JBQXNCO0FBQzdCLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUFFLHlDQUF5QztBQUN0RCxVQUFJLEVBQUUsU0FBUztBQUNmLGFBQU8sRUFBRSxDQUFDO0FBQ1YsaUJBQVMsQ0FBQztLQUNYO0FBQ0QsU0FBSyxFQUFFO0FBQ0wsV0FBSyxFQUFFLHVCQUF1QjtBQUM5QixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFBRSxzREFBc0Q7QUFDbkUsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7QUFDRCxZQUFRLEVBQUU7QUFDUixXQUFLLEVBQUUsOEJBQThCO0FBQ3JDLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUFFLGdEQUFnRDtBQUM3RCxVQUFJLEVBQUUsUUFBUTtBQUNkLGNBQU0sQ0FDSjtBQUNFLGFBQUssRUFBRSxpQkFBaUI7QUFDeEIsbUJBQVcsRUFBRSxpREFBaUQ7T0FDL0QsRUFDRDtBQUNFLGFBQUssRUFBRSxrQkFBa0I7QUFDekIsbUJBQVcsRUFBRSw0Q0FBNEM7T0FDMUQsRUFDRDtBQUNFLGFBQUssRUFBRSxXQUFXO0FBQ2xCLG1CQUFXLEVBQUUsK0JBQStCO09BQzdDLENBQ0Y7QUFDRCxpQkFBUyxpQkFBaUI7S0FDM0I7QUFDRCx1QkFBbUIsRUFBRTtBQUNuQixXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUNULG1IQUFtSDtBQUNySCxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELFlBQVEsRUFBRTtBQUNSLFdBQUssRUFBRSxpQkFBaUI7QUFDeEIsa0JBQVksRUFBRSxLQUFLO0FBQ25CLGlCQUFXLEVBQ1QscVhBQXFYO0FBQ3ZYLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsSUFBSTtLQUNkO0FBQ0Qsb0JBQWdCLEVBQUU7QUFDaEIsV0FBSyxFQUFFLG1CQUFtQjtBQUMxQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCwyWUFBMlk7QUFDN1ksVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxlQUFXLEVBQUU7QUFDWCxXQUFLLEVBQUUsY0FBYztBQUNyQixrQkFBWSxFQUFFLEtBQUs7QUFDbkIsaUJBQVcsRUFDVCw2SUFBNkk7QUFDL0ksVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxJQUFJO0tBQ2Q7QUFDRCxrQkFBYyxFQUFFO0FBQ2QsV0FBSyxFQUFFLHdCQUF3QjtBQUMvQixpQkFBVyxFQUNULHdFQUF3RTtBQUMxRSxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLEtBQUs7S0FDZjtBQUNELHFCQUFpQixFQUFFO0FBQ2pCLFdBQUssRUFBRSxvQ0FBb0M7QUFDM0MsaUJBQVcsRUFDVCxnRkFBZ0Y7QUFDbEYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxLQUFLO0tBQ2Y7R0FDRjtDQUNGLENBQUM7O3FCQUVhLE1BQU0iLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmNvbnN0IENvbmZpZyA9IHtcbiAgZ2V0SnNvbihrZXk6IHN0cmluZywgX2RlZmF1bHQ6IE9iamVjdCA9IHt9KSB7XG4gICAgY29uc3QgdmFsdWUgPSBhdG9tLmNvbmZpZy5nZXQoYEh5ZHJvZ2VuLiR7a2V5fWApO1xuICAgIGlmICghdmFsdWUgfHwgdHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSByZXR1cm4gX2RlZmF1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGBZb3VyIEh5ZHJvZ2VuIGNvbmZpZyBpcyBicm9rZW46ICR7a2V5fWA7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwgeyBkZXRhaWw6IGVycm9yIH0pO1xuICAgIH1cbiAgICByZXR1cm4gX2RlZmF1bHQ7XG4gIH0sXG5cbiAgc2NoZW1hOiB7XG4gICAga2VybmVsc3BlYzoge30sXG4gICAgYXV0b2NvbXBsZXRlOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgQXV0b2NvbXBsZXRlXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiSWYgZW5hYmxlZCwgdXNlIGF1dG9jb21wbGV0ZSBvcHRpb25zIHByb3ZpZGVkIGJ5IHRoZSBjdXJyZW50IGtlcm5lbC5cIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIH0sXG4gICAgYXV0b1Njcm9sbDoge1xuICAgICAgdGl0bGU6IFwiRW5hYmxlIEF1dG9zY3JvbGxcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJJZiBlbmFibGVkLCBIeWRyb2dlbiB3aWxsIGF1dG9tYXRpY2FsbHkgc2Nyb2xsIHRvIHRoZSBib3R0b20gb2YgdGhlIHJlc3VsdCB2aWV3LlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgfSxcbiAgICBvdXRwdXRBcmVhRm9udFNpemU6IHtcbiAgICAgIHRpdGxlOiBcIk91dHB1dCBhcmVhIGZvbnRzaXplXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246IFwiQ2hhbmdlIHRoZSBmb250c2l6ZSBvZiB0aGUgT3V0cHV0IGFyZWEuXCIsXG4gICAgICB0eXBlOiBcImludGVnZXJcIixcbiAgICAgIG1pbmltdW06IDAsXG4gICAgICBkZWZhdWx0OiAwXG4gICAgfSxcbiAgICBkZWJ1Zzoge1xuICAgICAgdGl0bGU6IFwiRW5hYmxlIERlYnVnIE1lc3NhZ2VzXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgZW5hYmxlZCwgbG9nIGRlYnVnIG1lc3NhZ2VzIG9udG8gdGhlIGRldiBjb25zb2xlLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgc3RhcnREaXI6IHtcbiAgICAgIHRpdGxlOiBcIkRpcmVjdG9yeSB0byBzdGFydCBrZXJuZWwgaW5cIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogXCJSZXN0YXJ0IHRoZSBrZXJuZWwgZm9yIGNoYW5nZXMgdG8gdGFrZSBlZmZlY3QuXCIsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZW51bTogW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IFwiZmlyc3RQcm9qZWN0RGlyXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIGZpcnN0IHN0YXJ0ZWQgcHJvamVjdCdzIGRpcmVjdG9yeSAoZGVmYXVsdClcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IFwicHJvamVjdERpck9mRmlsZVwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBwcm9qZWN0IGRpcmVjdG9yeSByZWxhdGl2ZSB0byB0aGUgZmlsZVwiXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogXCJkaXJPZkZpbGVcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJDdXJyZW50IGRpcmVjdG9yeSBvZiB0aGUgZmlsZVwiXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBkZWZhdWx0OiBcImZpcnN0UHJvamVjdERpclwiXG4gICAgfSxcbiAgICBrZXJuZWxOb3RpZmljYXRpb25zOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgS2VybmVsIE5vdGlmaWNhdGlvbnNcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJOb3RpZnkgaWYga2VybmVscyB3cml0ZXMgdG8gc3Rkb3V0LiBCeSBkZWZhdWx0LCBrZXJuZWwgbm90aWZpY2F0aW9ucyBhcmUgb25seSBkaXNwbGF5ZWQgaW4gdGhlIGRldmVsb3BlciBjb25zb2xlLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgZ2F0ZXdheXM6IHtcbiAgICAgIHRpdGxlOiBcIktlcm5lbCBHYXRld2F5c1wiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnSHlkcm9nZW4gY2FuIGNvbm5lY3QgdG8gcmVtb3RlIG5vdGVib29rIHNlcnZlcnMgYW5kIGtlcm5lbCBnYXRld2F5cy4gRWFjaCBnYXRld2F5IG5lZWRzIGF0IG1pbmltdW0gYSBuYW1lIGFuZCBhIHZhbHVlIGZvciBvcHRpb25zLmJhc2VVcmwuIFRoZSBvcHRpb25zIGFyZSBwYXNzZWQgZGlyZWN0bHkgdG8gdGhlIGBqdXB5dGVyLWpzLXNlcnZpY2VzYCBucG0gcGFja2FnZSwgd2hpY2ggaW5jbHVkZXMgZG9jdW1lbnRhdGlvbiBmb3IgYWRkaXRpb25hbCBmaWVsZHMuIEV4YW1wbGUgdmFsdWU6IGBgYCBbeyBcIm5hbWVcIjogXCJSZW1vdGUgbm90ZWJvb2tcIiwgXCJvcHRpb25zXCI6IHsgXCJiYXNlVXJsXCI6IFwiaHR0cDovL215c2l0ZS5jb206ODg4OFwiIH0gfV0gYGBgJyxcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcIltdXCJcbiAgICB9LFxuICAgIGxhbmd1YWdlTWFwcGluZ3M6IHtcbiAgICAgIHRpdGxlOiBcIkxhbmd1YWdlIE1hcHBpbmdzXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdDdXN0b20gQXRvbSBncmFtbWFycyBhbmQgc29tZSBrZXJuZWxzIHVzZSBub24tc3RhbmRhcmQgbGFuZ3VhZ2UgbmFtZXMuIFRoYXQgbGVhdmVzIEh5ZHJvZ2VuIHVuYWJsZSB0byBmaWd1cmUgb3V0IHdoYXQga2VybmVsIHRvIHN0YXJ0IGZvciB5b3VyIGNvZGUuIFRoaXMgZmllbGQgc2hvdWxkIGJlIGEgdmFsaWQgSlNPTiBtYXBwaW5nIGZyb20gYSBrZXJuZWwgbGFuZ3VhZ2UgbmFtZSB0byBBdG9tXFwncyBncmFtbWFyIG5hbWUgYGBgIHsgXCJrZXJuZWwgbmFtZVwiOiBcImdyYW1tYXIgbmFtZVwiIH0gYGBgLiBGb3IgZXhhbXBsZSBgYGAgeyBcInNjYWxhMjExXCI6IFwic2NhbGFcIiwgXCJqYXZhc2NyaXB0XCI6IFwiYmFiZWwgZXM2IGphdmFzY3JpcHRcIiwgXCJweXRob25cIjogXCJtYWdpY3B5dGhvblwiIH0gYGBgLicsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZGVmYXVsdDogXCJ7fVwiXG4gICAgfSxcbiAgICBzdGFydHVwQ29kZToge1xuICAgICAgdGl0bGU6IFwiU3RhcnR1cCBDb2RlXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdUaGlzIGNvZGUgd2lsbCBiZSBleGVjdXRlZCBvbiBrZXJuZWwgc3RhcnR1cC4gRm9ybWF0OiBge1wia2VybmVsXCI6IFwieW91ciBjb2RlIFxcXFxubW9yZSBjb2RlXCJ9YC4gRXhhbXBsZTogYHtcIlB5dGhvbiAyXCI6IFwiJW1hdHBsb3RsaWIgaW5saW5lXCJ9YCcsXG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgZGVmYXVsdDogXCJ7fVwiXG4gICAgfSxcbiAgICBvdXRwdXRBcmVhRG9jazoge1xuICAgICAgdGl0bGU6IFwiTGVhdmUgb3V0cHV0IGRvY2sgb3BlblwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiRG8gbm90IGNsb3NlIGRvY2sgd2hlbiBzd2l0Y2hpbmcgdG8gYW4gZWRpdG9yIHdpdGhvdXQgYSBydW5uaW5nIGtlcm5lbFwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH0sXG4gICAgb3V0cHV0QXJlYURlZmF1bHQ6IHtcbiAgICAgIHRpdGxlOiBcIlZpZXcgb3V0cHV0IGluIHRoZSBkb2NrIGJ5IGRlZmF1bHRcIixcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIG91dHB1dCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgZG9jayBieSBkZWZhdWx0IHJhdGhlciB0aGFuIGlubGluZVwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnO1xuIl19