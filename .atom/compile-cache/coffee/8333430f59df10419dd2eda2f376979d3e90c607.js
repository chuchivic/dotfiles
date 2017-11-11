(function() {
  var $, $$$, BufferedProcess, Disposable, GitShow, LogListView, View, _, git, numberOfCommitsToShow, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Disposable = require('atom').Disposable;

  BufferedProcess = require('atom').BufferedProcess;

  ref = require('atom-space-pen-views'), $ = ref.$, $$$ = ref.$$$, View = ref.View;

  _ = require('underscore-plus');

  git = require('../git');

  GitShow = require('../models/git-show');

  numberOfCommitsToShow = function() {
    return atom.config.get('git-plus.logs.numberOfCommitsToShow');
  };

  module.exports = LogListView = (function(superClass) {
    extend(LogListView, superClass);

    function LogListView() {
      return LogListView.__super__.constructor.apply(this, arguments);
    }

    LogListView.content = function() {
      return this.div({
        "class": 'git-plus-log',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.table({
            id: 'git-plus-commits',
            outlet: 'commitsListView'
          });
          return _this.div({
            "class": 'show-more'
          }, function() {
            return _this.a({
              id: 'show-more'
            }, 'Show More');
          });
        };
      })(this));
    };

    LogListView.prototype.getURI = function() {
      return 'atom://git-plus:log';
    };

    LogListView.prototype.getTitle = function() {
      return 'git-plus: Log';
    };

    LogListView.prototype.initialize = function() {
      var loadMore;
      this.skipCommits = 0;
      this.finished = false;
      loadMore = _.debounce((function(_this) {
        return function() {
          if (_this.prop('scrollHeight') - _this.scrollTop() - _this.height() < 20) {
            return _this.getLog();
          }
        };
      })(this), 50);
      this.on('click', '.commit-row', (function(_this) {
        return function(arg) {
          var currentTarget;
          currentTarget = arg.currentTarget;
          return _this.showCommitLog(currentTarget.getAttribute('hash'));
        };
      })(this));
      this.on('click', '#show-more', loadMore);
      return this.scroll(loadMore);
    };

    LogListView.prototype.attached = function() {
      return this.commandSubscription = atom.commands.add(this.element, {
        'core:move-down': (function(_this) {
          return function() {
            return _this.selectNextResult();
          };
        })(this),
        'core:move-up': (function(_this) {
          return function() {
            return _this.selectPreviousResult();
          };
        })(this),
        'core:page-up': (function(_this) {
          return function() {
            return _this.selectPreviousResult(10);
          };
        })(this),
        'core:page-down': (function(_this) {
          return function() {
            return _this.selectNextResult(10);
          };
        })(this),
        'core:move-to-top': (function(_this) {
          return function() {
            return _this.selectFirstResult();
          };
        })(this),
        'core:move-to-bottom': (function(_this) {
          return function() {
            return _this.selectLastResult();
          };
        })(this),
        'core:confirm': (function(_this) {
          return function() {
            var hash;
            hash = _this.find('.selected').attr('hash');
            if (hash) {
              _this.showCommitLog(hash);
            }
            return false;
          };
        })(this)
      });
    };

    LogListView.prototype.detached = function() {
      this.commandSubscription.dispose();
      return this.commandSubscription = null;
    };

    LogListView.prototype.parseData = function(data) {
      var commits, newline, separator;
      if (data.length < 1) {
        this.finished = true;
        return;
      }
      separator = ';|';
      newline = '_.;._';
      data = data.substring(0, data.length - newline.length - 1);
      commits = data.split(newline).map(function(line) {
        var tmpData;
        if (line.trim() !== '') {
          tmpData = line.trim().split(separator);
          return {
            hashShort: tmpData[0],
            hash: tmpData[1],
            author: tmpData[2],
            email: tmpData[3],
            message: tmpData[4],
            date: tmpData[5]
          };
        }
      });
      return this.renderLog(commits);
    };

    LogListView.prototype.renderHeader = function() {
      var headerRow;
      headerRow = $$$(function() {
        return this.tr({
          "class": 'commit-header'
        }, (function(_this) {
          return function() {
            _this.td('Date');
            _this.td('Message');
            return _this.td({
              "class": 'hashShort'
            }, 'Short Hash');
          };
        })(this));
      });
      return this.commitsListView.append(headerRow);
    };

    LogListView.prototype.renderLog = function(commits) {
      commits.forEach((function(_this) {
        return function(commit) {
          return _this.renderCommit(commit);
        };
      })(this));
      return this.skipCommits += numberOfCommitsToShow();
    };

    LogListView.prototype.renderCommit = function(commit) {
      var commitRow;
      commitRow = $$$(function() {
        return this.tr({
          "class": 'commit-row',
          hash: "" + commit.hash
        }, (function(_this) {
          return function() {
            _this.td({
              "class": 'date'
            }, commit.date + " by " + commit.author);
            _this.td({
              "class": 'message'
            }, "" + commit.message);
            return _this.td({
              "class": 'hashShort'
            }, "" + commit.hashShort);
          };
        })(this));
      });
      return this.commitsListView.append(commitRow);
    };

    LogListView.prototype.showCommitLog = function(hash) {
      return GitShow(this.repo, hash, this.onlyCurrentFile ? this.currentFile : void 0);
    };

    LogListView.prototype.branchLog = function(repo) {
      this.repo = repo;
      this.skipCommits = 0;
      this.commitsListView.empty();
      this.onlyCurrentFile = false;
      this.currentFile = null;
      this.renderHeader();
      return this.getLog();
    };

    LogListView.prototype.currentFileLog = function(repo, currentFile) {
      this.repo = repo;
      this.currentFile = currentFile;
      this.onlyCurrentFile = true;
      this.skipCommits = 0;
      this.commitsListView.empty();
      this.renderHeader();
      return this.getLog();
    };

    LogListView.prototype.getLog = function() {
      var args;
      if (this.finished) {
        return;
      }
      args = ['log', "--pretty=%h;|%H;|%aN;|%aE;|%s;|%ai_.;._", "-" + (numberOfCommitsToShow()), '--skip=' + this.skipCommits];
      if (this.onlyCurrentFile && (this.currentFile != null)) {
        args.push(this.currentFile);
      }
      return git.cmd(args, {
        cwd: this.repo.getWorkingDirectory()
      }).then((function(_this) {
        return function(data) {
          return _this.parseData(data);
        };
      })(this));
    };

    LogListView.prototype.selectFirstResult = function() {
      this.selectResult(this.find('.commit-row:first'));
      return this.scrollToTop();
    };

    LogListView.prototype.selectLastResult = function() {
      this.selectResult(this.find('.commit-row:last'));
      return this.scrollToBottom();
    };

    LogListView.prototype.selectNextResult = function(skip) {
      var nextView, selectedView;
      if (skip == null) {
        skip = 1;
      }
      selectedView = this.find('.selected');
      if (selectedView.length < 1) {
        return this.selectFirstResult();
      }
      nextView = this.getNextResult(selectedView, skip);
      this.selectResult(nextView);
      return this.scrollTo(nextView);
    };

    LogListView.prototype.selectPreviousResult = function(skip) {
      var prevView, selectedView;
      if (skip == null) {
        skip = 1;
      }
      selectedView = this.find('.selected');
      if (selectedView.length < 1) {
        return this.selectFirstResult();
      }
      prevView = this.getPreviousResult(selectedView, skip);
      this.selectResult(prevView);
      return this.scrollTo(prevView);
    };

    LogListView.prototype.getNextResult = function(element, skip) {
      var itemIndex, items;
      if (!(element != null ? element.length : void 0)) {
        return;
      }
      items = this.find('.commit-row');
      itemIndex = items.index(element);
      return $(items[Math.min(itemIndex + skip, items.length - 1)]);
    };

    LogListView.prototype.getPreviousResult = function(element, skip) {
      var itemIndex, items;
      if (!(element != null ? element.length : void 0)) {
        return;
      }
      items = this.find('.commit-row');
      itemIndex = items.index(element);
      return $(items[Math.max(itemIndex - skip, 0)]);
    };

    LogListView.prototype.selectResult = function(resultView) {
      if (!(resultView != null ? resultView.length : void 0)) {
        return;
      }
      this.find('.selected').removeClass('selected');
      return resultView.addClass('selected');
    };

    LogListView.prototype.scrollTo = function(element) {
      var bottom, top;
      if (!(element != null ? element.length : void 0)) {
        return;
      }
      top = this.scrollTop() + element.offset().top - this.offset().top;
      bottom = top + element.outerHeight();
      if (bottom > this.scrollBottom()) {
        this.scrollBottom(bottom);
      }
      if (top < this.scrollTop()) {
        return this.scrollTop(top);
      }
    };

    return LogListView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL2xvZy1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtR0FBQTtJQUFBOzs7RUFBQyxhQUFjLE9BQUEsQ0FBUSxNQUFSOztFQUNkLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsTUFBaUIsT0FBQSxDQUFRLHNCQUFSLENBQWpCLEVBQUMsU0FBRCxFQUFJLGFBQUosRUFBUzs7RUFDVCxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFDTixPQUFBLEdBQVUsT0FBQSxDQUFRLG9CQUFSOztFQUVWLHFCQUFBLEdBQXdCLFNBQUE7V0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IscUNBQWhCO0VBQUg7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixXQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxjQUFQO1FBQXVCLFFBQUEsRUFBVSxDQUFDLENBQWxDO09BQUwsRUFBMEMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3hDLEtBQUMsQ0FBQSxLQUFELENBQU87WUFBQSxFQUFBLEVBQUksa0JBQUo7WUFBd0IsTUFBQSxFQUFRLGlCQUFoQztXQUFQO2lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7V0FBTCxFQUF5QixTQUFBO21CQUN2QixLQUFDLENBQUEsQ0FBRCxDQUFHO2NBQUEsRUFBQSxFQUFJLFdBQUo7YUFBSCxFQUFvQixXQUFwQjtVQUR1QixDQUF6QjtRQUZ3QztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUM7SUFEUTs7MEJB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R0FBZSxPQUFPLENBQUMsTUFBUixDQUFBLENBQWdCLENBQUMsR0FBaEMsR0FBc0MsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUM7TUFDdEQsTUFBQSxHQUFTLEdBQUEsR0FBTSxPQUFPLENBQUMsV0FBUixDQUFBO01BRWYsSUFBeUIsTUFBQSxHQUFTLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBbEM7UUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBQTs7TUFDQSxJQUFtQixHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUF6QjtlQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsR0FBWCxFQUFBOztJQU5ROzs7O0tBekpjO0FBVjFCIiwic291cmNlc0NvbnRlbnQiOlsie0Rpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCAkJCQsIFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuR2l0U2hvdyA9IHJlcXVpcmUgJy4uL21vZGVscy9naXQtc2hvdydcblxubnVtYmVyT2ZDb21taXRzVG9TaG93ID0gLT4gYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy5sb2dzLm51bWJlck9mQ29tbWl0c1RvU2hvdycpXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIExvZ0xpc3RWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnZ2l0LXBsdXMtbG9nJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgQHRhYmxlIGlkOiAnZ2l0LXBsdXMtY29tbWl0cycsIG91dGxldDogJ2NvbW1pdHNMaXN0VmlldydcbiAgICAgIEBkaXYgY2xhc3M6ICdzaG93LW1vcmUnLCA9PlxuICAgICAgICBAYSBpZDogJ3Nob3ctbW9yZScsICdTaG93IE1vcmUnXG5cbiAgZ2V0VVJJOiAtPiAnYXRvbTovL2dpdC1wbHVzOmxvZydcblxuICBnZXRUaXRsZTogLT4gJ2dpdC1wbHVzOiBMb2cnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAc2tpcENvbW1pdHMgPSAwXG4gICAgQGZpbmlzaGVkID0gZmFsc2VcbiAgICBsb2FkTW9yZSA9IF8uZGVib3VuY2UoID0+XG4gICAgICBAZ2V0TG9nKCkgaWYgQHByb3AoJ3Njcm9sbEhlaWdodCcpIC0gQHNjcm9sbFRvcCgpIC0gQGhlaWdodCgpIDwgMjBcbiAgICAsIDUwKVxuICAgIEBvbiAnY2xpY2snLCAnLmNvbW1pdC1yb3cnLCAoe2N1cnJlbnRUYXJnZXR9KSA9PlxuICAgICAgQHNob3dDb21taXRMb2cgY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hhc2gnKVxuICAgIEBvbiAnY2xpY2snLCAnI3Nob3ctbW9yZScsIGxvYWRNb3JlXG4gICAgQHNjcm9sbChsb2FkTW9yZSlcblxuICBhdHRhY2hlZDogLT5cbiAgICBAY29tbWFuZFN1YnNjcmlwdGlvbiA9IGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ2NvcmU6bW92ZS1kb3duJzogPT4gQHNlbGVjdE5leHRSZXN1bHQoKVxuICAgICAgJ2NvcmU6bW92ZS11cCc6ID0+IEBzZWxlY3RQcmV2aW91c1Jlc3VsdCgpXG4gICAgICAnY29yZTpwYWdlLXVwJzogPT4gQHNlbGVjdFByZXZpb3VzUmVzdWx0KDEwKVxuICAgICAgJ2NvcmU6cGFnZS1kb3duJzogPT4gQHNlbGVjdE5leHRSZXN1bHQoMTApXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6ID0+XG4gICAgICAgIEBzZWxlY3RGaXJzdFJlc3VsdCgpXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6ID0+XG4gICAgICAgIEBzZWxlY3RMYXN0UmVzdWx0KClcbiAgICAgICdjb3JlOmNvbmZpcm0nOiA9PlxuICAgICAgICBoYXNoID0gQGZpbmQoJy5zZWxlY3RlZCcpLmF0dHIoJ2hhc2gnKVxuICAgICAgICBAc2hvd0NvbW1pdExvZyBoYXNoIGlmIGhhc2hcbiAgICAgICAgZmFsc2VcblxuICBkZXRhY2hlZDogLT5cbiAgICBAY29tbWFuZFN1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAY29tbWFuZFN1YnNjcmlwdGlvbiA9IG51bGxcblxuICBwYXJzZURhdGE6IChkYXRhKSAtPlxuICAgIGlmIGRhdGEubGVuZ3RoIDwgMVxuICAgICAgQGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgcmV0dXJuXG5cbiAgICBzZXBhcmF0b3IgPSAnO3wnXG4gICAgbmV3bGluZSA9ICdfLjsuXydcbiAgICBkYXRhID0gZGF0YS5zdWJzdHJpbmcoMCwgZGF0YS5sZW5ndGggLSBuZXdsaW5lLmxlbmd0aCAtIDEpXG5cbiAgICBjb21taXRzID0gZGF0YS5zcGxpdChuZXdsaW5lKS5tYXAgKGxpbmUpIC0+XG4gICAgICBpZiBsaW5lLnRyaW0oKSBpc250ICcnXG4gICAgICAgIHRtcERhdGEgPSBsaW5lLnRyaW0oKS5zcGxpdChzZXBhcmF0b3IpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaGFzaFNob3J0OiB0bXBEYXRhWzBdXG4gICAgICAgICAgaGFzaDogdG1wRGF0YVsxXVxuICAgICAgICAgIGF1dGhvcjogdG1wRGF0YVsyXVxuICAgICAgICAgIGVtYWlsOiB0bXBEYXRhWzNdXG4gICAgICAgICAgbWVzc2FnZTogdG1wRGF0YVs0XVxuICAgICAgICAgIGRhdGU6IHRtcERhdGFbNV1cbiAgICAgICAgfVxuXG4gICAgQHJlbmRlckxvZyBjb21taXRzXG5cbiAgcmVuZGVySGVhZGVyOiAtPlxuICAgIGhlYWRlclJvdyA9ICQkJCAtPlxuICAgICAgQHRyIGNsYXNzOiAnY29tbWl0LWhlYWRlcicsID0+XG4gICAgICAgIEB0ZCAnRGF0ZSdcbiAgICAgICAgQHRkICdNZXNzYWdlJ1xuICAgICAgICBAdGQgY2xhc3M6ICdoYXNoU2hvcnQnLCAnU2hvcnQgSGFzaCdcblxuICAgIEBjb21taXRzTGlzdFZpZXcuYXBwZW5kKGhlYWRlclJvdylcblxuICByZW5kZXJMb2c6IChjb21taXRzKSAtPlxuICAgIGNvbW1pdHMuZm9yRWFjaCAoY29tbWl0KSA9PiBAcmVuZGVyQ29tbWl0IGNvbW1pdFxuICAgIEBza2lwQ29tbWl0cyArPSBudW1iZXJPZkNvbW1pdHNUb1Nob3coKVxuXG4gIHJlbmRlckNvbW1pdDogKGNvbW1pdCkgLT5cbiAgICBjb21taXRSb3cgPSAkJCQgLT5cbiAgICAgIEB0ciBjbGFzczogJ2NvbW1pdC1yb3cnLCBoYXNoOiBcIiN7Y29tbWl0Lmhhc2h9XCIsID0+XG4gICAgICAgIEB0ZCBjbGFzczogJ2RhdGUnLCBcIiN7Y29tbWl0LmRhdGV9IGJ5ICN7Y29tbWl0LmF1dGhvcn1cIlxuICAgICAgICBAdGQgY2xhc3M6ICdtZXNzYWdlJywgXCIje2NvbW1pdC5tZXNzYWdlfVwiXG4gICAgICAgIEB0ZCBjbGFzczogJ2hhc2hTaG9ydCcsIFwiI3tjb21taXQuaGFzaFNob3J0fVwiXG5cbiAgICBAY29tbWl0c0xpc3RWaWV3LmFwcGVuZChjb21taXRSb3cpXG5cbiAgc2hvd0NvbW1pdExvZzogKGhhc2gpIC0+XG4gICAgR2l0U2hvdyhAcmVwbywgaGFzaCwgQGN1cnJlbnRGaWxlIGlmIEBvbmx5Q3VycmVudEZpbGUpXG5cbiAgYnJhbmNoTG9nOiAoQHJlcG8pIC0+XG4gICAgQHNraXBDb21taXRzID0gMFxuICAgIEBjb21taXRzTGlzdFZpZXcuZW1wdHkoKVxuICAgIEBvbmx5Q3VycmVudEZpbGUgPSBmYWxzZVxuICAgIEBjdXJyZW50RmlsZSA9IG51bGxcbiAgICBAcmVuZGVySGVhZGVyKClcbiAgICBAZ2V0TG9nKClcblxuICBjdXJyZW50RmlsZUxvZzogKEByZXBvLCBAY3VycmVudEZpbGUpIC0+XG4gICAgQG9ubHlDdXJyZW50RmlsZSA9IHRydWVcbiAgICBAc2tpcENvbW1pdHMgPSAwXG4gICAgQGNvbW1pdHNMaXN0Vmlldy5lbXB0eSgpXG4gICAgQHJlbmRlckhlYWRlcigpXG4gICAgQGdldExvZygpXG5cbiAgZ2V0TG9nOiAtPlxuICAgIHJldHVybiBpZiBAZmluaXNoZWRcblxuICAgIGFyZ3MgPSBbJ2xvZycsIFwiLS1wcmV0dHk9JWg7fCVIO3wlYU47fCVhRTt8JXM7fCVhaV8uOy5fXCIsIFwiLSN7bnVtYmVyT2ZDb21taXRzVG9TaG93KCl9XCIsICctLXNraXA9JyArIEBza2lwQ29tbWl0c11cbiAgICBhcmdzLnB1c2ggQGN1cnJlbnRGaWxlIGlmIEBvbmx5Q3VycmVudEZpbGUgYW5kIEBjdXJyZW50RmlsZT9cbiAgICBnaXQuY21kKGFyZ3MsIGN3ZDogQHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpKVxuICAgIC50aGVuIChkYXRhKSA9PiBAcGFyc2VEYXRhIGRhdGFcblxuICBzZWxlY3RGaXJzdFJlc3VsdDogLT5cbiAgICBAc2VsZWN0UmVzdWx0KEBmaW5kKCcuY29tbWl0LXJvdzpmaXJzdCcpKVxuICAgIEBzY3JvbGxUb1RvcCgpXG5cbiAgc2VsZWN0TGFzdFJlc3VsdDogLT5cbiAgICBAc2VsZWN0UmVzdWx0KEBmaW5kKCcuY29tbWl0LXJvdzpsYXN0JykpXG4gICAgQHNjcm9sbFRvQm90dG9tKClcblxuICBzZWxlY3ROZXh0UmVzdWx0OiAoc2tpcCA9IDEpIC0+XG4gICAgc2VsZWN0ZWRWaWV3ID0gQGZpbmQoJy5zZWxlY3RlZCcpXG4gICAgcmV0dXJuIEBzZWxlY3RGaXJzdFJlc3VsdCgpIGlmIHNlbGVjdGVkVmlldy5sZW5ndGggPCAxXG4gICAgbmV4dFZpZXcgPSBAZ2V0TmV4dFJlc3VsdChzZWxlY3RlZFZpZXcsIHNraXApXG5cbiAgICBAc2VsZWN0UmVzdWx0KG5leHRWaWV3KVxuICAgIEBzY3JvbGxUbyhuZXh0VmlldylcblxuICBzZWxlY3RQcmV2aW91c1Jlc3VsdDogKHNraXAgPSAxKSAtPlxuICAgIHNlbGVjdGVkVmlldyA9IEBmaW5kKCcuc2VsZWN0ZWQnKVxuICAgIHJldHVybiBAc2VsZWN0Rmlyc3RSZXN1bHQoKSBpZiBzZWxlY3RlZFZpZXcubGVuZ3RoIDwgMVxuICAgIHByZXZWaWV3ID0gQGdldFByZXZpb3VzUmVzdWx0KHNlbGVjdGVkVmlldywgc2tpcClcblxuICAgIEBzZWxlY3RSZXN1bHQocHJldlZpZXcpXG4gICAgQHNjcm9sbFRvKHByZXZWaWV3KVxuXG4gIGdldE5leHRSZXN1bHQ6IChlbGVtZW50LCBza2lwKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWxlbWVudD8ubGVuZ3RoXG4gICAgaXRlbXMgPSBAZmluZCgnLmNvbW1pdC1yb3cnKVxuICAgIGl0ZW1JbmRleCA9IGl0ZW1zLmluZGV4KGVsZW1lbnQpXG4gICAgJChpdGVtc1tNYXRoLm1pbihpdGVtSW5kZXggKyBza2lwLCBpdGVtcy5sZW5ndGggLSAxKV0pXG5cbiAgZ2V0UHJldmlvdXNSZXN1bHQ6IChlbGVtZW50LCBza2lwKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWxlbWVudD8ubGVuZ3RoXG4gICAgaXRlbXMgPSBAZmluZCgnLmNvbW1pdC1yb3cnKVxuICAgIGl0ZW1JbmRleCA9IGl0ZW1zLmluZGV4KGVsZW1lbnQpXG4gICAgJChpdGVtc1tNYXRoLm1heChpdGVtSW5kZXggLSBza2lwLCAwKV0pXG5cbiAgc2VsZWN0UmVzdWx0OiAocmVzdWx0VmlldykgLT5cbiAgICByZXR1cm4gdW5sZXNzIHJlc3VsdFZpZXc/Lmxlbmd0aFxuICAgIEBmaW5kKCcuc2VsZWN0ZWQnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgIHJlc3VsdFZpZXcuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcblxuICBzY3JvbGxUbzogKGVsZW1lbnQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlbGVtZW50Py5sZW5ndGhcbiAgICB0b3AgPSBAc2Nyb2xsVG9wKCkgKyBlbGVtZW50Lm9mZnNldCgpLnRvcCAtIEBvZmZzZXQoKS50b3BcbiAgICBib3R0b20gPSB0b3AgKyBlbGVtZW50Lm91dGVySGVpZ2h0KClcblxuICAgIEBzY3JvbGxCb3R0b20oYm90dG9tKSBpZiBib3R0b20gPiBAc2Nyb2xsQm90dG9tKClcbiAgICBAc2Nyb2xsVG9wKHRvcCkgaWYgdG9wIDwgQHNjcm9sbFRvcCgpXG4iXX0=
