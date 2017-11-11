'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Timer = (function () {
  function Timer(fn, initFn, stopFn, interval) {
    _classCallCheck(this, Timer);

    this.fn = fn;
    this.initFn = initFn;
    this.stopFn = stopFn;
    this.interval = interval;
  }

  _createClass(Timer, [{
    key: '_startThread',
    value: function _startThread() {
      var _this = this;

      this.fn();
      this.threadId = setTimeout(function () {
        _this._startThread();
      }, this.interval);
    }
  }, {
    key: 'start',
    value: function start() {
      if (this.initFn) this.initFn();
      this._startThread();
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.initFn) this.stopFn();
      clearTimeout(this.threadId);
    }
  }]);

  return Timer;
})();

exports.Timer = Timer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvdGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7O0lBRUMsS0FBSztBQUNMLFdBREEsS0FBSyxDQUNKLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTswQkFEL0IsS0FBSzs7QUFFZCxRQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0dBQzFCOztlQU5VLEtBQUs7O1dBUUosd0JBQUc7OztBQUNiLFVBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNWLFVBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUN4QixZQUFNO0FBQ0osY0FBSyxZQUFZLEVBQUUsQ0FBQztPQUNyQixFQUNELElBQUksQ0FBQyxRQUFRLENBQ2QsQ0FBQztLQUNIOzs7V0FFSSxpQkFBRztBQUNOLFVBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDOUIsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ3JCOzs7V0FFRyxnQkFBRztBQUNMLFVBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDOUIsa0JBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDN0I7OztTQTFCVSxLQUFLIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvdGltZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuZXhwb3J0IGNsYXNzIFRpbWVyIHtcbiAgY29uc3RydWN0b3IoZm4sIGluaXRGbiwgc3RvcEZuLCBpbnRlcnZhbCkge1xuICAgIHRoaXMuZm4gPSBmbjtcbiAgICB0aGlzLmluaXRGbiA9IGluaXRGbjtcbiAgICB0aGlzLnN0b3BGbiA9IHN0b3BGbjtcbiAgICB0aGlzLmludGVydmFsID0gaW50ZXJ2YWw7XG4gIH1cblxuICBfc3RhcnRUaHJlYWQoKSB7XG4gICAgdGhpcy5mbigpO1xuICAgIHRoaXMudGhyZWFkSWQgPSBzZXRUaW1lb3V0KFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLl9zdGFydFRocmVhZCgpO1xuICAgICAgfSxcbiAgICAgIHRoaXMuaW50ZXJ2YWxcbiAgICApO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgaWYodGhpcy5pbml0Rm4pIHRoaXMuaW5pdEZuKCk7XG4gICAgdGhpcy5fc3RhcnRUaHJlYWQoKTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYodGhpcy5pbml0Rm4pIHRoaXMuc3RvcEZuKCk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGhyZWFkSWQpO1xuICB9XG59XG4iXX0=