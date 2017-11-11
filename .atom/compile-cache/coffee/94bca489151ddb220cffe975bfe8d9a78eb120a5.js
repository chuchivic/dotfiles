(function() {
  var AnyBracket, BracketMatchingMotion, CloseBrackets, Input, MotionWithInput, OpenBrackets, Point, Range, RepeatSearch, Search, SearchBase, SearchCurrentWord, SearchViewModel, _, ref, settings,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  MotionWithInput = require('./general-motions').MotionWithInput;

  SearchViewModel = require('../view-models/search-view-model');

  Input = require('../view-models/view-model').Input;

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  settings = require('../settings');

  SearchBase = (function(superClass) {
    extend(SearchBase, superClass);

    function SearchBase(editor, vimState, options) {
      this.editor = editor;
      this.vimState = vimState;
      if (options == null) {
        options = {};
      }
      this.reversed = bind(this.reversed, this);
      SearchBase.__super__.constructor.call(this, this.editor, this.vimState);
      this.reverse = this.initiallyReversed = false;
      if (!options.dontUpdateCurrentSearch) {
        this.updateCurrentSearch();
      }
    }

    SearchBase.prototype.reversed = function() {
      this.initiallyReversed = this.reverse = true;
      this.updateCurrentSearch();
      return this;
    };

    SearchBase.prototype.moveCursor = function(cursor, count) {
      var range, ranges;
      if (count == null) {
        count = 1;
      }
      ranges = this.scan(cursor);
      if (ranges.length > 0) {
        range = ranges[(count - 1) % ranges.length];
        return cursor.setBufferPosition(range.start);
      } else {
        return atom.beep();
      }
    };

    SearchBase.prototype.scan = function(cursor) {
      var currentPosition, rangesAfter, rangesBefore, ref1;
      if (this.input.characters === "") {
        return [];
      }
      currentPosition = cursor.getBufferPosition();
      ref1 = [[], []], rangesBefore = ref1[0], rangesAfter = ref1[1];
      this.editor.scan(this.getSearchTerm(this.input.characters), (function(_this) {
        return function(arg) {
          var isBefore, range;
          range = arg.range;
          isBefore = _this.reverse ? range.start.compare(currentPosition) < 0 : range.start.compare(currentPosition) <= 0;
          if (isBefore) {
            return rangesBefore.push(range);
          } else {
            return rangesAfter.push(range);
          }
        };
      })(this));
      if (this.reverse) {
        return rangesAfter.concat(rangesBefore).reverse();
      } else {
        return rangesAfter.concat(rangesBefore);
      }
    };

    SearchBase.prototype.getSearchTerm = function(term) {
      var modFlags, modifiers;
      modifiers = {
        'g': true
      };
      if (!term.match('[A-Z]') && settings.useSmartcaseForSearch()) {
        modifiers['i'] = true;
      }
      if (term.indexOf('\\c') >= 0) {
        term = term.replace('\\c', '');
        modifiers['i'] = true;
      }
      modFlags = Object.keys(modifiers).join('');
      try {
        return new RegExp(term, modFlags);
      } catch (error) {
        return new RegExp(_.escapeRegExp(term), modFlags);
      }
    };

    SearchBase.prototype.updateCurrentSearch = function() {
      this.vimState.globalVimState.currentSearch.reverse = this.reverse;
      return this.vimState.globalVimState.currentSearch.initiallyReversed = this.initiallyReversed;
    };

    SearchBase.prototype.replicateCurrentSearch = function() {
      this.reverse = this.vimState.globalVimState.currentSearch.reverse;
      return this.initiallyReversed = this.vimState.globalVimState.currentSearch.initiallyReversed;
    };

    return SearchBase;

  })(MotionWithInput);

  Search = (function(superClass) {
    extend(Search, superClass);

    function Search(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.reversed = bind(this.reversed, this);
      Search.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new SearchViewModel(this);
      this.updateViewModel();
    }

    Search.prototype.reversed = function() {
      this.initiallyReversed = this.reverse = true;
      this.updateCurrentSearch();
      this.updateViewModel();
      return this;
    };

    Search.prototype.updateViewModel = function() {
      return this.viewModel.update(this.initiallyReversed);
    };

    return Search;

  })(SearchBase);

  SearchCurrentWord = (function(superClass) {
    extend(SearchCurrentWord, superClass);

    SearchCurrentWord.keywordRegex = null;

    function SearchCurrentWord(editor, vimState) {
      var defaultIsKeyword, searchString, userIsKeyword;
      this.editor = editor;
      this.vimState = vimState;
      SearchCurrentWord.__super__.constructor.call(this, this.editor, this.vimState);
      defaultIsKeyword = "[@a-zA-Z0-9_\-]+";
      userIsKeyword = atom.config.get('vim-mode.iskeyword');
      this.keywordRegex = new RegExp(userIsKeyword || defaultIsKeyword);
      searchString = this.getCurrentWordMatch();
      this.input = new Input(searchString);
      if (searchString !== this.vimState.getSearchHistoryItem()) {
        this.vimState.pushSearchHistory(searchString);
      }
    }

    SearchCurrentWord.prototype.getCurrentWord = function() {
      var cursor, cursorPosition, wordEnd, wordStart;
      cursor = this.editor.getLastCursor();
      wordStart = cursor.getBeginningOfCurrentWordBufferPosition({
        wordRegex: this.keywordRegex,
        allowPrevious: false
      });
      wordEnd = cursor.getEndOfCurrentWordBufferPosition({
        wordRegex: this.keywordRegex,
        allowNext: false
      });
      cursorPosition = cursor.getBufferPosition();
      if (wordEnd.column === cursorPosition.column) {
        wordEnd = cursor.getEndOfCurrentWordBufferPosition({
          wordRegex: this.keywordRegex,
          allowNext: true
        });
        if (wordEnd.row !== cursorPosition.row) {
          return "";
        }
        cursor.setBufferPosition(wordEnd);
        wordStart = cursor.getBeginningOfCurrentWordBufferPosition({
          wordRegex: this.keywordRegex,
          allowPrevious: false
        });
      }
      cursor.setBufferPosition(wordStart);
      return this.editor.getTextInBufferRange([wordStart, wordEnd]);
    };

    SearchCurrentWord.prototype.cursorIsOnEOF = function(cursor) {
      var eofPos, pos;
      pos = cursor.getNextWordBoundaryBufferPosition({
        wordRegex: this.keywordRegex
      });
      eofPos = this.editor.getEofBufferPosition();
      return pos.row === eofPos.row && pos.column === eofPos.column;
    };

    SearchCurrentWord.prototype.getCurrentWordMatch = function() {
      var characters;
      characters = this.getCurrentWord();
      if (characters.length > 0) {
        if (/\W/.test(characters)) {
          return characters + "\\b";
        } else {
          return "\\b" + characters + "\\b";
        }
      } else {
        return characters;
      }
    };

    SearchCurrentWord.prototype.isComplete = function() {
      return true;
    };

    SearchCurrentWord.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      if (this.input.characters.length > 0) {
        return SearchCurrentWord.__super__.execute.call(this, count);
      }
    };

    return SearchCurrentWord;

  })(SearchBase);

  OpenBrackets = ['(', '{', '['];

  CloseBrackets = [')', '}', ']'];

  AnyBracket = new RegExp(OpenBrackets.concat(CloseBrackets).map(_.escapeRegExp).join("|"));

  BracketMatchingMotion = (function(superClass) {
    extend(BracketMatchingMotion, superClass);

    function BracketMatchingMotion() {
      return BracketMatchingMotion.__super__.constructor.apply(this, arguments);
    }

    BracketMatchingMotion.prototype.operatesInclusively = true;

    BracketMatchingMotion.prototype.isComplete = function() {
      return true;
    };

    BracketMatchingMotion.prototype.searchForMatch = function(startPosition, reverse, inCharacter, outCharacter) {
      var character, depth, eofPosition, increment, lineLength, point;
      depth = 0;
      point = startPosition.copy();
      lineLength = this.editor.lineTextForBufferRow(point.row).length;
      eofPosition = this.editor.getEofBufferPosition().translate([0, 1]);
      increment = reverse ? -1 : 1;
      while (true) {
        character = this.characterAt(point);
        if (character === inCharacter) {
          depth++;
        }
        if (character === outCharacter) {
          depth--;
        }
        if (depth === 0) {
          return point;
        }
        point.column += increment;
        if (depth < 0) {
          return null;
        }
        if (point.isEqual([0, -1])) {
          return null;
        }
        if (point.isEqual(eofPosition)) {
          return null;
        }
        if (point.column < 0) {
          point.row--;
          lineLength = this.editor.lineTextForBufferRow(point.row).length;
          point.column = lineLength - 1;
        } else if (point.column >= lineLength) {
          point.row++;
          lineLength = this.editor.lineTextForBufferRow(point.row).length;
          point.column = 0;
        }
      }
    };

    BracketMatchingMotion.prototype.characterAt = function(position) {
      return this.editor.getTextInBufferRange([position, position.translate([0, 1])]);
    };

    BracketMatchingMotion.prototype.getSearchData = function(position) {
      var character, index;
      character = this.characterAt(position);
      if ((index = OpenBrackets.indexOf(character)) >= 0) {
        return [character, CloseBrackets[index], false];
      } else if ((index = CloseBrackets.indexOf(character)) >= 0) {
        return [character, OpenBrackets[index], true];
      } else {
        return [];
      }
    };

    BracketMatchingMotion.prototype.moveCursor = function(cursor) {
      var inCharacter, matchPosition, outCharacter, ref1, ref2, restOfLine, reverse, startPosition;
      startPosition = cursor.getBufferPosition();
      ref1 = this.getSearchData(startPosition), inCharacter = ref1[0], outCharacter = ref1[1], reverse = ref1[2];
      if (inCharacter == null) {
        restOfLine = [startPosition, [startPosition.row, 2e308]];
        this.editor.scanInBufferRange(AnyBracket, restOfLine, function(arg) {
          var range, stop;
          range = arg.range, stop = arg.stop;
          startPosition = range.start;
          return stop();
        });
      }
      ref2 = this.getSearchData(startPosition), inCharacter = ref2[0], outCharacter = ref2[1], reverse = ref2[2];
      if (inCharacter == null) {
        return;
      }
      if (matchPosition = this.searchForMatch(startPosition, reverse, inCharacter, outCharacter)) {
        return cursor.setBufferPosition(matchPosition);
      }
    };

    return BracketMatchingMotion;

  })(SearchBase);

  RepeatSearch = (function(superClass) {
    extend(RepeatSearch, superClass);

    function RepeatSearch(editor, vimState) {
      var ref1;
      this.editor = editor;
      this.vimState = vimState;
      RepeatSearch.__super__.constructor.call(this, this.editor, this.vimState, {
        dontUpdateCurrentSearch: true
      });
      this.input = new Input((ref1 = this.vimState.getSearchHistoryItem(0)) != null ? ref1 : "");
      this.replicateCurrentSearch();
    }

    RepeatSearch.prototype.isComplete = function() {
      return true;
    };

    RepeatSearch.prototype.reversed = function() {
      this.reverse = !this.initiallyReversed;
      return this;
    };

    return RepeatSearch;

  })(SearchBase);

  module.exports = {
    Search: Search,
    SearchCurrentWord: SearchCurrentWord,
    BracketMatchingMotion: BracketMatchingMotion,
    RepeatSearch: RepeatSearch
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL21vdGlvbnMvc2VhcmNoLW1vdGlvbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRMQUFBO0lBQUE7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNILGtCQUFtQixPQUFBLENBQVEsbUJBQVI7O0VBQ3BCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLGtDQUFSOztFQUNqQixRQUFTLE9BQUEsQ0FBUSwyQkFBUjs7RUFDVixNQUFpQixPQUFBLENBQVEsTUFBUixDQUFqQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVMOzs7SUFDUyxvQkFBQyxNQUFELEVBQVUsUUFBVixFQUFxQixPQUFyQjtNQUFDLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFdBQUQ7O1FBQVcsVUFBVTs7O01BQzFDLDRDQUFNLElBQUMsQ0FBQSxNQUFQLEVBQWUsSUFBQyxDQUFBLFFBQWhCO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsaUJBQUQsR0FBcUI7TUFDaEMsSUFBQSxDQUE4QixPQUFPLENBQUMsdUJBQXRDO1FBQUEsSUFBQyxDQUFBLG1CQUFELENBQUEsRUFBQTs7SUFIVzs7eUJBS2IsUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsaUJBQUQsR0FBcUIsSUFBQyxDQUFBLE9BQUQsR0FBVztNQUNoQyxJQUFDLENBQUEsbUJBQUQsQ0FBQTthQUNBO0lBSFE7O3lCQUtWLFVBQUEsR0FBWSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ1YsVUFBQTs7UUFEbUIsUUFBTTs7TUFDekIsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFELENBQU0sTUFBTjtNQUNULElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7UUFDRSxLQUFBLEdBQVEs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QU87VUFDekQsYUFBQSxHQUFnQixLQUFLLENBQUM7aUJBQ3RCLElBQUEsQ0FBQTtRQUZnRCxDQUFsRCxFQUZGOztNQU1BLE9BQXVDLElBQUMsQ0FBQSxhQUFELENBQWUsYUFBZixDQUF2QyxFQUFDLHFCQUFELEVBQWMsc0JBQWQsRUFBNEI7TUFFNUIsSUFBYyxtQkFBZDtBQUFBLGVBQUE7O01BRUEsSUFBRyxhQUFBLEdBQWdCLElBQUMsQ0FBQSxjQUFELENBQWdCLGFBQWhCLEVBQStCLE9BQS9CLEVBQXdDLFdBQXhDLEVBQXFELFlBQXJELENBQW5CO2VBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLGFBQXpCLEVBREY7O0lBZlU7Ozs7S0E5Q3NCOztFQWdFOUI7OztJQUNTLHNCQUFDLE1BQUQsRUFBVSxRQUFWO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLFdBQUQ7TUFDckIsOENBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxJQUFDLENBQUEsUUFBaEIsRUFBMEI7UUFBQSx1QkFBQSxFQUF5QixJQUF6QjtPQUExQjtNQUNBLElBQUMsQ0FBQSxLQUFELEdBQWEsSUFBQSxLQUFBLGlFQUEwQyxFQUExQztNQUNiLElBQUMsQ0FBQSxzQkFBRCxDQUFBO0lBSFc7OzJCQUtiLFVBQUEsR0FBWSxTQUFBO2FBQUc7SUFBSDs7MkJBRVosUUFBQSxHQUFVLFNBQUE7TUFDUixJQUFDLENBQUEsT0FBRCxHQUFXLENBQUksSUFBQyxDQUFBO2FBQ2hCO0lBRlE7Ozs7S0FSZTs7RUFhM0IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxRQUFBLE1BQUQ7SUFBUyxtQkFBQSxpQkFBVDtJQUE0Qix1QkFBQSxxQkFBNUI7SUFBbUQsY0FBQSxZQUFuRDs7QUEzTmpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntNb3Rpb25XaXRoSW5wdXR9ID0gcmVxdWlyZSAnLi9nZW5lcmFsLW1vdGlvbnMnXG5TZWFyY2hWaWV3TW9kZWwgPSByZXF1aXJlICcuLi92aWV3LW1vZGVscy9zZWFyY2gtdmlldy1tb2RlbCdcbntJbnB1dH0gPSByZXF1aXJlICcuLi92aWV3LW1vZGVscy92aWV3LW1vZGVsJ1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9zZXR0aW5ncydcblxuY2xhc3MgU2VhcmNoQmFzZSBleHRlbmRzIE1vdGlvbldpdGhJbnB1dFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIHN1cGVyKEBlZGl0b3IsIEB2aW1TdGF0ZSlcbiAgICBAcmV2ZXJzZSA9IEBpbml0aWFsbHlSZXZlcnNlZCA9IGZhbHNlXG4gICAgQHVwZGF0ZUN1cnJlbnRTZWFyY2goKSB1bmxlc3Mgb3B0aW9ucy5kb250VXBkYXRlQ3VycmVudFNlYXJjaFxuXG4gIHJldmVyc2VkOiA9PlxuICAgIEBpbml0aWFsbHlSZXZlcnNlZCA9IEByZXZlcnNlID0gdHJ1ZVxuICAgIEB1cGRhdGVDdXJyZW50U2VhcmNoKClcbiAgICB0aGlzXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvciwgY291bnQ9MSkgLT5cbiAgICByYW5nZXMgPSBAc2NhbihjdXJzb3IpXG4gICAgaWYgcmFuZ2VzLmxlbmd0aCA+IDBcbiAgICAgIHJhbmdlID0gcmFuZ2VzWyhjb3VudCAtIDEpICUgcmFuZ2VzLmxlbmd0aF1cbiAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihyYW5nZS5zdGFydClcbiAgICBlbHNlXG4gICAgICBhdG9tLmJlZXAoKVxuXG4gIHNjYW46IChjdXJzb3IpIC0+XG4gICAgcmV0dXJuIFtdIGlmIEBpbnB1dC5jaGFyYWN0ZXJzIGlzIFwiXCJcblxuICAgIGN1cnJlbnRQb3NpdGlvbiA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG5cbiAgICBbcmFuZ2VzQmVmb3JlLCByYW5nZXNBZnRlcl0gPSBbW10sIFtdXVxuICAgIEBlZGl0b3Iuc2NhbiBAZ2V0U2VhcmNoVGVybShAaW5wdXQuY2hhcmFjdGVycyksICh7cmFuZ2V9KSA9PlxuICAgICAgaXNCZWZvcmUgPSBpZiBAcmV2ZXJzZVxuICAgICAgICByYW5nZS5zdGFydC5jb21wYXJlKGN1cnJlbnRQb3NpdGlvbikgPCAwXG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlLnN0YXJ0LmNvbXBhcmUoY3VycmVudFBvc2l0aW9uKSA8PSAwXG5cbiAgICAgIGlmIGlzQmVmb3JlXG4gICAgICAgIHJhbmdlc0JlZm9yZS5wdXNoKHJhbmdlKVxuICAgICAgZWxzZVxuICAgICAgICByYW5nZXNBZnRlci5wdXNoKHJhbmdlKVxuXG4gICAgaWYgQHJldmVyc2VcbiAgICAgIHJhbmdlc0FmdGVyLmNvbmNhdChyYW5nZXNCZWZvcmUpLnJldmVyc2UoKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlc0FmdGVyLmNvbmNhdChyYW5nZXNCZWZvcmUpXG5cbiAgZ2V0U2VhcmNoVGVybTogKHRlcm0pIC0+XG4gICAgbW9kaWZpZXJzID0geydnJzogdHJ1ZX1cblxuICAgIGlmIG5vdCB0ZXJtLm1hdGNoKCdbQS1aXScpIGFuZCBzZXR0aW5ncy51c2VTbWFydGNhc2VGb3JTZWFyY2goKVxuICAgICAgbW9kaWZpZXJzWydpJ10gPSB0cnVlXG5cbiAgICBpZiB0ZXJtLmluZGV4T2YoJ1xcXFxjJykgPj0gMFxuICAgICAgdGVybSA9IHRlcm0ucmVwbGFjZSgnXFxcXGMnLCAnJylcbiAgICAgIG1vZGlmaWVyc1snaSddID0gdHJ1ZVxuXG4gICAgbW9kRmxhZ3MgPSBPYmplY3Qua2V5cyhtb2RpZmllcnMpLmpvaW4oJycpXG5cbiAgICB0cnlcbiAgICAgIG5ldyBSZWdFeHAodGVybSwgbW9kRmxhZ3MpXG4gICAgY2F0Y2hcbiAgICAgIG5ldyBSZWdFeHAoXy5lc2NhcGVSZWdFeHAodGVybSksIG1vZEZsYWdzKVxuXG4gIHVwZGF0ZUN1cnJlbnRTZWFyY2g6IC0+XG4gICAgQHZpbVN0YXRlLmdsb2JhbFZpbVN0YXRlLmN1cnJlbnRTZWFyY2gucmV2ZXJzZSA9IEByZXZlcnNlXG4gICAgQHZpbVN0YXRlLmdsb2JhbFZpbVN0YXRlLmN1cnJlbnRTZWFyY2guaW5pdGlhbGx5UmV2ZXJzZWQgPSBAaW5pdGlhbGx5UmV2ZXJzZWRcblxuICByZXBsaWNhdGVDdXJyZW50U2VhcmNoOiAtPlxuICAgIEByZXZlcnNlID0gQHZpbVN0YXRlLmdsb2JhbFZpbVN0YXRlLmN1cnJlbnRTZWFyY2gucmV2ZXJzZVxuICAgIEBpbml0aWFsbHlSZXZlcnNlZCA9IEB2aW1TdGF0ZS5nbG9iYWxWaW1TdGF0ZS5jdXJyZW50U2VhcmNoLmluaXRpYWxseVJldmVyc2VkXG5cbmNsYXNzIFNlYXJjaCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAdmltU3RhdGUpIC0+XG4gICAgc3VwZXIoQGVkaXRvciwgQHZpbVN0YXRlKVxuICAgIEB2aWV3TW9kZWwgPSBuZXcgU2VhcmNoVmlld01vZGVsKHRoaXMpXG4gICAgQHVwZGF0ZVZpZXdNb2RlbCgpXG5cbiAgcmV2ZXJzZWQ6ID0+XG4gICAgQGluaXRpYWxseVJldmVyc2VkID0gQHJldmVyc2UgPSB0cnVlXG4gICAgQHVwZGF0ZUN1cnJlbnRTZWFyY2goKVxuICAgIEB1cGRhdGVWaWV3TW9kZWwoKVxuICAgIHRoaXNcblxuICB1cGRhdGVWaWV3TW9kZWw6IC0+XG4gICAgQHZpZXdNb2RlbC51cGRhdGUoQGluaXRpYWxseVJldmVyc2VkKVxuXG5jbGFzcyBTZWFyY2hDdXJyZW50V29yZCBleHRlbmRzIFNlYXJjaEJhc2VcbiAgQGtleXdvcmRSZWdleDogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIHN1cGVyKEBlZGl0b3IsIEB2aW1TdGF0ZSlcblxuICAgICMgRklYTUU6IFRoaXMgbXVzdCBkZXBlbmQgb24gdGhlIGN1cnJlbnQgbGFuZ3VhZ2VcbiAgICBkZWZhdWx0SXNLZXl3b3JkID0gXCJbQGEtekEtWjAtOV9cXC1dK1wiXG4gICAgdXNlcklzS2V5d29yZCA9IGF0b20uY29uZmlnLmdldCgndmltLW1vZGUuaXNrZXl3b3JkJylcbiAgICBAa2V5d29yZFJlZ2V4ID0gbmV3IFJlZ0V4cCh1c2VySXNLZXl3b3JkIG9yIGRlZmF1bHRJc0tleXdvcmQpXG5cbiAgICBzZWFyY2hTdHJpbmcgPSBAZ2V0Q3VycmVudFdvcmRNYXRjaCgpXG4gICAgQGlucHV0ID0gbmV3IElucHV0KHNlYXJjaFN0cmluZylcbiAgICBAdmltU3RhdGUucHVzaFNlYXJjaEhpc3Rvcnkoc2VhcmNoU3RyaW5nKSB1bmxlc3Mgc2VhcmNoU3RyaW5nIGlzIEB2aW1TdGF0ZS5nZXRTZWFyY2hIaXN0b3J5SXRlbSgpXG5cbiAgZ2V0Q3VycmVudFdvcmQ6IC0+XG4gICAgY3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB3b3JkU3RhcnQgPSBjdXJzb3IuZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKHdvcmRSZWdleDogQGtleXdvcmRSZWdleCwgYWxsb3dQcmV2aW91czogZmFsc2UpXG4gICAgd29yZEVuZCAgID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbiAgICAgICh3b3JkUmVnZXg6IEBrZXl3b3JkUmVnZXgsIGFsbG93TmV4dDogZmFsc2UpXG4gICAgY3Vyc29yUG9zaXRpb24gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgd29yZEVuZC5jb2x1bW4gaXMgY3Vyc29yUG9zaXRpb24uY29sdW1uXG4gICAgICAjIGVpdGhlciB3ZSBkb24ndCBoYXZlIGEgY3VycmVudCB3b3JkLCBvciBpdCBlbmRzIG9uIGN1cnNvciwgaS5lLiBwcmVjZWRlcyBpdCwgc28gbG9vayBmb3IgdGhlIG5leHQgb25lXG4gICAgICB3b3JkRW5kID0gY3Vyc29yLmdldEVuZE9mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbiAgICAgICh3b3JkUmVnZXg6IEBrZXl3b3JkUmVnZXgsIGFsbG93TmV4dDogdHJ1ZSlcbiAgICAgIHJldHVybiBcIlwiIGlmIHdvcmRFbmQucm93IGlzbnQgY3Vyc29yUG9zaXRpb24ucm93ICMgZG9uJ3QgbG9vayBiZXlvbmQgdGhlIGN1cnJlbnQgbGluZVxuXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24gd29yZEVuZFxuICAgICAgd29yZFN0YXJ0ID0gY3Vyc29yLmdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbih3b3JkUmVnZXg6IEBrZXl3b3JkUmVnZXgsIGFsbG93UHJldmlvdXM6IGZhbHNlKVxuXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uIHdvcmRTdGFydFxuXG4gICAgQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbd29yZFN0YXJ0LCB3b3JkRW5kXSlcblxuICBjdXJzb3JJc09uRU9GOiAoY3Vyc29yKSAtPlxuICAgIHBvcyA9IGN1cnNvci5nZXROZXh0V29yZEJvdW5kYXJ5QnVmZmVyUG9zaXRpb24od29yZFJlZ2V4OiBAa2V5d29yZFJlZ2V4KVxuICAgIGVvZlBvcyA9IEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICAgIHBvcy5yb3cgaXMgZW9mUG9zLnJvdyBhbmQgcG9zLmNvbHVtbiBpcyBlb2ZQb3MuY29sdW1uXG5cbiAgZ2V0Q3VycmVudFdvcmRNYXRjaDogLT5cbiAgICBjaGFyYWN0ZXJzID0gQGdldEN1cnJlbnRXb3JkKClcbiAgICBpZiBjaGFyYWN0ZXJzLmxlbmd0aCA+IDBcbiAgICAgIGlmIC9cXFcvLnRlc3QoY2hhcmFjdGVycykgdGhlbiBcIiN7Y2hhcmFjdGVyc31cXFxcYlwiIGVsc2UgXCJcXFxcYiN7Y2hhcmFjdGVyc31cXFxcYlwiXG4gICAgZWxzZVxuICAgICAgY2hhcmFjdGVyc1xuXG4gIGlzQ29tcGxldGU6IC0+IHRydWVcblxuICBleGVjdXRlOiAoY291bnQ9MSkgLT5cbiAgICBzdXBlcihjb3VudCkgaWYgQGlucHV0LmNoYXJhY3RlcnMubGVuZ3RoID4gMFxuXG5PcGVuQnJhY2tldHMgPSBbJygnLCAneycsICdbJ11cbkNsb3NlQnJhY2tldHMgPSBbJyknLCAnfScsICddJ11cbkFueUJyYWNrZXQgPSBuZXcgUmVnRXhwKE9wZW5CcmFja2V0cy5jb25jYXQoQ2xvc2VCcmFja2V0cykubWFwKF8uZXNjYXBlUmVnRXhwKS5qb2luKFwifFwiKSlcblxuY2xhc3MgQnJhY2tldE1hdGNoaW5nTW90aW9uIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBvcGVyYXRlc0luY2x1c2l2ZWx5OiB0cnVlXG5cbiAgaXNDb21wbGV0ZTogLT4gdHJ1ZVxuXG4gIHNlYXJjaEZvck1hdGNoOiAoc3RhcnRQb3NpdGlvbiwgcmV2ZXJzZSwgaW5DaGFyYWN0ZXIsIG91dENoYXJhY3RlcikgLT5cbiAgICBkZXB0aCA9IDBcbiAgICBwb2ludCA9IHN0YXJ0UG9zaXRpb24uY29weSgpXG4gICAgbGluZUxlbmd0aCA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9pbnQucm93KS5sZW5ndGhcbiAgICBlb2ZQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKS50cmFuc2xhdGUoWzAsIDFdKVxuICAgIGluY3JlbWVudCA9IGlmIHJldmVyc2UgdGhlbiAtMSBlbHNlIDFcblxuICAgIGxvb3BcbiAgICAgIGNoYXJhY3RlciA9IEBjaGFyYWN0ZXJBdChwb2ludClcbiAgICAgIGRlcHRoKysgaWYgY2hhcmFjdGVyIGlzIGluQ2hhcmFjdGVyXG4gICAgICBkZXB0aC0tIGlmIGNoYXJhY3RlciBpcyBvdXRDaGFyYWN0ZXJcblxuICAgICAgcmV0dXJuIHBvaW50IGlmIGRlcHRoIGlzIDBcblxuICAgICAgcG9pbnQuY29sdW1uICs9IGluY3JlbWVudFxuXG4gICAgICByZXR1cm4gbnVsbCBpZiBkZXB0aCA8IDBcbiAgICAgIHJldHVybiBudWxsIGlmIHBvaW50LmlzRXF1YWwoWzAsIC0xXSlcbiAgICAgIHJldHVybiBudWxsIGlmIHBvaW50LmlzRXF1YWwoZW9mUG9zaXRpb24pXG5cbiAgICAgIGlmIHBvaW50LmNvbHVtbiA8IDBcbiAgICAgICAgcG9pbnQucm93LS1cbiAgICAgICAgbGluZUxlbmd0aCA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9pbnQucm93KS5sZW5ndGhcbiAgICAgICAgcG9pbnQuY29sdW1uID0gbGluZUxlbmd0aCAtIDFcbiAgICAgIGVsc2UgaWYgcG9pbnQuY29sdW1uID49IGxpbmVMZW5ndGhcbiAgICAgICAgcG9pbnQucm93KytcbiAgICAgICAgbGluZUxlbmd0aCA9IEBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocG9pbnQucm93KS5sZW5ndGhcbiAgICAgICAgcG9pbnQuY29sdW1uID0gMFxuXG4gIGNoYXJhY3RlckF0OiAocG9zaXRpb24pIC0+XG4gICAgQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9zaXRpb24sIHBvc2l0aW9uLnRyYW5zbGF0ZShbMCwgMV0pXSlcblxuICBnZXRTZWFyY2hEYXRhOiAocG9zaXRpb24pIC0+XG4gICAgY2hhcmFjdGVyID0gQGNoYXJhY3RlckF0KHBvc2l0aW9uKVxuICAgIGlmIChpbmRleCA9IE9wZW5CcmFja2V0cy5pbmRleE9mKGNoYXJhY3RlcikpID49IDBcbiAgICAgIFtjaGFyYWN0ZXIsIENsb3NlQnJhY2tldHNbaW5kZXhdLCBmYWxzZV1cbiAgICBlbHNlIGlmIChpbmRleCA9IENsb3NlQnJhY2tldHMuaW5kZXhPZihjaGFyYWN0ZXIpKSA+PSAwXG4gICAgICBbY2hhcmFjdGVyLCBPcGVuQnJhY2tldHNbaW5kZXhdLCB0cnVlXVxuICAgIGVsc2VcbiAgICAgIFtdXG5cbiAgbW92ZUN1cnNvcjogKGN1cnNvcikgLT5cbiAgICBzdGFydFBvc2l0aW9uID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcblxuICAgIFtpbkNoYXJhY3Rlciwgb3V0Q2hhcmFjdGVyLCByZXZlcnNlXSA9IEBnZXRTZWFyY2hEYXRhKHN0YXJ0UG9zaXRpb24pXG5cbiAgICB1bmxlc3MgaW5DaGFyYWN0ZXI/XG4gICAgICByZXN0T2ZMaW5lID0gW3N0YXJ0UG9zaXRpb24sIFtzdGFydFBvc2l0aW9uLnJvdywgSW5maW5pdHldXVxuICAgICAgQGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSBBbnlCcmFja2V0LCByZXN0T2ZMaW5lLCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgICAgc3RhcnRQb3NpdGlvbiA9IHJhbmdlLnN0YXJ0XG4gICAgICAgIHN0b3AoKVxuXG4gICAgW2luQ2hhcmFjdGVyLCBvdXRDaGFyYWN0ZXIsIHJldmVyc2VdID0gQGdldFNlYXJjaERhdGEoc3RhcnRQb3NpdGlvbilcblxuICAgIHJldHVybiB1bmxlc3MgaW5DaGFyYWN0ZXI/XG5cbiAgICBpZiBtYXRjaFBvc2l0aW9uID0gQHNlYXJjaEZvck1hdGNoKHN0YXJ0UG9zaXRpb24sIHJldmVyc2UsIGluQ2hhcmFjdGVyLCBvdXRDaGFyYWN0ZXIpXG4gICAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24obWF0Y2hQb3NpdGlvbilcblxuY2xhc3MgUmVwZWF0U2VhcmNoIGV4dGVuZHMgU2VhcmNoQmFzZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSkgLT5cbiAgICBzdXBlcihAZWRpdG9yLCBAdmltU3RhdGUsIGRvbnRVcGRhdGVDdXJyZW50U2VhcmNoOiB0cnVlKVxuICAgIEBpbnB1dCA9IG5ldyBJbnB1dChAdmltU3RhdGUuZ2V0U2VhcmNoSGlzdG9yeUl0ZW0oMCkgPyBcIlwiKVxuICAgIEByZXBsaWNhdGVDdXJyZW50U2VhcmNoKClcblxuICBpc0NvbXBsZXRlOiAtPiB0cnVlXG5cbiAgcmV2ZXJzZWQ6IC0+XG4gICAgQHJldmVyc2UgPSBub3QgQGluaXRpYWxseVJldmVyc2VkXG4gICAgdGhpc1xuXG5cbm1vZHVsZS5leHBvcnRzID0ge1NlYXJjaCwgU2VhcmNoQ3VycmVudFdvcmQsIEJyYWNrZXRNYXRjaGluZ01vdGlvbiwgUmVwZWF0U2VhcmNofVxuIl19
