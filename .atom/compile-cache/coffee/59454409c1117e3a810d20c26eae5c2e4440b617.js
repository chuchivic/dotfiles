(function() {
  var $, FOOTNOTE_REGEX, FOOTNOTE_TEST_REGEX, IMG_EXTENSIONS, IMG_OR_TEXT, IMG_REGEX, IMG_TAG_ATTRIBUTE, IMG_TAG_REGEX, INLINE_LINK_REGEX, INLINE_LINK_TEST_REGEX, LINK_ID, OPEN_TAG, REFERENCE_DEF_REGEX, REFERENCE_DEF_REGEX_OF, REFERENCE_LINK_REGEX, REFERENCE_LINK_REGEX_OF, REFERENCE_LINK_TEST_REGEX, SLUGIZE_CONTROL_REGEX, SLUGIZE_SPECIAL_REGEX, TABLE_ONE_COLUMN_ROW_REGEX, TABLE_ONE_COLUMN_SEPARATOR_REGEX, TABLE_ROW_REGEX, TABLE_SEPARATOR_REGEX, TEMPLATE_REGEX, UNTEMPLATE_REGEX, URL_AND_TITLE, URL_REGEX, cleanDiacritics, createTableRow, createTableSeparator, createUntemplateMatcher, escapeRegExp, findLinkInRange, getAbsolutePath, getBufferRangeForScope, getDate, getHomedir, getJSON, getPackagePath, getProjectPath, getScopeDescriptor, getSitePath, getTextBufferRange, incrementChars, isFootnote, isImage, isImageFile, isImageTag, isInlineLink, isReferenceDefinition, isReferenceLink, isTableRow, isTableSeparator, isUpperCase, isUrl, normalizeFilePath, os, parseDate, parseFootnote, parseImage, parseImageTag, parseInlineLink, parseReferenceDefinition, parseReferenceLink, parseTableRow, parseTableSeparator, path, setTabIndex, slugize, template, untemplate, wcswidth,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = require("atom-space-pen-views").$;

  os = require("os");

  path = require("path");

  wcswidth = require("wcwidth");

  getJSON = function(uri, succeed, error) {
    if (uri.length === 0) {
      return error();
    }
    return $.getJSON(uri).done(succeed).fail(error);
  };

  escapeRegExp = function(str) {
    if (!str) {
      return "";
    }
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  isUpperCase = function(str) {
    if (str.length > 0) {
      return str[0] >= 'A' && str[0] <= 'Z';
    } else {
      return false;
    }
  };

  incrementChars = function(str) {
    var carry, chars, index, lowerCase, nextCharCode, upperCase;
    if (str.length < 1) {
      return "a";
    }
    upperCase = isUpperCase(str);
    if (upperCase) {
      str = str.toLowerCase();
    }
    chars = str.split("");
    carry = 1;
    index = chars.length - 1;
    while (carry !== 0 && index >= 0) {
      nextCharCode = chars[index].charCodeAt() + carry;
      if (nextCharCode > "z".charCodeAt()) {
        chars[index] = "a";
        index -= 1;
        carry = 1;
        lowerCase = 1;
      } else {
        chars[index] = String.fromCharCode(nextCharCode);
        carry = 0;
      }
    }
    if (carry === 1) {
      chars.unshift("a");
    }
    str = chars.join("");
    if (upperCase) {
      return str.toUpperCase();
    } else {
      return str;
    }
  };

  cleanDiacritics = function(str) {
    var from, to;
    if (!str) {
      return "";
    }
    from = "ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșšŝťțŭùúüűûñÿýçżźž";
    to = "aaaaaaaaaccceeeeeghiiiijllnnoooooooossssttuuuuuunyyczzz";
    from += from.toUpperCase();
    to += to.toUpperCase();
    to = to.split("");
    from += "ß";
    to.push('ss');
    return str.replace(/.{1}/g, function(c) {
      var index;
      index = from.indexOf(c);
      if (index === -1) {
        return c;
      } else {
        return to[index];
      }
    });
  };

  SLUGIZE_CONTROL_REGEX = /[\u0000-\u001f]/g;

  SLUGIZE_SPECIAL_REGEX = /[\s~`!@#\$%\^&\*\(\)\-_\+=\[\]\{\}\|\\;:"'<>,\.\?\/]+/g;

  slugize = function(str, separator) {
    var escapedSep;
    if (separator == null) {
      separator = '-';
    }
    if (!str) {
      return "";
    }
    escapedSep = escapeRegExp(separator);
    return cleanDiacritics(str).trim().toLowerCase().replace(SLUGIZE_CONTROL_REGEX, '').replace(SLUGIZE_SPECIAL_REGEX, separator).replace(new RegExp(escapedSep + '{2,}', 'g'), separator).replace(new RegExp('^' + escapedSep + '+|' + escapedSep + '+$', 'g'), '');
  };

  getPackagePath = function() {
    var segments;
    segments = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    segments.unshift(atom.packages.resolvePackagePath("markdown-writer"));
    return path.join.apply(null, segments);
  };

  getProjectPath = function() {
    var paths;
    paths = atom.project.getPaths();
    if (paths && paths.length > 0) {
      return paths[0];
    } else {
      return atom.config.get("core.projectHome");
    }
  };

  getSitePath = function(configPath) {
    return getAbsolutePath(configPath || getProjectPath());
  };

  getHomedir = function() {
    var env, home, user;
    if (typeof os.homedir === "function") {
      return os.homedir();
    }
    env = process.env;
    home = env.HOME;
    user = env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
    if (process.platform === "win32") {
      return env.USERPROFILE || env.HOMEDRIVE + env.HOMEPATH || home;
    } else if (process.platform === "darwin") {
      return home || (user ? "/Users/" + user : void 0);
    } else if (process.platform === "linux") {
      return home || (process.getuid() === 0 ? "/root" : void 0) || (user ? "/home/" + user : void 0);
    } else {
      return home;
    }
  };

  getAbsolutePath = function(path) {
    var home;
    home = getHomedir();
    if (home) {
      return path.replace(/^~($|\/|\\)/, home + '$1');
    } else {
      return path;
    }
  };

  setTabIndex = function(elems) {
    var elem, i, j, len1, results1;
    results1 = [];
    for (i = j = 0, len1 = elems.length; j < len1; i = ++j) {
      elem = elems[i];
      results1.push(elem[0].tabIndex = i + 1);
    }
    return results1;
  };

  TEMPLATE_REGEX = /[\<\{]([\w\.\-]+?)[\>\}]/g;

  UNTEMPLATE_REGEX = /(?:\<|\\\{)([\w\.\-]+?)(?:\>|\\\})/g;

  template = function(text, data, matcher) {
    if (matcher == null) {
      matcher = TEMPLATE_REGEX;
    }
    return text.replace(matcher, function(match, attr) {
      if (data[attr] != null) {
        return data[attr];
      } else {
        return match;
      }
    });
  };

  untemplate = function(text, matcher) {
    var keys;
    if (matcher == null) {
      matcher = UNTEMPLATE_REGEX;
    }
    keys = [];
    text = escapeRegExp(text).replace(matcher, function(match, attr) {
      keys.push(attr);
      if (["year"].indexOf(attr) !== -1) {
        return "(\\d{4})";
      } else if (["month", "day", "hour", "minute", "second"].indexOf(attr) !== -1) {
        return "(\\d{2})";
      } else if (["i_month", "i_day", "i_hour", "i_minute", "i_second"].indexOf(attr) !== -1) {
        return "(\\d{1,2})";
      } else if (["extension"].indexOf(attr) !== -1) {
        return "(\\.\\w+)";
      } else {
        return "([\\s\\S]+)";
      }
    });
    return createUntemplateMatcher(keys, RegExp("^" + text + "$"));
  };

  createUntemplateMatcher = function(keys, regex) {
    return function(str) {
      var matches, results;
      if (!str) {
        return;
      }
      matches = regex.exec(str);
      if (!matches) {
        return;
      }
      results = {
        "_": matches[0]
      };
      keys.forEach(function(key, idx) {
        return results[key] = matches[idx + 1];
      });
      return results;
    };
  };

  parseDate = function(hash) {
    var date, key, map, value, values;
    date = new Date();
    map = {
      setYear: ["year"],
      setMonth: ["month", "i_month"],
      setDate: ["day", "i_day"],
      setHours: ["hour", "i_hour"],
      setMinutes: ["minute", "i_minute"],
      setSeconds: ["second", "i_second"]
    };
    for (key in map) {
      values = map[key];
      value = values.find(function(val) {
        return !!hash[val];
      });
      if (value) {
        value = parseInt(hash[value], 10);
        if (key === 'setMonth') {
          value = value - 1;
        }
        date[key](value);
      }
    }
    return getDate(date);
  };

  getDate = function(date) {
    if (date == null) {
      date = new Date();
    }
    return {
      year: "" + date.getFullYear(),
      month: ("0" + (date.getMonth() + 1)).slice(-2),
      day: ("0" + date.getDate()).slice(-2),
      hour: ("0" + date.getHours()).slice(-2),
      minute: ("0" + date.getMinutes()).slice(-2),
      second: ("0" + date.getSeconds()).slice(-2),
      i_month: "" + (date.getMonth() + 1),
      i_day: "" + date.getDate(),
      i_hour: "" + date.getHours(),
      i_minute: "" + date.getMinutes(),
      i_second: "" + date.getSeconds()
    };
  };

  IMG_TAG_REGEX = /<img(.*?)\/?>/i;

  IMG_TAG_ATTRIBUTE = /([a-z]+?)=('|")(.*?)\2/ig;

  isImageTag = function(input) {
    return IMG_TAG_REGEX.test(input);
  };

  parseImageTag = function(input) {
    var attributes, img, pattern;
    img = {};
    attributes = IMG_TAG_REGEX.exec(input)[1].match(IMG_TAG_ATTRIBUTE);
    pattern = RegExp("" + IMG_TAG_ATTRIBUTE.source, "i");
    attributes.forEach(function(attr) {
      var elem;
      elem = pattern.exec(attr);
      if (elem) {
        return img[elem[1]] = elem[3];
      }
    });
    return img;
  };

  URL_AND_TITLE = /(\S*?)(?: +["'\\(]?(.*?)["'\\)]?)?/.source;

  IMG_OR_TEXT = /(!\[.*?\]\(.+?\)|[^\[]+?)/.source;

  OPEN_TAG = /(?:^|[^!])(?=\[)/.source;

  LINK_ID = /[^\[\]]+/.source;

  IMG_REGEX = RegExp("!\\[(.*?)\\]\\(" + URL_AND_TITLE + "\\)");

  isImage = function(input) {
    return IMG_REGEX.test(input);
  };

  parseImage = function(input) {
    var image;
    image = IMG_REGEX.exec(input);
    if (image && image.length >= 2) {
      return {
        alt: image[1],
        src: image[2],
        title: image[3] || ""
      };
    } else {
      return {
        alt: input,
        src: "",
        title: ""
      };
    }
  };

  IMG_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".ico"];

  isImageFile = function(file) {
    var ref;
    return file && (ref = path.extname(file).toLowerCase(), indexOf.call(IMG_EXTENSIONS, ref) >= 0);
  };

  INLINE_LINK_REGEX = RegExp("\\[" + IMG_OR_TEXT + "\\]\\(" + URL_AND_TITLE + "\\)");

  INLINE_LINK_TEST_REGEX = RegExp("" + OPEN_TAG + INLINE_LINK_REGEX.source);

  isInlineLink = function(input) {
    return INLINE_LINK_TEST_REGEX.test(input);
  };

  parseInlineLink = function(input) {
    var link;
    link = INLINE_LINK_REGEX.exec(input);
    if (link && link.length >= 2) {
      return {
        text: link[1],
        url: link[2],
        title: link[3] || ""
      };
    } else {
      return {
        text: input,
        url: "",
        title: ""
      };
    }
  };

  REFERENCE_LINK_REGEX_OF = function(id, opts) {
    if (opts == null) {
      opts = {};
    }
    if (!opts.noEscape) {
      id = escapeRegExp(id);
    }
    return RegExp("\\[(" + id + ")\\] ?\\[\\]|\\[" + IMG_OR_TEXT + "\\] ?\\[(" + id + ")\\]");
  };

  REFERENCE_DEF_REGEX_OF = function(id, opts) {
    if (opts == null) {
      opts = {};
    }
    if (!opts.noEscape) {
      id = escapeRegExp(id);
    }
    return RegExp("^ *\\[(" + id + ")\\]: +" + URL_AND_TITLE + "$", "m");
  };

  REFERENCE_LINK_REGEX = REFERENCE_LINK_REGEX_OF(LINK_ID, {
    noEscape: true
  });

  REFERENCE_LINK_TEST_REGEX = RegExp("" + OPEN_TAG + REFERENCE_LINK_REGEX.source);

  REFERENCE_DEF_REGEX = REFERENCE_DEF_REGEX_OF(LINK_ID, {
    noEscape: true
  });

  isReferenceLink = function(input) {
    return REFERENCE_LINK_TEST_REGEX.test(input);
  };

  parseReferenceLink = function(input, editor) {
    var def, id, link, text;
    link = REFERENCE_LINK_REGEX.exec(input);
    text = link[2] || link[1];
    id = link[3] || link[1];
    def = void 0;
    editor && editor.buffer.scan(REFERENCE_DEF_REGEX_OF(id), function(match) {
      return def = match;
    });
    if (def) {
      return {
        id: id,
        text: text,
        url: def.match[2],
        title: def.match[3] || "",
        definitionRange: def.range
      };
    } else {
      return {
        id: id,
        text: text,
        url: "",
        title: "",
        definitionRange: null
      };
    }
  };

  isReferenceDefinition = function(input) {
    var def;
    def = REFERENCE_DEF_REGEX.exec(input);
    return !!def && def[1][0] !== "^";
  };

  parseReferenceDefinition = function(input, editor) {
    var def, id, link;
    def = REFERENCE_DEF_REGEX.exec(input);
    id = def[1];
    link = void 0;
    editor && editor.buffer.scan(REFERENCE_LINK_REGEX_OF(id), function(match) {
      return link = match;
    });
    if (link) {
      return {
        id: id,
        text: link.match[2] || link.match[1],
        url: def[2],
        title: def[3] || "",
        linkRange: link.range
      };
    } else {
      return {
        id: id,
        text: "",
        url: def[2],
        title: def[3] || "",
        linkRange: null
      };
    }
  };

  FOOTNOTE_REGEX = /\[\^(.+?)\](:)?/;

  FOOTNOTE_TEST_REGEX = RegExp("" + OPEN_TAG + FOOTNOTE_REGEX.source);

  isFootnote = function(input) {
    return FOOTNOTE_TEST_REGEX.test(input);
  };

  parseFootnote = function(input) {
    var footnote;
    footnote = FOOTNOTE_REGEX.exec(input);
    return {
      label: footnote[1],
      isDefinition: footnote[2] === ":",
      content: ""
    };
  };

  TABLE_SEPARATOR_REGEX = /^(\|)?((?:\s*(?:-+|:-*:|:-*|-*:)\s*\|)+(?:\s*(?:-+|:-*:|:-*|-*:)\s*))(\|)?$/;

  TABLE_ONE_COLUMN_SEPARATOR_REGEX = /^(\|)(\s*:?-+:?\s*)(\|)$/;

  isTableSeparator = function(line) {
    line = line.trim();
    return TABLE_SEPARATOR_REGEX.test(line) || TABLE_ONE_COLUMN_SEPARATOR_REGEX.test(line);
  };

  parseTableSeparator = function(line) {
    var columns, matches;
    line = line.trim();
    matches = TABLE_SEPARATOR_REGEX.exec(line) || TABLE_ONE_COLUMN_SEPARATOR_REGEX.exec(line);
    columns = matches[2].split("|").map(function(col) {
      return col.trim();
    });
    return {
      separator: true,
      extraPipes: !!(matches[1] || matches[matches.length - 1]),
      columns: columns,
      columnWidths: columns.map(function(col) {
        return col.length;
      }),
      alignments: columns.map(function(col) {
        var head, tail;
        head = col[0] === ":";
        tail = col[col.length - 1] === ":";
        if (head && tail) {
          return "center";
        } else if (head) {
          return "left";
        } else if (tail) {
          return "right";
        } else {
          return "empty";
        }
      })
    };
  };

  TABLE_ROW_REGEX = /^(\|)?(.+?\|.+?)(\|)?$/;

  TABLE_ONE_COLUMN_ROW_REGEX = /^(\|)(.+?)(\|)$/;

  isTableRow = function(line) {
    line = line.trimRight();
    return TABLE_ROW_REGEX.test(line) || TABLE_ONE_COLUMN_ROW_REGEX.test(line);
  };

  parseTableRow = function(line) {
    var columns, matches;
    if (isTableSeparator(line)) {
      return parseTableSeparator(line);
    }
    line = line.trimRight();
    matches = TABLE_ROW_REGEX.exec(line) || TABLE_ONE_COLUMN_ROW_REGEX.exec(line);
    columns = matches[2].split("|").map(function(col) {
      return col.trim();
    });
    return {
      separator: false,
      extraPipes: !!(matches[1] || matches[matches.length - 1]),
      columns: columns,
      columnWidths: columns.map(function(col) {
        return wcswidth(col);
      })
    };
  };

  createTableSeparator = function(options) {
    var columnWidth, i, j, ref, row;
    if (options.columnWidths == null) {
      options.columnWidths = [];
    }
    if (options.alignments == null) {
      options.alignments = [];
    }
    row = [];
    for (i = j = 0, ref = options.numOfColumns - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      columnWidth = options.columnWidths[i] || options.columnWidth;
      if (!options.extraPipes && (i === 0 || i === options.numOfColumns - 1)) {
        columnWidth += 1;
      } else {
        columnWidth += 2;
      }
      switch (options.alignments[i] || options.alignment) {
        case "center":
          row.push(":" + "-".repeat(columnWidth - 2) + ":");
          break;
        case "left":
          row.push(":" + "-".repeat(columnWidth - 1));
          break;
        case "right":
          row.push("-".repeat(columnWidth - 1) + ":");
          break;
        default:
          row.push("-".repeat(columnWidth));
      }
    }
    row = row.join("|");
    if (options.extraPipes) {
      return "|" + row + "|";
    } else {
      return row;
    }
  };

  createTableRow = function(columns, options) {
    var columnWidth, i, j, len, ref, row;
    if (options.columnWidths == null) {
      options.columnWidths = [];
    }
    if (options.alignments == null) {
      options.alignments = [];
    }
    row = [];
    for (i = j = 0, ref = options.numOfColumns - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      columnWidth = options.columnWidths[i] || options.columnWidth;
      if (!columns[i]) {
        row.push(" ".repeat(columnWidth));
        continue;
      }
      len = columnWidth - wcswidth(columns[i]);
      if (len < 0) {
        throw new Error("Column width " + columnWidth + " - wcswidth('" + columns[i] + "') cannot be " + len);
      }
      switch (options.alignments[i] || options.alignment) {
        case "center":
          row.push(" ".repeat(len / 2) + columns[i] + " ".repeat((len + 1) / 2));
          break;
        case "left":
          row.push(columns[i] + " ".repeat(len));
          break;
        case "right":
          row.push(" ".repeat(len) + columns[i]);
          break;
        default:
          row.push(columns[i] + " ".repeat(len));
      }
    }
    row = row.join(" | ");
    if (options.extraPipes) {
      return "| " + row + " |";
    } else {
      return row;
    }
  };

  URL_REGEX = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i;

  isUrl = function(url) {
    return URL_REGEX.test(url);
  };

  normalizeFilePath = function(path) {
    return path.split(/[\\\/]/).join('/');
  };

  getScopeDescriptor = function(cursor, scopeSelector) {
    var scopes;
    scopes = cursor.getScopeDescriptor().getScopesArray().filter(function(scope) {
      return scope.indexOf(scopeSelector) >= 0;
    });
    if (scopes.indexOf(scopeSelector) >= 0) {
      return scopeSelector;
    } else if (scopes.length > 0) {
      return scopes[0];
    }
  };

  getBufferRangeForScope = function(editor, cursor, scopeSelector) {
    var pos, range;
    pos = cursor.getBufferPosition();
    range = editor.bufferRangeForScopeAtPosition(scopeSelector, pos);
    if (range) {
      return range;
    }
    if (!cursor.isAtBeginningOfLine()) {
      range = editor.bufferRangeForScopeAtPosition(scopeSelector, [pos.row, pos.column - 1]);
      if (range) {
        return range;
      }
    }
    if (!cursor.isAtEndOfLine()) {
      range = editor.bufferRangeForScopeAtPosition(scopeSelector, [pos.row, pos.column + 1]);
      if (range) {
        return range;
      }
    }
  };

  getTextBufferRange = function(editor, scopeSelector, selection, opts) {
    var cursor, scope, selectBy, wordRegex;
    if (opts == null) {
      opts = {};
    }
    if (typeof selection === "object") {
      opts = selection;
      selection = void 0;
    }
    if (selection == null) {
      selection = editor.getLastSelection();
    }
    cursor = selection.cursor;
    selectBy = opts["selectBy"] || "nearestWord";
    if (selection.getText()) {
      return selection.getBufferRange();
    } else if (scope = getScopeDescriptor(cursor, scopeSelector)) {
      return getBufferRangeForScope(editor, cursor, scope);
    } else if (selectBy === "nearestWord") {
      wordRegex = cursor.wordRegExp({
        includeNonWordCharacters: false
      });
      return cursor.getCurrentWordBufferRange({
        wordRegex: wordRegex
      });
    } else if (selectBy === "currentLine") {
      return cursor.getCurrentLineBufferRange();
    } else {
      return selection.getBufferRange();
    }
  };

  findLinkInRange = function(editor, range) {
    var link, selection;
    selection = editor.getTextInRange(range);
    if (selection === "") {
      return;
    }
    if (isUrl(selection)) {
      return {
        text: "",
        url: selection,
        title: ""
      };
    }
    if (isInlineLink(selection)) {
      return parseInlineLink(selection);
    }
    if (isReferenceLink(selection)) {
      link = parseReferenceLink(selection, editor);
      link.linkRange = range;
      return link;
    } else if (isReferenceDefinition(selection)) {
      selection = editor.lineTextForBufferRow(range.start.row);
      range = editor.bufferRangeForBufferRow(range.start.row);
      link = parseReferenceDefinition(selection, editor);
      link.definitionRange = range;
      return link;
    }
  };

  module.exports = {
    getJSON: getJSON,
    escapeRegExp: escapeRegExp,
    isUpperCase: isUpperCase,
    incrementChars: incrementChars,
    slugize: slugize,
    normalizeFilePath: normalizeFilePath,
    getPackagePath: getPackagePath,
    getProjectPath: getProjectPath,
    getSitePath: getSitePath,
    getHomedir: getHomedir,
    getAbsolutePath: getAbsolutePath,
    setTabIndex: setTabIndex,
    template: template,
    untemplate: untemplate,
    getDate: getDate,
    parseDate: parseDate,
    isImageTag: isImageTag,
    parseImageTag: parseImageTag,
    isImage: isImage,
    parseImage: parseImage,
    isInlineLink: isInlineLink,
    parseInlineLink: parseInlineLink,
    isReferenceLink: isReferenceLink,
    parseReferenceLink: parseReferenceLink,
    isReferenceDefinition: isReferenceDefinition,
    parseReferenceDefinition: parseReferenceDefinition,
    isFootnote: isFootnote,
    parseFootnote: parseFootnote,
    isTableSeparator: isTableSeparator,
    parseTableSeparator: parseTableSeparator,
    createTableSeparator: createTableSeparator,
    isTableRow: isTableRow,
    parseTableRow: parseTableRow,
    createTableRow: createTableRow,
    isUrl: isUrl,
    isImageFile: isImageFile,
    getTextBufferRange: getTextBufferRange,
    findLinkInRange: findLinkInRange
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi91dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlwQ0FBQTtJQUFBOzs7RUFBQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFDTixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsU0FBUjs7RUFNWCxPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sT0FBTixFQUFlLEtBQWY7SUFDUixJQUFrQixHQUFHLENBQUMsTUFBSixLQUFjLENBQWhDO0FBQUEsYUFBTyxLQUFBLENBQUEsRUFBUDs7V0FDQSxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsT0FBcEIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxLQUFsQztFQUZROztFQUlWLFlBQUEsR0FBZSxTQUFDLEdBQUQ7SUFDYixJQUFBLENBQWlCLEdBQWpCO0FBQUEsYUFBTyxHQUFQOztXQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksd0JBQVosRUFBc0MsTUFBdEM7RUFGYTs7RUFJZixXQUFBLEdBQWMsU0FBQyxHQUFEO0lBQ1osSUFBRyxHQUFHLENBQUMsTUFBSixHQUFhLENBQWhCO2FBQXdCLEdBQUksQ0FBQSxDQUFBLENBQUosSUFBVSxHQUFWLElBQWlCLEdBQUksQ0FBQSxDQUFBLENBQUosSUFBVSxJQUFuRDtLQUFBLE1BQUE7YUFDSyxNQURMOztFQURZOztFQUtkLGNBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsUUFBQTtJQUFBLElBQWMsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUEzQjtBQUFBLGFBQU8sSUFBUDs7SUFFQSxTQUFBLEdBQVksV0FBQSxDQUFZLEdBQVo7SUFDWixJQUEyQixTQUEzQjtNQUFBLEdB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QWtDQSxhQUFBLEVBQWUsYUFsQ2Y7SUFvQ0EsZ0JBQUEsRUFBa0IsZ0JBcENsQjtJQXFDQSxtQkFBQSxFQUFxQixtQkFyQ3JCO0lBc0NBLG9CQUFBLEVBQXNCLG9CQXRDdEI7SUF1Q0EsVUFBQSxFQUFZLFVBdkNaO0lBd0NBLGFBQUEsRUFBZSxhQXhDZjtJQXlDQSxjQUFBLEVBQWdCLGNBekNoQjtJQTJDQSxLQUFBLEVBQU8sS0EzQ1A7SUE0Q0EsV0FBQSxFQUFhLFdBNUNiO0lBOENBLGtCQUFBLEVBQW9CLGtCQTlDcEI7SUErQ0EsZUFBQSxFQUFpQixlQS9DakI7O0FBMW9CRiIsInNvdXJjZXNDb250ZW50IjpbInskfSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5vcyA9IHJlcXVpcmUgXCJvc1wiXG5wYXRoID0gcmVxdWlyZSBcInBhdGhcIlxud2Nzd2lkdGggPSByZXF1aXJlIFwid2N3aWR0aFwiXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgR2VuZXJhbCBVdGlsc1xuI1xuXG5nZXRKU09OID0gKHVyaSwgc3VjY2VlZCwgZXJyb3IpIC0+XG4gIHJldHVybiBlcnJvcigpIGlmIHVyaS5sZW5ndGggPT0gMFxuICAkLmdldEpTT04odXJpKS5kb25lKHN1Y2NlZWQpLmZhaWwoZXJyb3IpXG5cbmVzY2FwZVJlZ0V4cCA9IChzdHIpIC0+XG4gIHJldHVybiBcIlwiIHVubGVzcyBzdHJcbiAgc3RyLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIilcblxuaXNVcHBlckNhc2UgPSAoc3RyKSAtPlxuICBpZiBzdHIubGVuZ3RoID4gMCB0aGVuIChzdHJbMF0gPj0gJ0EnICYmIHN0clswXSA8PSAnWicpXG4gIGVsc2UgZmFsc2VcblxuIyBpbmNyZW1lbnQgdGhlIGNoYXJzOiBhIC0+IGIsIHogLT4gYWEsIGF6IC0+IGJhXG5pbmNyZW1lbnRDaGFycyA9IChzdHIpIC0+XG4gIHJldHVybiBcImFcIiBpZiBzdHIubGVuZ3RoIDwgMVxuXG4gIHVwcGVyQ2FzZSA9IGlzVXBwZXJDYXNlKHN0cilcbiAgc3RyID0gc3RyLnRvTG93ZXJDYXNlKCkgaWYgdXBwZXJDYXNlXG5cbiAgY2hhcnMgPSBzdHIuc3BsaXQoXCJcIilcbiAgY2FycnkgPSAxXG4gIGluZGV4ID0gY2hhcnMubGVuZ3RoIC0gMVxuXG4gIHdoaWxlIGNhcnJ5ICE9IDAgJiYgaW5kZXggPj0gMFxuICAgIG5leHRDaGFyQ29kZSA9IGNoYXJzW2luZGV4XS5jaGFyQ29kZUF0KCkgKyBjYXJyeVxuXG4gICAgaWYgbmV4dENoYXJDb2RlID4gXCJ6XCIuY2hhckNvZGVBdCgpXG4gICAgICBjaGFyc1tpbmRleF0gPSBcImFcIlxuICAgICAgaW5kZXggLT0gMVxuICAgICAgY2FycnkgPSAxXG4gICAgICBsb3dlckNhc2UgPSAxXG4gICAgZWxzZVxuICAgICAgY2hhcnNbaW5kZXhdID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUpXG4gICAgICBjYXJyeSA9IDBcblxuICBjaGFycy51bnNoaWZ0KFwiYVwiKSBpZiBjYXJyeSA9PSAxXG5cbiAgc3RyID0gY2hhcnMuam9pbihcIlwiKVxuICBpZiB1cHBlckNhc2UgdGhlbiBzdHIudG9VcHBlckNhc2UoKSBlbHNlIHN0clxuXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9lcGVsaS91bmRlcnNjb3JlLnN0cmluZy9ibG9iL21hc3Rlci9jbGVhbkRpYWNyaXRpY3MuanNcbmNsZWFuRGlhY3JpdGljcyA9IChzdHIpIC0+XG4gIHJldHVybiBcIlwiIHVubGVzcyBzdHJcblxuICBmcm9tID0gXCLEhcOgw6HDpMOiw6PDpcOmxIPEh8SNxInEmcOow6nDq8OqxJ3EpcOsw63Dr8OuxLXFgsS+xYTFiMOyw7PDtsWRw7TDtcOww7jFm8iZxaHFncWlyJvFrcO5w7rDvMWxw7vDscO/w73Dp8W8xbrFvlwiXG4gIHRvID0gXCJhYWFhYWFhYWFjY2NlZWVlZWdoaWlpaWpsbG5ub29vb29vb29zc3NzdHR1dXV1dXVueXljenp6XCJcblxuICBmcm9tICs9IGZyb20udG9VcHBlckNhc2UoKVxuICB0byArPSB0by50b1VwcGVyQ2FzZSgpXG5cbiAgdG8gPSB0by5zcGxpdChcIlwiKVxuXG4gICMgZm9yIHRva2VucyByZXF1aXJlaW5nIG11bHRpdG9rZW4gb3V0cHV0XG4gIGZyb20gKz0gXCLDn1wiXG4gIHRvLnB1c2goJ3NzJylcblxuICBzdHIucmVwbGFjZSAvLnsxfS9nLCAoYykgLT5cbiAgICBpbmRleCA9IGZyb20uaW5kZXhPZihjKVxuICAgIGlmIGluZGV4ID09IC0xIHRoZW4gYyBlbHNlIHRvW2luZGV4XVxuXG5TTFVHSVpFX0NPTlRST0xfUkVHRVggPSAvW1xcdTAwMDAtXFx1MDAxZl0vZ1xuU0xVR0laRV9TUEVDSUFMX1JFR0VYID0gL1tcXHN+YCFAI1xcJCVcXF4mXFwqXFwoXFwpXFwtX1xcKz1cXFtcXF1cXHtcXH1cXHxcXFxcOzpcIic8PixcXC5cXD9cXC9dKy9nXG5cbiMgaHR0cHM6Ly9naXRodWIuY29tL2hleG9qcy9oZXhvLXV0aWwvYmxvYi9tYXN0ZXIvbGliL3NsdWdpemUuanNcbnNsdWdpemUgPSAoc3RyLCBzZXBhcmF0b3IgPSAnLScpIC0+XG4gIHJldHVybiBcIlwiIHVubGVzcyBzdHJcblxuICBlc2NhcGVkU2VwID0gZXNjYXBlUmVnRXhwKHNlcGFyYXRvcilcblxuICBjbGVhbkRpYWNyaXRpY3Moc3RyKS50cmltKCkudG9Mb3dlckNhc2UoKVxuICAgICMgUmVtb3ZlIGNvbnRyb2wgY2hhcmFjdGVyc1xuICAgIC5yZXBsYWNlKFNMVUdJWkVfQ09OVFJPTF9SRUdFWCwgJycpXG4gICAgIyBSZXBsYWNlIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgIC5yZXBsYWNlKFNMVUdJWkVfU1BFQ0lBTF9SRUdFWCwgc2VwYXJhdG9yKVxuICAgICMgUmVtb3ZlIGNvbnRpbm91cyBzZXBhcmF0b3JzXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cChlc2NhcGVkU2VwICsgJ3syLH0nLCAnZycpLCBzZXBhcmF0b3IpXG4gICAgIyBSZW1vdmUgcHJlZml4aW5nIGFuZCB0cmFpbGluZyBzZXBhcnRvcnNcbiAgICAucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIGVzY2FwZWRTZXAgKyAnK3wnICsgZXNjYXBlZFNlcCArICcrJCcsICdnJyksICcnKVxuXG5nZXRQYWNrYWdlUGF0aCA9IChzZWdtZW50cy4uLikgLT5cbiAgc2VnbWVudHMudW5zaGlmdChhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aChcIm1hcmtkb3duLXdyaXRlclwiKSlcbiAgcGF0aC5qb2luLmFwcGx5KG51bGwsIHNlZ21lbnRzKVxuXG5nZXRQcm9qZWN0UGF0aCA9IC0+XG4gIHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgaWYgcGF0aHMgJiYgcGF0aHMubGVuZ3RoID4gMFxuICAgIHBhdGhzWzBdXG4gIGVsc2UgIyBHaXZlIHRoZSB1c2VyIGEgcGF0aCBpZiB0aGVyZSdzIG5vIHByb2plY3QgcGF0aHMuXG4gICAgYXRvbS5jb25maWcuZ2V0KFwiY29yZS5wcm9qZWN0SG9tZVwiKVxuXG5nZXRTaXRlUGF0aCA9IChjb25maWdQYXRoKSAtPlxuICBnZXRBYnNvbHV0ZVBhdGgoY29uZmlnUGF0aCB8fCBnZXRQcm9qZWN0UGF0aCgpKVxuXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvb3MtaG9tZWRpci9ibG9iL21hc3Rlci9pbmRleC5qc1xuZ2V0SG9tZWRpciA9IC0+XG4gIHJldHVybiBvcy5ob21lZGlyKCkgaWYgdHlwZW9mKG9zLmhvbWVkaXIpID09IFwiZnVuY3Rpb25cIlxuXG4gIGVudiA9IHByb2Nlc3MuZW52XG4gIGhvbWUgPSBlbnYuSE9NRVxuICB1c2VyID0gZW52LkxPR05BTUUgfHwgZW52LlVTRVIgfHwgZW52LkxOQU1FIHx8IGVudi5VU0VSTkFNRVxuXG4gIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJ3aW4zMlwiXG4gICAgZW52LlVTRVJQUk9GSUxFIHx8IGVudi5IT01FRFJJVkUgKyBlbnYuSE9NRVBBVEggfHwgaG9tZVxuICBlbHNlIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJkYXJ3aW5cIlxuICAgIGhvbWUgfHwgKFwiL1VzZXJzL1wiICsgdXNlciBpZiB1c2VyKVxuICBlbHNlIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJsaW51eFwiXG4gICAgaG9tZSB8fCAoXCIvcm9vdFwiIGlmIHByb2Nlc3MuZ2V0dWlkKCkgPT0gMCkgfHwgKFwiL2hvbWUvXCIgKyB1c2VyIGlmIHVzZXIpXG4gIGVsc2VcbiAgICBob21lXG5cbiMgQmFzaWNhbGx5IGV4cGFuZCB+LyB0byBob21lIGRpcmVjdG9yeVxuIyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3VudGlsZGlmeS9ibG9iL21hc3Rlci9pbmRleC5qc1xuZ2V0QWJzb2x1dGVQYXRoID0gKHBhdGgpIC0+XG4gIGhvbWUgPSBnZXRIb21lZGlyKClcbiAgaWYgaG9tZSB0aGVuIHBhdGgucmVwbGFjZSgvXn4oJHxcXC98XFxcXCkvLCBob21lICsgJyQxJykgZWxzZSBwYXRoXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgR2VuZXJhbCBWaWV3IEhlbHBlcnNcbiNcblxuc2V0VGFiSW5kZXggPSAoZWxlbXMpIC0+XG4gIGVsZW1bMF0udGFiSW5kZXggPSBpICsgMSBmb3IgZWxlbSwgaSBpbiBlbGVtc1xuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFRlbXBsYXRlXG4jXG5cblRFTVBMQVRFX1JFR0VYID0gLy8vXG4gIFtcXDxcXHtdICAgICAgICAjIHN0YXJ0IHdpdGggPCBvciB7XG4gIChbXFx3XFwuXFwtXSs/KSAgIyBhbnkgcmVhc29uYWJsZSB3b3JkcywgLSBvciAuXG4gIFtcXD5cXH1dICAgICAgICAjIGVuZCB3aXRoID4gb3IgfVxuICAvLy9nXG5cblVOVEVNUExBVEVfUkVHRVggPSAvLy9cbiAgKD86XFw8fFxcXFxcXHspICAgIyBzdGFydCB3aXRoIDwgb3IgXFx7XG4gIChbXFx3XFwuXFwtXSs/KSAgIyBhbnkgcmVhc29uYWJsZSB3b3JkcywgLSBvciAuXG4gICg/OlxcPnxcXFxcXFx9KSAgICMgZW5kIHdpdGggPiBvciBcXH1cbiAgLy8vZ1xuXG50ZW1wbGF0ZSA9ICh0ZXh0LCBkYXRhLCBtYXRjaGVyID0gVEVNUExBVEVfUkVHRVgpIC0+XG4gIHRleHQucmVwbGFjZSBtYXRjaGVyLCAobWF0Y2gsIGF0dHIpIC0+XG4gICAgaWYgZGF0YVthdHRyXT8gdGhlbiBkYXRhW2F0dHJdIGVsc2UgbWF0Y2hcblxuIyBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHJldmVyc2UgcGFyc2UgdGhlIHRlbXBsYXRlLCBlLmcuXG4jXG4jIFBhc3MgYHVudGVtcGxhdGUoXCJ7eWVhcn0te21vbnRofVwiKWAgcmV0dXJucyBhIGZ1bmN0aW9uIGBmbmAsIHRoYXQgYGZuKFwiMjAxNS0xMVwiKSAjID0+IHsgXzogXCIyMDE1LTExXCIsIHllYXI6IDIwMTUsIG1vbnRoOiAxMSB9YFxuI1xudW50ZW1wbGF0ZSA9ICh0ZXh0LCBtYXRjaGVyID0gVU5URU1QTEFURV9SRUdFWCkgLT5cbiAga2V5cyA9IFtdXG5cbiAgdGV4dCA9IGVzY2FwZVJlZ0V4cCh0ZXh0KS5yZXBsYWNlIG1hdGNoZXIsIChtYXRjaCwgYXR0cikgLT5cbiAgICBrZXlzLnB1c2goYXR0cilcbiAgICBpZiBbXCJ5ZWFyXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcZHs0fSlcIlxuICAgIGVsc2UgaWYgW1wibW9udGhcIiwgXCJkYXlcIiwgXCJob3VyXCIsIFwibWludXRlXCIsIFwic2Vjb25kXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcZHsyfSlcIlxuICAgIGVsc2UgaWYgW1wiaV9tb250aFwiLCBcImlfZGF5XCIsIFwiaV9ob3VyXCIsIFwiaV9taW51dGVcIiwgXCJpX3NlY29uZFwiXS5pbmRleE9mKGF0dHIpICE9IC0xIHRoZW4gXCIoXFxcXGR7MSwyfSlcIlxuICAgIGVsc2UgaWYgW1wiZXh0ZW5zaW9uXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcLlxcXFx3KylcIlxuICAgIGVsc2UgXCIoW1xcXFxzXFxcXFNdKylcIlxuXG4gIGNyZWF0ZVVudGVtcGxhdGVNYXRjaGVyKGtleXMsIC8vLyBeICN7dGV4dH0gJCAvLy8pXG5cbmNyZWF0ZVVudGVtcGxhdGVNYXRjaGVyID0gKGtleXMsIHJlZ2V4KSAtPlxuICAoc3RyKSAtPlxuICAgIHJldHVybiB1bmxlc3Mgc3RyXG5cbiAgICBtYXRjaGVzID0gcmVnZXguZXhlYyhzdHIpXG4gICAgcmV0dXJuIHVubGVzcyBtYXRjaGVzXG5cbiAgICByZXN1bHRzID0geyBcIl9cIiA6IG1hdGNoZXNbMF0gfVxuICAgIGtleXMuZm9yRWFjaCAoa2V5LCBpZHgpIC0+IHJlc3VsdHNba2V5XSA9IG1hdGNoZXNbaWR4ICsgMV1cbiAgICByZXN1bHRzXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgRGF0ZSBhbmQgVGltZVxuI1xuXG5wYXJzZURhdGUgPSAoaGFzaCkgLT5cbiAgZGF0ZSA9IG5ldyBEYXRlKClcblxuICBtYXAgPVxuICAgIHNldFllYXI6IFtcInllYXJcIl1cbiAgICBzZXRNb250aDogW1wibW9udGhcIiwgXCJpX21vbnRoXCJdXG4gICAgc2V0RGF0ZTogW1wiZGF5XCIsIFwiaV9kYXlcIl1cbiAgICBzZXRIb3VyczogW1wiaG91clwiLCBcImlfaG91clwiXVxuICAgIHNldE1pbnV0ZXM6IFtcIm1pbnV0ZVwiLCBcImlfbWludXRlXCJdXG4gICAgc2V0U2Vjb25kczogW1wic2Vjb25kXCIsIFwiaV9zZWNvbmRcIl1cblxuICBmb3Iga2V5LCB2YWx1ZXMgb2YgbWFwXG4gICAgdmFsdWUgPSB2YWx1ZXMuZmluZCAodmFsKSAtPiAhIWhhc2hbdmFsXVxuICAgIGlmIHZhbHVlXG4gICAgICB2YWx1ZSA9IHBhcnNlSW50KGhhc2hbdmFsdWVdLCAxMClcbiAgICAgIHZhbHVlID0gdmFsdWUgLSAxIGlmIGtleSA9PSAnc2V0TW9udGgnXG4gICAgICBkYXRlW2tleV0odmFsdWUpXG5cbiAgZ2V0RGF0ZShkYXRlKVxuXG5nZXREYXRlID0gKGRhdGUgPSBuZXcgRGF0ZSgpKSAtPlxuICB5ZWFyOiBcIlwiICsgZGF0ZS5nZXRGdWxsWWVhcigpXG4gICMgd2l0aCBwcmVwZW5kZWQgMFxuICBtb250aDogKFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpKS5zbGljZSgtMilcbiAgZGF5OiAoXCIwXCIgKyBkYXRlLmdldERhdGUoKSkuc2xpY2UoLTIpXG4gIGhvdXI6IChcIjBcIiArIGRhdGUuZ2V0SG91cnMoKSkuc2xpY2UoLTIpXG4gIG1pbnV0ZTogKFwiMFwiICsgZGF0ZS5nZXRNaW51dGVzKCkpLnNsaWNlKC0yKVxuICBzZWNvbmQ6IChcIjBcIiArIGRhdGUuZ2V0U2Vjb25kcygpKS5zbGljZSgtMilcbiAgIyB3aXRob3V0IHByZXBlbmQgMFxuICBpX21vbnRoOiBcIlwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpXG4gIGlfZGF5OiBcIlwiICsgZGF0ZS5nZXREYXRlKClcbiAgaV9ob3VyOiBcIlwiICsgZGF0ZS5nZXRIb3VycygpXG4gIGlfbWludXRlOiBcIlwiICsgZGF0ZS5nZXRNaW51dGVzKClcbiAgaV9zZWNvbmQ6IFwiXCIgKyBkYXRlLmdldFNlY29uZHMoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEltYWdlIEhUTUwgVGFnXG4jXG5cbklNR19UQUdfUkVHRVggPSAvLy8gPGltZyAoLio/KVxcLz8+IC8vL2lcbklNR19UQUdfQVRUUklCVVRFID0gLy8vIChbYS16XSs/KT0oJ3xcIikoLio/KVxcMiAvLy9pZ1xuXG4jIERldGVjdCBpdCBpcyBhIEhUTUwgaW1hZ2UgdGFnXG5pc0ltYWdlVGFnID0gKGlucHV0KSAtPiBJTUdfVEFHX1JFR0VYLnRlc3QoaW5wdXQpXG5wYXJzZUltYWdlVGFnID0gKGlucHV0KSAtPlxuICBpbWcgPSB7fVxuICBhdHRyaWJ1dGVzID0gSU1HX1RBR19SRUdFWC5leGVjKGlucHV0KVsxXS5tYXRjaChJTUdfVEFHX0FUVFJJQlVURSlcbiAgcGF0dGVybiA9IC8vLyAje0lNR19UQUdfQVRUUklCVVRFLnNvdXJjZX0gLy8vaVxuICBhdHRyaWJ1dGVzLmZvckVhY2ggKGF0dHIpIC0+XG4gICAgZWxlbSA9IHBhdHRlcm4uZXhlYyhhdHRyKVxuICAgIGltZ1tlbGVtWzFdXSA9IGVsZW1bM10gaWYgZWxlbVxuICByZXR1cm4gaW1nXG5cblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBTb21lIHNoYXJlZCByZWdleCBiYXNpY3NcbiNcblxuIyBbdXJsfHVybCBcInRpdGxlXCJdXG5VUkxfQU5EX1RJVExFID0gLy8vXG4gIChcXFMqPykgICAgICAgICAgICAgICAgICAjIGEgdXJsXG4gICg/OlxuICAgIFxcICsgICAgICAgICAgICAgICAgICAgIyBzcGFjZXNcbiAgICBbXCInXFxcXChdPyguKj8pW1wiJ1xcXFwpXT8gIyBxdW90ZWQgdGl0bGVcbiAgKT8gICAgICAgICAgICAgICAgICAgICAgIyBtaWdodCBub3QgcHJlc2VudFxuICAvLy8uc291cmNlXG5cbiMgW2ltYWdlfHRleHRdXG5JTUdfT1JfVEVYVCA9IC8vLyAoIVxcWy4qP1xcXVxcKC4rP1xcKSB8IFteXFxbXSs/KSAvLy8uc291cmNlXG4jIGF0IGhlYWQgb3Igbm90ICFbLCB3b3JrYXJvdW5kIG9mIG5vIG5lZy1sb29rYmVoaW5kIGluIEpTXG5PUEVOX1RBRyA9IC8vLyAoPzpefFteIV0pKD89XFxbKSAvLy8uc291cmNlXG4jIGxpbmsgaWQgZG9uJ3QgY29udGFpbnMgWyBvciBdXG5MSU5LX0lEID0gLy8vIFteXFxbXFxdXSsgLy8vLnNvdXJjZVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEltYWdlXG4jXG5cbklNR19SRUdFWCAgPSAvLy9cbiAgISBcXFsgKC4qPykgXFxdICAgICAgICAgICAgIyAhW2VtcHR5fHRleHRdXG4gICAgXFwoICN7VVJMX0FORF9USVRMRX0gXFwpICMgKGltYWdlIHBhdGgsIGFueSBkZXNjcmlwdGlvbilcbiAgLy8vXG5cbmlzSW1hZ2UgPSAoaW5wdXQpIC0+IElNR19SRUdFWC50ZXN0KGlucHV0KVxucGFyc2VJbWFnZSA9IChpbnB1dCkgLT5cbiAgaW1hZ2UgPSBJTUdfUkVHRVguZXhlYyhpbnB1dClcblxuICBpZiBpbWFnZSAmJiBpbWFnZS5sZW5ndGggPj0gMlxuICAgIHJldHVybiBhbHQ6IGltYWdlWzFdLCBzcmM6IGltYWdlWzJdLCB0aXRsZTogaW1hZ2VbM10gfHwgXCJcIlxuICBlbHNlXG4gICAgcmV0dXJuIGFsdDogaW5wdXQsIHNyYzogXCJcIiwgdGl0bGU6IFwiXCJcblxuSU1HX0VYVEVOU0lPTlMgPSBbXCIuanBnXCIsIFwiLmpwZWdcIiwgXCIucG5nXCIsIFwiLmdpZlwiLCBcIi5pY29cIl1cblxuaXNJbWFnZUZpbGUgPSAoZmlsZSkgLT5cbiAgZmlsZSAmJiAocGF0aC5leHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCkgaW4gSU1HX0VYVEVOU0lPTlMpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgSW5saW5lIGxpbmtcbiNcblxuSU5MSU5FX0xJTktfUkVHRVggPSAvLy9cbiAgXFxbICN7SU1HX09SX1RFWFR9IFxcXSAgICMgW2ltYWdlfHRleHRdXG4gIFxcKCAje1VSTF9BTkRfVElUTEV9IFxcKSAjICh1cmwgXCJhbnkgdGl0bGVcIilcbiAgLy8vXG5cbklOTElORV9MSU5LX1RFU1RfUkVHRVggPSAvLy9cbiAgI3tPUEVOX1RBR31cbiAgI3tJTkxJTkVfTElOS19SRUdFWC5zb3VyY2V9XG4gIC8vL1xuXG5pc0lubGluZUxpbmsgPSAoaW5wdXQpIC0+IElOTElORV9MSU5LX1RFU1RfUkVHRVgudGVzdChpbnB1dClcbnBhcnNlSW5saW5lTGluayA9IChpbnB1dCkgLT5cbiAgbGluayA9IElOTElORV9MSU5LX1JFR0VYLmV4ZWMoaW5wdXQpXG5cbiAgaWYgbGluayAmJiBsaW5rLmxlbmd0aCA+PSAyXG4gICAgdGV4dDogbGlua1sxXSwgdXJsOiBsaW5rWzJdLCB0aXRsZTogbGlua1szXSB8fCBcIlwiXG4gIGVsc2VcbiAgICB0ZXh0OiBpbnB1dCwgdXJsOiBcIlwiLCB0aXRsZTogXCJcIlxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFJlZmVyZW5jZSBsaW5rXG4jXG5cbiMgTWF0Y2ggcmVmZXJlbmNlIGxpbmsgW3RleHRdW2lkXVxuUkVGRVJFTkNFX0xJTktfUkVHRVhfT0YgPSAoaWQsIG9wdHMgPSB7fSkgLT5cbiAgaWQgPSBlc2NhcGVSZWdFeHAoaWQpIHVubGVzcyBvcHRzLm5vRXNjYXBlXG4gIC8vL1xuICBcXFsoI3tpZH0pXFxdXFwgP1xcW1xcXSAgICAgICAgICAgICAgICMgW3RleHRdW11cbiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBvclxuICBcXFsje0lNR19PUl9URVhUfVxcXVxcID9cXFsoI3tpZH0pXFxdICMgW2ltYWdlfHRleHRdW2lkXVxuICAvLy9cblxuIyBNYXRjaCByZWZlcmVuY2UgbGluayBkZWZpbml0aW9ucyBbaWRdOiB1cmxcblJFRkVSRU5DRV9ERUZfUkVHRVhfT0YgPSAoaWQsIG9wdHMgPSB7fSkgLT5cbiAgaWQgPSBlc2NhcGVSZWdFeHAoaWQpIHVubGVzcyBvcHRzLm5vRXNjYXBlXG4gIC8vL1xuICBeICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHN0YXJ0IG9mIGxpbmVcbiAgXFwgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICMgYW55IGxlYWRpbmcgc3BhY2VzXG4gIFxcWygje2lkfSlcXF06XFwgKyAgICAgICAgICAgICAgICMgW2lkXTogZm9sbG93ZWQgYnkgc3BhY2VzXG4gICN7VVJMX0FORF9USVRMRX0gICAgICAgICAgICAgICMgbGluayBcInRpdGxlXCJcbiAgJFxuICAvLy9tXG5cbiMgUkVGRVJFTkNFX0xJTktfUkVHRVguZXhlYyhcIlt0ZXh0XVtpZF1cIilcbiMgPT4gW1wiW3RleHRdW2lkXVwiLCB1bmRlZmluZWQsIFwidGV4dFwiLCBcImlkXCJdXG4jXG4jIFJFRkVSRU5DRV9MSU5LX1JFR0VYLmV4ZWMoXCJbdGV4dF1bXVwiKVxuIyA9PiBbXCJbdGV4dF1bXVwiLCBcInRleHRcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWRdXG5SRUZFUkVOQ0VfTElOS19SRUdFWCA9IFJFRkVSRU5DRV9MSU5LX1JFR0VYX09GKExJTktfSUQsIG5vRXNjYXBlOiB0cnVlKVxuUkVGRVJFTkNFX0xJTktfVEVTVF9SRUdFWCA9IC8vL1xuICAje09QRU5fVEFHfVxuICAje1JFRkVSRU5DRV9MSU5LX1JFR0VYLnNvdXJjZX1cbiAgLy8vXG5cblJFRkVSRU5DRV9ERUZfUkVHRVggPSBSRUZFUkVOQ0VfREVGX1JFR0VYX09GKExJTktfSUQsIG5vRXNjYXBlOiB0cnVlKVxuXG5pc1JlZmVyZW5jZUxpbmsgPSAoaW5wdXQpIC0+IFJFRkVSRU5DRV9MSU5LX1RFU1RfUkVHRVgudGVzdChpbnB1dClcbnBhcnNlUmVmZXJlbmNlTGluayA9IChpbnB1dCwgZWRpdG9yKSAtPlxuICBsaW5rID0gUkVGRVJFTkNFX0xJTktfUkVHRVguZXhlYyhpbnB1dClcbiAgdGV4dCA9IGxpbmtbMl0gfHwgbGlua1sxXVxuICBpZCAgID0gbGlua1szXSB8fCBsaW5rWzFdXG5cbiAgIyBmaW5kIGRlZmluaXRpb24gYW5kIGRlZmluaXRpb25SYW5nZSBpZiBlZGl0b3IgaXMgZ2l2ZW5cbiAgZGVmICA9IHVuZGVmaW5lZFxuICBlZGl0b3IgJiYgZWRpdG9yLmJ1ZmZlci5zY2FuIFJFRkVSRU5DRV9ERUZfUkVHRVhfT0YoaWQpLCAobWF0Y2gpIC0+IGRlZiA9IG1hdGNoXG5cbiAgaWYgZGVmXG4gICAgaWQ6IGlkLCB0ZXh0OiB0ZXh0LCB1cmw6IGRlZi5tYXRjaFsyXSwgdGl0bGU6IGRlZi5tYXRjaFszXSB8fCBcIlwiLFxuICAgIGRlZmluaXRpb25SYW5nZTogZGVmLnJhbmdlXG4gIGVsc2VcbiAgICBpZDogaWQsIHRleHQ6IHRleHQsIHVybDogXCJcIiwgdGl0bGU6IFwiXCIsIGRlZmluaXRpb25SYW5nZTogbnVsbFxuXG5pc1JlZmVyZW5jZURlZmluaXRpb24gPSAoaW5wdXQpIC0+XG4gIGRlZiA9IFJFRkVSRU5DRV9ERUZfUkVHRVguZXhlYyhpbnB1dClcbiAgISFkZWYgJiYgZGVmWzFdWzBdICE9IFwiXlwiICMgbm90IGEgZm9vdG5vdGVcblxucGFyc2VSZWZlcmVuY2VEZWZpbml0aW9uID0gKGlucHV0LCBlZGl0b3IpIC0+XG4gIGRlZiAgPSBSRUZFUkVOQ0VfREVGX1JFR0VYLmV4ZWMoaW5wdXQpXG4gIGlkICAgPSBkZWZbMV1cblxuICAjIGZpbmQgbGluayBhbmQgbGlua1JhbmdlIGlmIGVkaXRvciBpcyBnaXZlblxuICBsaW5rID0gdW5kZWZpbmVkXG4gIGVkaXRvciAmJiBlZGl0b3IuYnVmZmVyLnNjYW4gUkVGRVJFTkNFX0xJTktfUkVHRVhfT0YoaWQpLCAobWF0Y2gpIC0+IGxpbmsgPSBtYXRjaFxuXG4gIGlmIGxpbmtcbiAgICBpZDogaWQsIHRleHQ6IGxpbmsubWF0Y2hbMl0gfHwgbGluay5tYXRjaFsxXSwgdXJsOiBkZWZbMl0sXG4gICAgdGl0bGU6IGRlZlszXSB8fCBcIlwiLCBsaW5rUmFuZ2U6IGxpbmsucmFuZ2VcbiAgZWxzZVxuICAgIGlkOiBpZCwgdGV4dDogXCJcIiwgdXJsOiBkZWZbMl0sIHRpdGxlOiBkZWZbM10gfHwgXCJcIiwgbGlua1JhbmdlOiBudWxsXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgRm9vdG5vdGVcbiNcblxuRk9PVE5PVEVfUkVHRVggPSAvLy8gXFxbIFxcXiAoLis/KSBcXF0gKDopPyAvLy9cbkZPT1ROT1RFX1RFU1RfUkVHRVggPSAvLy9cbiAgI3tPUEVOX1RBR31cbiAgI3tGT09UTk9URV9SRUdFWC5zb3VyY2V9XG4gIC8vL1xuXG5pc0Zvb3Rub3RlID0gKGlucHV0KSAtPiBGT09UTk9URV9URVNUX1JFR0VYLnRlc3QoaW5wdXQpXG5wYXJzZUZvb3Rub3RlID0gKGlucHV0KSAtPlxuICBmb290bm90ZSA9IEZPT1ROT1RFX1JFR0VYLmV4ZWMoaW5wdXQpXG4gIGxhYmVsOiBmb290bm90ZVsxXSwgaXNEZWZpbml0aW9uOiBmb290bm90ZVsyXSA9PSBcIjpcIiwgY29udGVudDogXCJcIlxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFRhYmxlXG4jXG5cblRBQkxFX1NFUEFSQVRPUl9SRUdFWCA9IC8vL1xuICBeXG4gIChcXHwpPyAgICAgICAgICAgICAgICAjIHN0YXJ0cyB3aXRoIGFuIG9wdGlvbmFsIHxcbiAgKFxuICAgKD86XFxzKig/Oi0rfDotKjp8Oi0qfC0qOilcXHMqXFx8KSsgIyBvbmUgb3IgbW9yZSB0YWJsZSBjZWxsXG4gICAoPzpcXHMqKD86LSt8Oi0qOnw6LSp8LSo6KVxccyopICAgICMgbGFzdCB0YWJsZSBjZWxsXG4gIClcbiAgKFxcfCk/ICAgICAgICAgICAgICAgICMgZW5kcyB3aXRoIGFuIG9wdGlvbmFsIHxcbiAgJFxuICAvLy9cblxuVEFCTEVfT05FX0NPTFVNTl9TRVBBUkFUT1JfUkVHRVggPSAvLy8gXiAoXFx8KSAoXFxzKjo/LSs6P1xccyopIChcXHwpICQgLy8vXG5cbmlzVGFibGVTZXBhcmF0b3IgPSAobGluZSkgLT5cbiAgbGluZSA9IGxpbmUudHJpbSgpXG4gIFRBQkxFX1NFUEFSQVRPUl9SRUdFWC50ZXN0KGxpbmUpIHx8XG4gIFRBQkxFX09ORV9DT0xVTU5fU0VQQVJBVE9SX1JFR0VYLnRlc3QobGluZSlcblxucGFyc2VUYWJsZVNlcGFyYXRvciA9IChsaW5lKSAtPlxuICBsaW5lID0gbGluZS50cmltKClcbiAgbWF0Y2hlcyA9IFRBQkxFX1NFUEFSQVRPUl9SRUdFWC5leGVjKGxpbmUpIHx8XG4gICAgVEFCTEVfT05FX0NPTFVNTl9TRVBBUkFUT1JfUkVHRVguZXhlYyhsaW5lKVxuICBjb2x1bW5zID0gbWF0Y2hlc1syXS5zcGxpdChcInxcIikubWFwIChjb2wpIC0+IGNvbC50cmltKClcblxuICByZXR1cm4ge1xuICAgIHNlcGFyYXRvcjogdHJ1ZVxuICAgIGV4dHJhUGlwZXM6ICEhKG1hdGNoZXNbMV0gfHwgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdKVxuICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICBjb2x1bW5XaWR0aHM6IGNvbHVtbnMubWFwIChjb2wpIC0+IGNvbC5sZW5ndGhcbiAgICBhbGlnbm1lbnRzOiBjb2x1bW5zLm1hcCAoY29sKSAtPlxuICAgICAgaGVhZCA9IGNvbFswXSA9PSBcIjpcIlxuICAgICAgdGFpbCA9IGNvbFtjb2wubGVuZ3RoIC0gMV0gPT0gXCI6XCJcblxuICAgICAgaWYgaGVhZCAmJiB0YWlsXG4gICAgICAgIFwiY2VudGVyXCJcbiAgICAgIGVsc2UgaWYgaGVhZFxuICAgICAgICBcImxlZnRcIlxuICAgICAgZWxzZSBpZiB0YWlsXG4gICAgICAgIFwicmlnaHRcIlxuICAgICAgZWxzZVxuICAgICAgICBcImVtcHR5XCJcbiAgfVxuXG5UQUJMRV9ST1dfUkVHRVggPSAvLy9cbiAgXlxuICAoXFx8KT8gICAgICAgICAgICAgICAgIyBzdGFydHMgd2l0aCBhbiBvcHRpb25hbCB8XG4gICguKz9cXHwuKz8pICAgICAgICAgICAjIGFueSBjb250ZW50IHdpdGggYXQgbGVhc3QgMiBjb2x1bW5zXG4gIChcXHwpPyAgICAgICAgICAgICAgICAjIGVuZHMgd2l0aCBhbiBvcHRpb25hbCB8XG4gICRcbiAgLy8vXG5cblRBQkxFX09ORV9DT0xVTU5fUk9XX1JFR0VYID0gLy8vIF4gKFxcfCkgKC4rPykgKFxcfCkgJCAvLy9cblxuaXNUYWJsZVJvdyA9IChsaW5lKSAtPlxuICBsaW5lID0gbGluZS50cmltUmlnaHQoKVxuICBUQUJMRV9ST1dfUkVHRVgudGVzdChsaW5lKSB8fCBUQUJMRV9PTkVfQ09MVU1OX1JPV19SRUdFWC50ZXN0KGxpbmUpXG5cbnBhcnNlVGFibGVSb3cgPSAobGluZSkgLT5cbiAgcmV0dXJuIHBhcnNlVGFibGVTZXBhcmF0b3IobGluZSkgaWYgaXNUYWJsZVNlcGFyYXRvcihsaW5lKVxuXG4gIGxpbmUgPSBsaW5lLnRyaW1SaWdodCgpXG4gIG1hdGNoZXMgPSBUQUJMRV9ST1dfUkVHRVguZXhlYyhsaW5lKSB8fCBUQUJMRV9PTkVfQ09MVU1OX1JPV19SRUdFWC5leGVjKGxpbmUpXG4gIGNvbHVtbnMgPSBtYXRjaGVzWzJdLnNwbGl0KFwifFwiKS5tYXAgKGNvbCkgLT4gY29sLnRyaW0oKVxuXG4gIHJldHVybiB7XG4gICAgc2VwYXJhdG9yOiBmYWxzZVxuICAgIGV4dHJhUGlwZXM6ICEhKG1hdGNoZXNbMV0gfHwgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdKVxuICAgIGNvbHVtbnM6IGNvbHVtbnNcbiAgICBjb2x1bW5XaWR0aHM6IGNvbHVtbnMubWFwIChjb2wpIC0+IHdjc3dpZHRoKGNvbClcbiAgfVxuXG4jIGRlZmF1bHRzOlxuIyAgIG51bU9mQ29sdW1uczogM1xuIyAgIGNvbHVtbldpZHRoOiAzXG4jICAgY29sdW1uV2lkdGhzOiBbXVxuIyAgIGV4dHJhUGlwZXM6IHRydWVcbiMgICBhbGlnbm1lbnQ6IFwibGVmdFwiIHwgXCJyaWdodFwiIHwgXCJjZW50ZXJcIiB8IFwiZW1wdHlcIlxuIyAgIGFsaWdubWVudHM6IFtdXG5jcmVhdGVUYWJsZVNlcGFyYXRvciA9IChvcHRpb25zKSAtPlxuICBvcHRpb25zLmNvbHVtbldpZHRocyA/PSBbXVxuICBvcHRpb25zLmFsaWdubWVudHMgPz0gW11cblxuICByb3cgPSBbXVxuICBmb3IgaSBpbiBbMC4ub3B0aW9ucy5udW1PZkNvbHVtbnMgLSAxXVxuICAgIGNvbHVtbldpZHRoID0gb3B0aW9ucy5jb2x1bW5XaWR0aHNbaV0gfHwgb3B0aW9ucy5jb2x1bW5XaWR0aFxuXG4gICAgIyBlbXB0eSBzcGFjZXMgd2lsbCBiZSBpbnNlcnRlZCB3aGVuIGpvaW4gcGlwZXMsIHNvIG5lZWQgdG8gY29tcGVuc2F0ZSBoZXJlXG4gICAgaWYgIW9wdGlvbnMuZXh0cmFQaXBlcyAmJiAoaSA9PSAwIHx8IGkgPT0gb3B0aW9ucy5udW1PZkNvbHVtbnMgLSAxKVxuICAgICAgY29sdW1uV2lkdGggKz0gMVxuICAgIGVsc2VcbiAgICAgIGNvbHVtbldpZHRoICs9IDJcblxuICAgIHN3aXRjaCBvcHRpb25zLmFsaWdubWVudHNbaV0gfHwgb3B0aW9ucy5hbGlnbm1lbnRcbiAgICAgIHdoZW4gXCJjZW50ZXJcIlxuICAgICAgICByb3cucHVzaChcIjpcIiArIFwiLVwiLnJlcGVhdChjb2x1bW5XaWR0aCAtIDIpICsgXCI6XCIpXG4gICAgICB3aGVuIFwibGVmdFwiXG4gICAgICAgIHJvdy5wdXNoKFwiOlwiICsgXCItXCIucmVwZWF0KGNvbHVtbldpZHRoIC0gMSkpXG4gICAgICB3aGVuIFwicmlnaHRcIlxuICAgICAgICByb3cucHVzaChcIi1cIi5yZXBlYXQoY29sdW1uV2lkdGggLSAxKSArIFwiOlwiKVxuICAgICAgZWxzZVxuICAgICAgICByb3cucHVzaChcIi1cIi5yZXBlYXQoY29sdW1uV2lkdGgpKVxuXG4gIHJvdyA9IHJvdy5qb2luKFwifFwiKVxuICBpZiBvcHRpb25zLmV4dHJhUGlwZXMgdGhlbiBcInwje3Jvd318XCIgZWxzZSByb3dcblxuIyBjb2x1bW5zOiBbdmFsdWVzXVxuIyBkZWZhdWx0czpcbiMgICBudW1PZkNvbHVtbnM6IDNcbiMgICBjb2x1bW5XaWR0aDogM1xuIyAgIGNvbHVtbldpZHRoczogW11cbiMgICBleHRyYVBpcGVzOiB0cnVlXG4jICAgYWxpZ25tZW50OiBcImxlZnRcIiB8IFwicmlnaHRcIiB8IFwiY2VudGVyXCIgfCBcImVtcHR5XCJcbiMgICBhbGlnbm1lbnRzOiBbXVxuY3JlYXRlVGFibGVSb3cgPSAoY29sdW1ucywgb3B0aW9ucykgLT5cbiAgb3B0aW9ucy5jb2x1bW5XaWR0aHMgPz0gW11cbiAgb3B0aW9ucy5hbGlnbm1lbnRzID89IFtdXG5cbiAgcm93ID0gW11cbiAgZm9yIGkgaW4gWzAuLm9wdGlvbnMubnVtT2ZDb2x1bW5zIC0gMV1cbiAgICBjb2x1bW5XaWR0aCA9IG9wdGlvbnMuY29sdW1uV2lkdGhzW2ldIHx8IG9wdGlvbnMuY29sdW1uV2lkdGhcblxuICAgIGlmICFjb2x1bW5zW2ldXG4gICAgICByb3cucHVzaChcIiBcIi5yZXBlYXQoY29sdW1uV2lkdGgpKVxuICAgICAgY29udGludWVcblxuICAgIGxlbiA9IGNvbHVtbldpZHRoIC0gd2Nzd2lkdGgoY29sdW1uc1tpXSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb2x1bW4gd2lkdGggI3tjb2x1bW5XaWR0aH0gLSB3Y3N3aWR0aCgnI3tjb2x1bW5zW2ldfScpIGNhbm5vdCBiZSAje2xlbn1cIikgaWYgbGVuIDwgMFxuXG4gICAgc3dpdGNoIG9wdGlvbnMuYWxpZ25tZW50c1tpXSB8fCBvcHRpb25zLmFsaWdubWVudFxuICAgICAgd2hlbiBcImNlbnRlclwiXG4gICAgICAgIHJvdy5wdXNoKFwiIFwiLnJlcGVhdChsZW4gLyAyKSArIGNvbHVtbnNbaV0gKyBcIiBcIi5yZXBlYXQoKGxlbiArIDEpIC8gMikpXG4gICAgICB3aGVuIFwibGVmdFwiXG4gICAgICAgIHJvdy5wdXNoKGNvbHVtbnNbaV0gKyBcIiBcIi5yZXBlYXQobGVuKSlcbiAgICAgIHdoZW4gXCJyaWdodFwiXG4gICAgICAgIHJvdy5wdXNoKFwiIFwiLnJlcGVhdChsZW4pICsgY29sdW1uc1tpXSlcbiAgICAgIGVsc2VcbiAgICAgICAgcm93LnB1c2goY29sdW1uc1tpXSArIFwiIFwiLnJlcGVhdChsZW4pKVxuXG4gIHJvdyA9IHJvdy5qb2luKFwiIHwgXCIpXG4gIGlmIG9wdGlvbnMuZXh0cmFQaXBlcyB0aGVuIFwifCAje3Jvd30gfFwiIGVsc2Ugcm93XG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgVVJMXG4jXG5cblVSTF9SRUdFWCA9IC8vL1xuICBeXG4gICg/Olxcdys6KT9cXC9cXC8gICAgICAgICAgICAgICAgICAgICAgICMgYW55IHByZWZpeCwgZS5nLiBodHRwOi8vXG4gIChbXlxcc1xcLl0rXFwuXFxTezJ9fGxvY2FsaG9zdFtcXDo/XFxkXSopICMgc29tZSBkb21haW5cbiAgXFxTKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcGF0aFxuICAkXG4gIC8vL2lcblxuaXNVcmwgPSAodXJsKSAtPiBVUkxfUkVHRVgudGVzdCh1cmwpXG5cbiMgTm9ybWFsaXplIGEgZmlsZSBwYXRoIHRvIFVSTCBzZXBhcmF0b3Jcbm5vcm1hbGl6ZUZpbGVQYXRoID0gKHBhdGgpIC0+IHBhdGguc3BsaXQoL1tcXFxcXFwvXS8pLmpvaW4oJy8nKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEF0b20gVGV4dEVkaXRvclxuI1xuXG4jIFJldHVybiBzY29wZVNlbGVjdG9yIGlmIHRoZXJlIGlzIGFuIGV4YWN0IG1hdGNoLFxuIyBlbHNlIHJldHVybiBhbnkgc2NvcGUgZGVzY3JpcHRvciBjb250YWlucyBzY29wZVNlbGVjdG9yXG5nZXRTY29wZURlc2NyaXB0b3IgPSAoY3Vyc29yLCBzY29wZVNlbGVjdG9yKSAtPlxuICBzY29wZXMgPSBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKClcbiAgICAuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIC5maWx0ZXIoKHNjb3BlKSAtPiBzY29wZS5pbmRleE9mKHNjb3BlU2VsZWN0b3IpID49IDApXG5cbiAgaWYgc2NvcGVzLmluZGV4T2Yoc2NvcGVTZWxlY3RvcikgPj0gMFxuICAgIHJldHVybiBzY29wZVNlbGVjdG9yXG4gIGVsc2UgaWYgc2NvcGVzLmxlbmd0aCA+IDBcbiAgICByZXR1cm4gc2NvcGVzWzBdXG5cbmdldEJ1ZmZlclJhbmdlRm9yU2NvcGUgPSAoZWRpdG9yLCBjdXJzb3IsIHNjb3BlU2VsZWN0b3IpIC0+XG4gIHBvcyA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgcmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVTZWxlY3RvciwgcG9zKVxuICByZXR1cm4gcmFuZ2UgaWYgcmFuZ2VcblxuICAjIEF0b20gQnVnIDE6IG5vdCByZXR1cm5pbmcgdGhlIGNvcnJlY3QgYnVmZmVyIHJhbmdlIHdoZW4gY3Vyc29yIGlzIGF0IHRoZSBlbmQgb2YgYSBsaW5rIHdpdGggc2NvcGUsXG4gICMgcmVmZXIgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNzk2MVxuICAjXG4gICMgSEFDSyBtb3ZlIHRoZSBjdXJzb3IgcG9zaXRpb24gb25lIGNoYXIgYmFja3dhcmQsIGFuZCB0cnkgdG8gZ2V0IHRoZSBidWZmZXIgcmFuZ2UgZm9yIHNjb3BlIGFnYWluXG4gIHVubGVzcyBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgcmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVTZWxlY3RvciwgW3Bvcy5yb3csIHBvcy5jb2x1bW4gLSAxXSlcbiAgICByZXR1cm4gcmFuZ2UgaWYgcmFuZ2VcblxuICAjIEF0b20gQnVnIDI6IG5vdCByZXR1cm5pbmcgdGhlIGNvcnJlY3QgYnVmZmVyIHJhbmdlIHdoZW4gY3Vyc29yIGlzIGF0IHRoZSBoZWFkIG9mIGEgbGlzdCBsaW5rIHdpdGggc2NvcGUsXG4gICMgcmVmZXIgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvMTI3MTRcbiAgI1xuICAjIEhBQ0sgbW92ZSB0aGUgY3Vyc29yIHBvc2l0aW9uIG9uZSBjaGFyIGZvcndhcmQsIGFuZCB0cnkgdG8gZ2V0IHRoZSBidWZmZXIgcmFuZ2UgZm9yIHNjb3BlIGFnYWluXG4gIHVubGVzcyBjdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgcmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY29wZUF0UG9zaXRpb24oc2NvcGVTZWxlY3RvciwgW3Bvcy5yb3csIHBvcy5jb2x1bW4gKyAxXSlcbiAgICByZXR1cm4gcmFuZ2UgaWYgcmFuZ2VcblxuIyBHZXQgdGhlIHRleHQgYnVmZmVyIHJhbmdlIGlmIHNlbGVjdGlvbiBpcyBub3QgZW1wdHksIG9yIGdldCB0aGVcbiMgYnVmZmVyIHJhbmdlIGlmIGl0IGlzIGluc2lkZSBhIHNjb3BlIHNlbGVjdG9yLCBvciB0aGUgY3VycmVudCB3b3JkLlxuI1xuIyBzZWxlY3Rpb246IG9wdGlvbmFsLCB3aGVuIG5vdCBwcm92aWRlZCBvciBlbXB0eSwgdXNlIHRoZSBsYXN0IHNlbGVjdGlvblxuIyBvcHRzW1wic2VsZWN0QnlcIl06XG4jICAtIG5vcGU6IGRvIG5vdCB1c2UgYW55IHNlbGVjdCBieVxuIyAgLSBuZWFyZXN0V29yZDogdHJ5IHNlbGVjdCBuZWFyZXN0IHdvcmQsIGRlZmF1bHRcbiMgIC0gY3VycmVudExpbmU6IHRyeSBzZWxlY3QgY3VycmVudCBsaW5lXG5nZXRUZXh0QnVmZmVyUmFuZ2UgPSAoZWRpdG9yLCBzY29wZVNlbGVjdG9yLCBzZWxlY3Rpb24sIG9wdHMgPSB7fSkgLT5cbiAgaWYgdHlwZW9mKHNlbGVjdGlvbikgPT0gXCJvYmplY3RcIlxuICAgIG9wdHMgPSBzZWxlY3Rpb25cbiAgICBzZWxlY3Rpb24gPSB1bmRlZmluZWRcblxuICBzZWxlY3Rpb24gPz0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICBjdXJzb3IgPSBzZWxlY3Rpb24uY3Vyc29yXG4gIHNlbGVjdEJ5ID0gb3B0c1tcInNlbGVjdEJ5XCJdIHx8IFwibmVhcmVzdFdvcmRcIlxuXG4gIGlmIHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICBlbHNlIGlmIHNjb3BlID0gZ2V0U2NvcGVEZXNjcmlwdG9yKGN1cnNvciwgc2NvcGVTZWxlY3RvcilcbiAgICBnZXRCdWZmZXJSYW5nZUZvclNjb3BlKGVkaXRvciwgY3Vyc29yLCBzY29wZSlcbiAgZWxzZSBpZiBzZWxlY3RCeSA9PSBcIm5lYXJlc3RXb3JkXCJcbiAgICB3b3JkUmVnZXggPSBjdXJzb3Iud29yZFJlZ0V4cChpbmNsdWRlTm9uV29yZENoYXJhY3RlcnM6IGZhbHNlKVxuICAgIGN1cnNvci5nZXRDdXJyZW50V29yZEJ1ZmZlclJhbmdlKHdvcmRSZWdleDogd29yZFJlZ2V4KVxuICBlbHNlIGlmIHNlbGVjdEJ5ID09IFwiY3VycmVudExpbmVcIlxuICAgIGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKClcbiAgZWxzZVxuICAgIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiMgRmluZCBhIHBvc3NpYmxlIGxpbmsgdGFnIGluIHRoZSByYW5nZSBmcm9tIGVkaXRvciwgcmV0dXJuIHRoZSBmb3VuZCBsaW5rIGRhdGEgb3IgbmlsXG4jXG4jIERhdGEgZm9ybWF0OiB7IHRleHQ6IFwiXCIsIHVybDogXCJcIiwgdGl0bGU6IFwiXCIsIGlkOiBudWxsLCBsaW5rUmFuZ2U6IG51bGwsIGRlZmluaXRpb25SYW5nZTogbnVsbCB9XG4jXG4jIE5PVEU6IElmIGlkIGlzIG5vdCBudWxsLCBhbmQgYW55IG9mIGxpbmtSYW5nZS9kZWZpbml0aW9uUmFuZ2UgaXMgbnVsbCwgaXQgbWVhbnMgdGhlIGxpbmsgaXMgYW4gb3JwaGFuXG5maW5kTGlua0luUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgc2VsZWN0aW9uID0gZWRpdG9yLmdldFRleHRJblJhbmdlKHJhbmdlKVxuICByZXR1cm4gaWYgc2VsZWN0aW9uID09IFwiXCJcblxuICByZXR1cm4gdGV4dDogXCJcIiwgdXJsOiBzZWxlY3Rpb24sIHRpdGxlOiBcIlwiIGlmIGlzVXJsKHNlbGVjdGlvbilcbiAgcmV0dXJuIHBhcnNlSW5saW5lTGluayhzZWxlY3Rpb24pIGlmIGlzSW5saW5lTGluayhzZWxlY3Rpb24pXG5cbiAgaWYgaXNSZWZlcmVuY2VMaW5rKHNlbGVjdGlvbilcbiAgICBsaW5rID0gcGFyc2VSZWZlcmVuY2VMaW5rKHNlbGVjdGlvbiwgZWRpdG9yKVxuICAgIGxpbmsubGlua1JhbmdlID0gcmFuZ2VcbiAgICByZXR1cm4gbGlua1xuICBlbHNlIGlmIGlzUmVmZXJlbmNlRGVmaW5pdGlvbihzZWxlY3Rpb24pXG4gICAgIyBIQUNLIGNvcnJlY3QgdGhlIGRlZmluaXRpb24gcmFuZ2UsIEF0b20ncyBsaW5rIHNjb3BlIGRvZXMgbm90IGluY2x1ZGVcbiAgICAjIGRlZmluaXRpb24ncyB0aXRsZSwgc28gbm9ybWFsaXplIHRvIGJlIHRoZSByYW5nZSBzdGFydCByb3dcbiAgICBzZWxlY3Rpb24gPSBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93KVxuICAgIHJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdylcblxuICAgIGxpbmsgPSBwYXJzZVJlZmVyZW5jZURlZmluaXRpb24oc2VsZWN0aW9uLCBlZGl0b3IpXG4gICAgbGluay5kZWZpbml0aW9uUmFuZ2UgPSByYW5nZVxuICAgIHJldHVybiBsaW5rXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgRXhwb3J0c1xuI1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldEpTT046IGdldEpTT05cbiAgZXNjYXBlUmVnRXhwOiBlc2NhcGVSZWdFeHBcbiAgaXNVcHBlckNhc2U6IGlzVXBwZXJDYXNlXG4gIGluY3JlbWVudENoYXJzOiBpbmNyZW1lbnRDaGFyc1xuICBzbHVnaXplOiBzbHVnaXplXG4gIG5vcm1hbGl6ZUZpbGVQYXRoOiBub3JtYWxpemVGaWxlUGF0aFxuXG4gIGdldFBhY2thZ2VQYXRoOiBnZXRQYWNrYWdlUGF0aFxuICBnZXRQcm9qZWN0UGF0aDogZ2V0UHJvamVjdFBhdGhcbiAgZ2V0U2l0ZVBhdGg6IGdldFNpdGVQYXRoXG4gIGdldEhvbWVkaXI6IGdldEhvbWVkaXJcbiAgZ2V0QWJzb2x1dGVQYXRoOiBnZXRBYnNvbHV0ZVBhdGhcblxuICBzZXRUYWJJbmRleDogc2V0VGFiSW5kZXhcblxuICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgdW50ZW1wbGF0ZTogdW50ZW1wbGF0ZVxuXG4gIGdldERhdGU6IGdldERhdGVcbiAgcGFyc2VEYXRlOiBwYXJzZURhdGVcblxuICBpc0ltYWdlVGFnOiBpc0ltYWdlVGFnXG4gIHBhcnNlSW1hZ2VUYWc6IHBhcnNlSW1hZ2VUYWdcbiAgaXNJbWFnZTogaXNJbWFnZVxuICBwYXJzZUltYWdlOiBwYXJzZUltYWdlXG5cbiAgaXNJbmxpbmVMaW5rOiBpc0lubGluZUxpbmtcbiAgcGFyc2VJbmxpbmVMaW5rOiBwYXJzZUlubGluZUxpbmtcbiAgaXNSZWZlcmVuY2VMaW5rOiBpc1JlZmVyZW5jZUxpbmtcbiAgcGFyc2VSZWZlcmVuY2VMaW5rOiBwYXJzZVJlZmVyZW5jZUxpbmtcbiAgaXNSZWZlcmVuY2VEZWZpbml0aW9uOiBpc1JlZmVyZW5jZURlZmluaXRpb25cbiAgcGFyc2VSZWZlcmVuY2VEZWZpbml0aW9uOiBwYXJzZVJlZmVyZW5jZURlZmluaXRpb25cblxuICBpc0Zvb3Rub3RlOiBpc0Zvb3Rub3RlXG4gIHBhcnNlRm9vdG5vdGU6IHBhcnNlRm9vdG5vdGVcblxuICBpc1RhYmxlU2VwYXJhdG9yOiBpc1RhYmxlU2VwYXJhdG9yXG4gIHBhcnNlVGFibGVTZXBhcmF0b3I6IHBhcnNlVGFibGVTZXBhcmF0b3JcbiAgY3JlYXRlVGFibGVTZXBhcmF0b3I6IGNyZWF0ZVRhYmxlU2VwYXJhdG9yXG4gIGlzVGFibGVSb3c6IGlzVGFibGVSb3dcbiAgcGFyc2VUYWJsZVJvdzogcGFyc2VUYWJsZVJvd1xuICBjcmVhdGVUYWJsZVJvdzogY3JlYXRlVGFibGVSb3dcblxuICBpc1VybDogaXNVcmxcbiAgaXNJbWFnZUZpbGU6IGlzSW1hZ2VGaWxlXG5cbiAgZ2V0VGV4dEJ1ZmZlclJhbmdlOiBnZXRUZXh0QnVmZmVyUmFuZ2VcbiAgZmluZExpbmtJblJhbmdlOiBmaW5kTGlua0luUmFuZ2VcbiJdfQ==
