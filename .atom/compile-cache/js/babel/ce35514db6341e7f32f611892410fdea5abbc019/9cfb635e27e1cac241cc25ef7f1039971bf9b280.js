var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/** @babel */

var _specHelpers = require('../spec-helpers');

var _specHelpers2 = _interopRequireDefault(_specHelpers);

describe('Python Goto Definition', function () {
  var _Array$from = Array.from([]);

  var _Array$from2 = _slicedToArray(_Array$from, 2);

  var editor = _Array$from2[0];
  var mainModule = _Array$from2[1];

  beforeEach(function () {
    waitsForPromise(function () {
      return _specHelpers2['default'].openFile('test.py');
    });
    runs(function () {
      var _helpers$getPackage = _specHelpers2['default'].getPackage();

      editor = _helpers$getPackage.editor;
      mainModule = _helpers$getPackage.mainModule;

      _specHelpers2['default'].nomalMode();
    });
  });

  it('no definition', function () {
    editor.setText('hello_world');
    editor.setCursorBufferPosition([0, 1]);

    expect(_specHelpers2['default'].getSelectedWord()).toEqual('hello_world');
    expect(_specHelpers2['default'].getFileTypes()).toContain('*.py');
    expect(_specHelpers2['default'].sendComand()).toBe(true);

    waitsForPromise(function () {
      return _specHelpers2['default'].waitsComplete();
    });

    expect(mainModule.definitionsView.items.length).toEqual(0);
  });

  it('find function', function () {
    editor.setText('def hello_world():\n  return True\nhello_world');
    editor.setCursorBufferPosition([3, 1]);

    expect(_specHelpers2['default'].getSelectedWord()).toEqual('hello_world');
    expect(_specHelpers2['default'].getFileTypes()).toContain('*.py');
    expect(_specHelpers2['default'].sendComand()).toBe(true);

    waitsForPromise(function () {
      return _specHelpers2['default'].waitsComplete();
    });

    expect(mainModule.definitionsView.items.length).toEqual(1);
    expect(mainModule.definitionsView.items[0].line).toEqual(0);
    expect(mainModule.definitionsView.items[0].text).toContain('def hello_world():');
  });

  it('find function and class without saved', function () {
    editor.setText('class hello_world(object):\n  def hello_world(self):\n    pass\nhello_world');
    editor.setCursorBufferPosition([4, 1]);

    expect(_specHelpers2['default'].getSelectedWord()).toEqual('hello_world');
    expect(_specHelpers2['default'].getFileTypes()).toContain('*.py');
    expect(_specHelpers2['default'].sendComand()).toBe(true);

    waitsForPromise(function () {
      return _specHelpers2['default'].waitsComplete();
    });

    expect(mainModule.definitionsView.items.length).toEqual(2);
    expect(mainModule.definitionsView.items[0].line).toEqual(0);
    expect(mainModule.definitionsView.items[0].text).toContain('class hello_world(object):');
    expect(mainModule.definitionsView.items[1].line).toEqual(1);
    expect(mainModule.definitionsView.items[1].text).toContain('def hello_world(self):');
  });

  it('find function and class with saved', function () {
    editor.setText('class hello_world(object):\n  def hello_world(self):\n    pass\nhello_world');
    _specHelpers2['default'].editorSave();
    editor.setCursorBufferPosition([4, 1]);

    expect(_specHelpers2['default'].getSelectedWord()).toEqual('hello_world');
    expect(_specHelpers2['default'].getFileTypes()).toContain('*.py');
    expect(_specHelpers2['default'].sendComand()).toBe(true);

    waitsForPromise(function () {
      return _specHelpers2['default'].waitsComplete();
    });
    _specHelpers2['default'].editorDelete();

    expect(mainModule.definitionsView.items.length).toEqual(2);
    expect(mainModule.definitionsView.items[0].line).toEqual(0);
    expect(mainModule.definitionsView.items[0].text).toContain('class hello_world(object):');
    expect(mainModule.definitionsView.items[1].line).toEqual(1);
    expect(mainModule.definitionsView.items[1].text).toContain('def hello_world(self):');
  });

  it('performance mode find function and class with saved', function () {
    _specHelpers2['default'].performanceMode();

    editor.setText('class hello_world(object):\n  def hello_world(self):\n    pass\nhello_world');
    _specHelpers2['default'].editorSave();
    editor.setCursorBufferPosition([4, 1]);

    expect(_specHelpers2['default'].getSelectedWord()).toEqual('hello_world');
    expect(_specHelpers2['default'].getFileTypes()).toContain('*.py');
    expect(_specHelpers2['default'].sendComand()).toBe(true);

    waitsForPromise(function () {
      return _specHelpers2['default'].waitsComplete();
    });
    _specHelpers2['default'].editorDelete();

    expect(mainModule.definitionsView.items.length).toEqual(2);
    expect(mainModule.definitionsView.items[0].line).toEqual(0);
    expect(mainModule.definitionsView.items[0].text).toContain('class hello_world(object):');
    expect(mainModule.definitionsView.items[1].line).toEqual(1);
    expect(mainModule.definitionsView.items[1].text).toContain('def hello_world(self):');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9zcGVjL2ZpeHR1cmVzL3B5dGhvbi1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OzsyQkFFb0IsaUJBQWlCOzs7O0FBRXJDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxZQUFNO29CQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzs7O01BQXBDLE1BQU07TUFBRSxVQUFVOztBQUV2QixZQUFVLENBQUMsWUFBTTtBQUNmLG1CQUFlLENBQUM7YUFBTSx5QkFBUSxRQUFRLENBQUMsU0FBUyxDQUFDO0tBQUEsQ0FBQyxDQUFDO0FBQ25ELFFBQUksQ0FBQyxZQUFNO2dDQUNpQix5QkFBUSxVQUFVLEVBQUU7O0FBQTNDLFlBQU0sdUJBQU4sTUFBTTtBQUFFLGdCQUFVLHVCQUFWLFVBQVU7O0FBQ3JCLCtCQUFRLFNBQVMsRUFBRSxDQUFDO0tBQ3JCLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQzs7QUFFSCxJQUFFLENBQUMsZUFBZSxFQUFFLFlBQU07QUFDeEIsVUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM5QixVQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdkMsVUFBTSxDQUFDLHlCQUFRLGVBQWUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3pELFVBQU0sQ0FBQyx5QkFBUSxZQUFZLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxVQUFNLENBQUMseUJBQVEsVUFBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXhDLG1CQUFlLENBQUM7YUFBTSx5QkFBUSxhQUFhLEVBQUU7S0FBQSxDQUFDLENBQUM7O0FBRS9DLFVBQU0sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtB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b21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9zcGVjL2ZpeHR1cmVzL3B5dGhvbi1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG5pbXBvcnQgaGVscGVycyBmcm9tICcuLi9zcGVjLWhlbHBlcnMnO1xuXG5kZXNjcmliZSgnUHl0aG9uIEdvdG8gRGVmaW5pdGlvbicsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIG1haW5Nb2R1bGVdID0gQXJyYXkuZnJvbShbXSk7XG5cbiAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGhlbHBlcnMub3BlbkZpbGUoJ3Rlc3QucHknKSk7XG4gICAgcnVucygoKSA9PiB7XG4gICAgICAoeyBlZGl0b3IsIG1haW5Nb2R1bGUgfSA9IGhlbHBlcnMuZ2V0UGFja2FnZSgpKTtcbiAgICAgIGhlbHBlcnMubm9tYWxNb2RlKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGl0KCdubyBkZWZpbml0aW9uJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KCdoZWxsb193b3JsZCcpO1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMV0pO1xuXG4gICAgZXhwZWN0KGhlbHBlcnMuZ2V0U2VsZWN0ZWRXb3JkKCkpLnRvRXF1YWwoJ2hlbGxvX3dvcmxkJyk7XG4gICAgZXhwZWN0KGhlbHBlcnMuZ2V0RmlsZVR5cGVzKCkpLnRvQ29udGFpbignKi5weScpO1xuICAgIGV4cGVjdChoZWxwZXJzLnNlbmRDb21hbmQoKSkudG9CZSh0cnVlKTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBoZWxwZXJzLndhaXRzQ29tcGxldGUoKSk7XG5cbiAgICBleHBlY3QobWFpbk1vZHVsZS5kZWZpbml0aW9uc1ZpZXcuaXRlbXMubGVuZ3RoKS50b0VxdWFsKDApO1xuICB9KTtcblxuICBpdCgnZmluZCBmdW5jdGlvbicsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChgXFxcbmRlZiBoZWxsb193b3JsZCgpOlxuICByZXR1cm4gVHJ1ZVxuaGVsbG9fd29ybGRcXFxuYCk7XG4gICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFszLCAxXSk7XG5cbiAgICBleHBlY3QoaGVscGVycy5nZXRTZWxlY3RlZFdvcmQoKSkudG9FcXVhbCgnaGVsbG9fd29ybGQnKTtcbiAgICBleHBlY3QoaGVscGVycy5nZXRGaWxlVHlwZXMoKSkudG9Db250YWluKCcqLnB5Jyk7XG4gICAgZXhwZWN0KGhlbHBlcnMuc2VuZENvbWFuZCgpKS50b0JlKHRydWUpO1xuXG4gICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IGhlbHBlcnMud2FpdHNDb21wbGV0ZSgpKTtcblxuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtcy5sZW5ndGgpLnRvRXF1YWwoMSk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzBdLmxpbmUpLnRvRXF1YWwoMCk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzBdLnRleHQpLnRvQ29udGFpbignZGVmIGhlbGxvX3dvcmxkKCk6Jyk7XG4gIH0pO1xuXG4gIGl0KCdmaW5kIGZ1bmN0aW9uIGFuZCBjbGFzcyB3aXRob3V0IHNhdmVkJywgKCkgPT4ge1xuICAgIGVkaXRvci5zZXRUZXh0KGBcXFxuY2xhc3MgaGVsbG9fd29ybGQob2JqZWN0KTpcbiAgZGVmIGhlbGxvX3dvcmxkKHNlbGYpOlxuICAgIHBhc3NcbmhlbGxvX3dvcmxkXFxcbmApO1xuICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbNCwgMV0pO1xuXG4gICAgZXhwZWN0KGhlbHBlcnMuZ2V0U2VsZWN0ZWRXb3JkKCkpLnRvRXF1YWwoJ2hlbGxvX3dvcmxkJyk7XG4gICAgZXhwZWN0KGhlbHBlcnMuZ2V0RmlsZVR5cGVzKCkpLnRvQ29udGFpbignKi5weScpO1xuICAgIGV4cGVjdChoZWxwZXJzLnNlbmRDb21hbmQoKSkudG9CZSh0cnVlKTtcblxuICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiBoZWxwZXJzLndhaXRzQ29tcGxldGUoKSk7XG5cbiAgICBleHBlY3QobWFpbk1vZHVsZS5kZWZpbml0aW9uc1ZpZXcuaXRlbXMubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtc1swXS5saW5lKS50b0VxdWFsKDApO1xuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtc1swXS50ZXh0KS50b0NvbnRhaW4oJ2NsYXNzIGhlbGxvX3dvcmxkKG9iamVjdCk6Jyk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzFdLmxpbmUpLnRvRXF1YWwoMSk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzFdLnRleHQpLnRvQ29udGFpbignZGVmIGhlbGxvX3dvcmxkKHNlbGYpOicpO1xuICB9KTtcblxuICBpdCgnZmluZCBmdW5jdGlvbiBhbmQgY2xhc3Mgd2l0aCBzYXZlZCcsICgpID0+IHtcbiAgICBlZGl0b3Iuc2V0VGV4dChgXFxcbmNsYXNzIGhlbGxvX3dvcmxkKG9iamVjdCk6XG4gIGRlZiBoZWxsb193b3JsZChzZWxmKTpcbiAgICBwYXNzXG5oZWxsb193b3JsZFxcXG5gKTtcbiAgICBoZWxwZXJzLmVkaXRvclNhdmUoKTtcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzQsIDFdKTtcblxuICAgIGV4cGVjdChoZWxwZXJzLmdldFNlbGVjdGVkV29yZCgpKS50b0VxdWFsKCdoZWxsb193b3JsZCcpO1xuICAgIGV4cGVjdChoZWxwZXJzLmdldEZpbGVUeXBlcygpKS50b0NvbnRhaW4oJyoucHknKTtcbiAgICBleHBlY3QoaGVscGVycy5zZW5kQ29tYW5kKCkpLnRvQmUodHJ1ZSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gaGVscGVycy53YWl0c0NvbXBsZXRlKCkpO1xuICAgIGhlbHBlcnMuZWRpdG9yRGVsZXRlKCk7XG5cbiAgICBleHBlY3QobWFpbk1vZHVsZS5kZWZpbml0aW9uc1ZpZXcuaXRlbXMubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtc1swXS5saW5lKS50b0VxdWFsKDApO1xuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtc1swXS50ZXh0KS50b0NvbnRhaW4oJ2NsYXNzIGhlbGxvX3dvcmxkKG9iamVjdCk6Jyk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzFdLmxpbmUpLnRvRXF1YWwoMSk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzFdLnRleHQpLnRvQ29udGFpbignZGVmIGhlbGxvX3dvcmxkKHNlbGYpOicpO1xuICB9KTtcblxuICBpdCgncGVyZm9ybWFuY2UgbW9kZSBmaW5kIGZ1bmN0aW9uIGFuZCBjbGFzcyB3aXRoIHNhdmVkJywgKCkgPT4ge1xuICAgIGhlbHBlcnMucGVyZm9ybWFuY2VNb2RlKCk7XG5cbiAgICBlZGl0b3Iuc2V0VGV4dChgXFxcbmNsYXNzIGhlbGxvX3dvcmxkKG9iamVjdCk6XG4gIGRlZiBoZWxsb193b3JsZChzZWxmKTpcbiAgICBwYXNzXG5oZWxsb193b3JsZFxcXG5gKTtcbiAgICBoZWxwZXJzLmVkaXRvclNhdmUoKTtcbiAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzQsIDFdKTtcblxuICAgIGV4cGVjdChoZWxwZXJzLmdldFNlbGVjdGVkV29yZCgpKS50b0VxdWFsKCdoZWxsb193b3JsZCcpO1xuICAgIGV4cGVjdChoZWxwZXJzLmdldEZpbGVUeXBlcygpKS50b0NvbnRhaW4oJyoucHknKTtcbiAgICBleHBlY3QoaGVscGVycy5zZW5kQ29tYW5kKCkpLnRvQmUodHJ1ZSk7XG5cbiAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gaGVscGVycy53YWl0c0NvbXBsZXRlKCkpO1xuICAgIGhlbHBlcnMuZWRpdG9yRGVsZXRlKCk7XG5cbiAgICBleHBlY3QobWFpbk1vZHVsZS5kZWZpbml0aW9uc1ZpZXcuaXRlbXMubGVuZ3RoKS50b0VxdWFsKDIpO1xuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtc1swXS5saW5lKS50b0VxdWFsKDApO1xuICAgIGV4cGVjdChtYWluTW9kdWxlLmRlZmluaXRpb25zVmlldy5pdGVtc1swXS50ZXh0KS50b0NvbnRhaW4oJ2NsYXNzIGhlbGxvX3dvcmxkKG9iamVjdCk6Jyk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzFdLmxpbmUpLnRvRXF1YWwoMSk7XG4gICAgZXhwZWN0KG1haW5Nb2R1bGUuZGVmaW5pdGlvbnNWaWV3Lml0ZW1zWzFdLnRleHQpLnRvQ29udGFpbignZGVmIGhlbGxvX3dvcmxkKHNlbGYpOicpO1xuICB9KTtcbn0pO1xuIl19