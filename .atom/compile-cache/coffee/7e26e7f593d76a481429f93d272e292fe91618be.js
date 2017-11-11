(function() {
  var Scroll, ScrollCursor, ScrollCursorToBottom, ScrollCursorToLeft, ScrollCursorToMiddle, ScrollCursorToRight, ScrollCursorToTop, ScrollDown, ScrollHorizontal, ScrollUp,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Scroll = (function() {
    Scroll.prototype.isComplete = function() {
      return true;
    };

    Scroll.prototype.isRecordable = function() {
      return false;
    };

    function Scroll(editorElement) {
      this.editorElement = editorElement;
      this.scrolloff = 2;
      this.editor = this.editorElement.getModel();
      this.rows = {
        first: this.editorElement.getFirstVisibleScreenRow(),
        last: this.editorElement.getLastVisibleScreenRow(),
        final: this.editor.getLastScreenRow()
      };
    }

    return Scroll;

  })();

  ScrollDown = (function(superClass) {
    extend(ScrollDown, superClass);

    function ScrollDown() {
      return ScrollDown.__super__.constructor.apply(this, arguments);
    }

    ScrollDown.prototype.execute = function(count) {
      var cursor, i, len, newFirstRow, oldFirstRow, position, ref;
      if (count == null) {
        count = 1;
      }
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow + count);
      newFirstRow = this.editor.getFirstVisibleScreenRow();
      ref = this.editor.getCursors();
      for (i = 0, len = ref.length; i < len; i++) {
        cursor = ref[i];
        position = cursor.getScreenPosition();
        if (position.row <= newFirstRow + this.scrolloff) {
          cursor.setScreenPosition([position.row + newFirstRow - oldFirstRow, position.column], {
            autoscroll: false
          });
        }
      }
      this.editorElement.component.updateSync();
    };

    return ScrollDown;

  })(Scroll);

  ScrollUp = (function(superClass) {
    extend(ScrollUp, superClass);

    function ScrollUp() {
      return ScrollUp.__super__.constructor.apply(this, arguments);
    }

    ScrollUp.prototype.execute = function(count) {
      var cursor, i, len, newLastRow, oldFirstRow, oldLastRow, position, ref;
      if (count == null) {
        count = 1;
      }
      oldFirstRow = this.editor.getFirstVisibleScreenRow();
      oldLastRow = this.editor.getLastVisibleScreenRow();
      this.editor.setFirstVisibleScreenRow(oldFirstRow - count);
      newLastRow = this.editor.getLastVisibleScreenRow();
      ref = this.editor.getCursors();
      for (i = 0, len = ref.length; i < len; i++) {
        cursor = ref[i];
        position = cursor.getScreenPosition();
        if (position.row >= newLastRow - this.scrolloff) {
          cursor.setScreenPosition([position.row - (oldLastRow - newLastRow), position.column], {
            autoscroll: false
          });
        }
      }
      this.editorElement.component.updateSync();
    };

    return ScrollUp;

  })(Scroll);

  ScrollCursor = (function(superClass) {
    extend(ScrollCursor, superClass);

    function ScrollCursor(editorElement, opts) {
      var cursor;
      this.editorElement = editorElement;
      this.opts = opts != null ? opts : {};
      ScrollCursor.__super__.constructor.apply(this, arguments);
      cursor = this.editor.getCursorScreenPosition();
      this.pixel = this.editorElement.pixelPositionForScreenPosition(cursor).top;
    }

    return ScrollCursor;

  })(Scroll);

  ScrollCursorToTop = (function(superClass) {
    extend(ScrollCursorToTop, superClass);

    function ScrollCursorToTop() {
      return ScrollCursorToTop.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToTop.prototype.execute = function() {
      if (!this.opts.leaveCursor) {
        this.moveToFirstNonBlank();
      }
      return this.scrollUp();
    };

    ScrollCursorToTop.prototype.scrollUp = function() {
      if (this.rows.last === this.rows.final) {
        return;
      }
      this.pixel -= this.editor.getLineHeightInPixels() * this.scrolloff;
      return this.editorElement.setScrollTop(this.pixel);
    };

    ScrollCursorToTop.prototype.moveToFirstNonBlank = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    return ScrollCursorToTop;

  })(ScrollCursor);

  ScrollCursorToMiddle = (function(superClass) {
    extend(ScrollCursorToMiddle, superClass);

    function ScrollCursorToMiddle() {
      return ScrollCursorToMiddle.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToMiddle.prototype.execute = function() {
      if (!this.opts.leaveCursor) {
        this.moveToFirstNonBlank();
      }
      return this.scrollMiddle();
    };

    ScrollCursorToMiddle.prototype.scrollMiddle = function() {
      this.pixel -= this.editorElement.getHeight() / 2;
      return this.editorElement.setScrollTop(this.pixel);
    };

    ScrollCursorToMiddle.prototype.moveToFirstNonBlank = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    return ScrollCursorToMiddle;

  })(ScrollCursor);

  ScrollCursorToBottom = (function(superClass) {
    extend(ScrollCursorToBottom, superClass);

    function ScrollCursorToBottom() {
      return ScrollCursorToBottom.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToBottom.prototype.execute = function() {
      if (!this.opts.leaveCursor) {
        this.moveToFirstNonBlank();
      }
      return this.scrollDown();
    };

    ScrollCursorToBottom.prototype.scrollDown = function() {
      var offset;
      if (this.rows.first === 0) {
        return;
      }
      offset = this.editor.getLineHeightInPixels() * (this.scrolloff + 1);
      this.pixel -= this.editorElement.getHeight() - offset;
      return this.editorElement.setScrollTop(this.pixel);
    };

    ScrollCursorToBottom.prototype.moveToFirstNonBlank = function() {
      return this.editor.moveToFirstCharacterOfLine();
    };

    return ScrollCursorToBottom;

  })(ScrollCursor);

  ScrollHorizontal = (function() {
    ScrollHorizontal.prototype.isComplete = function() {
      return true;
    };

    ScrollHorizontal.prototype.isRecordable = function() {
      return false;
    };

    function ScrollHorizontal(editorElement) {
      var cursorPos;
      this.editorElement = editorElement;
      this.editor = this.editorElement.getModel();
      cursorPos = this.editor.getCursorScreenPosition();
      this.pixel = this.editorElement.pixelPositionForScreenPosition(cursorPos).left;
      this.cursor = this.editor.getLastCursor();
    }

    ScrollHorizontal.prototype.putCursorOnScreen = function() {
      return this.editor.scrollToCursorPosition({
        center: false
      });
    };

    return ScrollHorizontal;

  })();

  ScrollCursorToLeft = (function(superClass) {
    extend(ScrollCursorToLeft, superClass);

    function ScrollCursorToLeft() {
      return ScrollCursorToLeft.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToLeft.prototype.execute = function() {
      this.editorElement.setScrollLeft(this.pixel);
      return this.putCursorOnScreen();
    };

    return ScrollCursorToLeft;

  })(ScrollHorizontal);

  ScrollCursorToRight = (function(superClass) {
    extend(ScrollCursorToRight, superClass);

    function ScrollCursorToRight() {
      return ScrollCursorToRight.__super__.constructor.apply(this, arguments);
    }

    ScrollCursorToRight.prototype.execute = function() {
      this.editorElement.setScrollRight(this.pixel);
      return this.putCursorOnScreen();
    };

    return ScrollCursorToRight;

  })(ScrollHorizontal);

  module.exports = {
    ScrollDown: ScrollDown,
    ScrollUp: ScrollUp,
    ScrollCursorToTop: ScrollCursorToTop,
    ScrollCursorToMiddle: ScrollCursorToMiddle,
    ScrollCursorToBottom: ScrollCursorToBottom,
    ScrollCursorToLeft: ScrollCursorToLeft,
    ScrollCursorToRight: ScrollCursorToRight
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3Njcm9sbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9LQUFBO0lBQUE7OztFQUFNO3FCQUNKLFVBQUEsR0FBWSxTQUFBO2FBQUc7SUFBSDs7cUJBQ1osWUFBQSxHQUFjLFNBQUE7YUFBRztJQUFIOztJQUNELGdCQUFDLGFBQUQ7TUFBQyxJQUFDLENBQUEsZ0JBQUQ7TUFDWixJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsYUFBYSxDQUFDLFFBQWYsQ0FBQTtNQUNWLElBQUMsQ0FBQSxJQUFELEdBQ0U7UUFBQSxLQUFBLEVBQU8sSUFBQyxDQUFBLGFBQWEsQ0FBQyx3QkFBZixDQUFBLENBQVA7UUFDQSxJQUFBLEVBQU0sSUFBQyxDQUFBLGFBQWEsQ0FBQyx1QkFBZixDQUFBLENBRE47UUFFQSxLQUFBLEVBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUFBLENBRlA7O0lBSlM7Ozs7OztFQVFUOzs7Ozs7O3lCQUNKLE9BQUEsR0FBUyxTQUFDLEtBQUQ7QUFDUCxVQUFBOztRQURRLFFBQU07O01BQ2QsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBQTtNQUNkLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBaUMsV0FBQSxHQUFjLEtBQS9DO01BQ0EsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsd0JBQVIsQ0FBQTtBQUVkO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxRQUFBLEdBQVcsTUFBTSxDQUFDLGlCQUFQLENBQUE7UUFDWCxJQUFHLFFBQVEsQ0FBQyxHQUFULElBQWdCLFdBQUEsR0FBYyxJQUFDLENBQUEsU0FBbEM7VUFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxRQUFRLENBQUMsR0FBVCxH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QUFSLENBQStCO1FBQUMsTUFBQSxFQUFRLEtBQVQ7T0FBL0I7SUFEaUI7Ozs7OztFQUdmOzs7Ozs7O2lDQUNKLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxhQUFmLENBQTZCLElBQUMsQ0FBQSxLQUE5QjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBRk87Ozs7S0FEc0I7O0VBSzNCOzs7Ozs7O2tDQUNKLE9BQUEsR0FBUyxTQUFBO01BQ1AsSUFBQyxDQUFBLGFBQWEsQ0FBQyxjQUFmLENBQThCLElBQUMsQ0FBQSxLQUEvQjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBRk87Ozs7S0FEdUI7O0VBS2xDLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsWUFBQSxVQUFEO0lBQWEsVUFBQSxRQUFiO0lBQXVCLG1CQUFBLGlCQUF2QjtJQUEwQyxzQkFBQSxvQkFBMUM7SUFDZixzQkFBQSxvQkFEZTtJQUNPLG9CQUFBLGtCQURQO0lBQzJCLHFCQUFBLG1CQUQzQjs7QUFqSGpCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2Nyb2xsXG4gIGlzQ29tcGxldGU6IC0+IHRydWVcbiAgaXNSZWNvcmRhYmxlOiAtPiBmYWxzZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3JFbGVtZW50KSAtPlxuICAgIEBzY3JvbGxvZmYgPSAyICMgYXRvbSBkZWZhdWx0XG4gICAgQGVkaXRvciA9IEBlZGl0b3JFbGVtZW50LmdldE1vZGVsKClcbiAgICBAcm93cyA9XG4gICAgICBmaXJzdDogQGVkaXRvckVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGxhc3Q6IEBlZGl0b3JFbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICAgIGZpbmFsOiBAZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKVxuXG5jbGFzcyBTY3JvbGxEb3duIGV4dGVuZHMgU2Nyb2xsXG4gIGV4ZWN1dGU6IChjb3VudD0xKSAtPlxuICAgIG9sZEZpcnN0Um93ID0gQGVkaXRvci5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIEBlZGl0b3Iuc2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KG9sZEZpcnN0Um93ICsgY291bnQpXG4gICAgbmV3Rmlyc3RSb3cgPSBAZWRpdG9yLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBwb3NpdGlvbiA9IGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpXG4gICAgICBpZiBwb3NpdGlvbi5yb3cgPD0gbmV3Rmlyc3RSb3cgKyBAc2Nyb2xsb2ZmXG4gICAgICAgIGN1cnNvci5zZXRTY3JlZW5Qb3NpdGlvbihbcG9zaXRpb24ucm93ICsgbmV3Rmlyc3RSb3cgLSBvbGRGaXJzdFJvdywgcG9zaXRpb24uY29sdW1uXSwgYXV0b3Njcm9sbDogZmFsc2UpXG5cbiAgICAjIFRPRE86IHJlbW92ZVxuICAgICMgVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGEgYnVnIGZpeGVkIGluIGF0b20vYXRvbSMxMDA2MlxuICAgIEBlZGl0b3JFbGVtZW50LmNvbXBvbmVudC51cGRhdGVTeW5jKClcblxuICAgIHJldHVyblxuXG5jbGFzcyBTY3JvbGxVcCBleHRlbmRzIFNjcm9sbFxuICBleGVjdXRlOiAoY291bnQ9MSkgLT5cbiAgICBvbGRGaXJzdFJvdyA9IEBlZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbiAgICBvbGRMYXN0Um93ID0gQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgQGVkaXRvci5zZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cob2xkRmlyc3RSb3cgLSBjb3VudClcbiAgICBuZXdMYXN0Um93ID0gQGVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBwb3NpdGlvbiA9IGN1cnNvci5nZXRTY3JlZW5Qb3NpdGlvbigpXG4gICAgICBpZiBwb3NpdGlvbi5yb3cgPj0gbmV3TGFzdFJvdyAtIEBzY3JvbGxvZmZcbiAgICAgICAgY3Vyc29yLnNldFNjcmVlblBvc2l0aW9uKFtwb3NpdGlvbi5yb3cgLSAob2xkTGFzdFJvdyAtIG5ld0xhc3RSb3cpLCBwb3NpdGlvbi5jb2x1bW5dLCBhdXRvc2Nyb2xsOiBmYWxzZSlcblxuICAgICMgVE9ETzogcmVtb3ZlXG4gICAgIyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3IgYSBidWcgZml4ZWQgaW4gYXRvbS9hdG9tIzEwMDYyXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnVwZGF0ZVN5bmMoKVxuXG4gICAgcmV0dXJuXG5cbmNsYXNzIFNjcm9sbEN1cnNvciBleHRlbmRzIFNjcm9sbFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3JFbGVtZW50LCBAb3B0cz17fSkgLT5cbiAgICBzdXBlclxuICAgIGN1cnNvciA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKVxuICAgIEBwaXhlbCA9IEBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihjdXJzb3IpLnRvcFxuXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1RvcCBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBleGVjdXRlOiAtPlxuICAgIEBtb3ZlVG9GaXJzdE5vbkJsYW5rKCkgdW5sZXNzIEBvcHRzLmxlYXZlQ3Vyc29yXG4gICAgQHNjcm9sbFVwKClcblxuICBzY3JvbGxVcDogLT5cbiAgICByZXR1cm4gaWYgQHJvd3MubGFzdCBpcyBAcm93cy5maW5hbFxuICAgIEBwaXhlbCAtPSAoQGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIEBzY3JvbGxvZmYpXG4gICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKEBwaXhlbClcblxuICBtb3ZlVG9GaXJzdE5vbkJsYW5rOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5jbGFzcyBTY3JvbGxDdXJzb3JUb01pZGRsZSBleHRlbmRzIFNjcm9sbEN1cnNvclxuICBleGVjdXRlOiAtPlxuICAgIEBtb3ZlVG9GaXJzdE5vbkJsYW5rKCkgdW5sZXNzIEBvcHRzLmxlYXZlQ3Vyc29yXG4gICAgQHNjcm9sbE1pZGRsZSgpXG5cbiAgc2Nyb2xsTWlkZGxlOiAtPlxuICAgIEBwaXhlbCAtPSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyAyKVxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcChAcGl4ZWwpXG5cbiAgbW92ZVRvRmlyc3ROb25CbGFuazogLT5cbiAgICBAZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuY2xhc3MgU2Nyb2xsQ3Vyc29yVG9Cb3R0b20gZXh0ZW5kcyBTY3JvbGxDdXJzb3JcbiAgZXhlY3V0ZTogLT5cbiAgICBAbW92ZVRvRmlyc3ROb25CbGFuaygpIHVubGVzcyBAb3B0cy5sZWF2ZUN1cnNvclxuICAgIEBzY3JvbGxEb3duKClcblxuICBzY3JvbGxEb3duOiAtPlxuICAgIHJldHVybiBpZiBAcm93cy5maXJzdCBpcyAwXG4gICAgb2Zmc2V0ID0gKEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoQHNjcm9sbG9mZiArIDEpKVxuICAgIEBwaXhlbCAtPSAoQGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSBvZmZzZXQpXG4gICAgQGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKEBwaXhlbClcblxuICBtb3ZlVG9GaXJzdE5vbkJsYW5rOiAtPlxuICAgIEBlZGl0b3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5jbGFzcyBTY3JvbGxIb3Jpem9udGFsXG4gIGlzQ29tcGxldGU6IC0+IHRydWVcbiAgaXNSZWNvcmRhYmxlOiAtPiBmYWxzZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3JFbGVtZW50KSAtPlxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgY3Vyc29yUG9zID0gQGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpXG4gICAgQHBpeGVsID0gQGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKGN1cnNvclBvcykubGVmdFxuICAgIEBjdXJzb3IgPSBAZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuXG4gIHB1dEN1cnNvck9uU2NyZWVuOiAtPlxuICAgIEBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbih7Y2VudGVyOiBmYWxzZX0pXG5cbmNsYXNzIFNjcm9sbEN1cnNvclRvTGVmdCBleHRlbmRzIFNjcm9sbEhvcml6b250YWxcbiAgZXhlY3V0ZTogLT5cbiAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KEBwaXhlbClcbiAgICBAcHV0Q3Vyc29yT25TY3JlZW4oKVxuXG5jbGFzcyBTY3JvbGxDdXJzb3JUb1JpZ2h0IGV4dGVuZHMgU2Nyb2xsSG9yaXpvbnRhbFxuICBleGVjdXRlOiAtPlxuICAgIEBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFJpZ2h0KEBwaXhlbClcbiAgICBAcHV0Q3Vyc29yT25TY3JlZW4oKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtTY3JvbGxEb3duLCBTY3JvbGxVcCwgU2Nyb2xsQ3Vyc29yVG9Ub3AsIFNjcm9sbEN1cnNvclRvTWlkZGxlLFxuICBTY3JvbGxDdXJzb3JUb0JvdHRvbSwgU2Nyb2xsQ3Vyc29yVG9MZWZ0LCBTY3JvbGxDdXJzb3JUb1JpZ2h0fVxuIl19
