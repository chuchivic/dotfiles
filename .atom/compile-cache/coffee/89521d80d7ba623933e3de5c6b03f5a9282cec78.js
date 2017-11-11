(function() {
  var OpenCheatSheet, pkgs, utils;

  utils = require("../utils");

  pkgs = {
    "markdown-preview": "markdown-preview",
    "markdown-preview-plus": "markdown-preview-plus"
  };

  module.exports = OpenCheatSheet = (function() {
    function OpenCheatSheet() {}

    OpenCheatSheet.prototype.trigger = function(e) {
      var protocal;
      protocal = this.getProtocal();
      if (!protocal) {
        return e.abortKeyBinding();
      }
      return atom.workspace.open(this.cheatsheetURL(protocal), {
        split: 'right',
        searchAllPanes: true
      });
    };

    OpenCheatSheet.prototype.getProtocal = function() {
      var pkg, protocal;
      for (pkg in pkgs) {
        protocal = pkgs[pkg];
        if (this.hasActivePackage(pkg)) {
          return protocal;
        }
      }
    };

    OpenCheatSheet.prototype.hasActivePackage = function(pkg) {
      return !!atom.packages.activePackages[pkg];
    };

    OpenCheatSheet.prototype.cheatsheetURL = function(protocal) {
      return protocal + "://" + (utils.getPackagePath("CHEATSHEET.md"));
    };

    return OpenCheatSheet;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9vcGVuLWNoZWF0LXNoZWV0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUdSLElBQUEsR0FDRTtJQUFBLGtCQUFBLEVBQW9CLGtCQUFwQjtJQUNBLHVCQUFBLEVBQXlCLHVCQUR6Qjs7O0VBR0YsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzZCQUNKLE9BQUEsR0FBUyxTQUFDLENBQUQ7QUFDUCxVQUFBO01BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxXQUFELENBQUE7TUFDWCxJQUFtQyxDQUFDLFFBQXBDO0FBQUEsZUFBTyxDQUFDLENBQUMsZUFBRixDQUFBLEVBQVA7O2FBRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLElBQUMsQ0FBQSxhQUFELENBQWUsUUFBZixDQUFwQixFQUNFO1FBQUEsS0FBQSxFQUFPLE9BQVA7UUFBZ0IsY0FBQSxFQUFnQixJQUFoQztPQURGO0lBSk87OzZCQU9ULFdBQUEsR0FBYSxTQUFBO0FBQ1gsVUFBQTtBQUFBLFdBQUEsV0FBQTs7UUFDRSxJQUFtQixJQUFDLENBQUEsZ0JBQUQsQ0FBa0IsR0FBbEIsQ0FBbkI7QUFBQSxpQkFBTyxTQUFQOztBQURGO0lBRFc7OzZCQUliLGdCQUFBLEdBQWtCLFNBQUMsR0FBRDthQUNoQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFlLENBQUEsR0FBQTtJQURmOzs2QkFHbEIsYUFBQSxHQUFlLFNBQUMsUUFBRDthQUNWLFFBQUQsR0FBVSxLQUFWLEdBQWMsQ0FBQyxLQUFLLENBQUMsY0FBTixDQUFxQixlQUFyQixDQUFEO0lBREg7Ozs7O0FBdkJqQiIsInNvdXJjZXNDb250ZW50IjpbInV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcblxuIyBNYXJrZG93bi1QcmV2aWV3IHBhY2thZ2VzIGFuZCB0aGVpciBwcm90b2NhbHNcbnBrZ3MgPVxuICBcIm1hcmtkb3duLXByZXZpZXdcIjogXCJtYXJrZG93bi1wcmV2aWV3XCIsXG4gIFwibWFya2Rvd24tcHJldmlldy1wbHVzXCI6IFwibWFya2Rvd24tcHJldmlldy1wbHVzXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgT3BlbkNoZWF0U2hlZXRcbiAgdHJpZ2dlcjogKGUpIC0+XG4gICAgcHJvdG9jYWwgPSBAZ2V0UHJvdG9jYWwoKVxuICAgIHJldHVybiBlLmFib3J0S2V5QmluZGluZygpIHVubGVzcyAhIXByb3RvY2FsXG5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuIEBjaGVhdHNoZWV0VVJMKHByb3RvY2FsKSxcbiAgICAgIHNwbGl0OiAncmlnaHQnLCBzZWFyY2hBbGxQYW5lczogdHJ1ZVxuXG4gIGdldFByb3RvY2FsOiAtPlxuICAgIGZvciBwa2csIHByb3RvY2FsIG9mIHBrZ3NcbiAgICAgIHJldHVybiBwcm90b2NhbCBpZiBAaGFzQWN0aXZlUGFja2FnZShwa2cpXG5cbiAgaGFzQWN0aXZlUGFja2FnZTogKHBrZykgLT5cbiAgICAhIWF0b20ucGFja2FnZXMuYWN0aXZlUGFja2FnZXNbcGtnXVxuXG4gIGNoZWF0c2hlZXRVUkw6IChwcm90b2NhbCkgLT5cbiAgICBcIiN7cHJvdG9jYWx9Oi8vI3t1dGlscy5nZXRQYWNrYWdlUGF0aChcIkNIRUFUU0hFRVQubWRcIil9XCJcbiJdfQ==
