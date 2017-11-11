Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

/**
 * @class Handles the mapping between projects and their package.json deps
 */
'use babel';

var ProjectDeps = (function () {
    function ProjectDeps() {
        _classCallCheck(this, ProjectDeps);

        this._deps = Object.create(null);
    }

    _createClass(ProjectDeps, [{
        key: 'clear',
        value: function clear() {
            this._deps = Object.create(null);
        }
    }, {
        key: 'set',
        value: function set(rootPath, deps) {
            this._deps[rootPath] = deps;
        }
    }, {
        key: 'hasDeps',
        value: function hasDeps(rootPath) {
            return rootPath in this._deps;
        }
    }, {
        key: 'search',
        value: function search(currPath, keyword) {
            var rootPaths = Object.keys(this._deps);
            var pathDeps = [];

            for (var i = 0; i < rootPaths.length; i++) {
                // for the current path to be a child of root, it must start with rootpath
                if ((0, _utils.startsWith)(currPath, rootPaths[i])) {
                    pathDeps = this._deps[rootPaths[i]];
                    break;
                }
            }

            return pathDeps.filter(function (d) {
                return (0, _utils.startsWith)(d, keyword);
            });
        }
    }]);

    return ProjectDeps;
})();

exports['default'] = ProjectDeps;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3Byb2plY3QtZGVwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztxQkFDeUIsU0FBUzs7Ozs7QUFEbEMsV0FBVyxDQUFDOztJQU1TLFdBQVc7QUFDakIsYUFETSxXQUFXLEdBQ2Q7OEJBREcsV0FBVzs7QUFFeEIsWUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3BDOztpQkFIZ0IsV0FBVzs7ZUFLdkIsaUJBQUc7QUFDSixnQkFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDOzs7ZUFFRSxhQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUU7QUFDaEIsZ0JBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQy9COzs7ZUFFTSxpQkFBQyxRQUFRLEVBQUU7QUFDZCxtQkFBTyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztTQUNqQzs7O2VBRUssZ0JBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUN0QixnQkFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUMsZ0JBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQzs7QUFFbEIsaUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztBQUV2QyxvQkFBSSx1QkFBVyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDcEMsNEJBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLDBCQUFNO2lCQUNUO2FBQ0o7O0FBRUQsbUJBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7dUJBQUksdUJBQVcsQ0FBQyxFQUFFLE9BQU8sQ0FBQzthQUFBLENBQUMsQ0FBQztTQUN2RDs7O1dBOUJnQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtanMtaW1wb3J0L2xpYi9wcm9qZWN0LWRlcHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbmltcG9ydCB7c3RhcnRzV2l0aH0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogQGNsYXNzIEhhbmRsZXMgdGhlIG1hcHBpbmcgYmV0d2VlbiBwcm9qZWN0cyBhbmQgdGhlaXIgcGFja2FnZS5qc29uIGRlcHNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvamVjdERlcHMge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9kZXBzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG5cbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy5fZGVwcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgfVxuXG4gICAgc2V0KHJvb3RQYXRoLCBkZXBzKSB7XG4gICAgICAgIHRoaXMuX2RlcHNbcm9vdFBhdGhdID0gZGVwcztcbiAgICB9XG5cbiAgICBoYXNEZXBzKHJvb3RQYXRoKSB7XG4gICAgICAgIHJldHVybiByb290UGF0aCBpbiB0aGlzLl9kZXBzO1xuICAgIH1cblxuICAgIHNlYXJjaChjdXJyUGF0aCwga2V5d29yZCkge1xuICAgICAgICBjb25zdCByb290UGF0aHMgPSBPYmplY3Qua2V5cyh0aGlzLl9kZXBzKTtcbiAgICAgICAgbGV0IHBhdGhEZXBzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb290UGF0aHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIC8vIGZvciB0aGUgY3VycmVudCBwYXRoIHRvIGJlIGEgY2hpbGQgb2Ygcm9vdCwgaXQgbXVzdCBzdGFydCB3aXRoIHJvb3RwYXRoXG4gICAgICAgICAgICBpZiAoc3RhcnRzV2l0aChjdXJyUGF0aCwgcm9vdFBhdGhzW2ldKSkge1xuICAgICAgICAgICAgICAgIHBhdGhEZXBzID0gdGhpcy5fZGVwc1tyb290UGF0aHNbaV1dO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhdGhEZXBzLmZpbHRlcihkID0+IHN0YXJ0c1dpdGgoZCwga2V5d29yZCkpO1xuICAgIH1cbn1cbiJdfQ==