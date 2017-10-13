Surf-N-Perf
==============

Micro-library for gathering frontend web page performance data.

Surf-N-Perf provides a simple to use API to gather [User Timing](http://www.w3.org/TR/user-timing/) and other important performance data in any browser.

Tired of typing `window.performance.getEntriesByName('foo')[0].startTime;` with your User Timing Polyfill?

With Surf-N-Perf, all you need  is `surfnperf.getMark('foo')';`, and that's just the start!

Check out the [JavaScript API](https://github.com/Comcast/Surf-N-Perf/wiki/JavaScript-API) to see all of its features and the [full documentation](http://comcast.github.io/Surf-N-Perf/docs/SurfNPerf.html) for a list of methods & how to use them.

Available as an [NPM Module](https://www.npmjs.com/package/surfnperf), [Ruby Gem](https://rubygems.org/gems/surfnperf), and a [Bower](https://bower.io/) package.

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

  SURF_N_PERF.visibility = {
    initialState: document.visibilityState,
    stateUpdates: [],
    hiddenProperty: null,
    stateProperty: null,
    eventName: null,
    markChange: function() {
      var markName = 'visibility' + SURF_N_PERF.visibility.stateUpdates.length;

      if (window.performance) {
        if (window.performance.mark) {
          window.performance.mark(markName);
        }

        if (window.performance.now) {
          SURF_N_PERF.highResMarks[markName] = window.performance.now();
        }
      }

      SURF_N_PERF.marks[markName] = new Date().getTime();

      SURF_N_PERF.visibility.stateUpdates.push(document[SURF_N_PERF.visibility.stateProperty]);
    },
  };

  if('hidden' in document) {
    SURF_N_PERF.visibility.hiddenProperty = 'hidden';
    SURF_N_PERF.visibility.stateProperty = 'visibilityState';
    SURF_N_PERF.visibility.eventName = 'visibilitychange';
  } else if('webkitHidden' in document) {
    SURF_N_PERF.visibility.hiddenProperty = 'webkitHidden';
    SURF_N_PERF.visibility.stateProperty = 'webkitVisibilityState';
    SURF_N_PERF.visibility.eventName = 'webkitvisibilitychange';
    SURF_N_PERF.visibility.initialState = document[SURF_N_PERF.visibility.stateProperty];
  }

  SURF_N_PERF.setPageLoad = function() {
    SURF_N_PERF.marks.loadEventEnd = (new Date()).getTime();

    if(window.performance && window.performance.now) {
      SURF_N_PERF.highResMarks.loadEventEnd = window.performance.now();
    }
  };

  SURF_N_PERF.setFirstPaint = function() {
    SURF_N_PERF.marks.firstPaintFrame = (new Date()).getTime();

    if(window.performance && window.performance.now) {
      SURF_N_PERF.highResMarks.firstPaintFrame = window.performance.now();

      if(window.performance.mark) {
        window.performance.mark('firstPaintFrame');
      }
    }
  };

  if(window.addEventListener) {
    if (SURF_N_PERF.visibility.stateProperty) {
      document.addEventListener(SURF_N_PERF.visibility.eventName, SURF_N_PERF.visibility.markChange, false);
    }
    window.addEventListener('load', SURF_N_PERF.setPageLoad, false);
  } else {
    window.attachEvent('onload', SURF_N_PERF.setPageLoad);
  }
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(SURF_N_PERF.setFirstPaint);
  }
</script>
```

That provides support for the following:

- A `"pageStart"` mark for browsers that do not support [Navigation Timing](http://www.w3.org/TR/navigation-timing/) which can be used to compute durations from when the page first started loading (specifically, this mark falls between the [`domLoading`](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-domloading) and [`domInteractive`](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-dominteractive) attributes of Navigation Timing)
- `"pageStart"` marks for browsers that support [High Resolution Time](http://www.w3.org/TR/hr-time/) and/or [User Timing](http://www.w3.org/TR/user-timing/) so that `"pageStart"` can be used as a consistent starting point for duration calculations across all browsers regardless of their supported features
- A `"loadEventEnd"` mark for browsers that do not support [Navigation Timing](http://www.w3.org/TR/navigation-timing/) which can be used to compute durations from when the load event of the document is completed ([`loadEventEnd`](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-loadend))
- A `"loadEventEnd"` [DOMHighResTimeStamp](http://www.w3.org/TR/hr-time/#sec-DOMHighResTimeStamp) mark for calculating high resolution durations between a Navigation Timing mark and a user mark in browsers that support [High Resolution Time](http://www.w3.org/TR/hr-time/) but don't support [User Timing](http://www.w3.org/TR/user-timing/)
- A `"firstPaintFrame"` mark (available in the best possible format for the browser, either a [User Timing Mark](http://www.w3.org/TR/user-timing/#performancemark), [DOMHighResTimeStamp](http://www.w3.org/TR/hr-time/#sec-DOMHighResTimeStamp), or [DOMTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMTimeStamp)) that approximates the Time To First Paint in browsers that [support `window.requestAnimationFrame`](http://caniuse.com/#feat=requestanimationframe).
- The initial `visibilityState` as well as listeners for the `"visibilitychange"` event, enabling the ability to calculate how much time the page was hidden when you call `surfnperf.getHiddenTime()`. This is of particular importance as [Chrome as of version 57](https://developers.google.com/web/updates/2017/03/background_tabs) and [Firefox as of version 57](https://blog.mozilla.org/blog/2017/09/26/firefox-quantum-beta-developer-edition/) limit the resources assigned to background (hidden) tabs.

**2.** Then just drop the [surfnperf.min.js](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.min.js) in your codebase and reference that JavaScript file in your HTML document. If you're using [RequireJS](http://requirejs.org/) or [Browserify](http://browserify.org/), it registers itself as 'surfnperf'.

### Storing & Retrieving Performance Data

Details in the [JavaScript API](https://github.com/Comcast/Surf-N-Perf/wiki/JavaScript-API) page in the wiki

## Ruby Project Integration

### Using within a Rails project

The [surfnperf Ruby Gem](https://rubygems.org/gems/surfnperf) allows you to quickly & easily integrate Surf-N-Perf into your [Rails](http://rubyonrails.org/) projects. To include the necessary files, add `surfnperf` to your `Gemfile`:

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


### Using within a Middleman project

The [surfnperf Ruby Gem](https://rubygems.org/gems/surfnperf) also allows you to quickly & easily integrate Surf-N-Perf into your [Middleman](https://middlemanapp.com/) projects. Instructions are similar to the Rails instructions above, with one extra step. Start by adding at least v1.1.0 of `surfnperf` to your Middleman project's `Gemfile`:

```ruby
gem "surfnperf", ">=1.1.0"
```

After a `$ bundle install`, you'll be able to include the [main JavaScript file](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.js) in your JavaScript manifest by simply adding:

```
//= require surfnperf
```

The necessary script for the ```<head>``` of your HTML document is also available to you via a [custom defined helper](https://middlemanapp.com/basics/helper_methods/#custom-defined-helpers) that you can include in the appropriate layout file for your page, such as `source/layouts/layout.erb` by adding this line:

```erb
<%= surfnperf_head %>
```

You will also have to configure the extension for that helper to be recognized by Middleman by adding this line to your `config.rb`:

```ruby
activate :surfnperf
```

You'll want to do that **outside** of your build-specific configuration (i.e. outside the `configure :build do` block) so that it is available when you run `$ bundle exec middleman server`

Those 4 lines of code are all your need to get started using Surf-N-Perf in Middleman!

### Using within other Ruby projects that integrate with Sprockets

[Sprockets](https://github.com/sstephenson/sprockets) is what powers the [Asset Pipeline](http://guides.rubyonrails.org/asset_pipeline.html) in Rails, Middleman, and other Ruby website tools. For these other Ruby projects that use [Sprockets](https://middlemanapp.com/advanced/asset_pipeline/), integration is similar to the Rails instructions above, with one extra step:

Add `surfnperf` to your `Gemfile`:

```ruby
gem 'surfnperf'
```

After a `$ bundle install`, include [surfnperf.js](https://github.com/Comcast/Surf-N-Perf/blob/master/surfnperf.js) in your JavaScript manifest by adding:

```
//= require surfnperf
```

For now, you'll have to manually include the [necessary script](#including-the-code-in-your-project) for the ```<head>``` of your HTML document.

## Running Tests & Other Development Tools

Tests are written in [Jasmine](http://jasmine.github.io/) and run with [Karma](http://karma-runner.github.io/)

Install the dependencies by executing this command from the root of your Surf-N-Perf project directory:

```bash
$ npm install
```
If Grunt CLI has not been already installed, [go install it](http://gruntjs.com/getting-started).

And then run the tests, JSHint, beautify your code & generate the minified file with:

```bash
$ grunt dev
```

By default, it will run the tests using [PhantomJS](http://phantomjs.org/). You can also run the tests in any browser by going to http://localhost:9876/

The `grunt dev` process will watch for file updates, so as you modify surfnperf.js or the test files, it will automatically run jshint, jsbeautifier, uglify & the tests. To stop the watch process, press control + C

## License

Licensed under the [MIT License](https://github.com/Comcast/Surf-N-Perf/blob/master/LICENSE)
