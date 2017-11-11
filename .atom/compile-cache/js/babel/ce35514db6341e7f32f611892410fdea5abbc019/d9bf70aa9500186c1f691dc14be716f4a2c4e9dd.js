Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _uriJs = require('uri-js');

var _uriJs2 = _interopRequireDefault(_uriJs);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _lodashTrimStart = require('lodash/trimStart');

var _lodashTrimStart2 = _interopRequireDefault(_lodashTrimStart);

var _lodashMemoize = require('lodash/memoize');

var _lodashMemoize2 = _interopRequireDefault(_lodashMemoize);

var _lodashOmit = require('lodash/omit');

var _lodashOmit2 = _interopRequireDefault(_lodashOmit);

'use babel';

var loadFileSchema = function loadFileSchema(uri) {
  return new Promise(function (resolve, reject) {
    var path = _os2['default'].platform() === 'win32' ? (0, _lodashTrimStart2['default'])(uri.path, '/') : uri.path;
    _fs2['default'].readFile(path, 'UTF-8', /* TODO think about detecting this */function (error, data) {
      if (error) {
        reject(error);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      }
    });
  });
};

exports.loadFileSchema = loadFileSchema;
var loadHttpSchema = function loadHttpSchema(uri) {
  var url = _uriJs2['default'].serialize((0, _lodashOmit2['default'])(uri, ['fragment']));
  return _axios2['default'].get(url).then(function (response) {
    return response.data;
  });
};

exports.loadHttpSchema = loadHttpSchema;
var anySchemaLoader = function anySchemaLoader(uri) {
  switch (uri.scheme) {
    case 'file':
      return loadFileSchema(uri);
    case 'http':
      return loadHttpSchema(uri);
    default:
      throw new Error('Unknown URI format ' + JSON.stringify(uri));
  }
};

exports.anySchemaLoader = anySchemaLoader;
var loadSchema = (0, _lodashMemoize2['default'])(function (uri) {
  return anySchemaLoader(_uriJs2['default'].parse(uri));
});
exports.loadSchema = loadSchema;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1sb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tCQUVlLElBQUk7Ozs7a0JBQ0osSUFBSTs7OztxQkFDRCxRQUFROzs7O3FCQUNSLE9BQU87Ozs7K0JBQ0gsa0JBQWtCOzs7OzZCQUNwQixnQkFBZ0I7Ozs7MEJBQ25CLGFBQWE7Ozs7QUFSOUIsV0FBVyxDQUFBOztBQVVKLElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBRyxHQUFHO1NBQUksSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3BFLFFBQU0sSUFBSSxHQUFHLGdCQUFHLFFBQVEsRUFBRSxLQUFLLE9BQU8sR0FBRyxrQ0FBVSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUE7QUFDNUUsb0JBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLHVDQUF1QyxVQUFDLEtBQUssRUFBRSxJQUFJLEVBQUs7QUFDL0UsVUFBSSxLQUFLLEVBQUU7QUFDVCxjQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDZCxNQUFNO0FBQ0wsWUFBSTtBQUNGLGlCQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO1NBQzFCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixnQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ1Y7T0FDRjtLQUNGLENBQUMsQ0FBQTtHQUNILENBQUM7Q0FBQSxDQUFBOzs7QUFFSyxJQUFNLGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUcsR0FBRyxFQUFJO0FBQ25DLE1BQU0sR0FBRyxHQUFHLG1CQUFNLFNBQVMsQ0FBQyw2QkFBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDcEQsU0FBTyxtQkFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtXQUFJLFFBQVEsQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFBO0NBQ3RELENBQUE7OztBQUVNLElBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBRyxHQUFHLEVBQUk7QUFDcEMsVUFBUSxHQUFHLENBQUMsTUFBTTtBQUNoQixTQUFLLE1BQU07QUFBRSxhQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUFBLEFBQ3ZDLFNBQUssTUFBTTtBQUFFLGFBQU8sY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQUEsQUFDdkM7QUFBUyxZQUFNLElBQUksS0FBSyx5QkFBdUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFBO0FBQUEsR0FDdEU7Q0FDRixDQUFBOzs7QUFFTSxJQUFNLFVBQVUsR0FBRyxnQ0FBUSxVQUFBLEdBQUc7U0FBSSxlQUFlLENBQUMsbUJBQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQUEsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1sb2FkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5pbXBvcnQgdXJpSnMgZnJvbSAndXJpLWpzJ1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xuaW1wb3J0IHRyaW1TdGFydCBmcm9tICdsb2Rhc2gvdHJpbVN0YXJ0J1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnbG9kYXNoL21lbW9pemUnXG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCdcblxuZXhwb3J0IGNvbnN0IGxvYWRGaWxlU2NoZW1hID0gdXJpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgY29uc3QgcGF0aCA9IG9zLnBsYXRmb3JtKCkgPT09ICd3aW4zMicgPyB0cmltU3RhcnQodXJpLnBhdGgsICcvJykgOiB1cmkucGF0aFxuICBmcy5yZWFkRmlsZShwYXRoLCAnVVRGLTgnLCAvKiBUT0RPIHRoaW5rIGFib3V0IGRldGVjdGluZyB0aGlzICovKGVycm9yLCBkYXRhKSA9PiB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShkYXRhKSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGUpXG4gICAgICB9XG4gICAgfVxuICB9KVxufSlcblxuZXhwb3J0IGNvbnN0IGxvYWRIdHRwU2NoZW1hID0gdXJpID0+IHtcbiAgY29uc3QgdXJsID0gdXJpSnMuc2VyaWFsaXplKG9taXQodXJpLCBbJ2ZyYWdtZW50J10pKVxuICByZXR1cm4gYXhpb3MuZ2V0KHVybCkudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5kYXRhKVxufVxuXG5leHBvcnQgY29uc3QgYW55U2NoZW1hTG9hZGVyID0gdXJpID0+IHtcbiAgc3dpdGNoICh1cmkuc2NoZW1lKSB7XG4gICAgY2FzZSAnZmlsZSc6IHJldHVybiBsb2FkRmlsZVNjaGVtYSh1cmkpXG4gICAgY2FzZSAnaHR0cCc6IHJldHVybiBsb2FkSHR0cFNjaGVtYSh1cmkpXG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIFVSSSBmb3JtYXQgJHtKU09OLnN0cmluZ2lmeSh1cmkpfWApXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGxvYWRTY2hlbWEgPSBtZW1vaXplKHVyaSA9PiBhbnlTY2hlbWFMb2FkZXIodXJpSnMucGFyc2UodXJpKSkpXG4iXX0=