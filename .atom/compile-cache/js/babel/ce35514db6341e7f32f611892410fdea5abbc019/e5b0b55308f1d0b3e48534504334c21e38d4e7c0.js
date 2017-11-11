Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _utils = require('./utils');

var _fuzzy = require('fuzzy');

var Fuzzy = _interopRequireWildcard(_fuzzy);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var ImportCompletionProvider = (function () {
    function ImportCompletionProvider(projectDeps, filesMap) {
        _classCallCheck(this, ImportCompletionProvider);

        this.selector = '.source.js, .source.ts';
        this.disableForSelector = '.source.js .comment, .source.ts .comment';
        // Include as higher priority than default auto complete suggestions
        this.inclusionPriority = 1;

        // Get search structures via Dependency injection
        this.projectDeps = projectDeps;
        this.filesMap = filesMap;
    }

    _createClass(ImportCompletionProvider, [{
        key: 'getSuggestions',
        value: function getSuggestions(_ref) {
            var _this = this;

            var editor = _ref.editor;
            var bufferPosition = _ref.bufferPosition;

            return Promise.resolve().then(function () {
                // TODO: this strategy won't work when the cursor is in the middle
                var prefix = _this._getPrefix(editor, bufferPosition);
                var settings = atom.config.get('autocomplete-js-import');
                var packageName = (0, _utils.capturedDependency)(prefix, settings.importTypes);
                var results = [];

                if (!packageName) {
                    return results;
                }

                // checks for packages starting with name ../ or ./
                if (/^\.{1,2}\//.test(packageName)) {
                    var _ret = (function () {
                        var _getDirAndFilePrefix = (0, _utils.getDirAndFilePrefix)(packageName);

                        var _getDirAndFilePrefix2 = _slicedToArray(_getDirAndFilePrefix, 2);

                        var inputtedRelativePath = _getDirAndFilePrefix2[0];
                        var toComplete = _getDirAndFilePrefix2[1];

                        var currentDirPath = (0, _utils.getParentDir)(editor.getPath());
                        var absolutePath = _path2['default'].resolve(currentDirPath, inputtedRelativePath);

                        return {
                            v: new Promise(function (resolve) {
                                _fs2['default'].readdir(absolutePath, function (err, files) {
                                    if (!files) {
                                        return resolve([]);
                                    }

                                    var matchingFiles = files.filter(function (f) {
                                        return (0, _utils.startsWith)(f, toComplete);
                                    });

                                    if (!settings.hiddenFiles) {
                                        matchingFiles = matchingFiles.filter((0, _utils.not)(_utils.isHiddenFile));
                                    }

                                    resolve(matchingFiles.map(function (d) {
                                        return (0, _utils.dropExtensions)(d, settings.removeExtensions);
                                    }));
                                });
                            })['catch'](function () {/* shit happens */})
                        };
                    })();

                    if (typeof _ret === 'object') return _ret.v;
                } else if ((0, _utils.matchesNPMNaming)(packageName)) {
                        results.push.apply(results, _toConsumableArray(_this.projectDeps.search(editor.getPath(), packageName)));
                    }

                // This is last to give more precedence to package and local file name matches
                if (settings.fuzzy.enabled) {
                    results.push.apply(results, _toConsumableArray(_this._findInFiles(editor.getPath(), packageName)));
                }

                return results;
            }).then(function (completions) {
                // TODO: if part of the text is already present then replace the text or align it
                // ^ e.g in<cursor><enter>dex will result in index.jsdex instead of index.js
                if (completions && completions.length) {
                    return completions.map(function (c) {
                        var fullCompletion = {
                            type: 'import'
                        };

                        if (typeof c === 'string') {
                            fullCompletion.text = c;
                        } else {
                            Object.assign(fullCompletion, c);
                        }

                        return fullCompletion;
                    });
                }

                return [];
            })['catch'](function () {
                // because shit happens and I need to get work done
            });
        }
    }, {
        key: '_getPrefix',
        value: function _getPrefix(editor, _ref2) {
            var row = _ref2.row;
            var column = _ref2.column;

            var prefixRange = new _atom.Range(new _atom.Point(row, 0), new _atom.Point(row, column));

            return editor.getTextInBufferRange(prefixRange);
        }

        /**
         * @private
         * @param  {String} editorPath
         * @param  {String} stringPattern
         * @param  {Number} max
         * @return {Array<Object<text: String, displayText: String>>}
         */
    }, {
        key: '_findInFiles',
        value: function _findInFiles(editorPath, stringPattern) {
            var max = arguments.length <= 2 || arguments[2] === undefined ? 6 : arguments[2];

            var rootDirs = atom.project.getDirectories();
            var containingRoot = rootDirs.find(function (dir) {
                return dir.contains(editorPath);
            });
            var settings = atom.config.get('autocomplete-js-import');
            var results = [];

            if (!containingRoot) {
                return results;
            }

            var targetFileList = this.filesMap.get(containingRoot.path);

            for (var i = 0; i < targetFileList.length && results.length < max; i++) {
                if (Fuzzy.test(stringPattern, targetFileList[i])) {
                    var rootRelativePath = targetFileList[i];
                    var currFileRelativePath = _path2['default'].relative((0, _utils.getParentDir)(editorPath), containingRoot.path + '/' + rootRelativePath);

                    // TODO: I have no idea how buggy this is
                    // path.relative doesn't add a './' for files in same directory
                    if (/^[^.]/.test(currFileRelativePath)) {
                        currFileRelativePath = './' + currFileRelativePath;
                    }

                    // Show the full path because it aligns with what the user is typing,
                    if (settings.fileRelativePaths) {
                        // just insert the path relative to the user's current file
                        results.push({
                            text: (0, _utils.dropExtensions)(currFileRelativePath, settings.removeExtensions),
                            displayText: rootRelativePath
                        });
                    } else {
                        results.push({
                            text: (0, _utils.dropExtensions)(rootRelativePath, settings.removeExtensions),
                            displayText: rootRelativePath
                        });
                    }
                }
            }

            return results;
        }
    }]);

    return ImportCompletionProvider;
})();

exports['default'] = ImportCompletionProvider;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBQzJCLE1BQU07O3FCQVUxQixTQUFTOztxQkFDTyxPQUFPOztJQUFsQixLQUFLOztvQkFDQSxNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFkbkIsV0FBVyxDQUFBOztJQWdCVSx3QkFBd0I7QUFDOUIsYUFETSx3QkFBd0IsQ0FDN0IsV0FBVyxFQUFFLFFBQVEsRUFBRTs4QkFEbEIsd0JBQXdCOztBQUVyQyxZQUFJLENBQUMsUUFBUSxHQUFJLHdCQUF3QixDQUFDO0FBQzFDLFlBQUksQ0FBQyxrQkFBa0IsR0FBRywwQ0FBMEMsQ0FBQzs7QUFFckUsWUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQzs7O0FBRzNCLFlBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQy9CLFlBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0tBQzVCOztpQkFWZ0Isd0JBQXdCOztlQVkzQix3QkFBQyxJQUF3QixFQUFFOzs7Z0JBQXpCLE1BQU0sR0FBUCxJQUF3QixDQUF2QixNQUFNO2dCQUFFLGNBQWMsR0FBdkIsSUFBd0IsQ0FBZixjQUFjOztBQUNsQyxtQkFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQ25CLElBQUksQ0FBQyxZQUFNOztBQUVSLG9CQUFNLE1BQU0sR0FBRyxNQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdkQsb0JBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7QUFDM0Qsb0JBQU0sV0FBVyxHQUFHLCtCQUFtQixNQUFNLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3JFLG9CQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRW5CLG9CQUFJLENB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b0IsR0FBRyxJQUFJLEdBQUcsb0JBQW9CLENBQUM7cUJBQ3REOzs7QUFHRCx3QkFBSSxRQUFRLENBQUMsaUJBQWlCLEVBQUU7O0FBRTVCLCtCQUFPLENBQUMsSUFBSSxDQUFDO0FBQ1QsZ0NBQUksRUFBRSwyQkFBZSxvQkFBb0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLENBQUM7QUFDckUsdUNBQVcsRUFBRSxnQkFBZ0I7eUJBQ2hDLENBQUMsQ0FBQztxQkFDTixNQUFNO0FBQ0gsK0JBQU8sQ0FBQyxJQUFJLENBQUM7QUFDVCxnQ0FBSSxFQUFFLDJCQUFlLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNqRSx1Q0FBVyxFQUFFLGdCQUFnQjt5QkFDaEMsQ0FBQyxDQUFDO3FCQUNOO2lCQUNKO2FBQ0o7O0FBRUQsbUJBQU8sT0FBTyxDQUFDO1NBQ2xCOzs7V0EzSWdCLHdCQUF3Qjs7O3FCQUF4Qix3QkFBd0IiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzLWltcG9ydC9saWIvcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuaW1wb3J0IHtSYW5nZSwgUG9pbnR9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgICBzdGFydHNXaXRoLFxuICAgIGNhcHR1cmVkRGVwZW5kZW5jeSxcbiAgICBub3QsXG4gICAgaXNIaWRkZW5GaWxlLFxuICAgIG1hdGNoZXNOUE1OYW1pbmcsXG4gICAgZHJvcEV4dGVuc2lvbnMsXG4gICAgZ2V0UGFyZW50RGlyLFxuICAgIGdldERpckFuZEZpbGVQcmVmaXhcbn0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgKiBhcyBGdXp6eSBmcm9tICdmdXp6eSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltcG9ydENvbXBsZXRpb25Qcm92aWRlciB7XG4gICAgY29uc3RydWN0b3IocHJvamVjdERlcHMsIGZpbGVzTWFwKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3IgPSAgJy5zb3VyY2UuanMsIC5zb3VyY2UudHMnO1xuICAgICAgICB0aGlzLmRpc2FibGVGb3JTZWxlY3RvciA9ICcuc291cmNlLmpzIC5jb21tZW50LCAuc291cmNlLnRzIC5jb21tZW50JztcbiAgICAgICAgLy8gSW5jbHVkZSBhcyBoaWdoZXIgcHJpb3JpdHkgdGhhbiBkZWZhdWx0IGF1dG8gY29tcGxldGUgc3VnZ2VzdGlvbnNcbiAgICAgICAgdGhpcy5pbmNsdXNpb25Qcmlvcml0eSA9IDE7XG5cbiAgICAgICAgLy8gR2V0IHNlYXJjaCBzdHJ1Y3R1cmVzIHZpYSBEZXBlbmRlbmN5IGluamVjdGlvblxuICAgICAgICB0aGlzLnByb2plY3REZXBzID0gcHJvamVjdERlcHM7XG4gICAgICAgIHRoaXMuZmlsZXNNYXAgPSBmaWxlc01hcDtcbiAgICB9XG5cbiAgICBnZXRTdWdnZXN0aW9ucyh7ZWRpdG9yLCBidWZmZXJQb3NpdGlvbn0pIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogdGhpcyBzdHJhdGVneSB3b24ndCB3b3JrIHdoZW4gdGhlIGN1cnNvciBpcyBpbiB0aGUgbWlkZGxlXG4gICAgICAgICAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5fZ2V0UHJlZml4KGVkaXRvciwgYnVmZmVyUG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtanMtaW1wb3J0Jyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFja2FnZU5hbWUgPSBjYXB0dXJlZERlcGVuZGVuY3kocHJlZml4LCBzZXR0aW5ncy5pbXBvcnRUeXBlcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFwYWNrYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBjaGVja3MgZm9yIHBhY2thZ2VzIHN0YXJ0aW5nIHdpdGggbmFtZSAuLi8gb3IgLi9cbiAgICAgICAgICAgICAgICBpZiAoL15cXC57MSwyfVxcLy8udGVzdChwYWNrYWdlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW2lucHV0dGVkUmVsYXRpdmVQYXRoLCB0b0NvbXBsZXRlXSA9IGdldERpckFuZEZpbGVQcmVmaXgocGFja2FnZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50RGlyUGF0aCA9IGdldFBhcmVudERpcihlZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWJzb2x1dGVQYXRoID0gcGF0aC5yZXNvbHZlKGN1cnJlbnREaXJQYXRoLCBpbnB1dHRlZFJlbGF0aXZlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVhZGRpcihhYnNvbHV0ZVBhdGgsIChlcnIsIGZpbGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShbXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGNoaW5nRmlsZXMgPSBmaWxlcy5maWx0ZXIoZiA9PiBzdGFydHNXaXRoKGYsIHRvQ29tcGxldGUpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MuaGlkZGVuRmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2hpbmdGaWxlcyA9IG1hdGNoaW5nRmlsZXMuZmlsdGVyKG5vdChpc0hpZGRlbkZpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG1hdGNoaW5nRmlsZXMubWFwKGQgPT4gZHJvcEV4dGVuc2lvbnMoZCwgc2V0dGluZ3MucmVtb3ZlRXh0ZW5zaW9ucykpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHsvKiBzaGl0IGhhcHBlbnMgKi99KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoZXNOUE1OYW1pbmcocGFja2FnZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCguLi50aGlzLnByb2plY3REZXBzLnNlYXJjaChlZGl0b3IuZ2V0UGF0aCgpLCBwYWNrYWdlTmFtZSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgbGFzdCB0byBnaXZlIG1vcmUgcHJlY2VkZW5jZSB0byBwYWNrYWdlIGFuZCBsb2NhbCBmaWxlIG5hbWUgbWF0Y2hlc1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5mdXp6eS5lbmFibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCguLi50aGlzLl9maW5kSW5GaWxlcyhlZGl0b3IuZ2V0UGF0aCgpLCBwYWNrYWdlTmFtZSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGNvbXBsZXRpb25zID0+IHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBpZiBwYXJ0IG9mIHRoZSB0ZXh0IGlzIGFscmVhZHkgcHJlc2VudCB0aGVuIHJlcGxhY2UgdGhlIHRleHQgb3IgYWxpZ24gaXRcbiAgICAgICAgICAgICAgICAvLyBeIGUuZyBpbjxjdXJzb3I+PGVudGVyPmRleCB3aWxsIHJlc3VsdCBpbiBpbmRleC5qc2RleCBpbnN0ZWFkIG9mIGluZGV4LmpzXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRpb25zICYmIGNvbXBsZXRpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tcGxldGlvbnMubWFwKGMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbENvbXBsZXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltcG9ydCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsQ29tcGxldGlvbi50ZXh0ID0gYztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihmdWxsQ29tcGxldGlvbiwgYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdWxsQ29tcGxldGlvbjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSBzaGl0IGhhcHBlbnMgYW5kIEkgbmVlZCB0byBnZXQgd29yayBkb25lXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0UHJlZml4KGVkaXRvciwge3JvdywgY29sdW1ufSkge1xuICAgICAgICBjb25zdCBwcmVmaXhSYW5nZSA9IG5ldyBSYW5nZShuZXcgUG9pbnQocm93LCAwKSwgbmV3IFBvaW50KHJvdywgY29sdW1uKSk7XG5cbiAgICAgICAgcmV0dXJuIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShwcmVmaXhSYW5nZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGVkaXRvclBhdGhcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHN0cmluZ1BhdHRlcm5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IG1heFxuICAgICAqIEByZXR1cm4ge0FycmF5PE9iamVjdDx0ZXh0OiBTdHJpbmcsIGRpc3BsYXlUZXh0OiBTdHJpbmc+Pn1cbiAgICAgKi9cbiAgICBfZmluZEluRmlsZXMoZWRpdG9yUGF0aCwgc3RyaW5nUGF0dGVybiwgbWF4ID0gNikge1xuICAgICAgICBjb25zdCByb290RGlycyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpO1xuICAgICAgICBjb25zdCBjb250YWluaW5nUm9vdCA9IHJvb3REaXJzLmZpbmQoZGlyID0+IGRpci5jb250YWlucyhlZGl0b3JQYXRoKSk7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQnKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgIGlmICghY29udGFpbmluZ1Jvb3QpIHtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0RmlsZUxpc3QgPSB0aGlzLmZpbGVzTWFwLmdldChjb250YWluaW5nUm9vdC5wYXRoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldEZpbGVMaXN0Lmxlbmd0aCAmJiByZXN1bHRzLmxlbmd0aCA8IG1heDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoRnV6enkudGVzdChzdHJpbmdQYXR0ZXJuLCB0YXJnZXRGaWxlTGlzdFtpXSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb290UmVsYXRpdmVQYXRoID0gdGFyZ2V0RmlsZUxpc3RbaV07XG4gICAgICAgICAgICAgICAgbGV0IGN1cnJGaWxlUmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShcbiAgICAgICAgICAgICAgICAgICAgZ2V0UGFyZW50RGlyKGVkaXRvclBhdGgpLFxuICAgICAgICAgICAgICAgICAgICBjb250YWluaW5nUm9vdC5wYXRoICsgJy8nICsgcm9vdFJlbGF0aXZlUGF0aFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBJIGhhdmUgbm8gaWRlYSBob3cgYnVnZ3kgdGhpcyBpc1xuICAgICAgICAgICAgICAgIC8vIHBhdGgucmVsYXRpdmUgZG9lc24ndCBhZGQgYSAnLi8nIGZvciBmaWxlcyBpbiBzYW1lIGRpcmVjdG9yeVxuICAgICAgICAgICAgICAgIGlmICgvXlteLl0vLnRlc3QoY3VyckZpbGVSZWxhdGl2ZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJGaWxlUmVsYXRpdmVQYXRoID0gJy4vJyArIGN1cnJGaWxlUmVsYXRpdmVQYXRoO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFNob3cgdGhlIGZ1bGwgcGF0aCBiZWNhdXNlIGl0IGFsaWducyB3aXRoIHdoYXQgdGhlIHVzZXIgaXMgdHlwaW5nLFxuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5maWxlUmVsYXRpdmVQYXRocykge1xuICAgICAgICAgICAgICAgICAgICAvLyBqdXN0IGluc2VydCB0aGUgcGF0aCByZWxhdGl2ZSB0byB0aGUgdXNlcidzIGN1cnJlbnQgZmlsZVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogZHJvcEV4dGVuc2lvbnMoY3VyckZpbGVSZWxhdGl2ZVBhdGgsIHNldHRpbmdzLnJlbW92ZUV4dGVuc2lvbnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVRleHQ6IHJvb3RSZWxhdGl2ZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IGRyb3BFeHRlbnNpb25zKHJvb3RSZWxhdGl2ZVBhdGgsIHNldHRpbmdzLnJlbW92ZUV4dGVuc2lvbnMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVRleHQ6IHJvb3RSZWxhdGl2ZVBhdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxufVxuIl19