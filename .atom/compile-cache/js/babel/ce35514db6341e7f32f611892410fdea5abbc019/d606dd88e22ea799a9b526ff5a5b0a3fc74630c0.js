Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.resolveObject = resolveObject;
exports.matches = matches;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

var _lodashIsArray = require('lodash/isArray');

var _lodashIsArray2 = _interopRequireDefault(_lodashIsArray);

var _lodashIsUndefined = require('lodash/isUndefined');

var _lodashIsUndefined2 = _interopRequireDefault(_lodashIsUndefined);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

'use babel';

var ArrayTraverser = (function () {
  function ArrayTraverser() {
    var array = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var index = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

    _classCallCheck(this, ArrayTraverser);

    this.array = array;
    this.index = index;
  }

  _createClass(ArrayTraverser, [{
    key: 'current',
    value: function current() {
      return this.array[this.index];
    }
  }, {
    key: 'next',
    value: function next() {
      if (!this.hasNext()) {
        throw new Error('no next element at ' + (this.index + 1));
      }
      this.index += 1;
      return this.array[this.index];
    }
  }, {
    key: 'peekNext',
    value: function peekNext(defaultValue) {
      return this.hasNext() ? this.array[this.index + 1] : defaultValue;
    }
  }, {
    key: 'peekPrevious',
    value: function peekPrevious(defaultValue) {
      return this.hasPrevious() ? this.array[this.index - 1] : defaultValue;
    }
  }, {
    key: 'previous',
    value: function previous() {
      if (!this.hasPrevious()) {
        throw new Error('no previous element at ' + this.index);
      }
      this.index -= 1;
      return this.array[this.index];
    }
  }, {
    key: 'hasNext',
    value: function hasNext() {
      return this.index + 1 < this.array.length;
    }
  }, {
    key: 'hasPrevious',
    value: function hasPrevious() {
      return this.index - 1 >= 0 && this.array.length !== 0;
    }
  }]);

  return ArrayTraverser;
})();

exports.ArrayTraverser = ArrayTraverser;

var PositionInfo = (function () {
  function PositionInfo() {
    var segments = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
    var keyPosition = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
    var valuePosition = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var previousToken = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
    var editedToken = arguments.length <= 4 || arguments[4] === undefined ? null : arguments[4];
    var nextToken = arguments.length <= 5 || arguments[5] === undefined ? null : arguments[5];

    _classCallCheck(this, PositionInfo);

    this.segments = segments;
    this.keyPosition = keyPosition;
    this.valuePosition = valuePosition;
    this.previousToken = previousToken;
    this.editedToken = editedToken;
    this.nextToken = nextToken;
  }

  _createClass(PositionInfo, [{
    key: 'setKeyPosition',
    value: function setKeyPosition() {
      return new PositionInfo(this.segments, true, false, this.previousToken, this.editedToken, this.nextToken);
    }
  }, {
    key: 'setValuePosition',
    value: function setValuePosition() {
      return new PositionInfo(this.segments, false, true, this.previousToken, this.editedToken, this.nextToken);
    }
  }, {
    key: 'setPreviousToken',
    value: function setPreviousToken(token) {
      return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, token, this.editedToken, this.nextToken);
    }
  }, {
    key: 'setEditedToken',
    value: function setEditedToken(token) {
      return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, token, this.nextToken);
    }
  }, {
    key: 'setNextToken',
    value: function setNextToken(token) {
      return new PositionInfo(this.segments, this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, token);
    }
  }, {
    key: 'add',
    value: function add(segment) {
      return this.addAll([segment]);
    }
  }, {
    key: 'addAll',
    value: function addAll(segments) {
      return new PositionInfo(this.segments.concat(segments), this.keyPosition, this.valuePosition, this.previousToken, this.editedToken, this.nextToken);
    }
  }, {
    key: 'toObject',
    value: function toObject() {
      return {
        segments: this.segments,
        keyPosition: this.keyPosition,
        valuePosition: this.valuePosition,
        previousToken: this.previousToken,
        editedToken: this.editedToken,
        nextToken: this.nextToken
      };
    }
  }]);

  return PositionInfo;
})();

exports.PositionInfo = PositionInfo;

var ValueHolder = (function () {
  function ValueHolder(value) {
    _classCallCheck(this, ValueHolder);

    this.value = value;
  }

  _createClass(ValueHolder, [{
    key: 'get',
    value: function get() {
      if (!this.hasValue()) {
        throw new Error('value is not set');
      }
      return this.value;
    }
  }, {
    key: 'getOrElse',
    value: function getOrElse(defaultValue) {
      return this.hasValue() ? this.get() : defaultValue;
    }
  }, {
    key: 'set',
    value: function set(value) {
      this.value = value;
    }
  }, {
    key: 'hasValue',
    value: function hasValue() {
      return !(0, _lodashIsUndefined2['default'])(this.value);
    }
  }]);

  return ValueHolder;
})();

exports.ValueHolder = ValueHolder;

function resolveObject(_x9, _x10) {
  var _again = true;

  _function: while (_again) {
    var segments = _x9,
        object = _x10;
    _again = false;

    if (!(0, _lodashIsObject2['default'])(object)) {
      return null;
    }
    if (segments.length === 0) {
      return object;
    }

    var _segments = _toArray(segments);

    var key = _segments[0];

    var restOfSegments = _segments.slice(1);

    _x9 = restOfSegments;
    _x10 = object[key];
    _again = true;
    _segments = key = restOfSegments = undefined;
    continue _function;
  }
}

function doMatches(pattern, file) {
  var path = pattern.indexOf('/') > -1 ? file.getRealPathSync() : file.getBaseName();
  var search = process.platform === 'win32' ? pattern.replace(/\//g, '\\') : pattern;
  return (0, _minimatch2['default'])(path, search);
}

function matches(file, patterns) {
  return (0, _lodashIsArray2['default'])(patterns) ? patterns.some(function (pattern) {
    return doMatches(pattern, file);
  }) : doMatches(patterns, file);
}

var StorageType = {
  FILE: 'FILE',
  FOLDER: 'FOLDER',
  BOTH: 'BOTH'
};
exports.StorageType = StorageType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OEJBRXFCLGlCQUFpQjs7Ozs2QkFDbEIsZ0JBQWdCOzs7O2lDQUNaLG9CQUFvQjs7Ozt5QkFFdEIsV0FBVzs7OztBQU5qQyxXQUFXLENBQUE7O0lBUUUsY0FBYztBQUVkLFdBRkEsY0FBYyxHQUVXO1FBQXhCLEtBQUsseURBQUcsRUFBRTtRQUFFLEtBQUsseURBQUcsQ0FBQyxDQUFDOzswQkFGdkIsY0FBYzs7QUFHdkIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7QUFDbEIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbkI7O2VBTFUsY0FBYzs7V0FPbEIsbUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzlCOzs7V0FFRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDbkIsY0FBTSxJQUFJLEtBQUssMEJBQXVCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLENBQUcsQ0FBQTtPQUN4RDtBQUNELFVBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFBO0FBQ2YsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUM5Qjs7O1dBRU8sa0JBQUMsWUFBWSxFQUFFO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUE7S0FDbEU7OztXQUVXLHNCQUFDLFlBQVksRUFBRTtBQUN6QixhQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FB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ImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnbG9kYXNoL2lzT2JqZWN0J1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXknXG5pbXBvcnQgaXNVbmRlZmluZWQgZnJvbSAnbG9kYXNoL2lzVW5kZWZpbmVkJ1xuXG5pbXBvcnQgbWluaW1hdGNoIGZyb20gJ21pbmltYXRjaCdcblxuZXhwb3J0IGNsYXNzIEFycmF5VHJhdmVyc2VyIHtcblxuICBjb25zdHJ1Y3RvcihhcnJheSA9IFtdLCBpbmRleCA9IC0xKSB7XG4gICAgdGhpcy5hcnJheSA9IGFycmF5XG4gICAgdGhpcy5pbmRleCA9IGluZGV4XG4gIH1cblxuICBjdXJyZW50KCkge1xuICAgIHJldHVybiB0aGlzLmFycmF5W3RoaXMuaW5kZXhdXG4gIH1cblxuICBuZXh0KCkge1xuICAgIGlmICghdGhpcy5oYXNOZXh0KCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbm8gbmV4dCBlbGVtZW50IGF0ICR7dGhpcy5pbmRleCArIDF9YClcbiAgICB9XG4gICAgdGhpcy5pbmRleCArPSAxXG4gICAgcmV0dXJuIHRoaXMuYXJyYXlbdGhpcy5pbmRleF1cbiAgfVxuXG4gIHBlZWtOZXh0KGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhhc05leHQoKSA/IHRoaXMuYXJyYXlbdGhpcy5pbmRleCArIDFdIDogZGVmYXVsdFZhbHVlXG4gIH1cblxuICBwZWVrUHJldmlvdXMoZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzUHJldmlvdXMoKSA/IHRoaXMuYXJyYXlbdGhpcy5pbmRleCAtIDFdIDogZGVmYXVsdFZhbHVlXG4gIH1cblxuICBwcmV2aW91cygpIHtcbiAgICBpZiAoIXRoaXMuaGFzUHJldmlvdXMoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBubyBwcmV2aW91cyBlbGVtZW50IGF0ICR7dGhpcy5pbmRleH1gKVxuICAgIH1cbiAgICB0aGlzLmluZGV4IC09IDFcbiAgICByZXR1cm4gdGhpcy5hcnJheVt0aGlzLmluZGV4XVxuICB9XG5cbiAgaGFzTmV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleCArIDEgPCB0aGlzLmFycmF5Lmxlbmd0aFxuICB9XG5cbiAgaGFzUHJldmlvdXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggLSAxID49IDAgJiYgdGhpcy5hcnJheS5sZW5ndGggIT09IDBcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25JbmZvIHtcbiAgY29uc3RydWN0b3Ioc2VnbWVudHMgPSBbXSxcbiAgICBrZXlQb3NpdGlvbiA9IGZhbHNlLFxuICAgIHZhbHVlUG9zaXRpb24gPSBmYWxzZSxcbiAgICBwcmV2aW91c1Rva2VuID0gbnVsbCxcbiAgICBlZGl0ZWRUb2tlbiA9IG51bGwsXG4gICAgbmV4dFRva2VuID0gbnVsbFxuICApIHtcbiAgICB0aGlzLnNlZ21lbnRzID0gc2VnbWVudHNcbiAgICB0aGlzLmtleVBvc2l0aW9uID0ga2V5UG9zaXRpb25cbiAgICB0aGlzLnZhbHVlUG9zaXRpb24gPSB2YWx1ZVBvc2l0aW9uXG4gICAgdGhpcy5wcmV2aW91c1Rva2VuID0gcHJldmlvdXNUb2tlblxuICAgIHRoaXMuZWRpdGVkVG9rZW4gPSBlZGl0ZWRUb2tlblxuICAgIHRoaXMubmV4dFRva2VuID0gbmV4dFRva2VuXG4gIH1cblxuICBzZXRLZXlQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uSW5mbyh0aGlzLnNlZ21lbnRzLCB0cnVlLCBmYWxzZSwgdGhpcy5wcmV2aW91c1Rva2VuLCB0aGlzLmVkaXRlZFRva2VuLCB0aGlzLm5leHRUb2tlbilcbiAgfVxuXG4gIHNldFZhbHVlUG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbkluZm8odGhpcy5zZWdtZW50cywgZmFsc2UsIHRydWUsIHRoaXMucHJldmlvdXNUb2tlbiwgdGhpcy5lZGl0ZWRUb2tlbiwgdGhpcy5uZXh0VG9rZW4pXG4gIH1cblxuICBzZXRQcmV2aW91c1Rva2VuKHRva2VuKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbkluZm8odGhpcy5zZWdtZW50cywgdGhpcy5rZXlQb3NpdGlvbiwgdGhpcy52YWx1ZVBvc2l0aW9uLCB0b2tlbiwgdGhpcy5lZGl0ZWRUb2tlbiwgdGhpcy5uZXh0VG9rZW4pXG4gIH1cblxuICBzZXRFZGl0ZWRUb2tlbih0b2tlbikge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb25JbmZvKHRoaXMuc2VnbWVudHMsIHRoaXMua2V5UG9zaXRpb24sIHRoaXMudmFsdWVQb3NpdGlvbiwgdGhpcy5wcmV2aW91c1Rva2VuLCB0b2tlbiwgdGhpcy5uZXh0VG9rZW4pXG4gIH1cblxuICBzZXROZXh0VG9rZW4odG9rZW4pIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uSW5mbyh0aGlzLnNlZ21lbnRzLCB0aGlzLmtleVBvc2l0aW9uLCB0aGlzLnZhbHVlUG9zaXRpb24sIHRoaXMucHJldmlvdXNUb2tlbiwgdGhpcy5lZGl0ZWRUb2tlbiwgdG9rZW4pXG4gIH1cblxuICBhZGQoc2VnbWVudCkge1xuICAgIHJldHVybiB0aGlzLmFkZEFsbChbc2VnbWVudF0pXG4gIH1cblxuICBhZGRBbGwoc2VnbWVudHMpIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uSW5mbyhcbiAgICAgIHRoaXMuc2VnbWVudHMuY29uY2F0KHNlZ21lbnRzKSxcbiAgICAgIHRoaXMua2V5UG9zaXRpb24sXG4gICAgICB0aGlzLnZhbHVlUG9zaXRpb24sXG4gICAgICB0aGlzLnByZXZpb3VzVG9rZW4sXG4gICAgICB0aGlzLmVkaXRlZFRva2VuLFxuICAgICAgdGhpcy5uZXh0VG9rZW5cbiAgICApXG4gIH1cblxuICB0b09iamVjdCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc2VnbWVudHM6IHRoaXMuc2VnbWVudHMsXG4gICAgICBrZXlQb3NpdGlvbjogdGhpcy5rZXlQb3NpdGlvbixcbiAgICAgIHZhbHVlUG9zaXRpb246IHRoaXMudmFsdWVQb3NpdGlvbixcbiAgICAgIHByZXZpb3VzVG9rZW46IHRoaXMucHJldmlvdXNUb2tlbixcbiAgICAgIGVkaXRlZFRva2VuOiB0aGlzLmVkaXRlZFRva2VuLFxuICAgICAgbmV4dFRva2VuOiB0aGlzLm5leHRUb2tlblxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmFsdWVIb2xkZXIge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgZ2V0KCkge1xuICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbHVlIGlzIG5vdCBzZXQnKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy52YWx1ZVxuICB9XG5cbiAgZ2V0T3JFbHNlKGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhhc1ZhbHVlKCkgPyB0aGlzLmdldCgpIDogZGVmYXVsdFZhbHVlXG4gIH1cblxuICBzZXQodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIGhhc1ZhbHVlKCkge1xuICAgIHJldHVybiAhaXNVbmRlZmluZWQodGhpcy52YWx1ZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZU9iamVjdChzZWdtZW50cywgb2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBvYmplY3RcbiAgfVxuICBjb25zdCBba2V5LCAuLi5yZXN0T2ZTZWdtZW50c10gPSBzZWdtZW50c1xuICByZXR1cm4gcmVzb2x2ZU9iamVjdChyZXN0T2ZTZWdtZW50cywgb2JqZWN0W2tleV0pXG59XG5cbmZ1bmN0aW9uIGRvTWF0Y2hlcyhwYXR0ZXJuLCBmaWxlKSB7XG4gIGNvbnN0IHBhdGggPSBwYXR0ZXJuLmluZGV4T2YoJy8nKSA+IC0xID8gZmlsZS5nZXRSZWFsUGF0aFN5bmMoKSA6IGZpbGUuZ2V0QmFzZU5hbWUoKVxuICBjb25zdCBzZWFyY2ggPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gcGF0dGVybi5yZXBsYWNlKC9cXC8vZywgJ1xcXFwnKSA6IHBhdHRlcm5cbiAgcmV0dXJuIG1pbmltYXRjaChwYXRoLCBzZWFyY2gpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaGVzKGZpbGUsIHBhdHRlcm5zKSB7XG4gIHJldHVybiBpc0FycmF5KHBhdHRlcm5zKSA/IHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBkb01hdGNoZXMocGF0dGVybiwgZmlsZSkpIDogZG9NYXRjaGVzKHBhdHRlcm5zLCBmaWxlKVxufVxuXG5leHBvcnQgY29uc3QgU3RvcmFnZVR5cGUgPSB7XG4gIEZJTEU6ICdGSUxFJyxcbiAgRk9MREVSOiAnRk9MREVSJyxcbiAgQk9USDogJ0JPVEgnXG59XG5cbiJdfQ==