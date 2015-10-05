var tap = require('tap');
var timeoutPromise = require('./index');

tap.test('it should handle synchronous resolution', function (t) {

    function synchronousResolve() {
        return Promise.resolve(originalResult);
    }
    var originalResult = 'good';

    t.plan(1);

    timeoutPromise({delay: 50})(synchronousResolve)()
        .catch(function () {
            t.bailout('the promise rejected');
        })
        .then(function (result) {
            t.equal(result, originalResult, 'resolved result is not original result');
        });

});

tap.test('it rejects right way when original promise rejects', function (t) {

    t.plan(1);

    var originalError = 'bad';

    function synchronousReject() {
        return Promise.reject(originalError);
    }

    timeoutPromise({delay: 100})(synchronousReject)()
        .then(function () {
            t.bailout('the promise resolved');
        })
        .catch(function (error) {
            t.equal(error, originalError, 'resolved error is not original error');
        });
});

tap.test('below delay async resolution', function (t) {
    t.plan(1);

    var originalResult = 'good';
    var tick = 20;

    function asynchronousResolve() {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(originalResult);
            }, 1 * tick);
        });
    }

    timeoutPromise({delay: 2 * tick})(asynchronousResolve)()
        .catch(function () {
            t.bailout('the promise rejected');
        })
        .then(function (result) {
            t.equal(result, originalResult, 'resolved result is not original result');
        });
});

tap.test('above delay async resolution', function (t) {

    function asynchronousResolve() {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(originalResult);
            }, 3 * tick);
        });
    }

    t.plan(4);

    var originalResult = 'good';
    var tick = 15;

    timeoutPromise({delay: 2 * tick})(asynchronousResolve)()
        .then(function () {
            t.bailout('the promise resolved');
        })
        .catch(function (error) {
            t.equal(error.fn, asynchronousResolve);
            t.equal(error.settings.delay, 2 * tick, 'it did not return the delay setting');
            t.equal(error.message, 'Initial promise resolution timed out');
            t.ok(error instanceof timeoutPromise.TimeoutError);
        });
});

tap.test('above delay async rejection', function (t) {
    // Same as above but we want to make sure we discard it anyway
    t.plan(4);

    var originalRejection = 'bad';
    var tick = 20;

    function asynchronousReject() {
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(originalRejection);
            }, 2 * tick);
        });
    }

    timeoutPromise({delay: 1 * tick})(asynchronousReject)()
        .then(function () {
            t.bailout('the promise resolved');
        })
        .catch(function (error) {
            t.ok(error instanceof timeoutPromise.TimeoutError);
            t.equal(error.fn, asynchronousReject);
            t.equal(error.settings.delay, 1 * tick, 'it did not return the delay setting');
            t.equal(error.message, 'Initial promise resolution timed out');
        });
});

tap.test('default delay is 0ms', function(t){
    t.plan(2);

    function syncResolve() {
        return Promise.resolve('yaySync');
    }

    function asyncResolve() {
        return new Promise(function(resolve) {
            setTimeout(function(){
                resolve('yayAsync');
            }, 10);
        });
    }

    timeoutPromise({delay:null})(syncResolve)().catch(function(){
        t.bailout('promise was rejected while it should have resolved immediatly');
    }).then(function(response){
        t.ok(response);
    });

    timeoutPromise({delay:null})(asyncResolve)().then(function(){
        t.bailout('promise was resolve while it should have rejected immediatly');
    }).catch(function(error){
        t.ok(error);
    });
});
