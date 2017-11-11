
"use strict";

/**
 * Check if a statement has an block (empty or otherwise).
 *
 * @param {Rule|AtRule} statement - postcss rule or at-rule node
 * @return {boolean} True if `statement` has a block (empty or otherwise)
 */
module.exports = function (statement /*: postcss$node*/) /*: boolean*/{
  return statement.nodes !== undefined;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaGFzQmxvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLFlBQVksQ0FBQzs7Ozs7Ozs7QUFRYixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVMsU0FBUyxrQ0FBbUM7QUFDcEUsU0FBTyxTQUFTLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQztDQUN0QyxDQUFDIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1zdHlsZWxpbnQvbm9kZV9tb2R1bGVzL3N0eWxlbGludC9saWIvdXRpbHMvaGFzQmxvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBzdGF0ZW1lbnQgaGFzIGFuIGJsb2NrIChlbXB0eSBvciBvdGhlcndpc2UpLlxuICpcbiAqIEBwYXJhbSB7UnVsZXxBdFJ1bGV9IHN0YXRlbWVudCAtIHBvc3Rjc3MgcnVsZSBvciBhdC1ydWxlIG5vZGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgYHN0YXRlbWVudGAgaGFzIGEgYmxvY2sgKGVtcHR5IG9yIG90aGVyd2lzZSlcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdGF0ZW1lbnQgLyo6IHBvc3Rjc3Mkbm9kZSovKSAvKjogYm9vbGVhbiovIHtcbiAgcmV0dXJuIHN0YXRlbWVudC5ub2RlcyAhPT0gdW5kZWZpbmVkO1xufTtcbiJdfQ==