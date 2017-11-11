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

    return Ex;

  })();

  module.exports = Ex;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyR0FBQTtJQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztFQUNmLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBQ1osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixLQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFBQSxRQUFBLEdBQVc7SUFDWCxRQUFRLENBQUMsT0FBVCxHQUF1QixJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQsRUFBVSxNQUFWO01BQzdCLFFBQVEsQ0FBQyxPQUFULEdBQW1CO2FBQ25CLFFBQVEsQ0FBQyxNQUFULEdBQWtCO0lBRlcsQ0FBUjtBQUl2QixXQUFPO0VBTkQ7O0VBU1IsT0FBQSxHQUFVLFNBQUMsSUFBRDtBQUNSLFFBQUE7SUFBQSxRQUFBLEdBQVcsS0FBQSxDQUFBO0FBRVg7TUFDRSxRQUFBLEdBQVcsSUFBQSxDQUFBO01BRVgsSUFBRyxRQUFBLFlBQW9CLE9BQXZCO1FBQ0UsUUFBUSxDQUFDLElBQVQsQ0FBYyxTQUFBO2lCQUNaLFFBQVEsQ0FBQyxPQUFULENBQUE7UUFEWSxDQUFkLEVBREY7T0FBQSxNQUFBO1FBSUUsUUFBUSxDQUFDLE9BQVQsQ0FBQSxFQUpGO09BSEY7S0FBQSxjQUFBO01BUU07TUFDSixJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBZCxDQUF1QixnQkFBdkIsQ0FBSDtRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBbkIsQ0FBOEIsdUJBQUEsR0FBd0IsS0FBSyxDQUFDLE9BQTVELEVBREY7T0FBQSxNQUVLLElBQUcsa0JBQUg7UUFDSCxJQUFHLEtB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R0FBckI7SUFISTs7aUJBS04sR0FBQSxHQUFLLFNBQUMsR0FBRDtBQUNILFVBQUE7TUFETSxtQkFBTztNQUNiLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFBO01BQ1AsSUFBRyxJQUFBLEtBQVEsRUFBWDtBQUNFLGNBQVUsSUFBQSxZQUFBLENBQWEscUJBQWIsRUFEWjs7TUFFQSxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYO0FBQ1Y7V0FBQSx5Q0FBQTs7cUJBQ0ssQ0FBQSxTQUFBO0FBQ0QsY0FBQTtVQUFBLElBQUcsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsR0FBaEIsQ0FBSDtZQUNFLFdBQUEsR0FBYyxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWI7WUFDZCxJQUFJLFdBQVcsQ0FBQyxNQUFaLEtBQXNCLENBQTFCO0FBQ0Usb0JBQVUsSUFBQSxZQUFBLENBQWEsd0RBQWIsRUFEWjs7WUFFQSxVQUFBLEdBQWEsV0FBWSxDQUFBLENBQUE7WUFDekIsV0FBQSxHQUFjLFdBQVksQ0FBQSxDQUFBO1lBQzFCLGVBQUEsR0FBa0IsU0FBUyxDQUFDLFNBQVYsQ0FBQSxDQUFzQixDQUFBLFVBQUE7WUFDeEMsSUFBTyx1QkFBUDtBQUNFLG9CQUFVLElBQUEsWUFBQSxDQUFhLGtCQUFBLEdBQW1CLFVBQWhDLEVBRFo7O21CQUVBLGVBQUEsQ0FBZ0IsV0FBaEIsRUFURjtXQUFBLE1BQUE7WUFXRSxlQUFBLEdBQWtCLFNBQVMsQ0FBQyxTQUFWLENBQUEsQ0FBc0IsQ0FBQSxNQUFBO1lBQ3hDLElBQU8sdUJBQVA7QUFDRSxvQkFBVSxJQUFBLFlBQUEsQ0FBYSxrQkFBQSxHQUFtQixNQUFoQyxFQURaOzttQkFFQSxlQUFBLENBQUEsRUFkRjs7UUFEQyxDQUFBLENBQUgsQ0FBQTtBQURGOztJQUxHOzs7Ozs7RUF1QlAsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE1YmpCIiwic291cmNlc0NvbnRlbnQiOlsicGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5Db21tYW5kRXJyb3IgPSByZXF1aXJlICcuL2NvbW1hbmQtZXJyb3InXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5WaW1PcHRpb24gPSByZXF1aXJlICcuL3ZpbS1vcHRpb24nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5kZWZlciA9ICgpIC0+XG4gIGRlZmVycmVkID0ge31cbiAgZGVmZXJyZWQucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgZGVmZXJyZWQucmVzb2x2ZSA9IHJlc29sdmVcbiAgICBkZWZlcnJlZC5yZWplY3QgPSByZWplY3RcbiAgKVxuICByZXR1cm4gZGVmZXJyZWRcblxuXG50cnlTYXZlID0gKGZ1bmMpIC0+XG4gIGRlZmVycmVkID0gZGVmZXIoKVxuXG4gIHRyeVxuICAgIHJlc3BvbnNlID0gZnVuYygpXG4gICAgXG4gICAgaWYgcmVzcG9uc2UgaW5zdGFuY2VvZiBQcm9taXNlXG4gICAgICByZXNwb25zZS50aGVuIC0+XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKVxuICAgIGVsc2VcbiAgICAgIGRlZmVycmVkLnJlc29sdmUoKVxuICBjYXRjaCBlcnJvclxuICAgIGlmIGVycm9yLm1lc3NhZ2UuZW5kc1dpdGgoJ2lzIGEgZGlyZWN0b3J5JylcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiVW5hYmxlIHRvIHNhdmUgZmlsZTogI3tlcnJvci5tZXNzYWdlfVwiKVxuICAgIGVsc2UgaWYgZXJyb3IucGF0aD9cbiAgICAgIGlmIGVycm9yLmNvZGUgaXMgJ0VBQ0NFUydcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zXG4gICAgICAgICAgLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlOiBQZXJtaXNzaW9uIGRlbmllZCAnI3tlcnJvci5wYXRofSdcIilcbiAgICAgIGVsc2UgaWYgZXJyb3IuY29kZSBpbiBbJ0VQRVJNJywgJ0VCVVNZJywgJ1VOS05PV04nLCAnRUVYSVNUJ11cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlICcje2Vycm9yLnBhdGh9J1wiLFxuICAgICAgICAgIGRldGFpbDogZXJyb3IubWVzc2FnZSlcbiAgICAgIGVsc2UgaWYgZXJyb3IuY29kZSBpcyAnRVJPRlMnXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAgIFwiVW5hYmxlIHRvIHNhdmUgZmlsZTogUmVhZC1vbmx5IGZpbGUgc3lzdGVtICcje2Vycm9yLnBhdGh9J1wiKVxuICAgIGVsc2UgaWYgKGVycm9yTWF0Y2ggPVxuICAgICAgICAvRU5PVERJUiwgbm90IGEgZGlyZWN0b3J5ICcoW14nXSspJy8uZXhlYyhlcnJvci5tZXNzYWdlKSlcbiAgICAgIGZpbGVOYW1lID0gZXJyb3JNYXRjaFsxXVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJVbmFibGUgdG8gc2F2ZSBmaWxlOiBBIGRpcmVjdG9yeSBpbiB0aGUgXCIrXG4gICAgICAgIFwicGF0aCAnI3tmaWxlTmFtZX0nIGNvdWxkIG5vdCBiZSB3cml0dGVuIHRvXCIpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuICBkZWZlcnJlZC5wcm9taXNlXG5cbnNhdmVBcyA9IChmaWxlUGF0aCwgZWRpdG9yKSAtPlxuICBmcy53cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBlZGl0b3IuZ2V0VGV4dCgpKVxuXG5nZXRGdWxsUGF0aCA9IChmaWxlUGF0aCkgLT5cbiAgZmlsZVBhdGggPSBmcy5ub3JtYWxpemUoZmlsZVBhdGgpXG5cbiAgaWYgcGF0aC5pc0Fic29sdXRlKGZpbGVQYXRoKVxuICAgIGZpbGVQYXRoXG4gIGVsc2UgaWYgYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkubGVuZ3RoID09IDBcbiAgICBwYXRoLmpvaW4oZnMubm9ybWFsaXplKCd+JyksIGZpbGVQYXRoKVxuICBlbHNlXG4gICAgcGF0aC5qb2luKGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdLCBmaWxlUGF0aClcblxucmVwbGFjZUdyb3VwcyA9IChncm91cHMsIHN0cmluZykgLT5cbiAgcmVwbGFjZWQgPSAnJ1xuICBlc2NhcGVkID0gZmFsc2VcbiAgd2hpbGUgKGNoYXIgPSBzdHJpbmdbMF0pP1xuICAgIHN0cmluZyA9IHN0cmluZ1sxLi5dXG4gICAgaWYgY2hhciBpcyAnXFxcXCcgYW5kIG5vdCBlc2NhcGVkXG4gICAgICBlc2NhcGVkID0gdHJ1ZVxuICAgIGVsc2UgaWYgL1xcZC8udGVzdChjaGFyKSBhbmQgZXNjYXBlZFxuICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICBncm91cCA9IGdyb3Vwc1twYXJzZUludChjaGFyKV1cbiAgICAgIGdyb3VwID89ICcnXG4gICAgICByZXBsYWNlZCArPSBncm91cFxuICAgIGVsc2VcbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuICAgICAgcmVwbGFjZWQgKz0gY2hhclxuXG4gIHJlcGxhY2VkXG5cbmdldFNlYXJjaFRlcm0gPSAodGVybSwgbW9kaWZpZXJzID0geydnJzogdHJ1ZX0pIC0+XG5cbiAgZXNjYXBlZCA9IGZhbHNlXG4gIGhhc2MgPSBmYWxzZVxuICBoYXNDID0gZmFsc2VcbiAgdGVybV8gPSB0ZXJtXG4gIHRlcm0gPSAnJ1xuICBmb3IgY2hhciBpbiB0ZXJtX1xuICAgIGlmIGNoYXIgaXMgJ1xcXFwnIGFuZCBub3QgZXNjYXBlZFxuICAgICAgZXNjYXBlZCA9IHRydWVcbiAgICAgIHRlcm0gKz0gY2hhclxuICAgIGVsc2VcbiAgICAgIGlmIGNoYXIgaXMgJ2MnIGFuZCBlc2NhcGVkXG4gICAgICAgIGhhc2MgPSB0cnVlXG4gICAgICAgIHRlcm0gPSB0ZXJtWy4uLi0xXVxuICAgICAgZWxzZSBpZiBjaGFyIGlzICdDJyBhbmQgZXNjYXBlZFxuICAgICAgICBoYXNDID0gdHJ1ZVxuICAgICAgICB0ZXJtID0gdGVybVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpc250ICdcXFxcJ1xuICAgICAgICB0ZXJtICs9IGNoYXJcbiAgICAgIGVzY2FwZWQgPSBmYWxzZVxuXG4gIGlmIGhhc0NcbiAgICBtb2RpZmllcnNbJ2knXSA9IGZhbHNlXG4gIGlmIChub3QgaGFzQyBhbmQgbm90IHRlcm0ubWF0Y2goJ1tBLVpdJykgYW5kIFxcXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ3ZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaCcpKSBvciBoYXNjXG4gICAgbW9kaWZpZXJzWydpJ10gPSB0cnVlXG5cbiAgbW9kRmxhZ3MgPSBPYmplY3Qua2V5cyhtb2RpZmllcnMpLmZpbHRlcigoa2V5KSAtPiBtb2RpZmllcnNba2V5XSkuam9pbignJylcblxuICB0cnlcbiAgICBuZXcgUmVnRXhwKHRlcm0sIG1vZEZsYWdzKVxuICBjYXRjaFxuICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZEZsYWdzKVxuXG5jbGFzcyBFeFxuICBAc2luZ2xldG9uOiA9PlxuICAgIEBleCB8fD0gbmV3IEV4XG5cbiAgQHJlZ2lzdGVyQ29tbWFuZDogKG5hbWUsIGZ1bmMpID0+XG4gICAgQHNpbmdsZXRvbigpW25hbWVdID0gZnVuY1xuXG4gIEByZWdpc3RlckFsaWFzOiAoYWxpYXMsIG5hbWUpID0+XG4gICAgQHNpbmdsZXRvbigpW2FsaWFzXSA9IChhcmdzKSA9PiBAc2luZ2xldG9uKClbbmFtZV0oYXJncylcblxuICBAZ2V0Q29tbWFuZHM6ICgpID0+XG4gICAgT2JqZWN0LmtleXMoRXguc2luZ2xldG9uKCkpLmNvbmNhdChPYmplY3Qua2V5cyhFeC5wcm90b3R5cGUpKS5maWx0ZXIoKGNtZCwgaW5kZXgsIGxpc3QpIC0+XG4gICAgICBsaXN0LmluZGV4T2YoY21kKSA9PSBpbmRleFxuICAgIClcblxuICBxdWl0OiAtPlxuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5kZXN0cm95QWN0aXZlSXRlbSgpXG5cbiAgcXVpdGFsbDogLT5cbiAgICBhdG9tLmNsb3NlKClcblxuICBxOiA9PiBAcXVpdCgpXG5cbiAgcWFsbDogPT4gQHF1aXRhbGwoKVxuXG4gIHRhYmVkaXQ6IChhcmdzKSA9PlxuICAgIGlmIGFyZ3MuYXJncy50cmltKCkgaXNudCAnJ1xuICAgICAgQGVkaXQoYXJncylcbiAgICBlbHNlXG4gICAgICBAdGFibmV3KGFyZ3MpXG5cbiAgdGFiZTogKGFyZ3MpID0+IEB0YWJlZGl0KGFyZ3MpXG5cbiAgdGFibmV3OiAoYXJncykgPT5cbiAgICBpZiBhcmdzLmFyZ3MudHJpbSgpIGlzICcnXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKClcbiAgICBlbHNlXG4gICAgICBAdGFiZWRpdChhcmdzKVxuXG4gIHRhYmNsb3NlOiAoYXJncykgPT4gQHF1aXQoYXJncylcblxuICB0YWJjOiA9PiBAdGFiY2xvc2UoKVxuXG4gIHRhYm5leHQ6IC0+XG4gICAgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKVxuICAgIHBhbmUuYWN0aXZhdGVOZXh0SXRlbSgpXG5cbiAgdGFibjogPT4gQHRhYm5leHQoKVxuXG4gIHRhYnByZXZpb3VzOiAtPlxuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBwYW5lLmFjdGl2YXRlUHJldmlvdXNJdGVtKClcblxuICB0YWJwOiA9PiBAdGFicHJldmlvdXMoKVxuXG4gIHRhYm9ubHk6IC0+XG4gICAgdGFiQmFyID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVswXVxuICAgIHRhYkJhckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGFiQmFyKS5xdWVyeVNlbGVjdG9yKFwiLnRhYi1iYXJcIilcbiAgICB0YWJCYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmlnaHQtY2xpY2tlZFwiKSAmJiB0YWJCYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucmlnaHQtY2xpY2tlZFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwicmlnaHQtY2xpY2tlZFwiKVxuICAgIHRhYkJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5hY3RpdmVcIikuY2xhc3NMaXN0LmFkZChcInJpZ2h0LWNsaWNrZWRcIilcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhYkJhckVsZW1lbnQsICd0YWJzOmNsb3NlLW90aGVyLXRhYnMnKVxuICAgIHRhYkJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5hY3RpdmVcIikuY2xhc3NMaXN0LnJlbW92ZShcInJpZ2h0LWNsaWNrZWRcIilcblxuICB0YWJvOiA9PiBAdGFib25seSgpXG5cbiAgZWRpdDogKHsgcmFuZ2UsIGFyZ3MsIGVkaXRvciB9KSAtPlxuICAgIGZpbGVQYXRoID0gYXJncy50cmltKClcbiAgICBpZiBmaWxlUGF0aFswXSBpcyAnISdcbiAgICAgIGZvcmNlID0gdHJ1ZVxuICAgICAgZmlsZVBhdGggPSBmaWxlUGF0aFsxLi5dLnRyaW0oKVxuICAgIGVsc2VcbiAgICAgIGZvcmNlID0gZmFsc2VcblxuICAgIGlmIGVkaXRvci5pc01vZGlmaWVkKCkgYW5kIG5vdCBmb3JjZVxuICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignTm8gd3JpdGUgc2luY2UgbGFzdCBjaGFuZ2UgKGFkZCAhIHRvIG92ZXJyaWRlKScpXG4gICAgaWYgZmlsZVBhdGguaW5kZXhPZignICcpIGlzbnQgLTFcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ09ubHkgb25lIGZpbGUgbmFtZSBhbGxvd2VkJylcblxuICAgIGlmIGZpbGVQYXRoLmxlbmd0aCBpc250IDBcbiAgICAgIGZ1bGxQYXRoID0gZ2V0RnVsbFBhdGgoZmlsZVBhdGgpXG4gICAgICBpZiBmdWxsUGF0aCBpcyBlZGl0b3IuZ2V0UGF0aCgpXG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZ1bGxQYXRoKVxuICAgIGVsc2VcbiAgICAgIGlmIGVkaXRvci5nZXRQYXRoKCk/XG4gICAgICAgIGVkaXRvci5nZXRCdWZmZXIoKS5yZWxvYWQoKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdObyBmaWxlIG5hbWUnKVxuXG4gIGU6IChhcmdzKSA9PiBAZWRpdChhcmdzKVxuXG4gIGVuZXc6IC0+XG4gICAgYnVmZmVyID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLmJ1ZmZlclxuICAgIGJ1ZmZlci5zZXRQYXRoKHVuZGVmaW5lZClcbiAgICBidWZmZXIubG9hZCgpXG5cbiAgd3JpdGU6ICh7IHJhbmdlLCBhcmdzLCBlZGl0b3IsIHNhdmVhcyB9KSAtPlxuICAgIHNhdmVhcyA/PSBmYWxzZVxuICAgIGZpbGVQYXRoID0gYXJnc1xuICAgIGlmIGZpbGVQYXRoWzBdIGlzICchJ1xuICAgICAgZm9yY2UgPSB0cnVlXG4gICAgICBmaWxlUGF0aCA9IGZpbGVQYXRoWzEuLl1cbiAgICBlbHNlXG4gICAgICBmb3JjZSA9IGZhbHNlXG5cbiAgICBmaWxlUGF0aCA9IGZpbGVQYXRoLnRyaW0oKVxuICAgIGlmIGZpbGVQYXRoLmluZGV4T2YoJyAnKSBpc250IC0xXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdPbmx5IG9uZSBmaWxlIG5hbWUgYWxsb3dlZCcpXG5cbiAgICBkZWZlcnJlZCA9IGRlZmVyKClcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHNhdmVkID0gZmFsc2VcbiAgICBpZiBmaWxlUGF0aC5sZW5ndGggaXNudCAwXG4gICAgICBmdWxsUGF0aCA9IGdldEZ1bGxQYXRoKGZpbGVQYXRoKVxuICAgIGlmIGVkaXRvci5nZXRQYXRoKCk/IGFuZCAobm90IGZ1bGxQYXRoPyBvciBlZGl0b3IuZ2V0UGF0aCgpID09IGZ1bGxQYXRoKVxuICAgICAgaWYgc2F2ZWFzXG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJBcmd1bWVudCByZXF1aXJlZFwiKVxuICAgICAgZWxzZVxuICAgICAgICAjIFVzZSBlZGl0b3Iuc2F2ZSB3aGVuIG5vIHBhdGggaXMgZ2l2ZW4gb3IgdGhlIHBhdGggdG8gdGhlIGZpbGUgaXMgZ2l2ZW5cbiAgICAgICAgdHJ5U2F2ZSgtPiBlZGl0b3Iuc2F2ZSgpKS50aGVuKGRlZmVycmVkLnJlc29sdmUpXG4gICAgICAgIHNhdmVkID0gdHJ1ZVxuICAgIGVsc2UgaWYgbm90IGZ1bGxQYXRoP1xuICAgICAgZnVsbFBhdGggPSBhdG9tLnNob3dTYXZlRGlhbG9nU3luYygpXG5cbiAgICBpZiBub3Qgc2F2ZWQgYW5kIGZ1bGxQYXRoP1xuICAgICAgaWYgbm90IGZvcmNlIGFuZCBmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKVxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiRmlsZSBleGlzdHMgKGFkZCAhIHRvIG92ZXJyaWRlKVwiKVxuICAgICAgaWYgc2F2ZWFzIG9yIGVkaXRvci5nZXRGaWxlTmFtZSgpID09IG51bGxcbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHRyeVNhdmUoLT4gZWRpdG9yLnNhdmVBcyhmdWxsUGF0aCwgZWRpdG9yKSkudGhlbihkZWZlcnJlZC5yZXNvbHZlKVxuICAgICAgZWxzZVxuICAgICAgICB0cnlTYXZlKC0+IHNhdmVBcyhmdWxsUGF0aCwgZWRpdG9yKSkudGhlbihkZWZlcnJlZC5yZXNvbHZlKVxuXG4gICAgZGVmZXJyZWQucHJvbWlzZVxuXG4gIHdhbGw6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uuc2F2ZUFsbCgpXG5cbiAgdzogKGFyZ3MpID0+XG4gICAgQHdyaXRlKGFyZ3MpXG5cbiAgd3E6IChhcmdzKSA9PlxuICAgIEB3cml0ZShhcmdzKS50aGVuKD0+IEBxdWl0KCkpXG5cbiAgd2E6ID0+XG4gICAgQHdhbGwoKVxuXG4gIHdxYWxsOiA9PlxuICAgIEB3YWxsKClcbiAgICBAcXVpdGFsbCgpXG5cbiAgd3FhOiA9PlxuICAgIEB3cWFsbCgpXG5cbiAgeGFsbDogPT5cbiAgICBAd3FhbGwoKVxuXG4gIHhhOiA9PlxuICAgIEB3cWFsbCgpXG5cbiAgc2F2ZWFzOiAoYXJncykgPT5cbiAgICBhcmdzLnNhdmVhcyA9IHRydWVcbiAgICBAd3JpdGUoYXJncylcblxuICB4aXQ6IChhcmdzKSA9PiBAd3EoYXJncylcblxuICB4OiAoYXJncykgPT4gQHhpdChhcmdzKVxuXG4gIHNwbGl0OiAoeyByYW5nZSwgYXJncyB9KSAtPlxuICAgIGFyZ3MgPSBhcmdzLnRyaW0oKVxuICAgIGZpbGVQYXRocyA9IGFyZ3Muc3BsaXQoJyAnKVxuICAgIGZpbGVQYXRocyA9IHVuZGVmaW5lZCBpZiBmaWxlUGF0aHMubGVuZ3RoIGlzIDEgYW5kIGZpbGVQYXRoc1swXSBpcyAnJ1xuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRiZWxvdycpXG4gICAgICBpZiBmaWxlUGF0aHM/IGFuZCBmaWxlUGF0aHMubGVuZ3RoID4gMFxuICAgICAgICBuZXdQYW5lID0gcGFuZS5zcGxpdERvd24oKVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlUGF0aHNcbiAgICAgICAgICBkbyAtPlxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZSBmaWxlLCBuZXdQYW5lXG4gICAgICBlbHNlXG4gICAgICAgIHBhbmUuc3BsaXREb3duKGNvcHlBY3RpdmVJdGVtOiB0cnVlKVxuICAgIGVsc2VcbiAgICAgIGlmIGZpbGVQYXRocz8gYW5kIGZpbGVQYXRocy5sZW5ndGggPiAwXG4gICAgICAgIG5ld1BhbmUgPSBwYW5lLnNwbGl0VXAoKVxuICAgICAgICBmb3IgZmlsZSBpbiBmaWxlUGF0aHNcbiAgICAgICAgICBkbyAtPlxuICAgICAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlblVSSUluUGFuZSBmaWxlLCBuZXdQYW5lXG4gICAgICBlbHNlXG4gICAgICAgIHBhbmUuc3BsaXRVcChjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcblxuXG4gIHNwOiAoYXJncykgPT4gQHNwbGl0KGFyZ3MpXG5cbiAgc3Vic3RpdHV0ZTogKHsgcmFuZ2UsIGFyZ3MsIGVkaXRvciwgdmltU3RhdGUgfSkgLT5cbiAgICBhcmdzXyA9IGFyZ3MudHJpbUxlZnQoKVxuICAgIGRlbGltID0gYXJnc19bMF1cbiAgICBpZiAvW2EtejEtOVxcXFxcInxdL2kudGVzdChkZWxpbSlcbiAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXG4gICAgICAgIFwiUmVndWxhciBleHByZXNzaW9ucyBjYW4ndCBiZSBkZWxpbWl0ZWQgYnkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMsICdcXFxcJywgJ1xcXCInIG9yICd8J1wiKVxuICAgIGFyZ3NfID0gYXJnc19bMS4uXVxuICAgIGVzY2FwZUNoYXJzID0ge3Q6ICdcXHQnLCBuOiAnXFxuJywgcjogJ1xccid9XG4gICAgcGFyc2VkID0gWycnLCAnJywgJyddXG4gICAgcGFyc2luZyA9IDBcbiAgICBlc2NhcGVkID0gZmFsc2VcbiAgICB3aGlsZSAoY2hhciA9IGFyZ3NfWzBdKT9cbiAgICAgIGFyZ3NfID0gYXJnc19bMS4uXVxuICAgICAgaWYgY2hhciBpcyBkZWxpbVxuICAgICAgICBpZiBub3QgZXNjYXBlZFxuICAgICAgICAgIHBhcnNpbmcrK1xuICAgICAgICAgIGlmIHBhcnNpbmcgPiAyXG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdUcmFpbGluZyBjaGFyYWN0ZXJzJylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHBhcnNlZFtwYXJzaW5nXSA9IHBhcnNlZFtwYXJzaW5nXVsuLi4tMV1cbiAgICAgIGVsc2UgaWYgY2hhciBpcyAnXFxcXCcgYW5kIG5vdCBlc2NhcGVkXG4gICAgICAgIHBhcnNlZFtwYXJzaW5nXSArPSBjaGFyXG4gICAgICAgIGVzY2FwZWQgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBhcnNpbmcgPT0gMSBhbmQgZXNjYXBlZCBhbmQgZXNjYXBlQ2hhcnNbY2hhcl0/XG4gICAgICAgIHBhcnNlZFtwYXJzaW5nXSArPSBlc2NhcGVDaGFyc1tjaGFyXVxuICAgICAgICBlc2NhcGVkID0gZmFsc2VcbiAgICAgIGVsc2VcbiAgICAgICAgZXNjYXBlZCA9IGZhbHNlXG4gICAgICAgIHBhcnNlZFtwYXJzaW5nXSArPSBjaGFyXG5cbiAgICBbcGF0dGVybiwgc3Vic3RpdGlvbiwgZmxhZ3NdID0gcGFyc2VkXG4gICAgaWYgcGF0dGVybiBpcyAnJ1xuICAgICAgaWYgdmltU3RhdGUuZ2V0U2VhcmNoSGlzdG9yeUl0ZW0/XG4gICAgICAgICMgdmltLW1vZGVcbiAgICAgICAgcGF0dGVybiA9IHZpbVN0YXRlLmdldFNlYXJjaEhpc3RvcnlJdGVtKClcbiAgICAgIGVsc2UgaWYgdmltU3RhdGUuc2VhcmNoSGlzdG9yeT9cbiAgICAgICAgIyB2aW0tbW9kZS1wbHVzXG4gICAgICAgIHBhdHRlcm4gPSB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LmdldCgncHJldicpXG5cbiAgICAgIGlmIG5vdCBwYXR0ZXJuP1xuICAgICAgICBhdG9tLmJlZXAoKVxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdObyBwcmV2aW91cyByZWd1bGFyIGV4cHJlc3Npb24nKVxuICAgIGVsc2VcbiAgICAgIGlmIHZpbVN0YXRlLnB1c2hTZWFyY2hIaXN0b3J5P1xuICAgICAgICAjIHZpbS1tb2RlXG4gICAgICAgIHZpbVN0YXRlLnB1c2hTZWFyY2hIaXN0b3J5KHBhdHRlcm4pXG4gICAgICBlbHNlIGlmIHZpbVN0YXRlLnNlYXJjaEhpc3Rvcnk/XG4gICAgICAgICMgdmltLW1vZGUtcGx1c1xuICAgICAgICB2aW1TdGF0ZS5zZWFyY2hIaXN0b3J5LnNhdmUocGF0dGVybilcblxuICAgIHRyeVxuICAgICAgZmxhZ3NPYmogPSB7fVxuICAgICAgZmxhZ3Muc3BsaXQoJycpLmZvckVhY2goKGZsYWcpIC0+IGZsYWdzT2JqW2ZsYWddID0gdHJ1ZSlcbiAgICAgIHBhdHRlcm5SRSA9IGdldFNlYXJjaFRlcm0ocGF0dGVybiwgZmxhZ3NPYmopXG4gICAgY2F0Y2ggZVxuICAgICAgaWYgZS5tZXNzYWdlLmluZGV4T2YoJ0ludmFsaWQgZmxhZ3Mgc3VwcGxpZWQgdG8gUmVnRXhwIGNvbnN0cnVjdG9yJykgaXMgMFxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiSW52YWxpZCBmbGFnczogI3tlLm1lc3NhZ2VbNDUuLl19XCIpXG4gICAgICBlbHNlIGlmIGUubWVzc2FnZS5pbmRleE9mKCdJbnZhbGlkIHJlZ3VsYXIgZXhwcmVzc2lvbjogJykgaXMgMFxuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiSW52YWxpZCBSZWdFeDogI3tlLm1lc3NhZ2VbMjcuLl19XCIpXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IGVcblxuICAgIGVkaXRvci50cmFuc2FjdCAtPlxuICAgICAgZm9yIGxpbmUgaW4gW3JhbmdlWzBdLi5yYW5nZVsxXV1cbiAgICAgICAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKFxuICAgICAgICAgIHBhdHRlcm5SRSxcbiAgICAgICAgICBbW2xpbmUsIDBdLCBbbGluZSArIDEsIDBdXSxcbiAgICAgICAgICAoe21hdGNoLCByZXBsYWNlfSkgLT5cbiAgICAgICAgICAgIHJlcGxhY2UocmVwbGFjZUdyb3VwcyhtYXRjaFsuLl0sIHN1YnN0aXRpb24pKVxuICAgICAgICApXG5cbiAgczogKGFyZ3MpID0+IEBzdWJzdGl0dXRlKGFyZ3MpXG5cbiAgdnNwbGl0OiAoeyByYW5nZSwgYXJncyB9KSAtPlxuICAgIGFyZ3MgPSBhcmdzLnRyaW0oKVxuICAgIGZpbGVQYXRocyA9IGFyZ3Muc3BsaXQoJyAnKVxuICAgIGZpbGVQYXRocyA9IHVuZGVmaW5lZCBpZiBmaWxlUGF0aHMubGVuZ3RoIGlzIDEgYW5kIGZpbGVQYXRoc1swXSBpcyAnJ1xuICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2V4LW1vZGUuc3BsaXRyaWdodCcpXG4gICAgICBpZiBmaWxlUGF0aHM/IGFuZCBmaWxlUGF0aHMubGVuZ3RoID4gMFxuICAgICAgICBuZXdQYW5lID0gcGFuZS5zcGxpdFJpZ2h0KClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0UmlnaHQoY29weUFjdGl2ZUl0ZW06IHRydWUpXG4gICAgZWxzZVxuICAgICAgaWYgZmlsZVBhdGhzPyBhbmQgZmlsZVBhdGhzLmxlbmd0aCA+IDBcbiAgICAgICAgbmV3UGFuZSA9IHBhbmUuc3BsaXRMZWZ0KClcbiAgICAgICAgZm9yIGZpbGUgaW4gZmlsZVBhdGhzXG4gICAgICAgICAgZG8gLT5cbiAgICAgICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUgZmlsZSwgbmV3UGFuZVxuICAgICAgZWxzZVxuICAgICAgICBwYW5lLnNwbGl0TGVmdChjb3B5QWN0aXZlSXRlbTogdHJ1ZSlcblxuICB2c3A6IChhcmdzKSA9PiBAdnNwbGl0KGFyZ3MpXG5cbiAgZGVsZXRlOiAoeyByYW5nZSB9KSAtPlxuICAgIHJhbmdlID0gW1tyYW5nZVswXSwgMF0sIFtyYW5nZVsxXSArIDEsIDBdXVxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgdGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSh0ZXh0KVxuXG4gICAgZWRpdG9yLmJ1ZmZlci5zZXRUZXh0SW5SYW5nZShyYW5nZSwgJycpXG5cbiAgeWFuazogKHsgcmFuZ2UgfSkgLT5cbiAgICByYW5nZSA9IFtbcmFuZ2VbMF0sIDBdLCBbcmFuZ2VbMV0gKyAxLCAwXV1cbiAgICB0eHQgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCkuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodHh0KTtcblxuICBzZXQ6ICh7IHJhbmdlLCBhcmdzIH0pIC0+XG4gICAgYXJncyA9IGFyZ3MudHJpbSgpXG4gICAgaWYgYXJncyA9PSBcIlwiXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm8gb3B0aW9uIHNwZWNpZmllZFwiKVxuICAgIG9wdGlvbnMgPSBhcmdzLnNwbGl0KCcgJylcbiAgICBmb3Igb3B0aW9uIGluIG9wdGlvbnNcbiAgICAgIGRvIC0+XG4gICAgICAgIGlmIG9wdGlvbi5pbmNsdWRlcyhcIj1cIilcbiAgICAgICAgICBuYW1lVmFsUGFpciA9IG9wdGlvbi5zcGxpdChcIj1cIilcbiAgICAgICAgICBpZiAobmFtZVZhbFBhaXIubGVuZ3RoICE9IDIpXG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiV3Jvbmcgb3B0aW9uIGZvcm1hdC4gW25hbWVdPVt2YWx1ZV0gZm9ybWF0IGlzIGV4cGVjdGVkXCIpXG4gICAgICAgICAgb3B0aW9uTmFtZSA9IG5hbWVWYWxQYWlyWzBdXG4gICAgICAgICAgb3B0aW9uVmFsdWUgPSBuYW1lVmFsUGFpclsxXVxuICAgICAgICAgIG9wdGlvblByb2Nlc3NvciA9IFZpbU9wdGlvbi5zaW5nbGV0b24oKVtvcHRpb25OYW1lXVxuICAgICAgICAgIGlmIG5vdCBvcHRpb25Qcm9jZXNzb3I/XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm8gc3VjaCBvcHRpb246ICN7b3B0aW9uTmFtZX1cIilcbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3Iob3B0aW9uVmFsdWUpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcHRpb25Qcm9jZXNzb3IgPSBWaW1PcHRpb24uc2luZ2xldG9uKClbb3B0aW9uXVxuICAgICAgICAgIGlmIG5vdCBvcHRpb25Qcm9jZXNzb3I/XG4gICAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm8gc3VjaCBvcHRpb246ICN7b3B0aW9ufVwiKVxuICAgICAgICAgIG9wdGlvblByb2Nlc3NvcigpXG5cbm1vZHVsZS5leHBvcnRzID0gRXhcbiJdfQ==
