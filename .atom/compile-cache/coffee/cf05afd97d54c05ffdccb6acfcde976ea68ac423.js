(function() {
  var VimOption,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  VimOption = (function() {
    function VimOption() {
      this.nogdefault = bind(this.nogdefault, this);
      this.gdefault = bind(this.gdefault, this);
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

    VimOption.prototype.gdefault = function() {
      return atom.config.set("ex-mode.gdefault", true);
    };

    VimOption.prototype.nogdefault = function() {
      return atom.config.set("ex-mode.gdefault", false);
    };

    return VimOption;

  })();

  module.exports = VimOption;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZXgtbW9kZS9saWIvdmltLW9wdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLFNBQUE7SUFBQTs7RUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQ0osU0FBQyxDQUFBLFNBQUQsR0FBWSxTQUFBO2FBQ1YsU0FBQyxDQUFBLFdBQUQsU0FBQyxDQUFBLFNBQVcsSUFBSTtJQUROOzt3QkFHWixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsSUFBekM7SUFESTs7d0JBR04sTUFBQSxHQUFRLFNBQUE7YUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUJBQWhCLEVBQXlDLEtBQXpDO0lBRE07O3dCQUdSLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdCQUFoQixFQUEwQyxJQUExQztJQURNOzt3QkFHUixFQUFBLEdBQUksU0FBQTthQUNGLElBQUMsQ0FBQSxNQUFELENBQUE7SUFERTs7d0JBR0osUUFBQSxHQUFVLFNBQUE7YUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isd0JBQWhCLEVBQTBDLEtBQTFDO0lBRFE7O3dCQUdWLElBQUEsR0FBTSxTQUFBO2FBQ0osSUFBQyxDQUFBLFFBQUQsQ0FBQTtJQURJOzt3QkFHTixVQUFBLEdBQVksU0FBQTthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsSUFBdEM7SUFEVTs7d0JBR1osR0FBQSxHQUFLLFNBQUE7YUFDSCxJQUFDLENBQUEsVUFBRCxDQUFBO0lBREc7O3dCQUdMLFlBQUEsR0FBYyxTQUFBO2FBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixFQUFzQyxLQUF0QztJQURZOzt3QkFHZCxLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxZQUFELENBQUE7SUFESzs7d0JBR1AsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDLElBQXRDO0lBRFU7O3dCQUdaLEVBQUEsR0FBSSxTQUFBO2FBQ0YsSUFBQyxDQUFBLFVBQUQsQ0FBQTtJQURFOzt3QkFHSixZQUFBLEdBQWMsU0FBQTthQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixvQkFBaEIsRUFBc0MsS0FBdEM7SUFEWTs7d0JBR2QsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsWUFBRCxDQUFBO0lBREk7O3dCQUdOLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGdDQUFoQixFQUFrRCxJQUFsRDtJQURTOzt3QkFHWCxHQUFBLEdBQUssU0FBQTthQUNILElBQUMsQ0FBQSxTQUFELENBQUE7SUFERzs7d0JBR0wsV0FBQSxHQUFhLFNBQUE7YUFDWCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsZ0NBQWhCLEVBQWtELEtBQWxEO0lBRFc7O3dCQUdiLEtBQUEsR0FBTyxTQUFBO2FBQ0wsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQURLOzt3QkFHUCxRQUFBLEdBQVUsU0FBQTthQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsRUFBb0MsSUFBcEM7SUFEUTs7d0JBR1YsVUFBQSxHQUFZLFNBQUE7YUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isa0JBQWhCLEVBQW9DLEtBQXBDO0lBRFU7Ozs7OztFQUdkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBaEVqQiIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFZpbU9wdGlvblxuICBAc2luZ2xldG9uOiA9PlxuICAgIEBvcHRpb24gfHw9IG5ldyBWaW1PcHRpb25cblxuICBsaXN0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93SW52aXNpYmxlc1wiLCB0cnVlKVxuXG4gIG5vbGlzdDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJlZGl0b3Iuc2hvd0ludmlzaWJsZXNcIiwgZmFsc2UpXG5cbiAgbnVtYmVyOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImVkaXRvci5zaG93TGluZU51bWJlcnNcIiwgdHJ1ZSlcblxuICBudTogPT5cbiAgICBAbnVtYmVyKClcblxuICBub251bWJlcjogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJlZGl0b3Iuc2hvd0xpbmVOdW1iZXJzXCIsIGZhbHNlKVxuXG4gIG5vbnU6ID0+XG4gICAgQG5vbnVtYmVyKClcblxuICBzcGxpdHJpZ2h0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRyaWdodFwiLCB0cnVlKVxuXG4gIHNwcjogPT5cbiAgICBAc3BsaXRyaWdodCgpXG5cbiAgbm9zcGxpdHJpZ2h0OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRyaWdodFwiLCBmYWxzZSlcblxuICBub3NwcjogPT5cbiAgICBAbm9zcGxpdHJpZ2h0KClcblxuICBzcGxpdGJlbG93OiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcImV4LW1vZGUuc3BsaXRiZWxvd1wiLCB0cnVlKVxuXG4gIHNiOiA9PlxuICAgIEBzcGxpdGJlbG93KClcblxuICBub3NwbGl0YmVsb3c6ID0+XG4gICAgYXRvbS5jb25maWcuc2V0KFwiZXgtbW9kZS5zcGxpdGJlbG93XCIsIGZhbHNlKVxuXG4gIG5vc2I6ID0+XG4gICAgQG5vc3BsaXRiZWxvdygpXG5cbiAgc21hcnRjYXNlOiA9PlxuICAgIGF0b20uY29uZmlnLnNldChcInZpbS1tb2RlLnVzZVNtYXJ0Y2FzZUZvclNlYXJjaFwiLCB0cnVlKVxuXG4gIHNjczogPT5cbiAgICBAc21hcnRjYXNlKClcblxuICBub3NtYXJ0Y2FzZTogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJ2aW0tbW9kZS51c2VTbWFydGNhc2VGb3JTZWFyY2hcIiwgZmFsc2UpXG5cbiAgbm9zY3M6ID0+XG4gICAgQG5vc21hcnRjYXNlKClcblxuICBnZGVmYXVsdDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLmdkZWZhdWx0XCIsIHRydWUpXG5cbiAgbm9nZGVmYXVsdDogPT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJleC1tb2RlLmdkZWZhdWx0XCIsIGZhbHNlKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZpbU9wdGlvblxuIl19
