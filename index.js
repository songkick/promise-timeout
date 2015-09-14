var factory = function (createExecutor) {
    return function (settings) {
        return function (fn) {
            return function () {
                return new Promise(createExecutor(fn, settings));
            };
        };
    }
};

var promiseTimeout = factory(function (fn, settings) {

    settings = settings || {};
    settings.delay = parseInt(settings.delay, 10) || 0;

    function executor(resolve, reject) {
        var hasAlreadyCalledBack = false;

        function generateCallback(callback) {
            return function callbackUnlessAlreadyDone(payload) {
                clearTimeout(timeout);
                if (!hasAlreadyCalledBack) {
                    hasAlreadyCalledBack = true;
                    callback(payload);
                }
            }
        }

        // original promise
        fn().then(generateCallback(resolve))
            .catch(generateCallback(reject));

        var timeout = setTimeout(function () {
            generateCallback(reject)(new TimeoutError(settings, fn));
        }, settings.delay);
    }

    return executor;
});

var TimeoutError = function (settings, fn) {
    this.message = 'Initial promise resolution timed out';
    this.settings = settings;
    this.fn = fn;
};
TimeoutError.prototype = Object.create(Error.prototype);

promiseTimeout.TimeoutError = TimeoutError;

module.exports = promiseTimeout;
