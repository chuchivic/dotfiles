(function() {
  var _, getSearchTerm;

  _ = require('underscore-plus');

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, j, len, modFlags, term_;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (j = 0, len = term_.length; j < len; j++) {
      char = term_[j];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get("vim-mode:useSmartcaseForSearch")) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (error) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  module.exports = {
    findInBuffer: function(buffer, pattern) {
      var found;
      found = [];
      buffer.scan(new RegExp(pattern, 'g'), function(obj) {
        return found.push(obj.range);
      });
      return found;
    },
    findNextInBuffer: function(buffer, curPos, pattern) {
      var found, i, more;
      found = this.findInBuffer(buffer, pattern);
      more = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = found.length; j < len; j++) {
          i = found[j];
          if (i.compare([curPos, curPos]) === 1) {
            results.push(i);
          }
        }
        return results;
      })();
      if (more.length > 0) {
        return more[0].start.row;
      } else if (found.length > 0) {
        return found[0].start.row;
      } else {
        return null;
      }
    },
    findPreviousInBuffer: function(buffer, curPos, pattern) {
      var found, i, less;
      found = this.findInBuffer(buffer, pattern);
      less = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = found.length; j < len; j++) {
          i = found[j];
          if (i.compare([curPos, curPos]) === -1) {
            results.push(i);
          }
        }
        return results;
      })();
      if (less.length > 0) {
        return less[less.length - 1].start.row;
      } else if (found.length > 0) {
        return found[found.length - 1].start.row;
      } else {
        return null;
      }
    },
    scanEditor: function(term, editor, position, reverse) {
      var rangesAfter, rangesBefore, ref;
      if (reverse == null) {
        reverse = false;
      }
      ref = [[], []], rangesBefore = ref[0], rangesAfter = ref[1];
      editor.scan(getSearchTerm(term), function(arg) {
        var isBefore, range;
        range = arg.range;
        if (reverse) {
          isBefore = range.start.compare(position) < 0;
        } else {
          isBefore = range.start.compare(position) <= 0;
        }
        if (isBefore) {
          return rangesBefore.push(range);
        } else {
          return rangesAfter.push(range);
        }
      });
      if (reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZmluZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosYUFBQSxHQUFnQixTQUFDLElBQUQsRUFBTyxTQUFQO0FBRWQsUUFBQTs7TUFGcUIsWUFBWTtRQUFDLEdBQUEsRUFBSyxJQUFOOzs7SUFFakMsT0FBQSxHQUFVO0lBQ1YsSUFBQSxHQUFPO0lBQ1AsSUFBQSxHQUFPO0lBQ1AsS0FBQSxHQUFRO0lBQ1IsSUFBQSxHQUFPO0FBQ1AsU0FBQSx1Q0FBQTs7TUFDRSxJQUFHLElBQUEsS0FBUSxJQUFSLElBQWlCLENBQUksT0FBeEI7UUFDRSxPQUFBLEdBQVU7UUFDVixJQUFBLElBQVEsS0FGVjtPQUFBLE1BQUE7UUFJRSxJQUFHLElBQUEsS0FBUSxHQUFSLElBQWdCLE9BQW5CO1VBQ0UsSUFBQSxHQUFPO1VBQ1AsSUFBQSxHQUFPLElBQUssY0FGZDtTQUFBLE1BR0ssSUFBRyxJQUFBLEtBQVEsR0FBUixJQUFnQixPQUFuQjtVQUNILElBQUEsR0FBTztVQUNQLElBQUEsR0FBTyxJQUFLLGNBRlQ7U0FBQSxNQUdBLElBQUcsSUFBQSxLQUFVLElBQWI7VUFDSCxJQUFBLElBQVEsS0FETDs7UUFFTCxPQUFBLEdBQVUsTUFaWjs7QUFERjtJQWVBLElBQUcsSUFBSDtNQUNFLFNBQVUsQ0FBQSxHQUFBLENBQVYsR0FBaUIsTUFEbkI7O0lBRUEsSUFBRyxDQUFDLENBQUksSUFBSixJQUFhLENBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFYLENBQWpCLElBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixDQURELENBQUEsSUFDdUQsSUFEMUQ7TUFFRSxTQUFVLENBQUEsR0FBQSxDQUFWLEdBQWlCLEtBRm5COztJQUlBLFFB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QUcsUUFBSDtpQkFDRSxZQUFZLENBQUMsSUFBYixDQUFrQixLQUFsQixFQURGO1NBQUEsTUFBQTtpQkFHRSxXQUFXLENBQUMsSUFBWixDQUFpQixLQUFqQixFQUhGOztNQU4rQixDQUFqQztNQVdBLElBQUcsT0FBSDtlQUNFLFdBQVcsQ0FBQyxNQUFaLENBQW1CLFlBQW5CLENBQWdDLENBQUMsT0FBakMsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLFdBQVcsQ0FBQyxNQUFaLENBQW1CLFlBQW5CLEVBSEY7O0lBYlUsQ0E5Qkc7O0FBckNqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbmdldFNlYXJjaFRlcm0gPSAodGVybSwgbW9kaWZpZXJzID0geydnJzogdHJ1ZX0pIC0+XG5cbiAgZXNjYXBlZCA9IGZhbHNlXG4gIGhhc2MgPSBmYWxzZVxuICBoYXNDID0gZmFsc2VcbiAgdGVybV8gPSB0ZXJtXG4gIHRlcm0gPSAnJ1xuICBmb3IgY2hhciBpbiB0ZXJtX1xuICAgIGlmIGNoYXIgaXMgJ1xcXFwnIGFuZCBub3QgZXNjYXBlZFxuICAgICAgZXNjYXBlZCA9IHRydWVcbiAgICAgIHRlcm0gKz0gY2hhclxuICAgIGVsc2VcbiAgICAgIGlmIGNoYXIgaXMgJ2MnIGFuZCBlc2NhcGVkXG4gICAgICAgIGhhc2MgPSB0cnVlXG4gICAgICAgIHRlcm0gPSB0ZXJtWy4uLi0xXVxuICAgICAgZWxzZSBpZiBjaGFyIGlzICdDJyBhbmQgZXNjYXBlZFxuICAgICAgICBoYXNDID0gdHJ1ZVxuICAgICAgICB0ZXJtID0gdGVybVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpc250ICdcXFxcJ1xuICAgICAgICB0ZXJtICs9IGNoYXJcbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuXG4gIGlmIGhhc0NcbiAgICBtb2RpZmllcnNbJ2knXSA9IGZhbHNlXG4gIGlmIChub3QgaGFzQyBhbmQgbm90IHRlcm0ubWF0Y2goJ1tBLVpdJykgYW5kIFxcXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoXCJ2aW0tbW9kZTp1c2VTbWFydGNhc2VGb3JTZWFyY2hcIikpIG9yIGhhc2NcbiAgICBtb2RpZmllcnNbJ2knXSA9IHRydWVcblxuICBtb2RGbGFncyA9IE9iamVjdC5rZXlzKG1vZGlmaWVycykuZmlsdGVyKChrZXkpIC0+IG1vZGlmaWVyc1trZXldKS5qb2luKCcnKVxuXG4gIHRyeVxuICAgIG5ldyBSZWdFeHAodGVybSwgbW9kRmxhZ3MpXG4gIGNhdGNoXG4gICAgbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0ZXJtKSwgbW9kRmxhZ3MpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBmaW5kSW5CdWZmZXIgOiAoYnVmZmVyLCBwYXR0ZXJuKSAtPlxuICAgIGZvdW5kID0gW11cbiAgICBidWZmZXIuc2NhbihuZXcgUmVnRXhwKHBhdHRlcm4sICdnJyksIChvYmopIC0+IGZvdW5kLnB1c2ggb2JqLnJhbmdlKVxuICAgIHJldHVybiBmb3VuZFxuXG4gIGZpbmROZXh0SW5CdWZmZXIgOiAoYnVmZmVyLCBjdXJQb3MsIHBhdHRlcm4pIC0+XG4gICAgZm91bmQgPSBAZmluZEluQnVmZmVyKGJ1ZmZlciwgcGF0dGVybilcbiAgICBtb3JlID0gKGkgZm9yIGkgaW4gZm91bmQgd2hlbiBpLmNvbXBhcmUoW2N1clBvcywgY3VyUG9zXSkgaXMgMSlcbiAgICBpZiBtb3JlLmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBtb3JlWzBdLnN0YXJ0LnJvd1xuICAgIGVsc2UgaWYgZm91bmQubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIGZvdW5kWzBdLnN0YXJ0LnJvd1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBudWxsXG5cbiAgZmluZFByZXZpb3VzSW5CdWZmZXIgOiAoYnVmZmVyLCBjdXJQb3MsIHBhdHRlcm4pIC0+XG4gICAgZm91bmQgPSBAZmluZEluQnVmZmVyKGJ1ZmZlciwgcGF0dGVybilcbiAgICBsZXNzID0gKGkgZm9yIGkgaW4gZm91bmQgd2hlbiBpLmNvbXBhcmUoW2N1clBvcywgY3VyUG9zXSkgaXMgLTEpXG4gICAgaWYgbGVzcy5sZW5ndGggPiAwXG4gICAgICByZXR1cm4gbGVzc1tsZXNzLmxlbmd0aCAtIDFdLnN0YXJ0LnJvd1xuICAgIGVsc2UgaWYgZm91bmQubGVuZ3RoID4gMFxuICAgICAgcmV0dXJuIGZvdW5kW2ZvdW5kLmxlbmd0aCAtIDFdLnN0YXJ0LnJvd1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBudWxsXG5cbiAgIyBSZXR1cm5zIGFuIGFycmF5IG9mIHJhbmdlcyBvZiBhbGwgb2NjdXJlbmNlcyBvZiBgdGVybWAgaW4gYGVkaXRvcmAuXG4gICMgIFRoZSBhcnJheSBpcyBzb3J0ZWQgc28gdGhhdCB0aGUgZmlyc3Qgb2NjdXJlbmNlcyBhZnRlciB0aGUgY3Vyc29yIGNvbWVcbiAgIyAgZmlyc3QgKGFuZCB0aGUgc2VhcmNoIHdyYXBzIGFyb3VuZCkuIElmIGByZXZlcnNlYCBpcyB0cnVlLCB0aGUgYXJyYXkgaXNcbiAgIyAgcmV2ZXJzZWQgc28gdGhhdCB0aGUgZmlyc3Qgb2NjdXJlbmNlIGJlZm9yZSB0aGUgY3Vyc29yIGNvbWVzIGZpcnN0LlxuICBzY2FuRWRpdG9yOiAodGVybSwgZWRpdG9yLCBwb3NpdGlvbiwgcmV2ZXJzZSA9IGZhbHNlKSAtPlxuICAgIFtyYW5nZXNCZWZvcmUsIHJhbmdlc0FmdGVyXSA9IFtbXSwgW11dXG4gICAgZWRpdG9yLnNjYW4gZ2V0U2VhcmNoVGVybSh0ZXJtKSwgKHtyYW5nZX0pIC0+XG4gICAgICBpZiByZXZlcnNlXG4gICAgICAgIGlzQmVmb3JlID0gcmFuZ2Uuc3RhcnQuY29tcGFyZShwb3NpdGlvbikgPCAwXG4gICAgICBlbHNlXG4gICAgICAgIGlzQmVmb3JlID0gcmFuZ2Uuc3RhcnQuY29tcGFyZShwb3NpdGlvbikgPD0gMFxuXG4gICAgICBpZiBpc0JlZm9yZVxuICAgICAgICByYW5nZXNCZWZvcmUucHVzaChyYW5nZSlcbiAgICAgIGVsc2VcbiAgICAgICAgcmFuZ2VzQWZ0ZXIucHVzaChyYW5nZSlcblxuICAgIGlmIHJldmVyc2VcbiAgICAgIHJhbmdlc0FmdGVyLmNvbmNhdChyYW5nZXNCZWZvcmUpLnJldmVyc2UoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlc0FmdGVyLmNvbmNhdChyYW5nZXNCZWZvcmUpXG59XG4iXX0=
