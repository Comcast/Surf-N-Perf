/*!
 * Copyright 2015 Comcast Cable Communications Management, LLC
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

 (function(root, factory) {
  if(typeof define === 'function' && define.amd) {
    // For Require.js
    define('surfnperf/resource-timing', ['surfnperf'], factory);
  } else if(typeof exports === 'object') {
    // For Browserify
    module.exports = factory(require('surfnperf'));
  } else {
    // Browser global if not using Require.js or Browserify
    root.surfnperfRT = factory(root.surfnperf);
  }
}(this, function(surfnperf) {
  /**
   * Date.now() shim for older browsers
   */
  if(!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  var defaults = function(o, d) {
      for(var prop in d) {
        if(!o.hasOwnProperty(prop)) {
          o[prop] = d[prop];
        }
      }
    },
    contains = function(array, value) {
      if(Array.prototype.indexOf) {
        return array.indexOf(value) != -1;
      } else {
        var i, length = array.length;
        for(i = 0; i < length; i++) {
          if(array[i] === value) {
            return true;
          }
        }
        return false;
      }
    };

  /**
   * Frontend Web Performance Data Gathering
   *
   * @class SurfNPerf
   */
  var SurfNPerfRT = function() {
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
    },
    SNPRTProto = SurfNPerfRT.prototype;

  SNPRTProto._inList = function(origin, options) {
    if (options.hasOwnProperty("whitelist")) {
      if (options.whitelist.indexOf(origin) === -1) {
        return false;
      } else {
        return true;
      }
    } else if (options.hasOwnProperty("blacklist")) {
      if (options.blacklist.indexOf(origin) === -1) {
        return true;
      } else {
        return false;
      }
    }
  }

  SNPRTProto.getOrigins = function(options) {
    if(window.performance.getEntriesByType) {
      var resources = window.performance.getEntriesByType("resource");
      var origins = [];
      for var resource in resources {
        var url = new URL(resources[resource].name);
        if (origins.indexOf(url.origin) === -1 && this._inList(url.origin, options)) {
          origins.push(url.origin);
        }
      }

      return origins;
    } else {
      return null;
    }
  };

  SNPRTProto.getResourcesFromOrigin = function(origin) {
    if(window.performance.getEntriesByType) {
      var resources = window.performance.getEntriesByType("resource");
      var resourcesFromOrigin = [];
      for var resource in resources {
        var url = new URL(resources[resource].name);
        if (url.origin === origin) {
          resourcesFromOrigin.push(resources[resource]);
        }
      }
      return resourcesFromOrigin;
    } else {
      return null;
    }
  };

  SNPRTProto.isBufferFull = function() {
    if(window.performance.getEntriesByType) {
      if(performance.onresourcetimingbufferfull) {
        return true;
      } else {
        return false;
      }
    } else {
      return null;
    }
  };

  SNPRTProto._nameExtend = function(name) {
    if(name.charAt(0) == '/') {
      return "http://" + window.location.hostname + name;
    } else {
      return name;
    }
  };

  SNPProto._round = function(n, options) {
    options = options || {};
    var dp = options.decimalPlaces || 0;
    n = +(n);
    return n.toFixed ? +(n).toFixed(dp) : n;
  };


  SNPRTProto.duration = function(eventA, eventB, options) {

  };

  SNPRTProto.getResource = function(name) {
    name = this._nameExtend(name);

    return window.performance.getEntriesByName(name, "resource")[0]
  };

  SNPRTProto.start = function(name, options) {
    name = this._nameExtend(name);

    var resource = this.getResource(name);
    if(resource == undefined) {
      return undefined;
    }
    var start = resource.startTime;

    return this._round(start, options);
  };

  SNPRTProto.end = function(name, options) {
    name = this._nameExtend(name);

    var resource = this.getResource(name);
    if(resource == undefined) {
      return undefined;
    }
    var end = resource.responseEnd;

    return this._round(end, options);
  };

  SNPRTProto.getFullRequestLoadTime = function(name, options) {
    name = this._nameExtend(name);

    return this._round(this.getResource(name).duration, options);

  };

  SNPRTProto.getNetworkTime = function(name, options) {
    name = this._nameExtend(name);

  };

  SNPRTProto.getServerTime = function(name, options) {
    name = this._nameExtend(name);

  };

  SNPRTProto.getBlockingTime = function(name, options) {
    name = this._nameExtend(name);

  };
}));