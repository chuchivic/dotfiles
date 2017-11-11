Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MarkerStore = (function () {
  function MarkerStore() {
    _classCallCheck(this, MarkerStore);

    this.markers = new Map();
  }

  _createClass(MarkerStore, [{
    key: "clear",
    value: function clear() {
      this.markers.forEach(function (bubble) {
        return bubble.destroy();
      });
      this.markers.clear();
    }
  }, {
    key: "clearOnRow",
    value: function clearOnRow(row) {
      var _this = this;

      var destroyed = false;
      this.markers.forEach(function (bubble, key) {
        var _bubble$marker$getBufferRange = bubble.marker.getBufferRange();

        var start = _bubble$marker$getBufferRange.start;
        var end = _bubble$marker$getBufferRange.end;

        if (start.row <= row && row <= end.row) {
          _this["delete"](key);
          destroyed = true;
        }
      });
      return destroyed;
    }
  }, {
    key: "new",
    value: function _new(bubble) {
      this.markers.set(bubble.marker.id, bubble);
    }
  }, {
    key: "delete",
    value: function _delete(key) {
      var bubble = this.markers.get(key);
      if (bubble) bubble.destroy();
      this.markers["delete"](key);
    }
  }]);

  return MarkerStore;
})();

exports["default"] = MarkerStore;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9tYXJrZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBSXFCLFdBQVc7V0FBWCxXQUFXOzBCQUFYLFdBQVc7O1NBQzlCLE9BQU8sR0FBNEIsSUFBSSxHQUFHLEVBQUU7OztlQUR6QixXQUFXOztXQUd6QixpQkFBRztBQUNOLFVBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtlQUFpQixNQUFNLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQy9ELFVBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdEI7OztXQUVTLG9CQUFDLEdBQVcsRUFBRTs7O0FBQ3RCLFVBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN0QixVQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU0sRUFBYyxHQUFHLEVBQWE7NENBQ2pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFOztZQUE3QyxLQUFLLGlDQUFMLEtBQUs7WUFBRSxHQUFHLGlDQUFILEdBQUc7O0FBQ2xCLFlBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7QUFDdEMseUJBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixtQkFBUyxHQUFHLElBQUksQ0FBQztTQUNsQjtPQUNGLENBQUMsQ0FBQztBQUNILGFBQU8sU0FBUyxDQUFDO0tBQ2xCOzs7V0FFRSxjQUFDLE1BQWtCLEVBQUU7QUFDdEIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDNUM7OztXQUVLLGlCQUFDLEdBQVcsRUFBRTtBQUNsQixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQyxVQUFJLE1BQU0sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsVUFBSSxDQUFDLE9BQU8sVUFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzFCOzs7U0E1QmtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9tYXJrZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHR5cGUgUmVzdWx0VmlldyBmcm9tIFwiLi8uLi9jb21wb25lbnRzL3Jlc3VsdC12aWV3XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcmtlclN0b3JlIHtcbiAgbWFya2VyczogTWFwPG51bWJlciwgUmVzdWx0Vmlldz4gPSBuZXcgTWFwKCk7XG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5tYXJrZXJzLmZvckVhY2goKGJ1YmJsZTogUmVzdWx0VmlldykgPT4gYnViYmxlLmRlc3Ryb3koKSk7XG4gICAgdGhpcy5tYXJrZXJzLmNsZWFyKCk7XG4gIH1cblxuICBjbGVhck9uUm93KHJvdzogbnVtYmVyKSB7XG4gICAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHRoaXMubWFya2Vycy5mb3JFYWNoKChidWJibGU6IFJlc3VsdFZpZXcsIGtleTogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGJ1YmJsZS5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKTtcbiAgICAgIGlmIChzdGFydC5yb3cgPD0gcm93ICYmIHJvdyA8PSBlbmQucm93KSB7XG4gICAgICAgIHRoaXMuZGVsZXRlKGtleSk7XG4gICAgICAgIGRlc3Ryb3llZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlc3Ryb3llZDtcbiAgfVxuXG4gIG5ldyhidWJibGU6IFJlc3VsdFZpZXcpIHtcbiAgICB0aGlzLm1hcmtlcnMuc2V0KGJ1YmJsZS5tYXJrZXIuaWQsIGJ1YmJsZSk7XG4gIH1cblxuICBkZWxldGUoa2V5OiBudW1iZXIpIHtcbiAgICBjb25zdCBidWJibGUgPSB0aGlzLm1hcmtlcnMuZ2V0KGtleSk7XG4gICAgaWYgKGJ1YmJsZSkgYnViYmxlLmRlc3Ryb3koKTtcbiAgICB0aGlzLm1hcmtlcnMuZGVsZXRlKGtleSk7XG4gIH1cbn1cbiJdfQ==