Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashTrimStart = require('lodash/trimStart');

var _lodashTrimStart2 = _interopRequireDefault(_lodashTrimStart);

var _lodashStartsWith = require('lodash/startsWith');

var _lodashStartsWith2 = _interopRequireDefault(_lodashStartsWith);

'use babel';

function createDependencyProposal(request, dependency) {
  var isBetweenQuotes = request.isBetweenQuotes;
  var shouldAddComma = request.shouldAddComma;

  var proposal = {};
  proposal.displayText = dependency.name;
  proposal.rightLabel = 'dependency';
  proposal.type = 'property';
  proposal.description = dependency.description;
  if (isBetweenQuotes) {
    proposal.text = dependency.name;
  } else {
    proposal.snippet = '"' + dependency.name + '": "$1"' + (shouldAddComma ? ',' : '');
  }
  return proposal;
}

function createVersionProposal(request, version) {
  var isBetweenQuotes = request.isBetweenQuotes;
  var shouldAddComma = request.shouldAddComma;
  var prefix = request.prefix;

  var proposal = {};
  proposal.displayText = version;
  proposal.rightLabel = 'version';
  proposal.type = 'value';
  proposal.replacementPrefix = (0, _lodashTrimStart2['default'])(prefix, '~^<>="');
  if (isBetweenQuotes) {
    proposal.text = version;
  } else {
    proposal.snippet = '"' + version + '"' + (shouldAddComma ? ',' : '');
  }
  return proposal;
}

var SemverDependencyProposalProvider = (function () {
  function SemverDependencyProposalProvider(config) {
    _classCallCheck(this, SemverDependencyProposalProvider);

    this.config = config;
  }

  _createClass(SemverDependencyProposalProvider, [{
    key: 'getProposals',
    value: function getProposals(request) {
      if (this.config.dependencyRequestMatcher().matches(request)) {
        return this.getDependencyKeysProposals(request);
      }
      if (this.config.versionRequestMatcher().matches(request)) {
        return this.getDependencyVersionsProposals(request);
      }
      return Promise.resolve([]);
    }
  }, {
    key: 'getDependencyKeysProposals',
    value: function getDependencyKeysProposals(request) {
      var prefix = request.prefix;

      var dependencyFilter = this.config.getDependencyFilter(request);
      return this.config.search(prefix).then(function (packages) {
        return packages.filter(function (dependency) {
          return dependencyFilter(dependency.name);
        }).map(function (dependency) {
          return createDependencyProposal(request, dependency);
        });
      });
    }
  }, {
    key: 'getDependencyVersionsProposals',
    value: function getDependencyVersionsProposals(request) {
      var segments = request.segments;
      var prefix = request.prefix;

      var _segments = _slicedToArray(segments, 2);

      var packageName = _segments[1];

      var trimmedPrefix = (0, _lodashTrimStart2['default'])(prefix, '~^<>="');
      return this.config.versions(packageName.toString()).then(function (versions) {
        return versions.filter(function (version) {
          return (0, _lodashStartsWith2['default'])(version, trimmedPrefix);
        }).map(function (version) {
          return createVersionProposal(request, version);
        });
      });
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return this.config.getFilePattern();
    }
  }]);

  return SemverDependencyProposalProvider;
})();

exports.SemverDependencyProposalProvider = SemverDependencyProposalProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9zZW12ZXItZGVwZW5kZW5jeS1wcm9wb3NhbC1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7K0JBRXNCLGtCQUFrQjs7OztnQ0FDakIsbUJBQW1COzs7O0FBSDFDLFdBQVcsQ0FBQTs7QUFLWCxTQUFTLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUU7TUFDOUMsZUFBZSxHQUFvQixPQUFPLENBQTFDLGVBQWU7TUFBRSxjQUFjLEdBQUksT0FBTyxDQUF6QixjQUFjOztBQUN0QyxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbkIsVUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFBO0FBQ3RDLFVBQVEsQ0FBQyxVQUFVLEdBQUcsWUFBWSxDQUFBO0FBQ2xDLFVBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFBO0FBQzFCLFVBQVEsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQTtBQUM3QyxNQUFJLGVBQWUsRUFBRTtBQUNuQixZQUFRLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUE7R0FDaEMsTUFBTTtBQUNMLFlBQVEsQ0FBQyxPQUFPLFNBQU8sVUFBVSxDQUFDLElBQUksZ0JBQVUsY0FBYyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUEsQUFBRSxDQUFBO0dBQzVFO0FBQ0QsU0FBTyxRQUFRLENBQUE7Q0FDaEI7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO01BQ3hDLGVBQWUsR0FBNEIsT0FBTyxDQUFsRCxlQUFlO01BQUUsY0FBYyxHQUFZLE9BQU8sQ0FBakMsY0FBYztNQUFFLE1BQU0sR0FBSSxPQUFPLENBQWpCLE1BQU07O0FBQzlDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNuQixVQUFRLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQTtBQUM5QixVQUFRLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQTtBQUMvQixVQUFRLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQTtBQUN2QixVQUFRLENBQUMsaUJBQWlCLEdBQUcsa0NBQVUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3hELE1BQUksZUFBZSxFQUFFO0FBQ25CLFlBQVEsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFBO0dBQ3hCLE1BQU07QUFDTCxZQUFRLENBQUMsT0FBTyxTQUFPLE9BQU8sVUFBSSxjQUFjLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQSxBQUFFLENBQUE7R0FDOUQ7QUFDRCxTQUFPLFFBQVEsQ0FBQTtDQUNoQjs7SUFHWSxnQ0FBZ0M7QUFFaEMsV0FGQSxnQ0FBZ0MsQ0FFL0IsTUFBTSxFQUFFOzBCQUZULGdDQUFnQzs7QUFHekMsUUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7R0FDckI7O2VBSlUsZ0NBQWdDOztXQU0vQixzQkFBQyxPQUFPLEVBQUU7QUFDcEIsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzNELGVBQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQ2hEO0FBQ0QsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3hELGVBQU8sSUFBSSxDQUFDLDhCQUE4QixDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQ3BEO0FBQ0QsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQzNCOzs7V0FFeUIsb0NBQUMsT0FBTyxFQUFFO1VBQzNCLE1BQU0sR0FBSSxPQUFPLENBQWpCLE1BQU07O0FBQ2IsVUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ2pFLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsUUFBUTtlQUM3QyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsVUFBVTtpQkFBSSxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO1NBQUEsQ0FBQyxDQUM3RCxHQUFHLENBQUMsVUFBQSxVQUFVO2lCQUFJLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7U0FBQSxDQUFDO09BQUEsQ0FDcEUsQ0FBQTtLQUNGOzs7V0FFNkIsd0NBQUMsT0FBTyxFQUFFO1VBQy9CLFFBQVEsR0FBWSxPQUFPLENBQTNCLFFBQVE7VUFBRSxNQUFNLEdBQUksT0FBTyxDQUFqQixNQUFNOztxQ0FDQyxRQUFROztVQUF2QixXQUFXOztBQUNwQixVQUFNLGFBQWEsR0FBRyxrQ0FBVSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDakQsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRO2VBQy9ELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxPQUFPO2lCQUFJLG1DQUFXLE9BQU8sRUFBRSxhQUFhLENBQUM7U0FBQSxDQUFDLENBQzNELEdBQUcsQ0FBQyxVQUFBLE9BQU87aUJBQUkscUJBQXFCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztTQUFBLENBQUM7T0FBQSxDQUMzRCxDQUFBO0tBQ0Y7OztXQUVhLDBCQUFHO0FBQ2YsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFBO0tBQ3BDOzs7U0FyQ1UsZ0NBQWdDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9zZW12ZXItZGVwZW5kZW5jeS1wcm9wb3NhbC1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB0cmltU3RhcnQgZnJvbSAnbG9kYXNoL3RyaW1TdGFydCdcbmltcG9ydCBzdGFydHNXaXRoIGZyb20gJ2xvZGFzaC9zdGFydHNXaXRoJ1xuXG5mdW5jdGlvbiBjcmVhdGVEZXBlbmRlbmN5UHJvcG9zYWwocmVxdWVzdCwgZGVwZW5kZW5jeSkge1xuICBjb25zdCB7aXNCZXR3ZWVuUXVvdGVzLCBzaG91bGRBZGRDb21tYX0gPSByZXF1ZXN0XG4gIGNvbnN0IHByb3Bvc2FsID0ge31cbiAgcHJvcG9zYWwuZGlzcGxheVRleHQgPSBkZXBlbmRlbmN5Lm5hbWVcbiAgcHJvcG9zYWwucmlnaHRMYWJlbCA9ICdkZXBlbmRlbmN5J1xuICBwcm9wb3NhbC50eXBlID0gJ3Byb3BlcnR5J1xuICBwcm9wb3NhbC5kZXNjcmlwdGlvbiA9IGRlcGVuZGVuY3kuZGVzY3JpcHRpb25cbiAgaWYgKGlzQmV0d2VlblF1b3Rlcykge1xuICAgIHByb3Bvc2FsLnRleHQgPSBkZXBlbmRlbmN5Lm5hbWVcbiAgfSBlbHNlIHtcbiAgICBwcm9wb3NhbC5zbmlwcGV0ID0gYFwiJHtkZXBlbmRlbmN5Lm5hbWV9XCI6IFwiJDFcIiR7c2hvdWxkQWRkQ29tbWEgPyAnLCcgOiAnJ31gXG4gIH1cbiAgcmV0dXJuIHByb3Bvc2FsXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZlcnNpb25Qcm9wb3NhbChyZXF1ZXN0LCB2ZXJzaW9uKSB7XG4gIGNvbnN0IHtpc0JldHdlZW5RdW90ZXMsIHNob3VsZEFkZENvbW1hLCBwcmVmaXh9ID0gcmVxdWVzdFxuICBjb25zdCBwcm9wb3NhbCA9IHt9XG4gIHByb3Bvc2FsLmRpc3BsYXlUZXh0ID0gdmVyc2lvblxuICBwcm9wb3NhbC5yaWdodExhYmVsID0gJ3ZlcnNpb24nXG4gIHByb3Bvc2FsLnR5cGUgPSAndmFsdWUnXG4gIHByb3Bvc2FsLnJlcGxhY2VtZW50UHJlZml4ID0gdHJpbVN0YXJ0KHByZWZpeCwgJ35ePD49XCInKVxuICBpZiAoaXNCZXR3ZWVuUXVvdGVzKSB7XG4gICAgcHJvcG9zYWwudGV4dCA9IHZlcnNpb25cbiAgfSBlbHNlIHtcbiAgICBwcm9wb3NhbC5zbmlwcGV0ID0gYFwiJHt2ZXJzaW9ufVwiJHtzaG91bGRBZGRDb21tYSA/ICcsJyA6ICcnfWBcbiAgfVxuICByZXR1cm4gcHJvcG9zYWxcbn1cblxuXG5leHBvcnQgY2xhc3MgU2VtdmVyRGVwZW5kZW5jeVByb3Bvc2FsUHJvdmlkZXIge1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnXG4gIH1cblxuICBnZXRQcm9wb3NhbHMocmVxdWVzdCkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5kZXBlbmRlbmN5UmVxdWVzdE1hdGNoZXIoKS5tYXRjaGVzKHJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREZXBlbmRlbmN5S2V5c1Byb3Bvc2FscyhyZXF1ZXN0KVxuICAgIH1cbiAgICBpZiAodGhpcy5jb25maWcudmVyc2lvblJlcXVlc3RNYXRjaGVyKCkubWF0Y2hlcyhyZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGVwZW5kZW5jeVZlcnNpb25zUHJvcG9zYWxzKHJlcXVlc3QpXG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG4gIH1cblxuICBnZXREZXBlbmRlbmN5S2V5c1Byb3Bvc2FscyhyZXF1ZXN0KSB7XG4gICAgY29uc3Qge3ByZWZpeH0gPSByZXF1ZXN0XG4gICAgY29uc3QgZGVwZW5kZW5jeUZpbHRlciA9IHRoaXMuY29uZmlnLmdldERlcGVuZGVuY3lGaWx0ZXIocmVxdWVzdClcbiAgICByZXR1cm4gdGhpcy5jb25maWcuc2VhcmNoKHByZWZpeCkudGhlbihwYWNrYWdlcyA9PlxuICAgICAgcGFja2FnZXMuZmlsdGVyKGRlcGVuZGVuY3kgPT4gZGVwZW5kZW5jeUZpbHRlcihkZXBlbmRlbmN5Lm5hbWUpKVxuICAgICAgICAubWFwKGRlcGVuZGVuY3kgPT4gY3JlYXRlRGVwZW5kZW5jeVByb3Bvc2FsKHJlcXVlc3QsIGRlcGVuZGVuY3kpKVxuICAgIClcbiAgfVxuXG4gIGdldERlcGVuZGVuY3lWZXJzaW9uc1Byb3Bvc2FscyhyZXF1ZXN0KSB7XG4gICAgY29uc3Qge3NlZ21lbnRzLCBwcmVmaXh9ID0gcmVxdWVzdFxuICAgIGNvbnN0IFssIHBhY2thZ2VOYW1lXSA9IHNlZ21lbnRzXG4gICAgY29uc3QgdHJpbW1lZFByZWZpeCA9IHRyaW1TdGFydChwcmVmaXgsICd+Xjw+PVwiJylcbiAgICByZXR1cm4gdGhpcy5jb25maWcudmVyc2lvbnMocGFja2FnZU5hbWUudG9TdHJpbmcoKSkudGhlbih2ZXJzaW9ucyA9PlxuICAgICAgdmVyc2lvbnMuZmlsdGVyKHZlcnNpb24gPT4gc3RhcnRzV2l0aCh2ZXJzaW9uLCB0cmltbWVkUHJlZml4KSlcbiAgICAgICAgLm1hcCh2ZXJzaW9uID0+IGNyZWF0ZVZlcnNpb25Qcm9wb3NhbChyZXF1ZXN0LCB2ZXJzaW9uKSlcbiAgICApXG4gIH1cblxuICBnZXRGaWxlUGF0dGVybigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuZ2V0RmlsZVBhdHRlcm4oKVxuICB9XG59XG4iXX0=