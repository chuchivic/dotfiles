(function() {
  var $, AnsiToHtml, OutputView, ScrollView, ansiToHtml, defaultMessage, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  AnsiToHtml = require('ansi-to-html');

  ansiToHtml = new AnsiToHtml();

  ref = require('atom-space-pen-views'), $ = ref.$, ScrollView = ref.ScrollView;

  defaultMessage = 'Nothing new to show';

  OutputView = (function(superClass) {
    extend(OutputView, superClass);

    function OutputView() {
      return OutputView.__super__.constructor.apply(this, arguments);
    }

    OutputView.content = function() {
      return this.div({
        "class": 'git-plus info-view'
      }, (function(_this) {
        return function() {
          return _this.pre({
            "class": 'output'
          }, defaultMessage);
        };
      })(this));
    };

    OutputView.prototype.html = defaultMessage;

    OutputView.prototype.initialize = function() {
      return OutputView.__super__.initialize.apply(this, arguments);
    };

    OutputView.prototype.reset = function() {
      return this.html = defaultMessage;
    };

    OutputView.prototype.setContent = function(content) {
      this.html = ansiToHtml.toHtml(content);
      return this;
    };

    OutputView.prototype.finish = function() {
      this.find(".output").html(this.html);
      this.show();
      return this.timeout = setTimeout((function(_this) {
        return function() {
          return _this.hide();
        };
      })(this), atom.config.get('git-plus.general.messageTimeout') * 1000);
    };

    OutputView.prototype.toggle = function() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      return $.fn.toggle.call(this);
    };

    return OutputView;

  })(ScrollView);

  module.exports = OutputView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3ZpZXdzL291dHB1dC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0VBQUE7SUFBQTs7O0VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLFVBQUEsR0FBaUIsSUFBQSxVQUFBLENBQUE7O0VBQ2pCLE1BQWtCLE9BQUEsQ0FBUSxzQkFBUixDQUFsQixFQUFDLFNBQUQsRUFBSTs7RUFFSixjQUFBLEdBQWlCOztFQUVYOzs7Ozs7O0lBQ0osVUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sb0JBQVA7T0FBTCxFQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ2hDLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFFBQVA7V0FBTCxFQUFzQixjQUF0QjtRQURnQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7SUFEUTs7eUJBSVYsSUFBQSxHQUFNOzt5QkFFTixVQUFBLEdBQVksU0FBQTthQUFHLDRDQUFBLFNBQUE7SUFBSDs7eUJBRVosS0FBQSxHQUFPLFNBQUE7YUFBRyxJQUFDLENBQUEsSUFBRCxHQUFRO0lBQVg7O3lCQUVQLFVBQUEsR0FBWSxTQUFDLE9BQUQ7TUFDVixJQUFDLENBQUEsSUFBRCxHQUFRLFVBQVUsQ0FBQyxNQUFYLENBQWtCLE9BQWxCO2FBQ1I7SUFGVTs7eUJBSVosTUFBQSxHQUFRLFNBQUE7TUFDTixJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixJQUFDLENBQUEsSUFBdkI7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNwQixLQUFDLENBQUEsSUFBRCxDQUFBO1FBRG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFYLEVBRVQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQixDQUFBLEdBQXFELElBRjVDO0lBSEw7O3lCQU9SLE1BQUEsR0FBUSxTQUFBO01BQ04sSUFBeUIsSUFBQyxDQUFBLE9BQTFCO1FBQUEsWUFBQSxDQUFhLElBQUMsQ0FBQSxPQUFkLEVBQUE7O2FBQ0EsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBWixDQUFpQixJQUFqQjtJQUZNOzs7O0tBdEJlOztFQTBCekIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFoQ2pCIiwic291cmNlc0NvbnRlbnQiOlsiQW5zaVRvSHRtbCA9IHJlcXVpcmUgJ2Fuc2ktdG8taHRtbCdcbmFuc2lUb0h0bWwgPSBuZXcgQW5zaVRvSHRtbCgpXG57JCwgU2Nyb2xsVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcblxuZGVmYXVsdE1lc3NhZ2UgPSAnTm90aGluZyBuZXcgdG8gc2hvdydcblxuY2xhc3MgT3V0cHV0VmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2dpdC1wbHVzIGluZm8tdmlldycsID0+XG4gICAgICBAcHJlIGNsYXNzOiAnb3V0cHV0JywgZGVmYXVsdE1lc3NhZ2VcblxuICBodG1sOiBkZWZhdWx0TWVzc2FnZVxuXG4gIGluaXRpYWxpemU6IC0+IHN1cGVyXG5cbiAgcmVzZXQ6IC0+IEBodG1sID0gZGVmYXVsdE1lc3NhZ2VcblxuICBzZXRDb250ZW50OiAoY29udGVudCkgLT5cbiAgICBAaHRtbCA9IGFuc2lUb0h0bWwudG9IdG1sIGNvbnRlbnRcbiAgICB0aGlzXG5cbiAgZmluaXNoOiAtPlxuICAgIEBmaW5kKFwiLm91dHB1dFwiKS5odG1sKEBodG1sKVxuICAgIEBzaG93KClcbiAgICBAdGltZW91dCA9IHNldFRpbWVvdXQgPT5cbiAgICAgIEBoaWRlKClcbiAgICAsIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZ2VuZXJhbC5tZXNzYWdlVGltZW91dCcpICogMTAwMFxuXG4gIHRvZ2dsZTogLT5cbiAgICBjbGVhclRpbWVvdXQgQHRpbWVvdXQgaWYgQHRpbWVvdXRcbiAgICAkLmZuLnRvZ2dsZS5jYWxsKHRoaXMpXG5cbm1vZHVsZS5leHBvcnRzID0gT3V0cHV0Vmlld1xuIl19
