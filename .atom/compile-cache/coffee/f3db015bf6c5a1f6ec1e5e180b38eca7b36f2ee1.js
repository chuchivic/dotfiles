(function() {
  var $, CompositeDisposable, InsertTableView, TextEditorView, View, config, ref, utils,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View, TextEditorView = ref.TextEditorView;

  config = require("../config");

  utils = require("../utils");

  module.exports = InsertTableView = (function(superClass) {
    extend(InsertTableView, superClass);

    function InsertTableView() {
      return InsertTableView.__super__.constructor.apply(this, arguments);
    }

    InsertTableView.content = function() {
      return this.div({
        "class": "markdown-writer markdown-writer-dialog"
      }, (function(_this) {
        return function() {
          _this.label("Insert Table", {
            "class": "icon icon-diff-added"
          });
          return _this.div(function() {
            _this.label("Rows", {
              "class": "message"
            });
            _this.subview("rowEditor", new TextEditorView({
              mini: true
            }));
            _this.label("Columns", {
              "class": "message"
            });
            return _this.subview("columnEditor", new TextEditorView({
              mini: true
            }));
          });
        };
      })(this));
    };

    InsertTableView.prototype.initialize = function() {
      utils.setTabIndex([this.rowEditor, this.columnEditor]);
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

    InsertTableView.prototype.onConfirm = function() {
      var col, row;
      row = parseInt(this.rowEditor.getText(), 10);
      col = parseInt(this.columnEditor.getText(), 10);
      if (this.isValidRange(row, col)) {
        this.insertTable(row, col);
      }
      return this.detach();
    };

    InsertTableView.prototype.display = function() {
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: false
        });
      }
      this.previouslyFocusedElement = $(document.activeElement);
      this.rowEditor.setText("3");
      this.columnEditor.setText("3");
      this.panel.show();
      return this.rowEditor.focus();
    };

    InsertTableView.prototype.detach = function() {
      var ref1;
      if (this.panel.isVisible()) {
        this.panel.hide();
        if ((ref1 = this.previouslyFocusedElement) != null) {
          ref1.focus();
        }
      }
      return InsertTableView.__super__.detach.apply(this, arguments);
    };

    InsertTableView.prototype.detached = function() {
      var ref1;
      if ((ref1 = this.disposables) != null) {
        ref1.dispose();
      }
      return this.disposables = null;
    };

    InsertTableView.prototype.insertTable = function(row, col) {
      var cursor;
      cursor = this.editor.getCursorBufferPosition();
      this.editor.insertText(this.createTable(row, col));
      return this.editor.setCursorBufferPosition(cursor);
    };

    InsertTableView.prototype.createTable = function(row, col) {
      var i, options, ref1, table;
      options = {
        numOfColumns: col,
        extraPipes: config.get("tableExtraPipes"),
        columnWidth: 1,
        alignment: config.get("tableAlignment")
      };
      table = [];
      table.push(utils.createTableRow([], options));
      table.push(utils.createTableSeparator(options));
      for (i = 0, ref1 = row - 2; 0 <= ref1 ? i <= ref1 : i >= ref1; 0 <= ref1 ? i++ : i--) {
        table.push(utils.createTableRow([], options));
      }
      return table.join("\n");
    };

    InsertTableView.prototype.isValidRange = function(row, col) {
      if (isNaN(row) || isNaN(col)) {
        return false;
      }
      if (row < 2 || col < 1) {
        return false;
      }
      return true;
    };

    return InsertTableView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi92aWV3cy9pbnNlcnQtdGFibGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGlGQUFBO0lBQUE7OztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsTUFBNEIsT0FBQSxDQUFRLHNCQUFSLENBQTVCLEVBQUMsU0FBRCxFQUFJLGVBQUosRUFBVTs7RUFFVixNQUFBLEdBQVMsT0FBQSxDQUFRLFdBQVI7O0VBQ1QsS0FBQSxHQUFRLE9BQUEsQ0FBUSxVQUFSOztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7SUFDSixlQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx3Q0FBUDtPQUFMLEVBQXNELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNwRCxLQUFDLENBQUEsS0FBRCxDQUFPLGNBQVAsRUFBdUI7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNCQUFQO1dBQXZCO2lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtZQUNILEtBQUMsQ0FBQSxLQUFELENBQU8sTUFBUCxFQUFlO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO2FBQWY7WUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLFdBQVQsRUFBMEIsSUFBQSxjQUFBLENBQWU7Y0FBQSxJQUFBLEVBQU0sSUFBTjthQUFmLENBQTFCO1lBQ0EsS0FBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLEVBQWtCO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUFQO2FBQWxCO21CQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsY0FBVCxFQUE2QixJQUFBLGNBQUEsQ0FBZTtjQUFBLElBQUEsRUFBTSxJQUFOO2FBQWYsQ0FBN0I7VUFKRyxDQUFMO1FBRm9EO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RDtJQURROzs4QkFTVixVQUFBLEdBQVksU0FBQTtNQUNWLEtBQUssQ0FBQyxXQUFOLENBQWtCLENBQUMsSUFBQyxDQUFBLFNBQUYsRUFBYSxJQUFDLENBQUEsWUFBZCxDQUFsQjtNQUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsbUJBQUEsQ0FBQTthQUNuQixJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQ2YsSUFBQyxDQUFBLE9BRGMsRUFDTDtRQUNSLGNBQUEsRUFBZ0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsU0FBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRFI7UUFFUixhQUFBLEVBQWdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQUcsS0FBQyxDQUFBLE1BQUQsQ0FBQTtVQUFIO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUZSO09BREssQ0FBakI7SUFKVTs7OEJBVVosU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsR0FBQSxHQUFNLFFBQUEsQ0FBUyxJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQSxDQUFULEVBQStCLEVBQS9CO01BQ04sR0FBQSxHQUFNLFFBQUEsQ0FBUyxJQUFDLENBQUEsWUFBWSxDQUFDLE9BQWQsQ0FBQSxDQUFULEVBQWtDLEVBQWxDO01BRU4sSUFBMEIsSUFBQyxDQUFBLFlBQUQsQ0FBYyxHQUFkLEVBQW1CLEdBQW5CLENBQTFCO1FBQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxHQUFiLEVBQWtCLEdBQWxCLEVBQUE7O2FBRUEsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQU5TOzs4QkFRWCxPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBOztRQUNWLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1VBQVksT0FBQSxFQUFTLEtBQXJCO1NBQTdCOztNQUNWLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixDQUFBLENBQUUsUUFBUSxDQUFDLGFBQVg7TUFDNUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLEdBQW5CO01BQ0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQXNCLEdBQXRCO01BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBQTtJQVBPOzs4QkFTVCxNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7UUFDRSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTs7Y0FDeUIsQ0FBRSxLQUEzQixDQUFBO1NBRkY7O2FBR0EsNkNBQUEsU0FBQTtJQUpNOzs4QkFNUixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7O1lBQVksQ0FBRSxPQUFkLENBQUE7O2FBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUZQOzs4QkFJVixXQUFBLEdBQWEsU0FBQyxHQUFELEVBQU0sR0FBTjtBQUNYLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBO01BQ1QsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLElBQUMsQ0FBQSxXQUFELENBQWEsR0FBYixFQUFrQixHQUFsQixDQUFuQjthQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsTUFBaEM7SUFIVzs7OEJBS2IsV0FBQSxHQUFhLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFDWCxVQUFBO01BQUEsT0FBQSxHQUNFO1FBQUEsWUFBQSxFQUFjLEdBQWQ7UUFDQSxVQUFBLEVBQVksTUFBTSxDQUFDLEdBQVAsQ0FBVyxpQkFBWCxDQURaO1FBRUEsV0FBQSxFQUFhLENBRmI7UUFHQSxTQUFBLEVBQVcsTUFBTSxDQUFDLEdBQVAsQ0FBVyxnQkFBWCxDQUhYOztNQUtGLEtBQUEsR0FBUTtNQUdSLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLGNBQU4sQ0FBcUIsRUFBckIsRUFBeUIsT0FBekIsQ0FBWDtNQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLG9CQUFOLENBQTJCLE9BQTNCLENBQVg7QUFFQSxXQUFrRCwrRUFBbEQ7UUFBQSxLQUFLLENBQUMsSUFBTixDQUFXLEtBQUssQ0FBQyxjQUFOLENBQXFCLEVBQXJCLEVBQXlCLE9BQXpCLENBQVg7QUFBQTthQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtJQWhCVzs7OEJBbUJiLFlBQUEsR0FBYyxTQUFDLEdBQUQsRUFBTSxHQUFOO01BQ1osSUFBZ0IsS0FBQSxDQUFNLEdBQU4sQ0FBQSxJQUFjLEtBQUEsQ0FBTSxHQUFOLENBQTlCO0FBQUEsZUFBTyxNQUFQOztNQUNBLElBQWdCLEdBQUEsR0FBTSxDQUFOLElBQVcsR0FBQSxHQUFNLENBQWpDO0FBQUEsZUFBTyxNQUFQOztBQUNBLGFBQU87SUFISzs7OztLQXZFYztBQVA5QiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57JCwgVmlldywgVGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcblxuY29uZmlnID0gcmVxdWlyZSBcIi4uL2NvbmZpZ1wiXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEluc2VydFRhYmxlVmlldyBleHRlbmRzIFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogXCJtYXJrZG93bi13cml0ZXIgbWFya2Rvd24td3JpdGVyLWRpYWxvZ1wiLCA9PlxuICAgICAgQGxhYmVsIFwiSW5zZXJ0IFRhYmxlXCIsIGNsYXNzOiBcImljb24gaWNvbi1kaWZmLWFkZGVkXCJcbiAgICAgIEBkaXYgPT5cbiAgICAgICAgQGxhYmVsIFwiUm93c1wiLCBjbGFzczogXCJtZXNzYWdlXCJcbiAgICAgICAgQHN1YnZpZXcgXCJyb3dFZGl0b3JcIiwgbmV3IFRleHRFZGl0b3JWaWV3KG1pbmk6IHRydWUpXG4gICAgICAgIEBsYWJlbCBcIkNvbHVtbnNcIiwgY2xhc3M6IFwibWVzc2FnZVwiXG4gICAgICAgIEBzdWJ2aWV3IFwiY29sdW1uRWRpdG9yXCIsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgdXRpbHMuc2V0VGFiSW5kZXgoW0Byb3dFZGl0b3IsIEBjb2x1bW5FZGl0b3JdKVxuXG4gICAgQGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBAZWxlbWVudCwge1xuICAgICAgICBcImNvcmU6Y29uZmlybVwiOiA9PiBAb25Db25maXJtKCksXG4gICAgICAgIFwiY29yZTpjYW5jZWxcIjogID0+IEBkZXRhY2goKVxuICAgICAgfSkpXG5cbiAgb25Db25maXJtOiAtPlxuICAgIHJvdyA9IHBhcnNlSW50KEByb3dFZGl0b3IuZ2V0VGV4dCgpLCAxMClcbiAgICBjb2wgPSBwYXJzZUludChAY29sdW1uRWRpdG9yLmdldFRleHQoKSwgMTApXG5cbiAgICBAaW5zZXJ0VGFibGUocm93LCBjb2wpIGlmIEBpc1ZhbGlkUmFuZ2Uocm93LCBjb2wpXG5cbiAgICBAZGV0YWNoKClcblxuICBkaXNwbGF5OiAtPlxuICAgIEBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICBAcHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gJChkb2N1bWVudC5hY3RpdmVFbGVtZW50KVxuICAgIEByb3dFZGl0b3Iuc2V0VGV4dChcIjNcIilcbiAgICBAY29sdW1uRWRpdG9yLnNldFRleHQoXCIzXCIpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEByb3dFZGl0b3IuZm9jdXMoKVxuXG4gIGRldGFjaDogLT5cbiAgICBpZiBAcGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBwYW5lbC5oaWRlKClcbiAgICAgIEBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ/LmZvY3VzKClcbiAgICBzdXBlclxuXG4gIGRldGFjaGVkOiAtPlxuICAgIEBkaXNwb3NhYmxlcz8uZGlzcG9zZSgpXG4gICAgQGRpc3Bvc2FibGVzID0gbnVsbFxuXG4gIGluc2VydFRhYmxlOiAocm93LCBjb2wpIC0+XG4gICAgY3Vyc29yID0gQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpXG4gICAgQGVkaXRvci5pbnNlcnRUZXh0KEBjcmVhdGVUYWJsZShyb3csIGNvbCkpXG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihjdXJzb3IpXG5cbiAgY3JlYXRlVGFibGU6IChyb3csIGNvbCkgLT5cbiAgICBvcHRpb25zID1cbiAgICAgIG51bU9mQ29sdW1uczogY29sXG4gICAgICBleHRyYVBpcGVzOiBjb25maWcuZ2V0KFwidGFibGVFeHRyYVBpcGVzXCIpXG4gICAgICBjb2x1bW5XaWR0aDogMVxuICAgICAgYWxpZ25tZW50OiBjb25maWcuZ2V0KFwidGFibGVBbGlnbm1lbnRcIilcblxuICAgIHRhYmxlID0gW11cblxuICAgICMgaW5zZXJ0IGhlYWRlclxuICAgIHRhYmxlLnB1c2godXRpbHMuY3JlYXRlVGFibGVSb3coW10sIG9wdGlvbnMpKVxuICAgICMgaW5zZXJ0IHNlcGFyYXRvclxuICAgIHRhYmxlLnB1c2godXRpbHMuY3JlYXRlVGFibGVTZXBhcmF0b3Iob3B0aW9ucykpXG4gICAgIyBpbnNlcnQgYm9keSByb3dzXG4gICAgdGFibGUucHVzaCh1dGlscy5jcmVhdGVUYWJsZVJvdyhbXSwgb3B0aW9ucykpIGZvciBbMC4ucm93IC0gMl1cblxuICAgIHRhYmxlLmpvaW4oXCJcXG5cIilcblxuICAjIGF0IGxlYXN0IDIgcm93ICsgMiBjb2x1bW5zXG4gIGlzVmFsaWRSYW5nZTogKHJvdywgY29sKSAtPlxuICAgIHJldHVybiBmYWxzZSBpZiBpc05hTihyb3cpIHx8IGlzTmFOKGNvbClcbiAgICByZXR1cm4gZmFsc2UgaWYgcm93IDwgMiB8fCBjb2wgPCAxXG4gICAgcmV0dXJuIHRydWVcbiJdfQ==
