Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _uuidV4 = require("uuid/v4");

var _uuidV42 = _interopRequireDefault(_uuidV4);

var _ws = require("ws");

var _ws2 = _interopRequireDefault(_ws);

var _xmlhttprequest = require("xmlhttprequest");

var _xmlhttprequest2 = _interopRequireDefault(_xmlhttprequest);

var _jupyterlabServices = require("@jupyterlab/services");

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var CustomListView = (function () {
  function CustomListView() {
    var _this = this;

    _classCallCheck(this, CustomListView);

    this.onConfirmed = function () {};

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
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      }
    });
  }

  _createClass(CustomListView, [{
    key: "show",
    value: function show() {
      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      }
      this.panel.show();
      this.selectListView.focus();
    }
  }, {
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
    this.listView = new CustomListView();
  }

  _createClass(WSKernelPicker, [{
    key: "toggle",
    value: _asyncToGenerator(function* (_kernelSpecFilter) {
      this.listView.previouslyFocusedElement = document.activeElement;
      this._kernelSpecFilter = _kernelSpecFilter;
      var gateways = _config2["default"].getJson("gateways") || [];
      if (_lodash2["default"].isEmpty(gateways)) {
        atom.notifications.addError("No remote kernel gateways available", {
          description: "Use the Hydrogen package settings to specify the list of remote servers. Hydrogen can use remote kernels on either a Jupyter Kernel Gateway or Jupyter notebook server."
        });
        return;
      }

      this._path = (_store2["default"].filePath || "unsaved") + "-" + (0, _uuidV42["default"])();

      this.listView.onConfirmed = this.onGateway.bind(this);

      yield this.listView.selectListView.update({
        items: gateways,
        infoMessage: "Select a gateway",
        emptyMessage: "No gateways available",
        loadingMessage: null
      });

      this.listView.show();
    })
  }, {
    key: "onGateway",
    value: _asyncToGenerator(function* (gatewayInfo) {
      var _this2 = this;

      var serverSettings = _jupyterlabServices.ServerConnection.makeSettings(Object.assign({
        xhrFactory: function xhrFactory() {
          return new _xmlhttprequest2["default"].XMLHttpRequest();
        },
        wsFactory: function wsFactory(url, protocol) {
          return new _ws2["default"](url, protocol);
        }
      }, gatewayInfo.options));
      this.listView.onConfirmed = this.onSession.bind(this, gatewayInfo.name);
      yield this.listView.selectListView.update({
        items: [],
        infoMessage: null,
        loadingMessage: "Loading sessions...",
        emptyMessage: "No sessions available"
      });
      try {
        yield* (function* () {
          var specModels = yield _jupyterlabServices.Kernel.getSpecs(serverSettings);
          var kernelSpecs = _lodash2["default"].filter(specModels.kernelspecs, function (spec) {
            return _this2._kernelSpecFilter(spec);
          });

          var kernelNames = _lodash2["default"].map(kernelSpecs, function (specModel) {
            return specModel.name;
          });

          try {
            var sessionModels = yield _jupyterlabServices.Session.listRunning(serverSettings);
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
              return { name: name, model: model, options: serverSettings };
            });
            items.unshift({
              name: "[new session]",
              model: null,
              options: serverSettings,
              kernelSpecs: kernelSpecs
            });
            yield _this2.listView.selectListView.update({
              items: items,
              loadingMessage: null
            });
          } catch (error) {
            if (!error.xhr || error.xhr.status !== 403) throw error;
            // Gateways offer the option of never listing sessions, for security
            // reasons.
            // Assume this is the case and proceed to creating a new session.
            _this2.onSession(gatewayInfo.name, {
              name: "[new session]",
              model: null,
              options: serverSettings,
              kernelSpecs: kernelSpecs
            });
          }
        })();
      } catch (e) {
        atom.notifications.addError("Connection to gateway failed");
        this.listView.cancel();
      }
    })
  }, {
    key: "onSession",
    value: _asyncToGenerator(function* (gatewayName, sessionInfo) {
      var _this3 = this;

      if (!sessionInfo.model) {
        if (!sessionInfo.name) {
          yield this.listView.selectListView.update({
            items: [],
            errorMessage: "This gateway does not support listing sessions",
            loadingMessage: null,
            infoMessage: null
          });
        }
        var items = _lodash2["default"].map(sessionInfo.kernelSpecs, function (spec) {
          var options = {
            serverSettings: sessionInfo.options,
            kernelName: spec.name,
            path: _this3._path
          };
          return {
            name: spec.display_name,
            options: options
          };
        });

        this.listView.onConfirmed = this.startSession.bind(this, gatewayName);
        yield this.listView.selectListView.update({
          items: items,
          emptyMessage: "No kernel specs available",
          infoMessage: "Select a session",
          loadingMessage: null
        });
      } else {
        this.onSessionChosen(gatewayName, (yield _jupyterlabServices.Session.connectTo(sessionInfo.model.id, sessionInfo.options)));
      }
    })
  }, {
    key: "startSession",
    value: function startSession(gatewayName, sessionInfo) {
      _jupyterlabServices.Session.startNew(sessionInfo.options).then(this.onSessionChosen.bind(this, gatewayName));
    }
  }, {
    key: "onSessionChosen",
    value: _asyncToGenerator(function* (gatewayName, session) {
      this.listView.cancel();
      var kernelSpec = yield session.kernel.getSpec();
      if (!_store2["default"].grammar) return;

      var kernel = new _wsKernel2["default"](gatewayName, kernelSpec, _store2["default"].grammar, session);
      this._onChosen(kernel);
    })
  }]);

  return WSKernelPicker;
})();

exports["default"] = WSKernelPicker;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwtcGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3NCQUMvQixRQUFROzs7O3VCQUNGLFNBQVM7Ozs7c0JBQ2QsU0FBUzs7OztrQkFDVCxJQUFJOzs7OzhCQUNILGdCQUFnQjs7OztrQ0FDa0Isc0JBQXNCOztzQkFFckQsVUFBVTs7Ozt3QkFDUixhQUFhOzs7O3FCQUNoQixTQUFTOzs7O0lBRXJCLGNBQWM7QUFNUCxXQU5QLGNBQWMsR0FNSjs7OzBCQU5WLGNBQWM7O1NBQ2xCLFdBQVcsR0FBYSxZQUFNLEVBQUU7O0FBTTlCLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO0FBQ3ZELFFBQUksQ0FBQyxjQUFjLEdBQUcsZ0NBQW1CO0FBQ3ZDLG9CQUFjLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDL0IsV0FBSyxFQUFFLEVBQUU7QUFDVCxzQkFBZ0IsRUFBRSwwQkFBQSxJQUFJO2VBQUksSUFBSSxDQUFDLElBQUk7T0FBQTtBQUNuQyxvQkFBYyxFQUFFLHdCQUFBLElBQUksRUFBSTtBQUN0QixZQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLGVBQU8sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNoQyxlQUFPLE9BQU8sQ0FBQztPQUNoQjtBQUNELHlCQUFtQixFQUFFLDZCQUFBLElBQUksRUFBSTtBQUMzQixZQUFJLE1BQUssV0FBVyxFQUFFLE1BQUssV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlDO0FBQ0Qsd0JBQWtCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0tBQ3hDLENBQUMsQ0FBQztHQUNKOztlQXRCRyxjQUFjOztXQXdCZCxnQkFBRztBQUNMLFVBQUksQ0FBQyxJQUFJLENBQUMs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QUMsSUFBSSxDQUN4QyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQzdDLENBQUM7S0FDSDs7OzZCQUVvQixXQUFDLFdBQW1CLEVBQUUsT0FBWSxFQUFFO0FBQ3ZELFVBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkIsVUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xELFVBQUksQ0FBQyxtQkFBTSxPQUFPLEVBQUUsT0FBTzs7QUFFM0IsVUFBTSxNQUFNLEdBQUcsMEJBQ2IsV0FBVyxFQUNYLFVBQVUsRUFDVixtQkFBTSxPQUFPLEVBQ2IsT0FBTyxDQUNSLENBQUM7QUFDRixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCOzs7U0FoS2tCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwtcGlja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gXCJhdG9tLXNlbGVjdC1saXN0XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgdGlsZGlmeSBmcm9tIFwidGlsZGlmeVwiO1xuaW1wb3J0IHY0IGZyb20gXCJ1dWlkL3Y0XCI7XG5pbXBvcnQgd3MgZnJvbSBcIndzXCI7XG5pbXBvcnQgeGhyIGZyb20gXCJ4bWxodHRwcmVxdWVzdFwiO1xuaW1wb3J0IHsgS2VybmVsLCBTZXNzaW9uLCBTZXJ2ZXJDb25uZWN0aW9uIH0gZnJvbSBcIkBqdXB5dGVybGFiL3NlcnZpY2VzXCI7XG5cbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgV1NLZXJuZWwgZnJvbSBcIi4vd3Mta2VybmVsXCI7XG5pbXBvcnQgc3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxuY2xhc3MgQ3VzdG9tTGlzdFZpZXcge1xuICBvbkNvbmZpcm1lZDogRnVuY3Rpb24gPSAoKSA9PiB7fTtcbiAgcHJldmlvdXNseUZvY3VzZWRFbGVtZW50OiA/SFRNTEVsZW1lbnQ7XG4gIHNlbGVjdExpc3RWaWV3OiBTZWxlY3RMaXN0VmlldztcbiAgcGFuZWw6ID9hdG9tJFBhbmVsO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3ID0gbmV3IFNlbGVjdExpc3RWaWV3KHtcbiAgICAgIGl0ZW1zQ2xhc3NMaXN0OiBbXCJtYXJrLWFjdGl2ZVwiXSxcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIGZpbHRlcktleUZvckl0ZW06IGl0ZW0gPT4gaXRlbS5uYW1lLFxuICAgICAgZWxlbWVudEZvckl0ZW06IGl0ZW0gPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgICBlbGVtZW50LnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiBpdGVtID0+IHtcbiAgICAgICAgaWYgKHRoaXMub25Db25maXJtZWQpIHRoaXMub25Db25maXJtZWQoaXRlbSk7XG4gICAgICB9LFxuICAgICAgZGlkQ2FuY2VsU2VsZWN0aW9uOiAoKSA9PiB0aGlzLmNhbmNlbCgpXG4gICAgfSk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIGlmICghdGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoeyBpdGVtOiB0aGlzLnNlbGVjdExpc3RWaWV3IH0pO1xuICAgIH1cbiAgICB0aGlzLnBhbmVsLnNob3coKTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0TGlzdFZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLnBhbmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIH1cbiAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICBpZiAodGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQpIHtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdTS2VybmVsUGlja2VyIHtcbiAgX29uQ2hvc2VuOiAoa2VybmVsOiBLZXJuZWwpID0+IHZvaWQ7XG4gIF9rZXJuZWxTcGVjRmlsdGVyOiAoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT4gYm9vbGVhbjtcbiAgX3BhdGg6IHN0cmluZztcbiAgbGlzdFZpZXc6IEN1c3RvbUxpc3RWaWV3O1xuXG4gIGNvbnN0cnVjdG9yKG9uQ2hvc2VuOiAoa2VybmVsOiBLZXJuZWwpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9vbkNob3NlbiA9IG9uQ2hvc2VuO1xuICAgIHRoaXMubGlzdFZpZXcgPSBuZXcgQ3VzdG9tTGlzdFZpZXcoKTtcbiAgfVxuXG4gIGFzeW5jIHRvZ2dsZShfa2VybmVsU3BlY0ZpbHRlcjogKGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMpID0+IGJvb2xlYW4pIHtcbiAgICB0aGlzLmxpc3RWaWV3LnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5fa2VybmVsU3BlY0ZpbHRlciA9IF9rZXJuZWxTcGVjRmlsdGVyO1xuICAgIGNvbnN0IGdhdGV3YXlzID0gQ29uZmlnLmdldEpzb24oXCJnYXRld2F5c1wiKSB8fCBbXTtcbiAgICBpZiAoXy5pc0VtcHR5KGdhdGV3YXlzKSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFwiTm8gcmVtb3RlIGtlcm5lbCBnYXRld2F5cyBhdmFpbGFibGVcIiwge1xuICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICBcIlVzZSB0aGUgSHlkcm9nZW4gcGFja2FnZSBzZXR0aW5ncyB0byBzcGVjaWZ5IHRoZSBsaXN0IG9mIHJlbW90ZSBzZXJ2ZXJzLiBIeWRyb2dlbiBjYW4gdXNlIHJlbW90ZSBrZXJuZWxzIG9uIGVpdGhlciBhIEp1cHl0ZXIgS2VybmVsIEdhdGV3YXkgb3IgSnVweXRlciBub3RlYm9vayBzZXJ2ZXIuXCJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3BhdGggPSBgJHtzdG9yZS5maWxlUGF0aCB8fCBcInVuc2F2ZWRcIn0tJHt2NCgpfWA7XG5cbiAgICB0aGlzLmxpc3RWaWV3Lm9uQ29uZmlybWVkID0gdGhpcy5vbkdhdGV3YXkuYmluZCh0aGlzKTtcblxuICAgIGF3YWl0IHRoaXMubGlzdFZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgIGl0ZW1zOiBnYXRld2F5cyxcbiAgICAgIGluZm9NZXNzYWdlOiBcIlNlbGVjdCBhIGdhdGV3YXlcIixcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBnYXRld2F5cyBhdmFpbGFibGVcIixcbiAgICAgIGxvYWRpbmdNZXNzYWdlOiBudWxsXG4gICAgfSk7XG5cbiAgICB0aGlzLmxpc3RWaWV3LnNob3coKTtcbiAgfVxuXG4gIGFzeW5jIG9uR2F0ZXdheShnYXRld2F5SW5mbzogYW55KSB7XG4gICAgY29uc3Qgc2VydmVyU2V0dGluZ3MgPSBTZXJ2ZXJDb25uZWN0aW9uLm1ha2VTZXR0aW5ncyhcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICB4aHJGYWN0b3J5OiAoKSA9PiBuZXcgeGhyLlhNTEh0dHBSZXF1ZXN0KCksXG4gICAgICAgICAgd3NGYWN0b3J5OiAodXJsLCBwcm90b2NvbCkgPT4gbmV3IHdzKHVybCwgcHJvdG9jb2wpXG4gICAgICAgIH0sXG4gICAgICAgIGdhdGV3YXlJbmZvLm9wdGlvbnNcbiAgICAgIClcbiAgICApO1xuICAgIHRoaXMubGlzdFZpZXcub25Db25maXJtZWQgPSB0aGlzLm9uU2Vzc2lvbi5iaW5kKHRoaXMsIGdhdGV3YXlJbmZvLm5hbWUpO1xuICAgIGF3YWl0IHRoaXMubGlzdFZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIGluZm9NZXNzYWdlOiBudWxsLFxuICAgICAgbG9hZGluZ01lc3NhZ2U6IFwiTG9hZGluZyBzZXNzaW9ucy4uLlwiLFxuICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIHNlc3Npb25zIGF2YWlsYWJsZVwiXG4gICAgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNwZWNNb2RlbHMgPSBhd2FpdCBLZXJuZWwuZ2V0U3BlY3Moc2VydmVyU2V0dGluZ3MpO1xuICAgICAgY29uc3Qga2VybmVsU3BlY3MgPSBfLmZpbHRlcihzcGVjTW9kZWxzLmtlcm5lbHNwZWNzLCBzcGVjID0+XG4gICAgICAgIHRoaXMuX2tlcm5lbFNwZWNGaWx0ZXIoc3BlYylcbiAgICAgICk7XG5cbiAgICAgIGNvbnN0IGtlcm5lbE5hbWVzID0gXy5tYXAoa2VybmVsU3BlY3MsIHNwZWNNb2RlbCA9PiBzcGVjTW9kZWwubmFtZSk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBzZXNzaW9uTW9kZWxzID0gYXdhaXQgU2Vzc2lvbi5saXN0UnVubmluZyhzZXJ2ZXJTZXR0aW5ncyk7XG4gICAgICAgIHNlc3Npb25Nb2RlbHMgPSBzZXNzaW9uTW9kZWxzLmZpbHRlcihtb2RlbCA9PiB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IG1vZGVsLmtlcm5lbCA/IG1vZGVsLmtlcm5lbC5uYW1lIDogbnVsbDtcbiAgICAgICAgICByZXR1cm4gbmFtZSA/IGtlcm5lbE5hbWVzLmluY2x1ZGVzKG5hbWUpIDogdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gc2Vzc2lvbk1vZGVscy5tYXAobW9kZWwgPT4ge1xuICAgICAgICAgIGxldCBuYW1lO1xuICAgICAgICAgIGlmIChtb2RlbC5ub3RlYm9vayAmJiBtb2RlbC5ub3RlYm9vay5wYXRoKSB7XG4gICAgICAgICAgICBuYW1lID0gdGlsZGlmeShtb2RlbC5ub3RlYm9vay5wYXRoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmFtZSA9IGBTZXNzaW9uICR7bW9kZWwuaWR9YDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHsgbmFtZSwgbW9kZWwsIG9wdGlvbnM6IHNlcnZlclNldHRpbmdzIH07XG4gICAgICAgIH0pO1xuICAgICAgICBpdGVtcy51bnNoaWZ0KHtcbiAgICAgICAgICBuYW1lOiBcIltuZXcgc2Vzc2lvbl1cIixcbiAgICAgICAgICBtb2RlbDogbnVsbCxcbiAgICAgICAgICBvcHRpb25zOiBzZXJ2ZXJTZXR0aW5ncyxcbiAgICAgICAgICBrZXJuZWxTcGVjc1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdGhpcy5saXN0Vmlldy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe1xuICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZTogbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmICghZXJyb3IueGhyIHx8IGVycm9yLnhoci5zdGF0dXMgIT09IDQwMykgdGhyb3cgZXJyb3I7XG4gICAgICAgIC8vIEdhdGV3YXlzIG9mZmVyIHRoZSBvcHRpb24gb2YgbmV2ZXIgbGlzdGluZyBzZXNzaW9ucywgZm9yIHNlY3VyaXR5XG4gICAgICAgIC8vIHJlYXNvbnMuXG4gICAgICAgIC8vIEFzc3VtZSB0aGlzIGlzIHRoZSBjYXNlIGFuZCBwcm9jZWVkIHRvIGNyZWF0aW5nIGEgbmV3IHNlc3Npb24uXG4gICAgICAgIHRoaXMub25TZXNzaW9uKGdhdGV3YXlJbmZvLm5hbWUsIHtcbiAgICAgICAgICBuYW1lOiBcIltuZXcgc2Vzc2lvbl1cIixcbiAgICAgICAgICBtb2RlbDogbnVsbCxcbiAgICAgICAgICBvcHRpb25zOiBzZXJ2ZXJTZXR0aW5ncyxcbiAgICAgICAgICBrZXJuZWxTcGVjc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJDb25uZWN0aW9uIHRvIGdhdGV3YXkgZmFpbGVkXCIpO1xuICAgICAgdGhpcy5saXN0Vmlldy5jYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBvblNlc3Npb24oZ2F0ZXdheU5hbWU6IHN0cmluZywgc2Vzc2lvbkluZm86IGFueSkge1xuICAgIGlmICghc2Vzc2lvbkluZm8ubW9kZWwpIHtcbiAgICAgIGlmICghc2Vzc2lvbkluZm8ubmFtZSkge1xuICAgICAgICBhd2FpdCB0aGlzLmxpc3RWaWV3LnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7XG4gICAgICAgICAgaXRlbXM6IFtdLFxuICAgICAgICAgIGVycm9yTWVzc2FnZTogXCJUaGlzIGdhdGV3YXkgZG9lcyBub3Qgc3VwcG9ydCBsaXN0aW5nIHNlc3Npb25zXCIsXG4gICAgICAgICAgbG9hZGluZ01lc3NhZ2U6IG51bGwsXG4gICAgICAgICAgaW5mb01lc3NhZ2U6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjb25zdCBpdGVtcyA9IF8ubWFwKHNlc3Npb25JbmZvLmtlcm5lbFNwZWNzLCBzcGVjID0+IHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzZXJ2ZXJTZXR0aW5nczogc2Vzc2lvbkluZm8ub3B0aW9ucyxcbiAgICAgICAgICBrZXJuZWxOYW1lOiBzcGVjLm5hbWUsXG4gICAgICAgICAgcGF0aDogdGhpcy5fcGF0aFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHNwZWMuZGlzcGxheV9uYW1lLFxuICAgICAgICAgIG9wdGlvbnNcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmxpc3RWaWV3Lm9uQ29uZmlybWVkID0gdGhpcy5zdGFydFNlc3Npb24uYmluZCh0aGlzLCBnYXRld2F5TmFtZSk7XG4gICAgICBhd2FpdCB0aGlzLmxpc3RWaWV3LnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7XG4gICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgZW1wdHlNZXNzYWdlOiBcIk5vIGtlcm5lbCBzcGVjcyBhdmFpbGFibGVcIixcbiAgICAgICAgaW5mb01lc3NhZ2U6IFwiU2VsZWN0IGEgc2Vzc2lvblwiLFxuICAgICAgICBsb2FkaW5nTWVzc2FnZTogbnVsbFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25TZXNzaW9uQ2hvc2VuKFxuICAgICAgICBnYXRld2F5TmFtZSxcbiAgICAgICAgYXdhaXQgU2Vzc2lvbi5jb25uZWN0VG8oc2Vzc2lvbkluZm8ubW9kZWwuaWQsIHNlc3Npb25JbmZvLm9wdGlvbnMpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0U2Vzc2lvbihnYXRld2F5TmFtZTogc3RyaW5nLCBzZXNzaW9uSW5mbzogYW55KSB7XG4gICAgU2Vzc2lvbi5zdGFydE5ldyhzZXNzaW9uSW5mby5vcHRpb25zKS50aGVuKFxuICAgICAgdGhpcy5vblNlc3Npb25DaG9zZW4uYmluZCh0aGlzLCBnYXRld2F5TmFtZSlcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgb25TZXNzaW9uQ2hvc2VuKGdhdGV3YXlOYW1lOiBzdHJpbmcsIHNlc3Npb246IGFueSkge1xuICAgIHRoaXMubGlzdFZpZXcuY2FuY2VsKCk7XG4gICAgY29uc3Qga2VybmVsU3BlYyA9IGF3YWl0IHNlc3Npb24ua2VybmVsLmdldFNwZWMoKTtcbiAgICBpZiAoIXN0b3JlLmdyYW1tYXIpIHJldHVybjtcblxuICAgIGNvbnN0IGtlcm5lbCA9IG5ldyBXU0tlcm5lbChcbiAgICAgIGdhdGV3YXlOYW1lLFxuICAgICAga2VybmVsU3BlYyxcbiAgICAgIHN0b3JlLmdyYW1tYXIsXG4gICAgICBzZXNzaW9uXG4gICAgKTtcbiAgICB0aGlzLl9vbkNob3NlbihrZXJuZWwpO1xuICB9XG59XG4iXX0=