Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _uriJs = require('uri-js');

var _uriJs2 = _interopRequireDefault(_uriJs);

var _lodashIsNil = require('lodash/isNil');

var _lodashIsNil2 = _interopRequireDefault(_lodashIsNil);

var _lodashIsEmpty = require('lodash/isEmpty');

var _lodashIsEmpty2 = _interopRequireDefault(_lodashIsEmpty);

var _lodashAssign = require('lodash/assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _lodashClone = require('lodash/clone');

var _lodashClone2 = _interopRequireDefault(_lodashClone);

var _lodashIsArray = require('lodash/isArray');

var _lodashIsArray2 = _interopRequireDefault(_lodashIsArray);

var _lodashValues = require('lodash/values');

var _lodashValues2 = _interopRequireDefault(_lodashValues);

var _jsonSchemaLoader = require('./json-schema-loader');

var _jsonSchemaTypes = require('./json-schema-types');

'use babel';

var updateSchema = function updateSchema(node) {
  return function (schema) {
    // mutation, not pretty
    delete node['$ref'];
    (0, _lodashAssign2['default'])(node, schema);
  };
};

var resolveInSameDocument = function resolveInSameDocument(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var schema = _x,
        segments = _x2;
    _again = false;

    if ((0, _lodashIsEmpty2['default'])(segments)) {
      return schema;
    }

    var _segments = _toArray(segments);

    var key = _segments[0];

    var tail = _segments.slice(1);

    if (key === '#') {
      _x = schema;
      _x2 = tail;
      _again = true;
      _segments = key = tail = undefined;
      continue _function;
    }
    var subSchema = schema[key];
    _x = subSchema;
    _x2 = tail;
    _again = true;
    _segments = key = tail = subSchema = undefined;
    continue _function;
  }
};

var resolveDocument = function resolveDocument(_x3, _x4) {
  var _again2 = true;

  _function2: while (_again2) {
    var root = _x3,
        node = _x4;
    _again2 = false;
    var $ref = node.$ref;

    if ((0, _lodashIsNil2['default'])($ref)) {
      return Promise.resolve(root);
    }

    var uri = _uriJs2['default'].parse($ref);

    if (uri.reference === 'same-document') {
      updateSchema(node)(resolveInSameDocument(root, $ref.split('/')));
      _x3 = root;
      _x4 = node;
      _again2 = true;
      $ref = uri = undefined;
      continue _function2;
    }

    return (0, _jsonSchemaLoader.loadSchema)($ref).then(function (schema) {
      return resolveInSameDocument(schema, (uri.fragment || '').split('/'));
    }).then(updateSchema(node)).then(function () {
      return node.$ref ? resolveDocument(root, node) : null;
    });
  }
};

var findChildNodes = function findChildNodes(node) {
  // mutation, not pretty but has to be done somewhere
  if ((0, _lodashIsArray2['default'])(node.type)) {
    var childSchemas = node.type.map(function (type) {
      return (0, _lodashAssign2['default'])((0, _lodashClone2['default'])(node), { type: type });
    });
    delete node['type'];
    node.oneOf = childSchemas;
  }

  switch ((0, _jsonSchemaTypes.schemaType)(node)) {
    case _jsonSchemaTypes.ALL_OF_TYPE:
      return node.allOf;
    case _jsonSchemaTypes.ANY_OF_TYPE:
      return node.anyOf;
    case _jsonSchemaTypes.ONE_OF_TYPE:
      return node.oneOf;
    case _jsonSchemaTypes.OBJECT_TYPE:
      return (0, _lodashValues2['default'])(node.properties || {});
    case _jsonSchemaTypes.ARRAY_TYPE:
      return [node.items || {}];
    default:
      return [];
  }
};

var traverseResolve = function traverseResolve(root, node) {
  var resolvedNode = node.$ref ? resolveDocument(root, node) : Promise.resolve();
  return resolvedNode.then(function () {
    var childNodes = findChildNodes(node);
    var childResolvePromises = childNodes.map(function (childNode) {
      return traverseResolve(root, childNode);
    });
    return Promise.all(childResolvePromises);
  });
};

var resolve = function resolve(uri) {
  return (0, _jsonSchemaLoader.loadSchema)(uri).then(function (root) {
    return traverseResolve(root, root).then(function () {
      return root;
    });
  });
};
exports.resolve = resolve;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1yZXNvbHZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztxQkFFa0IsUUFBUTs7OzsyQkFDUixjQUFjOzs7OzZCQUNaLGdCQUFnQjs7Ozs0QkFDakIsZUFBZTs7OzsyQkFDaEIsY0FBYzs7Ozs2QkFDWixnQkFBZ0I7Ozs7NEJBQ2pCLGVBQWU7Ozs7Z0NBRVAsc0JBQXNCOzsrQkFDMEMscUJBQXFCOztBQVhoSCxXQUFXLENBQUE7O0FBYVgsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUcsSUFBSTtTQUFJLFVBQUEsTUFBTSxFQUFJOztBQUVyQyxXQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQixtQ0FBTyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7R0FDckI7Q0FBQSxDQUFBOztBQUVELElBQU0scUJBQXFCLEdBQUcsU0FBeEIscUJBQXFCOzs7NEJBQXlCO1FBQXJCLE1BQU07UUFBRSxRQUFROzs7QUFDN0MsUUFBSSxnQ0FBUSxRQUFRLENBQUMsRUFBRTtBQUNyQixhQUFPLE1BQU0sQ0FBQTtLQUNkOzs2QkFDc0IsUUFBUTs7UUFBeEIsR0FBRzs7UUFBSyxJQUFJOztBQUNuQixRQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7V0FDYyxNQUFNO1lBQUUsSUFBSTs7a0JBRnBDLEdBQUcsR0FBSyxJQUFJOztLQUdsQjtBQUNELFFBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNBLFNBQVM7VUFBRSxJQUFJOztnQkFMckMsR0FBRyxHQUFLLElBQUksR0FJYixTQUFTOztHQUVoQjtDQUFBLENBQUE7O0FBRUQsSUFBTSxlQUFlLEdBQUcsU0FBbEIsZUFBZTs7OzhCQUFtQjtRQUFmLElBQUk7UUFBRSxJQUFJOztRQUN6QixJQUFJLEdBQUssSUFBSSxDQUFiLElBQUk7O0FBRVosUUFBSSw4QkFB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QUFJLENBQUM7YUFBTSxJQUFJO0tBQUEsQ0FBQztHQUFBLENBQUM7Q0FBQSxDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS1yZXNvbHZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB1cmlKcyBmcm9tICd1cmktanMnXG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJ1xuaW1wb3J0IGlzRW1wdHkgZnJvbSAnbG9kYXNoL2lzRW1wdHknXG5pbXBvcnQgYXNzaWduIGZyb20gJ2xvZGFzaC9hc3NpZ24nXG5pbXBvcnQgY2xvbmUgZnJvbSAnbG9kYXNoL2Nsb25lJ1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXknXG5pbXBvcnQgdmFsdWVzIGZyb20gJ2xvZGFzaC92YWx1ZXMnXG5cbmltcG9ydCB7IGxvYWRTY2hlbWEgfSBmcm9tICcuL2pzb24tc2NoZW1hLWxvYWRlcidcbmltcG9ydCB7IHNjaGVtYVR5cGUsIEFMTF9PRl9UWVBFLCBBTllfT0ZfVFlQRSwgT05FX09GX1RZUEUsIE9CSkVDVF9UWVBFLCBBUlJBWV9UWVBFIH0gZnJvbSAnLi9qc29uLXNjaGVtYS10eXBlcydcblxuY29uc3QgdXBkYXRlU2NoZW1hID0gbm9kZSA9PiBzY2hlbWEgPT4ge1xuICAvLyBtdXRhdGlvbiwgbm90IHByZXR0eVxuICBkZWxldGUgbm9kZVsnJHJlZiddXG4gIGFzc2lnbihub2RlLCBzY2hlbWEpXG59XG5cbmNvbnN0IHJlc29sdmVJblNhbWVEb2N1bWVudCA9IChzY2hlbWEsIHNlZ21lbnRzKSA9PiB7XG4gIGlmIChpc0VtcHR5KHNlZ21lbnRzKSkge1xuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuICBjb25zdCBba2V5LCAuLi50YWlsXSA9IHNlZ21lbnRzXG4gIGlmIChrZXkgPT09ICcjJykge1xuICAgIHJldHVybiByZXNvbHZlSW5TYW1lRG9jdW1lbnQoc2NoZW1hLCB0YWlsKVxuICB9XG4gIGNvbnN0IHN1YlNjaGVtYSA9IHNjaGVtYVtrZXldXG4gIHJldHVybiByZXNvbHZlSW5TYW1lRG9jdW1lbnQoc3ViU2NoZW1hLCB0YWlsKVxufVxuXG5jb25zdCByZXNvbHZlRG9jdW1lbnQgPSAocm9vdCwgbm9kZSkgPT4ge1xuICBjb25zdCB7ICRyZWYgfSA9IG5vZGVcblxuICBpZiAoaXNOaWwoJHJlZikpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJvb3QpXG4gIH1cblxuICBjb25zdCB1cmkgPSB1cmlKcy5wYXJzZSgkcmVmKVxuXG4gIGlmICh1cmkucmVmZXJlbmNlID09PSAnc2FtZS1kb2N1bWVudCcpIHtcbiAgICB1cGRhdGVTY2hlbWEobm9kZSkocmVzb2x2ZUluU2FtZURvY3VtZW50KHJvb3QsICRyZWYuc3BsaXQoJy8nKSkpXG4gICAgcmV0dXJuIHJlc29sdmVEb2N1bWVudChyb290LCBub2RlKVxuICB9XG5cbiAgcmV0dXJuIGxvYWRTY2hlbWEoJHJlZilcbiAgICAudGhlbihzY2hlbWEgPT4gcmVzb2x2ZUluU2FtZURvY3VtZW50KHNjaGVtYSwgKHVyaS5mcmFnbWVudCB8fCAnJykuc3BsaXQoJy8nKSkpXG4gICAgLnRoZW4odXBkYXRlU2NoZW1hKG5vZGUpKVxuICAgIC50aGVuKCgpID0+IG5vZGUuJHJlZiA/IHJlc29sdmVEb2N1bWVudChyb290LCBub2RlKSA6IG51bGwpXG59XG5cbmNvbnN0IGZpbmRDaGlsZE5vZGVzID0gbm9kZSA9PiB7XG4gIC8vIG11dGF0aW9uLCBub3QgcHJldHR5IGJ1dCBoYXMgdG8gYmUgZG9uZSBzb21ld2hlcmVcbiAgaWYgKGlzQXJyYXkobm9kZS50eXBlKSkge1xuICAgIGNvbnN0IGNoaWxkU2NoZW1hcyA9IG5vZGUudHlwZS5tYXAodHlwZSA9PiBhc3NpZ24oY2xvbmUobm9kZSksIHsgdHlwZSB9KSlcbiAgICBkZWxldGUgbm9kZVsndHlwZSddXG4gICAgbm9kZS5vbmVPZiA9IGNoaWxkU2NoZW1hc1xuICB9XG5cbiAgc3dpdGNoIChzY2hlbWFUeXBlKG5vZGUpKSB7XG4gICAgY2FzZSBBTExfT0ZfVFlQRTogcmV0dXJuIG5vZGUuYWxsT2ZcbiAgICBjYXNlIEFOWV9PRl9UWVBFOiByZXR1cm4gbm9kZS5hbnlPZlxuICAgIGNhc2UgT05FX09GX1RZUEU6IHJldHVybiBub2RlLm9uZU9mXG4gICAgY2FzZSBPQkpFQ1RfVFlQRTogcmV0dXJuIHZhbHVlcyhub2RlLnByb3BlcnRpZXMgfHwge30pXG4gICAgY2FzZSBBUlJBWV9UWVBFOiByZXR1cm4gW25vZGUuaXRlbXMgfHwge31dXG4gICAgZGVmYXVsdDogcmV0dXJuIFtdXG4gIH1cbn1cblxuY29uc3QgdHJhdmVyc2VSZXNvbHZlID0gKHJvb3QsIG5vZGUpID0+IHtcbiAgY29uc3QgcmVzb2x2ZWROb2RlID0gKG5vZGUuJHJlZiA/IHJlc29sdmVEb2N1bWVudChyb290LCBub2RlKSA6IFByb21pc2UucmVzb2x2ZSgpKVxuICByZXR1cm4gcmVzb2x2ZWROb2RlLnRoZW4oKCkgPT4ge1xuICAgIGNvbnN0IGNoaWxkTm9kZXMgPSBmaW5kQ2hpbGROb2Rlcyhub2RlKVxuICAgIGNvbnN0IGNoaWxkUmVzb2x2ZVByb21pc2VzID0gY2hpbGROb2Rlcy5tYXAoY2hpbGROb2RlID0+IHRyYXZlcnNlUmVzb2x2ZShyb290LCBjaGlsZE5vZGUpKVxuICAgIHJldHVybiBQcm9taXNlLmFsbChjaGlsZFJlc29sdmVQcm9taXNlcylcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHJlc29sdmUgPSB1cmkgPT4gbG9hZFNjaGVtYSh1cmkpXG4gIC50aGVuKHJvb3QgPT4gdHJhdmVyc2VSZXNvbHZlKHJvb3QsIHJvb3QpLnRoZW4oKCkgPT4gcm9vdCkpXG5cbiJdfQ==