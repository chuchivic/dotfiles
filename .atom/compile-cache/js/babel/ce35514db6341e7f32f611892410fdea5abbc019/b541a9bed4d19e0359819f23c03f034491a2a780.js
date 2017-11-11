Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _jsonSchemaTypes = require('./json-schema-types');

var _lodashUniq = require('lodash/uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

'use babel';

var wrap = function wrap(schema) {
  var parent = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  switch ((0, _jsonSchemaTypes.schemaType)(schema)) {
    case _jsonSchemaTypes.ALL_OF_TYPE:
      return new AllOfSchema(schema, parent);
    case _jsonSchemaTypes.ANY_OF_TYPE:
      return new AnyOfSchema(schema, parent);
    case _jsonSchemaTypes.ARRAY_TYPE:
      return new ArraySchema(schema, parent);
    case _jsonSchemaTypes.BOOLEAN_TYPE:
      return new BooleanSchema(schema, parent);
    case _jsonSchemaTypes.ENUM_TYPE:
      return new EnumSchema(schema, parent);
    case _jsonSchemaTypes.NULL_TYPE:
      return new NullSchema(schema, parent);
    case _jsonSchemaTypes.NUMBER_TYPE:
      return new NumberSchema(schema, parent);
    case _jsonSchemaTypes.OBJECT_TYPE:
      return new ObjectSchema(schema, parent);
    case _jsonSchemaTypes.ONE_OF_TYPE:
      return new OneOfSchema(schema, parent);
    case _jsonSchemaTypes.STRING_TYPE:
      return new StringSchema(schema, parent);
    default:
      return new AnySchema({}, parent);
  }
};

exports.wrap = wrap;

var BaseSchema = function BaseSchema(schema, parent) {
  _classCallCheck(this, BaseSchema);

  this.schema = schema;
  this.parent = parent;
  this.description = this.schema.description;
  this.defaultValue = this.schema['default'];
};

exports.BaseSchema = BaseSchema;

var PatternProperty = function PatternProperty(pattern, schema) {
  _classCallCheck(this, PatternProperty);

  this.pattern = pattern;
  this.schema = schema;
};

exports.PatternProperty = PatternProperty;

var ObjectSchema = (function (_BaseSchema) {
  _inherits(ObjectSchema, _BaseSchema);

  function ObjectSchema(schema, parent) {
    var _this = this;

    _classCallCheck(this, ObjectSchema);

    _get(Object.getPrototypeOf(ObjectSchema.prototype), 'constructor', this).call(this, schema, parent);
    var properties = this.schema.properties || {};
    this.keys = Object.keys(properties);
    this.properties = this.keys.reduce(function (object, key) {
      object[key] = wrap(properties[key], _this);
      return object;
    }, {});
    this.patternProperties = Object.keys(this.schema.patternProperties || {}).map(function (key) {
      return [key, _this.schema.patternProperties[key]];
    }).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var pattern = _ref2[0];
      var rawSchema = _ref2[1];
      return new PatternProperty(new RegExp(pattern, 'g'), wrap(rawSchema, _this));
    });
    this.displayType = 'object';
  }

  _createClass(ObjectSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitObjectSchema(this, parameter);
    }
  }]);

  return ObjectSchema;
})(BaseSchema);

exports.ObjectSchema = ObjectSchema;

var ArraySchema = (function (_BaseSchema2) {
  _inherits(ArraySchema, _BaseSchema2);

  function ArraySchema(schema, parent) {
    _classCallCheck(this, ArraySchema);

    _get(Object.getPrototypeOf(ArraySchema.prototype), 'constructor', this).call(this, schema, parent);
    this.itemSchema = wrap(this.schema.items, this);
    this.unique = Boolean(this.schema.uniqueItems || false);
    var itemDisplayType = this.itemSchema && this.itemSchema.displayType ? this.itemSchema.displayType : 'any';
    this.displayType = (0, _lodashUniq2['default'])(itemDisplayType.split('|').map(function (t) {
      return t.trim() + '[]';
    })).join(' | ');
  }

  _createClass(ArraySchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitArraySchema(this, parameter);
    }
  }]);

  return ArraySchema;
})(BaseSchema);

exports.ArraySchema = ArraySchema;

var EnumSchema = (function (_BaseSchema3) {
  _inherits(EnumSchema, _BaseSchema3);

  function EnumSchema(schema, parent) {
    _classCallCheck(this, EnumSchema);

    _get(Object.getPrototypeOf(EnumSchema.prototype), 'constructor', this).call(this, schema, parent);
    this.values = this.schema['enum'];
    this.displayType = 'enum';
  }

  _createClass(EnumSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitEnumSchema(this, parameter);
    }
  }]);

  return EnumSchema;
})(BaseSchema);

exports.EnumSchema = EnumSchema;

var CompositeSchema = (function (_BaseSchema4) {
  _inherits(CompositeSchema, _BaseSchema4);

  function CompositeSchema(schema, parent, keyWord) {
    var _this2 = this;

    _classCallCheck(this, CompositeSchema);

    _get(Object.getPrototypeOf(CompositeSchema.prototype), 'constructor', this).call(this, schema, parent);
    this.schemas = schema[keyWord].map(function (s) {
      return wrap(s, _this2);
    });
    this.defaultValue = null;
    this.displayType = (0, _lodashUniq2['default'])(this.schemas.map(function (s) {
      return s.displayType;
    })).join(' | ');
  }

  return CompositeSchema;
})(BaseSchema);

exports.CompositeSchema = CompositeSchema;

var AnyOfSchema = (function (_CompositeSchema) {
  _inherits(AnyOfSchema, _CompositeSchema);

  function AnyOfSchema(schema, parent) {
    _classCallCheck(this, AnyOfSchema);

    _get(Object.getPrototypeOf(AnyOfSchema.prototype), 'constructor', this).call(this, schema, parent, 'anyOf');
  }

  _createClass(AnyOfSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitAnyOfSchema(this, parameter);
    }
  }]);

  return AnyOfSchema;
})(CompositeSchema);

exports.AnyOfSchema = AnyOfSchema;

var AllOfSchema = (function (_CompositeSchema2) {
  _inherits(AllOfSchema, _CompositeSchema2);

  function AllOfSchema(schema, parent) {
    _classCallCheck(this, AllOfSchema);

    _get(Object.getPrototypeOf(AllOfSchema.prototype), 'constructor', this).call(this, schema, parent, 'allOf');
  }

  _createClass(AllOfSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitAllOfSchema(this, parameter);
    }
  }]);

  return AllOfSchema;
})(CompositeSchema);

exports.AllOfSchema = AllOfSchema;

var OneOfSchema = (function (_CompositeSchema3) {
  _inherits(OneOfSchema, _CompositeSchema3);

  function OneOfSchema(schema, parent) {
    _classCallCheck(this, OneOfSchema);

    _get(Object.getPrototypeOf(OneOfSchema.prototype), 'constructor', this).call(this, schema, parent, 'oneOf');
  }

  _createClass(OneOfSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitOneOfSchema(this, parameter);
    }
  }]);

  return OneOfSchema;
})(CompositeSchema);

exports.OneOfSchema = OneOfSchema;

var NullSchema = (function (_BaseSchema5) {
  _inherits(NullSchema, _BaseSchema5);

  function NullSchema(schema, parent) {
    _classCallCheck(this, NullSchema);

    _get(Object.getPrototypeOf(NullSchema.prototype), 'constructor', this).call(this, schema, parent);
    this.defaultValue = null;
    this.displayType = 'null';
  }

  _createClass(NullSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitNullSchema(this, parameter);
    }
  }]);

  return NullSchema;
})(BaseSchema);

exports.NullSchema = NullSchema;

var StringSchema = (function (_BaseSchema6) {
  _inherits(StringSchema, _BaseSchema6);

  function StringSchema(schema, parent) {
    _classCallCheck(this, StringSchema);

    _get(Object.getPrototypeOf(StringSchema.prototype), 'constructor', this).call(this, schema, parent);
    this.displayType = 'string';
    this.defaultValue = this.defaultValue || '';
  }

  _createClass(StringSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitStringSchema(this, parameter);
    }
  }]);

  return StringSchema;
})(BaseSchema);

exports.StringSchema = StringSchema;

var NumberSchema = (function (_BaseSchema7) {
  _inherits(NumberSchema, _BaseSchema7);

  function NumberSchema(schema, parent) {
    _classCallCheck(this, NumberSchema);

    _get(Object.getPrototypeOf(NumberSchema.prototype), 'constructor', this).call(this, schema, parent);
    this.displayType = 'number';
    this.defaultValue = this.defaultValue || 0;
  }

  _createClass(NumberSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitNumberSchema(this, parameter);
    }
  }]);

  return NumberSchema;
})(BaseSchema);

exports.NumberSchema = NumberSchema;

var BooleanSchema = (function (_BaseSchema8) {
  _inherits(BooleanSchema, _BaseSchema8);

  function BooleanSchema(schema, parent) {
    _classCallCheck(this, BooleanSchema);

    _get(Object.getPrototypeOf(BooleanSchema.prototype), 'constructor', this).call(this, schema, parent);
    this.displayType = 'boolean';
    this.defaultValue = this.defaultValue || false;
  }

  _createClass(BooleanSchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitBooleanSchema(this, parameter);
    }
  }]);

  return BooleanSchema;
})(BaseSchema);

exports.BooleanSchema = BooleanSchema;

var AnySchema = (function (_BaseSchema9) {
  _inherits(AnySchema, _BaseSchema9);

  function AnySchema(schema, parent) {
    _classCallCheck(this, AnySchema);

    _get(Object.getPrototypeOf(AnySchema.prototype), 'constructor', this).call(this, schema, parent);
    this.displayType = 'any';
    this.defaultValue = null;
  }

  _createClass(AnySchema, [{
    key: 'accept',
    value: function accept(visitor, parameter) {
      return visitor.visitAnySchema(this, parameter);
    }
  }]);

  return AnySchema;
})(BaseSchema);

exports.AnySchema = AnySchema;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9qc29uLXNjaGVtYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OytCQUV5SixxQkFBcUI7OzBCQUM3SixhQUFhOzs7O0FBSDlCLFdBQVcsQ0FBQTs7QUFLSixJQUFNLElBQUksR0FBRyxTQUFQLElBQUksQ0FBSSxNQUFNLEVBQW9CO01BQWxCLE1BQU0seURBQUcsSUFBSTs7QUFDeEMsVUFBUSxpQ0FBVyxNQUFNLENBQUM7QUFDeEI7QUFBa0IsYUFBTyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFBQSxBQUN4RDtBQUFrQixhQUFPLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUFBLEFBQ3hEO0FBQWlCLGFBQU8sSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQUEsQUFDdkQ7QUFBbUIsYUFBTyxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFBQSxBQUMzRDtBQUFnQixhQUFPLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUFBLEFBQ3JEO0FBQWdCLGFBQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQUEsQUFDckQ7QUFBa0IsYUFBTyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFBQSxBQUN6RDtBQUFrQixhQUFPLElBQUksWUFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUFBLEFBQ3pEO0FBQWtCLGFBQU8sSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFBO0FBQUEsQUFDeEQ7QUFBa0IsYUFBTyxJQUFJLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFBQSxBQUN6RDtB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QUFTO0dBQVMsVUFBVSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanNvbi9zcmMvanNvbi1zY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBzY2hlbWFUeXBlLCBBTExfT0ZfVFlQRSwgQU5ZX09GX1RZUEUsIEFSUkFZX1RZUEUsIEJPT0xFQU5fVFlQRSwgRU5VTV9UWVBFLCBOVUxMX1RZUEUsIE5VTUJFUl9UWVBFLCBPQkpFQ1RfVFlQRSwgT05FX09GX1RZUEUsIFNUUklOR19UWVBFIH0gZnJvbSAnLi9qc29uLXNjaGVtYS10eXBlcydcbmltcG9ydCB1bmlxIGZyb20gJ2xvZGFzaC91bmlxJ1xuXG5leHBvcnQgY29uc3Qgd3JhcCA9IChzY2hlbWEsIHBhcmVudCA9IG51bGwpID0+IHtcbiAgc3dpdGNoIChzY2hlbWFUeXBlKHNjaGVtYSkpIHtcbiAgICBjYXNlIEFMTF9PRl9UWVBFOiByZXR1cm4gbmV3IEFsbE9mU2NoZW1hKHNjaGVtYSwgcGFyZW50KVxuICAgIGNhc2UgQU5ZX09GX1RZUEU6IHJldHVybiBuZXcgQW55T2ZTY2hlbWEoc2NoZW1hLCBwYXJlbnQpXG4gICAgY2FzZSBBUlJBWV9UWVBFOiByZXR1cm4gbmV3IEFycmF5U2NoZW1hKHNjaGVtYSwgcGFyZW50KVxuICAgIGNhc2UgQk9PTEVBTl9UWVBFOiByZXR1cm4gbmV3IEJvb2xlYW5TY2hlbWEoc2NoZW1hLCBwYXJlbnQpXG4gICAgY2FzZSBFTlVNX1RZUEU6IHJldHVybiBuZXcgRW51bVNjaGVtYShzY2hlbWEsIHBhcmVudClcbiAgICBjYXNlIE5VTExfVFlQRTogcmV0dXJuIG5ldyBOdWxsU2NoZW1hKHNjaGVtYSwgcGFyZW50KVxuICAgIGNhc2UgTlVNQkVSX1RZUEU6IHJldHVybiBuZXcgTnVtYmVyU2NoZW1hKHNjaGVtYSwgcGFyZW50KVxuICAgIGNhc2UgT0JKRUNUX1RZUEU6IHJldHVybiBuZXcgT2JqZWN0U2NoZW1hKHNjaGVtYSwgcGFyZW50KVxuICAgIGNhc2UgT05FX09GX1RZUEU6IHJldHVybiBuZXcgT25lT2ZTY2hlbWEoc2NoZW1hLCBwYXJlbnQpXG4gICAgY2FzZSBTVFJJTkdfVFlQRTogcmV0dXJuIG5ldyBTdHJpbmdTY2hlbWEoc2NoZW1hLCBwYXJlbnQpXG4gICAgZGVmYXVsdDogcmV0dXJuIG5ldyBBbnlTY2hlbWEoe30sIHBhcmVudClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmFzZVNjaGVtYSB7XG4gIGNvbnN0cnVjdG9yKHNjaGVtYSwgcGFyZW50KSB7XG4gICAgdGhpcy5zY2hlbWEgPSBzY2hlbWFcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudFxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSB0aGlzLnNjaGVtYS5kZXNjcmlwdGlvblxuICAgIHRoaXMuZGVmYXVsdFZhbHVlID0gdGhpcy5zY2hlbWFbJ2RlZmF1bHQnXVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXR0ZXJuUHJvcGVydHkge1xuICBjb25zdHJ1Y3RvcihwYXR0ZXJuLCBzY2hlbWEpIHtcbiAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuXG4gICAgdGhpcy5zY2hlbWEgPSBzY2hlbWFcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2JqZWN0U2NoZW1hIGV4dGVuZHMgQmFzZVNjaGVtYSB7XG4gIGNvbnN0cnVjdG9yKHNjaGVtYSwgcGFyZW50KSB7XG4gICAgc3VwZXIoc2NoZW1hLCBwYXJlbnQpXG4gICAgY29uc3QgcHJvcGVydGllcyA9IHRoaXMuc2NoZW1hLnByb3BlcnRpZXMgfHwge31cbiAgICB0aGlzLmtleXMgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKVxuICAgIHRoaXMucHJvcGVydGllcyA9IHRoaXMua2V5cy5yZWR1Y2UoKG9iamVjdCwga2V5KSA9PiB7XG4gICAgICBvYmplY3Rba2V5XSA9IHdyYXAocHJvcGVydGllc1trZXldLCB0aGlzKVxuICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH0sIHt9KVxuICAgIHRoaXMucGF0dGVyblByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyh0aGlzLnNjaGVtYS5wYXR0ZXJuUHJvcGVydGllcyB8fCB7fSlcbiAgICAgIC5tYXAoa2V5ID0+IFtrZXksIHRoaXMuc2NoZW1hLnBhdHRlcm5Qcm9wZXJ0aWVzW2tleV1dKVxuICAgICAgLm1hcCgoW3BhdHRlcm4sIHJhd1NjaGVtYV0pID0+IG5ldyBQYXR0ZXJuUHJvcGVydHkobmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpLCB3cmFwKHJhd1NjaGVtYSwgdGhpcykpKVxuICAgIHRoaXMuZGlzcGxheVR5cGUgPSAnb2JqZWN0J1xuICB9XG5cbiAgYWNjZXB0KHZpc2l0b3IsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0T2JqZWN0U2NoZW1hKHRoaXMsIHBhcmFtZXRlcilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQXJyYXlTY2hlbWEgZXh0ZW5kcyBCYXNlU2NoZW1hIHtcbiAgY29uc3RydWN0b3Ioc2NoZW1hLCBwYXJlbnQpIHtcbiAgICBzdXBlcihzY2hlbWEsIHBhcmVudClcbiAgICB0aGlzLml0ZW1TY2hlbWEgPSB3cmFwKHRoaXMuc2NoZW1hLml0ZW1zLCB0aGlzKVxuICAgIHRoaXMudW5pcXVlID0gQm9vbGVhbih0aGlzLnNjaGVtYS51bmlxdWVJdGVtcyB8fCBmYWxzZSlcbiAgICBjb25zdCBpdGVtRGlzcGxheVR5cGUgPSB0aGlzLml0ZW1TY2hlbWEgJiYgdGhpcy5pdGVtU2NoZW1hLmRpc3BsYXlUeXBlID8gdGhpcy5pdGVtU2NoZW1hLmRpc3BsYXlUeXBlIDogJ2FueSdcbiAgICB0aGlzLmRpc3BsYXlUeXBlID0gdW5pcShpdGVtRGlzcGxheVR5cGUuc3BsaXQoJ3wnKS5tYXAodCA9PiBgJHt0LnRyaW0oKX1bXWApKS5qb2luKCcgfCAnKVxuICB9XG5cbiAgYWNjZXB0KHZpc2l0b3IsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QXJyYXlTY2hlbWEodGhpcywgcGFyYW1ldGVyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbnVtU2NoZW1hIGV4dGVuZHMgQmFzZVNjaGVtYSB7XG4gIGNvbnN0cnVjdG9yKHNjaGVtYSwgcGFyZW50KSB7XG4gICAgc3VwZXIoc2NoZW1hLCBwYXJlbnQpXG4gICAgdGhpcy52YWx1ZXMgPSB0aGlzLnNjaGVtYS5lbnVtXG4gICAgdGhpcy5kaXNwbGF5VHlwZSA9ICdlbnVtJ1xuICB9XG5cbiAgYWNjZXB0KHZpc2l0b3IsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0RW51bVNjaGVtYSh0aGlzLCBwYXJhbWV0ZXIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZVNjaGVtYSBleHRlbmRzIEJhc2VTY2hlbWEge1xuICBjb25zdHJ1Y3RvcihzY2hlbWEsIHBhcmVudCwga2V5V29yZCkge1xuICAgIHN1cGVyKHNjaGVtYSwgcGFyZW50KVxuICAgIHRoaXMuc2NoZW1hcyA9IHNjaGVtYVtrZXlXb3JkXS5tYXAocyA9PiB3cmFwKHMsIHRoaXMpKVxuICAgIHRoaXMuZGVmYXVsdFZhbHVlID0gbnVsbFxuICAgIHRoaXMuZGlzcGxheVR5cGUgPSB1bmlxKHRoaXMuc2NoZW1hcy5tYXAocyA9PiBzLmRpc3BsYXlUeXBlKSkuam9pbignIHwgJylcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQW55T2ZTY2hlbWEgZXh0ZW5kcyBDb21wb3NpdGVTY2hlbWEge1xuICBjb25zdHJ1Y3RvcihzY2hlbWEsIHBhcmVudCkge1xuICAgIHN1cGVyKHNjaGVtYSwgcGFyZW50LCAnYW55T2YnKVxuICB9XG5cbiAgYWNjZXB0KHZpc2l0b3IsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW55T2ZTY2hlbWEodGhpcywgcGFyYW1ldGVyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBbGxPZlNjaGVtYSBleHRlbmRzIENvbXBvc2l0ZVNjaGVtYSB7XG4gIGNvbnN0cnVjdG9yKHNjaGVtYSwgcGFyZW50KSB7XG4gICAgc3VwZXIoc2NoZW1hLCBwYXJlbnQsICdhbGxPZicpXG4gIH1cblxuICBhY2NlcHQodmlzaXRvciwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRBbGxPZlNjaGVtYSh0aGlzLCBwYXJhbWV0ZXIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE9uZU9mU2NoZW1hIGV4dGVuZHMgQ29tcG9zaXRlU2NoZW1hIHtcbiAgY29uc3RydWN0b3Ioc2NoZW1hLCBwYXJlbnQpIHtcbiAgICBzdXBlcihzY2hlbWEsIHBhcmVudCwgJ29uZU9mJylcbiAgfVxuXG4gIGFjY2VwdCh2aXNpdG9yLCBwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE9uZU9mU2NoZW1hKHRoaXMsIHBhcmFtZXRlcilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTnVsbFNjaGVtYSBleHRlbmRzIEJhc2VTY2hlbWEge1xuICBjb25zdHJ1Y3RvcihzY2hlbWEsIHBhcmVudCkge1xuICAgIHN1cGVyKHNjaGVtYSwgcGFyZW50KVxuICAgIHRoaXMuZGVmYXVsdFZhbHVlID0gbnVsbFxuICAgIHRoaXMuZGlzcGxheVR5cGUgPSAnbnVsbCdcbiAgfVxuXG4gIGFjY2VwdCh2aXNpdG9yLCBwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE51bGxTY2hlbWEodGhpcywgcGFyYW1ldGVyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTdHJpbmdTY2hlbWEgZXh0ZW5kcyBCYXNlU2NoZW1hIHtcbiAgY29uc3RydWN0b3Ioc2NoZW1hLCBwYXJlbnQpIHtcbiAgICBzdXBlcihzY2hlbWEsIHBhcmVudClcbiAgICB0aGlzLmRpc3BsYXlUeXBlID0gJ3N0cmluZydcbiAgICB0aGlzLmRlZmF1bHRWYWx1ZSA9IHRoaXMuZGVmYXVsdFZhbHVlIHx8ICcnXG4gIH1cblxuICBhY2NlcHQodmlzaXRvciwgcGFyYW1ldGVyKSB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRTdHJpbmdTY2hlbWEodGhpcywgcGFyYW1ldGVyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBOdW1iZXJTY2hlbWEgZXh0ZW5kcyBCYXNlU2NoZW1hIHtcbiAgY29uc3RydWN0b3Ioc2NoZW1hLCBwYXJlbnQpIHtcbiAgICBzdXBlcihzY2hlbWEsIHBhcmVudClcbiAgICB0aGlzLmRpc3BsYXlUeXBlID0gJ251bWJlcidcbiAgICB0aGlzLmRlZmF1bHRWYWx1ZSA9IHRoaXMuZGVmYXVsdFZhbHVlIHx8IDBcbiAgfVxuXG4gIGFjY2VwdCh2aXNpdG9yLCBwYXJhbWV0ZXIpIHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdE51bWJlclNjaGVtYSh0aGlzLCBwYXJhbWV0ZXIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEJvb2xlYW5TY2hlbWEgZXh0ZW5kcyBCYXNlU2NoZW1hIHtcbiAgY29uc3RydWN0b3Ioc2NoZW1hLCBwYXJlbnQpIHtcbiAgICBzdXBlcihzY2hlbWEsIHBhcmVudClcbiAgICB0aGlzLmRpc3BsYXlUeXBlID0gJ2Jvb2xlYW4nXG4gICAgdGhpcy5kZWZhdWx0VmFsdWUgPSB0aGlzLmRlZmF1bHRWYWx1ZSB8fCBmYWxzZVxuICB9XG5cbiAgYWNjZXB0KHZpc2l0b3IsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0Qm9vbGVhblNjaGVtYSh0aGlzLCBwYXJhbWV0ZXIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFueVNjaGVtYSBleHRlbmRzIEJhc2VTY2hlbWEge1xuICBjb25zdHJ1Y3RvcihzY2hlbWEsIHBhcmVudCkge1xuICAgIHN1cGVyKHNjaGVtYSwgcGFyZW50KVxuICAgIHRoaXMuZGlzcGxheVR5cGUgPSAnYW55J1xuICAgIHRoaXMuZGVmYXVsdFZhbHVlID0gbnVsbFxuICB9XG5cbiAgYWNjZXB0KHZpc2l0b3IsIHBhcmFtZXRlcikge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0QW55U2NoZW1hKHRoaXMsIHBhcmFtZXRlcilcbiAgfVxufVxuIl19