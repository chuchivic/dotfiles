Object.defineProperty(exports, '__esModule', {
  value: true
});

var _matchers = require('../../matchers');

var _utils = require('../../utils');

'use babel';

var MATCHER = (0, _matchers.or)((0, _matchers.request)().value().path((0, _matchers.path)().key('files').index()), (0, _matchers.request)().value().path((0, _matchers.path)().key('exclude').index()));

var provider = {
  getFileExtensions: function getFileExtensions() {
    return ['.ts', '.tsx'];
  },

  getStorageType: function getStorageType() {
    return _utils.StorageType.BOTH;
  },

  getMatcher: function getMatcher() {
    return MATCHER;
  },

  getFilePattern: function getFilePattern() {
    return 'tsconfig.json';
  }
};

exports['default'] = provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvdHNjb25maWcvdHNjb25maWctanNvbi1maWxlcy1wcm9wb3NhbC1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3dCQUVrQyxnQkFBZ0I7O3FCQUN0QixhQUFhOztBQUh6QyxXQUFXLENBQUE7O0FBS1gsSUFBTSxPQUFPLEdBQUcsa0JBQ2Qsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFDbkQsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FDdEQsQ0FBQTs7QUFFRCxJQUFNLFFBQVEsR0FBRztBQUNmLG1CQUFpQixFQUFBLDZCQUFHO0FBQ2xCLFdBQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDdkI7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sbUJBQVksSUFBSSxDQUFBO0dBQ3hCOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sZUFBZSxDQUFBO0dBQ3ZCO0NBQ0YsQ0FBQTs7cUJBRWMsUUFBUSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvcHJvdmlkZXJzL3RzY29uZmlnL3RzY29uZmlnLWpzb24tZmlsZXMtcHJvcG9zYWwtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyByZXF1ZXN0LCBwYXRoLCBvciB9IGZyb20gJy4uLy4uL21hdGNoZXJzJ1xuaW1wb3J0IHsgU3RvcmFnZVR5cGUgfSBmcm9tICcuLi8uLi91dGlscydcblxuY29uc3QgTUFUQ0hFUiA9IG9yKFxuICByZXF1ZXN0KCkudmFsdWUoKS5wYXRoKHBhdGgoKS5rZXkoJ2ZpbGVzJykuaW5kZXgoKSksXG4gIHJlcXVlc3QoKS52YWx1ZSgpLnBhdGgocGF0aCgpLmtleSgnZXhjbHVkZScpLmluZGV4KCkpXG4pXG5cbmNvbnN0IHByb3ZpZGVyID0ge1xuICBnZXRGaWxlRXh0ZW5zaW9ucygpIHtcbiAgICByZXR1cm4gWycudHMnLCAnLnRzeCddXG4gIH0sXG5cbiAgZ2V0U3RvcmFnZVR5cGUoKSB7XG4gICAgcmV0dXJuIFN0b3JhZ2VUeXBlLkJPVEhcbiAgfSxcblxuICBnZXRNYXRjaGVyKCkge1xuICAgIHJldHVybiBNQVRDSEVSXG4gIH0sXG5cbiAgZ2V0RmlsZVBhdHRlcm4oKSB7XG4gICAgcmV0dXJuICd0c2NvbmZpZy5qc29uJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByb3ZpZGVyXG4iXX0=