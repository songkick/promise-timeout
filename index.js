module.exports = function(settings){
  return function(fn){
    return function(){
      return new Promise(function(resolve, reject) {

        var hasAlreadyCalledBack = false;

        function generateCallback(callback){
          return function callbackUnlessAlreadyDone(payload){
            clearTimeout(timeout);
            if (!hasAlreadyCalledBack) {
              hasAlreadyCalledBack = true;
              callback(payload);
            }
          }
        }

        var originalPromise = fn();

        originalPromise.then(generateCallback(resolve));
        originalPromise.catch(generateCallback(reject));

        var timeout = setTimeout(function(){
          generateCallback(reject)(new TimeoutError(settings, fn));
        }, settings.delay);
      })
    }
  }
}

var TimeoutError = module.exports.TimeoutError = function(settings, fn){
  this.message = 'Initial promise resolution timed out';
  this.delay = settings.delay;
  this.fn = fn;
};
TimeoutError.prototype = Object.create(Error.prototype);
