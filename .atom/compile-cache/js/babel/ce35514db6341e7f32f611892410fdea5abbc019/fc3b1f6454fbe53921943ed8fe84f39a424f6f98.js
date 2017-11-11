Object.defineProperty(exports, '__esModule', {
  value: true
});
/** @babel */

exports['default'] = {
  HtmlTemplete: {
    word: /[$0-9a-zA-Z_]+/,
    regexes: [],
    files: ['*.html'],
    dependencies: ['JavaScript', 'CoffeeScript', 'TypeScript', 'PHP']
  },

  JavaScriptTemplete: {
    word: /[$0-9a-zA-Z_]+/,
    regexes: [],
    files: ['*.jsx', '*.vue', '*.jade'],
    dependencies: ['JavaScript', 'CoffeeScript', 'TypeScript']
  },

  JavaScript: {
    word: /[$0-9a-zA-Z_]+/,
    regexes: [/(^|\s|\.){word}\s*[:=]\s*function\s*\(/, /(^|\s)function\s+{word}\s*\(/, /(^|\s)class\s+{word}(\s|$)/, /(^|\s){word}\s*\([^(]*?\)\s*\{/],
    files: ['*.js'],
    dependencies: ['CoffeeScript', 'TypeScript']
  },

  CoffeeScript: {
    word: /[$0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}(\s|$)/, /(^|\s|\.|@){word}\s*[:=]\s*(\([^(]*?\))?\s*[=-]>/],
    files: ['*.coffee'],
    dependencies: ['JavaScript', 'TypeScript']
  },

  TypeScript: {
    word: /[$0-9a-zA-Z_]+/,
    regexes: [/(^|\s|\.){word}\s*[:=]\s*function\s*\(/, /(^|\s)function\s+{word}\s*\(/, /(^|\s)interface\s+{word}(\s|$)/, /(^|\s)class\s+{word}(\s|$)/, /(^|\s){word}\([^(]*?\)\s*\{/, /(^|\s|\.|@){word}\s*[:=]\s*(\([^(]*?\))?\s*[=-]>/],
    files: ['*.ts'],
    dependencies: ['JavaScript', 'CoffeeScript']
  },

  Python: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}\s*\(/, /(^|\s)def\s+{word}\s*\(/],
    files: ['*.py']
  },

  PHP: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}(\s|\{|$)/, /(^|\s)interface\s+{word}(\s|\{|$)/, /(^|\s)trait\s+{word}(\s|\{|$)/, /(^|\s)(static\s+)?((public|private|protected)\s+)?(static\s+)?function\s+{word}\s*\(/, /(^|\s)const\s+{word}(\s|=|;|$)/],
    files: ['*.php', '*.php3', '*.phtml']
  },

  ASP: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)(function|sub)\s+{word}\s*\(/],
    files: ['*.asp']
  },

  Hack: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}(\s|\{|$)/, /(^|\s)interface\s+{word}(\s|\{|$)/, /(^|\s)(static\s+)?((public|private|protected)\s+)?(static\s+)?function\s+{word}\s*\(/],
    files: ['*.hh']
  },

  Ruby: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}(\s|$)/, /(^|\s)module\s+{word}(\s|$)/, /(^|\s)def\s+(?:self\.)?{word}\s*\(?/, /(^|\s)scope\s+:{word}\s*\(?/, /(^|\s)attr_accessor\s+:{word}(\s|$)/, /(^|\s)attr_reader\s+:{word}(\s|$)/, /(^|\s)attr_writer\s+:{word}(\s|$)/, /(^|\s)define_method\s+:?{word}\s*\(?/],
    files: ['*.rb', '*.ru', '*.haml', '*.erb', '*.rake']
  },

  Puppet: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}(\s|$)/],
    files: ['*.pp']
  },

  KRL: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)DEF\s+{word}\s*\(/, /(^|\s)DECL\s+\w*?{word}\s*=?/, /(^|\s)(SIGNAL|INT|BOOL|REAL|STRUC|CHAR|ENUM|EXT|\s)\s*\w*{word}.*/],
    files: ['*.src', '*.dat']
  },

  Perl: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)sub\s+{word}\s*\{/, /(^|\s)package\s+(\w+::)*{word}\s*;/],
    files: ['*.pm', '*.pl']
  },

  'C/C++': {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s)class\s+{word}(\s|:)/, /(^|\s)struct\s+{word}(\s|\{|$)/, /(^|\s)enum\s+{word}(\s|\{|$)/, /(^|\s)#define\s+{word}(\s|\(|$)/, /(^|\s)filesdef\s.*(\s|\*|\(){word}(\s|;|\)|$)/, /(^|\s|\*|:|&){word}\s*\(.*\)(\s*|\s*const\s*)(\{|$)/],
    files: ['*.c', '*.cc', '*.cpp', '*.cxx', '*.h', '*.hh', '*.hpp', '*.inc']
  },

  Shell: {
    word: /[0-9a-zA-Z_]+/,
    regexes: [/(^|\s){word}\s*\(\)\s*\{/],
    files: ['*.sh']
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2plc3VzLy5hdG9tL3BhY2thZ2VzL2dvdG8tZGVmaW5pdGlvbi9saWIvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUVlO0FBQ2IsY0FBWSxFQUFFO0FBQ1osUUFBSSxFQUFFLGdCQUFnQjtBQUN0QixXQUFPLEVBQUUsRUFBRTtBQUNYLFNBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQztBQUNqQixnQkFBWSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDO0dBQ2xFOztBQUVELG9CQUFrQixFQUFFO0FBQ2xCLFFBQUksRUFBRSxnQkFBZ0I7QUFDdEIsV0FBTyxFQUFFLEVBQUU7QUFDWCxTQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztBQUNuQyxnQkFBWSxFQUFFLENBQUMsWUFBWSxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUM7R0FDM0Q7O0FBRUQsWUFBVSxFQUFFO0FBQ1YsUUFBSSxFQUFFLGdCQUFnQjtBQUN0QixXQUFPLEVBQUUsQ0FDUCx3Q0FBd0MsRUFDeEMsOEJBQThCLEVBQzlCLDRCQUE0QixFQUM1QixnQ0FBZ0MsQ0FDakM7QUFDRCxTQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDZixnQkFBWSxFQUFFLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQztHQUM3Qzs7QUFFRCxjQUFZLEVBQUU7QUFDWixRQUFJLEVBQUUsZ0JBQWdCO0FBQ3RCLFdBQU8sRUFBRSxDQUNQLDRCQUE0QixFQUM1QixrREFBa0QsQ0FDbkQ7QUFDRCxTQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUM7QUFDbkIsZ0JBQVksRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUM7R0FDM0M7O0FBRUQsWUFBVSxFQUFFO0FBQ1YsUUFBSSxFQUFFLGdCQUFnQjtBQUN0QixXQUFPLEVBQUUsQ0FDUCx3Q0FBd0MsRUFDeEMsOEJBQThCLEVBQzlCLGdDQUFnQyxFQUNoQyw0QkFBNEIsRUFDNUIsNkJBQTZCLEVBQzdCLGtEQUFrRCxDQUNuRDtBQUNELFNBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNmLGdCQUFZLEVBQUUsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDO0dBQzdDOztBQUVELFFBQU0sRUFBRTtBQUNOLFFBQUksRUFBRSxlQUFlO0FBQ3JCLFdBQU8sRUFBRSxDQUNQLDJCQUEyQixFQUMzQix5QkFBeUIsQ0FDMUI7QUFDRCxTQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7R0FDaEI7O0FBRUQsS0FBRyxFQUFFO0FBQ0gsUUFBSSxFQUFFLGVBQWU7QUFDckIsV0FBTyxFQUFFLENBQ1AsK0JBQStCLEVBQy9CLG1DQUFtQyxFQUNuQywrQkFBK0IsRUFDL0Isc0ZBQXNGLEVBQ3RGLGdDQUFnQyxDQUNqQztBQUNELFNBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDO0dBQ3RDOztBQUVELEtBQUcsRUFBRTtBQUNILFFBQUksRUFBRSxlQUFlO0FBQ3JCLFdBQU8sRUFBRSxDQUNQLG9DQUFvQyxDQUNyQztBQUNELFNBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQztHQUNqQjs7QUFFRCxNQUFJLEVBQUU7QUFDSixRQUFJLEVBQUUsZUFBZTtBQUNyQixXQUFPLEVBQUUsQ0FDUCwrQkFBK0IsRUFDL0IsbUNBQW1DLEVBQ25DLHNGQUFzRixDQUN2RjtBQUNELFNBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztHQUNoQjs7QUFFRCxNQUFJLEVBQUU7QUFDSixRQUFJLEVBQUUsZUFBZTtBQUNyQixXQUFPLEVBQUUsQ0FDUCw0QkFBNEIsRUFDNUIsNkJBQTZCLEVBQzdCLHFDQUFxQyxFQUNyQyw2QkFBNkIsRUFDN0IscUNBQXFDLEVBQ3JDLG1DQUFtQyxFQUNuQyxtQ0FBbUMsRUFDbkMsc0NBQXNDLENBQ3ZDO0FBQ0QsU0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztHQUNyRDs7QUFFRCxRQUFNLEVBQUU7QUFDTixRQUFJLEVBQUUsZUFBZTtBQUNyQixXQUFPLEVBQUUsQ0FDUCw0QkFBNEIsQ0FDN0I7QUFDRCxTQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7R0FDaEI7O0FBRUQsS0FBRyxFQUFFO0FBQ0gsUUFBSSxFQUFFLGVBQWU7QUFDckIsV0FBTyxFQUFFLENBQ1AseUJBQXlCLEVBQ3pCLDhCQUE4QixFQUM5QixtRUFBbUUsQ0FDcEU7QUFDRCxTQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO0dBQzFCOztBQUVELE1BQUksRUFBRTtBQUNKLFFBQUksRUFBRSxlQUFlO0FBQ3JCLFdBQU8sRUFBRSxDQUNQLHlCQUF5QixFQUN6QixvQ0FBb0MsQ0FDckM7QUFDRCxTQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO0dBQ3hCOztBQUVELFNBQU8sRUFBRTtBQUNQLFFBQUksRUFBRSxlQUFlO0FBQ3JCLFdBQU8sRUFBRSxDQUNQLDRCQUE0QixFQUM1QixnQ0FBZ0MsRUFDaEMsOEJBQThCLEVBQzlCLGlDQUFpQyxFQUNqQywrQ0FBK0MsRUFDL0MscURBQXFELENBQ3REO0FBQ0QsU0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztHQUMxRTs7QUFFRCxPQUFLLEVBQUU7QUFDTCxRQUFJLEVBQUUsZUFBZTtBQUNyQixXQUFPLEVBQUUsQ0FDUCwwQkFBMEIsQ0FDM0I7QUFDRCxTQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7R0FDaEI7Q0FDRiIsImZpbGUiOiIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9nb3RvLWRlZmluaXRpb24vbGliL2NvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBAYmFiZWwgKi9cblxuZXhwb3J0IGRlZmF1bHQge1xuICBIdG1sVGVtcGxldGU6IHtcbiAgICB3b3JkOiAvWyQwLTlhLXpBLVpfXSsvLFxuICAgIHJlZ2V4ZXM6IFtdLFxuICAgIGZpbGVzOiBbJyouaHRtbCddLFxuICAgIGRlcGVuZGVuY2llczogWydKYXZhU2NyaXB0JywgJ0NvZmZlZVNjcmlwdCcsICdUeXBlU2NyaXB0JywgJ1BIUCddLFxuICB9LFxuXG4gIEphdmFTY3JpcHRUZW1wbGV0ZToge1xuICAgIHdvcmQ6IC9bJDAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW10sXG4gICAgZmlsZXM6IFsnKi5qc3gnLCAnKi52dWUnLCAnKi5qYWRlJ10sXG4gICAgZGVwZW5kZW5jaWVzOiBbJ0phdmFTY3JpcHQnLCAnQ29mZmVlU2NyaXB0JywgJ1R5cGVTY3JpcHQnXSxcbiAgfSxcblxuICBKYXZhU2NyaXB0OiB7XG4gICAgd29yZDogL1skMC05YS16QS1aX10rLyxcbiAgICByZWdleGVzOiBbXG4gICAgICAvKF58XFxzfFxcLil7d29yZH1cXHMqWzo9XVxccypmdW5jdGlvblxccypcXCgvLFxuICAgICAgLyhefFxccylmdW5jdGlvblxccyt7d29yZH1cXHMqXFwoLyxcbiAgICAgIC8oXnxcXHMpY2xhc3NcXHMre3dvcmR9KFxcc3wkKS8sXG4gICAgICAvKF58XFxzKXt3b3JkfVxccypcXChbXihdKj9cXClcXHMqXFx7LyxcbiAgICBdLFxuICAgIGZpbGVzOiBbJyouanMnXSxcbiAgICBkZXBlbmRlbmNpZXM6IFsnQ29mZmVlU2NyaXB0JywgJ1R5cGVTY3JpcHQnXSxcbiAgfSxcblxuICBDb2ZmZWVTY3JpcHQ6IHtcbiAgICB3b3JkOiAvWyQwLTlhLXpBLVpfXSsvLFxuICAgIHJlZ2V4ZXM6IFtcbiAgICAgIC8oXnxcXHMpY2xhc3NcXHMre3dvcmR9KFxcc3wkKS8sXG4gICAgICAvKF58XFxzfFxcLnxAKXt3b3JkfVxccypbOj1dXFxzKihcXChbXihdKj9cXCkpP1xccypbPS1dPi8sXG4gICAgXSxcbiAgICBmaWxlczogWycqLmNvZmZlZSddLFxuICAgIGRlcGVuZGVuY2llczogWydKYXZhU2NyaXB0JywgJ1R5cGVTY3JpcHQnXSxcbiAgfSxcblxuICBUeXBlU2NyaXB0OiB7XG4gICAgd29yZDogL1skMC05YS16QS1aX10rLyxcbiAgICByZWdleGVzOiBbXG4gICAgICAvKF58XFxzfFxcLil7d29yZH1cXHMqWzo9XVxccypmdW5jdGlvblxccypcXCgvLFxuICAgICAgLyhefFxccylmdW5jdGlvblxccyt7d29yZH1cXHMqXFwoLyxcbiAgICAgIC8oXnxcXHMpaW50ZXJmYWNlXFxzK3t3b3JkfShcXHN8JCkvLFxuICAgICAgLyhefFxccyljbGFzc1xccyt7d29yZH0oXFxzfCQpLyxcbiAgICAgIC8oXnxcXHMpe3dvcmR9XFwoW14oXSo/XFwpXFxzKlxcey8sXG4gICAgICAvKF58XFxzfFxcLnxAKXt3b3JkfVxccypbOj1dXFxzKihcXChbXihdKj9cXCkpP1xccypbPS1dPi8sXG4gICAgXSxcbiAgICBmaWxlczogWycqLnRzJ10sXG4gICAgZGVwZW5kZW5jaWVzOiBbJ0phdmFTY3JpcHQnLCAnQ29mZmVlU2NyaXB0J10sXG4gIH0sXG5cbiAgUHl0aG9uOiB7XG4gICAgd29yZDogL1swLTlhLXpBLVpfXSsvLFxuICAgIHJlZ2V4ZXM6IFtcbiAgICAgIC8oXnxcXHMpY2xhc3NcXHMre3dvcmR9XFxzKlxcKC8sXG4gICAgICAvKF58XFxzKWRlZlxccyt7d29yZH1cXHMqXFwoLyxcbiAgICBdLFxuICAgIGZpbGVzOiBbJyoucHknXSxcbiAgfSxcblxuICBQSFA6IHtcbiAgICB3b3JkOiAvWzAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW1xuICAgICAgLyhefFxccyljbGFzc1xccyt7d29yZH0oXFxzfFxce3wkKS8sXG4gICAgICAvKF58XFxzKWludGVyZmFjZVxccyt7d29yZH0oXFxzfFxce3wkKS8sXG4gICAgICAvKF58XFxzKXRyYWl0XFxzK3t3b3JkfShcXHN8XFx7fCQpLyxcbiAgICAgIC8oXnxcXHMpKHN0YXRpY1xccyspPygocHVibGljfHByaXZhdGV8cHJvdGVjdGVkKVxccyspPyhzdGF0aWNcXHMrKT9mdW5jdGlvblxccyt7d29yZH1cXHMqXFwoLyxcbiAgICAgIC8oXnxcXHMpY29uc3RcXHMre3dvcmR9KFxcc3w9fDt8JCkvLFxuICAgIF0sXG4gICAgZmlsZXM6IFsnKi5waHAnLCAnKi5waHAzJywgJyoucGh0bWwnXSxcbiAgfSxcblxuICBBU1A6IHtcbiAgICB3b3JkOiAvWzAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW1xuICAgICAgLyhefFxccykoZnVuY3Rpb258c3ViKVxccyt7d29yZH1cXHMqXFwoLyxcbiAgICBdLFxuICAgIGZpbGVzOiBbJyouYXNwJ10sXG4gIH0sXG5cbiAgSGFjazoge1xuICAgIHdvcmQ6IC9bMC05YS16QS1aX10rLyxcbiAgICByZWdleGVzOiBbXG4gICAgICAvKF58XFxzKWNsYXNzXFxzK3t3b3JkfShcXHN8XFx7fCQpLyxcbiAgICAgIC8oXnxcXHMpaW50ZXJmYWNlXFxzK3t3b3JkfShcXHN8XFx7fCQpLyxcbiAgICAgIC8oXnxcXHMpKHN0YXRpY1xccyspPygocHVibGljfHByaXZhdGV8cHJvdGVjdGVkKVxccyspPyhzdGF0aWNcXHMrKT9mdW5jdGlvblxccyt7d29yZH1cXHMqXFwoLyxcbiAgICBdLFxuICAgIGZpbGVzOiBbJyouaGgnXSxcbiAgfSxcblxuICBSdWJ5OiB7XG4gICAgd29yZDogL1swLTlhLXpBLVpfXSsvLFxuICAgIHJlZ2V4ZXM6IFtcbiAgICAgIC8oXnxcXHMpY2xhc3NcXHMre3dvcmR9KFxcc3wkKS8sXG4gICAgICAvKF58XFxzKW1vZHVsZVxccyt7d29yZH0oXFxzfCQpLyxcbiAgICAgIC8oXnxcXHMpZGVmXFxzKyg/OnNlbGZcXC4pP3t3b3JkfVxccypcXCg/LyxcbiAgICAgIC8oXnxcXHMpc2NvcGVcXHMrOnt3b3JkfVxccypcXCg/LyxcbiAgICAgIC8oXnxcXHMpYXR0cl9hY2Nlc3Nvclxccys6e3dvcmR9KFxcc3wkKS8sXG4gICAgICAvKF58XFxzKWF0dHJfcmVhZGVyXFxzKzp7d29yZH0oXFxzfCQpLyxcbiAgICAgIC8oXnxcXHMpYXR0cl93cml0ZXJcXHMrOnt3b3JkfShcXHN8JCkvLFxuICAgICAgLyhefFxccylkZWZpbmVfbWV0aG9kXFxzKzo/e3dvcmR9XFxzKlxcKD8vLFxuICAgIF0sXG4gICAgZmlsZXM6IFsnKi5yYicsICcqLnJ1JywgJyouaGFtbCcsICcqLmVyYicsICcqLnJha2UnXSxcbiAgfSxcblxuICBQdXBwZXQ6IHtcbiAgICB3b3JkOiAvWzAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW1xuICAgICAgLyhefFxccyljbGFzc1xccyt7d29yZH0oXFxzfCQpLyxcbiAgICBdLFxuICAgIGZpbGVzOiBbJyoucHAnXSxcbiAgfSxcblxuICBLUkw6IHtcbiAgICB3b3JkOiAvWzAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW1xuICAgICAgLyhefFxccylERUZcXHMre3dvcmR9XFxzKlxcKC8sXG4gICAgICAvKF58XFxzKURFQ0xcXHMrXFx3Kj97d29yZH1cXHMqPT8vLFxuICAgICAgLyhefFxccykoU0lHTkFMfElOVHxCT09MfFJFQUx8U1RSVUN8Q0hBUnxFTlVNfEVYVHxcXHMpXFxzKlxcdyp7d29yZH0uKi8sXG4gICAgXSxcbiAgICBmaWxlczogWycqLnNyYycsICcqLmRhdCddLFxuICB9LFxuXG4gIFBlcmw6IHtcbiAgICB3b3JkOiAvWzAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW1xuICAgICAgLyhefFxccylzdWJcXHMre3dvcmR9XFxzKlxcey8sXG4gICAgICAvKF58XFxzKXBhY2thZ2VcXHMrKFxcdys6Oikqe3dvcmR9XFxzKjsvLFxuICAgIF0sXG4gICAgZmlsZXM6IFsnKi5wbScsICcqLnBsJ10sXG4gIH0sXG5cbiAgJ0MvQysrJzoge1xuICAgIHdvcmQ6IC9bMC05YS16QS1aX10rLyxcbiAgICByZWdleGVzOiBbXG4gICAgICAvKF58XFxzKWNsYXNzXFxzK3t3b3JkfShcXHN8OikvLFxuICAgICAgLyhefFxccylzdHJ1Y3RcXHMre3dvcmR9KFxcc3xcXHt8JCkvLFxuICAgICAgLyhefFxccyllbnVtXFxzK3t3b3JkfShcXHN8XFx7fCQpLyxcbiAgICAgIC8oXnxcXHMpI2RlZmluZVxccyt7d29yZH0oXFxzfFxcKHwkKS8sXG4gICAgICAvKF58XFxzKWZpbGVzZGVmXFxzLiooXFxzfFxcKnxcXCgpe3dvcmR9KFxcc3w7fFxcKXwkKS8sXG4gICAgICAvKF58XFxzfFxcKnw6fCYpe3dvcmR9XFxzKlxcKC4qXFwpKFxccyp8XFxzKmNvbnN0XFxzKikoXFx7fCQpLyxcbiAgICBdLFxuICAgIGZpbGVzOiBbJyouYycsICcqLmNjJywgJyouY3BwJywgJyouY3h4JywgJyouaCcsICcqLmhoJywgJyouaHBwJywgJyouaW5jJ10sXG4gIH0sXG5cbiAgU2hlbGw6IHtcbiAgICB3b3JkOiAvWzAtOWEtekEtWl9dKy8sXG4gICAgcmVnZXhlczogW1xuICAgICAgLyhefFxccyl7d29yZH1cXHMqXFwoXFwpXFxzKlxcey8sXG4gICAgXSxcbiAgICBmaWxlczogWycqLnNoJ10sXG4gIH0sXG59O1xuIl19