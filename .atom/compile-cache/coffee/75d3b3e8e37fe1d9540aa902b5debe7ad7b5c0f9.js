(function() {
  var RemoteListView, colorOptions, git, options, promptForBranch, pullBeforePush, pullRebase, remotes, repo;

  git = require('../../lib/git');

  RemoteListView = require('../../lib/views/remote-list-view');

  repo = require('../fixtures').repo;

  options = {
    cwd: repo.getWorkingDirectory()
  };

  colorOptions = {
    color: true
  };

  remotes = "remote1\nremote2";

  pullBeforePush = 'git-plus.remoteInteractions.pullBeforePush';

  pullRebase = 'git-plus.remoteInteractions.pullRebase';

  promptForBranch = 'git-plus.remoteInteractions.promptForBranch';

  describe("RemoteListView", function() {
    it("displays a list of remotes", function() {
      var view;
      view = new RemoteListView(repo, remotes, {
        mode: 'pull'
      });
      return expect(view.items.length).toBe(2);
    });
    describe("when mode is pull", function() {
      describe("when promptForBranch is enabled", function() {
        return it("it calls git.cmd to get the remote branches", function() {
          var view;
          atom.config.set(promptForBranch, true);
          view = new RemoteListView(repo, remotes, {
            mode: 'pull'
          });
          spyOn(git, 'cmd').andCallFake(function() {
            return Promise.resolve('branch1\nbranch2');
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 0;
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color', '-r'], options);
          });
        });
      });
      return describe("when promptForBranch is disabled", function() {
        return it("it calls the _pull function", function() {
          var view;
          atom.config.set(promptForBranch, false);
          view = new RemoteListView(repo, remotes, {
            mode: 'pull'
          });
          spyOn(git, 'cmd').andCallFake(function() {
            return Promise.resolve('branch1\nbranch2');
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 0;
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo'], options, colorOptions);
          });
        });
      });
    });
    describe("when mode is fetch", function() {
      return it("it calls git.cmd to with ['fetch'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is fetch-prune", function() {
      return it("it calls git.cmd to with ['fetch', '--prune'] and the remote name", function() {
        var view;
        spyOn(git, 'cmd').andCallFake(function() {
          return Promise.resolve('fetched stuff');
        });
        view = new RemoteListView(repo, remotes, {
          mode: 'fetch-prune'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['fetch', '--prune', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is push", function() {
      return it("calls git.cmd with ['push']", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
        });
      });
    });
    describe("when mode is 'push -u'", function() {
      return it("calls git.cmd with ['push', '-u'] and remote name", function() {
        var view;
        spyOn(git, 'cmd').andReturn(Promise.resolve('pushing text'));
        view = new RemoteListView(repo, remotes, {
          mode: 'push -u'
        });
        view.confirmSelection();
        waitsFor(function() {
          return git.cmd.callCount > 0;
        });
        return runs(function() {
          return expect(git.cmd).toHaveBeenCalledWith(['push', '-u', 'remote1', 'HEAD'], options, colorOptions);
        });
      });
    });
    return describe("when the the config for pull before push is set to true", function() {
      describe("when promptForBranch is disabled", function() {
        return it("calls git.cmd with ['pull'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, true);
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 1;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', 'origin', 'foo'], options, colorOptions);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
          });
        });
      });
      describe("when promptForBranch is enabled", function() {
        return it("calls git.cmd with ['branch', '--no-color', '-r']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('remote/branch1'));
          atom.config.set(pullBeforePush, true);
          atom.config.set(promptForBranch, true);
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 0;
          });
          return runs(function() {
            return expect(git.cmd).toHaveBeenCalledWith(['branch', '--no-color', '-r'], options);
          });
        });
      });
      return describe("when the the config for pullRebase is set to true", function() {
        return it("calls git.cmd with ['pull', '--rebase'], remote name, and branch name and then with ['push']", function() {
          var view;
          spyOn(git, 'cmd').andReturn(Promise.resolve('branch1'));
          atom.config.set(pullBeforePush, true);
          atom.config.set(pullRebase, true);
          atom.config.set(promptForBranch, false);
          view = new RemoteListView(repo, remotes, {
            mode: 'push'
          });
          view.confirmSelection();
          waitsFor(function() {
            return git.cmd.callCount > 1;
          });
          return runs(function() {
            expect(git.cmd).toHaveBeenCalledWith(['pull', '--rebase', 'origin', 'foo'], options, colorOptions);
            return expect(git.cmd).toHaveBeenCalledWith(['push', 'remote1'], options, colorOptions);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvc3BlYy92aWV3cy9yZW1vdGUtbGlzdC12aWV3LXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLGVBQVI7O0VBQ04sY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVI7O0VBQ2hCLE9BQVEsT0FBQSxDQUFRLGFBQVI7O0VBQ1QsT0FBQSxHQUFVO0lBQUMsR0FBQSxFQUFLLElBQUksQ0FBQyxtQkFBTCxDQUFBLENBQU47OztFQUNWLFlBQUEsR0FBZTtJQUFDLEtBQUEsRUFBTyxJQUFSOzs7RUFDZixPQUFBLEdBQVU7O0VBQ1YsY0FBQSxHQUFpQjs7RUFDakIsVUFBQSxHQUFhOztFQUNiLGVBQUEsR0FBa0I7O0VBRWxCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0lBQ3pCLEVBQUEsQ0FBRyw0QkFBSCxFQUFpQyxTQUFBO0FBQy9CLFVBQUE7TUFBQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtRQUFBLElBQUEsRUFBTSxNQUFOO09BQTlCO2FBQ1gsTUFBQSxDQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBbEIsQ0FBeUIsQ0FBQyxJQUExQixDQUErQixDQUEvQjtJQUYrQixDQUFqQztJQUlBLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBO01BQzVCLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBO2VBQzFDLEVBQUEsQ0FBRyw2Q0FBSCxFQUFrRCxTQUFBO0FBQ2hELGNBQUE7VUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZUFBaEIsRUFBaUMsSUFBakM7VUFDQSxJQUFBLEdBQVcsSUFBQSxjQUFBLENBQWUsSUFBZixFQUFxQixPQUFyQixFQUE4QjtZQUFBLElBQUEsRUFBTSxNQUFOO1dBQTlC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QyxJQUFoQztVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixVQUFoQixFQUE0QixJQUE1QjtVQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixlQUFoQixFQUFpQyxLQUFqQztVQUVBLElBQUEsR0FBVyxJQUFBLGNBQUEsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLEVBQThCO1lBQUEsSUFBQSxFQUFNLE1BQU47V0FBOUI7VUFDWCxJQUFJLENBQUMsZ0JBQUwsQ0FBQTtVQUVBLFFBQUEsQ0FBUyxTQUFBO21CQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUixHQUFvQjtVQUF2QixDQUFUO2lCQUNBLElBQUEsQ0FBSyxTQUFBO1lBQ0gsTUFBQSxDQUFPLEdBQUcsQ0FBQyxHQUFYLENBQWUsQ0FBQyxvQkFBaEIsQ0FBcUMsQ0FBQyxNQUFELEVBQVMsVUFBVCxFQUFxQixRQUFyQixFQUErQixLQUEvQixDQUFyQyxFQUE0RSxPQUE1RSxFQUFxRixZQUFyRjttQkFDQSxNQUFBLENBQU8sR0FBRyxDQUFDLEdBQVgsQ0FBZSxDQUFDLG9CQUFoQixDQUFxQyxDQUFDLE1BQUQsRUFBUyxTQUFULENBQXJDLEVBQTBELE9BQTFELEVBQW1FLFlBQW5FO1VBRkcsQ0FBTDtRQVZpRyxDQUFuRztNQUQ0RCxDQUE5RDtJQTNCa0UsQ0FBcEU7RUF6RXlCLENBQTNCO0FBVkEiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi8uLi9saWIvZ2l0J1xuUmVtb3RlTGlzdFZpZXcgPSByZXF1aXJlICcuLi8uLi9saWIvdmlld3MvcmVtb3RlLWxpc3QtdmlldydcbntyZXBvfSA9IHJlcXVpcmUgJy4uL2ZpeHR1cmVzJ1xub3B0aW9ucyA9IHtjd2Q6IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpfVxuY29sb3JPcHRpb25zID0ge2NvbG9yOiB0cnVlfVxucmVtb3RlcyA9IFwicmVtb3RlMVxcbnJlbW90ZTJcIlxucHVsbEJlZm9yZVB1c2ggPSAnZ2l0LXBsdXMucmVtb3RlSW50ZXJhY3Rpb25zLnB1bGxCZWZvcmVQdXNoJ1xucHVsbFJlYmFzZSA9ICdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHVsbFJlYmFzZSdcbnByb21wdEZvckJyYW5jaCA9ICdnaXQtcGx1cy5yZW1vdGVJbnRlcmFjdGlvbnMucHJvbXB0Rm9yQnJhbmNoJ1xuXG5kZXNjcmliZSBcIlJlbW90ZUxpc3RWaWV3XCIsIC0+XG4gIGl0IFwiZGlzcGxheXMgYSBsaXN0IG9mIHJlbW90ZXNcIiwgLT5cbiAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdWxsJylcbiAgICBleHBlY3Qodmlldy5pdGVtcy5sZW5ndGgpLnRvQmUgMlxuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIHB1bGxcIiwgLT5cbiAgICBkZXNjcmliZSBcIndoZW4gcHJvbXB0Rm9yQnJhbmNoIGlzIGVuYWJsZWRcIiwgLT5cbiAgICAgIGl0IFwiaXQgY2FsbHMgZ2l0LmNtZCB0byBnZXQgdGhlIHJlbW90ZSBicmFuY2hlc1wiLCAtPlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHJvbXB0Rm9yQnJhbmNoLCB0cnVlKVxuICAgICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdWxsJylcbiAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgICAgICBQcm9taXNlLnJlc29sdmUgJ2JyYW5jaDFcXG5icmFuY2gyJ1xuXG4gICAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnYnJhbmNoJywgJy0tbm8tY29sb3InLCAnLXInXSwgb3B0aW9uc1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHByb21wdEZvckJyYW5jaCBpcyBkaXNhYmxlZFwiLCAtPlxuICAgICAgaXQgXCJpdCBjYWxscyB0aGUgX3B1bGwgZnVuY3Rpb25cIiwgLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KHByb21wdEZvckJyYW5jaCwgZmFsc2UpXG4gICAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ3B1bGwnKVxuICAgICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgICAgIFByb21pc2UucmVzb2x2ZSAnYnJhbmNoMVxcbmJyYW5jaDInXG5cbiAgICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcbiAgICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIG1vZGUgaXMgZmV0Y2hcIiwgLT5cbiAgICBpdCBcIml0IGNhbGxzIGdpdC5jbWQgdG8gd2l0aCBbJ2ZldGNoJ10gYW5kIHRoZSByZW1vdGUgbmFtZVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kQ2FsbEZha2UgLT5cbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlICdmZXRjaGVkIHN0dWZmJ1xuXG4gICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdmZXRjaCcpXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAwXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2ZldGNoJywgJ3JlbW90ZTEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIG1vZGUgaXMgZmV0Y2gtcHJ1bmVcIiwgLT5cbiAgICBpdCBcIml0IGNhbGxzIGdpdC5jbWQgdG8gd2l0aCBbJ2ZldGNoJywgJy0tcHJ1bmUnXSBhbmQgdGhlIHJlbW90ZSBuYW1lXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRDYWxsRmFrZSAtPlxuICAgICAgICBQcm9taXNlLnJlc29sdmUgJ2ZldGNoZWQgc3R1ZmYnXG5cbiAgICAgIHZpZXcgPSBuZXcgUmVtb3RlTGlzdFZpZXcocmVwbywgcmVtb3RlcywgbW9kZTogJ2ZldGNoLXBydW5lJylcbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDBcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsnZmV0Y2gnLCAnLS1wcnVuZScsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gIGRlc2NyaWJlIFwid2hlbiBtb2RlIGlzIHB1c2hcIiwgLT5cbiAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ3B1c2gnXVwiLCAtPlxuICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAncHVzaGluZyB0ZXh0J1xuXG4gICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdXNoJylcbiAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG5cbiAgICAgIHdhaXRzRm9yIC0+IGdpdC5jbWQuY2FsbENvdW50ID4gMFxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdXNoJywgJ3JlbW90ZTEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIG1vZGUgaXMgJ3B1c2ggLXUnXCIsIC0+XG4gICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdXNoJywgJy11J10gYW5kIHJlbW90ZSBuYW1lXCIsIC0+XG4gICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCdwdXNoaW5nIHRleHQnKVxuICAgICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAncHVzaCAtdScpXG4gICAgICB2aWV3LmNvbmZpcm1TZWxlY3Rpb24oKVxuXG4gICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDBcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVzaCcsICctdScsICdyZW1vdGUxJywgJ0hFQUQnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG5cbiAgZGVzY3JpYmUgXCJ3aGVuIHRoZSB0aGUgY29uZmlnIGZvciBwdWxsIGJlZm9yZSBwdXNoIGlzIHNldCB0byB0cnVlXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJ3aGVuIHByb21wdEZvckJyYW5jaCBpcyBkaXNhYmxlZFwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdWxsJ10sIHJlbW90ZSBuYW1lLCBhbmQgYnJhbmNoIG5hbWUgYW5kIHRoZW4gd2l0aCBbJ3B1c2gnXVwiLCAtPlxuICAgICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdicmFuY2gxJ1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHVsbEJlZm9yZVB1c2gsIHRydWUpXG5cbiAgICAgICAgdmlldyA9IG5ldyBSZW1vdGVMaXN0VmlldyhyZXBvLCByZW1vdGVzLCBtb2RlOiAncHVzaCcpXG4gICAgICAgIHZpZXcuY29uZmlybVNlbGVjdGlvbigpXG5cbiAgICAgICAgd2FpdHNGb3IgLT4gZ2l0LmNtZC5jYWxsQ291bnQgPiAxXG4gICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdWxsJywgJ29yaWdpbicsICdmb28nXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4gICAgICAgICAgZXhwZWN0KGdpdC5jbWQpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoIFsncHVzaCcsICdyZW1vdGUxJ10sIG9wdGlvbnMsIGNvbG9yT3B0aW9uc1xuXG4gICAgZGVzY3JpYmUgXCJ3aGVuIHByb21wdEZvckJyYW5jaCBpcyBlbmFibGVkXCIsIC0+XG4gICAgICBpdCBcImNhbGxzIGdpdC5jbWQgd2l0aCBbJ2JyYW5jaCcsICctLW5vLWNvbG9yJywgJy1yJ11cIiwgLT5cbiAgICAgICAgc3B5T24oZ2l0LCAnY21kJykuYW5kUmV0dXJuIFByb21pc2UucmVzb2x2ZSAncmVtb3RlL2JyYW5jaDEnXG4gICAgICAgIGF0b20uY29uZmlnLnNldChwdWxsQmVmb3JlUHVzaCwgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KHByb21wdEZvckJyYW5jaCwgdHJ1ZSlcblxuICAgICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdXNoJylcbiAgICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDBcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ2JyYW5jaCcsICctLW5vLWNvbG9yJywgJy1yJ10sIG9wdGlvbnNcblxuICAgIGRlc2NyaWJlIFwid2hlbiB0aGUgdGhlIGNvbmZpZyBmb3IgcHVsbFJlYmFzZSBpcyBzZXQgdG8gdHJ1ZVwiLCAtPlxuICAgICAgaXQgXCJjYWxscyBnaXQuY21kIHdpdGggWydwdWxsJywgJy0tcmViYXNlJ10sIHJlbW90ZSBuYW1lLCBhbmQgYnJhbmNoIG5hbWUgYW5kIHRoZW4gd2l0aCBbJ3B1c2gnXVwiLCAtPlxuICAgICAgICBzcHlPbihnaXQsICdjbWQnKS5hbmRSZXR1cm4gUHJvbWlzZS5yZXNvbHZlICdicmFuY2gxJ1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHVsbEJlZm9yZVB1c2gsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldChwdWxsUmViYXNlLCB0cnVlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQocHJvbXB0Rm9yQnJhbmNoLCBmYWxzZSlcblxuICAgICAgICB2aWV3ID0gbmV3IFJlbW90ZUxpc3RWaWV3KHJlcG8sIHJlbW90ZXMsIG1vZGU6ICdwdXNoJylcbiAgICAgICAgdmlldy5jb25maXJtU2VsZWN0aW9uKClcblxuICAgICAgICB3YWl0c0ZvciAtPiBnaXQuY21kLmNhbGxDb3VudCA+IDFcbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChnaXQuY21kKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCBbJ3B1bGwnLCAnLS1yZWJhc2UnLCAnb3JpZ2luJywgJ2ZvbyddLCBvcHRpb25zLCBjb2xvck9wdGlvbnNcbiAgICAgICAgICBleHBlY3QoZ2l0LmNtZCkudG9IYXZlQmVlbkNhbGxlZFdpdGggWydwdXNoJywgJ3JlbW90ZTEnXSwgb3B0aW9ucywgY29sb3JPcHRpb25zXG4iXX0=
