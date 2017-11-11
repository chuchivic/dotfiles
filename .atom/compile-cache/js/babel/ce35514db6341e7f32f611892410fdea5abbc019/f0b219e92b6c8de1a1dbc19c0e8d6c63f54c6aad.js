function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _sbEventKit = require('sb-event-kit');

var _jasmineFix = require('jasmine-fix');

var _libCommands = require('../lib/commands');

var _libCommands2 = _interopRequireDefault(_libCommands);

var _helpers = require('./helpers');

describe('Commands', function () {
  var commands = undefined;
  var editorView = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    commands = new _libCommands2['default']();
    commands.activate();
    yield atom.workspace.open(__filename);
    editorView = atom.views.getView(atom.workspace.getActiveTextEditor());
  }));
  afterEach(function () {
    atom.workspace.destroyActivePane();
    commands.dispose();
  });

  describe('Highlights', function () {
    (0, _jasmineFix.it)('does nothing if not activated and we try to deactivate', function () {
      commands.processHighlightsHide();
    });
    (0, _jasmineFix.it)('does not activate unless provider tells it to', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onHighlightsShow(function () {
        timesShow++;
        return Promise.resolve(false);
      });
      commands.onHighlightsHide(function () {
        timesHide++;
      });
      yield commands.processHighlightsShow();
      commands.processHighlightsHide();

      expect(timesShow).toBe(1);
      expect(timesHide).toBe(0);
    }));
    (0, _jasmineFix.it)('activates when the provider tells it to', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onHighlightsShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onHighlightsHide(function () {
        timesHide++;
      });
      yield commands.processHighlightsShow();
      commands.processHighlightsHide();

      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
    }));
    (0, _jasmineFix.it)('throws if already highlighted', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onHighlightsShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onHighlightsHide(function () {
        timesHide++;
      });
      yield commands.processHighlightsShow();
      try {
        yield commands.processHighlightsShow();
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe('Already active');
      }
      try {
        yield commands.processHighlightsShow();
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe('Already active');
      }
      commands.processHighlightsHide();
      commands.processHighlightsHide();
      commands.processHighlightsHide();

      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
    }));
    (0, _jasmineFix.it)('disposes list if available', _asyncToGenerator(function* () {
      var disposed = false;
      var active = { type: 'list', subscriptions: new _sbEventKit.CompositeDisposable() };
      active.subscriptions.add(new _sbEventKit.Disposable(function () {
        disposed = true;
      }));
      commands.active = active;
      expect(disposed).toBe(false);
      yield commands.processHighlightsShow();
      expect(disposed).toBe(true);
    }));
    (0, _jasmineFix.it)('adds and removes classes appropriately', _asyncToGenerator(function* () {
      commands.onHighlightsShow(function () {
        return Promise.resolve(true);
      });
      expect(editorView.classList.contains('intentions-highlights')).toBe(false);
      yield commands.processHighlightsShow();
      expect(editorView.classList.contains('intentions-highlights')).toBe(true);
      commands.processHighlightsHide();
      expect(editorView.classList.contains('intentions-highlights')).toBe(false);
    }));
    describe('command listener', function () {
      (0, _jasmineFix.it)('just activates if theres no keyboard event attached', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onHighlightsShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onHighlightsHide(function () {
          timesHide++;
        });
        expect(timesShow).toBe(0);
        expect(timesHide).toBe(0);
        atom.commands.dispatch(editorView, 'intentions:highlight');
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        commands.processHighlightsHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
      (0, _jasmineFix.it)('ignores more than one activation requests', _asyncToGenerator(function* () {
        var timesShow = 0;
        commands.onHighlightsShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        atom.keymaps.dispatchCommandEvent('intentions:highlight', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        atom.keymaps.dispatchCommandEvent('intentions:highlight', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        atom.keymaps.dispatchCommandEvent('intentions:highlight', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
      }));
      (0, _jasmineFix.it)('just activates if keyboard event is not keydown', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onHighlightsShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onHighlightsHide(function () {
          timesHide++;
        });
        expect(timesShow).toBe(0);
        expect(timesHide).toBe(0);
        atom.keymaps.dispatchCommandEvent('intentions:highlight', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        commands.processHighlightsHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
      (0, _jasmineFix.it)('does not deactivate if keyup is not same keycode', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onHighlightsShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onHighlightsHide(function () {
          timesHide++;
        });
        expect(timesShow).toBe(0);
        expect(timesHide).toBe(0);
        atom.keymaps.dispatchCommandEvent('intentions:highlight', editorView, (0, _helpers.getKeyboardEvent)('keydown'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup', 1));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        commands.processHighlightsHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
      (0, _jasmineFix.it)('does deactivate if keyup is the same keycode', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onHighlightsShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onHighlightsHide(function () {
          timesHide++;
        });
        expect(timesShow).toBe(0);
        expect(timesHide).toBe(0);
        atom.keymaps.dispatchCommandEvent('intentions:highlight', editorView, (0, _helpers.getKeyboardEvent)('keydown'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
        commands.processHighlightsHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
    });
  });
  describe('Lists', function () {
    (0, _jasmineFix.it)('does nothing if deactivated and we try to activate it', function () {
      commands.processListHide();
    });
    (0, _jasmineFix.it)('does not pass on move events if not activated', function () {
      var callback = jasmine.createSpy('commands:list-move');
      commands.onListMove(callback);
      commands.processListMove('up');
      commands.processListMove('down');
      commands.processListMove('down');
      expect(callback).not.toHaveBeenCalled();
    });
    (0, _jasmineFix.it)('passes on move events if activated', function () {
      var callback = jasmine.createSpy('commands:list-move');
      commands.onListMove(callback);
      commands.processListMove('down');
      commands.processListMove('down');
      commands.processListMove('down');
      commands.active = { type: 'list', subscriptions: new _sbEventKit.CompositeDisposable() };
      commands.processListMove('down');
      commands.processListMove('down');
      commands.processListMove('down');
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(3);
    });
    (0, _jasmineFix.it)('ignores confirm if not activated', function () {
      var callback = jasmine.createSpy('commands:list-confirm');
      commands.onListConfirm(callback);
      commands.processListConfirm();
      commands.processListConfirm();
      commands.processListConfirm();
      commands.processListConfirm();
      expect(callback).not.toHaveBeenCalled();
    });
    (0, _jasmineFix.it)('passes on confirm if activated', function () {
      var callback = jasmine.createSpy('commands:list-confirm');
      commands.onListConfirm(callback);
      commands.processListConfirm();
      commands.processListConfirm();
      commands.active = { type: 'list', subscriptions: new _sbEventKit.CompositeDisposable() };
      commands.processListConfirm();
      commands.processListConfirm();
      expect(callback).toHaveBeenCalled();
      expect(callback.calls.length).toBe(2);
    });
    (0, _jasmineFix.it)('does not activate if listeners dont say that', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onListShow(function () {
        timesShow++;
        return Promise.resolve(false);
      });
      commands.onListHide(function () {
        timesHide++;
      });
      yield commands.processListShow();
      commands.processListHide();
      expect(timesShow).toBe(1);
      expect(timesHide).toBe(0);
    }));
    (0, _jasmineFix.it)('activates when listeners allow', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onListShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onListHide(function () {
        timesHide++;
      });
      yield commands.processListShow();
      commands.processListHide();
      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
    }));
    (0, _jasmineFix.it)('ignores if list is already active', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onListShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onListHide(function () {
        timesHide++;
      });
      yield commands.processListShow();
      try {
        yield commands.processListShow();
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe('Already active');
      }
      try {
        yield commands.processListShow();
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe('Already active');
      }
      try {
        yield commands.processListShow();
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toBe('Already active');
      }
      commands.processListHide();
      commands.processListHide();
      commands.processListHide();
      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
    }));
    (0, _jasmineFix.it)('disposes if highlights are active', _asyncToGenerator(function* () {
      var disposed = false;
      var timesShow = 0;
      var timesHide = 0;
      commands.onListShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onListHide(function () {
        timesHide++;
      });
      yield commands.processListShow();
      commands.processListHide();
      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
      commands.active = { type: 'highlight', subscriptions: new _sbEventKit.CompositeDisposable() };
      commands.active.subscriptions.add(new _sbEventKit.Disposable(function () {
        disposed = true;
      }));
      expect(disposed).toBe(false);
      yield commands.processListShow();
      commands.processListHide();
      expect(disposed).toBe(true);
      expect(timesShow).toBe(2);
      expect(timesHide).toBe(2);
    }));
    (0, _jasmineFix.it)('adds and removes classes appropriately', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onListShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onListHide(function () {
        timesHide++;
      });
      expect(editorView.classList.contains('intentions-list')).toBe(false);
      yield commands.processListShow();
      expect(editorView.classList.contains('intentions-list')).toBe(true);
      commands.processListHide();
      expect(editorView.classList.contains('intentions-list')).toBe(false);
      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
    }));
    (0, _jasmineFix.it)('disposes list on mouseup', _asyncToGenerator(function* () {
      var timesShow = 0;
      var timesHide = 0;
      commands.onListShow(function () {
        timesShow++;
        return Promise.resolve(true);
      });
      commands.onListHide(function () {
        timesHide++;
      });
      yield commands.processListShow();
      commands.processListHide();
      expect(timesShow).toBe(1);
      expect(timesHide).toBe(1);
      yield commands.processListShow();
      document.body.dispatchEvent(new MouseEvent('mouseup'));
      yield (0, _jasmineFix.wait)(10);
      expect(timesShow).toBe(2);
      expect(timesHide).toBe(2);
    }));
    describe('command listener', function () {
      (0, _jasmineFix.it)('just enables when no keyboard event', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onListShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onListHide(function () {
          timesHide++;
        });
        atom.commands.dispatch(editorView, 'intentions:show');
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        commands.processListHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
      (0, _jasmineFix.it)('just enables when keyboard event is not keydown', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onListShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onListHide(function () {
          timesHide++;
        });
        atom.keymaps.dispatchCommandEvent('intentions:show', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        commands.processListHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
      (0, _jasmineFix.it)('ignores more than one activation requests', _asyncToGenerator(function* () {
        var timesShow = 0;
        commands.onListShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        atom.keymaps.dispatchCommandEvent('intentions:show', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        atom.keymaps.dispatchCommandEvent('intentions:show', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        atom.keymaps.dispatchCommandEvent('intentions:show', editorView, (0, _helpers.getKeyboardEvent)('keypress'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
      }));
      (0, _jasmineFix.it)('disposes itself on any commands other than known', _asyncToGenerator(function* () {
        var timesShow = 0;
        var timesHide = 0;
        commands.onListShow(function () {
          timesShow++;
          return Promise.resolve(true);
        });
        commands.onListHide(function () {
          timesHide++;
        });
        atom.keymaps.dispatchCommandEvent('intentions:show', editorView, (0, _helpers.getKeyboardEvent)('keydown'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);

        atom.keymaps.emitter.emit('did-match-binding', { binding: { command: 'core:move-up' } });
        yield (0, _jasmineFix.wait)(10);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);

        atom.keymaps.emitter.emit('did-match-binding', { binding: { command: 'core:move-down' } });
        yield (0, _jasmineFix.wait)(10);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(0);

        atom.keymaps.emitter.emit('did-match-binding', { binding: { command: 'core:move-confirm' } });
        yield (0, _jasmineFix.wait)(10);
        document.body.dispatchEvent((0, _helpers.getKeyboardEvent)('keyup'));
        yield (0, _jasmineFix.wait)(10);
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);

        commands.processListHide();
        expect(timesShow).toBe(1);
        expect(timesHide).toBe(1);
      }));
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvc3BlYy9jb21tYW5kcy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7MEJBRWdELGNBQWM7OzBCQUN6QixhQUFhOzsyQkFDN0IsaUJBQWlCOzs7O3VCQUNMLFdBQVc7O0FBRTVDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsWUFBVztBQUM5QixNQUFJLFFBQVEsWUFBQSxDQUFBO0FBQ1osTUFBSSxVQUFVLFlBQUEsQ0FBQTs7QUFFZCxnREFBVyxhQUFpQjtBQUMxQixZQUFRLEdBQUcsOEJBQWMsQ0FBQTtBQUN6QixZQUFRLENBQUMsUUFBUSxFQUFFLENBQUE7QUFDbkIsVUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNyQyxjQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUE7R0FDdEUsRUFBQyxDQUFBO0FBQ0YsV0FBUyxDQUFDLFlBQVc7QUFDbkIsUUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0FBQ2xDLFlBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUNuQixDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLFlBQVksRUFBRSxZQUFXO0FBQ2hDLHdCQUFHLHdEQUF3RCxFQUFFLFlBQVc7QUFDdEUsY0FBUSxDQUFDLHFCQUFxQixFQUFFLENBQUE7S0FDakMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsK0NBQStDLG9CQUFFLGFBQWlCO0FBQ25FLFVBQUksU0FBUyxHQUFHLENBQUMsQ0FBQTtBQUNqQixVQUFJLFNBQVMsR0FBRyxDQUFDLENBQUE7QUFDakIsY0FBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVc7QUFDbkMsaUJBQVMsRUFBRSxDQUFBO0FBQ1gsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO09B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QUFDMUYsY0FBTSxzQkFBSyxFQUFFLENBQUMsQ0FBQTtBQUNkLGdCQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQywrQkFBaUIsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN0RCxjQUFNLHNCQUFLLEVBQUUsQ0FBQyxDQUFBO0FBQ2QsY0FBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixjQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUV6QixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDN0YsY0FBTSxzQkFBSyxFQUFFLENBQUMsQ0FBQTtBQUNkLGdCQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQywrQkFBaUIsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN0RCxjQUFNLHNCQUFLLEVBQUUsQ0FBQyxDQUFBO0FBQ2QsY0FBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN6QixjQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBOztBQUV6QixnQkFBUSxDQUFDLGVBQWUsRUFBRSxDQUFBO0FBQzFCLGNBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDekIsY0FBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUMxQixFQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvaW50ZW50aW9ucy9zcGVjL2NvbW1hbmRzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHsgaXQsIGJlZm9yZUVhY2gsIHdhaXQgfSBmcm9tICdqYXNtaW5lLWZpeCdcbmltcG9ydCBDb21tYW5kcyBmcm9tICcuLi9saWIvY29tbWFuZHMnXG5pbXBvcnQgeyBnZXRLZXlib2FyZEV2ZW50IH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5kZXNjcmliZSgnQ29tbWFuZHMnLCBmdW5jdGlvbigpIHtcbiAgbGV0IGNvbW1hbmRzXG4gIGxldCBlZGl0b3JWaWV3XG5cbiAgYmVmb3JlRWFjaChhc3luYyBmdW5jdGlvbigpIHtcbiAgICBjb21tYW5kcyA9IG5ldyBDb21tYW5kcygpXG4gICAgY29tbWFuZHMuYWN0aXZhdGUoKVxuICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4oX19maWxlbmFtZSlcbiAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKSlcbiAgfSlcbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICBjb21tYW5kcy5kaXNwb3NlKClcbiAgfSlcblxuICBkZXNjcmliZSgnSGlnaGxpZ2h0cycsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdkb2VzIG5vdGhpbmcgaWYgbm90IGFjdGl2YXRlZCBhbmQgd2UgdHJ5IHRvIGRlYWN0aXZhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NIaWdobGlnaHRzSGlkZSgpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgYWN0aXZhdGUgdW5sZXNzIHByb3ZpZGVyIHRlbGxzIGl0IHRvJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNTaG93ID0gMFxuICAgICAgbGV0IHRpbWVzSGlkZSA9IDBcbiAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c1Nob3coZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzU2hvdysrXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpXG4gICAgICB9KVxuICAgICAgY29tbWFuZHMub25IaWdobGlnaHRzSGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNIaWRlKytcbiAgICAgIH0pXG4gICAgICBhd2FpdCBjb21tYW5kcy5wcm9jZXNzSGlnaGxpZ2h0c1Nob3coKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcblxuICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgwKVxuICAgIH0pXG4gICAgaXQoJ2FjdGl2YXRlcyB3aGVuIHRoZSBwcm92aWRlciB0ZWxscyBpdCB0bycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzU2hvdyA9IDBcbiAgICAgIGxldCB0aW1lc0hpZGUgPSAwXG4gICAgICBjb21tYW5kcy5vbkhpZ2hsaWdodHNTaG93KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1Nob3crK1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICB9KVxuICAgICAgY29tbWFuZHMub25IaWdobGlnaHRzSGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNIaWRlKytcbiAgICAgIH0pXG4gICAgICBhd2FpdCBjb21tYW5kcy5wcm9jZXNzSGlnaGxpZ2h0c1Nob3coKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcblxuICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ3Rocm93cyBpZiBhbHJlYWR5IGhpZ2hsaWdodGVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNTaG93ID0gMFxuICAgICAgbGV0IHRpbWVzSGlkZSA9IDBcbiAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c1Nob3coZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzU2hvdysrXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSlcbiAgICAgIH0pXG4gICAgICBjb21tYW5kcy5vbkhpZ2hsaWdodHNIaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0hpZGUrK1xuICAgICAgfSlcbiAgICAgIGF3YWl0IGNvbW1hbmRzLnByb2Nlc3NIaWdobGlnaHRzU2hvdygpXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjb21tYW5kcy5wcm9jZXNzSGlnaGxpZ2h0c1Nob3coKVxuICAgICAgICBleHBlY3QoZmFsc2UpLnRvQmUodHJ1ZSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGV4cGVjdChlcnJvci5tZXNzYWdlKS50b0JlKCdBbHJlYWR5IGFjdGl2ZScpXG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBjb21tYW5kcy5wcm9jZXNzSGlnaGxpZ2h0c1Nob3coKVxuICAgICAgICBleHBlY3QoZmFsc2UpLnRvQmUodHJ1ZSlcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGV4cGVjdChlcnJvci5tZXNzYWdlKS50b0JlKCdBbHJlYWR5IGFjdGl2ZScpXG4gICAgICB9XG4gICAgICBjb21tYW5kcy5wcm9jZXNzSGlnaGxpZ2h0c0hpZGUoKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NIaWdobGlnaHRzSGlkZSgpXG5cbiAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdkaXNwb3NlcyBsaXN0IGlmIGF2YWlsYWJsZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGRpc3Bvc2VkID0gZmFsc2VcbiAgICAgIGNvbnN0IGFjdGl2ZSA9IHsgdHlwZTogJ2xpc3QnLCBzdWJzY3JpcHRpb25zOiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpIH1cbiAgICAgIGFjdGl2ZS5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgZGlzcG9zZWQgPSB0cnVlXG4gICAgICB9KSlcbiAgICAgIGNvbW1hbmRzLmFjdGl2ZSA9IGFjdGl2ZVxuICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKGZhbHNlKVxuICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0hpZ2hsaWdodHNTaG93KClcbiAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSh0cnVlKVxuICAgIH0pXG4gICAgaXQoJ2FkZHMgYW5kIHJlbW92ZXMgY2xhc3NlcyBhcHByb3ByaWF0ZWx5JywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBjb21tYW5kcy5vbkhpZ2hsaWdodHNTaG93KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcuY2xhc3NMaXN0LmNvbnRhaW5zKCdpbnRlbnRpb25zLWhpZ2hsaWdodHMnKSkudG9CZShmYWxzZSlcbiAgICAgIGF3YWl0IGNvbW1hbmRzLnByb2Nlc3NIaWdobGlnaHRzU2hvdygpXG4gICAgICBleHBlY3QoZWRpdG9yVmlldy5jbGFzc0xpc3QuY29udGFpbnMoJ2ludGVudGlvbnMtaGlnaGxpZ2h0cycpKS50b0JlKHRydWUpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzSGlnaGxpZ2h0c0hpZGUoKVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcuY2xhc3NMaXN0LmNvbnRhaW5zKCdpbnRlbnRpb25zLWhpZ2hsaWdodHMnKSkudG9CZShmYWxzZSlcbiAgICB9KVxuICAgIGRlc2NyaWJlKCdjb21tYW5kIGxpc3RlbmVyJywgZnVuY3Rpb24oKSB7XG4gICAgICBpdCgnanVzdCBhY3RpdmF0ZXMgaWYgdGhlcmVzIG5vIGtleWJvYXJkIGV2ZW50IGF0dGFjaGVkJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICAgIGxldCB0aW1lc0hpZGUgPSAwXG4gICAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c1Nob3coZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c0hpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNIaWRlKytcbiAgICAgICAgfSlcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgwKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2ludGVudGlvbnM6aGlnaGxpZ2h0JylcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChnZXRLZXlib2FyZEV2ZW50KCdrZXl1cCcpKVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMClcbiAgICAgICAgY29tbWFuZHMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDEpXG4gICAgICB9KVxuICAgICAgaXQoJ2lnbm9yZXMgbW9yZSB0aGFuIG9uZSBhY3RpdmF0aW9uIHJlcXVlc3RzJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c1Nob3coZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGF0b20ua2V5bWFwcy5kaXNwYXRjaENvbW1hbmRFdmVudCgnaW50ZW50aW9uczpoaWdobGlnaHQnLCBlZGl0b3JWaWV3LCBnZXRLZXlib2FyZEV2ZW50KCdrZXlwcmVzcycpKVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBhdG9tLmtleW1hcHMuZGlzcGF0Y2hDb21tYW5kRXZlbnQoJ2ludGVudGlvbnM6aGlnaGxpZ2h0JywgZWRpdG9yVmlldywgZ2V0S2V5Ym9hcmRFdmVudCgna2V5cHJlc3MnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgYXRvbS5rZXltYXBzLmRpc3BhdGNoQ29tbWFuZEV2ZW50KCdpbnRlbnRpb25zOmhpZ2hsaWdodCcsIGVkaXRvclZpZXcsIGdldEtleWJvYXJkRXZlbnQoJ2tleXByZXNzJykpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgIH0pXG4gICAgICBpdCgnanVzdCBhY3RpdmF0ZXMgaWYga2V5Ym9hcmQgZXZlbnQgaXMgbm90IGtleWRvd24nLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRpbWVzU2hvdyA9IDBcbiAgICAgICAgbGV0IHRpbWVzSGlkZSA9IDBcbiAgICAgICAgY29tbWFuZHMub25IaWdobGlnaHRzU2hvdyhmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aW1lc1Nob3crK1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSlcbiAgICAgICAgfSlcbiAgICAgICAgY29tbWFuZHMub25IaWdobGlnaHRzSGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aW1lc0hpZGUrK1xuICAgICAgICB9KVxuICAgICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDApXG4gICAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMClcbiAgICAgICAgYXRvbS5rZXltYXBzLmRpc3BhdGNoQ29tbWFuZEV2ZW50KCdpbnRlbnRpb25zOmhpZ2hsaWdodCcsIGVkaXRvclZpZXcsIGdldEtleWJvYXJkRXZlbnQoJ2tleXByZXNzJykpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgwKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoZ2V0S2V5Ym9hcmRFdmVudCgna2V5dXAnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGNvbW1hbmRzLnByb2Nlc3NIaWdobGlnaHRzSGlkZSgpXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgICAgfSlcbiAgICAgIGl0KCdkb2VzIG5vdCBkZWFjdGl2YXRlIGlmIGtleXVwIGlzIG5vdCBzYW1lIGtleWNvZGUnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IHRpbWVzU2hvdyA9IDBcbiAgICAgICAgbGV0IHRpbWVzSGlkZSA9IDBcbiAgICAgICAgY29tbWFuZHMub25IaWdobGlnaHRzU2hvdyhmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aW1lc1Nob3crK1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSlcbiAgICAgICAgfSlcbiAgICAgICAgY29tbWFuZHMub25IaWdobGlnaHRzSGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aW1lc0hpZGUrK1xuICAgICAgICB9KVxuICAgICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDApXG4gICAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMClcbiAgICAgICAgYXRvbS5rZXltYXBzLmRpc3BhdGNoQ29tbWFuZEV2ZW50KCdpbnRlbnRpb25zOmhpZ2hsaWdodCcsIGVkaXRvclZpZXcsIGdldEtleWJvYXJkRXZlbnQoJ2tleWRvd24nKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChnZXRLZXlib2FyZEV2ZW50KCdrZXl1cCcsIDEpKVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMClcbiAgICAgICAgY29tbWFuZHMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDEpXG4gICAgICB9KVxuICAgICAgaXQoJ2RvZXMgZGVhY3RpdmF0ZSBpZiBrZXl1cCBpcyB0aGUgc2FtZSBrZXljb2RlJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICAgIGxldCB0aW1lc0hpZGUgPSAwXG4gICAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c1Nob3coZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbW1hbmRzLm9uSGlnaGxpZ2h0c0hpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNIaWRlKytcbiAgICAgICAgfSlcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgwKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGF0b20ua2V5bWFwcy5kaXNwYXRjaENvbW1hbmRFdmVudCgnaW50ZW50aW9uczpoaWdobGlnaHQnLCBlZGl0b3JWaWV3LCBnZXRLZXlib2FyZEV2ZW50KCdrZXlkb3duJykpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgwKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoZ2V0S2V5Ym9hcmRFdmVudCgna2V5dXAnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDEpXG4gICAgICAgIGNvbW1hbmRzLnByb2Nlc3NIaWdobGlnaHRzSGlkZSgpXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnTGlzdHMnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnZG9lcyBub3RoaW5nIGlmIGRlYWN0aXZhdGVkIGFuZCB3ZSB0cnkgdG8gYWN0aXZhdGUgaXQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgcGFzcyBvbiBtb3ZlIGV2ZW50cyBpZiBub3QgYWN0aXZhdGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IGphc21pbmUuY3JlYXRlU3B5KCdjb21tYW5kczpsaXN0LW1vdmUnKVxuICAgICAgY29tbWFuZHMub25MaXN0TW92ZShjYWxsYmFjaylcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0TW92ZSgndXAnKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RNb3ZlKCdkb3duJylcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0TW92ZSgnZG93bicpXG4gICAgICBleHBlY3QoY2FsbGJhY2spLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICB9KVxuICAgIGl0KCdwYXNzZXMgb24gbW92ZSBldmVudHMgaWYgYWN0aXZhdGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IGphc21pbmUuY3JlYXRlU3B5KCdjb21tYW5kczpsaXN0LW1vdmUnKVxuICAgICAgY29tbWFuZHMub25MaXN0TW92ZShjYWxsYmFjaylcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0TW92ZSgnZG93bicpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdE1vdmUoJ2Rvd24nKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RNb3ZlKCdkb3duJylcbiAgICAgIGNvbW1hbmRzLmFjdGl2ZSA9IHsgdHlwZTogJ2xpc3QnLCBzdWJzY3JpcHRpb25zOiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpIH1cbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0TW92ZSgnZG93bicpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdE1vdmUoJ2Rvd24nKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RNb3ZlKCdkb3duJylcbiAgICAgIGV4cGVjdChjYWxsYmFjaykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICBleHBlY3QoY2FsbGJhY2suY2FsbHMubGVuZ3RoKS50b0JlKDMpXG4gICAgfSlcbiAgICBpdCgnaWdub3JlcyBjb25maXJtIGlmIG5vdCBhY3RpdmF0ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrID0gamFzbWluZS5jcmVhdGVTcHkoJ2NvbW1hbmRzOmxpc3QtY29uZmlybScpXG4gICAgICBjb21tYW5kcy5vbkxpc3RDb25maXJtKGNhbGxiYWNrKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RDb25maXJtKClcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0Q29uZmlybSgpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdENvbmZpcm0oKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RDb25maXJtKClcbiAgICAgIGV4cGVjdChjYWxsYmFjaykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgIH0pXG4gICAgaXQoJ3Bhc3NlcyBvbiBjb25maXJtIGlmIGFjdGl2YXRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSBqYXNtaW5lLmNyZWF0ZVNweSgnY29tbWFuZHM6bGlzdC1jb25maXJtJylcbiAgICAgIGNvbW1hbmRzLm9uTGlzdENvbmZpcm0oY2FsbGJhY2spXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdENvbmZpcm0oKVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RDb25maXJtKClcbiAgICAgIGNvbW1hbmRzLmFjdGl2ZSA9IHsgdHlwZTogJ2xpc3QnLCBzdWJzY3JpcHRpb25zOiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpIH1cbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0Q29uZmlybSgpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdENvbmZpcm0oKVxuICAgICAgZXhwZWN0KGNhbGxiYWNrKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIGV4cGVjdChjYWxsYmFjay5jYWxscy5sZW5ndGgpLnRvQmUoMilcbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCBhY3RpdmF0ZSBpZiBsaXN0ZW5lcnMgZG9udCBzYXkgdGhhdCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzU2hvdyA9IDBcbiAgICAgIGxldCB0aW1lc0hpZGUgPSAwXG4gICAgICBjb21tYW5kcy5vbkxpc3RTaG93KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1Nob3crK1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuICAgICAgfSlcbiAgICAgIGNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzSGlkZSsrXG4gICAgICB9KVxuICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0xpc3RTaG93KClcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgfSlcbiAgICBpdCgnYWN0aXZhdGVzIHdoZW4gbGlzdGVuZXJzIGFsbG93JywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNTaG93ID0gMFxuICAgICAgbGV0IHRpbWVzSGlkZSA9IDBcbiAgICAgIGNvbW1hbmRzLm9uTGlzdFNob3coZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzU2hvdysrXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSlcbiAgICAgIH0pXG4gICAgICBjb21tYW5kcy5vbkxpc3RIaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc0hpZGUrK1xuICAgICAgfSlcbiAgICAgIGF3YWl0IGNvbW1hbmRzLnByb2Nlc3NMaXN0U2hvdygpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2lnbm9yZXMgaWYgbGlzdCBpcyBhbHJlYWR5IGFjdGl2ZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRpbWVzU2hvdyA9IDBcbiAgICAgIGxldCB0aW1lc0hpZGUgPSAwXG4gICAgICBjb21tYW5kcy5vbkxpc3RTaG93KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1Nob3crK1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICB9KVxuICAgICAgY29tbWFuZHMub25MaXN0SGlkZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNIaWRlKytcbiAgICAgIH0pXG4gICAgICBhd2FpdCBjb21tYW5kcy5wcm9jZXNzTGlzdFNob3coKVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0xpc3RTaG93KClcbiAgICAgICAgZXhwZWN0KGZhbHNlKS50b0JlKHRydWUpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBleHBlY3QoZXJyb3IubWVzc2FnZSkudG9CZSgnQWxyZWFkeSBhY3RpdmUnKVxuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0xpc3RTaG93KClcbiAgICAgICAgZXhwZWN0KGZhbHNlKS50b0JlKHRydWUpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBleHBlY3QoZXJyb3IubWVzc2FnZSkudG9CZSgnQWxyZWFkeSBhY3RpdmUnKVxuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0xpc3RTaG93KClcbiAgICAgICAgZXhwZWN0KGZhbHNlKS50b0JlKHRydWUpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBleHBlY3QoZXJyb3IubWVzc2FnZSkudG9CZSgnQWxyZWFkeSBhY3RpdmUnKVxuICAgICAgfVxuICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RIaWRlKClcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgIH0pXG4gICAgaXQoJ2Rpc3Bvc2VzIGlmIGhpZ2hsaWdodHMgYXJlIGFjdGl2ZScsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGRpc3Bvc2VkID0gZmFsc2VcbiAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICBsZXQgdGltZXNIaWRlID0gMFxuICAgICAgY29tbWFuZHMub25MaXN0U2hvdyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICAgICAgfSlcbiAgICAgIGNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzSGlkZSsrXG4gICAgICB9KVxuICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0xpc3RTaG93KClcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDEpXG4gICAgICBjb21tYW5kcy5hY3RpdmUgPSB7IHR5cGU6ICdoaWdobGlnaHQnLCBzdWJzY3JpcHRpb25zOiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpIH1cbiAgICAgIGNvbW1hbmRzLmFjdGl2ZS5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgZGlzcG9zZWQgPSB0cnVlXG4gICAgICB9KSlcbiAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZShmYWxzZSlcbiAgICAgIGF3YWl0IGNvbW1hbmRzLnByb2Nlc3NMaXN0U2hvdygpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDIpXG4gICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDIpXG4gICAgfSlcbiAgICBpdCgnYWRkcyBhbmQgcmVtb3ZlcyBjbGFzc2VzIGFwcHJvcHJpYXRlbHknLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICBsZXQgdGltZXNIaWRlID0gMFxuICAgICAgY29tbWFuZHMub25MaXN0U2hvdyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICAgICAgfSlcbiAgICAgIGNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzSGlkZSsrXG4gICAgICB9KVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcuY2xhc3NMaXN0LmNvbnRhaW5zKCdpbnRlbnRpb25zLWxpc3QnKSkudG9CZShmYWxzZSlcbiAgICAgIGF3YWl0IGNvbW1hbmRzLnByb2Nlc3NMaXN0U2hvdygpXG4gICAgICBleHBlY3QoZWRpdG9yVmlldy5jbGFzc0xpc3QuY29udGFpbnMoJ2ludGVudGlvbnMtbGlzdCcpKS50b0JlKHRydWUpXG4gICAgICBjb21tYW5kcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgZXhwZWN0KGVkaXRvclZpZXcuY2xhc3NMaXN0LmNvbnRhaW5zKCdpbnRlbnRpb25zLWxpc3QnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMSlcbiAgICB9KVxuICAgIGl0KCdkaXNwb3NlcyBsaXN0IG9uIG1vdXNldXAnLCBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICBsZXQgdGltZXNIaWRlID0gMFxuICAgICAgY29tbWFuZHMub25MaXN0U2hvdyhmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICAgICAgfSlcbiAgICAgIGNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWVzSGlkZSsrXG4gICAgICB9KVxuICAgICAgYXdhaXQgY29tbWFuZHMucHJvY2Vzc0xpc3RTaG93KClcbiAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDEpXG4gICAgICBhd2FpdCBjb21tYW5kcy5wcm9jZXNzTGlzdFNob3coKVxuICAgICAgZG9jdW1lbnQuYm9keS5kaXNwYXRjaEV2ZW50KG5ldyBNb3VzZUV2ZW50KCdtb3VzZXVwJykpXG4gICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgyKVxuICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgyKVxuICAgIH0pXG4gICAgZGVzY3JpYmUoJ2NvbW1hbmQgbGlzdGVuZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIGl0KCdqdXN0IGVuYWJsZXMgd2hlbiBubyBrZXlib2FyZCBldmVudCcsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGltZXNTaG93ID0gMFxuICAgICAgICBsZXQgdGltZXNIaWRlID0gMFxuICAgICAgICBjb21tYW5kcy5vbkxpc3RTaG93KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRpbWVzU2hvdysrXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICAgICAgICB9KVxuICAgICAgICBjb21tYW5kcy5vbkxpc3RIaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRpbWVzSGlkZSsrXG4gICAgICAgIH0pXG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2ludGVudGlvbnM6c2hvdycpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgwKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoZ2V0S2V5Ym9hcmRFdmVudCgna2V5dXAnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgICAgfSlcbiAgICAgIGl0KCdqdXN0IGVuYWJsZXMgd2hlbiBrZXlib2FyZCBldmVudCBpcyBub3Qga2V5ZG93bicsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgdGltZXNTaG93ID0gMFxuICAgICAgICBsZXQgdGltZXNIaWRlID0gMFxuICAgICAgICBjb21tYW5kcy5vbkxpc3RTaG93KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRpbWVzU2hvdysrXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKVxuICAgICAgICB9KVxuICAgICAgICBjb21tYW5kcy5vbkxpc3RIaWRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRpbWVzSGlkZSsrXG4gICAgICAgIH0pXG4gICAgICAgIGF0b20ua2V5bWFwcy5kaXNwYXRjaENvbW1hbmRFdmVudCgnaW50ZW50aW9uczpzaG93JywgZWRpdG9yVmlldywgZ2V0S2V5Ym9hcmRFdmVudCgna2V5cHJlc3MnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChnZXRLZXlib2FyZEV2ZW50KCdrZXl1cCcpKVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMClcbiAgICAgICAgY29tbWFuZHMucHJvY2Vzc0xpc3RIaWRlKClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDEpXG4gICAgICB9KVxuICAgICAgaXQoJ2lnbm9yZXMgbW9yZSB0aGFuIG9uZSBhY3RpdmF0aW9uIHJlcXVlc3RzJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICAgIGNvbW1hbmRzLm9uTGlzdFNob3coZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGF0b20ua2V5bWFwcy5kaXNwYXRjaENvbW1hbmRFdmVudCgnaW50ZW50aW9uczpzaG93JywgZWRpdG9yVmlldywgZ2V0S2V5Ym9hcmRFdmVudCgna2V5cHJlc3MnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgYXRvbS5rZXltYXBzLmRpc3BhdGNoQ29tbWFuZEV2ZW50KCdpbnRlbnRpb25zOnNob3cnLCBlZGl0b3JWaWV3LCBnZXRLZXlib2FyZEV2ZW50KCdrZXlwcmVzcycpKVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBhdG9tLmtleW1hcHMuZGlzcGF0Y2hDb21tYW5kRXZlbnQoJ2ludGVudGlvbnM6c2hvdycsIGVkaXRvclZpZXcsIGdldEtleWJvYXJkRXZlbnQoJ2tleXByZXNzJykpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgIH0pXG4gICAgICBpdCgnZGlzcG9zZXMgaXRzZWxmIG9uIGFueSBjb21tYW5kcyBvdGhlciB0aGFuIGtub3duJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCB0aW1lc1Nob3cgPSAwXG4gICAgICAgIGxldCB0aW1lc0hpZGUgPSAwXG4gICAgICAgIGNvbW1hbmRzLm9uTGlzdFNob3coZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNTaG93KytcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIGNvbW1hbmRzLm9uTGlzdEhpZGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdGltZXNIaWRlKytcbiAgICAgICAgfSlcbiAgICAgICAgYXRvbS5rZXltYXBzLmRpc3BhdGNoQ29tbWFuZEV2ZW50KCdpbnRlbnRpb25zOnNob3cnLCBlZGl0b3JWaWV3LCBnZXRLZXlib2FyZEV2ZW50KCdrZXlkb3duJykpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgwKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoZ2V0S2V5Ym9hcmRFdmVudCgna2V5dXAnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG5cbiAgICAgICAgYXRvbS5rZXltYXBzLmVtaXR0ZXIuZW1pdCgnZGlkLW1hdGNoLWJpbmRpbmcnLCB7IGJpbmRpbmc6IHsgY29tbWFuZDogJ2NvcmU6bW92ZS11cCcgfSB9KVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQoZ2V0S2V5Ym9hcmRFdmVudCgna2V5dXAnKSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZXhwZWN0KHRpbWVzU2hvdykudG9CZSgxKVxuICAgICAgICBleHBlY3QodGltZXNIaWRlKS50b0JlKDApXG5cbiAgICAgICAgYXRvbS5rZXltYXBzLmVtaXR0ZXIuZW1pdCgnZGlkLW1hdGNoLWJpbmRpbmcnLCB7IGJpbmRpbmc6IHsgY29tbWFuZDogJ2NvcmU6bW92ZS1kb3duJyB9IH0pXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChnZXRLZXlib2FyZEV2ZW50KCdrZXl1cCcpKVxuICAgICAgICBhd2FpdCB3YWl0KDEwKVxuICAgICAgICBleHBlY3QodGltZXNTaG93KS50b0JlKDEpXG4gICAgICAgIGV4cGVjdCh0aW1lc0hpZGUpLnRvQmUoMClcblxuICAgICAgICBhdG9tLmtleW1hcHMuZW1pdHRlci5lbWl0KCdkaWQtbWF0Y2gtYmluZGluZycsIHsgYmluZGluZzogeyBjb21tYW5kOiAnY29yZTptb3ZlLWNvbmZpcm0nIH0gfSlcbiAgICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgICAgZG9jdW1lbnQuYm9keS5kaXNwYXRjaEV2ZW50KGdldEtleWJvYXJkRXZlbnQoJ2tleXVwJykpXG4gICAgICAgIGF3YWl0IHdhaXQoMTApXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuXG4gICAgICAgIGNvbW1hbmRzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICAgIGV4cGVjdCh0aW1lc1Nob3cpLnRvQmUoMSlcbiAgICAgICAgZXhwZWN0KHRpbWVzSGlkZSkudG9CZSgxKVxuICAgICAgfSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==