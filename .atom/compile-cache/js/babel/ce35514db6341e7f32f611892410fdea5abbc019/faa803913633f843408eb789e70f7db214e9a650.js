
"use strict";

var _ = require("lodash");

function getNodeLine(node /*:: ?: postcss$node*/) /*: number | void*/{
  return _.get(node, "source.start.line");
}

module.exports = function getNextNonSharedLineCommentNode(_x) {
  var _again = true;

  _function: while (_again) /*:: ?: postcss$node*/
  /*: postcss$node | void*/{
    var node = _x;
    _again = false;

    if (node === undefined) {
      return undefined;
    }

    var nextNode = node.next();

    if (_.get(nextNode, "type") !== "comment") {
      return nextNode;
    }

    if (getNodeLine(node) === getNodeLine(nextNode) || nextNode !== undefined && getNodeLine(nextNode) === getNodeLine(nextNode.next())) {
      _x = nextNode;
      _again = true;
      nextNode = undefined;
      continue _function;
    }

    return nextNode;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZ2V0TmV4dE5vblNoYXJlZExpbmVDb21tZW50Tm9kZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsWUFBWSxDQUFDOztBQUViLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFNUIsU0FBUyxXQUFXLENBQUMsSUFBSSw0Q0FBNkM7QUFDcEUsU0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0NBQ3pDOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUywrQkFBK0I7Ozs7MkJBRTdCO1FBRDFCLElBQUk7OztBQUVKLFFBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN0QixhQUFPLFNBQVMsQ0FBQztLQUNsQjs7QUFFRCxRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLEtBQUssU0FBUyxFQUFFO0FBQ3pDLGFBQU8sUUFBUSxDQUFDO0tBQ2pCOztBQUVELFFBQ0UsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFDMUMsUUFBUSxLQUFLLFNBQVMsSUFDckIsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQUFBQyxFQUN6RDtXQUN1QyxRQUFROztBQVgzQyxjQUFROztLQVliOztBQUVELFdBQU8sUUFBUSxDQUFDO0dBQ2pCO0NBQUEsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2dldE5leHROb25TaGFyZWRMaW5lQ29tbWVudE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IF8gPSByZXF1aXJlKFwibG9kYXNoXCIpO1xuXG5mdW5jdGlvbiBnZXROb2RlTGluZShub2RlIC8qOjogPzogcG9zdGNzcyRub2RlKi8pIC8qOiBudW1iZXIgfCB2b2lkKi8ge1xuICByZXR1cm4gXy5nZXQobm9kZSwgXCJzb3VyY2Uuc3RhcnQubGluZVwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXROZXh0Tm9uU2hhcmVkTGluZUNvbW1lbnROb2RlKFxuICBub2RlIC8qOjogPzogcG9zdGNzcyRub2RlKi9cbikgLyo6IHBvc3Rjc3Mkbm9kZSB8IHZvaWQqLyB7XG4gIGlmIChub2RlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgbmV4dE5vZGUgPSBub2RlLm5leHQoKTtcblxuICBpZiAoXy5nZXQobmV4dE5vZGUsIFwidHlwZVwiKSAhPT0gXCJjb21tZW50XCIpIHtcbiAgICByZXR1cm4gbmV4dE5vZGU7XG4gIH1cblxuICBpZiAoXG4gICAgZ2V0Tm9kZUxpbmUobm9kZSkgPT09IGdldE5vZGVMaW5lKG5leHROb2RlKSB8fFxuICAgIChuZXh0Tm9kZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBnZXROb2RlTGluZShuZXh0Tm9kZSkgPT09IGdldE5vZGVMaW5lKG5leHROb2RlLm5leHQoKSkpXG4gICkge1xuICAgIHJldHVybiBnZXROZXh0Tm9uU2hhcmVkTGluZUNvbW1lbnROb2RlKG5leHROb2RlKTtcbiAgfVxuXG4gIHJldHVybiBuZXh0Tm9kZTtcbn07XG4iXX0=