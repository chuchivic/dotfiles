Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _lodashAssign = require('lodash/assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _npmPackageLookup = require('npm-package-lookup');

var _matchers = require('../../matchers');

'use babel';

var DEPENDENCY_PROPERTIES = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
var KEY_MATCHER = (0, _matchers.request)().key().path((0, _matchers.path)().key(DEPENDENCY_PROPERTIES));
var VALUE_MATCHER = (0, _matchers.request)().value().path((0, _matchers.path)().key(DEPENDENCY_PROPERTIES).key());

exports['default'] = {
  versions: function versions(name) {
    return (0, _npmPackageLookup.versions)(name, { sort: 'DESC', stable: true });
  },

  search: function search(prefix) {
    return (0, _npmPackageLookup.search)(prefix).then(function (results) {
      return results.map(function (name) {
        return { name: name };
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
    return 'package.json';
  },

  isAvailable: function isAvailable() {
    return false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvcGFja2FnZS9wYWNrYWdlLWpzb24tZGVwZW5kZW5jeS1jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7NEJBRW1CLGVBQWU7Ozs7Z0NBQ0Qsb0JBQW9COzt3QkFFdkIsZ0JBQWdCOztBQUw5QyxXQUFXLENBQUE7O0FBT1gsSUFBTSxxQkFBcUIsR0FBRyxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFBO0FBQzdHLElBQU0sV0FBVyxHQUFHLHdCQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFNLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQTtBQUMzRSxJQUFNLGFBQWEsR0FBRyx3QkFBUyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7O3FCQUV0RTtBQUNiLFVBQVEsRUFBQSxrQkFBQyxJQUFJLEVBQUU7QUFDYixXQUFPLGdDQUFTLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7R0FDdEQ7O0FBRUQsUUFBTSxFQUFBLGdCQUFDLE1BQU0sRUFBRTtBQUNiLFdBQU8sOEJBQU8sTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTzthQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQUssRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFO09BQUMsQ0FBQztLQUFBLENBQUMsQ0FBQTtHQUN2RTs7QUFFRCwwQkFBd0IsRUFBQSxvQ0FBRztBQUN6QixXQUFPLFdBQVcsQ0FBQTtHQUNuQjs7QUFFRCx1QkFBcUIsRUFBQSxpQ0FBRztBQUN0QixXQUFPLGFBQWEsQ0FBQTtHQUNyQjs7QUFFRCxnQkFBYyxFQUFBLDBCQUFHO0FBQ2YsV0FBTyxjQUFjLENBQUE7R0FDdEI7O0FBRUQsYUFBVyxFQUFBLHVCQUFHO0FBQ1osV0FBTyxLQUFLLENBQUE7R0FDYjs7QUFFRCxxQkFBbUIsRUFBQSw2QkFBQyxHQUFHLEVBQUU7UUFDaEIsUUFBUSxHQUFJLEdBQUcsQ0FBZixRQUFROztBQUNmLFFBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixhQUFPO2VBQU0sSUFBSTtPQUFBLENBQUE7S0FDbEI7QUFDRCxRQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2FBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7S0FBQSxDQUFDLENBQUE7QUFDdkUsUUFBTSxNQUFNLEdBQUcsOERBQVUsT0FBTyxFQUFDLElBQUksRUFBRSxDQUFBO0FBQ3ZDLFdBQU8sVUFBQSxVQUFVO2FBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQztLQUFBLENBQUE7R0FDeEQ7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvcHJvdmlkZXJzL3BhY2thZ2UvcGFja2FnZS1qc29uLWRlcGVuZGVuY3ktY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGFzc2lnbiBmcm9tICdsb2Rhc2gvYXNzaWduJ1xuaW1wb3J0IHsgc2VhcmNoLCB2ZXJzaW9ucyB9IGZyb20gJ25wbS1wYWNrYWdlLWxvb2t1cCdcblxuaW1wb3J0IHsgcGF0aCwgcmVxdWVzdCB9IGZyb20gJy4uLy4uL21hdGNoZXJzJ1xuXG5jb25zdCBERVBFTkRFTkNZX1BST1BFUlRJRVMgPSBbJ2RlcGVuZGVuY2llcycsICdkZXZEZXBlbmRlbmNpZXMnLCAnb3B0aW9uYWxEZXBlbmRlbmNpZXMnLCAncGVlckRlcGVuZGVuY2llcyddXG5jb25zdCBLRVlfTUFUQ0hFUiA9IHJlcXVlc3QoKS5rZXkoKS5wYXRoKHBhdGgoKS5rZXkoREVQRU5ERU5DWV9QUk9QRVJUSUVTKSlcbmNvbnN0IFZBTFVFX01BVENIRVIgPSByZXF1ZXN0KCkudmFsdWUoKS5wYXRoKHBhdGgoKS5rZXkoREVQRU5ERU5DWV9QUk9QRVJUSUVTKS5rZXkoKSlcblxuZXhwb3J0IGRlZmF1bHQge1xuICB2ZXJzaW9ucyhuYW1lKSB7XG4gICAgcmV0dXJuIHZlcnNpb25zKG5hbWUsIHsgc29ydDogJ0RFU0MnLCBzdGFibGU6IHRydWUgfSlcbiAgfSxcblxuICBzZWFyY2gocHJlZml4KSB7XG4gICAgcmV0dXJuIHNlYXJjaChwcmVmaXgpLnRoZW4ocmVzdWx0cyA9PiByZXN1bHRzLm1hcChuYW1lID0+ICh7IG5hbWUgfSkpKVxuICB9LFxuXG4gIGRlcGVuZGVuY3lSZXF1ZXN0TWF0Y2hlcigpIHtcbiAgICByZXR1cm4gS0VZX01BVENIRVJcbiAgfSxcblxuICB2ZXJzaW9uUmVxdWVzdE1hdGNoZXIoKSB7XG4gICAgcmV0dXJuIFZBTFVFX01BVENIRVJcbiAgfSxcblxuICBnZXRGaWxlUGF0dGVybigpIHtcbiAgICByZXR1cm4gJ3BhY2thZ2UuanNvbidcbiAgfSxcblxuICBpc0F2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBnZXREZXBlbmRlbmN5RmlsdGVyKHJlcSkge1xuICAgIGNvbnN0IHtjb250ZW50c30gPSByZXFcbiAgICBpZiAoIWNvbnRlbnRzKSB7XG4gICAgICByZXR1cm4gKCkgPT4gdHJ1ZVxuICAgIH1cbiAgICBjb25zdCBvYmplY3RzID0gREVQRU5ERU5DWV9QUk9QRVJUSUVTLm1hcChwcm9wID0+IGNvbnRlbnRzW3Byb3BdIHx8IHt9KVxuICAgIGNvbnN0IG1lcmdlZCA9IGFzc2lnbiguLi5vYmplY3RzKSB8fCB7fVxuICAgIHJldHVybiBkZXBlbmRlbmN5ID0+ICFtZXJnZWQuaGFzT3duUHJvcGVydHkoZGVwZW5kZW5jeSlcbiAgfVxufVxuIl19