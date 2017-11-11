Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashIsEmpty = require('lodash/isEmpty');

var _lodashIsEmpty2 = _interopRequireDefault(_lodashIsEmpty);

var _lodashTrimStart = require('lodash/trimStart');

var _lodashTrimStart2 = _interopRequireDefault(_lodashTrimStart);

var _lodashStartsWith = require('lodash/startsWith');

var _lodashStartsWith2 = _interopRequireDefault(_lodashStartsWith);

var _lodashLast = require('lodash/last');

var _lodashLast2 = _interopRequireDefault(_lodashLast);

var _lodashSortBy = require('lodash/sortBy');

var _lodashSortBy2 = _interopRequireDefault(_lodashSortBy);

var _lodashIncludes = require('lodash/includes');

var _lodashIncludes2 = _interopRequireDefault(_lodashIncludes);

var _utils = require('./utils');

var _path = require('path');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

'use babel';

var SLASHES = /\\|\//; // slash (/) or backslash (\)

function directoryExists(path) {
  try {
    return _fs2['default'].statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

function listPaths(dir, storageType, fileExtensions) {
  return new Promise(function (resolve, reject) {
    _fs2['default'].readdir(dir, function (error, paths) {
      if (error) {
        reject(error);
      } else {
        var fileInfos = paths.map(function (path) {
          var stats = _fs2['default'].statSync(dir + _path.sep + path); // TODO is it worth asyncing?
          return {
            name: path,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory()
          };
        }).filter(function (file) {
          switch (storageType) {
            case _utils.StorageType.FILE:
              return file.isFile && (!fileExtensions || (0, _lodashIncludes2['default'])(fileExtensions, (0, _path.extname)(file.name)));
            case _utils.StorageType.FOLDER:
              return file.isDirectory;
            default:
              {
                return file.isDirectory || !fileExtensions || (0, _lodashIncludes2['default'])(fileExtensions, (0, _path.extname)(file.name));
              }
          }
        });
        resolve(fileInfos);
      }
    });
  });
}

function containerName(root, segments) {
  // Empty prefix or segments, search in the root folder.
  if ((0, _lodashIsEmpty2['default'])(segments)) {
    return root;
  }
  // Last character is some kind of slash.
  if ((0, _lodashIsEmpty2['default'])((0, _lodashLast2['default'])(segments))) {
    // this means, the last segment was (or should be) a directory.
    var path = root + _path.sep + (0, _lodashTrimStart2['default'])(segments.join(_path.sep), '/\\');
    if (directoryExists(path)) {
      return path;
    }
  } else {
    // Last segment is not a slash, meaning we don't need, what the user typed until the last slash.
    var lastIsPartialFile = root + _path.sep + (0, _lodashTrimStart2['default'])(segments.slice(0, segments.length - 1).join(_path.sep), '/\\');
    if (directoryExists(lastIsPartialFile)) {
      return lastIsPartialFile;
    }
  }
  // User wants completions for non existing directory.
  return null;
}

function prepareFiles(files, request, basePath, segments) {
  var filteredFiles = (0, _lodashIsEmpty2['default'])((0, _lodashLast2['default'])(segments)) ? files : files.filter(function (file) {
    return (0, _lodashStartsWith2['default'])(file.name, (0, _lodashLast2['default'])(segments));
  });
  return (0, _lodashSortBy2['default'])(filteredFiles, function (f) {
    return f.isDirectory ? 0 : 1;
  });
}

function createProposal(file, request, basePath, segments) {
  var proposal = {};
  var text = (function () {
    var proposalText = file.name;
    if (segments.length === 0) {
      proposalText = file.name;
    } else if ((0, _lodashLast2['default'])(segments).length === 0) {
      proposalText = segments.join('/') + file.name;
    } else {
      var withoutPartial = segments.slice(0, segments.length - 1);
      if (withoutPartial.length === 0) {
        proposalText = file.name;
      } else {
        proposalText = segments.slice(0, segments.length - 1).join('/') + '/' + file.name;
      }
    }
    return proposalText + (file.isDirectory ? '/' : '');
  })();

  proposal.replacementPrefix = request.prefix;
  proposal.displayText = file.name;
  proposal.rightLabel = file.isDirectory ? 'folder' : 'file';
  if (request.isBetweenQuotes) {
    proposal.text = text;
  } else {
    proposal.snippet = '"' + text + '$1"';
  }
  proposal.type = proposal.rightLabel;
  return proposal;
}

var FileProposalProvider = (function () {
  function FileProposalProvider(configuration) {
    _classCallCheck(this, FileProposalProvider);

    this.configuration = configuration;
  }

  _createClass(FileProposalProvider, [{
    key: 'getProposals',
    value: function getProposals(request) {
      if (!request.isBetweenQuotes || !this.configuration.getMatcher().matches(request)) {
        return Promise.resolve([]);
      }
      var dir = request.editor.getBuffer().file.getParent().path;
      var prefix = request.prefix;

      var segments = prefix.split(SLASHES);
      var searchDir = containerName(dir, segments);

      if (searchDir === null) {
        return Promise.resolve([]);
      }

      return listPaths(searchDir, this.configuration.getStorageType(), this.configuration.getFileExtensions()).then(function (results) {
        return prepareFiles(results, request, dir, segments).map(function (file) {
          return createProposal(file, request, dir, segments);
        });
      });
    }
  }, {
    key: 'getFilePattern',
    value: function getFilePattern() {
      return this.configuration.getFilePattern();
    }
  }]);

  return FileProposalProvider;
})();

exports.FileProposalProvider = FileProposalProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qc29uL3NyYy9maWxlLXByb3Bvc2FsLXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7NkJBRW9CLGdCQUFnQjs7OzsrQkFDZCxrQkFBa0I7Ozs7Z0NBQ2pCLG1CQUFtQjs7OzswQkFDekIsYUFBYTs7Ozs0QkFDWCxlQUFlOzs7OzhCQUNiLGlCQUFpQjs7OztxQkFFVixTQUFTOztvQkFDUixNQUFNOztrQkFDcEIsSUFBSTs7OztBQVhuQixXQUFXLENBQUE7O0FBYVgsSUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFBOztBQUV2QixTQUFTLGVBQWUsQ0FBQyxJQUFJLEVBQUU7QUFDN0IsTUFBSTtBQUNGLFdBQU8sZ0JBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQ3ZDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixXQUFPLEtBQUssQ0FBQTtHQUNiO0NBQ0Y7O0FBRUQsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUU7QUFDbkQsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsb0JBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFDLEtBQUssRUFBRSxLQUFLLEVBQUs7QUFDaEMsVUFBSSxLQUFLLEVBQUU7QUFDVCxjQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDZCxNQUFNO0FBQ0wsWUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNsQyxjQUFNLEtBQUssR0FBRyxnQkFBRyxRQUFRLENBQUMsR0FBRyxZQUFNLEdBQUcsSUFBSSxDQUFDLENBQUE7QUFDM0MsaUJBQU87QUFDTCxnQkFBSSxFQUFFLElBQUk7QUFDVixrQkFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUU7QUFDdEIsdUJBQVcsRUFBRSxL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LEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDakYsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQzNCO0FBQ0QsVUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFBO1VBQ3JELE1BQU0sR0FBSSxPQUFPLENBQWpCLE1BQU07O0FBQ2IsVUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUN0QyxVQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFBOztBQUU5QyxVQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7QUFDdEIsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQzNCOztBQUVELGFBQU8sU0FBUyxDQUNkLFNBQVMsRUFDVCxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxFQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQ3ZDLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTztlQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FDNUQsR0FBRyxDQUFDLFVBQUEsSUFBSTtpQkFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDO1NBQUEsQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUM5RDs7O1dBRWEsMEJBQUc7QUFDZixhQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLENBQUE7S0FDM0M7OztTQTdCVSxvQkFBb0IiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWpzb24vc3JjL2ZpbGUtcHJvcG9zYWwtcHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2gvaXNFbXB0eSdcbmltcG9ydCB0cmltU3RhcnQgZnJvbSAnbG9kYXNoL3RyaW1TdGFydCdcbmltcG9ydCBzdGFydHNXaXRoIGZyb20gJ2xvZGFzaC9zdGFydHNXaXRoJ1xuaW1wb3J0IGxhc3QgZnJvbSAnbG9kYXNoL2xhc3QnXG5pbXBvcnQgc29ydEJ5IGZyb20gJ2xvZGFzaC9zb3J0QnknXG5pbXBvcnQgaW5jbHVkZXMgZnJvbSAnbG9kYXNoL2luY2x1ZGVzJ1xuXG5pbXBvcnQgeyBTdG9yYWdlVHlwZSB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgeyBzZXAsIGV4dG5hbWUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuXG5jb25zdCBTTEFTSEVTID0gL1xcXFx8XFwvLyAvLyBzbGFzaCAoLykgb3IgYmFja3NsYXNoIChcXClcblxuZnVuY3Rpb24gZGlyZWN0b3J5RXhpc3RzKHBhdGgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZnMuc3RhdFN5bmMocGF0aCkuaXNEaXJlY3RvcnkoKVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gbGlzdFBhdGhzKGRpciwgc3RvcmFnZVR5cGUsIGZpbGVFeHRlbnNpb25zKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZnMucmVhZGRpcihkaXIsIChlcnJvciwgcGF0aHMpID0+IHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmaWxlSW5mb3MgPSBwYXRocy5tYXAocGF0aCA9PiB7XG4gICAgICAgICAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhkaXIgKyBzZXAgKyBwYXRoKSAvLyBUT0RPIGlzIGl0IHdvcnRoIGFzeW5jaW5nP1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiBwYXRoLFxuICAgICAgICAgICAgaXNGaWxlOiBzdGF0cy5pc0ZpbGUoKSxcbiAgICAgICAgICAgIGlzRGlyZWN0b3J5OiBzdGF0cy5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgfVxuICAgICAgICB9KS5maWx0ZXIoZmlsZSA9PiB7XG4gICAgICAgICAgc3dpdGNoIChzdG9yYWdlVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBTdG9yYWdlVHlwZS5GSUxFOlxuICAgICAgICAgICAgICByZXR1cm4gZmlsZS5pc0ZpbGUgJiYgKCFmaWxlRXh0ZW5zaW9ucyB8fCBpbmNsdWRlcyhmaWxlRXh0ZW5zaW9ucywgZXh0bmFtZShmaWxlLm5hbWUpKSlcbiAgICAgICAgICAgIGNhc2UgU3RvcmFnZVR5cGUuRk9MREVSOlxuICAgICAgICAgICAgICByZXR1cm4gZmlsZS5pc0RpcmVjdG9yeVxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICByZXR1cm4gZmlsZS5pc0RpcmVjdG9yeSB8fCAhZmlsZUV4dGVuc2lvbnMgfHwgaW5jbHVkZXMoZmlsZUV4dGVuc2lvbnMsIGV4dG5hbWUoZmlsZS5uYW1lKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHJlc29sdmUoZmlsZUluZm9zKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGNvbnRhaW5lck5hbWUocm9vdCwgc2VnbWVudHMpIHtcbiAgLy8gRW1wdHkgcHJlZml4IG9yIHNlZ21lbnRzLCBzZWFyY2ggaW4gdGhlIHJvb3QgZm9sZGVyLlxuICBpZiAoaXNFbXB0eShzZWdtZW50cykpIHtcbiAgICByZXR1cm4gcm9vdFxuICB9XG4gIC8vIExhc3QgY2hhcmFjdGVyIGlzIHNvbWUga2luZCBvZiBzbGFzaC5cbiAgaWYgKGlzRW1wdHkobGFzdChzZWdtZW50cykpKSB7XG4gICAgLy8gdGhpcyBtZWFucywgdGhlIGxhc3Qgc2VnbWVudCB3YXMgKG9yIHNob3VsZCBiZSkgYSBkaXJlY3RvcnkuXG4gICAgY29uc3QgcGF0aCA9IHJvb3QgKyBzZXAgKyB0cmltU3RhcnQoc2VnbWVudHMuam9pbihzZXApLCAnL1xcXFwnKVxuICAgIGlmIChkaXJlY3RvcnlFeGlzdHMocGF0aCkpIHtcbiAgICAgIHJldHVybiBwYXRoXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIExhc3Qgc2VnbWVudCBpcyBub3QgYSBzbGFzaCwgbWVhbmluZyB3ZSBkb24ndCBuZWVkLCB3aGF0IHRoZSB1c2VyIHR5cGVkIHVudGlsIHRoZSBsYXN0IHNsYXNoLlxuICAgIGNvbnN0IGxhc3RJc1BhcnRpYWxGaWxlID0gcm9vdCArIHNlcCArIHRyaW1TdGFydChzZWdtZW50cy5zbGljZSgwLCBzZWdtZW50cy5sZW5ndGggLSAxKS5qb2luKHNlcCksICcvXFxcXCcpXG4gICAgaWYgKGRpcmVjdG9yeUV4aXN0cyhsYXN0SXNQYXJ0aWFsRmlsZSkpIHtcbiAgICAgIHJldHVybiBsYXN0SXNQYXJ0aWFsRmlsZVxuICAgIH1cbiAgfVxuICAvLyBVc2VyIHdhbnRzIGNvbXBsZXRpb25zIGZvciBub24gZXhpc3RpbmcgZGlyZWN0b3J5LlxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBwcmVwYXJlRmlsZXMoZmlsZXMsIHJlcXVlc3QsIGJhc2VQYXRoLCBzZWdtZW50cykge1xuICBjb25zdCBmaWx0ZXJlZEZpbGVzID0gaXNFbXB0eShsYXN0KHNlZ21lbnRzKSlcbiAgICA/IGZpbGVzXG4gICAgOiBmaWxlcy5maWx0ZXIoZmlsZSA9PiBzdGFydHNXaXRoKGZpbGUubmFtZSwgbGFzdChzZWdtZW50cykpKVxuICByZXR1cm4gc29ydEJ5KGZpbHRlcmVkRmlsZXMsIGYgPT4gZi5pc0RpcmVjdG9yeSA/IDAgOiAxKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVQcm9wb3NhbChmaWxlLCByZXF1ZXN0LCBiYXNlUGF0aCwgc2VnbWVudHMpIHtcbiAgY29uc3QgcHJvcG9zYWwgPSB7fVxuICBjb25zdCB0ZXh0ID0gKCgpID0+IHtcbiAgICBsZXQgcHJvcG9zYWxUZXh0ID0gZmlsZS5uYW1lXG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcHJvcG9zYWxUZXh0ID0gZmlsZS5uYW1lXG4gICAgfSBlbHNlIGlmIChsYXN0KHNlZ21lbnRzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHByb3Bvc2FsVGV4dCA9IHNlZ21lbnRzLmpvaW4oJy8nKSArIGZpbGUubmFtZVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB3aXRob3V0UGFydGlhbCA9IHNlZ21lbnRzLnNsaWNlKDAsIHNlZ21lbnRzLmxlbmd0aCAtIDEpXG4gICAgICBpZiAod2l0aG91dFBhcnRpYWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHByb3Bvc2FsVGV4dCA9IGZpbGUubmFtZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvcG9zYWxUZXh0ID0gYCR7c2VnbWVudHMuc2xpY2UoMCwgc2VnbWVudHMubGVuZ3RoIC0gMSkuam9pbignLycpfS8ke2ZpbGUubmFtZX1gXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm9wb3NhbFRleHQgKyAoZmlsZS5pc0RpcmVjdG9yeSA/ICcvJyA6ICcnKVxuICB9KSgpXG5cbiAgcHJvcG9zYWwucmVwbGFjZW1lbnRQcmVmaXggPSByZXF1ZXN0LnByZWZpeFxuICBwcm9wb3NhbC5kaXNwbGF5VGV4dCA9IGZpbGUubmFtZVxuICBwcm9wb3NhbC5yaWdodExhYmVsID0gZmlsZS5pc0RpcmVjdG9yeSA/ICdmb2xkZXInIDogJ2ZpbGUnXG4gIGlmIChyZXF1ZXN0LmlzQmV0d2VlblF1b3Rlcykge1xuICAgIHByb3Bvc2FsLnRleHQgPSB0ZXh0XG4gIH0gZWxzZSB7XG4gICAgcHJvcG9zYWwuc25pcHBldCA9IGBcIiR7dGV4dH0kMVwiYFxuICB9XG4gIHByb3Bvc2FsLnR5cGUgPSBwcm9wb3NhbC5yaWdodExhYmVsXG4gIHJldHVybiBwcm9wb3NhbFxufVxuXG5leHBvcnQgY2xhc3MgRmlsZVByb3Bvc2FsUHJvdmlkZXIge1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZ3VyYXRpb24pIHtcbiAgICB0aGlzLmNvbmZpZ3VyYXRpb24gPSBjb25maWd1cmF0aW9uXG4gIH1cblxuICBnZXRQcm9wb3NhbHMocmVxdWVzdCkge1xuICAgIGlmICghcmVxdWVzdC5pc0JldHdlZW5RdW90ZXMgfHwgIXRoaXMuY29uZmlndXJhdGlvbi5nZXRNYXRjaGVyKCkubWF0Y2hlcyhyZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSlcbiAgICB9XG4gICAgY29uc3QgZGlyID0gcmVxdWVzdC5lZGl0b3IuZ2V0QnVmZmVyKCkuZmlsZS5nZXRQYXJlbnQoKS5wYXRoXG4gICAgY29uc3Qge3ByZWZpeH0gPSByZXF1ZXN0XG4gICAgY29uc3Qgc2VnbWVudHMgPSBwcmVmaXguc3BsaXQoU0xBU0hFUylcbiAgICBjb25zdCBzZWFyY2hEaXIgPSBjb250YWluZXJOYW1lKGRpciwgc2VnbWVudHMpXG5cbiAgICBpZiAoc2VhcmNoRGlyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKVxuICAgIH1cblxuICAgIHJldHVybiBsaXN0UGF0aHMoXG4gICAgICBzZWFyY2hEaXIsXG4gICAgICB0aGlzLmNvbmZpZ3VyYXRpb24uZ2V0U3RvcmFnZVR5cGUoKSxcbiAgICAgIHRoaXMuY29uZmlndXJhdGlvbi5nZXRGaWxlRXh0ZW5zaW9ucygpXG4gICAgKS50aGVuKHJlc3VsdHMgPT4gcHJlcGFyZUZpbGVzKHJlc3VsdHMsIHJlcXVlc3QsIGRpciwgc2VnbWVudHMpXG4gICAgICAubWFwKGZpbGUgPT4gY3JlYXRlUHJvcG9zYWwoZmlsZSwgcmVxdWVzdCwgZGlyLCBzZWdtZW50cykpKVxuICB9XG5cbiAgZ2V0RmlsZVBhdHRlcm4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvbi5nZXRGaWxlUGF0dGVybigpXG4gIH1cbn1cbiJdfQ==