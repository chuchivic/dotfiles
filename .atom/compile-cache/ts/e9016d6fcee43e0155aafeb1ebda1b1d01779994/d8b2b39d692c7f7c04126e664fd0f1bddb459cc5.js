/** Module to log debug prints if debug prints are enabled */
var Logger = (function () {
    function Logger() {
        this._enabled = false;
        if (Logger._instance) {
            throw new Error("Error: Instantiation failed: Use Logger.getInstance() instead of new.");
        }
        Logger._instance = this;
    }
    Logger.getInstance = function () {
        return Logger._instance;
    };
    Logger.prototype.enableLogger = function () {
        if (!this._enabled) {
            this._enabled = true;
            console.log(">>> DEBUG ENABLED <<<");
        }
    };
    Logger.prototype.disableLogger = function () {
        if (this._enabled) {
            this._enabled = false;
            console.log(">>> DEBUG DISABLED <<<");
        }
    };
    Logger.prototype.log = function (message) {
        if (this._enabled) {
            console.log(message);
        }
    };
    Logger._instance = new Logger();
    return Logger;
})();
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL2hvbWUvamVzdXMvLmF0b20vcGFja2FnZXMvbGludGVyLXB5dGhvbi9zcmMvbG9nZ2VyLnRzIiwic291cmNlcyI6WyIvaG9tZS9qZXN1cy8uYXRvbS9wYWNrYWdlcy9saW50ZXItcHl0aG9uL3NyYy9sb2dnZXIudHMiXSwibmFtZXMiOlsiTG9nZ2VyIiwiTG9nZ2VyLmNvbnN0cnVjdG9yIiwiTG9nZ2VyLmdldEluc3RhbmNlIiwiTG9nZ2VyLmVuYWJsZUxvZ2dlciIsIkxvZ2dlci5kaXNhYmxlTG9nZ2VyIiwiTG9nZ2VyLmxvZyJdLCJtYXBwaW5ncyI6IkFBQUEsNkRBQTZEO0FBRTdELElBQWEsTUFBTTtJQU1mQSxTQU5TQSxNQUFNQTtRQUlQQyxhQUFRQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUc3QkEsRUFBRUEsQ0FBQUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQUEsQ0FBQ0E7WUFDakJBLE1BQU1BLElBQUlBLEtBQUtBLENBQUNBLHVFQUF1RUEsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO0lBQzVCQSxDQUFDQTtJQUVhRCxrQkFBV0EsR0FBekJBO1FBRUlFLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBO0lBQzVCQSxDQUFDQTtJQUVNRiw2QkFBWUEsR0FBbkJBO1FBQ0lHLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNyQkEsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQTtRQUN6Q0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFTUgsOEJBQWFBLEdBQXBCQTtRQUNJSSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDdEJBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLENBQUNBO0lBQ0xBLENBQUNBO0lBRU1KLG9CQUFHQSxHQUFWQSxVQUFXQSxPQUFPQTtRQUNkSyxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQkEsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLENBQUNBO0lBQ0xBLENBQUNBO0lBbENjTCxnQkFBU0EsR0FBVUEsSUFBSUEsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFtQ25EQSxhQUFDQTtBQUFEQSxDQUFDQSxBQXJDRCxJQXFDQztBQXJDWSxjQUFNLEdBQU4sTUFxQ1osQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKiBNb2R1bGUgdG8gbG9nIGRlYnVnIHByaW50cyBpZiBkZWJ1ZyBwcmludHMgYXJlIGVuYWJsZWQgKi9cblxuZXhwb3J0IGNsYXNzIExvZ2dlciB7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBfaW5zdGFuY2U6TG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXG4gICAgcHJpdmF0ZSBfZW5hYmxlZDpib29sZWFuID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYoTG9nZ2VyLl9pbnN0YW5jZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvcjogSW5zdGFudGlhdGlvbiBmYWlsZWQ6IFVzZSBMb2dnZXIuZ2V0SW5zdGFuY2UoKSBpbnN0ZWFkIG9mIG5ldy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgTG9nZ2VyLl9pbnN0YW5jZSA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOkxvZ2dlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIExvZ2dlci5faW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIGVuYWJsZUxvZ2dlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiPj4+IERFQlVHIEVOQUJMRUQgPDw8XCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGRpc2FibGVMb2dnZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIj4+PiBERUJVRyBESVNBQkxFRCA8PDxcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbG9nKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VuYWJsZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19