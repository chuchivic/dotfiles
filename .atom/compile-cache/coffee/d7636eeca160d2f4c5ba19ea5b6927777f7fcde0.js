(function() {
  var $, CompositeDisposable, InsertImageFileView, TextEditorView, View, config, dialog, fs, lastInsertImageDir, path, ref, remote, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  path = require("path");

  fs = require("fs-plus");

  remote = require("remote");

  dialog = remote.dialog || remote.require("dialog");

  config = require("../config");

  utils = require("../utils");

  templateHelper = require("../helpers/template-helper");

  lastInsertImageDir = null;

  module.exports = InsertImageFileView = (function(superClass) {
    extend(InsertImageFileView, superClass);

    function InsertImageFileView() {
      return InsertImageFileView.__super__.constructor.apply(this, arguments);
    }

    InsertImageFileView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Image", {
            "class": "icon icon-device-camera"
          });
          _this.div(function() {
            _this.label("Image Path (src)", {
              "class": "message"
            });
            _this.subview("imageEditor", new TextEditorView({
              mini: true
            }));
            _this.div({
              "class": "dialog-row"
            }, function() {
              _this.button("Choose Local Image", {
                outlet: "openImageButton",
                "class": "btn"
              });
              return _this.label({
                outlet: "message",
                "class": "side-label"
              });
            });
            _this.label("Title (alt)", {
              "class": "message"
            });
            _this.subview("titleEditor", new TextEditorView({
              mini: true
            }));
            _this.div({
              "class": "col-1"
            }, function() {
              _this.label("Width (px)", {
                "class": "message"
              });
              return _this.subview("widthEditor", new TextEditorView({
                mini: true
              }));
            });
            _this.div({
              "class": "col-1"
            }, function() {
              _this.label("Height (px)", {
                "class": "message"
              });
              return _this.subview("heightEditor", new TextEditorView({
                mini: true
              }));
            });
            return _this.div({
              "class": "col-2"
            }, function() {
              _this.label("Alignment", {
                "class": "message"
              });
              return _this.subview("alignEditor", new TextEditorView({
                mini: true
              }));
            });
          });
          _this.div({
            outlet: "copyImagePanel",
            "class": "hidden dialog-row"
          }, function() {
            return _this.label({
              "for": "markdown-writer-copy-image-checkbox"
            }, function() {
              _this.input({
                id: "markdown-writer-copy-image-checkbox"
              }, {
                type: "checkbox",
                outlet: "copyImageCheckbox"
              });
              return _this.span("Copy Image To: Missing Image Path (src) or Title (alt)", {
                "class": "side-label",
                outlet: "copyImageMessage"
              });
            });
          });
          return _this.div({
            "class": "image-container"
          }, function() {
            return _this.img({
              outlet: 'imagePreview'
            });
          });
        };
      })(this));
    };

    InsertImageFileView.prototype.initialize = function() {
      utils.setTabIndex([this.imageEditor, this.openImageButton, this.titleEditor, this.widthEditor, this.heightEditor, this.alignEditor, this.copyImageCheckbox]);
      this.imageEditor.on("blur", (function(_this) {
        return function() {
          var file;
          file = _this.imageEditor.getText().trim();
          _this.updateImageSource(file);
          return _this.updateCopyImageDest(file);
        };
      })(this));
      this.titleEditor.on("blur", (function(_this) {
        return function() {
          return _this.updateCopyImageDest(_this.imageEditor.getText().trim());
        };
      })(this));
      this.openImageButton.on("click", (function(_this) {
        return function() {
          return _this.openImageDialog();
        };
      })(this));
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add(this.element, {
        "core:confirm": (function(_this) {
          return function() {
            return _this.onConfirm();
          };
        })(this),
        "core:cancel": (function(_this) {
          return function() {
            return _this.detach();
          };
        })(this)
      }));
    };

    InsertImageFileView.prototype.onConfirm = function() {
      var callback, imgSource;
      imgSource = this.imageEditor.getText().trim();
      if (!imgSource) {
        return;
      }
      callback = (function(_this) {
        return function() {
          _this.editor.transact(function() {
            return _this.insertImageTag();
          });
          return _this.detach();
        };
      })(this);
      if (!this.copyImageCheckbox.hasClass('hidden') && this.copyImageCheckbox.prop("checked")) {
        return this.copyImage(this.resolveImagePath(imgSource), callback);
      } else {
        return callback();
      }
    };

    InsertImageFileView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.editor = atom.workspace.getActiveTextEditor();
      this.frontMatter = templateHelper.getEditor(this.editor);
      this.dateTime = templateHelper.getDateTime();
      this.setFieldsFromSelection();
      this.panel.show();
      return this.imageEditor.focus();
    };

    InsertImageFileView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertImageFileView.__super__.detach.apply(this, arguments);
    };

    InsertImageFileView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertImageFileView.prototype.setFieldsFromSelection = function() {
      var img, selection;
      this.range = utils.getTextBufferRange(this.editor, "link");
      selection = this.editor.getTextInRange(this.range);
      if (!selection) {
        return;
      }
      if (utils.isImage(selection)) {
        img = utils.parseImage(selection);
      } else if (utils.isImageTag(selection)) {
        img = utils.parseImageTag(selection);
      } else {
        img = {
          alt: selection
        };
      }
      this.titleEditor.setText(img.alt || "");
      this.widthEditor.setText(img.width || "");
      this.heightEditor.setText(img.height || "");
      this.imageEditor.setText(img.src || "");
      return this.updateImageSource(img.src);
    };

    InsertImageFileView.prototype.openImageDialog = function() {
      var files;
      files = dialog.showOpenDialog({
        properties: ['openFile'],
        defaultPath: lastInsertImageDir || this.siteLocalDir()
      });
      if (!(files && files.length > 0)) {
        return;
      }
      this.imageEditor.setText(files[0]);
      this.updateImageSource(files[0]);
      if (!utils.isUrl(files[0])) {
        lastInsertImageDir = path.dirname(files[0]);
      }
      return this.titleEditor.focus();
    };

    InsertImageFileView.prototype.updateImageSource = function(file) {
      if (!file) {
        return;
      }
      this.displayImagePreview(file);
      if (utils.isUrl(file) || this.isInSiteDir(this.resolveImagePath(file))) {
        return this.copyImagePanel.addClass("hidden");
      } else {
        return this.copyImagePanel.removeClass("hidden");
      }
    };

    InsertImageFileView.prototype.updateCopyImageDest = function(file) {
      var destFile;
      if (!file) {
        return;
      }
      destFile = this.getCopiedImageDestPath(file, this.titleEditor.getText());
      return this.copyImageMessage.text("Copy Image To: " + destFile);
    };

    InsertImageFileView.prototype.displayImagePreview = function(file) {
      if (this.imageOnPreview === file) {
        return;
      }
      if (utils.isImageFile(file)) {
        this.message.text("Opening Image Preview ...");
        this.imagePreview.attr("src", this.resolveImagePath(file));
        this.imagePreview.load((function(_this) {
          return function() {
            _this.message.text("");
            return _this.setImageContext();
          };
        })(this));
        this.imagePreview.error((function(_this) {
          return function() {
            _this.message.text("Error: Failed to Load Image.");
            return _this.imagePreview.attr("src", "");
          };
        })(this));
      } else {
        if (file) {
          this.message.text("Error: Invalid Image File.");
        }
        this.imagePreview.attr("src", "");
        this.widthEditor.setText("");
        this.heightEditor.setText("");
        this.alignEditor.setText("");
      }
      return this.imageOnPreview = file;
    };

    InsertImageFileView.prototype.setImageContext = function() {
      var naturalHeight, naturalWidth, position, ref1;
      ref1 = this.imagePreview.context, naturalWidth = ref1.naturalWidth, naturalHeight = ref1.naturalHeight;
      this.widthEditor.setText("" + naturalWidth);
      this.heightEditor.setText("" + naturalHeight);
      position = naturalWidth > 300 ? "center" : "right";
      return this.alignEditor.setText(position);
    };

    InsertImageFileView.prototype.insertImageTag = function() {
      var img, imgSource, text;
      imgSource = this.imageEditor.getText().trim();
      img = {
        rawSrc: imgSource,
        src: this.generateImageSrc(imgSource),
        relativeFileSrc: this.generateRelativeImageSrc(imgSource, this.currentFileDir()),
        relativeSiteSrc: this.generateRelativeImageSrc(imgSource, this.siteLocalDir()),
        alt: this.titleEditor.getText(),
        width: this.widthEditor.getText(),
        height: this.heightEditor.getText(),
        align: this.alignEditor.getText()
      };
      if (img.src) {
        text = templateHelper.create("imageTag", this.frontMatter, this.dateTime, img);
      } else {
        text = img.alt;
      }
      return this.editor.setTextInBufferRange(this.range, text);
    };

    InsertImageFileView.prototype.copyImage = function(file, callback) {
      var confirmation, destFile, error, performWrite;
      if (utils.isUrl(file) || !fs.existsSync(file)) {
        return callback();
      }
      try {
        destFile = this.getCopiedImageDestPath(file, this.titleEditor.getText());
        performWrite = true;
        if (fs.existsSync(destFile)) {
          confirmation = atom.confirm({
            message: "File already exists!",
            detailedMessage: "Another file already exists at:\n" + destFile + "\nDo you want to overwrite it?",
            buttons: ["No", "Yes"]
          });
          performWrite = confirmation === 1;
        }
        if (performWrite) {
          return fs.copy(file, destFile, (function(_this) {
            return function() {
              _this.imageEditor.setText(destFile);
              return callback();
            };
          })(this));
        }
      } catch (error1) {
        error = error1;
        return atom.confirm({
          message: "[Markdown Writer] Error!",
          detailedMessage: "Copying Image:\n" + error.message,
          buttons: ['OK']
        });
      }
    };

    InsertImageFileView.prototype.siteLocalDir = function() {
      return utils.getSitePath(config.get("siteLocalDir"));
    };

    InsertImageFileView.prototype.siteImagesDir = function() {
      return templateHelper.create("siteImagesDir", this.frontMatter, this.dateTime);
    };

    InsertImageFileView.prototype.currentFileDir = function() {
      return path.dirname(this.editor.getPath() || "");
    };

    InsertImageFileView.prototype.isInSiteDir = function(file) {
      return file && file.startsWith(this.siteLocalDir());
    };

    InsertImageFileView.prototype.getCopiedImageDestPath = function(file, title) {
      var extension, filename;
      filename = path.basename(file);
      if (config.get("renameImageOnCopy") && title) {
        extension = path.extname(file);
        title = utils.slugize(title, config.get('slugSeparator'));
        filename = "" + title + extension;
      }
      return path.join(this.siteLocalDir(), this.siteImagesDir(), filename);
    };

    InsertImageFileView.prototype.resolveImagePath = function(file) {
      var absolutePath, relativePath;
      if (!file) {
        return "";
      }
      if (utils.isUrl(file) || fs.existsSync(file)) {
        return file;
      }
      absolutePath = path.join(this.siteLocalDir(), file);
      if (fs.existsSync(absolutePath)) {
        return absolutePath;
      }
      relativePath = path.join(this.currentFileDir(), file);
      if (fs.existsSync(relativePath)) {
        return relativePath;
      }
      return file;
    };

    InsertImageFileView.prototype.generateImageSrc = function(file) {
      return utils.normalizeFilePath(this._generateImageSrc(file));
    };

    InsertImageFileView.prototype._generateImageSrc = function(file) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      if (config.get('relativeImagePath')) {
        return path.relative(this.currentFileDir(), file);
      }
      if (this.isInSiteDir(file)) {
        return path.relative(this.siteLocalDir(), file);
      }
      return path.join("/", this.siteImagesDir(), path.basename(file));
    };

    InsertImageFileView.prototype.generateRelativeImageSrc = function(file, basePath) {
      return utils.normalizeFilePath(this._generateRelativeImageSrc(file, basePath));
    };

    InsertImageFileView.prototype._generateRelativeImageSrc = function(file, basePath) {
      if (!file) {
        return "";
      }
      if (utils.isUrl(file)) {
        return file;
      }
      return path.relative(basePath || "~", file);
    };

    return InsertImageFileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi92aWV3cy9pbnNlcnQtaW1hZ2UtZmlsZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUpBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUE0QixPQUFBLENBQVEsc0JBQVIsQ0FBNUIsRUFBQyxTQUFELEVBQUksZUFBSixFQUFVOztFQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQUEsR0FBUyxNQUFNLENBQUMsTUFBUCxJQUFpQixNQUFNLENBQUMsT0FBUCxDQUFlLFFBQWY7O0VBRTFCLE1BQUEsR0FBUyxPQUFBLENBQVEsV0FBUjs7RUFDVCxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBQ1IsY0FBQSxHQUFpQixPQUFBLENBQVEsNEJBQVI7O0VBRWpCLGtCQUFBLEdBQXFCOztFQUVyQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdDQUFQO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BELEtBQUMsQ0FBQSxLQUFELENBQU8sY0FBUCxFQUF1QjtZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8seUJBQVA7V0FBdkI7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7WUFDSCxLQUFDLENBQUEsS0FBRCxDQUFPLGtCQUFQLEVBQTJCO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO2FBQTNCO1lBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FB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QyxRQUFMLENBQWMsUUFBQSxJQUFZLEdBQTFCLEVBQStCLElBQS9CO0lBSGtCOzs7O0tBcFBLO0FBZGxDIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBWaWV3LCBUZXh0RWRpdG9yVmlld30gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcbmZzID0gcmVxdWlyZSBcImZzLXBsdXNcIlxucmVtb3RlID0gcmVxdWlyZSBcInJlbW90ZVwiXG5kaWFsb2cgPSByZW1vdGUuZGlhbG9nIHx8IHJlbW90ZS5yZXF1aXJlIFwiZGlhbG9nXCJcblxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG50ZW1wbGF0ZUhlbHBlciA9IHJlcXVpcmUgXCIuLi9oZWxwZXJzL3RlbXBsYXRlLWhlbHBlclwiXG5cbmxhc3RJbnNlcnRJbWFnZURpciA9IG51bGwgIyByZW1lbWJlciBsYXN0IGluc2VydGVkIGltYWdlIGRpcmVjdG9yeVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBJbnNlcnRJbWFnZUZpbGVWaWV3IGV4dGVuZHMgVmlld1xuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiBcIm1hcmtkb3duLXdyaXRlciBtYXJrZG93bi13cml0ZXItZGlhbG9nXCIsID0+XG4gICAgICBAbGFiZWwgXCJJbnNlcnQgSW1hZ2VcIiwgY2xhc3M6IFwiaWNvbiBpY29uLWRldmljZS1jYW1lcmFcIlxuICAgICAgQGRpdiA9PlxuICAgICAgICBAbGFiZWwgXCJJbWFnZSBQYXRoIChzcmMpXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICBAc3VidmlldyBcImltYWdlRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImRpYWxvZy1yb3dcIiwgPT5cbiAgICAgICAgICBAYnV0dG9uIFwiQ2hvb3NlIExvY2FsIEltYWdlXCIsIG91dGxldDogXCJvcGVuSW1hZ2VCdXR0b25cIiwgY2xhc3M6IFwiYnRuXCJcbiAgICAgICAgICBAbGFiZWwgb3V0bGV0OiBcIm1lc3NhZ2VcIiwgY2xhc3M6IFwic2lkZS1sYWJlbFwiXG4gICAgICAgIEBsYWJlbCBcIlRpdGxlIChhbHQpXCIsIGNsYXNzOiBcIm1lc3NhZ2VcIlxuICAgICAgICBAc3VidmlldyBcInRpdGxlRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC0xXCIsID0+XG4gICAgICAgICAgQGxhYmVsIFwiV2lkdGggKHB4KVwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgICBAc3VidmlldyBcIndpZHRoRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuICAgICAgICBAZGl2IGNsYXNzOiBcImNvbC0xXCIsID0+XG4gICAgICAgICAgQGxhYmVsIFwiSGVpZ2h0IChweClcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgICAgQHN1YnZpZXcgXCJoZWlnaHRFZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICAgIEBkaXYgY2xhc3M6IFwiY29sLTJcIiwgPT5cbiAgICAgICAgICBAbGFiZWwgXCJBbGlnbm1lbnRcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgICAgQHN1YnZpZXcgXCJhbGlnbkVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBkaXYgb3V0bGV0OiBcImNvcHlJbWFnZVBhbmVsXCIsIGNsYXNzOiBcImhpZGRlbiBkaWFsb2ctcm93XCIsID0+XG4gICAgICAgIEBsYWJlbCBmb3I6IFwibWFya2Rvd24td3JpdGVyLWNvcHktaW1hZ2UtY2hlY2tib3hcIiwgPT5cbiAgICAgICAgICBAaW5wdXQgaWQ6IFwibWFya2Rvd24td3JpdGVyLWNvcHktaW1hZ2UtY2hlY2tib3hcIixcbiAgICAgICAgICAgIHR5cGU6XCJjaGVja2JveFwiLCBvdXRsZXQ6IFwiY29weUltYWdlQ2hlY2tib3hcIlxuICAgICAgICAgIEBzcGFuIFwiQ29weSBJbWFnZSBUbzogTWlzc2luZyBJbWFnZSBQYXRoIChzcmMpIG9yIFRpdGxlIChhbHQpXCIsIGNsYXNzOiBcInNpZGUtbGFiZWxcIiwgb3V0bGV0OiBcImNvcHlJbWFnZU1lc3NhZ2VcIlxuICAgICAgQGRpdiBjbGFzczogXCJpbWFnZS1jb250YWluZXJcIiwgPT5cbiAgICAgICAgQGltZyBvdXRsZXQ6ICdpbWFnZVByZXZpZXcnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICB1dGlscy5zZXRUYWJJbmRleChbQGltYWdlRWRpdG9yLCBAb3BlbkltYWdlQnV0dG9uLCBAdGl0bGVFZGl0b3IsXG4gICAgICBAd2lkdGhFZGl0b3IsIEBoZWlnaHRFZGl0b3IsIEBhbGlnbkVkaXRvciwgQGNvcHlJbWFnZUNoZWNrYm94XSlcblxuICAgIEBpbWFnZUVkaXRvci5vbiBcImJsdXJcIiwgPT5cbiAgICAgIGZpbGUgPSBAaW1hZ2VFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKVxuICAgICAgQHVwZGF0ZUltYWdlU291cmNlKGZpbGUpXG4gICAgICBAdXBkYXRlQ29weUltYWdlRGVzdChmaWxlKVxuICAgIEB0aXRsZUVkaXRvci5vbiBcImJsdXJcIiwgPT5cbiAgICAgIEB1cGRhdGVDb3B5SW1hZ2VEZXN0KEBpbWFnZUVkaXRvci5nZXRUZXh0KCkudHJpbSgpKVxuICAgIEBvcGVuSW1hZ2VCdXR0b24ub24gXCJjbGlja1wiLCA9PiBAb3BlbkltYWdlRGlhbG9nKClcblxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBAZGlzcG9zYWJsZXMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgQGVsZW1lbnQsIHtcbiAgICAgICAgXCJjb3JlOmNvbmZpcm1cIjogPT4gQG9uQ29uZmlybSgpLFxuICAgICAgICBcImNvcmU6Y2FuY2VsXCI6ICA9PiBAZGV0YWNoKClcbiAgICAgIH0pKVxuXG4gIG9uQ29uZmlybTogLT5cbiAgICBpbWdTb3VyY2UgPSBAaW1hZ2VFZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKVxuICAgIHJldHVybiB1bmxlc3MgaW1nU291cmNlXG5cbiAgICBjYWxsYmFjayA9ID0+XG4gICAgICBAZWRpdG9yLnRyYW5zYWN0ID0+IEBpbnNlcnRJbWFnZVRhZygpXG4gICAgICBAZGV0YWNoKClcblxuICAgIGlmICFAY29weUltYWdlQ2hlY2tib3guaGFzQ2xhc3MoJ2hpZGRlbicpICYmIEBjb3B5SW1hZ2VDaGVja2JveC5wcm9wKFwiY2hlY2tlZFwiKVxuICAgICAgQGNvcHlJbWFnZShAcmVzb2x2ZUltYWdlUGF0aChpbWdTb3VyY2UpLCBjYWxsYmFjaylcbiAgICBlbHNlXG4gICAgICBjYWxsYmFjaygpXG5cbiAgZGlzcGxheTogLT5cbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIEBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAZnJvbnRNYXR0ZXIgPSB0ZW1wbGF0ZUhlbHBlci5nZXRFZGl0b3IoQGVkaXRvcilcbiAgICBAZGF0ZVRpbWUgPSB0ZW1wbGF0ZUhlbHBlci5nZXREYXRlVGltZSgpXG4gICAgQHNldEZpZWxkc0Zyb21TZWxlY3Rpb24oKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAaW1hZ2VFZGl0b3IuZm9jdXMoKVxuXG4gIGRldGFjaDogLT5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBwYW5lbC5oaWRlKClcbiAgICAgIEBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ/LmZvY3VzKClcbiAgICBzdXBlclxuXG4gIGRldGFjaGVkOiAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuXG4gIHNldEZpZWxkc0Zyb21TZWxlY3Rpb246IC0+XG4gICAgQHJhbmdlID0gdXRpbHMuZ2V0VGV4dEJ1ZmZlclJhbmdlKEBlZGl0b3IsIFwibGlua1wiKVxuICAgIHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoQHJhbmdlKVxuICAgIHJldHVybiB1bmxlc3Mgc2VsZWN0aW9uXG5cbiAgICBpZiB1dGlscy5pc0ltYWdlKHNlbGVjdGlvbilcbiAgICAgIGltZyA9IHV0aWxzLnBhcnNlSW1hZ2Uoc2VsZWN0aW9uKVxuICAgIGVsc2UgaWYgdXRpbHMuaXNJbWFnZVRhZyhzZWxlY3Rpb24pXG4gICAgICBpbWcgPSB1dGlscy5wYXJzZUltYWdlVGFnKHNlbGVjdGlvbilcbiAgICBlbHNlXG4gICAgICBpbWcgPSB7IGFsdDogc2VsZWN0aW9uIH1cblxuICAgIEB0aXRsZUVkaXRvci5zZXRUZXh0KGltZy5hbHQgfHwgXCJcIilcbiAgICBAd2lkdGhFZGl0b3Iuc2V0VGV4dChpbWcud2lkdGggfHwgXCJcIilcbiAgICBAaGVpZ2h0RWRpdG9yLnNldFRleHQoaW1nLmhlaWdodCB8fCBcIlwiKVxuICAgIEBpbWFnZUVkaXRvci5zZXRUZXh0KGltZy5zcmMgfHwgXCJcIilcblxuICAgIEB1cGRhdGVJbWFnZVNvdXJjZShpbWcuc3JjKVxuXG4gIG9wZW5JbWFnZURpYWxvZzogLT5cbiAgICBmaWxlcyA9IGRpYWxvZy5zaG93T3BlbkRpYWxvZ1xuICAgICAgcHJvcGVydGllczogWydvcGVuRmlsZSddXG4gICAgICBkZWZhdWx0UGF0aDogbGFzdEluc2VydEltYWdlRGlyIHx8IEBzaXRlTG9jYWxEaXIoKVxuICAgIHJldHVybiB1bmxlc3MgZmlsZXMgJiYgZmlsZXMubGVuZ3RoID4gMFxuXG4gICAgQGltYWdlRWRpdG9yLnNldFRleHQoZmlsZXNbMF0pXG4gICAgQHVwZGF0ZUltYWdlU291cmNlKGZpbGVzWzBdKVxuXG4gICAgbGFzdEluc2VydEltYWdlRGlyID0gcGF0aC5kaXJuYW1lKGZpbGVzWzBdKSB1bmxlc3MgdXRpbHMuaXNVcmwoZmlsZXNbMF0pXG4gICAgQHRpdGxlRWRpdG9yLmZvY3VzKClcblxuICB1cGRhdGVJbWFnZVNvdXJjZTogKGZpbGUpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBmaWxlXG4gICAgQGRpc3BsYXlJbWFnZVByZXZpZXcoZmlsZSlcblxuICAgIGlmIHV0aWxzLmlzVXJsKGZpbGUpIHx8IEBpc0luU2l0ZURpcihAcmVzb2x2ZUltYWdlUGF0aChmaWxlKSlcbiAgICAgIEBjb3B5SW1hZ2VQYW5lbC5hZGRDbGFzcyhcImhpZGRlblwiKVxuICAgIGVsc2VcbiAgICAgIEBjb3B5SW1hZ2VQYW5lbC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKVxuXG4gIHVwZGF0ZUNvcHlJbWFnZURlc3Q6IChmaWxlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZmlsZVxuICAgIGRlc3RGaWxlID0gQGdldENvcGllZEltYWdlRGVzdFBhdGgoZmlsZSwgQHRpdGxlRWRpdG9yLmdldFRleHQoKSlcbiAgICBAY29weUltYWdlTWVzc2FnZS50ZXh0KFwiQ29weSBJbWFnZSBUbzogI3tkZXN0RmlsZX1cIilcblxuICBkaXNwbGF5SW1hZ2VQcmV2aWV3OiAoZmlsZSkgLT5cbiAgICByZXR1cm4gaWYgQGltYWdlT25QcmV2aWV3ID09IGZpbGVcblxuICAgIGlmIHV0aWxzLmlzSW1hZ2VGaWxlKGZpbGUpXG4gICAgICBAbWVzc2FnZS50ZXh0KFwiT3BlbmluZyBJbWFnZSBQcmV2aWV3IC4uLlwiKVxuICAgICAgQGltYWdlUHJldmlldy5hdHRyKFwic3JjXCIsIEByZXNvbHZlSW1hZ2VQYXRoKGZpbGUpKVxuICAgICAgQGltYWdlUHJldmlldy5sb2FkID0+XG4gICAgICAgIEBtZXNzYWdlLnRleHQoXCJcIilcbiAgICAgICAgQHNldEltYWdlQ29udGV4dCgpXG4gICAgICBAaW1hZ2VQcmV2aWV3LmVycm9yID0+XG4gICAgICAgIEBtZXNzYWdlLnRleHQoXCJFcnJvcjogRmFpbGVkIHRvIExvYWQgSW1hZ2UuXCIpXG4gICAgICAgIEBpbWFnZVByZXZpZXcuYXR0cihcInNyY1wiLCBcIlwiKVxuICAgIGVsc2VcbiAgICAgIEBtZXNzYWdlLnRleHQoXCJFcnJvcjogSW52YWxpZCBJbWFnZSBGaWxlLlwiKSBpZiBmaWxlXG4gICAgICBAaW1hZ2VQcmV2aWV3LmF0dHIoXCJzcmNcIiwgXCJcIilcbiAgICAgIEB3aWR0aEVkaXRvci5zZXRUZXh0KFwiXCIpXG4gICAgICBAaGVpZ2h0RWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgIEBhbGlnbkVkaXRvci5zZXRUZXh0KFwiXCIpXG5cbiAgICBAaW1hZ2VPblByZXZpZXcgPSBmaWxlICMgY2FjaGUgcHJldmlldyBpbWFnZSBzcmNcblxuICBzZXRJbWFnZUNvbnRleHQ6IC0+XG4gICAgeyBuYXR1cmFsV2lkdGgsIG5hdHVyYWxIZWlnaHQgfSA9IEBpbWFnZVByZXZpZXcuY29udGV4dFxuICAgIEB3aWR0aEVkaXRvci5zZXRUZXh0KFwiXCIgKyBuYXR1cmFsV2lkdGgpXG4gICAgQGhlaWdodEVkaXRvci5zZXRUZXh0KFwiXCIgKyBuYXR1cmFsSGVpZ2h0KVxuXG4gICAgcG9zaXRpb24gPSBpZiBuYXR1cmFsV2lkdGggPiAzMDAgdGhlbiBcImNlbnRlclwiIGVsc2UgXCJyaWdodFwiXG4gICAgQGFsaWduRWRpdG9yLnNldFRleHQocG9zaXRpb24pXG5cbiAgaW5zZXJ0SW1hZ2VUYWc6IC0+XG4gICAgaW1nU291cmNlID0gQGltYWdlRWRpdG9yLmdldFRleHQoKS50cmltKClcbiAgICBpbWcgPVxuICAgICAgcmF3U3JjOiBpbWdTb3VyY2UsXG4gICAgICBzcmM6IEBnZW5lcmF0ZUltYWdlU3JjKGltZ1NvdXJjZSlcbiAgICAgIHJlbGF0aXZlRmlsZVNyYzogQGdlbmVyYXRlUmVsYXRpdmVJbWFnZVNyYyhpbWdTb3VyY2UsIEBjdXJyZW50RmlsZURpcigpKVxuICAgICAgcmVsYXRpdmVTaXRlU3JjOiBAZ2VuZXJhdGVSZWxhdGl2ZUltYWdlU3JjKGltZ1NvdXJjZSwgQHNpdGVMb2NhbERpcigpKVxuICAgICAgYWx0OiBAdGl0bGVFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICB3aWR0aDogQHdpZHRoRWRpdG9yLmdldFRleHQoKVxuICAgICAgaGVpZ2h0OiBAaGVpZ2h0RWRpdG9yLmdldFRleHQoKVxuICAgICAgYWxpZ246IEBhbGlnbkVkaXRvci5nZXRUZXh0KClcblxuICAgICMgaW5zZXJ0IGltYWdlIHRhZyB3aGVuIGltZy5zcmMgZXhpc3RzLCBvdGhlcndpc2UgY29uc2lkZXIgdGhlIGltYWdlIHdhcyByZW1vdmVkXG4gICAgaWYgaW1nLnNyY1xuICAgICAgdGV4dCA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcImltYWdlVGFnXCIsIEBmcm9udE1hdHRlciwgQGRhdGVUaW1lLCBpbWcpXG4gICAgZWxzZVxuICAgICAgdGV4dCA9IGltZy5hbHRcblxuICAgIEBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoQHJhbmdlLCB0ZXh0KVxuXG4gIGNvcHlJbWFnZTogKGZpbGUsIGNhbGxiYWNrKSAtPlxuICAgIHJldHVybiBjYWxsYmFjaygpIGlmIHV0aWxzLmlzVXJsKGZpbGUpIHx8ICFmcy5leGlzdHNTeW5jKGZpbGUpXG5cbiAgICB0cnlcbiAgICAgIGRlc3RGaWxlID0gQGdldENvcGllZEltYWdlRGVzdFBhdGgoZmlsZSwgQHRpdGxlRWRpdG9yLmdldFRleHQoKSlcbiAgICAgIHBlcmZvcm1Xcml0ZSA9IHRydWVcblxuICAgICAgaWYgZnMuZXhpc3RzU3luYyhkZXN0RmlsZSlcbiAgICAgICAgY29uZmlybWF0aW9uID0gYXRvbS5jb25maXJtXG4gICAgICAgICAgbWVzc2FnZTogXCJGaWxlIGFscmVhZHkgZXhpc3RzIVwiXG4gICAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBcIkFub3RoZXIgZmlsZSBhbHJlYWR5IGV4aXN0cyBhdDpcXG4je2Rlc3RGaWxlfVxcbkRvIHlvdSB3YW50IHRvIG92ZXJ3cml0ZSBpdD9cIlxuICAgICAgICAgIGJ1dHRvbnM6IFtcIk5vXCIsIFwiWWVzXCJdXG4gICAgICAgIHBlcmZvcm1Xcml0ZSA9IChjb25maXJtYXRpb24gPT0gMSlcblxuICAgICAgaWYgcGVyZm9ybVdyaXRlXG4gICAgICAgIGZzLmNvcHkgZmlsZSwgZGVzdEZpbGUsID0+XG4gICAgICAgICAgQGltYWdlRWRpdG9yLnNldFRleHQoZGVzdEZpbGUpXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICBhdG9tLmNvbmZpcm1cbiAgICAgICAgbWVzc2FnZTogXCJbTWFya2Rvd24gV3JpdGVyXSBFcnJvciFcIlxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IFwiQ29weWluZyBJbWFnZTpcXG4je2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgYnV0dG9uczogWydPSyddXG5cbiAgIyBnZXQgdXNlcidzIHNpdGUgbG9jYWwgZGlyZWN0b3J5XG4gIHNpdGVMb2NhbERpcjogLT4gdXRpbHMuZ2V0U2l0ZVBhdGgoY29uZmlnLmdldChcInNpdGVMb2NhbERpclwiKSlcbiAgIyBnZXQgdXNlcidzIHNpdGUgaW1hZ2VzIGRpcmVjdG9yeVxuICBzaXRlSW1hZ2VzRGlyOiAtPiB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJzaXRlSW1hZ2VzRGlyXCIsIEBmcm9udE1hdHRlciwgQGRhdGVUaW1lKVxuICAjIGdldCBjdXJyZW50IG9wZW4gZmlsZSBkaXJlY3RvcnlcbiAgY3VycmVudEZpbGVEaXI6IC0+IHBhdGguZGlybmFtZShAZWRpdG9yLmdldFBhdGgoKSB8fCBcIlwiKVxuICAjIGNoZWNrIHRoZSBmaWxlIGlzIGluIHRoZSBzaXRlIGRpcmVjdG9yeVxuICBpc0luU2l0ZURpcjogKGZpbGUpIC0+IGZpbGUgJiYgZmlsZS5zdGFydHNXaXRoKEBzaXRlTG9jYWxEaXIoKSlcblxuICAjIGdldCBjb3B5IGltYWdlIGRlc3RpbmF0aW9uIGZpbGUgcGF0aFxuICBnZXRDb3BpZWRJbWFnZURlc3RQYXRoOiAoZmlsZSwgdGl0bGUpIC0+XG4gICAgZmlsZW5hbWUgPSBwYXRoLmJhc2VuYW1lKGZpbGUpXG5cbiAgICBpZiBjb25maWcuZ2V0KFwicmVuYW1lSW1hZ2VPbkNvcHlcIikgJiYgdGl0bGVcbiAgICAgIGV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShmaWxlKVxuICAgICAgdGl0bGUgPSB1dGlscy5zbHVnaXplKHRpdGxlLCBjb25maWcuZ2V0KCdzbHVnU2VwYXJhdG9yJykpXG4gICAgICBmaWxlbmFtZSA9IFwiI3t0aXRsZX0je2V4dGVuc2lvbn1cIlxuXG4gICAgcGF0aC5qb2luKEBzaXRlTG9jYWxEaXIoKSwgQHNpdGVJbWFnZXNEaXIoKSwgZmlsZW5hbWUpXG5cbiAgIyB0cnkgdG8gcmVzb2x2ZSBmaWxlIHRvIGEgdmFsaWQgc3JjIHRoYXQgY291bGQgYmUgZGlzcGxheWVkXG4gIHJlc29sdmVJbWFnZVBhdGg6IChmaWxlKSAtPlxuICAgIHJldHVybiBcIlwiIHVubGVzcyBmaWxlXG4gICAgcmV0dXJuIGZpbGUgaWYgdXRpbHMuaXNVcmwoZmlsZSkgfHwgZnMuZXhpc3RzU3luYyhmaWxlKVxuICAgIGFic29sdXRlUGF0aCA9IHBhdGguam9pbihAc2l0ZUxvY2FsRGlyKCksIGZpbGUpXG4gICAgcmV0dXJuIGFic29sdXRlUGF0aCBpZiBmcy5leGlzdHNTeW5jKGFic29sdXRlUGF0aClcbiAgICByZWxhdGl2ZVBhdGggPSBwYXRoLmpvaW4oQGN1cnJlbnRGaWxlRGlyKCksIGZpbGUpXG4gICAgcmV0dXJuIHJlbGF0aXZlUGF0aCBpZiBmcy5leGlzdHNTeW5jKHJlbGF0aXZlUGF0aClcbiAgICByZXR1cm4gZmlsZSAjIGZhbGxiYWNrIHRvIG5vdCByZXNvbHZlXG5cbiAgIyBnZW5lcmF0ZSBhIHNyYyB0aGF0IGlzIHVzZWQgaW4gbWFya2Rvd24gZmlsZSBiYXNlZCBvbiB1c2VyIGNvbmZpZ3VyYXRpb24gb3IgZmlsZSBsb2NhdGlvblxuICBnZW5lcmF0ZUltYWdlU3JjOiAoZmlsZSkgLT5cbiAgICB1dGlscy5ub3JtYWxpemVGaWxlUGF0aChAX2dlbmVyYXRlSW1hZ2VTcmMoZmlsZSkpXG5cbiAgX2dlbmVyYXRlSW1hZ2VTcmM6IChmaWxlKSAtPlxuICAgIHJldHVybiBcIlwiIHVubGVzcyBmaWxlXG4gICAgcmV0dXJuIGZpbGUgaWYgdXRpbHMuaXNVcmwoZmlsZSlcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShAY3VycmVudEZpbGVEaXIoKSwgZmlsZSkgaWYgY29uZmlnLmdldCgncmVsYXRpdmVJbWFnZVBhdGgnKVxuICAgIHJldHVybiBwYXRoLnJlbGF0aXZlKEBzaXRlTG9jYWxEaXIoKSwgZmlsZSkgaWYgQGlzSW5TaXRlRGlyKGZpbGUpXG4gICAgcmV0dXJuIHBhdGguam9pbihcIi9cIiwgQHNpdGVJbWFnZXNEaXIoKSwgcGF0aC5iYXNlbmFtZShmaWxlKSlcblxuICAjIGdlbmVyYXRlIGEgcmVsYXRpdmUgc3JjIGZyb20gdGhlIGJhc2UgcGF0aCBvciBmcm9tIHVzZXIncyBob21lIGRpcmVjdG9yeVxuICBnZW5lcmF0ZVJlbGF0aXZlSW1hZ2VTcmM6IChmaWxlLCBiYXNlUGF0aCkgLT5cbiAgICB1dGlscy5ub3JtYWxpemVGaWxlUGF0aChAX2dlbmVyYXRlUmVsYXRpdmVJbWFnZVNyYyhmaWxlLCBiYXNlUGF0aCkpXG5cbiAgX2dlbmVyYXRlUmVsYXRpdmVJbWFnZVNyYzogKGZpbGUsIGJhc2VQYXRoKSAtPlxuICAgIHJldHVybiBcIlwiIHVubGVzcyBmaWxlXG4gICAgcmV0dXJuIGZpbGUgaWYgdXRpbHMuaXNVcmwoZmlsZSlcbiAgICByZXR1cm4gcGF0aC5yZWxhdGl2ZShiYXNlUGF0aCB8fCBcIn5cIiwgZmlsZSlcbiJdfQ==
