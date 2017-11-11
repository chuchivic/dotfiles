Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _uuidV4 = require("uuid/v4");

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _jupyterJsServicesShim = require("./jupyter-js-services-shim");

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var CustomListView = (function () {
  function CustomListView(emptyMessage, onConfirmed) {
    var _this = this;

    _classCallCheck(this, CustomListView);

    this.emptyMessage = emptyMessage;
    this.onConfirmed = onConfirmed;
    this.previouslyFocusedElement = document.activeElement;
    this.selectListView = new _atomSelectList2["default"]({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.name;
      },
      elementForItem: function elementForItem(item) {
        var element = document.createElement("li");
        element.textContent = item.name;
        return element;
      },
      didConfirmSelection: function didConfirmSelection(item) {
        if (_this.onConfirmed) _this.onConfirmed(item);
        _this.cancel();
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      },
      emptyMessage: this.emptyMessage
    });

    if (!this.panel) {
      this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
    }
    this.panel.show();
    this.selectListView.focus();
  }

  _createClass(CustomListView, [{
    key: "destroy",
    value: function destroy() {
      this.cancel();
      return this.selectListView.destroy();
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this.panel != null) {
        this.panel.destroy();
      }
      this.panel = null;
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }
  }]);

  return CustomListView;
})();

var WSKernelPicker = (function () {
  function WSKernelPicker(onChosen) {
    _classCallCheck(this, WSKernelPicker);

    this._onChosen = onChosen;
  }

  _createClass(WSKernelPicker, [{
    key: "toggle",
    value: function toggle(_kernelSpecFilter) {
      this._kernelSpecFilter = _kernelSpecFilter;
      var gateways = _config2["default"].getJson("gateways") || [];
      if (_lodash2["default"].isEmpty(gateways)) {
        atom.notifications.addError("No remote kernel gateways available", {
          description: "Use the Hydrogen package settings to specify the list of remote servers. Hydrogen can use remote kernels on either a Jupyter Kernel Gateway or Jupyter notebook server."
        });
        return;
      }
      var path = _store2["default"].editor ? _store2["default"].editor.getPath() : null;

      this._path = (path || "unsaved") + "-" + (0, _uuidV42["default"])();
      var gatewayListing = new CustomListView("No gateways available", this.onGateway.bind(this));
      this.previouslyFocusedElement = gatewayListing.previouslyFocusedElement;
      gatewayListing.selectListView.update({
        items: gateways,
        infoMessage: "Select a gateway"
      });
    }
  }, {
    key: "onGateway",
    value: function onGateway(gatewayInfo) {
      var _this2 = this;

      var sessionListing = new CustomListView("No sessions available", this.onSession.bind(this));
      _jupyterJsServicesShim.Kernel.getSpecs(gatewayInfo.options).then(function (specModels) {
        var kernelSpecs = _lodash2["default"].filter(specModels.kernelspecs, function (spec) {
          return _this2._kernelSpecFilter(spec);
        });

        var kernelNames = _lodash2["default"].map(kernelSpecs, function (specModel) {
          return specModel.name;
        });

        sessionListing.previouslyFocusedElement = _this2.previouslyFocusedElement;
        sessionListing.selectListView.update({
          loadingMessage: "Loading sessions..."
        });

        _jupyterJsServicesShim.Session.listRunning(gatewayInfo.options).then(function (sessionModels) {
          sessionModels = sessionModels.filter(function (model) {
            var name = model.kernel ? model.kernel.name : null;
            return name ? kernelNames.includes(name) : true;
          });
          var items = sessionModels.map(function (model) {
            var name = undefined;
            if (model.notebook && model.notebook.path) {
              name = (0, _tildify2["default"])(model.notebook.path);
            } else {
              name = "Session " + model.id;
            }
            return {
              name: name,
              model: model,
              options: gatewayInfo.options
            };
          });
          items.unshift({
            name: "[new session]",
            model: null,
            options: gatewayInfo.options,
            kernelSpecs: kernelSpecs
          });
          return sessionListing.selectListView.update({
            items: items,
            loadingMessage: null
          });
        }, function () {
          return(
            // Gateways offer the option of never listing sessions, for security
            // reasons.
            // Assume this is the case and proceed to creating a new session.
            _this2.onSession({
              name: "[new session]",
              model: null,
              options: gatewayInfo.options,
              kernelSpecs: kernelSpecs
            })
          );
        });
      }, function () {
        return atom.notifications.addError("Connection to gateway failed");
      }).then(function () {
        sessionListing.selectListView.focus();
        sessionListing.selectListView.reset();
      });
    }
  }, {
    key: "onSession",
    value: function onSession(sessionInfo) {
      var _this3 = this;

      if (!sessionInfo.model) {
        var kernelListing = new CustomListView("No kernel specs available", this.startSession.bind(this));
        kernelListing.previouslyFocusedElement = this.previouslyFocusedElement;

        var items = _lodash2["default"].map(sessionInfo.kernelSpecs, function (spec) {
          var options = Object.assign({}, sessionInfo.options);
          options.kernelName = spec.name;
          options.path = _this3._path;
          return {
            name: spec.display_name,
            options: options
          };
        });
        kernelListing.selectListView.update({ items: items });
        kernelListing.selectListView.focus();
        kernelListing.selectListView.reset();
        if (!sessionInfo.name) {
          kernelListing.selectListView.update({
            errorMessage: "This gateway does not support listing sessions"
          });
        }
      } else {
        _jupyterJsServicesShim.Session.connectTo(sessionInfo.model.id, sessionInfo.options).then(this.onSessionChosen.bind(this));
      }
    }
  }, {
    key: "startSession",
    value: function startSession(sessionInfo) {
      _jupyterJsServicesShim.Session.startNew(sessionInfo.options).then(this.onSessionChosen.bind(this));
    }
  }, {
    key: "onSessionChosen",
    value: function onSessionChosen(session) {
      var _this4 = this;

      session.kernel.getSpec().then(function (kernelSpec) {
        if (!_store2["default"].grammar) return;

        var kernel = new _wsKernel2["default"](kernelSpec, _store2["default"].grammar, session);
        _this4._onChosen(kernel);
      });
    }
  }]);

  return WSKernelPicker;
})();

exports["default"] = WSKernelPicker;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwtcGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OEJBRTJCLGtCQUFrQjs7OztzQkFDL0IsUUFBUTs7Ozt1QkFDRixTQUFTOzs7O3NCQUNkLFNBQVM7Ozs7c0JBRUwsVUFBVTs7OztxQ0FDRyw0QkFBNEI7O3dCQUN2QyxhQUFhOzs7O3FCQUNoQixTQUFTOzs7O0lBRXJCLGNBQWM7QUFPUCxXQVBQLGNBQWMsQ0FPTixZQUFZLEVBQUUsV0FBVyxFQUFFOzs7MEJBUG5DLGNBQWM7O0FBUWhCLFFBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0FBQy9CLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxjQUFjLEdBQUcsZ0NBQW1CO0FBQ3ZDLG9CQUFjLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDL0IsV0FBSyxFQUFFLEVBQUU7QUFDVCxzQkFBZ0IsRUFBRSwwQkFBQSxJQUFJO2VBQUksSUFBSSxDQUFDLElBQUk7T0FBQTtBQUNuQyxvQkFBYyxFQUFFLHdCQUFBLElBQUksRUFBSTtBQUN0QixZQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLGVBQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNoQyxlQUFPLE9BQU8sQ0FBQztPQUNoQjtBQUNELHlCQUFtQixFQUFFLDZCQUFBLElBQUksRUFBSTtBQUMzQixZQUFJLE1BQUssV0FBVyxFQUFFLE1BQUssV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLGNBQUssTUFBTSxFQUFFLENBQUM7T0FDZjtBQUNELHdCQUFrQixFQUFFO2VBQU0sTUFBSyxNQUFNLEVBQUU7T0FBQTtBQUN2QyxrQkFBWSxF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QyxDQUFDO0FBQ2hFLGVBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3hCLENBQUMsQ0FBQztLQUNKOzs7U0FsSmtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwtcGlja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gXCJhdG9tLXNlbGVjdC1saXN0XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgdGlsZGlmeSBmcm9tIFwidGlsZGlmeVwiO1xuaW1wb3J0IHY0IGZyb20gXCJ1dWlkL3Y0XCI7XG5cbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgeyBLZXJuZWwsIFNlc3Npb24gfSBmcm9tIFwiLi9qdXB5dGVyLWpzLXNlcnZpY2VzLXNoaW1cIjtcbmltcG9ydCBXU0tlcm5lbCBmcm9tIFwiLi93cy1rZXJuZWxcIjtcbmltcG9ydCBzdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuXG5jbGFzcyBDdXN0b21MaXN0VmlldyB7XG4gIGVtcHR5TWVzc2FnZTogc3RyaW5nO1xuICBvbkNvbmZpcm1lZDogKGtlcm5lbFNwZWNzOiBLZXJuZWxzcGVjKSA9PiB2b2lkO1xuICBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcbiAgc2VsZWN0TGlzdFZpZXc6IFNlbGVjdExpc3RWaWV3O1xuICBwYW5lbDogP2F0b20kUGFuZWw7XG5cbiAgY29uc3RydWN0b3IoZW1wdHlNZXNzYWdlLCBvbkNvbmZpcm1lZCkge1xuICAgIHRoaXMuZW1wdHlNZXNzYWdlID0gZW1wdHlNZXNzYWdlO1xuICAgIHRoaXMub25Db25maXJtZWQgPSBvbkNvbmZpcm1lZDtcbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiBpdGVtID0+IGl0ZW0ubmFtZSxcbiAgICAgIGVsZW1lbnRGb3JJdGVtOiBpdGVtID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0ubmFtZTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICB9LFxuICAgICAgZGlkQ29uZmlybVNlbGVjdGlvbjogaXRlbSA9PiB7XG4gICAgICAgIGlmICh0aGlzLm9uQ29uZmlybWVkKSB0aGlzLm9uQ29uZmlybWVkKGl0ZW0pO1xuICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgIGVtcHR5TWVzc2FnZTogdGhpcy5lbXB0eU1lc3NhZ2VcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzLnNlbGVjdExpc3RWaWV3IH0pO1xuICAgIH1cbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0TGlzdFZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLnBhbmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICBpZiAodGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdTS2VybmVsUGlja2VyIHtcbiAgX29uQ2hvc2VuOiAoa2VybmVsOiBLZXJuZWwpID0+IHZvaWQ7XG4gIF9rZXJuZWxTcGVjRmlsdGVyOiAoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT4gYm9vbGVhbjtcbiAgX3BhdGg6IHN0cmluZztcbiAgcHJldmlvdXNseUZvY3VzZWRFbGVtZW50OiA/SFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3Iob25DaG9zZW46IChrZXJuZWw6IEtlcm5lbCkgPT4gdm9pZCkge1xuICAgIHRoaXMuX29uQ2hvc2VuID0gb25DaG9zZW47XG4gIH1cblxuICB0b2dnbGUoX2tlcm5lbFNwZWNGaWx0ZXI6IChrZXJuZWxTcGVjOiBLZXJuZWxzcGVjKSA9PiBib29sZWFuKSB7XG4gICAgdGhpcy5fa2VybmVsU3BlY0ZpbHRlciA9IF9rZXJuZWxTcGVjRmlsdGVyO1xuICAgIGNvbnN0IGdhdGV3YXlzID0gQ29uZmlnLmdldEpzb24oXCJnYXRld2F5c1wiKSB8fCBbXTtcbiAgICBpZiAoXy5pc0VtcHR5KGdhdGV3YXlzKSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiTm8gcmVtb3RlIGtlcm5lbCBnYXRld2F5cyBhdmFpbGFibGVcIiwge1xuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIlVzZSB0aGUgSHlkcm9nZW4gcGFja2FnZSBzZXR0aW5ncyB0byBzcGVjaWZ5IHRoZSBsaXN0IG9mIHJlbW90ZSBzZXJ2ZXJzLiBIeWRyb2dlbiBjYW4gdXNlIHJlbW90ZSBrZXJuZWxzIG9uIGVpdGhlciBhIEp1cHl0ZXIgS2VybmVsIEdhdGV3YXkgb3IgSnVweXRlciBub3RlYm9vayBzZXJ2ZXIuXCJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gc3RvcmUuZWRpdG9yID8gc3RvcmUuZWRpdG9yLmdldFBhdGgoKSA6IG51bGw7XG5cbiAgICB0aGlzLl9wYXRoID0gYCR7cGF0aCB8fCBcInVuc2F2ZWRcIn0tJHt2NCgpfWA7XG4gICAgY29uc3QgZ2F0ZXdheUxpc3RpbmcgPSBuZXcgQ3VzdG9tTGlzdFZpZXcoXG4gICAgICBcIk5vIGdhdGV3YXlzIGF2YWlsYWJsZVwiLFxuICAgICAgdGhpcy5vbkdhdGV3YXkuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBnYXRld2F5TGlzdGluZy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ7XG4gICAgZ2F0ZXdheUxpc3Rpbmcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgIGl0ZW1zOiBnYXRld2F5cyxcbiAgICAgIGluZm9NZXNzYWdlOiBcIlNlbGVjdCBhIGdhdGV3YXlcIlxuICAgIH0pO1xuICB9XG5cbiAgb25HYXRld2F5KGdhdGV3YXlJbmZvOiBhbnkpIHtcbiAgICBjb25zdCBzZXNzaW9uTGlzdGluZyA9IG5ldyBDdXN0b21MaXN0VmlldyhcbiAgICAgIFwiTm8gc2Vzc2lvbnMgYXZhaWxhYmxlXCIsXG4gICAgICB0aGlzLm9uU2Vzc2lvbi5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBLZXJuZWwuZ2V0U3BlY3MoZ2F0ZXdheUluZm8ub3B0aW9ucylcbiAgICAgIC50aGVuKFxuICAgICAgICBzcGVjTW9kZWxzID0+IHtcbiAgICAgICAgICBjb25zdCBrZXJuZWxTcGVjcyA9IF8uZmlsdGVyKHNwZWNNb2RlbHMua2VybmVsc3BlY3MsIHNwZWMgPT5cbiAgICAgICAgICAgIHRoaXMuX2tlcm5lbFNwZWNGaWx0ZXIoc3BlYylcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgY29uc3Qga2VybmVsTmFtZXMgPSBfLm1hcChrZXJuZWxTcGVjcywgc3BlY01vZGVsID0+IHNwZWNNb2RlbC5uYW1lKTtcblxuICAgICAgICAgIHNlc3Npb25MaXN0aW5nLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50O1xuICAgICAgICAgIHNlc3Npb25MaXN0aW5nLnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nTWVzc2FnZTogXCJMb2FkaW5nIHNlc3Npb25zLi4uXCJcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIFNlc3Npb24ubGlzdFJ1bm5pbmcoZ2F0ZXdheUluZm8ub3B0aW9ucykudGhlbihcbiAgICAgICAgICAgIHNlc3Npb25Nb2RlbHMgPT4ge1xuICAgICAgICAgICAgICBzZXNzaW9uTW9kZWxzID0gc2Vzc2lvbk1vZGVscy5maWx0ZXIobW9kZWwgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBtb2RlbC5rZXJuZWwgPyBtb2RlbC5rZXJuZWwubmFtZSA6IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWUgPyBrZXJuZWxOYW1lcy5pbmNsdWRlcyhuYW1lKSA6IHRydWU7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjb25zdCBpdGVtcyA9IHNlc3Npb25Nb2RlbHMubWFwKG1vZGVsID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobW9kZWwubm90ZWJvb2sgJiYgbW9kZWwubm90ZWJvb2sucGF0aCkge1xuICAgICAgICAgICAgICAgICAgbmFtZSA9IHRpbGRpZnkobW9kZWwubm90ZWJvb2sucGF0aCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIG5hbWUgPSBgU2Vzc2lvbiAke21vZGVsLmlkfWA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgICBvcHRpb25zOiBnYXRld2F5SW5mby5vcHRpb25zXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGl0ZW1zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiW25ldyBzZXNzaW9uXVwiLFxuICAgICAgICAgICAgICAgIG1vZGVsOiBudWxsLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IGdhdGV3YXlJbmZvLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAga2VybmVsU3BlY3NcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uTGlzdGluZy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe1xuICAgICAgICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICAgICAgICBsb2FkaW5nTWVzc2FnZTogbnVsbFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoKSA9PlxuICAgICAgICAgICAgICAvLyBHYXRld2F5cyBvZmZlciB0aGUgb3B0aW9uIG9mIG5ldmVyIGxpc3Rpbmcgc2Vzc2lvbnMsIGZvciBzZWN1cml0eVxuICAgICAgICAgICAgICAvLyByZWFzb25zLlxuICAgICAgICAgICAgICAvLyBBc3N1bWUgdGhpcyBpcyB0aGUgY2FzZSBhbmQgcHJvY2VlZCB0byBjcmVhdGluZyBhIG5ldyBzZXNzaW9uLlxuICAgICAgICAgICAgICB0aGlzLm9uU2Vzc2lvbih7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJbbmV3IHNlc3Npb25dXCIsXG4gICAgICAgICAgICAgICAgbW9kZWw6IG51bGwsXG4gICAgICAgICAgICAgICAgb3B0aW9uczogZ2F0ZXdheUluZm8ub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBrZXJuZWxTcGVjc1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICAgICgpID0+IGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIkNvbm5lY3Rpb24gdG8gZ2F0ZXdheSBmYWlsZWRcIilcbiAgICAgIClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgc2Vzc2lvbkxpc3Rpbmcuc2VsZWN0TGlzdFZpZXcuZm9jdXMoKTtcbiAgICAgICAgc2Vzc2lvbkxpc3Rpbmcuc2VsZWN0TGlzdFZpZXcucmVzZXQoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgb25TZXNzaW9uKHNlc3Npb25JbmZvOiBhbnkpIHtcbiAgICBpZiAoIXNlc3Npb25JbmZvLm1vZGVsKSB7XG4gICAgICBjb25zdCBrZXJuZWxMaXN0aW5nID0gbmV3IEN1c3RvbUxpc3RWaWV3KFxuICAgICAgICBcIk5vIGtlcm5lbCBzcGVjcyBhdmFpbGFibGVcIixcbiAgICAgICAgdGhpcy5zdGFydFNlc3Npb24uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICAgIGtlcm5lbExpc3RpbmcucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ7XG5cbiAgICAgIGNvbnN0IGl0ZW1zID0gXy5tYXAoc2Vzc2lvbkluZm8ua2VybmVsU3BlY3MsIHNwZWMgPT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgc2Vzc2lvbkluZm8ub3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMua2VybmVsTmFtZSA9IHNwZWMubmFtZTtcbiAgICAgICAgb3B0aW9ucy5wYXRoID0gdGhpcy5fcGF0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBuYW1lOiBzcGVjLmRpc3BsYXlfbmFtZSxcbiAgICAgICAgICBvcHRpb25zXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGtlcm5lbExpc3Rpbmcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IGl0ZW1zIH0pO1xuICAgICAga2VybmVsTGlzdGluZy5zZWxlY3RMaXN0Vmlldy5mb2N1cygpO1xuICAgICAga2VybmVsTGlzdGluZy5zZWxlY3RMaXN0Vmlldy5yZXNldCgpO1xuICAgICAgaWYgKCFzZXNzaW9uSW5mby5uYW1lKSB7XG4gICAgICAgIGtlcm5lbExpc3Rpbmcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6IFwiVGhpcyBnYXRld2F5IGRvZXMgbm90IHN1cHBvcnQgbGlzdGluZyBzZXNzaW9uc1wiXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBTZXNzaW9uLmNvbm5lY3RUbyhzZXNzaW9uSW5mby5tb2RlbC5pZCwgc2Vzc2lvbkluZm8ub3B0aW9ucykudGhlbihcbiAgICAgICAgdGhpcy5vblNlc3Npb25DaG9zZW4uYmluZCh0aGlzKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBzdGFydFNlc3Npb24oc2Vzc2lvbkluZm86IGFueSkge1xuICAgIFNlc3Npb24uc3RhcnROZXcoc2Vzc2lvbkluZm8ub3B0aW9ucykudGhlbih0aGlzLm9uU2Vzc2lvbkNob3Nlbi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIG9uU2Vzc2lvbkNob3NlbihzZXNzaW9uOiBhbnkpIHtcbiAgICBzZXNzaW9uLmtlcm5lbC5nZXRTcGVjKCkudGhlbihrZXJuZWxTcGVjID0+IHtcbiAgICAgIGlmICghc3RvcmUuZ3JhbW1hcikgcmV0dXJuO1xuXG4gICAgICBjb25zdCBrZXJuZWwgPSBuZXcgV1NLZXJuZWwoa2VybmVsU3BlYywgc3RvcmUuZ3JhbW1hciwgc2Vzc2lvbik7XG4gICAgICB0aGlzLl9vbkNob3NlbihrZXJuZWwpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=