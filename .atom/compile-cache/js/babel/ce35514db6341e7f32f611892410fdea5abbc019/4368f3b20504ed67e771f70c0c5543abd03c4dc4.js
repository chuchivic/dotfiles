
"use strict";

var _ = require("lodash");
var hasBlock = require("../utils/hasBlock");

/**
 * Check whether a Node is a custom property set
 */
module.exports = function (node /*: Object*/) /*: boolean*/{
  var selector = _.get(node, "raws.selector.raw", node.selector);

  return node.type === "rule" && hasBlock(node) && selector.slice(0, 2) === "--" && selector.slice(-1) === ":";
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaXNDdXN0b21Qcm9wZXJ0eVNldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFBOztBQUVaLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixJQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTs7Ozs7QUFLN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLElBQUksNEJBQTJCO0FBQ3hELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFaEUsU0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUE7Q0FDN0csQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2lzQ3VzdG9tUHJvcGVydHlTZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCJcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIilcbmNvbnN0IGhhc0Jsb2NrID0gcmVxdWlyZShcIi4uL3V0aWxzL2hhc0Jsb2NrXCIpXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIE5vZGUgaXMgYSBjdXN0b20gcHJvcGVydHkgc2V0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5vZGUvKjogT2JqZWN0Ki8pLyo6IGJvb2xlYW4qLyB7XG4gIGNvbnN0IHNlbGVjdG9yID0gXy5nZXQobm9kZSwgXCJyYXdzLnNlbGVjdG9yLnJhd1wiLCBub2RlLnNlbGVjdG9yKVxuXG4gIHJldHVybiBub2RlLnR5cGUgPT09IFwicnVsZVwiICYmIGhhc0Jsb2NrKG5vZGUpICYmIHNlbGVjdG9yLnNsaWNlKDAsIDIpID09PSBcIi0tXCIgJiYgc2VsZWN0b3Iuc2xpY2UoLTEpID09PSBcIjpcIlxufVxuIl19