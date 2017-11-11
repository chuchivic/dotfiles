'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Notify = (function (_HTMLElement) {
  _inherits(_Notify, _HTMLElement);

  function _Notify() {
    _classCallCheck(this, _Notify);

    _get(Object.getPrototypeOf(_Notify.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(_Notify, [{
    key: 'dispose',
    value: function dispose() {
      console.info('destruction of notification');
      this.parentNode.removeChild(this);
    }
  }, {
    key: 'createdCallback',
    value: function createdCallback() {
      var _this = this;

      this.link.appendChild(this.iconEl);
      this.link.appendChild(this.displayEl);
      this.appendChild(this.link);

      this.classList.add('text-info', 'atom-updater-linux', 'inline-block');
      this.classList.toggle('atom-updater-linux-hidden');

      this.onclick = function () {
        _this.classList.toggle('atom-updater-linux-hidden');
      };
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.classList.add('atom-updater-linux-hidden');
    }
  }, {
    key: 'content',
    value: function content(info) {
      var _this2 = this;

      var pkgType = '.zip';

      if (atom.config.get('atom-updater-linux.pkgType') === 'Debian, Ubuntu') pkgType = '.deb';else if (atom.config.get('atom-updater-linux.pkgType') === 'RedHat') pkgType = '.rpm';

      this.displayEl.innerHTML = ' new version ' + info.name;
      this.classList.toggle('atom-updater-linux-hidden');

      info.assets.forEach(function (asset) {
        if (asset.name.indexOf(pkgType) >= 0) _this2.__linkEl.href = asset.browser_download_url;
      });
    }
  }, {
    key: 'link',
    get: function get() {
      if (!this.__linkEl) {
        this.__linkEl = document.createElement('a');
        this.__linkEl.classList.add('inline-block');
        this.__linkEl.href = "#";
      }

      return this.__linkEl;
    }
  }, {
    key: 'iconEl',
    get: function get() {
      if (!this.__iconEl) {
        this.__iconEl = document.createElement('span');
        this.__iconEl.classList.add('icon', 'icon-cloud-download', 'inline-block');
      }

      return this.__iconEl;
    }
  }, {
    key: 'displayEl',
    get: function get() {
      if (!this.__displayEl) {
        this.__displayEl = document.createElement('span');
        this.__displayEl.classList.add('inline-block');
      }

      return this.__displayEl;
    }
  }]);

  return _Notify;
})(HTMLElement);

exports['default'] = {
  Notify: document.registerElement('atom-updater-linux-statusbar', {
    extend: 'div',
    prototype: _Notify.prototype
  })
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvbm90aWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7SUFFTixPQUFPO1lBQVAsT0FBTzs7V0FBUCxPQUFPOzBCQUFQLE9BQU87OytCQUFQLE9BQU87OztlQUFQLE9BQU87O1dBRUosbUJBQUc7QUFDUixhQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDNUMsVUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkM7OztXQUVjLDJCQUFHOzs7QUFDaEIsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25DLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN0QyxVQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFNUIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLG9CQUFvQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3RFLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0FBRW5ELFVBQUksQ0FBQyxPQUFPLEdBQUcsWUFBTTtBQUNuQixjQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztPQUNwRCxDQUFDO0tBQ0g7OztXQThCRyxnQkFBRztBQUNMLFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7S0FDakQ7OztXQUVNLGlCQUFDLElBQUksRUFBRTs7O0FBQ1osVUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDOztBQUVyQixVQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEtBQUssZ0JBQWdCLEVBQ25FLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FDZCxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLEtBQUssUUFBUSxFQUNoRSxPQUFPLEdBQUcsTUFBTSxDQUFDOztBQUVuQixVQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxlQUFlLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN2RCxVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztBQUduRCxVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBSztBQUM3QixZQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDakMsT0FBSyxRQUFRLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztPQUNuRCxDQUFDLENBQUM7S0FDSjs7O1NBaERPLGVBQUc7QUFDVCxVQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztPQUMxQjs7QUFFRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztTQUVTLGVBQUc7QUFDWCxVQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0MsWUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FBQztPQUM1RTs7QUFFRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztTQUVZLGVBQUc7QUFDZCxVQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNwQixZQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEQsWUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQ2hEOztBQUVELGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztLQUN6Qjs7O1NBOUNHLE9BQU87R0FBUyxXQUFXOztxQkF1RWxCO0FBQ2IsUUFBTSxFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsOEJBQThCLEVBQUU7QUFDL0QsVUFBTSxFQUFFLEtBQUs7QUFDYixhQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7R0FDN0IsQ0FBQztDQUNIIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvbm90aWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmNsYXNzIF9Ob3RpZnkgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBjb25zb2xlLmluZm8oJ2Rlc3RydWN0aW9uIG9mIG5vdGlmaWNhdGlvbicpO1xuICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgfVxuXG4gIGNyZWF0ZWRDYWxsYmFjaygpIHtcbiAgICB0aGlzLmxpbmsuYXBwZW5kQ2hpbGQodGhpcy5pY29uRWwpO1xuICAgIHRoaXMubGluay5hcHBlbmRDaGlsZCh0aGlzLmRpc3BsYXlFbCk7XG4gICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmxpbmspO1xuXG4gICAgdGhpcy5jbGFzc0xpc3QuYWRkKCd0ZXh0LWluZm8nLCAnYXRvbS11cGRhdGVyLWxpbnV4JywgJ2lubGluZS1ibG9jaycpO1xuICAgIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYXRvbS11cGRhdGVyLWxpbnV4LWhpZGRlbicpO1xuXG4gICAgdGhpcy5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhdG9tLXVwZGF0ZXItbGludXgtaGlkZGVuJyk7XG4gICAgfTtcbiAgfVxuXG4gIGdldCBsaW5rKCkge1xuICAgIGlmKCF0aGlzLl9fbGlua0VsKSB7XG4gICAgICB0aGlzLl9fbGlua0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgdGhpcy5fX2xpbmtFbC5jbGFzc0xpc3QuYWRkKCdpbmxpbmUtYmxvY2snKTtcbiAgICAgIHRoaXMuX19saW5rRWwuaHJlZiA9IFwiI1wiO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fbGlua0VsO1xuICB9XG5cbiAgZ2V0IGljb25FbCgpIHtcbiAgICBpZighdGhpcy5fX2ljb25FbCkge1xuICAgICAgdGhpcy5fX2ljb25FbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgIHRoaXMuX19pY29uRWwuY2xhc3NMaXN0LmFkZCgnaWNvbicsICdpY29uLWNsb3VkLWRvd25sb2FkJywgJ2lubGluZS1ibG9jaycpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9faWNvbkVsO1xuICB9XG5cbiAgZ2V0IGRpc3BsYXlFbCgpIHtcbiAgICBpZighdGhpcy5fX2Rpc3BsYXlFbCkge1xuICAgICAgdGhpcy5fX2Rpc3BsYXlFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgIHRoaXMuX19kaXNwbGF5RWwuY2xhc3NMaXN0LmFkZCgnaW5saW5lLWJsb2NrJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19kaXNwbGF5RWw7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMuY2xhc3NMaXN0LmFkZCgnYXRvbS11cGRhdGVyLWxpbnV4LWhpZGRlbicpO1xuICB9XG5cbiAgY29udGVudChpbmZvKSB7XG4gICAgdmFyIHBrZ1R5cGUgPSAnLnppcCc7XG5cbiAgICBpZihhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdXBkYXRlci1saW51eC5wa2dUeXBlJykgPT09ICdEZWJpYW4sIFVidW50dScpXG4gICAgICBwa2dUeXBlID0gJy5kZWInO1xuICAgIGVsc2UgaWYoYXRvbS5jb25maWcuZ2V0KCdhdG9tLXVwZGF0ZXItbGludXgucGtnVHlwZScpID09PSAnUmVkSGF0JylcbiAgICAgIHBrZ1R5cGUgPSAnLnJwbSc7XG5cbiAgICB0aGlzLmRpc3BsYXlFbC5pbm5lckhUTUwgPSAnIG5ldyB2ZXJzaW9uICcgKyBpbmZvLm5hbWU7XG4gICAgdGhpcy5jbGFzc0xpc3QudG9nZ2xlKCdhdG9tLXVwZGF0ZXItbGludXgtaGlkZGVuJyk7XG5cblxuICAgIGluZm8uYXNzZXRzLmZvckVhY2goKGFzc2V0KSA9PiB7XG4gICAgICBpZihhc3NldC5uYW1lLmluZGV4T2YocGtnVHlwZSkgPj0gMClcbiAgICAgICAgdGhpcy5fX2xpbmtFbC5ocmVmID0gYXNzZXQuYnJvd3Nlcl9kb3dubG9hZF91cmw7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBOb3RpZnk6IGRvY3VtZW50LnJlZ2lzdGVyRWxlbWVudCgnYXRvbS11cGRhdGVyLWxpbnV4LXN0YXR1c2JhcicsIHtcbiAgICBleHRlbmQ6ICdkaXYnLFxuICAgIHByb3RvdHlwZTogX05vdGlmeS5wcm90b3R5cGVcbiAgfSlcbn07XG4iXX0=