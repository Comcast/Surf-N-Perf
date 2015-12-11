define('spec/surfnperfRT_spec', [
  'surfnperf/resource-timing'
], function(
  SurfNPerfRT
) {
  describe('SurfNPerfRT', function() {

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
      beforeEach(function() {
        SurfNPerfRT.initialize();
      });

    });

    describe('#getResourcesFromOrigin', function() {
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getResourcesFromOrigin("http://johnriv.github.io:3000")).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#_name', function() {
      // Minsu
    });

    describe('#getResource', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getResource(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#duration', function() {
      // Minsu
    });

    describe('#start', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.start(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {
        beforeEach(function() {
          var name = "a";
          spyOn(window.performance, "getEntriesByName").andReturn({
            startTime: 487.05
          });
        });
        it("returns the start time of the resource", function() {
          expect(SurfNPerfRT.start(name)).toEqual(487.05);
        });
      });
    });

    describe('#end', function() {
      // Minsu
    });

    describe('#getFullRequestLoadTime', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getFullRequestLoadTime(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#getNetworkTime', function() {
      // Minsu
    });

    describe('#getServerTime', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getServerTime(name)).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#getBlockingTime', function() {
      // Minsu
    });

  });
});
