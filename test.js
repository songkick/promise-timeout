var tap = require('tap');
var timeoutPromise = require('./index');

tap.test('synchronous resolution', function (t) {

    t.plan(1);

    var originalResult = 'good';

    function synchronousResolve() {
        return Promise.resolve(originalResult);
    }

    timeoutPromise({delay: 100})(synchronousResolve)()
        .catch(function (err) {
            t.bailout('the promise rejected')
        })
        .then(function (result) {
            t.equal(result, originalResult, 'resolved result is not original result');
        });

});

tap.test('synchronous rejection', function (t) {

    t.plan(1);

    var originalError = 'bad';

    function synchronousReject() {
        return Promise.reject(originalError);
    }

    timeoutPromise({delay: 100})(synchronousReject)()
        .then(function (err) {
            t.bailout('the promise resolved')
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
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(originalResult);
            }, 1 * tick);
        });
    }

    timeoutPromise({delay: 2 * tick})(asynchronousResolve)()
        .catch(function (err) {
            t.bailout('the promise rejected')
        })
        .then(function (result) {
            t.equal(result, originalResult, 'resolved result is not original result');
        });
});

tap.test('above delay async resolution', function (t) {
    t.plan(4);

    var originalResult = 'good';
    var tick = 20;

    function asynchronousResolve() {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(originalResult);
            }, 2 * tick);
        });
    }

    timeoutPromise({delay: 1 * tick})(asynchronousResolve)()
        .then(function (err) {
            t.bailout('the promise resolved')
        })
        .catch(function (error) {
            t.ok(error instanceof timeoutPromise.TimeoutError);
            t.equal(error.fn, asynchronousResolve);
            t.equal(error.settings.delay, 1 * tick, 'it did not return the delay setting');
            t.equal(error.message, 'Initial promise resolution timed out');
        });
});

tap.test('above delay async rejection', function (t) {
    // Same as above but we want to make sure we discard it anyway
    t.plan(4);

    var originalRejection = 'bad';
    var tick = 20;

    function asynchronousReject() {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(originalRejection);
            }, 2 * tick);
        });
    }

    timeoutPromise({delay: 1 * tick})(asynchronousReject)()
        .then(function (err) {
            t.bailout('the promise resolved')
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
    };

    function asyncResolve() {
        return new Promise(function(resolve, reject) {
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
