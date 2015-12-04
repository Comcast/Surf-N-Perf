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
        expect(SurfNPerfRT._navigationTiming).not.toBeNull();
        expect(SurfNPerfRT._highResTime).not.toBeNull();
        expect(SurfNPerfRT._userTiming).not.toBeNull();
      });

      it('ensures the SURF_N_PERF global object exists', function() {
        expect(window.SURF_N_PERF.marks).toBeDefined();
        expect(window.SURF_N_PERF.highResMarks).toBeDefined();;
      });

      it('stores the URL pathname as "initialUrl"', function() {
        expect(SurfNPerfRT.getCustom('initialUrl')).toEqual(window.location.pathname);
      });

    });

    

  });
});
