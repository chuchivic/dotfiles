Object.defineProperty(exports, '__esModule', {
  value: true
});

var _matchers = require('../../matchers');

var _utils = require('../../utils');

'use babel';

var MATCHER = (0, _matchers.request)().value().path((0, _matchers.path)().key('directories').key());

var provider = {
  getFileExtensions: function getFileExtensions() {
    return null;
  },

  getStorageType: function getStorageType() {
    return _utils.StorageType.FOLDER;
  },

  getMatcher: function getMatcher() {
    return MATCHER;
  },

  getFilePattern: function getFilePattern() {
    return 'package.json';
  }
};

exports['default'] = provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvcGFja2FnZS9wYWNrYWdlLWpzb24tZGlyZWN0b3JpZXMtcHJvcG9zYWwtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt3QkFFOEIsZ0JBQWdCOztxQkFDbEIsYUFBYTs7QUFIekMsV0FBVyxDQUFBOztBQUtYLElBQU0sT0FBTyxHQUFHLHdCQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7O0FBRXZFLElBQU0sUUFBUSxHQUFHO0FBQ2YsbUJBQWlCLEVBQUEsNkJBQUc7QUFDbEIsV0FBTyxJQUFJLENBQUE7R0FDWjs7QUFFRCxnQkFBYyxFQUFBLDBCQUFHO0FBQ2YsV0FBTyxtQkFBWSxNQUFNLENBQUE7R0FDMUI7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsV0FBTyxPQUFPLENBQUE7R0FDZjs7QUFFRCxnQkFBYyxFQUFBLDBCQUFHO0FBQ2YsV0FBTyxjQUFjLENBQUE7R0FDdEI7Q0FDRixDQUFBOztxQkFFYyxRQUFRIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvcGFja2FnZS9wYWNrYWdlLWpzb24tZGlyZWN0b3JpZXMtcHJvcG9zYWwtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyByZXF1ZXN0LCBwYXRoIH0gZnJvbSAnLi4vLi4vbWF0Y2hlcnMnXG5pbXBvcnQgeyBTdG9yYWdlVHlwZSB9IGZyb20gJy4uLy4uL3V0aWxzJ1xuXG5jb25zdCBNQVRDSEVSID0gcmVxdWVzdCgpLnZhbHVlKCkucGF0aChwYXRoKCkua2V5KCdkaXJlY3RvcmllcycpLmtleSgpKVxuXG5jb25zdCBwcm92aWRlciA9IHtcbiAgZ2V0RmlsZUV4dGVuc2lvbnMoKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfSxcblxuICBnZXRTdG9yYWdlVHlwZSgpIHtcbiAgICByZXR1cm4gU3RvcmFnZVR5cGUuRk9MREVSXG4gIH0sXG5cbiAgZ2V0TWF0Y2hlcigpIHtcbiAgICByZXR1cm4gTUFUQ0hFUlxuICB9LFxuXG4gIGdldEZpbGVQYXR0ZXJuKCkge1xuICAgIHJldHVybiAncGFja2FnZS5qc29uJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByb3ZpZGVyXG4iXX0=