Object.defineProperty(exports, '__esModule', {
  value: true
});

var _matchers = require('../../matchers');

var _utils = require('../../utils');

'use babel';

var MATCHER = (0, _matchers.or)((0, _matchers.request)().value().path((0, _matchers.path)().key('ignore').index()), (0, _matchers.request)().value().path((0, _matchers.path)().key('ignore')), (0, _matchers.request)().value().path((0, _matchers.path)().key('main').index()), (0, _matchers.request)().value().path((0, _matchers.path)().key('main')));

var provider = {
  getFileExtensions: function getFileExtensions() {
    return null; // any file is OK
  },

  getStorageType: function getStorageType() {
    return _utils.StorageType.BOTH;
  },

  getMatcher: function getMatcher() {
    return MATCHER;
  },

  getFilePattern: function getFilePattern() {
    return 'bower.json';
  }
};

exports['default'] = provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvYm93ZXIvYm93ZXItanNvbi1maWxlcy1wcm9wb3NhbC1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3dCQUVrQyxnQkFBZ0I7O3FCQUN0QixhQUFhOztBQUh6QyxXQUFXLENBQUE7O0FBS1gsSUFBTSxPQUFPLEdBQUcsa0JBQ2Qsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDcEQsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDNUMsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDbEQsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FDM0MsQ0FBQTs7QUFFRCxJQUFNLFFBQVEsR0FBRztBQUNmLG1CQUFpQixFQUFBLDZCQUFHO0FBQ2xCLFdBQU8sSUFBSSxDQUFBO0dBQ1o7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sbUJBQVksSUFBSSxDQUFBO0dBQ3hCOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sWUFBWSxDQUFBO0dBQ3BCO0NBQ0YsQ0FBQTs7cUJBRWMsUUFBUSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvcHJvdmlkZXJzL2Jvd2VyL2Jvd2VyLWpzb24tZmlsZXMtcHJvcG9zYWwtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyByZXF1ZXN0LCBwYXRoLCBvciB9IGZyb20gJy4uLy4uL21hdGNoZXJzJ1xuaW1wb3J0IHsgU3RvcmFnZVR5cGUgfSBmcm9tICcuLi8uLi91dGlscydcblxuY29uc3QgTUFUQ0hFUiA9IG9yKFxuICByZXF1ZXN0KCkudmFsdWUoKS5wYXRoKHBhdGgoKS5rZXkoJ2lnbm9yZScpLmluZGV4KCkpLFxuICByZXF1ZXN0KCkudmFsdWUoKS5wYXRoKHBhdGgoKS5rZXkoJ2lnbm9yZScpKSxcbiAgcmVxdWVzdCgpLnZhbHVlKCkucGF0aChwYXRoKCkua2V5KCdtYWluJykuaW5kZXgoKSksXG4gIHJlcXVlc3QoKS52YWx1ZSgpLnBhdGgocGF0aCgpLmtleSgnbWFpbicpKVxuKVxuXG5jb25zdCBwcm92aWRlciA9IHtcbiAgZ2V0RmlsZUV4dGVuc2lvbnMoKSB7XG4gICAgcmV0dXJuIG51bGwgLy8gYW55IGZpbGUgaXMgT0tcbiAgfSxcblxuICBnZXRTdG9yYWdlVHlwZSgpIHtcbiAgICByZXR1cm4gU3RvcmFnZVR5cGUuQk9USFxuICB9LFxuXG4gIGdldE1hdGNoZXIoKSB7XG4gICAgcmV0dXJuIE1BVENIRVJcbiAgfSxcblxuICBnZXRGaWxlUGF0dGVybigpIHtcbiAgICByZXR1cm4gJ2Jvd2VyLmpzb24nXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJvdmlkZXJcbiJdfQ==