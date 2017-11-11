(function() {
  var $, BufferedProcess, CompositeDisposable, Os, Path, TagCreateView, TextEditorView, View, fs, git, notifier, ref, ref1,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Os = require('os');

  Path = require('path');

  fs = require('fs-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, TextEditorView = ref1.TextEditorView, View = ref1.View;

  notifier = require('../notifier');

  git = require('../git');

  module.exports = TagCreateView = (function(superClass) {
    extend(TagCreateView, superClass);

    function TagCreateView() {
      return TagCreateView.__super__.constructor.apply(this, arguments);
    }

    TagCreateView.content = function() {
      return this.div((function(_this) {
        return function() {
          _this.div({
            "class": 'block'
          }, function() {
            return _this.subview('tagName', new TextEditorView({
              mini: true,
              placeholderText: 'Tag'
            }));
          });
          _this.div({
            "class": 'block'
          }, function() {
            return _this.subview('tagMessage', new TextEditorView({
              mini: true,
              placeholderText: 'Annotation message'
            }));
          });
          return _this.div({
            "class": 'block'
          }, function() {
            _this.span({
              "class": 'pull-left'
            }, function() {
              return _this.button({
                "class": 'btn btn-success inline-block-tight gp-confirm-button',
                click: 'createTag'
              }, 'Create Tag');
            });
            return _this.span({
              "class": 'pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-error inline-block-tight gp-cancel-button',
                click: 'destroy'
              }, 'Cancel');
            });
          });
        };
      })(this));
    };

    TagCreateView.prototype.initialize = function(repo) {
      this.repo = repo;
      this.disposables = new CompositeDisposable;
      this.currentPane = atom.workspace.getActivePane();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.tagName.focus();
      this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:cancel': (function(_this) {
          return function() {
            return _this.destroy();
          };
        })(this)
      }));
      return this.disposables.add(atom.commands.add('atom-text-editor', {
        'core:confirm': (function(_this) {
          return function() {
            return _this.createTag();
          };
        })(this)
      }));
    };

    TagCreateView.prototype.createTag = function() {
      var flag, tag;
      tag = {
        name: this.tagName.getModel().getText(),
        message: this.tagMessage.getModel().getText()
      };
      flag = atom.config.get('git-plus.tags.signTags') ? '-s' : '-a';
      git.cmd(['tag', flag, tag.name, '-m', tag.message], {
        cwd: this.repo.getWorkingDirectory()
      }).then(function(success) {
        console.info("Created git tag " + tag.name + ":", success);
        return notifier.addSuccess("Tag '" + tag.name + "' has been created successfully!");
      })["catch"](notifier.addError);
      return this.destroy();
    };

    TagCreateView.prototype.destroy = function() {
      var ref2;
      if ((ref2 = this.panel) != null) {
        ref2.destroy();
      }
      this.disposables.dispose();
      return this.currentPane.activate();
    };

    return TagCreateView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL3RhZy1jcmVhdGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9IQUFBO0lBQUE7OztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSOztFQUVMLE1BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMscUNBQUQsRUFBa0I7O0VBQ2xCLE9BQTRCLE9BQUEsQ0FBUSxzQkFBUixDQUE1QixFQUFDLFVBQUQsRUFBSSxvQ0FBSixFQUFvQjs7RUFDcEIsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLEdBQUEsR0FBTSxPQUFBLENBQVEsUUFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osYUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDSCxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQTttQkFDbkIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxTQUFULEVBQXdCLElBQUEsY0FBQSxDQUFlO2NBQUEsSUFBQSxFQUFNLElBQU47Y0FBWSxlQUFBLEVBQWlCLEtBQTdCO2FBQWYsQ0FBeEI7VUFEbUIsQ0FBckI7VUFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQTttQkFDbkIsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQTJCLElBQUEsY0FBQSxDQUFlO2NBQUEsSUFBQSxFQUFNLElBQU47Y0FBWSxlQUFBLEVBQWlC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LGtDQUFyQztNQUZJLENBRE4sQ0FJQSxFQUFDLEtBQUQsRUFKQSxDQUlPLFFBQVEsQ0FBQyxRQUpoQjthQUtBLElBQUMsQ0FBQSxPQUFELENBQUE7SUFSUzs7NEJBVVgsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBOztZQUFNLENBQUUsT0FBUixDQUFBOztNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxRQUFiLENBQUE7SUFITzs7OztLQWhDaUI7QUFWNUIiLCJzb3VyY2VzQ29udGVudCI6WyJPcyA9IHJlcXVpcmUgJ29zJ1xuUGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzLXBsdXMnXG5cbntCdWZmZXJlZFByb2Nlc3MsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBUZXh0RWRpdG9yVmlldywgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbm5vdGlmaWVyID0gcmVxdWlyZSAnLi4vbm90aWZpZXInXG5naXQgPSByZXF1aXJlICcuLi9naXQnXG5cbm1vZHVsZS5leHBvcnRzPVxuY2xhc3MgVGFnQ3JlYXRlVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiA9PlxuICAgICAgQGRpdiBjbGFzczogJ2Jsb2NrJywgPT5cbiAgICAgICAgQHN1YnZpZXcgJ3RhZ05hbWUnLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSwgcGxhY2Vob2xkZXJUZXh0OiAnVGFnJylcbiAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsID0+XG4gICAgICAgIEBzdWJ2aWV3ICd0YWdNZXNzYWdlJywgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUsIHBsYWNlaG9sZGVyVGV4dDogJ0Fubm90YXRpb24gbWVzc2FnZScpXG4gICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLCA9PlxuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtbGVmdCcsID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4tc3VjY2VzcyBpbmxpbmUtYmxvY2stdGlnaHQgZ3AtY29uZmlybS1idXR0b24nLCBjbGljazogJ2NyZWF0ZVRhZycsICdDcmVhdGUgVGFnJ1xuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtcmlnaHQnLCA9PlxuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLWVycm9yIGlubGluZS1ibG9jay10aWdodCBncC1jYW5jZWwtYnV0dG9uJywgY2xpY2s6ICdkZXN0cm95JywgJ0NhbmNlbCdcblxuICBpbml0aWFsaXplOiAoQHJlcG8pIC0+XG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAY3VycmVudFBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAdGFnTmFtZS5mb2N1cygpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcicsICdjb3JlOmNhbmNlbCc6ID0+IEBkZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJywgJ2NvcmU6Y29uZmlybSc6ID0+IEBjcmVhdGVUYWcoKVxuXG4gIGNyZWF0ZVRhZzogLT5cbiAgICB0YWcgPSBuYW1lOiBAdGFnTmFtZS5nZXRNb2RlbCgpLmdldFRleHQoKSwgbWVzc2FnZTogQHRhZ01lc3NhZ2UuZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICBmbGFnID0gaWYgYXRvbS5jb25maWcuZ2V0KCdnaXQtcGx1cy50YWdzLnNpZ25UYWdzJykgdGhlbiAnLXMnIGVsc2UgJy1hJ1xuICAgIGdpdC5jbWQoWyd0YWcnLCBmbGFnLCB0YWcubmFtZSwgJy1tJywgdGFnLm1lc3NhZ2VdLCBjd2Q6IEByZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKSlcbiAgICAudGhlbiAoc3VjY2VzcykgLT5cbiAgICAgIGNvbnNvbGUuaW5mbyhcIkNyZWF0ZWQgZ2l0IHRhZyAje3RhZy5uYW1lfTpcIiwgc3VjY2VzcylcbiAgICAgIG5vdGlmaWVyLmFkZFN1Y2Nlc3MoXCJUYWcgJyN7dGFnLm5hbWV9JyBoYXMgYmVlbiBjcmVhdGVkIHN1Y2Nlc3NmdWxseSFcIilcbiAgICAuY2F0Y2ggbm90aWZpZXIuYWRkRXJyb3JcbiAgICBAZGVzdHJveSgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcGFuZWw/LmRlc3Ryb3koKVxuICAgIEBkaXNwb3NhYmxlcy5kaXNwb3NlKClcbiAgICBAY3VycmVudFBhbmUuYWN0aXZhdGUoKVxuIl19
