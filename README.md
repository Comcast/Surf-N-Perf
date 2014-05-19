frontend-performance-data
=========================

Micro-library for gathering web page performance data

## Usage

### Dependencies

[Underscore](http://underscorejs.org/) is a dependency, so make sure it is referenced in your code prior to frontendPerformanceData.js.

### Including the code in your project

There are 2 pieces of code that need to be included in your webpage:

**1.** The following code must be included as high up in the source code of your base HTML document as possible, ideally right after the opening ```<head>``` tag:

```html
<script>
  var FE_PERF_DATA = {
    marks: {},
    highResMarks: {}
  };

  FE_PERF_DATA.marks.pageStart = (new Date()).getTime();

  FE_PERF_DATA.setPageLoad = function() {
    FE_PERF_DATA.marks.loadEventEnd = (new Date()).getTime();

    if(window.performance && window.performance.now) {
      FE_PERF_DATA.highResMarks.loadEventEnd = window.performance.now();
    }
  };

  if(window.addEventListener) {
    window.addEventListener('load', FE_PERF_DATA.setPageLoad, false);
  } else {
    window.attachEvent('onload', FE_PERF_DATA.setPageLoad);
  }
</script>
```

That provides support for the following:
- A "pageStart" mark for browsers that do not support [Navigation Timing](http://www.w3.org/TR/navigation-timing/) which can be used to compute durations from when the page first started loading (specifically, this mark falls between the [domLoading](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-domloading) and [domInteractive](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-dominteractive) attributes of Navigation Timing)
- A "loadEventEnd" mark for browsers that do not support [Navigation Timing](http://www.w3.org/TR/navigation-timing/) which can be used to compute durations from when the load event of the document is completed ([loadEventEnd](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-loadend))
- A "loadEventEnd" [DOMHighResTimeStamp](http://www.w3.org/TR/hr-time/#sec-DOMHighResTimeStamp) mark for accurately calculating durations from when the load event of the document is completed in browsers that support [High Resolution Time](http://www.w3.org/TR/hr-time/)

**2.** Then just drop the [frontendPerformanceData.js](https://github.com/Comcast/frontend-performance-data/blob/master/frontendPerformanceData.js) in your codebase and reference that JavaScript file in your HTML document, again making sure that Underscore is referenced first. If you're using [RequireJS](http://requirejs.org/), it registers itself as 'frontendPerformanceData'.

## Running Tests

Tests are written in [Jasmine](http://jasmine.github.io/) and run with [Karma](http://karma-runner.github.io/)

Install the dependencies to run the tests with:

```bash
$ npm install
```

And then run the tests with:

```bash
$ npm test
```

By default, it will run the tests using [PhantomJS](http://phantomjs.org/). You can also run the tests in any browser by going to http://localhost:9876/

## License

Licensed under the [MIT License](https://github.com/Comcast/frontend-performance-data/blob/master/LICENSE)
