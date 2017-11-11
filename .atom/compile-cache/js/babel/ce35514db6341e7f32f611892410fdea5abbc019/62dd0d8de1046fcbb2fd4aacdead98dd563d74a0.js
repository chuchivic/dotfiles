Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var DOMListener = require('dom-listener');
var fs = require('fs');
var shell = require('shelljs');
var request = require('request');

shell.config.execPath = "/usr/bin/node";

var Installer = (function () {
  function Installer() {
    _classCallCheck(this, Installer);
  }

  _createClass(Installer, [{
    key: 'listen',
    value: function listen() {
      var _this = this;

      var listener = new DOMListener(document.querySelector('.message'));
      listener.add('.btn-install-update', 'click', function (e) {
        return _this.execute(e);
      });
    }
  }, {
    key: 'execute',
    value: function execute(event) {
      var _this2 = this;

      this.downloadUrl = event.target.getAttribute("data-target");
      this.pkgType = this.downloadUrl.slice(-3);

      this.downloadUpdate(function (err) {
        if (err === undefined) {
          (function () {
            var disposable = atom.notifications.onDidAddNotification(function (notification) {
              setTimeout(function () {
                return _this2.installUpdate();
              }, 2000);
              disposable.dispose();
            });
            atom.notifications.addSuccess("Download complete! Installing latest version of Atom.");
          })();
        } else {
          atom.notifications.addError("Unable to download Atom. Please check your network connection.", options);
        }
      });
    }
  }, {
    key: 'installUpdate',
    value: function installUpdate() {
      var _this3 = this;

      var install = undefined;
      if (this.pkgType == "rpm") {
        install = function (cb) {
          return _this3.installRpm(cb);
        };
      } else {
        install = function (cb) {
          return _this3.installDeb(cb);
        };
      }

      install(function (code) {
        if (code == 0) {
          atom.notifications.addSuccess("Atom has been successfully updated. Please restart Atom.");
        } else {
          atom.notifications.addError("Something went wrong while trying to update Atom");
        }

        fs.unlink(_this3.outputDest);
      });
    }
  }, {
    key: 'installRpm',
    value: function installRpm(callback) {
      var cmd1 = 'export AUTH_PASS=$(zenity --password --title="Atom Installer Authentication")';
      var cmd2 = 'echo $AUTH_PASS | sudo -S rpm -U ' + this.outputDest;

      shell.exec(cmd1 + ' && ' + cmd2, callback);
    }
  }, {
    key: 'installDeb',
    value: function installDeb(callback) {
      var cmd1 = 'export AUTH_PASS=$(zenity --password --title="Atom Installer Authentication")';
      var cmd2 = 'echo $AUTH_PASS | sudo -S dpkg -i ' + this.outputDest;

      shell.exec(cmd1 + ' && ' + cmd2, callback);
    }
  }, {
    key: 'downloadUpdate',
    value: function downloadUpdate(callback) {
      atom.notifications.addInfo("Downloading latest version of atom");

      this.outputDest = '/tmp/atom-installer.' + this.pkgType;
      var file = fs.createWriteStream(this.outputDest);

      request.get(this.downloadUrl).on('error', callback).on('end', callback).pipe(file);
    }
  }]);

  return Installer;
})();

exports.Installer = Installer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvaW5zdGFsbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOztBQUYxQyxXQUFXLENBQUM7O0FBSVosSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLElBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVuQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUM7O0lBRTNCLFNBQVM7V0FBVCxTQUFTOzBCQUFULFNBQVM7OztlQUFULFNBQVM7O1dBQ2Qsa0JBQUU7OztBQUNOLFVBQU0sUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUNyRSxjQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLE9BQU8sRUFBRSxVQUFDLENBQUM7ZUFBSyxNQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDdEU7OztXQUVNLGlCQUFDLEtBQUssRUFBQzs7O0FBQ1osVUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1RCxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRXpDLFVBQUksQ0FBQyxjQUFjLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDM0IsWUFBRyxHQUFHLEtBQUssU0FBUyxFQUFDOztBQUNuQixnQkFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFDLFlBQVksRUFBSztBQUN6RSx3QkFBVSxDQUFDO3VCQUFNLE9BQUssYUFBYSxFQUFFO2VBQUEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3Qyx3QkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3RCLENBQUMsQ0FBQTtBQUNGLGdCQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDOztTQUN4RixNQUNHO0FBQ0YsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsZ0VBQWdFLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEc7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRVkseUJBQUU7OztBQUNiLFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFDO0FBQ3ZCLGVBQU8sR0FBRyxVQUFDLEVBQUU7aUJBQUssT0FBSyxVQUFVLENBQUMsRUFBRSxDQUFDO1NBQUEsQ0FBQztPQUN2QyxNQUNHO0FBQ0YsZUFBTyxHQUFHLFVBQUMsRUFBRTtpQkFBSyxPQUFLLFVBQVUsQ0FBQyxFQUFFLENBQUM7U0FBQSxDQUFDO09BQ3ZDOztBQUVELGFBQU8sQ0FBQyxVQUFDLElBQUksRUFBSztBQUNoQixZQUFHLElBQUksSUFBSSxDQUFDLEVBQUM7QUFDWCxjQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO1NBQzNGLE1BQ0c7QUFDRixjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ2pGOztBQUVELFVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBSyxVQUFVLENBQUMsQ0FBQztPQUM1QixDQUFDLENBQUM7S0FDSjs7O1dBRVMsb0JBQUMsUUFBUSxFQUFDO0FBQ2xCLFVBQU0sSUFBSSxHQUFHLCtFQUErRSxDQUFDO0FBQzdGLFVBQU0sSUFBSSx5Q0FBdUMsSUFBSSxDQUFDLFVBQVUsQUFBRSxDQUFDOztBQUVuRSxXQUFLLENBQUMsSUFBSSxDQUFJLElBQUksWUFBTyxJQUFJLEVBQUksUUFBUSxDQUFDLENBQUM7S0FDNUM7OztXQUVTLG9CQUFDLFFBQVEsRUFBQztBQUNsQixVQUFNLElBQUksR0FBRywrRUFBK0UsQ0FBQztBQUM3RixVQUFNLElBQUksMENBQXdDLElBQUksQ0FBQyxVQUFVLEFBQUUsQ0FBQzs7QUFFcEUsV0FBSyxDQUFDLElBQUksQ0FBSSxJQUFJLFlBQU8sSUFBSSxFQUFJLFFBQVEsQ0FBQyxDQUFDO0tBQzVDOzs7V0FFYSx3QkFBQyxRQUFRLEVBQUM7QUFDdEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQzs7QUFFakUsVUFBSSxDQUFDLFVBQVUsNEJBQTBCLElBQUksQ0FBQyxPQUFPLEFBQUUsQ0FBQztBQUN4RCxVQUFNLElBQUksR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVuRCxhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FDNUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FDckIsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2I7OztTQXJFVSxTQUFTIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvaW5zdGFsbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuY29uc3QgRE9NTGlzdGVuZXIgPSByZXF1aXJlKCdkb20tbGlzdGVuZXInKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHNoZWxsID0gcmVxdWlyZSgnc2hlbGxqcycpO1xuY29uc3QgcmVxdWVzdCA9IHJlcXVpcmUoJ3JlcXVlc3QnKTtcblxuc2hlbGwuY29uZmlnLmV4ZWNQYXRoID0gXCIvdXNyL2Jpbi9ub2RlXCI7XG5cbmV4cG9ydCBjbGFzcyBJbnN0YWxsZXIge1xuICBsaXN0ZW4oKXtcbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBET01MaXN0ZW5lcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVzc2FnZScpKTtcbiAgICBsaXN0ZW5lci5hZGQoJy5idG4taW5zdGFsbC11cGRhdGUnLCAnY2xpY2snLCAoZSkgPT4gdGhpcy5leGVjdXRlKGUpKTtcbiAgfVxuXG4gIGV4ZWN1dGUoZXZlbnQpe1xuICAgIHRoaXMuZG93bmxvYWRVcmwgPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIik7XG4gICAgdGhpcy5wa2dUeXBlID0gdGhpcy5kb3dubG9hZFVybC5zbGljZSgtMylcblxuICAgIHRoaXMuZG93bmxvYWRVcGRhdGUoKGVycikgPT4ge1xuICAgICAgaWYoZXJyID09PSB1bmRlZmluZWQpe1xuICAgICAgICBsZXQgZGlzcG9zYWJsZSA9IGF0b20ubm90aWZpY2F0aW9ucy5vbkRpZEFkZE5vdGlmaWNhdGlvbigobm90aWZpY2F0aW9uKSA9PiB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmluc3RhbGxVcGRhdGUoKSwgMjAwMCk7XG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiRG93bmxvYWQgY29tcGxldGUhIEluc3RhbGxpbmcgbGF0ZXN0IHZlcnNpb24gb2YgQXRvbS5cIik7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJVbmFibGUgdG8gZG93bmxvYWQgQXRvbS4gUGxlYXNlIGNoZWNrIHlvdXIgbmV0d29yayBjb25uZWN0aW9uLlwiLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGluc3RhbGxVcGRhdGUoKXtcbiAgICBsZXQgaW5zdGFsbDtcbiAgICBpZih0aGlzLnBrZ1R5cGUgPT0gXCJycG1cIil7XG4gICAgICBpbnN0YWxsID0gKGNiKSA9PiB0aGlzLmluc3RhbGxScG0oY2IpO1xuICAgIH1cbiAgICBlbHNle1xuICAgICAgaW5zdGFsbCA9IChjYikgPT4gdGhpcy5pbnN0YWxsRGViKGNiKTtcbiAgICB9XG5cbiAgICBpbnN0YWxsKChjb2RlKSA9PiB7XG4gICAgICBpZihjb2RlID09IDApe1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIkF0b20gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuIFBsZWFzZSByZXN0YXJ0IEF0b20uXCIpO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgdHJ5aW5nIHRvIHVwZGF0ZSBBdG9tXCIpO1xuICAgICAgfVxuXG4gICAgICBmcy51bmxpbmsodGhpcy5vdXRwdXREZXN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGluc3RhbGxScG0oY2FsbGJhY2spe1xuICAgIGNvbnN0IGNtZDEgPSAnZXhwb3J0IEFVVEhfUEFTUz0kKHplbml0eSAtLXBhc3N3b3JkIC0tdGl0bGU9XCJBdG9tIEluc3RhbGxlciBBdXRoZW50aWNhdGlvblwiKSc7XG4gICAgY29uc3QgY21kMiA9IGBlY2hvICRBVVRIX1BBU1MgfCBzdWRvIC1TIHJwbSAtVSAke3RoaXMub3V0cHV0RGVzdH1gO1xuXG4gICAgc2hlbGwuZXhlYyhgJHtjbWQxfSAmJiAke2NtZDJ9YCwgY2FsbGJhY2spO1xuICB9XG5cbiAgaW5zdGFsbERlYihjYWxsYmFjayl7XG4gICAgY29uc3QgY21kMSA9ICdleHBvcnQgQVVUSF9QQVNTPSQoemVuaXR5IC0tcGFzc3dvcmQgLS10aXRsZT1cIkF0b20gSW5zdGFsbGVyIEF1dGhlbnRpY2F0aW9uXCIpJztcbiAgICBjb25zdCBjbWQyID0gYGVjaG8gJEFVVEhfUEFTUyB8IHN1ZG8gLVMgZHBrZyAtaSAke3RoaXMub3V0cHV0RGVzdH1gO1xuXG4gICAgc2hlbGwuZXhlYyhgJHtjbWQxfSAmJiAke2NtZDJ9YCwgY2FsbGJhY2spO1xuICB9XG5cbiAgZG93bmxvYWRVcGRhdGUoY2FsbGJhY2spe1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiRG93bmxvYWRpbmcgbGF0ZXN0IHZlcnNpb24gb2YgYXRvbVwiKTtcblxuICAgIHRoaXMub3V0cHV0RGVzdCA9IGAvdG1wL2F0b20taW5zdGFsbGVyLiR7dGhpcy5wa2dUeXBlfWA7XG4gICAgY29uc3QgZmlsZSA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKHRoaXMub3V0cHV0RGVzdCk7XG5cbiAgICByZXF1ZXN0LmdldCh0aGlzLmRvd25sb2FkVXJsKVxuICAgIC5vbignZXJyb3InLCBjYWxsYmFjaylcbiAgICAub24oJ2VuZCcsIGNhbGxiYWNrKVxuICAgIC5waXBlKGZpbGUpO1xuICB9XG59XG4iXX0=