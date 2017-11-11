(function() {
  var MarkdownPreviewView, _, fs, imageRegister, isMarkdownPreviewView, path, pathWatcher, pathWatcherPath, refreshImages, srcClosure;

  fs = require('fs-plus');

  _ = require('lodash');

  path = require('path');

  pathWatcherPath = path.join(atom.packages.resourcePath, '/node_modules/pathwatcher/lib/main');

  pathWatcher = require(pathWatcherPath);

  imageRegister = {};

  MarkdownPreviewView = null;

  isMarkdownPreviewView = function(object) {
    if (MarkdownPreviewView == null) {
      MarkdownPreviewView = require('./markdown-preview-view');
    }
    return object instanceof MarkdownPreviewView;
  };

  refreshImages = _.debounce((function(src) {
    var item, j, len, ref;
    if (atom.workspace != null) {
      ref = atom.workspace.getPaneItems();
      for (j = 0, len = ref.length; j < len; j++) {
        item = ref[j];
        if (isMarkdownPreviewView(item)) {
          item.refreshImages(src);
        }
      }
    }
  }), 250);

  srcClosure = function(src) {
    return function(event, path) {
      if (event === 'change' && fs.isFileSync(src)) {
        imageRegister[src].version = Date.now();
      } else {
        imageRegister[src].watcher.close();
        delete imageRegister[src];
      }
      refreshImages(src);
    };
  };

  module.exports = {
    removeFile: function(file) {
      return imageRegister = _.mapValues(imageRegister, function(image) {
        image.files = _.without(image.files, file);
        image.files = _.filter(image.files, fs.isFileSync);
        if (_.isEmpty(image.files)) {
          image.watched = false;
          image.watcher.close();
        }
        return image;
      });
    },
    getVersion: function(image, file) {
      var files, i, version;
      i = _.get(imageRegister, image, {});
      if (_.isEmpty(i)) {
        if (fs.isFileSync(image)) {
          version = Date.now();
          imageRegister[image] = {
            path: image,
            watched: true,
            files: [file],
            version: version,
            watcher: pathWatcher.watch(image, srcClosure(image))
          };
          return version;
        } else {
          return false;
        }
      }
      files = _.get(i, 'files');
      if (!_.contains(files, file)) {
        imageRegister[image].files.push(file);
      }
      version = _.get(i, 'version');
      if (!version && fs.isFileSync(image)) {
        version = Date.now();
        imageRegister[image].version = version;
      }
      return version;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL2xpYi9pbWFnZS13YXRjaC1oZWxwZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxlQUFBLEdBQWtCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUF4QixFQUFzQyxvQ0FBdEM7O0VBQ2xCLFdBQUEsR0FBYyxPQUFBLENBQVEsZUFBUjs7RUFFZCxhQUFBLEdBQWdCOztFQUVoQixtQkFBQSxHQUFzQjs7RUFDdEIscUJBQUEsR0FBd0IsU0FBQyxNQUFEOztNQUN0QixzQkFBdUIsT0FBQSxDQUFRLHlCQUFSOztXQUN2QixNQUFBLFlBQWtCO0VBRkk7O0VBSXhCLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxDQUFDLFNBQUMsR0FBRDtBQUMxQixRQUFBO0lBQUEsSUFBRyxzQkFBSDtBQUNFO0FBQUEsV0FBQSxxQ0FBQTs7UUFDRSxJQUFHLHFCQUFBLENBQXNCLElBQXRCLENBQUg7VUFFRSxJQUFJLENBQUMsYUFBTCxDQUFtQixHQUFuQixFQUZGOztBQURGLE9BREY7O0VBRDBCLENBQUQsQ0FBWCxFQU1MLEdBTks7O0VBUWhCLFVBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxXQUFPLFNBQUMsS0FBRCxFQUFRLElBQVI7TUFDTCxJQUFHLEtBQUEsS0FBUyxRQUFULElBQXNCLEVBQUUsQ0FBQyxVQUFILENBQWMsR0FBZCxDQUF6QjtRQUNFLGFBQWMsQ0FBQSxHQUFBLENBQUksQ0FBQyxPQUFuQixHQUE2QixJQUFJLENBQUMsR0FBTCxDQUFBLEVBRC9CO09BQUEsTUFBQTtRQUdFLGFBQWMsQ0FBQSxHQUFBLENBQUksQ0FBQyxPQUFPLENBQUMsS0FBM0IsQ0FBQTtRQUNBLE9BQU8sYUFBYyxDQUFBLEdBQUEsRUFKdkI7O01BS0EsYUFBQSxDQUFjLEdBQWQ7SUFOSztFQURJOztFQVViLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxVQUFBLEVBQVksU0FBQyxJQUFEO2FBRVYsYUFBQSxHQUFnQixDQUFDLENBQUMsU0FBRixDQUFZLGFBQVosRUFBMkIsU0FBQyxLQUFEO1FBQ3pDLEtBQUssQ0FBQyxLQUFOLEdBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxLQUFLLENBQUMsS0FBaEIsRUFBdUIsSUFBdkI7UUFDZCxLQUFLLENBQUMsS0FBTixHQUFjLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBSyxDQUFDLEtBQWYsRUFBc0IsRUFBRSxDQUFDLFVBQXpCO1FBQ2QsSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLEtBQUssQ0FBQyxLQUFoQixDQUFIO1VBQ0UsS0FBSyxDQUFDLE9BQU4sR0FBZ0I7VUFDaEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFkLENBQUEsRUFGRjs7ZUFHQTtNQU55QyxDQUEzQjtJQUZOLENBQVo7SUFVQSxVQUFBLEVBQVksU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNWLFVBQUE7TUFBQSxDQUFBLEdBQUksQ0FBQyxDQUFDLEdBQUYsQ0FBTSxhQUFOLEVBQXFCLEtBQXJCLEVBQTRCLEVBQTVCO01BQ0osSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLENBQVYsQ0FBSDtRQUNFLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxLQUFkLENBQUg7VUFDRSxPQUFBLEdBQVUsSUFBSSxDQUFDLEdBQUwsQ0FBQTtVQUNWLGFBQWMsQ0FBQSxLQUFBLENBQWQsR0FBdUI7WUFDckIsSUFBQSxFQUFNLEtBRGU7WUFFckIsT0FBQSxFQUFTLElBRlk7WUFHckIsS0FBQSxFQUFPLENBQUMsSUFBRCxDQUhjO1lBSXJCLE9BQUEsRUFBUyxPQUpZO1lBS3JCLE9BQUEsRUFBUyxXQUFXLENBQUMsS0FBWixDQUFrQixLQUFsQixFQUF5QixVQUFBLENBQVcsS0FBWCxDQUF6QixDQUxZOztBQU92QixpQkFBTyxRQVRUO1NBQUEsTUFBQTtBQVdFLGlCQUFPLE1BWFQ7U0FERjs7TUFjQSxLQUFBLEdBQVEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFOLEVBQVMsT0FBVDtNQUNSLElBQUcsQ0FBSSxDQUFDLENBQUMsUUFBRixDQUFXLEtBQVgsRUFBa0IsSUFBbEIsQ0FBUDtRQUNFLGFBQWMsQ0FBQSxLQUFBLENBQU0sQ0FBQyxLQUFLLENBQUMsSUFBM0IsQ0FBZ0MsSUFBaEMsRUFERjs7TUFHQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFOLEVBQVMsU0FBVDtNQUNWLElBQUcsQ0FBSSxPQUFKLElBQWdCLEVBQUUsQ0FBQyxVQUFILENBQWMsS0FBZCxDQUFuQjtRQUNFLE9BQUEsR0FBVSxJQUFJLENBQUMsR0FBTCxDQUFBO1FBQ1YsYUFBYyxDQUFBLEtBQUEsQ0FBTSxDQUFDLE9BQXJCLEdBQStCLFFBRmpDOzthQUdBO0lBeEJVLENBVlo7O0FBaENGIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xucGF0aFdhdGNoZXJQYXRoID0gcGF0aC5qb2luKGF0b20ucGFja2FnZXMucmVzb3VyY2VQYXRoLCAnL25vZGVfbW9kdWxlcy9wYXRod2F0Y2hlci9saWIvbWFpbicpXG5wYXRoV2F0Y2hlciA9IHJlcXVpcmUgcGF0aFdhdGNoZXJQYXRoXG5cbmltYWdlUmVnaXN0ZXIgPSB7fVxuXG5NYXJrZG93blByZXZpZXdWaWV3ID0gbnVsbCAjIERlZmVyIHVudGlsIHVzZWRcbmlzTWFya2Rvd25QcmV2aWV3VmlldyA9IChvYmplY3QpIC0+XG4gIE1hcmtkb3duUHJldmlld1ZpZXcgPz0gcmVxdWlyZSAnLi9tYXJrZG93bi1wcmV2aWV3LXZpZXcnXG4gIG9iamVjdCBpbnN0YW5jZW9mIE1hcmtkb3duUHJldmlld1ZpZXdcblxucmVmcmVzaEltYWdlcyA9IF8uZGVib3VuY2UoKChzcmMpIC0+XG4gIGlmIGF0b20ud29ya3NwYWNlP1xuICAgIGZvciBpdGVtIGluIGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpXG4gICAgICBpZiBpc01hcmtkb3duUHJldmlld1ZpZXcoaXRlbSlcbiAgICAgICAgIyBUT0RPOiBjaGVjayBhZ2FpbnN0IGltYWdlUmVnaXN0ZXJbc3JjXS52ZXJzaW9uLmZpbGVzXG4gICAgICAgIGl0ZW0ucmVmcmVzaEltYWdlcyhzcmMpXG4gIHJldHVybiksIDI1MClcblxuc3JjQ2xvc3VyZSA9IChzcmMpIC0+XG4gIHJldHVybiAoZXZlbnQsIHBhdGgpIC0+XG4gICAgaWYgZXZlbnQgaXMgJ2NoYW5nZScgYW5kIGZzLmlzRmlsZVN5bmMoc3JjKVxuICAgICAgaW1hZ2VSZWdpc3RlcltzcmNdLnZlcnNpb24gPSBEYXRlLm5vdygpXG4gICAgZWxzZVxuICAgICAgaW1hZ2VSZWdpc3RlcltzcmNdLndhdGNoZXIuY2xvc2UoKVxuICAgICAgZGVsZXRlIGltYWdlUmVnaXN0ZXJbc3JjXVxuICAgIHJlZnJlc2hJbWFnZXMoc3JjKVxuICAgIHJldHVyblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHJlbW92ZUZpbGU6IChmaWxlKSAtPlxuXG4gICAgaW1hZ2VSZWdpc3RlciA9IF8ubWFwVmFsdWVzIGltYWdlUmVnaXN0ZXIsIChpbWFnZSkgLT5cbiAgICAgIGltYWdlLmZpbGVzID0gXy53aXRob3V0IGltYWdlLmZpbGVzLCBmaWxlXG4gICAgICBpbWFnZS5maWxlcyA9IF8uZmlsdGVyIGltYWdlLmZpbGVzLCBmcy5pc0ZpbGVTeW5jXG4gICAgICBpZiBfLmlzRW1wdHkgaW1hZ2UuZmlsZXNcbiAgICAgICAgaW1hZ2Uud2F0Y2hlZCA9IGZhbHNlXG4gICAgICAgIGltYWdlLndhdGNoZXIuY2xvc2UoKVxuICAgICAgaW1hZ2VcblxuICBnZXRWZXJzaW9uOiAoaW1hZ2UsIGZpbGUpIC0+XG4gICAgaSA9IF8uZ2V0KGltYWdlUmVnaXN0ZXIsIGltYWdlLCB7fSlcbiAgICBpZiBfLmlzRW1wdHkoaSlcbiAgICAgIGlmIGZzLmlzRmlsZVN5bmMgaW1hZ2VcbiAgICAgICAgdmVyc2lvbiA9IERhdGUubm93KClcbiAgICAgICAgaW1hZ2VSZWdpc3RlcltpbWFnZV0gPSB7XG4gICAgICAgICAgcGF0aDogaW1hZ2UsXG4gICAgICAgICAgd2F0Y2hlZDogdHJ1ZSxcbiAgICAgICAgICBmaWxlczogW2ZpbGVdXG4gICAgICAgICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICAgICAgICB3YXRjaGVyOiBwYXRoV2F0Y2hlci53YXRjaChpbWFnZSwgc3JjQ2xvc3VyZShpbWFnZSkpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb25cbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBmaWxlcyA9IF8uZ2V0KGksICdmaWxlcycpXG4gICAgaWYgbm90IF8uY29udGFpbnMoZmlsZXMsIGZpbGUpXG4gICAgICBpbWFnZVJlZ2lzdGVyW2ltYWdlXS5maWxlcy5wdXNoIGZpbGVcblxuICAgIHZlcnNpb24gPSBfLmdldChpLCAndmVyc2lvbicpXG4gICAgaWYgbm90IHZlcnNpb24gYW5kIGZzLmlzRmlsZVN5bmMgaW1hZ2VcbiAgICAgIHZlcnNpb24gPSBEYXRlLm5vdygpXG4gICAgICBpbWFnZVJlZ2lzdGVyW2ltYWdlXS52ZXJzaW9uID0gdmVyc2lvblxuICAgIHZlcnNpb25cbiJdfQ==
