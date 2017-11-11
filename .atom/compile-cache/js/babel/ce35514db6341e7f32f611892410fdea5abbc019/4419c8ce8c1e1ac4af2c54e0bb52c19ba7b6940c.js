Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashFlatten = require('lodash/flatten');

var _lodashFlatten2 = _interopRequireDefault(_lodashFlatten);

var _utils = require('./utils');

var _jsonSchema = require('./json-schema');

/** Base implementation for JSON schema visitor. Applies the parameter function as all non-overwritten methods. */
'use babel';

var DefaultSchemaVisitor = (function () {
  function DefaultSchemaVisitor(defaultVisit) {
    _classCallCheck(this, DefaultSchemaVisitor);

    this.defaultVisit = defaultVisit;
  }

  /** Visitor for finding the child schemas of any schema. */

  // Complex schemas

  _createClass(DefaultSchemaVisitor, [{
    key: 'visitObjectSchema',
    value: function visitObjectSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitArraySchema',
    value: function visitArraySchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitOneOfSchema',
    value: function visitOneOfSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitAllOfSchema',
    value: function visitAllOfSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitAnyOfSchema',
    value: function visitAnyOfSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }

    // Simple schemas
  }, {
    key: 'visitEnumSchema',
    value: function visitEnumSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitStringSchema',
    value: function visitStringSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitNumberSchema',
    value: function visitNumberSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitBooleanSchema',
    value: function visitBooleanSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitNullSchema',
    value: function visitNullSchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }, {
    key: 'visitAnySchema',
    value: function visitAnySchema(schema, parameter) {
      return this.defaultVisit(schema, parameter);
    }
  }]);

  return DefaultSchemaVisitor;
})();

exports.DefaultSchemaVisitor = DefaultSchemaVisitor;

var SchemaInspectorVisitor = (function (_DefaultSchemaVisitor) {
  _inherits(SchemaInspectorVisitor, _DefaultSchemaVisitor);

  function SchemaInspectorVisitor() {
    _classCallCheck(this, SchemaInspectorVisitor);

    _get(Object.getPrototypeOf(SchemaInspectorVisitor.prototype), 'constructor', this).call(this, function () {
      return [];
    });
  }

  /** Visitor for flattening nested schemas. */

  _createClass(SchemaInspectorVisitor, [{
    key: 'visitObjectSchema',
    value: function visitObjectSchema(schema, segment) {
      var childSchema = schema.properties[segment];
      if (childSchema) {
        return [childSchema];
      }
      return schema.patternProperties.filter(function (_ref) {
        var pattern = _ref.pattern;
        return pattern.test(segment);
      }).map(function (p) {
        return p.schema;
      });
    }
  }, {
    key: 'visitArraySchema',
    value: function visitArraySchema(schema) {
      return [schema.itemSchema];
    }
  }, {
    key: 'visitOneOfSchema',
    value: function visitOneOfSchema(schema, segment) {
      var _this = this;

      return (0, _lodashFlatten2['default'])(schema.schemas.map(function (s) {
        return s.accept(_this, segment);
      }));
    }
  }, {
    key: 'visitAllOfSchema',
    value: function visitAllOfSchema(schema, segment) {
      var _this2 = this;

      return (0, _lodashFlatten2['default'])(schema.schemas.map(function (s) {
        return s.accept(_this2, segment);
      }));
    }
  }, {
    key: 'visitAnyOfSchema',
    value: function visitAnyOfSchema(schema, segment) {
      var _this3 = this;

      return (0, _lodashFlatten2['default'])(schema.schemas.map(function (s) {
        return s.accept(_this3, segment);
      }));
    }
  }]);

  return SchemaInspectorVisitor;
})(DefaultSchemaVisitor);

exports.SchemaInspectorVisitor = SchemaInspectorVisitor;

var SchemaFlattenerVisitor = (function (_DefaultSchemaVisitor2) {
  _inherits(SchemaFlattenerVisitor, _DefaultSchemaVisitor2);

  function SchemaFlattenerVisitor() {
    _classCallCheck(this, SchemaFlattenerVisitor);

    _get(Object.getPrototypeOf(SchemaFlattenerVisitor.prototype), 'constructor', this).call(this, function (schema, parameter) {
      return parameter.push(schema);
    });
  }

  /** Visitor for providing value snippets for the given schema. */

  _createClass(SchemaFlattenerVisitor, [{
    key: 'visitOneOfSchema',
    value: function visitOneOfSchema(schema, collector) {
      var _this4 = this;

      schema.schemas.forEach(function (childSchema) {
        return childSchema.accept(_this4, collector);
      });
    }
  }, {
    key: 'visitAllOfSchema',
    value: function visitAllOfSchema(schema, collector) {
      var _this5 = this;

      schema.schemas.forEach(function (childSchema) {
        return childSchema.accept(_this5, collector);
      });
    }
  }, {
    key: 'visitAnyOfSchema',
    value: function visitAnyOfSchema(schema, collector) {
      var _this6 = this;

      schema.schemas.forEach(function (childSchema) {
        return childSchema.accept(_this6, collector);
      });
    }
  }]);

  return SchemaFlattenerVisitor;
})(DefaultSchemaVisitor);

exports.SchemaFlattenerVisitor = SchemaFlattenerVisitor;

var SnippetProposalVisitor = (function (_DefaultSchemaVisitor3) {
  _inherits(SnippetProposalVisitor, _DefaultSchemaVisitor3);

  function SnippetProposalVisitor() {
    _classCallCheck(this, SnippetProposalVisitor);

    _get(Object.getPrototypeOf(SnippetProposalVisitor.prototype), 'constructor', this).call(this, function () {
      return SnippetProposalVisitor.DEFAULT;
    });
  }

  _createClass(SnippetProposalVisitor, [{
    key: 'comma',
    value: function comma(request) {
      return request.shouldAddComma ? ',' : '';
    }
  }, {
    key: 'visitStringLike',
    value: function visitStringLike(schema, request) {
      var isBetweenQuotes = request.isBetweenQuotes;

      var q = isBetweenQuotes ? '' : '"';
      return q + '${1:' + (schema.defaultValue || '') + '}' + q + this.comma(request);
    }
  }, {
    key: 'visitStringSchema',
    value: function visitStringSchema(schema, request) {
      return this.visitStringLike(schema, request);
    }
  }, {
    key: 'visitNumberSchema',
    value: function visitNumberSchema(schema, request) {
      return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '${1:' + (schema.defaultValue || '0') + '}' + this.comma(request);
    }
  }, {
    key: 'visitBooleanSchema',
    value: function visitBooleanSchema(schema, request) {
      return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '${1:' + (schema.defaultValue || 'false') + '}' + this.comma(request);
    }
  }, {
    key: 'visitNullSchema',
    value: function visitNullSchema(schema, request) {
      return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '${1:null}' + this.comma(request);
    }
  }, {
    key: 'visitEnumSchema',
    value: function visitEnumSchema(schema, request) {
      return this.visitStringLike(schema, request);
    }
  }, {
    key: 'visitArraySchema',
    value: function visitArraySchema(schema, request) {
      return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '[$1]' + this.comma(request);
    }
  }, {
    key: 'visitObjectSchema',
    value: function visitObjectSchema(schema, request) {
      return request.isBetweenQuotes ? this.defaultVisit(schema, request) : '{$1}' + this.comma(request);
    }
  }]);

  return SnippetProposalVisitor;
})(DefaultSchemaVisitor);

exports.SnippetProposalVisitor = SnippetProposalVisitor;

SnippetProposalVisitor.DEFAULT = '$1';

/** Visitor for providing an array of IProposal s for any schema. */

var ValueProposalVisitor = (function (_DefaultSchemaVisitor4) {
  _inherits(ValueProposalVisitor, _DefaultSchemaVisitor4);

  function ValueProposalVisitor(snippetVisitor) {
    _classCallCheck(this, ValueProposalVisitor);

    _get(Object.getPrototypeOf(ValueProposalVisitor.prototype), 'constructor', this).call(this, function () {
      return [];
    });
    this.snippetVisitor = snippetVisitor;
  }

  /** Visitor for providing an array of IProposal, when editing key position */

  _createClass(ValueProposalVisitor, [{
    key: 'createBaseProposalFor',
    value: function createBaseProposalFor(schema) {
      return {
        description: schema.description,
        rightLabel: schema.displayType,
        type: 'value'
      };
    }
  }, {
    key: 'visitObjectSchema',
    value: function visitObjectSchema(schema, request) {
      var proposal = this.createBaseProposalFor(schema);
      proposal.displayText = '{}';
      proposal.snippet = schema.accept(this.snippetVisitor, request);
      return [proposal];
    }
  }, {
    key: 'visitArraySchema',
    value: function visitArraySchema(schema, request) {
      var proposal = this.createBaseProposalFor(schema);
      proposal.displayText = '[]';
      proposal.snippet = schema.accept(this.snippetVisitor, request);
      return [proposal];
    }
  }, {
    key: 'visitStringSchema',
    value: function visitStringSchema(schema, request) {
      if (request.isBetweenQuotes) {
        return [];
      }
      var proposal = this.createBaseProposalFor(schema);
      proposal.displayText = schema.defaultValue ? '"' + schema.defaultValue + '"' : '""';
      proposal.snippet = schema.accept(this.snippetVisitor, request);
      return [proposal];
    }
  }, {
    key: 'visitNumberSchema',
    value: function visitNumberSchema(schema, request) {
      if (request.isBetweenQuotes) {
        return [];
      }
      var proposal = this.createBaseProposalFor(schema);
      proposal.displayText = schema.defaultValue ? '' + schema.defaultValue : '0';
      proposal.snippet = schema.accept(this.snippetVisitor, request);
      return [proposal];
    }
  }, {
    key: 'visitBooleanSchema',
    value: function visitBooleanSchema(schema, request) {
      var _this7 = this;

      if (request.isBetweenQuotes) {
        return [];
      }
      return [true, false].map(function (bool) {
        var proposal = _this7.createBaseProposalFor(schema);
        proposal.displayText = bool ? 'true' : 'false';
        proposal.snippet = proposal.displayText + '${1}' + _this7.snippetVisitor.comma(request);
        return proposal;
      });
    }
  }, {
    key: 'visitNullSchema',
    value: function visitNullSchema(schema, request) {
      if (request.isBetweenQuotes) {
        return [];
      }
      var proposal = this.createBaseProposalFor(schema);
      proposal.displayText = schema.defaultValue ? '' + schema.defaultValue : 'null';
      proposal.snippet = schema.accept(this.snippetVisitor, request);
      return [proposal];
    }
  }, {
    key: 'visitEnumSchema',
    value: function visitEnumSchema(schema, request) {
      var _this8 = this;

      var segments = request.segments;
      var contents = request.contents;

      var possibleValues = schema.values;

      if (schema.parent instanceof _jsonSchema.ArraySchema && schema.parent.hasUniqueItems()) {
        (function () {
          var alreadyPresentValues = (0, _utils.resolveObject)(segments.slice(0, segments.length - 1), contents) || [];
          possibleValues = possibleValues.filter(function (value) {
            return alreadyPresentValues.indexOf(value) < 0;
          });
        })();
      }

      return possibleValues.map(function (enumValue) {
        var proposal = _this8.createBaseProposalFor(schema);
        proposal.displayText = enumValue;
        if (request.isBetweenQuotes) {
          proposal.text = enumValue;
        } else {
          proposal.snippet = '"' + enumValue + '${1}"' + _this8.snippetVisitor.comma(request);
        }
        return proposal;
      });
    }
  }, {
    key: 'visitCompositeSchema',
    value: function visitCompositeSchema(schema, request) {
      var _this9 = this;

      return (0, _lodashFlatten2['default'])(schema.schemas.filter(function (s) {
        return !(s instanceof _jsonSchema.AnyOfSchema);
      }).map(function (s) {
        return s.accept(_this9, request).filter(function (r) {
          return r.snippet !== SnippetProposalVisitor.DEFAULT;
        });
      }));
    }
  }, {
    key: 'visitAllOfSchema',
    value: function visitAllOfSchema(schema, request) {
      return this.visitCompositeSchema(schema, request);
    }
  }, {
    key: 'visitAnyOfSchema',
    value: function visitAnyOfSchema(schema, request) {
      return this.visitCompositeSchema(schema, request);
    }
  }, {
    key: 'visitOneOfSchema',
    value: function visitOneOfSchema(schema, request) {
      return this.visitCompositeSchema(schema, request);
    }
  }]);

  return ValueProposalVisitor;
})(DefaultSchemaVisitor);

exports.ValueProposalVisitor = ValueProposalVisitor;

var KeyProposalVisitor = (function (_DefaultSchemaVisitor5) {
  _inherits(KeyProposalVisitor, _DefaultSchemaVisitor5);

  function KeyProposalVisitor(unwrappedContents, snippetVisitor) {
    _classCallCheck(this, KeyProposalVisitor);

    _get(Object.getPrototypeOf(KeyProposalVisitor.prototype), 'constructor', this).call(this, function () {
      return [];
    });
    this.unwrappedContents = unwrappedContents;
    this.snippetVisitor = snippetVisitor;
  }

  _createClass(KeyProposalVisitor, [{
    key: 'visitObjectSchema',
    value: function visitObjectSchema(schema, request) {
      var _this10 = this;

      var prefix = request.prefix;
      var isBetweenQuotes = request.isBetweenQuotes;

      return schema.keys.filter(function (key) {
        return !_this10.unwrappedContents || key.indexOf(prefix) >= 0 && !_this10.unwrappedContents.hasOwnProperty(key);
      }).map(function (key) {
        var valueSchema = schema.properties[key];
        var proposal = {};

        proposal.description = valueSchema.description;
        proposal.type = 'property';
        proposal.displayText = key;
        proposal.rightLabel = valueSchema.displayType;
        if (isBetweenQuotes) {
          proposal.text = key;
        } else {
          var value = schema.properties[key].accept(_this10.snippetVisitor, request);
          proposal.snippet = '"' + key + '": ' + value;
        }
        return proposal;
      });
    }
  }, {
    key: 'visitCompositeSchema',
    value: function visitCompositeSchema(schema, request) {
      var _this11 = this;

      var proposals = schema.schemas.filter(function (s) {
        return s instanceof _jsonSchema.ObjectSchema;
      }).map(function (s) {
        return s.accept(_this11, request);
      });
      return (0, _lodashFlatten2['default'])(proposals);
    }
  }, {
    key: 'visitAllOfSchema',
    value: function visitAllOfSchema(schema, request) {
      return this.visitCompositeSchema(schema, request);
    }
  }, {
    key: 'visitAnyOfSchema',
    value: function visitAnyOfSchema(schema, request) {
      return this.visitCompositeSchema(schema, request);
    }
  }, {
    key: 'visitOneOfSchema',
    value: function visitOneOfSchema(schema, request) {
      return this.visitCompositeSchema(schema, request);
    }
  }]);

  return KeyProposalVisitor;
})(DefaultSchemaVisitor);

exports.KeyProposalVisitor = KeyProposalVisitor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS12aXNpdG9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs2QkFFb0IsZ0JBQWdCOzs7O3FCQUNOLFNBQVM7OzBCQUNnQixlQUFlOzs7QUFKdEUsV0FBVyxDQUFBOztJQU9FLG9CQUFvQjtBQUNwQixXQURBLG9CQUFvQixDQUNuQixZQUFZLEVBQUU7MEJBRGYsb0JBQW9COztBQUU3QixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQTtHQUNqQzs7Ozs7O2VBSFUsb0JBQW9COztXQUtkLDJCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDbkMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ2UsMEJBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUNsQyxhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQzVDOzs7V0FDZSwwQkFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFO0FBQ2xDLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDNUM7OztXQUNlLDBCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDbEMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ2UsMEJBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUNsQyxhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQzVDOzs7OztXQUdjLHlCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDakMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ2dCLDJCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDbkMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ2dCLDJCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDbkMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ2lCLDRCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDcEMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ2MseUJBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUNqQyxhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQzVDOzs7V0FDYSx3QkFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDNUM7OztTQXZDVSxvQkFBb0I7Ozs7O0lBMkNwQixzQkFBc0I7WUFBdEIsc0JBQXNCOztBQUV0QixXQUZBLHNCQUFzQixHQUVuQjswQkFGSCxzQkFBc0I7O0FBRy9CLCtCQUhTLHNCQUFzQiw2Q0FHekI7YUFBTSxFQUFFO0tBQUEsRUFBQztHQUNoQjs7OztlQUpVLHNCQUFzQjs7V0FNaEIsMkJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUNqQyxVQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzlDLFVBQUksV0FBVyxFQUFFO0FBQ2YsZUFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQ3JCO0FBQ0QsYUFBTyxNQUFNLENBQUMsaUJBQWlCLENBQzVCLE1BQU0sQ0FBQyxVQUFDLElBQVc7WUFBVCxPQUFPLEdBQVQsSUFBVyxDQUFULE9BQU87ZUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FDOUMsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxNQUFNO09BQUEsQ0FBQyxDQUFBO0tBQ3RCOzs7V0FFZSwwQkFBQyxNQUFNLEVBQUU7QUFDdkIsYUFBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtLQUMzQjs7O1dBRWUsMEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O0FBQ2hDLGFBQU8sZ0NBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE1BQU0sUUFBTyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQTtLQUNqRTs7O1dBRWUsMEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O0FBQ2hDLGFBQU8sZ0NBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE1BQU0sU0FBTyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQTtLQUNqRTs7O1dBRWUsMEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O0FBQ2hDLGFBQU8sZ0NBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE1BQU0sU0FBTyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQTtLQUNqRTs7O1NBOUJVLHNCQUFzQjtHQUFTLG9CQUFvQjs7OztJQWtDbkQsc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFDdEIsV0FEQSxzQkFBc0IsR0FDbkI7MEJBREgsc0JBQXNCOztBQUUvQiwrQkFGUyxzQkFBc0IsNkNBRXpCLFVBQUMsTUFBTSxFQUFFLFNBQVM7YUFBSyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUFBLEVBQUM7R0FDckQ7Ozs7ZUFIVSxzQkFBc0I7O1dBS2pCLDBCQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUU7OztBQUNsQyxZQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFdBQVc7ZUFBSSxXQUFXLENBQUMsTUFBTSxTQUFPLFNBQVMsQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUMzRTs7O1dBRWUsMEJBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRTs7O0FBQ2xDLFlBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsV0FBVztlQUFJLFdBQVcsQ0FBQyxNQUFNLFNBQU8sU0FBUyxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQzNFOzs7V0FFZSwwQkFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFOzs7QUFDbEMsWUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxXQUFXO2VBQUksV0FBVyxDQUFDLE1BQU0sU0FBTyxTQUFTLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDM0U7OztTQWZVLHNCQUFzQjtHQUFTLG9CQUFvQjs7OztJQW1CbkQsc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFDdEIsV0FEQSxzQkFBc0IsR0FDbkI7MEJBREgsc0JBQXNCOztBQUUvQiwrQkFGUyxzQkFBc0IsNkNBRXpCO2FBQU0sc0JBQXNCLENBQUMsT0FBTztLQUFBLEVBQUM7R0FDNUM7O2VBSFUsc0JBQXNCOztXQUs1QixlQUFDLE9BQU8sRUFBRTtBQUNiLGFBQU8sT0FBTyxDQUFDLGNBQWMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFBO0tBQ3pDOzs7V0FFYyx5QkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO1VBQ3ZCLGVBQWUsR0FBSyxPQUFPLENBQTNCLGVBQWU7O0FBQ3ZCLFVBQU0sQ0FBQyxHQUFHLGVBQWUsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFBO0FBQ3BDLGFBQVUsQ0FBQyxhQUFRLE1BQU0sQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFBLFNBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUU7S0FDMUU7OztXQUVnQiwyQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDN0M7OztXQUVnQiwyQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLGFBQU8sT0FBTyxDQUFDLGVBQWUsR0FDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLGFBQzFCLE1BQU0sQ0FBQyxZQUFZLElBQUksR0FBRyxDQUFBLFNBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBRSxDQUFBO0tBQ2hFOzs7V0FFaUIsNEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUNsQyxhQUFPLE9BQU8sQ0FBQyxlQUFlLEdBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxhQUMxQixNQUFNLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQSxTQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEFBQUUsQ0FBQTtLQUNwRTs7O1dBRWMseUJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUMvQixhQUFPLE9BQU8sQ0FBQyxlQUFlLEdBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxpQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBRSxDQUFBO0tBQ3ZDOzs7V0FFYyx5QkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQy9CLGFBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDN0M7OztXQUVlLDBCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDaEMsYUFBTyxPQUFPLENBQUMsZUFBZSxHQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBRSxDQUFBO0tBQ2pDOzs7V0FFZ0IsMkJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUNqQyxhQUFPLE9BQU8sQ0FBQyxlQUFlLEdBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxBQUFFLENBQUE7S0FDakM7OztTQW5EVSxzQkFBc0I7R0FBUyxvQkFBb0I7Ozs7QUFzRGhFLHNCQUFzQixDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7Ozs7SUFHeEIsb0JBQW9CO1lBQXBCLG9CQUFvQjs7QUFFcEIsV0FGQSxvQkFBb0IsQ0FFbkIsY0FBYyxFQUFFOzBCQUZqQixvQkFBb0I7O0FBRzdCLCtCQUhTLG9CQUFvQiw2Q0FHdkI7YUFBTSxFQUFFO0tBQUEsRUFBQztBQUNmLFFBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBO0dBQ3JDOzs7O2VBTFUsb0JBQW9COztXQU9WLCtCQUFDLE1BQU0sRUFBRTtBQUM1QixhQUFPO0FBQ0wsbUJBQVcsRUFBRSxNQUFNLENBQUMsV0FBVztBQUMvQixrQkFBVSxFQUFFLE1BQU0sQ0FBQyxXQUFXO0FBQzlCLFlBQUksRUFBRSxPQUFPO09BQ2QsQ0FBQTtLQUNGOzs7V0FFZ0IsMkJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUNqQyxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkQsY0FBUSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUE7QUFDM0IsY0FBUSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDOUQsYUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ2xCOzs7V0FFZSwwQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2hDLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuRCxjQUFRLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQTtBQUMzQixjQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUM5RCxhQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDbEI7OztXQUVnQiwyQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLFVBQUksT0FBTyxDQUFDLGVBQWUsRUFBRTtBQUMzQixlQUFPLEVBQUUsQ0FBQTtPQUNWO0FBQ0QsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25ELGNBQVEsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFlBQVksU0FBTyxNQUFNLENBQUMsWUFBWSxTQUFNLElBQUksQ0FBQTtBQUM5RSxjQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUM5RCxhQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDbEI7OztXQUVnQiwyQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLFVBQUksT0FBTyxDQUFDLGVBQWUsRUFBRTtBQUMzQixlQUFPLEVBQUUsQ0FBQTtPQUNWO0FBQ0QsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25ELGNBQVEsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFlBQVksUUFBTSxNQUFNLENBQUMsWUFBWSxHQUFLLEdBQUcsQ0FBQTtBQUMzRSxjQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUM5RCxhQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDbEI7OztXQUVpQiw0QkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFOzs7QUFDbEMsVUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFO0FBQzNCLGVBQU8sRUFBRSxDQUFBO09BQ1Y7QUFDRCxhQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMvQixZQUFNLFFBQVEsR0FBRyxPQUFLLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25ELGdCQUFRLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFBO0FBQzlDLGdCQUFRLENBQUMsT0FBTyxHQUFNLFFBQVEsQ0FBQyxXQUFXLFlBQVEsT0FBSyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxBQUFFLENBQUE7QUFDdEYsZUFBTyxRQUFRLENBQUE7T0FDaEIsQ0FBQyxDQUFBO0tBQ0g7OztXQUVjLHlCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDL0IsVUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFO0FBQzNCLGVBQU8sRUFBRSxDQUFBO09BQ1Y7QUFDRCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkQsY0FBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsWUFBWSxRQUFNLE1BQU0sQ0FBQyxZQUFZLEdBQUssTUFBTSxDQUFBO0FBQzlFLGNBQVEsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQzlELGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNsQjs7O1dBRWMseUJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O1VBQ3ZCLFFBQVEsR0FBZSxPQUFPLENBQTlCLFFBQVE7VUFBRSxRQUFRLEdBQUssT0FBTyxDQUFwQixRQUFROztBQUMxQixVQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFBOztBQUVsQyxVQUFJLEFBQUMsTUFBTSxDQUFDLE1BQU0sbUNBQXVCLElBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRTs7QUFDNUUsY0FBTSxvQkFBb0IsR0FBRywwQkFBYyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNsRyx3QkFBYyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLO21CQUFJLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1dBQUEsQ0FBQyxDQUFBOztPQUN6Rjs7QUFFRCxhQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDckMsWUFBTSxRQUFRLEdBQUcsT0FBSyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuRCxnQkFBUSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUE7QUFDaEMsWUFBSSxPQUFPLENBQUMsZUFBZSxFQUFFO0FBQzNCLGtCQUFRLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQTtTQUMxQixNQUFNO0FBQ0wsa0JBQVEsQ0FBQyxPQUFPLFNBQU8sU0FBUyxhQUFTLE9BQUssY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQUFBRSxDQUFBO1NBQzlFO0FBQ0QsZUFBTyxRQUFRLENBQUE7T0FDaEIsQ0FBQyxDQUFBO0tBQ0g7OztXQUVtQiw4QkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFOzs7QUFDcEMsYUFBTyxnQ0FBUSxNQUFNLENBQUMsT0FBTyxDQUMxQixNQUFNLENBQUMsVUFBQSxDQUFDO2VBQUksRUFBRSxDQUFDLG9DQUF1QixBQUFDO09BQUEsQ0FBQyxDQUN4QyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE1BQU0sU0FBTyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDO2lCQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssc0JBQXNCLENBQUMsT0FBTztTQUFBLENBQUM7T0FBQSxDQUFDLENBQzdGLENBQUE7S0FDRjs7O1dBRWUsMEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUNoQyxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDbEQ7OztXQUVlLDBCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDaEMsYUFBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ2xEOzs7V0FFZSwwQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUNsRDs7O1NBN0dVLG9CQUFvQjtHQUFTLG9CQUFvQjs7OztJQWlIakQsa0JBQWtCO1lBQWxCLGtCQUFrQjs7QUFFbEIsV0FGQSxrQkFBa0IsQ0FFakIsaUJBQWlCLEVBQUUsY0FBYyxFQUFFOzBCQUZwQyxrQkFBa0I7O0FBRzNCLCtCQUhTLGtCQUFrQiw2Q0FHcEI7YUFBTSxFQUFFO0tBQUEsRUFBRTtBQUNqQixRQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUE7QUFDMUMsUUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7R0FDckM7O2VBTlUsa0JBQWtCOztXQVFaLDJCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7OztVQUN6QixNQUFNLEdBQXNCLE9BQU8sQ0FBbkMsTUFBTTtVQUFFLGVBQWUsR0FBSyxPQUFPLENBQTNCLGVBQWU7O0FBQy9CLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FDZixNQUFNLENBQUMsVUFBQSxHQUFHO2VBQUksQ0FBQyxRQUFLLGlCQUFpQixJQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBSyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEFBQUM7T0FBQSxDQUFDLENBQ25ILEdBQUcsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNWLFlBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDMUMsWUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFBOztBQUVuQixnQkFBUSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFBO0FBQzlDLGdCQUFRLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQTtBQUMxQixnQkFBUSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUE7QUFDMUIsZ0JBQVEsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQTtBQUM3QyxZQUFJLGVBQWUsRUFBRTtBQUNuQixrQkFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUE7U0FDcEIsTUFBTTtBQUNMLGNBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQUssY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3pFLGtCQUFRLENBQUMsT0FBTyxTQUFPLEdBQUcsV0FBTSxLQUFLLEFBQUUsQ0FBQTtTQUN4QztBQUNELGVBQU8sUUFBUSxDQUFBO09BQ2hCLENBQUMsQ0FBQTtLQUNMOzs7V0FFbUIsOEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O0FBQ3BDLFVBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQzdCLE1BQU0sQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLG9DQUF3QjtPQUFBLENBQUMsQ0FDdEMsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsQ0FBQyxNQUFNLFVBQU8sT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ3BDLGFBQU8sZ0NBQVEsU0FBUyxDQUFDLENBQUE7S0FDMUI7OztXQUVlLDBCQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDaEMsYUFBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ2xEOzs7V0FFZSwwQkFBQyxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2hDLGFBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUNsRDs7O1dBRWUsMEJBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUNoQyxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDbEQ7OztTQS9DVSxrQkFBa0I7R0FBUyxvQkFBb0IiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzb24vc3JjL2pzb24tc2NoZW1hLXZpc2l0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IGZsYXR0ZW4gZnJvbSAnbG9kYXNoL2ZsYXR0ZW4nXG5pbXBvcnQgeyByZXNvbHZlT2JqZWN0IH0gZnJvbSAnLi91dGlscydcbmltcG9ydCB7IEFycmF5U2NoZW1hLCBPYmplY3RTY2hlbWEsIEFueU9mU2NoZW1hIH0gZnJvbSAnLi9qc29uLXNjaGVtYSdcblxuLyoqIEJhc2UgaW1wbGVtZW50YXRpb24gZm9yIEpTT04gc2NoZW1hIHZpc2l0b3IuIEFwcGxpZXMgdGhlIHBhcmFtZXRlciBmdW5jdGlvbiBhcyBhbGwgbm9uLW92ZXJ3cml0dGVuIG1ldGhvZHMuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFNjaGVtYVZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcihkZWZhdWx0VmlzaXQpIHtcbiAgICB0aGlzLmRlZmF1bHRWaXNpdCA9IGRlZmF1bHRWaXNpdFxuICB9XG4gIC8vIENvbXBsZXggc2NoZW1hc1xuICB2aXNpdE9iamVjdFNjaGVtYShzY2hlbWEsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB0aGlzLmRlZmF1bHRWaXNpdChzY2hlbWEsIHBhcmFtZXRlcilcbiAgfVxuICB2aXNpdEFycmF5U2NoZW1hKHNjaGVtYSwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcGFyYW1ldGVyKVxuICB9XG4gIHZpc2l0T25lT2ZTY2hlbWEoc2NoZW1hLCBwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZhdWx0VmlzaXQoc2NoZW1hLCBwYXJhbWV0ZXIpXG4gIH1cbiAgdmlzaXRBbGxPZlNjaGVtYShzY2hlbWEsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB0aGlzLmRlZmF1bHRWaXNpdChzY2hlbWEsIHBhcmFtZXRlcilcbiAgfVxuICB2aXNpdEFueU9mU2NoZW1hKHNjaGVtYSwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcGFyYW1ldGVyKVxuICB9XG5cbiAgLy8gU2ltcGxlIHNjaGVtYXNcbiAgdmlzaXRFbnVtU2NoZW1hKHNjaGVtYSwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcGFyYW1ldGVyKVxuICB9XG4gIHZpc2l0U3RyaW5nU2NoZW1hKHNjaGVtYSwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcGFyYW1ldGVyKVxuICB9XG4gIHZpc2l0TnVtYmVyU2NoZW1hKHNjaGVtYSwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcGFyYW1ldGVyKVxuICB9XG4gIHZpc2l0Qm9vbGVhblNjaGVtYShzY2hlbWEsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB0aGlzLmRlZmF1bHRWaXNpdChzY2hlbWEsIHBhcmFtZXRlcilcbiAgfVxuICB2aXNpdE51bGxTY2hlbWEoc2NoZW1hLCBwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZhdWx0VmlzaXQoc2NoZW1hLCBwYXJhbWV0ZXIpXG4gIH1cbiAgdmlzaXRBbnlTY2hlbWEoc2NoZW1hLCBwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gdGhpcy5kZWZhdWx0VmlzaXQoc2NoZW1hLCBwYXJhbWV0ZXIpXG4gIH1cbn1cblxuLyoqIFZpc2l0b3IgZm9yIGZpbmRpbmcgdGhlIGNoaWxkIHNjaGVtYXMgb2YgYW55IHNjaGVtYS4gKi9cbmV4cG9ydCBjbGFzcyBTY2hlbWFJbnNwZWN0b3JWaXNpdG9yIGV4dGVuZHMgRGVmYXVsdFNjaGVtYVZpc2l0b3Ige1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCgpID0+IFtdKVxuICB9XG5cbiAgdmlzaXRPYmplY3RTY2hlbWEoc2NoZW1hLCBzZWdtZW50KSB7XG4gICAgY29uc3QgY2hpbGRTY2hlbWEgPSBzY2hlbWEucHJvcGVydGllc1tzZWdtZW50XVxuICAgIGlmIChjaGlsZFNjaGVtYSkge1xuICAgICAgcmV0dXJuIFtjaGlsZFNjaGVtYV1cbiAgICB9XG4gICAgcmV0dXJuIHNjaGVtYS5wYXR0ZXJuUHJvcGVydGllc1xuICAgICAgLmZpbHRlcigoeyBwYXR0ZXJuIH0pID0+IHBhdHRlcm4udGVzdChzZWdtZW50KSlcbiAgICAgIC5tYXAocCA9PiBwLnNjaGVtYSlcbiAgfVxuXG4gIHZpc2l0QXJyYXlTY2hlbWEoc2NoZW1hKSB7XG4gICAgcmV0dXJuIFtzY2hlbWEuaXRlbVNjaGVtYV1cbiAgfVxuXG4gIHZpc2l0T25lT2ZTY2hlbWEoc2NoZW1hLCBzZWdtZW50KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oc2NoZW1hLnNjaGVtYXMubWFwKHMgPT4gcy5hY2NlcHQodGhpcywgc2VnbWVudCkpKVxuICB9XG5cbiAgdmlzaXRBbGxPZlNjaGVtYShzY2hlbWEsIHNlZ21lbnQpIHtcbiAgICByZXR1cm4gZmxhdHRlbihzY2hlbWEuc2NoZW1hcy5tYXAocyA9PiBzLmFjY2VwdCh0aGlzLCBzZWdtZW50KSkpXG4gIH1cblxuICB2aXNpdEFueU9mU2NoZW1hKHNjaGVtYSwgc2VnbWVudCkge1xuICAgIHJldHVybiBmbGF0dGVuKHNjaGVtYS5zY2hlbWFzLm1hcChzID0+IHMuYWNjZXB0KHRoaXMsIHNlZ21lbnQpKSlcbiAgfVxufVxuXG4vKiogVmlzaXRvciBmb3IgZmxhdHRlbmluZyBuZXN0ZWQgc2NoZW1hcy4gKi9cbmV4cG9ydCBjbGFzcyBTY2hlbWFGbGF0dGVuZXJWaXNpdG9yIGV4dGVuZHMgRGVmYXVsdFNjaGVtYVZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigoc2NoZW1hLCBwYXJhbWV0ZXIpID0+IHBhcmFtZXRlci5wdXNoKHNjaGVtYSkpXG4gIH1cblxuICB2aXNpdE9uZU9mU2NoZW1hKHNjaGVtYSwgY29sbGVjdG9yKSB7XG4gICAgc2NoZW1hLnNjaGVtYXMuZm9yRWFjaChjaGlsZFNjaGVtYSA9PiBjaGlsZFNjaGVtYS5hY2NlcHQodGhpcywgY29sbGVjdG9yKSlcbiAgfVxuXG4gIHZpc2l0QWxsT2ZTY2hlbWEoc2NoZW1hLCBjb2xsZWN0b3IpIHtcbiAgICBzY2hlbWEuc2NoZW1hcy5mb3JFYWNoKGNoaWxkU2NoZW1hID0+IGNoaWxkU2NoZW1hLmFjY2VwdCh0aGlzLCBjb2xsZWN0b3IpKVxuICB9XG5cbiAgdmlzaXRBbnlPZlNjaGVtYShzY2hlbWEsIGNvbGxlY3Rvcikge1xuICAgIHNjaGVtYS5zY2hlbWFzLmZvckVhY2goY2hpbGRTY2hlbWEgPT4gY2hpbGRTY2hlbWEuYWNjZXB0KHRoaXMsIGNvbGxlY3RvcikpXG4gIH1cbn1cblxuLyoqIFZpc2l0b3IgZm9yIHByb3ZpZGluZyB2YWx1ZSBzbmlwcGV0cyBmb3IgdGhlIGdpdmVuIHNjaGVtYS4gKi9cbmV4cG9ydCBjbGFzcyBTbmlwcGV0UHJvcG9zYWxWaXNpdG9yIGV4dGVuZHMgRGVmYXVsdFNjaGVtYVZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigoKSA9PiBTbmlwcGV0UHJvcG9zYWxWaXNpdG9yLkRFRkFVTFQpXG4gIH1cblxuICBjb21tYShyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHJlcXVlc3Quc2hvdWxkQWRkQ29tbWEgPyAnLCcgOiAnJ1xuICB9XG5cbiAgdmlzaXRTdHJpbmdMaWtlKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIGNvbnN0IHsgaXNCZXR3ZWVuUXVvdGVzIH0gPSByZXF1ZXN0XG4gICAgY29uc3QgcSA9IGlzQmV0d2VlblF1b3RlcyA/ICcnIDogJ1wiJ1xuICAgIHJldHVybiBgJHtxfVxcJHsxOiR7c2NoZW1hLmRlZmF1bHRWYWx1ZSB8fCAnJ319JHtxfSR7dGhpcy5jb21tYShyZXF1ZXN0KX1gXG4gIH1cblxuICB2aXNpdFN0cmluZ1NjaGVtYShzY2hlbWEsIHJlcXVlc3QpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdFN0cmluZ0xpa2Uoc2NoZW1hLCByZXF1ZXN0KVxuICB9XG5cbiAgdmlzaXROdW1iZXJTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHJlcXVlc3QuaXNCZXR3ZWVuUXVvdGVzXG4gICAgICA/IHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcmVxdWVzdClcbiAgICAgIDogYFxcJHsxOiR7c2NoZW1hLmRlZmF1bHRWYWx1ZSB8fCAnMCd9fSR7dGhpcy5jb21tYShyZXF1ZXN0KX1gXG4gIH1cblxuICB2aXNpdEJvb2xlYW5TY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHJlcXVlc3QuaXNCZXR3ZWVuUXVvdGVzXG4gICAgICA/IHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcmVxdWVzdClcbiAgICAgIDogYFxcJHsxOiR7c2NoZW1hLmRlZmF1bHRWYWx1ZSB8fCAnZmFsc2UnfX0ke3RoaXMuY29tbWEocmVxdWVzdCl9YFxuICB9XG5cbiAgdmlzaXROdWxsU2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIHJldHVybiByZXF1ZXN0LmlzQmV0d2VlblF1b3Rlc1xuICAgICAgPyB0aGlzLmRlZmF1bHRWaXNpdChzY2hlbWEsIHJlcXVlc3QpXG4gICAgICA6IGBcXCR7MTpudWxsfSR7dGhpcy5jb21tYShyZXF1ZXN0KX1gXG4gIH1cblxuICB2aXNpdEVudW1TY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRTdHJpbmdMaWtlKHNjaGVtYSwgcmVxdWVzdClcbiAgfVxuXG4gIHZpc2l0QXJyYXlTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHJlcXVlc3QuaXNCZXR3ZWVuUXVvdGVzXG4gICAgICA/IHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcmVxdWVzdClcbiAgICAgIDogYFskMV0ke3RoaXMuY29tbWEocmVxdWVzdCl9YFxuICB9XG5cbiAgdmlzaXRPYmplY3RTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHJlcXVlc3QuaXNCZXR3ZWVuUXVvdGVzXG4gICAgICA/IHRoaXMuZGVmYXVsdFZpc2l0KHNjaGVtYSwgcmVxdWVzdClcbiAgICAgIDogYHskMX0ke3RoaXMuY29tbWEocmVxdWVzdCl9YFxuICB9XG59XG5cblNuaXBwZXRQcm9wb3NhbFZpc2l0b3IuREVGQVVMVCA9ICckMSdcblxuLyoqIFZpc2l0b3IgZm9yIHByb3ZpZGluZyBhbiBhcnJheSBvZiBJUHJvcG9zYWwgcyBmb3IgYW55IHNjaGVtYS4gKi9cbmV4cG9ydCBjbGFzcyBWYWx1ZVByb3Bvc2FsVmlzaXRvciBleHRlbmRzIERlZmF1bHRTY2hlbWFWaXNpdG9yIHtcblxuICBjb25zdHJ1Y3RvcihzbmlwcGV0VmlzaXRvcikge1xuICAgIHN1cGVyKCgpID0+IFtdKVxuICAgIHRoaXMuc25pcHBldFZpc2l0b3IgPSBzbmlwcGV0VmlzaXRvclxuICB9XG5cbiAgY3JlYXRlQmFzZVByb3Bvc2FsRm9yKHNjaGVtYSkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNjcmlwdGlvbjogc2NoZW1hLmRlc2NyaXB0aW9uLFxuICAgICAgcmlnaHRMYWJlbDogc2NoZW1hLmRpc3BsYXlUeXBlLFxuICAgICAgdHlwZTogJ3ZhbHVlJ1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0T2JqZWN0U2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIGNvbnN0IHByb3Bvc2FsID0gdGhpcy5jcmVhdGVCYXNlUHJvcG9zYWxGb3Ioc2NoZW1hKVxuICAgIHByb3Bvc2FsLmRpc3BsYXlUZXh0ID0gJ3t9J1xuICAgIHByb3Bvc2FsLnNuaXBwZXQgPSBzY2hlbWEuYWNjZXB0KHRoaXMuc25pcHBldFZpc2l0b3IsIHJlcXVlc3QpXG4gICAgcmV0dXJuIFtwcm9wb3NhbF1cbiAgfVxuXG4gIHZpc2l0QXJyYXlTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgY29uc3QgcHJvcG9zYWwgPSB0aGlzLmNyZWF0ZUJhc2VQcm9wb3NhbEZvcihzY2hlbWEpXG4gICAgcHJvcG9zYWwuZGlzcGxheVRleHQgPSAnW10nXG4gICAgcHJvcG9zYWwuc25pcHBldCA9IHNjaGVtYS5hY2NlcHQodGhpcy5zbmlwcGV0VmlzaXRvciwgcmVxdWVzdClcbiAgICByZXR1cm4gW3Byb3Bvc2FsXVxuICB9XG5cbiAgdmlzaXRTdHJpbmdTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgaWYgKHJlcXVlc3QuaXNCZXR3ZWVuUXVvdGVzKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gICAgY29uc3QgcHJvcG9zYWwgPSB0aGlzLmNyZWF0ZUJhc2VQcm9wb3NhbEZvcihzY2hlbWEpXG4gICAgcHJvcG9zYWwuZGlzcGxheVRleHQgPSBzY2hlbWEuZGVmYXVsdFZhbHVlID8gYFwiJHtzY2hlbWEuZGVmYXVsdFZhbHVlfVwiYCA6ICdcIlwiJ1xuICAgIHByb3Bvc2FsLnNuaXBwZXQgPSBzY2hlbWEuYWNjZXB0KHRoaXMuc25pcHBldFZpc2l0b3IsIHJlcXVlc3QpXG4gICAgcmV0dXJuIFtwcm9wb3NhbF1cbiAgfVxuXG4gIHZpc2l0TnVtYmVyU2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIGlmIChyZXF1ZXN0LmlzQmV0d2VlblF1b3Rlcykge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIGNvbnN0IHByb3Bvc2FsID0gdGhpcy5jcmVhdGVCYXNlUHJvcG9zYWxGb3Ioc2NoZW1hKVxuICAgIHByb3Bvc2FsLmRpc3BsYXlUZXh0ID0gc2NoZW1hLmRlZmF1bHRWYWx1ZSA/IGAke3NjaGVtYS5kZWZhdWx0VmFsdWV9YCA6ICcwJ1xuICAgIHByb3Bvc2FsLnNuaXBwZXQgPSBzY2hlbWEuYWNjZXB0KHRoaXMuc25pcHBldFZpc2l0b3IsIHJlcXVlc3QpXG4gICAgcmV0dXJuIFtwcm9wb3NhbF1cbiAgfVxuXG4gIHZpc2l0Qm9vbGVhblNjaGVtYShzY2hlbWEsIHJlcXVlc3QpIHtcbiAgICBpZiAocmVxdWVzdC5pc0JldHdlZW5RdW90ZXMpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICByZXR1cm4gW3RydWUsIGZhbHNlXS5tYXAoYm9vbCA9PiB7XG4gICAgICBjb25zdCBwcm9wb3NhbCA9IHRoaXMuY3JlYXRlQmFzZVByb3Bvc2FsRm9yKHNjaGVtYSlcbiAgICAgIHByb3Bvc2FsLmRpc3BsYXlUZXh0ID0gYm9vbCA/ICd0cnVlJyA6ICdmYWxzZSdcbiAgICAgIHByb3Bvc2FsLnNuaXBwZXQgPSBgJHtwcm9wb3NhbC5kaXNwbGF5VGV4dH1cXCR7MX0ke3RoaXMuc25pcHBldFZpc2l0b3IuY29tbWEocmVxdWVzdCl9YFxuICAgICAgcmV0dXJuIHByb3Bvc2FsXG4gICAgfSlcbiAgfVxuXG4gIHZpc2l0TnVsbFNjaGVtYShzY2hlbWEsIHJlcXVlc3QpIHtcbiAgICBpZiAocmVxdWVzdC5pc0JldHdlZW5RdW90ZXMpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICBjb25zdCBwcm9wb3NhbCA9IHRoaXMuY3JlYXRlQmFzZVByb3Bvc2FsRm9yKHNjaGVtYSlcbiAgICBwcm9wb3NhbC5kaXNwbGF5VGV4dCA9IHNjaGVtYS5kZWZhdWx0VmFsdWUgPyBgJHtzY2hlbWEuZGVmYXVsdFZhbHVlfWAgOiAnbnVsbCdcbiAgICBwcm9wb3NhbC5zbmlwcGV0ID0gc2NoZW1hLmFjY2VwdCh0aGlzLnNuaXBwZXRWaXNpdG9yLCByZXF1ZXN0KVxuICAgIHJldHVybiBbcHJvcG9zYWxdXG4gIH1cblxuICB2aXNpdEVudW1TY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgY29uc3QgeyBzZWdtZW50cywgY29udGVudHMgfSA9IHJlcXVlc3RcbiAgICBsZXQgcG9zc2libGVWYWx1ZXMgPSBzY2hlbWEudmFsdWVzXG5cbiAgICBpZiAoKHNjaGVtYS5wYXJlbnQgaW5zdGFuY2VvZiBBcnJheVNjaGVtYSkgJiYgc2NoZW1hLnBhcmVudC5oYXNVbmlxdWVJdGVtcygpKSB7XG4gICAgICBjb25zdCBhbHJlYWR5UHJlc2VudFZhbHVlcyA9IHJlc29sdmVPYmplY3Qoc2VnbWVudHMuc2xpY2UoMCwgc2VnbWVudHMubGVuZ3RoIC0gMSksIGNvbnRlbnRzKSB8fCBbXVxuICAgICAgcG9zc2libGVWYWx1ZXMgPSBwb3NzaWJsZVZhbHVlcy5maWx0ZXIodmFsdWUgPT4gYWxyZWFkeVByZXNlbnRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkgPCAwKVxuICAgIH1cblxuICAgIHJldHVybiBwb3NzaWJsZVZhbHVlcy5tYXAoZW51bVZhbHVlID0+IHtcbiAgICAgIGNvbnN0IHByb3Bvc2FsID0gdGhpcy5jcmVhdGVCYXNlUHJvcG9zYWxGb3Ioc2NoZW1hKVxuICAgICAgcHJvcG9zYWwuZGlzcGxheVRleHQgPSBlbnVtVmFsdWVcbiAgICAgIGlmIChyZXF1ZXN0LmlzQmV0d2VlblF1b3Rlcykge1xuICAgICAgICBwcm9wb3NhbC50ZXh0ID0gZW51bVZhbHVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9wb3NhbC5zbmlwcGV0ID0gYFwiJHtlbnVtVmFsdWV9XFwkezF9XCIke3RoaXMuc25pcHBldFZpc2l0b3IuY29tbWEocmVxdWVzdCl9YFxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb3Bvc2FsXG4gICAgfSlcbiAgfVxuXG4gIHZpc2l0Q29tcG9zaXRlU2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIHJldHVybiBmbGF0dGVuKHNjaGVtYS5zY2hlbWFzXG4gICAgICAuZmlsdGVyKHMgPT4gIShzIGluc3RhbmNlb2YgQW55T2ZTY2hlbWEpKVxuICAgICAgLm1hcChzID0+IHMuYWNjZXB0KHRoaXMsIHJlcXVlc3QpLmZpbHRlcihyID0+IHIuc25pcHBldCAhPT0gU25pcHBldFByb3Bvc2FsVmlzaXRvci5ERUZBVUxUKSlcbiAgICApXG4gIH1cblxuICB2aXNpdEFsbE9mU2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0Q29tcG9zaXRlU2NoZW1hKHNjaGVtYSwgcmVxdWVzdClcbiAgfVxuXG4gIHZpc2l0QW55T2ZTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRDb21wb3NpdGVTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KVxuICB9XG5cbiAgdmlzaXRPbmVPZlNjaGVtYShzY2hlbWEsIHJlcXVlc3QpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdENvbXBvc2l0ZVNjaGVtYShzY2hlbWEsIHJlcXVlc3QpXG4gIH1cbn1cblxuLyoqIFZpc2l0b3IgZm9yIHByb3ZpZGluZyBhbiBhcnJheSBvZiBJUHJvcG9zYWwsIHdoZW4gZWRpdGluZyBrZXkgcG9zaXRpb24gKi9cbmV4cG9ydCBjbGFzcyBLZXlQcm9wb3NhbFZpc2l0b3IgZXh0ZW5kcyBEZWZhdWx0U2NoZW1hVmlzaXRvciB7XG5cbiAgY29uc3RydWN0b3IodW53cmFwcGVkQ29udGVudHMsIHNuaXBwZXRWaXNpdG9yKSB7XG4gICAgc3VwZXIoKCgpID0+IFtdKSlcbiAgICB0aGlzLnVud3JhcHBlZENvbnRlbnRzID0gdW53cmFwcGVkQ29udGVudHNcbiAgICB0aGlzLnNuaXBwZXRWaXNpdG9yID0gc25pcHBldFZpc2l0b3JcbiAgfVxuXG4gIHZpc2l0T2JqZWN0U2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIGNvbnN0IHsgcHJlZml4LCBpc0JldHdlZW5RdW90ZXMgfSA9IHJlcXVlc3RcbiAgICByZXR1cm4gc2NoZW1hLmtleXNcbiAgICAgIC5maWx0ZXIoa2V5ID0+ICF0aGlzLnVud3JhcHBlZENvbnRlbnRzIHx8IChrZXkuaW5kZXhPZihwcmVmaXgpID49IDAgJiYgIXRoaXMudW53cmFwcGVkQ29udGVudHMuaGFzT3duUHJvcGVydHkoa2V5KSkpXG4gICAgICAubWFwKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlU2NoZW1hID0gc2NoZW1hLnByb3BlcnRpZXNba2V5XVxuICAgICAgICBjb25zdCBwcm9wb3NhbCA9IHt9XG5cbiAgICAgICAgcHJvcG9zYWwuZGVzY3JpcHRpb24gPSB2YWx1ZVNjaGVtYS5kZXNjcmlwdGlvblxuICAgICAgICBwcm9wb3NhbC50eXBlID0gJ3Byb3BlcnR5J1xuICAgICAgICBwcm9wb3NhbC5kaXNwbGF5VGV4dCA9IGtleVxuICAgICAgICBwcm9wb3NhbC5yaWdodExhYmVsID0gdmFsdWVTY2hlbWEuZGlzcGxheVR5cGVcbiAgICAgICAgaWYgKGlzQmV0d2VlblF1b3Rlcykge1xuICAgICAgICAgIHByb3Bvc2FsLnRleHQgPSBrZXlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0uYWNjZXB0KHRoaXMuc25pcHBldFZpc2l0b3IsIHJlcXVlc3QpXG4gICAgICAgICAgcHJvcG9zYWwuc25pcHBldCA9IGBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvcG9zYWxcbiAgICAgIH0pXG4gIH1cblxuICB2aXNpdENvbXBvc2l0ZVNjaGVtYShzY2hlbWEsIHJlcXVlc3QpIHtcbiAgICBjb25zdCBwcm9wb3NhbHMgPSBzY2hlbWEuc2NoZW1hc1xuICAgICAgLmZpbHRlcihzID0+IHMgaW5zdGFuY2VvZiBPYmplY3RTY2hlbWEpXG4gICAgICAubWFwKHMgPT4gcy5hY2NlcHQodGhpcywgcmVxdWVzdCkpXG4gICAgcmV0dXJuIGZsYXR0ZW4ocHJvcG9zYWxzKVxuICB9XG5cbiAgdmlzaXRBbGxPZlNjaGVtYShzY2hlbWEsIHJlcXVlc3QpIHtcbiAgICByZXR1cm4gdGhpcy52aXNpdENvbXBvc2l0ZVNjaGVtYShzY2hlbWEsIHJlcXVlc3QpXG4gIH1cblxuICB2aXNpdEFueU9mU2NoZW1hKHNjaGVtYSwgcmVxdWVzdCkge1xuICAgIHJldHVybiB0aGlzLnZpc2l0Q29tcG9zaXRlU2NoZW1hKHNjaGVtYSwgcmVxdWVzdClcbiAgfVxuXG4gIHZpc2l0T25lT2ZTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRDb21wb3NpdGVTY2hlbWEoc2NoZW1hLCByZXF1ZXN0KVxuICB9XG59XG4iXX0=