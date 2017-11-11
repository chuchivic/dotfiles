(function() {
  var GitRun, capitalize, customCommands, git, service;

  git = require('./git');

  GitRun = require('./models/git-run');

  capitalize = function(text) {
    return text.split(' ').map(function(word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  };

  customCommands = [];

  service = {};

  if (atom.config.get('git-plus.experimental.customCommands')) {
    service.getCustomCommands = function() {
      return customCommands;
    };
    service.getRepo = git.getRepo;
    service.registerCommand = function(element, name, fn) {
      var displayName;
      atom.commands.add(element, name, fn);
      displayName = capitalize(name.split(':')[1].replace(/-/g, ' '));
      return customCommands.push([name, displayName, fn]);
    };
    service.run = GitRun;
  }

  module.exports = Object.freeze(service);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL3NlcnZpY2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBQ04sTUFBQSxHQUFTLE9BQUEsQ0FBUSxrQkFBUjs7RUFFVCxVQUFBLEdBQWEsU0FBQyxJQUFEO1dBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQWUsQ0FBQyxHQUFoQixDQUFvQixTQUFDLElBQUQ7YUFBVSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBUixDQUFBLENBQUEsR0FBd0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmO0lBQWxDLENBQXBCLENBQXdFLENBQUMsSUFBekUsQ0FBOEUsR0FBOUU7RUFBVjs7RUFFYixjQUFBLEdBQWlCOztFQUVqQixPQUFBLEdBQVU7O0VBRVYsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0NBQWhCLENBQUg7SUFDRSxPQUFPLENBQUMsaUJBQVIsR0FBNEIsU0FBQTthQUFHO0lBQUg7SUFDNUIsT0FBTyxDQUFDLE9BQVIsR0FBa0IsR0FBRyxDQUFDO0lBQ3RCLE9BQU8sQ0FBQyxlQUFSLEdBQTBCLFNBQUMsT0FBRCxFQUFVLElBQVYsRUFBZ0IsRUFBaEI7QUFDeEIsVUFBQTtNQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixPQUFsQixFQUEyQixJQUEzQixFQUFpQyxFQUFqQztNQUNBLFdBQUEsR0FBYyxVQUFBLENBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQWdCLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBbkIsQ0FBMkIsSUFBM0IsRUFBaUMsR0FBakMsQ0FBWDthQUNkLGNBQWMsQ0FBQyxJQUFmLENBQW9CLENBQUMsSUFBRCxFQUFPLFdBQVAsRUFBb0IsRUFBcEIsQ0FBcEI7SUFId0I7SUFJMUIsT0FBTyxDQUFDLEdBQVIsR0FBYyxPQVBoQjs7O0VBU0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkO0FBbEJqQiIsInNvdXJjZXNDb250ZW50IjpbImdpdCA9IHJlcXVpcmUgJy4vZ2l0J1xuR2l0UnVuID0gcmVxdWlyZSAnLi9tb2RlbHMvZ2l0LXJ1bidcblxuY2FwaXRhbGl6ZSA9ICh0ZXh0KSAtPiB0ZXh0LnNwbGl0KCcgJykubWFwKCh3b3JkKSAtPiB3b3JkWzBdLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnN1YnN0cmluZygxKSkuam9pbignICcpXG5cbmN1c3RvbUNvbW1hbmRzID0gW11cblxuc2VydmljZSA9IHt9XG5cbmlmIGF0b20uY29uZmlnLmdldCgnZ2l0LXBsdXMuZXhwZXJpbWVudGFsLmN1c3RvbUNvbW1hbmRzJylcbiAgc2VydmljZS5nZXRDdXN0b21Db21tYW5kcyA9IC0+IGN1c3RvbUNvbW1hbmRzXG4gIHNlcnZpY2UuZ2V0UmVwbyA9IGdpdC5nZXRSZXBvXG4gIHNlcnZpY2UucmVnaXN0ZXJDb21tYW5kID0gKGVsZW1lbnQsIG5hbWUsIGZuKSAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkIGVsZW1lbnQsIG5hbWUsIGZuXG4gICAgZGlzcGxheU5hbWUgPSBjYXBpdGFsaXplKG5hbWUuc3BsaXQoJzonKVsxXS5yZXBsYWNlKC8tL2csICcgJykpXG4gICAgY3VzdG9tQ29tbWFuZHMucHVzaCBbbmFtZSwgZGlzcGxheU5hbWUsIGZuXVxuICBzZXJ2aWNlLnJ1biA9IEdpdFJ1blxuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUgc2VydmljZVxuIl19
