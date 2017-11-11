(function() {
  var $, GitLog, GitRevisionView, GitTimeMachineView, GitTimeplot, NOT_GIT_ERRORS, View, _, moment, path, ref, str,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  path = require('path');

  _ = require('underscore-plus');

  str = require('bumble-strings');

  moment = require('moment');

  GitLog = require('git-log-utils');

  GitTimeplot = require('./git-timeplot');

  GitRevisionView = require('./git-revision-view');

  NOT_GIT_ERRORS = ['File not a git repository', 'is outside repository', "Not a git repository"];

  module.exports = GitTimeMachineView = (function() {
    function GitTimeMachineView(serializedState, options) {
      if (options == null) {
        options = {};
      }
      this._onEditorResize = bind(this._onEditorResize, this);
      if (!this.$element) {
        this.$element = $("<div class='git-time-machine'>");
      }
      if (options.editor != null) {
        this.setEditor(options.editor);
        this.render();
      }
      this._bindWindowEvents();
    }

    GitTimeMachineView.prototype.setEditor = function(editor) {
      var file, ref1;
      if (editor === this.editor) {
        return;
      }
      file = editor != null ? editor.getPath() : void 0;
      if (!((file != null) && !str.startsWith(path.basename(file), GitRevisionView.FILE_PREFIX))) {
        return;
      }
      ref1 = [editor, file], this.editor = ref1[0], this.file = ref1[1];
      return this.render();
    };

    GitTimeMachineView.prototype.render = function() {
      var commits;
      commits = this.gitCommitHistory();
      if (!((this.file != null) && (commits != null))) {
        this._renderPlaceholder();
      } else {
        this.$element.text("");
        this._renderCloseHandle();
        this._renderStats(commits);
        this._renderTimeline(commits);
      }
      return this.$element;
    };

    GitTimeMachineView.prototype.serialize = function() {
      return null;
    };

    GitTimeMachineView.prototype.destroy = function() {
      this._unbindWindowEvents();
      return this.$element.remove();
    };

    GitTimeMachineView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.timeplot) != null ? ref1.hide() : void 0;
    };

    GitTimeMachineView.prototype.show = function() {
      var ref1;
      return (ref1 = this.timeplot) != null ? ref1.show() : void 0;
    };

    GitTimeMachineView.prototype.getElement = function() {
      return this.$element.get(0);
    };

    GitTimeMachineView.prototype.gitCommitHistory = function(file) {
      var commits, e;
      if (file == null) {
        file = this.file;
      }
      if (file == null) {
        return null;
      }
      try {
        commits = GitLog.getCommitHistory(file);
      } catch (error) {
        e = error;
        if (e.message != null) {
          if (str.weaklyHas(e.message, NOT_GIT_ERRORS)) {
            console.warn(file + " not in a git repository");
            return null;
          }
        }
        atom.notifications.addError(String(e));
        console.error(e);
        return null;
      }
      return commits;
    };

    GitTimeMachineView.prototype._bindWindowEvents = function() {
      return $(window).on('resize', this._onEditorResize);
    };

    GitTimeMachineView.prototype._unbindWindowEvents = function() {
      return $(window).off('resize', this._onEditorResize);
    };

    GitTimeMachineView.prototype._renderPlaceholder = function() {
      this.$element.html("<div class='placeholder'>Select a file in the git repo to see timeline</div>");
    };

    GitTimeMachineView.prototype._renderCloseHandle = function() {
      var $closeHandle;
      $closeHandle = $("<div class='close-handle'>X</div>");
      this.$element.append($closeHandle);
      return $closeHandle.on('mousedown', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return atom.commands.dispatch(atom.views.getView(atom.workspace), "git-time-machine:toggle");
      });
    };

    GitTimeMachineView.prototype._renderTimeline = function(commits) {
      this.timeplot || (this.timeplot = new GitTimeplot(this.$element));
      this.timeplot.render(this.editor, commits);
    };

    GitTimeMachineView.prototype._renderStats = function(commits) {
      var authorCount, byAuthor, content, durationInMs, timeSpan;
      content = "";
      if (commits.length > 0) {
        byAuthor = _.indexBy(commits, 'authorName');
        authorCount = _.keys(byAuthor).length;
        durationInMs = moment.unix(commits[commits.length - 1].authorDate).diff(moment.unix(commits[0].authorDate));
        timeSpan = moment.duration(durationInMs).humanize();
        content = "<span class='total-commits'>" + commits.length + "</span> commits by " + authorCount + " authors spanning " + timeSpan;
      }
      this.$element.append("<div class='stats'>\n  " + content + "\n</div>");
    };

    GitTimeMachineView.prototype._onEditorResize = function() {
      return this.render();
    };

    return GitTimeMachineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9saWIvZ2l0LXRpbWUtbWFjaGluZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEdBQUE7SUFBQTs7RUFBQSxNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsU0FBRCxFQUFJOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLEdBQUEsR0FBTSxPQUFBLENBQVEsZ0JBQVI7O0VBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUVULE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUjs7RUFDVCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHFCQUFSOztFQUVsQixjQUFBLEdBQWlCLENBQUMsMkJBQUQsRUFBOEIsdUJBQTlCLEVBQXVELHNCQUF2RDs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLDRCQUFDLGVBQUQsRUFBa0IsT0FBbEI7O1FBQWtCLFVBQVE7OztNQUNyQyxJQUFBLENBQXVELElBQUMsQ0FBQSxRQUF4RDtRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksQ0FBQSxDQUFFLGdDQUFGLEVBQVo7O01BQ0EsSUFBRyxzQkFBSDtRQUNFLElBQUMsQ0FBQSxTQUFELENBQVcsT0FBTyxDQUFDLE1BQW5CO1FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUZGOztNQUlBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBTlc7O2lDQVNiLFNBQUEsR0FBVyxTQUFDLE1BQUQ7QUFDVCxVQUFBO01BQUEsSUFBYyxNQUFBLEtBQVUsSUFBQyxDQUFBLE1BQXpCO0FBQUEsZUFBQTs7TUFDQSxJQUFBLG9CQUFPLE1BQU0sQ0FBRSxPQUFSLENBQUE7TUFDUCxJQUFB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QUE7SUFEZTs7Ozs7QUFySW5CIiwic291cmNlc0NvbnRlbnQiOlsieyQsIFZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbnBhdGggPSByZXF1aXJlKCdwYXRoJylcbl8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKVxuc3RyID0gcmVxdWlyZSgnYnVtYmxlLXN0cmluZ3MnKVxubW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JylcblxuR2l0TG9nID0gcmVxdWlyZSAnZ2l0LWxvZy11dGlscydcbkdpdFRpbWVwbG90ID0gcmVxdWlyZSAnLi9naXQtdGltZXBsb3QnXG5HaXRSZXZpc2lvblZpZXcgPSByZXF1aXJlICcuL2dpdC1yZXZpc2lvbi12aWV3J1xuXG5OT1RfR0lUX0VSUk9SUyA9IFsnRmlsZSBub3QgYSBnaXQgcmVwb3NpdG9yeScsICdpcyBvdXRzaWRlIHJlcG9zaXRvcnknLCBcIk5vdCBhIGdpdCByZXBvc2l0b3J5XCJdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEdpdFRpbWVNYWNoaW5lVmlld1xuICBjb25zdHJ1Y3RvcjogKHNlcmlhbGl6ZWRTdGF0ZSwgb3B0aW9ucz17fSkgLT5cbiAgICBAJGVsZW1lbnQgPSAkKFwiPGRpdiBjbGFzcz0nZ2l0LXRpbWUtbWFjaGluZSc+XCIpIHVubGVzcyBAJGVsZW1lbnRcbiAgICBpZiBvcHRpb25zLmVkaXRvcj9cbiAgICAgIEBzZXRFZGl0b3Iob3B0aW9ucy5lZGl0b3IpXG4gICAgICBAcmVuZGVyKClcbiAgICAgIFxuICAgIEBfYmluZFdpbmRvd0V2ZW50cygpXG5cblxuICBzZXRFZGl0b3I6IChlZGl0b3IpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgIT0gQGVkaXRvclxuICAgIGZpbGUgPSBlZGl0b3I/LmdldFBhdGgoKVxuICAgIHJldHVybiB1bmxlc3MgZmlsZT8gJiYgIXN0ci5zdGFydHNXaXRoKHBhdGguYmFzZW5hbWUoZmlsZSksIEdpdFJldmlzaW9uVmlldy5GSUxFX1BSRUZJWClcbiAgICBbQGVkaXRvciwgQGZpbGVdID0gW2VkaXRvciwgZmlsZV1cbiAgICBAcmVuZGVyKClcblxuXG4gIHJlbmRlcjogKCkgLT5cbiAgICBjb21taXRzID0gQGdpdENvbW1pdEhpc3RvcnkoKVxuICAgIHVubGVzcyBAZmlsZT8gJiYgY29tbWl0cz9cbiAgICAgIEBfcmVuZGVyUGxhY2Vob2xkZXIoKVxuICAgIGVsc2VcbiAgICAgIEAkZWxlbWVudC50ZXh0KFwiXCIpXG4gICAgICBAX3JlbmRlckNsb3NlSGFuZGxlKClcbiAgICAgIEBfcmVuZGVyU3RhdHMoY29tbWl0cylcbiAgICAgIEBfcmVuZGVyVGltZWxpbmUoY29tbWl0cylcblxuICAgIHJldHVybiBAJGVsZW1lbnRcblxuXG4gICMgUmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgcmV0cmlldmVkIHdoZW4gcGFja2FnZSBpcyBhY3RpdmF0ZWRcbiAgc2VyaWFsaXplOiAtPlxuICAgIHJldHVybiBudWxsXG5cblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuICAgIEBfdW5iaW5kV2luZG93RXZlbnRzKClcbiAgICBAJGVsZW1lbnQucmVtb3ZlKClcbiAgICBcbiAgICBcbiAgaGlkZTogLT5cbiAgICBAdGltZXBsb3Q/LmhpZGUoKSAgICMgc28gaXQga25vd3MgdG8gaGlkZSB0aGUgcG9wdXBcblxuXG4gIHNob3c6IC0+XG4gICAgQHRpbWVwbG90Py5zaG93KClcblxuXG4gIGdldEVsZW1lbnQ6IC0+XG4gICAgcmV0dXJuIEAkZWxlbWVudC5nZXQoMClcblxuXG4gIGdpdENvbW1pdEhpc3Rvcnk6IChmaWxlPUBmaWxlKS0+XG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIGZpbGU/XG4gICAgdHJ5XG4gICAgICBjb21taXRzID0gR2l0TG9nLmdldENvbW1pdEhpc3RvcnkgZmlsZVxuICAgIGNhdGNoIGVcbiAgICAgIGlmIGUubWVzc2FnZT9cbiAgICAgICAgaWYgc3RyLndlYWtseUhhcyhlLm1lc3NhZ2UsIE5PVF9HSVRfRVJST1JTKVxuICAgICAgICAgIGNvbnNvbGUud2FybiBcIiN7ZmlsZX0gbm90IGluIGEgZ2l0IHJlcG9zaXRvcnlcIlxuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICBcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBTdHJpbmcgZVxuICAgICAgY29uc29sZS5lcnJvciBlXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIGNvbW1pdHM7XG5cblxuXG5cbiAgX2JpbmRXaW5kb3dFdmVudHM6ICgpIC0+XG4gICAgJCh3aW5kb3cpLm9uICdyZXNpemUnLCBAX29uRWRpdG9yUmVzaXplIFxuICAgIFxuICAgIFxuICBfdW5iaW5kV2luZG93RXZlbnRzOiAoKSAtPlxuICAgICQod2luZG93KS5vZmYgJ3Jlc2l6ZScsIEBfb25FZGl0b3JSZXNpemVcblxuXG4gIF9yZW5kZXJQbGFjZWhvbGRlcjogKCkgLT5cbiAgICBAJGVsZW1lbnQuaHRtbChcIjxkaXYgY2xhc3M9J3BsYWNlaG9sZGVyJz5TZWxlY3QgYSBmaWxlIGluIHRoZSBnaXQgcmVwbyB0byBzZWUgdGltZWxpbmU8L2Rpdj5cIilcbiAgICByZXR1cm5cblxuXG4gIF9yZW5kZXJDbG9zZUhhbmRsZTogKCkgLT5cbiAgICAkY2xvc2VIYW5kbGUgPSAkKFwiPGRpdiBjbGFzcz0nY2xvc2UtaGFuZGxlJz5YPC9kaXY+XCIpXG4gICAgQCRlbGVtZW50LmFwcGVuZCAkY2xvc2VIYW5kbGVcbiAgICAkY2xvc2VIYW5kbGUub24gJ21vdXNlZG93bicsIChlKS0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICMgd2h5IG5vdD8gaW5zdGVhZCBvZiBhZGRpbmcgY2FsbGJhY2ssIG91ciBvd24gZXZlbnQuLi5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgXCJnaXQtdGltZS1tYWNoaW5lOnRvZ2dsZVwiKVxuXG5cblxuICBfcmVuZGVyVGltZWxpbmU6IChjb21taXRzKSAtPlxuICAgIEB0aW1lcGxvdCB8fD0gbmV3IEdpdFRpbWVwbG90KEAkZWxlbWVudClcbiAgICBAdGltZXBsb3QucmVuZGVyKEBlZGl0b3IsIGNvbW1pdHMpXG4gICAgcmV0dXJuXG5cblxuICBfcmVuZGVyU3RhdHM6IChjb21taXRzKSAtPlxuICAgIGNvbnRlbnQgPSBcIlwiXG4gICAgaWYgY29tbWl0cy5sZW5ndGggPiAwXG4gICAgICBieUF1dGhvciA9IF8uaW5kZXhCeSBjb21taXRzLCAnYXV0aG9yTmFtZSdcbiAgICAgIGF1dGhvckNvdW50ID0gXy5rZXlzKGJ5QXV0aG9yKS5sZW5ndGhcbiAgICAgIGR1cmF0aW9uSW5NcyA9IG1vbWVudC51bml4KGNvbW1pdHNbY29tbWl0cy5sZW5ndGggLSAxXS5hdXRob3JEYXRlKS5kaWZmKG1vbWVudC51bml4KGNvbW1pdHNbMF0uYXV0aG9yRGF0ZSkpXG4gICAgICB0aW1lU3BhbiA9IG1vbWVudC5kdXJhdGlvbihkdXJhdGlvbkluTXMpLmh1bWFuaXplKClcbiAgICAgIGNvbnRlbnQgPSBcIjxzcGFuIGNsYXNzPSd0b3RhbC1jb21taXRzJz4je2NvbW1pdHMubGVuZ3RofTwvc3Bhbj4gY29tbWl0cyBieSAje2F1dGhvckNvdW50fSBhdXRob3JzIHNwYW5uaW5nICN7dGltZVNwYW59XCJcbiAgICBAJGVsZW1lbnQuYXBwZW5kIFwiXCJcIlxuICAgICAgPGRpdiBjbGFzcz0nc3RhdHMnPlxuICAgICAgICAje2NvbnRlbnR9XG4gICAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgICByZXR1cm5cblxuXG4gIF9vbkVkaXRvclJlc2l6ZTogPT5cbiAgICBAcmVuZGVyKClcbiAgICAiXX0=
