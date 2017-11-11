Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _provider = require('./provider');

var _provider2 = _interopRequireDefault(_provider);

var _projectDeps = require('./project-deps');

var _projectDeps2 = _interopRequireDefault(_projectDeps);

var _utils = require('./utils');

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lodashUniq = require('lodash.uniq');

var _lodashUniq2 = _interopRequireDefault(_lodashUniq);

// TODO: check windows compatibility
'use babel';
var PATH_DELIMITER = '/';

function readFilePromise(path) {
    return new Promise(function (resolve) {
        _fs2['default'].readFile(path, function (err, data) {
            return resolve({
                data: data,
                dir: (0, _utils.getParentDir)(path)
            });
        });
    });
}

function parsePackageJSON(file, projectDeps, _ref) {
    var suggestDev = _ref.suggestDev;
    var suggestProd = _ref.suggestProd;

    try {
        var conf = JSON.parse(file.data);
        var deps = [];

        if (conf.dependencies && suggestProd) {
            deps.push.apply(deps, _toConsumableArray(Object.keys(conf.dependencies)));
        }

        if (conf.devDependencies && suggestDev) {
            deps.push.apply(deps, _toConsumableArray(Object.keys(conf.devDependencies)));
        }

        projectDeps.set(file.dir, (0, _lodashUniq2['default'])(deps));
    } catch (e) {
        // this file was probably saved before it was a valid JSON
    }
}

var PACKAGE_NAME = 'autocomplete-js-import';

exports['default'] = {
    config: _settings2['default'],

    filesMap: new Map(),
    projectDeps: new _projectDeps2['default'](),

    _fileWatchers: [],
    _pathListeners: [],
    _settingsObservers: [],

    activate: function activate() {
        var _settingsObservers,
            _this = this;

        var settings = atom.config.get(PACKAGE_NAME);
        var projectPaths = atom.project.getPaths();

        (_settingsObservers = this._settingsObservers).push.apply(_settingsObservers, _toConsumableArray(['hiddenFiles', 'fuzzy', 'fileRelativePaths', 'projectDependencies'].map(function (setting) {
            return atom.config.onDidChange(PACKAGE_NAME + '.' + setting, function () {
                // Just wipe everything and start fresh, relatively expensive but effective
                _this.deactivate();
                _this.activate();
            });
        })));

        if (settings.fuzzy.enabled) {
            (function () {
                var options = {
                    excludedDirs: settings.fuzzy.excludedDirs,
                    showHidden: settings.hiddenFiles,
                    fileTypes: settings.fuzzy.fileTypes
                };

                // TODO: listen for file additions
                _this._buildProjectFilesList(projectPaths, options);

                _this._pathListeners.push(atom.project.onDidChangePaths(function (paths) {
                    var newPaths = paths.filter(function (p) {
                        return !_this.filesMap.has(p);
                    });

                    _this._buildProjectFilesList(newPaths, options);
                }));
            })();
        }

        if (settings.projectDependencies.suggestDev || settings.projectDependencies.suggestProd) {
            this._searchForProjectDeps(projectPaths, settings.projectDependencies);

            this._pathListeners.push(atom.project.onDidChangePaths(function (paths) {
                var newProjectPaths = paths.filter(function (p) {
                    return !_this.projectDeps.hasDeps(p);
                });

                _this._searchForProjectDeps(newProjectPaths, settings.projectDependencies);
            }));
        }
    },

    deactivate: function deactivate() {
        this._pathListeners.forEach(function (listener) {
            return listener.dispose();
        });
        this._pathListeners.length = 0;

        this._fileWatchers.forEach(function (watcher) {
            return watcher.close();
        });
        this._fileWatchers.length = 0;

        this._settingsObservers.forEach(function (observer) {
            return observer.dispose();
        });
        this._settingsObservers.length = 0;

        // In case of settings change, these references must stay intact for the provide method below to work
        this.filesMap.clear();
        this.projectDeps.clear();
    },

    provide: function provide() {
        return new _provider2['default'](this.projectDeps, this.filesMap);
    },

    _buildProjectFilesList: function _buildProjectFilesList(projectPaths, _ref2) {
        var _this2 = this;

        var excludedDirs = _ref2.excludedDirs;
        var fileTypes = _ref2.fileTypes;
        var showHidden = _ref2.showHidden;

        projectPaths.forEach(function (p) {

            // Join together our desired file extensions, like "ts,js,jsx,json"
            // if necessary. Glob will fail if you give it just one extension
            // like "js" so handle that case separately.
            var fileTypeSet = fileTypes.length === 1 ? fileTypes[0] : '{' + fileTypes.join(',') + '}';

            // Create our base glob like "/path/to/project/**/*.{ts,js,jsx,json}"
            var globPattern = p + '/**/*.' + fileTypeSet;

            // Use the ignore option to exclude the given directories anywhere
            // including a subpath.
            var ignore = excludedDirs.map(function (dir) {
                return p + '/**/' + dir + '/**';
            }); // like ["/path/to/project/**/node_modules/**", etc.]

            (0, _glob2['default'])(globPattern, { dot: showHidden, nodir: true, ignore: ignore }, function (err, childPaths) {
                _this2.filesMap.set(p, childPaths
                // Ensure no empty paths
                .filter(Boolean)
                // We want shortest paths to appear first when searching so sort based on total path parts
                // then alphabetically
                // E.G Searching for index.js should appear as so:
                // 1. index.js
                // 2. some/path/index.js
                // 3. some/long/path/index.js
                // 4. some/longer/path/index.js
                // If we used Glob's output directly, the shortest paths appear last,
                // which can cause non unique filenames with short paths to be unsearchable
                .sort(function (a, b) {
                    var pathDifference = a.split(PATH_DELIMITER).length - b.split(PATH_DELIMITER).length;

                    if (pathDifference !== 0) {
                        return pathDifference;
                    }

                    return a.localeCompare(b);
                }).map(function (child) {
                    return _path2['default'].relative(p, child);
                }));
            });
        });
    },

    _searchForProjectDeps: function _searchForProjectDeps(projectPaths, packageSettings) {
        var _this3 = this;

        if (!projectPaths.length) {
            return;
        }

        var packageExtraction = projectPaths.map(function (p) {
            var packageConfPath = p + '/package.json';

            return new Promise(function (resolve) {
                _fs2['default'].stat(packageConfPath, function (err, stats) {
                    return resolve({ stats: stats, path: packageConfPath });
                });
            });
        });

        Promise.all(packageExtraction).then(function (resolved) {
            // Only get the files that exist
            var packageConfs = resolved.filter(function (r) {
                return r.stats && r.stats.isFile();
            });

            return Promise.all(packageConfs.map(function (conf) {
                _this3._fileWatchers.push(_fs2['default'].watch(conf.path, function (eventType) {
                    if (eventType === 'change') {
                        return readFilePromise(conf.path).then(function (file) {
                            return parsePackageJSON(file, _this3.projectDeps, packageSettings);
                        });
                    }
                }));

                return readFilePromise(conf.path);
            }));
        }).then(function (files) {
            files.forEach(function (f) {
                return parsePackageJSON(f, _this3.projectDeps, packageSettings);
            });
        })['catch'](function () {});
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3dCQUNxQyxZQUFZOzs7OzJCQUN6QixnQkFBZ0I7Ozs7cUJBQ2IsU0FBUzs7d0JBQ2YsWUFBWTs7OztrQkFDbEIsSUFBSTs7OztvQkFDRixNQUFNOzs7O29CQUNOLE1BQU07Ozs7MEJBQ04sYUFBYTs7Ozs7QUFSOUIsV0FBVyxDQUFBO0FBV1gsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDOztBQUUzQixTQUFTLGVBQWUsQ0FBQyxJQUFJLEVBQUU7QUFDM0IsV0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMxQix3QkFBRyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBRyxFQUFFLElBQUk7bUJBQUssT0FBTyxDQUFDO0FBQ3JDLG9CQUFJLEVBQUosSUFBSTtBQUNKLG1CQUFHLEVBQUUseUJBQWEsSUFBSSxDQUFDO2FBQzFCLENBQUM7U0FBQSxDQUFDLENBQUM7S0FDUCxDQUFDLENBQUM7Q0FDTjs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBeUIsRUFBRTtRQUExQixVQUFVLEdBQVgsSUFBeUIsQ0FBeEIsVUFBVTtRQUFFLFdBQVcsR0FBeEIsSUFBeUIsQ0FBWixXQUFXOztBQUNqRSxRQUFJO0FBQ0EsWUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsWUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUVoQixZQUFJLElBQUksQ0FBQyxZQUFZLElBQUksV0FBVyxFQUFFO0FBQ2xDLGdCQUFJLENBQUMsSUFBSSxNQUFBLENBQVQsSUFBSSxxQkFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBQyxDQUFDO1NBQ2hEOztBQUVELFlBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxVQUFVLEVBQUU7QUFDcEMsZ0JBQUksQ0FBQyxJQUFJLE1BQUEsQ0FBVCxJQUFJLHFCQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFDLENBQUM7U0FDbkQ7O0FBRUQsbUJBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSw2QkFBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3pDLENBQUMsT0FBTyxDQUFDLEVBQUU7O0tBRVg7Q0FDSjs7QUFFRCxJQUFNLFlBQVksR0FBRyx3QkFBd0IsQ0FBQzs7cUJBRS9CO0FBQ1gsVUFBTSx1QkFBVTs7QUFFaEIsWUFBUSxFQUFFLElBQUksR0FBRyxFQUFFO0FBQ25CLGVBQVcsRUFBRSw4QkFBaUI7O0FBRTlCLGlCQUFhLEVBQUUsRUFBRTtBQUNqQixrQkFBYyxFQUFFLEVBQUU7QUFDbEIsc0JBQWtCLEVBQUUsRUFBRTs7QUFFdEIsWUFBUSxFQUFBLG9CQUFHOzs7O0FBQ1AsWUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDL0MsWUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7QUFFN0MsOEJBQUEsSUFBSSxDQUFDLGtCQUFrQixFQUFDLElBQUksTUFBQSx3Q0FBSSxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxPQUFPO21CQUM1RyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBSSxZQUFZLFNBQUksT0FBTyxFQUFJLFlBQU07O0FBRXhELHNCQUFLLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLHNCQUFLLFFBQVEsRUFBRSxDQUFDO2FBQ25CLENBQUM7U0FBQSxDQUNMLEVBQUMsQ0FBQzs7QUFFSCxZQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFOztBQUN4QixvQkFBTSxPQUFPLEdBQUc7QUFDWixnQ0FBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUN6Qyw4QkFBVSxFQUFFLFFBQVEsQ0FBQyxXQUFXO0FBQ2hDLDZCQUFTLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTO2lCQUN0QyxDQUFDOzs7QUFHRixzQkFBSyxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7O0FBRW5ELHNCQUFLLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUM1RCx3QkFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7K0JBQUksQ0FBQyxNQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUFBLENBQUMsQ0FBQzs7QUFFMUQsMEJBQUssc0JBQXNCLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNsRCxDQUFDLENBQUMsQ0FBQzs7U0FDUDs7QUFFRCxZQUFJLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRTtBQUNyRixnQkFBSSxDQUFDLHFCQUFxQixDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFdkUsZ0JBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDNUQsb0JBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDOzJCQUFJLENBQUMsTUFBSyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztpQkFBQSxDQUFDLENBQUM7O0FBRXhFLHNCQUFLLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUM3RSxDQUFDLENBQUMsQ0FBQztTQUNQO0tBQ0o7O0FBRUQsY0FBVSxFQUFBLHNCQUFHO0FBQ1QsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRO21CQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7U0FBQSxDQUFDLENBQUM7QUFDNUQsWUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUUvQixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87bUJBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtTQUFBLENBQUMsQ0FBQztBQUN2RCxZQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRTlCLFlBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRO21CQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7U0FBQSxDQUFDLENBQUM7QUFDaEUsWUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7OztBQUduQyxZQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDNUI7O0FBRUQsV0FBTyxFQUFBLG1CQUFHO0FBQ04sZUFBTywwQkFBNkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDeEU7O0FBRUQsMEJBQXNCLEVBQUEsZ0NBQUMsWUFBWSxFQUFFLEtBQXFDLEVBQUU7OztZQUF0QyxZQUFZLEdBQWIsS0FBcUMsQ0FBcEMsWUFBWTtZQUFFLFNBQVMsR0FBeEIsS0FBcUMsQ0FBdEIsU0FBUztZQUFFLFVBQVUsR0FBcEMsS0FBcUMsQ0FBWCxVQUFVOztBQUNyRSxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUMsRUFBSTs7Ozs7QUFLdEIsZ0JBQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFHLENBQUM7OztBQUd2RixnQkFBTSxXQUFXLEdBQU0sQ0FBQyxjQUFTLFdBQVcsQUFBRSxDQUFDOzs7O0FBSS9DLGdCQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRzt1QkFBTyxDQUFDLFlBQU8sR0FBRzthQUFLLENBQUMsQ0FBQzs7QUFFNUQsbUNBQUssV0FBVyxFQUFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsRUFBRSxVQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUs7QUFDM0UsdUJBQUssUUFBUSxDQUFDLEdBQUcsQ0FDYixDQUFDLEVBQ0QsVUFBVTs7aUJBRUwsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7Ozs7Ozs7OztpQkFVZixJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ1osd0JBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDOztBQUV2Rix3QkFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO0FBQ3RCLCtCQUFPLGNBQWMsQ0FBQztxQkFDekI7O0FBRUQsMkJBQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDN0IsQ0FBQyxDQUNELEdBQUcsQ0FBQyxVQUFBLEtBQUs7MkJBQUksa0JBQUssUUFBUSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7aUJBQUEsQ0FDeEMsQ0FDSixDQUFDO2FBQ0wsQ0FBQyxDQUFDO1NBQ04sQ0FBQyxDQUFDO0tBQ047O0FBRUQseUJBQXFCLEVBQUEsK0JBQUMsWUFBWSxFQUFFLGVBQWUsRUFBRTs7O0FBQ2pELFlBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO0FBQ3RCLG1CQUFPO1NBQ1Y7O0FBRUQsWUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxFQUFJO0FBQzVDLGdCQUFNLGVBQWUsR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDOztBQUU1QyxtQkFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMxQixnQ0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLFVBQUMsR0FBRyxFQUFFLEtBQUs7MkJBQUssT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFMLEtBQUssRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFDLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2FBQ3JGLENBQUMsQ0FBQztTQUNOLENBQUMsQ0FBQzs7QUFFSCxlQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQ3pCLElBQUksQ0FBQyxVQUFBLFFBQVEsRUFBSTs7QUFFZCxnQkFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7dUJBQUksQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTthQUFBLENBQUMsQ0FBQzs7QUFFdkUsbUJBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ3hDLHVCQUFLLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBQSxTQUFTLEVBQUk7QUFDckQsd0JBQUksU0FBUyxLQUFLLFFBQVEsRUFBRTtBQUN4QiwrQkFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUM1QixJQUFJLENBQUMsVUFBQSxJQUFJO21DQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxPQUFLLFdBQVcsRUFBRSxlQUFlLENBQUM7eUJBQUEsQ0FBQyxDQUFDO3FCQUNoRjtpQkFDSixDQUFDLENBQUMsQ0FBQzs7QUFFSix1QkFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JDLENBQUMsQ0FBQyxDQUFDO1NBQ1AsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNYLGlCQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQzt1QkFBSSxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsT0FBSyxXQUFXLEVBQUUsZUFBZSxDQUFDO2FBQUEsQ0FBQyxDQUFDO1NBQzlFLENBQUMsU0FDSSxDQUFDLFlBQU0sRUFBRSxDQUFDLENBQUM7S0FDeEI7Q0FDSiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5pbXBvcnQgSW1wb3J0Q29tcGxldGlvblByb3ZpZGVyIGZyb20gJy4vcHJvdmlkZXInO1xuaW1wb3J0IFByb2plY3REZXBzIGZyb20gJy4vcHJvamVjdC1kZXBzJztcbmltcG9ydCB7Z2V0UGFyZW50RGlyfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBzZXR0aW5ncyBmcm9tICcuL3NldHRpbmdzJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InO1xuaW1wb3J0IHVuaXEgZnJvbSAnbG9kYXNoLnVuaXEnO1xuXG4vLyBUT0RPOiBjaGVjayB3aW5kb3dzIGNvbXBhdGliaWxpdHlcbmNvbnN0IFBBVEhfREVMSU1JVEVSID0gJy8nO1xuXG5mdW5jdGlvbiByZWFkRmlsZVByb21pc2UocGF0aCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgZnMucmVhZEZpbGUocGF0aCwgKGVyciwgZGF0YSkgPT4gcmVzb2x2ZSh7XG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgZGlyOiBnZXRQYXJlbnREaXIocGF0aClcbiAgICAgICAgfSkpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwYXJzZVBhY2thZ2VKU09OKGZpbGUsIHByb2plY3REZXBzLCB7c3VnZ2VzdERldiwgc3VnZ2VzdFByb2R9KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29uZiA9IEpTT04ucGFyc2UoZmlsZS5kYXRhKTtcbiAgICAgICAgY29uc3QgZGVwcyA9IFtdO1xuXG4gICAgICAgIGlmIChjb25mLmRlcGVuZGVuY2llcyAmJiBzdWdnZXN0UHJvZCkge1xuICAgICAgICAgICAgZGVwcy5wdXNoKC4uLk9iamVjdC5rZXlzKGNvbmYuZGVwZW5kZW5jaWVzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZi5kZXZEZXBlbmRlbmNpZXMgJiYgc3VnZ2VzdERldikge1xuICAgICAgICAgICAgZGVwcy5wdXNoKC4uLk9iamVjdC5rZXlzKGNvbmYuZGV2RGVwZW5kZW5jaWVzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9qZWN0RGVwcy5zZXQoZmlsZS5kaXIsIHVuaXEoZGVwcykpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gdGhpcyBmaWxlIHdhcyBwcm9iYWJseSBzYXZlZCBiZWZvcmUgaXQgd2FzIGEgdmFsaWQgSlNPTlxuICAgIH1cbn1cblxuY29uc3QgUEFDS0FHRV9OQU1FID0gJ2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgY29uZmlnOiBzZXR0aW5ncyxcblxuICAgIGZpbGVzTWFwOiBuZXcgTWFwKCksXG4gICAgcHJvamVjdERlcHM6IG5ldyBQcm9qZWN0RGVwcygpLFxuXG4gICAgX2ZpbGVXYXRjaGVyczogW10sXG4gICAgX3BhdGhMaXN0ZW5lcnM6IFtdLFxuICAgIF9zZXR0aW5nc09ic2VydmVyczogW10sXG5cbiAgICBhY3RpdmF0ZSgpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBhdG9tLmNvbmZpZy5nZXQoUEFDS0FHRV9OQU1FKTtcbiAgICAgICAgY29uc3QgcHJvamVjdFBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCk7XG5cbiAgICAgICAgdGhpcy5fc2V0dGluZ3NPYnNlcnZlcnMucHVzaCguLi5bJ2hpZGRlbkZpbGVzJywgJ2Z1enp5JywgJ2ZpbGVSZWxhdGl2ZVBhdGhzJywgJ3Byb2plY3REZXBlbmRlbmNpZXMnXS5tYXAoc2V0dGluZyA9PlxuICAgICAgICAgICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoYCR7UEFDS0FHRV9OQU1FfS4ke3NldHRpbmd9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEp1c3Qgd2lwZSBldmVyeXRoaW5nIGFuZCBzdGFydCBmcmVzaCwgcmVsYXRpdmVseSBleHBlbnNpdmUgYnV0IGVmZmVjdGl2ZVxuICAgICAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICkpO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5mdXp6eS5lbmFibGVkKSB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIGV4Y2x1ZGVkRGlyczogc2V0dGluZ3MuZnV6enkuZXhjbHVkZWREaXJzLFxuICAgICAgICAgICAgICAgIHNob3dIaWRkZW46IHNldHRpbmdzLmhpZGRlbkZpbGVzLFxuICAgICAgICAgICAgICAgIGZpbGVUeXBlczogc2V0dGluZ3MuZnV6enkuZmlsZVR5cGVzXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBsaXN0ZW4gZm9yIGZpbGUgYWRkaXRpb25zXG4gICAgICAgICAgICB0aGlzLl9idWlsZFByb2plY3RGaWxlc0xpc3QocHJvamVjdFBhdGhzLCBvcHRpb25zKTtcblxuICAgICAgICAgICAgdGhpcy5fcGF0aExpc3RlbmVycy5wdXNoKGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKHBhdGhzID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdQYXRocyA9IHBhdGhzLmZpbHRlcihwID0+ICF0aGlzLmZpbGVzTWFwLmhhcyhwKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9idWlsZFByb2plY3RGaWxlc0xpc3QobmV3UGF0aHMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLnByb2plY3REZXBlbmRlbmNpZXMuc3VnZ2VzdERldiB8fCBzZXR0aW5ncy5wcm9qZWN0RGVwZW5kZW5jaWVzLnN1Z2dlc3RQcm9kKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWFyY2hGb3JQcm9qZWN0RGVwcyhwcm9qZWN0UGF0aHMsIHNldHRpbmdzLnByb2plY3REZXBlbmRlbmNpZXMpO1xuXG4gICAgICAgICAgICB0aGlzLl9wYXRoTGlzdGVuZXJzLnB1c2goYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMocGF0aHMgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Byb2plY3RQYXRocyA9IHBhdGhzLmZpbHRlcihwID0+ICF0aGlzLnByb2plY3REZXBzLmhhc0RlcHMocCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VhcmNoRm9yUHJvamVjdERlcHMobmV3UHJvamVjdFBhdGhzLCBzZXR0aW5ncy5wcm9qZWN0RGVwZW5kZW5jaWVzKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWFjdGl2YXRlKCkge1xuICAgICAgICB0aGlzLl9wYXRoTGlzdGVuZXJzLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5fcGF0aExpc3RlbmVycy5sZW5ndGggPSAwO1xuXG4gICAgICAgIHRoaXMuX2ZpbGVXYXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4gd2F0Y2hlci5jbG9zZSgpKTtcbiAgICAgICAgdGhpcy5fZmlsZVdhdGNoZXJzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgdGhpcy5fc2V0dGluZ3NPYnNlcnZlcnMuZm9yRWFjaChvYnNlcnZlciA9PiBvYnNlcnZlci5kaXNwb3NlKCkpO1xuICAgICAgICB0aGlzLl9zZXR0aW5nc09ic2VydmVycy5sZW5ndGggPSAwO1xuXG4gICAgICAgIC8vIEluIGNhc2Ugb2Ygc2V0dGluZ3MgY2hhbmdlLCB0aGVzZSByZWZlcmVuY2VzIG11c3Qgc3RheSBpbnRhY3QgZm9yIHRoZSBwcm92aWRlIG1ldGhvZCBiZWxvdyB0byB3b3JrXG4gICAgICAgIHRoaXMuZmlsZXNNYXAuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5wcm9qZWN0RGVwcy5jbGVhcigpO1xuICAgIH0sXG5cbiAgICBwcm92aWRlKCkge1xuICAgICAgICByZXR1cm4gbmV3IEltcG9ydENvbXBsZXRpb25Qcm92aWRlcih0aGlzLnByb2plY3REZXBzLCB0aGlzLmZpbGVzTWFwKTtcbiAgICB9LFxuXG4gICAgX2J1aWxkUHJvamVjdEZpbGVzTGlzdChwcm9qZWN0UGF0aHMsIHtleGNsdWRlZERpcnMsIGZpbGVUeXBlcywgc2hvd0hpZGRlbn0pIHtcbiAgICAgICAgcHJvamVjdFBhdGhzLmZvckVhY2gocCA9PiB7XG5cbiAgICAgICAgICAgIC8vIEpvaW4gdG9nZXRoZXIgb3VyIGRlc2lyZWQgZmlsZSBleHRlbnNpb25zLCBsaWtlIFwidHMsanMsanN4LGpzb25cIlxuICAgICAgICAgICAgLy8gaWYgbmVjZXNzYXJ5LiBHbG9iIHdpbGwgZmFpbCBpZiB5b3UgZ2l2ZSBpdCBqdXN0IG9uZSBleHRlbnNpb25cbiAgICAgICAgICAgIC8vIGxpa2UgXCJqc1wiIHNvIGhhbmRsZSB0aGF0IGNhc2Ugc2VwYXJhdGVseS5cbiAgICAgICAgICAgIGNvbnN0IGZpbGVUeXBlU2V0ID0gZmlsZVR5cGVzLmxlbmd0aCA9PT0gMSA/IGZpbGVUeXBlc1swXSA6IGB7JHtmaWxlVHlwZXMuam9pbignLCcpfX1gO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgb3VyIGJhc2UgZ2xvYiBsaWtlIFwiL3BhdGgvdG8vcHJvamVjdC8qKi8qLnt0cyxqcyxqc3gsanNvbn1cIlxuICAgICAgICAgICAgY29uc3QgZ2xvYlBhdHRlcm4gPSBgJHtwfS8qKi8qLiR7ZmlsZVR5cGVTZXR9YDtcblxuICAgICAgICAgICAgLy8gVXNlIHRoZSBpZ25vcmUgb3B0aW9uIHRvIGV4Y2x1ZGUgdGhlIGdpdmVuIGRpcmVjdG9yaWVzIGFueXdoZXJlXG4gICAgICAgICAgICAvLyBpbmNsdWRpbmcgYSBzdWJwYXRoLlxuICAgICAgICAgICAgY29uc3QgaWdub3JlID0gZXhjbHVkZWREaXJzLm1hcChkaXIgPT4gYCR7cH0vKiovJHtkaXJ9LyoqYCk7IC8vIGxpa2UgW1wiL3BhdGgvdG8vcHJvamVjdC8qKi9ub2RlX21vZHVsZXMvKipcIiwgZXRjLl1cblxuICAgICAgICAgICAgZ2xvYihnbG9iUGF0dGVybiwge2RvdDogc2hvd0hpZGRlbiwgbm9kaXI6IHRydWUsIGlnbm9yZX0sIChlcnIsIGNoaWxkUGF0aHMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGVzTWFwLnNldChcbiAgICAgICAgICAgICAgICAgICAgcCxcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRQYXRoc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRW5zdXJlIG5vIGVtcHR5IHBhdGhzXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSB3YW50IHNob3J0ZXN0IHBhdGhzIHRvIGFwcGVhciBmaXJzdCB3aGVuIHNlYXJjaGluZyBzbyBzb3J0IGJhc2VkIG9uIHRvdGFsIHBhdGggcGFydHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZW4gYWxwaGFiZXRpY2FsbHlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEUuRyBTZWFyY2hpbmcgZm9yIGluZGV4LmpzIHNob3VsZCBhcHBlYXIgYXMgc286XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAxLiBpbmRleC5qc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMi4gc29tZS9wYXRoL2luZGV4LmpzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAzLiBzb21lL2xvbmcvcGF0aC9pbmRleC5qc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNC4gc29tZS9sb25nZXIvcGF0aC9pbmRleC5qc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgdXNlZCBHbG9iJ3Mgb3V0cHV0IGRpcmVjdGx5LCB0aGUgc2hvcnRlc3QgcGF0aHMgYXBwZWFyIGxhc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGljaCBjYW4gY2F1c2Ugbm9uIHVuaXF1ZSBmaWxlbmFtZXMgd2l0aCBzaG9ydCBwYXRocyB0byBiZSB1bnNlYXJjaGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aERpZmZlcmVuY2UgPSBhLnNwbGl0KFBBVEhfREVMSU1JVEVSKS5sZW5ndGggLSBiLnNwbGl0KFBBVEhfREVMSU1JVEVSKS5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGF0aERpZmZlcmVuY2UgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhdGhEaWZmZXJlbmNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhLmxvY2FsZUNvbXBhcmUoYik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChjaGlsZCA9PiBwYXRoLnJlbGF0aXZlKHAsIGNoaWxkKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgX3NlYXJjaEZvclByb2plY3REZXBzKHByb2plY3RQYXRocywgcGFja2FnZVNldHRpbmdzKSB7XG4gICAgICAgIGlmICghcHJvamVjdFBhdGhzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFja2FnZUV4dHJhY3Rpb24gPSBwcm9qZWN0UGF0aHMubWFwKHAgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFja2FnZUNvbmZQYXRoID0gcCArICcvcGFja2FnZS5qc29uJztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgIGZzLnN0YXQocGFja2FnZUNvbmZQYXRoLCAoZXJyLCBzdGF0cykgPT4gcmVzb2x2ZSh7c3RhdHMsIHBhdGg6IHBhY2thZ2VDb25mUGF0aH0pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBQcm9taXNlLmFsbChwYWNrYWdlRXh0cmFjdGlvbilcbiAgICAgICAgICAgIC50aGVuKHJlc29sdmVkID0+IHtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGdldCB0aGUgZmlsZXMgdGhhdCBleGlzdFxuICAgICAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VDb25mcyA9IHJlc29sdmVkLmZpbHRlcihyID0+IHIuc3RhdHMgJiYgci5zdGF0cy5pc0ZpbGUoKSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocGFja2FnZUNvbmZzLm1hcChjb25mID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsZVdhdGNoZXJzLnB1c2goZnMud2F0Y2goY29uZi5wYXRoLCBldmVudFR5cGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gJ2NoYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVhZEZpbGVQcm9taXNlKGNvbmYucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZmlsZSA9PiBwYXJzZVBhY2thZ2VKU09OKGZpbGUsIHRoaXMucHJvamVjdERlcHMsIHBhY2thZ2VTZXR0aW5ncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlYWRGaWxlUHJvbWlzZShjb25mLnBhdGgpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmaWxlcyA9PiB7XG4gICAgICAgICAgICAgICAgZmlsZXMuZm9yRWFjaChmID0+IHBhcnNlUGFja2FnZUpTT04oZiwgdGhpcy5wcm9qZWN0RGVwcywgcGFja2FnZVNldHRpbmdzKSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9XG59XG4iXX0=