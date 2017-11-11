Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _store = require("./../store");

var _store2 = _interopRequireDefault(_store);

var _codeManager = require("./../code-manager");

/**
 * @version 1.0.0
 *
 *
 * The Plugin API allows you to make Hydrogen awesome.
 * You will be able to interact with this class in your Hydrogen Plugin using
 * Atom's [Service API](http://blog.atom.io/2015/03/25/new-services-API.html).
 *
 * Take a look at our [Example Plugin](https://github.com/lgeiger/hydrogen-example-plugin)
 * and the [Atom Flight Manual](http://flight-manual.atom.io/hacking-atom/) for
 * learning how to interact with Hydrogen in your own plugin.
 *
 * @class HydrogenProvider
 */

var HydrogenProvider = (function () {
  function HydrogenProvider(_hydrogen) {
    _classCallCheck(this, HydrogenProvider);

    this._hydrogen = _hydrogen;
    this._happy = true;
  }

  /*
   * Calls your callback when the kernel has changed.
   * @param {Function} Callback
   */

  _createClass(HydrogenProvider, [{
    key: "onDidChangeKernel",
    value: function onDidChangeKernel(callback) {
      this._hydrogen.emitter.on("did-change-kernel", function (kernel) {
        if (kernel) {
          return callback(kernel.getPluginWrapper());
        }
        return callback(null);
      });
    }

    /*
     * Get the `HydrogenKernel` of the currently active text editor.
     * @return {Class} `HydrogenKernel`
     */
  }, {
    key: "getActiveKernel",
    value: function getActiveKernel() {
      if (!_store2["default"].kernel) {
        var grammar = _store2["default"].editor ? _store2["default"].editor.getGrammar().name : "";
        throw new Error("No running kernel for grammar `" + grammar + "` found");
      }

      return _store2["default"].kernel.getPluginWrapper();
    }

    /*
     * Get the `atom$Range` that will run if `hydrogen:run-cell` is called.
     * `null` is returned if no active text editor.
     * @return {Class} `atom$Range`
     */
  }, {
    key: "getCellRange",
    value: function getCellRange(editor) {
      if (!_store2["default"].editor) return null;
      return (0, _codeManager.getCurrentCell)(_store2["default"].editor);
    }

    /*
    *--------
    */
  }]);

  return HydrogenProvider;
})();

exports["default"] = HydrogenProvider;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wbHVnaW4tYXBpL2h5ZHJvZ2VuLXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7cUJBRWtCLFlBQVk7Ozs7MkJBR0MsbUJBQW1COzs7Ozs7Ozs7Ozs7Ozs7OztJQWU3QixnQkFBZ0I7QUFJeEIsV0FKUSxnQkFBZ0IsQ0FJdkIsU0FBYyxFQUFFOzBCQUpULGdCQUFnQjs7QUFLakMsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7R0FDcEI7Ozs7Ozs7ZUFQa0IsZ0JBQWdCOztXQWFsQiwyQkFBQyxRQUFrQixFQUFFO0FBQ3BDLFVBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxVQUFDLE1BQU0sRUFBYztBQUNsRSxZQUFJLE1BQU0sRUFBRTtBQUNWLGlCQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO0FBQ0QsZUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdkIsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7O1dBTWMsMkJBQUc7QUFDaEIsVUFBSSxDQUFDLG1CQUFNLE1BQU0sRUFBRTtBQUNqQixZQUFNLE9BQU8sR0FBRyxtQkFBTSxNQUFNLEdBQUcsbUJBQU0sTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkUsY0FBTSxJQUFJLEtBQUsscUNBQW9DLE9BQU8sYUFBVyxDQUFDO09BQ3ZFOztBQUVELGFBQU8sbUJBQU0sTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDeEM7Ozs7Ozs7OztXQU9XLHNCQUFDLE1BQXdCLEVBQUU7QUFDckMsVUFBSSxDQUFDLG1CQUFNLE1BQU0sRUFBRSxPQUFPLElBQUksQ0FBQztBQUMvQixhQUFPLGlDQUFlLG1CQUFNLE1BQU0sQ0FBQyxDQUFDO0tBQ3JDOzs7Ozs7O1NBM0NrQixnQkFBZ0I7OztxQkFBaEIsZ0JBQWdCIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wbHVnaW4tYXBpL2h5ZHJvZ2VuLXByb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHN0b3JlIGZyb20gXCIuLy4uL3N0b3JlXCI7XG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4vLi4va2VybmVsXCI7XG5pbXBvcnQgdHlwZSBaTVFLZXJuZWwgZnJvbSBcIi4vLi4vem1xLWtlcm5lbC5qc1wiO1xuaW1wb3J0IHsgZ2V0Q3VycmVudENlbGwgfSBmcm9tIFwiLi8uLi9jb2RlLW1hbmFnZXJcIjtcbi8qKlxuICogQHZlcnNpb24gMS4wLjBcbiAqXG4gKlxuICogVGhlIFBsdWdpbiBBUEkgYWxsb3dzIHlvdSB0byBtYWtlIEh5ZHJvZ2VuIGF3ZXNvbWUuXG4gKiBZb3Ugd2lsbCBiZSBhYmxlIHRvIGludGVyYWN0IHdpdGggdGhpcyBjbGFzcyBpbiB5b3VyIEh5ZHJvZ2VuIFBsdWdpbiB1c2luZ1xuICogQXRvbSdzIFtTZXJ2aWNlIEFQSV0oaHR0cDovL2Jsb2cuYXRvbS5pby8yMDE1LzAzLzI1L25ldy1zZXJ2aWNlcy1BUEkuaHRtbCkuXG4gKlxuICogVGFrZSBhIGxvb2sgYXQgb3VyIFtFeGFtcGxlIFBsdWdpbl0oaHR0cHM6Ly9naXRodWIuY29tL2xnZWlnZXIvaHlkcm9nZW4tZXhhbXBsZS1wbHVnaW4pXG4gKiBhbmQgdGhlIFtBdG9tIEZsaWdodCBNYW51YWxdKGh0dHA6Ly9mbGlnaHQtbWFudWFsLmF0b20uaW8vaGFja2luZy1hdG9tLykgZm9yXG4gKiBsZWFybmluZyBob3cgdG8gaW50ZXJhY3Qgd2l0aCBIeWRyb2dlbiBpbiB5b3VyIG93biBwbHVnaW4uXG4gKlxuICogQGNsYXNzIEh5ZHJvZ2VuUHJvdmlkZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSHlkcm9nZW5Qcm92aWRlciB7XG4gIF9oeWRyb2dlbjogYW55O1xuICBfaGFwcHk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoX2h5ZHJvZ2VuOiBhbnkpIHtcbiAgICB0aGlzLl9oeWRyb2dlbiA9IF9oeWRyb2dlbjtcbiAgICB0aGlzLl9oYXBweSA9IHRydWU7XG4gIH1cblxuICAvKlxuICAgKiBDYWxscyB5b3VyIGNhbGxiYWNrIHdoZW4gdGhlIGtlcm5lbCBoYXMgY2hhbmdlZC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gQ2FsbGJhY2tcbiAgICovXG4gIG9uRGlkQ2hhbmdlS2VybmVsKGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIHRoaXMuX2h5ZHJvZ2VuLmVtaXR0ZXIub24oXCJkaWQtY2hhbmdlLWtlcm5lbFwiLCAoa2VybmVsOiA/S2VybmVsKSA9PiB7XG4gICAgICBpZiAoa2VybmVsKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhrZXJuZWwuZ2V0UGx1Z2luV3JhcHBlcigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIEdldCB0aGUgYEh5ZHJvZ2VuS2VybmVsYCBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSB0ZXh0IGVkaXRvci5cbiAgICogQHJldHVybiB7Q2xhc3N9IGBIeWRyb2dlbktlcm5lbGBcbiAgICovXG4gIGdldEFjdGl2ZUtlcm5lbCgpIHtcbiAgICBpZiAoIXN0b3JlLmtlcm5lbCkge1xuICAgICAgY29uc3QgZ3JhbW1hciA9IHN0b3JlLmVkaXRvciA/IHN0b3JlLmVkaXRvci5nZXRHcmFtbWFyKCkubmFtZSA6IFwiXCI7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHJ1bm5pbmcga2VybmVsIGZvciBncmFtbWFyIFxcYCR7Z3JhbW1hcn1cXGAgZm91bmRgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RvcmUua2VybmVsLmdldFBsdWdpbldyYXBwZXIoKTtcbiAgfVxuXG4gIC8qXG4gICAqIEdldCB0aGUgYGF0b20kUmFuZ2VgIHRoYXQgd2lsbCBydW4gaWYgYGh5ZHJvZ2VuOnJ1bi1jZWxsYCBpcyBjYWxsZWQuXG4gICAqIGBudWxsYCBpcyByZXR1cm5lZCBpZiBubyBhY3RpdmUgdGV4dCBlZGl0b3IuXG4gICAqIEByZXR1cm4ge0NsYXNzfSBgYXRvbSRSYW5nZWBcbiAgICovXG4gIGdldENlbGxSYW5nZShlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IpIHtcbiAgICBpZiAoIXN0b3JlLmVkaXRvcikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIGdldEN1cnJlbnRDZWxsKHN0b3JlLmVkaXRvcik7XG4gIH1cblxuICAvKlxuICAqLS0tLS0tLS1cbiAgKi9cbn1cbiJdfQ==