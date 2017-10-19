define('spec/surfnperfRT_spec', [
  'surfnperf/resource-timing'
], function(
  SurfNPerfRT
) {
  describe('SurfNPerfRT', function() {
    var NOW_TS = 1388595600000, // Wed Jan 01 2014 12:00:00 GMT-0500 (EST)
      NOW_HIGH_RES = 3.1415926;

    beforeEach(function() {
      var name = 'a';
      var type = 'resource';
      var perfObject = {
        now: function() {
          return NOW_HIGH_RES;
        },
        getEntriesByName: function(name) {},
        getEntriesByType: function(type) {},
        timing: {}
      };
      if(!window.performance) {
        window.performance = perfObject;
      } else if(!window.performance.getEntriesByType) {
        spyOn(SurfNPerfRT, '_perf').andReturn(perfObject);
      }
    });

    describe('Singleton Behavior', function() {
      it('is only instantiated once, even if the library is attempted to be instantiated more than once (as good singletons do)', function() {
        var a = SurfNPerfRT,
          b = SurfNPerfRT;
        expect(a).toBe(b);
      });
    });

    describe('#initialize', function() {
      beforeEach(function() {
        SurfNPerfRT.initialize();
      });

      it('sets the Resource Timing API properties appropriately', function() {
        expect(SurfNPerfRT._resourceTiming).not.toBeNull();
      });
    });

    describe('#_inList', function() {
      describe('whitelist as a key', function() {
        var options = {
          'whitelist': ['A', 'B', 'C']
        }
        it('returns true if the given origin is listed in whitelist', function() {
          expect(SurfNPerfRT._inList('A', options)).toEqual(true);
        });
        it('returns false if the given origin is not listed in whitelist', function() {
          expect(SurfNPerfRT._inList('D', options)).toEqual(false);
        });
      });
      describe('blackList as a key', function() {
        var options = {
          'blacklist': ['A', 'B', 'C']
        }
        it('returns true if the given origin is not listed in blacklist', function() {
          expect(SurfNPerfRT._inList('D', options)).toEqual(true);
        });
        it('returns false if the given origin is listed in blacklist', function() {
          expect(SurfNPerfRT._inList('A', options)).toEqual(false);
        });
      });
      describe('no specific key', function() {
        options = {}
        it('returns true no matter what if options does not have any key', function() {
          expect(SurfNPerfRT._inList('A', options)).toBe(true);
        });
      });

    });

    describe('#_getURLOrigin', function() {
      it('returns the origin when the provided URL has no port', function() {
        expect(SurfNPerfRT._getURLOrigin('http://comcast.github.io/Surf-N-Perf/')).toEqual('http://comcast.github.io');
      });

      it('returns the origin when the provided URL has a port', function() {
        expect(SurfNPerfRT._getURLOrigin('http://comcast.github.io:3000/Surf-N-Perf/')).toEqual('http://comcast.github.io:3000');
      });
    });

    describe('#getOrigins', function() {
      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
        });
        it('returns null', function() {
          expect(SurfNPerfRT.getOrigins()).toEqual(null);
        });
      });
      describe('when the browser supports the Resource Timing APIs', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(SurfNPerfRT._perf(), 'getEntriesByType').andReturn([{
            name: 'http://minsu.com/hi'
          }, {
            name: 'http://minsu.com/bye'
          }, {
            name: 'http://ros.com/hi'
          }, {
            name: 'http://ros.com/bye'
          }, {
            name: 'http://john.com/hi'
          }, {
            name: 'http://john.com/bye'
          }, {
            name: 'about:blank'
          }, {
            name: 'javascript:void(0)'
          }]);
        });

        it('returns an array of all the origins (with duplicates & non-http|https URLs filtered out) when no option is given', function() {
          expect(SurfNPerfRT.getOrigins()).toEqual(['http://minsu.com', 'http://ros.com', 'http://john.com']);
        });

        it('returns an array of the origin included in the whitelist when an option with a single whitelist is given', function() {
          expect(SurfNPerfRT.getOrigins({
            'whitelist': 'http://minsu.com'
          })).toEqual(['http://minsu.com']);
        });

        it('returns an array of the origins included in the whitelist when an option with multiple whitelisted origins is given', function() {
          expect(SurfNPerfRT.getOrigins({
            'whitelist': ['http://minsu.com', 'http://ros.com']
          })).toEqual(['http://minsu.com', 'http://ros.com']);
        });

        it('returns an array of the origin not included in the blacklist when option with a single blacklist is given', function() {
          expect(SurfNPerfRT.getOrigins({
            'blacklist': 'http://minsu.com'
          })).toEqual(['http://ros.com', 'http://john.com']);
        });

        it('returns an array of the origins not included in the blacklist when an option with multiple blacklisted origins is given', function() {
          expect(SurfNPerfRT.getOrigins({
            'blacklist': ['http://minsu.com', 'http://ros.com']
          })).toEqual(['http://john.com']);
        });
      });
    });

    describe('#getResourcesFromOrigin', function() {
      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
        });

        it('returns null', function() {
          expect(SurfNPerfRT.getResourcesFromOrigin('http://comcast.github.io:3000')).toEqual(null);
        });
      });

      describe('when the browser supports the Resource Timing APIs', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(SurfNPerfRT._perf(), 'getEntriesByType').andReturn([{
            name: 'http://minsu.com/hi'
          }, {
            name: 'http://ros.com/hi'
          }, {
            name: 'http://john.com/hi'
          }, {
            name: 'http://john.com/bye'
          }]);
        });

        it('returns an empty array when none of the resources are from the specified origin', function() {
          expect(SurfNPerfRT.getResourcesFromOrigin('http://comcast.github.io')).toEqual([]);
        });
        it('returns an array of the resources from the specified origin if they exist', function() {
          expect(SurfNPerfRT.getResourcesFromOrigin('http://john.com')).toEqual([{
            name: 'http://john.com/hi'
          }, {
            name: 'http://john.com/bye'
          }]);
        });
      });
    });

    describe('#getLocation', function() {
      it('returns window.locatiom', function() {
        expect(SurfNPerfRT.getLocation()).toEqual(window.location);
      });
    });

    describe('#_name', function() {
      it('returns the same URL when passed an absolute URL', function() {
        var absoluteURL = 'http://comcast.github.io/Surf-N-Perf/';
        expect(SurfNPerfRT._name(absoluteURL)).toEqual(absoluteURL);
      });

      it('returns an absolute URL using the origin of the current page when passed a relative URL', function() {
        spyOn(SurfNPerfRT, 'getLocation').andReturn({
          protocol: 'http:',
          host: 'local.github.com:5000'
        });
        expect(SurfNPerfRT._name('/A')).toEqual('http://local.github.com:5000/A');
      })
    });

    describe('#getResource', function() {
      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
        });

        it('returns null', function() {
          expect(SurfNPerfRT.getResource(name)).toEqual(null);
        });
      });

      describe('when the browser supports the Resource Timing APIs', function() {
        var firstResource,
          secondResource;

        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          firstResource = {
            duration: 200,
            entryType: 'resource',
            name: 'http://rawgit.com/Comcast/Surf-N-Perf/master/surfnperf.min.js'
          };
          secondResource = {
            duration: 100,
            entryType: 'resource',
            name: 'http://rawgit.com/Comcast/Surf-N-Perf/master/surfnperf.min.js'
          };
        });

        it('returns the first resource in the array of resources returned by window.performance.getEntriesByName', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([firstResource, secondResource]);
          expect(SurfNPerfRT.getResource('http://rawgit.com/Comcast/Surf-N-Perf/master/surfnperf.min.js')).toEqual(firstResource);
        });

        it('returns the proper value when passed a relative URL for the resource', function() {
          spyOn(SurfNPerfRT, 'getLocation').andReturn({
            protocol: 'http:',
            host: 'rawgit.com'
          });
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([firstResource, secondResource]);
          expect(SurfNPerfRT.getResource('/Comcast/Surf-N-Perf/master/surfnperf.min.js')).toEqual(firstResource);
        });
      });
    });

    describe('#duration', function() {
      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
        });
        it('returns null', function() {
          expect(SurfNPerfRT.duration(name, 'A', 'B', {})).toEqual(null);
        });
      });
      describe('when the browser supports the Resource Timing APIs', function() {
        var name;

        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg'
        });

        it('returns the diff between 2 resource timing marks', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            requestStart: 100.01,
            responseEnd: 400.04
          }]);
          expect(SurfNPerfRT.duration(name, 'requestStart', 'responseEnd')).toEqual(300);
        });
        it("returns false if the first event's value is 0 (cross-domain request with no Timing-Allow-Origin HTTP response header)", function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            requestStart: 0,
            responseEnd: 400.04
          }]);
          expect(SurfNPerfRT.duration(name, 'requestStart', 'responseEnd')).toEqual(false);
        });
        it("returns false if the second event's value is 0 (cross-domain request with no Timing-Allow-Origin HTTP response header)", function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            startTime: 50.50,
            requestStart: 0,
          }]);
          expect(SurfNPerfRT.duration(name, 'startTime', 'requestStart')).toEqual(false);
        });
        it('returns false if both events are 0', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            startTime: 50.50,
            requestStart: 0,
            responseStart: 0,
          }]);
          expect(SurfNPerfRT.duration(name, 'requestStart', 'responseStart')).toEqual(false);
        });
        it('returns the diff between 2 resource timing marks, rounded when optional 4th param decimalPlaces included', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            requestStart: 100.01,
            responseEnd: 400.04
          }]);
          expect(SurfNPerfRT.duration(name, 'requestStart', 'responseEnd', {
            'decimalPlaces': 2
          })).toEqual(300.03);
        });
        it('returns undefined if the resource is not found', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([]);
          expect(SurfNPerfRT.duration(name, 'requestStart', 'responseEnd')).toBeUndefined();
        });
      });
    });

    describe('Resource Timing attribute aliases & duration calculations', function() {
      var name;

      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg';
        });

        it('start returns null', function() {
          expect(SurfNPerfRT.start(name)).toEqual(null);
        });

        it('end returns null', function() {
          expect(SurfNPerfRT.end(name)).toEqual(null);
        });

        it('getFullRequestLoadTime returns null', function() {
          expect(SurfNPerfRT.getFullRequestLoadTime(name)).toEqual(null);
        });

        it('getNetworkTime returns null', function() {
          expect(SurfNPerfRT.getNetworkTime(name)).toEqual(null);
        });

        it('getServerTime returns null', function() {
          expect(SurfNPerfRT.getServerTime(name)).toEqual(null);
        });

        it('getBlockingTime returns null', function() {
          expect(SurfNPerfRT.getBlockingTime(name)).toEqual(null);
        });
      });

      describe('when the browser supports the Resource Timing APIs', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg';
        });

        describe('when the resource is found', function() {
          beforeEach(function() {
            spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
              connectEnd: 186.674,
              connectStart: 186.673,
              decodedBodySize: 70661,
              domainLookupEnd: 186.672,
              domainLookupStart: 186.671,
              duration: 65.495,
              encodedBodySize: 70661,
              entryType: "resource",
              fetchStart: 186.670,
              initiatorType: "css",
              name: "https://comcast.github.io/Surf-N-Perf/assets/waves.jpg",
              nextHopProtocol: "h2",
              redirectEnd: 0,
              redirectStart: 0,
              requestStart: 187.675,
              responseEnd: 252.165,
              responseStart: 244.545,
              secureConnectionStart: 0,
              startTime: 186.670,
              transferSize: 70879,
              workerStart: 0
            }]);
          });

          it('start returns the startTime attribute of the resource', function() {
            expect(SurfNPerfRT.start(name, {
              decimalPlaces: 3
            })).toEqual(186.670);
          });

          it('end returns the responseEnd attribute of the resource', function() {
            expect(SurfNPerfRT.end(name, {
              decimalPlaces: 3
            })).toEqual(252.165);
          });

          it('getFullRequestLoadTime returns the duration attribute of the resource', function() {
            expect(SurfNPerfRT.getFullRequestLoadTime(name, {
              decimalPlaces: 3
            })).toEqual(65.495);
          });

          it('getNetworkTime returns the duration between fetchStart & connectEnd for the resource', function() {
            expect(SurfNPerfRT.getNetworkTime(name, {
              decimalPlaces: 3
            })).toEqual(0.004);
          });

          it('getServerTime returns the duration between requestStart & responseEnd for the resource', function() {
            expect(SurfNPerfRT.getServerTime(name, {
              decimalPlaces: 3
            })).toEqual(64.49);
          });
        });

        describe('when the resource is not found', function() {
          beforeEach(function() {
            spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([]);
          });

          it('start returns undefined', function() {
            expect(SurfNPerfRT.start(name)).toBeUndefined();
          });

          it('end returns undefined', function() {
            expect(SurfNPerfRT.end(name)).toBeUndefined();
          });

          it('getFullRequestLoadTime returns undefined', function() {
            expect(SurfNPerfRT.getFullRequestLoadTime(name)).toBeUndefined();
          });

          it('getNetworkTime returns undefined', function() {
            expect(SurfNPerfRT.getNetworkTime(name)).toBeUndefined();
          });

          it('getServerTime returns undefined', function() {
            expect(SurfNPerfRT.getServerTime(name)).toBeUndefined();
          });
        });
      });
    });

    describe('#getBlockingTime', function() {
      // Note: Logic based on http://nicj.net/resourcetiming-in-practice/
      var name;

      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg';
        });

        it('returns null', function() {
          expect(SurfNPerfRT.getBlockingTime('http://comcast.github.io:3000', {})).toEqual(null);
        });
      });

      describe('when the browser supports the Resource Timing APIs', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg';
        });

        it('returns the "missing period" (non-zero durations) that occurs between connectEnd and requestStart (when waiting on a Keep-Alive TCP connection to reuse) when connectEnd and fetchStart are equal', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            connectEnd: 480.05,
            fetchStart: 480.05,
            requestStart: 490.06
          }]);
          expect(SurfNPerfRT.getBlockingTime(name, {
            decimalPlaces: 2
          })).toEqual(10.01);
        });

        it('returns the "missing period" (non-zero durations) that occurs between fetchStart and domainLookupStart (when waiting on things like the browser\'s cache) when connectEnd and fetchStart are not equal', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            connectEnd: 480.15,
            domainLookupStart: 480.09,
            fetchStart: 480.05,
            requestStart: 490.06
          }]);
          expect(SurfNPerfRT.getBlockingTime(name, {
            decimalPlaces: 2
          })).toEqual(0.04);
        });

        it('returns undefined if the resource is not found', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([]);
          expect(SurfNPerfRT.getBlockingTime(name)).toBeUndefined();
        });

        it('returns false if the request is a cross-origin request without a Timing-Allow-Origin HTTP response header', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            connectEnd: 0,
            domainLookupStart: 0,
            fetchStart: 0,
            requestStart: 0
          }]);
          expect(SurfNPerfRT.getBlockingTime(name)).toEqual(false);
        });
      });
    });

    describe('#getNetworkDuration', function() {
      // Note: Logic based on http://www.stevesouders.com/blog/2014/11/25/serious-confusion-with-resource-timing/
      var name;

      describe('when the browser does not support the Resource Timing API', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = false;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg';
        });

        it('returns null', function() {
          expect(SurfNPerfRT.getNetworkDuration('http://comcast.github.io:3000', {})).toEqual(null);
        });
      });

      describe('when the browser supports the Resource Timing APIs', function() {
        beforeEach(function() {
          SurfNPerfRT._resourceTiming = true;
          name = 'https://comcast.github.io/Surf-N-Perf/assets/waves.jpg';
        });

        it('returns the duration of the request minus the blocking time', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            connectEnd: 106.006,
            connectStart: 105.005,
            domainLookupEnd: 101.002,
            domainLookupStart: 100.001,
            duration: 50.000,
            entryType: "resource",
            fetchStart: 100.000,
            name: "https://comcast.github.io/Surf-N-Perf/assets/waves.jpg",
            requestStart: 111.111,
            responseEnd: 150.000,
            responseStart: 123.456,
            startTime: 100.00,
          }]);
          expect(SurfNPerfRT.getNetworkDuration(name, {
            decimalPlaces: 3
          })).toEqual(40.891);
        });

        it('returns undefined if the resource is not found', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([]);
          expect(SurfNPerfRT.getNetworkDuration(name)).toBeUndefined();
        });

        it('returns false if the request is a cross-origin request without a Timing-Allow-Origin HTTP response header', function() {
          spyOn(SurfNPerfRT._perf(), 'getEntriesByName').andReturn([{
            connectEnd: 0,
            connectStart: 0,
            domainLookupEnd: 0,
            domainLookupStart: 0,
            duration: 50.000,
            entryType: "resource",
            fetchStart: 100.000,
            name: "https://comcast.github.io/Surf-N-Perf/assets/waves.jpg",
            requestStart: 0,
            responseEnd: 150.000,
            responseStart: 0,
            startTime: 100.00,
          }]);
          expect(SurfNPerfRT.getNetworkDuration(name)).toEqual(false);
        });
      });
    });
  });
});
