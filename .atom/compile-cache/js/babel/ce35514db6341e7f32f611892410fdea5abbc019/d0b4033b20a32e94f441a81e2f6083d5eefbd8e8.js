Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/** @babel */

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var Searcher = (function () {
  function Searcher() {
    _classCallCheck(this, Searcher);
  }

  _createClass(Searcher, null, [{
    key: 'transformUnsavedMatch',
    value: function transformUnsavedMatch(match) {
      var allLines = match.match.input.split(/\r\n|\r|\n/);
      var lines = match.match.input.substring(0, match.match.index + 1).split(/\r\n|\r|\n/);
      var lineNumber = lines.length - 1;

      return {
        text: allLines[lineNumber],
        line: lineNumber,
        column: lines.pop().length
      };
    }
  }, {
    key: 'filterMatch',
    value: function filterMatch(match) {
      return match !== null && match.text.trim().length < 350;
    }
  }, {
    key: 'fixColumn',
    value: function fixColumn(match) {
      if (match.column === 1 && /^\s/.test(match.text) === false) {
        // ripgrep's bug
        match.column = 0;
      }

      var emptyChars = '';

      var matches = /^[\s.]/.exec(match.text.substring(match.column));
      if (matches) emptyChars = matches[0];

      return {
        text: match.text,
        fileName: match.fileName,
        line: match.line,
        column: match.column + emptyChars.length
      };
    }
  }, {
    key: 'atomBufferScan',
    value: function atomBufferScan(activeEditor, fileTypes, regex, iterator, callback) {
      // atomBufferScan just search opened files
      var editors = atom.workspace.getTextEditors().filter(function (x) {
        return !Object.is(activeEditor, x);
      });
      editors.unshift(activeEditor);
      callback(editors.map(function (editor) {
        var filePath = editor.getPath();
        if (filePath) {
          var fileExtension = '*.' + filePath.split('.').pop();
          if (fileTypes.includes(fileExtension)) {
            editor.scan(new RegExp(regex, 'ig'), function (match) {
              var item = Searcher.transformUnsavedMatch(match);
              item.fileName = filePath;
              iterator([Searcher.fixColumn(item)].filter(Searcher.filterMatch));
            });
          }
          return filePath;
        }
        return null;
      }).filter(function (x) {
        return x !== null;
      }));
    }
  }, {
    key: 'atomWorkspaceScan',
    value: function atomWorkspaceScan(activeEditor, scanPaths, fileTypes, regex, iterator, callback) {
      this.atomBufferScan(activeEditor, fileTypes, regex, iterator, function (openedFiles) {
        atom.workspace.scan(new RegExp(regex, 'ig'), { paths: fileTypes }, function (result) {
          if (openedFiles.includes(result.filePath)) {
            return null; // atom.workspace.scan can't set exclusions
          }
          iterator(result.matches.map(function (match) {
            return {
              text: match.lineText,
              fileName: result.filePath,
              line: match.range[0][0],
              column: match.range[0][1]
            };
          }).filter(Searcher.filterMatch).map(Searcher.fixColumn));
          return null;
        }).then(callback);
      });
    }
  }, {
    key: 'ripgrepScan',
    value: function ripgrepScan(activeEditor, scanPaths, fileTypes, regex, iterator, callback) {
      this.atomBufferScan(activeEditor, fileTypes, regex, iterator, function (openedFiles) {
        var args = fileTypes.map(function (x) {
          return '--glob=' + x;
        });
        args.push.apply(args, _toConsumableArray(openedFiles.map(function (x) {
          return '--glob=!' + x;
        })));
        args.push.apply(args, ['--line-number', '--column', '--no-ignore-vcs', '--ignore-case', regex]);
        args.push.apply(args, _toConsumableArray(scanPaths));

        var runRipgrep = _child_process2['default'].spawn('rg', args);

        runRipgrep.stdout.setEncoding('utf8');
        runRipgrep.stderr.setEncoding('utf8');

        runRipgrep.stdout.on('data', function (results) {
          iterator(results.split('\n').map(function (result) {
            if (result.trim().length) {
              var data = result.split(':');
              // Windows filepath will become ['C','Windows/blah'], so this fixes it.
              if (data[0].length === 1) {
                var driveLetter = data.shift();
                var path = data.shift();
                data.unshift(driveLetter + ':' + path);
              }
              return {
                text: result.substring([data[0], data[1], data[2]].join(':').length + 1),
                fileName: data[0],
                line: Number(data[1] - 1),
                column: Number(data[2])
              };
            }
            return null;
          }).filter(Searcher.filterMatch).map(Searcher.fixColumn));
        });

        runRipgrep.stderr.on('data', function (message) {
          if (message.includes('No files were searched')) {
            return null;
          }
          throw message;
        });

        runRipgrep.on('close', callback);

        runRipgrep.on('error', function (error) {
          if (error.code === 'ENOENT') {
            atom.notifications.addWarning('Plase install `ripgrep` first.');
          } else {
            throw error;
          }
        });

        setTimeout(runRipgrep.kill.bind(runRipgrep), 10 * 1000);
      });
    }
  }]);

  return Searcher;
})();

exports['default'] = Searcher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvc2VhcmNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NkJBRXlCLGVBQWU7Ozs7SUFFbkIsUUFBUTtXQUFSLFFBQVE7MEJBQVIsUUFBUTs7O2VBQVIsUUFBUTs7V0FFQywrQkFBQyxLQUFLLEVBQUU7QUFDbEMsVUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZELFVBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hGLFVBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUVwQyxhQUFPO0FBQ0wsWUFBSSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUM7QUFDMUIsWUFBSSxFQUFFLFVBQVU7QUFDaEIsY0FBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNO09BQzNCLENBQUM7S0FDSDs7O1dBRWlCLHFCQUFDLEtBQUssRUFBRTtBQUN4QixhQUFRLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFFO0tBQzNEOzs7V0FFZSxtQkFBQyxLQUFLLEVBQUU7QUFDdEIsVUFBSSxBQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQUFBQyxFQUFFOztBQUM5RCxhQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztPQUNsQjs7QUFFRCxVQUFJ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LFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzFELENBQUMsQ0FBQzs7QUFFSCxrQkFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsT0FBTyxFQUFLO0FBQ3hDLGNBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO0FBQzlDLG1CQUFPLElBQUksQ0FBQztXQUNiO0FBQ0QsZ0JBQU0sT0FBTyxDQUFDO1NBQ2YsQ0FBQyxDQUFDOztBQUVILGtCQUFVLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFakMsa0JBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ2hDLGNBQUksS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDM0IsZ0JBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7V0FDakUsTUFBTTtBQUNMLGtCQUFNLEtBQUssQ0FBQztXQUNiO1NBQ0YsQ0FBQyxDQUFDOztBQUVILGtCQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO09BQ3pELENBQUMsQ0FBQztLQUNKOzs7U0FqSWtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvc2VhcmNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiogQGJhYmVsICovXG5cbmltcG9ydCBDaGlsZFByb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlYXJjaGVyIHtcblxuICBzdGF0aWMgdHJhbnNmb3JtVW5zYXZlZE1hdGNoKG1hdGNoKSB7XG4gICAgY29uc3QgYWxsTGluZXMgPSBtYXRjaC5tYXRjaC5pbnB1dC5zcGxpdCgvXFxyXFxufFxccnxcXG4vKTtcbiAgICBjb25zdCBsaW5lcyA9IG1hdGNoLm1hdGNoLmlucHV0LnN1YnN0cmluZygwLCBtYXRjaC5tYXRjaC5pbmRleCArIDEpLnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pO1xuICAgIGNvbnN0IGxpbmVOdW1iZXIgPSBsaW5lcy5sZW5ndGggLSAxO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IGFsbExpbmVzW2xpbmVOdW1iZXJdLFxuICAgICAgbGluZTogbGluZU51bWJlcixcbiAgICAgIGNvbHVtbjogbGluZXMucG9wKCkubGVuZ3RoLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZmlsdGVyTWF0Y2gobWF0Y2gpIHtcbiAgICByZXR1cm4gKG1hdGNoICE9PSBudWxsICYmIG1hdGNoLnRleHQudHJpbSgpLmxlbmd0aCA8IDM1MCk7XG4gIH1cblxuICBzdGF0aWMgZml4Q29sdW1uKG1hdGNoKSB7XG4gICAgaWYgKChtYXRjaC5jb2x1bW4gPT09IDEpICYmICgvXlxccy8udGVzdChtYXRjaC50ZXh0KSA9PT0gZmFsc2UpKSB7IC8vIHJpcGdyZXAncyBidWdcbiAgICAgIG1hdGNoLmNvbHVtbiA9IDA7XG4gICAgfVxuXG4gICAgbGV0IGVtcHR5Q2hhcnMgPSAnJztcblxuICAgIGNvbnN0IG1hdGNoZXMgPSAvXltcXHMuXS8uZXhlYyhtYXRjaC50ZXh0LnN1YnN0cmluZyhtYXRjaC5jb2x1bW4pKTtcbiAgICBpZiAobWF0Y2hlcykgZW1wdHlDaGFycyA9IG1hdGNoZXNbMF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogbWF0Y2gudGV4dCxcbiAgICAgIGZpbGVOYW1lOiBtYXRjaC5maWxlTmFtZSxcbiAgICAgIGxpbmU6IG1hdGNoLmxpbmUsXG4gICAgICBjb2x1bW46IG1hdGNoLmNvbHVtbiArIGVtcHR5Q2hhcnMubGVuZ3RoLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgYXRvbUJ1ZmZlclNjYW4oYWN0aXZlRWRpdG9yLCBmaWxlVHlwZXMsIHJlZ2V4LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAvLyBhdG9tQnVmZmVyU2NhbiBqdXN0IHNlYXJjaCBvcGVuZWQgZmlsZXNcbiAgICBjb25zdCBlZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5maWx0ZXIoeCA9PiAhT2JqZWN0LmlzKGFjdGl2ZUVkaXRvciwgeCkpO1xuICAgIGVkaXRvcnMudW5zaGlmdChhY3RpdmVFZGl0b3IpO1xuICAgIGNhbGxiYWNrKGVkaXRvcnMubWFwKChlZGl0b3IpID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gYCouJHtmaWxlUGF0aC5zcGxpdCgnLicpLnBvcCgpfWA7XG4gICAgICAgIGlmIChmaWxlVHlwZXMuaW5jbHVkZXMoZmlsZUV4dGVuc2lvbikpIHtcbiAgICAgICAgICBlZGl0b3Iuc2NhbihuZXcgUmVnRXhwKHJlZ2V4LCAnaWcnKSwgKG1hdGNoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gU2VhcmNoZXIudHJhbnNmb3JtVW5zYXZlZE1hdGNoKG1hdGNoKTtcbiAgICAgICAgICAgIGl0ZW0uZmlsZU5hbWUgPSBmaWxlUGF0aDtcbiAgICAgICAgICAgIGl0ZXJhdG9yKFtTZWFyY2hlci5maXhDb2x1bW4oaXRlbSldLmZpbHRlcihTZWFyY2hlci5maWx0ZXJNYXRjaCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWxlUGF0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pLmZpbHRlcih4ID0+IHggIT09IG51bGwpKTtcbiAgfVxuXG4gIHN0YXRpYyBhdG9tV29ya3NwYWNlU2NhbihhY3RpdmVFZGl0b3IsIHNjYW5QYXRocywgZmlsZVR5cGVzLCByZWdleCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5hdG9tQnVmZmVyU2NhbihhY3RpdmVFZGl0b3IsIGZpbGVUeXBlcywgcmVnZXgsIGl0ZXJhdG9yLCAob3BlbmVkRmlsZXMpID0+IHtcbiAgICAgIGF0b20ud29ya3NwYWNlLnNjYW4obmV3IFJlZ0V4cChyZWdleCwgJ2lnJyksIHsgcGF0aHM6IGZpbGVUeXBlcyB9LCAocmVzdWx0KSA9PiB7XG4gICAgICAgIGlmIChvcGVuZWRGaWxlcy5pbmNsdWRlcyhyZXN1bHQuZmlsZVBhdGgpKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7IC8vIGF0b20ud29ya3NwYWNlLnNjYW4gY2FuJ3Qgc2V0IGV4Y2x1c2lvbnNcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRvcihyZXN1bHQubWF0Y2hlcy5tYXAobWF0Y2ggPT4gKHtcbiAgICAgICAgICB0ZXh0OiBtYXRjaC5saW5lVGV4dCxcbiAgICAgICAgICBmaWxlTmFtZTogcmVzdWx0LmZpbGVQYXRoLFxuICAgICAgICAgIGxpbmU6IG1hdGNoLnJhbmdlWzBdWzBdLFxuICAgICAgICAgIGNvbHVtbjogbWF0Y2gucmFuZ2VbMF1bMV0sXG4gICAgICAgIH0pKS5maWx0ZXIoU2VhcmNoZXIuZmlsdGVyTWF0Y2gpLm1hcChTZWFyY2hlci5maXhDb2x1bW4pKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9KS50aGVuKGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgc3RhdGljIHJpcGdyZXBTY2FuKGFjdGl2ZUVkaXRvciwgc2NhblBhdGhzLCBmaWxlVHlwZXMsIHJlZ2V4LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICB0aGlzLmF0b21CdWZmZXJTY2FuKGFjdGl2ZUVkaXRvciwgZmlsZVR5cGVzLCByZWdleCwgaXRlcmF0b3IsIChvcGVuZWRGaWxlcykgPT4ge1xuICAgICAgY29uc3QgYXJncyA9IGZpbGVUeXBlcy5tYXAoeCA9PiBgLS1nbG9iPSR7eH1gKTtcbiAgICAgIGFyZ3MucHVzaCguLi5vcGVuZWRGaWxlcy5tYXAoeCA9PiBgLS1nbG9iPSEke3h9YCkpO1xuICAgICAgYXJncy5wdXNoKC4uLltcbiAgICAgICAgJy0tbGluZS1udW1iZXInLCAnLS1jb2x1bW4nLCAnLS1uby1pZ25vcmUtdmNzJywgJy0taWdub3JlLWNhc2UnLCByZWdleCxcbiAgICAgIF0pO1xuICAgICAgYXJncy5wdXNoKC4uLnNjYW5QYXRocyk7XG5cbiAgICAgIGNvbnN0IHJ1blJpcGdyZXAgPSBDaGlsZFByb2Nlc3Muc3Bhd24oJ3JnJywgYXJncyk7XG5cbiAgICAgIHJ1blJpcGdyZXAuc3Rkb3V0LnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICBydW5SaXBncmVwLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuXG4gICAgICBydW5SaXBncmVwLnN0ZG91dC5vbignZGF0YScsIChyZXN1bHRzKSA9PiB7XG4gICAgICAgIGl0ZXJhdG9yKHJlc3VsdHMuc3BsaXQoJ1xcbicpLm1hcCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc3VsdC50cmltKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVzdWx0LnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICAvLyBXaW5kb3dzIGZpbGVwYXRoIHdpbGwgYmVjb21lIFsnQycsJ1dpbmRvd3MvYmxhaCddLCBzbyB0aGlzIGZpeGVzIGl0LlxuICAgICAgICAgICAgaWYgKGRhdGFbMF0ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRyaXZlTGV0dGVyID0gZGF0YS5zaGlmdCgpO1xuICAgICAgICAgICAgICBjb25zdCBwYXRoID0gZGF0YS5zaGlmdCgpO1xuICAgICAgICAgICAgICBkYXRhLnVuc2hpZnQoYCR7ZHJpdmVMZXR0ZXJ9OiR7cGF0aH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHRleHQ6IHJlc3VsdC5zdWJzdHJpbmcoW2RhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl1dLmpvaW4oJzonKS5sZW5ndGggKyAxKSxcbiAgICAgICAgICAgICAgZmlsZU5hbWU6IGRhdGFbMF0sXG4gICAgICAgICAgICAgIGxpbmU6IE51bWJlcihkYXRhWzFdIC0gMSksXG4gICAgICAgICAgICAgIGNvbHVtbjogTnVtYmVyKGRhdGFbMl0pLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pLmZpbHRlcihTZWFyY2hlci5maWx0ZXJNYXRjaCkubWFwKFNlYXJjaGVyLmZpeENvbHVtbikpO1xuICAgICAgfSk7XG5cbiAgICAgIHJ1blJpcGdyZXAuc3RkZXJyLm9uKCdkYXRhJywgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuaW5jbHVkZXMoJ05vIGZpbGVzIHdlcmUgc2VhcmNoZWQnKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG1lc3NhZ2U7XG4gICAgICB9KTtcblxuICAgICAgcnVuUmlwZ3JlcC5vbignY2xvc2UnLCBjYWxsYmFjayk7XG5cbiAgICAgIHJ1blJpcGdyZXAub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChlcnJvci5jb2RlID09PSAnRU5PRU5UJykge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdQbGFzZSBpbnN0YWxsIGByaXBncmVwYCBmaXJzdC4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNldFRpbWVvdXQocnVuUmlwZ3JlcC5raWxsLmJpbmQocnVuUmlwZ3JlcCksIDEwICogMTAwMCk7XG4gICAgfSk7XG4gIH1cblxufVxuIl19