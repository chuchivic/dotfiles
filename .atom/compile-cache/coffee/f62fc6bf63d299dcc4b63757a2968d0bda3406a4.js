(function() {
  var Command, CommandError, Ex, ExViewModel, Find;

  ExViewModel = require('./ex-view-model');

  Ex = require('./ex');

  Find = require('./find');

  CommandError = require('./command-error');

  Command = (function() {
    function Command(editor, exState) {
      this.editor = editor;
      this.exState = exState;
      this.selections = this.exState.getSelections();
      this.viewModel = new ExViewModel(this, Object.keys(this.selections).length > 0);
    }

    Command.prototype.parseAddr = function(str, cursor) {
      var addr, mark, ref, row;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        addr = this.editor.getBuffer().lines.length - 1;
      } else if ((ref = str[0]) === "+" || ref === "-") {
        addr = row + this.parseOffset(str);
      } else if (!isNaN(str)) {
        addr = parseInt(str) - 1;
      } else if (str[0] === "'") {
        if (this.vimState == null) {
          throw new CommandError("Couldn't get access to vim-mode.");
        }
        mark = this.vimState.mark.marks[str[1]];
        if (mark == null) {
          throw new CommandError("Mark " + str + " not set.");
        }
        addr = mark.getEndBufferPosition().row;
      } else if (str[0] === "/") {
        str = str.slice(1);
        if (str[str.length - 1] === "/") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().end)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str);
        }
        addr = addr.start.row;
      } else if (str[0] === "?") {
        str = str.slice(1);
        if (str[str.length - 1] === "?") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().start, true)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
        addr = addr.start.row;
      }
      return addr;
    };

    Command.prototype.parseOffset = function(str) {
      var o;
      if (str.length === 0) {
        return 0;
      }
      if (str.length === 1) {
        o = 1;
      } else {
        o = parseInt(str.slice(1));
      }
      if (str[0] === '+') {
        return o;
      } else {
        return -o;
      }
    };

    Command.prototype.execute = function(input) {
      var addr1, addr2, addrPattern, address1, address2, args, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, ref, ref1, ref2, ref3, results, runOverSelections, selection, val;
      this.vimState = (ref = this.exState.globalExState.vim) != null ? ref.getEditorState(this.editor) : void 0;
      cl = input.characters;
      cl = cl.replace(/^(:|\s)*/, '');
      if (!(cl.length > 0)) {
        return;
      }
      if (cl[0] === '"') {
        return;
      }
      lastLine = this.editor.getBuffer().lines.length - 1;
      if (cl[0] === '%') {
        range = [0, lastLine];
        cl = cl.slice(1);
      } else {
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?(?:[^\\]\/|$)|\?.*?(?:[^\\]\?|$)|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        ref1 = cl.match(addrPattern), match = ref1[0], addr1 = ref1[1], off1 = ref1[2], addr2 = ref1[3], off2 = ref1[4];
        cursor = this.editor.getLastCursor();
        if (addr1 === "'<" && addr2 === "'>") {
          runOverSelections = true;
        } else {
          runOverSelections = false;
          if (addr1 != null) {
            address1 = this.parseAddr(addr1, cursor);
          } else {
            address1 = cursor.getBufferRow();
          }
          if (off1 != null) {
            address1 += this.parseOffset(off1);
          }
          if (address1 === -1) {
            address1 = 0;
          }
          if (address1 > lastLine) {
            address1 = lastLine;
          }
          if (address1 < 0) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 === -1) {
            address2 = 0;
          }
          if (address2 > lastLine) {
            address2 = lastLine;
          }
          if (address2 < 0) {
            throw new CommandError('Invalid range');
          }
          if (address2 < address1) {
            throw new CommandError('Backwards range given');
          }
        }
        range = [address1, address2 != null ? address2 : address1];
      }
      cl = cl.slice(match != null ? match.length : void 0);
      cl = cl.trimLeft();
      if (cl.length === 0) {
        this.editor.setCursorBufferPosition([range[1], 0]);
        return;
      }
      if (cl.length === 2 && cl[0] === 'k' && /[a-z]/i.test(cl[1])) {
        command = 'mark';
        args = cl[1];
      } else if (!/[a-z]/i.test(cl[0])) {
        command = cl[0];
        args = cl.slice(1);
      } else {
        ref2 = cl.match(/^(\w+)(.*)/), m = ref2[0], command = ref2[1], args = ref2[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var ref3, results;
          ref3 = Ex.singleton();
          results = [];
          for (name in ref3) {
            val = ref3[name];
            if (name.indexOf(command) === 0) {
              results.push(name);
            }
          }
          return results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          ref3 = this.selections;
          results = [];
          for (id in ref3) {
            selection = ref3[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return results;
        } else {
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        }
      } else {
        throw new CommandError("Not an editor command: " + input.characters);
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvY29tbWFuZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVI7O0VBQ2QsRUFBQSxHQUFLLE9BQUEsQ0FBUSxNQUFSOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUVUO0lBQ1MsaUJBQUMsTUFBRCxFQUFVLE9BQVY7TUFBQyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxVQUFEO01BQ3JCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQUE7TUFDZCxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFdBQUEsQ0FBWSxJQUFaLEVBQWUsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsVUFBYixDQUF3QixDQUFDLE1BQXpCLEdBQWtDLENBQWpEO0lBRk47O3NCQUliLFNBQUEsR0FBVyxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBQ1QsVUFBQTtNQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFBO01BQ04sSUFBRyxHQUFBLEtBQU8sR0FBVjtRQUNFLElBQUEsR0FBTyxJQURUO09BQUEsTUFFSyxJQUFHLEdBQUEsS0FBTyxHQUFWO1FBRUgsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBLENBQW1CLENBQUMsS0FBSyxDQUFDLE1BQTFCLEdBQW1DLEVBRnZDO09BQUEsTUFHQSxXQUFHLEdBQUksQ0FBQSxDQUFBLEVBQUosS0FBVyxHQUFYLElBQUEsR0FBQSxLQUFnQixHQUFuQjtRQUNILElBQUEsR0FBTyxHQUFBLEdBQU0sSUFBQyxDQUFBLFdBQUQsQ0FBYSxHQUFiLEVBRFY7T0FBQSxNQUVBLElBQUcsQ0FB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T0FBYixDQUFBLEtBQXlCOzJCQURmOztBQUFBOzs7UUFHWixRQUFRLENBQUMsSUFBVCxDQUFBO1FBRUEsT0FBQSxHQUFVLFFBQVMsQ0FBQSxDQUFBO1FBRW5CLElBQUEsR0FBTyxFQUFFLENBQUMsU0FBSCxDQUFBLENBQWUsQ0FBQSxPQUFBLEVBVHhCOztNQVdBLElBQUcsWUFBSDtRQUNFLElBQUcsaUJBQUg7QUFDRTtBQUFBO2VBQUEsVUFBQTs7WUFDRSxXQUFBLEdBQWMsU0FBUyxDQUFDLGNBQVYsQ0FBQTtZQUNkLEtBQUEsR0FBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBbkIsRUFBd0IsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUF4Qzt5QkFDUixJQUFBLENBQUs7Y0FBRSxPQUFBLEtBQUY7Y0FBUyxNQUFBLElBQVQ7Y0FBZ0IsVUFBRCxJQUFDLENBQUEsUUFBaEI7Y0FBMkIsU0FBRCxJQUFDLENBQUEsT0FBM0I7Y0FBcUMsUUFBRCxJQUFDLENBQUEsTUFBckM7YUFBTDtBQUhGO3lCQURGO1NBQUEsTUFBQTtpQkFNRSxJQUFBLENBQUs7WUFBRSxPQUFBLEtBQUY7WUFBUyxNQUFBLElBQVQ7WUFBZ0IsVUFBRCxJQUFDLENBQUEsUUFBaEI7WUFBMkIsU0FBRCxJQUFDLENBQUEsT0FBM0I7WUFBcUMsUUFBRCxJQUFDLENBQUEsTUFBckM7V0FBTCxFQU5GO1NBREY7T0FBQSxNQUFBO0FBU0UsY0FBVSxJQUFBLFlBQUEsQ0FBYSx5QkFBQSxHQUEwQixLQUFLLENBQUMsVUFBN0MsRUFUWjs7SUE1SE87Ozs7OztFQXVJWCxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQWxNakIiLCJzb3VyY2VzQ29udGVudCI6WyJFeFZpZXdNb2RlbCA9IHJlcXVpcmUgJy4vZXgtdmlldy1tb2RlbCdcbkV4ID0gcmVxdWlyZSAnLi9leCdcbkZpbmQgPSByZXF1aXJlICcuL2ZpbmQnXG5Db21tYW5kRXJyb3IgPSByZXF1aXJlICcuL2NvbW1hbmQtZXJyb3InXG5cbmNsYXNzIENvbW1hbmRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAZXhTdGF0ZSkgLT5cbiAgICBAc2VsZWN0aW9ucyA9IEBleFN0YXRlLmdldFNlbGVjdGlvbnMoKVxuICAgIEB2aWV3TW9kZWwgPSBuZXcgRXhWaWV3TW9kZWwoQCwgT2JqZWN0LmtleXMoQHNlbGVjdGlvbnMpLmxlbmd0aCA+IDApXG5cbiAgcGFyc2VBZGRyOiAoc3RyLCBjdXJzb3IpIC0+XG4gICAgcm93ID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgaWYgc3RyIGlzICcuJ1xuICAgICAgYWRkciA9IHJvd1xuICAgIGVsc2UgaWYgc3RyIGlzICckJ1xuICAgICAgIyBMaW5lcyBhcmUgMC1pbmRleGVkIGluIEF0b20sIGJ1dCAxLWluZGV4ZWQgaW4gdmltLlxuICAgICAgYWRkciA9IEBlZGl0b3IuZ2V0QnVmZmVyKCkubGluZXMubGVuZ3RoIC0gMVxuICAgIGVsc2UgaWYgc3RyWzBdIGluIFtcIitcIiwgXCItXCJdXG4gICAgICBhZGRyID0gcm93ICsgQHBhcnNlT2Zmc2V0KHN0cilcbiAgICBlbHNlIGlmIG5vdCBpc05hTihzdHIpXG4gICAgICBhZGRyID0gcGFyc2VJbnQoc3RyKSAtIDFcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIidcIiAjIFBhcnNlIE1hcmsuLi5cbiAgICAgIHVubGVzcyBAdmltU3RhdGU/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJDb3VsZG4ndCBnZXQgYWNjZXNzIHRvIHZpbS1tb2RlLlwiKVxuICAgICAgbWFyayA9IEB2aW1TdGF0ZS5tYXJrLm1hcmtzW3N0clsxXV1cbiAgICAgIHVubGVzcyBtYXJrP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTWFyayAje3N0cn0gbm90IHNldC5cIilcbiAgICAgIGFkZHIgPSBtYXJrLmdldEVuZEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgZWxzZSBpZiBzdHJbMF0gaXMgXCIvXCJcbiAgICAgIHN0ciA9IHN0clsxLi4uXVxuICAgICAgaWYgc3RyW3N0ci5sZW5ndGgtMV0gaXMgXCIvXCJcbiAgICAgICAgc3RyID0gc3RyWy4uLi0xXVxuICAgICAgYWRkciA9IEZpbmQuc2NhbkVkaXRvcihzdHIsIEBlZGl0b3IsIGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuZW5kKVswXVxuICAgICAgdW5sZXNzIGFkZHI/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJQYXR0ZXJuIG5vdCBmb3VuZDogI3tzdHJ9XCIpXG4gICAgICBhZGRyID0gYWRkci5zdGFydC5yb3dcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIj9cIlxuICAgICAgc3RyID0gc3RyWzEuLi5dXG4gICAgICBpZiBzdHJbc3RyLmxlbmd0aC0xXSBpcyBcIj9cIlxuICAgICAgICBzdHIgPSBzdHJbLi4uLTFdXG4gICAgICBhZGRyID0gRmluZC5zY2FuRWRpdG9yKHN0ciwgQGVkaXRvciwgY3Vyc29yLmdldEN1cnJlbnRMaW5lQnVmZmVyUmFuZ2UoKS5zdGFydCwgdHJ1ZSlbMF1cbiAgICAgIHVubGVzcyBhZGRyP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiUGF0dGVybiBub3QgZm91bmQ6ICN7c3RyWzEuLi4tMV19XCIpXG4gICAgICBhZGRyID0gYWRkci5zdGFydC5yb3dcblxuICAgIHJldHVybiBhZGRyXG5cbiAgcGFyc2VPZmZzZXQ6IChzdHIpIC0+XG4gICAgaWYgc3RyLmxlbmd0aCBpcyAwXG4gICAgICByZXR1cm4gMFxuICAgIGlmIHN0ci5sZW5ndGggaXMgMVxuICAgICAgbyA9IDFcbiAgICBlbHNlXG4gICAgICBvID0gcGFyc2VJbnQoc3RyWzEuLl0pXG4gICAgaWYgc3RyWzBdIGlzICcrJ1xuICAgICAgcmV0dXJuIG9cbiAgICBlbHNlXG4gICAgICByZXR1cm4gLW9cblxuICBleGVjdXRlOiAoaW5wdXQpIC0+XG4gICAgQHZpbVN0YXRlID0gQGV4U3RhdGUuZ2xvYmFsRXhTdGF0ZS52aW0/LmdldEVkaXRvclN0YXRlKEBlZGl0b3IpXG4gICAgIyBDb21tYW5kIGxpbmUgcGFyc2luZyAobW9zdGx5KSBmb2xsb3dpbmcgdGhlIHJ1bGVzIGF0XG4gICAgIyBodHRwOi8vcHVicy5vcGVuZ3JvdXAub3JnL29ubGluZXB1YnMvOTY5OTkxOTc5OS91dGlsaXRpZXNcbiAgICAjIC9leC5odG1sI3RhZ18yMF80MF8xM18wM1xuXG4gICAgIyBTdGVwcyAxLzI6IExlYWRpbmcgYmxhbmtzIGFuZCBjb2xvbnMgYXJlIGlnbm9yZWQuXG4gICAgY2wgPSBpbnB1dC5jaGFyYWN0ZXJzXG4gICAgY2wgPSBjbC5yZXBsYWNlKC9eKDp8XFxzKSovLCAnJylcbiAgICByZXR1cm4gdW5sZXNzIGNsLmxlbmd0aCA+IDBcblxuICAgICMgU3RlcCAzOiBJZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIGEgXCIsIGlnbm9yZSB0aGUgcmVzdCBvZiB0aGUgbGluZVxuICAgIGlmIGNsWzBdIGlzICdcIidcbiAgICAgIHJldHVyblxuXG4gICAgIyBTdGVwIDQ6IEFkZHJlc3MgcGFyc2luZ1xuICAgIGxhc3RMaW5lID0gQGVkaXRvci5nZXRCdWZmZXIoKS5saW5lcy5sZW5ndGggLSAxXG4gICAgaWYgY2xbMF0gaXMgJyUnXG4gICAgICByYW5nZSA9IFswLCBsYXN0TGluZV1cbiAgICAgIGNsID0gY2xbMS4uXVxuICAgIGVsc2VcbiAgICAgIGFkZHJQYXR0ZXJuID0gLy8vXlxuICAgICAgICAoPzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBGaXJzdCBhZGRyZXNzXG4gICAgICAgIChcbiAgICAgICAgXFwufCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEN1cnJlbnQgbGluZVxuICAgICAgICBcXCR8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgTGFzdCBsaW5lXG4gICAgICAgIFxcZCt8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBuLXRoIGxpbmVcbiAgICAgICAgJ1tcXFtcXF08PidgXCJeLigpe31hLXpBLVpdfCAgICAgICAgICMgTWFya3NcbiAgICAgICAgLy4qPyg/OlteXFxcXF0vfCQpfCAgICAgICAgICAgICAgICAgIyBSZWdleFxuICAgICAgICBcXD8uKj8oPzpbXlxcXFxdXFw/fCQpfCAgICAgICAgICAgICAgICMgQmFja3dhcmRzIHNlYXJjaFxuICAgICAgICBbKy1dXFxkKiAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQ3VycmVudCBsaW5lICsvLSBhIG51bWJlciBvZiBsaW5lc1xuICAgICAgICApKCg/OlxccypbKy1dXFxkKikqKSAgICAgICAgICAgICAgICAjIExpbmUgb2Zmc2V0XG4gICAgICAgICk/XG4gICAgICAgICg/OiwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFNlY29uZCBhZGRyZXNzXG4gICAgICAgICggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIFNhbWUgYXMgZmlyc3QgYWRkcmVzc1xuICAgICAgICBcXC58XG4gICAgICAgIFxcJHxcbiAgICAgICAgXFxkK3xcbiAgICAgICAgJ1tcXFtcXF08PidgXCJeLigpe31hLXpBLVpdfFxuICAgICAgICAvLio/W15cXFxcXS98XG4gICAgICAgIFxcPy4qP1teXFxcXF1cXD98XG4gICAgICAgIFsrLV1cXGQqXG4gICAgICAgICkoKD86XFxzKlsrLV1cXGQqKSopXG4gICAgICAgICk/XG4gICAgICAvLy9cblxuICAgICAgW21hdGNoLCBhZGRyMSwgb2ZmMSwgYWRkcjIsIG9mZjJdID0gY2wubWF0Y2goYWRkclBhdHRlcm4pXG5cbiAgICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0TGFzdEN1cnNvcigpXG5cbiAgICAgICMgU3BlY2lhbCBjYXNlOiBydW4gY29tbWFuZCBvbiBzZWxlY3Rpb24uIFRoaXMgY2FuJ3QgYmUgaGFuZGxlZCBieSBzaW1wbHlcbiAgICAgICMgcGFyc2luZyB0aGUgbWFyayBzaW5jZSB2aW0tbW9kZSBkb2Vzbid0IHNldCBpdCAoYW5kIGl0IHdvdWxkIGJlIGZhaXJseVxuICAgICAgIyB1c2VsZXNzIHdpdGggbXVsdGlwbGUgc2VsZWN0aW9ucylcbiAgICAgIGlmIGFkZHIxIGlzIFwiJzxcIiBhbmQgYWRkcjIgaXMgXCInPlwiXG4gICAgICAgIHJ1bk92ZXJTZWxlY3Rpb25zID0gdHJ1ZVxuICAgICAgZWxzZVxuICAgICAgICBydW5PdmVyU2VsZWN0aW9ucyA9IGZhbHNlXG4gICAgICAgIGlmIGFkZHIxP1xuICAgICAgICAgIGFkZHJlc3MxID0gQHBhcnNlQWRkcihhZGRyMSwgY3Vyc29yKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgIyBJZiBubyBhZGRyMSBpcyBnaXZlbiAoLCszKSwgYXNzdW1lIGl0IGlzICcuJ1xuICAgICAgICAgIGFkZHJlc3MxID0gY3Vyc29yLmdldEJ1ZmZlclJvdygpXG4gICAgICAgIGlmIG9mZjE/XG4gICAgICAgICAgYWRkcmVzczEgKz0gQHBhcnNlT2Zmc2V0KG9mZjEpXG5cbiAgICAgICAgYWRkcmVzczEgPSAwIGlmIGFkZHJlc3MxIGlzIC0xXG4gICAgICAgIGFkZHJlc3MxID0gbGFzdExpbmUgaWYgYWRkcmVzczEgPiBsYXN0TGluZVxuXG4gICAgICAgIGlmIGFkZHJlc3MxIDwgMFxuICAgICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ0ludmFsaWQgcmFuZ2UnKVxuXG4gICAgICAgIGlmIGFkZHIyP1xuICAgICAgICAgIGFkZHJlc3MyID0gQHBhcnNlQWRkcihhZGRyMiwgY3Vyc29yKVxuICAgICAgICBpZiBvZmYyP1xuICAgICAgICAgIGFkZHJlc3MyICs9IEBwYXJzZU9mZnNldChvZmYyKVxuXG4gICAgICAgIGFkZHJlc3MyID0gMCBpZiBhZGRyZXNzMiBpcyAtMVxuICAgICAgICBhZGRyZXNzMiA9IGxhc3RMaW5lIGlmIGFkZHJlc3MyID4gbGFzdExpbmVcblxuICAgICAgICBpZiBhZGRyZXNzMiA8IDBcbiAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdJbnZhbGlkIHJhbmdlJylcblxuICAgICAgICBpZiBhZGRyZXNzMiA8IGFkZHJlc3MxXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignQmFja3dhcmRzIHJhbmdlIGdpdmVuJylcblxuICAgICAgcmFuZ2UgPSBbYWRkcmVzczEsIGlmIGFkZHJlc3MyPyB0aGVuIGFkZHJlc3MyIGVsc2UgYWRkcmVzczFdXG4gICAgY2wgPSBjbFttYXRjaD8ubGVuZ3RoLi5dXG5cbiAgICAjIFN0ZXAgNTogTGVhZGluZyBibGFua3MgYXJlIGlnbm9yZWRcbiAgICBjbCA9IGNsLnRyaW1MZWZ0KClcblxuICAgICMgU3RlcCA2YTogSWYgbm8gY29tbWFuZCBpcyBzcGVjaWZpZWQsIGdvIHRvIHRoZSBsYXN0IHNwZWNpZmllZCBhZGRyZXNzXG4gICAgaWYgY2wubGVuZ3RoIGlzIDBcbiAgICAgIEBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW3JhbmdlWzFdLCAwXSlcbiAgICAgIHJldHVyblxuXG4gICAgIyBJZ25vcmUgc3RlcHMgNmIgYW5kIDZjIHNpbmNlIHRoZXkgb25seSBtYWtlIHNlbnNlIGZvciBwcmludCBjb21tYW5kcyBhbmRcbiAgICAjIHByaW50IGRvZXNuJ3QgbWFrZSBzZW5zZVxuXG4gICAgIyBJZ25vcmUgc3RlcCA3YSBzaW5jZSBmbGFncyBhcmUgb25seSB1c2VmdWwgZm9yIHByaW50XG5cbiAgICAjIFN0ZXAgN2I6IDprPHZhbGlkIG1hcms+IGlzIGVxdWFsIHRvIDptYXJrIDx2YWxpZCBtYXJrPiAtIG9ubHkgYS16QS1aIGlzXG4gICAgIyBpbiB2aW0tbW9kZSBmb3Igbm93XG4gICAgaWYgY2wubGVuZ3RoIGlzIDIgYW5kIGNsWzBdIGlzICdrJyBhbmQgL1thLXpdL2kudGVzdChjbFsxXSlcbiAgICAgIGNvbW1hbmQgPSAnbWFyaydcbiAgICAgIGFyZ3MgPSBjbFsxXVxuICAgIGVsc2UgaWYgbm90IC9bYS16XS9pLnRlc3QoY2xbMF0pXG4gICAgICBjb21tYW5kID0gY2xbMF1cbiAgICAgIGFyZ3MgPSBjbFsxLi5dXG4gICAgZWxzZVxuICAgICAgW20sIGNvbW1hbmQsIGFyZ3NdID0gY2wubWF0Y2goL14oXFx3KykoLiopLylcblxuICAgICMgSWYgdGhlIGNvbW1hbmQgbWF0Y2hlcyBhbiBleGlzdGluZyBvbmUgZXhhY3RseSwgZXhlY3V0ZSB0aGF0IG9uZVxuICAgIHVubGVzcyAoZnVuYyA9IEV4LnNpbmdsZXRvbigpW2NvbW1hbmRdKT9cbiAgICAgICMgU3RlcCA4OiBNYXRjaCBjb21tYW5kIGFnYWluc3QgZXhpc3RpbmcgY29tbWFuZHNcbiAgICAgIG1hdGNoaW5nID0gKG5hbWUgZm9yIG5hbWUsIHZhbCBvZiBFeC5zaW5nbGV0b24oKSB3aGVuIFxcXG4gICAgICAgIG5hbWUuaW5kZXhPZihjb21tYW5kKSBpcyAwKVxuXG4gICAgICBtYXRjaGluZy5zb3J0KClcblxuICAgICAgY29tbWFuZCA9IG1hdGNoaW5nWzBdXG5cbiAgICAgIGZ1bmMgPSBFeC5zaW5nbGV0b24oKVtjb21tYW5kXVxuXG4gICAgaWYgZnVuYz9cbiAgICAgIGlmIHJ1bk92ZXJTZWxlY3Rpb25zXG4gICAgICAgIGZvciBpZCwgc2VsZWN0aW9uIG9mIEBzZWxlY3Rpb25zXG4gICAgICAgICAgYnVmZmVyUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICAgIHJhbmdlID0gW2J1ZmZlclJhbmdlLnN0YXJ0LnJvdywgYnVmZmVyUmFuZ2UuZW5kLnJvd11cbiAgICAgICAgICBmdW5jKHsgcmFuZ2UsIGFyZ3MsIEB2aW1TdGF0ZSwgQGV4U3RhdGUsIEBlZGl0b3IgfSlcbiAgICAgIGVsc2VcbiAgICAgICAgZnVuYyh7IHJhbmdlLCBhcmdzLCBAdmltU3RhdGUsIEBleFN0YXRlLCBAZWRpdG9yIH0pXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcihcIk5vdCBhbiBlZGl0b3IgY29tbWFuZDogI3tpbnB1dC5jaGFyYWN0ZXJzfVwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRcbiJdfQ==
