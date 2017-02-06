<a name="1.4.0"></a>
### 1.4.0

#### Features

* Add support for [clearMarks](https://www.w3.org/TR/user-timing/#dom-performance-clearmarks) ([4a6a5c6](https://github.com/Comcast/Surf-N-Perf/commit/4a6a5c6c1006cf4f48e48b65fa20b47978fd6975))

<a name="1.3.0"></a>
### 1.3.0

#### Features

* Adds proper [Bower](https://bower.io/) support ([45b83ab](https://github.com/Comcast/Surf-N-Perf/commit/45b83abdbb58ac95d23d2ec7b450293cb54fb63d))

<a name="1.2.0"></a>
### 1.2.0

#### Features

* Adds new Time To First Paint methods: `getFirstPaint` & `getFirstPaintFrame` ([e6dab25](https://github.com/Comcast/Surf-N-Perf/commit/e6dab2585b3f993e482e86f096ed1efed295b717))

<a name="1.1.0"></a>
### 1.1.0

#### Features

* [Ruby Gem](https://rubygems.org/gems/surfnperf) now has full support for [Middleman](https://middlemanapp.com/) ([d4e3208](https://github.com/Comcast/Surf-N-Perf/commit/d4e320824fa92402462840d3404259ecf7dfeb57))

<a name="1.0.2"></a>
### 1.0.2

#### Features

* More precise handling of durations between navigationStart & a user mark ([6e814f5](https://github.com/Comcast/Surf-N-Perf/commit/6e814f5db1bc650d2ab487c45fea61986fca4000))
* Available now as a [Ruby Gem](https://rubygems.org/gems/surfnperf)

<a name="1.0.1"></a>
### 1.0.1

#### Features

* Minified version (surfnperf.min.js)
* Performance improvements
* Removed dependency on Underscore
* Browserify support

#### Bug Fixes

* When trying to access a mark/event via User Timing
that doesn't exist yet, the error is captured & logged to the developer console as an error instead of throwing a JavaScript error ([ac874495](https://github.com/Comcast/Surf-N-Perf/commit/ac874495061da777d10bef3537d834c39e16ddf5))

<a name="1.0.0"></a>
### 1.0.0

#### Features

* Initial release