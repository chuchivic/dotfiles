Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// @jupyterlab/services apparently require overriding globals, as explained in its
// README: https://github.com/jupyterlab/services
// Otherwise, any requests it sends are blocked due to CORS issues
//
// This file exists to
// a) Make sure globals are only ever overridden once
// b) In the future, try to make the global overrides optional if gateways are
//    not used, or have been pre-configured to avoid CORS issues

var _ws = require("ws");

var _ws2 = _interopRequireDefault(_ws);

var _xmlhttprequest = require("xmlhttprequest");

var _xmlhttprequest2 = _interopRequireDefault(_xmlhttprequest);

var _requirejs = require("requirejs");

var _requirejs2 = _interopRequireDefault(_requirejs);

global.requirejs = _requirejs2["default"];
global.XMLHttpRequest = _xmlhttprequest2["default"].XMLHttpRequest;
global.WebSocket = _ws2["default"];

var _jupyterlabServices = require("@jupyterlab/services");

Object.defineProperty(exports, "Kernel", {
  enumerable: true,
  get: function get() {
    return _jupyterlabServices.Kernel;
  }
});
Object.defineProperty(exports, "Session", {
  enumerable: true,
  get: function get() {
    return _jupyterlabServices.Session;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9qdXB5dGVyLWpzLXNlcnZpY2VzLXNoaW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O2tCQVdlLElBQUk7Ozs7OEJBQ0gsZ0JBQWdCOzs7O3lCQUNWLFdBQVc7Ozs7QUFFakMsTUFBTSxDQUFDLFNBQVMseUJBQVksQ0FBQztBQUM3QixNQUFNLENBQUMsY0FBYyxHQUFHLDRCQUFJLGNBQWMsQ0FBQztBQUMzQyxNQUFNLENBQUMsU0FBUyxrQkFBSyxDQUFDOztrQ0FFVSxzQkFBc0I7Ozs7OytCQUE3QyxNQUFNOzs7Ozs7K0JBQUUsT0FBTyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvanVweXRlci1qcy1zZXJ2aWNlcy1zaGltLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuLy8gQGp1cHl0ZXJsYWIvc2VydmljZXMgYXBwYXJlbnRseSByZXF1aXJlIG92ZXJyaWRpbmcgZ2xvYmFscywgYXMgZXhwbGFpbmVkIGluIGl0c1xuLy8gUkVBRE1FOiBodHRwczovL2dpdGh1Yi5jb20vanVweXRlcmxhYi9zZXJ2aWNlc1xuLy8gT3RoZXJ3aXNlLCBhbnkgcmVxdWVzdHMgaXQgc2VuZHMgYXJlIGJsb2NrZWQgZHVlIHRvIENPUlMgaXNzdWVzXG4vL1xuLy8gVGhpcyBmaWxlIGV4aXN0cyB0b1xuLy8gYSkgTWFrZSBzdXJlIGdsb2JhbHMgYXJlIG9ubHkgZXZlciBvdmVycmlkZGVuIG9uY2Vcbi8vIGIpIEluIHRoZSBmdXR1cmUsIHRyeSB0byBtYWtlIHRoZSBnbG9iYWwgb3ZlcnJpZGVzIG9wdGlvbmFsIGlmIGdhdGV3YXlzIGFyZVxuLy8gICAgbm90IHVzZWQsIG9yIGhhdmUgYmVlbiBwcmUtY29uZmlndXJlZCB0byBhdm9pZCBDT1JTIGlzc3Vlc1xuXG5pbXBvcnQgd3MgZnJvbSBcIndzXCI7XG5pbXBvcnQgeGhyIGZyb20gXCJ4bWxodHRwcmVxdWVzdFwiO1xuaW1wb3J0IHJlcXVpcmVqcyBmcm9tIFwicmVxdWlyZWpzXCI7XG5cbmdsb2JhbC5yZXF1aXJlanMgPSByZXF1aXJlanM7XG5nbG9iYWwuWE1MSHR0cFJlcXVlc3QgPSB4aHIuWE1MSHR0cFJlcXVlc3Q7XG5nbG9iYWwuV2ViU29ja2V0ID0gd3M7XG5cbmV4cG9ydCB7IEtlcm5lbCwgU2Vzc2lvbiB9IGZyb20gXCJAanVweXRlcmxhYi9zZXJ2aWNlc1wiO1xuIl19