define('spec/surfnperfRT_spec', [
  'surfnperf/resource-timing'
], function(
  SurfNPerfRT
) {
  describe('SurfNPerfRT', function() {
    var NOW_TS = 1388595600000, // Wed Jan 01 2014 12:00:00 GMT-0500 (EST)
      NOW_HIGH_RES = 3.1415926;

    beforeEach(function() {
      var name = "a";
      var type = "resource"
      if(!window.performance) {
        window.performance = {
          now: function() {
            return NOW_HIGH_RES;
          },
          getEntriesByName: function(name) {},
          getEntriesByType: function(type) {},
          timing: {}
        };
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
      // Minsu
      describe('whitelist as a key', function() {
        var options = {
          "whitelist": ["A", "B", "C"]
        }
        it('returns true if the given origin is listed in whitelist', function() {
          expect(SurfNPerfRT._inList("A", options)).toEqual(true);
        });
        it('returns false if the given origin is not listed in whitelist', function() {
          expect(SurfNPerfRT._inList("D", options)).toEqual(false);
        });
      });
      describe('blackList as a key', function() {
        var options = {
          "blacklist": ["A", "B", "C"]
        }
        it('returns true if the given origin is not listed in blacklist', function() {
          expect(SurfNPerfRT._inList("D", options)).toEqual(true);
        });
        it('returns false if the given origin is listed in blacklist', function() {
          expect(SurfNPerfRT._inList("A", options)).toEqual(false);
        });
      });
      describe('none specific key', function() {
        options = {}
        it('returns true no matter what if options does not have any key', function() {
          expect(SurfNPerfRT._inList("A", options)).toBe(true);
        });
      });

    });

    describe('#_getURLOrigin', function() {
      describe('when the provided URL has no port', function() {
        it('returns the origin', function() {
          expect(SurfNPerfRT._getURLOrigin("http://johnriv.github.io/Surf-N-Perf/")).toEqual("http://johnriv.github.io");
        });
      });
      describe('when the provided URL has a port', function() {
        it('returns the origin', function() {
          expect(SurfNPerfRT._getURLOrigin("http://johnriv.github.io:3000/Surf-N-Perf/")).toEqual("http://johnriv.github.io:3000");
        });
      });
    });

    describe('#getOrigins', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getOrigins()).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        describe('when no option is given', function() {
          it('returns list of all the origins', function() {
            SurfNPerfRT._resourceTiming = true;
            spyOn(window.performance, "getEntriesByType").andReturn([{
              name: "http://minsu.com/hi"
            }, {
              name: "http://ros.com/hi"
            }, {
              name: "http://john.com/hi"
            }]);
            expect(SurfNPerfRT.getOrigins()).toEqual(["http://minsu.com", "http://ros.com", "http://john.com"]);
          });
        });
        describe('when option with whitelist is given', function() {
          it('returns list of the origins included in the whitelist', function() {
            SurfNPerfRT._resourceTiming = true;
            spyOn(window.performance, "getEntriesByType").andReturn([{
              name: "http://minsu.com/hi"
            }, {
              name: "http://ros.com/hi"
            }, {
              name: "http://john.com/hi"
            }]);
            expect(SurfNPerfRT.getOrigins({
              "whitelist": ["http://minsu.com", "http://ros.com"]
            })).toEqual(["http://minsu.com", "http://ros.com"]);
          });
        });
        describe('when option with blacklist is given', function() {
          it('returns list of the origins not included in the blacklist', function() {
            SurfNPerfRT._resourceTiming = true;
            spyOn(window.performance, "getEntriesByType").andReturn([{
              name: "http://minsu.com/hi"
            }, {
              name: "http://ros.com/hi"
            }, {
              name: "http://john.com/hi"
            }]);
            expect(SurfNPerfRT.getOrigins({
              "blacklist": ["http://minsu.com", "http://ros.com"]
            })).toEqual(["http://john.com"]);
          });
        });
      });
    });

    describe('#getResourcesFromOrigin', function() {
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getResourcesFromOrigin("http://johnriv.github.io:3000")).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        describe('and none of the resources are from the origin in the parameter', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, "getEntriesByType").andReturn([{
            name: "http://minsu.com/hi"
          }, {
            name: "http://ros.com/hi"
          }, {
            name: "http://john.com/hi"
          }]);
          it('returns a list of the resources from the specified origin', function() {

          });
        });
        describe('and there are resources from the origin in the parameter', function() {

        });
      });
    });

    describe('#_name', function() {
      // Minsu
      describe('when name argument is a full request', function() {
        it('returns name as it is', function() {
          expect(SurfNPerfRT._name("A")).toEqual("A");
        });
      });
      describe('when name argument is not a full request', function() {
        // spyOn(window.location, "protocol").andReturn("http://");
        // it("returns a full request version by using the page's current origin", function() {
        //   expect(SurfNPerfRT._name("/A")).toEqual("http://github.com/A");
        // })
      });
    });

    describe('#getResource', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getResource(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#duration', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.duration(name, "A", "B", {})).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        it('returns the diff between 2 resource timing marks', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            eventA: 480.04,
            eventB: 490.05
          }]);
          expect(SurfNPerfRT.duration(name, "eventA", "eventB", {
            "decimalPlaces": 2
          })).toEqual(10.01);
        });
        it('returns false if eventA is 0', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            eventA: 0,
            eventB: 0,
            eventC: 10
          }]);
          expect(SurfNPerfRT.duration(name, "eventA", "eventC")).toEqual(false);
        });
        it('returns false if eventB is 0', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            eventA: 0,
            eventB: 0,
            eventC: 10
          }]);
          expect(SurfNPerfRT.duration(name, "eventC", "eventB")).toEqual(false);
        });
        it('returns false if both events are 0', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            eventA: 0,
            eventB: 0,
            eventC: 10
          }]);
          expect(SurfNPerfRT.duration(name, "eventA", "eventB")).toEqual(false);
        });
        it('returns the diff between 2 resource timing marks, rounded when optional 4th param decimalPlaces included', function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            eventA: 480.04,
            eventB: 490.05
          }]);
          expect(SurfNPerfRT.duration(name, "eventA", "eventB", {
            "decimalPlaces": 1
          })).toEqual(10.0);
          expect(SurfNPerfRT.duration(name, "eventA", "eventB", {
            "decimalPlaces": 2
          })).toEqual(10.01);
        });
      });
    });

    describe('#start', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.start(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        it("returns the start time of the resource", function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            startTime: 487.05
          }]);
          expect(SurfNPerfRT.start(name, {
            decimalPlaces: 2
          })).toEqual(487.05);
        });
      });
    });

    describe('#end', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.end("http://johnriv.github.io:3000")).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        it("returns the end time of the resource response", function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            responseEnd: 487.05
          }]);
          expect(SurfNPerfRT.end(name, {
            decimalPlaces: 2
          })).toEqual(487.05);
        });
      });
    });

    describe('#getFullRequestLoadTime', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getFullRequestLoadTime(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        it("returns the duration of the resource load time", function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            duration: 487.05
          }]);
          expect(SurfNPerfRT.getFullRequestLoadTime(name, {
            decimalPlaces: 2
          })).toEqual(487.05);
        });

      });
    });

    describe('#getNetworkTime', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getNetworkTime("http://johnriv.github.io:3000", {})).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        it("returns the network time while loading the resource", function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            fetchStart: 480.05,
            connectEnd: 490.05
          }]);
          expect(SurfNPerfRT.getNetworkTime(name)).toEqual(10.0);
        });
      });
    });

    describe('#getServerTime', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getServerTime(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        it("returns the server time while loading the resource", function() {
          SurfNPerfRT._resourceTiming = true;
          spyOn(window.performance, 'getEntriesByName').andReturn([{
            requestStart: 480.05,
            responseEnd: 490.05
          }]);
          expect(SurfNPerfRT.getServerTime(name)).toEqual(10.0);
        });
      });
    });

    describe('#getBlockingTime', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        it('returns null', function() {
          SurfNPerfRT._resourceTiming = false;
          expect(SurfNPerfRT.getBlockingTime("http://johnriv.github.io:3000", {})).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        SurfNPerfRT._resourceTiming = true;
      });
    });

  });
});
