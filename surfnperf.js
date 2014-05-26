/**
 * Copyright 2014 Comcast Cable Communications Management, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // For Require.js
    define('surfnperf', ['underscore'], factory);
  } else {
    // Browser global if not using Require.js
    root.surfnperf = factory(root._);
  }
}(this, function (_) {

 /**
   * Date.now() shim for older browsers
   */
  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  /**
   * Frontend Web Performance Data Gathering
   *
   * @class SurfNPerf
   */
  var SurfNPerf = function() {
      this._data = {
        custom: {},
        marks: {},
        highResMarks: {},
        events: {}
      };

      this._navigationTiming = null;
      this._highResTime = null;
      this._userTiming = null;

      this._navigationTimingEvents = {
        a: ["navigationStart", "unloadEventEnd", "unloadEventStart", "redirectStart", "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart", "secureConnectionStart", "connectEnd", "requestStart", "responseStart", "responseEnd", "domLoading"],
        b: ["domInteractive", "domContentLoadedEventStart", "domContentLoadedEventEnd", "domComplete", "loadEventStart", "loadEventEnd"]
      };

      this.initialize();
    };

  _.extend(SurfNPerf.prototype, {

    _setPerformanceApis: function() {
      if(window.performance) {
        this._navigationTiming = !!(window.performance.timing);
        this._highResTime = !!(window.performance.now);
        this._userTiming = !!(window.performance.mark && window.performance.measure && window.performance.getEntriesByName);
      } else {
        this._navigationTiming = false;
        this._highResTime = false;
        this._userTiming = false;
      }
    },

    _setPerfProperties: function() {
      if(_.isUndefined(window.SURF_N_PERF) || !window.SURF_N_PERF.marks) {
        window.SURF_N_PERF = {
          marks: {},
          highResMarks: {}
        };
      }
    },

    _setInitialUrl: function() {
      this.setCustom('initialUrl', window.location.pathname);
    },

    initialize: function() {
      this._setPerformanceApis();
      this._setPerfProperties();
      this._setInitialUrl();
    },

    /**
     * Returns the timing data for a particular eventKey
     *
     * @arguments {String} timeType 'highRes' (to return a DOMHighResTimeStamp, if available) or 'DOM' (to return a DOMTimeStamp's value) - optional. Defaults to 'highRes'
     * @returns {DOMHighResTimeStamp | integer} time value
     * @memberOf SurfNPerf
     */
    now: function(timeType) {
      timeType = timeType || 'highRes';
      if(this._highResTime && timeType === 'highRes') {
        return window.performance.now();
      } else {
        return Date.now();
      }
    },

    performanceTiming: function() {
      return this._navigationTiming ? window.performance.timing : {};
    },

    _performanceTimingL2: function(eventKey) {
      var delta = this.getTimingMark('loadEventEnd', 'DOM') - this.getTimingMark(eventKey, 'DOM'),
          value = window.SURF_N_PERF.highResMarks.loadEventEnd - delta;
      return (value < 0) ? 0 : this._round(value, {decimalPlaces: 10});
    },

    /**
     * Returns the timing data for a particular eventKey
     *
     * @arguments {String} eventKey name of the timing event
     * @arguments {String} timeType 'highRes' (to return a DOMHighResTimeStamp, if available) or 'DOM' (to return a DOMTimeStamp's value) - optional. Defaults to 'DOM'
     * @returns {DOMHighResTimeStamp | integer} time value
     * @memberOf SurfNPerf
     */
    getTimingMark: function(eventKey, timeType) {
      timeType = timeType || 'DOM';

      if(this._navigationTiming) {
        if(timeType === 'DOM' || this._highResTime === false) {
          return this.performanceTiming()[eventKey];
        } else { // timeType === 'HighRes'
          return this._performanceTimingL2(eventKey);
        }
      } else {
        if(_.contains(this._navigationTimingEvents.a, eventKey)) {
          return this.getMark('pageStart', 'DOM');
        } else {
          return this.getMark('loadEventEnd', 'DOM');
        }
      }
    },

    userTiming: function() {
      return this._userTiming ? window.performance : {};
    },

    mark: function(eventKey) {
      if(this._highResTime) {
        this._data.highResMarks[eventKey] = this.now();
      }
      if(this._userTiming) {
        this.userTiming().mark(eventKey);
      }
      this._data.marks[eventKey] = this.now('DOM');
    },

    getMark: function(eventKey, timeType) {
      var mark;

      timeType = timeType || 'highRes';

      if(timeType === 'highRes' && this._highResTime === true) {
        mark = this._data.highResMarks[eventKey] || window.SURF_N_PERF.highResMarks[eventKey];
      }
      return mark || this._data.marks[eventKey] || window.SURF_N_PERF.marks[eventKey];
    },

    _isTimingMark: function(eventKey) {
      return _.contains(this._navigationTimingEvents.a, eventKey) || _.contains(this._navigationTimingEvents.b, eventKey);
    },

    _getDurationMark: function(eventKey) {
      if(this._isTimingMark(eventKey)) {
        return this.getTimingMark(eventKey, 'highRes');
      } else {
        return this.getMark(eventKey);
      }
    },

    _round: function(n, options) {
      options = options || {};
      var dp = options.decimalPlaces || 0;
      return +(n).toFixed(dp);
    },

    _roundedDuration: function(a, b, options) {
      return this._round(b-a, options);
    },

    _measureName: function(a,b) {
      return '_SNP_'+a+'_TO_'+b;
    },

    _setMeasure: function(a,b) {
      this.userTiming().measure(this._measureName(a,b), a, b);
    },

    _getMeasureDuration: function(a,b) {
      var measure = this.userTiming().getEntriesByName(this._measureName(a,b))[0] || {};
      return measure.duration;
    },

    duration: function(a, b, options) {
      if(this._userTiming) {
        this._setMeasure(a,b);
        return this._round(this._getMeasureDuration(a,b), options);
      } else {
        return this._roundedDuration(this._getDurationMark(a), this._getDurationMark(b), options);
      }
    },

    updateEvent: function(eventKey, key, value) {
      var obj = {};
      obj[eventKey] = {};

      _.defaults(this._data.events, obj);

      this._data.events[eventKey][key] = value;
    },

    resetEvent: function(eventKey, key, value) {
      this._data.events[eventKey] = {};
      this._data.events[eventKey][key] = value;
    },

    eventStart: function(eventKey) {
      this.resetEvent(eventKey, 'start', this.now());
    },

    eventEnd: function(eventKey, options) {
      var now = this.now();

      options = options || {};

      _.each(options, function(value, key) {
        this.updateEvent(eventKey, key, value);
      }, this);

      this.updateEvent(eventKey, 'end', now);
    },

    getEventData: function(eventKey, key) {
      var eventObj = this._data.events[eventKey];
      if(eventObj) {
        return eventObj[key];
      }
    },

    eventDuration: function(eventKey, options) {
      return this._roundedDuration(this.getEventData(eventKey, 'start'), this.getEventData(eventKey, 'end'), options);
    },

    setCustom: function(key, value) {
      this._data.custom[key] = value;
    },

    getCustom: function(key) {
      return this._data.custom[key];
    },

    /**
     * Total time for App Cache, DNS, TCP, Request & Response
     *
     * @returns {integer} time in ms
     * @memberOf SurfNPerf
     */
    getNetworkLatency: function() {
      return this.duration('fetchStart', 'responseEnd');
    },

    /**
     * Total time to process the Response & fire the onLoad event
     *
     * @returns {integer} time in ms
     * @memberOf SurfNPerf
     */
    getProcessingLoadTime: function() {
      return this.duration('responseEnd', 'loadEventEnd');
    },

    /**
     * Total time for a page to load from the time the user initiates the access of the page to the firing of the onLoad event
     *
     * @returns {integer} time in ms
     * @memberOf SurfNPerf
     */
    getFullRequestLoadTime: function() {
      return this.duration('navigationStart', 'loadEventEnd');
    }

  });

  return new SurfNPerf();

}));