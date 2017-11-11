(function() {
  var OutputView, create, getView, view;

  OutputView = require('./views/output-view');

  view = null;

  getView = function() {
    if (view === null) {
      view = new OutputView;
      atom.workspace.addBottomPanel({
        item: view
      });
      view.hide();
    }
    return view;
  };

  create = function() {
    if (view != null) {
      view.reset();
    }
    return getView();
  };

  module.exports = {
    create: create,
    getView: getView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL291dHB1dC12aWV3LW1hbmFnZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLHFCQUFSOztFQUViLElBQUEsR0FBTzs7RUFFUCxPQUFBLEdBQVUsU0FBQTtJQUNSLElBQUcsSUFBQSxLQUFRLElBQVg7TUFDRSxJQUFBLEdBQU8sSUFBSTtNQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBZixDQUE4QjtRQUFBLElBQUEsRUFBTSxJQUFOO09BQTlCO01BQ0EsSUFBSSxDQUFDLElBQUwsQ0FBQSxFQUhGOztXQUlBO0VBTFE7O0VBT1YsTUFBQSxHQUFTLFNBQUE7O01BQ1AsSUFBSSxDQUFFLEtBQU4sQ0FBQTs7V0FDQSxPQUFBLENBQUE7RUFGTzs7RUFJVCxNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUFDLFFBQUEsTUFBRDtJQUFTLFNBQUEsT0FBVDs7QUFmakIiLCJzb3VyY2VzQ29udGVudCI6WyJPdXRwdXRWaWV3ID0gcmVxdWlyZSAnLi92aWV3cy9vdXRwdXQtdmlldydcblxudmlldyA9IG51bGxcblxuZ2V0VmlldyA9IC0+XG4gIGlmIHZpZXcgaXMgbnVsbFxuICAgIHZpZXcgPSBuZXcgT3V0cHV0Vmlld1xuICAgIGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHZpZXcpXG4gICAgdmlldy5oaWRlKClcbiAgdmlld1xuXG5jcmVhdGUgPSAtPlxuICB2aWV3Py5yZXNldCgpXG4gIGdldFZpZXcoKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGUsIGdldFZpZXd9XG4iXX0=
