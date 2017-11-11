(function() {
  var StatusListView, fs, git, repo,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs-plus');

  git = require('../../lib/git');

  repo = require('../fixtures').repo;

  StatusListView = require('../../lib/views/status-list-view');

  describe("StatusListView", function() {
    describe("when there are modified files", function() {
      it("displays a list of modified files", function() {
        var view;
        view = new StatusListView(repo, [" M\tfile.txt", " D\tanother.txt", '']);
        return expect(view.items.length).toBe(2);
      });
      return it("calls git.cmd with 'diff' when user doesn't want to open the file", function() {
        var view;
        spyOn(window, 'confirm').andReturn(false);
        spyOn(git, 'cmd').andReturn(Promise.resolve('foobar'));
        spyOn(fs, 'stat').andCallFake(function() {
          var stat;
          stat = {
            isDirectory: function() {
              return false;
            }
          };
          return fs.stat.mostRecentCall.args[1](null, stat);
        });
        view = new StatusListView(repo, [" M\tfile.txt", " D\tanother.txt", '']);
        view.confirmSelection();
        return expect(indexOf.call(git.cmd.mostRecentCall.args[0], 'diff') >= 0).toBe(true);
      });
    });
    return describe("when there are unstaged files", function() {
      beforeEach(function() {
        return spyOn(window, 'confirm').andReturn(true);
      });
      it("opens the file when it is a file", function() {
        var view;
        spyOn(atom.workspace, 'open');
        spyOn(fs, 'stat').andCallFake(function() {
          var stat;
          stat = {
            isDirectory: function() {
              return false;
            }
          };
          return fs.stat.mostRecentCall.args[1](null, stat);
        });
        view = new StatusListView(repo, [" M\tfile.txt", " D\tanother.txt", '']);
        view.confirmSelection();
        return expect(atom.workspace.open).toHaveBeenCalled();
      });
      return it("opens the directory in a project when it is a directory", function() {
        var view;
        spyOn(atom, 'open');
        spyOn(fs, 'stat').andCallFake(function() {
          var stat;
          stat = {
            isDirectory: function() {
              return true;
            }
          };
          return fs.stat.mostRecentCall.args[1](null, stat);
        });
        view = new StatusListView(repo, [" M\tfile.txt", " D\tanother.txt", '']);
        view.confirmSelection();
        return expect(atom.open).toHaveBeenCalled();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9zdGF0dXMtbGlzdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw2QkFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ0wsT0FBUSxPQUFBLENBQVEsYUFBUjs7RUFDVCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxrQ0FBUjs7RUFFakIsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUE7SUFDekIsUUFBQSxDQUFTLCtCQUFULEVBQTBDLFNBQUE7TUFDeEMsRUFBQSxDQUFHLG1DQUFILEVBQXdDLFNBQUE7QUFDdEMsWUFBQTtRQUFBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLENBQUMsY0FBRCxFQUFpQixpQkFBakIsRUFBb0MsRUFBcEMsQ0FBckI7ZUFDWCxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFsQixDQUF5QixDQUFDLElBQTFCLENBQStCLENBQS9CO01BRnNDLENBQXhDO2FBSUEsRUFBQSxDQUFHLG1FQUFILEVBQXdFLFNBQUE7QUFDdEUsWUFBQTtRQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsU0FBZCxDQUF3QixDQUFDLFNBQXpCLENBQW1DLEtBQW5DO1FBQ0EsS0FBQSxDQUFNLEdBQU4sRUFBVyxLQUFYLENBQWlCLENBQUMsU0FBbEIsQ0FBNEIsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsQ0FBNUI7UUFDQSxLQUFBLENBQU0sRUFBTixFQUFVLE1BQVYsQ0FBaUIsQ0FBQyxXQUFsQixDQUE4QixTQUFBO0FBQzVCLGNBQUE7VUFBQSxJQUFBLEdBQU87WUFBQSxXQUFBLEVBQWEsU0FBQTtxQkFBRztZQUFILENBQWI7O2lCQUNQLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQTVCLENBQStCLElBQS9CLEVBQXFDLElBQXJDO1FBRjRCLENBQTlCO1FBR0EsSUFBQSxHQUFXLElBQUEsY0FBQSxDQUFlLElBQWYsRUFBcUIsQ0FBQyxjQUFELEVBQWlCLGlCQUFqQixFQUFvQyxFQUFwQyxDQUFyQjtRQUNYLElBQUksQ0FBQyxnQkFBTCxDQUFBO2VBQ0EsTUFBQSxDQUFPLGFBQVUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBdEMsRUFBQSxNQUFBLE1BQVAsQ0FBZ0QsQ0FBQyxJQUFqRCxDQUFzRCxJQUF0RDtNQVJzRSxDQUF4RTtJQUx3QyxDQUExQztXQWVBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBO01BQ3hDLFVBQUEsQ0FBVyxTQUFBO2VBQ1QsS0FBQSxDQUFNLE1BQU4sRUFBYyxTQUFkLENBQXdCLENBQUMsU0FBekIsQ0FBbUMsSUFBbkM7TUFEUyxDQUFYO01BR0EsRUFBQSxDQUFHLGtDQUFILEVBQXVDLFNBQUE7QUFDckMsWUFBQTtRQUFBLEtBQUEsQ0FBTSxJQUFJLENBQUMsU0FBWCxFQUFzQixNQUF0QjtRQUNBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsTUFBVixDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUE7QUFDNUIsY0FBQTtVQUFBLElBQUEsR0FBTztZQUFBLFdBQUEsRUFBYSxTQUFBO3FCQUFHO1lBQUgsQ0FBYjs7aUJBQ1AsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBNUIsQ0FBK0IsSUFBL0IsRUFBcUMsSUFBckM7UUFGNEIsQ0FBOUI7UUFHQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixDQUFDLGNBQUQsRUFBaUIsaUJBQWpCLEVBQW9DLEVBQXBDLENBQXJCO1FBQ1gsSUFBSSxDQUFDLGdCQUFMLENBQUE7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUF0QixDQUEyQixDQUFDLGdCQUE1QixDQUFBO01BUHFDLENBQXZDO2FBU0EsRUFBQSxDQUFHLHlEQUFILEVBQThELFNBQUE7QUFDNUQsWUFBQTtRQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksTUFBWjtRQUNBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsTUFBVixDQUFpQixDQUFDLFdBQWxCLENBQThCLFNBQUE7QUFDNUIsY0FBQTtVQUFBLElBQUEsR0FBTztZQUFBLFdBQUEsRUFBYSxTQUFBO3FCQUFHO1lBQUgsQ0FBYjs7aUJBQ1AsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBNUIsQ0FBK0IsSUFBL0IsRUFBcUMsSUFBckM7UUFGNEIsQ0FBOUI7UUFHQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixDQUFDLGNBQUQsRUFBaUIsaUJBQWpCLEVBQW9DLEVBQXBDLENBQXJCO1FBQ1gsSUFBSSxDQUFDLGdCQUFMLENBQUE7ZUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLElBQVosQ0FBaUIsQ0FBQyxnQkFBbEIsQ0FBQTtNQVA0RCxDQUE5RDtJQWJ3QyxDQUExQztFQWhCeUIsQ0FBM0I7QUFMQSIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbmdpdCA9IHJlcXVpcmUgJy4uLy4uL2xpYi9naXQnXG57cmVwb30gPSByZXF1aXJlICcuLi9maXh0dXJlcydcblN0YXR1c0xpc3RWaWV3ID0gcmVxdWlyZSAnLi4vLi4vbGliL3ZpZXdzL3N0YXR1cy1saXN0LXZpZXcnXG5cbmRlc2NyaWJlIFwiU3RhdHVzTGlzdFZpZXdcIiwgLT5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZXJlIGFyZSBtb2RpZmllZCBmaWxlc1wiLCAtPlxuICAgIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIG1vZGlmaWVkIGZpbGVzXCIsIC0+XG4gICAgICB2aWV3ID0gbmV3IFN0YXR1c0xpc3RWaWV3KHJlcG8sIFtcIiBNXFx0ZmlsZS50eHRcIiwgXCIgRFxcdGFub3RoZXIudHh0XCIsICcnXSlcbiAgICAgIGV4cGVjdCh2aWV3Lml0ZW1zLmxlbmd0aCkudG9CZSAyXG5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCAnZGlmZicgd2hlbiB1c2VyIGRvZXNuJ3Qgd2FudCB0byBvcGVuIHRoZSBmaWxlXCIsIC0+XG4gICAgICBzcHlPbih3aW5kb3csICdjb25maXJtJykuYW5kUmV0dXJuIGZhbHNlXG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdmb29iYXInXG4gICAgICBzcHlPbihmcywgJ3N0YXQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgICBzdGF0ID0gaXNEaXJlY3Rvcnk6IC0+IGZhbHNlXG4gICAgICAgIGZzLnN0YXQubW9zdFJlY2VudENhbGwuYXJnc1sxXShudWxsLCBzdGF0KVxuICAgICAgdmlldyA9IG5ldyBTdGF0dXNMaXN0VmlldyhyZXBvLCBbXCIgTVxcdGZpbGUudHh0XCIsIFwiIERcXHRhbm90aGVyLnR4dFwiLCAnJ10pXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgICAgZXhwZWN0KCdkaWZmJyBpbiBnaXQuY21kLm1vc3RSZWNlbnRDYWxsLmFyZ3NbMF0pLnRvQmUgdHJ1ZVxuXG4gIGRlc2NyaWJlIFwid2hlbiB0aGVyZSBhcmUgdW5zdGFnZWQgZmlsZXNcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzcHlPbih3aW5kb3csICdjb25maXJtJykuYW5kUmV0dXJuIHRydWVcblxuICAgIGl0IFwib3BlbnMgdGhlIGZpbGUgd2hlbiBpdCBpcyBhIGZpbGVcIiwgLT5cbiAgICAgIHNweU9uKGF0b20ud29ya3NwYWNlLCAnb3BlbicpXG4gICAgICBzcHlPbihmcywgJ3N0YXQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgICBzdGF0ID0gaXNEaXJlY3Rvcnk6IC0+IGZhbHNlXG4gICAgICAgIGZzLnN0YXQubW9zdFJlY2VudENhbGwuYXJnc1sxXShudWxsLCBzdGF0KVxuICAgICAgdmlldyA9IG5ldyBTdGF0dXNMaXN0VmlldyhyZXBvLCBbXCIgTVxcdGZpbGUudHh0XCIsIFwiIERcXHRhbm90aGVyLnR4dFwiLCAnJ10pXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgICAgZXhwZWN0KGF0b20ud29ya3NwYWNlLm9wZW4pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuXG4gICAgaXQgXCJvcGVucyB0aGUgZGlyZWN0b3J5IGluIGEgcHJvamVjdCB3aGVuIGl0IGlzIGEgZGlyZWN0b3J5XCIsIC0+XG4gICAgICBzcHlPbihhdG9tLCAnb3BlbicpXG4gICAgICBzcHlPbihmcywgJ3N0YXQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgICBzdGF0ID0gaXNEaXJlY3Rvcnk6IC0+IHRydWVcbiAgICAgICAgZnMuc3RhdC5tb3N0UmVjZW50Q2FsbC5hcmdzWzFdKG51bGwsIHN0YXQpXG4gICAgICB2aWV3ID0gbmV3IFN0YXR1c0xpc3RWaWV3KHJlcG8sIFtcIiBNXFx0ZmlsZS50eHRcIiwgXCIgRFxcdGFub3RoZXIudHh0XCIsICcnXSlcbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICBleHBlY3QoYXRvbS5vcGVuKS50b0hhdmVCZWVuQ2FsbGVkKClcbiJdfQ==
