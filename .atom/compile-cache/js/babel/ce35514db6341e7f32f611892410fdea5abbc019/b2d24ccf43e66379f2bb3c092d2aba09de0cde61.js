Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashStartsWith = require('lodash/startsWith');

var _lodashStartsWith2 = _interopRequireDefault(_lodashStartsWith);

var _matchers = require('../../matchers');

var _npmPackageLookup = require('npm-package-lookup');

'use babel';

var PRESETS = 'presets';
var BABEL_PRESET = 'babel-preset-';

var PRESET_MATCHER = (0, _matchers.request)().value().path((0, _matchers.path)().key(PRESETS).index());

var BabelRCPresetsProposalProvider = (function () {
  function BabelRCPresetsProposalProvider() {
    _classCallCheck(this, BabelRCPresetsProposalProvider);
  }

  _createClass(BabelRCPresetsProposalProvider, [{
    key: 'getProposals',
    value: function getProposals(req) {
      var _this = this;

      var contents = req.contents;
      var prefix = req.prefix;
      var isBetweenQuotes = req.isBetweenQuotes;
      var shouldAddComma = req.shouldAddComma;

      if (PRESET_MATCHER.matches(_matchers.request)) {
        var _ret = (function () {
          var presets = contents[PRESETS] || [];
          var results = (0, _npmPackageLookup.search)(_this.calculateSearchKeyword(prefix));
          return {
            v: results.then(function (names) {
              return names.filter(function (name) {
                return presets.indexOf(name.replace(BABEL_PRESET, '')) < 0;
              }).map(function (presetName) {
                var name = presetName.replace(BABEL_PRESET, '');
                var proposal = _defineProperty({
                  displayText: name,
                  rightLabel: 'preset',
                  type: 'preset',
                  description: name + ' babel preset. Required dependency in package.json: ' + presetName
                }, isBetweenQuotes ? 'text' : 'snippet', isBetweenQuotes ? name : '"' + name + '"' + (shouldAddComma ? ',' : ''));
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
      if ((0, _lodashStartsWith2['default'])(BABEL_PRESET, prefix)) {
        return BABEL_PRESET;
      } else if ((0, _lodashStartsWith2['default'])(prefix, BABEL_PRESET)) {
        return prefix;
      }
      return BABEL_PRESET + prefix;
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return '.babelrc';
    }
  }]);

  return BabelRCPresetsProposalProvider;
})();

exports['default'] = BabelRCPresetsProposalProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvYmFiZWxyYy9iYWJlbHJjLXByZXNldHMtcHJvcG9zYWwtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUV1QixtQkFBbUI7Ozs7d0JBQ1osZ0JBQWdCOztnQ0FDdkIsb0JBQW9COztBQUozQyxXQUFXLENBQUE7O0FBTVgsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFBO0FBQ3pCLElBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQTs7QUFFcEMsSUFBTSxjQUFjLEdBQUcsd0JBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQTs7SUFFckQsOEJBQThCO1dBQTlCLDhCQUE4QjswQkFBOUIsOEJBQThCOzs7ZUFBOUIsOEJBQThCOztXQUNyQyxzQkFBQyxHQUFHLEVBQUU7OztVQUNULFFBQVEsR0FBNkMsR0FBRyxDQUF4RCxRQUFRO1VBQUUsTUFBTSxHQUFxQyxHQUFHLENBQTlDLE1BQU07VUFBRSxlQUFlLEdBQW9CLEdBQUcsQ0FBdEMsZUFBZTtVQUFFLGNBQWMsR0FBSSxHQUFHLENBQXJCLGNBQWM7O0FBQ3hELFVBQUksY0FBYyxDQUFDLE9BQU8sbUJBQVMsRUFBRTs7QUFDbkMsY0FBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUN2QyxjQUFNLE9BQU8sR0FBRyw4QkFBTyxNQUFLLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDM0Q7ZUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSztxQkFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTt1QkFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztlQUFBLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDdkgsb0JBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ2pELG9CQUFNLFFBQVE7QUFDWiw2QkFBVyxFQUFFLElBQUk7QUFDakIsNEJBQVUsRUFBRSxRQUFRO0FBQ3BCLHNCQUFJLEVBQUUsUUFBUTtBQUNkLDZCQUFXLEVBQUssSUFBSSw0REFBdUQsVUFBVSxBQUFFO21CQUN0RixlQUFlLEdBQUcsTUFBTSxHQUFHLFNBQVMsRUFBRyxlQUFlLEdBQUcsSUFBSSxTQUFRLElBQUksVUFBTSxjQUFjLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQSxBQUFFLENBQzVHLENBQUE7QUFDRCx1QkFBTyxRQUFRLENBQUE7ZUFDaEIsQ0FBQzthQUFBLENBQUM7WUFBQTs7OztPQUNKO0FBQ0QsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQzNCOzs7V0FFcUIsZ0NBQUMsTUFBTSxFQUFFO0FBQzdCLFVBQUksbUNBQVcsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFO0FBQ3BDLGVBQU8sWUFBWSxDQUFBO09BQ3BCLE1BQU0sSUFBSSxtQ0FBVyxNQUFNLEVBQUUsWUFBWSxDQUFDLEVBQUU7QUFDM0MsZUFBTyxNQUFNLENBQUE7T0FDZDtBQUNELGFBQU8sWUFBWSxHQUFHLE1BQU0sQ0FBQTtLQUU3Qjs7O1dBRWEsMEJBQUc7QUFDZixhQUFPLFVBQVUsQ0FBQTtLQUNsQjs7O1NBakNrQiw4QkFBOEI7OztxQkFBOUIsOEJBQThCIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvYmFiZWxyYy9iYWJlbHJjLXByZXNldHMtcHJvcG9zYWwtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgc3RhcnRzV2l0aCBmcm9tICdsb2Rhc2gvc3RhcnRzV2l0aCdcbmltcG9ydCB7IHBhdGgsIHJlcXVlc3QgfSBmcm9tICcuLi8uLi9tYXRjaGVycydcbmltcG9ydCB7IHNlYXJjaCB9IGZyb20gJ25wbS1wYWNrYWdlLWxvb2t1cCdcblxuY29uc3QgUFJFU0VUUyA9ICdwcmVzZXRzJ1xuY29uc3QgQkFCRUxfUFJFU0VUID0gJ2JhYmVsLXByZXNldC0nXG5cbmNvbnN0IFBSRVNFVF9NQVRDSEVSID0gcmVxdWVzdCgpLnZhbHVlKCkucGF0aChwYXRoKCkua2V5KFBSRVNFVFMpLmluZGV4KCkpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhYmVsUkNQcmVzZXRzUHJvcG9zYWxQcm92aWRlciB7XG4gIGdldFByb3Bvc2FscyhyZXEpIHtcbiAgICBjb25zdCB7Y29udGVudHMsIHByZWZpeCwgaXNCZXR3ZWVuUXVvdGVzLCBzaG91bGRBZGRDb21tYX0gPSByZXFcbiAgICBpZiAoUFJFU0VUX01BVENIRVIubWF0Y2hlcyhyZXF1ZXN0KSkge1xuICAgICAgY29uc3QgcHJlc2V0cyA9IGNvbnRlbnRzW1BSRVNFVFNdIHx8IFtdXG4gICAgICBjb25zdCByZXN1bHRzID0gc2VhcmNoKHRoaXMuY2FsY3VsYXRlU2VhcmNoS2V5d29yZChwcmVmaXgpKVxuICAgICAgcmV0dXJuIHJlc3VsdHMudGhlbihuYW1lcyA9PiBuYW1lcy5maWx0ZXIobmFtZSA9PiBwcmVzZXRzLmluZGV4T2YobmFtZS5yZXBsYWNlKEJBQkVMX1BSRVNFVCwgJycpKSA8IDApLm1hcChwcmVzZXROYW1lID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHByZXNldE5hbWUucmVwbGFjZShCQUJFTF9QUkVTRVQsICcnKVxuICAgICAgICBjb25zdCBwcm9wb3NhbCA9IHtcbiAgICAgICAgICBkaXNwbGF5VGV4dDogbmFtZSxcbiAgICAgICAgICByaWdodExhYmVsOiAncHJlc2V0JyxcbiAgICAgICAgICB0eXBlOiAncHJlc2V0JyxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogYCR7bmFtZX0gYmFiZWwgcHJlc2V0LiBSZXF1aXJlZCBkZXBlbmRlbmN5IGluIHBhY2thZ2UuanNvbjogJHtwcmVzZXROYW1lfWAsXG4gICAgICAgICAgW2lzQmV0d2VlblF1b3RlcyA/ICd0ZXh0JyA6ICdzbmlwcGV0J106IGlzQmV0d2VlblF1b3RlcyA/IG5hbWUgOiBgXCIkeyBuYW1lIH1cIiR7IHNob3VsZEFkZENvbW1hID8gJywnIDogJyd9YFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wb3NhbFxuICAgICAgfSkpXG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG4gIH1cblxuICBjYWxjdWxhdGVTZWFyY2hLZXl3b3JkKHByZWZpeCkge1xuICAgIGlmIChzdGFydHNXaXRoKEJBQkVMX1BSRVNFVCwgcHJlZml4KSkge1xuICAgICAgcmV0dXJuIEJBQkVMX1BSRVNFVFxuICAgIH0gZWxzZSBpZiAoc3RhcnRzV2l0aChwcmVmaXgsIEJBQkVMX1BSRVNFVCkpIHtcbiAgICAgIHJldHVybiBwcmVmaXhcbiAgICB9IFxuICAgIHJldHVybiBCQUJFTF9QUkVTRVQgKyBwcmVmaXhcbiAgICBcbiAgfVxuXG4gIGdldEZpbGVQYXR0ZXJuKCkge1xuICAgIHJldHVybiAnLmJhYmVscmMnXG4gIH1cbn1cbiJdfQ==