(function() {
  var $, $$, EditorView, SelectListMultipleView, SelectStageFilesView, git, notifier, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, EditorView = ref.EditorView;

  git = require('../git');

  notifier = require('../notifier');

  SelectListMultipleView = require('./select-list-multiple-view');

  module.exports = SelectStageFilesView = (function(superClass) {
    var prettify;

    extend(SelectStageFilesView, superClass);

    function SelectStageFilesView() {
      return SelectStageFilesView.__super__.constructor.apply(this, arguments);
    }

    SelectStageFilesView.prototype.initialize = function(repo, items) {
      this.repo = repo;
      SelectStageFilesView.__super__.initialize.apply(this, arguments);
      this.show();
      this.setItems(items);
      return this.focusFilterEditor();
    };

    SelectStageFilesView.prototype.addButtons = function() {
      var viewButton;
      viewButton = $$(function() {
        return this.div({
          "class": 'buttons'
        }, (function(_this) {
          return function() {
            _this.span({
              "class": 'pull-left'
            }, function() {
              return _this.button({
                "class": 'btn btn-error inline-block-tight btn-cancel-button'
              }, 'Cancel');
            });
            return _this.span({
              "class": 'pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-success inline-block-tight btn-remove-button'
              }, 'Remove');
            });
          };
        })(this));
      });
      viewButton.appendTo(this);
      return this.on('click', 'button', (function(_this) {
        return function(arg) {
          var target;
          target = arg.target;
          if ($(target).hasClass('btn-remove-button')) {
            if (window.confirm('Are you sure?')) {
              _this.complete();
            }
          }
          if ($(target).hasClass('btn-cancel-button')) {
            return _this.cancel();
          }
        };
      })(this));
    };

    SelectStageFilesView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    SelectStageFilesView.prototype.cancelled = function() {
      return this.hide();
    };

    SelectStageFilesView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    SelectStageFilesView.prototype.viewForItem = function(item, matchedStr) {
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            if (matchedStr != null) {
              return _this.raw(matchedStr);
            } else {
              return _this.span(item);
            }
          };
        })(this));
      });
    };

    SelectStageFilesView.prototype.completed = function(items) {
      var currentFile, editor, files, item, ref1;
      files = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = items.length; j < len; j++) {
          item = items[j];
          if (item !== '') {
            results.push(item);
          }
        }
        return results;
      })();
      this.cancel();
      currentFile = this.repo.relativize((ref1 = atom.workspace.getActiveTextEditor()) != null ? ref1.getPath() : void 0);
      editor = atom.workspace.getActiveTextEditor();
      if (indexOf.call(files, currentFile) >= 0) {
        atom.views.getView(editor).remove();
      }
      return git.cmd(['rm', '-f'].concat(files), {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(data) {
        return notifier.addSuccess("Removed " + (prettify(data)));
      });
    };

    prettify = function(data) {
      var file, i, j, len, results;
      data = data.match(/rm ('.*')/g);
      if ((data != null ? data.length : void 0) >= 1) {
        results = [];
        for (i = j = 0, len = data.length; j < len; i = ++j) {
          file = data[i];
          results.push(data[i] = ' ' + file.match(/rm '(.*)'/)[1]);
        }
        return results;
      }
    };

    return SelectStageFilesView;

  })(SelectListMultipleView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3JlbW92ZS1saXN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtRkFBQTtJQUFBOzs7O0VBQUEsTUFBc0IsT0FBQSxDQUFRLHNCQUFSLENBQXRCLEVBQUMsU0FBRCxFQUFJLFdBQUosRUFBUTs7RUFFUixHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw2QkFBUjs7RUFFekIsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLFFBQUE7Ozs7Ozs7O21DQUFBLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxLQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFDWCxzREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBSlU7O21DQU1aLFVBQUEsR0FBWSxTQUFBO0FBQ1YsVUFBQTtNQUFBLFVBQUEsR0FBYSxFQUFBLENBQUcsU0FBQTtlQUNkLElBQUMsQ0FBQSxHQUFELENBQUs7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7U0FBTCxFQUF1QixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQ3JCLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7YUFBTixFQUEwQixTQUFBO3FCQUN4QixLQUFDLENBQUEsTUFBRCxDQUFRO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0RBQVA7ZUFBUixFQUFxRSxRQUFyRTtZQUR3QixDQUExQjttQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQ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RTthQUFBLDhDQUFBOzt1QkFDRSxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUFMLENBQVcsV0FBWCxDQUF3QixDQUFBLENBQUE7QUFEMUM7dUJBREY7O0lBRlM7Ozs7S0FoRHNCO0FBUG5DIiwic291cmNlc0NvbnRlbnQiOlsieyQsICQkLCBFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5ub3RpZmllciA9IHJlcXVpcmUgJy4uL25vdGlmaWVyJ1xuU2VsZWN0TGlzdE11bHRpcGxlVmlldyA9IHJlcXVpcmUgJy4vc2VsZWN0LWxpc3QtbXVsdGlwbGUtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VsZWN0U3RhZ2VGaWxlc1ZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0TXVsdGlwbGVWaWV3XG5cbiAgaW5pdGlhbGl6ZTogKEByZXBvLCBpdGVtcykgLT5cbiAgICBzdXBlclxuICAgIEBzaG93KClcbiAgICBAc2V0SXRlbXMgaXRlbXNcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuXG4gIGFkZEJ1dHRvbnM6IC0+XG4gICAgdmlld0J1dHRvbiA9ICQkIC0+XG4gICAgICBAZGl2IGNsYXNzOiAnYnV0dG9ucycsID0+XG4gICAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1sZWZ0JywgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1lcnJvciBpbmxpbmUtYmxvY2stdGlnaHQgYnRuLWNhbmNlbC1idXR0b24nLCAnQ2FuY2VsJ1xuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXN1Y2Nlc3MgaW5saW5lLWJsb2NrLXRpZ2h0IGJ0bi1yZW1vdmUtYnV0dG9uJywgJ1JlbW92ZSdcbiAgICB2aWV3QnV0dG9uLmFwcGVuZFRvKHRoaXMpXG5cbiAgICBAb24gJ2NsaWNrJywgJ2J1dHRvbicsICh7dGFyZ2V0fSkgPT5cbiAgICAgIGlmICQodGFyZ2V0KS5oYXNDbGFzcygnYnRuLXJlbW92ZS1idXR0b24nKVxuICAgICAgICBAY29tcGxldGUoKSBpZiB3aW5kb3cuY29uZmlybSAnQXJlIHlvdSBzdXJlPydcbiAgICAgIEBjYW5jZWwoKSBpZiAkKHRhcmdldCkuaGFzQ2xhc3MoJ2J0bi1jYW5jZWwtYnV0dG9uJylcblxuICBzaG93OiAtPlxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzdG9yZUZvY3VzZWRFbGVtZW50KClcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQGhpZGUoKVxuXG4gIGhpZGU6IC0+XG4gICAgQHBhbmVsPy5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKGl0ZW0sIG1hdGNoZWRTdHIpIC0+XG4gICAgJCQgLT5cbiAgICAgIEBsaSA9PlxuICAgICAgICBpZiBtYXRjaGVkU3RyPyB0aGVuIEByYXcobWF0Y2hlZFN0cikgZWxzZSBAc3BhbiBpdGVtXG5cbiAgY29tcGxldGVkOiAoaXRlbXMpIC0+XG4gICAgZmlsZXMgPSAoaXRlbSBmb3IgaXRlbSBpbiBpdGVtcyB3aGVuIGl0ZW0gaXNudCAnJylcbiAgICBAY2FuY2VsKClcbiAgICBjdXJyZW50RmlsZSA9IEByZXBvLnJlbGF0aXZpemUgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpPy5nZXRQYXRoKClcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLnJlbW92ZSgpIGlmIGN1cnJlbnRGaWxlIGluIGZpbGVzXG4gICAgZ2l0LmNtZChbJ3JtJywgJy1mJ10uY29uY2F0KGZpbGVzKSwgY3dkOiBAcmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCkpXG4gICAgLnRoZW4gKGRhdGEpIC0+IG5vdGlmaWVyLmFkZFN1Y2Nlc3MgXCJSZW1vdmVkICN7cHJldHRpZnkgZGF0YX1cIlxuXG4gIHByZXR0aWZ5ID0gKGRhdGEpIC0+XG4gICAgZGF0YSA9IGRhdGEubWF0Y2goL3JtICgnLionKS9nKVxuICAgIGlmIGRhdGE/Lmxlbmd0aCA+PSAxXG4gICAgICBmb3IgZmlsZSwgaSBpbiBkYXRhXG4gICAgICAgIGRhdGFbaV0gPSAnICcgKyBmaWxlLm1hdGNoKC9ybSAnKC4qKScvKVsxXVxuIl19
