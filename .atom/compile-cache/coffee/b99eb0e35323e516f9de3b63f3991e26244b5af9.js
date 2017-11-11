(function() {
  var settings;

  settings = {
    config: {
      startInInsertMode: {
        type: 'boolean',
        "default": false
      },
      useSmartcaseForSearch: {
        type: 'boolean',
        "default": false
      },
      wrapLeftRightMotion: {
        type: 'boolean',
        "default": false
      },
      useClipboardAsDefaultRegister: {
        type: 'boolean',
        "default": true
      },
      numberRegex: {
        type: 'string',
        "default": '-?[0-9]+',
        description: 'Use this to control how Ctrl-A/Ctrl-X finds numbers; use "(?:\\B-)?[0-9]+" to treat numbers as positive if the minus is preceded by a character, e.g. in "identifier-1".'
      }
    }
  };

  Object.keys(settings.config).forEach(function(k) {
    return settings[k] = function() {
      return atom.config.get('vim-mode.' + k);
    };
  });

  settings.defaultRegister = function() {
    if (settings.useClipboardAsDefaultRegister()) {
      return '*';
    } else {
      return '"';
    }
  };

  module.exports = settings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3NldHRpbmdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxHQUNFO0lBQUEsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQURUO09BREY7TUFHQSxxQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRFQ7T0FKRjtNQU1BLG1CQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtPQVBGO01BU0EsNkJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BVkY7TUFZQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsVUFEVDtRQUVBLFdBQUEsRUFBYSwwS0FGYjtPQWJGO0tBREY7OztFQWtCRixNQUFNLENBQUMsSUFBUCxDQUFZLFFBQVEsQ0FBQyxNQUFyQixDQUE0QixDQUFDLE9BQTdCLENBQXFDLFNBQUMsQ0FBRDtXQUNuQyxRQUFTLENBQUEsQ0FBQSxDQUFULEdBQWMsU0FBQTthQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixXQUFBLEdBQVksQ0FBNUI7SUFEWTtFQURxQixDQUFyQzs7RUFJQSxRQUFRLENBQUMsZUFBVCxHQUEyQixTQUFBO0lBQ3pCLElBQUcsUUFBUSxDQUFDLDZCQUFULENBQUEsQ0FBSDthQUFpRCxJQUFqRDtLQUFBLE1BQUE7YUFBMEQsSUFBMUQ7O0VBRHlCOztFQUczQixNQUFNLENBQUMsT0FBUCxHQUFpQjtBQTFCakIiLCJzb3VyY2VzQ29udGVudCI6WyJcbnNldHRpbmdzID1cbiAgY29uZmlnOlxuICAgIHN0YXJ0SW5JbnNlcnRNb2RlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIHVzZVNtYXJ0Y2FzZUZvclNlYXJjaDpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICB3cmFwTGVmdFJpZ2h0TW90aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIHVzZUNsaXBib2FyZEFzRGVmYXVsdFJlZ2lzdGVyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgbnVtYmVyUmVnZXg6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJy0/WzAtOV0rJ1xuICAgICAgZGVzY3JpcHRpb246ICdVc2UgdGhpcyB0byBjb250cm9sIGhvdyBDdHJsLUEvQ3RybC1YIGZpbmRzIG51bWJlcnM7IHVzZSBcIig/OlxcXFxCLSk/WzAtOV0rXCIgdG8gdHJlYXQgbnVtYmVycyBhcyBwb3NpdGl2ZSBpZiB0aGUgbWludXMgaXMgcHJlY2VkZWQgYnkgYSBjaGFyYWN0ZXIsIGUuZy4gaW4gXCJpZGVudGlmaWVyLTFcIi4nXG5cbk9iamVjdC5rZXlzKHNldHRpbmdzLmNvbmZpZykuZm9yRWFjaCAoaykgLT5cbiAgc2V0dGluZ3Nba10gPSAtPlxuICAgIGF0b20uY29uZmlnLmdldCgndmltLW1vZGUuJytrKVxuXG5zZXR0aW5ncy5kZWZhdWx0UmVnaXN0ZXIgPSAtPlxuICBpZiBzZXR0aW5ncy51c2VDbGlwYm9hcmRBc0RlZmF1bHRSZWdpc3RlcigpIHRoZW4gJyonIGVsc2UgJ1wiJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldHRpbmdzXG4iXX0=
