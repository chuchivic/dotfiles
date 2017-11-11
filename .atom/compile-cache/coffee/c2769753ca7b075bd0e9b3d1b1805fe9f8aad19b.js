(function() {
  "use strict";
  var TwoDimArray, WrappedDomTree, curHash, hashTo,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  TwoDimArray = require('./two-dim-array');

  curHash = 0;

  hashTo = {};

  module.exports = WrappedDomTree = (function() {
    function WrappedDomTree(dom, clone, rep) {
      if (clone) {
        this.shownTree = new WrappedDomTree(dom, false, this);
        this.dom = dom.cloneNode(true);
      } else {
        this.dom = dom;
        this.rep = rep;
      }
      this.clone = clone;
      this.hash = curHash++;
      hashTo[this.hash] = this;
      this.isText = dom.nodeType === 3;
      this.tagName = dom.tagName;
      this.className = dom.className;
      this.textData = dom.data;
      this.diffHash = {};
      if (this.isText) {
        this.size = 1;
      } else {
        rep = this.rep;
        this.children = [].map.call(this.dom.childNodes, function(dom, ind) {
          return new WrappedDomTree(dom, false, rep ? rep.children[ind] : null);
        });
        this.size = this.children.length ? this.children.reduce((function(prev, cur) {
          return prev + cur.size;
        }), 0) : 0;
        if (!this.size) {
          this.size = 1;
        }
      }
    }

    WrappedDomTree.prototype.diffTo = function(otherTree) {
      var diff, fn, indexShift, inserted, k, last, lastElmDeleted, lastElmInserted, lastOp, len, op, operations, possibleReplace, r, ref, score;
      if (this.clone) {
        return this.shownTree.diffTo(otherTree);
      }
      diff = this.rep.diff(otherTree);
      score = diff.score;
      operations = diff.operations;
      indexShift = 0;
      inserted = [];
      ref = [], last = ref[0], possibleReplace = ref[1], r = ref[2], lastOp = ref[3], lastElmDeleted = ref[4], lastElmInserted = ref[5];
      if (operations) {
        if (operations instanceof Array) {
          fn = (function(_this) {
            return function(op) {
              var possibleLastDeleted, re;
              if (op.type === "d") {
                possibleLastDeleted = _this.children[op.tree + indexShift].dom;
                r = _this.remove(op.tree + indexShift);
                _this.rep.remove(op.tree + indexShift);
                if (!last || last.nextSibling === r || last === r) {
                  last = r;
                  if (last && lastOp && op.tree === lastOp.pos) {
                    lastElmDeleted = possibleLastDeleted;
                  } else {
                    lastElmDeleted = null;
                    lastElmInserted = null;
                  }
                  lastOp = op;
                }
                indexShift--;
              } else if (op.type === "i") {
                _this.rep.insert(op.pos + indexShift, otherTree.children[op.otherTree]);
                r = _this.insert(op.pos + indexShift, otherTree.children[op.otherTree], _this.rep.children[op.pos + indexShift]);
                inserted.push(r);
                if (!last || last.nextSibling === r) {
                  last = r;
                  lastOp = op;
                  lastElmInserted = r;
                }
                indexShift++;
              } else {
                re = _this.children[op.tree + indexShift].diffTo(otherTree.children[op.otherTree]);
                if (!last || (last.nextSibling === _this.children[op.tree + indexShift].dom && re.last)) {
                  last = re.last;
                  if (re.possibleReplace) {
                    lastElmInserted = re.possibleReplace.cur;
                    lastElmDeleted = re.possibleReplace.prev;
                  }
                  lastOp = op;
                }
                inserted = inserted.concat(re.inserted);
              }
            };
          })(this);
          for (k = 0, len = operations.length; k < len; k++) {
            op = operations[k];
            fn(op);
          }
        } else {
          console.log(operations);
          throw new Error("invalid operations");
        }
      }
      if (lastOp && lastOp.type !== 'i' && lastElmInserted && lastElmDeleted) {
        possibleReplace = {
          cur: lastElmInserted,
          prev: lastElmDeleted
        };
      }
      return {
        last: last,
        inserted: inserted,
        possibleReplace: possibleReplace
      };
    };

    WrappedDomTree.prototype.insert = function(i, tree, rep) {
      var ctree, dom;
      dom = tree.dom.cloneNode(true);
      if (i === this.dom.childNodes.length) {
        this.dom.appendChild(dom);
      } else {
        this.dom.insertBefore(dom, this.dom.childNodes[i]);
      }
      ctree = new WrappedDomTree(dom, false, rep);
      this.children.splice(i, 0, ctree);
      return this.dom.childNodes[i];
    };

    WrappedDomTree.prototype.remove = function(i) {
      this.dom.removeChild(this.dom.childNodes[i]);
      this.children[i].removeSelf();
      this.children.splice(i, 1);
      return this.dom.childNodes[i - 1];
    };

    WrappedDomTree.prototype.diff = function(otherTree, tmax) {
      var cc, cr, cur, dp, forwardSearch, getScore, i, k, key, l, offset, op, operations, p, pc, pr, prev, rc, ref, ref1, score, sum;
      if (this.equalTo(otherTree)) {
        return {
          score: 0,
          operations: null
        };
      }
      if (this.cannotReplaceWith(otherTree)) {
        return {
          score: 1 / 0,
          operations: null
        };
      }
      key = otherTree.hash;
      if (indexOf.call(this.diffHash, key) >= 0) {
        return this.diffHash[key];
      }
      if (tmax === void 0) {
        tmax = 100000;
      }
      if (tmax <= 0) {
        return 0;
      }
      offset = 0;
      forwardSearch = (function(_this) {
        return function(offset) {
          return offset < _this.children.length && offset < otherTree.children.length && _this.children[offset].equalTo(otherTree.children[offset]);
        };
      })(this);
      while (forwardSearch(offset)) {
        offset++;
      }
      dp = new TwoDimArray(this.children.length + 1 - offset, otherTree.children.length + 1 - offset);
      p = new TwoDimArray(this.children.length + 1 - offset, otherTree.children.length + 1 - offset);
      dp.set(0, 0, 0);
      sum = 0;
      if (otherTree.children.length - offset > 1) {
        for (i = k = 1, ref = otherTree.children.length - offset - 1; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
          dp.set(0, i, sum);
          p.set(0, i, i - 1);
          sum += otherTree.children[i + offset].size;
        }
      }
      if (otherTree.children.length - offset > 0) {
        dp.set(0, otherTree.children.length - offset, sum);
        p.set(0, otherTree.children.length - offset, otherTree.children.length - 1 - offset);
      }
      sum = 0;
      if (this.children.length - offset > 1) {
        for (i = l = 1, ref1 = this.children.length - offset - 1; 1 <= ref1 ? l <= ref1 : l >= ref1; i = 1 <= ref1 ? ++l : --l) {
          dp.set(i, 0, sum);
          p.set(i, 0, (i - 1) * p.col);
          sum += this.children[i + offset].size;
        }
      }
      if (this.children.length - offset) {
        dp.set(this.children.length - offset, 0, sum);
        p.set(this.children.length - offset, 0, (this.children.length - 1 - offset) * p.col);
      }
      getScore = (function(_this) {
        return function(i, j, max) {
          var bound, force, other, prev, subdiff, val;
          if (dp.get(i, j) !== void 0) {
            return dp.get(i, j);
          }
          if (max === void 0) {
            max = 1 / 0;
          }
          if (max <= 0) {
            return 1 / 0;
          }
          val = max;
          bound = max;
          subdiff = _this.children[i - 1 + offset].diff(otherTree.children[j - 1 + offset], bound).score;
          force = false;
          if (subdiff < bound && subdiff + 1 < _this.children[i - 1 + offset].size + otherTree.children[j - 1 + offset].size) {
            force = true;
          }
          val = getScore(i - 1, j - 1, bound - subdiff) + subdiff;
          prev = p.getInd(i - 1, j - 1);
          if (!force) {
            other = getScore(i - 1, j, Math.min(val, max) - _this.children[i - 1 + offset].size) + _this.children[i - 1 + offset].size;
            if (other < val) {
              prev = p.getInd(i - 1, j);
              val = other;
            }
            other = getScore(i, j - 1, Math.min(val, max) - otherTree.children[j - 1 + offset].size) + otherTree.children[j - 1 + offset].size;
            if (other < val) {
              prev = p.getInd(i, j - 1);
              val = other;
            }
          }
          if (val >= max) {
            val = 1 / 0;
          }
          dp.set(i, j, val);
          p.set(i, j, prev);
          return val;
        };
      })(this);
      score = getScore(this.children.length - offset, otherTree.children.length - offset, tmax);
      operations = [];
      cur = p.getInd(this.children.length - offset, otherTree.children.length - offset);
      cr = this.children.length - 1 - offset;
      cc = otherTree.children.length - 1 - offset;
      while (p.rawGet(cur) !== void 0) {
        prev = p.rawGet(cur);
        rc = p.get2DInd(prev);
        pr = rc.r - 1;
        pc = rc.c - 1;
        if (pr === cr) {
          operations.unshift({
            type: "i",
            otherTree: cc + offset,
            pos: cr + 1 + offset
          });
        } else if (pc === cc) {
          operations.unshift({
            type: "d",
            tree: cr + offset
          });
        } else {
          op = this.children[cr + offset].diff(otherTree.children[cc + offset]).operations;
          if (op && op.length) {
            operations.unshift({
              type: "r",
              tree: cr + offset,
              otherTree: cc + offset
            });
          }
        }
        cur = prev;
        cr = pr;
        cc = pc;
      }
      this.diffHash[key] = {
        score: score,
        operations: operations
      };
      return this.diffHash[key];
    };

    WrappedDomTree.prototype.equalTo = function(otherTree) {
      return this.dom.isEqualNode(otherTree.dom);
    };

    WrappedDomTree.prototype.cannotReplaceWith = function(otherTree) {
      return this.isText || otherTree.isText || this.tagName !== otherTree.tagName || this.className !== otherTree.className || this.className === "math" || this.className === "atom-text-editor" || this.tagName === "A" || (this.tagName === "IMG" && !this.dom.isEqualNode(otherTree.dom));
    };

    WrappedDomTree.prototype.getContent = function() {
      if (this.dom.outerHTML) {
        return this.dom.outerHTML;
      } else {
        return this.textData;
      }
    };

    WrappedDomTree.prototype.removeSelf = function() {
      hashTo[this.hash] = null;
      this.children && this.children.forEach(function(c) {
        return c.removeSelf();
      });
    };

    return WrappedDomTree;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi93cmFwcGVkLWRvbS10cmVlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFzQkE7RUFBQTtBQUFBLE1BQUEsNENBQUE7SUFBQTs7RUFFQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSOztFQUVkLE9BQUEsR0FBVTs7RUFDVixNQUFBLEdBQVU7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FBdUI7SUFLUix3QkFBQyxHQUFELEVBQU0sS0FBTixFQUFhLEdBQWI7TUFDWCxJQUFHLEtBQUg7UUFDRSxJQUFDLENBQUEsU0FBRCxHQUFrQixJQUFBLGNBQUEsQ0FBZSxHQUFmLEVBQW9CLEtBQXBCLEVBQTJCLElBQTNCO1FBQ2xCLElBQUMsQ0FBQSxHQUFELEdBQWMsR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkLEVBRmhCO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxHQUFELEdBQU87UUFDUCxJQUFDLENBQUEsR0FBRCxHQUFPLElBTFQ7O01BT0EsSUFBQyxDQUFBLEtBQUQsR0FBZ0I7TUFDaEIsSUFBQyxDQUFBLElBQUQsR0FBZ0IsT0FBQTtNQUNoQixNQUFPLENBQUEsSUFBQyxDQUFBLElBQUQsQ0FBUCxHQUFnQjtNQUNoQixJQUFDLENBQUEsTUFBRCxHQUFnQixHQUFHLENBQUMsUUFBSixLQUFnQjtNQUNoQyxJQUFDLENBQUEsT0FBRCxHQUFnQixHQUFHLENBQUM7TUFDcEIsSUFBQyxDQUFBLFNBQUQsR0FBZ0IsR0FBRyxDQUFDO01BQ3BCLElBQUMsQ0FBQSxRQUFELEdBQWdCLEdBQUcsQ0FBQztNQUNwQixJQUFDLENBQUEsUUFBRCxHQUFnQjtNQUVoQixJQUFHLElBQUMsQ0FBQSxNQUFKO1FBQ0UsSUFBQyxDQUFBLElBQUQsR0FBUSxFQURWO09BQUEsTUFBQTtRQUdFLEdBQUEsR0FBTSxJQUFDLENBQUE7UUFDUCxJQUFDLENBQUEsUUFBRCxHQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxHQUFHLENBQUMsVUFBakIsRUFBNkIsU0FBQyxHQUFELEVBQU0sR0FBTjtpQkFDbkMsSUFBQSxjQUFBLENBQWUsR0FBZixFQUFvQixLQUFwQixFQUE4QixHQUFILEdBQVksR0FBRyxDQUFDLFFBQVMsQ0FBQSxHQUFBLENBQXpCLEdBQW1DLElBQTlEO1FBRG1DLENBQTdCO1FBRVosSUFBQyxDQUFBLElBQUQsR0FBVyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQWIsR0FBeUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQWlCLENBQUUsU0FBQyxJQUFELEVBQU8sR0FBUDtpQkFDbEQsSUFBQSxHQUFPLEdBQUcsQ0FBQztRQUR1QyxDQUFGLENBQWpCLEVBQ1osQ0FEWSxDQUF6QixHQUNvQjtRQUM1QixJQUFBLENBQU8sSUFBQyxDQUFBLElBQVI7VUFDRSxJQUFDLENBQUEsSUFBRCxHQUFRLEVBRFY7U0FSRjs7SUFqQlc7OzZCQTZCYixNQUFBLEdBQVEsU0FBQyxTQUFEO0FBQ04sVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLEtBQUo7QUFDRSxlQUFPLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxDQUFrQixTQUFsQixFQURUOztNQUdBLElBQUEsR0FBYyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQUwsQ0FBVSxTQUFWO01BQ2QsS0FBQSxHQUFjLElBQUksQ0FBQztNQUNuQixVQUFBLEdBQWMsSUFBSSxDQUFDO01BQ25CLFVBQUEsR0FBYztNQUNkLFFBQUEsR0FBYztNQUdkLE1BQXNFLEVBQXRFLEVBQUMsYUFBRCxFQUFPLHdCQUFQLEVBQXdCLFVBQXhCLEVBQTJCLGVBQTNCLEVBQW1DLHVCQUFuQyxFQUFtRDtNQUVuRCxJQUFHLFVBQUg7UUFDRSxJQUFHLFVBQUEsWUFBc0IsS0FBekI7ZUFFTyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLEVBQUQ7QUFDRCxrQkFBQTtjQUFBLElBQUcsRUFBRSxDQUFDLElBQUgsS0FBVyxHQUFkO2dCQUNFLG1CQUFBLEdBQXNCLEtBQUMsQ0FBQSxRQUFTLENBQUEsRUFBRSxDQUFDLElBQUgsR0FBVSxVQUFWLENBQXFCLENBQUM7Z0JBQ3RELENBQUEsR0FBSSxLQUFDLENBQUEsTUFBRCxDQUFRLEVBQUUsQ0FBQyxJQUFILEdBQVUsVUFBbEI7Z0JBQ0osS0FBQyxDQUFBLEdBQUcsQ0FBQyxNQUFMLENBQVksRUFBRSxDQUFDLElBQUgsR0FBVSxVQUF0QjtnQkFDQSxJQUFHLENBQUksSUFBSixJQUFZLElBQUksQ0FBQyxXQUFMLEtBQW9CLENBQWhDLElBQXFDLElBQUEsS0FBUSxDQUFoRDtrQkFDRSxJQUFBLEdBQU87a0JBR1AsSUFBRyxJQUFBLElBQVMsTUFBVCxJQUFvQixFQUFFLENBQUMsSUFBSCxLQUFXLE1BQU0sQ0FBQyxHQUF6QztvQkFDRSxjQUFBLEdBQWlCLG9CQURuQjttQkFBQSxNQUFBO29CQUdFLGNBQUEsR0FBa0I7b0JBQ2xCLGVBQUEsR0FBa0IsS0FKcEI7O2tCQUtBLE1BQUEsR0FBUyxHQVRYOztnQkFVQSxVQUFBLEdBZEY7ZUFBQSxNQWdCSyxJQUFHLEVBQUUsQ0FBQyxJQUFILEtBQVcsR0FBZDtnQkFDSCxLQUFDLENBQUEsR0FBRyxDQUFDLE1BQUwsQ0FBWSxFQUFFLENBQUMsR0FBSCxHQUFTLFVBQXJCLEVBQWlDLFNBQVMsQ0FBQyxRQUFTLENBQUEsRUFBRSxDQUFDLFNBQUgsQ0FBcEQ7Z0JBQ0EsQ0FBQSxHQUFJLEtBQUMsQ0FBQSxNQUFELENBQVEsRUFBRSxDQUFDLEdBQUgsR0FBUyxVQUFqQixFQUE2QixTQUFTLENBQUMsUUFBUyxDQUFBLEVBQUUsQ0FBQyxTQUFILENBQWhELEVBQStELEtBQUMsQ0FBQSxHQUFHLENBQUMsUUFBUyxDQUFBLEVBQUUsQ0FBQyxHQUFILEdBQVMsVUFBVCxDQUE3RTtnQkFDSixRQUFRLENBQUMsSUFBVCxDQUFjLENBQWQ7Z0JBQ0EsSUFBRyxDQUFJLElBQUosSUFBWSxJQUFJLENBQUMsV0FBTCxLQUFvQixDQUFuQztrQkFDRSxJQUFBLEdBQU87a0JBQ1AsTUFBQSxHQUFTO2tCQUNULGVBQUEsR0FBa0IsRUFIcEI7O2dCQUlBLFVBQUEsR0FSRztlQUFBLE1BQUE7Z0JBV0gsRUFBQSxHQUFLLEtBQUMsQ0FBQSxRQUFTLENBQUEsRUFBRSxDQUFDLElBQUgsR0FBVSxVQUFWLENBQXFCLENBQUMsTUFBaEMsQ0FBdUMsU0FBUyxDQUFDLFFBQVMsQ0FBQSxFQUFFLENBQUMsU0FBSCxDQUExRDtnQkFDTCxJQUFHLENBQUksSUFBSixJQUFZLENBQUMsSUFBSSxDQUFDLFdBQUwsS0FBb0IsS0FBQyxDQUFBLFFBQVMsQ0FBQSxFQUFFLENBQUMsSUFBSCxHQUFVLFVBQVYsQ0FBcUIsQ0FBQyxHQUFwRCxJQUE0RCxFQUFFLENBQUMsSUFBaEUsQ0FBZjtrQkFDRSxJQUFBLEdBQU8sRUFBRSxDQUFDO2tCQUNWLElBQUcsRUFBRSxDQUFDLGVBQU47b0JBQ0UsZUFBQSxHQUFrQixFQUFFLENBQUMsZUFBZSxDQUFDO29CQUNyQyxjQUFBLEdBQWtCLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FGdkM7O2tCQUdBLE1BQUEsR0FBUyxHQUxYOztnQkFNQSxRQUFBLEdBQVcsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsRUFBRSxDQUFDLFFBQW5CLEVBbEJSOztZQWpCSjtVQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7QUFETCxlQUFBLDRDQUFBOztlQUNNO0FBRE4sV0FERjtTQUFBLE1BQUE7VUF3Q0UsT0FBTyxDQUFDLEdBQVIsQ0FBWSxVQUFaO0FBQ0EsZ0JBQVUsSUFBQSxLQUFBLENBQU0sb0JBQU4sRUF6Q1o7U0FERjs7TUE0Q0EsSUFBRyxNQUFBLElBQVcsTUFBTSxDQUFDLElBQVAsS0FBaUIsR0FBNUIsSUFBb0MsZUFBcEMsSUFBd0QsY0FBM0Q7UUFDRSxlQUFBLEdBQ0U7VUFBQSxHQUFBLEVBQUssZUFBTDtVQUNBLElBQUEsRUFBTSxjQUROO1VBRko7O2FBS0E7UUFBQSxJQUFBLEVBQU0sSUFBTjtRQUNBLFFBQUEsRUFBVSxRQURWO1FBRUEsZUFBQSxFQUFpQixlQUZqQjs7SUE5RE07OzZCQWtFUixNQUFBLEdBQVEsU0FBQyxDQUFELEVBQUksSUFBSixFQUFVLEdBQVY7QUFDTixVQUFBO01BQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBVCxDQUFtQixJQUFuQjtNQUNOLElBQUcsQ0FBQSxLQUFLLElBQUMsQ0FBQSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQXhCO1FBQ0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUFMLENBQWlCLEdBQWpCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBQyxDQUFBLEdBQUcsQ0FBQyxZQUFMLENBQWtCLEdBQWxCLEVBQXVCLElBQUMsQ0FBQSxHQUFHLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBdkMsRUFIRjs7TUFLQSxLQUFBLEdBQVksSUFBQSxjQUFBLENBQWUsR0FBZixFQUFvQixLQUFwQixFQUEyQixHQUEzQjtNQUNaLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixLQUF2QjthQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsVUFBVyxDQUFBLENBQUE7SUFUVjs7NkJBV1IsTUFBQSxHQUFRLFNBQUMsQ0FBRDtNQUNOLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixJQUFDLENBQUEsR0FBRyxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQWpDO01BQ0EsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFiLENBQUE7TUFDQSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBaUIsQ0FBakIsRUFBb0IsQ0FBcEI7YUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLFVBQVcsQ0FBQSxDQUFBLEdBQUUsQ0FBRjtJQUpWOzs2QkFNUixJQUFBLEdBQU0sU0FBQyxTQUFELEVBQVksSUFBWjtBQUNKLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBVCxDQUFIO0FBQ0UsZUFBTztVQUFBLEtBQUEsRUFBTyxDQUFQO1VBQVUsVUFBQSxFQUFZLElBQXRCO1VBRFQ7O01BR0EsSUFBRyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsU0FBbkIsQ0FBSDtBQUNFLGVBQU87VUFBQSxLQUFBLEVBQU8sQ0FBQSxHQUFFLENBQVQ7VUFBWSxVQUFBLEVBQVksSUFBeEI7VUFEVDs7TUFHQSxHQUFBLEdBQU0sU0FBUyxDQUFDO01BQ2hCLElBQUcsYUFBTyxJQUFDLENBQUEsUUFBUixFQUFBLEdBQUEsTUFBSDtBQUNFLGVBQU8sSUFBQyxDQUFBLFFBQVMsQ0FBQSxHQUFBLEVBRG5COztNQUdBLElBQUcsSUFBQSxLQUFRLE1BQVg7UUFDRSxJQUFBLEdBQU8sT0FEVDs7TUFFQSxJQUFHLElBQUEsSUFBUSxDQUFYO0FBQ0UsZUFBTyxFQURUOztNQUdBLE1BQUEsR0FBUztNQUNULGFBQUEsR0FBZ0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQ7aUJBQ2QsTUFBQSxHQUFTLEtBQUMsQ0FBQSxRQUFRLENBQUMsTUFBbkIsSUFDQSxNQUFBLEdBQVMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUQ1QixJQUVBLEtBQUMsQ0FBQSxRQUFTLENBQUEsTUFBQSxDQUFPLENBQUMsT0FBbEIsQ0FBMEIsU0FBUyxDQUFDLFFBQVMsQ0FBQSxNQUFBLENBQTdDO1FBSGM7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0FBSWhCLGFBQU0sYUFBQSxDQUFjLE1BQWQsQ0FBTjtRQUNFLE1BQUE7TUFERjtNQUdBLEVBQUEsR0FBUyxJQUFBLFdBQUEsQ0FBWSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsR0FBdUIsTUFBbkMsRUFBMkMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFuQixHQUE0QixDQUE1QixHQUFnQyxNQUEzRTtNQUNULENBQUEsR0FBUyxJQUFBLFdBQUEsQ0FBWSxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsQ0FBbkIsR0FBdUIsTUFBbkMsRUFBMkMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFuQixHQUE0QixDQUE1QixHQUFnQyxNQUEzRTtNQUNULEVBQUUsQ0FBQyxHQUFILENBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiO01BRUEsR0FBQSxHQUFNO01BR04sSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQW5CLEdBQTRCLE1BQTVCLEdBQXFDLENBQXhDO0FBQ0UsYUFBUyxpSEFBVDtVQUNFLEVBQUUsQ0FBQyxHQUFILENBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxHQUFiO1VBQ0EsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFOLEVBQVMsQ0FBVCxFQUFZLENBQUEsR0FBRSxDQUFkO1VBQ0EsR0FBQSxJQUFPLFNBQVMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxHQUFJLE1BQUosQ0FBVyxDQUFDO0FBSHhDLFNBREY7O01BS0EsSUFBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQW5CLEdBQTRCLE1BQTVCLEdBQXFDLENBQXhDO1FBQ0UsRUFBRSxDQUFDLEdBQUgsQ0FBTyxDQUFQLEVBQVUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFuQixHQUE0QixNQUF0QyxFQUE4QyxHQUE5QztRQUNBLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBTixFQUFTLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBbkIsR0FBNEIsTUFBckMsRUFBNkMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFuQixHQUE0QixDQUE1QixHQUFnQyxNQUE3RSxFQUZGOztNQUlBLEdBQUEsR0FBTTtNQUdOLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLE1BQW5CLEdBQTRCLENBQS9CO0FBQ0UsYUFBUyxpSEFBVDtVQUNFLEVBQUUsQ0FBQyxHQUFILENBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxHQUFiO1VBQ0EsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFOLEVBQVMsQ0FBVCxFQUFZLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBQSxHQUFNLENBQUMsQ0FBQyxHQUFwQjtVQUNBLEdBQUEsSUFBTyxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsR0FBSSxNQUFKLENBQVcsQ0FBQztBQUgvQixTQURGOztNQUtBLElBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLE1BQXRCO1FBQ0UsRUFBRSxDQUFDLEdBQUgsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsR0FBbUIsTUFBMUIsRUFBa0MsQ0FBbEMsRUFBcUMsR0FBckM7UUFDQSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixNQUF6QixFQUFpQyxDQUFqQyxFQUFvQyxDQUFDLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixDQUFuQixHQUF1QixNQUF4QixDQUFBLEdBQWdDLENBQUMsQ0FBQyxHQUF0RSxFQUZGOztNQUlBLFFBQUEsR0FBVyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxHQUFQO0FBQ1QsY0FBQTtVQUFBLElBQUcsRUFBRSxDQUFDLEdBQUgsQ0FBTyxDQUFQLEVBQVUsQ0FBVixDQUFBLEtBQWtCLE1BQXJCO0FBQ0UsbUJBQU8sRUFBRSxDQUFDLEdBQUgsQ0FBTyxDQUFQLEVBQVUsQ0FBVixFQURUOztVQUVBLElBQUcsR0FBQSxLQUFPLE1BQVY7WUFDRSxHQUFBLEdBQU0sQ0FBQSxHQUFFLEVBRFY7O1VBRUEsSUFBRyxHQUFBLElBQU8sQ0FBVjtBQUNFLG1CQUFPLENBQUEsR0FBRSxFQURYOztVQUdBLEdBQUEsR0FBVTtVQUNWLEtBQUEsR0FBVTtVQUNWLE9BQUEsR0FBVSxLQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsR0FBSSxDQUFKLEdBQVEsTUFBUixDQUFlLENBQUMsSUFBMUIsQ0FBZ0MsU0FBUyxDQUFDLFFBQVMsQ0FBQSxDQUFBLEdBQUksQ0FBSixHQUFRLE1BQVIsQ0FBbkQsRUFBb0UsS0FBcEUsQ0FBMEUsQ0FBQztVQUNyRixLQUFBLEdBQVU7VUFDVixJQUFHLE9BQUEsR0FBVSxLQUFWLElBQW9CLE9BQUEsR0FBVSxDQUFWLEdBQWMsS0FBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLEdBQUksQ0FBSixHQUFRLE1BQVIsQ0FBZSxDQUFDLElBQTFCLEdBQWlDLFNBQVMsQ0FBQyxRQUFTLENBQUEsQ0FBQSxHQUFJLENBQUosR0FBUSxNQUFSLENBQWUsQ0FBQyxJQUF6RztZQUNFLEtBQUEsR0FBUSxLQURWOztVQUVBLEdBQUEsR0FBTSxRQUFBLENBQVMsQ0FBQSxHQUFFLENBQVgsRUFBYyxDQUFBLEdBQUUsQ0FBaEIsRUFBbUIsS0FBQSxHQUFRLE9BQTNCLENBQUEsR0FBc0M7VUFDNUMsSUFBQSxHQUFPLENBQUMsQ0FBQyxNQUFGLENBQVMsQ0FBQSxHQUFFLENBQVgsRUFBYyxDQUFBLEdBQUUsQ0FBaEI7VUFFUCxJQUFBLENBQU8sS0FBUDtZQUNFLEtBQUEsR0FBUSxRQUFBLENBQVMsQ0FBQSxHQUFFLENBQVgsRUFBYyxDQUFkLEVBQWlCLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLEdBQWQsQ0FBQSxHQUFxQixLQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLEdBQUksTUFBSixDQUFXLENBQUMsSUFBNUQsQ0FBQSxHQUFvRSxLQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLEdBQUksTUFBSixDQUFXLENBQUM7WUFDbEcsSUFBRyxLQUFBLEdBQVEsR0FBWDtjQUNFLElBQUEsR0FBUSxDQUFDLENBQUMsTUFBRixDQUFTLENBQUEsR0FBRSxDQUFYLEVBQWMsQ0FBZDtjQUNSLEdBQUEsR0FBUSxNQUZWOztZQUlBLEtBQUEsR0FBUSxRQUFBLENBQVMsQ0FBVCxFQUFZLENBQUEsR0FBRSxDQUFkLEVBQWlCLElBQUksQ0FBQyxHQUFMLENBQVMsR0FBVCxFQUFjLEdBQWQsQ0FBQSxHQUFxQixTQUFTLENBQUMsUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLEdBQUksTUFBSixDQUFXLENBQUMsSUFBckUsQ0FBQSxHQUE2RSxTQUFTLENBQUMsUUFBUyxDQUFBLENBQUEsR0FBRSxDQUFGLEdBQUksTUFBSixDQUFXLENBQUM7WUFDcEgsSUFBRyxLQUFBLEdBQVEsR0FBWDtjQUNFLElBQUEsR0FBUSxDQUFDLENBQUMsTUFBRixDQUFTLENBQVQsRUFBWSxDQUFBLEdBQUUsQ0FBZDtjQUNSLEdBQUEsR0FBUSxNQUZWO2FBUEY7O1VBV0EsSUFBRyxHQUFBLElBQU8sR0FBVjtZQUNFLEdBQUEsR0FBTSxDQUFBLEdBQUUsRUFEVjs7VUFHQSxFQUFFLENBQUMsR0FBSCxDQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsR0FBYjtVQUNBLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBTixFQUFTLENBQVQsRUFBWSxJQUFaO2lCQUNBO1FBakNTO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtNQW1DWCxLQUFBLEdBQVEsUUFBQSxDQUFTLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixHQUFtQixNQUE1QixFQUFvQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQW5CLEdBQTRCLE1BQWhFLEVBQXdFLElBQXhFO01BQ1IsVUFBQSxHQUFhO01BRWIsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLE1BQTVCLEVBQW9DLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBbkIsR0FBNEIsTUFBaEU7TUFDTixFQUFBLEdBQU0sSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLEdBQW1CLENBQW5CLEdBQXVCO01BQzdCLEVBQUEsR0FBTSxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQW5CLEdBQTRCLENBQTVCLEdBQWdDO0FBRXRDLGFBQU0sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxHQUFULENBQUEsS0FBbUIsTUFBekI7UUFDRSxJQUFBLEdBQVEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxHQUFUO1FBQ1IsRUFBQSxHQUFRLENBQUMsQ0FBQyxRQUFGLENBQVcsSUFBWDtRQUNSLEVBQUEsR0FBUSxFQUFFLENBQUMsQ0FBSCxHQUFPO1FBQ2YsRUFBQSxHQUFRLEVBQUUsQ0FBQyxDQUFILEdBQU87UUFFZixJQUFHLEVBQUEsS0FBTSxFQUFUO1VBQ0UsVUFBVSxDQUFDLE9BQVgsQ0FDRTtZQUFBLElBQUEsRUFBTSxHQUFOO1lBQ0EsU0FBQSxFQUFXLEVBQUEsR0FBSyxNQURoQjtZQUVBLEdBQUEsRUFBSyxFQUFBLEdBQUssQ0FBTCxHQUFTLE1BRmQ7V0FERixFQURGO1NBQUEsTUFLSyxJQUFHLEVBQUEsS0FBTSxFQUFUO1VBQ0gsVUFBVSxDQUFDLE9BQVgsQ0FDRTtZQUFBLElBQUEsRUFBTSxHQUFOO1lBQ0EsSUFBQSxFQUFNLEVBQUEsR0FBSyxNQURYO1dBREYsRUFERztTQUFBLE1BQUE7VUFLSCxFQUFBLEdBQUssSUFBQyxDQUFBLFFBQVMsQ0FBQSxFQUFBLEdBQUssTUFBTCxDQUFZLENBQUMsSUFBdkIsQ0FBNEIsU0FBUyxDQUFDLFFBQVMsQ0FBQSxFQUFBLEdBQUssTUFBTCxDQUEvQyxDQUE0RCxDQUFDO1VBQ2xFLElBQUcsRUFBQSxJQUFPLEVBQUUsQ0FBQyxNQUFiO1lBQ0UsVUFBVSxDQUFDLE9BQVgsQ0FDRTtjQUFBLElBQUEsRUFBTSxHQUFOO2NBQ0EsSUFBQSxFQUFNLEVBQUEsR0FBSyxNQURYO2NBRUEsU0FBQSxFQUFXLEVBQUEsR0FBSyxNQUZoQjthQURGLEVBREY7V0FORzs7UUFXTCxHQUFBLEdBQU07UUFDTixFQUFBLEdBQU07UUFDTixFQUFBLEdBQU07TUF4QlI7TUEwQkEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxHQUFBLENBQVYsR0FDRTtRQUFBLEtBQUEsRUFBTyxLQUFQO1FBQ0EsVUFBQSxFQUFZLFVBRFo7O2FBR0YsSUFBQyxDQUFBLFFBQVMsQ0FBQSxHQUFBO0lBNUhOOzs2QkE4SE4sT0FBQSxHQUFTLFNBQUMsU0FBRDthQUNQLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixTQUFTLENBQUMsR0FBM0I7SUFETzs7NkJBR1QsaUJBQUEsR0FBbUIsU0FBQyxTQUFEO2FBQ2pCLElBQUMsQ0FBQSxNQUFELElBQ0EsU0FBUyxDQUFDLE1BRFYsSUFFQSxJQUFDLENBQUEsT0FBRCxLQUFjLFNBQVMsQ0FBQyxPQUZ4QixJQUdBLElBQUMsQ0FBQSxTQUFELEtBQWdCLFNBQVMsQ0FBQyxTQUgxQixJQUlBLElBQUMsQ0FBQSxTQUFELEtBQWMsTUFKZCxJQUtBLElBQUMsQ0FBQSxTQUFELEtBQWMsa0JBTGQsSUFNQSxJQUFDLENBQUEsT0FBRCxLQUFZLEdBTlosSUFPQSxDQUFDLElBQUMsQ0FBQSxPQUFELEtBQVksS0FBWixJQUFzQixDQUFJLElBQUMsQ0FBQSxHQUFHLENBQUMsV0FBTCxDQUFpQixTQUFTLENBQUMsR0FBM0IsQ0FBM0I7SUFSaUI7OzZCQVVuQixVQUFBLEdBQVksU0FBQTtNQUNWLElBQUcsSUFBQyxDQUFBLEdBQUcsQ0FBQyxTQUFSO0FBQ0UsZUFBTyxJQUFDLENBQUEsR0FBRyxDQUFDLFVBRGQ7T0FBQSxNQUFBO0FBR0UsZUFBTyxJQUFDLENBQUEsU0FIVjs7SUFEVTs7NkJBTVosVUFBQSxHQUFZLFNBQUE7TUFDVixNQUFPLENBQUEsSUFBQyxDQUFBLElBQUQsQ0FBUCxHQUFnQjtNQUNoQixJQUFDLENBQUEsUUFBRCxJQUFjLElBQUMsQ0FBQSxRQUFRLENBQUMsT0FBVixDQUFrQixTQUFDLENBQUQ7ZUFDOUIsQ0FBQyxDQUFDLFVBQUYsQ0FBQTtNQUQ4QixDQUFsQjtJQUZKOzs7OztBQTdRZCIsInNvdXJjZXNDb250ZW50IjpbIiMgVGhpcyBmaWxlIGluY29ycG9yYXRlcyBjb2RlIGZyb20gW21hcmttb25dKGh0dHBzOi8vZ2l0aHViLmNvbS95eWpoYW8vbWFya21vbilcbiMgY292ZXJlZCBieSB0aGUgZm9sbG93aW5nIHRlcm1zOlxuI1xuIyBDb3B5cmlnaHQgKGMpIDIwMTQsIFlhbyBZdWppYW4sIGh0dHA6Ly95anlhby5jb21cbiNcbiMgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuIyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4jIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuIyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiNcbiMgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiMgYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4jXG4jIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiMgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4jIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuIyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4jIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4jIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiMgVEhFIFNPRlRXQVJFLlxuXCJ1c2Ugc3RyaWN0XCJcblxuVHdvRGltQXJyYXkgPSByZXF1aXJlICcuL3R3by1kaW0tYXJyYXknXG5cbmN1ckhhc2ggPSAwXG5oYXNoVG8gID0ge31cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBXcmFwcGVkRG9tVHJlZVxuICAjIEBwYXJhbSBkb20gQSBET00gZWxlbWVudCBvYmplY3RcbiAgIyAgICBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvZWxlbWVudFxuICAjIEBwYXJhbSBjbG9uZSBCb29sZWFuIGZsYWcgaW5kaWNhdGluZyBpZiB0aGlzIGlzIHRoZSBET00gdHJlZSB0byBtb2RpZnlcbiAgIyBAcGFyYW0gcmVwIFdyYXBwZWREb21UcmVlIG9mIGEgRE9NIGVsZW1lbnQgbm9kZSBpbiBkb21cbiAgY29uc3RydWN0b3I6IChkb20sIGNsb25lLCByZXApIC0+XG4gICAgaWYgY2xvbmVcbiAgICAgIEBzaG93blRyZWUgID0gbmV3IFdyYXBwZWREb21UcmVlIGRvbSwgZmFsc2UsIHRoaXNcbiAgICAgIEBkb20gICAgICAgID0gZG9tLmNsb25lTm9kZSB0cnVlXG4gICAgZWxzZVxuICAgICAgQGRvbSA9IGRvbVxuICAgICAgQHJlcCA9IHJlcFxuXG4gICAgQGNsb25lICAgICAgICA9IGNsb25lXG4gICAgQGhhc2ggICAgICAgICA9IGN1ckhhc2grK1xuICAgIGhhc2hUb1tAaGFzaF0gPSB0aGlzXG4gICAgQGlzVGV4dCAgICAgICA9IGRvbS5ub2RlVHlwZSBpcyAzXG4gICAgQHRhZ05hbWUgICAgICA9IGRvbS50YWdOYW1lXG4gICAgQGNsYXNzTmFtZSAgICA9IGRvbS5jbGFzc05hbWVcbiAgICBAdGV4dERhdGEgICAgID0gZG9tLmRhdGFcbiAgICBAZGlmZkhhc2ggICAgID0ge31cblxuICAgIGlmIEBpc1RleHRcbiAgICAgIEBzaXplID0gMVxuICAgIGVsc2VcbiAgICAgIHJlcCA9IEByZXBcbiAgICAgIEBjaGlsZHJlbiA9IFtdLm1hcC5jYWxsIEBkb20uY2hpbGROb2RlcywgKGRvbSwgaW5kKSAtPlxuICAgICAgICBuZXcgV3JhcHBlZERvbVRyZWUoZG9tLCBmYWxzZSwgaWYgcmVwIHRoZW4gcmVwLmNoaWxkcmVuW2luZF0gZWxzZSBudWxsKVxuICAgICAgQHNpemUgPSBpZiBAY2hpbGRyZW4ubGVuZ3RoIHRoZW4gQGNoaWxkcmVuLnJlZHVjZSAoIChwcmV2LCBjdXIpIC0+XG4gICAgICAgIHByZXYgKyBjdXIuc2l6ZSApLCAwIGVsc2UgMFxuICAgICAgdW5sZXNzIEBzaXplXG4gICAgICAgIEBzaXplID0gMVxuXG4gICMgQHBhcmFtIG90aGVyVHJlZSBXcmFwcGVkRG9tVHJlZSBvZiBhIERPTSBlbGVtZW50IHRvIGRpZmYgYWdhaW5zdFxuICBkaWZmVG86IChvdGhlclRyZWUpIC0+XG4gICAgaWYgQGNsb25lXG4gICAgICByZXR1cm4gQHNob3duVHJlZS5kaWZmVG8gb3RoZXJUcmVlXG5cbiAgICBkaWZmICAgICAgICA9IEByZXAuZGlmZiBvdGhlclRyZWVcbiAgICBzY29yZSAgICAgICA9IGRpZmYuc2NvcmVcbiAgICBvcGVyYXRpb25zICA9IGRpZmYub3BlcmF0aW9uc1xuICAgIGluZGV4U2hpZnQgID0gMFxuICAgIGluc2VydGVkICAgID0gW11cblxuICAgICMgRm9yY2UgdmFyaWFibGVzIHRvIGxlYWsgdG8gZGlmZlRvIHNjb3BlXG4gICAgW2xhc3QsIHBvc3NpYmxlUmVwbGFjZSwgciwgbGFzdE9wLCBsYXN0RWxtRGVsZXRlZCwgbGFzdEVsbUluc2VydGVkXSA9IFtdXG5cbiAgICBpZiBvcGVyYXRpb25zXG4gICAgICBpZiBvcGVyYXRpb25zIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgZm9yIG9wIGluIG9wZXJhdGlvbnNcbiAgICAgICAgICBkbyAob3ApID0+XG4gICAgICAgICAgICBpZiBvcC50eXBlIGlzIFwiZFwiXG4gICAgICAgICAgICAgIHBvc3NpYmxlTGFzdERlbGV0ZWQgPSBAY2hpbGRyZW5bb3AudHJlZSArIGluZGV4U2hpZnRdLmRvbVxuICAgICAgICAgICAgICByID0gQHJlbW92ZSBvcC50cmVlICsgaW5kZXhTaGlmdFxuICAgICAgICAgICAgICBAcmVwLnJlbW92ZSBvcC50cmVlICsgaW5kZXhTaGlmdFxuICAgICAgICAgICAgICBpZiBub3QgbGFzdCBvciBsYXN0Lm5leHRTaWJsaW5nIGlzIHIgb3IgbGFzdCBpcyByXG4gICAgICAgICAgICAgICAgbGFzdCA9IHJcbiAgICAgICAgICAgICAgICAjIFVuZGVmaW5lZCBlcnJvcnMgY2FuIGJlIHRocm93IHNvIHdlIGFkZCBhIGNvbmRpdGlvbiBvbiBsYXN0T3BcbiAgICAgICAgICAgICAgICAjIGJlaW5nIGRlZmluZWRcbiAgICAgICAgICAgICAgICBpZiBsYXN0IGFuZCBsYXN0T3AgYW5kIG9wLnRyZWUgaXMgbGFzdE9wLnBvc1xuICAgICAgICAgICAgICAgICAgbGFzdEVsbURlbGV0ZWQgPSBwb3NzaWJsZUxhc3REZWxldGVkXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgbGFzdEVsbURlbGV0ZWQgID0gbnVsbFxuICAgICAgICAgICAgICAgICAgbGFzdEVsbUluc2VydGVkID0gbnVsbFxuICAgICAgICAgICAgICAgIGxhc3RPcCA9IG9wXG4gICAgICAgICAgICAgIGluZGV4U2hpZnQtLVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2UgaWYgb3AudHlwZSBpcyBcImlcIlxuICAgICAgICAgICAgICBAcmVwLmluc2VydCBvcC5wb3MgKyBpbmRleFNoaWZ0LCBvdGhlclRyZWUuY2hpbGRyZW5bb3Aub3RoZXJUcmVlXVxuICAgICAgICAgICAgICByID0gQGluc2VydCBvcC5wb3MgKyBpbmRleFNoaWZ0LCBvdGhlclRyZWUuY2hpbGRyZW5bb3Aub3RoZXJUcmVlXSwgQHJlcC5jaGlsZHJlbltvcC5wb3MgKyBpbmRleFNoaWZ0XVxuICAgICAgICAgICAgICBpbnNlcnRlZC5wdXNoKHIpXG4gICAgICAgICAgICAgIGlmIG5vdCBsYXN0IG9yIGxhc3QubmV4dFNpYmxpbmcgaXMgclxuICAgICAgICAgICAgICAgIGxhc3QgPSByXG4gICAgICAgICAgICAgICAgbGFzdE9wID0gb3BcbiAgICAgICAgICAgICAgICBsYXN0RWxtSW5zZXJ0ZWQgPSByXG4gICAgICAgICAgICAgIGluZGV4U2hpZnQrK1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmUgPSBAY2hpbGRyZW5bb3AudHJlZSArIGluZGV4U2hpZnRdLmRpZmZUbyBvdGhlclRyZWUuY2hpbGRyZW5bb3Aub3RoZXJUcmVlXVxuICAgICAgICAgICAgICBpZiBub3QgbGFzdCBvciAobGFzdC5uZXh0U2libGluZyBpcyBAY2hpbGRyZW5bb3AudHJlZSArIGluZGV4U2hpZnRdLmRvbSBhbmQgcmUubGFzdClcbiAgICAgICAgICAgICAgICBsYXN0ID0gcmUubGFzdFxuICAgICAgICAgICAgICAgIGlmIHJlLnBvc3NpYmxlUmVwbGFjZVxuICAgICAgICAgICAgICAgICAgbGFzdEVsbUluc2VydGVkID0gcmUucG9zc2libGVSZXBsYWNlLmN1clxuICAgICAgICAgICAgICAgICAgbGFzdEVsbURlbGV0ZWQgID0gcmUucG9zc2libGVSZXBsYWNlLnByZXZcbiAgICAgICAgICAgICAgICBsYXN0T3AgPSBvcFxuICAgICAgICAgICAgICBpbnNlcnRlZCA9IGluc2VydGVkLmNvbmNhdCByZS5pbnNlcnRlZFxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2cgb3BlcmF0aW9uc1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCJpbnZhbGlkIG9wZXJhdGlvbnNcIlxuXG4gICAgaWYgbGFzdE9wIGFuZCBsYXN0T3AudHlwZSBpc250ICdpJyBhbmQgbGFzdEVsbUluc2VydGVkIGFuZCBsYXN0RWxtRGVsZXRlZFxuICAgICAgcG9zc2libGVSZXBsYWNlID1cbiAgICAgICAgY3VyOiBsYXN0RWxtSW5zZXJ0ZWRcbiAgICAgICAgcHJldjogbGFzdEVsbURlbGV0ZWRcblxuICAgIGxhc3Q6IGxhc3RcbiAgICBpbnNlcnRlZDogaW5zZXJ0ZWRcbiAgICBwb3NzaWJsZVJlcGxhY2U6IHBvc3NpYmxlUmVwbGFjZVxuXG4gIGluc2VydDogKGksIHRyZWUsIHJlcCkgLT5cbiAgICBkb20gPSB0cmVlLmRvbS5jbG9uZU5vZGUgdHJ1ZVxuICAgIGlmIGkgaXMgQGRvbS5jaGlsZE5vZGVzLmxlbmd0aFxuICAgICAgQGRvbS5hcHBlbmRDaGlsZCBkb21cbiAgICBlbHNlXG4gICAgICBAZG9tLmluc2VydEJlZm9yZSBkb20sIEBkb20uY2hpbGROb2Rlc1tpXVxuXG4gICAgY3RyZWUgPSBuZXcgV3JhcHBlZERvbVRyZWUgZG9tLCBmYWxzZSwgcmVwXG4gICAgQGNoaWxkcmVuLnNwbGljZSBpLCAwLCBjdHJlZVxuICAgIEBkb20uY2hpbGROb2Rlc1tpXVxuXG4gIHJlbW92ZTogKGkpIC0+XG4gICAgQGRvbS5yZW1vdmVDaGlsZCBAZG9tLmNoaWxkTm9kZXNbaV1cbiAgICBAY2hpbGRyZW5baV0ucmVtb3ZlU2VsZigpXG4gICAgQGNoaWxkcmVuLnNwbGljZSBpLCAxXG4gICAgQGRvbS5jaGlsZE5vZGVzW2ktMV1cblxuICBkaWZmOiAob3RoZXJUcmVlLCB0bWF4KSAtPlxuICAgIGlmIEBlcXVhbFRvIG90aGVyVHJlZVxuICAgICAgcmV0dXJuIHNjb3JlOiAwLCBvcGVyYXRpb25zOiBudWxsXG5cbiAgICBpZiBAY2Fubm90UmVwbGFjZVdpdGggb3RoZXJUcmVlXG4gICAgICByZXR1cm4gc2NvcmU6IDEvMCwgb3BlcmF0aW9uczogbnVsbFxuXG4gICAga2V5ID0gb3RoZXJUcmVlLmhhc2hcbiAgICBpZiBrZXkgaW4gQGRpZmZIYXNoXG4gICAgICByZXR1cm4gQGRpZmZIYXNoW2tleV1cblxuICAgIGlmIHRtYXggaXMgdW5kZWZpbmVkXG4gICAgICB0bWF4ID0gMTAwMDAwXG4gICAgaWYgdG1heCA8PSAwXG4gICAgICByZXR1cm4gMFxuXG4gICAgb2Zmc2V0ID0gMFxuICAgIGZvcndhcmRTZWFyY2ggPSAob2Zmc2V0KSA9PlxuICAgICAgb2Zmc2V0IDwgQGNoaWxkcmVuLmxlbmd0aCBhbmRcbiAgICAgIG9mZnNldCA8IG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggYW5kXG4gICAgICBAY2hpbGRyZW5bb2Zmc2V0XS5lcXVhbFRvIG90aGVyVHJlZS5jaGlsZHJlbltvZmZzZXRdXG4gICAgd2hpbGUgZm9yd2FyZFNlYXJjaChvZmZzZXQpXG4gICAgICBvZmZzZXQrK1xuXG4gICAgZHAgPSBuZXcgVHdvRGltQXJyYXkgQGNoaWxkcmVuLmxlbmd0aCArIDEgLSBvZmZzZXQsIG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggKyAxIC0gb2Zmc2V0XG4gICAgcCAgPSBuZXcgVHdvRGltQXJyYXkgQGNoaWxkcmVuLmxlbmd0aCArIDEgLSBvZmZzZXQsIG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggKyAxIC0gb2Zmc2V0XG4gICAgZHAuc2V0IDAsIDAsIDBcblxuICAgIHN1bSA9IDBcbiAgICAjIEJlY2F1c2UgY29mZmVzY3JpcHRzIGFsbG93cyBiaWRlcmN0aW9uYWwgbG9vcHMgd2UgbmVlZCB0aGlzIGNvbmRpdGlvblxuICAgICMgZ2F1cmQgdG8gcHJldmVudCBhIGRlY3JlYXNpbmcgYXJyYXkgbGlzdFxuICAgIGlmIG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggLSBvZmZzZXQgPiAxXG4gICAgICBmb3IgaSBpbiBbMS4uKG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggLSBvZmZzZXQgLSAxKV1cbiAgICAgICAgZHAuc2V0IDAsIGksIHN1bVxuICAgICAgICBwLnNldCAwLCBpLCBpLTFcbiAgICAgICAgc3VtICs9IG90aGVyVHJlZS5jaGlsZHJlbltpICsgb2Zmc2V0XS5zaXplXG4gICAgaWYgb3RoZXJUcmVlLmNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldCA+IDBcbiAgICAgIGRwLnNldCAwLCBvdGhlclRyZWUuY2hpbGRyZW4ubGVuZ3RoIC0gb2Zmc2V0LCBzdW1cbiAgICAgIHAuc2V0IDAsIG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggLSBvZmZzZXQsIG90aGVyVHJlZS5jaGlsZHJlbi5sZW5ndGggLSAxIC0gb2Zmc2V0XG5cbiAgICBzdW0gPSAwXG4gICAgIyBCZWNhdXNlIGNvZmZlc2NyaXB0cyBhbGxvd3MgYmlkZXJjdGlvbmFsIGxvb3BzIHdlIG5lZWQgdGhpcyBjb25kaXRpb25cbiAgICAjIGdhdXJkIHRvIHByZXZlbnQgYSBkZWNyZWFzaW5nIGFycmF5IGxpc3RcbiAgICBpZiBAY2hpbGRyZW4ubGVuZ3RoIC0gb2Zmc2V0ID4gMVxuICAgICAgZm9yIGkgaW4gWzEuLihAY2hpbGRyZW4ubGVuZ3RoIC0gb2Zmc2V0IC0gMSldXG4gICAgICAgIGRwLnNldCBpLCAwLCBzdW1cbiAgICAgICAgcC5zZXQgaSwgMCwgKGktMSkqcC5jb2xcbiAgICAgICAgc3VtICs9IEBjaGlsZHJlbltpICsgb2Zmc2V0XS5zaXplXG4gICAgaWYgQGNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldFxuICAgICAgZHAuc2V0IEBjaGlsZHJlbi5sZW5ndGggLSBvZmZzZXQsIDAsIHN1bVxuICAgICAgcC5zZXQgQGNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldCwgMCwgKEBjaGlsZHJlbi5sZW5ndGggLSAxIC0gb2Zmc2V0KSpwLmNvbFxuXG4gICAgZ2V0U2NvcmUgPSAoaSwgaiwgbWF4KSA9PlxuICAgICAgaWYgZHAuZ2V0KGksIGopIGlzbnQgdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBkcC5nZXQoaSwgailcbiAgICAgIGlmIG1heCBpcyB1bmRlZmluZWRcbiAgICAgICAgbWF4ID0gMS8wXG4gICAgICBpZiBtYXggPD0gMFxuICAgICAgICByZXR1cm4gMS8wXG5cbiAgICAgIHZhbCAgICAgPSBtYXhcbiAgICAgIGJvdW5kICAgPSBtYXhcbiAgICAgIHN1YmRpZmYgPSBAY2hpbGRyZW5baSAtIDEgKyBvZmZzZXRdLmRpZmYoIG90aGVyVHJlZS5jaGlsZHJlbltqIC0gMSArIG9mZnNldF0sIGJvdW5kKS5zY29yZVxuICAgICAgZm9yY2UgICA9IGZhbHNlXG4gICAgICBpZiBzdWJkaWZmIDwgYm91bmQgYW5kIHN1YmRpZmYgKyAxIDwgQGNoaWxkcmVuW2kgLSAxICsgb2Zmc2V0XS5zaXplICsgb3RoZXJUcmVlLmNoaWxkcmVuW2ogLSAxICsgb2Zmc2V0XS5zaXplXG4gICAgICAgIGZvcmNlID0gdHJ1ZVxuICAgICAgdmFsID0gZ2V0U2NvcmUoaS0xLCBqLTEsIGJvdW5kIC0gc3ViZGlmZikgKyBzdWJkaWZmXG4gICAgICBwcmV2ID0gcC5nZXRJbmQgaS0xLCBqLTFcblxuICAgICAgdW5sZXNzIGZvcmNlXG4gICAgICAgIG90aGVyID0gZ2V0U2NvcmUoaS0xLCBqLCBNYXRoLm1pbih2YWwsIG1heCkgLSBAY2hpbGRyZW5baS0xK29mZnNldF0uc2l6ZSkgKyBAY2hpbGRyZW5baS0xK29mZnNldF0uc2l6ZVxuICAgICAgICBpZiBvdGhlciA8IHZhbFxuICAgICAgICAgIHByZXYgID0gcC5nZXRJbmQgaS0xLCBqXG4gICAgICAgICAgdmFsICAgPSBvdGhlclxuXG4gICAgICAgIG90aGVyID0gZ2V0U2NvcmUoaSwgai0xLCBNYXRoLm1pbih2YWwsIG1heCkgLSBvdGhlclRyZWUuY2hpbGRyZW5bai0xK29mZnNldF0uc2l6ZSkgKyBvdGhlclRyZWUuY2hpbGRyZW5bai0xK29mZnNldF0uc2l6ZVxuICAgICAgICBpZiBvdGhlciA8IHZhbFxuICAgICAgICAgIHByZXYgID0gcC5nZXRJbmQgaSwgai0xXG4gICAgICAgICAgdmFsICAgPSBvdGhlclxuXG4gICAgICBpZiB2YWwgPj0gbWF4XG4gICAgICAgIHZhbCA9IDEvMFxuXG4gICAgICBkcC5zZXQgaSwgaiwgdmFsXG4gICAgICBwLnNldCBpLCBqLCBwcmV2XG4gICAgICB2YWxcblxuICAgIHNjb3JlID0gZ2V0U2NvcmUgQGNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldCwgb3RoZXJUcmVlLmNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldCwgdG1heFxuICAgIG9wZXJhdGlvbnMgPSBbXVxuXG4gICAgY3VyID0gcC5nZXRJbmQgQGNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldCwgb3RoZXJUcmVlLmNoaWxkcmVuLmxlbmd0aCAtIG9mZnNldFxuICAgIGNyICA9IEBjaGlsZHJlbi5sZW5ndGggLSAxIC0gb2Zmc2V0XG4gICAgY2MgID0gb3RoZXJUcmVlLmNoaWxkcmVuLmxlbmd0aCAtIDEgLSBvZmZzZXRcblxuICAgIHdoaWxlIHAucmF3R2V0KGN1cikgaXNudCB1bmRlZmluZWRcbiAgICAgIHByZXYgID0gcC5yYXdHZXQgY3VyXG4gICAgICByYyAgICA9IHAuZ2V0MkRJbmQgcHJldlxuICAgICAgcHIgICAgPSByYy5yIC0gMVxuICAgICAgcGMgICAgPSByYy5jIC0gMVxuXG4gICAgICBpZiBwciBpcyBjclxuICAgICAgICBvcGVyYXRpb25zLnVuc2hpZnRcbiAgICAgICAgICB0eXBlOiBcImlcIlxuICAgICAgICAgIG90aGVyVHJlZTogY2MgKyBvZmZzZXRcbiAgICAgICAgICBwb3M6IGNyICsgMSArIG9mZnNldFxuICAgICAgZWxzZSBpZiBwYyBpcyBjY1xuICAgICAgICBvcGVyYXRpb25zLnVuc2hpZnRcbiAgICAgICAgICB0eXBlOiBcImRcIlxuICAgICAgICAgIHRyZWU6IGNyICsgb2Zmc2V0XG4gICAgICBlbHNlXG4gICAgICAgIG9wID0gQGNoaWxkcmVuW2NyICsgb2Zmc2V0XS5kaWZmKG90aGVyVHJlZS5jaGlsZHJlbltjYyArIG9mZnNldF0pLm9wZXJhdGlvbnNcbiAgICAgICAgaWYgb3AgYW5kIG9wLmxlbmd0aFxuICAgICAgICAgIG9wZXJhdGlvbnMudW5zaGlmdFxuICAgICAgICAgICAgdHlwZTogXCJyXCJcbiAgICAgICAgICAgIHRyZWU6IGNyICsgb2Zmc2V0XG4gICAgICAgICAgICBvdGhlclRyZWU6IGNjICsgb2Zmc2V0XG4gICAgICBjdXIgPSBwcmV2XG4gICAgICBjciAgPSBwclxuICAgICAgY2MgID0gcGNcblxuICAgIEBkaWZmSGFzaFtrZXldID1cbiAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgb3BlcmF0aW9uczogb3BlcmF0aW9uc1xuXG4gICAgQGRpZmZIYXNoW2tleV1cblxuICBlcXVhbFRvOiAob3RoZXJUcmVlKSAtPlxuICAgIEBkb20uaXNFcXVhbE5vZGUgb3RoZXJUcmVlLmRvbVxuXG4gIGNhbm5vdFJlcGxhY2VXaXRoOiAob3RoZXJUcmVlKSAtPlxuICAgIEBpc1RleHQgb3JcbiAgICBvdGhlclRyZWUuaXNUZXh0IG9yXG4gICAgQHRhZ05hbWUgaXNudCBvdGhlclRyZWUudGFnTmFtZSBvclxuICAgIEBjbGFzc05hbWUgaXNudCBvdGhlclRyZWUuY2xhc3NOYW1lIG9yXG4gICAgQGNsYXNzTmFtZSBpcyBcIm1hdGhcIiBvclxuICAgIEBjbGFzc05hbWUgaXMgXCJhdG9tLXRleHQtZWRpdG9yXCIgb3JcbiAgICBAdGFnTmFtZSBpcyBcIkFcIiBvclxuICAgIChAdGFnTmFtZSBpcyBcIklNR1wiIGFuZCBub3QgQGRvbS5pc0VxdWFsTm9kZShvdGhlclRyZWUuZG9tKSlcblxuICBnZXRDb250ZW50OiAtPlxuICAgIGlmIEBkb20ub3V0ZXJIVE1MXG4gICAgICByZXR1cm4gQGRvbS5vdXRlckhUTUxcbiAgICBlbHNlXG4gICAgICByZXR1cm4gQHRleHREYXRhXG5cbiAgcmVtb3ZlU2VsZjogLT5cbiAgICBoYXNoVG9bQGhhc2hdID0gbnVsbFxuICAgIEBjaGlsZHJlbiBhbmQgQGNoaWxkcmVuLmZvckVhY2ggKGMpIC0+XG4gICAgICBjLnJlbW92ZVNlbGYoKVxuICAgIHJldHVyblxuIl19