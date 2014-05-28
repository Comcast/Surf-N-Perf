Surf-N-Perf
==============

Micro-library for gathering frontend web page performance data.  

[![Build Status](https://travis-ci.org/Comcast/Surf-N-Perf.svg?branch=master)](https://travis-ci.org/Comcast/Surf-N-Perf)

## Usage

### Dependencies

[Underscore](http://underscorejs.org/) is a dependency, so make sure it is referenced in your code prior to surfnperf.

### Including the code in your project

There are 2 pieces of code that need to be included in your webpage:

**1.** The following code must be included as high up in the source code of your base HTML document as possible, ideally right after the opening ```<head>``` tag:

```html
<script>
  var SURF_N_PERF = {
    marks: {},
    highResMarks: {}
  };

  SURF_N_PERF.marks.pageStart = (new Date()).getTime();
  
  if(window.performance) {
    if(window.performance.now) {
      SURF_N_PERF.highResMarks.pageStart = window.performance.now();
    }
    if(window.performance.mark) {
      window.performance.mark('pageStart');
    }
  }

  SURF_N_PERF.setPageLoad = function() {
    SURF_N_PERF.marks.loadEventEnd = (new Date()).getTime();

    if(window.performance && window.performance.now) {
      SURF_N_PERF.highResMarks.loadEventEnd = window.performance.now();
    }
  };

  if(window.addEventListener) {
    window.addEventListener('load', SURF_N_PERF.setPageLoad, false);
  } else {
    window.attachEvent('onload', SURF_N_PERF.setPageLoad);
  }
</script>
```

That provides support for the following:
- A "pageStart" mark for browsers that do not support [Navigation Timing](http://www.w3.org/TR/navigation-timing/) which can be used to compute durations from when the page first started loading (specifically, this mark falls between the [domLoading](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-domloading) and [domInteractive](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-dominteractive) attributes of Navigation Timing)
- "pageStart" marks for browsers that support [High Resolution Time](http://www.w3.org/TR/hr-time/) and/or [User Timing](http://www.w3.org/TR/user-timing/) so that "pageStart" can be used as a consistent starting point for duration calculations across all browsers regardless of their supported features
- A "loadEventEnd" mark for browsers that do not support [Navigation Timing](http://www.w3.org/TR/navigation-timing/) which can be used to compute durations from when the load event of the document is completed ([loadEventEnd](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-loadend))
- A "loadEventEnd" [DOMHighResTimeStamp](http://www.w3.org/TR/hr-time/#sec-DOMHighResTimeStamp) mark for calculating high resolution durations between a Navigation Timing mark and a user mark in browsers that support [High Resolution Time](http://www.w3.org/TR/hr-time/) but don't support [User Timing](http://www.w3.org/TR/user-timing/)

**2.** Then just drop the [surfnperf.js](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.js) in your codebase and reference that JavaScript file in your HTML document, again making sure that Underscore is referenced first. If you're using [RequireJS](http://requirejs.org/), it registers itself as 'surfnperf'.

### Storing & Retrieving Performance Data

Details in the [JavaScript API](https://github.com/Comcast/Surf-N-Perf/wiki/JavaScript-API) page in the wiki

## Running Tests

Tests are written in [Jasmine](http://jasmine.github.io/) and run with [Karma](http://karma-runner.github.io/)

Install the dependencies to run the tests with:

```bash
$ npm install
```

And then run the tests with:

```bash
$ npm run-script karma
```

By default, it will run the tests using [PhantomJS](http://phantomjs.org/). You can also run the tests in any browser by going to http://localhost:9876/

## License

Licensed under the [MIT License](https://github.com/Comcast/Surf-N-Perf/blob/master/LICENSE)
