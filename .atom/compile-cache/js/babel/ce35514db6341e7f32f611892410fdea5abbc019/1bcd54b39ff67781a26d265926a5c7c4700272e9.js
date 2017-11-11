Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

/* eslint class-methods-use-this: ["error", {
  "exceptMethods": ["getFilterKey", "elementForItem", "didChangeSelection", "didLoseFocus"]
}] */

var _atom = require('atom');

var _atomSelectList = require('atom-select-list');

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _etch = require('etch');

var _etch2 = _interopRequireDefault(_etch);

function DefinitionsListView(props) {
  var _this = this;

  this.props = props;
  this.computeItems(false);
  this.disposables = new _atom.CompositeDisposable();
  _etch2['default'].initialize(this);
  this.element.classList.add('select-list');
  this.disposables.add(this.refs.queryEditor.onDidChange(this.didChangeQuery.bind(this)));
  if (!props.skipCommandsRegistration) {
    this.disposables.add(this.registerAtomCommands());
  }
  this.disposables.add(new _atom.Disposable(function () {
    _this.unbindBlur();
  }));
}

DefinitionsListView.prototype = _atomSelectList2['default'].prototype;

DefinitionsListView.prototype.bindBlur = function bindBlur() {
  var editorElement = this.refs.queryEditor.element;
  var didLoseFocus = this.didLoseFocus.bind(this);
  editorElement.addEventListener('blur', didLoseFocus);
};

DefinitionsListView.prototype.unbindBlur = function unbindBlur() {
  var editorElement = this.refs.queryEditor.element;
  var didLoseFocus = this.didLoseFocus.bind(this);
  editorElement.removeEventListener('blur', didLoseFocus);
};

var DefinitionsView = (function () {
  function DefinitionsView() {
    var emptyMessage = arguments.length <= 0 || arguments[0] === undefined ? 'No definition found' : arguments[0];
    var maxResults = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, DefinitionsView);

    this.selectListView = new DefinitionsListView({
      maxResults: maxResults,
      emptyMessage: emptyMessage,
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.fileName;
      },
      elementForItem: this.elementForItem.bind(this),
      didConfirmSelection: this.didConfirmSelection.bind(this),
      didConfirmEmptySelection: this.didConfirmEmptySelection.bind(this),
      didCancelSelection: this.didCancelSelection.bind(this)
    });
    this.element = this.selectListView.element;
    this.element.classList.add('symbols-view');
    this.panel = atom.workspace.addModalPanel({ item: this, visible: false });
    this.items = [];

    this.setState('ready');
    setTimeout(this.show.bind(this), 300);
  }

  _createClass(DefinitionsView, [{
    key: 'setState',
    value: function setState(state) {
      if (state === 'ready' && !this.state) {
        this.state = 'ready';
        return null;
      }
      if (state === 'loding' && ['ready', 'loding'].includes(this.state)) {
        this.state = 'loding';
        return null;
      }
      if (state === 'cancelled' && ['ready', 'loding'].includes(this.state)) {
        this.state = 'cancelled';
        return null;
      }
      throw new Error('state switch error');
    }
  }, {
    key: 'getFilterKey',
    value: function getFilterKey() {
      return 'fileName';
    }
  }, {
    key: 'elementForItem',
    value: function elementForItem(_ref) {
      var fileName = _ref.fileName;
      var text = _ref.text;
      var line = _ref.line;

      var relativePath = atom.project.relativizePath(fileName)[1];

      var li = document.createElement('li');
      li.classList.add('two-lines');

      var primaryLine = document.createElement('div');
      primaryLine.classList.add('primary-line');
      primaryLine.textContent = text;
      li.appendChild(primaryLine);

      var secondaryLine = document.createElement('div');
      secondaryLine.classList.add('secondary-line');
      secondaryLine.textContent = relativePath + ', line ' + (line + 1);
      li.appendChild(secondaryLine);

      return li;
    }
  }, {
    key: 'addItems',
    value: function addItems(items) {
      var _items;

      if (!['ready', 'loding'].includes(this.state)) {
        return null;
      }
      this.setState('loding');

      (_items = this.items).push.apply(_items, _toConsumableArray(items));
      this.items.filter(function (v, i, a) {
        return a.indexOf(v) === i;
      });

      this.selectListView.update({ items: this.items });
      return null;
    }
  }, {
    key: 'confirmedFirst',
    value: function confirmedFirst() {
      if (this.items.length > 0) {
        this.didConfirmSelection(this.items[0]);
      }
    }
  }, {
    key: 'show',
    value: function show() {
      if (['ready', 'loding'].includes(this.state) && !this.panel.visible) {
        this.previouslyFocusedElement = document.activeElement;
        this.panel.show();
        this.selectListView.reset();
        this.selectListView.focus();
        this.selectListView.bindBlur();
      }
    }
  }, {
    key: 'cancel',
    value: _asyncToGenerator(function* () {
      if (['ready', 'loding'].includes(this.state)) {
        if (!this.isCanceling) {
          this.setState('cancelled');
          this.selectListView.unbindBlur();
          this.isCanceling = true;
          yield this.selectListView.update({ items: [] });
          this.panel.hide();
          if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
            this.previouslyFocusedElement = null;
          }
          this.isCanceling = false;
        }
      }
    })
  }, {
    key: 'didCancelSelection',
    value: function didCancelSelection() {
      this.cancel();
    }
  }, {
    key: 'didConfirmEmptySelection',
    value: function didConfirmEmptySelection() {
      this.cancel();
    }
  }, {
    key: 'didConfirmSelection',
    value: _asyncToGenerator(function* (_ref2) {
      var fileName = _ref2.fileName;
      var line = _ref2.line;
      var column = _ref2.column;

      if (this.state !== 'loding') {
        return null;
      }
      var promise = atom.workspace.open(fileName);
      yield promise.then(function (editor) {
        editor.setCursorBufferPosition([line, column]);
        editor.scrollToCursorPosition();
      });
      yield this.cancel();
      return null;
    })
  }, {
    key: 'destroy',
    value: _asyncToGenerator(function* () {
      yield this.cancel();
      this.panel.destroy();
      this.selectListView.destroy();
      return null;
    })
  }]);

  return DefinitionsView;
})();

exports['default'] = DefinitionsView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvZGVmaW5pdGlvbnMtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFNZ0QsTUFBTTs7OEJBQzNCLGtCQUFrQjs7OztvQkFDNUIsTUFBTTs7OztBQUV2QixTQUFTLG1CQUFtQixDQUFDLEtBQUssRUFBRTs7O0FBQ2xDLE1BQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekIsTUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBeUIsQ0FBQztBQUM3QyxvQkFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsTUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEYsTUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRTtBQUNuQyxRQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0dBQ25EO0FBQ0QsTUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQWUsWUFBTTtBQUFFLFVBQUssVUFBVSxFQUFFLENBQUM7R0FBRSxDQUFDLENBQUMsQ0FBQztDQUNwRTs7QUFFRCxtQkFBbUIsQ0FBQyxTQUFTLEdBQUcsNEJBQWUsU0FBUyxDQUFDOztBQUV6RCxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxHQUFHO0FBQzNELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxJ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Qyx1QkFBdUIsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQy9DLGNBQU0sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO09BQ2pDLENBQUMsQ0FBQztBQUNILFlBQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7Ozs2QkFFWSxhQUFHO0FBQ2QsWUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztTQXBJa0IsZUFBZTs7O3FCQUFmLGVBQWUiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ290by1kZWZpbml0aW9uL2xpYi9kZWZpbml0aW9ucy12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBiYWJlbCAqL1xuXG4vKiBlc2xpbnQgY2xhc3MtbWV0aG9kcy11c2UtdGhpczogW1wiZXJyb3JcIiwge1xuICBcImV4Y2VwdE1ldGhvZHNcIjogW1wiZ2V0RmlsdGVyS2V5XCIsIFwiZWxlbWVudEZvckl0ZW1cIiwgXCJkaWRDaGFuZ2VTZWxlY3Rpb25cIiwgXCJkaWRMb3NlRm9jdXNcIl1cbn1dICovXG5cbmltcG9ydCB7IERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCBTZWxlY3RMaXN0VmlldyBmcm9tICdhdG9tLXNlbGVjdC1saXN0JztcbmltcG9ydCBldGNoIGZyb20gJ2V0Y2gnO1xuXG5mdW5jdGlvbiBEZWZpbml0aW9uc0xpc3RWaWV3KHByb3BzKSB7XG4gIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgdGhpcy5jb21wdXRlSXRlbXMoZmFsc2UpO1xuICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgZXRjaC5pbml0aWFsaXplKHRoaXMpO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0LWxpc3QnKTtcbiAgdGhpcy5kaXNwb3NhYmxlcy5hZGQodGhpcy5yZWZzLnF1ZXJ5RWRpdG9yLm9uRGlkQ2hhbmdlKHRoaXMuZGlkQ2hhbmdlUXVlcnkuYmluZCh0aGlzKSkpO1xuICBpZiAoIXByb3BzLnNraXBDb21tYW5kc1JlZ2lzdHJhdGlvbikge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMucmVnaXN0ZXJBdG9tQ29tbWFuZHMoKSk7XG4gIH1cbiAgdGhpcy5kaXNwb3NhYmxlcy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLnVuYmluZEJsdXIoKTsgfSkpO1xufVxuXG5EZWZpbml0aW9uc0xpc3RWaWV3LnByb3RvdHlwZSA9IFNlbGVjdExpc3RWaWV3LnByb3RvdHlwZTtcblxuRGVmaW5pdGlvbnNMaXN0Vmlldy5wcm90b3R5cGUuYmluZEJsdXIgPSBmdW5jdGlvbiBiaW5kQmx1cigpIHtcbiAgY29uc3QgZWRpdG9yRWxlbWVudCA9IHRoaXMucmVmcy5xdWVyeUVkaXRvci5lbGVtZW50O1xuICBjb25zdCBkaWRMb3NlRm9jdXMgPSB0aGlzLmRpZExvc2VGb2N1cy5iaW5kKHRoaXMpO1xuICBlZGl0b3JFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBkaWRMb3NlRm9jdXMpO1xufTtcblxuRGVmaW5pdGlvbnNMaXN0Vmlldy5wcm90b3R5cGUudW5iaW5kQmx1ciA9IGZ1bmN0aW9uIHVuYmluZEJsdXIoKSB7XG4gIGNvbnN0IGVkaXRvckVsZW1lbnQgPSB0aGlzLnJlZnMucXVlcnlFZGl0b3IuZWxlbWVudDtcbiAgY29uc3QgZGlkTG9zZUZvY3VzID0gdGhpcy5kaWRMb3NlRm9jdXMuYmluZCh0aGlzKTtcbiAgZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgZGlkTG9zZUZvY3VzKTtcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmaW5pdGlvbnNWaWV3IHtcbiAgY29uc3RydWN0b3IoZW1wdHlNZXNzYWdlID0gJ05vIGRlZmluaXRpb24gZm91bmQnLCBtYXhSZXN1bHRzID0gbnVsbCkge1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcgPSBuZXcgRGVmaW5pdGlvbnNMaXN0Vmlldyh7XG4gICAgICBtYXhSZXN1bHRzLFxuICAgICAgZW1wdHlNZXNzYWdlLFxuICAgICAgaXRlbXM6IFtdLFxuICAgICAgZmlsdGVyS2V5Rm9ySXRlbTogaXRlbSA9PiBpdGVtLmZpbGVOYW1lLFxuICAgICAgZWxlbWVudEZvckl0ZW06IHRoaXMuZWxlbWVudEZvckl0ZW0uYmluZCh0aGlzKSxcbiAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IHRoaXMuZGlkQ29uZmlybVNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgZGlkQ29uZmlybUVtcHR5U2VsZWN0aW9uOiB0aGlzLmRpZENvbmZpcm1FbXB0eVNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiB0aGlzLmRpZENhbmNlbFNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgIH0pO1xuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuc2VsZWN0TGlzdFZpZXcuZWxlbWVudDtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc3ltYm9scy12aWV3Jyk7XG4gICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSB9KTtcbiAgICB0aGlzLml0ZW1zID0gW107XG5cbiAgICB0aGlzLnNldFN0YXRlKCdyZWFkeScpO1xuICAgIHNldFRpbWVvdXQodGhpcy5zaG93LmJpbmQodGhpcyksIDMwMCk7XG4gIH1cblxuICBzZXRTdGF0ZShzdGF0ZSkge1xuICAgIGlmIChzdGF0ZSA9PT0gJ3JlYWR5JyAmJiAhdGhpcy5zdGF0ZSkge1xuICAgICAgdGhpcy5zdGF0ZSA9ICdyZWFkeSc7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHN0YXRlID09PSAnbG9kaW5nJyAmJiBbJ3JlYWR5JywgJ2xvZGluZyddLmluY2x1ZGVzKHRoaXMuc3RhdGUpKSB7XG4gICAgICB0aGlzLnN0YXRlID0gJ2xvZGluZyc7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHN0YXRlID09PSAnY2FuY2VsbGVkJyAmJiBbJ3JlYWR5JywgJ2xvZGluZyddLmluY2x1ZGVzKHRoaXMuc3RhdGUpKSB7XG4gICAgICB0aGlzLnN0YXRlID0gJ2NhbmNlbGxlZCc7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGF0ZSBzd2l0Y2ggZXJyb3InKTtcbiAgfVxuXG4gIGdldEZpbHRlcktleSgpIHtcbiAgICByZXR1cm4gJ2ZpbGVOYW1lJztcbiAgfVxuXG4gIGVsZW1lbnRGb3JJdGVtKHsgZmlsZU5hbWUsIHRleHQsIGxpbmUgfSkge1xuICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlTmFtZSlbMV07XG5cbiAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgbGkuY2xhc3NMaXN0LmFkZCgndHdvLWxpbmVzJyk7XG5cbiAgICBjb25zdCBwcmltYXJ5TGluZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHByaW1hcnlMaW5lLmNsYXNzTGlzdC5hZGQoJ3ByaW1hcnktbGluZScpO1xuICAgIHByaW1hcnlMaW5lLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICBsaS5hcHBlbmRDaGlsZChwcmltYXJ5TGluZSk7XG5cbiAgICBjb25zdCBzZWNvbmRhcnlMaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2Vjb25kYXJ5TGluZS5jbGFzc0xpc3QuYWRkKCdzZWNvbmRhcnktbGluZScpO1xuICAgIHNlY29uZGFyeUxpbmUudGV4dENvbnRlbnQgPSBgJHtyZWxhdGl2ZVBhdGh9LCBsaW5lICR7bGluZSArIDF9YDtcbiAgICBsaS5hcHBlbmRDaGlsZChzZWNvbmRhcnlMaW5lKTtcblxuICAgIHJldHVybiBsaTtcbiAgfVxuXG4gIGFkZEl0ZW1zKGl0ZW1zKSB7XG4gICAgaWYgKCFbJ3JlYWR5JywgJ2xvZGluZyddLmluY2x1ZGVzKHRoaXMuc3RhdGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSgnbG9kaW5nJyk7XG5cbiAgICB0aGlzLml0ZW1zLnB1c2goLi4uaXRlbXMpO1xuICAgIHRoaXMuaXRlbXMuZmlsdGVyKCh2LCBpLCBhKSA9PiBhLmluZGV4T2YodikgPT09IGkpO1xuXG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoeyBpdGVtczogdGhpcy5pdGVtcyB9KTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbmZpcm1lZEZpcnN0KCkge1xuICAgIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZGlkQ29uZmlybVNlbGVjdGlvbih0aGlzLml0ZW1zWzBdKTtcbiAgICB9XG4gIH1cblxuICBzaG93KCkge1xuICAgIGlmIChbJ3JlYWR5JywgJ2xvZGluZyddLmluY2x1ZGVzKHRoaXMuc3RhdGUpICYmICF0aGlzLnBhbmVsLnZpc2libGUpIHtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5yZXNldCgpO1xuICAgICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5mb2N1cygpO1xuICAgICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5iaW5kQmx1cigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNhbmNlbCgpIHtcbiAgICBpZiAoWydyZWFkeScsICdsb2RpbmcnXS5pbmNsdWRlcyh0aGlzLnN0YXRlKSkge1xuICAgICAgaWYgKCF0aGlzLmlzQ2FuY2VsaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoJ2NhbmNlbGxlZCcpO1xuICAgICAgICB0aGlzLnNlbGVjdExpc3RWaWV3LnVuYmluZEJsdXIoKTtcbiAgICAgICAgdGhpcy5pc0NhbmNlbGluZyA9IHRydWU7XG4gICAgICAgIGF3YWl0IHRoaXMuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IFtdIH0pO1xuICAgICAgICB0aGlzLnBhbmVsLmhpZGUoKTtcbiAgICAgICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0NhbmNlbGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRpZENhbmNlbFNlbGVjdGlvbigpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICB9XG5cbiAgZGlkQ29uZmlybUVtcHR5U2VsZWN0aW9uKCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gIH1cblxuICBhc3luYyBkaWRDb25maXJtU2VsZWN0aW9uKHsgZmlsZU5hbWUsIGxpbmUsIGNvbHVtbiB9KSB7XG4gICAgaWYgKHRoaXMuc3RhdGUgIT09ICdsb2RpbmcnKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcHJvbWlzZSA9IGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZU5hbWUpO1xuICAgIGF3YWl0IHByb21pc2UudGhlbigoZWRpdG9yKSA9PiB7XG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xpbmUsIGNvbHVtbl0pO1xuICAgICAgZWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKTtcbiAgICB9KTtcbiAgICBhd2FpdCB0aGlzLmNhbmNlbCgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYXN5bmMgZGVzdHJveSgpIHtcbiAgICBhd2FpdCB0aGlzLmNhbmNlbCgpO1xuICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcuZGVzdHJveSgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=