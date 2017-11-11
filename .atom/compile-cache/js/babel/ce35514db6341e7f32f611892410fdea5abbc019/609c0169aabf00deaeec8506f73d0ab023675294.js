Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _jsonSchemaProposalProvider = require('../../json-schema-proposal-provider');

var _compoundProvider = require('./compound-provider');

var _jsonSchemaResolver = require('../../json-schema-resolver');

var _jsonSchema = require('../../json-schema');

'use babel';

var SchemaStoreProvider = (function () {
  function SchemaStoreProvider() {
    _classCallCheck(this, SchemaStoreProvider);

    this.compoundProvier = new _compoundProvider.CompoundProposalProvider();
    this.blackList = {};
  }

  _createClass(SchemaStoreProvider, [{
    key: 'getSchemaInfos',
    value: function getSchemaInfos() {
      var _this = this;

      if (this.schemaInfos) {
        return Promise.resolve(this.schemaInfos);
      }
      return _axios2['default'].get('http://schemastore.org/api/json/catalog.json').then(function (response) {
        return response.data;
      }).then(function (data) {
        return data.schemas.filter(function (schema) {
          return Boolean(schema.fileMatch);
        });
      }).then(function (schemaInfos) {
        _this.schemaInfos = schemaInfos;
        return schemaInfos;
      });
    }
  }, {
    key: 'getProposals',
    value: function getProposals(request) {
      var _this2 = this;

      var file = request.editor.buffer.file;
      if (this.blackList[file.getBaseName()]) {
        console.warn('schemas not available');
        return Promise.resolve([]);
      }

      if (!this.compoundProvier.hasProposals(file)) {
        return this.getSchemaInfos().then(function (schemaInfos) {
          return schemaInfos.filter(function (_ref) {
            var fileMatch = _ref.fileMatch;
            return fileMatch.some(function (match) {
              return (0, _minimatch2['default'])(file.getBaseName(), match);
            });
          });
        }).then(function (matching) {
          var promises = matching.map(function (schemaInfo) {
            return (0, _jsonSchemaResolver.resolve)(schemaInfo.url).then(function (schema) {
              return new _jsonSchemaProposalProvider.JsonSchemaProposalProvider(schemaInfo.fileMatch, (0, _jsonSchema.wrap)(schema));
            });
          });
          return Promise.all(promises);
        }).then(function (providers) {
          return _this2.compoundProvier.addProviders(providers);
        }).then(function () {
          if (!_this2.compoundProvier.hasProposals(file)) {
            _this2.blackList[file.getBaseName()] = true;
          }
        }).then(function () {
          return _this2.compoundProvier.getProposals(request);
        });
      }
      return this.compoundProvier.getProposals(request);
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return '*';
    }
  }]);

  return SchemaStoreProvider;
})();

exports['default'] = SchemaStoreProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9wcm92aWRlcnMvc2NoZW1hc3RvcmUvc2NoZW1hc3RvcmUtcHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozt5QkFFc0IsV0FBVzs7OztxQkFDZixPQUFPOzs7OzBDQUVrQixxQ0FBcUM7O2dDQUN2QyxxQkFBcUI7O2tDQUN0Qyw0QkFBNEI7OzBCQUMvQixtQkFBbUI7O0FBUnhDLFdBQVcsQ0FBQTs7SUFVVSxtQkFBbUI7QUFDM0IsV0FEUSxtQkFBbUIsR0FDeEI7MEJBREssbUJBQW1COztBQUVwQyxRQUFJLENBQUMsZUFBZSxHQUFHLGdEQUE4QixDQUFBO0FBQ3JELFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO0dBQ3BCOztlQUprQixtQkFBbUI7O1dBTXhCLDBCQUFHOzs7QUFDZixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDcEIsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtPQUN6QztBQUNELGFBQU8sbUJBQU0sR0FBRyxDQUFDLDhDQUE4QyxDQUFDLENBQzdELElBQUksQ0FBQyxVQUFBLFFBQVE7ZUFBSSxRQUFRLENBQUMsSUFBSTtPQUFBLENBQUMsQ0FDL0IsSUFBSSxDQUFDLFVBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUEsTUFBTTtpQkFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztTQUFBLENBQUM7T0FBQSxDQUFDLENBQ3RFLElBQUksQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNuQixjQUFLLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDOUIsZUFBTyxXQUFXLENBQUE7T0FDbkIsQ0FBQyxDQUFBO0tBQ0w7OztXQUVXLHNCQUFDLE9BQU8sRUFBRTs7O0FBQ3BCLFVBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtBQUN2QyxVQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7QUFDdEMsZUFBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO0FBQ3JDLGVBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUMzQjs7QUFFRCxVQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDNUMsZUFBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQ3pCLElBQUksQ0FBQyxVQUFBLFdBQVc7aUJBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQWE7Z0JBQVgsU0FBUyxHQUFYLElBQWEsQ0FBWCxTQUFTO21CQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBQSxLQUFLO3FCQUFJLDRCQUFVLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxLQUFLLENBQUM7YUFBQSxDQUFDO1dBQUEsQ0FBQztTQUFBLENBQUMsQ0FDekgsSUFBSSxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ2hCLGNBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVO21CQUFJLGlDQUFRLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNO3FCQUFJLDJEQUNqRixVQUFVLENBQUMsU0FBUyxFQUNwQixzQkFBSyxNQUFNLENBQUMsQ0FDYjthQUFBLENBQUM7V0FBQSxDQUFDLENBQUE7QUFDSCxpQkFBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQzdCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBQSxTQUFTO2lCQUFJLE9BQUssZUFBZSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7U0FBQSxDQUFDLENBQy9ELElBQUksQ0FBQyxZQUFNO0FBQ1YsY0FBSSxDQUFDLE9BQUssZUFBZSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM1QyxtQkFBSyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO1dBQzFDO1NBQ0YsQ0FBQyxDQUNELElBQUksQ0FBQztpQkFBTSxPQUFLLGVBQWUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDO1NBQUEsQ0FBQyxDQUFBO09BQzFEO0FBQ0QsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNsRDs7O1dBRWEsMEJBQUc7QUFDZixhQUFPLEdBQUcsQ0FBQTtLQUNYOzs7U0FqRGtCLG1CQUFtQjs7O3FCQUFuQixtQkFBbUIiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzb24vc3JjL3Byb3ZpZGVycy9zY2hlbWFzdG9yZS9zY2hlbWFzdG9yZS1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xuaW1wb3J0IGF4aW9zIGZyb20gJ2F4aW9zJ1xuXG5pbXBvcnQgeyBKc29uU2NoZW1hUHJvcG9zYWxQcm92aWRlciB9IGZyb20gJy4uLy4uL2pzb24tc2NoZW1hLXByb3Bvc2FsLXByb3ZpZGVyJ1xuaW1wb3J0IHsgQ29tcG91bmRQcm9wb3NhbFByb3ZpZGVyIH0gZnJvbSAnLi9jb21wb3VuZC1wcm92aWRlcidcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICcuLi8uLi9qc29uLXNjaGVtYS1yZXNvbHZlcidcbmltcG9ydCB7IHdyYXAgfSBmcm9tICcuLi8uLi9qc29uLXNjaGVtYSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZW1hU3RvcmVQcm92aWRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29tcG91bmRQcm92aWVyID0gbmV3IENvbXBvdW5kUHJvcG9zYWxQcm92aWRlcigpXG4gICAgdGhpcy5ibGFja0xpc3QgPSB7fVxuICB9XG5cbiAgZ2V0U2NoZW1hSW5mb3MoKSB7XG4gICAgaWYgKHRoaXMuc2NoZW1hSW5mb3MpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5zY2hlbWFJbmZvcylcbiAgICB9XG4gICAgcmV0dXJuIGF4aW9zLmdldCgnaHR0cDovL3NjaGVtYXN0b3JlLm9yZy9hcGkvanNvbi9jYXRhbG9nLmpzb24nKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UuZGF0YSlcbiAgICAgIC50aGVuKGRhdGEgPT4gZGF0YS5zY2hlbWFzLmZpbHRlcihzY2hlbWEgPT4gQm9vbGVhbihzY2hlbWEuZmlsZU1hdGNoKSkpXG4gICAgICAudGhlbihzY2hlbWFJbmZvcyA9PiB7XG4gICAgICAgIHRoaXMuc2NoZW1hSW5mb3MgPSBzY2hlbWFJbmZvc1xuICAgICAgICByZXR1cm4gc2NoZW1hSW5mb3NcbiAgICAgIH0pXG4gIH1cblxuICBnZXRQcm9wb3NhbHMocmVxdWVzdCkge1xuICAgIGNvbnN0IGZpbGUgPSByZXF1ZXN0LmVkaXRvci5idWZmZXIuZmlsZVxuICAgIGlmICh0aGlzLmJsYWNrTGlzdFtmaWxlLmdldEJhc2VOYW1lKCldKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3NjaGVtYXMgbm90IGF2YWlsYWJsZScpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuICAgIH1cblxuICAgIGlmICghdGhpcy5jb21wb3VuZFByb3ZpZXIuaGFzUHJvcG9zYWxzKGZpbGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRTY2hlbWFJbmZvcygpXG4gICAgICAgIC50aGVuKHNjaGVtYUluZm9zID0+IHNjaGVtYUluZm9zLmZpbHRlcigoeyBmaWxlTWF0Y2ggfSkgPT4gZmlsZU1hdGNoLnNvbWUobWF0Y2ggPT4gbWluaW1hdGNoKGZpbGUuZ2V0QmFzZU5hbWUoKSwgbWF0Y2gpKSkpXG4gICAgICAgIC50aGVuKG1hdGNoaW5nID0+IHtcbiAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IG1hdGNoaW5nLm1hcChzY2hlbWFJbmZvID0+IHJlc29sdmUoc2NoZW1hSW5mby51cmwpLnRoZW4oc2NoZW1hID0+IG5ldyBKc29uU2NoZW1hUHJvcG9zYWxQcm92aWRlcihcbiAgICAgICAgICAgIHNjaGVtYUluZm8uZmlsZU1hdGNoLFxuICAgICAgICAgICAgd3JhcChzY2hlbWEpXG4gICAgICAgICAgKSkpXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihwcm92aWRlcnMgPT4gdGhpcy5jb21wb3VuZFByb3ZpZXIuYWRkUHJvdmlkZXJzKHByb3ZpZGVycykpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMuY29tcG91bmRQcm92aWVyLmhhc1Byb3Bvc2FscyhmaWxlKSkge1xuICAgICAgICAgICAgdGhpcy5ibGFja0xpc3RbZmlsZS5nZXRCYXNlTmFtZSgpXSA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHRoaXMuY29tcG91bmRQcm92aWVyLmdldFByb3Bvc2FscyhyZXF1ZXN0KSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29tcG91bmRQcm92aWVyLmdldFByb3Bvc2FscyhyZXF1ZXN0KVxuICB9XG5cbiAgZ2V0RmlsZVBhdHRlcm4oKSB7XG4gICAgcmV0dXJuICcqJ1xuICB9XG59XG4iXX0=