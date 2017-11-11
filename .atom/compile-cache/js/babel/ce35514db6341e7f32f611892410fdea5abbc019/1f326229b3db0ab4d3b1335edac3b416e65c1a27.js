Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashFlatten = require('lodash/flatten');

var _lodashFlatten2 = _interopRequireDefault(_lodashFlatten);

var _jsonSchemaVisitors = require('./json-schema-visitors');

var _jsonSchema = require('./json-schema');

var _utils = require('./utils');

'use babel';

var expandedSchemas = function expandedSchemas(schema) {
  if (schema instanceof _jsonSchema.CompositeSchema) {
    var schemas = [];
    schema.accept(new _jsonSchemaVisitors.SchemaFlattenerVisitor(), schemas);
    return schemas;
  }
  return [schema];
};

var possibleTypes = function possibleTypes(schema, segments) {
  if (segments.length === 0) {
    return expandedSchemas(schema);
  }
  var visitor = new _jsonSchemaVisitors.SchemaInspectorVisitor();
  return segments.reduce(function (schemas, segment) {
    var resolvedNextSchemas = schemas.map(function (s) {
      return expandedSchemas(s);
    });
    var nextSchemas = (0, _lodashFlatten2['default'])(resolvedNextSchemas).map(function (s) {
      return s.accept(visitor, segment);
    });
    return (0, _lodashFlatten2['default'])(nextSchemas);
  }, [schema]);
};

var KeyProposalFactory = (function () {
  function KeyProposalFactory() {
    _classCallCheck(this, KeyProposalFactory);
  }

  _createClass(KeyProposalFactory, [{
    key: 'createProposals',
    value: function createProposals(request, schema) {
      var contents = request.contents;
      var segments = request.segments;

      var unwrappedContents = (0, _utils.resolveObject)(segments, contents);
      var visitor = new _jsonSchemaVisitors.KeyProposalVisitor(unwrappedContents, new _jsonSchemaVisitors.SnippetProposalVisitor());
      var possibleTpes = possibleTypes(schema, segments);
      var proposals = possibleTpes.map(function (s) {
        return s.accept(visitor, request);
      });
      return (0, _lodashFlatten2['default'])(proposals);
    }
  }]);

  return KeyProposalFactory;
})();

var ValueProposalFactory = (function () {
  function ValueProposalFactory() {
    _classCallCheck(this, ValueProposalFactory);
  }

  _createClass(ValueProposalFactory, [{
    key: 'createProposals',
    value: function createProposals(request, schema) {
      var segments = request.segments;

      var schemas = possibleTypes(schema, segments);
      var visitor = new _jsonSchemaVisitors.ValueProposalVisitor(new _jsonSchemaVisitors.SnippetProposalVisitor());
      return (0, _lodashFlatten2['default'])(schemas.map(function (s) {
        return s.accept(visitor, request);
      }));
    }
  }]);

  return ValueProposalFactory;
})();

var JsonSchemaProposalFactory = (function () {
  function JsonSchemaProposalFactory() {
    _classCallCheck(this, JsonSchemaProposalFactory);

    this.keyProposalFactory = new KeyProposalFactory();
    this.valueProposalFactory = new ValueProposalFactory();
  }

  _createClass(JsonSchemaProposalFactory, [{
    key: 'createProposals',
    value: function createProposals(request, schema) {
      var visitor = new _jsonSchemaVisitors.ValueProposalVisitor(new _jsonSchemaVisitors.SnippetProposalVisitor());

      var isKeyPosition = request.isKeyPosition;
      var isValuePosition = request.isValuePosition;
      var isFileEmpty = request.isFileEmpty;

      if (isFileEmpty) {
        return (0, _lodashFlatten2['default'])(possibleTypes(schema, []).map(function (s) {
          return s.accept(visitor, request);
        }));
      }
      if (isKeyPosition) {
        return this.keyProposalFactory.createProposals(request, schema);
      } else if (isValuePosition) {
        return this.valueProposalFactory.createProposals(request, schema);
      }
      return [];
    }
  }]);

  return JsonSchemaProposalFactory;
})();

exports.JsonSchemaProposalFactory = JsonSchemaProposalFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1wcm9wb3NhbC1mYWN0b3J5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7NkJBRW9CLGdCQUFnQjs7OztrQ0FFNkYsd0JBQXdCOzswQkFDekgsZUFBZTs7cUJBQ2pCLFNBQVM7O0FBTnZDLFdBQVcsQ0FBQTs7QUFRWCxJQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUcsTUFBTSxFQUFJO0FBQ2hDLE1BQUksTUFBTSx1Q0FBMkIsRUFBRTtBQUNyQyxRQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDbEIsVUFBTSxDQUFDLE1BQU0sQ0FBQyxnREFBNEIsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNwRCxXQUFPLE9BQU8sQ0FBQTtHQUNmO0FBQ0QsU0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0NBQ2hCLENBQUE7O0FBRUQsSUFBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLE1BQU0sRUFBRSxRQUFRLEVBQUs7QUFDMUMsTUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN6QixXQUFPLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtHQUMvQjtBQUNELE1BQU0sT0FBTyxHQUFHLGdEQUE0QixDQUFBO0FBQzVDLFNBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUs7QUFDM0MsUUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQzthQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUM7S0FBQSxDQUFDLENBQUE7QUFDaEUsUUFBTSxXQUFXLEdBQUcsZ0NBQVEsbUJBQW1CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2FBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO0tBQUEsQ0FBQyxDQUFBO0FBQ3JGLFdBQU8sZ0NBQVEsV0FBVyxDQUFDLENBQUE7R0FDNUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7Q0FDYixDQUFBOztJQUdLLGtCQUFrQjtXQUFsQixrQkFBa0I7MEJBQWxCLGtCQUFrQjs7O2VBQWxCLGtCQUFrQjs7V0FDUCx5QkFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO1VBQ3ZCLFFBQVEsR0FBZSxPQUFPLENBQTlCLFFBQVE7VUFBRSxRQUFRLEdBQUssT0FBTyxDQUFwQixRQUFROztBQUMxQixVQUFNLGlCQUFpQixHQUFHLDBCQUFjLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUMzRCxVQUFNLE9BQU8sR0FBRywyQ0FBdUIsaUJBQWlCLEVBQUUsZ0RBQTRCLENBQUMsQ0FBQTtBQUN2RixVQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3BELFVBQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ25FLGFBQU8sZ0NBQVEsU0FBUyxDQUFDLENBQUE7S0FDMUI7OztTQVJHLGtCQUFrQjs7O0lBV2xCLG9CQUFvQjtXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7O2VBQXBCLG9CQUFvQjs7V0FDVCx5QkFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO1VBQ3ZCLFFBQVEsR0FBSyxPQUFPLENBQXBCLFFBQVE7O0FBQ2hCLFVBQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDL0MsVUFBTSxPQUFPLEdBQUcsNkNBQXlCLGdEQUE0QixDQUFDLENBQUE7QUFDdEUsYUFBTyxnQ0FBUSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFBO0tBQzdEOzs7U0FORyxvQkFBb0I7OztJQVNiLHlCQUF5QjtBQUN6QixXQURBLHlCQUF5QixHQUN0QjswQkFESCx5QkFBeUI7O0FBRWxDLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUE7QUFDbEQsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQTtHQUN2RDs7ZUFKVSx5QkFBeUI7O1dBTXJCLHlCQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0IsVUFBTSxPQUFPLEdBQUcsNkNBQXlCLGdEQUE0QixDQUFDLENBQUE7O1VBRTlELGFBQWEsR0FBbUMsT0FBTyxDQUF2RCxhQUFhO1VBQUUsZUFBZSxHQUFrQixPQUFPLENBQXhDLGVBQWU7VUFBRSxXQUFXLEdBQUssT0FBTyxDQUF2QixXQUFXOztBQUNuRCxVQUFJLFdBQVcsRUFBRTtBQUNmLGVBQU8sZ0NBQVEsYUFBYSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2lCQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQztTQUFBLENBQUMsQ0FBQyxDQUFBO09BQy9FO0FBQ0QsVUFBSSxhQUFhLEVBQUU7QUFDakIsZUFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtPQUNoRSxNQUFNLElBQUksZUFBZSxFQUFFO0FBQzFCLGVBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDbEU7QUFDRCxhQUFPLEVBQUUsQ0FBQTtLQUNWOzs7U0FuQlUseUJBQXlCIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1wcm9wb3NhbC1mYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGZsYXR0ZW4gZnJvbSAnbG9kYXNoL2ZsYXR0ZW4nXG5cbmltcG9ydCB7IEtleVByb3Bvc2FsVmlzaXRvciwgVmFsdWVQcm9wb3NhbFZpc2l0b3IsIFNuaXBwZXRQcm9wb3NhbFZpc2l0b3IsIFNjaGVtYUZsYXR0ZW5lclZpc2l0b3IsIFNjaGVtYUluc3BlY3RvclZpc2l0b3IgfSBmcm9tICcuL2pzb24tc2NoZW1hLXZpc2l0b3JzJ1xuaW1wb3J0IHsgQ29tcG9zaXRlU2NoZW1hIH0gZnJvbSAnLi9qc29uLXNjaGVtYSdcbmltcG9ydCB7IHJlc29sdmVPYmplY3QgfSBmcm9tICcuL3V0aWxzJ1xuXG5jb25zdCBleHBhbmRlZFNjaGVtYXMgPSBzY2hlbWEgPT4ge1xuICBpZiAoc2NoZW1hIGluc3RhbmNlb2YgQ29tcG9zaXRlU2NoZW1hKSB7XG4gICAgY29uc3Qgc2NoZW1hcyA9IFtdXG4gICAgc2NoZW1hLmFjY2VwdChuZXcgU2NoZW1hRmxhdHRlbmVyVmlzaXRvcigpLCBzY2hlbWFzKVxuICAgIHJldHVybiBzY2hlbWFzXG4gIH1cbiAgcmV0dXJuIFtzY2hlbWFdXG59XG5cbmNvbnN0IHBvc3NpYmxlVHlwZXMgPSAoc2NoZW1hLCBzZWdtZW50cykgPT4ge1xuICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGV4cGFuZGVkU2NoZW1hcyhzY2hlbWEpXG4gIH1cbiAgY29uc3QgdmlzaXRvciA9IG5ldyBTY2hlbWFJbnNwZWN0b3JWaXNpdG9yKClcbiAgcmV0dXJuIHNlZ21lbnRzLnJlZHVjZSgoc2NoZW1hcywgc2VnbWVudCkgPT4ge1xuICAgIGNvbnN0IHJlc29sdmVkTmV4dFNjaGVtYXMgPSBzY2hlbWFzLm1hcChzID0+IGV4cGFuZGVkU2NoZW1hcyhzKSlcbiAgICBjb25zdCBuZXh0U2NoZW1hcyA9IGZsYXR0ZW4ocmVzb2x2ZWROZXh0U2NoZW1hcykubWFwKHMgPT4gcy5hY2NlcHQodmlzaXRvciwgc2VnbWVudCkpXG4gICAgcmV0dXJuIGZsYXR0ZW4obmV4dFNjaGVtYXMpXG4gIH0sIFtzY2hlbWFdKVxufVxuXG5cbmNsYXNzIEtleVByb3Bvc2FsRmFjdG9yeSB7XG4gIGNyZWF0ZVByb3Bvc2FscyhyZXF1ZXN0LCBzY2hlbWEpIHtcbiAgICBjb25zdCB7IGNvbnRlbnRzLCBzZWdtZW50cyB9ID0gcmVxdWVzdFxuICAgIGNvbnN0IHVud3JhcHBlZENvbnRlbnRzID0gcmVzb2x2ZU9iamVjdChzZWdtZW50cywgY29udGVudHMpXG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBLZXlQcm9wb3NhbFZpc2l0b3IodW53cmFwcGVkQ29udGVudHMsIG5ldyBTbmlwcGV0UHJvcG9zYWxWaXNpdG9yKCkpXG4gICAgY29uc3QgcG9zc2libGVUcGVzID0gcG9zc2libGVUeXBlcyhzY2hlbWEsIHNlZ21lbnRzKVxuICAgIGNvbnN0IHByb3Bvc2FscyA9IHBvc3NpYmxlVHBlcy5tYXAocyA9PiBzLmFjY2VwdCh2aXNpdG9yLCByZXF1ZXN0KSlcbiAgICByZXR1cm4gZmxhdHRlbihwcm9wb3NhbHMpXG4gIH1cbn1cblxuY2xhc3MgVmFsdWVQcm9wb3NhbEZhY3Rvcnkge1xuICBjcmVhdGVQcm9wb3NhbHMocmVxdWVzdCwgc2NoZW1hKSB7XG4gICAgY29uc3QgeyBzZWdtZW50cyB9ID0gcmVxdWVzdFxuICAgIGNvbnN0IHNjaGVtYXMgPSBwb3NzaWJsZVR5cGVzKHNjaGVtYSwgc2VnbWVudHMpXG4gICAgY29uc3QgdmlzaXRvciA9IG5ldyBWYWx1ZVByb3Bvc2FsVmlzaXRvcihuZXcgU25pcHBldFByb3Bvc2FsVmlzaXRvcigpKVxuICAgIHJldHVybiBmbGF0dGVuKHNjaGVtYXMubWFwKHMgPT4gcy5hY2NlcHQodmlzaXRvciwgcmVxdWVzdCkpKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBKc29uU2NoZW1hUHJvcG9zYWxGYWN0b3J5IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5rZXlQcm9wb3NhbEZhY3RvcnkgPSBuZXcgS2V5UHJvcG9zYWxGYWN0b3J5KClcbiAgICB0aGlzLnZhbHVlUHJvcG9zYWxGYWN0b3J5ID0gbmV3IFZhbHVlUHJvcG9zYWxGYWN0b3J5KClcbiAgfVxuXG4gIGNyZWF0ZVByb3Bvc2FscyhyZXF1ZXN0LCBzY2hlbWEpIHtcbiAgICBjb25zdCB2aXNpdG9yID0gbmV3IFZhbHVlUHJvcG9zYWxWaXNpdG9yKG5ldyBTbmlwcGV0UHJvcG9zYWxWaXNpdG9yKCkpXG5cbiAgICBjb25zdCB7IGlzS2V5UG9zaXRpb24sIGlzVmFsdWVQb3NpdGlvbiwgaXNGaWxlRW1wdHkgfSA9IHJlcXVlc3RcbiAgICBpZiAoaXNGaWxlRW1wdHkpIHtcbiAgICAgIHJldHVybiBmbGF0dGVuKHBvc3NpYmxlVHlwZXMoc2NoZW1hLCBbXSkubWFwKHMgPT4gcy5hY2NlcHQodmlzaXRvciwgcmVxdWVzdCkpKVxuICAgIH1cbiAgICBpZiAoaXNLZXlQb3NpdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMua2V5UHJvcG9zYWxGYWN0b3J5LmNyZWF0ZVByb3Bvc2FscyhyZXF1ZXN0LCBzY2hlbWEpXG4gICAgfSBlbHNlIGlmIChpc1ZhbHVlUG9zaXRpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlUHJvcG9zYWxGYWN0b3J5LmNyZWF0ZVByb3Bvc2FscyhyZXF1ZXN0LCBzY2hlbWEpXG4gICAgfVxuICAgIHJldHVybiBbXVxuICB9XG59XG4iXX0=