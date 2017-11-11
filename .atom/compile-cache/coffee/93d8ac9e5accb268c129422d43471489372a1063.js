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

  TABLE_SEPARATOR_REGEX = /^(\|)?((?:\s*(?:-+|:-*:|:-*|-*:)\s*\|)+(?:\s*(?:-+|:-*:|:-*|-*:)\s*|\s+))(\|)?$/;

  TABLE_ONE_COLUMN_SEPARATOR_REGEX = /^(\|)(\s*:?-+:?\s*)(\|)$/;

  isTableSeparator = function(line) {
    return TABLE_SEPARATOR_REGEX.test(line) || TABLE_ONE_COLUMN_SEPARATOR_REGEX.test(line);
  };

  parseTableSeparator = function(line) {
    var columns, extraPipes, matches;
    matches = TABLE_SEPARATOR_REGEX.exec(line) || TABLE_ONE_COLUMN_SEPARATOR_REGEX.exec(line);
    extraPipes = !!(matches[1] || matches[matches.length - 1]);
    columns = matches[2].split("|").map(function(col) {
      return col.trim();
    });
    return {
      separator: true,
      extraPipes: extraPipes,
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
    return TABLE_ROW_REGEX.test(line) || TABLE_ONE_COLUMN_ROW_REGEX.test(line);
  };

  parseTableRow = function(line) {
    var columns, extraPipes, matches;
    if (isTableSeparator(line)) {
      return parseTableSeparator(line);
    }
    matches = TABLE_ROW_REGEX.exec(line) || TABLE_ONE_COLUMN_ROW_REGEX.exec(line);
    extraPipes = !!(matches[1] || matches[matches.length - 1]);
    columns = matches[2].split("|").map(function(col) {
      return col.trim();
    });
    return {
      separator: false,
      extraPipes: extraPipes,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi91dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlwQ0FBQTtJQUFBOzs7RUFBQyxJQUFLLE9BQUEsQ0FBUSxzQkFBUjs7RUFDTixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsU0FBUjs7RUFNWCxPQUFBLEdBQVUsU0FBQyxHQUFELEVBQU0sT0FBTixFQUFlLEtBQWY7SUFDUixJQUFrQixHQUFHLENBQUMsTUFBSixLQUFjLENBQWhDO0FBQUEsYUFBTyxLQUFBLENBQUEsRUFBUDs7V0FDQSxDQUFDLENBQUMsT0FBRixDQUFVLEdBQVYsQ0FBYyxDQUFDLElBQWYsQ0FBb0IsT0FBcEIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxLQUFsQztFQUZROztFQUlWLFlBQUEsR0FBZSxTQUFDLEdBQUQ7SUFDYixJQUFBLENBQWlCLEdBQWpCO0FBQUEsYUFBTyxHQUFQOztXQUNBLEdBQUcsQ0FBQyxPQUFKLENBQVksd0JBQVosRUFBc0MsTUFBdEM7RUFGYTs7RUFJZixXQUFBLEdBQWMsU0FBQyxHQUFEO0lBQ1osSUFBRyxHQUFHLENBQUMsTUFBSixHQUFhLENBQWhCO2FBQXdCLEdBQUksQ0FBQSxDQUFBLENBQUosSUFBVSxHQUFWLElBQWlCLEdBQUksQ0FBQSxDQUFBLENBQUosSUFBVSxJQUFuRDtLQUFBLE1BQUE7YUFDSyxNQURMOztFQURZOztFQUtkLGNBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsUUFBQTtJQUFBLElBQWMsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUEzQjtBQUFBLGFBQU8sSUFBUDs7SUFFQSxTQUFBLEdBQVksV0FBQSxDQUFZLEdBQVo7SUFDWixJQUEyQixTQUEzQjtNQUFBLEdB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QUFZLFVBdkNaO0lBd0NBLGFBQUEsRUFBZSxhQXhDZjtJQXlDQSxjQUFBLEVBQWdCLGNBekNoQjtJQTJDQSxLQUFBLEVBQU8sS0EzQ1A7SUE0Q0EsV0FBQSxFQUFhLFdBNUNiO0lBOENBLGtCQUFBLEVBQW9CLGtCQTlDcEI7SUErQ0EsZUFBQSxFQUFpQixlQS9DakI7O0FBeG9CRiIsInNvdXJjZXNDb250ZW50IjpbInskfSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5vcyA9IHJlcXVpcmUgXCJvc1wiXG5wYXRoID0gcmVxdWlyZSBcInBhdGhcIlxud2Nzd2lkdGggPSByZXF1aXJlIFwid2N3aWR0aFwiXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgR2VuZXJhbCBVdGlsc1xuI1xuXG5nZXRKU09OID0gKHVyaSwgc3VjY2VlZCwgZXJyb3IpIC0+XG4gIHJldHVybiBlcnJvcigpIGlmIHVyaS5sZW5ndGggPT0gMFxuICAkLmdldEpTT04odXJpKS5kb25lKHN1Y2NlZWQpLmZhaWwoZXJyb3IpXG5cbmVzY2FwZVJlZ0V4cCA9IChzdHIpIC0+XG4gIHJldHVybiBcIlwiIHVubGVzcyBzdHJcbiAgc3RyLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIilcblxuaXNVcHBlckNhc2UgPSAoc3RyKSAtPlxuICBpZiBzdHIubGVuZ3RoID4gMCB0aGVuIChzdHJbMF0gPj0gJ0EnICYmIHN0clswXSA8PSAnWicpXG4gIGVsc2UgZmFsc2VcblxuIyBpbmNyZW1lbnQgdGhlIGNoYXJzOiBhIC0+IGIsIHogLT4gYWEsIGF6IC0+IGJhXG5pbmNyZW1lbnRDaGFycyA9IChzdHIpIC0+XG4gIHJldHVybiBcImFcIiBpZiBzdHIubGVuZ3RoIDwgMVxuXG4gIHVwcGVyQ2FzZSA9IGlzVXBwZXJDYXNlKHN0cilcbiAgc3RyID0gc3RyLnRvTG93ZXJDYXNlKCkgaWYgdXBwZXJDYXNlXG5cbiAgY2hhcnMgPSBzdHIuc3BsaXQoXCJcIilcbiAgY2FycnkgPSAxXG4gIGluZGV4ID0gY2hhcnMubGVuZ3RoIC0gMVxuXG4gIHdoaWxlIGNhcnJ5ICE9IDAgJiYgaW5kZXggPj0gMFxuICAgIG5leHRDaGFyQ29kZSA9IGNoYXJzW2luZGV4XS5jaGFyQ29kZUF0KCkgKyBjYXJyeVxuXG4gICAgaWYgbmV4dENoYXJDb2RlID4gXCJ6XCIuY2hhckNvZGVBdCgpXG4gICAgICBjaGFyc1tpbmRleF0gPSBcImFcIlxuICAgICAgaW5kZXggLT0gMVxuICAgICAgY2FycnkgPSAxXG4gICAgICBsb3dlckNhc2UgPSAxXG4gICAgZWxzZVxuICAgICAgY2hhcnNbaW5kZXhdID0gU3RyaW5nLmZyb21DaGFyQ29kZShuZXh0Q2hhckNvZGUpXG4gICAgICBjYXJyeSA9IDBcblxuICBjaGFycy51bnNoaWZ0KFwiYVwiKSBpZiBjYXJyeSA9PSAxXG5cbiAgc3RyID0gY2hhcnMuam9pbihcIlwiKVxuICBpZiB1cHBlckNhc2UgdGhlbiBzdHIudG9VcHBlckNhc2UoKSBlbHNlIHN0clxuXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9lcGVsaS91bmRlcnNjb3JlLnN0cmluZy9ibG9iL21hc3Rlci9jbGVhbkRpYWNyaXRpY3MuanNcbmNsZWFuRGlhY3JpdGljcyA9IChzdHIpIC0+XG4gIHJldHVybiBcIlwiIHVubGVzcyBzdHJcblxuICBmcm9tID0gXCLEhcOgw6HDpMOiw6PDpcOmxIPEh8SNxInEmcOow6nDq8OqxJ3EpcOsw63Dr8OuxLXFgsS+xYTFiMOyw7PDtsWRw7TDtcOww7jFm8iZxaHFncWlyJvFrcO5w7rDvMWxw7vDscO/w73Dp8W8xbrFvlwiXG4gIHRvID0gXCJhYWFhYWFhYWFjY2NlZWVlZWdoaWlpaWpsbG5ub29vb29vb29zc3NzdHR1dXV1dXVueXljenp6XCJcblxuICBmcm9tICs9IGZyb20udG9VcHBlckNhc2UoKVxuICB0byArPSB0by50b1VwcGVyQ2FzZSgpXG5cbiAgdG8gPSB0by5zcGxpdChcIlwiKVxuXG4gICMgZm9yIHRva2VucyByZXF1aXJlaW5nIG11bHRpdG9rZW4gb3V0cHV0XG4gIGZyb20gKz0gXCLDn1wiXG4gIHRvLnB1c2goJ3NzJylcblxuICBzdHIucmVwbGFjZSAvLnsxfS9nLCAoYykgLT5cbiAgICBpbmRleCA9IGZyb20uaW5kZXhPZihjKVxuICAgIGlmIGluZGV4ID09IC0xIHRoZW4gYyBlbHNlIHRvW2luZGV4XVxuXG5TTFVHSVpFX0NPTlRST0xfUkVHRVggPSAvW1xcdTAwMDAtXFx1MDAxZl0vZ1xuU0xVR0laRV9TUEVDSUFMX1JFR0VYID0gL1tcXHN+YCFAI1xcJCVcXF4mXFwqXFwoXFwpXFwtX1xcKz1cXFtcXF1cXHtcXH1cXHxcXFxcOzpcIic8PixcXC5cXD9cXC9dKy9nXG5cbiMgaHR0cHM6Ly9naXRodWIuY29tL2hleG9qcy9oZXhvLXV0aWwvYmxvYi9tYXN0ZXIvbGliL3NsdWdpemUuanNcbnNsdWdpemUgPSAoc3RyLCBzZXBhcmF0b3IgPSAnLScpIC0+XG4gIHJldHVybiBcIlwiIHVubGVzcyBzdHJcblxuICBlc2NhcGVkU2VwID0gZXNjYXBlUmVnRXhwKHNlcGFyYXRvcilcblxuICBjbGVhbkRpYWNyaXRpY3Moc3RyKS50cmltKCkudG9Mb3dlckNhc2UoKVxuICAgICMgUmVtb3ZlIGNvbnRyb2wgY2hhcmFjdGVyc1xuICAgIC5yZXBsYWNlKFNMVUdJWkVfQ09OVFJPTF9SRUdFWCwgJycpXG4gICAgIyBSZXBsYWNlIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgIC5yZXBsYWNlKFNMVUdJWkVfU1BFQ0lBTF9SRUdFWCwgc2VwYXJhdG9yKVxuICAgICMgUmVtb3ZlIGNvbnRpbm91cyBzZXBhcmF0b3JzXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cChlc2NhcGVkU2VwICsgJ3syLH0nLCAnZycpLCBzZXBhcmF0b3IpXG4gICAgIyBSZW1vdmUgcHJlZml4aW5nIGFuZCB0cmFpbGluZyBzZXBhcnRvcnNcbiAgICAucmVwbGFjZShuZXcgUmVnRXhwKCdeJyArIGVzY2FwZWRTZXAgKyAnK3wnICsgZXNjYXBlZFNlcCArICcrJCcsICdnJyksICcnKVxuXG5nZXRQYWNrYWdlUGF0aCA9IChzZWdtZW50cy4uLikgLT5cbiAgc2VnbWVudHMudW5zaGlmdChhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aChcIm1hcmtkb3duLXdyaXRlclwiKSlcbiAgcGF0aC5qb2luLmFwcGx5KG51bGwsIHNlZ21lbnRzKVxuXG5nZXRQcm9qZWN0UGF0aCA9IC0+XG4gIHBhdGhzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgaWYgcGF0aHMgJiYgcGF0aHMubGVuZ3RoID4gMFxuICAgIHBhdGhzWzBdXG4gIGVsc2UgIyBHaXZlIHRoZSB1c2VyIGEgcGF0aCBpZiB0aGVyZSdzIG5vIHByb2plY3QgcGF0aHMuXG4gICAgYXRvbS5jb25maWcuZ2V0KFwiY29yZS5wcm9qZWN0SG9tZVwiKVxuXG5nZXRTaXRlUGF0aCA9IChjb25maWdQYXRoKSAtPlxuICBnZXRBYnNvbHV0ZVBhdGgoY29uZmlnUGF0aCB8fCBnZXRQcm9qZWN0UGF0aCgpKVxuXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvb3MtaG9tZWRpci9ibG9iL21hc3Rlci9pbmRleC5qc1xuZ2V0SG9tZWRpciA9IC0+XG4gIHJldHVybiBvcy5ob21lZGlyKCkgaWYgdHlwZW9mKG9zLmhvbWVkaXIpID09IFwiZnVuY3Rpb25cIlxuXG4gIGVudiA9IHByb2Nlc3MuZW52XG4gIGhvbWUgPSBlbnYuSE9NRVxuICB1c2VyID0gZW52LkxPR05BTUUgfHwgZW52LlVTRVIgfHwgZW52LkxOQU1FIHx8IGVudi5VU0VSTkFNRVxuXG4gIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJ3aW4zMlwiXG4gICAgZW52LlVTRVJQUk9GSUxFIHx8IGVudi5IT01FRFJJVkUgKyBlbnYuSE9NRVBBVEggfHwgaG9tZVxuICBlbHNlIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJkYXJ3aW5cIlxuICAgIGhvbWUgfHwgKFwiL1VzZXJzL1wiICsgdXNlciBpZiB1c2VyKVxuICBlbHNlIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gXCJsaW51eFwiXG4gICAgaG9tZSB8fCAoXCIvcm9vdFwiIGlmIHByb2Nlc3MuZ2V0dWlkKCkgPT0gMCkgfHwgKFwiL2hvbWUvXCIgKyB1c2VyIGlmIHVzZXIpXG4gIGVsc2VcbiAgICBob21lXG5cbiMgQmFzaWNhbGx5IGV4cGFuZCB+LyB0byBob21lIGRpcmVjdG9yeVxuIyBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3VudGlsZGlmeS9ibG9iL21hc3Rlci9pbmRleC5qc1xuZ2V0QWJzb2x1dGVQYXRoID0gKHBhdGgpIC0+XG4gIGhvbWUgPSBnZXRIb21lZGlyKClcbiAgaWYgaG9tZSB0aGVuIHBhdGgucmVwbGFjZSgvXn4oJHxcXC98XFxcXCkvLCBob21lICsgJyQxJykgZWxzZSBwYXRoXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgR2VuZXJhbCBWaWV3IEhlbHBlcnNcbiNcblxuc2V0VGFiSW5kZXggPSAoZWxlbXMpIC0+XG4gIGVsZW1bMF0udGFiSW5kZXggPSBpICsgMSBmb3IgZWxlbSwgaSBpbiBlbGVtc1xuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFRlbXBsYXRlXG4jXG5cblRFTVBMQVRFX1JFR0VYID0gLy8vXG4gIFtcXDxcXHtdICAgICAgICAjIHN0YXJ0IHdpdGggPCBvciB7XG4gIChbXFx3XFwuXFwtXSs/KSAgIyBhbnkgcmVhc29uYWJsZSB3b3JkcywgLSBvciAuXG4gIFtcXD5cXH1dICAgICAgICAjIGVuZCB3aXRoID4gb3IgfVxuICAvLy9nXG5cblVOVEVNUExBVEVfUkVHRVggPSAvLy9cbiAgKD86XFw8fFxcXFxcXHspICAgIyBzdGFydCB3aXRoIDwgb3IgXFx7XG4gIChbXFx3XFwuXFwtXSs/KSAgIyBhbnkgcmVhc29uYWJsZSB3b3JkcywgLSBvciAuXG4gICg/OlxcPnxcXFxcXFx9KSAgICMgZW5kIHdpdGggPiBvciBcXH1cbiAgLy8vZ1xuXG50ZW1wbGF0ZSA9ICh0ZXh0LCBkYXRhLCBtYXRjaGVyID0gVEVNUExBVEVfUkVHRVgpIC0+XG4gIHRleHQucmVwbGFjZSBtYXRjaGVyLCAobWF0Y2gsIGF0dHIpIC0+XG4gICAgaWYgZGF0YVthdHRyXT8gdGhlbiBkYXRhW2F0dHJdIGVsc2UgbWF0Y2hcblxuIyBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHJldmVyc2UgcGFyc2UgdGhlIHRlbXBsYXRlLCBlLmcuXG4jXG4jIFBhc3MgYHVudGVtcGxhdGUoXCJ7eWVhcn0te21vbnRofVwiKWAgcmV0dXJucyBhIGZ1bmN0aW9uIGBmbmAsIHRoYXQgYGZuKFwiMjAxNS0xMVwiKSAjID0+IHsgXzogXCIyMDE1LTExXCIsIHllYXI6IDIwMTUsIG1vbnRoOiAxMSB9YFxuI1xudW50ZW1wbGF0ZSA9ICh0ZXh0LCBtYXRjaGVyID0gVU5URU1QTEFURV9SRUdFWCkgLT5cbiAga2V5cyA9IFtdXG5cbiAgdGV4dCA9IGVzY2FwZVJlZ0V4cCh0ZXh0KS5yZXBsYWNlIG1hdGNoZXIsIChtYXRjaCwgYXR0cikgLT5cbiAgICBrZXlzLnB1c2goYXR0cilcbiAgICBpZiBbXCJ5ZWFyXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcZHs0fSlcIlxuICAgIGVsc2UgaWYgW1wibW9udGhcIiwgXCJkYXlcIiwgXCJob3VyXCIsIFwibWludXRlXCIsIFwic2Vjb25kXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcZHsyfSlcIlxuICAgIGVsc2UgaWYgW1wiaV9tb250aFwiLCBcImlfZGF5XCIsIFwiaV9ob3VyXCIsIFwiaV9taW51dGVcIiwgXCJpX3NlY29uZFwiXS5pbmRleE9mKGF0dHIpICE9IC0xIHRoZW4gXCIoXFxcXGR7MSwyfSlcIlxuICAgIGVsc2UgaWYgW1wiZXh0ZW5zaW9uXCJdLmluZGV4T2YoYXR0cikgIT0gLTEgdGhlbiBcIihcXFxcLlxcXFx3KylcIlxuICAgIGVsc2UgXCIoW1xcXFxzXFxcXFNdKylcIlxuXG4gIGNyZWF0ZVVudGVtcGxhdGVNYXRjaGVyKGtleXMsIC8vLyBeICN7dGV4dH0gJCAvLy8pXG5cbmNyZWF0ZVVudGVtcGxhdGVNYXRjaGVyID0gKGtleXMsIHJlZ2V4KSAtPlxuICAoc3RyKSAtPlxuICAgIHJldHVybiB1bmxlc3Mgc3RyXG5cbiAgICBtYXRjaGVzID0gcmVnZXguZXhlYyhzdHIpXG4gICAgcmV0dXJuIHVubGVzcyBtYXRjaGVzXG5cbiAgICByZXN1bHRzID0geyBcIl9cIiA6IG1hdGNoZXNbMF0gfVxuICAgIGtleXMuZm9yRWFjaCAoa2V5LCBpZHgpIC0+IHJlc3VsdHNba2V5XSA9IG1hdGNoZXNbaWR4ICsgMV1cbiAgICByZXN1bHRzXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgRGF0ZSBhbmQgVGltZVxuI1xuXG5wYXJzZURhdGUgPSAoaGFzaCkgLT5cbiAgZGF0ZSA9IG5ldyBEYXRlKClcblxuICBtYXAgPVxuICAgIHNldFllYXI6IFtcInllYXJcIl1cbiAgICBzZXRNb250aDogW1wibW9udGhcIiwgXCJpX21vbnRoXCJdXG4gICAgc2V0RGF0ZTogW1wiZGF5XCIsIFwiaV9kYXlcIl1cbiAgICBzZXRIb3VyczogW1wiaG91clwiLCBcImlfaG91clwiXVxuICAgIHNldE1pbnV0ZXM6IFtcIm1pbnV0ZVwiLCBcImlfbWludXRlXCJdXG4gICAgc2V0U2Vjb25kczogW1wic2Vjb25kXCIsIFwiaV9zZWNvbmRcIl1cblxuICBmb3Iga2V5LCB2YWx1ZXMgb2YgbWFwXG4gICAgdmFsdWUgPSB2YWx1ZXMuZmluZCAodmFsKSAtPiAhIWhhc2hbdmFsXVxuICAgIGlmIHZhbHVlXG4gICAgICB2YWx1ZSA9IHBhcnNlSW50KGhhc2hbdmFsdWVdLCAxMClcbiAgICAgIHZhbHVlID0gdmFsdWUgLSAxIGlmIGtleSA9PSAnc2V0TW9udGgnXG4gICAgICBkYXRlW2tleV0odmFsdWUpXG5cbiAgZ2V0RGF0ZShkYXRlKVxuXG5nZXREYXRlID0gKGRhdGUgPSBuZXcgRGF0ZSgpKSAtPlxuICB5ZWFyOiBcIlwiICsgZGF0ZS5nZXRGdWxsWWVhcigpXG4gICMgd2l0aCBwcmVwZW5kZWQgMFxuICBtb250aDogKFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpKS5zbGljZSgtMilcbiAgZGF5OiAoXCIwXCIgKyBkYXRlLmdldERhdGUoKSkuc2xpY2UoLTIpXG4gIGhvdXI6IChcIjBcIiArIGRhdGUuZ2V0SG91cnMoKSkuc2xpY2UoLTIpXG4gIG1pbnV0ZTogKFwiMFwiICsgZGF0ZS5nZXRNaW51dGVzKCkpLnNsaWNlKC0yKVxuICBzZWNvbmQ6IChcIjBcIiArIGRhdGUuZ2V0U2Vjb25kcygpKS5zbGljZSgtMilcbiAgIyB3aXRob3V0IHByZXBlbmQgMFxuICBpX21vbnRoOiBcIlwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpXG4gIGlfZGF5OiBcIlwiICsgZGF0ZS5nZXREYXRlKClcbiAgaV9ob3VyOiBcIlwiICsgZGF0ZS5nZXRIb3VycygpXG4gIGlfbWludXRlOiBcIlwiICsgZGF0ZS5nZXRNaW51dGVzKClcbiAgaV9zZWNvbmQ6IFwiXCIgKyBkYXRlLmdldFNlY29uZHMoKVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEltYWdlIEhUTUwgVGFnXG4jXG5cbklNR19UQUdfUkVHRVggPSAvLy8gPGltZyAoLio/KVxcLz8+IC8vL2lcbklNR19UQUdfQVRUUklCVVRFID0gLy8vIChbYS16XSs/KT0oJ3xcIikoLio/KVxcMiAvLy9pZ1xuXG4jIERldGVjdCBpdCBpcyBhIEhUTUwgaW1hZ2UgdGFnXG5pc0ltYWdlVGFnID0gKGlucHV0KSAtPiBJTUdfVEFHX1JFR0VYLnRlc3QoaW5wdXQpXG5wYXJzZUltYWdlVGFnID0gKGlucHV0KSAtPlxuICBpbWcgPSB7fVxuICBhdHRyaWJ1dGVzID0gSU1HX1RBR19SRUdFWC5leGVjKGlucHV0KVsxXS5tYXRjaChJTUdfVEFHX0FUVFJJQlVURSlcbiAgcGF0dGVybiA9IC8vLyAje0lNR19UQUdfQVRUUklCVVRFLnNvdXJjZX0gLy8vaVxuICBhdHRyaWJ1dGVzLmZvckVhY2ggKGF0dHIpIC0+XG4gICAgZWxlbSA9IHBhdHRlcm4uZXhlYyhhdHRyKVxuICAgIGltZ1tlbGVtWzFdXSA9IGVsZW1bM10gaWYgZWxlbVxuICByZXR1cm4gaW1nXG5cblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBTb21lIHNoYXJlZCByZWdleCBiYXNpY3NcbiNcblxuIyBbdXJsfHVybCBcInRpdGxlXCJdXG5VUkxfQU5EX1RJVExFID0gLy8vXG4gIChcXFMqPykgICAgICAgICAgICAgICAgICAjIGEgdXJsXG4gICg/OlxuICAgIFxcICsgICAgICAgICAgICAgICAgICAgIyBzcGFjZXNcbiAgICBbXCInXFxcXChdPyguKj8pW1wiJ1xcXFwpXT8gIyBxdW90ZWQgdGl0bGVcbiAgKT8gICAgICAgICAgICAgICAgICAgICAgIyBtaWdodCBub3QgcHJlc2VudFxuICAvLy8uc291cmNlXG5cbiMgW2ltYWdlfHRleHRdXG5JTUdfT1JfVEVYVCA9IC8vLyAoIVxcWy4qP1xcXVxcKC4rP1xcKSB8IFteXFxbXSs/KSAvLy8uc291cmNlXG4jIGF0IGhlYWQgb3Igbm90ICFbLCB3b3JrYXJvdW5kIG9mIG5vIG5lZy1sb29rYmVoaW5kIGluIEpTXG5PUEVOX1RBRyA9IC8vLyAoPzpefFteIV0pKD89XFxbKSAvLy8uc291cmNlXG4jIGxpbmsgaWQgZG9uJ3QgY29udGFpbnMgWyBvciBdXG5MSU5LX0lEID0gLy8vIFteXFxbXFxdXSsgLy8vLnNvdXJjZVxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEltYWdlXG4jXG5cbklNR19SRUdFWCAgPSAvLy9cbiAgISBcXFsgKC4qPykgXFxdICAgICAgICAgICAgIyAhW2VtcHR5fHRleHRdXG4gICAgXFwoICN7VVJMX0FORF9USVRMRX0gXFwpICMgKGltYWdlIHBhdGgsIGFueSBkZXNjcmlwdGlvbilcbiAgLy8vXG5cbmlzSW1hZ2UgPSAoaW5wdXQpIC0+IElNR19SRUdFWC50ZXN0KGlucHV0KVxucGFyc2VJbWFnZSA9IChpbnB1dCkgLT5cbiAgaW1hZ2UgPSBJTUdfUkVHRVguZXhlYyhpbnB1dClcblxuICBpZiBpbWFnZSAmJiBpbWFnZS5sZW5ndGggPj0gMlxuICAgIHJldHVybiBhbHQ6IGltYWdlWzFdLCBzcmM6IGltYWdlWzJdLCB0aXRsZTogaW1hZ2VbM10gfHwgXCJcIlxuICBlbHNlXG4gICAgcmV0dXJuIGFsdDogaW5wdXQsIHNyYzogXCJcIiwgdGl0bGU6IFwiXCJcblxuSU1HX0VYVEVOU0lPTlMgPSBbXCIuanBnXCIsIFwiLmpwZWdcIiwgXCIucG5nXCIsIFwiLmdpZlwiLCBcIi5pY29cIl1cblxuaXNJbWFnZUZpbGUgPSAoZmlsZSkgLT5cbiAgZmlsZSAmJiAocGF0aC5leHRuYW1lKGZpbGUpLnRvTG93ZXJDYXNlKCkgaW4gSU1HX0VYVEVOU0lPTlMpXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgSW5saW5lIGxpbmtcbiNcblxuSU5MSU5FX0xJTktfUkVHRVggPSAvLy9cbiAgXFxbICN7SU1HX09SX1RFWFR9IFxcXSAgICMgW2ltYWdlfHRleHRdXG4gIFxcKCAje1VSTF9BTkRfVElUTEV9IFxcKSAjICh1cmwgXCJhbnkgdGl0bGVcIilcbiAgLy8vXG5cbklOTElORV9MSU5LX1RFU1RfUkVHRVggPSAvLy9cbiAgI3tPUEVOX1RBR31cbiAgI3tJTkxJTkVfTElOS19SRUdFWC5zb3VyY2V9XG4gIC8vL1xuXG5pc0lubGluZUxpbmsgPSAoaW5wdXQpIC0+IElOTElORV9MSU5LX1RFU1RfUkVHRVgudGVzdChpbnB1dClcbnBhcnNlSW5saW5lTGluayA9IChpbnB1dCkgLT5cbiAgbGluayA9IElOTElORV9MSU5LX1JFR0VYLmV4ZWMoaW5wdXQpXG5cbiAgaWYgbGluayAmJiBsaW5rLmxlbmd0aCA+PSAyXG4gICAgdGV4dDogbGlua1sxXSwgdXJsOiBsaW5rWzJdLCB0aXRsZTogbGlua1szXSB8fCBcIlwiXG4gIGVsc2VcbiAgICB0ZXh0OiBpbnB1dCwgdXJsOiBcIlwiLCB0aXRsZTogXCJcIlxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFJlZmVyZW5jZSBsaW5rXG4jXG5cbiMgTWF0Y2ggcmVmZXJlbmNlIGxpbmsgW3RleHRdW2lkXVxuUkVGRVJFTkNFX0xJTktfUkVHRVhfT0YgPSAoaWQsIG9wdHMgPSB7fSkgLT5cbiAgaWQgPSBlc2NhcGVSZWdFeHAoaWQpIHVubGVzcyBvcHRzLm5vRXNjYXBlXG4gIC8vL1xuICBcXFsoI3tpZH0pXFxdXFwgP1xcW1xcXSAgICAgICAgICAgICAgICMgW3RleHRdW11cbiAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBvclxuICBcXFsje0lNR19PUl9URVhUfVxcXVxcID9cXFsoI3tpZH0pXFxdICMgW2ltYWdlfHRleHRdW2lkXVxuICAvLy9cblxuIyBNYXRjaCByZWZlcmVuY2UgbGluayBkZWZpbml0aW9ucyBbaWRdOiB1cmxcblJFRkVSRU5DRV9ERUZfUkVHRVhfT0YgPSAoaWQsIG9wdHMgPSB7fSkgLT5cbiAgaWQgPSBlc2NhcGVSZWdFeHAoaWQpIHVubGVzcyBvcHRzLm5vRXNjYXBlXG4gIC8vL1xuICBeICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHN0YXJ0IG9mIGxpbmVcbiAgXFwgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICMgYW55IGxlYWRpbmcgc3BhY2VzXG4gIFxcWygje2lkfSlcXF06XFwgKyAgICAgICAgICAgICAgICMgW2lkXTogZm9sbG93ZWQgYnkgc3BhY2VzXG4gICN7VVJMX0FORF9USVRMRX0gICAgICAgICAgICAgICMgbGluayBcInRpdGxlXCJcbiAgJFxuICAvLy9tXG5cbiMgUkVGRVJFTkNFX0xJTktfUkVHRVguZXhlYyhcIlt0ZXh0XVtpZF1cIilcbiMgPT4gW1wiW3RleHRdW2lkXVwiLCB1bmRlZmluZWQsIFwidGV4dFwiLCBcImlkXCJdXG4jXG4jIFJFRkVSRU5DRV9MSU5LX1JFR0VYLmV4ZWMoXCJbdGV4dF1bXVwiKVxuIyA9PiBbXCJbdGV4dF1bXVwiLCBcInRleHRcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWRdXG5SRUZFUkVOQ0VfTElOS19SRUdFWCA9IFJFRkVSRU5DRV9MSU5LX1JFR0VYX09GKExJTktfSUQsIG5vRXNjYXBlOiB0cnVlKVxuUkVGRVJFTkNFX0xJTktfVEVTVF9SRUdFWCA9IC8vL1xuICAje09QRU5fVEFHfVxuICAje1JFRkVSRU5DRV9MSU5LX1JFR0VYLnNvdXJjZX1cbiAgLy8vXG5cblJFRkVSRU5DRV9ERUZfUkVHRVggPSBSRUZFUkVOQ0VfREVGX1JFR0VYX09GKExJTktfSUQsIG5vRXNjYXBlOiB0cnVlKVxuXG5pc1JlZmVyZW5jZUxpbmsgPSAoaW5wdXQpIC0+IFJFRkVSRU5DRV9MSU5LX1RFU1RfUkVHRVgudGVzdChpbnB1dClcbnBhcnNlUmVmZXJlbmNlTGluayA9IChpbnB1dCwgZWRpdG9yKSAtPlxuICBsaW5rID0gUkVGRVJFTkNFX0xJTktfUkVHRVguZXhlYyhpbnB1dClcbiAgdGV4dCA9IGxpbmtbMl0gfHwgbGlua1sxXVxuICBpZCAgID0gbGlua1szXSB8fCBsaW5rWzFdXG5cbiAgIyBmaW5kIGRlZmluaXRpb24gYW5kIGRlZmluaXRpb25SYW5nZSBpZiBlZGl0b3IgaXMgZ2l2ZW5cbiAgZGVmICA9IHVuZGVmaW5lZFxuICBlZGl0b3IgJiYgZWRpdG9yLmJ1ZmZlci5zY2FuIFJFRkVSRU5DRV9ERUZfUkVHRVhfT0YoaWQpLCAobWF0Y2gpIC0+IGRlZiA9IG1hdGNoXG5cbiAgaWYgZGVmXG4gICAgaWQ6IGlkLCB0ZXh0OiB0ZXh0LCB1cmw6IGRlZi5tYXRjaFsyXSwgdGl0bGU6IGRlZi5tYXRjaFszXSB8fCBcIlwiLFxuICAgIGRlZmluaXRpb25SYW5nZTogZGVmLnJhbmdlXG4gIGVsc2VcbiAgICBpZDogaWQsIHRleHQ6IHRleHQsIHVybDogXCJcIiwgdGl0bGU6IFwiXCIsIGRlZmluaXRpb25SYW5nZTogbnVsbFxuXG5pc1JlZmVyZW5jZURlZmluaXRpb24gPSAoaW5wdXQpIC0+XG4gIGRlZiA9IFJFRkVSRU5DRV9ERUZfUkVHRVguZXhlYyhpbnB1dClcbiAgISFkZWYgJiYgZGVmWzFdWzBdICE9IFwiXlwiICMgbm90IGEgZm9vdG5vdGVcblxucGFyc2VSZWZlcmVuY2VEZWZpbml0aW9uID0gKGlucHV0LCBlZGl0b3IpIC0+XG4gIGRlZiAgPSBSRUZFUkVOQ0VfREVGX1JFR0VYLmV4ZWMoaW5wdXQpXG4gIGlkICAgPSBkZWZbMV1cblxuICAjIGZpbmQgbGluayBhbmQgbGlua1JhbmdlIGlmIGVkaXRvciBpcyBnaXZlblxuICBsaW5rID0gdW5kZWZpbmVkXG4gIGVkaXRvciAmJiBlZGl0b3IuYnVmZmVyLnNjYW4gUkVGRVJFTkNFX0xJTktfUkVHRVhfT0YoaWQpLCAobWF0Y2gpIC0+IGxpbmsgPSBtYXRjaFxuXG4gIGlmIGxpbmtcbiAgICBpZDogaWQsIHRleHQ6IGxpbmsubWF0Y2hbMl0gfHwgbGluay5tYXRjaFsxXSwgdXJsOiBkZWZbMl0sXG4gICAgdGl0bGU6IGRlZlszXSB8fCBcIlwiLCBsaW5rUmFuZ2U6IGxpbmsucmFuZ2VcbiAgZWxzZVxuICAgIGlkOiBpZCwgdGV4dDogXCJcIiwgdXJsOiBkZWZbMl0sIHRpdGxlOiBkZWZbM10gfHwgXCJcIiwgbGlua1JhbmdlOiBudWxsXG5cbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgRm9vdG5vdGVcbiNcblxuRk9PVE5PVEVfUkVHRVggPSAvLy8gXFxbIFxcXiAoLis/KSBcXF0gKDopPyAvLy9cbkZPT1ROT1RFX1RFU1RfUkVHRVggPSAvLy9cbiAgI3tPUEVOX1RBR31cbiAgI3tGT09UTk9URV9SRUdFWC5zb3VyY2V9XG4gIC8vL1xuXG5pc0Zvb3Rub3RlID0gKGlucHV0KSAtPiBGT09UTk9URV9URVNUX1JFR0VYLnRlc3QoaW5wdXQpXG5wYXJzZUZvb3Rub3RlID0gKGlucHV0KSAtPlxuICBmb290bm90ZSA9IEZPT1ROT1RFX1JFR0VYLmV4ZWMoaW5wdXQpXG4gIGxhYmVsOiBmb290bm90ZVsxXSwgaXNEZWZpbml0aW9uOiBmb290bm90ZVsyXSA9PSBcIjpcIiwgY29udGVudDogXCJcIlxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFRhYmxlXG4jXG5cblRBQkxFX1NFUEFSQVRPUl9SRUdFWCA9IC8vL1xuICBeXG4gIChcXHwpPyAgICAgICAgICAgICAgICAjIHN0YXJ0cyB3aXRoIGFuIG9wdGlvbmFsIHxcbiAgKFxuICAgKD86XFxzKig/Oi0rfDotKjp8Oi0qfC0qOilcXHMqXFx8KSsgICAgIyBvbmUgb3IgbW9yZSB0YWJsZSBjZWxsXG4gICAoPzpcXHMqKD86LSt8Oi0qOnw6LSp8LSo6KVxccyp8XFxzKykgICAjIGxhc3QgdGFibGUgY2VsbCwgb3IgZW1wdHkgY2VsbFxuICApXG4gIChcXHwpPyAgICAgICAgICAgICAgICAjIGVuZHMgd2l0aCBhbiBvcHRpb25hbCB8XG4gICRcbiAgLy8vXG5cblRBQkxFX09ORV9DT0xVTU5fU0VQQVJBVE9SX1JFR0VYID0gLy8vIF4gKFxcfCkgKFxccyo6Py0rOj9cXHMqKSAoXFx8KSAkIC8vL1xuXG5pc1RhYmxlU2VwYXJhdG9yID0gKGxpbmUpIC0+XG4gIFRBQkxFX1NFUEFSQVRPUl9SRUdFWC50ZXN0KGxpbmUpIHx8XG4gICAgVEFCTEVfT05FX0NPTFVNTl9TRVBBUkFUT1JfUkVHRVgudGVzdChsaW5lKVxuXG5wYXJzZVRhYmxlU2VwYXJhdG9yID0gKGxpbmUpIC0+XG4gIG1hdGNoZXMgPSBUQUJMRV9TRVBBUkFUT1JfUkVHRVguZXhlYyhsaW5lKSB8fFxuICAgIFRBQkxFX09ORV9DT0xVTU5fU0VQQVJBVE9SX1JFR0VYLmV4ZWMobGluZSlcbiAgZXh0cmFQaXBlcyA9ICEhKG1hdGNoZXNbMV0gfHwgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aCAtIDFdKVxuICBjb2x1bW5zID0gbWF0Y2hlc1syXS5zcGxpdChcInxcIikubWFwIChjb2wpIC0+IGNvbC50cmltKClcblxuICByZXR1cm4ge1xuICAgIHNlcGFyYXRvcjogdHJ1ZVxuICAgIGV4dHJhUGlwZXM6IGV4dHJhUGlwZXNcbiAgICBjb2x1bW5zOiBjb2x1bW5zXG4gICAgY29sdW1uV2lkdGhzOiBjb2x1bW5zLm1hcCAoY29sKSAtPiBjb2wubGVuZ3RoXG4gICAgYWxpZ25tZW50czogY29sdW1ucy5tYXAgKGNvbCkgLT5cbiAgICAgIGhlYWQgPSBjb2xbMF0gPT0gXCI6XCJcbiAgICAgIHRhaWwgPSBjb2xbY29sLmxlbmd0aCAtIDFdID09IFwiOlwiXG5cbiAgICAgIGlmIGhlYWQgJiYgdGFpbFxuICAgICAgICBcImNlbnRlclwiXG4gICAgICBlbHNlIGlmIGhlYWRcbiAgICAgICAgXCJsZWZ0XCJcbiAgICAgIGVsc2UgaWYgdGFpbFxuICAgICAgICBcInJpZ2h0XCJcbiAgICAgIGVsc2VcbiAgICAgICAgXCJlbXB0eVwiXG4gIH1cblxuVEFCTEVfUk9XX1JFR0VYID0gLy8vXG4gIF5cbiAgKFxcfCk/ICAgICAgICAgICAgICAgICMgc3RhcnRzIHdpdGggYW4gb3B0aW9uYWwgfFxuICAoLis/XFx8Lis/KSAgICAgICAgICAgIyBhbnkgY29udGVudCB3aXRoIGF0IGxlYXN0IDIgY29sdW1uc1xuICAoXFx8KT8gICAgICAgICAgICAgICAgIyBlbmRzIHdpdGggYW4gb3B0aW9uYWwgfFxuICAkXG4gIC8vL1xuXG5UQUJMRV9PTkVfQ09MVU1OX1JPV19SRUdFWCA9IC8vLyBeIChcXHwpICguKz8pIChcXHwpICQgLy8vXG5cbmlzVGFibGVSb3cgPSAobGluZSkgLT5cbiAgVEFCTEVfUk9XX1JFR0VYLnRlc3QobGluZSkgfHwgVEFCTEVfT05FX0NPTFVNTl9ST1dfUkVHRVgudGVzdChsaW5lKVxuXG5wYXJzZVRhYmxlUm93ID0gKGxpbmUpIC0+XG4gIHJldHVybiBwYXJzZVRhYmxlU2VwYXJhdG9yKGxpbmUpIGlmIGlzVGFibGVTZXBhcmF0b3IobGluZSlcblxuICBtYXRjaGVzID0gVEFCTEVfUk9XX1JFR0VYLmV4ZWMobGluZSkgfHwgVEFCTEVfT05FX0NPTFVNTl9ST1dfUkVHRVguZXhlYyhsaW5lKVxuICBleHRyYVBpcGVzID0gISEobWF0Y2hlc1sxXSB8fCBtYXRjaGVzW21hdGNoZXMubGVuZ3RoIC0gMV0pXG4gIGNvbHVtbnMgPSBtYXRjaGVzWzJdLnNwbGl0KFwifFwiKS5tYXAgKGNvbCkgLT4gY29sLnRyaW0oKVxuXG4gIHJldHVybiB7XG4gICAgc2VwYXJhdG9yOiBmYWxzZVxuICAgIGV4dHJhUGlwZXM6IGV4dHJhUGlwZXNcbiAgICBjb2x1bW5zOiBjb2x1bW5zXG4gICAgY29sdW1uV2lkdGhzOiBjb2x1bW5zLm1hcCAoY29sKSAtPiB3Y3N3aWR0aChjb2wpXG4gIH1cblxuIyBkZWZhdWx0czpcbiMgICBudW1PZkNvbHVtbnM6IDNcbiMgICBjb2x1bW5XaWR0aDogM1xuIyAgIGNvbHVtbldpZHRoczogW11cbiMgICBleHRyYVBpcGVzOiB0cnVlXG4jICAgYWxpZ25tZW50OiBcImxlZnRcIiB8IFwicmlnaHRcIiB8IFwiY2VudGVyXCIgfCBcImVtcHR5XCJcbiMgICBhbGlnbm1lbnRzOiBbXVxuY3JlYXRlVGFibGVTZXBhcmF0b3IgPSAob3B0aW9ucykgLT5cbiAgb3B0aW9ucy5jb2x1bW5XaWR0aHMgPz0gW11cbiAgb3B0aW9ucy5hbGlnbm1lbnRzID89IFtdXG5cbiAgcm93ID0gW11cbiAgZm9yIGkgaW4gWzAuLm9wdGlvbnMubnVtT2ZDb2x1bW5zIC0gMV1cbiAgICBjb2x1bW5XaWR0aCA9IG9wdGlvbnMuY29sdW1uV2lkdGhzW2ldIHx8IG9wdGlvbnMuY29sdW1uV2lkdGhcblxuICAgICMgZW1wdHkgc3BhY2VzIHdpbGwgYmUgaW5zZXJ0ZWQgd2hlbiBqb2luIHBpcGVzLCBzbyBuZWVkIHRvIGNvbXBlbnNhdGUgaGVyZVxuICAgIGlmICFvcHRpb25zLmV4dHJhUGlwZXMgJiYgKGkgPT0gMCB8fCBpID09IG9wdGlvbnMubnVtT2ZDb2x1bW5zIC0gMSlcbiAgICAgIGNvbHVtbldpZHRoICs9IDFcbiAgICBlbHNlXG4gICAgICBjb2x1bW5XaWR0aCArPSAyXG5cbiAgICBzd2l0Y2ggb3B0aW9ucy5hbGlnbm1lbnRzW2ldIHx8IG9wdGlvbnMuYWxpZ25tZW50XG4gICAgICB3aGVuIFwiY2VudGVyXCJcbiAgICAgICAgcm93LnB1c2goXCI6XCIgKyBcIi1cIi5yZXBlYXQoY29sdW1uV2lkdGggLSAyKSArIFwiOlwiKVxuICAgICAgd2hlbiBcImxlZnRcIlxuICAgICAgICByb3cucHVzaChcIjpcIiArIFwiLVwiLnJlcGVhdChjb2x1bW5XaWR0aCAtIDEpKVxuICAgICAgd2hlbiBcInJpZ2h0XCJcbiAgICAgICAgcm93LnB1c2goXCItXCIucmVwZWF0KGNvbHVtbldpZHRoIC0gMSkgKyBcIjpcIilcbiAgICAgIGVsc2VcbiAgICAgICAgcm93LnB1c2goXCItXCIucmVwZWF0KGNvbHVtbldpZHRoKSlcblxuICByb3cgPSByb3cuam9pbihcInxcIilcbiAgaWYgb3B0aW9ucy5leHRyYVBpcGVzIHRoZW4gXCJ8I3tyb3d9fFwiIGVsc2Ugcm93XG5cbiMgY29sdW1uczogW3ZhbHVlc11cbiMgZGVmYXVsdHM6XG4jICAgbnVtT2ZDb2x1bW5zOiAzXG4jICAgY29sdW1uV2lkdGg6IDNcbiMgICBjb2x1bW5XaWR0aHM6IFtdXG4jICAgZXh0cmFQaXBlczogdHJ1ZVxuIyAgIGFsaWdubWVudDogXCJsZWZ0XCIgfCBcInJpZ2h0XCIgfCBcImNlbnRlclwiIHwgXCJlbXB0eVwiXG4jICAgYWxpZ25tZW50czogW11cbmNyZWF0ZVRhYmxlUm93ID0gKGNvbHVtbnMsIG9wdGlvbnMpIC0+XG4gIG9wdGlvbnMuY29sdW1uV2lkdGhzID89IFtdXG4gIG9wdGlvbnMuYWxpZ25tZW50cyA/PSBbXVxuXG4gIHJvdyA9IFtdXG4gIGZvciBpIGluIFswLi5vcHRpb25zLm51bU9mQ29sdW1ucyAtIDFdXG4gICAgY29sdW1uV2lkdGggPSBvcHRpb25zLmNvbHVtbldpZHRoc1tpXSB8fCBvcHRpb25zLmNvbHVtbldpZHRoXG5cbiAgICBpZiAhY29sdW1uc1tpXVxuICAgICAgcm93LnB1c2goXCIgXCIucmVwZWF0KGNvbHVtbldpZHRoKSlcbiAgICAgIGNvbnRpbnVlXG5cbiAgICBsZW4gPSBjb2x1bW5XaWR0aCAtIHdjc3dpZHRoKGNvbHVtbnNbaV0pXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ29sdW1uIHdpZHRoICN7Y29sdW1uV2lkdGh9IC0gd2Nzd2lkdGgoJyN7Y29sdW1uc1tpXX0nKSBjYW5ub3QgYmUgI3tsZW59XCIpIGlmIGxlbiA8IDBcblxuICAgIHN3aXRjaCBvcHRpb25zLmFsaWdubWVudHNbaV0gfHwgb3B0aW9ucy5hbGlnbm1lbnRcbiAgICAgIHdoZW4gXCJjZW50ZXJcIlxuICAgICAgICByb3cucHVzaChcIiBcIi5yZXBlYXQobGVuIC8gMikgKyBjb2x1bW5zW2ldICsgXCIgXCIucmVwZWF0KChsZW4gKyAxKSAvIDIpKVxuICAgICAgd2hlbiBcImxlZnRcIlxuICAgICAgICByb3cucHVzaChjb2x1bW5zW2ldICsgXCIgXCIucmVwZWF0KGxlbikpXG4gICAgICB3aGVuIFwicmlnaHRcIlxuICAgICAgICByb3cucHVzaChcIiBcIi5yZXBlYXQobGVuKSArIGNvbHVtbnNbaV0pXG4gICAgICBlbHNlXG4gICAgICAgIHJvdy5wdXNoKGNvbHVtbnNbaV0gKyBcIiBcIi5yZXBlYXQobGVuKSlcblxuICByb3cgPSByb3cuam9pbihcIiB8IFwiKVxuICBpZiBvcHRpb25zLmV4dHJhUGlwZXMgdGhlbiBcInwgI3tyb3d9IHxcIiBlbHNlIHJvd1xuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFVSTFxuI1xuXG5VUkxfUkVHRVggPSAvLy9cbiAgXlxuICAoPzpcXHcrOik/XFwvXFwvICAgICAgICAgICAgICAgICAgICAgICAjIGFueSBwcmVmaXgsIGUuZy4gaHR0cDovL1xuICAoW15cXHNcXC5dK1xcLlxcU3syfXxsb2NhbGhvc3RbXFw6P1xcZF0qKSAjIHNvbWUgZG9tYWluXG4gIFxcUyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHBhdGhcbiAgJFxuICAvLy9pXG5cbmlzVXJsID0gKHVybCkgLT4gVVJMX1JFR0VYLnRlc3QodXJsKVxuXG4jIE5vcm1hbGl6ZSBhIGZpbGUgcGF0aCB0byBVUkwgc2VwYXJhdG9yXG5ub3JtYWxpemVGaWxlUGF0aCA9IChwYXRoKSAtPiBwYXRoLnNwbGl0KC9bXFxcXFxcL10vKS5qb2luKCcvJylcblxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBBdG9tIFRleHRFZGl0b3JcbiNcblxuIyBSZXR1cm4gc2NvcGVTZWxlY3RvciBpZiB0aGVyZSBpcyBhbiBleGFjdCBtYXRjaCxcbiMgZWxzZSByZXR1cm4gYW55IHNjb3BlIGRlc2NyaXB0b3IgY29udGFpbnMgc2NvcGVTZWxlY3RvclxuZ2V0U2NvcGVEZXNjcmlwdG9yID0gKGN1cnNvciwgc2NvcGVTZWxlY3RvcikgLT5cbiAgc2NvcGVzID0gY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpXG4gICAgLmdldFNjb3Blc0FycmF5KClcbiAgICAuZmlsdGVyKChzY29wZSkgLT4gc2NvcGUuaW5kZXhPZihzY29wZVNlbGVjdG9yKSA+PSAwKVxuXG4gIGlmIHNjb3Blcy5pbmRleE9mKHNjb3BlU2VsZWN0b3IpID49IDBcbiAgICByZXR1cm4gc2NvcGVTZWxlY3RvclxuICBlbHNlIGlmIHNjb3Blcy5sZW5ndGggPiAwXG4gICAgcmV0dXJuIHNjb3Blc1swXVxuXG5nZXRCdWZmZXJSYW5nZUZvclNjb3BlID0gKGVkaXRvciwgY3Vyc29yLCBzY29wZVNlbGVjdG9yKSAtPlxuICBwb3MgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gIHJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNjb3BlU2VsZWN0b3IsIHBvcylcbiAgcmV0dXJuIHJhbmdlIGlmIHJhbmdlXG5cbiAgIyBBdG9tIEJ1ZyAxOiBub3QgcmV0dXJuaW5nIHRoZSBjb3JyZWN0IGJ1ZmZlciByYW5nZSB3aGVuIGN1cnNvciBpcyBhdCB0aGUgZW5kIG9mIGEgbGluayB3aXRoIHNjb3BlLFxuICAjIHJlZmVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzc5NjFcbiAgI1xuICAjIEhBQ0sgbW92ZSB0aGUgY3Vyc29yIHBvc2l0aW9uIG9uZSBjaGFyIGJhY2t3YXJkLCBhbmQgdHJ5IHRvIGdldCB0aGUgYnVmZmVyIHJhbmdlIGZvciBzY29wZSBhZ2FpblxuICB1bmxlc3MgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKVxuICAgIHJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNjb3BlU2VsZWN0b3IsIFtwb3Mucm93LCBwb3MuY29sdW1uIC0gMV0pXG4gICAgcmV0dXJuIHJhbmdlIGlmIHJhbmdlXG5cbiAgIyBBdG9tIEJ1ZyAyOiBub3QgcmV0dXJuaW5nIHRoZSBjb3JyZWN0IGJ1ZmZlciByYW5nZSB3aGVuIGN1cnNvciBpcyBhdCB0aGUgaGVhZCBvZiBhIGxpc3QgbGluayB3aXRoIHNjb3BlLFxuICAjIHJlZmVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzEyNzE0XG4gICNcbiAgIyBIQUNLIG1vdmUgdGhlIGN1cnNvciBwb3NpdGlvbiBvbmUgY2hhciBmb3J3YXJkLCBhbmQgdHJ5IHRvIGdldCB0aGUgYnVmZmVyIHJhbmdlIGZvciBzY29wZSBhZ2FpblxuICB1bmxlc3MgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKVxuICAgIHJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NvcGVBdFBvc2l0aW9uKHNjb3BlU2VsZWN0b3IsIFtwb3Mucm93LCBwb3MuY29sdW1uICsgMV0pXG4gICAgcmV0dXJuIHJhbmdlIGlmIHJhbmdlXG5cbiMgR2V0IHRoZSB0ZXh0IGJ1ZmZlciByYW5nZSBpZiBzZWxlY3Rpb24gaXMgbm90IGVtcHR5LCBvciBnZXQgdGhlXG4jIGJ1ZmZlciByYW5nZSBpZiBpdCBpcyBpbnNpZGUgYSBzY29wZSBzZWxlY3Rvciwgb3IgdGhlIGN1cnJlbnQgd29yZC5cbiNcbiMgc2VsZWN0aW9uOiBvcHRpb25hbCwgd2hlbiBub3QgcHJvdmlkZWQgb3IgZW1wdHksIHVzZSB0aGUgbGFzdCBzZWxlY3Rpb25cbiMgb3B0c1tcInNlbGVjdEJ5XCJdOlxuIyAgLSBub3BlOiBkbyBub3QgdXNlIGFueSBzZWxlY3QgYnlcbiMgIC0gbmVhcmVzdFdvcmQ6IHRyeSBzZWxlY3QgbmVhcmVzdCB3b3JkLCBkZWZhdWx0XG4jICAtIGN1cnJlbnRMaW5lOiB0cnkgc2VsZWN0IGN1cnJlbnQgbGluZVxuZ2V0VGV4dEJ1ZmZlclJhbmdlID0gKGVkaXRvciwgc2NvcGVTZWxlY3Rvciwgc2VsZWN0aW9uLCBvcHRzID0ge30pIC0+XG4gIGlmIHR5cGVvZihzZWxlY3Rpb24pID09IFwib2JqZWN0XCJcbiAgICBvcHRzID0gc2VsZWN0aW9uXG4gICAgc2VsZWN0aW9uID0gdW5kZWZpbmVkXG5cbiAgc2VsZWN0aW9uID89IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgY3Vyc29yID0gc2VsZWN0aW9uLmN1cnNvclxuICBzZWxlY3RCeSA9IG9wdHNbXCJzZWxlY3RCeVwiXSB8fCBcIm5lYXJlc3RXb3JkXCJcblxuICBpZiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgZWxzZSBpZiBzY29wZSA9IGdldFNjb3BlRGVzY3JpcHRvcihjdXJzb3IsIHNjb3BlU2VsZWN0b3IpXG4gICAgZ2V0QnVmZmVyUmFuZ2VGb3JTY29wZShlZGl0b3IsIGN1cnNvciwgc2NvcGUpXG4gIGVsc2UgaWYgc2VsZWN0QnkgPT0gXCJuZWFyZXN0V29yZFwiXG4gICAgd29yZFJlZ2V4ID0gY3Vyc29yLndvcmRSZWdFeHAoaW5jbHVkZU5vbldvcmRDaGFyYWN0ZXJzOiBmYWxzZSlcbiAgICBjdXJzb3IuZ2V0Q3VycmVudFdvcmRCdWZmZXJSYW5nZSh3b3JkUmVnZXg6IHdvcmRSZWdleClcbiAgZWxzZSBpZiBzZWxlY3RCeSA9PSBcImN1cnJlbnRMaW5lXCJcbiAgICBjdXJzb3IuZ2V0Q3VycmVudExpbmVCdWZmZXJSYW5nZSgpXG4gIGVsc2VcbiAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4jIEZpbmQgYSBwb3NzaWJsZSBsaW5rIHRhZyBpbiB0aGUgcmFuZ2UgZnJvbSBlZGl0b3IsIHJldHVybiB0aGUgZm91bmQgbGluayBkYXRhIG9yIG5pbFxuI1xuIyBEYXRhIGZvcm1hdDogeyB0ZXh0OiBcIlwiLCB1cmw6IFwiXCIsIHRpdGxlOiBcIlwiLCBpZDogbnVsbCwgbGlua1JhbmdlOiBudWxsLCBkZWZpbml0aW9uUmFuZ2U6IG51bGwgfVxuI1xuIyBOT1RFOiBJZiBpZCBpcyBub3QgbnVsbCwgYW5kIGFueSBvZiBsaW5rUmFuZ2UvZGVmaW5pdGlvblJhbmdlIGlzIG51bGwsIGl0IG1lYW5zIHRoZSBsaW5rIGlzIGFuIG9ycGhhblxuZmluZExpbmtJblJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHNlbGVjdGlvbiA9IGVkaXRvci5nZXRUZXh0SW5SYW5nZShyYW5nZSlcbiAgcmV0dXJuIGlmIHNlbGVjdGlvbiA9PSBcIlwiXG5cbiAgcmV0dXJuIHRleHQ6IFwiXCIsIHVybDogc2VsZWN0aW9uLCB0aXRsZTogXCJcIiBpZiBpc1VybChzZWxlY3Rpb24pXG4gIHJldHVybiBwYXJzZUlubGluZUxpbmsoc2VsZWN0aW9uKSBpZiBpc0lubGluZUxpbmsoc2VsZWN0aW9uKVxuXG4gIGlmIGlzUmVmZXJlbmNlTGluayhzZWxlY3Rpb24pXG4gICAgbGluayA9IHBhcnNlUmVmZXJlbmNlTGluayhzZWxlY3Rpb24sIGVkaXRvcilcbiAgICBsaW5rLmxpbmtSYW5nZSA9IHJhbmdlXG4gICAgcmV0dXJuIGxpbmtcbiAgZWxzZSBpZiBpc1JlZmVyZW5jZURlZmluaXRpb24oc2VsZWN0aW9uKVxuICAgICMgSEFDSyBjb3JyZWN0IHRoZSBkZWZpbml0aW9uIHJhbmdlLCBBdG9tJ3MgbGluayBzY29wZSBkb2VzIG5vdCBpbmNsdWRlXG4gICAgIyBkZWZpbml0aW9uJ3MgdGl0bGUsIHNvIG5vcm1hbGl6ZSB0byBiZSB0aGUgcmFuZ2Ugc3RhcnQgcm93XG4gICAgc2VsZWN0aW9uID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdylcbiAgICByYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyYW5nZS5zdGFydC5yb3cpXG5cbiAgICBsaW5rID0gcGFyc2VSZWZlcmVuY2VEZWZpbml0aW9uKHNlbGVjdGlvbiwgZWRpdG9yKVxuICAgIGxpbmsuZGVmaW5pdGlvblJhbmdlID0gcmFuZ2VcbiAgICByZXR1cm4gbGlua1xuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEV4cG9ydHNcbiNcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXRKU09OOiBnZXRKU09OXG4gIGVzY2FwZVJlZ0V4cDogZXNjYXBlUmVnRXhwXG4gIGlzVXBwZXJDYXNlOiBpc1VwcGVyQ2FzZVxuICBpbmNyZW1lbnRDaGFyczogaW5jcmVtZW50Q2hhcnNcbiAgc2x1Z2l6ZTogc2x1Z2l6ZVxuICBub3JtYWxpemVGaWxlUGF0aDogbm9ybWFsaXplRmlsZVBhdGhcblxuICBnZXRQYWNrYWdlUGF0aDogZ2V0UGFja2FnZVBhdGhcbiAgZ2V0UHJvamVjdFBhdGg6IGdldFByb2plY3RQYXRoXG4gIGdldFNpdGVQYXRoOiBnZXRTaXRlUGF0aFxuICBnZXRIb21lZGlyOiBnZXRIb21lZGlyXG4gIGdldEFic29sdXRlUGF0aDogZ2V0QWJzb2x1dGVQYXRoXG5cbiAgc2V0VGFiSW5kZXg6IHNldFRhYkluZGV4XG5cbiAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIHVudGVtcGxhdGU6IHVudGVtcGxhdGVcblxuICBnZXREYXRlOiBnZXREYXRlXG4gIHBhcnNlRGF0ZTogcGFyc2VEYXRlXG5cbiAgaXNJbWFnZVRhZzogaXNJbWFnZVRhZ1xuICBwYXJzZUltYWdlVGFnOiBwYXJzZUltYWdlVGFnXG4gIGlzSW1hZ2U6IGlzSW1hZ2VcbiAgcGFyc2VJbWFnZTogcGFyc2VJbWFnZVxuXG4gIGlzSW5saW5lTGluazogaXNJbmxpbmVMaW5rXG4gIHBhcnNlSW5saW5lTGluazogcGFyc2VJbmxpbmVMaW5rXG4gIGlzUmVmZXJlbmNlTGluazogaXNSZWZlcmVuY2VMaW5rXG4gIHBhcnNlUmVmZXJlbmNlTGluazogcGFyc2VSZWZlcmVuY2VMaW5rXG4gIGlzUmVmZXJlbmNlRGVmaW5pdGlvbjogaXNSZWZlcmVuY2VEZWZpbml0aW9uXG4gIHBhcnNlUmVmZXJlbmNlRGVmaW5pdGlvbjogcGFyc2VSZWZlcmVuY2VEZWZpbml0aW9uXG5cbiAgaXNGb290bm90ZTogaXNGb290bm90ZVxuICBwYXJzZUZvb3Rub3RlOiBwYXJzZUZvb3Rub3RlXG5cbiAgaXNUYWJsZVNlcGFyYXRvcjogaXNUYWJsZVNlcGFyYXRvclxuICBwYXJzZVRhYmxlU2VwYXJhdG9yOiBwYXJzZVRhYmxlU2VwYXJhdG9yXG4gIGNyZWF0ZVRhYmxlU2VwYXJhdG9yOiBjcmVhdGVUYWJsZVNlcGFyYXRvclxuICBpc1RhYmxlUm93OiBpc1RhYmxlUm93XG4gIHBhcnNlVGFibGVSb3c6IHBhcnNlVGFibGVSb3dcbiAgY3JlYXRlVGFibGVSb3c6IGNyZWF0ZVRhYmxlUm93XG5cbiAgaXNVcmw6IGlzVXJsXG4gIGlzSW1hZ2VGaWxlOiBpc0ltYWdlRmlsZVxuXG4gIGdldFRleHRCdWZmZXJSYW5nZTogZ2V0VGV4dEJ1ZmZlclJhbmdlXG4gIGZpbmRMaW5rSW5SYW5nZTogZmluZExpbmtJblJhbmdlXG4iXX0=
