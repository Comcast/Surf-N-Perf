define('spec/surfnperfRT_spec', [
  'resource-timing'
], function(
  SurfNPerfRT
) {
  describe('SurfNPerfRT', function() {
    
    beforeEach(function() {
      SurfNPerfRT.initialize();
    });

    describe('Singleton Behavior', function() {
      it('is only instantiated once, even if the library is attempted to be instantiated more than once (as good singletons do)', function() {
        var a = SurfNPerfRT,
          b = SurfNPerfRT;
        expect(a).toBe(b);
      });
    });

    describe('#initialize', function() {

      it('sets the Performance API properties appropriately', function() {
        expect(SurfNPerfRT._resourceTiming).not.toBeNull();
      });

    });

    describe('#_inList', function() {
      // Minsu
      it('returns true if option does not have neither list keys', function() {
        options = {};
        expect(SurfNPerfRT._inList("a",options)).toEqual(true);
        expect(SurfNPerfRT._inList("d",options)).toEqual(true);
      });

      it('returns true only if option contains given origin, if the list key is whitelist', function() {
        whiteOptions = {"whitelist" : ["a", "b", "c"]};
        expect(SurfNPerfRT._inList("a",whiteOptions)).toEqual(true);
        expect(SurfNPerfRT._inList("d",whiteOptions)).toEqual(false);
      });

      it('returns true only if option does not contain given origin, if the list key is blacklist', function() {
        blackOptions = {"blackList" : ["a", "b", "c"]};
        expect(SurfNPerfRT._inList("a",blackOptions)).toEqual(false);
        expect(SurfNPerfRT._inList("d",blackOptions)).toEqual(true);
      });
    });

    describe('#_getURLOrigin', function() {
      // Ros
    });

    describe('#getOrigins', function() {
      // Minsu
      it('returns null if brower does not support resource timing', function() {

      });

      it('', function() {

      });

    });

    describe('#getResourcesFromOrigin', function() {
      // Ros
    });

    describe('#_name', function() {
      // Minsu
    });

    describe('#getResource', function() {
      // Ros
    });

    describe('#duration', function() {
      // Minsu
      it('returns null if brower does not support resource timing', function() {
        
      });

    });

    describe('#start', function() {
      // Ros
    });

    describe('#end', function() {
      // Minsu
      it('returns null if brower does not support resource timing', function() {
        
      });
    });

    describe('#getFullRequestLoadTime', function() {
      // Ros
    });

    describe('#getNetworkTime', function() {
      // Minsu
      it('returns null if brower does not support resource timing', function() {
        
      });
    });

    describe('#getServerTime', function() {
      // Ros
    });

    describe('#getBlockingTime', function() {
      // Minsu
      it('returns null if brower does not support resource timing', function() {
        
      });
    });

  });
});
