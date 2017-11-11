
"use strict";

var _ = require("lodash");

// Add an empty line before a node. Mutates the node.
function addEmptyLineBefore(node, /*: postcss$node*/
newline /*: '\n' | '\r\n'*/
) /*: postcss$node*/{
  if (!/\r?\n/.test(node.raws.before)) {
    node.raws.before = _.repeat(newline, 2) + node.raws.before;
  } else if (/^\r?\n/.test(node.raws.before)) {
    node.raws.before = newline + node.raws.before;
  } else if (/\r?\n$/.test(node.raws.before)) {
    node.raws.before = node.raws.before + newline;
  } else {
    node.raws.before = node.raws.before.replace(/(\r?\n)/, newline + "$1");
  }
  return node;
}

module.exports = addEmptyLineBefore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvYWRkRW1wdHlMaW5lQmVmb3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxZQUFZLENBQUM7O0FBRWIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7QUFHNUIsU0FBUyxrQkFBa0IsQ0FDekIsSUFBSTtBQUNKLE9BQU87b0JBQ1k7QUFDbkIsTUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNuQyxRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztHQUM1RCxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzFDLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztHQUMvQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzFDLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztHQUMvQyxNQUFNO0FBQ0wsUUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBSyxPQUFPLFFBQUssQ0FBQztHQUN4RTtBQUNELFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2FkZEVtcHR5TGluZUJlZm9yZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3QgXyA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG5cbi8vIEFkZCBhbiBlbXB0eSBsaW5lIGJlZm9yZSBhIG5vZGUuIE11dGF0ZXMgdGhlIG5vZGUuXG5mdW5jdGlvbiBhZGRFbXB0eUxpbmVCZWZvcmUoXG4gIG5vZGUgLyo6IHBvc3Rjc3Mkbm9kZSovLFxuICBuZXdsaW5lIC8qOiAnXFxuJyB8ICdcXHJcXG4nKi9cbikgLyo6IHBvc3Rjc3Mkbm9kZSovIHtcbiAgaWYgKCEvXFxyP1xcbi8udGVzdChub2RlLnJhd3MuYmVmb3JlKSkge1xuICAgIG5vZGUucmF3cy5iZWZvcmUgPSBfLnJlcGVhdChuZXdsaW5lLCAyKSArIG5vZGUucmF3cy5iZWZvcmU7XG4gIH0gZWxzZSBpZiAoL15cXHI/XFxuLy50ZXN0KG5vZGUucmF3cy5iZWZvcmUpKSB7XG4gICAgbm9kZS5yYXdzLmJlZm9yZSA9IG5ld2xpbmUgKyBub2RlLnJhd3MuYmVmb3JlO1xuICB9IGVsc2UgaWYgKC9cXHI/XFxuJC8udGVzdChub2RlLnJhd3MuYmVmb3JlKSkge1xuICAgIG5vZGUucmF3cy5iZWZvcmUgPSBub2RlLnJhd3MuYmVmb3JlICsgbmV3bGluZTtcbiAgfSBlbHNlIHtcbiAgICBub2RlLnJhd3MuYmVmb3JlID0gbm9kZS5yYXdzLmJlZm9yZS5yZXBsYWNlKC8oXFxyP1xcbikvLCBgJHtuZXdsaW5lfSQxYCk7XG4gIH1cbiAgcmV0dXJuIG5vZGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkRW1wdHlMaW5lQmVmb3JlO1xuIl19