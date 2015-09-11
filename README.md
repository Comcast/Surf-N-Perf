Surf-N-Perf 
==============

Micro-library for gathering frontend web page performance data. 

Surf-N-Perf provides a simple to use API to gather [User Timing](http://www.w3.org/TR/user-timing/) and other important performance data in any browser.

Tired of typing `window.performance.getEntriesByName('foo')[0].startTime;` with your User Timing Polyfill?

With Surf-N-Perf, all you need  is `surfnperf.getMark('foo')';`, and that's just the start!

Check out the [JavaScript API](https://github.com/Comcast/Surf-N-Perf/wiki/JavaScript-API) to see all of its features.

Available as both an [NPM Module](https://www.npmjs.com/package/surfnperf) and a [Ruby Gem](https://rubygems.org/gems/surfnperf).

[![Build Status](https://travis-ci.org/Comcast/Surf-N-Perf.svg?branch=master)](https://travis-ci.org/Comcast/Surf-N-Perf)

## Usage

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

**2.** Then just drop the [surfnperf.min.js](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.min.js) in your codebase and reference that JavaScript file in your HTML document. If you're using [RequireJS](http://requirejs.org/) or [Browserify](http://browserify.org/), it registers itself as 'surfnperf'.

### Storing & Retrieving Performance Data

Details in the [JavaScript API](https://github.com/Comcast/Surf-N-Perf/wiki/JavaScript-API) page in the wiki

## Ruby Project Integration

### Using within a Rails project

The [surfnperf Ruby Gem](https://rubygems.org/gems/surfnperf) allows you to quickly & easily integrate Surf-N-Perf into your Rails projects. To include the necessary files, add `surfnperf` to your `Gemfile`:

```ruby
gem 'surfnperf'
```

After a `$ bundle install`, you'll be able to include the [main JavaScript file](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.js) in your JavaScript manifest by simply adding:

```
//= require surfnperf
```

The necessary script for the ```<head>``` of your HTML document is also available to you via a [partial template](http://guides.rubyonrails.org/layouts_and_rendering.html#using-partials) that you can include in the appropriate layout file for your page, such as `app/views/layouts/application.html.erb` by simply adding this line:

```erb
<%= render "surfnperf/head" %>
```

Those 3 lines of code are all your need to get started using Surf-N-Perf in Rails!

### Using within other Ruby projects that integrate with Sprockets

[Sprockets](https://github.com/sstephenson/sprockets) is what powers the [Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html) in Rails, as well as other Ruby website tools such as [Middleman](https://middlemanapp.com/). For these other Ruby projects that use [Sprockets](https://middlemanapp.com/advanced/asset_pipeline/), integration is similar to the Rails instructions above, with one extra step:

Add `surfnperf` to your `Gemfile`:

```ruby
gem 'surfnperf'
```

After a `$ bundle install`, include [surfnperf.js](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.js) in your JavaScript manifest by adding:

```
//= require surfnperf
```

For now, you'll have to manually include the [necessary script](#including-the-code-in-your-project) for the ```<head>``` of your HTML document. If someone would like to update the Ruby Gem to work as a proper [Middleman Extension](https://middlemanapp.com/advanced/custom_extensions/), we'd happily accept a [pull request](https://github.com/Comcast/Surf-N-Perf/issues/35).

## Running Tests & Other Development Tools

Tests are written in [Jasmine](http://jasmine.github.io/) and run with [Karma](http://karma-runner.github.io/)

Install the dependencies by executing this command from the root of your Surf-N-Perf project directory:

```bash
$ npm install
```

And then run the tests, JSHint, beautify your code & generate the minified file with:

```bash
$ grunt dev
```

By default, it will run the tests using [PhantomJS](http://phantomjs.org/). You can also run the tests in any browser by going to http://localhost:9876/

The `grunt dev` process will watch for file updates, so as you modify surfnperf.js or the test files, it will automatically run jshint, jsbeautifier, uglify & the tests. To stop the watch process, press control + C

If you encounter an error related to Grunt, it may not be installed, so [go install it](http://gruntjs.com/getting-started).

## License

Licensed under the [MIT License](https://github.com/Comcast/Surf-N-Perf/blob/master/LICENSE)
