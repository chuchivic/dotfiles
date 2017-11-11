Object.defineProperty(exports, '__esModule', {
  value: true
});

var _matchers = require('../../matchers');

var _utils = require('../../utils');

'use babel';

var MATCHER = (0, _matchers.or)((0, _matchers.request)().value().path((0, _matchers.path)().key('files').index()), (0, _matchers.request)().value().path((0, _matchers.path)().key('man').index()), (0, _matchers.request)().value().path((0, _matchers.path)().key('man')));

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
    return 'package.json';
  }
};

exports['default'] = provider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvcGFja2FnZS9wYWNrYWdlLWpzb24tZmlsZXMtcHJvcG9zYWwtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozt3QkFFa0MsZ0JBQWdCOztxQkFDdEIsYUFBYTs7QUFIekMsV0FBVyxDQUFBOztBQUtYLElBQU0sT0FBTyxHQUFHLGtCQUNkLHdCQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ25ELHdCQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQ2pELHdCQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQzFDLENBQUE7O0FBRUQsSUFBTSxRQUFRLEdBQUc7QUFDZixtQkFBaUIsRUFBQSw2QkFBRztBQUNsQixXQUFPLElBQUksQ0FBQTtHQUNaOztBQUVELGdCQUFjLEVBQUEsMEJBQUc7QUFDZixXQUFPLG1CQUFZLElBQUksQ0FBQTtHQUN4Qjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxXQUFPLE9BQU8sQ0FBQTtHQUNmOztBQUVELGdCQUFjLEVBQUEsMEJBQUc7QUFDZixXQUFPLGNBQWMsQ0FBQTtHQUN0QjtDQUNGLENBQUE7O3FCQUVjLFFBQVEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzb24vc3JjL3Byb3ZpZGVycy9wYWNrYWdlL3BhY2thZ2UtanNvbi1maWxlcy1wcm9wb3NhbC1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IHJlcXVlc3QsIHBhdGgsIG9yIH0gZnJvbSAnLi4vLi4vbWF0Y2hlcnMnXG5pbXBvcnQgeyBTdG9yYWdlVHlwZSB9IGZyb20gJy4uLy4uL3V0aWxzJ1xuXG5jb25zdCBNQVRDSEVSID0gb3IoXG4gIHJlcXVlc3QoKS52YWx1ZSgpLnBhdGgocGF0aCgpLmtleSgnZmlsZXMnKS5pbmRleCgpKSxcbiAgcmVxdWVzdCgpLnZhbHVlKCkucGF0aChwYXRoKCkua2V5KCdtYW4nKS5pbmRleCgpKSxcbiAgcmVxdWVzdCgpLnZhbHVlKCkucGF0aChwYXRoKCkua2V5KCdtYW4nKSlcbilcblxuY29uc3QgcHJvdmlkZXIgPSB7XG4gIGdldEZpbGVFeHRlbnNpb25zKCkge1xuICAgIHJldHVybiBudWxsIC8vIGFueSBmaWxlIGlzIE9LXG4gIH0sXG5cbiAgZ2V0U3RvcmFnZVR5cGUoKSB7XG4gICAgcmV0dXJuIFN0b3JhZ2VUeXBlLkJPVEhcbiAgfSxcblxuICBnZXRNYXRjaGVyKCkge1xuICAgIHJldHVybiBNQVRDSEVSXG4gIH0sXG5cbiAgZ2V0RmlsZVBhdHRlcm4oKSB7XG4gICAgcmV0dXJuICdwYWNrYWdlLmpzb24nXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgcHJvdmlkZXJcbiJdfQ==