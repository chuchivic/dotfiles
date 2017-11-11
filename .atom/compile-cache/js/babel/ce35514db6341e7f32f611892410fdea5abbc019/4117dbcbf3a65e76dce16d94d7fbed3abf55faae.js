Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.path = path;
exports.request = request;
exports.and = and;
exports.or = or;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsNumber = require('lodash/isNumber');

var _lodashIsNumber2 = _interopRequireDefault(_lodashIsNumber);

var _lodashIsString = require('lodash/isString');

var _lodashIsString2 = _interopRequireDefault(_lodashIsString);

var _lodashIsArray = require('lodash/isArray');

var _lodashIsArray2 = _interopRequireDefault(_lodashIsArray);

'use babel';

var IndexMatcher = (function () {
  function IndexMatcher(index) {
    _classCallCheck(this, IndexMatcher);

    this.index = index;
  }

  _createClass(IndexMatcher, [{
    key: 'matches',
    value: function matches(segment) {
      return (0, _lodashIsNumber2['default'])(segment) && this.index === segment;
    }
  }]);

  return IndexMatcher;
})();

var KeyMatcher = (function () {
  function KeyMatcher(key) {
    _classCallCheck(this, KeyMatcher);

    this.key = key;
  }

  _createClass(KeyMatcher, [{
    key: 'matches',
    value: function matches(segment) {
      return (0, _lodashIsString2['default'])(segment) && this.key === segment;
    }
  }]);

  return KeyMatcher;
})();

var AnyIndexMatcher = {
  matches: function matches(segment) {
    return (0, _lodashIsNumber2['default'])(segment);
  }
};

var AnyKeyMatcher = {
  matches: function matches(segment) {
    return (0, _lodashIsString2['default'])(segment);
  }
};

var AnyMatcher = {
  matches: function matches() {
    return true;
  }
};

var JsonPathMatcher = (function () {
  function JsonPathMatcher() {
    var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, JsonPathMatcher);

    this.matchers = matchers;
  }

  _createClass(JsonPathMatcher, [{
    key: 'index',
    value: function index(value) {
      var matcher = null;
      if (value === undefined) {
        matcher = AnyIndexMatcher;
      } else {
        matcher = (0, _lodashIsArray2['default'])(value) ? new OrMatcher(value.map(function (v) {
          return new IndexMatcher(v);
        })) : new IndexMatcher(value);
      }
      return new JsonPathMatcher(this.matchers.concat([matcher]));
    }
  }, {
    key: 'key',
    value: function key(value) {
      var matcher = null;
      if (value === undefined) {
        matcher = AnyKeyMatcher;
      } else {
        matcher = (0, _lodashIsArray2['default'])(value) ? new OrMatcher(value.map(function (v) {
          return new KeyMatcher(v);
        })) : new KeyMatcher(value);
      }
      return new JsonPathMatcher(this.matchers.concat([matcher]));
    }
  }, {
    key: 'any',
    value: function any() {
      return new JsonPathMatcher(this.matchers.concat([AnyMatcher]));
    }
  }, {
    key: 'matches',
    value: function matches(segments) {
      if (segments.length !== this.matchers.length) {
        return false;
      }

      for (var i = 0; i < this.matchers.length; ++i) {
        if (!this.matchers[i].matches(segments[i])) {
          return false;
        }
      }

      return true;
    }
  }]);

  return JsonPathMatcher;
})();

var PathRequestMatcher = (function () {
  function PathRequestMatcher(matcher) {
    _classCallCheck(this, PathRequestMatcher);

    this.matcher = matcher;
  }

  _createClass(PathRequestMatcher, [{
    key: 'matches',
    value: function matches(_ref) {
      var segments = _ref.segments;

      return Boolean(segments) && this.matcher.matches(segments);
    }
  }]);

  return PathRequestMatcher;
})();

var KeyRequestMatcher = {
  matches: function matches(_ref2) {
    var isKeyPosition = _ref2.isKeyPosition;

    return isKeyPosition;
  }
};

var ValueRequestMatcher = {
  matches: function matches(_ref3) {
    var isValuePosition = _ref3.isValuePosition;

    return isValuePosition;
  }
};

var RequestMatcher = (function () {
  function RequestMatcher() {
    var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, RequestMatcher);

    this.matchers = matchers;
  }

  _createClass(RequestMatcher, [{
    key: 'path',
    value: function path(matcher) {
      return new RequestMatcher(this.matchers.concat([new PathRequestMatcher(matcher)]));
    }
  }, {
    key: 'value',
    value: function value() {
      return new RequestMatcher(this.matchers.concat([ValueRequestMatcher]));
    }
  }, {
    key: 'key',
    value: function key() {
      return new RequestMatcher(this.matchers.concat([KeyRequestMatcher]));
    }
  }, {
    key: 'matches',
    value: function matches(req) {
      return this.matchers.every(function (matcher) {
        return matcher.matches(req);
      });
    }
  }]);

  return RequestMatcher;
})();

var CompositeMatcher = (function () {
  function CompositeMatcher() {
    var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, CompositeMatcher);

    this.matchers = matchers;
  }

  _createClass(CompositeMatcher, [{
    key: 'append',
    value: function append(matcher) {
      return this.createCompositeMatcher(this.matchers.concat([matcher]));
    }
  }, {
    key: 'prepend',
    value: function prepend(matcher) {
      return this.createCompositeMatcher([matcher].concat(this.matchers));
    }
  }]);

  return CompositeMatcher;
})();

var AndMatcher = (function (_CompositeMatcher) {
  _inherits(AndMatcher, _CompositeMatcher);

  function AndMatcher() {
    var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, AndMatcher);

    _get(Object.getPrototypeOf(AndMatcher.prototype), 'constructor', this).call(this, matchers);
  }

  _createClass(AndMatcher, [{
    key: 'createCompositeMatcher',
    value: function createCompositeMatcher(matchers) {
      return new AndMatcher(matchers);
    }
  }, {
    key: 'matches',
    value: function matches(input) {
      return this.matchers.every(function (matcher) {
        return matcher.matches(input);
      });
    }
  }]);

  return AndMatcher;
})(CompositeMatcher);

var OrMatcher = (function (_CompositeMatcher2) {
  _inherits(OrMatcher, _CompositeMatcher2);

  function OrMatcher() {
    var matchers = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, OrMatcher);

    _get(Object.getPrototypeOf(OrMatcher.prototype), 'constructor', this).call(this, matchers);
  }

  _createClass(OrMatcher, [{
    key: 'createCompositeMatcher',
    value: function createCompositeMatcher(matchers) {
      return new OrMatcher(matchers);
    }
  }, {
    key: 'matches',
    value: function matches(input) {
      return this.matchers.some(function (matcher) {
        return matcher.matches(input);
      });
    }
  }]);

  return OrMatcher;
})(CompositeMatcher);

function path() {
  return new JsonPathMatcher();
}

function request() {
  return new RequestMatcher();
}

function and() {
  for (var _len = arguments.length, matchers = Array(_len), _key = 0; _key < _len; _key++) {
    matchers[_key] = arguments[_key];
  }

  return new AndMatcher(matchers);
}

function or() {
  for (var _len2 = arguments.length, matchers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    matchers[_key2] = arguments[_key2];
  }

  return new OrMatcher(matchers);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9tYXRjaGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzhCQUVxQixpQkFBaUI7Ozs7OEJBQ2pCLGlCQUFpQjs7Ozs2QkFDbEIsZ0JBQWdCOzs7O0FBSnBDLFdBQVcsQ0FBQTs7SUFNTCxZQUFZO0FBQ0wsV0FEUCxZQUFZLENBQ0osS0FBSyxFQUFFOzBCQURmLFlBQVk7O0FBRWQsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbkI7O2VBSEcsWUFBWTs7V0FLVCxpQkFBQyxPQUFPLEVBQUU7QUFDZixhQUFPLGlDQUFTLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFBO0tBQ25EOzs7U0FQRyxZQUFZOzs7SUFVWixVQUFVO0FBQ0gsV0FEUCxVQUFVLENBQ0YsR0FBRyxFQUFFOzBCQURiLFVBQVU7O0FBRVosUUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7R0FDZjs7ZUFIRyxVQUFVOztXQUtQLGlCQUFDLE9BQU8sRUFBRTtBQUNmLGFBQU8saUNBQVMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUE7S0FDakQ7OztTQVBHLFVBQVU7OztBQVVoQixJQUFNLGVBQWUsR0FBRztBQUN0QixTQUFPLEVBQUEsaUJBQUMsT0FBTyxFQUFFO0FBQ2YsV0FBTyxpQ0FBUyxPQUFPLENBQUMsQ0FBQTtHQUN6QjtDQUNGLENBQUE7O0FBRUQsSUFBTSxhQUFhLEdBQUc7QUFDcEIsU0FBTyxFQUFBLGlCQUFDLE9BQU8sRUFBRTtBQUNmLFdBQU8saUNBQVMsT0FBTyxDQUFDLENBQUE7R0FDekI7Q0FDRixDQUFBOztBQUVELElBQU0sVUFBVSxHQUFHO0FBQ2pCLFNBQU8sRUFBQSxtQkFBRztBQUNSLFdBQU8sSUFBSSxDQUFBO0dBQ1o7Q0FDRixDQUFBOztJQUVLLGVBQWU7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O0NBQzdCOztBQUVNLFNBQVMsT0FBTyxHQUFHO0FBQ3hCLFNBQU8sSUFBSSxjQUFjLEVBQUUsQ0FBQTtDQUM1Qjs7QUFFTSxTQUFTLEdBQUcsR0FBYztvQ0FBVixRQUFRO0FBQVIsWUFBUTs7O0FBQzdCLFNBQU8sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7Q0FDaEM7O0FBRU0sU0FBUyxFQUFFLEdBQWM7cUNBQVYsUUFBUTtBQUFSLFlBQVE7OztBQUM1QixTQUFPLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0NBQy9CIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9tYXRjaGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBpc051bWJlciBmcm9tICdsb2Rhc2gvaXNOdW1iZXInXG5pbXBvcnQgaXNTdHJpbmcgZnJvbSAnbG9kYXNoL2lzU3RyaW5nJ1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXknXG5cbmNsYXNzIEluZGV4TWF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKGluZGV4KSB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4XG4gIH1cblxuICBtYXRjaGVzKHNlZ21lbnQpIHtcbiAgICByZXR1cm4gaXNOdW1iZXIoc2VnbWVudCkgJiYgdGhpcy5pbmRleCA9PT0gc2VnbWVudFxuICB9XG59XG5cbmNsYXNzIEtleU1hdGNoZXIge1xuICBjb25zdHJ1Y3RvcihrZXkpIHtcbiAgICB0aGlzLmtleSA9IGtleVxuICB9XG5cbiAgbWF0Y2hlcyhzZWdtZW50KSB7XG4gICAgcmV0dXJuIGlzU3RyaW5nKHNlZ21lbnQpICYmIHRoaXMua2V5ID09PSBzZWdtZW50XG4gIH1cbn1cblxuY29uc3QgQW55SW5kZXhNYXRjaGVyID0ge1xuICBtYXRjaGVzKHNlZ21lbnQpIHtcbiAgICByZXR1cm4gaXNOdW1iZXIoc2VnbWVudClcbiAgfVxufVxuXG5jb25zdCBBbnlLZXlNYXRjaGVyID0ge1xuICBtYXRjaGVzKHNlZ21lbnQpIHtcbiAgICByZXR1cm4gaXNTdHJpbmcoc2VnbWVudClcbiAgfVxufVxuXG5jb25zdCBBbnlNYXRjaGVyID0ge1xuICBtYXRjaGVzKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuY2xhc3MgSnNvblBhdGhNYXRjaGVyIHtcbiAgY29uc3RydWN0b3IobWF0Y2hlcnMgPSBbXSkge1xuICAgIHRoaXMubWF0Y2hlcnMgPSBtYXRjaGVyc1xuICB9XG5cbiAgaW5kZXgodmFsdWUpIHtcbiAgICBsZXQgbWF0Y2hlciA9IG51bGxcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF0Y2hlciA9IEFueUluZGV4TWF0Y2hlclxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRjaGVyID0gaXNBcnJheSh2YWx1ZSlcbiAgICAgICAgPyBuZXcgT3JNYXRjaGVyKHZhbHVlLm1hcCh2ID0+IG5ldyBJbmRleE1hdGNoZXIodikpKVxuICAgICAgICA6IG5ldyBJbmRleE1hdGNoZXIodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiBuZXcgSnNvblBhdGhNYXRjaGVyKHRoaXMubWF0Y2hlcnMuY29uY2F0KFttYXRjaGVyXSkpXG4gIH1cblxuICBrZXkodmFsdWUpIHtcbiAgICBsZXQgbWF0Y2hlciA9IG51bGxcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWF0Y2hlciA9IEFueUtleU1hdGNoZXJcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0Y2hlciA9IGlzQXJyYXkodmFsdWUpXG4gICAgICAgID8gbmV3IE9yTWF0Y2hlcih2YWx1ZS5tYXAodiA9PiBuZXcgS2V5TWF0Y2hlcih2KSkpXG4gICAgICAgIDogbmV3IEtleU1hdGNoZXIodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiBuZXcgSnNvblBhdGhNYXRjaGVyKHRoaXMubWF0Y2hlcnMuY29uY2F0KFttYXRjaGVyXSkpXG4gIH1cblxuICBhbnkoKSB7XG4gICAgcmV0dXJuIG5ldyBKc29uUGF0aE1hdGNoZXIodGhpcy5tYXRjaGVycy5jb25jYXQoW0FueU1hdGNoZXJdKSlcbiAgfVxuXG4gIG1hdGNoZXMoc2VnbWVudHMpIHtcbiAgICBpZiAoc2VnbWVudHMubGVuZ3RoICE9PSB0aGlzLm1hdGNoZXJzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1hdGNoZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoIXRoaXMubWF0Y2hlcnNbaV0ubWF0Y2hlcyhzZWdtZW50c1tpXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5jbGFzcyBQYXRoUmVxdWVzdE1hdGNoZXIge1xuICBjb25zdHJ1Y3RvcihtYXRjaGVyKSB7XG4gICAgdGhpcy5tYXRjaGVyID0gbWF0Y2hlclxuICB9XG5cbiAgbWF0Y2hlcyh7c2VnbWVudHN9KSB7XG4gICAgcmV0dXJuIEJvb2xlYW4oc2VnbWVudHMpICYmIHRoaXMubWF0Y2hlci5tYXRjaGVzKHNlZ21lbnRzKVxuICB9XG59XG5cbmNvbnN0IEtleVJlcXVlc3RNYXRjaGVyID0ge1xuICBtYXRjaGVzKHtpc0tleVBvc2l0aW9ufSkge1xuICAgIHJldHVybiBpc0tleVBvc2l0aW9uXG4gIH1cbn1cblxuY29uc3QgVmFsdWVSZXF1ZXN0TWF0Y2hlciA9IHtcbiAgbWF0Y2hlcyh7aXNWYWx1ZVBvc2l0aW9ufSkge1xuICAgIHJldHVybiBpc1ZhbHVlUG9zaXRpb25cbiAgfVxufVxuXG5jbGFzcyBSZXF1ZXN0TWF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKG1hdGNoZXJzID0gW10pIHtcbiAgICB0aGlzLm1hdGNoZXJzID0gbWF0Y2hlcnNcbiAgfVxuXG4gIHBhdGgobWF0Y2hlcikge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdE1hdGNoZXIodGhpcy5tYXRjaGVycy5jb25jYXQoW25ldyBQYXRoUmVxdWVzdE1hdGNoZXIobWF0Y2hlcildKSlcbiAgfVxuXG4gIHZhbHVlKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdE1hdGNoZXIodGhpcy5tYXRjaGVycy5jb25jYXQoW1ZhbHVlUmVxdWVzdE1hdGNoZXJdKSlcbiAgfVxuXG4gIGtleSgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3RNYXRjaGVyKHRoaXMubWF0Y2hlcnMuY29uY2F0KFtLZXlSZXF1ZXN0TWF0Y2hlcl0pKVxuICB9XG5cbiAgbWF0Y2hlcyhyZXEpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVycy5ldmVyeShtYXRjaGVyID0+IG1hdGNoZXIubWF0Y2hlcyhyZXEpKVxuICB9XG59XG5cbmNsYXNzIENvbXBvc2l0ZU1hdGNoZXIge1xuICBjb25zdHJ1Y3RvcihtYXRjaGVycyA9IFtdKSB7XG4gICAgdGhpcy5tYXRjaGVycyA9IG1hdGNoZXJzXG4gIH1cblxuICBhcHBlbmQobWF0Y2hlcikge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUNvbXBvc2l0ZU1hdGNoZXIodGhpcy5tYXRjaGVycy5jb25jYXQoW21hdGNoZXJdKSlcbiAgfVxuXG4gIHByZXBlbmQobWF0Y2hlcikge1xuICAgIHJldHVybiB0aGlzLmNyZWF0ZUNvbXBvc2l0ZU1hdGNoZXIoW21hdGNoZXJdLmNvbmNhdCh0aGlzLm1hdGNoZXJzKSlcbiAgfVxufVxuXG5cbmNsYXNzIEFuZE1hdGNoZXIgZXh0ZW5kcyBDb21wb3NpdGVNYXRjaGVyIHtcbiAgY29uc3RydWN0b3IobWF0Y2hlcnMgPSBbXSkge1xuICAgIHN1cGVyKG1hdGNoZXJzKVxuICB9XG5cbiAgY3JlYXRlQ29tcG9zaXRlTWF0Y2hlcihtYXRjaGVycykge1xuICAgIHJldHVybiBuZXcgQW5kTWF0Y2hlcihtYXRjaGVycylcbiAgfVxuXG4gIG1hdGNoZXMoaW5wdXQpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVycy5ldmVyeShtYXRjaGVyID0+IG1hdGNoZXIubWF0Y2hlcyhpbnB1dCkpXG4gIH1cbn1cblxuY2xhc3MgT3JNYXRjaGVyIGV4dGVuZHMgQ29tcG9zaXRlTWF0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKG1hdGNoZXJzID0gW10pIHtcbiAgICBzdXBlcihtYXRjaGVycylcbiAgfVxuXG4gIGNyZWF0ZUNvbXBvc2l0ZU1hdGNoZXIobWF0Y2hlcnMpIHtcbiAgICByZXR1cm4gbmV3IE9yTWF0Y2hlcihtYXRjaGVycylcbiAgfVxuXG4gIG1hdGNoZXMoaW5wdXQpIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaGVycy5zb21lKG1hdGNoZXIgPT4gbWF0Y2hlci5tYXRjaGVzKGlucHV0KSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0aCgpIHtcbiAgcmV0dXJuIG5ldyBKc29uUGF0aE1hdGNoZXIoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVxdWVzdCgpIHtcbiAgcmV0dXJuIG5ldyBSZXF1ZXN0TWF0Y2hlcigpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmQoLi4ubWF0Y2hlcnMpIHtcbiAgcmV0dXJuIG5ldyBBbmRNYXRjaGVyKG1hdGNoZXJzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3IoLi4ubWF0Y2hlcnMpIHtcbiAgcmV0dXJuIG5ldyBPck1hdGNoZXIobWF0Y2hlcnMpXG59XG4iXX0=