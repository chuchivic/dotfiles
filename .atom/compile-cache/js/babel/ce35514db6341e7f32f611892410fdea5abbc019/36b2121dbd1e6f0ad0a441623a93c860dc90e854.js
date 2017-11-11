"use babel";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("atom");

var Range = _require.Range;
var Point = _require.Point;

var _ = require("underscore-plus");

// [TODO] Need overhaul
//  - [ ] Make expandable by selection.getBufferRange().union(this.getRange(selection))
//  - [ ] Count support(priority low)?
var Base = require("./base");
var PairFinder = require("./pair-finder");

var TextObject = (function (_Base) {
  _inherits(TextObject, _Base);

  function TextObject() {
    _classCallCheck(this, TextObject);

    _get(Object.getPrototypeOf(TextObject.prototype), "constructor", this).apply(this, arguments);

    this.wise = "characterwise";
    this.supportCount = false;
    this.selectOnce = false;
    this.selectSucceeded = false;
  }

  _createClass(TextObject, [{
    key: "isInner",
    value: function isInner() {
      return this.inner;
    }
  }, {
    key: "isA",
    value: function isA() {
      return !this.inner;
    }
  }, {
    key: "isLinewise",
    value: function isLinewise() {
      return this.wise === "linewise";
    }
  }, {
    key: "isBlockwise",
    value: function isBlockwise() {
      return this.wise === "blockwise";
    }
  }, {
    key: "forceWise",
    value: function forceWise(wise) {
      return this.wise = wise; // FIXME currently not well supported
    }
  }, {
    key: "resetState",
    value: function resetState() {
      this.selectSucceeded = false;
    }

    // execute: Called from Operator::selectTarget()
    //  - `v i p`, is `SelectInVisualMode` operator with @target = `InnerParagraph`.
    //  - `d i p`, is `Delete` operator with @target = `InnerParagraph`.
  }, {
    key: "execute",
    value: function execute() {
      // Whennever TextObject is executed, it has @operator
      if (!this.operator) throw new Error("in TextObject: Must not happen");
      this.select();
    }
  }, {
    key: "select",
    value: function select() {
      var _this = this;

      if (this.isMode("visual", "blockwise")) {
        this.swrap.normalize(this.editor);
      }

      this.countTimes(this.getCount(), function (_ref2) {
        var stop = _ref2.stop;

        if (!_this.supportCount) stop(); // quick-fix for #560

        for (var selection of _this.editor.getSelections()) {
          var oldRange = selection.getBufferRange();
          if (_this.selectTextObject(selection)) _this.selectSucceeded = true;
          if (selection.getBufferRange().isEqual(oldRange)) stop();
          if (_this.selectOnce) break;
        }
      });

      this.editor.mergeIntersectingSelections();
      // Some TextObject's wise is NOT deterministic. It has to be detected from selected range.
      if (this.wise == null) this.wise = this.swrap.detectWise(this.editor);

      if (this.operator["instanceof"]("SelectBase")) {
        if (this.selectSucceeded) {
          if (this.wise === "characterwise") {
            this.swrap.saveProperties(this.editor, { force: true });
          } else if (this.wise === "linewise") {
            // When target is persistent-selection, new selection is added after selectTextObject.
            // So we have to assure all selection have selction property.
            // Maybe this logic can be moved to operation stack.
            for (var $selection of this.swrap.getSelections(this.editor)) {
              if (this.getConfig("stayOnSelectTextObject")) {
                if (!$selection.hasProperties()) $selection.saveProperties();
              } else {
                $selection.saveProperties();
              }
              $selection.fixPropertyRowToRowRange();
            }
          }
        }

        if (this.submode === "blockwise") {
          for (var $selection of this.swrap.getSelections(this.editor)) {
            $selection.normalize();
            $selection.applyWise("blockwise");
          }
        }
      }
    }

    // Return true or false
  }, {
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range);
        return true;
      } else {
        return false;
      }
    }

    // to override
  }, {
    key: "getRange",
    value: function getRange(selection) {}
  }], [{
    key: "register",
    value: function register(isCommand, deriveInnerAndA, deriveInnerAndAForAllowForwarding) {
      _get(Object.getPrototypeOf(TextObject), "register", this).call(this, isCommand);

      if (deriveInnerAndA) {
        this.generateClass("A" + this.name, false);
        this.generateClass("Inner" + this.name, true);
      }

      if (deriveInnerAndAForAllowForwarding) {
        this.generateClass("A" + this.name + "AllowForwarding", false, true);
        this.generateClass("Inner" + this.name + "AllowForwarding", true, true);
      }
    }
  }, {
    key: "generateClass",
    value: function generateClass(klassName, inner, allowForwarding) {
      var klass = (function (_ref) {
        _inherits(klass, _ref);

        _createClass(klass, null, [{
          key: "name",
          get: function get() {
            return klassName;
          }
        }]);

        function klass(vimState) {
          _classCallCheck(this, klass);

          _get(Object.getPrototypeOf(klass.prototype), "constructor", this).call(this, vimState);
          this.inner = inner;
          if (allowForwarding != null) this.allowForwarding = allowForwarding;
        }

        return klass;
      })(this);
      klass.register();
    }
  }, {
    key: "operationKind",
    value: "text-object",
    enumerable: true
  }]);

  return TextObject;
})(Base);

TextObject.register(false);

// Section: Word
// =========================

var Word = (function (_TextObject) {
  _inherits(Word, _TextObject);

  function Word() {
    _classCallCheck(this, Word);

    _get(Object.getPrototypeOf(Word.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Word, [{
    key: "getRange",
    value: function getRange(selection) {
      var point = this.getCursorPositionForSelection(selection);

      var _getWordBufferRangeAndKindAtBufferPosition = this.getWordBufferRangeAndKindAtBufferPosition(point, { wordRegex: this.wordRegex });

      var range = _getWordBufferRangeAndKindAtBufferPosition.range;

      return this.isA() ? this.utils.expandRangeToWhiteSpaces(this.editor, range) : range;
    }
  }]);

  return Word;
})(TextObject);

Word.register(false, true);

var WholeWord = (function (_Word) {
  _inherits(WholeWord, _Word);

  function WholeWord() {
    _classCallCheck(this, WholeWord);

    _get(Object.getPrototypeOf(WholeWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /\S+/;
  }

  return WholeWord;
})(Word);

WholeWord.register(false, true);

// Just include _, -

var SmartWord = (function (_Word2) {
  _inherits(SmartWord, _Word2);

  function SmartWord() {
    _classCallCheck(this, SmartWord);

    _get(Object.getPrototypeOf(SmartWord.prototype), "constructor", this).apply(this, arguments);

    this.wordRegex = /[\w-]+/;
  }

  return SmartWord;
})(Word);

SmartWord.register(false, true);

// Just include _, -

var Subword = (function (_Word3) {
  _inherits(Subword, _Word3);

  function Subword() {
    _classCallCheck(this, Subword);

    _get(Object.getPrototypeOf(Subword.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Subword, [{
    key: "getRange",
    value: function getRange(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return _get(Object.getPrototypeOf(Subword.prototype), "getRange", this).call(this, selection);
    }
  }]);

  return Subword;
})(Word);

Subword.register(false, true);

// Section: Pair
// =========================

var Pair = (function (_TextObject2) {
  _inherits(Pair, _TextObject2);

  function Pair() {
    _classCallCheck(this, Pair);

    _get(Object.getPrototypeOf(Pair.prototype), "constructor", this).apply(this, arguments);

    this.supportCount = true;
    this.allowNextLine = null;
    this.adjustInnerRange = true;
    this.pair = null;
    this.inclusive = true;
  }

  _createClass(Pair, [{
    key: "isAllowNextLine",
    value: function isAllowNextLine() {
      return this.allowNextLine != null ? this.allowNextLine : this.pair != null && this.pair[0] !== this.pair[1];
    }
  }, {
    key: "adjustRange",
    value: function adjustRange(_ref3) {
      var start = _ref3.start;
      var end = _ref3.end;

      // Dirty work to feel natural for human, to behave compatible with pure Vim.
      // Where this adjustment appear is in following situation.
      // op-1: `ci{` replace only 2nd line
      // op-2: `di{` delete only 2nd line.
      // text:
      //  {
      //    aaa
      //  }
      if (this.utils.pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }

      if (this.utils.getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === "visual") {
          // This is slightly innconsistent with regular Vim
          // - regular Vim: select new line after EOL
          // - vim-mode-plus: select to EOL(before new line)
          // This is intentional since to make submode `characterwise` when auto-detect submode
          // innerEnd = new Point(innerEnd.row - 1, Infinity)
          end = new Point(end.row - 1, Infinity);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    }
  }, {
    key: "getFinder",
    value: function getFinder() {
      var finderName = this.pair[0] === this.pair[1] ? "QuoteFinder" : "BracketFinder";
      return new PairFinder[finderName](this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair,
        inclusive: this.inclusive
      });
    }
  }, {
    key: "getPairInfo",
    value: function getPairInfo(from) {
      var pairInfo = this.getFinder().find(from);
      if (pairInfo) {
        if (this.adjustInnerRange) pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
        pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
        return pairInfo;
      }
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      // When range was same, try to expand range
      if (pairInfo && pairInfo.targetRange.isEqual(originalRange)) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      if (pairInfo) return pairInfo.targetRange;
    }
  }]);

  return Pair;
})(TextObject);

Pair.register(false);

// Used by DeleteSurround

var APair = (function (_Pair) {
  _inherits(APair, _Pair);

  function APair() {
    _classCallCheck(this, APair);

    _get(Object.getPrototypeOf(APair.prototype), "constructor", this).apply(this, arguments);
  }

  return APair;
})(Pair);

APair.register(false);

var AnyPair = (function (_Pair2) {
  _inherits(AnyPair, _Pair2);

  function AnyPair() {
    _classCallCheck(this, AnyPair);

    _get(Object.getPrototypeOf(AnyPair.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = false;
    this.member = ["DoubleQuote", "SingleQuote", "BackTick", "CurlyBracket", "AngleBracket", "SquareBracket", "Parenthesis"];
  }

  _createClass(AnyPair, [{
    key: "getRanges",
    value: function getRanges(selection) {
      var _this2 = this;

      var options = { inner: this.inner, allowForwarding: this.allowForwarding, inclusive: this.inclusive };
      return this.member.map(function (member) {
        return _this2.getInstance(member, options).getRange(selection);
      }).filter(function (range) {
        return range;
      });
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      return _.last(this.utils.sortRanges(this.getRanges(selection)));
    }
  }]);

  return AnyPair;
})(Pair);

AnyPair.register(false, true);

var AnyPairAllowForwarding = (function (_AnyPair) {
  _inherits(AnyPairAllowForwarding, _AnyPair);

  function AnyPairAllowForwarding() {
    _classCallCheck(this, AnyPairAllowForwarding);

    _get(Object.getPrototypeOf(AnyPairAllowForwarding.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
  }

  _createClass(AnyPairAllowForwarding, [{
    key: "getRange",
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      var from = selection.cursor.getBufferPosition();

      var _$partition = _.partition(ranges, function (range) {
        return range.start.isGreaterThanOrEqual(from);
      });

      var _$partition2 = _slicedToArray(_$partition, 2);

      var forwardingRanges = _$partition2[0];
      var enclosingRanges = _$partition2[1];

      var enclosingRange = _.last(this.utils.sortRanges(enclosingRanges));
      forwardingRanges = this.utils.sortRanges(forwardingRanges);

      // When enclosingRange is exists,
      // We don't go across enclosingRange.end.
      // So choose from ranges contained in enclosingRange.
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function (range) {
          return enclosingRange.containsRange(range);
        });
      }

      return forwardingRanges[0] || enclosingRange;
    }
  }]);

  return AnyPairAllowForwarding;
})(AnyPair);

AnyPairAllowForwarding.register(false, true);

var AnyQuote = (function (_AnyPair2) {
  _inherits(AnyQuote, _AnyPair2);

  function AnyQuote() {
    _classCallCheck(this, AnyQuote);

    _get(Object.getPrototypeOf(AnyQuote.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
    this.member = ["DoubleQuote", "SingleQuote", "BackTick"];
  }

  _createClass(AnyQuote, [{
    key: "getRange",
    value: function getRange(selection) {
      var ranges = this.getRanges(selection);
      // Pick range which end.colum is leftmost(mean, closed first)
      if (ranges.length) return _.first(_.sortBy(ranges, function (r) {
        return r.end.column;
      }));
    }
  }]);

  return AnyQuote;
})(AnyPair);

AnyQuote.register(false, true);

var Quote = (function (_Pair3) {
  _inherits(Quote, _Pair3);

  function Quote() {
    _classCallCheck(this, Quote);

    _get(Object.getPrototypeOf(Quote.prototype), "constructor", this).apply(this, arguments);

    this.allowForwarding = true;
  }

  return Quote;
})(Pair);

Quote.register(false);

var DoubleQuote = (function (_Quote) {
  _inherits(DoubleQuote, _Quote);

  function DoubleQuote() {
    _classCallCheck(this, DoubleQuote);

    _get(Object.getPrototypeOf(DoubleQuote.prototype), "constructor", this).apply(this, arguments);

    this.pair = ['"', '"'];
  }

  return DoubleQuote;
})(Quote);

DoubleQuote.register(false, true);

var SingleQuote = (function (_Quote2) {
  _inherits(SingleQuote, _Quote2);

  function SingleQuote() {
    _classCallCheck(this, SingleQuote);

    _get(Object.getPrototypeOf(SingleQuote.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["'", "'"];
  }

  return SingleQuote;
})(Quote);

SingleQuote.register(false, true);

var BackTick = (function (_Quote3) {
  _inherits(BackTick, _Quote3);

  function BackTick() {
    _classCallCheck(this, BackTick);

    _get(Object.getPrototypeOf(BackTick.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["`", "`"];
  }

  return BackTick;
})(Quote);

BackTick.register(false, true);

var CurlyBracket = (function (_Pair4) {
  _inherits(CurlyBracket, _Pair4);

  function CurlyBracket() {
    _classCallCheck(this, CurlyBracket);

    _get(Object.getPrototypeOf(CurlyBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["{", "}"];
  }

  return CurlyBracket;
})(Pair);

CurlyBracket.register(false, true, true);

var SquareBracket = (function (_Pair5) {
  _inherits(SquareBracket, _Pair5);

  function SquareBracket() {
    _classCallCheck(this, SquareBracket);

    _get(Object.getPrototypeOf(SquareBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["[", "]"];
  }

  return SquareBracket;
})(Pair);

SquareBracket.register(false, true, true);

var Parenthesis = (function (_Pair6) {
  _inherits(Parenthesis, _Pair6);

  function Parenthesis() {
    _classCallCheck(this, Parenthesis);

    _get(Object.getPrototypeOf(Parenthesis.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["(", ")"];
  }

  return Parenthesis;
})(Pair);

Parenthesis.register(false, true, true);

var AngleBracket = (function (_Pair7) {
  _inherits(AngleBracket, _Pair7);

  function AngleBracket() {
    _classCallCheck(this, AngleBracket);

    _get(Object.getPrototypeOf(AngleBracket.prototype), "constructor", this).apply(this, arguments);

    this.pair = ["<", ">"];
  }

  return AngleBracket;
})(Pair);

AngleBracket.register(false, true, true);

var Tag = (function (_Pair8) {
  _inherits(Tag, _Pair8);

  function Tag() {
    _classCallCheck(this, Tag);

    _get(Object.getPrototypeOf(Tag.prototype), "constructor", this).apply(this, arguments);

    this.allowNextLine = true;
    this.allowForwarding = true;
    this.adjustInnerRange = false;
  }

  _createClass(Tag, [{
    key: "getTagStartPoint",
    value: function getTagStartPoint(from) {
      var tagRange = undefined;
      var pattern = PairFinder.TagFinder.pattern;

      this.scanForward(pattern, { from: [from.row, 0] }, function (_ref4) {
        var range = _ref4.range;
        var stop = _ref4.stop;

        if (range.containsPoint(from, true)) {
          tagRange = range;
          stop();
        }
      });
      if (tagRange) return tagRange.start;
    }
  }, {
    key: "getFinder",
    value: function getFinder() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    }
  }, {
    key: "getPairInfo",
    value: function getPairInfo(from) {
      return _get(Object.getPrototypeOf(Tag.prototype), "getPairInfo", this).call(this, this.getTagStartPoint(from) || from);
    }
  }]);

  return Tag;
})(Pair);

Tag.register(false, true);

// Section: Paragraph
// =========================
// Paragraph is defined as consecutive (non-)blank-line.

var Paragraph = (function (_TextObject3) {
  _inherits(Paragraph, _TextObject3);

  function Paragraph() {
    _classCallCheck(this, Paragraph);

    _get(Object.getPrototypeOf(Paragraph.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.supportCount = true;
  }

  _createClass(Paragraph, [{
    key: "findRow",
    value: function findRow(fromRow, direction, fn) {
      if (fn.reset) fn.reset();
      var foundRow = fromRow;
      for (var row of this.utils.getBufferRows(this.editor, { startRow: fromRow, direction: direction })) {
        if (!fn(row, direction)) break;
        foundRow = row;
      }
      return foundRow;
    }
  }, {
    key: "findRowRangeBy",
    value: function findRowRangeBy(fromRow, fn) {
      var startRow = this.findRow(fromRow, "previous", fn);
      var endRow = this.findRow(fromRow, "next", fn);
      return [startRow, endRow];
    }
  }, {
    key: "getPredictFunction",
    value: function getPredictFunction(fromRow, selection) {
      var _this3 = this;

      var fromRowResult = this.editor.isBufferRowBlank(fromRow);

      if (this.isInner()) {
        return function (row, direction) {
          return _this3.editor.isBufferRowBlank(row) === fromRowResult;
        };
      } else {
        var _ret = (function () {
          var directionToExtend = selection.isReversed() ? "previous" : "next";

          var flip = false;
          var predict = function predict(row, direction) {
            var result = _this3.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if (!result && direction === directionToExtend) {
                return flip = true;
              }
              return result;
            }
          };
          predict.reset = function () {
            return flip = false;
          };
          return {
            v: predict
          };
        })();

        if (typeof _ret === "object") return _ret.v;
      }
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var originalRange = selection.getBufferRange();
      var fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode("visual", "linewise")) {
        if (selection.isReversed()) fromRow--;else fromRow++;
        fromRow = this.getValidVimBufferRow(fromRow);
      }
      var rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    }
  }]);

  return Paragraph;
})(TextObject);

Paragraph.register(false, true);

var Indentation = (function (_Paragraph) {
  _inherits(Indentation, _Paragraph);

  function Indentation() {
    _classCallCheck(this, Indentation);

    _get(Object.getPrototypeOf(Indentation.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Indentation, [{
    key: "getRange",
    value: function getRange(selection) {
      var _this4 = this;

      var fromRow = this.getCursorPositionForSelection(selection).row;
      var baseIndentLevel = this.editor.indentationForBufferRow(fromRow);
      var rowRange = this.findRowRangeBy(fromRow, function (row) {
        return _this4.editor.isBufferRowBlank(row) ? _this4.isA() : _this4.editor.indentationForBufferRow(row) >= baseIndentLevel;
      });
      return this.getBufferRangeForRowRange(rowRange);
    }
  }]);

  return Indentation;
})(Paragraph);

Indentation.register(false, true);

// Section: Comment
// =========================

var Comment = (function (_TextObject4) {
  _inherits(Comment, _TextObject4);

  function Comment() {
    _classCallCheck(this, Comment);

    _get(Object.getPrototypeOf(Comment.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(Comment, [{
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection.row;

      var rowRange = this.utils.getRowRangeForCommentAtBufferRow(this.editor, row);
      if (rowRange) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    }
  }]);

  return Comment;
})(TextObject);

Comment.register(false, true);

var CommentOrParagraph = (function (_TextObject5) {
  _inherits(CommentOrParagraph, _TextObject5);

  function CommentOrParagraph() {
    _classCallCheck(this, CommentOrParagraph);

    _get(Object.getPrototypeOf(CommentOrParagraph.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(CommentOrParagraph, [{
    key: "getRange",
    value: function getRange(selection) {
      var inner = this.inner;

      for (var klass of ["Comment", "Paragraph"]) {
        var range = this.getInstance(klass, { inner: inner }).getRange(selection);
        if (range) return range;
      }
    }
  }]);

  return CommentOrParagraph;
})(TextObject);

CommentOrParagraph.register(false, true);

// Section: Fold
// =========================

var Fold = (function (_TextObject6) {
  _inherits(Fold, _TextObject6);

  function Fold() {
    _classCallCheck(this, Fold);

    _get(Object.getPrototypeOf(Fold.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
  }

  _createClass(Fold, [{
    key: "adjustRowRange",
    value: function adjustRowRange(rowRange) {
      if (this.isA()) return rowRange;

      var _rowRange = _slicedToArray(rowRange, 2);

      var startRow = _rowRange[0];
      var endRow = _rowRange[1];

      if (this.editor.indentationForBufferRow(startRow) === this.editor.indentationForBufferRow(endRow)) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    }
  }, {
    key: "getFoldRowRangesContainsForRow",
    value: function getFoldRowRangesContainsForRow(row) {
      return this.utils.getCodeFoldRowRangesContainesForRow(this.editor, row).reverse();
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection2 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection2.row;

      var selectedRange = selection.getBufferRange();
      for (var rowRange of this.getFoldRowRangesContainsForRow(row)) {
        var range = this.getBufferRangeForRowRange(this.adjustRowRange(rowRange));

        // Don't change to `if range.containsRange(selectedRange, true)`
        // There is behavior diff when cursor is at beginning of line( column 0 ).
        if (!selectedRange.containsRange(range)) return range;
      }
    }
  }]);

  return Fold;
})(TextObject);

Fold.register(false, true);

// NOTE: Function range determination is depending on fold.

var Function = (function (_Fold) {
  _inherits(Function, _Fold);

  function Function() {
    _classCallCheck(this, Function);

    _get(Object.getPrototypeOf(Function.prototype), "constructor", this).apply(this, arguments);

    this.scopeNamesOmittingEndRow = ["source.go", "source.elixir"];
  }

  _createClass(Function, [{
    key: "isGrammarNotFoldEndRow",
    value: function isGrammarNotFoldEndRow() {
      var _editor$getGrammar = this.editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;
      var packageName = _editor$getGrammar.packageName;

      if (this.scopeNamesOmittingEndRow.includes(scopeName)) {
        return true;
      } else {
        // HACK: Rust have two package `language-rust` and `atom-language-rust`
        // language-rust don't fold ending `}`, but atom-language-rust does.
        return scopeName === "source.rust" && packageName === "language-rust";
      }
    }
  }, {
    key: "getFoldRowRangesContainsForRow",
    value: function getFoldRowRangesContainsForRow(row) {
      var _this5 = this;

      return _get(Object.getPrototypeOf(Function.prototype), "getFoldRowRangesContainsForRow", this).call(this, row).filter(function (rowRange) {
        return _this5.utils.isIncludeFunctionScopeForRow(_this5.editor, rowRange[0]);
      });
    }
  }, {
    key: "adjustRowRange",
    value: function adjustRowRange(rowRange) {
      var _get$call = _get(Object.getPrototypeOf(Function.prototype), "adjustRowRange", this).call(this, rowRange);

      var _get$call2 = _slicedToArray(_get$call, 2);

      var startRow = _get$call2[0];
      var endRow = _get$call2[1];

      // NOTE: This adjustment shoud not be necessary if language-syntax is properly defined.
      if (this.isA() && this.isGrammarNotFoldEndRow()) endRow += 1;
      return [startRow, endRow];
    }
  }]);

  return Function;
})(Fold);

Function.register(false, true);

// Section: Other
// =========================

var Arguments = (function (_TextObject7) {
  _inherits(Arguments, _TextObject7);

  function Arguments() {
    _classCallCheck(this, Arguments);

    _get(Object.getPrototypeOf(Arguments.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Arguments, [{
    key: "newArgInfo",
    value: function newArgInfo(argStart, arg, separator) {
      var argEnd = this.utils.traverseTextFromPoint(argStart, arg);
      var argRange = new Range(argStart, argEnd);

      var separatorEnd = this.utils.traverseTextFromPoint(argEnd, separator != null ? separator : "");
      var separatorRange = new Range(argEnd, separatorEnd);

      var innerRange = argRange;
      var aRange = argRange.union(separatorRange);
      return { argRange: argRange, separatorRange: separatorRange, innerRange: innerRange, aRange: aRange };
    }
  }, {
    key: "getArgumentsRangeForSelection",
    value: function getArgumentsRangeForSelection(selection) {
      var options = {
        member: ["CurlyBracket", "SquareBracket", "Parenthesis"],
        inclusive: false
      };
      return this.getInstance("InnerAnyPair", options).getRange(selection);
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var range = this.getArgumentsRangeForSelection(selection);
      var pairRangeFound = range != null;

      range = range || this.getInstance("InnerCurrentLine").getRange(selection); // fallback
      if (!range) return;

      range = this.utils.trimRange(this.editor, range);

      var text = this.editor.getTextInBufferRange(range);
      var allTokens = this.utils.splitArguments(text, pairRangeFound);

      var argInfos = [];
      var argStart = range.start;

      // Skip starting separator
      if (allTokens.length && allTokens[0].type === "separator") {
        var token = allTokens.shift();
        argStart = this.utils.traverseTextFromPoint(argStart, token.text);
      }

      while (allTokens.length) {
        var token = allTokens.shift();
        if (token.type === "argument") {
          var nextToken = allTokens.shift();
          var separator = nextToken ? nextToken.text : undefined;
          var argInfo = this.newArgInfo(argStart, token.text, separator);

          if (allTokens.length === 0 && argInfos.length) {
            argInfo.aRange = argInfo.argRange.union(_.last(argInfos).separatorRange);
          }

          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error("must not happen");
        }
      }

      var point = this.getCursorPositionForSelection(selection);
      for (var _ref52 of argInfos) {
        var innerRange = _ref52.innerRange;
        var aRange = _ref52.aRange;

        if (innerRange.end.isGreaterThanOrEqual(point)) {
          return this.isInner() ? innerRange : aRange;
        }
      }
    }
  }]);

  return Arguments;
})(TextObject);

Arguments.register(false, true);

var CurrentLine = (function (_TextObject8) {
  _inherits(CurrentLine, _TextObject8);

  function CurrentLine() {
    _classCallCheck(this, CurrentLine);

    _get(Object.getPrototypeOf(CurrentLine.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(CurrentLine, [{
    key: "getRange",
    value: function getRange(selection) {
      var _getCursorPositionForSelection3 = this.getCursorPositionForSelection(selection);

      var row = _getCursorPositionForSelection3.row;

      var range = this.editor.bufferRangeForBufferRow(row);
      return this.isA() ? range : this.utils.trimRange(this.editor, range);
    }
  }]);

  return CurrentLine;
})(TextObject);

CurrentLine.register(false, true);

var Entire = (function (_TextObject9) {
  _inherits(Entire, _TextObject9);

  function Entire() {
    _classCallCheck(this, Entire);

    _get(Object.getPrototypeOf(Entire.prototype), "constructor", this).apply(this, arguments);

    this.wise = "linewise";
    this.selectOnce = true;
  }

  _createClass(Entire, [{
    key: "getRange",
    value: function getRange(selection) {
      return this.editor.buffer.getRange();
    }
  }]);

  return Entire;
})(TextObject);

Entire.register(false, true);

var Empty = (function (_TextObject10) {
  _inherits(Empty, _TextObject10);

  function Empty() {
    _classCallCheck(this, Empty);

    _get(Object.getPrototypeOf(Empty.prototype), "constructor", this).apply(this, arguments);

    this.selectOnce = true;
  }

  return Empty;
})(TextObject);

Empty.register(false);

var LatestChange = (function (_TextObject11) {
  _inherits(LatestChange, _TextObject11);

  function LatestChange() {
    _classCallCheck(this, LatestChange);

    _get(Object.getPrototypeOf(LatestChange.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LatestChange, [{
    key: "getRange",
    value: function getRange(selection) {
      var start = this.vimState.mark.get("[");
      var end = this.vimState.mark.get("]");
      if (start && end) {
        return new Range(start, end);
      }
    }
  }]);

  return LatestChange;
})(TextObject);

LatestChange.register(false, true);

var SearchMatchForward = (function (_TextObject12) {
  _inherits(SearchMatchForward, _TextObject12);

  function SearchMatchForward() {
    _classCallCheck(this, SearchMatchForward);

    _get(Object.getPrototypeOf(SearchMatchForward.prototype), "constructor", this).apply(this, arguments);

    this.backward = false;
  }

  _createClass(SearchMatchForward, [{
    key: "findMatch",
    value: function findMatch(fromPoint, pattern) {
      if (this.mode === "visual") {
        fromPoint = this.utils.translatePointAndClip(this.editor, fromPoint, "forward");
      }
      var foundRange = undefined;
      this.scanForward(pattern, { from: [fromPoint.row, 0] }, function (_ref6) {
        var range = _ref6.range;
        var stop = _ref6.stop;

        if (range.end.isGreaterThan(fromPoint)) {
          foundRange = range;
          stop();
        }
      });
      return { range: foundRange, whichIsHead: "end" };
    }
  }, {
    key: "getRange",
    value: function getRange(selection) {
      var pattern = this.globalState.get("lastSearchPattern");
      if (!pattern) return;

      var fromPoint = selection.getHeadBufferPosition();

      var _findMatch = this.findMatch(fromPoint, pattern);

      var range = _findMatch.range;
      var whichIsHead = _findMatch.whichIsHead;

      if (range) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    }
  }, {
    key: "unionRangeAndDetermineReversedState",
    value: function unionRangeAndDetermineReversedState(selection, range, whichIsHead) {
      if (selection.isEmpty()) return range;

      var head = range[whichIsHead];
      var tail = selection.getTailBufferPosition();

      if (this.backward) {
        if (tail.isLessThan(head)) head = this.utils.translatePointAndClip(this.editor, head, "forward");
      } else {
        if (head.isLessThan(tail)) head = this.utils.translatePointAndClip(this.editor, head, "backward");
      }

      this.reversed = head.isLessThan(tail);
      return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
    }
  }, {
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      var range = this.getRange(selection);
      if (range) {
        this.swrap(selection).setBufferRange(range, { reversed: this.reversed != null ? this.reversed : this.backward });
        return true;
      }
    }
  }]);

  return SearchMatchForward;
})(TextObject);

SearchMatchForward.register();

var SearchMatchBackward = (function (_SearchMatchForward) {
  _inherits(SearchMatchBackward, _SearchMatchForward);

  function SearchMatchBackward() {
    _classCallCheck(this, SearchMatchBackward);

    _get(Object.getPrototypeOf(SearchMatchBackward.prototype), "constructor", this).apply(this, arguments);

    this.backward = true;
  }

  _createClass(SearchMatchBackward, [{
    key: "findMatch",
    value: function findMatch(fromPoint, pattern) {
      if (this.mode === "visual") {
        fromPoint = this.utils.translatePointAndClip(this.editor, fromPoint, "backward");
      }
      var foundRange = undefined;
      this.scanBackward(pattern, { from: [fromPoint.row, Infinity] }, function (_ref7) {
        var range = _ref7.range;
        var stop = _ref7.stop;

        if (range.start.isLessThan(fromPoint)) {
          foundRange = range;
          stop();
        }
      });
      return { range: foundRange, whichIsHead: "start" };
    }
  }]);

  return SearchMatchBackward;
})(SearchMatchForward);

SearchMatchBackward.register();

// [Limitation: won't fix]: Selected range is not submode aware. always characterwise.
// So even if original selection was vL or vB, selected range by this text-object
// is always vC range.

var PreviousSelection = (function (_TextObject13) {
  _inherits(PreviousSelection, _TextObject13);

  function PreviousSelection() {
    _classCallCheck(this, PreviousSelection);

    _get(Object.getPrototypeOf(PreviousSelection.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PreviousSelection, [{
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      var _vimState$previousSelection = this.vimState.previousSelection;
      var properties = _vimState$previousSelection.properties;
      var submode = _vimState$previousSelection.submode;

      if (properties && submode) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    }
  }]);

  return PreviousSelection;
})(TextObject);

PreviousSelection.register();

var PersistentSelection = (function (_TextObject14) {
  _inherits(PersistentSelection, _TextObject14);

  function PersistentSelection() {
    _classCallCheck(this, PersistentSelection);

    _get(Object.getPrototypeOf(PersistentSelection.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(PersistentSelection, [{
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    }
  }]);

  return PersistentSelection;
})(TextObject);

PersistentSelection.register(false, true);

// Used only by ReplaceWithRegister and PutBefore and its' children.

var LastPastedRange = (function (_TextObject15) {
  _inherits(LastPastedRange, _TextObject15);

  function LastPastedRange() {
    _classCallCheck(this, LastPastedRange);

    _get(Object.getPrototypeOf(LastPastedRange.prototype), "constructor", this).apply(this, arguments);

    this.wise = null;
    this.selectOnce = true;
  }

  _createClass(LastPastedRange, [{
    key: "selectTextObject",
    value: function selectTextObject(selection) {
      for (selection of this.editor.getSelections()) {
        var range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    }
  }]);

  return LastPastedRange;
})(TextObject);

LastPastedRange.register(false);

var VisibleArea = (function (_TextObject16) {
  _inherits(VisibleArea, _TextObject16);

  function VisibleArea() {
    _classCallCheck(this, VisibleArea);

    _get(Object.getPrototypeOf(VisibleArea.prototype), "constructor", this).apply(this, arguments);

    this.selectOnce = true;
  }

  _createClass(VisibleArea, [{
    key: "getRange",
    value: function getRange(selection) {
      // [BUG?] Need translate to shilnk top and bottom to fit actual row.
      // The reason I need -2 at bottom is because of status bar?
      var range = this.utils.getVisibleBufferRange(this.editor);
      return range.getRows() > this.editor.getRowsPerPage() ? range.translate([+1, 0], [-3, 0]) : range;
    }
  }]);

  return VisibleArea;
})(TextObject);

VisibleArea.register(false, true);
// FIXME #472, #66

// Some language don't include closing `}` into fold.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvbGliL3RleHQtb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQTs7Ozs7Ozs7Ozs7O2VBRVksT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBL0IsS0FBSyxZQUFMLEtBQUs7SUFBRSxLQUFLLFlBQUwsS0FBSzs7QUFDbkIsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7Ozs7O0FBS3BDLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7O0lBRXJDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7U0FHZCxJQUFJLEdBQUcsZUFBZTtTQUN0QixZQUFZLEdBQUcsS0FBSztTQUNwQixVQUFVLEdBQUcsS0FBSztTQUNsQixlQUFlLEdBQUcsS0FBSzs7O2VBTm5CLFVBQVU7O1dBb0NQLG1CQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQ2xCOzs7V0FFRSxlQUFHO0FBQ0osYUFBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUE7S0FDbkI7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQTtLQUNoQzs7O1dBRVUsdUJBQUc7QUFDWixhQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFBO0tBQ2pDOzs7V0FFUSxtQkFBQyxJQUFJLEVBQUU7QUFDZCxhQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQzFCOzs7V0FFUyxzQkFBRztBQUNYLFVBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFBO0tBQzdCOzs7Ozs7O1dBS00sbUJBQUc7O0FBRVIsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFB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ZUFEYixXQUFXOztXQUdQLGtCQUFDLFNBQVMsRUFBRTs7O0FBR2xCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzNELGFBQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7S0FDbEc7OztTQVJHLFdBQVc7R0FBUyxVQUFVOztBQVVwQyxXQUFXLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL2xpYi90ZXh0LW9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuY29uc3Qge1JhbmdlLCBQb2ludH0gPSByZXF1aXJlKFwiYXRvbVwiKVxuY29uc3QgXyA9IHJlcXVpcmUoXCJ1bmRlcnNjb3JlLXBsdXNcIilcblxuLy8gW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbi8vICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24odGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pKVxuLy8gIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbmNvbnN0IEJhc2UgPSByZXF1aXJlKFwiLi9iYXNlXCIpXG5jb25zdCBQYWlyRmluZGVyID0gcmVxdWlyZShcIi4vcGFpci1maW5kZXJcIilcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2Uge1xuICBzdGF0aWMgb3BlcmF0aW9uS2luZCA9IFwidGV4dC1vYmplY3RcIlxuXG4gIHdpc2UgPSBcImNoYXJhY3Rlcndpc2VcIlxuICBzdXBwb3J0Q291bnQgPSBmYWxzZSAvLyBGSVhNRSAjNDcyLCAjNjZcbiAgc2VsZWN0T25jZSA9IGZhbHNlXG4gIHNlbGVjdFN1Y2NlZWRlZCA9IGZhbHNlXG5cbiAgc3RhdGljIHJlZ2lzdGVyKGlzQ29tbWFuZCwgZGVyaXZlSW5uZXJBbmRBLCBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICBzdXBlci5yZWdpc3Rlcihpc0NvbW1hbmQpXG5cbiAgICBpZiAoZGVyaXZlSW5uZXJBbmRBKSB7XG4gICAgICB0aGlzLmdlbmVyYXRlQ2xhc3MoYEEke3RoaXMubmFtZX1gLCBmYWxzZSlcbiAgICAgIHRoaXMuZ2VuZXJhdGVDbGFzcyhgSW5uZXIke3RoaXMubmFtZX1gLCB0cnVlKVxuICAgIH1cblxuICAgIGlmIChkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcpIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVDbGFzcyhgQSR7dGhpcy5uYW1lfUFsbG93Rm9yd2FyZGluZ2AsIGZhbHNlLCB0cnVlKVxuICAgICAgdGhpcy5nZW5lcmF0ZUNsYXNzKGBJbm5lciR7dGhpcy5uYW1lfUFsbG93Rm9yd2FyZGluZ2AsIHRydWUsIHRydWUpXG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGdlbmVyYXRlQ2xhc3Moa2xhc3NOYW1lLCBpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSB7XG4gICAgY29uc3Qga2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXMge1xuICAgICAgc3RhdGljIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4ga2xhc3NOYW1lXG4gICAgICB9XG4gICAgICBjb25zdHJ1Y3Rvcih2aW1TdGF0ZSkge1xuICAgICAgICBzdXBlcih2aW1TdGF0ZSlcbiAgICAgICAgdGhpcy5pbm5lciA9IGlubmVyXG4gICAgICAgIGlmIChhbGxvd0ZvcndhcmRpbmcgIT0gbnVsbCkgdGhpcy5hbGxvd0ZvcndhcmRpbmcgPSBhbGxvd0ZvcndhcmRpbmdcbiAgICAgIH1cbiAgICB9XG4gICAga2xhc3MucmVnaXN0ZXIoKVxuICB9XG5cbiAgaXNJbm5lcigpIHtcbiAgICByZXR1cm4gdGhpcy5pbm5lclxuICB9XG5cbiAgaXNBKCkge1xuICAgIHJldHVybiAhdGhpcy5pbm5lclxuICB9XG5cbiAgaXNMaW5ld2lzZSgpIHtcbiAgICByZXR1cm4gdGhpcy53aXNlID09PSBcImxpbmV3aXNlXCJcbiAgfVxuXG4gIGlzQmxvY2t3aXNlKCkge1xuICAgIHJldHVybiB0aGlzLndpc2UgPT09IFwiYmxvY2t3aXNlXCJcbiAgfVxuXG4gIGZvcmNlV2lzZSh3aXNlKSB7XG4gICAgcmV0dXJuICh0aGlzLndpc2UgPSB3aXNlKSAvLyBGSVhNRSBjdXJyZW50bHkgbm90IHdlbGwgc3VwcG9ydGVkXG4gIH1cblxuICByZXNldFN0YXRlKCkge1xuICAgIHRoaXMuc2VsZWN0U3VjY2VlZGVkID0gZmFsc2VcbiAgfVxuXG4gIC8vIGV4ZWN1dGU6IENhbGxlZCBmcm9tIE9wZXJhdG9yOjpzZWxlY3RUYXJnZXQoKVxuICAvLyAgLSBgdiBpIHBgLCBpcyBgU2VsZWN0SW5WaXN1YWxNb2RlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAvLyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICBleGVjdXRlKCkge1xuICAgIC8vIFdoZW5uZXZlciBUZXh0T2JqZWN0IGlzIGV4ZWN1dGVkLCBpdCBoYXMgQG9wZXJhdG9yXG4gICAgaWYgKCF0aGlzLm9wZXJhdG9yKSB0aHJvdyBuZXcgRXJyb3IoXCJpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW5cIilcbiAgICB0aGlzLnNlbGVjdCgpXG4gIH1cblxuICBzZWxlY3QoKSB7XG4gICAgaWYgKHRoaXMuaXNNb2RlKFwidmlzdWFsXCIsIFwiYmxvY2t3aXNlXCIpKSB7XG4gICAgICB0aGlzLnN3cmFwLm5vcm1hbGl6ZSh0aGlzLmVkaXRvcilcbiAgICB9XG5cbiAgICB0aGlzLmNvdW50VGltZXModGhpcy5nZXRDb3VudCgpLCAoe3N0b3B9KSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc3VwcG9ydENvdW50KSBzdG9wKCkgLy8gcXVpY2stZml4IGZvciAjNTYwXG5cbiAgICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIHRoaXMuZWRpdG9yLmdldFNlbGVjdGlvbnMoKSkge1xuICAgICAgICBjb25zdCBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSkgdGhpcy5zZWxlY3RTdWNjZWVkZWQgPSB0cnVlXG4gICAgICAgIGlmIChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5pc0VxdWFsKG9sZFJhbmdlKSkgc3RvcCgpXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdE9uY2UpIGJyZWFrXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgLy8gU29tZSBUZXh0T2JqZWN0J3Mgd2lzZSBpcyBOT1QgZGV0ZXJtaW5pc3RpYy4gSXQgaGFzIHRvIGJlIGRldGVjdGVkIGZyb20gc2VsZWN0ZWQgcmFuZ2UuXG4gICAgaWYgKHRoaXMud2lzZSA9PSBudWxsKSB0aGlzLndpc2UgPSB0aGlzLnN3cmFwLmRldGVjdFdpc2UodGhpcy5lZGl0b3IpXG5cbiAgICBpZiAodGhpcy5vcGVyYXRvci5pbnN0YW5jZW9mKFwiU2VsZWN0QmFzZVwiKSkge1xuICAgICAgaWYgKHRoaXMuc2VsZWN0U3VjY2VlZGVkKSB7XG4gICAgICAgIGlmICh0aGlzLndpc2UgPT09IFwiY2hhcmFjdGVyd2lzZVwiKSB7XG4gICAgICAgICAgdGhpcy5zd3JhcC5zYXZlUHJvcGVydGllcyh0aGlzLmVkaXRvciwge2ZvcmNlOiB0cnVlfSlcblxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2lzZSA9PT0gXCJsaW5ld2lzZVwiKSB7XG4gICAgICAgICAgLy8gV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAvLyBTbyB3ZSBoYXZlIHRvIGFzc3VyZSBhbGwgc2VsZWN0aW9uIGhhdmUgc2VsY3Rpb24gcHJvcGVydHkuXG4gICAgICAgICAgLy8gTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgIGZvciAoY29uc3QgJHNlbGVjdGlvbiBvZiB0aGlzLnN3cmFwLmdldFNlbGVjdGlvbnModGhpcy5lZGl0b3IpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWcoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIpKSB7XG4gICAgICAgICAgICAgIGlmICghJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKCkpICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnN1Ym1vZGUgPT09IFwiYmxvY2t3aXNlXCIpIHtcbiAgICAgICAgZm9yIChjb25zdCAkc2VsZWN0aW9uIG9mIHRoaXMuc3dyYXAuZ2V0U2VsZWN0aW9ucyh0aGlzLmVkaXRvcikpIHtcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoXCJibG9ja3dpc2VcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybiB0cnVlIG9yIGZhbHNlXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICBpZiAocmFuZ2UpIHtcbiAgICAgIHRoaXMuc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8vIHRvIG92ZXJyaWRlXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge31cbn1cblRleHRPYmplY3QucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIFNlY3Rpb246IFdvcmRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCB7cmFuZ2V9ID0gdGhpcy5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwge3dvcmRSZWdleDogdGhpcy53b3JkUmVnZXh9KVxuICAgIHJldHVybiB0aGlzLmlzQSgpID8gdGhpcy51dGlscy5leHBhbmRSYW5nZVRvV2hpdGVTcGFjZXModGhpcy5lZGl0b3IsIHJhbmdlKSA6IHJhbmdlXG4gIH1cbn1cbldvcmQucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIFdob2xlV29yZCBleHRlbmRzIFdvcmQge1xuICB3b3JkUmVnZXggPSAvXFxTKy9cbn1cbldob2xlV29yZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gSnVzdCBpbmNsdWRlIF8sIC1cbmNsYXNzIFNtYXJ0V29yZCBleHRlbmRzIFdvcmQge1xuICB3b3JkUmVnZXggPSAvW1xcdy1dKy9cbn1cblNtYXJ0V29yZC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gSnVzdCBpbmNsdWRlIF8sIC1cbmNsYXNzIFN1YndvcmQgZXh0ZW5kcyBXb3JkIHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgdGhpcy53b3JkUmVnZXggPSBzZWxlY3Rpb24uY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHJldHVybiBzdXBlci5nZXRSYW5nZShzZWxlY3Rpb24pXG4gIH1cbn1cblN1YndvcmQucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbi8vIFNlY3Rpb246IFBhaXJcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFBhaXIgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgc3VwcG9ydENvdW50ID0gdHJ1ZVxuICBhbGxvd05leHRMaW5lID0gbnVsbFxuICBhZGp1c3RJbm5lclJhbmdlID0gdHJ1ZVxuICBwYWlyID0gbnVsbFxuICBpbmNsdXNpdmUgPSB0cnVlXG5cbiAgaXNBbGxvd05leHRMaW5lKCkge1xuICAgIHJldHVybiB0aGlzLmFsbG93TmV4dExpbmUgIT0gbnVsbCA/IHRoaXMuYWxsb3dOZXh0TGluZSA6IHRoaXMucGFpciAhPSBudWxsICYmIHRoaXMucGFpclswXSAhPT0gdGhpcy5wYWlyWzFdXG4gIH1cblxuICBhZGp1c3RSYW5nZSh7c3RhcnQsIGVuZH0pIHtcbiAgICAvLyBEaXJ0eSB3b3JrIHRvIGZlZWwgbmF0dXJhbCBmb3IgaHVtYW4sIHRvIGJlaGF2ZSBjb21wYXRpYmxlIHdpdGggcHVyZSBWaW0uXG4gICAgLy8gV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgIC8vIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgIC8vIG9wLTI6IGBkaXtgIGRlbGV0ZSBvbmx5IDJuZCBsaW5lLlxuICAgIC8vIHRleHQ6XG4gICAgLy8gIHtcbiAgICAvLyAgICBhYWFcbiAgICAvLyAgfVxuICAgIGlmICh0aGlzLnV0aWxzLnBvaW50SXNBdEVuZE9mTGluZSh0aGlzLmVkaXRvciwgc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcbiAgICB9XG5cbiAgICBpZiAodGhpcy51dGlscy5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24odGhpcy5lZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pKSB7XG4gICAgICBpZiAodGhpcy5tb2RlID09PSBcInZpc3VhbFwiKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgIC8vIC0gcmVndWxhciBWaW06IHNlbGVjdCBuZXcgbGluZSBhZnRlciBFT0xcbiAgICAgICAgLy8gLSB2aW0tbW9kZS1wbHVzOiBzZWxlY3QgdG8gRU9MKGJlZm9yZSBuZXcgbGluZSlcbiAgICAgICAgLy8gVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAvLyBpbm5lckVuZCA9IG5ldyBQb2ludChpbm5lckVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuZCA9IG5ldyBQb2ludChlbmQucm93LCAwKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gIH1cblxuICBnZXRGaW5kZXIoKSB7XG4gICAgY29uc3QgZmluZGVyTmFtZSA9IHRoaXMucGFpclswXSA9PT0gdGhpcy5wYWlyWzFdID8gXCJRdW90ZUZpbmRlclwiIDogXCJCcmFja2V0RmluZGVyXCJcbiAgICByZXR1cm4gbmV3IFBhaXJGaW5kZXJbZmluZGVyTmFtZV0odGhpcy5lZGl0b3IsIHtcbiAgICAgIGFsbG93TmV4dExpbmU6IHRoaXMuaXNBbGxvd05leHRMaW5lKCksXG4gICAgICBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLFxuICAgICAgcGFpcjogdGhpcy5wYWlyLFxuICAgICAgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZSxcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8oZnJvbSkge1xuICAgIGNvbnN0IHBhaXJJbmZvID0gdGhpcy5nZXRGaW5kZXIoKS5maW5kKGZyb20pXG4gICAgaWYgKHBhaXJJbmZvKSB7XG4gICAgICBpZiAodGhpcy5hZGp1c3RJbm5lclJhbmdlKSBwYWlySW5mby5pbm5lclJhbmdlID0gdGhpcy5hZGp1c3RSYW5nZShwYWlySW5mby5pbm5lclJhbmdlKVxuICAgICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSB0aGlzLmlzSW5uZXIoKSA/IHBhaXJJbmZvLmlubmVyUmFuZ2UgOiBwYWlySW5mby5hUmFuZ2VcbiAgICAgIHJldHVybiBwYWlySW5mb1xuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGxldCBwYWlySW5mbyA9IHRoaXMuZ2V0UGFpckluZm8odGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pKVxuICAgIC8vIFdoZW4gcmFuZ2Ugd2FzIHNhbWUsIHRyeSB0byBleHBhbmQgcmFuZ2VcbiAgICBpZiAocGFpckluZm8gJiYgcGFpckluZm8udGFyZ2V0UmFuZ2UuaXNFcXVhbChvcmlnaW5hbFJhbmdlKSkge1xuICAgICAgcGFpckluZm8gPSB0aGlzLmdldFBhaXJJbmZvKHBhaXJJbmZvLmFSYW5nZS5lbmQpXG4gICAgfVxuICAgIGlmIChwYWlySW5mbykgcmV0dXJuIHBhaXJJbmZvLnRhcmdldFJhbmdlXG4gIH1cbn1cblBhaXIucmVnaXN0ZXIoZmFsc2UpXG5cbi8vIFVzZWQgYnkgRGVsZXRlU3Vycm91bmRcbmNsYXNzIEFQYWlyIGV4dGVuZHMgUGFpciB7fVxuQVBhaXIucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyIHtcbiAgYWxsb3dGb3J3YXJkaW5nID0gZmFsc2VcbiAgbWVtYmVyID0gW1wiRG91YmxlUXVvdGVcIiwgXCJTaW5nbGVRdW90ZVwiLCBcIkJhY2tUaWNrXCIsIFwiQ3VybHlCcmFja2V0XCIsIFwiQW5nbGVCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdXG5cbiAgZ2V0UmFuZ2VzKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7aW5uZXI6IHRoaXMuaW5uZXIsIGFsbG93Rm9yd2FyZGluZzogdGhpcy5hbGxvd0ZvcndhcmRpbmcsIGluY2x1c2l2ZTogdGhpcy5pbmNsdXNpdmV9XG4gICAgcmV0dXJuIHRoaXMubWVtYmVyLm1hcChtZW1iZXIgPT4gdGhpcy5nZXRJbnN0YW5jZShtZW1iZXIsIG9wdGlvbnMpLmdldFJhbmdlKHNlbGVjdGlvbikpLmZpbHRlcihyYW5nZSA9PiByYW5nZSlcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIHJldHVybiBfLmxhc3QodGhpcy51dGlscy5zb3J0UmFuZ2VzKHRoaXMuZ2V0UmFuZ2VzKHNlbGVjdGlvbikpKVxuICB9XG59XG5BbnlQYWlyLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCByYW5nZXMgPSB0aGlzLmdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgY29uc3QgZnJvbSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIGxldCBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uKHJhbmdlcywgcmFuZ2UgPT4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSkpXG4gICAgY29uc3QgZW5jbG9zaW5nUmFuZ2UgPSBfLmxhc3QodGhpcy51dGlscy5zb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHRoaXMudXRpbHMuc29ydFJhbmdlcyhmb3J3YXJkaW5nUmFuZ2VzKVxuXG4gICAgLy8gV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgLy8gV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAvLyBTbyBjaG9vc2UgZnJvbSByYW5nZXMgY29udGFpbmVkIGluIGVuY2xvc2luZ1JhbmdlLlxuICAgIGlmIChlbmNsb3NpbmdSYW5nZSkge1xuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyKHJhbmdlID0+IGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpKVxuICAgIH1cblxuICAgIHJldHVybiBmb3J3YXJkaW5nUmFuZ2VzWzBdIHx8IGVuY2xvc2luZ1JhbmdlXG4gIH1cbn1cbkFueVBhaXJBbGxvd0ZvcndhcmRpbmcucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEFueVF1b3RlIGV4dGVuZHMgQW55UGFpciB7XG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbiAgbWVtYmVyID0gW1wiRG91YmxlUXVvdGVcIiwgXCJTaW5nbGVRdW90ZVwiLCBcIkJhY2tUaWNrXCJdXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3QgcmFuZ2VzID0gdGhpcy5nZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIC8vIFBpY2sgcmFuZ2Ugd2hpY2ggZW5kLmNvbHVtIGlzIGxlZnRtb3N0KG1lYW4sIGNsb3NlZCBmaXJzdClcbiAgICBpZiAocmFuZ2VzLmxlbmd0aCkgcmV0dXJuIF8uZmlyc3QoXy5zb3J0QnkocmFuZ2VzLCByID0+IHIuZW5kLmNvbHVtbikpXG4gIH1cbn1cbkFueVF1b3RlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXIge1xuICBhbGxvd0ZvcndhcmRpbmcgPSB0cnVlXG59XG5RdW90ZS5yZWdpc3RlcihmYWxzZSlcblxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbJ1wiJywgJ1wiJ11cbn1cbkRvdWJsZVF1b3RlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlIHtcbiAgcGFpciA9IFtcIidcIiwgXCInXCJdXG59XG5TaW5nbGVRdW90ZS5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQmFja1RpY2sgZXh0ZW5kcyBRdW90ZSB7XG4gIHBhaXIgPSBbXCJgXCIsIFwiYFwiXVxufVxuQmFja1RpY2sucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIEN1cmx5QnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wie1wiLCBcIn1cIl1cbn1cbkN1cmx5QnJhY2tldC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSlcblxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wiW1wiLCBcIl1cIl1cbn1cblNxdWFyZUJyYWNrZXQucmVnaXN0ZXIoZmFsc2UsIHRydWUsIHRydWUpXG5cbmNsYXNzIFBhcmVudGhlc2lzIGV4dGVuZHMgUGFpciB7XG4gIHBhaXIgPSBbXCIoXCIsIFwiKVwiXVxufVxuUGFyZW50aGVzaXMucmVnaXN0ZXIoZmFsc2UsIHRydWUsIHRydWUpXG5cbmNsYXNzIEFuZ2xlQnJhY2tldCBleHRlbmRzIFBhaXIge1xuICBwYWlyID0gW1wiPFwiLCBcIj5cIl1cbn1cbkFuZ2xlQnJhY2tldC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSwgdHJ1ZSlcblxuY2xhc3MgVGFnIGV4dGVuZHMgUGFpciB7XG4gIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGFsbG93Rm9yd2FyZGluZyA9IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZSA9IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludChmcm9tKSB7XG4gICAgbGV0IHRhZ1JhbmdlXG4gICAgY29uc3Qge3BhdHRlcm59ID0gUGFpckZpbmRlci5UYWdGaW5kZXJcbiAgICB0aGlzLnNjYW5Gb3J3YXJkKHBhdHRlcm4sIHtmcm9tOiBbZnJvbS5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChyYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpKSB7XG4gICAgICAgIHRhZ1JhbmdlID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgICB9XG4gICAgfSlcbiAgICBpZiAodGFnUmFuZ2UpIHJldHVybiB0YWdSYW5nZS5zdGFydFxuICB9XG5cbiAgZ2V0RmluZGVyKCkge1xuICAgIHJldHVybiBuZXcgUGFpckZpbmRlci5UYWdGaW5kZXIodGhpcy5lZGl0b3IsIHtcbiAgICAgIGFsbG93TmV4dExpbmU6IHRoaXMuaXNBbGxvd05leHRMaW5lKCksXG4gICAgICBhbGxvd0ZvcndhcmRpbmc6IHRoaXMuYWxsb3dGb3J3YXJkaW5nLFxuICAgICAgaW5jbHVzaXZlOiB0aGlzLmluY2x1c2l2ZSxcbiAgICB9KVxuICB9XG5cbiAgZ2V0UGFpckluZm8oZnJvbSkge1xuICAgIHJldHVybiBzdXBlci5nZXRQYWlySW5mbyh0aGlzLmdldFRhZ1N0YXJ0UG9pbnQoZnJvbSkgfHwgZnJvbSlcbiAgfVxufVxuVGFnLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBTZWN0aW9uOiBQYXJhZ3JhcGhcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbi8vIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuICBzdXBwb3J0Q291bnQgPSB0cnVlXG5cbiAgZmluZFJvdyhmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSB7XG4gICAgaWYgKGZuLnJlc2V0KSBmbi5yZXNldCgpXG4gICAgbGV0IGZvdW5kUm93ID0gZnJvbVJvd1xuICAgIGZvciAoY29uc3Qgcm93IG9mIHRoaXMudXRpbHMuZ2V0QnVmZmVyUm93cyh0aGlzLmVkaXRvciwge3N0YXJ0Um93OiBmcm9tUm93LCBkaXJlY3Rpb259KSkge1xuICAgICAgaWYgKCFmbihyb3csIGRpcmVjdGlvbikpIGJyZWFrXG4gICAgICBmb3VuZFJvdyA9IHJvd1xuICAgIH1cbiAgICByZXR1cm4gZm91bmRSb3dcbiAgfVxuXG4gIGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIGZuKSB7XG4gICAgY29uc3Qgc3RhcnRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgXCJwcmV2aW91c1wiLCBmbilcbiAgICBjb25zdCBlbmRSb3cgPSB0aGlzLmZpbmRSb3coZnJvbVJvdywgXCJuZXh0XCIsIGZuKVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxuXG4gIGdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93UmVzdWx0ID0gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tUm93KVxuXG4gICAgaWYgKHRoaXMuaXNJbm5lcigpKSB7XG4gICAgICByZXR1cm4gKHJvdywgZGlyZWN0aW9uKSA9PiB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgPT09IGZyb21Sb3dSZXN1bHRcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGlyZWN0aW9uVG9FeHRlbmQgPSBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpID8gXCJwcmV2aW91c1wiIDogXCJuZXh0XCJcblxuICAgICAgbGV0IGZsaXAgPSBmYWxzZVxuICAgICAgY29uc3QgcHJlZGljdCA9IChyb3csIGRpcmVjdGlvbikgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgPT09IGZyb21Sb3dSZXN1bHRcbiAgICAgICAgaWYgKGZsaXApIHtcbiAgICAgICAgICByZXR1cm4gIXJlc3VsdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghcmVzdWx0ICYmIGRpcmVjdGlvbiA9PT0gZGlyZWN0aW9uVG9FeHRlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZmxpcCA9IHRydWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHJlZGljdC5yZXNldCA9ICgpID0+IChmbGlwID0gZmFsc2UpXG4gICAgICByZXR1cm4gcHJlZGljdFxuICAgIH1cbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGxldCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGlmICh0aGlzLmlzTW9kZShcInZpc3VhbFwiLCBcImxpbmV3aXNlXCIpKSB7XG4gICAgICBpZiAoc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSkgZnJvbVJvdy0tXG4gICAgICBlbHNlIGZyb21Sb3crK1xuICAgICAgZnJvbVJvdyA9IHRoaXMuZ2V0VmFsaWRWaW1CdWZmZXJSb3coZnJvbVJvdylcbiAgICB9XG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLmZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHRoaXMuZ2V0UHJlZGljdEZ1bmN0aW9uKGZyb21Sb3csIHNlbGVjdGlvbikpXG4gICAgcmV0dXJuIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkpXG4gIH1cbn1cblBhcmFncmFwaC5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgSW5kZW50YXRpb24gZXh0ZW5kcyBQYXJhZ3JhcGgge1xuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBmcm9tUm93ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGNvbnN0IGJhc2VJbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgY29uc3Qgcm93UmFuZ2UgPSB0aGlzLmZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHJvdyA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5lZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgID8gdGhpcy5pc0EoKVxuICAgICAgICA6IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgPj0gYmFzZUluZGVudExldmVsXG4gICAgfSlcbiAgICByZXR1cm4gdGhpcy5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuICB9XG59XG5JbmRlbnRhdGlvbi5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuLy8gU2VjdGlvbjogQ29tbWVudFxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tbWVudCBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gXCJsaW5ld2lzZVwiXG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCByb3dSYW5nZSA9IHRoaXMudXRpbHMuZ2V0Um93UmFuZ2VGb3JDb21tZW50QXRCdWZmZXJSb3codGhpcy5lZGl0b3IsIHJvdylcbiAgICBpZiAocm93UmFuZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG4gICAgfVxuICB9XG59XG5Db21tZW50LnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBDb21tZW50T3JQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtpbm5lcn0gPSB0aGlzXG4gICAgZm9yIChjb25zdCBrbGFzcyBvZiBbXCJDb21tZW50XCIsIFwiUGFyYWdyYXBoXCJdKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0SW5zdGFuY2Uoa2xhc3MsIHtpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIGlmIChyYW5nZSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5Db21tZW50T3JQYXJhZ3JhcGgucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbi8vIFNlY3Rpb246IEZvbGRcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEZvbGQgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgd2lzZSA9IFwibGluZXdpc2VcIlxuXG4gIGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSB7XG4gICAgaWYgKHRoaXMuaXNBKCkpIHJldHVybiByb3dSYW5nZVxuXG4gICAgbGV0IFtzdGFydFJvdywgZW5kUm93XSA9IHJvd1JhbmdlXG4gICAgaWYgKHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHN0YXJ0Um93KSA9PT0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coZW5kUm93KSkge1xuICAgICAgZW5kUm93IC09IDFcbiAgICB9XG4gICAgc3RhcnRSb3cgKz0gMVxuICAgIHJldHVybiBbc3RhcnRSb3csIGVuZFJvd11cbiAgfVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5nZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyh0aGlzLmVkaXRvciwgcm93KS5yZXZlcnNlKClcbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHtyb3d9ID0gdGhpcy5nZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3Qgc2VsZWN0ZWRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZm9yIChjb25zdCByb3dSYW5nZSBvZiB0aGlzLmdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpKSB7XG4gICAgICBjb25zdCByYW5nZSA9IHRoaXMuZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZSh0aGlzLmFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSlcblxuICAgICAgLy8gRG9uJ3QgY2hhbmdlIHRvIGBpZiByYW5nZS5jb250YWluc1JhbmdlKHNlbGVjdGVkUmFuZ2UsIHRydWUpYFxuICAgICAgLy8gVGhlcmUgaXMgYmVoYXZpb3IgZGlmZiB3aGVuIGN1cnNvciBpcyBhdCBiZWdpbm5pbmcgb2YgbGluZSggY29sdW1uIDAgKS5cbiAgICAgIGlmICghc2VsZWN0ZWRSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKSkgcmV0dXJuIHJhbmdlXG4gICAgfVxuICB9XG59XG5Gb2xkLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBOT1RFOiBGdW5jdGlvbiByYW5nZSBkZXRlcm1pbmF0aW9uIGlzIGRlcGVuZGluZyBvbiBmb2xkLlxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBGb2xkIHtcbiAgLy8gU29tZSBsYW5ndWFnZSBkb24ndCBpbmNsdWRlIGNsb3NpbmcgYH1gIGludG8gZm9sZC5cbiAgc2NvcGVOYW1lc09taXR0aW5nRW5kUm93ID0gW1wic291cmNlLmdvXCIsIFwic291cmNlLmVsaXhpclwiXVxuXG4gIGlzR3JhbW1hck5vdEZvbGRFbmRSb3coKSB7XG4gICAgY29uc3Qge3Njb3BlTmFtZSwgcGFja2FnZU5hbWV9ID0gdGhpcy5lZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgaWYgKHRoaXMuc2NvcGVOYW1lc09taXR0aW5nRW5kUm93LmluY2x1ZGVzKHNjb3BlTmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEhBQ0s6IFJ1c3QgaGF2ZSB0d28gcGFja2FnZSBgbGFuZ3VhZ2UtcnVzdGAgYW5kIGBhdG9tLWxhbmd1YWdlLXJ1c3RgXG4gICAgICAvLyBsYW5ndWFnZS1ydXN0IGRvbid0IGZvbGQgZW5kaW5nIGB9YCwgYnV0IGF0b20tbGFuZ3VhZ2UtcnVzdCBkb2VzLlxuICAgICAgcmV0dXJuIHNjb3BlTmFtZSA9PT0gXCJzb3VyY2UucnVzdFwiICYmIHBhY2thZ2VOYW1lID09PSBcImxhbmd1YWdlLXJ1c3RcIlxuICAgIH1cbiAgfVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpIHtcbiAgICByZXR1cm4gc3VwZXIuZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdykuZmlsdGVyKHJvd1JhbmdlID0+IHtcbiAgICAgIHJldHVybiB0aGlzLnV0aWxzLmlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3codGhpcy5lZGl0b3IsIHJvd1JhbmdlWzBdKVxuICAgIH0pXG4gIH1cblxuICBhZGp1c3RSb3dSYW5nZShyb3dSYW5nZSkge1xuICAgIGxldCBbc3RhcnRSb3csIGVuZFJvd10gPSBzdXBlci5hZGp1c3RSb3dSYW5nZShyb3dSYW5nZSlcbiAgICAvLyBOT1RFOiBUaGlzIGFkanVzdG1lbnQgc2hvdWQgbm90IGJlIG5lY2Vzc2FyeSBpZiBsYW5ndWFnZS1zeW50YXggaXMgcHJvcGVybHkgZGVmaW5lZC5cbiAgICBpZiAodGhpcy5pc0EoKSAmJiB0aGlzLmlzR3JhbW1hck5vdEZvbGRFbmRSb3coKSkgZW5kUm93ICs9IDFcbiAgICByZXR1cm4gW3N0YXJ0Um93LCBlbmRSb3ddXG4gIH1cbn1cbkZ1bmN0aW9uLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBTZWN0aW9uOiBPdGhlclxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQXJndW1lbnRzIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIG5ld0FyZ0luZm8oYXJnU3RhcnQsIGFyZywgc2VwYXJhdG9yKSB7XG4gICAgY29uc3QgYXJnRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIGFyZylcbiAgICBjb25zdCBhcmdSYW5nZSA9IG5ldyBSYW5nZShhcmdTdGFydCwgYXJnRW5kKVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yRW5kID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgIT0gbnVsbCA/IHNlcGFyYXRvciA6IFwiXCIpXG4gICAgY29uc3Qgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBjb25zdCBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBjb25zdCBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICByZXR1cm4ge2FyZ1JhbmdlLCBzZXBhcmF0b3JSYW5nZSwgaW5uZXJSYW5nZSwgYVJhbmdlfVxuICB9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIG1lbWJlcjogW1wiQ3VybHlCcmFja2V0XCIsIFwiU3F1YXJlQnJhY2tldFwiLCBcIlBhcmVudGhlc2lzXCJdLFxuICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckFueVBhaXJcIiwgb3B0aW9ucykuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICB9XG5cbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgbGV0IHJhbmdlID0gdGhpcy5nZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgY29uc3QgcGFpclJhbmdlRm91bmQgPSByYW5nZSAhPSBudWxsXG5cbiAgICByYW5nZSA9IHJhbmdlIHx8IHRoaXMuZ2V0SW5zdGFuY2UoXCJJbm5lckN1cnJlbnRMaW5lXCIpLmdldFJhbmdlKHNlbGVjdGlvbikgLy8gZmFsbGJhY2tcbiAgICBpZiAoIXJhbmdlKSByZXR1cm5cblxuICAgIHJhbmdlID0gdGhpcy51dGlscy50cmltUmFuZ2UodGhpcy5lZGl0b3IsIHJhbmdlKVxuXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGNvbnN0IGFsbFRva2VucyA9IHRoaXMudXRpbHMuc3BsaXRBcmd1bWVudHModGV4dCwgcGFpclJhbmdlRm91bmQpXG5cbiAgICBjb25zdCBhcmdJbmZvcyA9IFtdXG4gICAgbGV0IGFyZ1N0YXJ0ID0gcmFuZ2Uuc3RhcnRcblxuICAgIC8vIFNraXAgc3RhcnRpbmcgc2VwYXJhdG9yXG4gICAgaWYgKGFsbFRva2Vucy5sZW5ndGggJiYgYWxsVG9rZW5zWzBdLnR5cGUgPT09IFwic2VwYXJhdG9yXCIpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGFyZ1N0YXJ0ID0gdGhpcy51dGlscy50cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIHRva2VuLnRleHQpXG4gICAgfVxuXG4gICAgd2hpbGUgKGFsbFRva2Vucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSBcImFyZ3VtZW50XCIpIHtcbiAgICAgICAgY29uc3QgbmV4dFRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gbmV4dFRva2VuID8gbmV4dFRva2VuLnRleHQgOiB1bmRlZmluZWRcbiAgICAgICAgY29uc3QgYXJnSW5mbyA9IHRoaXMubmV3QXJnSW5mbyhhcmdTdGFydCwgdG9rZW4udGV4dCwgc2VwYXJhdG9yKVxuXG4gICAgICAgIGlmIChhbGxUb2tlbnMubGVuZ3RoID09PSAwICYmIGFyZ0luZm9zLmxlbmd0aCkge1xuICAgICAgICAgIGFyZ0luZm8uYVJhbmdlID0gYXJnSW5mby5hcmdSYW5nZS51bmlvbihfLmxhc3QoYXJnSW5mb3MpLnNlcGFyYXRvclJhbmdlKVxuICAgICAgICB9XG5cbiAgICAgICAgYXJnU3RhcnQgPSBhcmdJbmZvLmFSYW5nZS5lbmRcbiAgICAgICAgYXJnSW5mb3MucHVzaChhcmdJbmZvKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibXVzdCBub3QgaGFwcGVuXCIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBmb3IgKGNvbnN0IHtpbm5lclJhbmdlLCBhUmFuZ2V9IG9mIGFyZ0luZm9zKSB7XG4gICAgICBpZiAoaW5uZXJSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzSW5uZXIoKSA/IGlubmVyUmFuZ2UgOiBhUmFuZ2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbkFyZ3VtZW50cy5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0IHtcbiAgZ2V0UmFuZ2Uoc2VsZWN0aW9uKSB7XG4gICAgY29uc3Qge3Jvd30gPSB0aGlzLmdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBjb25zdCByYW5nZSA9IHRoaXMuZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgICByZXR1cm4gdGhpcy5pc0EoKSA/IHJhbmdlIDogdGhpcy51dGlscy50cmltUmFuZ2UodGhpcy5lZGl0b3IsIHJhbmdlKVxuICB9XG59XG5DdXJyZW50TGluZS5yZWdpc3RlcihmYWxzZSwgdHJ1ZSlcblxuY2xhc3MgRW50aXJlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBcImxpbmV3aXNlXCJcbiAgc2VsZWN0T25jZSA9IHRydWVcblxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcbiAgfVxufVxuRW50aXJlLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxufVxuRW1wdHkucmVnaXN0ZXIoZmFsc2UpXG5cbmNsYXNzIExhdGVzdENoYW5nZSBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuICBnZXRSYW5nZShzZWxlY3Rpb24pIHtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMudmltU3RhdGUubWFyay5nZXQoXCJbXCIpXG4gICAgY29uc3QgZW5kID0gdGhpcy52aW1TdGF0ZS5tYXJrLmdldChcIl1cIilcbiAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gICAgfVxuICB9XG59XG5MYXRlc3RDaGFuZ2UucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG5cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3Qge1xuICBiYWNrd2FyZCA9IGZhbHNlXG5cbiAgZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybikge1xuICAgIGlmICh0aGlzLm1vZGUgPT09IFwidmlzdWFsXCIpIHtcbiAgICAgIGZyb21Qb2ludCA9IHRoaXMudXRpbHMudHJhbnNsYXRlUG9pbnRBbmRDbGlwKHRoaXMuZWRpdG9yLCBmcm9tUG9pbnQsIFwiZm9yd2FyZFwiKVxuICAgIH1cbiAgICBsZXQgZm91bmRSYW5nZVxuICAgIHRoaXMuc2NhbkZvcndhcmQocGF0dGVybiwge2Zyb206IFtmcm9tUG9pbnQucm93LCAwXX0sICh7cmFuZ2UsIHN0b3B9KSA9PiB7XG4gICAgICBpZiAocmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KSkge1xuICAgICAgICBmb3VuZFJhbmdlID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4ge3JhbmdlOiBmb3VuZFJhbmdlLCB3aGljaElzSGVhZDogXCJlbmRcIn1cbiAgfVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmdsb2JhbFN0YXRlLmdldChcImxhc3RTZWFyY2hQYXR0ZXJuXCIpXG4gICAgaWYgKCFwYXR0ZXJuKSByZXR1cm5cblxuICAgIGNvbnN0IGZyb21Qb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGNvbnN0IHtyYW5nZSwgd2hpY2hJc0hlYWR9ID0gdGhpcy5maW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKVxuICAgIGlmIChyYW5nZSkge1xuICAgICAgcmV0dXJuIHRoaXMudW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpXG4gICAgfVxuICB9XG5cbiAgdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpIHtcbiAgICBpZiAoc2VsZWN0aW9uLmlzRW1wdHkoKSkgcmV0dXJuIHJhbmdlXG5cbiAgICBsZXQgaGVhZCA9IHJhbmdlW3doaWNoSXNIZWFkXVxuICAgIGNvbnN0IHRhaWwgPSBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIGlmICh0aGlzLmJhY2t3YXJkKSB7XG4gICAgICBpZiAodGFpbC5pc0xlc3NUaGFuKGhlYWQpKSBoZWFkID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsIFwiZm9yd2FyZFwiKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGVhZC5pc0xlc3NUaGFuKHRhaWwpKSBoZWFkID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGhlYWQsIFwiYmFja3dhcmRcIilcbiAgICB9XG5cbiAgICB0aGlzLnJldmVyc2VkID0gaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgcmV0dXJuIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbih0aGlzLnN3cmFwKHNlbGVjdGlvbikuZ2V0VGFpbEJ1ZmZlclJhbmdlKCkpXG4gIH1cblxuICBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikge1xuICAgIGNvbnN0IHJhbmdlID0gdGhpcy5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgaWYgKHJhbmdlKSB7XG4gICAgICB0aGlzLnN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZDogdGhpcy5yZXZlcnNlZCAhPSBudWxsID8gdGhpcy5yZXZlcnNlZCA6IHRoaXMuYmFja3dhcmR9KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblNlYXJjaE1hdGNoRm9yd2FyZC5yZWdpc3RlcigpXG5cbmNsYXNzIFNlYXJjaE1hdGNoQmFja3dhcmQgZXh0ZW5kcyBTZWFyY2hNYXRjaEZvcndhcmQge1xuICBiYWNrd2FyZCA9IHRydWVcblxuICBmaW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJ2aXN1YWxcIikge1xuICAgICAgZnJvbVBvaW50ID0gdGhpcy51dGlscy50cmFuc2xhdGVQb2ludEFuZENsaXAodGhpcy5lZGl0b3IsIGZyb21Qb2ludCwgXCJiYWNrd2FyZFwiKVxuICAgIH1cbiAgICBsZXQgZm91bmRSYW5nZVxuICAgIHRoaXMuc2NhbkJhY2t3YXJkKHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgSW5maW5pdHldfSwgKHtyYW5nZSwgc3RvcH0pID0+IHtcbiAgICAgIGlmIChyYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludCkpIHtcbiAgICAgICAgZm91bmRSYW5nZSA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIHtyYW5nZTogZm91bmRSYW5nZSwgd2hpY2hJc0hlYWQ6IFwic3RhcnRcIn1cbiAgfVxufVxuU2VhcmNoTWF0Y2hCYWNrd2FyZC5yZWdpc3RlcigpXG5cbi8vIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4vLyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3Rcbi8vIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBjb25zdCB7cHJvcGVydGllcywgc3VibW9kZX0gPSB0aGlzLnZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgKHByb3BlcnRpZXMgJiYgc3VibW9kZSkge1xuICAgICAgdGhpcy53aXNlID0gc3VibW9kZVxuICAgICAgdGhpcy5zd3JhcCh0aGlzLmVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKCkpLnNlbGVjdEJ5UHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblByZXZpb3VzU2VsZWN0aW9uLnJlZ2lzdGVyKClcblxuY2xhc3MgUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3Qge1xuICB3aXNlID0gbnVsbFxuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmltU3RhdGUuaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKSkge1xuICAgICAgdGhpcy5wZXJzaXN0ZW50U2VsZWN0aW9uLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2VzKClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG59XG5QZXJzaXN0ZW50U2VsZWN0aW9uLnJlZ2lzdGVyKGZhbHNlLCB0cnVlKVxuXG4vLyBVc2VkIG9ubHkgYnkgUmVwbGFjZVdpdGhSZWdpc3RlciBhbmQgUHV0QmVmb3JlIGFuZCBpdHMnIGNoaWxkcmVuLlxuY2xhc3MgTGFzdFBhc3RlZFJhbmdlIGV4dGVuZHMgVGV4dE9iamVjdCB7XG4gIHdpc2UgPSBudWxsXG4gIHNlbGVjdE9uY2UgPSB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pIHtcbiAgICBmb3IgKHNlbGVjdGlvbiBvZiB0aGlzLmVkaXRvci5nZXRTZWxlY3Rpb25zKCkpIHtcbiAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy52aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLmdldFBhc3RlZFJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuTGFzdFBhc3RlZFJhbmdlLnJlZ2lzdGVyKGZhbHNlKVxuXG5jbGFzcyBWaXNpYmxlQXJlYSBleHRlbmRzIFRleHRPYmplY3Qge1xuICBzZWxlY3RPbmNlID0gdHJ1ZVxuXG4gIGdldFJhbmdlKHNlbGVjdGlvbikge1xuICAgIC8vIFtCVUc/XSBOZWVkIHRyYW5zbGF0ZSB0byBzaGlsbmsgdG9wIGFuZCBib3R0b20gdG8gZml0IGFjdHVhbCByb3cuXG4gICAgLy8gVGhlIHJlYXNvbiBJIG5lZWQgLTIgYXQgYm90dG9tIGlzIGJlY2F1c2Ugb2Ygc3RhdHVzIGJhcj9cbiAgICBjb25zdCByYW5nZSA9IHRoaXMudXRpbHMuZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKHRoaXMuZWRpdG9yKVxuICAgIHJldHVybiByYW5nZS5nZXRSb3dzKCkgPiB0aGlzLmVkaXRvci5nZXRSb3dzUGVyUGFnZSgpID8gcmFuZ2UudHJhbnNsYXRlKFsrMSwgMF0sIFstMywgMF0pIDogcmFuZ2VcbiAgfVxufVxuVmlzaWJsZUFyZWEucmVnaXN0ZXIoZmFsc2UsIHRydWUpXG4iXX0=