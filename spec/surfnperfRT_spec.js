define('spec/surfnperfRT_spec', [
  'resource-timing'
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
        var a = SurfNPerf,
          b = SurfNPerf;
        expect(a).toBe(b);
      });
    });

    describe('#initialize', function() {

      beforeEach(function() {
        SurfNPerfRT.initialize();
      });

      it('sets the Performance API properties appropriately', function() {
        expect(SurfNPerfRT._resourceTiming).not.toBeNull();
      });

    });

    describe('#_inList', function() {
      // Minsu
    });

    describe('#_getURLOrigin', function() {
      // Ros
    });

    describe('#getOrigins', function() {
      // Minsu
      beforeEach(function() {
        SurfNPerfRT.initialize();
      });

    });

    describe('#getResourcesFromOrigin', function() {
      // Ros
      beforeEach(function() {
        SurfNPerfRT.initialize();
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
