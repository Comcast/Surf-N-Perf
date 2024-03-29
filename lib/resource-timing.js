/*!
 * @license
 * Copyright 2015-2022 Comcast Cable Communications Management, LLC
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
  /* istanbul ignore else */
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
    /* istanbul ignore else */
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
   * Surf-N-Perf methods for working with the Resource Timing API
   * @class SurfNPerfRT
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
   * @private
   * @param {String} origin the canonical form of the origin of a location (i.e. protocol + hostname + port)
   * @param {String} [options] object with a "whitelist" or "blacklist" property
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
   * @private
   * @param {String} url
   * @returns {string} origin portion of URL
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
   * @param {Object} [options] Includes either a "whitelist" key with a single string or an array of origins as the value that will be used to return only those items that are in the list of origins, or a "blacklist" key with a single string or an array of origins as the value that will be used to filter out those origins
   * @returns {Array} Array of strings of origins of resources, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getOrigins = function(options) {
    if(this._resourceTiming) {
      var resources = this.getResources();
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
   * Returns an array of all the PerformanceResouceTimings from the specified origin
   *
   * @param {String} origin the canonical form of the origin of a location (i.e. protocol + hostname + port)
   * @param {String} [property] if specified, only return that property of each resource instead of the entire PerformanceResourceTiming resource
   * @returns {Array} Array of PerformanceResourceTimings or specific PerformanceResourceTiming properties from the origin, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResourcesFromOrigin = function(origin, property) {
    if(this._resourceTiming) {
      var resources = this.getResources();
      var resourcesFromOrigin = [];
      var i = 0;
      var length = resources.length;
      for(; i < length; i++) {
        var urlOrigin = this._getURLOrigin(resources[i].name);
        if(urlOrigin === origin) {
          if(property) {
            resourcesFromOrigin.push(resources[i][property]);
          } else {
            resourcesFromOrigin.push(resources[i]);
          }
        }
      }
      return resourcesFromOrigin;
    } else {
      return null;
    }
  };

  /**
   * Returns an array of all the names from the PerformanceResouceTimings from the specified origin
   *
   * @param {String} origin the canonical form of the origin of a location (i.e. protocol + hostname + port)
   * @returns {Array} Array of names from the origin's resources, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResourceNamesFromOrigin = function(origin) {
    return this.getResourcesFromOrigin(origin, 'name');
  };

  SNPRTProto.getLocation = function() {
    return window.location;
  };

  /**
   * Converts a relative URL to an absolute URL based on the page's window.location
   *
   * @private
   * @param {String} name relative or absolute URL
   * @returns {String} absolute URL, prepending the protocol + hostname + port if a relative URL was passed in, or null if Resource Timing is not supported
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
   * Returns all PerformanceResourceTimings for the page, filtered by name if specified
   *
   * @param {String} [name] resource name (i.e. full URL)
   * @returns {Array} Array of PerformanceResourceTimings for the specified resource name, or all PerformanceResourceTimings if no name is provided, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResources = function(name) {
    if(this._resourceTiming) {
      if(name) {
        return this._perf().getEntriesByName(this._name(name), "resource");
      } else {
        return this._perf().getEntriesByType("resource");
      }
    } else {
      return null;
    }
  };

  /**
   * Returns total count of all PerformanceResourceTimings for the page, filtered by name if specified
   *
   * @param {String} [name] resource name (i.e. full URL)
   * @returns {number} total number of resources, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResourceCount = function(name) {
    if(this._resourceTiming) {
      return this.getResources(name).length;
    } else {
      return null;
    }
  };

  /**
   * Get the first resource from window.performance.getEntriesByName for the specified name
   * Optional 2nd arugment can return a resource other than the first (useful if you request the same resource multiple times, either to request updated data in a Single Page App, or when making a Cross Origin request that requires an initial OPTIONS request)
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {String|Object} [index|options] Returns the resource from the specified index. Index should be a 0-based integer or the special keyword 'last', which will return the last item. If passing an object instead of a string, the object property name is 'index'. Ignored if the first argument is a PerformanceResourceTiming resource
   * @returns {PerformanceResourceTiming} resource object, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getResource = function(name, options) {
    if(this._resourceTiming) {
      if(typeof name === 'string') {
        var resources = this.getResources(name);
        var index = 0;
        if(options) {
          if(typeof options === 'object') {
            index = options.index || 0;
          } else if(typeof options === 'number' || typeof options === 'string') {
            index = options;
          }
        }
        if(index === 'last') {
          index = resources.length - 1;
        }
        return resources[index];
      } else {
        return name;
      }
    } else {
      return null;
    }
  };

  /**
   * Get the last resource from window.performance.getEntriesByName for the specified name
   *
   * @param {String} name resource name (i.e. full URL)
   * @returns {PerformanceResourceTiming} resource object, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getLastResource = function(name) {
    if(this._resourceTiming) {
      return this.getResource(name, 'last');
    } else {
      return null;
    }
  };

  /**
   * Returns the duration between two marks for the specified resource
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {String} startMark name of the first mark
   * @param {String} endMark name of the second mark
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} duration between the two specified marks, false if a mark has a 0 value (CORS request without a Timing-Allow-Origin header), undefined if the resource is not found, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.duration = function(name, startMark, endMark, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name, options);
      if(resource) {
        if(resource[startMark] === 0 || resource[endMark] === 0) {
          return false;
        }
        return surfnperf._roundedDuration(resource[startMark], resource[endMark], options);
      } else {
        return undefined;
      }
    } else {
      return null;
    }
  };

  /**
   * Shorthand for `window.performance.getEntriesByName(name, "resource")[0].startTime`
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} the time immediately before the user agent starts to queue the resource for fetching, undefined if the resource is not found, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getStart = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name, options);
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
   * Shorthand for `window.performance.getEntriesByName(name, "resource")[0].responseEnd`
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} time immediately after the user agent receives the last byte of the response or immediately before the transport connection is closed, whichever comes first. Returns undefined if the resource is not found, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getEnd = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name, options);
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
   * Shorthand for `window.performance.getEntriesByName(name, "resource")[0].duration`
   * Note this included blocking time. If you want blocking time filtered out, use `getNetworkTime`
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} the difference between `responseEnd` and `startTime`, respectively. Returns undefined if the resource is not found, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getFullRequestLoadTime = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name, options);
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
   * Return the time for App Cache, DNS & TCP (and any time in between) of the specified resource
   * For a CORS request without a Timing-Allow-Origin header, the value will allows be false
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} the difference between `fetchStart` and `connectEnd`, respectively. Returns false for a CORS request without a Timing-Allow-Origin header, undefined if the resource is not found, or null if Resource Timing is not supported
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
   * Return the time for the request & response of the specified resource
   * For a CORS request without a Timing-Allow-Origin header, the value will allows be false
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} the difference between `requestStart` and `responseEnd`, respectively. Returns false for a CORS request without a Timing-Allow-Origin header, undefined if the resource is not found, or null if Resource Timing is not supported
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
   * Return the "missing periods" (non-zero durations) that occur between connectEnd and requestStart (when waiting on a Keep-Alive TCP connection to reuse), or between fetchStart and domainLookupStart (when waiting on things like the browser’s cache) of the specified resource
   * See "Blocking Time" section of http://nicj.net/resourcetiming-in-practice/ for additional details
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} the time the resource was blocked. Returns false for a CORS request without a Timing-Allow-Origin header, undefined if the resource is not found, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getBlockingTime = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name, options);
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
   * Essentially, this is the duration minus blocking time
   * See http://www.stevesouders.com/blog/2014/11/25/serious-confusion-with-resource-timing/ for additional details
   *
   * @param {String|PerformanceResourceTiming} name|resource resource name (i.e. full URL) or an actual PerformanceResourceTiming PerformanceEntry resource object
   * @param {Object} [options] Can contain an 'index' property and/or a 'decimalPlaces' property. 'index' will allow you to calculate the duration for a resource other than the first instance of that name. 'index' should be a 0-based integer or the special keyword 'last', which will return the last item. Index is ignored if the first argument is a PerformanceResourceTiming resource. 'decimalPlaces' will round the result to that number of decimal places (otherwise, an integer is returned)
   * @returns {Number} the combined time for DNS lookup, TCP handshake, Request to Server, and Server Response. Returns false for a CORS request without a Timing-Allow-Origin header, undefined if the resource is not found, or null if Resource Timing is not supported
   * @memberOf SurfNPerfRT
   */
  SNPRTProto.getNetworkDuration = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name, options);
      if(resource) {
        if(resource.domainLookupStart) {
          options = options || {};
          var durationOptions = {
            decimalPlaces: 15,
            index: options.index
          };
          var dns = this.duration(name, 'domainLookupStart', 'domainLookupEnd', durationOptions);
          var tcp = this.duration(name, 'connectStart', 'connectEnd', durationOptions);
          var requestAndResponse = this.duration(name, 'requestStart', 'responseEnd', durationOptions);
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
