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
      this._resourceTiming = !!(window.performance.getEntriesByType);
    } else {
      this._resourceTiming = false;
    }
  };

  SNPRTProto._inList = function(origin, options) {
    options = options || {};
    if (options.hasOwnProperty("whitelist")) {
      return contains(options.whitelist, origin);
    } else if (options.hasOwnProperty("blacklist")) {
      return !contains(options.blacklist, origin);
    } else {
      return true;
    }
  }

  SNPRTProto._getURLOrigin = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.protocol + "//" + a.host;

  };

  SNPRTProto.getOrigins = function(options) {
    if(this._resourceTiming) {
      var resources = window.performance.getEntriesByType("resource");
      var origins = [];
      for(var resource in resources) {
        var urlOrigin = this._getURLOrigin(resources[resource].name);
        if(!contains(origins, urlOrigin) && this._inList(urlOrigin, options)) {
          origins.push(urlOrigin);
        }
      }
      return origins;
    } else {
      return null;
    }
  };

  SNPRTProto.getResourcesFromOrigin = function(origin) {
    if(this._resourceTiming) {
      var resources = window.performance.getEntriesByType("resource");
      var resourcesFromOrigin = [];
      for(var resource in resources) {
        var urlOrigin = this._getURLOrigin(resources[resource].name);
        if (urlOrigin === origin) {
          resourcesFromOrigin.push(resources[resource]);
        }
      }
      return resourcesFromOrigin;
    } else {
      return null;
    }
  };

  SNPRTProto._name = function(name) {
    if(name.charAt(0) == '/') {
      return window.location.protocol + "//" + window.location.host + name;;
    } else {
      return name;
    }
  };

  SNPRTProto.getResource = function(name) {
    if(this._resourceTiming) {
      return window.performance.getEntriesByName(this._name(name), "resource")[0]
    } else {
      return null;
    }
  };

  SNPRTProto.duration = function(name, eventA, eventB, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if (resource) {
        if (resource[eventA] === 0 || resource[eventB] === 0) {
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

  SNPRTProto.start = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        return surfnperf._round(resource.startTime, options);
      }
    } else {
      return null;
    }
  };

  SNPRTProto.end = function(name, options) {
    if(this._resourceTiming) {
      var resource = this.getResource(name);
      if(resource) {
        return surfnperf._round(resource.responseEnd, options);
      }
    } else {
      return null;
    }
  };

  SNPRTProto.getFullRequestLoadTime = function(name, options) {
    if(this._resourceTiming) {
      return surfnperf._round(this.getResource(name).duration, options);
    } else {
      return null;
    }
  };

  SNPRTProto.getNetworkTime = function(name, options) {
    if(this._resourceTiming) {
      return this.duration(name, 'fetchStart', 'connectEnd', options);
    } else {
      return null;
    }
  };

  SNPRTProto.getServerTime = function(name, options) {
    if(this._resourceTiming) {
      return this.duration(name, 'requestStart', 'responseEnd', options);
    } else {
      return null;
    }
  };

  SNPRTProto.getBlockingTime = function(name, options) {
    if(this._resourceTiming) {
      var blockingTime = 0;
      var res = this.getResource(name);
      if (res.connectEnd && res.connectEnd === res.fetchStart) {
        blockingTime = res.requestStart - res.connectEnd;
      } else if (res.domainLookupStart) {
        blockingTime = res.domainLookupStart - res.fetchStart;
      }
      return surfnperf._round(blockingTime, options)
    } else {
      return null;
    }
  };

  return new SurfNPerfRT();
}));