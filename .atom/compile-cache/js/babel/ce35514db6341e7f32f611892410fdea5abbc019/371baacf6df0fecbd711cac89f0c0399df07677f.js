var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _indieDelegate = require('./indie-delegate');

var _indieDelegate2 = _interopRequireDefault(_indieDelegate);

var _validate = require('./validate');

var IndieRegistry = (function () {
  function IndieRegistry() {
    _classCallCheck(this, IndieRegistry);

    this.emitter = new _atom.Emitter();
    this.delegates = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(IndieRegistry, [{
    key: 'register',
    value: function register(config, version) {
      var _this = this;

      if (!(0, _validate.indie)(config)) {
        throw new Error('Error registering Indie Linter');
      }
      var indieLinter = new _indieDelegate2['default'](config, version);
      this.delegates.add(indieLinter);
      indieLinter.onDidDestroy(function () {
        _this.delegates['delete'](indieLinter);
      });
      indieLinter.onDidUpdate(function (messages) {
        _this.emitter.emit('did-update', { linter: indieLinter, messages: messages });
      });
      this.emitter.emit('observe', indieLinter);

      return indieLinter;
    }
  }, {
    key: 'observe',
    value: function observe(callback) {
      this.delegates.forEach(callback);
      return this.emitter.on('observe', callback);
    }
  }, {
    key: 'onDidUpdate',
    value: function onDidUpdate(callback) {
      return this.emitter.on('did-update', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      for (var entry of this.delegates) {
        entry.dispose();
      }
      this.subscriptions.dispose();
    }
  }]);

  return IndieRegistry;
})();

module.exports = IndieRegistry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kaWUtcmVnaXN0cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUU2QyxNQUFNOzs2QkFHekIsa0JBQWtCOzs7O3dCQUNMLFlBQVk7O0lBRzdDLGFBQWE7QUFLTixXQUxQLGFBQWEsR0FLSDswQkFMVixhQUFhOztBQU1mLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDOztlQVhHLGFBQWE7O1dBWVQsa0JBQUMsTUFBYSxFQUFFLE9BQWMsRUFBaUI7OztBQUNyRCxVQUFJLENBQUMscUJBQWMsTUFBTSxDQUFDLEVBQUU7QUFDMUIsY0FBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO09BQ2xEO0FBQ0QsVUFBTSxXQUFXLEdBQUcsK0JBQWtCLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUN0RCxVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUMvQixpQkFBVyxDQUFDLFlBQVksQ0FBQyxZQUFNO0FBQzdCLGNBQUssU0FBUyxVQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7T0FDbkMsQ0FBQyxDQUFBO0FBQ0YsaUJBQVcsQ0FBQyxXQUFXLENBQUMsVUFBQyxRQUFRLEVBQUs7QUFDcEMsY0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFSLFFBQVEsRUFBRSxDQUFDLENBQUE7T0FDbkUsQ0FBQyxDQUFBO0FBQ0YsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFBOztBQUV6QyxhQUFPLFdBQVcsQ0FBQTtLQUNuQjs7O1dBQ00saUJBQUMsUUFBa0IsRUFBYztBQUN0QyxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNoQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUM1Qzs7O1dBQ1UscUJBQUMsUUFBa0IsRUFBYztBQUMxQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMvQzs7O1dBQ00sbUJBQUc7QUFDUixXQUFLLElBQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEMsYUFBSyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ2hCO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUM3Qjs7O1NBeENHLGFBQWE7OztBQTJDbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9pbmRpZS1yZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IEluZGllRGVsZWdhdGUgZnJvbSAnLi9pbmRpZS1kZWxlZ2F0ZSdcbmltcG9ydCB7IGluZGllIGFzIHZhbGlkYXRlSW5kaWUgfSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHR5cGUgeyBJbmRpZSB9IGZyb20gJy4vdHlwZXMnXG5cbmNsYXNzIEluZGllUmVnaXN0cnkge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBkZWxlZ2F0ZXM6IFNldDxJbmRpZURlbGVnYXRlPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5kZWxlZ2F0ZXMgPSBuZXcgU2V0KClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICByZWdpc3Rlcihjb25maWc6IEluZGllLCB2ZXJzaW9uOiAxIHwgMik6IEluZGllRGVsZWdhdGUge1xuICAgIGlmICghdmFsaWRhdGVJbmRpZShjb25maWcpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJlZ2lzdGVyaW5nIEluZGllIExpbnRlcicpXG4gICAgfVxuICAgIGNvbnN0IGluZGllTGludGVyID0gbmV3IEluZGllRGVsZWdhdGUoY29uZmlnLCB2ZXJzaW9uKVxuICAgIHRoaXMuZGVsZWdhdGVzLmFkZChpbmRpZUxpbnRlcilcbiAgICBpbmRpZUxpbnRlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5kZWxlZ2F0ZXMuZGVsZXRlKGluZGllTGludGVyKVxuICAgIH0pXG4gICAgaW5kaWVMaW50ZXIub25EaWRVcGRhdGUoKG1lc3NhZ2VzKSA9PiB7XG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScsIHsgbGludGVyOiBpbmRpZUxpbnRlciwgbWVzc2FnZXMgfSlcbiAgICB9KVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdvYnNlcnZlJywgaW5kaWVMaW50ZXIpXG5cbiAgICByZXR1cm4gaW5kaWVMaW50ZXJcbiAgfVxuICBvYnNlcnZlKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHRoaXMuZGVsZWdhdGVzLmZvckVhY2goY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignb2JzZXJ2ZScsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkVXBkYXRlKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5kZWxlZ2F0ZXMpIHtcbiAgICAgIGVudHJ5LmRpc3Bvc2UoKVxuICAgIH1cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbmRpZVJlZ2lzdHJ5XG4iXX0=