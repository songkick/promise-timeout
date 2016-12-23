# promise-timeout [![Build Status](https://travis-ci.org/songkick/promise-timeout.svg)](https://travis-ci.org/songkick/promise-timeout) [![Code Climate](https://codeclimate.com/github/songkick/promise-timeout/badges/gpa.svg)](https://codeclimate.com/github/songkick/promise-timeout) [![Test Coverage](https://codeclimate.com/github/songkick/promise-timeout/badges/coverage.svg)](https://codeclimate.com/github/songkick/promise-timeout/coverage)

Reject a promise if it does not resolve before specified delay

```js
var timeoutPromise = require('@songkick/promise-timeout');

var hundredMilTimeout = timeoutPromise({delay: 100 });
var boundToReject = hundredMilTimeout(resolvesAfter200);

boundToReject().then(function(result){
  // never called here,
  // but if `delay` was >= 300,
  // result would be === 'yay!'
}).catch(function(err){
  // err instanceof timeoutPromise.TimeoutError === true
  // err === {
  //   message: 'Promise resolution timed out',
  //   settings: {
  //    delay: 100
  //   },
  //   fn: resolvesAfter200
  // }
});

// or if the initial promise rejects before the delay:
//.catch(function(err){
  // err is the original error
//});

function resolvesAfter200() {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, 200)
  });
}
```

## Options

`delay`: the delay before the promise gets rejected

## See also

`promise-timeout` composes really well with the following promise helper:

* [`promise-retry`](https://github.com/songkick/promise-retry):
