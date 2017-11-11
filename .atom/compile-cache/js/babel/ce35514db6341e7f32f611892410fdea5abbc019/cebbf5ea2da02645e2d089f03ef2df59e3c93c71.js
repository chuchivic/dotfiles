Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _termLauncher = require('term-launcher');

var _termLauncher2 = _interopRequireDefault(_termLauncher);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _atom = require('atom');

'use babel';

var HydrogenLauncher = {
  config: {
    app: {
      title: 'Terminal application',
      description: 'This will depend on your operation system.',
      type: 'string',
      'default': _termLauncher2['default'].getDefaultTerminal()
    },
    console: {
      title: 'Jupyter console',
      description: 'Change this if you want to start a `qtconsole` or any other jupyter interface that can be started with `jupyter <your-console> --existing <connection-file>`.',
      type: 'string',
      'default': 'console'
    },
    command: {
      title: 'Custom command',
      description: 'This command will be excuted in the launched terminal. You can access the connection file from Hydrogen by using `{connection-file}` within your command',
      type: 'string',
      'default': ''
    }
  },

  subscriptions: null,
  hydrogen: null,
  platformIoTerminal: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'hydrogen-launcher:launch-terminal': function hydrogenLauncherLaunchTerminal() {
        return _this.launchTerminal();
      },
      'hydrogen-launcher:launch-jupyter-console': function hydrogenLauncherLaunchJupyterConsole() {
        return _this.launchJupyter();
      },
      'hydrogen-launcher:launch-jupyter-console-in-platformio-terminal': function hydrogenLauncherLaunchJupyterConsoleInPlatformioTerminal() {
        return _this.launchJupyterInPlatformIoTerminal();
      },
      'hydrogen-launcher:launch-terminal-command': function hydrogenLauncherLaunchTerminalCommand() {
        return _this.launchTerminal(true);
      },
      'hydrogen-launcher:copy-path-to-connection-file': function hydrogenLauncherCopyPathToConnectionFile() {
        return _this.copyPathToConnectionFile();
      }
    }));
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
  },

  consumeHydrogen: function consumeHydrogen(hydrogen) {
    var _this2 = this;

    this.hydrogen = hydrogen;
    return new _atom.Disposable(function () {
      _this2.hydrogen = null;
    });
  },

  consumePlatformIoTerminal: function consumePlatformIoTerminal(provider) {
    var _this3 = this;

    this.platformIoTerminal = provider;
    return new _atom.Disposable(function () {
      _this3.platformIoTerminal = null;
    });
  },

  launchTerminal: function launchTerminal() {
    var command = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var cmd = undefined;
    if (command) {
      cmd = this.getCommand();
      if (!cmd) return;
    }
    _termLauncher2['default'].launchTerminal(cmd, this.getCWD(), this.getTerminal(), function (err) {
      if (err) {
        atom.notifications.addError(err.message);
      }
    });
  },

  launchJupyter: function launchJupyter() {
    var connectionFile = this.getConnectionFile();
    if (!connectionFile) return;

    var jpConsole = atom.config.get('hydrogen-launcher.console');
    _termLauncher2['default'].launchJupyter(connectionFile, this.getCWD(), jpConsole, this.getTerminal(), function (err) {
      if (err) atom.notifications.addError(err.message);
    });
  },

  launchJupyterInPlatformIoTerminal: function launchJupyterInPlatformIoTerminal() {
    var _this4 = this;

    var connectionFile = this.getConnectionFile();
    if (!connectionFile) return;

    var jpConsole = atom.config.get('hydrogen-launcher.console');
    _termLauncher2['default'].getConnectionCommand(connectionFile, jpConsole, function (err, command) {
      if (!_this4.platformIoTerminal) {
        atom.notifications.addError('PlatformIO IDE Terminal has to be installed.');
      } else if (err) {
        atom.notifications.addError(err.message);
      } else {
        _this4.platformIoTerminal.run([command]);
      }
    });
  },

  copyPathToConnectionFile: function copyPathToConnectionFile() {
    var connectionFile = this.getConnectionFile();
    if (!connectionFile) return;

    atom.clipboard.write(connectionFile);
    var message = 'Path to connection file copied to clipboard.';
    var description = 'Use `jupyter console --existing ' + connectionFile + '` to\n            connect to the running kernel.';
    atom.notifications.addSuccess(message, { description: description });
  },

  getConnectionFile: function getConnectionFile() {
    if (!this.hydrogen) {
      atom.notifications.addError('Hydrogen `v1.0.0+` has to be running.');
      return null;
    }
    try {
      return this.hydrogen.getActiveKernel() ? this.hydrogen.getActiveKernel().getConnectionFile() : null;
    } catch (error) {
      atom.notifications.addError(error.message);
    }
    return null;
  },

  getCommand: function getCommand() {
    var cmd = atom.config.get('hydrogen-launcher.command');
    if (cmd === '') {
      atom.notifications.addError('No custom command set.');
      return null;
    }
    if (cmd.indexOf('{connection-file}') > -1) {
      var connectionFile = this.getConnectionFile();
      if (!connectionFile) {
        return null;
      }
      cmd = cmd.replace('{connection-file}', connectionFile);
    }
    return cmd;
  },

  getTerminal: function getTerminal() {
    return atom.config.get('hydrogen-launcher.app');
  },

  getCWD: function getCWD() {
    return atom.project.rootDirectories[0] ? atom.project.rootDirectories[0].path : _path2['default'].dirname(atom.workspace.getActiveTextEditor().getPath());
  }
};

exports['default'] = HydrogenLauncher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2h5ZHJvZ2VuLWxhdW5jaGVyL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs0QkFFaUIsZUFBZTs7OztvQkFDZixNQUFNOzs7O29CQUN5QixNQUFNOztBQUp0RCxXQUFXLENBQUM7O0FBT1osSUFBTSxnQkFBZ0IsR0FBRztBQUN2QixRQUFNLEVBQUU7QUFDTixPQUFHLEVBQUU7QUFDSCxXQUFLLEVBQUUsc0JBQXNCO0FBQzdCLGlCQUFXLEVBQUUsNENBQTRDO0FBQ3pELFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsMEJBQUssa0JBQWtCLEVBQUU7S0FDbkM7QUFDRCxXQUFPLEVBQUU7QUFDUCxXQUFLLEVBQUUsaUJBQWlCO0FBQ3hCLGlCQUFXLEVBQUUsK0pBQStKO0FBQzVLLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsU0FBUztLQUNuQjtBQUNELFdBQU8sRUFBRTtBQUNQLFdBQUssRUFBRSxnQkFBZ0I7QUFDdkIsaUJBQVcsRUFBRSwwSkFBMEo7QUFDdkssVUFBSSxFQUFFLFFBQVE7QUFDZCxpQkFBUyxFQUFFO0tBQ1o7R0FDRjs7QUFFRCxlQUFhLEVBQUUsSUFBSTtBQUNuQixVQUFRLEVBQUUsSUFBSTtBQUNkLG9CQUFrQixFQUFFLElBQUk7O0FBRXhCLFVBQVEsRUFBQSxvQkFBRzs7O0FBQ1QsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUU7QUFDM0QseUNBQW1DLEVBQUU7ZUFBTSxNQUFLLGNBQWMsRUFBRTtPQUFBO0FBQ2hFLGdEQUEwQyxFQUFFO2VBQU0sTUFBSyxhQUFhLEVBQUU7T0FBQTtBQUN0RSx1RUFBaUUsRUFBRTtlQUNqRSxNQUFLLGlDQUFpQyxFQUFFO09BQUE7QUFDMUMsaURBQTJDLEVBQUU7ZUFDM0Ms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aUJBQWlCLEVBQUUsQ0FBQztBQUNoRCxVQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxTQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxjQUFjLENBQUMsQ0FBQztLQUN4RDtBQUNELFdBQU8sR0FBRyxDQUFDO0dBQ1o7O0FBRUQsYUFBVyxFQUFBLHVCQUFHO0FBQ1osV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0dBQ2pEOztBQUVELFFBQU0sRUFBQSxrQkFBRztBQUNQLFdBQU8sQUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUNwQyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7R0FDaEU7Q0FDRixDQUFDOztxQkFFYSxnQkFBZ0IiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvaHlkcm9nZW4tbGF1bmNoZXIvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHRlcm0gZnJvbSAndGVybS1sYXVuY2hlcic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuXG5jb25zdCBIeWRyb2dlbkxhdW5jaGVyID0ge1xuICBjb25maWc6IHtcbiAgICBhcHA6IHtcbiAgICAgIHRpdGxlOiAnVGVybWluYWwgYXBwbGljYXRpb24nLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGlzIHdpbGwgZGVwZW5kIG9uIHlvdXIgb3BlcmF0aW9uIHN5c3RlbS4nLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiB0ZXJtLmdldERlZmF1bHRUZXJtaW5hbCgpLFxuICAgIH0sXG4gICAgY29uc29sZToge1xuICAgICAgdGl0bGU6ICdKdXB5dGVyIGNvbnNvbGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdDaGFuZ2UgdGhpcyBpZiB5b3Ugd2FudCB0byBzdGFydCBhIGBxdGNvbnNvbGVgIG9yIGFueSBvdGhlciBqdXB5dGVyIGludGVyZmFjZSB0aGF0IGNhbiBiZSBzdGFydGVkIHdpdGggYGp1cHl0ZXIgPHlvdXItY29uc29sZT4gLS1leGlzdGluZyA8Y29ubmVjdGlvbi1maWxlPmAuJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJ2NvbnNvbGUnLFxuICAgIH0sXG4gICAgY29tbWFuZDoge1xuICAgICAgdGl0bGU6ICdDdXN0b20gY29tbWFuZCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoaXMgY29tbWFuZCB3aWxsIGJlIGV4Y3V0ZWQgaW4gdGhlIGxhdW5jaGVkIHRlcm1pbmFsLiBZb3UgY2FuIGFjY2VzcyB0aGUgY29ubmVjdGlvbiBmaWxlIGZyb20gSHlkcm9nZW4gYnkgdXNpbmcgYHtjb25uZWN0aW9uLWZpbGV9YCB3aXRoaW4geW91ciBjb21tYW5kJyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJycsXG4gICAgfSxcbiAgfSxcblxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuICBoeWRyb2dlbjogbnVsbCxcbiAgcGxhdGZvcm1Jb1Rlcm1pbmFsOiBudWxsLFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yJywge1xuICAgICAgJ2h5ZHJvZ2VuLWxhdW5jaGVyOmxhdW5jaC10ZXJtaW5hbCc6ICgpID0+IHRoaXMubGF1bmNoVGVybWluYWwoKSxcbiAgICAgICdoeWRyb2dlbi1sYXVuY2hlcjpsYXVuY2gtanVweXRlci1jb25zb2xlJzogKCkgPT4gdGhpcy5sYXVuY2hKdXB5dGVyKCksXG4gICAgICAnaHlkcm9nZW4tbGF1bmNoZXI6bGF1bmNoLWp1cHl0ZXItY29uc29sZS1pbi1wbGF0Zm9ybWlvLXRlcm1pbmFsJzogKCkgPT5cbiAgICAgICAgdGhpcy5sYXVuY2hKdXB5dGVySW5QbGF0Zm9ybUlvVGVybWluYWwoKSxcbiAgICAgICdoeWRyb2dlbi1sYXVuY2hlcjpsYXVuY2gtdGVybWluYWwtY29tbWFuZCc6ICgpID0+XG4gICAgICAgIHRoaXMubGF1bmNoVGVybWluYWwodHJ1ZSksXG4gICAgICAnaHlkcm9nZW4tbGF1bmNoZXI6Y29weS1wYXRoLXRvLWNvbm5lY3Rpb24tZmlsZSc6ICgpID0+XG4gICAgICAgIHRoaXMuY29weVBhdGhUb0Nvbm5lY3Rpb25GaWxlKCksXG4gICAgfSkpO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfSxcblxuICBjb25zdW1lSHlkcm9nZW4oaHlkcm9nZW4pIHtcbiAgICB0aGlzLmh5ZHJvZ2VuID0gaHlkcm9nZW47XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuaHlkcm9nZW4gPSBudWxsO1xuICAgIH0pO1xuICB9LFxuXG4gIGNvbnN1bWVQbGF0Zm9ybUlvVGVybWluYWwocHJvdmlkZXIpIHtcbiAgICB0aGlzLnBsYXRmb3JtSW9UZXJtaW5hbCA9IHByb3ZpZGVyO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLnBsYXRmb3JtSW9UZXJtaW5hbCA9IG51bGw7XG4gICAgfSk7XG4gIH0sXG5cbiAgbGF1bmNoVGVybWluYWwoY29tbWFuZCA9IGZhbHNlKSB7XG4gICAgbGV0IGNtZDtcbiAgICBpZiAoY29tbWFuZCkge1xuICAgICAgY21kID0gdGhpcy5nZXRDb21tYW5kKCk7XG4gICAgICBpZiAoIWNtZCkgcmV0dXJuO1xuICAgIH1cbiAgICB0ZXJtLmxhdW5jaFRlcm1pbmFsKGNtZCwgdGhpcy5nZXRDV0QoKSwgdGhpcy5nZXRUZXJtaW5hbCgpLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgbGF1bmNoSnVweXRlcigpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uRmlsZSA9IHRoaXMuZ2V0Q29ubmVjdGlvbkZpbGUoKTtcbiAgICBpZiAoIWNvbm5lY3Rpb25GaWxlKSByZXR1cm47XG5cbiAgICBjb25zdCBqcENvbnNvbGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2h5ZHJvZ2VuLWxhdW5jaGVyLmNvbnNvbGUnKTtcbiAgICB0ZXJtLmxhdW5jaEp1cHl0ZXIoY29ubmVjdGlvbkZpbGUsIHRoaXMuZ2V0Q1dEKCksIGpwQ29uc29sZSwgdGhpcy5nZXRUZXJtaW5hbCgpLCAoZXJyKSA9PiB7XG4gICAgICBpZiAoZXJyKSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9LFxuXG4gIGxhdW5jaEp1cHl0ZXJJblBsYXRmb3JtSW9UZXJtaW5hbCgpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uRmlsZSA9IHRoaXMuZ2V0Q29ubmVjdGlvbkZpbGUoKTtcbiAgICBpZiAoIWNvbm5lY3Rpb25GaWxlKSByZXR1cm47XG5cbiAgICBjb25zdCBqcENvbnNvbGUgPSBhdG9tLmNvbmZpZy5nZXQoJ2h5ZHJvZ2VuLWxhdW5jaGVyLmNvbnNvbGUnKTtcbiAgICB0ZXJtLmdldENvbm5lY3Rpb25Db21tYW5kKGNvbm5lY3Rpb25GaWxlLCBqcENvbnNvbGUsIChlcnIsIGNvbW1hbmQpID0+IHtcbiAgICAgIGlmICghdGhpcy5wbGF0Zm9ybUlvVGVybWluYWwpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdQbGF0Zm9ybUlPIElERSBUZXJtaW5hbCBoYXMgdG8gYmUgaW5zdGFsbGVkLicpO1xuICAgICAgfSBlbHNlIGlmIChlcnIpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGxhdGZvcm1Jb1Rlcm1pbmFsLnJ1bihbY29tbWFuZF0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGNvcHlQYXRoVG9Db25uZWN0aW9uRmlsZSgpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uRmlsZSA9IHRoaXMuZ2V0Q29ubmVjdGlvbkZpbGUoKTtcbiAgICBpZiAoIWNvbm5lY3Rpb25GaWxlKSByZXR1cm47XG5cbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZShjb25uZWN0aW9uRmlsZSk7XG4gICAgY29uc3QgbWVzc2FnZSA9ICdQYXRoIHRvIGNvbm5lY3Rpb24gZmlsZSBjb3BpZWQgdG8gY2xpcGJvYXJkLic7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSBgVXNlIFxcYGp1cHl0ZXIgY29uc29sZSAtLWV4aXN0aW5nICR7Y29ubmVjdGlvbkZpbGV9XFxgIHRvXG4gICAgICAgICAgICBjb25uZWN0IHRvIHRoZSBydW5uaW5nIGtlcm5lbC5gO1xuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKG1lc3NhZ2UsIHsgZGVzY3JpcHRpb24gfSk7XG4gIH0sXG5cbiAgZ2V0Q29ubmVjdGlvbkZpbGUoKSB7XG4gICAgaWYgKCF0aGlzLmh5ZHJvZ2VuKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0h5ZHJvZ2VuIGB2MS4wLjArYCBoYXMgdG8gYmUgcnVubmluZy4nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuaHlkcm9nZW4uZ2V0QWN0aXZlS2VybmVsKCkgP1xuICAgICAgICB0aGlzLmh5ZHJvZ2VuLmdldEFjdGl2ZUtlcm5lbCgpLmdldENvbm5lY3Rpb25GaWxlKCkgOiBudWxsO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIGdldENvbW1hbmQoKSB7XG4gICAgbGV0IGNtZCA9IGF0b20uY29uZmlnLmdldCgnaHlkcm9nZW4tbGF1bmNoZXIuY29tbWFuZCcpO1xuICAgIGlmIChjbWQgPT09ICcnKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ05vIGN1c3RvbSBjb21tYW5kIHNldC4nKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoY21kLmluZGV4T2YoJ3tjb25uZWN0aW9uLWZpbGV9JykgPiAtMSkge1xuICAgICAgY29uc3QgY29ubmVjdGlvbkZpbGUgPSB0aGlzLmdldENvbm5lY3Rpb25GaWxlKCk7XG4gICAgICBpZiAoIWNvbm5lY3Rpb25GaWxlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgY21kID0gY21kLnJlcGxhY2UoJ3tjb25uZWN0aW9uLWZpbGV9JywgY29ubmVjdGlvbkZpbGUpO1xuICAgIH1cbiAgICByZXR1cm4gY21kO1xuICB9LFxuXG4gIGdldFRlcm1pbmFsKCkge1xuICAgIHJldHVybiBhdG9tLmNvbmZpZy5nZXQoJ2h5ZHJvZ2VuLWxhdW5jaGVyLmFwcCcpO1xuICB9LFxuXG4gIGdldENXRCgpIHtcbiAgICByZXR1cm4gKGF0b20ucHJvamVjdC5yb290RGlyZWN0b3JpZXNbMF0pID9cbiAgICAgIGF0b20ucHJvamVjdC5yb290RGlyZWN0b3JpZXNbMF0ucGF0aCA6XG4gICAgICBwYXRoLmRpcm5hbWUoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmdldFBhdGgoKSk7XG4gIH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBIeWRyb2dlbkxhdW5jaGVyO1xuIl19