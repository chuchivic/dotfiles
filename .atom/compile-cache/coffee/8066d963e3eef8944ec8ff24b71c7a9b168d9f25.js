(function() {
  var $, GitTimeplot, GitTimeplotPopup, RevisionView, View, _, d3, moment, ref;

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  _ = require('underscore-plus');

  moment = require('moment');

  d3 = require('d3');

  GitTimeplotPopup = require('./git-timeplot-popup');

  RevisionView = require('./git-revision-view');

  module.exports = GitTimeplot = (function() {
    function GitTimeplot(element) {
      this.element = element;
      this.$element = $(this.element);
      this._debouncedRenderPopup = _.debounce(this._renderPopup, 50);
      this._debouncedHidePopup = _.debounce(this._hidePopup, 50);
      this._debouncedViewNearestRevision = _.debounce(this._viewNearestRevision, 100);
    }

    GitTimeplot.prototype.hide = function() {
      var ref1;
      return (ref1 = this.popup) != null ? ref1.remove() : void 0;
    };

    GitTimeplot.prototype.show = function() {};

    GitTimeplot.prototype.render = function(editor, commitData) {
      var ref1, svg;
      this.editor = editor;
      this.commitData = commitData;
      if ((ref1 = this.popup) != null) {
        ref1.remove();
      }
      this.file = this.editor.getPath();
      this.$timeplot = this.$element.find('.timeplot');
      if (this.$timeplot.length <= 0) {
        this.$timeplot = $("<div class='timeplot'>");
        this.$element.append(this.$timeplot);
      }
      if (this.commitData.length <= 0) {
        this.$timeplot.html("<div class='placeholder'>No commits, nothing to see here.</div>");
        return;
      }
      svg = d3.select(this.$timeplot.get(0)).append("svg").attr("width", this.$element.width()).attr("height", 100);
      this._renderAxis(svg);
      this._renderBlobs(svg);
      this._renderHoverMarker();
      return this.$timeplot;
    };

    GitTimeplot.prototype._renderAxis = function(svg) {
      var h, left_pad, maxDate, maxHour, minDate, minHour, pad, w, xAxis, yAxis;
      w = this.$element.width();
      h = 100;
      left_pad = 20;
      pad = 20;
      minDate = moment.unix(this.commitData[this.commitData.length - 1].authorDate).toDate();
      maxDate = moment.unix(this.commitData[0].authorDate).toDate();
      minHour = d3.min(this.commitData.map(function(d) {
        return moment.unix(d.authorDate).hour();
      }));
      maxHour = d3.max(this.commitData.map(function(d) {
        return moment.unix(d.authorDate).hour();
      }));
      this.x = d3.time.scale().domain([minDate, maxDate]).range([left_pad, w - pad]);
      this.y = d3.scale.linear().domain([minHour, maxHour]).range([10, h - pad * 2]);
      xAxis = d3.svg.axis().scale(this.x).orient("bottom");
      yAxis = d3.svg.axis().scale(this.y).orient("left").ticks(0);
      svg.append("g").attr("class", "axis").attr("transform", "translate(0, " + (h - pad) + ")").call(xAxis);
      return svg.append("g").attr("class", "axis").attr("transform", "translate(" + (left_pad - pad) + ", 0)").call(yAxis);
    };

    GitTimeplot.prototype._renderBlobs = function(svg) {
      var max_r, r;
      max_r = d3.max(this.commitData.map(function(d) {
        return d.linesAdded + d.linesDeleted;
      }));
      r = d3.scale.linear().domain([0, max_r]).range([3, 15]);
      return svg.selectAll("circle").data(this.commitData).enter().append("circle").attr("class", "circle").attr("cx", (function(_this) {
        return function(d) {
          return _this.x(moment.unix(d.authorDate).toDate());
        };
      })(this)).attr("cy", (function(_this) {
        return function(d) {
          return _this.y(moment.unix(d.authorDate).hour());
        };
      })(this)).transition().duration(500).attr("r", function(d) {
        return r(d.linesAdded + d.linesDeleted || 0);
      });
    };

    GitTimeplot.prototype._renderHoverMarker = function() {
      var _this;
      this.$hoverMarker = this.$element.find('.hover-marker');
      if (!(this.$hoverMarker.length > 0)) {
        this.$hoverMarker = $("<div class='hover-marker'>");
        this.$element.append(this.$hoverMarker);
      }
      _this = this;
      this.$element.mouseenter(function(e) {
        return _this._onMouseenter(e);
      });
      this.$element.mousemove(function(e) {
        return _this._onMousemove(e);
      });
      this.$element.mouseleave(function(e) {
        return _this._onMouseleave(e);
      });
      this.$element.mousedown(function(e) {
        return _this._onMousedown(e);
      });
      return this.$element.mouseup(function(e) {
        return _this._onMouseup(e);
      });
    };

    GitTimeplot.prototype._onMouseenter = function(evt) {
      return this.isMouseInElement = true;
    };

    GitTimeplot.prototype._onMousemove = function(evt) {
      var relativeX;
      relativeX = evt.clientX - this.$element.offset().left;
      if (relativeX < this.$hoverMarker.offset().left) {
        this.$hoverMarker.css('left', relativeX);
      } else {
        this.$hoverMarker.css('left', relativeX - this.$hoverMarker.width());
      }
      if (this.isMouseDown) {
        this._hidePopup({
          force: true
        });
        return this._debouncedViewNearestRevision();
      } else {
        return this._debouncedRenderPopup();
      }
    };

    GitTimeplot.prototype._onMouseleave = function(evt) {
      this.isMouseInElement = false;
      this._debouncedHidePopup();
      return this.isMouseDown = false;
    };

    GitTimeplot.prototype._onMousedown = function(evt) {
      this.isMouseDown = true;
      this._hidePopup({
        force: true
      });
      return this._debouncedViewNearestRevision();
    };

    GitTimeplot.prototype._onMouseup = function(evt) {
      return this.isMouseDown = false;
    };

    GitTimeplot.prototype._renderPopup = function() {
      var commits, end, left, ref1, ref2, ref3, start;
      if ((ref1 = this.popup) != null ? ref1.isMouseInPopup() : void 0) {
        left = this.popup.offset().left - this.$element.offset().left;
        if (this._popupRightAligned) {
          left += this.popup.width() + 7;
        }
        this.$hoverMarker.css({
          'left': left
        });
        return;
      }
      if (!this.isMouseInElement) {
        return;
      }
      if ((ref2 = this.popup) != null) {
        ref2.hide().remove();
      }
      ref3 = this._filterCommitData(this.commitData), commits = ref3[0], start = ref3[1], end = ref3[2];
      this.popup = new GitTimeplotPopup(commits, this.editor, start, end);
      left = this.$hoverMarker.offset().left;
      if (left + this.popup.outerWidth() + 10 > this.$element.offset().left + this.$element.width()) {
        this._popupRightAligned = true;
        left -= this.popup.width() + 7;
      } else {
        this._popupRightAligned = false;
      }
      return this.popup.css({
        left: left,
        top: this.$element.offset().top - this.popup.height() - 10
      });
    };

    GitTimeplot.prototype._hidePopup = function(options) {
      var ref1, ref2;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        force: false
      });
      if (!options.force && (((ref1 = this.popup) != null ? ref1.isMouseInPopup() : void 0) || this.isMouseInElement)) {
        return;
      }
      return (ref2 = this.popup) != null ? ref2.hide().remove() : void 0;
    };

    GitTimeplot.prototype._filterCommitData = function() {
      var commits, left, relativeLeft, tEnd, tStart;
      left = this.$hoverMarker.offset().left;
      relativeLeft = left - this.$element.offset().left - 5;
      tStart = moment(this.x.invert(relativeLeft)).startOf('hour').subtract(1, 'minute');
      tEnd = moment(this.x.invert(relativeLeft + 10)).endOf('hour').add(1, 'minute');
      commits = _.filter(this.commitData, function(c) {
        return moment.unix(c.authorDate).isBetween(tStart, tEnd);
      });
      return [commits, tStart, tEnd];
    };

    GitTimeplot.prototype._getNearestCommit = function() {
      var filteredCommitData, ref1, tEnd, tStart;
      ref1 = this._filterCommitData(), filteredCommitData = ref1[0], tStart = ref1[1], tEnd = ref1[2];
      if ((filteredCommitData != null ? filteredCommitData.length : void 0) > 0) {
        return filteredCommitData[0];
      } else {
        return _.find(this.commitData, function(c) {
          return moment.unix(c.authorDate).isBefore(tEnd);
        });
      }
    };

    GitTimeplot.prototype._viewNearestRevision = function() {
      var nearestCommit;
      nearestCommit = this._getNearestCommit();
      if (nearestCommit != null) {
        return RevisionView.showRevision(this.editor, nearestCommit.hash);
      }
    };

    return GitTimeplot;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9saWIvZ2l0LXRpbWVwbG90LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFDSixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFDVCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixZQUFBLEdBQWUsT0FBQSxDQUFRLHFCQUFSOztFQUlmLE1BQU0sQ0FBQyxPQUFQLEdBQXVCO0lBRVIscUJBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO01BQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFBLENBQUUsSUFBQyxDQUFBLE9BQUg7TUFDWixJQUFDLENBQUEscUJBQUQsR0FBeUIsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFDLENBQUEsWUFBWixFQUEwQixFQUExQjtNQUN6QixJQUFDLENBQUEsbUJBQUQsR0FBdUIsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFDLENBQUEsVUFBWixFQUF3QixFQUF4QjtNQUN2QixJQUFDLENBQUEsNkJBQUQsR0FBaUMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxJQUFDLENBQUEsb0JBQVosRUFBa0MsR0FBbEM7SUFKdEI7OzBCQU9iLElBQUEsR0FBTSxTQUFBO0FBQ0osVUFBQTsrQ0FBTSxDQUFFLE1BQVIsQ0FBQTtJQURJOzswQkFJTixJQUFBLEdBQU0sU0FBQSxHQUFBOzswQkFNTixNQUFBLEdBQVEsU0FBQyxNQUFELEVBQVUsVUFBVjtBQUNOLFVBQUE7TUFETyxJQUFDLENBQUEsU0FBRDtNQUFTLElBQUMsQ0FBQSxhQUFEOztZQUNWLENBQUUsTUFBUixD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QyxRQUExQixDQUFtQyxJQUFuQztRQUFQLENBQXBCLEVBSFQ7O0lBRmlCOzswQkFRbkIsb0JBQUEsR0FBc0IsU0FBQTtBQUNwQixVQUFBO01BQUEsYUFBQSxHQUFpQixJQUFDLENBQUEsaUJBQUQsQ0FBQTtNQUNqQixJQUFHLHFCQUFIO2VBQ0UsWUFBWSxDQUFDLFlBQWIsQ0FBMEIsSUFBQyxDQUFBLE1BQTNCLEVBQW1DLGFBQWEsQ0FBQyxJQUFqRCxFQURGOztJQUZvQjs7Ozs7QUE3TXhCIiwic291cmNlc0NvbnRlbnQiOlsiXG57JCwgVmlld30gPSByZXF1aXJlIFwiYXRvbS1zcGFjZS1wZW4tdmlld3NcIlxuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbm1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbmQzID0gcmVxdWlyZSAnZDMnXG5cbkdpdFRpbWVwbG90UG9wdXAgPSByZXF1aXJlICcuL2dpdC10aW1lcGxvdC1wb3B1cCdcblJldmlzaW9uVmlldyA9IHJlcXVpcmUgJy4vZ2l0LXJldmlzaW9uLXZpZXcnXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEdpdFRpbWVwbG90XG5cbiAgY29uc3RydWN0b3I6IChAZWxlbWVudCkgLT5cbiAgICBAJGVsZW1lbnQgPSAkKEBlbGVtZW50KVxuICAgIEBfZGVib3VuY2VkUmVuZGVyUG9wdXAgPSBfLmRlYm91bmNlKEBfcmVuZGVyUG9wdXAsIDUwKVxuICAgIEBfZGVib3VuY2VkSGlkZVBvcHVwID0gXy5kZWJvdW5jZShAX2hpZGVQb3B1cCwgNTApXG4gICAgQF9kZWJvdW5jZWRWaWV3TmVhcmVzdFJldmlzaW9uID0gXy5kZWJvdW5jZShAX3ZpZXdOZWFyZXN0UmV2aXNpb24sIDEwMClcblxuXG4gIGhpZGU6ICgpIC0+XG4gICAgQHBvcHVwPy5yZW1vdmUoKVxuXG5cbiAgc2hvdzogKCkgLT5cbiAgICAjICBub3RoaW5nIHRvIGRvIGhlcmVcblxuXG4gICMgQGNvbW1pdERhdGEgLSBhcnJheSBvZiBqYXZhc2NyaXB0IG9iamVjdHMgbGlrZSB0aG9zZSByZXR1cm5lZCBieSBHaXRVdGlscy5nZXRGaWxlQ29tbWl0SGlzdG9yeVxuICAjICAgICAgICAgICAgICAgc2hvdWxkIGJlIGluIHJldmVyc2UgY2hyb24gb3JkZXJcbiAgcmVuZGVyOiAoQGVkaXRvciwgQGNvbW1pdERhdGEpIC0+XG4gICAgQHBvcHVwPy5yZW1vdmUoKVxuXG4gICAgQGZpbGUgPSBAZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgQCR0aW1lcGxvdCA9IEAkZWxlbWVudC5maW5kKCcudGltZXBsb3QnKVxuICAgIGlmIEAkdGltZXBsb3QubGVuZ3RoIDw9IDBcbiAgICAgIEAkdGltZXBsb3QgPSAkKFwiPGRpdiBjbGFzcz0ndGltZXBsb3QnPlwiKVxuICAgICAgQCRlbGVtZW50LmFwcGVuZCBAJHRpbWVwbG90XG5cbiAgICBpZiBAY29tbWl0RGF0YS5sZW5ndGggPD0gMFxuICAgICAgQCR0aW1lcGxvdC5odG1sKFwiPGRpdiBjbGFzcz0ncGxhY2Vob2xkZXInPk5vIGNvbW1pdHMsIG5vdGhpbmcgdG8gc2VlIGhlcmUuPC9kaXY+XCIpXG4gICAgICByZXR1cm47XG5cbiAgICBzdmcgPSBkMy5zZWxlY3QoQCR0aW1lcGxvdC5nZXQoMCkpXG4gICAgLmFwcGVuZChcInN2Z1wiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgQCRlbGVtZW50LndpZHRoKCkpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgMTAwKVxuXG4gICAgQF9yZW5kZXJBeGlzKHN2ZylcbiAgICBAX3JlbmRlckJsb2JzKHN2ZylcblxuICAgIEBfcmVuZGVySG92ZXJNYXJrZXIoKVxuXG4gICAgcmV0dXJuIEAkdGltZXBsb3Q7XG5cblxuICBfcmVuZGVyQXhpczogKHN2ZykgLT5cbiAgICB3ID0gQCRlbGVtZW50LndpZHRoKClcbiAgICBoID0gMTAwXG4gICAgbGVmdF9wYWQgPSAyMFxuICAgIHBhZCA9IDIwXG4gICAgbWluRGF0ZSA9IG1vbWVudC51bml4KEBjb21taXREYXRhW0Bjb21taXREYXRhLmxlbmd0aC0xXS5hdXRob3JEYXRlKS50b0RhdGUoKVxuICAgIG1heERhdGUgPSBtb21lbnQudW5peChAY29tbWl0RGF0YVswXS5hdXRob3JEYXRlKS50b0RhdGUoKVxuICAgIG1pbkhvdXIgPSBkMy5taW4oQGNvbW1pdERhdGEubWFwKChkKS0+bW9tZW50LnVuaXgoZC5hdXRob3JEYXRlKS5ob3VyKCkpKVxuICAgIG1heEhvdXIgPSBkMy5tYXgoQGNvbW1pdERhdGEubWFwKChkKS0+bW9tZW50LnVuaXgoZC5hdXRob3JEYXRlKS5ob3VyKCkpKVxuXG4gICAgQHggPSBkMy50aW1lLnNjYWxlKCkuZG9tYWluKFttaW5EYXRlLCBtYXhEYXRlXSkucmFuZ2UoW2xlZnRfcGFkLCB3LXBhZF0pXG4gICAgQHkgPSBkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oW21pbkhvdXIsIG1heEhvdXJdKS5yYW5nZShbMTAsIGgtcGFkKjJdKVxuXG4gICAgeEF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKEB4KS5vcmllbnQoXCJib3R0b21cIilcbiAgICB5QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoQHkpLm9yaWVudChcImxlZnRcIikudGlja3MoMClcblxuICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImF4aXNcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCAje2gtcGFkfSlcIilcbiAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJheGlzXCIpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoI3tsZWZ0X3BhZC1wYWR9LCAwKVwiKVxuICAgIC5jYWxsKHlBeGlzKTtcblxuXG4gIF9yZW5kZXJCbG9iczogKHN2ZykgLT5cbiAgICBtYXhfciA9IGQzLm1heChAY29tbWl0RGF0YS5tYXAoKGQpLT5yZXR1cm4gZC5saW5lc0FkZGVkICsgZC5saW5lc0RlbGV0ZWQpKVxuICAgIHIgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgIC5kb21haW4oWzAsIG1heF9yXSlcbiAgICAucmFuZ2UoWzMsIDE1XSlcblxuICAgIHN2Zy5zZWxlY3RBbGwoXCJjaXJjbGVcIilcbiAgICAuZGF0YShAY29tbWl0RGF0YSlcbiAgICAuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwiY2lyY2xlXCIpXG4gICAgLmF0dHIoXCJjeFwiLCAoZCk9PiBAeChtb21lbnQudW5peChkLmF1dGhvckRhdGUpLnRvRGF0ZSgpKSlcbiAgICAuYXR0cihcImN5XCIsIChkKT0+IEB5KG1vbWVudC51bml4KGQuYXV0aG9yRGF0ZSkuaG91cigpKSlcbiAgICAudHJhbnNpdGlvbigpXG4gICAgLmR1cmF0aW9uKDUwMClcbiAgICAuYXR0cihcInJcIiwgKGQpIC0+IHIoZC5saW5lc0FkZGVkICsgZC5saW5lc0RlbGV0ZWQgfHwgMCkpXG5cblxuICAjIGhvdmVyIG1hcmtlciBpcyB0aGUgZ3JlZW4gdmVydGljYWwgbGluZSB0aGF0IGZvbGxvd3MgdGhlIG1vdXNlIG9uIHRoZSB0aW1lcGxvdFxuICBfcmVuZGVySG92ZXJNYXJrZXI6ICgpIC0+XG4gICAgQCRob3Zlck1hcmtlciA9IEAkZWxlbWVudC5maW5kKCcuaG92ZXItbWFya2VyJylcbiAgICB1bmxlc3MgQCRob3Zlck1hcmtlci5sZW5ndGggPiAwXG4gICAgICBAJGhvdmVyTWFya2VyID0gJChcIjxkaXYgY2xhc3M9J2hvdmVyLW1hcmtlcic+XCIpXG4gICAgICBAJGVsZW1lbnQuYXBwZW5kKEAkaG92ZXJNYXJrZXIpXG5cbiAgICBfdGhpcyA9IEBcbiAgICBAJGVsZW1lbnQubW91c2VlbnRlciAoZSkgLT4gX3RoaXMuX29uTW91c2VlbnRlcihlKVxuICAgIEAkZWxlbWVudC5tb3VzZW1vdmUgKGUpIC0+IF90aGlzLl9vbk1vdXNlbW92ZShlKVxuICAgIEAkZWxlbWVudC5tb3VzZWxlYXZlIChlKSAtPiBfdGhpcy5fb25Nb3VzZWxlYXZlKGUpXG4gICAgQCRlbGVtZW50Lm1vdXNlZG93biAoZSkgLT4gX3RoaXMuX29uTW91c2Vkb3duKGUpXG4gICAgQCRlbGVtZW50Lm1vdXNldXAgKGUpIC0+IF90aGlzLl9vbk1vdXNldXAoZSlcblxuXG4gIF9vbk1vdXNlZW50ZXI6IChldnQpIC0+XG4gICAgQGlzTW91c2VJbkVsZW1lbnQgPSB0cnVlXG5cblxuICBfb25Nb3VzZW1vdmU6IChldnQpIC0+XG4gICAgcmVsYXRpdmVYID0gZXZ0LmNsaWVudFggLSBAJGVsZW1lbnQub2Zmc2V0KCkubGVmdFxuICAgIGlmIHJlbGF0aXZlWCA8IEAkaG92ZXJNYXJrZXIub2Zmc2V0KCkubGVmdFxuICAgICAgQCRob3Zlck1hcmtlci5jc3MoJ2xlZnQnLCByZWxhdGl2ZVgpXG4gICAgZWxzZVxuICAgICAgQCRob3Zlck1hcmtlci5jc3MoJ2xlZnQnLCByZWxhdGl2ZVggLSBAJGhvdmVyTWFya2VyLndpZHRoKCkpXG5cbiAgICBpZiBAaXNNb3VzZURvd25cbiAgICAgIEBfaGlkZVBvcHVwKGZvcmNlOiB0cnVlKVxuICAgICAgQF9kZWJvdW5jZWRWaWV3TmVhcmVzdFJldmlzaW9uKClcbiAgICBlbHNlXG4gICAgICBAX2RlYm91bmNlZFJlbmRlclBvcHVwKClcblxuXG4gIF9vbk1vdXNlbGVhdmU6IChldnQpIC0+XG4gICAgQGlzTW91c2VJbkVsZW1lbnQgPSBmYWxzZVxuICAgICMgZGVib3VuY2luZyBnaXZlcyBhIGxpdHRsZSB0aW1lIHRvIGdldCB0aGUgbW91c2UgaW50byB0aGUgcG9wdXBcbiAgICBAX2RlYm91bmNlZEhpZGVQb3B1cCgpO1xuICAgIEBpc01vdXNlRG93biA9IGZhbHNlXG5cblxuICBfb25Nb3VzZWRvd246IChldnQpIC0+XG4gICAgQGlzTW91c2VEb3duID0gdHJ1ZVxuICAgIEBfaGlkZVBvcHVwKGZvcmNlOiB0cnVlKVxuICAgIEBfZGVib3VuY2VkVmlld05lYXJlc3RSZXZpc2lvbigpXG5cblxuICBfb25Nb3VzZXVwOiAoZXZ0KSAtPlxuICAgIEBpc01vdXNlRG93biA9IGZhbHNlXG5cblxuICBfcmVuZGVyUG9wdXA6ICgpIC0+XG4gICAgIyByZXBvc2l0aW9uIHRoZSBtYXJrZXIgdG8gbWF0Y2ggdGhlIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IHBvcHVwXG4gICAgaWYgQHBvcHVwPy5pc01vdXNlSW5Qb3B1cCgpXG4gICAgICBsZWZ0ID0gQHBvcHVwLm9mZnNldCgpLmxlZnQgLSBAJGVsZW1lbnQub2Zmc2V0KCkubGVmdFxuICAgICAgaWYgQF9wb3B1cFJpZ2h0QWxpZ25lZFxuICAgICAgICBsZWZ0ICs9IChAcG9wdXAud2lkdGgoKSArIDcpXG4gICAgICBAJGhvdmVyTWFya2VyLmNzcyAnbGVmdCc6IGxlZnRcbiAgICAgIHJldHVyblxuXG4gICAgcmV0dXJuIHVubGVzcyBAaXNNb3VzZUluRWxlbWVudFxuXG4gICAgQHBvcHVwPy5oaWRlKCkucmVtb3ZlKClcbiAgICBbY29tbWl0cywgc3RhcnQsIGVuZF0gPSBAX2ZpbHRlckNvbW1pdERhdGEoQGNvbW1pdERhdGEpXG4gICAgQHBvcHVwID0gbmV3IEdpdFRpbWVwbG90UG9wdXAoY29tbWl0cywgQGVkaXRvciwgc3RhcnQsIGVuZClcblxuICAgIGxlZnQgPSBAJGhvdmVyTWFya2VyLm9mZnNldCgpLmxlZnRcbiAgICBpZiBsZWZ0ICsgQHBvcHVwLm91dGVyV2lkdGgoKSArIDEwID4gQCRlbGVtZW50Lm9mZnNldCgpLmxlZnQgKyBAJGVsZW1lbnQud2lkdGgoKVxuICAgICAgQF9wb3B1cFJpZ2h0QWxpZ25lZCA9IHRydWVcbiAgICAgIGxlZnQgLT0gKEBwb3B1cC53aWR0aCgpICsgNylcbiAgICBlbHNlXG4gICAgICBAX3BvcHVwUmlnaHRBbGlnbmVkID0gZmFsc2VcblxuICAgIEBwb3B1cC5jc3NcbiAgICAgIGxlZnQ6IGxlZnRcbiAgICAgIHRvcDogQCRlbGVtZW50Lm9mZnNldCgpLnRvcCAtIEBwb3B1cC5oZWlnaHQoKSAtIDEwXG5cblxuICBfaGlkZVBvcHVwOiAob3B0aW9ucz17fSkgLT5cbiAgICBvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuICAgICAgZm9yY2U6IGZhbHNlXG5cbiAgICByZXR1cm4gaWYgIW9wdGlvbnMuZm9yY2UgJiYgKEBwb3B1cD8uaXNNb3VzZUluUG9wdXAoKSB8fCBAaXNNb3VzZUluRWxlbWVudClcbiAgICBAcG9wdXA/LmhpZGUoKS5yZW1vdmUoKVxuXG5cbiAgIyByZXR1cm4gY29tbWl0cyBmb3IgcmFuZ2Ugb2YgdGltZSBhdCBob3ZlciBtYXJrZXIgKG1vdXNlIGhvdmVyIHBvaW50ICsvLSBmaXggcmFkaXVzKVxuICBfZmlsdGVyQ29tbWl0RGF0YTogKCkgLT5cbiAgICBsZWZ0ID0gQCRob3Zlck1hcmtlci5vZmZzZXQoKS5sZWZ0XG4gICAgcmVsYXRpdmVMZWZ0ID0gbGVmdCAtIEAkZWxlbWVudC5vZmZzZXQoKS5sZWZ0IC0gNVxuICAgIHRTdGFydCA9IG1vbWVudChAeC5pbnZlcnQocmVsYXRpdmVMZWZ0KSkuc3RhcnRPZignaG91cicpLnN1YnRyYWN0KDEsICdtaW51dGUnKVxuICAgIHRFbmQgPSBtb21lbnQoQHguaW52ZXJ0KHJlbGF0aXZlTGVmdCArIDEwKSkuZW5kT2YoJ2hvdXInKS5hZGQoMSwgJ21pbnV0ZScpXG4gICAgY29tbWl0cyA9IF8uZmlsdGVyIEBjb21taXREYXRhLCAoYykgLT4gbW9tZW50LnVuaXgoYy5hdXRob3JEYXRlKS5pc0JldHdlZW4odFN0YXJ0LCB0RW5kKVxuICAgICMgY29uc29sZS5sb2coXCJndG06IGluc3BlY3RpbmcgI3tjb21taXRzLmxlbmd0aH0gY29tbWl0cyBiZXR3ZWUgI3t0U3RhcnQudG9TdHJpbmcoKX0gLSAje3RFbmQudG9TdHJpbmcoKX1cIilcbiAgICByZXR1cm4gW2NvbW1pdHMsIHRTdGFydCwgdEVuZF07XG5cbiAgIyByZXR1cm4gdGhlIG5lYXJlc3QgY29tbWl0IHRvIGhvdmVyIG1hcmtlciBvciBwcmV2aW91c1xuICBfZ2V0TmVhcmVzdENvbW1pdDogKCkgLT5cbiAgICBbZmlsdGVyZWRDb21taXREYXRhLCB0U3RhcnQsIHRFbmRdID0gQF9maWx0ZXJDb21taXREYXRhKClcbiAgICBpZiBmaWx0ZXJlZENvbW1pdERhdGE/Lmxlbmd0aCA+IDBcbiAgICAgIHJldHVybiBmaWx0ZXJlZENvbW1pdERhdGFbMF1cbiAgICBlbHNlXG4gICAgICByZXR1cm4gXy5maW5kIEBjb21taXREYXRhLCAoYykgLT4gbW9tZW50LnVuaXgoYy5hdXRob3JEYXRlKS5pc0JlZm9yZSh0RW5kKVxuXG5cbiAgX3ZpZXdOZWFyZXN0UmV2aXNpb246ICgpIC0+XG4gICAgbmVhcmVzdENvbW1pdCA9ICBAX2dldE5lYXJlc3RDb21taXQoKVxuICAgIGlmIG5lYXJlc3RDb21taXQ/XG4gICAgICBSZXZpc2lvblZpZXcuc2hvd1JldmlzaW9uKEBlZGl0b3IsIG5lYXJlc3RDb21taXQuaGFzaClcbiJdfQ==
