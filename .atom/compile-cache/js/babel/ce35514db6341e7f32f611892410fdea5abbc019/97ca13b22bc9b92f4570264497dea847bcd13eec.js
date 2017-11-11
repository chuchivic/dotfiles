function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _jasmineFix = require('jasmine-fix');

var _libEditorLinter = require('../lib/editor-linter');

var _libEditorLinter2 = _interopRequireDefault(_libEditorLinter);

'use babel';

describe('EditorLinter', function () {
  var textEditor = undefined;

  (0, _jasmineFix.beforeEach)(_asyncToGenerator(function* () {
    yield atom.workspace.open(__dirname + '/fixtures/file.txt');
    textEditor = atom.workspace.getActiveTextEditor();
  }));
  afterEach(function () {
    atom.workspace.destroyActivePaneItem();
  });

  (0, _jasmineFix.it)('cries when constructor argument is not a text editor', function () {
    expect(function () {
      return new _libEditorLinter2['default']();
    }).toThrow('EditorLinter expects a valid TextEditor');
    expect(function () {
      return new _libEditorLinter2['default'](1);
    }).toThrow('EditorLinter expects a valid TextEditor');
    expect(function () {
      return new _libEditorLinter2['default']({});
    }).toThrow('EditorLinter expects a valid TextEditor');
    expect(function () {
      return new _libEditorLinter2['default']('');
    }).toThrow('EditorLinter expects a valid TextEditor');
  });

  describe('onDidDestroy', function () {
    (0, _jasmineFix.it)('is called when text editor is destroyed', function () {
      var triggered = false;
      var editor = new _libEditorLinter2['default'](textEditor);
      editor.onDidDestroy(function () {
        triggered = true;
      });
      expect(triggered).toBe(false);
      textEditor.destroy();
      expect(triggered).toBe(true);
    });
  });

  describe('onShouldLint', function () {
    (0, _jasmineFix.it)('is triggered on save', _asyncToGenerator(function* () {
      var timesTriggered = 0;
      var editor = new _libEditorLinter2['default'](textEditor);
      editor.onShouldLint(function () {
        timesTriggered++;
      });
      textEditor.save();
      textEditor.save();
      textEditor.save();
      textEditor.save();
      expect(timesTriggered).toBe(0);
      yield (0, _jasmineFix.wait)(10);
      expect(timesTriggered).toBe(1);
      textEditor.save();
      textEditor.save();
      textEditor.save();
      textEditor.save();
      expect(timesTriggered).toBe(1);
      yield (0, _jasmineFix.wait)(10);
      expect(timesTriggered).toBe(2);
    }));
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2VkaXRvci1saW50ZXItc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OzBCQUVxQyxhQUFhOzsrQkFDekIsc0JBQXNCOzs7O0FBSC9DLFdBQVcsQ0FBQTs7QUFLWCxRQUFRLENBQUMsY0FBYyxFQUFFLFlBQVc7QUFDbEMsTUFBSSxVQUFVLFlBQUEsQ0FBQTs7QUFFZCxnREFBVyxhQUFpQjtBQUMxQixVQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFJLFNBQVMsd0JBQXFCLENBQUE7QUFDM0QsY0FBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQTtHQUNsRCxFQUFDLENBQUE7QUFDRixXQUFTLENBQUMsWUFBVztBQUNuQixRQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLENBQUE7R0FDdkMsQ0FBQyxDQUFBOztBQUVGLHNCQUFHLHNEQUFzRCxFQUFFLFlBQVc7QUFDcEUsVUFBTSxDQUFDLFlBQVc7QUFDaEIsYUFBTyxrQ0FBa0IsQ0FBQTtLQUMxQixDQUFDLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUE7QUFDckQsVUFBTSxDQUFDLFlBQVc7QUFDaEIsYUFBTyxpQ0FBaUIsQ0FBQyxDQUFDLENBQUE7S0FDM0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0FBQ3JELFVBQU0sQ0FBQyxZQUFXO0FBQ2hCLGFBQU8saUNBQWlCLEVBQUUsQ0FBQyxDQUFBO0tBQzVCLENBQUMsQ0FBQyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQTtBQUNyRCxVQUFNLENBQUMsWUFBVztBQUNoQixhQUFPLGlDQUFpQixFQUFFLENBQUMsQ0FBQTtLQUM1QixDQUFDLENBQUMsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUE7R0FDdEQsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxjQUFjLEVBQUUsWUFBVztBQUNsQyx3QkFBRyx5Q0FBeUMsRUFBRSxZQUFXO0FBQ3ZELFVBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNyQixVQUFNLE1BQU0sR0FBRyxpQ0FBaUIsVUFBVSxDQUFDLENBQUE7QUFDM0MsWUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFXO0FBQzdCLGlCQUFTLEdBQUcsSUFBSSxDQUFBO09BQ2pCLENBQUMsQ0FBQTtBQUNGLFlBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDN0IsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNwQixZQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdCLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsY0FBYyxFQUFFLFlBQVc7QUFDbEMsd0JBQUcsc0JBQXNCLG9CQUFFLGFBQWlCO0FBQzFDLFVBQUksY0FBYyxHQUFHLENBQUMsQ0FBQTtBQUN0QixVQUFNLE1BQU0sR0FBRyxpQ0FBaUIsVUFBVSxDQUFDLENBQUE7QUFDM0MsWUFBTSxDQUFDLFlBQVksQ0FBQyxZQUFXO0FBQzdCLHNCQUFjLEVBQUUsQ0FBQTtPQUNqQixDQUFDLENBQUE7QUFDRixnQkFBVSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2pCLGdCQUFVLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDakIsZ0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQixnQkFBVSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2pCLFlBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDOUIsWUFBTSxzQkFBSyxFQUFFLENBQUMsQ0FBQTtBQUNkLFlBQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDOUIsZ0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQixnQkFBVSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2pCLGdCQUFVLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDakIsZ0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNqQixZQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzlCLFlBQU0sc0JBQUssRUFBRSxDQUFDLENBQUE7QUFDZCxZQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQy9CLEVBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9lZGl0b3ItbGludGVyLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBpdCwgd2FpdCwgYmVmb3JlRWFjaCB9IGZyb20gJ2phc21pbmUtZml4J1xuaW1wb3J0IEVkaXRvckxpbnRlciBmcm9tICcuLi9saWIvZWRpdG9yLWxpbnRlcidcblxuZGVzY3JpYmUoJ0VkaXRvckxpbnRlcicsIGZ1bmN0aW9uKCkge1xuICBsZXQgdGV4dEVkaXRvclxuXG4gIGJlZm9yZUVhY2goYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihgJHtfX2Rpcm5hbWV9L2ZpeHR1cmVzL2ZpbGUudHh0YClcbiAgICB0ZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gIH0pXG4gIGFmdGVyRWFjaChmdW5jdGlvbigpIHtcbiAgICBhdG9tLndvcmtzcGFjZS5kZXN0cm95QWN0aXZlUGFuZUl0ZW0oKVxuICB9KVxuXG4gIGl0KCdjcmllcyB3aGVuIGNvbnN0cnVjdG9yIGFyZ3VtZW50IGlzIG5vdCBhIHRleHQgZWRpdG9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXhwZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFZGl0b3JMaW50ZXIoKVxuICAgIH0pLnRvVGhyb3coJ0VkaXRvckxpbnRlciBleHBlY3RzIGEgdmFsaWQgVGV4dEVkaXRvcicpXG4gICAgZXhwZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFZGl0b3JMaW50ZXIoMSlcbiAgICB9KS50b1Rocm93KCdFZGl0b3JMaW50ZXIgZXhwZWN0cyBhIHZhbGlkIFRleHRFZGl0b3InKVxuICAgIGV4cGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRWRpdG9yTGludGVyKHt9KVxuICAgIH0pLnRvVGhyb3coJ0VkaXRvckxpbnRlciBleHBlY3RzIGEgdmFsaWQgVGV4dEVkaXRvcicpXG4gICAgZXhwZWN0KGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFZGl0b3JMaW50ZXIoJycpXG4gICAgfSkudG9UaHJvdygnRWRpdG9yTGludGVyIGV4cGVjdHMgYSB2YWxpZCBUZXh0RWRpdG9yJylcbiAgfSlcblxuICBkZXNjcmliZSgnb25EaWREZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2lzIGNhbGxlZCB3aGVuIHRleHQgZWRpdG9yIGlzIGRlc3Ryb3llZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHRyaWdnZXJlZCA9IGZhbHNlXG4gICAgICBjb25zdCBlZGl0b3IgPSBuZXcgRWRpdG9yTGludGVyKHRleHRFZGl0b3IpXG4gICAgICBlZGl0b3Iub25EaWREZXN0cm95KGZ1bmN0aW9uKCkge1xuICAgICAgICB0cmlnZ2VyZWQgPSB0cnVlXG4gICAgICB9KVxuICAgICAgZXhwZWN0KHRyaWdnZXJlZCkudG9CZShmYWxzZSlcbiAgICAgIHRleHRFZGl0b3IuZGVzdHJveSgpXG4gICAgICBleHBlY3QodHJpZ2dlcmVkKS50b0JlKHRydWUpXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnb25TaG91bGRMaW50JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2lzIHRyaWdnZXJlZCBvbiBzYXZlJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgdGltZXNUcmlnZ2VyZWQgPSAwXG4gICAgICBjb25zdCBlZGl0b3IgPSBuZXcgRWRpdG9yTGludGVyKHRleHRFZGl0b3IpXG4gICAgICBlZGl0b3Iub25TaG91bGRMaW50KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lc1RyaWdnZXJlZCsrXG4gICAgICB9KVxuICAgICAgdGV4dEVkaXRvci5zYXZlKClcbiAgICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4gICAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgICAgdGV4dEVkaXRvci5zYXZlKClcbiAgICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgwKVxuICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgxKVxuICAgICAgdGV4dEVkaXRvci5zYXZlKClcbiAgICAgIHRleHRFZGl0b3Iuc2F2ZSgpXG4gICAgICB0ZXh0RWRpdG9yLnNhdmUoKVxuICAgICAgdGV4dEVkaXRvci5zYXZlKClcbiAgICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgxKVxuICAgICAgYXdhaXQgd2FpdCgxMClcbiAgICAgIGV4cGVjdCh0aW1lc1RyaWdnZXJlZCkudG9CZSgyKVxuICAgIH0pXG4gIH0pXG59KVxuIl19