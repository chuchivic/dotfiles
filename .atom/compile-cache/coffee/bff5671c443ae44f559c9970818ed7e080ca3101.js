(function() {
  var _, jasmineEnv, original, tags;

  require('jasmine-tagged');

  _ = require('underscore-plus');

  tags = [process.platform];

  if (!process.env.WERCKER_ROOT) {
    tags.push('notwercker');
  }

  if (!process.env.TRAVIS) {
    tags.push('nottravis');
  }

  jasmineEnv = jasmine.getEnv();

  original = jasmineEnv.setIncludedTags;

  jasmineEnv.setIncludedTags = function(t) {
    return original(_.union(tags, t));
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvc3BlYy1oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLENBQVEsZ0JBQVI7O0VBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixJQUFBLEdBQU8sQ0FBQyxPQUFPLENBQUMsUUFBVDs7RUFFUCxJQUFBLENBQStCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBM0M7SUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLFlBQVYsRUFBQTs7O0VBQ0EsSUFBQSxDQUE4QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQTFDO0lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLEVBQUE7OztFQUVBLFVBQUEsR0FBYSxPQUFPLENBQUMsTUFBUixDQUFBOztFQUNiLFFBQUEsR0FBVyxVQUFVLENBQUM7O0VBRXRCLFVBQVUsQ0FBQyxlQUFYLEdBQTZCLFNBQUMsQ0FBRDtXQUMzQixRQUFBLENBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFSLEVBQWMsQ0FBZCxDQUFUO0VBRDJCO0FBWjdCIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZSAnamFzbWluZS10YWdnZWQnXG5cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbnRhZ3MgPSBbcHJvY2Vzcy5wbGF0Zm9ybV1cblxudGFncy5wdXNoKCdub3R3ZXJja2VyJykgdW5sZXNzIHByb2Nlc3MuZW52LldFUkNLRVJfUk9PVFxudGFncy5wdXNoKCdub3R0cmF2aXMnKSB1bmxlc3MgcHJvY2Vzcy5lbnYuVFJBVklTXG5cbmphc21pbmVFbnYgPSBqYXNtaW5lLmdldEVudigpXG5vcmlnaW5hbCA9IGphc21pbmVFbnYuc2V0SW5jbHVkZWRUYWdzXG5cbmphc21pbmVFbnYuc2V0SW5jbHVkZWRUYWdzID0gKHQpIC0+XG4gIG9yaWdpbmFsKF8udW5pb24gdGFncywgdClcbiJdfQ==
