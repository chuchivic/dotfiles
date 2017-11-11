(function() {
  var InsertLinkView;

  InsertLinkView = require("../../lib/views/insert-link-view");

  describe("InsertLinkView", function() {
    var editor, insertLinkView, ref;
    ref = [], editor = ref[0], insertLinkView = ref[1];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.workspace.open("empty.markdown");
      });
      return runs(function() {
        insertLinkView = new InsertLinkView({});
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    describe(".insertLink", function() {
      it("insert inline link", function() {
        var link;
        insertLinkView.editor = {
          setTextInBufferRange: function() {
            return {};
          }
        };
        spyOn(insertLinkView.editor, "setTextInBufferRange");
        link = {
          text: "text",
          url: "http://"
        };
        insertLinkView.insertLink(link);
        return expect(insertLinkView.editor.setTextInBufferRange).toHaveBeenCalledWith(void 0, "[text](http://)");
      });
      it("insert reference link", function() {
        var link;
        spyOn(insertLinkView, "insertReferenceLink");
        link = {
          text: "text",
          title: "this is title",
          url: "http://"
        };
        insertLinkView.insertLink(link);
        return expect(insertLinkView.insertReferenceLink).toHaveBeenCalledWith(link);
      });
      return it("update reference link", function() {
        var link;
        insertLinkView.definitionRange = {};
        spyOn(insertLinkView, "updateReferenceLink");
        link = {
          text: "text",
          title: "this is title",
          url: "http://"
        };
        insertLinkView.insertLink(link);
        return expect(insertLinkView.updateReferenceLink).toHaveBeenCalledWith(link);
      });
    });
    describe(".updateReferenceLink", function() {
      beforeEach(function() {
        return atom.config.set("markdown-writer.referenceIndentLength", 2);
      });
      it("update reference and definition", function() {
        var link;
        insertLinkView.referenceId = "ABC123";
        insertLinkView.range = "Range";
        insertLinkView.definitionRange = "DRange";
        insertLinkView.editor = {
          setTextInBufferRange: function() {
            return {};
          }
        };
        spyOn(insertLinkView.editor, "setTextInBufferRange");
        link = {
          text: "text",
          title: "this is title",
          url: "http://"
        };
        insertLinkView.updateReferenceLink(link);
        expect(insertLinkView.editor.setTextInBufferRange.calls.length).toEqual(2);
        expect(insertLinkView.editor.setTextInBufferRange.calls[0].args).toEqual(["Range", "[text][ABC123]"]);
        return expect(insertLinkView.editor.setTextInBufferRange.calls[1].args).toEqual(["DRange", '  [ABC123]: http:// "this is title"']);
      });
      return it("update reference only if definition template is empty", function() {
        var link;
        atom.config.set("markdown-writer.referenceDefinitionTag", "");
        insertLinkView.referenceId = "ABC123";
        insertLinkView.range = "Range";
        insertLinkView.definitionRange = "DRange";
        insertLinkView.replaceReferenceLink = {};
        spyOn(insertLinkView, "replaceReferenceLink");
        link = {
          text: "text",
          title: "this is title",
          url: "http://"
        };
        insertLinkView.updateReferenceLink(link);
        return expect(insertLinkView.replaceReferenceLink).toHaveBeenCalledWith("[text][ABC123]");
      });
    });
    describe(".setLink", function() {
      return it("sets all the editors", function() {
        var link;
        link = {
          text: "text",
          title: "this is title",
          url: "http://"
        };
        insertLinkView.setLink(link);
        expect(insertLinkView.textEditor.getText()).toBe(link.text);
        expect(insertLinkView.titleEditor.getText()).toBe(link.title);
        return expect(insertLinkView.urlEditor.getText()).toBe(link.url);
      });
    });
    describe(".getSavedLink", function() {
      beforeEach(function() {
        return insertLinkView.links = {
          "oldstyle": {
            "title": "this is title",
            "url": "http://"
          },
          "newstyle": {
            "text": "NewStyle",
            "title": "this is title",
            "url": "http://"
          }
        };
      });
      it("return undefined if text does not exists", function() {
        return expect(insertLinkView.getSavedLink("notExists")).toEqual(void 0);
      });
      return it("return the link with text, title, url", function() {
        expect(insertLinkView.getSavedLink("oldStyle")).toEqual({
          "text": "oldStyle",
          "title": "this is title",
          "url": "http://"
        });
        return expect(insertLinkView.getSavedLink("newStyle")).toEqual({
          "text": "NewStyle",
          "title": "this is title",
          "url": "http://"
        });
      });
    });
    describe(".isInSavedLink", function() {
      beforeEach(function() {
        return insertLinkView.links = {
          "oldstyle": {
            "title": "this is title",
            "url": "http://"
          },
          "newstyle": {
            "text": "NewStyle",
            "title": "this is title",
            "url": "http://"
          }
        };
      });
      it("return false if the text does not exists", function() {
        return expect(insertLinkView.isInSavedLink({
          text: "notExists"
        })).toBe(false);
      });
      it("return false if the url does not match", function() {
        var link;
        link = {
          text: "oldStyle",
          title: "this is title",
          url: "anything"
        };
        return expect(insertLinkView.isInSavedLink(link)).toBe(false);
      });
      return it("return true", function() {
        var link;
        link = {
          text: "NewStyle",
          title: "this is title",
          url: "http://"
        };
        return expect(insertLinkView.isInSavedLink(link)).toBe(true);
      });
    });
    describe(".updateToLinks", function() {
      beforeEach(function() {
        return insertLinkView.links = {
          "oldstyle": {
            "title": "this is title",
            "url": "http://"
          },
          "newstyle": {
            "text": "NewStyle",
            "title": "this is title",
            "url": "http://"
          }
        };
      });
      it("saves the new link if it does not exists before and checkbox checked", function() {
        var link;
        insertLinkView.saveCheckbox.prop("checked", true);
        link = {
          text: "New Link",
          title: "this is title",
          url: "http://new.link"
        };
        expect(insertLinkView.updateToLinks(link)).toBe(true);
        return expect(insertLinkView.links["new link"]).toEqual(link);
      });
      it("does not save the new link if checkbox is unchecked", function() {
        var link;
        insertLinkView.saveCheckbox.prop("checked", false);
        link = {
          text: "New Link",
          title: "this is title",
          url: "http://new.link"
        };
        return expect(insertLinkView.updateToLinks(link)).toBe(false);
      });
      it("saves the link if it is modified and checkbox checked", function() {
        var link;
        insertLinkView.saveCheckbox.prop("checked", true);
        link = {
          text: "NewStyle",
          title: "this is new title",
          url: "http://"
        };
        expect(insertLinkView.updateToLinks(link)).toBe(true);
        return expect(insertLinkView.links["newstyle"]).toEqual(link);
      });
      it("does not saves the link if it is not modified and checkbox checked", function() {
        var link;
        insertLinkView.saveCheckbox.prop("checked", true);
        link = {
          text: "NewStyle",
          title: "this is title",
          url: "http://"
        };
        return expect(insertLinkView.updateToLinks(link)).toBe(false);
      });
      return it("removes the existed link if checkbox is unchecked", function() {
        var link;
        insertLinkView.saveCheckbox.prop("checked", false);
        link = {
          text: "NewStyle",
          title: "this is title",
          url: "http://"
        };
        expect(insertLinkView.updateToLinks(link)).toBe(true);
        return expect(insertLinkView.links["newstyle"]).toBe(void 0);
      });
    });
    return describe("integration", function() {
      beforeEach(function() {
        atom.config.set("markdown-writer.referenceIndentLength", 2);
        insertLinkView.fetchPosts = function() {
          return {};
        };
        insertLinkView.loadSavedLinks = function(cb) {
          return cb();
        };
        return insertLinkView._referenceLink = function(link) {
          link['indent'] = "  ";
          link['title'] = /^[-\*\!]$/.test(link.title) ? "" : link.title;
          link['label'] = insertLinkView.referenceId || 'GENERATED';
          return link;
        };
      });
      it("insert new link", function() {
        insertLinkView.display();
        insertLinkView.textEditor.setText("text");
        insertLinkView.urlEditor.setText("url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("[text](url)");
      });
      it("insert new link with text", function() {
        editor.setText("text");
        insertLinkView.display();
        insertLinkView.urlEditor.setText("url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("[text](url)");
      });
      it("insert new reference link", function() {
        insertLinkView.display();
        insertLinkView.textEditor.setText("text");
        insertLinkView.titleEditor.setText("title");
        insertLinkView.urlEditor.setText("url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("[text][GENERATED]\n\n  [GENERATED]: url \"title\"");
      });
      it("insert new reference link with text", function() {
        editor.setText("text");
        insertLinkView.display();
        insertLinkView.titleEditor.setText("*");
        insertLinkView.urlEditor.setText("url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("[text][GENERATED]\n\n  [GENERATED]: url \"\"");
      });
      it("insert reference link without definition", function() {
        atom.config.set("markdown-writer.referenceInlineTag", "<a title='{title}' href='{url}' target='_blank'>{text}</a>");
        atom.config.set("markdown-writer.referenceDefinitionTag", "");
        insertLinkView.display();
        insertLinkView.textEditor.setText("text");
        insertLinkView.titleEditor.setText("title");
        insertLinkView.urlEditor.setText("url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("<a title='title' href='url' target='_blank'>text</a>");
      });
      it("update inline link", function() {
        editor.setText("[text](url)");
        editor.selectAll();
        insertLinkView.display();
        expect(insertLinkView.textEditor.getText()).toEqual("text");
        expect(insertLinkView.urlEditor.getText()).toEqual("url");
        insertLinkView.textEditor.setText("new text");
        insertLinkView.urlEditor.setText("new url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("[new text](new url)");
      });
      it("update inline link to reference link", function() {
        editor.setText("[text](url)");
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertLinkView.display();
        expect(insertLinkView.textEditor.getText()).toEqual("text");
        expect(insertLinkView.urlEditor.getText()).toEqual("url");
        insertLinkView.textEditor.setText("new text");
        insertLinkView.titleEditor.setText("title");
        insertLinkView.urlEditor.setText("new url");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("[new text][GENERATED]\n\n  [GENERATED]: new url \"title\"");
      });
      it("update reference link to inline link", function() {
        editor.setText("[text][ABC123]\n\n[ABC123]: url \"title\"");
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertLinkView.display();
        expect(insertLinkView.textEditor.getText()).toEqual("text");
        expect(insertLinkView.titleEditor.getText()).toEqual("title");
        expect(insertLinkView.urlEditor.getText()).toEqual("url");
        insertLinkView.textEditor.setText("new text");
        insertLinkView.titleEditor.setText("");
        insertLinkView.urlEditor.setText("new url");
        insertLinkView.onConfirm();
        return expect(editor.getText().trim()).toBe("[new text](new url)");
      });
      it("update reference link to config reference link", function() {
        atom.config.set("markdown-writer.referenceInlineTag", "<a title='{title}' href='{url}' target='_blank'>{text}</a>");
        atom.config.set("markdown-writer.referenceDefinitionTag", "");
        editor.setText("[text][ABC123]\n\n[ABC123]: url \"title\"");
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertLinkView.display();
        expect(insertLinkView.textEditor.getText()).toEqual("text");
        expect(insertLinkView.titleEditor.getText()).toEqual("title");
        expect(insertLinkView.urlEditor.getText()).toEqual("url");
        insertLinkView.textEditor.setText("new text");
        insertLinkView.titleEditor.setText("new title");
        insertLinkView.urlEditor.setText("new url");
        insertLinkView.onConfirm();
        return expect(editor.getText().trim()).toBe("<a title='new title' href='new url' target='_blank'>new text</a>");
      });
      it("remove inline link", function() {
        editor.setText("[text](url)");
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertLinkView.display();
        expect(insertLinkView.textEditor.getText()).toEqual("text");
        expect(insertLinkView.urlEditor.getText()).toEqual("url");
        insertLinkView.urlEditor.setText("");
        insertLinkView.onConfirm();
        return expect(editor.getText()).toBe("text");
      });
      return it("remove reference link", function() {
        editor.setText("[text][ABC123]\n\n[ABC123]: url \"title\"");
        editor.setCursorBufferPosition([0, 0]);
        editor.selectToEndOfLine();
        insertLinkView.display();
        expect(insertLinkView.textEditor.getText()).toEqual("text");
        expect(insertLinkView.titleEditor.getText()).toEqual("title");
        expect(insertLinkView.urlEditor.getText()).toEqual("url");
        insertLinkView.urlEditor.setText("");
        insertLinkView.onConfirm();
        return expect(editor.getText().trim()).toBe("text");
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL3NwZWMvdmlld3MvaW5zZXJ0LWxpbmstdmlldy1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsY0FBQSxHQUFpQixPQUFBLENBQVEsa0NBQVI7O0VBRWpCLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBO0FBQ3pCLFFBQUE7SUFBQSxNQUEyQixFQUEzQixFQUFDLGVBQUQsRUFBUztJQUVULFVBQUEsQ0FBVyxTQUFBO01BQ1QsZUFBQSxDQUFnQixTQUFBO2VBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLGdCQUFwQjtNQUFILENBQWhCO2FBQ0EsSUFBQSxDQUFLLFNBQUE7UUFDSCxjQUFBLEdBQXFCLElBQUEsY0FBQSxDQUFlLEVBQWY7ZUFDckIsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUZOLENBQUw7SUFGUyxDQUFYO0lBTUEsUUFBQSxDQUFTLGFBQVQsRUFBd0IsU0FBQTtNQUN0QixFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtBQUN2QixZQUFBO1FBQUEsY0FBYyxDQUFDLE1BQWYsR0FBd0I7VUFBRSxvQkFBQSxFQUFzQixTQUFBO21CQUFHO1VBQUgsQ0FBeEI7O1FBQ3hCLEtBQUEsQ0FBTSxjQUFjLENBQUMsTUFBckIsRUFBNkIsc0JBQTdCO1FBRUEsSUFBQSxHQUFPO1VBQUEsSUFBQSxFQUFNLE1BQU47VUFBYyxHQUFBLEVBQUssU0FBbkI7O1FBQ1AsY0FBYyxDQUFDLFVBQWYsQ0FBMEIsSUFBMUI7ZUFFQSxNQUFBLENBQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQyxvQkFBN0IsQ0FBa0QsQ0FBQyxvQkFBbkQsQ0FBd0UsTUFBeEUsRUFBbUYsaUJBQW5GO01BUHVCLENBQXpCO01BU0EsRUFBQSxDQUFHLHVCQUFILEVBQTRC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TyxjQUFjLENBQUMsU0FBUyxDQUFDLE9BQXpCLENBQUEsQ0FBUCxDQUEwQyxDQUFDLE9BQTNDLENBQW1ELEtBQW5EO1FBRUEsY0FBYyxDQUFDLFNBQVMsQ0FBQyxPQUF6QixDQUFpQyxFQUFqQztRQUNBLGNBQWMsQ0FBQyxTQUFmLENBQUE7ZUFFQSxNQUFBLENBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFnQixDQUFDLElBQWpCLENBQUEsQ0FBUCxDQUErQixDQUFDLElBQWhDLENBQXFDLE1BQXJDO01BakIwQixDQUE1QjtJQXJLc0IsQ0FBeEI7RUExSnlCLENBQTNCO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJJbnNlcnRMaW5rVmlldyA9IHJlcXVpcmUgXCIuLi8uLi9saWIvdmlld3MvaW5zZXJ0LWxpbmstdmlld1wiXG5cbmRlc2NyaWJlIFwiSW5zZXJ0TGlua1ZpZXdcIiwgLT5cbiAgW2VkaXRvciwgaW5zZXJ0TGlua1ZpZXddID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgd2FpdHNGb3JQcm9taXNlIC0+IGF0b20ud29ya3NwYWNlLm9wZW4oXCJlbXB0eS5tYXJrZG93blwiKVxuICAgIHJ1bnMgLT5cbiAgICAgIGluc2VydExpbmtWaWV3ID0gbmV3IEluc2VydExpbmtWaWV3KHt9KVxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG5cbiAgZGVzY3JpYmUgXCIuaW5zZXJ0TGlua1wiLCAtPlxuICAgIGl0IFwiaW5zZXJ0IGlubGluZSBsaW5rXCIsIC0+XG4gICAgICBpbnNlcnRMaW5rVmlldy5lZGl0b3IgPSB7IHNldFRleHRJbkJ1ZmZlclJhbmdlOiAtPiB7fSB9XG4gICAgICBzcHlPbihpbnNlcnRMaW5rVmlldy5lZGl0b3IsIFwic2V0VGV4dEluQnVmZmVyUmFuZ2VcIilcblxuICAgICAgbGluayA9IHRleHQ6IFwidGV4dFwiLCB1cmw6IFwiaHR0cDovL1wiXG4gICAgICBpbnNlcnRMaW5rVmlldy5pbnNlcnRMaW5rKGxpbmspXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UpLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKHVuZGVmaW5lZCwgXCJbdGV4dF0oaHR0cDovLylcIilcblxuICAgIGl0IFwiaW5zZXJ0IHJlZmVyZW5jZSBsaW5rXCIsIC0+XG4gICAgICBzcHlPbihpbnNlcnRMaW5rVmlldywgXCJpbnNlcnRSZWZlcmVuY2VMaW5rXCIpXG5cbiAgICAgIGxpbmsgPSB0ZXh0OiBcInRleHRcIiwgdGl0bGU6IFwidGhpcyBpcyB0aXRsZVwiLCB1cmw6IFwiaHR0cDovL1wiXG4gICAgICBpbnNlcnRMaW5rVmlldy5pbnNlcnRMaW5rKGxpbmspXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5pbnNlcnRSZWZlcmVuY2VMaW5rKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChsaW5rKVxuXG4gICAgaXQgXCJ1cGRhdGUgcmVmZXJlbmNlIGxpbmtcIiwgLT5cbiAgICAgIGluc2VydExpbmtWaWV3LmRlZmluaXRpb25SYW5nZSA9IHt9XG4gICAgICBzcHlPbihpbnNlcnRMaW5rVmlldywgXCJ1cGRhdGVSZWZlcmVuY2VMaW5rXCIpXG5cbiAgICAgIGxpbmsgPSB0ZXh0OiBcInRleHRcIiwgdGl0bGU6IFwidGhpcyBpcyB0aXRsZVwiLCB1cmw6IFwiaHR0cDovL1wiXG4gICAgICBpbnNlcnRMaW5rVmlldy5pbnNlcnRMaW5rKGxpbmspXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy51cGRhdGVSZWZlcmVuY2VMaW5rKS50b0hhdmVCZWVuQ2FsbGVkV2l0aChsaW5rKVxuXG4gIGRlc2NyaWJlIFwiLnVwZGF0ZVJlZmVyZW5jZUxpbmtcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJtYXJrZG93bi13cml0ZXIucmVmZXJlbmNlSW5kZW50TGVuZ3RoXCIsIDIpXG5cbiAgICBpdCBcInVwZGF0ZSByZWZlcmVuY2UgYW5kIGRlZmluaXRpb25cIiwgLT5cbiAgICAgIGluc2VydExpbmtWaWV3LnJlZmVyZW5jZUlkID0gXCJBQkMxMjNcIlxuICAgICAgaW5zZXJ0TGlua1ZpZXcucmFuZ2UgPSBcIlJhbmdlXCJcbiAgICAgIGluc2VydExpbmtWaWV3LmRlZmluaXRpb25SYW5nZSA9IFwiRFJhbmdlXCJcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZWRpdG9yID0geyBzZXRUZXh0SW5CdWZmZXJSYW5nZTogLT4ge30gfVxuICAgICAgc3B5T24oaW5zZXJ0TGlua1ZpZXcuZWRpdG9yLCBcInNldFRleHRJbkJ1ZmZlclJhbmdlXCIpXG5cbiAgICAgIGxpbmsgPSB0ZXh0OiBcInRleHRcIiwgdGl0bGU6IFwidGhpcyBpcyB0aXRsZVwiLCB1cmw6IFwiaHR0cDovL1wiXG4gICAgICBpbnNlcnRMaW5rVmlldy51cGRhdGVSZWZlcmVuY2VMaW5rKGxpbmspXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5lZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UuY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcuZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlLmNhbGxzWzBdLmFyZ3MpLnRvRXF1YWwoXG4gICAgICAgIFtcIlJhbmdlXCIsIFwiW3RleHRdW0FCQzEyM11cIl0pXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcuZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlLmNhbGxzWzFdLmFyZ3MpLnRvRXF1YWwoXG4gICAgICAgIFtcIkRSYW5nZVwiLCAnICBbQUJDMTIzXTogaHR0cDovLyBcInRoaXMgaXMgdGl0bGVcIiddKVxuXG4gICAgaXQgXCJ1cGRhdGUgcmVmZXJlbmNlIG9ubHkgaWYgZGVmaW5pdGlvbiB0ZW1wbGF0ZSBpcyBlbXB0eVwiLCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KFwibWFya2Rvd24td3JpdGVyLnJlZmVyZW5jZURlZmluaXRpb25UYWdcIiwgXCJcIilcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcucmVmZXJlbmNlSWQgPSBcIkFCQzEyM1wiXG4gICAgICBpbnNlcnRMaW5rVmlldy5yYW5nZSA9IFwiUmFuZ2VcIlxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGVmaW5pdGlvblJhbmdlID0gXCJEUmFuZ2VcIlxuXG4gICAgICBpbnNlcnRMaW5rVmlldy5yZXBsYWNlUmVmZXJlbmNlTGluayA9IHt9XG4gICAgICBzcHlPbihpbnNlcnRMaW5rVmlldywgXCJyZXBsYWNlUmVmZXJlbmNlTGlua1wiKVxuXG4gICAgICBsaW5rID0gdGV4dDogXCJ0ZXh0XCIsIHRpdGxlOiBcInRoaXMgaXMgdGl0bGVcIiwgdXJsOiBcImh0dHA6Ly9cIlxuICAgICAgaW5zZXJ0TGlua1ZpZXcudXBkYXRlUmVmZXJlbmNlTGluayhsaW5rKVxuXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcucmVwbGFjZVJlZmVyZW5jZUxpbmspLnRvSGF2ZUJlZW5DYWxsZWRXaXRoKFwiW3RleHRdW0FCQzEyM11cIilcblxuICBkZXNjcmliZSBcIi5zZXRMaW5rXCIsIC0+XG4gICAgaXQgXCJzZXRzIGFsbCB0aGUgZWRpdG9yc1wiLCAtPlxuICAgICAgbGluayA9IHRleHQ6IFwidGV4dFwiLCB0aXRsZTogXCJ0aGlzIGlzIHRpdGxlXCIsIHVybDogXCJodHRwOi8vXCJcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcuc2V0TGluayhsaW5rKVxuXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudGV4dEVkaXRvci5nZXRUZXh0KCkpLnRvQmUobGluay50ZXh0KVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnRpdGxlRWRpdG9yLmdldFRleHQoKSkudG9CZShsaW5rLnRpdGxlKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnVybEVkaXRvci5nZXRUZXh0KCkpLnRvQmUobGluay51cmwpXG5cbiAgZGVzY3JpYmUgXCIuZ2V0U2F2ZWRMaW5rXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgaW5zZXJ0TGlua1ZpZXcubGlua3MgPVxuICAgICAgICBcIm9sZHN0eWxlXCI6IHtcInRpdGxlXCI6IFwidGhpcyBpcyB0aXRsZVwiLCBcInVybFwiOiBcImh0dHA6Ly9cIn1cbiAgICAgICAgXCJuZXdzdHlsZVwiOiB7XCJ0ZXh0XCI6IFwiTmV3U3R5bGVcIiwgXCJ0aXRsZVwiOiBcInRoaXMgaXMgdGl0bGVcIiwgXCJ1cmxcIjogXCJodHRwOi8vXCJ9XG5cbiAgICBpdCBcInJldHVybiB1bmRlZmluZWQgaWYgdGV4dCBkb2VzIG5vdCBleGlzdHNcIiwgLT5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5nZXRTYXZlZExpbmsoXCJub3RFeGlzdHNcIikpLnRvRXF1YWwodW5kZWZpbmVkKVxuXG4gICAgaXQgXCJyZXR1cm4gdGhlIGxpbmsgd2l0aCB0ZXh0LCB0aXRsZSwgdXJsXCIsIC0+XG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcuZ2V0U2F2ZWRMaW5rKFwib2xkU3R5bGVcIikpLnRvRXF1YWwoe1xuICAgICAgICBcInRleHRcIjogXCJvbGRTdHlsZVwiLCBcInRpdGxlXCI6IFwidGhpcyBpcyB0aXRsZVwiLCBcInVybFwiOiBcImh0dHA6Ly9cIn0pXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5nZXRTYXZlZExpbmsoXCJuZXdTdHlsZVwiKSkudG9FcXVhbCh7XG4gICAgICAgIFwidGV4dFwiOiBcIk5ld1N0eWxlXCIsIFwidGl0bGVcIjogXCJ0aGlzIGlzIHRpdGxlXCIsIFwidXJsXCI6IFwiaHR0cDovL1wifSlcblxuICBkZXNjcmliZSBcIi5pc0luU2F2ZWRMaW5rXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgaW5zZXJ0TGlua1ZpZXcubGlua3MgPVxuICAgICAgICBcIm9sZHN0eWxlXCI6IHtcInRpdGxlXCI6IFwidGhpcyBpcyB0aXRsZVwiLCBcInVybFwiOiBcImh0dHA6Ly9cIn1cbiAgICAgICAgXCJuZXdzdHlsZVwiOiB7XCJ0ZXh0XCI6IFwiTmV3U3R5bGVcIiwgXCJ0aXRsZVwiOiBcInRoaXMgaXMgdGl0bGVcIiwgXCJ1cmxcIjogXCJodHRwOi8vXCJ9XG5cbiAgICBpdCBcInJldHVybiBmYWxzZSBpZiB0aGUgdGV4dCBkb2VzIG5vdCBleGlzdHNcIiwgLT5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5pc0luU2F2ZWRMaW5rKHRleHQ6IFwibm90RXhpc3RzXCIpKS50b0JlKGZhbHNlKVxuXG4gICAgaXQgXCJyZXR1cm4gZmFsc2UgaWYgdGhlIHVybCBkb2VzIG5vdCBtYXRjaFwiLCAtPlxuICAgICAgbGluayA9IHRleHQ6IFwib2xkU3R5bGVcIiwgdGl0bGU6IFwidGhpcyBpcyB0aXRsZVwiLCB1cmw6IFwiYW55dGhpbmdcIlxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LmlzSW5TYXZlZExpbmsobGluaykpLnRvQmUoZmFsc2UpXG5cbiAgICBpdCBcInJldHVybiB0cnVlXCIsIC0+XG4gICAgICBsaW5rID0gdGV4dDogXCJOZXdTdHlsZVwiLCB0aXRsZTogXCJ0aGlzIGlzIHRpdGxlXCIsIHVybDogXCJodHRwOi8vXCJcbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy5pc0luU2F2ZWRMaW5rKGxpbmspKS50b0JlKHRydWUpXG5cbiAgZGVzY3JpYmUgXCIudXBkYXRlVG9MaW5rc1wiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGluc2VydExpbmtWaWV3LmxpbmtzID1cbiAgICAgICAgXCJvbGRzdHlsZVwiOiB7XCJ0aXRsZVwiOiBcInRoaXMgaXMgdGl0bGVcIiwgXCJ1cmxcIjogXCJodHRwOi8vXCJ9XG4gICAgICAgIFwibmV3c3R5bGVcIjoge1widGV4dFwiOiBcIk5ld1N0eWxlXCIsIFwidGl0bGVcIjogXCJ0aGlzIGlzIHRpdGxlXCIsIFwidXJsXCI6IFwiaHR0cDovL1wifVxuXG4gICAgaXQgXCJzYXZlcyB0aGUgbmV3IGxpbmsgaWYgaXQgZG9lcyBub3QgZXhpc3RzIGJlZm9yZSBhbmQgY2hlY2tib3ggY2hlY2tlZFwiLCAtPlxuICAgICAgaW5zZXJ0TGlua1ZpZXcuc2F2ZUNoZWNrYm94LnByb3AoXCJjaGVja2VkXCIsIHRydWUpXG5cbiAgICAgIGxpbmsgPSB0ZXh0OiBcIk5ldyBMaW5rXCIsIHRpdGxlOiBcInRoaXMgaXMgdGl0bGVcIiwgdXJsOiBcImh0dHA6Ly9uZXcubGlua1wiXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudXBkYXRlVG9MaW5rcyhsaW5rKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LmxpbmtzW1wibmV3IGxpbmtcIl0pLnRvRXF1YWwobGluaylcblxuICAgIGl0IFwiZG9lcyBub3Qgc2F2ZSB0aGUgbmV3IGxpbmsgaWYgY2hlY2tib3ggaXMgdW5jaGVja2VkXCIsIC0+XG4gICAgICBpbnNlcnRMaW5rVmlldy5zYXZlQ2hlY2tib3gucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpXG5cbiAgICAgIGxpbmsgPSB0ZXh0OiBcIk5ldyBMaW5rXCIsIHRpdGxlOiBcInRoaXMgaXMgdGl0bGVcIiwgdXJsOiBcImh0dHA6Ly9uZXcubGlua1wiXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudXBkYXRlVG9MaW5rcyhsaW5rKSkudG9CZShmYWxzZSlcblxuICAgIGl0IFwic2F2ZXMgdGhlIGxpbmsgaWYgaXQgaXMgbW9kaWZpZWQgYW5kIGNoZWNrYm94IGNoZWNrZWRcIiwgLT5cbiAgICAgIGluc2VydExpbmtWaWV3LnNhdmVDaGVja2JveC5wcm9wKFwiY2hlY2tlZFwiLCB0cnVlKVxuXG4gICAgICBsaW5rID0gdGV4dDogXCJOZXdTdHlsZVwiLCB0aXRsZTogXCJ0aGlzIGlzIG5ldyB0aXRsZVwiLCB1cmw6IFwiaHR0cDovL1wiXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudXBkYXRlVG9MaW5rcyhsaW5rKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LmxpbmtzW1wibmV3c3R5bGVcIl0pLnRvRXF1YWwobGluaylcblxuICAgIGl0IFwiZG9lcyBub3Qgc2F2ZXMgdGhlIGxpbmsgaWYgaXQgaXMgbm90IG1vZGlmaWVkIGFuZCBjaGVja2JveCBjaGVja2VkXCIsIC0+XG4gICAgICBpbnNlcnRMaW5rVmlldy5zYXZlQ2hlY2tib3gucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSlcblxuICAgICAgbGluayA9IHRleHQ6IFwiTmV3U3R5bGVcIiwgdGl0bGU6IFwidGhpcyBpcyB0aXRsZVwiLCB1cmw6IFwiaHR0cDovL1wiXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudXBkYXRlVG9MaW5rcyhsaW5rKSkudG9CZShmYWxzZSlcblxuICAgIGl0IFwicmVtb3ZlcyB0aGUgZXhpc3RlZCBsaW5rIGlmIGNoZWNrYm94IGlzIHVuY2hlY2tlZFwiLCAtPlxuICAgICAgaW5zZXJ0TGlua1ZpZXcuc2F2ZUNoZWNrYm94LnByb3AoXCJjaGVja2VkXCIsIGZhbHNlKVxuXG4gICAgICBsaW5rID0gdGV4dDogXCJOZXdTdHlsZVwiLCB0aXRsZTogXCJ0aGlzIGlzIHRpdGxlXCIsIHVybDogXCJodHRwOi8vXCJcbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy51cGRhdGVUb0xpbmtzKGxpbmspKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcubGlua3NbXCJuZXdzdHlsZVwiXSkudG9CZSh1bmRlZmluZWQpXG5cbiAgZGVzY3JpYmUgXCJpbnRlZ3JhdGlvblwiLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5yZWZlcmVuY2VJbmRlbnRMZW5ndGhcIiwgMilcblxuICAgICAgIyBzdHVic1xuICAgICAgaW5zZXJ0TGlua1ZpZXcuZmV0Y2hQb3N0cyA9IC0+IHt9XG4gICAgICBpbnNlcnRMaW5rVmlldy5sb2FkU2F2ZWRMaW5rcyA9IChjYikgLT4gY2IoKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcuX3JlZmVyZW5jZUxpbmsgPSAobGluaykgLT5cbiAgICAgICAgbGlua1snaW5kZW50J10gPSBcIiAgXCJcbiAgICAgICAgbGlua1sndGl0bGUnXSA9IGlmIC9eWy1cXCpcXCFdJC8udGVzdChsaW5rLnRpdGxlKSB0aGVuIFwiXCIgZWxzZSBsaW5rLnRpdGxlXG4gICAgICAgIGxpbmtbJ2xhYmVsJ10gPSBpbnNlcnRMaW5rVmlldy5yZWZlcmVuY2VJZCB8fCAnR0VORVJBVEVEJ1xuICAgICAgICBsaW5rXG5cbiAgICBpdCBcImluc2VydCBuZXcgbGlua1wiLCAtPlxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGlzcGxheSgpXG4gICAgICBpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLnNldFRleHQoXCJ0ZXh0XCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy51cmxFZGl0b3Iuc2V0VGV4dChcInVybFwiKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcub25Db25maXJtKClcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgXCJbdGV4dF0odXJsKVwiXG5cbiAgICBpdCBcImluc2VydCBuZXcgbGluayB3aXRoIHRleHRcIiwgLT5cbiAgICAgIGVkaXRvci5zZXRUZXh0IFwidGV4dFwiXG4gICAgICBpbnNlcnRMaW5rVmlldy5kaXNwbGF5KClcbiAgICAgIGluc2VydExpbmtWaWV3LnVybEVkaXRvci5zZXRUZXh0KFwidXJsXCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy5vbkNvbmZpcm0oKVxuXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBcIlt0ZXh0XSh1cmwpXCJcblxuICAgIGl0IFwiaW5zZXJ0IG5ldyByZWZlcmVuY2UgbGlua1wiLCAtPlxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGlzcGxheSgpXG4gICAgICBpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLnNldFRleHQoXCJ0ZXh0XCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy50aXRsZUVkaXRvci5zZXRUZXh0KFwidGl0bGVcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnVybEVkaXRvci5zZXRUZXh0KFwidXJsXCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy5vbkNvbmZpcm0oKVxuXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgICAgW3RleHRdW0dFTkVSQVRFRF1cblxuICAgICAgICAgIFtHRU5FUkFURURdOiB1cmwgXCJ0aXRsZVwiXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJpbnNlcnQgbmV3IHJlZmVyZW5jZSBsaW5rIHdpdGggdGV4dFwiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQgXCJ0ZXh0XCJcbiAgICAgIGluc2VydExpbmtWaWV3LmRpc3BsYXkoKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcudGl0bGVFZGl0b3Iuc2V0VGV4dChcIipcIikgIyBmb3JjZSByZWZlcmVuY2UgbGlua1xuICAgICAgaW5zZXJ0TGlua1ZpZXcudXJsRWRpdG9yLnNldFRleHQoXCJ1cmxcIilcbiAgICAgIGluc2VydExpbmtWaWV3Lm9uQ29uZmlybSgpXG5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFwiXCJcIlxuICAgICAgICBbdGV4dF1bR0VORVJBVEVEXVxuXG4gICAgICAgICAgW0dFTkVSQVRFRF06IHVybCBcIlwiXG4gICAgICAgIFwiXCJcIlxuXG4gICAgaXQgXCJpbnNlcnQgcmVmZXJlbmNlIGxpbmsgd2l0aG91dCBkZWZpbml0aW9uXCIsIC0+XG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJtYXJrZG93bi13cml0ZXIucmVmZXJlbmNlSW5saW5lVGFnXCIsXG4gICAgICAgIFwiPGEgdGl0bGU9J3t0aXRsZX0nIGhyZWY9J3t1cmx9JyB0YXJnZXQ9J19ibGFuayc+e3RleHR9PC9hPlwiKVxuICAgICAgYXRvbS5jb25maWcuc2V0KFwibWFya2Rvd24td3JpdGVyLnJlZmVyZW5jZURlZmluaXRpb25UYWdcIiwgXCJcIilcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGlzcGxheSgpXG4gICAgICBpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLnNldFRleHQoXCJ0ZXh0XCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy50aXRsZUVkaXRvci5zZXRUZXh0KFwidGl0bGVcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnVybEVkaXRvci5zZXRUZXh0KFwidXJsXCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy5vbkNvbmZpcm0oKVxuXG4gICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9CZSBcIlwiXCJcbiAgICAgICAgPGEgdGl0bGU9J3RpdGxlJyBocmVmPSd1cmwnIHRhcmdldD0nX2JsYW5rJz50ZXh0PC9hPlxuICAgICAgXCJcIlwiXG5cbiAgICBpdCBcInVwZGF0ZSBpbmxpbmUgbGlua1wiLCAtPlxuICAgICAgZWRpdG9yLnNldFRleHQoXCJbdGV4dF0odXJsKVwiKVxuICAgICAgZWRpdG9yLnNlbGVjdEFsbCgpXG4gICAgICBpbnNlcnRMaW5rVmlldy5kaXNwbGF5KClcblxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnRleHRFZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKFwidGV4dFwiKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnVybEVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ1cmxcIilcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcudGV4dEVkaXRvci5zZXRUZXh0KFwibmV3IHRleHRcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnVybEVkaXRvci5zZXRUZXh0KFwibmV3IHVybFwiKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcub25Db25maXJtKClcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgXCJbbmV3IHRleHRdKG5ldyB1cmwpXCJcblxuICAgIGl0IFwidXBkYXRlIGlubGluZSBsaW5rIHRvIHJlZmVyZW5jZSBsaW5rXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChcIlt0ZXh0XSh1cmwpXCIpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuICAgICAgZWRpdG9yLnNlbGVjdFRvRW5kT2ZMaW5lKClcbiAgICAgIGluc2VydExpbmtWaWV3LmRpc3BsYXkoKVxuXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudGV4dEVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ0ZXh0XCIpXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudXJsRWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcInVybFwiKVxuXG4gICAgICBpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLnNldFRleHQoXCJuZXcgdGV4dFwiKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcudGl0bGVFZGl0b3Iuc2V0VGV4dChcInRpdGxlXCIpXG4gICAgICBpbnNlcnRMaW5rVmlldy51cmxFZGl0b3Iuc2V0VGV4dChcIm5ldyB1cmxcIilcbiAgICAgIGluc2VydExpbmtWaWV3Lm9uQ29uZmlybSgpXG5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS50b0JlIFwiXCJcIlxuICAgICAgICBbbmV3IHRleHRdW0dFTkVSQVRFRF1cblxuICAgICAgICAgIFtHRU5FUkFURURdOiBuZXcgdXJsIFwidGl0bGVcIlxuICAgICAgICBcIlwiXCJcblxuICAgIGl0IFwidXBkYXRlIHJlZmVyZW5jZSBsaW5rIHRvIGlubGluZSBsaW5rXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIFt0ZXh0XVtBQkMxMjNdXG5cbiAgICAgIFtBQkMxMjNdOiB1cmwgXCJ0aXRsZVwiXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9FbmRPZkxpbmUoKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGlzcGxheSgpXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcInRleHRcIilcbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy50aXRsZUVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ0aXRsZVwiKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnVybEVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ1cmxcIilcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcudGV4dEVkaXRvci5zZXRUZXh0KFwibmV3IHRleHRcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnRpdGxlRWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnVybEVkaXRvci5zZXRUZXh0KFwibmV3IHVybFwiKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcub25Db25maXJtKClcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlIFwiW25ldyB0ZXh0XShuZXcgdXJsKVwiXG5cbiAgICBpdCBcInVwZGF0ZSByZWZlcmVuY2UgbGluayB0byBjb25maWcgcmVmZXJlbmNlIGxpbmtcIiwgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldChcIm1hcmtkb3duLXdyaXRlci5yZWZlcmVuY2VJbmxpbmVUYWdcIixcbiAgICAgICAgXCI8YSB0aXRsZT0ne3RpdGxlfScgaHJlZj0ne3VybH0nIHRhcmdldD0nX2JsYW5rJz57dGV4dH08L2E+XCIpXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoXCJtYXJrZG93bi13cml0ZXIucmVmZXJlbmNlRGVmaW5pdGlvblRhZ1wiLCBcIlwiKVxuXG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIFt0ZXh0XVtBQkMxMjNdXG5cbiAgICAgIFtBQkMxMjNdOiB1cmwgXCJ0aXRsZVwiXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9FbmRPZkxpbmUoKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGlzcGxheSgpXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcInRleHRcIilcbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy50aXRsZUVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ0aXRsZVwiKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnVybEVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ1cmxcIilcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcudGV4dEVkaXRvci5zZXRUZXh0KFwibmV3IHRleHRcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnRpdGxlRWRpdG9yLnNldFRleHQoXCJuZXcgdGl0bGVcIilcbiAgICAgIGluc2VydExpbmtWaWV3LnVybEVkaXRvci5zZXRUZXh0KFwibmV3IHVybFwiKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcub25Db25maXJtKClcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkudHJpbSgpKS50b0JlKFxuICAgICAgICBcIjxhIHRpdGxlPSduZXcgdGl0bGUnIGhyZWY9J25ldyB1cmwnIHRhcmdldD0nX2JsYW5rJz5uZXcgdGV4dDwvYT5cIilcblxuICAgIGl0IFwicmVtb3ZlIGlubGluZSBsaW5rXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dChcIlt0ZXh0XSh1cmwpXCIpXG4gICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oWzAsIDBdKVxuICAgICAgZWRpdG9yLnNlbGVjdFRvRW5kT2ZMaW5lKClcbiAgICAgIGluc2VydExpbmtWaWV3LmRpc3BsYXkoKVxuXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudGV4dEVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ0ZXh0XCIpXG4gICAgICBleHBlY3QoaW5zZXJ0TGlua1ZpZXcudXJsRWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcInVybFwiKVxuXG4gICAgICBpbnNlcnRMaW5rVmlldy51cmxFZGl0b3Iuc2V0VGV4dChcIlwiKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcub25Db25maXJtKClcblxuICAgICAgZXhwZWN0KGVkaXRvci5nZXRUZXh0KCkpLnRvQmUgXCJ0ZXh0XCJcblxuICAgIGl0IFwicmVtb3ZlIHJlZmVyZW5jZSBsaW5rXCIsIC0+XG4gICAgICBlZGl0b3Iuc2V0VGV4dCBcIlwiXCJcbiAgICAgIFt0ZXh0XVtBQkMxMjNdXG5cbiAgICAgIFtBQkMxMjNdOiB1cmwgXCJ0aXRsZVwiXG4gICAgICBcIlwiXCJcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbMCwgMF0pXG4gICAgICBlZGl0b3Iuc2VsZWN0VG9FbmRPZkxpbmUoKVxuICAgICAgaW5zZXJ0TGlua1ZpZXcuZGlzcGxheSgpXG5cbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy50ZXh0RWRpdG9yLmdldFRleHQoKSkudG9FcXVhbChcInRleHRcIilcbiAgICAgIGV4cGVjdChpbnNlcnRMaW5rVmlldy50aXRsZUVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ0aXRsZVwiKVxuICAgICAgZXhwZWN0KGluc2VydExpbmtWaWV3LnVybEVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwoXCJ1cmxcIilcblxuICAgICAgaW5zZXJ0TGlua1ZpZXcudXJsRWRpdG9yLnNldFRleHQoXCJcIilcbiAgICAgIGluc2VydExpbmtWaWV3Lm9uQ29uZmlybSgpXG5cbiAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpLnRyaW0oKSkudG9CZSBcInRleHRcIlxuIl19
