(function() {
  var BLOCKQUOTE_REGEX, LIST_AL_REGEX, LIST_AL_TASK_REGEX, LIST_OL_REGEX, LIST_OL_TASK_REGEX, LIST_UL_REGEX, LIST_UL_TASK_REGEX, LineMeta, TYPES, incStr, utils;

  utils = require("../utils");

  LIST_UL_TASK_REGEX = /^(\s*)([*+-\.])\s+\[[xX ]\]\s*(.*)$/;

  LIST_UL_REGEX = /^(\s*)([*+-\.])\s+(.*)$/;

  LIST_OL_TASK_REGEX = /^(\s*)(\d+)\.\s+\[[xX ]\]\s*(.*)$/;

  LIST_OL_REGEX = /^(\s*)(\d+)\.\s+(.*)$/;

  LIST_AL_TASK_REGEX = /^(\s*)([a-zA-Z]+)\.\s+\[[xX ]\]\s*(.*)$/;

  LIST_AL_REGEX = /^(\s*)([a-zA-Z]+)\.\s+(.*)$/;

  BLOCKQUOTE_REGEX = /^(\s*)(>)\s*(.*)$/;

  incStr = function(str) {
    var num;
    num = parseInt(str, 10);
    if (isNaN(num)) {
      return utils.incrementChars(str);
    } else {
      return num + 1;
    }
  };

  TYPES = [
    {
      name: ["list", "ul", "task"],
      regex: LIST_UL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + matches[2] + " [ ] ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ul"],
      regex: LIST_UL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + matches[2] + " ";
      },
      defaultHead: function(head) {
        return head;
      }
    }, {
      name: ["list", "ol", "task"],
      regex: LIST_OL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". [ ] ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol"],
      regex: LIST_OL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". ";
      },
      defaultHead: function(head) {
        return "1";
      }
    }, {
      name: ["list", "ol", "al", "task"],
      regex: LIST_AL_TASK_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". [ ] ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["list", "ol", "al"],
      regex: LIST_AL_REGEX,
      nextLine: function(matches) {
        return "" + matches[1] + (incStr(matches[2])) + ". ";
      },
      defaultHead: function(head) {
        var c;
        c = utils.isUpperCase(head) ? "A" : "a";
        return head.replace(/./g, c);
      }
    }, {
      name: ["blockquote"],
      regex: BLOCKQUOTE_REGEX,
      nextLine: function(matches) {
        return matches[1] + "> ";
      },
      defaultHead: function(head) {
        return ">";
      }
    }
  ];

  module.exports = LineMeta = (function() {
    function LineMeta(line) {
      this.line = line;
      this.type = void 0;
      this.head = "";
      this.defaultHead = "";
      this.body = "";
      this.indent = "";
      this.nextLine = "";
      this._findMeta();
    }

    LineMeta.prototype._findMeta = function() {
      var i, len, matches, results, type;
      results = [];
      for (i = 0, len = TYPES.length; i < len; i++) {
        type = TYPES[i];
        if (matches = type.regex.exec(this.line)) {
          this.type = type;
          this.indent = matches[1];
          this.head = matches[2];
          this.defaultHead = type.defaultHead(matches[2]);
          this.body = matches[3];
          this.nextLine = type.nextLine(matches);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    LineMeta.prototype.isTaskList = function() {
      return this.type && this.type.name.indexOf("task") !== -1;
    };

    LineMeta.prototype.isList = function(type) {
      return this.type && this.type.name.indexOf("list") !== -1 && (!type || this.type.name.indexOf(type) !== -1);
    };

    LineMeta.prototype.isContinuous = function() {
      return !!this.nextLine;
    };

    LineMeta.prototype.isEmptyBody = function() {
      return !this.body;
    };

    LineMeta.isList = function(line) {
      return LIST_UL_REGEX.test(line) || LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isOrderedList = function(line) {
      return LIST_OL_REGEX.test(line) || LIST_AL_REGEX.test(line);
    };

    LineMeta.isUnorderedList = function(line) {
      return LIST_UL_REGEX.test(line);
    };

    LineMeta.incStr = incStr;

    return LineMeta;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9oZWxwZXJzL2xpbmUtbWV0YS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFFUixrQkFBQSxHQUFxQjs7RUFDckIsYUFBQSxHQUFxQjs7RUFDckIsa0JBQUEsR0FBcUI7O0VBQ3JCLGFBQUEsR0FBcUI7O0VBQ3JCLGtCQUFBLEdBQXFCOztFQUNyQixhQUFBLEdBQXFCOztFQUNyQixnQkFBQSxHQUFxQjs7RUFFckIsTUFBQSxHQUFTLFNBQUMsR0FBRDtBQUNQLFFBQUE7SUFBQSxHQUFBLEdBQU0sUUFBQSxDQUFTLEdBQVQsRUFBYyxFQUFkO0lBQ04sSUFBRyxLQUFBLENBQU0sR0FBTixDQUFIO2FBQW1CLEtBQUssQ0FBQyxjQUFOLENBQXFCLEdBQXJCLEVBQW5CO0tBQUEsTUFBQTthQUNLLEdBQUEsR0FBTSxFQURYOztFQUZPOztFQUtULEtBQUEsR0FBUTtJQUNOO01BQ0UsSUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxNQUFmLENBRFI7TUFFRSxLQUFBLEVBQU8sa0JBRlQ7TUFHRSxRQUFBLEVBQVUsU0FBQyxPQUFEO2VBQWEsRUFBQSxHQUFHLE9BQVEsQ0FBQSxDQUFBLENBQVgsR0FBZ0IsT0FBUSxDQUFBLENBQUEsQ0FBeEIsR0FBMkI7TUFBeEMsQ0FIWjtNQUlFLFdBQUEsRUFBYSxTQUFDLElBQUQ7ZUFBVTtNQUFWLENBSmY7S0FETSxFQU9OO01BQ0UsSUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLElBQVQsQ0FEUjtNQUVFLEtBQUEsRUFBTyxhQUZUO01BR0UsUUFBQSxFQUFVLFNBQUMsT0FBRDtlQUFhLEVBQUEsR0FBRyxPQUFRLENBQUEsQ0FBQSxDQUFYLEdBQWdCLE9BQVEsQ0FBQSxDQUFBLENBQXhCLEdB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QW1CLElBQW5CO0lBQWxFOztJQUNULFFBQUMsQ0FBQSxhQUFELEdBQWdCLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CLENBQUEsSUFBNEIsYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkI7SUFBdEM7O0lBQ2hCLFFBQUMsQ0FBQSxlQUFELEdBQWtCLFNBQUMsSUFBRDthQUFVLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQW5CO0lBQVY7O0lBQ2xCLFFBQUMsQ0FBQSxNQUFELEdBQVM7Ozs7O0FBbkdYIiwic291cmNlc0NvbnRlbnQiOlsidXRpbHMgPSByZXF1aXJlIFwiLi4vdXRpbHNcIlxuXG5MSVNUX1VMX1RBU0tfUkVHRVggPSAvLy8gXiAoXFxzKikgKFsqKy1cXC5dKSBcXHMrIFxcW1t4WFxcIF1cXF0gXFxzKiAoLiopICQgLy8vXG5MSVNUX1VMX1JFR0VYICAgICAgPSAvLy8gXiAoXFxzKikgKFsqKy1cXC5dKSBcXHMrICguKikgJCAvLy9cbkxJU1RfT0xfVEFTS19SRUdFWCA9IC8vLyBeIChcXHMqKSAoXFxkKylcXC4gXFxzKyBcXFtbeFhcXCBdXFxdIFxccyogKC4qKSAkIC8vL1xuTElTVF9PTF9SRUdFWCAgICAgID0gLy8vIF4gKFxccyopIChcXGQrKVxcLiBcXHMrICguKikgJCAvLy9cbkxJU1RfQUxfVEFTS19SRUdFWCA9IC8vLyBeIChcXHMqKSAoW2EtekEtWl0rKVxcLiBcXHMrIFxcW1t4WFxcIF1cXF0gXFxzKiAoLiopICQgLy8vXG5MSVNUX0FMX1JFR0VYICAgICAgPSAvLy8gXiAoXFxzKikgKFthLXpBLVpdKylcXC4gXFxzKyAoLiopICQgLy8vXG5CTE9DS1FVT1RFX1JFR0VYICAgPSAvLy8gXiAoXFxzKikgKD4pICAgICBcXHMqICguKikgJCAvLy9cblxuaW5jU3RyID0gKHN0cikgLT5cbiAgbnVtID0gcGFyc2VJbnQoc3RyLCAxMClcbiAgaWYgaXNOYU4obnVtKSB0aGVuIHV0aWxzLmluY3JlbWVudENoYXJzKHN0cilcbiAgZWxzZSBudW0gKyAxXG5cblRZUEVTID0gW1xuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcInVsXCIsIFwidGFza1wiXSxcbiAgICByZWdleDogTElTVF9VTF9UQVNLX1JFR0VYLFxuICAgIG5leHRMaW5lOiAobWF0Y2hlcykgLT4gXCIje21hdGNoZXNbMV19I3ttYXRjaGVzWzJdfSBbIF0gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IGhlYWRcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcInVsXCJdLFxuICAgIHJlZ2V4OiBMSVNUX1VMX1JFR0VYLFxuICAgIG5leHRMaW5lOiAobWF0Y2hlcykgLT4gXCIje21hdGNoZXNbMV19I3ttYXRjaGVzWzJdfSBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT4gaGVhZFxuICB9XG4gIHtcbiAgICBuYW1lOiBbXCJsaXN0XCIsIFwib2xcIiwgXCJ0YXNrXCJdLFxuICAgIHJlZ2V4OiBMSVNUX09MX1RBU0tfUkVHRVgsXG4gICAgbmV4dExpbmU6IChtYXRjaGVzKSAtPiBcIiN7bWF0Y2hlc1sxXX0je2luY1N0cihtYXRjaGVzWzJdKX0uIFsgXSBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT4gXCIxXCJcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcIm9sXCJdLFxuICAgIHJlZ2V4OiBMSVNUX09MX1JFR0VYLFxuICAgIG5leHRMaW5lOiAobWF0Y2hlcykgLT4gXCIje21hdGNoZXNbMV19I3tpbmNTdHIobWF0Y2hlc1syXSl9LiBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT4gXCIxXCJcbiAgfVxuICB7XG4gICAgbmFtZTogW1wibGlzdFwiLCBcIm9sXCIsIFwiYWxcIiwgXCJ0YXNrXCJdLFxuICAgIHJlZ2V4OiBMSVNUX0FMX1RBU0tfUkVHRVgsXG4gICAgbmV4dExpbmU6IChtYXRjaGVzKSAtPiBcIiN7bWF0Y2hlc1sxXX0je2luY1N0cihtYXRjaGVzWzJdKX0uIFsgXSBcIlxuICAgIGRlZmF1bHRIZWFkOiAoaGVhZCkgLT5cbiAgICAgIGMgPSBpZiB1dGlscy5pc1VwcGVyQ2FzZShoZWFkKSB0aGVuIFwiQVwiIGVsc2UgXCJhXCJcbiAgICAgIGhlYWQucmVwbGFjZSgvLi9nLCBjKVxuICB9XG4gIHtcbiAgICBuYW1lOiBbXCJsaXN0XCIsIFwib2xcIiwgXCJhbFwiXSxcbiAgICByZWdleDogTElTVF9BTF9SRUdFWCxcbiAgICBuZXh0TGluZTogKG1hdGNoZXMpIC0+IFwiI3ttYXRjaGVzWzFdfSN7aW5jU3RyKG1hdGNoZXNbMl0pfS4gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+XG4gICAgICBjID0gaWYgdXRpbHMuaXNVcHBlckNhc2UoaGVhZCkgdGhlbiBcIkFcIiBlbHNlIFwiYVwiXG4gICAgICBoZWFkLnJlcGxhY2UoLy4vZywgYylcbiAgfVxuICB7XG4gICAgbmFtZTogW1wiYmxvY2txdW90ZVwiXSxcbiAgICByZWdleDogQkxPQ0tRVU9URV9SRUdFWCxcbiAgICBuZXh0TGluZTogKG1hdGNoZXMpIC0+IFwiI3ttYXRjaGVzWzFdfT4gXCJcbiAgICBkZWZhdWx0SGVhZDogKGhlYWQpIC0+IFwiPlwiXG4gIH1cbl1cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGluZU1ldGFcbiAgY29uc3RydWN0b3I6IChsaW5lKSAtPlxuICAgIEBsaW5lID0gbGluZVxuICAgIEB0eXBlID0gdW5kZWZpbmVkXG4gICAgQGhlYWQgPSBcIlwiXG4gICAgQGRlZmF1bHRIZWFkID0gXCJcIlxuICAgIEBib2R5ID0gXCJcIlxuICAgIEBpbmRlbnQgPSBcIlwiXG4gICAgQG5leHRMaW5lID0gXCJcIlxuXG4gICAgQF9maW5kTWV0YSgpXG5cbiAgX2ZpbmRNZXRhOiAtPlxuICAgIGZvciB0eXBlIGluIFRZUEVTXG4gICAgICBpZiBtYXRjaGVzID0gdHlwZS5yZWdleC5leGVjKEBsaW5lKVxuICAgICAgICBAdHlwZSA9IHR5cGVcbiAgICAgICAgQGluZGVudCA9IG1hdGNoZXNbMV1cbiAgICAgICAgQGhlYWQgPSBtYXRjaGVzWzJdXG4gICAgICAgIEBkZWZhdWx0SGVhZCA9IHR5cGUuZGVmYXVsdEhlYWQobWF0Y2hlc1syXSlcbiAgICAgICAgQGJvZHkgPSBtYXRjaGVzWzNdXG4gICAgICAgIEBuZXh0TGluZSA9IHR5cGUubmV4dExpbmUobWF0Y2hlcylcblxuICAgICAgICBicmVha1xuXG4gIGlzVGFza0xpc3Q6IC0+IEB0eXBlICYmIEB0eXBlLm5hbWUuaW5kZXhPZihcInRhc2tcIikgIT0gLTFcbiAgaXNMaXN0OiAodHlwZSkgLT4gQHR5cGUgJiYgQHR5cGUubmFtZS5pbmRleE9mKFwibGlzdFwiKSAhPSAtMSAmJiAoIXR5cGUgfHwgQHR5cGUubmFtZS5pbmRleE9mKHR5cGUpICE9IC0xKVxuICBpc0NvbnRpbnVvdXM6IC0+ICEhQG5leHRMaW5lXG4gIGlzRW1wdHlCb2R5OiAtPiAhQGJvZHlcblxuICAjIFN0YXRpYyBtZXRob2RzXG5cbiAgQGlzTGlzdDogKGxpbmUpIC0+IExJU1RfVUxfUkVHRVgudGVzdChsaW5lKSB8fCBMSVNUX09MX1JFR0VYLnRlc3QobGluZSkgfHwgTElTVF9BTF9SRUdFWC50ZXN0KGxpbmUpXG4gIEBpc09yZGVyZWRMaXN0OiAobGluZSkgLT4gTElTVF9PTF9SRUdFWC50ZXN0KGxpbmUpIHx8IExJU1RfQUxfUkVHRVgudGVzdChsaW5lKVxuICBAaXNVbm9yZGVyZWRMaXN0OiAobGluZSkgLT4gTElTVF9VTF9SRUdFWC50ZXN0KGxpbmUpXG4gIEBpbmNTdHI6IGluY1N0clxuIl19