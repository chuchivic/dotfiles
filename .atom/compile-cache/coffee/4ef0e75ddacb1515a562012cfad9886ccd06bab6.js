(function() {
  var ContentsByMode, StatusBarManager;

  ContentsByMode = {
    'insert': ["status-bar-vim-mode-insert", "Insert"],
    'insert.replace': ["status-bar-vim-mode-insert", "Replace"],
    'normal': ["status-bar-vim-mode-normal", "Normal"],
    'visual': ["status-bar-vim-mode-visual", "Visual"],
    'visual.characterwise': ["status-bar-vim-mode-visual", "Visual"],
    'visual.linewise': ["status-bar-vim-mode-visual", "Visual Line"],
    'visual.blockwise': ["status-bar-vim-mode-visual", "Visual Block"]
  };

  module.exports = StatusBarManager = (function() {
    function StatusBarManager() {
      this.element = document.createElement("div");
      this.element.id = "status-bar-vim-mode";
      this.container = document.createElement("div");
      this.container.className = "inline-block";
      this.container.appendChild(this.element);
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(currentMode, currentSubmode) {
      var klass, newContents, text;
      if (currentSubmode != null) {
        currentMode = currentMode + "." + currentSubmode;
      }
      if (newContents = ContentsByMode[currentMode]) {
        klass = newContents[0], text = newContents[1];
        this.element.className = klass;
        return this.element.textContent = text;
      } else {
        return this.hide();
      }
    };

    StatusBarManager.prototype.hide = function() {
      return this.element.className = 'hidden';
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3N0YXR1cy1iYXItbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGNBQUEsR0FDRTtJQUFBLFFBQUEsRUFBVSxDQUFDLDRCQUFELEVBQStCLFFBQS9CLENBQVY7SUFDQSxnQkFBQSxFQUFrQixDQUFDLDRCQUFELEVBQStCLFNBQS9CLENBRGxCO0lBRUEsUUFBQSxFQUFVLENBQUMsNEJBQUQsRUFBK0IsUUFBL0IsQ0FGVjtJQUdBLFFBQUEsRUFBVSxDQUFDLDRCQUFELEVBQStCLFFBQS9CLENBSFY7SUFJQSxzQkFBQSxFQUF3QixDQUFDLDRCQUFELEVBQStCLFFBQS9CLENBSnhCO0lBS0EsaUJBQUEsRUFBbUIsQ0FBQyw0QkFBRCxFQUErQixhQUEvQixDQUxuQjtJQU1BLGtCQUFBLEVBQW9CLENBQUMsNEJBQUQsRUFBK0IsY0FBL0IsQ0FOcEI7OztFQVFGLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUywwQkFBQTtNQUNYLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsR0FBYztNQUVkLElBQUMsQ0FBQSxTQUFELEdBQWEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDYixJQUFDLENBQUEsU0FBUyxDQUFDLFNBQVgsR0FBdUI7TUFDdkIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxXQUFYLENBQXVCLElBQUMsQ0FBQSxPQUF4QjtJQU5XOzsrQkFRYixVQUFBLEdBQVksU0FBQyxTQUFEO01BQUMsSUFBQyxDQUFBLFlBQUQ7SUFBRDs7K0JBRVosTUFBQSxHQUFRLFNBQUMsV0FBRCxFQUFjLGNBQWQ7QUFDTixVQUFBO01BQUEsSUFBb0Qsc0JBQXBEO1FBQUEsV0FBQSxHQUFjLFdBQUEsR0FBYyxHQUFkLEdBQW9CLGVBQWxDOztNQUNBLElBQUcsV0FBQSxHQUFjLGNBQWUsQ0FBQSxXQUFBLENBQWhDO1FBQ0csc0JBQUQsRUFBUTtRQUNSLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQjtlQUNyQixJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUIsS0FIekI7T0FBQSxNQUFBO2VBS0UsSUFBQyxDQUFBLElBQUQsQ0FBQSxFQUxGOztJQUZNOzsrQkFTUixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUFxQjtJQURqQjs7K0JBS04sTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QjtRQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsU0FBUDtRQUFrQixRQUFBLEVBQVUsRUFBNUI7T0FBeEI7SUFERjs7K0JBR1IsTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQTtJQURNOzs7OztBQXRDViIsInNvdXJjZXNDb250ZW50IjpbIkNvbnRlbnRzQnlNb2RlID1cbiAgJ2luc2VydCc6IFtcInN0YXR1cy1iYXItdmltLW1vZGUtaW5zZXJ0XCIsIFwiSW5zZXJ0XCJdXG4gICdpbnNlcnQucmVwbGFjZSc6IFtcInN0YXR1cy1iYXItdmltLW1vZGUtaW5zZXJ0XCIsIFwiUmVwbGFjZVwiXVxuICAnbm9ybWFsJzogW1wic3RhdHVzLWJhci12aW0tbW9kZS1ub3JtYWxcIiwgXCJOb3JtYWxcIl1cbiAgJ3Zpc3VhbCc6IFtcInN0YXR1cy1iYXItdmltLW1vZGUtdmlzdWFsXCIsIFwiVmlzdWFsXCJdXG4gICd2aXN1YWwuY2hhcmFjdGVyd2lzZSc6IFtcInN0YXR1cy1iYXItdmltLW1vZGUtdmlzdWFsXCIsIFwiVmlzdWFsXCJdXG4gICd2aXN1YWwubGluZXdpc2UnOiBbXCJzdGF0dXMtYmFyLXZpbS1tb2RlLXZpc3VhbFwiLCBcIlZpc3VhbCBMaW5lXCJdXG4gICd2aXN1YWwuYmxvY2t3aXNlJzogW1wic3RhdHVzLWJhci12aW0tbW9kZS12aXN1YWxcIiwgXCJWaXN1YWwgQmxvY2tcIl1cblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU3RhdHVzQmFyTWFuYWdlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcbiAgICBAZWxlbWVudC5pZCA9IFwic3RhdHVzLWJhci12aW0tbW9kZVwiXG5cbiAgICBAY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuICAgIEBjb250YWluZXIuY2xhc3NOYW1lID0gXCJpbmxpbmUtYmxvY2tcIlxuICAgIEBjb250YWluZXIuYXBwZW5kQ2hpbGQoQGVsZW1lbnQpXG5cbiAgaW5pdGlhbGl6ZTogKEBzdGF0dXNCYXIpIC0+XG5cbiAgdXBkYXRlOiAoY3VycmVudE1vZGUsIGN1cnJlbnRTdWJtb2RlKSAtPlxuICAgIGN1cnJlbnRNb2RlID0gY3VycmVudE1vZGUgKyBcIi5cIiArIGN1cnJlbnRTdWJtb2RlIGlmIGN1cnJlbnRTdWJtb2RlP1xuICAgIGlmIG5ld0NvbnRlbnRzID0gQ29udGVudHNCeU1vZGVbY3VycmVudE1vZGVdXG4gICAgICBba2xhc3MsIHRleHRdID0gbmV3Q29udGVudHNcbiAgICAgIEBlbGVtZW50LmNsYXNzTmFtZSA9IGtsYXNzXG4gICAgICBAZWxlbWVudC50ZXh0Q29udGVudCA9IHRleHRcbiAgICBlbHNlXG4gICAgICBAaGlkZSgpXG5cbiAgaGlkZTogLT5cbiAgICBAZWxlbWVudC5jbGFzc05hbWUgPSAnaGlkZGVuJ1xuXG4gICMgUHJpdmF0ZVxuXG4gIGF0dGFjaDogLT5cbiAgICBAdGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKGl0ZW06IEBjb250YWluZXIsIHByaW9yaXR5OiAyMClcblxuICBkZXRhY2g6IC0+XG4gICAgQHRpbGUuZGVzdHJveSgpXG4iXX0=
