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
    define('surf-n-perf', ['underscore'], factory);
  } else {
    // Browser global if not using Require.js
    root['surf-n-perf'] = factory(root._);
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

      this.initialize();
    };

  _.extend(SurfNPerf.prototype, {

    _setPerformanceApis: function() {
      if(window.performance) {
        if(window.performance.timing) {
          this._navigationTiming = true;
        }
        if(window.performance.now) {
          this._highResTime = true;
        }
      } else {
        this._navigationTiming = false;
        this._highResTime = false;
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

    _performanceTiming: function() {
      return this._navigationTiming ? window.performance.timing : {};
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
          return this._performanceTiming()[eventKey];
        } else { // timeType === 'HighRes'
          return window.SURF_N_PERF.highResMarks[eventKey];
        }
      } else {
        return this.getMark(eventKey, timeType);
      }
    },

    mark: function(eventKey) {
      if(this._highResTime) {
        this._data.highResMarks[eventKey] = this.now();
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
      options = options || {};
      var dp = options.decimalPlaces || 0;
      return +(this.getEventData(eventKey, 'end') - this.getEventData(eventKey, 'start')).toFixed(dp);
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
      var fetchStart = this.getTimingMark('fetchStart'),
          responseEnd = this.getTimingMark('responseEnd');
      if(fetchStart && responseEnd) {
        return responseEnd-fetchStart;
      }
    },

    /**
     * Total time to process the Response & fire the onLoad event
     *
     * @returns {integer} time in ms
     * @memberOf SurfNPerf
     */
    getProcessingLoadTime: function() {
      var responseEnd = this.getTimingMark('responseEnd') || this.getMark('pageStart', 'DOM'),
          loadEventEnd = this.getTimingMark('loadEventEnd', 'DOM');
      if(responseEnd && loadEventEnd) {
        return loadEventEnd-responseEnd;
      }
    },

    /**
     * Total time for a page to load from the time the user initiates the access of the page to the firing of the onLoad event
     *
     * @returns {integer} time in ms
     * @memberOf SurfNPerf
     */
    getFullRequestLoadTime: function() {
      var navigationStart = this.getTimingMark('navigationStart'),
          loadEventEnd = this.getTimingMark('loadEventEnd');
      if(navigationStart && loadEventEnd) {
        return loadEventEnd-navigationStart;
      }
    }

  });

  return new SurfNPerf();

}));