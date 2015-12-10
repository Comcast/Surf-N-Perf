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
      describe('whitelist as a key', function() {
        options = {"whitelist" : ["A", "B", "C"]}
        it('returns true if the given origin is listed in whitelist', function() {
          expect(SurfNPerfRT._inList("A", options)).tobe(true);
        });
        it('returns false if the given origin is not listed in whitelist', function() {
          expect(SurfNPerfRT._inList("D", options)).tobe(false);
        });
      });
      describe('blackList as a key', function() {
        options = {"blacklist" : ["A", "B", "C"]}
        it('returns true if the given origin is not listed in blacklist', function() {
          expect(SurfNPerfRT._inList("D", options)).tobe(true);
        });
        it('returns false if the given origin is listed in blacklist', function() {
          expect(SurfNPerfRT._inList("A", options)).tobe(false);
        });
      });
      describe('none specific key', function() {
        options = {}
        it('returns true no matter what if options does not have any key', function() {
          expect(SurfNPerfRT._inList("A", options)).tobe(true);
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
    });

    describe('#duration', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.duration("http://johnriv.github.io:3000", "A", "B", {})).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#start', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.start(name)).toEqual(null);
        });
      });
    });

    describe('#end', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.end("http://johnriv.github.io:3000")).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#getFullRequestLoadTime', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getFullRequestLoadTime(name)).toEqual(null);
        });
      });
    });

    describe('#getNetworkTime', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getNetworkTime("http://johnriv.github.io:3000", {})).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

    describe('#getServerTime', function() {
      // Ros
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getServerTime(name)).toEqual(null);
        });
      });
    });

    describe('#getBlockingTime', function() {
      // Minsu
      describe('when the browser does not support resource timings', function() {
        SurfNPerfRT._resourceTiming = false;
        it('returns null', function() {
          expect(SurfNPerfRT.getBlockingTime("http://johnriv.github.io:3000", {})).toEqual(null);
        });
      });
      describe('when the browser supports resource timings', function() {

      });
    });

  });
});
