'use babel';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    projectDependencies: {
        type: 'object',
        title: 'Load project dependencies from package.json. Note: This can adversely affect load performance',
        properties: {
            suggestDev: {
                title: 'Suggest dev dependencies',
                type: 'boolean',
                'default': false
            },
            suggestProd: {
                title: 'Suggest regular dependencies',
                type: 'boolean',
                'default': false
            }
        }
    },
    fuzzy: {
        type: 'object',
        title: '(Experimental) Fuzzy file matching',
        properties: {
            enabled: {
                title: 'Enabled',
                type: 'boolean',
                'default': false
            },
            excludedDirs: {
                title: 'Directories to omit from matching',
                type: 'array',
                'default': ['node_modules', '.git']
            },
            fileTypes: {
                title: 'Allowable file types (* for anything)',
                type: 'array',
                'default': ['ts', 'js', 'jsx', 'json']
            }
        }
    },
    fileRelativePaths: {
        type: 'boolean',
        'default': true,
        title: 'File relative path completion',
        description: 'Upon selecting a match, the path relative to the current file will be inserted.' + ' Disabling this results in paths relative to the project'
    },
    importTypes: {
        type: 'object',
        title: 'Import types for autocompletion',
        properties: {
            es6: {
                type: 'boolean',
                'default': true,
                title: 'ES6 style "Import"'
            },
            require: {
                type: 'boolean',
                'default': true,
                title: 'Commonjs "require"'
            }
        }
    },
    hiddenFiles: {
        type: 'boolean',
        'default': false,
        title: 'Show hidden files (files starting with ".") in suggestions'
    },
    removeExtensions: {
        type: 'array',
        'default': ['.js'],
        title: 'Removes extension from suggestion',
        description: 'Import statements can usually autoresolve certain filetypes without providing an extension; ' + 'this provides the option to drop the extension'
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3NldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7cUJBRUk7QUFDWCx1QkFBbUIsRUFBRTtBQUNqQixZQUFJLEVBQUUsUUFBUTtBQUNkLGFBQUssRUFBRSwrRkFBK0Y7QUFDdEcsa0JBQVUsRUFBRTtBQUNSLHNCQUFVLEVBQUU7QUFDUixxQkFBSyxFQUFFLDBCQUEwQjtBQUNqQyxvQkFBSSxFQUFFLFNBQVM7QUFDZiwyQkFBUyxLQUFLO2FBQ2pCO0FBQ0QsdUJBQVcsRUFBRTtBQUNULHFCQUFLLEVBQUUsOEJBQThCO0FBQ3JDLG9CQUFJLEVBQUUsU0FBUztBQUNmLDJCQUFTLEtBQUs7YUFDakI7U0FDSjtLQUNKO0FBQ0QsU0FBSyxFQUFFO0FBQ0gsWUFBSSxFQUFFLFFBQVE7QUFDZCxhQUFLLEVBQUUsb0NBQW9DO0FBQzNDLGtCQUFVLEVBQUU7QUFDUixtQkFBTyxFQUFFO0FBQ0wscUJBQUssRUFBRSxTQUFTO0FBQ2hCLG9CQUFJLEVBQUUsU0FBUztBQUNmLDJCQUFTLEtBQUs7YUFDakI7QUFDRCx3QkFBWSxFQUFFO0FBQ1YscUJBQUssRUFBRSxtQ0FBbUM7QUFDMUMsb0JBQUksRUFBRSxPQUFPO0FBQ2IsMkJBQVMsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDO2FBQ3BDO0FBQ0QscUJBQVMsRUFBRTtBQUNQLHFCQUFLLEVBQUUsdUNBQXVDO0FBQzlDLG9CQUFJLEVBQUUsT0FBTztBQUNiLDJCQUFTLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO2FBQ3ZDO1NBQ0o7S0FDSjtBQUNELHFCQUFpQixFQUFFO0FBQ2YsWUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBUyxJQUFJO0FBQ2IsYUFBSyxFQUFFLCtCQUErQjtBQUN0QyxtQkFBVyxFQUFFLGlGQUFpRixHQUMxRiwwREFBMEQ7S0FDakU7QUFDRCxlQUFXLEVBQUU7QUFDVCxZQUFJLEVBQUUsUUFBUTtBQUNkLGFBQUssRUFBRSxpQ0FBaUM7QUFDeEMsa0JBQVUsRUFBRTtBQUNSLGVBQUcsRUFBRTtBQUNELG9CQUFJLEVBQUUsU0FBUztBQUNmLDJCQUFTLElBQUk7QUFDYixxQkFBSyxFQUFFLG9CQUFvQjthQUM5QjtBQUNELG1CQUFPLEVBQUU7QUFDTCxvQkFBSSxFQUFFLFNBQVM7QUFDZiwyQkFBUyxJQUFJO0FBQ2IscUJBQUssRUFBRSxvQkFBb0I7YUFDOUI7U0FDSjtLQUNKO0FBQ0QsZUFBVyxFQUFFO0FBQ1QsWUFBSSxFQUFFLFNBQVM7QUFDZixtQkFBUyxLQUFLO0FBQ2QsYUFBSyxFQUFFLDREQUE0RDtLQUN0RTtBQUNELG9CQUFnQixFQUFFO0FBQ2QsWUFBSSxFQUFFLE9BQU87QUFDYixtQkFBUyxDQUFDLEtBQUssQ0FBQztBQUNoQixhQUFLLEVBQUUsbUNBQW1DO0FBQzFDLG1CQUFXLEVBQUUsOEZBQThGLEdBQ3JHLGdEQUFnRDtLQUN6RDtDQUNKIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qcy1pbXBvcnQvbGliL3NldHRpbmdzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHByb2plY3REZXBlbmRlbmNpZXM6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHRpdGxlOiAnTG9hZCBwcm9qZWN0IGRlcGVuZGVuY2llcyBmcm9tIHBhY2thZ2UuanNvbi4gTm90ZTogVGhpcyBjYW4gYWR2ZXJzZWx5IGFmZmVjdCBsb2FkIHBlcmZvcm1hbmNlJyxcbiAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgc3VnZ2VzdERldjoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnU3VnZ2VzdCBkZXYgZGVwZW5kZW5jaWVzJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWdnZXN0UHJvZDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnU3VnZ2VzdCByZWd1bGFyIGRlcGVuZGVuY2llcycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZ1enp5OiB7XG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICB0aXRsZTogJyhFeHBlcmltZW50YWwpIEZ1enp5IGZpbGUgbWF0Y2hpbmcnLFxuICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICBlbmFibGVkOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdFbmFibGVkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleGNsdWRlZERpcnM6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0RpcmVjdG9yaWVzIHRvIG9taXQgZnJvbSBtYXRjaGluZycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiBbJ25vZGVfbW9kdWxlcycsICcuZ2l0J11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWxlVHlwZXM6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0FsbG93YWJsZSBmaWxlIHR5cGVzICgqIGZvciBhbnl0aGluZyknLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogWyd0cycsICdqcycsICdqc3gnLCAnanNvbiddXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGZpbGVSZWxhdGl2ZVBhdGhzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgdGl0bGU6ICdGaWxlIHJlbGF0aXZlIHBhdGggY29tcGxldGlvbicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVXBvbiBzZWxlY3RpbmcgYSBtYXRjaCwgdGhlIHBhdGggcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgZmlsZSB3aWxsIGJlIGluc2VydGVkLicgK1xuICAgICAgICAgICAgJyBEaXNhYmxpbmcgdGhpcyByZXN1bHRzIGluIHBhdGhzIHJlbGF0aXZlIHRvIHRoZSBwcm9qZWN0J1xuICAgIH0sXG4gICAgaW1wb3J0VHlwZXM6IHtcbiAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgIHRpdGxlOiAnSW1wb3J0IHR5cGVzIGZvciBhdXRvY29tcGxldGlvbicsXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGVzNjoge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnRVM2IHN0eWxlIFwiSW1wb3J0XCInXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVxdWlyZToge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQ29tbW9uanMgXCJyZXF1aXJlXCInXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGhpZGRlbkZpbGVzOiB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICAgIHRpdGxlOiAnU2hvdyBoaWRkZW4gZmlsZXMgKGZpbGVzIHN0YXJ0aW5nIHdpdGggXCIuXCIpIGluIHN1Z2dlc3Rpb25zJ1xuICAgIH0sXG4gICAgcmVtb3ZlRXh0ZW5zaW9uczoge1xuICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICBkZWZhdWx0OiBbJy5qcyddLFxuICAgICAgICB0aXRsZTogJ1JlbW92ZXMgZXh0ZW5zaW9uIGZyb20gc3VnZ2VzdGlvbicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnSW1wb3J0IHN0YXRlbWVudHMgY2FuIHVzdWFsbHkgYXV0b3Jlc29sdmUgY2VydGFpbiBmaWxldHlwZXMgd2l0aG91dCBwcm92aWRpbmcgYW4gZXh0ZW5zaW9uOyAnXG4gICAgICAgICAgICArICd0aGlzIHByb3ZpZGVzIHRoZSBvcHRpb24gdG8gZHJvcCB0aGUgZXh0ZW5zaW9uJ1xuICAgIH1cbn1cbiJdfQ==