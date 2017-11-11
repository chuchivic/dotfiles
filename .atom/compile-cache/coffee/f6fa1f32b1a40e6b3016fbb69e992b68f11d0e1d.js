(function() {
  var $, CompositeDisposable, InsertFootnoteView, TextEditorView, View, config, guid, helper, ref, templateHelper, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  guid = require("guid");

  config = require("../config");

  utils = require("../utils");

  helper = require("../helpers/insert-link-helper");

  templateHelper = require("../helpers/template-helper");

  module.exports = InsertFootnoteView = (function(superClass) {
    extend(InsertFootnoteView, superClass);

    function InsertFootnoteView() {
      return InsertFootnoteView.__super__.constructor.apply(this, arguments);
    }

    InsertFootnoteView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Footnote", {
            "class": "icon icon-pin"
          });
          _this.div(function() {
            _this.label("Label", {
              "class": "message"
            });
            return _this.subview("labelEditor", new TextEditorView({
              mini: true
            }));
          });
          return _this.div({
            outlet: "contentBox"
          }, function() {
            _this.label("Content", {
              "class": "message"
            });
            return _this.subview("contentEditor", new TextEditorView({
              mini: true
            }));
          });
        };
      })(this));
    };

    InsertFootnoteView.prototype.initialize = function() {
      utils.setTabIndex([this.labelEditor, this.contentEditor]);
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

    InsertFootnoteView.prototype.onConfirm = function() {
      var footnote;
      footnote = {
        label: this.labelEditor.getText(),
        content: this.contentEditor.getText()
      };
      this.editor.transact((function(_this) {
        return function() {
          if (_this.footnote) {
            return _this.updateFootnote(footnote);
          } else {
            return _this.insertFootnote(footnote);
          }
        };
      })(this));
      return this.detach();
    };

    InsertFootnoteView.prototype.display = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.editor = atom.workspace.getActiveTextEditor();
      this._normalizeSelectionAndSetFootnote();
      this.panel.show();
      this.labelEditor.getModel().selectAll();
      return this.labelEditor.focus();
    };

    InsertFootnoteView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertFootnoteView.__super__.detach.apply(this, arguments);
    };

    InsertFootnoteView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertFootnoteView.prototype._normalizeSelectionAndSetFootnote = function() {
      this.range = utils.getTextBufferRange(this.editor, "link", {
        selectBy: "nope"
      });
      this.selection = this.editor.getTextInRange(this.range) || "";
      if (utils.isFootnote(this.selection)) {
        this.footnote = utils.parseFootnote(this.selection);
        this.contentBox.hide();
        return this.labelEditor.setText(this.footnote["label"]);
      } else {
        return this.labelEditor.setText(guid.raw().slice(0, 8));
      }
    };

    InsertFootnoteView.prototype.updateFootnote = function(footnote) {
      var definitionText, findText, referenceText, replaceText, updateText;
      referenceText = templateHelper.create("footnoteReferenceTag", footnote);
      definitionText = templateHelper.create("footnoteDefinitionTag", footnote).trim();
      if (this.footnote["isDefinition"]) {
        updateText = definitionText;
        findText = templateHelper.create("footnoteReferenceTag", this.footnote).trim();
        replaceText = referenceText;
      } else {
        updateText = referenceText;
        findText = templateHelper.create("footnoteDefinitionTag", this.footnote).trim();
        replaceText = definitionText;
      }
      this.editor.setTextInBufferRange(this.range, updateText);
      return this.editor.buffer.scan(RegExp("" + (utils.escapeRegExp(findText))), function(match) {
        match.replace(replaceText);
        return match.stop();
      });
    };

    InsertFootnoteView.prototype.insertFootnote = function(footnote) {
      var definitionText, referenceText;
      referenceText = templateHelper.create("footnoteReferenceTag", footnote);
      definitionText = templateHelper.create("footnoteDefinitionTag", footnote).trim();
      this.editor.setTextInBufferRange(this.range, this.selection + referenceText);
      if (config.get("footnoteInsertPosition") === "article") {
        return helper.insertAtEndOfArticle(this.editor, definitionText);
      } else {
        return helper.insertAfterCurrentParagraph(this.editor, definitionText);
      }
    };

    return InsertFootnoteView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi92aWV3cy9pbnNlcnQtZm9vdG5vdGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtIQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLGVBQUosRUFBVTs7RUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBQSxHQUFTLE9BQUEsQ0FBUSxXQUFSOztFQUNULEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLCtCQUFSOztFQUNULGNBQUEsR0FBaUIsT0FBQSxDQUFRLDRCQUFSOztFQUVqQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O0lBQ0osa0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHdDQUFQO09BQUwsRUFBc0QsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3BELEtBQUMsQ0FBQSxLQUFELENBQU8saUJBQVAsRUFBMEI7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7V0FBMUI7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7WUFDSCxLQUFDLENBQUEsS0FBRCxDQUFPLE9BQVAsRUFBZ0I7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQVA7YUFBaEI7bUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxhQUFULEVBQTRCLElBQUEsY0FBQSxDQUFlO2NBQUEsSUFBQSxFQUFNLElBQU47YUFBZixDQUE1QjtVQUZHLENBQUw7aUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLE1BQUEsRUFBUSxZQUFS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QUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsSUFBQyxDQUFBLEtBQTlCLEVBQXFDLFVBQXJDO2FBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBZixDQUFvQixNQUFBLENBQUEsRUFBQSxHQUFLLENBQUMsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsUUFBbkIsQ0FBRCxDQUFMLENBQXBCLEVBQTZELFNBQUMsS0FBRDtRQUMzRCxLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQ7ZUFDQSxLQUFLLENBQUMsSUFBTixDQUFBO01BRjJELENBQTdEO0lBZGM7O2lDQWtCaEIsY0FBQSxHQUFnQixTQUFDLFFBQUQ7QUFDZCxVQUFBO01BQUEsYUFBQSxHQUFnQixjQUFjLENBQUMsTUFBZixDQUFzQixzQkFBdEIsRUFBOEMsUUFBOUM7TUFDaEIsY0FBQSxHQUFpQixjQUFjLENBQUMsTUFBZixDQUFzQix1QkFBdEIsRUFBK0MsUUFBL0MsQ0FBd0QsQ0FBQyxJQUF6RCxDQUFBO01BRWpCLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsSUFBQyxDQUFBLEtBQTlCLEVBQXFDLElBQUMsQ0FBQSxTQUFELEdBQWEsYUFBbEQ7TUFFQSxJQUFHLE1BQU0sQ0FBQyxHQUFQLENBQVcsd0JBQVgsQ0FBQSxLQUF3QyxTQUEzQztlQUNFLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixJQUFDLENBQUEsTUFBN0IsRUFBcUMsY0FBckMsRUFERjtPQUFBLE1BQUE7ZUFHRSxNQUFNLENBQUMsMkJBQVAsQ0FBbUMsSUFBQyxDQUFBLE1BQXBDLEVBQTRDLGNBQTVDLEVBSEY7O0lBTmM7Ozs7S0FsRmU7QUFWakMiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xueyQsIFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5ndWlkID0gcmVxdWlyZSBcImd1aWRcIlxuXG5jb25maWcgPSByZXF1aXJlIFwiLi4vY29uZmlnXCJcbnV0aWxzID0gcmVxdWlyZSBcIi4uL3V0aWxzXCJcbmhlbHBlciA9IHJlcXVpcmUgXCIuLi9oZWxwZXJzL2luc2VydC1saW5rLWhlbHBlclwiXG50ZW1wbGF0ZUhlbHBlciA9IHJlcXVpcmUgXCIuLi9oZWxwZXJzL3RlbXBsYXRlLWhlbHBlclwiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEluc2VydEZvb3Rub3RlVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogXCJtYXJrZG93bi13cml0ZXIgbWFya2Rvd24td3JpdGVyLWRpYWxvZ1wiLCA9PlxuICAgICAgQGxhYmVsIFwiSW5zZXJ0IEZvb3Rub3RlXCIsIGNsYXNzOiBcImljb24gaWNvbi1waW5cIlxuICAgICAgQGRpdiA9PlxuICAgICAgICBAbGFiZWwgXCJMYWJlbFwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJsYWJlbEVkaXRvclwiLCBuZXcgVGV4dEVkaXRvclZpZXcobWluaTogdHJ1ZSlcbiAgICAgIEBkaXYgb3V0bGV0OiBcImNvbnRlbnRCb3hcIiwgPT5cbiAgICAgICAgQGxhYmVsIFwiQ29udGVudFwiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJjb250ZW50RWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgdXRpbHMuc2V0VGFiSW5kZXgoW0BsYWJlbEVkaXRvciwgQGNvbnRlbnRFZGl0b3JdKVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBAZWxlbWVudCwge1xuICAgICAgICBcImNvcmU6Y29uZmlybVwiOiA9PiBAb25Db25maXJtKCksXG4gICAgICAgIFwiY29yZTpjYW5jZWxcIjogID0+IEBkZXRhY2goKVxuICAgICAgfSkpXG5cbiAgb25Db25maXJtOiAtPlxuICAgIGZvb3Rub3RlID1cbiAgICAgIGxhYmVsOiBAbGFiZWxFZGl0b3IuZ2V0VGV4dCgpXG4gICAgICBjb250ZW50OiBAY29udGVudEVkaXRvci5nZXRUZXh0KClcblxuICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgIGlmIEBmb290bm90ZVxuICAgICAgICBAdXBkYXRlRm9vdG5vdGUoZm9vdG5vdGUpXG4gICAgICBlbHNlXG4gICAgICAgIEBpbnNlcnRGb290bm90ZShmb290bm90ZSlcblxuICAgIEBkZXRhY2goKVxuXG4gIGRpc3BsYXk6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcywgdmlzaWJsZTogZmFsc2UpXG4gICAgQHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9ICQoZG9jdW1lbnQuYWN0aXZlRWxlbWVudClcbiAgICBAZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQF9ub3JtYWxpemVTZWxlY3Rpb25BbmRTZXRGb290bm90ZSgpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBsYWJlbEVkaXRvci5nZXRNb2RlbCgpLnNlbGVjdEFsbCgpXG4gICAgQGxhYmVsRWRpdG9yLmZvY3VzKClcblxuICBkZXRhY2g6IC0+XG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAcGFuZWwuaGlkZSgpXG4gICAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50Py5mb2N1cygpXG4gICAgc3VwZXJcblxuICBkZXRhY2hlZDogLT5cbiAgICBAZGlzcG9zYWJsZXM/LmRpc3Bvc2UoKVxuICAgIEBkaXNwb3NhYmxlcyA9IG51bGxcblxuICBfbm9ybWFsaXplU2VsZWN0aW9uQW5kU2V0Rm9vdG5vdGU6IC0+XG4gICAgQHJhbmdlID0gdXRpbHMuZ2V0VGV4dEJ1ZmZlclJhbmdlKEBlZGl0b3IsIFwibGlua1wiLCBzZWxlY3RCeTogXCJub3BlXCIpXG4gICAgQHNlbGVjdGlvbiA9IEBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoQHJhbmdlKSB8fCBcIlwiXG5cbiAgICBpZiB1dGlscy5pc0Zvb3Rub3RlKEBzZWxlY3Rpb24pXG4gICAgICBAZm9vdG5vdGUgPSB1dGlscy5wYXJzZUZvb3Rub3RlKEBzZWxlY3Rpb24pXG4gICAgICBAY29udGVudEJveC5oaWRlKClcbiAgICAgIEBsYWJlbEVkaXRvci5zZXRUZXh0KEBmb290bm90ZVtcImxhYmVsXCJdKVxuICAgIGVsc2VcbiAgICAgIEBsYWJlbEVkaXRvci5zZXRUZXh0KGd1aWQucmF3KClbMC4uN10pXG5cbiAgdXBkYXRlRm9vdG5vdGU6IChmb290bm90ZSkgLT5cbiAgICByZWZlcmVuY2VUZXh0ID0gdGVtcGxhdGVIZWxwZXIuY3JlYXRlKFwiZm9vdG5vdGVSZWZlcmVuY2VUYWdcIiwgZm9vdG5vdGUpXG4gICAgZGVmaW5pdGlvblRleHQgPSB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJmb290bm90ZURlZmluaXRpb25UYWdcIiwgZm9vdG5vdGUpLnRyaW0oKVxuXG4gICAgaWYgQGZvb3Rub3RlW1wiaXNEZWZpbml0aW9uXCJdXG4gICAgICB1cGRhdGVUZXh0ID0gZGVmaW5pdGlvblRleHRcbiAgICAgIGZpbmRUZXh0ID0gdGVtcGxhdGVIZWxwZXIuY3JlYXRlKFwiZm9vdG5vdGVSZWZlcmVuY2VUYWdcIiwgQGZvb3Rub3RlKS50cmltKClcbiAgICAgIHJlcGxhY2VUZXh0ID0gcmVmZXJlbmNlVGV4dFxuICAgIGVsc2VcbiAgICAgIHVwZGF0ZVRleHQgPSByZWZlcmVuY2VUZXh0XG4gICAgICBmaW5kVGV4dCA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcImZvb3Rub3RlRGVmaW5pdGlvblRhZ1wiLCBAZm9vdG5vdGUpLnRyaW0oKVxuICAgICAgcmVwbGFjZVRleHQgPSBkZWZpbml0aW9uVGV4dFxuXG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShAcmFuZ2UsIHVwZGF0ZVRleHQpXG4gICAgQGVkaXRvci5idWZmZXIuc2NhbiAvLy8gI3t1dGlscy5lc2NhcGVSZWdFeHAoZmluZFRleHQpfSAvLy8sIChtYXRjaCkgLT5cbiAgICAgIG1hdGNoLnJlcGxhY2UocmVwbGFjZVRleHQpXG4gICAgICBtYXRjaC5zdG9wKClcblxuICBpbnNlcnRGb290bm90ZTogKGZvb3Rub3RlKSAtPlxuICAgIHJlZmVyZW5jZVRleHQgPSB0ZW1wbGF0ZUhlbHBlci5jcmVhdGUoXCJmb290bm90ZVJlZmVyZW5jZVRhZ1wiLCBmb290bm90ZSlcbiAgICBkZWZpbml0aW9uVGV4dCA9IHRlbXBsYXRlSGVscGVyLmNyZWF0ZShcImZvb3Rub3RlRGVmaW5pdGlvblRhZ1wiLCBmb290bm90ZSkudHJpbSgpXG5cbiAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKEByYW5nZSwgQHNlbGVjdGlvbiArIHJlZmVyZW5jZVRleHQpXG5cbiAgICBpZiBjb25maWcuZ2V0KFwiZm9vdG5vdGVJbnNlcnRQb3NpdGlvblwiKSA9PSBcImFydGljbGVcIlxuICAgICAgaGVscGVyLmluc2VydEF0RW5kT2ZBcnRpY2xlKEBlZGl0b3IsIGRlZmluaXRpb25UZXh0KVxuICAgIGVsc2VcbiAgICAgIGhlbHBlci5pbnNlcnRBZnRlckN1cnJlbnRQYXJhZ3JhcGgoQGVkaXRvciwgZGVmaW5pdGlvblRleHQpXG4iXX0=
