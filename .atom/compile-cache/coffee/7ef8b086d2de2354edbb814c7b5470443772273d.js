(function() {
  var CommandError, Ex, VimOption, _, defer, fs, getFullPath, getSearchTerm, path, replaceGroups, saveAs, trySave,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  path = require('path');

  CommandError = require('./command-error');

  fs = require('fs-plus');

  VimOption = require('./vim-option');

  _ = require('underscore-plus');

  defer = function() {
    var deferred;
    deferred = {};
    deferred.promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      return deferred.reject = reject;
    });
    return deferred;
  };

  trySave = function(func) {
    var deferred, error, errorMatch, fileName, ref, response;
    deferred = defer();
    try {
      response = func();
      if (response instanceof Promise) {
        response.then(function() {
          return deferred.resolve();
        });
      } else {
        deferred.resolve();
      }
    } catch (error1) {
      error = error1;
      if (error.message.endsWith('is a directory')) {
        atom.notifications.addWarning("Unable to save file: " + error.message);
      } else if (error.path != null) {
        if (error.code === 'EACCES') {
          atom.notifications.addWarning("Unable to save file: Permission denied '" + error.path + "'");
        } else if ((ref = error.code) === 'EPERM' || ref === 'EBUSY' || ref === 'UNKNOWN' || ref === 'EEXIST') {
          atom.notifications.addWarning("Unable to save file '" + error.path + "'", {
            detail: error.message
          });
        } else if (error.code === 'EROFS') {
          atom.notifications.addWarning("Unable to save file: Read-only file system '" + error.path + "'");
        }
      } else if ((errorMatch = /ENOTDIR, not a directory '([^']+)'/.exec(error.message))) {
        fileName = errorMatch[1];
        atom.notifications.addWarning("Unable to save file: A directory in the " + ("path '" + fileName + "' could not be written to"));
      } else {
        throw error;
      }
    }
    return deferred.promise;
  };

  saveAs = function(filePath, editor) {
    return fs.writeFileSync(filePath, editor.getText());
  };

  getFullPath = function(filePath) {
    filePath = fs.normalize(filePath);
    if (path.isAbsolute(filePath)) {
      return filePath;
    } else if (atom.project.getPaths().length === 0) {
      return path.join(fs.normalize('~'), filePath);
    } else {
      return path.join(atom.project.getPaths()[0], filePath);
    }
  };

  replaceGroups = function(groups, string) {
    var char, escaped, group, replaced;
    replaced = '';
    escaped = false;
    while ((char = string[0]) != null) {
      string = string.slice(1);
      if (char === '\\' && !escaped) {
        escaped = true;
      } else if (/\d/.test(char) && escaped) {
        escaped = false;
        group = groups[parseInt(char)];
        if (group == null) {
          group = '';
        }
        replaced += group;
      } else {
        escaped = false;
        replaced += char;
      }
    }
    return replaced;
  };

  getSearchTerm = function(term, modifiers) {
    var char, escaped, hasC, hasc, i, len, modFlags, term_;
    if (modifiers == null) {
      modifiers = {
        'g': true
      };
    }
    escaped = false;
    hasc = false;
    hasC = false;
    term_ = term;
    term = '';
    for (i = 0, len = term_.length; i < len; i++) {
      char = term_[i];
      if (char === '\\' && !escaped) {
        escaped = true;
        term += char;
      } else {
        if (char === 'c' && escaped) {
          hasc = true;
          term = term.slice(0, -1);
        } else if (char === 'C' && escaped) {
          hasC = true;
          term = term.slice(0, -1);
        } else if (char !== '\\') {
          term += char;
        }
        escaped = false;
      }
    }
    if (hasC) {
      modifiers['i'] = false;
    }
    if ((!hasC && !term.match('[A-Z]') && atom.config.get('vim-mode.useSmartcaseForSearch')) || hasc) {
      modifiers['i'] = true;
    }
    modFlags = Object.keys(modifiers).filter(function(key) {
      return modifiers[key];
    }).join('');
    try {
      return new RegExp(term, modFlags);
    } catch (error1) {
      return new RegExp(_.escapeRegExp(term), modFlags);
    }
  };

  Ex = (function() {
    function Ex() {
      this.sort = bind(this.sort, this);
      this.vsp = bind(this.vsp, this);
      this.s = bind(this.s, this);
      this.sp = bind(this.sp, this);
      this.x = bind(this.x, this);
      this.xit = bind(this.xit, this);
      this.saveas = bind(this.saveas, this);
      this.xa = bind(this.xa, this);
      this.xall = bind(this.xall, this);
      this.wqa = bind(this.wqa, this);
      this.wqall = bind(this.wqall, this);
      this.wa = bind(this.wa, this);
      this.wq = bind(this.wq, this);
      this.w = bind(this.w, this);
      this.e = bind(this.e, this);
      this.tabo = bind(this.tabo, this);
      this.tabp = bind(this.tabp, this);
      this.tabn = bind(this.tabn, this);
      this.tabc = bind(this.tabc, this);
      this.tabclose = bind(this.tabclose, this);
      this.tabnew = bind(this.tabnew, this);
      this.tabe = bind(this.tabe, this);
      this.tabedit = bind(this.tabedit, this);
      this.qall = bind(this.qall, this);
      this.q = bind(this.q, this);
    }

    Ex.singleton = function() {
      return Ex.ex || (Ex.ex = new Ex);
    };

    Ex.registerCommand = function(name, func) {
      return Ex.singleton()[name] = func;
    };

    Ex.registerAlias = function(alias, name) {
      return Ex.singleton()[alias] = function(args) {
        return Ex.singleton()[name](args);
      };
    };

    Ex.getCommands = function() {
      return Object.keys(Ex.singleton()).concat(Object.keys(Ex.prototype)).filter(function(cmd, index, list) {
        return list.indexOf(cmd) === index;
      });
    };

    Ex.prototype.quit = function() {
      return atom.workspace.getActivePane().destroyActiveItem();
    };

    Ex.prototype.quitall = function() {
      return atom.close();
    };

    Ex.prototype.q = function() {
      return this.quit();
    };

    Ex.prototype.qall = function() {
      return this.quitall();
    };

    Ex.prototype.tabedit = function(args) {
      if (args.args.trim() !== '') {
        return this.edit(args);
      } else {
        return this.tabnew(args);
      }
    };

    Ex.prototype.tabe = function(args) {
      return this.tabedit(args);
    };

    Ex.prototype.tabnew = function(args) {
      if (args.args.trim() === '') {
        return atom.workspace.open();
      } else {
        return this.tabedit(args);
      }
    };

    Ex.prototype.tabclose = function(args) {
      return this.quit(args);
    };

    Ex.prototype.tabc = function() {
      return this.tabclose();
    };

    Ex.prototype.tabnext = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.activateNextItem();
    };

    Ex.prototype.tabn = function() {
      return this.tabnext();
    };

    Ex.prototype.tabprevious = function() {
      var pane;
      pane = atom.workspace.getActivePane();
      return pane.activatePreviousItem();
    };

    Ex.prototype.tabp = function() {
      return this.tabprevious();
    };

    Ex.prototype.tabonly = function() {
      var tabBar, tabBarElement;
      tabBar = atom.workspace.getPanes()[0];
      tabBarElement = atom.views.getView(tabBar).querySelector(".tab-bar");
      tabBarElement.querySelector(".right-clicked") && tabBarElement.querySelector(".right-clicked").classList.remove("right-clicked");
      tabBarElement.querySelector(".active").classList.add("right-clicked");
      atom.commands.dispatch(tabBarElement, 'tabs:close-other-tabs');
      return tabBarElement.querySelector(".active").classList.remove("right-clicked");
    };

    Ex.prototype.tabo = function() {
      return this.tabonly();
    };

    Ex.prototype.edit = function(arg) {
      var args, editor, filePath, force, fullPath, range;
      range = arg.range, args = arg.args, editor = arg.editor;
      filePath = args.trim();
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1).trim();
      } else {
        force = false;
      }
      if (editor.isModified() && !force) {
        throw new CommandError('No write since last change (add ! to override)');
      }
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      if (filePath.length !== 0) {
        fullPath = getFullPath(filePath);
        if (fullPath === editor.getPath()) {
          return editor.getBuffer().reload();
        } else {
          return atom.workspace.open(fullPath);
        }
      } else {
        if (editor.getPath() != null) {
          return editor.getBuffer().reload();
        } else {
          throw new CommandError('No file name');
        }
      }
    };

    Ex.prototype.e = function(args) {
      return this.edit(args);
    };

    Ex.prototype.enew = function() {
      var buffer;
      buffer = atom.workspace.getActiveTextEditor().buffer;
      buffer.setPath(void 0);
      return buffer.load();
    };

    Ex.prototype.write = function(arg) {
      var args, deferred, editor, filePath, force, fullPath, range, saveas, saved;
      range = arg.range, args = arg.args, editor = arg.editor, saveas = arg.saveas;
      if (saveas == null) {
        saveas = false;
      }
      filePath = args;
      if (filePath[0] === '!') {
        force = true;
        filePath = filePath.slice(1);
      } else {
        force = false;
      }
      filePath = filePath.trim();
      if (filePath.indexOf(' ') !== -1) {
        throw new CommandError('Only one file name allowed');
      }
      deferred = defer();
      editor = atom.workspace.getActiveTextEditor();
      saved = false;
      if (filePath.length !== 0) {
        fullPath = getFullPath(filePath);
      }
      if ((editor.getPath() != null) && ((fullPath == null) || editor.getPath() === fullPath)) {
        if (saveas) {
          throw new CommandError("Argument required");
        } else {
          trySave(function() {
            return editor.save();
          }).then(deferred.resolve);
          saved = true;
        }
      } else if (fullPath == null) {
        fullPath = atom.showSaveDialogSync();
      }
      if (!saved && (fullPath != null)) {
        if (!force && fs.existsSync(fullPath)) {
          throw new CommandError("File exists (add ! to override)");
        }
        if (saveas || editor.getFileName() === null) {
          editor = atom.workspace.getActiveTextEditor();
          trySave(function() {
            return editor.saveAs(fullPath, editor);
          }).then(deferred.resolve);
        } else {
          trySave(function() {
            return saveAs(fullPath, editor);
          }).then(deferred.resolve);
        }
      }
      return deferred.promise;
    };

    Ex.prototype.wall = function() {
      return atom.workspace.saveAll();
    };

    Ex.prototype.w = function(args) {
      return this.write(args);
    };

    Ex.prototype.wq = function(args) {
      return this.write(args).then((function(_this) {
        return function() {
          return _this.quit();
        };
      })(this));
    };

    Ex.prototype.wa = function() {
      return this.wall();
    };

    Ex.prototype.wqall = function() {
      this.wall();
      return this.quitall();
    };

    Ex.prototype.wqa = function() {
      return this.wqall();
    };

    Ex.prototype.xall = function() {
      return this.wqall();
    };

    Ex.prototype.xa = function() {
      return this.wqall();
    };

    Ex.prototype.saveas = function(args) {
      args.saveas = true;
      return this.write(args);
    };

    Ex.prototype.xit = function(args) {
      return this.wq(args);
    };

    Ex.prototype.x = function(args) {
      return this.xit(args);
    };

    Ex.prototype.split = function(arg) {
      var args, file, filePaths, i, j, len, len1, newPane, pane, range, results, results1;
      range = arg.range, args = arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitbelow')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitDown();
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            file = filePaths[i];
            results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results;
        } else {
          return pane.splitDown({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitUp();
          results1 = [];
          for (j = 0, len1 = filePaths.length; j < len1; j++) {
            file = filePaths[j];
            results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results1;
        } else {
          return pane.splitUp({
            copyActiveItem: true
          });
        }
      }
    };

    Ex.prototype.sp = function(args) {
      return this.split(args);
    };

    Ex.prototype.substitute = function(arg) {
      var args, args_, char, delim, e, editor, escapeChars, escaped, flags, flagsObj, parsed, parsing, pattern, patternRE, range, substition, vimState;
      range = arg.range, args = arg.args, editor = arg.editor, vimState = arg.vimState;
      args_ = args.trimLeft();
      delim = args_[0];
      if (/[a-z1-9\\"|]/i.test(delim)) {
        throw new CommandError("Regular expressions can't be delimited by alphanumeric characters, '\\', '\"' or '|'");
      }
      args_ = args_.slice(1);
      escapeChars = {
        t: '\t',
        n: '\n',
        r: '\r'
      };
      parsed = ['', '', ''];
      parsing = 0;
      escaped = false;
      while ((char = args_[0]) != null) {
        args_ = args_.slice(1);
        if (char === delim) {
          if (!escaped) {
            parsing++;
            if (parsing > 2) {
              throw new CommandError('Trailing characters');
            }
          } else {
            parsed[parsing] = parsed[parsing].slice(0, -1);
          }
        } else if (char === '\\' && !escaped) {
          parsed[parsing] += char;
          escaped = true;
        } else if (parsing === 1 && escaped && (escapeChars[char] != null)) {
          parsed[parsing] += escapeChars[char];
          escaped = false;
        } else {
          escaped = false;
          parsed[parsing] += char;
        }
      }
      pattern = parsed[0], substition = parsed[1], flags = parsed[2];
      if (pattern === '') {
        if (vimState.getSearchHistoryItem != null) {
          pattern = vimState.getSearchHistoryItem();
        } else if (vimState.searchHistory != null) {
          pattern = vimState.searchHistory.get('prev');
        }
        if (pattern == null) {
          atom.beep();
          throw new CommandError('No previous regular expression');
        }
      } else {
        if (vimState.pushSearchHistory != null) {
          vimState.pushSearchHistory(pattern);
        } else if (vimState.searchHistory != null) {
          vimState.searchHistory.save(pattern);
        }
      }
      try {
        flagsObj = {};
        flags.split('').forEach(function(flag) {
          return flagsObj[flag] = true;
        });
        if (atom.config.get('ex-mode.gdefault')) {
          flagsObj.g = !flagsObj.g;
        }
        patternRE = getSearchTerm(pattern, flagsObj);
      } catch (error1) {
        e = error1;
        if (e.message.indexOf('Invalid flags supplied to RegExp constructor') === 0) {
          throw new CommandError("Invalid flags: " + e.message.slice(45));
        } else if (e.message.indexOf('Invalid regular expression: ') === 0) {
          throw new CommandError("Invalid RegEx: " + e.message.slice(27));
        } else {
          throw e;
        }
      }
      return editor.transact(function() {
        var i, line, ref, ref1, results;
        results = [];
        for (line = i = ref = range[0], ref1 = range[1]; ref <= ref1 ? i <= ref1 : i >= ref1; line = ref <= ref1 ? ++i : --i) {
          results.push(editor.scanInBufferRange(patternRE, [[line, 0], [line + 1, 0]], function(arg1) {
            var match, replace;
            match = arg1.match, replace = arg1.replace;
            return replace(replaceGroups(match.slice(0), substition));
          }));
        }
        return results;
      });
    };

    Ex.prototype.s = function(args) {
      return this.substitute(args);
    };

    Ex.prototype.vsplit = function(arg) {
      var args, file, filePaths, i, j, len, len1, newPane, pane, range, results, results1;
      range = arg.range, args = arg.args;
      args = args.trim();
      filePaths = args.split(' ');
      if (filePaths.length === 1 && filePaths[0] === '') {
        filePaths = void 0;
      }
      pane = atom.workspace.getActivePane();
      if (atom.config.get('ex-mode.splitright')) {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitRight();
          results = [];
          for (i = 0, len = filePaths.length; i < len; i++) {
            file = filePaths[i];
            results.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results;
        } else {
          return pane.splitRight({
            copyActiveItem: true
          });
        }
      } else {
        if ((filePaths != null) && filePaths.length > 0) {
          newPane = pane.splitLeft();
          results1 = [];
          for (j = 0, len1 = filePaths.length; j < len1; j++) {
            file = filePaths[j];
            results1.push((function() {
              return atom.workspace.openURIInPane(file, newPane);
            })());
          }
          return results1;
        } else {
          return pane.splitLeft({
            copyActiveItem: true
          });
        }
      }
    };

    Ex.prototype.vsp = function(args) {
      return this.vsplit(args);
    };

    Ex.prototype["delete"] = function(arg) {
      var editor, range, text;
      range = arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      editor = atom.workspace.getActiveTextEditor();
      text = editor.getTextInBufferRange(range);
      atom.clipboard.write(text);
      return editor.buffer.setTextInRange(range, '');
    };

    Ex.prototype.yank = function(arg) {
      var range, txt;
      range = arg.range;
      range = [[range[0], 0], [range[1] + 1, 0]];
      txt = atom.workspace.getActiveTextEditor().getTextInBufferRange(range);
      return atom.clipboard.write(txt);
    };

    Ex.prototype.set = function(arg) {
      var args, i, len, option, options, range, results;
      range = arg.range, args = arg.args;
      args = args.trim();
      if (args === "") {
        throw new CommandError("No option specified");
      }
      options = args.split(' ');
      results = [];
      for (i = 0, len = options.length; i < len; i++) {
        option = options[i];
        results.push((function() {
          var nameValPair, optionName, optionProcessor, optionValue;
          if (option.includes("=")) {
            nameValPair = option.split("=");
            if (nameValPair.length !== 2) {
              throw new CommandError("Wrong option format. [name]=[value] format is expected");
            }
            optionName = nameValPair[0];
            optionValue = nameValPair[1];
            optionProcessor = VimOption.singleton()[optionName];
            if (optionProcessor == null) {
              throw new CommandError("No such option: " + optionName);
            }
            return optionProcessor(optionValue);
          } else {
            optionProcessor = VimOption.singleton()[option];
            if (optionProcessor == null) {
              throw new CommandError("No such option: " + option);
            }
            return optionProcessor();
          }
        })());
      }
      return results;
    };

    Ex.prototype.sort = function(arg) {
      var editor, i, isMultiLine, lineIndex, range, ref, ref1, sortedText, sortingRange, textLines;
      range = arg.range;
      editor = atom.workspace.getActiveTextEditor();
      sortingRange = [[]];
      isMultiLine = range[1] - range[0] > 1;
      if (isMultiLine) {
        sortingRange = [[range[0], 0], [range[1] + 1, 0]];
      } else {
        sortingRange = [[0, 0], [editor.getLastBufferRow(), 0]];
      }
      textLines = [];
      for (lineIndex = i = ref = sortingRange[0][0], ref1 = sortingRange[1][0] - 1; ref <= ref1 ? i <= ref1 : i >= ref1; lineIndex = ref <= ref1 ? ++i : --i) {
        textLines.push(editor.lineTextForBufferRow(lineIndex));
      }
      sortedText = _.sortBy(textLines).join('\n') + '\n';
      return editor.buffer.setTextInRange(sortingRange, sortedText);
    };

    return Ex;

  })();

  module.exports = Ex;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyR0FBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBQ1osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixLQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxRQUFBLEdBQVc7SUFDWCxRQUFRLENBQUMsT0FBVCxHQUF1QixJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO01BQzdCLFFBQVEsQ0FBQyxPQUFULEdBQW1CO2FBQ25CLFFBQVEsQ0FBQyxNQUFULEdBQWtCO0lBRlcsQ0FBUjtBQUl2QixXQUFPO0VBTkQ7O0VBU1IsT0FBQSxHQUFVLFNBQUMsSUFBRDtBQUNSLFFBQUE7SUFBQSxRQUFBLEdBQVcsS0FBQSxDQUFBO0FBRVg7TUFDRSxRQUFBLEdBQVcsSUFBQSxDQUFBO01BRVgsSUFBRyxRQUFBLFlBQW9CLE9BQXZCO1FBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFBO2lCQUNaLFFBQVEsQ0FBQyxPQUFULENBQUE7UUFEWSxDQUFkLEVBREY7T0FBQSxNQUFBO1FBSUUsUUFBUSxDQUFDLE9BQVQsQ0FBQSxFQUpGO09BSEY7S0FBQSxjQUFBO01BUU07TUFDSixJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsQ0FBSDtRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsdUJBQUEsR0FBd0IsS0FBSyxDQUFDLE9BQTVELEVBREY7T0FBQSxNQUVLLElBQUcsa0JBQUg7UUFDSCxJQUFHLEtB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LEdBQU0sU0FBQyxHQUFEO0FBQ0osVUFBQTtNQURPLFFBQUY7TUFDTCxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsWUFBQSxHQUFlLENBQUMsRUFBRDtNQUdmLFdBQUEsR0FBYyxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsR0FBc0I7TUFDcEMsSUFBRyxXQUFIO1FBQ0UsWUFBQSxHQUFlLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFQLEVBQVcsQ0FBWCxDQUFELEVBQWdCLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLENBQVosRUFBZSxDQUFmLENBQWhCLEVBRGpCO09BQUEsTUFBQTtRQUdFLFlBQUEsR0FBZSxDQUFDLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBRCxFQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFQLENBQUEsQ0FBRCxFQUE0QixDQUE1QixDQUFULEVBSGpCOztNQU1BLFNBQUEsR0FBWTtBQUNaLFdBQWlCLGlKQUFqQjtRQUNFLFNBQVMsQ0FBQyxJQUFWLENBQWUsTUFBTSxDQUFDLG9CQUFQLENBQTRCLFNBQTVCLENBQWY7QUFERjtNQUlBLFVBQUEsR0FBYSxDQUFDLENBQUMsTUFBRixDQUFTLFNBQVQsQ0FBbUIsQ0FBQyxJQUFwQixDQUF5QixJQUF6QixDQUFBLEdBQWlDO2FBQzlDLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBZCxDQUE2QixZQUE3QixFQUEyQyxVQUEzQztJQWxCSTs7Ozs7O0VBb0JSLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBbmRqQiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuQ29tbWFuZEVycm9yID0gcmVxdWlyZSAnLi9jb21tYW5kLWVycm9yJ1xuZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuVmltT3B0aW9uID0gcmVxdWlyZSAnLi92aW0tb3B0aW9uJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuZGVmZXIgPSAoKSAtPlxuICBkZWZlcnJlZCA9IHt9XG4gIGRlZmVycmVkLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgIGRlZmVycmVkLnJlc29sdmUgPSByZXNvbHZlXG4gICAgZGVmZXJyZWQucmVqZWN0ID0gcmVqZWN0XG4gIClcbiAgcmV0dXJuIGRlZmVycmVkXG5cblxudHJ5U2F2ZSA9IChmdW5jKSAtPlxuICBkZWZlcnJlZCA9IGRlZmVyKClcblxuICB0cnlcbiAgICByZXNwb25zZSA9IGZ1bmMoKVxuXG4gICAgaWYgcmVzcG9uc2UgaW5zdGFuY2VvZiBQcm9taXNlXG4gICAgICByZXNwb25zZS50aGVuIC0+XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKVxuICAgIGVsc2VcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoKVxuICBjYXRjaCBlcnJvclxuICAgIGlmIGVycm9yLm1lc3NhZ2UuZW5kc1dpdGgoJ2lzIGEgZGlyZWN0b3J5JylcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiVW5hYmxlIHRvIHNhdmUgZmlsZTogI3tlcnJvci5tZXNzYWdlfVwiKVxuICAgIGVsc2UgaWYgZXJyb3IucGF0aD9cbiAgICAgIGlmIGVycm9yLmNvZGUgaXMgJ0VBQ0NFUydcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zXG4gICAgICAgICAgLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlOiBQZXJtaXNzaW9uIGRlbmllZCAnI3tlcnJvci5wYXRofSdcIilcbiAgICAgIGVsc2UgaWYgZXJyb3IuY29kZSBpbiBbJ0VQRVJNJywgJ0VCVVNZJywgJ1VOS05PV04nLCAnRUVYSVNUJ11cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlICcje2Vycm9yLnBhdGh9J1wiLFxuICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSlcbiAgICAgIGVsc2UgaWYgZXJyb3IuY29kZSBpcyAnRVJPRlMnXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgIFwiVW5hYmxlIHRvIHNhdmUgZmlsZTogUmVhZC1vbmx5IGZpbGUgc3lzdGVtICcje2Vycm9yLnBhdGh9J1wiKVxuICAgIGVsc2UgaWYgKGVycm9yTWF0Y2ggPVxuICAgICAgICAvRU5PVERJUiwgbm90IGEgZGlyZWN0b3J5ICcoW14nXSspJy8uZXhlYyhlcnJvci5tZXNzYWdlKSlcbiAgICAgIGZpbGVOYW1lID0gZXJyb3JNYXRjaFsxXVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlOiBBIGRpcmVjdG9yeSBpbiB0aGUgXCIrXG4gICAgICAgIFwicGF0aCAnI3tmaWxlTmFtZX0nIGNvdWxkIG5vdCBiZSB3cml0dGVuIHRvXCIpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuICBkZWZlcnJlZC5wcm9taXNlXG5cbnNhdmVBcyA9IChmaWxlUGF0aCwgZWRpdG9yKSAtPlxuICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBlZGl0b3IuZ2V0VGV4dCgpKVxuXG5nZXRGdWxsUGF0aCA9IChmaWxlUGF0aCkgLT5cbiAgZmlsZVBhdGggPSBmcy5ub3JtYWxpemUoZmlsZVBhdGgpXG5cbiAgaWYgcGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKVxuICAgIGZpbGVQYXRoXG4gIGVsc2UgaWYgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID09IDBcbiAgICBwYXRoLmpvaW4oZnMubm9ybWFsaXplKCd+JyksIGZpbGVQYXRoKVxuICBlbHNlXG4gICAgcGF0aC5qb2luKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBmaWxlUGF0aClcblxucmVwbGFjZUdyb3VwcyA9IChncm91cHMsIHN0cmluZykgLT5cbiAgcmVwbGFjZWQgPSAnJ1xuICBlc2NhcGVkID0gZmFsc2VcbiAgd2hpbGUgKGNoYXIgPSBzdHJpbmdbMF0pP1xuICAgIHN0cmluZyA9IHN0cmluZ1sxLi5dXG4gICAgaWYgY2hhciBpcyAnXFxcXCcgYW5kIG5vdCBlc2NhcGVkXG4gICAgICBlc2NhcGVkID0gdHJ1ZVxuICAgIGVsc2UgaWYgL1xcZC8udGVzdChjaGFyKSBhbmQgZXNjYXBlZFxuICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICBncm91cCA9IGdyb3Vwc1twYXJzZUludChjaGFyKV1cbiAgICAgIGdyb3VwID89ICcnXG4gICAgICByZXBsYWNlZCArPSBncm91cFxuICAgIGVsc2VcbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuICAgICAgcmVwbGFjZWQgKz0gY2hhclxuXG4gIHJlcGxhY2VkXG5cbmdldFNlYXJjaFRlcm0gPSAodGVybSwgbW9kaWZpZXJzID0geydnJzogdHJ1ZX0pIC0+XG5cbiAgZXNjYXBlZCA9IGZhbHNlXG4gIGhhc2MgPSBmYWxzZVxuICBoYXNDID0gZmFsc2VcbiAgdGVybV8gPSB0ZXJtXG4gIHRlcm0gPSAnJ1xuICBmb3IgY2hhciBpbiB0ZXJtX1xuICAgIGlmIGNoYXIgaXMgJ1xcXFwnIGFuZCBub3QgZXNjYXBlZFxuICAgICAgZXNjYXBlZCA9IHRydWVcbiAgICAgIHRlcm0gKz0gY2hhclxuICAgIGVsc2VcbiAgICAgIGlmIGNoYXIgaXMgJ2MnIGFuZCBlc2NhcGVkXG4gICAgICAgIGhhc2MgPSB0cnVlXG4gICAgICAgIHRlcm0gPSB0ZXJtWy4uLi0xXVxuICAgICAgZWxzZSBpZiBjaGFyIGlzICdDJyBhbmQgZXNjYXBlZFxuICAgICAgICBoYXNDID0gdHJ1ZVxuICAgICAgICB0ZXJtID0gdGVybVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpc250ICdcXFxcJ1xuICAgICAgICB0ZXJtICs9IGNoYXJcbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuXG4gIGlmIGhhc0NcbiAgICBtb2RpZmllcnNbJ2knXSA9IGZhbHNlXG4gIGlmIChub3QgaGFzQyBhbmQgbm90IHRlcm0ubWF0Y2goJ1tBLVpdJykgYW5kIFxcXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKSBvciBoYXNjXG4gICAgbW9kaWZpZXJzWydpJ10gPSB0cnVlXG5cbiAgbW9kRmxhZ3MgPSBPYmplY3Qua2V5cyhtb2RpZmllcnMpLmZpbHRlcigoa2V5KSAtPiBtb2RpZmllcnNba2V5XSkuam9pbignJylcblxuICB0cnlcbiAgICBuZXcgUmVnRXhwKHRlcm0sIG1vZEZsYWdzKVxuICBjYXRjaFxuICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZEZsYWdzKVxuXG5jbGFzcyBFeFxuICBAc2luZ2xldG9uOiA9PlxuICAgIEBleCB8fD0gbmV3IEV4XG5cbiAgQHJlZ2lzdGVyQ29tbWFuZDogKG5hbWUsIGZ1bmMpID0+XG4gICAgQHNpbmdsZXRvbigpW25hbWVdID0gZnVuY1xuXG4gIEByZWdpc3RlckFsaWFzOiAoYWxpYXMsIG5hbWUpID0+XG4gICAgQHNpbmdsZXRvbigpW2FsaWFzXSA9IChhcmdzKSA9PiBAc2luZ2xldG9uKClbbmFtZV0oYXJncylcblxuICBAZ2V0Q29tbWFuZHM6ICgpID0+XG4gICAgT2JqZWN0LmtleXMoRXguc2luZ2xldG9uKCkpLmNvbmNhdChPYmplY3Qua2V5cyhFeC5wcm90b3R5cGUpKS5maWx0ZXIoKGNtZCwgaW5kZXgsIGxpc3QpIC0+XG4gICAgICBsaXN0LmluZGV4T2YoY21kKSA9PSBpbmRleFxuICAgIClcblxuICBxdWl0OiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5kZXN0cm95QWN0aXZlSXRlbSgpXG5cbiAgcXVpdGFsbDogLT5cbiAgICBhdG9tLmNsb3NlKClcblxuICBxOiA9PiBAcXVpdCgpXG5cbiAgcWFsbDogPT4gQHF1aXRhbGwoKVxuXG4gIHRhYmVkaXQ6IChhcmdzKSA9PlxuICAgIGlmIGFyZ3MuYXJncy50cmltKCkgaXNudCAnJ1xuICAgICAgQGVkaXQoYXJncylcbiAgICBlbHNlXG4gICAgICBAdGFibmV3KGFyZ3MpXG5cbiAgdGFiZTogKGFyZ3MpID0+IEB0YWJlZGl0KGFyZ3MpXG5cbiAgdGFibmV3OiAoYXJncykgPT5cbiAgICBpZiBhcmdzLmFyZ3MudHJpbSgpIGlzICcnXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICBlbHNlXG4gICAgICBAdGFiZWRpdChhcmdzKVxuXG4gIHRhYmNsb3NlOiAoYXJncykgPT4gQHF1aXQoYXJncylcblxuICB0YWJjOiA9PiBAdGFiY2xvc2UoKVxuXG4gIHRhYm5leHQ6IC0+XG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG5cbiAgdGFibjogPT4gQHRhYm5leHQoKVxuXG4gIHRhYnByZXZpb3VzOiAtPlxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBwYW5lLmFjdGl2YXRlUHJldmlvdXNJdGVtKClcblxuICB0YWJwOiA9PiBAdGFicHJldmlvdXMoKVxuXG4gIHRhYm9ubHk6IC0+XG4gICAgdGFiQmFyID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVswXVxuICAgIHRhYkJhckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGFiQmFyKS5xdWVyeVNlbGVjdG9yKFwiLnRhYi1iYXJcIilcbiAgICB0YWJCYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmlnaHQtY2xpY2tlZFwiKSAmJiB0YWJCYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmlnaHQtY2xpY2tlZFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwicmlnaHQtY2xpY2tlZFwiKVxuICAgIHRhYkJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5hY3RpdmVcIikuY2xhc3NMaXN0LmFkZChcInJpZ2h0LWNsaWNrZWRcIilcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhYkJhckVsZW1lbnQsICd0YWJzOmNsb3NlLW90aGVyLXRhYnMnKVxuICAgIHRhYkJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5hY3RpdmVcIikuY2xhc3NMaXN0LnJlbW92ZShcInJpZ2h0LWNsaWNrZWRcIilcblxuICB0YWJvOiA9PiBAdGFib25seSgpXG5cbiAgZWRpdDogKHsgcmFuZ2UsIGFyZ3MsIGVkaXRvciB9KSAtPlxuICAgIGZpbGVQYXRoID0gYXJncy50cmltKClcbiAgICBpZiBmaWxlUGF0aFswXSBpcyAnISdcbiAgICAgIGZvcmNlID0gdHJ1ZVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aFsxLi5dLnRyaW0oKVxuICAgIGVsc2VcbiAgICAgIGZvcmNlID0gZmFsc2VcblxuICAgIGlmIGVkaXRvci5pc01vZGlmaWVkKCkgYW5kIG5vdCBmb3JjZVxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignTm8gd3JpdGUgc2luY2UgbGFzdCBjaGFuZ2UgKGFkZCAhIHRvIG92ZXJyaWRlKScpXG4gICAgaWYgZmlsZVBhdGguaW5kZXhPZignICcpIGlzbnQgLTFcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ09ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJylcblxuICAgIGlmIGZpbGVQYXRoLmxlbmd0aCBpc250IDBcbiAgICAgIGZ1bGxQYXRoID0gZ2V0RnVsbFBhdGgoZmlsZVBhdGgpXG4gICAgICBpZiBmdWxsUGF0aCBpcyBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZ1bGxQYXRoKVxuICAgIGVsc2VcbiAgICAgIGlmIGVkaXRvci5nZXRQYXRoKCk/XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdObyBmaWxlIG5hbWUnKVxuXG4gIGU6IChhcmdzKSA9PiBAZWRpdChhcmdzKVxuXG4gIGVuZXc6IC0+XG4gICAgYnVmZmVyID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmJ1ZmZlclxuICAgIGJ1ZmZlci5zZXRQYXRoKHVuZGVmaW5lZClcbiAgICBidWZmZXIubG9hZCgpXG5cbiAgd3JpdGU6ICh7IHJhbmdlLCBhcmdzLCBlZGl0b3IsIHNhdmVhcyB9KSAtPlxuICAgIHNhdmVhcyA/PSBmYWxzZVxuICAgIGZpbGVQYXRoID0gYXJnc1xuICAgIGlmIGZpbGVQYXRoWzBdIGlzICchJ1xuICAgICAgZm9yY2UgPSB0cnVlXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoWzEuLl1cbiAgICBlbHNlXG4gICAgICBmb3JjZSA9IGZhbHNlXG5cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnRyaW0oKVxuICAgIGlmIGZpbGVQYXRoLmluZGV4T2YoJyAnKSBpc250IC0xXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCcpXG5cbiAgICBkZWZlcnJlZCA9IGRlZmVyKClcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHNhdmVkID0gZmFsc2VcbiAgICBpZiBmaWxlUGF0aC5sZW5ndGggaXNudCAwXG4gICAgICBmdWxsUGF0aCA9IGdldEZ1bGxQYXRoKGZpbGVQYXRoKVxuICAgIGlmIGVkaXRvci5nZXRQYXRoKCk/IGFuZCAobm90IGZ1bGxQYXRoPyBvciBlZGl0b3IuZ2V0UGF0aCgpID09IGZ1bGxQYXRoKVxuICAgICAgaWYgc2F2ZWFzXG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJBcmd1bWVudCByZXF1aXJlZFwiKVxuICAgICAgZWxzZVxuICAgICAgICAjIFVzZSBlZGl0b3Iuc2F2ZSB3aGVuIG5vIHBhdGggaXMgZ2l2ZW4gb3IgdGhlIHBhdGggdG8gdGhlIGZpbGUgaXMgZ2l2ZW5cbiAgICAgICAgdHJ5U2F2ZSgtPiBlZGl0b3Iuc2F2ZSgpKS50aGVuKGRlZmVycmVkLnJlc29sdmUpXG4gICAgICAgIHNhdmVkID0gdHJ1ZVxuICAgIGVsc2UgaWYgbm90IGZ1bGxQYXRoP1xuICAgICAgZnVsbFBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYygpXG5cbiAgICBpZiBub3Qgc2F2ZWQgYW5kIGZ1bGxQYXRoP1xuICAgICAgaWYgbm90IGZvcmNlIGFuZCBmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKVxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiRmlsZSBleGlzdHMgKGFkZCAhIHRvIG92ZXJyaWRlKVwiKVxuICAgICAgaWYgc2F2ZWFzIG9yIGVkaXRvci5nZXRGaWxlTmFtZSgpID09IG51bGxcbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHRyeVNhdmUoLT4gZWRpdG9yLnNhdmVBcyhmdWxsUGF0aCwgZWRpdG9yKSkudGhlbihkZWZlcnJlZC5yZXNvbHZlKVxuICAgICAgZWxzZVxuICAgICAgICB0cnlTYXZlKC0+IHNhdmVBcyhmdWxsUGF0aCwgZWRpdG9yKSkudGhlbihkZWZlcnJlZC5yZXNvbHZlKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIHdhbGw6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uuc2F2ZUFsbCgpXG5cbiAgdzogKGFyZ3MpID0+XG4gICAgQHdyaXRlKGFyZ3MpXG5cbiAgd3E6IChhcmdzKSA9PlxuICAgIEB3cml0ZShhcmdzKS50aGVuKD0+IEBxdWl0KCkpXG5cbiAgd2E6ID0+XG4gICAgQHdhbGwoKVxuXG4gIHdxYWxsOiA9PlxuICAgIEB3YWxsKClcbiAgICBAcXVpdGFsbCgpXG5cbiAgd3FhOiA9PlxuICAgIEB3cWFsbCgpXG5cbiAgeGFsbDogPT5cbiAgICBAd3FhbGwoKVxuXG4gIHhhOiA9PlxuICAgIEB3cWFsbCgpXG5cbiAgc2F2ZWFzOiAoYXJncykgPT5cbiAgICBhcmdzLnNhdmVhcyA9IHRydWVcbiAgICBAd3JpdGUoYXJncylcblxuICB4aXQ6IChhcmdzKSA9PiBAd3EoYXJncylcblxuICB4OiAoYXJncykgPT4gQHhpdChhcmdzKVxuXG4gIHNwbGl0OiAoeyByYW5nZSwgYXJncyB9KSAtPlxuICAgIGFyZ3MgPSBhcmdzLnRyaW0oKVxuICAgIGZpbGVQYXRocyA9IGFyZ3Muc3BsaXQoJyAnKVxuICAgIGZpbGVQYXRocyA9IHVuZGVmaW5lZCBpZiBmaWxlUGF0aHMubGVuZ3RoIGlzIDEgYW5kIGZpbGVQYXRoc1swXSBpcyAnJ1xuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpXG4gICAgICBpZiBmaWxlUGF0aHM/IGFuZCBmaWxlUGF0aHMubGVuZ3RoID4gMFxuICAgICAgICBuZXdQYW5lID0gcGFuZS5zcGxpdERvd24oKVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlUGF0aHNcbiAgICAgICAgICBkbyAtPlxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZSBmaWxlLCBuZXdQYW5lXG4gICAgICBlbHNlXG4gICAgICAgIHBhbmUuc3BsaXREb3duKGNvcHlBY3RpdmVJdGVtOiB0cnVlKVxuICAgIGVsc2VcbiAgICAgIGlmIGZpbGVQYXRocz8gYW5kIGZpbGVQYXRocy5sZW5ndGggPiAwXG4gICAgICAgIG5ld1BhbmUgPSBwYW5lLnNwbGl0VXAoKVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlUGF0aHNcbiAgICAgICAgICBkbyAtPlxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZSBmaWxlLCBuZXdQYW5lXG4gICAgICBlbHNlXG4gICAgICAgIHBhbmUuc3BsaXRVcChjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcblxuXG4gIHNwOiAoYXJncykgPT4gQHNwbGl0KGFyZ3MpXG5cbiAgc3Vic3RpdHV0ZTogKHsgcmFuZ2UsIGFyZ3MsIGVkaXRvciwgdmltU3RhdGUgfSkgLT5cbiAgICBhcmdzXyA9IGFyZ3MudHJpbUxlZnQoKVxuICAgIGRlbGltID0gYXJnc19bMF1cbiAgICBpZiAvW2EtejEtOVxcXFxcInxdL2kudGVzdChkZWxpbSlcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXG4gICAgICAgIFwiUmVndWxhciBleHByZXNzaW9ucyBjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMsICdcXFxcJywgJ1xcXCInIG9yICd8J1wiKVxuICAgIGFyZ3NfID0gYXJnc19bMS4uXVxuICAgIGVzY2FwZUNoYXJzID0ge3Q6ICdcXHQnLCBuOiAnXFxuJywgcjogJ1xccid9XG4gICAgcGFyc2VkID0gWycnLCAnJywgJyddXG4gICAgcGFyc2luZyA9IDBcbiAgICBlc2NhcGVkID0gZmFsc2VcbiAgICB3aGlsZSAoY2hhciA9IGFyZ3NfWzBdKT9cbiAgICAgIGFyZ3NfID0gYXJnc19bMS4uXVxuICAgICAgaWYgY2hhciBpcyBkZWxpbVxuICAgICAgICBpZiBub3QgZXNjYXBlZFxuICAgICAgICAgIHBhcnNpbmcrK1xuICAgICAgICAgIGlmIHBhcnNpbmcgPiAyXG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdUcmFpbGluZyBjaGFyYWN0ZXJzJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBhcnNlZFtwYXJzaW5nXSA9IHBhcnNlZFtwYXJzaW5nXVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpcyAnXFxcXCcgYW5kIG5vdCBlc2NhcGVkXG4gICAgICAgIHBhcnNlZFtwYXJzaW5nXSArPSBjaGFyXG4gICAgICAgIGVzY2FwZWQgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBhcnNpbmcgPT0gMSBhbmQgZXNjYXBlZCBhbmQgZXNjYXBlQ2hhcnNbY2hhcl0/XG4gICAgICAgIHBhcnNlZFtwYXJzaW5nXSArPSBlc2NhcGVDaGFyc1tjaGFyXVxuICAgICAgICBlc2NhcGVkID0gZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICAgIHBhcnNlZFtwYXJzaW5nXSArPSBjaGFyXG5cbiAgICBbcGF0dGVybiwgc3Vic3RpdGlvbiwgZmxhZ3NdID0gcGFyc2VkXG4gICAgaWYgcGF0dGVybiBpcyAnJ1xuICAgICAgaWYgdmltU3RhdGUuZ2V0U2VhcmNoSGlzdG9yeUl0ZW0/XG4gICAgICAgICMgdmltLW1vZGVcbiAgICAgICAgcGF0dGVybiA9IHZpbVN0YXRlLmdldFNlYXJjaEhpc3RvcnlJdGVtKClcbiAgICAgIGVsc2UgaWYgdmltU3RhdGUuc2VhcmNoSGlzdG9yeT9cbiAgICAgICAgIyB2aW0tbW9kZS1wbHVzXG4gICAgICAgIHBhdHRlcm4gPSB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG5cbiAgICAgIGlmIG5vdCBwYXR0ZXJuP1xuICAgICAgICBhdG9tLmJlZXAoKVxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdObyBwcmV2aW91cyByZWd1bGFyIGV4cHJlc3Npb24nKVxuICAgIGVsc2VcbiAgICAgIGlmIHZpbVN0YXRlLnB1c2hTZWFyY2hIaXN0b3J5P1xuICAgICAgICAjIHZpbS1tb2RlXG4gICAgICAgIHZpbVN0YXRlLnB1c2hTZWFyY2hIaXN0b3J5KHBhdHRlcm4pXG4gICAgICBlbHNlIGlmIHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnk/XG4gICAgICAgICMgdmltLW1vZGUtcGx1c1xuICAgICAgICB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUocGF0dGVybilcblxuICAgIHRyeVxuICAgICAgZmxhZ3NPYmogPSB7fVxuICAgICAgZmxhZ3Muc3BsaXQoJycpLmZvckVhY2goKGZsYWcpIC0+IGZsYWdzT2JqW2ZsYWddID0gdHJ1ZSlcbiAgICAgICMgZ2RlZmF1bHQgb3B0aW9uXG4gICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuZ2RlZmF1bHQnKVxuICAgICAgICBmbGFnc09iai5nID0gIWZsYWdzT2JqLmdcbiAgICAgIHBhdHRlcm5SRSA9IGdldFNlYXJjaFRlcm0ocGF0dGVybiwgZmxhZ3NPYmopXG4gICAgY2F0Y2ggZVxuICAgICAgaWYgZS5tZXNzYWdlLmluZGV4T2YoJ0ludmFsaWQgZmxhZ3Mgc3VwcGxpZWQgdG8gUmVnRXhwIGNvbnN0cnVjdG9yJykgaXMgMFxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiSW52YWxpZCBmbGFnczogI3tlLm1lc3NhZ2VbNDUuLl19XCIpXG4gICAgICBlbHNlIGlmIGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogJykgaXMgMFxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiSW52YWxpZCBSZWdFeDogI3tlLm1lc3NhZ2VbMjcuLl19XCIpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVcblxuICAgIGVkaXRvci50cmFuc2FjdCAtPlxuICAgICAgZm9yIGxpbmUgaW4gW3JhbmdlWzBdLi5yYW5nZVsxXV1cbiAgICAgICAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKFxuICAgICAgICAgIHBhdHRlcm5SRSxcbiAgICAgICAgICBbW2xpbmUsIDBdLCBbbGluZSArIDEsIDBdXSxcbiAgICAgICAgICAoe21hdGNoLCByZXBsYWNlfSkgLT5cbiAgICAgICAgICAgIHJlcGxhY2UocmVwbGFjZUdyb3VwcyhtYXRjaFsuLl0sIHN1YnN0aXRpb24pKVxuICAgICAgICApXG5cbiAgczogKGFyZ3MpID0+IEBzdWJzdGl0dXRlKGFyZ3MpXG5cbiAgdnNwbGl0OiAoeyByYW5nZSwgYXJncyB9KSAtPlxuICAgIGFyZ3MgPSBhcmdzLnRyaW0oKVxuICAgIGZpbGVQYXRocyA9IGFyZ3Muc3BsaXQoJyAnKVxuICAgIGZpbGVQYXRocyA9IHVuZGVmaW5lZCBpZiBmaWxlUGF0aHMubGVuZ3RoIGlzIDEgYW5kIGZpbGVQYXRoc1swXSBpcyAnJ1xuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpXG4gICAgICBpZiBmaWxlUGF0aHM/IGFuZCBmaWxlUGF0aHMubGVuZ3RoID4gMFxuICAgICAgICBuZXdQYW5lID0gcGFuZS5zcGxpdFJpZ2h0KClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0UmlnaHQoY29weUFjdGl2ZUl0ZW06IHRydWUpXG4gICAgZWxzZVxuICAgICAgaWYgZmlsZVBhdGhzPyBhbmQgZmlsZVBhdGhzLmxlbmd0aCA+IDBcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXRMZWZ0KClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0TGVmdChjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcblxuICB2c3A6IChhcmdzKSA9PiBAdnNwbGl0KGFyZ3MpXG5cbiAgZGVsZXRlOiAoeyByYW5nZSB9KSAtPlxuICAgIHJhbmdlID0gW1tyYW5nZVswXSwgMF0sIFtyYW5nZVsxXSArIDEsIDBdXVxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KVxuXG4gICAgZWRpdG9yLmJ1ZmZlci5zZXRUZXh0SW5SYW5nZShyYW5nZSwgJycpXG5cbiAgeWFuazogKHsgcmFuZ2UgfSkgLT5cbiAgICByYW5nZSA9IFtbcmFuZ2VbMF0sIDBdLCBbcmFuZ2VbMV0gKyAxLCAwXV1cbiAgICB0eHQgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodHh0KTtcblxuICBzZXQ6ICh7IHJhbmdlLCBhcmdzIH0pIC0+XG4gICAgYXJncyA9IGFyZ3MudHJpbSgpXG4gICAgaWYgYXJncyA9PSBcIlwiXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm8gb3B0aW9uIHNwZWNpZmllZFwiKVxuICAgIG9wdGlvbnMgPSBhcmdzLnNwbGl0KCcgJylcbiAgICBmb3Igb3B0aW9uIGluIG9wdGlvbnNcbiAgICAgIGRvIC0+XG4gICAgICAgIGlmIG9wdGlvbi5pbmNsdWRlcyhcIj1cIilcbiAgICAgICAgICBuYW1lVmFsUGFpciA9IG9wdGlvbi5zcGxpdChcIj1cIilcbiAgICAgICAgICBpZiAobmFtZVZhbFBhaXIubGVuZ3RoICE9IDIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiV3Jvbmcgb3B0aW9uIGZvcm1hdC4gW25hbWVdPVt2YWx1ZV0gZm9ybWF0IGlzIGV4cGVjdGVkXCIpXG4gICAgICAgICAgb3B0aW9uTmFtZSA9IG5hbWVWYWxQYWlyWzBdXG4gICAgICAgICAgb3B0aW9uVmFsdWUgPSBuYW1lVmFsUGFpclsxXVxuICAgICAgICAgIG9wdGlvblByb2Nlc3NvciA9IFZpbU9wdGlvbi5zaW5nbGV0b24oKVtvcHRpb25OYW1lXVxuICAgICAgICAgIGlmIG5vdCBvcHRpb25Qcm9jZXNzb3I/XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm8gc3VjaCBvcHRpb246ICN7b3B0aW9uTmFtZX1cIilcbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3Iob3B0aW9uVmFsdWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3IgPSBWaW1PcHRpb24uc2luZ2xldG9uKClbb3B0aW9uXVxuICAgICAgICAgIGlmIG5vdCBvcHRpb25Qcm9jZXNzb3I/XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm8gc3VjaCBvcHRpb246ICN7b3B0aW9ufVwiKVxuICAgICAgICAgIG9wdGlvblByb2Nlc3NvcigpXG5cbiAgc29ydDogKHsgcmFuZ2UgfSkgPT5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBzb3J0aW5nUmFuZ2UgPSBbW11dXG5cbiAgICAjIElmIG5vIHJhbmdlIGlzIHByb3ZpZGVkLCB0aGUgZW50aXJlIGZpbGUgc2hvdWxkIGJlIHNvcnRlZC5cbiAgICBpc011bHRpTGluZSA9IHJhbmdlWzFdIC0gcmFuZ2VbMF0gPiAxXG4gICAgaWYgaXNNdWx0aUxpbmVcbiAgICAgIHNvcnRpbmdSYW5nZSA9IFtbcmFuZ2VbMF0sIDBdLCBbcmFuZ2VbMV0gKyAxLCAwXV1cbiAgICBlbHNlXG4gICAgICBzb3J0aW5nUmFuZ2UgPSBbWzAsIDBdLCBbZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSwgMF1dXG5cbiAgICAjIFN0b3JlIGV2ZXJ5IGJ1ZmZlcmVkUm93IHN0cmluZyBpbiBhbiBhcnJheS5cbiAgICB0ZXh0TGluZXMgPSBbXVxuICAgIGZvciBsaW5lSW5kZXggaW4gW3NvcnRpbmdSYW5nZVswXVswXS4uc29ydGluZ1JhbmdlWzFdWzBdIC0gMV1cbiAgICAgIHRleHRMaW5lcy5wdXNoKGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhsaW5lSW5kZXgpKVxuXG4gICAgIyBTb3J0IHRoZSBhcnJheSBhbmQgam9pbiB0aGVtIHRvZ2V0aGVyIHdpdGggbmV3bGluZXMgZm9yIHdyaXRpbmcgYmFjayB0byB0aGUgZmlsZS5cbiAgICBzb3J0ZWRUZXh0ID0gXy5zb3J0QnkodGV4dExpbmVzKS5qb2luKCdcXG4nKSArICdcXG4nXG4gICAgZWRpdG9yLmJ1ZmZlci5zZXRUZXh0SW5SYW5nZShzb3J0aW5nUmFuZ2UsIHNvcnRlZFRleHQpXG5cbm1vZHVsZS5leHBvcnRzID0gRXhcbiJdfQ==
