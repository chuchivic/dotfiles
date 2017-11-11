(function() {
  var _, humanizeKeystroke;

  _ = require('underscore-plus');

  humanizeKeystroke = function(binding) {
    return _.humanizeKeystroke(binding.keystrokes);
  };

  module.exports = function(platform) {
    var cache, currentPlatformRegex, transform;
    if (platform == null) {
      platform = process.platform;
    }
    cache = {};
    currentPlatformRegex = new RegExp("\\.platform\\-" + platform + "([,:#\\s]|$)");
    transform = function(name, bindings) {
      if (bindings != null) {
        return bindings.every(function(binding) {
          if (currentPlatformRegex.test(binding.selector)) {
            return cache[name] = humanizeKeystroke(binding);
          }
        });
      }
    };
    return {
      get: function(commands) {
        var c, i, len;
        for (i = 0, len = commands.length; i < len; i++) {
          c = commands[i];
          if (!(c[0] in cache)) {
            transform(c[0], atom.keymaps.findKeyBindings({
              command: c[0]
            }));
          }
        }
        return cache;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2NvbW1hbmQta2V5c3Ryb2tlLWh1bWFuaXplci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosaUJBQUEsR0FBb0IsU0FBQyxPQUFEO1dBQWEsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLE9BQU8sQ0FBQyxVQUE1QjtFQUFiOztFQUVwQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLFFBQUQ7QUFDYixRQUFBOztNQURjLFdBQVcsT0FBTyxDQUFDOztJQUNqQyxLQUFBLEdBQVE7SUFDUixvQkFBQSxHQUEyQixJQUFBLE1BQUEsQ0FBTyxnQkFBQSxHQUFrQixRQUFsQixHQUE0QixjQUFuQztJQUUzQixTQUFBLEdBQVksU0FBQyxJQUFELEVBQU8sUUFBUDtNQUNWLElBQUcsZ0JBQUg7ZUFDRSxRQUFRLENBQUMsS0FBVCxDQUFlLFNBQUMsT0FBRDtVQUNiLElBQThDLG9CQUFvQixDQUFDLElBQXJCLENBQTBCLE9BQU8sQ0FBQyxRQUFsQyxDQUE5QzttQkFBQyxLQUFNLENBQUEsSUFBQSxDQUFOLEdBQWMsaUJBQUEsQ0FBa0IsT0FBbEIsRUFBZjs7UUFEYSxDQUFmLEVBREY7O0lBRFU7QUFLWixXQUFPO01BQ0wsR0FBQSxFQUFLLFNBQUMsUUFBRDtBQUNILFlBQUE7QUFBQSxhQUFBLDBDQUFBOztVQUNFLElBQUEsQ0FBQSxDQUFPLENBQUUsQ0FBQSxDQUFBLENBQUYsSUFBUSxLQUFmLENBQUE7WUFDRSxTQUFBLENBQVUsQ0FBRSxDQUFBLENBQUEsQ0FBWixFQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWIsQ0FBNkI7Y0FBQyxPQUFBLEVBQVMsQ0FBRSxDQUFBLENBQUEsQ0FBWjthQUE3QixDQUFoQixFQURGOztBQURGO2VBR0E7TUFKRyxDQURBOztFQVRNO0FBSmpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuaHVtYW5pemVLZXlzdHJva2UgPSAoYmluZGluZykgLT4gXy5odW1hbml6ZUtleXN0cm9rZShiaW5kaW5nLmtleXN0cm9rZXMpXG5cbm1vZHVsZS5leHBvcnRzID0gKHBsYXRmb3JtID0gcHJvY2Vzcy5wbGF0Zm9ybSkgLT5cbiAgICBjYWNoZSA9IHt9XG4gICAgY3VycmVudFBsYXRmb3JtUmVnZXggPSBuZXcgUmVnRXhwKFwiXFxcXC5wbGF0Zm9ybVxcXFwtI3sgcGxhdGZvcm0gfShbLDojXFxcXHNdfCQpXCIpXG5cbiAgICB0cmFuc2Zvcm0gPSAobmFtZSwgYmluZGluZ3MpIC0+XG4gICAgICBpZiBiaW5kaW5ncz9cbiAgICAgICAgYmluZGluZ3MuZXZlcnkgKGJpbmRpbmcpIC0+XG4gICAgICAgICAgKGNhY2hlW25hbWVdID0gaHVtYW5pemVLZXlzdHJva2UoYmluZGluZykpIGlmIGN1cnJlbnRQbGF0Zm9ybVJlZ2V4LnRlc3QoYmluZGluZy5zZWxlY3RvcilcblxuICAgIHJldHVybiB7XG4gICAgICBnZXQ6IChjb21tYW5kcykgLT5cbiAgICAgICAgZm9yIGMgaW4gY29tbWFuZHNcbiAgICAgICAgICB1bmxlc3MgY1swXSBvZiBjYWNoZVxuICAgICAgICAgICAgdHJhbnNmb3JtKGNbMF0sIGF0b20ua2V5bWFwcy5maW5kS2V5QmluZGluZ3Mge2NvbW1hbmQ6IGNbMF19KVxuICAgICAgICBjYWNoZVxuICAgIH1cbiJdfQ==
