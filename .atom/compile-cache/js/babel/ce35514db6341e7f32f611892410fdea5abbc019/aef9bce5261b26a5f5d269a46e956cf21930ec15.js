"use babel";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ = require("underscore-plus");
var Base = require("./base");

var Operator = (function (_Base) {
  _inherits(Operator, _Base);

  function Operator() {
    _classCallCheck(this, Operator);

    _get(Object.getPrototypeOf(Operator.prototype), "constructor", this).apply(this, arguments);

    this.requireTarget = true;
    this.recordable = true;
    this.wise = null;
    this.occurrence = false;
    this.occurrenceType = "base";
    this.flashTarget = true;
    this.flashCheckpoint = "did-finish";
    this.flashType = "operator";
    this.flashTypeForOccurrence = "operator-occurrence";
    this.trackChange = false;
    this.patternForOccurrence = null;
    this.stayAtSamePosition = null;
    this.stayOptionName = null;
    this.stayByMarker = false;
    this.restorePositions = true;
    this.setToFirstCharacterOnLinewise = false;
    this.acceptPresetOccurrence = true;
    this.acceptPersistentSelection = true;
    this.bufferCheckpointByPurpose = null;
    this.mutateSelectionOrderd = false;
    this.supportEarlySelect = false;
    this.targetSelected = null;
  }

  _createClass(Operator, [{
    key: "canEarlySelect",
    value: function canEarlySelect() {
      return this.supportEarlySelect && !this.repeated;
    }

    // -------------------------

    // Called when operation finished
    // This is essentially to reset state for `.` repeat.
  }, {
    key: "resetState",
    value: function resetState() {
      this.targetSelected = null;
      this.occurrenceSelected = false;
    }

    // Two checkpoint for different purpose
    // - one for undo(handled by modeManager)
    // - one for preserve last inserted text
  }, {
    key: "createBufferCheckpoint",
    value: function createBufferCheckpoint(purpose) {
      if (!this.bufferCheckpointByPurpose) this.bufferCheckpointByPurpose = {};
      this.bufferCheckpointByPurpose[purpose] = this.editor.createCheckpoint();
    }
  }, {
    key: "getBufferCheckpoint",
    value: function getBufferCheckpoint(purpose) {
      if (this.bufferCheckpointByPurpose) {
        return this.bufferCheckpointByPurpose[purpose];
      }
    }
  }, {
    key: "deleteBufferCheckpoint",
    value: function deleteBufferCheckpoint(purpose) {
      if (this.bufferCheckpointByPurpose) {
        delete this.bufferCheckpointByPurpose[purpose];
      }
    }
  }, {
    key: "groupChangesSinceBufferCheckpoint",
    value: function groupChangesSinceBufferCheckpoint(purpose) {
      var checkpoint = this.getBufferCheckpoint(purpose);
      if (checkpoint) {
        this.editor.groupChangesSinceCheckpoint(checkpoint);
        this.deleteBufferCheckpoint(purpose);
      }
    }
  }, {
    key: "setMarkForChange",
    value: function setMarkForChange(range) {
      this.vimState.mark.set("[", range.start);
      this.vimState.mark.set("]", range.end);
    }
  }, {
    key: "needFlash",
    value: function needFlash() {
      return this.flashTarget && this.getConfig("flashOnOperate") && !this.getConfig("flashOnOperateBlacklist").includes(this.name) && (this.mode !== "visual" || this.submode !== this.target.wise) // e.g. Y in vC
      ;
    }
  }, {
    key: "flashIfNecessary",
    value: function flashIfNecessary(ranges) {
      if (this.needFlash()) {
        this.vimState.flash(ranges, { type: this.getFlashType() });
      }
    }
  }, {
    key: "flashChangeIfNecessary",
    value: function flashChangeIfNecessary() {
      var _this = this;

      if (this.needFlash()) {
        this.onDidFinishOperation(function () {
          var ranges = _this.mutationManager.getSelectedBufferRangesForCheckpoint(_this.flashCheckpoint);
          _this.vimState.flash(ranges, { type: _this.getFlashType() });
        });
      }
    }
  }, {
    key: "getFlashType",
    value: function getFlashType() {
      return this.occurrenceSelected ? this.flashTypeForOccurrence : this.flashType;
    }
  }, {
    key: "trackChangeIfNecessary",
    value: function trackChangeIfNecessary() {
      var _this2 = this;

      if (!this.trackChange) return;
      this.onDidFinishOperation(function () {
        var range = _this2.mutationManager.getMutatedBufferRangeForSelection(_this2.editor.getLastSelection());
        if (range) _this2.setMarkForChange(range);
      });
    }
  }, {
    key: "initialize",
    value: function initialize() {
      this.subscribeResetOccurrencePatternIfNeeded();

      // When preset-occurrence was exists, operate on occurrence-wise
      if (this.acceptPresetOccurrence && this.occurrenceManager.hasMarkers()) {
        this.occurrence = true;
      }

      // [FIXME] ORDER-MATTER
      // To pick cursor-word to find occurrence base pattern.
      // This has to be done BEFORE converting persistent-selection into real-selection.
      // Since when persistent-selection is actually selected, it change cursor position.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        var regex = this.patternForOccurrence || this.getPatternForOccurrenceType(this.occurrenceType);
        this.occurrenceManager.addPattern(regex);
      }

      // This change cursor position.
      if (this.selectPersistentSelectionIfNecessary()) {
        // [FIXME] selection-wise is not synched if it already visual-mode
        if (this.mode !== "visual") {
          this.vimState.modeManager.activate("visual", this.swrap.detectWise(this.editor));
        }
      }

      if (this.mode === "visual" && this.requireTarget) {
        this.target = "CurrentSelection";
      }
      if (_.isString(this.target)) {
        this.setTarget(this.getInstance(this.target));
      }

      _get(Object.getPrototypeOf(Operator.prototype), "initialize", this).call(this);
    }
  }, {
    key: "subscribeResetOccurrencePatternIfNeeded",
    value: function subscribeResetOccurrencePatternIfNeeded() {
      var _this3 = this;

      // [CAUTION]
      // This method has to be called in PROPER timing.
      // If occurrence is true but no preset-occurrence
      // Treat that `occurrence` is BOUNDED to operator itself, so cleanp at finished.
      if (this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.onDidResetOperationStack(function () {
          return _this3.occurrenceManager.resetPatterns();
        });
      }
    }
  }, {
    key: "setModifier",
    value: function setModifier(_ref) {
      var _this4 = this;

      var wise = _ref.wise;
      var occurrence = _ref.occurrence;
      var occurrenceType = _ref.occurrenceType;

      if (wise) {
        this.wise = wise;
      } else if (occurrence) {
        this.occurrence = occurrence;
        this.occurrenceType = occurrenceType;
        // This is o modifier case(e.g. `c o p`, `d O f`)
        // We RESET existing occurence-marker when `o` or `O` modifier is typed by user.
        var regex = this.getPatternForOccurrenceType(occurrenceType);
        this.occurrenceManager.addPattern(regex, { reset: true, occurrenceType: occurrenceType });
        this.onDidResetOperationStack(function () {
          return _this4.occurrenceManager.resetPatterns();
        });
      }
    }

    // return true/false to indicate success
  }, {
    key: "selectPersistentSelectionIfNecessary",
    value: function selectPersistentSelectionIfNecessary() {
      if (this.acceptPersistentSelection && this.getConfig("autoSelectPersistentSelectionOnOperate") && !this.persistentSelection.isEmpty()) {
        this.persistentSelection.select();
        this.editor.mergeIntersectingSelections();
        this.swrap.saveProperties(this.editor);

        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "getPatternForOccurrenceType",
    value: function getPatternForOccurrenceType(occurrenceType) {
      if (occurrenceType === "base") {
        return this.utils.getWordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      } else if (occurrenceType === "subword") {
        return this.utils.getSubwordPatternAtBufferPosition(this.editor, this.getCursorBufferPosition());
      }
    }

    // target is TextObject or Motion to operate on.
  }, {
    key: "setTarget",
    value: function setTarget(target) {
      this.target = target;
      this.target.operator = this;
      this.emitDidSetTarget(this);

      if (this.canEarlySelect()) {
        this.normalizeSelectionsIfNecessary();
        this.createBufferCheckpoint("undo");
        this.selectTarget();
      }
    }
  }, {
    key: "setTextToRegisterForSelection",
    value: function setTextToRegisterForSelection(selection) {
      this.setTextToRegister(selection.getText(), selection);
    }
  }, {
    key: "setTextToRegister",
    value: function setTextToRegister(text, selection) {
      if (this.vimState.register.isUnnamed() && this.isBlackholeRegisteredOperator()) {
        return;
      }

      if (this.target.isLinewise() && !text.endsWith("\n")) {
        text += "\n";
      }

      if (text) {
        this.vimState.register.set(null, { text: text, selection: selection });

        if (this.vimState.register.isUnnamed()) {
          if (this["instanceof"]("Delete") || this["instanceof"]("Change")) {
            if (!this.needSaveToNumberedRegister(this.target) && this.utils.isSingleLineText(text)) {
              this.vimState.register.set("-", { text: text, selection: selection }); // small-change
            } else {
                this.vimState.register.set("1", { text: text, selection: selection });
              }
          } else if (this["instanceof"]("Yank")) {
            this.vimState.register.set("0", { text: text, selection: selection });
          }
        }
      }
    }
  }, {
    key: "isBlackholeRegisteredOperator",
    value: function isBlackholeRegisteredOperator() {
      var operators = this.getConfig("blackholeRegisteredOperators");
      var wildCardOperators = operators.filter(function (name) {
        return name.endsWith("*");
      });
      var commandName = this.getCommandNameWithoutPrefix();
      return wildCardOperators.some(function (name) {
        return new RegExp("^" + name.replace("*", ".*")).test(commandName);
      }) || operators.includes(commandName);
    }
  }, {
    key: "needSaveToNumberedRegister",
    value: function needSaveToNumberedRegister(target) {
      // Used to determine what register to use on change and delete operation.
      // Following motion should save to 1-9 register regerdless of content is small or big.
      var goesToNumberedRegisterMotionNames = ["MoveToPair", // %
      "MoveToNextSentence", // (, )
      "Search", // /, ?, n, N
      "MoveToNextParagraph"];
      // {, }
      return goesToNumberedRegisterMotionNames.some(function (name) {
        return target["instanceof"](name);
      });
    }
  }, {
    key: "normalizeSelectionsIfNecessary",
    value: function normalizeSelectionsIfNecessary() {
      if (this.mode === "visual" && this.target && this.target.isMotion()) {
        this.swrap.normalize(this.editor);
      }
    }
  }, {
    key: "startMutation",
    value: function startMutation(fn) {
      var _this5 = this;

      if (this.canEarlySelect()) {
        // - Skip selection normalization: already normalized before @selectTarget()
        // - Manual checkpoint grouping: to create checkpoint before @selectTarget()
        fn();
        this.emitWillFinishMutation();
        this.groupChangesSinceBufferCheckpoint("undo");
      } else {
        this.normalizeSelectionsIfNecessary();
        this.editor.transact(function () {
          fn();
          _this5.emitWillFinishMutation();
        });
      }

      this.emitDidFinishMutation();
    }

    // Main
  }, {
    key: "execute",
    value: function execute() {
      var _this6 = this;

      this.startMutation(function () {
        if (_this6.selectTarget()) {
          var selections = _this6.mutateSelectionOrderd ? _this6.editor.getSelectionsOrderedByBufferPosition() : _this6.editor.getSelections();

          for (var selection of selections) {
            _this6.mutateSelection(selection);
          }
          _this6.mutationManager.setCheckpoint("did-finish");
          _this6.restoreCursorPositionsIfNecessary();
        }
      });

      // Even though we fail to select target and fail to mutate,
      // we have to return to normal-mode from operator-pending or visual
      this.activateMode("normal");
    }

    // Return true unless all selection is empty.
  }, {
    key: "selectTarget",
    value: function selectTarget() {
      if (this.targetSelected != null) {
        return this.targetSelected;
      }
      this.mutationManager.init({ stayByMarker: this.stayByMarker });

      if (this.target.isMotion() && this.mode === "visual") this.target.wise = this.submode;
      if (this.wise != null) this.target.forceWise(this.wise);

      this.emitWillSelectTarget();

      // Allow cursor position adjustment 'on-will-select-target' hook.
      // so checkpoint comes AFTER @emitWillSelectTarget()
      this.mutationManager.setCheckpoint("will-select");

      // NOTE: When repeated, set occurrence-marker from pattern stored as state.
      if (this.repeated && this.occurrence && !this.occurrenceManager.hasMarkers()) {
        this.occurrenceManager.addPattern(this.patternForOccurrence, { occurrenceType: this.occurrenceType });
      }

      this.target.execute();

      this.mutationManager.setCheckpoint("did-select");
      if (this.occurrence) {
        if (!this.patternForOccurrence) {
          // Preserve occurrencePattern for . repeat.
          this.patternForOccurrence = this.occurrenceManager.buildPattern();
        }

        this.occurrenceWise = this.wise || "characterwise";
        if (this.occurrenceManager.select(this.occurrenceWise)) {
          this.occurrenceSelected = true;
          this.mutationManager.setCheckpoint("did-select-occurrence");
        }
      }

      this.targetSelected = this.vimState.haveSomeNonEmptySelection() || this.target.name === "Empty";
      if (this.targetSelected) {
        this.emitDidSelectTarget();
        this.flashChangeIfNecessary();
        this.trackChangeIfNecessary();
      } else {
        this.emitDidFailSelectTarget();
      }

      return this.targetSelected;
    }
  }, {
    key: "restoreCursorPositionsIfNecessary",
    value: function restoreCursorPositionsIfNecessary() {
      if (!this.restorePositions) return;

      var stay = this.stayAtSamePosition != null ? this.stayAtSamePosition : this.getConfig(this.stayOptionName) || this.occurrenceSelected && this.getConfig("stayOnOccurrence");
      var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
      var setToFirstCharacterOnLinewise = this.setToFirstCharacterOnLinewise;

      this.mutationManager.restoreCursorPositions({ stay: stay, wise: wise, setToFirstCharacterOnLinewise: setToFirstCharacterOnLinewise });
    }
  }], [{
    key: "operationKind",
    value: "operator",
    enumerable: true
  }]);

  return Operator;
})(Base);

Operator.register(false);

var SelectBase = (function (_Operator) {
  _inherits(SelectBase, _Operator);

  function SelectBase() {
    _classCallCheck(this, SelectBase);

    _get(Object.getPrototypeOf(SelectBase.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.recordable = false;
  }

  _createClass(SelectBase, [{
    key: "execute",
    value: function execute() {
      var _this7 = this;

      this.startMutation(function () {
        return _this7.selectTarget();
      });

      if (this.target.selectSucceeded) {
        if (this.target.isTextObject()) {
          this.editor.scrollToCursorPosition();
        }
        var wise = this.occurrenceSelected ? this.occurrenceWise : this.target.wise;
        this.activateModeIfNecessary("visual", wise);
      } else {
        this.cancelOperation();
      }
    }
  }]);

  return SelectBase;
})(Operator);

SelectBase.register(false);

var Select = (function (_SelectBase) {
  _inherits(Select, _SelectBase);

  function Select() {
    _classCallCheck(this, Select);

    _get(Object.getPrototypeOf(Select.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Select, [{
    key: "execute",
    value: function execute() {
      this.swrap.saveProperties(this.editor);
      _get(Object.getPrototypeOf(Select.prototype), "execute", this).call(this);
    }
  }]);

  return Select;
})(SelectBase);

Select.register();

var SelectLatestChange = (function (_SelectBase2) {
  _inherits(SelectLatestChange, _SelectBase2);

  function SelectLatestChange() {
    _classCallCheck(this, SelectLatestChange);

    _get(Object.getPrototypeOf(SelectLatestChange.prototype), "constructor", this).apply(this, arguments);

    this.target = "ALatestChange";
  }

  return SelectLatestChange;
})(SelectBase);

SelectLatestChange.register();

var SelectPreviousSelection = (function (_SelectBase3) {
  _inherits(SelectPreviousSelection, _SelectBase3);

  function SelectPreviousSelection() {
    _classCallCheck(this, SelectPreviousSelection);

    _get(Object.getPrototypeOf(SelectPreviousSelection.prototype), "constructor", this).apply(this, arguments);

    this.target = "PreviousSelection";
  }

  return SelectPreviousSelection;
})(SelectBase);

SelectPreviousSelection.register();

var SelectPersistentSelection = (function (_SelectBase4) {
  _inherits(SelectPersistentSelection, _SelectBase4);

  function SelectPersistentSelection() {
    _classCallCheck(this, SelectPersistentSelection);

    _get(Object.getPrototypeOf(SelectPersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.target = "APersistentSelection";
    this.acceptPersistentSelection = false;
  }

  return SelectPersistentSelection;
})(SelectBase);

SelectPersistentSelection.register();

var SelectOccurrence = (function (_SelectBase5) {
  _inherits(SelectOccurrence, _SelectBase5);

  function SelectOccurrence() {
    _classCallCheck(this, SelectOccurrence);

    _get(Object.getPrototypeOf(SelectOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrence = true;
  }

  return SelectOccurrence;
})(SelectBase);

SelectOccurrence.register();

// SelectInVisualMode: used in visual-mode
// When text-object is invoked from normal or viusal-mode, operation would be
//  => SelectInVisualMode operator with target=text-object
// When motion is invoked from visual-mode, operation would be
//  => SelectInVisualMode operator with target=motion)
// ================================
// SelectInVisualMode is used in TWO situation.
// - visual-mode operation
//   - e.g: `v l`, `V j`, `v i p`...
// - Directly invoke text-object from normal-mode
//   - e.g: Invoke `Inner Paragraph` from command-palette.

var SelectInVisualMode = (function (_SelectBase6) {
  _inherits(SelectInVisualMode, _SelectBase6);

  function SelectInVisualMode() {
    _classCallCheck(this, SelectInVisualMode);

    _get(Object.getPrototypeOf(SelectInVisualMode.prototype), "constructor", this).apply(this, arguments);

    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  return SelectInVisualMode;
})(SelectBase);

SelectInVisualMode.register(false);

// Persistent Selection
// =========================

var CreatePersistentSelection = (function (_Operator2) {
  _inherits(CreatePersistentSelection, _Operator2);

  function CreatePersistentSelection() {
    _classCallCheck(this, CreatePersistentSelection);

    _get(Object.getPrototypeOf(CreatePersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.stayAtSamePosition = true;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
  }

  _createClass(CreatePersistentSelection, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      this.persistentSelection.markBufferRange(selection.getBufferRange());
    }
  }]);

  return CreatePersistentSelection;
})(Operator);

CreatePersistentSelection.register();

var TogglePersistentSelection = (function (_CreatePersistentSelection) {
  _inherits(TogglePersistentSelection, _CreatePersistentSelection);

  function TogglePersistentSelection() {
    _classCallCheck(this, TogglePersistentSelection);

    _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(TogglePersistentSelection, [{
    key: "isComplete",
    value: function isComplete() {
      var point = this.editor.getCursorBufferPosition();
      this.markerToRemove = this.persistentSelection.getMarkerAtPoint(point);
      return this.markerToRemove || _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "isComplete", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      if (this.markerToRemove) {
        this.markerToRemove.destroy();
      } else {
        _get(Object.getPrototypeOf(TogglePersistentSelection.prototype), "execute", this).call(this);
      }
    }
  }]);

  return TogglePersistentSelection;
})(CreatePersistentSelection);

TogglePersistentSelection.register();

// Preset Occurrence
// =========================

var TogglePresetOccurrence = (function (_Operator3) {
  _inherits(TogglePresetOccurrence, _Operator3);

  function TogglePresetOccurrence() {
    _classCallCheck(this, TogglePresetOccurrence);

    _get(Object.getPrototypeOf(TogglePresetOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.target = "Empty";
    this.flashTarget = false;
    this.acceptPresetOccurrence = false;
    this.acceptPersistentSelection = false;
    this.occurrenceType = "base";
  }

  _createClass(TogglePresetOccurrence, [{
    key: "execute",
    value: function execute() {
      var marker = this.occurrenceManager.getMarkerAtPoint(this.editor.getCursorBufferPosition());
      if (marker) {
        this.occurrenceManager.destroyMarkers([marker]);
      } else {
        var isNarrowed = this.vimState.modeManager.isNarrowed();

        var regex = undefined;
        if (this.mode === "visual" && !isNarrowed) {
          this.occurrenceType = "base";
          regex = new RegExp(_.escapeRegExp(this.editor.getSelectedText()), "g");
        } else {
          regex = this.getPatternForOccurrenceType(this.occurrenceType);
        }

        this.occurrenceManager.addPattern(regex, { occurrenceType: this.occurrenceType });
        this.occurrenceManager.saveLastPattern(this.occurrenceType);

        if (!isNarrowed) this.activateMode("normal");
      }
    }
  }]);

  return TogglePresetOccurrence;
})(Operator);

TogglePresetOccurrence.register();

var TogglePresetSubwordOccurrence = (function (_TogglePresetOccurrence) {
  _inherits(TogglePresetSubwordOccurrence, _TogglePresetOccurrence);

  function TogglePresetSubwordOccurrence() {
    _classCallCheck(this, TogglePresetSubwordOccurrence);

    _get(Object.getPrototypeOf(TogglePresetSubwordOccurrence.prototype), "constructor", this).apply(this, arguments);

    this.occurrenceType = "subword";
  }

  return TogglePresetSubwordOccurrence;
})(TogglePresetOccurrence);

TogglePresetSubwordOccurrence.register();

// Want to rename RestoreOccurrenceMarker

var AddPresetOccurrenceFromLastOccurrencePattern = (function (_TogglePresetOccurrence2) {
  _inherits(AddPresetOccurrenceFromLastOccurrencePattern, _TogglePresetOccurrence2);

  function AddPresetOccurrenceFromLastOccurrencePattern() {
    _classCallCheck(this, AddPresetOccurrenceFromLastOccurrencePattern);

    _get(Object.getPrototypeOf(AddPresetOccurrenceFromLastOccurrencePattern.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(AddPresetOccurrenceFromLastOccurrencePattern, [{
    key: "execute",
    value: function execute() {
      this.occurrenceManager.resetPatterns();
      var regex = this.globalState.get("lastOccurrencePattern");
      if (regex) {
        var occurrenceType = this.globalState.get("lastOccurrenceType");
        this.occurrenceManager.addPattern(regex, { occurrenceType: occurrenceType });
        this.activateMode("normal");
      }
    }
  }]);

  return AddPresetOccurrenceFromLastOccurrencePattern;
})(TogglePresetOccurrence);

AddPresetOccurrenceFromLastOccurrencePattern.register();

// Delete
// ================================

var Delete = (function (_Operator4) {
  _inherits(Delete, _Operator4);

  function Delete() {
    _classCallCheck(this, Delete);

    _get(Object.getPrototypeOf(Delete.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.flashCheckpoint = "did-select-occurrence";
    this.flashTypeForOccurrence = "operator-remove-occurrence";
    this.stayOptionName = "stayOnDelete";
    this.setToFirstCharacterOnLinewise = true;
  }

  _createClass(Delete, [{
    key: "execute",
    value: function execute() {
      var _this8 = this;

      this.onDidSelectTarget(function () {
        if (_this8.occurrenceSelected && _this8.occurrenceWise === "linewise") {
          _this8.flashTarget = false;
        }
      });

      if (this.target.wise === "blockwise") {
        this.restorePositions = false;
      }
      _get(Object.getPrototypeOf(Delete.prototype), "execute", this).call(this);
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      this.setTextToRegisterForSelection(selection);
      selection.deleteSelectedText();
    }
  }]);

  return Delete;
})(Operator);

Delete.register();

var DeleteRight = (function (_Delete) {
  _inherits(DeleteRight, _Delete);

  function DeleteRight() {
    _classCallCheck(this, DeleteRight);

    _get(Object.getPrototypeOf(DeleteRight.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveRight";
  }

  return DeleteRight;
})(Delete);

DeleteRight.register();

var DeleteLeft = (function (_Delete2) {
  _inherits(DeleteLeft, _Delete2);

  function DeleteLeft() {
    _classCallCheck(this, DeleteLeft);

    _get(Object.getPrototypeOf(DeleteLeft.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveLeft";
  }

  return DeleteLeft;
})(Delete);

DeleteLeft.register();

var DeleteToLastCharacterOfLine = (function (_Delete3) {
  _inherits(DeleteToLastCharacterOfLine, _Delete3);

  function DeleteToLastCharacterOfLine() {
    _classCallCheck(this, DeleteToLastCharacterOfLine);

    _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToLastCharacterOfLine";
  }

  _createClass(DeleteToLastCharacterOfLine, [{
    key: "execute",
    value: function execute() {
      var _this9 = this;

      this.onDidSelectTarget(function () {
        if (_this9.target.wise === "blockwise") {
          for (var blockwiseSelection of _this9.getBlockwiseSelections()) {
            blockwiseSelection.extendMemberSelectionsToEndOfLine();
          }
        }
      });
      _get(Object.getPrototypeOf(DeleteToLastCharacterOfLine.prototype), "execute", this).call(this);
    }
  }]);

  return DeleteToLastCharacterOfLine;
})(Delete);

DeleteToLastCharacterOfLine.register();

var DeleteLine = (function (_Delete4) {
  _inherits(DeleteLine, _Delete4);

  function DeleteLine() {
    _classCallCheck(this, DeleteLine);

    _get(Object.getPrototypeOf(DeleteLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
    this.flashTarget = false;
  }

  return DeleteLine;
})(Delete);

DeleteLine.register();

// Yank
// =========================

var Yank = (function (_Operator5) {
  _inherits(Yank, _Operator5);

  function Yank() {
    _classCallCheck(this, Yank);

    _get(Object.getPrototypeOf(Yank.prototype), "constructor", this).apply(this, arguments);

    this.trackChange = true;
    this.stayOptionName = "stayOnYank";
  }

  _createClass(Yank, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      this.setTextToRegisterForSelection(selection);
    }
  }]);

  return Yank;
})(Operator);

Yank.register();

var YankLine = (function (_Yank) {
  _inherits(YankLine, _Yank);

  function YankLine() {
    _classCallCheck(this, YankLine);

    _get(Object.getPrototypeOf(YankLine.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.target = "MoveToRelativeLine";
  }

  return YankLine;
})(Yank);

YankLine.register();

var YankToLastCharacterOfLine = (function (_Yank2) {
  _inherits(YankToLastCharacterOfLine, _Yank2);

  function YankToLastCharacterOfLine() {
    _classCallCheck(this, YankToLastCharacterOfLine);

    _get(Object.getPrototypeOf(YankToLastCharacterOfLine.prototype), "constructor", this).apply(this, arguments);

    this.target = "MoveToLastCharacterOfLine";
  }

  return YankToLastCharacterOfLine;
})(Yank);

YankToLastCharacterOfLine.register();

// -------------------------
// [ctrl-a]

var Increase = (function (_Operator6) {
  _inherits(Increase, _Operator6);

  function Increase() {
    _classCallCheck(this, Increase);

    _get(Object.getPrototypeOf(Increase.prototype), "constructor", this).apply(this, arguments);

    this.target = "Empty";
    this.flashTarget = false;
    this.restorePositions = false;
    this.step = 1;
  }

  _createClass(Increase, [{
    key: "execute",
    value: function execute() {
      this.newRanges = [];
      if (!this.regex) this.regex = new RegExp("" + this.getConfig("numberRegex"), "g");

      _get(Object.getPrototypeOf(Increase.prototype), "execute", this).call(this);

      if (this.newRanges.length) {
        if (this.getConfig("flashOnOperate") && !this.getConfig("flashOnOperateBlacklist").includes(this.name)) {
          this.vimState.flash(this.newRanges, { type: this.flashTypeForOccurrence });
        }
      }
    }
  }, {
    key: "replaceNumberInBufferRange",
    value: function replaceNumberInBufferRange(scanRange, fn) {
      var _this10 = this;

      var newRanges = [];
      this.scanForward(this.regex, { scanRange: scanRange }, function (event) {
        if (fn) {
          if (fn(event)) event.stop();else return;
        }
        var nextNumber = _this10.getNextNumber(event.matchText);
        newRanges.push(event.replace(String(nextNumber)));
      });
      return newRanges;
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var _this11 = this;

      var cursor = selection.cursor;

      if (this.target.is("Empty")) {
        (function () {
          // ctrl-a, ctrl-x in `normal-mode`
          var cursorPosition = cursor.getBufferPosition();
          var scanRange = _this11.editor.bufferRangeForBufferRow(cursorPosition.row);
          var newRanges = _this11.replaceNumberInBufferRange(scanRange, function (event) {
            return event.range.end.isGreaterThan(cursorPosition);
          });
          var point = newRanges.length && newRanges[0].end.translate([0, -1]) || cursorPosition;
          cursor.setBufferPosition(point);
        })();
      } else {
        var _newRanges;

        var scanRange = selection.getBufferRange();
        (_newRanges = this.newRanges).push.apply(_newRanges, _toConsumableArray(this.replaceNumberInBufferRange(scanRange)));
        cursor.setBufferPosition(scanRange.start);
      }
    }
  }, {
    key: "getNextNumber",
    value: function getNextNumber(numberString) {
      return Number.parseInt(numberString, 10) + this.step * this.getCount();
    }
  }]);

  return Increase;
})(Operator);

Increase.register();

// [ctrl-x]

var Decrease = (function (_Increase) {
  _inherits(Decrease, _Increase);

  function Decrease() {
    _classCallCheck(this, Decrease);

    _get(Object.getPrototypeOf(Decrease.prototype), "constructor", this).apply(this, arguments);

    this.step = -1;
  }

  return Decrease;
})(Increase);

Decrease.register();

// -------------------------
// [g ctrl-a]

var IncrementNumber = (function (_Increase2) {
  _inherits(IncrementNumber, _Increase2);

  function IncrementNumber() {
    _classCallCheck(this, IncrementNumber);

    _get(Object.getPrototypeOf(IncrementNumber.prototype), "constructor", this).apply(this, arguments);

    this.baseNumber = null;
    this.target = null;
    this.mutateSelectionOrderd = true;
  }

  _createClass(IncrementNumber, [{
    key: "getNextNumber",
    value: function getNextNumber(numberString) {
      if (this.baseNumber != null) {
        this.baseNumber += this.step * this.getCount();
      } else {
        this.baseNumber = Number.parseInt(numberString, 10);
      }
      return this.baseNumber;
    }
  }]);

  return IncrementNumber;
})(Increase);

IncrementNumber.register();

// [g ctrl-x]

var DecrementNumber = (function (_IncrementNumber) {
  _inherits(DecrementNumber, _IncrementNumber);

  function DecrementNumber() {
    _classCallCheck(this, DecrementNumber);

    _get(Object.getPrototypeOf(DecrementNumber.prototype), "constructor", this).apply(this, arguments);

    this.step = -1;
  }

  return DecrementNumber;
})(IncrementNumber);

DecrementNumber.register();

// Put
// -------------------------
// Cursor placement:
// - place at end of mutation: paste non-multiline characterwise text
// - place at start of mutation: non-multiline characterwise text(characterwise, linewise)

var PutBefore = (function (_Operator7) {
  _inherits(PutBefore, _Operator7);

  function PutBefore() {
    _classCallCheck(this, PutBefore);

    _get(Object.getPrototypeOf(PutBefore.prototype), "constructor", this).apply(this, arguments);

    this.location = "before";
    this.target = "Empty";
    this.flashType = "operator-long";
    this.restorePositions = false;
    this.flashTarget = false;
    this.trackChange = false;
  }

  _createClass(PutBefore, [{
    key: "initialize",
    // manage manually

    value: function initialize() {
      this.vimState.sequentialPasteManager.onInitialize(this);
      _get(Object.getPrototypeOf(PutBefore.prototype), "initialize", this).call(this);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this12 = this;

      this.mutationsBySelection = new Map();
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);

      this.onDidFinishMutation(function () {
        if (!_this12.cancelled) _this12.adjustCursorPosition();
      });

      _get(Object.getPrototypeOf(PutBefore.prototype), "execute", this).call(this);

      if (this.cancelled) return;

      this.onDidFinishOperation(function () {
        // TrackChange
        var newRange = _this12.mutationsBySelection.get(_this12.editor.getLastSelection());
        if (newRange) _this12.setMarkForChange(newRange);

        // Flash
        if (_this12.getConfig("flashOnOperate") && !_this12.getConfig("flashOnOperateBlacklist").includes(_this12.name)) {
          var ranges = _this12.editor.getSelections().map(function (selection) {
            return _this12.mutationsBySelection.get(selection);
          });
          _this12.vimState.flash(ranges, { type: _this12.getFlashType() });
        }
      });
    }
  }, {
    key: "adjustCursorPosition",
    value: function adjustCursorPosition() {
      for (var selection of this.editor.getSelections()) {
        if (!this.mutationsBySelection.has(selection)) continue;

        var cursor = selection.cursor;

        var newRange = this.mutationsBySelection.get(selection);
        if (this.linewisePaste) {
          this.utils.moveCursorToFirstCharacterAtRow(cursor, newRange.start.row);
        } else {
          if (newRange.isSingleLine()) {
            cursor.setBufferPosition(newRange.end.translate([0, -1]));
          } else {
            cursor.setBufferPosition(newRange.start);
          }
        }
      }
    }
  }, {
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var value = this.vimState.register.get(null, selection, this.sequentialPaste);
      if (!value.text) {
        this.cancelled = true;
        return;
      }

      var textToPaste = _.multiplyString(value.text, this.getCount());
      this.linewisePaste = value.type === "linewise" || this.isMode("visual", "linewise");
      var newRange = this.paste(selection, textToPaste, { linewisePaste: this.linewisePaste });
      this.mutationsBySelection.set(selection, newRange);
      this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, newRange);
    }

    // Return pasted range
  }, {
    key: "paste",
    value: function paste(selection, text, _ref2) {
      var linewisePaste = _ref2.linewisePaste;

      if (this.sequentialPaste) {
        return this.pasteCharacterwise(selection, text);
      } else if (linewisePaste) {
        return this.pasteLinewise(selection, text);
      } else {
        return this.pasteCharacterwise(selection, text);
      }
    }
  }, {
    key: "pasteCharacterwise",
    value: function pasteCharacterwise(selection, text) {
      var cursor = selection.cursor;

      if (selection.isEmpty() && this.location === "after" && !this.utils.isEmptyRow(this.editor, cursor.getBufferRow())) {
        cursor.moveRight();
      }
      return selection.insertText(text);
    }

    // Return newRange
  }, {
    key: "pasteLinewise",
    value: function pasteLinewise(selection, text) {
      var cursor = selection.cursor;

      var cursorRow = cursor.getBufferRow();
      if (!text.endsWith("\n")) {
        text += "\n";
      }
      if (selection.isEmpty()) {
        if (this.location === "before") {
          return this.utils.insertTextAtBufferPosition(this.editor, [cursorRow, 0], text);
        } else if (this.location === "after") {
          var targetRow = this.getFoldEndRowForRow(cursorRow);
          this.utils.ensureEndsWithNewLineForBufferRow(this.editor, targetRow);
          return this.utils.insertTextAtBufferPosition(this.editor, [targetRow + 1, 0], text);
        }
      } else {
        if (!this.isMode("visual", "linewise")) {
          selection.insertText("\n");
        }
        return selection.insertText(text);
      }
    }
  }]);

  return PutBefore;
})(Operator);

PutBefore.register();

var PutAfter = (function (_PutBefore) {
  _inherits(PutAfter, _PutBefore);

  function PutAfter() {
    _classCallCheck(this, PutAfter);

    _get(Object.getPrototypeOf(PutAfter.prototype), "constructor", this).apply(this, arguments);

    this.location = "after";
  }

  return PutAfter;
})(PutBefore);

PutAfter.register();

var PutBeforeWithAutoIndent = (function (_PutBefore2) {
  _inherits(PutBeforeWithAutoIndent, _PutBefore2);

  function PutBeforeWithAutoIndent() {
    _classCallCheck(this, PutBeforeWithAutoIndent);

    _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PutBeforeWithAutoIndent, [{
    key: "pasteLinewise",
    value: function pasteLinewise(selection, text) {
      var newRange = _get(Object.getPrototypeOf(PutBeforeWithAutoIndent.prototype), "pasteLinewise", this).call(this, selection, text);
      this.utils.adjustIndentWithKeepingLayout(this.editor, newRange);
      return newRange;
    }
  }]);

  return PutBeforeWithAutoIndent;
})(PutBefore);

PutBeforeWithAutoIndent.register();

var PutAfterWithAutoIndent = (function (_PutBeforeWithAutoIndent) {
  _inherits(PutAfterWithAutoIndent, _PutBeforeWithAutoIndent);

  function PutAfterWithAutoIndent() {
    _classCallCheck(this, PutAfterWithAutoIndent);

    _get(Object.getPrototypeOf(PutAfterWithAutoIndent.prototype), "constructor", this).apply(this, arguments);

    this.location = "after";
  }

  return PutAfterWithAutoIndent;
})(PutBeforeWithAutoIndent);

PutAfterWithAutoIndent.register();

var AddBlankLineBelow = (function (_Operator8) {
  _inherits(AddBlankLineBelow, _Operator8);

  function AddBlankLineBelow() {
    _classCallCheck(this, AddBlankLineBelow);

    _get(Object.getPrototypeOf(AddBlankLineBelow.prototype), "constructor", this).apply(this, arguments);

    this.flashTarget = false;
    this.target = "Empty";
    this.stayAtSamePosition = true;
    this.stayByMarker = true;
    this.where = "below";
  }

  _createClass(AddBlankLineBelow, [{
    key: "mutateSelection",
    value: function mutateSelection(selection) {
      var point = selection.getHeadBufferPosition();
      if (this.where === "below") point.row++;
      point.column = 0;
      this.editor.setTextInBufferRange([point, point], "\n".repeat(this.getCount()));
    }
  }]);

  return AddBlankLineBelow;
})(Operator);

AddBlankLineBelow.register();

var AddBlankLineAbove = (function (_AddBlankLineBelow) {
  _inherits(AddBlankLineAbove, _AddBlankLineBelow);

  function AddBlankLineAbove() {
    _classCallCheck(this, AddBlankLineAbove);

    _get(Object.getPrototypeOf(AddBlankLineAbove.prototype), "constructor", this).apply(this, arguments);

    this.where = "above";
  }

  return AddBlankLineAbove;
})(AddBlankLineBelow);

AddBlankLineAbove.register();

// Experimentaly allow selectTarget before input Complete
// -------------------------
// ctrl-a in normal-mode find target number in current line manually
// do manually
// do manually
// manage manually
// manage manually
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVgsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7QUFDcEMsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBOztJQUV4QixRQUFRO1lBQVIsUUFBUTs7V0FBUixRQUFROzBCQUFSLFFBQVE7OytCQUFSLFFBQVE7O1NBRVosYUFBYSxHQUFHLElBQUk7U0FDcEIsVUFBVSxHQUFHLElBQUk7U0FFakIsSUFBSSxHQUFHLElBQUk7U0FDWCxVQUFVLEdBQUcsS0FBSztTQUNsQixjQUFjLEdBQUcsTUFBTTtTQUV2QixXQUFXLEdBQUcsSUFBSTtTQUNsQixlQUFlLEdBQUcsWUFBWTtTQUM5QixTQUFTLEdBQUcsVUFBVTtTQUN0QixzQkFBc0IsR0FBRyxxQkFBcUI7U0FDOUMsV0FBVyxHQUFHLEtBQUs7U0FFbkIsb0JBQW9CLEdBQUcsSUFBSTtTQUMzQixrQkFBa0IsR0FBRyxJQUFJO1NBQ3pCLGNBQWMsR0FBRyxJQUFJO1NBQ3JCLFlBQVksR0FBRyxLQUFLO1NBQ3BCLGdCQUFnQixHQUFHLElBQUk7U0FDdkIsNkJBQTZCLEdBQUcsS0FBSztTQUVyQyxzQkFBc0IsR0FBRyxJQUFJO1NBQzdCLHlCQUF5QixHQUFHLElBQUk7U0FFaEMseUJBQXlCLEdBQUcsSUFBSTtTQUNoQyxxQkFBcUIsR0FBRyxLQUFLO1NBSTdCLGtCQUFrQixHQUFHLEtBQUs7U0FDMUIsY0FBYyxHQUFHLElBQUk7OztlQS9CakIsUUFBUTs7V0FpQ0UsMEJBQUc7QUFDZixhQUFPLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7S0FDakQ7Ozs7Ozs7O1dBS1Msc0JBQUc7QUFDWCxVQUFJLENBQUMsY0FBYyxHQUFHLElB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QXRCLHNCQUFzQjs7K0JBQXRCLHNCQUFzQjs7U0FDMUIsUUFBUSxHQUFHLE9BQU87OztTQURkLHNCQUFzQjtHQUFTLHVCQUF1Qjs7QUFHNUQsc0JBQXNCLENBQUMsUUFBUSxFQUFFLENBQUE7O0lBRTNCLGlCQUFpQjtZQUFqQixpQkFBaUI7O1dBQWpCLGlCQUFpQjswQkFBakIsaUJBQWlCOzsrQkFBakIsaUJBQWlCOztTQUNyQixXQUFXLEdBQUcsS0FBSztTQUNuQixNQUFNLEdBQUcsT0FBTztTQUNoQixrQkFBa0IsR0FBRyxJQUFJO1NBQ3pCLFlBQVksR0FBRyxJQUFJO1NBQ25CLEtBQUssR0FBRyxPQUFPOzs7ZUFMWCxpQkFBaUI7O1dBT04seUJBQUMsU0FBUyxFQUFFO0FBQ3pCLFVBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQy9DLFVBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxPQUFPLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ3ZDLFdBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ2hCLFVBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQy9FOzs7U0FaRyxpQkFBaUI7R0FBUyxRQUFROztBQWN4QyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7SUFFdEIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OytCQUFqQixpQkFBaUI7O1NBQ3JCLEtBQUssR0FBRyxPQUFPOzs7U0FEWCxpQkFBaUI7R0FBUyxpQkFBaUI7O0FBR2pELGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFBIiwiZmlsZSI6Ii9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL29wZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuXG5jb25zdCBfID0gcmVxdWlyZShcInVuZGVyc2NvcmUtcGx1c1wiKVxuY29uc3QgQmFzZSA9IHJlcXVpcmUoXCIuL2Jhc2VcIilcblxuY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlIHtcbiAgc3RhdGljIG9wZXJhdGlvbktpbmQgPSBcIm9wZXJhdG9yXCJcbiAgcmVxdWlyZVRhcmdldCA9IHRydWVcbiAgcmVjb3JkYWJsZSA9IHRydWVcblxuICB3aXNlID0gbnVsbFxuICBvY2N1cnJlbmNlID0gZmFsc2VcbiAgb2NjdXJyZW5jZVR5cGUgPSBcImJhc2VcIlxuXG4gIGZsYXNoVGFyZ2V0ID0gdHJ1ZVxuICBmbGFzaENoZWNrcG9pbnQgPSBcImRpZC1maW5pc2hcIlxuICBmbGFzaFR5cGUgPSBcIm9wZXJhdG9yXCJcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9IFwib3BlcmF0b3Itb2NjdXJyZW5jZVwiXG4gIHRyYWNrQ2hhbmdlID0gZmFsc2VcblxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZSA9IG51bGxcbiAgc3RheUF0U2FtZVBvc2l0aW9uID0gbnVsbFxuICBzdGF5T3B0aW9uTmFtZSA9IG51bGxcbiAgc3RheUJ5TWFya2VyID0gZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSBmYWxzZVxuXG4gIGFjY2VwdFByZXNldE9jY3VycmVuY2UgPSB0cnVlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSB0cnVlXG5cbiAgYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSA9IG51bGxcbiAgbXV0YXRlU2VsZWN0aW9uT3JkZXJkID0gZmFsc2VcblxuICAvLyBFeHBlcmltZW50YWx5IGFsbG93IHNlbGVjdFRhcmdldCBiZWZvcmUgaW5wdXQgQ29tcGxldGVcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzdXBwb3J0RWFybHlTZWxlY3QgPSBmYWxzZVxuICB0YXJnZXRTZWxlY3RlZCA9IG51bGxcblxuICBjYW5FYXJseVNlbGVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5zdXBwb3J0RWFybHlTZWxlY3QgJiYgIXRoaXMucmVwZWF0ZWRcbiAgfVxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gQ2FsbGVkIHdoZW4gb3BlcmF0aW9uIGZpbmlzaGVkXG4gIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkgdG8gcmVzZXQgc3RhdGUgZm9yIGAuYCByZXBlYXQuXG4gIHJlc2V0U3RhdGUoKSB7XG4gICAgdGhpcy50YXJnZXRTZWxlY3RlZCA9IG51bGxcbiAgICB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA9IGZhbHNlXG4gIH1cblxuICAvLyBUd28gY2hlY2twb2ludCBmb3IgZGlmZmVyZW50IHB1cnBvc2VcbiAgLy8gLSBvbmUgZm9yIHVuZG8oaGFuZGxlZCBieSBtb2RlTWFuYWdlcilcbiAgLy8gLSBvbmUgZm9yIHByZXNlcnZlIGxhc3QgaW5zZXJ0ZWQgdGV4dFxuICBjcmVhdGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAoIXRoaXMuYnVmZmVyQ2hlY2twb2ludEJ5UHVycG9zZSkgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlID0ge31cbiAgICB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV0gPSB0aGlzLmVkaXRvci5jcmVhdGVDaGVja3BvaW50KClcbiAgfVxuXG4gIGdldEJ1ZmZlckNoZWNrcG9pbnQocHVycG9zZSkge1xuICAgIGlmICh0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlckNoZWNrcG9pbnRCeVB1cnBvc2VbcHVycG9zZV1cbiAgICB9XG4gIH1cblxuICBkZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBpZiAodGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlKSB7XG4gICAgICBkZWxldGUgdGhpcy5idWZmZXJDaGVja3BvaW50QnlQdXJwb3NlW3B1cnBvc2VdXG4gICAgfVxuICB9XG5cbiAgZ3JvdXBDaGFuZ2VzU2luY2VCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpIHtcbiAgICBjb25zdCBjaGVja3BvaW50ID0gdGhpcy5nZXRCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgaWYgKGNoZWNrcG9pbnQpIHtcbiAgICAgIHRoaXMuZWRpdG9yLmdyb3VwQ2hhbmdlc1NpbmNlQ2hlY2twb2ludChjaGVja3BvaW50KVxuICAgICAgdGhpcy5kZWxldGVCdWZmZXJDaGVja3BvaW50KHB1cnBvc2UpXG4gICAgfVxuICB9XG5cbiAgc2V0TWFya0ZvckNoYW5nZShyYW5nZSkge1xuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJbXCIsIHJhbmdlLnN0YXJ0KVxuICAgIHRoaXMudmltU3RhdGUubWFyay5zZXQoXCJdXCIsIHJhbmdlLmVuZClcbiAgfVxuXG4gIG5lZWRGbGFzaCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5mbGFzaFRhcmdldCAmJlxuICAgICAgdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJlxuICAgICAgIXRoaXMuZ2V0Q29uZmlnKFwiZmxhc2hPbk9wZXJhdGVCbGFja2xpc3RcIikuaW5jbHVkZXModGhpcy5uYW1lKSAmJlxuICAgICAgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIiB8fCB0aGlzLnN1Ym1vZGUgIT09IHRoaXMudGFyZ2V0Lndpc2UpIC8vIGUuZy4gWSBpbiB2Q1xuICAgIClcbiAgfVxuXG4gIGZsYXNoSWZOZWNlc3NhcnkocmFuZ2VzKSB7XG4gICAgaWYgKHRoaXMubmVlZEZsYXNoKCkpIHtcbiAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgfVxuICB9XG5cbiAgZmxhc2hDaGFuZ2VJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAodGhpcy5uZWVkRmxhc2goKSkge1xuICAgICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldFNlbGVjdGVkQnVmZmVyUmFuZ2VzRm9yQ2hlY2twb2ludCh0aGlzLmZsYXNoQ2hlY2twb2ludClcbiAgICAgICAgdGhpcy52aW1TdGF0ZS5mbGFzaChyYW5nZXMsIHt0eXBlOiB0aGlzLmdldEZsYXNoVHlwZSgpfSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0Rmxhc2hUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMuZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA6IHRoaXMuZmxhc2hUeXBlXG4gIH1cblxuICB0cmFja0NoYW5nZUlmTmVjZXNzYXJ5KCkge1xuICAgIGlmICghdGhpcy50cmFja0NoYW5nZSkgcmV0dXJuXG4gICAgdGhpcy5vbkRpZEZpbmlzaE9wZXJhdGlvbigoKSA9PiB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMubXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpXG4gICAgICBpZiAocmFuZ2UpIHRoaXMuc2V0TWFya0ZvckNoYW5nZShyYW5nZSlcbiAgICB9KVxuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpXG5cbiAgICAvLyBXaGVuIHByZXNldC1vY2N1cnJlbmNlIHdhcyBleGlzdHMsIG9wZXJhdGUgb24gb2NjdXJyZW5jZS13aXNlXG4gICAgaWYgKHRoaXMuYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSAmJiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmhhc01hcmtlcnMoKSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIFtGSVhNRV0gT1JERVItTUFUVEVSXG4gICAgLy8gVG8gcGljayBjdXJzb3Itd29yZCB0byBmaW5kIG9jY3VycmVuY2UgYmFzZSBwYXR0ZXJuLlxuICAgIC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgQkVGT1JFIGNvbnZlcnRpbmcgcGVyc2lzdGVudC1zZWxlY3Rpb24gaW50byByZWFsLXNlbGVjdGlvbi5cbiAgICAvLyBTaW5jZSB3aGVuIHBlcnNpc3RlbnQtc2VsZWN0aW9uIGlzIGFjdHVhbGx5IHNlbGVjdGVkLCBpdCBjaGFuZ2UgY3Vyc29yIHBvc2l0aW9uLlxuICAgIGlmICh0aGlzLm9jY3VycmVuY2UgJiYgIXRoaXMub2NjdXJyZW5jZU1hbmFnZXIuaGFzTWFya2VycygpKSB7XG4gICAgICBjb25zdCByZWdleCA9IHRoaXMucGF0dGVybkZvck9jY3VycmVuY2UgfHwgdGhpcy5nZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUodGhpcy5vY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleClcbiAgICB9XG5cbiAgICAvLyBUaGlzIGNoYW5nZSBjdXJzb3IgcG9zaXRpb24uXG4gICAgaWYgKHRoaXMuc2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbklmTmVjZXNzYXJ5KCkpIHtcbiAgICAgIC8vIFtGSVhNRV0gc2VsZWN0aW9uLXdpc2UgaXMgbm90IHN5bmNoZWQgaWYgaXQgYWxyZWFkeSB2aXN1YWwtbW9kZVxuICAgICAgaWYgKHRoaXMubW9kZSAhPT0gXCJ2aXN1YWxcIikge1xuICAgICAgICB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKFwidmlzdWFsXCIsIHRoaXMuc3dyYXAuZGV0ZWN0V2lzZSh0aGlzLmVkaXRvcikpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIiAmJiB0aGlzLnJlcXVpcmVUYXJnZXQpIHtcbiAgICAgIHRoaXMudGFyZ2V0ID0gXCJDdXJyZW50U2VsZWN0aW9uXCJcbiAgICB9XG4gICAgaWYgKF8uaXNTdHJpbmcodGhpcy50YXJnZXQpKSB7XG4gICAgICB0aGlzLnNldFRhcmdldCh0aGlzLmdldEluc3RhbmNlKHRoaXMudGFyZ2V0KSlcbiAgICB9XG5cbiAgICBzdXBlci5pbml0aWFsaXplKClcbiAgfVxuXG4gIHN1YnNjcmliZVJlc2V0T2NjdXJyZW5jZVBhdHRlcm5JZk5lZWRlZCgpIHtcbiAgICAvLyBbQ0FVVElPTl1cbiAgICAvLyBUaGlzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGluIFBST1BFUiB0aW1pbmcuXG4gICAgLy8gSWYgb2NjdXJyZW5jZSBpcyB0cnVlIGJ1dCBubyBwcmVzZXQtb2NjdXJyZW5jZVxuICAgIC8vIFRyZWF0IHRoYXQgYG9jY3VycmVuY2VgIGlzIEJPVU5ERUQgdG8gb3BlcmF0b3IgaXRzZWxmLCBzbyBjbGVhbnAgYXQgZmluaXNoZWQuXG4gICAgaWYgKHRoaXMub2NjdXJyZW5jZSAmJiAhdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIHRoaXMub25EaWRSZXNldE9wZXJhdGlvblN0YWNrKCgpID0+IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIucmVzZXRQYXR0ZXJucygpKVxuICAgIH1cbiAgfVxuXG4gIHNldE1vZGlmaWVyKHt3aXNlLCBvY2N1cnJlbmNlLCBvY2N1cnJlbmNlVHlwZX0pIHtcbiAgICBpZiAod2lzZSkge1xuICAgICAgdGhpcy53aXNlID0gd2lzZVxuICAgIH0gZWxzZSBpZiAob2NjdXJyZW5jZSkge1xuICAgICAgdGhpcy5vY2N1cnJlbmNlID0gb2NjdXJyZW5jZVxuICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9IG9jY3VycmVuY2VUeXBlXG4gICAgICAvLyBUaGlzIGlzIG8gbW9kaWZpZXIgY2FzZShlLmcuIGBjIG8gcGAsIGBkIE8gZmApXG4gICAgICAvLyBXZSBSRVNFVCBleGlzdGluZyBvY2N1cmVuY2UtbWFya2VyIHdoZW4gYG9gIG9yIGBPYCBtb2RpZmllciBpcyB0eXBlZCBieSB1c2VyLlxuICAgICAgY29uc3QgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZShvY2N1cnJlbmNlVHlwZSlcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleCwge3Jlc2V0OiB0cnVlLCBvY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9uRGlkUmVzZXRPcGVyYXRpb25TdGFjaygoKSA9PiB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKSlcbiAgICB9XG4gIH1cblxuICAvLyByZXR1cm4gdHJ1ZS9mYWxzZSB0byBpbmRpY2F0ZSBzdWNjZXNzXG4gIHNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25JZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAoXG4gICAgICB0aGlzLmFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gJiZcbiAgICAgIHRoaXMuZ2V0Q29uZmlnKFwiYXV0b1NlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb25Pbk9wZXJhdGVcIikgJiZcbiAgICAgICF0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgKSB7XG4gICAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2VsZWN0KClcbiAgICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgICB0aGlzLnN3cmFwLnNhdmVQcm9wZXJ0aWVzKHRoaXMuZWRpdG9yKVxuXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBnZXRQYXR0ZXJuRm9yT2NjdXJyZW5jZVR5cGUob2NjdXJyZW5jZVR5cGUpIHtcbiAgICBpZiAob2NjdXJyZW5jZVR5cGUgPT09IFwiYmFzZVwiKSB7XG4gICAgICByZXR1cm4gdGhpcy51dGlscy5nZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIHRoaXMuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSlcbiAgICB9IGVsc2UgaWYgKG9jY3VycmVuY2VUeXBlID09PSBcInN1YndvcmRcIikge1xuICAgICAgcmV0dXJuIHRoaXMudXRpbHMuZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKHRoaXMuZWRpdG9yLCB0aGlzLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgfVxuICB9XG5cbiAgLy8gdGFyZ2V0IGlzIFRleHRPYmplY3Qgb3IgTW90aW9uIHRvIG9wZXJhdGUgb24uXG4gIHNldFRhcmdldCh0YXJnZXQpIHtcbiAgICB0aGlzLnRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMudGFyZ2V0Lm9wZXJhdG9yID0gdGhpc1xuICAgIHRoaXMuZW1pdERpZFNldFRhcmdldCh0aGlzKVxuXG4gICAgaWYgKHRoaXMuY2FuRWFybHlTZWxlY3QoKSkge1xuICAgICAgdGhpcy5ub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgdGhpcy5jcmVhdGVCdWZmZXJDaGVja3BvaW50KFwidW5kb1wiKVxuICAgICAgdGhpcy5zZWxlY3RUYXJnZXQoKVxuICAgIH1cbiAgfVxuXG4gIHNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIHRoaXMuc2V0VGV4dFRvUmVnaXN0ZXIoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICB9XG5cbiAgc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUucmVnaXN0ZXIuaXNVbm5hbWVkKCkgJiYgdGhpcy5pc0JsYWNraG9sZVJlZ2lzdGVyZWRPcGVyYXRvcigpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGhpcy50YXJnZXQuaXNMaW5ld2lzZSgpICYmICF0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpKSB7XG4gICAgICB0ZXh0ICs9IFwiXFxuXCJcbiAgICB9XG5cbiAgICBpZiAodGV4dCkge1xuICAgICAgdGhpcy52aW1TdGF0ZS5yZWdpc3Rlci5zZXQobnVsbCwge3RleHQsIHNlbGVjdGlvbn0pXG5cbiAgICAgIGlmICh0aGlzLnZpbVN0YXRlLnJlZ2lzdGVyLmlzVW5uYW1lZCgpKSB7XG4gICAgICAgIGlmICh0aGlzLmluc3RhbmNlb2YoXCJEZWxldGVcIikgfHwgdGhpcy5pbnN0YW5jZW9mKFwiQ2hhbmdlXCIpKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLm5lZWRTYXZlVG9OdW1iZXJlZFJlZ2lzdGVyKHRoaXMudGFyZ2V0KSAmJiB0aGlzLnV0aWxzLmlzU2luZ2xlTGluZVRleHQodGV4dCkpIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiLVwiLCB7dGV4dCwgc2VsZWN0aW9ufSkgLy8gc21hbGwtY2hhbmdlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMVwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbnN0YW5jZW9mKFwiWWFua1wiKSkge1xuICAgICAgICAgIHRoaXMudmltU3RhdGUucmVnaXN0ZXIuc2V0KFwiMFwiLCB7dGV4dCwgc2VsZWN0aW9ufSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yKCkge1xuICAgIGNvbnN0IG9wZXJhdG9ycyA9IHRoaXMuZ2V0Q29uZmlnKFwiYmxhY2tob2xlUmVnaXN0ZXJlZE9wZXJhdG9yc1wiKVxuICAgIGNvbnN0IHdpbGRDYXJkT3BlcmF0b3JzID0gb3BlcmF0b3JzLmZpbHRlcihuYW1lID0+IG5hbWUuZW5kc1dpdGgoXCIqXCIpKVxuICAgIGNvbnN0IGNvbW1hbmROYW1lID0gdGhpcy5nZXRDb21tYW5kTmFtZVdpdGhvdXRQcmVmaXgoKVxuICAgIHJldHVybiAoXG4gICAgICB3aWxkQ2FyZE9wZXJhdG9ycy5zb21lKG5hbWUgPT4gbmV3IFJlZ0V4cChcIl5cIiArIG5hbWUucmVwbGFjZShcIipcIiwgXCIuKlwiKSkudGVzdChjb21tYW5kTmFtZSkpIHx8XG4gICAgICBvcGVyYXRvcnMuaW5jbHVkZXMoY29tbWFuZE5hbWUpXG4gICAgKVxuICB9XG5cbiAgbmVlZFNhdmVUb051bWJlcmVkUmVnaXN0ZXIodGFyZ2V0KSB7XG4gICAgLy8gVXNlZCB0byBkZXRlcm1pbmUgd2hhdCByZWdpc3RlciB0byB1c2Ugb24gY2hhbmdlIGFuZCBkZWxldGUgb3BlcmF0aW9uLlxuICAgIC8vIEZvbGxvd2luZyBtb3Rpb24gc2hvdWxkIHNhdmUgdG8gMS05IHJlZ2lzdGVyIHJlZ2VyZGxlc3Mgb2YgY29udGVudCBpcyBzbWFsbCBvciBiaWcuXG4gICAgY29uc3QgZ29lc1RvTnVtYmVyZWRSZWdpc3Rlck1vdGlvbk5hbWVzID0gW1xuICAgICAgXCJNb3ZlVG9QYWlyXCIsIC8vICVcbiAgICAgIFwiTW92ZVRvTmV4dFNlbnRlbmNlXCIsIC8vICgsIClcbiAgICAgIFwiU2VhcmNoXCIsIC8vIC8sID8sIG4sIE5cbiAgICAgIFwiTW92ZVRvTmV4dFBhcmFncmFwaFwiLCAvLyB7LCB9XG4gICAgXVxuICAgIHJldHVybiBnb2VzVG9OdW1iZXJlZFJlZ2lzdGVyTW90aW9uTmFtZXMuc29tZShuYW1lID0+IHRhcmdldC5pbnN0YW5jZW9mKG5hbWUpKVxuICB9XG5cbiAgbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KCkge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgdGhpcy50YXJnZXQgJiYgdGhpcy50YXJnZXQuaXNNb3Rpb24oKSkge1xuICAgICAgdGhpcy5zd3JhcC5ub3JtYWxpemUodGhpcy5lZGl0b3IpXG4gICAgfVxuICB9XG5cbiAgc3RhcnRNdXRhdGlvbihmbikge1xuICAgIGlmICh0aGlzLmNhbkVhcmx5U2VsZWN0KCkpIHtcbiAgICAgIC8vIC0gU2tpcCBzZWxlY3Rpb24gbm9ybWFsaXphdGlvbjogYWxyZWFkeSBub3JtYWxpemVkIGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIC8vIC0gTWFudWFsIGNoZWNrcG9pbnQgZ3JvdXBpbmc6IHRvIGNyZWF0ZSBjaGVja3BvaW50IGJlZm9yZSBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIGZuKClcbiAgICAgIHRoaXMuZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG4gICAgICB0aGlzLmdyb3VwQ2hhbmdlc1NpbmNlQnVmZmVyQ2hlY2twb2ludChcInVuZG9cIilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgdGhpcy5lZGl0b3IudHJhbnNhY3QoKCkgPT4ge1xuICAgICAgICBmbigpXG4gICAgICAgIHRoaXMuZW1pdFdpbGxGaW5pc2hNdXRhdGlvbigpXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuZW1pdERpZEZpbmlzaE11dGF0aW9uKClcbiAgfVxuXG4gIC8vIE1haW5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnN0YXJ0TXV0YXRpb24oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0VGFyZ2V0KCkpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9ucyA9IHRoaXMubXV0YXRlU2VsZWN0aW9uT3JkZXJkXG4gICAgICAgICAgPyB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgIDogdGhpcy5lZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG5cbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2Ygc2VsZWN0aW9ucykge1xuICAgICAgICAgIHRoaXMubXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwiZGlkLWZpbmlzaFwiKVxuICAgICAgICB0aGlzLnJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIEV2ZW4gdGhvdWdoIHdlIGZhaWwgdG8gc2VsZWN0IHRhcmdldCBhbmQgZmFpbCB0byBtdXRhdGUsXG4gICAgLy8gd2UgaGF2ZSB0byByZXR1cm4gdG8gbm9ybWFsLW1vZGUgZnJvbSBvcGVyYXRvci1wZW5kaW5nIG9yIHZpc3VhbFxuICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gIH1cblxuICAvLyBSZXR1cm4gdHJ1ZSB1bmxlc3MgYWxsIHNlbGVjdGlvbiBpcyBlbXB0eS5cbiAgc2VsZWN0VGFyZ2V0KCkge1xuICAgIGlmICh0aGlzLnRhcmdldFNlbGVjdGVkICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLnRhcmdldFNlbGVjdGVkXG4gICAgfVxuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLmluaXQoe3N0YXlCeU1hcmtlcjogdGhpcy5zdGF5QnlNYXJrZXJ9KVxuXG4gICAgaWYgKHRoaXMudGFyZ2V0LmlzTW90aW9uKCkgJiYgdGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB0aGlzLnRhcmdldC53aXNlID0gdGhpcy5zdWJtb2RlXG4gICAgaWYgKHRoaXMud2lzZSAhPSBudWxsKSB0aGlzLnRhcmdldC5mb3JjZVdpc2UodGhpcy53aXNlKVxuXG4gICAgdGhpcy5lbWl0V2lsbFNlbGVjdFRhcmdldCgpXG5cbiAgICAvLyBBbGxvdyBjdXJzb3IgcG9zaXRpb24gYWRqdXN0bWVudCAnb24td2lsbC1zZWxlY3QtdGFyZ2V0JyBob29rLlxuICAgIC8vIHNvIGNoZWNrcG9pbnQgY29tZXMgQUZURVIgQGVtaXRXaWxsU2VsZWN0VGFyZ2V0KClcbiAgICB0aGlzLm11dGF0aW9uTWFuYWdlci5zZXRDaGVja3BvaW50KFwid2lsbC1zZWxlY3RcIilcblxuICAgIC8vIE5PVEU6IFdoZW4gcmVwZWF0ZWQsIHNldCBvY2N1cnJlbmNlLW1hcmtlciBmcm9tIHBhdHRlcm4gc3RvcmVkIGFzIHN0YXRlLlxuICAgIGlmICh0aGlzLnJlcGVhdGVkICYmIHRoaXMub2NjdXJyZW5jZSAmJiAhdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5oYXNNYXJrZXJzKCkpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybih0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlLCB7b2NjdXJyZW5jZVR5cGU6IHRoaXMub2NjdXJyZW5jZVR5cGV9KVxuICAgIH1cblxuICAgIHRoaXMudGFyZ2V0LmV4ZWN1dGUoKVxuXG4gICAgdGhpcy5tdXRhdGlvbk1hbmFnZXIuc2V0Q2hlY2twb2ludChcImRpZC1zZWxlY3RcIilcbiAgICBpZiAodGhpcy5vY2N1cnJlbmNlKSB7XG4gICAgICBpZiAoIXRoaXMucGF0dGVybkZvck9jY3VycmVuY2UpIHtcbiAgICAgICAgLy8gUHJlc2VydmUgb2NjdXJyZW5jZVBhdHRlcm4gZm9yIC4gcmVwZWF0LlxuICAgICAgICB0aGlzLnBhdHRlcm5Gb3JPY2N1cnJlbmNlID0gdGhpcy5vY2N1cnJlbmNlTWFuYWdlci5idWlsZFBhdHRlcm4oKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VXaXNlID0gdGhpcy53aXNlIHx8IFwiY2hhcmFjdGVyd2lzZVwiXG4gICAgICBpZiAodGhpcy5vY2N1cnJlbmNlTWFuYWdlci5zZWxlY3QodGhpcy5vY2N1cnJlbmNlV2lzZSkpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlU2VsZWN0ZWQgPSB0cnVlXG4gICAgICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnNldENoZWNrcG9pbnQoXCJkaWQtc2VsZWN0LW9jY3VycmVuY2VcIilcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldFNlbGVjdGVkID0gdGhpcy52aW1TdGF0ZS5oYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uKCkgfHwgdGhpcy50YXJnZXQubmFtZSA9PT0gXCJFbXB0eVwiXG4gICAgaWYgKHRoaXMudGFyZ2V0U2VsZWN0ZWQpIHtcbiAgICAgIHRoaXMuZW1pdERpZFNlbGVjdFRhcmdldCgpXG4gICAgICB0aGlzLmZsYXNoQ2hhbmdlSWZOZWNlc3NhcnkoKVxuICAgICAgdGhpcy50cmFja0NoYW5nZUlmTmVjZXNzYXJ5KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0RGlkRmFpbFNlbGVjdFRhcmdldCgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0U2VsZWN0ZWRcbiAgfVxuXG4gIHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpIHtcbiAgICBpZiAoIXRoaXMucmVzdG9yZVBvc2l0aW9ucykgcmV0dXJuXG5cbiAgICBjb25zdCBzdGF5ID1cbiAgICAgIHRoaXMuc3RheUF0U2FtZVBvc2l0aW9uICE9IG51bGxcbiAgICAgICAgPyB0aGlzLnN0YXlBdFNhbWVQb3NpdGlvblxuICAgICAgICA6IHRoaXMuZ2V0Q29uZmlnKHRoaXMuc3RheU9wdGlvbk5hbWUpIHx8ICh0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLmdldENvbmZpZyhcInN0YXlPbk9jY3VycmVuY2VcIikpXG4gICAgY29uc3Qgd2lzZSA9IHRoaXMub2NjdXJyZW5jZVNlbGVjdGVkID8gdGhpcy5vY2N1cnJlbmNlV2lzZSA6IHRoaXMudGFyZ2V0Lndpc2VcbiAgICBjb25zdCB7c2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2V9ID0gdGhpc1xuICAgIHRoaXMubXV0YXRpb25NYW5hZ2VyLnJlc3RvcmVDdXJzb3JQb3NpdGlvbnMoe3N0YXksIHdpc2UsIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlfSlcbiAgfVxufVxuT3BlcmF0b3IucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFNlbGVjdEJhc2UgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2VcbiAgcmVjb3JkYWJsZSA9IGZhbHNlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLnN0YXJ0TXV0YXRpb24oKCkgPT4gdGhpcy5zZWxlY3RUYXJnZXQoKSlcblxuICAgIGlmICh0aGlzLnRhcmdldC5zZWxlY3RTdWNjZWVkZWQpIHtcbiAgICAgIGlmICh0aGlzLnRhcmdldC5pc1RleHRPYmplY3QoKSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcbiAgICAgIH1cbiAgICAgIGNvbnN0IHdpc2UgPSB0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCA/IHRoaXMub2NjdXJyZW5jZVdpc2UgOiB0aGlzLnRhcmdldC53aXNlXG4gICAgICB0aGlzLmFjdGl2YXRlTW9kZUlmTmVjZXNzYXJ5KFwidmlzdWFsXCIsIHdpc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FuY2VsT3BlcmF0aW9uKClcbiAgICB9XG4gIH1cbn1cblNlbGVjdEJhc2UucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIFNlbGVjdCBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBleGVjdXRlKCkge1xuICAgIHRoaXMuc3dyYXAuc2F2ZVByb3BlcnRpZXModGhpcy5lZGl0b3IpXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG4gIH1cbn1cblNlbGVjdC5yZWdpc3RlcigpXG5cbmNsYXNzIFNlbGVjdExhdGVzdENoYW5nZSBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICB0YXJnZXQgPSBcIkFMYXRlc3RDaGFuZ2VcIlxufVxuU2VsZWN0TGF0ZXN0Q2hhbmdlLnJlZ2lzdGVyKClcblxuY2xhc3MgU2VsZWN0UHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJQcmV2aW91c1NlbGVjdGlvblwiXG59XG5TZWxlY3RQcmV2aW91c1NlbGVjdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIFNlbGVjdFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgdGFyZ2V0ID0gXCJBUGVyc2lzdGVudFNlbGVjdGlvblwiXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxufVxuU2VsZWN0UGVyc2lzdGVudFNlbGVjdGlvbi5yZWdpc3RlcigpXG5cbmNsYXNzIFNlbGVjdE9jY3VycmVuY2UgZXh0ZW5kcyBTZWxlY3RCYXNlIHtcbiAgb2NjdXJyZW5jZSA9IHRydWVcbn1cblNlbGVjdE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG4vLyBTZWxlY3RJblZpc3VhbE1vZGU6IHVzZWQgaW4gdmlzdWFsLW1vZGVcbi8vIFdoZW4gdGV4dC1vYmplY3QgaXMgaW52b2tlZCBmcm9tIG5vcm1hbCBvciB2aXVzYWwtbW9kZSwgb3BlcmF0aW9uIHdvdWxkIGJlXG4vLyAgPT4gU2VsZWN0SW5WaXN1YWxNb2RlIG9wZXJhdG9yIHdpdGggdGFyZ2V0PXRleHQtb2JqZWN0XG4vLyBXaGVuIG1vdGlvbiBpcyBpbnZva2VkIGZyb20gdmlzdWFsLW1vZGUsIG9wZXJhdGlvbiB3b3VsZCBiZVxuLy8gID0+IFNlbGVjdEluVmlzdWFsTW9kZSBvcGVyYXRvciB3aXRoIHRhcmdldD1tb3Rpb24pXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gU2VsZWN0SW5WaXN1YWxNb2RlIGlzIHVzZWQgaW4gVFdPIHNpdHVhdGlvbi5cbi8vIC0gdmlzdWFsLW1vZGUgb3BlcmF0aW9uXG4vLyAgIC0gZS5nOiBgdiBsYCwgYFYgamAsIGB2IGkgcGAuLi5cbi8vIC0gRGlyZWN0bHkgaW52b2tlIHRleHQtb2JqZWN0IGZyb20gbm9ybWFsLW1vZGVcbi8vICAgLSBlLmc6IEludm9rZSBgSW5uZXIgUGFyYWdyYXBoYCBmcm9tIGNvbW1hbmQtcGFsZXR0ZS5cbmNsYXNzIFNlbGVjdEluVmlzdWFsTW9kZSBleHRlbmRzIFNlbGVjdEJhc2Uge1xuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG59XG5TZWxlY3RJblZpc3VhbE1vZGUucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIFBlcnNpc3RlbnQgU2VsZWN0aW9uXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHN0YXlBdFNhbWVQb3NpdGlvbiA9IHRydWVcbiAgYWNjZXB0UHJlc2V0T2NjdXJyZW5jZSA9IGZhbHNlXG4gIGFjY2VwdFBlcnNpc3RlbnRTZWxlY3Rpb24gPSBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24ubWFya0J1ZmZlclJhbmdlKHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuICB9XG59XG5DcmVhdGVQZXJzaXN0ZW50U2VsZWN0aW9uLnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIENyZWF0ZVBlcnNpc3RlbnRTZWxlY3Rpb24ge1xuICBpc0NvbXBsZXRlKCkge1xuICAgIGNvbnN0IHBvaW50ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgIHRoaXMubWFya2VyVG9SZW1vdmUgPSB0aGlzLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQXRQb2ludChwb2ludClcbiAgICByZXR1cm4gdGhpcy5tYXJrZXJUb1JlbW92ZSB8fCBzdXBlci5pc0NvbXBsZXRlKClcbiAgfVxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgaWYgKHRoaXMubWFya2VyVG9SZW1vdmUpIHtcbiAgICAgIHRoaXMubWFya2VyVG9SZW1vdmUuZGVzdHJveSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLmV4ZWN1dGUoKVxuICAgIH1cbiAgfVxufVxuVG9nZ2xlUGVyc2lzdGVudFNlbGVjdGlvbi5yZWdpc3RlcigpXG5cbi8vIFByZXNldCBPY2N1cnJlbmNlXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIGV4dGVuZHMgT3BlcmF0b3Ige1xuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgZmxhc2hUYXJnZXQgPSBmYWxzZVxuICBhY2NlcHRQcmVzZXRPY2N1cnJlbmNlID0gZmFsc2VcbiAgYWNjZXB0UGVyc2lzdGVudFNlbGVjdGlvbiA9IGZhbHNlXG4gIG9jY3VycmVuY2VUeXBlID0gXCJiYXNlXCJcblxuICBleGVjdXRlKCkge1xuICAgIGNvbnN0IG1hcmtlciA9IHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZ2V0TWFya2VyQXRQb2ludCh0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKVxuICAgIGlmIChtYXJrZXIpIHtcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuZGVzdHJveU1hcmtlcnMoW21hcmtlcl0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzTmFycm93ZWQgPSB0aGlzLnZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuXG4gICAgICBsZXQgcmVnZXhcbiAgICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIgJiYgIWlzTmFycm93ZWQpIHtcbiAgICAgICAgdGhpcy5vY2N1cnJlbmNlVHlwZSA9IFwiYmFzZVwiXG4gICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cChfLmVzY2FwZVJlZ0V4cCh0aGlzLmVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSksIFwiZ1wiKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVnZXggPSB0aGlzLmdldFBhdHRlcm5Gb3JPY2N1cnJlbmNlVHlwZSh0aGlzLm9jY3VycmVuY2VUeXBlKVxuICAgICAgfVxuXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLmFkZFBhdHRlcm4ocmVnZXgsIHtvY2N1cnJlbmNlVHlwZTogdGhpcy5vY2N1cnJlbmNlVHlwZX0pXG4gICAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnNhdmVMYXN0UGF0dGVybih0aGlzLm9jY3VycmVuY2VUeXBlKVxuXG4gICAgICBpZiAoIWlzTmFycm93ZWQpIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5Ub2dnbGVQcmVzZXRPY2N1cnJlbmNlLnJlZ2lzdGVyKClcblxuY2xhc3MgVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UgZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgb2NjdXJyZW5jZVR5cGUgPSBcInN1YndvcmRcIlxufVxuVG9nZ2xlUHJlc2V0U3Vid29yZE9jY3VycmVuY2UucmVnaXN0ZXIoKVxuXG4vLyBXYW50IHRvIHJlbmFtZSBSZXN0b3JlT2NjdXJyZW5jZU1hcmtlclxuY2xhc3MgQWRkUHJlc2V0T2NjdXJyZW5jZUZyb21MYXN0T2NjdXJyZW5jZVBhdHRlcm4gZXh0ZW5kcyBUb2dnbGVQcmVzZXRPY2N1cnJlbmNlIHtcbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9jY3VycmVuY2VNYW5hZ2VyLnJlc2V0UGF0dGVybnMoKVxuICAgIGNvbnN0IHJlZ2V4ID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVBhdHRlcm5cIilcbiAgICBpZiAocmVnZXgpIHtcbiAgICAgIGNvbnN0IG9jY3VycmVuY2VUeXBlID0gdGhpcy5nbG9iYWxTdGF0ZS5nZXQoXCJsYXN0T2NjdXJyZW5jZVR5cGVcIilcbiAgICAgIHRoaXMub2NjdXJyZW5jZU1hbmFnZXIuYWRkUGF0dGVybihyZWdleCwge29jY3VycmVuY2VUeXBlfSlcbiAgICAgIHRoaXMuYWN0aXZhdGVNb2RlKFwibm9ybWFsXCIpXG4gICAgfVxuICB9XG59XG5BZGRQcmVzZXRPY2N1cnJlbmNlRnJvbUxhc3RPY2N1cnJlbmNlUGF0dGVybi5yZWdpc3RlcigpXG5cbi8vIERlbGV0ZVxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERlbGV0ZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIGZsYXNoQ2hlY2twb2ludCA9IFwiZGlkLXNlbGVjdC1vY2N1cnJlbmNlXCJcbiAgZmxhc2hUeXBlRm9yT2NjdXJyZW5jZSA9IFwib3BlcmF0b3ItcmVtb3ZlLW9jY3VycmVuY2VcIlxuICBzdGF5T3B0aW9uTmFtZSA9IFwic3RheU9uRGVsZXRlXCJcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2UgPSB0cnVlXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm9uRGlkU2VsZWN0VGFyZ2V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLm9jY3VycmVuY2VTZWxlY3RlZCAmJiB0aGlzLm9jY3VycmVuY2VXaXNlID09PSBcImxpbmV3aXNlXCIpIHtcbiAgICAgICAgdGhpcy5mbGFzaFRhcmdldCA9IGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICh0aGlzLnRhcmdldC53aXNlID09PSBcImJsb2Nrd2lzZVwiKSB7XG4gICAgICB0aGlzLnJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIH1cbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICB0aGlzLnNldFRleHRUb1JlZ2lzdGVyRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBzZWxlY3Rpb24uZGVsZXRlU2VsZWN0ZWRUZXh0KClcbiAgfVxufVxuRGVsZXRlLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlUmlnaHQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVSaWdodFwiXG59XG5EZWxldGVSaWdodC5yZWdpc3RlcigpXG5cbmNsYXNzIERlbGV0ZUxlZnQgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVMZWZ0XCJcbn1cbkRlbGV0ZUxlZnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBEZWxldGVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUgZXh0ZW5kcyBEZWxldGUge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxuXG4gIGV4ZWN1dGUoKSB7XG4gICAgdGhpcy5vbkRpZFNlbGVjdFRhcmdldCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy50YXJnZXQud2lzZSA9PT0gXCJibG9ja3dpc2VcIikge1xuICAgICAgICBmb3IgKGNvbnN0IGJsb2Nrd2lzZVNlbGVjdGlvbiBvZiB0aGlzLmdldEJsb2Nrd2lzZVNlbGVjdGlvbnMoKSkge1xuICAgICAgICAgIGJsb2Nrd2lzZVNlbGVjdGlvbi5leHRlbmRNZW1iZXJTZWxlY3Rpb25zVG9FbmRPZkxpbmUoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICBzdXBlci5leGVjdXRlKClcbiAgfVxufVxuRGVsZXRlVG9MYXN0Q2hhcmFjdGVyT2ZMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgRGVsZXRlTGluZSBleHRlbmRzIERlbGV0ZSB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgdGFyZ2V0ID0gXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldCA9IGZhbHNlXG59XG5EZWxldGVMaW5lLnJlZ2lzdGVyKClcblxuLy8gWWFua1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgWWFuayBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdHJhY2tDaGFuZ2UgPSB0cnVlXG4gIHN0YXlPcHRpb25OYW1lID0gXCJzdGF5T25ZYW5rXCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgdGhpcy5zZXRUZXh0VG9SZWdpc3RlckZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gIH1cbn1cbllhbmsucmVnaXN0ZXIoKVxuXG5jbGFzcyBZYW5rTGluZSBleHRlbmRzIFlhbmsge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG4gIHRhcmdldCA9IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbn1cbllhbmtMaW5lLnJlZ2lzdGVyKClcblxuY2xhc3MgWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZSBleHRlbmRzIFlhbmsge1xuICB0YXJnZXQgPSBcIk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmVcIlxufVxuWWFua1RvTGFzdENoYXJhY3Rlck9mTGluZS5yZWdpc3RlcigpXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFtjdHJsLWFdXG5jbGFzcyBJbmNyZWFzZSBleHRlbmRzIE9wZXJhdG9yIHtcbiAgdGFyZ2V0ID0gXCJFbXB0eVwiIC8vIGN0cmwtYSBpbiBub3JtYWwtbW9kZSBmaW5kIHRhcmdldCBudW1iZXIgaW4gY3VycmVudCBsaW5lIG1hbnVhbGx5XG4gIGZsYXNoVGFyZ2V0ID0gZmFsc2UgLy8gZG8gbWFudWFsbHlcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIGRvIG1hbnVhbGx5XG4gIHN0ZXAgPSAxXG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm5ld1JhbmdlcyA9IFtdXG4gICAgaWYgKCF0aGlzLnJlZ2V4KSB0aGlzLnJlZ2V4ID0gbmV3IFJlZ0V4cChgJHt0aGlzLmdldENvbmZpZyhcIm51bWJlclJlZ2V4XCIpfWAsIFwiZ1wiKVxuXG4gICAgc3VwZXIuZXhlY3V0ZSgpXG5cbiAgICBpZiAodGhpcy5uZXdSYW5nZXMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJiAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2godGhpcy5uZXdSYW5nZXMsIHt0eXBlOiB0aGlzLmZsYXNoVHlwZUZvck9jY3VycmVuY2V9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJlcGxhY2VOdW1iZXJJbkJ1ZmZlclJhbmdlKHNjYW5SYW5nZSwgZm4pIHtcbiAgICBjb25zdCBuZXdSYW5nZXMgPSBbXVxuICAgIHRoaXMuc2NhbkZvcndhcmQodGhpcy5yZWdleCwge3NjYW5SYW5nZX0sIGV2ZW50ID0+IHtcbiAgICAgIGlmIChmbikge1xuICAgICAgICBpZiAoZm4oZXZlbnQpKSBldmVudC5zdG9wKClcbiAgICAgICAgZWxzZSByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IG5leHROdW1iZXIgPSB0aGlzLmdldE5leHROdW1iZXIoZXZlbnQubWF0Y2hUZXh0KVxuICAgICAgbmV3UmFuZ2VzLnB1c2goZXZlbnQucmVwbGFjZShTdHJpbmcobmV4dE51bWJlcikpKVxuICAgIH0pXG4gICAgcmV0dXJuIG5ld1Jhbmdlc1xuICB9XG5cbiAgbXV0YXRlU2VsZWN0aW9uKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKHRoaXMudGFyZ2V0LmlzKFwiRW1wdHlcIikpIHtcbiAgICAgIC8vIGN0cmwtYSwgY3RybC14IGluIGBub3JtYWwtbW9kZWBcbiAgICAgIGNvbnN0IGN1cnNvclBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGNvbnN0IHNjYW5SYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KGN1cnNvclBvc2l0aW9uLnJvdylcbiAgICAgIGNvbnN0IG5ld1JhbmdlcyA9IHRoaXMucmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlLCBldmVudCA9PlxuICAgICAgICBldmVudC5yYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihjdXJzb3JQb3NpdGlvbilcbiAgICAgIClcbiAgICAgIGNvbnN0IHBvaW50ID0gKG5ld1Jhbmdlcy5sZW5ndGggJiYgbmV3UmFuZ2VzWzBdLmVuZC50cmFuc2xhdGUoWzAsIC0xXSkpIHx8IGN1cnNvclBvc2l0aW9uXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNjYW5SYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICB0aGlzLm5ld1Jhbmdlcy5wdXNoKC4uLnRoaXMucmVwbGFjZU51bWJlckluQnVmZmVyUmFuZ2Uoc2NhblJhbmdlKSlcbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihzY2FuUmFuZ2Uuc3RhcnQpXG4gICAgfVxuICB9XG5cbiAgZ2V0TmV4dE51bWJlcihudW1iZXJTdHJpbmcpIHtcbiAgICByZXR1cm4gTnVtYmVyLnBhcnNlSW50KG51bWJlclN0cmluZywgMTApICsgdGhpcy5zdGVwICogdGhpcy5nZXRDb3VudCgpXG4gIH1cbn1cbkluY3JlYXNlLnJlZ2lzdGVyKClcblxuLy8gW2N0cmwteF1cbmNsYXNzIERlY3JlYXNlIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBzdGVwID0gLTFcbn1cbkRlY3JlYXNlLnJlZ2lzdGVyKClcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gW2cgY3RybC1hXVxuY2xhc3MgSW5jcmVtZW50TnVtYmVyIGV4dGVuZHMgSW5jcmVhc2Uge1xuICBiYXNlTnVtYmVyID0gbnVsbFxuICB0YXJnZXQgPSBudWxsXG4gIG11dGF0ZVNlbGVjdGlvbk9yZGVyZCA9IHRydWVcblxuICBnZXROZXh0TnVtYmVyKG51bWJlclN0cmluZykge1xuICAgIGlmICh0aGlzLmJhc2VOdW1iZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5iYXNlTnVtYmVyICs9IHRoaXMuc3RlcCAqIHRoaXMuZ2V0Q291bnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmJhc2VOdW1iZXIgPSBOdW1iZXIucGFyc2VJbnQobnVtYmVyU3RyaW5nLCAxMClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmFzZU51bWJlclxuICB9XG59XG5JbmNyZW1lbnROdW1iZXIucmVnaXN0ZXIoKVxuXG4vLyBbZyBjdHJsLXhdXG5jbGFzcyBEZWNyZW1lbnROdW1iZXIgZXh0ZW5kcyBJbmNyZW1lbnROdW1iZXIge1xuICBzdGVwID0gLTFcbn1cbkRlY3JlbWVudE51bWJlci5yZWdpc3RlcigpXG5cbi8vIFB1dFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ3Vyc29yIHBsYWNlbWVudDpcbi8vIC0gcGxhY2UgYXQgZW5kIG9mIG11dGF0aW9uOiBwYXN0ZSBub24tbXVsdGlsaW5lIGNoYXJhY3Rlcndpc2UgdGV4dFxuLy8gLSBwbGFjZSBhdCBzdGFydCBvZiBtdXRhdGlvbjogbm9uLW11bHRpbGluZSBjaGFyYWN0ZXJ3aXNlIHRleHQoY2hhcmFjdGVyd2lzZSwgbGluZXdpc2UpXG5jbGFzcyBQdXRCZWZvcmUgZXh0ZW5kcyBPcGVyYXRvciB7XG4gIGxvY2F0aW9uID0gXCJiZWZvcmVcIlxuICB0YXJnZXQgPSBcIkVtcHR5XCJcbiAgZmxhc2hUeXBlID0gXCJvcGVyYXRvci1sb25nXCJcbiAgcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuICBmbGFzaFRhcmdldCA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuICB0cmFja0NoYW5nZSA9IGZhbHNlIC8vIG1hbmFnZSBtYW51YWxseVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLm9uSW5pdGlhbGl6ZSh0aGlzKVxuICAgIHN1cGVyLmluaXRpYWxpemUoKVxuICB9XG5cbiAgZXhlY3V0ZSgpIHtcbiAgICB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uID0gbmV3IE1hcCgpXG4gICAgdGhpcy5zZXF1ZW50aWFsUGFzdGUgPSB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25FeGVjdXRlKHRoaXMpXG5cbiAgICB0aGlzLm9uRGlkRmluaXNoTXV0YXRpb24oKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmNhbmNlbGxlZCkgdGhpcy5hZGp1c3RDdXJzb3JQb3NpdGlvbigpXG4gICAgfSlcblxuICAgIHN1cGVyLmV4ZWN1dGUoKVxuXG4gICAgaWYgKHRoaXMuY2FuY2VsbGVkKSByZXR1cm5cblxuICAgIHRoaXMub25EaWRGaW5pc2hPcGVyYXRpb24oKCkgPT4ge1xuICAgICAgLy8gVHJhY2tDaGFuZ2VcbiAgICAgIGNvbnN0IG5ld1JhbmdlID0gdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5nZXQodGhpcy5lZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgICAgaWYgKG5ld1JhbmdlKSB0aGlzLnNldE1hcmtGb3JDaGFuZ2UobmV3UmFuZ2UpXG5cbiAgICAgIC8vIEZsYXNoXG4gICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZVwiKSAmJiAhdGhpcy5nZXRDb25maWcoXCJmbGFzaE9uT3BlcmF0ZUJsYWNrbGlzdFwiKS5pbmNsdWRlcyh0aGlzLm5hbWUpKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlcyA9IHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKS5tYXAoc2VsZWN0aW9uID0+IHRoaXMubXV0YXRpb25zQnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbikpXG4gICAgICAgIHRoaXMudmltU3RhdGUuZmxhc2gocmFuZ2VzLCB7dHlwZTogdGhpcy5nZXRGbGFzaFR5cGUoKX0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFkanVzdEN1cnNvclBvc2l0aW9uKCkge1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgaWYgKCF0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmhhcyhzZWxlY3Rpb24pKSBjb250aW51ZVxuXG4gICAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgICAgY29uc3QgbmV3UmFuZ2UgPSB0aGlzLm11dGF0aW9uc0J5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG4gICAgICBpZiAodGhpcy5saW5ld2lzZVBhc3RlKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyhjdXJzb3IsIG5ld1JhbmdlLnN0YXJ0LnJvdylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChuZXdSYW5nZS5pc1NpbmdsZUxpbmUoKSkge1xuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5lbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihuZXdSYW5nZS5zdGFydClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG11dGF0ZVNlbGVjdGlvbihzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmltU3RhdGUucmVnaXN0ZXIuZ2V0KG51bGwsIHNlbGVjdGlvbiwgdGhpcy5zZXF1ZW50aWFsUGFzdGUpXG4gICAgaWYgKCF2YWx1ZS50ZXh0KSB7XG4gICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHRleHRUb1Bhc3RlID0gXy5tdWx0aXBseVN0cmluZyh2YWx1ZS50ZXh0LCB0aGlzLmdldENvdW50KCkpXG4gICAgdGhpcy5saW5ld2lzZVBhc3RlID0gdmFsdWUudHlwZSA9PT0gXCJsaW5ld2lzZVwiIHx8IHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIilcbiAgICBjb25zdCBuZXdSYW5nZSA9IHRoaXMucGFzdGUoc2VsZWN0aW9uLCB0ZXh0VG9QYXN0ZSwge2xpbmV3aXNlUGFzdGU6IHRoaXMubGluZXdpc2VQYXN0ZX0pXG4gICAgdGhpcy5tdXRhdGlvbnNCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBuZXdSYW5nZSlcbiAgICB0aGlzLnZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuc2F2ZVBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbiwgbmV3UmFuZ2UpXG4gIH1cblxuICAvLyBSZXR1cm4gcGFzdGVkIHJhbmdlXG4gIHBhc3RlKHNlbGVjdGlvbiwgdGV4dCwge2xpbmV3aXNlUGFzdGV9KSB7XG4gICAgaWYgKHRoaXMuc2VxdWVudGlhbFBhc3RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXN0ZUNoYXJhY3Rlcndpc2Uoc2VsZWN0aW9uLCB0ZXh0KVxuICAgIH0gZWxzZSBpZiAobGluZXdpc2VQYXN0ZSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnBhc3RlQ2hhcmFjdGVyd2lzZShzZWxlY3Rpb24sIHRleHQpXG4gICAgfVxuICB9XG5cbiAgcGFzdGVDaGFyYWN0ZXJ3aXNlKHNlbGVjdGlvbiwgdGV4dCkge1xuICAgIGNvbnN0IHtjdXJzb3J9ID0gc2VsZWN0aW9uXG4gICAgaWYgKFxuICAgICAgc2VsZWN0aW9uLmlzRW1wdHkoKSAmJlxuICAgICAgdGhpcy5sb2NhdGlvbiA9PT0gXCJhZnRlclwiICYmXG4gICAgICAhdGhpcy51dGlscy5pc0VtcHR5Um93KHRoaXMuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUm93KCkpXG4gICAgKSB7XG4gICAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQpXG4gIH1cblxuICAvLyBSZXR1cm4gbmV3UmFuZ2VcbiAgcGFzdGVMaW5ld2lzZShzZWxlY3Rpb24sIHRleHQpIHtcbiAgICBjb25zdCB7Y3Vyc29yfSA9IHNlbGVjdGlvblxuICAgIGNvbnN0IGN1cnNvclJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlmICghdGV4dC5lbmRzV2l0aChcIlxcblwiKSkge1xuICAgICAgdGV4dCArPSBcIlxcblwiXG4gICAgfVxuICAgIGlmIChzZWxlY3Rpb24uaXNFbXB0eSgpKSB7XG4gICAgICBpZiAodGhpcy5sb2NhdGlvbiA9PT0gXCJiZWZvcmVcIikge1xuICAgICAgICByZXR1cm4gdGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW2N1cnNvclJvdywgMF0sIHRleHQpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMubG9jYXRpb24gPT09IFwiYWZ0ZXJcIikge1xuICAgICAgICBjb25zdCB0YXJnZXRSb3cgPSB0aGlzLmdldEZvbGRFbmRSb3dGb3JSb3coY3Vyc29yUm93KVxuICAgICAgICB0aGlzLnV0aWxzLmVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyh0aGlzLmVkaXRvciwgdGFyZ2V0Um93KVxuICAgICAgICByZXR1cm4gdGhpcy51dGlscy5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbih0aGlzLmVkaXRvciwgW3RhcmdldFJvdyArIDEsIDBdLCB0ZXh0KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwibGluZXdpc2VcIikpIHtcbiAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQoXCJcXG5cIilcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0KVxuICAgIH1cbiAgfVxufVxuUHV0QmVmb3JlLnJlZ2lzdGVyKClcblxuY2xhc3MgUHV0QWZ0ZXIgZXh0ZW5kcyBQdXRCZWZvcmUge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuUHV0QWZ0ZXIucmVnaXN0ZXIoKVxuXG5jbGFzcyBQdXRCZWZvcmVXaXRoQXV0b0luZGVudCBleHRlbmRzIFB1dEJlZm9yZSB7XG4gIHBhc3RlTGluZXdpc2Uoc2VsZWN0aW9uLCB0ZXh0KSB7XG4gICAgY29uc3QgbmV3UmFuZ2UgPSBzdXBlci5wYXN0ZUxpbmV3aXNlKHNlbGVjdGlvbiwgdGV4dClcbiAgICB0aGlzLnV0aWxzLmFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0KHRoaXMuZWRpdG9yLCBuZXdSYW5nZSlcbiAgICByZXR1cm4gbmV3UmFuZ2VcbiAgfVxufVxuUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQucmVnaXN0ZXIoKVxuXG5jbGFzcyBQdXRBZnRlcldpdGhBdXRvSW5kZW50IGV4dGVuZHMgUHV0QmVmb3JlV2l0aEF1dG9JbmRlbnQge1xuICBsb2NhdGlvbiA9IFwiYWZ0ZXJcIlxufVxuUHV0QWZ0ZXJXaXRoQXV0b0luZGVudC5yZWdpc3RlcigpXG5cbmNsYXNzIEFkZEJsYW5rTGluZUJlbG93IGV4dGVuZHMgT3BlcmF0b3Ige1xuICBmbGFzaFRhcmdldCA9IGZhbHNlXG4gIHRhcmdldCA9IFwiRW1wdHlcIlxuICBzdGF5QXRTYW1lUG9zaXRpb24gPSB0cnVlXG4gIHN0YXlCeU1hcmtlciA9IHRydWVcbiAgd2hlcmUgPSBcImJlbG93XCJcblxuICBtdXRhdGVTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICBpZiAodGhpcy53aGVyZSA9PT0gXCJiZWxvd1wiKSBwb2ludC5yb3crK1xuICAgIHBvaW50LmNvbHVtbiA9IDBcbiAgICB0aGlzLmVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgXCJcXG5cIi5yZXBlYXQodGhpcy5nZXRDb3VudCgpKSlcbiAgfVxufVxuQWRkQmxhbmtMaW5lQmVsb3cucmVnaXN0ZXIoKVxuXG5jbGFzcyBBZGRCbGFua0xpbmVBYm92ZSBleHRlbmRzIEFkZEJsYW5rTGluZUJlbG93IHtcbiAgd2hlcmUgPSBcImFib3ZlXCJcbn1cbkFkZEJsYW5rTGluZUFib3ZlLnJlZ2lzdGVyKClcbiJdfQ==