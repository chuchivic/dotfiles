Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _atom = require('atom');

var _https = require('https');

var https = _interopRequireWildcard(_https);

var _updater = require('./updater');

var _timer = require('./timer');

var _notify = require('./notify');

var _installer = require('./installer');

'use babel';

var main = {

  config: {
    acceptTestVersion: {
      'type': 'boolean',
      'default': false,
      'title': 'Accept test versions of atom.',
      'description': 'You can accept test versions of atom.'
    },
    checkInterval: {
      'type': 'integer',
      'default': 1,
      'title': 'Check interval',
      'description': 'Interval to check new versions of atom in repository, in hours.'
    },
    pkgType: {
      'type': 'string',
      'default': 'Debian, Ubuntu',
      'title': 'Package type',
      'enum': ['Debian, Ubuntu', 'RedHat'],
      'description': 'The type of package for download.'
    }
  },

  updaterNotifyView: null,
  modalPanel: null,
  subscriptions: null,
  timer: null,

  checkInterval: function checkInterval() {
    var period = atom.config.get('atom-updater-linux.checkInterval', 1);

    if (period < 1) period = 1;

    return period * 60 * 60 * 1000;
  },

  activate: function activate(state) {
    var _this = this;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-updater-linux:manualCheck': function atomUpdaterLinuxManualCheck() {
        return _this.manualCheck();
      }
    }));

    atom.config.onDidChange('atom-updater-linux.acceptTestVersion', function (values) {
      _this.timer.stop();
      _this.timer.start();
    });

    atom.config.onDidChange('atom-updater-linux.pkgType', function (values) {
      _this.timer.stop();
      _this.timer.start();
    });

    atom.config.onDidChange('atom-updater-linux.checkInterval', function (values) {
      _this.timer.interval = _this.checkInterval();
    });

    if (!this.timer) {
      var me = this;

      this.timer = new _timer.Timer(function () {
        me.automaticChecker();
      }, false, false, this.checkInterval());
    }

    this.timer.start();
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.statusBar = statusBar;

    this.statusDisplay = new _notify.Notify();

    this.subscriptions.add(this.statusDisplay);

    this.statusBar = statusBar.addRightTile({
      item: this.statusDisplay,
      priority: -1
    });
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
    this.statusBar.destroy();
    this.timer.stop();
  },

  serialize: function serialize() {
    return {};
  },

  automaticChecker: function automaticChecker() {
    var _this2 = this;

    var up = new _updater.Updater();
    var pkgType = '.zip';

    if (atom.config.get('atom-updater-linux.pkgType') === 'Debian, Ubuntu') pkgType = '.deb';else if (atom.config.get('atom-updater-linux.pkgType') === 'RedHat') pkgType = '.rpm';

    up.checkUpdate().then(function (info) {
      if (info) {
        _this2.statusDisplay.content(info);
        atom.notifications.addInfo(['<h2>A new version of Atom is available</h2>', '<p>Latest version: <a href="' + info.html_url + '">' + info.name + '</a></p>', '<div>', info.assets.map(function (asset) {
          if (asset.name.indexOf(pkgType) >= 0) return '<div class="btn btn-primary btn-install-update pull-left" data-target="' + asset.browser_download_url + '">Download and install</div></br>';else return '';
        }).join(''), '</div>'].join(''));
        var installer = new _installer.Installer();
        installer.listen();
      } else _this2.statusDisplay.hide();
    }, function (message) {
      atom.notifications.addError(message);
    });
  },

  manualCheck: function manualCheck() {
    var up = new _updater.Updater();

    up.checkUpdate().then(function (info) {
      if (info) {
        atom.notifications.addInfo(['<p>A new version of Atom is available</p>', '<p>Latest Version: <a href="' + info.html_url + '">' + info.name + '</a></p>', '<div class="btn btn-primary btn-install-update" data-target="' + asset.browser_download_url + '">Install</div>'].join(''));
      } else atom.notifications.addInfo('No new updates were found at this time.');
    }, function (message) {
      atom.notifications.addError(message);
    });
  }
};

exports['default'] = main;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07O3FCQUNuQixPQUFPOztJQUFsQixLQUFLOzt1QkFDSyxXQUFXOztxQkFDYixTQUFTOztzQkFDUixVQUFVOzt5QkFDUCxhQUFhOztBQVByQyxXQUFXLENBQUM7O0FBU1osSUFBSSxJQUFJLEdBQUc7O0FBRVQsUUFBTSxFQUFFO0FBQ04scUJBQWlCLEVBQUU7QUFDakIsWUFBTSxFQUFFLFNBQVM7QUFDakIsZUFBUyxFQUFFLEtBQUs7QUFDaEIsYUFBTyxFQUFFLCtCQUErQjtBQUN4QyxtQkFBYSxFQUFFLHVDQUF1QztLQUN2RDtBQUNELGlCQUFhLEVBQUU7QUFDYixZQUFNLEVBQUUsU0FBUztBQUNqQixlQUFTLEVBQUUsQ0FBQztBQUNaLGFBQU8sRUFBRSxnQkFBZ0I7QUFDekIsbUJBQWEsRUFBRSxpRUFBaUU7S0FDakY7QUFDRCxXQUFPLEVBQUU7QUFDUCxZQUFNLEVBQUUsUUFBUTtBQUNoQixlQUFTLEVBQUUsZ0JBQWdCO0FBQzNCLGFBQU8sRUFBRSxjQUFjO0FBQ3ZCLFlBQU0sRUFBRSxDQUNOLGdCQUFnQixFQUNoQixRQUFRLENBQ1Q7QUFDRCxtQkFBYSxFQUFFLG1DQUFtQztLQUNuRDtHQUNGOztBQUVELG1CQUFpQixFQUFFLElBQUk7QUFDdkIsWUFBVSxFQUFFLElBQUk7QUFDaEIsZUFBYSxFQUFFLElBQUk7QUFDbkIsT0FBSyxFQUFFLElBQUk7O0FBRVgsZUFBYSxFQUFBLHlCQUFHO0FBQ2QsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRXBFLFFBQUcsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUUxQixXQUFPLEFBQUMsTUFBTSxHQUFHLEVBQUUs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QkFBb0IsR0FBRyxpQkFBaUIsQ0FDakgsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQ1gsQ0FBQztPQUNILE1BRUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUN6RSxFQUNELFVBQUMsT0FBTyxFQUFLO0FBQ1gsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdEMsQ0FDRixDQUFDO0dBQ0g7Q0FDRixDQUFDOztxQkFFYSxJQUFJIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F0b20tdXBkYXRlci1saW51eC9saWIvbWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQge1VwZGF0ZXJ9IGZyb20gJy4vdXBkYXRlcic7XG5pbXBvcnQge1RpbWVyfSBmcm9tICcuL3RpbWVyJztcbmltcG9ydCB7Tm90aWZ5fSBmcm9tICcuL25vdGlmeSc7XG5pbXBvcnQge0luc3RhbGxlcn0gZnJvbSAnLi9pbnN0YWxsZXInO1xuXG5sZXQgbWFpbiA9IHtcblxuICBjb25maWc6IHtcbiAgICBhY2NlcHRUZXN0VmVyc2lvbjoge1xuICAgICAgJ3R5cGUnOiAnYm9vbGVhbicsXG4gICAgICAnZGVmYXVsdCc6IGZhbHNlLFxuICAgICAgJ3RpdGxlJzogJ0FjY2VwdCB0ZXN0IHZlcnNpb25zIG9mIGF0b20uJyxcbiAgICAgICdkZXNjcmlwdGlvbic6ICdZb3UgY2FuIGFjY2VwdCB0ZXN0IHZlcnNpb25zIG9mIGF0b20uJ1xuICAgIH0sXG4gICAgY2hlY2tJbnRlcnZhbDoge1xuICAgICAgJ3R5cGUnOiAnaW50ZWdlcicsXG4gICAgICAnZGVmYXVsdCc6IDEsXG4gICAgICAndGl0bGUnOiAnQ2hlY2sgaW50ZXJ2YWwnLFxuICAgICAgJ2Rlc2NyaXB0aW9uJzogJ0ludGVydmFsIHRvIGNoZWNrIG5ldyB2ZXJzaW9ucyBvZiBhdG9tIGluIHJlcG9zaXRvcnksIGluIGhvdXJzLidcbiAgICB9LFxuICAgIHBrZ1R5cGU6IHtcbiAgICAgICd0eXBlJzogJ3N0cmluZycsXG4gICAgICAnZGVmYXVsdCc6ICdEZWJpYW4sIFVidW50dScsXG4gICAgICAndGl0bGUnOiAnUGFja2FnZSB0eXBlJyxcbiAgICAgICdlbnVtJzogW1xuICAgICAgICAnRGViaWFuLCBVYnVudHUnLFxuICAgICAgICAnUmVkSGF0J1xuICAgICAgXSxcbiAgICAgICdkZXNjcmlwdGlvbic6ICdUaGUgdHlwZSBvZiBwYWNrYWdlIGZvciBkb3dubG9hZC4nXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZXJOb3RpZnlWaWV3OiBudWxsLFxuICBtb2RhbFBhbmVsOiBudWxsLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuICB0aW1lcjogbnVsbCxcblxuICBjaGVja0ludGVydmFsKCkge1xuICAgIHZhciBwZXJpb2QgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdXBkYXRlci1saW51eC5jaGVja0ludGVydmFsJywgMSk7XG5cbiAgICBpZihwZXJpb2QgPCAxKSBwZXJpb2QgPSAxO1xuXG4gICAgcmV0dXJuIChwZXJpb2QgKiA2MCAqIDYwKSAqIDEwMDA7XG4gIH0sXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICAvLyBFdmVudHMgc3Vic2NyaWJlZCB0byBpbiBhdG9tJ3Mgc3lzdGVtIGNhbiBiZSBlYXNpbHkgY2xlYW5lZCB1cCB3aXRoIGEgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdhdG9tLXVwZGF0ZXItbGludXg6bWFudWFsQ2hlY2snOiAoKSA9PiB0aGlzLm1hbnVhbENoZWNrKClcbiAgICB9KSk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS11cGRhdGVyLWxpbnV4LmFjY2VwdFRlc3RWZXJzaW9uJywgKHZhbHVlcykgPT4ge1xuICAgICAgdGhpcy50aW1lci5zdG9wKCk7XG4gICAgICB0aGlzLnRpbWVyLnN0YXJ0KCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS11cGRhdGVyLWxpbnV4LnBrZ1R5cGUnLCAodmFsdWVzKSA9PiB7XG4gICAgICB0aGlzLnRpbWVyLnN0b3AoKTtcbiAgICAgIHRoaXMudGltZXIuc3RhcnQoKTtcbiAgICB9KTtcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLXVwZGF0ZXItbGludXguY2hlY2tJbnRlcnZhbCcsICh2YWx1ZXMpID0+IHtcbiAgICAgIHRoaXMudGltZXIuaW50ZXJ2YWwgPSB0aGlzLmNoZWNrSW50ZXJ2YWwoKTtcbiAgICB9KTtcblxuICAgIGlmKCF0aGlzLnRpbWVyKSB7XG4gICAgICB2YXIgbWUgPSB0aGlzO1xuXG4gICAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgbWUuYXV0b21hdGljQ2hlY2tlcigpO1xuICAgICAgICB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIHRoaXMuY2hlY2tJbnRlcnZhbCgpXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMudGltZXIuc3RhcnQoKTtcbiAgfSxcblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuc3RhdHVzQmFyID0gc3RhdHVzQmFyO1xuXG4gICAgdGhpcy5zdGF0dXNEaXNwbGF5ID0gbmV3IE5vdGlmeSgpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnN0YXR1c0Rpc3BsYXkpO1xuXG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKHtcbiAgICAgIGl0ZW06IHRoaXMuc3RhdHVzRGlzcGxheSxcbiAgICAgIHByaW9yaXR5OiAtMVxuICAgIH0pO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnN0YXR1c0Jhci5kZXN0cm95KCk7XG4gICAgdGhpcy50aW1lci5zdG9wKCk7XG4gIH0sXG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgfTtcbiAgfSxcblxuICBhdXRvbWF0aWNDaGVja2VyKCkge1xuICAgIGxldCB1cCA9IG5ldyBVcGRhdGVyKCk7XG4gICAgdmFyIHBrZ1R5cGUgPSAnLnppcCc7XG5cbiAgICBpZihhdG9tLmNvbmZpZy5nZXQoJ2F0b20tdXBkYXRlci1saW51eC5wa2dUeXBlJykgPT09ICdEZWJpYW4sIFVidW50dScpXG4gICAgICBwa2dUeXBlID0gJy5kZWInO1xuICAgIGVsc2UgaWYoYXRvbS5jb25maWcuZ2V0KCdhdG9tLXVwZGF0ZXItbGludXgucGtnVHlwZScpID09PSAnUmVkSGF0JylcbiAgICAgIHBrZ1R5cGUgPSAnLnJwbSc7XG5cbiAgICB1cC5jaGVja1VwZGF0ZSgpLnRoZW4oXG4gICAgICAoaW5mbykgPT4ge1xuICAgICAgICBpZihpbmZvKSB7XG4gICAgICAgICAgdGhpcy5zdGF0dXNEaXNwbGF5LmNvbnRlbnQoaW5mbyk7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICc8aDI+QSBuZXcgdmVyc2lvbiBvZiBBdG9tIGlzIGF2YWlsYWJsZTwvaDI+JyxcbiAgICAgICAgICAgICAgJzxwPkxhdGVzdCB2ZXJzaW9uOiA8YSBocmVmPVwiJyArIGluZm8uaHRtbF91cmwgKyAnXCI+JyArIGluZm8ubmFtZSArICc8L2E+PC9wPicsXG4gICAgICAgICAgICAgICc8ZGl2PicsXG4gICAgICAgICAgICAgICAgaW5mby5hc3NldHMubWFwKChhc3NldCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYoYXNzZXQubmFtZS5pbmRleE9mKHBrZ1R5cGUpID49IDApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4taW5zdGFsbC11cGRhdGUgcHVsbC1sZWZ0XCIgZGF0YS10YXJnZXQ9XCInICsgYXNzZXQuYnJvd3Nlcl9kb3dubG9hZF91cmwgKyAnXCI+RG93bmxvYWQgYW5kIGluc3RhbGw8L2Rpdj48L2JyPic7XG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9KS5qb2luKCcnKSxcbiAgICAgICAgICAgICAgJzwvZGl2PidcbiAgICAgICAgICAgIF0uam9pbignJylcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IGluc3RhbGxlciA9IG5ldyBJbnN0YWxsZXIoKTtcbiAgICAgICAgICBpbnN0YWxsZXIubGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRoaXMuc3RhdHVzRGlzcGxheS5oaWRlKCk7XG4gICAgICB9LFxuICAgICAgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UpO1xuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgbWFudWFsQ2hlY2soKSB7XG4gICAgbGV0IHVwID0gbmV3IFVwZGF0ZXIoKTtcblxuICAgIHVwLmNoZWNrVXBkYXRlKCkudGhlbihcbiAgICAgIChpbmZvKSA9PiB7XG4gICAgICAgIGlmKGluZm8pIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgJzxwPkEgbmV3IHZlcnNpb24gb2YgQXRvbSBpcyBhdmFpbGFibGU8L3A+JyxcbiAgICAgICAgICAgICAgJzxwPkxhdGVzdCBWZXJzaW9uOiA8YSBocmVmPVwiJyArIGluZm8uaHRtbF91cmwgKyAnXCI+JyArIGluZm8ubmFtZSArICc8L2E+PC9wPicsXG4gICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1pbnN0YWxsLXVwZGF0ZVwiIGRhdGEtdGFyZ2V0PVwiJyArIGFzc2V0LmJyb3dzZXJfZG93bmxvYWRfdXJsICsgJ1wiPkluc3RhbGw8L2Rpdj4nXG4gICAgICAgICAgICBdLmpvaW4oJycpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oJ05vIG5ldyB1cGRhdGVzIHdlcmUgZm91bmQgYXQgdGhpcyB0aW1lLicpO1xuICAgICAgfSxcbiAgICAgIChtZXNzYWdlKSA9PiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlKTtcbiAgICAgIH1cbiAgICApO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtYWluO1xuIl19