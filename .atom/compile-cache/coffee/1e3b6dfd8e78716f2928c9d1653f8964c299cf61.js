(function() {
  module.exports = {
    diffWords: {
      title: 'Show Word Diff',
      description: 'Diffs the words between each line when this box is checked.',
      type: 'boolean',
      "default": true,
      order: 1
    },
    ignoreWhitespace: {
      title: 'Ignore Whitespace',
      description: 'Will not diff whitespace when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 2
    },
    muteNotifications: {
      title: 'Mute Notifications',
      description: 'Mutes all warning notifications when this box is checked.',
      type: 'boolean',
      "default": false,
      order: 3
    },
    hideTreeView: {
      title: 'Hide Tree View',
      description: 'Hides Tree View during diff - shows when finished.',
      type: 'boolean',
      "default": false,
      order: 4
    },
    scrollSyncType: {
      title: 'Sync Scrolling',
      description: 'Syncs the scrolling of the editors.',
      type: 'string',
      "default": 'Vertical + Horizontal',
      "enum": ['Vertical + Horizontal', 'Vertical', 'None'],
      order: 5
    },
    leftEditorColor: {
      title: 'Left Editor Color',
      description: 'Specifies the highlight color for the left editor.',
      type: 'string',
      "default": 'green',
      "enum": ['green', 'red'],
      order: 6
    },
    rightEditorColor: {
      title: 'Right Editor Color',
      description: 'Specifies the highlight color for the right editor.',
      type: 'string',
      "default": 'red',
      "enum": ['green', 'red'],
      order: 7
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvY29uZmlnLXNjaGVtYS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGdCQUFQO01BQ0EsV0FBQSxFQUFhLDZEQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQURGO0lBTUEsZ0JBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSxvREFEYjtNQUVBLElBQUEsRUFBTSxTQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUhUO01BSUEsS0FBQSxFQUFPLENBSlA7S0FQRjtJQVlBLGlCQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sb0JBQVA7TUFDQSxXQUFBLEVBQWEsMkRBRGI7TUFFQSxJQUFBLEVBQU0sU0FGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtNQUlBLEtBQUEsRUFBTyxDQUpQO0tBYkY7SUFrQkEsWUFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLGdCQUFQO01BQ0EsV0FBQSxFQUFhLG9EQURiO01BRUEsSUFBQSxFQUFNLFNBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxLQUFBLEVBQU8sQ0FKUDtLQW5CRjtJQXdCQSxjQUFBLEVBQ0U7TUFBQSxLQUFBLEVBQU8sZ0JBQVA7TUFDQSxXQUFBLEVBQWEscUNBRGI7TUFFQSxJQUFBLEVBQU0sUUFGTjtNQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsdUJBSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsdUJBQUQsRUFBMEIsVUFBMUIsRUFBc0MsTUFBdEMsQ0FKTjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBekJGO0lBK0JBLGVBQUEsRUFDRTtNQUFBLEtBQUEsRUFBTyxtQkFBUDtNQUNBLFdBQUEsRUFBYSxvREFEYjtNQUVBLElBQUEsRUFBTSxRQUZOO01BR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO01BSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxLQUFWLENBSk47TUFLQSxLQUFBLEVBQU8sQ0FMUDtLQWhDRjtJQXNDQSxnQkFBQSxFQUNFO01BQUEsS0FBQSxFQUFPLG9CQUFQO01BQ0EsV0FBQSxFQUFhLHFEQURiO01BRUEsSUFBQSxFQUFNLFFBRk47TUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBSFQ7TUFJQSxDQUFBLElBQUEsQ0FBQSxFQUFNLENBQUMsT0FBRCxFQUFVLEtBQVYsQ0FKTjtNQUtBLEtBQUEsRUFBTyxDQUxQO0tBdkNGOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBkaWZmV29yZHM6XG4gICAgdGl0bGU6ICdTaG93IFdvcmQgRGlmZidcbiAgICBkZXNjcmlwdGlvbjogJ0RpZmZzIHRoZSB3b3JkcyBiZXR3ZWVuIGVhY2ggbGluZSB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IHRydWVcbiAgICBvcmRlcjogMVxuICBpZ25vcmVXaGl0ZXNwYWNlOlxuICAgIHRpdGxlOiAnSWdub3JlIFdoaXRlc3BhY2UnXG4gICAgZGVzY3JpcHRpb246ICdXaWxsIG5vdCBkaWZmIHdoaXRlc3BhY2Ugd2hlbiB0aGlzIGJveCBpcyBjaGVja2VkLidcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIG9yZGVyOiAyXG4gIG11dGVOb3RpZmljYXRpb25zOlxuICAgIHRpdGxlOiAnTXV0ZSBOb3RpZmljYXRpb25zJ1xuICAgIGRlc2NyaXB0aW9uOiAnTXV0ZXMgYWxsIHdhcm5pbmcgbm90aWZpY2F0aW9ucyB3aGVuIHRoaXMgYm94IGlzIGNoZWNrZWQuJ1xuICAgIHR5cGU6ICdib29sZWFuJ1xuICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgb3JkZXI6IDNcbiAgaGlkZVRyZWVWaWV3OlxuICAgIHRpdGxlOiAnSGlkZSBUcmVlIFZpZXcnXG4gICAgZGVzY3JpcHRpb246ICdIaWRlcyBUcmVlIFZpZXcgZHVyaW5nIGRpZmYgLSBzaG93cyB3aGVuIGZpbmlzaGVkLidcbiAgICB0eXBlOiAnYm9vbGVhbidcbiAgICBkZWZhdWx0OiBmYWxzZVxuICAgIG9yZGVyOiA0XG4gIHNjcm9sbFN5bmNUeXBlOlxuICAgIHRpdGxlOiAnU3luYyBTY3JvbGxpbmcnXG4gICAgZGVzY3JpcHRpb246ICdTeW5jcyB0aGUgc2Nyb2xsaW5nIG9mIHRoZSBlZGl0b3JzLidcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICdWZXJ0aWNhbCArIEhvcml6b250YWwnXG4gICAgZW51bTogWydWZXJ0aWNhbCArIEhvcml6b250YWwnLCAnVmVydGljYWwnLCAnTm9uZSddXG4gICAgb3JkZXI6IDVcbiAgbGVmdEVkaXRvckNvbG9yOlxuICAgIHRpdGxlOiAnTGVmdCBFZGl0b3IgQ29sb3InXG4gICAgZGVzY3JpcHRpb246ICdTcGVjaWZpZXMgdGhlIGhpZ2hsaWdodCBjb2xvciBmb3IgdGhlIGxlZnQgZWRpdG9yLidcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICdncmVlbidcbiAgICBlbnVtOiBbJ2dyZWVuJywgJ3JlZCddXG4gICAgb3JkZXI6IDZcbiAgcmlnaHRFZGl0b3JDb2xvcjpcbiAgICB0aXRsZTogJ1JpZ2h0IEVkaXRvciBDb2xvcidcbiAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZmllcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIGZvciB0aGUgcmlnaHQgZWRpdG9yLidcbiAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIGRlZmF1bHQ6ICdyZWQnXG4gICAgZW51bTogWydncmVlbicsICdyZWQnXVxuICAgIG9yZGVyOiA3XG4iXX0=
