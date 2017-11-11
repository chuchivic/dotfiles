(function() {
  var OpenLinkInBrowser, child_process, shell, utils;

  child_process = require("child_process");

  shell = require("shell");

  utils = require("../utils");

  module.exports = OpenLinkInBrowser = (function() {
    function OpenLinkInBrowser() {}

    OpenLinkInBrowser.prototype.trigger = function(e) {
      var editor, link, range;
      editor = atom.workspace.getActiveTextEditor();
      range = utils.getTextBufferRange(editor, "link");
      link = utils.findLinkInRange(editor, range);
      if (!link || !link.url) {
        return e.abortKeyBinding();
      }
      switch (process.platform) {
        case 'darwin':
          return child_process.execFile("open", [link.url]);
        case 'linux':
          return child_process.execFile("xdg-open", [link.url]);
        case 'win32':
          return shell.openExternal(link.url);
      }
    };

    return OpenLinkInBrowser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24td3JpdGVyL2xpYi9jb21tYW5kcy9vcGVuLWxpbmstaW4tYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGVBQVI7O0VBQ2hCLEtBQUEsR0FBUSxPQUFBLENBQVEsT0FBUjs7RUFFUixLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBRVIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O2dDQUNKLE9BQUEsR0FBUyxTQUFDLENBQUQ7QUFDUCxVQUFBO01BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULEtBQUEsR0FBUSxLQUFLLENBQUMsa0JBQU4sQ0FBeUIsTUFBekIsRUFBaUMsTUFBakM7TUFFUixJQUFBLEdBQU8sS0FBSyxDQUFDLGVBQU4sQ0FBc0IsTUFBdEIsRUFBOEIsS0FBOUI7TUFDUCxJQUE4QixDQUFDLElBQUQsSUFBUyxDQUFDLElBQUksQ0FBQyxHQUE3QztBQUFBLGVBQU8sQ0FBQyxDQUFDLGVBQUYsQ0FBQSxFQUFQOztBQUVBLGNBQU8sT0FBTyxDQUFDLFFBQWY7QUFBQSxhQUNPLFFBRFA7aUJBQ3FCLGFBQWEsQ0FBQyxRQUFkLENBQXVCLE1BQXZCLEVBQStCLENBQUMsSUFBSSxDQUFDLEdBQU4sQ0FBL0I7QUFEckIsYUFFTyxPQUZQO2lCQUVxQixhQUFhLENBQUMsUUFBZCxDQUF1QixVQUF2QixFQUFtQyxDQUFDLElBQUksQ0FBQyxHQUFOLENBQW5DO0FBRnJCLGFBR08sT0FIUDtpQkFHcUIsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsSUFBSSxDQUFDLEdBQXhCO0FBSHJCO0lBUE87Ozs7O0FBUFgiLCJzb3VyY2VzQ29udGVudCI6WyJjaGlsZF9wcm9jZXNzID0gcmVxdWlyZSBcImNoaWxkX3Byb2Nlc3NcIlxuc2hlbGwgPSByZXF1aXJlIFwic2hlbGxcIlxuXG51dGlscyA9IHJlcXVpcmUgXCIuLi91dGlsc1wiXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE9wZW5MaW5rSW5Ccm93c2VyXG4gIHRyaWdnZXI6IChlKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJhbmdlID0gdXRpbHMuZ2V0VGV4dEJ1ZmZlclJhbmdlKGVkaXRvciwgXCJsaW5rXCIpXG5cbiAgICBsaW5rID0gdXRpbHMuZmluZExpbmtJblJhbmdlKGVkaXRvciwgcmFuZ2UpXG4gICAgcmV0dXJuIGUuYWJvcnRLZXlCaW5kaW5nKCkgaWYgIWxpbmsgfHwgIWxpbmsudXJsXG5cbiAgICBzd2l0Y2ggcHJvY2Vzcy5wbGF0Zm9ybVxuICAgICAgd2hlbiAnZGFyd2luJyB0aGVuIGNoaWxkX3Byb2Nlc3MuZXhlY0ZpbGUoXCJvcGVuXCIsIFtsaW5rLnVybF0pXG4gICAgICB3aGVuICdsaW51eCcgIHRoZW4gY2hpbGRfcHJvY2Vzcy5leGVjRmlsZShcInhkZy1vcGVuXCIsIFtsaW5rLnVybF0pXG4gICAgICB3aGVuICd3aW4zMicgIHRoZW4gc2hlbGwub3BlbkV4dGVybmFsKGxpbmsudXJsKVxuIl19
