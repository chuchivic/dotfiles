Object.defineProperty(exports, '__esModule', {
  value: true
});

var _matchers = require('../../matchers');

var _utils = require('../../utils');

'use babel';

var MATCHER = (0, _matchers.or)((0, _matchers.request)().value().path((0, _matchers.path)().key('bin').index()));

var provider = {
  getFileExtensions: function getFileExtensions() {
    return null;
  },

  getStorageType: function getStorageType() {
    return _utils.StorageType.BOTH;
  },

  getMatcher: function getMatcher() {
    return MATCHER;
  },

  getFilePattern: function getFilePattern() {
    return 'composer.json';
  }
};

exports['default'] = provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvY29tcG9zZXIvY29tcG9zZXItanNvbi1hbnktZmlsZS1wcm9wb3NhbC1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O3dCQUVrQyxnQkFBZ0I7O3FCQUN0QixhQUFhOztBQUh6QyxXQUFXLENBQUE7O0FBS1gsSUFBTSxPQUFPLEdBQUcsa0JBQ2Qsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FDbEQsQ0FBQTs7QUFHRCxJQUFNLFFBQVEsR0FBRztBQUNmLG1CQUFpQixFQUFBLDZCQUFHO0FBQ2xCLFdBQU8sSUFBSSxDQUFBO0dBQ1o7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sbUJBQVksSUFBSSxDQUFBO0dBQ3hCOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsZ0JBQWMsRUFBQSwwQkFBRztBQUNmLFdBQU8sZUFBZSxDQUFBO0dBQ3ZCO0NBQ0YsQ0FBQTs7cUJBRWMsUUFBUSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvcHJvdmlkZXJzL2NvbXBvc2VyL2NvbXBvc2VyLWpzb24tYW55LWZpbGUtcHJvcG9zYWwtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyByZXF1ZXN0LCBwYXRoLCBvciB9IGZyb20gJy4uLy4uL21hdGNoZXJzJ1xuaW1wb3J0IHsgU3RvcmFnZVR5cGUgfSBmcm9tICcuLi8uLi91dGlscydcblxuY29uc3QgTUFUQ0hFUiA9IG9yKFxuICByZXF1ZXN0KCkudmFsdWUoKS5wYXRoKHBhdGgoKS5rZXkoJ2JpbicpLmluZGV4KCkpXG4pXG5cblxuY29uc3QgcHJvdmlkZXIgPSB7XG4gIGdldEZpbGVFeHRlbnNpb25zKCkge1xuICAgIHJldHVybiBudWxsXG4gIH0sXG5cbiAgZ2V0U3RvcmFnZVR5cGUoKSB7XG4gICAgcmV0dXJuIFN0b3JhZ2VUeXBlLkJPVEhcbiAgfSxcblxuICBnZXRNYXRjaGVyKCkge1xuICAgIHJldHVybiBNQVRDSEVSXG4gIH0sXG5cbiAgZ2V0RmlsZVBhdHRlcm4oKSB7XG4gICAgcmV0dXJuICdjb21wb3Nlci5qc29uJ1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHByb3ZpZGVyXG4iXX0=