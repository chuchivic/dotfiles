(function() {
  var $, GitTimeplotPopup, RevisionView, View, moment, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  moment = require('moment');

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  RevisionView = require('./git-revision-view');

  module.exports = GitTimeplotPopup = (function(superClass) {
    extend(GitTimeplotPopup, superClass);

    function GitTimeplotPopup() {
      this._onShowRevision = bind(this._onShowRevision, this);
      this._onMouseLeave = bind(this._onMouseLeave, this);
      this._onMouseEnter = bind(this._onMouseEnter, this);
      this.isMouseInPopup = bind(this.isMouseInPopup, this);
      this.remove = bind(this.remove, this);
      this.hide = bind(this.hide, this);
      return GitTimeplotPopup.__super__.constructor.apply(this, arguments);
    }

    GitTimeplotPopup.content = function(commitData, editor, start, end) {
      var dateFormat;
      dateFormat = "MMM DD YYYY ha";
      return this.div({
        "class": "select-list popover-list git-timemachine-popup"
      }, (function(_this) {
        return function() {
          _this.h5("There were " + commitData.length + " commits between");
          _this.h6((start.format(dateFormat)) + " and " + (end.format(dateFormat)));
          return _this.ul(function() {
            var authorDate, commit, i, len, linesAdded, linesDeleted, results;
            results = [];
            for (i = 0, len = commitData.length; i < len; i++) {
              commit = commitData[i];
              authorDate = moment.unix(commit.authorDate);
              linesAdded = commit.linesAdded || 0;
              linesDeleted = commit.linesDeleted || 0;
              results.push(_this.li({
                "data-rev": commit.hash,
                click: '_onShowRevision'
              }, function() {
                return _this.div({
                  "class": "commit"
                }, function() {
                  _this.div({
                    "class": "header"
                  }, function() {
                    _this.div("" + (authorDate.format(dateFormat)));
                    _this.div("" + commit.hash);
                    return _this.div(function() {
                      _this.span({
                        "class": 'added-count'
                      }, "+" + linesAdded + " ");
                      return _this.span({
                        "class": 'removed-count'
                      }, "-" + linesDeleted + " ");
                    });
                  });
                  _this.div(function() {
                    return _this.strong("" + commit.message);
                  });
                  return _this.div("Authored by " + commit.authorName + " " + (authorDate.fromNow()));
                });
              }));
            }
            return results;
          });
        };
      })(this));
    };

    GitTimeplotPopup.prototype.initialize = function(commitData, editor1) {
      this.editor = editor1;
      this.file = this.editor.getPath();
      this.appendTo(atom.views.getView(atom.workspace));
      this.mouseenter(this._onMouseEnter);
      return this.mouseleave(this._onMouseLeave);
    };

    GitTimeplotPopup.prototype.hide = function() {
      this._mouseInPopup = false;
      return GitTimeplotPopup.__super__.hide.apply(this, arguments);
    };

    GitTimeplotPopup.prototype.remove = function() {
      if (!this._mouseInPopup) {
        return GitTimeplotPopup.__super__.remove.apply(this, arguments);
      }
    };

    GitTimeplotPopup.prototype.isMouseInPopup = function() {
      return this._mouseInPopup === true;
    };

    GitTimeplotPopup.prototype._onMouseEnter = function(evt) {
      this._mouseInPopup = true;
    };

    GitTimeplotPopup.prototype._onMouseLeave = function(evt) {
      this.hide();
    };

    GitTimeplotPopup.prototype._onShowRevision = function(evt) {
      var revHash;
      revHash = $(evt.target).closest('li').data('rev');
      return RevisionView.showRevision(this.editor, revHash);
    };

    return GitTimeplotPopup;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9saWIvZ2l0LXRpbWVwbG90LXBvcHVwLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0RBQUE7SUFBQTs7OztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxNQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsU0FBRCxFQUFJOztFQUVKLFlBQUEsR0FBZSxPQUFBLENBQVEscUJBQVI7O0VBR2YsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7Ozs7Ozs7SUFFckIsZ0JBQUMsQ0FBQSxPQUFELEdBQVcsU0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixLQUFyQixFQUE0QixHQUE1QjtBQUNULFVBQUE7TUFBQSxVQUFBLEdBQWE7YUFDYixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnREFBUDtPQUFMLEVBQThELENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUM1RCxLQUFDLENBQUEsRUFBRCxDQUFJLGFBQUEsR0FBYyxVQUFVLENBQUMsTUFBekIsR0FBZ0Msa0JBQXBDO1VBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBTSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsVUFBYixDQUFELENBQUEsR0FBMEIsT0FBMUIsR0FBZ0MsQ0FBQyxHQUFHLENBQUMsTUFBSixDQUFXLFVBQVgsQ0FBRCxDQUF0QztpQkFDQSxLQUFDLENBQUEsRUFBRCxDQUFJLFNBQUE7QUFDRixnQkFBQTtBQUFBO2lCQUFBLDRDQUFBOztjQUNFLFVBQUEsR0FBYSxNQUFNLENBQUMsSUFBUCxDQUFZLE1BQU0sQ0FBQyxVQUFuQjtjQUNiLFVBQUEsR0FBYSxNQUFNLENBQUMsVUFBUCxJQUFxQjtjQUNsQyxZQUFBLEdBQWUsTUFBTSxDQUFDLFlBQVAsSUFBdUI7MkJBQ3RDLEtBQUMsQ0FBQSxFQUFELENBQUk7Z0JBQUEsVUFBQSxFQUFZLE1BQU0sQ0FBQyxJQUFuQjtnQkFBeUIsS0FBQSxFQUFPLGlCQUFoQztlQUFKLEVBQXVELFNBQUE7dUJBQ3JELEtBQUMsQ0FBQSxHQUFELENBQUs7a0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO2lCQUFMLEVBQXNCLFNBQUE7a0JBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUs7b0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO21CQUFMLEVBQXNCLFNBQUE7b0JBQ3BCLEtBQUMsQ0FBQSxHQUFELENBQUssRUFBQSxHQUFFLENBQUMsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsVUFBbEIsQ0FBRCxDQUFQO29CQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssRUFBQSxHQUFHLE1BQU0sQ0FBQyxJQUFmOzJCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTtzQkFDSCxLQUFDLENBQUEsSUFBRCxDQUFNO3dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDt1QkFBTixFQUE0QixHQUFBLEdBQUksVUFBSixHQUFlLEdBQTNDOzZCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07d0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxlQUFQO3VCQUFOLEVBQThCLEdBQUEsR0FBSSxZQUFKLEdBQWlCLEdBQS9DO29CQUZHLENBQUw7a0JBSG9CLENBQXRCO2tCQU9BLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQTsyQkFDSCxLQUFDLENBQUEsTUFBRCxDQUFRLEVBQUEsR0FBRyxNQUFNLENBQUMsT0FBbEI7a0JBREcsQ0FBTDt5QkFHQSxLQUFDLENBQUEsR0FBRCxDQUFLLGNBQUEsR0FBZSxNQUFNLENBQUMsVUFBdEIsR0FBaUMsR0FBakMsR0FBbUMsQ0FBQyxVQUFVLENBQUMsT0FBWCxDQUFBLENBQUQsQ0FBeEM7Z0JBWG9CLENBQXRCO2NBRHFELENBQXZEO0FBSkY7O1VBREUsQ0FBSjtRQUg0RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUQ7SUFGUzs7K0JBeUJYLFVBQUEsR0FBWSxTQUFDLFVBQUQsRUFBYSxPQUFiO01BQWEsSUFBQyxDQUFBLFNBQUQ7TUFDdkIsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVIsQ0FBQTtNQUNSLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFWO01BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsYUFBYjthQUNBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLGFBQWI7SUFKVTs7K0JBT1osSUFBQSxHQUFNLFNBQUE7TUFDSixJQUFDLENBQUEsYUFBRCxHQUFpQjthQUNqQiw0Q0FBQSxTQUFBO0lBRkk7OytCQUtOLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBQSxDQUFPLElBQUMsQ0FBQSxhQUFSO2VBQ0UsOENBQUEsU0FBQSxFQURGOztJQURNOzsrQkFLUixjQUFBLEdBQWdCLFNBQUE7QUFDZCxhQUFPLElBQUMsQ0FBQSxhQUFELEtBQWtCO0lBRFg7OytCQUloQixhQUFBLEdBQWUsU0FBQyxHQUFEO01BRWIsSUFBQyxDQUFBLGFBQUQsR0FBaUI7SUFGSjs7K0JBTWYsYUFBQSxHQUFlLFNBQUMsR0FBRDtNQUNiLElBQUMsQ0FBQSxJQUFELENBQUE7SUFEYTs7K0JBS2YsZUFBQSxHQUFpQixTQUFDLEdBQUQ7QUFDZixVQUFBO01BQUEsT0FBQSxHQUFVLENBQUEsQ0FBRSxHQUFHLENBQUMsTUFBTixDQUFhLENBQUMsT0FBZCxDQUFzQixJQUF0QixDQUEyQixDQUFDLElBQTVCLENBQWlDLEtBQWpDO2FBQ1YsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQTNCLEVBQW1DLE9BQW5DO0lBRmU7Ozs7S0EzRDZCO0FBTmhEIiwic291cmNlc0NvbnRlbnQiOlsibW9tZW50ID0gcmVxdWlyZSAnbW9tZW50J1xueyQsIFZpZXd9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcblxuUmV2aXNpb25WaWV3ID0gcmVxdWlyZSAnLi9naXQtcmV2aXNpb24tdmlldydcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdpdFRpbWVwbG90UG9wdXAgZXh0ZW5kcyBWaWV3XG5cbiAgQGNvbnRlbnQgPSAoY29tbWl0RGF0YSwgZWRpdG9yLCBzdGFydCwgZW5kKSAtPlxuICAgIGRhdGVGb3JtYXQgPSBcIk1NTSBERCBZWVlZIGhhXCJcbiAgICBAZGl2IGNsYXNzOiBcInNlbGVjdC1saXN0IHBvcG92ZXItbGlzdCBnaXQtdGltZW1hY2hpbmUtcG9wdXBcIiwgPT5cbiAgICAgIEBoNSBcIlRoZXJlIHdlcmUgI3tjb21taXREYXRhLmxlbmd0aH0gY29tbWl0cyBiZXR3ZWVuXCJcbiAgICAgIEBoNiBcIiN7c3RhcnQuZm9ybWF0KGRhdGVGb3JtYXQpfSBhbmQgI3tlbmQuZm9ybWF0KGRhdGVGb3JtYXQpfVwiXG4gICAgICBAdWwgPT5cbiAgICAgICAgZm9yIGNvbW1pdCBpbiBjb21taXREYXRhXG4gICAgICAgICAgYXV0aG9yRGF0ZSA9IG1vbWVudC51bml4KGNvbW1pdC5hdXRob3JEYXRlKVxuICAgICAgICAgIGxpbmVzQWRkZWQgPSBjb21taXQubGluZXNBZGRlZCB8fCAwXG4gICAgICAgICAgbGluZXNEZWxldGVkID0gY29tbWl0LmxpbmVzRGVsZXRlZCB8fCAwXG4gICAgICAgICAgQGxpIFwiZGF0YS1yZXZcIjogY29tbWl0Lmhhc2gsIGNsaWNrOiAnX29uU2hvd1JldmlzaW9uJywgPT5cbiAgICAgICAgICAgIEBkaXYgY2xhc3M6IFwiY29tbWl0XCIsID0+XG4gICAgICAgICAgICAgIEBkaXYgY2xhc3M6IFwiaGVhZGVyXCIsID0+XG4gICAgICAgICAgICAgICAgQGRpdiBcIiN7YXV0aG9yRGF0ZS5mb3JtYXQoZGF0ZUZvcm1hdCl9XCJcbiAgICAgICAgICAgICAgICBAZGl2IFwiI3tjb21taXQuaGFzaH1cIlxuICAgICAgICAgICAgICAgIEBkaXYgPT5cbiAgICAgICAgICAgICAgICAgIEBzcGFuIGNsYXNzOiAnYWRkZWQtY291bnQnLCBcIisje2xpbmVzQWRkZWR9IFwiXG4gICAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczogJ3JlbW92ZWQtY291bnQnLCBcIi0je2xpbmVzRGVsZXRlZH0gXCJcblxuICAgICAgICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgICAgICAgQHN0cm9uZyBcIiN7Y29tbWl0Lm1lc3NhZ2V9XCJcblxuICAgICAgICAgICAgICBAZGl2IFwiQXV0aG9yZWQgYnkgI3tjb21taXQuYXV0aG9yTmFtZX0gI3thdXRob3JEYXRlLmZyb21Ob3coKX1cIlxuXG5cbiAgaW5pdGlhbGl6ZTogKGNvbW1pdERhdGEsIEBlZGl0b3IpIC0+XG4gICAgQGZpbGUgPSBAZWRpdG9yLmdldFBhdGgoKVxuICAgIEBhcHBlbmRUbyBhdG9tLnZpZXdzLmdldFZpZXcgYXRvbS53b3Jrc3BhY2VcbiAgICBAbW91c2VlbnRlciBAX29uTW91c2VFbnRlclxuICAgIEBtb3VzZWxlYXZlIEBfb25Nb3VzZUxlYXZlXG5cbiAgICBcbiAgaGlkZTogKCkgPT5cbiAgICBAX21vdXNlSW5Qb3B1cCA9IGZhbHNlXG4gICAgc3VwZXJcblxuXG4gIHJlbW92ZTogKCkgPT5cbiAgICB1bmxlc3MgQF9tb3VzZUluUG9wdXBcbiAgICAgIHN1cGVyXG5cblxuICBpc01vdXNlSW5Qb3B1cDogKCkgPT5cbiAgICByZXR1cm4gQF9tb3VzZUluUG9wdXAgPT0gdHJ1ZVxuXG5cbiAgX29uTW91c2VFbnRlcjogKGV2dCkgPT5cbiAgICAjIGNvbnNvbGUubG9nICdtb3VzZSBpbiBwb3B1cCdcbiAgICBAX21vdXNlSW5Qb3B1cCA9IHRydWVcbiAgICByZXR1cm5cblxuXG4gIF9vbk1vdXNlTGVhdmU6IChldnQpID0+XG4gICAgQGhpZGUoKVxuICAgIHJldHVyblxuXG5cbiAgX29uU2hvd1JldmlzaW9uOiAoZXZ0KSA9PlxuICAgIHJldkhhc2ggPSAkKGV2dC50YXJnZXQpLmNsb3Nlc3QoJ2xpJykuZGF0YSgncmV2JylcbiAgICBSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uKEBlZGl0b3IsIHJldkhhc2gpXG5cbiJdfQ==
