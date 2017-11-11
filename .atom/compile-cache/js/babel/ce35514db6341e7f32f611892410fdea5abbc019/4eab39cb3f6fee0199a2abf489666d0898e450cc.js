Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashFlatten = require('lodash/flatten');

var _lodashFlatten2 = _interopRequireDefault(_lodashFlatten);

var _utils = require('../../utils');

'use babel';

var CompoundProposalProvider = (function () {
  function CompoundProposalProvider() {
    _classCallCheck(this, CompoundProposalProvider);

    this.providers = [];
  }

  _createClass(CompoundProposalProvider, [{
    key: 'addProvider',
    value: function addProvider(provider) {
      this.addProviders([provider]);
    }
  }, {
    key: 'addProviders',
    value: function addProviders(providers) {
      this.providers = this.providers.concat(providers);
    }
  }, {
    key: 'hasProposals',
    value: function hasProposals(file) {
      return this.providers.some(function (provider) {
        return (0, _utils.matches)(file, provider.getFilePattern());
      });
    }
  }, {
    key: 'getProposals',
    value: function getProposals(request) {
      var file = request.editor.buffer.file;
      return Promise.all(this.providers.filter(function (provider) {
        return (0, _utils.matches)(file, provider.getFilePattern());
      }).map(function (provider) {
        return provider.getProposals(request);
      })).then(function (results) {
        return (0, _lodashFlatten2['default'])(results);
      });
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return undefined; // not used
    }
  }]);

  return CompoundProposalProvider;
})();

exports.CompoundProposalProvider = CompoundProposalProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvc2NoZW1hc3RvcmUvY29tcG91bmQtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs2QkFFb0IsZ0JBQWdCOzs7O3FCQUNaLGFBQWE7O0FBSHJDLFdBQVcsQ0FBQTs7SUFLRSx3QkFBd0I7QUFDeEIsV0FEQSx3QkFBd0IsR0FDckI7MEJBREgsd0JBQXdCOztBQUVqQyxRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTtHQUNwQjs7ZUFIVSx3QkFBd0I7O1dBS3hCLHFCQUFDLFFBQVEsRUFBRTtBQUNwQixVQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtLQUM5Qjs7O1dBRVcsc0JBQUMsU0FBUyxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDbEQ7OztXQUVXLHNCQUFDLElBQUksRUFBRTtBQUNqQixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtlQUFJLG9CQUFRLElBQUksRUFBRSxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDakY7OztXQUVXLHNCQUFDLE9BQU8sRUFBRTtBQUNwQixVQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUE7QUFDdkMsYUFBTyxPQUFPLENBQUMsR0FBRyxDQUNoQixJQUFJLENBQUMsU0FBUyxDQUNYLE1BQU0sQ0FBQyxVQUFBLFFBQVE7ZUFBSSxvQkFBUSxJQUFJLEVBQUUsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUM1RCxHQUFHLENBQUMsVUFBQSxRQUFRO2VBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQ25ELENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTztlQUFJLGdDQUFRLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUNwQzs7O1dBRWEsMEJBQUc7QUFDZixhQUFPLFNBQVMsQ0FBQTtLQUNqQjs7O1NBNUJVLHdCQUF3QiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvcHJvdmlkZXJzL3NjaGVtYXN0b3JlL2NvbXBvdW5kLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGZsYXR0ZW4gZnJvbSAnbG9kYXNoL2ZsYXR0ZW4nXG5pbXBvcnQgeyBtYXRjaGVzIH0gZnJvbSAnLi4vLi4vdXRpbHMnXG5cbmV4cG9ydCBjbGFzcyBDb21wb3VuZFByb3Bvc2FsUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb3ZpZGVycyA9IFtdXG4gIH1cblxuICBhZGRQcm92aWRlcihwcm92aWRlcikge1xuICAgIHRoaXMuYWRkUHJvdmlkZXJzKFtwcm92aWRlcl0pXG4gIH1cblxuICBhZGRQcm92aWRlcnMocHJvdmlkZXJzKSB7XG4gICAgdGhpcy5wcm92aWRlcnMgPSB0aGlzLnByb3ZpZGVycy5jb25jYXQocHJvdmlkZXJzKVxuICB9XG5cbiAgaGFzUHJvcG9zYWxzKGZpbGUpIHtcbiAgICByZXR1cm4gdGhpcy5wcm92aWRlcnMuc29tZShwcm92aWRlciA9PiBtYXRjaGVzKGZpbGUsIHByb3ZpZGVyLmdldEZpbGVQYXR0ZXJuKCkpKVxuICB9XG5cbiAgZ2V0UHJvcG9zYWxzKHJlcXVlc3QpIHtcbiAgICBjb25zdCBmaWxlID0gcmVxdWVzdC5lZGl0b3IuYnVmZmVyLmZpbGVcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICB0aGlzLnByb3ZpZGVyc1xuICAgICAgICAuZmlsdGVyKHByb3ZpZGVyID0+IG1hdGNoZXMoZmlsZSwgcHJvdmlkZXIuZ2V0RmlsZVBhdHRlcm4oKSkpXG4gICAgICAgIC5tYXAocHJvdmlkZXIgPT4gcHJvdmlkZXIuZ2V0UHJvcG9zYWxzKHJlcXVlc3QpKVxuICAgICkudGhlbihyZXN1bHRzID0+IGZsYXR0ZW4ocmVzdWx0cykpXG4gIH1cblxuICBnZXRGaWxlUGF0dGVybigpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIC8vIG5vdCB1c2VkXG4gIH1cbn1cbiJdfQ==