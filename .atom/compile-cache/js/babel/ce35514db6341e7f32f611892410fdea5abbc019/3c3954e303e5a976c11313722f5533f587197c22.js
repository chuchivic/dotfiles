Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _lodashAssign = require('lodash/assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _lodashTrimStart = require('lodash/trimStart');

var _lodashTrimStart2 = _interopRequireDefault(_lodashTrimStart);

var _matchers = require('../../matchers');

var _packagistPackageLookup = require('packagist-package-lookup');

'use babel';

var DEPENDENCY_PROPERTIES = ['require', 'require-dev'];

var KEY_MATCHER = (0, _matchers.request)().key().path((0, _matchers.path)().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = (0, _matchers.request)().value().path((0, _matchers.path)().key(DEPENDENCY_PROPERTIES).key());

exports['default'] = {
  search: _packagistPackageLookup.searchByName,
  versions: function versions(name) {
    return (0, _packagistPackageLookup.versions)(name, { sort: 'DESC', stable: true }).then(function (vers) {
      return vers.map(function (v) {
        return (0, _lodashTrimStart2['default'])(v, 'v');
      });
    });
  },
  dependencyRequestMatcher: function dependencyRequestMatcher() {
    return KEY_MATCHER;
  },
  versionRequestMatcher: function versionRequestMatcher() {
    return VALUE_MATCHER;
  },
  getFilePattern: function getFilePattern() {
    return 'composer.json';
  },
  getDependencyFilter: function getDependencyFilter(req) {
    var contents = req.contents;

    if (!contents) {
      return function () {
        return true;
      };
    }
    var objects = DEPENDENCY_PROPERTIES.map(function (prop) {
      return contents[prop] || {};
    });
    var merged = _lodashAssign2['default'].apply(undefined, _toConsumableArray(objects)) || {};
    return function (dependency) {
      return !merged.hasOwnProperty(dependency);
    };
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvY29tcG9zZXIvY29tcG9zZXItanNvbi1kZXBlbmRlbmN5LWNvbmZpZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs0QkFFbUIsZUFBZTs7OzsrQkFDWixrQkFBa0I7Ozs7d0JBRVYsZ0JBQWdCOztzQ0FFUCwwQkFBMEI7O0FBUGpFLFdBQVcsQ0FBQTs7QUFTWCxJQUFNLHFCQUFxQixHQUFHLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFBOztBQUV4RCxJQUFNLFdBQVcsR0FBRyx3QkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUE7QUFDM0UsSUFBTSxhQUFhLEdBQUcsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBOztxQkFFdEU7QUFDYixRQUFNLHNDQUFjO0FBQ3BCLFVBQVEsRUFBQSxrQkFBQyxJQUFJLEVBQUU7QUFDYixXQUFPLHNDQUFTLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTthQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksa0NBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztPQUFBLENBQUM7S0FBQSxDQUFDLENBQUE7R0FDckc7QUFDRCwwQkFBd0IsRUFBQSxvQ0FBRztBQUN6QixXQUFPLFdBQVcsQ0FBQTtHQUNuQjtBQUNELHVCQUFxQixFQUFBLGlDQUFHO0FBQ3RCLFdBQU8sYUFBYSxDQUFBO0dBQ3JCO0FBQ0QsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sZUFBZSxDQUFBO0dBQ3ZCO0FBQ0QscUJBQW1CLEVBQUEsNkJBQUMsR0FBRyxFQUFFO1FBQ2hCLFFBQVEsR0FBSSxHQUFHLENBQWYsUUFBUTs7QUFDZixRQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsYUFBTztlQUFNLElBQUk7T0FBQSxDQUFBO0tBQ2xCO0FBQ0QsUUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTthQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0tBQUEsQ0FBQyxDQUFBO0FBQ3ZFLFFBQU0sTUFBTSxHQUFHLDhEQUFVLE9BQU8sRUFBQyxJQUFJLEVBQUUsQ0FBQTtBQUN2QyxXQUFPLFVBQUEsVUFBVTthQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUM7S0FBQSxDQUFBO0dBQ3hEO0NBQ0YiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzb24vc3JjL3Byb3ZpZGVycy9jb21wb3Nlci9jb21wb3Nlci1qc29uLWRlcGVuZGVuY3ktY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGFzc2lnbiBmcm9tICdsb2Rhc2gvYXNzaWduJ1xuaW1wb3J0IHRyaW1TdGFydCBmcm9tICdsb2Rhc2gvdHJpbVN0YXJ0J1xuXG5pbXBvcnQgeyBwYXRoLCByZXF1ZXN0IH0gZnJvbSAnLi4vLi4vbWF0Y2hlcnMnXG5cbmltcG9ydCB7IHNlYXJjaEJ5TmFtZSwgdmVyc2lvbnMgfSBmcm9tICdwYWNrYWdpc3QtcGFja2FnZS1sb29rdXAnXG5cbmNvbnN0IERFUEVOREVOQ1lfUFJPUEVSVElFUyA9IFsncmVxdWlyZScsICdyZXF1aXJlLWRldiddXG5cbmNvbnN0IEtFWV9NQVRDSEVSID0gcmVxdWVzdCgpLmtleSgpLnBhdGgocGF0aCgpLmtleShERVBFTkRFTkNZX1BST1BFUlRJRVMpKVxuY29uc3QgVkFMVUVfTUFUQ0hFUiA9IHJlcXVlc3QoKS52YWx1ZSgpLnBhdGgocGF0aCgpLmtleShERVBFTkRFTkNZX1BST1BFUlRJRVMpLmtleSgpKVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHNlYXJjaDogc2VhcmNoQnlOYW1lLFxuICB2ZXJzaW9ucyhuYW1lKSB7XG4gICAgcmV0dXJuIHZlcnNpb25zKG5hbWUsIHsgc29ydDogJ0RFU0MnLCBzdGFibGU6IHRydWUgfSkudGhlbih2ZXJzID0+IHZlcnMubWFwKHYgPT4gdHJpbVN0YXJ0KHYsICd2JykpKVxuICB9LFxuICBkZXBlbmRlbmN5UmVxdWVzdE1hdGNoZXIoKSB7XG4gICAgcmV0dXJuIEtFWV9NQVRDSEVSXG4gIH0sXG4gIHZlcnNpb25SZXF1ZXN0TWF0Y2hlcigpIHtcbiAgICByZXR1cm4gVkFMVUVfTUFUQ0hFUlxuICB9LFxuICBnZXRGaWxlUGF0dGVybigpIHtcbiAgICByZXR1cm4gJ2NvbXBvc2VyLmpzb24nXG4gIH0sXG4gIGdldERlcGVuZGVuY3lGaWx0ZXIocmVxKSB7XG4gICAgY29uc3Qge2NvbnRlbnRzfSA9IHJlcVxuICAgIGlmICghY29udGVudHMpIHtcbiAgICAgIHJldHVybiAoKSA9PiB0cnVlXG4gICAgfVxuICAgIGNvbnN0IG9iamVjdHMgPSBERVBFTkRFTkNZX1BST1BFUlRJRVMubWFwKHByb3AgPT4gY29udGVudHNbcHJvcF0gfHwge30pXG4gICAgY29uc3QgbWVyZ2VkID0gYXNzaWduKC4uLm9iamVjdHMpIHx8IHt9XG4gICAgcmV0dXJuIGRlcGVuZGVuY3kgPT4gIW1lcmdlZC5oYXNPd25Qcm9wZXJ0eShkZXBlbmRlbmN5KVxuICB9XG59XG4iXX0=