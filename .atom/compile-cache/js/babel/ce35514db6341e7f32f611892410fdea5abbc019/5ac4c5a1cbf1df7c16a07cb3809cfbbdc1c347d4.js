'use babel';

// These only match prefixes
Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.capturedDependency = capturedDependency;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.not = not;
exports.matchesNPMNaming = matchesNPMNaming;
exports.dropExtensions = dropExtensions;
exports.getDirAndFilePrefix = getDirAndFilePrefix;
exports.getParentDir = getParentDir;
exports.isHiddenFile = isHiddenFile;
var REQUIRE_REGEX = /require\(["']([^"']+)$/;
var ES6_REGEX = /(?:^import .*?|^}) from ["']([^"']+)$/;

function capturedDependency(prefix, importTypes) {
    var results = null;

    if (importTypes.es6) {
        results = ES6_REGEX.exec(prefix);
    }

    if (!results && importTypes.require) {
        results = REQUIRE_REGEX.exec(prefix);
    }

    if (results && results.length) {
        return results[1];
    }

    return null;
}

// Taken from MDN
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function startsWith(base, keyword) {
    var keywordRegex = new RegExp('^' + escapeRegex(keyword));

    return keywordRegex.test(base);
}

function endsWith(base, keyword) {
    var keywordRegex = new RegExp(escapeRegex(keyword) + '$');

    return keywordRegex.test(base);
}

/**
 * Returns a function that returns the logical negation of the given function's output
 */

function not(func) {
    return function () {
        return !func.apply(undefined, arguments);
    };
}

// Used to check if a given string matches the constraints of NPM naming
// Algo basically taken from https://docs.npmjs.com/files/package.json

function matchesNPMNaming(prefix) {
    if (encodeURIComponent(prefix) !== prefix) {
        return false;
    }

    // I don't check for capital letters so that I can still match even if user puts caps for some reason
    return (/^[^._]/.test(prefix)
    );
}

function dropExtensions(fileName, extensions) {
    for (var i = 0; i < extensions.length; i++) {
        var ext = extensions[i];

        if (endsWith(fileName, ext)) {
            fileName = fileName.substring(0, fileName.length - ext.length);

            break;
        }
    }

    return fileName;
}

function getDirAndFilePrefix(filePath) {
    var pathParts = filePath.split('/');
    var toComplete = pathParts.pop();

    return [pathParts.join('/'), toComplete];
}

function getParentDir(filePath) {
    return getDirAndFilePrefix(filePath)[0];
}

function isHiddenFile(fileName) {
    return startsWith(fileName, '.');
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBR1osSUFBTSxhQUFhLEdBQUcsd0JBQXdCLENBQUM7QUFDL0MsSUFBTSxTQUFTLEdBQUcsdUNBQXVDLENBQUM7O0FBRW5ELFNBQVMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRTtBQUNwRCxRQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7O0FBRW5CLFFBQUksV0FBVyxDQUFDLEdBQUcsRUFBRTtBQUNqQixlQUFPLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNwQzs7QUFFRCxRQUFJLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUU7QUFDakMsZUFBTyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEM7O0FBRUQsUUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUMzQixlQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyQjs7QUFFRCxXQUFPLElBQUksQ0FBQztDQUNmOzs7QUFHRCxTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7QUFDdEIsV0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ3JEOztBQUVNLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDdEMsUUFBTSxZQUFZLEdBQUcsSUFBSSxNQUFNLE9BQUssV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFHLENBQUM7O0FBRTVELFdBQU8sWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNsQzs7QUFFTSxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3BDLFFBQU0sWUFBWSxHQUFHLElBQUksTUFBTSxDQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBSSxDQUFDOztBQUU1RCxXQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEM7Ozs7OztBQUtNLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRTtBQUN0QixXQUFPLFlBQVc7QUFDZCxlQUFPLENBQUMsSUFBSSxrQkFBSSxTQUFTLENBQUMsQ0FBQztLQUM5QixDQUFDO0NBQ0w7Ozs7O0FBSU0sU0FBUyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7QUFDckMsUUFBSSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsS0FBSyxNQUFNLEVBQUU7QUFDdkMsZUFBTyxLQUFLLENBQUM7S0FDaEI7OztBQUdELFdBQU8sU0FBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7TUFBQztDQUNoQzs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFO0FBQ2pELFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hDLFlBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFeEIsWUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLG9CQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRS9ELGtCQUFNO1NBQ1Q7S0FDSjs7QUFFRCxXQUFPLFFBQVEsQ0FBQztDQUNuQjs7QUFFTSxTQUFTLG1CQUFtQixDQUFDLFFBQVEsRUFBRTtBQUMxQyxRQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFFBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFbkMsV0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDNUM7O0FBRU0sU0FBUyxZQUFZLENBQUMsUUFBUSxFQUFFO0FBQ25DLFdBQU8sbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0M7O0FBRU0sU0FBUyxZQUFZLENBQUMsUUFBUSxFQUFFO0FBQ25DLFdBQU8sVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUNwQyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi91dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG4vLyBUaGVzZSBvbmx5IG1hdGNoIHByZWZpeGVzXG5jb25zdCBSRVFVSVJFX1JFR0VYID0gL3JlcXVpcmVcXChbXCInXShbXlwiJ10rKSQvO1xuY29uc3QgRVM2X1JFR0VYID0gLyg/Ol5pbXBvcnQgLio/fF59KSBmcm9tIFtcIiddKFteXCInXSspJC87XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlZERlcGVuZGVuY3kocHJlZml4LCBpbXBvcnRUeXBlcykge1xuICAgIGxldCByZXN1bHRzID0gbnVsbDtcblxuICAgIGlmIChpbXBvcnRUeXBlcy5lczYpIHtcbiAgICAgICAgcmVzdWx0cyA9IEVTNl9SRUdFWC5leGVjKHByZWZpeCk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bHRzICYmIGltcG9ydFR5cGVzLnJlcXVpcmUpIHtcbiAgICAgICAgcmVzdWx0cyA9IFJFUVVJUkVfUkVHRVguZXhlYyhwcmVmaXgpO1xuICAgIH1cblxuICAgIGlmIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiByZXN1bHRzWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG4vLyBUYWtlbiBmcm9tIE1ETlxuZnVuY3Rpb24gZXNjYXBlUmVnZXgoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7IC8vICQmIG1lYW5zIHRoZSB3aG9sZSBtYXRjaGVkIHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aChiYXNlLCBrZXl3b3JkKSB7XG4gICAgY29uc3Qga2V5d29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChgXiR7ZXNjYXBlUmVnZXgoa2V5d29yZCl9YCk7XG5cbiAgICByZXR1cm4ga2V5d29yZFJlZ2V4LnRlc3QoYmFzZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmRzV2l0aChiYXNlLCBrZXl3b3JkKSB7XG4gICAgY29uc3Qga2V5d29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChgJHtlc2NhcGVSZWdleChrZXl3b3JkKX0kYCk7XG5cbiAgICByZXR1cm4ga2V5d29yZFJlZ2V4LnRlc3QoYmFzZSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbG9naWNhbCBuZWdhdGlvbiBvZiB0aGUgZ2l2ZW4gZnVuY3Rpb24ncyBvdXRwdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vdChmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gIWZ1bmMoLi4uYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vLyBVc2VkIHRvIGNoZWNrIGlmIGEgZ2l2ZW4gc3RyaW5nIG1hdGNoZXMgdGhlIGNvbnN0cmFpbnRzIG9mIE5QTSBuYW1pbmdcbi8vIEFsZ28gYmFzaWNhbGx5IHRha2VuIGZyb20gaHR0cHM6Ly9kb2NzLm5wbWpzLmNvbS9maWxlcy9wYWNrYWdlLmpzb25cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaGVzTlBNTmFtaW5nKHByZWZpeCkge1xuICAgIGlmIChlbmNvZGVVUklDb21wb25lbnQocHJlZml4KSAhPT0gcHJlZml4KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJIGRvbid0IGNoZWNrIGZvciBjYXBpdGFsIGxldHRlcnMgc28gdGhhdCBJIGNhbiBzdGlsbCBtYXRjaCBldmVuIGlmIHVzZXIgcHV0cyBjYXBzIGZvciBzb21lIHJlYXNvblxuICAgIHJldHVybiAvXlteLl9dLy50ZXN0KHByZWZpeCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wRXh0ZW5zaW9ucyhmaWxlTmFtZSwgZXh0ZW5zaW9ucykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXh0ZW5zaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgZXh0ID0gZXh0ZW5zaW9uc1tpXTtcblxuICAgICAgICBpZiAoZW5kc1dpdGgoZmlsZU5hbWUsIGV4dCkpIHtcbiAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZU5hbWUuc3Vic3RyaW5nKDAsIGZpbGVOYW1lLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmaWxlTmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERpckFuZEZpbGVQcmVmaXgoZmlsZVBhdGgpIHtcbiAgICBjb25zdCBwYXRoUGFydHMgPSBmaWxlUGF0aC5zcGxpdCgnLycpO1xuICAgIGNvbnN0IHRvQ29tcGxldGUgPSBwYXRoUGFydHMucG9wKCk7XG5cbiAgICByZXR1cm4gW3BhdGhQYXJ0cy5qb2luKCcvJyksIHRvQ29tcGxldGVdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGFyZW50RGlyKGZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIGdldERpckFuZEZpbGVQcmVmaXgoZmlsZVBhdGgpWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNIaWRkZW5GaWxlKGZpbGVOYW1lKSB7XG4gICAgcmV0dXJuIHN0YXJ0c1dpdGgoZmlsZU5hbWUsICcuJyk7XG59XG4iXX0=