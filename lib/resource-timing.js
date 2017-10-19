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

  var contains = function(array, value) {
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
      this._resourceTiming = null;

      this.initialize();
    },
    SNPRTProto = SurfNPerfRT.prototype;

  SNPRTProto.initialize = function() {
    if(window.performance) {
      this._resourceTiming = !!window.performance.getEntriesByType;
      this._perf = function() {
        return window.performance;
      };
    } else {
      this._resourceTiming = false;
    }
  };

  /**
   * If options parameter is passed in, determines if the origin is in the blacklist or whitelist provided in the options
   *
   * @returns {boolean} true if in whitelist or not in blacklist, false if in blacklist or not in whitelist
   * @memberOf SurfNPerfRT
   */
  SNPRTProto._inList = function(origin, options) {
    options = options || {};
    if(options.hasOwnProperty("whitelist")) {
      return contains(options.whitelist, origin);
    } else if(options.hasOwnProperty("blacklist")) {
      return !contains(options.blacklist, origin);
    } else {
      return true;
    }
  };

  /**
   * Get the origin when passed in a URL
   *
   * @returns {string} origin of URL
   * @memberOf SurfNPerfRT
   */
  SNPRTProto._getURLOrigin = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.protocol + "//" + a.host;

  };

  /**
   * Get the array of all the origins of the resources returned by window.performance.getEntriesByType with no duplicates
   *
   * @returns {array of strings} origins of resources
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getOrigins = function(options) {
    if(this._resourceTiming) {
      var resources = this._perf().getEntriesByType("resource");
      var origins = [];
      for(var resource in resources) {
        var urlOrigin = this._getURLOrigin(resources[resource].name);
        if(!contains(origins, urlOrigin) && this._inList(urlOrigin, options) && urlOrigin.indexOf('http') === 0) {
          origins.push(urlOrigin);
        }
      }
      return origins;
    } else {
      return null;
    }
  };

  /**
   * Get an array of all the resources that are from the origin defined in the parameter
   *
   * @returns {array of PerformanceResouceTimings} resources from the origin
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResourcesFromOrigin = function(origin) {
    if(this._resourceTiming) {
      var resources = this._perf().getEntriesByType("resource");
      var resourcesFromOrigin = [];
      for(var resource in resources) {
        var urlOrigin = this._getURLOrigin(resources[resource].name);
        if(urlOrigin === origin) {
          resourcesFromOrigin.push(resources[resource]);
        }
      }
      return resourcesFromOrigin;
    } else {
      return null;
    }
  };

  SNPRTProto.getLocation = function() {
    return window.location;
  };

  /**
   * Add the protocol and host of the current window's origin to the path
   *
   * @returns {string} URL for name
   * @memberOf SurfNPerfRT
   */
  SNPRTProto._name = function(name) {
    if(name.charAt(0) == '/') {
      var location = this.getLocation();
      return location.protocol + "//" + location.host + name;
    } else {
      return name;
    }
  };

  /**
   * Get the first resource from window.performance.getEntriesByName for the source that is passed in as the name parameter
   *
   * @returns {PerformanceResourceTiming} resource object
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResource = function(name) {
    if(this._resourceTiming) {
      return this._perf().getEntriesByName(this._name(name), "resource")[0];
    } else {
      return null;
    }
  };

  /**
   * Return the duration between eventA and eventB for the first resource from name and round to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.duration = function(name, eventA, eventB, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        if(resource[eventA] === 0 || resource[eventB] === 0) {
          return false;
        }
        return surfnperf._roundedDuration(resource[eventA], resource[eventB], options);
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  /**
   * Return the start time for the first resource from name and round to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.start = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        return surfnperf._round(resource.startTime, options);
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  /**
   * Return the end time for the first resource from name and round to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.end = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        return surfnperf._round(resource.responseEnd, options);
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  /**
   * Return the full request load time for the first resource from name and round to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.getFullRequestLoadTime = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        return surfnperf._round(resource.duration, options);
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  /**
   * Return the time for App Cache, DNS & TCP for the first resource from name and round to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.getNetworkTime = function(name, options) {
    if(this._resourceTiming) {
      return this.duration(name, 'fetchStart', 'connectEnd', options);
    } else {
      return null;
    }
  };

  /**
   * Return the time for Request & Response for the first resource from name and round to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.getServerTime = function(name, options) {
    if(this._resourceTiming) {
      return this.duration(name, 'requestStart', 'responseEnd', options);
    } else {
      return null;
    }
  };

  /**
   * Return the amount of time spent blocking (waiting for its turn to download) for the first resource from name and rounded to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.getBlockingTime = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        if(resource.connectEnd && resource.connectEnd === resource.fetchStart) {
          return this.duration(name, 'connectEnd', 'requestStart', options);
        } else if(resource.domainLookupStart) {
          return this.duration(name, 'fetchStart', 'domainLookupStart', options);
        }
        return false;
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  /**
   * Return the amount of time the network was actively fetching the first resource from name
   *   (essentially duration minus blocking time)
   *   and rounded to the number of decimal places defined by the options parameter
   *
   * @returns {integer} time in ms
   * @memberOf SurfNPerfRT
   */

  SNPRTProto.getNetworkDuration = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        if(resource.domainLookupStart) {
          var dns = this.duration(name, 'domainLookupStart', 'domainLookupEnd', {
            decimalPlaces: 15
          });
          var tcp = this.duration(name, 'connectStart', 'connectEnd', {
            decimalPlaces: 15
          });
          var requestAndResponse = this.duration(name, 'requestStart', 'responseEnd', {
            decimalPlaces: 15
          });
          return surfnperf._round(dns + tcp + requestAndResponse, options);
        }
        return false;
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  return new SurfNPerfRT();
}));
