(function() {
  var VimOption,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
      this.noscs = bind(this.noscs, this);
      this.nosmartcase = bind(this.nosmartcase, this);
      this.scs = bind(this.scs, this);
      this.smartcase = bind(this.smartcase, this);
      this.nosb = bind(this.nosb, this);
      this.nosplitbelow = bind(this.nosplitbelow, this);
      this.sb = bind(this.sb, this);
      this.splitbelow = bind(this.splitbelow, this);
      this.nospr = bind(this.nospr, this);
      this.nosplitright = bind(this.nosplitright, this);
      this.spr = bind(this.spr, this);
      this.splitright = bind(this.splitright, this);
      this.nonu = bind(this.nonu, this);
      this.nonumber = bind(this.nonumber, this);
      this.nu = bind(this.nu, this);
      this.number = bind(this.number, this);
      this.nolist = bind(this.nolist, this);
      this.list = bind(this.list, this);
    }

    VimOption.singleton = function() {
      return VimOption.option || (VimOption.option = new VimOption);
    };

    VimOption.prototype.list = function() {
      return atom.config.set("editor.showInvisibles", true);
    };

    VimOption.prototype.nolist = function() {
      return atom.config.set("editor.showInvisibles", false);
    };

    VimOption.prototype.number = function() {
      return atom.config.set("editor.showLineNumbers", true);
    };

    VimOption.prototype.nu = function() {
      return this.number();
    };

    VimOption.prototype.nonumber = function() {
      return atom.config.set("editor.showLineNumbers", false);
    };

    VimOption.prototype.nonu = function() {
      return this.nonumber();
    };

    VimOption.prototype.splitright = function() {
      return atom.config.set("ex-mode.splitright", true);
    };

    VimOption.prototype.spr = function() {
      return this.splitright();
    };

    VimOption.prototype.nosplitright = function() {
      return atom.config.set("ex-mode.splitright", false);
    };

    VimOption.prototype.nospr = function() {
      return this.nosplitright();
    };

    VimOption.prototype.splitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", true);
    };

    VimOption.prototype.sb = function() {
      return this.splitbelow();
    };

    VimOption.prototype.nosplitbelow = function() {
      return atom.config.set("ex-mode.splitbelow", false);
    };

    VimOption.prototype.nosb = function() {
      return this.nosplitbelow();
    };

    VimOption.prototype.smartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", true);
    };

    VimOption.prototype.scs = function() {
      return this.smartcase();
    };

    VimOption.prototype.nosmartcase = function() {
      return atom.config.set("vim-mode.useSmartcaseForSearch", false);
    };

    VimOption.prototype.noscs = function() {
      return this.nosmartcase();
    };

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvdmltLW9wdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFNBQUE7SUFBQTs7RUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUNKLFNBQUMsQ0FBQSxTQUFELEdBQVksU0FBQTthQUNWLFNBQUMsQ0FBQSxXQUFELFNBQUMsQ0FBQSxTQUFXLElBQUk7SUFETjs7d0JBR1osSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLElBQXpDO0lBREk7O3dCQUdOLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxLQUF6QztJQURNOzt3QkFHUixNQUFBLEdBQVEsU0FBQTthQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3QkFBaEIsRUFBMEMsSUFBMUM7SUFETTs7d0JBR1IsRUFBQSxHQUFJLFNBQUE7YUFDRixJQUFDLENBQUEsTUFBRCxDQUFBO0lBREU7O3dCQUdKLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxLQUExQztJQURROzt3QkFHVixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxRQUFELENBQUE7SUFESTs7d0JBR04sVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLElBQXRDO0lBRFU7O3dCQUdaLEdBQUEsR0FBSyxTQUFBO2FBQ0gsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQURHOzt3QkFHTCxZQUFBLEdBQWMsU0FBQTthQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsS0FBdEM7SUFEWTs7d0JBR2QsS0FBQSxHQUFPLFNBQUE7YUFDTCxJQUFDLENBQUEsWUFBRCxDQUFBO0lBREs7O3dCQUdQLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxJQUF0QztJQURVOzt3QkFHWixFQUFBLEdBQUksU0FBQTthQUNGLElBQUMsQ0FBQSxVQUFELENBQUE7SUFERTs7d0JBR0osWUFBQSxHQUFjLFNBQUE7YUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLEtBQXRDO0lBRFk7O3dCQUdkLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBQyxDQUFBLFlBQUQsQ0FBQTtJQURJOzt3QkFHTixTQUFBLEdBQVcsU0FBQTthQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEIsRUFBa0QsSUFBbEQ7SUFEUzs7d0JBR1gsR0FBQSxHQUFLLFNBQUE7YUFDSCxJQUFDLENBQUEsU0FBRCxDQUFBO0lBREc7O3dCQUdMLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixFQUFrRCxLQUFsRDtJQURXOzt3QkFHYixLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxXQUFELENBQUE7SUFESzs7Ozs7O0VBR1QsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUExRGpCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgVmltT3B0aW9uXG4gIEBzaW5nbGV0b246ID0+XG4gICAgQG9wdGlvbiB8fD0gbmV3IFZpbU9wdGlvblxuXG4gIGxpc3Q6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZWRpdG9yLnNob3dJbnZpc2libGVzXCIsIHRydWUpXG5cbiAgbm9saXN0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93SW52aXNpYmxlc1wiLCBmYWxzZSlcblxuICBudW1iZXI6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZWRpdG9yLnNob3dMaW5lTnVtYmVyc1wiLCB0cnVlKVxuXG4gIG51OiA9PlxuICAgIEBudW1iZXIoKVxuXG4gIG5vbnVtYmVyOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93TGluZU51bWJlcnNcIiwgZmFsc2UpXG5cbiAgbm9udTogPT5cbiAgICBAbm9udW1iZXIoKVxuXG4gIHNwbGl0cmlnaHQ6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdHJpZ2h0XCIsIHRydWUpXG5cbiAgc3ByOiA9PlxuICAgIEBzcGxpdHJpZ2h0KClcblxuICBub3NwbGl0cmlnaHQ6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdHJpZ2h0XCIsIGZhbHNlKVxuXG4gIG5vc3ByOiA9PlxuICAgIEBub3NwbGl0cmlnaHQoKVxuXG4gIHNwbGl0YmVsb3c6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdGJlbG93XCIsIHRydWUpXG5cbiAgc2I6ID0+XG4gICAgQHNwbGl0YmVsb3coKVxuXG4gIG5vc3BsaXRiZWxvdzogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLnNwbGl0YmVsb3dcIiwgZmFsc2UpXG5cbiAgbm9zYjogPT5cbiAgICBAbm9zcGxpdGJlbG93KClcblxuICBzbWFydGNhc2U6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwidmltLW1vZGUudXNlU21hcnRjYXNlRm9yU2VhcmNoXCIsIHRydWUpXG5cbiAgc2NzOiA9PlxuICAgIEBzbWFydGNhc2UoKVxuXG4gIG5vc21hcnRjYXNlOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcInZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaFwiLCBmYWxzZSlcblxuICBub3NjczogPT5cbiAgICBAbm9zbWFydGNhc2UoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpbU9wdGlvblxuIl19
