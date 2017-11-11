function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libValidate = require('../lib/validate');

var Validate = _interopRequireWildcard(_libValidate);

describe('Validate', function () {
  function expectNotification(message) {
    var notifications = atom.notifications.getNotifications();
    expect(notifications.length).toBe(1);
    var issues = notifications[0].options.detail.split('\n');
    issues.shift();
    expect(issues[0]).toBe('  • ' + message);
    atom.notifications.clear();
  }

  describe('::ui', function () {
    function validateUI(ui, expectedValue) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      expect(Validate.ui(ui)).toBe(expectedValue);
      if (!expectedValue) {
        expectNotification(message);
      }
    }

    it('cries if param is not an object', function () {
      validateUI(undefined, false, 'UI must be an object');
      validateUI(null, false, 'UI must be an object');
      validateUI(2, false, 'UI must be an object');
      validateUI(NaN, false, 'UI must be an object');
    });
    it('cries if ui.name is not a string', function () {
      validateUI({
        name: NaN
      }, false, 'UI.name must be a string');
      validateUI({
        name: null
      }, false, 'UI.name must be a string');
      validateUI({
        name: 2
      }, false, 'UI.name must be a string');
    });
    it('cries if ui.didBeginLinting is not a function', function () {
      validateUI({
        name: 'Some',
        didBeginLinting: null
      }, false, 'UI.didBeginLinting must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: {}
      }, false, 'UI.didBeginLinting must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: NaN
      }, false, 'UI.didBeginLinting must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: 5
      }, false, 'UI.didBeginLinting must be a function');
    });
    it('cries if ui.didFinishLinting is not a function', function () {
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: null
      }, false, 'UI.didFinishLinting must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: {}
      }, false, 'UI.didFinishLinting must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: NaN
      }, false, 'UI.didFinishLinting must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: 5
      }, false, 'UI.didFinishLinting must be a function');
    });
    it('cries if ui.render is not a function', function () {
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: null
      }, false, 'UI.render must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: {}
      }, false, 'UI.render must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: NaN
      }, false, 'UI.render must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: 5
      }, false, 'UI.render must be a function');
    });
    it('cries if ui.dispose is not a function', function () {
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: function render() {},
        dispose: null
      }, false, 'UI.dispose must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: function render() {},
        dispose: {}
      }, false, 'UI.dispose must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: function render() {},
        dispose: NaN
      }, false, 'UI.dispose must be a function');
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: function render() {},
        dispose: 5
      }, false, 'UI.dispose must be a function');
    });
    it('does not cry if everything is good', function () {
      validateUI({
        name: 'Some',
        didBeginLinting: function didBeginLinting() {},
        didFinishLinting: function didFinishLinting() {},
        render: function render() {},
        dispose: function dispose() {}
      }, true);
    });
  });
  describe('::linter', function () {
    function validateLinter(linter, expectedValue, message, version) {
      if (message === undefined) message = '';

      expect(Validate.linter(linter, version)).toBe(expectedValue);
      if (!expectedValue) {
        expectNotification(message);
      }
    }

    it('cries if params is not an object', function () {
      validateLinter(null, false, 'Linter must be an object', 1);
      validateLinter(5, false, 'Linter must be an object', 1);
      validateLinter(NaN, false, 'Linter must be an object', 1);
      validateLinter(undefined, false, 'Linter must be an object', 1);
    });
    it('does not cry if linter.name is not a string on v1', function () {
      validateLinter({
        lint: function lint() {},
        scope: 'file',
        lintOnFly: true,
        grammarScopes: []
      }, true, '', 1);
    });
    it('cries if linter.name is not a string', function () {
      validateLinter({
        name: undefined
      }, false, 'Linter.name must be a string', 2);
      validateLinter({
        name: NaN
      }, false, 'Linter.name must be a string', 2);
      validateLinter({
        name: null
      }, false, 'Linter.name must be a string', 2);
      validateLinter({
        name: 5
      }, false, 'Linter.name must be a string', 2);
    });
    it('cries if linter.scope is not valid', function () {
      validateLinter({
        name: 'Linter',
        scope: 5
      }, false, "Linter.scope must be either 'file' or 'project'", 1);
      validateLinter({
        name: 'Linter',
        scope: NaN
      }, false, "Linter.scope must be either 'file' or 'project'", 1);
      validateLinter({
        name: 'Linter',
        scope: null
      }, false, "Linter.scope must be either 'file' or 'project'", 1);
      validateLinter({
        name: 'Linter',
        scope: undefined
      }, false, "Linter.scope must be either 'file' or 'project'", 1);
      validateLinter({
        name: 'Linter',
        scope: 'something'
      }, false, "Linter.scope must be either 'file' or 'project'", 1);
      validateLinter({
        name: 'Linter',
        scope: 'fileistic'
      }, false, "Linter.scope must be either 'file' or 'project'", 1);
    });
    it('cries if v is 1 and linter.lintOnFly is not boolean', function () {
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: {}
      }, false, 'Linter.lintOnFly must be a boolean', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: []
      }, false, 'Linter.lintOnFly must be a boolean', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: ''
      }, false, 'Linter.lintOnFly must be a boolean', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: function lintOnFly() {}
      }, false, 'Linter.lintOnFly must be a boolean', 1);
    });
    it('cries if v is 2 and linter.lintsOnChange is not boolean', function () {
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintsOnChange: {}
      }, false, 'Linter.lintsOnChange must be a boolean', 2);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintsOnChange: []
      }, false, 'Linter.lintsOnChange must be a boolean', 2);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintsOnChange: ''
      }, false, 'Linter.lintsOnChange must be a boolean', 2);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintsOnChange: function lintsOnChange() {}
      }, false, 'Linter.lintsOnChange must be a boolean', 2);
    });
    it('cries if linter.grammarScopes is not an array', function () {
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: undefined
      }, false, 'Linter.grammarScopes must be an Array', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: null
      }, false, 'Linter.grammarScopes must be an Array', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: 5
      }, false, 'Linter.grammarScopes must be an Array', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: NaN
      }, false, 'Linter.grammarScopes must be an Array', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: {}
      }, false, 'Linter.grammarScopes must be an Array', 1);
    });
    it('cries if linter.lint is not a function', function () {
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: ['source.js'],
        lint: undefined
      }, false, 'Linter.lint must be a function', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: ['source.js'],
        lint: 5
      }, false, 'Linter.lint must be a function', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: ['source.js'],
        lint: NaN
      }, false, 'Linter.lint must be a function', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: ['source.js'],
        lint: {}
      }, false, 'Linter.lint must be a function', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: ['source.js'],
        lint: 'something'
      }, false, 'Linter.lint must be a function', 1);
    });
    it('does not cry if everything is valid', function () {
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintOnFly: false,
        grammarScopes: ['source.js'],
        lint: function lint() {}
      }, true, '', 1);
      validateLinter({
        name: 'Linter',
        scope: 'file',
        lintsOnChange: false,
        grammarScopes: ['source.js'],
        lint: function lint() {}
      }, true, '', 2);
    });
  });
  describe('::indie', function () {
    function validateIndie(linter, expectedValue) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      expect(Validate.indie(linter)).toBe(expectedValue);
      if (!expectedValue) {
        expectNotification(message);
      }
    }

    it('cries if params is not an object', function () {
      validateIndie(null, false, 'Indie must be an object');
      validateIndie(5, false, 'Indie must be an object');
      validateIndie(NaN, false, 'Indie must be an object');
      validateIndie(undefined, false, 'Indie must be an object');
    });
    it('cries if indie.name is not a string', function () {
      validateIndie({
        name: undefined
      }, false, 'Indie.name must be a string');
      validateIndie({
        name: 5
      }, false, 'Indie.name must be a string');
      validateIndie({
        name: {}
      }, false, 'Indie.name must be a string');
      validateIndie({
        name: NaN
      }, false, 'Indie.name must be a string');
    });
    it('does not cry if everything is valid', function () {
      validateIndie({
        name: 'Indie'
      }, true);
    });
  });
  describe('::messages', function () {
    function validateMessages(linter, expectedValue) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      expect(Validate.messages('Some Linter', linter)).toBe(expectedValue);
      if (!expectedValue) {
        expectNotification(message);
      }
    }

    it('cries if results are not array', function () {
      validateMessages(undefined, false, 'Linter Result must be an Array');
      validateMessages({}, false, 'Linter Result must be an Array');
      validateMessages(5, false, 'Linter Result must be an Array');
      validateMessages(NaN, false, 'Linter Result must be an Array');
    });
    it('cries if message.icon is present and invalid', function () {
      validateMessages([{
        icon: 5
      }], false, 'Message.icon must be a string');
      validateMessages([{
        icon: {}
      }], false, 'Message.icon must be a string');
      validateMessages([{
        icon: function icon() {}
      }], false, 'Message.icon must be a string');
    });
    it('cries if message.location is invalid', function () {
      validateMessages([{
        location: 5
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: NaN
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: {}
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: { file: __filename }
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: { file: __filename, position: 5 }
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: { file: __filename, position: null }
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: { file: __filename, position: '' }
      }], false, 'Message.location must be valid');
      validateMessages([{
        location: { file: __filename, position: NaN }
      }], false, 'Message.location must be valid');
    });
    it('cries if message.location contains NaN', function () {
      validateMessages([{
        location: { file: __filename, position: [[NaN, NaN], [NaN, NaN]] }
      }], false, 'Message.location.position should not contain NaN coordinates');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, NaN]] }
      }], false, 'Message.location.position should not contain NaN coordinates');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [NaN, 0]] }
      }], false, 'Message.location.position should not contain NaN coordinates');
      validateMessages([{
        location: { file: __filename, position: [[0, NaN], [0, 0]] }
      }], false, 'Message.location.position should not contain NaN coordinates');
      validateMessages([{
        location: { file: __filename, position: [[NaN, 0], [0, 0]] }
      }], false, 'Message.location.position should not contain NaN coordinates');
    });
    it('cries if message.solutions is present and is not array', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        solutions: {}
      }], false, 'Message.solutions must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        solutions: 'asdsad'
      }], false, 'Message.solutions must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        solutions: 5
      }], false, 'Message.solutions must be valid');
    });
    it('cries if message.reference is present and invalid', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: 5
      }], false, 'Message.reference must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: {}
      }], false, 'Message.reference must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: 'asdasd'
      }], false, 'Message.reference must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename }
      }], false, 'Message.reference must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: 5 }
      }], false, 'Message.reference must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: NaN }
      }], false, 'Message.reference must be valid');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: null }
      }], false, 'Message.reference must be valid');
    });
    it('cries if message.reference contains NaN', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: [NaN, 5] }
      }], false, 'Message.reference.position should not contain NaN coordinates');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: [5, NaN] }
      }], false, 'Message.reference.position should not contain NaN coordinates');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: [NaN, NaN] }
      }], false, 'Message.reference.position should not contain NaN coordinates');
    });
    it('cries if message.excerpt is not string', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: undefined
      }], false, 'Message.excerpt must be a string');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: {}
      }], false, 'Message.excerpt must be a string');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: null
      }], false, 'Message.excerpt must be a string');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: NaN
      }], false, 'Message.excerpt must be a string');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: 5
      }], false, 'Message.excerpt must be a string');
    });
    it('cries if message.severity is invalid', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: ''
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: NaN
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 5
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: {}
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'errorish'
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'warningish'
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
    });
    it('cries if message.url is present and is not string', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'error',
        url: 5
      }], false, 'Message.url must a string');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'error',
        url: {}
      }], false, 'Message.url must a string');
    });
    it('cries if message.description is present and is invalid', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'error',
        description: 5
      }], false, 'Message.description must be a function or string');
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'error',
        description: {}
      }], false, 'Message.description must be a function or string');
    });
    it('does not cry if provided with valid values', function () {
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'error'
      }], true);
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        severity: 'error',
        solutions: []
      }], true);
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        reference: { file: __filename, position: [0, 0] },
        excerpt: '',
        severity: 'warning'
      }], true);
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        url: 'something',
        severity: 'info'
      }], true);
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        description: 'something',
        severity: 'warning'
      }], true);
      validateMessages([{
        location: { file: __filename, position: [[0, 0], [0, 0]] },
        excerpt: '',
        description: function description() {},
        severity: 'warning'
      }], true);
    });
  });
  describe('::messagesLegacy', function () {
    function validateMessagesLegacy(linter, expectedValue) {
      var message = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      expect(Validate.messagesLegacy('Some Linter', linter)).toBe(expectedValue);
      if (!expectedValue) {
        expectNotification(message);
      }
    }

    it('cries if results are not array', function () {
      validateMessagesLegacy(undefined, false, 'Linter Result must be an Array');
      validateMessagesLegacy({}, false, 'Linter Result must be an Array');
      validateMessagesLegacy(5, false, 'Linter Result must be an Array');
      validateMessagesLegacy(NaN, false, 'Linter Result must be an Array');
    });
    it('cries if message.type is invalid', function () {
      validateMessagesLegacy([{
        type: undefined
      }], false, 'Message.type must be a string');
      validateMessagesLegacy([{
        type: NaN
      }], false, 'Message.type must be a string');
      validateMessagesLegacy([{
        type: 5
      }], false, 'Message.type must be a string');
      validateMessagesLegacy([{
        type: null
      }], false, 'Message.type must be a string');
    });
    it('cries if message.text and message.html are invalid', function () {
      validateMessagesLegacy([{
        type: 'Error'
      }], false, 'Message.text or Message.html must have a valid value');
      validateMessagesLegacy([{
        type: 'Error',
        html: {}
      }], false, 'Message.text or Message.html must have a valid value');
      validateMessagesLegacy([{
        type: 'Error',
        html: 5
      }], false, 'Message.text or Message.html must have a valid value');
      validateMessagesLegacy([{
        type: 'Error',
        html: NaN
      }], false, 'Message.text or Message.html must have a valid value');
      validateMessagesLegacy([{
        type: 'Error',
        text: 5
      }], false, 'Message.text or Message.html must have a valid value');
      validateMessagesLegacy([{
        type: 'Error',
        text: {}
      }], false, 'Message.text or Message.html must have a valid value');
      validateMessagesLegacy([{
        type: 'Error',
        text: NaN
      }], false, 'Message.text or Message.html must have a valid value');
    });
    it('cries if message.filePath is present and invalid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        filePath: 5
      }], false, 'Message.filePath must be a string');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        filePath: {}
      }], false, 'Message.filePath must be a string');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        filePath: function filePath() {}
      }], false, 'Message.filePath must be a string');
    });
    it('cries if message.range is present and invalid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: 'some'
      }], false, 'Message.range must be an object');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: 5
      }], false, 'Message.range must be an object');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: function range() {}
      }], false, 'Message.range must be an object');
    });
    it('cries if message.range has NaN values', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: [[NaN, NaN], [NaN, NaN]]
      }], false, 'Message.range should not contain NaN coordinates');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: [[NaN, 0], [0, 0]]
      }], false, 'Message.range should not contain NaN coordinates');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: [[0, NaN], [0, 0]]
      }], false, 'Message.range should not contain NaN coordinates');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: [[0, 0], [NaN, 0]]
      }], false, 'Message.range should not contain NaN coordinates');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: [[0, 0], [0, NaN]]
      }], false, 'Message.range should not contain NaN coordinates');
    });
    it('cries if message.class is present and invalid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        'class': 5
      }], false, 'Message.class must be a string');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        'class': {}
      }], false, 'Message.class must be a string');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        'class': function _class() {}
      }], false, 'Message.class must be a string');
    });
    it('cries if message.severity is present and invalid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: {}
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: []
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: function severity() {}
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: 'error-ish'
      }], false, "Message.severity must be 'error', 'warning' or 'info'");
    });
    it('cries if message.trace is present and invalid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        trace: {}
      }], false, 'Message.trace must be an Array');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        trace: function trace() {}
      }], false, 'Message.trace must be an Array');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        trace: 5
      }], false, 'Message.trace must be an Array');
    });
    it('cries if message.fix is present and invalid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: {}
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: 5
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: function fix() {}
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: 5, newText: 'some', oldText: 'some' }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: NaN, newText: 'some', oldText: 'some' }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: undefined, newText: 'some', oldText: 'some' }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: [[0, 0], [0, 0]], newText: 5, oldText: 'some' }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: [[0, 0], [0, 0]], newText: {}, oldText: 'some' }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: [[0, 0], [0, 0]], newText: function newText() {}, oldText: 'some' }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: [[0, 0], [0, 0]], newText: 'some', oldText: 5 }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: [[0, 0], [0, 0]], newText: 'some', oldText: {} }
      }], false, 'Message.fix must be valid');
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        fix: { range: [[0, 0], [0, 0]], newText: 'some', oldText: function oldText() {} }
      }], false, 'Message.fix must be valid');
    });
    it('does not cry if the object is valid', function () {
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        filePath: 'some'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        html: 'Some'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        html: document.createElement('div')
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        range: [[0, 0], [0, 0]]
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        'class': 'some'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: 'error'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: 'info'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        severity: 'warning'
      }], true);
      validateMessagesLegacy([{
        type: 'Error',
        text: 'some',
        trace: []
      }], true);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL3ZhbGlkYXRlLXNwZWMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7MkJBRTBCLGlCQUFpQjs7SUFBL0IsUUFBUTs7QUFFcEIsUUFBUSxDQUFDLFVBQVUsRUFBRSxZQUFXO0FBQzlCLFdBQVMsa0JBQWtCLENBQUMsT0FBZSxFQUFFO0FBQzNDLFFBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtBQUMzRCxVQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwQyxRQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDMUQsVUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ2QsVUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBUSxPQUFPLENBQUcsQ0FBQTtBQUN4QyxRQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFBO0dBQzNCOztBQUVELFVBQVEsQ0FBQyxNQUFNLEVBQUUsWUFBVztBQUMxQixhQUFTLFVBQVUsQ0FBQyxFQUFPLEVBQUUsYUFBc0IsRUFBd0I7VUFBdEIsT0FBZSx5REFBRyxFQUFFOztBQUN2RSxZQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUMzQyxVQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2xCLDBCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQzVCO0tBQ0Y7O0FBRUQsTUFBRSxDQUFDLGlDQUFpQyxFQUFFLFlBQVc7QUFDL0MsZ0JBQVUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixDQUFDLENBQUE7QUFD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RSxPQUFPO0FBQ2IsWUFBSSxFQUFFLE1BQU07QUFDWixnQkFBUSxFQUFFLFNBQVM7T0FDcEIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ1QsNEJBQXNCLENBQUMsQ0FBQztBQUN0QixZQUFJLEVBQUUsT0FBTztBQUNiLFlBQUksRUFBRSxNQUFNO0FBQ1osYUFBSyxFQUFFLEVBQUU7T0FDVixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDVixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvdmFsaWRhdGUtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCAqIGFzIFZhbGlkYXRlIGZyb20gJy4uL2xpYi92YWxpZGF0ZSdcblxuZGVzY3JpYmUoJ1ZhbGlkYXRlJywgZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGV4cGVjdE5vdGlmaWNhdGlvbihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBub3RpZmljYXRpb25zID0gYXRvbS5ub3RpZmljYXRpb25zLmdldE5vdGlmaWNhdGlvbnMoKVxuICAgIGV4cGVjdChub3RpZmljYXRpb25zLmxlbmd0aCkudG9CZSgxKVxuICAgIGNvbnN0IGlzc3VlcyA9IG5vdGlmaWNhdGlvbnNbMF0ub3B0aW9ucy5kZXRhaWwuc3BsaXQoJ1xcbicpXG4gICAgaXNzdWVzLnNoaWZ0KClcbiAgICBleHBlY3QoaXNzdWVzWzBdKS50b0JlKGAgIOKAoiAke21lc3NhZ2V9YClcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuY2xlYXIoKVxuICB9XG5cbiAgZGVzY3JpYmUoJzo6dWknLCBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZVVJKHVpOiBhbnksIGV4cGVjdGVkVmFsdWU6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZyA9ICcnKSB7XG4gICAgICBleHBlY3QoVmFsaWRhdGUudWkodWkpKS50b0JlKGV4cGVjdGVkVmFsdWUpXG4gICAgICBpZiAoIWV4cGVjdGVkVmFsdWUpIHtcbiAgICAgICAgZXhwZWN0Tm90aWZpY2F0aW9uKG1lc3NhZ2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaXQoJ2NyaWVzIGlmIHBhcmFtIGlzIG5vdCBhbiBvYmplY3QnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlVUkodW5kZWZpbmVkLCBmYWxzZSwgJ1VJIG11c3QgYmUgYW4gb2JqZWN0JylcbiAgICAgIHZhbGlkYXRlVUkobnVsbCwgZmFsc2UsICdVSSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgICB2YWxpZGF0ZVVJKDIsIGZhbHNlLCAnVUkgbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgICAgdmFsaWRhdGVVSShOYU4sIGZhbHNlLCAnVUkgbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIHVpLm5hbWUgaXMgbm90IGEgc3RyaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogTmFOLFxuICAgICAgfSwgZmFsc2UsICdVSS5uYW1lIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6IG51bGwsXG4gICAgICB9LCBmYWxzZSwgJ1VJLm5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogMixcbiAgICAgIH0sIGZhbHNlLCAnVUkubmFtZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiB1aS5kaWRCZWdpbkxpbnRpbmcgaXMgbm90IGEgZnVuY3Rpb24nLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlVUkoe1xuICAgICAgICBuYW1lOiAnU29tZScsXG4gICAgICAgIGRpZEJlZ2luTGludGluZzogbnVsbCxcbiAgICAgIH0sIGZhbHNlLCAnVUkuZGlkQmVnaW5MaW50aW5nIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogJ1NvbWUnLFxuICAgICAgICBkaWRCZWdpbkxpbnRpbmc6IHt9LFxuICAgICAgfSwgZmFsc2UsICdVSS5kaWRCZWdpbkxpbnRpbmcgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICAgIHZhbGlkYXRlVUkoe1xuICAgICAgICBuYW1lOiAnU29tZScsXG4gICAgICAgIGRpZEJlZ2luTGludGluZzogTmFOLFxuICAgICAgfSwgZmFsc2UsICdVSS5kaWRCZWdpbkxpbnRpbmcgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICAgIHZhbGlkYXRlVUkoe1xuICAgICAgICBuYW1lOiAnU29tZScsXG4gICAgICAgIGRpZEJlZ2luTGludGluZzogNSxcbiAgICAgIH0sIGZhbHNlLCAnVUkuZGlkQmVnaW5MaW50aW5nIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgdWkuZGlkRmluaXNoTGludGluZyBpcyBub3QgYSBmdW5jdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6ICdTb21lJyxcbiAgICAgICAgZGlkQmVnaW5MaW50aW5nKCkgeyB9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nOiBudWxsLFxuICAgICAgfSwgZmFsc2UsICdVSS5kaWRGaW5pc2hMaW50aW5nIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogJ1NvbWUnLFxuICAgICAgICBkaWRCZWdpbkxpbnRpbmcoKSB7IH0sXG4gICAgICAgIGRpZEZpbmlzaExpbnRpbmc6IHt9LFxuICAgICAgfSwgZmFsc2UsICdVSS5kaWRGaW5pc2hMaW50aW5nIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogJ1NvbWUnLFxuICAgICAgICBkaWRCZWdpbkxpbnRpbmcoKSB7IH0sXG4gICAgICAgIGRpZEZpbmlzaExpbnRpbmc6IE5hTixcbiAgICAgIH0sIGZhbHNlLCAnVUkuZGlkRmluaXNoTGludGluZyBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6ICdTb21lJyxcbiAgICAgICAgZGlkQmVnaW5MaW50aW5nKCkgeyB9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nOiA1LFxuICAgICAgfSwgZmFsc2UsICdVSS5kaWRGaW5pc2hMaW50aW5nIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgdWkucmVuZGVyIGlzIG5vdCBhIGZ1bmN0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogJ1NvbWUnLFxuICAgICAgICBkaWRCZWdpbkxpbnRpbmcoKSB7IH0sXG4gICAgICAgIGRpZEZpbmlzaExpbnRpbmcoKSB7IH0sXG4gICAgICAgIHJlbmRlcjogbnVsbCxcbiAgICAgIH0sIGZhbHNlLCAnVUkucmVuZGVyIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogJ1NvbWUnLFxuICAgICAgICBkaWRCZWdpbkxpbnRpbmcoKSB7IH0sXG4gICAgICAgIGRpZEZpbmlzaExpbnRpbmcoKSB7IH0sXG4gICAgICAgIHJlbmRlcjoge30sXG4gICAgICB9LCBmYWxzZSwgJ1VJLnJlbmRlciBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6ICdTb21lJyxcbiAgICAgICAgZGlkQmVnaW5MaW50aW5nKCkgeyB9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nKCkgeyB9LFxuICAgICAgICByZW5kZXI6IE5hTixcbiAgICAgIH0sIGZhbHNlLCAnVUkucmVuZGVyIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgICB2YWxpZGF0ZVVJKHtcbiAgICAgICAgbmFtZTogJ1NvbWUnLFxuICAgICAgICBkaWRCZWdpbkxpbnRpbmcoKSB7IH0sXG4gICAgICAgIGRpZEZpbmlzaExpbnRpbmcoKSB7IH0sXG4gICAgICAgIHJlbmRlcjogNSxcbiAgICAgIH0sIGZhbHNlLCAnVUkucmVuZGVyIG11c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgdWkuZGlzcG9zZSBpcyBub3QgYSBmdW5jdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6ICdTb21lJyxcbiAgICAgICAgZGlkQmVnaW5MaW50aW5nKCkgeyB9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nKCkgeyB9LFxuICAgICAgICByZW5kZXIoKSB7fSxcbiAgICAgICAgZGlzcG9zZTogbnVsbCxcbiAgICAgIH0sIGZhbHNlLCAnVUkuZGlzcG9zZSBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6ICdTb21lJyxcbiAgICAgICAgZGlkQmVnaW5MaW50aW5nKCkgeyB9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nKCkgeyB9LFxuICAgICAgICByZW5kZXIoKSB7fSxcbiAgICAgICAgZGlzcG9zZToge30sXG4gICAgICB9LCBmYWxzZSwgJ1VJLmRpc3Bvc2UgbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICAgIHZhbGlkYXRlVUkoe1xuICAgICAgICBuYW1lOiAnU29tZScsXG4gICAgICAgIGRpZEJlZ2luTGludGluZygpIHsgfSxcbiAgICAgICAgZGlkRmluaXNoTGludGluZygpIHsgfSxcbiAgICAgICAgcmVuZGVyKCkge30sXG4gICAgICAgIGRpc3Bvc2U6IE5hTixcbiAgICAgIH0sIGZhbHNlLCAnVUkuZGlzcG9zZSBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgICAgdmFsaWRhdGVVSSh7XG4gICAgICAgIG5hbWU6ICdTb21lJyxcbiAgICAgICAgZGlkQmVnaW5MaW50aW5nKCkgeyB9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nKCkgeyB9LFxuICAgICAgICByZW5kZXIoKSB7fSxcbiAgICAgICAgZGlzcG9zZTogNSxcbiAgICAgIH0sIGZhbHNlLCAnVUkuZGlzcG9zZSBtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGNyeSBpZiBldmVyeXRoaW5nIGlzIGdvb2QnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlVUkoe1xuICAgICAgICBuYW1lOiAnU29tZScsXG4gICAgICAgIGRpZEJlZ2luTGludGluZygpIHt9LFxuICAgICAgICBkaWRGaW5pc2hMaW50aW5nKCkge30sXG4gICAgICAgIHJlbmRlcigpIHt9LFxuICAgICAgICBkaXNwb3NlKCkge30sXG4gICAgICB9LCB0cnVlKVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCc6OmxpbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlTGludGVyKGxpbnRlcjogYW55LCBleHBlY3RlZFZhbHVlOiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcgPSAnJywgdmVyc2lvbjogMSB8IDIpIHtcbiAgICAgIGV4cGVjdChWYWxpZGF0ZS5saW50ZXIobGludGVyLCB2ZXJzaW9uKSkudG9CZShleHBlY3RlZFZhbHVlKVxuICAgICAgaWYgKCFleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgIGV4cGVjdE5vdGlmaWNhdGlvbihtZXNzYWdlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGl0KCdjcmllcyBpZiBwYXJhbXMgaXMgbm90IGFuIG9iamVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVMaW50ZXIobnVsbCwgZmFsc2UsICdMaW50ZXIgbXVzdCBiZSBhbiBvYmplY3QnLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoNSwgZmFsc2UsICdMaW50ZXIgbXVzdCBiZSBhbiBvYmplY3QnLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoTmFOLCBmYWxzZSwgJ0xpbnRlciBtdXN0IGJlIGFuIG9iamVjdCcsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih1bmRlZmluZWQsIGZhbHNlLCAnTGludGVyIG11c3QgYmUgYW4gb2JqZWN0JywgMSlcbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCBjcnkgaWYgbGludGVyLm5hbWUgaXMgbm90IGEgc3RyaW5nIG9uIHYxJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIGxpbnQoKSB7fSxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbXSxcbiAgICAgIH0sIHRydWUsICcnLCAxKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIGxpbnRlci5uYW1lIGlzIG5vdCBhIHN0cmluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5uYW1lIG11c3QgYmUgYSBzdHJpbmcnLCAyKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiBOYU4sXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5uYW1lIG11c3QgYmUgYSBzdHJpbmcnLCAyKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgfSwgZmFsc2UsICdMaW50ZXIubmFtZSBtdXN0IGJlIGEgc3RyaW5nJywgMilcbiAgICAgIHZhbGlkYXRlTGludGVyKHtcbiAgICAgICAgbmFtZTogNSxcbiAgICAgIH0sIGZhbHNlLCAnTGludGVyLm5hbWUgbXVzdCBiZSBhIHN0cmluZycsIDIpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbGludGVyLnNjb3BlIGlzIG5vdCB2YWxpZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6IDUsXG4gICAgICB9LCBmYWxzZSwgXCJMaW50ZXIuc2NvcGUgbXVzdCBiZSBlaXRoZXIgJ2ZpbGUnIG9yICdwcm9qZWN0J1wiLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6IE5hTixcbiAgICAgIH0sIGZhbHNlLCBcIkxpbnRlci5zY29wZSBtdXN0IGJlIGVpdGhlciAnZmlsZScgb3IgJ3Byb2plY3QnXCIsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogbnVsbCxcbiAgICAgIH0sIGZhbHNlLCBcIkxpbnRlci5zY29wZSBtdXN0IGJlIGVpdGhlciAnZmlsZScgb3IgJ3Byb2plY3QnXCIsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogdW5kZWZpbmVkLFxuICAgICAgfSwgZmFsc2UsIFwiTGludGVyLnNjb3BlIG11c3QgYmUgZWl0aGVyICdmaWxlJyBvciAncHJvamVjdCdcIiwgMSlcbiAgICAgIHZhbGlkYXRlTGludGVyKHtcbiAgICAgICAgbmFtZTogJ0xpbnRlcicsXG4gICAgICAgIHNjb3BlOiAnc29tZXRoaW5nJyxcbiAgICAgIH0sIGZhbHNlLCBcIkxpbnRlci5zY29wZSBtdXN0IGJlIGVpdGhlciAnZmlsZScgb3IgJ3Byb2plY3QnXCIsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGVpc3RpYycsXG4gICAgICB9LCBmYWxzZSwgXCJMaW50ZXIuc2NvcGUgbXVzdCBiZSBlaXRoZXIgJ2ZpbGUnIG9yICdwcm9qZWN0J1wiLCAxKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIHYgaXMgMSBhbmQgbGludGVyLmxpbnRPbkZseSBpcyBub3QgYm9vbGVhbicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiB7fSxcbiAgICAgIH0sIGZhbHNlLCAnTGludGVyLmxpbnRPbkZseSBtdXN0IGJlIGEgYm9vbGVhbicsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICBsaW50T25GbHk6IFtdLFxuICAgICAgfSwgZmFsc2UsICdMaW50ZXIubGludE9uRmx5IG11c3QgYmUgYSBib29sZWFuJywgMSlcbiAgICAgIHZhbGlkYXRlTGludGVyKHtcbiAgICAgICAgbmFtZTogJ0xpbnRlcicsXG4gICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgIGxpbnRPbkZseTogJycsXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5saW50T25GbHkgbXVzdCBiZSBhIGJvb2xlYW4nLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5KCkge30sXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5saW50T25GbHkgbXVzdCBiZSBhIGJvb2xlYW4nLCAxKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIHYgaXMgMiBhbmQgbGludGVyLmxpbnRzT25DaGFuZ2UgaXMgbm90IGJvb2xlYW4nLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTGludGVyKHtcbiAgICAgICAgbmFtZTogJ0xpbnRlcicsXG4gICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgIGxpbnRzT25DaGFuZ2U6IHt9LFxuICAgICAgfSwgZmFsc2UsICdMaW50ZXIubGludHNPbkNoYW5nZSBtdXN0IGJlIGEgYm9vbGVhbicsIDIpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICBsaW50c09uQ2hhbmdlOiBbXSxcbiAgICAgIH0sIGZhbHNlLCAnTGludGVyLmxpbnRzT25DaGFuZ2UgbXVzdCBiZSBhIGJvb2xlYW4nLCAyKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludHNPbkNoYW5nZTogJycsXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5saW50c09uQ2hhbmdlIG11c3QgYmUgYSBib29sZWFuJywgMilcbiAgICAgIHZhbGlkYXRlTGludGVyKHtcbiAgICAgICAgbmFtZTogJ0xpbnRlcicsXG4gICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgIGxpbnRzT25DaGFuZ2UoKSB7fSxcbiAgICAgIH0sIGZhbHNlLCAnTGludGVyLmxpbnRzT25DaGFuZ2UgbXVzdCBiZSBhIGJvb2xlYW4nLCAyKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIGxpbnRlci5ncmFtbWFyU2NvcGVzIGlzIG5vdCBhbiBhcnJheScsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogdW5kZWZpbmVkLFxuICAgICAgfSwgZmFsc2UsICdMaW50ZXIuZ3JhbW1hclNjb3BlcyBtdXN0IGJlIGFuIEFycmF5JywgMSlcbiAgICAgIHZhbGlkYXRlTGludGVyKHtcbiAgICAgICAgbmFtZTogJ0xpbnRlcicsXG4gICAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICAgIGxpbnRPbkZseTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IG51bGwsXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5ncmFtbWFyU2NvcGVzIG11c3QgYmUgYW4gQXJyYXknLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogNSxcbiAgICAgIH0sIGZhbHNlLCAnTGludGVyLmdyYW1tYXJTY29wZXMgbXVzdCBiZSBhbiBBcnJheScsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICBsaW50T25GbHk6IGZhbHNlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBOYU4sXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5ncmFtbWFyU2NvcGVzIG11c3QgYmUgYW4gQXJyYXknLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3Blczoge30sXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5ncmFtbWFyU2NvcGVzIG11c3QgYmUgYW4gQXJyYXknLCAxKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIGxpbnRlci5saW50IGlzIG5vdCBhIGZ1bmN0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICBsaW50T25GbHk6IGZhbHNlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgICAgICBsaW50OiB1bmRlZmluZWQsXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5saW50IG11c3QgYmUgYSBmdW5jdGlvbicsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICBsaW50T25GbHk6IGZhbHNlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgICAgICBsaW50OiA1LFxuICAgICAgfSwgZmFsc2UsICdMaW50ZXIubGludCBtdXN0IGJlIGEgZnVuY3Rpb24nLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICAgICAgbGludDogTmFOLFxuICAgICAgfSwgZmFsc2UsICdMaW50ZXIubGludCBtdXN0IGJlIGEgZnVuY3Rpb24nLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICAgICAgbGludDoge30sXG4gICAgICB9LCBmYWxzZSwgJ0xpbnRlci5saW50IG11c3QgYmUgYSBmdW5jdGlvbicsIDEpXG4gICAgICB2YWxpZGF0ZUxpbnRlcih7XG4gICAgICAgIG5hbWU6ICdMaW50ZXInLFxuICAgICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgICBsaW50T25GbHk6IGZhbHNlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgICAgICBsaW50OiAnc29tZXRoaW5nJyxcbiAgICAgIH0sIGZhbHNlLCAnTGludGVyLmxpbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJywgMSlcbiAgICB9KVxuICAgIGl0KCdkb2VzIG5vdCBjcnkgaWYgZXZlcnl0aGluZyBpcyB2YWxpZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICAgICAgbGludCgpIHsgfSxcbiAgICAgIH0sIHRydWUsICcnLCAxKVxuICAgICAgdmFsaWRhdGVMaW50ZXIoe1xuICAgICAgICBuYW1lOiAnTGludGVyJyxcbiAgICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgICAgbGludHNPbkNoYW5nZTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzJ10sXG4gICAgICAgIGxpbnQoKSB7IH0sXG4gICAgICB9LCB0cnVlLCAnJywgMilcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnOjppbmRpZScsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlSW5kaWUobGludGVyOiBhbnksIGV4cGVjdGVkVmFsdWU6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZyA9ICcnKSB7XG4gICAgICBleHBlY3QoVmFsaWRhdGUuaW5kaWUobGludGVyKSkudG9CZShleHBlY3RlZFZhbHVlKVxuICAgICAgaWYgKCFleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgIGV4cGVjdE5vdGlmaWNhdGlvbihtZXNzYWdlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGl0KCdjcmllcyBpZiBwYXJhbXMgaXMgbm90IGFuIG9iamVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVJbmRpZShudWxsLCBmYWxzZSwgJ0luZGllIG11c3QgYmUgYW4gb2JqZWN0JylcbiAgICAgIHZhbGlkYXRlSW5kaWUoNSwgZmFsc2UsICdJbmRpZSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgICB2YWxpZGF0ZUluZGllKE5hTiwgZmFsc2UsICdJbmRpZSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgICB2YWxpZGF0ZUluZGllKHVuZGVmaW5lZCwgZmFsc2UsICdJbmRpZSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgaW5kaWUubmFtZSBpcyBub3QgYSBzdHJpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlSW5kaWUoe1xuICAgICAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgICB9LCBmYWxzZSwgJ0luZGllLm5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZUluZGllKHtcbiAgICAgICAgbmFtZTogNSxcbiAgICAgIH0sIGZhbHNlLCAnSW5kaWUubmFtZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlSW5kaWUoe1xuICAgICAgICBuYW1lOiB7fSxcbiAgICAgIH0sIGZhbHNlLCAnSW5kaWUubmFtZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlSW5kaWUoe1xuICAgICAgICBuYW1lOiBOYU4sXG4gICAgICB9LCBmYWxzZSwgJ0luZGllLm5hbWUgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgY3J5IGlmIGV2ZXJ5dGhpbmcgaXMgdmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlSW5kaWUoe1xuICAgICAgICBuYW1lOiAnSW5kaWUnLFxuICAgICAgfSwgdHJ1ZSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnOjptZXNzYWdlcycsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlTWVzc2FnZXMobGludGVyOiBhbnksIGV4cGVjdGVkVmFsdWU6IGJvb2xlYW4sIG1lc3NhZ2U6IHN0cmluZyA9ICcnKSB7XG4gICAgICBleHBlY3QoVmFsaWRhdGUubWVzc2FnZXMoJ1NvbWUgTGludGVyJywgbGludGVyKSkudG9CZShleHBlY3RlZFZhbHVlKVxuICAgICAgaWYgKCFleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgIGV4cGVjdE5vdGlmaWNhdGlvbihtZXNzYWdlKVxuICAgICAgfVxuICAgIH1cblxuICAgIGl0KCdjcmllcyBpZiByZXN1bHRzIGFyZSBub3QgYXJyYXknLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXModW5kZWZpbmVkLCBmYWxzZSwgJ0xpbnRlciBSZXN1bHQgbXVzdCBiZSBhbiBBcnJheScpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKHt9LCBmYWxzZSwgJ0xpbnRlciBSZXN1bHQgbXVzdCBiZSBhbiBBcnJheScpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKDUsIGZhbHNlLCAnTGludGVyIFJlc3VsdCBtdXN0IGJlIGFuIEFycmF5JylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoTmFOLCBmYWxzZSwgJ0xpbnRlciBSZXN1bHQgbXVzdCBiZSBhbiBBcnJheScpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbWVzc2FnZS5pY29uIGlzIHByZXNlbnQgYW5kIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgaWNvbjogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuaWNvbiBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgaWNvbjoge30sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmljb24gbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGljb24oKSB7fSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuaWNvbiBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLmxvY2F0aW9uIGlzIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IDUsXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmxvY2F0aW9uIG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogTmFOLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbiBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHt9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbiBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbiBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IDUgfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UubG9jYXRpb24gbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBudWxsIH0sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmxvY2F0aW9uIG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogJycgfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UubG9jYXRpb24gbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBOYU4gfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UubG9jYXRpb24gbXVzdCBiZSB2YWxpZCcpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbWVzc2FnZS5sb2NhdGlvbiBjb250YWlucyBOYU4nLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbTmFOLCBOYU5dLCBbTmFOLCBOYU5dXSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCBOYU5dXSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFtOYU4sIDBdXSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgTmFOXSwgWzAsIDBdXSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbTmFOLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLnNvbHV0aW9ucyBpcyBwcmVzZW50IGFuZCBpcyBub3QgYXJyYXknLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgc29sdXRpb25zOiB7fSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2Uuc29sdXRpb25zIG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICBzb2x1dGlvbnM6ICdhc2RzYWQnLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5zb2x1dGlvbnMgbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIHNvbHV0aW9uczogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2Uuc29sdXRpb25zIG11c3QgYmUgdmFsaWQnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIG1lc3NhZ2UucmVmZXJlbmNlIGlzIHByZXNlbnQgYW5kIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgcmVmZXJlbmNlOiA1LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yZWZlcmVuY2UgbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIHJlZmVyZW5jZToge30sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnJlZmVyZW5jZSBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgcmVmZXJlbmNlOiAnYXNkYXNkJyxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UucmVmZXJlbmNlIG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICByZWZlcmVuY2U6IHsgZmlsZTogX19maWxlbmFtZSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yZWZlcmVuY2UgbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIHJlZmVyZW5jZTogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogNSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yZWZlcmVuY2UgbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIHJlZmVyZW5jZTogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogTmFOIH0sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnJlZmVyZW5jZSBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgcmVmZXJlbmNlOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBudWxsIH0sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnJlZmVyZW5jZSBtdXN0IGJlIHZhbGlkJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLnJlZmVyZW5jZSBjb250YWlucyBOYU4nLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgcmVmZXJlbmNlOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbTmFOLCA1XSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yZWZlcmVuY2UucG9zaXRpb24gc2hvdWxkIG5vdCBjb250YWluIE5hTiBjb29yZGluYXRlcycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIHJlZmVyZW5jZTogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogWzUsIE5hTl0gfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uIHNob3VsZCBub3QgY29udGFpbiBOYU4gY29vcmRpbmF0ZXMnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICByZWZlcmVuY2U6IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtOYU4sIE5hTl0gfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uIHNob3VsZCBub3QgY29udGFpbiBOYU4gY29vcmRpbmF0ZXMnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIG1lc3NhZ2UuZXhjZXJwdCBpcyBub3Qgc3RyaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6IHVuZGVmaW5lZCxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZXhjZXJwdCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDoge30sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmV4Y2VycHQgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6IG51bGwsXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmV4Y2VycHQgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6IE5hTixcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZXhjZXJwdCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZXhjZXJwdCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLnNldmVyaXR5IGlzIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogJycsXG4gICAgICAgIHNldmVyaXR5OiAnJyxcbiAgICAgIH1dLCBmYWxzZSwgXCJNZXNzYWdlLnNldmVyaXR5IG11c3QgYmUgJ2Vycm9yJywgJ3dhcm5pbmcnIG9yICdpbmZvJ1wiKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICBleGNlcnB0OiAnJyxcbiAgICAgICAgc2V2ZXJpdHk6IE5hTixcbiAgICAgIH1dLCBmYWxzZSwgXCJNZXNzYWdlLnNldmVyaXR5IG11c3QgYmUgJ2Vycm9yJywgJ3dhcm5pbmcnIG9yICdpbmZvJ1wiKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICBleGNlcnB0OiAnJyxcbiAgICAgICAgc2V2ZXJpdHk6IDUsXG4gICAgICB9XSwgZmFsc2UsIFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogJycsXG4gICAgICAgIHNldmVyaXR5OiB7fSxcbiAgICAgIH1dLCBmYWxzZSwgXCJNZXNzYWdlLnNldmVyaXR5IG11c3QgYmUgJ2Vycm9yJywgJ3dhcm5pbmcnIG9yICdpbmZvJ1wiKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICBleGNlcnB0OiAnJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcmlzaCcsXG4gICAgICB9XSwgZmFsc2UsIFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogJycsXG4gICAgICAgIHNldmVyaXR5OiAnd2FybmluZ2lzaCcsXG4gICAgICB9XSwgZmFsc2UsIFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLnVybCBpcyBwcmVzZW50IGFuZCBpcyBub3Qgc3RyaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6ICcnLFxuICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgdXJsOiA1LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS51cmwgbXVzdCBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6ICcnLFxuICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgdXJsOiB7fSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UudXJsIG11c3QgYSBzdHJpbmcnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIG1lc3NhZ2UuZGVzY3JpcHRpb24gaXMgcHJlc2VudCBhbmQgaXMgaW52YWxpZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICBleGNlcnB0OiAnJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiA1LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5kZXNjcmlwdGlvbiBtdXN0IGJlIGEgZnVuY3Rpb24gb3Igc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogJycsXG4gICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICBkZXNjcmlwdGlvbjoge30sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmRlc2NyaXB0aW9uIG11c3QgYmUgYSBmdW5jdGlvbiBvciBzdHJpbmcnKVxuICAgIH0pXG4gICAgaXQoJ2RvZXMgbm90IGNyeSBpZiBwcm92aWRlZCB3aXRoIHZhbGlkIHZhbHVlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVNZXNzYWdlcyhbe1xuICAgICAgICBsb2NhdGlvbjogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogW1swLCAwXSwgWzAsIDBdXSB9LFxuICAgICAgICBleGNlcnB0OiAnJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICB9XSwgdHJ1ZSlcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogJycsXG4gICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICBzb2x1dGlvbnM6IFtdLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIHJlZmVyZW5jZTogeyBmaWxlOiBfX2ZpbGVuYW1lLCBwb3NpdGlvbjogWzAsIDBdIH0sXG4gICAgICAgIGV4Y2VycHQ6ICcnLFxuICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6ICcnLFxuICAgICAgICB1cmw6ICdzb21ldGhpbmcnLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzKFt7XG4gICAgICAgIGxvY2F0aW9uOiB7IGZpbGU6IF9fZmlsZW5hbWUsIHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dIH0sXG4gICAgICAgIGV4Y2VycHQ6ICcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ3NvbWV0aGluZycsXG4gICAgICAgIHNldmVyaXR5OiAnd2FybmluZycsXG4gICAgICB9XSwgdHJ1ZSlcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXMoW3tcbiAgICAgICAgbG9jYXRpb246IHsgZmlsZTogX19maWxlbmFtZSwgcG9zaXRpb246IFtbMCwgMF0sIFswLCAwXV0gfSxcbiAgICAgICAgZXhjZXJwdDogJycsXG4gICAgICAgIGRlc2NyaXB0aW9uKCkgeyB9LFxuICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgfV0sIHRydWUpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJzo6bWVzc2FnZXNMZWdhY3knLCBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KGxpbnRlcjogYW55LCBleHBlY3RlZFZhbHVlOiBib29sZWFuLCBtZXNzYWdlOiBzdHJpbmcgPSAnJykge1xuICAgICAgZXhwZWN0KFZhbGlkYXRlLm1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIGxpbnRlcikpLnRvQmUoZXhwZWN0ZWRWYWx1ZSlcbiAgICAgIGlmICghZXhwZWN0ZWRWYWx1ZSkge1xuICAgICAgICBleHBlY3ROb3RpZmljYXRpb24obWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpdCgnY3JpZXMgaWYgcmVzdWx0cyBhcmUgbm90IGFycmF5JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KHVuZGVmaW5lZCwgZmFsc2UsICdMaW50ZXIgUmVzdWx0IG11c3QgYmUgYW4gQXJyYXknKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeSh7fSwgZmFsc2UsICdMaW50ZXIgUmVzdWx0IG11c3QgYmUgYW4gQXJyYXknKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeSg1LCBmYWxzZSwgJ0xpbnRlciBSZXN1bHQgbXVzdCBiZSBhbiBBcnJheScpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KE5hTiwgZmFsc2UsICdMaW50ZXIgUmVzdWx0IG11c3QgYmUgYW4gQXJyYXknKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIG1lc3NhZ2UudHlwZSBpcyBpbnZhbGlkJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6IHVuZGVmaW5lZCxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UudHlwZSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogTmFOLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS50eXBlIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiA1LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS50eXBlIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiBudWxsLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS50eXBlIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIG1lc3NhZ2UudGV4dCBhbmQgbWVzc2FnZS5odG1sIGFyZSBpbnZhbGlkJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnRleHQgb3IgTWVzc2FnZS5odG1sIG11c3QgaGF2ZSBhIHZhbGlkIHZhbHVlJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgaHRtbDoge30sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnRleHQgb3IgTWVzc2FnZS5odG1sIG11c3QgaGF2ZSBhIHZhbGlkIHZhbHVlJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgaHRtbDogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UudGV4dCBvciBNZXNzYWdlLmh0bWwgbXVzdCBoYXZlIGEgdmFsaWQgdmFsdWUnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICBodG1sOiBOYU4sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnRleHQgb3IgTWVzc2FnZS5odG1sIG11c3QgaGF2ZSBhIHZhbGlkIHZhbHVlJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UudGV4dCBvciBNZXNzYWdlLmh0bWwgbXVzdCBoYXZlIGEgdmFsaWQgdmFsdWUnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiB7fSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UudGV4dCBvciBNZXNzYWdlLmh0bWwgbXVzdCBoYXZlIGEgdmFsaWQgdmFsdWUnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiBOYU4sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLnRleHQgb3IgTWVzc2FnZS5odG1sIG11c3QgaGF2ZSBhIHZhbGlkIHZhbHVlJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLmZpbGVQYXRoIGlzIHByZXNlbnQgYW5kIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBmaWxlUGF0aDogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZmlsZVBhdGggbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgZmlsZVBhdGg6IHt9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5maWxlUGF0aCBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBmaWxlUGF0aCgpIHsgfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZmlsZVBhdGggbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbWVzc2FnZS5yYW5nZSBpcyBwcmVzZW50IGFuZCBpbnZhbGlkJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgcmFuZ2U6ICdzb21lJyxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UucmFuZ2UgbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICAgIHJhbmdlOiA1LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yYW5nZSBtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgcmFuZ2UoKSB7fSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UucmFuZ2UgbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIH0pXG4gICAgaXQoJ2NyaWVzIGlmIG1lc3NhZ2UucmFuZ2UgaGFzIE5hTiB2YWx1ZXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICByYW5nZTogW1tOYU4sIE5hTl0sIFtOYU4sIE5hTl1dLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yYW5nZSBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICByYW5nZTogW1tOYU4sIDBdLCBbMCwgMF1dLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yYW5nZSBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICByYW5nZTogW1swLCBOYU5dLCBbMCwgMF1dLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yYW5nZSBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICByYW5nZTogW1swLCAwXSwgW05hTiwgMF1dLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yYW5nZSBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICByYW5nZTogW1swLCAwXSwgWzAsIE5hTl1dLFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5yYW5nZSBzaG91bGQgbm90IGNvbnRhaW4gTmFOIGNvb3JkaW5hdGVzJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLmNsYXNzIGlzIHByZXNlbnQgYW5kIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBjbGFzczogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuY2xhc3MgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgY2xhc3M6IHt9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5jbGFzcyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBjbGFzcygpIHt9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5jbGFzcyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdjcmllcyBpZiBtZXNzYWdlLnNldmVyaXR5IGlzIHByZXNlbnQgYW5kIGludmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBzZXZlcml0eToge30sXG4gICAgICB9XSwgZmFsc2UsIFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBzZXZlcml0eTogW10sXG4gICAgICB9XSwgZmFsc2UsIFwiTWVzc2FnZS5zZXZlcml0eSBtdXN0IGJlICdlcnJvcicsICd3YXJuaW5nJyBvciAnaW5mbydcIilcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBzZXZlcml0eSgpIHt9LFxuICAgICAgfV0sIGZhbHNlLCBcIk1lc3NhZ2Uuc2V2ZXJpdHkgbXVzdCBiZSAnZXJyb3InLCAnd2FybmluZycgb3IgJ2luZm8nXCIpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvci1pc2gnLFxuICAgICAgfV0sIGZhbHNlLCBcIk1lc3NhZ2Uuc2V2ZXJpdHkgbXVzdCBiZSAnZXJyb3InLCAnd2FybmluZycgb3IgJ2luZm8nXCIpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbWVzc2FnZS50cmFjZSBpcyBwcmVzZW50IGFuZCBpbnZhbGlkJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgdHJhY2U6IHt9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS50cmFjZSBtdXN0IGJlIGFuIEFycmF5JylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICB0cmFjZSgpIHt9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS50cmFjZSBtdXN0IGJlIGFuIEFycmF5JylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICB0cmFjZTogNSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UudHJhY2UgbXVzdCBiZSBhbiBBcnJheScpXG4gICAgfSlcbiAgICBpdCgnY3JpZXMgaWYgbWVzc2FnZS5maXggaXMgcHJlc2VudCBhbmQgaW52YWxpZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICAgIGZpeDoge30sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmZpeCBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBmaXg6IDUsXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmZpeCBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBmaXgoKSB7fSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZml4IG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICAgIGZpeDogeyByYW5nZTogNSwgbmV3VGV4dDogJ3NvbWUnLCBvbGRUZXh0OiAnc29tZScgfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZml4IG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICAgIGZpeDogeyByYW5nZTogTmFOLCBuZXdUZXh0OiAnc29tZScsIG9sZFRleHQ6ICdzb21lJyB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5maXggbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgZml4OiB7IHJhbmdlOiB1bmRlZmluZWQsIG5ld1RleHQ6ICdzb21lJywgb2xkVGV4dDogJ3NvbWUnIH0sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmZpeCBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBmaXg6IHsgcmFuZ2U6IFtbMCwgMF0sIFswLCAwXV0sIG5ld1RleHQ6IDUsIG9sZFRleHQ6ICdzb21lJyB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5maXggbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgZml4OiB7IHJhbmdlOiBbWzAsIDBdLCBbMCwgMF1dLCBuZXdUZXh0OiB7fSwgb2xkVGV4dDogJ3NvbWUnIH0sXG4gICAgICB9XSwgZmFsc2UsICdNZXNzYWdlLmZpeCBtdXN0IGJlIHZhbGlkJylcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBmaXg6IHsgcmFuZ2U6IFtbMCwgMF0sIFswLCAwXV0sIG5ld1RleHQoKSB7IH0sIG9sZFRleHQ6ICdzb21lJyB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5maXggbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgZml4OiB7IHJhbmdlOiBbWzAsIDBdLCBbMCwgMF1dLCBuZXdUZXh0OiAnc29tZScsIG9sZFRleHQ6IDUgfSxcbiAgICAgIH1dLCBmYWxzZSwgJ01lc3NhZ2UuZml4IG11c3QgYmUgdmFsaWQnKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICAgIGZpeDogeyByYW5nZTogW1swLCAwXSwgWzAsIDBdXSwgbmV3VGV4dDogJ3NvbWUnLCBvbGRUZXh0OiB7fSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5maXggbXVzdCBiZSB2YWxpZCcpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgZml4OiB7IHJhbmdlOiBbWzAsIDBdLCBbMCwgMF1dLCBuZXdUZXh0OiAnc29tZScsIG9sZFRleHQoKSB7fSB9LFxuICAgICAgfV0sIGZhbHNlLCAnTWVzc2FnZS5maXggbXVzdCBiZSB2YWxpZCcpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgY3J5IGlmIHRoZSBvYmplY3QgaXMgdmFsaWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgZmlsZVBhdGg6ICdzb21lJyxcbiAgICAgIH1dLCB0cnVlKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICB9XSwgdHJ1ZSlcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgaHRtbDogJ1NvbWUnLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIGh0bWw6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgcmFuZ2U6IFtbMCwgMF0sIFswLCAwXV0sXG4gICAgICB9XSwgdHJ1ZSlcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBjbGFzczogJ3NvbWUnLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgc2V2ZXJpdHk6ICdlcnJvcicsXG4gICAgICB9XSwgdHJ1ZSlcbiAgICAgIHZhbGlkYXRlTWVzc2FnZXNMZWdhY3koW3tcbiAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgdGV4dDogJ3NvbWUnLFxuICAgICAgICBzZXZlcml0eTogJ2luZm8nLFxuICAgICAgfV0sIHRydWUpXG4gICAgICB2YWxpZGF0ZU1lc3NhZ2VzTGVnYWN5KFt7XG4gICAgICAgIHR5cGU6ICdFcnJvcicsXG4gICAgICAgIHRleHQ6ICdzb21lJyxcbiAgICAgICAgc2V2ZXJpdHk6ICd3YXJuaW5nJyxcbiAgICAgIH1dLCB0cnVlKVxuICAgICAgdmFsaWRhdGVNZXNzYWdlc0xlZ2FjeShbe1xuICAgICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgICB0ZXh0OiAnc29tZScsXG4gICAgICAgIHRyYWNlOiBbXSxcbiAgICAgIH1dLCB0cnVlKVxuICAgIH0pXG4gIH0pXG59KVxuIl19