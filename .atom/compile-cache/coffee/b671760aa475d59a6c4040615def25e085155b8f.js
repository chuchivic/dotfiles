(function() {
  var Prefix, Register, Repeat,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Prefix = (function() {
    function Prefix() {}

    Prefix.prototype.complete = null;

    Prefix.prototype.composedObject = null;

    Prefix.prototype.isComplete = function() {
      return this.complete;
    };

    Prefix.prototype.isRecordable = function() {
      return this.composedObject.isRecordable();
    };

    Prefix.prototype.compose = function(composedObject1) {
      this.composedObject = composedObject1;
      return this.complete = true;
    };

    Prefix.prototype.execute = function() {
      var base;
      return typeof (base = this.composedObject).execute === "function" ? base.execute(this.count) : void 0;
    };

    Prefix.prototype.select = function() {
      var base;
      return typeof (base = this.composedObject).select === "function" ? base.select(this.count) : void 0;
    };

    Prefix.prototype.isLinewise = function() {
      var base;
      return typeof (base = this.composedObject).isLinewise === "function" ? base.isLinewise() : void 0;
    };

    return Prefix;

  })();

  Repeat = (function(superClass) {
    extend(Repeat, superClass);

    Repeat.prototype.count = null;

    function Repeat(count) {
      this.count = count;
      this.complete = false;
    }

    Repeat.prototype.addDigit = function(digit) {
      return this.count = this.count * 10 + digit;
    };

    return Repeat;

  })(Prefix);

  Register = (function(superClass) {
    extend(Register, superClass);

    Register.prototype.name = null;

    function Register(name) {
      this.name = name;
      this.complete = false;
    }

    Register.prototype.compose = function(composedObject) {
      Register.__super__.compose.call(this, composedObject);
      if (composedObject.register != null) {
        return composedObject.register = this.name;
      }
    };

    return Register;

  })(Prefix);

  module.exports = {
    Repeat: Repeat,
    Register: Register
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ByZWZpeGVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsd0JBQUE7SUFBQTs7O0VBQU07OztxQkFDSixRQUFBLEdBQVU7O3FCQUNWLGNBQUEsR0FBZ0I7O3FCQUVoQixVQUFBLEdBQVksU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKOztxQkFFWixZQUFBLEdBQWMsU0FBQTthQUFHLElBQUMsQ0FBQSxjQUFjLENBQUMsWUFBaEIsQ0FBQTtJQUFIOztxQkFPZCxPQUFBLEdBQVMsU0FBQyxlQUFEO01BQUMsSUFBQyxDQUFBLGlCQUFEO2FBQ1IsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQURMOztxQkFNVCxPQUFBLEdBQVMsU0FBQTtBQUNQLFVBQUE7OEVBQWUsQ0FBQyxRQUFTLElBQUMsQ0FBQTtJQURuQjs7cUJBTVQsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBOzZFQUFlLENBQUMsT0FBUSxJQUFDLENBQUE7SUFEbkI7O3FCQUdSLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtpRkFBZSxDQUFDO0lBRE47Ozs7OztFQU9SOzs7cUJBQ0osS0FBQSxHQUFPOztJQUdNLGdCQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsUUFBRDtNQUFXLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFBeEI7O3FCQU9iLFFBQUEsR0FBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFBVCxHQUFjO0lBRGY7Ozs7S0FYUzs7RUFpQmY7Ozt1QkFDSixJQUFBLEdBQU07O0lBR08sa0JBQUMsSUFBRDtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQVUsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUF2Qjs7dUJBT2IsT0FBQSxHQUFTLFNBQUMsY0FBRDtNQUNQLHNDQUFNLGNBQU47TUFDQSxJQUFtQywrQkFBbkM7ZUFBQSxjQUFjLENBQUMsUUFBZixHQUEwQixJQUFDLENBQUEsS0FBM0I7O0lBRk87Ozs7S0FYWTs7RUFldkIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxRQUFBLE1BQUQ7SUFBUyxVQUFBLFFBQVQ7O0FBbkVqQiIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFByZWZpeFxuICBjb21wbGV0ZTogbnVsbFxuICBjb21wb3NlZE9iamVjdDogbnVsbFxuXG4gIGlzQ29tcGxldGU6IC0+IEBjb21wbGV0ZVxuXG4gIGlzUmVjb3JkYWJsZTogLT4gQGNvbXBvc2VkT2JqZWN0LmlzUmVjb3JkYWJsZSgpXG5cbiAgIyBQdWJsaWM6IE1hcmtzIHRoaXMgYXMgY29tcGxldGUgdXBvbiByZWNlaXZpbmcgYW4gb2JqZWN0IHRvIGNvbXBvc2Ugd2l0aC5cbiAgI1xuICAjIGNvbXBvc2VkT2JqZWN0IC0gVGhlIG5leHQgbW90aW9uIG9yIG9wZXJhdG9yLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBjb21wb3NlOiAoQGNvbXBvc2VkT2JqZWN0KSAtPlxuICAgIEBjb21wbGV0ZSA9IHRydWVcblxuICAjIFB1YmxpYzogRXhlY3V0ZXMgdGhlIGNvbXBvc2VkIG9wZXJhdG9yIG9yIG1vdGlvbi5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgZXhlY3V0ZTogLT5cbiAgICBAY29tcG9zZWRPYmplY3QuZXhlY3V0ZT8oQGNvdW50KVxuXG4gICMgUHVibGljOiBTZWxlY3RzIHVzaW5nIHRoZSBjb21wb3NlZCBtb3Rpb24uXG4gICNcbiAgIyBSZXR1cm5zIGFuIGFycmF5IG9mIGJvb2xlYW5zIHJlcHJlc2VudGluZyB3aGV0aGVyIGVhY2ggc2VsZWN0aW9ucycgc3VjY2Vzcy5cbiAgc2VsZWN0OiAtPlxuICAgIEBjb21wb3NlZE9iamVjdC5zZWxlY3Q/KEBjb3VudClcblxuICBpc0xpbmV3aXNlOiAtPlxuICAgIEBjb21wb3NlZE9iamVjdC5pc0xpbmV3aXNlPygpXG5cbiNcbiMgVXNlZCB0byB0cmFjayB0aGUgbnVtYmVyIG9mIHRpbWVzIGVpdGhlciBhIG1vdGlvbiBvciBvcGVyYXRvciBzaG91bGRcbiMgYmUgcmVwZWF0ZWQuXG4jXG5jbGFzcyBSZXBlYXQgZXh0ZW5kcyBQcmVmaXhcbiAgY291bnQ6IG51bGxcblxuICAjIGNvdW50IC0gVGhlIGluaXRpYWwgZGlnaXQgb2YgdGhlIHJlcGVhdCBzZXF1ZW5jZS5cbiAgY29uc3RydWN0b3I6IChAY291bnQpIC0+IEBjb21wbGV0ZSA9IGZhbHNlXG5cbiAgIyBQdWJsaWM6IEFkZHMgYW4gYWRkaXRpb25hbCBkaWdpdCB0byB0aGlzIHJlcGVhdCBzZXF1ZW5jZS5cbiAgI1xuICAjIGRpZ2l0IC0gQSBzaW5nbGUgZGlnaXQsIDAtOS5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgYWRkRGlnaXQ6IChkaWdpdCkgLT5cbiAgICBAY291bnQgPSBAY291bnQgKiAxMCArIGRpZ2l0XG5cbiNcbiMgVXNlZCB0byB0cmFjayB3aGljaCByZWdpc3RlciB0aGUgZm9sbG93aW5nIG9wZXJhdG9yIHNob3VsZCBvcGVyYXRlIG9uLlxuI1xuY2xhc3MgUmVnaXN0ZXIgZXh0ZW5kcyBQcmVmaXhcbiAgbmFtZTogbnVsbFxuXG4gICMgbmFtZSAtIFRoZSBzaW5nbGUgY2hhcmFjdGVyIG5hbWUgb2YgdGhlIGRlc2lyZWQgcmVnaXN0ZXJcbiAgY29uc3RydWN0b3I6IChAbmFtZSkgLT4gQGNvbXBsZXRlID0gZmFsc2VcblxuICAjIFB1YmxpYzogTWFya3MgYXMgY29tcGxldGUgYW5kIHNldHMgdGhlIG9wZXJhdG9yJ3MgcmVnaXN0ZXIgaWYgaXQgYWNjZXB0cyBpdC5cbiAgI1xuICAjIGNvbXBvc2VkT3BlcmF0b3IgLSBUaGUgb3BlcmF0b3IgdGhpcyByZWdpc3RlciBwZXJ0YWlucyB0by5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgY29tcG9zZTogKGNvbXBvc2VkT2JqZWN0KSAtPlxuICAgIHN1cGVyKGNvbXBvc2VkT2JqZWN0KVxuICAgIGNvbXBvc2VkT2JqZWN0LnJlZ2lzdGVyID0gQG5hbWUgaWYgY29tcG9zZWRPYmplY3QucmVnaXN0ZXI/XG5cbm1vZHVsZS5leHBvcnRzID0ge1JlcGVhdCwgUmVnaXN0ZXJ9XG4iXX0=
