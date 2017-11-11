(function() {
  var fs, log, os, path,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  os = require('os');

  path = require('path');

  log = require('./log');

  module.exports = {
    pythonExecutableRe: function() {
      if (/^win/.test(process.platform)) {
        return /^python(\d+(.\d+)?)?\.exe$/;
      } else {
        return /^python(\d+(.\d+)?)?$/;
      }
    },
    possibleGlobalPythonPaths: function() {
      if (/^win/.test(process.platform)) {
        return ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python3.5', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5', (os.homedir()) + "\\AppData\\Local\\Programs\\Python\\Python35-32"];
      } else {
        return ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
      }
    },
    readDir: function(dirPath) {
      try {
        return fs.readdirSync(dirPath);
      } catch (error) {
        return [];
      }
    },
    isBinary: function(filePath) {
      try {
        fs.accessSync(filePath, fs.X_OK);
        return true;
      } catch (error) {
        return false;
      }
    },
    lookupInterpreters: function(dirPath) {
      var f, fileName, files, interpreters, j, len, matches, potentialInterpreter;
      interpreters = new Set();
      files = this.readDir(dirPath);
      matches = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = files.length; j < len; j++) {
          f = files[j];
          if (this.pythonExecutableRe().test(f)) {
            results.push(f);
          }
        }
        return results;
      }).call(this);
      for (j = 0, len = matches.length; j < len; j++) {
        fileName = matches[j];
        potentialInterpreter = path.join(dirPath, fileName);
        if (this.isBinary(potentialInterpreter)) {
          interpreters.add(potentialInterpreter);
        }
      }
      return interpreters;
    },
    applySubstitutions: function(paths) {
      var j, k, len, len1, modPaths, p, project, projectName, ref, ref1;
      modPaths = [];
      for (j = 0, len = paths.length; j < len; j++) {
        p = paths[j];
        if (/\$PROJECT/.test(p)) {
          ref = atom.project.getPaths();
          for (k = 0, len1 = ref.length; k < len1; k++) {
            project = ref[k];
            ref1 = project.split(path.sep), projectName = ref1[ref1.length - 1];
            p = p.replace(/\$PROJECT_NAME/i, projectName);
            p = p.replace(/\$PROJECT/i, project);
            if (indexOf.call(modPaths, p) < 0) {
              modPaths.push(p);
            }
          }
        } else {
          modPaths.push(p);
        }
      }
      return modPaths;
    },
    getInterpreter: function() {
      var envPath, f, interpreters, j, k, len, len1, p, project, ref, ref1, userDefinedPythonPaths;
      userDefinedPythonPaths = this.applySubstitutions(atom.config.get('autocomplete-python.pythonPaths').split(';'));
      interpreters = new Set((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = userDefinedPythonPaths.length; j < len; j++) {
          p = userDefinedPythonPaths[j];
          if (this.isBinary(p)) {
            results.push(p);
          }
        }
        return results;
      }).call(this));
      if (interpreters.size > 0) {
        log.debug('User defined interpreters found', interpreters);
        return interpreters.keys().next().value;
      }
      log.debug('No user defined interpreter found, trying automatic lookup');
      interpreters = new Set();
      ref = atom.project.getPaths();
      for (j = 0, len = ref.length; j < len; j++) {
        project = ref[j];
        ref1 = this.readDir(project);
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          f = ref1[k];
          this.lookupInterpreters(path.join(project, f, 'bin')).forEach(function(i) {
            return interpreters.add(i);
          });
        }
      }
      log.debug('Project level interpreters found', interpreters);
      envPath = (process.env.PATH || '').split(path.delimiter);
      envPath = new Set(envPath.concat(this.possibleGlobalPythonPaths()));
      envPath.forEach((function(_this) {
        return function(potentialPath) {
          return _this.lookupInterpreters(potentialPath).forEach(function(i) {
            return interpreters.add(i);
          });
        };
      })(this));
      log.debug('Total automatically found interpreters', interpreters);
      if (interpreters.size > 0) {
        return interpreters.keys().next().value;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvaW50ZXJwcmV0ZXJzLWxvb2t1cC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlCQUFBO0lBQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUVOLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxrQkFBQSxFQUFvQixTQUFBO01BQ2xCLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsUUFBcEIsQ0FBSDtBQUNFLGVBQU8sNkJBRFQ7T0FBQSxNQUFBO0FBR0UsZUFBTyx3QkFIVDs7SUFEa0IsQ0FBcEI7SUFNQSx5QkFBQSxFQUEyQixTQUFBO01BQ3pCLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFPLENBQUMsUUFBcEIsQ0FBSDtBQUNFLGVBQU8sQ0FDTCxlQURLLEVBRUwsZUFGSyxFQUdMLGVBSEssRUFJTCxxQ0FKSyxFQUtMLHFDQUxLLEVBTUwscUNBTkssRUFPTCxxQ0FQSyxFQVFMLHFDQVJLLEVBU0wscUNBVEssRUFVTCwrQkFWSyxFQVdMLCtCQVhLLEVBWUwsK0JBWkssRUFhSCxDQUFDLEVBQUUsQ0FBQyxPQUFILENBQUEsQ0FBRCxDQUFBLEdBQWMsaURBYlgsRUFEVDtPQUFBLE1BQUE7QUFpQkUsZUFBTyxDQUFDLGdCQUFELEVBQW1CLFVBQW5CLEVBQStCLE1BQS9CLEVBQXVDLFdBQXZDLEVBQW9ELE9BQXBELEVBakJUOztJQUR5QixDQU4zQjtJQTBCQSxPQUFBLEVBQVMsU0FBQyxPQUFEO0FBQ1A7QUFDRSxlQUFPLEVBQUUsQ0FBQyxXQUFILENBQWUsT0FBZixFQURUO09B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K0IsSUFBSSxDQUFDLFNBQXBDO01BQ1YsT0FBQSxHQUFjLElBQUEsR0FBQSxDQUFJLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLHlCQUFELENBQUEsQ0FBZixDQUFKO01BQ2QsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLGFBQUQ7aUJBQ2QsS0FBQyxDQUFBLGtCQUFELENBQW9CLGFBQXBCLENBQWtDLENBQUMsT0FBbkMsQ0FBMkMsU0FBQyxDQUFEO21CQUN6QyxZQUFZLENBQUMsR0FBYixDQUFpQixDQUFqQjtVQUR5QyxDQUEzQztRQURjO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQjtNQUdBLEdBQUcsQ0FBQyxLQUFKLENBQVUsd0NBQVYsRUFBb0QsWUFBcEQ7TUFFQSxJQUFHLFlBQVksQ0FBQyxJQUFiLEdBQW9CLENBQXZCO0FBQ0UsZUFBTyxZQUFZLENBQUMsSUFBYixDQUFBLENBQW1CLENBQUMsSUFBcEIsQ0FBQSxDQUEwQixDQUFDLE1BRHBDOztJQXZCYyxDQS9EaEI7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJmcyA9IHJlcXVpcmUgJ2ZzJ1xub3MgPSByZXF1aXJlICdvcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xubG9nID0gcmVxdWlyZSAnLi9sb2cnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgcHl0aG9uRXhlY3V0YWJsZVJlOiAtPlxuICAgIGlmIC9ed2luLy50ZXN0IHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHJldHVybiAvXnB5dGhvbihcXGQrKC5cXGQrKT8pP1xcLmV4ZSQvXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIC9ecHl0aG9uKFxcZCsoLlxcZCspPyk/JC9cblxuICBwb3NzaWJsZUdsb2JhbFB5dGhvblBhdGhzOiAtPlxuICAgIGlmIC9ed2luLy50ZXN0IHByb2Nlc3MucGxhdGZvcm1cbiAgICAgIHJldHVybiBbXG4gICAgICAgICdDOlxcXFxQeXRob24yLjcnXG4gICAgICAgICdDOlxcXFxQeXRob24zLjQnXG4gICAgICAgICdDOlxcXFxQeXRob24zLjUnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAyLjcnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAzLjQnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4ODYpXFxcXFB5dGhvbiAzLjUnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAyLjcnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAzLjQnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzICh4NjQpXFxcXFB5dGhvbiAzLjUnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAyLjcnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAzLjQnXG4gICAgICAgICdDOlxcXFxQcm9ncmFtIEZpbGVzXFxcXFB5dGhvbiAzLjUnXG4gICAgICAgIFwiI3tvcy5ob21lZGlyKCl9XFxcXEFwcERhdGFcXFxcTG9jYWxcXFxcUHJvZ3JhbXNcXFxcUHl0aG9uXFxcXFB5dGhvbjM1LTMyXCJcbiAgICAgIF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gWycvdXNyL2xvY2FsL2JpbicsICcvdXNyL2JpbicsICcvYmluJywgJy91c3Ivc2JpbicsICcvc2JpbiddXG5cbiAgcmVhZERpcjogKGRpclBhdGgpIC0+XG4gICAgdHJ5XG4gICAgICByZXR1cm4gZnMucmVhZGRpclN5bmMgZGlyUGF0aFxuICAgIGNhdGNoXG4gICAgICByZXR1cm4gW11cblxuICBpc0JpbmFyeTogKGZpbGVQYXRoKSAtPlxuICAgIHRyeVxuICAgICAgZnMuYWNjZXNzU3luYyBmaWxlUGF0aCwgZnMuWF9PS1xuICAgICAgcmV0dXJuIHRydWVcbiAgICBjYXRjaFxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgbG9va3VwSW50ZXJwcmV0ZXJzOiAoZGlyUGF0aCkgLT5cbiAgICBpbnRlcnByZXRlcnMgPSBuZXcgU2V0KClcbiAgICBmaWxlcyA9IEByZWFkRGlyKGRpclBhdGgpXG4gICAgbWF0Y2hlcyA9IChmIGZvciBmIGluIGZpbGVzIHdoZW4gQHB5dGhvbkV4ZWN1dGFibGVSZSgpLnRlc3QoZikpXG4gICAgZm9yIGZpbGVOYW1lIGluIG1hdGNoZXNcbiAgICAgIHBvdGVudGlhbEludGVycHJldGVyID0gcGF0aC5qb2luKGRpclBhdGgsIGZpbGVOYW1lKVxuICAgICAgaWYgQGlzQmluYXJ5KHBvdGVudGlhbEludGVycHJldGVyKVxuICAgICAgICBpbnRlcnByZXRlcnMuYWRkKHBvdGVudGlhbEludGVycHJldGVyKVxuICAgIHJldHVybiBpbnRlcnByZXRlcnNcblxuICBhcHBseVN1YnN0aXR1dGlvbnM6IChwYXRocykgLT5cbiAgICBtb2RQYXRocyA9IFtdXG4gICAgZm9yIHAgaW4gcGF0aHNcbiAgICAgIGlmIC9cXCRQUk9KRUNULy50ZXN0IHBcbiAgICAgICAgZm9yIHByb2plY3QgaW4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgICBbLi4uLCBwcm9qZWN0TmFtZV0gPSBwcm9qZWN0LnNwbGl0KHBhdGguc2VwKVxuICAgICAgICAgIHAgPSBwLnJlcGxhY2UoL1xcJFBST0pFQ1RfTkFNRS9pLCBwcm9qZWN0TmFtZSlcbiAgICAgICAgICBwID0gcC5yZXBsYWNlKC9cXCRQUk9KRUNUL2ksIHByb2plY3QpXG4gICAgICAgICAgaWYgcCBub3QgaW4gbW9kUGF0aHNcbiAgICAgICAgICAgIG1vZFBhdGhzLnB1c2ggcFxuICAgICAgZWxzZVxuICAgICAgICBtb2RQYXRocy5wdXNoIHBcbiAgICByZXR1cm4gbW9kUGF0aHNcblxuICBnZXRJbnRlcnByZXRlcjogLT5cbiAgICB1c2VyRGVmaW5lZFB5dGhvblBhdGhzID0gQGFwcGx5U3Vic3RpdHV0aW9ucyhcbiAgICAgIGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXB5dGhvbi5weXRob25QYXRocycpLnNwbGl0KCc7JykpXG4gICAgaW50ZXJwcmV0ZXJzID0gbmV3IFNldChwIGZvciBwIGluIHVzZXJEZWZpbmVkUHl0aG9uUGF0aHMgd2hlbiBAaXNCaW5hcnkocCkpXG4gICAgaWYgaW50ZXJwcmV0ZXJzLnNpemUgPiAwXG4gICAgICBsb2cuZGVidWcgJ1VzZXIgZGVmaW5lZCBpbnRlcnByZXRlcnMgZm91bmQnLCBpbnRlcnByZXRlcnNcbiAgICAgIHJldHVybiBpbnRlcnByZXRlcnMua2V5cygpLm5leHQoKS52YWx1ZVxuXG4gICAgbG9nLmRlYnVnICdObyB1c2VyIGRlZmluZWQgaW50ZXJwcmV0ZXIgZm91bmQsIHRyeWluZyBhdXRvbWF0aWMgbG9va3VwJ1xuICAgIGludGVycHJldGVycyA9IG5ldyBTZXQoKVxuXG4gICAgZm9yIHByb2plY3QgaW4gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgIGZvciBmIGluIEByZWFkRGlyKHByb2plY3QpXG4gICAgICAgIEBsb29rdXBJbnRlcnByZXRlcnMocGF0aC5qb2luKHByb2plY3QsIGYsICdiaW4nKSkuZm9yRWFjaCAoaSkgLT5cbiAgICAgICAgICBpbnRlcnByZXRlcnMuYWRkKGkpXG4gICAgbG9nLmRlYnVnICdQcm9qZWN0IGxldmVsIGludGVycHJldGVycyBmb3VuZCcsIGludGVycHJldGVyc1xuICAgIGVudlBhdGggPSAocHJvY2Vzcy5lbnYuUEFUSCBvciAnJykuc3BsaXQgcGF0aC5kZWxpbWl0ZXJcbiAgICBlbnZQYXRoID0gbmV3IFNldChlbnZQYXRoLmNvbmNhdChAcG9zc2libGVHbG9iYWxQeXRob25QYXRocygpKSlcbiAgICBlbnZQYXRoLmZvckVhY2ggKHBvdGVudGlhbFBhdGgpID0+XG4gICAgICBAbG9va3VwSW50ZXJwcmV0ZXJzKHBvdGVudGlhbFBhdGgpLmZvckVhY2ggKGkpIC0+XG4gICAgICAgIGludGVycHJldGVycy5hZGQoaSlcbiAgICBsb2cuZGVidWcgJ1RvdGFsIGF1dG9tYXRpY2FsbHkgZm91bmQgaW50ZXJwcmV0ZXJzJywgaW50ZXJwcmV0ZXJzXG5cbiAgICBpZiBpbnRlcnByZXRlcnMuc2l6ZSA+IDBcbiAgICAgIHJldHVybiBpbnRlcnByZXRlcnMua2V5cygpLm5leHQoKS52YWx1ZVxuIl19
