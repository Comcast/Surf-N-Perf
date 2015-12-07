define('spec/surfnperfRT_spec', [
  'surfnperf/resource-timing'
], function(
  SurfNPerfRT
) {
  describe('SurfNPerfRT', function() {

    // var NOW_TS = 1388595600000, // Wed Jan 01 2014 12:00:00 GMT-0500 (EST)
    //   NOW_HIGH_RES = 3.1415926;

    // beforeEach(function() {
    //   if(typeof window.performance === 'undefined') {
    //     window.performance = {
    //       now: function() {
    //         return NOW_HIGH_RES;
    //       },
    //       timing: {}
    //     };
    //   }
    //   spyOn(window.performance, 'now').andReturn(NOW_HIGH_RES);
    //   spyOn(Date, 'now').andReturn(NOW_TS);
    // });

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
        expect(SurfNPerfRT.getResourcesFromOrigin("http://johnriv.github.io:3000")).toEqual(null);
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#_name', function() {
      // Minsu
    });

    describe('#getResource', function() {
      // Ros
    });

    describe('#duration', function() {
      // Minsu
    });

    describe('#start', function() {
      // Ros
    });

    describe('#end', function() {
      // Minsu
    });

    describe('#getFullRequestLoadTime', function() {
      // Ros
    });

    describe('#getNetworkTime', function() {
      // Minsu
    });

    describe('#getServerTime', function() {
      // Ros
    });

    describe('#getBlockingTime', function() {
      // Minsu
    });

  });
});
