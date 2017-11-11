Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsonSchemaProposalFactory = require('./json-schema-proposal-factory');

var _jsonSchemaResolver = require('./json-schema-resolver');

var _jsonSchema = require('./json-schema');

'use babel';

var JsonSchemaProposalProvider = (function () {
  function JsonSchemaProposalProvider(filePattern, schema) {
    _classCallCheck(this, JsonSchemaProposalProvider);

    this.filePattern = filePattern;
    this.schema = schema;
    this.proposalFactory = new _jsonSchemaProposalFactory.JsonSchemaProposalFactory();
  }

  _createClass(JsonSchemaProposalProvider, [{
    key: 'getProposals',
    value: function getProposals(request) {
      return Promise.resolve(this.proposalFactory.createProposals(request, this.schema));
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return this.filePattern;
    }
  }], [{
    key: 'createFromProvider',
    value: function createFromProvider(schemaProvider) {
      return (0, _jsonSchemaResolver.resolve)(schemaProvider.getSchemaURI()).then(function (schema) {
        return new JsonSchemaProposalProvider(schemaProvider.getFilePattern(), (0, _jsonSchema.wrap)(schema));
      });
    }
  }]);

  return JsonSchemaProposalProvider;
})();

exports.JsonSchemaProposalProvider = JsonSchemaProposalProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1wcm9wb3NhbC1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozt5Q0FFMEMsZ0NBQWdDOztrQ0FDbEQsd0JBQXdCOzswQkFDM0IsZUFBZTs7QUFKcEMsV0FBVyxDQUFBOztJQU1FLDBCQUEwQjtBQUMxQixXQURBLDBCQUEwQixDQUN6QixXQUFXLEVBQUUsTUFBTSxFQUFFOzBCQUR0QiwwQkFBMEI7O0FBRW5DLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxlQUFlLEdBQUcsMERBQStCLENBQUE7R0FDdkQ7O2VBTFUsMEJBQTBCOztXQU96QixzQkFBQyxPQUFPLEVBQUU7QUFDcEIsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtLQUNuRjs7O1dBRWEsMEJBQUc7QUFDZixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUE7S0FDeEI7OztXQUV3Qiw0QkFBQyxjQUFjLEVBQUU7QUFDeEMsYUFBTyxpQ0FBUSxjQUFjLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNO2VBQUksSUFBSSwwQkFBMEIsQ0FDekYsY0FBYyxDQUFDLGNBQWMsRUFBRSxFQUMvQixzQkFBSyxNQUFNLENBQUMsQ0FDYjtPQUFBLENBQUMsQ0FBQTtLQUNIOzs7U0FwQlUsMEJBQTBCIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1wcm9wb3NhbC1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IEpzb25TY2hlbWFQcm9wb3NhbEZhY3RvcnkgfSBmcm9tICcuL2pzb24tc2NoZW1hLXByb3Bvc2FsLWZhY3RvcnknXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAnLi9qc29uLXNjaGVtYS1yZXNvbHZlcidcbmltcG9ydCB7IHdyYXAgfSBmcm9tICcuL2pzb24tc2NoZW1hJ1xuXG5leHBvcnQgY2xhc3MgSnNvblNjaGVtYVByb3Bvc2FsUHJvdmlkZXIge1xuICBjb25zdHJ1Y3RvcihmaWxlUGF0dGVybiwgc2NoZW1hKSB7XG4gICAgdGhpcy5maWxlUGF0dGVybiA9IGZpbGVQYXR0ZXJuXG4gICAgdGhpcy5zY2hlbWEgPSBzY2hlbWFcbiAgICB0aGlzLnByb3Bvc2FsRmFjdG9yeSA9IG5ldyBKc29uU2NoZW1hUHJvcG9zYWxGYWN0b3J5KClcbiAgfVxuXG4gIGdldFByb3Bvc2FscyhyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLnByb3Bvc2FsRmFjdG9yeS5jcmVhdGVQcm9wb3NhbHMocmVxdWVzdCwgdGhpcy5zY2hlbWEpKVxuICB9XG5cbiAgZ2V0RmlsZVBhdHRlcm4oKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZVBhdHRlcm5cbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tUHJvdmlkZXIoc2NoZW1hUHJvdmlkZXIpIHtcbiAgICByZXR1cm4gcmVzb2x2ZShzY2hlbWFQcm92aWRlci5nZXRTY2hlbWFVUkkoKSkudGhlbihzY2hlbWEgPT4gbmV3IEpzb25TY2hlbWFQcm9wb3NhbFByb3ZpZGVyKFxuICAgICAgc2NoZW1hUHJvdmlkZXIuZ2V0RmlsZVBhdHRlcm4oKSxcbiAgICAgIHdyYXAoc2NoZW1hKVxuICAgICkpXG4gIH1cbn1cbiJdfQ==