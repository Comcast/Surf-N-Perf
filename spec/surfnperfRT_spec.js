define('spec/surfnperfRT_spec', [
  'surfnperfRT'
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
      
    });

    describe('#_getURLOrigin', function() {

    });

    describe('#getOrigins', function() {

    });

    describe('#getResourcesFromOrigin', function() {

    });

    describe('#_name', function() {

    });

    describe('#getResource', function() {

    });

    describe('#duration', function() {

    });

    describe('#start', function() {

    });

    describe('#end', function() {

    });

    describe('#getFullRequestLoadTime', function() {

    });

    describe('#getNetworkTime', function() {

    });

    describe('#getServerTime', function() {

    });

    describe('#getBlockingTime', function() {

    });

  });
});
