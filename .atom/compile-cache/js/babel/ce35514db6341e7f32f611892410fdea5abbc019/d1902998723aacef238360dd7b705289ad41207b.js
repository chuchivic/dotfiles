Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashStartsWith = require('lodash/startsWith');

var _lodashStartsWith2 = _interopRequireDefault(_lodashStartsWith);

var _matchers = require('../../matchers');

var _npmPackageLookup = require('npm-package-lookup');

'use babel';

var PLUGINS = 'plugins';
var BABEL_PLUGIN = 'babel-plugin-';

var PRESET_MATCHER = (0, _matchers.request)().value().path((0, _matchers.path)().key(PLUGINS).index());

var BabelRCPluginsProposalProvider = (function () {
  function BabelRCPluginsProposalProvider() {
    _classCallCheck(this, BabelRCPluginsProposalProvider);
  }

  _createClass(BabelRCPluginsProposalProvider, [{
    key: 'getProposals',
    value: function getProposals(req) {
      var _this = this;

      var contents = req.contents;
      var prefix = req.prefix;
      var isBetweenQuotes = req.isBetweenQuotes;
      var shouldAddComma = req.shouldAddComma;

      if (PRESET_MATCHER.matches(req)) {
        var _ret = (function () {
          var plugins = contents[PLUGINS] || [];
          var results = (0, _npmPackageLookup.search)(_this.calculateSearchKeyword(prefix));
          return {
            v: results.then(function (names) {
              return names.filter(function (name) {
                return plugins.indexOf(name.replace(BABEL_PLUGIN, '')) < 0;
              }).map(function (pluginName) {
                var name = pluginName.replace(BABEL_PLUGIN, '');
                var proposal = {};
                proposal.displayText = name;
                proposal.rightLabel = 'plugin';
                proposal.type = 'plugin';
                proposal.description = name + ' babel plugin. Required dependency in package.json: ' + pluginName;
                if (isBetweenQuotes) {
                  proposal.text = name;
                } else {
                  proposal.snippet = '"' + name + '"' + (shouldAddComma ? ',' : '');
                }
                return proposal;
              });
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
      return Promise.resolve([]);
    }
  }, {
    key: 'calculateSearchKeyword',
    value: function calculateSearchKeyword(prefix) {
      if ((0, _lodashStartsWith2['default'])(BABEL_PLUGIN, prefix)) {
        return BABEL_PLUGIN;
      } else if ((0, _lodashStartsWith2['default'])(prefix, BABEL_PLUGIN)) {
        return prefix;
      }
      return BABEL_PLUGIN + prefix;
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return '.babelrc';
    }
  }]);

  return BabelRCPluginsProposalProvider;
})();

exports['default'] = BabelRCPluginsProposalProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvYmFiZWxyYy9iYWJlbHJjLXBsdWdpbnMtcHJvcG9zYWwtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztnQ0FFdUIsbUJBQW1COzs7O3dCQUVaLGdCQUFnQjs7Z0NBQ3ZCLG9CQUFvQjs7QUFMM0MsV0FBVyxDQUFBOztBQU9YLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQTtBQUN6QixJQUFNLFlBQVksR0FBRyxlQUFlLENBQUE7O0FBRXBDLElBQU0sY0FBYyxHQUFHLHdCQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7O0lBRXJELDhCQUE4QjtXQUE5Qiw4QkFBOEI7MEJBQTlCLDhCQUE4Qjs7O2VBQTlCLDhCQUE4Qjs7V0FDckMsc0JBQUMsR0FBRyxFQUFFOzs7VUFDUixRQUFRLEdBQTZDLEdBQUcsQ0FBeEQsUUFBUTtVQUFFLE1BQU0sR0FBcUMsR0FBRyxDQUE5QyxNQUFNO1VBQUUsZUFBZSxHQUFvQixHQUFHLENBQXRDLGVBQWU7VUFBRSxjQUFjLEdBQUksR0FBRyxDQUFyQixjQUFjOztBQUN6RCxVQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7O0FBQy9CLGNBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDdkMsY0FBTSxPQUFPLEdBQUcsOEJBQU8sTUFBSyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQzNEO2VBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLEtBQUs7cUJBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7dUJBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUM7ZUFBQSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQ3ZILG9CQUFNLElBQUksR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNqRCxvQkFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ25CLHdCQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtBQUMzQix3QkFBUSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUE7QUFDOUIsd0JBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLHdCQUFRLENBQUMsV0FBVyxHQUFNLElBQUksNERBQXVELFVBQVUsQUFBRSxDQUFBO0FBQ2pHLG9CQUFJLGVBQWUsRUFBRTtBQUNuQiwwQkFBUSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7aUJBQ3JCLE1BQU07QUFDTCwwQkFBUSxDQUFDLE9BQU8sU0FBTyxJQUFJLFVBQUksY0FBYyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUEsQUFBRSxDQUFBO2lCQUMzRDtBQUNELHVCQUFPLFFBQVEsQ0FBQTtlQUNoQixDQUFDO2FBQUEsQ0FBQztZQUFBOzs7O09BQ0o7QUFDRCxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDM0I7OztXQUVxQixnQ0FBQyxNQUFNLEVBQUU7QUFDN0IsVUFBSSxtQ0FBVyxZQUFZLEVBQUUsTUFBTSxDQUFDLEVBQUU7QUFDcEMsZUFBTyxZQUFZLENBQUE7T0FDcEIsTUFBTSxJQUFJLG1DQUFXLE1BQU0sRUFBRSxZQUFZLENBQUMsRUFBRTtBQUMzQyxlQUFPLE1BQU0sQ0FBQTtPQUNkO0FBQ0QsYUFBTyxZQUFZLEdBQUcsTUFBTSxDQUFBO0tBRTdCOzs7V0FFYSwwQkFBRztBQUNmLGFBQU8sVUFBVSxDQUFBO0tBQ2xCOzs7U0FwQ2tCLDhCQUE4Qjs7O3FCQUE5Qiw4QkFBOEIiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzb24vc3JjL3Byb3ZpZGVycy9iYWJlbHJjL2JhYmVscmMtcGx1Z2lucy1wcm9wb3NhbC1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBzdGFydHNXaXRoIGZyb20gJ2xvZGFzaC9zdGFydHNXaXRoJ1xuXG5pbXBvcnQgeyBwYXRoLCByZXF1ZXN0IH0gZnJvbSAnLi4vLi4vbWF0Y2hlcnMnXG5pbXBvcnQgeyBzZWFyY2ggfSBmcm9tICducG0tcGFja2FnZS1sb29rdXAnXG5cbmNvbnN0IFBMVUdJTlMgPSAncGx1Z2lucydcbmNvbnN0IEJBQkVMX1BMVUdJTiA9ICdiYWJlbC1wbHVnaW4tJ1xuXG5jb25zdCBQUkVTRVRfTUFUQ0hFUiA9IHJlcXVlc3QoKS52YWx1ZSgpLnBhdGgocGF0aCgpLmtleShQTFVHSU5TKS5pbmRleCgpKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWJlbFJDUGx1Z2luc1Byb3Bvc2FsUHJvdmlkZXIge1xuICBnZXRQcm9wb3NhbHMocmVxKSB7XG4gICAgY29uc3QgeyBjb250ZW50cywgcHJlZml4LCBpc0JldHdlZW5RdW90ZXMsIHNob3VsZEFkZENvbW1hfSA9IHJlcVxuICAgIGlmIChQUkVTRVRfTUFUQ0hFUi5tYXRjaGVzKHJlcSkpIHtcbiAgICAgIGNvbnN0IHBsdWdpbnMgPSBjb250ZW50c1tQTFVHSU5TXSB8fCBbXVxuICAgICAgY29uc3QgcmVzdWx0cyA9IHNlYXJjaCh0aGlzLmNhbGN1bGF0ZVNlYXJjaEtleXdvcmQocHJlZml4KSlcbiAgICAgIHJldHVybiByZXN1bHRzLnRoZW4obmFtZXMgPT4gbmFtZXMuZmlsdGVyKG5hbWUgPT4gcGx1Z2lucy5pbmRleE9mKG5hbWUucmVwbGFjZShCQUJFTF9QTFVHSU4sICcnKSkgPCAwKS5tYXAocGx1Z2luTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBwbHVnaW5OYW1lLnJlcGxhY2UoQkFCRUxfUExVR0lOLCAnJylcbiAgICAgICAgY29uc3QgcHJvcG9zYWwgPSB7fVxuICAgICAgICBwcm9wb3NhbC5kaXNwbGF5VGV4dCA9IG5hbWVcbiAgICAgICAgcHJvcG9zYWwucmlnaHRMYWJlbCA9ICdwbHVnaW4nXG4gICAgICAgIHByb3Bvc2FsLnR5cGUgPSAncGx1Z2luJ1xuICAgICAgICBwcm9wb3NhbC5kZXNjcmlwdGlvbiA9IGAke25hbWV9IGJhYmVsIHBsdWdpbi4gUmVxdWlyZWQgZGVwZW5kZW5jeSBpbiBwYWNrYWdlLmpzb246ICR7cGx1Z2luTmFtZX1gXG4gICAgICAgIGlmIChpc0JldHdlZW5RdW90ZXMpIHtcbiAgICAgICAgICBwcm9wb3NhbC50ZXh0ID0gbmFtZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3Bvc2FsLnNuaXBwZXQgPSBgXCIke25hbWV9XCIke3Nob3VsZEFkZENvbW1hID8gJywnIDogJyd9YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wb3NhbFxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG4gIH1cblxuICBjYWxjdWxhdGVTZWFyY2hLZXl3b3JkKHByZWZpeCkge1xuICAgIGlmIChzdGFydHNXaXRoKEJBQkVMX1BMVUdJTiwgcHJlZml4KSkge1xuICAgICAgcmV0dXJuIEJBQkVMX1BMVUdJTlxuICAgIH0gZWxzZSBpZiAoc3RhcnRzV2l0aChwcmVmaXgsIEJBQkVMX1BMVUdJTikpIHtcbiAgICAgIHJldHVybiBwcmVmaXhcbiAgICB9XG4gICAgcmV0dXJuIEJBQkVMX1BMVUdJTiArIHByZWZpeFxuXG4gIH1cblxuICBnZXRGaWxlUGF0dGVybigpIHtcbiAgICByZXR1cm4gJy5iYWJlbHJjJ1xuICB9XG59XG4iXX0=