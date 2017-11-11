
"use strict";

var _ = require("lodash");

function getNodeLine(node /*:: ?: postcss$node*/) /*: number | void*/{
  return _.get(node, "source.start.line");
}

module.exports = function getPreviousNonSharedLineCommentNode(_x) {
  var _again = true;

  _function: while (_again) /*:: ?: postcss$node*/
  /*: postcss$node | void*/{
    var node = _x;
    _again = false;

    if (node === undefined) {
      return undefined;
    }

    var previousNode = node.prev();

    if (_.get(previousNode, "type") !== "comment") {
      return previousNode;
    }

    if (getNodeLine(node) === getNodeLine(previousNode) || previousNode !== undefined && getNodeLine(previousNode) === getNodeLine(previousNode.prev())) {
      _x = previousNode;
      _again = true;
      previousNode = undefined;
      continue _function;
    }

    return previousNode;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvZ2V0UHJldmlvdXNOb25TaGFyZWRMaW5lQ29tbWVudE5vZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7QUFFYixJQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRTVCLFNBQVMsV0FBVyxDQUFDLElBQUksNENBQTZDO0FBQ3BFLFNBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztDQUN6Qzs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsbUNBQW1DOzs7OzJCQUVqQztRQUQxQixJQUFJOzs7QUFFSixRQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDdEIsYUFBTyxTQUFTLENBQUM7S0FDbEI7O0FBRUQsUUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztBQUVqQyxRQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxLQUFLLFNBQVMsRUFBRTtBQUM3QyxhQUFPLFlBQVksQ0FBQztLQUNyQjs7QUFFRCxRQUNFLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQzlDLFlBQVksS0FBSyxTQUFTLElBQ3pCLFdBQVcsQ0FBQyxZQUFZLENBQUMsS0FBSyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEFBQUMsRUFDakU7V0FDMkMsWUFBWTs7QUFYbkQsa0JBQVk7O0tBWWpCOztBQUVELFdBQU8sWUFBWSxDQUFDO0dBQ3JCO0NBQUEsQ0FBQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItc3R5bGVsaW50L25vZGVfbW9kdWxlcy9zdHlsZWxpbnQvbGliL3V0aWxzL2dldFByZXZpb3VzTm9uU2hhcmVkTGluZUNvbW1lbnROb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBfID0gcmVxdWlyZShcImxvZGFzaFwiKTtcblxuZnVuY3Rpb24gZ2V0Tm9kZUxpbmUobm9kZSAvKjo6ID86IHBvc3Rjc3Mkbm9kZSovKSAvKjogbnVtYmVyIHwgdm9pZCovIHtcbiAgcmV0dXJuIF8uZ2V0KG5vZGUsIFwic291cmNlLnN0YXJ0LmxpbmVcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0UHJldmlvdXNOb25TaGFyZWRMaW5lQ29tbWVudE5vZGUoXG4gIG5vZGUgLyo6OiA/OiBwb3N0Y3NzJG5vZGUqL1xuKSAvKjogcG9zdGNzcyRub2RlIHwgdm9pZCovIHtcbiAgaWYgKG5vZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCBwcmV2aW91c05vZGUgPSBub2RlLnByZXYoKTtcblxuICBpZiAoXy5nZXQocHJldmlvdXNOb2RlLCBcInR5cGVcIikgIT09IFwiY29tbWVudFwiKSB7XG4gICAgcmV0dXJuIHByZXZpb3VzTm9kZTtcbiAgfVxuXG4gIGlmIChcbiAgICBnZXROb2RlTGluZShub2RlKSA9PT0gZ2V0Tm9kZUxpbmUocHJldmlvdXNOb2RlKSB8fFxuICAgIChwcmV2aW91c05vZGUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgZ2V0Tm9kZUxpbmUocHJldmlvdXNOb2RlKSA9PT0gZ2V0Tm9kZUxpbmUocHJldmlvdXNOb2RlLnByZXYoKSkpXG4gICkge1xuICAgIHJldHVybiBnZXRQcmV2aW91c05vblNoYXJlZExpbmVDb21tZW50Tm9kZShwcmV2aW91c05vZGUpO1xuICB9XG5cbiAgcmV0dXJuIHByZXZpb3VzTm9kZTtcbn07XG4iXX0=