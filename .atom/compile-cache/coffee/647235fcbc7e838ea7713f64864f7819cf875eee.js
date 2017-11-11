(function() {
  var $, CompositeDisposable, NewFileView, TextEditorView, View, config, fs, path, ref, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  module.exports = NewFileView = (function(superClass) {
    extend(NewFileView, superClass);

    function NewFileView() {
      return NewFileView.__super__.constructor.apply(this, arguments);
    }

    NewFileView.fileType = "File";

    NewFileView.pathConfig = "siteFilesDir";

    NewFileView.fileNameConfig = "newFileFileName";

    NewFileView.content = function() {
      return this.div({
        "class": "markdown-writer"
      }, (function(_this) {
        return function() {
          _this.label("Add New " + _this.fileType, {
            "class": "icon icon-file-add"
          });
          _this.div(function() {
            _this.label("Directory", {
              "class": "message"
            });
            _this.subview("pathEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Date", {
              "class": "message"
            });
            _this.subview("dateEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Title", {
              "class": "message"
            });
            return _this.subview("titleEditor", new TextEditorView({
              mini: true
            }));
          });
          _this.p({
            "class": "message",
            outlet: "message"
          });
          return _this.p({
            "class": "error",
            outlet: "error"
          });
        };
      })(this));
    };

    NewFileView.prototype.initialize = function() {
      utils.setTabIndex([this.titleEditor, this.pathEditor, this.dateEditor]);
      this.dateTime = templateHelper.getDateTime();
      this.titleEditor.getModel().onDidChange((function(_this) {
        return function() {
          return _this.updatePath();
        };
      })(this));
      this.pathEditor.getModel().onDidChange((function(_this) {
        return function() {
          return _this.updatePath();
        };
      })(this));
      this.dateEditor.getModel().onDidChange((function(_this) {
        return function() {
          return _this.pathEditor.setText(templateHelper.create(_this.constructor.pathConfig, _this.getDateTime()));
        };
      })(this));
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.createFile();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      }));
    };

    NewFileView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.dateEditor.setText(templateHelper.getFrontMatterDate(this.dateTime));
      this.pathEditor.setText(templateHelper.create(this.constructor.pathConfig, this.dateTime));
      this.panel.show();
      return this.titleEditor.focus();
    };

    NewFileView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return NewFileView.__super__.detach.apply(this, arguments);
    };

    NewFileView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    NewFileView.prototype.createFile = function() {
      var error, filePath, frontMatterText;
      try {
        filePath = path.join(this.getFileDir(), this.getFilePath());
        if (fs.existsSync(filePath)) {
          return this.error.text("File " + filePath + " already exists!");
        } else {
          frontMatterText = templateHelper.create("frontMatter", this.getFrontMatter(), this.getDateTime());
          fs.writeFileSync(filePath, frontMatterText);
          atom.workspace.open(filePath);
          return this.detach();
        }
      } catch (error1) {
        error = error1;
        return this.error.text("" + error.message);
      }
    };

    NewFileView.prototype.updatePath = function() {
      return this.message.html("<b>Site Directory:</b> " + (this.getFileDir()) + "<br/>\n<b>Create " + this.constructor.fileType + " At:</b> " + (this.getFilePath()));
    };

    NewFileView.prototype.getLayout = function() {
      return "post";
    };

    NewFileView.prototype.getPublished = function() {
      return this.constructor.fileType === "Post";
    };

    NewFileView.prototype.getTitle = function() {
      return this.titleEditor.getText() || ("New " + this.constructor.fileType);
    };

    NewFileView.prototype.getSlug = function() {
      return utils.slugize(this.getTitle(), config.get('slugSeparator'));
    };

    NewFileView.prototype.getDate = function() {
      return templateHelper.getFrontMatterDate(this.getDateTime());
    };

    NewFileView.prototype.getExtension = function() {
      return config.get("fileExtension");
    };

    NewFileView.prototype.getFileDir = function() {
      return utils.getSitePath(config.get("siteLocalDir"));
    };

    NewFileView.prototype.getFilePath = function() {
      return path.join(this.pathEditor.getText(), this.getFileName());
    };

    NewFileView.prototype.getFileName = function() {
      return templateHelper.create(this.constructor.fileNameConfig, this.getFrontMatter(), this.getDateTime());
    };

    NewFileView.prototype.getDateTime = function() {
      return templateHelper.parseFrontMatterDate(this.dateEditor.getText()) || this.dateTime;
    };

    NewFileView.prototype.getFrontMatter = function() {
      return templateHelper.getFrontMatter(this);
    };

    return NewFileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi92aWV3cy9uZXctZmlsZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUdBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFELEVBQUksZUFBSixFQUFVOztFQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBRUwsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFDUixjQUFBLEdBQWlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUNKLFdBQUMsQ0FBQSxRQUFELEdBQVk7O0lBQ1osV0FBQyxDQUFBLFVBQUQsR0FBYzs7SUFDZCxXQUFDLENBQUEsY0FBRCxHQUFrQjs7SUFFbEIsV0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7T0FBTCxFQUErQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDN0IsS0FBQyxDQUFBLEtBQUQsQ0FBTyxVQUFBLEdBQVcsS0FBQyxDQUFBLFFBQW5CLEVBQStCO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxvQkFBUDtXQUEvQjtVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtZQUNILEtBQUMsQ0FBQSxLQUFELENBQU8sV0FBUCxFQUFvQjtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sU0FBUDthQUFwQjtZQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUEyQixJQUFBLGNBQUEs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QWxCO0lBQUg7OzBCQUNaLFdBQUEsR0FBYSxTQUFBO2FBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFWLEVBQWlDLElBQUMsQ0FBQSxXQUFELENBQUEsQ0FBakM7SUFBSDs7MEJBRWIsV0FBQSxHQUFhLFNBQUE7YUFBRyxjQUFjLENBQUMsTUFBZixDQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLGNBQW5DLEVBQW1ELElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBbkQsRUFBc0UsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUF0RTtJQUFIOzswQkFDYixXQUFBLEdBQWEsU0FBQTthQUFHLGNBQWMsQ0FBQyxvQkFBZixDQUFvQyxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFwQyxDQUFBLElBQThELElBQUMsQ0FBQTtJQUFsRTs7MEJBQ2IsY0FBQSxHQUFnQixTQUFBO2FBQUcsY0FBYyxDQUFDLGNBQWYsQ0FBOEIsSUFBOUI7SUFBSDs7OztLQXpGUTtBQVYxQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlldywgVGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcbnBhdGggPSByZXF1aXJlIFwicGF0aFwiXG5mcyA9IHJlcXVpcmUgXCJmcy1wbHVzXCJcblxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG50ZW1wbGF0ZUhlbHBlciA9IHJlcXVpcmUgXCIuLi9oZWxwZXJzL3RlbXBsYXRlLWhlbHBlclwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE5ld0ZpbGVWaWV3IGV4dGVuZHMgVmlld1xuICBAZmlsZVR5cGUgPSBcIkZpbGVcIiAjIG92ZXJyaWRlXG4gIEBwYXRoQ29uZmlnID0gXCJzaXRlRmlsZXNEaXJcIiAjIG92ZXJyaWRlXG4gIEBmaWxlTmFtZUNvbmZpZyA9IFwibmV3RmlsZUZpbGVOYW1lXCIgIyBvdmVycmlkZVxuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgY2xhc3M6IFwibWFya2Rvd24td3JpdGVyXCIsID0+XG4gICAgICBAbGFiZWwgXCJBZGQgTmV3ICN7QGZpbGVUeXBlfVwiLCBjbGFzczogXCJpY29uIGljb24tZmlsZS1hZGRcIlxuICAgICAgQGRpdiA9PlxuICAgICAgICBAbGFiZWwgXCJEaXJlY3RvcnlcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgIEBzdWJ2aWV3IFwicGF0aEVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgICAgQGxhYmVsIFwiRGF0ZVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJkYXRlRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAbGFiZWwgXCJUaXRsZVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJ0aXRsZUVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBwIGNsYXNzOiBcIm1lc3NhZ2VcIiwgb3V0bGV0OiBcIm1lc3NhZ2VcIlxuICAgICAgQHAgY2xhc3M6IFwiZXJyb3JcIiwgb3V0bGV0OiBcImVycm9yXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIHV0aWxzLnNldFRhYkluZGV4KFtAdGl0bGVFZGl0b3IsIEBwYXRoRWRpdG9yLCBAZGF0ZUVkaXRvcl0pXG5cbiAgICAjIHNhdmUgY3VycmVudCBkYXRlIHRpbWUgYXMgYmFzZVxuICAgIEBkYXRlVGltZSA9IHRlbXBsYXRlSGVscGVyLmdldERhdGVUaW1lKClcblxuICAgIEB0aXRsZUVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlID0+IEB1cGRhdGVQYXRoKClcbiAgICBAcGF0aEVkaXRvci5nZXRNb2RlbCgpLm9uRGlkQ2hhbmdlID0+IEB1cGRhdGVQYXRoKClcbiAgICAjIHVwZGF0ZSBwYXRoRWRpdG9yIHRvIHJlZmxlY3QgZGF0ZSBjaGFuZ2VzLCBob3dldmVyIHRoaXMgd2lsbCBvdmVyd3JpdGUgdXNlciBjaGFuZ2VzXG4gICAgQGRhdGVFZGl0b3IuZ2V0TW9kZWwoKS5vbkRpZENoYW5nZSA9PlxuICAgICAgQHBhdGhFZGl0b3Iuc2V0VGV4dCh0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoQGNvbnN0cnVjdG9yLnBhdGhDb25maWcsIEBnZXREYXRlVGltZSgpKSlcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgQGVsZW1lbnQsIHtcbiAgICAgICAgXCJjb3JlOmNvbmZpcm1cIjogPT4gQGNyZWF0ZUZpbGUoKVxuICAgICAgICBcImNvcmU6Y2FuY2VsXCI6ID0+IEBkZXRhY2goKVxuICAgICAgfSkpXG5cbiAgZGlzcGxheTogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIEBkYXRlRWRpdG9yLnNldFRleHQodGVtcGxhdGVIZWxwZXIuZ2V0RnJvbnRNYXR0ZXJEYXRlKEBkYXRlVGltZSkpXG4gICAgQHBhdGhFZGl0b3Iuc2V0VGV4dCh0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoQGNvbnN0cnVjdG9yLnBhdGhDb25maWcsIEBkYXRlVGltZSkpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEB0aXRsZUVkaXRvci5mb2N1cygpXG5cbiAgZGV0YWNoOiAtPlxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQHBhbmVsLmhpZGUoKVxuICAgICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudD8uZm9jdXMoKVxuICAgIHN1cGVyXG5cbiAgZGV0YWNoZWQ6IC0+XG4gICAgQGRpc3Bvc2FibGVzPy5kaXNwb3NlKClcbiAgICBAZGlzcG9zYWJsZXMgPSBudWxsXG5cbiAgY3JlYXRlRmlsZTogLT5cbiAgICB0cnlcbiAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKEBnZXRGaWxlRGlyKCksIEBnZXRGaWxlUGF0aCgpKVxuXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGZpbGVQYXRoKVxuICAgICAgICBAZXJyb3IudGV4dChcIkZpbGUgI3tmaWxlUGF0aH0gYWxyZWFkeSBleGlzdHMhXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGZyb250TWF0dGVyVGV4dCA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcImZyb250TWF0dGVyXCIsIEBnZXRGcm9udE1hdHRlcigpLCBAZ2V0RGF0ZVRpbWUoKSlcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhmaWxlUGF0aCwgZnJvbnRNYXR0ZXJUZXh0KVxuICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKVxuICAgICAgICBAZGV0YWNoKClcbiAgICBjYXRjaCBlcnJvclxuICAgICAgQGVycm9yLnRleHQoXCIje2Vycm9yLm1lc3NhZ2V9XCIpXG5cbiAgdXBkYXRlUGF0aDogLT5cbiAgICBAbWVzc2FnZS5odG1sIFwiXCJcIlxuICAgIDxiPlNpdGUgRGlyZWN0b3J5OjwvYj4gI3tAZ2V0RmlsZURpcigpfTxici8+XG4gICAgPGI+Q3JlYXRlICN7QGNvbnN0cnVjdG9yLmZpbGVUeXBlfSBBdDo8L2I+ICN7QGdldEZpbGVQYXRoKCl9XG4gICAgXCJcIlwiXG5cbiAgIyBjb21tb24gaW50ZXJmYWNlIGZvciBGcm9udE1hdHRlclxuICBnZXRMYXlvdXQ6IC0+IFwicG9zdFwiXG4gIGdldFB1Ymxpc2hlZDogLT4gQGNvbnN0cnVjdG9yLmZpbGVUeXBlID09IFwiUG9zdFwiXG4gIGdldFRpdGxlOiAtPiBAdGl0bGVFZGl0b3IuZ2V0VGV4dCgpIHx8IFwiTmV3ICN7QGNvbnN0cnVjdG9yLmZpbGVUeXBlfVwiXG4gIGdldFNsdWc6IC0+IHV0aWxzLnNsdWdpemUoQGdldFRpdGxlKCksIGNvbmZpZy5nZXQoJ3NsdWdTZXBhcmF0b3InKSlcbiAgZ2V0RGF0ZTogLT4gdGVtcGxhdGVIZWxwZXIuZ2V0RnJvbnRNYXR0ZXJEYXRlKEBnZXREYXRlVGltZSgpKVxuICBnZXRFeHRlbnNpb246IC0+IGNvbmZpZy5nZXQoXCJmaWxlRXh0ZW5zaW9uXCIpXG5cbiAgIyBuZXcgZmlsZSBhbmQgZnJvbnQgbWF0dGVyc1xuICBnZXRGaWxlRGlyOiAtPiB1dGlscy5nZXRTaXRlUGF0aChjb25maWcuZ2V0KFwic2l0ZUxvY2FsRGlyXCIpKVxuICBnZXRGaWxlUGF0aDogLT4gcGF0aC5qb2luKEBwYXRoRWRpdG9yLmdldFRleHQoKSwgQGdldEZpbGVOYW1lKCkpXG5cbiAgZ2V0RmlsZU5hbWU6IC0+IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShAY29uc3RydWN0b3IuZmlsZU5hbWVDb25maWcsIEBnZXRGcm9udE1hdHRlcigpLCBAZ2V0RGF0ZVRpbWUoKSlcbiAgZ2V0RGF0ZVRpbWU6IC0+IHRlbXBsYXRlSGVscGVyLnBhcnNlRnJvbnRNYXR0ZXJEYXRlKEBkYXRlRWRpdG9yLmdldFRleHQoKSkgfHwgQGRhdGVUaW1lXG4gIGdldEZyb250TWF0dGVyOiAtPiB0ZW1wbGF0ZUhlbHBlci5nZXRGcm9udE1hdHRlcih0aGlzKVxuIl19
