Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _https = require('https');

var https = _interopRequireWildcard(_https);

'use babel';

var Updater = (function () {
  function Updater() {
    _classCallCheck(this, Updater);
  }

  _createClass(Updater, [{
    key: 'extractVersion',
    value: function extractVersion(version) {
      var exp = /([0-9]+)\.([0-9]+)\.([0-9])(-(alpha|beta)([0-9]+)|)/;
      var rst = exp.exec(version);

      return {
        major: Number.parseInt(rst[1]),
        minor: Number.parseInt(rst[2]),
        build: Number.parseInt(rst[3]),
        stage: rst[5],
        stageNumber: Number.parseInt(rst[6])
      };
    }
  }, {
    key: 'needUpdate',
    value: function needUpdate(avaliable, current) {
      if (!atom.config.get('atom-updater-linux.acceptTestVersion') && avaliable.stage) return false;

      if (avaliable.major > current.major) return true;else if (avaliable.major === current.major && avaliable.minor > current.minor) return true;else if (avaliable.major === current.major && avaliable.minor === current.minor && avaliable.build > current.build) return true;else if (avaliable.major === current.major && avaliable.minor === current.minor && avaliable.build == current.build) if (!current.stage && avaliable.stage) return true;else if (current.stage == 'alpha' && avaliable.stage == 'beta') return true;else if (current.stage == 'alpha' && avaliable.stage == 'alpha' && avaliable.stageNumber > current.stageNumber) return true;else if (current.stage == 'alpha' && avaliable.stage == 'beta') return true;else if (current.stage == 'beta' && avaliable.stage == 'beta' && avaliable.stageNumber > current.stageNumber) return true;else return false;else return false;
    }
  }, {
    key: 'checkUpdate',
    value: function checkUpdate() {
      var _this = this;

      var currentVersion = this.extractVersion(atom.getVersion());
      var updater = false;
      var p = new Promise(function (resolve, reject) {
        var req = https.request({
          hostname: 'api.github.com',
          path: '/repos/atom/atom/releases',
          protocol: 'https:',
          port: 443,
          method: 'GET',
          headers: {
            'User-Agent': 'Atom Updater Notify 0.1.2'
          }
        }, function (req) {
          var data = '';
          if (req.statusCode == 200) {

            req.on('data', function (chunk) {
              data += chunk;
            });

            console.log('Restam: %s', req.headers['x-ratelimit-remaining']);

            var exp = /([0-9]+)\.([0-9]+)\.([0-9])(-(alpha|beta)([0-9]+)|)/;

            req.on('end', function () {
              data = JSON.parse(data);
              data.forEach(function (e) {
                if (_this.needUpdate(_this.extractVersion(e.name), currentVersion)) {
                  currentVersion = _this.extractVersion(e.name);
                  updater = e;
                }
              });

              resolve(updater);
            });
          } else {
            req.on('data', function (chunk) {
              data += chunk;
            });

            req.on('end', function () {
              var obj = JSON.parse(data);
              reject(obj.message);
            });
          }
        });

        req.write('');
        req.end();
      });

      return p;
    }
  }]);

  return Updater;
})();

exports.Updater = Updater;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvdXBkYXRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3FCQUV1QixPQUFPOztJQUFsQixLQUFLOztBQUZqQixXQUFXLENBQUM7O0lBSUMsT0FBTztXQUFQLE9BQU87MEJBQVAsT0FBTzs7O2VBQVAsT0FBTzs7V0FFSix3QkFBQyxPQUFPLEVBQUU7QUFDdEIsVUFBSSxHQUFHLEdBQUcscURBQXFELENBQUM7QUFDaEUsVUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFNUIsYUFBTztBQUNILGFBQUssRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixhQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsYUFBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLGFBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2IsbUJBQVcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUN2QyxDQUFDO0tBQ0g7OztXQUVTLG9CQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUU7QUFDN0IsVUFBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLElBQUksU0FBUyxDQUFDLEtBQUssRUFDNUUsT0FBTyxLQUFLLENBQUM7O0FBRWYsVUFBRyxTQUFTLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQ2hDLE9BQU8sSUFBSSxDQUFDLEtBQ1QsSUFBRyxTQUFTLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxLQUFLLElBQUksU0FBUyxDQUFDLEtBQUssR0FBRyxPQUFPLENB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LHlCQUFPLEdBQUcsQ0FBQyxDQUFDO2lCQUNiO2VBQ0YsQ0FBQyxDQUFDOztBQUVILHFCQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDbEIsQ0FBQyxDQUFDO1dBQ0osTUFDSTtBQUNILGVBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3hCLGtCQUFJLElBQUksS0FBSyxDQUFDO2FBQ2YsQ0FBQyxDQUFDOztBQUVILGVBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQU07QUFDbEIsa0JBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0Isb0JBQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDckIsQ0FBQyxDQUFDO1dBQ0o7U0FDRixDQUNGLENBQUM7O0FBRUYsV0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNkLFdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztPQUNYLENBQ0YsQ0FBQzs7QUFFRixhQUFPLENBQUMsQ0FBQztLQUNWOzs7U0FyR1UsT0FBTyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdG9tLXVwZGF0ZXItbGludXgvbGliL3VwZGF0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0ICogYXMgaHR0cHMgZnJvbSAnaHR0cHMnO1xuXG5leHBvcnQgY2xhc3MgVXBkYXRlciB7XG5cbiAgZXh0cmFjdFZlcnNpb24odmVyc2lvbikge1xuICAgIGxldCBleHAgPSAvKFswLTldKylcXC4oWzAtOV0rKVxcLihbMC05XSkoLShhbHBoYXxiZXRhKShbMC05XSspfCkvO1xuICAgIGxldCByc3QgPSBleHAuZXhlYyh2ZXJzaW9uKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG1ham9yOiBOdW1iZXIucGFyc2VJbnQocnN0WzFdKSxcbiAgICAgICAgbWlub3I6IE51bWJlci5wYXJzZUludChyc3RbMl0pLFxuICAgICAgICBidWlsZDogTnVtYmVyLnBhcnNlSW50KHJzdFszXSksXG4gICAgICAgIHN0YWdlOiByc3RbNV0sXG4gICAgICAgIHN0YWdlTnVtYmVyOiBOdW1iZXIucGFyc2VJbnQocnN0WzZdKVxuICAgIH07XG4gIH1cblxuICBuZWVkVXBkYXRlKGF2YWxpYWJsZSwgY3VycmVudCkge1xuICAgIGlmKCFhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdXBkYXRlci1saW51eC5hY2NlcHRUZXN0VmVyc2lvbicpICYmIGF2YWxpYWJsZS5zdGFnZSlcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGlmKGF2YWxpYWJsZS5tYWpvciA+IGN1cnJlbnQubWFqb3IpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIGlmKGF2YWxpYWJsZS5tYWpvciA9PT0gY3VycmVudC5tYWpvciAmJiBhdmFsaWFibGUubWlub3IgPiBjdXJyZW50Lm1pbm9yKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZWxzZSBpZihhdmFsaWFibGUubWFqb3IgPT09IGN1cnJlbnQubWFqb3IgJiYgYXZhbGlhYmxlLm1pbm9yID09PSBjdXJyZW50Lm1pbm9yICYmIGF2YWxpYWJsZS5idWlsZCA+IGN1cnJlbnQuYnVpbGQpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBlbHNlIGlmKGF2YWxpYWJsZS5tYWpvciA9PT0gY3VycmVudC5tYWpvciAmJiBhdmFsaWFibGUubWlub3IgPT09IGN1cnJlbnQubWlub3IgJiYgYXZhbGlhYmxlLmJ1aWxkID09IGN1cnJlbnQuYnVpbGQpXG4gICAgICBpZighY3VycmVudC5zdGFnZSAmJiBhdmFsaWFibGUuc3RhZ2UpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZWxzZSBpZihjdXJyZW50LnN0YWdlID09ICdhbHBoYScgJiYgYXZhbGlhYmxlLnN0YWdlID09ICdiZXRhJylcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBlbHNlIGlmKGN1cnJlbnQuc3RhZ2UgPT0gJ2FscGhhJyAmJiBhdmFsaWFibGUuc3RhZ2UgPT0gJ2FscGhhJyAmJiBhdmFsaWFibGUuc3RhZ2VOdW1iZXIgPiBjdXJyZW50LnN0YWdlTnVtYmVyKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGVsc2UgaWYoY3VycmVudC5zdGFnZSA9PSAnYWxwaGEnICYmIGF2YWxpYWJsZS5zdGFnZSA9PSAnYmV0YScpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZWxzZSBpZihjdXJyZW50LnN0YWdlID09ICdiZXRhJyAmJiBhdmFsaWFibGUuc3RhZ2UgPT0gJ2JldGEnICYmIGF2YWxpYWJsZS5zdGFnZU51bWJlciA+IGN1cnJlbnQuc3RhZ2VOdW1iZXIpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY2hlY2tVcGRhdGUoKSB7XG4gICAgdmFyIGN1cnJlbnRWZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihhdG9tLmdldFZlcnNpb24oKSk7XG4gICAgdmFyIHVwZGF0ZXIgPSBmYWxzZTtcbiAgICB2YXIgcCA9IG5ldyBQcm9taXNlKFxuICAgICAgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBsZXQgcmVxID0gaHR0cHMucmVxdWVzdChcbiAgICAgICAgICB7XG4gICAgICAgICAgICAgIGhvc3RuYW1lOiAnYXBpLmdpdGh1Yi5jb20nLFxuICAgICAgICAgICAgICBwYXRoOiAnL3JlcG9zL2F0b20vYXRvbS9yZWxlYXNlcycsXG4gICAgICAgICAgICAgIHByb3RvY29sOiAnaHR0cHM6JyxcbiAgICAgICAgICAgICAgcG9ydDogNDQzLFxuICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAnVXNlci1BZ2VudCc6ICdBdG9tIFVwZGF0ZXIgTm90aWZ5IDAuMS4yJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAocmVxKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9ICcnO1xuICAgICAgICAgICAgaWYocmVxLnN0YXR1c0NvZGUgPT0gMjAwKSB7XG5cbiAgICAgICAgICAgICAgcmVxLm9uKCdkYXRhJywgKGNodW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YSArPSBjaHVuaztcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Jlc3RhbTogJXMnLCByZXEuaGVhZGVyc1sneC1yYXRlbGltaXQtcmVtYWluaW5nJ10pO1xuXG4gICAgICAgICAgICAgIGxldCBleHAgPSAvKFswLTldKylcXC4oWzAtOV0rKVxcLihbMC05XSkoLShhbHBoYXxiZXRhKShbMC05XSspfCkvO1xuXG4gICAgICAgICAgICAgIHJlcS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYodGhpcy5uZWVkVXBkYXRlKHRoaXMuZXh0cmFjdFZlcnNpb24oZS5uYW1lKSwgY3VycmVudFZlcnNpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRWZXJzaW9uID0gdGhpcy5leHRyYWN0VmVyc2lvbihlLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVyID0gZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJlc29sdmUodXBkYXRlcik7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHJlcS5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgICAgICAgICAgICAgIGRhdGEgKz0gY2h1bms7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIHJlcS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBvYmogPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgICAgIHJlamVjdChvYmoubWVzc2FnZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICByZXEud3JpdGUoJycpO1xuICAgICAgICByZXEuZW5kKCk7XG4gICAgICB9XG4gICAgKTtcblxuICAgIHJldHVybiBwO1xuICB9XG5cbn1cbiJdfQ==